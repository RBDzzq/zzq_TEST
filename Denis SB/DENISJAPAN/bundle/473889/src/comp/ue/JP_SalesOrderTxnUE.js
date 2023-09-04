/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 */
define([
    "N/ui/serverWidget",
    "../../app/JP_PaymentTermUtility",
    "../../app/JP_DatesCalculator",
    "../../app/JP_TransactionValidator",
    "../../lib/JP_TCTranslator",
    "../../app/JP_SalesTransactionServerSide"
],

    (
        serverWidget,
        PaymentTermUtility,
        DatesCalculator,
        TransactionValidator,
        Translator,
        SalesTransactionServerSide
    ) => {

    let TRAN_DATE = "trandate";
    let ENTITY = "entity";
    let INVOICE_SUMMARY = "custbody_suitel10n_jp_ids_rec";
    let INVOICE_SUMMARY_DATE = "custbody_suitel10n_jp_ids_date";
    let CREATED_FROM = "createdfrom";
    let DISPLAY_FIELD = true;
    let SALES_ORDER_CANCELLED = 'C';
    let SALES_ORDER_CLOSED = 'H';
    let ORDER_STATUS = 'orderstatus';
    let SUPPORTED_EVENT_TYPES = ["create", "edit", "xedit"];

    function JP_SaleTransactionUE(){
        SalesTransactionServerSide.call(this);
        this.dateFields = {closingDate:INVOICE_SUMMARY_DATE, dueDate:''};
    }

    util.extend(JP_SaleTransactionUE.prototype, SalesTransactionServerSide.prototype);

        JP_SaleTransactionUE.prototype.beforeLoad=function(scriptContext){
            try {
                let eventType = scriptContext.type;
                let currentRecord = scriptContext.newRecord;
                let orderStatus = currentRecord.getValue({fieldId:ORDER_STATUS});

                if([SALES_ORDER_CLOSED, SALES_ORDER_CANCELLED].indexOf(orderStatus) === -1){
                    this.overrides[this.dateFields.closingDate] = !DISPLAY_FIELD;
                }

                switch(eventType){
                    case scriptContext.UserEventType.COPY:
                        this.clearInvoiceSummaryFields(currentRecord);
                        break;
                    case scriptContext.UserEventType.CREATE:
                        if(currentRecord.getValue({fieldId:CREATED_FROM})){
                            this.clearInvoiceSummaryFields(currentRecord);
                        }
                        break;
                    case scriptContext.UserEventType.VIEW:
                        this.showHideFields(scriptContext);
                        break;
                    case scriptContext.UserEventType.EDIT:
                        let closingDateField = scriptContext.form.getField({id:this.dateFields.closingDate});
                        closingDateField.updateDisplayType({displayType:serverWidget.FieldDisplayType.INLINE});
                        this.handleInvSummaryField(scriptContext);
                        break;
                    default:
                        break;
                }

            }
            catch (e) {
                log.error(e.name, e.message);
            }
        }


        JP_SaleTransactionUE.prototype.beforeSubmit=function(scriptContext) {

            let eventType = scriptContext.type;
            let currentRecord = scriptContext.newRecord;
            let entityValidation = {isValid: true};
            let closingDateValidation = {isValid: true};
            let transValidator;
            let exceptionMessages = [];
            let exceptionTypes = [];

            try{

                if (SUPPORTED_EVENT_TYPES.indexOf(eventType.toLowerCase()) == -1 ||
                    this.isUIContextOrNotInInvoiceSummary(scriptContext) ||
                    this.isCountryNotJP(scriptContext)) {
                    return;
                }

                let tranDate = this.getFieldValue(TRAN_DATE, scriptContext);
                let closingDate = this.getFieldValue(this.dateFields.closingDate, scriptContext);
                let invoiceSummary = this.getFieldValue(INVOICE_SUMMARY, scriptContext);
                let entityInfo = this.getEntityInfo(scriptContext);

                transValidator = new TransactionValidator();

                // Entity validation
                if ([scriptContext.UserEventType.EDIT, scriptContext.UserEventType.XEDIT].indexOf(scriptContext.type) >= 0) {
                    if (this.isFieldModified(ENTITY, scriptContext)) {
                        entityValidation = transValidator.validateEntity({
                            recordType: currentRecord.type,
                            invoiceSummary: invoiceSummary
                        });
                    }
                }

                if (this.isFieldModified(this.dateFields.closingDate, scriptContext)) {

                    let orderStatus = this.getFieldValue(ORDER_STATUS, scriptContext);
                    this.syncClosingDate(currentRecord, closingDate);
                    closingDateValidation = transValidator.validateClosingDate({
                        tranDate: tranDate,
                        closingDate: closingDate,
                        invoiceSummary:invoiceSummary,
                        recordType: currentRecord.type,
                        entityInfo: entityInfo,
                        orderStatus: orderStatus
                    });
                }

                let exceptions = transValidator.getSalesValidatorErrorMsgs(entityValidation, closingDateValidation);
                exceptionTypes = exceptions.types;
                exceptionMessages = exceptions.messages;

            }catch(e){
                log.error(e.name, e.message);
            }

            if ((exceptionMessages.length > 0) && (exceptionTypes.indexOf(transValidator.VALIDATION_TYPES.FAILURE) != -1)) {
                throw "JP_TRANSACTION_VALIDATION_ERROR: " + exceptionMessages.join(" ");
            }

        }

    let transactionUE = new JP_SaleTransactionUE();

    return {
        beforeLoad: (scriptContext) =>{ transactionUE.beforeLoad(scriptContext)},
        beforeSubmit: (scriptContext) =>{ transactionUE.beforeSubmit(scriptContext)}
    };

});
