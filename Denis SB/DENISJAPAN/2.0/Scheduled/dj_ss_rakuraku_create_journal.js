/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * 
 * �y�y���Z�d��쐬
 */
define(['N/search', 'N/record', 'N/runtime', 'N/format', 'N/config', 'N/error', 'N/email'],
    function (search, record, runtime, format, config, error, email) {

        function execute(scriptContext) {
            try {

                log.audit('INFO', '�d��쐬�J�n');

                var errorMsg = [];
                var scriptObj = runtime.getCurrentScript();
                // userObj.id  email
                var userObj = runtime.getCurrentUser();

                var subsidiary = scriptObj.getParameter({ name: 'custscript_dj_journal_subsidiary' });
                var arrData = scriptObj.getParameter({ name: 'custscript_dj_import_csv_arr' });
                var inputDate = scriptObj.getParameter({ name: 'custscript_dj_import_csv_inputdate' });
                var fileName = scriptObj.getParameter({ name: 'custscript_dj_csv_filename' });

                arrData = JSON.parse(arrData);
                log.debug('arrdata', arrData);

                doCreateJournal(inputDate, arrData, subsidiary, errorMsg);

                if (errorMsg.length > 0) {
                    handleErrorAndSendNotification(fileName, errorMsg, userObj);
                }
            } catch (e) {
                log.error("ERROR", e.message);
                var msg = e.message;
                errorMsg.push(msg);
                handleErrorAndSendNotification(fileName, errorMsg, userObj);
            }
        }

        function doCreateJournal(inputDate, objArr, subsidiary, errorMsg) {
            try {
                log.debug('doCreateJournal start', 'doCreateJournal start');
                var newJournalRecord = record.create({
                    type: 'journalentry'
                });
                // �J�X�^���t�H�[��
                var formType = '123';
                newJournalRecord.setValue({
                    fieldId: 'customform',
                    value: formType
                });
                // ���t
                if (!isEmpty(inputDate)) {
                    newJournalRecord.setValue({
                        fieldId: 'trandate',
                        value: format.parse({ value: inputDate, type: format.Type.DATE })
                    });
                } else {
                    var nowDate = getNowDateJP();
                    newJournalRecord.setValue({
                        fieldId: 'trandate',
                        value: format.parse({ value: nowDate, type: format.Type.DATE })
                    });
                }
                // �A��
                newJournalRecord.setValue({
                    fieldId: 'subsidiary',
                    value: subsidiary
                });
                // �ʉ�
                newJournalRecord.setValue({
                    fieldId: 'currency',
                    value: '1'
                });
                // �בփ��[�g
                newJournalRecord.setValue({
                    fieldId: 'exchangerate',
                    value: '1'
                });
                // �X�e�[�^�X
                newJournalRecord.setValue({
                    fieldId: 'approvalstatus',
                    value: '1'
                });
                // ����
                newJournalRecord.setValue({
                    fieldId: 'memo',
                    value: '�y�y���Z�d��A�g'
                });
              
                var journalId = '';
                var lineNum = 0;
                // set sublist value
                for (var i = 0; i < objArr.length; i++) {
                    var total = parseInt(objArr[i].debitnotaxamount) + parseInt(objArr[i].debittaxamount);
                    
                    if (total !== parseInt(objArr[i].creditamount)) {
                        var msg = '���z���������Ȃ��̂Ŋm�F���Ă��������B' + '\n';
                        errorMsg.push(msg);
                        continue;
                    }
                    if (isEmpty(objArr[i].debitaccountcode)) {
                        var msg = '�ؕ��̊���Ȗڂ��K�{���ڂł��B' + '\n';
                        errorMsg.push(msg);
                        continue;
                    }
                    if (isEmpty(objArr[i].creditaccountcode)) {
                        var msg = '�ݕ��̊���Ȗڂ��K�{���ڂł��B' + '\n';
                        errorMsg.push(msg);
                        continue;
                    }
                    if (isEmpty(objArr[i].debittax)) {
                        var msg = '�ؕ��̐ŋ��R�[�h���K�{���ڂł��B' + '\n';
                        errorMsg.push(msg);
                        continue;
                    }
                    // �ؕ��F����ȖڃR�[�h
                    if (!isEmpty(objArr[i].debitaccountcode)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            line: lineNum,
                            value: objArr[i].debitaccountcode
                        });
                    }
                    // �ؕ����z
                    if (!isEmpty(objArr[i].debitnotaxamount)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            line: lineNum,
                            value: objArr[i].debitnotaxamount
                        });
                    }
                    // �ؕ��ŋ� [�ŃR�[�h]
                    if (!isEmpty(objArr[i].debittax)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'taxcode',
                            line: lineNum,
                            value: objArr[i].debittax
                        });
                    }
                    // �ؕ��F�Ŋz
                    if (!isEmpty(objArr[i].debittaxamount)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'tax1amt',
                            line: lineNum,
                            value: objArr[i].debittaxamount
                        });
                    }
                    // ���� [abstract]
                    if (!isEmpty(objArr[i].abstract)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            line: lineNum,
                            // value: ' �y�y���Z�e�X�g'
                            value: objArr[i].abstract
                        });
                    }
                    // �ؕ��F���S����R�[�h [�Z�N�V����]
                    if (!isEmpty(objArr[i].debitdeptcode)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            line: lineNum,
                            value: objArr[i].debitdeptcode
                        });
                    }
                    // ���O [�Ј�]
                    if (!isEmpty(objArr[i].empcode)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            line: lineNum,
                            value: objArr[i].empcode
                        });
                    }
                    // �u�����h [brand]
                    if (!isEmpty(objArr[i].brandcode)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            line: lineNum,
                            value: objArr[i].brandcode
                        });
                    }
                    // DJ_�d��No.
                    if (!isEmpty(objArr[i].journalnum)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_dj_journal_no',
                            line: lineNum,
                            value: objArr[i].journalnum
                        });
                    }
                    // DJ_�d���
                    if (!isEmpty(objArr[i].journaldate)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_dj_journal_date',
                            line: lineNum,
                            value: format.parse({ value: objArr[i].journaldate, type: format.Type.DATE })
                        });
                    }

                    lineNum = lineNum + 1;

                    // �ݕ��F����ȖڃR�[�h
                    if (!isEmpty(objArr[i].creditaccountcode)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            line: lineNum,
                            value: objArr[i].creditaccountcode
                        });
                    }
                    // �ݕ��F���z
                    if (!isEmpty(objArr[i].creditamount)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            line: lineNum,
                            value: objArr[i].creditamount
                        });
                    }
                    // ���O [�Ј�]
                    if (!isEmpty(objArr[i].empcode)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            line: lineNum,
                            value: objArr[i].empcode
                        });
                    }
                    // DJ_�d��No.
                    if (!isEmpty(objArr[i].journalnum)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_dj_journal_no',
                            line: lineNum,
                            value: objArr[i].journalnum
                        });
                    }
                    // DJ_�d���
                    if (!isEmpty(objArr[i].journaldate)) {
                        newJournalRecord.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_dj_journal_date',
                            line: lineNum,
                            value: format.parse({ value: objArr[i].journaldate, type: format.Type.DATE })
                        });
                    }

                    lineNum = lineNum + 1;

                }
                if (lineNum > 0) {
                    journalId = newJournalRecord.save({ ignoreMandatoryFields: true });
                } else {
                    var msg = '�d�󒠍쐬�����s���܂����B' + '����ȖڂƐŋ��R�[�h���K�{���ڂł��B�܂��A���z���m�F���Ă��������B' + '\n';
                    errorMsg.push(msg);
                }

                log.debug('doCreateJournal end (journalId)', journalId);

            } catch (e) {
                log.error('doCreateJournal:' + e.name, e.message);
                var msg = e.message + '\n';
                errorMsg.push(msg);
            }

        }

        function getNowDateJP() {
            var stNow = new Date();
            stNow.setMilliseconds((3600000 * 9));
            var stYear = stNow.getUTCFullYear();
            var stMonth = stNow.getUTCMonth();
            var stDate = stNow.getUTCDate();
            stNow = new Date(stYear, stMonth, stDate);
            return stNow;
        }
        /**
     * ���{�̓��t���擾����
     * 
     * @returns ���{�̓��t
     */
        function getJapanDateTime() {
            var now = new Date();
            var offSet = now.getTimezoneOffset();
            var offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);
            return '' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
        }
        function pad(v) {
            if (v >= 10) {
                return v;
            } else {
                return "0" + v;
            }
        }
        function isEmpty(stValue) {
            if ((stValue === null) || (stValue === '') || (stValue === undefined) || (stValue == 0)) {
                return true;
            } else {
                return false;
            }
        }
        function nullToZero(str) {
            if (isEmpty(str) || str == 'undefined') {
                return 0;
            }
            return str;
        }
        function getMappingList(searchId, originalField, nsField) {
            var objList = [];

            var commonSearch = search.load({
                id: searchId
            });
            // var commonFilter = search.createFilter({
            //     name: searchName,
            //     operator: 'is',
            //     values: searchValue
            // });
            // commonSearch.filters.push(commonFilter);
            var objSearch = commonSearch.run();

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

            for (var i = 0; i < res.length; i++) {
                var obj = {};
                var key = res[i].getValue(originalField);
                var value = res[i].getValue(nsField);
                obj[key] = value;
                objList.push(obj);
            }
            return objList;
        }
        function setMappingValue(list, attr) {
            var str;
            for (var j = 0; j < list.length; j++) {
                for (var item in list[j]) {
                    if (attr == item) {
                        str = list[j][item];
                    }
                }
            }
            return str;
        }
        function padStart(str) {
            return ('00000000' + str).slice(-4);
        }
        function mergeObjects(target, source) {
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                }
            }
            return target;
        }
        function searchName() {
            var objList = [];
            var nameSearch = search.create({
                type: 'entity',
                columns: [{ name: 'internalid' },
                { name: 'entityid' }]
            });
            var resultSet = nameSearch.run().getRange({ start: 0, end: 1000 });
            util.each(resultSet, function (result) {
                var obj = {};
                obj.id = result.getValue({ name: 'internalid' });
                obj.name = result.getValue({ name: 'entityid' });
                objList.push(obj);
            });
            return objList;
        }

        function handleErrorAndSendNotification(fileName, errorMsg, userObj) {
            // log.error('Stage: ' + stage + ' failed', e);
            var occurrence = getJapanDateTime();
            var author = -5;
            var recipients = userObj.email;
            // var subject = 'Scheduled Script ' + runtime.getCurrentScript().id + ' failed for stage: ' + stage;
            var subject = 'Netsuite�y�y���Z�d��A�g�����G���[' + '_' + occurrence;
            var body = 'Netsuite�y�y���Z�d��A�g�����ɃG���[���������܂���:\n\n' +
                '�t�@�C��: ' + fileName + '\n' + '�G���[���e: ' + errorMsg;
            email.send({
                author: author,
                recipients: recipients,
                subject: subject,
                body: body
            });
        }
        return {
            execute: execute,
        };
    });
