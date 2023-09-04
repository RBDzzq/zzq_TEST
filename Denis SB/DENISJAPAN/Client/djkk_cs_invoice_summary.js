/**
 * DJ_合計請求書
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jul 2021     admin
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {

	
	
	var count = nlapiGetLineItemCount('list')
	var zeroflg = true;
	for(var i = 0 ; i < count ; i++){
		if(nlapiGetLineItemValue('list', 'chk',i+1) == 'T'){
			zeroflg = false;
		}
	}
	if(zeroflg){
		alert('対象選択してください。')
		return false;
	}
	
	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
function clientValidateField(type, name, linenum) {

	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
if(name == 'custpage_subsidiary' || name == 'custpage_active' || name == 'custpage_suitel10n_inv_closing_date2' || (name == 'custpage_customer' &&(nlapiGetFieldValue('custpage_subsidiary') != '1' &&nlapiGetFieldValue('custpage_subsidiary') != '6' && nlapiGetFieldValue('custpage_subsidiary')!='7'))){
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_summary', 'customdeploy_djkk_sl_invoice_summary');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {

	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type) {


	
	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateInsert(type) {

	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type) {

	return true;
}

/*
 *更新
 */
function refresh(){
	window.ischanged = false;
	location=location;
}

//add by 20230515 zhou CH418 start
/*
 *PDFプレビュー
 */
function pdfPreview(folderId){
	var folderSearch = nlapiSearchRecord("folder",null,
			[
			   ["internalid","anyof",folderId]
			], 
			[
			   new nlobjSearchColumn("url","file",null)
			]
			);
	var urlArr = [];
	if(!isEmpty(folderSearch)){
		 nlapiLogExecution('debug','folderSearch.length ',folderSearch.length);
		 for(var cd = 0 ; cd < folderSearch.length ; cd++){
			 if(!isEmpty(folderSearch[cd].getValue("url","file",null))){
				 urlArr.push(folderSearch[cd].getValue("url","file",null));
			 }
		 }
	}
	for(var i = 0 ; i < urlArr.length ; i++){
		window.open(URL_HEAD +urlArr[i]);
	}
}
/*
*送信
*/
function sendEmail(keyId){

	var jobSearch = nlapiSearchRecord("customrecord_djkk_inv_summary_execution",null,
			[
			   ["internalid","anyof",keyId]
			], 
			[ 
			   new nlobjSearchColumn("custrecord_djkk_totalinv_num"), 
			]
			);
	

	var totalinvNum = jobSearch[0].getValue("custrecord_djkk_totalinv_num");
	var totalinvNumArr = totalinvNum.split(/[(\r\n)\r\n]+/);
	for(var k=0;k<totalinvNumArr.length;k++){
		if(!totalinvNumArr[k]){
			totalinvNumArr.splice(k,1);
		};
	}
	nlapiLogExecution('debug','totalinvNumArr',totalinvNumArr);
//	totalinvNumArr.forEach((item,index))=>{
//		
//	};
	for(var i =0;i<totalinvNumArr.length;i++){
		var summarySearch = nlapiSearchRecord("customrecord_djkk_invoice_summary",null,
				[
				   ["custrecord_djkk_totalinv_no","is",totalinvNumArr[i]]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_inv_pdf"), 
				   new nlobjSearchColumn("custrecord_djkk_inv_mail_pdf"), 
				   new nlobjSearchColumn("custrecord_djkk_inv_customer"),
				   new nlobjSearchColumn("custrecord_djkk_totalinv_no")
				]
				);
	
		if(!isEmpty(summarySearch)){
			nlapiLogExecution('debug','summarySearch.length ',summarySearch.length);
			for(var cd = 0 ; cd < summarySearch.length ; cd++){
				//DJ_pdf表示
				var pdfFileId = summarySearch[cd].getValue("custrecord_djkk_inv_mail_pdf");
				if (!pdfFileId) {
				    pdfFileId = summarySearch[cd].getValue("custrecord_djkk_inv_pdf");
				}
				var customerId = summarySearch[cd].getValue("custrecord_djkk_inv_customer");
				var totalinvNo = summarySearch[cd].getValue("custrecord_djkk_totalinv_no");
				//DJ_顧客
				var customRec = nlapiLoadRecord('customer', customerId);
				//合計請求書送信
				var subsidiary = defaultEmpty(customRec.getFieldValue('subsidiary'));
				var invoiceSumPeriodtype = '25';//合計請求書送信方法不要の場合
				var invoiceSumSite = '';//DJ_合計請求書送信先区分
				var invoiceSumPerson = '';//DJ_合計請求書送信先担当者
				var invoiceSumSubName = '';//DJ_合計請求書送信先会社名(3RDパーティー)
				var invoiceSumPersont = '';//DJ_合計請求書送信先担当者(3RDパーティー)
				var invoiceSumEmail = '';//DJ_合計請求書送信先メール(3RDパーティー)
				var invoiceSumFax = '';//DJ_合計請求書送信先FAX(3RDパーティー)
				var invoiceSumMemo = '';//DJ_合計請求書送信先登録メモ
				
				var salesman =defaultEmpty(customRec.getFieldValue('salesrep'));
				var templeteObj;//MALLとFAXテンプレートObj
				nlapiLogExecution('debug','subsidiary',subsidiary)
				if(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK){
					invoiceSumPeriodtype = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_period'));//DJ_合計請求書送信区分
					invoiceSumSite = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_site'));//DJ_合計請求書送信先区分
					invoiceSumPerson = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person'));//DJ_合計請求書送信先担当者
					invoiceSumSubName = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_subname'));//DJ_合計請求書送信先会社名(3RDパーティー)
					invoiceSumPersont = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person_t'));//DJ_合計請求書送信先担当者(3RDパーティー)
					invoiceSumEmail = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_email'));//DJ_合計請求書送信先メール(3RDパーティー)
					invoiceSumFax = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_fax'));//DJ_合計請求書送信先FAX(3RDパーティー)
					invoiceSumMemo = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_memo'));//DJ_合計請求書送信先登録メモ
				}else if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
					var invoiceSumFlg = defaultEmpty(customRec.getFieldValue('custentity_djkk_totalinv_pdfsend_flg'));
					nlapiLogExecution('debug','invoiceSumFlg',invoiceSumFlg)
					if(invoiceSumFlg == "T"){
						invoiceSumPeriodtype = '27';//DJ_合計請求書送信方法  (両方)
						nlapiLogExecution('debug','invoiceSumFlg3',invoiceSumPeriodtype)
					}else{
						invoiceSumPeriodtype = '25';//DJ_合計請求書送信方法  (不要)
					}
					invoiceSumSite = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_site'));//DJ_合計請求書送信先区分
					invoiceSumPerson = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person'));//DJ_合計請求書送信先担当者
					invoiceSumSubName = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_subname'));//DJ_合計請求書送信先会社名(3RDパーティー)
					invoiceSumPersont = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person_t'));//DJ_合計請求書送信先担当者(3RDパーティー)
					invoiceSumEmail = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_email'));//DJ_合計請求書送信先メール(3RDパーティー)
//					var invoiceSumFax = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_fax'));//DJ_合計請求書送信先FAX(3RDパーティー)
					invoiceSumMemo = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_memo'));//DJ_合計請求書送信先登録メモ
				}
				nlapiLogExecution('debug','invoiceSumPeriodtype',invoiceSumPeriodtype)
				if(invoiceSumPeriodtype != '25' && !isEmpty(invoiceSumPeriodtype)){
					//合計請求書送信
					nlapiLogExecution('debug','invoiceSum on','invoiceSum on')
					var customer = customerId;//顧客
//					var customform = data.customform;
					var mailType;
					nlapiLogExecution('debug','invoiceSum sendmail start')
					mailType = '合計請求書';
					var mailTempleteObj = {};
					var faxTempleteObj = {};
					//DJ_合計請求書送信
					if(invoiceSumPeriodtype != '25' &&(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK)){
						nlapiLogExecution('debug','invoiceSumSite',invoiceSumSite)
						var mail = defaultEmpty(customRec.getFieldValue('email')); //email
						nlapiLogExecution('debug','mail2',mail)
						nlapiLogExecution('debug','invoiceSumSite',invoiceSumSite);
						if(invoiceSumSite == '29'){
							//送信顧客先の場合
//								var custRecord = nlapiLoadRecord('customer',customer);
							var fax = ''; //fax
							var mail = defaultEmpty(customRec.getFieldValue('email')); //email
							nlapiLogExecution('debug','mail',mail)
							templeteObj = invoiceSumSendmail(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman,totalinvNo);
						}else{
							//3rd
							var fax = '';
							var mail = defaultEmpty(invoiceSumEmail);
							templeteObj = invoiceSumSendmail(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman,totalinvNo);
						};
					}else if (invoiceSumPeriodtype != '25' &&(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK)){
						if(invoiceSumSite == '29'){
							//送信顧客先の場合
							nlapiLogExecution('debug','invoiceSum','invoiceSum')
//							var custRecord = nlapiLoadRecord('customer',customer);
							var fax = defaultEmpty(customRec.getFieldValue('fax')); //fax
							var mail = defaultEmpty(customRec.getFieldValue('email')); //email
							nlapiLogExecution('debug','mail',mail)
							templeteObj = invoiceSumSendmail(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman,totalinvNo);
						}else{
							//3rd
							var fax = defaultEmpty(invoiceSumFax);
							var mail = defaultEmpty(invoiceSumEmail);
							templeteObj = invoiceSumSendmail(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman,totalinvNo)
						};
					};
				}
				if(!isEmpty(templeteObj)){
					mailTempleteObj = templeteObj.mailTempleteObj;
					faxTempleteObj = templeteObj.faxTempleteObj;
				};
				if(invoiceSumPeriodtype != '25' &&!isEmpty(mailTempleteObj)){
					
//					mailTempleteObj.toAddress = 'zheng@cloverplus.net';
//					var mailover =automaticSendmail(mailTempleteObj,pdfFileId);
//					nlapiLogExecution('debug','mailTempleteObj',mailTempleteObj);
					var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inv_sum_send_email', 'customdeploy_djkk_sl_inv_sum_send_email');
					var parameter = '';
					parameter += '&mailTempleteObj='+JSON.stringify(mailTempleteObj);
					parameter += '&pdfFileId='+pdfFileId;
					https = https + parameter;
					var rse = nlapiRequestURL(https);
					var flag = rse.getBody();
					nlapiLogExecution('debug','flag',flag);
					if(flag=='Sending succeeded'){
						nlapiDisableField('btn_send_email', true);
					}
//					// 画面条件変更場合、メッセージ出てこないのため
//					window.ischanged = false;
//					// 画面をリフレッシュする
//					window.location.href = https;
				}
				if(invoiceSumPeriodtype != '25' &&!isEmpty(faxTempleteObj)){
//					var faxover =automaticSendFax(faxTempleteObj,pdfFileId);
//					nlapiLogExecution('debug','send',faxover)
					
					var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inv_sum_send_email', 'customdeploy_djkk_sl_inv_sum_send_email');
					var parameter = '';
					parameter += '&faxTempleteObj='+JSON.stringify(faxTempleteObj);
					parameter += '&pdfFileId='+pdfFileId;
					https = https + parameter;
					var rse = nlapiRequestURL(https);
					if(flag=='FAX送信一時停止'){
						nlapiDisableField('btn_send_email', true);
					}
//					// 画面条件変更場合、メッセージ出てこないのため
//					window.ischanged = false;
//					// 画面をリフレッシュする
//					window.location.href = https;
				};
			};
		};
	};
}

//合計請求書送信
function invoiceSumSendmail(fax,mail,sendtype,subsidiary,mailType,salesman,totalinvNo){
	var title;
	var body;
	var sendMailFlag = 'F';
	var sendFaxFlag = 'F';
	if(sendtype == '26' && !isEmpty(fax)){
		//faxの場合
//		sendFaxFlag = 'T';
//		var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman)
//		return templeteObj;
	}else if(sendtype == '27' && !isEmpty(mail)){
		//emailの場合
		sendMailFlag = 'T';
//		var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,totalinvNo)
		var templeteObj =  getInvoiceSummaryMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,totalinvNo)
		return templeteObj;
	}else if(sendtype == '28' && !isEmpty(fax) && !isEmpty(mail)){
		//fax&emailの場合
		sendMailFlag = 'T';
//		sendFaxFlag = 'T';
//		var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,totalinvNo)
		var templeteObj =  getInvoiceSummaryMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,totalinvNo)
		return templeteObj;

	}
}

function defaultEmpty(src){
	return src || '';
}

//add by 20230515 zhou CH418 end

function search(){

	
	var startDate = nlapiGetFieldValue('custpage_startdate')
	var endDate = nlapiGetFieldValue('custpage_enddate')
	
	var closeDate = nlapiGetFieldValue('custpage_suitel10n_inv_closing_date')

	//締日入力チェック
	if(isEmpty(closeDate)){
		alert("締日を入力してください。")
		return;
	}
	
	if(!isEmpty(startDate) || !isEmpty(endDate)){
		if(!isEmpty(startDate) && !isEmpty(endDate)){
			
		}else{
			alert('開始日または終了を入力してください')
			return;
		}
	}
	
	
	var parameter = setParam();
		
	parameter += '&selectFlg=T';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_summary', 'customdeploy_djkk_sl_invoice_summary');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}


// changed add by song CH247 start
function retain (){ //保留
	var parameter = setParam();
	var invoiceStr= '';
	var count = parseInt(nlapiGetLineItemCount('list'));
	var lineNum = true;
	for(var i = 0 ; i < count ; i++){
		if(nlapiGetLineItemValue('list', 'chk',i+1) == 'T'){
			if(nlapiGetLineItemValue('list', 'invoice_retainid',i+1) == 'F'){
				var invoice_id = nlapiGetLineItemValue('list', 'invoice_id', i+1);
				var lineType = nlapiGetLineItemValue('list', 'invoice_type', i+1);	
				invoiceStr +=invoice_id+'_'+lineType+',';	
			}
			 lineNum = false;
		}
	}
	if(lineNum){
		alert('対象選択してください。')
		return false;
	}else{
		parameter += '&retain=T';
		parameter += '&invoicestr='+invoiceStr;
		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_summary', 'customdeploy_djkk_sl_invoice_summary');
		https = https + parameter;
		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;
		// 画面をリフレッシュする
		window.location.href = https;
	}
}

function cencel (){ //保留取り消す
	var parameter = setParam();
	var invoiceStr= '';
	var count = parseInt(nlapiGetLineItemCount('list'));
	var lineNum = true;
	for(var i = 0 ; i < count ; i++){
		if(nlapiGetLineItemValue('list', 'chk',i+1) == 'T'){
			if(nlapiGetLineItemValue('list', 'invoice_retainid',i+1) == 'T'){
				var invoice_id = nlapiGetLineItemValue('list', 'invoice_id', i+1);
				var lineType = nlapiGetLineItemValue('list', 'invoice_type', i+1);
				invoiceStr +=invoice_id+'_'+lineType+',';	
			}
			lineNum = false;
		}
	}
	if(lineNum){
		alert('対象選択してください。')
		return false;
	}else{
		parameter += '&cencel=T';
		parameter += '&invoicestr='+invoiceStr;
		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_summary', 'customdeploy_djkk_sl_invoice_summary');
		https = https + parameter;
		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;
		// 画面をリフレッシュする
		window.location.href = https;
	}
}

//changed add by song CH247 end

function searchReturn(){
	
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_summary', 'customdeploy_djkk_sl_invoice_summary');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function clearf(){
	var parameter = '';
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_summary', 'customdeploy_djkk_sl_invoice_summary');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}
// add by zzq CH418 20230612 start
function backf(){
    var parameter = '';
    
    // add by zzq CH418 20230612 start
    parameter = setParam();
    // add by zzq CH418 20230612 end
    parameter += '&selectFlg=F';

    var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_summary', 'customdeploy_djkk_sl_invoice_summary');

    https = https + parameter;
    

    // 画面条件変更場合、メッセージ出てこないのため
    window.ischanged = false;

    // 画面をリフレッシュする
    window.location.href = https;
}
// add by zzq CH418 20230612 end
function setParam(){

	var parameter = '';
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');
	parameter += '&customer='+nlapiGetFieldValue('custpage_customer');
	parameter += '&invoiceNo='+nlapiGetFieldValue('custpage_invoice');
	parameter += '&invoicetrandate='+nlapiGetFieldValue('custpage_suitel10n_inv_closing_date');
	parameter += '&startdate='+nlapiGetFieldValue('custpage_startdate');
	parameter += '&enddate='+nlapiGetFieldValue('custpage_enddate');
	parameter += '&invoiceamount='+nlapiGetFieldValue('custpage_invoiceamount_zero');
	parameter += '&invoicesave='+nlapiGetFieldValue('custpage_invoice_save');
	parameter += '&active='+nlapiGetFieldValue('custpage_active');
	parameter += '&invNoFrom='+nlapiGetFieldValue('custpage_inv_no_from');
	parameter += '&invNoTo='+nlapiGetFieldValue('custpage_inv_no_to');
	parameter += '&printgroup='+nlapiGetFieldValue('custpage_print_group');
	parameter += '&invoicetrandate2='+nlapiGetFieldValue('custpage_suitel10n_inv_closing_date2');
	parameter += '&inMail='+nlapiGetFieldValue('custpage_inv_mail');
	
	return parameter;
}


function getInvoiceSummaryMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,totalinvNo){
//  search
    try{
    var mailTempleteObj = {};
    var faxTempleteObj = {};
    var custEmployeeId = nlapiLookupField('employee',salesman,'custentity_djkk_employee_id');
    var mailTypeSearch = nlapiSearchRecord("customlist_djkk_mail_temple_type",null,
            [
               ["name","is",mailType]
            ], 
            [
               new nlobjSearchColumn("internalid")
            ]
            );
    if(!isEmpty(mailTypeSearch)){
        var mailTypeId = mailTypeSearch[0].getValue("internalid"); //DJ_送信種類ID
    }
    if(sendMailFlag == 'T' && !isEmpty(mailTypeId) && !isEmpty(mail)){
        var mailtemplateSearch = nlapiSearchRecord("customrecord_djkk_template",null,
                [
                   ["custrecord_djkk_tmp_sub","anyof",subsidiary], //DJ_子会社
                   "AND", 
                   ["custrecord_djkk_tmp_faxuse","is","F"], //FAXテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_mailuse","is","T"], //MALLテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_type","anyof",mailTypeId]//DJ_送信種類
                ], 
                [
                   new nlobjSearchColumn("custrecord_djkk_tmp_sub"), //DJ_子会社
                   new nlobjSearchColumn("custrecord_djkk_tmp_type"), //DJ_送信種類
                   new nlobjSearchColumn("custrecord_djkk_tmp_faxuse"), //FAXテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_mailuse"), //MALLテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_from"), //From address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to"), //TO address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to_muster"), //Email address from the client master
                   new nlobjSearchColumn("custrecord_djkk_tmp_bcc"), //BCC
                   new nlobjSearchColumn("custrecord_djkk_tmp_subject"), //Subject
                   new nlobjSearchColumn("custrecord_djkk_tmp_body"), //Body
                   new nlobjSearchColumn("custrecord_djkk_tmp_filetype"), //Attachment file name
                   new nlobjSearchColumn("custrecord_djkk_tmp_flnameissub")//Same contents as subject
                ]
                );
        var formAddress = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_from"); //From address
        var toAddress = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_to");//TO address
        var bcc = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_bcc");//BCC
        var addressFormMuster = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_to_muster");////Email address from the client master
        if(addressFormMuster == 'T'){
            toAddress = mail;
        }
        var subject = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_subject");//subject
        subject += getdateYYMMDD()+'_'+totalinvNo;
        var body = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_body");//body
        var fileName = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_filetype");//Attachment file name
        var fileNameFormSubject = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_flnameissub");// SAME CONTENTS AS SUBJECT
        if(fileNameFormSubject == 'T'){
            fileName = subject;
        }else{
            fileName = fileName+getdateYYMMDD()+'_'+totalinvNo;
        }
        nlapiLogExecution('debug','fileName',fileName)
        mailTempleteObj ={
                formAddress:formAddress,
                toAddress:toAddress,
                bcc:bcc,
                addressFormMuster:addressFormMuster,
                subject:subject,
                body:body,
                fileName:fileName,
                fileNameFormSubject:fileNameFormSubject
        }
    }
    if(sendFaxFlag == 'T' && !isEmpty(mailTypeId) && !isEmpty(fax)){
        nlapiLogExecution('debug','mailTypeId',mailTypeId)
        var faxtemplateSearch = nlapiSearchRecord("customrecord_djkk_template",null,
                [
                   ["custrecord_djkk_tmp_sub","anyof",subsidiary], //DJ_子会社
                   "AND", 
                   ["custrecord_djkk_tmp_faxuse","is","T"], //FAXテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_mailuse","is","F"], //MALLテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_type","anyof",mailTypeId]//DJ_送信種類
                ], 
                [
                   new nlobjSearchColumn("custrecord_djkk_tmp_sub"), //DJ_子会社
                   new nlobjSearchColumn("custrecord_djkk_tmp_type"), //DJ_送信種類
                   new nlobjSearchColumn("custrecord_djkk_tmp_faxuse"), //FAXテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_mailuse"), //MALLテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_from"), //From address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to"), //TO address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to_muster"), //Email address from the client master
                   new nlobjSearchColumn("custrecord_djkk_tmp_bcc"), //BCC
                   new nlobjSearchColumn("custrecord_djkk_tmp_subject"), //Subject
                   new nlobjSearchColumn("custrecord_djkk_tmp_body"), //Body
                   new nlobjSearchColumn("custrecord_djkk_tmp_filetype"), //Attachment file name
                   new nlobjSearchColumn("custrecord_djkk_tmp_flnameissub")//Same contents as subject
                ]
                );
        var formAddress = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_from"); //From address
        var toAddress = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_to");//TO address
        var bcc = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_bcc");//BCC
        var addressFormMuster = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_to_muster");////Email address from the client master
        if(addressFormMuster == 'T'){
            toAddress = fax;
        }
        var subject = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_subject");//subject
        subject += custEmployeeId+ '-' + totalinvNo;
        nlapiLogExecution('debug','subject',subject)
        var body = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_body");//body
        var fileName = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_filetype");//Attachment file name
        var fileNameFormSubject = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_flnameissub");// SAME CONTENTS AS SUBJECT
        if(fileNameFormSubject == 'T'){
            fileName = subject;
        }else{
            fileName = fileName+custEmployeeId+ '-' +totalinvNo;
        }
        nlapiLogExecution('debug','fileName',fileName)
        faxTempleteObj ={
                formAddress:formAddress,
                toAddress:toAddress,
                bcc:bcc,
                addressFormMuster:addressFormMuster,
                subject:subject,
                body:body,
                fileName:fileName,
                fileNameFormSubject:fileNameFormSubject
        }
    }
    var recultObj = {
            mailTempleteObj:mailTempleteObj,
            faxTempleteObj:faxTempleteObj
            }
    return recultObj
    }catch(e){
        nlapiLogExecution('debug','message',e)
    }
    
}