/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/record'], function(runtime, record) {

    var SO_STATUS = '2';
    var RTNA_STATUS = '4';

    // 仕入先返品
    var VRAU_STATUS = '8';

    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {

        // 承認対象
        var script = runtime.getCurrentScript();
        var apprStatus = script.getParameter({
            name : 'custscript_djkk_trans_appr_status'
        });
        log.error('apprStatus', apprStatus);

        // ヘッドフラグ
        var headFlg = script.getParameter({
            name : 'custscript_djkk_trans_appr_sts_hed'
        });
        log.error('headFlg', headFlg);

        // DJ_承認ステータス
        var dealStatus = script.getParameter({
            name : 'custscript_djkk_trans_appr_dl_sts'
        });
        log.error('dealStatus', dealStatus);

        var curRecord = scriptContext.newRecord;

        if (RTNA_STATUS == apprStatus && headFlg) {
            curRecord.setValue({
                fieldId : 'orderstatus',
                value : 'B'
            });
        }
        if ((SO_STATUS == apprStatus && !headFlg) || (RTNA_STATUS == apprStatus && !headFlg)) {
            var itemCount = curRecord.getLineCount('item');
            for (var i = 0; i < itemCount; i++) {
                curRecord.selectLine({
                    sublistId : 'item',
                    line : i
                });
                curRecord.setCurrentSublistValue({
                    sublistId : 'item',
                    fieldId : 'isclosed',
                    value : true,
                    ignoreFieldChange : true,
                    forceSyncSourcing : false
                });
                curRecord.commitLine({
                    sublistId : 'item'
                });
            }
        }

        if (VRAU_STATUS == apprStatus && !headFlg) {
            var itemCount = curRecord.getLineCount('item');
            for (var i = 0; i < itemCount; i++) {
                curRecord.selectLine({
                    sublistId : 'item',
                    line : i
                });
                curRecord.setCurrentSublistValue({
                    sublistId : 'item',
                    fieldId : 'isclosed',
                    value : true,
                    ignoreFieldChange : true,
                    forceSyncSourcing : false
                });
                curRecord.setCurrentSublistValue({
                    sublistId : 'item',
                    fieldId : 'custcol_djkk_po_inspection_required',
                    value : false,
                    ignoreFieldChange : true,
                    forceSyncSourcing : false
                });
                curRecord.commitLine({
                    sublistId : 'item'
                });
            }
        }
    }

    return {
        onAction : onAction
    };
});
