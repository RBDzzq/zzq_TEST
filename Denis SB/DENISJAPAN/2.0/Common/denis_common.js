/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/record', 'N/format'],

function(search, record, format) {

    /**
     * エラーログを記入する
     *
     */
    function writeLog(creDate, name, orderNo) {

        try {

            var cDate = format.parse({
                value : creDate ? new Date(creDate) : getJapanDate(),
                type : format.Type.DATETIME,
            });

            var errLogRecord = record.create({
                type : 'customrecord_djkk_exsystem_error_orderno',
                isDynamic : false,
                defaultValues : {}
            });
            errLogRecord.setValue({
                fieldId : 'custrecord_djkk_exsystem_error_orderno',
                value : orderNo
            });
            errLogRecord.setValue({
                fieldId : 'custrecord_djkk_exsystem_error_name',
                value : name
            });
            errLogRecord.setValue({
                fieldId : 'created',
                value : cDate
            });

            var internalID = errLogRecord.save();
            log.debug('カスタマレコード【エラーログ】が見てください。', '内部ID：' + internalID);

            return 'SUCCESS';

        } catch (e) {
            log.error(e.name, e.message);
            log.error(e.name, e.stack);
            return e.message;
        }

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
     * 年月を取得する
     * 
     * @param {Object} str 日付
     * @returns フォーマット：YYYYMM
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
     * 検索メソッド
     * 
     * @param {Object} searchType 検索種類
     * @param {Object} searchFilters 検索条件
     * @param {Object} searchColumns 検索項目
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
     * ボディフィールドの検索メソッド
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
    
    function getYmFirstEnd(ym) {
        var yearMonth = ym.split('/');

        var year = yearMonth[0];
        var month = yearMonth[1];

        var from = ym + '/01';
        var to = ym + '/';
        if ([1, 3, 5, 7, 8, 10, 12].indexOf(parseInt(month)) >= 0) {
            to += '31';
        } else if ('2' == month) {
            var years = parseInt(year);
            if (years % 100 != 0 && years % 4 == 0 || years % 400 == 0) {
                to += '29';
            } else {
                to += '28';
            }
        } else {
            to += '30';
        }
        return {
            sDate : from,
            eDate : to
        };
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
        getYmFirstEnd:getYmFirstEnd,

    };

});
