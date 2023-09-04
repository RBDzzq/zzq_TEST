/**
 * DJ_å_ñÒèëÇÃClient
 * 
 * Version    Date            Author           Remarks
 * 1.00      2022/03/23       enn
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	 if (type == 'create') {
			nlapiSetFieldValue('name', 'é©ìÆê∂ê¨');
			nlapiDisableField('name', true);
		} else if (type == 'edit') {
			nlapiDisableField('name', true);
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	if(nlapiGetFieldValue('name')!=nlapiGetFieldValue('custrecord_djkk_contract_id')+' '+nlapiGetFieldValue('custrecord_djkk_contract_name')){
    	nlapiSetFieldValue('name', nlapiGetFieldValue('custrecord_djkk_contract_id')+' '+nlapiGetFieldValue('custrecord_djkk_contract_name'));
    }
    return true;
}

/**
 * create a salesorder
 */
function createSoRecord(){
	var contractid = nlapiGetRecordId();
	var theLink = nlapiResolveURL('RECORD', 'salesorder','', 'EDIT');
	theLink+='&contractid='+contractid;
	window.open(theLink);
}

/**
 * create a purchaseorder
 */
function createPoRecord(){
	var contractid = nlapiGetRecordId();
	var theLink = nlapiResolveURL('RECORD', 'purchaseorder','', 'EDIT');
	theLink+='&contractid='+contractid;
	window.open(theLink);
}
