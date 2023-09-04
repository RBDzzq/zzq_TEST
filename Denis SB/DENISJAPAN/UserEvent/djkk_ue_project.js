/**
 * DJ_プロジェクトのUE
 * 
 * Version    Date            Author           Remarks
 * 1.00      2022/03/23       enn
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
	if(type=='create'){
		nlapiSetFieldValue('custrecord_djkk_project_subsidiary', getRoleSubsidiary(), false, true);
		}
	if(type=='view'){
		form.setScript('customscript_djkk_cs_project');
		form.addButton('custpage_createso', '注文','createSoRecord();');
		form.addButton('custpage_createpo', '発注','createPoRecord();');
		form.addButton('custpage_createvendorbill', '支払請求書','createVendorbillRecord();');
		form.addButton('custpage_createvendorprepayment', '仕入先前払','createVendorpaymentRecord();');
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
  
}
