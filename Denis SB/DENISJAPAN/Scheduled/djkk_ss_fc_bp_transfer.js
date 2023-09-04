/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2022     rextec
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug','start','start')
	var value = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_bp_transfer_value1');
	value = JSON.parse(value)
	if(!isEmpty(value)){
		var vendorId = value.vendorId;
		var subsidiary = value.subsidiary;
		var loadRecord =  value.loadRecord;//しばらくは必要ありません
		var vendorArray = vendorId.split('');//venderを分割する
		//検索item
		nlapiLogExecution('debug','sub',subsidiary)
		var itemSearch = nlapiSearchRecord("item",null,
				[
				   ["othervendor","anyof",vendorArray],
				   "AND", 
				   ["isinactive","is","F"],
				   "AND", 
				   ["subsidiary","anyof",subsidiary]
				], 
				[
				   new nlobjSearchColumn("itemid").setSort(false), 
				   new nlobjSearchColumn("displayname") ,
				   new nlobjSearchColumn("internalid") 
				]
				);
		if(itemSearch != null){
			//itemデータの取得
			var itemValueArray = [];
			var itemName = [];
			for(var n = 0 ; n < itemSearch.length ; n++){
				var internalid = itemSearch[n].getValue('internalid');
				var displayname = itemSearch[n].getValue('displayname');
				var itemid = itemSearch[n].getValue('itemid');
				var str = '';
				str += itemid;
				str +=  ' '+displayname;
				itemValueArray.push({
					internalid:internalid,
					str:str
				})
			}
			//配列オブジェクトの重複除外
			var result = [];
		    for (var i = 0; i < itemValueArray.length; i++) {
		      var flag = true;
		      for (var j = 0; j < result.length; j++) {
		        if (itemValueArray[i].internalid == result[j].internalid) {
		          flag = false;
		        }
		      }
		      if (flag) {
		        result.push(itemValueArray[i]);
		      }
		    }
		    //レコードの作成
		    itemValueArray = result;
		    nlapiLogExecution('debug','value',JSON.stringify(itemValueArray))
			    for(var i = 0 ; i < itemValueArray.length ; i++){
			    	var str = itemValueArray[i].str;
			    	itemName.push(str);
			    	var itemid = itemValueArray[i].internalid;
					var sendToSheet = nlapiCreateRecord('customrecord_bp_destinationtext_transfer');
					sendToSheet.setFieldValue('custrecord_djkk_itemtext_ls_s',itemid);
					sendToSheet.setFieldValue('name',str);
					nlapiSubmitRecord(sendToSheet);
			    }
//		    nlapiLogExecution('debug','loadRecord',loadRecord)
//		    var setSheetRecord = nlapiLoadRecord('customrecord_djkk_person_checkbox_ls',loadRecord)
//		    setSheetRecord.setFieldValues('custrecord_djkk_item_ls_s',itemName);
//		    nlapiSubmitRecord(loadRecord);
//		    nlapiLogExecution('debug','end','end')
		}
	}
}
