/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    "./JP_BaseDAO",
        "N/search",
        "N/runtime",
    "../datastore/JP_ListStore",
    "../datastore/JP_RecordTypes"
    ],
    (BaseDAO,
             search,
             runtime,
             JP_Lists,
             JP_RecordTypes) => {

    function JP_InvoiceSummaryBatchDAO(){
            BaseDAO.call(this);
            this.recordType = JP_RecordTypes.BATCH_RECORD;

            this.fields = {
                id : "internalid",
                hierarchyId : "custrecord_japan_loc_hierarchy",
                parentRequest : "custrecord_japan_loc_parent_request",
                customerFilter : "custrecord_suitel10n_jp_ids_su_cust",
                closingDate : "custrecord_suitel10n_jp_ids_su_cd",
                overdueFilter : "custrecord_suitel10n_jp_ids_su_overdue",
                includeNoTransaction: "custrecord_suitel10n_jp_ids_su_no_trans",
                status: "custrecord_suitel10n_jp_ids_gen_b_stat",
                subsidiary : "custrecord_suitel10n_jp_ids_su_sub",
                generationParams: "custrecord_suitel10n_jp_ids_su_params",
                customerSavedSearch : "custrecord_japan_loc_cust_savedsearch",
                statementDate : "custrecord_suitel10n_jp_ids_su_sd",
                errorFlag: "custrecord_suitel10n_jp_ids_errorflag",
                errorDetail: "custrecord_suitel10n_jp_ids_err_detail",
                invoiceSummaryDoc: "custrecord_suitel10n_jp_ids_doc"
            };

            this.status = new JP_Lists().BATCH_STATUS;
        }

        util.extend(JP_InvoiceSummaryBatchDAO.prototype, BaseDAO.prototype);

        /**
         * Checks the existence of the batch record for a specific customer entitiy with a status of QUEUED or ERROR
         * Specially used for Individual PDF per Customer feature
         *
         * @param parameters {obj} Contains batch parameters for search filters
         * @param entity {int} internal id of the customer mapped to the batch
         * @returns {int} batch id
         */
        JP_InvoiceSummaryBatchDAO.prototype.checkIfPendingBatchExists = function(parameters, entity) {
            let isOW = runtime.isFeatureInEffect('SUBSIDIARIES');

            let closingDate = parameters.closingDate;
            let subsidiary = parameters.subsidiary;
            let customer = parameters.customer;
            let requestId = parameters.requestId;
            let filters = [];
            let columns = [];
            let batch = '';

            if (isOW) {
                filters.push({name: this.fields.subsidiary, operator:search.Operator.ANYOF, values: subsidiary});
            }

            if (customer) {
                filters.push({name: this.fields.customerFilter, operator:search.Operator.ANYOF, values: customer});
            }

            filters.push({name: this.fields.closingDate, operator:search.Operator.ON, values: closingDate});
            filters.push({name: this.fields.parentRequest, operator:search.Operator.ANYOF, values: requestId});
            filters.push({name: this.fields.status, operator:search.Operator.IS,
                values: [this.status.ERROR, this.status.QUEUED, this.status.PROCESSED]});
            columns.push({name: this.fields.generationParams});
            columns.push({name: this.fields.status});

            let srch = this.createSearch();
            srch.filters = filters;
            srch.columns = columns;
            let iterator = this.getResultsIterator(srch);

            // search batch with same entity in params
            while (iterator.hasNext()){
                let result = iterator.next();
                let id = result.id;
                let status = result.getValue({name: this.fields.status});
                let generationParams = JSON.parse(result.getValue({name: this.fields.generationParams}));
                let batchEntity = generationParams.forGeneration[0] ? generationParams.forGeneration[0].entity : '';

                if(entity.toString() === batchEntity.toString()) {
                    batch = {
                        id: id,
                        status: status
                    };
                    break;
                }
            }

            return batch;
        }


        JP_InvoiceSummaryBatchDAO.prototype.getErroredBatch=function(params) {
            let columns = [];
            let filters = [];

            filters.push({name: this.fields.status, operator:search.Operator.IS, values: 1});

            if (params) {
                if (params.closingDate) {
                    filters.push({name: this.fields.closingDate, operator:search.Operator.ON, values: params.closingDate});
                }

                /* SI accounts, we don't expect a value for params.subsidiary
                 * since the user will not be able to select a subsidiary
                 * using the suitelet */

                if (params.subsidiary) {
                    filters.push({name: this.fields.subsidiary, operator:search.Operator.IS, values: params.subsidiary});
                }

                if (params.customer) {
                    filters.push({name: this.fields.customerFilter, operator:search.Operator.IS, values: params.customer});
                }

                let includeOverdue = "F";
                if (params.overdue) {
                    includeOverdue = params.overdue;
                }
                filters.push({name: this.fields.overdueFilter, operator:search.Operator.IS, values: (includeOverdue === "T")});

                let noTransaction = "F";
                if (params.noTransaction) {
                    noTransaction = params.noTransaction;
                }
                filters.push({name: this.fields.includeNoTransaction, operator:search.Operator.IS, values: (noTransaction === "T")});

                if (params.requestId) {
                    filters.push({name: this.fields.parentRequest, operator: search.Operator.IS, values: params.requestId});
                }
            }

            let srch = this.createSearch();
            srch.filters = filters;
            srch.columns = columns;
            let iterator = this.getResultsIterator(srch);

            let model = {};
            if (iterator.hasNext()){
                let result = iterator.next();

                let batchLookup = search.lookupFields({
                    type: this.recordType,
                    id: result.id,
                    columns: this.fields.generationParams
                });

                model.id = result.id;
                model.parameters = batchLookup[this.fields.generationParams];

            }

            return model;
        };

        /**
         * Check if a request record has pending batch generations
         *
         * @param requestId Request record internal ID
         * @returns boolean Returns true if a request has at least one batch that is not PROCESSED
         */

        JP_InvoiceSummaryBatchDAO.prototype.requestHasPendingBatches=function(requestId){
            let batchSearch = this.createSearch();
            batchSearch.filters = [
                {name:this.fields.status, operator: search.Operator.NONEOF, values:[this.status.PROCESSED]},
                {name:this.fields.parentRequest, operator: search.Operator.IS, values:requestId}
            ];
            batchSearch.columns = [
                {name: this.fields.id}
            ];
            let iterator = this.getResultsIterator(batchSearch);
            return iterator.hasNext();
        };

        /**
         * Gets the list of pending batch records without parent requests
         *
         * @returns array object list of batches with queued, hanging, or error status and without parent request
         */
        JP_InvoiceSummaryBatchDAO.prototype.getPendingOrphanBatches=function(){
            let batchResults = [];

            let batchSearch = this.createSearch();
            batchSearch.filters = [
                { name:this.fields.status, operator: search.Operator.ANYOF,
                    values:[this.status.ERROR, this.status.QUEUED, this.status.HANGING] },
                { name:this.fields.parentRequest, operator: search.Operator.ANYOF, values: ['@NONE@'] }
            ];
            batchSearch.columns = [
                { name: this.fields.customerFilter },
                { name: this.fields.customerSavedSearch },
                { name: this.fields.closingDate },
                { name: this.fields.overdueFilter },
                { name: this.fields.includeNoTransaction },
                { name: this.fields.status },
                { name: this.fields.statementDate },
                { name: this.fields.subsidiary },
                { name: this.fields.errorFlag }
            ];
            let iterator = this.getResultsIterator(batchSearch);
            while(iterator.hasNext()){
                let result = iterator.next();
                let batchObj = {
                    id: result.id,
                };
                batchObj[this.fields.customerFilter] = result.getValue({ name: this.fields.customerFilter });
                batchObj[this.fields.customerSavedSearch] = result.getValue({ name: this.fields.customerSavedSearch });
                batchObj[this.fields.closingDate] = result.getValue({ name: this.fields.closingDate });
                batchObj[this.fields.overdueFilter] = result.getValue({ name: this.fields.overdueFilter });
                batchObj[this.fields.includeNoTransaction] = result.getValue({ name: this.fields.includeNoTransaction });
                batchObj[this.fields.status] = result.getValue({ name: this.fields.status });
                batchObj[this.fields.statementDate] = result.getValue({ name: this.fields.statementDate });
                batchObj[this.fields.subsidiary] = result.getValue({ name: this.fields.subsidiary });
                batchObj[this.fields.errorFlag] = result.getValue({ name: this.fields.errorFlag });
                batchResults.push(batchObj);
            }

            return batchResults;
        };

        /**
         * Gets the ids of batches under the request specified
         *
         * @param requestId Request record internal ID
         * @returns array of batch ids under the parent request
         */
        JP_InvoiceSummaryBatchDAO.prototype.getBatchesFromRequest=function(requestId) {
            let batchIds = [];
            let batchSearch = this.createSearch();

            batchSearch.filters = [{
                name: this.fields.parentRequest,
                operator:search.Operator.IS,
                values: requestId
            }];
            batchSearch.columns = [{ name: 'internalid'}];
            let searchIterator = this.getResultsIterator(batchSearch);
            while(searchIterator.hasNext()){
                batchIds.push(searchIterator.next().id);
            }

            return batchIds;
        }

    return JP_InvoiceSummaryBatchDAO;

});
