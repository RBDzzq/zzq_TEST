/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 *
 * �x���������o��׍s������������
 *
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/search', 'N/ui/message', 'N/url', 'N/https'],

    function (dialog, currentRecord, search, message, url, https) {
        function fieldChanged(scriptContext) {
            
            var sublistFieldName = scriptContext.fieldId;
            if (sublistFieldName != 'department' && sublistFieldName != 'grossamt'
                && sublistFieldName != 'amount' && sublistFieldName != 'category') {
                return true;
            }
        
            var currentRecord = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;

            // ���������@�\_���׍s�X�e�[�^�X
            var split_status = currentRecord.getCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'custcol_djkk_split_line_status'
            });
            var status = split_status.split('-');

            var numLines = currentRecord.getLineCount({
                sublistId: 'expense'
            });
            if (sublistName === 'expense' &&
                (sublistFieldName === 'department' || sublistFieldName === 'grossamt'
                    || sublistFieldName === 'amount' || sublistFieldName === 'category')
                && status[2] != 'N' && status[1] != 'N') {
                alert('�ҏW�͌��f�[�^����s���Ă��������B');
                return false;
            }
            // department & category
            if (sublistName === 'expense' && (sublistFieldName === 'department' || sublistFieldName === 'category' ) && status[0] != 'N') {

                // �ύX�L���t���O
                status[3] = 'T';
                // �폜�t���O
                status[4] = 'T';
                var res = status.join('-');
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'custcol_djkk_split_line_status',
                    value: res
                });
                var currIndex = currentRecord.getCurrentSublistIndex({ sublistId: 'expense' });
                
                var total = 0;
                for (var i = numLines - 1; i >= 0; i--) {
                    currentRecord.selectLine({ sublistId: 'expense', line: i });
                    //���������@�\_���׍s�X�e�[�^�X
                    var sub_status = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'custcol_djkk_split_line_status'
                    });
                    var sub_status_arr = sub_status.split('-');
                    if (status[1] == sub_status_arr[1] && sub_status_arr[0] == 'N') {
                        var amount_sub = currentRecord.getCurrentSublistValue({
                            sublistId: 'expense',
                            fieldId: 'amount'
                        });

                        total = total + parseInt(amount_sub);
                        currentRecord.removeLine({
                            sublistId: 'expense',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                }
                // alert('currIndex'+currIndex);
                currentRecord.selectLine({ sublistId: 'expense', line: currIndex});
                // ������ �����l
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'amount',
                    value: total,
                    ignoreFieldChange: true
                });
            }
            // grossamt & amount
            if (sublistName === 'expense' && (sublistFieldName === 'grossamt' || sublistFieldName === 'amount') && status[0] != 'N') {

                // �ύX�L���t���O
                status[3] = 'T';
                // �폜�t���O
                status[4] = 'T';
                var res = status.join('-');
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'custcol_djkk_split_line_status',
                    value: res
                });
                // var currIndex = currentRecord.getCurrentSublistIndex({ sublistId: 'expense' });
                
                // var total = 0;
                for (var i = numLines - 1; i >= 0; i--) {
                    currentRecord.selectLine({ sublistId: 'expense', line: i });
                    //���������@�\_���׍s�X�e�[�^�X
                    var sub_status = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'custcol_djkk_split_line_status'
                    });
                    var sub_status_arr = sub_status.split('-');
                    if (status[1] == sub_status_arr[1] && sub_status_arr[0] == 'N') {
                        // var amount_sub = currentRecord.getCurrentSublistValue({
                        //     sublistId: 'expense',
                        //     fieldId: 'amount'
                        // });

                        // total = total + parseInt(amount_sub);
                        currentRecord.removeLine({
                            sublistId: 'expense',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                }
                // alert('currIndex'+currIndex);
                // currentRecord.selectLine({ sublistId: 'expense', line: currIndex});
                // ������ �����l
                // currentRecord.setCurrentSublistValue({
                //     sublistId: 'expense',
                //     fieldId: 'amount',
                //     value: total,
                //     ignoreFieldChange: true
                // });
            }
            return true;
        }
        function validateDelete(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;
            //���������@�\_���׍s�X�e�[�^�X
            var split_status = currentRecord.getCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'custcol_djkk_split_line_status'
            });
            var status = split_status.split('-');

            var numLines = currentRecord.getLineCount({
                sublistId: 'expense'
            });

            var currIndex = currentRecord.getCurrentSublistIndex({ sublistId: 'expense' });
            // if remove ������
            if (status[2] != 'N' && status[1] != 'N') {
                var sub_status = currentRecord.getCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'custcol_djkk_split_line_status'
                });
                var sub_status_arr = sub_status.split('-');

                for (var i = 0; i < numLines; i++) {
                    // currentRecord.selectLine({ sublistId: 'expense', line: i });
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

                    if (status_ori_arr[0] == 'T' && status_ori_arr[1] == sub_status_arr[1]) {

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
                    sublistId: 'expense',
                    fieldId: 'custcol_djkk_split_line_status',
                    value: res
                });
                for (var j = numLines - 1; j >= 0; j--) {
                    currentRecord.selectLine({ sublistId: 'expense', line: j });
                    var status_sub = currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: 'custcol_djkk_split_line_status'
                    });
                    var status_sub_arr = status_sub.split('-');

                    if (status[1] == status_sub_arr[1] && status_sub_arr[0] == 'N') {
                        currentRecord.removeLine({
                            sublistId: 'expense',
                            line: j,
                            ignoreRecalc: true
                        });
                    }
                }
            } 
            currentRecord.selectLine({ sublistId: 'expense', line: currIndex });
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
                    sublistId: 'expense',
                    fieldId: 'custcol_djkk_split_line_status'
                });
                var status = split_status.split('-');
                if (sublistName === 'expense' && sublistFieldName === 'department'
                    || sublistName === 'expense' && sublistFieldName === 'amount'
                    || sublistName === 'expense' && sublistFieldName === 'grossamt'
                    || sublistName === 'expense' && sublistFieldName === 'category') {
                    // if (status[0] != 'N') {
                    //     status[0] = 'T';
                    //     var res = status.join('-');
                    //     currentRecord.setCurrentSublistValue({
                    //         sublistId: 'expense',
                    //         fieldId: 'custcol_djkk_split_line_status',
                    //         value: res
                    //     });

                    // }
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
            validateField:validateField
        };

    });
