/**
 * Module Description
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
	
	nlapiLogExecution('debug', '', '請求書一括処理開始');
	var param = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_inv_change_list_param');
	nlapiLogExecution('debug', 'パラメータ', param);
	

	var invArr = new Array();
	
	var invArr = param.split(',');
	for(var i = 0 ; i < invArr.length ; i++){
		governanceYield();
		if(isEmpty(invArr[i])){
			continue;
		}
		var lineArr = invArr[i].split('_');
		
		var rec = nlapiLoadRecord('invoice', lineArr[0]);
		
		if(lineArr[1] == '-999'){
			rec.setFieldValue('shippingcost', lineArr[2]);
		}else{
			rec.setLineItemValue('item', 'rate', lineArr[1], lineArr[2]);
		}
	
		if(rec.getFieldValue('custbody_djkk_sales_checked_flag') == 'F'){
			rec.setFieldValue('custbody_djkk_sales_checked_flag', 'T');
		}

	
		if(rec.getFieldValue('approvalstatus') == '1'){
			rec.setFieldValue('approvalstatus', '2');
		}
		
		
		
		var so = rec.getFieldValue('createdfrom');
		
		try{
			nlapiSubmitRecord(rec);			
		}catch(e){
			nlapiLogExecution('ERROR', 'エラー', e);
		}
		
		
		//作成元存在場合　注文書を更新する。
		if(!isEmpty(so )){
			
			var soRec = nlapiLoadRecord('salesorder', so);
			
			if(lineArr[1] == '-999'){
				soRec.setFieldValue('shippingcost', lineArr[2]);
			}else{
				soRec.setLineItemValue('item', 'rate', lineArr[1], lineArr[2]);
			}
			try{
				nlapiSubmitRecord(soRec);				
			}catch(e){
				nlapiLogExecution('ERROR', 'エラー', e);
			}
		}
		
	}
		
	nlapiLogExecution('debug', '', '請求書一括処理終了');
}
