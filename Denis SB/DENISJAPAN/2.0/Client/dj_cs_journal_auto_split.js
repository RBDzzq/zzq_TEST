/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 *
 * �d�󖾍׍s������������
 *
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/search', 'N/ui/message', 'N/url', 'N/https'],

    function (dialog, currentRecord, search, message, url, https) {
        

        function fieldChanged(scriptContext) {
            var sublistFieldName = scriptContext.fieldId;
            if (sublistFieldName != 'department' && sublistFieldName != 'grossamt'
                && sublistFieldName != 'debit' && sublistFieldName != 'credit' && sublistFieldName != 'account') {
                return true;
            }
            // alert(scriptContext.fieldId);

            var currentRecord = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;
            //���������@�\_���׍s�X�e�[�^�X
            var split_status = currentRecord.getCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'custcol_djkk_split_line_status'
            });
            var status = split_status.split('-');

            var numLines = currentRecord.getLineCount({
                sublistId: 'line'
            });
            if (sublistName === 'line' &&
                (sublistFieldName === 'department' || sublistFieldName === 'grossamt'
                    || sublistFieldName === 'debit' || sublistFieldName === 'credit' 
                    || sublistFieldName === 'account') && status[2] != 'N' && status[1] != 'N') {
                alert('�ҏW�͌��f�[�^����s���Ă��������B');
                // dialog.alert({
                //     title: '�G���[',
                //     message: '�ҏW�͌��f�[�^����s���Ă��������B'
                // });
                return false;
            }
            if (sublistName === 'line' &&
                (sublistFieldName === 'department' || sublistFieldName === 'grossamt'
                    || sublistFieldName === 'debit' || sublistFieldName === 'credit'
                    || sublistFieldName === 'account') && status[0] != 'N') {
                // �ύX�L���t���O
                status[3] = 'T';
                // �폜�t���O
                status[4] = 'T';
                var res = status.join('-');
                currentRecord.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'custcol_djkk_split_line_status',
                    value: res
                });

                for (var i = numLines - 1; i >= 0; i--) {
                    currentRecord.selectLine({ sublistId: 'line', line: i });
                    //���������@�\_���׍s�X�e�[�^�X
                    var sub_status = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_djkk_split_line_status'
                    });
                    var sub_status_arr = sub_status.split('-');

                    if (status[1] == sub_status_arr[1] && sub_status_arr[0] == 'N') {
                        currentRecord.removeLine({
                            sublistId: 'line',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                }

            }

            return true;
        }
        function validateDelete(scriptContext) {
            
            var currentRecord = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;
            //���������@�\_���׍s�X�e�[�^�X
            var split_status = currentRecord.getCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'custcol_djkk_split_line_status'
            });
            var status = split_status.split('-');

            var numLines = currentRecord.getLineCount({
                sublistId: 'line'
            });

            var currIndex = currentRecord.getCurrentSublistIndex({ sublistId: 'line' });
            // if remove ������
            if (status[2] != 'N' && status[1] != 'N') {

                for (var i = 0; i < numLines; i++) {
                    // currentRecord.selectLine({ sublistId: 'line', line: i });
                    // var status_ori = currentRecord.getCurrentSublistValue({
                    //     sublistId: sublistName,
                    //     fieldId: 'custcol_djkk_split_line_status'
                    // });
                    var status_ori = currentRecord.getSublistValue({
                        sublistId: sublistName,
                        fieldId: 'custcol_djkk_split_line_status',
                        line:i
                    });
                    var status_ori_arr = status_ori.split('-');

                    if (status_ori_arr[0] == 'T' && status_ori_arr[1] == status[1]) {
                        if (status_ori_arr[4] != 'T') {
                            alert('�폜�͕������f�[�^����s���Ă��������B');
                            return false;
                        }
                    }
                }
            }    
            //if remove ������
            if (status[0] == 'T') {

                status[4] = 'T';
                var res = status.join('-');
                currentRecord.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'custcol_djkk_split_line_status',
                    value: res
                });
                for (var j = numLines - 1; j >= 0; j--) {
                    currentRecord.selectLine({ sublistId: 'line', line: j });
                    var status_sub = currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: 'custcol_djkk_split_line_status'
                    });
                    // var status_sub = currentRecord.getSublistValue({
                    //     sublistId: sublistName,
                    //     fieldId: 'custcol_djkk_split_line_status',
                    //     line:j
                    // });
                    var status_sub_arr = status_sub.split('-');

                    if (status[1] == status_sub_arr[1] && status_sub_arr[0] == 'N') {
                        currentRecord.removeLine({
                            sublistId: 'line',
                            line: j,
                            ignoreRecalc: true
                        });
                        // break;
                    }
                }
            }
            currentRecord.selectLine({ sublistId: 'line', line: currIndex });
            return true;
        }
        function validateField(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;
            var sublistFieldName = scriptContext.fieldId;
            var line = scriptContext.line;

            if (line != null) {
                //���������@�\_���׍s�X�e�[�^�X
                var split_status = currentRecord.getCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'custcol_djkk_split_line_status'
                });
                var status = split_status.split('-');
                if (sublistName === 'line' && sublistFieldName === 'department'
                    || sublistName === 'line' && sublistFieldName === 'debit'
                    || sublistName === 'line' && sublistFieldName === 'credit'
                    || sublistName === 'line' && sublistFieldName === 'account') {
                    // if (!isEmpty(split_from)) {
                    // if (status[0] != 'N') {
                    //     // currentRecord.setCurrentSublistValue({
                    //     //     sublistId: 'line',
                    //     //     fieldId: 'custcol_djkk_split_change_flag',
                    //     //     value: 'true'
                    //     // });
                    //     status[0] = 'T';
                    //     var res = status.join('-');
                    //     currentRecord.setCurrentSublistValue({
                    //         sublistId: 'line',
                    //         fieldId: 'custcol_djkk_split_line_status',
                    //         value: res
                    //     });

                    // }
                    // if (!isEmpty(split_type) && !isEmpty(split_key)) {
                    if (status[2] != 'N' && status[1] != 'N') {
                        alert('�ҏW�͌��f�[�^����s���Ă��������B');
                        // return false;
                    }
                }

            }

            return true;
        }

        function isEmpty(stValue) {
            if ((stValue === null) || (stValue === '') || (stValue === undefined) || (stValue == 0)) {
                return true;
            } else {
                return false;
            }
        }
        return {
            validateDelete: validateDelete,
            fieldChanged: fieldChanged,
            validateField: validateField
        };

    });
