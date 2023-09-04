/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
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
    	useType=scriptContext.mode;
//	      
	  	var tmpShippingInfoSendType = currentRecord.getText({fieldId: 'custentity_djkk_shippinginfosendtyp'});
// change by  zhou  2022/11/18 start
    	var cust = currentRecord.getValue({fieldId: 'customform'});
		/********************old***********************/
//    	if (tmpShippingInfoSendType != null && tmpShippingInfoSendType != '') {
//			if (tmpShippingInfoSendType == '•s—v') {
//				currentRecord.setValue({
//					fieldId: 'custentity_djkk_shippinginfodesttyp',
//					value: ''
//				});
//				currentRecord.getField({
//					fieldId: 'custentity_djkk_shippinginfodesttyp'
//				}).isDisabled = true;
//			} else {
//				currentRecord.setText({
//					fieldId: 'custentity_djkk_shippinginfodesttyp',
//					text: 'ŒÚ‹qæ'
//				});
//				currentRecord.getField({
//					fieldId: 'custentity_djkk_shippinginfodesttyp'
//				}).isDisabled = false;
//			}
//		}
         /********************old***********************/
         /********************new***********************/
    	if (tmpShippingInfoSendType != null && tmpShippingInfoSendType != '' && cust != '128'&&useType=='create') {
			if (tmpShippingInfoSendType == '•s—v') {
				currentRecord.setValue({
					fieldId: 'custentity_djkk_shippinginfodesttyp',
					value: ''
				});
				currentRecord.getField({
					fieldId: 'custentity_djkk_shippinginfodesttyp'
				}).isDisabled = true;
			} else {
				currentRecord.setText({
					fieldId: 'custentity_djkk_shippinginfodesttyp',
					text: 'ŒÚ‹qæ'
				});
				currentRecord.getField({
					fieldId: 'custentity_djkk_shippinginfodesttyp'
				}).isDisabled = false;
			}
		}
      /********************new***********************/
// change by  zhou  2022/11/18 end
		
		
		
		
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
    	var currentRecord = scriptContext.currentRecord;

    	var fieldId = scriptContext.fieldId;
//	
// change by  zhou  2022/11/18 start
        /********************old***********************/
//    	if (fieldId == 'custentity_djkk_shippinginfosendtyp') {
//    		var tmpShippingInfoSendType = currentRecord.getText({fieldId: 'custentity_djkk_shippinginfosendtyp'});
//    		if (tmpShippingInfoSendType != null && tmpShippingInfoSendType != '') {
//    			if (tmpShippingInfoSendType == '•s—v') {
//    				currentRecord.setValue({
//    					fieldId: 'custentity_djkk_shippinginfodesttyp',
//    					value: ''
//    				});
//    				currentRecord.getField({
//    					fieldId: 'custentity_djkk_shippinginfodesttyp'
//    				}).isDisabled = true;
//    			} else {
//    				currentRecord.setText({
//    					fieldId: 'custentity_djkk_shippinginfodesttyp',
//    					text: 'ŒÚ‹qæ'
//    				});
//    				currentRecord.getField({
//    					fieldId: 'custentity_djkk_shippinginfodesttyp'
//    				}).isDisabled = false;
//    			}
//    		}
//    	}
    	/********************old***********************/
        /********************new***********************/
    	if (fieldId == 'custentity_djkk_shippinginfosendtyp' && currentRecord.getValue({fieldId: 'customform'})!= '128'&&useType=='create') {
    		var tmpShippingInfoSendType = currentRecord.getText({fieldId: 'custentity_djkk_shippinginfosendtyp'});
    		if (tmpShippingInfoSendType != null && tmpShippingInfoSendType != '') {
    			if (tmpShippingInfoSendType == '•s—v') {
    				currentRecord.setValue({
    					fieldId: 'custentity_djkk_shippinginfodesttyp',
    					value: ''
    				});
    				currentRecord.getField({
    					fieldId: 'custentity_djkk_shippinginfodesttyp'
    				}).isDisabled = true;
    			} else {
    				currentRecord.setText({
    					fieldId: 'custentity_djkk_shippinginfodesttyp',
    					text: 'ŒÚ‹qæ'
    				});
    				currentRecord.getField({
    					fieldId: 'custentity_djkk_shippinginfodesttyp'
    				}).isDisabled = false;
    			}
    		}
    	}
        /********************new***********************/
// change by  zhou  2022/11/18 end    	
    	
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
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

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
     * @since 2015.2
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
     * @since 2015.2
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
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	var currentRecord = scriptContext.currentRecord;
    	var tmpPhone = currentRecord.getText({fieldId: 'phone'});
    	var tmpFax = currentRecord.getText({fieldId: 'fax'});
    	console.log(tmpPhone);
    	console.log(tmpFax);
    	currentRecord.setValue({fieldId: 'custentity_djkk_exsystem_phone_text', value: tmpPhone});
    	currentRecord.setValue({fieldId: 'custentity_djkk_exsystem_fax_text', value: tmpFax});
    	return true;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
//        postSourcing: postSourcing,
//        sublistChanged: sublistChanged,
//        lineInit: lineInit,
//        validateField: validateField,
//        validateLine: validateLine,
//        validateInsert: validateInsert,
//        validateDelete: validateDelete,
        saveRecord: saveRecord
    };
    
});
