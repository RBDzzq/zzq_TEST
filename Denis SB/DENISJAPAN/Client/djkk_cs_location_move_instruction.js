/**
 * 倉庫移動指示リストClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/16     CPC_苑
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
	
	var listCount = nlapiGetLineItemCount('inventory_details');
	var locationSearch = nlapiSearchRecord("location",null,
			[
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
			   new nlobjSearchColumn("name")
			]
			);
	var mailArr = new Array();
	var nulllocation=false;
	var selectlocationList=new Array();
	for(var i = 0 ; i < locationSearch.length ; i++){
		mailArr[locationSearch[i].getValue('name')] = locationSearch[i].getValue("custrecord_djkk_mail","address",null);
	}
	//var str = "";
	var selectCount = 0;
	for(var i = 0 ; i < listCount; i++){
		if(nlapiGetLineItemValue('inventory_details', 'check', i+1) == 'T'){
			if(!isEmpty(nlapiGetLineItemValue('inventory_details', 'from', i+1))){
				if(isEmpty(mailArr[nlapiGetLineItemValue('inventory_details', 'from', i+1)])){
					selectlocationList.push('「'+nlapiGetLineItemValue('inventory_details', 'from', i+1)+'」');
				}
			}else{
				nulllocation=true;
			}
			selectCount++;
			//str+=nlapiGetLineItemValue('list', 'so_id', i+1)+',';
		}
	}
	selectlocationList=unique(selectlocationList);
	if(nulllocation){
		selectlocationList.push('「倉庫なし」');
	}
	var alertTxt='';
	var m01=0;
	for(var s=0;s<selectlocationList.length;s++){
		if(m01!=0){
			alertTxt+='、';
			}
		alertTxt+=selectlocationList[s];
		m01++;
	}
	if (!isEmpty(alertTxt)) {
		alert(alertTxt+'の倉庫配達メールが空です。');
		return false;
	}
	if(selectCount == 0){
		alert('対象を選択してください。')
		return false;
	}
	
	//nlapiSetFieldValue('custpage_param', str);
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


function search(){
	var locationFrom=nlapiGetFieldValue('custpage_location_from');
	if(isEmpty(locationFrom)||locationFrom=='0'){
		alert('移動元倉庫は入力する必要があります');
		return '';
	}
	var parameter = setParam();
		
	parameter += '&selectFlg=T';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_location_move_ins', 'customdeploy_djkk_sl_location_move_ins');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function searchReturn(){
		
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_location_move_ins', 'customdeploy_djkk_sl_location_move_ins');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function setParam(){

	var parameter = '';
	parameter += '&locationMoveId='+nlapiGetFieldValue('custpage_location_move_id');
	parameter += '&date='+nlapiGetFieldValue('custpage_date');
	parameter += '&locationFrom='+nlapiGetFieldValue('custpage_location_from');
	parameter += '&locationTo='+nlapiGetFieldValue('custpage_location_to');
	parameter += '&sub='+nlapiGetFieldValue('custpage_sub');
	
	return parameter;
}
