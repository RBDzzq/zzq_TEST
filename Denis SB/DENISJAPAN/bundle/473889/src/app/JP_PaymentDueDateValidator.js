/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    '../lib/JP_TCTranslator',
    'N/search'
],

(translator, search) => {

    let TRANSLATE_CLOSING_DATE_MUST_BE_UNIQUE = 'CUST_PAYMENT_DUE_DATE_CLOSING_DAY_UNIQUE';
    let TRANSLATE_PDD_PDDM_MISSING = 'CUST_PAYMENT_DUE_DATE_USE_IDS_EMPTY_INVALID';
    let TRANSLATE_PAYMENT_TERM_INVALID = 'CUST_PAYMENT_DUE_DATE_PAYMENT_TERM_INVALID';
    const VENDOR_EMP_VALIDATIONMSG = 'PTTERM_DUDATE_ERR';

    let PAYMENT_TERMS_SUBLIST_PREFIX = 'recmachcustrecord_suitel10n_jp_pt_';
    let CLOSING_DAY_ID = 'custrecord_suitel10n_jp_pt_closing_day';
    let DUE_DAY_REC = 'customrecord_cut_off_date';
    let DUE_DAY_VAL = 'custrecord_jp_dueday_value';
    let DUE_DAY_ID = 'custrecord_suitel10n_jp_pt_paym_due_day';
    let DUE_MONTH_REC = 'customrecord_jp4030_duemonth';
    let DUE_MONTH_VAL = 'custrecord_jp4030_duemonth_value';
    let DUE_MONTH_ID = 'custrecord_suitel10n_jp_pt_paym_due_mo';
    let USE_INVSUM_FIELD = 'custentity_4392_useids';
    const COMPUTE_DUEDATE = 'custentity_jp_duedatecompute';
    const REC_TYPE = 'type';
    let JP_COUNTRY_CODE = 'JP';

    let messages = [];


    function JP_PaymentDueDateValidator(){
        this.name = 'JP_PaymentDueDateValidator';
    }


    /**
     * Initializes a message object to load the translated messages
     *
     */
	function loadMessageObject() {

		if (messages.length < 1) {
            let stringCodes = [
                TRANSLATE_CLOSING_DATE_MUST_BE_UNIQUE,
                TRANSLATE_PDD_PDDM_MISSING,
                TRANSLATE_PAYMENT_TERM_INVALID,
                VENDOR_EMP_VALIDATIONMSG
            ];
            messages = new translator().getTexts(stringCodes, true);
		}

    }


    /**
     * Validates the payment term combination of the current line item
     *
     * @param {Object} record currentRecord object
     * @returns {Boolean}
     */
    JP_PaymentDueDateValidator.prototype.validateCurrentPaymentTerm = (record) => {

        loadMessageObject();

        let closingDayId = record.getCurrentSublistValue(PAYMENT_TERMS_SUBLIST_PREFIX + record.type, CLOSING_DAY_ID);
        let dueDayId = record.getCurrentSublistValue(PAYMENT_TERMS_SUBLIST_PREFIX + record.type, DUE_DAY_ID);
        let dueMonthId = record.getCurrentSublistValue(PAYMENT_TERMS_SUBLIST_PREFIX + record.type, DUE_MONTH_ID);

        if (closingDayId && dueDayId && dueMonthId) {
            let closingDay = parseInt(closingDayId);
            let dueDayObj = search.lookupFields({
                type: DUE_DAY_REC,
                id: dueDayId,
                columns: DUE_DAY_VAL
            });
            let dueDay = parseInt(dueDayObj[DUE_DAY_VAL]);
            let dueMonthObj = search.lookupFields({
                type: DUE_MONTH_REC,
                id: dueMonthId,
                columns: DUE_MONTH_VAL
            });
            let dueMonth = parseInt(dueMonthObj[DUE_MONTH_VAL]);

            if (dueMonth === 0 && dueDay < closingDay || dueMonth === 0 && dueDay === closingDay) {
                alert(messages[TRANSLATE_PAYMENT_TERM_INVALID]);
                return false;
            }
        }

        let paymentTermLineCount = record.getLineCount({sublistId:PAYMENT_TERMS_SUBLIST_PREFIX + record.type});
        for (let i = 0; i < paymentTermLineCount; i++) {
            let currClosingDayId = record.getSublistValue({
                sublistId: PAYMENT_TERMS_SUBLIST_PREFIX + record.type,
                fieldId: CLOSING_DAY_ID,
                line: i
            });

            let index = record.getCurrentSublistIndex({sublistId:PAYMENT_TERMS_SUBLIST_PREFIX + record.type});

            if (closingDayId === currClosingDayId && i !== index) {
                alert(messages[TRANSLATE_CLOSING_DATE_MUST_BE_UNIQUE]);
                return false;
            }
        }
        return true;
    };


    /**
     * Does validation for mandatory fields if country has JP
     *
     * @param {Object} record currentRecord Object
     * @param {Array} countries
     * @returns {Boolean}
     */
    JP_PaymentDueDateValidator.prototype.checkIDSMandatoryFields = (record, countries) => {

        loadMessageObject();
        let recwithnoIDSField = ['vendor', 'employee'];
        let recordType = record.getValue({fieldId: REC_TYPE});

        if(countries.indexOf(JP_COUNTRY_CODE) > -1){

            let computeDueDate = record.getValue({fieldId: COMPUTE_DUEDATE });
            let paymentTermLineCount = record.getLineCount({sublistId:PAYMENT_TERMS_SUBLIST_PREFIX + record.type});

            if(recwithnoIDSField.indexOf(recordType) > -1 && computeDueDate && paymentTermLineCount < 1){
                alert(messages[VENDOR_EMP_VALIDATIONMSG]);
                return false;
            }
            else{ //customer record.
                let useInvoiceSummaryField = record.getField({fieldId:USE_INVSUM_FIELD});

                if ( useInvoiceSummaryField) {

                    let useInvoiceSummary = record.getValue({fieldId:USE_INVSUM_FIELD});

                    if ( (useInvoiceSummary || computeDueDate) && paymentTermLineCount < 1) {
                        alert(messages[TRANSLATE_PDD_PDDM_MISSING]);
                        return false;
                    }
                }
            }
        }

        return true;
    };


    return JP_PaymentDueDateValidator;

});
