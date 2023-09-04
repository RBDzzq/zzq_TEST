/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

define([
        'N/task',
        'N/runtime',
        'N/search',
        'N/record',
        'N/format',
        '../../lib/JP_SearchIterator',
        '../../datastore/JP_Scripts'
    ],

    (task, runtime, search, record, format,
             JP_SearchIterator, JP_Scripts) =>{

        let ERROR_STATUS = '1';
        let INVALID_STATUS = '4';
        let TRUE = 'T';

        // Invoice Summary Creation MR
        let GEN_INV_SUM_MR_SCRIPT = 'customscript_japan_loc_gen_invoice_sum';
        let GEN_INV_SUM_MR_DEPLOYMENT = 'customdeploy_japan_loc_gen_invoice_sum';

        // Generation Batch
        let BATCH_RECORD_TYPE = 'customrecord_suitel10n_jp_ids_gen_batch';
        let REQUEST_RECORD_TYPE = "customrecord_jp_loc_gen_request";
        let GENERATION_PARAMS = 'custrecord_suitel10n_jp_ids_su_params';
        let TASK_ID = 'custrecord_suitel10n_jp_ids_task_id';
        let PARENT_REQUEST = 'custrecord_japan_loc_parent_request';
        let BATCH_STATUS = 'custrecord_suitel10n_jp_ids_gen_b_stat';

        // Saved Searches
        let QUEUED_SAVED_SEARCH = 'customsearch_suitel10n_jp_ids_batch_qd';

        function execute(context) {

            let batchId = '';
            let parentId = '';

            try {
                let batchSearch = search.load({id:QUEUED_SAVED_SEARCH});
                let batchSearchIterator = new JP_SearchIterator(batchSearch);
                batchId = batchSearchIterator.hasNext() ? batchSearchIterator.next().id : '';

                if(batchId){
                    let batchLookup = search.lookupFields({
                        type : BATCH_RECORD_TYPE,
                        id : batchId,
                        columns : [GENERATION_PARAMS, TASK_ID, PARENT_REQUEST]
                    });

                    parentId = batchLookup[PARENT_REQUEST].length == 1 && batchLookup[PARENT_REQUEST][0].value;

                    let hasInvalidSiblings = false;
                    if (parentId) {
                        let invalidBatchSearch = search.create({
                            type: BATCH_RECORD_TYPE,
                            filters: [
                                {name: PARENT_REQUEST, operator: search.Operator.IS, values: parentId},
                                {name: BATCH_STATUS, operator: search.Operator.ANYOF, values: [INVALID_STATUS]},
                            ]
                        });
                        let invalidBatchIterator = new JP_SearchIterator(invalidBatchSearch);
                        hasInvalidSiblings = invalidBatchIterator.hasNext();
                    }

                    if (proceedGeneration(batchLookup[TASK_ID]) && parentId && !hasInvalidSiblings) {

                        let generationParams = JSON.parse(batchLookup[GENERATION_PARAMS]);
                        let mrParams = {
                            batchId : batchId,
                            template : generationParams.template,
                            parent: parentId
                        };

                        let mrTask = task.create({
                            taskType: task.TaskType.MAP_REDUCE
                        });

                        mrTask.scriptId = GEN_INV_SUM_MR_SCRIPT;
                        mrTask.deploymentId = GEN_INV_SUM_MR_DEPLOYMENT;
                        mrTask.params = {'custscript_japan_loc_mr_gen_inv_sum':mrParams};
                        let taskId = mrTask.submit();

                        let lastRun = format.parse({
                            value: new Date(),
                            type: format.Type.DATETIME
                        });

                        //update batch record
                        record.submitFields({
                            type : BATCH_RECORD_TYPE,
                            id : batchId,
                            values : {
                                'custrecord_suitel10n_jp_lastrun': lastRun,
                                'custrecord_suitel10n_jp_ids_task_id' : taskId
                            }
                        });

                        //update request record
                        record.submitFields({
                            type: REQUEST_RECORD_TYPE,
                            id: parentId,
                            values:{
                                'custrecord_jp_loc_gen_req_lastrun': lastRun
                            }
                        });

                    }
                    else if (hasInvalidSiblings){

                        // Batch should not run anymore
                        record.submitFields({
                            type : BATCH_RECORD_TYPE,
                            id : batchId,
                            values : {
                                'custrecord_suitel10n_jp_ids_gen_b_stat': INVALID_STATUS,
                            }
                        });

                        // Schedule self to check if there are other Queued batches
                        let ssTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
                        ssTask.scriptId = JP_Scripts.MR_SCHEDULER_SS_SCRIPT;
                        ssTask.deploymentId = JP_Scripts.MR_SCHEDULER_SS_DEPLOYMENT;
                        ssTask.submit();
                    }

                }

            } catch (e) {

                if (batchId) {

                    record.submitFields({
                        type : BATCH_RECORD_TYPE,
                        id : batchId,
                        values : {
                            'custrecord_suitel10n_jp_ids_gen_b_stat' : ERROR_STATUS,
                            'custrecord_suitel10n_jp_ids_errorflag' : TRUE,
                            'custrecord_suitel10n_jp_ids_err_detail' : e.name + ": " + e.message
                        }
                    });

                    //try to look up parent request ID if it hasn't been set yet
                    parentId = parentId ? parentId : getParentRequestID(batchId)

                    if(parentId){
                        record.submitFields({
                            type : REQUEST_RECORD_TYPE,
                            id : parentId,
                            values: {
                                'custrecord_jp_loc_gen_req_status': ERROR_STATUS,
                                'custrecord_jp_loc_gen_req_err_flag': TRUE,
                                'custrecord_jp_loc_gen_req_err_detail' : e.name + ": " + e.message
                            }
                        });
                    }

                    log.error('IS Generation Error', ['Batch: ', batchId , ' Details: ', e.name, ': ', e.message].join(''));
                }
                else {
                    log.error('IS Generation Error', ['Batch: N/A Details: ', e.name, ': ', e.message].join(''));
                }
            }
        }

        function getParentRequestID(batchId){
            let batchLookup = search.lookupFields({
                type : BATCH_RECORD_TYPE,
                id : batchId,
                columns : [PARENT_REQUEST]
            });
            return batchLookup[PARENT_REQUEST].length == 1 && batchLookup[PARENT_REQUEST][0].value;
        }

        /**
         * Check if M/R tasks are ongoing
         *
         * @param {String} taskId M/R Script Deployment Task Id
         * @returns {Boolean} Tells if generation will proceed
         */
        function proceedGeneration(taskId) {
            if(taskId) {
                let mrTask = task.checkStatus({
                    taskId: taskId
                });

                if (mrTask.status === task.TaskStatus.PENDING || mrTask.status === task.TaskStatus.PROCESSING) {
                    return false;
                }
            }
            return true;
        }


        return {
            execute: execute
        };
    });
