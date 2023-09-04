/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/serverWidget', 'SuiteScripts/DENISJAPAN/2.0/Common/djkk_common'], function(search, serverWidget, djkk_common) {

    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        var subsidiary = '2';
        var currency = '2';
        var entity = '322';

        var request = context.request;
        var response = context.response;

        if (request.method === 'GET') {
            // subsidiary = request.parameters.ssd;
            // currency = request.parameters.cry;
            // entity = request.parameters.ety;
        }

        // 予約レート選択画面
        var form = serverWidget.createForm({
            title : '予約レート選択画面'
        });

        // 確定
        form.addSubmitButton({
            label : '確定'
        });

        // 閉じる
        form.addButton({
            id : 'custpage_djkk_yoyaku_rate_btn_close',
            label : '閉じる',
            functionName : 'closeWindow();'
        });

        // サブリスト
        var subList = form.addSublist({
            id : 'custpage_djkk_yoyaku_rate_list',
            label : '予約レート',
            type : serverWidget.SublistType.LIST
        });

        // 内部ID
        var idField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_id',
            label : '内部ID',
            type : serverWidget.FieldType.TEXT
        });

        // 契約番号
        var contractIdField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_contractid',
            label : '契約番号',
            type : serverWidget.FieldType.TEXT
        });

        // 銀行名
        var bankNameField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_bank_name',
            label : '銀行名',
            type : serverWidget.FieldType.TEXT
        });

        // レート
        var rateField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate',
            label : 'レート',
            type : serverWidget.FieldType.TEXT
        });

        // 初期外貨額
        var initAmountField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_init_amount',
            label : '初期外貨額',
            type : serverWidget.FieldType.CURRENCY
        });

        // 外貨残高
        var residualAmountField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_residual_amount',
            label : '外貨残高',
            type : serverWidget.FieldType.CURRENCY
        });

        // 使用可能期間FROM
        var dateFromField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_date_from',
            label : '使用可能期間FROM',
            type : serverWidget.FieldType.DATE
        });

        // 使用可能期間TO
        var dateToField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_date_to',
            label : '使用可能期間TO',
            type : serverWidget.FieldType.DATE
        });

        // データを取得する
        if (subsidiary && currency && entity) {
            setYoyakuRate(subsidiary, currency, entity, subList);
        }

        response.writePage(form);
    }

    /**
     * 予約レートデータを取得する
     */
    function setYoyakuRate(subsidiary, currency, entity, subList) {

        var searchType = 'customrecord_djkk_yoyaku_rate_tbl';

        var searchFilters = [];
        searchFilters.push(["custrecord_djkk_yoyaku_company", "anyof", subsidiary]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_yoyaku_category", "anyof", "1"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_yoyaku_currency", "anyof", currency]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_yoyaku_entity", "anyof", entity]);
        searchFilters.push("AND");
        searchFilters.push(["isinactive", "is", "F"]);

        var searchColumns = [search.createColumn({
            name : "custrecord_djkk_yoyaku_contractid",
            label : "DJ_契約番号"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_bank_name",
            label : "DJ_銀行名"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_rate",
            label : "DJ_レート"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_init_amount",
            label : "DJ_初期外貨額"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_residual_amount",
            label : "DJ_外貨残高"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_date_from",
            label : "DJ_使用可能期間From"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_date_to",
            label : "DJ_使用可能期間To"
        })];

        var searchResults = djkk_common.getCreateSearchResults(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for ( var i = 0; i < searchResults.length; i++) {

                var tmpResult = searchResults[i];

                // 内部ID
                var tmpId = tmpResult.id;
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_id',
                    line : i,
                    value : tmpId
                });

                // 契約番号
                var tmpContractId = tmpResult.getValue(searchColumns[0]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_contractid',
                    line : i,
                    value : tmpContractId
                });

                // 銀行名
                var tmpBankName = tmpResult.getText(searchColumns[1]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_bank_name',
                    line : i,
                    value : tmpBankName
                });

                // レート
                var tmpRate = tmpResult.getValue(searchColumns[2]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate',
                    line : i,
                    value : tmpRate
                });

                // 初期外貨額
                var tmpInitAmount = tmpResult.getValue(searchColumns[3]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_init_amount',
                    line : i,
                    value : tmpInitAmount
                });

                // 外貨残高
                var residualAmount = tmpResult.getValue(searchColumns[4]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_residual_amount',
                    line : i,
                    value : residualAmount
                });

                // 使用可能期間FROM
                var tmpDateFrom = tmpResult.getValue(searchColumns[5]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_date_from',
                    line : i,
                    value : tmpDateFrom
                });

                // 使用可能期間TO
                var tmpDateTo = tmpResult.getValue(searchColumns[6]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_date_to',
                    line : i,
                    value : tmpDateTo
                });
            }
        }
        return searchResults;
    }

    return {
        onRequest : onRequest
    };
});
