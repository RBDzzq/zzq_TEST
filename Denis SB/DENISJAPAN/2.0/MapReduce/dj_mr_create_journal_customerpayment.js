/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NAmdConfig ../Common/myconfig.json
 */
define(['N/search', 'N/record', 'N/runtime', 'N/format', 'N/config', 'me', 'moment', 'underscore', 'N/error','N/email', 'lib'],
    function(search, record, runtime, format, config, me, moment, _, error, email, lib) {

        function getInputData() {
            //get params
            var head_id = runtime.getCurrentScript().getParameter("custscript_custpay_head_id");
            var subsidiary = runtime.getCurrentScript().getParameter("custscript_subsidiary");
            log.debug('runtime.getCurrentScript()', runtime.getCurrentScript());
            log.debug('head_id', head_id);
            log.debug('subsidiary', subsidiary);
            return {
                obj: {head_id: head_id, subsidiary : subsidiary}
            }
            
        }
        /**
         * Call with time of number record return from search in getInputData, or array length
         * @param context
         */
        function map(context) {

            log.debug('map context.key', context.key);
            log.debug('map context.value', context.value);
            context.write(context.key, context.value);
        }

        /**
         * in reduce, context.value is undefined, but context.values[i] or context.values.length is valid
         * @param context
         */
        function reduce(context) {
            try {

                var obj = JSON.parse(context.values[0]);
                log.debug('obj', obj);
                var id = obj['head_id'];
                log.debug('id', id);
                var subsidiary = obj['subsidiary'];
                log.debug('subsidiary', subsidiary);

                var accountId = '';// TODO


                var headRecord = record.load({
                    type: 'customrecord_dj_custpayment_management',
                    id: id,
                    isDynamic: true
                });
                log.debug('headRecord', headRecord);
                var settingList = getSetting();
                var setting = settingList.getRange({start: 0, end: 1})[0];
                log.debug('setting', setting);

                //Account for 手数料 in Journal 手数料_勘定科目
                var saveAcc = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_acc'});
                if (me.isEmpty(saveAcc)) {
                    saveAcc = setting.getValue({name: 'custrecord_dj_custpayment_setting_acc'});
                }
                //誤差認識差額(=10)
                var saveError = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_error'});
                if (me.isEmpty(saveError)) {
                    saveError = setting.getValue({name: 'custrecord_dj_custpayment_setting_error'});
                }
                //tax code for 手数料  and 計算誤差　in Journal 手数料_消費税コード
                var saveTaxCo = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_taxco'});
                if (me.isEmpty(saveTaxCo)) {
                    saveTaxCo = setting.getValue({name: 'custrecord_dj_custpayment_setting_taxco'});
                }
                //手数料_消費税カテゴリ
                var saveTaxCa = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_taxca'});
                if (me.isEmpty(saveTaxCa)) {
                    saveTaxCa = setting.getValue({name: 'custrecord_dj_custpayment_setting_taxca'});
                }

                //プラス誤差_勘定科目
                var savePlus = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_plus'});
                if (me.isEmpty(savePlus)) {
                    savePlus = setting.getValue({name: 'custrecord_dj_custpayment_setting_plus'});
                }
                //マイナス誤差_勘定科目
                var saveMinus = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_minus'});
                if (me.isEmpty(saveMinus)) {
                    saveMinus = setting.getValue({name: 'custrecord_dj_custpayment_setting_minus'});
                }

                var options = {
                    //貸方には入金票で「ディスカウント費用額」
                    // 仕様されていたら、会計プリファレンス
                    // 「販売ディスカウント勘定」（入金票の総勘定元帳と同じ）を設定
                    // save_account: doGetAccountPreference(config),
                    account_credit: doGetAccountPreference(config),
                    // save_err: saveError,
                    // taxcode: saveTaxCo,
                    rate_fee: doGetTaxRate(saveTaxCo),
                    paymentdate: format.parse({value: getNowDateJP(), type: format.Type.DATE}),
                    account_debit_fee: saveAcc,
                    taxcode_fee: saveTaxCo,
                    taxca_fee: saveTaxCa,
                    account_debit_calc_plus: savePlus,
                    account_debit_calc_minus: saveMinus,
                    paymentamo: 0,
                    subsidiary : subsidiary
                };
                var res = doCreateCustomerPayment(headRecord, accountId, options);
                log.debug('res',res)
                if (!res) {
                    throw new Error('doCreateCustomerPayment error')
                }
                var numLines = headRecord.getLineCount({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                });
                var completedCount = 0;
                for (var i=0;i<numLines;i++) {
                    var errorFlag = headRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_error_flag',
                        line: i
                    });
                    if (errorFlag) {
                        completedCount++;
                    }
                }
                if (completedCount != numLines) {
                    // 7.一部消込完了
                    headRecord.setValue({
                        fieldId: 'custrecord_dj_custpayment_status',
                        value: 7
                    });
                } else {
                    // 自動消込完了
                    headRecord.setValue({
                        fieldId: 'custrecord_dj_custpayment_status',
                        value: 3
                    });
                }

                headRecord.save({ignoreMandatoryFields: true});
                // context.write(customerPayment);
                context.write(context.key, id);
            } catch (e) {
                log.debug('error', e)
                log.debug('reduce error')
                //4.自動消込エラー
                headRecord.setValue({
                    fieldId: 'custrecord_dj_custpayment_status',
                    value: 4
                });
                headRecord.save({ignoreMandatoryFields: true});


            }

        }

        function getDeparmentFromInvoice(client) {
            try {
                var invoiceDetailsList = getInvoiceList();
                var searchResults = invoiceDetailsList.getRange({
                    start: 0,
                    end: 1000
                });
                var department = null;
                for (var n = 0; n < searchResults.length; n++) {
                    if (searchResults[n].getValue({name: 'entity'}) == client) {
                        department = searchResults[n].getValue({name: 'department'});
                        break;
                    }
                }
                return department;
            } catch (e) {
                log.error('getDeparmentFromInvoice: ' + e.name, e.message);
            }
        }

        function doCreateJounal(headRecord, options) {
            log.debug("doCreateJounal start","")
            var numLines = headRecord.getLineCount({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id'
            });
            log.debug("doCreateJounal numLines",numLines)
            for (var i = 0; i < numLines; i++) {
                //Check if saving existing
                var saving = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_saving',
                    line: i
                });
                if (me.isEmpty(saving))
                    continue;
                saving = JSON.parse(saving);
                if (me.isEmpty(saving.invoice))
                    continue;

                var saving2 = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_saving_s',
                    line: i
                });
                var saving3 = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_saving_t',
                    line: i
                });
                var saving4 = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_saving_a',
                    line: i
                });
                if ((me.isEmpty(saving2) || (JSON.parse(saving2)).diffList) && me.isEmpty(saving3) && me.isEmpty(saving4) )
                    continue;

                options.saving = saving;
                options.saving2 = saving2;
                options.saving3 = saving3;
                options.saving4 = saving4;

                options.paymentamo = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_paymentamo',
                    line: i
                });
                //get Name
                /*options.entity = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_client',
                    line: i
                });*/
                //check if 除 checked
                var selected = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_exclusion',
                    line: i
                });
                if (selected) {
                    continue;
                }
                //check if 金額 is 0
                var amount = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_paymentamo',
                    line: i
                });
                if (!me.isEmpty(amount))
                    amount = format.parse({value: amount, type: format.Type.INTEGER});
                if (amount == 0 || me.isEmpty(amount)) {
                    continue;
                }
                //check if 債権額 is 0
                var sum_amount = headRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_claimsum',
                    line: i
                });
                if (!me.isEmpty(sum_amount))
                    sum_amount = format.parse({value: sum_amount, type: format.Type.INTEGER});
                if (sum_amount == 0 || me.isEmpty(sum_amount)) {
                    continue;
                }


                var journalId = doCreateJournalRecordWithSaving(options);

                //Save link jounal to header
                var lineNum = headRecord.selectLine({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    line: i
                });
                headRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_link_jou',
                    value: journalId
                });
                headRecord.commitLine({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                });
            }

        }

        function doGetTaxRate(taxCode) {
            try {
                var searchTax = search.lookupFields({
                    // type: 'taxgroup',
                    type: 'salestaxitem',
                    id: taxCode,
                    columns: ['rate']
                });
                var rate = parseFloat(searchTax.rate);
                log.debug('doGetTaxRate', rate);
                return rate;
            } catch (e) {
                log.error('doGetTaxRate: ' + e.name, e.message);
                return 0;
            }
        }

        function doCreateJournalRecordWithSaving(options) {
            //Create journal
            var newJournalRecord = record.create({
                type: 'journalentry'
            });
            newJournalRecord.setValue({
                fieldId: 'trandate',
                value: options.paymentdate
            });
            log.debug('options.subsidiary',options.subsidiary);
            if (options.subsidiary) {
                newJournalRecord.setValue({
                    fieldId: 'subsidiary',
                    value: options.subsidiary
                });
            } else {
                log.debug('runtime.getCurrentUser().subsidiary',runtime.getCurrentUser().subsidiary);
                newJournalRecord.setValue({
                    fieldId: 'subsidiary',
                    value: runtime.getCurrentUser().subsidiary
                });
            }


            options.line = 0;
            options.grossamt = 0;

            var feeValue = options.saving.feeValue;
            var calc = options.saving.calculationValue;
            if (me.isEmpty(feeValue)) {
                feeValue = 0;
            }
            if (me.isEmpty(calc)) {
                calc = 0;
            }

            // add for adjustment
            doCreateDebitAdjustmentJournal(newJournalRecord, options);

            log.debug('options.grossamt', options.grossamt);
            var journalId;
            if (options.grossamt > 0) {
                doCreateCreditJournal(newJournalRecord, options);
                journalId = newJournalRecord.save({ignoreMandatoryFields: true});
            }
            return journalId;
        }

        function doCreateDebitAdjustmentJournal(newJournalRecord, options) {
            log.debug('doCreateDebitAdjustmentJournal start '+options.line);

            util.each(options.saving.invoice, function (invObj) {

                if (me.isEmpty(invObj.adjustment)) {
                    return true;
                }

                if (!me.isEmpty(options.saving3)
                    && me.isEmpty(options.saving.totalAdjustmentAmountWithSign)) {
                    var saving3 = JSON.parse(options.saving3);
                    log.debug('doCreateDebitAdjustmentJournal saving3', saving3);
                    newJournalRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        line: options.line,
                        value: saving3.amount
                    });

                    //Department
                    // if (!me.isEmpty(options.department))
                    //     newJournalRecord.setSublistValue({
                    //         sublistId: 'line',
                    //         fieldId: 'department',
                    //         line: options.line,
                    //         value: options.department
                    //     });
                    //Class
                    if (!me.isEmpty(options.class))
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            line: options.line,
                            value: options.class
                        });

                    //税勘定科目
                    newJournalRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        line: options.line,
                        value: saving3.account
                    });

                    options.line = options.line + 1;
                }

                if (!me.isEmpty(options.saving4)) {
                    var saving4 = JSON.parse(options.saving4);
                    log.debug('doCreateDebitAdjustmentJournal saving4', saving4);
                    newJournalRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        line: options.line,
                        value: saving4.amountLeft
                    });

                    //Department
                    // if (!me.isEmpty(options.department))
                    //     newJournalRecord.setSublistValue({
                    //         sublistId: 'line',
                    //         fieldId: 'department',
                    //         line: options.line,
                    //         value: options.department
                    //     });
                    //Class
                    if (!me.isEmpty(options.class))
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            line: options.line,
                            value: options.class
                        });

                    //税勘定科目
                    newJournalRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        line: options.line,
                        value: saving4.account
                    });

                    // 税金コード
                    newJournalRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'taxcode',
                        line: options.line,
                        value: saving4.taxitem
                    });

                    options.line = options.line + 1;

                    // newJournalRecord.setSublistValue({
                    //     sublistId: 'line',
                    //     fieldId: 'debit',
                    //     line: options.line,
                    //     value: saving4.taxAmount
                    // });
                    //
                    // //Department
                    // if (!me.isEmpty(options.department))
                    //     newJournalRecord.setSublistValue({
                    //         sublistId: 'line',
                    //         fieldId: 'department',
                    //         line: options.line,
                    //         value: options.department
                    //     });
                    // //Class
                    // if (!me.isEmpty(options.class))
                    //     newJournalRecord.setSublistValue({
                    //         sublistId: 'line',
                    //         fieldId: 'class',
                    //         line: options.line,
                    //         value: options.class
                    //     });
                    //
                    // //税勘定科目
                    // newJournalRecord.setSublistValue({
                    //     sublistId: 'line',
                    //     fieldId: 'account',
                    //     line: options.line,
                    //     value: saving4.accountTaxMinus
                    // });
                    //
                    // options.line = options.line + 1;

                }

                if (!me.isEmpty(options.saving2)) {
                    var saving2 = JSON.parse(options.saving2);
                    if (!me.isEmpty(saving2['tranid:'+invObj.tranid].diffList)) {
                        util.each(saving2['tranid:'+invObj.tranid].diffList, function (diffObj) {

                            log.debug('doCreateDebitAdjustmentJournal diffObj.amount', diffObj.amount);

                            // 税金コード
                            if (!me.isEmpty(diffObj.taxitem)) {
                                newJournalRecord.setSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'taxcode',
                                    line: options.line,
                                    value: diffObj.taxitem
                                });
                                newJournalRecord.setSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'debit',
                                    line: options.line,
                                    value: diffObj.amountLeft
                                });
                            } else {

                                newJournalRecord.setSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'debit',
                                    line: options.line,
                                    value: diffObj.amount
                                });
                            }


                            //Department
                            // if (!me.isEmpty(options.department))
                            //     newJournalRecord.setSublistValue({
                            //         sublistId: 'line',
                            //         fieldId: 'department',
                            //         line: options.line,
                            //         value: options.department
                            //     });
                            //Class
                            if (!me.isEmpty(options.class))
                                newJournalRecord.setSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'class',
                                    line: options.line,
                                    value: options.class
                                });

                            //税勘定科目
                            newJournalRecord.setSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                line: options.line,
                                value: diffObj.account
                            });


                            options.line = options.line + 1;
                        });
                    }
                }
                options.grossamt = options.grossamt + Math.abs(parseInt(invObj.adjustment,10));
            });
            log.debug('doCreateDebitAdjustmentJournal end');
        }


        function doCreateCreditJournal(newJournalRecord, options) {
            log.debug('doCreateCreditJournal option', options);
            var line = options.line;

            log.debug('doCreateCreditJournal options.grossamt', options.grossamt + 'xxx '+line);
            newJournalRecord.setSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                line: line,
                value: options.grossamt
            });

            //Department
            // if (!me.isEmpty(options.department))
            //     newJournalRecord.setSublistValue({
            //         sublistId: 'line',
            //         fieldId: 'department',
            //         line: line,
            //         value: options.department
            //     });
            //Class
            if (!me.isEmpty(options.class))
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: line,
                    value: options.class
                });

            // var configRecObj = config.load({
            //     type: config.Type.ACCOUNTING_PREFERENCES
            // });
            //
            // var adpayAcc = configRecObj.getValue({
            //     fieldId: 'salesdisacct'
            // })

            log.debug('doCreateCreditJournal options.account_credit', options.account_credit);
            //税勘定科目
            newJournalRecord.setSublistValue({
                sublistId: 'line',
                fieldId: 'account',
                line: line,
                value: options.account_credit
            });

            if (!me.isEmpty(options.saving3)
                && !me.isEmpty(options.saving.totalAdjustmentAmountWithSign)) {
                var saving3 = JSON.parse(options.saving3);

                options.line = options.line + 1;

                log.debug('doCreateCreditJournal saving3', saving3);
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: options.line,
                    value: saving3.amount * -1
                });

                //Department
                // if (!me.isEmpty(options.department))
                //     newJournalRecord.setSublistValue({
                //         sublistId: 'line',
                //         fieldId: 'department',
                //         line: options.line,
                //         value: options.department
                //     });
                //Class
                if (!me.isEmpty(options.class))
                    newJournalRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'class',
                        line: options.line,
                        value: options.class
                    });

                //税勘定科目
                newJournalRecord.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: options.line,
                    value: saving3.account
                });

            }

        }

        function doCreateCustomerPaymentWithSaving(headRecord, accountId, saving, options, lineNum, clientValue, subsidiary) {

            log.debug('doCreateCustomerPaymentWithSaving saving', saving);
            var invoicesArray = saving.invoice;
            if (_.isEmpty(invoicesArray))
                return;
            //入金額
            var paymentamo = headRecord.getSublistValue({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                fieldId: 'custrecord_dj_custpayment_paymentamo',
                line: lineNum
            });
            paymentamo = format.parse({value: paymentamo, type: format.Type.INTEGER});
            //債権額
            var sum_paymentamo = headRecord.getSublistValue({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                fieldId: 'custrecord_dj_custpayment_claimsum',
                line: lineNum
            });
            sum_paymentamo = format.parse({value: sum_paymentamo, type: format.Type.INTEGER});

            //get discount from 手数料、誤差
            var disc = 0;
            //手数料
            var feeValue = 0;
            if (!me.isEmpty(saving.feeValue)) {
                feeValue = format.parse({value: saving.feeValue, type: format.Type.INTEGER});
            }
            //計算誤差
            var calculationValue = 0;
            if (!me.isEmpty(saving.calculationValue)) {
                calculationValue = format.parse({value: saving.calculationValue, type: format.Type.INTEGER});
            }
            //get 調整額
            var adjustmentSum = 0;
            util.each(invoicesArray, function (invoice) {
                if (!me.isEmpty(invoice.adjustment))
                    adjustmentSum += format.parse({value: invoice.adjustment, type: format.Type.INTEGER});
            });
            disc = feeValue + calculationValue + adjustmentSum;
            if (disc < 0) {
                disc = 0;
            }
            //get checked invoice
            var invoiceId = null;
            for (var i = 0; i < invoicesArray.length; i++) {
                if (invoicesArray[i].check == 'T') {
                    invoiceId = invoicesArray[i].id;
                    break;
                }
            }

            if (me.isEmpty(invoiceId))
                invoiceId = invoicesArray[0].id;
            var invoiceRecord = record.load({
                type: 'invoice',
                id: invoiceId
            });

            //check to payment
            var payment = 0;
            // sum_paymentamo = invoiceRecord.getValue({fieldId: 'amountremaining'});
            //entity(Name)
            options.lineName = invoiceRecord.getValue({fieldId: 'entity'});
            //department
            // options.department = invoiceRecord.getValue({fieldId: 'department'});
            //class
            options.class = invoiceRecord.getValue({fieldId: 'class'});
            //location
            options.location = invoiceRecord.getValue({fieldId: 'location'});

            /*if (!me.isEmpty(sum_paymentamo))
                sum_paymentamo = format.parse({value: sum_paymentamo, type: format.Type.INTEGER});*/
            // if (paymentamo > sum_paymentamo) {
            //     payment = sum_paymentamo;
            // } else {
                payment = paymentamo;
            // }

            log.debug('invoiceId', invoiceId);
            //transform
            // var customerPaymentRecord = record.transform({
            //     fromType: 'invoice',
            //     fromId: invoiceId,
            //     toType: 'customerpayment'
            // });
            var customerPaymentRecord = record.create({
                type: 'customerpayment'
            });
            customerPaymentRecord.setValue({
                fieldId: 'customer',
                value: clientValue
            });
            customerPaymentRecord.setValue({
                fieldId: 'subsidiary',
                value: subsidiary
            });
            log.debug('customerPaymentRecord', customerPaymentRecord);
            log.debug('customerPaymentRecord.id', customerPaymentRecord.id);
            var paymentdate = headRecord.getSublistValue({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                fieldId: 'custrecord_dj_custpayment_paymentdate',
                line: lineNum
            });
            customerPaymentRecord.setValue({
                fieldId: 'trandate',
                value: paymentdate
            });
            log.debug('lineNum', lineNum);
            log.debug('payment date', paymentdate);
            // if (!me.isEmpty(options.department))
            //     customerPaymentRecord.setValue({
            //         fieldId: 'department',
            //         value: options.department
            //     });
            var client_half = headRecord.getSublistValue({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                fieldId: 'custrecord_dj_custpayment_client_half',
                line: lineNum
            });
            customerPaymentRecord.setValue({
                fieldId: 'account',
                value: accountId
            });
            //入金票で標準機能の消込自動適用フラグにチェックが入っている為、指定してないのに自動で消し込まれます。
            // チェックをデフォルトでOFFにできないですか
            customerPaymentRecord.setValue({
                fieldId: 'autoapply',
                value: false
            });
            log.debug('doCreateCustomerPaymentWithSaving payment ', payment);
            customerPaymentRecord.setValue({
                fieldId: 'payment',
                value: payment
            });
            /*customerPaymentRecord.setSublistValue({
                sublistId: 'apply',
                fieldId: 'apply',
                line: 0,
                value: true
            });
            customerPaymentRecord.setSublistValue({
                sublistId: 'apply',
                fieldId: 'amount',
                line: 0,
                value: payment - disc
            });
            log.debug('disc', disc);
            customerPaymentRecord.setSublistValue({
                sublistId: 'apply',
                fieldId: 'disc',
                line: 0,
                value: disc
            });*/


            log.debug('!me.isEmpty(customerPaymentRecord) ', !me.isEmpty(customerPaymentRecord));
            log.debug('customerPaymentRecord', customerPaymentRecord);
            //save and update link to header record
            if (!me.isEmpty(customerPaymentRecord)) {

                var customerPaymentRecordId = customerPaymentRecord.save({ignoreMandatoryFields: true});
                log.debug('customerPaymentRecordId', customerPaymentRecordId);
                resetCustomerPayment(customerPaymentRecordId, invoicesArray, payment, saving.totalAdjustmentAmountWithSign);
                var lineNum = headRecord.selectLine({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    line: lineNum
                });
                log.debug('lineNum', lineNum);
                headRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_link',
                    value: customerPaymentRecordId
                });
                //完了＝true
                headRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                    fieldId: 'custrecord_dj_custpayment_error_flag',
                    value: true
                });
                headRecord.commitLine({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                });

            }
            log.debug('doCreateCustomerPaymentWithSaving ending with id', customerPaymentRecordId);

        }

        function resetCustomerPayment(customerPaymentId, invoiceArray, payment, totalAdjustmentAmountWithSign) {
            //set record customerpayment
            var customerPayment = record.load({
                type: 'customerpayment',
                id: customerPaymentId
            });
            customerPayment.setValue({
                fieldId: 'autoapply',
                value: false
            });
            var numLines = customerPayment.getLineCount({
                sublistId: 'apply'
            });
            log.debug('resetCustomerPayment numLines ', numLines);
            customerPayment.setValue({
                fieldId: 'payment',
                value: payment
            });

            //clear all before apply
            for (var i = 0; i < numLines; i++) {
                customerPayment.setSublistValue({
                    sublistId: 'apply',
                    fieldId: 'apply',
                    line: i,
                    value: false
                });
            }

            for (var i = 0; i < numLines; i++) {
                log.debug('resetCustomerPayment line ', i);
                var invoiceId = customerPayment.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'internalid',
                    line: i
                });
                log.debug('resetCustomerPayment invoiceId ', invoiceId);
                var invoiceRowObj = _.findWhere(invoiceArray, {id: invoiceId});
                if (!_.isUndefined(invoiceRowObj)) {
                    //found
                    log.debug('resetCustomerPayment invoiceRowObj ', invoiceRowObj);
                    if (invoiceRowObj.check == 'T') {
                        customerPayment.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'apply',
                            line: i,
                            value: true
                        });

                        var appliedAmount = invoiceRowObj.applied;
                        if (!me.isEmpty(invoiceRowObj.adjustment) && me.isEmpty(totalAdjustmentAmountWithSign)) {
                            // appliedAmount = appliedAmount - parseInt(invoiceRowObj.adjustment, 10);
                            // if (appliedAmount < 0) {
                            //     appliedAmount = invoiceRowObj.applied;
                            // }
                            log.debug('resetCustomerPayment invoiceRowObj.adjustment ', invoiceRowObj.adjustment);
                            customerPayment.setSublistValue({
                                sublistId: 'apply',
                                fieldId: 'discamt',
                                line: i,
                                value: parseInt(invoiceRowObj.adjustment, 10)
                            });
                            customerPayment.setSublistValue({
                                sublistId: 'apply',
                                fieldId: 'disc',
                                line: i,
                                value: parseInt(invoiceRowObj.adjustment, 10)
                            });
                        }

                        log.debug('resetCustomerPayment appliedAmount ', appliedAmount);
                        customerPayment.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'amount',
                            line: i,
                            value: appliedAmount
                        });

                    }
                }
            }
            /*resetCustomerPayment.setValue({
                fieldId: 'payment',
                value: payment
            });*/

            /*resetCustomerPayment.setSublistValue({
                sublistId: 'apply',
                fieldId: 'disc',
                line: 0,
                value: disc
            });*/
            customerPayment.save({ignoreMandatoryFields: true});
        }

        function doCreateCustomerPayment(headRecord, accountId, options) {
                //get From To
                var importFrom = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_date_from'});
                var importTo = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_date_to'});


                var subsidiary = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_subsidiary'});
                var bankname = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_bank_name'});

                var numLines = headRecord.getLineCount({
                    sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                });
                // var numLines = runtime.getCurrentSession().get({name: "lineNum"});
                for (var lineNum = 0; lineNum < numLines; lineNum++) {
                    try {
                        // 完了ステータス
                        var errorFlag = headRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_error_flag',
                            line: lineNum
                        });
                        if (errorFlag) {
                            continue;
                        }

                        var client = headRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_client',
                            line: lineNum
                        });

                        if (me.isEmpty(client)) {
                            continue;
                        }

                        var searchType = 'customrecord_dj_custpayment_sub_acc';
                        var searchFilters = [];
                        searchFilters.push(["custrecord_dj_subsidiary", "is", subsidiary]);
                        searchFilters.push("AND");
                        searchFilters.push(["custrecord_dj_custpayment_bankname", "is", bankname]);

                        var searchColumns = [search.createColumn({
                            name : "custrecord_dj_custpayment_acc"
                        })];
                        var results = lib.createSearch(searchType,searchFilters,searchColumns)
                        if (results && results.length > 0) {

                            accountId = results[0].getValue({
                                name : 'custrecord_dj_custpayment_acc',
                            });
                            log.debug('customrecord_dj_custpayment_sub_acc accountId',accountId);
                        }
                        if (!accountId) {

                            log.debug('subsidiary:'+subsidiary+'bankname:'+bankname,'この子会社の勘定科目が存在しない。')
                            continue;
                        }



                        //check if 除 checked
                        var selectChecked = headRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_exclusion',
                            line: lineNum
                        });
                        if (selectChecked) {
                            continue;
                        }
                        //check if 金額 is 0
                        var amount = headRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_paymentamo',
                            line: lineNum
                        });
                        if (!me.isEmpty(amount))
                            amount = format.parse({value: amount, type: format.Type.INTEGER});
                        if (amount == 0 || me.isEmpty(amount)) {
                            continue;
                        }
                        //check if 債権額 is 0
                        var sum_amount = headRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_claimsum',
                            line: lineNum
                        });
                        if (!me.isEmpty(sum_amount))
                            sum_amount = format.parse({value: sum_amount, type: format.Type.INTEGER});
                        if (sum_amount == 0 || me.isEmpty(sum_amount)) {
                            continue;
                        }
                        //check From To
                        var paymentDate = headRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_paymentdate',
                            line: lineNum
                        });

                        if (!paymentDateInRank(importFrom, importTo, paymentDate)) {
                            continue;
                        }
                        //Check if saving existing
                        var saving = headRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_saving',
                            line: lineNum
                        });
                        if (me.isEmpty(saving))
                            doCreateCustomerPaymentFromCSV(headRecord, accountId, lineNum,client, subsidiary);
                        else {
                            var savingObj = JSON.parse(saving);
                            log.debug('savingObj', savingObj);
                            if (_.isEmpty(savingObj.invoice))
                                doCreateCustomerPaymentFromCSV(headRecord, accountId, lineNum,client, subsidiary);
                            else {
                                doCreateCustomerPaymentWithSaving(headRecord, accountId, savingObj, options, lineNum,client, subsidiary);
                                doCreateJounal(headRecord, options);
                            }
                        }

                    } catch (e1) {
                        log.debug('doCreateCustomerPayment error')
                        var lineNum2 = headRecord.selectLine({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            line: lineNum
                        });
                        headRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_error_flag',
                            value: false
                        });
                        headRecord.commitLine({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                        });

                        var link = headRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_link',
                            line: lineNum
                        });
                        if(!me.isEmpty(link)){
                            record.delete({
                                type: 'customerpayment',
                                id: link,
                            });
                        }
                        var link_jou = headRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_link_jou',
                            line: lineNum
                        });
                        if(!me.isEmpty(link_jou)){
                            record.delete({
                                type: 'journalentry',
                                id: link_jou,
                            });
                        }

                        log.debug('error',e1);
                        return false;
                    }

                }
            return true;
        }

        function paymentDateInRank(importFrom, importTo, paymentDate) {
            try {
                var result = false;
                //~~
                if (me.isEmpty(importFrom) && me.isEmpty(importTo)) {
                    result = true;
                }
                //From~To
                else if (!me.isEmpty(importFrom) && !me.isEmpty(importTo)) {
                    if (moment(importFrom) <= moment(paymentDate) && moment(paymentDate) <= moment(importTo)) {
                        result = true;
                    }
                }
                //From~
                else if (!me.isEmpty(importFrom) && me.isEmpty(importTo)) {
                    if (moment(importFrom) <= moment(paymentDate)) {
                        result = true;
                    }
                }
                //~To
                else if (me.isEmpty(importFrom) && !me.isEmpty(importTo)) {
                    if (moment(paymentDate) <= moment(importTo)) {
                        result = true;
                    }
                }
                return result;
            } catch (e) {
                log.error('paymentDateInRank ' + e.name, e.message);
                return false;
            }
        }

        function doCreateCustomerPaymentFromCSV(headRecord, accountId, i,clientValue, subsidiary) {

            //get some value
            // var clientValue = headRecord.getSublistValue({
            //     sublistId: 'recmachcustrecord_dj_custpayment_m_id',
            //     fieldId: 'custrecord_dj_custpayment_client',
            //     line: i
            // });
            var client = headRecord.getSublistText({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                fieldId: 'custrecord_dj_custpayment_client',
                line: i
            });
            log.debug("doCreateCustomerPaymentFromCSV client:",client)
            // var invoiceId = doGetInvoiceFromClient(client.substring(client.indexOf(" ")+1));
            // if (me.isEmpty(invoiceId)) {
            //     return;
            // }
            // log.debug('invoiceId', invoiceId);
            var paymentdate = headRecord.getSublistValue({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                fieldId: 'custrecord_dj_custpayment_paymentdate',
                line: i
            });
            //入金額
            var paymentamo = headRecord.getSublistValue({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                fieldId: 'custrecord_dj_custpayment_paymentamo',
                line: i
            });
            paymentamo = format.parse({value: paymentamo, type: format.Type.INTEGER});
            //債権額
            // var sum_paymentamo = headRecord.getSublistValue({
            //     sublistId: 'recmachcustrecord_dj_custpayment_m_id',
            //     fieldId: 'custrecord_dj_custpayment_claimsum',
            //     line: i
            // });
            // sum_paymentamo = format.parse({value: sum_paymentamo, type: format.Type.INTEGER});
            //check to payment
            var payment = 0;
            // if (paymentamo > sum_paymentamo) {
            //     payment = sum_paymentamo;
            // } else {
                payment = paymentamo;
            // }
            var client_half = headRecord.getSublistValue({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                fieldId: 'custrecord_dj_custpayment_client_half',
                line: i
            });
            //transform
            // var customerPaymentRecord = record.transform({
            //     fromType: 'invoice',
            //     fromId: invoiceId,
            //     toType: 'customerpayment'
            // });
            var customerPaymentRecord = record.create({
                type: 'customerpayment'
            });
            customerPaymentRecord.setValue({
                fieldId: 'customer',
                value: clientValue
            });
            customerPaymentRecord.setValue({
                fieldId: 'subsidiary',
                value: subsidiary
            });
            //set some value for cusPaymen after transfom
            customerPaymentRecord.setValue({
                fieldId: 'trandate',
                value: paymentdate
            });
            // var department = getDeparmentFromInvoice(client);
            //
            // log.debug('department ', department);
            // if (!me.isEmpty(department)) {
            //     customerPaymentRecord.setValue({
            //         fieldId: 'department',
            //         value: department
            //     });
            // }
            if (!me.isEmpty(client_half)) {
                customerPaymentRecord.setValue({
                    fieldId: 'custbody_hankakukana_name',
                    value: client_half
                });
            }
            customerPaymentRecord.setValue({
                fieldId: 'payment',
                value: payment
            });
            customerPaymentRecord.setValue({
                fieldId: 'autoapply',
                value: false
            });
            //set default for account
            customerPaymentRecord.setValue({
                fieldId: 'account',
                value: accountId
            });
            var customerPaymentRecordId = customerPaymentRecord.save({ignoreMandatoryFields: true});
            //get FromDate and ToDate
            var fromDate = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_date_from'});
            var toDate = headRecord.getValue({fieldId: 'custrecord_dj_custpayment_date_to'});
            // if (!me.isEmpty(fromDate) && !me.isEmpty(toDate)) {

                log.debug('doSetApplyInvoice  ', 'start');
                doSetApplyInvoice(customerPaymentRecordId, fromDate, toDate, payment);
                log.debug('doSetApplyInvoice  ', 'end');
            // }
            //save and update link to header record
            log.debug('customerPaymentRecordId ', customerPaymentRecordId);
            var lineNum = headRecord.selectLine({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                line: i
            });

            headRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                fieldId: 'custrecord_dj_custpayment_link',
                value: customerPaymentRecordId
            });
            //完了＝true
            headRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                fieldId: 'custrecord_dj_custpayment_error_flag',
                value: true
            });
            headRecord.commitLine({
                sublistId: 'recmachcustrecord_dj_custpayment_m_id'
            });

        }

        function doSetApplyInvoice(customerPaymentRecordId, fromDate, toDate, payment) {

            try {
                var customerPaymentRecord = record.load({
                    type: "customerpayment",
                    id: customerPaymentRecordId
                })
                var sublistCount = customerPaymentRecord.getLineCount({sublistId: 'apply'});
                log.debug('doSetApplyInvoice apply sublistCount', sublistCount);
                for (var i = 0; i < sublistCount; i++) {
                    log.debug('doSetApplyInvoice payment', payment);
                    if (payment <= 0) {
                        customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'apply',
                            line: i,
                            value: false
                        });
                        continue;
                    }
                    // var applydate = customerPaymentRecord.getSublistValue({
                    //     sublistId: 'apply',
                    //     fieldId: 'applydate',
                    //     line: i
                    // });
                    var duedate = customerPaymentRecord.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'duedate',
                        line: i
                    });

                    log.debug('duedate befor format', duedate);
                    duedate = format.format({value: duedate, type: format.Type.DATE});
                    log.debug('duedate after format', duedate);
                    log.debug('fromDate', fromDate);
                    log.debug('toDate', toDate);
                    log.debug('dateCheck(fromDate, toDate, duedate)', dateCheck(fromDate, toDate, duedate));
                    if (dateCheck(fromDate, toDate, duedate)) {
                        customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'apply',
                            line: i,
                            value: true
                        });
                        var totalAmount = customerPaymentRecord.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'total',
                                line: i
                            });
                        log.debug('doSetApplyInvoice totalAmount', totalAmount);
                        customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'amount',
                            line: i,
                            value: (payment >= totalAmount ? totalAmount: payment)
                        });
                        payment = payment - totalAmount;
                        log.debug('doSetApplyInvoice payment', payment);
                    } else {
                        customerPaymentRecord.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'apply',
                            line: i,
                            value: false
                        });
                    }
                }
                customerPaymentRecord.save({ignoreMandatoryFields: true});
            } catch (e) {
                log.error('doSetApplyInvoice: ' + e.name, e.message);
            }
        }

        //check true if check between two date
        function dateCheck(from, to, check) {
            try {
                var fDate, lDate, cDate;
                // fDate = Date.parse(from);
                // lDate = Date.parse(to);
                cDate = Date.parse(check);

                if (!me.isEmpty(from)
                    && !me.isEmpty(to)
                    && cDate >= Date.parse(from)
                    && cDate <= Date.parse(to)) {

                    return true;
                } else if(me.isEmpty(from)
                    && !me.isEmpty(to)
                    && cDate <= Date.parse(to)){

                    return true;
                } else if(!me.isEmpty(from)
                    && me.isEmpty(to)
                    && cDate >= Date.parse(from)) {

                    return true;
                } else if(me.isEmpty(from)
                    && me.isEmpty(to)) {

                    return true;
                }

                // if ((cDate <= lDate && cDate >= fDate)) {
                //     return true;
                // }
                return false;
            } catch (e) {
                log.error('dateCheck: ' + e.name, e.message);
            }
        }

        function getSetting() {
            try {
                var mysearch = search.create({
                    type: 'customrecord_dj_custpayment_setting',
                    columns: [
                        'custrecord_dj_custpayment_setting_acc',
                        'custrecord_dj_cuspm_setting_acc_tax_plus',
                        'custrecord_dj_cuspm_seting_acc_tax_minus',
                        'custrecord_dj_custpayment_setting_taxco',
                        'custrecord_dj_custpayment_setting_taxca',
                        'custrecord_dj_custpayment_setting_error',
                        'custrecord_dj_custpayment_setting_plus',
                        'custrecord_dj_custpayment_setting_minus',
                    ]
                });
                var resultSet = mysearch.run();
                return (resultSet);
            } catch (e) {
                log.error('getSetting: ' + e.name, e.message);
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

        function doGetAccountPreference(config) {
            try {
                var config = config.load({type: config.Type.ACCOUNTING_PREFERENCES});
                var salesDiscAcct = config.getValue({fieldId: 'SALESDISCACCT'});
                // var salesDiscAcct = config.getValue({fieldId: 'ARACCOUNT'});
                return salesDiscAcct;
            } catch (e) {
                log.error('doGetAccountPreference: ' + e.name, e.message);
            }
        }
        
        /**
         *[key value] get from reduce of context.key and context.value
         * @param summary
         */
        function summarize(summary) {
            log.debug('summary', summary);
            handleErrorIfAny(summary);
            var contents = '';
            // //[key value] get from reduce of context.key and context.value
            summary.output.iterator().each(function(key, value) {
                contents += (key + ': ' + value + '\n');
                return true;
            });
            log.debug('summarize', contents);

        }
        function handleErrorInStage(stage, summary) {
            var errorMsg = [];
            summary.errors.iterator().each(function(key, value){
                var msg = 'Failure to accept payment from customer id: ' + key + '. Error was: ' + JSON.parse(value).message + '\n';
                errorMsg.push(msg);
                return true;
            });
            if (errorMsg.length > 0) {
                var e = error.create({
                    name: 'RECORD_TRANSFORM_FAILED', message: JSON.stringify(errorMsg)
                });

                handleErrorAndSendNotification(e, stage);
            }
        }



        function handleErrorIfAny(summary) {
            var inputSummary = summary.inputSummary;
            var mapSummary = summary.mapSummary;
            var reduceSummary = summary.reduceSummary;
            // record.submitFields({
            //     type: 'customrecord_dj_custpayment_management',
            //     id: value,
            //     values: {
            //         custrecord_dj_custpayment_status: '4'
            //     }
            // });
            if (inputSummary && inputSummary.error) {
                var e = error.create({
                    name: 'INPUT_STAGE_FAILED', message: inputSummary.error
                });
                handleErrorAndSendNotification(e, 'getInputData');

            }
            handleErrorInStage('map', mapSummary);
            handleErrorInStage('reduce', reduceSummary);
        }

        function handleErrorAndSendNotification(e, stage) {
            log.error('Stage: ' + stage + ' failed', e);
            var author = -5;
            var recipients = 'hminhduc@gmail.com';
            var subject = 'Map/Reduce script ' + runtime.getCurrentScript().id + ' failed for stage: ' + stage;
            var body = 'An error occurred with the following information:\n' +
                'Error code: ' + e.name + '\n' + 'Error msg: ' + e.message;
            email.send({
                author: author,
                recipients: recipients,
                subject: subject,
                body: body
            });
        }

        /**
         * カスタム入金票_債権リスト_明細
         * @returns {ResultSet|*}
         */
        function getInvoiceList(){
            var mysearch = search.load({
                id: 'customsearch_custpayment_invoice_detail'
            });
            var resultSet = mysearch.run();
            return( resultSet );
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize,
            config:{
                exitOnError: true
            }
        };
    });