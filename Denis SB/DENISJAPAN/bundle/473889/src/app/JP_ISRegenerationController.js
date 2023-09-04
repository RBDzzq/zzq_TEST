/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define([
    'N/search',
    'N/record',
    'N/task',
    'N/error',
    '../data/JP_TransactionDAO',
    './JP_ErrorNotifier',
    './JP_ISRegenerationManager',
    './JP_BatchToRequestAdaptor'
], (
    search,
    record,
    task,
    error,
    TransactionDAO,
    ErrorNotifier,
    RegenerationManager,
    BatchToRequest
) =>{
    let INV_SUMMARY_REC_TYPE = 'customtransaction_suitel10n_jp_ids';
    let BATCH_FIELD = 'custbody_suitel10n_jp_ids_gen_batch';
    let REGENERATION_ERROR = 'INVOICE_SUMMARY_REGENERATION_ERROR';

    function ISRegenerationController() {}

    /**
     * Start regeneration process
     * Determines if regeneration should be done real-time or scheduled
     *
     * @param {String} recId Invoice Summary record ID
     * @returns {String} Regenerated PDF File ID
     */
    ISRegenerationController.prototype.regenerate = (recId) => {

        let fileId = null;

		try {
            /* Set to 'in progress' before starting regeneration process */
            record.submitFields({
                type: INV_SUMMARY_REC_TYPE,
                id: recId,
                values: {
                    custbody_suitel10n_jp_ids_gen_complete: false
                }
            });

			if (evaluateIfNeedsToBeScheduled(recId)) {
				scheduleRegeneration(recId);
			}
			else {
				fileId = executeRegeneration(recId);
			}
		}
		catch (e) {

            let invSummaryLookup = search.lookupFields({
                type: INV_SUMMARY_REC_TYPE,
                id: recId,
                columns: BATCH_FIELD
            });

            let batchId = invSummaryLookup[BATCH_FIELD][0].value;

            let errorObj = {
                name : REGENERATION_ERROR,
                details : e.message,
                nsCode : e.name
            };
            let batchRecord = record.load({
                type : "customrecord_suitel10n_jp_ids_gen_batch",
                id: batchId
            });

            let adaptedBatch = new BatchToRequest(batchRecord);
            let owner = batchRecord.getValue({fieldId: 'owner'});
            let genStat = {total : 1, generated : 0}

            let errorNotifier = new ErrorNotifier();
            errorNotifier.notifyCreator(adaptedBatch, errorObj, owner,  genStat);

            //revert to Generation Completed
            record.submitFields({
                type: INV_SUMMARY_REC_TYPE,
                id: recId,
                values: {
                    custbody_suitel10n_jp_ids_gen_complete: true
                }
            });

            log.error('Regeneration Error', e);
    	}

		return fileId;
    }


    /**
     * Start regeneration process
     *
     * @param {String} recId Invoice Summary record ID
     * @returns {String} File ID
     */
    function executeRegeneration(recId) {
        return new RegenerationManager().regenerate(recId);
    }


    /**
     * Check if regeneration needs to be moved to a scheduled script
     *
     * @param {String} recId Invoice Summary record ID
     * @returns {Boolean} True/false if line items exceed threshold
     */
	function evaluateIfNeedsToBeScheduled(recId){

        let INV_SUM_REC_TRANS_LIST = 'custbody_suitel10n_jp_ids_transactions';
        let  LINE_ITEM_COUNT_THRESHOLD = 500;
        let flag = false;

        let invoiceSummaryLookup = search.lookupFields({
            type: INV_SUMMARY_REC_TYPE,
            id: recId,
            columns: INV_SUM_REC_TRANS_LIST
        });

        let transactionObjects = invoiceSummaryLookup[INV_SUM_REC_TRANS_LIST];
        let transactions = [];

        if (Array.isArray(transactionObjects)) {
        	util.each(transactionObjects, function(transactionObj) {
                transactions.push(transactionObj.value);
            });
        } else {
        	transactions = transactionObjects.value.split(",");
        }

		if (transactions.length > 0) {
            let totalCount = 0;
            let tranDAO = new TransactionDAO();
            totalCount = tranDAO.getTransactionLineCount(transactions);
            flag = (totalCount > LINE_ITEM_COUNT_THRESHOLD);
		}

		return flag;
    }


    /**
     * Trigger scheduled script for regeneration
     *
     * @param {String} recId Invoice Summary Record ID
     */
	function scheduleRegeneration(recId){

        let ssTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT,
            scriptId: 'customscript_japan_loc_regeneration_ss',
            deploymentId: 'customdeploy_japan_loc_regeneration_ss',
            params: {
                custscript_inv_sum_rec_id: recId
            }
        });
        ssTask.submit();
    }


    return ISRegenerationController;

});
