/**
 * 在庫調整/在庫移動/移動伝票画面のclient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/09     CPC_苑
 *
 */

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
		
	// DJ_入り目
//	if (name == 'units') {
//		var unitname = nlapiGetCurrentLineItemText(type, 'units');
//		if (!isEmpty(unitname)) {							
//				nlapiSetCurrentLineItemValue(type,'custcol_djkk_conversionrate',getConversionrate(unitname));		
//		}
//	}
	
	if (name == 'units') {
		// DJ_入数
		//20230704 changed by zhou start CH677
//		var unitname = nlapiGetCurrentLineItemText(type, 'units');
//		if (!isEmpty(unitname)) {							
////				nlapiSetCurrentLineItemValue(type,'custcol_djkk_perunitquantity',getConversionrate(unitname));		
//				nlapiSetCurrentLineItemValue(type,'custcol_djkk_perunitquantity',getConversionrateAbbreviation(unitname));		
//		}
		var unitId = nlapiGetCurrentLineItemValue(type, 'units');
		var itemId = nlapiGetCurrentLineItemValue(type, 'item');
		if (!isEmpty(unitId) &&!isEmpty(itemId)) {	
        var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity')
			nlapiSetCurrentLineItemValue(type,'custcol_djkk_perunitquantity',itemPerunitQuantity);		
		}
		//20230704 changed by zhou end
	}
	
	var recordType= nlapiGetRecordType();
	if(recordType=='inventoryadjustment'){
	
		if(name == 'custbody_djkk_change_reason'){		
			var resonId=nlapiGetFieldValue('custbody_djkk_change_reason');		
			if(!isEmpty(resonId)){
		    nlapiSetFieldValue('account', nlapiLookupField('customrecord_djkk_invadjst_change_reason', resonId, 'custrecord_djkk_account'), false, true)
			}else{
				nlapiSetFieldValue('account', null, false, true);
			}
		}
	}

}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
	var recordType= nlapiGetRecordType();
	var customform = nlapiGetFieldValue('customform');//customform
	//20220906 add by zhou U809
	if(recordType=='inventorytransfer' && customform == '136'){
//		if(type == 'inventory'&& name == 'custcol_djkk_new_management_num'){
		var managementCheck = nlapiGetCurrentLineItemValue('inventory','custcol_djkk_new_management_num');
		if(managementCheck == 'T'){
			var changeReason = nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons');
			if(isEmpty(changeReason)){
				 alert('新しい管理番号が確定したら、、「DJ_変更理由」を必須入力');
				 return false;
			}
//			}else{
//				var invArray = [];
//				var subsidiary = nlapiGetFieldValue('subsidiary');//子会社
//				var account = nlapiGetFieldValue('account');//調整勘定科目
//				var admitRe = nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons');//変更理由
//				var item=nlapiGetCurrentLineItemValue('inventory', 'item');//item
//				var warehouse = nlapiGetFieldValue('location');  //場所   
//				var inventoryqty = nlapiGetCurrentLineItemValue('inventory', 'quantityonhand');  //在庫数量   
//				var adjqty = nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby');  //移動数量 
//				var inventorydetailFlag = nlapiGetCurrentLineItemValue("inventory","inventorydetailavail");
//				nlapiLogExecution('debug','account',account)
//				if(inventorydetailFlag == 'T'){
//					//在庫詳細設定
//					var inventoryDetail = nlapiEditCurrentLineItemSubrecord('inventory','inventorydetail');
//					nlapiLogExecution('debug','inventoryDetail',inventoryDetail)
//					if(!isEmpty(inventoryDetail)){
//						nlapiLogExecution('debug','111','111')
//		  				var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
//		  				if(inventoryDetailCount != 0){
//							for(var i = 1 ;i < inventoryDetailCount+1 ; i++){
//		    				    inventoryDetail.selectLineItem('inventoryassignment',i);
//		    				    var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
//		    				    nlapiLogExecution('debug','receiptinventorynumber',receiptinventorynumber);
//		    				    var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//有効期限
//		    				    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_メーカー製造ロット番号
//		    				    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_製造年月日
//		    				    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_出荷可能期限日
//		    				    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_倉庫入庫番号
//		    				    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC番号
//		    				    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_ロットメモ	
//		    				    var shednum =  inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber');  //保管棚番号
////			    				    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_ロットリマーク
//		    				    var lotRemark = inventoryDetail.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',i);
//		    				    var quantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity');//数量		
//		    				    var controlNumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_メーカーシリアル番号
//		    				    var detailSearch = getSearchResults("item",null,
//		    							 [
//		    							    ["inventorynumber.internalid","anyof",receiptinventorynumber]
//		    							 ], 
//		    							 [
//		    							 new nlobjSearchColumn("inventorynumber","inventoryNumber",null), 
//		    					 ]
//		    					 );
//		    					if(!isEmpty(detailSearch)){
//		    						var inventorynumber = detailSearch[0].getValue("inventorynumber","inventoryNumber",null);				
//		    					}
//		    				    invArray.push({
//		    				    	inventorynumber:inventorynumber,
//		    				    	receiptinventorynumber:receiptinventorynumber,
//		    				    	expirationdate:expirationdate,
//		    				    	makernum:makernum,
//		    				    	madedate:madedate,
//		    				    	deliveryperiod:deliveryperiod,
//		    				    	warehouseCode:warehouseCode,
//		    				    	smc:smc,
//		    				    	lotMemo:lotMemo,
//		    				    	shednum:shednum,
//		    				    	lotRemark:lotRemark,
//		    				    	quantity:quantity,
//		    				    	controlNumber:controlNumber
//		    				    })
//							}
//		  				}
//					}
//				}
//				nlapiLogExecution('debug','invArray',invArray)
//				var rec2 = nlapiCreateRecord('inventoryadjustment');
//				rec2.setFieldValue('trandate',  nlapiDateToString(getSystemTime())); //日付
//				rec2.setFieldValue('subsidiary',subsidiary);//子会社
//				rec2.setFieldValue('account',account);//調整勘定科目
//				rec2.setFieldValue('custbody_djkk_change_reason', admitRe);//変更理由
//				rec2.selectNewLineItem('inventory'); //明細
//				rec2.setCurrentLineItemValue('inventory', 'item', item);//item
//				rec2.setCurrentLineItemValue('inventory', 'adjustqtyby', adjqty);//調整数量   
//				rec2.setCurrentLineItemValue('inventory', 'location', warehouse);//場所
//				var inventoryDetail = rec2.createCurrentLineItemSubrecord('inventory','inventorydetail');//在庫詳細
//				for(var n = 1 ; n < invArray.length+1 ;n++){
//					inventoryDetail.selectNewLineItem('inventoryassignment');
//					if(!isEmpty(invArray[n].shednum)){
//						inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', invArray[n].shednum);
//					}
//					inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',invArray[n].inventorynumber);//シリアル/ロット番号
//					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', invArray[n].quantity);//数量
//					inventoryDetail.commitLineItem('inventoryassignment');
//					inventoryDetail.commit();
//				}
//				rec2.commitLineItem('inventory');
//				var inventoryadjustmentId = nlapiSubmitRecord(rec2);
//				nlapiLogExecution('debug','inventoryadjustmentId',inventoryadjustmentId)
//				var inventoryadjustmentSearch = getSearchResults("inventoryadjustment",null,
//						 [
//						    ["internalid","anyof",inventoryadjustmentId]
//						 ], 
//						 [
//						 new nlobjSearchColumn("tranid"), 
//						 ]
//				 );
//				if(!isEmpty(inventoryadjustmentSearch)){
//					var tranid = detailSearch[0].getValue("tranid");				
//				}
//				nlapiSetCurrentLineItemValue('custcol_djkk_inv_adjustment')
//			}
		}
//		}
	}
	//end
//	if(recordType=='inventoryadjustment'){
//		
//		// 調整数量
//		var adjustqtyby=nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby');
//		
//		// DJ_変更理由
//		var changeReason=nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reason');
//		
//		if(adjustqtyby!='0'&&isEmpty(changeReason)){
//			 alert('数量変更は、「DJ_変更理由」を必須入力');
//			 return false;
//		}
//	}
    return true;
}
