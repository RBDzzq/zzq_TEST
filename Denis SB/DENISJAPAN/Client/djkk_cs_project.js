/**
 * DJ_プロジェクトのClient
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
		nlapiSetFieldValue('name', '自動生成');
		nlapiDisableField('name', true);
	} else if (type == 'edit') {
		nlapiDisableField('name', true);
	}
}


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	if(nlapiGetFieldValue('name')!=nlapiGetFieldValue('custrecord_djkk_project_id')+' '+nlapiGetFieldValue('custrecord_djkk_project_name')){
    	nlapiSetFieldValue('name', nlapiGetFieldValue('custrecord_djkk_project_id')+' '+nlapiGetFieldValue('custrecord_djkk_project_name'));
    }  	
    return true;
}

/**
 * create a salesorder
 */
function createSoRecord(){
	var projectid = nlapiGetRecordId();
	var theLink = nlapiResolveURL('RECORD', 'salesorder','', 'EDIT');
	theLink+='&projectid='+projectid;
	window.open(theLink);
}

/**
 * create a purchaseorder
 */
function createPoRecord(){
	var projectid = nlapiGetRecordId();
	var theLink = nlapiResolveURL('RECORD', 'purchaseorder','', 'EDIT');
	theLink+='&projectid='+projectid;
	window.open(theLink);
}

/**
 * create a Vendorbill
 */
function createVendorbillRecord(){
	var projectid = nlapiGetRecordId();
	var theLink = nlapiResolveURL('RECORD', 'vendorbill','', 'EDIT');
	theLink+='&projectid='+projectid;
	window.open(theLink);
}

/**
 * create a Vendorbill
 */
function createVendorpaymentRecord(){
	var projectid = nlapiGetRecordId();
	var theLink = nlapiResolveURL('RECORD', 'vendorprepayment','', 'EDIT');
	theLink+='&projectid='+projectid;
	window.open(theLink);
}

