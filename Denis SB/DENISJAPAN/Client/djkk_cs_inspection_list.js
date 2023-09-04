/**
 * DJ_検品一覧画面
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Jul 2021     gsy95
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
	
	var lo = nlapiGetFieldValue('custpage_location')
	var su = nlapiGetFieldValue('custpage_subsidiary')
	if(isEmpty(lo) ||lo == '-1' ){
		alert("場所を入力してください。")
		return false;
	}
	if(isEmpty(su) ||su == '-1'){
		alert("連結子会社を入力してください。")
		return false;
	}
	
	var itemcount = nlapiGetLineItemCount('inventory_details')

	var chkCount = 0;
	for(var i = 0 ; i < itemcount ; i ++){

		if(nlapiGetLineItemValue('inventory_details', 'chk', i+1) == 'T'){
			chkCount++;
			
			if(nlapiGetLineItemValue('inventory_details', 'state', i+1) != '検品済み'){
				alert("選択の対象検品完成していないです。")
				return false;
			}
			
		}
	}
	
	if(chkCount == 0){
		alert("移動対象選択してください。")
		return false;
	}
	
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
	
	if(name =='custpage_subsidiary' || name =='custpage_location'){
		var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
		var location = nlapiGetFieldValue('custpage_location');
		
		var parameter = "&subsidiary="+subsidiary;
		parameter += "&location="+location;
		
		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inspection_list', 'customdeploy_djkk_sl_inspection_list');	

		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;

		// 画面をリフレッシュする
		window.location.href = https+parameter;	

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

/*
 *更新
 */
function refresh(){
	window.ischanged = false;
	location=location;
}

//function up(){
//	
//	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inspection_list', 'customdeploy_djkk_sl_inspection_list');	
//
//	// 画面条件変更場合、メッセージ出てこないのため
//	window.ischanged = false;
//
//	// 画面をリフレッシュする
//	location.href = https+"&batchRun=T";
//}

