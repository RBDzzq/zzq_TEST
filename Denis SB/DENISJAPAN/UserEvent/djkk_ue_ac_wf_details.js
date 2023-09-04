/**
 * DJ_���F��ʖ��׍sUE
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
            throw nlapiCreateError('�V�X�e���G���[', '���F��ʖ��׍s�ҏW�s��');
        }
    }
    
//	//���F��ʖ��׍s�ҏW�s��
//	if(type == 'create' ||type == 'edit' || type == 'copy'){
//		throw nlapiCreateError('�V�X�e���G���[', '�ҏW�s��');
//		return false;
//	}
	// DENISJAPANDEV-1397 zheng 20230308 end
}
