/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/https', 'N/url', 'N/search'], function(dialog, currentRecord, https, url, search) {

    // �A��
    var subsidiaryIdList = [];
    subsidiaryIdList.push('2');
    subsidiaryIdList.push('4');

    // �\���t�B�[���h
    var fieldIdList = [];
    fieldIdList.push('custbody_djkk_estimate_excel_type');
    fieldIdList.push('custbody_djkk_estimate_yukou_kikan');
    fieldIdList.push('custbody_djkk_estimate_pay_conditons');
    fieldIdList.push('custbody_djkk_estimate_nouhin_date');
    fieldIdList.push('custbody_djkk_estimate_po_conditons');
    // ��\���t�B�[���h
    var unFieldIdList = [];
    unFieldIdList.push('custbody_djkk_estimate_excel_type');
    unFieldIdList.push('custbody_djkk_estimate_yukou_kikan');
    unFieldIdList.push('custbody_djkk_estimate_pay_conditons');
    unFieldIdList.push('custbody_djkk_estimate_nouhin_date');
    unFieldIdList.push('custbody_djkk_estimate_po_conditons');
    unFieldIdList.push('custbody_djkk_estimate_po_conditon_a');
    unFieldIdList.push('custbody_djkk_estimate_po_conditon_b1');
    unFieldIdList.push('custbody_djkk_estimate_po_conditon_b2');
    unFieldIdList.push('custbody_djkk_estimate_po_conditon_c');
    unFieldIdList.push('custbody_djkk_estimate_po_conditon_d');

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
        var subsidiary = curRec.getValue('subsidiary');
//        if (mode == 'create') {
//        	  if (subsidiaryIdList.indexOf(subsidiary) != -1) {
//                  showFieldMethod(curRec);
//              } else {
//                  unshowFieldMethod(curRec);
//              }      
//        } else if (mode == 'copy' || mode == 'edit') {         
//            if (subsidiaryIdList.indexOf(subsidiary) != -1) {
//                showFieldMethod(curRec);
//                var epoc = curRec.getValue('custbody_djkk_estimate_po_conditons');
//                if (epoc == '1') {
//                    showSubFieldMethod(curRec, subFieldAList);
//                } else {
//                    unShowSubFieldMethod(curRec, subFieldAList);
//                }
//
//                if (epoc == '2') {
//                    var subsidiary = curRec.getValue('subsidiary');
//                    showSubFieldMethod(curRec, subFieldB1List);
//                    if (subsidiaryIdList[0] == subsidiary) {
//                        showSubFieldMethod(curRec, subFieldB2List);
//                    }
//                } else {
//                    unShowSubFieldMethod(curRec, subFieldB1List);
//                    unShowSubFieldMethod(curRec, subFieldB2List);
//                }
//
//                if (epoc == '3') {
//                    showSubFieldMethod(curRec, subFieldCList);
//                } else {
//                    unShowSubFieldMethod(curRec, subFieldCList);
//                }
//
//                if (epoc == '5') {
//                    showSubFieldMethod(curRec, subFieldDList);
//                } else {
//                    unShowSubFieldMethod(curRec, subFieldDList);
//                }
//            } else {
//                unshowFieldMethod(curRec);
//            }
//        }
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

        var curRec = scriptContext.currentRecord;

        if (scriptContext.fieldId == 'subsidiary') {
            var subsidiary = curRec.getValue('subsidiary');
            if (subsidiaryIdList.indexOf(subsidiary) != -1) {
                showFieldMethod(curRec);
            } else {
                unshowFieldMethod(curRec);
                // DJ_����_�G�N�Z�����
                curRec.setValue({
                    fieldId : unFieldIdList[0],
                    value : '',
                    ignoreFieldChange : true
                });
                // DJ_����_��������
                curRec.setValue({
                    fieldId : unFieldIdList[4],
                    value : '',
                    ignoreFieldChange : true
                });
            }
        }

//        if (scriptContext.fieldId == 'custbody_djkk_estimate_po_conditons') {
//            var epoc = curRec.getValue('custbody_djkk_estimate_po_conditons');
//            if (epoc == '1') {
//                showSubFieldMethod(curRec, subFieldAList);
//            } else {
//                unShowSubFieldMethod(curRec, subFieldAList);
//                // DJ_����_��������_1��̍Œᔭ������(�z�����b�g)
//                curRec.setValue({
//                    fieldId : subFieldAList[0],
//                    value : '',
//                    ignoreFieldChange : true
//                });
//            }
//
//            if (epoc == '2') {
//                var subsidiary = curRec.getValue('subsidiary');
//                showSubFieldMethod(curRec, subFieldB1List);
//                if (subsidiaryIdList[0] == subsidiary) {
//                    showSubFieldMethod(curRec, subFieldB2List);
//                }
//            } else {
//                unShowSubFieldMethod(curRec, subFieldB1List);
//                unShowSubFieldMethod(curRec, subFieldB2List);
//                // DJ_����_��������_�z����_���z
//                curRec.setValue({
//                    fieldId : subFieldB1List[0],
//                    value : '',
//                    ignoreFieldChange : true
//                });
//                // DJ_����_��������_�z����_�P�[�X
//                curRec.setValue({
//                    fieldId : subFieldB2List[0],
//                    value : '',
//                    ignoreFieldChange : true
//                });
//            }
//
//            if (epoc == '3') {
//                showSubFieldMethod(curRec, subFieldCList);
//            } else {
//                unShowSubFieldMethod(curRec, subFieldCList);
//                // DJ_����_��������_�[�i�ꏊ
//                curRec.setValue({
//                    fieldId : subFieldCList[0],
//                    value : '',
//                    ignoreFieldChange : true
//                });
//            }
//
//            if (epoc == '5') {
//                showSubFieldMethod(curRec, subFieldDList);
//            } else {
//                unShowSubFieldMethod(curRec, subFieldDList);
//                // DJ_����_��������_FAX�ɂĒ���
//                curRec.setValue({
//                    fieldId : subFieldDList[0],
//                    value : '',
//                    ignoreFieldChange : true
//                });
//            }
//        }
    }

    /**
     * ���ڕ\��
     */
    function showFieldMethod(curRec) {
        for (var i = 0; i < fieldIdList.length; i++) {
            var tmpFieldId = fieldIdList[i];
            var tmpFieldObj = curRec.getField({
                fieldId : tmpFieldId
            });
            if (tmpFieldObj) {
                tmpFieldObj.isDisplay = true;
            }
        }
    }

    /**
     * ���ڔ�\��
     */
    function unshowFieldMethod(curRec) {
        for (var i = 0; i < unFieldIdList.length; i++) {
            var tmpFieldId = unFieldIdList[i];
            var tmpFieldObj = curRec.getField({
                fieldId : tmpFieldId
            });
            if (tmpFieldObj) {
                tmpFieldObj.isDisplay = false;
            }
        }
    }

    /**
     * ���ڕ\��
     */
    function showSubFieldMethod(curRec, idList) {
        for (var i = 0; i < idList.length; i++) {
            var tmpFieldId = idList[i];
            var tmpFieldObj = curRec.getField({
                fieldId : tmpFieldId
            });
            if (tmpFieldObj) {
                tmpFieldObj.isDisplay = true;
            }
        }
    }

    /**
     * ���ڕ\��
     */
    function unShowSubFieldMethod(curRec, idList) {
        for (var i = 0; i < idList.length; i++) {
            var tmpFieldId = idList[i];
            var tmpFieldObj = curRec.getField({
                fieldId : tmpFieldId
            });
            if (tmpFieldObj) {
                tmpFieldObj.isDisplay = false;
            }
        }
    }

    /**
     * �G�N�Z���o��
     */
    function doExcel() {
        var crRecord = currentRecord.get();

        // ���ς̓���ID
        var estimateId = crRecord.id;
        var searchField = 'custbody_djkk_estimate_excel_type';

        // DJ_����_�G�N�Z����ނ̎擾
        var searchObject = search.lookupFields({
            type : search.Type.ESTIMATE,
            id : estimateId,
            columns : searchField
        });
        var estimateExcelType = searchObject[searchField][0].value;

        if (estimateExcelType) {
            // ��{�p�^�[��(NBKK)_FS_RE
            if (estimateExcelType == '1') {
                outputExcel('customscript_djkk_sl_nbkk_basic_pattern', 'customdeploy_djkk_sl_nbkk_basic_pattern', {
                    'estimateId' : estimateId
                });
            }

            // �������p(NBKK)_RE
            if (estimateExcelType == '2') {
                outputExcel('customscript_djkk_sl_nbkk_immediate_pull', 'customdeploy_djkk_sl_nbkk_immediate_pull', {
                    'estimateId' : estimateId
                });
            }

            // ��{�{���i��ċL���ǉ��{�ǉ���]����(NBKK)_RE
            if (estimateExcelType == '3') {
                outputExcel('customscript_djkk_sl_nbkk_basic_ppea_adi', 'customdeploy_djkk_sl_nbkk_basic_ppea_adi', {
                    'estimateId' : estimateId
                });
            }

            // ��{�p�^�[��(UL)
            if (estimateExcelType == '4') {
                outputExcel('customscript_djkk_sl_ul_basic_pattern', 'customdeploy_djkk_sl_ul_basic_pattern', {
                    'estimateId' : estimateId
                });
            }

            // ��{�{�ǉ���]���� + ���i��ċL���ǉ�(UL)
            if (estimateExcelType == '5') {
                outputExcel('customscript_djkk_sl_ul_basic_ppea_adi', 'customdeploy_djkk_sl_ul_basic_ppea_adi', {
                    'estimateId' : estimateId
                });
            }
        }
    }

    /**
     * �G�N�Z���o��
     */
    function outputExcel(scriptId, deploymentId, params) {
        var scriptUrl = url.resolveScript({
            scriptId : scriptId,
            deploymentId : deploymentId,
            params : params
        });

        var body = {};

        var response = https.post({
            url : scriptUrl,
            body : body
        });

        var body = response.body;
        if (body) {
            if (body.slice(0, 6) == 'ERROR_') {
                dialog.alert({
                    title : '�G���[',
                    message : body.replace(/ERROR_/, '')
                });
            } else {
                window.open(response.body);
            }
        }
    }

    return {
        pageInit : pageInit,
        fieldChanged : fieldChanged,
        doExcel : doExcel
    };
});
