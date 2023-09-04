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
        "N/runtime",
        "N/record",
        "N/error",
        "N/file",
        "N/task",
        "N/search",
        "N/format",
        "../../app/JP_InvoiceSummaryPDFCreator",
        "../../app/JP_InvoiceSummaryFilePrinter",
        "../../app/JP_ErrorNotifier",
        "../../lib/JP_TCTranslator",
        "../../lib/JP_SearchIterator",
        "../../data/JP_InvoiceSummaryBatchDAO",
        "../../data/JP_InvoiceSummaryRequestDAO",
        "../../datastore/JP_ListStore",
        "../../datastore/JP_Scripts",
        "../../datastore/JP_RecordTypes"
    ],

    (
        runtime,
        record,
        error,
        file,
        task,
        search,
        format,
        InvoiceSummaryPDFCreator,
        InvoiceSummaryFilePrinter,
        ErrorNotifier,
        Translator,
        SearchIterator,
        ISBatchDAO,
        ISReqDAO,
        ListStore,
        JPScripts,
        JPTypes
        ) =>{
        let PDF_GENERATION_JSON_PARAMS = 'custscript_japan_loc_pdf_gen_param';
        let PDF_GENERATION_ERROR = "INVOICE_SUMMARY_PDF_GENERATION_ERROR";
        let EMPTY_BATCH_PARAMS_ERROR = "EMPTY_BATCH_PARAMS_ERROR";

        // Errors
        let EMPTY_BATCH_PARAMS_ERR_MSG = 'IDS_GEN_EMPTY_BATCH_PARAMS_ERROR_MESSAGE';

        function getInputData() {

            let params = {};
            let ids = [];
            let status = new ListStore().BATCH_STATUS;

            try{
                let mrParams = runtime.getCurrentScript().getParameter({name:PDF_GENERATION_JSON_PARAMS});
                log.debug("PDF Generator MR Params", mrParams);
                params = JSON.parse(mrParams);
                ids = params.ids;

                if(ids.length === 0){
                    let strings = new Translator().getTexts([EMPTY_BATCH_PARAMS_ERR_MSG])
                    record.submitFields({
                        type: JPTypes.BATCH_RECORD,
                        id: params.batchId,
                        values : {
                            "custrecord_suitel10n_jp_ids_gen_b_stat" : status.INVALID,
                            "custrecord_suitel10n_jp_ids_task_id" : "",
                            "custrecord_suitel10n_jp_ids_errorflag" : false,
                            'custrecord_suitel10n_jp_ids_err_detail' : EMPTY_BATCH_PARAMS_ERROR + ": " +
                                strings[EMPTY_BATCH_PARAMS_ERR_MSG]
                        }
                    });

                    record.submitFields({
                        type: JPTypes.REQUEST_RECORD,
                        id: params.parent,
                        values : {
                            "custrecord_jp_loc_gen_req_status" : status.INVALID,
                            "custrecord_jp_loc_gen_req_err_flag" : false,
                            'custrecord_jp_loc_gen_req_err_detail' : EMPTY_BATCH_PARAMS_ERROR + ": "
                                + strings[EMPTY_BATCH_PARAMS_ERR_MSG]
                        }
                    });

                    throw error.create({name:EMPTY_BATCH_PARAMS_ERROR, message:EMPTY_BATCH_PARAMS_ERROR});
                }

            }
            catch(e){
                log.error(PDF_GENERATION_ERROR, ['MR STAGE: getInputData | BATCH: ',
                    params.batchId ? params.batchId : 'N/A', ' | DETAILS: ', e.name, ':', e.message].join(""));
                throw e;
            }
            return ids;
        }

        function map(context) {

            let params = {};

            try{
                let id = context.value;
                params = JSON.parse(runtime.getCurrentScript().getParameter({name:PDF_GENERATION_JSON_PARAMS}));

                let templateId = parseInt(params.template);
                let printer = new InvoiceSummaryFilePrinter();
                let renderedContent = printer.generateInvoiceSummaryText(id, templateId);
                log.debug("Summary ID: "+id+" | Number of Characters: "+renderedContent.length);

                let arr = (renderedContent.match(/(.|[\r\n]){1,10000}/g));

                for (let j = 0; j < arr.length; j++) {
                    context.write("IS", {id: id, seq: j, renderedContent: arr[j]});
                }
            }
            catch (e) {
                log.error(PDF_GENERATION_ERROR, ['MR STAGE: map | BATCH: ',
                    params.batchId ? params.batchId : 'N/A', ' | DETAILS: ', e.name , ':', e.message].join(""));
                throw e;
            }
        }

        function reduce(context) {

            let params = '';
            let status = new ListStore().BATCH_STATUS;

            try{
                params = JSON.parse(runtime.getCurrentScript().getParameter({name:PDF_GENERATION_JSON_PARAMS}));
                let template = parseInt(params.template);
                let parsedContextValues = parseReduceContextValues(context.values);

                let pdfCreator = new InvoiceSummaryPDFCreator();
                let pdfFileId = pdfCreator.generateDocument(template, parsedContextValues, false);
                let pdfFile = file.load({id: pdfFileId});

                context.write({
                    key: pdfFile.url,
                    value: pdfFile.name
                });

                record.submitFields({
                    type: JPTypes.BATCH_RECORD,
                    id: params.batchId,
                    values : {
                        "custrecord_suitel10n_jp_ids_doc" : pdfFileId,
                        "custrecord_suitel10n_jp_ids_gen_b_stat" : status.PROCESSED,
                        "custrecord_suitel10n_jp_ids_errorflag": false,
                        "custrecord_suitel10n_jp_ids_task_id": "",
                        "custrecord_suitel10n_jp_ids_err_detail": ""
                    }
                });

                let requestHasPendingBatches = new ISBatchDAO().requestHasPendingBatches(params.parent);

                if(!requestHasPendingBatches){
                    record.submitFields({
                        type: JPTypes.REQUEST_RECORD,
                        id: params.parent,
                        values : {
                            "custrecord_jp_loc_gen_req_status": status.PROCESSED,
                            "custrecord_jp_loc_gen_req_err_flag": false,
                            "custrecord_jp_loc_gen_req_err_detail": ""
                        }
                    });
                }

            }
            catch (e) {
                log.error(PDF_GENERATION_ERROR, ['MR STAGE: reduce | BATCH: ',
                    params.batchId ? params.batchId : 'N/A', ' | DETAILS: ', e.name, ':', e.message].join(""));
                throw e;
            }
        }

        function summarize(summary) {

            let params = '';

            try {
                params = JSON.parse(runtime.getCurrentScript().getParameter({name:PDF_GENERATION_JSON_PARAMS}));

                let inputError = summary.inputSummary.error;
                if(inputError){
                    let inputErrorParsed = JSON.parse(inputError);
                    if(inputErrorParsed.name === EMPTY_BATCH_PARAMS_ERROR){
                        let strings = new Translator().getTexts([EMPTY_BATCH_PARAMS_ERR_MSG], true);
                        let warningMessage = strings[EMPTY_BATCH_PARAMS_ERR_MSG];

                        let errorObj = {
                            name : EMPTY_BATCH_PARAMS_ERROR,
                            details : warningMessage,
                            nsCode : inputErrorParsed.name
                        };

                        let request = getEquivalentRequest(params.batchId);

                        let isReqDao = new ISReqDAO();
                        isReqDao.getGenerationStat(request.id, request.subsidiary);

                        let errorNotifier = new ErrorNotifier('WARNING');
                        errorNotifier.notifyCreator(request.record, errorObj, request.owner,  isReqDao.generationStat);
                    }
                    else {
                        throw inputErrorParsed;
                    }
                }

                //TODO: Extend to consolidated error reporting
                let mapSummary = summary.mapSummary;
                mapSummary.errors.iterator().each((index,err)=>{
                    throw JSON.parse(err);
                    //do not return true to throw on first error
                });

                //TODO: Extend to consolidated error reporting
                let reduceSummary = summary.reduceSummary;
                reduceSummary.errors.iterator().each((index,err)=>{
                    throw JSON.parse(err);
                    //do not return true to throw on first error
                });

                let fileAttributes = {};
                summary.output.iterator().each((filelink, filename) =>{
                    fileAttributes['filelink'] = filelink;
                    fileAttributes['filename'] = filename;
                    return true;
                });

                log.debug("fileAttributes", JSON.stringify(fileAttributes));
                if(fileAttributes.hasOwnProperty('filelink')){
                    let ssTask = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT
                    });
                    ssTask.scriptId = JPScripts.MR_SCHEDULER_SS_SCRIPT;
                    ssTask.deploymentId = JPScripts.MR_SCHEDULER_SS_DEPLOYMENT;
                    ssTask.submit();
                }
            }
            catch(e){
                if(params.batchId){
                    let status = new ListStore().BATCH_STATUS;
                    let errName = e.name.replace(/\"/g,'');
                    let errMessage = e.message.replace(/\"/g,'');

                    let isReqDao = new ISReqDAO();
                    isReqDao.updateError({
                        batchId : params.batchId,
                        requestId : params.parent,
                        status : status.ERROR,
                        errorFlag : true,
                        errorDetail : PDF_GENERATION_ERROR + ': ' + errName + ": " + errMessage
                    });

                    log.error(PDF_GENERATION_ERROR, ['Stage: Summarize | Batch: ',
                        params.batchId , ' | Details: ', errName, ': ', errMessage].join(''));
                }
                else{
                    log.error(e.name,e.message);
                }
            }
        }

        function parseReduceContextValues(contextValue) {
            let summaries = {};
            let parsedContent = [];

            for (let i = 0; i < contextValue.length; i++) {
                let content = JSON.parse(contextValue[i]);

                if (!summaries[content.id]) {
                    summaries[content.id] = {};
                }

                summaries[content.id][(content.seq).toString()] = content.renderedContent;
            }

            /* Per invoice summary, keyed by internal ID */
            for (let id in summaries) {
                let renderedContent = "";
                let summaryContent = summaries[id];

                let contentCount = Object.keys(summaryContent).length;

                /* Merging the html content according to sequence */
                for (let cc = 0; cc < contentCount; cc++) {
                    renderedContent = renderedContent + summaryContent[cc.toString()];
                }

                parsedContent.push({id: id, renderedContent: renderedContent});
            }

            return parsedContent;

        }

        function getEquivalentRequest(batchId){

            // use lookupFields instead of record.load to prevent UE from running
            let batchRecord = search.lookupFields({
                type : 'customrecord_suitel10n_jp_ids_gen_batch',
                id: batchId,
                columns: [
                    'custrecord_suitel10n_jp_ids_su_sub',
                    'custrecord_suitel10n_jp_ids_su_cd',
                    'custrecord_suitel10n_jp_ids_su_cust',
                    'custrecord_suitel10n_jp_ids_su_overdue',
                    'custrecord_suitel10n_jp_ids_su_sd',
                    'custrecord_suitel10n_jp_ids_su_params',
                    'custrecord_suitel10n_jp_ids_su_no_trans',
                    'custrecord_japan_loc_cust_savedsearch',
                    'custrecord_suitel10n_jp_ids_err_detail',
                    'custrecord_japan_loc_parent_request',
                    'owner'
                ]
            });

            //existing batch should always have a parent and owner
            let parentRequest = batchRecord['custrecord_japan_loc_parent_request'][0].value;
            let requestOwner = batchRecord['owner'][0].value;

            // create dummy request record to hold counterpart batch data
            let requestRecord = record.create({
                type: 'customrecord_jp_loc_gen_request',
                isDynamic: true
            });

            let sub = batchRecord['custrecord_suitel10n_jp_ids_su_sub'][0] ?
                batchRecord['custrecord_suitel10n_jp_ids_su_sub'][0].value : '';
            let cd = batchRecord['custrecord_suitel10n_jp_ids_su_cd'] ? format.parse(
                {value:batchRecord['custrecord_suitel10n_jp_ids_su_cd'],type:format.Type.DATE}) : '';
            let cust = batchRecord['custrecord_suitel10n_jp_ids_su_cust'][0] ?
                batchRecord['custrecord_suitel10n_jp_ids_su_cust'][0].value : '';
            let sd = batchRecord['custrecord_suitel10n_jp_ids_su_sd'] ? format.parse(
                {value:batchRecord['custrecord_suitel10n_jp_ids_su_sd'],type:format.Type.DATE}) : '';
            let savedsearch = batchRecord['custrecord_japan_loc_cust_savedsearch'][0] ?
                batchRecord['custrecord_japan_loc_cust_savedsearch'][0].value : '';

            requestRecord.setValue({fieldId:'custrecord_jp_loc_gen_req_sub', value:sub});
            requestRecord.setValue({fieldId:'custrecord_jp_loc_gen_req_cd', value:cd});
            requestRecord.setValue({fieldId:'custrecord_jp_loc_gen_req_cust', value:cust});
            requestRecord.setValue({fieldId:'custrecord_jp_loc_gen_req_overdue',
                value:batchRecord['custrecord_suitel10n_jp_ids_su_overdue']});
            requestRecord.setValue({fieldId:'custrecord_jp_loc_gen_req_sd', value:sd});
            requestRecord.setValue({fieldId:'custrecord_jp_loc_gen_req_params',
                value:batchRecord['custrecord_suitel10n_jp_ids_su_params']});
            requestRecord.setValue({fieldId:'custrecord_jp_loc_gen_req_no_trans',
                value:batchRecord['custrecord_suitel10n_jp_ids_su_no_trans']});
            requestRecord.setValue({fieldId:'custrecord_jp_loc_gen_req_savedsearch',
                value:savedsearch});
            requestRecord.setValue({fieldId:'custrecord_jp_loc_gen_req_err_detail',
                value:batchRecord['custrecord_suitel10n_jp_ids_err_detail']});

            return {
                record: requestRecord,
                owner: requestOwner,
                id: parentRequest,
                subsidiary: sub
            }
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });
