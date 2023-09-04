/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope
 */
define(['SuiteScripts/DENISJAPAN/2.0/Common/djkk_common'], function(djkk_common) {

    /**
     * Function to be executed after page is initialized.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     * @since 2015.2
     */
    function pageInit(scriptContext) {

        if (scriptContext.mode != 'edit') {

            var curRec = scriptContext.currentRecord;
            // トランザクション種類取得
            var tstype = curRec.getValue({
                fieldId : 'type'
            });
            if ((tstype == 'purchord' && scriptContext.mode == 'copy') || tstype == 'itemrcpt' || tstype == 'vendbill' || tstype == 'vendpymt' || tstype == 'vprep') {
                var jpyCurrencyFlg = djkk_common.getGamenJpyCurrencyCheck(curRec);
                if (!jpyCurrencyFlg) {
                    // 日付を取得する
                    var tranDate = curRec.getValue({
                        fieldId : 'trandate'
                    });
                    // 通貨
                    var currency = curRec.getValue({
                        fieldId : 'currency'
                    });
                    if (tranDate && currency) {
                        var strDate = djkk_common.toStrDate(tranDate);
                        var syanaiRate = djkk_common.getSyanaiRate(strDate, currency);
                        if (syanaiRate) {
                            curRec.setValue({
                                fieldId : 'exchangerate',
                                value : syanaiRate,
                                ignoreFieldChange : true
                            });
                        } else {
                            curRec.setValue({
                                fieldId : 'exchangerate',
                                value : '',
                                ignoreFieldChange : true
                            });
                        }
                        window.ischanged = true;
                    }
                }
            }
        }
        // 社内レートボタンを追加する
        // exchangeRateBtn(curRec);
    }

    /**
     * Function to be executed when field is changed.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

        var curRec = scriptContext.currentRecord;
        if (scriptContext.fieldId == 'entity') {
            // トランザクション種類取得
            var tstype = curRec.getValue({
                fieldId : 'type'
            });
            if (tstype == 'purchord' || tstype == 'vendbill' || tstype == 'vendpymt') {
                var jpyCurrencyFlg = djkk_common.getGamenJpyCurrencyCheck(curRec);
                if (!jpyCurrencyFlg) {

                    // 日付を取得する
                    var tranDate = curRec.getValue({
                        fieldId : 'trandate'
                    });
                    // 通貨
                    var currency = curRec.getValue({
                        fieldId : 'currency'
                    });
                    if (tranDate && currency) {
                        var strDate = djkk_common.toStrDate(tranDate);
                        var syanaiRate = djkk_common.getSyanaiRate(strDate, currency);
                        if (syanaiRate) {
                            curRec.setValue({
                                fieldId : 'exchangerate',
                                value : syanaiRate,
                                ignoreFieldChange : true
                            });
                        } else {
                            curRec.setValue({
                                fieldId : 'exchangerate',
                                value : '',
                                ignoreFieldChange : true
                            });
                        }
                    } else {
                        curRec.setValue({
                            fieldId : 'exchangerate',
                            value : '',
                            ignoreFieldChange : true
                        });
                    }
                    window.ischanged = true;
                }
            }
        }
    }

    /**
     * 社内レートボタンを追加する
     */
    function exchangeRateBtn(curRec) {

        var efvObj = document.getElementById("exchangerate_formattedValue");
        if (efvObj) {
            var parentEfvObj = efvObj.parentNode;
            var createObj = document.createElement('a');
            createObj.setAttribute("href", "javascript:void(0)");
            createObj.style.marginRight = '8px';
            var jpyCurrencyFlg = djkk_common.getGamenJpyCurrencyCheck(curRec);
            if (jpyCurrencyFlg) {
                createObj.innerHTML = '<button id="custpage_btn_rate_change" type="button" style="display:none" onclick="dealExchangeRate();" onsubmit="return false;">社内レート</button>';
            } else {
                createObj.innerHTML = '<button id="custpage_btn_rate_change" type="button" onclick="dealExchangeRate();" onsubmit="return false;">社内レート</button>';
            }

            parentEfvObj.insertBefore(createObj, efvObj);
        }
    }

    /**
     * Function to be executed when field is slaved.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

        if (!scriptContext.sublistId && (scriptContext.fieldId == 'currency' || scriptContext.fieldId == 'trandate') || scriptContext.fieldId == 'subsidiary') {

            var curRec = scriptContext.currentRecord;
            // トランザクション種類取得
            var tstype = curRec.getValue({
                fieldId : 'type'
            });
            if (tstype == 'purchord' || tstype == 'itemrcpt' || tstype == 'vendbill' || tstype == 'vendpymt' || tstype == 'vprep') {
                var jpyCurrencyFlg = djkk_common.getGamenJpyCurrencyCheck(curRec);
                if (!jpyCurrencyFlg) {

                    // 日付を取得する
                    var tranDate = curRec.getValue({
                        fieldId : 'trandate'
                    });
                    // 通貨
                    var currency = curRec.getValue({
                        fieldId : 'currency'
                    });
                    if (tranDate && currency) {
                        var strDate = djkk_common.toStrDate(tranDate);
                        var syanaiRate = djkk_common.getSyanaiRate(strDate, currency);
                        if (syanaiRate) {
                            curRec.setValue({
                                fieldId : 'exchangerate',
                                value : syanaiRate,
                                ignoreFieldChange : true
                            });
                        } else {
                            curRec.setValue({
                                fieldId : 'exchangerate',
                                value : '',
                                ignoreFieldChange : true
                            });
                        }
                    } else {
                        curRec.setValue({
                            fieldId : 'exchangerate',
                            value : '',
                            ignoreFieldChange : true
                        });
                    }
                    window.ischanged = true;
                }
            }
        }
    }

    return {
        pageInit : pageInit,
        fieldChanged : fieldChanged,
        postSourcing : postSourcing
    };
});

/**
 * 社内レートデータを処理する
 */
function dealExchangeRate() {

    require(['N/currentRecord', 'N/ui/dialog', 'SuiteScripts/DENISJAPAN/2.0/Common/djkk_common'], function(currentRecord, dialog, djkk_common) {
        var curRec = currentRecord.get();

        // 日付を取得する
        var tranDate = curRec.getValue({
            fieldId : 'trandate'
        });

        if (!tranDate) {
            dialog.alert({
                title : 'チェック',
                message : '発注日を入力してください。'
            });
            return true;
        }

        // 通貨
        var currency = curRec.getValue({
            fieldId : 'currency'
        });

        var strDate = djkk_common.toStrDate(tranDate);
        var syanaiRate = djkk_common.getSyanaiRate(strDate, currency);
        if (syanaiRate) {
            curRec.setValue({
                fieldId : 'exchangerate',
                value : syanaiRate,
                ignoreFieldChange : true
            });
        } else {
            dialog.alert({
                title : 'チェック',
                message : '当期社内レートがありますので、ご確認ください。'
            });
        }
    });
}
