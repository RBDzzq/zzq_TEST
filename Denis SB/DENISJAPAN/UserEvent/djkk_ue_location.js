/**
 * �ꏊ��UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/22     CPC_��
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
	if(type=='create'||type=='copy'){
		var sub=getRoleSubsidiary();
	
	// LS �ۊǒI���g�p
	if(sub==SUB_DPKK){
		 nlapiSetFieldValue('usebins', 'T');
	}
	}
	 if(type=='view'){
		 form.setScript('customscript_djkk_cs_location');
		 form.addButton('custpage_popupbarcode', '�o�[�R�[�h', "popupbarcode('"+nlapiGetRecordId()+"');");
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
	if(type=='edit'){
	if(nlapiGetOldRecord().getFieldValue('custrecord_djkk_location_barcode')!=nlapiGetNewRecord().getFieldValue('custrecord_djkk_location_barcode')){
		nlapiSetFieldValue('custrecord_djkk_location_barcode_pdf', null);		
	}
	}
}
