/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/search', 'N/redirect'], function(runtime, search, redirect) {

    // �쐬
    var KBN_CREATE = '1';
    // ��ꏳ�F
    var KBN_APPROVAL1 = '2';
    // ��񏳔F
    var KBN_APPROVAL2 = '3';
    // ��O���F
    var KBN_APPROVAL3 = '4';
    // ��l���F
    var KBN_APPROVAL4 = '5';
    // �C��
    var KBN_MODIFY = '6';

    // �t�B�[���h�}�b�s���O
    var FIELD_MAPPING = {};
    // �ڋq�E�d����
    var ENTITY_LIST = [];
    ENTITY_LIST.push('custentity_djkk_approval_create_role'); // 0
    ENTITY_LIST.push('custentity_djkk_approval_create_user');// 1
    ENTITY_LIST.push('custentity_djkk_approval_status');// 2
    ENTITY_LIST.push('custentity_djkk_effective_recognition');// 3
    ENTITY_LIST.push('custentity_djkk_request_class');// 4
    ENTITY_LIST.push('custentity_djkk_approval_next_role');// 5
    ENTITY_LIST.push('custentity_djkk_approval_deal_flg');// 6
    FIELD_MAPPING['1'] = ENTITY_LIST;
    FIELD_MAPPING['2'] = ENTITY_LIST;
    // �A�C�e��
    var ITEM_LIST = [];
    ITEM_LIST.push('custitem_djkk_approval_create_role');// 0
    ITEM_LIST.push('custitem_djkk_approval_create_user');// 1
    ITEM_LIST.push('custitem_djkk_approval_status');// 2
    ITEM_LIST.push('custitem_djkk_effective_recognition');// 3
    ITEM_LIST.push('custitem_djkk_request_classification');// 4
    ITEM_LIST.push('custitem_djkk_approval_next_role');// 5
    ITEM_LIST.push('custitem_djkk_approval_deal_flg');// 6
    FIELD_MAPPING['3'] = ITEM_LIST;

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
        var approvalDevValue = '';
        var script = runtime.getCurrentScript();
        var currentUser = runtime.getCurrentUser();
              	
        var subsidiary = newRecord.getValue('subsidiary');
        log.debug('subsidiary', subsidiary);
        var currentUserId = currentUser.id;

        // ���F�Ώ�
        var approvalObj = script.getParameter({
            name : 'custscript_djkk_approval_obj'
        });
        log.error('approvalObj', approvalObj);
        // �����敪
        var dealKbn = script.getParameter({
            name : 'custscript_djkk_deal_kbn'
        });
        log.error('dealKbn', dealKbn);
        // �^�C�v
        var type = scriptContext.type;
        log.error('type', type);

        if (type == 'create' || type == 'edit' || type == 'view') {
            var fieldList = FIELD_MAPPING[approvalObj];
            var createRole = newRecord.getValue(fieldList[0]);
            
            log.error('createRole0', createRole);
            	if(isEmpty(createRole)){      		
            		createRole = currentUser.role.toString();
            		log.error('createRole1', createRole);
            	}
            var approvalDealFlg = newRecord.getValue(fieldList[6]);
            var thecreateUser=newRecord.getValue(fieldList[1]);
            if(type == 'create'&&isEmpty(thecreateUser)){
            	thecreateUser=currentUser.id;
            }
            log.error('thecreateUser', thecreateUser);
            if (approvalDealFlg) {
                if (dealKbn && approvalObj) {
                    // DJ_�˗��敪
                    var requestCf = newRecord.getValue(fieldList[4]);
                    var approvalList = getDealRole(subsidiary, approvalObj, dealKbn, requestCf,createRole);
                    log.error('approvalList', JSON.stringify(approvalList));
                    var tmpApprovalDevValue = '';
                    var tmpCurrentUserId = '';
                    var tmpApprRoleId1 = '';
                    log.error('dealKbn == KBN_CREATE', dealKbn == KBN_CREATE);
                    log.error('dealKbn == KBN_MODIFY', dealKbn == KBN_MODIFY);
                    if (dealKbn == KBN_CREATE) {
                        approvalDevValue = approvalList[0];
                        if (approvalDevValue == createRole) {
                            tmpApprovalDevValue = approvalDevValue;
                            tmpCurrentUserId = currentUserId;
                            tmpApprRoleId1 = approvalList[1];
                        }
                        // DJ_�쐬���[��
                        newRecord.setValue({
                            fieldId : fieldList[0],
                            value : tmpApprovalDevValue
                        });
                        // DJ_�쐬��
                        newRecord.setValue({
                            fieldId : fieldList[1],
                            value : tmpCurrentUserId
                        });
                        // DJ_���̏��F���[��
                        newRecord.setValue({
                            fieldId : fieldList[5],
                            value : tmpApprRoleId1
                        });
                        if (tmpApprRoleId1) {
                        	log.error('zdj-form-create',form);
                        	log.error('zdj-tmpApprRoleId1-create',tmpApprRoleId1);
                        	log.error('zdj-thecreateUser-create',thecreateUser);
                            getApprNextUser(form, tmpApprRoleId1,thecreateUser);
                            var customApprUser = newRecord.getValue('custpage_djkk_approval_user');
                            log.error('zdj-customApprUser-create',customApprUser);
                        }
                    } else if (dealKbn == KBN_MODIFY) {
                        tmpApprRoleId1 = approvalList[0];
                        // DJ_���̏��F���[��
                        newRecord.setValue({
                            fieldId : fieldList[5],
                            value : tmpApprRoleId1
                        });
                        if (tmpApprRoleId1) {
                        	log.error('zdj-form-edit',form);
                        	log.error('zdj-tmpApprRoleId1-edit',tmpApprRoleId1);
                        	log.error('zdj-thecreateUser-edit',thecreateUser);
                            getApprNextUser(form, tmpApprRoleId1,thecreateUser);
                            var customApprUser = newRecord.getValue('custpage_djkk_approval_user');
                            log.error('zdj-customApprUser-edit',customApprUser);
                        }
                    } else {
                        if (approvalList && approvalList.length > 0) {
                            var approvalValue = approvalList[0];
                            log.error('approvalValuee', approvalValue);
                            // DJ_���̏��F���[��
                            newRecord.setValue({
                                fieldId : fieldList[5],
                                value : approvalValue
                            });
                            if (approvalValue) {
                            	log.error('zdj-form-else',form);
                            	log.error('zdj-tmpApprRoleId1-else',approvalValue);
                            	log.error('zdj-thecreateUser-else',thecreateUser);
                                getApprNextUser(form, approvalValue,thecreateUser);
                                var customApprUser = newRecord.getValue('custpage_djkk_approval_user');
                                log.error('zdj-customApprUser-else',customApprUser);
                            }
                        }else{
                        	newRecord.setValue({
                                fieldId : fieldList[5],
                                value : null
                            });
                        }
                    }
                }
            }
        }
    }

    /**
     * �ǉ��̏��F�҂�ݒ肷��
     */
    function getApprNextUser(form, nextRoleId,createUser) {

        if (form) {
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
    }

    /**
     * �w�胍�[�����̏]�ƈ����擾����
     */
    function getApprNextUserList(roleId) {

        var resultDic = {};

        var searchType = 'employee';
        var searchFilters = [["role", "anyof", roleId]];
        var searchColumns = [search.createColumn({
            name : "formulatext",
            formula : "{entityid}",
            label : "�]�ƈ�ID"
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
     * ���F�Ώۃf�[�^���擾����
     */
    function getDealRole(subsidiary, approvalObj, dealKbn, requestCf,createRole) {

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
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_approval_create_role", "anyof", createRole]);

        var searchColumns = [
        // �쐬���[��
        search.createColumn({
            name : "custrecord_djkk_approval_create_role"
        }),
        // ��ꏳ�F���[��
        search.createColumn({
            name : "custrecord_djkk_approval1_role"
        }),
        // ��񏳔F���[��
        search.createColumn({
            name : "custrecord_djkk_approval2_role"
        }),
        // ��O���F���[��
        search.createColumn({
            name : "custrecord_djkk_approval3_role"
        }),
        // ��l���F���[��
        search.createColumn({
            name : "custrecord_djkk_approval4_role"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpResult = searchResults[i];
                var tmpValue = '';
                if (dealKbn == KBN_CREATE) {
                    tmpValue = tmpResult.getValue(searchColumns[0]);
                    resultList.push(tmpValue);
                    tmpValue = tmpResult.getValue(searchColumns[1]);
                    resultList.push(tmpValue);
                } else if (dealKbn == KBN_APPROVAL1) {
                    tmpValue = tmpResult.getValue(searchColumns[1]);
                    resultList.push(tmpValue);
                } else if (dealKbn == KBN_APPROVAL2) {
                    tmpValue = tmpResult.getValue(searchColumns[2]);
                    resultList.push(tmpValue);
                } else if (dealKbn == KBN_APPROVAL3) {
                    tmpValue = tmpResult.getValue(searchColumns[3]);
                    resultList.push(tmpValue);
                } else if (dealKbn == KBN_APPROVAL4) {
                    tmpValue = tmpResult.getValue(searchColumns[4]);
                    resultList.push(tmpValue);
                } else if (dealKbn == KBN_MODIFY) {
                    tmpValue = tmpResult.getValue(searchColumns[1]);
                    resultList.push(tmpValue);
                }
            }
        }

        return resultList;
    }

    /**
     * ��l�𔻒f
     * 
     * @param str
     *            �Ώ�
     * @returns ���f����
     */
    function isEmpty(obj) {
    	if (obj === undefined || obj == null || obj === '') {
    		return true;
    	}
    	if (obj.length && obj.length > 0) {
    		return false;
    	}
    	if (obj.length === 0) {
    		return true;
    	}
    	for ( var key in obj) {
    		if (hasOwnProperty.call(obj, key)) {
    			return false;
    		}
    	}
    	if (typeof (obj) == 'boolean') {
    		return false;
    	}
    	if (typeof (obj) == 'number') {
    		return false;
    	}
    	return true;
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
        onAction : onAction
    };
});
