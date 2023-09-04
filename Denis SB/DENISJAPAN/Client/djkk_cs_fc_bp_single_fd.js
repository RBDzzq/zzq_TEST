/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 May 2023     28144
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	if(isEmpty(nlapiGetFieldValue('custrecord_djkk_item'))){
		alert('DJ_�A�C�e������ɂ��邱�Ƃ͂ł��܂���')
		return false;
	}
    return true;
}
