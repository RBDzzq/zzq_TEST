/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jul 2021     admin
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
 

	form.setScript('customscript_djkk_cs_total_invoice');
	
	//クローズされた場合、ボタン表示しません。
	var clozFlg = nlapiGetFieldValue('custrecord_djkk_inv_cloz');
	
	
	if (type == 'view' && clozFlg != 'T') {
		form.addButton('custpage_initialization', '請求書とクレジットメモリセット',"initialization('" + nlapiGetRecordId() + "');");
	}
	if (type == 'view'　&& clozFlg != 'T') {
		form.addButton('custpage_refresh', 'リフレッシュ',"refresh();");
	}
	
	if (type == 'view' && clozFlg != 'T') {
		form.addButton('custpage_cloz', 'クローズ',"cloz('" + nlapiGetRecordId() + "');");
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
	

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
	
	try{
		var id = nlapiGetRecordId()
		if(!isEmpty(id)){
			
			var rec = nlapiLoadRecord('customrecord_djkk_invoice_summary', id)
			if(rec.getFieldValue('custrecord_djkk_inv_reset_flg') == 'T'){
				var scheduleparams = new Array();
				scheduleparams['custscript_djkk_ss_total_inv_status_id'] = id;
				runBatch('customscript_djkk_ss_total_inv_status', 'customdeploy_djkk_ss_total_inv_status', scheduleparams);
			}
		}
	}catch(e){
		nlapiLogExecution('ERROR', '', e.message);
	}

}
