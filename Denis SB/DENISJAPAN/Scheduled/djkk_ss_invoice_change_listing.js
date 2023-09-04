/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Aug 2021     
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {

    nlapiLogExecution('debug', '', '請求書一括処理開始(食品)');
    var param = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_ss_inv_change_list');
    nlapiLogExecution('debug', 'パラメータ', param);

    var dealDataObj = dealDatas(param);

    for ( var ddId in dealDataObj) {

        governanceYield();
        var dataList = dealDataObj[ddId];
        nlapiLogExecution('debug', '処理データ', ddId + '_' + JSON.stringify(dataList));

        var rec = nlapiLoadRecord('invoice', ddId);

        if (rec.getFieldValue('approvalstatus') == '1') {
            rec.setFieldValue('approvalstatus', '2');
        }

        if (rec.getFieldValue('custbody_djkk_sales_checked_flag') == 'F') {
            rec.setFieldValue('custbody_djkk_sales_checked_flag', 'T');
        }

        // add by zdj 20230807 start
        if (rec.getFieldValue('custbody_djkk_trans_appr_deal_flg') == 'T') {
            rec.setFieldValue('custbody_djkk_trans_appr_status', 2);
        }
        // add by zdj 20230807 end

        for (var i = 0; i < dataList.length; i++) {
            var lineArr = dataList[i].split('_');
            if (lineArr[0] == '-999') {
                rec.setFieldValue('shippingcost', lineArr[1]);
            } else {
                rec.setLineItemValue('item', 'rate', lineArr[0], lineArr[1]);
            }
        }

        var so = rec.getFieldValue('createdfrom');

        try {
            nlapiSubmitRecord(rec);
        } catch (e) {
            nlapiLogExecution('ERROR', 'エラー', e);
        }

        governanceYield();

        if (so) {
            var soRec = nlapiLoadRecord('salesorder', so);
            for (var i = 0; i < dataList.length; i++) {
                var lineArr = dataList[i].split('_');
                if (lineArr[0] == '-999') {
                    soRec.setFieldValue('shippingcost', lineArr[1]);
                } else {
                    soRec.setLineItemValue('item', 'rate', lineArr[0], lineArr[1]);
                }
            }
            try {
                nlapiSubmitRecord(soRec);
            } catch (e) {
                nlapiLogExecution('ERROR', 'エラー', e);
            }
        }
    }

    nlapiLogExecution('debug', '', '請求書一括処理終了');
}

/**
 * データ整理
 * 
 * @param param
 */
function dealDatas(param) {

    var dataObj = {};

    var invArr = new Array();
    var invArr = param.split(',');
    for (var i = 0; i < invArr.length; i++) {
        var tmpVal = invArr[i];
        if (tmpVal) {
            var lineArr = invArr[i].split('_');
            var tmpLineList = [];
            var tmpId = lineArr[0];
            var tmpLine = lineArr[1];
            var tmpLineVal = lineArr[2];
            var tmpLines = tmpLine + '_' + tmpLineVal;
            tmpLineList.push(tmpLines);
            var dicVal = dataObj[tmpId];
            if (dicVal) {
                var addDicList = dicVal.concat(tmpLineList);
                dataObj[tmpId] = addDicList;
            } else {
                dataObj[tmpId] = tmpLineList;
            }
        }
    }

    return dataObj;
}