/**
 *DJ_�[�i��O���[�vClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/01/11     CPC_��
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
	if(type=='create'||type=='copy'){
		nlapiSetFieldValue('name', '�����̔�');
	}	 	 
     nlapiDisableField('name', true);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	if(nlapiGetFieldValue('name')!=nlapiGetFieldValue('custrecord_djkk_delivery_group_id')+' '+nlapiGetFieldValue('custrecord_djkk_delivery_group_name')){
    	nlapiSetFieldValue('name', nlapiGetFieldValue('custrecord_djkk_delivery_group_id')+' '+nlapiGetFieldValue('custrecord_djkk_delivery_group_name'));
    }  	
    return true;
}
