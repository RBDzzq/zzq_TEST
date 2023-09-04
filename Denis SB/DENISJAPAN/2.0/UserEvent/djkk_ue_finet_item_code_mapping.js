/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime'], function(record, search, runtime) {
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
		if (runtime.executionContext != runtime.ContextType.CSV_IMPORT) {
			var nameField = currentForm.getField({id: 'name'});
			nameField.updateDisplayType({
				displayType: 'disabled' 
			});
		}
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
		var type = scriptContext.type;
		if (type != scriptContext.UserEventType.DELETE) {
			var newRecord = scriptContext.newRecord;
			var recordId = newRecord.id;
			var recordType = newRecord.type;
			var currentRecord = record.load({
				type: recordType,
				id: recordId
			});
			
			currentRecord.setValue({
				fieldId: 'externalid',
				value: currentRecord.getValue({fieldId: 'name'})
			});

			var ficmItemId = currentRecord.getValue({
				fieldId: 'custrecord_djkk_ficm_item'
			});

			var tmpItemDisplayName = '';
			var tmpItemProductCode = '';

			if (ficmItemId != null && ficmItemId != '') {
				var itemInfo = search.lookupFields({
					type: search.Type.ITEM,
					id: ficmItemId,
					columns: [
						'displayname',
						'custitem_djkk_product_code'
					]
				});
				tmpItemDisplayName = itemInfo['displayname']
				tmpItemProductCode = itemInfo['custitem_djkk_product_code'];
				
			}

			// 「DJ_商品名」
			currentRecord.setValue({
				fieldId: 'custrecord_djkk_ficm_item_name',
				value: tmpItemDisplayName
			});
			// 「DJ_カタログ製品コード」
			currentRecord.setValue({
				fieldId: 'custrecord_djkk_ficm_product_code',
				value: tmpItemProductCode
			});

			currentRecord.save();
		}
	}
	return {
		beforeLoad: beforeLoad,
		beforeSubmit : beforeSubmit,
		afterSubmit : afterSubmit
	};
});