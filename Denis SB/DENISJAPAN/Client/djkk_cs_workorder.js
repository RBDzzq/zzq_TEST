/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jul 2021     admin
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {

	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
function clientValidateField(type, name, linenum) {

	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {

	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type) {


	
	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateInsert(type) {

	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type) {

	return true;
}

//function aoto_hikiate() {
//	try {
//
//		var itemCount = nlapiGetLineItemCount('item');
//		var itemDeitalFilter = new Array();
//		itemDeitalFilter.push("item");
//		itemDeitalFilter.push("anyof");
//
//		for (var i = 0; i < itemCount; i++) {
//			var itemId = nlapiGetLineItemValue('item', 'item', i + 1);
//			itemDeitalFilter.push(itemId);
//		}
//
//		var location = nlapiGetFieldValue('location')
//		
//		if(isEmpty(location)){
//			alert('倉庫を入力してください');
//			return ;
//		}
//
//		var inventorydetailSearch = nlapiSearchRecord("inventorydetail",null,
//				[
//				   ["inventorynumber.quantityavailable","greaterthan","0"], 
//				   "AND", 
//				   itemDeitalFilter, 
//				   "AND", 
//				   ["location","anyof",location], 
////				   "AND", 
////				   ["expirationdate","after","today"], 
//				   "AND", 
//				   ["isinventoryaffecting","is","T"], 
//				   "AND", 
//				   ["inventorynumber.location","anyof","1"], 
//				   "AND", 
//				   [["transaction.type","anyof","ItemRcpt"],"OR",["transaction.type","anyof","Build"]]
//				], 
//				[
//				   new nlobjSearchColumn("item",null,"GROUP").setSort(false), 
//				   new nlobjSearchColumn("quantityonhand","inventoryNumber","GROUP"), 
//				   new nlobjSearchColumn("quantityavailable","inventoryNumber","GROUP"), 
//				   new nlobjSearchColumn("expirationdate",null,"GROUP").setSort(false), 
//				   new nlobjSearchColumn("trandate","transaction","MAX").setSort(false), 
//				   new nlobjSearchColumn("inventorynumber","inventoryNumber","GROUP"), 
//				   new nlobjSearchColumn("location",null,"GROUP")
//				]
//				);
//		
//		
//		
//		var itemCount  =nlapiGetLineItemCount('item');
//		
//		if(isEmpty(inventorydetailSearch) || itemCount == 0){
//			return;
//		}
//		
//		
//		for(var i = 0 ; i < itemCount ; i++){
//			
//			nlapiSelectLineItem('item', i+1)
//			var oneInvFlg  = nlapiGetCurrentLineItemValue('item','custcol_djkk_single_lot_provision');
//			var quantity  = nlapiGetCurrentLineItemValue('item','quantity');
//			var inventorydetailavail = nlapiGetCurrentLineItemValue('item','inventorydetailavail')
//			var itemId = nlapiGetCurrentLineItemValue('item','item')
//			
//			//在庫詳細詳細あれば　処理を行います
//			if(inventorydetailavail == 'T'){
//				
//				
//				var inventorydetail = nlapiEditCurrentLineItemSubrecord('item','inventorydetail')
//				
//				if(!isEmpty(inventorydetail)){
//					
//					alert('存在'+itemId);
//					//存在場合　処理しません
//				}else{
//					alert('存在なし'+itemId);
//					//存在なし場合自動作成します。
//					var inventorydetail = nlapiCreateCurrentLineItemSubrecord('item', 'inventorydetail');
//					//alert(inventorydetail);
////					if(oneInvFlg == 'T'){
////						
////						alert(item)
////						for(var j = 0 ; j < inventorydetailSearch.length ; j++){
////							if(inventorydetailSearch[j].getValue("item",null,"GROUP") == itemId){
////								break;
////							}
////						}
////						
////						
////
////						//単一引当場合
////						inventoryDetail.selectNewLineItem('inventoryassignment');
////						inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',inventorydetailSearch[j].getValue("inventorynumber","inventoryNumber","GROUP"));
////						var maxQuantity = inventorydetailSearch[j].getValue("quantityavailable","inventoryNumber","GROUP")
////						if(maxQuantity >= quantity){
////							inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity',quantity);
////						}else{
////							inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity',maxQuantity);
////						}
////						inventoryDetail.commitLineItem('inventoryassignment');
////						inventoryDetail.commit();
////						
////					}else{
////						alert('作成中')
////					}
//					
//				}
//			}
//			
//			nlapiCommitLineItem('item');
//		}
//	} catch (e) {
//		alert('error:'+ e.message)
//	}
//
//}

function hikiate_adjust(){
	
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_hikiate_adjust', 'customdeploy_djkk_sl_hikiate_adjust');
	https += '&workorderId='+nlapiGetRecordId();
	nlExtOpenWindow(https, 'newwindow', 1200, 720, this, false, '引当マニュアル調整');
	
}

