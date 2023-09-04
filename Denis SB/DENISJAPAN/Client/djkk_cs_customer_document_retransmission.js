/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Apr 2023     zhou
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	if(name == 'custpage_club'){
		var club = nlapiGetFieldValue('custpage_club')
	
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_cust_sendmail_again', 'customdeploy_djkk_sl_cust_sendmail_again');

		https = https + parameter;
		

		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;

		// 画面をリフレッシュする
		window.location.href = https;
	}
}

function search(){
	
	var sub = nlapiGetFieldValue('custpage_club');
	if(isEmpty(sub)){
		alert('子会社を入力してください。');
		return false;
	}	
	var parameter = setParam();
		
	parameter += '&selectFlg=T';
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_cust_sendmail_again', 'customdeploy_djkk_sl_cust_sendmail_again');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}
function setParam(type, name, linenum){
	var parameter = '';
	parameter += '&sub='+nlapiGetFieldValue('custpage_club');//会社
	parameter += '&customerPo='+nlapiGetFieldValue('custpage_customerpo');//顧客注文番号
	parameter += '&section='+nlapiGetFieldValue('custpage_section');//セクション
	parameter += '&customer='+nlapiGetFieldValue('custpage_customer');//顧客（請求先）コード
	parameter += '&type='+nlapiGetFieldValue('custpage_type');//書類タイプ
//	parameter += '&customername='+nlapiGetFieldValue('custpage_customername');//顧客（請求先）名前
	parameter += '&issuedateForm='+nlapiGetFieldValue('custpage_issuedate_form');//作成日
	parameter += '&delivery='+nlapiGetFieldValue('custpage_delivery');//納品先コード
	parameter += '&issuedateTo='+nlapiGetFieldValue('custpage_issuedate_to');//作成日
//	parameter += '&deliveryName='+nlapiGetFieldValue('custpage_deliveryname');//納品先名前
	parameter += '&documentNo='+nlapiGetFieldValue('custpage_documentno');//書類番号書類番号
	parameter += '&trannumber='+nlapiGetFieldValue('custpage_trannumber');//受注番号
	parameter += '&shipbydateForm='+nlapiGetFieldValue('custpage_shipbydate_form');//出荷日From
	parameter += '&shipbydateTo='+nlapiGetFieldValue('custpage_shipbydate_to');//出荷日To
	parameter += '&deliverydateForm='+nlapiGetFieldValue('custpage_deliverydate_form');//納品日From
	parameter += '&deliverydateTo='+nlapiGetFieldValue('custpage_deliverydate_to');//納品日To
	return parameter;
}