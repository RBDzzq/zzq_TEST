/**
 *DJ_承認画面明細行cs
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/01/03     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function comClientPageInit(type){
    // DENISJAPANDEV-1397 zheng 20230308 start
	//承認画面明細行編集不可
//	if(type == 'create' ||type == 'edit' || type == 'copy'){
//		alert('承認画面で編集してください。承認画面明細画面では編集不可');
//		window.ischanged = false;
//		window.close();
//	}
	// DENISJAPANDEV-1397 zheng 20230308 end
}