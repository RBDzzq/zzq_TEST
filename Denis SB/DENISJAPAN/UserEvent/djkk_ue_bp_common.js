/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jul 2022     zhou
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
	var recordType = nlapiGetRecordType();
	if(recordType == 'customrecord_djkk_person_registration_ls'){
		setFieldDisableType('custrecord_djkk_loc_intermediate_text_ls','hidden');
		setFieldDisableType('custrecord_djkk_association_id_ls','hidden');
		setFieldDisableType('custrecord_djkk_anti_duplicate_recording','hidden');
	}else if(recordType == 'customrecord_djkk_person_registration'){
		setFieldDisableType('custrecord_djkk_association_id','hidden');
		setFieldDisableType('custrecord_djkk_loc_intermediate_text','hidden');
	}
}
