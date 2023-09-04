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
    "./JP_PaymentTermDAO",
    "../lib/JP_DateUtility",
    "../app/JP_PaymentTermUtility",
    "N/search",
    "N/format",
    "N/runtime",
    "../lib/JP_ArrayUtility",
    "N/record",
], (
    BaseDAO,
    PaymentTermDAO,
    DateUtility,
    PaymentTermUtility,
    search,
    format,
    runtime,
    ArrayUtil,
    record
) => {

    let TAX_DETAIL_SEARCH_ID = 'customsearch_suitel10n_jp_tax_detail';
    let CUSTBODY_IS_REC = 'custbody_suitel10n_jp_ids_rec';
    let ENTITY_FIELD = 'entity';
    let TRANDATE_FIELD = 'trandate';
    let TRAN_NO_FIELD = 'transactionnumber';
    let TRAN_ID_FIELD = 'tranid';
    let PAYMENT_DETAILS_FIELD = 'custbody_suitel10n_jp_paydetails';
    let EXCHANGE_RATE_FIELD = 'exchangerate';
    let CURRENCY_FIELD = 'currency';
    let NET_AMOUNT_FIELD = 'formulacurrency_netamount';
    let FOREIGN_AMOUNT_FIELD = 'formulacurrency_fxamount';

    //deduct Journal and AR Adj Debit Invoice Summary
    let NET_AMOUNT_FORMULA = 'DECODE({typecode},\'Journal\', {netamount}*-1, '
        +'DECODE({recordtype},\'customsale_jp_loc_debit_bal_adj\', {netamount}*-1, ' +
        'DECODE({recordtype}, \'customsale_jp_loc_cred_bal_adj\', {netamount}*-1, {netamount}) ) )';
    let NET_FX_AMOUNT_FORMULA = 'DECODE({typecode},\'Journal\',{fxamount}*-1, '+
        'DECODE({recordtype},\'customsale_jp_loc_debit_bal_adj\',{fxamount}*-1,' +
        'DECODE({recordtype}, \'customsale_jp_loc_cred_bal_adj\', {netamount}*-1, {netamount}) ) )';

    let NET_AMOUNT_COL = {name:NET_AMOUNT_FIELD, formula: NET_AMOUNT_FORMULA};
    let NET_AMOUNT_SUM = {name:NET_AMOUNT_FIELD, formula: NET_AMOUNT_FORMULA, summary: search.Summary.SUM};
    let FOREIGN_AMOUNT_COL = {name:FOREIGN_AMOUNT_FIELD, formula:NET_FX_AMOUNT_FORMULA};
    let arrayUtil;

        function TransactionDAO(){
            BaseDAO.call(this);
            this.fields = {};
            this.searchId = '';
            this.recordType = search.Type.TRANSACTION;
            arrayUtil = new ArrayUtil;
        }

        util.extend(TransactionDAO.prototype, BaseDAO.prototype);

        /**
         * Filter the failed transactions
         *
         * @param {Array} transIDs Array of transaction internal IDs
         * @param {Object} filters Object of filter values
         * @returns {Array} Array of internal IDs
         */
        TransactionDAO.prototype.filterFailedTransactions=function(transIDs, filters) {

            let mainlineFilter = ["mainline", "is", "T"];
            let closingDateFilter = [
                ["custbody_suitel10n_inv_closing_date", "on", filters.closingDate],
                "OR",
                ["custbody_suitel10n_jp_ids_date", "on", filters.closingDate]
            ];

            let srch = search.create({
                type : this.recordType,
                columns : ['internalid']
            });

            let attachedTransactions = [];
            if(transIDs && transIDs.length > 0){
                srch.filterExpression = srch.filterExpression.concat(['AND',
                    ['internalid', search.Operator.ANYOF, transIDs]]);
            }
            srch.filterExpression = [attachedTransactions, "AND", mainlineFilter, "AND", closingDateFilter];

            let ids = [];
            let srchIterator = this.getResultsIterator(srch);
            while(srchIterator.hasNext()){
                let result = srchIterator.next();
                ids.push(result.id);
            }

            return ids;
        }


        /**
         * Run saved search to get transaction lines using transaction IDs
         *
         * @param {Array} transIDs Array of transaction IDs
         * @returns {Number} Count of transaction lines
         */
        TransactionDAO.prototype.getTransactionLineCount=function(transIDs) {
            this.searchId = 'customsearch_suitel10n_jp_lineitem_count';
            let searchObj = this.createSearch();

            if(transIDs && transIDs.length > 0){
                searchObj.filterExpression = searchObj.filterExpression.concat(['AND',
                    ['internalid', search.Operator.ANYOF, transIDs]]);
            }

            let total = 0;
            let iterator = this.getResultsIterator(searchObj);
            if (iterator.hasNext()) {
                let result = iterator.next();
                total = result.getValue({
                    name: 'formulatext',
                    summary: search.Summary.COUNT
                });
            }

            return total;
        }

        /**
         * Get transactions total net amount
         *
         * @param {Array} transIDs Array of Transaction IDs
         * @param {String} tranType Transaction type
         * @returns {Number} Total sales amount
         */
        TransactionDAO.prototype.getTotalNet=function(transIDs, tranType) {

            if (transIDs.length > 0) {
                this.searchId = 'customsearch_suitel10n_jp_ids_trans_net';
                let searchObj = this.createSearch();
                searchObj.filterExpression = [
                    ['type', search.Operator.IS, tranType],
                    'AND',
                    ['mainline', search.Operator.IS, 'T']
                ];

                return this.getTotalFromSearch(searchObj, transIDs, 'netamountnotax');
            }
            return 0;
        };

        /**
         * Get transactions total tax amount
         *
         * @param {Array} transIDs Array of transaction IDs
         * @returns {Number} Total tax amount
         */
        TransactionDAO.prototype.getTotalTax=function(transIDs) {

            if (transIDs.length > 0) {
                this.searchId = 'customsearch_suitel10n_jp_ids_total_tax';
                let searchObj = this.createSearch();
                searchObj.filterExpression = [
                    ['type', search.Operator.ANYOF, ['CustInvc','CustCred']],
                    'AND',
                    ['mainline', search.Operator.IS, 'T']
                ];

                return this.getTotalFromSearch(searchObj, transIDs, 'formulanumeric');
            }
            return 0;

        };

        /**
         * Get total amount from search result
         *
         * @param (Object) searchObj Transaction search object to execute
         * @param {Array} transIDs Array of transaction IDs
         * @param String fieldId Field to get total amount for
         * @returns {Number} Total amount
         */
        TransactionDAO.prototype.getTotalFromSearch=function(searchObj, transIDs, fieldId){
            if(transIDs && transIDs.length > 0){
                searchObj.filterExpression = searchObj.filterExpression.concat(['AND',
                    ['internalid', search.Operator.ANYOF, transIDs]]);
            }

            let total = 0;
            let iterator = this.getResultsIterator(searchObj);
            if (iterator.hasNext()) {
                let result = iterator.next();
                let t = result.getValue({
                    name: fieldId,
                    summary: search.Summary.SUM
                });
                if (t) {
                    total = t;
                }
            }
            return total;
        };


        /**
         * Constructs the filter expression for searching payment transactoins
         *
         * @param {Boolean} hasIncludeCheckbox If true, adds a search filter for the Include in Invoice Summary checkbox
         * @returns {Array} Search filters array
         */
        TransactionDAO.prototype.getPaymentTransactionsFilter=function(hasIncludeCheckbox) {
            let mainlineFilter = ['mainline', search.Operator.IS, 'T'];
            let journalFilter = [
                ['type', search.Operator.IS, 'Journal'],
                'AND',
                ['status', search.Operator.ANYOF, ['Journal:B']],
                'AND',
                ['account.type', search.Operator.IS, 'AcctRec']
            ];
            let otherTransactionsFilter = [
                ['type', search.Operator.ANYOF, ['CustDep','CustPymt','TegRcvbl', 'CuTrSale']]
            ];
            let includeCheckboxFilter = ['AND', ['custbody_4392_includeids', search.Operator.IS, 'T']];

            if (hasIncludeCheckbox) {
                journalFilter = journalFilter.concat(includeCheckboxFilter);
                otherTransactionsFilter = otherTransactionsFilter.concat(includeCheckboxFilter);
            }

            return [
                mainlineFilter,
                'AND',
                [
                    journalFilter,
                    'OR',
                    otherTransactionsFilter,
                    'OR',
                    ['type', search.Operator.ANYOF, ['CustPymt']]
                ]
            ];
        }

        /**
         * Return common search filters and consolidation type settings for payment transactions
         *
         * @returns {Object} Search filters and settings
         */
        TransactionDAO.prototype.getPaymentSearchDefinition=function() {
            let filters = this.getPaymentTransactionsFilter(true);

            let settings = [];
            if (runtime.isFeatureInEffect({feature:'SUBSIDIARIES'}) &&
                runtime.isFeatureInEffect({feature: 'MULTICURRENCY'})) {
                settings = [
                    {name: 'consolidationtype', value: 'NONE'}
                ];
            }
            return {filters: filters, settings: settings};
        }


        /**
         * Get payment transactions given an array of Customer Internal IDs
         *
         * @param {Array} customers Array of customer internal IDs
         * @param {String} subsidiary Subsidiary ID
         * @returns {Object} Payments object containing customer payments
         */
        TransactionDAO.prototype.getPaymentsReceivedFromCustomers=function(customers, subsidiary) {

            let searchDefinition = this.getPaymentSearchDefinition();
            this.filters = [
                searchDefinition.filters,
                'AND',
                ['customer.internalid', search.Operator.ANYOF, customers]
            ];
            if (subsidiary !== '') {
                this.filters.push('AND');
                this.filters.push(['subsidiary', search.Operator.IS, subsidiary]);
            }

            this.columns = [
                {name: ENTITY_FIELD},
                {name: TRANDATE_FIELD},
                NET_AMOUNT_COL
            ];

            this.settings = searchDefinition.settings;

            let paymentsSearch = this.createSearch();
            let iterator = this.getResultsIterator(paymentsSearch);

            let paymentsObj = {};
            while (iterator.hasNext()){
                let result = iterator.next();
                let customerId = result.getValue(this.columns[0]);

                if (!paymentsObj.hasOwnProperty(customerId))
                {
                    paymentsObj[customerId] = {};
                    paymentsObj[customerId].id = customerId;
                    paymentsObj[customerId].payments = [];
                }

                paymentsObj[customerId].payments.push({
                    netAmount : result.getValue(this.columns[2]) || 0.0,
                    trandate : result.getValue(this.columns[1])
                });
            }

            return paymentsObj;
        }

        /**
         * Get search object for payments received during a given period
         * If payments parameter is supplied, filter will have and additional AND clause
         * for the provided transaction IDs.
         * If parameter is supplied but empty, will return a search filter without any matching transactions
         *
         * @param {Object} params Parameter Object
         * @param {String} params.entity Entity ID
         * @param {Date} params.startDate Start date
         * @param {Date} params.endDate End date
         * @param {String} params.subsidiary Subsidiary ID
         * @param {Array} params.payments Array of payment IDs
         * @returns {SearchObj} payments received search object
         */
        TransactionDAO.prototype.getPaymentsReceivedSearchObj=function(params) {
            let startDateString = format.format({
                value: params.startDate,
                type: format.Type.DATE
            });
            let endDateString = format.format({
                value: params.endDate,
                type: format.Type.DATE
            });

            let searchDefinition = this.getPaymentSearchDefinition();

            if (params.payments) {
                searchDefinition.filters = (params.payments.length > 0) ?
                    searchDefinition.filters = [this.getPaymentTransactionsFilter(false),
                        'AND', ['internalid', search.Operator.ANYOF, params.payments]]
                    : ['internalid', search.Operator.ANYOF, '@NONE@'];
            }

            this.filters = [
                searchDefinition.filters,
                'AND',
                ['trandate', search.Operator.WITHIN, [startDateString, endDateString]]
            ];
            this.filters = params.entities && params.entities.length > 1 ?
                this.filters.concat(['AND',['customer.internalid', search.Operator.ANYOF, params.entity]]) :
                this.filters = this.filters.concat(['AND',['customer.internalid', search.Operator.IS, params.entity]]);

            if (params.subsidiary && params.subsidiary !== '') {
                this.filters.push('AND',['subsidiary', search.Operator.IS, params.subsidiary]);
            }
            this.settings = searchDefinition.settings;

            return this.createSearch();
        };


        /**
         * Get breakdown of Payment Received amount during a given period
         *
         * @param {Object} params Parameter object
         * @param {String} params.entity Entity ID
         * @param {Date} params.startDate Start date
         * @param {Date} params.endDate End date
         * @param {Array} params.payments Collection of payment transaction IDs associated with the Invoice Summary
         * @param {String} params.subsidiary Subsidiary filter
         * @returns {Number} Total amount of payments received
         */
        TransactionDAO.prototype.getPaymentReceivedDuringPeriod=function(params) {
            let total = 0;
            let searchObj = this.getPaymentsReceivedSearchObj(params);
            searchObj.columns = [NET_AMOUNT_SUM];
            let iterator = this.getResultsIterator(searchObj);
            if (iterator.hasNext()) {
                let result = iterator.next();
                let netAmount = result.getValue(NET_AMOUNT_SUM);
                if(netAmount) {
                    total = netAmount;
                }
            }
            return total;
        };

        /**
         * Get breakdown of payments associated with an Invoice Summary
         *
         * @param {Object} params Parameter object
         * @param {String} params.entity Entity ID
         * @param {Date} params.startDate Start date
         * @param {Date} params.endDate End date
         * @param {Array} params.payments Collection of payment transaction IDs associated with the Invoice Summary
         * @returns {Object} Payments received related to the Invoice Summary broken down per transaction
         */
        TransactionDAO.prototype.getInvoiceSummaryPayments=function(params) {
            let searchObj = this.getPaymentsReceivedSearchObj(params);
            searchObj.columns = [
                {name: TRANDATE_FIELD, sort: search.Sort.ASC},
                {name: TRAN_NO_FIELD},
                {name: TRAN_ID_FIELD},
                {name: PAYMENT_DETAILS_FIELD},
                {name: EXCHANGE_RATE_FIELD},
                NET_AMOUNT_COL,
                FOREIGN_AMOUNT_COL
            ];
            if (runtime.isFeatureInEffect({feature:'MULTICURRENCY'})) {
                searchObj.columns.push(search.createColumn({name: CURRENCY_FIELD}));
            }
            let iterator = this.getResultsIterator(searchObj);
            let paymentDetails = [];
            while (iterator.hasNext()){
                let result = iterator.next();
                paymentDetails.push(result);
            }
            return paymentDetails;
        };

        /**
         * Get collection of payment transaction IDs to be associated with an Invoice Summary
         *
         * @param {Object} params Parameter object
         * @param {String} params.entity Entity ID
         * @param {Date} params.startDate Start date
         * @param {Date} params.endDate End date
         * @param {String} params.subsidiary Subsidiary ID
         * @returns {Array} Transaction IDs of payments received for a given period
         */
        TransactionDAO.prototype.getPaymentTransactionsThisPeriod=function(params) {
            let searchObj = this.getPaymentsReceivedSearchObj(params);
            searchObj.columns = [];
            let iterator = this.getResultsIterator(searchObj);
            let paymentIds = [];
            while (iterator.hasNext()){
                let result = iterator.next();
                paymentIds.push(result.id);
            }
            return paymentIds;
        };

        /**
         * Create filter expression containing ids of overdue invoices
         *
         * @param {String} filter expression array to retrieve all overdue invoices
         * @param {int} Closing day to narrow down invoices that match the closing date filter
         */
        TransactionDAO.prototype.getOverdueInvoicesFilterExpression=function(overdueFilterExpression, closingDateObj) {

            let overdueSearch = search.create({
                type : this.recordType,
                columns : ["custbody_suitel10n_inv_closing_date", "entity"]
            });
            log.debug("overdueFilterExpression", JSON.stringify(overdueFilterExpression));
            overdueSearch.filterExpression = overdueFilterExpression;

            let overdueIterator = this.getResultsIterator(overdueSearch);
            let overdueTransactionsObj = {};
            while(overdueIterator.hasNext()){
                let overdueTransaction = overdueIterator.next();
                let entity = overdueTransaction.getValue({name:"entity"});
                let txnClosingDate = overdueTransaction.getValue({name:"custbody_suitel10n_inv_closing_date"});
                let txnClosingDateObj = format.parse({value:txnClosingDate, type: format.Type.DATE});
                if((Object.keys(overdueTransactionsObj)).indexOf(entity) === -1){
                    overdueTransactionsObj[entity] = [];
                }
                overdueTransactionsObj[entity].push({
                    id : overdueTransaction.id,
                    closingDate : txnClosingDateObj
                });
            }

            let entities = Object.keys(overdueTransactionsObj);
            let termsOfMultipleEntities = entities.length > 0 ?
                new PaymentTermDAO().retrieveTermsOfMultipleEntities("custrecord_suitel10n_jp_pt_customer",
                    entities) : {};
            let overdueTransactions = this.matchTransactionClosingDatesToPaymentTerms(termsOfMultipleEntities,
                overdueTransactionsObj, closingDateObj);

            let newOverdueFilterExpression = [];
            if(overdueTransactions && overdueTransactions.length > 0) {
                newOverdueFilterExpression.push(["internalid", search.Operator.ANYOF, overdueTransactions]);
            }

            return newOverdueFilterExpression;
        };

        /** Overrides the parent executeSavedSearch if there's a requirement to do a second search,
         * this is done to avoid the search time out
         *
         * @param {params} filter expression array to retrieve all overdue invoices
         *                 if params.searchParams is present, a second search is performed and is mered with the first search
         * @returns {Array} Array objects of search results.
         */
        TransactionDAO.prototype.executeSavedSearch=function(params){
            let results = BaseDAO.prototype.executeSavedSearch.call(this,params); //call the parent.
            let finalResult = results;

            if(params.searchParams){
                //do a manual 'OR'
                let lookupTable = {};

                for(let n=0; n<results.length; n++) {
                    lookupTable[results[n].id] = results[n].id;
                }

                let failedIds = params.searchParams.filter((failedId)=>{
                    return (!lookupTable[failedId]);
                });

                if(!!failedIds[0]){
                    params.filterExpression = [["internalid", "anyof", failedIds], "AND", ["mainline", "is", "T"]];
                    delete params.searchParams; //remove the search param variable. avoid loop.
                    let secondRes = BaseDAO.prototype.executeSavedSearch.call(this,params);
                    finalResult = results.concat(secondRes);
                }
            }

            log.debug({title: "Final Search Result", details: JSON.stringify(finalResult)});
            return finalResult;
        }

        /**
         * Return transactions whose closing date matches payment term
         * based on a closing date filter
         *
         * @param {Object} Payment terms grouped by entity
         * @param {Object} Transactions grouped by entity
         * @returns {Date} Closing date object
         */
        TransactionDAO.prototype.matchTransactionClosingDatesToPaymentTerms=
            function(termsOfMultipleEntities, transactionsObj, closingDateObj){
            let paymentTermUtility = new PaymentTermUtility();
            let transactionList = [];
            let entities = Object.keys(transactionsObj);
            for(let i in entities){
                // Proceed only if the entity has payment terms
                if(termsOfMultipleEntities[entities[i]]){
                    let entityInfo = {terms:termsOfMultipleEntities[entities[i]]};
                    paymentTermUtility.setEntityDetails(entityInfo);
                    let closingDateFilterPaymentTerm = paymentTermUtility.getPaymentTerm(closingDateObj);
                    let transactions = transactionsObj[entities[i]];
                    // Proceed only if an entity payment term matches the closing date filter
                    if(closingDateFilterPaymentTerm.id){
                        for(let j in transactions){
                            let sourceTerm = paymentTermUtility.getPaymentTerm(transactions[j].closingDate);
                            if(closingDateFilterPaymentTerm.id === sourceTerm.id){
                                transactionList.push(transactions[j].id);
                            }
                        }
                    }
                }
            }
            return transactionList;
        }

        /**
         * Returns an object that can be serialized as OBJECT type in renderer.
         * details array will contain tax details retrieved via the saved search customsearch_suitel10n_jp_tax_detail
         *
         * @param options.isRec - Invoice Summary record
         * @returns {details: Array{name, rate, netamountnotax, taxamount}}
         */
        TransactionDAO.prototype.getTaxDetails=function(options){
            let returnObj = {details: []};
            let searchResults = this.executeSavedSearch({
                searchId: TAX_DETAIL_SEARCH_ID,
                filters: [{name:CUSTBODY_IS_REC, operator:search.Operator.IS, values:options.isRec}]
            });
            returnObj.details = this.parseTaxDetails(searchResults);
            return returnObj;
        }

    /**
     * Get date of invoice/s
     *
     * @param {Array} transIDs Array of invoice internal IDs
     * @param {number} itemID Object of filter values
     * @returns {date} date of invoice
     */

    TransactionDAO.prototype.getAppliedInvoiceDate=function(transIDs, itemID) {
        let srch = search.create({
            type : this.recordType,
            columns : [{ name: "trandate", sort: search.Sort.DESC }]
        });

        let filterExpr = [
            ["recordtype", "is", record.Type.INVOICE],
            "AND",
            ["item", "is", itemID]
        ];

        let attachedTransactions = [];
        if(transIDs && transIDs.length > 0) {
            attachedTransactions = ["internalid", search.Operator.ANYOF, transIDs];
        }

        srch.filterExpression = [attachedTransactions, "AND", filterExpr];

        let iterator = this.getResultsIterator(srch);
        let trandate;
        while(iterator.hasNext()){
            let result = iterator.next();
            trandate = result.getValue("trandate");
        }

        return trandate;
    }

    return TransactionDAO;

});
