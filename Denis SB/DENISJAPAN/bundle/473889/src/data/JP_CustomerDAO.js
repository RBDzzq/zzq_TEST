/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    "./JP_BaseDAO",
    "./JP_PaymentTermDAO",
    "./NQuery/JP_NCustTreeDAO",
    "../app/JP_PaymentTermUtility",
    "N/search",
    "N/record",
    "N/format",
    "../lib/JP_ArrayUtility"
], (
    BaseDAO,
    PaymentTermDAO,
    CustTreeDAO,
    PaymentTermUtility,
    search,
    record,
    format,
    ArrayUtil
) => {

    function CustomerDAO(){
            BaseDAO.call(this);
            this.fields = {};
            this.searchId = '';
            this.recordType = search.Type.CUSTOMER;
        }

        util.extend(CustomerDAO.prototype, BaseDAO.prototype);

        /**
         * Get primary and secondary subsidiaries of customer and return their internal IDs
         *
         * @param {String} customer Customer internal ID search filter value
         * @returns {Array} Array of Subsidiary internal IDs
         */
        CustomerDAO.prototype.getCustomerSubsidiaries = function(customer){
            let SUBSIDIARY_FIELD = 'subsidiary';
            let customerSubsidiaries = [];
            if (customer) {

                let customerRecord = record.load({
                    type: this.recordType,
                    id: customer
                });
                let primarySub = customerRecord.getValue({
                    fieldId: SUBSIDIARY_FIELD
                });
                customerSubsidiaries.push(primarySub);

                let subLines = this.getSublistValues({
                    record: customerRecord,
                    sublistId: 'submachine',
                    fields: [SUBSIDIARY_FIELD]
                });

                util.each(subLines, (subLine) => {
                    if (customerSubsidiaries.indexOf(subLine[SUBSIDIARY_FIELD]) === -1) {
                        customerSubsidiaries.push(subLine[SUBSIDIARY_FIELD]);
                    }
                });

            }

            return customerSubsidiaries;
        };

        /**
         * Retrieve customer name
         *
         * @param int Customer ID
         * @returns {String} Customer name
         */
        CustomerDAO.prototype.getCustomerName=function(customerId){
            let customerLookup = search.lookupFields({
                type: this.recordType,
                id: customerId,
                columns: ['companyname', 'firstname', 'lastname']
            });
            let companyname = customerLookup['companyname'];
            let firstname = customerLookup['firstname'];
            let lastname = customerLookup['lastname'];
            return companyname ? companyname : [firstname, lastname].join(" ");
        };

        /**
         * Generate parameters for customers without transactions
         *
         * @param params Filters passed in the IS Search Suitelet
         * @returns Obj Generation params appended to existing params in the request
         */
        CustomerDAO.prototype.getParamsWithCustWOTxn=function(params){

            // Get all entities from the generation params
            let forGen = params.generationParams.forGeneration;
            let currentEntities = [];
            for(let i in forGen){
                let entity = forGen[i].entity;
                if(currentEntities.indexOf(entity) === -1){
                    currentEntities.push(entity);
                }
            }
            // Get resulting customers if customer saved search is available
            let customers = [];
            if(params.customerSavedSearch){
                let customerSearchResults = this.executeSavedSearch({searchId:params.customerSavedSearch});
                for(let j in customerSearchResults){
                    customers.push(customerSearchResults[j].id);
                }
            }

            let requestParams = {
                subsidiaryFilter: params.subsidiary,
                customerFilter: params.customer,
                customerListFilter: customers,
                closingDate: params.closingDate,
                hierarchyId: params.hierarchyId
            };
            let addtlCustomers = this.getCustomersWithNoTransactions(requestParams,currentEntities);
            return addtlCustomers && addtlCustomers.length > 0 ?
                params.generationParams.forGeneration.concat(addtlCustomers) :
                params.generationParams.forGeneration;
        };

        /**
         * Retrieve all customers w/o transactions whose Payment Terms match the Closing Date
         *
         * @param requestParams Request record parameters
         * @param existingEntities Customers that have transactions
         * @returns [Object] Array of objects that represent customers w/o transactions
         */
        CustomerDAO.prototype.getCustomersWithNoTransactions=function(requestParams, existingEntities) {

            let NO_TRANS_CUSTOMER_SEARCH = 'customsearch_suitel10n_no_trans_customer';
            let MSESUBSIDIARY = 'msesubsidiary.internalid';
            let INTERNAL_ID = 'internalid';

            let subsidiary = requestParams.subsidiaryFilter;
            let customer = requestParams.customerFilter;
            let customerList = requestParams.customerListFilter;
            let closingDate = requestParams.closingDate;

            // assume all customers have transactions first
            let allCustomersHaveTransactions = true;

            let filterExpression = [];

            if(subsidiary){
                filterExpression.push('AND');
                filterExpression.push([MSESUBSIDIARY,search.Operator.IS,subsidiary]);
            }

            if (customer) { // customer from the customer filter
                if (existingEntities.indexOf(customer) === -1) {
                    filterExpression.push('AND');
                    filterExpression.push([INTERNAL_ID,search.Operator.IS,customer]);

                    //customer is not found on the list of existing customers with transactions
                    allCustomersHaveTransactions = false;
                }

            }
            else if(customerList.length > 0) { // list of customers from the customer saved search filter

                let customersWOTransaction = [];
                for(let i in customerList){
                    if (existingEntities.indexOf(customerList[i]) === -1) {
                        customersWOTransaction.push(customerList[i]);
                    }
                }
                if(customersWOTransaction.length > 0){
                    filterExpression.push('AND',[INTERNAL_ID, search.Operator.ANYOF, customersWOTransaction]);
                }

                // at least one entity from the customer saved search has no transaction
                allCustomersHaveTransactions = customersWOTransaction.length > 0 ? false : allCustomersHaveTransactions;
            }
            else{ // no customer or customer saved search provided
                if (existingEntities.length > 0) {
                    filterExpression.push('AND');
                    filterExpression.push([INTERNAL_ID,search.Operator.NONEOF,existingEntities]);
                }
                allCustomersHaveTransactions = false;
            }

            let customers = [];

            if (!allCustomersHaveTransactions) {
                let originalFilterExpression = search.load(
                    {type:search.Type.CUSTOMER,id:NO_TRANS_CUSTOMER_SEARCH}).filterExpression;
                let customerSearchResults = this.executeSavedSearch({
                    searchId:NO_TRANS_CUSTOMER_SEARCH,
                    filterExpression: originalFilterExpression.concat(filterExpression)
                });

                let parentLookup = new CustTreeDAO().createParentLookupTable(requestParams.hierarchyId);
                let customerIds = [];
                for (let m in customerSearchResults) {
                    let custId = customerSearchResults[m].id;
                    if ((parentLookup && parentLookup[custId] == custId) || !parentLookup) {
                        customerIds.push(custId);
                    }
                }

                // only include customers whose payment terms match the input closing date
                if(customerIds && customerIds.length > 0){
                    let customerPymtTerms = new PaymentTermDAO().retrievePaymentTermsPerCustomer(customerIds);
                    for (let n in customerIds) {
                        let cust = customerIds[n];
                        let pymtTerm = customerPymtTerms[cust];
                        let pymtTermUtil = new PaymentTermUtility(pymtTerm);
                        let parsedClosingDate = format.parse({value:closingDate,type:format.Type.DATE});
                        if (pymtTermUtil.isValidClosingDate(parsedClosingDate)) {
                            // Follow structure of GetInputData's return array elements
                            customers.push({
                                transaction : '',
                                entity : cust,
                                closingDate : closingDate
                            });
                        }
                    }
                }
            }

            return customers;
        };

    return CustomerDAO;
});
