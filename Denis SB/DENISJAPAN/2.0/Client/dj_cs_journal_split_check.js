/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 *
 * 仕訳明細行セクション分割チェック
 *
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/search', 'N/ui/message', 'N/url', 'N/https'],

    function (dialog, currentRecord, search, message, url, https) {
        function fieldChanged(scriptContext) {
            var sublistName = scriptContext.sublistId;
            var sublistFieldName = scriptContext.fieldId;
            var currentRecord = scriptContext.currentRecord;

            if (sublistName === 'line' && sublistFieldName === 'department') {
                var dept = currentRecord.getCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department'
                });
                var deptName = currentRecord.getCurrentSublistText({
                    sublistId: 'line',
                    fieldId: 'department'
                });
                if (!isEmpty(dept)) {
                    if(deptName.indexOf('(') != -1 && deptName.indexOf(',') != -1){
                        var result = checkSegmentInfo();
                        if (result.indexOf(dept) == -1) {
                            alert('支払分割定義書に定義がありませんので支配分割を行いません。');
                        }
                    }
                }
            }

            return true;
        }
        function checkSegmentInfo() {
            var objList = [];
            var mySearch = search.create({
                type: 'customrecord_dj_activity_conversion_tbl',
                columns: [{ name: 'custrecord_converted_activity' }]
            });
            var objSearch = mySearch.run();

            var res = [];
            var resultIndex = 0;
            var resultStep = 1000;
            do {
                var results = objSearch.getRange({
                    start: resultIndex,
                    end: resultIndex + resultStep
                });
                if (results.length > 0) {
                    res = res.concat(results);
                    resultIndex = resultIndex + resultStep;
                }
            } while (results.length > 0);

            util.each(res, function (result) {
                var key = result.getValue({ name: 'custrecord_converted_activity' });
                objList.push(key);
            });
            return objList;
        }
        function isEmpty(stValue) {
            if ((stValue === null) || (stValue === '') || (stValue === undefined) || (stValue == 0)) {
                return true;
            } else {
                return false;
            }
        }
        return {
            fieldChanged: fieldChanged,
        };

    });
