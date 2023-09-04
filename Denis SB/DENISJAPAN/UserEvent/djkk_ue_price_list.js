/**
 * DJ_‰¿Ši•\‚ÌUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/05     CPC_‰‘
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {
	setLineItemDisableType('recmachcustrecord_djkk_pldt_pl','custrecord_djkk_pl_enddate_calculation','hidden')
}
function userEventBeforeSubmit(type) {

}
function userEventAfterSubmit(type) {
	try{
//DJ_‰¿Ši•\–¼‘O
	var custrecord_djkk_pl_name = nlapiGetFieldValue('custrecord_djkk_pl_name');
	var custrecord_djkk_pl_code = nlapiGetFieldValue('custrecord_djkk_pl_code');
	nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(),'name',  custrecord_djkk_pl_code+ ' '+custrecord_djkk_pl_name ,false);
	}catch(e){}
}

