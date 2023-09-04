/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    './JP_ISGenerationFormFilterExpressionCreator',
    '../lib/JP_StringUtility',
    '../data/JP_TransactionDAO',
    '../data/JP_InvoiceSummaryBatchDAO',
    'N/url',
    'N/runtime'
], (
    FilterExpressionCreator,
    StringUtility,
    TransactionDAO,
    InvoiceSummaryBatchDAO,
    url,
    runtime) =>  {

    let AMOUNT = 'amount';
    let TYPE = 'type';
    let STATUS = 'statusref';
    let CURRENCY = 'currency';
    let DUEDATE = 'duedate';
    let CREATEDFROM = 'createdfrom';
    let TRANDATE = 'trandate';
    let MEMO = 'memo';
    let TRANNUM = 'transactionnumber';
    let FOREIGNAMOUNT = 'fxamount';
    let EXCHANGERATE = 'exchangerate';
    let IS_INDIVIDUAL = 'isperson';
    let COMPANY_NAME = 'companyname';
    let LAST_NAME = 'lastname';
    let FIRST_NAME = 'firstname';

    let params;


    function JP_ISDrilldownResultValuesHandler(p){
        this.name = 'JP_ISDrilldownResultValuesHandler';
        params = p;
    }

    /**
     * Search for transactions to be shown in the drilldown
     *
     * @returns {Array}
     */
    JP_ISDrilldownResultValuesHandler.prototype.getValues = ()=> {

        params.failedTransactions = getFailedTransactionsIDs();

        let expCreator = new FilterExpressionCreator();
        let filterExpression = expCreator.create(params);

        let paramsObj = {
            searchId: "customsearch_suitel10n_jp_ids_inv_search",
            filterExpression: filterExpression
        };

        log.debug({title: "Filter Expresssion ", details: JSON.stringify(filterExpression)});

        //separate search for the failed transactions.
        if (params.failedTransactions && params.failedTransactions.length > 0) {
            paramsObj.searchParams = params.failedTransactions;
        }

        log.debug({title: "Drilldown search params", details: JSON.stringify(paramsObj.searchParams)})

        let transDAO = new TransactionDAO();
        let searchResults = transDAO.executeSavedSearch(paramsObj);

        let sublistLines = [];

        util.each(searchResults, function(result) {
            let view = convertToView(result);
            sublistLines.push(view);
        });

    	return sublistLines;
    };


    /**
     * Get failed transaction IDs from errored batch
     * filtered by customer ID and transaction type
     *
     * @returns {Array} Array of internal IDs
     */
    function getFailedTransactionsIDs() {
        let transIDs;
        let customerID = params.custId;
        let tranType = params.type;

        let batchDAO = new InvoiceSummaryBatchDAO();
        let batch = batchDAO.getErroredBatch(params);
        if (batch.parameters) {
            let paramsObj = JSON.parse(batch.parameters);
            let failedTransactions = paramsObj.forGeneration;

            transIDs = [];
            util.each(failedTransactions, function(result) {
                if (customerID === result.entity && tranType === result.type) {
					transIDs.push(result.id);
                }
            });
        }

        if(transIDs) {
            transIDs = new TransactionDAO().filterFailedTransactions(transIDs, params);
        }

        return transIDs;
    }


    /**
     * Convert search result to view object compatible with
     * drilldown sublist expected format
     *
     * @param {Object} result Search result parameter
     * @returns {Object} Result view
     */
    function convertToView(result) {

        let view = {};

        let linkText = [result.getText(TYPE), ' #', result.getValue(TRANNUM)].join('');
        let stringUtil = new StringUtility(linkText);
        let tranURL = url.resolveRecord({
            recordType: result.recordType,
            recordId: result.id,
            isEditMode: true
        });
        let tranLink = stringUtil.generateHTMLLink({
            url: tranURL,
            target: '_blank'
        });
        let isPerson = result.getValue({name:IS_INDIVIDUAL,join:'customer'});
        if(isPerson){
            let last_name = result.getValue({name:LAST_NAME,join:'customer'});
            let first_name = result.getValue({name:FIRST_NAME,join:'customer'});
            view.custpage_customer_name = last_name + ', ' + first_name
        }else{
            view.custpage_customer_name = result.getValue({name:COMPANY_NAME,join:'customer'});
        }
        view.custpage_transactionnumber = tranLink;
        view.custpage_duedate = result.getValue(DUEDATE);
        view.custpage_createdfrom = result.getText(CREATEDFROM);
        view.custpage_trandate = result.getValue(TRANDATE);
        view.custpage_amount = result.getValue(AMOUNT);
        view.custpage_status = result.getText(STATUS);
        view.custpage_memo = result.getValue(MEMO);

        if (runtime.isFeatureInEffect('MULTICURRENCY')) {
            view.custpage_currency = result.getText(CURRENCY);
            view.custpage_exchangerate = result.getValue(EXCHANGERATE);
            view.custpage_foreignamount = result.getValue(FOREIGNAMOUNT);
        }

        return view;
    }


    return JP_ISDrilldownResultValuesHandler;

});
