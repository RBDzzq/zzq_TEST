/**
 * 
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Aug 2022     
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug', 'action station', '開始');
	var xmlStr = nlapiGetContext().getSetting('SCRIPT','custscript_csvstr');
	var jobParamData = nlapiGetContext().getSetting('SCRIPT','custscript_csvid');
	var jobParam = JSON.parse(jobParamData);
	var jobId = jobParam.jobId;
	nlapiLogExecution('DEBUG', 'SHOW ME xmlStr', xmlStr);
	var xmlFileId = csvDown(xmlStr)
	nlapiLogExecution('DEBUG', 'SHOW ME xmlFileId', xmlFileId);
	var send = nlapiCreateRecord('customrecord_djkk_csv_outut_record');
	send.setFieldValue('custrecord_djkk_csv_key',jobId);
	send.setFieldValue('custrecord_output_csv_fileid',xmlFileId);
	var id = nlapiSubmitRecord(send);	
}
	
	
	
function csvDown(xmlString){	
	try{	
		
		var xlsFile = nlapiCreateFile('配送用' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
			
		xlsFile.setFolder(FILE_CABINET_ID_TOTAL_INV_OUTPUT_FILE);	
		xlsFile.setName('配送用' + '_' + getFormatYmdHms() + '.csv');	
		xlsFile.setEncoding('SHIFT_JIS');	
	    
		// save file	
		return  nlapiSubmitFile(xlsFile);	
	}
	catch(e){	
		nlapiLogExecution('DEBUG', 'no error csvDown', e)	
	}	
}