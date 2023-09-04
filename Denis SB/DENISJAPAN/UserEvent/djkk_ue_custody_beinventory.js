/**
 * DJ_�a����݌Ɏ��n�I�����F���UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Dec 2022     �v
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
		var status = nlapiGetFieldValue('custrecord_djkk_body_status');
		var bodyStatus = nlapiGetFieldValue('custrecord_djkk_body_head_status');	
		form.setScript('customscript_djkk_cs_custody_inventory');
		if(status=='2' && isEmpty(bodyStatus)){
			form.addButton('custpage_button','���s','start()');		
		}
		if(!isEmpty(status)){
			formHiddenTab(form,'_back');
			formHiddenTab(form,'secondary_back');
		}
	}
	var status = nlapiGetFieldValue('custrecord_djkk_body_status');
	if(!isEmpty(status)&&status != '4'){
		formHiddenTab(form,'recmachcustrecord_djkk_custody_stock_list_addedit');
	}
	if(type == 'copy'){
		throw nlapiCreateError('�V�X�e���G���[', 'DJ_�a����݌Ɏ��n�I�����F��ʂ�DJ_�a����݌Ɏ��n�I���ł����쐬�ł��܂���B');
	}
}
