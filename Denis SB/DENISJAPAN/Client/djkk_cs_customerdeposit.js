/**
 * ‘OŽó‹à
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Sep 2022     zhou
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
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	//20220915 add by zhou start U830
	var customform = nlapiGetFieldValue('customform')
	if(name == 'salesorder' && customform == '161'){
		var soid = nlapiGetFieldValue('salesorder')
		if(!isEmpty(soid)){
			var soLoading = nlapiLoadRecord('salesorder',soid);
			var project = soLoading.getFieldValue('custbody_djkk_project');
			if(!isEmpty(project)){
				nlapiSetFieldValue('custbody_djkk_project',project)
			}
		}
	}
	//end
}
