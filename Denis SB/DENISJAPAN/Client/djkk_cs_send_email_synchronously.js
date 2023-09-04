/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 May 2022     rextec
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	
	var sender =  nlapiGetFieldValue("custrecord_djkk_mail_sender_name");
	if(sender){
	var senderPaymentDataArray = nlapiLookupField(
	    'employee', sender, 
	    'internalid'
	);
	nlapiSetFieldValue("custrecord_djkk_mail_sender",senderPaymentDataArray);
	}
	var destination =  nlapiGetFieldValues("custrecord_djkk_mail_recipients_name");
	if(destination != ''){
		var destinationStr =  JSON.stringify(destination);
		var destinationArray = JSON.parse(destinationStr);
		var str ='';
		for(var i = 0 ;i < destinationArray.length; i++){
			var details = destinationArray[i];
			str += details;
			if(i + 1 < destinationArray.length){
				str += ',';
			}
		}
		nlapiLogExecution("debug","strArr" ,str);
		nlapiSetFieldValue("custrecord_djkk_mail_recipients",str);
	}
    return true;
    
}

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

		if(name == 'custrecord_djkk_mail_sender_name'){
			var sender =  nlapiGetFieldValue("custrecord_djkk_mail_sender_name");
			if(sender){
				var senderPaymentDataArray = nlapiLookupField(
				    'employee', sender, 
				    'internalid'
				);
				nlapiSetFieldValue("custrecord_djkk_mail_sender",senderPaymentDataArray);
			}
		}
		if(name == 'custrecord_djkk_mail_recipients_name'){
			var destination =  nlapiGetFieldValues("custrecord_djkk_mail_recipients_name");
			if(destination){
				var destinationStr =  JSON.stringify(destination);
				var destinationArray = JSON.parse(destinationStr);
				var str ='';
				for(var i = 0 ;i < destinationArray.length; i++){
					var details = destinationArray[i];
					str += details;
					if(i + 1 < destinationArray.length){
						str += ',';
					}
				}
				nlapiLogExecution("debug","strArr" ,str);
				nlapiSetFieldValue("custrecord_djkk_mail_recipients",str);
			}
		}	
}
