/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 * 入金管理の編集、誤差調整金額画面
 *
 *
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/search', 'N/ui/message', 'N/record', 'N/format', 'N/url', 'me'],

    function (dialog, currentRecord, search, message, record, format, url, me) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {


        }


        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.line - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var line = scriptContext.line;
            var custrecord_custpayment_m_id = currentRecord.getValue({
                fieldId: 'custpage_head_id'
            });
            var custrecord_custpayment_id = currentRecord.getValue({
                fieldId: 'custpage_payment_id'
            });
            var client = currentRecord.getValue({
                fieldId: 'custpage_customer'
            });
            var clientName = currentRecord.getText({
                fieldId: 'custpage_customer'
            });
            var paymentamo = currentRecord.getValue({
                fieldId: 'custpage_total_payment'
            });
            var subsidiary = currentRecord.getValue({
                fieldId: 'custpage_subsidiary'
            });


            // 期日
            if (scriptContext.fieldId === 'custpage_date_from' || scriptContext.fieldId === 'custpage_date_to') {
                var from = currentRecord.getText({
                    fieldId: 'custpage_date_from'
                });
                var to = currentRecord.getText({
                    fieldId: 'custpage_date_to'
                });

                var output = url.resolveScript({
                    scriptId: 'customscript_dj_sl_pay_adjustment_before',
                    deploymentId: 'customdeploy_dj_sl_pay_adjustment_before',
                    returnExternalUrl: false,
                    params: {
                        'custrecord_custpayment_m_id': custrecord_custpayment_m_id,
                        'custrecord_custpayment_id': custrecord_custpayment_id,
                        'client': client,
                        'paymentamo': paymentamo,
                        'from': from,
                        'to': to,
                        'subsidiary': subsidiary,
                        'clientName': clientName.substring(clientName.indexOf(" ")+1),
                    }
                });

                window.location.href = output;
            }
            // 適用額
            if (scriptContext.fieldId === 'custpage_sub_list_4') {
                var numLines = currentRecord.getLineCount({
                    sublistId: 'custpage_invoice_sub_list'
                });
                var totalApplied = 0;
                for (var i=0;i<numLines;i++){
                    var appliedTmp = currentRecord.getSublistValue({
                        sublistId: 'custpage_invoice_sub_list',
                        fieldId: 'custpage_sub_list_4',
                        line: i
                    });
                    if (line == i) {
                        continue;
                    }
                    if (!me.isEmpty(appliedTmp)) {
                        totalApplied += parseInt(appliedTmp);
                    }
                }
                // if (paymentamo < totalApplied) {
                //     alert('入力した適用額'+totalApplied+'は入金合計額'+paymentamo+'より大きくできません。');
                //     return false;
                // }
                var amountremaining = currentRecord.getSublistValue({
                    sublistId : 'custpage_invoice_sub_list',
                    fieldId: 'custpage_sub_list_3',
                    line: line
                });
                var inputAmount = currentRecord.getSublistValue({
                    sublistId : 'custpage_invoice_sub_list',
                    fieldId: 'custpage_sub_list_4',
                    line: line
                });
                var notAdjustAmount = currentRecord.getSublistValue({
                    sublistId : 'custpage_invoice_sub_list',
                    fieldId: 'custpage_sub_list_5',
                    line: line
                });
                var adjustAmount = currentRecord.getSublistValue({
                    sublistId : 'custpage_invoice_sub_list',
                    fieldId: 'custpage_sub_list_6',
                    line: line
                });

                var tranid = currentRecord.getSublistValue({
                    sublistId:'custpage_invoice_sub_list',
                    fieldId: 'custpage_tranid',
                    line:line
                });

                if (!notAdjustAmount) {
                    notAdjustAmount = 0;
                }
                if (!adjustAmount) {
                    adjustAmount = 0;
                }

                if (inputAmount >= (paymentamo - totalApplied)) {

                    if ((paymentamo - totalApplied) >= (amountremaining - adjustAmount)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId : 'custpage_invoice_sub_list',
                            fieldId: 'custpage_sub_list_4',
                            value : amountremaining - adjustAmount,
                            ignoreFieldChange:true

                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId : 'custpage_invoice_sub_list',
                            fieldId: 'custpage_sub_list_5',
                            value : '',
                            ignoreFieldChange:true

                        });
                    } else {
                        currentRecord.setCurrentSublistValue({
                            sublistId : 'custpage_invoice_sub_list',
                            fieldId: 'custpage_sub_list_4',
                            value : paymentamo - totalApplied,
                            ignoreFieldChange:true

                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId : 'custpage_invoice_sub_list',
                            fieldId: 'custpage_sub_list_5',
                            value : '',
                            ignoreFieldChange:true

                        });
                    }
                } else if (inputAmount >= (amountremaining - adjustAmount)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId : 'custpage_invoice_sub_list',
                        fieldId: 'custpage_sub_list_4',
                        value : amountremaining - adjustAmount,
                        ignoreFieldChange:true

                    });
                    currentRecord.setCurrentSublistValue({
                        sublistId : 'custpage_invoice_sub_list',
                        fieldId: 'custpage_sub_list_5',
                        value : '',
                        ignoreFieldChange:true

                    });
                } else {
                    currentRecord.setCurrentSublistValue({
                        sublistId : 'custpage_invoice_sub_list',
                        fieldId: 'custpage_sub_list_5',
                        value : amountremaining - inputAmount - adjustAmount,
                        ignoreFieldChange:true

                    });
                }

                var searchSaving = search.lookupFields({
                    type: 'customrecord_dj_custpayment',
                    id: custrecord_custpayment_id,
                    columns: ['custrecord_dj_custpayment_saving_s']
                });
                var saving2 = searchSaving.custrecord_dj_custpayment_saving_s;
                var tranObj = {};
                var applied = currentRecord.getCurrentSublistValue({
                    sublistId : 'custpage_invoice_sub_list',
                    fieldId: 'custpage_sub_list_4',
                    line: line

                });
                if (!me.isEmpty(saving2)) {
                    saving2 = JSON.parse(saving2);
                    tranObj = saving2['tranid:'+tranid];
                } else {
                    saving2 = {};
                    tranObj = {tranid:tranid,applied:applied,totalAjustAmount:0,diffList:[]}
                }
                saving2['tranid:'+tranid] = tranObj;
                log.audit('saving2',saving2);

                record.submitFields({
                    type: 'customrecord_dj_custpayment',
                    id: custrecord_custpayment_id,
                    values: {
                        custrecord_dj_custpayment_saving_s: JSON.stringify(saving2),
                    }
                });
                currentRecord.commitLine({
                    sublistId : 'custpage_invoice_sub_list',
                })


                var totalPayment = currentRecord.getValue({
                    fieldId: 'custpage_total_payment'
                });
                totalApplied = 0;
                for (var i=0;i<numLines;i++){
                    var appliedTmp = currentRecord.getSublistValue({
                        sublistId: 'custpage_invoice_sub_list',
                        fieldId: 'custpage_sub_list_4',
                        line: i
                    });
                    if (!me.isEmpty(appliedTmp)) {
                        totalApplied += parseInt(appliedTmp);
                    }
                }
                currentRecord.setValue({
                    fieldId: 'custpage_payment_apply_diff',
                    value : Math.abs(parseInt(totalPayment, 10) - parseInt(totalApplied,10)),
                    ignoreFieldChange:true

                });




            }

            return true;
        }

        function saveRecord(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var numLines = currentRecord.getLineCount({
                sublistId: 'custpage_invoice_sub_list'
            });
            for (i = 0; i < numLines; i++) {
                //check
                var check = currentRecord.getSublistValue({
                    sublistId: 'custpage_invoice_sub_list',
                    fieldId: 'custpage_sub_list_check',
                    line: i
                });
                var checkHidden = currentRecord.getSublistValue({
                    sublistId: 'custpage_invoice_sub_list',
                    fieldId: 'custpage_sub_list_check_hidden',
                    line: i
                });

                if (check != checkHidden) {
                    alert('再計算してください。')
                    return false;
                }
            }
            return true;
        }

        function btnReturnButton() {
            window.history.go(-1);
        }

        function btnRecalculationButton() {
            var numLines = currentRecord.get().getLineCount({
                sublistId: 'custpage_invoice_sub_list'
            });
            var listSelectedInvoice = [];
            for (i = 0; i < numLines; i++) {
                var check = currentRecord.get().getSublistValue({
                    sublistId: 'custpage_invoice_sub_list',
                    fieldId: 'custpage_sub_list_check',
                    line: i
                });
                if (check) {
                    check = 'T';
                } else {
                    check = 'F';
                }
                //invoice id
                var id = currentRecord.get().getSublistValue({
                    sublistId: 'custpage_invoice_sub_list',
                    fieldId: 'custpage_id',
                    line: i
                });
                //適用額
                var applied = currentRecord.get().getSublistValue({
                    sublistId: 'custpage_invoice_sub_list',
                    fieldId: 'custpage_sub_list_4',
                    line: i
                });
                // 調整額
                var adjustment = currentRecord.get().getSublistValue({
                    sublistId: 'custpage_invoice_sub_list',
                    fieldId: 'custpage_sub_list_6',
                    line: i
                });

                // store json of row
                var jsonSave = {
                    "id": id,
                    "check": check,
                    "applied": applied,
                    "adjustment": adjustment
                };
                listSelectedInvoice.push(jsonSave);

            }
            var payment_id = currentRecord.get().getValue({
                fieldId: 'custpage_payment_id'
            });

            var searchSaving = search.lookupFields({
                type: 'customrecord_dj_custpayment',
                id: payment_id,
                columns: ['custrecord_dj_custpayment_saving']
            });
            var saving = searchSaving.custrecord_dj_custpayment_saving;

            debugger
            if (listSelectedInvoice.length != 0) {
                if (!me.isEmpty(saving)) {
                    saving = JSON.parse(saving);
                    if (me.isEmpty(saving)) {
                        saving = {}
                    }
                    saving.invoice = listSelectedInvoice;
                } else
                    saving = {"invoice": listSelectedInvoice};
            }
            saving.from = currentRecord.get().getText({
                fieldId: 'custpage_date_from'
            });
            saving.to = currentRecord.get().getText({
                fieldId: 'custpage_date_to'
            });

            record.submitFields({
                type: 'customrecord_dj_custpayment',
                id: payment_id,
                values: {
                    custrecord_dj_custpayment_saving: JSON.stringify(saving)
                }
            });

            window.location.reload();
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            /*postSourcing: postSourcing,
            sublistChanged: sublistChanged,
            lineInit: lineInit,
            validateField: validateField,
            validateLine: validateLine,
            validateInsert: validateInsert,
            validateDelete: validateDelete,*/
            saveRecord: saveRecord,
            btnReturnButton: btnReturnButton,
            btnRecalculationButton: btnRecalculationButton
        };

    });


/**
 * 改ページ
 */
function goPaymentAdjustmentDiff(line) {

    require(['N/currentRecord', 'N/url'], function(currentRecord, url) {


        var headId = currentRecord.get().getValue({
            fieldId: 'custpage_head_id'
        });
        var paymentId = currentRecord.get().getValue({
            fieldId: 'custpage_payment_id'
        });

        var subsidiary = currentRecord.get().getValue({
            fieldId: 'custpage_subsidiary'
        });

        var client = currentRecord.get().getValue({
            fieldId: 'custpage_customer'
        });
        var clientName = currentRecord.get().getText({
            fieldId: 'custpage_customer'
        });

        var from = currentRecord.get().getText({
            fieldId: 'custpage_date_from'
        });
        var to = currentRecord.get().getText({
            fieldId: 'custpage_date_to'
        });

        var paymentamo = currentRecord.get().getValue({
            fieldId: 'custpage_total_payment'
        });
        var amountremaining = currentRecord.get().getSublistValue({
            sublistId:'custpage_invoice_sub_list',
            fieldId: 'custpage_sub_list_3',
            line:line
        });
        var applied = currentRecord.get().getSublistValue({
            sublistId:'custpage_invoice_sub_list',
            fieldId: 'custpage_sub_list_4',
            line:line
        });

        var tranid = currentRecord.get().getSublistValue({
            sublistId:'custpage_invoice_sub_list',
            fieldId: 'custpage_tranid',
            line:line
        });

        var numLines = currentRecord.get().getLineCount({
            sublistId: 'custpage_invoice_sub_list'
        });

        var totalAmountLeft = 0;
        for (var i = 0; i < numLines; i++) {
            var amountLeft = currentRecord.get().getSublistValue({
                sublistId: 'custpage_invoice_sub_list',
                fieldId: 'custpage_sub_list_5',
                line: i
            });
            if ((amountLeft != null) && (amountLeft != '') && (amountLeft != undefined)) {
                totalAmountLeft += parseInt(amountLeft, 10);
            }

        }

        //調整
        var output = url.resolveScript({
            scriptId: 'customscript_dj_sl_pay_adjustment_diff',
            deploymentId: 'customdeploy_dj_sl_pay_adjustment_diff',
            returnExternalUrl: false,
            params: {

                'custrecord_custpayment_m_id': headId,
                'custrecord_custpayment_id': paymentId,
                'tranid': tranid,
                'client': client,
                'clientName': clientName.substring(clientName.indexOf(" ")+1),
                'adjustment': totalAmountLeft,
                'subsidiary': subsidiary,
                'paymentamo': paymentamo,
                'amountremaining': amountremaining,
                'applied': applied,
                'from': from,
                'to': to,
            }
        });

        window.location.href = output;

    });
}