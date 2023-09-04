/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 * ì¸ã‡ä«óùï[
 *
 *
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/search', 'N/ui/message', 'N/record', 'N/format', 'N/url','me', 'lib', 'underscore'],

    function (dialog, currentRecord, search, message, record, format, url, me, lib, _) {

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
            var id = currentRecord.getValue({
                fieldId: 'custpage_head_id'
            });
            var line = scriptContext.line;
            var fieldId = scriptContext.fieldId;


            // å⁄ãq
            if (fieldId == 'custpage_sub_list_3') {
                // //payment_id
                // var paymentid = currentRecord.getSublistValue({
                //     sublistId: 'custpage_payment_sub_list',
                //     fieldId: 'custpage_id',
                //     line: line
                // });
                // //èú
                // var check = currentRecord.getSublistValue({
                //     sublistId: 'custpage_payment_sub_list',
                //     fieldId: 'custpage_sub_list_check',
                //     line: line
                // });
                // // å⁄ãq
                // var customerId = currentRecord.getSublistValue({
                //     sublistId: 'custpage_payment_sub_list',
                //     fieldId: 'custpage_sub_list_3',
                //     line: line
                // });
                // // å⁄ãqñº
                // var customerName = currentRecord.getSublistText({
                //     sublistId: 'custpage_payment_sub_list',
                //     fieldId: 'custpage_sub_list_3',
                //     line: line
                // });
                // //àÍív
                // var match = currentRecord.getSublistValue({
                //     sublistId: 'custpage_payment_sub_list',
                //     fieldId: 'custpage_sub_list_10',
                //     line: line
                // });
                // //è¡îÔê≈
                // var consumption = currentRecord.getSublistValue({
                //     sublistId: 'custpage_payment_sub_list',
                //     fieldId: 'custpage_sub_list_11',
                //     line: line
                // });
                // //éËêîóø
                // var fee = currentRecord.getSublistValue({
                //     sublistId: 'custpage_payment_sub_list',
                //     fieldId: 'custpage_sub_list_12',
                //     line: line
                // });
                // // éÊçûì˙
                // var paymentdate = currentRecord.getSublistValue({
                //     sublistId: 'custpage_payment_sub_list',
                //     fieldId: 'custpage_sub_list_4',
                //     line: line
                // });
                // var customerno = '';
                // var claimsum = 0;
                // if (customerId != '' && customerId != null) {
                //     customerName = customerName.substring(customerName.indexOf(" ")+1);
                //     var invoiceList = getInvoice();
                //     invoiceList.each(function (result) {
                //         var entity = result.getText(invoiceList.columns[0]);
                //         var amount = result.getValue(invoiceList.columns[1]);
                //         if (entity.search(new RegExp("(?:^|(\\s))"+customerName+"(?:$|\\s)")) > -1) {
                //             claimsum += parseInt(amount);
                //         }
                //         return true;
                //     });
                //     var customerRecord = record.load({
                //         type: 'customer',
                //         id: customerId
                //     });
                //     var entityid = customerRecord.getValue({fieldId: 'entityid'});
                //
                //     var lineNumber = currentRecord.selectLine({
                //         sublistId: "custpage_payment_sub_list",
                //         line: line
                //     });
                //     currentRecord.setCurrentSublistValue({
                //         sublistId: 'custpage_payment_sub_list',
                //         fieldId: 'custpage_sub_list_9',
                //         value: format.parse({value: claimsum, type: format.Type.INTEGER}),
                //         ignoreFieldChange: true
                //     });
                //     customerno = entityid.split(" ")[0];
                //     currentRecord.setCurrentSublistValue({
                //         "sublistId": "custpage_payment_sub_list",
                //         "fieldId": "custpage_sub_list_2",
                //         "value": customerno
                //     });
                //
                //     check = false;
                //     currentRecord.setCurrentSublistValue({
                //         sublistId: "custpage_payment_sub_list",
                //         fieldId: "custpage_sub_list_check",
                //         value: check
                //     });
                //
                //     currentRecord.commitLine({
                //         sublistId: "custpage_payment_sub_list"
                //     });
                // } else {
                //     var lineNumber = currentRecord.selectLine({
                //         "sublistId": "custpage_payment_sub_list",
                //         "line": line
                //     });
                //     currentRecord.setCurrentSublistValue({
                //         "sublistId": "custpage_payment_sub_list",
                //         "fieldId": "custpage_sub_list_9",
                //         "value": 0
                //     });
                //     currentRecord.setCurrentSublistValue({
                //         "sublistId": "custpage_payment_sub_list",
                //         "fieldId": "custpage_sub_list_2",
                //         "value": ''
                //     });
                //     currentRecord.commitLine({
                //         "sublistId": "custpage_payment_sub_list"
                //     });
                // }
                // var savingString = {
                //     'check': check,
                //     'client': customerId,
                //     'match': match,
                //     'consumption': consumption,
                //     'fee': fee,
                //     'paymentdate': paymentdate
                // };
                // record.submitFields({
                //     type: 'customrecord_dj_custpayment',
                //     id: paymentid,
                //     values: {
                //         custrecord_dj_custpayment_saving: JSON.stringify(savingString),
                //         custrecord_dj_custpayment_exclusion: check,
                //         custrecord_dj_custpayment_customerno: customerno,
                //         custrecord_dj_custpayment_client: customerId,
                //         custrecord_dj_custpayment_claimsum: format.parse({value: claimsum, type: format.Type.INTEGER})
                //     }
                // });


                var custPaymentManagementRecord  = record.load({
                    type : 'customrecord_dj_custpayment_management',
                    id : id,
                    isDynamic: true
                });
                // å⁄ãq
                var customerId = currentRecord.getSublistValue({
                    sublistId: 'custpage_payment_sub_list',
                    fieldId: 'custpage_sub_list_3',
                    line: line
                });
                // å⁄ãqñº
                var customerName = currentRecord.getSublistText({
                    sublistId: 'custpage_payment_sub_list',
                    fieldId: 'custpage_sub_list_3',
                    line: line
                });

                var difference = currentRecord.getValue({
                    fieldId: 'custpage_error_difference'
                });
                var taxCode = currentRecord.getValue({
                    fieldId: 'custpage_tax_code'
                });
                var feeItem = currentRecord.getValue({
                    fieldId: 'custpage_fee_account_item'
                });
                var dateFrom = currentRecord.getText({
                    fieldId: 'custpage_import_date_from'
                });
                var dateTo = currentRecord.getText({
                    fieldId: 'custpage_import_date_to'
                });
                var subsidiaryText = currentRecord.getText({
                    fieldId: 'custpage_custom_subsidiary_text'
                });

                var feeList = getFee();
                var setting = getSetting();
                var allInvoiceList = lib.doGetAllInvDetail();


                // ì¸ã‡ÉfÅ[É^ÇÕçƒåvéZÇ≥ÇÍÇƒÇ¢ÇÈ
                if (!me.isEmpty(customerId) ) {

                    // êøãÅèëÉäÉXÉg

                    customerName = customerName.substring(customerName.indexOf(" ")+1);
                    var invoiceList = [];
                    var claimsum = 0;
                    for (var j=0;j<allInvoiceList.length;j++){
                        if ((allInvoiceList[j].nameText+" ").indexOf(" "+customerName+" ") >= 0
                            && new RegExp(subsidiaryText + "$").test(allInvoiceList[j].subsidiary)) {
                            if (!me.isEmpty(dateFrom)
                                && !me.isEmpty(dateTo)
                                && allInvoiceList[j].duedate >= dateFrom
                                && allInvoiceList[j].duedate <= dateTo) {

                                invoiceList.push(allInvoiceList[j]);
                                claimsum += parseInt(allInvoiceList[j].amountremaining);
                            } else if(me.isEmpty(dateFrom)
                                && !me.isEmpty(dateTo)
                                && allInvoiceList[j].duedate <= dateTo){

                                invoiceList.push(allInvoiceList[j]);
                                claimsum += parseInt(allInvoiceList[j].amountremaining);
                            } else if(!me.isEmpty(dateFrom)
                                && me.isEmpty(dateTo)
                                && allInvoiceList[j].duedate >= dateFrom) {

                                invoiceList.push(allInvoiceList[j]);
                                claimsum += parseInt(allInvoiceList[j].amountremaining);
                            } else if(me.isEmpty(dateFrom)
                                && me.isEmpty(dateTo)) {

                                invoiceList.push(allInvoiceList[j]);
                                claimsum += parseInt(allInvoiceList[j].amountremaining);
                            }

                        }
                    }
                    // ì¸ã‡äz
                    var paymentamo = custPaymentManagementRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_paymentamo',
                        line: line
                    });
                    var savingFlg = false;
                    var diff = paymentamo - claimsum;

                    custPaymentManagementRecord.selectLine({

                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        line: line

                    })

                    // å⁄ãq
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_client',
                        value: customerId,
                        line: line
                    });

                    // ç¬å†çáåv
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_claimsum',
                        value: claimsum,
                        line: line
                    });
                    //Å@àÍív
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_match',
                        value: false,
                        line: line
                    });
                    // è¡îÔê≈
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_consumption',
                        value: false,
                        line: line
                    });
                    // éËêîóø
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_fee',
                        value: false,
                        line: line
                    });
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_saving',
                        value: null,
                        line: line
                    });
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_saving_a',
                        value: null,
                        line: line
                    });
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_saving_t',
                        value: null,
                        line: line
                    });

                    if (claimsum == paymentamo) {
                        custPaymentManagementRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_match',
                            value: true,
                            line: line
                        });

                        savingFlg = true;
                    } else if (Math.abs(diff) <= parseInt(difference,10)) {
                        custPaymentManagementRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_consumption',
                            value: true,
                            line: line
                        });

                        var acc = setting.minus;
                        if (diff > 0) {
                            acc = setting.plus;
                        }

                        var jsonSave3 = {
                            "account": acc,
                            "amount": Math.abs(diff),
                            "amountLeft": Math.abs(diff),
                            "taxitem": null,
                            "taxAmount": 0,
                            "totalAmount": Math.abs(diff)
                        };
                        custPaymentManagementRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_saving_t',
                            value: JSON.stringify(jsonSave3),
                            line: line
                        });

                        savingFlg = true;

                    } else {

                        // éËêîóø
                        var findObj = _.findWhere(feeList, {sum: Math.abs(diff), taxco: taxCode});

                        if (!_.isUndefined(findObj)) {//found
                            custPaymentManagementRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                fieldId: 'custrecord_dj_custpayment_fee',
                                value: true,
                                line: line
                            });

                            var jsonSave4 = {
                                "account": feeItem,
                                "amount": findObj.sum,
                                "amountLeft": findObj.base,
                                "taxitem": findObj.taxco,
                                "taxAmount": findObj.tax,
                                "totalAmount": findObj.sum
                            };

                            custPaymentManagementRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                fieldId: 'custrecord_dj_custpayment_saving_a',
                                value: JSON.stringify(jsonSave4),
                                line: line
                            });

                            savingFlg = true;

                        } else {
                            var errorCalc = Math.abs(Math.abs(paymentamo - claimsum) - parseInt(difference,10));

                            var findObj = _.findWhere(feeList, {sum: errorCalc, taxco: taxCode});
                            if (!_.isUndefined(findObj)) {//found
                                // è¡îÔê≈
                                custPaymentManagementRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_consumption',
                                    value: true,
                                    line: line
                                });
                                // éËêîóø
                                custPaymentManagementRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_fee',
                                    value: true,
                                    line: line
                                });
                                // éËêîóø
                                var jsonSave4 = {
                                    "account": feeItem,
                                    "amount": findObj.sum,
                                    "amountLeft": findObj.base,
                                    "taxitem": findObj.taxco,
                                    "taxAmount": findObj.tax,
                                    "totalAmount": findObj.sum
                                };

                                custPaymentManagementRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_saving_a',
                                    value: JSON.stringify(jsonSave4),
                                    line: line
                                });


                                // è¡îÔê≈
                                var jsonSave3 = {
                                    "account": setting.minus,
                                    "amount": parseInt(difference,10),
                                    "amountLeft": parseInt(difference,10),
                                    "taxitem": null,
                                    "taxAmount": 0,
                                    "totalAmount": parseInt(difference,10)
                                };
                                custPaymentManagementRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_saving_t',
                                    value: JSON.stringify(jsonSave3),
                                    line: line
                                });

                                savingFlg = true;

                            }
                        }
                    }

                    if (savingFlg) {
                        var saving = {};
                        var listSelectedInvoice = [];

                        for (var k=0;k<invoiceList.length;k++){

                            var invoice = invoiceList[k];
                            var adjustmentTmp = null;
                            if (k == invoiceList.length - 1) {
                                adjustmentTmp = Math.abs(paymentamo - claimsum);
                            }
                            var jsonSave = {
                                "id": invoice.id,
                                "check": 'T',
                                "applied": invoice.amountremaining,
                                "adjustment": adjustmentTmp
                            };
                            listSelectedInvoice.push(jsonSave);
                        }
                        saving.invoice = listSelectedInvoice;
                        //çáåvìKópäz
                        saving.from = "";
                        //çáåvìKópäz
                        saving.to = "";
                        //çáåvìKópäz
                        saving.totalAppliedAmount = claimsum;
                        //çáåví≤êÆäz
                        saving.totalAdjustmentAmount = Math.abs(paymentamo - claimsum);

                        if (paymentamo - claimsum > 0
                            && Math.abs(paymentamo - claimsum) <= parseInt(difference,10)) {
                            saving.totalAdjustmentAmountWithSign = paymentamo - claimsum;
                        }

                        custPaymentManagementRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_saving',
                            value: JSON.stringify(saving),
                            line: line
                        });
                    }

                    custPaymentManagementRecord.commitLine({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                    });

                }


                custPaymentManagementRecord.save({
                    enableSourcing : false,
                    ignoreMandatoryFields : true
                });
                var output = url.resolveScript({
                    scriptId: 'customscript_dj_sl_payment_management',
                    deploymentId: 'customdeploy_dj_sl_payment_management',
                    returnExternalUrl: false,
                    params: {
                        'custscript_custpayment_head_id': id
                    }
                });

                window.location.href = output;
            }

            if (fieldId == 'custpage_error_difference' || fieldId == 'custpage_tax_code') {

                // var custPaymentManagementRecord  = record.load({
                //     type : 'customrecord_dj_custpayment_management',
                //     id : id,
                //     isDynamic: true
                // });
                //
                // var difference = currentRecord.getValue({
                //     fieldId: 'custpage_error_difference'
                // });
                // var taxCode = currentRecord.getValue({
                //     fieldId: 'custpage_tax_code'
                // });
                // var feeItem = currentRecord.getValue({
                //     fieldId: 'custpage_fee_account_item'
                // });
                // var dateFrom = currentRecord.getValue({
                //     fieldId: 'custpage_import_date_from'
                // });
                // var dateTo = currentRecord.getValue({
                //     fieldId: 'custpage_import_date_to'
                // });
                // var numLines = custPaymentManagementRecord.getLineCount({
                //     sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                // });
                // var feeList = getFee();
                // var setting = getSetting();
                // var allInvoiceList = lib.doGetAllInvDetail();
                // for (var i=0;i<numLines;i++){
                //
                //     var client = custPaymentManagementRecord.getSublistText({
                //         sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //         fieldId: 'custrecord_dj_custpayment_client',
                //         line: i
                //     });
                //
                //     // îÒàÍívÇÃì¸ã‡ÉfÅ[É^ÇÕçƒåvéZÇ≥ÇÍÇƒÇ¢ÇÈ
                //     if (!me.isEmpty(client) ) {
                //
                //         var claimsum = custPaymentManagementRecord.getSublistValue({
                //             sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //             fieldId: 'custrecord_dj_custpayment_claimsum',
                //             line: i
                //         });
                //         var paymentamo = custPaymentManagementRecord.getSublistValue({
                //             sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //             fieldId: 'custrecord_dj_custpayment_paymentamo',
                //             line: i
                //         });
                //         var savingFlg = false;
                //         var diff = paymentamo - claimsum;
                //
                //         custPaymentManagementRecord.selectLine({
                //
                //             sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //             line: i
                //
                //         })
                //
                //         if (claimsum == paymentamo) {
                //             custPaymentManagementRecord.setCurrentSublistValue({
                //                 sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                 fieldId: 'custrecord_dj_custpayment_match',
                //                 value: true,
                //                 line: i
                //             });
                //         } else {
                //             custPaymentManagementRecord.setCurrentSublistValue({
                //                 sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                 fieldId: 'custrecord_dj_custpayment_match',
                //                 value: false,
                //                 line: i
                //             });
                //         }
                //
                //         if (Math.abs(diff) <= parseInt(difference,10)) {
                //             custPaymentManagementRecord.setCurrentSublistValue({
                //                 sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                 fieldId: 'custrecord_dj_custpayment_consumption',
                //                 value: true,
                //                 line: i
                //             });
                //
                //             var acc = setting.minus;
                //             if (diff > 0) {
                //                 acc = setting.plus;
                //             }
                //
                //             var jsonSave3 = {
                //                 "account": acc,
                //                 "amount": Math.abs(diff),
                //                 "amountLeft": Math.abs(diff),
                //                 "taxitem": null,
                //                 "taxAmount": 0,
                //                 "totalAmount": Math.abs(diff)
                //             };
                //             custPaymentManagementRecord.setCurrentSublistValue({
                //                 sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                 fieldId: 'custrecord_dj_custpayment_saving_t',
                //                 value: JSON.stringify(jsonSave3),
                //                 line: i
                //             });
                //
                //             savingFlg = true;
                //
                //         } else {
                //
                //             // éËêîóø
                //             var findObj = _.findWhere(feeList, {sum: Math.abs(diff), taxco: taxCode});
                //
                //             if (!_.isUndefined(findObj)) {//found
                //                 custPaymentManagementRecord.setCurrentSublistValue({
                //                     sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                     fieldId: 'custrecord_dj_custpayment_fee',
                //                     value: true,
                //                     line: i
                //                 });
                //
                //                 var jsonSave4 = {
                //                     "account": feeItem,
                //                     "amount": findObj.sum,
                //                     "amountLeft": findObj.base,
                //                     "taxitem": findObj.taxco,
                //                     "taxAmount": findObj.tax,
                //                     "totalAmount": findObj.sum
                //                 };
                //
                //                 custPaymentManagementRecord.setCurrentSublistValue({
                //                     sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                     fieldId: 'custrecord_dj_custpayment_saving_a',
                //                     value: JSON.stringify(jsonSave4),
                //                     line: i
                //                 });
                //
                //                 savingFlg = true;
                //
                //             } else {
                //                 var errorCalc = Math.abs(Math.abs(paymentamo - claimsum) - parseInt(difference,10));
                //
                //                 var findObj = _.findWhere(feeList, {sum: errorCalc, taxco: taxCode});
                //                 if (!_.isUndefined(findObj)) {//found
                //                     // è¡îÔê≈
                //                     custPaymentManagementRecord.setCurrentSublistValue({
                //                         sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                         fieldId: 'custrecord_dj_custpayment_consumption',
                //                         value: true,
                //                         line: i
                //                     });
                //                     // éËêîóø
                //                     custPaymentManagementRecord.setCurrentSublistValue({
                //                         sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                         fieldId: 'custrecord_dj_custpayment_fee',
                //                         value: true,
                //                         line: i
                //                     });
                //                     // éËêîóø
                //                     var jsonSave4 = {
                //                         "account": feeItem,
                //                         "amount": findObj.sum,
                //                         "amountLeft": findObj.base,
                //                         "taxitem": findObj.taxco,
                //                         "taxAmount": findObj.tax,
                //                         "totalAmount": findObj.sum
                //                     };
                //
                //                     custPaymentManagementRecord.setCurrentSublistValue({
                //                         sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                         fieldId: 'custrecord_dj_custpayment_saving_a',
                //                         value: JSON.stringify(jsonSave4),
                //                         line: i
                //                     });
                //
                //
                //                     // è¡îÔê≈
                //                     var jsonSave3 = {
                //                         "account": setting.minus,
                //                         "amount": parseInt(difference,10),
                //                         "amountLeft": parseInt(difference,10),
                //                         "taxitem": null,
                //                         "taxAmount": 0,
                //                         "totalAmount": parseInt(difference,10)
                //                     };
                //                     custPaymentManagementRecord.setCurrentSublistValue({
                //                         sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                         fieldId: 'custrecord_dj_custpayment_saving_t',
                //                         value: JSON.stringify(jsonSave3),
                //                         line: i
                //                     });
                //
                //                     savingFlg = true;
                //
                //                 } else {
                //
                //                     // è¡îÔê≈
                //                     custPaymentManagementRecord.setCurrentSublistValue({
                //                         sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                         fieldId: 'custrecord_dj_custpayment_consumption',
                //                         value: false,
                //                         line: i
                //                     });
                //                     // éËêîóø
                //                     custPaymentManagementRecord.setCurrentSublistValue({
                //                         sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                         fieldId: 'custrecord_dj_custpayment_fee',
                //                         value: false,
                //                         line: i
                //                     });
                //                     custPaymentManagementRecord.setCurrentSublistValue({
                //                         sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                         fieldId: 'custrecord_dj_custpayment_saving',
                //                         value: null,
                //                         line: i
                //                     });
                //                     custPaymentManagementRecord.setCurrentSublistValue({
                //                         sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                         fieldId: 'custrecord_dj_custpayment_saving_a',
                //                         value: null,
                //                         line: i
                //                     });
                //                     custPaymentManagementRecord.setCurrentSublistValue({
                //                         sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                         fieldId: 'custrecord_dj_custpayment_saving_t',
                //                         value: null,
                //                         line: i
                //                     });
                //
                //                 }
                //             }
                //         }
                //
                //         if (savingFlg) {
                //             var saving = {};
                //             var listSelectedInvoice = [];
                //
                //             // êøãÅèëÉäÉXÉg
                //
                //             var customerName = client.substring(client.indexOf(" ")+1);
                //             var invoiceList = [];
                //             for (var j=0;j<allInvoiceList.length;j++){
                //                 if (allInvoiceList[j].nameText.search(new RegExp("(?:^|(\\s))"+customerName+"(?:$|\\s)"))>= 0) {
                //                     if (!me.isEmpty(dateFrom)
                //                         && !me.isEmpty(dateTo)
                //                         && allInvoiceList[j].duedate >= dateFrom
                //                         && allInvoiceList[j].duedate <= dateTo) {
                //
                //                         invoiceList.push(allInvoiceList[j]);
                //                     } else if(me.isEmpty(dateFrom)
                //                         && !me.isEmpty(dateTo)
                //                         && allInvoiceList[j].duedate <= dateTo){
                //
                //                         invoiceList.push(allInvoiceList[j]);
                //                     } else if(!me.isEmpty(dateFrom)
                //                         && me.isEmpty(dateTo)
                //                         && allInvoiceList[j].duedate >= dateFrom) {
                //
                //                         invoiceList.push(allInvoiceList[j]);
                //                     } else if(me.isEmpty(dateFrom)
                //                         && me.isEmpty(dateTo)) {
                //
                //                         invoiceList.push(allInvoiceList[j]);
                //                     }
                //
                //                 }
                //             }
                //
                //             for (var k=0;k<invoiceList.length;k++){
                //
                //                 var invoice = invoiceList[k];
                //                 var adjustmentTmp = null;
                //                 if (k == invoiceList.length - 1) {
                //                     adjustmentTmp = Math.abs(paymentamo - claimsum);
                //                 }
                //                 var jsonSave = {
                //                     "id": invoice.id,
                //                     "check": 'T',
                //                     "applied": invoice.amountremaining,
                //                     "adjustment": adjustmentTmp
                //                 };
                //                 listSelectedInvoice.push(jsonSave);
                //             }
                //             saving.invoice = listSelectedInvoice;
                //             //çáåvìKópäz
                //             saving.from = "";
                //             //çáåvìKópäz
                //             saving.to = "";
                //             //çáåvìKópäz
                //             saving.totalAppliedAmount = claimsum;
                //             //çáåví≤êÆäz
                //             saving.totalAdjustmentAmount = Math.abs(paymentamo - claimsum);
                //
                //             if (paymentamo - claimsum > 0
                //                 && Math.abs(paymentamo - claimsum) <= parseInt(difference,10)) {
                //                 saving.totalAdjustmentAmountWithSign = paymentamo - claimsum;
                //             }
                //
                //             custPaymentManagementRecord.setCurrentSublistValue({
                //                 sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                //                 fieldId: 'custrecord_dj_custpayment_saving',
                //                 value: JSON.stringify(saving),
                //                 line: i
                //             });
                //         }
                //
                //         custPaymentManagementRecord.commitLine({
                //             sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                //         });
                //
                //     }
                //
                // }
                //
                // custPaymentManagementRecord.setValue({
                //     fieldId: 'custrecord_dj_custpayment_saving_taxco',
                //     value: taxCode,
                //     ignoreFieldChange : true
                // });
                // custPaymentManagementRecord.setValue({
                //     fieldId: 'custrecord_dj_custpayment_saving_error',
                //     value: difference,
                //     ignoreFieldChange : true
                // });
                //
                //
                //
                // custPaymentManagementRecord.save({
                //     enableSourcing : false,
                //     ignoreMandatoryFields : true
                // });
                //
                //
                // window.location.reload();

                refrashRecord(id);
                var output = url.resolveScript({
                    scriptId: 'customscript_dj_sl_payment_management',
                    deploymentId: 'customdeploy_dj_sl_payment_management',
                    returnExternalUrl: false,
                    params: {
                        'custscript_custpayment_head_id': id
                    }
                });

                window.location.href = output;
            }
        }

        function getSetting() {
            try {
                var columnsArr = [];
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_plus'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_minus'});

                var mysearch = search.create({
                    type: 'customrecord_dj_custpayment_setting',
                    columns: columnsArr
                });
                var resultSet = mysearch.run().getRange({start: 0, end: 1});
                var obj = {};
                util.each(resultSet, function (result) {
                    obj.plus = result.getValue({name: 'custrecord_dj_custpayment_setting_plus'});
                    obj.minus = result.getValue({name: 'custrecord_dj_custpayment_setting_minus'});
                })
                return obj;
            } catch (e) {
                log.error(' ' + e.name, e.message);
                return {};
            }
        }

        function getFee() {
            try {
                var mysearch = search.create({
                    type: 'customrecord_dj_custfee',
                    columns: [{
                        name: 'name'
                    }, {
                        name: 'custrecord_dj_custfee_sum'
                    }, {
                        name: 'custrecord_dj_custfee_base'
                    }, {
                        name: 'custrecord_dj_custfee_tax'
                    }, {
                        name: 'custrecord_dj_custfee_taxco'
                    }]
                });
                var resultSet = mysearch.run().getRange({start: 0, end: 100});
                var results = [];
                util.each(resultSet, function (result) {
                    var obj = {};
                    obj.id = result.id;
                    obj.name = result.getValue({name: 'name'});
                    obj.sum = parseInt(result.getValue({name: 'custrecord_dj_custfee_sum'}),10);
                    obj.base = parseInt(result.getValue({name: 'custrecord_dj_custfee_base'}),10);
                    obj.tax = parseInt(result.getValue({name: 'custrecord_dj_custfee_tax'}),10);
                    obj.taxco = result.getValue({name: 'custrecord_dj_custfee_taxco'});
                    results.push(obj);
                })
                return results;
            } catch (e) {
                log.error('getFee ' + e.name, e.message);
                return [];
            }
        }

        function getInvoice() {
            var mysearch = search.load({
                id: 'customsearch_dj_custpayment_invoice'
            });
            var resultSet = mysearch.run();
            return (resultSet);
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var numLines = currentRecord.getLineCount({
                sublistId: 'custpage_payment_sub_list'
            });
            // check double customer
            var listCustomer = [];
            for (i = 0; i < numLines; i++) {
                var check = currentRecord.getSublistValue({
                    sublistId: 'custpage_payment_sub_list',
                    fieldId: 'custpage_sub_list_check',
                    line: i
                });
                if (!check) {
                    //å⁄ãq
                    var customer = currentRecord.getSublistValue({
                        sublistId: 'custpage_payment_sub_list',
                        fieldId: 'custpage_sub_list_3',
                        line: i
                    });
                    if (me.isEmpty(customer)) {

                        continue;
                    }
                    if(_.contains(listCustomer, customer)){
                        alert('ï°êîå⁄ãqÇì¸ÇÍÇƒÇ¢Ç‹Ç∑ÅB')
                        return false;
                    } else {
                        listCustomer.push(customer);
                    }

                    // var tobeAmount = currentRecord.get().getSublistValue({
                    //     sublistId: 'custpage_payment_sub_list',
                    //     fieldId: 'custpage_sub_list_9',
                    //     line: i
                    // });
                    // if (me.isEmpty(tobeAmount) || parseInt(tobeAmount) == 0) {
                    //     alert(i+1 + 'çsñ⁄ÇÃç¬å†çáåvÇ™ë∂ç›ÇµÇ‹ÇπÇÒÅB');
                    //     return false;
                    // }
                }

            }
            return true;
        }

        function btnClearButton(stringParam) {
            var output = url.resolveRecord({
                recordType: 'customrecord_dj_custpayment_management',
                recordId: stringParam
            });
            window.open(output, "_self");
        }

        function btnSearchButton(recordId) {

            var okFlag = window.confirm('åüçıÇµÇ‹Ç∑Ç©ÅH\r\nèàóùÇ…ÇÕéûä‘Ç™Ç©Ç©ÇËÇ‹Ç∑');
            if (!okFlag) {
                return;
            }
            debugger;
            var custPaymentManagementRecord  = record.load({
                type : 'customrecord_dj_custpayment_management',
                id : recordId,
                isDynamic: true
            });

            var cRecord = currentRecord.get();

            var dateFrom = cRecord.getText({

                fieldId: 'custpage_import_date_from'
            });
            var dateFromValue = cRecord.getValue({

                fieldId: 'custpage_import_date_from'
            });
            var dateTo = cRecord.getText({

                fieldId: 'custpage_import_date_to'
            });
            var dateToValue = cRecord.getValue({

                fieldId: 'custpage_import_date_to'
            });

            var subsidiaryText = cRecord.getText({
                fieldId: 'custpage_custom_subsidiary_text'
            });

            var numLines = cRecord.getLineCount({
                sublistId: 'custpage_payment_sub_list'
            });

            for (var line=0;line<numLines;line++) {
                // å⁄ãq
                var customerId = cRecord.getSublistValue({
                    sublistId: 'custpage_payment_sub_list',
                    fieldId: 'custpage_sub_list_3',
                    line: line
                });
                // å⁄ãqñº
                var customerName = cRecord.getSublistText({
                    sublistId: 'custpage_payment_sub_list',
                    fieldId: 'custpage_sub_list_3',
                    line: line
                });
                var claimsum = 0;
                if (customerId) {

                    customerName = customerName.substring(customerName.indexOf(" ")+1);
                    var invoiceList = lib.doGetAllInvDetail();
                    for (var j=0;j<invoiceList.length;j++){
                        var result = invoiceList[j];
                        if ((result.nameText+" ").indexOf(" "+customerName+" ") >= 0
                            && new RegExp(subsidiaryText + "$").test(result.subsidiary)) {
                            if (!me.isEmpty(dateFrom)
                                && !me.isEmpty(dateTo)
                                && result.duedate >= dateFrom
                                && result.duedate <= dateTo) {

                                claimsum += parseInt(result.amountremaining);
                            } else if(me.isEmpty(dateFrom)
                                && !me.isEmpty(dateTo)
                                && result.duedate <= dateTo){

                                claimsum += parseInt(result.amountremaining);
                            } else if(!me.isEmpty(dateFrom)
                                && me.isEmpty(dateTo)
                                && result.duedate >= dateFrom) {

                                claimsum += parseInt(result.amountremaining);
                            } else if(me.isEmpty(dateFrom)
                                && me.isEmpty(dateTo)) {

                                claimsum += parseInt(result.amountremaining);
                            }
                        }

                    }

                    cRecord.selectLine({
                        sublistId: 'custpage_payment_sub_list',
                        line: line
                    })

                    cRecord.setCurrentSublistValue({
                        sublistId: 'custpage_payment_sub_list',
                        fieldId: 'custpage_sub_list_9',
                        value: claimsum,
                        line: line
                    });

                    cRecord.commitLine({
                        sublistId: 'custpage_payment_sub_list'
                    });

                    // custPaymentManagementRecord.setSublistValue({
                    //     sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    //     fieldId: 'custrecord_dj_custpayment_claimsum',
                    //     value: claimsum,
                    //     line: line
                    // });

                    custPaymentManagementRecord.selectLine({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        line: line

                    })
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_claimsum',
                        value: claimsum,
                        line: line
                    });
                    custPaymentManagementRecord.commitLine({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                    });
                }
            }

            custPaymentManagementRecord.setValue({
                fieldId: 'custrecord_dj_custpayment_date_from',
                value: dateFromValue,
            })
            custPaymentManagementRecord.setValue({
                fieldId: 'custrecord_dj_custpayment_date_to',
                value: dateToValue,
            })

            custPaymentManagementRecord.save({
                enableSourcing : false,
                ignoreMandatoryFields : true
            });

            refrashRecord(recordId);
            window.alert('åüçıäÆóπÇµÇ‹ÇµÇΩ');
            var output = url.resolveScript({
                scriptId: 'customscript_dj_sl_payment_management',
                deploymentId: 'customdeploy_dj_sl_payment_management',
                returnExternalUrl: false,
                params: {
                    'custscript_custpayment_head_id': recordId
                }
            });

            window.location.href = output;
        }

        function refrashRecord(recordId) {

            var cRecord = currentRecord.get();

            var custPaymentManagementRecord  = record.load({
                type : 'customrecord_dj_custpayment_management',
                id : recordId,
                isDynamic: true
            });

            var difference = cRecord.getValue({
                fieldId: 'custpage_error_difference'
            });
            var taxCode = cRecord.getValue({
                fieldId: 'custpage_tax_code'
            });
            var feeItem = cRecord.getValue({
                fieldId: 'custpage_fee_account_item'
            });
            var dateFrom = cRecord.getText({
                fieldId: 'custpage_import_date_from'
            });
            var dateTo = cRecord.getText({
                fieldId: 'custpage_import_date_to'
            });
            var numLines = custPaymentManagementRecord.getLineCount({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id'
            });
            var subsidiaryText = cRecord.getText({
                fieldId: 'custpage_custom_subsidiary_text'
            });

            var feeList = getFee();
            var setting = getSetting();
            var allInvoiceList = lib.doGetAllInvDetail();
            for (var i=0;i<numLines;i++){

                var client = custPaymentManagementRecord.getSublistText({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_client',
                    line: i
                });

                // ì¸ã‡ÉfÅ[É^ÇÕçƒåvéZÇ≥ÇÍÇƒÇ¢ÇÈ
                if (!me.isEmpty(client) ) {

                    var claimsum = custPaymentManagementRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_claimsum',
                        line: i
                    });
                    var paymentamo = custPaymentManagementRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_paymentamo',
                        line: i
                    });
                    var savingFlg = false;
                    var diff = paymentamo - claimsum;

                    custPaymentManagementRecord.selectLine({

                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        line: i

                    })

                    //Å@àÍív
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_match',
                        value: false,
                        line: i
                    });
                    // è¡îÔê≈
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_consumption',
                        value: false,
                        line: i
                    });
                    // éËêîóø
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_fee',
                        value: false,
                        line: i
                    });
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_saving',
                        value: null,
                        line: i
                    });
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_saving_a',
                        value: null,
                        line: i
                    });
                    custPaymentManagementRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_saving_t',
                        value: null,
                        line: i
                    });

                    if (claimsum == paymentamo) {
                        custPaymentManagementRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_match',
                            value: true,
                            line: i
                        });

                        savingFlg = true;
                    } else if (Math.abs(diff) <= parseInt(difference,10)) {
                        custPaymentManagementRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_consumption',
                            value: true,
                            line: i
                        });

                        var acc = setting.minus;
                        if (diff > 0) {
                            acc = setting.plus;
                        }

                        var jsonSave3 = {
                            "account": acc,
                            "amount": Math.abs(diff),
                            "amountLeft": Math.abs(diff),
                            "taxitem": null,
                            "taxAmount": 0,
                            "totalAmount": Math.abs(diff)
                        };
                        custPaymentManagementRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_saving_t',
                            value: JSON.stringify(jsonSave3),
                            line: i
                        });

                        savingFlg = true;

                    } else {

                        // éËêîóø
                        var findObj = _.findWhere(feeList, {sum: Math.abs(diff), taxco: taxCode});

                        if (!_.isUndefined(findObj)) {//found
                            custPaymentManagementRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                fieldId: 'custrecord_dj_custpayment_fee',
                                value: true,
                                line: i
                            });

                            var jsonSave4 = {
                                "account": feeItem,
                                "amount": findObj.sum,
                                "amountLeft": findObj.base,
                                "taxitem": findObj.taxco,
                                "taxAmount": findObj.tax,
                                "totalAmount": findObj.sum
                            };

                            custPaymentManagementRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                fieldId: 'custrecord_dj_custpayment_saving_a',
                                value: JSON.stringify(jsonSave4),
                                line: i
                            });

                            savingFlg = true;

                        } else {
                            var errorCalc = Math.abs(Math.abs(paymentamo - claimsum) - parseInt(difference,10));

                            var findObj = _.findWhere(feeList, {sum: errorCalc, taxco: taxCode});
                            if (!_.isUndefined(findObj)) {//found
                                // è¡îÔê≈
                                custPaymentManagementRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_consumption',
                                    value: true,
                                    line: i
                                });
                                // éËêîóø
                                custPaymentManagementRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_fee',
                                    value: true,
                                    line: i
                                });
                                // éËêîóø
                                var jsonSave4 = {
                                    "account": feeItem,
                                    "amount": findObj.sum,
                                    "amountLeft": findObj.base,
                                    "taxitem": findObj.taxco,
                                    "taxAmount": findObj.tax,
                                    "totalAmount": findObj.sum
                                };

                                custPaymentManagementRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_saving_a',
                                    value: JSON.stringify(jsonSave4),
                                    line: i
                                });


                                // è¡îÔê≈
                                var jsonSave3 = {
                                    "account": setting.minus,
                                    "amount": parseInt(difference,10),
                                    "amountLeft": parseInt(difference,10),
                                    "taxitem": null,
                                    "taxAmount": 0,
                                    "totalAmount": parseInt(difference,10)
                                };
                                custPaymentManagementRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_saving_t',
                                    value: JSON.stringify(jsonSave3),
                                    line: i
                                });

                                savingFlg = true;

                            }
                        }
                    }

                    if (savingFlg) {
                        var saving = {};
                        var listSelectedInvoice = [];

                        // êøãÅèëÉäÉXÉg

                        var customerName = client.substring(client.indexOf(" ")+1);
                        var invoiceList = [];
                        for (var j=0;j<allInvoiceList.length;j++){
                            if ((allInvoiceList[j].nameText+" ").indexOf(" "+customerName+" ") >= 0
                                && new RegExp(subsidiaryText + "$").test(allInvoiceList[j].subsidiary)) {
                                if (!me.isEmpty(dateFrom)
                                    && !me.isEmpty(dateTo)
                                    && allInvoiceList[j].duedate >= dateFrom
                                    && allInvoiceList[j].duedate <= dateTo) {

                                    invoiceList.push(allInvoiceList[j]);
                                } else if(me.isEmpty(dateFrom)
                                    && !me.isEmpty(dateTo)
                                    && allInvoiceList[j].duedate <= dateTo){

                                    invoiceList.push(allInvoiceList[j]);
                                } else if(!me.isEmpty(dateFrom)
                                    && me.isEmpty(dateTo)
                                    && allInvoiceList[j].duedate >= dateFrom) {

                                    invoiceList.push(allInvoiceList[j]);
                                } else if(me.isEmpty(dateFrom)
                                    && me.isEmpty(dateTo)) {

                                    invoiceList.push(allInvoiceList[j]);
                                }

                            }
                        }

                        for (var k=0;k<invoiceList.length;k++){

                            var invoice = invoiceList[k];
                            var adjustmentTmp = null;
                            if (k == invoiceList.length - 1) {
                                adjustmentTmp = Math.abs(paymentamo - claimsum);
                            }
                            var jsonSave = {
                                "id": invoice.id,
                                "check": 'T',
                                "applied": invoice.amountremaining,
                                "adjustment": adjustmentTmp
                            };
                            listSelectedInvoice.push(jsonSave);
                        }
                        saving.invoice = listSelectedInvoice;
                        //çáåvìKópäz
                        saving.from = "";
                        //çáåvìKópäz
                        saving.to = "";
                        //çáåvìKópäz
                        saving.totalAppliedAmount = claimsum;
                        //çáåví≤êÆäz
                        saving.totalAdjustmentAmount = Math.abs(paymentamo - claimsum);

                        if (paymentamo - claimsum > 0
                            && Math.abs(paymentamo - claimsum) <= parseInt(difference,10)) {
                            saving.totalAdjustmentAmountWithSign = paymentamo - claimsum;
                        }

                        custPaymentManagementRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_saving',
                            value: JSON.stringify(saving),
                            line: i
                        });
                    }

                    custPaymentManagementRecord.commitLine({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                    });

                }

            }

            custPaymentManagementRecord.setValue({
                fieldId: 'custrecord_dj_custpayment_saving_taxco',
                value: taxCode,
                ignoreFieldChange : true
            });
            custPaymentManagementRecord.setValue({
                fieldId: 'custrecord_dj_custpayment_saving_error',
                value: difference,
                ignoreFieldChange : true
            });



            custPaymentManagementRecord.save({
                enableSourcing : false,
                ignoreMandatoryFields : true
            });
        }

        function btnReturnButton() {
            window.history.go(-1);
        }

        function btnUpdateButton(recordId) {
            location.reload();
        }

        function btnExecuteButton(recordId) {

            record.submitFields({
                type: 'customrecord_dj_custpayment_management',
                id: recordId,
                values: {
                    custrecord_dj_custpayment_status: '2'
                }
            });
            location.reload();
        }


        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            btnReturnButton: btnReturnButton,
            btnSearchButton: btnSearchButton,
            btnClearButton: btnClearButton,
            btnUpdateButton: btnUpdateButton,
            btnExecuteButton: btnExecuteButton
        };

    });

/**
 * â¸ÉyÅ[ÉW
 */
function goPaymentAdjustmentBefore(line) {

    require(['N/currentRecord', 'N/url'], function(currentRecord, url) {

        var head_id = currentRecord.get().getValue({
            fieldId: 'custpage_head_id'
        });
        var subsidiary = currentRecord.get().getValue({
            fieldId: 'custpage_custom_subsidiary'
        });
        var dateFrom = currentRecord.get().getText({
            fieldId: 'custpage_import_date_from'
        });
        var dateTo = currentRecord.get().getText({
            fieldId: 'custpage_import_date_to'
        });
        var paymentId = currentRecord.get().getSublistValue({
            sublistId:'custpage_payment_sub_list',
            fieldId: 'custpage_id',
            line:line
        });

        var client = currentRecord.get().getSublistValue({
            sublistId:'custpage_payment_sub_list',
            fieldId: 'custpage_sub_list_3',
            line:line
        });

        var clientName = currentRecord.get().getSublistText({
            sublistId:'custpage_payment_sub_list',
            fieldId: 'custpage_sub_list_3',
            line:line
        });

        var paymentamo = currentRecord.get().getSublistValue({
            sublistId:'custpage_payment_sub_list',
            fieldId: 'custpage_sub_list_8',
            line:line
        });

        if ((client != null) && (client != '') && (client != undefined)) {
            var output = url.resolveScript({
                scriptId: 'customscript_dj_sl_pay_adjustment_before',
                deploymentId: 'customdeploy_dj_sl_pay_adjustment_before',
                returnExternalUrl: false,
                params: {
                    'custrecord_custpayment_m_id': head_id,
                    'custrecord_custpayment_id': paymentId,
                    'client': client,
                    'clientName': clientName.substring(clientName.indexOf(" ")+1),
                    'paymentamo': paymentamo,
                    'subsidiary': subsidiary,
                    'from':dateFrom,
                    'to':dateTo
                }
            });

            window.location.href = output;
        } else {
            alert("å⁄ãqÇëIëÇµÇƒÇ≠ÇæÇ≥Ç¢ÅB");
        }

    });
}