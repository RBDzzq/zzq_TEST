/**
 * DJ_�z���pCSV�o��
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
	
	if(type == 'list'){
		//COMMON
		if(name == 'custpage_mainline_insurance_premium'){//�ی���
			var insuranceFlag = nlapiGetCurrentLineItemValue('list','custpage_mainline_insurance')//�ی��t
			var insurancePremium = nlapiGetCurrentLineItemValue('list','custpage_mainline_insurance_premium')//�ی���
			if(insuranceFlag == 'F' && !isEmpty(insurancePremium)){
				alert('�u�ی��t�v���I������Ă��Ȃ��ꍇ�A�u�ی����v�͓��͂ł��܂���')
				nlapiSetCurrentLineItemValue('list','custpage_mainline_insurance_premium','',false,false)
			}
		}
		//���}�g
		if(name == 'custpage_yamatodeliverytimezone'|| name == 'custpage_sending_type'){
			
			var deliveryTimeZone = nlapiGetCurrentLineItemValue('list','custpage_yamatodeliverytimezone');//�z�B���ԑ�
			var sendingType = nlapiGetCurrentLineItemValue('list','custpage_sending_type');//�������
			
			if(!isEmpty(deliveryTimeZone)){
				if(isEmpty(sendingType)){
					alert('�y�z�B���ԑсz����͂���O�ɁA�y�����̎�ށz����͂��Ă��������B')
					nlapiSetCurrentLineItemValue('list','custpage_yamatodeliverytimezone','',false,false);
				}else if(sendingType =='3'){
					//3:�c�l��
					alert('�y���t��̎�ށz���uDM�ցv�̏ꍇ�A���݁y�z�M���ԑсz�I������Ă��錻�݂̃I�v�V�����͓K�p����܂���B')
					nlapiSetCurrentLineItemValue('list','custpage_yamatodeliverytimezone','',false,false);
				}
				if((deliveryTimeZone!= '0010'&&deliveryTimeZone != '0017')&&sendingType =='4'){
					//4:�^�C��
					alert('�y�����̎�ށz���u4�F�^�C���v�̏ꍇ�A�u0010�F�ߑO10���܂Łv�Ɓu0017�F�ߌ�5���܂Łv�́y�����̎�ށz�̂ݑI���ł��܂��B')
					nlapiSetCurrentLineItemValue('list','custpage_yamatodeliverytimezone','',false,false);
				}else if((deliveryTimeZone == '0010'||deliveryTimeZone == '0017')&&sendingType !='4'){
					//4:�^�C��
					alert('�u0010�F�ߑO10���܂Łv�Ɓu0017�F�ߌ�5���܂Łv�́y�����̎�ށz���u4�F�^�C���v�̏ꍇ�̂ݑI���\�B')
					nlapiSetCurrentLineItemValue('list','custpage_yamatodeliverytimezone','',false,false);
				}
			}
		}
		//����
		//����
		if(name == 'custpage_delivery_specified_hour'||name == 'custpage_delivery_specified_min'){//�z�B�w�莞��
			var insuranceFlag = nlapiGetCurrentLineItemValue('list','custpage_speed_designation')//�X�s�[�h�w��
			var deliverySpecifiedHour = nlapiGetCurrentLineItemValue('list','custpage_delivery_specified_hour')//�z�B�w�莞�ԁi���j
			var deliverySpecifiedMin = nlapiGetCurrentLineItemValue('list','custpage_delivery_specified_min')//�z�B�w�莞�ԁi���j
			if(insuranceFlag != '005' && (!isEmpty(deliverySpecifiedHour)||!isEmpty(deliverySpecifiedMin))){
				alert('�u�X�s�[�h�w��v�́u��r�W���X�g�^�C���ցv��I�����Ă����A�z�B�w�莞�Ԃ����邱�Ƃ��ł��܂��B')
				nlapiSetCurrentLineItemValue('list','custpage_delivery_specified_hour','',false,false)
				nlapiSetCurrentLineItemValue('list','custpage_delivery_specified_min','',false,false)
			}else{
				if(deliverySpecifiedHour == '24'&&deliverySpecifiedMin == '30'){
					alert("�u�z�B�w�莞�ԁi���j�v���u24���v�̏ꍇ�A�u�z�B�w�莞�ԁi���j�v�́u30���v��I���ł��܂���B")
					nlapiSetCurrentLineItemValue('list','custpage_delivery_specified_min','',false,false)
				}
			}
		}
	}
	
	
	
	
	
	if(name == 'custpage_club'){
		var club = nlapiGetFieldValue('custpage_club')
	
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_creation', 'customdeploy_djkk_sl_invoice_creation');

		https = https + parameter;
		

		// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
		window.ischanged = false;

		// ��ʂ����t���b�V������
		window.location.href = https;
	}else if(name == 'custpage_express'){
		var express = nlapiGetFieldValue('custpage_express')
	
        var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_creation', 'customdeploy_djkk_sl_invoice_creation');

		https = https + parameter;
		

		// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
		window.ischanged = false;

		// ��ʂ����t���b�V������
		window.location.href = https;
	}
//	if(type == 'list'&&name == 'custpage_mainline_insurance'){
//		var inputInsuranceFlag =   nlapiGetCurrentLineItemValue('list','custpage_mainline_insurance');
//		if(inputInsuranceFlag == 'T'){
//			var field = nlapiGetLineItemField(type, 'custpage_mainline_insurance_premium',linenum);
//			if (!isEmpty(field)) {
//				alert(field)
//				field.setDisplayType('normal');
//			}else{
//				field.setDisplayType('disabled');
//			}
//		}
//	}
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

function clearf(){
	var parameter = '';
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_creation', 'customdeploy_djkk_sl_invoice_creation');	

	https = https + parameter;
	
	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function search(){
	
	var custpage_club = nlapiGetFieldValue('custpage_club');
	var custpage_datetext = nlapiGetFieldValue('custpage_datetext');
	var custpage_express = nlapiGetFieldValue('custpage_express');
	if(isEmpty(custpage_club)){
		alert('�q��Ђ���͂��Ă��������B');
		return false;
	}
	if(isEmpty(custpage_datetext)){
		alert('�o�ד�����͂��Ă��������B');
		return false;
		}
	if(isEmpty(custpage_express)){
		alert('�^����Ђ���͂��Ă��������B');
		return false;
		}
	
	var parameter = setParam();
		
	parameter += '&selectFlg=T';
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_creation', 'customdeploy_djkk_sl_invoice_creation');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}
function go_back(){
	
	var parameter = '';
	parameter += '&express='+nlapiGetFieldValue('custpage_express_code');
	parameter += '&transport='+nlapiGetFieldValue('custpage_transport_code');
	parameter += '&club='+nlapiGetFieldValue('custpage_club_code');
	parameter += '&location='+nlapiGetFieldValue('custpage_location_code');
	parameter += '&date='+nlapiGetFieldValue('custpage_date_code');
	parameter += '&dateree='+nlapiGetFieldValue('custpage_datetext_code');
	parameter += '&number='+nlapiGetFieldValue('custpage_number_code');
//	parameter += '&invoice='+nlapiGetFieldValue('custpage_invoice_number_code');
	parameter += '&selectFlg=T';
	parameter += '&position=back';
	parameter += '&datereeto='+nlapiGetFieldValue('custpage_datetext_to_code');
	parameter += '&delivery='+nlapiGetFieldValue('custpage_delivery_code');
	parameter += '&deliveryDate='+nlapiGetFieldValue('custpage_delivery_date_code');
	parameter += '&deliveryDateTo='+nlapiGetFieldValue('custpage_delivery_date_code_to');
	parameter += '&inputOrder='+nlapiGetFieldValue('custpage_input_order_code');
	parameter += '&section='+nlapiGetFieldValue('custpage_section_code');
	parameter += '&temp='+nlapiGetFieldValue('custpage_temp_code');
//	parameter += '&timeZone='+nlapiGetFieldValue('custpage_time_zone_code'); 20230213 changed by zhou U046�ۑ�K��s�v

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_creation', 'customdeploy_djkk_sl_invoice_creation');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}
function searchReturn(){
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_creation', 'customdeploy_djkk_sl_invoice_creation');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function setParam(){

	var parameter = '';
	parameter += '&date='+nlapiGetFieldValue('custpage_date');
	parameter += '&express='+nlapiGetFieldValue('custpage_express');
	parameter += '&number='+nlapiGetFieldValues('custpage_number');
	parameter += '&dateree='+nlapiGetFieldValue('custpage_datetext');
//	parameter += '&invoice='+nlapiGetFieldValue('custpage_invoice_number');
	parameter += '&club='+nlapiGetFieldValue('custpage_club');
	parameter += '&transport='+nlapiGetFieldValue('custpage_transport');
	parameter += '&location='+nlapiGetFieldValue('custpage_location');
	parameter += '&datereeto='+nlapiGetFieldValue('custpage_datetext_to');
	parameter += '&delivery='+nlapiGetFieldValue('custpage_delivery');
	parameter += '&deliveryDate='+nlapiGetFieldValue('custpage_delivery_date');
	parameter += '&deliveryDateTo='+nlapiGetFieldValue('custpage_delivery_date_to');
	parameter += '&inputOrder='+nlapiGetFieldValue('custpage_input_order');
	parameter += '&section='+nlapiGetFieldValue('custpage_section');
//	parameter += '&timeZone='+nlapiGetFieldValue('custpage_time_zone');  20230213 changed by zhou U046�ۑ�K��s�v
	parameter += '&temp='+nlapiGetFieldValue('custpage_temp');
	return parameter;
}


