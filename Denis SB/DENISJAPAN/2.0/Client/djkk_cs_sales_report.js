/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 *
 * セールスレポート
 *
 */
define(['N/search', 'N/currentRecord', 'N/url', 'N/util', 'me'],

    function(search, currentRecord, url , util , me) {

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        var currentRecord = scriptContext.currentRecord;

        //会社
        if (scriptContext.fieldId === 'custpage_company') {
            var condition_data = getSearchConditionData(currentRecord,'M');
            if(!me.isEmpty(condition_data.custpage_company)){
                window.ischanged = false;
                window.location.href = getGetConditionUrl(condition_data);
            } else {
                alert('会社を選択してください。');
                return false;
            }
        }
        //顧客グループ、顧客、商品グループ、テリトリー、コスト
        if (scriptContext.fieldId === 'custpage_customer_group' ||
            scriptContext.fieldId === 'custpage_customer' ||
            scriptContext.fieldId === 'custpage_goods_group' ||
            scriptContext.fieldId === 'custpage_territory') {
            var condition_data = getSearchConditionData(currentRecord,'M');
            window.ischanged = false;
            window.location.href = getGetConditionUrl(condition_data);
        }
        //コスト
        if(scriptContext.fieldId === 'custpage_option') {
            var condition_data = getSearchConditionData(currentRecord,'M');
            if(condition_data.custpage_option == "3") {
                currentRecord.setValue({
                    "fieldId": "custpage_serect",
                    "value": true,
                    ignoreFieldChange:true
                });
            }
        }
    }

    /**
     * 検索ボタンクリック
     *
     */
    function btnSearchButton() {
        var currentRecord_data = currentRecord.get();
        var condition_data = getSearchConditionData(currentRecord_data,'S');
        window.ischanged = false;
        window.location.href = getGetConditionUrl(condition_data);
    }

    /**
     * クリアボタンクリック
     *
     */
    function btnClearButton() {
        var currentRecord_data = currentRecord.get();
        var condition_data = {};
        window.ischanged = false;
        window.location.href = getGetConditionUrl(condition_data);
    }

    /**
     * EXCEL出力ボタンクリック
     *
     */
    function btnExcelButton(fileUrl) {
        window.open(fileUrl, "_blank");
    }

    /**
     * Pdf出力ボタンクリック
     *
     */
    function btnPdfButton(fileUrl) {
        window.open(fileUrl, "_blank");
    }

    /**
     * 検索に戻るボタンクリック
     *
     */
    function btnReturnSearchButton(scriptContext) {
        var currentRecord_data = currentRecord.get();
        var condition_data = getSearchConditionData(currentRecord_data, 'M');
        window.ischanged = false;
        window.location.href = getGetConditionUrl(condition_data);
    }

    /**
     * 画面GET用URL作成
     *
     */
    function getGetConditionUrl(condition_data) {
        var linkUrl = url.resolveScript({
            scriptId: 'customscript_djkk_sl_sales_report',
            deploymentId: 'customdeploy_djkk_sl_sales_report',
            returnExternalUrl: false,
            params: condition_data
        });
        return linkUrl;
    }

    /**
     * 検索条件データの取得
     *
     */
    function getSearchConditionData(currentRecord,option_kbn) {
        var split_mark = ",";
        var condition_data = {};
        condition_data.custpage_option_kbn = option_kbn;

        // 検索条件
        condition_data.custpage_company = currentRecord.getValue({
            fieldId: 'custpage_company'
        });
        condition_data.custpage_brand = currentRecord.getValue({
            fieldId: 'custpage_brand'
        });
        condition_data.custpage_customer_group = currentRecord.getValue({
            fieldId: 'custpage_customer_group'
        }).join(split_mark);
        condition_data.custpage_customer = currentRecord.getValue({
            fieldId: 'custpage_customer'
        }).join(split_mark);
        condition_data.custpage_section = currentRecord.getValue({
            fieldId: 'custpage_section'
        }).join(split_mark);
        condition_data.custpage_period = currentRecord.getValue({
            fieldId: 'custpage_period'
        });
        condition_data.custpage_sales = currentRecord.getValue({
            fieldId: 'custpage_sales'
        }).join(split_mark);
        condition_data.custpage_goods = currentRecord.getValue({
            fieldId: 'custpage_goods'
        }).join(split_mark);
        condition_data.custpage_territory = currentRecord.getValue({
            fieldId: 'custpage_territory'
        }).join(split_mark);
        condition_data.custpage_option = currentRecord.getValue({
            fieldId: 'custpage_option'
        });
        var serect = currentRecord.getValue({
            fieldId: 'custpage_serect'
        });
        condition_data.custpage_serect = util.isBoolean(serect) && serect ? "T" : "";
        var last_year = currentRecord.getValue({
            fieldId: 'custpage_last_year'
        });
        condition_data.custpage_last_year = util.isBoolean(last_year) && last_year ? "T" : "";
        condition_data.custpage_goods_group = currentRecord.getValue({
            fieldId: 'custpage_goods_group'
        }).join(split_mark);
        condition_data.custpage_status = currentRecord.getValue({
            fieldId: 'custpage_status'
        }).join(split_mark);
        condition_data.custpage_ware_house = currentRecord.getValue({
            fieldId: 'custpage_ware_house'
        }).join(split_mark);

        // 検索結果
        var width = document.documentElement.clientWidth;
        var height = document.documentElement.clientHeight;
        condition_data.report_width = width;
        condition_data.report_height = height;

        return condition_data;
    }

    return {
        fieldChanged: fieldChanged,
        btnSearchButton: btnSearchButton,
        btnClearButton: btnClearButton,
        btnReturnSearchButton:btnReturnSearchButton,
        btnExcelButton: btnExcelButton,
        btnPdfButton: btnPdfButton
    };
    
});
