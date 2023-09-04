/**
 * 引当マニュアル調整
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jul 2021     admin
 *
 */

/**
 * @param {String}
 *            type Context Types: scheduled, ondemand, userinterface, aborted,
 *            skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug', '', '引当マニュアル調整開始');

	var recId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_hikiate_adjust_wok_id');
	var param = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_hikiate_adjust_param');

	nlapiLogExecution('DEBUG', recId, param)
	
	var _paramArr = new Array();
	_paramArr = param.split(',');
	var paramArr = new Array();
	for(var i = 0 ; i  < _paramArr.length ; i++){
		if(!isEmpty(_paramArr[i])){
			var __paramArr = _paramArr[i].split('_');
			var detial = {};
			detial.item = __paramArr[0];
			detial.inv_no = __paramArr[1];
			detial.adjust_count =__paramArr[2];
			paramArr.push(detial);
		}
	}
	
	
	//在庫詳細更新する
	var rec = nlapiLoadRecord('workorder', recId);
	var recLineCount = rec.getLineItemCount('item');
	
	for(var i = 0;i<recLineCount;i++){
		rec.selectLineItem('item', i+1);
		var item = rec.getCurrentLineItemValue('item', 'item');
		var inventorydetailavail = rec.getCurrentLineItemValue('item','inventorydetailavail')
		if(inventorydetailavail == 'T'){
			var inventoryDetail=rec.editCurrentLineItemSubrecord('item','inventorydetail');	
			if(!isEmpty(inventoryDetail)){	
				
				var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
				for(var k = 0 ;k < invCount ; k++){
					inventoryDetail.removeLineItem('inventoryassignment',1);
				}
				
				for(var k = 0 ; k < paramArr.length ; k++){
					if(paramArr[k].item == item){

						inventoryDetail.selectNewLineItem('inventoryassignment');
						inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',paramArr[k].inv_no);
						inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', paramArr[k].adjust_count);
						inventoryDetail.commitLineItem('inventoryassignment');
					}
				}
				inventoryDetail.commit();
			}else{
				inventoryDetail = rec.createCurrentLineItemSubrecord('item','inventorydetail');
				for(var k = 0 ; k < paramArr.length ; k++){
					if(paramArr[k].item == item){

						inventoryDetail.selectNewLineItem('inventoryassignment');
						inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',paramArr[k].inv_no);
						inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', paramArr[k].adjust_count);
						inventoryDetail.commitLineItem('inventoryassignment');
					}
				}
				inventoryDetail.commit();
			}

		}
		rec.commitLineItem('item');
	}
	
	nlapiSubmitRecord(rec)
	

	nlapiLogExecution('debug', '', '引当マニュアル調整終了');
}
