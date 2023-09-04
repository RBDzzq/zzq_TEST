/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Aug 2022     rextec
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	if(type=='copy'||type=='edit'){

		var vendorId = nlapiGetFieldValue('custrecord_djkk_vendor_ls_s');
		var subsidiary = nlapiGetFieldValue('custrecord_djkk_subsidiary_bp_ls_s');
		if(!isEmpty(vendorId)){
			var vendorId = nlapiGetFieldValue('custrecord_djkk_vendor_ls_s');
			if(!isEmpty(vendorId)){
				var vendorArray = vendorId.split('');
			}
			var subsidiary = nlapiGetFieldValue('custrecord_djkk_subsidiary_bp_ls_s');
			var blandValue = nlapiGetFieldValue('custrecord_djkk_bp_choose_bland_ls_s');
			if(!isEmpty(blandValue)){
				var blandValueArray = blandValue.split('');
			}
			var productGroup = nlapiGetFieldValue('custrecord_djkk_product_group');
			if(!isEmpty(productGroup)){
				var productGroupArray = productGroup.split('');
			}
			var filit = new Array();
			filit.push(["isinactive","is","F"]);
//			if(!isEmpty(subsidiary)){
//				filit.push("AND");
//				filit.push(["subsidiary","anyof",subsidiaryArray]);
//			}
			if(!isEmpty(blandValue)){
				filit.push("AND");
				filit.push(["class","anyof",blandValueArray]);
			}
			if(!isEmpty(vendorId)){
				filit.push("AND");
				filit.push(["othervendor","anyof",vendorArray]);
			}
			if(!isEmpty(productGroup)){
				filit.push("AND");
				filit.push(["custitem_djkk_product_group","anyof",productGroupArray]);
			}
			var itemSearch = nlapiSearchRecord("item",null,
					[
					    filit
					], 
					[
						new nlobjSearchColumn("itemid").setSort(false), 
						new nlobjSearchColumn("displayname") ,
						new nlobjSearchColumn("internalid") 
					]
			);
			if(itemSearch != null){
				nlapiLogExecution('debug','page init yes','yes')
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
			}
			var itemValue = nlapiGetFieldValue('custrecord_djkk_item_new_ls_s');//DJ_アイテム
			if(!isEmpty(itemValue)){
				var itemArray = itemValue.split('');//itemを分割する
			}
			var itemNameArray = [];
			for(var i = 0 ; i < itemArray.length ; i++){
				nlapiLogExecution('debug','bbb','bbb')
				var transferSearchAfter = nlapiSearchRecord("customrecord_bp_destinationtext_transfer",null,
							[
							   ["custrecord_djkk_itemtext_ls_s","is",itemArray[i]]
							], 
							[ 
							   new nlobjSearchColumn("name")
							]
							);
					if(transferSearchAfter != null){
						nlapiLogExecution('debug','aaa','aaa')
						for(var n = 0 ; n < transferSearchAfter.length ; n++){
							var itemName = transferSearchAfter[n].getValue('name');
							itemNameArray.push(itemName);
						}
					}
			}
			nlapiLogExecution('debug','itemNameArray',itemNameArray)
			nlapiSetFieldTexts('custrecord_djkk_item_ls_s',itemNameArray);
		}
	}	 	 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	var itemName = nlapiGetFieldText('custrecord_djkk_item_ls_s');//DJ_アイテムName
	var itemArray = new Array();//アイテム
	if(!isEmpty(itemName)){
		var itemNameArray = itemName.split('');//itemを分割する
		nlapiLogExecution('debug','itemNameArray',itemNameArray)
		for(var i = 0 ; i < itemNameArray.length ; i++){
			var itemIdSearch = nlapiSearchRecord("customrecord_bp_destinationtext_transfer",null,
					[
					   ["name","haskeywords",itemNameArray[i]]
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_itemtext_ls_s"),
					]
			);
			if(itemIdSearch != null){
				var item =  itemIdSearch[0].getValue("custrecord_djkk_itemtext_ls_s");
				if(isEmpty(item)){
					item = '';
				}
				itemArray.push(item);
				nlapiLogExecution('debug','running',i)
				nlapiLogExecution('debug','item',item)
			}
		}
//		var loadRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
		nlapiLogExecution('debug','itemArray',itemArray);
		nlapiSetFieldValues('custrecord_djkk_item_new_ls_s',itemArray);
//		nlapiSubmitRecord(loadRecord);
	}
	var itemValue = nlapiGetFieldValue('custrecord_djkk_item_new_ls_s');
	if(isEmpty(itemValue)){
		alert('有効なアイテムを入力してください!')
		return false;
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
	if(name == 'custrecord_djkk_subsidiary_bp_ls_s'){
		var itemValue = nlapiGetFieldValue('custrecord_djkk_item_ls_s');
		if(!isEmpty(itemValue)){
			var transferSearch = nlapiSearchRecord("customrecord_bp_destinationtext_transfer",null,
					[
					   ["custrecord_djkk_itemtext_ls_s","isnotempty",""]
					], 
					[ 
					   new nlobjSearchColumn("internalid")
					]
					);
			if(transferSearch != null){
				for(var n = 0 ; n < transferSearch.length ; n++){
					var internalid = transferSearch[n].getValue('internalid');
					nlapiDeleteRecord('customrecord_bp_destinationtext_transfer',internalid);
				}
			}
			nlapiSetFieldValue('custrecord_djkk_item_ls_s','');
		}
	}
	if(name =='custrecord_djkk_bp_choose_bland_ls_s'||name == "custrecord_djkk_vendor_ls_s"||name == "custrecord_djkk_product_group"){
		var itemValue = nlapiGetFieldValue('custrecord_djkk_item_ls_s');
		var transferSearch = nlapiSearchRecord("customrecord_bp_destinationtext_transfer",null,
					[
					   ["custrecord_djkk_itemtext_ls_s","isnotempty",""]
					], 
					[ 
					   new nlobjSearchColumn("internalid")
					]
					);
		if(transferSearch != null){
			for(var n = 0 ; n < transferSearch.length ; n++){
				var internalid = transferSearch[n].getValue('internalid');
				nlapiDeleteRecord('customrecord_bp_destinationtext_transfer',internalid);
			}
		}
		nlapiSetFieldValue('custrecord_djkk_item_ls_s','');
//			nlapiDisableField('custrecord_djkk_item_ls_s', true);
		
		var vendorId = nlapiGetFieldValue('custrecord_djkk_vendor_ls_s');
		if(!isEmpty(vendorId)){
			var vendorArray = vendorId.split('');
		}
		var subsidiary = nlapiGetFieldValue('custrecord_djkk_subsidiary_bp_ls_s');
		var blandValue = nlapiGetFieldValue('custrecord_djkk_bp_choose_bland_ls_s');
		if(!isEmpty(blandValue)){
			var blandValueArray = blandValue.split('');
		}
		var productGroup = nlapiGetFieldValue('custrecord_djkk_product_group');
		if(!isEmpty(productGroup)){
			var productGroupArray = productGroup.split('');
		}
		var filit = new Array();
		filit.push(["isinactive","is","F"]);
//		if(!isEmpty(subsidiary)){
//			filit.push("AND");
//			filit.push(["subsidiary","anyof",subsidiaryArray]);
//		}
		if(!isEmpty(blandValue)){
			filit.push("AND");
			filit.push(["class","anyof",blandValueArray]);
		}
		if(!isEmpty(vendorId)){
			filit.push("AND");
			filit.push(["othervendor","anyof",vendorArray]);
		}
		if(!isEmpty(productGroup)){
			filit.push("AND");
			filit.push(["custitem_djkk_product_group","anyof",productGroupArray]);
		}
		var itemSearch = nlapiSearchRecord("item",null,
				[
				    filit
				], 
				[
					new nlobjSearchColumn("itemid").setSort(false), 
					new nlobjSearchColumn("displayname") ,
					new nlobjSearchColumn("internalid") 
				]
		);
		if(itemSearch != null){
			nlapiLogExecution('debug','yes','yes')
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
		    nlapiLogExecution('debug','itemValueArray field change',JSON.stringify(itemValueArray))
		    for(var i = 0 ; i < itemValueArray.length ; i++){
		    	var str = itemValueArray[i].str;
		    	itemName.push(str);
		    	var itemid = itemValueArray[i].internalid;
				var sendToSheet = nlapiCreateRecord('customrecord_bp_destinationtext_transfer');
				sendToSheet.setFieldValue('custrecord_djkk_itemtext_ls_s',itemid);
				sendToSheet.setFieldValue('name',str);
				nlapiSubmitRecord(sendToSheet);
		    }
		}else{
			var sendToSheet = nlapiCreateRecord('customrecord_bp_destinationtext_transfer');
			sendToSheet.setFieldValue('custrecord_djkk_itemtext_ls_s','');
			sendToSheet.setFieldValue('name','no item');
			nlapiSubmitRecord(sendToSheet);
		}
	}
}
