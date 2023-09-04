/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 * 入金管理の編集、誤差調整金額画面
 *
 * Version    Date            Author           Remarks
 * 1.00       2018/01/09      Astop            Initial
 *
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/search', 'N/ui/message', 'N/record', 'N/format', 'me'],

    function (dialog, currentRecord, search, message, record, format, me) {

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
            var currentRecord = scriptContext.currentRecord;
            var numLines = currentRecord.getLineCount({
                sublistId: 'invoice_sub_list'
            });
            for (i = 0; i < numLines; i++) {
                /*var no_applicable = currentRecord.getSublistField({
                    sublistId: 'invoice_sub_list',
                    fieldId: 'sub_list_7',
                    line: i
                });
                no_applicable.isDisabled = true;*/

                /**
                 * 【「調整額」が空欄のとき】
                 「費用勘定科目」「消費税」「消費税カテゴリ」を表示しない
                 ＝調整額に値があるときは表示する
                 or
                 「費用勘定科目」「消費税」「消費税カテゴリ」をグレーアウト
                 ＝調整額に値があるときはグレーアウトを解除
                 */
                var ajust_mount = currentRecord.getSublistValue({
                    sublistId: 'invoice_sub_list',
                    fieldId: 'sub_list_5',
                    line: i
                });
                if (me.isEmpty(ajust_mount)) {
                    currentRecord.getSublistField({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_8',
                        line: i
                    }).isDisabled = true;
                    currentRecord.getSublistField({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_9',
                        line: i
                    }).isDisabled = true;
                    currentRecord.getSublistField({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_10',
                        line: i
                    }).isDisabled = true;
                } else {
                    currentRecord.getSublistField({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_8',
                        line: i
                    }).isDisabled = false;
                    currentRecord.getSublistField({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_9',
                        line: i
                    }).isDisabled = false;
                    currentRecord.getSublistField({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_10',
                        line: i
                    }).isDisabled = false;
                }
            }
            //一番最初の行にデフォルトで? オン  checkbox2
            if (numLines > 0) {
                currentRecord.selectLine({
                    "sublistId": "invoice_sub_list",
                    "line": 0
                });
                /*currentRecord.setCurrentSublistValue({
                    "sublistId": "invoice_sub_list",
                    "fieldId": "sub_list_6",
                    "value": true
                });*/
                currentRecord.commitLine({
                    "sublistId": "invoice_sub_list"
                });
            }

        }

        function updateApplySumAmount(context) {
            try {
                var currentRecord = context.currentRecord;
                var sublistName = context.sublistId;
                var sublistFieldName = context.fieldId;
                var line = context.line;
                var numLines = currentRecord.getLineCount({
                    sublistId: 'invoice_sub_list'
                });

                var applySumAmount = 0;
                for (var i = 0; i < numLines; i++) {
                    var amount = currentRecord.getSublistValue({sublistId: 'invoice_sub_list', fieldId: 'sub_list_4', line: i});
                    if (me.isEmpty(amount))
                        amount = 0;
                    else
                        amount = format.parse({value: amount, type: format.Type.INTEGER});
                    applySumAmount += amount;
                }
                applySumAmount = format.format({value: applySumAmount, type: format.Type.INTEGER});
                currentRecord.setValue({
                    "fieldId": "applysumamount",
                    "value": applySumAmount
                });
            } catch (e) {
                console.log(e.message);
            }
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
        // var APPLYSUMAMOUNT = 0;
        function fieldChanged(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var line = scriptContext.line;
            var payment_id = currentRecord.getValue({
                fieldId: 'payment_id'
            });
            var numLines = currentRecord.getLineCount({
                sublistId: 'invoice_sub_list'
            });

            //store APPLYSUMAMOUNT
            if (line != null) {
                // チェック
                if (scriptContext.fieldId === 'sub_list_check') {
                    var check = currentRecord.getSublistValue({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_check',
                        line: line
                    });
                    if (check) {
                        var saikenAmount = currentRecord.getSublistValue({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_3',
                            line: line
                        });
                        /*if (!me.isEmpty(saikenAmount))
                            APPLYSUMAMOUNT += format.parse({value: saikenAmount, type: format.Type.INTEGER});*/
                        currentRecord.selectLine({
                            "sublistId": "invoice_sub_list",
                            "line": line
                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId: "invoice_sub_list",
                            fieldId: "sub_list_4",
                            value: saikenAmount
                        });
                        currentRecord.commitLine({
                            "sublistId": "invoice_sub_list"
                        });
                        //update to counter
                        /*currentRecord.setValue({
                            "fieldId": "applysumamount",
                            "value": format.format({value: APPLYSUMAMOUNT, type: format.Type.INTEGER})
                        });*/
                        updateApplySumAmount(scriptContext);
                    } else {//uncheck then clear
                        currentRecord.selectLine({
                            "sublistId": "invoice_sub_list",
                            "line": line
                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId: "invoice_sub_list",
                            fieldId: "sub_list_4",
                            value: ''
                        });
                        currentRecord.commitLine({
                            "sublistId": "invoice_sub_list"
                        });
                        /*var saikenAmount = currentRecord.getSublistValue({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_3',
                            line: line
                        });
                        if (!me.isEmpty(saikenAmount))
                            APPLYSUMAMOUNT -= format.parse({value: saikenAmount, type: format.Type.INTEGER});
                        //update to counter
                        currentRecord.setValue({
                            "fieldId": "applysumamount",
                            "value": format.format({value: APPLYSUMAMOUNT, type: format.Type.INTEGER})
                        });*/
                        updateApplySumAmount(scriptContext);
                    }
                }
                // 調整額
                if (scriptContext.fieldId === 'sub_list_5') {
                    /**
                     * 【「調整額」が空欄のとき】
                     「費用勘定科目」「消費税」「消費税カテゴリ」を表示しない
                     ＝調整額に値があるときは表示する
                     or
                     「費用勘定科目」「消費税」「消費税カテゴリ」をグレーアウト
                     ＝調整額に値があるときはグレーアウトを解除
                     */
                    var ajust_mount = currentRecord.getSublistValue({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_5',
                        line: line
                    });
                    if (ajust_mount === null || ajust_mount === '') {
                        currentRecord.getSublistField({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_8',
                            line: line
                        }).isDisabled = true;
                        currentRecord.getSublistField({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_9',
                            line: line
                        }).isDisabled = true;
                        currentRecord.getSublistField({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_10',
                            line: line
                        }).isDisabled = true;
                        //setTotal(payment_id, currentRecord);
                    } else {
                        currentRecord.getSublistField({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_8',
                            line: line
                        }).isDisabled = false;
                        currentRecord.getSublistField({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_9',
                            line: line
                        }).isDisabled = false;
                        currentRecord.getSublistField({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_10',
                            line: line
                        }).isDisabled = false;
                        //「調整額」に入力した数値は「合計」に加算する
                        //setTotal(payment_id, currentRecord);
                    }

                    var total = currentRecord.getValue({
                        fieldId: 'total_text'
                    });
                    total = getInt(total);
                    applicableamount = total;
                    var fee = currentRecord.getValue({
                        fieldId: 'fee'
                    });
                    if (!me.isEmpty(fee)) {
                        applicableamount = applicableamount - fee;
                    }
                    var calculation_error = currentRecord.getValue({
                        fieldId: 'calculation_error'
                    });
                    if (!me.isEmpty(calculation_error)) {
                        applicableamount = applicableamount - calculation_error;
                    }
                    for (i = 0; i < numLines; i++) {
                        var applied = currentRecord.getSublistValue({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_4',
                            line: i
                        });
                        var ajustmount = currentRecord.getSublistValue({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_5',
                            line: i
                        });
                        if (!me.isEmpty(ajustmount)) {
                            applicableamount = applicableamount - ajustmount;
                        }
                        if (!me.isEmpty(applied)) {
                            applicableamount = applicableamount - applied;
                        }
                    }
                    var applicable_amount = format.format({value: applicableamount, type: format.Type.INTEGER});
                    currentRecord.setValue({
                        "fieldId": "applicable_amount",
                        "value": applicable_amount
                    });
                }
                // 適用額
                if (scriptContext.fieldId === 'sub_list_4') {
                    var adjustment = currentRecord.getSublistValue({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_5',
                        line: line
                    });
                    var amountremaining = currentRecord.getSublistValue({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_3',
                        line: line
                    });
                    var applied = currentRecord.getSublistValue({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_4',
                        line: line
                    });
                    /*var no_applicable = 0
                    if (adjustment != null && adjustment != '') {
                        no_applicable = amountremaining - (applied + adjustment);
                    } else {
                        no_applicable = amountremaining - applied;
                    }
                    currentRecord.selectLine({
                        "sublistId": "invoice_sub_list",
                        "line": line
                    });
                    currentRecord.setCurrentSublistValue({
                        "sublistId": "invoice_sub_list",
                        "fieldId": "sub_list_7",
                        "value": no_applicable.toString()
                    });
                    currentRecord.commitLine({
                        "sublistId": "invoice_sub_list"
                    });*/

                    var total = currentRecord.getValue({
                        fieldId: 'total_text'
                    });
                    total = getInt(total);
                    applicableamount = total;
                    var fee = currentRecord.getValue({
                        fieldId: 'fee'
                    });
                    if (!me.isEmpty(fee)) {
                        applicableamount = applicableamount - fee;
                    }
                    var calculation_error = currentRecord.getValue({
                        fieldId: 'calculation_error'
                    });
                    if (!me.isEmpty(calculation_error)) {
                        applicableamount = applicableamount - calculation_error;
                    }
                    for (i = 0; i < numLines; i++) {
                        var applied = currentRecord.getSublistValue({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_4',
                            line: i
                        });
                        var ajustmount = currentRecord.getSublistValue({
                            sublistId: 'invoice_sub_list',
                            fieldId: 'sub_list_5',
                            line: i
                        });
                        if (!me.isEmpty(ajustmount)) {
                            applicableamount = applicableamount - ajustmount;
                        }
                        if (!me.isEmpty(applied)) {
                            applicableamount = applicableamount - applied;
                        }
                    }
                    var applicable_amount = format.format({
                        value: applicableamount,
                        type: format.Type.INTEGER
                    });
                    currentRecord.setValue({
                        "fieldId": "applicable_amount",
                        "value": applicable_amount
                    });
                    updateApplySumAmount(scriptContext);
                }
                //チェック２
                /*if (scriptContext.fieldId === 'sub_list_6') {
                    var check = currentRecord.getSublistValue({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_6',
                        line: line
                    });
                    var fee = currentRecord.getValue({
                        fieldId: 'fee'
                    });
                    var calculation_error = currentRecord.getValue({
                        fieldId: 'calculation_error'
                    });
                    var applied = currentRecord.getSublistValue({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_4',
                        line: line
                    });
                    /!*var no_applicable = currentRecord.getSublistValue({
                        "sublistId": "invoice_sub_list",
                        "fieldId": "sub_list_7",
                        line: line
                    });*!/
                    if (me.isEmpty(calculation_error)) {
                        calculation_error = 0;
                    }
                    if (me.isEmpty(fee)) {
                        fee = 0;
                    }
                    if (check) {
                        for (i = 0; i < numLines; i++) {
                            var checkLine = currentRecord.getSublistValue({
                                sublistId: 'invoice_sub_list',
                                fieldId: 'sub_list_6',
                                line: i
                            });
                            var appliedLine = currentRecord.getSublistValue({
                                sublistId: 'invoice_sub_list',
                                fieldId: 'sub_list_4',
                                line: i
                            });
                            /!*var no_applicableLine = currentRecord.getSublistValue({
                                "sublistId": "invoice_sub_list",
                                "fieldId": "sub_list_7",
                                line: i
                            });*!/
                            if (i !== line) {
                                if (checkLine) {
                                    currentRecord.selectLine({
                                        "sublistId": "invoice_sub_list",
                                        "line": i
                                    });
                                    currentRecord.setCurrentSublistValue({
                                        "sublistId": "invoice_sub_list",
                                        "fieldId": "sub_list_6",
                                        "value": false
                                    });
                                    currentRecord.commitLine({
                                        "sublistId": "invoice_sub_list"
                                    });
                                }
                            }
                        }
                    }
                }*/
            }
            //手数料または計算誤差
            if (scriptContext.fieldId == 'fee' || scriptContext.fieldId == 'calculation_error') {
                var total = currentRecord.getValue({
                    fieldId: 'total_text'
                });
                total = getInt(total);
                applicableamount = total;
                var fee = currentRecord.getValue({
                    fieldId: 'fee'
                });
                if (!me.isEmpty(fee)) {
                    applicableamount = applicableamount - fee;
                }
                var calculation_error = currentRecord.getValue({
                    fieldId: 'calculation_error'
                });
                if (!me.isEmpty(calculation_error)) {
                    applicableamount = applicableamount - calculation_error;
                }
                for (i = 0; i < numLines; i++) {
                    var ajustmount = currentRecord.getSublistValue({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_5',
                        line: i
                    });
                    /*var check = currentRecord.getSublistValue({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_6',
                        line: i
                    });*/
                    var applied = currentRecord.getSublistValue({
                        sublistId: 'invoice_sub_list',
                        fieldId: 'sub_list_4',
                        line: i
                    });
                    /*var no_applicable = currentRecord.getSublistValue({
                        "sublistId": "invoice_sub_list",
                        "fieldId": "sub_list_7",
                        line: i
                    });*/
                    if (me.isEmpty(calculation_error)) {
                        calculation_error = 0;
                    }
                    if (me.isEmpty(fee)) {
                        fee = 0;
                    }
                    if (!me.isEmpty(applied)) {
                        applicableamount = applicableamount - applied;
                    }
                    if (!me.isEmpty(ajustmount)) {
                        applicableamount = applicableamount - ajustmount;
                    }
                }
                var applicable_amount = format.format({
                    value: applicableamount,
                    type: format.Type.INTEGER
                });
                currentRecord.setValue({
                    "fieldId": "applicable_amount",
                    "value": applicable_amount
                });
            }
        }

        function getInt(stringNumber) {
            stringNumber = stringNumber.split(",");
            var stringtotal = '';
            stringNumber.forEach(function (item, index) {
                stringtotal = stringtotal + item;
            });
            stringNumber = parseInt(stringtotal);
            return stringNumber;
        }

        /*        /!**
                 * Function to be executed when field is slaved.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 * @param {string} scriptContext.fieldId - Field name
                 *
                 * @since 2015.2
                 *!/
                function postSourcing(scriptContext) {

                }

                /!**
                 * Function to be executed after sublist is inserted, removed, or edited.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 *
                 * @since 2015.2
                 *!/
                function sublistChanged(scriptContext) {
                }

                /!**
                 * Function to be executed after line is selected.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 *
                 * @since 2015.2
                 *!/
                function lineInit(scriptContext) {

                }

                /!**
                 * Validation function to be executed when field is changed.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 * @param {string} scriptContext.fieldId - Field name
                 * @param {number} scriptContext.line - Line number. Will be undefined if not a sublist or matrix field
                 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
                 *
                 * @returns {boolean} Return true if field is valid
                 *
                 * @since 2015.2
                 *!/
                function validateField(scriptContext) {
                    return true;
                }

                /!**
                 * Validation function to be executed when sublist line is committed.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 *
                 * @returns {boolean} Return true if sublist line is valid
                 *
                 * @since 2015.2
                 *!/
                function validateLine(scriptContext) {
                    return true;
                }

                /!**
                 * Validation function to be executed when sublist line is inserted.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 *
                 * @returns {boolean} Return true if sublist line is valid
                 *
                 * @since 2015.2
                 *!/
                function validateInsert(scriptContext) {
                    return true;
                }

                /!**
                 * Validation function to be executed when record is deleted.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 *
                 * @returns {boolean} Return true if sublist line is valid
                 *
                 * @since 2015.2
                 *!/
                function validateDelete(scriptContext) {
                    return true;
                }*/

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        var IS_CONFIRMED = false;
        var CHECKOK = false;

        function saveRecord(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var checCase1 = false;
            var checkCase2 = false;
            // var checkCase3 = false;
            // var checkFeeError = false;
            var numLines = currentRecord.getLineCount({
                sublistId: 'invoice_sub_list'
            });
            /*var fee = currentRecord.getValue({
                fieldId: 'fee'
            });
            var calculation_error = currentRecord.getValue({
                fieldId: 'calculation_error'
            });*/
            /*if (!me.isEmpty(fee) || !me.isEmpty(calculation_error)) {
                checkFeeError = true;
            }*/
            for (i = 0; i < numLines; i++) {
                var check = currentRecord.getSublistValue({
                    sublistId: 'invoice_sub_list',
                    fieldId: 'sub_list_check',
                    line: i
                });
                // 適用額
                var appliedLine = currentRecord.getSublistValue({
                    sublistId: 'invoice_sub_list',
                    fieldId: 'sub_list_4',
                    line: i
                });
                /*var check2 = currentRecord.getSublistValue({
                    sublistId: 'invoice_sub_list',
                    fieldId: 'sub_list_6',
                    line: i
                });*/
                if (!check && !me.isEmpty(appliedLine)) {
                    checCase1 = true;
                }
                if (check && me.isEmpty(appliedLine)) {
                    checkCase2 = true;
                }
                /*if (check2) {
                    checkCase3 = true;
                }*/
            }
            if (checkCase2) {
                var options = {
                    title: 'Caution',
                    message: '自動消込を行う場合、適用額を入力する必要があります。',
                };

                function success(result) {
                    console.log("Success: " + result);
                }

                function failure(reason) {
                    console.log("Failure: " + reason);
                }

                dialog.alert(options).then(success).catch(failure);
                return false;
            } /*else if (!checkCase3 && checkFeeError) {
                var options = {
                    title: 'Caution',
                    message: '手数料や計算誤差が発生している場合、その負担額を適用する請求書を1つ選択する必要があります。',
                };

                function success(result) {
                    console.log("Success: " + result);
                }

                function failure(reason) {
                    console.log("Failure: " + reason);
                }

                dialog.alert(options).then(success).catch(failure);
                return false;
            }*/ else if (checCase1) {
                if (!IS_CONFIRMED) {
                    var options = {
                        title: 'Caution',
                        message: '適用チェックを外した入金内容は自動消込が行われませんが、よろしいですか？',
                        //buttons: [button1, button2, button3]
                    };

                    function success(result) {
                        IS_CONFIRMED = true;
                        CHECKOK = result;
                        document.getElementById("submitter").click();
                    }

                    function failure(reason) {
                        console.log("Failure: " + reason);
                    }

                    dialog.confirm(options).then(success).catch(failure);
                } else {
                    IS_CONFIRMED = false;
                    return CHECKOK;
                }
            } else {
                return true;
            }
        }

        function btnReturnButton() {
            window.history.go(-1);
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
            btnReturnButton: btnReturnButton
        };

    });
