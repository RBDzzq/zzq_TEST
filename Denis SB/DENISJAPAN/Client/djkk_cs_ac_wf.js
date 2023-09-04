/**
 * DJ_承認画面共通CS
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
	//承認画面新規不可、コピー不可
   if(type == 'create'||type == 'copy'){
	   nlapiLogExecution('debug','in')
		alert('手動作成不可');
		//ジャンプをオフまたは強制する
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