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
    '../../app/JP_TransactionValidator',
    '../../lib/JP_StringUtility',
    '../../app/JP_TransactionUI',
    '../../app/JP_CompInfoSUCaller',
    '../../app/JP_TaxRegNumValidator',
    '../../app/JP_DeductibleTaxCalculator'
],

(
    JP_TransactionValidator,
    JP_StringUtility,
    JP_TransactionUI,
    JP_CompInfoSUCaller,
    JP_TaxRegNumValidator,
    JP_DeductibleTaxCalculator) =>{

    let DUE_DATE_FIELD = "duedate";
    let SUBSIDIARY_FIELD = "subsidiary";
    let ENTITY_FIELD = "entity";
    let TRANDATE_FIELD = "trandate";
    let JP_COUNTRY = "JP";

    class JP_TransactionCS extends JP_TransactionUI{

        pageInit(scriptContext){
            try {
                let currentRecord = scriptContext.currentRecord;
                let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                let country = JP_CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;
                this.setPaymentTermsFromJPEntity(currentRecord, country);

                if(scriptContext.mode !== 'edit'){
                    this.setDateFieldValues(currentRecord);
                }
                this.enableDisableTermsField(currentRecord);
                this.showHideFields(currentRecord, country);
                this.setTaxExemptEntity(currentRecord, country);
            } catch (e) {
                log.error(e.name, e.message);
            }
        };

        fieldChanged(scriptContext){
            try {
                let currentRecord = scriptContext.currentRecord;
                if([ENTITY_FIELD, TRANDATE_FIELD, SUBSIDIARY_FIELD].indexOf(scriptContext.fieldId) >= 0) {
                    if (scriptContext.fieldId !== TRANDATE_FIELD) {
                        let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD})
                        let country = JP_CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;
                        this.setPaymentTermsFromJPEntity(currentRecord, country);
                        this.enableDisableTermsField(currentRecord);
                        this.showHideFields(currentRecord, country);
                        this.setTaxExemptEntity(currentRecord, country);
                    }
                    this.setDateFieldValues(currentRecord);
                }
            } catch (e) {
                log.error(e.name, e.message);
            }
        };

        saveRecord(scriptContext){
            try {

                let currentRecord = scriptContext.currentRecord;
                this.loadMessageObject(currentRecord.type);
                this.setPaymentTermsFromJPEntity(currentRecord);

                if (!new JP_TaxRegNumValidator().validateTaxRegNumUI(currentRecord)){
                    return false;
                }

                if(this.entityObj.isJPEntityWithTerms){

                    let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                    let useHolidayChecking = this.getHolidayChecking(subsidiary);
                    let validation = new JP_TransactionValidator().validateDueDate({
                        useHolidayChecking: useHolidayChecking,
                        tranDate: currentRecord.getValue({fieldId: TRANDATE_FIELD}),
                        dueDate: currentRecord.getValue({fieldId: DUE_DATE_FIELD}),
                        recordType: currentRecord.type,
                        tranSubsidiary: subsidiary
                    });

                    if(!validation.isValid){

                        let message = '';
                        if (validation.messageCode) {
                            message = this.messages[validation.messageCode];
                            if (validation.parameters) {
                                let stringUtil= new JP_StringUtility(message);
                                message = stringUtil.replaceParameters(validation.parameters);
                            }
                        }

                        switch(validation.type){
                            case 'FAILURE':
                                alert(message);
                                return false;
                            case 'WARNING':
                                return confirm(message);
                            default:
                                return true;
                        }
                    }
                }

                return true;

            } catch (e) {
                log.error(e.name, e.message);
            }
        };

        validateLine(scriptContext){
            try {
                let currentRecord = scriptContext.currentRecord;
                let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                let country = JP_CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;
                if(country === JP_COUNTRY && (scriptContext.sublistId === 'item' ||
                    scriptContext.sublistId === "expense")) {
                    let sublistId = scriptContext.sublistId;
                    new JP_DeductibleTaxCalculator().calculateTaxDeductible(currentRecord,sublistId);
                }

                return true;

            } catch (e) {
                log.error(e.name, e.message);
            }
        };
    }

    let transactionCS = new JP_TransactionCS();

    return {
        pageInit: (scriptContext)=>{ return transactionCS.pageInit(scriptContext); },
        fieldChanged: (scriptContext)=>{ return transactionCS.fieldChanged(scriptContext); },
        saveRecord: (scriptContext)=>{ return transactionCS.saveRecord(scriptContext); },
        validateLine: (scriptContext)=>{ return transactionCS.validateLine(scriptContext); }
    };

});
