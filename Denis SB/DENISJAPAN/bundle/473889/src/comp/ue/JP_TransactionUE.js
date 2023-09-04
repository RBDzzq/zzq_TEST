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
    "N/ui/serverWidget",
    "N/runtime",
    "N/record",
    "../../data/JP_SubsidiaryDAO",
    "../../data/JP_CompanyDAO",
    "../../app/JP_PaymentTermUtility",
    "../../app/JP_DateAutoCalculationEvaluator",
    "../../app/JP_DatesCalculator",
    "../../app/JP_DueDateAdjuster",
    "../../app/JP_TransactionValidator",
    "../../app/JP_TaxRegNumValidator",
    "../../lib/JP_TCTranslator",
    "../../lib/JP_StringUtility",
    "../../app/JP_TransactionServerSide"
    ],
    (
        serverWidget,
        runtime,
        record,
        SubsidiaryDAO,
        CompanyDAO,
        PaymentTermUtility,
        AutoCalculationEvaluator,
        DatesCalculator,
        DueDateAdjuster,
        TransactionValidator,
        TaxRegNumValidator,
        Translator,
        StringUtility,
        TransactionServerSide
    ) => {

    let TRAN_DATE = "trandate";
    let DUE_DATE_ADJ_NO_CHANGE = "3";
    let SUBSIDIARY = "subsidiary";
    let SUPPORTED_EVENT_TYPES = ["create", "edit", "xedit"];

    function JP_TransactionUE() {
        TransactionServerSide.call(this);
    }

    util.extend(JP_TransactionUE.prototype, TransactionServerSide.prototype);

        JP_TransactionUE.prototype.beforeLoad=function(scriptContext) {
            let eventType = scriptContext.type;
            let currentRecord = scriptContext.newRecord;
            let form = scriptContext.form;

            if (scriptContext.UserEventType.COPY == eventType) {
                currentRecord.setValue({fieldId: this.dateFields.closingDate, value: ""});
                currentRecord.setValue({fieldId: this.dateFields.dueDate, value: ""});
            } else if (scriptContext.UserEventType.VIEW == eventType) {
                this.showHideFields(scriptContext);
            } else {
                //Only do this for Vendor Bill and Expense Report
                if([record.Type.PURCHASE_ORDER,
                    record.Type.VENDOR_BILL,
                    record.Type.VENDOR_CREDIT].indexOf(scriptContext.newRecord.type)){
                    let closingDateField = form.getField({id:this.dateFields.closingDate});
                    closingDateField.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    this.setTaxExemptEntity(scriptContext);
                }
            }
        }


        JP_TransactionUE.prototype.beforeSubmit=function(scriptContext){
            let eventType = scriptContext.type;
            let currentRecord = scriptContext.newRecord;
            let dueDateValidation = {isValid: true};
            let subsidiaryID = this.getFieldValue(SUBSIDIARY, scriptContext);
            let subsDao = new SubsidiaryDAO();
            let subCountry = subsDao.getSubsidiaryCountry(subsidiaryID);

            if (SUPPORTED_EVENT_TYPES.indexOf(eventType.toLowerCase()) == -1 ||
                runtime.executionContext === runtime.ContextType.USER_INTERFACE ||
                subCountry != "JP") {
            	return;
            }

            let tranDate = this.getFieldValue(TRAN_DATE, scriptContext);
            let closingDate = this.getFieldValue(this.dateFields.closingDate, scriptContext);
            let tranSubsidiary = this.getFieldValue(SUBSIDIARY, scriptContext);
            let entityInfo = this.getEntityInfo(scriptContext);

            let paymentTermUtility = new PaymentTermUtility(entityInfo);
            let term = paymentTermUtility.getNextTerm(tranDate);

            if (!term) return;

            let dateEvaluatorParam = {
                    eventType: eventType,
                    executionContext: runtime.executionContext,
                    oldRecord: scriptContext.oldRecord,
                    newRecord: scriptContext.newRecord,
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
            } else {
                /*
                 * Closing Ddte from user input
                 * Validation of closing date value from user
                 */
            }

            let transValidator = new TransactionValidator();

            /* Setting of value for due date */
            if (autoCalcEval.autoCalculateDueDate) {
                /* Due Date auto-calculation */
                let calculatedDueDate = datesCalculator.calculateDueDate(closingDate);

                if (entityInfo.dueDateAdj !== DUE_DATE_ADJ_NO_CHANGE) { // Not equal to 'No Change'
                    let dueDateAdjuster = new DueDateAdjuster();
                    calculatedDueDate = dueDateAdjuster.doAdjustment(calculatedDueDate, tranSubsidiary,
                        entityInfo.dueDateAdj);
                }

                currentRecord.setValue({fieldId:this.dateFields.dueDate, value:calculatedDueDate});
            } else {
                /* Due date value from user input
                 * Validation of closing date value from user
                 */

                let subsidiary = this.getFieldValue(SUBSIDIARY, scriptContext);
                let useHolidayChecking;
                if(runtime.isFeatureInEffect('SUBSIDIARIES')){
                    useHolidayChecking = new SubsidiaryDAO().useHolidayChecking(subsidiary);
                }
                else{
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

            //tax registration number validations
            new TaxRegNumValidator().validateTaxRegNumBackEnd(currentRecord);

            let exceptionMessages = [];
            let exceptionTypes = [];
            if (!dueDateValidation.isValid) {
            	exceptionTypes.push(dueDateValidation.type);
                let message = new Translator().getTexts([dueDateValidation.messageCode], true);
                let mymsg = message[dueDateValidation.messageCode];
                if (dueDateValidation.parameters) {
                    let stringUtil = new StringUtility(message[dueDateValidation.messageCode]);
                    mymsg = stringUtil.replaceParameters(dueDateValidation.parameters);
                }
                exceptionMessages.push(mymsg);
            }

            if ((exceptionMessages.length > 0) && (exceptionTypes.indexOf(transValidator.VALIDATION_TYPES.FAILURE) != -1)) {
                throw "JP_TRANSACTION_VALIDATION_ERROR: " + exceptionMessages.join(" ");
            }

        }

    let transactionUE = new JP_TransactionUE();
    return {
        beforeLoad: (scriptContext) =>{ transactionUE.beforeLoad(scriptContext)},
        beforeSubmit: (scriptContext)=>{ transactionUE.beforeSubmit(scriptContext)}
    };

});
