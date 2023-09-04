/**
 * ���v������FLG�X�VSS
 *
 * Version    Date            Author           Remarks
 * 1.00       2303/02/07
 *
 */

	
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
 function scheduled(type) {
	// changed add by song CH247 start
	 nlapiLogExecution('DEBUG', 'start', 'start');
	 var recordStr = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_invoice_intid');// ID-type
	 var invoiceFlg = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_invoice_flg');// FLG
	 
	 nlapiLogExecution("debug", "recordStr", recordStr);
 
	 if(!isEmpty(recordStr)){
		 var invArr = recordStr.split(',');
		 for(var i = 0 ; i < invArr.length ; i++){
			 governanceYield();
			 if(isEmpty(invArr[i])){
					continue;
			 }
			 var strArr = invArr[i].split('_');
			 if(strArr[1] == 'CustInvc'){
				 var invoiceRecord = nlapiLoadRecord('invoice', strArr[0]);
				 if(invoiceFlg == 'T'){
				 	invoiceRecord.setFieldValue('custbody_djkk_hold_flg', 'F');
				 }else{
				 	invoiceRecord.setFieldValue('custbody_djkk_hold_flg', 'T');
				 } 
				 try{
					nlapiSubmitRecord(invoiceRecord);			
				 }catch(e){
					nlapiLogExecution('ERROR', '�G���[', e);
				 }
				 
			 }else{
				 var creditmemoRecord = nlapiLoadRecord('creditmemo', strArr[0]);
				 if(invoiceFlg == 'T'){
				 	creditmemoRecord.setFieldValue('custbody_djkk_hold_flg', 'F');
				 }else{
				 	creditmemoRecord.setFieldValue('custbody_djkk_hold_flg', 'T');
				 } 
				 try{
					nlapiSubmitRecord(creditmemoRecord);			
				 }catch(e){
					nlapiLogExecution('ERROR', '�G���[', e);
				 }
			 }
	 
			 nlapiLogExecution('DEBUG', '��������', '��������');
		 }
	 }
	// changed add by song CH247 end
 }