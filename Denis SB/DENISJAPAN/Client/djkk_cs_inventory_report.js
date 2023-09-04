/**
 * Module Description
 * 在庫レポート
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
	if(name == 'custpage_sub' || name == 'custpage_inventory_report_location'){
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_report', 'customdeploy_djkk_sl_inventory_report');

		https = https + parameter;
		

		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;

		// 画面をリフレッシュする
		window.location.href = https;
	}
	//20230330 add by zhou CH382 start
	if(name == 'custpage_inventory_report_brand'){
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_report', 'customdeploy_djkk_sl_inventory_report');

		https = https + parameter;
		

		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;

		// 画面をリフレッシュする
		window.location.href = https;
	}
	//end
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
	
	var sub = nlapiGetFieldValue('custpage_sub');
	
	var validityStartDate = nlapiGetFieldValue('custpage_inventory_report_validity_start')
	var validityEndDate = nlapiGetFieldValue('custpage_inventory_report_validity_end')
	
	
	var shipStartDate = nlapiGetFieldValue('custpage_inventory_report_ship_start')
	var shipEndDate = nlapiGetFieldValue('custpage_inventory_report_ship_end')

	if(isEmpty(sub)){
		alert("連結を入力してください。")
		return;
	}
	
	if(!isEmpty(validityStartDate) || !isEmpty(validityEndDate)){
		if(!isEmpty(validityStartDate) && !isEmpty(validityEndDate)){
			
			if(!compareStrDate(validityStartDate,validityEndDate)){
				alert('有効期限開始日または終了日は不正です。')
				return  false;
			}
			
		}else{
			alert('有効期限開始日または終了日を入力してください');
			return  false;
		}
	}
	
	if(!isEmpty(shipStartDate) || !isEmpty(shipEndDate)){
		if(!isEmpty(shipStartDate) && !isEmpty(shipEndDate)){
			if(!compareStrDate(shipStartDate,shipEndDate)){
				alert('出荷可能日開始日または終了日は不正です。')
				return  false;
			}
		}else{
			alert('出荷可能日開始日または終了日を入力してください');
			return  false;
		}
	}
	
	var parameter = setParam();
		
	parameter += '&selectFlg=T';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_report', 'customdeploy_djkk_sl_inventory_report');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function searchReturn(){
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_report', 'customdeploy_djkk_sl_inventory_report');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function setParam(){
	var parameter = '';
	var filedSubValue =  nlapiGetFieldValue('custpage_sub');
	parameter += '&fieldDate='+nlapiGetFieldValue('custpage_inventory_report_date');
	parameter += '&filedItem='+nlapiGetFieldValue('custpage_inventory_report_item');
	parameter += '&filedItemGroup='+nlapiGetFieldValue('custpage_inventory_report_item_group');
	parameter += '&filedBrand='+nlapiGetFieldValue('custpage_inventory_report_brand');
	parameter += '&filedCategory='+nlapiGetFieldValue('custpage_inventory_report_category');
	parameter += '&filedLocation='+nlapiGetFieldValue('custpage_inventory_report_location');
	parameter += '&filedLocationShelf='+nlapiGetFieldValue('custpage_inventory_report_location_shelf');
	parameter += '&filedValidityStart='+nlapiGetFieldValue('custpage_inventory_report_validity_start');
	parameter += '&filedValidityEnd='+nlapiGetFieldValue('custpage_inventory_report_validity_end');
	parameter += '&filedShipStart='+nlapiGetFieldValue('custpage_inventory_report_ship_start');
	parameter += '&filedShipEnd='+nlapiGetFieldValue('custpage_inventory_report_ship_end');
	parameter += '&filedValidityFlg='+nlapiGetFieldValue('custpage_inventory_validity_flg');
	parameter += '&filedShipFlg='+nlapiGetFieldValue('custpage_inventory_ship_flg');
	parameter += '&filedStockPeriod='+nlapiGetFieldValue('custpage_stockperiod');
	parameter += '&filedValidityPercent='+nlapiGetFieldValue('custpage_inventory_validity_percent');
	parameter += '&filedValidityPercent50='+nlapiGetFieldValue('custpage_inventory_validity_percent50');
	parameter += '&sub='+filedSubValue;
	parameter += '&amtShowFlg='+nlapiGetFieldValue('custpage_amt_show_flg');
	parameter += '&lotRemark='+nlapiGetFieldValue('custpage_lot_remark');
	parameter += '&shagaihi='+nlapiGetFieldValue('custpage_Shagaihi');
	if( filedSubValue == SUB_SCETI ||  filedSubValue == SUB_DPKK){
		parameter += '&filedDepartment='+nlapiGetFieldValue('custpage_department');
	}
	return parameter;
}

function clearf(){
	var parameter = '';
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_report', 'customdeploy_djkk_sl_inventory_report');	

	https = https + parameter;
	
	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}
