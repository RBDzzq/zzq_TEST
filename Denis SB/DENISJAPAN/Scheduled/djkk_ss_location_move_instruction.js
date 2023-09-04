/**
 * 倉庫移動指示リスト
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
	nlapiLogExecution('debug', '', '倉庫移動指示リスト開始');
	var str = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_location_move_ins_par');
	nlapiLogExecution('debug', 'param', str);
	var locid = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_location_move_locid');
	nlapiLogExecution('debug', 'locid', locid);
	var fileid = nlapiGetContext().getSetting('SCRIPT','custscript_ss_location_move_fileid');
	nlapiLogExecution('debug', 'fileid', fileid);
	var sendMailUser=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_location_move_send');
	nlapiLogExecution('debug', 'sendMailUser', sendMailUser);
	if(isEmpty(sendMailUser)){
		sendMailUser='589';
	}
	var locationSearch = nlapiSearchRecord("location",null,
			[
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
			   new nlobjSearchColumn("internalid")
			]
			);
	var mailArr = new Array();
	for(var i = 0 ; i < locationSearch.length ; i++){
		mailArr[locationSearch[i].getValue('internalid')] = locationSearch[i].getValue("custrecord_djkk_mail","address",null);
	}
	var strArr = str.split(',');
	var locationMessage = new Array();
	for(var i = 0 ; i < strArr.length ; i++){
		if(!isEmpty(strArr[i])){
			var line = strArr[i].split('_');
			var id = line[0];
			var from_id = line[1];
			var to_id = line[2];
			var message = line[3];
			if(isEmpty(locationMessage[to_id])){
				locationMessage[to_id]= message +'\r';
			}else{
				locationMessage[to_id]+= message +'\r';
			}
			 nlapiSubmitField('inventorytransfer', id, 'custbody_djkk_warehouse_sent', 'T');		
		}
	}
	
	
	var fileList=new Array();
	if(!isEmpty(fileid)){
		fileList.push(nlapiLoadFile(fileid));
	}

	
	for(var i = 0 ; i < locationMessage.length;i++){
		if(!isEmpty(locationMessage[i]) && !isEmpty(mailArr[i])){
			try{
				nlapiSendEmail(sendMailUser, mailArr[i], '倉庫移動指示', locationMessage[i], null, null, null, fileList);
				nlapiLogExecution('debug', mailArr[i], locationMessage[i]);
			}
			catch(e){
				nlapiLogExecution('ERROR', 'error', e);
			}
			
		}
		
	}		
	nlapiLogExecution('debug', '', '倉庫移動指示リスト終了');
}
