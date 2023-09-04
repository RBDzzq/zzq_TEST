/**
 * ���׊Ǘ��o�[�R�[�h
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
	var poNumber = request.getParameter('poNumber');
	// �������ԍ��_�[�o�[�R�[�h���X�L����
	if(handyType=='PoNumberScan'){
		if(!isEmpty(poNumber)){
			var transactionSearch = nlapiSearchRecord("inventorydetail",null,
					[
					   ["transaction.type","anyof","PurchOrd"], 
					   "AND", 
					   ["transaction.numbertext","is",poNumber], 
					   "AND", 
					   ["transaction.approvalstatus","anyof","2"], 
					   "AND", 
					   ["transaction.status","anyof","PurchOrd:D","PurchOrd:B","PurchOrd:E"], 
					   "AND", 
					   ["formulanumeric: {transaction.quantity}-{transaction.quantityshiprecv}","greaterthanorequalto","0"]
					],
					[
					   new nlobjSearchColumn("subsidiary","transaction",null), 
					   new nlobjSearchColumn("internalid","transaction",null), 
					   new nlobjSearchColumn("line","transaction",null).setSort(false), 
					   new nlobjSearchColumn("item","transaction",null), 
					   new nlobjSearchColumn("name","location",null), 
					   new nlobjSearchColumn("binnumber"), 
					   new nlobjSearchColumn("inventorynumber").setSort(false), 
					   new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  {inventorydetaillines.custrecord_djkk_maker_serial_code} is null THEN {inventorydetaillines.custrecord_djkk_control_number} ELSE {inventorydetaillines.custrecord_djkk_maker_serial_code} END"), 
					   new nlobjSearchColumn("expirationdate"), 
					   new nlobjSearchColumn("quantity"), 
					   new nlobjSearchColumn("formulanumeric").setFormula("{transaction.quantity}-{transaction.quantityshiprecv}")
					]
					);
			if(!isEmpty(transactionSearch)){

				var columnID = transactionSearch[0].getAllColumns();
				var jsonObj = '{';
				var subsidiary=transactionSearch[0].getValue(columnID[0]);
				jsonObj+= '"subsidiary":"';
				jsonObj+=subsidiary+'"';
				var filters=[["subsidiary","anyof",subsidiary]];
				
				jsonObj+= ',"poId":"';
				jsonObj+=transactionSearch[0].getValue(columnID[1])+'"';
				
				jsonObj+= ',"locations":';
				jsonObj=getListToJson("location", jsonObj, filters,'custrecord_djkk_location_barcode','name');
				
				jsonObj+= ',"bins":';
				jsonObj=getListToJson("bin", jsonObj, null,'custrecord_djkk_bin_barcode','binnumber');
												
				// poLine
				jsonObj+= ',"poLine":[';
				for(var i=0;i<transactionSearch.length;i++){
					jsonObj+='{';
					var lineId= transactionSearch[i].getValue(columnID[2]);
		            jsonObj+='"lineId":"'+lineId+'",';
		            
					var itemName= transactionSearch[i].getText(columnID[3]);
					jsonObj+='"itemName":"'+itemName+'",';
					
					var itemId= transactionSearch[i].getValue(columnID[3]);
					jsonObj+='"itemId":"'+itemId+'",';
	               
	                var locationName=transactionSearch[i].getValue(columnID[4]);
	                jsonObj+='"locationName":"'+locationName+'",';
	                
	                var binName=transactionSearch[i].getText(columnID[5]);
	                jsonObj+='"binName":"'+binName+'",';
	                
	                var lotNumber= transactionSearch[i].getText(columnID[6]);
	                jsonObj+='"lotNumber":"'+lotNumber+'",';
	                
	                var makerLotNumber= transactionSearch[i].getValue(columnID[7]);
	                jsonObj+='"makerLotNumber":"'+makerLotNumber+'",';
	                
	                var expirationdate= transactionSearch[i].getValue(columnID[8]);
	                jsonObj+='"expirationdate":"'+expirationdate+'",';
	                
	                var poInvQuantity= transactionSearch[i].getValue(columnID[9]);
	                jsonObj+='"poInvQuantity":"'+poInvQuantity+'",';
	                
	                var poNeedQuantity= transactionSearch[i].getValue(columnID[10]);
	                jsonObj+='"poNeedQuantity":"'+poNeedQuantity+'"';
	                jsonObj+='}';
	                if(i!=transactionSearch.length-1){
	        			jsonObj +=",";
	        			}
				}								                
                jsonObj+=']';
                jsonObj+='}';                			                
                response.write(jsonObj);                							
			}else{
		response.write('ERROR:���̔������ԍ��͑��݂��܂���');	
			}
		}else{
		response.write('ERROR:�������ԍ��͋�ɂł��܂���');
		}
	}
	
	// �u�m�裃{�^��������
	else if(handyType=='PoCommitCheck'){
		var poId = request.getParameter('poId');
		var podetail=request.getParameter('podetail');
		var podetailArray=new Array();
		if(!isEmpty(podetail)){
			podetail=decodeURIComponent(podetail);
			podetailArray= eval("(" + podetail + ")");
		}
		
		var backFlag=newCreatItemreceipt(poId,podetailArray);
        response.write(backFlag);
	}
	else{
		response.write('ERROR:handy�X�L�������g�p���Ă�������');
	}
}

function newCreatItemreceipt(poId,podetailArray) {
	try {
				
		var itemreceiptRecord = nlapiTransformRecord('purchaseorder',poId, 'itemreceipt');
		var count = itemreceiptRecord.getLineItemCount('item');
		for (var i = 1; i < count + 1; i++) {
			itemreceiptRecord.selectLineItem('item', i);			
			itemreceiptRecord.setCurrentLineItemValue('item','itemreceive', 'F');
			itemreceiptRecord.removeCurrentLineItemSubrecord('item', 'inventorydetail');
			for (var i = 0; i < podetailArray.length; i++) {
				var itemArray=podetailArray[i]['itl'];
				for(var j=0;j<itemArray.length;j++){
					var polineId = itemArray[j]['pi'];
					var itemId = itemArray[j]['it'];
					if(itemreceiptRecord.getCurrentLineItemValue('item', 'orderline')==polineId
							&&itemreceiptRecord.getCurrentLineItemValue('item', 'item')==itemId){
						
						var loctionId = itemArray[j]['li'];
						var lineQuantity= itemArray[j]['lq'];
						itemreceiptRecord.setCurrentLineItemValue('item', 'itemreceive','T');
						itemreceiptRecord.setCurrentLineItemValue('item', 'location',loctionId);
						itemreceiptRecord.setCurrentLineItemValue('item', 'quantity',lineQuantity);
						
						var inventorydetailArray=itemArray[j]['ivd'];
						// �݌ɏڍׂ̃I�u�W�F�N�g���擾����
						var subrecord2 = itemreceiptRecord.editCurrentLineItemSubrecord('item', 'inventorydetail');
						if (subrecord2 == null) {
							subrecord2 = itemreceiptRecord.createCurrentLineItemSubrecord('item', 'inventorydetail');
						}
						for(var s=0;s<inventorydetailArray.length;s++){
							var binId = inventorydetailArray[s]['bi'];
							var lotNumber = inventorydetailArray[s]['ln'];
							var makerLotSerialNumber = inventorydetailArray[s]['mn'];
							var expirationdate = handyDateToString(inventorydetailArray[s]['ed']);
							var inventoryQuantity = inventorydetailArray[s]['iq'];
							if (subrecord2 == null) {
								subrecord2.selectNewLineItem('inventoryassignment');
							}else{
								subrecord2.selectLineItem('inventoryassignment', s+1);
							}
							// �݌ɔԍ���ݒ肷��
							
							subrecord2.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber', lotNumber);
							
							subrecord2.setCurrentLineItemValue('inventoryassignment','binnumber',binId);
							var itemValues = nlapiLookupField('item', itemId, [ 'islotitem','isserialitem' ]);
							
							// ���b�g�ԍ�
							if (itemValues.islotitem == 'T') {
								
								// DJ_���[�J�[�������b�g�ԍ�
								subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',makerLotSerialNumber);
							} else if (itemValues.isserialitem == 'T') {
								
								// DJ_���[�J�[�V���A���ԍ�
								subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',makerLotSerialNumber);
							}
					
							// �ܖ�����
							subrecord2.setCurrentLineItemValue('inventoryassignment','expirationdate',expirationdate);
							subrecord2.setCurrentLineItemValue('inventoryassignment','quantity', inventoryQuantity);
							subrecord2.commitLineItem('inventoryassignment');
						}												
						subrecord2.commit();
					}										
				}							
			}
			itemreceiptRecord.commitLineItem('item');
		}
		var itemreceiptId = nlapiSubmitRecord(itemreceiptRecord, false,true);
		return 'T';
	} catch (e) {
		nlapiLogExecution('debug', 'error', e);
		return  e;
	}
}

function getListToJson(listId, jsonObj,filters,key,value) {
	jsonObj+="[";
	var Search= nlapiSearchRecord(listId,null,filters, 
    		[
    		  new nlobjSearchColumn(key), 
    		   new nlobjSearchColumn(value),
    		   new nlobjSearchColumn('internalid')
    		   
    		]
    		);
	if (!isEmpty(Search)) {
		for (var i = 0; i < Search.length; i++) {
			jsonObj +='{"key":"'+Search[i].getValue(key)+'",';
			jsonObj +='"value":"'+Search[i].getValue(value)+'",';
			jsonObj +='"internalid":"'+Search[i].getValue('internalid')+'"}'; 
			if(i!=Search.length-1){
			jsonObj +=",";
			}
		}
	}
	jsonObj+="]";
	return jsonObj;
}

function handyDateToString(date) {
	if(!isEmpty(date)){
		var year=date.slice(0,4);
	    var month=Number(date.slice(4,6))-1;
	    var day=date.slice(6,8);
	    var dateExpiry  = new Date();
        dateExpiry.setFullYear(year, month, day);
        date=nlapiDateToString(dateExpiry);
		}
	return date;
}
 
//
//function handyOld(request, response) {
//	
//	var handyType = request.getParameter('handy');
//	var type = request.getParameter('type');
//	var recordType = request.getParameter('recordtype');
//	var recordId = request.getParameter('id');
//	var lineId = request.getParameter('line');
//	
// 	var quantity=request.getParameter('quantity');
//
//	// �׎p�敪
//	var packageClassification=request.getParameter('packagec');
//	
//	// status
//	var status=request.getParameter('status');
//	
//	// ���b�g
//	var lot=request.getParameter('lot');
//	
//	// �ܖ�����
//	var expirationdate=request.getParameter('expirationdate');
//	
//	// DJ_�o�׉\������	
//	var shipmentdate=request.getParameter('shipmentdate');
//	
//	// DJ_�����N����
//	var makeymd=request.getParameter('makeymd');
//	
//	// �݌ɋ敪
//	var inventoryClassification=request.getParameter('inventoryc');
//	
//	// ���P
//	var location=request.getParameter('location');
//	
//	if(handyType=='DataStorage'){
//		var backFlag=creatItemreceipt(recordId,lineId,quantity,packageClassification,status,lot,expirationdate,inventoryClassification,location,makeymd,shipmentdate);
//        response.write(backFlag);
//
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
//		// ���׌��i
//		if(type=='ArrivalInspection'){
//			
//			if(recordType=='PO'){
//				if(!isEmpty(recordId)&&!isEmpty(lineId)){
//					var fielt=[
//							[ "type", "anyof", "PurchOrd" ], "AND",
//							[ "line", "equalto", lineId ], "AND",
//							[ "internalid", "anyof", recordId ] ];
//					var transactionSearch = nlapiSearchRecord("transaction", null,fielt,
//							[  new nlobjSearchColumn("item"),
//							   new nlobjSearchColumn("formulanumeric").setFormula("{quantity}-{quantityshiprecv}"), 
//							   new nlobjSearchColumn("location"),
//							   new nlobjSearchColumn("subsidiary")
//							]);
//					if (!isEmpty(transactionSearch)) {
//						var columnID = transactionSearch[0].getAllColumns();
//						var jsonObj = '{';
//						jsonObj+= '"packingType":';
//						jsonObj=getListJson("customlist_djkk_packingtype", jsonObj, null);
//						jsonObj+= ',"status":';
//						/*/*inventorystatus DELECT change by ycx 2021.10.05 */
//						// old
//						//jsonObj=getListJson("inventorystatus", jsonObj, null);
//						//new
//						jsonObj+='[{"key":"1","value":"�Ǖi"},{"key":"2","value":"�s�Ǖi"}]';
//						/*change end*/
//						jsonObj+= ',"stockType":';
//						jsonObj=getListJson("customlist_djkk_storage_type", jsonObj, null);
//						var subsidiary=transactionSearch[0].getValue(columnID[3]);
//						var filters=[["subsidiary","anyof",subsidiary]];
//						jsonObj+= ',"locations":';
//						jsonObj=getListJson("location", jsonObj, filters);
//						jsonObj+= ',"data":[{';
//						var itemName= transactionSearch[0].getText(columnID[0]);
//						jsonObj+='"itemName":"'+itemName+'",';
//		                var quantity= transactionSearch[0].getValue(columnID[1]);
//		                jsonObj+='"quantity":"'+quantity+'",';
//		                var location=transactionSearch[0].getValue(columnID[2]);
//		                jsonObj+='"location":"'+location+'",';
//		                var poRecord=nlapiLoadRecord('purchaseorder', recordId);
//		                var pc=poRecord.getLineItemCount('item');
//		                var poLotnum='';
//		                var poPacking='';
//		                var poStock='';
//		                var poStatus='';
//		                var poExpirationdate='';
//		                var poMakeymd='';
//		                var poshipmentdate='';
//		                for(var pii=1;pii<pc+1;pii++){
//		                poRecord.selectLineItem('item', pii);
//		                if(poRecord.getCurrentLineItemValue('item', 'line')==lineId){
//		                	var poinv=poRecord.editCurrentLineItemSubrecord('item', 'inventorydetail');
//		                	if (poinv != null) {
//		                		poinv.selectLineItem('inventoryassignment', 1);
//		                		poLotnum=poinv.getCurrentLineItemValue('inventoryassignment','receiptinventorynumber');
// 	                		    poPacking=poinv.getCurrentLineItemValue('inventoryassignment','custrecord_djkk_packingtype');
//		                		poStock=poinv.getCurrentLineItemValue('inventoryassignment','custrecord_djkk_storage_type');
//		                		poExpirationdate=poinv.getCurrentLineItemValue('inventoryassignment','expirationdate');
//		                		poMakeymd=poinv.getCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd');
//		                		poshipmentdate=poinv.getCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date');
//		    				}
//		                 }
//		                }
//		                		                		                		                
//		                jsonObj+='"lotnum":"'+poLotnum+'",';		                
//		                jsonObj+='"packing":"'+poPacking+'",';//DJ_�׎p�敪
//		                jsonObj+='"stock":"'+poStock+'",';//DJ_�݌ɋ敪		                
//		                jsonObj+='"expirationdate":"'+poExpirationdate+'",';//�ܖ�����
//		                jsonObj+='"makeymd":"'+poMakeymd+'",';//DJ_�����N����
//		                jsonObj+='"shipmentdate":"'+poshipmentdate+'",';//DJ_�o�׉\������		                
//		                jsonObj+='"status":"'+''+'"';
//		                jsonObj+='}]}';
//		                
//		                response.write(jsonObj);
//		                
//						
//					}else{
//						response.write('ERROR:�g�����U�N�V���������Ȃ�');
//					}
//					
//					
//				}
//				//else if{}
//				else{
//				response.write('ERROR:���R�[�hID�G���[');	
//				}
//			}
//			//else if{}
//			else{
//			response.write('ERROR:���R�[�h�^�C�v�G���[');
//			}
//		}
//		//else if{}
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
//
//function creatItemreceipt(internalid,linenum,quantity,packagec,status,lot,expirationdate,inventoryc,location,makeymd,shipmentdate) {
//	try {
//		if(!isEmpty(expirationdate)){
//		var year=expirationdate.slice(0,4);
//	    var month=Number(expirationdate.slice(4,6))-1;
//	    var day=expirationdate.slice(6,8);
//	    var dateExpiry  = new Date();
//        dateExpiry.setFullYear(year, month, day);
//        expirationdate=nlapiDateToString(dateExpiry);
//		}
//		
//		if(!isEmpty(makeymd)){
//			var myear=makeymd.slice(0,4);
//		    var mmonth=Number(makeymd.slice(4,6))-1;
//		    var mday=makeymd.slice(6,8);
//		    var mdateExpiry  = new Date();
//	        mdateExpiry.setFullYear(myear, mmonth, mday);
//	        makeymd=nlapiDateToString(mdateExpiry);
//			}
//		
//		if(!isEmpty(shipmentdate)){
//			var syear=shipmentdate.slice(0,4);
//		    var smonth=Number(shipmentdate.slice(4,6))-1;
//		    var sday=shipmentdate.slice(6,8);
//		    var sdateExpiry  = new Date();
//	        sdateExpiry.setFullYear(syear, smonth, sday);
//	        shipmentdate=nlapiDateToString(sdateExpiry);
//			}
//		
//		var itemreceiptRecord = nlapiTransformRecord('purchaseorder',internalid, 'itemreceipt');
//		var count = itemreceiptRecord.getLineItemCount('item');
//		for (var i = 1; i < count + 1; i++) {
//			itemreceiptRecord.selectLineItem('item', i);			
//			itemreceiptRecord.setCurrentLineItemValue('item','itemreceive', 'F');
//			if(itemreceiptRecord.getCurrentLineItemValue('item', 'orderline')==linenum){
//				itemreceiptRecord.setCurrentLineItemValue('item', 'itemreceive','T');
//				itemreceiptRecord.setCurrentLineItemValue('item', 'location',location);
//				itemreceiptRecord.setCurrentLineItemValue('item', 'quantity',quantity);
//				// �݌ɏڍׂ̃I�u�W�F�N�g���擾����
//				var subrecord2 = itemreceiptRecord.editCurrentLineItemSubrecord('item', 'inventorydetail');
//				if (subrecord2 == null) {
//					subrecord2 = itemreceiptRecord.createCurrentLineItemSubrecord('item', 'inventorydetail');
//					subrecord2.selectNewLineItem('inventoryassignment');
//				}else{
//					subrecord2.selectLineItem('inventoryassignment', 1);
//				}
//				// �݌ɔԍ���ݒ肷��
//				
//				subrecord2.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber', lot);
//				subrecord2.setCurrentLineItemValue('inventoryassignment','quantity', quantity);
//				var binNum='';
//				var binSearch = nlapiSearchRecord("bin",null,
//				[
//				   ["location","anyof",location]
//				], 
//				[
//				   new nlobjSearchColumn("internalid")
//				]
//				);
//				if(!isEmpty(binSearch)){
//				binNum=binSearch[0].getValue("internalid");
//				}
//				subrecord2.setCurrentLineItemValue('inventoryassignment','binnumber',binNum);
//				/*inventorystatus DELECT change by ycx 2021.10.05 
//				if(status.toString()!='-1'){
//					// �݌ɃX�e�[�^�X:
//					subrecord2.setCurrentLineItemValue('inventoryassignment','inventorystatus',status);
//				}*/
//				if(packagec.toString()!='-1'){
//				// DJ_�׎p�敪
//				subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_packingtype',packagec);
//				}
//				if(inventoryc.toString()!='-1'){
//				// DJ_�݌ɋ敪
//				subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_storage_type',inventoryc);
//				}
//				if(expirationdate.toString()!='-1'){
//				// �ܖ�����
//				subrecord2.setCurrentLineItemValue('inventoryassignment','expirationdate',expirationdate);
//				}
//				if(makeymd.toString()!='-1'){
//				// DJ_�����N����
//				subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',makeymd);
//				}
//				if(shipmentdate.toString()!='-1'){
//				// DJ_�o�׉\������
//				subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',shipmentdate);
//				}
//				subrecord2.commitLineItem('inventoryassignment');
//				subrecord2.commit();
//				itemreceiptRecord.commitLineItem('inventory');
//			}
//			itemreceiptRecord.commitLineItem('item');
//		}
//		var itemreceiptId = nlapiSubmitRecord(itemreceiptRecord, false,true);
//		return 'T';
//	} catch (e) {
//		nlapiLogExecution('debug', 'error', e);
//		return  e;
//	}
//}