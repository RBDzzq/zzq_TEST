/**
 * Item-�݌ɏڍ�-���ʃ��\�b�h�̐ݒ� ��UserEvent
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
	//�x���v�������ڍׂɕۑ����ăf�[�^���������������������
	var recordType =  nlapiGetRecordType();
	if(recordType == 'vendorbill'){
		var id =  nlapiGetRecordId()
		if(isEmpty(id)){
			nlapiLogExecution('debug','', '�J�n');
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
				    				    	receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//�V���A��/���b�g�ԍ�
				    				    nlapiLogExecution('debug','receiptinventorynumber',receiptinventorynumber);
				    				    //���b�g�ԍ�loading
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
					    				    	invReordId = inventorynumberSearch[0].getValue("internalid");//���b�g�ԍ�internalid
					    				    	inventorynumber = receiptinventorynumber;
						    				    nlapiLogExecution('debug','show me the invReordId',invReordId);
						    				    var inventorynumberReord = nlapiLoadRecord('inventorynumber',invReordId);
						    				    var expirationdateByLoad =  inventorynumberReord.getFieldValue('expirationdate');//�L������
						    				    var makernumByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_maker_serial_number');//DJ_���[�J�[�������b�g�ԍ�
						    				    var madedateByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_make_date');//DJ_�����N����
						    				    var deliveryperiodByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_shipment_date');//DJ_�o�׉\������
						    				    var warehouseCodeByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_warehouse_number');//DJ_�q�ɓ��ɔԍ�?
						    				    var smcByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_smc_nmuber');//DJ_SMC�ԍ�
						    				    var lotMemoByLoad = inventorynumberReord.getFieldValue('custitemnumber_djkk_lot_memo');//DJ_���b�g����	
						    				    var controlNumberByLoad= inventorynumberReord.getFieldValue('custitemnumber_djkk_control_number');//DJ_���[�J�[�V���A���ԍ�
						    				    var lotRemarkByLoad= inventorynumberReord.getFieldValue('custitemnumber_djkk_lot_remark');//DJ_���b�g���}�[�N
						    				    var quantityByLoad= inventorynumberReord.getFieldValue('custitemnumber_djkk_quantity');//����
					    				    }
				    				    }
  				    
				    				    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_���[�J�[�������b�g�ԍ�
	
				    				    if(isEmpty(makernum)&&!isEmpty(makernumByLoad)&&(makernum != makernumByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code',makernumByLoad);
				    				    }
				    				   
				    				    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_�����N����
				    				   
				    				    if(isEmpty(madedate)&&!isEmpty(madedateByLoad)&&(madedate != madedateByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd',madedateByLoad);
				    				    }
				    				   
				    				    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_�o�׉\������
				    				    
				    				    if(isEmpty(deliveryperiod)&&!isEmpty(deliveryperiodByLoad)&&(deliveryperiod != deliveryperiodByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date',deliveryperiodByLoad);
				    				    }
				    				   
				    				    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_�q�ɓ��ɔԍ�
				    				   
				    				    if(isEmpty(warehouseCode)&&!isEmpty(warehouseCodeByLoad)&&(warehouseCode != warehouseCodeByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code',warehouseCodeByLoad);
				    				    }
				    				    
				    				    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC�ԍ�
				    				    
				    				    if(isEmpty(smc)&&!isEmpty(smcByLoad)&&(smc != smcByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code',smcByLoad);
				    				    }
				    				   
				    				    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_���b�g����
				    				   
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

				    				    var controlNumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_���[�J�[�V���A���ԍ�
				    				   
				    				    if(isEmpty(controlNumber)&&!isEmpty(controlNumberByLoad)&&(controlNumber != controlNumberByLoad)){
				    				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number',controlNumberByLoad);
				    				    }
 
									}catch(e){
										nlapiLogExecution('ERROR', '�G���[', "�V�X�e�����s���Ɉُ킪�������܂����B�ُ팳�F'�V���A��/���b�g�ԍ��F"+inventorynumber+"'�B��̓I�Ȉُ���F'"+e.message+"'�B");
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
						//�݌ɏڍאݒ�
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
				    				    	receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//�V���A��/���b�g�ԍ�
				    				    	if(isEmpty(receiptinventorynumber)){
					    				    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//���b�g�ԍ�internalid
					    				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
									                    [
									                       ["internalid","is",invReordId]
									                    ], 
									                    [
									                     	new nlobjSearchColumn("inventorynumber"),
									                    ]
									                    );    
						    				    inventorynumber = inventorynumberSearch[0].getValue("inventorynumber");////�V���A��/���b�g�ԍ�
				    				    	}
				    				    nlapiLogExecution('debug','receiptinventorynumber',receiptinventorynumber);
				    				    var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//�L������
				    				    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_���[�J�[�������b�g�ԍ�
				    				    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_�����N����
				    				    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_�o�׉\������
				    				    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_�q�ɓ��ɔԍ�
				    				    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC�ԍ�
				    				    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_���b�g����		
//				    				    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_���b�g���}�[�N
				    				    var lotRemark = inventoryDetail.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',i);
				    				    
				    				    var quantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity');//����		
				    				    var controlNumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_���[�J�[�V���A���ԍ�	
				    				    var onhand=0;
				    				    //���b�g�ԍ��̃��R�[�h�ݒ�
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
						    				    	invReordId = inventorynumberSearch[0].getValue("internalid",null,"GROUP");//���b�g�ԍ�internalid
						    				    	onhand=inventorynumberSearch[0].getValue("quantityonhand",null,"SUM");
						    				    	inventorynumber = receiptinventorynumber;
					    				    }
				    				    nlapiLogExecution('debug','show me the invReordId',invReordId);
				    				    var inventorynumberReord = nlapiLoadRecord('inventorynumber',invReordId);
				    				    // changed by song add CH578 start
				    				    if(recordType == 'inventoryadjustment'){ //�݌ɒ���
				    				    	if(!isEmpty(expirationdate)){//�L������
				    				    		inventorynumberReord.setFieldValue('expirationdate',expirationdate);//�L������
				    				    	}
				    				    	if(!isEmpty(madedate)){//DJ_�����N����
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_make_date',madedate);//DJ_�����N����
				    				    	}
				    				    	if(!isEmpty(makernum)){//DJ_���[�J�[�������b�g�ԍ�
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_maker_serial_number',makernum);//DJ_���[�J�[�������b�g�ԍ�
				    				    	}
				    				    	if(!isEmpty(deliveryperiod)){//DJ_�o�׉\������
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_shipment_date',deliveryperiod);//DJ_�o�׉\������
				    				    	}
				    				    	if(!isEmpty(warehouseCode)){//DJ_�q�ɓ��ɔԍ�
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_warehouse_number',warehouseCode);//DJ_�q�ɓ��ɔԍ�
				    				    	}
				    				    	if(!isEmpty(smc)){//DJ_SMC�ԍ�
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_smc_nmuber',smc);//DJ_SMC�ԍ�
				    				    	}
				    				    	if(!isEmpty(lotMemo)){//DJ_���b�g����
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_memo',lotMemo);//DJ_���b�g����	
				    				    	}
				    				    	if(!isEmpty(controlNumber)){//DJ_���[�J�[�V���A���ԍ�
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_control_number',controlNumber);//DJ_���[�J�[�V���A���ԍ�
				    				    	}
				    				    	if(!isEmpty(lotRemark)){//DJ_���b�g���}�[�N
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_remark',lotRemark);//DJ_���b�g���}�[�N
				    				    	}
				    				    	if(!isEmpty(onhand)){//����
				    				    		inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',onhand);//����
				    				    	}
				    				    }else{
				    				        // add by zzq CH827 20230831 start
//					    				    inventorynumberReord.setFieldValue('expirationdate',expirationdate);//�L������
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_make_date',madedate);//DJ_�����N����
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_maker_serial_number',makernum);//DJ_���[�J�[�������b�g�ԍ�
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_shipment_date',deliveryperiod);//DJ_�o�׉\������
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_warehouse_number',warehouseCode);//DJ_�q�ɓ��ɔԍ�?
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_smc_nmuber',smc);//DJ_SMC�ԍ�
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_memo',lotMemo);//DJ_���b�g����	
//				    				   		inventorynumberReord.setFieldValue('custitemnumber_djkk_control_number',controlNumber);//DJ_���[�J�[�V���A���ԍ�
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_remark',lotRemark);//DJ_���b�g���}�[�N
//					    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',onhand);//����
                                            if(!isEmpty(expirationdate)){//�L������
                                                inventorynumberReord.setFieldValue('expirationdate',expirationdate);//�L������
                                            }
                                            if(!isEmpty(madedate)){//DJ_�����N����
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_make_date',madedate);//DJ_�����N����
                                            }
                                            if(!isEmpty(makernum)){//DJ_���[�J�[�������b�g�ԍ�
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_maker_serial_number',makernum);//DJ_���[�J�[�������b�g�ԍ�
                                            }
                                            if(!isEmpty(deliveryperiod)){//DJ_�o�׉\������
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_shipment_date',deliveryperiod);//DJ_�o�׉\������
                                            }
                                            if(!isEmpty(warehouseCode)){//DJ_�q�ɓ��ɔԍ�
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_warehouse_number',warehouseCode);//DJ_�q�ɓ��ɔԍ�
                                            }
                                            if(!isEmpty(smc)){//DJ_SMC�ԍ�
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_smc_nmuber',smc);//DJ_SMC�ԍ�
                                            }
                                            if(!isEmpty(lotMemo)){//DJ_���b�g����
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_memo',lotMemo);//DJ_���b�g����   
                                            }
                                            if(!isEmpty(controlNumber)){//DJ_���[�J�[�V���A���ԍ�
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_control_number',controlNumber);//DJ_���[�J�[�V���A���ԍ�
                                            }
                                            if(!isEmpty(lotRemark)){//DJ_���b�g���}�[�N
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_remark',lotRemark);//DJ_���b�g���}�[�N
                                            }
                                            if(!isEmpty(onhand)){//����
                                                inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',onhand);//����
                                            }
                                            // add by zzq CH827 20230831 end
				    				    }
				    				    // changed by song add CH578 end
				    				    nlapiSubmitRecord(inventorynumberReord);
				    				    
									}catch(e){
										nlapiLogExecution('ERROR', '�G���[', "�V�X�e�����s���Ɉُ킪�������܂����B�ُ팳�F'�V���A��/���b�g�ԍ��F"+inventorynumber+"'�B��̓I�Ȉُ���F'"+e.message+"'�B");
									}    
								}
							}
						}
					}	
				}
			}	
		}
	}
	//�A�Z���u�����\��header�݌ɏڍאݒ�
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
	    				    	receiptinventorynumber = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//�V���A��/���b�g�ԍ�
	    				    	if(isEmpty(receiptinventorynumber)){
		    				    	invReordId = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//���b�g�ԍ�internalid
		    				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
						                    [
						                       ["internalid","is",invReordId]
						                    ], 
						                    [
						                     	new nlobjSearchColumn("inventorynumber"),
						                    ]
						                    );    
			    				    inventorynumber = inventorynumberSearch[0].getValue("inventorynumber");//�V���A��/���b�g�ԍ�
	    				    	}
	    				    nlapiLogExecution('debug','inbody receiptinventorynumber',receiptinventorynumber);
	    				    var expirationdate = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//�L������
	    				    var makernum = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_���[�J�[�������b�g�ԍ�
	    				    var madedate = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_�����N����
	    				    var deliveryperiod = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_�o�׉\������
	    				    var warehouseCode = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_�q�ɓ��ɔԍ�
	    				    var smc = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC�ԍ�
	    				    var lotMemo = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_���b�g����		
	//    				    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_���b�g���}�[�N
	    				    var lotRemark = inventorydetailInHeader.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',i)
	    				    var quantity = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'quantity');//����		
	    				    var controlNumber = inventorydetailInHeader.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_���[�J�[�V���A���ԍ�		
	    				    var onhand=0;
	    				    //���b�g�ԍ��̃��R�[�h�ݒ�
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
				    				    	invReordId = inventorynumberSearch[0].getValue("internalid",null,"GROUP");//���b�g�ԍ�internalid
				    				    	onhand=inventorynumberSearch[0].getValue("quantityonhand",null,"SUM");
			    				    	inventorynumber = receiptinventorynumber;
		    				    }
	    				    nlapiLogExecution('debug','inbody invReordId1',invReordId);
	    				    var inventorynumberReord = nlapiLoadRecord('inventorynumber',invReordId);
	    				    inventorynumberReord.setFieldValue('expirationdate',expirationdate);//�L������
	    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_maker_serial_number',makernum);//DJ_���[�J�[�������b�g�ԍ�
	    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_make_date',madedate);//DJ_�����N����
	    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_shipment_date',deliveryperiod);//DJ_�o�׉\������
	    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_warehouse_number',warehouseCode);//DJ_�q�ɓ��ɔԍ�?
	    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_smc_nmuber',smc);//DJ_SMC�ԍ�
	    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_memo',lotMemo);//DJ_���b�g����	
					   		inventorynumberReord.setFieldValue('custitemnumber_djkk_control_number',controlNumber);//DJ_���[�J�[�V���A���ԍ�
	    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_lot_remark',lotRemark);//DJ_���b�g���}�[�N
	    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',onhand);//����
	    				    nlapiSubmitRecord(inventorynumberReord);
	    				    
//						}catch(e){
//							nlapiLogExecution('ERROR', '�G���[', "�V�X�e�����s���Ɉُ킪�������܂����B�ُ팳�F'�V���A��/���b�g�ԍ��F"+inventorynumber+"'�B��̓I�Ȉُ���F'"+e.message+"'�B");
//						}    
					}
				}
			}
		}
	}
	}
}
