/**
 * �݌ɊǗ��o�[�R�[�h
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/26     CPC_��
 *
 */
/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	
	var handyType = request.getParameter('handyType');
		
	if(handyType=='getGS1'){
		// �A�C�e��
		try{
		var itemGS1 = request.getParameter('itemGS1');
		var gsArray=itemGS1.split(")");
		var itemJanCode = gsArray[1].split("(")[0];
		var losType=gsArray[2].split("(")[1];
		var makerLosId=gsArray[3];
		
		var flt="";
		if(losType=='10'){
			flt="inventorydetaillines.custrecord_djkk_maker_serial_code";
		}else if(losType=='20'){
			flt="inventorydetaillines.custrecord_djkk_control_number";
		}
		
		var transactionSearch = nlapiSearchRecord("inventorydetail",null,
				[
				   ["item.upccode","is",itemJanCode], 
				   "AND", [flt,"is",makerLosId]
				], 
				[
				   new nlobjSearchColumn("item","transaction",null), 
				   new nlobjSearchColumn("internalid","inventoryNumber",null), 
				   new nlobjSearchColumn("quantityavailable","inventoryNumber",null),
				   new nlobjSearchColumn("subsidiary","transaction",null),
				   new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  {inventorydetaillines.custrecord_djkk_maker_serial_code} is null THEN {inventorydetaillines.custrecord_djkk_control_number} ELSE {inventorydetaillines.custrecord_djkk_maker_serial_code} END")
				]
				);
		if(!isEmpty(transactionSearch)){
		var columnID = transactionSearch[0].getAllColumns();
		var jsonObj = '{';
		
		var subsidiary=transactionSearch[0].getValue(columnID[3]);
		jsonObj+= '"subsidiary":"';
		jsonObj+=subsidiary+'"';
		
		var itemName=transactionSearch[0].getText(columnID[0]);
		jsonObj+= ',"itemName":"';
		jsonObj+=itemName+'"';
		nlapiLogExecution('debug', 'itemName',itemName);
		
		var itemId=transactionSearch[0].getValue(columnID[0]);
		jsonObj+= ',"itemId":"';
		jsonObj+=itemId+'"';
		nlapiLogExecution('debug', 'itemId',itemId);
		
		
		
//		var itemValue=transactionSearch[0].getValue(columnID[0]);
//		var itemName1=defaultEmpty(nlapiLookupField('item', itemId, 'custitem_djkk_product_name_jpline1'));
//		var itemName2=defaultEmpty(nlapiLookupField('item', itemId, 'custitem_djkk_product_name_jpline2'));
//		var itemName=itemName1+itemName2;
//		jsonObj+= ',"itemName":"';
//		jsonObj+=itemName+'"';
//		nlapiLogExecution('debug', 'itemName1',itemName1);
//		
//		var itemId=transactionSearch[0].getText(columnID[0]);
//		jsonObj+= ',"itemId":"';
//		jsonObj+=itemId+'"';
//		nlapiLogExecution('debug', 'itemId',itemId);
		
		
		
		
		
		
		var makerLotNumber=transactionSearch[0].getValue(columnID[4]);
		jsonObj+= ',"makerLotNumber":"';
		jsonObj+=makerLotNumber+'"';
		
		var inventoryNumberInternalid=transactionSearch[0].getValue(columnID[1]);
		jsonObj+= ',"inventoryNumberInternalid":"';
		jsonObj+=inventoryNumberInternalid+'"';
		
		var quantityavailable=transactionSearch[0].getValue(columnID[2]);
		jsonObj+= ',"quantityavailable":"';
		jsonObj+=quantityavailable+'"';
		
		jsonObj+='}';                			                
        response.write(jsonObj);                							
		}
		
		}catch(e){
			response.write(e);
		}
		
	}		
		// �݌Ɉړ�
	  else if(handyType=='createInventoryMove'){
			
			// �q���
			var subsidiary = request.getParameter('subsidiary');
			
			// �ړ���
			var locationId = request.getParameter('locationId');
			
			// ���t���̕ۊǒI
			var locationbinId=request.getParameter('locationbin');
			
			// �A�C�e��
			var itemId = request.getParameter('itemId');
			
			// lot
			var lotId = request.getParameter('lotId');
			
			// �ړ��� 
			var transferlocationId = request.getParameter('transferlocationId');

			// ���[��ۊǒI
			var transferlocationbinId=request.getParameter('transferlocationbinId');
			
			// ����
		 	var quantity=request.getParameter('quantity');
		 	
		 	
		 	var flag=creatInventoryMove(subsidiary,locationId,transferlocationId,itemId,lotId,quantity,locationbinId,transferlocationbinId);
		 	response.write(flag);
		}
		
		// �ۊǒI�ړ�
		else if(handyType=='createBinMove'){
			
			// �q���
			var subsidiary = request.getParameter('subsidiary');
			
			// �ړ���
			var locationId = request.getParameter('locationId');
			
			// ���t���̕ۊǒI
			var locationbinId=request.getParameter('locationbin');
			
			// �A�C�e��
			var itemId = request.getParameter('itemId');
			
			// lot
			var lotId = request.getParameter('lotId');

			// ���[��ۊǒI
			var transferlocationbinId=request.getParameter('transferlocationbinId');
			
			// ����
		 	var quantity=request.getParameter('quantity');
			var flag=creatBinMove(locationId,itemId,lotId,quantity,locationbinId,transferlocationbinId);
			response.write(flag);
	}
		else{
		response.write('ERROR:�X�L�����R�[�h�^�C�v�G���[');
		}		
	
}

function creatInventoryMove(subsidiary,locationid,transferlocation,itemid,lot,quantity,locationbin,transferlocationbin) {
	nlapiLogExecution('debug', 'access0-subsidiary',subsidiary);
	nlapiLogExecution('debug', 'access0-locationid',locationid);
	nlapiLogExecution('debug', 'access0-transferlocation',transferlocation);
	nlapiLogExecution('debug', 'access0-itemid',itemid);
	nlapiLogExecution('debug', 'access0-lot',lot);
	nlapiLogExecution('debug', 'access0-quantity',quantity);
	nlapiLogExecution('debug', 'access0-locationbin',locationbin);
	nlapiLogExecution('debug', 'access0-transferlocationbin',transferlocationbin);
	try {
		nlapiLogExecution('debug', 'access1-inventorytransfer');
		var record=nlapiCreateRecord('inventorytransfer');
		nlapiLogExecution('debug', 'access2');
		record.setFieldValue('subsidiary',subsidiary);
		record.setFieldValue('location', locationid);
		record.setFieldValue('custbody_djkk_inventorytransfer_flag', 'T');
		record.setFieldValue('transferlocation', transferlocation);
		record.setFieldValue('memo', 'HANDY SCAN�����쐬');
		record.selectNewLineItem('inventory');
		record.setCurrentLineItemValue('inventory', 'item', itemid);
		record.setCurrentLineItemValue('inventory', 'adjustqtyby', quantity);
		nlapiLogExecution('debug', 'access3');
		var inventorydetail=record.createCurrentLineItemSubrecord('inventory', 'inventorydetail');
		nlapiLogExecution('debug', 'access4');
		//20230117 add by zhou start
		var lookupLotRecord = nlapiLookupField('inventorynumber',lot,//�݌ɔԍ�field value search
				[
				 'expirationdate',//�L������
		         'custitemnumber_djkk_maker_serial_number',//DJ_���[�J�[�������b�g
		         'custitemnumber_djkk_make_date',//DJ_�����N����
		         'custitemnumber_djkk_shipment_date',//DJ_�o�׉\������
		         'custitemnumber_djkk_warehouse_number',//DJ_�q�ɓ��ɔԍ�
		         'custitemnumber_djkk_smc_nmuber',//DJ_SMC�ԍ�
		         'custitemnumber_djkk_lot_memo',//DJ_���b�g����	
		         'custitemnumber_djkk_control_number',//DJ_���[�J�[�V���A���ԍ�
		         'custitemnumber_djkk_lot_remark'//DJ_���b�g���}�[�N
		         ])
		var expirationdate = defaultEmpty(lookupLotRecord.expirationdate); 
		var makernum = defaultEmpty(lookupLotRecord.custitemnumber_djkk_maker_serial_number);
	    var madedate = defaultEmpty(lookupLotRecord.custitemnumber_djkk_make_date);
	    var deliveryperiod = defaultEmpty(lookupLotRecord.custitemnumber_djkk_shipment_date);
	    var warehouseCode = defaultEmpty(lookupLotRecord.custitemnumber_djkk_warehouse_number);
	    var smc = defaultEmpty(lookupLotRecord.custitemnumber_djkk_smc_nmuber);
	    var lotMemo =  defaultEmpty(lookupLotRecord.custitemnumber_djkk_lot_memo);
	    var controlNumber =  defaultEmpty(lookupLotRecord.custitemnumber_djkk_control_number);
	    var lotRemark =  defaultEmpty(lookupLotRecord.custitemnumber_djkk_lot_remark);
		//end
		inventorydetail.selectNewLineItem('inventoryassignment');
		inventorydetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber', lot);
		
		//20230117 add by zhou start
		inventorydetail.setCurrentLineItemValue('inventoryassignment','expirationdate', expirationdate);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code', makernum);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd', madedate);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date', deliveryperiod);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code', warehouseCode);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code', smc);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo', lotMemo);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',controlNumber);
		inventorydetail.setCurrentLineItemText('inventoryassignment','custrecord_djkk_lot_remark', lotRemark);
		//end
		inventorydetail.setCurrentLineItemValue('inventoryassignment','quantity', quantity);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','binnumber', locationbin);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','tobinnumber', transferlocationbin);
		nlapiLogExecution('debug', 'access5');
		inventorydetail.commitLineItem('inventoryassignment');
		nlapiLogExecution('debug', 'access6');
		inventorydetail.commit();
		nlapiLogExecution('debug', 'access7');
		record.commitLineItem('inventory');
		nlapiLogExecution('debug', 'access8');
		var recordId=nlapiSubmitRecord(record, false, true);
		nlapiLogExecution('debug', 'access9');
		return 'T';
	} catch (e) {
		nlapiLogExecution('debug', 'error', e);
		return  e;
	}
}

function creatBinMove(locationid,itemid,lot,quantity,locationbin,transferlocationbin) {
	try {
		var record=nlapiCreateRecord('bintransfer');
		record.setFieldValue('location', locationid);
		record.setFieldValue('memo', 'HANDY SCAN�����쐬');
		record.selectNewLineItem('inventory');
		record.setCurrentLineItemValue('inventory', 'item', itemid);
		record.setCurrentLineItemValue('inventory', 'quantity', quantity);
		
		//20230117 add by zhou start
		var lookupLotRecord = nlapiLookupField('inventorynumber',lot,//�݌ɔԍ�field value search
				[
				 'expirationdate',//�L������
		         'custitemnumber_djkk_maker_serial_number',//DJ_���[�J�[�������b�g
		         'custitemnumber_djkk_make_date',//DJ_�����N����
		         'custitemnumber_djkk_shipment_date',//DJ_�o�׉\������
		         'custitemnumber_djkk_warehouse_number',//DJ_�q�ɓ��ɔԍ�
		         'custitemnumber_djkk_smc_nmuber',//DJ_SMC�ԍ�
		         'custitemnumber_djkk_lot_memo',//DJ_���b�g����	
		         'custitemnumber_djkk_control_number',//DJ_���[�J�[�V���A���ԍ�
		         'custitemnumber_djkk_lot_remark'//DJ_���b�g���}�[�N
		         ])
		var expirationdate = defaultEmpty(lookupLotRecord.expirationdate); 
		var makernum = defaultEmpty(lookupLotRecord.custitemnumber_djkk_maker_serial_number);
	    var madedate = defaultEmpty(lookupLotRecord.custitemnumber_djkk_make_date);
	    var deliveryperiod = defaultEmpty(lookupLotRecord.custitemnumber_djkk_shipment_date);
	    var warehouseCode = defaultEmpty(lookupLotRecord.custitemnumber_djkk_warehouse_number);
	    var smc = defaultEmpty(lookupLotRecord.custitemnumber_djkk_smc_nmuber);
	    var lotMemo =  defaultEmpty(lookupLotRecord.custitemnumber_djkk_lot_memo);
	    var controlNumber =  defaultEmpty(lookupLotRecord.custitemnumber_djkk_control_number);
	    var lotRemark =  defaultEmpty(lookupLotRecord.custitemnumber_djkk_lot_remark);
		//end
		var inventorydetail=record.createCurrentLineItemSubrecord('inventory', 'inventorydetail');
		inventorydetail.selectNewLineItem('inventoryassignment');
		inventorydetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber', lot);
		//20230117 add by zhou start
		inventorydetail.setCurrentLineItemValue('inventoryassignment','expirationdate', expirationdate);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code', makernum);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd', madedate);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date', deliveryperiod);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code', warehouseCode);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code', smc);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo', lotMemo);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',controlNumber);
		inventorydetail.setCurrentLineItemText('inventoryassignment','custrecord_djkk_lot_remark', lotRemark);
		//end
		inventorydetail.setCurrentLineItemValue('inventoryassignment','quantity', quantity);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','binnumber', locationbin);
		inventorydetail.setCurrentLineItemValue('inventoryassignment','tobinnumber', transferlocationbin);
		inventorydetail.commitLineItem('inventoryassignment');
		inventorydetail.commit();
		record.commitLineItem('inventory');
		var recordId=nlapiSubmitRecord(record, false, true);
		return 'T';
	} catch (e) {
		nlapiLogExecution('debug', 'error', e);
		return  e;
	}
}
///**
// * @param {nlobjRequest}
// *            request Request object
// * @param {nlobjResponse}
// *            response Response object
// * @returns {Void} Any output is written via response object
// */
//function suitelet(request, response) {
//	
//	var handyType = request.getParameter('handy');
//	var type = request.getParameter('type');
//	
//	// �ړ���
//	var location = request.getParameter('location');
//	
//	// �ړ��� 
//	var transferlocation = request.getParameter('transferlocation');
//	
//	// �A�C�e��
//	var itemcode = request.getParameter('itemcode');
//	
//	// �ړ���id
//	var locationid = request.getParameter('locationid');
//	
//	// �ړ��� id
//	var transferlocationid = request.getParameter('transferlocationid');
//	
//    // �A�C�e��id
//	var itemid = request.getParameter('itemid');
//	
//	// ��ԁi�ύX�O)
//	var statusbefore=request.getParameter('statusbefore');
//	
//	// ��ԁi�ύX��j
//	var statusafter=request.getParameter('statusafter');
//	
//	// ���b�g
//	var lot=request.getParameter('lot');
//	
//	// ����
// 	var quantity=request.getParameter('quantity');
//	
//	// ���t���̕ۊǒI
//	var locationbin=request.getParameter('locationbin');
//	
//	// ���[��ۊǒI
//	var transferlocationbin=request.getParameter('transferlocationbin');
//	
//	// �݌Ɉړ��h�L�������g�ԍ�
//	var cifid=request.getParameter('cifid');
//	
//	if(handyType=='DataStorage'){
//		if(type=='InventoryMove'||type=='BinMove'){
//		if(!isEmpty(itemid)){
//			var itemSearch = nlapiSearchRecord("item",null,
//					[
//					   ["name","is",itemid]
//					], 
//					[
//					   new nlobjSearchColumn("internalid")
//					]
//					);
//			itemid=itemSearch[0].getValue("internalid");
//			}else{
//				response.write('���i�R�[�h�͋�ł�');
//			}
//		var binArray=[];
//		if(!isEmpty(locationbin)&&!isEmpty(transferlocationbin)){
//			var binSearch = nlapiSearchRecord("bin",null,
//					[
//					   [["custrecord_djkk_bin_barcode","is",locationbin],"OR",["custrecord_djkk_bin_barcode","startswith",transferlocationbin]]
//					], 
//					[
//					   new nlobjSearchColumn("custrecord_djkk_bin_barcode"), 
//					   new nlobjSearchColumn("internalid"),
//					   new nlobjSearchColumn("location")
//					]
//					);
//			for(var bi=0;bi<binSearch.length;bi++){
//				binArray[binSearch[bi].getValue("custrecord_djkk_bin_barcode")]=[binSearch[bi].getValue("internalid"),binSearch[bi].getValue("location")];
//			}
//		}else{
//			var binuseflag=nlapiLookupField('item', itemid, 'usebins');			
//			if(binuseflag=='T'){
//				response.write('���t���̕ۊǒI�Ǝ��[��ۊǒI�͋�ł�');
//			}		
//		}
//
//		
//		if(type=='InventoryMove'){
//			if(!isEmpty(locationid)){
//			if(!isEmpty(transferlocationid)){
//				
//				if(!isEmpty(locationbin)&&!isEmpty(transferlocationbin)){
//				if(binArray[locationbin][0]==binArray[transferlocationbin][0]){
//			    	response.write('���t���̕ۊǒI�Ǝ��[��ۊǒI�𓯂��ɂ��邱�Ƃ͂ł��܂���');
//				}else{
//				if(binArray[locationbin][1]!=locationid){
//					response.write('���t���̕ۊǒI�͈ړ����ɂ��܂���');
//				}else if(binArray[transferlocationbin][1]!=transferlocationid){
//					response.write('���[��ۊǒI�͈ړ���ɂ��܂���');					
//				}else{
//				var subsidiary='';
//				var tSubsidiary='';
//				subsidiary = nlapiLoadRecord('location', locationid).getFieldValue('subsidiary');
//				tSubsidiary = nlapiLoadRecord('location', transferlocationid).getFieldValue('subsidiary');
//				  if (subsidiary==tSubsidiary) {
//					var bTo=binArray[locationbin][0];
//					var bFo=binArray[transferlocationbin][0];
//					var backFlag= creatInventoryMove(subsidiary,locationid,transferlocationid,itemid,lot,quantity,bTo,bFo,statusbefore,statusafter);											
//					response.write(backFlag);
//					} else{
//					response.write('�ꏊ�̘A���͈Ⴂ�܂�');
//				   }
//							
//			}
//			}
//		}else{
//			var subsidiary='';		
//			var tSubsidiary='';
//			subsidiary = nlapiLoadRecord('location', locationid).getFieldValue('subsidiary');
//			tSubsidiary = nlapiLoadRecord('location', transferlocationid).getFieldValue('subsidiary');
//			  if (subsidiary==tSubsidiary) {
//				var bTo='';
//				var bFo='';
//				var backFlag= creatInventoryMove(subsidiary,locationid,transferlocationid,itemid,lot,quantity,bTo,bFo,statusbefore,statusafter);											
//				response.write(backFlag);
//				} else{
//				response.write('�ꏊ�̘A���͈Ⴂ�܂�');
//			   }
//												
//		}			
//			}else{
//				response.write('�ړ���͋�ł�');
//			}
//			}else{
//				response.write('�ړ����͋�ł�');
//			}						
//		}else if(type=='BinMove'){
//			if(!isEmpty(locationid)){
//				if(!isEmpty(locationbin)){
//					if(!isEmpty(transferlocationbin)){
//					    if(binArray[locationbin][0]==binArray[transferlocationbin][0]){
//					    	response.write('���t���̕ۊǒI�Ǝ��[��ۊǒI�𓯂��ɂ��邱�Ƃ͂ł��܂���');
//						}else{
//						if(binArray[locationbin][1]!=locationid){
//							response.write('���t���̕ۊǒI�̓��P�ɂ��܂���');
//						}else if(binArray[transferlocationbin][1]!=locationid){
//							response.write('���[��ۊǒI�̓��P�ɂ��܂���');
//						}else{
//		             var backFlag= creatBinMove(locationid,itemid,lot,quantity,binArray[locationbin][0],binArray[transferlocationbin][0],statusbefore,statusafter);
//					response.write(backFlag);
//					}
//						}
//					}else{
//					response.write('���[��ۊǒI�͋�ł�');
//					}
//				}else{
//				response.write('���t���̕ۊǒI�͋�ł�');	
//				}							    
//			}else{
//			response.write('���P�͋�ł�');
//			}	
//		}
//	}else if(type=='ChangeInventoryFlag'){
//		if(!isEmpty(cifid)){
//			var inventorytransferSearch = nlapiSearchRecord("inventorytransfer",null,
//					[
//					   ["type","anyof","InvTrnfr"], 
//					   "AND", 
//					   ["number","equalto",cifid], 
//					   "AND", 
//					   ["mainline","is","T"]
//					], 
//					[
//					   new nlobjSearchColumn("internalid"), 
//					   new nlobjSearchColumn("custbody_djkk_inventorytransfer_flag")
//					]
//					);
//		if(!isEmpty(inventorytransferSearch)){
//			var inventorytransferFlag=inventorytransferSearch[0].getValue("custbody_djkk_inventorytransfer_flag");
//			if(inventorytransferFlag=='T'){
//				response.write('�݌Ɉړ�-�ԍ�: '+cifid +'�͑q�Ɉړ���');
//			}else{
//						var invtfId = inventorytransferSearch[0].getValue("internalid");
//						try {
//							nlapiSubmitField('inventorytransfer', invtfId,'custbody_djkk_inventorytransfer_flag','T', false);
//							response.write('T');
//						} catch (e) {
//							response.write(e.message);
//						}
//					}
//		}else{
//			response.write('�݌Ɉړ�-�ԍ�: '+cifid +'�͑��݂��܂���');	
//		}
//		}else{
//			response.write('�݌Ɉړ�-�ԍ��͋�ł�');
//		}
//	}
//		//response.write('T');
////		var scheduleparams = new Array();
////		scheduleparams['custscript_djkk_recordtype'] = recordType;
////		scheduleparams['custscript_djkk_internalid'] = recordId;								 
////		scheduleparams['custscript_djkk_line'] = lineId;
////		scheduleparams['custscript_djkk_quantity'] = quantity;
////		
////		 var idList ='[';
////		 idList+='{';
////		 idList+='"packagec":"'+packageClassification+'"'; 
////		 idList+=',';
////		 idList+='"status":"'+status+'"';
////		 idList+=',';
////		 idList+='"lot":"'+lot+'"';
////         idList+=',';
////         idList+='"expirydate":"'+expiryDate+'"';
////         idList+=',';
////         idList+='"inventoryc":"'+inventoryClassification+'"';
////         idList+=',';
////         idList+='"location":"'+location+'"';
////		 idList+='}';
////		 idList+=']';
////	     scheduleparams['custscript_djkk_dataarray'] = idList;
////
////	    	 var cacheRecord=nlapiCreateRecord('customrecord_djkk_barcode_cache_table');
////				cacheRecord.setFieldValue('custrecord_djkk_recordtype', scheduleparams['custscript_djkk_recordtype']);
////				cacheRecord.setFieldValue('custrecord_djkk_internalid', scheduleparams['custscript_djkk_internalid']);
////				cacheRecord.setFieldValue('custrecord_djkk_line', scheduleparams['custscript_djkk_line']);
////				cacheRecord.setFieldValue('custrecord_djkk_quantity', scheduleparams['custscript_djkk_quantity']);
////				cacheRecord.setFieldValue('custrecord_djkk_dataarray',  idList);
////				var cacheRecordID=nlapiSubmitRecord(cacheRecord, false, true);
////				if(!isEmpty(cacheRecordID)){
////					runBatch('customscript_djkk_ss_barcode','customdeploy_djkk_ss_barcode'); 
////					response.write('T');
////				}else{
////					response.write('F');
////				} 	   	     						
//	}else{
//		
//		// �݌Ɉړ�
//		if(type=='InventoryMove'){
//						
//				if(!isEmpty(location)){
//				if(!isEmpty(transferlocation)){
//				if(!isEmpty(itemcode)){
//					
//					var locationSearch = nlapiSearchRecord("location",null,
//							[
//							   ["custrecord_djkk_location_barcode","is",location], 
//							   "OR", 
//							   ["custrecord_djkk_location_barcode","is",transferlocation]
//							], 
//							[
//							   new nlobjSearchColumn("custrecord_djkk_location_barcode"), 
//							   new nlobjSearchColumn("internalid")
//							]
//							);
//					var locationBArray=[];
//					if (!isEmpty(locationSearch)) {
//						for(var ls=0;ls<locationSearch.length;ls++){
//							var barcode = locationSearch[ls].getValue("custrecord_djkk_location_barcode");
//							var locationInternalidInternalid = locationSearch[ls].getValue("internalid");
//							locationBArray[barcode]=locationInternalidInternalid;
//						}					
//					}
//					
//					// �ړ���id
//					var thelocationid = locationBArray[location];
//					
//					// �ړ��� id
//					var thetransferlocationid = locationBArray[transferlocation];
//					
//					var subsidiary='';
//					var tSubsidiary='';
//					subsidiary = nlapiLoadRecord('location', thelocationid).getFieldValue('subsidiary');
//					tSubsidiary = nlapiLoadRecord('location', thetransferlocationid).getFieldValue('subsidiary');
//					if (subsidiary!=tSubsidiary){
//				    response.write('�ꏊ�̘A���͈Ⴂ�܂�');
//					}
//					
//					if (!isEmpty(thelocationid)) {
//					if (!isEmpty(thetransferlocationid)) {
//						var jsonObj = '{';
//						jsonObj+= '"status":';
//						/*/*inventorystatus DELECT change by ycx 2021.10.05 */
//						// old
//						//jsonObj=getListJson("inventorystatus", jsonObj, null);
//						//new
//						jsonObj+='[{"key":"1","value":"�Ǖi"},{"key":"2","value":"�s�Ǖi"}]';
//						/*change end*/
//						jsonObj+= ',"inventorydetail":';
//						jsonObj=getInventorydetailSearchJson(itemcode,thelocationid,jsonObj);					
//						jsonObj+= ',"data":[{';
//						jsonObj+='"itemName":"'+itemcode+'",';
//		                jsonObj+='"locationid":"'+thelocationid+'",';
//		                jsonObj+='"transferlocationid":"'+thetransferlocationid+'"';
//		                jsonObj+='}]}';
//		                
//		                response.write(jsonObj);
//					}else{
//						response.write('ERROR:�ړ���̃o�[�R�[�h�G���[');
//					} 
//						
//					}else{
//						response.write('ERROR:�ړ����̃o�[�R�[�h�G���[');
//					}
//				}else{
//					response.write('ERROR:���i�R�[�h�͋�ł�');	
//					}
//				}else{
//					response.write('ERROR:�ړ���͋�ł�');	
//					}
//				}else{
//				response.write('ERROR:�ړ����͋�ł�');	
//				}
//		}
//		
//		// �ۊǒI�ړ�
//		else if(type=='BinMove'){
//			
//			if(!isEmpty(location)){
//				if(!isEmpty(itemcode)){
//					var locationSearch = nlapiSearchRecord("location",null,
//							[
//							   ["custrecord_djkk_location_barcode","is",location]
//							], 
//							[
//							   new nlobjSearchColumn("custrecord_djkk_location_barcode"), 
//							   new nlobjSearchColumn("internalid")
//							]
//							);
//					var locationBArray=[];
//					if (!isEmpty(locationSearch)) {
//						for(var ls=0;ls<locationSearch.length;ls++){
//							var barcode = locationSearch[ls].getValue("custrecord_djkk_location_barcode");
//							var locationInternalid = locationSearch[ls].getValue("internalid");
//							locationBArray[barcode]=locationInternalid;
//						}					
//					}
//					
//					// �ړ���id
//					var thelocationid = locationBArray[location];
//					
//					if (!isEmpty(thelocationid)) {
//						var jsonObj = '{';
//						jsonObj+= '"status":';
//						/*/*inventorystatus DELECT change by ycx 2021.10.05 */
//						// old
//						//jsonObj=getListJson("inventorystatus", jsonObj, null);
//						//new
//						jsonObj+='[{"key":"1","value":"�Ǖi"},{"key":"2","value":"�s�Ǖi"}]';
//						/*change end*/
//						jsonObj+= ',"inventorydetail":';
//						jsonObj=getInventorydetailSearchJson(itemcode,thelocationid,jsonObj);					
//						jsonObj+= ',"data":[{';
//						jsonObj+='"itemName":"'+itemcode+'",';
//		                jsonObj+='"locationid":"'+thelocationid+'",';
//		                jsonObj+='"transferlocationid":"'+thetransferlocationid+'"';
//		                jsonObj+='}]}';
//		                
//		                response.write(jsonObj);
//		                
//						
//					}else{
//						response.write('ERROR:���P�̃o�[�R�[�h�G���[');
//					}				
//				}else{
//				response.write('ERROR:���i�R�[�h�͋�ł�');	
//				}											
//			}else{
//			response.write('ERROR:���P�͋�ł�');	
//			}
//	}
//		else{
//		response.write('ERROR:�X�L�����R�[�h�^�C�v�G���[');
//		}		
//	}	
//}
//
//function getListJson(listId, jsonObj,filters) {
//	jsonObj+="[";
//	var Search= nlapiSearchRecord(listId,null,filters, 
//    		[
//    		  new nlobjSearchColumn("internalid"), 
//    		   new nlobjSearchColumn("name")
//    		]
//    		);
//	if (!isEmpty(Search)) {
//		for (var i = 0; i < Search.length; i++) {
//			jsonObj +='{"key":"'+Search[i].getValue('internalid')+'",';
//			jsonObj +='"value":"'+Search[i].getValue('name')+'"}'; 
//			if(i!=Search.length-1){
//			jsonObj +=",";
//			}
//		}
//	}
//	jsonObj+="]";
//	return jsonObj;
//}
//function getInventorydetailSearchJson(itemcode,thelocationid,jsonObj) {
//	jsonObj+="[";
//	var Search=  nlapiSearchRecord("inventorydetail",null,
//			[
//			   ["item.name","is",,itemcode], 
//			   "AND", 
//			   ["inventorynumber.quantityavailable","notlessthanorequalto","0"], 
//			   "AND", 
//			   ["inventorynumber.location","anyof",thelocationid]
//			], 
//			[
//			   new nlobjSearchColumn("inventorynumber",null,"GROUP").setSort(false), 
//			   new nlobjSearchColumn("quantityonhand","inventoryNumber","GROUP")
//			]
//			);
//	var invarray=[];
//	if (!isEmpty(Search)) {
//		for (var i = 0; i < Search.length; i++) {
//			jsonObj +='{';
//			var inventorynumber=Search[i].getValue("inventorynumber",null,"GROUP");
//			var inventoryid=Search[i].getText("inventorynumber",null,"GROUP");
//			var inventoryquantity=Search[i].getValue("quantityonhand","inventoryNumber","GROUP");
//			jsonObj +='"key":"'+inventorynumber+'",';
//			jsonObj +='"value":"'+inventoryid+'",';
//			jsonObj +='"inventoryquantity":"'+inventoryquantity+'"';			
//			jsonObj +='}';
//			if(i!=Search.length-1){
//			jsonObj +=',';
//			}
//		}
//	}
//	jsonObj+="]";
//	return jsonObj;
//}
//
//
//function creatInventoryMove(subsidiary,locationid,transferlocation,itemid,lot,quantity,locationbin,transferlocationbin,statusbefore,statusafter) {
//	try {
//		var record=nlapiCreateRecord('inventorytransfer');
//		record.setFieldValue('subsidiary',subsidiary);
//		record.setFieldValue('location', locationid);
//		record.setFieldValue('custbody_djkk_inventorytransfer_flag', 'T');
//		record.setFieldValue('transferlocation', transferlocation);
//		record.setFieldValue('memo', 'HANDY SCAN�����쐬');
//		record.selectNewLineItem('inventory');
//		//record.setCurrentLineItemValue('inventory', 'custcol_djkk_item', itemid);
//		record.setCurrentLineItemValue('inventory', 'item', itemid);
//		record.setCurrentLineItemValue('inventory', 'adjustqtyby', quantity);
//		var inventorydetail=record.createCurrentLineItemSubrecord('inventory', 'inventorydetail');
//		inventorydetail.selectNewLineItem('inventoryassignment');
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber', lot);
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','quantity', quantity);
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','binnumber', locationbin);
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','tobinnumber', transferlocationbin);
//		/*inventorystatus DELECT change by ycx 2021.10.05 
//        inventorydetail.setCurrentLineItemValue('inventoryassignment','inventorystatus',statusbefore);
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','toinventorystatus',statusafter);	
//		*/
//	inventorydetail.commitLineItem('inventoryassignment');
//	inventorydetail.commit();
//	record.commitLineItem('inventory');
//	var recordId=nlapiSubmitRecord(record, false, true);
//		return 'T';
//	} catch (e) {
//		nlapiLogExecution('debug', 'error', e);
//		return  e;
//	}
//}
//
//function creatBinMove(locationid,itemid,lot,quantity,locationbin,transferlocationbin,statusbefore,statusafter) {
//	try {
//		var record=nlapiCreateRecord('bintransfer');
//		record.setFieldValue('location', locationid);
//		record.setFieldValue('memo', 'HANDY SCAN�����쐬');
//		record.selectNewLineItem('inventory');
//		record.setCurrentLineItemValue('inventory', 'item', itemid);
//		record.setCurrentLineItemValue('inventory', 'quantity', quantity);
//		var inventorydetail=record.createCurrentLineItemSubrecord('inventory', 'inventorydetail');
//		inventorydetail.selectNewLineItem('inventoryassignment');
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber', lot);
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','quantity', quantity);
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','binnumber', locationbin);
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','tobinnumber', transferlocationbin);
//		/*inventorystatus DELECT change by ycx 2021.10.05 
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','inventorystatus',statusbefore);
//		inventorydetail.setCurrentLineItemValue('inventoryassignment','toinventorystatus',statusafter);
//		*/
//	inventorydetail.commitLineItem('inventoryassignment');
//	inventorydetail.commit();
//	record.commitLineItem('inventory');
//	var recordId=nlapiSubmitRecord(record, false, true);
//		return 'T';
//	} catch (e) {
//		nlapiLogExecution('debug', 'error', e);
//		return  e;
//	}
//}
function defaultEmpty(src){
	return src || '';
}