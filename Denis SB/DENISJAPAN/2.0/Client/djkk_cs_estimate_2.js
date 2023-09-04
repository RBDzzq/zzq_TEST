/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/https', 'N/url', 'N/search'], function(dialog, currentRecord, https, url, search) {

    // 連結
    var subsidiaryIdList = [];
    subsidiaryIdList.push('2');
    subsidiaryIdList.push('4');

    // 表示フィールド
    var fieldIdList = [];
    fieldIdList.push('custbody_djkk_estimate_excel_type');
    fieldIdList.push('custbody_djkk_estimate_yukou_kikan');
    fieldIdList.push('custbody_djkk_estimate_pay_conditons');
    fieldIdList.push('custbody_djkk_estimate_nouhin_date');
    fieldIdList.push('custbody_djkk_estimate_po_conditons');
    // 非表示フィールド
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
                // DJ_見積_エクセル種類
                curRec.setValue({
                    fieldId : unFieldIdList[0],
                    value : '',
                    ignoreFieldChange : true
                });
                // DJ_見積_発注条件
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
//                // DJ_見積_発注条件_1回の最低発注数量(配送ロット)
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
//                // DJ_見積_発注条件_配送料_金額
//                curRec.setValue({
//                    fieldId : subFieldB1List[0],
//                    value : '',
//                    ignoreFieldChange : true
//                });
//                // DJ_見積_発注条件_配送料_ケース
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
//                // DJ_見積_発注条件_納品場所
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
//                // DJ_見積_発注条件_FAXにて注文
//                curRec.setValue({
//                    fieldId : subFieldDList[0],
//                    value : '',
//                    ignoreFieldChange : true
//                });
//            }
//        }
    }

    /**
     * 項目表示
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
     * 項目非表示
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
     * 項目表示
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
     * 項目表示
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
     * エクセル出力
     */
    function doExcel() {
        var crRecord = currentRecord.get();

        // 見積の内部ID
        var estimateId = crRecord.id;
        var searchField = 'custbody_djkk_estimate_excel_type';

        // DJ_見積_エクセル種類の取得
        var searchObject = search.lookupFields({
            type : search.Type.ESTIMATE,
            id : estimateId,
            columns : searchField
        });
        var estimateExcelType = searchObject[searchField][0].value;

        if (estimateExcelType) {
            // 基本パターン(NBKK)_FS_RE
            if (estimateExcelType == '1') {
                outputExcel('customscript_djkk_sl_nbkk_basic_pattern', 'customdeploy_djkk_sl_nbkk_basic_pattern', {
                    'estimateId' : estimateId
                });
            }

            // 即引き用(NBKK)_RE
            if (estimateExcelType == '2') {
                outputExcel('customscript_djkk_sl_nbkk_immediate_pull', 'customdeploy_djkk_sl_nbkk_immediate_pull', {
                    'estimateId' : estimateId
                });
            }

            // 基本＋価格提案記入追加＋追加希望項目(NBKK)_RE
            if (estimateExcelType == '3') {
                outputExcel('customscript_djkk_sl_nbkk_basic_ppea_adi', 'customdeploy_djkk_sl_nbkk_basic_ppea_adi', {
                    'estimateId' : estimateId
                });
            }

            // 基本パターン(UL)
            if (estimateExcelType == '4') {
                outputExcel('customscript_djkk_sl_ul_basic_pattern', 'customdeploy_djkk_sl_ul_basic_pattern', {
                    'estimateId' : estimateId
                });
            }

            // 基本＋追加希望項目 + 価格提案記入追加(UL)
            if (estimateExcelType == '5') {
                outputExcel('customscript_djkk_sl_ul_basic_ppea_adi', 'customdeploy_djkk_sl_ul_basic_ppea_adi', {
                    'estimateId' : estimateId
                });
            }
        }
    }

    /**
     * エクセル出力
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
                    title : 'エラー',
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
