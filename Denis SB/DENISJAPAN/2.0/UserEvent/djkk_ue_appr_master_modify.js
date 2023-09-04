/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/serverWidget', 'N/runtime', 'N/search'], function(record, serverWidget, runtime, search) {

    // フィールドマッピング
    var FIELD_MAPPING = {};
    // 顧客・仕入先
    var ENTITY_LIST = [];
    ENTITY_LIST.push('custentity_djkk_approval_deal_flg');// 0
    ENTITY_LIST.push('custentity_djkk_approval_dev');// 1
    ENTITY_LIST.push('custentity_djkk_approval_status');// 2
    ENTITY_LIST.push('custentity_djkk_approval_create_role');// 3
    //changed by geng add start
   // ENTITY_LIST.push('custentity_djkk_approval_dev');//3
    //add end
    ENTITY_LIST.push('custentity_djkk_request_class');// 4
    ENTITY_LIST.push('custentity_djkk_effective_recognition');// 5
    ENTITY_LIST.push('custentity_djkk_approval1_role');// 6
    ENTITY_LIST.push('custentity_djkk_approval1_user');// 7
    ENTITY_LIST.push('custentity_djkk_approval2_role');// 8
    ENTITY_LIST.push('custentity_djkk_approval2_user');// 9
    ENTITY_LIST.push('custentity_djkk_approval3_role');// 10
    ENTITY_LIST.push('custentity_djkk_approval3_user');// 11
    ENTITY_LIST.push('custentity_djkk_approval4_role');// 12
    ENTITY_LIST.push('custentity_djkk_approval4_user');// 13
    ENTITY_LIST.push('custentity_djkk_approval_create_user');// 14
    ENTITY_LIST.push('custentity_djkk_approval_reset_memo');// 15
    ENTITY_LIST.push('custentity_djkk_approval_next_role');// 16
    ENTITY_LIST.push('custentity_djkk_approval_dev_user');// 17
    ENTITY_LIST.push('custentity_djkk_approval_user');// 18
    ENTITY_LIST.push('custentity_djkk_m_approval_status');// 19
    ENTITY_LIST.push('custentity_djkk_m_approval1_role');// 20
    ENTITY_LIST.push('custentity_djkk_m_approval1_user');// 21
    ENTITY_LIST.push('custentity_djkk_m_approval2_role');// 22
    ENTITY_LIST.push('custentity_djkk_m_approval2_user');// 23
    ENTITY_LIST.push('custentity_djkk_m_approval3_role');// 24
    ENTITY_LIST.push('custentity_djkk_m_approval3_user');// 25
    ENTITY_LIST.push('custentity_djkk_m_approval4_role');// 26
    ENTITY_LIST.push('custentity_djkk_m_approval4_user');// 27
    ENTITY_LIST.push('custentity_djkk_approval_reset_memo');// 28
    ENTITY_LIST.push('custentity_djkk_approval_kyaltuka_memo');// 29
    
    FIELD_MAPPING['1'] = ENTITY_LIST;
    FIELD_MAPPING['2'] = ENTITY_LIST;
    // アイテム
    var ITEM_LIST = [];
    ITEM_LIST.push('custitem_djkk_approval_deal_flg'); // 0
    ITEM_LIST.push('custitem_djkk_approval_dev');// 1
    ITEM_LIST.push('custitem_djkk_approval_status');// 2
    ITEM_LIST.push('custitem_djkk_approval_create_role');// 3
    //changed by geng add start
    //ITEM_LIST.push('custitem_djkk_approval_dev');// 3
    //add end
    ITEM_LIST.push('custitem_djkk_request_classification');// 4
    ITEM_LIST.push('custitem_djkk_effective_recognition');// 5
    ITEM_LIST.push('custitem_djkk_approval1_role');// 6
    ITEM_LIST.push('custitem_djkk_approval1_user');// 7
    ITEM_LIST.push('custitem_djkk_approval2_role');// 8
    ITEM_LIST.push('custitem_djkk_approval2_user');// 9
    ITEM_LIST.push('custitem_djkk_approval3_role');// 10
    ITEM_LIST.push('custitem_djkk_approval3_user');// 11
    ITEM_LIST.push('custitem_djkk_approval4_role');// 12
    ITEM_LIST.push('custitem_djkk_approval4_user');// 13
    ITEM_LIST.push('custitem_djkk_approval_create_user');// 14
    ITEM_LIST.push('custitem_djkk_approval_reset_memo');// 15
    ITEM_LIST.push('custitem_djkk_approval_next_role');// 16
    ITEM_LIST.push('custitem_djkk_approval_dev_user');// 17
    ITEM_LIST.push('custitem_djkk_approval_user');// 18
    ITEM_LIST.push('custitem_djkk_m_approval_status');// 19
    ITEM_LIST.push('custitem_djkk_m_approval1_role');// 20
    ITEM_LIST.push('custitem_djkk_m_approval1_user');// 21
    ITEM_LIST.push('custitem_djkk_m_approval2_role');// 22
    ITEM_LIST.push('custitem_djkk_m_approval2_user');// 23
    ITEM_LIST.push('custitem_djkk_m_approval3_role');// 24
    ITEM_LIST.push('custitem_djkk_m_approval3_user');// 25
    ITEM_LIST.push('custitem_djkk_m_approval4_role');// 26
    ITEM_LIST.push('custitem_djkk_m_approval4_user');// 27
    ITEM_LIST.push('custitem_djkk_approval_reset_memo');// 28
    ITEM_LIST.push('custitem_djkk_approval_kyaltuka_memo');// 29
    FIELD_MAPPING['3'] = ITEM_LIST;

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

        var newRec = scriptContext.newRecord;
        var form = scriptContext.form;
        var recType = newRec.type;
        var recId = newRec.id;

        var currentUser = runtime.getCurrentUser();
        var currentRole = currentUser.role.toString();
        log.error('currentRole', currentRole);
        var currentUserId = currentUser.id;

        // 承認対象
        var approvalObj = getApprovalObj(recType);
        var fieldList = FIELD_MAPPING[approvalObj];

        if (scriptContext.type == 'view') {
            if (approvalObj != '9') {
                // DJ_承認処理フラグ
                var apprDealFlg = newRec.getValue(fieldList[0]);
                if (apprDealFlg) {
                    // DJ_依頼区分
                    var requestClass = newRec.getValue(fieldList[4]);
                    var requestClassFlg = (requestClass == '2');
                    log.error('requestClassFlg', requestClassFlg);
                    // DJ_修正承認ステータス
                    var modifyApprStatus = newRec.getValue(fieldList[19]);
                    var modifyApprStatusFlg1 = ((modifyApprStatus == '1') || (modifyApprStatus == '5') || (modifyApprStatus == '6') || (modifyApprStatus == '7'));
                    var modifyApprStatusFlg2 = ((modifyApprStatus == '2') || (modifyApprStatus == '4') || (modifyApprStatus == '8'));
                    log.error('modifyApprStatusFlg1', modifyApprStatusFlg1);
                    // DJ_承認操作ロール
                    var apprRole = newRec.getValue(fieldList[1]);
                    var apprRoleFlg1 = (apprRole != currentRole);
                    log.error('apprRoleFlg1', apprRoleFlg1);
                    // DJ_承認操作者
                    var apprUser = newRec.getValue(fieldList[17]);
                    var apprUserIsNotNull = false;
                    if (apprUser) {
                        apprUserIsNotNull = true;
                    }
                    var apprRoleFlg2 = ((apprRole == currentRole) && apprUserIsNotNull && (apprUser != currentUserId));
                    log.error('apprRoleFlg2', apprRoleFlg2);
                    // DJ_作成ロール
                    var createRole = newRec.getValue(fieldList[3]);
                    var createRoleFlg1 = (createRole != currentRole);
                    // DJ_作成者
                    var createUser = newRec.getValue(fieldList[14]);
                    log.error('createUser', createUser);
                    var createRoleFlg2 = ((createRole == currentRole) && (createUser != currentUserId));
                    var btnShowFlg1 = requestClassFlg && modifyApprStatusFlg1 && (apprRoleFlg1 || apprRoleFlg2);
                    // CH830 zheng 20230831 start
                    // var btnShowFlg2 = requestClassFlg && modifyApprStatusFlg2 && (createRoleFlg1 || createRoleFlg2);
                    var btnShowFlg2 = requestClassFlg && modifyApprStatusFlg2 && createRoleFlg1;
                    // CH830 zheng 20230831 end
                    log.error('btnShowFlg1', btnShowFlg1);
                    log.error('btnShowFlg2', btnShowFlg2);
                    log.error('btnShowFlg1 || btnShowFlg2', btnShowFlg1 || btnShowFlg2);
                    if (btnShowFlg1 || btnShowFlg2) {
                        var button = form.getButton({
                            id : 'edit'
                        });
                        if (button) {
                            button.isHidden = true;
                        }
                    }
                }
            }
        }

        if (scriptContext.type == 'create' || scriptContext.type == 'edit') {
            if (approvalObj != '9') {
            	
            	// add by ycx 20230328 use to csv import
            	setApprovalFieldInline(form,approvalObj,fieldList);
            	
                // DJ_承認処理フラグ
                var approvalDealFlgField = newRec.getField(fieldList[0]);
                log.error('szk approvalDealFlgField', JSON.stringify(approvalDealFlgField));
                var approvalDealFlg = newRec.getValue(fieldList[0]);
                log.error('szk approvalDealFlg', approvalDealFlg);
                if (approvalDealFlg) {
                    var createEditKbnField = form.addField({
                        id : 'custpage_djkk_create_edit_kbn',
                        type : serverWidget.FieldType.TEXT,
                        label : 'コピー開発用'
                    });
                    createEditKbnField.defaultValue = scriptContext.type;
                    createEditKbnField.updateDisplayType({
                        displayType : serverWidget.FieldDisplayType.HIDDEN
                    });
                    // DJ_次の承認者
                    var apprNextUsreField = form.getField({
                        id : fieldList[18]
                    });
                    if (apprNextUsreField) {
                        apprNextUsreField.updateDisplayType({
                            displayType : serverWidget.FieldDisplayType.HIDDEN
                        });
                        var approvalNextUser2Field = form.addField({
                            type : apprNextUsreField.type,
                            label : apprNextUsreField.label,
                            id : 'custpage_djkk_approval_user'
                        });
                        form.insertField({
                            field : approvalNextUser2Field,
                            nextfield : fieldList[18]
                        });
                        if (scriptContext.type == 'edit') {
                            // DJ_次の承認ロール
                            var apprNextRole = newRec.getValue(fieldList[16]);
                            if (apprNextRole) {
                            	 var createUser = newRec.getValue(fieldList[14]);
                                getApprNextUser(form, apprNextRole,createUser);
                                // DJ_次の承認者
                                var apprNextUser = newRec.getValue(fieldList[18]);
                                if (apprNextUser) {
                                    newRec.setValue({
                                        fieldId : 'custpage_djkk_approval_user',
                                        value : apprNextUser
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        // コピーの場合
        if (scriptContext.type == 'copy') {
            var approvalDealFlg = newRec.getValue(fieldList[0]);
            if (approvalDealFlg) {
                if (approvalObj == '3') {
                    for (var i = 1; i < fieldList.length; i++) {
                        var fieldId = fieldList[i];
                        if (i == 4) {
                            newRec.setValue({
                                fieldId : fieldId,
                                value : '1'
                            });
                        } else if (i == 5) {
                            newRec.setValue({
                                fieldId : fieldList[5],
                                value : false
                            });
                        } else {
                            if (i != 18) {
                                newRec.setValue({
                                    fieldId : fieldId,
                                    value : ''
                                });
                            }
                        }
                    }

                    setApprovalFieldInline(form,approvalObj,fieldList);
                    
                    var currentUser = runtime.getCurrentUser();
                    var currentUserId = currentUser.id;
                    // 連結
                    var subsidiary = newRec.getValue('subsidiary');
                    // 処理区分
                    var dealKbn = '1';
                    // DJ_依頼区分
                    var requestCf = newRec.getValue(fieldList[4]);
                    var approvalList = getDealRole(subsidiary, approvalObj, dealKbn, requestCf,currentRole);
                    if (approvalList && approvalList.length > 0) {
                        var tmpApprovalDevValue = approvalList[0];
                        var tmpApprRoleId1 = approvalList[1];
                        if (tmpApprovalDevValue == currentRole) {
                            // DJ_作成ロール
                            newRec.setValue({
                                fieldId : fieldList[3],
                                value : tmpApprovalDevValue
                            });
                            // DJ_作成者
                            newRec.setValue({
                                fieldId : fieldList[14],
                                value : currentUserId
                            });
                            // DJ_次の承認ロール
                            newRec.setValue({
                                fieldId : fieldList[16],
                                value : tmpApprRoleId1
                            });
                            // DJ_次の承認者
                            var apprNextUsreField = form.getField({
                                id : fieldList[18]
                            });
                            if (apprNextUsreField) {
                                apprNextUsreField.updateDisplayType({
                                    displayType : serverWidget.FieldDisplayType.HIDDEN
                                });
                                var approvalNextUser2Field = form.addField({
                                    type : apprNextUsreField.type,
                                    label : apprNextUsreField.label,
                                    id : 'custpage_djkk_approval_user'
                                });
                                form.insertField({
                                    field : approvalNextUser2Field,
                                    nextfield : fieldList[18]
                                });
                                var createUser = newRec.getValue(fieldList[14]);
                                getApprNextUser(form, tmpApprRoleId1,createUser);
                            }
                        }
                    }
                }
            }
        }
        // 編集の場合
        if (scriptContext.type == 'edit') {

            if (approvalObj != '9') {
                // DJ_承認処理フラグ
                approvalDealFlg = newRec.getValue(fieldList[0]);
                log.error('approvalDealFlg', approvalDealFlg);
                if (approvalDealFlg) {
                    // ログインユーザ情報を取得する
                    var subsidiary = newRec.getValue('subsidiary');
                    // DJ_承認開発用
                    var approvalDevRole = newRec.getValue(fieldList[1]);
                    log.error('approvalDevRole', approvalDevRole);
                    // 承認ステータス
                    var approvalStatus = newRec.getValue(fieldList[2]);
                    // DJ_作成ロール
                    var createRole = newRec.getValue(fieldList[3]);
                    // DJ_依頼区分
                    var requestKbn = newRec.getValue(fieldList[4]);
                    // DJ_次の承認ロール
                    var nextDealRole = newRec.getValue(fieldList[16]);
                    // 修正対象を取得する
                    var modifyObjs = getModifyObjs(approvalObj, subsidiary, requestKbn, currentRole);
                    // CH830 zheng 20230831 start
                    if (requestKbn == '1') {
                        if (currentRole == approvalDevRole.toString()) {
                            // 画面項目を制御する
                            dealFieldAndSubList(recType, recId, form, modifyObjs, approvalObj, true, nextDealRole);
                        }
                    } else if (requestKbn == '2') {
                        // DJ_修正承認ステータス
                        var modifyApprStatus = newRec.getValue(fieldList[19]);
                        var modifyApprStatusFlg2 = ((modifyApprStatus == '2') || (modifyApprStatus == '4') || (modifyApprStatus == '8'));
                        if (currentRole == createRole.toString() && modifyApprStatusFlg2) {
                            
                        } else if ((currentRole == createRole.toString()||currentRole == approvalDevRole.toString()) && approvalStatus == '2') {
                            // 画面項目を制御する
                            dealFieldAndSubList(recType, recId, form, modifyObjs, approvalObj, true, nextDealRole);
                        }
                    }
                    //if (currentRole == approvalDevRole.toString() && requestKbn == '1') {
                        // 画面項目を制御する
                        //dealFieldAndSubList(recType, recId, form, modifyObjs, approvalObj, true, nextDealRole);
                    //} else if ((currentRole == createRole.toString()||currentRole == approvalDevRole.toString()) && requestKbn == '2' && approvalStatus == '2') {
                        // 画面項目を制御する
                        //dealFieldAndSubList(recType, recId, form, modifyObjs, approvalObj, true, nextDealRole);
                    //}
                    // CH830 zheng 20230831 end
                }

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
    function beforeSubmit(scriptContext) {

        var newRec = scriptContext.newRecord;
        var recType = newRec.type;

        // 承認対象
        var approvalObj = getApprovalObj(recType);
        var fieldList = FIELD_MAPPING[approvalObj];

        // コピーの場合
        if (scriptContext.type == 'create') {
            var approvalDealFlg = newRec.getValue(fieldList[0]);
            var createEditKbn = newRec.getValue('custpage_djkk_create_edit_kbn');
            log.error('createEditKbn', createEditKbn);
            if (approvalDealFlg && createEditKbn == 'edit') {
                if (approvalObj == '1' || approvalObj == '2') {
                    for (var i = 1; i < fieldList.length; i++) {
                        var fieldId = fieldList[i];
                        if (i == 4) {
                            newRec.setValue({
                                fieldId : fieldId,
                                value : '1'
                            });
                        } else if (i == 5) {
                            newRec.setValue({
                                fieldId : fieldList[5],
                                value : false
                            });
                        } else {
                            if (i != 18) {
                                newRec.setValue({
                                    fieldId : fieldId,
                                    value : ''
                                });
                            }
                        }
                    }

                    var currentUser = runtime.getCurrentUser();   
                    var currentRole = currentUser.role.toString();
                    var currentUserId = currentUser.id;
                    // 連結
                    var subsidiary = newRec.getValue('subsidiary');
                    // 処理区分
                    var dealKbn = '1';
                    // DJ_依頼区分
                    var requestCf = newRec.getValue(fieldList[4]);
                    var approvalList = getDealRole(subsidiary, approvalObj, dealKbn, requestCf,currentRole);
                    if (approvalList && approvalList.length > 0) {
                        var tmpApprovalDevValue = approvalList[0];
                        var tmpApprRoleId1 = approvalList[1];
                        // DJ_作成ロール
                        newRec.setValue({
                            fieldId : fieldList[3],
                            value : tmpApprovalDevValue
                        });
                        // DJ_作成者
                        newRec.setValue({
                            fieldId : fieldList[14],
                            value : currentUserId
                        });
                        // DJ_次の承認ロール
                        newRec.setValue({
                            fieldId : fieldList[16],
                            value : tmpApprRoleId1
                        });
                    }
                }
            }
        }
    }

    /**
     * 追加の承認者を設定する
     */
    function getApprNextUser(form, nextRoleId,createUser) {
    	log.error('createUser222', createUser);
        var apprNextUsreField = form.getField({
            id : 'custpage_djkk_approval_user'
        });
        log.error('apprNextUsreField', apprNextUsreField);
        if (apprNextUsreField) {
            apprNextUsreField.addSelectOption({
                value : '',
                text : ''
            });
            var resultDic = getApprNextUserList(nextRoleId);
            for ( var rdId in resultDic) {
            	if(rdId!=createUser){
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
    function getApprNextUserList(roleId) {

        var resultDic = {};

        var searchType = 'employee';
        var searchFilters = [["role", "anyof", roleId], "AND", ["isinactive", "is", "F"]];
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
                var entityId = tmpResult.getValue(searchColumns[0]);
                resultDic[id] = entityId;
            }
        }

        return resultDic;
    }

    /**
     * 修正対象を取得する
     */
    function getModifyObjs(approvalObj, subsidiary, requestKbn, currentRole) {

        var resultObjs = {};
        var headList = [];
        var subListList = [];

        var searchType = 'customrecord_djkk_master_approval_mg_mdy';

        var searchFilters = [];
        searchFilters.push(["isinactive", "is", "F"]);
        if (approvalObj) {
            searchFilters.push('AND');
            searchFilters.push(["custrecord_djkk_approval_obj_m", "anyof", approvalObj]);
        }
        if (subsidiary) {
            searchFilters.push('AND');
            searchFilters.push(["custrecord_djkk_approval_subsidiary_m", "anyof", subsidiary]);
        }
        if (requestKbn) {
            searchFilters.push('AND');
            searchFilters.push(["custrecord_djkk_request_cf_m", "anyof", requestKbn]);
        }
        if (currentRole) {
            searchFilters.push('AND');
            searchFilters.push(["custrecord_djkk_approval_role_m", "anyof", currentRole]);
        }

        var searchColumns = [search.createColumn({
            name : "custrecord_djkk_is_sublist_m",
            label : "サブリストフラグ"
        }), search.createColumn({
            name : "custrecord_djkk_field_sublist_id_m",
            label : "フィールド・サブリストID"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpResult = searchResults[i];
                var subListFlg = tmpResult.getValue(searchColumns[0]);
                var fsId = tmpResult.getValue(searchColumns[1]);
                if (subListFlg) {
                    subListList.push(fsId);
                } else {
                    headList.push(fsId);
                }
            }
        }

        resultObjs.headList = headList;
        resultObjs.subListList = subListList;

        return resultObjs;
    }

    /**
     * 承認対象を取得する
     */
    function getApprovalObj(recType) {

        var result = '9';

        if (recType == 'customer') {
            result = '1';
        } else if (recType == 'vendor') {
            result = '2';
        } else if (recType.match('item')) {
            result = '3';
        }

        return result;
    }

    /**
     * 承認修正処理
     */
    function dealFieldAndSubList(recType, recId, form, modifyObjs, approvalObj, resetFlg, nextDealRole) {

        var headList = modifyObjs.headList;
        if (resetFlg) {
            if ('1' == approvalObj || '2' == approvalObj) {
                headList.push('custentity_djkk_approval_reset_memo');
                headList.push('custentity_djkk_approval_kyaltuka_memo');              
                if (nextDealRole) {
                    headList.push('custentity_djkk_approval_user');
                }
            } else {
                headList.push('custitem_djkk_approval_reset_memo');
                headList.push('custitem_djkk_approval_kyaltuka_memo');           
                if (nextDealRole) {
                    headList.push('custitem_djkk_approval_user');
                }
            }
        }
        var subListList = modifyObjs.subListList;

        var loadRec = record.load({
            type : recType,
            id : recId,
            isDynamic : true,
            defaultValues : {}
        });

        var fieldIdList = loadRec.getFields();
        for (var i = 0; i < fieldIdList.length; i++) {
            var tmpFieldId = '';
            try {
                tmpFieldId = fieldIdList[i];
                if (headList.indexOf(tmpFieldId) == -1) {
                    var tmpField = form.getField(tmpFieldId);
                    if (tmpField) {
                        tmpField.updateDisplayType({
                            displayType : serverWidget.FieldDisplayType.INLINE
                        });
                    }
                }
            } catch (e) {
                log.error('field', tmpFieldId + '：' + e.message);
            }
        }

        var subListIdList = loadRec.getSublists();
        for (var j = 0; j < subListIdList.length; j++) {
            var tmpSubListId = '';
            try {
                tmpSubListId = subListIdList[j];
                // CH790 zheng 20230815 start
                if (recType == 'lotnumberedassemblyitem') {
                    if (tmpSubListId == 'billofmaterials') {
                        continue;
                    }
                }
                // CH790 zheng 20230815 end
                if (subListList.indexOf(tmpSubListId) == -1) {
                    var tmpSubSublist = form.getSublist({
                        id : tmpSubListId
                    });
                    if (tmpSubSublist) {
                        tmpSubSublist.displayType = serverWidget.SublistDisplayType.HIDDEN;
                    }
                }
            } catch (e) {
                log.error('sublist', tmpSubListId + '：' + e.message);
            }
        }
    }

    /**
     * 承認対象データを取得する
     */
    function getDealRole(subsidiary, approvalObj, dealKbn, requestCf,currentRole) {

        var resultList = [];

        var searchType = 'customrecord_djkk_master_approval_manage';

        var searchFilters = [];
        searchFilters.push(["isinactive", "is", "F"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_approval_obj", "noneof", "@NONE@"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_approval_create_role", "noneof", "@NONE@"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_approval1_role", "noneof", "@NONE@"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_approval_subsidiary", "anyof", subsidiary]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_approval_obj", "anyof", approvalObj]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_request_cf", "anyof", requestCf]);

        var searchColumns = [
        // 作成ロール
        search.createColumn({
            name : "custrecord_djkk_approval_create_role"
        }),
        // 第一承認ロール
        search.createColumn({
            name : "custrecord_djkk_approval1_role"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpResult = searchResults[i];
                var tmpValue = '';
               
                tmpValue = tmpResult.getValue(searchColumns[0]);
                if(tmpValue == currentRole){
                resultList.push(tmpValue);
                tmpValue = tmpResult.getValue(searchColumns[1]);
                resultList.push(tmpValue);
                }
            }
        }

        return resultList;
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
    
    function setApprovalFieldInline(form,approvalObj,fieldList) {
        var canEditFieldList=[0,5,15,18,28,29];
    	for (var i = 0; i < fieldList.length; i++) {
    		if(canEditFieldList.indexOf(i) == -1){
    		setFieldInline(form,fieldList[i]);
    		}    		  		
        }
    }
    
    function setFieldInline(form,fieldId) {
    	 var tmpField = form.getField(fieldId);
                    if (tmpField) {
                        tmpField.updateDisplayType({
                            displayType : serverWidget.FieldDisplayType.DISABLED//INLINE//HIDDEN
                        });
                    }
    }

    return {
        beforeLoad : beforeLoad,
        beforeSubmit : beforeSubmit
    };
});
