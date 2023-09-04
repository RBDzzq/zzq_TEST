/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 */

define([
    "N/record",
    "N/runtime",
    "N/format",
    "N/search",
    "N/task",
    "../../datastore/JP_Scripts",
    "../../data/JP_InvoiceSummaryBatchDAO",
    "../../data/JP_InvoiceSummaryRequestDAO"
],
(
    record,
    runtime,
    format,
    search,
    task,
    JP_Scripts,
    BatchDAO,
    RecordRequestDAO
) =>{

    // BATCH RECORD
    let batchDAO = new BatchDAO();
    let BATCH_MANAGER_MR_PARAMS = "custscript_jpn_loc_batch_mr_params";

    function getInputData() {
        let params = JSON.parse(runtime.getCurrentScript().getParameter({ name: BATCH_MANAGER_MR_PARAMS }));
        let batchParameters = params.batchParams;

        if(batchParameters.individualPDF === "T") {
            return createBatchParamsArray(batchParameters);
        } else {
            return [batchParameters];
        }
    }

    function map(context) {
        let passedParams = JSON.parse(context.value);

        if(passedParams.individualPDF === "T") {
            let generationParams = passedParams.generationParams;
            let batchEntity = generationParams.forGeneration[0] ? generationParams.forGeneration[0].entity : '';
            let existingBatch = batchDAO.checkIfPendingBatchExists(passedParams, batchEntity);
            if (!existingBatch) {
                createBatchRecord(passedParams);
            } else if (existingBatch.id && existingBatch.status != batchDAO.status.PROCESSED) {
                updateAndRetriggerBatch(passedParams, existingBatch.id);
            } else {
                // Do nothing when batch is already processed
            }
        } else {
            let errorBatch = batchDAO.getErroredBatch(passedParams);
            if(!errorBatch.id) {
                createBatchRecord(passedParams);
            } else {
                updateAndRetriggerBatch(passedParams, errorBatch.id);
            }
        }
    }

    function summarize(summary){
        let params = '';

        try{
            let rawParams = runtime.getCurrentScript().getParameter({ name: BATCH_MANAGER_MR_PARAMS });
            log.debug("JP_BatchManagerMapReduce Summarize", "raw parameters: " + rawParams);
            params = JSON.parse(rawParams);

            let ssTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
            ssTask.scriptId = JP_Scripts.MR_SCHEDULER_SS_SCRIPT;
            ssTask.deploymentId = JP_Scripts.MR_SCHEDULER_SS_DEPLOYMENT;
            ssTask.submit();
        }
        catch(err){
            let reqRecDao = new RecordRequestDAO();

            //means that the error is in the parsing of params then we cannot get the request id
            //we query instead the request record whose status is queued.
            if(!params || params.requestId){
                let queuedReq = reqRecDao.getQueuedRequests();
                if(queuedReq && queuedReq[0]){
                    params.requestId = queuedReq[0];
                }
            }

            if(params.requestId) {
                reqRecDao.getChildBatches(params.requestId);
                let errorBatch;

                //get the first queued and mark it as error.
                for (let y = 0; y < reqRecDao.batchData.length; y++) {
                    if (reqRecDao.batchData[y] === batchDAO.status.QUEUED) {
                        errorBatch = reqRecDao.batchData[y];
                        break;
                    }
                }

                let errorDetails = err.name + " : " + err.message;
                reqRecDao.updateError({
                    batchId: errorBatch.id,
                    requestId: params.requestId,
                    status: batchDAO.status.ERROR,
                    errorFlag: true,
                    errorDetail: errorDetails
                });
            }
            log.error("BATCH_MANAGER_MR_SCRIPT",
                ['Stage: Summarize | Batch: ', errorBatch.id, ' | Details: ', errorDetails].join(''));
        }
    }

    function updateAndRetriggerBatch(params, batchId) {
        let batchLookup = search.lookupFields({
            type: batchDAO.recordType,
            id: batchId,
            columns: [batchDAO.fields.status]
        });
        let batchStatus = batchLookup[batchDAO.fields.status][0].value;

        record.submitFields({
            type: batchDAO.recordType,
        	id: batchId,
        	values: {
                // retrigger only if status is ERROR
                "custrecord_suitel10n_jp_ids_gen_b_triggr": batchStatus.toString() === batchDAO.status.QUEUED,
                "custrecord_suitel10n_jp_ids_gen_b_stat": batchDAO.status.QUEUED,
                "custrecord_suitel10n_jp_ids_su_params": JSON.stringify(params.generationParams),
                "custrecord_suitel10n_jp_ids_su_sd": params.statementDate
            }
        });
    }

    function createBatchParamsArray(params) {
        let baseTxnArray = params.generationParams.forGeneration;
        let txnMapping = getCustomerTransactionMapping(baseTxnArray);

        log.debug({ title: "customers", details: Object.keys(txnMapping) });

        let batchParamsArray = [];
        for (let entity in txnMapping) {
            let batchParam = {
                "closingDate": params.closingDate,
                "subsidiary": params.subsidiary,
                "customer": params.customer,
                "customerSavedSearch": params.customerSavedSearch,
                "overdue": params.overdue,
                "noTransaction": params.noTransaction,
                "generationParams": {
                    "forGeneration": txnMapping[entity],
                    "template": params.generationParams.template,
                    "subsidiary": params.subsidiary
                },
                "statementDate": params.statementDate,
                "requestId": params.requestId,
                "individualPDF": params.individualPDF,
                "hierarchyId": params.hierarchyId
            };
            batchParamsArray.push(batchParam);
        }

        return batchParamsArray;
    }

    function getCustomerTransactionMapping(txnArray) {
        let mapping = {};
        for (let i = 0; i < txnArray.length; i++) {
            let txnObj = txnArray[i];
            if(mapping[txnObj.entity]) {
                mapping[txnObj.entity].push(txnObj);
            } else {
                mapping[txnObj.entity] = [txnObj];
            }
        }

        return mapping;
    }

    function createBatchRecord(params) {
        let batchRecord = record.create({
            type: batchDAO.recordType
        });

        let fields = batchDAO.fields;

        batchRecord.setValue({fieldId: fields.customerFilter, value: params.customer});
        batchRecord.setValue({fieldId: fields.customerSavedSearch, value: params.customerSavedSearch});
        batchRecord.setValue({fieldId: fields.closingDate,
            value: format.parse({value: params.closingDate, type: format.Type.DATE}) });
        batchRecord.setValue({fieldId: fields.statementDate,
            value: format.parse({value: params.statementDate, type: format.Type.DATE}) });
        batchRecord.setValue({fieldId: fields.overdueFilter, value: (params.overdue === "T")});
        batchRecord.setValue({fieldId: fields.includeNoTransaction, value: (params.noTransaction === "T")});
        batchRecord.setValue({fieldId: fields.status, value: batchDAO.status.QUEUED});
        batchRecord.setValue({fieldId: fields.subsidiary, value: params.subsidiary});
        batchRecord.setValue({fieldId: fields.generationParams, value: JSON.stringify(params.generationParams)});
        batchRecord.setValue({fieldId: fields.parentRequest, value: params.requestId});
        batchRecord.setValue({fieldId: fields.hierarchyId, value: params.hierarchyId});
        batchRecord.save();
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
});
