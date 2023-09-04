/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 */
define([
    "N/runtime",
    "N/record",
    "N/ui/serverWidget",
    "N/search",
    "../../data/JP_SubsidiaryDAO",
    "../../data/JP_CompanyDAO",
    "../../app/JP_PaymentTermUtility",
    "../../app/JP_DateAutoCalculationEvaluator",
    "../../app/JP_DatesCalculator",
    "../../app/JP_DueDateAdjuster",
    "../../app/JP_TransactionValidator",
    "../../lib/JP_TCTranslator",
    "../../lib/JP_StringUtility",
    "../../app/JP_TransactionServerSide",
    "../../data/JP_EntityDAO",
    "../../data/JP_TransactionDAO",
],
    (
        runtime,
        record,
        serverWidget,
        search,
        SubsidiaryDAO,
        CompanyDAO,
        PaymentTermUtility,
        AutoCalculationEvaluator,
        DatesCalculator,
        DueDateAdjuster,
        TransactionValidator,
        Translator,
        StringUtility,
        TransactionServerSide,
        JP_EntityDAO,
        TransactionDAO
    ) =>{

    let TRAN_DATE = "trandate";
    let CLOSING_DATE = "custbody_suitel10n_inv_closing_date";
    let ENTITY = "entity";
    let DUE_DATE_ADJ_NO_CHANGE = "3";
    let SUBSIDIARY = "subsidiary";
    let INVOICE_SUMMARY = "custbody_suitel10n_jp_ids_rec";
    let INVOICE_SUMMARY_DATE = "custbody_suitel10n_jp_ids_date";
    let INVOICE_SUMMARY_DUE_DATE = "custbody_jp_invoice_summary_due_date";
    let INCLUDE_INVOICE_SUMMARY = "custbody_4392_includeids";
    let BANK_ACCT = "custbody_jp_bank_acct_info";
    let CREATED_FROM = "createdfrom";
    let INVOICE_SUMMARY_NUMBER_DEPRECATED = "custbody_5185_idsnumber";
    let INVOICE_SUMMARY_LINK_DEPRECATED = "custbody_5185_idslink";
    let CREATED_FROM_FIELD = "createdfrom";
    let ITEM_SUBLIST = "item";
    let APPLY_SUBLIST = "apply";
    let APPLY_DATE = "applydate";
    let INVOICE_DATE = 'custcol_jp_inv_date';

    let SUPPORTED_EVENT_TYPES = ["create", "edit", "xedit"];


    class JP_SaleTransactionUE extends TransactionServerSide{

        /**
         * Update other closing date field
         *
         * @param {Object} currentRecord Current record object
         * @param {Date} closingDate Closing date value
         */
         syncClosingDate(currentRecord, closingDate) {
            let otherClosingDateField = (currentRecord.type === record.Type.CREDIT_MEMO) ? CLOSING_DATE : INVOICE_SUMMARY_DATE;
            currentRecord.setValue({
                fieldId: otherClosingDateField,
                value: closingDate,
                ignoreFieldChange: true
            });
        }

        /**
         * Get Record type of created from
         *
         * @param {Number} id Transaction ID
         */
         getCreatedFromType(id) {
            let tranLookup = search.lookupFields({
                type: search.Type.TRANSACTION,
                id: id,
                columns: ['recordtype']
            });
            return tranLookup.recordtype ? tranLookup.recordtype : '';
        }

        /**
         * Set Invoice Summary field values to blank
         *
         * @param {Object} currentRecord Current record object
         */
        clearInvoiceSummaryFields(currentRecord){
            let entDao = new JP_EntityDAO();
            currentRecord.setValue({fieldId: INVOICE_SUMMARY, value: ""});
            currentRecord.setValue({fieldId: INVOICE_SUMMARY_NUMBER_DEPRECATED, value: ""});
            currentRecord.setValue({fieldId: INVOICE_SUMMARY_LINK_DEPRECATED, value: ""});
            currentRecord.setValue({fieldId: this.dateFields.closingDate, value: ""});
            this.syncClosingDate(currentRecord, "");
            let compDueDate = currentRecord.getValue({fieldId: entDao.fields.computeDueDate});

            if(compDueDate){
                currentRecord.setValue({fieldId: this.dateFields.dueDate, value: ""});
            }
        }

        /**
         * Set closing date and due date fields depending on record type
         *
         * @param {String} recordType Record type
         */
        setDateFields(recordType) {
            if (recordType === record.Type.CREDIT_MEMO) {
                this.dateFields.closingDate = INVOICE_SUMMARY_DATE;
                this.dateFields.dueDate = INVOICE_SUMMARY_DUE_DATE;
            }
        }

        /**
         * Handling for bank account field
         *
         * @param {Object} scriptContext
         */
        handleBankAccountField(scriptContext) {
            let currentRecord = scriptContext.newRecord;
            if (currentRecord.type === record.Type.CREDIT_MEMO) {
                let createdFromTransaction = (currentRecord.getValue({fieldId:CREATED_FROM})) ?
                    this.getCreatedFromType(currentRecord.getValue({fieldId:CREATED_FROM})) : '';
                let bankAcctField = scriptContext.form.getField({id:BANK_ACCT});
                bankAcctField.updateDisplayType({
                    displayType: (createdFromTransaction === record.Type.INVOICE) ?
                        serverWidget.FieldDisplayType.INLINE : serverWidget.FieldDisplayType.HIDDEN
                });
            }
        }


        /**
         * Handling for invoice summary transaction field
         *
         * NOTE: Inline List/Record fields doesn't hide when setting isDisplay=false in client script
         *
         * @param {Object} scriptContext
         */
        handleInvSummaryField(scriptContext) {
            let currentRecord = scriptContext.newRecord;
            let tranSubsidiary = currentRecord.getValue({fieldId: SUBSIDIARY});
            let subsDao = new SubsidiaryDAO();
            let subCountry = subsDao.getSubsidiaryCountry(tranSubsidiary);
            let invSummaryField = scriptContext.form.getField({id:INVOICE_SUMMARY});
            invSummaryField.updateDisplayType({
                displayType: (subCountry === 'JP') ? serverWidget.FieldDisplayType.INLINE :
                    serverWidget.FieldDisplayType.HIDDEN
            });
        }

        /**
         * Set invoice date in Credit Memo item sublist
         *
         * @param {Object} scriptContext
         */
        setInvoiceDate(scriptContext) {
            let currentRecord = scriptContext.newRecord;
            let invoice = currentRecord.getValue({fieldId: CREATED_FROM_FIELD});
            let invoiceDate;

            if (currentRecord.type === record.Type.CREDIT_MEMO) {
                if (!!invoice){
                    let invoiceRecord = record.load({
                        type: record.Type.INVOICE,
                        id: invoice
                    });
                    invoiceDate = invoiceRecord.getValue({fieldId: TRAN_DATE});
                }

                let itemLineCount = currentRecord.getLineCount(ITEM_SUBLIST);
                for (let i = 0; i < itemLineCount; i++) {
                    currentRecord.setSublistValue({
                        sublistId: ITEM_SUBLIST,
                        fieldId: INVOICE_DATE,
                        line: i,
                        value: invoiceDate
                    });
                }
            }
        }

        beforeLoad(scriptContext){
            try {

                let eventType = scriptContext.type;
                let currentRecord = scriptContext.newRecord;
                this.setDateFields(currentRecord.type);
                let tranSubsidiary = currentRecord.getValue({fieldId: SUBSIDIARY});
                let subsDao = new SubsidiaryDAO();
                let subCountry = subsDao.getSubsidiaryCountry(tranSubsidiary);
                if (currentRecord.type === record.Type.CREDIT_MEMO && subCountry !== "JP") {
                    let invDateCol = scriptContext.form.getSublist({id: ITEM_SUBLIST}).getField({id: INVOICE_DATE});
                    invDateCol.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                    invDateCol.isMandatory = false;
                }

                switch(eventType){
                    case scriptContext.UserEventType.COPY:
                        this.clearInvoiceSummaryFields(currentRecord);
                        break;
                    case scriptContext.UserEventType.CREATE:
                        if(currentRecord.getValue({fieldId:CREATED_FROM})){
                            this.clearInvoiceSummaryFields(currentRecord);
                        }
                        this.handleBankAccountField(scriptContext);
                        this.setInvoiceDate(scriptContext);
                        break;
                    case scriptContext.UserEventType.VIEW:
                        this.showHideFields(scriptContext);
                        this.handleBankAccountField(scriptContext);
                        break;
                    case scriptContext.UserEventType.EDIT:
                        if(currentRecord.getValue({fieldId:INVOICE_SUMMARY})){
                            let invSumDate = scriptContext.form.getField({id:this.dateFields.closingDate});
                            invSumDate.updateDisplayType({displayType:serverWidget.FieldDisplayType.INLINE});
                        }
                        this.handleBankAccountField(scriptContext);
                        if(currentRecord.type == record.Type.CREDIT_MEMO || currentRecord.type == record.Type.INVOICE) {
                            this.handleInvSummaryField(scriptContext);
                        }
                        break;
                    default:
                        break;
                }

            } catch (e) {
                log.error(e.name, e.message);
            }
        }

        beforeSubmit(scriptContext){
            let eventType = scriptContext.type;
            let currentRecord = scriptContext.newRecord;

            this.setDateFields(currentRecord.type);
            let entityValidation = {isValid: true};
            let closingDateValidation = {isValid: true};
            let dueDateValidation = {isValid: true};

            let transValidator;
            let exceptionMessages = [];
            let exceptionTypes = [];

            try{
                if (SUPPORTED_EVENT_TYPES.indexOf(eventType.toLowerCase()) == -1) {
                    return;
                }

                let isUIContext = runtime.executionContext === runtime.ContextType.USER_INTERFACE;
                let includeInvoiceSummary = this.getFieldValue(INCLUDE_INVOICE_SUMMARY, scriptContext);

                if (isUIContext || !includeInvoiceSummary) {
                    return;
                }
                if(includeInvoiceSummary){
                    let entDao = new JP_EntityDAO();
                    currentRecord.setValue({fieldId: entDao.fields.computeDueDate, value: 'T'});
                }

                let tranSubsidiary = this.getFieldValue(SUBSIDIARY, scriptContext);
                let subsDao = new SubsidiaryDAO();
                let subCountry = subsDao.getSubsidiaryCountry(tranSubsidiary);

                if (subCountry != "JP") {
                    return;
                }
                let tranDate = this.getFieldValue(TRAN_DATE, scriptContext);
                let closingDate = this.getFieldValue(this.dateFields.closingDate, scriptContext);
                let invoiceSummary = this.getFieldValue(INVOICE_SUMMARY, scriptContext);
                let entityInfo = this.getEntityInfo(scriptContext);

                transValidator = new TransactionValidator();

                if ([scriptContext.UserEventType.EDIT,
                    scriptContext.UserEventType.XEDIT].indexOf(scriptContext.type) >= 0) {

                    if (this.isFieldModified(ENTITY, scriptContext)) {
                        entityValidation = transValidator.validateEntity({
                            recordType: currentRecord.type,
                            invoiceSummary: invoiceSummary
                        });
                    }
                }
                let paymentTermUtility = new PaymentTermUtility(entityInfo);
                let term = paymentTermUtility.getNextTerm(tranDate);
                let dateEvaluatorParam = {
                        eventType: eventType,
                        oldRecord: scriptContext.oldRecord,
                        newRecord: scriptContext.newRecord,
                        executionContext: runtime.executionContext,
                        dateFields: this.dateFields,
                        computeDueDate : (entityInfo.computeDueDate || entityInfo.useInvoiceSummary )
                };

                let autoCalcEvaluator = new AutoCalculationEvaluator();
                let autoCalcEval = autoCalcEvaluator.evaluate(dateEvaluatorParam);

                let datesCalculator = new DatesCalculator(term);
                /* Setting of value for closing date */
                if (autoCalcEval.autoCalculateClosingDate) {
                    /* Closing Date auto-calculation */
                        closingDate = datesCalculator.calculateClosingDate(tranDate);
                        currentRecord.setValue({fieldId:this.dateFields.closingDate, value:closingDate});
                        this.syncClosingDate(currentRecord, closingDate);
                } else {
                    /*
                     * Closing Date from user input
                     * Validation of closing date value from user
                     */
                    this.syncClosingDate(currentRecord, closingDate);
                    closingDateValidation = transValidator.validateClosingDate({
                        tranDate: tranDate,
                        closingDate: closingDate,
                        invoiceSummary:invoiceSummary,
                        recordType: currentRecord.type,
                        entityInfo: entityInfo
                    });
                }

                /* Setting of value for due date */
                if (autoCalcEval.autoCalculateDueDate && closingDate) {
                    /* Due Date auto-calculation */
                    let calculatedDueDate = datesCalculator.calculateDueDate(closingDate);

                    if (entityInfo.dueDateAdj !== DUE_DATE_ADJ_NO_CHANGE) { // Not equal to 'No Change'
                        let dueDateAdjuster = new DueDateAdjuster();
                        calculatedDueDate = dueDateAdjuster.doAdjustment(calculatedDueDate, tranSubsidiary, entityInfo.dueDateAdj);
                    }

                    currentRecord.setValue({fieldId:this.dateFields.dueDate, value:calculatedDueDate});
                } else if (!autoCalcEval.autoCalculateDueDate) {
                    /* Due date value from user input
                        * Validation of closing date value from user
                        */
                    let useHolidayChecking;
                    let subsidiary = currentRecord.getValue({fieldId:SUBSIDIARY});
                    if(runtime.isFeatureInEffect('SUBSIDIARIES')){
                        useHolidayChecking = new SubsidiaryDAO().useHolidayChecking(subsidiary);
                    }else{
                        let compInfo = new CompanyDAO().useHolidayChecking();
                        useHolidayChecking = compInfo.useHolidayChecking;
                    }

                    dueDateValidation = transValidator.validateDueDate({
                        tranDate: tranDate,
                        dueDate: this.getFieldValue(this.dateFields.dueDate, scriptContext),
                        useHolidayChecking:useHolidayChecking,
                        recordType: currentRecord.type,
                        tranSubsidiary: subsidiary
                    });
                }

                let message = '';
                let stringUtil;

                let translator = new Translator();
                let exceptions = transValidator.getSalesValidatorErrorMsgs(entityValidation, closingDateValidation);
                exceptionTypes = exceptions.types;
                exceptionMessages = exceptions.messages;
                if (!dueDateValidation.isValid) {
                    exceptionTypes.push(dueDateValidation.type);
                    let msg = translator.getTexts([dueDateValidation.messageCode], true);
                    message = msg[dueDateValidation.messageCode];
                    if (dueDateValidation.parameters) {
                        stringUtil = new StringUtility(msg[dueDateValidation.messageCode]);
                        message = stringUtil.replaceParameters(dueDateValidation.parameters);
                    }
                    exceptionMessages.push(message);
                }
            }catch(e){
                log.error(e.name, e.message);
            }

            if ((exceptionMessages.length > 0) && (exceptionTypes.indexOf(transValidator.VALIDATION_TYPES.FAILURE) != -1)) {
                throw "JP_TRANSACTION_VALIDATION_ERROR: " + exceptionMessages.join(" ");
            }
        }


        afterSubmit(scriptContext){
            try {
                let currentRecord = scriptContext.newRecord;
                let createdFrom = this.getFieldValue(CREATED_FROM, scriptContext);
                if (currentRecord.type === record.Type.INVOICE && createdFrom) {
                    let includeIds = this.getFieldValue(INCLUDE_INVOICE_SUMMARY, scriptContext);
                    let updateParams = {};
                    updateParams[INCLUDE_INVOICE_SUMMARY] = includeIds;
                    record.submitFields({
                        id: createdFrom,
                        type: record.Type.SALES_ORDER,
                        values: updateParams
                    });
                }
            } catch(e) {
                log.error(e.name, e.message);
            }
        }

    }

    let saleTransactionUE = new JP_SaleTransactionUE();

    return {
        beforeLoad: (scriptContext) =>{saleTransactionUE.beforeLoad(scriptContext)},
        beforeSubmit: (scriptContext) =>{saleTransactionUE.beforeSubmit(scriptContext)},
        afterSubmit: (scriptContext) =>{saleTransactionUE.afterSubmit(scriptContext)}
    };

});
