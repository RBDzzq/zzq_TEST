/**
 * DJ_���F��ʋ���CS
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Dec 2022     zhou
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function commonClientPageInit(type){
	//���F��ʐV�K�s�A�R�s�[�s��
   if(type == 'create'||type == 'copy'){
	   nlapiLogExecution('debug','in')
		alert('�蓮�쐬�s��');
		//�W�����v���I�t�܂��͋�������
		ClosePage()
   }
}
function ClosePage(){
	try{
		window.history.back();
		window.close;
	}catch(e){
		window.open("about:blank", "_top")
	}
}