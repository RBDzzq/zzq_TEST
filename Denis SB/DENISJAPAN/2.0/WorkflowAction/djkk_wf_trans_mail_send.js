/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/email', 'N/search','SuiteScripts/DENISJAPAN/2.0/Common/dj_url_common'], function(runtime, email, search ,cabinet) {
	//Common 'dj_url_commmon' is added by zhou on 20230418.
    // �t�B�[���h�}�b�s���O
    var FIELD_MAPPING = {};
    var TRANS_LIST = [];
    TRANS_LIST.push('custbody_djkk_trans_appr_dev');// 0
    TRANS_LIST.push('custbody_djkk_trans_appr_dev_user');// 1

    var ARRIVAL_LIST = [];
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_dev');// 0
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_dev_user');// 1
   
    /************new************/
    //DJ_�N���W�b�g�������F���
    var creditNoteApproval_LIST = [];
    creditNoteApproval_LIST.push('custrecord_djkk_create_note_oper_roll');// DJ_���݂̏��F���[��
    creditNoteApproval_LIST.push('custrecord_djkk_create_note_acknowledge');// 	DJ_���݂̏��F��
    /************new************/
    //20230529 add by zhou start
    /************new************/
    //DJ_���n�I�����F���
    var body_shedunloadingApproval_LIST = [];
    body_shedunloadingApproval_LIST.push('custrecord_djkk_shedunloading_oper_role');// DJ_���݂̏��F���[��
    body_shedunloadingApproval_LIST.push('custrecord_djkk_shedunloading_oper_user');// DJ_���݂̏��F��
    /************new************/
  //20230529 add by zhou end
    var URL_HEAD = cabinet.urlHead('URL_HEAD');//20230418 add by zhou
    var SECURE_URL_HEAD = cabinet.urlHead('SECURE_URL_HEAD');//20230418 add by zhou
    // ���Ϗ�
    FIELD_MAPPING['1'] = TRANS_LIST;
    // ������
    FIELD_MAPPING['2'] = TRANS_LIST;
    // �O���
    FIELD_MAPPING['3'] = TRANS_LIST;
    // �ڋq�ԕi
    FIELD_MAPPING['4'] = TRANS_LIST;
    //20230106 changed by zhou start
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
    //20230529 add by zhou start
    /************new************/
    //DJ_���n�I�����F���
    FIELD_MAPPING['13'] = body_shedunloadingApproval_LIST;
    /************new************/
    //20230529 add by zhou end
    /************new************/
    //DJ_�N���W�b�g�������F���
    FIELD_MAPPING['15'] = creditNoteApproval_LIST;
    /************new************/
    //end
    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	log.error('start','start');
        var newRecord = scriptContext.newRecord;
    	var newRecordID = newRecord.getValue('id');
    	log.error('newRecordID',newRecordID);
        var script = runtime.getCurrentScript();
        log.error('script',script);
        
        // ���F�Ώ�
        var mailObj = script.getParameter({
            name : 'custscript_djkk_trans_mail_obj'
        });
        log.error('mailObj', mailObj);
        var fieldList = FIELD_MAPPING[mailObj];
        log.error('fieldList', fieldList);
        log.error('fieldList1', fieldList[0]);
        log.error('fieldList2', fieldList[1]);
        // DJ_���F���샍�[��
        var devRole;
        // DJ_���F�����
        var devUser;
        //20230106 changed by zhou U408 start
        if(mailObj == '15'){
        	 //DJ_�N���W�b�g�������F���
        	var getUser =  runtime.getCurrentUser();
        	// DJ_���F���샍�[��
            devRole = getUser.role;
            // DJ_���F�����
            devUser = getUser.id;
            //id
            var createMemoId = newRecord.getValue('custrecord_djkk_credit_creditmemo');
        	
        }else{
            // DJ_���F���샍�[��
            devRole = newRecord.getValue(fieldList[0]);
            // DJ_���F�����
            devUser = newRecord.getValue(fieldList[1]);
            
        }
        log.error('devRole', devRole);
        log.error('devUser', devUser);
        //end
        var userDic = getApprNextUserList(devRole, devUser);
        log.error('userDic', JSON.stringify(userDic));
        if (Object.keys(userDic).length > 0) {
        	//20230106 changed by zhou U408 start
        	/************old************/
        	// var senderId = '-5';
        	/************old************/
        	/************new************/
        	var senderId = '737';
        	/************new************/
        	//end
            var recipients = getRecipients(userDic, false);
            log.error('recipients',JSON.stringify(recipients))
            var title = getTitle(mailObj, newRecord);
            var body = getBody(mailObj, newRecord);
            //20230106 changed by zhou U408 start
            if(mailObj == '15'){
	            body = '�o���l�A�����l�ł��B';
	            body += '�N���W�b�g�������쐬����܂����B';
	            body += '���m�F���肢�v���܂��B';
	            body += '�N���W�b�g�����F'+ createMemoId;
            }
            //end
            for (var i = 0; i < recipients.length; i++) {
                var tmpRecipient = recipients[i];
                log.error('tmpRecipient',tmpRecipient)
                log.error('i',i)
                //20230106 changed by zhou start
                //DJ_�N���W�b�g�������F��ʂ݂̂��ŏI���F���[���Ɏ��s���ꂽ�ꍇ�ɑ��M
                if(mailObj == '15' && !isEmpty(createMemoId)){
                	email.send({
                      author : senderId,
                      recipients : tmpRecipient,
                      subject : title,
                      body : body
                	});
                }
                //end
                
              //email.send({
                //  author : senderId,
                 // recipients : tmpRecipient,
                //  subject : title,
                //  body : body
             // });
            }
        }
    }

    /**
     * �{��
     */
    function getBody(mailObj, newRecord) {

        var resultList = [];
        resultList.push('�����N�F');
        resultList.push('<br/>');
        if (mailObj == '1') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/estimate.nl?id=' + newRecord.id + '&whence=');
        } else if (mailObj == '2') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/salesord.nl?id=' + newRecord.id + '&whence=');
        } else if (mailObj == '3') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/custdep.nl?id=' + newRecord.id + '&whence=');
        } else if (mailObj == '4') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/rtnauth.nl?id=' + newRecord.id + '&whence=');
        } else if (mailObj == '5') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/custcred.nl?id=' + newRecord.id + '&whence=');
        } else if (mailObj == '6') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/purchord.nl?id=' + newRecord.id + '&whence=');
        } else if (mailObj == '7') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/vendbill.nl?id=' + newRecord.id + '&whence=');
        } else if (mailObj == '8') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/vendauth.nl?id=' + newRecord.id + '&whence=');
        } else if (mailObj == '9') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/vendcred.nl?id=' + newRecord.id + '&whence=');
        } else if (mailObj == '10') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/shipping/inboundshipment/inboundshipment.nl?id=' + newRecord.id);
        } else if (mailObj == '11') {
            resultList.push(URL_HEAD + '/app/accounting/transactions/custinvc.nl?id=' + newRecord.id + '&whence=');
        }
        /************new************/
        else if (mailObj == '15') {
            resultList.push(URL_HEAD + '/app/common/custom/custrecordentry.nl?rectype=286&id=' + newRecord.id + '&whence=');
        }
        /************new************/
        return resultList.join('');
    }

    /**
     * �^�C�g��
     */
    function getTitle(mailObj, newRecord) {

        var result = '';
        var objVal = '';
        if (mailObj == '1') {
            objVal = newRecord.getValue('tranid');
            result = result + '���Ϗ��F(' + objVal + ')';
        } else if (mailObj == '2') {
            objVal = newRecord.getValue('tranid');
            result = result + '���������F(' + objVal + ')';
        } else if (mailObj == '3') {
            objVal = newRecord.getValue('tranid');
            result = result + '�O������F(' + objVal + ')';
        } else if (mailObj == '4') {
            objVal = newRecord.getValue('tranid');
            result = result + '�ڋq�ԕi���F(' + objVal + ')';
        } else if (mailObj == '5') {
            objVal = newRecord.getValue('tranid');
            result = result + '�N���W�b�g�������F(' + objVal + ')';
        } else if (mailObj == '6') {
            objVal = newRecord.getValue('tranid');
            result = result + '���������F(' + objVal + ')';
        } else if (mailObj == '7') {
            objVal = newRecord.getValue('transactionnumber');
            result = result + '�x�����������F(' + objVal + ')';
        } else if (mailObj == '8') {
            objVal = newRecord.getValue('tranid');
            result = result + '�d����ԕi���F(' + objVal + ')';
        } else if (mailObj == '9') {
            objVal = newRecord.getValue('transactionnumber');
            result = result + '�O����/���|���������F(' + objVal + ')';
        } else if (mailObj == '10') {
            objVal = newRecord.getValue('shipmentnumber');
            result = result + '�����ו�(' + objVal + ')';
        } else if (mailObj == '11') {
            objVal = newRecord.getValue('tranid');
            result = result + '������(' + objVal + ')';
        }
        /************new************/
        else if (mailObj == '15') {
        	objVal = newRecord.getValue('custrecord_djkk_create_note_tranid');//DJ_�����ԍ�
            result = result + 'DJ_�N���W�b�g�������F���(' + objVal + ')';        
        }
        /************new************/
        return result;
    }
    /**
     * ��M��
     */
    function getRecipients(userDic, addressFlg) {

        var resultList = [];

        for ( var udId in userDic) {
            var tmpAddress = userDic[udId];
            if (addressFlg) {
                resultList.push(tmpAddress);
            } else {
                resultList.push(udId);
            }
        }

        return resultList;
    }

    function getApprNextUserList(roleId, userId) {

        var resultDic = {};

        var searchType = 'employee';
        var searchFilters = [];
        searchFilters.push(["isinactive", "is", "F"]);
        searchFilters.push("AND");
        searchFilters.push(["role", "anyof", roleId]);
        if (userId) {
            searchFilters.push("AND");
            searchFilters.push(["internalid", "anyof", userId]);
        }
        var searchColumns = [search.createColumn({
            name : "formulatext",
            formula : "{email}",
            label : "�d�q���[��"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpResult = searchResults[i];
                var id = tmpResult.id;
                var mail = tmpResult.getValue(searchColumns[0]);
                resultDic[id] = mail;
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
    	if (typeof (obj) == 'boolean') {
    		return false;
    	}
    	if (typeof (obj) == 'number') {
    		return false;
    	}
    	return true;
    }
    
    return {
        onAction : onAction
    };
});
