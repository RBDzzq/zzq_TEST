/**
 * DJ_合計請求書record
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jul 2021     admin
 *
 */
function cloz(id){
	
	if(isEmpty(id)){
		return;
	}
	
	if(confirm('クローズすると修正できなくなる、よろしでしょうか。')){
		nlapiSubmitField('customrecord_djkk_invoice_summary', id, 'custrecord_djkk_inv_cloz', 'T')
		window.location.reload();
	}
	
	return;
}



function refresh(){
	window.location.reload();
	return;
}

function initialization(id){
	
	if(isEmpty(id)){
		return;
	}
	nlapiSubmitField('customrecord_djkk_invoice_summary', id, 'custrecord_djkk_inv_reset_flg', 'T')
	alert('請求書とクレジットメモ、リセット完了しました、更新状態は別途で確認いたします。')
	window.location.reload();
	return;
//	var invList = rec.getFieldValue('custrecord_djkk_inv_list');
// 	var creditmemoList = rec.getFieldValue('custrecord_djkk_creditmemo_list');
//
// 	
// 	var invArr = new Array();
// 	var creditmemoArr = new Array();
// 	if(!isEmpty(invList)){
// 		invArr = invList.split(',');
// 	}
// 	
// 	if(!isEmpty(creditmemoList)){
// 		creditmemoArr = creditmemoList.split(',');
// 	}
// 	
// 	if(invArr.length + creditmemoArr.length >= 50){
// 		alert('請求書とクレジットメモ数量多いです。更新できません。管理者に連絡してください。')
// 		return ;
// 	}
// 	
//
//
// 	for(var i = 0 ; i < invArr.length ; i ++){
// 		if(isEmpty(invArr[i])){
// 			continue;
// 		}
// 		try{
// 			nlapiSubmitField('invoice', invArr[i], 'custbody_djkk_invoicetotal_flag', 'F');
// 		}
// 		catch(e){
// 		}
// 		
// 	}
// 	
// 	for(var i = 0 ; i < creditmemoArr.length ; i ++){
// 		if(isEmpty(creditmemoArr[i])){
// 			continue;
// 		}
// 		try{
// 			nlapiSubmitField('creditmemo', creditmemoArr[i], 'custbody_djkk_invoicetotal_flag', 'F');
// 		}
// 		catch(e){
// 		}
// 	}
// 	alert('請求書とクレジットメモ、リセット完了しました。')
}