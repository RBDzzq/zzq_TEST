/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Apr 2023     zhou
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug','Batch','start')
	var type = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_fc_bp_fd_type');
	var data = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_fc_bp_fd_data');
	type = JSON.parse(type);
	data = JSON.parse(data);
	var subsidiary = data.subsidiary;
	var bland = data.bland;
	var subsidiary = data.subsidiary;
	var itemArray = data.itemArray;
	var locationArea = data.locationArea;
	var bpArray = data.bpArray;
	var locationAreaText = data.locationAreaText;
	var recordId = data.recordId;
	var getRecordId = data.getRecordId;
	var getRecordType = data.getRecordType;
	var str = data.str;
	if(type == "create" ||type == "edit" ){
		
		var itemSearch = nlapiSearchRecord("item",null,
				[
				   ["internalid","anyof", itemArray]
				], 
				[
				   new nlobjSearchColumn("displayname")
				]
		);
		var z= 1; 
		
		for(var i = 0 ; i < bpArray.length ; i++){
	    	for(var q = 0 ; q < itemArray.length ; q++){
	    		nlapiLogExecution('debug','z',z)
	    		
	    		var displayname = itemSearch[q].getValue("displayname");
	    		nlapiLogExecution('debug','displayname',displayname)
	    		nlapiLogExecution('debug','bpArray[i]',bpArray[i])
				var sendToRadio = nlapiCreateRecord('customrecord_djkk_person_registration');
				sendToRadio.setFieldValue('custrecord_djkk_subsidiary_bp',subsidiary);
				sendToRadio.setFieldValue('custrecord_djkk_bp_choose_bland',bland);
				sendToRadio.setFieldValue('custrecord_djkk_item',itemArray[q]);
				sendToRadio.setFieldValue('custrecord_djkk_desciption',displayname);
				sendToRadio.setFieldValue('custrecord_djkk_bp_location_area',locationArea);
				sendToRadio.setFieldValue('custrecord_djkk_bp',bpArray[i]);
				sendToRadio.setFieldValue('custrecord_djkk_loc_intermediate_text',locationAreaText);
				sendToRadio.setFieldValue('custrecord_djkk_association_id',recordId);
				var id = nlapiSubmitRecord(sendToRadio);
				nlapiLogExecution('debug','id',id)
				 z++
			}
		}	
	}
	if(type == 'delete'){
		var bpSearch = nlapiSearchRecord("customrecord_djkk_person_registration",null,
			[
			 	["custrecord_djkk_association_id","is",recordId]
			], 
			[
			    new nlobjSearchColumn("internalid"),  	 	
			]
		);	
		if(bpSearch != null){
			for(var n = 0 ; n < bpSearch.length ; n++){
				var internalid = bpSearch[n].getValue('internalid');
				nlapiDeleteRecord('customrecord_djkk_person_registration',internalid);
			}
		}else{
			nlapiLogExecution('debug','111','111')
		}
	}
	nlapiLogExecution('debug','Batch','end')
}
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function defaultEmpty(src){
	return src || '';
}
function replaceString(str){
	return str.replace(/\"/g,"").replace(/\[/g,"").replace(/\]/g,"");
}
//配列要素配列の組合せ
function aryJoinAry(ary,ary2) {
	var itemAry = [];
	var minLength;
	if (ary.length > ary2.length) {
		minLength = ary2.length;
	} else {
		minLength = ary.length;
	}
	var longAry = arguments[0].length > arguments[1].length ? arguments[0]
			: arguments[1];
	for (var i = 0; i < minLength; i++) {
		itemAry.push({
			item : ary[i],
			bp : ary2[i]
		});
	}
	return itemAry.concat(longAry.slice(minLength));
}
//配列内にオブジェクトが存在するかどうかを判断する
function aryIncludes(obj,arr){
	var includeFlag;//not include flag
	if(JSON.stringify(arr).indexOf(JSON.stringify(obj)) == -1){
		includeFlag = 'F'//not include
//	     arr.push(obj)
	}else{
		includeFlag == 'T'//include
	}
	return includeFlag;
}