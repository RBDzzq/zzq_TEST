/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    'N/record',
    'N/search',
    'N/runtime',
    'N/ui/serverWidget',
    './JP_TransactionServerSide',
    '../data/JP_SubsidiaryDAO'
],

 (
    record,
    search,
    runtime,
    serverWidget,
    TransactionServerSide,
    SubsidiaryDAO
) => {

    let CLOSING_DATE = "custbody_suitel10n_inv_closing_date";
    let SUBSIDIARY = "subsidiary";
    let INVOICE_SUMMARY = "custbody_suitel10n_jp_ids_rec";
    let INVOICE_SUMMARY_DATE = "custbody_suitel10n_jp_ids_date";
    let INCLUDE_INVOICE_SUMMARY = "custbody_4392_includeids";
    let INVOICE_SUMMARY_NUMBER_DEPRECATED = "custbody_5185_idsnumber";
    let INVOICE_SUMMARY_LINK_DEPRECATED = "custbody_5185_idslink";

    function SalesTransactionServerSide(){
            TransactionServerSide.call(this);
        }

        util.extend(SalesTransactionServerSide.prototype, TransactionServerSide.prototype);

        /**
         * Update other closing date field
         *
         * @param {Object} currentRecord Current record object
         * @param {Date} closingDate Closing date value
         */
        SalesTransactionServerSide.prototype.syncClosingDate=function(currentRecord, closingDate){
            let otherClosingDateField = this.dateFields.closingDate === CLOSING_DATE ? INVOICE_SUMMARY_DATE : CLOSING_DATE;
            currentRecord.setValue({
                fieldId: otherClosingDateField,
                value: closingDate,
                ignoreFieldChange: true
            });
        };

        /**
         * Get Record type of created from
         *
         * @param {Number} id Transaction ID
         */
        SalesTransactionServerSide.prototype.getCreatedFromType=function(id) {
            let tranLookup = search.lookupFields({
                type: search.Type.TRANSACTION,
                id: id,
                columns: ['recordtype']
            });
            return tranLookup.recordtype ? tranLookup.recordtype : '';
        };

        /**
         * Set Invoice Summary field values to blank
         *
         * @param {Object} currentRecord Current record object
         */
        SalesTransactionServerSide.prototype.clearInvoiceSummaryFields=function(currentRecord){
            currentRecord.setValue({fieldId: INVOICE_SUMMARY, value: ""});
            currentRecord.setValue({fieldId: INVOICE_SUMMARY_NUMBER_DEPRECATED, value: ""});
            currentRecord.setValue({fieldId: INVOICE_SUMMARY_LINK_DEPRECATED, value: ""});
            currentRecord.setValue({fieldId: this.dateFields.closingDate, value: ""});
            this.syncClosingDate(currentRecord, "");
        };

        /**
         * Handling for invoice summary transaction field
         *
         * NOTE: Inline List/Record fields doesn't hide when setting isDisplay=false in client script
         *
         * @param {Object} scriptContext
         */
        SalesTransactionServerSide.prototype.handleInvSummaryField=function(scriptContext){
            let currentRecord = scriptContext.newRecord;
            let tranSubsidiary = currentRecord.getValue({fieldId: SUBSIDIARY});
            let subsDao = new SubsidiaryDAO();
            let subCountry = subsDao.getSubsidiaryCountry(tranSubsidiary);
            let invSummaryField = scriptContext.form.getField({id:INVOICE_SUMMARY});
            invSummaryField.updateDisplayType({
                displayType: (subCountry === 'JP') ? serverWidget.FieldDisplayType.INLINE : serverWidget.FieldDisplayType.HIDDEN
            });
        };

        /**
         * Check if context is UI or transaction is not included in Invoice Summary
         *
         * @param {Object} scriptContext
         */
        SalesTransactionServerSide.prototype.isUIContextOrNotInInvoiceSummary=function(scriptContext) {
            let isUIContext = runtime.executionContext === runtime.ContextType.USER_INTERFACE;
            let includeInvoiceSummary = this.getFieldValue(INCLUDE_INVOICE_SUMMARY, scriptContext);

            return (isUIContext || !includeInvoiceSummary);
        };

        /**
         * Check if country ticker is JP
         *
         * @param {Object} scriptContext
         */
        SalesTransactionServerSide.prototype.isCountryNotJP=function(scriptContext){

            let tranSubsidiary = this.getFieldValue(SUBSIDIARY, scriptContext);
            let subsDao = new SubsidiaryDAO();
            let subCountry = subsDao.getSubsidiaryCountry(tranSubsidiary);

            return (subCountry != "JP");
        };


    return SalesTransactionServerSide;

});
