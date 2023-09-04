/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
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
    '../../app/JP_SalesTransactionUI',
    '../../app/JP_CompInfoSUCaller',
    '../../lib/JP_StringUtility'
],

(
    JP_TransactionValidator,
    JP_PaymentTermUtility,
    JP_SalesTransactionUI,
    JP_CompInfoSUCaller,
    JP_StringUtility
    ) =>{

    let CLOSING_DATE_FIELD = "custbody_suitel10n_inv_closing_date";
    let INVOICE_SUMMARY_DATE_FIELD = "custbody_suitel10n_jp_ids_date";
    let SUBSIDIARY_FIELD = "subsidiary";
    let ENTITY_FIELD = "entity";
    let TRANDATE_FIELD = "trandate";
    let JP_COUNTRY = "JP";
    let INCLUDE_INVOICE_SUMMARY_FIELD = "custbody_4392_includeids";
    let INVOICE_SUMMARY_RECORD_FIELD = "custbody_suitel10n_jp_ids_rec";
    let DISPLAY_FIELD = true;
    let SALES_ORDER_CANCELLED = 'C';
    let SALES_ORDER_CLOSED = 'H';
    let ORDER_STATUS_FIELD = 'orderstatus';

    let oldEntity = '';
    let isClosingDateModified = false;

    class JP_SaleTransactionCS extends JP_SalesTransactionUI{

        constructor() {
            super();

            this.name = 'JP_SaleTransactionCS';
            this.dateFields = {closingDate:INVOICE_SUMMARY_DATE_FIELD, dueDate:''}
        }

        pageInit(scriptContext){
            try {
                let currentRecord = scriptContext.currentRecord;
                let orderStatus = currentRecord.getValue({fieldId:ORDER_STATUS_FIELD});
                if([SALES_ORDER_CLOSED, SALES_ORDER_CANCELLED].indexOf(orderStatus) === -1){
                    this.overrides[this.dateFields.closingDate] = !DISPLAY_FIELD;
                }

                let country = this.getSubsidiaryCountry(currentRecord);
                this.showHideFields(currentRecord, country.ticker);
                if(country.isNonJapanOrHasNoEntity) {
                    return;
                }
                oldEntity = country.entity;
                this.initObjectsAndFieldSettings({scriptContext:scriptContext,country:country.ticker});

            } catch (e) {
                log.error(e.name, e.message);
            }
        }


        fieldChanged(scriptContext){
            try {
                let currentRecord = scriptContext.currentRecord;
                let hasInvoiceSummary = currentRecord.getValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD}) ? true : false;
                let supportedFields = [SUBSIDIARY_FIELD, ENTITY_FIELD, TRANDATE_FIELD, this.dateFields.closingDate];
                let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                if(supportedFields.indexOf(scriptContext.fieldId) >= 0 && !hasInvoiceSummary) {
                    let includeInvoiceSummary = currentRecord.getValue({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD});
                    let tranDate = currentRecord.getValue({fieldId: TRANDATE_FIELD});
                    switch(scriptContext.fieldId){
                        case SUBSIDIARY_FIELD:
                        case ENTITY_FIELD:
                            let entity = currentRecord.getValue({fieldId: ENTITY_FIELD});
                            oldEntity = entity;
                            let country = JP_CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;
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
                                } else {
                                    // Handle entity/subsidiary change from JP to NON-JP when MSC is on
                                    currentRecord.setValue({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD, value: false});
                                    this.enableDisableTermsField(currentRecord);
                                }
                            } else {
                                // Handle entity/subsidiary change from JP to NON-JP when MSC is on
                                currentRecord.setValue({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD, value: false});
                                this.enableDisableTermsField(currentRecord);
                            }
                            break;
                        case this.dateFields.closingDate:
                            isClosingDateModified = true;
                            let closingDate = currentRecord.getValue({fieldId: this.dateFields.closingDate});
                            if(includeInvoiceSummary && closingDate){
                                this.paymentTerm = new JP_PaymentTermUtility(this.entityObj.entityInfo).getPaymentTerm(closingDate);
                                if (this.isValidPaymentTerm()) {
                                    this.syncClosingDate(currentRecord, closingDate, CLOSING_DATE_FIELD);
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
            } catch (e) {
                log.error(e.name, e.message);
            }
        };

        validateField(scriptContext){

            let isValid = true;

            try {

                if (scriptContext.fieldId === ENTITY_FIELD) {
                    isValid = this.validateEntityField({scriptContext:scriptContext,oldEntity:oldEntity});
                }

            } catch (e) {
                log.error(e.name, e.message);
            }

            return isValid;
        };


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
                    let invoiceSummary = currentRecord.getValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD});
                    let orderStatus = currentRecord.getValue({fieldId:ORDER_STATUS_FIELD});

                    let transactionValidator = new JP_TransactionValidator();

                    let closingDateEval = {isValid:true}
                    if(closingDate || isClosingDateModified){
                        closingDateEval = transactionValidator.validateClosingDate({
                            entityInfo: this.entityObj.entityInfo,
                            tranDate: tranDate,
                            closingDate: closingDate,
                            invoiceSummary: invoiceSummary,
                            recordType: currentRecord.type,
                            orderStatus: orderStatus
                        });
                    }

                    if (!closingDateEval.isValid) {

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

                        if ([closingDateEval.type].indexOf('FAILURE') > -1) {
                            alert(messageTextArray.join("\n\n"));
                            return false;
                        } else if ([closingDateEval.type].indexOf('WARNING') > -1) {
                            return confirm(messageTextArray.join("\n\n"));
                        }
                    }

                }

            } catch (e) {
                log.error(e.name, e.message);
            }

            return true;
        };
    }

    let transactionCS = new JP_SaleTransactionCS();

    return {
        pageInit: (scriptContext)=>{ return transactionCS.pageInit(scriptContext); },
        fieldChanged: (scriptContext)=>{ return transactionCS.fieldChanged(scriptContext); },
        saveRecord: (scriptContext)=>{ return transactionCS.saveRecord(scriptContext); },
        validateField: (scriptContext)=>{ return transactionCS.validateField(scriptContext); }
    };

});
