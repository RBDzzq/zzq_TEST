/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
 define(['N/log'], function(log) {
var useType='';
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var currentRecord = scriptContext.currentRecord;
//        currentRecord.getField({fieldId: 'custrecord_djkk_delivery_phone_text'}).isDisplay = false;
        
    	var tmpShippingInfoSendType = currentRecord.getText({fieldId: 'custrecord_djkk_shippinginfosendtyp'});
// change by  zhou  2022/11/18 start
      useType=scriptContext.mode;
    	var cust = currentRecord.getValue({fieldId: 'customform'});
		/********************old***********************/
//    	if (tmpShippingInfoSendType != null && tmpShippingInfoSendType != '') {
// 			if (['ïsóv', 'å⁄ãqéQè∆'].indexOf(tmpShippingInfoSendType.toString()) >= 0) {
// 				currentRecord.setValue({
// 					fieldId: 'custrecord_djkk_shippinginfodesttyp',
// 					value: ''
// 				});
// 				currentRecord.getField({
// 					fieldId: 'custrecord_djkk_shippinginfodesttyp'
// 				}).isDisabled = true;
// 			} else {
// 				currentRecord.setText({
// 					fieldId: 'custrecord_djkk_shippinginfodesttyp',
// 					text: 'î[ïiêÊ'
// 				});
// 				currentRecord.getField({
// 					fieldId: 'custrecord_djkk_shippinginfodesttyp'
// 				}).isDisabled = false;
// 			}
         /********************old***********************/
         /********************new***********************/
		if (tmpShippingInfoSendType != null && tmpShippingInfoSendType != '' && cust != '28'&&useType=='create') {
			if (['ïsóv', 'å⁄ãqéQè∆'].indexOf(tmpShippingInfoSendType.toString()) >= 0) {
				currentRecord.setValue({
					fieldId: 'custrecord_djkk_shippinginfodesttyp',
					value: ''
				});
				currentRecord.getField({
					fieldId: 'custrecord_djkk_shippinginfodesttyp'
				}).isDisabled = true;
			} else {
				currentRecord.setText({
					fieldId: 'custrecord_djkk_shippinginfodesttyp',
					text: 'î[ïiêÊ'
				});
				currentRecord.getField({
					fieldId: 'custrecord_djkk_shippinginfodesttyp'
				}).isDisabled = false;
			}
		
      /********************new***********************/
// change by  zhou  2022/11/18 end
		}
    	
		var tmpFromDate = currentRecord.getValue({fieldId: 'custrecord_djkk_itemtempapplyfromdate'});
		var tmpToDate = currentRecord.getValue({fieldId: 'custrecord_djkk_itemtempapplytodate'});
		if ((tmpFromDate != null && tmpFromDate != '') && (tmpToDate != null && tmpToDate != '')) {
			currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplyfromdate'}).isMandatory = false;
			currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplytodate'}).isMandatory = false;
		} else if ((tmpFromDate != null && tmpFromDate != '') || (tmpToDate != null && tmpToDate != '')){
			if (tmpFromDate != null && tmpFromDate != '') {
				currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplyfromdate'}).isMandatory = false;
				currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplytodate'}).isMandatory = true;	
			} else {
				currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplyfromdate'}).isMandatory = true;
				currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplytodate'}).isMandatory = false;
			}
			
		} else {
			currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplyfromdate'}).isMandatory = false;
			currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplytodate'}).isMandatory = false;
		}
		
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.line - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     */
    function fieldChanged(scriptContext) {
    	var currentRecord = scriptContext.currentRecord;

    	var fieldId = scriptContext.fieldId;
    	
//    	if (fieldId == 'custrecord_djkk_delivery_phone_number') {
//    		try {
//            	var tmpPhone = currentRecord.getText({fieldId: 'custrecord_djkk_delivery_phone_number'});
//            	currentRecord.setValue({
//            		fieldId: 'custrecord_djkk_delivery_phone_text',
//            		value: tmpPhone
//            	});
//        	} catch(error) {
//        		log.error({
//        			title: 'fieldChange',
//        			details: error.message
//        		});
//        	}	
//    	}

// change by  zhou  2022/11/18 start
		/********************old***********************/
//    	if (fieldId == 'custrecord_djkk_shippinginfosendtyp') {
//    		var tmpShippingInfoSendType = currentRecord.getText({fieldId: 'custrecord_djkk_shippinginfosendtyp'});
//    		if (tmpShippingInfoSendType != null && tmpShippingInfoSendType != '') {
//    			if (['ïsóv', 'å⁄ãqéQè∆'].indexOf(tmpShippingInfoSendType.toString()) >= 0) {
//    				currentRecord.setValue({
//    					fieldId: 'custrecord_djkk_shippinginfodesttyp',
//    					value: ''
//    				});
//    				currentRecord.getField({
//    					fieldId: 'custrecord_djkk_shippinginfodesttyp'
//    				}).isDisabled = true;
//    			} else {
//    				currentRecord.setText({
//    					fieldId: 'custrecord_djkk_shippinginfodesttyp',
//    					text: 'î[ïiêÊ'
//    				});
//    				currentRecord.getField({
//    					fieldId: 'custrecord_djkk_shippinginfodesttyp'
//    				}).isDisabled = false;
//    			}
//    		}
//    	}
         /********************old***********************/
         /********************new***********************/
    	if (fieldId == 'custrecord_djkk_shippinginfosendtyp' && currentRecord.getValue({fieldId: 'customform'}) != '28'&&useType=='create') {
    		var tmpShippingInfoSendType = currentRecord.getText({fieldId: 'custrecord_djkk_shippinginfosendtyp'});
    		if (tmpShippingInfoSendType != null && tmpShippingInfoSendType != '') {
    			if (['ïsóv', 'å⁄ãqéQè∆'].indexOf(tmpShippingInfoSendType.toString()) >= 0) {
    				currentRecord.setValue({
    					fieldId: 'custrecord_djkk_shippinginfodesttyp',
    					value: ''
    				});
    				currentRecord.getField({
    					fieldId: 'custrecord_djkk_shippinginfodesttyp'
    				}).isDisabled = true;
    			} else {
    				currentRecord.setText({
    					fieldId: 'custrecord_djkk_shippinginfodesttyp',
    					text: 'î[ïiêÊ'
    				});
    				currentRecord.getField({
    					fieldId: 'custrecord_djkk_shippinginfodesttyp'
    				}).isDisabled = false;
    			}
    		}
    	}
		
      /********************new***********************/
// change by  zhou  2022/11/18 end
    	
    	if (fieldId == 'custrecord_djkk_itemtempapplyfromdate' || fieldId == 'custrecord_djkk_itemtempapplytodate') {
    		var tmpFromDate = currentRecord.getValue({fieldId: 'custrecord_djkk_itemtempapplyfromdate'});
    		var tmpToDate = currentRecord.getValue({fieldId: 'custrecord_djkk_itemtempapplytodate'});
    		if ((tmpFromDate != null && tmpFromDate != '') && (tmpToDate != null && tmpToDate != '')) {
    			currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplyfromdate'}).isMandatory = false;
    			currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplytodate'}).isMandatory = false;
    		} else if ((tmpFromDate != null && tmpFromDate != '') || (tmpToDate != null && tmpToDate != '')){
    			if (tmpFromDate != null && tmpFromDate != '') {
    				currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplyfromdate'}).isMandatory = false;
    				currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplytodate'}).isMandatory = true;	
    			} else {
    				currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplyfromdate'}).isMandatory = true;
    				currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplytodate'}).isMandatory = false;
    			}
    			
    		} else {
    			currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplyfromdate'}).isMandatory = false;
    			currentRecord.getField({fieldId: 'custrecord_djkk_itemtempapplytodate'}).isMandatory = false;
    		}
    	}
    	
    	
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
    * Function to be executed after sublist is inserted, removed, or edited.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    *
    * @since 2015.2
    */
    function sublistChanged(scriptContext) {
    }

    /**
    * Function to be executed after line is selected.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    *
    * @since 2015.2
    */
    function lineInit(scriptContext) {

    }

    /**
    * Validation function to be executed when field is changed.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    * @param {string} scriptContext.fieldId - Field name
    * @param {number} scriptContext.line - Line number. Will be undefined if not a sublist or matrix field
    * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
    *
    * @returns {boolean} Return true if field is valid
    *
    */
    function validateField(scriptContext) {
        return true;
    }

    /**
    * Validation function to be executed when sublist line is committed.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    *
    * @returns {boolean} Return true if sublist line is valid
    *
    */
    function validateLine(scriptContext) {
        return true;
    }

    /**
    * Validation function to be executed when sublist line is inserted.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    *
    * @returns {boolean} Return true if sublist line is valid
    *
    */
    function validateInsert(scriptContext) {
        return true;
    }

    /**
    * Validation function to be executed when record is deleted.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    *
    * @returns {boolean} Return true if sublist line is valid
    *
    */
    function validateDelete(scriptContext) {
        return true;
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     */
    function saveRecord(scriptContext) {
    	var currentRecord = scriptContext.currentRecord;
    	
    	var tmpPhone = currentRecord.getValue({fieldId: 'custrecord_djkk_delivery_phone_number'});
    	log.debug({
    		title: 'tmpPhone',
    		details: tmpPhone
    	});
    	currentRecord.setValue({
    		fieldId: 'custrecord10',
    		value: tmpPhone
    	})
        return true;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord
    };
});