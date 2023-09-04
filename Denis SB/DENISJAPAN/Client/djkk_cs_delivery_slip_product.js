/**
 * DJ_WO�ݸ���߯�ݸ�ؽā��a����݌ɓ`�[���s
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2022     CPC_�v
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
	
	var listCount = nlapiGetLineItemCount('list');
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
		if(nlapiGetLineItemValue('list', 'check', i+1) == 'T'){
			if(!isEmpty(nlapiGetLineItemValue('list', 'location', i+1))){
				if(isEmpty(mailArr[nlapiGetLineItemValue('list', 'location', i+1)])){
					selectlocationList.push('�u'+nlapiGetLineItemValue('list', 'location', i+1)+'�v');
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
	if(name == 'custpage_subsidiary'){
		var subsidiary = nlapiGetFieldValue('custpage_subsidiary')
		if(isEmpty(subsidiary)){
			alert("��Ђ���͂��Ă�������");
			return;
		}
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_delivery_slip_pro', 'customdeploy_djkk_sl_delivery_slip_pro');
		
		https = https + parameter;
		

		// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
		window.ischanged = false;

		// ��ʂ����t���b�V������
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
 *�X�V
 */
function refresh(){
	window.ischanged = false;
	location=location;
}


function search(){

	var parameter = setParam();
		
	parameter += '&selectFlg=T';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_delivery_slip_pro', 'customdeploy_djkk_sl_delivery_slip_pro');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function searchReturn(){
	
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_delivery_slip_pro', 'customdeploy_djkk_sl_delivery_slip_pro');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function setParam(){

	var parameter = '';
	parameter += '&deliveryDate='+nlapiGetFieldValue('custpage_delivery_date');
	parameter += '&shipDate='+nlapiGetFieldValue('custpage_ship_date');
	parameter += '&stock='+nlapiGetFieldValue('custpage_stock');	
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');
	parameter += '&location='+nlapiGetFieldValue('custpage_location');

	
	return parameter;
}


