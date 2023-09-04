/**
 * 保管棚のUE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/22     CPC_苑
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
 if(type=='view'){
	 form.setScript('customscript_djkk_cs_bin');
	 form.addButton('custpage_popupbarcode', 'バーコード', "popupbarcode('"+nlapiGetRecordId()+"');");	 
	 }	   
}

function userEventBeforeSubmit(type){
	if(type=='edit'){
	if(nlapiGetOldRecord().getFieldValue('custrecord_djkk_bin_barcode')!=nlapiGetNewRecord().getFieldValue('custrecord_djkk_bin_barcode')){
		nlapiSetFieldValue('custrecord_djkk_bin_barcode_pdf', null);		
	}
	}
}