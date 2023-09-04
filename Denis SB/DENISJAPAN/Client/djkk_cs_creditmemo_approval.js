/**
 * DJ_クレジットメモ承認画面CS
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Aug 2022     CPC_宋
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
    debugger;
//	&&nlapiGetFieldValue('custrecord_djkk_credit_note_edit_status') != 'T'
	if(type=='edit'&&nlapiGetFieldValue('custrecord_djkk_create_note_status')!='2'&&isEmpty(nlapiGetFieldValue('custrecord_djkk_create_note_error'))){
	var icId = nlapiGetRecordId();
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_creditmemo_approval','customdeploy_djkk_sl_creditmemo_approval');
	theLink += '&icId=' + icId;
	theLink += '&Status=edit';
	var rse = nlapiRequestURL(theLink);
	var flg = rse.getBody();
	if(flg.indexOf('異常発生')>-1){
//		alert(flg);
		window.ischanged = false;
		window.location.href=theLink;		  			
	}else{
		var theLink = nlapiResolveURL('RECORD', 'creditmemo',flg, 'EDIT');
		window.ischanged = false;
		window.location.href=theLink;
	}
	//20230616 add by zhou start
	}else{
		alert('現在実行中のオペレータがいます。「エラーのロールバック」ボタンをクリックして異常を取り除いてから試してください');
		try{
			window.history.back();
			window.close;
		}catch(e){
			window.open("about:blank", "_top")
		}
	}	
	//20230616 add by zhou end
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */

function joken(){ //承認	
	var icId = nlapiGetRecordId();
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_creditmemo_approval','customdeploy_djkk_sl_creditmemo_approval');
	theLink += '&icId=' + icId;
	theLink += '&Status=approval';
	var rse = nlapiRequestURL(theLink);
	var flg = rse.getBody();
	if(flg != 'F'){
		alert('承認済み、クレジットメモが生成されました');
		var theLink = nlapiResolveURL('RECORD', 'creditmemo',flg, 'VIEW');
		window.ischanged = false;
		window.location.href=theLink;
	}else{
		alert('異常発生');
//		var theLink = URL_HEAD +'/app/common/scripting/scriptrecord.nl?id=1201';
//		window.open(theLink);
	}

	
}
//DJ_前払金/買掛金調整承認WF参照、エラーロールバック
function errorback(){
	var icId = nlapiGetRecordId();
	var record = nlapiLoadRecord('customrecord_djkk_credit_note_approval',icId);
	var creditmemoId = record.getFieldValue('custrecord_djkk_credit_creditmemo');
	var error=record.getFieldValue('custrecord_djkk_create_note_error');
	if(!isEmpty(error)){
		record.setFieldValue('custrecord_djkk_create_note_error','');
		nlapiSubmitRecord(record);
	}
	
    if(!isEmpty(creditmemoId)){
	var delLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_creditmemo_approval','customdeploy_djkk_sl_creditmemo_approval');
	delLink += '&deleteRecordId=' + creditmemoId;
	nlapiRequestURL(delLink);
	alert('しばらくお待ちください。「エラーのロールバック 」ボタンが消えるまで画面を更新してください。');
	}
	
	window.ischanged = false;
	window.location.href=window.location.href
}	
	
	
	
	
	
	
	
	
