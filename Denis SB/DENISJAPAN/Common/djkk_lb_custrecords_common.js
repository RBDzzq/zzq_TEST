/**
 * カスタムレコードの共通Client/UserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/12/08     CPC_苑
 *
 */
var formType='';
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function commonclientPageInit(type){
	formType=type;
	var recordType = nlapiGetRecordType();
	
	// DJ_販売店/DJ_医療機関
	if(recordType=='customrecord_djkk_sales_outlet'||recordType=='customrecord_djkk_medical_institution'){
		if(type == 'create'){
		       nlapiSetFieldValue('name', '自動採番');
		       nlapiDisableField('name', true);
		    }
		
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
function commonclientFieldChanged(type, name, linenum){
	var recordType = nlapiGetRecordType();
	
	// DJ_販売店
	if(recordType=='customrecord_djkk_sales_outlet'){
		if (name == 'custrecord_djkk_so_postal_code') {
			var zipcode = replaceExceptNumber(nlapiGetFieldValue('custrecord_djkk_so_postal_code'));
			var codeSearch = nlapiSearchRecord("customrecord_djkk_postal_code",
					null, [ [ "custrecord_djkk_postal_code", "is", zipcode ] ], [
							new nlobjSearchColumn("custrecord_djkk_state"),
							new nlobjSearchColumn("custrecord_djkk_city"),
							new nlobjSearchColumn("custrecord_djkk_address") ]);
			if (!isEmpty(codeSearch)) {
				nlapiSetFieldValue('custrecord_djkk_so_prefectures', codeSearch[0]
						.getText('custrecord_djkk_state'));
				nlapiSetFieldValue('custrecord_djkk_so_municipalities', codeSearch[0]
						.getValue('custrecord_djkk_city'));
				nlapiSetFieldValue('custrecord_djkk_so_dealer_address1', codeSearch[0]
						.getValue('custrecord_djkk_address'),false,true);
			} else {
				nlapiSetFieldValue('custrecord_djkk_so_prefectures', '');
				nlapiSetFieldValue('custrecord_djkk_so_municipalities', '');
				nlapiSetFieldValue('custrecord_djkk_so_dealer_address1', '',false,true);
			}
		}
		if (name == 'custrecord_djkk_so_dealer_address1') {
			var addr1 = nlapiGetFieldValue('custrecord_djkk_so_dealer_address1');
			var zip =nlapiGetFieldValue('custrecord_djkk_so_postal_code');
			if (!isEmpty(addr1)&&isEmpty(zip)) {
			var addSearch = nlapiSearchRecord("customrecord_djkk_postal_code",
					null, [ [ "custrecord_djkk_address", "contains", addr1 ] ], [
							new nlobjSearchColumn("custrecord_djkk_postal_code"),
							new nlobjSearchColumn("custrecord_djkk_state"),
							new nlobjSearchColumn("custrecord_djkk_city") ]);
			if (!isEmpty(addSearch)) {
				nlapiSetFieldValue('custrecord_djkk_so_prefectures', addSearch[0]
						.getText('custrecord_djkk_state'));
				nlapiSetFieldValue('custrecord_djkk_so_municipalities', addSearch[0]
						.getValue('custrecord_djkk_city'));
				nlapiSetFieldValue('custrecord_djkk_so_postal_code', addSearch[0]
						.getValue('custrecord_djkk_postal_code'),false,true);
			} else {
//				nlapiSetFieldValue('custrecord_djkk_so_prefectures', '');
//				nlapiSetFieldValue('custrecord_djkk_so_municipalities', '');
//				nlapiSetFieldValue('custrecord_djkk_so_postal_code', '',false,true);
			}
		}
		}
	}
	
	// DJ_医療機関
	else if(recordType=='customrecord_djkk_medical_institution'){

		if (name == 'custrecord_djkk_mi_postal_code') {
			var zipcode = replaceExceptNumber(nlapiGetFieldValue('custrecord_djkk_mi_postal_code'));
			var codeSearch = nlapiSearchRecord("customrecord_djkk_postal_code",
					null, [ [ "custrecord_djkk_postal_code", "is", zipcode ] ], [
							new nlobjSearchColumn("custrecord_djkk_state"),
							new nlobjSearchColumn("custrecord_djkk_city"),
							new nlobjSearchColumn("custrecord_djkk_address") ]);
			if (!isEmpty(codeSearch)) {
				nlapiSetFieldValue('custrecord_djkk_mi_prefectures', codeSearch[0]
						.getText('custrecord_djkk_state'));
				nlapiSetFieldValue('custrecord_djkk_mi_municipalities', codeSearch[0]
						.getValue('custrecord_djkk_city'));
				nlapiSetFieldValue('custrecord_djkk_mi_medical_institution1', codeSearch[0]
						.getValue('custrecord_djkk_address'),false,true);
			} else {
				nlapiSetFieldValue('custrecord_djkk_mi_prefectures', '');
				nlapiSetFieldValue('custrecord_djkk_mi_municipalities', '');
				nlapiSetFieldValue('custrecord_djkk_mi_medical_institution1', '',false,true);
			}
		}
		if (name == 'custrecord_djkk_mi_medical_institution1') {
			var addr1 = nlapiGetFieldValue('custrecord_djkk_mi_medical_institution1');
			var zip = nlapiGetFieldValue('custrecord_djkk_mi_postal_code');
			if (!isEmpty(addSearch)&&isEmpty(zip)) {
			var addSearch = nlapiSearchRecord("customrecord_djkk_postal_code",
					null, [ [ "custrecord_djkk_address", "contains", addr1 ] ], [
							new nlobjSearchColumn("custrecord_djkk_postal_code"),
							new nlobjSearchColumn("custrecord_djkk_state"),
							new nlobjSearchColumn("custrecord_djkk_city") ]);
			if (!isEmpty(addSearch)) {
				nlapiSetFieldValue('custrecord_djkk_mi_prefectures', addSearch[0]
						.getText('custrecord_djkk_state'));
				nlapiSetFieldValue('custrecord_djkk_mi_municipalities', addSearch[0]
						.getValue('custrecord_djkk_city'));
				nlapiSetFieldValue('custrecord_djkk_mi_postal_code', addSearch[0]
						.getValue('custrecord_djkk_postal_code'),false,true);
			} else {
//				nlapiSetFieldValue('custrecord_djkk_mi_prefectures', '');
//				nlapiSetFieldValue('custrecord_djkk_mi_municipalities', '');
//				nlapiSetFieldValue('custrecord_djkk_mi_postal_code', '',false,true);
			}
		}
	}
	}
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function commonclientSaveRecord(){
	var returnType = true;
	
	var recordType = nlapiGetRecordType();
	// DJ_販売店
	if(recordType=='customrecord_djkk_sales_outlet'){
		 if (returnType&&(formType == 'create'||formType == 'copy')) {
			 nlapiSetFieldValue('name', nlapiGetFieldValue('custrecord_djkk_so_dealer_name')+' '+nlapiGetFieldValue('custrecord_djkk_so_dealer_id'), false, true);
		}		
	}
	
	// DJ_医療機関
	else if(recordType=='customrecord_djkk_medical_institution'){
		if (returnType&&(formType == 'create'||formType == 'copy')) {
			 nlapiSetFieldValue('name', nlapiGetFieldValue('custrecord_djkk_mi_medical_name')+' '+nlapiGetFieldValue('custrecord_djkk_mi_medical_id'), false, true);
		}
	}
    return returnType;
}
