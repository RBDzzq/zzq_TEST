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
		

		// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
		window.ischanged = false;

		// ��ʂ����t���b�V������
		window.location.href = https;
	}
}

function search(){
	
	var sub = nlapiGetFieldValue('custpage_club');
	if(isEmpty(sub)){
		alert('�q��Ђ���͂��Ă��������B');
		return false;
	}	
	var parameter = setParam();
		
	parameter += '&selectFlg=T';
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_cust_sendmail_again', 'customdeploy_djkk_sl_cust_sendmail_again');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}
function setParam(type, name, linenum){
	var parameter = '';
	parameter += '&sub='+nlapiGetFieldValue('custpage_club');//���
	parameter += '&customerPo='+nlapiGetFieldValue('custpage_customerpo');//�ڋq�����ԍ�
	parameter += '&section='+nlapiGetFieldValue('custpage_section');//�Z�N�V����
	parameter += '&customer='+nlapiGetFieldValue('custpage_customer');//�ڋq�i������j�R�[�h
	parameter += '&type='+nlapiGetFieldValue('custpage_type');//���ރ^�C�v
//	parameter += '&customername='+nlapiGetFieldValue('custpage_customername');//�ڋq�i������j���O
	parameter += '&issuedateForm='+nlapiGetFieldValue('custpage_issuedate_form');//�쐬��
	parameter += '&delivery='+nlapiGetFieldValue('custpage_delivery');//�[�i��R�[�h
	parameter += '&issuedateTo='+nlapiGetFieldValue('custpage_issuedate_to');//�쐬��
//	parameter += '&deliveryName='+nlapiGetFieldValue('custpage_deliveryname');//�[�i�於�O
	parameter += '&documentNo='+nlapiGetFieldValue('custpage_documentno');//���ޔԍ����ޔԍ�
	parameter += '&trannumber='+nlapiGetFieldValue('custpage_trannumber');//�󒍔ԍ�
	parameter += '&shipbydateForm='+nlapiGetFieldValue('custpage_shipbydate_form');//�o�ד�From
	parameter += '&shipbydateTo='+nlapiGetFieldValue('custpage_shipbydate_to');//�o�ד�To
	parameter += '&deliverydateForm='+nlapiGetFieldValue('custpage_deliverydate_form');//�[�i��From
	parameter += '&deliverydateTo='+nlapiGetFieldValue('custpage_deliverydate_to');//�[�i��To
	return parameter;
}