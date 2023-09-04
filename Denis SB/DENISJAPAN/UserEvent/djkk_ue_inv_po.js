/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Jul 2022     zhou
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
	var recordType = nlapiGetRecordType();
	if(type=='edit'){
		nlapiLogExecution('debug','', '開始');
		var count = nlapiGetLineItemCount('item');
		if(count != null && count >= 0){
			for(var n = 0 ; n < count ; n++){
				var  inventorydetailFlag =nlapiGetLineItemValue("item","inventorydetailavail",n+1);
				if(inventorydetailFlag == 'T'){
						nlapiSelectLineItem('item', n+1);
						var inventoryDetail = nlapiEditCurrentLineItemSubrecord('item','inventorydetail');
					if(!isEmpty(inventoryDetail)){
						var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
						var item = inventoryDetail.getFieldValue('item');
						nlapiLogExecution('debug','inventoryDetailCount', inventoryDetailCount);
						if(inventoryDetailCount != 0){
							for(var i = 1 ;i < inventoryDetailCount+1 ; i++){
								try{
			    				    inventoryDetail.selectLineItem('inventoryassignment',i);
			    				    var receiptinventorynumber;
			    				    var invReordId;
			    				    var inventorynumber;
			    				    	receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
//			    				    	if(isEmpty(receiptinventorynumber)){
//				    				    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
//				    				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
//								                    [
//								                       ["internalid","is",invReordId]
//								                    ], 
//								                    [
//								                     	new nlobjSearchColumn("inventorynumber"),
//								                    ]
//								                    );    
//					    				    inventorynumber = inventorynumberSearch[0].getValue("inventorynumber");//DJ_メーカー製造ロット番号
//			    				    	}
			    				    nlapiLogExecution('debug','before receiptinventorynumber',receiptinventorynumber);
			    				    var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//有効期限
			    				    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_製造年月日
			    				    nlapiLogExecution('debug','before expirationdate', expirationdate);
			    				    //ロット番号のレコード設定
			    				    if(!isEmpty(receiptinventorynumber)){													
				    				    var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
							                    [
							                       ["inventorynumber","is",receiptinventorynumber],
							                       "AND",
							                       ["item","anyof",item]
							                    ], 
							                    [
							                     	new nlobjSearchColumn("internalid"),
							                    ]
							                    ); 
				    				    if(inventorynumberSearch != null){
				    				    	invReordId = inventorynumberSearch[0].getValue("internalid");//ロット番号internalid
				    				    	inventorynumber = receiptinventorynumber;
					    				    nlapiLogExecution('debug','before show me the invReordId',invReordId);
					    				    var inventorynumberReord = nlapiLoadRecord('inventorynumber',invReordId);
					    				    inventorynumberReord.setFieldValue('expirationdate',expirationdate);//有効期限
					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_make_date',madedate);//DJ_製造年月日
					    				    nlapiSubmitRecord(inventorynumberReord);
				    				    }
			    				    }
								}catch(e){
									nlapiLogExecution('ERROR', 'エラー', "システム実行時に異常が発生しました。異常元：'シリアル/ロット番号："+inventorynumber+"'。具体的な異常情報：'"+e.message+"'。");
								}	
							}
						}
					}
				}
			}
		}
		nlapiLogExecution('debug','', 'end');
	}
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
	if(type=='delete'){
        return null;
    }
	var recordType = nlapiGetRecordType();
	var loadRecord =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
	var record;
	if(type=='create'||type=='edit'){
		if(recordType != null){
			nlapiLogExecution('debug','start','start');
			var count;
			if(recordType == "inventoryadjustment" || recordType == "bintransfer"|| recordType == "inventorytransfer"){
				count = loadRecord.getLineItemCount('inventory');
			}else{
				count = loadRecord.getLineItemCount('item');
			}
			nlapiLogExecution('debug','count',count);
			if(count != null && count >= 0){
				for(var n = 0 ; n < count ; n++){
					var inventorydetailFlag;
					if(recordType == "inventoryadjustment" || recordType == "bintransfer" || recordType == "inventorytransfer"){
						inventorydetailFlag =loadRecord.getLineItemValue("inventory","inventorydetailavail",n+1);
					}else{
						inventorydetailFlag =loadRecord.getLineItemValue("item","inventorydetailavail",n+1);
					}
					if(inventorydetailFlag == 'T'){
						//在庫詳細設定
						var inventoryDetail;
						if(recordType == "inventoryadjustment" || recordType == "bintransfer" || recordType == "inventorytransfer"){
							loadRecord.selectLineItem('inventory', n+1);
							inventoryDetail = loadRecord.editCurrentLineItemSubrecord('inventory','inventorydetail');
						}else{
							loadRecord.selectLineItem('item', n+1);
							inventoryDetail = loadRecord.editCurrentLineItemSubrecord('item','inventorydetail');
						}
						if(!isEmpty(inventoryDetail)){
			  				var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
			  				var item = inventoryDetail.getFieldValue('item');
			  				nlapiLogExecution('debug','item',item);
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
//				    				    var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//有効期限
				    				    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_メーカー製造ロット番号
				    				    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_製造年月日
				    				    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_出荷可能期限日
				    				    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_倉庫入庫番号
				    				    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC番号
				    				    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_ロットメモ		
//				    				    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_ロットリマーク
				    				    var lotRemark = inventoryDetail.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',i)
				    				    var quantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity');//数量		
				    				    var controlNumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_メーカーシリアル番号		
				    				    var onhand=0;
				    				    //ロット番号のレコード設定
					    				    if(!isEmpty(receiptinventorynumber)){													
						    				    var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
									                    [
									                       ["inventorynumber","is",receiptinventorynumber],
									                       "AND",
									                       ["item","anyof",item]
									                       
									                    ], 
									                    [
	                                                        new nlobjSearchColumn("internalid",null,"GROUP"), 
	                                                        new nlobjSearchColumn("quantityonhand",null,"SUM")
										                    ]
										                    );    
							    				    	invReordId = inventorynumberSearch[0].getValue("internalid",null,"GROUP");//ロット番号internalid
							    				    	onhand=inventorynumberSearch[0].getValue("quantityonhand",null,"SUM");
						    				    	inventorynumber = receiptinventorynumber;
					    				    }
				    				    nlapiLogExecution('debug','show me the invReordId',invReordId);
				    				    var inventorynumberReord = nlapiLoadRecord('inventorynumber',invReordId);
//				    				    inventorynumberReord.setFieldValue('expirationdate',expirationdate);//有効期限
				    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_maker_serial_number',makernum);//DJ_メーカー製造ロット番号
				    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_make_date',madedate);//DJ_製造年月日
				    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_shipment_date',deliveryperiod);//DJ_出荷可能期限日
				    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_warehouse_number',warehouseCode);//DJ_倉庫入庫番号?
				    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_smc_nmuber',smc);//DJ_SMC番号
				    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_memo',lotMemo);//DJ_ロットメモ	
			    				   		inventorynumberReord.setFieldValue('custitemnumber_djkk_control_number',controlNumber);//DJ_メーカーシリアル番号
				    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_remark',lotRemark);//DJ_ロットリマーク
				    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',onhand);//数量
				    				    nlapiSubmitRecord(inventorynumberReord);
				    				    
									}catch(e){
										nlapiLogExecution('ERROR', 'エラー', "システム実行時に異常が発生しました。異常元：'シリアル/ロット番号："+inventorynumber+"'。具体的な異常情報：'"+e.message+"'。");
									}    
								}
							}
						}
					}	
				}
			}	
		}
	}
}
