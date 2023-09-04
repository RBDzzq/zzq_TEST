/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    './JP_ISDrilldownResultValuesHandler',
    'N/ui/serverWidget',
    'N/search',
    'N/runtime',
    '../lib/JP_TCTranslator'
], (
    ISDrilldownResultValuesHandler,
    serverWidget,
    search,
    runtime,
    translator
) => {

    let requestValues;
    let SUBLISTNAME = 'IDS_LABEL_DRILLDOWN_SUBLIST_NAME';
    let TRANNUM = 'IDS_LABEL_DRILLDOWN_TRAN_NUM';
    let CUSTOMERNAME = 'IDS_LABEL_DRILLDOWN_CUST_NAME';
    let DUEDATE= 'IDS_LABEL_DRILLDOWN_DUE_DATE';
    let SONUM = 'IDS_LABEL_DRILLDOWN_SO_NUM';
    let TRANDATE = 'IDS_LABEL_DRILLDOWN_TRAN_DATE';
    let AMOUNT = 'IDS_LABEL_DRILLDOWN_AMOUNT';
    let STATUS = 'IDS_LABEL_DRILLDOWN_STATUS';
    let MEMO = 'IDS_LABEL_DRILLDOWN_MEMO';
    let CURRENCY = 'IDS_LABEL_DRILLDOWN_CURRENCY';
    let FXRATE = 'IDS_LABEL_DRILLDOWN_FX_RATE';
    let FXAMOUNT = 'IDS_LABEL_DRILLDOWN_FX_AMOUNT';
    let INV_TITLE_KEY = 'IDS_LABEL_DRILLDOWN_TITLE_INVOICES';
    let CM_TITLE_KEY = 'IDS_LABEL_DRILLDOWN_TITLE_CREDITMEMOS';
    let SO_TITLE_KEY = 'IDS_LABEL_DRILLDOWN_TITLE_SALESORDERS';
    let TRAN_TITLE_KEY = 'IDS_LABEL_DRILLDOWN_TITLE_TRANSACTIONS';

    let strings;

    class JP_ISDrilldownComponentContainer{

        constructor(reqValues) {
            requestValues = reqValues;

            strings = new translator().getTexts([
                INV_TITLE_KEY,
                CM_TITLE_KEY,
                SO_TITLE_KEY,
                TRAN_TITLE_KEY,
                SUBLISTNAME,
                TRANNUM,
                CUSTOMERNAME,
                DUEDATE,
                SONUM,
                TRANDATE,
                AMOUNT,
                STATUS,
                MEMO,
                CURRENCY,
                FXRATE,
                FXAMOUNT
            ], true);
        }

        /**
         * Get Search form title
         *
         * @returns {String}
         */
        getSearchFormTitle(){

            let tranTypes = {
                SalesOrd: strings[SO_TITLE_KEY],
                CustInvc: strings[INV_TITLE_KEY],
                CustCred: strings[CM_TITLE_KEY]
            };

            let custName = '';
            if (requestValues.custId) {
                let custLookup = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: requestValues.custId,
                    columns: ['entityid']
                });
                custName = custLookup.entityid;
            }

            let title = [custName, tranTypes[requestValues.type] || strings[TRAN_TITLE_KEY] ];
            return title.join(' - ');
        };


        /**
         * Get Results sublist
         *
         * @returns {Object}
         */
        getResultSublist(){

            let sublistFields = [];

            if(requestValues.consolidated && requestValues.consolidated === 'T') {
                sublistFields.push({
                    id: 'custpage_customer_name',
                    type: serverWidget.FieldType.TEXT,
                    label: strings[CUSTOMERNAME]
                });
            }

            sublistFields.push({
                id: 'custpage_transactionnumber',
                type: serverWidget.FieldType.TEXTAREA,
                label: strings[TRANNUM]
            });

            sublistFields.push({
                id: 'custpage_duedate',
                type: serverWidget.FieldType.TEXT,
                label: strings[DUEDATE]
            });

            sublistFields.push({
                id: 'custpage_createdfrom',
                type: serverWidget.FieldType.TEXT,
                label: strings[SONUM]
            });

            sublistFields.push({
                id: 'custpage_trandate',
                type: serverWidget.FieldType.TEXT,
                label: strings[TRANDATE]
            });

            sublistFields.push({
                id: 'custpage_status',
                type: serverWidget.FieldType.TEXT,
                label: strings[STATUS]
            });

            sublistFields.push({
                id: 'custpage_memo',
                type: serverWidget.FieldType.TEXTAREA,
                label: strings[MEMO]
            });

            if (runtime.isFeatureInEffect({feature:'MULTICURRENCY'})) {
                sublistFields.push({
                    id: 'custpage_currency',
                    type: serverWidget.FieldType.TEXT,
                    label: strings[CURRENCY]
                });

                sublistFields.push({
                    id: 'custpage_foreignamount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: strings[FXAMOUNT]
                });

                sublistFields.push({
                    id: 'custpage_exchangerate',
                    type: serverWidget.FieldType.FLOAT,
                    label: strings[FXRATE]
                });
            }

            sublistFields.push({
                id: 'custpage_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: strings[AMOUNT]
            });

            let sublistValues = this.getResultSublistValues(requestValues);

            return {
                id : 'custpage_result',
                type : serverWidget.SublistType.STATICLIST,
                label : strings[SUBLISTNAME],
                sublistFields : sublistFields,
                sublistValues: sublistValues
            }
        };

        getResultSublistValues(reqValues) {
            let values = [];
            let sublistValuesHandler = new ISDrilldownResultValuesHandler(reqValues);
            let transactionResults = sublistValuesHandler.getValues();

            for (let i = 0; i < transactionResults.length; i++) {
                let result = transactionResults[i];

                for (let key in result) {
                    let fieldValue = {
                        id: key,
                        line: i,
                        value: result[key] || null
                    };
                    values.push(fieldValue);
                }
            }

            return values;
        }
    }

    return JP_ISDrilldownComponentContainer;

});
