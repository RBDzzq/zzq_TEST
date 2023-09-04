/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 */

define([
    'N/record',
    'N/format',
    'N/search',
    'N/runtime',
    'N/task',
    'N/error',
    '../../app/JP_PaymentTermUtility',
    '../../app/JP_DueDateAdjuster',
    '../../data/JP_EntityDAO',
    '../../data/JP_InvoiceSummaryDAO',
    '../../data/JP_TransactionDAO',
    '../../data/JP_CustomerDAO',
    '../../data/JP_TaxInvoiceLawDAO',
    '../../data/NQuery/JP_NBatchDAO',
    '../../lib/JP_DateUtility'
],

(
    record,
    format,
    search,
    runtime,
    task,
    error,
    JP_PaymentTermUtility,
    JP_DueDateAdjuster,
    JP_EntityDAO,
    JP_InvoiceSummaryDAO,
    JP_TransactionDAO,
    JP_CustomerDAO,
    JP_TaxInvLaw,
    JP_BatchDAO,
    JP_DateUtility) =>{

    let ERROR_STATUS = '1';
    let TRUE = 'T';
    let IS_CREATE_ERROR = 'IS_RECORD_CREATION_ERROR';

    let GEN_INV_SUM_PARAMS = 'custscript_japan_loc_mr_gen_inv_sum';

    // Transaction Searches
    let NET_AMOUNT_NO_TAX_SEARCH = 'customsearch_suitel10n_jp_ids_trans_net';
    let TOTAL_TAX_SEARCH = 'customsearch_suitel10n_jp_ids_total_tax';

    // Transaction Fields
    let FORMULA_NUMERIC = 'formulanumeric';
    let INTERNAL_ID = 'internalid';
    let NET_AMOUNT_NO_TAX = 'netamountnotax';

    let HIERARCHY_ID = 'custrecord_japan_loc_hierarchy';

    // Request Record Type
    let REQUEST_RECORD_TYPE = "customrecord_jp_loc_gen_request";

    // Invoice Summary Transaction Type
    let INVOICE_SUMMARY_TYPE = 'customtransaction_suitel10n_jp_ids';

    // Hierarchy Record
    let CUSTOMER_HIERARCHY = "customrecord_jp_customer_hierarchy";
    let HIERARCHY_STORE_FIELD = "custrecord_jp_hierarchy_store";

    // Attach IS to Transaction MR
    let IS_TO_TXN_ATTACH_MR_SCRIPT = 'customscript_japan_loc_is_to_txn_mr';
    let IS_TO_TXN_ATTACH_MR_DEPLOYMENT = 'customdeploy_japan_loc_is_to_txn_mr';

    function getInputData() {

        let params = '';

        try{

            params = JSON.parse(runtime.getCurrentScript().getParameter({name:GEN_INV_SUM_PARAMS}));
            let batchDAO = new JP_BatchDAO();

            let batchLookup = search.lookupFields({
               type : batchDAO.recordType,
               id : params.batchId,
               columns : [batchDAO.fields.generationParams,
                   batchDAO.fields.noTrans,
                   batchDAO.fields.closingDate,
                   batchDAO.fields.subsidiary,
                   batchDAO.fields.customer,
                   batchDAO.fields.saveSearch]
            });

            let generationParams = JSON.parse(batchLookup[batchDAO.fields.generationParams]);
            let txnObjArr = generationParams.forGeneration;
            let txnArr = [];
            let entities = [];

            for (let j in txnObjArr) {

                let entity = txnObjArr[j].entity;
                if(entities.indexOf(entity) < 0){
                    entities.push(entity);
                }

                if(txnObjArr[j].id){
                    txnArr.push({
                        transaction : txnObjArr[j].id,
                        entity : entity,
                        transactionType : txnObjArr[j].type
                    });
                }else{
                    // Customer with no transaction
                    txnArr.push({
                        transaction : "",
                        entity : entity,
                        closingDate : txnObjArr[j].closingDate
                    });
                }
            }

            return txnArr;

        } catch(e){
            throw e.name + ' ' + e.message;
        }
    }

    function map(context) {

        let params = '';

        try{
            params = JSON.parse(runtime.getCurrentScript().getParameter({name:GEN_INV_SUM_PARAMS}));

            let result = JSON.parse(context.value);

            // Lookup for existing Invoice Summary Record
            let isDaoParam = {batchId: params.batchId, entity: result.entity};
            let existingInvSumRecID = new JP_InvoiceSummaryDAO().getExisting(isDaoParam);

            if (result.transaction) {
            	/* For customer with transactions */
                context.write({
                    key : result.entity,
                    value : {
                        transaction : result.transaction,
                        transactionType : result.transactionType,
                        invSumRec : existingInvSumRecID
                    }
                });

            } else {
            	/* For customer with no transactions */
                let closingDateDateUtilObj = new JP_DateUtility(format.parse(
                    {value:result.closingDate,type:format.Type.DATE}));
                let entityInfo = new JP_EntityDAO({type: search.Type.CUSTOMER}).retrieveEntityById(result.entity);
                let entityTermsObj = new JP_PaymentTermUtility(entityInfo);
                if (entityTermsObj.isValidClosingDate(closingDateDateUtilObj)) {
                    context.write({
                        key : result.entity,
                        value : {
                            transaction : '',
                            transactionType : '',
                            invSumRec : existingInvSumRecID
                        }
                    });
                }
            }

        } catch (e) {
            log.error('IS Generation Error', ['Stage: Map Batch: ',
                params.batchId ? params.batchId : 'N/A' , ' Details: ', e.name, ': ', e.message].join(''));
            throw e;
        }
    }

    function reduce(context){

        let INVOICE_TYPE = 'CustInvc';
        let CREDIT_MEMO_TYPE = 'CustCred';

        let params = '';

        try {
            params = JSON.parse(runtime.getCurrentScript().getParameter({name:GEN_INV_SUM_PARAMS}));

            let existingInvSumRec;
            let entity = context.key;
            let entityInfo = new JP_EntityDAO({type: search.Type.CUSTOMER}).retrieveEntityById(entity);
            let entityTermsObj = new JP_PaymentTermUtility(entityInfo);

            let batchDao = new JP_BatchDAO();
            let flds = batchDao.fields;
            let batchLookup = search.lookupFields({
               type : batchDao.recordType,
               id : params.batchId,
               columns : [flds.statementDate, flds.closingDate, flds.subsidiary,
                   flds.customer, flds.hierarchyId]
            });

            let statementDate = format.parse({value:batchLookup[flds.statementDate],type:format.Type.DATE});
            let closingDate = format.parse({value:batchLookup[flds.closingDate],type:format.Type.DATE});
            let subsidiaryFilter = batchLookup[flds.subsidiary][0] ? batchLookup[flds.subsidiary][0].value : '';
            let hierarchyId = batchLookup[HIERARCHY_ID][0] ? batchLookup[HIERARCHY_ID][0].value : '';

            let entities = [entity];
            if(hierarchyId && hierarchyId > -1){
                let hierarchySearch = search.lookupFields({
                    type: CUSTOMER_HIERARCHY,
                    id: hierarchyId,
                    columns: [HIERARCHY_STORE_FIELD]
                });
                let hierarchyObj = JSON.parse(hierarchySearch[HIERARCHY_STORE_FIELD]);
                let customerChildren = hierarchyObj[entity] ? hierarchyObj[entity].children : null;
                entities = customerChildren ? Object.keys(customerChildren) : [];
                entities.push(entity);
            }

            let transactions = [];
            let invoices = [];
            let creditmemos = [];

            let contents = context.values;
            for(let i in contents){

                let obj = JSON.parse(contents[i]);

                if(obj.transaction){
                    transactions.push(obj.transaction);
                    if (obj.transactionType === INVOICE_TYPE) {
                        invoices.push(obj.transaction);
                    } else if (obj.transactionType === CREDIT_MEMO_TYPE) {
                        creditmemos.push(obj.transaction);
                    }
                }

                if(!existingInvSumRec && obj.invSumRec){
                    existingInvSumRec = obj.invSumRec;
                }
            }

            let totalSales = getTotalSales(invoices);
            let totalReturn = getTotalCredit(creditmemos);
            let totalTax = getTotalTax(transactions);
            let netInvoice = Number(totalSales) - Math.abs(Number(totalReturn)) + Number(totalTax);
            let totalPrevious = new JP_InvoiceSummaryDAO().retrievePreviousPayment(
                {entities: entities, currentRec: existingInvSumRec});
            let startDate = entityTermsObj.getPeriodStartDate(new JP_DateUtility(closingDate));
            let subsidiary = subsidiaryFilter;
            let periodPayment = new JP_TransactionDAO().getPaymentReceivedDuringPeriod({
                entity: entity,
                entities: entities,
                startDate: startDate,
                endDate: closingDate,
                subsidiary: subsidiary
            });
            let balanceForward = Number(totalPrevious) - Number(periodPayment);
            let netTotal = (Number(balanceForward) + Number(totalSales)) -
                Math.abs(Number(totalReturn)) + Number(totalTax);
            let paymentDueDate = getPaymentDueDate(new JP_DateUtility(closingDate), entityTermsObj, entityInfo);
            let paymentIds = new JP_TransactionDAO().getPaymentTransactionsThisPeriod({
                entity: entity,
                entities: entities,
                startDate: startDate,
                endDate: closingDate,
                subsidiary: subsidiary
            });

            let model = {
                "subsidiary" : subsidiary,
                "custbody_suitel10n_jp_ids_total_return" : totalReturn,
                "custbody_suitel10n_jp_ids_total_tax" : totalTax,
                "custbody_suitel10n_jp_ids_total_prev_p" : totalPrevious,
                "custbody_suitel10n_jp_ids_prd_payment" : periodPayment,
                "custbody_suitel10n_jp_ids_template" : params.template,
                "custbody_suitel10n_jp_ids_transactions" : transactions,
                "custbody_suitel10n_jp_ids_gen_batch" : params.batchId,
                "custbody_suitel10n_jp_ids_customer" : entity,
                "custbody_suitel10n_jp_ids_closing_date" : closingDate,
                "custbody_suitel10n_jp_ids_stmnt_date" : statementDate,
                "custbody_suitel10n_jp_ids_start_date" : startDate,
                "custbody_suitel10n_jp_ids_balance_fwd" : balanceForward,
                "custbody_suitel10n_jp_ids_payment_due" : paymentDueDate,
                "custbody_suitel10n_jp_ids_net_total" : netTotal,
                "custbody_suitel10n_jp_ids_total_sales" : totalSales,
                "custbody_suitel10n_jp_ids_net_invoice" : netInvoice,
                "custbody_jp_loc_inv_sum_payments" : paymentIds,
                "custbody_jp_inc_all_trans_sub" : hierarchyId && hierarchyId > -1 ? true : false
            };
            let invSumRecID = createRecordFromModel(model,existingInvSumRec);

            //additional computations for Invoice Tax Law
            if(entityInfo.useTaxISLaw){
                let taxInvLaw = new JP_TaxInvLaw().addTaxAdjustment({
                    transactionIds: transactions,
                    entityid : entity,
                    subsidiary : subsidiary,
                    closingDate : closingDate,
                    isID : invSumRecID,
                    taxISLevel: totalTax
                });

                createRecordFromModel({
                    custbody_suitel10n_jp_ids_net_invoice : ( (netInvoice-totalTax) + parseInt(taxInvLaw.totalTax) ),
                    custbody_suitel10n_jp_ids_net_total : ( (netTotal-totalTax) + parseInt(taxInvLaw.totalTax) ),
                    custbody_jp_isapplytaxadj : entityInfo.useTaxISLaw,
                    custbody_suitel10n_jp_ids_total_tax : taxInvLaw.totalTax
                }, invSumRecID)

            }

            context.write({
                key: entity,
                value: invSumRecID
            });

        } catch (e) {
            log.error('IS Generation Error', ['Stage: Reduce Batch: ',
                params.batchId ? params.batchId : 'N/A' , ' Details: ', e.name, ': ', e.message].join(''));
            throw e;
        }
    }

    function summarize(summary) {

        let params = '';

        try{

            params = JSON.parse(runtime.getCurrentScript().getParameter({name:GEN_INV_SUM_PARAMS}));

            let inputError = summary.inputSummary.error;
            if(inputError){
                throw JSON.parse(inputError);
            }

            //TODO: Extend to consolidated error reporting
            let mapSummary = summary.mapSummary;
            mapSummary.errors.iterator().each((index,err)=>{
                throw JSON.parse(err);
                //do not return true to throw on first error
            });

            //TODO: Extend to consolidated error reporting
            let reduceSummary = summary.reduceSummary;
            reduceSummary.errors.iterator().each((index,err)=>{
                throw JSON.parse(err);
                //do not return true to throw on first error
            });

            let entityInvoiceSummaryMapping = {};
            summary.output.iterator().each((entity, invSumRecID) =>{
                entityInvoiceSummaryMapping[entity] = invSumRecID;
                return true;
            });

            let attachIStoTxnParams = {
                entityInvoiceSummaryMapping : entityInvoiceSummaryMapping,
                batchId : params.batchId,
                template : params.template,
                parent: params.parent
            };

            let ssTask = task.create({
                taskType: task.TaskType.MAP_REDUCE
            });
            ssTask.scriptId = IS_TO_TXN_ATTACH_MR_SCRIPT;
            ssTask.deploymentId = IS_TO_TXN_ATTACH_MR_DEPLOYMENT;
            ssTask.params = {'custscript_japan_loc_mr_idsattacher_json':attachIStoTxnParams};
            let taskId = ssTask.submit();

            record.submitFields({
                type : new JP_BatchDAO().recordType,
                id : params.batchId,
                values : {
                    'custrecord_suitel10n_jp_ids_task_id' : taskId
                }
            });

        }catch(e){

            if(params.batchId){
                let errName = e.name.replace(/\"/g,'');
                let errMessage = e.message.replace(/\"/g,'');

                //Update batch status to ERROR
                record.submitFields({
                    type : new JP_BatchDAO().recordType,
                    id : params.batchId,
                    values : {
                        'custrecord_suitel10n_jp_ids_gen_b_stat' : ERROR_STATUS,
                        'custrecord_suitel10n_jp_ids_errorflag' : TRUE,
                        'custrecord_suitel10n_jp_ids_err_detail' : IS_CREATE_ERROR + ': ' + errName + ": " + errMessage
                    }
                });

                record.submitFields({
                    type : REQUEST_RECORD_TYPE,
                    id : params.parent,
                    values : {
                        'custrecord_jp_loc_gen_req_status' : ERROR_STATUS,
                        'custrecord_jp_loc_gen_req_err_flag' : TRUE,
                        'custrecord_jp_loc_gen_req_err_detail' : IS_CREATE_ERROR + ': ' + errName + ": " + errMessage
                    }
                });

                log.error('IS Generation Error', ['Stage: Summarize Batch: ', params.batchId ,
                    ' Details: ', errName, ': ', errMessage].join(''));
            }
            else{
                log.error(e.name,e.message);
            }
        }
    }

    function getPaymentDueDate(closingDate, termsObj, custInfo) {

        let DUE_DATE_ADJ_NO_CHANGE = "3";

        let term = termsObj.getPaymentTerm(closingDate);
        term = term.id ? term : termsObj.getNextTerm(closingDate);

        let dueDate = termsObj.getDueDate(term, closingDate);

        if (custInfo.dueDateAdj !== DUE_DATE_ADJ_NO_CHANGE) {
            let dueDateAdjuster = new JP_DueDateAdjuster();
            dueDate = dueDateAdjuster.doAdjustment(dueDate, custInfo.subsidiary, custInfo.dueDateAdj);
        }

        return dueDate;
    }


    function getTotalSales(invoices){

        if(invoices.length < 1){
            return 0.0;
        }

        let salesSearch = search.load({id:NET_AMOUNT_NO_TAX_SEARCH});
        let exp = salesSearch.filterExpression;
        exp.push("AND", [INTERNAL_ID, search.Operator.ANYOF,invoices]);
        salesSearch.filterExpression = exp;

        let totalSales = 0.0;
        salesSearch.run().each((result)=>{
            totalSales = result.getValue({name:NET_AMOUNT_NO_TAX,summary:search.Summary.SUM});
            return true;
        });
        return totalSales;
    }

    function getTotalCredit(creditmemos){

        if(creditmemos.length < 1){
            return 0.0;
        }

        let creditsSearch = search.load({id:NET_AMOUNT_NO_TAX_SEARCH});

        let exp = creditsSearch.filterExpression;
        exp.push("AND", [INTERNAL_ID, search.Operator.ANYOF,creditmemos]);
        creditsSearch.filterExpression = exp;

        let totalReturn = 0.0;
        creditsSearch.run().each((result)=>{
            totalReturn = result.getValue({name:NET_AMOUNT_NO_TAX,summary:search.Summary.SUM});
            return true;
        });
        return totalReturn;
    }

    function getTotalTax(transactions){

        if(transactions.length < 1){
            return 0.0;
        }

        let taxesSearch = search.load({id:TOTAL_TAX_SEARCH});

        let exp = taxesSearch.filterExpression;
        exp.push("AND", [INTERNAL_ID, search.Operator.ANYOF,transactions]);
        taxesSearch.filterExpression = exp;

        let totalTax = 0.0;
         taxesSearch.run().each((result)=>{
            totalTax = result.getValue({name:FORMULA_NUMERIC,summary:search.Summary.SUM});
            return true;
         });
         return totalTax;
    }

    function createRecordFromModel(model, id){

        let rec = id ? record.load({type:INVOICE_SUMMARY_TYPE,id:id,isDynamic:true}) :
            record.create({type:INVOICE_SUMMARY_TYPE,isDynamic:true});

        let fields = Object.keys(model);
        for (let i in fields) {
            rec.setValue({fieldId:fields[i],value:model[fields[i]]});
        }
        return rec.save();
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

});
