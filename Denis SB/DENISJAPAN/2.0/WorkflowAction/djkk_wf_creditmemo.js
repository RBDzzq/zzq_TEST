/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/search', 'N/redirect'], function(runtime, search, redirect) {
	//�N���W�b�g����WF
	
    // �쐬�敪
    var KBN_CREATE = '1';
    // ��ꏳ�F
    var KBN_APPROVAL1 = '2';
    // ��񏳔F
    var KBN_APPROVAL2 = '3';
    // ��O���F
    var KBN_APPROVAL3 = '4';
    // ��l���F
    var KBN_APPROVAL4 = '5';
    var FIELD_MAPPING = {};
    // �t�B�[���h�}�b�s���O
    var FIELD_MAPPING = {};
    var DETAIL_LIST = [];
    DETAIL_LIST.push('custrecord_djkk_create_note_flg');//DJ_���F�����t���O
    DETAIL_LIST.push('custrecord_djkk_create_note_createrole');//DJ_�쐬���[��
    DETAIL_LIST.push('custrecord_djkk_create_note_createuser');//DJ_�쐬��
    DETAIL_LIST.push('custrecord_djkk_create_note_autho_role');//DJ_���̏��F���[��
    DETAIL_LIST.push('custrecord_djkk_create_note_appro_criter');//DJ_���̏��F����

    //DJ_�N���W�b�g�������F���
    FIELD_MAPPING['15'] = DETAIL_LIST
    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	log.debug('test','test');
        var newRecord = scriptContext.newRecord;
        var form = scriptContext.form;
        log.error('form',form);
        var script = runtime.getCurrentScript();
        var currentUser = runtime.getCurrentUser();
        var currentRole = currentUser.role.toString();
        log.error('currentRole', currentRole);

        
        var subsidiary =  newRecord.getValue('custrecord_djkk_create_note_subsidiary');
        var createrole =  newRecord.getValue('custrecord_djkk_create_note_createrole');
        log.error('so subsidiary', subsidiary);
        var roleSearchFitle = [];
        roleSearchFitle.push(["custrecord_djkk_role_id", "is",currentRole]);
        var roleSearchColumns = [ 
                             search.createColumn({
                                 name : "custrecord_djkk_role_syokuseki"
                             })];
        var searchResults = createSearch('customrecord_djkk_role_subsidiary', roleSearchFitle, roleSearchColumns);
        if (searchResults && searchResults.length > 0) {
            subsidiary =searchResults[0].getValue(roleSearchColumns[0]);
        }
        
        log.error('role subsidiary', subsidiary);
        var currentUserId = currentUser.id;

        // ���F�Ώ�
        var approvalObj = script.getParameter({
            name : 'custscript_djkk_creatmemo_wf_obj'
        });

        // �����敪
        var dealKbn = script.getParameter({
            name : 'custscript_djkk_creatmemo_kbn'
        });
        log.error('approvalObj', approvalObj);
        log.error('dealKbn', dealKbn);

        // �^�C�v
        var type = scriptContext.type;
        log.error('type', type);

		if (type == 'create' || type == 'edit' || type == 'view') {
//			var fieldList = FIELD_MAPPING[approvalObj];
//			// log.error('fieldList[1]', fieldList[1]);
//			var apprDealFlg = newRecord.getValue(fieldList[0]); // DJ_���F�����t���O
//			if (dealKbn && approvalObj) {
//				var resultObj = getDealRole(subsidiary, approvalObj, dealKbn,
//						createrole);
//				log.error('1��2��1', JSON.stringify(resultObj));
//				if (Object.keys(resultObj).length > 0) {
//					var nextRole = resultObj.role;
//					log.error('nextRole', nextRole);
//					// DJ_���̏��F���[��
//					newRecord.setValue({
//						fieldId : fieldList[3],
//						value : nextRole
//					});
//					var condition = fieldList[4];
//					if (condition) {
//						// DJ_���F�����J���p
//						newRecord.setValue({
//							fieldId : condition,
//							value : resultObj.cdtnAmt
//						});
//					}
//					if (nextRole) {
//						getApprNextUser(form, nextRole);
//					}
//				}
//			}

            var fieldList = FIELD_MAPPING[approvalObj];
//            log.error('fieldList[1]', fieldList[1]);
            var apprDealFlg = newRecord.getValue(fieldList[0]); //DJ_���F�����t���O
            if (apprDealFlg) {
                if (dealKbn && approvalObj) {
                	 log.error('dealKbn', dealKbn);
                	 log.error('KBN_CREATE', KBN_CREATE);
                    if (dealKbn == '1') {
                        var resultObj = getDealRole(subsidiary, approvalObj, dealKbn, currentRole);
                        var createRole = resultObj.createRole;
                        log.error('createRole', createRole);
                        if (createRole && createRole == currentRole) {
                            // DJ_�쐬���[��
                            newRecord.setValue({
                                fieldId : fieldList[1],
                                value : resultObj.createRole
                            });
                            // DJ_�쐬��
                            newRecord.setValue({
                                fieldId : fieldList[2],
                                value : currentUserId
                            });
                            // DJ_���̏��F���[��
                            var nextRole = resultObj.role;
                            log.error('nextRole2', nextRole);
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
                        log.error('approvalObj', approvalObj);
                        log.error('subsidiary', subsidiary);
                        log.error('dealKbn', dealKbn);
                        log.error('createRole', createRole);
                        var resultObj = getDealRole(subsidiary, approvalObj, dealKbn, createRole);
                        log.error('1��2��1', JSON.stringify(resultObj));
                        log.error('Object.keys(resultObj).length', Object.keys(resultObj).length);
                        log.error('Object.keys(resultObj)', Object.keys(resultObj));
                        log.error('resultObj', JSON.stringify(resultObj));
                        if (Object.keys(resultObj).length > 0) {
                            var nextRole = resultObj.role;
                            log.error('nextRole2', nextRole);
                            // DJ_���̏��F���[��
                            newRecord.setValue({
                                fieldId : fieldList[3],
                                value : nextRole
                            });
                            var condition = fieldList[4];
                            if (condition) {
                                // DJ_���F�����J���p
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
                        }
                    }
                }
            }
        
			
		}
    }

    /**
	 * ���F�Ώۃf�[�^���擾����
	 */
    function getDealRole(subsidiary, approvalObj, dealKbn,createrole) {
    	log.error('in', 'in');
    	log.error('dealKbnin', dealKbn);
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
        searchFilters.push(["custrecord_djkk_trans_appr_create_role", "anyof", createrole]);
      //20230523 add by zhou end
        var searchColumns = [
                             
                             // �쐬���[��
                             search.createColumn({
                                 name : "custrecord_djkk_trans_appr_create_role"
                             }),
                             // ��ꏳ�F���[��
                             search.createColumn({
                                 name : "custrecord_djkk_trans_appr1_role"
                             }),
                             // ��񏳔F���[��
                             search.createColumn({
                                 name : "custrecord_djkk_trans_appr2_role"
                             }),
                             // ��O���F���[��
                             search.createColumn({
                                 name : "custrecord_djkk_trans_appr3_role"
                             }),
                             // ��l���F���[��
                             search.createColumn({
                                 name : "custrecord_djkk_trans_appr4_role"
                             }),
                             // ��񏳔F����(�~�ȏ�)
                             search.createColumn({
                                 name : "custrecord_djkk_trans_appr2_cdtn_amt"
                             }),
                             // ��O���F����(�~�ȏ�)
                             search.createColumn({
                                 name : "custrecord_djkk_trans_appr3_cdtn_amt"
                             }),
                             //id
							 search.createColumn({
							    name : "internalid"
						 	 }),
                             ];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        log.error('searchResults',  JSON.stringify(searchResults));
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
            	 log.error('in searchResults',  JSON.stringify(searchResults));
                var tmpResult = searchResults[i];
                var tmpValue = '';
                var tmpAmt = null;
                 //20230523 add by zhou start
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
                resultObj.id = tmpResult.getValue(searchColumns[7]);
                //20230523 add by zhou end
            }
        }
        log.error('resultObj in fun', JSON.stringify(resultObj));
        return resultObj;
    }

    /**
     * �ǉ��̏��F�҂�ݒ肷��
     */
//    function getApprNextUser(form, nextRoleId) {
//
//        if (form) {
//            var apprNextUsreField = form.getField({
//                id : 'custpage_djkk_trans_appr_user'//custrecord_djkk_next_appr_name
//            });
//            log.error('apprNextUsreField', apprNextUsreField);
//            if (apprNextUsreField) {
//                apprNextUsreField.addSelectOption({
//                    value : '',
//                    text : ''
//                });
//                var resultDic = getApprNextUserList(nextRoleId);
//                for ( var rdId in resultDic) {
//                    apprNextUsreField.addSelectOption({
//                        value : rdId,
//                        text : resultDic[rdId]
//                    });
//                }
//            }
//        }
//    }

    /**
     * �w�胍�[�����̏]�ƈ����擾����
     */
//    function getApprNextUserList(roleId) {
//
//        var resultDic = {};
//
//        var searchType = 'employee';
//        var searchFilters = [["role", "anyof", roleId]];
//        var searchColumns = [search.createColumn({
//            name : "formulatext",
//            formula : "{entityid}",
//            label : "�]�ƈ�ID"
//        })];
//
//        var searchResults = createSearch(searchType, searchFilters, searchColumns);
//        if (searchResults && searchResults.length > 0) {
//            for (var i = 0; i < searchResults.length; i++) {
//                var tmpResult = searchResults[i];
//                var id = tmpResult.id;
//                var entityId = tmpResult.getValue(searchColumns[0]);
//                resultDic[id] = entityId;
//            }
//        }
//
//        return resultDic;
//    }
    /**
     * �ǉ��̏��F�҂�ݒ肷��
     */
    function getApprNextUser(form, nextRoleId, currentRole, tmpUsreList) {

        if (form) {
            var apprNextUsreField = form.getField({
                id : 'custpage_djkk_trans_appr_user'//custrecord_djkk_next_appr_name
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
     * �w�胍�[�����̏]�ƈ����擾����
     */
    function getApprNextUserList(nextRoleId, currentRole, tmpUsreList) {

        var resultDic = {};

        var searchType = 'employee';
        var searchFilters = [["role", "anyof", nextRoleId]];
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
     * �������ʃ��\�b�h
     */
    function createSearch(searchType, searchFilters, searchColumns) {
        var resultList = [];
        var resultIndex = 0;
        var resultStep = 1000;
        log.error('searchType', JSON.stringify(searchType));
        log.error('searchFilters', JSON.stringify(searchFilters));
        log.error('searchColumns', JSON.stringify(searchColumns));
        var objSearch = search.create({
            type : searchType,
            filters : searchFilters,
            columns : searchColumns
        });
        var objResultSet = objSearch.run();
        log.error('objResultSet', JSON.stringify(objResultSet));
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
        log.error('results', JSON.stringify(results));
        log.error('resultList', JSON.stringify(resultList));
        return resultList;
    }

    return {
        onAction : onAction
    };
});