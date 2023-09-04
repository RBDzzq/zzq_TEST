/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/search', 'N/redirect'], function(runtime, search, redirect) {

    // 作成区分
    var KBN_CREATE = '1';
    // 第一承認
    var KBN_APPROVAL1 = '2';
    // 第二承認
    var KBN_APPROVAL2 = '3';
    // 第三承認
    var KBN_APPROVAL3 = '4';
    // 第四承認
    var KBN_APPROVAL4 = '5';

    // フィールドマッピング
    var FIELD_MAPPING = {};
    var TRANS_LIST = [];
    TRANS_LIST.push('custbody_djkk_trans_appr_deal_flg');// 0
    TRANS_LIST.push('custbody_djkk_trans_appr_create_role');// 1
    TRANS_LIST.push('custbody_djkk_trans_appr_create_user');// 2
    TRANS_LIST.push('custbody_djkk_trans_appr_next_role');// 3
    TRANS_LIST.push('custbody_djkk_trans_appr_cdtn_amt');// 4

    var ARRIVAL_LIST = [];
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_deal_flg');// 0
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_create_role');// 1
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_create_user');// 2
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_next_role');// 3
    ARRIVAL_LIST.push('');// 4

    // 見積書
    FIELD_MAPPING['1'] = TRANS_LIST;
    // 注文書
    FIELD_MAPPING['2'] = TRANS_LIST;
    // 前受金
    FIELD_MAPPING['3'] = TRANS_LIST;
    // 顧客返品
    FIELD_MAPPING['4'] = TRANS_LIST;
    // クレジットメモ
    FIELD_MAPPING['5'] = TRANS_LIST;
    // 発注書
    FIELD_MAPPING['6'] = TRANS_LIST;
    // 支払請求書
    FIELD_MAPPING['7'] = TRANS_LIST;
    // 仕入先返品
    FIELD_MAPPING['8'] = TRANS_LIST;
    // 前払金/買掛金調整
    FIELD_MAPPING['9'] = TRANS_LIST;
    // 到着荷物
    FIELD_MAPPING['10'] = ARRIVAL_LIST;
    // 請求書
    FIELD_MAPPING['11'] = TRANS_LIST;

    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {

        var newRecord = scriptContext.newRecord;
        var form = scriptContext.form;

        var script = runtime.getCurrentScript();
        var currentUser = runtime.getCurrentUser();
        var currentRole = currentUser.role.toString();
        log.error('currentRole', currentRole);
        /* not user subsidiary,is role subsidiary */
        /* old code */// var subsidiary =currentUser.subsidiary;
        var subsidiary = newRecord.getValue('subsidiary');
        log.error('trans subsidiary', subsidiary);
        // タイプ
        var type = scriptContext.type;
        log.error('type', type);

        if (!(type == 'edit' && currentRole == '1022')) {
            var roleSearchFitle = [];
            roleSearchFitle.push(["custrecord_djkk_role_id", "is", currentRole]);
            var roleSearchColumns = [search.createColumn({
                name : "custrecord_djkk_role_syokuseki"
            })];
            var searchResults = createSearch('customrecord_djkk_role_subsidiary', roleSearchFitle, roleSearchColumns);
            if (searchResults && searchResults.length > 0) {
                subsidiary = searchResults[0].getValue(roleSearchColumns[0]);
            }
        }

        log.error('role subsidiary', subsidiary);
        var currentUserId = currentUser.id;

        // 承認対象
        var approvalObj = script.getParameter({
            name : 'custscript_djkk_trans_appr_obj'
        });

        // 処理区分
        var dealKbn = script.getParameter({
            name : 'custscript_djkk_trans_deal_kbn'
        });
        log.error('approvalObj', approvalObj);
        log.error('dealKbn', dealKbn);

        if (type == 'create' || type == 'edit' || type == 'view') {
            var fieldList = FIELD_MAPPING[approvalObj];
            var apprDealFlg = newRecord.getValue(fieldList[0]);
            if (apprDealFlg) {
                if (dealKbn && approvalObj) {
                    if (dealKbn == KBN_CREATE) {
                        var resultObj = getDealRole(subsidiary, approvalObj, dealKbn, currentRole);
                        var createRole = resultObj.createRole;
                        log.error('createRole', createRole);
                        if (createRole && createRole == currentRole) {
                            // DJ_作成ロール
                            newRecord.setValue({
                                fieldId : fieldList[1],
                                value : resultObj.createRole
                            });
                            // DJ_作成者
                            newRecord.setValue({
                                fieldId : fieldList[2],
                                value : currentUserId
                            });
                            // DJ_次の承認ロール
                            var nextRole = resultObj.role;
                            newRecord.setValue({
                                fieldId : fieldList[3],
                                value : nextRole
                            });
                            if (nextRole) {
                                var tmpUsreList = [];
                                var tmpStrCuser = String(currentUserId);
                                tmpUsreList.push(tmpStrCuser);
                                var tmpCreateUserId = newRecord.getValue(fieldList[2]);
                                if (tmpCreateUserId) {
                                    var tmpCUserId = String(tmpCreateUserId);
                                    if (tmpStrCuser != tmpCUserId) {
                                        tmpUsreList.push(tmpCUserId);
                                    }
                                }
                                getApprNextUser(form, nextRole, currentRole, tmpUsreList);
                            }
                        }
                    } else {
                        var createRole = newRecord.getValue(fieldList[1]);
                        var resultObj = getDealRole(subsidiary, approvalObj, dealKbn, createRole);
                        log.error('1→2→1', JSON.stringify(resultObj));
                        if (Object.keys(resultObj).length > 0) {
                            var nextRole = resultObj.role;
                            // DJ_次の承認ロール
                            newRecord.setValue({
                                fieldId : fieldList[3],
                                value : nextRole
                            });
                            var condition = fieldList[4];
                            if (condition) {
                                // DJ_承認条件開発用
                                newRecord.setValue({
                                    fieldId : condition,
                                    value : resultObj.cdtnAmt
                                });
                            }
                            if (nextRole) {
                                var tmpUsreList = [];
                                var tmpStrCuser = String(currentUserId);
                                tmpUsreList.push(tmpStrCuser);
                                var tmpCreateUserId = newRecord.getValue(fieldList[2]);
                                if (tmpCreateUserId) {
                                    var tmpCUserId = String(tmpCreateUserId);
                                    if (tmpStrCuser != tmpCUserId) {
                                        tmpUsreList.push(tmpCUserId);
                                    }
                                }
                                getApprNextUser(form, nextRole, currentRole, tmpUsreList);
                            }
                        } else {
                            // DJ_次の承認ロール
                            newRecord.setValue({
                                fieldId : fieldList[3],
                                value : ''
                            });
                            var condition = fieldList[4];
                            if (condition) {
                                // DJ_承認条件開発用
                                newRecord.setValue({
                                    fieldId : condition,
                                    value : ''
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 承認対象データを取得する
     */
    function getDealRole(subsidiary, approvalObj, dealKbn, currentRole) {

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
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_create_role", "anyof", currentRole]);
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
                if (dealKbn == KBN_CREATE) {
                    tmpValue = tmpResult.getValue(searchColumns[0]);
                    resultObj.createRole = tmpValue;
                    tmpValue = tmpResult.getValue(searchColumns[1]);
                    resultObj.role = tmpValue;
                    resultObj.cdtnAmt = '';
                } else if (dealKbn == KBN_APPROVAL1) {
                    tmpValue = tmpResult.getValue(searchColumns[1]);
                    resultObj.role = tmpValue;
                    resultObj.cdtnAmt = '';
                } else if (dealKbn == KBN_APPROVAL2) {
                    tmpValue = tmpResult.getValue(searchColumns[2]);
                    tmpAmt = tmpResult.getValue(searchColumns[5]);
                    resultObj.role = tmpValue;
                    resultObj.cdtnAmt = tmpAmt;
                } else if (dealKbn == KBN_APPROVAL3) {
                    tmpValue = tmpResult.getValue(searchColumns[3]);
                    tmpAmt = tmpResult.getValue(searchColumns[6]);
                    resultObj.role = tmpValue;
                    resultObj.cdtnAmt = tmpAmt;
                } else if (dealKbn == KBN_APPROVAL4) {
                    tmpValue = tmpResult.getValue(searchColumns[4]);
                    resultObj.role = tmpValue;
                    resultObj.cdtnAmt = '';
                }
            }
        }

        return resultObj;
    }

    /**
     * 追加の承認者を設定する
     */
    function getApprNextUser(form, nextRoleId, currentRole, tmpUsreList) {

        if (form) {
            var apprNextUsreField = form.getField({
                id : 'custpage_djkk_trans_appr_user'
            });
            log.error('apprNextUsreField', apprNextUsreField);
            if (apprNextUsreField) {
                apprNextUsreField.addSelectOption({
                    value : '',
                    text : ''
                });
                var resultDic = getApprNextUserList(nextRoleId, currentRole, tmpUsreList);
                for ( var rdId in resultDic) {
                    apprNextUsreField.addSelectOption({
                        value : rdId,
                        text : resultDic[rdId]
                    });
                }
            }
        }
    }

    /**
     * 指定ロール下の従業員を取得する
     */
    function getApprNextUserList(nextRoleId, currentRole, tmpUsreList) {

        var resultDic = {};

        var searchType = 'employee';
        var searchFilters = [["role", "anyof", nextRoleId]];
        var searchColumns = [search.createColumn({
            name : "formulatext",
            formula : "{entityid}",
            label : "従業員ID"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpResult = searchResults[i];
                var id = tmpResult.id;
                if (tmpUsreList.indexOf(String(id)) != -1) {
                    continue;
                }
                var entityId = tmpResult.getValue(searchColumns[0]);
                resultDic[id] = entityId;
            }
        }

        return resultDic;
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
        onAction : onAction
    };
});
