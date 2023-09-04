/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/12/13      CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var handyType = request.getParameter('handyType');
	if(handyType=='SetUpLocations'){
		var jsonObj = '{';
		jsonObj+= '"locations":';
		jsonObj=getListToJson("location", jsonObj, null,'custrecord_djkk_location_barcode','name');
		jsonObj+='}';
		response.write(jsonObj);
	}
	
	else if(handyType=='SetUpBins'){
		var jsonObj = '{';
		jsonObj+= '"bins":';
		jsonObj=getBinListToJson("bin", jsonObj, null,'custrecord_djkk_bin_barcode','binnumber');
		jsonObj+='}';
		response.write(jsonObj);
		}
	
	else if(handyType=='SetUpEmployees'){
		var jsonObj = '{';
		jsonObj+= '"employees":';
		jsonObj=getListToJson("employee", jsonObj, null,'custentity_djkk_employee_id','entityid');
		jsonObj+='}';
		response.write(jsonObj);
	}
	
	else if(handyType=='SetUpAll'){
		var jsonObj = '{';
		jsonObj+= '"locations":';
		jsonObj=getListToJson("location", jsonObj, null,'custrecord_djkk_location_barcode','name');
		jsonObj+= ',"bins":';
		jsonObj=getBinListToJson("bin", jsonObj, null,'custrecord_djkk_bin_barcode','binnumber');
		jsonObj+= ',"employees":';
		jsonObj=getListToJson("employee", jsonObj, null,'custentity_djkk_employee_id','entityid');
		jsonObj+='}';
		response.write(jsonObj);
	}
	
	else{
		response.write('ERROR:handyスキャンを使用してください');
	}
}

function getListToJson(listId, jsonObj,filters,key,value) {
	jsonObj+="[";
	var Search= nlapiSearchRecord(listId,null,filters, 
    		[
    		  new nlobjSearchColumn(key), 
    		   new nlobjSearchColumn(value),
    		   new nlobjSearchColumn('internalid')
    		   
    		]
    		);
	if (!isEmpty(Search)) {
		for (var i = 0; i < Search.length; i++) {
			jsonObj +='{"key":"'+Search[i].getValue(key)+'",';
			jsonObj +='"value":"'+Search[i].getValue(value)+'",';
			jsonObj +='"internalid":"'+Search[i].getValue('internalid')+'"}'; 
			if(i!=Search.length-1){
			jsonObj +=",";
			}
		}
	}
	jsonObj+="]";
	return jsonObj;
}
function getBinListToJson(listId, jsonObj,filters,key,value) {
	jsonObj+="[";
//	var Search= nlapiSearchRecord(listId,null,filters, 
//    		[
//    		  new nlobjSearchColumn(key), 
//    		   new nlobjSearchColumn(value),
//    		   new nlobjSearchColumn('internalid'),
//    		  new nlobjSearchColumn("location") 
//    		   
//    		]
//    		);
	var Search=  getSearchResults(
			listId,
			null,
			filters,
			[
				new nlobjSearchColumn(key), 
				new nlobjSearchColumn(value),
				new nlobjSearchColumn('internalid'),
				new nlobjSearchColumn("location") 
			]);
	nlapiLogExecution('DEBUG', 'Search.length', Search.length);
	if (!isEmpty(Search)) {
		for (var i = 0; i < Search.length; i++) {
			jsonObj +='{"key":"'+Search[i].getValue(key)+'",';
			jsonObj +='"value":"'+Search[i].getValue(value)+'",';
			jsonObj +='"internalid":"'+Search[i].getValue('internalid')+'",';			
			jsonObj +='"locationid":"'+Search[i].getValue('location')+'"}';
			if(i!=Search.length-1){
			jsonObj +=",";
			}
		}
	}
	jsonObj+="]";
	return jsonObj;
}