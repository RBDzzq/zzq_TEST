/**
 * FC�쐬Comment_�H�i
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/17     CPC_��
 *
 */

/*
 * �X�V
 * */
function btnSubmit() {
	var changedFieldId = nlapiGetFieldValue('custpage_changedfieldid');
	var comment = nlapiGetFieldValue('custpage_comment');
	if (comment.indexOf('\n') >= 0) {
		comment=comment.replace(/\n/g,'<br>');
		}
	if (!isEmpty(comment)) {
		if (!isEmpty(changedFieldId)) {
			window.opener.document.getElementById("CommentText:" + changedFieldId).value = comment;
			window.opener.document.getElementById("Comment:" + changedFieldId).innerHTML = '��';
			window.ischanged = false;
			window.close();
		}
	}else{
		if (!isEmpty(changedFieldId)) {
			window.opener.document.getElementById("CommentText:" + changedFieldId).value = comment;
			window.opener.document.getElementById("Comment:" + changedFieldId).innerHTML = '';
			window.ischanged = false;
			window.close();
		}
	}
}
/*
 * DJ_�̔��v����_memo�X�V
 * */
function createMemoSubmit(){
	var changedFieldId = nlapiGetFieldValue('custpage_changedfieldid');
	var memo = nlapiGetFieldValue('custpage_memo');
	if (memo.indexOf('\n') >= 0) {
		memo=memo.replace(/\n/g,'<br>');
		}
	if (!isEmpty(memo)) {
		if (!isEmpty(changedFieldId)) {
			window.opener.document.getElementById("memoText:" + changedFieldId).value = memo;
			window.opener.document.getElementById("memo:" + changedFieldId).innerHTML = '��';
			window.ischanged = false;
			window.close();
		}
	}else{
		if (!isEmpty(changedFieldId)) {
			window.opener.document.getElementById("memoText:" + changedFieldId).value = memo;
			window.opener.document.getElementById("memo:" + changedFieldId).innerHTML = '';
			window.ischanged = false;
			window.close();
		}
	}

}

/*
 * DJ_�̔��v����_memo���^�[���}�b�`
 * */
function lookMemoBack(){
	window.ischanged = false;
	window.close();
}