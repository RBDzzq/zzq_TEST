/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["../data/JP_SubsidiaryHolidayDAO"], (SubsidiaryHolidayDAO) =>{

    let FEB = 1;
    let APR = 3;
    let JUN = 5;
    let SEP = 8;
    let NOV = 10;

    class DateUtility {
        constructor(d) {
            this.name = 'DateUtility';
            if (d) {
                this.date = new Date(d.getTime());
            }
        }

        /**
         * Set the Date's time to the given amount of milliseconds since Jan 1 1970
         *
         * @public
         * @instance
         * @param time
         * @returns {Number} value of input after putting the data in a this.date object
         */
        setTime(time) {
            this.date = this.date || new Date();
            this.date.setTime(time);
            return this.date.getTime();
        };


        /**
         * This function sets the hours, min, secs, ms
         * @param hour
         * @param min
         * @param sec
         * @param ms
         */
        setHours(hour, min, sec, ms) {
            this.date.setHours(hour, min, sec, ms);
        };


        /**
         * Return the this.date's time in milliseconds since Jan 1 1970
         *
         * @public
         * @instance
         * @param time
         * @returns {Number} value of input after putting the data in a this.date object
         */
        getTime() {
            return this.date.getTime();
        };


        getLastDayOfMonth() {
            let MONTHS_W_30_DAYS = [APR, JUN, SEP, NOV];

            let day = 31;
            let month = this.getMonth();
            if (MONTHS_W_30_DAYS.indexOf(month) !== -1) {
                day = 30;
            } else if (month === FEB) {
                if (this.isLeapYear()) {
                    day = 29;
                } else {
                    day = 28;
                }
            }
            return day;
        };


        /**
         * Returns the raw this.date
         *
         * @public
         * @instance
         * @returns {Date} the updated JavaScript this.date object
         */
        getDate() {
            return this.date;
        };

        /**
         * Returns the day of the month
         *
         * @public
         * @instance
         * @returns {Number}
         */
        getDay() {
            return Number(this.date.getDate());
        };


        /**
         * Returns the day of the week
         * @returns {Number}
         */
        getDayOfWeek(d) {
            if(d) {
                return Number(d.getDay())
            } else {
                return Number(this.date.getDay());
            }
        };


        /**
         * Returns the index value of the month
         * This method follows javascript standards so January is 0, Feb is 1...
         *
         * @public
         * @instance
         * @returns {Number}
         */
        getMonth() {
            return Number(this.date.getMonth());
        };


        /**
         * Returns the year
         *
         * @public
         * @instance
         * @returns {Number}
         */
        getYear() {
            return Number(this.date.getFullYear());
        };


        /**
         * Returns the hour
         */
        getHours() {
            return Number(this.date.getHours());
        };


        /**
         * Returns the minutes
         */
        getMinutes() {
            return Number(this.date.getMinutes());
        };

        /**
         * Returns the seconds
         */
        getSeconds() {
            return Number(this.date.getSeconds());
        };


        /**
         * Returns true if the given year is a leap year
         *
         * @public
         * @instance
         * @returns {Boolean}
         */
        isLeapYear() {
            let year = this.getYear();

            let isDivBy4 = year % 4 === 0;
            let isDivBy100 = year % 100 === 0;
            let isDivBy400 = year % 400 === 0;
            return (isDivBy4 && !isDivBy100) || isDivBy400;
        };

        addDays(days){
            this.date.setDate(this.date.getDate() + days);
            return this.date;
        };

        addMonths(months){
            /**
             * JavaScript this.date.setMonth sets the month on the current value of this.date
             * Default behavior will auto adjust if new this.date is invalid
             * Examples:
             *  Feb 30 will become March 2 on a non leap year
             *  Feb 30 will become March 1 on a leap year
             *  Sep 31 will become October 1
             *
             * Solution is to pass a 2nd parameter to set the this.date to the first day of the new month (e.g. Feb 30 -> Mar 1)
             */
            this.date.setMonth(this.date.getMonth() + months, 1);
            return this.date;
        };

        setMonth(months){
            /**
             * JavaScript this.date.setMonth sets the month on the current value of this.date
             * Default behavior will auto adjust if new this.date is invalid
             * Examples:
             *  Feb 30 will become March 2 on a non leap year
             *  Feb 30 will become March 1 on a leap year
             *  Sep 31 will become October 1
             *
             * Solution is to pass a 2nd parameter to set the this.date to the first day of the new month (e.g. Feb 30 -> Mar 1)
             */
            this.date.setMonth(months, 1);
            return this.date;
        };

        setYear(year){
            this.date.setFullYear(year);
            return this.date;
        };

        /**
         * Sets the day of the this.date object and returns the same value
         *
         * @public
         * @instance
         * @returns {Number}
         * */
        setDay(day){
            this.date.setDate(day);
            return this.date;
        };

        /**
         * Returns the day of the month
         *
         * @public
         * @instance
         * @returns {Number}
         */
        getDate(){
            return this.date;
        };

        getHolidays(subsidiary) {
            let holidayDAO = new SubsidiaryHolidayDAO();
            return holidayDAO.getHolidays(subsidiary, this.date);
        };


        isPastDate(date1, date2) {
            if(!date2) {
                date2 = new Date();
            }

            return date1.getTime() < date2.getTime();
        };

        isWeekend(d) {
            let dIsWeekend = this.date;
            if (d){
                dIsWeekend = d;
            }

            let day = this.getDayOfWeek(dIsWeekend);
            return (day == 6) || (day == 0);
        };
    }

    return DateUtility;
});
