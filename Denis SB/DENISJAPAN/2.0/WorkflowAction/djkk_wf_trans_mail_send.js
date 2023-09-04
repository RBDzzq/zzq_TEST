/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/email', 'N/search','SuiteScripts/DENISJAPAN/2.0/Common/dj_url_common'], function(runtime, email, search ,cabinet) {
	//Common 'dj_url_commmon' is added by zhou on 20230418.
    // フィールドマッピング
    var FIELD_MAPPING = {};
    var TRANS_LIST = [];
    TRANS_LIST.push('custbody_djkk_trans_appr_dev');// 0
    TRANS_LIST.push('custbody_djkk_trans_appr_dev_user');// 1

    var ARRIVAL_LIST = [];
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_dev');// 0
    ARRIVAL_LIST.push('custrecord_djkk_arriv_appr_dev_user');// 1
   
    /************new************/
    //DJ_クレジットメモ承認画面
    var creditNoteApproval_LIST = [];
    creditNoteApproval_LIST.push('custrecord_djkk_create_note_oper_roll');// DJ_現在の承認ロール
    creditNoteApproval_LIST.push('custrecord_djkk_create_note_acknowledge');// 	DJ_現在の承認者
    /************new************/
    //20230529 add by zhou start
    /************new************/
    //DJ_実地棚卸承認画面
    var body_shedunloadingApproval_LIST = [];
    body_shedunloadingApproval_LIST.push('custrecord_djkk_shedunloading_oper_role');// DJ_現在の承認ロール
    body_shedunloadingApproval_LIST.push('custrecord_djkk_shedunloading_oper_user');// DJ_現在の承認者
    /************new************/
  //20230529 add by zhou end
    var URL_HEAD = cabinet.urlHead('URL_HEAD');//20230418 add by zhou
    var SECURE_URL_HEAD = cabinet.urlHead('SECURE_URL_HEAD');//20230418 add by zhou
    // 見積書
    FIELD_MAPPING['1'] = TRANS_LIST;
    // 注文書
    FIELD_MAPPING['2'] = TRANS_LIST;
    // 前受金
    FIELD_MAPPING['3'] = TRANS_LIST;
    // 顧客返品
    FIELD_MAPPING['4'] = TRANS_LIST;
    //20230106 changed by zhou start
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
    //20230529 add by zhou start
    /************new************/
    //DJ_実地棚卸承認画面
    FIELD_MAPPING['13'] = body_shedunloadingApproval_LIST;
    /************new************/
    //20230529 add by zhou end
    /************new************/
    //DJ_クレジットメモ承認画面
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
        
        // 承認対象
        var mailObj = script.getParameter({
            name : 'custscript_djkk_trans_mail_obj'
        });
        log.error('mailObj', mailObj);
        var fieldList = FIELD_MAPPING[mailObj];
        log.error('fieldList', fieldList);
        log.error('fieldList1', fieldList[0]);
        log.error('fieldList2', fieldList[1]);
        // DJ_承認操作ロール
        var devRole;
        // DJ_承認操作者
        var devUser;
        //20230106 changed by zhou U408 start
        if(mailObj == '15'){
        	 //DJ_クレジットメモ承認画面
        	var getUser =  runtime.getCurrentUser();
        	// DJ_承認操作ロール
            devRole = getUser.role;
            // DJ_承認操作者
            devUser = getUser.id;
            //id
            var createMemoId = newRecord.getValue('custrecord_djkk_credit_creditmemo');
        	
        }else{
            // DJ_承認操作ロール
            devRole = newRecord.getValue(fieldList[0]);
            // DJ_承認操作者
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
	            body = '経理様、お疲れ様です。';
	            body += 'クレジットメモを作成されました。';
	            body += 'ご確認お願い致します。';
	            body += 'クレジットメモ：'+ createMemoId;
            }
            //end
            for (var i = 0; i < recipients.length; i++) {
                var tmpRecipient = recipients[i];
                log.error('tmpRecipient',tmpRecipient)
                log.error('i',i)
                //20230106 changed by zhou start
                //DJ_クレジットメモ承認画面のみが最終承認ロールに実行された場合に送信
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
     * 本文
     */
    function getBody(mailObj, newRecord) {

        var resultList = [];
        resultList.push('リンク：');
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
     * タイトル
     */
    function getTitle(mailObj, newRecord) {

        var result = '';
        var objVal = '';
        if (mailObj == '1') {
            objVal = newRecord.getValue('tranid');
            result = result + '見積承認(' + objVal + ')';
        } else if (mailObj == '2') {
            objVal = newRecord.getValue('tranid');
            result = result + '注文書承認(' + objVal + ')';
        } else if (mailObj == '3') {
            objVal = newRecord.getValue('tranid');
            result = result + '前受金承認(' + objVal + ')';
        } else if (mailObj == '4') {
            objVal = newRecord.getValue('tranid');
            result = result + '顧客返品承認(' + objVal + ')';
        } else if (mailObj == '5') {
            objVal = newRecord.getValue('tranid');
            result = result + 'クレジットメモ承認(' + objVal + ')';
        } else if (mailObj == '6') {
            objVal = newRecord.getValue('tranid');
            result = result + '発注書承認(' + objVal + ')';
        } else if (mailObj == '7') {
            objVal = newRecord.getValue('transactionnumber');
            result = result + '支払請求書承認(' + objVal + ')';
        } else if (mailObj == '8') {
            objVal = newRecord.getValue('tranid');
            result = result + '仕入先返品承認(' + objVal + ')';
        } else if (mailObj == '9') {
            objVal = newRecord.getValue('transactionnumber');
            result = result + '前払金/買掛金調整承認(' + objVal + ')';
        } else if (mailObj == '10') {
            objVal = newRecord.getValue('shipmentnumber');
            result = result + '到着荷物(' + objVal + ')';
        } else if (mailObj == '11') {
            objVal = newRecord.getValue('tranid');
            result = result + '請求書(' + objVal + ')';
        }
        /************new************/
        else if (mailObj == '15') {
        	objVal = newRecord.getValue('custrecord_djkk_create_note_tranid');//DJ_入金番号
            result = result + 'DJ_クレジットメモ承認画面(' + objVal + ')';        
        }
        /************new************/
        return result;
    }
    /**
     * 受信者
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
            label : "電子メール"
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
