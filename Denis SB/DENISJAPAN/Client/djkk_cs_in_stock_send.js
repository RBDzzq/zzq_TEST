/**
 * DJ_入荷送信予定
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


	
//	var location = nlapiGetFieldValue('custpage_location');
//	
//	if(count == 0){
//		alert("データありません、送信できません。");
//		return false;
//	}
//	
//	if(!isEmpty(location)){
//		var locationSearch = nlapiSearchRecord("location",null,
//				[
//				 ["internalid","anyof",location]
//				], 
//				[
//				   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
//				   new nlobjSearchColumn("name")
//				]
//				);
//		if(!isEmpty(locationSearch)){
//			if(isEmpty(locationSearch[0].getValue("custrecord_djkk_mail","address",null))){
//				alert("倉庫メール設定していないので、送信できません。");
//				return false;
//			}
//		}else{
//			alert("倉庫メール設定していないので、送信できません。");
//			return false;
//		}
//	}
	
	var count = nlapiGetLineItemCount('list')

	var sendEmail = nlapiGetFieldValue('send_email');
	var zeroflg = true;
		if(sendEmail){	
			return true;
		}else{
			for(var i = 0 ; i < count ; i++){
				if(nlapiGetLineItemValue('list', 'chk',i+1) == 'T'){
					zeroflg = false;
				}
			}
			if(zeroflg){
				alert('対象選択してください。')
				return false;
			}
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
	if(name == 'custpage_subsidiary'){
		var subsidiary = nlapiGetFieldValue('custpage_subsidiary')
		if(isEmpty(subsidiary)){
			alert("連結を入力してください");
			return;
		}
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_in_stock_send', 'customdeploy_djkk_sl_in_stock_send');

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
function value(){
	if(isEmpty(location)){
		alert("倉庫を入力してください。")
		return;
	}
}
function search(){

	var location = nlapiGetFieldValue('custpage_location');
	if(isEmpty(location)){
		alert("倉庫を入力してください。")
		return;
	}
	
	var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
	if(isEmpty(subsidiary)){
		alert("連結を入力してください");
		return;
	}
		
	var parameter = setParam();
		
	parameter += '&selectFlg=T';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_in_stock_send', 'customdeploy_djkk_sl_in_stock_send');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function searchReturn(){
	
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_in_stock_send', 'customdeploy_djkk_sl_in_stock_send');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function setParam(){

	var parameter = '';
	parameter += '&activity='+nlapiGetFieldValue('custpage_activity');
	parameter += '&createdby='+nlapiGetFieldValue('custpage_createdby');
	parameter += '&vendor='+nlapiGetFieldValue('custpage_vendor');
	parameter += '&po='+nlapiGetFieldValue('custpage_po');
	parameter += '&item='+nlapiGetFieldValue('custpage_item');
	parameter += '&item_en='+nlapiGetFieldValue('custpage_item_en');
	parameter += '&item_jp='+nlapiGetFieldValue('custpage_item_jp');
	parameter += '&location='+nlapiGetFieldValue('custpage_location');
	parameter += '&lot='+nlapiGetFieldValue('custpage_lot');
	parameter += '&in_stock='+nlapiGetFieldValue('custpage_in_stock');
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');
	parameter += '&purchase='+nlapiGetFieldValue('custpage_purchase');
	parameter += '&entrydate='+nlapiGetFieldValue('custpage_entrydate');
	parameter += '&entrydateEnd='+nlapiGetFieldValue('custpage_entrydateend');
	parameter += '&instructions='+nlapiGetFieldValue('custpage_instructions');




	
	return parameter;
}


