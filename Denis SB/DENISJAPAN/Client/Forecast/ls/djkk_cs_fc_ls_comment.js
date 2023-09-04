/**
 * DJ_SCâ€FCçÏê¨Comment_LS
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/17     CPC_âë
 *
 */

/*
 * çXêV
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
			window.opener.document.getElementById("Comment:" + changedFieldId).innerHTML = 'Åñ';
			window.ischanged = false;
			window.close();
		}
	}else{
		window.opener.document.getElementById("CommentText:" + changedFieldId).value = comment;
		window.opener.document.getElementById("Comment:" + changedFieldId).innerHTML = '';
		window.ischanged = false;
		window.close();
	}
}