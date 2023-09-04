/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([
    'N/search',
    'N/record',
    'N/query',
    'N/ui/serverWidget',
    'N/runtime',
    '../../app/JP_TransactionServerSide',
    '../../app/JP_PaymentTermUtility',
    '../../data/NQuery/JP_NItemDAO',
    '../../data/NQuery/JP_NSubsidiaryDAO',
    '../../data/JP_CompanyDAO',
    '../../data/JP_EntityDAO'

], (
        search,
        record,
        query,
        widget,
        runtime,
        TransactionServerSide,
        PaymentTermUtility,
        ItemDAO,
        SubsidiaryDAO,
        CompDAO,
        EntityDAO
    ) => {

        const NEG_NUM_PREF = 'NEGATIVE_NUMBER_FORMAT';
        const ITEM_SUBLIST = 'item';
        const LINE_SUBLIST = 'line';
        const ITEM_TAXRATE = 'taxrate1';
        const ITEM_AMOUNT = 'amount';
        const ITEM_TAXAMT = 'tax1amt';
        const ITEM_TYPE = 'itemtype';
        const ITEM_INTERNALID = 'item';
        const DISCOUNT_TYPE = 'Discount';
        const MARKUP_TYPE = 'Markup';
        const DESCRIPTION_TYPE = 'Description';
        const GROUP_TYPE = 'Group';
        const PAYMENT_TYPE = 'Payment';
        const SUBTOTAL_TYPE = 'Subtotal';
        const SUBSIDIARY_FLD = 'subsidiary';
        const CURRENCY_SYMBOL_FLD = 'displaysymbol';
        const PAYMENT_TERM_RECORD = 'custpage_jp_payment_term';
        const DOCTITLES = 'custpage_jp_doctitles';
        const GREETINGS = 'custpage_jp_greetings';
        const SO_SEALS = 'custpage_jp_soseal';
        const INV_SEALS = 'custpage_jp_invseal';
        const PO_SEALS = 'custpage_jp_poseal';
        const MEMO_SEALS = 'custpage_jp_memoseal';
        const CURR_SYMBOL = 'custpage_jp_currsym';
        const CUST_NEG_NUM_PREF_FLD = 'custpage_jp_neg_num_pref';
        const CUST_TAX_SUMMARY_FLD = 'custpage_jp_tax_breakdown';
        const CUST_ITEM_DISPLAYNAME_FLD = 'custpage_jp_item_displayname';
        const CUST_LINE_ENTITYNAME_FLD = 'custpage_jp_line_entityname';
        const TAX_REG_NUMBER = 'custpage_jp_loc_tax_reg_number';
        const CURRENCY_FLD = 'currency';
        const TRANDATE_FLD = 'trandate';
        const ENTITY_NAME = 'entity';
        const NUM_REGEX = /\B(?=(\d{3})+(?!\d))/g;
        const USE_DASH = '0';
        const UNSUPPORTED_ITEM_TYPES = [
            DISCOUNT_TYPE,
            MARKUP_TYPE,
            DESCRIPTION_TYPE,
            GROUP_TYPE,
            PAYMENT_TYPE,
            SUBTOTAL_TYPE
        ];

        let currSymbol = '';
        let negNumFormat = USE_DASH;
        let lineCount;

        function JP_PrintUE() {
            TransactionServerSide.call(this);
        }

        util.extend(JP_PrintUE.prototype, TransactionServerSide.prototype);

        JP_PrintUE.prototype.beforeLoad= function(scriptContext){

                let newRecord = scriptContext.newRecord;
                let tranType = newRecord.type;
                let subsidiary = newRecord.getValue({fieldId: SUBSIDIARY_FLD});
                let subsidiaryDao = new SubsidiaryDAO();
                subsidiaryDao.getData(subsidiary, true);
                let subsidiaryCountry = subsidiaryDao.fields.country.val;
                let isOW = runtime.isFeatureInEffect({feature: 'SUBSIDIARIES'});

                if(scriptContext.type == scriptContext.UserEventType.PRINT &&
                    (!isOW || (isOW && subsidiaryCountry === 'JP'))){

                    subsidiaryDao.getData(subsidiary, false);
                    let txnId = newRecord.id;
                    let currency = newRecord.getValue({fieldId:CURRENCY_FLD});
                    let tranDate = newRecord.getValue({fieldId:TRANDATE_FLD});

                    if(currency){
                        let currencyRec = record.load({
                            type: record.Type.CURRENCY,
                            id: currency
                        });
                        currSymbol = currencyRec.getValue({fieldId: CURRENCY_SYMBOL_FLD});
                    }

                    if(txnId){

                        let form = scriptContext.form;

                        //tax registration number is common to all four transactions.
                        let compDao = new CompDAO();
                        let taxRegNo = (isOW) ? subsidiaryDao.fields.taxRegNo.val :
                            compDao.getCompValue(subsidiaryDao.fields.taxRegNo.id);

                        form.addField({
                            id: TAX_REG_NUMBER,
                            type: widget.FieldType.TEXT,
                            label: 'tax registation number'
                        });

                        newRecord.setValue({fieldId: TAX_REG_NUMBER,value: taxRegNo });

                        switch(tranType){
                            case record.Type.SALES_ORDER:
                            case record.Type.PURCHASE_ORDER:
                            case record.Type.INVOICE:
                            case record.Type.VENDOR_BILL:
                            case record.Type.VENDOR_CREDIT:
                            case record.Type.CASH_SALE:
                            case record.Type.CREDIT_MEMO:
                            case record.Type.ESTIMATE:
                            case record.Type.RETURN_AUTHORIZATION:

                                // PAYMENT TERM
                                let entityInfo = this.getEntityInfo(scriptContext);
                                let paymentTermUtility = new PaymentTermUtility(entityInfo);
                                let term = paymentTermUtility.getNextTerm(tranDate);
                                let ptQueryResult;
                                if(term && term.hasOwnProperty('id')) {
                                    ptQueryResult = paymentTermUtility.loadPaymentTerm(term['id'])[0];
                                }

                                let payTerm = '';

                                if(ptQueryResult){
                                    ptQueryResult.description =
                                        (!!ptQueryResult.description) ? ptQueryResult.description : '';

                                    payTerm = JSON.stringify(ptQueryResult);
                                }

                                form.addField({
                                    id: PAYMENT_TERM_RECORD,
                                    type: widget.FieldType.TEXT,
                                    label: 'payment_term'
                                });
                                newRecord.setValue({fieldId: PAYMENT_TERM_RECORD, value: payTerm});

                                // NEGATIVE NUMBERS
                                form.addField({
                                    id: CUST_NEG_NUM_PREF_FLD,
                                    type: widget.FieldType.TEXT,
                                    label: 'negative_number'
                                });
                                let user = runtime.getCurrentUser();
                                //0 is -, 1 is (), default to -
                                negNumFormat = user.getPreference({name:NEG_NUM_PREF}) || USE_DASH;
                                newRecord.setValue({fieldId: CUST_NEG_NUM_PREF_FLD, value: negNumFormat});

                                form.addField({
                                    id: CUST_TAX_SUMMARY_FLD,
                                    type: widget.FieldType.LONGTEXT,
                                    label: 'tax_summary'
                                });
                                lineCount = newRecord.getLineCount(ITEM_SUBLIST);
                                let taxRateObj = {};
                                let itemsInTransaction = [];
                                for(let i=0; i<lineCount; i++){
                                    let itemType = newRecord.getSublistValue(ITEM_SUBLIST,ITEM_TYPE,i);
                                    if(itemType && UNSUPPORTED_ITEM_TYPES.indexOf(itemType) !== -1){
                                        continue;
                                    }
                                    let id = newRecord.getSublistValue(ITEM_SUBLIST,ITEM_INTERNALID,i);
                                    if(id){
                                        itemsInTransaction.push(id);
                                    }
                                    let taxRate = newRecord.getSublistValue(ITEM_SUBLIST,ITEM_TAXRATE,i) || 0;
                                    let amount = newRecord.getSublistValue(ITEM_SUBLIST,ITEM_AMOUNT,i) || 0;
                                    let taxAmt = newRecord.getSublistValue(ITEM_SUBLIST,ITEM_TAXAMT,i) || 0;
                                    if(taxRateObj.hasOwnProperty(taxRate)){
                                        taxRateObj[taxRate]['subtotal'] += amount;
                                        taxRateObj[taxRate]['taxtotal'] += taxAmt;
                                    }else{
                                        taxRateObj[taxRate] = {
                                            subtotal: amount,
                                            taxtotal: taxAmt
                                        }
                                    }
                                }

                                // ITEM DISPLAY NAME
                                let itemSublist = form.getSublist(ITEM_SUBLIST);
                                itemSublist.addField({
                                    id: CUST_ITEM_DISPLAYNAME_FLD,
                                    label: 'displayname',
                                    type: widget.FieldType.TEXT
                                });

                                if(itemsInTransaction && itemsInTransaction.length > 0){
                                    let displayNames = new ItemDAO().getItemDisplayNames(itemsInTransaction);
                                    for(let j=0; j<lineCount; j++){
                                        let itemType = newRecord.getSublistValue(ITEM_SUBLIST,ITEM_TYPE,j);
                                        if(itemType && UNSUPPORTED_ITEM_TYPES.indexOf(itemType) !== -1){
                                            continue;
                                        }
                                        let id = newRecord.getSublistValue(ITEM_SUBLIST,ITEM_INTERNALID,j);
                                        if(id){
                                            newRecord.setSublistValue(ITEM_SUBLIST,CUST_ITEM_DISPLAYNAME_FLD,j,displayNames[id]);
                                        }
                                    }
                                }

                                let taxSummary = [];
                                for(let taxRate in taxRateObj){
                                    if(taxRate && taxRate!== '0'){
                                        let taxTotal = taxRateObj[taxRate]['taxtotal'];
                                        let subTotal = taxRateObj[taxRate]['subtotal'];
                                        if(taxTotal && subTotal){
                                            taxSummary.unshift({
                                                taxrate: formatNegativeNumber(taxRate.toLocaleString()),
                                                taxtotal: addCurrencySymbol(formatNegativeNumber(
                                                    taxTotal.toFixed(2).toString().replace(NUM_REGEX, ","))),
                                                subtotal: addCurrencySymbol(formatNegativeNumber(
                                                    subTotal.toFixed(2).toString().replace(NUM_REGEX, ",")))
                                            });
                                        }
                                    }
                                }
                                newRecord.setValue({fieldId:CUST_TAX_SUMMARY_FLD,value:JSON.stringify(taxSummary)});

                                // GREETINGS
                                form.addField({
                                    id: GREETINGS,
                                    type: widget.FieldType.TEXT,
                                    label: 'greetings'
                                });
                                newRecord.setValue({
                                    fieldId:GREETINGS,
                                    value: JSON.stringify({
                                        invoice_greeting: subsidiaryDao.fields.invGreeting.val || '',
                                        po_greeting: subsidiaryDao.fields.poGreeting.val || '',
                                        so_greeting: subsidiaryDao.fields.soGreeting.val || '',
                                        cm_greeting: subsidiaryDao.fields.cmGreeting.val || ''
                                    })
                                });

                                // COMPANY SEAL
                                if(!isOW){
                                    //contains binary data of the image, so let's store them individually.
                                    let soSeal = new CompDAO().getCompValue('custrecord_jp_pdf_seal_so');
                                    let invSeal = new CompDAO().getCompValue('custrecord_jp_pdf_seal_invoice');
                                    let poSeal = new CompDAO().getCompValue('custrecord_jp_pdf_seal_po');
                                    let cmSeal = new CompDAO().getCompValue('custrecord_jp_pdf_seal_memo');
                                    const seals = [
                                        {id: SO_SEALS, type: widget.FieldType.IMAGE, label: 'SO SEAL', val: soSeal},
                                        {id: INV_SEALS, type: widget.FieldType.IMAGE, label: 'INV SEAL', val: invSeal},
                                        {id: PO_SEALS, type: widget.FieldType.IMAGE, label: 'PO SEAL', val: poSeal},
                                        {id: MEMO_SEALS, type: widget.FieldType.IMAGE, label: 'MEMO SEAL', val: cmSeal}
                                    ]

                                    seals.forEach((seal)=>{
                                        form.addField({
                                            id: seal.id,
                                            type: seal.type,
                                            label: seal.label
                                        });

                                        newRecord.setValue({fieldId: seal.id, value: seal.val || ''});
                                    });
                                }
                            case record.Type.JOURNAL_ENTRY:

                                //TITLES
                                form.addField({
                                    id: DOCTITLES,
                                    type: widget.FieldType.TEXT,
                                    label: 'doctitles'
                                });
                                newRecord.setValue({
                                    fieldId:DOCTITLES,
                                    value: JSON.stringify({
                                        invoice_title: subsidiaryDao.fields.invDocTitle.val || '',
                                        po_title: subsidiaryDao.fields.poDocTitle.val || '',
                                        so_title: subsidiaryDao.fields.soDocTitle.val || '',
                                        journal_title: subsidiaryDao.fields.jeDocTitle.val || '',
                                        cm_title: subsidiaryDao.fields.cmDocTitle.val || ''
                                    })
                                });

                                // CURRENCY SYMBOL
                                form.addField({
                                    id: CURR_SYMBOL,
                                    type: widget.FieldType.TEXT,
                                    label: 'currencysymbol'
                                });
                                newRecord.setValue({fieldId:CURR_SYMBOL, value:currSymbol});

                                // LINE ENTITY DISPLAY NAME
                                let lineSublist = form.getSublist(LINE_SUBLIST);
                                if (lineSublist){
                                    lineSublist.addField({
                                        id: CUST_LINE_ENTITYNAME_FLD,
                                        label: 'entityname',
                                        type: widget.FieldType.TEXT
                                    });
                                    lineCount = newRecord.getLineCount(LINE_SUBLIST);
                                    for(let i=0; i<lineCount; i++){
                                        let entity = newRecord.getSublistValue(LINE_SUBLIST,ENTITY_NAME,i);
                                        if(entity) {
                                            let entityDAO = new EntityDAO();
                                            let entityModel = entityDAO.retrieveEntityById(entity, true);
                                            let name = '';

                                            let entityObj = record.load({
                                                type: entityModel.entityType,
                                                id: entity,
                                                isDynamic: true
                                            });

                                            if (entityObj.getValue('isperson') === 'T'){
                                                name = entityObj.getValue('lastname') + " " + entityObj.getValue('firstname');
                                            }else{
                                                name = entityObj.getValue('companyname');
                                            }
                                            newRecord.setSublistValue(LINE_SUBLIST,CUST_LINE_ENTITYNAME_FLD,i,name);
                                        }
                                    }
                                }
                        }
                    }
                }
            }

        function formatNegativeNumber(num){
            let stringNum = num.toString();
            if(negNumFormat.toString() === USE_DASH || stringNum.indexOf('-') === -1){
                return stringNum;
            }else{
                return stringNum.replace('-', '(') + ')';
            }
        }

        function addCurrencySymbol(num) {
            let stringNum = num.toString();
            if (stringNum.indexOf('-') !== -1) {
                return stringNum.replace('-', '-' + currSymbol);
            } else if (stringNum.indexOf('(') !== -1) {
                return stringNum.replace('(', '(' + currSymbol);
            }
            return currSymbol + stringNum;
        }

        return {
            beforeLoad: (scriptContext) => {new JP_PrintUE().beforeLoad(scriptContext)},
        };

    });
