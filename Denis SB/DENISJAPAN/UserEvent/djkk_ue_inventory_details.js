/**
 * DJ_DJ_ç›å…è⁄ç◊ue
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/14     CPC_âë
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
// if (type == 'create') {
//	    var inventorydetailsid=request.getParameter('inventorydetailsid');
// }     custrecord_djkk_ditl_warehouse_code        //custrecord_djkk_ditl_newseriallot_number
	var number = nlapiGetFieldValue('custrecord_djkk_ditl_newseriallot_number');
	nlapiLogExecution('debug', 'number',number);
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
	nlapiLogExecution('debug', 'userEventBeforeSubmit');
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
	nlapiLogExecution('debug', 'userEventAfterSubmit');
}
