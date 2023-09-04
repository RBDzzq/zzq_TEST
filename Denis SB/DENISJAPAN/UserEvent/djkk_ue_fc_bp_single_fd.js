/**
 * BPレジスト_FD UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 May 2023     ZHOU
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
var execution = nlapiGetContext().getExecutionContext();
	
	
	if(execution != 'csvimport'){
		setFieldDisableType('custrecord_djkk_product_code_bp','disabled');
		setFieldDisableType('custrecord_repeat_key','hidden');
	}

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
	
	nlapiLogExecution('debug','userEventBeforeSubmit','in')
	//CSV Import Flag
	var execution = nlapiGetContext().getExecutionContext();
	
	
	if(execution == 'csvimport'){
		nlapiLogExecution('debug','execution',execution)
		//CSV導入の場合
		var subsidiary = nlapiGetFieldValue('custrecord_djkk_subsidiary_bp');//DJ_連結 
		var bland = nlapiGetFieldValue('custrecord_djkk_bp_choose_bland');//DJ_bland
		var item = nlapiGetFieldValue('custrecord_djkk_item');//DJ_アイテム
		var bp = nlapiGetFieldValue('custrecord_djkk_bp');//DJ_BP
     	var locationArea = nlapiGetFieldValue('custrecord_djkk_bp_location_area');//DJ_場所エリア
		var productCode = nlapiGetFieldValue('custrecord_djkk_product_code_bp');//DJ_カタログコード
		nlapiLogExecution('debug','productCode before',productCode)
		var key = '' ;//生成されたデータがKEYを繰り返しているかどうかを判断する
		key = subsidiary + '&' + bland + '&' + locationArea + '&' + item + bp;
		
		var keySearch = nlapiSearchRecord("customrecord_djkk_person_registration",null,
				[
				 	["custrecord_repeat_key","is",key]
				], 
				[
				    new nlobjSearchColumn("internalid"),  	 	
				]
			);
		if(!isEmpty(keySearch)){
			nlapiDeleteRecord('customrecord_djkk_person_registration',keySearch[0].getValue('internalid'))
			
		}
		if(!isEmpty(productCode)){
			nlapiLogExecution('debug','productCode before1',productCode)
			var itemSearch = nlapiSearchRecord("item",null,
					[
					   ["custitem_djkk_product_code","is", productCode]
					], 
					[  
					   new nlobjSearchColumn("internalid"),
					   new nlobjSearchColumn("displayname")
					]
			);
			if(!isEmpty(itemSearch)){
				nlapiLogExecution('debug','productCode',productCode)
				nlapiLogExecution('debug','displayname',itemSearch[0].getValue('displayname'))
				nlapiSetFieldValue('custrecord_djkk_desciption',itemSearch[0].getValue('displayname'));
				nlapiSetFieldValue('custrecord_djkk_item',itemSearch[0].getValue('internalid'));
			}
		}
		if(isEmpty(productCode) && !isEmpty(item)){
			var itemSearch = nlapiSearchRecord("item",null,
					[
					   ["internalid","anyof", item]
					], 
					[
					   new nlobjSearchColumn("displayname"),
					   new nlobjSearchColumn("custitem_djkk_product_code")
					]
			);
			if(!isEmpty(itemSearch)){
				nlapiSetFieldValue('custrecord_djkk_desciption',itemSearch[0].getValue('displayname'));
				nlapiSetFieldValue('custrecord_djkk_product_code_bp',itemSearch[0].getValue('custitem_djkk_product_code'));
			}
		}
		nlapiSetFieldValue('custrecord_repeat_key',key);
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){}
