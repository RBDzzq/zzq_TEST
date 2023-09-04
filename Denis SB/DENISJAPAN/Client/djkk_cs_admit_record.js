/**
 * DJ_�g�����U�N�V�������F�Ǘ��\CS
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/05/29      �v
 *
 */

var landed_cost = '20';//DJ_�A�����|
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
	if(type == 'create' || type == 'edit' ||  type == 'copy'){
		setHiddenField();
	}
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
	if(name == 'custrecord_djkk_trans_appr_obj'){
		setHiddenField();
	}
}


function setHiddenField(){
	//���F�Ώ�
	var apprObj = nlapiGetFieldValue('custrecord_djkk_trans_appr_obj');
	if(!isEmpty(apprObj) && apprObj == landed_cost){
		//��l���F���[��
		setFieldDisableType('custrecord_djkk_trans_appr4_role', 'hidden');
	}else{
		setFieldDisableType('custrecord_djkk_trans_appr4_role', 'normal');
	}
}