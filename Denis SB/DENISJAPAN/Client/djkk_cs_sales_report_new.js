/**
 * Module Description
 * セールスレポート
 * Version    Date            Author           Remarks
 * 1.00       11 Jul 2021     admin
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
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function clientValidateField(type, name, linenum){
   
    return true;
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

	
	if(name == 'custpage_subsidiary'){
		var parameter = setParam();
		parameter += '&selectFlg=F';
		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_sales_report_new', 'customdeploy_djkk_sl_sales_report_new');
		https = https + parameter;
		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;
		// 画面をリフレッシュする
		window.location.href = https;
	}
	
	if(name == 'custpage_area'){
		var parameter = setParam();
		parameter += '&selectFlg=F';
		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_sales_report_new', 'customdeploy_djkk_sl_sales_report_new');
		https = https + parameter;
		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;
		// 画面をリフレッシュする
		window.location.href = https;
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {
     
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
 
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateInsert(type){
  
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type){
   
    return true;
}



function search(){
	
	
	var fromDate = nlapiGetFieldValue('custpage_datefrom');
	var toDate  = nlapiGetFieldValue('custpage_dateto');
	
	var line = nlapiGetFieldValue('custpage_line')
	var sub = nlapiGetFieldValue('custpage_subsidiary')
	var amtorcount = nlapiGetFieldValue('custpage_amtorcount')
	var shagaihi = nlapiGetFieldValue('custpage_shagaihi')


	//期間判断
	if(!isEmpty(toDate) && !isEmpty(fromDate)){
		
		if(toDate<fromDate){
			alert('期間Toは期間From前です。')
			return ;
		}

		if(nlapiStringToDate(toDate).getFullYear() != nlapiStringToDate(fromDate).getFullYear() ){
			alert('期間は同年が必要です。')
			return;
		}
	}

	
	
	if(isEmpty(line) || line == '0'){
		alert("ラインを入力してください。")
		return;
	}
	
	if(isEmpty(sub)){
		alert("連結を入力してください。")
		return;
	}
	
	//社外秘がF　金額表示したい場合エラー
//	if(shagaihi == 'F' &&amtorcount == '1'){
//		alert("社外秘チェックしていない場合、数量のみ表示可能です。")
//		return;
//	}
// [社外秘] function is cancelled  2022/04/21 by zhou 

	var parameter = setParam();
		
	parameter += '&selectFlg=T';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_sales_report_new', 'customdeploy_djkk_sl_sales_report_new');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function searchReturn(){
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_sales_report_new', 'customdeploy_djkk_sl_sales_report_new');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function setParam(){
	var parameter = '';
	parameter += '&group1='+nlapiGetFieldValue('custpage_group1');
	parameter += '&group2='+nlapiGetFieldValue('custpage_group2');
	parameter += '&line='+nlapiGetFieldValue('custpage_line');
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');
	parameter += '&lastyear='+nlapiGetFieldValue('custpage_lastyear');
	parameter += '&amtOrCount='+nlapiGetFieldValue('custpage_amtOrCount');
	parameter += '&shagaihi='+nlapiGetFieldValue('custpage_shagaihi');
	parameter += '&session='+nlapiGetFieldValue('custpage_session');
	parameter += '&brand='+nlapiGetFieldValue('custpage_brand');
	parameter += '&employee='+nlapiGetFieldValue('custpage_employee');
	parameter += '&tanto='+nlapiGetFieldValue('custpage_tanto');//CH199
	parameter += '&item='+nlapiGetFieldValue('custpage_item');
	parameter += '&itemgroup='+nlapiGetFieldValue('custpage_itemgroup');
	parameter += '&customer='+nlapiGetFieldValue('custpage_customer');
	parameter += '&customergroup='+nlapiGetFieldValue('custpage_customergroup');
	parameter += '&location='+nlapiGetFieldValue('custpage_location');
	parameter += '&delivery='+nlapiGetFieldValue('custpage_delivery');
	parameter += '&datefrom='+nlapiGetFieldValue('custpage_datefrom');
	parameter += '&dateto='+nlapiGetFieldValue('custpage_dateto');
	parameter += '&area='+nlapiGetFieldValue('custpage_area');
	parameter += '&areasub='+nlapiGetFieldValue('custpage_area_sub');
	parameter += '&deliverygroup='+nlapiGetFieldValue('custpage_deliverygroup');
	
	
	return parameter;
}

function clearf(){
	var parameter = '';
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_sales_report_new', 'customdeploy_djkk_sl_sales_report_new');	

	https = https + parameter;
	
	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}
