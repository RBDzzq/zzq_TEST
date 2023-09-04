/**
 * DJ_î[ïiêÊUE
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Feb 2022     sys
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
	var subsidiary = getRoleSubsidiary();
	if(type == "view"){
		if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
			form.setScript('customscript_djkk_cs_arrival_luggage');
			form.addButton('custpage_inc_retransmission', 'ì¸â◊éwé¶çƒëó', 'incRetransmission();');	
		}
	} 
}