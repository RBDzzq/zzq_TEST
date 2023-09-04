/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 */

define([
    '../../data/JP_TransactionDAO',
    'N/runtime',
    'N/search',
    'N/url',
    'N/https'
],

(
    JP_TransactionDAO,
    runtime,
    search,
    url,
    https
    ) => {

    let AMOUNT_FIELD = 'amount';
    let APPLY_FIELD = 'apply';
    let APPLY_SUBLIST = 'apply';
    let CREDIT_SUBLIST = 'credit';
    let APPLY_TO_INVOICE_SUMMARY_FIELD = 'custpage_suitel10n_jp_custpay_id';
    let AUTOAPPLY_FIELD = 'autoapply';
    let CUSTOMER_FIELD = 'customer';
    let INTERNALID_FIELD = 'internalid';
    let INVOICE_SUMMARY_FIELD = 'custbody_suitel10n_jp_ids_rec';
    let MAINLINE_FIELD = 'mainline';
    let NULL_VAL = '';
    let PAYMENT_FIELD = 'payment';
    let SUBSIDIARY = 'subsidiary';
    let APPLY_INVOICE_SUMMARY_FIELD = "custpage_suitel10n_jp_custpay_id";

    let APPLY_IS_REST_SCRIPT_ID = "customscript_cust_payment_apply_is_rs";
    let APPLY_IS_REST_DEPLOYMENT_ID = "customdeploy_cust_payment_apply_is_rs";

    const AR_DEB_ADJ_TRANSACTION = 'customsale_jp_loc_debit_bal_adj';
    const AR_CRED_ADJ_TRANSACTION = 'customsale_jp_loc_cred_bal_adj';

    function JP_CustomerPayment(){

        if (JP_CustomerPayment.Instance !== undefined) {
            return JP_CustomerPayment.Instance;
        }

        let _currentlySelectedLines = [];
        let _isAutoApplyOn = NULL_VAL;

        /**
         * Returns the transactions given an invoice summary
         *
         * @param {Int} invoiceSummary ID of the invoice summary to be looked up
         * @returns {Array} transactions array of invoices
         *
         */

        function getTransactions(invoiceSummary){
            if(invoiceSummary){
                let transactionDAO = new JP_TransactionDAO();
                transactionDAO.filters = [
                    [INVOICE_SUMMARY_FIELD, search.Operator.IS, invoiceSummary],
                    'AND',
                    [MAINLINE_FIELD, search.Operator.IS, 'T']
                ];
                let transactions = [];
                let invoiceSearch = transactionDAO.createSearch();
                let iterator = transactionDAO.getResultsIterator(invoiceSearch);
                while(iterator.hasNext()){
                    let invoice = iterator.next();
                    transactions.push({id:invoice.id, type:invoice.recordType});
                }
                return transactions;
            }else{
                return [];
            }
        }

        /**
         * Sets apply field from apply sublist rows to false
         * Clears the tracker of previously selected rows
         *
         * @param {Object} currentRecord record contained in UI
         *
         */

        function uncheckInvoicesFromPreviousInvoiceSummary(currentRecord){
            for(let i in _currentlySelectedLines){
                currentRecord.selectLine({
                    sublistId: _currentlySelectedLines[i].sublist,
                    line: _currentlySelectedLines[i].lineID
                });
                currentRecord.setCurrentSublistValue({
                    sublistId: _currentlySelectedLines[i].sublist,
                    fieldId: APPLY_FIELD,
                    value: false
                });
            }
            _currentlySelectedLines = [];
        }

        /**
         * Sets apply field from apply sublist rows to true
         * Tracks the currently selected rows
         *
         * @param {Object} currentRecord record contained in UI
         *
         */

        function checkTransactionsFromSelectedInvoiceSummary(currentRecord){
            let transaction = getTransactions(currentRecord.getValue({fieldId:APPLY_TO_INVOICE_SUMMARY_FIELD}));
            for(let i in transaction){
                let sublist;
                switch(transaction[i].type){
                    case AR_DEB_ADJ_TRANSACTION:
                    case search.Type.INVOICE :
                        sublist = APPLY_SUBLIST; break;
                    case AR_CRED_ADJ_TRANSACTION:
                    case search.Type.CREDIT_MEMO :
                        sublist = CREDIT_SUBLIST; break;
                    default: break;
                }
                if (sublist){
                    let lineNum = currentRecord.findSublistLineWithValue({
                        sublistId: sublist,
                        fieldId: INTERNALID_FIELD,
                        value: transaction[i].id
                    });
                    if(lineNum > -1){
                        _currentlySelectedLines.push({lineID: lineNum, sublist: sublist});
                        currentRecord.selectLine({sublistId:sublist, line:lineNum});
                        currentRecord.setCurrentSublistValue({sublistId:sublist, fieldId:APPLY_FIELD, value:true});
                    }
                }
            }
        }


        this.pageInit = (scriptContext)=>{
        	try {
                let currentRecord = scriptContext.currentRecord;
                _isAutoApplyOn = currentRecord.getValue({fieldId:AUTOAPPLY_FIELD});
                populateApplyISField(currentRecord);
            } catch (e) {
                log.error(e.name, e.message);
            }
        }

        this.fieldChanged = (scriptContext)=>{
            try {
                let currentRecord = scriptContext.currentRecord;
                let field = scriptContext.fieldId;
                switch(field){
                    case CUSTOMER_FIELD:
                    	populateApplyISField(currentRecord);
                        break;
                    case APPLY_TO_INVOICE_SUMMARY_FIELD:
                        uncheckInvoicesFromPreviousInvoiceSummary(currentRecord);
                        currentRecord.setValue({fieldId:PAYMENT_FIELD, value:NULL_VAL});
                        if(!_isAutoApplyOn){
                            checkTransactionsFromSelectedInvoiceSummary(currentRecord);
                        }
                        break;
                    case AUTOAPPLY_FIELD:
                        _isAutoApplyOn = currentRecord.getValue({fieldId:AUTOAPPLY_FIELD});
                        break;
                    case AMOUNT_FIELD:
                        if(currentRecord.getValue({fieldId:APPLY_TO_INVOICE_SUMMARY_FIELD})){
                            let lineNum = currentRecord.getCurrentSublistIndex({sublistId:APPLY_SUBLIST});
                            if(lineNum){
                                let currentLine = currentRecord.selectLine({sublistId:APPLY_SUBLIST, line:lineNum});
                                currentRecord.setValue({fieldId:PAYMENT_FIELD, value:NULL_VAL});
                                // Just toggle the apply field to avoid manual calculations
                                currentLine.setCurrentSublistValue({sublistId:APPLY_SUBLIST, fieldId:APPLY_FIELD, value:false});
                                currentLine.setCurrentSublistValue({sublistId:APPLY_SUBLIST, fieldId:APPLY_FIELD, value:true});
                            }
                        }
                        break;
                    case SUBSIDIARY:
                    	populateApplyISField(currentRecord);
                        break;
                    default:
                        break;
                }
            } catch (e) {
                log.error(e.name, e.message);
            }
        };

        /* Creates option values for Apply Invoice Summary dropdown field */
        function populateApplyISField(currentRecord){
	        let isValues = [];
	        let applyISField = currentRecord.getField({fieldId: APPLY_INVOICE_SUMMARY_FIELD});

	        /* Removal of existing values */
            removeFieldOptions(applyISField);
            let params = {
                "customer" : currentRecord.getValue({fieldId:CUSTOMER_FIELD})
            }

            if (runtime.isFeatureInEffect('SUBSIDIARIES')) {
            	params.subsidiary = currentRecord.getValue({fieldId:SUBSIDIARY});
            }

	        let rsURL = url.resolveScript({
	            scriptId: APPLY_IS_REST_SCRIPT_ID,
	            deploymentId: APPLY_IS_REST_DEPLOYMENT_ID,
	            params: params
	        });

	        /* Rest request */
            https.get.promise({
                url: rsURL
            }).then((response) => {
            	isValues = JSON.parse(response.body);

            	 /* Removal of existing values */
                removeFieldOptions(applyISField);

                /* Adding of new values */
                for(let i = 0; i < isValues.length; i++) {
                	applyISField.insertSelectOption({"value": isValues[i].value, "text": isValues[i].text})
            	}

            }).catch((err) => {
            	log.error("APPLY_IS_FIELD_ERROR", "Error: "+err);
            	removeFieldOptions(applyISField);
            });
        }

        function removeFieldOptions(field){
        	let optionVals = field.getSelectOptions();

            for(let i = 0; i < optionVals.length; i++) {
            	if (optionVals[i].value) field.removeSelectOption({"value": optionVals[i].value});
        	}
        }

        this.name = 'JP_CustomerPayment';
        JP_CustomerPayment.Instance = this;
        return JP_CustomerPayment.Instance;
    }

    return {
        pageInit : (scriptContext)=>{ return new JP_CustomerPayment().pageInit(scriptContext); },
        fieldChanged : (scriptContext)=>{ return new JP_CustomerPayment().fieldChanged(scriptContext); }
    };
});
