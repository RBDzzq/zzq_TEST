/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([], () => {

	const CLOSING_DATE = "custbody_suitel10n_inv_closing_date";
    const PAYMENT_DUE_DATE = "duedate";
    const ENTITY = "entity";
    const TRAN_DATE = "trandate";

	class DateAutoCalculationEvaluator {

        constructor() {}

        /**
         * Evaluate during record creation
         *
         * @param {Object} params Script context object
         * @param {Object} dateFields Date fields
         * @returns {Object}
         */
         evaluateOnCreate(params, dateFields){
            let autoCalculateClosingDate = true;
            let autoCalculateDueDate = true;

            const closingDate = params.newRecord.getValue(dateFields.closingDate);
            const dueDate = params.newRecord.getValue(dateFields.dueDate);
            const tranDate = params.newRecord.getValue(TRAN_DATE);

            if (params.executionContext === "csvimport") {
                /* If closing date is mapped */
                if (closingDate !== null) {
                    autoCalculateClosingDate = false;
                }

                /* If due date is mapped */
                if (dueDate !== null && dueDate.toString() !== tranDate.toString()) {
                    autoCalculateDueDate = false;
                }
            }
            else {

                if(!params.computeDueDate ||
                    dueDate && dueDate.toString() !== tranDate.toString()){
                    autoCalculateDueDate = false;
                }

                if (closingDate) {
                    autoCalculateClosingDate = false;
                }
            }

            return {autoCalculateClosingDate: autoCalculateClosingDate,
                autoCalculateDueDate: autoCalculateDueDate}
        }

        /**
         * Evaluate function during edit
         *
         * @param {Object} params Script context
         * @param {Object} dateFields Date fields
         * @returns {Object}
         */
         evaluateOnEdit(params, dateFields){
            let autoCalculateClosingDate = false;
            let autoCalculateDueDate = false;

            const oldEntity = params.oldRecord.getValue(ENTITY);
            const newEntity = params.newRecord.getValue(ENTITY);

            const oldTranDate = params.oldRecord.getValue(TRAN_DATE);
            const newTranDate = params.newRecord.getValue(TRAN_DATE);

            const oldClosingDate = params.oldRecord.getValue(dateFields.closingDate);
            const newClosingDate = params.newRecord.getValue(dateFields.closingDate);

            const oldDueDate = params.oldRecord.getValue(dateFields.dueDate);
            const newDueDate = params.newRecord.getValue(dateFields.dueDate);

            /* Compute Due Date checkbox is unchecked on entity record. */
            if(!params.computeDueDate){
                autoCalculateDueDate = false;

                if( oldEntity !== newEntity ||
                    oldTranDate.toString() !== newTranDate.toString()){
                    autoCalculateClosingDate = true;
                }
                else if(oldClosingDate.toString() !== newClosingDate.toString()){
                    autoCalculateClosingDate = false;
                }
            }
            else{
                /* If there is a change in entity value */
                if (oldEntity !== newEntity) {
                    autoCalculateClosingDate = true;
                    autoCalculateDueDate = true;
                }

                /* If there is a change in transaction date value */
                if (oldTranDate.toString() !== newTranDate.toString()) {
                    autoCalculateClosingDate = true;
                    autoCalculateDueDate = true;
                }

                /* If there is a change in closing date value */
                if (oldClosingDate.toString() !== newClosingDate.toString()) {
                    autoCalculateClosingDate = false;
                    autoCalculateDueDate = true;
                }

                /* If there is a change in due date value */
                if (oldDueDate.toString() !== newDueDate.toString() && params.executionContext !== 'CSVIMPORT') {
                    autoCalculateDueDate = false;
                }
            }

            return {autoCalculateClosingDate: autoCalculateClosingDate,
                autoCalculateDueDate: autoCalculateDueDate}
        }

        /**
         * Evaluate on XEdit
         *
         * @param {Object} params Script context
         * @param {Object} dateFields Date fields
         * @returns {Object}
         */
         evaluateOnXEdit(params, dateFields) {
            let autoCalculateClosingDate = false;
            let autoCalculateDueDate = false;

            let modifiedFields = params.newRecord.getFields();

            /* Compute Due Date checkbox is unchecked on entity record. */
            if(!params.computeDueDate){
                autoCalculateDueDate = false;

                if(modifiedFields.indexOf(ENTITY) !== -1 ||
                    modifiedFields.indexOf(TRAN_DATE) !== -1){
                    autoCalculateClosingDate = true;
                }
                else if(modifiedFields.indexOf(dateFields.closingDate) !== -1){
                    autoCalculateClosingDate = false;
                }
            }
            /* Perform regular checking when Compute Due Date = T */
            else {
                /* If there is a change in entity value */
                if (modifiedFields.indexOf(ENTITY) !== -1) {
                    autoCalculateClosingDate = true;
                    autoCalculateDueDate = true;
                }

                /* If there is a change in transaction date value */
                if (modifiedFields.indexOf(TRAN_DATE) !== -1) {
                    autoCalculateClosingDate = true;
                    autoCalculateDueDate = true;
                }

                /* If there is a change in closing date value */
                if (modifiedFields.indexOf(dateFields.closingDate) !== -1) {
                    autoCalculateClosingDate = false;
                    autoCalculateDueDate = true;
                }

                /* If there is a change in due date value */
                if (modifiedFields.indexOf(dateFields.dueDate) !== -1) {
                    autoCalculateDueDate = false;
                }
            }

            return {autoCalculateClosingDate: autoCalculateClosingDate,
                autoCalculateDueDate: autoCalculateDueDate}
        }


        evaluate(params){
            let evaluation;

            const dateFields = {
                closingDate: (params.dateFields) ? params.dateFields.closingDate : CLOSING_DATE,
                dueDate: (params.dateFields) ? params.dateFields.dueDate : PAYMENT_DUE_DATE,
                computeDueDate : params.computeDueDate
            };

            /* copy becomes create in beforesubmit */
            if (params.eventType === "create") {
                evaluation = this.evaluateOnCreate(params, dateFields);
            } else if (params.eventType === "edit") {
                evaluation = this.evaluateOnEdit(params, dateFields);
            } else if (params.eventType === "xedit") {
                evaluation = this.evaluateOnXEdit(params, dateFields);
            } else {
                evaluation = {autoCalculateClosingDate: false, autoCalculateDueDate: false};
            }

            return evaluation;
        }

    }

	return DateAutoCalculationEvaluator;

});
