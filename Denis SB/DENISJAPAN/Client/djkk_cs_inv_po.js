/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Jul 2022     zhou
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	nlapiLogExecution('debug','', '開始')
	var recordType = nlapiGetRecordType();
		var count = nlapiGetLineItemCount('item');
		if(count != null && count >= 0){
			for(var n = 0 ; n < count ; n++){
				var  inventorydetailFlag =nlapiGetLineItemValue("item","inventorydetailavail",n+1);
				if(inventorydetailFlag == 'T'){
						nlapiSelectLineItem('item', n+1);
						var inventoryDetail = nlapiEditCurrentLineItemSubrecord('item','inventorydetail');
					if(!isEmpty(inventoryDetail)){
						var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
						nlapiLogExecution('debug','inventoryDetailCount', inventoryDetailCount);
						if(inventoryDetailCount != 0){
							for(var i = 1 ;i < inventoryDetailCount+1 ; i++){
								try{
			    				    inventoryDetail.selectLineItem('inventoryassignment',i);
			    				    var receiptinventorynumber;
			    				    var invReordId;
			    				    var inventorynumber;
			    				    	receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
			    				    	if(isEmpty(receiptinventorynumber)){
				    				    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
				    				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
								                    [
								                       ["internalid","is",invReordId]
								                    ], 
								                    [
								                     	new nlobjSearchColumn("inventorynumber"),
								                    ]
								                    );    
					    				    inventorynumber = inventorynumberSearch[0].getValue("inventorynumber");//DJ_メーカー製造ロット番号
			    				    	}
			    				    nlapiLogExecution('debug','receiptinventorynumber',receiptinventorynumber);
			    				    var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//有効期限
			    				    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_メーカー製造ロット番号
			    				    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_製造年月日
			    				    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_出荷可能期限日
			    				    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_倉庫入庫番号
			    				    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC番号
			    				    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_ロットメモ		
			    				    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_ロットリマーク
//			    				    var lotRemark = inventoryDetail.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',i)
			    				    var quantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity');//数量		
			    				    var controlNumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_メーカーシリアル番号	
			    				    nlapiLogExecution('debug','expirationdate', expirationdate);
			    				    //ロット番号のレコード設定
			    				    if(!isEmpty(receiptinventorynumber)){													
				    				    var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
							                    [
							                       ["inventorynumber","is",receiptinventorynumber]
							                    ], 
							                    [
							                     	new nlobjSearchColumn("internalid"),
							                    ]
							                    );    
				    				    	nlapiLogExecution('debug','???', receiptinventorynumber);
				    				    	invReordId = inventorynumberSearch[0].getValue("internalid");//ロット番号internalid
				    				    	inventorynumber = receiptinventorynumber;
			    				    }
			    				    nlapiLogExecution('debug','show me the invReordId',invReordId);
			    				    var inventorynumberReord = nlapiLoadRecord('inventorynumber',invReordId);
			    				    inventorynumberReord.setFieldValue('expirationdate',expirationdate);//有効期限
			    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_maker_serial_number',makernum);//DJ_メーカー製造ロット番号
			    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_make_date',madedate);//DJ_製造年月日
			    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_shipment_date',deliveryperiod);//DJ_出荷可能期限日
			    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_warehouse_number',warehouseCode);//DJ_倉庫入庫番号?
			    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_smc_nmuber',smc);//DJ_SMC番号
			    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_memo',lotMemo);//DJ_ロットメモ	
		    				   		inventorynumberReord.setFieldValue('custitemnumber_djkk_control_number',controlNumber);//DJ_メーカーシリアル番号
			    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_remark',lotRemark);//DJ_ロットリマーク
			    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',quantity);//数量
			    				    nlapiSubmitRecord(inventorynumberReord);
								}catch(e){
									nlapiLogExecution('ERROR', 'エラー', "システム実行時に異常が発生しました。異常元：'シリアル/ロット番号："+inventorynumber+"'。具体的な異常情報：'"+e.message+"'。");
								}	
							}
						}
					}
				}
			}
		nlapiLogExecution('debug','', 'end');
	}
    return true;
}
