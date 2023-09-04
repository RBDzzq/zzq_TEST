/**
 * 合計請求書リセット
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Aug 2021     
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {

	nlapiLogExecution('debug', '合計請求書レコード更新', '開始');
	
	var id = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_total_inv_status_id');
	nlapiLogExecution('DEBUG', 'パラメータ', id);
		
	var rec = nlapiLoadRecord('customrecord_djkk_invoice_summary', id);
	var invList = rec.getFieldValue('custrecord_djkk_inv_list');
 	var creditmemoList = rec.getFieldValue('custrecord_djkk_creditmemo_list');

 	
 	var invArr = new Array();
 	var creditmemoArr = new Array();
 	if(!isEmpty(invList)){
 		invArr = invList.split(',');
 	}
 	
 	if(!isEmpty(creditmemoList)){
 		creditmemoArr = creditmemoList.split(',');
 	}
 	nlapiLogExecution('DEBUG', '請求書', invArr)
 	for(var i = 0 ; i < invArr.length ; i ++){
 		governanceYield();
 		if(isEmpty(invArr[i])){
 			continue;
 		}
 		try{
 			nlapiSubmitField('invoice', invArr[i], ['custbody_djkk_invoicetotal_flag','custbody_djkk_totalinv_no'], ['F','']);
 		}
 		catch(e){
 			nlapiLogExecution('ERROR', 'エラー', e.message)
 		}
 		
 	}
 	
 	nlapiLogExecution('DEBUG', 'クレジットメモ', creditmemoArr)
 	for(var i = 0 ; i < creditmemoArr.length ; i ++){
 		governanceYield();
 		if(isEmpty(creditmemoArr[i])){
 			continue;
 		}
 		try{
 			nlapiSubmitField('creditmemo', creditmemoArr[i], ['custbody_djkk_invoicetotal_flag','custbody_djkk_totalinv_no'], ['F','']);
 		}
 		catch(e){
 			nlapiLogExecution('ERROR', 'エラー', e.message)
 		}
 	}
	
	
	rec.setFieldValue('custrecord_djkk_inv_reset_flg', 'F');
	nlapiSubmitRecord(rec);
	
	nlapiLogExecution('debug', '合計請求書レコード更新', '終了');
	
}


