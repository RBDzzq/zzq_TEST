/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    "../data/JP_TransactionDAO",
    "./JP_ISGenerationFormFilterExpressionCreator",
    "../data/JP_InvoiceSummaryDAO",
    "../data/JP_PaymentTermDAO",
    "../data/JP_EntityDAO",
    "../data/JP_CustomerDAO",
    "../data/NQuery/JP_NCustTreeDAO",
    "../lib/JP_DateUtility",
    "../lib/JP_StringUtility",
    "../app/JP_PaymentTermUtility",
    "N/search",
    "N/url",
    "N/format",
    "N/record",
    "../lib/JP_TCTranslator",
    "../lib/JP_ArrayUtility"
], (
    TransactionDAO,
    FilterExpressionCreator,
    InvoiceSummaryDAO,
    PaymentTermDAO,
    EntityDAO,
    CustomerDAO,
    CustomerTree,
    DateUtility,
    StringUtility,
    PaymentTermUtility,
    search,
    url,
    format,
    record,
    translator,
    ArrayUtil
) => {

    let TRANSACTION_RESULT_TYPE = "transactionresult";
    let ENTITY_RESULT_TYPE = "entityresult";
    let BLANK = "-";
    let ZERO = "0";

    let ENTITY = "entity";
    let INTERNALID = "internalid";
    let GROUP = "group";
    let SUM = "sum";
    let COUNT = "count";
    let AMOUNT = "amount";
    let TYPE = "type";
    let INV_COUNT_LBL = "IDS_LABEL_IDS_SULIST_INVOICE_COUNT";
    let SO_COUNT_LBL = "IDS_LABEL_IDS_SULIST_SO_COUNT";
    let CM_COUNT_LBL = "IDS_LABEL_IDS_SULIST_CM_COUNT";
    let DRILLDOWN_SCRIPT_ID = "customscript_is_drilldown_su";
    let DRILLDOWN_DEPLOY_ID = "customdeploy_is_drilldown_su";
    let CUSTOMER_WO_TXN_SEARCH = "customsearch_suitel10n_no_trans_customer";
    let texts;
    let params;
    let transactionDefinition = {};
    let parentLookup = {};

    function JP_ISGenerationResultValuesHandler(p){
        texts = new translator().getTexts([INV_COUNT_LBL, SO_COUNT_LBL, CM_COUNT_LBL], true);

        transactionDefinition = {
            "CustCred" : { amount : "credit_memo_amount", countLabel : texts[CM_COUNT_LBL] },
            "CustInvc" : { amount : "invoice_amount", countLabel : texts[INV_COUNT_LBL] },
            "SalesOrd" : { amount : "sales_order_amount", countLabel : texts[SO_COUNT_LBL] }
        };
        params = p;
    }

    JP_ISGenerationResultValuesHandler.prototype.getValues = function(){
        log.debug("JP_ISGenerationResultValuesHandler.getValues()", JSON.stringify(params));
        if(params.hierarchyId){
            let custTree = new CustomerTree();
            let customerHierarchy = record.load({
                type: custTree.recordType,
                id: params.hierarchyId
            });
            let hierarchyStore = customerHierarchy.getValue({fieldId: custTree.fields.hierarchystore});

            if(!!hierarchyStore){
                params.customerList = JSON.parse(hierarchyStore);
            }
        }

        let filterExpCreator = new FilterExpressionCreator();
        let filterExpression = filterExpCreator.create(params);

        log.debug("Filter Expression upon loading search result", JSON.stringify(filterExpression));

        let transDAO = new TransactionDAO();
        let searchResults = transDAO.executeSavedSearch({
            searchId: "customsearch_suitel10n_jp_ids_cust_trans",
            filterExpression: filterExpression
        });

        let results = {};
        let sublistLines = [];
        let customerIds;
        let existingCustomers = [];

        if(params.hierarchyId){ //consolidated IS
            //group transactions belonging to child to its parent.
            let entityGrouping = {};
            parentLookup = new CustomerTree().createParentLookupTable(null, params.customerList);
            log.debug("Customer List:", JSON.stringify(params.customerList));
            log.debug("parentLookup:", JSON.stringify(parentLookup));

            searchResults.forEach((result) => {
                let entityId = result.getValue({name:ENTITY, summary: GROUP});
                let parent = parentLookup[entityId];

                //group first parent-child results, then take the sum of values before pushing to results.
                if(!entityGrouping[parent]){
                    let parentCustomer = params.customerList[parent];
                    let custName = (parentCustomer.isperson) ? parentCustomer.lastname + " " + parentCustomer.firstname :
                            parentCustomer.companyname;

                    entityGrouping[parent] = {
                        name: custName,
                        id: parent,
                        transactions : {}
                    };
                }

                //group per transaction type:
                let transactionType = result.getValue({name: TYPE, summary: GROUP});

                if(entityGrouping[parent].transactions.hasOwnProperty(transactionType) === false){
                    entityGrouping[parent].transactions[transactionType] = { amount : 0.00, count: 0.00 };
                }

                let tmpSum = parseFloat(result.getValue({name: AMOUNT, summary: SUM}));
                let tmpCount = parseInt(result.getValue({name: INTERNALID, summary: COUNT} ));
                entityGrouping[parent].transactions[transactionType].amount += tmpSum;
                entityGrouping[parent].transactions[transactionType].count += tmpCount;
            });

            customerIds = new ArrayUtil().flattenArrayHierarchy(params.customerList);
            let customerBalancesAndPayments = getCustomerBalancesAndPayments(customerIds, params.subsidiary);
            log.debug("customerBalancesAndPayments", JSON.stringify(customerBalancesAndPayments));

            //we also consolidate the balances and payments to the parent customer.
            let groupedPaymentsObj = {};
            let parentIds = Object.keys(params.customerList);

            customerIds.forEach((customerId)=> {
                let parent = parentLookup[customerId];
                if(!groupedPaymentsObj[parent]){
                    groupedPaymentsObj[parent] = {
                        custInfo : customerBalancesAndPayments.customersInfo[parent],
                        previousPeriod : 0.00,
                        paymentsReceived : 0.00,
                        childPayments : [] //will contain paymentObjects for child customers.
                    }
                }

                groupedPaymentsObj[parent].previousPeriod +=
                    parseFloat(customerBalancesAndPayments.customersBalances[customerId]);

                //not all customers will return payments, we do an if to prevent errors.
                if(customerBalancesAndPayments.customersPayments[customerId]){

                    if(parentIds.indexOf(customerId) !== -1){ //current customer is parent.
                        groupedPaymentsObj[parent].paymentsReceived =
                            customerBalancesAndPayments.customersPayments[customerId];
                    }
                    else{
                        groupedPaymentsObj[parent].childPayments.push({
                            custInfo : customerBalancesAndPayments.customersInfo[customerId],
                            paymentsReceived : customerBalancesAndPayments.customersPayments[customerId]
                        });
                    }
                }
            });

            //converting them to view:
            log.debug("Entity Grouping", JSON.stringify(entityGrouping));
            log.debug("groupedPayments ", JSON.stringify(groupedPaymentsObj));
            for(let k in entityGrouping){
                let view = convertToView(entityGrouping[k], TRANSACTION_RESULT_TYPE, groupedPaymentsObj[k], true);
                sublistLines.push(view);
            }
            existingCustomers = Object.keys(entityGrouping);
        }
        else{
            for (let i = 0; i < searchResults.length; i++) {
                let entity = searchResults[i].getValue({name: ENTITY, summary: GROUP});
                pushToResult(results, searchResults[i], entity);
            }

            /* Obtaining all the customer IDs */
            customerIds = Object.keys(results);
            let customerBalancesAndPayments = getCustomerBalancesAndPayments(customerIds, params.subsidiary);

            for (let key in results) {
                let paymentsObj = {
                    "custInfo" : customerBalancesAndPayments.customersInfo[key],
                    "previousPeriod" : customerBalancesAndPayments.customersBalances[key],
                    "paymentsReceived" : customerBalancesAndPayments.customersPayments[key],
                };

                let view = convertToView(results[key], TRANSACTION_RESULT_TYPE, paymentsObj);
                sublistLines.push(view);
            }
            existingCustomers = customerIds;
        }

        /* If "Include customers with no transactions" is checked */
        if (params.noTransaction == "T") {
            let paramObj = {
                existingCustomers,
                customer: params.customer,
                subsidiary: params.subsidiary,
                customerSavedSearch: params.customerSavedSearch,
                consolidated: params.consolidated,
                customerList: params.customerList
            };

            let customersWOtransactionLines = getCustomersWOTransactions(paramObj);

            sublistLines = sublistLines.concat(customersWOtransactionLines);
        }

        return sublistLines;
    };

    function pushToResult(results, item, entityId){
        if (results[entityId]) {
            results[entityId].push(item);
        } else {
            results[entityId] = [item];
        }
    }

    function getCustomersWOTransactions(paramObj) {
        let proceedSearchNoTransaction = false;
        let sublistLines = [];
        let custId = paramObj.customer;
        let custSavedSearch = paramObj.customerSavedSearch;
        let subId = paramObj.subsidiary;
        let existingLines = paramObj.existingCustomers;

        let entityDAO = new EntityDAO();
        let filterExpression = [];
        let parentIds = [];
        let hierarchyObj = {};

        if(paramObj.consolidated && paramObj.consolidated === 'T' && paramObj.customerList){
            hierarchyObj = paramObj.customerList;

            // keep track of parent IDs for reference when building the payments object
            parentIds = Object.keys(hierarchyObj);

            // consider children of existing parents as existing customers
            let additionalExistingCustomers = [];
            existingLines.forEach((parentId)=>{
                if(hierarchyObj[parentId] && hierarchyObj[parentId].children){
                    let children = Object.keys(hierarchyObj[parentId].children);
                    additionalExistingCustomers = additionalExistingCustomers.concat(children);
                }
            });
            existingLines = existingLines.concat(additionalExistingCustomers);
        }

        if (subId) {
            filterExpression.push("AND");
            filterExpression.push(['msesubsidiary.internalid', search.Operator.IS, subId]);
        }

        if (custSavedSearch) {
            let customerDAO = new CustomerDAO();
            let searchResults = customerDAO.executeSavedSearch({searchId:custSavedSearch});
            let customers = [];
            for(let i in searchResults){
                let customerResultId = searchResults[i].id;
                if (existingLines.indexOf(customerResultId) <= -1) {
                    customers.push(customerResultId);
                }
            }

            if(paramObj.consolidated && paramObj.consolidated === 'T'){
                let childCustomers = [];
                customers.forEach((parentId)=>{
                    if(hierarchyObj[parentId]){
                        let children = Object.keys(hierarchyObj[parentId].children);
                        childCustomers = childCustomers.concat(children);
                    }
                });
                customers = customers.concat(childCustomers);
            }

            if(customers.length > 0){
                filterExpression.push('AND',["internalid", "ANYOF", customers]);
                proceedSearchNoTransaction = true;
            } else {
                filterExpression.push(["internalid", search.Operator.ANYOF, "@NONE@"]);
            }
        } else if (custId) {
            /* Has customer filter */
            if (existingLines.indexOf(custId) <= -1) {
                if(paramObj.consolidated && paramObj.consolidated === 'T'){
                    if(hierarchyObj[custId]){
                        let customerTreeIds = Object.keys(hierarchyObj[custId].children);
                        customerTreeIds.push(custId);
                        filterExpression.push('AND', ['internalid', "ANYOF", customerTreeIds]);
                        proceedSearchNoTransaction = true;
                    }
                }else{
                    /* The selected customer HAS NO transaction for the period */
                    filterExpression.push("AND");
                    filterExpression.push(['internalid', search.Operator.IS, custId]);
                    proceedSearchNoTransaction = true;
                }
            }
        } else {
            /* Has NO customer filter */
            if (existingLines.length > 0) {
                filterExpression.push("AND");
                filterExpression.push(['internalid', search.Operator.NONEOF, existingLines]);
            }

            proceedSearchNoTransaction = true;
        }

        if(proceedSearchNoTransaction) {
            let originalFilterExpression = search.load({
                type:search.Type.CUSTOMER,
                id:CUSTOMER_WO_TXN_SEARCH}).filterExpression;
            let customerWOTxnSearchResults = entityDAO.executeSavedSearch({
                searchId: CUSTOMER_WO_TXN_SEARCH,
                filterExpression: originalFilterExpression.concat(filterExpression)
            });

            let customerIds = [];
            for (let idx = 0; idx < customerWOTxnSearchResults.length; idx++) {
                customerIds.push(customerWOTxnSearchResults[idx].id);
            }

            let customerBalancesAndPayments = getCustomerBalancesAndPayments(customerIds, params.subsidiary);
            customerIds = customerBalancesAndPayments.customerIds;

            if(paramObj.consolidated && paramObj.consolidated === 'T') {

                let paymentsObjects = {};

                // create payment objects containing parent data only
                let parentsFromCustomerIds = customerIds.filter(value => parentIds.includes(value));
                parentsFromCustomerIds.forEach((parentId)=>{
                    customerIds.splice(customerIds.indexOf(parentId),1);
                    if(!doesClosingDateMatchATerm(parentId, customerBalancesAndPayments, params.closingDate)){
                        return;
                    }
                    paymentsObjects[parentId] = {
                        "custInfo" : customerBalancesAndPayments.customersInfo[parentId],
                        "previousPeriod" : customerBalancesAndPayments.customersBalances[parentId],
                        "paymentsReceived" : customerBalancesAndPayments.customersPayments[parentId]
                    };
                });

                // process children and add data to their parent's entry
                customerIds.forEach((childId)=>{
                    let parentId = parentLookup[childId];
                    if(!parentId || !doesClosingDateMatchATerm(childId, customerBalancesAndPayments, params.closingDate)){
                        return;
                    }
                    let previousBalanceOfChild = customerBalancesAndPayments.customersBalances[childId];
                    paymentsObjects[parentId]['previousPeriod'] =
                        parseFloat(paymentsObjects[parentId]['previousPeriod']) +
                        parseFloat(previousBalanceOfChild);
                    let paymentReceivedByChild = customerBalancesAndPayments.customersPayments[childId];
                    if(paymentReceivedByChild){
                        if(paymentsObjects[parentId]['paymentsReceived']){
                            paymentsObjects[parentId]['paymentsReceived']['payments'] =
                                paymentsObjects[parentId]['paymentsReceived']['payments'].concat(
                                    paymentReceivedByChild['payments']
                                );
                        }else{
                            paymentsObjects[parentId]['paymentsReceived'] = paymentReceivedByChild['payments'];
                        }

                    }
                });

                // convert to view after consolidating parent-children data
                Object.keys(paymentsObjects).forEach((obj)=>{
                    let entityView = convertToView("", ENTITY_RESULT_TYPE, paymentsObjects[obj], true);
                    if(entityView)
                        sublistLines.push(entityView);
                });

            }else{
                for (let j in customerIds) {
                    let customerId = customerIds[j];
                    if(!doesClosingDateMatchATerm(customerId, customerBalancesAndPayments, params.closingDate)){
                        return;
                    }

                    let paymentsObj = {
                        "custInfo" : customerBalancesAndPayments.customersInfo[customerId],
                        "previousPeriod" : customerBalancesAndPayments.customersBalances[customerId],
                        "paymentsReceived" : customerBalancesAndPayments.customersPayments[customerId]
                    };

                    let entityView = convertToView("", "entityresult", paymentsObj);
                    sublistLines.push(entityView);
                }
            }
        }

        return sublistLines;
    }

    function doesClosingDateMatchATerm(cId, balancesAndPayments, cDate){
        let custInfo = balancesAndPayments.customersInfo[cId];
        let entityTermsObj = new PaymentTermUtility(custInfo);
        let closingDate = format.parse({value:cDate,type:format.Type.DATE});
        return entityTermsObj.isValidClosingDate(closingDate);
    }

    function getCustomerBalancesAndPayments(customerIds, subsidiary) {
        let customerBalancesAndPayments = {
            customersInfo : {},
            customerIds : [],
            customersBalances : {},
            customersPayments : {}
        };

        if (customerIds.length > 0){
            let isDAO = new InvoiceSummaryDAO();
            let pmyTermDAO = new PaymentTermDAO();
            let transDAO = new TransactionDAO();

            customerBalancesAndPayments.customersInfo = pmyTermDAO.retrievePaymentTermsPerCustomer(customerIds);
            customerBalancesAndPayments.customerIds = Object.keys(customerBalancesAndPayments.customersInfo);
            customerBalancesAndPayments.customersBalances = isDAO.retrieveLatestISBalance(customerIds, parentLookup);
            customerBalancesAndPayments.customersPayments = transDAO.getPaymentsReceivedFromCustomers(customerIds, subsidiary);
         }

        return customerBalancesAndPayments;
    }


    function convertToView(resultLines, resultType, paymentsObj, isConsolidated = false) {
        let view = {};

        if (resultType === TRANSACTION_RESULT_TYPE) {
            view = (isConsolidated) ? buildTransactionResultViewConsolidated(resultLines, paymentsObj) :
                buildTransactionResultView(resultLines, paymentsObj);
        } else if (resultType === ENTITY_RESULT_TYPE) {
            view = (isConsolidated) ? buildEntityResultViewConsolidated(paymentsObj) :
                buildEntityResultView(paymentsObj);
        }

        return view;
    }

    function getBlankView(){
        return {
            "customer": null,
            "previous_balance": alignRight(BLANK),
            "payments_received": alignRight(BLANK),
            "invoice_count": ZERO,
            "invoice_amount": alignRight(BLANK),
            "sales_order_count": ZERO,
            "sales_order_amount": alignRight(BLANK),
            "credit_memo_count": ZERO,
            "credit_memo_amount": alignRight(BLANK),
        };
    }

    function buildTransactionResultViewConsolidated(resultLine, paymentsObj){
        log.debug("buildTransactionResultViewConsolidated", JSON.stringify(resultLine));
        let view = getBlankView();
        let transactionGroups = resultLine.transactions
        view.customer = resultLine.name;

        for(let type in transactionGroups){
            params.custName = resultLine.name;
            let args = {
                custId : resultLine.id,
                count  : transactionGroups[type].count,
                totalAmount : transactionGroups[type].amount.toFixed(2),
                type,
                transDef : transactionDefinition[type]
            };

            let pData = getPaymentTermsData(params, view, paymentsObj);

            //if children has payments, let consolidate them.
            let runningTotalOfPayments = pData.paymentsReceived;
            if(paymentsObj.childPayments && paymentsObj.childPayments.length > 0){

                for(let x=0; x<paymentsObj.childPayments.length; x++){
                    let cpData = getPaymentTermsData(params, view, paymentsObj.childPayments[x]);
                    runningTotalOfPayments +=cpData.paymentsReceived;
                }
            }

            view = addPreviousBalanceAndPaymentsToView(view,pData.previousPeriod,runningTotalOfPayments);
            view = addDrilldownLink(view, args);
        }

        return view;
    }

    function buildTransactionResultView(resultLines, paymentsObj) {
        let view = getBlankView();

        for (let i = 0; i < resultLines.length; i++) {
            let result = resultLines[i];
            let type = result.getValue({name: TYPE, summary: GROUP});
            let args = {
                custId : result.getValue({name: ENTITY, summary: GROUP}),
                count  : result.getValue({name: INTERNALID, summary: COUNT}),
                totalAmount : result.getValue({name: AMOUNT, summary: SUM}), // do we need to format this??
                type,
                transDef : transactionDefinition[type]
            };

            params.custName = result.getText({name: ENTITY, summary: GROUP});
            view.customer = params.custName;
            let pData = getPaymentTermsData(params, view, paymentsObj);

            view = addPreviousBalanceAndPaymentsToView(view,pData.previousPeriod,pData.paymentsReceived);
            view = addDrilldownLink(view, args);
        }

        return view;
    }

    function addDrilldownLink(view, args){

        let drillDownUrl = url.resolveScript({
            scriptId: DRILLDOWN_SCRIPT_ID,
            deploymentId: DRILLDOWN_DEPLOY_ID,
            params: {
                closingDate: params.closingDate,
                custId: args.custId,
                type: args.type,
                overdue: params.overdue,
                subsidiary: params.subsidiary,
                customer: params.customer,
                noTransaction: params.noTransaction,
                consolidated: params.consolidated,
                hierarchyId: params.hierarchyId
            }
        });

        let stringUtil = new StringUtility(args.totalAmount);
        let amountLink = stringUtil.generateHTMLLink({
            url: drillDownUrl,
            target: "_blank",
            title: [args.transDef.countLabel, ': ', args.count].join('')
        });

        view[args.transDef.amount] = alignRight(amountLink);
        return view;
    }

    function buildEntityResultView(paymentsObj) {
        let view = getBlankView();
        let pData = getPaymentTermsData(params, view, paymentsObj)

        view = addPreviousBalanceAndPaymentsToView(view,pData.previousPeriod,pData.paymentsReceived);
        view.customer = paymentsObj.custInfo.entityid;
        return view;
    }

    function buildEntityResultViewConsolidated(paymentsObj){
        let view = getBlankView();
        let pData = getPaymentTermsData(params, view, paymentsObj)

        view = addPreviousBalanceAndPaymentsToView(view,pData.previousPeriod,pData.paymentsReceived);
        view.customer = (paymentsObj.custInfo.companyname) ? paymentsObj.custInfo.companyname :
            paymentsObj.custInfo.lastname + " " + paymentsObj.custInfo.firstname;

        return view;
    }

    function getPaymentTermsData(params, view, paymentsObj){
        let custInfo = paymentsObj.custInfo;
        let paymentsReceived = 0;
        let previousPeriod = 0;

        if(custInfo){
            let entityTermsObj = new PaymentTermUtility(custInfo);
            let closingDate = format.parse({value:params.closingDate, type:format.Type.DATE});
            let startDate = entityTermsObj.getPeriodStartDate(new DateUtility(closingDate))
            previousPeriod = paymentsObj.previousPeriod || 0.0;
            let customerPayments = paymentsObj.paymentsReceived != null ? paymentsObj.paymentsReceived.payments : 0.0;
            paymentsReceived = getPaymentsReceived(customerPayments, startDate, closingDate);
        }

        return {previousPeriod, paymentsReceived}
    }

    function addPreviousBalanceAndPaymentsToView(view, previousBalance, paymentsReceived){
        let previousBalanceFloat = parseFloat(previousBalance);
        if (previousBalanceFloat !== 0) {
            view.previous_balance = alignRight(previousBalanceFloat.toFixed(2));
        }

        let paymentsReceivedFloat = parseFloat(paymentsReceived);
        if (paymentsReceivedFloat !== 0) {
            view.payments_received = alignRight(paymentsReceivedFloat.toFixed(2));
        }

        return view;
    }

    function alignRight(html) {
        let htmlBuilder = ["<div style=\"text-align: right\">"];
        htmlBuilder.push(html);
        htmlBuilder.push("</div>");
        return htmlBuilder.join("");
    }

    function getPaymentsReceived(customerPayments, startDate, closingDate) {
        let paymentsReceivedWithinRange = 0.00;

        for (let i in customerPayments){
            let payment = customerPayments[i];
            let trantime = new DateUtility(format.parse({value:payment.trandate, type:format.Type.DATE})).getTime();
            let startime = new DateUtility(format.parse({value:startDate, type:format.Type.DATE})).getTime();
            let closingtime = new DateUtility(format.parse({value:closingDate, type:format.Type.DATE})).getTime();

            if (startime <= trantime && trantime <= closingtime) {
                paymentsReceivedWithinRange += Number(payment.netAmount);
            }
        }

        //return CurrencyAPI.formatCurrency(paymentsReceivedWithinRange);
        return paymentsReceivedWithinRange;
    }

    return JP_ISGenerationResultValuesHandler;

});
