/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    'N/format',
    'N/record',
    '../lib/JP_DateUtility',
    './JP_PaymentTermUtility',
    '../lib/JP_TCTranslator',
    '../lib/JP_StringUtility'
],

(format, record, JP_DateUtility, JP_PaymentTermUtility, Translator, StringUtility) =>{
    let VALIDATION_TYPES = {
        SUCCESS: "SUCCESS",
        FAILURE: "FAILURE",
        WARNING: "WARNING",
    };

    let SALES_ORDER_CANCELLED = 'C';
    let SALES_ORDER_CLOSED = 'H';

    let errorMsgObj = {
        'vendorbill': {
            'TRANSLATE_DUE_DATE_IS_HOLIDAY' : 'VENDBILL_DUE_DATE_FALLS_ON_HOLIDAY',
            'TRANSLATE_DUE_DATE_IS_WEEKEND' : 'VENDBILL_DUE_DATE_FALLS_ON_WEEKEND',
            'TRANSLATE_DUE_DATE_IS_BEFORE_TRANDATE' : 'VENDBILL_DUEDATE_IS_BEFORE_TRANDATE'
        },
        'vendorcredit':{
            'TRANSLATE_DUE_DATE_IS_HOLIDAY' : 'VENDCRED_DUE_DATE_FALLS_ON_HOLIDAY',
            'TRANSLATE_DUE_DATE_IS_WEEKEND' : 'VENDCRED_DUE_DATE_FALLS_ON_WEEKEND',
            'TRANSLATE_DUE_DATE_IS_BEFORE_TRANDATE' : 'VENDCRED_DUEDATE_IS_BEFORE_TRANDATE'
        },
        'expensereport': {
            'TRANSLATE_DUE_DATE_IS_HOLIDAY' : 'EXPREPT_DUE_DATE_FALLS_ON_HOLIDAY',
            'TRANSLATE_DUE_DATE_IS_WEEKEND' : 'EXPREPT_DUE_DATE_FALLS_ON_WEEKEND',
            'TRANSLATE_DUE_DATE_IS_BEFORE_TRANDATE' : 'EXPREPT_DUEDATE_IS_BEFORE_TRANDATE'
        },
        'purchaseorder':{
            'TRANSLATE_DUE_DATE_IS_HOLIDAY' : 'EXPREPT_DUE_DATE_FALLS_ON_HOLIDAY',
            'TRANSLATE_DUE_DATE_IS_WEEKEND' : 'EXPREPT_DUE_DATE_FALLS_ON_WEEKEND',
            'TRANSLATE_DUE_DATE_IS_BEFORE_TRANDATE' : 'EXPREPT_DUEDATE_IS_BEFORE_TRANDATE'
        },
        'creditmemo': {
            'TRANSLATE_CLOSING_DATE_MISSING': 'CREDITMEMO_IDS_DATE_MISSING',
            'TRANSLATE_CLOSING_DATE_PASSED': 'CREDITMEMO_IDS_DATE_PAST_DATE',
            'TRANSLATE_CLOSING_DATE_NOT_MATCH': 'CREDITMEMO_IDS_DATE_NO_MATCHING_TERM',
            'TRANSLATE_CLOSING_DATE_IS_BEFORE_TRANDATE': 'CREDITMEMO_IDS_DATE_IS_BEFORE_TRANDATE',
            'TRANSLATE_DUE_DATE_IS_HOLIDAY': 'CREDITMEMO_DUE_DATE_FALLS_ON_HOLIDAY',
            'TRANSLATE_DUE_DATE_IS_WEEKEND': 'CREDITMEMO_DUE_DATE_FALLS_ON_WEEKEND',
            'TRANSLATE_DUE_DATE_IS_BEFORE_TRANDATE': 'CREDITMEMO_DUEDATE_IS_BEFORE_TRANDATE',
            'TRANSLATE_PREVENT_CUSTOMER_CHANGE': 'TRANS_CUSTOMER_PREVENT_CHANGE',
            'TRANSLATE_USE_IDS_FALSE_CUST': 'TRANS_USE_IDS_FALSE_CUST_REC',
            'TRANSLATE_DUE_DATE_IS_REQUIRED' : 'CREDITMEMO_DUE_DATE_REQUIRED'
        },
        'invoice': {
            'TRANSLATE_CLOSING_DATE_MISSING': 'INVOICE_CLOSING_DATE_MISSING',
            'TRANSLATE_CLOSING_DATE_PASSED': 'INVOICE_CLOSING_DATE_PASSED',
            'TRANSLATE_CLOSING_DATE_NOT_MATCH': 'INVOICE_CLOSING_DATE_NO_MATCHING_TERM',
            'TRANSLATE_CLOSING_DATE_IS_BEFORE_TRANDATE': 'INVOICE_CLOSINGDATE_IS_BEFORE_TRANDATE',
            'TRANSLATE_DUE_DATE_IS_HOLIDAY': 'INVOICE_DUE_DATE_FALLS_ON_HOLIDAY',
            'TRANSLATE_DUE_DATE_IS_WEEKEND': 'INVOICE_DUE_DATE_FALLS_ON_WEEKEND',
            'TRANSLATE_DUE_DATE_IS_BEFORE_TRANDATE': 'INVOICE_DUEDATE_IS_BEFORE_TRANDATE',
            'TRANSLATE_PREVENT_CUSTOMER_CHANGE': 'TRANS_CUSTOMER_PREVENT_CHANGE',
            'TRANSLATE_DUE_DATE_IS_REQUIRED' : 'INVOICE_DUE_DATE_REQUIRED'
        },
        'salesorder': {
            'TRANSLATE_CLOSING_DATE_NOT_MATCH': 'SALESORDER_IDS_DATE_NO_MATCHING_TERM',
            'TRANSLATE_CLOSING_DATE_MISSING': 'SALESORDER_IDS_DATE_IDS_DATE_REQUIRED',
            'TRANSLATE_PREVENT_CUSTOMER_CHANGE': 'TRANS_CUSTOMER_PREVENT_CHANGE'
        },
        'customsale_jp_loc_cred_bal_adj': {
            'TRANSLATE_CLOSING_DATE_MISSING': 'BALADJCRED_CLOSING_DATE_MISSING',
            'TRANSLATE_CLOSING_DATE_PASSED': 'BALADJCRED_CLOSING_DATE_PASSED',
            'TRANSLATE_CLOSING_DATE_NOT_MATCH': 'BALADJCRED_CLOSING_DATE_NO_MATCHING_TERM',
            'TRANSLATE_CLOSING_DATE_IS_BEFORE_TRANDATE': 'BALADJCRED_CLOSINGDATE_IS_BEFORE_TRANDATE',
            'TRANSLATE_DUE_DATE_IS_HOLIDAY': 'BALADJCRED_DUE_DATE_FALLS_ON_HOLIDAY',
            'TRANSLATE_DUE_DATE_IS_WEEKEND': 'BALADJCRED_DUE_DATE_FALLS_ON_WEEKEND',
            'TRANSLATE_DUE_DATE_IS_BEFORE_TRANDATE': 'BALADJCRED_DUEDATE_IS_BEFORE_TRANDATE',
            'TRANSLATE_PREVENT_CUSTOMER_CHANGE': 'TRANS_CUSTOMER_PREVENT_CHANGE',
            'TRANSLATE_DUE_DATE_IS_REQUIRED' : 'BALADJCRED_DUE_DATE_REQUIRED'
        },
        'customsale_jp_loc_debit_bal_adj': {
            'TRANSLATE_CLOSING_DATE_MISSING': 'BALADJDEBIT_CLOSING_DATE_MISSING',
            'TRANSLATE_CLOSING_DATE_PASSED': 'BALADJDEBIT_CLOSING_DATE_PASSED',
            'TRANSLATE_CLOSING_DATE_NOT_MATCH': 'BALADJDEBIT_CLOSING_DATE_NO_MATCHING_TERM',
            'TRANSLATE_CLOSING_DATE_IS_BEFORE_TRANDATE': 'BALADJDEBIT_CLOSINGDATE_IS_BEFORE_TRANDATE',
            'TRANSLATE_DUE_DATE_IS_HOLIDAY': 'BALADJDEBIT_DUE_DATE_FALLS_ON_HOLIDAY',
            'TRANSLATE_DUE_DATE_IS_WEEKEND': 'BALADJDEBIT_DUE_DATE_FALLS_ON_WEEKEND',
            'TRANSLATE_DUE_DATE_IS_BEFORE_TRANDATE': 'BALADJDEBIT_DUEDATE_IS_BEFORE_TRANDATE',
            'TRANSLATE_PREVENT_CUSTOMER_CHANGE': 'TRANS_CUSTOMER_PREVENT_CHANGE',
            'TRANSLATE_DUE_DATE_IS_REQUIRED' : 'BALADJDEBIT_DUE_DATE_REQUIRED'
        }
    };

    function JP_TransactionValidator(){
        this.VALIDATION_TYPES = VALIDATION_TYPES;
    }

    /**
     * Check if arg1 is before arg2
     * If arg2 is omitted, compares arg1 with current date time
     *
     * @param {Object} dateToCheck
     * @param {Object} dateAgainst
     * @returns {Boolean}
     */
    function isPastDate(dateToCheck, dateAgainst){
        if(!dateAgainst){
            dateAgainst = new Date();
        }
        return dateToCheck.getTime() < dateAgainst.getTime();
    }


    /**
     * Gets the message codes to be used for the transaction type
     *
     * @param {String} type Record type
     * @returns {Array}
     */
    JP_TransactionValidator.prototype.getMessageCodes = function(type){
        let ret = [];
        util.each(errorMsgObj[type], function(val){
            ret.push(val);
        });
        return ret;
    }


    /**
     * Validates the due date
     *
     * @param {Object} param Validation parameters
     * @returns {Object}
     */
    JP_TransactionValidator.prototype.validateDueDate = function(param){
        let useHolidayChecking = param.useHolidayChecking;
        let tranDate = param.tranDate;
        let dueDate = param.dueDate;
        let subsidiary = param.tranSubsidiary;
        let err = errorMsgObj[param.recordType];

        if(dueDate){

            if(isPastDate(dueDate, tranDate)){
            	/* Due date validation against transaction date */
            	return {
                    isValid: false,
            		messageCode: err['TRANSLATE_DUE_DATE_IS_BEFORE_TRANDATE'],
            		type: VALIDATION_TYPES.FAILURE
            	};

            } else {
            	/* For holiday validation */
            	let dateUtil = new JP_DateUtility(dueDate);
                if(useHolidayChecking){
                    let holidays = dateUtil.getHolidays(subsidiary);
                    let holidaysArr = [];
                    for (let i = 0; i < holidays.length; i++) {
                        holidaysArr.push(holidays[i].name);
                    }
                    if(holidays.length > 0) {
                        return {
                            isValid: false,
                            messageCode: err['TRANSLATE_DUE_DATE_IS_HOLIDAY'],
                            parameters: {
                                HOLIDAY: holidaysArr.join(",")
                            },
                            type: VALIDATION_TYPES.WARNING
                        };
                    }
                }

            	/* For weekend validation */
            	if(dateUtil.isWeekend()) {
            		return {
                        isValid: false,
            			messageCode: err['TRANSLATE_DUE_DATE_IS_WEEKEND'],
            			type: VALIDATION_TYPES.WARNING
            		};
            	}
            }

        // Transaction Validator will only be used when Include in Invoice Summary is checked
        // Due Date must always be provided when Include in Invoice Summary is checked
        }else if(['invoice','creditmemo'].indexOf(param.recordType) > -1){
            return {
                isValid: false,
                messageCode: err['TRANSLATE_DUE_DATE_IS_REQUIRED'],
                type: VALIDATION_TYPES.FAILURE
            };
        }

        return {
        	isValid: true,
        	type: VALIDATION_TYPES.SUCCESS
        }
    }


    /**
     * Validates the closing date for the transaction date
     *
     * @param {Object} param Validation parameters
     * @returns {Object}
     */
    JP_TransactionValidator.prototype.validateClosingDate = function(param){
        let tranDate = param.tranDate;
        let closingDate = param.closingDate;
        let invoiceSummary = param.invoiceSummary;
        let recType = param.recordType;
        let err = errorMsgObj[recType];
        let orderStatus = param.orderStatus;
        let isSalesOrder = recType === 'salesorder';

        if (closingDate) {

            let entityInfo = param.entityInfo;
            let paymentTermUtil = new JP_PaymentTermUtility(entityInfo);
            if (!paymentTermUtil.isValidClosingDate(closingDate)) {
                return {
                    isValid: false,
                    messageCode: err['TRANSLATE_CLOSING_DATE_NOT_MATCH'],
                    type: VALIDATION_TYPES.FAILURE
                };
            }


            if(!isSalesOrder){
                if (isPastDate(closingDate, tranDate) && !invoiceSummary) {
                    return {
                        isValid: false,
                        messageCode: err['TRANSLATE_CLOSING_DATE_IS_BEFORE_TRANDATE'],
                        type: VALIDATION_TYPES.FAILURE
                    };
                }

                if (isPastDate(closingDate) && !invoiceSummary) {
                    let dateString = format.format({
                        value: param.closingDate,
                        type: format.Type.DATE
                    });
                    return {
                        isValid: false,
                        messageCode: err['TRANSLATE_CLOSING_DATE_PASSED'],
                        parameters: {
                            DATE: dateString
                        },
                        type: VALIDATION_TYPES.WARNING
                    }
                }
            }


        } else if ((isSalesOrder && !closingDate && [SALES_ORDER_CANCELLED,SALES_ORDER_CLOSED].indexOf(orderStatus) > -1) || !isSalesOrder) {
            return {
                isValid: false,
                messageCode: err['TRANSLATE_CLOSING_DATE_MISSING'],
                type: VALIDATION_TYPES.FAILURE
            }

        }

        return {
            isValid: true,
            type: VALIDATION_TYPES.SUCCESS
        };

    }


    /**
     * Checks if record has invoice summary attached already
     * If yes, provide error message code and result type
     *
     * @param {Object} param Validation parameters
     */
    JP_TransactionValidator.prototype.validateEntity = function(param){

        log.debug("Validate Entity", JSON.stringify(param));
        if (param && param.invoiceSummary) {
            let err = errorMsgObj[param.recordType];
            return {
                isValid: false,
                messageCode: err['TRANSLATE_PREVENT_CUSTOMER_CHANGE'],
                type: VALIDATION_TYPES.FAILURE
            };
        }

        return {
            isValid: true,
            type: VALIDATION_TYPES.SUCCESS
        };
    }


    /**
     * Check if entity uses invoice summary in credit memo transaction
     *
     * @param {Object} param Parameters
     */
    JP_TransactionValidator.prototype.entityUsesInvoiceSummary = function(param) {
        let recType = param.type;
        let useInvoiceSummary = param.useInvoiceSummary;
        let err = errorMsgObj[recType];

        if (recType === record.Type.CREDIT_MEMO && !useInvoiceSummary) {
            return {
                isValid: false,
                messageCode: err['TRANSLATE_USE_IDS_FALSE_CUST'],
                type: VALIDATION_TYPES.FAILURE
            };
        }

        return {
            isValid: true,
            type: VALIDATION_TYPES.SUCCESS
        };

    }

    JP_TransactionValidator.prototype.getSalesValidatorErrorMsgs = function(entityValidation, closingDateValidation){
        let message = '';
        let stringUtil;

        let translator = new Translator();
        let exceptions = {
            types : [],
            messages : []
        };

        if (!entityValidation.isValid) {
            exceptions.types.push(entityValidation.type);
            let transMsg = translator.getTexts([entityValidation.messageCode], true);
            message = transMsg[entityValidation.messageCode];
            if (entityValidation.parameters) {
                stringUtil = new StringUtility(transMsg[entityValidation.messageCode]);
                message = stringUtil.replaceParameters(entityValidation.parameters);
            }
            exceptions.messages.push(message);
        }

        if (!closingDateValidation.isValid) {
            exceptions.types.push(closingDateValidation.type);
            let transMsg = translator.getTexts([closingDateValidation.messageCode], true);
            message = transMsg[entityValidation.messageCode];
            if (closingDateValidation.parameters) {
                stringUtil = new StringUtility(transMsg[closingDateValidation.messageCode]);
                message = stringUtil.replaceParameters(closingDateValidation.parameters);
            }
            exceptions.messages.push(message);
        }

        return exceptions;
    }


    return JP_TransactionValidator;

});
