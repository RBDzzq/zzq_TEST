/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Jan 2022     LXK
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

	return true;
}

/**
 * 検索
 */
function search() {
	var parameter = '';
	parameter += '&field_location=' + nlapiGetFieldValue('custpage_location');
	parameter += '&field_item=' + nlapiGetFieldValue('custpage_item');
	parameter += '&field_product_group='
			+ nlapiGetFieldValue('custpage_product_group');
	parameter += '&field_classification='
			+ nlapiGetFieldValue('custpage_classification');
	parameter += '&field_department='
			+ nlapiGetFieldValue('custpage_department');
	parameter += '&field_subsidiary='
		+ nlapiGetFieldValue('custpage_subsidiary');
	
	var https = nlapiResolveURL('SUITELET',
			'customscript_djkk_sl_inventory_custody',
			'customdeploy_djkk_sl_inventory_custody');
	parameter += '&selectFlg=T';
	https = https + parameter;

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	location.href = https;
}

/*
 *更新
 */
function refresh(){
	var parameter = '';
	parameter += '&field_location=' + nlapiGetFieldValue('custpage_location');
	parameter += '&field_item=' + nlapiGetFieldValue('custpage_item');
	parameter += '&field_product_group='
			+ nlapiGetFieldValue('custpage_product_group');
	parameter += '&field_classification='
			+ nlapiGetFieldValue('custpage_classification');
	parameter += '&field_department='
			+ nlapiGetFieldValue('custpage_department');
	parameter += '&field_subsidiary='
		+ nlapiGetFieldValue('custpage_subsidiary');
	
	var https = nlapiResolveURL('SUITELET',
			'customscript_djkk_sl_inventory_custody',
			'customdeploy_djkk_sl_inventory_custody');
	parameter += '&selectFlg=F';
	https = https + parameter;

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	location.href = https;
}