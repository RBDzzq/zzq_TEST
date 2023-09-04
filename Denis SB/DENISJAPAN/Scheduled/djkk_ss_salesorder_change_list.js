/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Aug 2021     gsy95
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {

    try {

        nlapiLogExecution('debug', '', '�������ꊇ�����J�n');

        var param = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_ss_salesorder_change_par');
        var paramNew = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_ss_salesorder_chg_parnew');
        nlapiLogExecution('debug', 'param', param);

        // �����f�[�^�𐮗�����
        var soIdList = new Array();
        var strArr = param.split(',');

        for ( var i = 0; i < strArr.length; i++) {

            if (isEmpty(strArr[i])) {
                continue;
            }
            var lineArr = strArr[i].split('_');

            var tmpSoId = lineArr[0];
            // SO����ID
            if (soIdList.indexOf(tmpSoId) == -1) {
                soIdList.push(tmpSoId);
            }
        }
        nlapiLogExecution('debug', 'soIdList', JSON.stringify(soIdList));

        // SO�ꏊ�ƃ��C��ID�𐮗�����
        var soInfoDic = {};
        for ( var k = 0; k < soIdList.length; k++) {

            var soId = soIdList[k];

            var tmpLocDic = {};
            for ( var i = 0; i < strArr.length; i++) {

                if (isEmpty(strArr[i])) {
                    continue;
                }
                var lineArr = strArr[i].split('_');

                var tmpSoId = lineArr[0];
                if (soId != tmpSoId) {
                    continue;
                }

                var tmpLineId = lineArr[1];
                var tmpLocId = lineArr[3];

                var tmpLineList = [];
                tmpLineList.push(tmpLineId);

                var tmpLocDicVal = tmpLocDic[tmpLocId];
                if (tmpLocDicVal) {
                    var tmpDicList = tmpLocDicVal.concat(tmpLineList);
                    tmpLocDic[tmpLocId] = tmpDicList;
                } else {
                    tmpLocDic[tmpLocId] = tmpLineList;
                }
            }

            soInfoDic[soId] = tmpLocDic;
        }

        nlapiLogExecution('debug', 'soInfoDic', JSON.stringify(soInfoDic));

        // SO���F�X�e�[�^�X���X�V
        for ( var k = 0; k < soIdList.length; k++) {

            governanceYield();

            var soId = soIdList[k];

            var commitFlg = false;
            var rec = nlapiLoadRecord('salesorder', soId);
            if (rec.getFieldValue('orderstatus') == 'A') {
                rec.setFieldValue('orderstatus', 'B');
                commitFlg = true;
            }

            try {
                if (commitFlg) {
                    nlapiSubmitRecord(rec);
                }
            } catch (e) {
                nlapiLogExecution('ERROR', '�G���[', e.message);
            }
        }

        // �z���Ɛ��������쐬
        for (sidId in soInfoDic) {

            governanceYield();

            var billMailFlg = nlapiLookupField('salesorder', sidId, 'custbody_djkk_finet_bill_mail_flg');

            var sidValDic = soInfoDic[sidId];
            for (svId in sidValDic) {

                governanceYield();

                try {
                    // �z��
                    var ifRecord = nlapiTransformRecord('salesorder', sidId, 'itemfulfillment', {
                        inventorylocation : svId
                    });
                    ifRecord.setFieldValue('shipstatus', 'C');
                    var count = ifRecord.getLineItemCount('item');
                    for ( var q = 1; q < count + 1; q++) {
                        ifRecord.selectLineItem('item', q);
                        ifRecord.setCurrentLineItemValue('item', 'location', svId);
                        ifRecord.commitLineItem('item');
                    }
                    nlapiSubmitRecord(ifRecord, false, true);
                } catch (e) {
                    nlapiLogExecution('error', 'create itemfulfillment', e.message);
                }
            }

            try {
                // ������
                var invRecord = nlapiTransformRecord('salesorder', sidId, 'invoice');
                if (billMailFlg == 'T') {
                    invRecord.setFieldValue('custbody_djkk_finet_shipping_typ', 1);
                }
                // add by zhou CH611 20230529 start
                var entityId = invRecord.getFieldValue('entity');
                var requestday='';
                if(!isEmpty(entityId)){
                    var flag=nlapiLookupField('customer', entityId, 'custentity_djkk_requestday_flag');
                    if(flag=='sd'){
                        requestday=invRecord.getFieldValue('shipdate');
                    }else if(flag=='dd'){
                        requestday=invRecord.getFieldValue('custbody_djkk_delivery_date');
                        }
                    if(isEmpty(requestday)){
                        requestday=nlapiDateToString(getSystemTime());
                        }
                    invRecord.setFieldValue('trandate',requestday); 
                    // CH700 zheng 20230711 start
                    // ���F�����N���A����
                    fieldClear(invRecord);
                    var tmpParams = paramNew.split('_');
                    nlapiLogExecution('error', 'paramNew', paramNew);
                    var subsidiary = tmpParams[0];
                    var currentRole = tmpParams[1];
                    var createUser = tmpParams[2]
                    var resultObj = getDealRole(subsidiary, currentRole);
                    if (Object.keys(resultObj).length > 0) {
                        // DJ_���F�t���O
                        invRecord.setFieldValue('custbody_djkk_trans_appr_deal_flg', 'T');
                        // DJ_�쐬���[��
                        if (resultObj.createRole) {
                            invRecord.setFieldValue('custbody_djkk_trans_appr_create_role', resultObj.createRole);   
                        }
                        // DJ_�쐬��
                        if (createUser) {
                            invRecord.setFieldValue('custbody_djkk_trans_appr_create_user', createUser);   
                        }
                        // DJ_���̏��F���[��
                        if (resultObj.nextRole) {
                            invRecord.setFieldValue('custbody_djkk_trans_appr_next_role', resultObj.nextRole);   
                        }
                    }
                    // CH700 zheng 20230711 end
                }
                // add by zhou CH611 20230529 end
                nlapiSubmitRecord(invRecord, false, true);
            } catch (e) {
                nlapiLogExecution('error', 'create invoice', e.message);
            }
        }

        nlapiLogExecution('debug', '', '�������ꊇ�����I��');
    } catch (e) {
        nlapiLogExecution('ERROR', '�G���[', e.message);
    }
}

/**
 * �K�o�i���X���Z�b�g
 */
function governanceYield() {
    if (parseInt(nlapiGetContext().getRemainingUsage()) <= 300) {
        var state = nlapiYieldScript();
        if (state.status == 'FAILURE') {
            nlapiLogExecution('DEBUG', 'Failed to yield script.');
        } else if (state.status == 'RESUME') {
            nlapiLogExecution('DEBUG', 'Resuming script');
        }
    }
}

// CH700 zheng 20230711 start
function fieldClear(newRec) {
    var fieldList = [];
    fieldList.push('custbody_djkk_trans_appr_deal_flg');// 0
    fieldList.push('custbody_djkk_trans_appr_user');// 1
    fieldList.push('custbody_djkk_trans_appr_next_role');// 2
    fieldList.push('custbody_djkk_trans_appr_create_role');// 3
    fieldList.push('custbody_djkk_trans_appr_create_user');// 4
    fieldList.push('custbody_djkk_trans_appr_status');// 5
    fieldList.push('custbody_djkk_trans_appr1_role');// 6
    fieldList.push('custbody_djkk_trans_appr1_user');// 7
    fieldList.push('custbody_djkk_trans_appr2_role');// 8
    fieldList.push('custbody_djkk_trans_appr2_user');// 9
    fieldList.push('custbody_djkk_trans_appr3_role');// 10
    fieldList.push('custbody_djkk_trans_appr3_user');// 11
    fieldList.push('custbody_djkk_trans_appr4_role');// 12
    fieldList.push('custbody_djkk_trans_appr4_user');// 13
    fieldList.push('custbody_djkk_trans_appr_dev');// 14
    fieldList.push('custbody_djkk_trans_appr_dev_user');// 15
    fieldList.push('custbody_djkk_trans_appr_cdtn_amt');// 16
    fieldList.push('custbody_djkk_trans_appr_user');// 17
    fieldList.push('custbody_djkk_approval_reset_memo');// 18
    fieldList.push('custbody_djkk_approval_kyaltuka_memo');// 19
    fieldList.push('custbody_djkk_trans_appr_do_cdtn_amt');// 20
    fieldList.push('custbody_djkk_bribery_final_mail');// 21
    fieldList.push('custbody_djkk_trans_appr_amt');// 22
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
//                        value : 'F'
                        value : false
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
 * ���F�Ώۃf�[�^���擾����
 */
function getDealRole(subsidiary, currentRole) {
    
    var resultObj = {};
    
    var approvalObj = 11;
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
    
    var searchColumns = [];
    searchColumns.push(new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"));
    searchColumns.push(new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"));
    var searchResults = getSearchResults(searchType, null, searchFilters, searchColumns);
    if (searchResults && searchResults.length > 0) {
        for (var i = 0; i < searchResults.length; i++) {
            var tmpResult = searchResults[i];
            var tmpCreateRole = tmpResult.getValue(searchColumns[0]);
            resultObj.createRole = tmpCreateRole;
            var tmpNextRole = tmpResult.getValue(searchColumns[1]);
            resultObj.nextRole = tmpNextRole;
        }
    }
    
    return resultObj;
}
//CH700 zheng 20230711 end