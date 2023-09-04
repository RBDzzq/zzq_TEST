/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jul 2021     admin
 *
 */
var TheMinimumdigits = 11;//5;
var numbering='';
var submitId='1';
var NumberTxt='L';
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
 
	form.setScript('customscript_djkk_cs_workorder');
	if(type == 'view'){
		form.addButton('custpage_hikiate_adjust', '引当マニュアル調整', 'hikiate_adjust()');
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
	if(type=='delete'){
		return'';
	}
	try{
//		if(type=='create'&&isEmpty(nlapiGetFieldValue('custbody_djkk_exsystem_wo_assembly_lot'))){
//			var nbSearch = nlapiSearchRecord("customrecord_djkk_inventorydetail_number",null,
//					[
//					   ["custrecord_djkk_invnum_subsidiary","anyof",nlapiGetFieldValue('subsidiary')]
//					], 
//					[
//	                   new nlobjSearchColumn("internalid"),
//	                   new nlobjSearchColumn("custrecord_djkk_invnum_subsidiary"),
//	                   new nlobjSearchColumn("custrecord_djkk_invnum_form_name"),
//					   new nlobjSearchColumn("custrecord_djkk_invnum_item_make"), 
//					   new nlobjSearchColumn("custrecord_djkk_invnum_bumber")
//					]
//					);
//			if(!isEmpty(nbSearch)){
//				submitId=nbSearch[0].getValue('internalid');
//				NumberTxt=nbSearch[0].getValue('custrecord_djkk_invnum_item_make');
//				numbering=nbSearch[0].getValue('custrecord_djkk_invnum_bumber');
//			}else{
//				var numberingArray=nlapiLookupField('customrecord_djkk_inventorydetail_number', submitId, ['custrecord_djkk_invnum_bumber','custrecord_djkk_invnum_item_make']);
//				numbering=numberingArray.custrecord_djkk_invnum_bumber;
//				NumberTxt=numberingArray.custrecord_djkk_invnum_item_make;
//			}		
//			numbering++;
//			var receiptinventorynumber =  NumberTxt+ prefixInteger(parseInt(numbering), parseInt(TheMinimumdigits));
//			nlapiSetFieldValue('custbody_djkk_exsystem_wo_assembly_lot', receiptinventorynumber, false, true);
//			nlapiSubmitField('customrecord_djkk_inventorydetail_number',submitId, 'custrecord_djkk_invnum_bumber',numbering);
//		}		
	   var createdfromId=nlapiGetFieldValue('createdfrom');
      if(!isEmpty(createdfromId)){
	   nlapiSetFieldValue('custbody_djkk_delivery_destination', nlapiLookupField('salesorder', createdfromId, 'custbody_djkk_delivery_destination'));
      }
    }catch(e){
    	nlapiLogExecution('debug', 'error', e.message)
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
function userEventAfterSubmit(type){
  
//  // ステータス
//  var orderstatus = nlapiGetFieldValue('orderstatus');
//  
//  var userId=nlapiGetUser();
//  // 構成済み
//  if(orderstatus=='G'){
//      nlapiSendEmail(userId, 'yuan.chongxu@car24.co.jp', 'ワークオーダーの構成済送信', '送信Test');
//      nlapiLogExecution('debug', 'ワークオーダー送信済');
//  }
}
