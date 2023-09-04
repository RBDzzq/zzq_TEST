/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([], function() {

    /**
     * Function to be executed when field is changed.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

        var curRec = scriptContext.currentRecord;
        if (scriptContext.fieldId == 'custpage_djkk_approval_user') {

            var customApprUser = curRec.getValue('custpage_djkk_approval_user');

            var dealType = getApprovalObj(curRec.type);

            if (dealType == '3') {
                curRec.setValue({
                    fieldId : 'custitem_djkk_approval_user',
                    value : customApprUser,
                    ignoreFieldChange : true
                });
            } else {
                curRec.setValue({
                    fieldId : 'custentity_djkk_approval_user',
                    value : customApprUser,
                    ignoreFieldChange : true
                });
            }
        }
    }

    /**
     * è≥îFëŒè€ÇéÊìæÇ∑ÇÈ
     */
    function getApprovalObj(recType) {

        var result = '9';

        if (recType == 'customer') {
            result = '1';
        } else if (recType == 'vendor') {
            result = '2';
        } else if (recType.match('item')) {
            result = '3';
        }

        return result;
    }

    return {
        fieldChanged : fieldChanged
    };
});
