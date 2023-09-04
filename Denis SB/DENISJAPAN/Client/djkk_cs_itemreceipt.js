/**
 * 受領書のClient
 * 
 * Version     日付            担当者       備考
 * 1.00        2021/02/22     YUAN      新規作成
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String}
 *            type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
//	var user = nlapiGetUser();
//	if (user == '167') {
//		//if (type == 'copy') {
//			
//		// TODO 在庫詳細ボタン非表示(DJ_在庫詳細関数開発後注釈を開く)
//		setButtunButtonDisable('item_inventorydetail1_fs');
//		//}
//	}
//	if(type == 'copy'){
//		
//		//受領、場所デフォルト：各連結の検品中倉庫
//		var lineCount = nlapiGetLineItemCount('item');
//		for(var i = 0 ; i < lineCount ;i++){
//			nlapiSelectLineItem('item', i+1);
//			if(nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_inspection_required') == 'T'){
//				
//				var locationSearch = nlapiSearchRecord("location",null,
//						[
//						   ["name","contains","検品中"], 
//						   "AND", 
//						   ["subsidiary","anyof",nlapiGetFieldValue('subsidiary')], 
//						   "AND", 
//						   ["custrecord_djkk_exsystem_parent_location","anyof",nlapiGetCurrentLineItemValue('item', 'location')]
//						], 
//						[
//						   new nlobjSearchColumn("internalid")
//						]
//						);
//				
//				var inspectionLocationid = '';
//				if(!isEmpty(locationSearch)){
//					inspectionLocationid = locationSearch[0].getValue("internalid");
//					nlapiSetCurrentLineItemValue('item', 'location', inspectionLocationid);
//					nlapiCommitLineItem('item');
//				}		
//			}	
//		}
//	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {
	
	 //入出庫処理
	var itemCount = nlapiGetLineItemCount('item');
	var subsidiary = nlapiGetFieldValue('subsidiary');
	for(var i = 1 ; i < itemCount+1 ; i ++){
		 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup'&&nlapiGetCurrentLineItemValue('item', 'itemreceive') == 'T') {
		//nlapiSelectLineItem('item', i);
		//changed by geng add start todolistU294
		var itemid = nlapiGetLineItemValue('item','item',i);
		var itemType = nlapiLookupField('item',itemid,'recordType');
		if((nlapiGetCurrentLineItemValue('item', 'binitem')=='T')&&(itemType == 'lotnumberedassemblyitem'||itemType == 'lotnumberedinventoryitem')&&(subsidiary==SUB_SCETI||subsidiary==SUB_DPKK) ){
		
		//在庫詳細確認	
//		var inventoryDetail=nlapiEditCurrentLineItemSubrecord('item','inventorydetail');
		var inventoryDetail=nlapiViewCurrentLineItemSubrecord('item','inventorydetail');
		
		if(!isEmpty(inventoryDetail)){
			var invCount = inventoryDetail.getLineItemCount('inventoryassignment')
			for(var m = 1 ; m < invCount+1 ; m++){
				inventoryDetail.selectLineItem('inventoryassignment',m);	
				if(isEmpty(inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber'))){
				//0228	
					alert('在庫詳細保管棚情報が入力されていません。');
				//0228	
					return false;
//					return true;
				}
			}
		}
		}
		//changed by geng add end todolistU294
		var locationId = nlapiGetLineItemValue('item', 'location', i);
		if(!isEmpty(locationId)){
			var flg = nlapiLookupField('location', locationId, 'custrecord_djkk_stop_load')
			if(flg == 'T'){
				alert(nlapiGetLineItemText('item', 'location', i)+' 入出庫を停止しています。');
				return false;
			}
		}
	}
	}
	
	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
function clientFieldChanged(type, name, linenum) {
	
	// DJ_検品終了希望日
	if (name == 'custbody_djkk_inspection_finished') {
	var inspectionDate=	nlapiGetFieldValue('custbody_djkk_inspection_finished');
	
		// DJ_出荷予定日
       nlapiSetFieldValue('custbody_djkk_expected_shipping_date',dateAddDays(inspectionDate,1));     
	}
	
	if (name == 'custbody_djkk_reserved_exchange_rate_p') {
		var  rateid=nlapiGetFieldValue('custbody_djkk_reserved_exchange_rate_p');
		
		var rate = '';
		if(!isEmpty(rateid)){
		rate =nlapiLookupField('customrecord_djkk_reserved_exchange_rate',rateid,
				'custrecord_djkk_reserved_exchange_rate');
		}
		nlapiSetFieldValue('exchangerate', rate);
	}
}

//document.getElementById('printlabels').onclick = 
function pdfMaker(){
  // alert('test');
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_itemreceipt_pdf','customdeploy_djkk_sl_itemreceipt_pdf');
	theLink += '&itemreceiptId='+nlapiGetRecordId();
	 var rse = nlapiRequestURL(theLink);
     var pagereturn = rse.getBody();
     if(!isEmpty(pagereturn)){
    	 if(pagereturn.split(':')[0]=='Error'){
    		 alert(pagereturn.split(':')[1]);
         }else{
        	 var urlArray=pagereturn.split('|||');
        	 for(var i=0;i<urlArray.length-1;i++){
        		 window.open(urlArray[i]);
        	 } 
         } 
     }else{
    	 alert('GS1生成なし');
     }	
}

//
///*
// * DJKK在庫詳細
// */
//function djkkInventoryDetails() {
//
//	var theLink = nlapiResolveURL('SUITELET',
//			'customscript_djkk_sl_inventory_details',
//			'customdeploy_djkk_sl_inventory_details');
//	
//	// パラメータの追加
//	theLink = theLink + '&POID=' + nlapiGetFieldValue('createdfrom')+ '&viewtype=create';
//
//		window.opener = null;
//		window.open('', '_self');
//		window.close();
//		window.open(theLink);
//	
//}
//
///*
// * DJKK在庫詳細view
// */
//function djkkInventoryDetailsview() {
//
//	var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_inventory_details','customdeploy_djkk_sl_inventory_details');
//	
//	// パラメータの追加
//	theLink = theLink + '&POID=' + nlapiGetFieldValue('createdfrom')+ '&viewtype=view';
//	// popUp画面
//	nlExtOpenWindow(theLink, 'newwindow', 1500, 700, this, false,'DJKK在庫詳細一覧');
//}

