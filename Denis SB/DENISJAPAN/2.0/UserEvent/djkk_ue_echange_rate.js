/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record'], function(runtime, record) {

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

        if (scriptContext.type == 'delete') {

            // DJ_予約為替レート_仕訳帳
            var journalentryId = newRecord.getValue({
                fieldId : 'custbody_dj_reserved_exchange_rate_jou'
            });

            if (journalentryId) {
                record['delete']({
                    type : 'journalentry',
                    id : journalentryId
                })
            }
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

        if (scriptContext.type == 'delete') {
            return;
        }

        var newRecord = scriptContext.newRecord;

        // DJ_円建
        var yenAmount = newRecord.getValue({
            fieldId : 'custbody_dj_reserved_exchange_rate_yen'
        });

        if (yenAmount) {

            newRecord = record.load({
                type : newRecord.type,
                id : newRecord.id,
                isDynamic : true
            });

            // 為替レート
            var defaultRate = newRecord.getValue({
                fieldId : 'exchangerate'
            });

            // レコードタイプ
            var totalAmount = 0;
            var diffAmount1 = 0;
            var account = '';
            var custAcc = '';
            var recType = newRecord.type;
            if (recType == 'vendorprepayment') {

                // 支払額
                totalAmount = newRecord.getValue({
                    fieldId : 'payment'
                });

                // 勘定科目
                var acc1 = newRecord.getValue({
                    fieldId : 'account'
                });

                // 前払勘定
                var acc2 = newRecord.getValue({
                    fieldId : 'prepaymentaccount'
                });

                // 金額
                var defaultAmount = defaultRate * totalAmount;
                var sagakuAmount = yenAmount - defaultAmount;
                if (sagakuAmount == 0 || sagakuAmount == 0.0) {
                    return;
                }

                if (sagakuAmount > 0) {
                    diffAmount1 = sagakuAmount;
                    account = acc1;
                    custAcc = acc2;
                } else if (sagakuAmount < 0) {
                    diffAmount1 = Math.abs(sagakuAmount);
                    account = acc2;
                    custAcc = acc1;
                }
            } else {

                var lineCount = newRecord.getLineCount({
                    sublistId : 'apply'
                });
                for (var i = 0; i < lineCount; i++) {

                    // 適用
                    var flg = newRecord.getSublistValue({
                        sublistId : 'apply',
                        fieldId : 'apply',
                        line : i
                    });

                    if (flg) {
                        // 支払
                        var amount = newRecord.getSublistValue({
                            sublistId : 'apply',
                            fieldId : 'amount',
                            line : i
                        });
                        totalAmount += isNaN(parseFloat(amount)) ? 0 : parseFloat(amount);
                    }
                }

                // 勘定科目
                var acc1 = newRecord.getValue({
                    fieldId : 'account'
                });

                // 買掛金勘定
                var acc2 = newRecord.getValue({
                    fieldId : 'apacct'
                });

                // 金額
                var defaultAmount = defaultRate * totalAmount;
                var sagakuAmount = yenAmount - defaultAmount;
                if (sagakuAmount == 0 || sagakuAmount == 0.0) {
                    return;
                }
                log.debug('defaultRate', defaultRate);
                log.debug('totalAmount', totalAmount);
                log.debug('defaultAmount', defaultAmount);
                log.debug('sagakuAmount', sagakuAmount);
                if (sagakuAmount > 0) {
                    diffAmount1 = sagakuAmount;
                    account = acc1;
                    custAcc = acc2;
                } else if (sagakuAmount < 0) {
                    diffAmount1 = Math.abs(sagakuAmount);
                    account = acc2;
                    custAcc = acc1;
                }
            }

            // DJ_予約為替レート_仕訳帳
            var journalentryId = newRecord.getValue({
                fieldId : 'custbody_dj_reserved_exchange_rate_jou'
            });

            if (journalentryId) {
                record['delete']({
                    type : 'journalentry',
                    id : journalentryId
                })
            }

            // DJ_外貨支払データ作成
            var dataCreateFlg = newRecord.getValue({
                fieldId : 'custbody_dj_reserved_exchange_rate_f'
            });

            // 仕訳作成
            var newJournalRecord = record.create({
                type : 'journalentry'
            });

            // 転記
            if (dataCreateFlg) {

                newJournalRecord.setValue({
                    fieldId : 'approvalstatus',
                    value : '2'
                });
            }

            // 子会社
            var subsidiary = newRecord.getValue({
                fieldId : 'subsidiary'
            })
            if (subsidiary) {
                newJournalRecord.setValue({
                    fieldId : 'subsidiary',
                    value : subsidiary
                });
            } else {
                newJournalRecord.setValue({
                    fieldId : 'subsidiary',
                    value : runtime.getCurrentUser().subsidiary
                });
            }

            // （貸方）
            newJournalRecord.setSublistValue({
                sublistId : 'line',
                fieldId : 'credit',
                line : 0,
                value : diffAmount1
            })

            newJournalRecord.setSublistValue({
                sublistId : 'line',
                fieldId : 'account',
                line : 0,
                value : account
            });

            // （借方）
            newJournalRecord.setSublistValue({
                sublistId : 'line',
                fieldId : 'debit',
                line : 1,
                value : diffAmount1
            });

            newJournalRecord.setSublistValue({
                sublistId : 'line',
                fieldId : 'account',
                line : 1,
                value : custAcc
            });

            var journalId = newJournalRecord.save({
                ignoreMandatoryFields : true
            });

            newRecord.setValue({
                fieldId : 'custbody_dj_reserved_exchange_rate_jou',
                value : journalId
            });
            var id = newRecord.save();
            log.debug('finished ID：', id);
        } else {
            if (scriptContext.type == 'edit') {
                // DJ_予約為替レート_仕訳帳
                var journalentryId = newRecord.getValue({
                    fieldId : 'custbody_dj_reserved_exchange_rate_jou'
                });

                if (journalentryId) {
                    record['delete']({
                        type : 'journalentry',
                        id : journalentryId
                    })
                }
            }
        }
    }

    return {
        beforeSubmit : beforeSubmit,
        afterSubmit : afterSubmit
    };
});
