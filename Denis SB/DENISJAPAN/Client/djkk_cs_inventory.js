/**
 * �݌ɒ���/�݌Ɉړ�/�ړ��`�[��ʂ�client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/09     CPC_��
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
		
	// DJ_�����
//	if (name == 'units') {
//		var unitname = nlapiGetCurrentLineItemText(type, 'units');
//		if (!isEmpty(unitname)) {							
//				nlapiSetCurrentLineItemValue(type,'custcol_djkk_conversionrate',getConversionrate(unitname));		
//		}
//	}
	
	if (name == 'units') {
		// DJ_����
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
				 alert('�V�����Ǘ��ԍ����m�肵����A�A�uDJ_�ύX���R�v��K�{����');
				 return false;
			}
//			}else{
//				var invArray = [];
//				var subsidiary = nlapiGetFieldValue('subsidiary');//�q���
//				var account = nlapiGetFieldValue('account');//��������Ȗ�
//				var admitRe = nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons');//�ύX���R
//				var item=nlapiGetCurrentLineItemValue('inventory', 'item');//item
//				var warehouse = nlapiGetFieldValue('location');  //�ꏊ   
//				var inventoryqty = nlapiGetCurrentLineItemValue('inventory', 'quantityonhand');  //�݌ɐ���   
//				var adjqty = nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby');  //�ړ����� 
//				var inventorydetailFlag = nlapiGetCurrentLineItemValue("inventory","inventorydetailavail");
//				nlapiLogExecution('debug','account',account)
//				if(inventorydetailFlag == 'T'){
//					//�݌ɏڍאݒ�
//					var inventoryDetail = nlapiEditCurrentLineItemSubrecord('inventory','inventorydetail');
//					nlapiLogExecution('debug','inventoryDetail',inventoryDetail)
//					if(!isEmpty(inventoryDetail)){
//						nlapiLogExecution('debug','111','111')
//		  				var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
//		  				if(inventoryDetailCount != 0){
//							for(var i = 1 ;i < inventoryDetailCount+1 ; i++){
//		    				    inventoryDetail.selectLineItem('inventoryassignment',i);
//		    				    var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//�V���A��/���b�g�ԍ�
//		    				    nlapiLogExecution('debug','receiptinventorynumber',receiptinventorynumber);
//		    				    var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//�L������
//		    				    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_���[�J�[�������b�g�ԍ�
//		    				    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_�����N����
//		    				    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_�o�׉\������
//		    				    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_�q�ɓ��ɔԍ�
//		    				    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC�ԍ�
//		    				    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_���b�g����	
//		    				    var shednum =  inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber');  //�ۊǒI�ԍ�
////			    				    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_���b�g���}�[�N
//		    				    var lotRemark = inventoryDetail.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',i);
//		    				    var quantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity');//����		
//		    				    var controlNumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_���[�J�[�V���A���ԍ�
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
//				rec2.setFieldValue('trandate',  nlapiDateToString(getSystemTime())); //���t
//				rec2.setFieldValue('subsidiary',subsidiary);//�q���
//				rec2.setFieldValue('account',account);//��������Ȗ�
//				rec2.setFieldValue('custbody_djkk_change_reason', admitRe);//�ύX���R
//				rec2.selectNewLineItem('inventory'); //����
//				rec2.setCurrentLineItemValue('inventory', 'item', item);//item
//				rec2.setCurrentLineItemValue('inventory', 'adjustqtyby', adjqty);//��������   
//				rec2.setCurrentLineItemValue('inventory', 'location', warehouse);//�ꏊ
//				var inventoryDetail = rec2.createCurrentLineItemSubrecord('inventory','inventorydetail');//�݌ɏڍ�
//				for(var n = 1 ; n < invArray.length+1 ;n++){
//					inventoryDetail.selectNewLineItem('inventoryassignment');
//					if(!isEmpty(invArray[n].shednum)){
//						inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', invArray[n].shednum);
//					}
//					inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',invArray[n].inventorynumber);//�V���A��/���b�g�ԍ�
//					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', invArray[n].quantity);//����
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
//		// ��������
//		var adjustqtyby=nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby');
//		
//		// DJ_�ύX���R
//		var changeReason=nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reason');
//		
//		if(adjustqtyby!='0'&&isEmpty(changeReason)){
//			 alert('���ʕύX�́A�uDJ_�ύX���R�v��K�{����');
//			 return false;
//		}
//	}
    return true;
}
