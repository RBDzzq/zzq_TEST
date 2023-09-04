/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 May 2023     10046
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function workflowAction() {
	var wftype=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_type');
	var recordTypeText=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_recordtypetext');
	var recordType=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_recordtype');
	var recordNumber=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_recordnumber');
	var recordId=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_recordid');
	var body=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_body');
	var to=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_to');
	var loginUser=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_loginuser');
	var loginUserRole = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_role');
	var createUser = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_create_user');
	
	var cc=new Array();
	if(recordType=='item'){
		recordType=nlapiLookupField('item', recordId, 'recordtype');
	}
	if (isEmpty(to)&&!isEmpty(createUser)&&!isEmpty(loginUserRole)) {
		to = [];
		var employeeSearch = nlapiSearchRecord("employee", null, 
				[ 
                  ["internalid","noneof",createUser], 
                  "AND", 
				  [ "role","anyof", loginUserRole ] 
				  ],[ 
				  new nlobjSearchColumn("internalid", null, "GROUP").setSort(false) 
				  ]);
		if (!isEmpty(employeeSearch)) {
			for (var i = 0; i < employeeSearch.length; i++) {
//				if (i == 0) {
//					to = employeeSearch[i].getValue("internalid", null, "GROUP");
//				} else {
//					cc.push(employeeSearch[i].getValue("internalid", null, "GROUP"));
//				}
				to.push(employeeSearch[i].getValue("internalid", null, "GROUP"));
			}
		}
	}
	

	nlapiLogExecution('debug', 'wftype', wftype);
	nlapiLogExecution('debug', 'recordTypeText', recordTypeText);
	nlapiLogExecution('debug', 'recordType', recordType);
	nlapiLogExecution('debug', 'recordNumber', recordNumber);
	nlapiLogExecution('debug', 'recordId', recordId);
	nlapiLogExecution('debug', 'body', body);
	nlapiLogExecution('debug', 'to', to);
	nlapiLogExecution('debug', 'loginUser', loginUser);
	nlapiLogExecution('debug', 'loginUserRole', loginUserRole);
	nlapiLogExecution('debug', 'createUser', createUser);
	nlapiLogExecution('debug', 'cc', cc);
	if(isEmpty(recordNumber)||recordNumber=='null'||recordNumber=='undefined'){
		recordNumber='';
	}
	approvalAutoSendMail(wftype,recordTypeText,recordType,recordNumber,recordId,body,loginUser,to,cc)
}


/**ワークフローメール送信
 * 
 * @param {String} wftype :1,2,3,4
 * @param {String} recordTypeText トランザクション種類のテキスト
 * @param {String} recordType トランザクション種類 マスタ同じです 
 * @param {String} recordNumber ドキュメント番号
 * @param {String} recordId トランザクション内部ID
 * @param {String} body 内容
 * @param {String} loginUser user
 * @param {String} to 受信者
 * @param {String} cc CC
 * @returns {Void}
 */
function approvalAutoSendMail(wftype,recordTypeText,recordType,recordNumber,recordId,body,loginUser,to,cc){
	
	var title='';
	var bodyText='';
	var theLink ='';
	var records = new Object();
	/*  
	 * 1/差戻しの場合
	 * 
	 *件名：▲NetSuite【（トランザクション種類 マスタ同じです）ドキュメント番号】 登録差戻し
	 *内容：下記の修正が必要です。【修正依頼のコメント】表示
	 *修正後に再送信ください。
	 *リンク：NetSuite中でのこの記録へのアクセス
	 */
	if(wftype=='1'){
		title+='▲NetSuite 差戻し : 【（';
		title+=''+recordTypeText+'）';
		title+=''+recordNumber;
		title+='】';
		
		bodyText+='下記の修正が必要です。<br />';
		if(!isEmpty(body)){	
			bodyText+='【'+body+'】<br />';
	        }
		
		bodyText+='修正後に再送信ください。<br />';
	}
	
	/*
	 * 2/却下の場合
	 * 
	 * 件名：！NetSuite登録却下【（トランザクション種類 マスタ同じです）ドキュメント番号】
	 * 内容：【却下理由のコメント】表示
	 * リンク：NetSuite中でのこの記録へのアクセス
	 */
	
	if (wftype == '2') {

		title+='！NetSuite却下 : 【（';
		title+=''+recordTypeText+'）';
		title+=''+recordNumber;
		title+='】';
        if(!isEmpty(body)){	
		bodyText+='【'+body+'】<br />';
        }
	}
	
	/*
	 * 3/アクティベーション後の場合 
	 * 
	 * 件名：★NetSuite登録処理済み【（トランザクション種類 マスタ同じです）ドキュメント番号】 
	 * 内容：-
	 * リンク：NetSuite中でのこの記録へのアクセス
	 */
	if (wftype == '3') {

		title+='★NetSuite最終承認済 : 【（';
		title+=''+recordTypeText+'）';
		title+=''+recordNumber;
		title+='】';
	}
	
	/*
	 * 4/承認お願いの場合
	 * 
	 * 件名：●NetSuite承認お願い【（トランザクション種類 マスタ同じです）ドキュメント番号】 
	 * 内容：下記の承認が必要です。
	 * リンク：NetSuite中でのこの記録へのアクセス
	 */
	if (wftype == '4') {

		title+='●NetSuite承認お願い : 【（';
		title+=''+recordTypeText+'）';
		title+=''+recordNumber;
		title+='】';
		bodyText+='下記の承認が必要です。<br />';
		
	}
	nlapiLogExecution('debug', 'recordType='+recordType,'recordId='+recordId);
	
	//諸掛専用（到着荷物画面へリンク）
	if(recordType == 'customrecord_djkk_landed_cost'){
		var inboundshipmentSearch = nlapiSearchRecord("inboundshipment", null, 
				[ 
				  [ "shipmentnumber","anyof", recordNumber ] 
				  ],[ 
				  new nlobjSearchColumn("internalid", null, "GROUP").setSort(false) 
				  ]);
		if(!isEmpty(inboundshipmentSearch)){//changed by song add 0531
			inboundshipmentId = inboundshipmentSearch[0].getValue("internalid", null, "GROUP");
			theLink = nlapiResolveURL('RECORD','inboundshipment',inboundshipmentId, 'VIEW');
		}
	}else{
		theLink = nlapiResolveURL('RECORD',recordType,recordId, 'VIEW');
	}
	nlapiLogExecution('debug', 'theLink',theLink);
	bodyText+='<a href="'+URL_HEAD+theLink+'">リンク：NetSuite中でのこの記録へのアクセス</a>';
	
	if(recordType.indexOf('customrecord')>-1){
		records['recordtype'] = recordType;
		records['record'] = recordId;
	}else if(recordType.indexOf('item')>-1){
		
	}else if(recordType=='customer'||recordType=='vendor'){
		records['entity'] = recordId;
	}
	else{
		records['transaction'] = recordId;
		
	}
	nlapiLogExecution('debug', 'loginUser',loginUser);
	nlapiLogExecution('debug', 'to',to);
	nlapiLogExecution('debug', 'title',title);
	nlapiLogExecution('debug', 'bodyText',bodyText);
	nlapiLogExecution('debug', 'cc',cc);
	nlapiLogExecution('debug', 'records[recordtype]',records['recordtype']);
	nlapiLogExecution('debug', 'records[record]',records['record']);
	nlapiLogExecution('debug', 'records[entity]',records['entity']);
	nlapiLogExecution('debug', 'records[transaction]',records['transaction']);
	nlapiSendEmail(loginUser, to, title, bodyText,null,null,records);
	nlapiLogExecution('debug', 'afterSendMali');
}
