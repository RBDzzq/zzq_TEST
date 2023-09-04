/**
 * DJ_�������ύX���F�ꊇ�������
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
						
			if(isEmpty(nlapiGetLineItemValue('list', 'unit_price',i+1))){
				alert('�I���̍s�̋��z����͂��Ă��������B');
				return false;
			}
			
			zeroflg = false;
	
		}
	}
	if(zeroflg){
		alert('�ΏۑI�����Ă��������B')
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
	if(name == 'custpage_subsidiary'){
		var subsidiary = nlapiGetFieldValue('custpage_subsidiary')
		if(isEmpty(subsidiary)){
			alert("�A������͂��Ă�������");
			return;
		}
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_listing', 'customdeploy_djkk_sl_invoice_listing');

		https = https + parameter;
		

		// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
		window.ischanged = false;

		// ��ʂ����t���b�V������
		window.location.href = https;
	}
	if(type == 'list' &&  name =='unit_price'){
		var unitPrice = nlapiGetCurrentLineItemValue('list','unit_price');
		//20230605 CH613 by zzq start
		var currency = nlapiGetCurrentLineItemValue('list','currency_hidden');
		if(currency == '1'){
		    var priceStrArr = unitPrice.split('.');
	        if(priceStrArr.length > 1 ){
	            alert('�P���ɏ����_���܂߂邱�Ƃ͂ł��܂���')
	            nlapiSetCurrentLineItemValue('list','unit_price','');
	        }
		}
		//20230605 CH613 by zzq end
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

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_listing', 'customdeploy_djkk_sl_invoice_listing');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function searchReturn(){
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_listing', 'customdeploy_djkk_sl_invoice_listing');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function setParam(){

	var parameter = '';
	parameter += '&invoiceNo='+nlapiGetFieldValue('custpage_invoice');
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');
	parameter += '&customer='+nlapiGetFieldValue('custpage_customer');
	parameter += '&deliveryAdd='+nlapiGetFieldValue('custpage_delivery_destination');
	parameter += '&item='+nlapiGetFieldValue('custpage_item');
	parameter += '&salesorder='+nlapiGetFieldValue('custpage_salesorder');
	parameter += '&salesrep='+nlapiGetFieldValue('custpage_saler');
//	parameter += '&hopeDeliveryDate='+nlapiGetFieldValue('custpage_delivery_hopedate');
	parameter += '&deliveryDate='+nlapiGetFieldValue('custpage_delivery_date');
	parameter += '&beforeDateFlg='+nlapiGetFieldValue('custpage_beforedate_flg');
	
	
	return parameter;
}


