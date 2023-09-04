/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search'], function(search) {
	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {string} scriptContext.type - Trigger type
	 * @param {Form} scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function beforeLoad(scriptContext) {
		var currentForm = scriptContext.form;
		var phoneField = currentForm.getField({id: 'custrecord_djkk_delivery_phone_text'});
		phoneField.updateDisplayType({
			displayType: 'hidden' 
		});
	}
	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @param {string} scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function beforeSubmit(scriptContext) {
		//changByWang230129 CH198
		var currentRecord = scriptContext.newRecord;
		var areaValue = currentRecord.getValue({fieldId: 'custrecord_djkk_area'});
		var areasubValue = currentRecord.getValue({fieldId: 'custrecord_djkk_area_subdivision'});
		if(!(areaValue === undefined || areaValue == null || areaValue === '')){
			var searchAreaRec = search.lookupFields({
	            type: 'customlist_djkk_area',
	            id: areaValue,
	            columns: [
	                'name'
	            ]
	        });
	        var areaText = searchAreaRec.name;
			
			currentRecord.setValue({
	        fieldId: 'custrecord_djkk_area_pdf_show',
	        value : areaText
			})
			//20230412 changed by zhou start
			/*********old**********/
//			var searchSubAreaRec = search.lookupFields({
//		            type: 'customrecord_djkk_area_subdivision',
//		            id: areasubValue,
//		            columns: [
//		                'name'
//		            ]
//		        });
			/*********old**********/
			/*********new**********/
			if(!(areasubValue === undefined || areasubValue == null || areasubValue === '')){
		        var searchSubAreaRec = search.lookupFields({
		            type: 'customrecord_djkk_area_subdivision',
		            id: areasubValue,
		            columns: [
		                'name'
		            ]
		        });
	     	
			/*********new**********/
			//20230412 changed by zhou end
	        var areaSubText = searchSubAreaRec.name;
			
			currentRecord.setValue({
	        fieldId: 'custrecord_djkk_area_sub_pdf_show',
	        value : areaSubText
			})
			}
		}
		
		
		// DJ_納品先表示名 = DJ_納品先コード + DJ_納品先表示名
		var deliveryCode = currentRecord.getValue({fieldId: 'custrecord_djkk_delivery_code'});
		var deliveryname = currentRecord.getValue({fieldId: 'custrecorddjkk_name'});
		currentRecord.setValue({
	        fieldId: 'name',
	        value : deliveryCode + ' '+ deliveryname
			})
		
	}

	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @param {string} scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function afterSubmit(scriptContext) {
	}
	return {
		beforeLoad: beforeLoad,
		beforeSubmit : beforeSubmit,
		afterSubmit : afterSubmit
	};
});
