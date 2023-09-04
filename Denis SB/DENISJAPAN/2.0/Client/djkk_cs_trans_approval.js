/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/runtime'], function(search, runtime) {

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

        var curRecord = scriptContext.currentRecord;

        // カスタムフォーム
        var customForm = curRecord.getValue({
            fieldId : 'customform'
        });

        if ('176' == customForm) {
            if (scriptContext.fieldId == 'custbody_djkk_trans_appr_deal_flg') {
                var apprDealFlg = curRecord.getValue({
                    fieldId : 'custbody_djkk_trans_appr_deal_flg'
                });
                if (!apprDealFlg) {
                    // DJ_作成ロール
                    curRecord.setValue({
                        fieldId : 'custbody_djkk_trans_appr_create_role',
                        value : ''
                    });
                    // DJ_作成者
                    curRecord.setValue({
                        fieldId : 'custbody_djkk_trans_appr_create_user',
                        value : ''
                    });
                    // DJ_次の承認ロール
                    curRecord.setValue({
                        fieldId : 'custbody_djkk_trans_appr_next_role',
                        value : ''
                    });
                    // DJ_承認ルール
                    curRecord.setValue({
                        fieldId : 'custbody_djkk_appr_rule',
                        value : ''
                    });
                }
            }
            if (scriptContext.fieldId == 'custbody_djkk_appr_rule') {

                var apprDealFlg = curRecord.getValue({
                    fieldId : 'custbody_djkk_trans_appr_deal_flg'
                });
                if (apprDealFlg) {
                    var curUser = runtime.getCurrentUser();
                    var subsidiary = curRecord.getValue({
                        fieldId : 'subsidiary'
                    });
                    if (!subsidiary) {
                        alert('子会社を入力してください。');
                        return false;
                    }
                    var approvalObj = '11';
                    var dealKbn = '1';
                    var apprRule = curRecord.getValue({
                        fieldId : 'custbody_djkk_appr_rule'
                    });
                    var resultObj = getDealRole(subsidiary, approvalObj, dealKbn, apprRule);
                    if (resultObj) {
                        var createRole = resultObj.createRole;
                        // DJ_作成ロール
                        curRecord.setValue({
                            fieldId : 'custbody_djkk_trans_appr_create_role',
                            value : resultObj.createRole
                        });
                        // DJ_作成者
                        curRecord.setValue({
                            fieldId : 'custbody_djkk_trans_appr_create_user',
                            value : curUser.id
                        });
                        // DJ_次の承認ロール
                        var nextRole = resultObj.role;
                        curRecord.setValue({
                            fieldId : 'custbody_djkk_trans_appr_next_role',
                            value : nextRole
                        });
                    }
                }
            }
        }
    }

    /**
     * Validation function to be executed when record is saved.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     * @since 2015.2
     */
    function saveRecord(scriptContext) {

        var curRecord = scriptContext.currentRecord;

        // カスタムフォーム
        var customForm = curRecord.getValue({
            fieldId : 'customform'
        });

        if ('176' == customForm) {
            var apprDealFlg = curRecord.getValue({
                fieldId : 'custbody_djkk_trans_appr_deal_flg'
            });
            if (apprDealFlg) {
                var apprRule = curRecord.getValue({
                    fieldId : 'custbody_djkk_appr_rule'
                });
                if (!apprRule) {
                    alert('DJ_承認ルールを入力してください。');
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 承認対象データを取得する
     */
    function getDealRole(subsidiary, approvalObj, dealKbn, apprRule) {

        var resultObj = {};

        var searchType = 'customrecord_djkk_trans_approval_manage';

        var searchFilters = [];
        searchFilters.push(["isinactive", "is", "F"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_obj", "noneof", "@NONE@"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_create_role", "noneof", "@NONE@"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr1_role", "noneof", "@NONE@"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_subsidiary", "anyof", subsidiary]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_obj", "anyof", approvalObj]);
        if (apprRule) {
            searchFilters.push("AND");
            searchFilters.push(["internalid", "anyof", apprRule]);
        }

        var searchColumns = [
        // 作成ロール
        search.createColumn({
            name : "custrecord_djkk_trans_appr_create_role"
        }),
        // 第一承認ロール
        search.createColumn({
            name : "custrecord_djkk_trans_appr1_role"
        }),
        // 第二承認ロール
        search.createColumn({
            name : "custrecord_djkk_trans_appr2_role"
        }),
        // 第三承認ロール
        search.createColumn({
            name : "custrecord_djkk_trans_appr3_role"
        }),
        // 第四承認ロール
        search.createColumn({
            name : "custrecord_djkk_trans_appr4_role"
        }),
        // 第二承認条件(円以上)
        search.createColumn({
            name : "custrecord_djkk_trans_appr2_cdtn_amt"
        }),
        // 第三承認条件(円以上)
        search.createColumn({
            name : "custrecord_djkk_trans_appr3_cdtn_amt"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        log.error('searchResults', searchResults);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpResult = searchResults[i];
                var tmpValue = '';
                var tmpAmt = null;
                tmpValue = tmpResult.getValue(searchColumns[0]);
                resultObj.createRole = tmpValue;
                tmpValue = tmpResult.getValue(searchColumns[1]);
                resultObj.role = tmpValue;
                resultObj.cdtnAmt = '';
            }
        }

        return resultObj;
    }

    /**
     * 検索共通メソッド
     */
    function createSearch(searchType, searchFilters, searchColumns) {

        var resultList = [];
        var resultIndex = 0;
        var resultStep = 1000;

        var objSearch = search.create({
            type : searchType,
            filters : searchFilters,
            columns : searchColumns
        });
        var objResultSet = objSearch.run();

        do {
            var results = objResultSet.getRange({
                start : resultIndex,
                end : resultIndex + resultStep
            });

            if (results.length > 0) {
                resultList = resultList.concat(results);
                resultIndex = resultIndex + resultStep;
            }
        } while (results.length == 1000);

        return resultList;
    }

    return {
        fieldChanged : fieldChanged,
        saveRecord : saveRecord
    };
});
