/**
 * DJ_配送用CSV出力
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
			alert('対象選択してください。')
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
		if(name == 'custpage_mainline_insurance_premium'){//保険料
			var insuranceFlag = nlapiGetCurrentLineItemValue('list','custpage_mainline_insurance')//保険付
			var insurancePremium = nlapiGetCurrentLineItemValue('list','custpage_mainline_insurance_premium')//保険料
			if(insuranceFlag == 'F' && !isEmpty(insurancePremium)){
				alert('「保険付」が選択されていない場合、「保険料」は入力できません')
				nlapiSetCurrentLineItemValue('list','custpage_mainline_insurance_premium','',false,false)
			}
		}
		//ヤマト
		if(name == 'custpage_yamatodeliverytimezone'|| name == 'custpage_sending_type'){
			
			var deliveryTimeZone = nlapiGetCurrentLineItemValue('list','custpage_yamatodeliverytimezone');//配達時間帯
			var sendingType = nlapiGetCurrentLineItemValue('list','custpage_sending_type');//送り状種類
			
			if(!isEmpty(deliveryTimeZone)){
				if(isEmpty(sendingType)){
					alert('【配達時間帯】を入力する前に、【送り状の種類】を入力してください。')
					nlapiSetCurrentLineItemValue('list','custpage_yamatodeliverytimezone','',false,false);
				}else if(sendingType =='3'){
					//3:ＤＭ便
					alert('【送付状の種類】が「DM便」の場合、現在【配信時間帯】選択されている現在のオプションは適用されません。')
					nlapiSetCurrentLineItemValue('list','custpage_yamatodeliverytimezone','',false,false);
				}
				if((deliveryTimeZone!= '0010'&&deliveryTimeZone != '0017')&&sendingType =='4'){
					//4:タイム
					alert('【送り状の種類】が「4：タイム」の場合、「0010：午前10時まで」と「0017：午後5時まで」の【送り状の種類】のみ選択できます。')
					nlapiSetCurrentLineItemValue('list','custpage_yamatodeliverytimezone','',false,false);
				}else if((deliveryTimeZone == '0010'||deliveryTimeZone == '0017')&&sendingType !='4'){
					//4:タイム
					alert('「0010：午前10時まで」と「0017：午後5時まで」は【送り状の種類】が「4：タイム」の場合のみ選択可能。')
					nlapiSetCurrentLineItemValue('list','custpage_yamatodeliverytimezone','',false,false);
				}
			}
		}
		//日通
		//佐川
		if(name == 'custpage_delivery_specified_hour'||name == 'custpage_delivery_specified_min'){//配達指定時間
			var insuranceFlag = nlapiGetCurrentLineItemValue('list','custpage_speed_designation')//スピード指定
			var deliverySpecifiedHour = nlapiGetCurrentLineItemValue('list','custpage_delivery_specified_hour')//配達指定時間（時）
			var deliverySpecifiedMin = nlapiGetCurrentLineItemValue('list','custpage_delivery_specified_min')//配達指定時間（分）
			if(insuranceFlag != '005' && (!isEmpty(deliverySpecifiedHour)||!isEmpty(deliverySpecifiedMin))){
				alert('「スピード指定」は「飛脚ジャストタイム便」を選択してこそ、配達指定時間が入ることができます。')
				nlapiSetCurrentLineItemValue('list','custpage_delivery_specified_hour','',false,false)
				nlapiSetCurrentLineItemValue('list','custpage_delivery_specified_min','',false,false)
			}else{
				if(deliverySpecifiedHour == '24'&&deliverySpecifiedMin == '30'){
					alert("「配達指定時間（時）」が「24時」の場合、「配達指定時間（分）」は「30分」を選択できません。")
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
		

		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;

		// 画面をリフレッシュする
		window.location.href = https;
	}else if(name == 'custpage_express'){
		var express = nlapiGetFieldValue('custpage_express')
	
        var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_creation', 'customdeploy_djkk_sl_invoice_creation');

		https = https + parameter;
		

		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;

		// 画面をリフレッシュする
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
 *更新
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
	
	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function search(){
	
	var custpage_club = nlapiGetFieldValue('custpage_club');
	var custpage_datetext = nlapiGetFieldValue('custpage_datetext');
	var custpage_express = nlapiGetFieldValue('custpage_express');
	if(isEmpty(custpage_club)){
		alert('子会社を入力してください。');
		return false;
	}
	if(isEmpty(custpage_datetext)){
		alert('出荷日を入力してください。');
		return false;
		}
	if(isEmpty(custpage_express)){
		alert('運送会社を入力してください。');
		return false;
		}
	
	var parameter = setParam();
		
	parameter += '&selectFlg=T';
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_creation', 'customdeploy_djkk_sl_invoice_creation');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
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
//	parameter += '&timeZone='+nlapiGetFieldValue('custpage_time_zone_code'); 20230213 changed by zhou U046課題規定不要

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_creation', 'customdeploy_djkk_sl_invoice_creation');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}
function searchReturn(){
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_creation', 'customdeploy_djkk_sl_invoice_creation');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
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
//	parameter += '&timeZone='+nlapiGetFieldValue('custpage_time_zone');  20230213 changed by zhou U046課題規定不要
	parameter += '&temp='+nlapiGetFieldValue('custpage_temp');
	return parameter;
}


