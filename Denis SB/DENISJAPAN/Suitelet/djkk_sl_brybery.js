/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Sep 2022     rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	try{
	nlapiLogExecution('debug', 'test', 'test');
	var recId = request.getParameter('icId');
	var recordObj = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
	var sub = recordObj.getFieldValue('custrecord_djkk_bribery_subsidiary');//�q���
	var vendor = recordObj.getFieldValue('custrecord_djkk_bribery_vendor');//DJ_�d����
	var account = recordObj.getFieldValue('custrecord_djkk_bribery_account');//DJ_����Ȗ�
	var currency = recordObj.getFieldValue('custrecord_djkk_bribery_currency');//DJ_�ʉ�
	var amount = recordObj.getFieldValue('custrecord_djkk_bribery_amount');//DJ_���z
	var exchangerate = recordObj.getFieldValue('custrecord_djkk_bribery_exchangerate');//DJ_�בփ��[�g
	var date = recordObj.getFieldValue('custrecord_djkk_bribery_now_date');//DJ_���t
	var memo = recordObj.getFieldValue('custrecord_djkk_bribery_memo');//DJ_����
	var vendorNum = recordObj.getFieldValue('custrecord_djkk_bribery_vendor_num');//DJ_�d����̃N���W�b�g�ԍ�
	
	var count=recordObj.getLineItemCount('recmachcustrecord_djkk_brybery_page');  //����
	var itemValue = [];
	for(var i=1;i<count+1;i++){
		recordObj.selectLineItem('recmachcustrecord_djkk_brybery_page', i);
		var itemId = recordObj.getCurrentLineItemValue('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_detail_item');
		var quantity = recordObj.getCurrentLineItemValue('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_detail_quantity');
		var vendorName = recordObj.getCurrentLineItemValue('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_detail_vendor');
		var unity = recordObj.getCurrentLineItemValue('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_detail_unity');
		var rate = recordObj.getCurrentLineItemValue('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_detail_rate');
//		var amount = recordObj.getCurrentLineItemValue('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_detail_amount');
//		var rateCode = recordObj.getCurrentLineItemValue('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_detail_rate_code');
		var location = recordObj.getCurrentLineItemValue('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_detail_location');
		var adminNum = recordObj.getCurrentLineItemText('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_admin_number');	
		var adminNumv = recordObj.getCurrentLineItemValue('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_admin_number');
		var binner = recordObj.getCurrentLineItemValue('recmachcustrecord_djkk_brybery_page','custrecord_djkk_brybery_binnery_num');
		itemValue.push({
			itemId:itemId,
			quantity:quantity,
			vendorName:vendorName,
			unity:unity,
			rate:rate,
//			amount:amount,
//			rateCode:rateCode,
			location:location,
			adminNum:adminNum,
			adminNumv:adminNumv,
			binner:binner
		})
	}
	var objRecord = nlapiCreateRecord('vendorcredit');
	if(sub==SUB_SCETI||sub==SUB_DPKK){
		objRecord.setFieldValue('customform','134');
	}else{
		objRecord.setFieldValue('customform','147');
	}
	
	objRecord.setFieldValue('entity',vendor);
	objRecord.setFieldValue('subsidiary',sub);
//	objRecord.setFieldValue('usertotal',amount);
	objRecord.setFieldValue('currency',currency);
	objRecord.setFieldValue('exchangerate',exchangerate);
	objRecord.setFieldValue('trandate',date);
	objRecord.setFieldValue('memo',memo);
	objRecord.setFieldValue('custbody_djkk_po_vendor_credino',vendorNum);
	objRecord.setFieldValue('account',account);
	
	for(var j=0;j<itemValue.length;j++){
		objRecord.selectNewLineItem('item'); //����
		objRecord.setCurrentLineItemValue('item', 'item', itemValue[j].itemId);//item
		objRecord.setCurrentLineItemValue('item', 'vendorname', itemValue[j].vendorname);//
		objRecord.setCurrentLineItemValue('item', 'quantity', itemValue[j].quantity);//
		objRecord.setCurrentLineItemValue('item', 'location', itemValue[j].location);//
		objRecord.setCurrentLineItemValue('item', 'rate', itemValue[j].rate);//
		var inventoryDetail = objRecord.createCurrentLineItemSubrecord('item','inventorydetail');

		inventoryDetail.selectNewLineItem('inventoryassignment');
		inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',itemValue[j].adminNum);
		if(!isEmpty(itemValue[j].binner)){
			inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', itemValue[j].binner);
		}
		
		inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', itemValue[j].quantity);//����
		inventoryDetail.commitLineItem('inventoryassignment');
		inventoryDetail.commit();
		objRecord.commitLineItem('item');
	}
	var reId=nlapiSubmitRecord(objRecord);
	nlapiLogExecution('debug','id',reId);
	var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
	record.setFieldValue('custrecord_djkk_over_id',reId);
	nlapiSubmitRecord(record);
	nlapiSetRedirectURL('RECORD', 'vendorcredit',reId, 'VIEW');			

	}
	catch(e){
		nlapiLogExecution('error', '�G���[', e.message);
		var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
		record.setFieldValue('custrecord_djkk_bribery_error',e.message);
		nlapiSubmitRecord(record);		
		response.write('�ُ픭��:'+ e.message);
	}
}
