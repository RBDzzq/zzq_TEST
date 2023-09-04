/**
 * Item-在庫詳細-共通メソッドの設定 のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 May 2022     ZHOU
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
	//支払要求書を詳細に保存してデータを消去する問題を解決する
	var recordType =  nlapiGetRecordType();
	if(recordType == 'vendorbill'){
		var id =  nlapiGetRecordId()
		if(isEmpty(id)){
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
				    				    nlapiLogExecution('debug','receiptinventorynumber',receiptinventorynumber);
				    				    //ロット番号loading
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
						    				    nlapiLogExecution('debug','show me the invReordId',invReordId);
						    				    var inventorynumberReord = nlapiLoadRecord('inventorynumber',invReordId);
						    				    var expirationdateByLoad =  inventorynumberReord.getFieldValue('expirationdate');//有効期限
						    				    var makernumByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_maker_serial_number');//DJ_メーカー製造ロット番号
						    				    var madedateByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_make_date');//DJ_製造年月日
						    				    var deliveryperiodByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_shipment_date');//DJ_出荷可能期限日
						    				    var warehouseCodeByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_warehouse_number');//DJ_倉庫入庫番号?
						    				    var smcByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_smc_nmuber');//DJ_SMC番号
						    				    var lotMemoByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_lot_memo');//DJ_ロットメモ	
						    				    var controlNumberByLoad= inventorynumberReord.getFieldValue('custitemnumber_djkk_control_number');//DJ_メーカーシリアル番号
						    				    var lotRemarkByLoad= inventorynumberReord.getFieldValue('custitemnumber_djkk_lot_remark');//DJ_ロットリマーク
						    				    var quantityByLoad= inventorynumberReord.getFieldValue('custitemnumber_djkk_quantity');//数量
					    				    }
				    				    }
  				    
				    				    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_メーカー製造ロット番号
	
				    				    if(isEmpty(makernum)&&!isEmpty(makernumByLoad)&&(makernum != makernumByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code',makernumByLoad);
				    				    }
				    				   
				    				    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_製造年月日
				    				   
				    				    if(isEmpty(madedate)&&!isEmpty(madedateByLoad)&&(madedate != madedateByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd',madedateByLoad);
				    				    }
				    				   
				    				    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_出荷可能期限日
				    				    
				    				    if(isEmpty(deliveryperiod)&&!isEmpty(deliveryperiodByLoad)&&(deliveryperiod != deliveryperiodByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date',deliveryperiodByLoad);
				    				    }
				    				   
				    				    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_倉庫入庫番号
				    				   
				    				    if(isEmpty(warehouseCode)&&!isEmpty(warehouseCodeByLoad)&&(warehouseCode != warehouseCodeByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code',warehouseCodeByLoad);
				    				    }
				    				    
				    				    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC番号
				    				    
				    				    if(isEmpty(smc)&&!isEmpty(smcByLoad)&&(smc != smcByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code',smcByLoad);
				    				    }
				    				   
				    				    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_ロットメモ
				    				   
				    				    if(isEmpty(lotMemo)&&!isEmpty(lotMemoByLoad)&&(lotMemo != lotMemoByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo',lotMemoByLoad);
				    				    }
				    				   
				    				    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark')
				    				    var lotRemarkRst = nlapiSearchRecord("customrecord_djkk_lot_remark",null,
				    							[
				    							], 
				    							[
				    							   new nlobjSearchColumn("name"),
				    							   new nlobjSearchColumn("internalid")
				    							]
				    							);
				    					
				    					if(!isEmpty(lotRemarkRst)){
				    						for(var i = 0 ; i < lotRemarkRst.length ; i++){
				    							var lotRemarkName = lotRemarkRst[i].getValue("name");
				    							if(lotRemarkByLoad == lotRemarkName){
				    								var lotRemarkId = lotRemarkRst[i].getValue("internalid");
				    								 nlapiLogExecution('debug','lotRemarkId', lotRemarkId);
				    							}
				    						}
				    					}
				    				    if(isEmpty(lotRemark)&&!isEmpty(lotRemarkByLoad)&&(lotRemark != lotRemarkByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark',lotRemarkId);
				    				    }

				    				    var controlNumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_メーカーシリアル番号
				    				   
				    				    if(isEmpty(controlNumber)&&!isEmpty(controlNumberByLoad)&&(controlNumber != controlNumberByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number',controlNumberByLoad);
				    				    }
 
									}catch(e){
										nlapiLogExecution('ERROR', 'エラー', "システム実行時に異常が発生しました。異常元：'シリアル/ロット番号："+inventorynumber+"'。具体的な異常情報：'"+e.message+"'。");
									}	
								}
							}
						}
						if(inventoryDetailCount != 0 && !isEmpty(inventoryDetail)){
						 inventoryDetail.commitLineItem('inventoryassignment');
						 inventoryDetail.commit();
						 nlapiCommitLineItem('item');
						}
					}
				}
			}
			nlapiLogExecution('debug','', 'end');
		}
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
	if(type != 'delete'){
	var recordType = nlapiGetRecordType();
	var recordId = nlapiGetRecordId();
	var loadRecord =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
	if(type == 'create' || type=='edit'){
		if(recordType != null){
			nlapiLogExecution('debug','start','start');
			var count;
			if(recordType == "inventoryadjustment" || recordType == "bintransfer"|| recordType == "inventorytransfer"){
				count = loadRecord.getLineItemCount('inventory');
			}else if(recordType == "assemblybuild"){
				count = loadRecord.getLineItemCount('component');
			}else{
				count = loadRecord.getLineItemCount('item');
			}
			nlapiLogExecution('debug','count',count);
			if(count != null && count >= 0){
				for(var n = 0 ; n < count ; n++){
					var inventorydetailFlag;
					if(recordType == "inventoryadjustment" || recordType == "bintransfer" || recordType == "inventorytransfer"){
						inventorydetailFlag =loadRecord.getLineItemValue("inventory","inventorydetailavail",n+1);
					}else if(recordType == "assemblybuild"){
						inventorydetailFlag =loadRecord.getLineItemValue("component","componentinventorydetailavail",n+1);
					}else{
						inventorydetailFlag =loadRecord.getLineItemValue("item","inventorydetailavail",n+1);
					}
					if(inventorydetailFlag == 'T'){
						//在庫詳細設定
						var inventoryDetail;
						if(recordType == "inventoryadjustment" || recordType == "bintransfer" || recordType == "inventorytransfer"){
							loadRecord.selectLineItem('inventory', n+1);
							inventoryDetail = loadRecord.editCurrentLineItemSubrecord('inventory','inventorydetail');
						}else if(recordType == "assemblybuild"){
							loadRecord.selectLineItem('component', n+1);
							inventoryDetail = loadRecord.editCurrentLineItemSubrecord('component','componentinventorydetail');
						}else{
							loadRecord.selectLineItem('item', n+1);
							inventoryDetail = loadRecord.editCurrentLineItemSubrecord('item','inventorydetail');
						}
						if(!isEmpty(inventoryDetail)){
			  				var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
			  				var item = inventoryDetail.getFieldValue('item');
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
						    				    inventorynumber = inventorynumberSearch[0].getValue("inventorynumber");////シリアル/ロット番号
				    				    	}
				    				    nlapiLogExecution('debug','receiptinventorynumber',receiptinventorynumber);
				    				    var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//有効期限
				    				    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_メーカー製造ロット番号
				    				    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_製造年月日
				    				    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_出荷可能期限日
				    				    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_倉庫入庫番号
				    				    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC番号
				    				    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_ロットメモ		
//				    				    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_ロットリマーク
				    				    var lotRemark = inventoryDetail.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',i);
				    				    
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
				    				    // changed by song add CH578 start
				    				    if(recordType == 'inventoryadjustment'){ //在庫調整
				    				    	if(!isEmpty(expirationdate)){//有効期限
				    				    		inventorynumberReord.setFieldValue('expirationdate',expirationdate);//有効期限
				    				    	}
				    				    	if(!isEmpty(madedate)){//DJ_製造年月日
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_make_date',madedate);//DJ_製造年月日
				    				    	}
				    				    	if(!isEmpty(makernum)){//DJ_メーカー製造ロット番号
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_maker_serial_number',makernum);//DJ_メーカー製造ロット番号
				    				    	}
				    				    	if(!isEmpty(deliveryperiod)){//DJ_出荷可能期限日
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_shipment_date',deliveryperiod);//DJ_出荷可能期限日
				    				    	}
				    				    	if(!isEmpty(warehouseCode)){//DJ_倉庫入庫番号
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_warehouse_number',warehouseCode);//DJ_倉庫入庫番号
				    				    	}
				    				    	if(!isEmpty(smc)){//DJ_SMC番号
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_smc_nmuber',smc);//DJ_SMC番号
				    				    	}
				    				    	if(!isEmpty(lotMemo)){//DJ_ロットメモ
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_memo',lotMemo);//DJ_ロットメモ	
				    				    	}
				    				    	if(!isEmpty(controlNumber)){//DJ_メーカーシリアル番号
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_control_number',controlNumber);//DJ_メーカーシリアル番号
				    				    	}
				    				    	if(!isEmpty(lotRemark)){//DJ_ロットリマーク
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_remark',lotRemark);//DJ_ロットリマーク
				    				    	}
				    				    	if(!isEmpty(onhand)){//数量
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',onhand);//数量
				    				    	}
				    				    }else{
				    				        // add by zzq CH827 20230831 start
//					    				    inventorynumberReord.setFieldValue('expirationdate',expirationdate);//有効期限
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_make_date',madedate);//DJ_製造年月日
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_maker_serial_number',makernum);//DJ_メーカー製造ロット番号
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_shipment_date',deliveryperiod);//DJ_出荷可能期限日
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_warehouse_number',warehouseCode);//DJ_倉庫入庫番号?
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_smc_nmuber',smc);//DJ_SMC番号
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_memo',lotMemo);//DJ_ロットメモ	
//				    				   		inventorynumberReord.setFieldValue('custitemnumber_djkk_control_number',controlNumber);//DJ_メーカーシリアル番号
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_remark',lotRemark);//DJ_ロットリマーク
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',onhand);//数量
                                            if(!isEmpty(expirationdate)){//有効期限
                                                inventorynumberReord.setFieldValue('expirationdate',expirationdate);//有効期限
                                            }
                                            if(!isEmpty(madedate)){//DJ_製造年月日
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_make_date',madedate);//DJ_製造年月日
                                            }
                                            if(!isEmpty(makernum)){//DJ_メーカー製造ロット番号
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_maker_serial_number',makernum);//DJ_メーカー製造ロット番号
                                            }
                                            if(!isEmpty(deliveryperiod)){//DJ_出荷可能期限日
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_shipment_date',deliveryperiod);//DJ_出荷可能期限日
                                            }
                                            if(!isEmpty(warehouseCode)){//DJ_倉庫入庫番号
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_warehouse_number',warehouseCode);//DJ_倉庫入庫番号
                                            }
                                            if(!isEmpty(smc)){//DJ_SMC番号
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_smc_nmuber',smc);//DJ_SMC番号
                                            }
                                            if(!isEmpty(lotMemo)){//DJ_ロットメモ
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_memo',lotMemo);//DJ_ロットメモ   
                                            }
                                            if(!isEmpty(controlNumber)){//DJ_メーカーシリアル番号
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_control_number',controlNumber);//DJ_メーカーシリアル番号
                                            }
                                            if(!isEmpty(lotRemark)){//DJ_ロットリマーク
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_remark',lotRemark);//DJ_ロットリマーク
                                            }
                                            if(!isEmpty(onhand)){//数量
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',onhand);//数量
                                            }
                                            // add by zzq CH827 20230831 end
				    				    }
				    				    // changed by song add CH578 end
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
	//アセンブリを構成header在庫詳細設定
	if(recordType == 'assemblybuild'){
		if(type == 'create' || type=='edit'){
			var inventorydetailInHeader = nlapiEditSubrecord('inventorydetail');
			if(!isEmpty(inventorydetailInHeader)){
				nlapiLogExecution('debug','start','start');
					var inventoryDetailCount = inventorydetailInHeader.getLineItemCount('inventoryassignment');
					var item = inventorydetailInHeader.getFieldValue('item');
					nlapiLogExecution('debug','inbody item',item);
					if(inventoryDetailCount != 0){
					for(var i = 1 ;i < inventoryDetailCount+1 ; i++){
//						try{
							inventorydetailInHeader.selectLineItem('inventoryassignment',i);
	    				    var receiptinventorynumber;
	    				    var invReordId;
	    				    var inventorynumber;
	    				    	receiptinventorynumber = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
	    				    	if(isEmpty(receiptinventorynumber)){
		    				    	invReordId = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
		    				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
						                    [
						                       ["internalid","is",invReordId]
						                    ], 
						                    [
						                     	new nlobjSearchColumn("inventorynumber"),
						                    ]
						                    );    
			    				    inventorynumber = inventorynumberSearch[0].getValue("inventorynumber");//シリアル/ロット番号
	    				    	}
	    				    nlapiLogExecution('debug','inbody receiptinventorynumber',receiptinventorynumber);
	    				    var expirationdate = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//有効期限
	    				    var makernum = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_メーカー製造ロット番号
	    				    var madedate = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_製造年月日
	    				    var deliveryperiod = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_出荷可能期限日
	    				    var warehouseCode = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_倉庫入庫番号
	    				    var smc = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC番号
	    				    var lotMemo = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_ロットメモ		
	//    				    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_ロットリマーク
	    				    var lotRemark = inventorydetailInHeader.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',i)
	    				    var quantity = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'quantity');//数量		
	    				    var controlNumber = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_メーカーシリアル番号		
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
	    				    nlapiLogExecution('debug','inbody invReordId1',invReordId);
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
	    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',onhand);//数量
	    				    nlapiSubmitRecord(inventorynumberReord);
	    				    
//						}catch(e){
//							nlapiLogExecution('ERROR', 'エラー', "システム実行時に異常が発生しました。異常元：'シリアル/ロット番号："+inventorynumber+"'。具体的な異常情報：'"+e.message+"'。");
//						}    
					}
				}
			}
		}
	}
	}
}
