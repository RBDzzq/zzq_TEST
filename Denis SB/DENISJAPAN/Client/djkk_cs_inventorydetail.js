/**
 * �݌ɏڍׂ�Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/28     CPC_��
 *
 */
/**
 * �ŏ�����
 */
var TheMinimumdigits = 11;//5;
var defaultInventoryStatus=1;
var updateArray=new Array();
var numbering='';
var nobbdbo ='F';
var submitId='1';
var NumberTxt='L';
/**
 * ��ʂ̏�����
 */
function clientPageInit(type) {			
	var itemId = nlapiGetFieldValue('item');
	nobbdbo = nlapiLookupField('item', itemId, 'custitem_djkk_no_bbd');	
	/*********************/
	setFieldDisableType('customform', 'disabled');
	var subTxt=nlapiGetFieldText('customform');
//	if(subTxt=='NICHIFUTSU BOEKI K.K.'||subTxt=='UNION LIQUORS K.K.'){
//	    // DENISJAPANDEV-1387 zheng 20230306 start
//		// document.getElementById("inventoryassignment_splits").rows[0].cells[5].innerHTML="DJ_�c�o�׉\����";
//		document.getElementById("inventoryassignment_splits").rows[0].cells[5].innerHTML="DJ_�o�׉\������";
//		// DENISJAPANDEV-1387 zheng 20230306 end
//	}else if(subTxt=='SCETI K.K.'||subTxt=='DENIS PHARMA K.K.'||subTxt=='DENIS JAPAN K.K.'){
//		document.getElementById("inventoryassignment_splits").rows[0].cells[5].innerHTML="DJ_�o�׉\������";
//	}
	var userId=nlapiGetUser();
	if(!isEmpty(userId)){
//		var usersub=nlapiLookupField('employee', userId, 'subsidiary');
//		var usersubTxt=nlapiLookupField('employee', userId, 'subsidiary',true);
		var usersub=getRoleSubsidiary();
		var nbSearch = nlapiSearchRecord("customrecord_djkk_inventorydetail_number",null,
				[
				   ["custrecord_djkk_invnum_subsidiary","anyof",usersub]
				], 
				[
                   new nlobjSearchColumn("internalid"),
                   new nlobjSearchColumn("custrecord_djkk_invnum_subsidiary"),
                   new nlobjSearchColumn("custrecord_djkk_invnum_form_name"),
				   new nlobjSearchColumn("custrecord_djkk_invnum_item_make"), 
				   new nlobjSearchColumn("custrecord_djkk_invnum_bumber")
				]
				);
		if(!isEmpty(nbSearch)){
			if(nbSearch[0].getValue('custrecord_djkk_invnum_form_name')!=subTxt){
				nlapiSetFieldText('customform', nbSearch[0].getValue('custrecord_djkk_invnum_form_name'), false, true);
			}
			submitId=nbSearch[0].getValue('internalid');
			NumberTxt=nbSearch[0].getValue('custrecord_djkk_invnum_item_make');
			numbering=nbSearch[0].getValue('custrecord_djkk_invnum_bumber');
		}else{
			var numberingArray=nlapiLookupField('customrecord_djkk_inventorydetail_number', submitId, ['custrecord_djkk_invnum_bumber','custrecord_djkk_invnum_item_make']);
			numbering=numberingArray.custrecord_djkk_invnum_bumber;
			NumberTxt=numberingArray.custrecord_djkk_invnum_item_make;
		}				
	}else{
		var numberingArray=nlapiLookupField('customrecord_djkk_inventorydetail_number', submitId, ['custrecord_djkk_invnum_bumber','custrecord_djkk_invnum_item_make']);
		numbering=numberingArray.custrecord_djkk_invnum_bumber;
		NumberTxt=numberingArray.custrecord_djkk_invnum_item_make;
	}
	/*********************/

	var icltype=getQueryVariable("icltype");
	if(icltype=='T'){
		setButtunButtonDisable('tbl_ok');
		setButtunButtonDisable('tbl_secondaryok');
		
		setButtunButtonDisable('tbl_close');
		setButtunButtonDisable('tbl_secondaryclose');
	}else{
		setButtunButtonDisable('tbl_custformbutton0');	
		setButtunButtonDisable('tbl_secondarycustformbutton0');		
	}
//	var userRole=nlapiGetRole();
//	var subsidiary=getRoleSubsidiary();
//	if(subsidiary=='1'){
//	if(nlapiGetFieldValue('customform')!='78'){
//	  nlapiSetFieldValue('customform','78');
//		}
//	}else if(subsidiary=='2'){
//	if(nlapiGetFieldValue('customform')!='93'){
//      nlapiSetFieldValue('customform','93');
//		}
//	}
	if(nlapiGetUser()!=developers_employee_id){
	setButtunButtonDisable('tbl_inventoryassignment_expressentry');	
    setButtunButtonDisable('tbl_inventoryassignment_autogenerate');
    setButtunButtonDisable('tbl_inventoryassignment_addmultiple');
	}
    var count = nlapiGetLineItemCount('inventoryassignment');
    var tranRecordType=getQueryVariable("subrecord_parent_tran_type");
    var createdType=getQueryVariable("transactionid");
    var tranRecordId=getQueryVariable("id");
   // if(type == 'create' || type == 'copy'){
    if((tranRecordType=='vendbill'||tranRecordType=='vendauth'||tranRecordType=='custcred')&&!isEmpty(tranRecordId)&&isEmpty(createdType)){
    	var inventorydetailSearch = '';
    	if(!isEmpty(tranRecordId)){
    	inventorydetailSearch =nlapiSearchRecord("inventorydetail",null,
    			[
    			   ["internalid","anyof",tranRecordId]
    			], 
    			[
    			   new nlobjSearchColumn("inventorynumber"), 
    			   new nlobjSearchColumn("binnumber"), 
    			   //new nlobjSearchColumn("status"), 
    			   new nlobjSearchColumn("expirationdate"), 
    			   new nlobjSearchColumn("custrecord_djkk_maker_serial_code","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_make_ymd","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_shipment_date","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_control_number","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_packingtype","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_storage_type","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_warehouse_code","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_smc_code","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_lot_remark","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_lot_memo","inventoryDetailLines",null)
    			]
    			);
    	}
    	if(!isEmpty(inventorydetailSearch)){
    		for(var ivs=0;ivs<inventorydetailSearch.length;ivs++){
    			for(var ini=1;ini<count+1;ini++){
    				nlapiSelectLineItem('inventoryassignment', ini);
    				if(nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber')==inventorydetailSearch[ivs].getText("inventorynumber")){
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'binnumber', inventorydetailSearch[ivs].getValue("binnumber"), false, true);
    					//nlapiSetCurrentLineItemValue('inventoryassignment', 'status', inventorydetailSearch[ivs].getValue("status"), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'expirationdate', inventorydetailSearch[ivs].getValue("expirationdate"), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code', inventorydetailSearch[ivs].getValue("custrecord_djkk_maker_serial_code","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', inventorydetailSearch[ivs].getValue("custrecord_djkk_make_ymd","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date', inventorydetailSearch[ivs].getValue("custrecord_djkk_shipment_date","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number', inventorydetailSearch[ivs].getValue("custrecord_djkk_control_number","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_packingtype', inventorydetailSearch[ivs].getValue("custrecord_djkk_packingtype","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_storage_type', inventorydetailSearch[ivs].getValue("custrecord_djkk_storage_type","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', inventorydetailSearch[ivs].getValue("custrecord_djkk_warehouse_code","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code', inventorydetailSearch[ivs].getValue("custrecord_djkk_smc_code","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark', inventorydetailSearch[ivs].getValue("custrecord_djkk_lot_remark","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo', inventorydetailSearch[ivs].getValue("custrecord_djkk_lot_memo","inventoryDetailLines",null), false, true);
    					nlapiCommitLineItem('inventoryassignment');
    				}
    			}
    		}
    	}
    	// TODO
    }else if((tranRecordType=='custinvc'||tranRecordType=='vendcred')&&!isEmpty(tranRecordId)&&isEmpty(createdType)){
    	var inventorydetailSearch = '';
    	if(!isEmpty(tranRecordId)){
    	inventorydetailSearch =nlapiSearchRecord("inventorydetail",null,
    			[
    			   ["internalid","anyof",tranRecordId]
    			], 
    			[
    			   new nlobjSearchColumn("inventorynumber"), 
    			   new nlobjSearchColumn("binnumber"), 
    			  // new nlobjSearchColumn("status"), 
    			   new nlobjSearchColumn("expirationdate"), 
    			   new nlobjSearchColumn("custrecord_djkk_maker_serial_code","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_make_ymd","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_shipment_date","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_control_number","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_packingtype","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_storage_type","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_warehouse_code","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_smc_code","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_lot_remark","inventoryDetailLines",null), 
    			   new nlobjSearchColumn("custrecord_djkk_lot_memo","inventoryDetailLines",null)
    			]
    			); 	
    	}
    	if(!isEmpty(inventorydetailSearch)){
    		for(var ivs=0;ivs<inventorydetailSearch.length;ivs++){
    			for(var ini=1;ini<count+1;ini++){
    				nlapiSelectLineItem('inventoryassignment', ini);
    				if(nlapiGetCurrentLineItemValue('inventoryassignment', 'issueinventorynumber')==inventorydetailSearch[ivs].getValue("inventorynumber")){
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'binnumber', inventorydetailSearch[ivs].getValue("binnumber"), false, true);
    					//nlapiSetCurrentLineItemValue('inventoryassignment', 'status', inventorydetailSearch[ivs].getValue("status"), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'expirationdate', inventorydetailSearch[ivs].getValue("expirationdate"), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code', inventorydetailSearch[ivs].getValue("custrecord_djkk_maker_serial_code","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', inventorydetailSearch[ivs].getValue("custrecord_djkk_make_ymd","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date', inventorydetailSearch[ivs].getValue("custrecord_djkk_shipment_date","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number', inventorydetailSearch[ivs].getValue("custrecord_djkk_control_number","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_packingtype', inventorydetailSearch[ivs].getValue("custrecord_djkk_packingtype","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_storage_type', inventorydetailSearch[ivs].getValue("custrecord_djkk_storage_type","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', inventorydetailSearch[ivs].getValue("custrecord_djkk_warehouse_code","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code', inventorydetailSearch[ivs].getValue("custrecord_djkk_smc_code","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark', inventorydetailSearch[ivs].getValue("custrecord_djkk_lot_remark","inventoryDetailLines",null), false, true);
    					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo', inventorydetailSearch[ivs].getValue("custrecord_djkk_lot_memo","inventoryDetailLines",null), false, true);
    					nlapiCommitLineItem('inventoryassignment');
    				}
    			}
    		}
    	}
    }
   //TODO  /************************/
//    if(count==0){
//    	
//    	var orderline=getQueryVariable("orderline");
//    	var transformId=getQueryVariable("subrecord_transform_from_parent_id");
//    	var transformRecordType=getQueryVariable("subrecord_transform_from_parent_tran_type");
//    	var poline=getQueryVariable("lineid");
//    	var transactionid=getQueryVariable("transactionid");   	    	
//    	var recordType='';
//    	var lineId='';
//    	var poId='';
//    	if(transformRecordType=='purchord'&&!isEmpty(orderline)&&!isEmpty(transformId)){
//    		 recordType=transformRecordType;
//        	 lineId=orderline;
//        	 poId=transformId;
//    	}else if(tranRecordType=='purchord'&&!isEmpty(poline)&&!isEmpty(transactionid)){
//    		 recordType=tranRecordType;
//        	 lineId=poline;
//        	 poId=transactionid;
//    	}
//    	if(recordType=='purchord'&&!isEmpty(lineId)&&!isEmpty(poId)){
//    		var makeNumber=nlapiLoadRecord('purchaseorder', poId).getLineItemValue('item', 'custcol_djkk_maker_serial_code', lineId);
//			if(!isEmpty(makeNumber)){
//				var itemId = nlapiGetFieldValue('item');
//				var quantity=nlapiGetFieldValue('quantity');
//				if (!isEmpty(itemId)) {
//					var quantity=nlapiGetFieldValue('quantity');
//					var itemValues = nlapiLookupField('item', itemId, [ 'islotitem','isserialitem']);
//					var itemMake=makeNumber+nlapiGetFieldText('item');
//					var numberingId='';
//					var numberSearch = nlapiSearchRecord("customrecord_djkk_inventorydetail_number",null,
//							[
//							   ["custrecord_djkk_invnum_item_make","is",itemMake]
//							], 
//							[
//							    new nlobjSearchColumn("internalid"), 
//                                new nlobjSearchColumn("custrecord_djkk_invnum_bumber")
//							]
//							);
//					var numbering=1;
//					
//					if(!isEmpty(numberSearch)){
//						numberingId=numberSearch[0].getValue("internalid");
//						numbering=Number(numberSearch[0].getValue("custrecord_djkk_invnum_bumber"))+1;
//					}
//					var receiptinventorynumber =  itemMake+ prefixInteger(parseInt(numbering), parseInt(TheMinimumdigits));		
//					// ���b�g�ԍ�
//					//if (itemValues.islotitem=='T') {
//							
//							nlapiSelectNewLineItem('inventoryassignment');
//							nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',receiptinventorynumber);
//							if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'inventorystatus'))){
//							nlapiSetCurrentLineItemValue('inventoryassignment', 'inventorystatus',defaultInventoryStatus);
//							}
//							if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'quantity'))){
//							nlapiSetCurrentLineItemValue('inventoryassignment', 'quantity', quantity);
//							}
//							if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'))){
//								nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code', makeNumber);
//								}
//							nlapiCommitLineItem('inventoryassignment');																		
////					// �V���A��
////					} else if (itemValues.isserialitem=='T') {
////						//for(var i=1;i<quantity+1;i++){
////							
////								//nlapiSelectNewLineItem('inventoryassignment');
////								nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',receiptinventorynumber);
////								nlapiSetCurrentLineItemValue('inventoryassignment', 'inventorystatus',defaultInventoryStatus);
////								nlapiSetCurrentLineItemValue('inventoryassignment', 'quantity', quantity);
////								//nlapiCommitLineItem('inventoryassignment');				
////						//}			
////					}	
//					updateArray.push([numberingId,numbering,itemMake,receiptinventorynumber]);
//				}
//			}	
//    	}   	 	
//    }
    
    /************************/
//}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
	if(name=='custrecord_djkk_maker_serial_code'||name=='custrecord_djkk_control_number'){
		if(!isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'))
				&&!isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'))){
		alert('�u���[�J�[�������b�g�ԍ��v�Ɓu���[�J�[�V���A���ԍ��v�𓯎��ɓ��͂��邱�Ƃ͂ł��܂���B');	
		}	
		var itemId = nlapiGetFieldValue('item');
		if (!isEmpty(itemId)) {
				var itemValues = nlapiLookupField('item', itemId, [ 'islotitem','isserialitem' ]);
					
					// ���b�g�ԍ�
			if (itemValues.islotitem=='T') {
				if(name=='custrecord_djkk_control_number'){
					if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'))){
					alert('���b�g�A�C�e���Ȃ̂ŁA�u���[�J�[�������b�g�ԍ��v����͂��Ă��������B');
					}
					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number','',false,true);
				}
			   } else if (itemValues.isserialitem=='T') {
					if(name=='custrecord_djkk_maker_serial_code'){
						if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'))){
						alert('�V���A���A�C�e���Ȃ̂ŁA�u���[�J�[�V���A���ԍ��v����͂��Ă��������B');
						}
						nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code','',false,true);
					}
			   }
			 }			
	}
	if(name=='expirationdate'){
	var itemId = nlapiGetFieldValue('item');
	if (!isEmpty(itemId)) {		
		if(nobbdbo=='T'){
			var expirationdate=nlapiGetCurrentLineItemValue('inventoryassignment', 'expirationdate');
			if(!isEmpty(expirationdate)){
			 nlapiSetCurrentLineItemValue('inventoryassignment', 'expirationdate',null, false, true);
			 alert('�uNo BBD�v�t���O���`�F�b�N�I���̏ꍇ�A�L����������͂��Ȃ��ł��������B');
			}
		}
	 }
	}
	try{
	// ���݉�ʂ�record.type
	var recordType=getQueryVariable("subrecord_parent_tran_type");
	var invDetilquantity=getQueryVariable("quantity");
	var theidofinvdetail=getQueryVariable("id");
	if(recordType=='salesord'||recordType=='vendauth'||recordType=='vendcred'||
			recordType=='custinvc'||recordType=='estimate'||recordType=='workord'||
			recordType=='bintrnfr'||recordType=='invtrnfr'||recordType=='trnfrord'||(recordType=='invadjst'&&invDetilquantity<0)||recordType=='woissue'){
//		if(name=='custrecord_djkk_maker_serial_code'
//			||name=='custrecord_djkk_control_number'
//			||name=='custrecord_djkk_make_ymd'
//			||name=='custrecord_djkk_shipment_date'
//			||name=='custrecord_djkk_packingtype'
//			||name=='custrecord_djkk_storage_type'
//			||name=='custrecord_djkk_warehouse_code'
//			||name=='custrecord_djkk_smc_code'
//			||name=='custrecord_djkk_lot_remark'
//			||name=='custrecord_djkk_lot_memo'
//				){
//			var oldissueinventorynumber=nlapiGetCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');
//			if(!isEmpty(oldissueinventorynumber)){
//			alert('�ύX�ł��܂���');
//			nlapiCancelLineItem('inventoryassignment');
//			nlapiSetCurrentLineItemValue('inventoryassignment', 'issueinventorynumber', oldissueinventorynumber, true, true);
//			}
//		}
		if(name=='issueinventorynumber'){
			var issueinventorynumber=nlapiGetCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');
			if(!isEmpty(issueinventorynumber)){
//			var inventorydetailSearch = nlapiSearchRecord("inventorydetail",null,
//					[
//					   ["inventorynumber.internalid","anyof",issueinventorynumber], 
//					   "AND", 
//					   ["transaction.type","anyof","ItemRcpt"]
//					], 
//					[
//					   new nlobjSearchColumn("internalid").setSort(true),
//					   new nlobjSearchColumn("expirationdate"), 
//					   new nlobjSearchColumn("custrecord_djkk_make_ymd","inventoryDetailLines",null), 
//					   new nlobjSearchColumn("custrecord_djkk_shipment_date","inventoryDetailLines",null), 
//					   new nlobjSearchColumn("custrecord_djkk_control_number","inventoryDetailLines",null),
//					   new nlobjSearchColumn("custrecord_djkk_warehouse_code","inventoryDetailLines",null), 
//					   new nlobjSearchColumn("custrecord_djkk_maker_serial_code","inventoryDetailLines",null),
//					   new nlobjSearchColumn("custrecord_djkk_smc_code","inventoryDetailLines",null), 
//					   new nlobjSearchColumn("custrecord_djkk_lot_remark","inventoryDetailLines",null), 
//					   new nlobjSearchColumn("custrecord_djkk_packingtype","inventoryDetailLines",null), 
//					   new nlobjSearchColumn("custrecord_djkk_storage_type","inventoryDetailLines",null), 
//					   new nlobjSearchColumn("custrecord_djkk_lot_memo","inventoryDetailLines",null)					   					   					   					  
//					]
//					);
			var inventorydetailSearch = nlapiSearchRecord("inventorynumber",null,
					[
					   ["internalid","anyof",issueinventorynumber]
					], 
					[
					   new nlobjSearchColumn("expirationdate"), 
					   new nlobjSearchColumn("custitemnumber_djkk_make_date"), 
					   new nlobjSearchColumn("custitemnumber_djkk_shipment_date"), 
					   new nlobjSearchColumn("custitemnumber_djkk_maker_serial_number"), 
					   new nlobjSearchColumn("custitemnumber_djkk_control_number"), 
					   new nlobjSearchColumn("custitemnumber_djkk_smc_nmuber"), 
					   new nlobjSearchColumn("custitemnumber_djkk_lot_memo"), 
					   new nlobjSearchColumn("custitemnumber_djkk_lot_remark"), 
					   new nlobjSearchColumn("custitemnumber_djkk_warehouse_number")
					]
					);
			if(!isEmpty(inventorydetailSearch)){
				
			 // �L������
		     nlapiSetCurrentLineItemValue('inventoryassignment', 'expirationdate', inventorydetailSearch[0].getValue('expirationdate'), false, true);
		     
		     // DJ_�����N����
		     nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', inventorydetailSearch[0].getValue("custitemnumber_djkk_make_date"), false, true);
		     
		     // DJ_�o�׉\������
		     nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date', inventorydetailSearch[0].getValue("custitemnumber_djkk_shipment_date"), false, true);
		     
		     // DJ_�Ǘ��ԍ�
		     nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number', inventorydetailSearch[0].getValue("custitemnumber_djkk_control_number"), false, true);
		     
		     // DJ_�q�ɓ��ɔԍ�
		     nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', inventorydetailSearch[0].getValue("custitemnumber_djkk_warehouse_number"), false, true);
		     
		     // DJ_���[�J�̐����ԍ�
		     nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code', inventorydetailSearch[0].getValue("custitemnumber_djkk_maker_serial_number"), false, true); 
		    
		     // DJ_SMC�ԍ�
		     nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code', inventorydetailSearch[0].getValue("custitemnumber_djkk_smc_nmuber"), false, true); 
		    		    
		     // DJ_���b�g���}�[�N
		     nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark', inventorydetailSearch[0].getValue("custitemnumber_djkk_lot_remark"), false, true); 
		    
		     // DJ_���b�g����
		     nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo', inventorydetailSearch[0].getValue("custitemnumber_djkk_lot_memo"), false, true);
		     
		     // DJ_�׎p�敪
		    // nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_packingtype', inventorydetailSearch[0].getValue("custrecord_djkk_packingtype"), false, true);
		     
		     // DJ_�݌ɋ敪
		    // nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_storage_type', inventorydetailSearch[0].getValue("custrecord_djkk_storage_type"), false, true);
			
		     var itemId = nlapiGetFieldValue('item');
		if (!isEmpty(itemId)) {
				var quantity=nlapiGetFieldValue('quantity');
				var itemValues = nlapiLookupField('item', itemId, [ 'islotitem','isserialitem' ]);
					
					// ���b�g�ԍ�
			if (itemValues.islotitem=='T') {
		    var icoun= nlapiGetLineItemCount('inventoryassignment');
		    var lsQuantity=0;
            for(var ic=1;ic<icoun+1;ic++){
            	lsQuantity+=Number(nlapiGetLineItemValue('inventoryassignment', 'quantity', ic));
             }
		     // ����
		     nlapiSetCurrentLineItemValue('inventoryassignment', 'quantity', nlapiGetFieldValue('quantity')-lsQuantity, false, true);//!!!attention
			   } else if (itemValues.isserialitem=='T') {
				   nlapiSetCurrentLineItemValue('inventoryassignment', 'quantity', '1', false, true);//!!! attention
			   }
			 }
			}
		  }
		}
	}else if(recordType=='purchord'||recordType=='itemrcpt'||recordType=='custcred'||(recordType=='invadjst'&&invDetilquantity>=0)||recordType=='rtnauth'
			||recordType=='wocompl'||recordType=='build'||(recordType=='vendbill'&&isEmpty(theidofinvdetail))){
		
				var itemId = nlapiGetFieldValue('item');
				var quantity=nlapiGetFieldValue('quantity');
		if (!isEmpty(itemId)) {
				var quantity=nlapiGetFieldValue('quantity');
				var itemValues = nlapiLookupField('item', itemId, [ 'islotitem','isserialitem' ]);
					
					// ���b�g�ԍ�
			if (itemValues.islotitem=='T') {
				if(name=='custrecord_djkk_control_number'){
					if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'))){
					alert('���b�g�A�C�e���Ȃ̂ŁA�u���[�J�[�������b�g�ԍ��v����͂��Ă��������B');
					}
					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number','',false,true);
				}
				if(name=='custrecord_djkk_maker_serial_code'){
					//changed by geng add start U405
					var inventoryadjustmentType = getQueryVariable("subrecord_parent_tran_type");
					var inventoryadjustmentQuantity = getQueryVariable("quantity");
					var number=nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
					var sub = nlapiGetFieldValue('customform');
					//changed by geng add end U405
					var makeNumber=nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');
				//*if(!isEmpty(makeNumber)){
					var itemMake=NumberTxt;//makeNumber+nlapiGetFieldText('item');
//					var numberingId='';
//					var numberSearch = nlapiSearchRecord("customrecord_djkk_inventorydetail_number",null,
//							[
//							   ["custrecord_djkk_invnum_item_make","is",itemMake]
//							], 
//							[
//							    new nlobjSearchColumn("internalid"), 
//                                new nlobjSearchColumn("custrecord_djkk_invnum_bumber")
//							]
//							);
//					var numbering=1;
//					
//					if(!isEmpty(numberSearch)){
//						numberingId=numberSearch[0].getValue("internalid");
//						numbering=Number(numberSearch[0].getValue("custrecord_djkk_invnum_bumber"))+1;
//					}
					numbering++;
					var receiptinventorynumber =  itemMake+ prefixInteger(parseInt(numbering), parseInt(TheMinimumdigits));	
					
//					changed by song add start U814 10/14
					var createdfromId = getQueryVariable("subrecord_transform_from_parent_id"); 
					var createdfromType = getQueryVariable("subrecord_transform_from_parent_tran_type");
					if(createdfromType == 'purchord'){
						var createdfrom = nlapiLoadRecord('purchaseorder',createdfromId);
						var intercotransaction = createdfrom.getFieldValue('intercotransaction');
					}else if(createdfromType == 'rtnauth'){
						var createdfrom = nlapiLoadRecord('returnauthorization',createdfromId);
						var intercotransaction = createdfrom.getFieldValue('intercotransaction');
					}
					if((inventoryadjustmentType == 'itemrcpt') && (!isEmpty(createdfrom)) && (!isEmpty(intercotransaction))){
						var num =  nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
						nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', num,false,true);
						nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',num,false,true);
					}else if(inventoryadjustmentType=='invadjst'&&inventoryadjustmentQuantity>=0&&!isEmpty(number)&&(sub=='78' || sub=='95')){
						var num =  nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
						nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', num,false,true);
						nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',num,false,true);
					}else{
						nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',receiptinventorynumber,false,true);
						nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code',receiptinventorynumber,false,true);
					}
//					changed by song add end U814 10/14
					
					
					
					
					
					//changed by geng add start U405
//					if(inventoryadjustmentType=='invadjst'&&inventoryadjustmentQuantity>=0&&!isEmpty(number)&&(sub=='78' || sub=='95')){
//						
//						nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',number,false,true);
//						nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code',number,false,true);
//					}else{
					//changed by geng add end U405
//							nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',receiptinventorynumber,false,true);
//							nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code',receiptinventorynumber,false,true);
//					}
							/*inventorystatus DELECT change by ycx 2021.10.05
							if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'inventorystatus'))){
							nlapiSetCurrentLineItemValue('inventoryassignment', 'inventorystatus',defaultInventoryStatus,false,true);
							}*/
							if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'quantity'))){
							nlapiSetCurrentLineItemValue('inventoryassignment', 'quantity', quantity,false,true);
							}
							
					//updateArray.push([numberingId,numbering,itemMake,receiptinventorynumber]);
			//	}
			}	
//					// �V���A��
					} else if (itemValues.isserialitem=='T') {
						if(name=='custrecord_djkk_maker_serial_code'){
							if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'))){
							alert('�V���A���A�C�e���Ȃ̂ŁA�u���[�J�[�V���A���ԍ��v����͂��Ă��������B');
							}
							nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code','',false,true);
						}
						if(name=='custrecord_djkk_control_number'){
							var serial=nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');
							if(!isEmpty(serial)){
								nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',serial,false,true);
								nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code',serial,false,true);
								/*inventorystatus DELECT change by ycx 2021.10.05
								if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'inventorystatus'))){
								nlapiSetCurrentLineItemValue('inventoryassignment', 'inventorystatus',defaultInventoryStatus,false,true);
								}*/
								if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'quantity'))){
								nlapiSetCurrentLineItemValue('inventoryassignment', 'quantity', quantity,false,true);
								}
							}
						}
					}
					
		}
	}
	if(name=='receiptinventorynumber'){
//		if(nlapiGetUser()!='5'&&nlapiGetUser()!='116'&&nlapiGetUser()!='324'){
			//changed by geng add start U405 07/15
//			changed by song add start U814 10/14
			var sub = nlapiGetFieldValue('customform');
			var inventoryadjustmentType = getQueryVariable("subrecord_parent_tran_type");
			var inventoryadjustmentUnit = getQueryVariable("quantity");
			
			var createdfromId = getQueryVariable("subrecord_transform_from_parent_id"); 
			var createdfromType = getQueryVariable("subrecord_transform_from_parent_tran_type");
//			alert(createdfromType);
			if(createdfromType == 'purchord'){
				var createdfrom = nlapiLoadRecord('purchaseorder',createdfromId);
				var intercotransaction = createdfrom.getFieldValue('intercotransaction');
//				var inventoryadjustmentType = getQueryVariable("subrecord_parent_tran_type");
			}else if(createdfromType == 'rtnauth'){
				var createdfrom = nlapiLoadRecord('returnauthorization',createdfromId);
				var intercotransaction = createdfrom.getFieldValue('intercotransaction');
//				var inventoryadjustmentType = getQueryVariable("subrecord_parent_tran_type");
			}
		
			if((inventoryadjustmentType == 'invadjst') && (inventoryadjustmentUnit>=0)){//&&(sub=='78' || sub=='95')){
				var num =  nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
				nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', num,false,true);
			}else if((inventoryadjustmentType == 'itemrcpt') && (!isEmpty(createdfrom)) && (!isEmpty(intercotransaction))){
				var num =  nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
				nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', num,false,true);
			}else if (inventoryadjustmentType == 'rtnauth' && sub == '78'){//CH391 �ԕi�݌ɏڍׁA�����̊Ǘ��ԍ�����͉ɂ���B
				var num =  nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
				nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', num,false,true);
			}
			else{
//				console.log('createdfromType =='+ createdfromType +',sub =='+ sub)
				alert('�u�V���A��/���b�g�ԍ��v�͎����̔Ԃł���A�蓮�œ��͂��邱�Ƃ͂ł��܂���B');
				nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', '',false,true);
			}	
//			changed by song add end U814 10/14
			//changed by geng add end U405
		  //old
			//alert('�u�V���A��/���b�g�ԍ��v�͎����̔Ԃł���A�蓮�œ��͂��邱�Ƃ͂ł��܂���B');
			//nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', '',false,true);
//		}
		//nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber'),false,true);
	}
	if(name=='custrecord_djkk_make_ymd'||name=='expirationdate'||name=='custrecord_djkk_smc_code'){
	var itemId=nlapiGetFieldValue('item');
	if(!isEmpty(itemId)){
		// �A�C�e���}�X�^.DJ_Shelf Life�iDays�j/�A�C�e���}�X�^.DJ_�o�׉\���ԁiDays�j
		var itemValues=nlapiLookupField('item', itemId, ['custitem_djkk_shelf_life','custitem_djkk_warranty_month','custitem_djkk_smc_sub_manager_flg']);
	    var shelfLife=Number(itemValues.custitem_djkk_shelf_life);
	    if(shelfLife=='NaN'){
	    	shelfLife=0;
	    }
	    var warrantyMonth=Number(itemValues.custitem_djkk_warranty_month);
        if(warrantyMonth=='NaN'){
        	warrantyMonth=0;
	    } 	
	if(name=='custrecord_djkk_smc_code'){
		var subflg = itemValues.custitem_djkk_smc_sub_manager_flg;
		if(subflg=='T'){
			 if(!isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'))){
			 alert('�A�C�e���}�X�^.SMC/Sublot�Ǘ��t���O���`�F�b�N�I���̏ꍇ�A���͕s�ł��B');
			 nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code', '', false, true);
		 }
		}
	}
	
	// �����N����
	if(name=='custrecord_djkk_make_ymd'&&nobbdbo=='F'){
	var ymd=nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');
	if(!isEmpty(ymd)){
		var expirationdates=dateAddDays(ymd, shelfLife);
		// �L������
		nlapiSetCurrentLineItemValue('inventoryassignment', 'expirationdate',expirationdates,false,true);
		if(!isEmpty(expirationdates)){
			
			// �o�׉\������
			nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date', dateAddDays(expirationdates, -warrantyMonth),false,true);
		  }
	  }
	}
	
	// �L������
	if(name=='expirationdate'&&nobbdbo=='F'){
		var expirationdate=nlapiGetCurrentLineItemValue('inventoryassignment', 'expirationdate');
		if(!isEmpty(expirationdate)){
						
			// �o�׉\������
			nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date', dateAddDays(expirationdate, -warrantyMonth),false,true);
		  }
		}
	  }
	}
	
	}catch(e){}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {

		// ���݉�ʂ�record.type
	var recordType = getQueryVariable("subrecord_parent_tran_type");
	if (recordType == 'purchord' || recordType == 'itemrcpt'||recordType=='invadjst'||recordType=='build') {
		nlapiSubmitField('customrecord_djkk_inventorydetail_number',submitId, 'custrecord_djkk_invnum_bumber',numbering);
//		var listArray = new Array();
//		var count = nlapiGetLineItemCount('inventoryassignment');
//		for (var j = 1; j < count + 1; j++) {
//			listArray.push(nlapiGetLineItemValue('inventoryassignment','receiptinventorynumber', j));
//		}
//		if (!isEmpty(updateArray)) {
//			for (var i = 0; i < updateArray.length; i++) {
//				try {
//					if (listArray.indexOf(updateArray[i][3]) > -1) {
//						var id = updateArray[i][0];
//						if (!isEmpty(id)) {
//							nlapiSubmitField('customrecord_djkk_inventorydetail_number',id, 'custrecord_djkk_invnum_bumber',updateArray[i][1]);
//						} else {
//							var record = nlapiCreateRecord('customrecord_djkk_inventorydetail_number');
//							record.setFieldValue('custrecord_djkk_invnum_item_make',updateArray[i][2]);
//							record.setFieldValue('custrecord_djkk_invnum_bumber', '1');
//							nlapiSubmitRecord(record, false, true);
//						}
//					}
//
//				} catch (e) {
//				}
//			}
//		}
	}
	return true;
}

//function iclSubmit(){
//	var icltype=getQueryVariable("icltype");
//	var icclId=getQueryVariable("icclId");
//	if(icltype=='T'){
//		if(!isEmpty(icclId)){
//			var djInventoryDetailsRecord=nlapiCreateRecord('customrecord_djkk_inventory_details');
//			djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_item', nlapiGetFieldValue('item'));
//			djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_quantity', nlapiGetFieldValue('quantity'));
//			djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_item_explanation', nlapiGetFieldValue('itemdescription'));
//			djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_unit', nlapiGetFieldValue('unit'));
//			
//			var count=nlapiGetLineItemCount('inventoryassignment');
//			for(var i=1;i<count+1;i++){
//				nlapiSelectLineItem('inventoryassignment', i);
//				djInventoryDetailsRecord.selectNewLineItem('recmachcustrecord_djkk_inventory_details');
//				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
//						'custrecord_djkk_ditl_seriallot_number', 
//						nlapiGetCurrentLineItemText('inventoryassignment', 'issueinventorynumber'));
//				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
//						'custrecord_djkk_ditl_quantity', 
//						nlapiGetCurrentLineItemValue('inventoryassignment', 'quantity'));
//				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
//						'custrecord_djkk_ditl_internalcode', 
//						nlapiGetCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
////				djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
////						'', 
////						nlapiGetCurrentLineItemValue('inventoryassignment', ''));
//				djInventoryDetailsRecord.commitLineItem('recmachcustrecord_djkk_inventory_details');	
//			}									
//			var djInventoryDetailsId=nlapiSubmitRecord(djInventoryDetailsRecord, false, true);
//			if(!isEmpty(djInventoryDetailsId)){
//			var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_inventory_details',djInventoryDetailsId, 'VIEW');
//			nlapiSubmitField('customrecord_djkk_ic_change_l', icclId, 'custrecord_djkk_ica_detail', theLink);
//			window.ischanged = false;
//			window.close();
//			}
//		}
//	}
//	
//}


/**
 * �����̔�
 * 
 */
function automaticNumbering(){
	
	// �݌ɏڍ�ID
	var id=getQueryVariable("id");
	
	// ���݉�ʂ�record.type
	var recordType=getQueryVariable("subrecord_parent_tran_type");//itemrcpt/purchord
	
	// ���݉�ʂ�record.id
	var recordID=getQueryVariable("transactionid");
	
	// ���݉�ʂ�record.item.lineid
	var lineid=getQueryVariable("lineid");
	
	// ���t
	var trandateDate='';
	var trandate=decodeURIComponent(getQueryVariable("trandate"));
	if(!isEmpty(trandate)){
	trandateDate=nlapiDateToString(nlapiStringToDate(trandate));
	}

	// �ꏊID
	var locationId=getQueryVariable("location");
	
	// ���݉�ʂ̍쐬����record.type
	var tran_type=getQueryVariable("subrecord_transform_from_parent_tran_type");
	
    // ���݉�ʂ̍쐬����record.id
	var tran_id=getQueryVariable("subrecord_transform_from_parent_id");
	
	// ���݉�ʂ̍쐬��record.item.lineid
	var tran_lineid=getQueryVariable("orderline");
	
	var itemId = nlapiGetFieldValue('item');
	var quantity=nlapiGetFieldValue('quantity');
	if (!isEmpty(itemId)) {
		var quantity=nlapiGetFieldValue('quantity');
		var itemValues = nlapiLookupField('item', itemId, [ 'islotitem','isserialitem' ]);
		var makeNumber='DJ_���[�J�̐����ԍ������̔ԑ�|'
		//var numbering=nlapiLookupField('customrecord_djkk_itemmaster_numbering', 11,'custrecord_djkk_itemmaster_nb_number');
				
		// ���b�g�ԍ�
		if (itemValues.islotitem=='T') {
			
			if(recordType=='purchord'){
				var itemAutomatic = makeNumber+nlapiGetFieldText('item') + prefixInteger(parseInt(1), parseInt(TheMinimumdigits));
				nlapiSelectNewLineItem('inventoryassignment');
				nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',itemAutomatic);
				/*inventorystatus DELECT change by ycx 2021.10.05
				nlapiSetCurrentLineItemValue('inventoryassignment', 'inventorystatus',defaultInventoryStatus);
				*/
				nlapiSetCurrentLineItemValue('inventoryassignment', 'quantity', quantity);
				nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code',makeNumber);
				nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', trandateDate);
				nlapiCommitLineItem('inventoryassignment');
			}else if(recordType=='itemrcpt'){
				
				var itemAutomatic = makeNumber+nlapiGetFieldText('item') + prefixInteger(parseInt(1), parseInt(TheMinimumdigits));
				nlapiSelectNewLineItem('inventoryassignment');
				nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',itemAutomatic);
				/*inventorystatus DELECT change by ycx 2021.10.05
				nlapiSetCurrentLineItemValue('inventoryassignment', 'inventorystatus',defaultInventoryStatus);
				*/
				nlapiSetCurrentLineItemValue('inventoryassignment', 'quantity', quantity);
				nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code',makeNumber);
				nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', trandateDate);
				nlapiCommitLineItem('inventoryassignment');
			}
			
			
		// �V���A��
		} else if (itemValues.isserialitem=='T') {
			//for(var i=1;i<quantity+1;i++){
			if(recordType=='purchord'){
				
					var itemAutomaticpo = makeNumber+nlapiGetFieldText('item') + prefixInteger(parseInt(1), parseInt(TheMinimumdigits));
					nlapiSelectNewLineItem('inventoryassignment');
					nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',itemAutomaticpo);
					/*inventorystatus DELECT change by ycx 2021.10.05
					nlapiSetCurrentLineItemValue('inventoryassignment', 'inventorystatus',defaultInventoryStatus);
					*/
					nlapiSetCurrentLineItemValue('inventoryassignment', 'quantity', quantity);
					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code',makeNumber);
					nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', trandateDate);
					nlapiCommitLineItem('inventoryassignment');
			}else if(recordType=='itemrcpt'){
				var itemAutomaticit = makeNumber+nlapiGetFieldText('item') + prefixInteger(parseInt(1), parseInt(TheMinimumdigits));
				nlapiSelectNewLineItem('inventoryassignment');
				nlapiSetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',itemAutomaticit);
				/*inventorystatus DELECT change by ycx 2021.10.05
				nlapiSetCurrentLineItemValue('inventoryassignment', 'inventorystatus',defaultInventoryStatus);
				*/
				nlapiSetCurrentLineItemValue('inventoryassignment', 'quantity', quantity);
				nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code',makeNumber);
				nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', trandateDate);
				nlapiCommitLineItem('inventoryassignment');	
			}
			//}			
		}				
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
	var itemId = nlapiGetFieldValue('item');
	if (!isEmpty(itemId)) {
		var subflg = nlapiLookupField('item', itemId, 'custitem_djkk_smc_sub_manager_flg');
		if(subflg=='T'){
			 if(!isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'))){
			 alert('�A�C�e���}�X�^.SMC/Sublot�Ǘ��t���O���`�F�b�N�I���̏ꍇ�A���͕s�ł��B');
			 nlapiSetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code', '', false, true);
			 return false;
		 }
		}
	}
	var recordType=getQueryVariable("subrecord_parent_tran_type");
	if(recordType=='salesord'){


	}
	
// if(isEmpty(nlapiGetCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'))){
//	 alert('���̃t�B�[���h�ɒl����͂��Ă�������:DJ���[�J�̐����ԍ�');
//	 return false;
 //}
    return true;
}
