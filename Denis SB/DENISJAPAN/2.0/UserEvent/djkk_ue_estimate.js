/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget'], function(serverWidget) {

    // 連結
    var subsidiaryIdList = [];
    subsidiaryIdList.push('2');
    subsidiaryIdList.push('4');

    // フィールド
    var fieldIdList = [];
    fieldIdList.push('custbody_djkk_estimate_excel_type');
    fieldIdList.push('custbody_djkk_estimate_yukou_kikan');
    fieldIdList.push('custbody_djkk_estimate_pay_conditons');
    fieldIdList.push('custbody_djkk_estimate_nouhin_date');
    fieldIdList.push('custbody_djkk_estimate_po_conditons');
    fieldIdList.push('custbody_djkk_estimate_po_conditon_a');
    fieldIdList.push('custbody_djkk_estimate_po_conditon_b1');
    fieldIdList.push('custbody_djkk_estimate_po_conditon_b2');
    fieldIdList.push('custbody_djkk_estimate_po_conditon_c');
    fieldIdList.push('custbody_djkk_estimate_po_conditon_d');

    var subFieldAList = [];
    subFieldAList.push('custbody_djkk_estimate_po_conditon_a');

    var subFieldB1List = [];
    subFieldB1List.push('custbody_djkk_estimate_po_conditon_b1');

    var subFieldB2List = [];
    subFieldB2List.push('custbody_djkk_estimate_po_conditon_b2');

    var subFieldCList = [];
    subFieldCList.push('custbody_djkk_estimate_po_conditon_c');

    var subFieldDList = [];
    subFieldDList.push('custbody_djkk_estimate_po_conditon_d');

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

        var form = scriptContext.form;

        if (scriptContext.type == 'view') {
            var newRecord = scriptContext.newRecord;
            var subsidiary = newRecord.getValue('subsidiary');
            if (subsidiaryIdList.indexOf(subsidiary) != -1) {
                var estimateExcelType = newRecord.getValue('custbody_djkk_estimate_excel_type');
                if (estimateExcelType) {
                    form.addButton({
                        id : 'custpage_btn_excel',
                        label : 'エクセル出力',
                        functionName : "doExcel();"
                    });
                    form.clientScriptModulePath = '../Client/djkk_cs_estimate_2.js';
                }
//                var epoc = newRecord.getValue('custbody_djkk_estimate_po_conditons');
//                if (epoc == '1') {
//                    showSubFieldMethod(form, subFieldAList);
//                } else {
//                    unShowSubFieldMethod(form, subFieldAList);
//                }
//
//                if (epoc == '2') {
//                    var subsidiary = newRecord.getValue('subsidiary');
//                    showSubFieldMethod(form, subFieldB1List);
//                    if (subsidiaryIdList[0] == subsidiary) {
//                        showSubFieldMethod(form, subFieldB2List);
//                    }
//                } else {
//                    unShowSubFieldMethod(form, subFieldB1List);
//                    unShowSubFieldMethod(form, subFieldB2List);
//                }
//
//                if (epoc == '3') {
//                    showSubFieldMethod(form, subFieldCList);
//                } else {
//                    unShowSubFieldMethod(form, subFieldCList);
//                }
//
//                if (epoc == '5') {
//                    showSubFieldMethod(form, subFieldDList);
//                } else {
//                    unShowSubFieldMethod(form, subFieldDList);
//                }
            } else {
                unshowFieldMethod(form);
            }
        }
    }

    return {
        beforeLoad : beforeLoad
    };

    /**
     * 項目表示
     */
    function showSubFieldMethod(form, idList) {
        for (var i = 0; i < idList.length; i++) {
            var tmpFieldId = idList[i];
            var tmpFieldObj = form.getField(tmpFieldId);
            if (tmpFieldObj) {
                tmpFieldObj.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.NORMAL
                });
            }
        }
    }

    /**
     * 項目非表示
     */
    function unShowSubFieldMethod(form, idList) {
        for (var i = 0; i < idList.length; i++) {
            var tmpFieldId = idList[i];
            var tmpFieldObj = form.getField(tmpFieldId);
            if (tmpFieldObj) {
                tmpFieldObj.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
            }
        }
    }

    /**
     * 項目非表示
     */
    function unshowFieldMethod(form) {
        for (var i = 0; i < fieldIdList.length; i++) {
            var tmpFieldId = fieldIdList[i];
            var tmpFieldObj = form.getField(tmpFieldId);
            if (tmpFieldObj) {
                tmpFieldObj.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
            }
        }
    }
});
