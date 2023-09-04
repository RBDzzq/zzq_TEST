/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/serverWidget', 'N/runtime', 'N/search', 'SuiteScripts/DENISJAPAN/2.0/Common/djkk_common'], function(record, serverWidget, runtime, search, djkk_common) {

    // WF�o���f�[�V�������� zheng 20230313 start
    var SUB_NBKK = 2;
    var SUB_ULKK = 4;
    // WF�o���f�[�V�������� zheng 20230313 end

    // �t�B�[���h�}�b�s���O
    var FIELD_MAPPING = {};
    var TRANS_LIST = [];
    TRANS_LIST.push('custbody_djkk_trans_appr_deal_flg');// 0
    TRANS_LIST.push('custbody_djkk_trans_appr_user');// 1
    TRANS_LIST.push('custbody_djkk_trans_appr_next_role');// 2
    TRANS_LIST.push('custbody_djkk_trans_appr_create_role');// 3
    TRANS_LIST.push('custbody_djkk_trans_appr_create_user');// 4
    TRANS_LIST.push('custbody_djkk_trans_appr_status');// 5
    TRANS_LIST.push('custbody_djkk_trans_appr1_role');// 6
    TRANS_LIST.push('custbody_djkk_trans_appr1_user');// 7
    TRANS_LIST.push('custbody_djkk_trans_appr2_role');// 8
    TRANS_LIST.push('custbody_djkk_trans_appr2_user');// 9
    TRANS_LIST.push('custbody_djkk_trans_appr3_role');// 10
    TRANS_LIST.push('custbody_djkk_trans_appr3_user');// 11
    TRANS_LIST.push('custbody_djkk_trans_appr4_role');// 12
    TRANS_LIST.push('custbody_djkk_trans_appr4_user');// 13
    TRANS_LIST.push('custbody_djkk_trans_appr_dev');// 14
    TRANS_LIST.push('custbody_djkk_trans_appr_dev_user');// 15
    TRANS_LIST.push('custbody_djkk_trans_appr_cdtn_amt');// 16
    TRANS_LIST.push('custbody_djkk_trans_appr_user');// 17
    TRANS_LIST.push('custbody_djkk_approval_reset_memo');// 18
    TRANS_LIST.push('custbody_djkk_approval_kyaltuka_memo');// 19
    // WF�o���f�[�V���� zheng 20230314 start
    TRANS_LIST.push('custbody_djkk_trans_appr_do_cdtn_amt');// 20
    // WF�o���f�[�V���� zheng 20230314 end
    // WF zheng 20230525 start
    TRANS_LIST.push('custbody_djkk_bribery_final_mail');// 21
    TRANS_LIST.push('custbody_djkk_trans_appr_amt');// 22
    // WF zheng 20230525 end

    var ARRIVAL_LIST = [];
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_deal_flg');// 0
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_user');// 1
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_next_role');// 2
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_create_role');// 3
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_create_user');// 4
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_status');// 5
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr1_role');// 6
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr1_user');// 7
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr2_role');// 8
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr2_user');// 9
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr3_role');// 10
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr3_user');// 11
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr4_role');// 12
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr4_user');// 13
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_dev');// 14
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_dev_user');// 15
    ARRIVAL_LIST.push('');// 16
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_user');// 17
    ARRIVAL_LIST.push('custrecord_djkk_approval_reset_memo');// 18

    // ���Ϗ�
    FIELD_MAPPING['1'] = TRANS_LIST;
    // ������
    FIELD_MAPPING['2'] = TRANS_LIST;
    // �O���
    FIELD_MAPPING['3'] = TRANS_LIST;
    // �ڋq�ԕi
    FIELD_MAPPING['4'] = TRANS_LIST;
    // �N���W�b�g����
    FIELD_MAPPING['5'] = TRANS_LIST;
    // ������
    FIELD_MAPPING['6'] = TRANS_LIST;
    // �x��������
    FIELD_MAPPING['7'] = TRANS_LIST;
    // �d����ԕi
    FIELD_MAPPING['8'] = TRANS_LIST;
    // �O����/���|������
    FIELD_MAPPING['9'] = TRANS_LIST;
    // �����ו�
    FIELD_MAPPING['10'] = ARRIVAL_LIST;
    // ������
    FIELD_MAPPING['11'] = TRANS_LIST;
    // �݌ɒ���
    FIELD_MAPPING['19'] = TRANS_LIST;

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
        // var subsidiary = currentUser.subsidiary;
        var currentUserId = currentUser.id;
        var currentRole = currentUser.role.toString();

        var newRec = scriptContext.newRecord;
        var form = scriptContext.form;
        var recType = newRec.type;
        var recId = newRec.id;

        // var oldRecord = scriptContext.oldRecord;
        // log.error('oldRecord', oldRecord);

        log.error('recId', recId);
        // changed by geng add start
        var subsidiary = newRec.getValue('subsidiary');
        // changed by geng add end
        // ���F�Ώ�
        var approvalObj = getApprovalObj(recType);
        log.error('approvalObj', approvalObj);
        var fieldList = FIELD_MAPPING[approvalObj];
        log.error('scriptContext.type', scriptContext.type);
        if (scriptContext.type == 'edit') {
            // DJ_���F�����t���O
            var apprDealFlg = newRec.getValue(fieldList[0]);
            if (apprDealFlg) {
                // DJ_���F�X�e�[�^�X
                var apprStatus = newRec.getValue(fieldList[5]);
                // DJ_�쐬���[��
                var createRole = newRec.getValue(fieldList[3]);
                // DJ_�쐬��
                var createUser = newRec.getValue(fieldList[4]);
                // DJ_���݂̏��F���[��
                var approvalDevRole = newRec.getValue(fieldList[14]);
                // DJ_���݂̏��F��
                var dealUser = newRec.getValue(fieldList[15]);
                // �\������
                var applyFlg = ((apprStatus == '4' && createRole == currentRole) || (!apprStatus && createRole == currentRole && createUser == currentUserId));
                // ���F
                var apprFlg = ((createUser != currentUserId && approvalDevRole == currentRole && createRole != currentRole) || (createRole == approvalDevRole && createUser != currentUserId)) && (!dealUser || (dealUser && dealUser == currentUserId));
                // ��ꏳ�F
                var appr1Flg = (apprStatus == '1' && apprFlg);
                // ��񏳔F
                var appr2Flg = (apprStatus == '5' && apprFlg);
                // ��O���F
                var appr3Flg = (apprStatus == '6' && apprFlg);
                // ��l���F
                var appr4Flg = (apprStatus == '7' && apprFlg);
                if (!(applyFlg || appr1Flg || appr2Flg || appr3Flg || appr4Flg)) {
                    redirect.toRecord({
                        type : recType,
                        id : recId,
                        isEditMode : false
                    });
                }
                log.error('currentRole', currentRole);
                log.error('pprovalDevRole.toString()', approvalDevRole.toString());
                if (currentRole == approvalDevRole.toString()) {
                    // �C���Ώۂ��擾����
                    var modifyObjs = getModifyObjs(approvalObj, subsidiary, approvalDevRole);
                    log.error('test2', 'test2');
                    // ��ʍ��ڂ𐧌䂷��
                    dealFieldAndSubList(recType, recId, form, modifyObjs, approvalObj, true);
                }
            }
        }

        if (scriptContext.type == 'view') {
            var apprDealFlg = newRec.getValue(fieldList[0]);
            if (apprDealFlg) {
                var button = form.getButton({
                    id : 'edit'
                });
                if (button) {
                    var apprStatus = newRec.getValue(fieldList[5]);
                    var apprStatusFlg = (apprStatus == '' || apprStatus == '3' || apprStatus == '4');
                    log.error('apprStatusFlg', apprStatusFlg);
                    if (apprStatusFlg) {
                        var createRole = newRec.getValue(fieldList[3]);
                        var createUser = newRec.getValue(fieldList[4]);
                        var btnShowFlg = false;
                        if (apprStatus == '') {
                            btnShowFlg = (createRole == currentRole) && (createUser == currentUserId);
                        } else if (apprStatus == '4') {
                            btnShowFlg = (createRole == currentRole);
                        } else {
                            btnShowFlg = false;
                        }
                        if (btnShowFlg) {
                            button.isHidden = false;
                        } else {
                            button.isHidden = true;
                        }

                        // var createRoleFlg = (createRole != null && createRole != '');
                        // var createRoleFlg1 = (createRole != currentRole);
                        // var createUserFlg = (createUser != null && createUser != '');
                        // // var createRoleFlg2 = ((createRole == currentRole) && createUserFlg && (createUser != currentUserId));
                        // // var btnShowFlg = createRoleFlg && (createRoleFlg1 || createRoleFlg2);
                        // var btnShowFlg = createRoleFlg && (createRoleFlg1);
                        // log.error('true createRoleFlg', createRoleFlg);
                        // log.error('true createRoleFlg1', createRoleFlg1);
                        // // log.error('true createRoleFlg2', createRoleFlg2);
                        // log.error('true btnShowFlg', btnShowFlg);
                        // if (btnShowFlg) {
                        // button.isHidden = true;
                        // } else {
                        // if (apprStatus == '3') {
                        // button.isHidden = true;
                        // } else {
                        // button.isHidden = false;
                        // }
                        // }
                    } else {
                        // CH789 zheng 20230809 start
                        if (apprStatus == '2') {
                            if (!((recType == 'purchaseorder' || recType == 'invoice') && (subsidiary == 2 || subsidiary == 4))) {
                                var dealRole = newRec.getValue(fieldList[14]);
                                var dealRoleFlg1 = (dealRole != currentRole);
                                log.error('false dealRoleFlg1', dealRoleFlg1);

                                var dealUser = newRec.getValue(fieldList[15]);
                                var dealUser1 = (dealUser != null && dealUser != '');
                                var dealRoleFlg2 = (dealRole == currentRole) && dealUser1 && (dealUser != currentUserId);
                                log.error('false dealRoleFlg2', dealRoleFlg2);

                                var createRole = newRec.getValue(fieldList[3]);
                                var createUser = newRec.getValue(fieldList[4]);
                                // var dealRoleFlg3 = (dealRole == currentRole) && (dealRole == createRole) && createUser && (createUser ==
                                // currentUserId);
                                var dealRoleFlg3 = (dealRole == currentRole) && createUser && (createUser == currentUserId);
                                log.error('false dealRoleFlg3', dealRoleFlg3);

                                if (dealRoleFlg1 || dealRoleFlg2 || dealRoleFlg3) {
                                    button.isHidden = true;
                                } else {
                                    if (apprStatus == '2') {
                                        button.isHidden = true;
                                    } else {
                                        button.isHidden = false;
                                    }
                                }
                            }
                        } else {
                            var dealRole = newRec.getValue(fieldList[14]);
                            var dealRoleFlg1 = (dealRole != currentRole);
                            log.error('false dealRoleFlg1', dealRoleFlg1);

                            var dealUser = newRec.getValue(fieldList[15]);
                            var dealUser1 = (dealUser != null && dealUser != '');
                            var dealRoleFlg2 = (dealRole == currentRole) && dealUser1 && (dealUser != currentUserId);
                            log.error('false dealRoleFlg2', dealRoleFlg2);

                            var createRole = newRec.getValue(fieldList[3]);
                            var createUser = newRec.getValue(fieldList[4]);
                            // var dealRoleFlg3 = (dealRole == currentRole) && (dealRole == createRole) && createUser && (createUser ==
                            // currentUserId);
                            var dealRoleFlg3 = (dealRole == currentRole) && createUser && (createUser == currentUserId);
                            log.error('false dealRoleFlg3', dealRoleFlg3);

                            if (dealRoleFlg1 || dealRoleFlg2 || dealRoleFlg3) {
                                button.isHidden = true;
                            } else {
                                if (apprStatus == '2') {
                                    button.isHidden = true;
                                } else {
                                    button.isHidden = false;
                                }
                            }
                        }
                        // CH789 zheng 20230809 end
                    }
                }
            }
        }

        if (scriptContext.type == 'copy') {
            // WF�o���f�[�V�������� zheng 20230313 start
            var paramId = scriptContext.request.parameters.id;
            if (paramId) {
                var scObjs = djkk_common.lookupFields(recType, paramId, fieldList[0]);
                var scFlg = scObjs.custbody_djkk_trans_appr_deal_flg;
                log.error('scFlg', scFlg);
                if (scFlg) {
                    newRec.setValue({
                        fieldId : fieldList[0],
                        value : 'T'
                    });
                }

            }
            // WF�o���f�[�V�������� zheng 20230313 end
            var apprDealFlg = newRec.getValue(fieldList[0]);
            // if (apprDealFlg) {
            // ���F�����N���A����
            fieldClear(fieldList, newRec);
            // �����敪
            var dealKbn = '1';
            var resultObj = getDealRole(subsidiary, approvalObj, dealKbn, currentRole);
            if (Object.keys(resultObj).length > 0) {
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
                        var tmpUsreList = [];
                        var tmpStrCuser = String(currentUserId);
                        tmpUsreList.push(tmpStrCuser);
                        var tmpCreateUserId = newRec.getValue(fieldList[4]);
                        if (tmpCreateUserId) {
                            var tmpCUserId = String(tmpCreateUserId);
                            if (tmpStrCuser != tmpCUserId) {
                                tmpUsreList.push(tmpCUserId);
                            }
                        }
                        getApprNextUser(form, resultObj.role, tmpUsreList);
                    }
                }
            }
            // }
        }

        if (scriptContext.type == 'create' || scriptContext.type == 'edit') {

            var tmpDealFlg = false;
            // WF�o���f�[�V�������� zheng 20230313 start
            if (scriptContext.type == 'create') {
                var recType = newRec.getValue('type');
                log.debug('recType', recType);
                if (recType == 'vendbill') {
                    var podocnum = newRec.getValue('podocnum');
                    log.debug('podocnum', podocnum);
                    if (podocnum) {
                        tmpDealFlg = true;
                    }
                } else {
                    var createdFrom = newRec.getValue('createdfrom');
                    log.debug('createdFrom', createdFrom);
                    if (createdFrom) {
                        tmpDealFlg = true;
                    }
                }
                if (tmpDealFlg) {
                    // ���F�����N���A����
                    fieldClear(fieldList, newRec);
                    // var subsidiary = newRec.getValue('subsidiary');
                    // if (SUB_NBKK == subsidiary || SUB_ULKK == subsidiary) {
                    // newRec.setValue({
                    // fieldId : fieldList[0],
                    // value : 'T'
                    // });
                    // }
                }

                // �����敪
                var dealKbn = '1';
                var resultObj = getDealRole(subsidiary, approvalObj, dealKbn, currentRole);
                log.error('create resultObj', JSON.stringify(resultObj));
                if (Object.keys(resultObj).length > 0) {
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
                            var tmpUsreList = [];
                            var tmpStrCuser = String(currentUserId);
                            tmpUsreList.push(tmpStrCuser);
                            var tmpCreateUserId = newRec.getValue(fieldList[4]);
                            if (tmpCreateUserId) {
                                var tmpCUserId = String(tmpCreateUserId);
                                if (tmpStrCuser != tmpCUserId) {
                                    tmpUsreList.push(tmpCUserId);
                                }
                            }
                            getApprNextUser(form, resultObj.role, tmpUsreList);
                        }
                    }
                }
            }
            // WF�o���f�[�V�������� zheng 20230313 end

            // DJ_���F�����t���O
            var apprDealFlg = newRec.getValue(fieldList[0]);
            log.error('create apprDealFlg', apprDealFlg);
            if (apprDealFlg && scriptContext.type == 'edit') {
                // DJ_���̏��F��
                var apprNextUsreField = form.getField({
                    id : fieldList[1]
                });
                log.error('fieldList[1]', fieldList[1]);
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
                    if (scriptContext.type == 'edit') {
                        // DJ_���̏��F���[��
                        var apprNextRole = newRec.getValue(fieldList[2]);
                        if (apprNextRole) {
                            var tmpUsreList = [];
                            var tmpStrCuser = String(currentUserId);
                            tmpUsreList.push(tmpStrCuser);
                            var tmpCreateUserId = newRec.getValue(fieldList[4]);
                            if (tmpCreateUserId) {
                                var tmpCUserId = String(tmpCreateUserId);
                                if (tmpStrCuser != tmpCUserId) {
                                    tmpUsreList.push(tmpCUserId);
                                }
                            }
                            getApprNextUser(form, apprNextRole, tmpUsreList);
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
                headList.push('custbody_djkk_approval_reset_memo');
                headList.push('custbody_djkk_approval_kyaltuka_memo');
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
        log.error('fieldIdList', fieldIdList);
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
        // for (var j = 0; j < subListIdList.length; j++) {
        // var tmpSubListId = '';
        // try {
        // tmpSubListId = subListIdList[j];
        // log.error('sublist', tmpSubListId);
        // if (subListList.indexOf(tmpSubListId) == -1) {
        // var tmpSubSublist = form.getSublist({
        // id : tmpSubListId
        // });
        // if (tmpSubSublist) {
        // tmpSubSublist.displayType = serverWidget.SublistDisplayType.HIDDEN;
        // }
        // }
        // } catch (e) {
        // log.error('sublist', tmpSubListId + '�F' + e.message);
        // }
        // }
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
        if (subsidiary) {
            searchFilters.push("AND");
            searchFilters.push(["custrecord_djkk_trans_appr_subsidiary", "anyof", subsidiary]);
        }
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_obj", "anyof", approvalObj]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_trans_appr_create_role", "anyof", currentRole]);

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

        if (recType == 'estimate') {
            result = '1';
        } else if (recType == 'salesorder') {
            result = '2';
        } else if (recType == 'customerdeposit') {
            result = '3';
        } else if (recType == 'returnauthorization') {
            result = '4';
        } else if (recType == 'creditmemo') {
            result = '5';
        } else if (recType == 'purchaseorder') {
            result = '6';
        } else if (recType == 'vendorbill') {
            result = '7';
        } else if (recType == 'vendorreturnauthorization') {
            result = '8';
        } else if (recType == 'vendorcredit') {
            result = '9';
        } else if (recType == 'invoice') {
            result = '11';
        } else if (recType == 'inventoryadjustment') {
            result = '19';
        }

        return result;
    }

    /**
     * �ǉ��̏��F�҂�ݒ肷��
     */
    function getApprNextUser(form, nextRoleId, tmpUsreList) {

        var apprNextUsreField = form.getField({
            id : 'custpage_djkk_trans_appr_user'
        });
        log.error('apprNextUsreField', apprNextUsreField);
        if (apprNextUsreField) {
            apprNextUsreField.addSelectOption({
                value : '',
                text : ''
            });
            var resultDic = getApprNextUserList(nextRoleId, tmpUsreList);
            log.error('nextRoleId', nextRoleId);
            for ( var rdId in resultDic) {
                apprNextUsreField.addSelectOption({
                    value : rdId,
                    text : resultDic[rdId]
                });
            }
        }
    }

    /**
     * �w�胍�[�����̏]�ƈ����擾����
     */
    function getApprNextUserList(roleId, tmpUsreList) {

        var resultDic = {};

        var searchType = 'employee';
        var searchFilters = [["role", "anyof", roleId], "AND", ["isinactive", "is", "F"]];
        var searchColumns = [search.createColumn({
            name : "formulatext",
            formula : "{entityid}",
            label : "�]�ƈ�ID"
        })];

        log.debug("szk", JSON.stringify(tmpUsreList));
        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpResult = searchResults[i];
                log.error('tmpResult', tmpResult);
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

        var SUB_SCETI = 6;
        var SUB_DPKK = 7;

        var currentUser = runtime.getCurrentUser();
        var currentUserId = currentUser.id;

        var type = scriptContext.type;
        var curRec = scriptContext.newRecord;
        var recordType = curRec.type;
        if (type == 'delete') {
            return;
        }

        if (runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
            if (type == 'create') {
                // ������
                if (curRec.type == 'purchaseorder') {
                    var apprFlag = curRec.getValue('custbody_djkk_trans_appr_deal_flg');
                    if (!apprFlag) {
                        curRec.setValue({
                            fieldId : 'approvalstatus',
                            value : '2'
                        });
                    }
                    // �x��������
                } else if (curRec.type == 'vendorbill') {
                    var apprFlag = curRec.getValue('custbody_djkk_trans_appr_deal_flg');
                    if (!apprFlag) {
                        curRec.setValue({
                            fieldId : 'approvalstatus',
                            value : '2'
                        });
                    }
                    // ������
                } else if (curRec.type == 'salesorder') {
                    var soSubsidiary = curRec.getValue('subsidiary');
                    if (SUB_SCETI == soSubsidiary || SUB_DPKK == soSubsidiary) {
                        var apprFlag = curRec.getValue('custbody_djkk_trans_appr_deal_flg');
                        if (!apprFlag) {
                            curRec.setValue({
                                fieldId : 'orderstatus',
                                value : 'B'
                            });
                        }
                    }
                    // ������
                } else if (curRec.type == 'invoice') {
                    var apprFlag = curRec.getValue('custbody_djkk_trans_appr_deal_flg');
                    if (!apprFlag) {
                        curRec.setValue({
                            fieldId : 'approvalstatus',
                            value : '2'
                        });
                    }
                    // �ڋq�ԕi
                } else if (curRec.type == 'returnauthorization') {
                    var apprFlag = curRec.getValue('custbody_djkk_trans_appr_deal_flg');
                    if (!apprFlag) {
                        curRec.setValue({
                            fieldId : 'orderstatus',
                            value : 'B'
                        });
                    }
                } else {
                    // �����Ȃ�
                }
            }
        }
    }

    /**
     * �t�B�[���h�o�����[���N���A����
     */
    function fieldClear(fieldList, newRec) {
        for (var i = 1; i < fieldList.length; i++) {
            var fieldId = fieldList[i];
            if (fieldId) {
                var tmpField = newRec.getField({
                    fieldId : fieldId
                })
                if (tmpField) {
                    if (fieldId == fieldList[21]) {
                        newRec.setValue({
                            fieldId : fieldId,
                            value : 'F'
                        });
                    } else {
                        newRec.setValue({
                            fieldId : fieldId,
                            value : ''
                        });
                    }
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
    function afterSubmit(scriptContext) {

        var curRecd = scriptContext.newRecord;
        var id = curRecd.id;
        var type = curRecd.type;
        if (type == 'delete') {
            return;
        }
        var japanAmt = getJapanAmt(id);
        if (japanAmt) {
            record.submitFields({
                type : type,
                id : id,
                values : {
                    custbody_djkk_trans_appr_amt : japanAmt
                }
            });
        }
    }

    /**
     * ���z���擾����
     */
    function getJapanAmt(id) {

        var resultAmt = null;

        var searchType = 'transaction';
        var searchFilters = [["mainline", "is", "T"], "AND", ["internalid", "anyof", id]];
        var searchColumns = [search.createColumn({
            name : "amount",
            label : "���z"
        })];
        var amtResults = djkk_common.getCreateSearchResults(searchType, searchFilters, searchColumns);
        if (amtResults && amtResults.length > 0) {
            resultAmt = amtResults[0].getValue(searchColumns[0]);
        }

        return resultAmt;
    }

    return {
        beforeLoad : beforeLoad,
        beforeSubmit : beforeSubmit,
        afterSubmit : afterSubmit
    };
});
