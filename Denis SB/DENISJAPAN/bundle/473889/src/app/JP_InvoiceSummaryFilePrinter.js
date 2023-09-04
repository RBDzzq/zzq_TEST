/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    "N/record",
    "N/runtime",
    "N/search",
    "../lib/JP_SearchIterator",
    "N/render",
    "N/file",
    "N/format",
    "N/error",
    "../lib/JP_StringUtility",
    "../lib/JP_DateUtility",
    "../app/JP_PaymentTermUtility",
    "../data/JP_SubsidiaryDAO",
    "../data/JP_CompanyDAO",
    "../data/JP_TransactionDAO",
    "../data/JP_EntityDAO",
    "../data/JP_InvoiceSummaryDAO",
    "../data/JP_TaxPreferencesDAO",
    "../data/NQuery/JP_NBatchDAO",
    "../data/NQuery/JP_NCustTreeDAO",
    "../lib/JP_TCTranslator"
],

(record,
         runtime,
         search,
         SearchIterator,
         render,
         file,
         format,
         error,
         StringUtility,
         DateUtility,
         PaymentTermUtility,
         SubsidiaryDAO,
         CompanyDAO,
         TransactionDAO,
         EntityDAO,
         ISDAO,
         TaxPreferencesDAO,
         BatchDAO,
         CustTreeDAO,
         translator)=> {

    const IDS = "ids";
    const IDS_OVERDUE = "custbody_suitel10n_jp_ids_overdue";
    const NET_INVOICE_SUMMARY = "customsearch_suitel10n_jp_net_invoice";
    const INVOICE_SUMMARY_PAYMENTS = "custbody_jp_loc_inv_sum_payments";
    const TRANSACTION_LIST = "transactionlist";
    const NET_INVOICE_SUMMARY_LIST = "netinvoicesummarylist";
    const CUSTOMER = "customer";
    const SUBSIDIARY = "subsidiary";
    const LANG = "LANGUAGE";
    const TAX_DETAILS = "taxdetails";
    const PAYMENT_DETAILS_ALIAS = "paymentdetails";

    const DOC_TITLE = "IDS_LABEL_DOC_TITLE";
    const TAX_REG_NUM_LABEL = "IDS_LABEL_TAX_REG_NUMBER";
    const PREV_BALANCE_LABEL = "IDS_LABEL_PREV_BALANCE";
    const PAYMENT_LABEL = "IDS_LABEL_PAYMENT";
    const BALANCE_FORWARD_LABEL = "IDS_LABEL_BALANCE_FORWARD";
    const TOTAL_SALES_LABEL = "IDS_LABEL_TOTAL_SALES";
    const TOTAL_CREDITS_LABEL = "IDS_LABEL_TOTAL_CREDITS";
    const TOTAL_TAX_LABEL = "IDS_LABEL_TOTAL_TAX";
    const TOTAL_LABEL = "IDS_LABEL_TOTAL";
    const TRANS_DATE_LABEL = "IDS_LABEL_TRAN_DATE";
    const ITEMS_QUANTITY_LABEL = "IDS_LABEL_ITEM_QUANTITY";
    const ITEMS_UNITPRICE_LABEL = "IDS_LABEL_ITEM_PRICE";
    const LINE_TAX_LABEL = "IDS_LABEL_LINE_TAX";
    const AMOUNT_LABEL = "IDS_LABEL_LINE_AMOUNT";
    const CURRENCY = "IDS_LABEL_CURRENCY";
    const EXCHANGE_RATE = "IDS_LABEL_EXCHANGE_RATE";
    const FOREIGN_AMOUNT = "IDS_LABEL_FOREIGN_AMOUNT";
    const BANK_ACCOUNT_INFO = "IDS_LABEL_BANK_ACCOUNT_INFO";
    const REVIEW_DETAILS = "IDS_LABEL_REVIEW_DETAILS";
    const PAGE_NUMBER = "IDS_LABEL_PAGE_NUMBER";
    const PAYMENT_DUE_DATE = "IDS_LABEL_PAYMENT_DUE_DATE";
    const STATEMENT_DATE = "IDS_LABEL_DOC_STATEMENT_DATE";
    const PHONE_LABEL = "IDS_LABEL_PHONE";
    const TOTAL_AMOUNT_DUE_LABEL = "IDS_LABEL_TOTAL_AMOUNT_DUE";

    const ITEM_CODE_LABEL = "IDS_LABEL_ITEM_CODE";
    const DUE_DATE_LABEL = "IDS_LABEL_LINE_DUE_DATE";
    const BANK_ACCOUNT_NAME_LABEL = "IDS_LABEL_BANK_ACCOUNT_NAME";
    const BANK_ACCOUNT_NUMBER_LABEL = "IDS_LABEL_BANK_ACCOUNT_NUMBER";
    const SWIFT_CODE_LABEL = "IDS_LABEL_SWIFT_CODE";
    const BANK_NAME_LABEL = "IDS_LABEL_BANK_NAME";
    const BANK_ADDRESS_LABEL = "IDS_LABEL_BANK_ADDRESS";
    const BILL_TO_LABEL = "IDS_LABEL_BILL_TO";
    const SUMMARY_LABEL = "IDS_LABEL_SUMMARY";
    const INVOICE_NUMBER_LABEL = "IDS_LABEL_INVOICE_NUMBER";
    const INVOICE_DATE_LABEL = "IDS_LABEL_INVOICE_DATE";
    const BILLING_PERIOD_LABEL = "IDS_LABEL_BILLING_PERIOD";
    const NET_INVOICE_LABEL = "IDS_LABEL_NET_INVOICE";
    const TRANS_DETAIL_LABEL = "IDS_LABEL_TRAN_DETAILS";
    const INVOICE_DETAIL_LABEL = "IDS_LABEL_INV_SUM_DETAILS";
    const TRANS_NO_LABEL = "IDS_LABEL_TRAN_NO";
    const TRANS_ID_LABEL = "IDS_LABEL_TRAN_ID";
    const INVOICE_DETAILS_NOTE = "IDS_LABEL_INVOICE_DETAILS_NOTE";

    const TAX_DETAILS_LABEL = "IDS_LABEL_TAX_DETAILS";
    const TAX_CODE = "IDS_LABEL_TAX_CODE";
    const TAX_RATE = "IDS_LABEL_TAX_RATE";
    const TOTAL_NET_AMOUNT = "IDS_LABEL_TOTAL_NET_AMOUNT";
    const TOTAL_TAX_DET = "IDS_LABEL_TOTAL_TAX_DETAILS";
    const MISSING_DUE_DATE_MSG = "IDS_GEN_PDF_TXN_MISSING_DUE_DATE";

    const PAYMENT_DATE = "IDS_LABEL_PAYMENT_DATE";
    const PAYMENT_NO = "IDS_LABEL_PAYMENT_NO";
    const PAYMENT_ID = "IDS_LABEL_PAYMENT_ID";
    const PAYMENT_DETAILS = "IDS_LABEL_PAYMENT_DETAILS";
    const PAYMENT_AMOUNT = "IDS_LABEL_PAYMENT_AMOUNT";
    const PAYMENT_FOREIGN_AMOUNT = "IDS_LABEL_PAYMENT_FXAMOUNT";
    const PAYMENT_CURRENCY = "IDS_LABEL_PAYMENT_CURRENCY";
    const PAYMENT_EXCHANGE_RATE = "IDS_LABEL_PAYMENT_EXCHANGERATE";
    const PAYMENT_DETAILS_TITLE = "IDS_LABEL_PAYMENT_DETAILS_TITLE";
    const EMPTY_PAYMENT_DETAILS = "IDS_LABEL_EMPTY_PAYMENT_DETAILS";
    const ISTEMPLATE_TAXCODERATE = 'ISTEMPLATE_TAXCODERATE';
    const ISTEMPLATE_CTAXCODE = "ISTEMPLATE_CTAXCODE";
    const CIS_RATE_HEADER = "CIS_RATE_HEADER";
    const CIS_TAXAMOUNT_HEADER = "CIS_TAXAMOUNT_HEADER";
    const ISTEMPLATE_TAXEXEMPT = "ISTEMPLATE_TAXEXEMPT"
    const CIS_SUBTOTAL = "CIS_SUBTOTAL";
    const TIL_IS_FOOTNOTE = "TIL_IS_FOOTNOTE";

    let IDS_TEMPLATE_LABELS = [
        DOC_TITLE,
        TAX_REG_NUM_LABEL,
        PREV_BALANCE_LABEL,
        PAYMENT_LABEL,
        BALANCE_FORWARD_LABEL,
        TOTAL_SALES_LABEL,
        TOTAL_CREDITS_LABEL,
        TOTAL_TAX_LABEL,
        TOTAL_LABEL,
        TRANS_DATE_LABEL,
        ITEMS_QUANTITY_LABEL,
        ITEMS_UNITPRICE_LABEL,
        LINE_TAX_LABEL,
        AMOUNT_LABEL,
        CURRENCY,
        EXCHANGE_RATE,
        FOREIGN_AMOUNT,
        BANK_ACCOUNT_INFO,
        REVIEW_DETAILS,
        PAGE_NUMBER,
        PAYMENT_DUE_DATE,
        STATEMENT_DATE,
        TOTAL_AMOUNT_DUE_LABEL,
        ITEM_CODE_LABEL,
        DUE_DATE_LABEL,
        BANK_ACCOUNT_NAME_LABEL,
        BANK_ACCOUNT_NUMBER_LABEL,
        SWIFT_CODE_LABEL,
        BANK_NAME_LABEL,
        BANK_ADDRESS_LABEL,
        BILL_TO_LABEL,
        SUMMARY_LABEL,
        INVOICE_NUMBER_LABEL,
        INVOICE_DATE_LABEL,
        BILLING_PERIOD_LABEL,
        NET_INVOICE_LABEL,
        TRANS_DETAIL_LABEL,
        INVOICE_DETAIL_LABEL,
        TRANS_NO_LABEL,
        TRANS_ID_LABEL,
        PHONE_LABEL,
        INVOICE_DETAILS_NOTE,
        TAX_DETAILS_LABEL,
        TAX_CODE,
        TAX_RATE,
        TOTAL_NET_AMOUNT,
        TOTAL_TAX_DET,
        PAYMENT_DATE,
        PAYMENT_NO,
        PAYMENT_ID,
        PAYMENT_DETAILS,
        PAYMENT_AMOUNT,
        PAYMENT_FOREIGN_AMOUNT,
        PAYMENT_CURRENCY,
        PAYMENT_EXCHANGE_RATE,
        PAYMENT_DETAILS_TITLE,
        EMPTY_PAYMENT_DETAILS,
        MISSING_DUE_DATE_MSG,
        ISTEMPLATE_TAXCODERATE,
        ISTEMPLATE_CTAXCODE,
        CIS_RATE_HEADER,
        CIS_TAXAMOUNT_HEADER,
        ISTEMPLATE_TAXEXEMPT,
        CIS_SUBTOTAL,
        TIL_IS_FOOTNOTE
    ];

    let fileId;
    let strings;

    let template = '';
    let loadedTemplate = false;

    class InvoiceSummaryFilePrinter {

        constructor() {
            strings = new translator().getTexts(IDS_TEMPLATE_LABELS, true);
            this.isDao = new ISDAO();
        }

        generateInvoiceSummaryText(id, templateId){
            fileId = templateId;
            let idsRec = record.load({type:this.isDao.recordType, id:id});
            let custId = idsRec.getValue({fieldId: this.isDao.fields.customer});
            let custRec = record.load({type:CUSTOMER, id:custId});
            let subsidiaryRec;
            let subsidiaryId;

            let isOW = runtime.isFeatureInEffect('SUBSIDIARIES');
            if (isOW) {
                subsidiaryId = idsRec.getValue({fieldId: SUBSIDIARY});
                subsidiaryRec = record.load({type:SUBSIDIARY, id:subsidiaryId});
            }

            let transactions = this.getTransactions(idsRec, subsidiaryId);
            let taxDetails = new TransactionDAO().getTaxDetails({isRec: id});
            let netInvoiceSummaries = this.getNetInvoiceSummaries(idsRec);
            let custLanguage = custRec.getValue({fieldId: LANG});

            let entDao = new EntityDAO();
            let useITL = custRec.getValue({fieldId: entDao.fields.taxISLaw});

            //since customer.custentity_jp_taxinvchckbox returns a translatable 'Yes'/'No' values we cast
            //these values into a constant 'T'/'F' and hide it in the taxdetails.
            taxDetails.useITL = (useITL) ? 'T' : 'F';

            let renderer = render.create();
            renderer.templateContent = this.loadTemplate(custLanguage);
            renderer.addRecord({templateName: IDS, record: idsRec});
            renderer.addRecord({templateName: CUSTOMER, record: custRec});

            if (isOW) {
                renderer.addRecord({templateName: SUBSIDIARY, record: subsidiaryRec});
            }

            if(Array.isArray(transactions)){
                renderer.addSearchResults({templateName: TRANSACTION_LIST, searchResult: transactions});
            }
            else{
                renderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: TRANSACTION_LIST,
                    data: transactions
                });
            }

            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: NET_INVOICE_SUMMARY_LIST,
                data: netInvoiceSummaries
            });

            //alter tax details to override NetSuite tax computation.
            //then merge taxcodes with same tax rates.
            log.debug("taxDetails before: ", JSON.stringify(taxDetails));
            taxDetails.totalTax = 0;
            taxDetails.taxDelta = 0;
            if(useITL && taxDetails.details){
                taxDetails.taxDelta = 0;
                let roundingMethod = new TaxPreferencesDAO().getRoundingMethod(custId);

                //get the Qualified Invoicing Tax per tax code.
                taxDetails.details.forEach((tax)=>{
                    let actualTax = parseInt(roundingMethod(tax.netamountnotax * (parseInt(tax.rate)/100)));
                    let delta = actualTax - tax.taxamount;
                    tax.taxamount = actualTax;
                    //lastItem.taxamount += delta;
                    taxDetails.totalTax += actualTax;
                });
            }
            log.debug("taxDetails after: ", JSON.stringify(taxDetails));

            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: TAX_DETAILS,
                data: taxDetails
            });

            renderer.addSearchResults({templateName: PAYMENT_DETAILS_ALIAS,
                searchResult: this.getPaymentDetails(idsRec)});

            return renderer.renderAsString();
        };

        getPaymentDetails(invoiceSummary){
            let customer = invoiceSummary.getValue({fieldId: this.isDao.fields.customer});
            let entityInfo = new EntityDAO({type: search.Type.CUSTOMER}).retrieveEntityById(customer);
            let entityTermsObj = new PaymentTermUtility(entityInfo);
            let closingDate = invoiceSummary.getValue({fieldId: this.isDao.fields.closingDate});
            let startDate = entityTermsObj.getPeriodStartDate(new DateUtility(closingDate));
            let invoiceSummaryPayments = invoiceSummary.getValue({fieldId: INVOICE_SUMMARY_PAYMENTS});
            return new TransactionDAO().getInvoiceSummaryPayments({
                entity: customer,
                startDate: startDate,
                endDate: closingDate,
                payments: invoiceSummaryPayments
            });
        };

        generateTxnFilterExp(searchObj, idsRec){
            let currentFilterExpression = this.parseFilterExpressionToArray(searchObj.filterExpression);
            let additionalFilters = [["custbody_suitel10n_jp_ids_rec", "is", idsRec.id]];
            let hasOverdue = idsRec.getValue({fieldId: IDS_OVERDUE});

            if (hasOverdue) {
                additionalFilters = this.buildFilterExpressionWithOverdue(idsRec, additionalFilters);
            }
            if (currentFilterExpression.length > 1) {
                currentFilterExpression.push('AND');
            }
            currentFilterExpression.push(additionalFilters);
            return currentFilterExpression;
        }

        getTransactions(idsRec, subsidiary) {
            let isConsolidated = idsRec.getValue({fieldId: this.isDao.fields.isConsolidated});
            let idsTrans = idsRec.getValue({fieldId: this.isDao.fields.transactions});
            let tranIdList = idsTrans.length ? idsTrans : [];
            let results = [];

            let searchId = this.getStatementSearch(subsidiary);

            if (tranIdList.length > 0) {
                let searchObj = search.load({
                    id: searchId
                });

                searchObj.filterExpression = this.generateTxnFilterExp(searchObj, idsRec);
                log.audit('GetTransactions: Transaction Filter Expression', JSON.stringify(searchObj.filterExpression) +
                    " tranlistId" + JSON.stringify(tranIdList));
                log.debug("Transaction Columns:", JSON.stringify(searchObj.columns));
                let iterator = new SearchIterator(searchObj);

                while (iterator.hasNext()){
                    let result = iterator.next();
                    if (tranIdList.indexOf(result.id) > -1) {
                        results.push(result);
                    }
                }

                if(isConsolidated){
                    results = this.consolidateTransactions(results, idsRec, searchObj.columns);
                }
            }
            else if(isConsolidated){
                //return this structure if there are no transactions to prevent errors in template data sourcing.
                results = { customers: [] };
            }

            return results;
        }

        /**
         * For consolidated Invoice summary groups transactions together per parent-child customers and returns it
         * in the following sample format:
         *
         * {
         *     customers : [
         *         {
         *             customerName : Japan Customer,
         *             transactions : [   //itemized list of transaction
         *                 {
         *                     rate : {text: '', value},
         *                     "mainline":{"text":null,"value":" "},
         *                     "createdfrom":{"text":"","value":""}
         *                     ....
         *                 },
         *                 {
         *                     rate : {text: '', value},
         *                     "mainline":{"text":null,"value":" "},
         *                     "createdfrom":{"text":"","value":""}
         *                     .... //more properties here.
         *                 }
         *                 ... //more transaction items here
         *             ],
         *             subtotal : [*
         *                   {taxRate : "10%", total: 100000},
         *                   {taxRate : "8%", total: 100000},
         *                   .... //more tax rate here.
         *             ]
         *         }
         *     ]
         * }
         *
         *
         * @param transactions the list of transactions included in the current invoice summary
         * @param idsRec the current invoice summary record.
         * @param searchColumns given that the transaction search and the templates are customizable, we need to retain
         *                  the columns data so they will be properly displayed in the customized form.
         *
         * @return Object the consolidated grouping of transactions.
         */

        consolidateTransactions(transactions, idsRec, searchColumns){

            let batchDao = new BatchDAO();
            let batchId = idsRec.getValue({fieldId: this.isDao.fields.batch});
            let hierarchy = search.lookupFields({
                type : batchDao.recordType,
                id : batchId,
                columns : [batchDao.fields.hierarchyId]
            });

            let custTreeDao = new CustTreeDAO();
            let hierarchyRawData = search.lookupFields({
                type: custTreeDao.recordType,
                id: parseInt(hierarchy[batchDao.fields.hierarchyId][0].value),
                columns: [custTreeDao.fields.hierarchystore]
            });

            let hierarchyData = JSON.parse(hierarchyRawData[custTreeDao.fields.hierarchystore]);

            let columnsArgs = [];
            let transGrouping = {};
            let actualGrouping = {};

            //the Invoice Summary search are modifiable by Customer, by getting the search columns
            //we ensure we get all the data, even those added by the users.
            searchColumns.forEach((column) => {
                let tmp = {};
                tmp["name"] = column.name;

                if(column.join){
                    tmp["join"] = column.join;
                }

                columnsArgs.push(tmp);
            });

            //group transactions per parent customer
            transactions.forEach((transaction)=>{
                let customerId = transaction.getValue({name:'internalid', join: "customer"});
                let customerLookup = this.flattenHierarchyObject(hierarchyData);

                if(!transGrouping[customerId]){
                    transGrouping[customerId] = {
                        customerName : customerLookup[customerId].customerName,
                        transactions : []
                    };
                }

                // create a transaction object.
                let tmpTransaction = {};
                columnsArgs.forEach((column) => {
                    let content = {
                        text : transaction.getText(column),
                        value: transaction.getValue(column)
                    };

                    if(!tmpTransaction[column.name]){
                        tmpTransaction[column.name] = {};
                    }

                    if(column.join){
                        tmpTransaction[column.name][column.join] = content;
                    }
                    else{
                        tmpTransaction[column.name] = content;
                    }
                });


                transGrouping[customerId].transactions.push(tmpTransaction);

                //update the subtotals
                if(!transGrouping[customerId].subtotals){
                    transGrouping[customerId].subtotals = [];
                }

                this.addTaxToSubtotal(transGrouping[customerId].subtotals, tmpTransaction);
            });

            //we remove the customer ids for easier parsing in the template.
            //the customer id property served as a lookup for grouping transactions,
            // it does not serve any purpose in the template
            actualGrouping.customers = [];
            for(const props in transGrouping){
                if(transGrouping.hasOwnProperty(props)){

                    //sort subtotals based descending tax rate
                    let sortedSubTotals = transGrouping[props].subtotals.sort((a, b)=>{
                        if(a.taxRate > b.taxRate) return -1;
                        if(a.taxRate < b.taxRate) return 1;
                        return 0;
                    });

                    transGrouping[props].subtotals = sortedSubTotals;

                    actualGrouping.customers.push(transGrouping[props]);
                }
            }

            log.debug("Transaction Grouping: ", JSON.stringify(actualGrouping));
            return actualGrouping;
        }

        addTaxToSubtotal(subtotal, transaction){

            if(transaction.type.value !== 'SalesOrd'){
                let currTaxBracket = parseFloat(transaction.rate.taxItem.value);
                let isNewSubtotal = false;
                let currentSubtotal = subtotal.filter((sub)=> {
                    return sub.taxRate === currTaxBracket;
                });

                if(!currentSubtotal || currentSubtotal.length === 0){
                    isNewSubtotal = true;
                    currentSubtotal = [{
                        taxRate: currTaxBracket,
                        total : 0
                    }];
                }

                currentSubtotal[0].total += parseFloat(transaction.netamountnotax.value);

                if(isNewSubtotal) {
                    subtotal.push(currentSubtotal[0]);
                }
            }
        }

        flattenHierarchyObject(hierarchyObj){
            let flattenedObj = {};

            for(let custId in hierarchyObj){
                if(hierarchyObj.hasOwnProperty(custId)){
                    flattenedObj[custId] = {
                        customerName: this.getCustomerName(hierarchyObj[custId])
                    };

                    let children = hierarchyObj[custId].children;
                    for(let child in children){
                        flattenedObj[child] = {
                            customerName : this.getCustomerName(hierarchyObj[custId].children[child])
                        };
                    }
                }
            }
            return flattenedObj;
        }

        getCustomerName(customer){
            return customer.isperson ?
                customer.lastname + " " + customer.firstname :
                customer.companyname
        }

        getStatementSearch(subsidiary) {
            let statementSearchID;
            let isOW = runtime.isFeatureInEffect('SUBSIDIARIES');

            if(isOW) {
                let statementSearchLookup = new SubsidiaryDAO().getAttributes(subsidiary);
                statementSearchID = statementSearchLookup.statementSearch;
            } else {
                statementSearchID = new CompanyDAO().getAttributes().statementSearch;
            }

            let savedSearchRecord = search.load({
                id : statementSearchID
            });

            // returns the script ID
            return savedSearchRecord.id;
        }

        getNetInvoiceSummaries(idsRec) {
            let idsTrans = idsRec.getValue({fieldId: this.isDao.fields.transactions});
            let tranIdList = idsTrans.length ? idsTrans : [];
            let results = {
                "transactions": []
            };

            if (tranIdList.length > 0) {
                let searchObj = search.load({
                    id: NET_INVOICE_SUMMARY
                });

                searchObj.filterExpression = this.generateTxnFilterExp(searchObj, idsRec);
                log.audit('Net Invoice Summary Filter Expression', JSON.stringify(searchObj.filterExpression));
                let iterator = new SearchIterator(searchObj);

                while (iterator.hasNext()){
                    let result = iterator.next();
                    let txnId = result.id;
                    let txnType = result.getText({name:"type"});

                    let txnAmountRemaining = Math.abs(result.getValue({name:"amountremaining"}));
                    let txnDueDate = result.getValue({name:"formuladate"});
                    let txnTypeValue = result.getValue({name:'type'});

                    if(!txnDueDate) {
                        let errMsg = strings[MISSING_DUE_DATE_MSG];
                        throw error.create({
                            name: "JP_TRANSACTION_ERROR",
                            message: txnType + " #" + txnId + ": " +  errMsg,
                            notifyOff: true
                        });
                    }

                    if (tranIdList.indexOf(txnId) > -1) {
                        let amount = txnTypeValue === "CustCred" ? -txnAmountRemaining : txnAmountRemaining;
                        results.transactions.push({
                            "formuladate": txnDueDate,
                            "amount": amount
                        });
                    }
                }
            }

            return results;
        }

        loadTemplate(language) {

            if (!loadedTemplate && fileId) {
                let fileObj = file.load({id: fileId});
                loadedTemplate = true;
                template = fileObj.getContents();

                //the language passed is based on the customer language,
                //if not set then we get the user preference language.
                if (!language) {
                    language = runtime.getCurrentUser().getPreference(LANG);
                }

                strings = new translator().getTexts(IDS_TEMPLATE_LABELS, true, language);
                /**
                 * Moving to Translation Collection, we now use the new string ids but
                 * we cannot just update the templates as these are the customized by the customers
                 * and will cause their templates to fail.
                 * Here we map the values using the new ids to the old ids.
                 */

                let oldIds = {
                    "ids.label.doc_title": strings[DOC_TITLE],
                    "ids.label.tax_reg_number": strings[TAX_REG_NUM_LABEL],
                    "ids.label.prev_balance" : strings[PREV_BALANCE_LABEL],
                    "ids.label.payment" : strings[PAYMENT_LABEL],
                    "ids.label.balance_forward": strings[BALANCE_FORWARD_LABEL],
                    "ids.label.total_sales": strings[TOTAL_SALES_LABEL],
                    "ids.label.total_credits": strings[TOTAL_CREDITS_LABEL],
                    "ids.label.total_tax" : strings[TOTAL_TAX_LABEL],
                    "ids.label.total": strings[TOTAL_LABEL],
                    "ids.label.tran_date": strings[TRANS_DATE_LABEL],
                    "ids.label.item_quantity": strings[ITEMS_QUANTITY_LABEL],
                    "ids.label.item_price": strings[ITEMS_UNITPRICE_LABEL],
                    "ids.label.line_tax": strings[LINE_TAX_LABEL],
                    "ids.label.line_amount": strings[AMOUNT_LABEL],
                    "ids.label.currency": strings[CURRENCY],
                    "ids.label.exchange_rate": strings[EXCHANGE_RATE],
                    "ids.label.foreign_amount": strings[FOREIGN_AMOUNT],
                    "ids.label.bank_account_info": strings[BANK_ACCOUNT_INFO],
                    "ids.label.review_details": strings[REVIEW_DETAILS],
                    "ids.label.page_number": strings[PAGE_NUMBER],
                    "ids.label.payment_due_date": strings[PAYMENT_DUE_DATE],
                    "ids.label.doc.statement_date": strings[STATEMENT_DATE],
                    "ids.label.total_amount_due": strings[TOTAL_AMOUNT_DUE_LABEL],
                    "ids.label.item_code": strings[ITEM_CODE_LABEL],
                    "ids.label.line_due_date": strings[DUE_DATE_LABEL],
                    "ids.label.bank_account_name": strings[BANK_ACCOUNT_NAME_LABEL],
                    "ids.label.bank_account_number": strings[BANK_ACCOUNT_NUMBER_LABEL],
                    "ids.label.swift_code": strings[SWIFT_CODE_LABEL],
                    "ids.label.bank_name":strings[BANK_NAME_LABEL],
                    "ids.label.bank_address": strings[BANK_ADDRESS_LABEL],
                    "ids.label.bill_to": strings[BILL_TO_LABEL],
                    "ids.label.summary": strings[SUMMARY_LABEL],
                    "ids.label.invoice_number": strings[INVOICE_NUMBER_LABEL],
                    "ids.label.invoice_date":strings[INVOICE_DATE_LABEL],
                    "ids.label.billing_period": strings[BILLING_PERIOD_LABEL],
                    "ids.label.net_invoice": strings[NET_INVOICE_LABEL],
                    "ids.label.tran_details": strings[TRANS_DETAIL_LABEL],
                    "ids.label.inv_sum_details":strings[INVOICE_DETAIL_LABEL],
                    "ids.label.tran_no": strings[TRANS_NO_LABEL],
                    "ids.label.tran_id":strings[TRANS_ID_LABEL],
                    "ids.label.phone": strings[PHONE_LABEL],
                    "ids.label.invoice_details_note": strings[INVOICE_DETAILS_NOTE],
                    "ids.label.tax_details": strings[TAX_DETAILS_LABEL],
                    "ids.label.tax_code": strings[TAX_CODE],
                    "ids.label.tax_rate":strings[TAX_RATE],
                    "ids.label.total_net_amount":strings[TOTAL_NET_AMOUNT],
                    "ids.label.total_tax_details":strings[TOTAL_TAX_DET],
                    "ids.gen.pdf_txn_missing_due_date": strings[MISSING_DUE_DATE_MSG],
                    "ids.label.payment_date": strings[PAYMENT_DATE],
                    "ids.label.payment_no": strings[PAYMENT_NO],
                    "ids.label.payment_id": strings[PAYMENT_ID],
                    "ids.label.payment_details": strings[PAYMENT_DETAILS],
                    "ids.label.payment_amount": strings[PAYMENT_AMOUNT],
                    "ids.label.payment_fxamount": strings[PAYMENT_FOREIGN_AMOUNT],
                    "ids.label.payment_currency": strings[PAYMENT_CURRENCY],
                    "ids.label.payment_exchangerate":strings[PAYMENT_EXCHANGE_RATE],
                    "ids.label.payment_details_title":strings[PAYMENT_DETAILS_TITLE],
                    "ids.label.empty_payment_details":strings[EMPTY_PAYMENT_DETAILS],
                    "ISTEMPLATE_TAXCODERATE" : strings[ISTEMPLATE_TAXCODERATE],
                    "ISTEMPLATE_CTAXCODE" : strings[ISTEMPLATE_CTAXCODE],
                    "CIS_RATE_HEADER" : strings[CIS_RATE_HEADER],
                    "CIS_TAXAMOUNT_HEADER" : strings[CIS_TAXAMOUNT_HEADER],
                    "ISTEMPLATE_TAXEXEMPT" : strings[ISTEMPLATE_TAXEXEMPT],
                    "CIS_SUBTOTAL" : strings[CIS_SUBTOTAL],
                    "TIL_IS_FOOTNOTE" : strings[TIL_IS_FOOTNOTE]
                }

                let stringUtil = new StringUtility(template);
                template = stringUtil.replaceParameters(oldIds);
            }

            return template;
        }

        parseFilterExpressionToArray(filterExpressions) {
            filterExpressions = JSON.stringify(filterExpressions);
            filterExpressions = JSON.parse(filterExpressions);

            return filterExpressions;
        }


        /**
         * Add Overdue Filters to search expression
         *
         * @param (Object) idsRec Invoice Summary Record
         * @param {Array} filterExpression Search filter expression
         * @returns {Array} Filter expression with overdue option
         */
        buildFilterExpressionWithOverdue(idsRec, filterExpression) {
            /*
             * NOTE:
             * Subsidiary value in the Invoice Summary will always be the same as the filter for OW
             * Customer field should be the source of the value and not the Customer filter.
             * Customer filter can be blank
             */
            let subsidiaryValue = idsRec.getValue({fieldId: SUBSIDIARY});
            let customerValue = idsRec.getValue({fieldId: this.isDao.fields.customer});
            let invSumClosingDate = idsRec.getValue({fieldId: this.isDao.fields.closingDate});
            let closingDateString = format.format({type:format.Type.DATE, value:invSumClosingDate});
            let isOW = runtime.isFeatureInEffect('SUBSIDIARIES');

            let resultExpression = filterExpression;

            let overdueFilter = [
                ["mainline", "is", "T"],
                "AND",
                ["status", "noneof", ["CustInvc:B"]],
                "AND",
                ["duedate", "before", [closingDateString]],
                "AND",
                [["custbody_5185_idsnumber", "isnotempty", ""], "OR", ["custbody_suitel10n_jp_ids_rec", "noneof", "@NONE@"]]
            ];

            if (isOW) {
                overdueFilter.push('AND');
                overdueFilter.push(['subsidiary.internalid', 'is', subsidiaryValue]);
            }

            if (customerValue) {
                overdueFilter.push('AND');
                overdueFilter.push(['customer.internalid', 'is', customerValue]);
            }

            overdueFilter.push('AND');
            overdueFilter.push(["custbody_4392_includeids", "is", "T"]);
            overdueFilter.push('AND');
            overdueFilter.push(["customer.isinactive", "is", "F"]);
            overdueFilter.push('AND');
            overdueFilter.push(["customer.custentity_4392_useids", "is", "T"]);
            overdueFilter.push('AND');
            overdueFilter.push(["type","is","CustInvc"]);
            overdueFilter.push('AND');
            overdueFilter.push(["approvalstatus", "noneof", ["1", "3"]]);

            let transactionDAO = new TransactionDAO();
            let overdueFilterExpression = transactionDAO.getOverdueInvoicesFilterExpression(overdueFilter,
                invSumClosingDate);

            if(overdueFilterExpression.length > 0){
                resultExpression.push('OR');
                resultExpression.push(overdueFilterExpression);
            }

            return resultExpression;
        }
    }

    return InvoiceSummaryFilePrinter;

});
