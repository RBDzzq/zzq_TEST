/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    "../data/JP_TransactionDAO",
    "../data/JP_InvoiceSummaryRequestDAO",
    "../data/JP_InvoiceSummaryBatchDAO",
    "../data/JP_SubsidiaryDAO",
    "../data/JP_CompanyDAO",
    "../data/JP_CustomerDAO",
    "../data/NQuery/JP_NCustTreeDAO",
    "../datastore/JP_RecordTypes",
    "../datastore/JP_ListStore",
    "../datastore/JP_Scripts",
    "../app/JP_ISGenerationFormFilterExpressionCreator",
    "N/record",
    "N/format",
    "N/runtime",
    "N/search",
    "N/task"
], (
    TransactionDAO,
    RequestDAO,
    InvoiceSummaryBatchDAO,
    SubsidiaryDAO,
    CompanyDAO,
    CustomerDAO,
    CustTreeDAO,
    JP_Types,
    JP_Lists,
    JP_Scripts,
    FilterExpressionCreator,
    record,
    format,
    runtime,
    search,
    task
) => {

    class JP_InvoiceSummaryRequestManager{

        constructor() {
            this.status = new JP_Lists().BATCH_STATUS;
        }

        createRequestRecord(params) {
            let requestDAO = new RequestDAO();
            let batchData = this.createBatchData(params);

            let closingDate = batchData.closingDate;
            let subsidiary = batchData.subsidiary;
            let customer = batchData.customer;
            let customerSavedSearch = batchData.customerSavedSearch;
            let overdueFlag = batchData.overdue;
            let noTransactionsFlag = batchData.noTransaction;
            let generationParams = batchData.generationParams;
            let statementDate = batchData.statementDate;
            let hierarchyId = batchData.hierarchyId;

            if(noTransactionsFlag === 'T'){
                generationParams.forGeneration = new CustomerDAO().getParamsWithCustWOTxn({
                    closingDate: closingDate,
                    customer: customer,
                    customerSavedSearch: customerSavedSearch,
                    generationParams: generationParams,
                    subsidiary: subsidiary,
                    hierarchyId: hierarchyId
                });
            }

            let existingRequestId = requestDAO.checkIfFailedRequestExists(batchData);
            let status;

            if (!existingRequestId) {
                let isPDFPerCust;
                if(runtime.isFeatureInEffect({feature: 'SUBSIDIARIES'})){
                    isPDFPerCust = ( new SubsidiaryDAO().isIndividualPDFEnabled(subsidiary) )  ? 'T' : 'F';
                }
                else{
                    isPDFPerCust = ( new CompanyDAO().getPDFCustomerSetting() )  ? 'T' : 'F';
                }

                //create request record
                let requestRecord = record.create({
                    type: JP_Types.REQUEST_RECORD
                });

                requestRecord.setValue({fieldId: requestDAO.fields.customerFilter, value: customer});
                requestRecord.setValue({fieldId: requestDAO.fields.customerSavedSearch, value: customerSavedSearch});
                requestRecord.setValue({fieldId: requestDAO.fields.closingDate,
                    value: format.parse({value:closingDate, type: format.Type.DATE}) });
                requestRecord.setValue({fieldId: requestDAO.fields.statementDate,
                    value: format.parse({value:statementDate, type: format.Type.DATE}) });
                requestRecord.setValue({fieldId: requestDAO.fields.includeOverdue, value: (overdueFlag == "T")});
                requestRecord.setValue({fieldId: requestDAO.fields.includeNoTransaction, value: (noTransactionsFlag == "T")});
                requestRecord.setValue({fieldId: requestDAO.fields.status, value: this.status.QUEUED});
                requestRecord.setValue({fieldId: requestDAO.fields.subsidiary, value: subsidiary});
                requestRecord.setValue({fieldId: requestDAO.fields.generationParameters, value: JSON.stringify(generationParams)});
                requestRecord.setValue({fieldId: requestDAO.fields.pdfSetting, value: (isPDFPerCust === 'T')});
                requestRecord.setValue({fieldId: requestDAO.fields.hierarchyid, value: hierarchyId});

                status = requestRecord.save();
                batchData["individualPDF"] = isPDFPerCust;
                batchData["requestId"] = status;
            }
            else {
                status = record.submitFields({
                    type: JP_Types.REQUEST_RECORD,
                    id: existingRequestId,
                    values: {
                        "custrecord_jp_loc_gen_req_trig_flag" : true,
                        "custrecord_jp_loc_gen_req_status" : this.status.QUEUED,
                        "custrecord_jp_loc_gen_req_params" : JSON.stringify(generationParams),
                        "custrecord_jp_loc_gen_req_sd" : statementDate
                    }
                });

                //add individual pdf feature setting to batchData object
                let PDFSetting = search.lookupFields({
                    type : JP_Types.REQUEST_RECORD,
                    id: existingRequestId,
                    columns : [requestDAO.fields.pdfSetting]
                });

                batchData["individualPDF"] = (PDFSetting[requestDAO.fields.pdfSetting]) ? 'T' : 'F';
                batchData["requestId"] = existingRequestId;
            }
            this.callBatchManagerMR(batchData);
            return status;
        };

        callBatchManagerMR(batchData) {
            let mrParams = {
                batchParams: batchData
            };

            let mrTask = task.create({
                taskType: task.TaskType.MAP_REDUCE
            });

            mrTask.scriptId = JP_Scripts.BATCH_MANAGER_MR_SCRIPT;
            mrTask.deploymentId = JP_Scripts.BATCH_MANAGER_MR_DEPLOYMENT;
            mrTask.params = { "custscript_jpn_loc_batch_mr_params": mrParams };
            mrTask.submit();
        }

         createBatchData(params) {
            let generationParams = this.getBatchGenerationParameters(params);

            return {
                "closingDate": params.closingDate,
                "subsidiary": params.subsidiary,
                "customer": params.customer,
                "customerSavedSearch" : params.customerSavedSearch,
                "overdue": params.overdue,
                "noTransaction": params.noTransaction,
                "generationParams": generationParams,
                "statementDate": params.statementDate,
                "hierarchyId": params.hierarchyId
            };
        }

         getBatchGenerationParameters(params) {
            let forGeneration = this.getIncludedInvoices(params);
            let subsidiary = params.subsidiary;
            let isConsolidated = params.hierarchyId && params.hierarchyId > -1 ? true : false;
            let template = (params.template !== "") ? params.template : this.getTemplate(subsidiary, isConsolidated);

            return {forGeneration, template, subsidiary};
        }

         getTemplate(subID, isConsolidated) {
            let templateLookup;
            if (runtime.isFeatureInEffect({feature: 'SUBSIDIARIES'})) {
                templateLookup = new SubsidiaryDAO().getAttributes(subID);
            } else {
                templateLookup = new CompanyDAO().getAttributes();
            }
            let stdTemplate = templateLookup ? templateLookup.standardtemplate : null;
            let conTemplate = templateLookup ? templateLookup.consolidatedtemplate : null;
            return isConsolidated ? conTemplate : stdTemplate;
        }

         getIncludedInvoices(params) {

            params.failedTransactions = this.getFailedTransactionsIDs(params);

            let expCreator = new FilterExpressionCreator();
            let filterExpression = expCreator.create(params);

            log.debug("Filter Expressions upon generation", JSON.stringify(filterExpression));
            let paramsObj = {
                searchId: "customsearch_suitel10n_jp_ids_inv_search",
                filterExpression: filterExpression
            };

            //separate search for the failed transactions.
            if (params.failedTransactions && params.failedTransactions.length > 0) {
                paramsObj.searchParams = params.failedTransactions;
            }

            let transDAO = new TransactionDAO();
            let searchResults = transDAO.executeSavedSearch(paramsObj);

            let parentLookup = new CustTreeDAO().createParentLookupTable(params.hierarchyId);

            let results = [];
            for (let i = 0; i < searchResults.length; i++) {
                let curr = searchResults[i];

                let id = curr.id;
                let type = curr.getValue({name: "type"});
                let entity = curr.getValue({name: "internalid", join: "customer"});

                results.push({
                    "id": id,
                    "type": type,
                    "entity": parentLookup ? parentLookup[entity] : entity
                });
            }

            return results;
        }

         getFailedTransactionsIDs(params) {
            let transIDs = [];

            let batchDAO = new InvoiceSummaryBatchDAO();
            let batch = batchDAO.getErroredBatch(params);

            if (batch.parameters) {
                let paramsObj = JSON.parse(batch.parameters);
                let failedTransactions = paramsObj.forGeneration;

                for (let i = 0; i < failedTransactions.length; i++) {
                    let trans = failedTransactions[i];
                    // exclude elements that are for cust wo txn
                    if(trans.id){
                        transIDs.push(trans.id);
                    }
                }
            }
            if(transIDs.length > 0) {
                transIDs = new TransactionDAO().filterFailedTransactions(transIDs, params);
            }

            return transIDs;
        }
    }

    return JP_InvoiceSummaryRequestManager;
});
