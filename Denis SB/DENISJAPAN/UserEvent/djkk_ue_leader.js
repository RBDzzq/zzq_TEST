/**
 * リードのUE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/02/07     CPC_苑
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
	if(type=='create'){
		nlapiSetFieldValue('isperson', 'F', true, true);
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
	 var language = nlapiGetFieldValue('language');
		var djLanguage = nlapiGetFieldValue('custentity_djkk_language');//英語13、日本語26
		if(!isEmpty(language)&&isEmpty(djLanguage)){
			if(language == 'en'){
				nlapiSetFieldValue('custentity_djkk_language', '13');
			}else if(language == 'ja_JP'){
				nlapiSetFieldValue('custentity_djkk_language', '26');
			}
		}else if(!isEmpty(djLanguage)&&isEmpty(language)){
			if(djLanguage == '13'){
				nlapiSetFieldValue('language', 'en');
			}else if(djLanguage == '26'){
				nlapiSetFieldValue('language', 'ja_JP');
			}
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
	//changed by song add DENISJAPANDEV-1388 start
	try{
		var loadRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
		var subsidiary = loadRecord.getFieldValue('subsidiary');
		if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
			loadRecord.setFieldValue('custentity_djkk_customer_type','1'); //DJ_顧客タイプ 
		}
		nlapiSubmitRecord(loadRecord, false, true);
	}catch(e){
		nlapiLogExecution('ERROR', 'エラー', e.message);
	}
	//changed by song add DENISJAPANDEV-1388 end
}
