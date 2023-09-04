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
                // ì¸ã‡ä«óùï[id
                paramObj.custpayment_m_id = context.request.parameters.custrecord_custpayment_m_id;
                // ì¸ã‡ÉfÅ[É^id
                paramObj.id = context.request.parameters.custrecord_custpayment_id;
                // å⁄ãq
                paramObj.client = context.request.parameters.client;
                // å⁄ãqñº
                paramObj.clientName = context.request.parameters.clientName;
                // ì¸ã‡
                paramObj.paymentamo = context.request.parameters.paymentamo;


                paramObj.from = context.request.parameters.from;
                paramObj.to = context.request.parameters.to;

                // ÉtÉHÅ[ÉÄíËã`
                var form = serverWidget.createForm({
                    title: 'ì¸ã‡ï[ç∑äzí≤êÆ'
                });
                form.clientScriptModulePath = '../Client/dj_cs_payment_adjustment_before.js';
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
            log.audit('buildForm options', options);
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
                //cancel button
                form.addButton({
                    id: 'recalculationButton',
                    label: 'çƒåvéZ',
                    functionName: 'btnRecalculationButton();'
                });
                //head_id
                var head_id = form.addField({
                    id: 'custpage_head_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                head_id.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                head_id.defaultValue = options.custpayment_m_id;
                //payment_id
                var payment_id = form.addField({
                    id: 'custpage_payment_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                payment_id.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                payment_id.defaultValue = options.id;

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

                //ä˙ì˙
                var dateFrom = form.addField({
                    id: 'custpage_date_from',
                    label: 'ä˙ì˙(FROM)',
                    type: serverWidget.FieldType.DATE
                });
                if (!me.isEmpty(options.from)) {
                    dateFrom.defaultValue = options.from;
                }
                dateFrom.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.STARTROW
                });
                var dateTo = form.addField({
                    id: 'custpage_date_to',
                    label: 'TO',
                    type: serverWidget.FieldType.DATE
                });
                if (!me.isEmpty(options.to)) {
                    dateTo.defaultValue = options.to;
                }
                dateTo.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.ENDROW
                });


                //êøãÅçáåv
                var total_text = form.addField({
                    id: 'custpage_total_request',
                    label: 'êøãÅçáåv',
                    type: serverWidget.FieldType.CURRENCY
                });

                total_text.defaultValue = 0;
                total_text.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                total_text.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.STARTROW
                });

                //ì¸ã‡çáåv
                var total_payment = form.addField({
                    id: 'custpage_total_payment',
                    label: 'ì¸ã‡çáåv',
                    type: serverWidget.FieldType.CURRENCY
                });
                total_payment.defaultValue = options.paymentamo;
                total_payment.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                total_payment.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.ENDROW
                });

                //í≤êÆäz
                var adjustment_amount = form.addField({
                    id: 'custpage_adjustment_amount',
                    label: 'í≤êÆäz',
                    type: serverWidget.FieldType.CURRENCY
                });
                adjustment_amount.defaultValue = 0;
                adjustment_amount.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                adjustment_amount.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.STARTROW
                });

                //ì¸ã‡çáåvÇ∆ìKópäzçáåvÇÃç∑äz
                var payment_apply_diff = form.addField({
                    id: 'custpage_payment_apply_diff',
                    label: 'ì¸ã‡çáåvÇ∆ìKópäzçáåvÇÃç∑äz',
                    type: serverWidget.FieldType.CURRENCY
                });
                payment_apply_diff.defaultValue = 0;
                payment_apply_diff.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                payment_apply_diff.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.ENDROW
                });


            } catch (e) {
                log.error('buildForm: ' + e.name, e.message);
            }
        }

        function buildSublist(form) {
            log.audit('buildSublist start');
            try {
                var subtab = form.addSubtab({
                    id: 'custpage_subtab',
                    label: 'êøãÅèëàÍóó'
                });

                var invoiceSubList = form.addSublist({
                    id: 'custpage_invoice_sub_list',
                    type: serverWidget.SublistType.LIST,
                    label: 'êøãÅèëàÍóó',
                    tab: 'custpage_subtab'
                });

                // É`ÉFÉbÉN
                var sub_list_check = invoiceSubList.addField({
                    id: 'custpage_sub_list_check',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'ëIë'
                });
                sub_list_check.label = '';
                // for check whether the çƒåvéZ button is clicked
                var sub_list_check_hidden = invoiceSubList.addField({
                    id: 'custpage_sub_list_check_hidden',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'ëIë'
                });
                sub_list_check_hidden.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                invoiceSubList.addField({
                    id: 'custpage_tranid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'êøãÅî‘çÜ'
                });

                invoiceSubList.addField({
                    id: 'custpage_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                invoiceSubList.addField({
                    id: 'custpage_sub_list_1',
                    type: serverWidget.FieldType.DATE,
                    label: 'ä˙ì˙'
                });
                invoiceSubList.addField({
                    id: 'custpage_sub_list_customer',
                    type: serverWidget.FieldType.TEXT,
                    label: 'å⁄ãqñº'
                });
                invoiceSubList.addField({
                    id: 'custpage_sub_list_djkk_hold_flg',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'êøãÅèëï€óØÉtÉâÉO'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                invoiceSubList.addField({
                    id: 'custpage_sub_list_2',
                    type: serverWidget.FieldType.TEXT,
                    label: 'ïîñÂ'
                });
                invoiceSubList.addField({
                    id: 'custpage_sub_list_3',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'êøãÅäz'
                });
                invoiceSubList.addField({
                    id: 'custpage_sub_list_4',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'ìKópäz'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                });
                invoiceSubList.addField({
                    id: 'custpage_adjustment',
                    type: serverWidget.FieldType.TEXT,
                    label: 'í≤êÆ'
                });
                invoiceSubList.addField({
                    id: 'custpage_sub_list_5',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'ñ¢í≤êÆ'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                invoiceSubList.addField({
                    id: 'custpage_sub_list_6',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'í≤êÆäz'
                });

                return invoiceSubList;
            } catch (e) {
                log.error('buildSublist: ' + e.name, e.message);
                return {};
            }
        }

        function fillSublist(invoiceSublist, paramObj, form) {
            try {
                log.audit('fillSubList paramObj', paramObj);
                var saving = getSaving(paramObj);
                log.audit('saving', saving);
                if (!me.isEmpty(saving)) {
                    saving = JSON.parse(saving);
                    if (me.isEmpty(paramObj.from)) {

                        paramObj.from = saving.from;
                    }
                    if (me.isEmpty(paramObj.to)) {

                        paramObj.to = saving.to;
                    }
                }

                var saving2 = getSaving2(paramObj);
                log.audit('saving2', saving2);
                if (!me.isEmpty(saving2)) {
                    saving2 = JSON.parse(saving2);
                }

                var saving3 = getSaving3(paramObj);
                log.audit('saving3', saving3);
                if (!me.isEmpty(saving3)) {
                    saving3 = JSON.parse(saving3);
                }

                var saving4 = getSaving4(paramObj);
                log.audit('saving4', saving4);
                if (!me.isEmpty(saving4)) {
                    saving4 = JSON.parse(saving4);
                }

                var invoiceList = lib.doGetInvDetail(paramObj);
                paramObj.tmpPaymentamo = paramObj.paymentamo;
                // êøãÅçáåv
                paramObj.totalAmountSelect = 0;
                // í≤êÆäzçáåv
                paramObj.totalAjustAmount = 0;
                // ñ¢í≤êÆçáåv
                paramObj.totalAmountLeft = 0;
                // ìKópäzçáåv
                paramObj.totalApplyAmount = 0;

                util.each(invoiceList, function (invoice, i) {
                    addSublistRow(form, invoiceSublist, invoice, paramObj, saving, saving2, saving3, saving4, i);
                });
                form.getField({
                    id: 'custpage_total_request',
                }).defaultValue = parseInt(paramObj.totalAmountSelect,10);
                form.getField({
                    id: 'custpage_adjustment_amount',
                }).defaultValue = parseInt(paramObj.totalAjustAmount, 10);
                form.getField({
                    id: 'custpage_payment_apply_diff',
                }).defaultValue = Math.abs(parseInt(paramObj.paymentamo, 10) - parseInt(paramObj.totalApplyAmount,10));
            } catch (e) {
                log.error('fillSublist: ' + e.name, e.message);
            }
        }

        function addSublistRow(form, invoiceSubList, invoice, paramObj, saving, saving2, saving3, saving4, i) {
            try {
                var checkFlg = 'F';
                var sameIdFlg = false;
                if (!me.isEmpty(saving.invoice)) {
                    for (var k=0;k<saving.invoice.length;k++){
                        if (saving.invoice[k].id == invoice.id) {
                            sameIdFlg = true;
                            checkFlg = saving.invoice[k].check;
                            break;
                        }
                    }
                }
                //É`ÉFÉbÉN
                invoiceSubList.setSublistValue({
                    id: 'custpage_sub_list_check',
                    line: i,
                    value: checkFlg
                });
                invoiceSubList.setSublistValue({
                    id: 'custpage_sub_list_check_hidden',
                    line: i,
                    value: checkFlg
                });
                //êøãÅî‘çÜ
                invoiceSubList.setSublistValue({
                    id: 'custpage_tranid',
                    line: i,
                    value: invoice.tranid
                });
                //invoiceID
                invoiceSubList.setSublistValue({
                    id: 'custpage_id',
                    line: i,
                    value: invoice.id
                });
                // DJ_êøãÅèëï€óØÉtÉâÉO
                if (invoice.holdFlg) {

                    invoiceSubList.setSublistValue({
                        id: 'custpage_sub_list_djkk_hold_flg',
                        line: i,
                        value: 'T'
                    });
                }


                //ä˙ì˙
                if (!me.isEmpty(invoice.duedate)) {
                    invoiceSubList.setSublistValue({
                        id: 'custpage_sub_list_1',
                        line: i,
                        value: invoice.duedate
                    });
                }
                invoiceSubList.setSublistValue({
                    id: 'custpage_sub_list_customer',
                    line: i,
                    value: invoice.customerName
                });

                //ïîñÂ
                if (!me.isEmpty(invoice.department)) {
                    invoiceSubList.setSublistValue({
                        id: 'custpage_sub_list_2',
                        line: i,
                        value: invoice.department
                    });
                }
                //êøãÅäz
                invoiceSubList.setSublistValue({
                    id: 'custpage_sub_list_3',
                    line: i,
                    value: invoice.amountremaining
                });
                paramObj.totalAmountSelect += parseInt(invoice.amountremaining);
                if (paramObj.tmpPaymentamo == 0) {
                    //ìKópäz
                    invoiceSubList.setSublistValue({
                        id: 'custpage_sub_list_4',
                        line: i,
                        value: 0
                    });
                    invoiceSubList.setSublistValue({
                        id: 'custpage_sub_list_check',
                        line: i,
                        value: 'F'
                    });
                    invoiceSubList.setSublistValue({
                        id: 'custpage_sub_list_check_hidden',
                        line: i,
                        value: 'F'
                    });
                } else {
                    if (checkFlg == 'F' && sameIdFlg) {
                        return;
                    }
                    invoiceSubList.setSublistValue({
                        id: 'custpage_sub_list_check',
                        line: i,
                        value: 'T'
                    });
                    invoiceSubList.setSublistValue({
                        id: 'custpage_sub_list_check_hidden',
                        line: i,
                        value: 'T'
                    });

                    var totalAjustAmount = 0;
                    var applied = invoice.amountremaining;
                    log.debug("test-saving2",saving2);
                    if (!me.isEmpty(saving2) && !me.isEmpty(saving2['tranid:'+invoice.tranid])) {
                        totalAjustAmount = parseInt(saving2['tranid:'+invoice.tranid].totalAjustAmount, 10);
                        applied = parseInt(saving2['tranid:'+invoice.tranid].applied, 10);
                    }
                    log.debug("test-totalAjustAmount",totalAjustAmount);
                    log.debug("test-applied",applied);
                    log.debug("test-paramObj.tmpPaymentamo",paramObj.tmpPaymentamo);
                    if (paramObj.tmpPaymentamo - applied >= 0) {
                        log.debug("test-paramObj.tmpPaymentamo - applied >= 0",paramObj.tmpPaymentamo - applied >= 0);

                        paramObj.tmpPaymentamo = paramObj.tmpPaymentamo - applied;
                        log.debug("test-paramObj.tmpPaymentamo",paramObj.tmpPaymentamo);

                        //ìKópäz
                        invoiceSubList.setSublistValue({
                            id: 'custpage_sub_list_4',
                            line: i,
                            value: applied
                        });
                        paramObj.totalApplyAmount = parseInt(paramObj.totalApplyAmount, 10) + parseInt(applied, 10);
                        if (!me.isEmpty(saving2) && !me.isEmpty(saving2['tranid:'+invoice.tranid])) {
                            log.debug("test-invoice.amountremaining",invoice.amountremaining);
                            log.debug("test-applied",applied);
                            log.debug("test-totalAjustAmount",totalAjustAmount);
                            //ñ¢í≤êÆ
                            invoiceSubList.setSublistValue({
                                id: 'custpage_sub_list_5',
                                line: i,
                                value: invoice.amountremaining - applied - totalAjustAmount
                            });
                            //í≤êÆäz
                            invoiceSubList.setSublistValue({
                                id: 'custpage_sub_list_6',
                                line: i,
                                value: totalAjustAmount
                            });

                        } else {
                            log.debug("test-invoice.amountremaining",invoice.amountremaining);
                            log.debug("test-applied",applied);
                            log.debug("test-totalAjustAmount 0",'å≈íË0');
                            //ñ¢í≤êÆ
                            invoiceSubList.setSublistValue({
                                id: 'custpage_sub_list_5',
                                line: i,
                                value: invoice.amountremaining - applied
                            });
                            //í≤êÆäz
                            invoiceSubList.setSublistValue({
                                id: 'custpage_sub_list_6',
                                line: i,
                                value: 0
                            });
                        }
                    }  else {
                        log.debug("test-paramObj.tmpPaymentamo - applied >= 0",paramObj.tmpPaymentamo - applied > 0);
                        var subList4 = paramObj.tmpPaymentamo;
                        var subList5 = invoice.amountremaining - paramObj.tmpPaymentamo;
                        var subList6 = 0;
                        log.debug("test-invoice.amountremaining",invoice.amountremaining);
                        log.debug("test-paramObj.tmpPaymentamo",paramObj.tmpPaymentamo);
                        log.debug("test-subList4",subList4);
                        log.debug("test-subList5",subList5);
                        log.debug("test-subList6",subList6);
                        if (!me.isEmpty(saving2) && !me.isEmpty(saving2['tranid:'+invoice.tranid])) {
                            subList4 = parseInt(saving2['tranid:'+invoice.tranid].applied);
                            subList5 = parseInt(saving2['tranid:'+invoice.tranid].applied) - totalAjustAmount;
                            subList6 = totalAjustAmount;
                            log.debug("test-saving2 subList4",subList4);
                            log.debug("test-saving2 subList5",subList5);
                            log.debug("test-saving2 subList6",subList6);
                        }
                        if (!me.isEmpty(saving3) || !me.isEmpty(saving4)) {
                            if (!me.isEmpty(saving3)) {
                                totalAjustAmount += saving3.amount;
                            }
                            if (!me.isEmpty(saving4)) {
                                totalAjustAmount += saving4.amount;
                            }
                            subList4 = parseInt(subList4);
                            subList5 -= totalAjustAmount;
                            subList6 = totalAjustAmount;
                            log.debug("test-saving34 subList4",subList4);
                            log.debug("test-saving34 subList5",subList5);
                            log.debug("test-saving34 subList6",subList6);
                        }

                        //ìKópäz
                        invoiceSubList.setSublistValue({
                            id: 'custpage_sub_list_4',
                            line: i,
                            value: subList4
                        });
                        paramObj.totalApplyAmount = parseInt(paramObj.totalApplyAmount, 10) + parseInt(subList4, 10);
                        //ñ¢í≤êÆ
                        invoiceSubList.setSublistValue({
                            id: 'custpage_sub_list_5',
                            line: i,
                            value: subList5
                        });
                        //í≤êÆäz
                        invoiceSubList.setSublistValue({
                            id: 'custpage_sub_list_6',
                            line: i,
                            value: subList6
                        });
                        log.debug("test-paramObj.totalAmountLeft",paramObj.totalAmountLeft);
                        log.debug("test-subList5",subList5);
                        paramObj.totalAmountLeft += subList5;
                        log.debug("test-paramObj.tmpPaymentamo",paramObj.tmpPaymentamo);
                        paramObj.tmpPaymentamo = 0;
                    }
                    paramObj.totalAjustAmount += parseInt(totalAjustAmount);

                    //í≤êÆ
                    var adjustlink = '<a href="javascript:void(0)" onclick="goPaymentAdjustmentDiff('+i+');">í≤êÆ</a>';
                    invoiceSubList.setSublistValue({
                        id: 'custpage_adjustment',
                        line: i,
                        value: adjustlink
                    });
                }


            }
            catch (e) {
                log.error('addSublistRow: ' + e.name, e.message);
            }
        }

        function getSaving(paramObj) {
            var searchSaving = search.lookupFields({
                type: 'customrecord_custpayment',
                id: paramObj.id,
                columns: ['custrecord_dj_custpayment_saving']
            });

            return searchSaving.custrecord_dj_custpayment_saving;

        }

        function getSaving2(paramObj) {
            var searchSaving = search.lookupFields({
                type: 'customrecord_custpayment',
                id: paramObj.id,
                columns: ['custrecord_dj_custpayment_saving_s']
            });

            return searchSaving.custrecord_dj_custpayment_saving_s;

        }

        function getSaving3(paramObj) {
            var searchSaving = search.lookupFields({
                type: 'customrecord_custpayment',
                id: paramObj.id,
                columns: ['custrecord_dj_custpayment_saving_t']
            });

            return searchSaving.custrecord_dj_custpayment_saving_t;

        }

        function getSaving4(paramObj) {
            var searchSaving = search.lookupFields({
                type: 'customrecord_custpayment',
                id: paramObj.id,
                columns: ['custrecord_dj_custpayment_saving_a']
            });

            return searchSaving.custrecord_dj_custpayment_saving_a;

        }

        function doPost(context) {
            try {
                var serverRequest = context.request;
                var lines = serverRequest.getLineCount({group: "custpage_invoice_sub_list"});
                var listSelectedInvoice = [];
                //çáåvìKópäz
                var totalAppliedAmount = 0;
                //çáåví≤êÆäz
                var totalAdjustmentAmount = 0;
                for (var i = 0; i < lines; i++) {
                    //invoice id
                    var id = serverRequest.getSublistValue({
                        group: 'custpage_invoice_sub_list',
                        name: 'custpage_id',
                        line: i
                    });
                    //invoice tranid
                    var tranid = serverRequest.getSublistValue({
                        group: 'custpage_invoice_sub_list',
                        name: 'custpage_tranid',
                        line: i
                    });

                    //check
                    var check = serverRequest.getSublistValue({
                        group: 'custpage_invoice_sub_list',
                        name: 'custpage_sub_list_check',
                        line: i
                    });

                    //ìKópäz
                    var applied = serverRequest.getSublistValue({
                        group: 'custpage_invoice_sub_list',
                        name: 'custpage_sub_list_4',
                        line: i
                    });
                    if (!me.isEmpty(applied)) {
                        totalAppliedAmount += parseInt(applied, 10);
                    }
                    // í≤êÆäz
                    var adjustment = serverRequest.getSublistValue({
                        group: 'custpage_invoice_sub_list',
                        name: 'custpage_sub_list_6',
                        line: i
                    });
                    if (!me.isEmpty(adjustment)) {
                        totalAdjustmentAmount += parseInt(adjustment, 10);
                    }

                    // store json of row
                    var jsonSave = {
                        "id": id,
                        "tranid": tranid,
                        "check": check,
                        "applied": applied,
                        "adjustment": parseInt(adjustment,10)
                    };
                    listSelectedInvoice.push(jsonSave);
                }

                var payment_id = context.request.parameters.custpage_payment_id;

                var searchSaving = search.lookupFields({
                    type: 'customrecord_custpayment',
                    id: payment_id,
                    columns: ['custrecord_dj_custpayment_saving']
                });
                var saving = searchSaving.custrecord_dj_custpayment_saving;

                if (listSelectedInvoice.length != 0) {
                    if (!me.isEmpty(saving)) {
                        saving = JSON.parse(saving);
                        saving.invoice = listSelectedInvoice;
                    } else
                        saving = {"invoice": listSelectedInvoice};
                }
                saving.from = context.request.parameters.custpage_date_from;
                saving.to = context.request.parameters.custpage_date_to;
                //çáåvìKópäz
                saving.totalAppliedAmount = totalAppliedAmount;
                //çáåví≤êÆäz
                saving.totalAdjustmentAmount = totalAdjustmentAmount;

                var matchFlg = false;
                if (totalAppliedAmount == parseInt(serverRequest.parameters.custpage_total_payment,10)) {
                    matchFlg = true;
                }

                record.submitFields({
                    type: 'customrecord_custpayment',
                    id: payment_id,
                    values: {
                        custrecord_dj_custpayment_saving: JSON.stringify(saving),
                        custrecord_dj_custpayment_match: matchFlg,
                        custrecord_dj_custpayment_consumption: false,
                        custrecord_dj_custpayment_fee: false
                    }
                });

                var head_id = context.request.parameters.custpage_head_id;
                redirect.toSuitelet({
                    scriptId: 'customscript_sl_payment_management',
                    deploymentId: 'customdeploy_sl_payment_management',
                    parameters: {
                        'custscript_custpayment_head_id': head_id
                    }
                });
            } catch (e) {
                log.error('doPost ' + e.name, e.message);
            }
        }

        return {
            onRequest: onRequest
        };
    })
;