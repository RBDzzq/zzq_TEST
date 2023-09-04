/**
 * DJ_クレジットメモ承認画面のUE
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Aug 2022     CPC_宋
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
	setFieldDisableType('custrecord_djkk_credit_note_final_mail','hidden');
	if(type=='view'){	
		var status = nlapiGetFieldValue('custrecord_djkk_create_note_status');
		var creatStatus = nlapiGetFieldValue('custrecord_djkk_credit_creat_status');
		var creditmemoId = nlapiGetFieldValue('custrecord_djkk_credit_creditmemo');
		var error = nlapiGetFieldValue('custrecord_djkk_create_note_error');//error
//		if(status == '2'&& isEmpty(creatStatus)&& isEmpty(error)){
		if(status == '2'&& isEmpty(creditmemoId)&& isEmpty(error)){
			//20230522 changed by zht start  
			//ボタンキャンセルを実行し、最終的に画面を直接ジャンプすることを承認する
	//		form.setScript('customscript_djkk_cs_creditmemo_approval');
	//		form.addButton('custpage_joken','実行', 'joken()');
			var icId = nlapiGetRecordId();
			var parameter = new Array();
			parameter['icId'] = icId;
			parameter['Status'] = 'approval';
			var rse = nlapiSetRedirectURL('SUITELET', 'customscript_djkk_sl_creditmemo_approval','customdeploy_djkk_sl_creditmemo_approval',null, parameter);
			//20230522 changed by zht end
		}
		if(status!='2'&&(!isEmpty(creditmemoId)||!isEmpty(error))){
			form.setScript('customscript_djkk_cs_creditmemo_approval');
			//form.setScript('customscript_djkk_cs_brybery_over');
			form.addButton('custpage_button','エラーのロールバック','errorback()');
		}	
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
	try{
	var jpamount=Number(nlapiGetFieldValue('custrecord_djkk_credit_note_usertotal'))*Number(nlapiGetFieldValue('custrecord_djkk_create_note_exchange_rat'));
	// 	DJ_金額（円）
	nlapiLogExecution('debug','jpamount',jpamount);
	nlapiSetFieldValue('custrecord_djkk_credit_note_usertotal_jp',jpamount, false, true)
	
	}catch(e){
		nlapiLogExecution('debug','jpamounterror',e.message);
	}


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

