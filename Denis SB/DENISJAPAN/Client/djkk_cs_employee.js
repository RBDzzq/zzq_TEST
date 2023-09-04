/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/02/03     CPC_‰‘
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
	nlapiSetFieldValue('autoname', 'F', false, true);
	setFieldDisableType('entityid', 'disabled');
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	var name = nlapiGetFieldValue('entityid');
	var id = nlapiGetFieldValue('custentity_djkk_employee_id');
	if (!isEmpty(id)) {
		var setname='';
		var englishName = nlapiGetFieldValue('custentity_djkk_english_lastname');
		var japanName=nlapiGetFieldValue('lastname');
		
		if(!isEmpty(englishName)||!isEmpty(japanName)){
			englishName = nlapiGetFieldValue('custentity_djkk_english_lastname')+' '+nlapiGetFieldValue('custentity_djkk_english_firstname');
			japanName=nlapiGetFieldValue('lastname')+' '+nlapiGetFieldValue('firstname');
			if(!isEmpty(englishName)&&!isEmpty(japanName)){
				setname=englishName;
			}else if(isEmpty(englishName)&&!isEmpty(japanName)){
				setname=japanName;
			}else if(!isEmpty(englishName)&&isEmpty(japanName)){
				setname=englishName;
			}		
		}else{
			alert('‰pŒê–¼‚Ü‚½‚Í“ú–{Œê–¼‹ó”’‚É‚·‚é‚±‚Æ‚Í‚Å‚«‚Ü‚¹‚ñ');
			return false;
		}
		if (name != id + ' ' + setname) {
			nlapiSetFieldValue('entityid', id + ' ' + setname, false, true);
		}
	} else {
		alert('DJ_]‹ÆˆõID‹ó”’‚É‚·‚é‚±‚Æ‚Í‚Å‚«‚Ü‚¹‚ñ');
		return false;
	}
	return true;
}
