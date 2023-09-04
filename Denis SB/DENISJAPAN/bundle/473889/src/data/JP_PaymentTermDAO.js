/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NModuleScope SameAccount
 * @NApiVersion 2.1
 */

define(["./JP_BaseDAO", "N/search", "N/runtime", "N/record", "../lib/JP_ArrayUtility"],
    (BaseDAO, search, runtime, record, ArrayUtil) =>{


    function PaymentTermDAO(){
            BaseDAO.call(this);
            this.PT_CLOSING_DAY = "custrecord_suitel10n_jp_pt_closing_day";
            this.CLOSING_DAY_VALUE = "custrecord_suitel10n_jp_cd_vl";
            this.PT_DUE_DATE = "custrecord_suitel10n_jp_pt_paym_due_day";
            this.DUE_DATE_VALUE = "custrecord_jp_dueday_value";
            this.PT_DUE_MONTH = "custrecord_suitel10n_jp_pt_paym_due_mo";
            this.DUE_MONTH_VALUE = "custrecord_jp4030_duemonth_value";

            this.fields = {};
            this.searchId = '';
            this.recordType = "customrecord_suitel10n_jp_payment_term";
        }

        util.extend(PaymentTermDAO.prototype, BaseDAO.prototype)

        PaymentTermDAO.prototype.retrieveTerms = function(entityField, entityId) {
            let filters = [
                {name:entityField, operator:search.Operator.IS, values:entityId}
            ];

            let columns = [];
            columns.push({name:this.PT_DUE_MONTH});
            columns.push({name:this.DUE_MONTH_VALUE, join:this.PT_DUE_MONTH});
            columns.push({name:this.DUE_DATE_VALUE, join:this.PT_DUE_DATE});
            columns.push({name:this.CLOSING_DAY_VALUE, join:this.PT_CLOSING_DAY, sort: search.Sort.ASC});

            let ptSearch = this.createSearch();
            ptSearch.filters = filters;
            ptSearch.columns = columns;

            let iterator = this.getResultsIterator(ptSearch);
            let terms = [];
            while (iterator.hasNext()){
                let result = iterator.next();
                let term = {
                    "id" : result.id,
                    "closingDay" : Number(result.getValue({name:this.CLOSING_DAY_VALUE, join:this.PT_CLOSING_DAY})),
                    "paymentDueDay" : Number(result.getValue({name:this.DUE_DATE_VALUE, join:this.PT_DUE_DATE})),
                    "paymentDueMonth" : Number(result.getValue({name:this.DUE_MONTH_VALUE, join:this.PT_DUE_MONTH})),
                    "paymentDueMonthId" : result.getValue({name: this.PT_DUE_MONTH})
                };
                term.closeOnLastDay = term.closingDay === 31;
                term.dueOnLastDay = term.paymentDueDay === 31;
                terms.push(term);
            }

            return terms;
        };

        PaymentTermDAO.prototype.getTermsByEntity = function(entityId, entityType) {
            let fieldId = '';
            switch (entityType) {
                case record.Type.VENDOR:
                    fieldId = 'custrecord_suitel10n_jp_pt_vendor';
                    break;
                case record.Type.EMPLOYEE:
                    fieldId = 'custrecord_suitel10n_jp_pt_employee';
                    break;
                default:
                    fieldId = 'custrecord_suitel10n_jp_pt_customer';
                    break;
            }

            return this.retrieveTerms(fieldId, entityId);
        }

        PaymentTermDAO.prototype.retrievePaymentTermsPerCustomer = function(customers) {

            let filters = [
                {name:"custrecord_suitel10n_jp_pt_customer", operator: search.Operator.ANYOF, values: customers}
            ];

            let columns = [
                {name: "internalid"},
                {name: "custrecord_suitel10n_jp_pt_closing_day"},
                {name: "custrecord_jp_dueday_value", join: "custrecord_suitel10n_jp_pt_paym_due_day"},
                {name: "custrecord_suitel10n_jp_pt_paym_due_mo"},
                {name: "custrecord_suitel10n_jp_pt_customer"},
                {name: "companyname", join: "custrecord_suitel10n_jp_pt_customer"},
                {name: "firstname", join: "custrecord_suitel10n_jp_pt_customer"},
                {name: "lastname", join: "custrecord_suitel10n_jp_pt_customer"},
                {name: "entityid", join: "custrecord_suitel10n_jp_pt_customer"}
            ];

            let paymentTermSearch = this.createSearch();
            paymentTermSearch.filters = filters;
            paymentTermSearch.columns = columns;
            let iterator = this.getResultsIterator(paymentTermSearch);

            let customersObj = {};
            while (iterator.hasNext()){
                let paymentTerm = iterator.next();
                let customerId = paymentTerm.getValue({name: 'custrecord_suitel10n_jp_pt_customer'});

                if (!customersObj.hasOwnProperty(customerId)) {
                    customersObj[customerId] = {};
                    customersObj[customerId].id = customerId;
                    customersObj[customerId].companyname = paymentTerm.getValue({name: 'companyname',
                        join: 'custrecord_suitel10n_jp_pt_customer'});
                    customersObj[customerId].firstname = paymentTerm.getValue({name: 'firstname',
                        join: 'custrecord_suitel10n_jp_pt_customer'});
                    customersObj[customerId].lastname = paymentTerm.getValue({name: 'lastname',
                        join: 'custrecord_suitel10n_jp_pt_customer'});
                    customersObj[customerId].entityid = paymentTerm.getValue({name: 'entityid',
                        join: 'custrecord_suitel10n_jp_pt_customer'});
                    customersObj[customerId].terms = [];
                }

                customersObj[customerId].terms.push({
                    'id' : paymentTerm.getValue('internalid'),
                    'closingDay' : parseInt(paymentTerm.getValue({name: 'custrecord_suitel10n_jp_pt_closing_day'}), 10),
                    'paymentDueDay' : parseInt(paymentTerm.getValue({name: 'custrecord_jp_dueday_value',
                        join: 'custrecord_suitel10n_jp_pt_paym_due_day'}), 10),
                    'paymentDueMonth' : parseInt(paymentTerm.getValue({name: 'custrecord_suitel10n_jp_pt_paym_due_mo'}), 10)
                });
            }

            return customersObj;
        }

        PaymentTermDAO.prototype.retrieveTermsOfMultipleEntities = function(entityField, entityIds) {

            let ptSearch = this.createSearch();

            if(entityIds && entityIds.length > 0) {
                ptSearch.filterExpression = [entityField, search.Operator.ANYOF, entityIds];
            }

            let columns = [];
            columns.push({name:entityField});
            columns.push({name:this.CLOSING_DAY_VALUE, join:this.PT_CLOSING_DAY, sort: search.Sort.ASC});
            ptSearch.columns = columns;

            let iterator = this.getResultsIterator(ptSearch);
            let terms = {};
            while (iterator.hasNext()){
                let result = iterator.next();
                let entity = result.getValue({name:entityField});
                if((Object.keys(terms)).indexOf(entity) === -1){
                    terms[entity] = [];
                }
                let term = {
                    "id" : result.id,
                    "closingDay" : Number(result.getValue({name:this.CLOSING_DAY_VALUE, join:this.PT_CLOSING_DAY})),
                };
                term.closeOnLastDay = term.closingDay === 31;
                terms[entity].push(term);
            }

            return terms;
        }

    return PaymentTermDAO;
});
