/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 */

define([
    'N/record',
    'N/format',
    'N/search',
    'N/runtime',
    'N/task',
    'N/error',
    'N/url'
],

(record,
         format,
         search,
         runtime,
         task,
         error,
         url) =>{

    let BATCH_RECORD_TYPE = 'customrecord_suitel10n_jp_ids_gen_batch';
    let REQUEST_RECORD_TYPE = "customrecord_jp_loc_gen_request";
    let BATCH_GENERATION_PARAMS = 'custrecord_suitel10n_jp_ids_su_params';
    let ERROR_STATUS = '1';
    let TRUE = 'T';

    let PDF_GENERATION_MR_SCRIPT = 'customscript_japan_loc_pdf_gen_mr';
    let PDF_GENERATION_MR_SCRIPT_DEPLOYMENT = 'customdeploy_japan_loc_pdf_gen_mr';

    let IS_TO_TXN_ATTACH_MR_JSON_PARAMS = 'custscript_japan_loc_mr_idsattacher_json';

    let UPDATE_RELATED_IDS_TRANSACTIONS_ERROR = 'UPDATE_RELATED_IDS_TRANSACTIONS_ERROR';

    function getInputData() {

        let params = '';

        try{

            //Get passed parameters
            params = JSON.parse(runtime.getCurrentScript().getParameter({name:IS_TO_TXN_ATTACH_MR_JSON_PARAMS}));

            let entityInvoiceSummaryMapping = params.entityInvoiceSummaryMapping;

            //Lookup batch generation params
            let batchLookup = search.lookupFields({
               type : BATCH_RECORD_TYPE,
               id : params.batchId,
               columns : BATCH_GENERATION_PARAMS
            });
            let generationParams = JSON.parse(batchLookup.custrecord_suitel10n_jp_ids_su_params);
            let txnObjArr = generationParams.forGeneration;

            //Create object containing transaction and invoice summary
            let txnArr = [];
            for (let i in txnObjArr) {
                if(txnObjArr[i].id){
                    txnArr.push({
                        transaction : txnObjArr[i].id,
                        invoiceSummary : entityInvoiceSummaryMapping[txnObjArr[i].entity]
                    });
                }
            }

            return txnArr;

        } catch(e){
            throw e.name + ' ' + e.message;
        }
    }

    function map(context) {

        let params = '';
        let result = '';
        let txnType = '';

        try{

            //Get passed parameters
            params = JSON.parse(runtime.getCurrentScript().getParameter({name:IS_TO_TXN_ATTACH_MR_JSON_PARAMS}));

            result = JSON.parse(context.value);

            //Lookup transaction type and current invoice summary
            let txnLookup = search.lookupFields({
                type: search.Type.TRANSACTION,
                id: result.transaction,
                columns: ['recordtype','custbody_suitel10n_jp_ids_rec']
            });
            txnType = txnLookup.recordtype
            let existingInvoiceSummaryNumber = txnLookup.custbody_suitel10n_jp_ids_rec[0].value;

            //Update mapping if no invoice summary exists
            if(!existingInvoiceSummaryNumber){
                record.submitFields({
                    type: txnType,
                    id: result.transaction,
                    values : {
                        'custbody_suitel10n_jp_ids_rec' : result.invoiceSummary
                    }
                });
            }

        } catch (e) {

            if(params.batchId && txnType && result.transaction){

                let scheme = 'https://';
                let domain = url.resolveDomain({hostType: url.HostType.APPLICATION});
                let relativePath = url.resolveRecord({
                    recordType: txnType,
                    recordId: result.transaction,
                    isEditMode: false
                });
                let txnURL = scheme + domain + relativePath;
                let txnLink = ' (ID: <a href='+txnURL+'>'+result.transaction+'</a>)';

                let err = error.create({
                    name : e.name,
                    message : e.message + txnLink,
                    notifyOff:true
                });

                log.error("IDS Generation Error", ["Batch: ", params.batchId ,
                    " " + txnType + ": ", result.transaction," Details: ", e.name, ": ", e.message].join(""));
                throw err;

            } else {
                log.error(e.name, e.message);
                throw e;
            }
        }
    }

    function summarize(summary) {

        let params = '';

        try{

            //Get passed parameters
            params = JSON.parse(runtime.getCurrentScript().getParameter({name:IS_TO_TXN_ATTACH_MR_JSON_PARAMS}));

            let inputError = summary.inputSummary.error
            if(inputError){
                throw JSON.parse(inputError);
            }

            //TODO: Extend to consolidated error reporting
            let mapSummary = summary.mapSummary;
            mapSummary.errors.iterator().each((index,err)=>{
                throw JSON.parse(err);
                //do not return true to throw on first error
            });

            let entityInvoiceSummaryMapping = params.entityInvoiceSummaryMapping;
            let entities = Object.keys(entityInvoiceSummaryMapping);

            //Get all Invoice Summaries under the batch
            let invoiceSummaries = [];
            for(let i in entities){
                invoiceSummaries.push(entityInvoiceSummaryMapping[entities[i]]);
            }

            //Lookup batch status
            let batchLookup = search.lookupFields({
                type: BATCH_RECORD_TYPE,
                id: params.batchId,
                columns: 'custrecord_suitel10n_jp_ids_gen_b_stat'
            });

            //Execute PDF Generation, Attachment and SS Re-submission for non-ERROR batch
            if(batchLookup.custrecord_suitel10n_jp_ids_gen_b_stat[0].value !== ERROR_STATUS){
                let pdfGenerationParams = {
                    batchId : params.batchId,
                    template : params.template,
                    ids : invoiceSummaries,
                    parent: params.parent
                };

                let ssTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE
                });
                ssTask.scriptId = PDF_GENERATION_MR_SCRIPT;
                ssTask.deploymentId = PDF_GENERATION_MR_SCRIPT_DEPLOYMENT;
                ssTask.params = {'custscript_japan_loc_pdf_gen_param':pdfGenerationParams};
                let taskId = ssTask.submit();

                record.submitFields({
                    type : BATCH_RECORD_TYPE,
                    id : params.batchId,
                    values : {
                        'custrecord_suitel10n_jp_ids_task_id' : taskId
                    }
                });

            }

        }catch(e){

            if(params.batchId){
                let errName = e.name.replace(/\"/g,'');
                let errMessage = e.message.replace(/\"/g,'');

                //Update batch status to ERROR
                record.submitFields({
                    type : BATCH_RECORD_TYPE,
                    id : params.batchId,
                    values : {
                        'custrecord_suitel10n_jp_ids_gen_b_stat' : ERROR_STATUS,
                        'custrecord_suitel10n_jp_ids_errorflag' : TRUE,
                        'custrecord_suitel10n_jp_ids_err_detail' : UPDATE_RELATED_IDS_TRANSACTIONS_ERROR + ': '
                            + errName + ": " + errMessage
                    }
                });

                record.submitFields({
                    type : REQUEST_RECORD_TYPE,
                    id : params.parent,
                    values : {
                        'custrecord_jp_loc_gen_req_status' : ERROR_STATUS,
                        'custrecord_jp_loc_gen_req_err_flag' : TRUE,
                        'custrecord_jp_loc_gen_req_err_detail' : UPDATE_RELATED_IDS_TRANSACTIONS_ERROR + ': '
                            + errName + ": " + errMessage
                    }
                });

                log.error("IDS Generation Error", ["Batch: ", params.batchId ,
                    " Details: ", errName, ": ", errMessage].join(""));
            }
            else{
                log.error(e.name,e.message);
            }
        }
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };

});
