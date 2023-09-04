/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Nov 2022     rextec
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
	if(type == 'edit'){
		var itemValue = nlapiGetFieldValue('custrecord_djkk_item_s');
		nlapiRemoveSelectOption('custpage_item', null )
		var brand = nlapiGetFieldValue('custrecord_djkk_bp_choose_bland_s');
		var sub = nlapiGetFieldValue('custrecord_djkk_subsidiary_bp_s');
		var itemSearch = nlapiSearchRecord("item",null,
				[
				   ["class","anyof",brand],
				   "AND",
				   ["subsidiary","anyof",sub],
				   "AND",
				   ["custitem_djkk_forecast",'is','T']
				], 
				[
				   new nlobjSearchColumn("itemid").setSort(false), 
				   new nlobjSearchColumn("internalid"),
				   new nlobjSearchColumn("displayname"), 
				   new nlobjSearchColumn("custitem_djkk_product_code")
				   
				]
				);
		if(!isEmpty(itemSearch)){
			for(var i = 0 ; i < itemSearch.length ; i++){
	//			var itemid = itemSearch[i].getValue('itemid');
				var internalid = itemSearch[i].getValue('internalid');
				var productCode = defaultEmpty(itemSearch[i].getValue('custitem_djkk_product_code'));
				var itemName = defaultEmpty(itemSearch[i].getValue('displayname'));
				var str = productCode + ' ' +itemName;
				nlapiInsertSelectOption('custpage_item', internalid,str);
				nlapiSetFieldValue('custpage_item',itemValue);
			}
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
	var itemValue = nlapiGetFieldValue('custpage_item');
	var csvInputFlag = nlapiGetFieldValue('custrecord_csvinput_flag');
	if(csvInputFlag == 'F'){
		nlapiSetFieldValue('custrecord_djkk_item_s',itemValue);
		if(isEmpty(itemValue)){
			alert('次に値を入力してください: DJ_アイテム')
			return false;
		}
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
	if(name == 'custrecord_djkk_bp_choose_bland_s'){
		nlapiRemoveSelectOption('custpage_item', null )
		var brand = nlapiGetFieldValue('custrecord_djkk_bp_choose_bland_s');
		var sub = nlapiGetFieldValue('custrecord_djkk_subsidiary_bp_s');
		var itemSearch = nlapiSearchRecord("item",null,
				[
				   ["class","anyof",brand],
				   "AND",
				   ["subsidiary","anyof",sub],
				   "AND",
				   ["custitem_djkk_forecast",'is','T']
				], 
				[
				   new nlobjSearchColumn("itemid").setSort(false), 
				   new nlobjSearchColumn("internalid"),
				   new nlobjSearchColumn("displayname"), 
				   new nlobjSearchColumn("custitem_djkk_product_code")
				   
				]
				);
		if(!isEmpty(itemSearch)){
			for(var i = 0 ; i < itemSearch.length ; i++){
	//			var itemid = itemSearch[i].getValue('itemid');
				var internalid = itemSearch[i].getValue('internalid');
				var productCode = defaultEmpty(itemSearch[i].getValue('custitem_djkk_product_code'));
				var itemName = defaultEmpty(itemSearch[i].getValue('displayname'));
				var str = productCode + ' ' +itemName;
				
				nlapiInsertSelectOption('custpage_item', internalid,str);
			}
		}
	}
}
function defaultEmpty(src){
	return src || '';
}