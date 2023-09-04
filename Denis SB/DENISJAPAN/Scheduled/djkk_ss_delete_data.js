/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/10/05     CPC_苑
 *
 */

/**
 * @param {String}
 *            type Context Types: scheduled, ondemand, userinterface, aborted,
 *            skipped
 * @returns {Void}
 */
function scheduled(type) {
   var recordid = nlapiGetContext().getSetting('SCRIPT','custscript_recordid');
   var recordid2 = nlapiGetContext().getSetting('SCRIPT','custscript_recordid2');
   var recordid3 = nlapiGetContext().getSetting('SCRIPT','custscript_recordid3');
   var recordid4 = nlapiGetContext().getSetting('SCRIPT','custscript_recordid4');
   var recordid5 = nlapiGetContext().getSetting('SCRIPT','custscript_recordid5');
   var recordid6 = nlapiGetContext().getSetting('SCRIPT','custscript_recordid6');
   var idArray=new Array();
   idArray.push(recordid);
   idArray.push(recordid2);
   idArray.push(recordid3);
   idArray.push(recordid4);
   idArray.push(recordid5);
   idArray.push(recordid6);
   nlapiLogExecution('debug', 'recordid:', recordid);
   nlapiLogExecution('debug', 'recordid2:', recordid2);
   nlapiLogExecution('debug', 'recordid3:', recordid3);
   nlapiLogExecution('debug', 'recordid4:', recordid4);
   nlapiLogExecution('debug', 'recordid5:', recordid5);
   nlapiLogExecution('debug', 'recordid6:', recordid6);
	if(recordid=='transaction'){
		var searchResults=getSearchResults("transaction",null,
				[
				], 
				[
				 
				   new nlobjSearchColumn("internalid",null,"GROUP").setSort(true),
				   new nlobjSearchColumn("recordType",null,"GROUP")
				]
				);
					for(var i=0;i<searchResults.length;i++){
						governanceYield();
						try{
							nlapiDeleteRecord(searchResults[i].getValue("recordType",null,"GROUP"), searchResults[i].getValue("internalid",null,"GROUP"));
							nlapiLogExecution('debug',i+"/"+searchResults.length);
						}catch(e){
							
						}
					}	
	}else{
           for(var s=0;s<idArray.length;s++){
        	   if(!isEmpty(idArray[s])){
		var searchResults=getSearchResults(idArray[s],null,
				[
				], 
				[
				 
				   new nlobjSearchColumn("internalid",null,"GROUP").setSort(true)
				]
				);
					for(var i=0;i<searchResults.length;i++){
						governanceYield();
						try{
							nlapiDeleteRecord(idArray[s], searchResults[i].getValue("internalid",null,"GROUP"));
							nlapiLogExecution('debug',i+"/"+searchResults.length);
						}catch(e){
							
						}
					}
        	   }
	       }
	}
     nlapiSendEmail('114','1004612217@qq.com','環境データのクリアは定期的に終了します' );
}

/**
 * 検索からデータを取得する
 * 
 * @param strSearchType
 * @param filters
 * @param columns
 * @returns {Array}
 */
function getSearchResults(type, id, filters, columns) {
    var search = nlapiCreateSearch(type, filters, columns);

    // 検索し、結果を渡す
    var searchResult = search.runSearch();
    var maxCount = 0;
    var results = [];
  if(!isEmpty(searchResult)){
    var resultInfo;
    try{
    do {
        resultInfo = searchResult.getResults(maxCount, maxCount + 1000);
        if (!isEmpty(resultInfo)) {
            resultInfo.forEach(function(row) {
                results.push(row);
            });
        }
        maxCount += 1000;
    } while (resultInfo.length == 1000);
    }catch(e){}
   }
    return results;
}
function isEmpty(obj) {
	if (obj === undefined || obj == null || obj === '') {
		return true;
	}
	if (obj.length && obj.length > 0) {
		return false;
	}
	if (obj.length === 0) {
		return true;
	}
	for ( var key in obj) {
		if (hasOwnProperty.call(obj, key)) {
			return false;
		}
	}
	if (typeof (obj) == 'boolean') {
		return false;
	}
	if (typeof (obj) == 'number') {
		return false;
	}
	return true;
}
function governanceYield() {
	if (parseInt(nlapiGetContext().getRemainingUsage()) <= 300) {
		var state = nlapiYieldScript();
		if (state.status == 'FAILURE') {
			nlapiLogExecution('DEBUG', 'Failed to yield script.');
		} else if (state.status == 'RESUME') {
			nlapiLogExecution('DEBUG', 'Resuming script');
		}
	}
}
