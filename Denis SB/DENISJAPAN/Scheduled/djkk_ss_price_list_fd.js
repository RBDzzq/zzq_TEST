/**
 * 
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/01/17    
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	// add by song 2023/01/16 CH051 start
	try{
		nlapiLogExecution('debug', '開始', '開始');
		
		var data = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_price_recordid');
		nlapiLogExecution('debug','data',data);
		if(!isEmpty(data)){
			
			var strArr = data.split(',');
			var priceIdArr = new Array();
			for(var i = 0 ; i < strArr.length ; i++){
				governanceYield();
				if(isEmpty(strArr[i])){
					continue;
				}
				var recordArr = strArr[i].split('_');
				var rec = nlapiLoadRecord('customrecord_djkk_price_list_details_fd', recordArr[0]);
				nlapiLogExecution('debug', 'recordArr[0]', recordArr[0]);
				if(recordArr[1] == 'T'){
					rec.setFieldValue('isinactive','T');
				}
				try{
					nlapiSubmitRecord(rec);			
				}catch(e){
					nlapiLogExecution('ERROR', 'エラー', e);
				}
				
			}	
			
		}
		
	}catch(e){
		nlapiLogExecution('ERROR', 'エラー', e.message);
		}
	// add by song 2023/01/16 CH051 end
}
	
	
	
