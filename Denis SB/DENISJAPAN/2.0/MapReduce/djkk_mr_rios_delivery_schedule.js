/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/format', 'N/file'], function(runtime, search, format, file) {

    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     * 
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {

        try {

            var script = runtime.getCurrentScript();

            // �ۑ��t�H���_�[ID
            var saveFolderId = script.getParameter({
                name : 'custscript_djkk_delivery_schedule_folder'
            });
            if (!saveFolderId) {
                log.error('���̓`�F�b�N', '�ۑ��t�H���_�[ID����͂��Ă��������B');
                return;
            }

            // �V�X�e�����t
            var systemDate = getJapanDate();
            var conditionDate = format.format({
                type : format.Type.DATE,
                value : jsAddDate(systemDate, 1)
            });
            var resultList = getSoInfo(conditionDate);
            if (resultList.length == 0) {
                log.error('�f�[�^�`�F�b�N', '�o�̓f�[�^������܂���A���m�F���������B');
                return;
            }

            return resultList;

        } catch (e) {
            log.error('getInputData�@�G���[', e);
        }
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     * 
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {

        try {

            var key = context.key;
            log.debug('map key', key);
            var value = context.value;
            log.debug('map value', value);
            var dataList = JSON.parse(value);
            var subsidiary = dataList[4];
            context.write({
                key : subsidiary,
                value : value
            });
        } catch (e) {
            log.error('map �G���[', e);
        }
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     * 
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

        try {

            log.debug('reduce key', context.key);
            log.debug('reduce values', context.values);

            var script = runtime.getCurrentScript();
            // �ۑ��t�H���_�[ID
            var saveFolderId = script.getParameter({
                name : 'custscript_djkk_delivery_schedule_folder'
            });

            var headDic = {};
            var strCreateDate = '';
            var dataKbn = '';
            var headMemo = '';
            var createFileDataList = [];
            for (var i = 0; i < context.values.length; i++) {
                var value = JSON.parse(context.values[i]);
                if (!dataKbn) {
                    dataKbn = value[1];
                }
                if (!strCreateDate) {
                    strCreateDate = value[13];
                }
                if (!headMemo) {
                    headMemo = value[28];
                }
                value.length = value.length - 1;
                createFileDataList.push(value);
            }
            var strCDateYmd = strCreateDate.substring(0, 8);
            var subFileName = strCDateYmd + dataKbn + context.key;
            var resultNum = getMaxFileName(saveFolderId, subFileName);
            if (!resultNum) {
                resultNum = 1;
            } else {
                resultNum = parseInt(resultNum) + 1;
            }
            var fileName = subFileName + zeropad(resultNum, 4);
            createDetailFile(createFileDataList, fileName + '.csv', saveFolderId);

            headDic.strCreateDate = strCreateDate;
            headDic.count = context.values.length;
            headDic.fileName = fileName;
            headDic.headMemo = headMemo;
            context.write({
                key : context.key,
                value : headDic
            });
        } catch (e) {
            log.error('reduce �G���[', e);
        }
    }

    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     * 
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

        try {

            var script = runtime.getCurrentScript();
            // �ۑ��t�H���_�[ID
            var saveFolderId = script.getParameter({
                name : 'custscript_djkk_delivery_schedule_folder'
            });

            summary.output.iterator().each(function(key, value) {
                log.debug('summarize key', key);
                log.debug('summarize value', value);
                var dataDic = JSON.parse(value);
                createHeadFile(key, dataDic, saveFolderId);
                return true;
            });
        } catch (e) {
            log.error('summarize �G���[', e);
        }
    }

    return {
        getInputData : getInputData,
        map : map,
        reduce : reduce,
        summarize : summarize
    };

    /**
     * MAX�t�@�C�������擾����
     */
    function getMaxFileName(folderId, subFileName) {

        var result = '';

        // �����^�C�v
        var searchType = 'folder';

        // ��������
        var searchFilters = [["internalid", "anyof", folderId], "AND", ["file.name", "contains", subFileName], "AND",
                ["file.name", "doesnotcontain", ".hed"]];

        // �����R����
        var searchColumns = [search.createColumn({
            name : "formulanumeric",
            summary : "MAX",
            formula : "TO_NUMBER(SUBSTR(REPLACE({file.name}, '.csv', ''), LENGTH(REPLACE({file.name}, '.csv', '')) - 3))",
            label : "�v�Z���i���l�j"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            var tmpResult = searchResults[0];
            result = tmpResult.getValue(searchColumns[0]);
        }

        return result;
    }

    /**
     * �w�b�h�t�@�C�����쐬
     */
    function createHeadFile(markerCoder, dataDic, folderId) {

        var headArray = [];
        var headDataList = [];
        var headData = [];
        // ���M�f�[�^�敪
        headData.push('2');
        // ���[�J�[�R�[�h
        headData.push(markerCoder);
        // ���R�[�h��
        headData.push(dataDic.count);
        // �����R�[�h�̌n
        headData.push('1');
        // �t�@�C���쐬����
        headData.push(dataDic.strCreateDate);
        // ���l
        headData.push(dataDic.headMemo);
        headDataList.push(headData);
        var fileId = createFile(headData.join(','), file.Type.PLAINTEXT, dataDic.fileName + '.hed', folderId);
        log.error('Header File', fileId);
    }

    /**
     * ���׃t�@�C�����쐬����
     */
    function createDetailFile(dataDicList, fileName, folderId) {
        var headArray = [];
        var dataFileId = createCsvFile(dataDicList, headArray, fileName, folderId);
        log.error('Detail CSV File', dataFileId);
    }
    /**
     * ���l�f�[�^���O���߂ŏo�͂���
     * 
     * @param {string} str
     * @param {Number} length
     * @return {string}
     */
    function zeropad(str, length) {
        return (new Array(length).join('0') + str).slice(-length);
    }

    /**
     * CSV�t�@�C���ۑ�
     * 
     * @param lineDataArray
     * @param headArry
     * @param filename
     * @param folder
     * @return fileId
     */
    function createCsvFile(lineDataArray, headArry, filename, folder) {
        var csvArray = [];
        // CSV�w�b�_���쐬����
        if (headArry && csvArray.length > 0) {
            csvArray.push(headArry.join(','));
        }
        // CSV�f�[�^���쐬����
        lineDataArray.forEach(function(lineData) {
            csvArray.push(lineData.join(','));
        });
        var csvStr = csvArray.join('\r\n');
        // FileCabinet�ɕۑ�����
        return createFile(csvStr, file.Type.CSV, filename, folder);
    }

    /**
     * �t�@�C���ۑ�
     * 
     * @param contents
     * @param fileType
     * @param filename
     * @param folder
     * @return fileId
     */
    function createFile(contents, fileType, filename, folder) {
        var fileId = 0;
        try {
            var fileObj = file.create({
                name : filename,
                fileType : fileType,
                contents : contents
            });
            fileObj.folder = folder;
            fileObj.encoding = file.Encoding.SHIFT_JIS;
            fileId = fileObj.save();
        } catch (err) {
            log.error({
                title : 'Create File',
                details : err.name + err.description
            });
        }
        return fileId;
    }

    /**
     * SO�����擾����
     */
    function getSoInfo(conditionDate) {

        var resultList = [];

        var searchType = 'transaction';

        var searchFilters = [];
        searchFilters.push(["type", "anyof", "SalesOrd"]);
        searchFilters.push("AND");
        searchFilters.push(["mainline", "is", "F"]);
        searchFilters.push("AND");
        searchFilters.push(["taxline", "is", "F"]);
        searchFilters.push("AND");
        searchFilters.push(["custbody_djkk_edi_so_kbn", "is", "RIOS"]);
        searchFilters.push("AND");
        searchFilters.push(["custbody_djkk_delivery_hopedate", "on", conditionDate]);
        searchFilters.push("AND");
        searchFilters.push(["status", "anyof", "SalesOrd:B", "SalesOrd:D", "SalesOrd:E"]);

        var searchColumns = [search.createColumn({
            name : "custcol_djkk_maker_serial_code",
            label : "���[�J�[�Ǘ��ԍ�"
        }), search.createColumn({
            name : "formulatext",
            formula : "'0'",
            label : "�f�[�^�敪"
        }), search.createColumn({
            name : "formulatext",
            formula : "{otherrefnum}",
            label : "����NO."
        }), search.createColumn({
            name : "custbody_djkk_so_edaba",
            label : "�����}��"
        }), search.createColumn({
            name : "custrecord_djkk_subsidiary_code",
            join : "subsidiary",
            sort : search.Sort.ASC,
            label : "���[�J�[�R�[�h"
        }), search.createColumn({
            name : "quantity",
            label : "����"
        }), search.createColumn({
            name : "formulatext",
            formula : "TO_CHAR({custbody_djkk_delivery_date}, 'YYYYMMDD')",
            label : "�[����"
        }), search.createColumn({
            name : "formulatext",
            formula : "to_char({custbody_djkk_rios_base_date}, 'YYYYMMDD')",
            label : "���"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "�o�ד�"
        }), search.createColumn({
            name : "custbody_djkk_rios_bibo_bito",
            label : "�r�{�E�r�g���敪"
        }), search.createColumn({
            name : "custbody_djkk_rios_so_keiro",
            label : "�����o�H"
        }), search.createColumn({
            name : "formulatext",
            formula: "''",
            label : "�����敪"
        }), search.createColumn({
            name : "formulatext",
            formula : "{amount}",
            label : "���z"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "�f�[�^�쐬����"
        }), search.createColumn({
            name : "custcol_djkk_rios_user_num",
            label : "���[�U�Ǘ��ԍ�"
        }), search.createColumn({
            name : "custcol_djkk_rios_user_remark",
            label : "���[�U���l"
        }), search.createColumn({
            name : "custcol_djkk_item_code",
            label : "���[�J�[�i�ڃR�[�h"
        }), search.createColumn({
            name : "formulapercent",
            formula : "''",
            label : "���[�J�[�i�ږ���"
        }), search.createColumn({
            name : "custbody_djkk_maker_nounyu_code",
            label : "���[�J�[�[����R�[�h"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "���[�J�[�[���於��"
        }), search.createColumn({
            name : "custbody_djkk_use_code",
            label : "���[�J�[�g�p�҃R�[�h"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "���[�J�[�g�p�Җ���"
        }), search.createColumn({
            name : "custbody_djkk_maker_remark",
            label : "���[�J�[���l"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "�ėp�t���O�P"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "�ėp�t���O2"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "�ėp�t���O3"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "�\���P"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "�\���Q"
        }), search.createColumn({
            name : "memomain",
            label : "����"
        })];

        var createDate = getJapanDate();
        var strCreateDate = dateToStr(createDate);
        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var searchResult = searchResults[i];
                var lineData = [];
                for (var j = 0; j < searchColumns.length; j++) {
                    var value = searchResult.getValue(searchColumns[j]);
                    lineData.push(value);
                }
                lineData[13] = strCreateDate;
                resultList.push(lineData);
            }
        }

        return resultList;
    }

    /**
     * �������ʃ��\�b�h
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
        } while (results.length == 1000);

        return resultList;
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
     * ������������
     * 
     * @param pdate ���t
     * @param pdays ����
     * @returns �V���t
     */
    function jsAddDate(pdate, pdays) {
        var dt = new Date(pdate.getTime());
        dt.setDate(dt.getDate() + pdays);
        return dt;
    }

    /**
     * YYYYMMDDHHMMSS�ɕω�
     */
    function dateToStr(date) {
        var year = date.getFullYear();
        var month = pad(date.getMonth() + 1);
        var day = pad(date.getDate());
        var hour = pad(date.getHours());
        var minute = pad(date.getMinutes());
        var second = pad(date.getSeconds());
        return '' + year + month + day + hour + minute + second;
    }

    /**
     * @param v
     * @returns
     */
    function pad(v) {
        if (v >= 10) {
            return v;
        } else {
            return "0" + v;
        }
    }
});
