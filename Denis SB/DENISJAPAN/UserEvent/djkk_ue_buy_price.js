/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Oct 2022     rextec
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
	setLineItemDisableType('recmachcustrecord_djkk_buy_price','custrecord_djkk_end_date_price_detailed','hidden');
	setLineItemDisableType('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_sub','hidden');
	setLineItemDisableType('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_price_detail_shop','hidden')
	var roleSubsidiary=getRoleSubsidiary();
//	if(roleSubsidiary==SUB_SCETI||roleSubsidiary==SUB_DPKK){
	if(roleSubsidiary!=SUB_NBKK&&roleSubsidiary!=SUB_ULKK){
		form.setScript('customscript_djkk_cs_buy_price');
		form.addButton('custpage_itemSearch', 'DJ_アイテム検索', 'djkkItemSearch();');
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
	nlapiLogExecution('debug','test','test');

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
	try{
		//DJ_価格表名前
			var custrecord_djkk_pl_name = nlapiGetFieldValue('custrecord_djkk_buy_name');
			var custrecord_djkk_pl_code = nlapiGetFieldValue('custrecord_djkk_buy_code');
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(),'name',  custrecord_djkk_pl_code+ ' '+custrecord_djkk_pl_name ,false);
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			var data = date.getDate();
			var hour = date.getHours()<10?'0'+date.getHours():date.getHours();
			var min = date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes();
			var se = date.getSeconds()<10?'0'+date.getSeconds():date.getSeconds();
			
			var value = String(year)+String(month)+String(data)+String(hour)+String(min)+String(se);
//			nlapiSetFieldValue('custrecord_djkk_id', value);
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(),'custrecord_djkk_id',  value,false);
			}catch(e){}
}
