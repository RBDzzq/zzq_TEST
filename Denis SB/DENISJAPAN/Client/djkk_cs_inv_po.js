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
	nlapiLogExecution('debug','', '�J�n')
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
					    				    inventorynumber = inventorynumberSearch[0].getValue("inventorynumber");//DJ_���[�J�[�������b�g�ԍ�
			    				    	}
			    				    nlapiLogExecution('debug','receiptinventorynumber',receiptinventorynumber);
			    				    var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//�L������
			    				    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_���[�J�[�������b�g�ԍ�
			    				    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_�����N����
			    				    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_�o�׉\������
			    				    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_�q�ɓ��ɔԍ�
			    				    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC�ԍ�
			    				    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_���b�g����		
			    				    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_���b�g���}�[�N
//			    				    var lotRemark = inventoryDetail.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',i)
			    				    var quantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity');//����		
			    				    var controlNumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_���[�J�[�V���A���ԍ�	
			    				    nlapiLogExecution('debug','expirationdate', expirationdate);
			    				    //���b�g�ԍ��̃��R�[�h�ݒ�
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
				    				    	invReordId = inventorynumberSearch[0].getValue("internalid");//���b�g�ԍ�internalid
				    				    	inventorynumber = receiptinventorynumber;
			    				    }
			    				    nlapiLogExecution('debug','show me the invReordId',invReordId);
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
			    				    inventorynumberReord.setFieldValue('custitemnumber_djkk_quantity',quantity);//����
			    				    nlapiSubmitRecord(inventorynumberReord);
								}catch(e){
									nlapiLogExecution('ERROR', '�G���[', "�V�X�e�����s���Ɉُ킪�������܂����B�ُ팳�F'�V���A��/���b�g�ԍ��F"+inventorynumber+"'�B��̓I�Ȉُ���F'"+e.message+"'�B");
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
