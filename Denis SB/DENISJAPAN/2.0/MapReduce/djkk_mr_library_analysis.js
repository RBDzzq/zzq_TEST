/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/file', 'N/render', 'N/email', 'N/format'], function(runtime, search, file, render, email, format) {

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

            var tranDic = getTransactionInfo();

            if (Object.keys(tranDic).length == 0) {
                log.error('データチェック', '出力データがありません、ご確認ください。');
            }

            return tranDic;

        } catch (ex) {

            log.error({
                title : 'getInputData error',
                details : ex
            });

            throw ex;
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

            log.debug('map key', context.key);

            var returnDic = {};
            var dataList = JSON.parse(context.value);

            // １部分処理
            var outData1List = [];
            var tmpDataList = dataList;
            var itemList = getItemConditions(tmpDataList);
            var item1InfoDic = getItem1Info(itemList);
            for (var i = 0; i < tmpDataList.length; i++) {
                var outDataDic = {};
                var tmpDic = tmpDataList[i];
                var item = tmpDic.item;
                var item1Dic = item1InfoDic[item];
                if (item1Dic) {
                    outDataDic.department = item1Dic.department;
                    outDataDic.brandId = item1Dic.brandId;
                    outDataDic.brandName = item1Dic.brandName;
                    var bmTotal = Math.round(Number(item1Dic.quantityonHand) * Number(tmpDic.quantity));
                    var bmTotal1 = Math.round(Number(tmpDic.averagecost) * Number(item1Dic.quantityonHand));
                    outDataDic.bmTotalDeal = bmTotal;
                    outDataDic.bmTotal = moneyAddComma(bmTotal1);
                    var byCostTotal = Math.round(Number(tmpDic.averagecost) * Number(tmpDic.quantity));
                    outDataDic.byCostTotalDeal = byCostTotal;
                    outDataDic.byCostTotal = moneyAddComma(byCostTotal);
                    var mcount = '';
                    if (byCostTotal) {
                        mcount = (bmTotal / (byCostTotal / 12)).toFixed(1);
                    }
                    outDataDic.mcount = mcount;

                    outData1List.push(outDataDic);
                }
            }

            returnDic.data1 = outData1List;

            // 2部分処理
            var outData2List = [];
            var item2InfoDic = getItem2Info(itemList);
            for (var i = 0; i < tmpDataList.length; i++) {
                var outDataDic = {};
                var tmpDic = tmpDataList[i];

                var item = tmpDic.item;
                var item2Dic = item2InfoDic[item];
 
                if (item2Dic) {
                    outDataDic.itemId = item2Dic.itemId;
                    outDataDic.itemName = item2Dic.itemName;
                    var bmTotal = Math.round(Number(item2Dic.quantityonHand) * Number(tmpDic.quantity));
                    var bmTotal2 = Math.round(Number(tmpDic.averagecost) * Number(item2Dic.quantityonHand));
                    outDataDic.bmTotal = moneyAddComma(bmTotal2);
                    var byCostTotal = Math.round(Number(tmpDic.averagecost) * Number(tmpDic.quantity));
                    outDataDic.byCostTotal = moneyAddComma(byCostTotal);
                    outDataDic.quantityonHand = moneyAddComma(item2Dic.quantityonHand);
                    outDataDic.stockunit = item2Dic.stockunit;
                    var mcount = '';
                    if (byCostTotal) {
                        mcount = (bmTotal / (byCostTotal / 12)).toFixed(1);
                    }
                    outDataDic.mcount = mcount;
                    var workdata = item2Dic.workdata;
                    outDataDic.workdata = workdata;

                    var showColor = '';
                    if (bmTotal > 100000) {
                        if (workdata) {
                            showColor = 'g';
                        } else {
                            showColor = 'y';
                        }
                    }
                    outDataDic.showColor = showColor;

                    outData2List.push(outDataDic);
                }
            }

            returnDic.data2 = outData2List;

            context.write({
                key : context.key,
                value : returnDic
            });

        } catch (ex) {

            log.error({
                title : 'map error',
                details : ex
            });

            throw ex;
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

            var subsidiaryList = [];
            subsidiaryList.push(context.key);
            var kinouNameList = [];
            kinouNameList.push('5');
            var mailAInfoDic = getMailInfo(subsidiaryList, kinouNameList);

            if (Object.keys(mailAInfoDic).length == 0) {
                log.error('データチェック', 'メール情報(会社内部ID；' + context.key + ')がありません、ご設定ください。');
                return;
            }

            var outDataDic = JSON.parse(context.values[0]);

            var nowDate = getJapanDate();
            var dealDate = getStrDate(nowDate);

            var data1List = outDataDic.data1;
            var data2List = outDataDic.data2;

            var headerDic = {};
            headerDic.dealDate = dealDate;
            // 合計
            dealData1Total(headerDic, data1List);

            var detailDic = {};
            detailDic.detailData = data1List;

            var detail2Dic = {};
            detail2Dic.detailData = data2List;

            // テンプレートを取得する
            var templateFile = file.load({
                id : 'テンプレート/電子メールテンプレート/在庫分析一覧送信機能.html'
            });

            var fileContents = templateFile.getContents();
            var renderer = render.create();
            renderer.templateContent = fileContents;

            renderer.addCustomDataSource({
                format : render.DataSource.OBJECT,
                alias : "headerInfo",
                data : headerDic
            });

            renderer.addCustomDataSource({
                format : render.DataSource.OBJECT,
                alias : "detail2Info",
                data : detail2Dic
            });

            renderer.addCustomDataSource({
                format : render.DataSource.OBJECT,
                alias : "detailInfo",
                data : detailDic
            });

            // 本文
            var mailBody = renderer.renderAsString();
            // タイトル
            var title = mailAInfoDic.title;
            var tmpRecipients = mailAInfoDic.recipients.split(';');

            email.send({
                author : mailAInfoDic.senderId,
                recipients : tmpRecipients,
                subject : title,
                body : mailBody
            });

            log.debug('Mail', 'メール送信完了しました。');

        } catch (ex) {

            log.error({
                title : 'reduce error',
                details : ex
            });

            throw ex;
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

        } catch (ex) {

            log.error({
                title : 'summarize error',
                details : ex
            });

            throw ex;
        }
    }

    return {
        getInputData : getInputData,
        map : map,
        reduce : reduce,
        summarize : summarize
    };

    /**
     * アイテム2情報を取得する
     */
    function getItem2Info(itemList) {

        var resultDic = {};

        var searchType = 'item';
        var searchFilters = [["inventorynumber.quantityonhand", "greaterthan", "0"], "AND", ["internalid", "anyof", itemList]];
        var searchColumns = [search.createColumn({
            name : "internalid",
            summary : "GROUP",
            label : "内部ID"
        }), search.createColumn({
            name : "itemid",
            summary : "GROUP",
            sort : search.Sort.ASC,
            label : "在庫コード"
        }), search.createColumn({
            name : "displayname",
            summary : "MAX",
            label : "表示名"
        }), search.createColumn({
            name : "quantityonhand",
            join : "inventoryNumber",
            summary : "SUM",
            label : "在庫"
        }), search.createColumn({
            name : "stockunit",
            summary : "MAX",
            label : "主要在庫単位"
        }), search.createColumn({
            name : "formulatext",
            summary : "MAX",
            formula : "Case when MONTHS_BETWEEN({today},{custitem_djkk_work_data}) <= 12 then '●' ELSE '' END",
            label : "計算式（テキスト）"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpDic = {};
                var tmpResult = searchResults[i];
                var internalId = tmpResult.getValue(searchColumns[0]);
                var itemId = tmpResult.getValue(searchColumns[1]);
                tmpDic.itemId = itemId;
                var itemName = tmpResult.getValue(searchColumns[2]);
                tmpDic.itemName = itemName;
                var quantityonHand = tmpResult.getValue(searchColumns[3]);
                tmpDic.quantityonHand = quantityonHand;
                var stockunit = tmpResult.getValue(searchColumns[4]);
                tmpDic.stockunit = stockunit;
                var workdata = tmpResult.getValue(searchColumns[5]);
                tmpDic.workdata = workdata;

                resultDic[internalId] = tmpDic;
            }
        }

        return resultDic;
    }

    /**
     * 合計
     */
    function dealData1Total(headerDic, data1List) {

        var bmAllTotal = 0;
        var byAllCostTotal = 0;

        for (var i = 0; i < data1List.length; i++) {
            var tmpDic = data1List[i];
            var bmTotal = tmpDic.bmTotalDeal;
            bmAllTotal = bmAllTotal + Number(bmTotal);
            var byCostTotal = tmpDic.byCostTotalDeal;
            byAllCostTotal = byAllCostTotal + Number(byCostTotal);
        }

        headerDic.bmAllTotal = moneyAddComma(bmAllTotal);
        headerDic.byAllCostTotal = moneyAddComma(byAllCostTotal);
    }

    /**
     * メール情報を取得する
     */
    function getMailInfo(subsidiaryList, kinouNameList) {

        var resultDic = {};

        var searchType = 'customrecord_djkk_mail_send_info';
        var searchFilters = [["isinactive", "is", "F"], "AND", ["custrecord_djkk_mail_subsidiary", "anyof", subsidiaryList], "AND", ["custrecord_djkk_mail_kinou_name", "anyof", kinouNameList]];
        var searchColumns = [search.createColumn({
            name : "custrecord_djkk_mail_sender",
            label : "差出人"
        }), search.createColumn({
            name : "custrecord_djkk_mail_recipients",
            label : "宛先"
        }), search.createColumn({
            name : "custrecord_djkk_mail_title",
            label : "タイトル"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            var tmpResult = searchResults[0];
            resultDic.senderId = tmpResult.getValue(searchColumns[0]);
            resultDic.recipients = tmpResult.getValue(searchColumns[1]);
            resultDic.title = tmpResult.getValue(searchColumns[2]);
        }

        return resultDic;
    }

    /**
     * アイテム１情報を取得する
     */
    function getItem1Info(itemList) {

        var resultDic = {};

        var searchType = 'item';
        var searchFilters = [["inventorynumber.quantityonhand", "greaterthan", "0"], "AND", ["internalid", "anyof", itemList]];
        var searchColumns = [search.createColumn({
            name : "internalid",
            summary : "GROUP",
            label : "内部ID"
        }), search.createColumn({
            name : "department",
            summary : "GROUP",
            label : "セクション"
        }), search.createColumn({
            name : "class",
            summary : "GROUP",
            label : "ブランドValue"
        }), search.createColumn({
            name : "quantityonhand",
            join : "inventoryNumber",
            summary : "SUM",
            label : "在庫"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpDic = {};
                var tmpResult = searchResults[i];
                var internalId = tmpResult.getValue(searchColumns[0]);
                var department = tmpResult.getText(searchColumns[1]);
                if (department && department == '- None -') {
                    department = '';
                }
                tmpDic.department = department;
                var brandId = tmpResult.getValue(searchColumns[2]);
                tmpDic.brandId = brandId;
                var brandName = tmpResult.getText(searchColumns[2]);
                if (brandName && brandName == '- None -') {
                    brandName = '';
                }
                tmpDic.brandName = brandName;
                var quantityonHand = tmpResult.getValue(searchColumns[3]);
                tmpDic.quantityonHand = quantityonHand;

                resultDic[internalId] = tmpDic;
            }
        }

        return resultDic;
    }

    /**
     * アイテムを取得する
     */
    function getItemConditions(dataList) {

        var itemList = [];

        for (var i = 0; i < dataList.length; i++) {
            var tmpDic = dataList[i];
            // アイテム
            var item = tmpDic.item;
            if (itemList.indexOf(item) == -1) {
                itemList.push(item);
            }
        }

        return itemList;
    }

    /**
     * トランザクションデータを取得する
     */
    function getTransactionInfo() {

        var resultDic = {};

        var searchType = 'transaction';
        var searchFilters = [["type", "anyof", "CustInvc"], "AND", ["mainline", "is", "F"], "AND", ["inventorydetail.internalidnumber", "isnotempty", ""], "AND", ["trandate", "within", "previousoneyear"]];
        var searchColumns = [search.createColumn({
            name : "subsidiary",
            summary : "GROUP",
            label : "連結"
        }), search.createColumn({
            name : "item",
            summary : "GROUP",
            label : "アイテム"
        }), search.createColumn({
            name : "quantity",
            summary : "SUM",
            label : "数量"
        }), search.createColumn({
            name : "averagecost",
            join : "item",
            summary : "MAX",
            label : "平均原価"
        })];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var tmpDataList = [];
                var tmpDic = {};
                var tmpResult = searchResults[i];
                var subsidiary = tmpResult.getValue(searchColumns[0]);
                var item = tmpResult.getValue(searchColumns[1]);
                tmpDic.item = item;
                var quantity = tmpResult.getValue(searchColumns[2]);
                tmpDic.quantity = quantity;
                var averagecost = tmpResult.getValue(searchColumns[3]);
                if (!averagecost) {
                    averagecost = 0;
                }
                tmpDic.averagecost = averagecost;
                tmpDataList.push(tmpDic);

                var dicValueList = resultDic[subsidiary];
                if (dicValueList) {
                    var tmpDicList = dicValueList.concat(tmpDataList);
                    resultDic[subsidiary] = tmpDicList;
                } else {
                    resultDic[subsidiary] = tmpDataList;
                }
            }
        }

        return resultDic;
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
     * 日本の日付を取得する
     * 
     * @returns YYYYMMSSHHMMSS
     */
    function getStrDate(date) {

        var year = date.getFullYear();
        var month = npad(date.getMonth() + 1);
        var day = npad(date.getDate());

        return year + '/' + month + '/' + day;
    }

    /**
     * @param v
     * @returns
     */
    function npad(v) {
        if (v >= 10) {
            return v;
        } else {
            return '0' + v;
        }
    }

    /**
     * カンマで金額をフォーマットする
     * 
     * @param num
     * @returns
     */
    function moneyAddComma(num) {

        var retNum = '0';

        var strNum = num.toString();
        if (strNum == '0') {
            return retNum;
        }
        if (strNum.indexOf(".") > -1) {
            var splitedNum = strNum.toString().split(".");
            retNum = splitedNum[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "." + splitedNum[1];
        } else {
            retNum = Math.round(num);
            retNum = String(retNum).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        }

        return retNum;
    }
});