/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/search', 'N/redirect'], function(runtime, search, redirect) {
	//DJ_�A�����|WF
	
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
    DETAIL_LIST.push('custrecord_djkk_landedcost_flg');//DJ_���F�����t���O
    DETAIL_LIST.push('custrecord_djkk_landedcost_createrole');//DJ_�쐬���[��
    DETAIL_LIST.push('custrecord_djkk_landedcost_createuser');//DJ_�쐬��
    DETAIL_LIST.push('custrecord_djkk_landedcost_next_role');//DJ_���̏��F���[��
    DETAIL_LIST.push('custrecord_djkk_landedcost_next_condi');//DJ_���̏��F����

    //DJ_�A�����|
    FIELD_MAPPING['20'] = DETAIL_LIST
    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
//    	var oldRecord = scriptContext.oldRecord
    	
        var newRecord = scriptContext.newRecord;
        var form = scriptContext.form;
        log.error('form',form);
        var script = runtime.getCurrentScript();
        var currentUser = runtime.getCurrentUser();
        var currentRole = currentUser.role.toString();
        log.error('currentRole', currentRole);

        
        var subsidiary =  newRecord.getValue('custrecord_djkk_landedcost_subsidiary');
        var createrole =  newRecord.getValue('custrecord_djkk_landedcost_createrole');
        log.error('so subsidiary', subsidiary);
        var roleSearchFitle = [];
        roleSearchFitle.push(["custrecord_djkk_role_id", "is",currentRole]);
        var roleSearchColumns = [ 
                             search.createColumn({
                                 name : "custrecord_djkk_role_syokuseki"
                             })];
        var searchResults = createSearch('customrecord_djkk_role_subsidiary', roleSearchFitle, roleSearchColumns);
        log.error('searchResults.length', searchResults.length);
        subsidiary =searchResults[0].getValue(roleSearchColumns[0]);
        
        log.error('role subsidiary', subsidiary);
        var currentUserId = currentUser.id;

        // ���F�Ώ�
        var approvalObj = script.getParameter({
            name : 'custscript_djkk_landedcost_wf_obj'
        });

        // �����敪
        var dealKbn = script.getParameter({
            name : 'custscript_djkk_landedcost_kbn'
        });
        log.error('approvalObj', approvalObj);
        log.error('dealKbn', dealKbn);

        // �^�C�v
        var type = scriptContext.type;
        log.error('type', type);

        if (type == 'create' || type == 'edit' || type == 'view') {
            var fieldList = FIELD_MAPPING[approvalObj];
//            log.error('fieldList[1]', fieldList[1]);
            var apprDealFlg = newRecord.getValue(fieldList[0]); //DJ_���F�����t���O
                if (dealKbn && approvalObj) {  
                    var resultObj = getDealRole(subsidiary, approvalObj, dealKbn,createrole);
                        log.error('1��2��1', JSON.stringify(resultObj));
                        if (Object.keys(resultObj).length > 0) {
                            var nextRole = resultObj.role;
                            log.error('nextRole', nextRole);
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
                                getApprNextUser(form, nextRole);
                            }
                        }
                }
        }
    }

    /**
     * ���F�Ώۃf�[�^���擾����
     */
    function getDealRole(subsidiary, approvalObj, dealKbn,createrole) {
        var resultObj = {};

        var searchType = 'customrecord_djkk_trans_approval_manage';

        var searchFilters = [];
        searchFilters.push(["isinactive", "is", "F"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_obj", "noneof", "@NONE@"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_create_role", "anyof", createrole]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr1_role", "noneof", "@NONE@"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_subsidiary", "anyof", subsidiary]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_obj", "anyof", approvalObj]);

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
//                    resultObj.cdtnAmt = '';
                } else if (dealKbn == KBN_APPROVAL1) { //��ꏳ�F
                    tmpValue = tmpResult.getValue(searchColumns[1]);//  ��ꏳ�F���[��
                    resultObj.role = tmpValue;
//                    resultObj.cdtnAmt = '';
                } else if (dealKbn == KBN_APPROVAL2) {//��񏳔F
                    tmpValue = tmpResult.getValue(searchColumns[2]);// ��񏳔F���[��
//                    tmpAmt = tmpResult.getValue(searchColumns[5]);
                    resultObj.role = tmpValue;
//                    resultObj.cdtnAmt = tmpAmt;
                } else if (dealKbn == KBN_APPROVAL3) {//��O���F
                    tmpValue = tmpResult.getValue(searchColumns[3]);// ��O���F���[��
//                    tmpAmt = tmpResult.getValue(searchColumns[6]);
                    resultObj.role = tmpValue;
//                    resultObj.cdtnAmt = tmpAmt;
                } else if (dealKbn == KBN_APPROVAL4) {//��l���F
                    tmpValue = tmpResult.getValue(searchColumns[4]);
                    resultObj.role = tmpValue;
//                    resultObj.cdtnAmt = '';
                }
            }
        }

        return resultObj;
    }

    /**
     * �ǉ��̏��F�҂�ݒ肷��
     */
    function getApprNextUser(form, nextRoleId) {

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
                var resultDic = getApprNextUserList(nextRoleId);
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
