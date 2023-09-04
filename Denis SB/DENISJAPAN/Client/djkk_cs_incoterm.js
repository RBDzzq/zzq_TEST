/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2022     rextec
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	var id = nlapiGetFieldValue('id');
	if(isEmpty(id)){
	var name = nlapiGetFieldValue('name');
	var customrecord_djkk_incotermSearch = nlapiSearchRecord("customrecord_djkk_incoterm",null,
			[
			   ["name","is",name]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false), 
			]
			);
	if(!isEmpty(customrecord_djkk_incotermSearch)){
		alert('ñºëOÇÕèdï°ÇµÇ‹Ç∑ÅB')
		return false;
	}
	}
	

    return true;
}
