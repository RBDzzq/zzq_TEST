/**
 * DJ_’I‰µŽwŽ¦
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jul 2021     admin
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug','', 'DJ_’I‰µŽwŽ¦ŠJŽn');
	
	var strT = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_inv_ins_t_id');
	var strF = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_inv_ins_f_id');
	
	
	
	if(!isEmpty(strT)){
		var arrT = strT.split(',')
		for(var i = 0 ; i < arrT.length ; i ++){
			governanceYield();
			if(!isEmpty(arrT[i])){
				try{
					
					var rec = nlapiLoadRecord('location', arrT[i]);
					rec.setFieldValue('custrecord_djkk_stop_load', 'T');
					nlapiSubmitRecord(rec);
				}catch(e){
					nlapiLogExecution('ERROR', arrT[i],e.message);
				}

			}
		}
	}

	if(!isEmpty(strF)){
		var arrF = strF.split(',')
		for(var i = 0 ; i < arrF.length ; i ++){
			governanceYield();
			if(!isEmpty(arrF[i])){
				try{
					var rec = nlapiLoadRecord('location', arrF[i]);
					rec.setFieldValue('custrecord_djkk_stop_load', 'F');
					nlapiSubmitRecord(rec);
				}catch(e){
					nlapiLogExecution('ERROR', arrF[i],e.message);
				}

			}
		}
	}

	
	
	
	nlapiLogExecution('debug', '','DJ_’I‰µŽwŽ¦I—¹');
}
