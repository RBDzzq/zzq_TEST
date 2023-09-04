/**
 * トランザクション削除テーブル
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/11/28     CPC_苑
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	 var deleteRecordType = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_deleterecordtype');
	 var deleteRecordId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_deleterecordid');
	 
	 if(!isEmpty(deleteRecordType)&&!isEmpty(deleteRecordId)){
		 nlapiLogExecution('debug', 'deleteRecordType', deleteRecordType);
		 nlapiLogExecution('debug', 'deleteRecordId', deleteRecordId);
		 try{
		    sleep('5000');
			nlapiDeleteRecord(deleteRecordType, deleteRecordId);
		 }catch(e1){
			 nlapiLogExecution('debug', 'e1', e1)
		 }
	 }else{
	var deleteSearch = nlapiSearchRecord("customrecord_djkk_transact_data_delete",null,
			[
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("custrecord_djkk_del_recordtype"), 
			   new nlobjSearchColumn("custrecord_djkk_del_internalid")
			]
			);
	if(!isEmpty(deleteSearch)){
		for(var i=0;i<deleteSearch.length;i++){
			governanceYield();
			try{
			var recordtype=deleteSearch[i].getValue('custrecord_djkk_del_recordtype');
			var internalid=deleteSearch[i].getValue('custrecord_djkk_del_internalid');
			var delId=deleteSearch[i].getValue('internalid');
			 nlapiLogExecution('debug', 'deleteRecordType', deleteRecordType);
			 nlapiLogExecution('debug', 'deleteRecordId', deleteRecordId);
			nlapiDeleteRecord(recordtype, internalid);
			nlapiDeleteRecord('customrecord_djkk_transact_data_delete', delId);
			}catch(e){
				var transactionSearch = nlapiSearchRecord("transaction",null,
						[ 
						   ["internalidnumber","equalto",internalid]
						], 
						[
						   new nlobjSearchColumn("internalid")
						]
						);
				if(isEmpty(transactionSearch)){
					nlapiDeleteRecord('customrecord_djkk_transact_data_delete', delId);
				}		
			}
		}
	}
}
}
