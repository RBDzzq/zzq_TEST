/**
 * DJ_���v������record
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jul 2021     admin
 *
 */
function cloz(id){
	
	if(isEmpty(id)){
		return;
	}
	
	if(confirm('�N���[�Y����ƏC���ł��Ȃ��Ȃ�A��낵�ł��傤���B')){
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
	alert('�������ƃN���W�b�g�����A���Z�b�g�������܂����A�X�V��Ԃ͕ʓr�Ŋm�F�������܂��B')
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
// 		alert('�������ƃN���W�b�g�������ʑ����ł��B�X�V�ł��܂���B�Ǘ��҂ɘA�����Ă��������B')
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
// 	alert('�������ƃN���W�b�g�����A���Z�b�g�������܂����B')
}