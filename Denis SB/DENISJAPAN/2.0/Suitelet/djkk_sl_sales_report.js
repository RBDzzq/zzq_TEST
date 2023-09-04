/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 *
 * セールスレポート
 *
 */
define(['N/error', 'N/http', 'N/https', 'N/ui/serverWidget','N/runtime', 'N/log', 'N/search', 'me', 'N/file', 'N/encode','N/render','N/url', '/SuiteScripts/DENISJAPAN/2.0/Common/file_cabinet_common'],
    /**
     * @param {error} error
     * @param {http} http
     * @param {https} https
     * @param {serverWidget} serverWidget
     * @param {log} log
     */
    function(error, http, https, serverWidget, runtime, log, search, me, file,encode,render, url, cabinet) {

        const SAVE_FOLDER_ID = cabinet.fileCabinetId('sales_report');  // 保存フォルダーID <セールスレポート>
        const IMG_SERECT_ID = 35496;

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            try {
                if (context.request.method === 'GET') {
                    doGet(context);
                }
            } catch (e) {
                log.error({title: e.name, details: e.message});
            }
        }

        /**
         *メイン処理
         *
         * @param context
         */
        function doGet(context){
            //Get parameter
            var condition_data = getSearchConditionData(context);

            var form = serverWidget.createForm({
                title: 'セールスレポート'
            });

            //検索条件エリア
            buildFormCondition(context,form,condition_data);

            //検索明細
            var detail_data = buildFormDetail(context,form,condition_data);

            //ボタンエリア
            buildButton(context,form,condition_data, detail_data);

            form.clientScriptModulePath = '../Client/djkk_cs_sales_report.js';
            context.response.writePage(form);
        }

        /**
         * 検索条件の取得
         *
         * @param context
         * @returns {{}}
         */
        function getSearchConditionData(context) {
            var split_mark = ',';
            var condition_data = {};
            var userObj = runtime.getCurrentUser();
            condition_data.custpage_company = userObj.subsidiary;
            condition_data.custpage_option_kbn = getParamValue(context.request.parameters.custpage_option_kbn);
            var para_custpage_company = getParamValue(context.request.parameters.custpage_company);
            condition_data.custpage_brand = getParamValue(context.request.parameters.custpage_brand);
            condition_data.custpage_customer_group = getParamValue(context.request.parameters.custpage_customer_group).split(split_mark);
            condition_data.custpage_customer = getParamValue(context.request.parameters.custpage_customer).split(split_mark);
            condition_data.custpage_section = getParamValue(context.request.parameters.custpage_section).split(split_mark);
            condition_data.custpage_period = getParamValue(context.request.parameters.custpage_period);
            condition_data.custpage_goods_group = getParamValue(context.request.parameters.custpage_goods_group).split(split_mark);
            condition_data.custpage_goods = getParamValue(context.request.parameters.custpage_goods).split(split_mark);
            condition_data.custpage_territory = getParamValue(context.request.parameters.custpage_territory).split(split_mark);
            condition_data.custpage_option = getParamValue(context.request.parameters.custpage_option);
            condition_data.custpage_serect = getParamValue(context.request.parameters.custpage_serect);
            condition_data.custpage_last_year = getParamValue(context.request.parameters.custpage_last_year);
            condition_data.custpage_sales = getParamValue(context.request.parameters.custpage_sales).split(split_mark);
            condition_data.custpage_status = getParamValue(context.request.parameters.custpage_status).split(split_mark);
            condition_data.custpage_ware_house = getParamValue(context.request.parameters.custpage_ware_house).split(split_mark);
            condition_data.report_height = getParamValue(context.request.parameters.report_height);
            condition_data.report_width = getParamValue(context.request.parameters.report_width);
            condition_data.isSecret = false;
            condition_data.isQut = false;
            condition_data.isAmt = false;
            condition_data.isProfit = false;
            condition_data.isShowLastYear = false;

            if(!me.isEmpty(para_custpage_company)) {
                condition_data.custpage_company = para_custpage_company;
            }
            condition_data.custpage_company_nm = getSubsidiary(condition_data);
            if(me.isEmpty(condition_data.custpage_period)) {
                condition_data.custpage_period = "4";
            }
            if(me.isEmpty(condition_data.custpage_option)) {
                condition_data.custpage_option = "1";
            }
            if(!me.isEmpty(condition_data.custpage_serect)) {
                condition_data.custpage_serect = 'T';
                condition_data.isSecret = true;
            }
            if(!me.isEmpty(condition_data.custpage_last_year)) {
                condition_data.custpage_last_year = 'T';
                condition_data.isShowLastYear = true;
            }

            if(condition_data.custpage_option == "1") {
                condition_data.isQut = true;
            }
            if(condition_data.custpage_option == "2") {
                condition_data.isAmt = true;
            }
            if(condition_data.custpage_option == "3") {
                condition_data.isProfit = true;
            }

            var startMonth = 0;
            var endMonth = 11;
            var systemDate = me.getNowDateJP();
            var year = systemDate.getFullYear();
            var month = systemDate.getMonth();
            condition_data.custpage_system_date = systemDate;

            if(condition_data.custpage_period == "1") {
                startMonth = month;
                endMonth = month;
            } else if(condition_data.custpage_period == "2") {
                startMonth = month-2;
                endMonth = month;
            } else if(condition_data.custpage_period == "3") {
                startMonth = month-5;
                endMonth = month;
            } else {
                startMonth = month-11;
                endMonth = month;
            }
            startMonth = startMonth < 0 ? 0 : startMonth;
            var currentMonthDate = new Date(year, startMonth,1);
            var currentMonthLastDate = new Date(year, endMonth+1,1);
            currentMonthLastDate.setDate(currentMonthLastDate.getDate()-1);
            var currentMonthDate_pre = new Date(year-1, startMonth,1);
            var currentMonthLastDate_pre = new Date(year-1, endMonth+1,1);
            currentMonthLastDate_pre.setDate(currentMonthLastDate_pre.getDate()-1);
            condition_data.custpage_period_from = getDateStr(currentMonthDate);
            condition_data.custpage_period_end = getDateStr(currentMonthLastDate);
            condition_data.custpage_period_from_pre = getDateStr(currentMonthDate_pre);
            condition_data.custpage_period_end_pre = getDateStr(currentMonthLastDate_pre);
            condition_data.custpage_period_months = new Array();
            for(var i=0;i<=11;i++) {
                condition_data.custpage_period_months.push(i);
            }
            condition_data.custpage_period_title= "" + year + "/" + (startMonth+1) + "~" + (endMonth+1);

            return condition_data;
        }

        /**
         * ボタンエリア構築
         *
         * @param context
         * @param form
         * @param condition_data
         */
        function buildButton(context, form, condition_data, detail_data) {
            if(condition_data.custpage_option_kbn == "S") {
                if(detail_data.isHaveData) {
                    if(condition_data.isSecret) {
                        form.addButton({
                            id: 'btn_pdf_out',
                            label: 'PDF出力',
                            functionName: 'btnPdfButton("' + detail_data.fileUrl + '");'
                        });
                    } else {
                        form.addButton({
                            id: 'btn_excel_out',
                            label: 'Excel出力',
                            functionName: 'btnExcelButton("' + detail_data.fileUrl + '");'
                        });
                    }
                }
                form.addButton({
                    id: 'btn_return_search',
                    label: '検索に戻る',
                    functionName: 'btnReturnSearchButton();'
                });
            } else {
                form.addButton({
                    id: 'btn_search',
                    label: '検索',
                    functionName: 'btnSearchButton();'
                });
                form.addButton({
                    id: 'btn_clear',
                    label: 'クリア',
                    functionName: 'btnClearButton();'
                });
            }

        }

        /**
         * 検索条件エリア構築
         *
         * @param context
         * @param form
         * @param condition_data
         */
        function buildFormCondition(context, form, condition_data) {
            var isSearch = (condition_data.custpage_option_kbn == "S") ? true : false;
            var search_rank_id = 'search_condition_rank';
            var search_group = form.addFieldGroup({
                id: search_rank_id,
                label: '検索項目'
            });
            //会社
            var custpage_company = form.addField({
                id: 'custpage_company',
                label: '会社',
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id,
                source: 'subsidiary'
            });
            custpage_company.defaultValue = condition_data.custpage_company;
            setDisabled(custpage_company,isSearch);
            //セクション
            var custpage_section = form.addField({
                id: 'custpage_section',
                label: 'セクション',
                type: serverWidget.FieldType.MULTISELECT,
                container: search_rank_id
            });
            setDisabled(custpage_section,isSearch);
            var sectionFilters = [];
            sectionFilters.push(["subsidiary", "is", condition_data.custpage_company]);
            var sectionSearchObj = search.create({
                type: search.Type.DEPARTMENT,
                filters: sectionFilters,
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            label: "表示ID"
                        }),
                        search.createColumn({
                            name: "name",
                            label: "表示名前",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            addSelectAllOption(custpage_section,condition_data.custpage_section);
            sectionSearchObj.run().each(function(result){
                var item_value = result.getValue('internalid');
                var isSelected = (condition_data.custpage_section.indexOf(item_value) >= 0);
                custpage_section.addSelectOption({
                    value: item_value,
                    text: result.getValue('name'),
                    isSelected: isSelected
                });
                return true;
            });
            //ブランド
            var custpage_brand = form.addField({
                id: 'custpage_brand',
                label: 'ブランド',
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id
            });
            setDisabled(custpage_brand,isSearch);
            custpage_brand.addSelectOption({
                value: "",
                text:  ""
            });
            var brandSearchObj = search.create({
                type: "classification",
                filters:
                    [
                        ["subsidiary","IS",condition_data.custpage_company]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            label: "表示ID"
                        }),
                        search.createColumn({
                            name: "name",
                            label: "表示名前",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            brandSearchObj.run().each(function(result){
                custpage_brand.addSelectOption({
                    value: result.getValue('internalid'),
                    text:  result.getValue('name')
                });
                return true;
            });
            custpage_brand.defaultValue = condition_data.custpage_brand;
            //顧客グループ
            var custpage_customer_group = form.addField({
                id: 'custpage_customer_group',
                label: '顧客グループ',
                type: serverWidget.FieldType.MULTISELECT,
                container: search_rank_id
            });
            setDisabled(custpage_customer_group,isSearch);
            var customerGroupSearchObj = search.create({
                type: "customrecord_djkk_customer_group",
                filters:
                    [
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            label: "表示ID"
                        }),
                        search.createColumn({
                            name: "name",
                            label: "表示名前",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            addSelectAllOption(custpage_customer_group,condition_data.custpage_customer_group);
            customerGroupSearchObj.run().each(function(result){
                var item_value = result.getValue('internalid');
                var isSelected = (condition_data.custpage_customer_group.indexOf(item_value) >= 0);
                custpage_customer_group.addSelectOption({
                    value: item_value,
                    text:  result.getValue('name'),
                    isSelected: isSelected
                });
                return true;
            });
            //顧客
            var custpage_customer = form.addField({
                id: 'custpage_customer',
                label: '顧客',
                type: serverWidget.FieldType.MULTISELECT,
                container: search_rank_id,
            });
            setDisabled(custpage_customer,isSearch);
            var customerFilters = [];
            customerFilters.push(["subsidiary", "is", condition_data.custpage_company]);
            customerFilters.push("AND");
            customerFilters.push(["custentity_djkk_customer_type", "is", "3"]);
            var customerSubFilters = getArrFilters(condition_data.custpage_customer_group,"custentity_djkk_product_category_scetikk","IS","OR");
            if(customerSubFilters.length > 0) {
                var customerSubFilters2 = getArrFilters(condition_data.custpage_customer_group,'custentity_djkk_product_category_jp',"IS","OR");
                customerSubFilters.push("OR");
                customerSubFilters = customerSubFilters.concat(customerSubFilters2);
                customerFilters.push("AND");
                customerFilters.push([customerSubFilters]);
            }
            var customerSearchObj = search.create({
                type: search.Type.CUSTOMER,
                filters: customerFilters,
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            label: "表示ID",
                            sort: search.Sort.ASC
                        }),
                        search.createColumn({
                            name: "companyname",
                            label: "表示名前",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            addSelectAllOption(custpage_customer,condition_data.custpage_customer);
            customerSearchObj.run().each(function(result){
                var item_value = result.getValue('entityid');
                var isSelected = (condition_data.custpage_customer.indexOf(item_value) >= 0);
                custpage_customer.addSelectOption({
                    value: item_value,
                    text: result.getValue('entityid') + " " + result.getValue('companyname'),
                    isSelected: isSelected
                });
                return true;
            });

            //期間（年・四半期・月毎）
            var custpage_period = form.addField({
                id: 'custpage_period',
                label: '期間',
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id
            });
            setDisabled(custpage_period,isSearch);
            custpage_period.updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTCOL
            });
            custpage_period.addSelectOption({
                value: "1",
                text: "一月間"
            });
            custpage_period.addSelectOption({
                value: "2",
                text: "三月間"
            });
            custpage_period.addSelectOption({
                value: "3",
                text: "半年間"
            });
            custpage_period.addSelectOption({
                value: "4",
                text: "一年間"
            });
            custpage_period.defaultValue = condition_data.custpage_period;
            //営業
            var custpage_sales = form.addField({
                id: 'custpage_sales',
                label: '営業',
                type: serverWidget.FieldType.MULTISELECT,
                container: search_rank_id
            });
            setDisabled(custpage_sales,isSearch);
            var salesSearchObj = search.create({
                type: search.Type.EMPLOYEE,
                filters:
                    [
                        ["subsidiary","is",condition_data.custpage_company],
                        "AND",
                        ["salesrep", "is", 'T']
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            label: "表示ID"
                        }),
                        search.createColumn({
                            name: "entityid",
                            label: "表示名前",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            addSelectAllOption(custpage_sales,condition_data.custpage_sales);
            salesSearchObj.run().each(function(result){
                var item_value = result.getValue('internalid');
                var isSelected = (condition_data.custpage_sales.indexOf(item_value) >= 0);
                custpage_sales.addSelectOption({
                    value: item_value,
                    text: result.getValue('entityid'),
                    isSelected: isSelected
                });
                return true;
            });
            //商品グループ
            var custpage_goods_group = form.addField({
                id: 'custpage_goods_group',
                label: '商品グループ',
                type: serverWidget.FieldType.MULTISELECT,
                container: search_rank_id
            });
            setDisabled(custpage_goods_group,isSearch);
            var goodsGroupSearchObj = search.create({
                type: "customrecord_djkk_product_group",
                filters:
                    [
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            label: "表示ID"
                        }),
                        search.createColumn({
                            name: "name",
                            label: "表示名前",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            addSelectAllOption(custpage_goods_group,condition_data.custpage_goods_group);
            goodsGroupSearchObj.run().each(function(result){
                var item_value = result.getValue('internalid');
                var isSelected = (condition_data.custpage_goods_group.indexOf(item_value) >= 0);
                custpage_goods_group.addSelectOption({
                    value: item_value,
                    text: result.getValue('name'),
                    isSelected: isSelected
                });
                return true;
            });
            //商品
            var custpage_goods = form.addField({
                id: 'custpage_goods',
                label: '商品',
                type: serverWidget.FieldType.MULTISELECT,
                container: search_rank_id
            });
            setDisabled(custpage_goods,isSearch);
            var goodsFilters = [];
            goodsFilters.push(["subsidiary", "is", condition_data.custpage_company]);
            var goodsSubFilters = getArrFilters(condition_data.custpage_goods_group,"custitem_djkk_product_group","IS","OR");
            if(goodsSubFilters.length > 0) {
                goodsFilters.push("AND");
                goodsFilters.push([goodsSubFilters]);
            }
            var goodsSearchObj = search.create({
                type: search.Type.ITEM,
                filters: goodsFilters,
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            label: "表示ID"
                        }),
                        search.createColumn({
                            name: "itemid",
                            label: "名前",
                            sort: search.Sort.ASC
                        }),
                        search.createColumn({
                            name: "displayname",
                            label: "表示名前",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            addSelectAllOption(custpage_goods,condition_data.custpage_goods);
            goodsSearchObj.run().each(function(result){
                var goods_show_name = result.getValue('displayname');
                var goods_item_id = result.getValue('itemid');
                var show_text = me.isEmpty(goods_show_name) ? goods_item_id : goods_show_name;
                var item_value = result.getValue('internalid');
                var isSelected = (condition_data.custpage_goods.indexOf(item_value) >= 0);
                custpage_goods.addSelectOption({
                    value: item_value,
                    text: show_text,
                    isSelected: isSelected
                });
                return true;
            });

            var custpage_option_qut = form.addField({
                id: 'custpage_option',
                label: '数量',
                type: serverWidget.FieldType.RADIO,
                source: "1",
                container: search_rank_id
            });
            setDisabled(custpage_option_qut,isSearch);
            if(condition_data.isQut) {
                custpage_option_qut.defaultValue = condition_data.custpage_option;
            }
            var custpage_option_amt = form.addField({
                id: 'custpage_option',
                label: '売上',
                type: serverWidget.FieldType.RADIO,
                source: "2",
                container: search_rank_id
            });
            setDisabled(custpage_option_amt,isSearch);
            if(condition_data.isAmt) {
                custpage_option_amt.defaultValue = condition_data.custpage_option;
            }
            var custpage_option_pro = form.addField({
                id: 'custpage_option',
                label: '利益（粗利）',
                type: serverWidget.FieldType.RADIO,
                source: "3",
                container: search_rank_id
            });
            setDisabled(custpage_option_pro,isSearch);
            if(condition_data.isProfit) {
                custpage_option_pro.defaultValue = condition_data.custpage_option;
            }

            //社外秘
            var custpage_serect = form.addField({
                id: 'custpage_serect',
                label: '社外秘',
                type: serverWidget.FieldType.CHECKBOX,
                container: search_rank_id
            });
            setDisabled(custpage_serect,isSearch);
            custpage_serect.updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTCOL
            });
            custpage_serect.defaultValue = condition_data.custpage_serect;
            //前年度
            var custpage_last_year = form.addField({
                id: 'custpage_last_year',
                label: '前年度',
                type: serverWidget.FieldType.CHECKBOX,
                container: search_rank_id
            });
            setDisabled(custpage_last_year,isSearch);
            custpage_last_year.defaultValue = condition_data.custpage_last_year;
            //テリトリー（アレア）
            var custpage_territory = form.addField({
                id: 'custpage_territory',
                label: 'テリトリー',
                type: serverWidget.FieldType.MULTISELECT,
                container: search_rank_id
            });
            setDisabled(custpage_territory,isSearch);
            var territorySearchObj = search.create({
                type: "customrecord_djkk_location_area",
                filters:
                    [
                     ["custrecord_djkk_location_subsidiary","anyof",condition_data.custpage_company]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            label: "表示ID"
                        }),
                        search.createColumn({
                            name: "name",
                            label: "表示名前",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            addSelectAllOption(custpage_territory,condition_data.custpage_territory);
            territorySearchObj.run().each(function(result){
                var item_value = result.getValue('internalid');
                var isSelected = (condition_data.custpage_territory.indexOf(item_value) >= 0);
                custpage_territory.addSelectOption({
                    value: item_value,
                    text: result.getValue('name'),
                    isSelected: isSelected
                });
                return true;
            });
            //倉庫
            var wareHouseFilters = [];
            wareHouseFilters.push(["subsidiary", "is", condition_data.custpage_company]);
            var wareHouseSubFilters = getArrFilters(condition_data.custpage_territory,"custrecord_djkk_location_area","IS","OR");
            if(wareHouseSubFilters.length > 0) {
                wareHouseFilters.push("AND");
                wareHouseFilters.push([wareHouseSubFilters]);
            }
            var custpage_ware_house = form.addField({
                id: 'custpage_ware_house',
                label: '倉庫',
                type: serverWidget.FieldType.MULTISELECT,
                container: search_rank_id
            });
            setDisabled(custpage_ware_house,isSearch);
            var wareHouseSearchObj = search.create({
                type: search.Type.LOCATION,
                filters: wareHouseFilters,
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            label: "表示ID"
                        }),
                        search.createColumn({
                            name: "name",
                            label: "表示名前",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            addSelectAllOption(custpage_ware_house,condition_data.custpage_ware_house);
            wareHouseSearchObj.run().each(function(result){
                var item_value = result.getValue('internalid');
                var isSelected = (condition_data.custpage_ware_house.indexOf(item_value) >= 0);
                custpage_ware_house.addSelectOption({
                    value: result.getValue('internalid'),
                    text: result.getValue('name'),
                    isSelected: isSelected
                });
                return true;
            });
            //ステータス
            var custpage_status = form.addField({
                id: 'custpage_status',
                label: 'ステータス',
                type: serverWidget.FieldType.MULTISELECT,
                container: search_rank_id
            });
            setDisabled(custpage_status,isSearch);
            const statusrefCol = search.createColumn({
                name: "statusref",
                label: "ステータス",
                summary: "GROUP",
                sort: search.Sort.ASC
            });
            var statusSearchObj = search.create({
                type: 'salesorder',
                filters:
                    [
                        ["type","anyof","SalesOrd"],
                        "AND",
                        ["subsidiary","is",condition_data.custpage_company]
                    ],
                columns:
                    [
                        statusrefCol
                    ]
            });
            addSelectAllOption(custpage_status,condition_data.custpage_status);
            statusSearchObj.run().each(function(result){
                var item_value = result.getValue(statusrefCol);
                var isSelected = (condition_data.custpage_status.indexOf(item_value) >= 0);
                custpage_status.addSelectOption({
                    value: item_value,
                    text: result.getText(statusrefCol),
                    isSelected: isSelected
                });
                return true;
            });

        }

        /**
         * 検索明細エリア構築
         *
         * @param context
         * @param form
         * @param condition_data
         */
        function buildFormDetail(context, form, condition_data) {
            var detail_data = {};
            detail_data.isHaveData = false;
            detail_data.fileUrl = "";

            var isSearch = (condition_data.custpage_option_kbn == "S") ? true : false;

            var detail_rank_id = 'detail_rank';
            form.addFieldGroup({
                id: detail_rank_id,
                label: '明細項目'
            });

            var detail_html = '';

            // 検索結果の取得
            if(isSearch) {
                detail_data = doSearch(condition_data);
                // 結果HTMLを作成
                detail_html += detail_data.titleHtml;
                if(detail_data.isHaveData) {
                    // テーブル幅
                    var tbW = 'width:' + Number(condition_data.report_width - 80) + 'px;';
                    // テーブル高さ
                    var tbH = 'height:' + Number(condition_data.report_height * 59 / 60 - 250) + 'px;';
                    detail_html += '<div id="tablediv" style="overflow-y:scroll;' + tbH + tbW+'border:1px solid gray;">';
                    detail_html += detail_data.dataHtml;
                    detail_html += '</div>';

                    if(condition_data.isSecret) {
                        // PDFダウンロード
                        detail_data.fileUrl = createPdfURL(detail_data);
                    } else {
                        // Excelダウンロード
                        detail_data.fileUrl = createExcelURL(detail_data);
                    }
                }
            }

            var custpage_detail = form.addField({
                id: 'custpage_detail',
                label: ' ',
                type: serverWidget.FieldType.INLINEHTML,
                container: detail_rank_id
            });

            custpage_detail.defaultValue = detail_html;

            return detail_data;
        }

        /**
         * 条件よりデータ検索とEXCEL、PDF作成
         * データ取得、HTML作成
         * @param condition_data
         * @returns {{}}
         */
        function doSearch(condition_data) {

            var result_data = getSearchResult(condition_data);
            var search_result = createHtml(condition_data, result_data);

            return search_result;
        }

        /**
         * データ取得
         * @param condition_data
         * @returns {{}}
         */
        function getSearchResult(condition_data) {
            // API データ取得
            var dataFilters = [];
            dataFilters.push(["subsidiary", "anyof", condition_data.custpage_company]);
            dataFilters.push("AND");
            dataFilters.push(["type","anyof","SalesOrd"]);
            dataFilters.push("AND");
            dataFilters.push(["mainline","is","F"]);
            dataFilters.push("AND");
            dataFilters.push(["taxline","is","F"]);
            dataFilters.push("AND");
            dataFilters.push(["shipping","is","F"]);
            // dataFilters.push("AND");
            // dataFilters.push(["custbody_djkk_delivery_destination","noneof","@NONE@"]);
            dataFilters.push("AND");
            dataFilters.push([
                ["customer.custentity_djkk_product_category_scetikk","noneof","@NONE@"],
                "OR",
                ["customer.custentity_djkk_product_category_jp","noneof","@NONE@"]
            ]);
            //セクション
            var depSubFilters = getArrFilters(condition_data.custpage_section,"department","IS","OR");
            if(depSubFilters.length > 0) {
                dataFilters.push("AND");
                dataFilters.push([depSubFilters]);
            }
            //ブランド
            if(!me.isEmpty(condition_data.custpage_brand)) {
                dataFilters.push("AND");
                dataFilters.push(["class","is",condition_data.custpage_brand]);
            }
            //顧客グループ
            var customerGroupSubFilters = getArrFilters(condition_data.custpage_customer_group,"customer.custentity_djkk_product_category_scetikk","IS","OR");
            if(customerGroupSubFilters.length > 0) {
                 var customerGroupSubFilters2 = getArrFilters(condition_data.custpage_customer_group,"customer.custentity_djkk_product_category_jp","IS","OR");
                customerGroupSubFilters.push("OR");
                customerGroupSubFilters = customerGroupSubFilters.concat(customerGroupSubFilters2);
                dataFilters.push("AND");
                dataFilters.push([customerGroupSubFilters]);
            }
            //顧客
            var customerSubFilters = getArrFilters(condition_data.custpage_customer,"customer.entityid","IS","OR");
            if(customerSubFilters.length > 0) {
                dataFilters.push("AND");
                dataFilters.push([customerSubFilters]);
            }
            //商品グループ
            var goodsGroupSubFilters = getArrFilters(condition_data.custpage_goods_group,"item.custitem_djkk_product_group","IS","OR");
            if(goodsGroupSubFilters.length > 0) {
                dataFilters.push("AND");
                dataFilters.push([goodsGroupSubFilters]);
            }
            //商品
            var goodsSubFilters = getArrFilters(condition_data.custpage_goods,"item.internalid","IS","OR");
            if(goodsSubFilters.length > 0) {
                dataFilters.push("AND");
                dataFilters.push([goodsSubFilters]);
            }
            //テリトリー
            var territorySubFilters = getArrFilters(condition_data.custpage_territory,"location.custrecord_djkk_location_area","IS","OR");
            if(territorySubFilters.length > 0) {
                dataFilters.push("AND");
                dataFilters.push([territorySubFilters]);
            }
            //営業
            var salesSubFilters = getArrFilters(condition_data.custpage_sales,"salesrep","IS","OR");
            if(salesSubFilters.length > 0) {
                dataFilters.push("AND");
                dataFilters.push([salesSubFilters]);
            }
            //ステータス
            var statusSubFilters = getArrFilters(condition_data.custpage_status,"status","IS","OR");
            if(statusSubFilters.length > 0) {
                dataFilters.push("AND");
                dataFilters.push([statusSubFilters]);
            }
            //倉庫
            var wareHouseSubFilters = getArrFilters(condition_data.custpage_ware_house,"location","IS","OR");
            if(wareHouseSubFilters.length > 0) {
                dataFilters.push("AND");
                dataFilters.push([wareHouseSubFilters]);
            }
            //年月
            var yearMonthSubFilters = [];
            yearMonthSubFilters.push(['trandate', 'within', condition_data.custpage_period_from, condition_data.custpage_period_end]);
            if(condition_data.isShowLastYear) {
                yearMonthSubFilters.push("OR");
                yearMonthSubFilters.push(['trandate', 'within', condition_data.custpage_period_from_pre, condition_data.custpage_period_end_pre]);
            }
            dataFilters.push("AND");
            dataFilters.push([yearMonthSubFilters]);

            var col_section = search.createColumn({
                name: "department",
                summary: "GROUP",
                label: "セクション",
                sort: search.Sort.ASC
            });
            var col_sales = search.createColumn({
                name: "salesrep",
                summary: "GROUP",
                label: "営業担当者",
                sort: search.Sort.ASC
            });
            var col_brand = search.createColumn({
                name: "class",
                summary: "GROUP",
                label: "ブランド"
            });
            var col_goods_group = search.createColumn({
                name: "custitem_djkk_product_group",
                join: "item",
                summary: "GROUP",
                label: "商品グループ",
                sort: search.Sort.ASC
            });
            var col_goods_cd = search.createColumn({
                name: "itemid",
                join: "item",
                summary: "GROUP",
                label: "商品コード",
                sort: search.Sort.ASC
            });
            var col_goods_nm = search.createColumn({
                name: "displayname",
                join: "item",
                summary: "GROUP",
                label: "商品名称",
                sort: search.Sort.ASC
            });
            var col_customer_id = search.createColumn({
                name: "entityid",
                join: "customer",
                summary: "GROUP",
                label: "顧客ID",
                sort: search.Sort.ASC
            });
            var col_customer_nm = search.createColumn({
                name: "altname",
                join: "customer",
                summary: "GROUP",
                label: "顧客名",
                sort: search.Sort.ASC
            });
            var col_customer_group1 = search.createColumn({
                name: "custentity_djkk_product_category_scetikk",
                join: "customer",
                summary: "GROUP",
                label: "顧客グループ1",
                sort: search.Sort.ASC
            });
            var col_customer_group2 = search.createColumn({
                name: "custentity_djkk_product_category_jp",
                join: "customer",
                summary: "GROUP",
                label: "顧客グループ2",
                sort: search.Sort.ASC
            });
            var col_delivery = search.createColumn({
                name: "custbody_djkk_delivery_destination",
                summary: "GROUP",
                label: "納品先",
                sort: search.Sort.ASC
            });
            var col_trandate = search.createColumn({
                name: "formulatext",
                summary: "GROUP",
                label: "日付",
                formula: "TO_CHAR({trandate}, 'YYYYMM')",
                sort: search.Sort.ASC
            });
            var col_qut = search.createColumn({
                name: "quantity",
                summary: "SUM",
                label: "数量"
            });
            var col_amt = search.createColumn({
                name: "amount",
                summary: "SUM",
                label: "売上金額",
            });
            var col_cost = search.createColumn({
                name: "formulanumeric",
                summary: "SUM",
                label: "コスト",
                formula: "{quantity} * {item.averagecost}"
            });
            var dataCols = [
                col_section,col_sales,col_brand,
                col_goods_group,col_goods_cd,col_goods_nm,
                col_customer_id,col_customer_nm,col_customer_group1,col_customer_group2,
                col_delivery,col_trandate,col_qut,col_amt,col_cost
            ];
            var dataSearchObj = search.create({
                type: 'salesorder',
                filters: dataFilters,
                columns: dataCols
            });

            // データ処理
            var haveData = false;
            var result_data = {};
            result_data.items = new Array();
            // セクション、営業、ブランド
            var data_header = {
                section_id: "",
                section_txt: "",
                sales_id: "",
                sales_txt: "",
                brand_id: "",
                brand_txt: "",
                items: new Array()
            };
            // 商品グループ
            var data_goods_group = {
                goods_group_id: "",
                goods_group_txt: "",
                items: new Array()
            };
            // 商品
            var data_goods = {
                goods_id: "",
                goods_txt: "",
                items: new Array()
            };
            // 顧客グループ
            var data_customer_group = {
                customer_group_id: "",
                customer_group_txt: "",
                items: new Array()
            };
            // 顧客
            var data_customer = {
                customer_id: "",
                customer_txt: "",
                items: new Array(),
                total: {
                    qut: 0,
                    amt: 0,
                    cost: 0,
                    qut_pre: 0,
                    amt_pre: 0,
                    cost_pre:0,
                    items: {}
                }
            };
            // 納品先
            var data_delivery = {
                delivery_id: "",
                delivery_txt: "",
                items: new Array(),
                qut: 0,
                amt: 0,
                cost:0,
                qut_pre: 0,
                amt_pre: 0,
                cost_pre:0,
            };
            // 日付、数量など
            var data_detail = {
                key: "",
                qut: 0,
                amt: 0,
                cost: 0
            };

            dataSearchObj.run().each(function(result){
                // セクション、営業担当者、ブランド
                var tmp_section_v = result.getValue(col_section);
                var tmp_section_t = result.getText(col_section);
                tmp_section_v = getEmptyData(tmp_section_v,tmp_section_v);
                tmp_section_t = getEmptyData(tmp_section_v,tmp_section_t);
                var tmp_sales_v = result.getValue(col_sales);
                var tmp_sales_t = result.getText(col_sales);
                tmp_sales_v = getEmptyData(tmp_sales_v,tmp_sales_v);
                tmp_sales_t = getEmptyData(tmp_sales_v,tmp_sales_t);
                var tmp_brand_v = result.getValue(col_brand);
                var tmp_brand_t = result.getText(col_brand);
                tmp_brand_v = getEmptyData(tmp_brand_v,tmp_brand_v);
                tmp_brand_t = getEmptyData(tmp_brand_v,tmp_brand_t);
                // 商品グループ
                var tmp_goods_group_v = result.getValue(col_goods_group);
                var tmp_goods_group_t = result.getText(col_goods_group);
                tmp_goods_group_v = getEmptyData(tmp_goods_group_v,tmp_goods_group_v);
                tmp_goods_group_t = getEmptyData(tmp_goods_group_v,tmp_goods_group_t);
                // 商品
                var tmp_goods_v = result.getValue(col_goods_cd);
                var tmp_goods_t = result.getValue(col_goods_nm);
                tmp_goods_v = getEmptyData(tmp_goods_v,tmp_goods_v);
                tmp_goods_t = getEmptyData(tmp_goods_v,tmp_goods_t);
                //　顧客グループ
                var tmp_customer_group_v = "";
                var tmp_customer_group_t = "";
                var tmp_customer_group1_v = result.getValue(col_customer_group1);
                var tmp_customer_group1_t = result.getText(col_customer_group1);
                var tmp_customer_group2_v = result.getValue(col_customer_group2);
                var tmp_customer_group2_t = result.getText(col_customer_group2);
                tmp_customer_group1_v = getEmptyData(tmp_customer_group1_v,tmp_customer_group1_v);
                tmp_customer_group1_t = getEmptyData(tmp_customer_group1_v,tmp_customer_group1_t);
                tmp_customer_group2_v = getEmptyData(tmp_customer_group2_v,tmp_customer_group2_v);
                tmp_customer_group2_t = getEmptyData(tmp_customer_group2_v,tmp_customer_group2_t);
                //　顧客
                var tmp_customer_v = result.getValue(col_customer_id);
                var tmp_customer_t = result.getValue(col_customer_nm);
                tmp_customer_v = getEmptyData(tmp_customer_v,tmp_customer_v);
                tmp_customer_t = getEmptyData(tmp_customer_v,tmp_customer_t);
                // 納品先
                var tmp_delivery_v = result.getValue(col_delivery);
                var tmp_delivery_t = result.getText(col_delivery);
                tmp_delivery_v = getEmptyData(tmp_delivery_v,tmp_delivery_v);
                tmp_delivery_t = getEmptyData(tmp_delivery_v,tmp_delivery_t);
                // 年月、数量、金額など
                var tmp_trandate_v = result.getValue(col_trandate);
                var tmp_qut_v = result.getValue(col_qut);
                var tmp_amt_v = result.getValue(col_amt);
                var tmp_cost_v = result.getValue(col_cost);

                // [GROUP]セクション、営業担当者、ブランド
                if(result_data.items.length == 0 ||
                    result_data.items[result_data.items.length-1].section_id != tmp_section_v ||
                    result_data.items[result_data.items.length-1].sales_id != tmp_sales_v ||
                    result_data.items[result_data.items.length-1].brand_id != tmp_brand_v) {
                    data_header = {
                        section_id: tmp_section_v,
                        section_txt: tmp_section_t,
                        sales_id: tmp_sales_v,
                        sales_txt: tmp_sales_t,
                        brand_id: tmp_brand_v,
                        brand_txt: tmp_brand_t,
                        items: new Array()
                    };
                    result_data.items.push(data_header);
                }
                data_header = result_data.items[result_data.items.length-1];
                // [GROUP]商品グループ
                if(data_header.items.length == 0 ||
                    data_header.items[data_header.items.length-1].goods_group_id != tmp_goods_group_v) {
                    data_goods_group = {
                        goods_group_id: tmp_goods_group_v,
                        goods_group_txt: tmp_goods_group_t,
                        items: new Array()
                    };
                    data_header.items.push(data_goods_group);
                }
                data_goods_group = data_header.items[data_header.items.length-1];
                // [GROUP]商品
                if(data_goods_group.items.length == 0 ||
                    data_goods_group.items[data_goods_group.items.length-1].goods_id != tmp_goods_v) {
                    data_goods = {
                        goods_id:tmp_goods_v,
                        goods_txt:tmp_goods_t,
                        items:new Array()
                    };
                    data_goods_group.items.push(data_goods);
                }
                data_goods = data_goods_group.items[data_goods_group.items.length-1];
                // [GROUP]顧客グループ
                if(!me.isEmpty(tmp_customer_group1_v)) {
                    tmp_customer_group_v = tmp_customer_group1_v;
                    tmp_customer_group_t = tmp_customer_group1_t;
                } else if(!me.isEmpty(tmp_customer_group2_v)) {
                    tmp_customer_group_v = tmp_customer_group2_v;
                    tmp_customer_group_t = tmp_customer_group2_t;
                } else {
                    return true;
                }
                if(data_goods.items.length == 0 ||
                    data_goods.items[data_goods.items.length-1].customer_group_id != tmp_customer_group_v) {
                    data_customer_group = {
                        customer_group_id: tmp_customer_group_v,
                        customer_group_txt: tmp_customer_group_t,
                        items: new Array()
                    };
                    data_goods.items.push(data_customer_group);
                }
                data_customer_group = data_goods.items[data_goods.items.length-1];
                // [GROUP]顧客
                if(data_customer_group.items.length == 0 ||
                    data_customer_group.items[data_customer_group.items.length-1].customer_id != tmp_customer_v) {
                    data_customer = {
                        customer_id: tmp_customer_v,
                        customer_txt: tmp_customer_t,
                        items: new Array(),
                        total: {
                            qut: 0,
                            amt: 0,
                            cost:0,
                            qut_pre: 0,
                            amt_pre: 0,
                            cost_pre:0,
                            items: {}
                        }
                    };
                    data_customer_group.items.push(data_customer);
                }
                data_customer = data_customer_group.items[data_customer_group.items.length-1];
                // [GROUP]納品先
                if(data_customer.items.length == 0 ||
                    data_customer.items[data_customer.items.length-1].delivery_id != tmp_delivery_v) {
                    data_delivery = {
                        delivery_id: tmp_delivery_v,
                        delivery_txt: tmp_delivery_t,
                        total: {
                            qut: 0,
                            amt: 0,
                            cost: 0,
                            qut_pre: 0,
                            amt_pre: 0,
                            cost_pre: 0,
                            items: {}
                        }
                    };
                    data_customer.items.push(data_delivery);
                }
                data_delivery = data_customer.items[data_customer.items.length-1];

                // [GROUP]年月、数量、金額など
                data_detail = {
                    key: tmp_trandate_v,
                    qut: tmp_qut_v,
                    amt: tmp_amt_v,
                    cost: tmp_cost_v
                };
                data_delivery.total.items[tmp_trandate_v] = data_detail;
                var num_qut = Number(data_detail.qut);
                var num_amt = Number(data_detail.amt);
                var num_cost = Number(data_detail.cost);
                var currentYear = condition_data.custpage_system_date.getFullYear().toString();
                if(currentYear == tmp_trandate_v.substr(0,4)) {
                    data_delivery.total.qut += num_qut;
                    data_delivery.total.amt += num_amt;
                    data_delivery.total.cost += num_cost;
                    data_customer.total.qut += num_qut;
                    data_customer.total.amt += num_amt;
                    data_customer.total.cost += num_cost;
                } else {
                    data_delivery.total.qut_pre += num_qut;
                    data_delivery.total.amt_pre += num_amt;
                    data_delivery.total.cost_pre += num_cost;
                    data_customer.total.qut_pre += num_qut;
                    data_customer.total.amt_pre += num_amt;
                    data_customer.total.cost_pre += num_cost;
                }
                if(data_customer.total.items[tmp_trandate_v] == undefined) {
                    data_customer.total.items[tmp_trandate_v] = {qut: 0};
                }
                data_customer.total.items[tmp_trandate_v].qut += num_qut;

                haveData = true;
                return true;
            });
            //データがなければ
            if(!haveData) {
                return result_data;
            }
            return result_data;
        }

        /**
         * 画面表示用HTML（EXCEL）、PDF出力用HTMLを作成する
         * @param condition_data
         * @param result_data
         * @returns {{}}
         */
        function createHtml(condition_data,result_data) {
            var search_result = {};
            search_result.isHaveData = false;
            search_result.titleHtml = '';
            search_result.dataHtml = '';
            search_result.pdfHtml = '';

            // データなし
            if(result_data.items.length == 0) {
                search_result.titleHtml += '<div style="margin-bottom:5px;font-weight:900;font-size:24px;">&nbsp;</div>';
                search_result.titleHtml += '<p style="color:#ff0000;">検索結果が見つかりませんでした。</p>';
                return search_result;
            }
            search_result.isHaveData = true;
            var allTdCount = getAllCellsCount(condition_data);

            //----------------HTML header line-------------------------------
            search_result.titleHtml += '<div style="margin-bottom:5px;font-weight:900;font-size:24px;">';
            search_result.titleHtml += '<table style="border:none;width:100%;" class="report">';
            search_result.titleHtml += '<tr style="height:50px;">';
            search_result.titleHtml += '<td align="left" style="width:450px;" nowrap="nowrap">';
            search_result.titleHtml += '<span style="color:#1E4877;display:inline-block;text-decoration:underline;font-weight:bold;font-size:15px;">' + condition_data.custpage_company_nm + '&nbsp;' + condition_data.custpage_period_title + '</span>';
            search_result.titleHtml += '</td>';

            if(condition_data.isSecret) {
                search_result.titleHtml += '<td align="center" colspan="' + (allTdCount-2) + '">';
                search_result.titleHtml +=  '<img src="' + getImgUrl() + '" height="50px"></img>';
                // search_result.titleHtml +=  '<img src="data:image/png;base64,' + fl.getContents() + '"></img>';
                search_result.titleHtml += '</td>';
            } else {
                for(var i=0;i<allTdCount-2;i++) {
                    search_result.titleHtml += '<td align="center"></td>';
                }
            }

            search_result.titleHtml += '<td align="right" style="width:250px;" nowrap="nowrap">';
            search_result.titleHtml += '<span style="display:none;color:#1E4877;" class="report_show">' + getSystemFormatYmdHms() + '</span>';
            search_result.titleHtml += '</td>';
            search_result.titleHtml += '</tr>';
            search_result.titleHtml += '</table>';
            search_result.titleHtml += '</div>';

            var sec_table = '<table style="border-collapse:collapse;width:100%;font-size:15px;font-weight:bold;border-spacing:0;" class="report">'
            search_result.dataHtml += sec_table;
            var pdf_page_info = {
                sec_table: sec_table,
                header:"",
                page_height:0
            };

            // セクション、営業、ブランド
            result_data.items.forEach(function (data_header) {
                //全てTR情報を作成します。
                var header = { html:"" };
                var detail = { html:"" };
                pdf_page_info.page_height = 0;

                createHtml_tr_header(header,condition_data,data_header);
                createHtml_tr_title(header,condition_data,data_header);
                search_result.dataHtml += header.html;
                pdf_page_info.header = header.html;

                // pdfの改ページング用TABLE作成（TRとして改ページできないため）
                createPdfNewPage(condition_data,search_result,pdf_page_info,false);

                // 商品グループ
                data_header.items.forEach(function (data_goods_group) {
                    createPdfNewPage(condition_data,search_result,pdf_page_info,false);
                    detail.html = "";
                    createHtml_tr_group_goods(detail,condition_data,data_goods_group);
                    search_result.dataHtml += detail.html;
                    search_result.pdfHtml += detail.html;

                    // 商品
                    data_goods_group.items.forEach(function (data_goods) {
                        createPdfNewPage(condition_data,search_result,pdf_page_info,false);
                        detail.html = "";
                        createHtml_tr_group_goods_item(detail,condition_data,data_goods);
                        search_result.dataHtml += detail.html;
                        search_result.pdfHtml += detail.html;

                        // 顧客グループ
                        data_goods.items.forEach(function (data_customer_group) {
                            createPdfNewPage(condition_data,search_result,pdf_page_info,false);
                            detail.html = "";
                            createHtml_tr_group_customer(detail,condition_data,data_customer_group);
                            search_result.dataHtml += detail.html;
                            search_result.pdfHtml += detail.html;

                            // 顧客
                            data_customer_group.items.forEach(function (data_customer) {
                                createPdfNewPage(condition_data,search_result,pdf_page_info,false);
                                detail.html = "";
                                createHtml_tr_group_customer_item(detail,condition_data,data_customer);
                                search_result.dataHtml += detail.html;
                                search_result.pdfHtml += detail.html;

                                // 納品先
                                data_customer.items.forEach(function (data_delivery) {
                                    createPdfNewPage(condition_data,search_result,pdf_page_info,true);
                                    detail.html = "";
                                    createHtml_tr_group_customer_item_each(detail,condition_data,data_delivery);
                                    search_result.dataHtml += detail.html;
                                    search_result.pdfHtml += detail.html;
                                });

                                createPdfNewPage(condition_data,search_result,pdf_page_info,true);
                                detail.html = "";
                                createHtml_tr_group_customer_item_each_total(detail,condition_data,data_customer);
                                search_result.dataHtml += detail.html;
                                search_result.pdfHtml += detail.html;
                            });
                        });
                    });
                });

                search_result.pdfHtml += '</table>';
            });

            search_result.dataHtml += '</table>';

            return search_result;

        }

        /**
         * PDF作成の時、改ページ必要か
         * TABLEとして改ページ（動的なヘッダ情報も出力）
         * @param condition_data
         * @param search_result
         * @param pdf_page_info
         * @param is_double_row
         */
        function createPdfNewPage(condition_data,search_result,pdf_page_info,is_double_row) {
            var header_height = condition_data.isProfit ? 70 : 60;
            var row_height = (is_double_row && condition_data.isShowLastYear) ? 30 : 20;
            var isNewPage = (pdf_page_info.page_height + row_height) > 600 ? true : false;
            //改ページの場合、TABLE追加
            if(pdf_page_info.page_height == 0 || isNewPage) {
                if(isNewPage) {
                    search_result.pdfHtml += "</table>";
                }
                search_result.pdfHtml += pdf_page_info.sec_table;
                search_result.pdfHtml += pdf_page_info.header;
                pdf_page_info.page_height = header_height;
            } else {
                pdf_page_info.page_height += row_height;
            }
        }

        /**
         * HTML作成：ブランド、営業担当者などヘッダ
         * @param detail
         * @param condition_data
         * @param data
         */
        function createHtml_tr_header(detail,condition_data,data) {

            detail.html += '<tr style="height:40px;border-bottom:1px solid gray;">';

            // データタイトル
            detail.html += '<td style="border:none;vertical-align:bottom;" colspan="15" class="blt">';
            detail.html += '<span style="display:inline-block;font-weight:bold;font-size:15px;">' + data.section_txt + '</span><br/>';
            detail.html += '<span style="display:inline-block;font-weight:bold;font-size:15px;">' + data.brand_txt + '</span>';
            detail.html += '</td>';

            var hint_title = "本年";
            if(condition_data.isShowLastYear) {
                hint_title = '上段&nbsp;本年<br/>下段&nbsp;前年';
            }
            // 数量
            if(condition_data.isQut) {
                detail.html += '<td style="color:#1E4877;border:none;width:85px;border-right:1px solid gray;vertical-align:bottom;" class="bt" nowrap="nowrap">';
                detail.html += hint_title;
                detail.html += "<br/>(単位:個)";
                detail.html += '</td>';
            }
            // 売上金額
            if(condition_data.isAmt) {
                detail.html += '<td style="color:#1E4877;border:none;width:105px;border-right:1px solid gray;vertical-align:bottom;" class="bt" nowrap="nowrap">';
                detail.html += hint_title;
                detail.html += "<br/>(単位:千円)";
                detail.html += '</td>';
            }
            // コスト
            if(condition_data.isProfit) {
                //　売上金額
                detail.html += '<td style="color:#1E4877;border:none;vertical-align:bottom;" class="bt" nowrap="nowrap">';
                detail.html += '(単位:千円)';
                detail.html += '</td>';
                // コスト
                detail.html += '<td style="border:none;" class="bt">';
                detail.html += '&nbsp;';
                detail.html += '</td>';
                // 粗利益 （金額）
                detail.html += '<td style="color:#1E4877;border:none;vertical-align:bottom;" class="bt" nowrap="nowrap">';
                detail.html += '(単位:千円)';
                detail.html += '</td>';
                // 粗利益 （％）
                detail.html += '<td style="color:#1E4877;border:none;width:85px;border-right:1px solid gray;vertical-align:bottom;" class="bt" nowrap="nowrap">';
                detail.html += hint_title;
                detail.html += '</td>';
            }
            detail.html += '</tr>';
        }

        /**
         * HTML作成：月タイトル
         * @param detail
         * @param condition_data
         * @param data
         */
        function createHtml_tr_title(detail,condition_data, data) {
            detail.html += '<tr style="border-bottom:2px solid gray;" class="bold_line_b">';

            // データタイトル
            detail.html += '<td style="border:1px solid gray;border-left:none;border-bottom:none;vertical-align:middle;" class="bl" colspan="3">';
            detail.html += '<span style="color:#1E4877;display:inline-block;font-weight:bold;font-size:15px;">' + data.sales_txt +'</span>';
            detail.html += '</td>';

            // 12ヵ月分のデータをループ
            for (var i = 0; i < condition_data.custpage_period_months.length; i++) {
                detail.html += '<td style="color:#1E4877;border:1px solid gray;border-left:none;border-bottom:none;width:60px;text-align:center;vertical-align:middle;" align="center">';
                detail.html += (condition_data.custpage_period_months[i] + 1) + '月';
                detail.html += '</td>';
            }

            // 数量
            if(condition_data.isQut) {
                detail.html += '<td style="color:#1E4877;border:1px solid gray;border-left:none;border-bottom:none;width:60px;text-align:center;vertical-align:middle;" align="center">';
                detail.html += '数量';
                detail.html += '</td>';
            }

            // 売上金額
            if(condition_data.isAmt || condition_data.isProfit) {
                detail.html += '<td style="color:#1E4877;border:1px solid gray;border-left:none;border-bottom:none;width:85px;text-align:center;vertical-align:middle;" align="center">';
                detail.html += '売上金額';
                detail.html += '</td>';
            }

            // コスト
            if(condition_data.isProfit) {
                detail.html += '<td style="color:#1E4877;border:1px solid gray;border-left:none;border-bottom:none;width:60px;text-align:center;vertical-align:middle;" align="center">';
                detail.html += 'コスト';
                detail.html += '</td>';

                // 粗利益 （金額）
                detail.html += '<td style="color:#1E4877;border:1px solid gray;border-left:none;border-bottom:none;width:85px;text-align:center;vertical-align:middle;" align="center">';
                detail.html += '粗利益<br/>(金額)';
                detail.html += '</td>';

                // 粗利益 （％）
                detail.html += '<td style="color:#1E4877;border:1px solid gray;border-left:none;border-bottom:none;width:60px;text-align:center;vertical-align:middle;" align="center">';
                detail.html += '粗利益<br/>(％)';
                detail.html += '</td>';
            }

            detail.html += '</tr>';
        }

        /**
         * HTML作成：商品グループ
         * @param detail
         * @param condition_data
         * @param data
         */
        function createHtml_tr_group_goods(detail,condition_data,data) {
            var allTdCount = getAllCellsCount(condition_data);

            detail.html += '<tr style="font-weight:normal;">';

            // データタイトル
            detail.html += '<td style="width:130px;border:1px solid gray;border-left:none;border-right:none;color:#1E4877;" class="bl" nowrap="nowrap">';
            detail.html += '<span style="display:inline-block;">Item Group:</span>';
            detail.html += '</td>';
            detail.html += '<td style="width:auto;border:1px solid gray;border-left:none;border-right:none;color:#1E4877;"  nowrap="nowrap">';
            detail.html += '<span style="display:inline-block;"><b>' + data.goods_group_id + '</b></span>';
            detail.html += '</td>';
            detail.html += '<td style="border:1px solid gray;border-left:none;border-right:1px solid gray;color:#1E4877;" colspan="' + (allTdCount-2) + '">';
            detail.html += '<span style="display:inline-block;"><b>' + data.goods_group_txt +'</b></span>';
            detail.html += '</td>';

            detail.html += '</tr>';
        }

        /**
         * HTML作成：商品
         * @param detail
         * @param condition_data
         * @param data
         */
        function createHtml_tr_group_goods_item(detail,condition_data,data) {
            var allTdCount = getAllCellsCount(condition_data);

            detail.html += '<tr style="font-weight:normal;">';

            // データタイトル
            detail.html += '<td style="width:130px;border:1px solid gray;border-top:none;border-left:none;border-right:none;color:#1E4877;" class="bl" nowrap="nowrap">';
            detail.html += '<span style="display:inline-block;">Item:</span>';
            detail.html += '</td>';
            detail.html += '<td style="width:auto;border:1px solid gray;border-top:none;border-left:none;border-right:none;color:#1E4877;" nowrap="nowrap" class="large_cell">';
            detail.html += '<span style="display:inline-block;"><b>' + data.goods_id + '</b></span>';
            detail.html += '</td>';
            detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;border-right:1px solid gray;color:#1E4877;" colspan="' + (allTdCount-2) + '">';
            detail.html += '<span style="display:inline-block;"><b>' + data.goods_txt +'</b></span>';
            detail.html += '</td>';

            detail.html += '</tr>';
        }

        /**
         * HTML作成：顧客グループ
         * @param detail
         * @param condition_data
         * @param data
         */
        function createHtml_tr_group_customer(detail,condition_data,data) {
            var allTdCount = getAllCellsCount(condition_data);

            detail.html += '<tr style="font-weight:normal;">';

            // データタイトル
            detail.html += '<td style="width:130px;border:1px solid gray;border-top:none;border-left:none;border-right:none;color:#1E4877;" class="bl" nowrap="nowrap">';
            detail.html += '<span style="display:inline-block;">Customer Group:</span>';
            detail.html += '</td>';
            detail.html += '<td style="width:auto;border:1px solid gray;border-top:none;border-left:none;border-right:none;color:#1E4877;"  nowrap="nowrap">';
            detail.html += '<span style="display:inline-block;"><b>' + data.customer_group_id + '</b></span>';
            detail.html += '</td>';
            detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;border-right:1px solid gray;color:#1E4877;" colspan="' + (allTdCount-2) + '">';
            detail.html += '<span style="display:inline-block;"><b>' + data.customer_group_txt + '</b></span>';
            detail.html += '</td>';

            detail.html += '</tr>';
        }

        /**
         * HTML作成：顧客
         * @param detail
         * @param condition_data
         * @param data
         */
        function createHtml_tr_group_customer_item(detail,condition_data,data) {
            var allTdCount = getAllCellsCount(condition_data);

            detail.html += '<tr style="font-weight:normal;">';

            // データタイトル
            detail.html += '<td style="width:130px;border:1px solid gray;border-top:none;border-left:none;border-right:none;color:#1E4877;" class="bl" nowrap="nowrap">';
            detail.html += '<span style="display:inline-block;">Customer:</span>&nbsp;';
            detail.html += '</td>';
            detail.html += '<td style="width:auto;border:1px solid gray;border-top:none;border-left:none;border-right:none;color:#1E4877;" nowrap="nowrap">';
            detail.html += '<span style="display:inline-block;"><b>' + data.customer_id + '</b></span>';
            detail.html += '</td>';
            detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;border-right:1px solid gray;color:#1E4877;" colspan="' + (allTdCount-2) + '">';
            detail.html += '<span style="display:inline-block;"><b>' + data.customer_txt + '</b></span>';
            detail.html += '</td>';

            detail.html += '</tr>';
        }

        /**
         * HTML作成：納品先
         * @param detail
         * @param condition_data
         * @param data
         */
        function createHtml_tr_group_customer_item_each(detail,condition_data,data_delivery) {
            detail.html += '<tr style="font-weight:normal;">';

            // データタイトル
            detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;width:300px" colspan="3" class="bl" nowrap="nowrap">';
            detail.html += '' + data_delivery.delivery_id + '&nbsp;' + data_delivery.delivery_txt + '';
            detail.html += '</td>';

            // 12ヵ月分のデータをループ
            var  currentYear = condition_data.custpage_system_date.getFullYear();
            var lastYear = currentYear -1;
            for (var i = 0; i < condition_data.custpage_period_months.length; i++) {
                var month = (i+1) < 10 ? ("0" + (i+1)) :  (i+1).toString();
                var showVal = "";

                //本年
                var dataKey = "" + currentYear + month;
                var eachData = data_delivery.total.items[dataKey];
                if(eachData !== undefined) {
                    showVal += "" + formatNumber(eachData.qut, false);
                } else {
                    showVal += "　";
                }
                if(condition_data.isShowLastYear) {
                    showVal += "<br/>";
                    dataKey = "" + lastYear + month;
                    eachData = data_delivery.total.items[dataKey];
                    if(eachData !== undefined) {
                        showVal += '<span style="color:#ff0000;">' + formatNumber(eachData.qut, false) + "</span>";
                    } else {
                        showVal += "　";
                    }
                }
                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal;
                detail.html += '</td>';
            }

            // 数量
            if(condition_data.isQut) {
                var showVal_qut_total = formatNumber(data_delivery.total.qut, false);
                if(condition_data.isShowLastYear) {
                    showVal_qut_total += "<br/><span style=\"color:#ff0000;\">" + formatNumber(data_delivery.total.qut_pre, false) + "</span>";
                }
                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal_qut_total;
                detail.html += '</td>';
            }

            // 売上金額
            if(condition_data.isAmt || condition_data.isProfit) {
                var showVal_amt_total = getSecretDataShow(condition_data,formatNumber(data_delivery.total.amt, true));
                if(condition_data.isShowLastYear) {
                    showVal_amt_total += "<br/><span style=\"color:#ff0000;\">" + getSecretDataShow(condition_data,formatNumber(data_delivery.total.amt_pre, true)) + "</span>";
                }

                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal_amt_total;
                detail.html += '</td>';
            }

            // コスト
            if(condition_data.isProfit) {
                var showVal_cost1_total = getSecretDataShow(condition_data,formatNumber(data_delivery.total.cost,true));
                var showVal_cost2_total = getSecretDataShow(condition_data,formatNumber(data_delivery.total.amt - data_delivery.total.cost,true));
                var showVal_cost3_total = getSecretDataShow(condition_data,calPercent(data_delivery.total.amt,data_delivery.total.cost));

                if(condition_data.isShowLastYear) {
                    showVal_cost1_total += "<br/><span style=\"color:#ff0000;\">" + getSecretDataShow(condition_data,formatNumber(data_delivery.total.cost_pre,true)) + "</span>";
                    showVal_cost2_total += "<br/><span style=\"color:#ff0000;\">" + getSecretDataShow(condition_data,formatNumber((data_delivery.total.amt_pre - data_delivery.total.cost_pre), true)) + "</span>";
                    showVal_cost3_total += "<br/><span style=\"color:#ff0000;\">" + getSecretDataShow(condition_data,calPercent(data_delivery.total.amt_pre,data_delivery.total.cost_pre)) + "</span>";
                }

                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal_cost1_total;
                detail.html += '</td>';
                // 粗利益 （金額）
                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal_cost2_total;
                detail.html += '</td>';

                // 粗利益 （％）
                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal_cost3_total;
                detail.html += '</td>';
            }
            detail.html += '</tr>';
        }

        /**
         * HTML作成：総数
         * @param detail
         * @param condition_data
         * @param data
         */
        function createHtml_tr_group_customer_item_each_total(detail,condition_data,data_customer) {
            detail.html += '<tr style="font-weight:normal;border-bottom:2px solid gray;" class="bold_line_b">';

            // データタイトル
            detail.html += '<td style="width:130px;border:1px solid gray;border-top:none;border-left:none;border-right:none;color:#1E4877;vertical-align:middle;" class="bl" nowrap="nowrap">';
            detail.html += 'Total:';
            detail.html += '</td>';
            detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;border-right:none;color:#1E4877;vertical-align:middle;" class="large_cell">';
            detail.html += '<b>' + data_customer.customer_id + '</b>';
            detail.html += '</td>';
            detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;color:#1E4877;vertical-align:middle;" >';
            detail.html += '　';
            detail.html += '</td>';

            // 12ヵ月分のデータをループ
            var  currentYear = condition_data.custpage_system_date.getFullYear();
            var lastYear = currentYear -1;
            for (var i = 0; i < condition_data.custpage_period_months.length; i++) {
                var month = (i+1) < 10 ? ("0" + (i+1)) :  (i+1).toString();
                var showVal = "";

                //本年
                var dataKey = "" + currentYear + month;
                var eachData = data_customer.total.items[dataKey];
                if(eachData !== undefined) {
                    showVal += "" + formatNumber(eachData.qut, false);
                } else {
                    showVal += "　";
                }
                if(condition_data.isShowLastYear) {
                    showVal += "<br/>";
                    dataKey = "" + lastYear + month;
                    eachData = data_customer.total.items[dataKey];
                    if(eachData !== undefined) {
                        showVal += "<span style=\"color:#ff0000;\">" + formatNumber(eachData.qut, false) + "</span>";
                    } else {
                        showVal += "　";
                    }
                }

                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal;
                detail.html += '</td>';
            }

            // 数量
            if(condition_data.isQut) {
                var showVal_qut_total = formatNumber(data_customer.total.qut, false);
                if(condition_data.isShowLastYear) {
                    showVal_qut_total += "<br/><span style=\"color:#ff0000;\">" + formatNumber(data_customer.total.qut_pre, false) + "</span>";
                }

                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal_qut_total;
                detail.html += '</td>';
            }

            // 売上金額
            if(condition_data.isAmt || condition_data.isProfit) {
                var showVal_amt_total = getSecretDataShow(condition_data,formatNumber(data_customer.total.amt,true));
                if(condition_data.isShowLastYear) {
                    showVal_amt_total += "<br/><span style=\"color:#ff0000;\">" + getSecretDataShow(condition_data,formatNumber(data_customer.total.amt_pre,true)) + "</span>";
                }

                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal_amt_total;
                detail.html += '</td>';
            }

            // コスト
            if(condition_data.isProfit) {
                var showVal_cost1_total = getSecretDataShow(condition_data,formatNumber(data_customer.total.cost,true));
                var showVal_cost2_total = getSecretDataShow(condition_data,formatNumber(data_customer.total.amt - data_customer.total.cost,true));
                var showVal_cost3_total = getSecretDataShow(condition_data,calPercent(data_customer.total.amt,data_customer.total.cost));

                if(condition_data.isShowLastYear) {
                    showVal_cost1_total += "<br/><span style=\"color:#ff0000;\">" + getSecretDataShow(condition_data,formatNumber(data_customer.total.cost_pre,true)) + "</span>";
                    showVal_cost2_total += "<br/><span style=\"color:#ff0000;\">" + getSecretDataShow(condition_data,formatNumber((data_customer.total.amt_pre - data_customer.total.cost_pre),true)) + "</span>";
                    showVal_cost3_total += "<br/><span style=\"color:#ff0000;\">" + getSecretDataShow(condition_data,calPercent(data_customer.total.amt_pre,data_customer.total.cost_pre)) + "</span>";
                }

                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal_cost1_total;
                detail.html += '</td>';
                // 粗利益 （金額）
                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal_cost2_total;
                detail.html += '</td>';
                // 粗利益 （％）
                detail.html += '<td style="border:1px solid gray;border-top:none;border-left:none;text-align:right;" align="right">';
                detail.html += showVal_cost3_total;
                detail.html += '</td>';
            }

            detail.html += '</tr>';
        }

        /**
         * テーブルの列数の取得
         * @param condition_data
         * @returns {number}
         */
        function getAllCellsCount(condition_data) {
            var cellsCount = 3;

            cellsCount += condition_data.custpage_period_months.length;
            cellsCount += 1;

            if(condition_data.isProfit) {
                cellsCount += 3;
            }
            return cellsCount;
        }

        /**
         * 「社外秘」イメージのURLの取得
         * @returns {string}
         */
        function getImgUrl() {
            var fl = file.load({
                id: IMG_SERECT_ID
            });
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });

            return scheme + host + fl.url;
        }

        /**
         * 連結会社名称の取得
         * @param condition_data
         * @returns {string}
         */
        function getSubsidiary(condition_data) {
            var subsidiary_nm = "";
            var subsidiarySearchObj = search.create({
                type: "subsidiary",
                filters:
                    [
                        ["internalid","is",condition_data.custpage_company]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            label: "表示ID"
                        }),
                        search.createColumn({
                            name: "name",
                            label: "表示名前",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            subsidiarySearchObj.run().each(function(result){
                subsidiary_nm = result.getValue('name');
                return true;
            });

            return subsidiary_nm;
        }

        /**
         * エクセルファイルのダウンロードURLを作成
         * @param {*} detail_data
         * @returns Excel file ダウンロードURL
         */
        function createExcelURL(detail_data) {
            var xmlString = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            xmlString += '<meta http-equiv="Content-Type" charset=utf-8">';
            xmlString += '<head>';
            xmlString += '<!--[if gte mso 9]>';
            xmlString += '<![endif]-->';
            xmlString += '<style type="text/css">';
            xmlString += ' table.report { font-family:"HG丸ｺﾞｼｯｸM-PRO";font-size:11pt; }';
            xmlString += ' td.bl { border-left:1px solid gray !important; }';
            xmlString += ' td.bt { border-top:1px solid gray !important; }';
            xmlString += ' td.blt { border-left:1px solid gray !important; border-top:1px solid gray !important; }';
            xmlString += ' .show { display:inline-block; }';
            xmlString += '</style>';
            xmlString += '</head>';
            xmlString += '<xml>';
            xmlString += '    <x:ExcelWorkbook>';
            xmlString += '        <x:ExcelWorksheets>';
            xmlString += '            <x:ExcelWorksheet>';
            xmlString += '                <x:Name>セールスレポート</x:Name>';
            xmlString += '                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>';
            xmlString += '            </x:ExcelWorksheet>';
            xmlString += '        </x:ExcelWorksheets>';
            xmlString += '    </x:ExcelWorkbook>';
            xmlString += '</xml>';
            xmlString += '<body>';
            xmlString += detail_data.titleHtml;
            xmlString += detail_data.dataHtml;
            xmlString += '</body>';
            xmlString += '</html>';

            var file_name = 'セールスレポート' + '_' + getFormatYmdHms() + '.xls';
            var file_context = encode.convert({
                string: xmlString,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });

            // create file
            var fileObj = file.create({
                name : file_name,
                fileType : 'EXCEL',
                contents : file_context
            });
            fileObj.folder = SAVE_FOLDER_ID;
            fileObj.encoding = file.Encoding.BASE_64;
            var fileId = fileObj.save();

            // fileをロード
            var fl = file.load({
                id: fileId
            });

            return fl.url;
        }

        /**
         * PDFファイルのダウンロードURLを作成
         * @param {*} detail_data
         * @returns Pdf file ダウンロードURL
         */
        function createPdfURL(detail_data) {
            var xmlString = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
            xmlString += '<pdf>';
            xmlString += '<head>';
            xmlString += '  <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />';
            xmlString += '  <#if .locale == "zh_CN">';
            xmlString += '    <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />';
            xmlString += '  <#elseif .locale == "zh_TW">';
            xmlString += '    <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />';
            xmlString += '  <#elseif .locale == "ja_JP">';
            xmlString += '    <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />';
            xmlString += '  <#elseif .locale == "ko_KR">';
            xmlString += '    <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />';
            xmlString += '  <#elseif .locale == "th_TH">';
            xmlString += '    <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />';
            xmlString += '  </#if>';
            xmlString += '    <macrolist>';
            xmlString += '        <macro id="nlheader">';
            xmlString += detail_data.titleHtml.replace(/&nbsp;/g,' ').replace(/&/g,'&amp;');
            xmlString += '        </macro>';
            xmlString += '        <macro id="nlfooter">';
            xmlString += '            <table>';
            xmlString += '              <tr><td align="right" style="color:#1E4877;"><pagenumber/> ／ <totalpages/></td></tr>';
            xmlString += '          </table>';
            xmlString += '        </macro>';
            xmlString += '    </macrolist>';
            xmlString += '<style type="text/css">* {';
            xmlString += '    <#if .locale == "zh_CN">';
            xmlString += '      font-family: NotoSans, NotoSansCJKsc, sans-serif;';
            xmlString += '    <#elseif .locale == "zh_TW">';
            xmlString += '      font-family: NotoSans, NotoSansCJKtc, sans-serif;';
            xmlString += '    <#elseif .locale == "ja_JP">';
            xmlString += '      font-family: NotoSans, NotoSansCJKjp, sans-serif;';
            xmlString += '    <#elseif .locale == "ko_KR">';
            xmlString += '      font-family: NotoSans, NotoSansCJKkr, sans-serif;';
            xmlString += '    <#elseif .locale == "th_TH">';
            xmlString += '      font-family: NotoSans, NotoSansThai, sans-serif;';
            xmlString += '    <#else>';
            xmlString += '      font-family: NotoSans, sans-serif;';
            xmlString += '    </#if>';
            xmlString += '    }';
            xmlString += ' table { font-size: 7pt; table-layout: automatic; width: 100%;border-color:#8CAAC8 !important; }';
            xmlString += ' tr { border-color:#8CAAC8 !important; }';
            xmlString += ' td { padding: 4px 4px;font-size: 7pt;border-color:#8CAAC8 !important; }';
            xmlString += ' td.bl { border-left:1px solid #8CAAC8 !important; }';
            xmlString += ' td.bt { border-top:1px solid #8CAAC8 !important; }';
            xmlString += ' td.blt { border-left:1px solid #8CAAC8 !important;border-top:1px solid #8CAAC8 !important; }';
            xmlString += ' .report_show { display:inline-block; }';
            xmlString += ' .report { page-break-after:always; }';
            xmlString += ' tr.bold_line_b, tr.bold_line_b td { border-bottom-color:#0A143C !important; }';
            xmlString += ' td.large_cell { width:170px !important; }';
            xmlString += '</style>';
            xmlString += '</head>';
            xmlString += '<body header="nlheader"  header-height="50pt" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">';
            xmlString += detail_data.pdfHtml.replace(/&nbsp;/g,' ').replace(/&/g,'&amp;');
            xmlString += '</body>';
            xmlString += '</pdf>';

            var file_name = 'セールスレポート' + '_' + getFormatYmdHms() + '.pdf';
            var myFile = render.create();
            myFile.templateContent = xmlString;
            var pdfFile = myFile.renderAsPdf();
            pdfFile.name = file_name;
            pdfFile.folder = SAVE_FOLDER_ID;
            var fileId = pdfFile.save();

            // fileをロード
            var fl = file.load({
                id: fileId
            });

            return fl.url;
        }

        /**
         * REQUESTからパラメータ値の取得
         * 空など判断
         * @param para
         * @returns {string|*}
         */
        function getParamValue(para) {
            if(!me.isEmpty(para)) {
                return para;
            }
            return "";
        }

        /**
         * コードが空の場合、名称も空
         * @param data_v
         * @param data_t
         * @returns {string|*}
         */
        function getEmptyData(data_v, data_t) {
            if(me.isEmpty(data_v)) {
                return "";
            }
            return data_t;
        }

        /**
         * 「社外秘」の場合、ある値は空白として表示
         * 元：「＊」
         * @param condition_data
         * @param data_val
         * @returns {string|*}
         */
        function getSecretDataShow(condition_data,data_val) {
            if(me.isEmpty(data_val)) {
                return " ";
            }
            if(condition_data.isSecret) {
                return data_val;
            } else {
                return "&nbsp;";
            }
        }

        /**
         * 率の計算
         * @param amt
         * @param cost
         * @returns {string}
         */
        function calPercent(amt, cost) {
            var amt_val = Number(amt);
            var cost_val = Number(cost);
            var diff_val = amt_val - cost_val;
            if(amt_val == 0) {
                return "0%";
            }

            var calRadio = '0.00';
            calRadio = (diff_val / amt_val * 1.0) * 100.0;
            calRadio = calRadio.toFixed(0);
            return calRadio + "%";
        }

        /**
         * システム日付の取得
         * 帳票の「システム日付」
         * @param data_date
         * @returns {string}
         */
        function getDateStr(data_date) {
            var year = data_date.getFullYear();
            var month = data_date.getMonth()+1;
            var day = data_date.getDate();
            return "" + year + "/" + month + "/" + day;
        }

        /**
         * 検索条件の配列の作成
         * 例：A　AND　B、A　OR　B
         * @param arr_data
         * @param filter_id
         * @param filter_op
         * @param filter_rel
         * @returns {[]}
         */
        function getArrFilters(arr_data, filter_id, filter_op, filter_rel) {
            var arrFilters = [];
            if(arr_data.length > 0) {
                for (var i = 0; i < arr_data.length; i++) {
                    if("ALL" == arr_data[i]) {
                        return [];
                    }
                    if(!me.isEmpty(arr_data[i])) {
                        arrFilters.push([filter_id, filter_op, arr_data[i]]);
                        arrFilters.push(filter_rel);
                    }
                }
            }
            if (arrFilters.length > 0) {
                arrFilters.splice(arrFilters.length - 1, 1);
            }

            return arrFilters;
        }

        /**
         * .addSelectOption('ALL', '-すべて-');
         * @param selectObj
         */
        function addSelectAllOption(selectObj, selectValArr) {
            var isSelected = (selectValArr.indexOf('ALL') >= 0);
            if(selectValArr.length === 0 ||
                (selectValArr.length === 1 && me.isEmpty(selectValArr[0]))) {
                isSelected = true;
            }
            selectObj.addSelectOption({
                value: 'ALL',
                text: '-すべて-',
                isSelected: isSelected
            });
        }

        /**
         * 数字はコンマで区切り
         * @param num_val
         * @param isThou
         * @returns {string}
         */
        function formatNumber(num_val, isThou) {
            var num_arr = num_val.toString().split('.');
            var num_integer_str = num_arr[0];
            if(isThou) {
                var num_integer = Number(num_integer_str) / 1000;
                num_integer_str = num_integer.toFixed(0).toString();
            }
            var re=/(?=(?!(\b))(\d{3})+$)/g;
            var num_val = num_integer_str.replace(re,",");

            // 少数不要
            // if(num_arr.length > 1) {
            //     num_val += '.' + num_arr[1];
            // }
            return num_val;
        }

        /**
         * 画面項目は非活性に設定
         * @param item
         * @param isSearched
         */
        function setDisabled(item, isSearched) {
            if(isSearched) {
                item.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
            }
        }

        /**
         * システム日付と時間をフォーマットで取得
         */
        function getFormatYmdHms() {

            // システム時間
            var now = new Date();
            var offSet = now.getTimezoneOffset();
            var offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);

            var str = now.getFullYear().toString();
            str += pad(now.getMonth() + 1);
            str += pad(now.getDate()) + "_";
            str += pad(now.getHours());
            str += pad(now.getMinutes());
            str += pad(now.getSeconds());
            str += now.getMilliseconds();

            return str;
        }

        /**
         * システム日付と時間をフォーマットで取得
         */
        function getSystemFormatYmdHms() {

            // システム時間
            var now = new Date();
            var offSet = now.getTimezoneOffset();
            var offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);

            var str = now.getFullYear().toString();
            str += "/" + pad(now.getMonth() + 1);
            str += "/" + pad(now.getDate()) + " ";
            str += pad(now.getHours());
            str += ":" + pad(now.getMinutes());
            str += ":" + pad(now.getSeconds());

            return str;
        }

        /**
         * 10位内の数字場合、前に「0」補足
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

        return {
            onRequest: onRequest
        };

    });