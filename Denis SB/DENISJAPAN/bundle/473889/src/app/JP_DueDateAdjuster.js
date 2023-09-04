/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["N/format", "../lib/JP_DateUtility"], (format, DateUtility) => {

    let DUE_DATE_ADJ_PREVIOUS_BANKING_DAY = "2";

    class DueDateAdjuster {

        /**
         * Get how many days to add or subtract
         *
         * @param {String} dueDateAdj Due Date Adjustment Internal ID
         * @returns {Integer}
         */
        getDaysAdjustment(dueDateAdj) {
            let daysToAdd = 1;
            if (dueDateAdj === DUE_DATE_ADJ_PREVIOUS_BANKING_DAY) { // Previous Banking Day
                daysToAdd = -1;
            }
            return daysToAdd;
        };

        /**
         * Adds/subtracts days to date until no longer holiday/weekend
         *
         * @param {Date} dueDate Initial Due Date
         * @param {Integer} subsidiary Subsidiary ID
         * @param {String} dueDateAdj Due Date Adjustment Internal ID
         * @returns {String}
         */
        doAdjustment(dueDate, subsidiary, dueDateAdj) {
            let daysAdjustment = this.getDaysAdjustment(dueDateAdj);

            let dateUtil = new DateUtility(dueDate); //this should not be a utility, it extends the capability of the date

            while (this.isHoliday(dateUtil, subsidiary) || this.isWeekend(dateUtil)) {
                dateUtil.addDays(daysAdjustment);
            }

            return dateUtil.getDate();
        };

        /**
         * Checks if Due Date falls on a weekend
         *
         * @param {String} dueDate Due Date
         * @returns {Boolean}
         */
        isWeekend(dueDate){
            let day = dueDate.getDayOfWeek();
            return (day === 6) || (day === 0);
        };

        /**
         * Checks if Due Date falls on a holiday
         *
         * @param {Date} dueDate Due Date
         * @param {String} subsidiary Subsidiary ID
         * @returns {Boolean}
         */
        isHoliday(dueDate, subsidiary){
            let holidays = dueDate.getHolidays(subsidiary);

            return (holidays.length > 0);
        };
    }

    return DueDateAdjuster;

});
