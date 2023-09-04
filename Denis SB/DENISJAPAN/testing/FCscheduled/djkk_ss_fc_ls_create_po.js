/**
 * DJ_����������_LS
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/07/06     CPC_��
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug', 'DJ_���������� Start');
	var dataarray = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_cfp_dataarray_ls');
	
	// �A��
	var subsidiary = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_cfp_subsidiary_ls');
	nlapiLogExecution('debug', 'dataarray:', dataarray);
	nlapiLogExecution('debug', 'subsidiary:', subsidiary);
	dataarray = eval("(" + dataarray + ")");
	var vendor = dataarray['vendor'];
	var currency = dataarray['currency'];
	var memo = dataarray['memo'];
	var location = dataarray['location'];
	var creatpoDate = dataarray['creatpoDate'];
	var jsonDate = dataarray['itemList'];
	
	nlapiLogExecution('debug', 'itemList:', jsonDate);
	
	try{
		var poRecord=nlapiCreateRecord('purchaseorder');
		
		// �J�X�^���t�H�[�� :DJ_������_LS
		poRecord.setFieldValue('customform', cusform_id_po_ls);			
		poRecord.setFieldValue('trandate', creatpoDate);
		poRecord.setFieldValue('entity', vendor);
		poRecord.setFieldValue('subsidiary', subsidiary);
		poRecord.setFieldValue('currency', currency);
		poRecord.setFieldValue('memo', memo);
		poRecord.setFieldValue('location', location);
		poRecord.setFieldValue('custbody_djkk_po_fc_created', 'T');
		if(isEmpty(poRecord.getFieldValue('custbody_djkk_po_incoterms_location'))){
			poRecord.setFieldValue('custbody_djkk_po_incoterms_location', '�C���R�^�[���ꏊ��');	
		}
		
		
		var updateArray=new Array();
	
//		var jsonDate = eval("(" + itemList + ")");
		for (var i = 0; i < jsonDate.length; i++) {
			governanceYield();
		
			// fcid
			var fcid = jsonDate[i]['fcid'];
		
			// �A�C�e��
			var item = jsonDate[i]['item'];
		
			// ����
			var description = jsonDate[i]['description'];

//			// �ꏊ
//			var linelocation = jsonDate[i]['linelocation'];

//			// �d����
//			var linevendor= jsonDate[i]['linevendor'];

			// ������
			var quantity= jsonDate[i]['quantity'];

			// �P��
			var units= jsonDate[i]['units'];

//			// �����
//			var conversionrate= jsonDate[i]['conversionrate'];

//			// �P�[�X��
//			var cases= jsonDate[i]['cases'];

			// �P��
			var rate= jsonDate[i]['rate'];

			// ���z
			var amount= jsonDate[i]['amount'];

			// �ŋ��R�[�h
			var taxcode= jsonDate[i]['taxcode'];

			// ���z
			var grossamt= jsonDate[i]['grossamt'];

//			// �ʉ�
//			var currency= jsonDate[i]['currency'];

			// ��̗\���
			var expectedreceiptdate= jsonDate[i]['expectedreceiptdate'];

			// ���l
			var memo= jsonDate[i]['memo'];
			poRecord.selectNewLineItem('item');
			poRecord.setCurrentLineItemValue('item', 'item', item);
			//poRecord.setCurrentLineItemValue('item', 'custcol_djkk_item', item);
			poRecord.setCurrentLineItemValue('item', 'quantity', quantity);
			poRecord.setCurrentLineItemValue('item', 'rate',rate);
			poRecord.setCurrentLineItemValue('item', 'taxcode',taxcode);
			poRecord.setCurrentLineItemValue('item', 'location',location);
			poRecord.setCurrentLineItemValue('item', 'description',memo);
			
			poRecord.setCurrentLineItemValue('item', 'targetsubsidiary',subsidiary);
			poRecord.setCurrentLineItemValue('item', 'targetlocation',location);						
			if(!isEmpty(units)&&units!='0'){			
			poRecord.setCurrentLineItemValue('item', 'units',units.split('|')[1]);
			}
//			poRecord.setCurrentLineItemValue('item', 'custcol_djkk_conversionrate',conversionrate);
			poRecord.setCurrentLineItemValue('item', 'expectedreceiptdate',expectedreceiptdate);			
			poRecord.commitLineItem('item');
			var fcInQuantity=nlapiLookupField('customrecord_djkk_sc_forecast_ls', fcid, 'custrecord_djkk_sc_fc_ls_add');
			if(quantity>=fcInQuantity){
				updateArray.push([fcid,'T']);
				//nlapiSubmitField('customrecord_djkk_sc_forecast_ls', fcid, 'custrecord_djkk_po_ls_created', 'T');
			}else{
				updateArray.push([fcid,Number(fcInQuantity-quantity)]);
				//nlapiSubmitField('customrecord_djkk_sc_forecast_ls', fcid, 'custrecord_djkk_sc_fc_ls_add', fcInQuantity-quantity);
			}
		}
		var poid=nlapiSubmitRecord(poRecord,false,true);
		nlapiLogExecution('debug', 'poid:',poid);
		for(var s=0;s<updateArray.length;s++){
			governanceYield();
			var apA=updateArray[s];
			var upId=updateArray[s][0];	
			if(updateArray[s][1]=='T'){
				//nlapiSubmitField('customrecord_djkk_sc_forecast_ls', upId,  ['custrecord_djkk_po_ls_created','custrecord_djkk_sc_fc_ls_add'], ['T','']);
				nlapiSubmitField('customrecord_djkk_sc_forecast_ls', upId,  'custrecord_djkk_sc_fc_ls_add','');
			}else{
				nlapiSubmitField('customrecord_djkk_sc_forecast_ls', upId, 'custrecord_djkk_sc_fc_ls_add', updateArray[s][1]);
			}
		}
	}catch(e){
		nlapiLogExecution('debug', 'error:',e);
	}
}
