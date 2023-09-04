/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/serverWidget', 'N/runtime', 'N/search'], function(record, serverWidget, runtime, search) {

	
	 	var FIELD_MAPPING = {};
	    var TRANS_LIST = [];
	    TRANS_LIST.push('custrecord_djkk_shedunloading_flg');//  DJ_���F�����t���O
	    TRANS_LIST.push('custrecord_djkk_shedunloading_next_user');// DJ_���̏��F��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_next_role');// DJ_���̏��F���[��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_createrole');// DJ_�쐬���[��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_createuser');// DJ_�쐬��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_status');// DJ_���F�X�e�[�^�X
	    TRANS_LIST.push('custrecord_djkk_shedunloading_firstrole');// DJ_��ꏳ�F���[��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_firstuser');// DJ_��ꏳ�F��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_secondrole');// DJ_��񏳔F���[��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_seconduser');// DJ_��񏳔F��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_thirdrole');// DJ_��O���F���[��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_thirduser');//DJ_��O���F��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_fourrole');//DJ_��l���F���[��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_fouruser');// DJ_��l���F��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_oper_role');// DJ_���F���샍�[��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_oper_user');// DJ_���F�����
	    TRANS_LIST.push('custrecord_djkk_shedunloading_next_condi');//DJ_���̏��F����
	    TRANS_LIST.push('custrecord_djkk_shedunloading_next_user');// DJ_���̏��F��
	    TRANS_LIST.push('custrecord_djkk_shedunloading_memo');// DJ_���F���߃���
	    TRANS_LIST.push('custrecord_djkk_shedunload_kyaltuka_memo');// DJ_���F�p������  20230530 add by zhou
	    
	  //���n�I�����F���
	    FIELD_MAPPING['13'] = TRANS_LIST;

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

        var currentUser = runtime.getCurrentUser();
        var currentUserId = currentUser.id;
        var currentRole = currentUser.role.toString();

        var newRec = scriptContext.newRecord;
        var form = scriptContext.form;

        var recType = newRec.type;
        var recId = newRec.id;
        log.error('recId', recId);
        var subsidiary = newRec.getValue('custrecord_djkk_shedunloading_sub');

        // ���F�Ώ�
        var approvalObj = getApprovalObj(recType);
        log.error('approvalObj', approvalObj);
        var fieldList = FIELD_MAPPING[approvalObj];
        log.error('scriptContext.type', scriptContext.type);
        if (scriptContext.type == 'edit') {
            // DJ_���F�����t���O
            var apprDealFlg = newRec.getValue(fieldList[0]);
            if (apprDealFlg) {
                // DJ_���F���샍�[��
                var approvalDevRole = newRec.getValue(fieldList[14]);
                if (currentRole == approvalDevRole.toString()) {
                    // �C���Ώۂ��擾����
                    var modifyObjs = getModifyObjs(approvalObj, subsidiary, approvalDevRole);
                    // ��ʍ��ڂ𐧌䂷��
                    dealFieldAndSubList(recType, recId, form, modifyObjs, approvalObj, true);
                }
            }
        }
        //20230531 add by zht start
        var createUser = newRec.getValue('custrecord_djkk_shedunloading_createuser');//DJ_�쐬��
        var operUser = newRec.getValue('custrecord_djkk_shedunloading_oper_user');//DJ_���݂̏��F��
        //20230531 add by zht end
        if (scriptContext.type == 'view') {
            var apprDealFlg = newRec.getValue(fieldList[0]);
            if (apprDealFlg) {
                var button = form.getButton({
                    id : 'edit'
                });
                if (button) {
                    var apprStatus = newRec.getValue(fieldList[5]);
                    var apprStatusFlg = (apprStatus == '' || apprStatus == '3' || apprStatus == '4');
                    if (apprStatusFlg) {
                        var createRole = newRec.getValue(fieldList[3]);
                        var createRoleFlg = (createRole != null && createRole != '');
                        var createRoleFlg1 = (createRole != currentRole);
                        var createUser = newRec.getValue(fieldList[4]);
                        var createUserFlg = (createUser != null && createUser != '');
                        var createRoleFlg2 = ((createRole == currentRole) && createUserFlg && (createUser != currentUserId));
                        var btnShowFlg = createRoleFlg && (createRoleFlg1 || createRoleFlg2);
                        if (btnShowFlg) {
                            button.isHidden = true;
                        } else {
                            if (apprStatus == '3') {
                                button.isHidden = true;
                            } else {
                                button.isHidden = false;
                            }
                        }
                    } else {
                        var dealRole = newRec.getValue(fieldList[14]);
                        var dealRoleFlg1 = (dealRole != currentRole);
                        var dealUser = newRec.getValue(fieldList[15]);
                        var dealUser1 = (dealUser != null && dealUser != '');
                        log.error('(dealRole == currentRole)', (dealRole == currentRole));
                        log.error('dealUser1', dealUser1);
                        log.error('(dealUser != currentUserId)', (dealUser != currentUserId));
                        var dealRoleFlg2 = (dealRole == currentRole) && dealUser1 && (dealUser != currentUserId);
                        log.error('dealRoleFlg1', dealRoleFlg1);
                        log.error('dealRoleFlg2', dealRoleFlg2);
                        log.error('dealRoleFlg1 || dealRoleFlg2', dealRoleFlg1 || dealRoleFlg2);
                        if (dealRoleFlg1 || dealRoleFlg2) {
                            button.isHidden = true;
                        } else {
                            if (apprStatus == '2') {
                                button.isHidden = false;
                            } else {
                                button.isHidden = false;
                            }
                        }
                    }
                }
            }
        }

        if (scriptContext.type == 'copy') {
            var apprDealFlg = newRec.getValue(fieldList[0]);
            if (apprDealFlg) {
                // �����敪
                var dealKbn = '1';
                var resultObj = getDealRole(subsidiary, approvalObj, dealKbn);
                if (Object.keys(resultObj).length > 0) {
                    for (var i = 1; i < fieldList.length; i++) {
                        var fieldId = fieldList[i];
                        if (fieldId) {
                            newRec.setValue({
                                fieldId : fieldId,
                                value : ''
                            });
                        }
                    }
                    if (resultObj.createRole == currentRole) {
                        // DJ_�쐬���[��
                        newRec.setValue({
                            fieldId : fieldList[3],
                            value : resultObj.createRole
                        });
                        // DJ_�쐬��
                        newRec.setValue({
                            fieldId : fieldList[4],
                            value : currentUserId
                        });
                        // DJ_���̏��F���[��
                        newRec.setValue({
                            fieldId : fieldList[2],
                            value : resultObj.role
                        });
                        // DJ_���̏��F��
                        var apprNextUsreField = form.getField({
                            id : fieldList[1]
                        });
                        if (apprNextUsreField) {
                            apprNextUsreField.updateDisplayType({
                                displayType : serverWidget.FieldDisplayType.HIDDEN
                            });
                            var approvalNextUser2Field = form.addField({
                                type : apprNextUsreField.type,
                                label : apprNextUsreField.label,
                                id : 'custpage_djkk_trans_appr_user'
                            });
                            form.insertField({
                                field : approvalNextUser2Field,
                                nextfield : fieldList[1]
                            });
                            getApprNextUser(form, resultObj.role,createUser,operUser);
                        }
                    }
                }
            }
        }

        if (scriptContext.type == 'create' || scriptContext.type == 'edit') {

            // DJ_���F�����t���O
            var apprDealFlg = newRec.getValue(fieldList[0]);
            log.error('create apprDealFlg', apprDealFlg);
            if (apprDealFlg) {
                // DJ_���̏��F��
                var apprNextUsreField = form.getField({
                    id : fieldList[1]
                });
                log.error('fieldList[1]',fieldList[1]);
                if (apprNextUsreField) {
                	log.error('apprNextUsreField',apprNextUsreField);
                    apprNextUsreField.updateDisplayType({
                        displayType : serverWidget.FieldDisplayType.HIDDEN
                    });
                    var approvalNextUser2Field = form.addField({
                        type : apprNextUsreField.type,
                        label : apprNextUsreField.label,
                        id : 'custpage_djkk_trans_appr_user'
                    });
                    form.insertField({
                        field : approvalNextUser2Field,
                        nextfield : fieldList[1]
                    });
                    if (scriptContext.type == 'edit') {
                        // DJ_���̏��F���[��
                        var apprNextRole = newRec.getValue(fieldList[2]);
                        if (apprNextRole) {
                        	log.error('apprNextRole',apprNextRole);
                            getApprNextUser(form, apprNextRole,createUser,operUser);
                            // DJ_���̏��F��
                            var apprNextUser = newRec.getValue(fieldList[1]);
                            log.error('apprNextUser', apprNextUser);
                            if (apprNextUser) {
                            	 log.error('apprNextUser2', apprNextUser);
                                newRec.setValue({
                                    fieldId : 'custpage_djkk_trans_appr_user',
                                    value : apprNextUser
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * ���F�C������
     */
    function dealFieldAndSubList(recType, recId, form, modifyObjs, approvalObj, resetFlg) {

        var headList = modifyObjs.headList;
        if (resetFlg) {
            if (approvalObj == '10') {
                headList.push('custrecord_djkk_approval_reset_memo');
            } else {
                headList.push('custrecord_djkk_shedunloading_memo');
                headList.push('custrecord_djkk_shedunload_kyaltuka_memo');//20230530 add by zhou
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
                           // displayType : serverWidget.FieldDisplayType.HIDDEN 
                        });
                    }
                }
            } catch (e) {
                log.error('field', tmpFieldId + '�F' + e.message);
            }
        }

        var subListIdList = loadRec.getSublists();
    }
    
    /**
     * �C���Ώۂ��擾����
     */
    function getModifyObjs(approvalObj, subsidiary, currentRole) {

        var resultObjs = {};
        var headList = [];
        var subListList = [];

        var searchType = 'customrecord_djkk_trans_approval_mg_mdy';

        var searchFilters = [];
        searchFilters.push(["isinactive", "is", "F"]);
        if (approvalObj) {
            searchFilters.push('AND');
            searchFilters.push(["custrecord_djkk_approval_obj_mt", "anyof", approvalObj]);
        }
        if (subsidiary) {
            searchFilters.push('AND');
            searchFilters.push(["custrecord_djkk_approval_subsidiary_mt", "anyof", subsidiary]);
        }
        if (currentRole) {
            searchFilters.push('AND');
            searchFilters.push(["custrecord_djkk_approval_role_mt", "anyof", currentRole]);
        }

        var searchColumns = [search.createColumn({
            name : "custrecord_djkk_is_sublist_mt",
            label : "�T�u���X�g�t���O"
        }), search.createColumn({
            name : "custrecord_djkk_field_sublist_id_mt",
            label : "�t�B�[���h�E�T�u���X�gID"
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
     * ���F�Ώۃf�[�^���擾����
     */
    function getDealRole(subsidiary, approvalObj, dealKbn, customForm) {

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
        if (customForm) {
            searchFilters.push("AND");
            searchFilters.push(["custrecord_djkk_trans_appr_form", "anyof", customForm]);
        }

        var searchColumns = [
        // �쐬���[��
        search.createColumn({
            name : "custrecord_djkk_trans_appr_create_role"
        }),
        // ��ꏳ�F���[��
        search.createColumn({
            name : "custrecord_djkk_trans_appr1_role"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpResult = searchResults[i];
                var tmpValue = '';
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
     * ���F�Ώۂ��擾����
     */
    function getApprovalObj(recType) {

        var result = '10';
        if(recType == 'customrecord_djkk_body_shedunloading'){
        	result = '13';
        }

        return result;
    }

    /**
     * �ǉ��̏��F�҂�ݒ肷��
     */
    function getApprNextUser(form, nextRoleId,createUser,operUser) {
    	//20230531 changed by zht start
        var apprNextUsreField = form.getField({
            id : 'custpage_djkk_trans_appr_user'
        });
        var loginUser = runtime.getCurrentUser().id;
        log.error('createUser', createUser);
        log.error('operUser', operUser);
        log.error('loginUser', loginUser);
        log.error('apprNextUsreField', apprNextUsreField);
        log.error('nextRoleId', nextRoleId);
        if (apprNextUsreField) {
            apprNextUsreField.addSelectOption({
                value : '',
                text : ''
            });
            var resultDic = getApprNextUserList(nextRoleId);
            for ( var rdId in resultDic) {
            	//20230531 add by zht start
            	if(rdId != createUser && rdId != operUser&& rdId != loginUser){
            		apprNextUsreField.addSelectOption({
                        value : rdId,
                        text : resultDic[rdId]
                    });	
            	}
            	//20230531 add by zht end
            }
        }
      //20230531 changed by zht end
    }

    /**
     * �w�胍�[�����̏]�ƈ����擾����
     */
    function getApprNextUserList(roleId) {

        var resultDic = {};

        var searchType = 'employee';
        var searchFilters = [["role", "anyof", roleId], "AND", ["isinactive", "is", "F"]];
        var searchColumns = [search.createColumn({
            name : "formulatext",
            formula : "{entityid}",
            label : "�]�ƈ�ID"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpResult = searchResults[i];
                log.error('tmpResult', tmpResult);
                var id = tmpResult.id;
                var entityId = tmpResult.getValue(searchColumns[0]);
                resultDic[id] = entityId;
            }
        }

        return resultDic;
    }

    /**
     * �������ʃ��\�b�h
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
        beforeLoad : beforeLoad
    };
});
