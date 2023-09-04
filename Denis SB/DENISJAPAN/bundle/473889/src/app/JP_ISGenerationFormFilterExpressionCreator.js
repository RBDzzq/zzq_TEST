/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    "N/search",
    "N/format",
    "N/runtime",
    "../data/JP_CustomerDAO",
    "../data/JP_TransactionDAO",
    "../lib/JP_ArrayUtility"
], (search, format, runtime, JP_CustomerDAO,
    JP_TransactionDAO, ArrayUtil) =>{

    function JP_ISGenerationFormFilterExpressionCreator(){
        this.name = "JP_ISGenerationFormFilterExpressionCreator";
    }

    let MAINLINE_FILTER = ["mainline", "is", "T"];
    let INCLUDE_IDS_FILTER = ["custbody_4392_includeids", "is", "T"];
    let CUSTOMER_ACTIVE_FILTER = ["customer.isinactive", "is", "F"];
    let CUSTOMER_USES_IDS_FILTER = ["customer.custentity_4392_useids", "is", "T"];

    let NO_EXISTING_IDS_FILTER = [[
        ["custbody_5185_idsnumber", "isempty", ""],
        "AND",
        ["custbody_suitel10n_jp_ids_rec", "anyof", "@NONE@"],
        "OR",
        ["custbody_suitel10n_jp_ids_rec", "noneof", "@NONE@"],
        "AND",
        ["custbody_suitel10n_jp_ids_rec.custbody_suitel10n_jp_ids_doc", "anyof", "@NONE@"]
    ]];

    let PENDING_APPROVAL_STATUS = "1";
    let REJECTED_APPROVAL_STATUS = "3";
    let INV_APPROVAL_STATUS_FILTER = ["approvalstatus", "noneof", [PENDING_APPROVAL_STATUS, REJECTED_APPROVAL_STATUS]];

    let INVOICE_TRAN_TYPE = "CustInvc";
    let CREDIT_MEMO_TRAN_TYPE = "CustCred";
    let SALES_ORDER_TRAN_TYPE = "SalesOrd";
    let SO_STATUS_CLOSED = "SalesOrd:H";
    let SO_STATUS_CANCELLED = "SalesOrd:C";
    let INV_STATUS_OPEN = "CustInvc:A";
    let INV_STATUS_PAID = "CustInvc:B";
    let CLOSED_SO_FILTER = ["status", "anyof", [SO_STATUS_CLOSED, SO_STATUS_CANCELLED]];
    let INVOICE_STATUS_FILTER = ["status", "anyof", [INV_STATUS_OPEN, INV_STATUS_PAID]];
    let CUSTOMER_HIERARCHY = "customrecord_jp_customer_hierarchy";
    let HIERARCHY_STORE_FIELD = "custrecord_jp_hierarchy_store";

    JP_ISGenerationFormFilterExpressionCreator.prototype.create = (params)=>{
        let initialIDSFilter = getInitialIDSFilter(params);
        let filterExpression = initialIDSFilter;

        if (params.overdue == "T") {
            let overdueFilter = [
                ["mainline", "is", "T"],
                "AND",
                ["status", "noneof", ["CustInvc:B"]],
                "AND",
                ["duedate", "before", [params.closingDate]],
                "AND",
                [
                    ["custbody_5185_idsnumber", "isnotempty", ""], "OR",
                    ["custbody_suitel10n_jp_ids_rec", "noneof", "@NONE@"]],
                "AND",
                ['custbody_4392_includeids', search.Operator.IS, 'T']
            ];

            let transactionDAO = new JP_TransactionDAO();
            let paramsClosingDateObj = format.parse({value:params.closingDate, type: format.Type.DATE});
            let overdueFilterExpression = transactionDAO.getOverdueInvoicesFilterExpression(overdueFilter, paramsClosingDateObj);
            filterExpression = overdueFilterExpression.length > 0 ?
                [[initialIDSFilter, "OR", overdueFilterExpression]] : filterExpression;
        }

        addStandardFilters(filterExpression);
        addSuiteletFilters(params, filterExpression);

        return filterExpression;
    };

    function getInitialIDSFilter(params) {
        let initialIDSFilter = [].concat(NO_EXISTING_IDS_FILTER);

        if (params.closingDate) {
            initialIDSFilter.push("AND");
            initialIDSFilter.push([
                ["custbody_suitel10n_inv_closing_date", "on", params.closingDate],
                "OR",
                ["custbody_suitel10n_jp_ids_date", "on", params.closingDate]]);
        }

        return initialIDSFilter;
    }


    function addStandardFilters(filterExpression) {
        filterExpression.push("AND");
        filterExpression.push(MAINLINE_FILTER);
        filterExpression.push("AND");
        filterExpression.push(INCLUDE_IDS_FILTER);
        filterExpression.push("AND");
        filterExpression.push(CUSTOMER_ACTIVE_FILTER);
        filterExpression.push("AND");
        filterExpression.push(CUSTOMER_USES_IDS_FILTER);
    }

    function addChildrenToCustomerFilter(params){
        let hierarchySearch = search.lookupFields({
            type: CUSTOMER_HIERARCHY,
            id: params.hierarchyId,
            columns: [HIERARCHY_STORE_FIELD]
        });

        let hierarchyObj = JSON.parse(hierarchySearch[HIERARCHY_STORE_FIELD]);
        let customerFamilyIds = [];
        if(params.customerId){
            let customerChildren = hierarchyObj[params.customerId] ? hierarchyObj[params.customerId].children : null;
            customerFamilyIds = customerChildren ? Object.keys(customerChildren) : [];
            customerFamilyIds.push(params.customerId);
        }else if(params.customerIds){
            params.customerIds.forEach((customer)=>{
                let customerChildren = hierarchyObj[customer] ? hierarchyObj[customer].children : null;
                customerFamilyIds = customerChildren ?
                    customerFamilyIds.concat(Object.keys(customerChildren)) :
                    customerFamilyIds;
                customerFamilyIds.push(customer);
            });
        }

        attachCustomerFilter(customerFamilyIds, params.filterExpression);
    }

    function addSuiteletFilters(params, filterExpression) {
        filterExpression.push("AND");

        let INVOICE_TYPE_FILTERS = [["type", "is", INVOICE_TRAN_TYPE], "AND", INV_APPROVAL_STATUS_FILTER, "AND",
            INVOICE_STATUS_FILTER];
        let CREDIT_MEMO_TYPE_FILTERS = ["type", "is", CREDIT_MEMO_TRAN_TYPE];
        let SALES_ORDER_TYPE_FILTERS = [["type", "is", SALES_ORDER_TRAN_TYPE], "AND", CLOSED_SO_FILTER];

        if (params.type) {
            if (params.type == INVOICE_TRAN_TYPE) {
                filterExpression.push(INVOICE_TYPE_FILTERS);
            } else if (params.type == CREDIT_MEMO_TRAN_TYPE) {
                filterExpression.push(CREDIT_MEMO_TYPE_FILTERS);
            } else if (params.type == SALES_ORDER_TRAN_TYPE) {
                filterExpression.push(SALES_ORDER_TYPE_FILTERS);
            }
        } else {
            filterExpression.push(
                [INVOICE_TYPE_FILTERS,
                    "OR",
                    CREDIT_MEMO_TYPE_FILTERS,
                    "OR",
                    SALES_ORDER_TYPE_FILTERS]);
        }

        let isConsolidated = (params.consolidated && params.consolidated === 'T' && params.hierarchyId);

        if (params.customerSavedSearch) {
            let customerDAO = new JP_CustomerDAO();
            let searchResults = customerDAO.executeSavedSearch({searchId:params.customerSavedSearch});
            let customers = [];
            for(let i in searchResults){
                customers.push(searchResults[i].id);
            }

            if(customers.length < 1){
                filterExpression.push("AND");
                filterExpression.push(["customer.internalid", search.Operator.ANYOF, "@NONE@"]);
            }
            else {
                if (isConsolidated) {
                    addChildrenToCustomerFilter({
                        customerIds: customers,
                        hierarchyId: params.hierarchyId,
                        filterExpression: filterExpression
                    });
                }
                else {
                    attachCustomerFilter(customers, filterExpression);
                }
            }

        } else if (params.custId) {
            if(isConsolidated){
                addChildrenToCustomerFilter({
                    customerId: params.custId,
                    hierarchyId: params.hierarchyId,
                    filterExpression: filterExpression
                })
            } else {
                filterExpression.push("AND");
                filterExpression.push(["customer.internalid", "is", params.custId]);
            }
        } else if (params.customer) {
            if(isConsolidated){
                addChildrenToCustomerFilter({
                    customerId: params.customer,
                    hierarchyId: params.hierarchyId,
                    filterExpression: filterExpression
                })
            } else {
                filterExpression.push("AND");
                filterExpression.push(["customer.internalid", "is", params.customer]);
            }
        }

        if (params.subsidiary) {
            filterExpression.push("AND");
            filterExpression.push(["subsidiary", "is", params.subsidiary]);

            // if filter is subsidiary only and consolidated
            filterExpression = addConsolidatedFilters(isConsolidated, params, filterExpression);
        }

        if( !runtime.isFeatureInEffect({feature: "SUBSIDIARIES"})){
            filterExpression = addConsolidatedFilters(isConsolidated, params, filterExpression);
        }
    }

    function addConsolidatedFilters(isConsolidated, params, filterExpression){

        if(isConsolidated &&
            (!params.customer && !params.customerSavedSearch)){
            let customers;
            if(params.customerList){
                customers = new ArrayUtil().flattenArrayHierarchy(params.customerList);
            }
            else {
                let hierarchySearch = search.lookupFields({
                    type: CUSTOMER_HIERARCHY,
                    id: params.hierarchyId,
                    columns: [HIERARCHY_STORE_FIELD]
                });

                let hierarchyObj = JSON.parse(hierarchySearch[HIERARCHY_STORE_FIELD]);
                customers = new ArrayUtil().flattenArrayHierarchy(hierarchyObj);
            }

            attachCustomerFilter(customers, filterExpression);
        }

        return filterExpression;
    }

    function attachCustomerFilter(customers, filterExpression){
        if(customers && customers.length > 0){
            filterExpression.push("AND", ["customer.internalid", search.Operator.ANYOF, customers]);
        }
    }

    return JP_ISGenerationFormFilterExpressionCreator;

});
