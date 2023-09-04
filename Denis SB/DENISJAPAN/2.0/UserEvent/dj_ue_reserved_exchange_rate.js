/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 * 為替レート換算の処理
 *
 *
 */
define(['N/ui/serverWidget', 'N/url', 'N/runtime', 'N/record', 'N/redirect', 'N/search', 'N/task', 'N/action', 'underscore'],

    function (serverWidget, url, runtime, record, redirect, search, task, action, _) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {
            try {
                // var form = scriptContext.form;
                // form.clientScriptModulePath = '../Client/dj_cs_reserved_exchange_rate.js';

                var acc = runtime.getCurrentScript().getParameter({
                    name:'custscript_dj_reserved_exchange_rate_acc'
                });
                log.debug('runtime.getCurrentScript()', runtime.getCurrentScript());
                log.debug('custscript_dj_reserved_exchange_rate_acc', acc);


                var form = scriptContext.form;
                var flgField = form.getField({
                    id:'custbody_dj_reserved_exchange_rate_flg'
                });
                flgField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                var balField1 = form.getField({
                    id:'custbody_dj_reserved_exchange_rate_ba1'
                });
                balField1.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                var bidField1 = form.getField({
                    id:'custbody_dj_reserved_exchange_rate_bi1'
                });
                bidField1.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var balField2 = form.getField({
                    id:'custbody_dj_reserved_exchange_rate_ba2'
                });
                balField2.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                var bidField2 = form.getField({
                    id:'custbody_dj_reserved_exchange_rate_bi2'
                });
                bidField2.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var balField3 = form.getField({
                    id:'custbody_dj_reserved_exchange_rate_ba3'
                });
                balField3.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                var bidField3 = form.getField({
                    id:'custbody_dj_reserved_exchange_rate_bi3'
                });
                bidField3.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });


                form.updateDefaultValues({
                    'custbody_dj_reserved_exchange_rate_acc' : acc
                })
                var accField = form.getField({
                    id:'custbody_dj_reserved_exchange_rate_acc'
                });
                accField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });


                var p2Field = form.getField({
                    id:'custbody_dj_reserved_exchange_rate_p2'
                });
                var p3Field = form.getField({
                    id:'custbody_dj_reserved_exchange_rate_p3'
                });



                var currentRecord = scriptContext.newRecord;

                var type = currentRecord.type;

                if (type == 'vendorpayment') {

                    var entity = currentRecord.getValue({
                        fieldId : 'entity'
                    })

                    log.debug('entity', entity);
                    var resList = selectVendbills(entity);
                    log.debug('selectVendbills', resList);

                    var rateFlg;
                    var rate1;
                    var rate2;
                    var rate3;
                    if (resList.length < 1) {
                        return;
                    } else if (resList.length == 1) {
                        rateFlg = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_flg'});
                        rate1 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_p1'});
                        rate2 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_p2'});
                        rate3 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_p3'});
                    } else {
                        for (var i=1;i<resList.length;i++) {
                            var res1 = resList[i-1];
                            var res2 = resList[i];
                            var rateFlg1 = res1.getValue({name: 'custbody_dj_reserved_exchange_rate_flg'});
                            var rate1tmp = res1.getValue({name: 'custbody_dj_reserved_exchange_rate_p1'});
                            var rateFlg2 = res2.getValue({name: 'custbody_dj_reserved_exchange_rate_flg'});
                            var rate2tmp = res2.getValue({name: 'custbody_dj_reserved_exchange_rate_p1'});
                            if (rateFlg1 != rateFlg2 || rate1tmp != rate2tmp) {
                                log.debug('rateFlg1 != rateFlg2 || rate1tmp != rate2tmp', rateFlg1 +','+ rateFlg2 +','+ rate1tmp +','+ rate2tmp);
                                return;
                            }

                        }

                        rateFlg = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_flg'});
                        rate1 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_p1'});
                        rate2 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_p2'});
                        rate3 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_p3'});
                    }

                    currentRecord.setValue({
                        fieldId: 'custbody_dj_reserved_exchange_rate_flg',
                        value : rateFlg
                    });
                    currentRecord.setValue({
                        fieldId: 'custbody_dj_reserved_exchange_rate_p1',
                        value : rate1
                    });
                    currentRecord.setValue({
                        fieldId: 'custbody_dj_reserved_exchange_rate_p2',
                        value : rate2
                    });
                    currentRecord.setValue({
                        fieldId: 'custbody_dj_reserved_exchange_rate_p3',
                        value : rate3
                    });

                    if (!rate1) {
                        p2Field.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                        p3Field.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });
                    }
                } else if (type == 'customerpayment') {
                    var customer = currentRecord.getValue({
                        fieldId : 'customer'
                    });

                    log.debug('customer', customer);
                    var resList = selectInvoices(customer);
                    log.debug('selectInvoices', resList);
                    log.debug('selectInvoices.length', resList.length);

                    var rateFlg;
                    var rate1;
                    var rate2;
                    var rate3;
                    if (resList.length < 1) {
                        return;
                    } else if (resList.length == 1) {
                        rateFlg = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_flg'});
                        rate1 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_s1'});
                        rate2 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_s2'});
                        rate3 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_s3'});
                    } else {
                        for (var i=1;i<resList.length;i++) {
                            var res1 = resList[i-1];
                            var res2 = resList[i];
                            var rateFlg1 = res1.getValue({name: 'custbody_dj_reserved_exchange_rate_flg'});
                            var rate1tmp = res1.getValue({name: 'custbody_dj_reserved_exchange_rate_s1'});
                            var rateFlg2 = res2.getValue({name: 'custbody_dj_reserved_exchange_rate_flg'});
                            var rate2tmp = res2.getValue({name: 'custbody_dj_reserved_exchange_rate_s1'});
                            if (rateFlg1 != rateFlg2 || rate1tmp != rate2tmp) {
                                log.debug('rateFlg1 != rateFlg2 || rate1tmp != rate2', rateFlg1 +','+ rateFlg2 +','+ rate1tmp +','+ rate2tmp);
                                return;
                            }

                        }

                        rateFlg = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_flg'});
                        rate1 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_s1'});
                        rate2 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_s2'});
                        rate3 = resList[0].getValue({name: 'custbody_dj_reserved_exchange_rate_s3'});
                    }

                    currentRecord.setValue({
                        fieldId: 'custbody_dj_reserved_exchange_rate_flg',
                        value : rateFlg
                    });
                    currentRecord.setValue({
                        fieldId: 'custbody_dj_reserved_exchange_rate_s1',
                        value : rate1
                    });
                    currentRecord.setValue({
                        fieldId: 'custbody_dj_reserved_exchange_rate_s2',
                        value : rate2
                    });
                    currentRecord.setValue({
                        fieldId: 'custbody_dj_reserved_exchange_rate_s3',
                        value : rate3
                    });
                }

            } catch (e) {
                log.error(e.name, e.message);
                log.error(e.name, e.stack);
            }
        }

        function selectVendbills(entity) {
            var objSearch = search.load({
                type : null,
                id : 'customsearch_dj_entity_vendbill'
            });
            var myFilter = search.createFilter({
                name : 'entity',
                operator : search.Operator.ANYOF,
                values : entity
            });

            objSearch.filters.push(myFilter);
            var recode = objSearch.run();
            var searchResults = [];
            if (recode != null) {
                var resultIndex = 0;
                var resultStep = 1000;
                do {
                    var searchlinesResults = recode.getRange({
                        start : resultIndex,
                        end : resultIndex + resultStep
                    });

                    if (searchlinesResults.length > 0) {
                        searchResults = searchResults.concat(searchlinesResults);
                        resultIndex = resultIndex + resultStep;
                    }
                } while (searchlinesResults.length > 0);
            }
            return searchResults;
        }

        function selectInvoices(customer) {
            var objSearch = search.load({
                type : null,
                id : 'customsearch_dj_customer_invoice'
            });
            var myFilter = search.createFilter({
                name : 'entity',
                operator : search.Operator.ANYOF,
                values : customer
            });

            objSearch.filters.push(myFilter);
            var recode = objSearch.run();
            var searchResults = [];
            if (recode != null) {
                var resultIndex = 0;
                var resultStep = 1000;
                do {
                    var searchlinesResults = recode.getRange({
                        start : resultIndex,
                        end : resultIndex + resultStep
                    });

                    if (searchlinesResults.length > 0) {
                        searchResults = searchResults.concat(searchlinesResults);
                        resultIndex = resultIndex + resultStep;
                    }
                } while (searchlinesResults.length > 0);
            }
            return searchResults;
        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {

            var newRecord = scriptContext.newRecord;

            // DJ_予約為替レート_選択
            var rateFlg = newRecord.getValue({
                fieldId:'custbody_dj_reserved_exchange_rate_flg'
            });

            if (!rateFlg) {
                return;
            }

            var rateId1;
            var rateId2;
            var rateId3;
            var recType = newRecord.type;
            log.debug('recType', recType);
            if (recType == 'vendorpayment') {

                // DJ_予約為替レート_購入
                rateId1 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_p1'
                });
                rateId2 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_p2'
                });
                rateId3 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_p3'
                });
            } else if (recType == 'customerpayment') {

                // DJ_予約為替レート_販売
                rateId1 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_s1'
                });
                rateId2 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_s2'
                });
                rateId3 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_s3'
                });
            } else {
                return;
            }

            // レコード「DJ_予約為替レート」
            var rateObj1 = record.load({
                type :'customrecord_djkk_reserved_exchange_rate',
                id: rateId1
            });
            // DJ_予約為替レート
            var rate = rateObj1.getValue({
                fieldId : 'custrecord_djkk_reserved_exchange_rate'
            });
            log.debug('rate1',rate);
            if (!rate || isNaN(parseFloat(rate))) {
                log.error('DJ_予約為替レートは数値ではない', 'rate1 is ' + rate);
                return;
            }
            // DJ_残高
            var balance1 = rateObj1.getValue({
                fieldId:'custrecord_dj_reserved_exchange_rate_bal'
            });
            log.debug('balance1',balance1);


            // DJ_予約為替レート_残高
            var usedBalance = newRecord.getValue({
                fieldId:'custbody_dj_reserved_exchange_rate_ba1'
            });
            log.debug('usedBalance1',usedBalance);
            if (usedBalance) {
                usedBalance = isNaN(parseFloat(usedBalance))? 0 : parseFloat(usedBalance);
            } else {
                usedBalance = 0;
            }

            // DJ_予約為替レート_残高ID
            var usedRateId = newRecord.getValue({
                fieldId:'custbody_dj_reserved_exchange_rate_bi1'
            });
            log.debug('usedRateId1',usedRateId);


            var rateObjOther;
            if(!usedRateId || usedRateId == rateObj1.id) {
                balance1 += usedBalance;
            } else {
                // レコード「DJ_予約為替レート」
                rateObjOther = record.load({
                    type:'customrecord_djkk_reserved_exchange_rate',
                    id: usedRateId
                });

                if (rateObjOther) {
                    // DJ_残高
                    var balanceOther = rateObjOther.getValue({
                        fieldId:'custrecord_dj_reserved_exchange_rate_bal'
                    });
                    balanceOther += usedBalance;
                    rateObjOther.setValue({
                        fieldId:'custrecord_dj_reserved_exchange_rate_bal',
                        value: balanceOther
                    });
                    rateObjOther.save();
                }

                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_ba1',
                    value:0
                });
                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_bi1',
                    value:''
                });
            }

            var balance2 = 0;
            if (rateId2) {
                // レコード「DJ_予約為替レート」
                var rateObj2 = record.load({
                    type :'customrecord_djkk_reserved_exchange_rate',
                    id: rateId2
                });
                // DJ_予約為替レート
                var rate = rateObj2.getValue({
                    fieldId : 'custrecord_djkk_reserved_exchange_rate'
                });
                log.debug('rate2',rate);
                if (!rate || isNaN(parseFloat(rate))) {
                    log.error('DJ_予約為替レートは数値ではない', 'rate2 is ' + rate);
                    return;
                }
                // DJ_残高
                balance2 = rateObj2.getValue({
                    fieldId:'custrecord_dj_reserved_exchange_rate_bal'
                });

            }
            log.debug('balance2',balance2);

            // DJ_予約為替レート_残高
            var usedBalance = newRecord.getValue({
                fieldId:'custbody_dj_reserved_exchange_rate_ba2'
            });
            log.debug('usedBalance2',usedBalance);
            if (usedBalance) {
                usedBalance = isNaN(parseFloat(usedBalance))? 0 : parseFloat(usedBalance);
            } else {
                usedBalance = 0;
            }

            // DJ_予約為替レート_残高ID
            var usedRateId = newRecord.getValue({
                fieldId:'custbody_dj_reserved_exchange_rate_bi2'
            });
            log.debug('usedRateId2',usedRateId);


            var rateObjOther;
            if(!usedRateId || (rateId2 && usedRateId == rateObj2.id)) {
                balance2 += usedBalance;
            } else {
                // レコード「DJ_予約為替レート」
                rateObjOther = record.load({
                    type:'customrecord_djkk_reserved_exchange_rate',
                    id: usedRateId
                });

                if (rateObjOther) {
                    // DJ_残高
                    var balanceOther = rateObjOther.getValue({
                        fieldId:'custrecord_dj_reserved_exchange_rate_bal'
                    });
                    balanceOther += usedBalance;
                    rateObjOther.setValue({
                        fieldId:'custrecord_dj_reserved_exchange_rate_bal',
                        value: balanceOther
                    });
                    rateObjOther.save();
                }
                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_ba2',
                    value:0
                });
                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_bi2',
                    value:''
                });
            }
            var balance3 = 0;
            if (rateId3) {
                // レコード「DJ_予約為替レート」
                var rateObj3 = record.load({
                    type :'customrecord_djkk_reserved_exchange_rate',
                    id: rateId3
                });
                // DJ_予約為替レート
                var rate = rateObj3.getValue({
                    fieldId : 'custrecord_djkk_reserved_exchange_rate'
                });
                log.debug('rate3',rate);
                if (!rate || isNaN(parseFloat(rate))) {
                    log.error('DJ_予約為替レートは数値ではない', 'rate3 is ' + rate);
                    return;
                }
                // DJ_残高
                balance3 = rateObj3.getValue({
                    fieldId:'custrecord_dj_reserved_exchange_rate_bal'
                });

            }
            log.debug('balance3',balance3);

            // DJ_予約為替レート_残高
            var usedBalance = newRecord.getValue({
                fieldId:'custbody_dj_reserved_exchange_rate_ba3'
            });
            log.debug('usedBalance3',usedBalance);
            if (usedBalance) {
                usedBalance = isNaN(parseFloat(usedBalance))? 0 : parseFloat(usedBalance);
            } else {
                usedBalance = 0;
            }

            // DJ_予約為替レート_残高ID
            var usedRateId = newRecord.getValue({
                fieldId:'custbody_dj_reserved_exchange_rate_bi3'
            });
            log.debug('usedRateId3',usedRateId);


            var rateObjOther;
            if(!usedRateId || (rateId3 && usedRateId == rateObj3.id)) {
                balance3 += usedBalance;
            } else {
                // レコード「DJ_予約為替レート」
                rateObjOther = record.load({
                    type:'customrecord_djkk_reserved_exchange_rate',
                    id: usedRateId
                });

                if (rateObjOther) {
                    // DJ_残高
                    var balanceOther = rateObjOther.getValue({
                        fieldId:'custrecord_dj_reserved_exchange_rate_bal'
                    });
                    balanceOther += usedBalance;
                    rateObjOther.setValue({
                        fieldId:'custrecord_dj_reserved_exchange_rate_bal',
                        value: balanceOther
                    });
                    rateObjOther.save();
                }
                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_ba3',
                    value:0
                });
                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_bi3',
                    value:''
                });
            }

            // 全部「支払」
            var totalAmount = 0;

            if (recType == 'vendorpayment') {
                var lineCount = newRecord.getLineCount({
                    sublistId:'apply'
                });
                for (var i = 0;i < lineCount;i++) {
                    // 適用
                    var flg = newRecord.getSublistValue({
                        sublistId:'apply',
                        fieldId:'apply',
                        line:i
                    });
                    log.debug('flg',flg);

                    // 支払
                    var amount = newRecord.getSublistValue({
                        sublistId:'apply',
                        fieldId:'amount',
                        line:i
                    });
                    log.debug('amount',amount);
                    log.debug('parseFloat(amount)',parseFloat(amount));
                    log.debug('isNaN(parseFloat(amount))',isNaN(parseFloat(amount)));

                    if (flg) {
                        totalAmount += isNaN(parseFloat(amount)) ? 0 : parseFloat(amount);
                    }

                }
            } else if (recType == 'customerpayment') {

                totalAmount = newRecord.getValue({
                    fieldId:'payment'
                });
            }

            log.debug('totalAmount , balance1', totalAmount +'***'+balance1)
            if (totalAmount > balance1) {
                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_ba1',
                    value:balance1
                });
                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_bi1',
                    value:rateObj1.id
                });
                balance1 = 0;
            } else {
                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_ba1',
                    value:totalAmount
                });
                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_bi1',
                    value:rateObj1.id
                });
                balance1 -= totalAmount;
                totalAmount = 0;
            }


            rateObj1.setValue({
                fieldId:'custrecord_dj_reserved_exchange_rate_bal',
                value:balance1
            });
            rateObj1.save();

            log.debug('totalAmount , balance1', totalAmount +'***'+balance1)
            if (rateId2 && totalAmount > 0) {
                totalAmount -= balance1;
                if (totalAmount > balance2) {
                    newRecord.setValue({
                        fieldId:'custbody_dj_reserved_exchange_rate_ba2',
                        value:balance2
                    });
                    newRecord.setValue({
                        fieldId:'custbody_dj_reserved_exchange_rate_bi2',
                        value:rateObj2.id
                    });
                    balance2 = 0;
                } else {
                    newRecord.setValue({
                        fieldId:'custbody_dj_reserved_exchange_rate_ba2',
                        value:totalAmount
                    });
                    newRecord.setValue({
                        fieldId:'custbody_dj_reserved_exchange_rate_bi2',
                        value:rateObj2.id
                    });
                    balance2 -= totalAmount;
                    totalAmount = 0;
                }
                rateObj2.setValue({
                    fieldId:'custrecord_dj_reserved_exchange_rate_bal',
                    value:balance2
                });
                rateObj2.save();
            }

            log.debug('totalAmount , balance2', totalAmount +'***'+balance2)
            if (rateId3 && totalAmount > 0) {
                totalAmount -= balance2;
                if (totalAmount > balance3) {
                    newRecord.setValue({
                        fieldId:'custbody_dj_reserved_exchange_rate_ba3',
                        value:balance3
                    });
                    newRecord.setValue({
                        fieldId:'custbody_dj_reserved_exchange_rate_bi3',
                        value:rateObj3.id
                    });
                    balance3 = 0;
                } else {
                    newRecord.setValue({
                        fieldId:'custbody_dj_reserved_exchange_rate_ba3',
                        value:totalAmount
                    });
                    newRecord.setValue({
                        fieldId:'custbody_dj_reserved_exchange_rate_bi3',
                        value:rateObj3.id
                    });
                    balance3 -= totalAmount;
                    totalAmount = 0;
                }
                rateObj3.setValue({
                    fieldId:'custrecord_dj_reserved_exchange_rate_bal',
                    value:balance3
                });
                rateObj3.save();
            }
        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {

            var newRecord = scriptContext.newRecord;
            var recType = newRecord.type;

            // DJ_予約為替レート_選択
            var rateFlg = newRecord.getValue({
                fieldId:'custbody_dj_reserved_exchange_rate_flg'
            });

            if (!rateFlg) {
                return;
            }
            if (recType == 'vendorpayment') {

                newRecord = record.load({
                    type: newRecord.type,
                    id: newRecord.id,
                    isDynamic: true
                });


                // DJ_予約為替レート_購入
                var rateId1 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_p1'
                });
                var rateId2 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_p2'
                });
                var rateId3 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_p3'
                });

                // DJ_予約為替レート_残高
                var usedBalance1 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_ba1'
                });
                var usedBalance2 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_ba2'
                });
                var usedBalance3 = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_ba3'
                });

                log.debug('usedBalance1',usedBalance1);
                log.debug('usedBalance2',usedBalance2);
                log.debug('usedBalance3',usedBalance3);
                if (usedBalance1) {
                    usedBalance1 = isNaN(parseFloat(usedBalance1))? 0 : parseFloat(usedBalance1);
                } else {
                    usedBalance1 = 0;
                }
                if (usedBalance2) {
                    usedBalance2 = isNaN(parseFloat(usedBalance2))? 0 : parseFloat(usedBalance2);
                } else {
                    usedBalance2 = 0;
                }
                if (usedBalance3) {
                    usedBalance3 = isNaN(parseFloat(usedBalance3))? 0 : parseFloat(usedBalance3);
                } else {
                    usedBalance3 = 0;
                }
                if (new Number(usedBalance1) + new Number(usedBalance2) + new Number(usedBalance3) == 0) {
                    return;
                }

                // レコード「DJ_予約為替レート」
                var rateObj1 = record.load({
                    type: 'customrecord_djkk_reserved_exchange_rate',
                    id: rateId1
                });
                // DJ_予約為替レート
                var rate1 = rateObj1.getValue({
                    fieldId:'custrecord_djkk_reserved_exchange_rate'
                });
                log.debug('rate1',rate1);
                if (!rate1 || isNaN(parseFloat(rate1))) {
                    log.error('DJ_予約為替レートは数値ではない', 'rate1 is ' + rate1);
                    return;
                }

                if (rateId2) {
                    // レコード「DJ_予約為替レート」
                    var rateObj2 = record.load({
                        type: 'customrecord_djkk_reserved_exchange_rate',
                        id: rateId2
                    });
                    // DJ_予約為替レート
                    var rate2 = rateObj2.getValue({
                        fieldId:'custrecord_djkk_reserved_exchange_rate'
                    });
                    log.debug('rate2',rate2);
                    if (!rate2 || isNaN(parseFloat(rate2))) {
                        log.error('DJ_予約為替レートは数値ではない', 'rate2 is ' + rate2);
                        return;
                    }
                }

                if (rateId3) {
                    // レコード「DJ_予約為替レート」
                    var rateObj3 = record.load({
                        type: 'customrecord_djkk_reserved_exchange_rate',
                        id: rateId3
                    });
                    // DJ_予約為替レート
                    var rate3 = rateObj3.getValue({
                        fieldId:'custrecord_djkk_reserved_exchange_rate'
                    });
                    log.debug('rate3',rate3);
                    if (!rate3 || isNaN(parseFloat(rate3))) {
                        log.error('DJ_予約為替レートは数値ではない', 'rate3 is ' + rate3);
                        return;
                    }
                }


                // DJ_予約為替レート_勘定科目
                var custAcc = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_acc'
                });
                log.debug('custAcc',custAcc);

                // 勘定科目
                var account = newRecord.getValue({
                    fieldId:'account'
                });
                log.debug('account',account);

                // DJ_円建
                var yenAmount = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_yen'
                });
                log.debug('yenAmount',yenAmount);

                // 為替レート
                var defaultRate = newRecord.getValue({
                    fieldId:'exchangerate'
                });
                log.debug('defaultRate',defaultRate);

                // 全部「支払」
                var totalAmount = 0;
                var lineCount = newRecord.getLineCount({
                    sublistId:'apply'
                });
                log.debug('lineCount',lineCount);
                for (var i = 0;i < lineCount;i++) {
                    // 適用
                    var flg = newRecord.getSublistValue({
                        sublistId:'apply',
                        fieldId:'apply',
                        line:i
                    });
                    log.debug('flg',flg);

                    // 支払
                    var amount = newRecord.getSublistValue({
                        sublistId:'apply',
                        fieldId:'amount',
                        line:i
                    });
                    log.debug('amount',amount);
                    log.debug('parseFloat(amount)',parseFloat(amount));
                    log.debug('isNaN(parseFloat(amount))',isNaN(parseFloat(amount)));

                    if (flg) {
                        totalAmount += isNaN(parseFloat(amount)) ? 0 : parseFloat(amount);
                    }

                }
                log.debug('totalAmount',totalAmount);

                // DJ_外貨支払データ作成
                var dataCreateFlg = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_f'
                });
                log.debug('dataCreateFlg',dataCreateFlg);

                // 生成仕訳帳

                // DJ_予約為替レート_仕訳帳
                var journalentryId = newRecord.getValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_jou'
                });

                if (journalentryId) {
                    record.delete({
                        type:'journalentry',
                        id:journalentryId
                    })
                }

                var newJournalRecord = record.create({
                    type: 'journalentry'
                });
                // 転記
                if (!dataCreateFlg) {

                    newJournalRecord.setValue({
                        fieldId: 'approvalstatus',
                        value: '2' // 転記の承認
                    });
                }


                var subsidiary = newRecord.getValue({
                    fieldId:'subsidiary'
                })
                log.debug('subsidiary',subsidiary);
                if (subsidiary) {
                    newJournalRecord.setValue({
                        fieldId: 'subsidiary',
                        value: subsidiary
                    });
                } else {
                    log.debug('runtime.getCurrentUser().subsidiary',runtime.getCurrentUser().subsidiary);
                    newJournalRecord.setValue({
                        fieldId: 'subsidiary',
                        value: runtime.getCurrentUser().subsidiary
                    });
                }

                var defaultAmount = defaultRate * totalAmount;
                log.debug('defaultAmount',defaultAmount);
                var exchangeAmount1 = 0;
                var exchangeAmount2 = 0;
                var exchangeAmount3 = 0;
                if (usedBalance1 > 0) {

                    exchangeAmount1 = rate1 * usedBalance1;
                    log.debug('exchangeAmount1',exchangeAmount1);
                }

                if (usedBalance2 > 0) {

                    exchangeAmount2 = rate2 * usedBalance2;
                    log.debug('exchangeAmount2',exchangeAmount2);
                }
                if (usedBalance3 > 0) {

                    exchangeAmount3 = rate3 * usedBalance3;
                    log.debug('exchangeAmount3',exchangeAmount3);
                }

                var exchangeAmount = exchangeAmount1 + exchangeAmount2 + exchangeAmount3;

                var diffAmount1 =  exchangeAmount - defaultAmount;
                log.debug('diffAmount1',diffAmount1);

                // （貸方）
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: 0,
                    value: diffAmount1
                })

                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 0,
                    value: account
                });

                // （借方）
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: 1,
                    value: diffAmount1
                });

                //税勘定科目
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 1,
                    value: custAcc
                });

                if (yenAmount && !isNaN(parseFloat(yenAmount))) {

                    var diffAmount2 = exchangeAmount - yenAmount;
                    log.debug('diffAmount2',diffAmount2);
                    // （貸方）
                    newJournalRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        line: 2,
                        value: diffAmount2
                    })

                    newJournalRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        line: 2,
                        value: account
                    });
                    // （借方）
                    newJournalRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        line: 3,
                        value: diffAmount2
                    });

                    //税勘定科目
                    newJournalRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        line: 3,
                        value: custAcc
                    });
                }

                var journalId = newJournalRecord.save({ignoreMandatoryFields: true});

                newRecord.setValue({
                    fieldId:'custbody_dj_reserved_exchange_rate_jou',
                    value:journalId
                });
                newRecord.save();
                log.debug('reserved_exchange_rate','finished');
            }

        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });
