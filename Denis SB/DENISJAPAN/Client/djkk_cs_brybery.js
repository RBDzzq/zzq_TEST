/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Sep 2022     rextec
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
//20221211 changed by zhou start
	if(type=='edit'&&nlapiGetFieldValue('custrecord_djkk_page_status')!='2'&&isEmpty(nlapiGetFieldValue('custrecord_djkk_bribery_error'))){//?
		var icId = nlapiGetRecordId();
		var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_briberyacknowledgme','customdeploy_djkk_sl_briberyacknowledgme');
		theLink += '&icId=' + icId;
		theLink += '&Status=edit';
		var rse = nlapiRequestURL(theLink);
		var flg = rse.getBody();
		if(flg.indexOf('異常発生')>-1){
			alert(flg);
			window.ischanged = false;
			window.location.href=theLink;		  			
		}else{
			var theLink = nlapiResolveURL('RECORD', 'vendorcredit',flg, 'EDIT');
			window.ischanged = false;
			window.location.href=theLink;
		}
		//20230616 add by zhou start
	}else{
		alert('現在実行中のオペレータがいます。「エラーのロールバック」ボタンをクリックして異常を取り除いてから試してください');
		try{
			window.history.back();
			window.close;
		}catch(e){
			window.open("about:blank", "_top")
		}
	}	
	//20230616 add by zhou end	
//end
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
//	var itemCount = nlapiGetLineItemCount('recmachcustrecord_djkk_brybery_page');
//	var amount = 0;
//	for(var j=1;j<itemCount+1;j++){
//		var qunantity = nlapiGetLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity', j);//qunantity
//		var unit = nlapiGetLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate', j);//unit
//		if(isEmpty(unit)){
//			alert(j+'行目の単価を入力してください');
//			return false;
//		}else{
//			amount = amount+(Number(qunantity)*Number(unit));
//		}
//	}
//	nlapiSetFieldValue('custrecord_djkk_bribery_amount', amount);
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
//	if(name=='custrecord_djkk_bribery_vendor'){
//		nlapiSetFieldValue('custrecord_djkk_bribery_account', '498');
//	}
//	if(name=='custrecord_djkk_brybery_admin_number'){
//		var item = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_brybery_detail_item');//item
//		var location = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_brybery_detail_location');//loacation
//		if(isEmpty(location)){
//			alert('まず場所フィールドを選択してください');
//
//		}else{
//				var adminNum = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_brybery_admin_number');//管理番号（シリアル/ロット番号）
//				var adminNumText = nlapiGetCurrentLineItemText(type,'custrecord_djkk_brybery_admin_number');//管理番号（シリアル/ロット番号）
//				var itemSearchOne = nlapiSearchRecord("inventorydetail",null,
//						[
//						       ["item","anyof",item], 
//							   "AND", 
//							   ["isinventoryaffecting","is","T"], 
//							   "AND", 
//							   ["inventorynumber","anyof",adminNum], 
//							   "AND", 
//							   ["inventorynumber.location","anyof",location]
//						], 
//						[
//						   new nlobjSearchColumn("inventorynumber").setSort(false), 
//						   new nlobjSearchColumn("binnumber"), 
//						   new nlobjSearchColumn("expirationdate"), 
//						   new nlobjSearchColumn("location","inventoryNumber",null), 
//						   new nlobjSearchColumn("custitemnumber_djkk_control_number","inventoryNumber",null), 
//						   new nlobjSearchColumn("custitemnumber_djkk_lot_memo","inventoryNumber",null), 
//						   new nlobjSearchColumn("custitemnumber_djkk_shipment_date","inventoryNumber",null), 
//						   new nlobjSearchColumn("custitemnumber_djkk_smc_nmuber","inventoryNumber",null), 
//						   new nlobjSearchColumn("custitemnumber_djkk_make_date","inventoryNumber",null),
//						   new nlobjSearchColumn("quantityavailable","inventoryNumber",null)
//						]
//						);
//			
//			if(isEmpty(itemSearchOne)){
//				alert('選択した管理番号が商品と一致しませんので、もう一度選択してください');
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_over_date_brybery', '');
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_admit_serial_number', '');
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_brybery_probort_date', '');
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_brybery_binnery_num', '');
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_ware_house_num_brybery', '');
//			}else{
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_over_date_brybery', itemSearchOne[0].getValue("expirationdate"));//有効期限
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_admit_serial_number', itemSearchOne[0].getValue("custitemnumber_djkk_control_number","inventoryNumber",null));//_メーカーシリアル番号	
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_brybery_probort_date', itemSearchOne[0].getValue("custitemnumber_djkk_shipment_date","inventoryNumber",null));//残出荷可能期間/DJ_出荷可能期限日	
////				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_brybery_binnery_num', itemSearchOne[0].getValue("binnumber"));//保管棚番号	
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_ware_house_num_brybery', nlapiGetCurrentLineItemText(type,'custrecord_djkk_brybery_admin_number'));
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_brybery_detail_probably', itemSearchOne[0].getValue("quantityavailable","inventoryNumber",null));//about	
//			}
//		}
//	}
//	if(name=='custrecord_djkk_brybery_detail_quantity'){
//		var about = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_brybery_detail_probably');
//		var nowQuantity = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_brybery_detail_quantity');
//		if(!isEmpty(about)){
//			if(Number(nowQuantity)>Number(about)){
//				alert('入力した数量が可能な数量より大きい');
//				return false;
//			}
//		}
//	}
}
function clientLineInit(type) {
//	var sub=nlapiGetFieldValue('custrecord_djkk_bribery_subsidiary');
//	if(nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_detail_sub') != sub){
//		nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_detail_sub', sub, false, true);
//	}	
}

function joken(){ //承認	
	var icId = nlapiGetRecordId();
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_briberyacknowledgme','customdeploy_djkk_sl_briberyacknowledgme');
	theLink += '&icId=' + icId;
	theLink += '&Status=approval';
	var rse = nlapiRequestURL(theLink);
	var flg = rse.getBody();
	if(flg != 'F'){
		alert('承認済み、DJ_前払金/買掛金調整が生成されました');
		var theLink = nlapiResolveURL('RECORD', 'vendorcredit',flg, 'EDIT');
		window.ischanged = false;
		window.location.href=theLink;
	}else{
		alert('異常発生');
		var theLink = URL_HEAD +'/app/common/scripting/scriptrecord.nl?id=1454';
		window.open(theLink);
	}
	
}

function start(){
	var icId = nlapiGetRecordId();
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_brybery_over','customdeploy_djkk_sl_brybery_over');
	theLink += '&icId=' + icId;
	var rse = nlapiRequestURL(theLink);
	var flg = rse.getBody();
	if(flg != 'F'){
		alert('承認済み,前払金/買掛金調整ページが作成されました');
		var theLink = nlapiResolveURL('RECORD', 'vendorcredit',flg, 'VIEW');
		window.ischanged = false;
		window.location.href=theLink;
	}else{
		alert('異常発生');
	}
}
function errorback(){
	var icId = nlapiGetRecordId();
	var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',icId);
	var val = record.getFieldValue('custrecord_djkk_over_id');
	var error=record.getFieldValue('custrecord_djkk_bribery_error');
	if(!isEmpty(error)){
		record.setFieldValue('custrecord_djkk_bribery_error','');
		nlapiSubmitRecord(record);
	}
	
    if(!isEmpty(val)){
	var delLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_briberyacknowledgme','customdeploy_djkk_sl_briberyacknowledgme');
	delLink += '&deleteRecordId=' + val;
	nlapiRequestURL(delLink);
	alert('しばらくお待ちください。「エラーのロールバック 」ボタンが消えるまで画面を更新してください。');
	}
	
	window.ischanged = false;
	window.location.href=window.location.href
}

