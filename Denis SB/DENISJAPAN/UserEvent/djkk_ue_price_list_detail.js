/**
 * DJ_価格表明細のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/05     CPC_
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {
	
}

function userEventBeforeSubmit(type) {

}

function userEventAfterSubmit(type) {
	try{
		var endDate = nlapiGetFieldValue('custrecord_djkk_pl_enddate');
		if(!isEmpty(endDate)){
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_pl_enddate_calculation', endDate);
		}else{
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_pl_enddate_calculation', getMaxDate());
		}
		
		var priceCode = nlapiGetFieldValue('custrecord_djkk_pldt_pl');
		if(!isEmpty(priceCode)){
			var sub = nlapiLookupField('customrecord_djkk_price_list', priceCode, 'custrecord_djkk_price_subsidiary');
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_price_subsidiary_pl', sub);
		}else{
			nlapiLogExecution('ERROR', 'ヘッダ設定されていない', '連結設定されていない');
		}
		
		
		
	}catch(e){
		nlapiLogExecution('ERROR', 'エラー', e.message);
	}
}


function getMaxDate(){
	var date = new Date();
	date.setFullYear(9999, 11, 31)
	return nlapiDateToString(date)
}