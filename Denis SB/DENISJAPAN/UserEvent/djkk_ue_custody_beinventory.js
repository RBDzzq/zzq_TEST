/**
 * DJ_預かり在庫実地棚卸承認画面UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Dec 2022     宋
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
			form.addButton('custpage_button','実行','start()');		
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
		throw nlapiCreateError('システムエラー', 'DJ_預かり在庫実地棚卸承認画面はDJ_預かり在庫実地棚卸でしか作成できません。');
	}
}
