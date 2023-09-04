/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Jul 2022     rextec
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
//	setFieldDisableType('custrecord_djkk_pldt_code_fd', 'hidden');
//	       nlapiSetFieldValue('custrecord_djkk_pldt_code_fd', 'CSVçÃî‘');
//	       nlapiDisableField('custrecord_djkk_pldt_code_fd', true);
}
function clientFieldChanged(type, name, linenum){
	if(name=='custrecord_djkk_pldt_itemcode_fd'){
		var itemID = nlapiGetFieldValue('custrecord_djkk_pldt_itemcode_fd');
		var itemSearch = nlapiSearchRecord("item",null,
				[
				   ["internalid","anyof",itemID]
				], 
				[
				   new nlobjSearchColumn("vendor")
				]
				);
		if(!isEmpty(itemSearch)){
			nlapiSetFieldValue('custrecord_djkk_pldt_supplier_fd', itemSearch[0].getValue("vendor"));
		}
	}	
}
