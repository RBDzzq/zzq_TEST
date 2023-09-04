/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([], function() {

    /**
     * Function to be executed after page is initialized.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     * @since 2015.2
     */
    function pageInit(scriptContext) {

        var mode = scriptContext.mode;
        var curRec = scriptContext.currentRecord;
        var recType = curRec.type;
        if (mode == 'create' || mode == 'copy') {
            if (recType == 'invoice') {
                var objField = curRec.getField({
                    fieldId : 'approvalstatus'
                });
                var subsidiary = curRec.getValue('subsidiary');
                if (subsidiary) {
                    if (subsidiary == 2 || subsidiary == 4) {
                        if (objField) {
                            // DJ_承認処理フラグ
                            var apprFlg = curRec.getValue('custbody_djkk_trans_appr_deal_flg');
                            if (apprFlg) {
                                curRec.setValue({
                                    fieldId : 'approvalstatus',
                                    value : 1,
                                    ignoreFieldChange : true
                                });
                                objField.isDisabled = true;
                            } else {
                                objField.isDisabled = false;
                            }
                        }
                    }
                } else {
                    if (objField) {
                        var apprFlg = curRec.getValue('custbody_djkk_trans_appr_deal_flg');
                        if (apprFlg) {
                            objField.isDisabled = true;
                        } else {
                            objField.isDisabled = false;
                        }
                    }
                }
            }
        }
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
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

        if (scriptContext.fieldId == 'custbody_djkk_trans_appr_deal_flg' || scriptContext.fieldId == 'subsidiary') {
            var curRec = scriptContext.currentRecord;
            var subsidiary = curRec.getValue('subsidiary');
            var objField = curRec.getField({
                fieldId : 'approvalstatus'
            });
            if (subsidiary) {
                if (subsidiary == 2 || subsidiary == 4) {
                    if (objField) {
                        // DJ_承認処理フラグ
                        var apprFlg = curRec.getValue('custbody_djkk_trans_appr_deal_flg');
                        if (apprFlg) {
                            curRec.setValue({
                                fieldId : 'approvalstatus',
                                value : 1,
                                ignoreFieldChange : true
                            });
                            objField.isDisabled = true;
                        } else {
                            objField.isDisabled = false;
                        }
                    }
                }
            } else {
                if (objField) {
                    var apprFlg = curRec.getValue('custbody_djkk_trans_appr_deal_flg');
                    if (apprFlg) {
                        curRec.setValue({
                            fieldId : 'approvalstatus',
                            value : 1,
                            ignoreFieldChange : true
                        });
                        objField.isDisabled = true;
                    } else {
                        objField.isDisabled = false;
                    }
                }
            }
        }
    }

    return {
        pageInit : pageInit,
        fieldChanged : fieldChanged
    };
});
