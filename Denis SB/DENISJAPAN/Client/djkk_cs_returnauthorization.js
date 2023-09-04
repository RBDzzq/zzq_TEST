/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/11/10     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientPageInit(type) {
	if(type == 'create'){
		var customform = nlapiGetFieldValue('customform');       // 128
		if(customform == '128'){
			var userRole=nlapiGetRole();  // 1012
			if(userRole == '1012'){
				nlapiSetFieldValue('custbody_djkk_trans_appr_create_role',userRole);
			}
		}
	}	
}

function clientFieldChanged(type, name, linenum){
if(type != 'item' &&(name=='subsidiary'||name=='entity'||name=='class')){
    	
    	var subsidiary=nlapiGetFieldValue('subsidiary');
    	if(!isEmpty(subsidiary)){
    	var DefLocation = nlapiSearchRecord("customrecord_djkk_po_default_in_location",null,
    			[
    			   ["custrecord_djkk_pod_subsidiary","anyof",subsidiary]
    			], 
    			[
    			   new nlobjSearchColumn("custrecord_djkk_pod_location")
    			]
    			);
    	if(!isEmpty(DefLocation)){
    		var DefLocationId=DefLocation[0].getValue('custrecord_djkk_pod_location');
    		nlapiSetFieldValue('location', DefLocationId, true, true);
    	}else{
    		nlapiSetFieldValue('location', null, true, true);
    	}
    	}
    }
if(type == 'item'){
	if (name == 'location') {
		nlapiSetCurrentLineItemValue('item', 'inventorylocation',
				nlapiGetCurrentLineItemValue('item', 'location'));
	}
}

	// 顧客入力場合、セクション自動設定 changed by geng
//	if (name == 'entity') {
//		var entity = nlapiGetFieldValue('entity');
//		if (!isEmpty(entity)) {
//			var department = nlapiLookupField('entity', entity,
//					'custentity_djkk_activity');
//			nlapiSetFieldValue('department', department);
//		}
//	}

//2022.03.30 geng start U314
if(name == 'entity'){
	var subsidiary = nlapiGetFieldValue('subsidiary');
	if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
		var entity = nlapiGetFieldValue('entity');
		
		var department = nlapiLookupField('customer', entity, 'custentity_djkk_activity');
		
		nlapiSetFieldValue('department',department);
	}
}
// end


				
				
			

}

