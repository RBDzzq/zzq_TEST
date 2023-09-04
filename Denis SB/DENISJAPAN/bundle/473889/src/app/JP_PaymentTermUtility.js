/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["../lib/JP_DateUtility", "N/error", "N/query"], (DateUtility, error, query) => {
    let entityInfo;

    class PaymentTermUtility {

        constructor(entity) {
            this.name = 'PaymentTermUtility';
            entityInfo = entity;
        }

        setEntityDetails(eDetails) {
            entityInfo = eDetails;
        };


        getAllTerms() {
            return (entityInfo && entityInfo.terms) ? entityInfo.terms : [];
        };


        getLastTerm(){
            let terms = this.getAllTerms();
            let lastIndex = terms.length - 1;
            return terms[lastIndex];
        };


        hasEOMTerm(){
            let lastTerm = this.getLastTerm();
            return lastTerm.closingDay === 31;
        };


        /**
         * @param {ns_wrapper.api.Date} date
         * @public
         * @returns paymentTerm
         */
        getNextTerm(date){
            // move through all terms until term.close date < date.day
            let terms = this.getAllTerms();
            let nextTermIndex = this.getNextTermIndex(date);
            return terms[nextTermIndex];
        };


        getNextTermIndex(date){
            // move through all terms until term.close date < date.day
            let terms = this.getAllTerms();
            let nextTermIndex = 0;
            let currTerm = null;

            let dateUtil = new DateUtility(date);
            let currDay = dateUtil.getDay();
            let lastDayOfMonth = dateUtil.getLastDayOfMonth();

            for ( let i = 0; i < terms.length; i++) {
                currTerm = terms[i];

                if (currTerm.closingDay >= lastDayOfMonth && this.hasEOMTerm()) {
                    nextTermIndex = terms.length - 1;
                    break;
                } else if (currTerm.closingDay >= currDay) {
                    nextTermIndex = i;
                    break;
                }
            }

            return nextTermIndex;
        };


        getPaymentTerm(closingDate){
            closingDate = (closingDate) ? new DateUtility(closingDate): '';
            let closingDay = closingDate.getDay();
            let lastDayOfMonth = closingDate.getLastDayOfMonth();
            let closeOnLastDay = closingDay === lastDayOfMonth;
            let terms = this.getAllTerms();

            let paymentTerm = {};
            let currTerm = null;
            let isMatchedClosing = false;

            for (let i = 0; i < terms.length; i++) {
                currTerm = terms[i];
                isMatchedClosing = currTerm.closingDay === closingDay;

                if (closeOnLastDay && (currTerm.closingDay >= lastDayOfMonth) && this.hasEOMTerm()) {
                    paymentTerm = this.getLastTerm();
                    break;
                } else if (isMatchedClosing || (closeOnLastDay && currTerm.closingDay >= lastDayOfMonth)) {
                    paymentTerm = currTerm;
                    break;
                }

            }

            return paymentTerm;
        };

        /**
         * Retrieve the closing day, due day and due month display values
         * @param id ID of the Payment Term
         * @returns {Object[]} Single payment term object
         */
        loadPaymentTerm(id){
            let ptQuery = query.create({
                type: 'customrecord_suitel10n_jp_payment_term',
            });
            let idCondition = ptQuery.createCondition({
                fieldId:'id',
                operator: query.Operator.EQUAL,
                values: id
            });
            ptQuery.condition = ptQuery.and(idCondition);
            ptQuery.columns = [
                ptQuery.createColumn({
                    fieldId: 'custrecord_suitel10n_jp_pt_closing_day',
                    context: query.FieldContext.DISPLAY,
                    alias: 'closingday'
                }),
                ptQuery.createColumn({
                    fieldId: 'custrecord_suitel10n_jp_pt_paym_due_day',
                    context: query.FieldContext.DISPLAY,
                    alias: 'dueday'
                }),
                ptQuery.createColumn({
                    fieldId: 'custrecord_suitel10n_jp_pt_paym_due_mo',
                    context: query.FieldContext.DISPLAY,
                    alias: 'duemonth'
                }),
                ptQuery.createColumn({
                    fieldId: 'custrecord_jp_payterm_description',
                    context: query.FieldContext.RAW,
                    alias: 'description'
                })

            ];
            let result = ptQuery.run().asMappedResults();
            if(result.length === 1){
                return result;
            }
            return [];

        };


        getPeriodStartDate(closingDate) {
            let closingDay = closingDate.getDay();
            let lastDayOfMonth = closingDate.getLastDayOfMonth();
            let closeOnLastDay = closingDay === lastDayOfMonth;
            let terms = this.getAllTerms();

            let paymentTermIndex = null;
            let currTerm = null;
            let isMatchedClosing = false;

            for ( let i = 0; i < terms.length; i++) {
                currTerm = terms[i];
                isMatchedClosing = currTerm.closingDay === closingDay;

                if (closeOnLastDay && (currTerm.closingDay >= lastDayOfMonth) && this.hasEOMTerm()) {
                    paymentTermIndex = (terms.length-1);
                    break;
                } else if (isMatchedClosing || (closeOnLastDay && currTerm.closingDay >= lastDayOfMonth)) {
                    paymentTermIndex = i;
                    break;
                }
            }

            if (!paymentTermIndex && (paymentTermIndex !== 0)){
                paymentTermIndex = this.getNextTermIndex(closingDate);
            }

            let currentPeriodIndex = paymentTermIndex;
            let previousPeriodIndex = currentPeriodIndex == 0 ? terms.length-1 : currentPeriodIndex-1;
            let previousTerm = terms[previousPeriodIndex];

            if (!previousTerm) {
                throw error.create({
                    name: 'INV_SUM_DATE_PERIOD_START',
                    message: 'There is no payment term defined. entityInfo: '+JSON.stringify(entityInfo)
                });
            }

            let previousTermClosingDay = previousTerm.closingDay;
            let periodStartDate = new DateUtility(closingDate.getDate());

            if (currentPeriodIndex == 0) {
                let currentMonth = closingDate.getMonth();
                periodStartDate.setMonth(currentMonth == 0 ? 11 : currentMonth-1); // 0 is JAN and 11 is DEC

                if (currentMonth == 0) {
                    let year = closingDate.getYear();
                    periodStartDate.setYear(year - 1);
                }

                if (this.hasEOMTerm()) {
                    periodStartDate.setDay(new DateUtility(periodStartDate.getDate()).getLastDayOfMonth() + 1);
                }
                else {
                    periodStartDate.setDay(previousTermClosingDay+1);
                }
            }
            else {
                periodStartDate.setDay(previousTermClosingDay+1);
            }

            return periodStartDate.getDate();
        };


        isValidClosingDate(date){
            let term = this.getPaymentTerm(date);
            return Boolean(term.id);
        };


        getDueDate(term, closingDate){

            if (!(closingDate instanceof DateUtility)) {
                throw error.create({
                    name : 'JPB002',
                    message : 'JP_InvoiceSummaryDAO.getDueDate requires an instance of JP_DateUtility as a parameter.',
                    notifyOff : true
                });
            }

            let paymentDueDay = term.paymentDueDay;
            let dueDate = new DateUtility(closingDate.getDate());
            dueDate.addMonths(term.paymentDueMonth);

            let lastDayOfDueDate = dueDate.getLastDayOfMonth();
            paymentDueDay =  term.dueOnLastDay ? lastDayOfDueDate : paymentDueDay;
            dueDate.setDay(paymentDueDay);

            return dueDate.getDate();

        };
    }

    return PaymentTermUtility;

});
