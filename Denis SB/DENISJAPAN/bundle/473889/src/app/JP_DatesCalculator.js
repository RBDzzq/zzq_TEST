/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["../lib/JP_DateUtility", "N/error"], (DateUtility, error) => {

    let term;
	class DatesCalculator{

        constructor(t) {
            if (!t) {
                throw error.create({
                    name: "JPB003",
                    message: "DatesCalculator module requires a constructor parameter"
                });
            }

            term = t;
        }

        calculateClosingDate(date){

            if(!date) {
                throw error.create({
                    name: "JPB004",
                    message: "DatesCalculator.calculatedClosingDate requires a Date object as parameter."
                });
            }

            const closingDate = new DateUtility(date);

            let closingDay = term.closingDay;
            const lastDayOfMonth = closingDate.getLastDayOfMonth();

            /*sample case: if user selected 30 as closing day but the month las only 28 days*/
            if (closingDay >= lastDayOfMonth) {
                closingDay = lastDayOfMonth;
            }

            if (date.getDate() > term.closingDay) {
                closingDate.addMonths(1);
            }

            closingDate.setDay(closingDay);

            return closingDate.getDate();
        }

        calculateDueDate(date){
            if (!date) {
                throw error.create({
                    name: "JPB002",
                    message: "DatesCalculator.calculateDueDate requires a Date object as parameter."
                });
            }

            const dueDate = new DateUtility(date);
            dueDate.addMonths(term.paymentDueMonth);

            const lastDayOfDueDate = dueDate.getLastDayOfMonth();
            let paymentDueDay = term.paymentDueDay;
            if (term.dueOnLastDay) {
                paymentDueDay = lastDayOfDueDate;
            }

            dueDate.setDay(paymentDueDay);

            return dueDate.getDate();
        }
    }

	return DatesCalculator;

});
