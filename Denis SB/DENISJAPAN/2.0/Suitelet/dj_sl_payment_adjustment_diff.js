/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 *
 * ì¸ã‡ä«óùÇÃï“èWÅAåÎç∑í≤êÆã‡äzâÊñ 
 *
 *
 */
define(['N/ui/serverWidget', 'N/http', 'N/record', 'N/search', 'N/redirect', 'N/format', 'N/runtime', 'N/url', 'me', 'lib', 'underscore', 'underscore_s'],
    function (serverWidget, http, record, search, redirect, format, runtime, url, me, lib, _, _s) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            try {
                if (context.request.method === http.Method.GET) {
                    doGet(context);
                } else {//POST
                    doPost(context);
                }
            } catch (e) {
                log.error({title: e.name, details: e.message});
            }
        }

        function doGet(context) {
            try {
                //Get parameter
                var paramObj = {};
                paramObj.custpayment_m_id = context.request.parameters.custrecord_custpayment_m_id;
                // ì¸ã‡ÉfÅ[É^id
                paramObj.id = context.request.parameters.custrecord_custpayment_id;
                // å⁄ãq
                paramObj.client = context.request.parameters.client;
                // êøãÅî‘çÜ
                paramObj.tranid = context.request.parameters.tranid;
                // ç∑äz
                paramObj.adjustment = context.request.parameters.adjustment;
                // ì¸ã‡
                paramObj.paymentamo = context.request.parameters.paymentamo;
                // êøãÅäz
                paramObj.amountremaining = context.request.parameters.amountremaining;

                // òAåã
                paramObj.subsidiary = context.request.parameters.subsidiary;

                paramObj.from = context.request.parameters.from;
                paramObj.to = context.request.parameters.to;

                // ÉtÉHÅ[ÉÄíËã`
                var form = serverWidget.createForm({
                    title: 'ì¸ã‡ï[ç∑äzí≤êÆ'
                });
                form.clientScriptModulePath = '../Client/dj_cs_payment_adjustment_diff.js';
                buildForm(form, paramObj);
                //Build sublist
                var invoiceSublist = buildSublist(form);
                fillSublist(invoiceSublist, paramObj, form);

                context.response.writePage(form);
            } catch (e) {
                log.error('doGet: ' + e.name, e.message);
            }
        }

        function buildForm(form, options) {
            try {
                //submit button
                form.addSubmitButton({
                    label: 'ï€ë∂'
                });
                //cancel button
                form.addButton({
                    id: 'cancelButton',
                    label: 'ÉLÉÉÉìÉZÉã',
                    functionName: 'btnReturnButton();'
                });
                //payment_id
                var custpaymentmid = form.addField({
                    id: 'custpage_custpayment_m_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                custpaymentmid.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                custpaymentmid.defaultValue = options.custpayment_m_id;
                //payment_id
                var paymentid = form.addField({
                    id: 'custpage_payment_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                paymentid.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                paymentid.defaultValue = options.id;

                //subsidiary
                var subsidiaryField = form.addField({
                    id: 'custpage_subsidiary',
                    label: 'SubsidiaryText : ',
                    type: serverWidget.FieldType.TEXT
                });
                subsidiaryField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                subsidiaryField.defaultValue = options.subsidiary;

                //å⁄ãq
                var customerField = form.addField({
                    id: 'custpage_customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    label: 'å⁄ãq'
                });

                customerField.defaultValue = options.client;
                customerField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                //êøãÅî‘çÜ
                var tranidField = form.addField({
                    id: 'custpage_tranid',
                    label: 'êøãÅî‘çÜ',
                    type: serverWidget.FieldType.TEXT
                });
                tranidField.defaultValue = options.tranid;
                tranidField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                //í≤êÆäz
                var adjustmentField = form.addField({
                    id: 'custpage_adjustment',
                    label: 'í≤êÆäz',
                    type: serverWidget.FieldType.CURRENCY
                });
                adjustmentField.defaultValue = 0;
                adjustmentField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                adjustmentField.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.STARTROW
                });

                // //ç∑äz
                // var diffField = form.addField({
                //     id: 'custpage_diff',
                //     label: 'ç∑äz',
                //     type: serverWidget.FieldType.CURRENCY
                // });
                // diffField.defaultValue = options.adjustment;
                // diffField.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.DISABLED
                // });
                // diffField.updateLayoutType({
                //     layoutType: serverWidget.FieldLayoutType.ENDROW
                // });
                //êøãÅäz
                var diffField = form.addField({
                    id: 'custpage_amountremaining',
                    label: 'êøãÅäz',
                    type: serverWidget.FieldType.CURRENCY
                });
                diffField.defaultValue = options.amountremaining;
                diffField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                diffField.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.ENDROW
                });


                //ì¸ã‡
                var paymentamoField = form.addField({
                    id: 'custpage_paymentamo',
                    label: 'ì¸ã‡',
                    type: serverWidget.FieldType.CURRENCY
                });
                paymentamoField.defaultValue = options.paymentamo;
                paymentamoField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                //ä˙ì˙
                var dateFrom = form.addField({
                    id: 'custpage_date_from',
                    label: 'ä˙ì˙(FROM)',
                    type: serverWidget.FieldType.DATE
                });
                if (!me.isEmpty(options.from)) {
                    dateFrom.defaultValue = options.from;
                }
                dateFrom.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                var dateTo = form.addField({
                    id: 'custpage_date_to',
                    label: 'TO',
                    type: serverWidget.FieldType.DATE
                });
                if (!me.isEmpty(options.to)) {
                    dateTo.defaultValue = options.to;
                }
                dateTo.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

            } catch (e) {
                log.error('buildForm: ' + e.name, e.message);
            }
        }

        function buildSublist(form) {
            try {

                var invoiceSubList = form.addSublist({
                    id: 'custpage_diff_sub_list',
                    type: serverWidget.SublistType.INLINEEDITOR,
                    label: 'ì¸ã‡ï[ç∑äzí≤êÆ'
                });

                var accountField = invoiceSubList.addField({
                    id: 'custpage_sub_account',
                    type: serverWidget.FieldType.SELECT,
                    label: 'ä®íËâ»ñ⁄',
                    source: 'account'
                });
                accountField.isMandatory = true;

                var amountField = invoiceSubList.addField({
                    id: 'custpage_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'ã‡äz'
                });
                amountField.isMandatory = true;

                var amountLeftField = invoiceSubList.addField({
                    id: 'custpage_amount_left',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'ê≈î≤ã‡äz'
                });
                amountLeftField.isDisabled = true;

                var taxitemField = invoiceSubList.addField({
                    id: 'custpage_taxitem',
                    type: serverWidget.FieldType.SELECT,
                    label: 'è¡îÔê≈',
                    source: 'salestaxitem'
                });

                var taxAmountField = invoiceSubList.addField({
                    id: 'custpage_tax_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'è¡îÔê≈äz'
                });
                taxAmountField.isReadOnly = true;

                var totalAmountField = invoiceSubList.addField({
                    id: 'custpage_total_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'ëçäz'
                });
                totalAmountField.isDisabled = true;
                return invoiceSubList;
            } catch (e) {
                log.error('buildSublist: ' + e.name, e.message);
                return {};
            }
        }

        function fillSublist(invoiceSublist, paramObj, form) {
            try {
                var searchSaving = search.lookupFields({
                    type: 'customrecord_dj_custpayment',
                    id: paramObj.id,
                    columns: ['custrecord_dj_custpayment_saving_s',
                        'custrecord_dj_custpayment_saving_t',
                        'custrecord_dj_custpayment_saving_a']
                });
                var saving2 = searchSaving.custrecord_dj_custpayment_saving_s;
                var saving3 = searchSaving.custrecord_dj_custpayment_saving_t;
                var saving4 = searchSaving.custrecord_dj_custpayment_saving_a;
                if (!me.isEmpty(saving2)) {
                    saving2 = JSON.parse(saving2);

                    var tranObj = saving2['tranid:'+paramObj.tranid];

                    if (!me.isEmpty(tranObj) && !me.isEmpty(tranObj.diffList)) {
                        util.each(tranObj.diffList, function (item, i) {
                            invoiceSublist.setSublistValue({
                                id:'custpage_sub_account',
                                line:i,
                                value:item.account
                            });
                            invoiceSublist.setSublistValue({
                                id:'custpage_amount',
                                line:i,
                                value:item.amount
                            });
                            invoiceSublist.setSublistValue({
                                id:'custpage_amount_left',
                                line:i,
                                value:item.amountLeft
                            });
                            invoiceSublist.setSublistValue({
                                id:'custpage_taxitem',
                                line:i,
                                value:item.taxitem
                            });
                            invoiceSublist.setSublistValue({
                                id:'custpage_tax_amount',
                                line:i,
                                value:item.taxAmount
                            });
                            invoiceSublist.setSublistValue({
                                id:'custpage_total_amount',
                                line:i,
                                value:item.totalAmount
                            });
                        });


                        form.getField({
                            id: 'custpage_adjustment',
                        }).defaultValue = parseInt(tranObj.totalAjustAmount, 10);

                    }
                }

                var saving34line = 0;
                var saving34TotalAjustAmount = 0;
                    if (!me.isEmpty(saving3)){
                        saving3 = JSON.parse(saving3);
                        invoiceSublist.setSublistValue({
                            id:'custpage_sub_account',
                            line:saving34line,
                            value:saving3.account
                        });
                        invoiceSublist.setSublistValue({
                            id:'custpage_amount',
                            line:saving34line,
                            value:saving3.amount
                        });
                        invoiceSublist.setSublistValue({
                            id:'custpage_amount_left',
                            line:saving34line,
                            value:saving3.amountLeft
                        });
                        invoiceSublist.setSublistValue({
                            id:'custpage_taxitem',
                            line:saving34line,
                            value:saving3.taxitem
                        });
                        invoiceSublist.setSublistValue({
                            id:'custpage_tax_amount',
                            line:saving34line,
                            value:saving3.taxAmount
                        });
                        invoiceSublist.setSublistValue({
                            id:'custpage_total_amount',
                            line:saving34line,
                            value:saving3.totalAmount
                        });
                        saving34line += 1;
                        saving34TotalAjustAmount += parseInt(saving3.amount, 10);
                        form.getField({
                            id: 'custpage_adjustment',
                        }).defaultValue = parseInt(saving34TotalAjustAmount, 10);
                    }
                    if (!me.isEmpty(saving4)){
                        saving4 = JSON.parse(saving4);
                        invoiceSublist.setSublistValue({
                            id:'custpage_sub_account',
                            line:saving34line,
                            value:saving4.account
                        });
                        invoiceSublist.setSublistValue({
                            id:'custpage_amount',
                            line:saving34line,
                            value:saving4.amount
                        });
                        invoiceSublist.setSublistValue({
                            id:'custpage_amount_left',
                            line:saving34line,
                            value:saving4.amountLeft
                        });
                        invoiceSublist.setSublistValue({
                            id:'custpage_taxitem',
                            line:saving34line,
                            value:saving4.taxitem
                        });
                        invoiceSublist.setSublistValue({
                            id:'custpage_tax_amount',
                            line:saving34line,
                            value:saving4.taxAmount
                        });
                        invoiceSublist.setSublistValue({
                            id:'custpage_total_amount',
                            line:saving34line,
                            value:saving4.totalAmount
                        });

                        saving34TotalAjustAmount += parseInt(saving4.amount, 10);

                        form.getField({
                            id: 'custpage_adjustment',
                        }).defaultValue = parseInt(saving34TotalAjustAmount, 10);
                    }



            } catch (e) {
                log.error('fillSublist: ' + e.name, e.message);
            }
        }


        function doPost(context) {
            try {
                var serverRequest = context.request;
                var tranid = serverRequest.parameters.custpage_tranid;
                var lines = serverRequest.getLineCount({group: "custpage_diff_sub_list"});
                var listInput = [];
                var totalAjustAmount = 0;
                for (var i = 0; i < lines; i++) {
                    // ä®íËâ»ñ⁄
                    var account = serverRequest.getSublistValue({
                        group: 'custpage_diff_sub_list',
                        name: 'custpage_sub_account',
                        line: i
                    });
                    //
                    var amount = serverRequest.getSublistValue({
                        group: 'custpage_diff_sub_list',
                        name: 'custpage_amount',
                        line: i
                    });
                    var amountLeft = serverRequest.getSublistValue({
                        group: 'custpage_diff_sub_list',
                        name: 'custpage_amount_left',
                        line: i
                    });
                    var taxitem = serverRequest.getSublistValue({
                        group: 'custpage_diff_sub_list',
                        name: 'custpage_taxitem',
                        line: i
                    });
                    var taxAmount = serverRequest.getSublistValue({
                        group: 'custpage_diff_sub_list',
                        name: 'custpage_tax_amount',
                        line: i
                    });
                    //äz
                    var totalAmount = serverRequest.getSublistValue({
                        group: 'custpage_diff_sub_list',
                        name: 'custpage_total_amount',
                        line: i
                    });

                    if (me.isEmpty(account) || me.isEmpty(amount)) {
                        continue;
                    }
                    totalAjustAmount += parseInt(amount, 10);
                    // store json of row
                    var jsonSave = {
                        "account": account,
                        "amount": amount,
                        "amountLeft": amountLeft,
                        "taxitem": taxitem,
                        "taxAmount": taxAmount,
                        "totalAmount": totalAmount
                    };
                    log.audit('jsonSave',jsonSave);
                    listInput.push(jsonSave);
                }

                var paymentId = serverRequest.parameters.custpage_payment_id;
                var amountremaining = serverRequest.parameters.custpage_amountremaining;

                var searchSaving = search.lookupFields({
                    type: 'customrecord_dj_custpayment',
                    id: paymentId,
                    columns: ['custrecord_dj_custpayment_saving_s']
                });
                var saving2 = searchSaving.custrecord_dj_custpayment_saving_s;

                if (listInput.length != 0) {
                    var tranObj = {tranid:tranid,totalAjustAmount:totalAjustAmount,applied:(amountremaining-totalAjustAmount),diffList:listInput}
                    if (!me.isEmpty(saving2)) {
                        saving2 = JSON.parse(saving2);
                    } else {
                        saving2 = {};
                    }
                    saving2['tranid:'+tranid] = tranObj;

                    log.audit('saving2',saving2);

                    record.submitFields({
                        type: 'customrecord_dj_custpayment',
                        id: paymentId,
                        values: {
                            custrecord_dj_custpayment_saving_s: JSON.stringify(saving2),
                            custrecord_dj_custpayment_match: false,
                            custrecord_dj_custpayment_consumption: false,
                            custrecord_dj_custpayment_fee: false,
                            custrecord_dj_custpayment_saving_t: null,
                            custrecord_dj_custpayment_saving_a: null
                        }
                    });


                } else {
                    record.submitFields({
                        type: 'customrecord_dj_custpayment',
                        id: paymentId,
                        values: {
                            custrecord_dj_custpayment_saving_s: null,
                            custrecord_dj_custpayment_match: false,
                            custrecord_dj_custpayment_consumption: false,
                            custrecord_dj_custpayment_fee: false,
                            custrecord_dj_custpayment_saving_t: null,
                            custrecord_dj_custpayment_saving_a: null
                        }
                    });
                }
                var client = serverRequest.parameters.custpage_customer;
                var lookup = search.lookupFields({
                    type:'customer',
                    id:client,
                    columns: [
                        "companyname"
                    ]
                })
                var clientName = lookup.companyname;
                var head_id = serverRequest.parameters.custpage_custpayment_m_id;
                var paymentamo = serverRequest.parameters.custpage_paymentamo;
                var subsidiary = serverRequest.parameters.custpage_subsidiary;


                var from = serverRequest.parameters.custpage_date_from;
                var to = serverRequest.parameters.custpage_date_to;

                redirect.toSuitelet({
                    scriptId: 'customscript_dj_sl_pay_adjustment_before',
                    deploymentId: 'customdeploy_dj_sl_pay_adjustment_before',
                    parameters: {
                        'custrecord_custpayment_m_id': head_id,
                        'custrecord_custpayment_id': paymentId,
                        'client': client,
                        'clientName': clientName,
                        'paymentamo': paymentamo,
                        'subsidiary': subsidiary,
                        'from' : from,
                        'to' : to
                    }
                });
            } catch (e) {
                log.error('doPost ' + e.name, e.message);
            }
        }



        function getNowDateJP() {
            var stNow = new Date();
            stNow.setMilliseconds((3600000 * 9));
            var stYear = stNow.getUTCFullYear();
            var stMonth = stNow.getUTCMonth();
            var stDate = stNow.getUTCDate();
            stNow = new Date(stYear, stMonth, stDate);
            return stNow;
        }

        function isEmpty(stValue) {
            if ((stValue == null) || (stValue == '') || (stValue == undefined)) {
                return true;
            } else {
                return false;
            }
        }

        /**
         *çáåvÇì¸ã‡ä«óùï[Åuì¸ã‡äzÅvÇ…ÉZÉbÉg
         * @param paymentListDetailId
         * @param payment_summary
         */
        function setPaymentAmount(paymentListDetailId, payment_summary) {
            var id = record.submitFields({
                type: 'customrecord_dj_custpayment',
                id: paymentListDetailId,
                values: {
                    custrecord_dj_custpayment_paymentamo: payment_summary
                }
            });
        }

        /**
         * 123,456,789 -> 123456789
         * @param stringNumber
         * @returns {number | *}
         */
        function getInt(stringNumber) {
            stringNumber = stringNumber.split(",");
            var stringtotal = '';
            stringNumber.forEach(function (item, index) {
                stringtotal = stringtotal + item;
            });
            stringNumber = parseInt(stringtotal);
            return stringNumber;
        }

        function getTaxCode() {
            var mysearch = search.create({
                type: 'taxgroup',
                columns: [{
                    name: 'itemid'
                }]
            });
            var resultSet = mysearch.run();
            var results = resultSet.getRange({
                start: 0,
                end: 1000
            });
            return (results);
        }

        return {
            onRequest: onRequest
        };
    })
;