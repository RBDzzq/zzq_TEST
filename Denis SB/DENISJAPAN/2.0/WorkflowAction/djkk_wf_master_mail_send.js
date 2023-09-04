/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/email', 'N/search',
		'SuiteScripts/DENISJAPAN/2.0/Common/dj_url_common'], function(runtime, email, search ,cabinet) {
	//Common 'dj_url_commmon' is added by zhou on 20230418.
    // �t�B�[���h�}�b�s���O
    var FIELD_MAPPING = {};
    var ENTITY_LIST = [];
    ENTITY_LIST.push('custentity_djkk_request_class'); // 0
    ENTITY_LIST.push('custentity_djkk_approval_dev');// 1
    ENTITY_LIST.push('custentity_djkk_approval_dev_user');// 2
    FIELD_MAPPING['1'] = ENTITY_LIST;
    FIELD_MAPPING['2'] = ENTITY_LIST;

    // �A�C�e��
    var ITEM_LIST = [];
    ITEM_LIST.push('custitem_djkk_request_classification');// 0
    ITEM_LIST.push('custitem_djkk_approval_dev');// 1
    ITEM_LIST.push('custitem_djkk_approval_dev_user');// 2
    FIELD_MAPPING['3'] = ITEM_LIST;
    var URL_HEAD = cabinet.urlHead('URL_HEAD');//20230418 add by zhou
    var SECURE_URL_HEAD = cabinet.urlHead('SECURE_URL_HEAD');//20230418 add by zhou
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

        var script = runtime.getCurrentScript();

        // ���F�Ώ�
        var mailObj = script.getParameter({
            name : 'custscript_djkk_mail_obj'
        });
        log.error('mailObj', mailObj);
        var fieldList = FIELD_MAPPING[mailObj];

        // �˗��敪
        var requestClass = newRecord.getValue(fieldList[0]);
        log.error('requestClass', requestClass);
        // DJ_���F���샍�[��
        var devRole = newRecord.getValue(fieldList[1]);
        log.error('fieldList[1]', fieldList[1]);
        log.error('devRole', devRole);
        // DJ_���F�����
        var devUser = newRecord.getValue(fieldList[2]);
        log.error('devUser', devUser);

       if(!isEmpty(devRole)){
        var userDic = getApprNextUserList(devRole, devUser);
        if (Object.keys(userDic).length > 0) {
            var senderId = '-5';
            var recipients = getRecipients(userDic, false);
            var title = getTitle(mailObj, newRecord, requestClass);
            var body = getBody(mailObj, newRecord);
            for (var i = 0; i < recipients.length; i++) {
                var tmpRecipient = recipients[i];
               // email.send({
                 //   author : senderId,
                 //   recipients : tmpRecipient,
                 //   subject : title,
                 //   body : body
               // });
            }
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
            resultList.push(URL_HEAD + '/app/common/entity/custjob.nl?id=' + newRecord.id);
        } else if (mailObj == '2') {
            resultList.push(URL_HEAD + '/app/common/entity/vendor.nl?id=' + newRecord.id);
        } else if (mailObj == '3') {
            resultList.push(URL_HEAD + '/app/common/item/item.nl?id=' + newRecord.id);
        }

        return resultList.join('');
    }

    /**
     * �^�C�g��
     */
    function getTitle(mailObj, newRecord, requestClass) {

        var result = '';
        var objVal = '';
        var type = '';
        if (requestClass == '1') {
            type = '�V�K';
        } else {
            type = '�C��';
        }
        if (mailObj == '1') {
            objVal = newRecord.getValue('entityid');
            result = result + '�ڋq' + type + '���F(' + objVal + ')';
        } else if (mailObj == '2') {
            objVal = newRecord.getValue('entityid');
            result = result + '�d����' + type + '���F(' + objVal + ')';
        } else if (mailObj == '3') {
            objVal = newRecord.getValue('itemid');
            result = result + '�A�C�e��' + type + '���F(' + objVal + ')';
        }

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
        if (!isEmpty(userId)) {
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
    
    return {
        onAction : onAction
    };
});
