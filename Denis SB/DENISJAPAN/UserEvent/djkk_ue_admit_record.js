/**
 * DJ_トランザクション承認管理表UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/05/29      宋
 *
 */
var landed_cost = '20';//DJ_輸入諸掛
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
	if(type == 'create' || type == 'edit' ||  type == 'copy'||  type == 'view'){
		//承認対象
		var apprObj = nlapiGetFieldValue('custrecord_djkk_trans_appr_obj');
		if(!isEmpty(apprObj) && apprObj == landed_cost){
			nlapiGetField('custrecord_djkk_trans_appr4_role').setDisplayType('hidden');
		}
	}
}

