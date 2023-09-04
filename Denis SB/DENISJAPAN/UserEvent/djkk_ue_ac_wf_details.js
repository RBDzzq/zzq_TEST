/**
 * DJ_承認画面明細行UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Dec 2022     zhou
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
    
 // DENISJAPANDEV-1397 zheng 20230308 start
    var currentContext = nlapiGetContext();
    if (currentContext.getExecutionContext() == 'userinterface') {
        if(type != 'view'){
            throw nlapiCreateError('システムエラー', '承認画面明細行編集不可');
        }
    }
    
//	//承認画面明細行編集不可
//	if(type == 'create' ||type == 'edit' || type == 'copy'){
//		throw nlapiCreateError('システムエラー', '編集不可');
//		return false;
//	}
	// DENISJAPANDEV-1397 zheng 20230308 end
}
