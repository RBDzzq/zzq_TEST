/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/format'], function(search, format) {

    /**
     * 画面JPY通貨チェック
     * 
     * @param curRec 画面レコード
     */
    function getGamenJpyCurrencyCheck(curRec) {

        var jpyFlg = true;

        // 通貨
        var currency = curRec.getValue({
            fieldId : 'currency'
        });

        if (currency != '1') {
            jpyFlg = false;
        }

        return jpyFlg;
    }

    /**
     * ストリング日付に変換する
     * 
     * @param date 日付
     */
    function toStrDate(date) {

        var fdate = format.format({
            type : format.Type.DATE,
            value : date
        });

        return fdate;
    }

    /**
     * 社内レートレートを取得する
     * 
     * @param strDate 日付
     * @param currency 通貨
     * @returns 社内レート
     */
    function getSyanaiRate(strDate, currency) {

        var syanaiRate = 0;

        var searchType = 'customrecord_djkk_syanai_rate_tbl';

        var searchFilters = [];
        searchFilters.push(["custrecord_djkk_syanai_accountingperiod.isinactive", "is", "F"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_syanai_accountingperiod.isyear", "is", "F"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_syanai_accountingperiod.isquarter", "is", "F"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_syanai_accountingperiod.startdate", "onorbefore", strDate]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_syanai_accountingperiod.enddate", "onorafter", strDate]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_syanai_accountingperiod.closed", "is", "F"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_syanai_currency", "anyof", currency]);
        searchFilters.push("AND");
        searchFilters.push(["isinactive", "is", "F"]);

        var searchColumns = [search.createColumn({
            name : "custrecord_djkk_syanai_rate",
            label : "DJ_レート"
        })];

        var searchResults = getCreateSearchResults(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            syanaiRate = searchResults[0].getValue(searchColumns[0]);
        }

        return syanaiRate;
    }

    /**
     * 検索共通メソッド
     * 
     * @param searchType 検索タイプ
     * @param searchFilters 検索条件
     * @param searchColumns 検索コラム
     * @returns 検索結果リスト
     */
    function getCreateSearchResults(searchType, searchFilters, searchColumns) {

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
        } while (results.length == resultStep);

        return resultList;
    }

    /**
     * エクセル出力メソッド
     * 
     * @param dlSize データサイズ
     * @param page1Line
     * @returns
     */
    function getExcelPrintPage1(dlSize, page1Line) {

        var forCount = 0;

        forCount = page1Line - (dlSize - 1) * 2;

        return forCount;
    }

    /**
     * エクセル出力メソッド
     * 
     * @param dlSize データサイズ
     * @param page1
     * @param pageMoreMax
     * @param pageMoreLine
     * @returns
     */
    function getExcelPrintPage2(dlSize, page1, pageMoreMax, pageMoreLine) {

        var forCount = 0;

        var tmpPage = dlSize - page1;

        forCount = pageMoreLine - (tmpPage % pageMoreMax - 1) * 2;

        return forCount;
    }

    /**
     * ボディフィールドの検索メソッド
     * 
     * @param searchType レコード種類
     * @param internalId レコード内部ID
     * @param searchColumns フィールド内部IDリスト
     * @returns 検索結果Object
     */
    function lookupFields(searchType, internalId, searchColumns) {

        var resultObjs = {};

        var lookupObjs = search.lookupFields({
            type : searchType,
            id : internalId,
            columns : searchColumns
        });

        for ( var loId in lookupObjs) {
            var objValue = lookupObjs[loId];
            var typeValue = getDataType(objValue);
            if ('ARRAY' == typeValue.toUpperCase()) {
                var arrayObj = objValue[0];
                if(arrayObj){
                    resultObjs[loId + '_value'] = arrayObj.value;
                    resultObjs[loId + '_text'] = arrayObj.text;
                }
            } else {
                resultObjs[loId] = objValue;
            }
        }

        return resultObjs;
    }

    /**
     * データのタイプを取得する
     * 
     * @param data 文字列
     * @returns データタイプ
     */
    function getDataType(data) {

        return Object.prototype.toString.apply(data).slice(8, -1);
    }
    
  //20230413 add by zhou start
    /**
     * request URL取得する
     */
    function serverScriptGetUrlHead(https){
  //    	SL/UE
    	try{
           var url = https.request.url;
           url = JSON.stringify(url);
           var urlToArr = url.split("/app");
           var urlHead = urlToArr[0].replace(new RegExp('"',"g"),"");
           //It looks like :  https://5722722.app.netsuite.com
           if(urlHead){
        	   return urlHead;
           }
    	}catch(e){}
           return null;
    }
    function clientScriptGetUrlHead(){
    	try{
    		 var url = JSON.stringify(window.location.href);
    	     var urlToArr = url.split("/app");
    	     var urlHead = urlToArr[0].replace(new RegExp('"',"g"),"");
           //It looks like :  https://5722722.app.netsuite.com
           if(urlHead){
        	   return urlHead;
           }
    	}catch(e){}
           return null;
    }
    //20230413 add by zhou end

    return {
        getCreateSearchResults : getCreateSearchResults,
        getSyanaiRate : getSyanaiRate,
        toStrDate : toStrDate,
        getGamenJpyCurrencyCheck : getGamenJpyCurrencyCheck,
        getExcelPrintPage1 : getExcelPrintPage1,
        getExcelPrintPage2 : getExcelPrintPage2,
        lookupFields : lookupFields,
        getDataType : getDataType,
        serverScriptGetUrlHead:serverScriptGetUrlHead,
        clientScriptGetUrlHead:clientScriptGetUrlHead,
        // 連結
        SUB_NBKK : 2,
        SUB_ULKK : 4,
        // 見積エクセル
        ESTIMATE_EXCEL_DJ_PATTERN_FS_NBKK : 300930,
        ESTIMATE_EXCEL_DJ_PATTERN_FS_ULKK : 301045
    };
});
