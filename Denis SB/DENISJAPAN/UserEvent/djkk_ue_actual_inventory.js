/**
 * DJ_実地棚卸承認画面UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Dec 2022     宋
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
	setFieldDisableType('custrecord_djkk_shedunloading_final_mail','hidden');
	if(type=='view'){
		var status = nlapiGetFieldValue('custrecord_djkk_shedunloading_status');
//		var subsidiary = nlapiGetFieldValue('custrecord_djkk_shedunloading_sub');
		var bodyStatus = nlapiGetFieldValue('custrecord_djkk_shedunloading_finished');	
		form.setScript('customscript_djkk_cs_actual_inventory');
		if(status=='2' && bodyStatus =='2'){
			form.addButton('custpage_button','実行','start()');		
		}
//		if(!isEmpty(status)){
//			formHiddenTab(form,'_back');
//			formHiddenTab(form,'secondary_back');
//		}
	}
	var status = nlapiGetFieldValue('custrecord_djkk_shedunloading_status');
	if(!isEmpty(status)&& status!='4'){
		formHiddenTab(form,'recmachcustrecord_djkk_body_shedunloading_list_addedit');
	} 
	if(type == 'copy'){
		throw nlapiCreateError('システムエラー', 'DJ_実地棚卸承認画面はDJ_実地棚卸でしか作成できません。');
	}
	
	
}
function userEventAfterSubmit(type) {
	nlapiLogExecution('DEBUG', 'test1', 'test1')
}
