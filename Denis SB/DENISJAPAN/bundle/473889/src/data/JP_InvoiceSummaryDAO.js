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
    "N/record",
    "N/format",
    './JP_CompanyDAO',
    '../lib/JP_ArrayUtility'
],

(BaseDAO, search, runtime, record, format,
         CompanyDAO, ArrayUtility) => {

    let INVOICE_SUMMARY = "custbody_suitel10n_jp_ids_rec";
    let SUBSIDIARY = 'subsidiary';
    let RECORDTYPE = 'recordtype';
    let SETTINGS = 'settings';
    let INVOICE_STATUS_OPEN = 'CustInvc:A';
    let MAINLINE = 'mainline';

    let TOTAL_PREVIOUS_PAYMENT_SEARCH = "customsearch_suitel10n_jp_ids_tot_prev_2";

    function JP_InvoiceSummaryDAO(){
            BaseDAO.call(this);
            this.recordType = 'customtransaction_suitel10n_jp_ids';
            this.fields = {
                batchRecord: 'custbody_suitel10n_jp_ids_gen_batch',
                regenInvoiceSummaryDoc: 'custbody_suitel10n_jp_ids_doc_regen',
                batch : "custbody_suitel10n_jp_ids_gen_batch",
                statementDate : "custbody_suitel10n_jp_ids_stmnt_date",
                customerFilter : "custbody_suitel10n_jp_ids_cust",
                invoiceStatus: 'status',
                entity : 'entity',
                id: 'internalid',
                customer : 'custbody_suitel10n_jp_ids_customer',
                netTotal : 'custbody_suitel10n_jp_ids_net_total',
                isConsolidated: 'custbody_jp_inc_all_trans_sub',
                dateCreated : 'datecreated',
                closingDate : 'custbody_suitel10n_jp_ids_cd',
                transactionId : 'tranid',
                transactions : 'custbody_suitel10n_jp_ids_transactions'
            };
        }

        util.extend(JP_InvoiceSummaryDAO.prototype, BaseDAO.prototype);

    JP_InvoiceSummaryDAO.prototype.retrievePreviousPayment=function(params) {
        let entities = params.entities;
        let currentRec = params.currentRec;
        let arrayUtil = new ArrayUtility();

        let isInvoiceSummaryFilter = [RECORDTYPE, search.Operator.IS, this.recordType];
        let excludeCurrentISFilter = currentRec ? [this.fields.id, search.Operator.NONEOF, [currentRec]] : null;
        let entityFilter = entities.length > 1 ?
            ['AND', [this.fields.customer, search.Operator.ANYOF, entities]] :
            ['AND', [this.fields.customer, search.Operator.IS, entities[0]]];

        this.searchId = TOTAL_PREVIOUS_PAYMENT_SEARCH;
        let prevPaySearch = this.createSearch();
        prevPaySearch.filterExpression = excludeCurrentISFilter ?
            [isInvoiceSummaryFilter, 'AND', excludeCurrentISFilter].concat(entityFilter) :
            [isInvoiceSummaryFilter].concat(entityFilter);

        let iterator = this.getResultsIterator(prevPaySearch);

        // save creation date of latest IS that is consolidated
        // add Total Amount Due of IS only if was created after the latest consolidated IS
        let latestCreationDatems = 0;
        let latestISBalances = {};
        while (iterator.hasNext()) {
            let result = iterator.next();
            let balance = result.getValue({name: this.fields.netTotal}) || 0;
            let customerId = result.getValue({name: this.fields.customer});
            let isConsolidated = result.getValue({name: this.fields.isConsolidated});
            let dateCreated = result.getValue({name: this.fields.dateCreated});
            let parsedDateCreated = format.parse({value: dateCreated, type: format.Type.DATE}).getTime();
            latestCreationDatems = parsedDateCreated > latestCreationDatems && isConsolidated ?
                parsedDateCreated :
                latestCreationDatems;

            // iterate on all IS to overwrite balance amount from latest record per customer
            if (!latestISBalances.hasOwnProperty(customerId)) {
                latestISBalances[customerId] = {balance: 0.0, creationDatems: 0};
            }
            latestISBalances[customerId] = {balance: balance, creationDatems: parsedDateCreated};
        }

        let totalBalanceOfFamily = 0.0;
        Object.keys(latestISBalances).forEach((customerId)=>{
            let balance = latestISBalances[customerId].balance;
            let creationDatems = latestISBalances[customerId].creationDatems;
            totalBalanceOfFamily += creationDatems >= latestCreationDatems ? parseFloat(balance) : 0.0;
        });

        return totalBalanceOfFamily;
    };


    JP_InvoiceSummaryDAO.prototype.retrieveLatestISBalance=function(customers, parentLookup) {

            let filters = [
                {name:"custbody_suitel10n_jp_ids_customer", operator:search.Operator.ANYOF, values:customers}
            ];

            let columns = [
                {name: this.fields.customer},
                {name: this.fields.netTotal},
                {name: this.fields.isConsolidated},
                {name: this.fields.dateCreated, sort: search.Sort.DESC}
            ];

            let latestBalanceSearch = this.createSearch();
            latestBalanceSearch.filters = filters;
            latestBalanceSearch.columns = columns;
            let iterator = this.getResultsIterator(latestBalanceSearch);

            let tmpLatestISBalances = {};

            while (iterator.hasNext()){
                let result = iterator.next();
                let total = result.getValue({name:this.fields.netTotal}) || 0;
                let customerId = result.getValue({name: this.fields.customer});
                let isConsolidated = result.getValue({name: this.fields.isConsolidated});
                let dateCreated = result.getValue({name: this.fields.dateCreated});

                if (!tmpLatestISBalances.hasOwnProperty(customerId)) {
                    tmpLatestISBalances[customerId] = 0;
                    tmpLatestISBalances[customerId] = {total, isConsolidated, dateCreated};
                }

                // stop looping when we found the latest Invoice Summaries for each customer
                if(Object.keys(tmpLatestISBalances).length === customers.length){
                    break;
                }
            }

            log.debug("tmpLatestISBalances", JSON.stringify(tmpLatestISBalances));
            log.debug("parentLookup", JSON.stringify(parentLookup));
            let latestISBalances = {};

            //if consolidated eliminate invalid previous Invoice Summaries.
            if(parentLookup){
                Object.keys(tmpLatestISBalances).forEach((customerId)=>{
                    let parentCustomerId = parentLookup[customerId];
                    let parentCustomer = tmpLatestISBalances[parentCustomerId];
                    let currCustomer = tmpLatestISBalances[customerId];

                    if(parentCustomer){
                        let parentCreateDate = format.parse({
                            value: parentCustomer.dateCreated,
                            type: format.Type.DATE
                        }).getTime();
                        let currCustCreateDate = format.parse({
                            value: currCustomer.dateCreated,
                            type: format.Type.DATE
                        }).getTime();

                        latestISBalances[customerId] =
                            (parentCustomer.isConsolidated && currCustCreateDate>=parentCreateDate) ? currCustomer.total : 0;
                    }
                    else{
                        latestISBalances[customerId] = currCustomer.total;
                    }
                });
            }
            else{
                Object.keys(tmpLatestISBalances).forEach((customerId)=>{
                    latestISBalances[customerId] = tmpLatestISBalances[customerId].total;
                });
            }

            //default all totals of customer ids without IS to zero.
            let latestISKeys = Object.keys(latestISBalances);
            if(latestISKeys.length < customers.length){
                customers.forEach((custId)=>{
                    if (!latestISBalances.hasOwnProperty(custId)) {
                        latestISBalances[custId] = 0;
                    }
                });
            }

            return latestISBalances;
        };


    JP_InvoiceSummaryDAO.prototype.getExisting=function(params) {
            let existingInvSumRecID = '';

            let filters = [
                {name:"custbody_suitel10n_jp_ids_gen_batch", operator:search.Operator.IS, values: params.batchId},
                {name:"custbody_suitel10n_jp_ids_customer", operator:search.Operator.IS, values: params.entity}
            ];

            let isSearch = this.createSearch();
            isSearch.filters = filters;
            let iterator = this.getResultsIterator(isSearch);

            if (iterator.hasNext()){
                let result = iterator.next();
                existingInvSumRecID = result.id;
            }

            return existingInvSumRecID;
        }

        /**
         * Retrieves invoice summaries related to a set of invoices
         * Returns array of invoice summary internal IDs.
         *
         * @param {Object} Object containing customer ID and subsidiary ID
         * @returns {Array} Array of invoice summary internal IDs
         */
        JP_InvoiceSummaryDAO.prototype.getCustomerInvoiceSummaries=function(params){
            let filters = [
                {name:this.fields.invoiceStatus, operator:search.Operator.IS, values:INVOICE_STATUS_OPEN},
                {name:this.fields.entity, operator:search.Operator.IS, values:params.customer},
                {name:INVOICE_SUMMARY, operator:search.Operator.NONEOF, values:'@NONE@'},
                {name:MAINLINE, operator:search.Operator.IS, values:'T'}
            ];

            if(params.subsidiary && runtime.isFeatureInEffect('SUBSIDIARIES')) {
                filters.push({name:SUBSIDIARY, operator:search.Operator.IS, values:params.subsidiary});
            }

            let columns = [
                {name:INVOICE_SUMMARY},
                {name:this.fields.transactionId, join:INVOICE_SUMMARY}
            ];

            this.recordType = search.Type.INVOICE;
            let invoiceSearch = this.createSearch();
            invoiceSearch.filters = filters;
            invoiceSearch.columns = columns;

            let iterator = this.getResultsIterator(invoiceSearch);
            let internalIds = [];
            let invoiceSummaries = [];
            while(iterator.hasNext()){
                let invoiceSummary = iterator.next();
                let tranid = invoiceSummary.getValue({name:this.fields.transactionId, join:INVOICE_SUMMARY});
                let invoiceSummaryId = invoiceSummary.getValue({name:INVOICE_SUMMARY});

                if(internalIds.indexOf(invoiceSummaryId) == -1){
                    internalIds.push(invoiceSummaryId);
                    invoiceSummaries.push({value:invoiceSummaryId, text:tranid});
                }
            }
            return invoiceSummaries;
        };

    JP_InvoiceSummaryDAO.prototype.getData=function(id){
            let invSumObj = {};

            let lookup = search.lookupFields({
                type: this.recordType,
                id: id,
                columns: [
                    this.fields.transactionId,
                    this.fields.customerFilter,
                    this.fields.batch,
                    this.fields.statementDate,
                    this.fields.closingDate,
                    this.fields.customer
                ]
            });
            invSumObj[this.fields.transactionId] = lookup[this.fields.transactionId];
            invSumObj[this.fields.closingDate] = lookup[this.fields.closingDate];
            invSumObj[this.fields.customerFilter] = lookup[this.fields.customerFilter][0] ?
                lookup[this.fields.customerFilter][0].text : null;
            invSumObj[this.fields.batch] = lookup[this.fields.batch][0].value;
            invSumObj[this.fields.customer] = lookup[this.fields.customer][0].text;

            let formattedDate = format.parse({
                value: lookup[this.fields.statementDate],
                type: format.Type.DATE
            });
            invSumObj[this.fields.statementDate] = new Date(formattedDate);

            let subName = 'name';
            let pdfFileFormat = 'custrecord_jp_ispdf_format';
            let isPerCustomer = 'custrecord_jp_isgen_individcust';

            invSumObj[SETTINGS] = {};

            if(runtime.isFeatureInEffect(('SUBSIDIARIES'))) {
                lookup = search.lookupFields({
                    type: this.recordType, id: id, columns: [SUBSIDIARY]
                });
                invSumObj[SUBSIDIARY] = lookup[SUBSIDIARY][0]

                let subsidiaryLookup = search.lookupFields({
                    type: search.Type.SUBSIDIARY,
                    id: invSumObj[SUBSIDIARY].value,
                    columns: [subName, pdfFileFormat, isPerCustomer]
                });

                //returns the full name, we need only the subsidiary name not the hierarchical name.
                //therefore the split.
                let arr = subsidiaryLookup[subName].split(":");
                let sname = (arr.length != 0) ? arr[arr.length-1] : '';
                invSumObj[SUBSIDIARY].text = sname;
                invSumObj[SETTINGS].pdfFormat = subsidiaryLookup[pdfFileFormat];
                invSumObj[SETTINGS].isPerCustomer = subsidiaryLookup[isPerCustomer];
            }
            else{
                //get data from company information instead of subsidiary.
                let companyDAO = new CompanyDAO();

                invSumObj[SETTINGS].pdfFormat = companyDAO.getCompValue(pdfFileFormat);
                invSumObj[SETTINGS].isPerCustomer = companyDAO.getCompValue(isPerCustomer);
            }

            return invSumObj;
        };

        /**
         * Gets the ids of invoice summary under the batch specified
         *
         * @param batchId Request record internal ID
         * @returns array of invoice summary ids under the batch specified
         */
        JP_InvoiceSummaryDAO.prototype.getISFromBatch=function(batchId) {
            let ISIds = [];

            if (batchId) {
                let ISSearch = this.createSearch();
                ISSearch.filters = [{
                    name: this.fields.batchRecord,
                    operator:search.Operator.IS,
                    values: batchId
                }];
                ISSearch.columns = [{ name: this.fields.id}];
                let searchIterator = this.getResultsIterator(ISSearch);
                while(searchIterator.hasNext()){
                    ISIds.push(searchIterator.next().id);
                }
            }

            return ISIds;
        }

    return JP_InvoiceSummaryDAO;
});
