/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/record', 'N/format'],

function(search, record, format) {

    /**
     * �G���[���O���L������
     * 
     * @param {Object} funcType �@�\���
     * @param {Object} funcNm �@�\��
     * @param {Object} level �G���[���x��
     * @param {Object} errCode �G���[�R�[�h
     * @param {Object} errMsg �G���[���b�Z�[�W
     * @param {Object} detail �ڍ�
     * @param {Object} creDate �쐬����
     * @param {Object} complement1 �G���[���b�Z�[�W�⑫1
     * @param {Object} complement2 �G���[���b�Z�[�W�⑫2
     * @param {Object} complement3 �G���[���b�Z�[�W�⑫3
     */
    function writeLog(funcType, funcNm, level, errCode, errMsg, detail, creDate, complement1, complement2, complement3) {

        try {

            var cDate = format.parse({
                value : creDate ? new Date(creDate) : getJapanDate(),
                type : format.Type.DATETIME,
            });

            var errLogRecord = record.create({
                type : 'customrecord_bunkeido_errorlog',
                isDynamic : false,
                defaultValues : {}
            });

            errLogRecord.setValue({
                fieldId : 'custrecord_bunkeido_errlog_daytime',
                value : cDate
            });

            if (funcType) {
                errLogRecord.setValue({
                    fieldId : 'custrecord_bunkeido_errlog_funtypes',
                    value : funcType
                });
            } else {
                return '�@�\��ނŕK�v������܂��B';
            }

            if (funcNm) {
                errLogRecord.setValue({
                    fieldId : 'custrecord_bunkeido_errlog_funname',
                    value : funcNm
                });
            } else {
                return '�@�\���ŕK�v������܂��B';
            }

            if (level) {
                errLogRecord.setValue({
                    fieldId : 'custrecord_bunkeido_errlog_loglabel',
                    value : level
                });
            } else {
                return '�G���[���x���ŕK�v������܂��B';
            }

            if (errCode) {
                errLogRecord.setValue({
                    fieldId : 'custrecord_bunkeido_errlog_errcode',
                    value : errCode
                });
            } else {
                return '�G���[�R�[�h�ŕK�v������܂��B';
            }

            if (errMsg) {
                errLogRecord.setValue({
                    fieldId : 'custrecord_bunkeido_errlog_errmsg',
                    value : errMsg
                });
            } else {
                return '�G���[���b�Z�[�W�ŕK�v������܂��B';
            }

            if (detail) {
                errLogRecord.setValue({
                    fieldId : 'custrecord_bunkeido_errlog_detail',
                    value : detail
                });
            }

            if (complement1) {
                errLogRecord.setValue({
                    fieldId : 'custrecord_bunkeido_errlog_errmsg1',
                    value : complement1
                });
            }

            if (complement2) {
                errLogRecord.setValue({
                    fieldId : 'custrecord_bunkeido_errlog_errmsg2',
                    value : complement2
                });
            }

            if (complement3) {
                errLogRecord.setValue({
                    fieldId : 'custrecord_bunkeido_errlog_errmsg3',
                    value : complement3
                });
            }

            var internalID = errLogRecord.save();
            log.debug('�J�X�^�}���R�[�h�y�G���[���O�z�����Ă��������B', '����ID�F' + internalID);

            return 'SUCCESS';

        } catch (e) {
            log.error(e.name, e.message);
            log.error(e.name, e.stack);
            return e.message;
        }

    }

    /**
     * ���{�̓��t���擾����
     * 
     * @returns ���{�̓��t
     */
    function getJapanDate() {

        var now = new Date();
        var offSet = now.getTimezoneOffset();
        var offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);

        return now;
    }

    /**
     * �N�����擾����
     * 
     * @param {Object} str ���t
     * @returns �t�H�[�}�b�g�FYYYYMM
     */
    function getYearMonth(str) {

        var now = new Date(str);
        var offSet = now.getTimezoneOffset();
        var offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);

        return '' + now.getFullYear() + now.getMonth();
    }

    function StringFormat(str, arguments) {
        if (str.length === 0) {
            return str;
        }
        for (var i = 0; i < arguments.length; i++) {
            str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        }
        return str;

    }

    /**
     * �������\�b�h
     * 
     * @param {Object} searchType �������
     * @param {Object} searchFilters ��������
     * @param {Object} searchColumns ��������
     */
    function createSearch(searchType, searchFilters, searchColumns) {

        var resultList = [];
        var resultIndex = 0;
        var resultStep = 1000;

        var objSearch = search.create({
            type : searchType,
            filters : searchFilters,
            columns : searchColumns
        });
        var objResultSet = objSearch.run();

        do {
            var results = objResultSet.getRange({
                start : resultIndex,
                end : resultIndex + resultStep
            });

            if (results.length > 0) {
                resultList = resultList.concat(results);
                resultIndex = resultIndex + resultStep;
            }
        } while (results.length > 0);

        return resultList;
    }

    /**
     * �{�f�B�t�B�[���h�̌������\�b�h
     */
    function lookupFields(type, id, columns) {
        var fields = search.lookupFields({
            type : type,
            id : id,
            columns : columns
        });
        return fields;
    }

    function isDateString(date, fh) {
        if (!date) {
            return false;
        }
        var dateItems = date.split(fh);
        if (dateItems.length !== 3) {
            return false;
        }
        var pattern = new RegExp("[0-9]+");
        if (!pattern.test(dateItems[0]) || !pattern.test(dateItems[1]) || !pattern.test(dateItems[2])) {
            return false;
        }

        if (dateItems[0].length !== 4 || parseInt(dateItems[1]) > 12 || parseInt(dateItems[1]) <= 0 || parseInt(dateItems[2]) > 31
                || parseInt(dateItems[2]) <= 0) {
            return false;
        }

        return true;
    }

    function formatDateToObject(strDate) {
        var dateObj = format.parse({
            value : new Date(strDate),
            type : format.Type.DATE
        });

        return dateObj;
    }
    function formatDateToString(strDate) {
        var dateObj = format.format({
            value : new Date(strDate),
            type : format.Type.DATE
        });

        return dateObj;
    }

    return {
        writeLog : writeLog,
        getJapanDate : getJapanDate,
        StringFormat : StringFormat,
        createSearch : createSearch,
        lookupFields : lookupFields,
        isDateString : isDateString,
        formatDateToObject : formatDateToObject,
        formatDateToString : formatDateToString,
        getYearMonth:getYearMonth,

    };

});
