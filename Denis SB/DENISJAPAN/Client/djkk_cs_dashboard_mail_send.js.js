/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Jul 2021     admin
 *
 */


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {
	var chkflag=true;
	var count = nlapiGetLineItemCount('custpage_list');
	for (var i = 1; i < count+1; i++) {
		if (nlapiGetLineItemValue('custpage_list', 'check', i) == 'T') {
			chkflag=false;
		}
	}
	
	if(chkflag!=false){
		alert('���M�ΏۑI�����Ă��������B')
		return false;
	}
	return true;
}

/*
 *�X�V
 */
function refresh(){
	window.ischanged = false;
	location=location;
}

/**
 * ����
 */
function search() {
	var deployID=nlapiGetFieldValue('custpage_deployid');
	var parameter = '';
	parameter += '&field_no='+nlapiGetFieldValue('custpage_no');
	parameter += '&field_shipdate='+nlapiGetFieldValue('custpage_shipdate');
	parameter += '&field_dj_deliverydate='+nlapiGetFieldValue('custpage_dj_deliverydate');
	parameter += '&field_customer_jp='+nlapiGetFieldValue('custpage_customer_jp');
	parameter += '&field_customer_en='+nlapiGetFieldValue('custpage_customer_en');
	parameter += '&field_sub='+nlapiGetFieldValue('custpage_sub');

	parameter += '&selectFlg=T';
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_mail_send',deployID);
	https = https + parameter;

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	location.href = https;
}

function searchReturn(){
	var deployID=nlapiGetFieldValue('custpage_deployid');
	var parameter = '';
	parameter += '&field_no='+nlapiGetFieldValue('custpage_no');
	parameter += '&field_shipdate='+nlapiGetFieldValue('custpage_shipdate');
	parameter += '&field_dj_deliverydate='+nlapiGetFieldValue('custpage_dj_deliverydate');
	parameter += '&field_customer_jp='+nlapiGetFieldValue('custpage_customer_jp');
	parameter += '&field_customer_en='+nlapiGetFieldValue('custpage_customer_en');
	parameter += '&field_sub='+nlapiGetFieldValue('custpage_sub');
	
	parameter += '&selectFlg=F';
	
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_mail_send',deployID);

	https = https + parameter;

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	location.href = https;
}

