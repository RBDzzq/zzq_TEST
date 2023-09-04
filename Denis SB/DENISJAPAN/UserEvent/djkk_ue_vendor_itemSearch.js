/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Sep 2022     rextec
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
	var roleSubsidiary=getRoleSubsidiary();
//	if(roleSubsidiary==SUB_SCETI||roleSubsidiary==SUB_DPKK){
	if(roleSubsidiary!=SUB_NBKK&&roleSubsidiary!=SUB_ULKK){
		form.setScript('customscript_djkk_cs_vendor_itemSearch');
		form.addButton('custpage_itemSearch', 'DJ_ÉAÉCÉeÉÄåüçı', 'djkkItemSearch();');
	}
 
}
