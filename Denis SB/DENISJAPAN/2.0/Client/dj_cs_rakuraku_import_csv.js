/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 *
 * �y�y���Z�d��捞
 * CSV�t�@�C�����C���|�[�g
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
                    message: '�t�@�C����I�����Ă��������B',
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
                     message: 'CSV�t�@�C����I�����Ă��������B',
                     type: message.Type.WARNING
                     });
                 myMsg.show();
                 setTimeout(myMsg.hide, 1500);
                 return false;
             }
            return true;
        }
        function refresh(taskId) {

            // ��ʍX�V
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
