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
    '../../app/JP_PaymentTermUtility',
    '../../app/JP_DatesCalculator',
    '../../app/JP_DueDateAdjuster',
    '../../app/JP_TransactionUI',
    '../../app/JP_CompInfoSUCaller',
    '../../lib/JP_StringUtility',
    '../../data/JP_EntityDAO',
    '../../data/JP_TransactionDAO',
    'N/record',
    'N/search'
],

(
    JP_TransactionValidator,
    JP_PaymentTermUtility,
    JP_DatesCalculator,
    JP_DueDateAdjuster,
    JP_TransactionUI,
    JP_CompInfoSUCaller,
    JP_StringUtility,
    JP_EntityDAO,
    JP_TransactionDAO,
    record,
    search
    ) =>{

    let DUE_DATE_ADJ_NO_CHANGE = "3";
    let CLOSING_DATE_FIELD = "custbody_suitel10n_inv_closing_date";
    let INVOICE_SUMMARY_DATE_FIELD = "custbody_suitel10n_jp_ids_date";
    let INVOICE_SUMMARY_DUE_DATE_FIELD = "custbody_jp_invoice_summary_due_date";
    let SUBSIDIARY_FIELD = "subsidiary";
    let ENTITY_FIELD = "entity";
    let TRANDATE_FIELD = "trandate";
    let TRANSFORM_FIELD = "transform";
    let JP_COUNTRY = "JP";
    let INCLUDE_INVOICE_SUMMARY_FIELD = "custbody_4392_includeids";
    let INVOICE_SUMMARY_RECORD_FIELD = "custbody_suitel10n_jp_ids_rec";
    let INTERNAL_ID = "internalid";
    let ITEM_INVOICE_DATE_FIELD = "custcol_jp_inv_date";
    let APPLY_SUBLIST = "apply";

    let oldEntity = '';

    const ITEM = "item";

    class JP_SaleTransactionCS extends JP_TransactionUI{

        constructor() {
            super();
        }

        /**
         * Update other closing date field
         *
         * @param {Object} currentRecord Current record object
         * @param {Date} closingDate Closing date value
         */
        syncClosingDate(currentRecord, closingDate) {
            let otherClosingDateField = (currentRecord.type === record.Type.CREDIT_MEMO) ?
                CLOSING_DATE_FIELD : INVOICE_SUMMARY_DATE_FIELD;
            currentRecord.setValue({
                fieldId: otherClosingDateField,
                value: closingDate,
                ignoreFieldChange: true
            });
        }


        /**
         * Set closing date fields to blank
         *
         * @param {Object} current record Current record object
         */

        clearClosingDateFields(currentRecord){
            currentRecord.setValue({fieldId: this.dateFields.closingDate, value: '', ignoreFieldChange: true});
            this.syncClosingDate(currentRecord, '');
        }


        /**
         * Set initial values of Invoice Summary related fields
         *
         * @param {Object} currentRecord Current record object
         * @param {String} mode Client script mode
         * @param {Object} entityObj Entity object
         */
        setInitialValues(currentRecord, mode){
            if(this.entityObj.isJPEntityWithTerms){

                let isTransform = currentRecord.getValue({fieldId: TRANSFORM_FIELD});
                if (isTransform) {
                    currentRecord.setValue({
                        fieldId: INCLUDE_INVOICE_SUMMARY_FIELD,
                        value: this.entityObj.entityInfo.useInvoiceSummary
                    });
                    if(!this.entityObj.entityInfo.useInvoiceSummary){
                        currentRecord.setValue({
                            fieldId: INVOICE_SUMMARY_DATE_FIELD,
                            value: ''
                        });
                    }
                } else if (mode === 'edit') {
                    let invoiceSummary = currentRecord.getValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD});
                    let includeISField = currentRecord.getField({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD});
                    if (includeISField) {
                        includeISField.isDisabled = (invoiceSummary) ? true : false;
                    }
                } else if (mode === 'copy') {
                    currentRecord.setValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD,value:''});
                }
            }
        }


        /**
         * Set closing date depending based on payment term
         *
         * @param {Object} currentRecord Current record object
         * @param {Date} tranDate Transaction date
         */
        setClosingDate(currentRecord, tranDate){
            let datesCalculator = new JP_DatesCalculator(this.paymentTerm);
            let closingDate = datesCalculator.calculateClosingDate(tranDate);
            new JP_TransactionUI().setClosingDate.call(this, currentRecord, tranDate, closingDate);

            this.syncClosingDate(currentRecord, closingDate);
        }


        /**
         * Set due date to computed value based on due date and adjustments
         *
         * @param {Object} currentRecord Current record object
         * @param {Date} closingDate Closing date
         */
        setDueDate(currentRecord, closingDate){
            let datesCalculator = new JP_DatesCalculator(this.paymentTerm);
            let dueDate = datesCalculator.calculateDueDate(closingDate);
            let adjustmentValue = this.entityObj.entityInfo.dueDateAdj;
            if (adjustmentValue !== DUE_DATE_ADJ_NO_CHANGE) { // Not equal to 'No Change'
                let dueDateAdjuster = new JP_DueDateAdjuster();
                let tranSubsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                dueDate = dueDateAdjuster.doAdjustment(dueDate, tranSubsidiary, adjustmentValue);
            }

            currentRecord.setValue({
                fieldId: this.dateFields.dueDate,
                value: dueDate
            });
        }

        pageInit(scriptContext){

            try {
                let mode = scriptContext.mode;
                let currentRecord = scriptContext.currentRecord;

                if (currentRecord.type === record.Type.CREDIT_MEMO) {
                    this.dateFields = {
                        closingDate: INVOICE_SUMMARY_DATE_FIELD,
                        dueDate: INVOICE_SUMMARY_DUE_DATE_FIELD
                    };
                }

                let entity = currentRecord.getValue({fieldId: ENTITY_FIELD});
                let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                let country = JP_CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;

                this.showHideFields(currentRecord, country);

                if(!entity || country != JP_COUNTRY) {
                    return;
                }
                oldEntity = entity;
                this.loadMessageObject(currentRecord.type);
                this.setPaymentTermsFromJPEntity(currentRecord, country);
                this.setInitialValues(currentRecord, mode);
                this.enableDisableTermsField(currentRecord);

                let hasInvoiceSummary = currentRecord.getValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD}) ? true : false;
                let includeInvoiceSummary = currentRecord.getValue({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD});
                let ent = new JP_EntityDAO({type: search.Type.CUSTOMER})
                    .retrieveEntityById(currentRecord.getValue({fieldId: 'entity'}));
                if (mode !== 'edit' && !hasInvoiceSummary && (includeInvoiceSummary || ent.computeDueDate) ) {
                    let paymentTermUtility = new JP_PaymentTermUtility(this.entityObj.entityInfo);
                    let tranDate = currentRecord.getValue({fieldId: TRANDATE_FIELD});
                    this.paymentTerm = paymentTermUtility.getNextTerm(tranDate);
                    if (this.isValidPaymentTerm()) {
                        this.setClosingDate(currentRecord, tranDate);
                    }
                }

            } catch (e) {
                log.error(e.name, e.message);
            }

        }

        fieldChanged(scriptContext){
            try {
                let supportedFields = [SUBSIDIARY_FIELD, ENTITY_FIELD, TRANDATE_FIELD,
                    this.dateFields.closingDate, ITEM];

                if(supportedFields.indexOf(scriptContext.fieldId) >= 0){
                    let currentRecord = scriptContext.currentRecord;
                    let hasInvoiceSummary = currentRecord.getValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD}) ? true : false;
                    let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                    let entDao = new JP_EntityDAO({type: search.Type.CUSTOMER});
                    let ent;
                    if(!hasInvoiceSummary) {
                        let includeInvoiceSummary = currentRecord.getValue({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD});
                        let tranDate = currentRecord.getValue({fieldId: TRANDATE_FIELD});
                        switch(scriptContext.fieldId){
                            case SUBSIDIARY_FIELD:
                            case ENTITY_FIELD:
                                let entity = currentRecord.getValue({fieldId: ENTITY_FIELD});
                                oldEntity = entity;
                                let country = JP_CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;

                                this.clearClosingDateFields(currentRecord);
                                this.showHideFields(currentRecord, country);
                                this.loadMessageObject(currentRecord.type);
                                this.enableDisableTermsField(currentRecord);
                                if(country === JP_COUNTRY){
                                    this.setPaymentTermsFromJPEntity(currentRecord, country);
                                    if (this.entityObj.entityInfo.hasOwnProperty('useInvoiceSummary') &&
                                        this.entityObj.entityInfo.useInvoiceSummary) {
                                        // Core sourcing of Use in Invoice Summary field happens on entity field change
                                        // Update the field manually when country reference is subsidiary
                                        if (scriptContext.fieldId === SUBSIDIARY_FIELD) {
                                            currentRecord.setValue({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD, value: true});
                                            this.enableDisableTermsField(currentRecord);
                                        }
                                        this.paymentTerm = new JP_PaymentTermUtility(this.entityObj.entityInfo).getNextTerm(tranDate);
                                        if (this.isValidPaymentTerm()) {
                                            this.setClosingDate(currentRecord, tranDate);
                                        }
                                    } else if (scriptContext.fieldId === SUBSIDIARY_FIELD) {
                                        // Handle entity/subsidiary change from JP to NON-JP when MSC is on
                                        currentRecord.setValue({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD, value: false});
                                        this.enableDisableTermsField(currentRecord);
                                    }
                                } else if (scriptContext.fieldId === SUBSIDIARY_FIELD) {
                                    // Handle entity/subsidiary change from JP to NON-JP when MSC is on
                                    currentRecord.setValue({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD, value: false});
                                    this.enableDisableTermsField(currentRecord);
                                }
                                break;
                            case TRANDATE_FIELD:
                                ent = entDao.retrieveEntityById(currentRecord.getValue({fieldId: 'entity'}));
                                if( (includeInvoiceSummary || ent.computeDueDate) && tranDate){
                                    this.paymentTerm = new JP_PaymentTermUtility(this.entityObj.entityInfo).getNextTerm(tranDate);
                                    if (this.isValidPaymentTerm()) {
                                        this.setClosingDate(currentRecord, tranDate);
                                    }
                                }
                                break;
                            case this.dateFields.closingDate:
                                ent = entDao.retrieveEntityById(currentRecord.getValue({fieldId: 'entity'}));
                                let closingDate = currentRecord.getValue({fieldId: this.dateFields.closingDate});

                                if( (includeInvoiceSummary || ent.computeDueDate) && closingDate){
                                    this.paymentTerm = new JP_PaymentTermUtility(this.entityObj.entityInfo).getPaymentTerm(closingDate);
                                    if (this.isValidPaymentTerm()) {
                                        this.syncClosingDate(currentRecord, closingDate);
                                        this.setDueDate(currentRecord, closingDate);
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    }

                    if (currentRecord.type === record.Type.CREDIT_MEMO) {
                        if ( scriptContext.fieldId === ITEM ){
                            let applyCount = currentRecord.getLineCount({sublistId: APPLY_SUBLIST});
                            let itemID = currentRecord.getCurrentSublistValue({sublistId:ITEM, fieldId: ITEM});
                            let transID = [];
                            let id;
                            let invDate;

                            for (let i = 0; i < applyCount; i++) {
                                id = currentRecord.getSublistValue({
                                    sublistId: APPLY_SUBLIST,
                                    fieldId: INTERNAL_ID,
                                    line: i
                                });
                                transID.push(id);
                            }

                            if (transID.length != 0) {
                                invDate = new JP_TransactionDAO().getAppliedInvoiceDate(transID,itemID);
                            }

                            if (!invDate) {
                                invDate = currentRecord.getValue({fieldId: TRANDATE_FIELD});
                            }

                            currentRecord.setCurrentSublistValue({
                                sublistId: ITEM,
                                fieldId: ITEM_INVOICE_DATE_FIELD,
                                value: new Date(invDate)
                            });
                        }
                    }
                }

            } catch (e) {
                log.error(e.name, e.message);
            }
        }


        validateField(scriptContext){

            let isValid = true;
            try {

                let currentRecord = scriptContext.currentRecord;

                if (scriptContext.fieldId === ENTITY_FIELD) {

                    this.loadMessageObject(currentRecord.type);

                    let invoiceSummary = currentRecord.getValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD});

                    let transactionValidator = new JP_TransactionValidator();
                    let entityEval = transactionValidator.validateEntity({
                        invoiceSummary: invoiceSummary,
                        recordType: currentRecord.type
                    });

                    isValid = (entityEval.isValid) ? true : false;

                    if (!entityEval.isValid) {

                        let message = this.messages[entityEval.messageCode];
                        if (entityEval.parameters) {
                            let stringUtil = new JP_StringUtility(message);
                            message = stringUtil.replaceParameters(entityEval.parameters);
                        }
                        alert(message);
                        currentRecord.setValue({fieldId: ENTITY_FIELD, value: oldEntity, ignoreFieldChange: true});
                    }

                }

            } catch (e) {
                log.error(e.name, e.message);
            }

            return isValid;
        }


        saveRecord(scriptContext){
            try {

                let currentRecord = scriptContext.currentRecord;
                let messageTextArray = [];
                let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                let country = JP_CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;
                let includeInvoiceSummary = currentRecord.getValue({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD});

                if (country === JP_COUNTRY && includeInvoiceSummary) {
                    this.loadMessageObject(currentRecord.type);

                    let tranDate = currentRecord.getValue({fieldId: TRANDATE_FIELD});
                    let closingDate = currentRecord.getValue({fieldId: this.dateFields.closingDate});
                    let dueDate = currentRecord.getValue({fieldId: this.dateFields.dueDate});
                    let invoiceSummary = currentRecord.getValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD});

                    let transactionValidator = new JP_TransactionValidator();

                    let closingDateEval = transactionValidator.validateClosingDate({
                        entityInfo: this.entityObj.entityInfo,
                        tranDate: tranDate,
                        closingDate: closingDate,
                        invoiceSummary: invoiceSummary,
                        recordType: currentRecord.type
                    });

                    let useHolidayChecking = this.getHolidayChecking(subsidiary);

                    let dueDateEval = transactionValidator.validateDueDate({
                        useHolidayChecking: useHolidayChecking,
                        tranDate: tranDate,
                        dueDate: dueDate,
                        recordType: currentRecord.type,
                        tranSubsidiary: subsidiary
                    });

                    let valid = closingDateEval.isValid && dueDateEval.isValid;
                    if (!valid) {

                        let message = '';
                        let stringUtil;

                        if (!closingDateEval.isValid) {
                            message = this.messages[closingDateEval.messageCode];
                            if (closingDateEval.parameters) {
                                stringUtil = new JP_StringUtility(message);
                                message = stringUtil.replaceParameters(closingDateEval.parameters);
                            }
                            messageTextArray.push(message);
                        }

                        if (!dueDateEval.isValid) {
                            message = this.messages[dueDateEval.messageCode];
                            if (dueDateEval.parameters) {
                                stringUtil = new JP_StringUtility(message);
                                message = stringUtil.replaceParameters(dueDateEval.parameters);
                            }
                            messageTextArray.push(message);
                        }

                        if ([closingDateEval.type, dueDateEval.type].indexOf('FAILURE') > -1) {
                            alert(messageTextArray.join("\n\n"));
                            return false;
                        } else if ([closingDateEval.type, dueDateEval.type].indexOf('WARNING') > -1) {
                            return confirm(messageTextArray.join("\n\n"));
                        }
                    }

                }

                return true;

            } catch (e) {
                log.error(e.name, e.message);
            }
        }

    }

    let jpSaleTransCS = new JP_SaleTransactionCS();

    return {
        pageInit: (scriptContext)=>{ return jpSaleTransCS.pageInit(scriptContext); },
        fieldChanged: (scriptContext)=>{ return jpSaleTransCS.fieldChanged(scriptContext); },
        saveRecord: (scriptContext)=>{ return jpSaleTransCS.saveRecord(scriptContext); },
        validateField: (scriptContext)=>{ return jpSaleTransCS.validateField(scriptContext); }
    };

});
