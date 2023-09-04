/**
 * �q�Ɉړ��w�����X�gClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/16     CPC_��
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
					selectlocationList.push('�u'+nlapiGetLineItemValue('inventory_details', 'from', i+1)+'�v');
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
		selectlocationList.push('�u�q�ɂȂ��v');
	}
	var alertTxt='';
	var m01=0;
	for(var s=0;s<selectlocationList.length;s++){
		if(m01!=0){
			alertTxt+='�A';
			}
		alertTxt+=selectlocationList[s];
		m01++;
	}
	if (!isEmpty(alertTxt)) {
		alert(alertTxt+'�̑q�ɔz�B���[������ł��B');
		return false;
	}
	if(selectCount == 0){
		alert('�Ώۂ�I�����Ă��������B')
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
 *�X�V
 */
function refresh(){
	window.ischanged = false;
	location=location;
}


function search(){
	var locationFrom=nlapiGetFieldValue('custpage_location_from');
	if(isEmpty(locationFrom)||locationFrom=='0'){
		alert('�ړ����q�ɂ͓��͂���K�v������܂�');
		return '';
	}
	var parameter = setParam();
		
	parameter += '&selectFlg=T';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_location_move_ins', 'customdeploy_djkk_sl_location_move_ins');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function searchReturn(){
		
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_location_move_ins', 'customdeploy_djkk_sl_location_move_ins');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
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
