/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 *
 * 楽楽精算仕訳取込
 * CSVファイルをインポート
 *
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/search', 'N/ui/message', 'N/url', 'N/https', 'lib'],

    function (dialog, currentRecord, search, message, url, https, lib) {

        function fieldChanged(scriptContext) {
        }


        function saveRecord(scriptContext) {
            var importFile = scriptContext.currentRecord.getValue({
                fieldId: 'custpage_dj_select_file'
            });
            if (importFile == null || importFile == '') {
                var myMsg = message.create({
                    title: "WARNING",
                    message: 'ファイルを選択してください。',
                    type: message.Type.WARNING
                });
                myMsg.show();
                setTimeout(myMsg.hide, 1500);
                return false;
            }
            var index = importFile.lastIndexOf('.');
             var fileType = importFile.slice(index + 1)
             if(fileType !== 'csv'){
                 var myMsg = message.create({
                     title: "WARNING",
                     message: 'CSVファイルを選択してください。',
                     type: message.Type.WARNING
                     });
                 myMsg.show();
                 setTimeout(myMsg.hide, 1500);
                 return false;
             }
            return true;
        }
        function refresh(taskId) {

            // 画面更新
            var scriptUrl = url.resolveScript({
                scriptId : 'customscript_dj_sl_rakuraku_import_csv',
                deploymentId : 'customdeploy_dj_sl_rakuraku_import_csv',
                params : {
                    taskId : taskId
                },
                returnExternalUrl : false
            });
            window.location.href = scriptUrl;
        }

        return {
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            refresh : refresh
        };

    });
