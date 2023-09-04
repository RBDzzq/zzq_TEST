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

            // 保存フォルダーID
            var saveFolderId = script.getParameter({
                name : 'custscript_djkk_delivery_schedule_folder'
            });
            if (!saveFolderId) {
                log.error('入力チェック', '保存フォルダーIDを入力してください。');
                return;
            }

            // システム日付
            var systemDate = getJapanDate();
            var conditionDate = format.format({
                type : format.Type.DATE,
                value : jsAddDate(systemDate, 1)
            });
            var resultList = getSoInfo(conditionDate);
            if (resultList.length == 0) {
                log.error('データチェック', '出力データがありません、ご確認ください。');
                return;
            }

            return resultList;

        } catch (e) {
            log.error('getInputData　エラー', e);
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
            log.error('map エラー', e);
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
            // 保存フォルダーID
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
            log.error('reduce エラー', e);
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
            // 保存フォルダーID
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
            log.error('summarize エラー', e);
        }
    }

    return {
        getInputData : getInputData,
        map : map,
        reduce : reduce,
        summarize : summarize
    };

    /**
     * MAXファイル名を取得する
     */
    function getMaxFileName(folderId, subFileName) {

        var result = '';

        // 検索タイプ
        var searchType = 'folder';

        // 検索条件
        var searchFilters = [["internalid", "anyof", folderId], "AND", ["file.name", "contains", subFileName], "AND",
                ["file.name", "doesnotcontain", ".hed"]];

        // 検索コラム
        var searchColumns = [search.createColumn({
            name : "formulanumeric",
            summary : "MAX",
            formula : "TO_NUMBER(SUBSTR(REPLACE({file.name}, '.csv', ''), LENGTH(REPLACE({file.name}, '.csv', '')) - 3))",
            label : "計算式（数値）"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            var tmpResult = searchResults[0];
            result = tmpResult.getValue(searchColumns[0]);
        }

        return result;
    }

    /**
     * ヘッドファイルを作成
     */
    function createHeadFile(markerCoder, dataDic, folderId) {

        var headArray = [];
        var headDataList = [];
        var headData = [];
        // 送信データ区分
        headData.push('2');
        // メーカーコード
        headData.push(markerCoder);
        // レコード数
        headData.push(dataDic.count);
        // 文字コード体系
        headData.push('1');
        // ファイル作成時間
        headData.push(dataDic.strCreateDate);
        // 備考
        headData.push(dataDic.headMemo);
        headDataList.push(headData);
        var fileId = createFile(headData.join(','), file.Type.PLAINTEXT, dataDic.fileName + '.hed', folderId);
        log.error('Header File', fileId);
    }

    /**
     * 明細ファイルを作成する
     */
    function createDetailFile(dataDicList, fileName, folderId) {
        var headArray = [];
        var dataFileId = createCsvFile(dataDicList, headArray, fileName, folderId);
        log.error('Detail CSV File', dataFileId);
    }
    /**
     * 数値データを０埋めで出力する
     * 
     * @param {string} str
     * @param {Number} length
     * @return {string}
     */
    function zeropad(str, length) {
        return (new Array(length).join('0') + str).slice(-length);
    }

    /**
     * CSVファイル保存
     * 
     * @param lineDataArray
     * @param headArry
     * @param filename
     * @param folder
     * @return fileId
     */
    function createCsvFile(lineDataArray, headArry, filename, folder) {
        var csvArray = [];
        // CSVヘッダを作成する
        if (headArry && csvArray.length > 0) {
            csvArray.push(headArry.join(','));
        }
        // CSVデータを作成する
        lineDataArray.forEach(function(lineData) {
            csvArray.push(lineData.join(','));
        });
        var csvStr = csvArray.join('\r\n');
        // FileCabinetに保存する
        return createFile(csvStr, file.Type.CSV, filename, folder);
    }

    /**
     * ファイル保存
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
     * SO情報を取得する
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
            label : "メーカー管理番号"
        }), search.createColumn({
            name : "formulatext",
            formula : "'0'",
            label : "データ区分"
        }), search.createColumn({
            name : "formulatext",
            formula : "{otherrefnum}",
            label : "注文NO."
        }), search.createColumn({
            name : "custbody_djkk_so_edaba",
            label : "注文枝番"
        }), search.createColumn({
            name : "custrecord_djkk_subsidiary_code",
            join : "subsidiary",
            sort : search.Sort.ASC,
            label : "メーカーコード"
        }), search.createColumn({
            name : "quantity",
            label : "数量"
        }), search.createColumn({
            name : "formulatext",
            formula : "TO_CHAR({custbody_djkk_delivery_date}, 'YYYYMMDD')",
            label : "納入日"
        }), search.createColumn({
            name : "formulatext",
            formula : "to_char({custbody_djkk_rios_base_date}, 'YYYYMMDD')",
            label : "基準日"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "出荷日"
        }), search.createColumn({
            name : "custbody_djkk_rios_bibo_bito",
            label : "ビボ・ビトロ区分"
        }), search.createColumn({
            name : "custbody_djkk_rios_so_keiro",
            label : "注文経路"
        }), search.createColumn({
            name : "formulatext",
            formula: "''",
            label : "特価区分"
        }), search.createColumn({
            name : "formulatext",
            formula : "{amount}",
            label : "金額"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "データ作成時間"
        }), search.createColumn({
            name : "custcol_djkk_rios_user_num",
            label : "ユーザ管理番号"
        }), search.createColumn({
            name : "custcol_djkk_rios_user_remark",
            label : "ユーザ備考"
        }), search.createColumn({
            name : "custcol_djkk_item_code",
            label : "メーカー品目コード"
        }), search.createColumn({
            name : "formulapercent",
            formula : "''",
            label : "メーカー品目名称"
        }), search.createColumn({
            name : "custbody_djkk_maker_nounyu_code",
            label : "メーカー納入先コード"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "メーカー納入先名称"
        }), search.createColumn({
            name : "custbody_djkk_use_code",
            label : "メーカー使用者コード"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "メーカー使用者名称"
        }), search.createColumn({
            name : "custbody_djkk_maker_remark",
            label : "メーカー備考"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "汎用フラグ１"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "汎用フラグ2"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "汎用フラグ3"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "予備１"
        }), search.createColumn({
            name : "formulatext",
            formula : "''",
            label : "予備２"
        }), search.createColumn({
            name : "memomain",
            label : "メモ"
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
     * 検索共通メソッド
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
     * 日本の日付を取得する
     * 
     * @returns 日本の日付
     */
    function getJapanDate() {

        var now = new Date();
        var offSet = now.getTimezoneOffset();
        var offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);

        return now;
    }

    /**
     * 日を加減する
     * 
     * @param pdate 日付
     * @param pdays 日数
     * @returns 新日付
     */
    function jsAddDate(pdate, pdays) {
        var dt = new Date(pdate.getTime());
        dt.setDate(dt.getDate() + pdays);
        return dt;
    }

    /**
     * YYYYMMDDHHMMSSに変化
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
