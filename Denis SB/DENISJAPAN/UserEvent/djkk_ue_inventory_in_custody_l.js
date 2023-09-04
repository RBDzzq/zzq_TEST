/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Jan 2022     LXK
 *
 */

/**
 * ç≈è¨åÖêî
 */
var TheMinimumdigits = 3;

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
	var record = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
	var custody = record.getFieldValue('custrecord_djkk_icl_inventory_in_custody');
	
	var custodyRecord = nlapiLoadRecord('customrecord_djkk_inventory_in_custody', custody)
	var name = custodyRecord.getFieldValue('name');
	var lineCount = custodyRecord.getLineItemCount('recmachcustrecord_djkk_icl_inventory_in_custody')
	 
	name = name + prefixInteger(parseInt(lineCount), parseInt(TheMinimumdigits));
	
	record.setFieldValue('name', name);
	nlapiSubmitRecord(record);
	
}
