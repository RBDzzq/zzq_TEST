/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Sep 2022     rextec
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
	formHiddenTab(form,"div__lab1");	
//	formHiddenDiv(form,"listtext uir-list-row-cell")
//	formHiddenDiv(form,"dottedlink")
//	formHiddenTab(form,'tbl_recmachcustrecord_djkk_brybery_page_addedit')
	if(type=='view'){
		var status = nlapiGetFieldValue('custrecord_djkk_page_status');
		nlapiLogExecution('debug','status',status);
		var val = nlapiGetFieldValue('custrecord_djkk_over_id');
		var error=nlapiGetFieldValue('custrecord_djkk_bribery_error');
		if(status=='2'&&isEmpty(val)&&isEmpty(error)){
			
			//form.addButton('custpage_button','実行','start()');
			var icId = nlapiGetRecordId();
			var parameter = new Array();
			parameter['icId'] = icId;
			//var rse = nlapiSetRedirectURL('SUITELET', 'customscript_djkk_sl_brybery_over','customdeploy_djkk_sl_brybery_over',null, parameter);
			parameter['Status'] = 'approval';
			
			var theLink = nlapiSetRedirectURL('SUITELET', 'customscript_djkk_sl_briberyacknowledgme','customdeploy_djkk_sl_briberyacknowledgme',null, parameter);
		}	
		if(status!='2'&&(!isEmpty(val)||!isEmpty(error))){
			form.setScript('customscript_djkk_cs_brybery_over');
			//form.setScript('customscript_djkk_cs_brybery_over');
			form.addButton('custpage_button','エラーのロールバック','errorback()');
		}	
	}
	
}
function userEventBeforeSubmit(type){
	try{
	var jpamount=Number(nlapiGetFieldValue('custrecord_djkk_bribery_amount'))*Number(nlapiGetFieldValue('custrecord_djkk_bribery_exchangerate'));
	// 	DJ_金額（円）
	nlapiSetFieldValue('custrecord_djkk_bribery_jpamount',jpamount, false, true)
	
	}catch(e){
		nlapiLogExecution('debug','jpamounterror',e.message);
	}

}