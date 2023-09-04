/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format', 'N/task', 'N/log'], function (search, format, task, log) {

    function doGet(requestBody) {
        log.audit({
            title: 'doGet - start',
            details: JSON.stringify(new Date())
        });
        log.audit({
            title: 'doget - requestBody',
            details: JSON.stringify(requestBody)
        });

        var result = {};
        if (!requestBody.hasOwnProperty('processName')) {
            result.status = '9';
            result.message = 'processNameの指定がありません。';
            return result;
        }

        result.pro_id = requestBody.processName;

        try {
            switch (requestBody.processName.toString()) {
                case 'FINET_INVOICE':
                    // FINET連携_請求
                    result.data = getFinetInvoiceJSON();
                    break;
                case 'FINET_SHIPPING_INFORMATION':
                    // FINET連携_出荷案内
                    result.data = getFinetShippingJSON();
                    break;
            }
            if (result.hasOwnProperty('data')) {
                result.total = result.data.length;
            }
            result.status = "1";
            result.message = "OK";

        } catch (e) {
            result.status = "9";
            result.message = e;
        }
        log.audit({
            title: 'doGet - end',
            details: JSON.stringify(new Date())
        });
        return result;
    }
    /**
     * Function called upon sending a POST request to the RESTlet.
     * 
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request
     * Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be
     * a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request
     * Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {
        log.audit({
            title: 'doPost - start',
            details: JSON.stringify(new Date())
        });
        log.audit({ title: 'doPost - requestBody', details: JSON.stringify(requestBody) });
        var result = {
            status: '',
            message: ''
        };

        if (!requestBody.hasOwnProperty('processName')) {
            result = {
                status: 'failed',
                message: 'processNameが含まれていません。'
            };
            return result;
        }

        switch (requestBody.processName.toString()) {
            case 'FINET_INVOICE':
                // FINET連携_請求
                result.data = getFinetInvoiceJSON();
                break;
            case 'FINET_SHIPPING_INFORMATION':
                // FINET連携_出荷案内
                result.data = getFinetShippingJSON();
                break;
        }

        log.audit({
            title: 'doPost - end',
            details: JSON.stringify(new Date())
        });
        return result;
    }

    return {
        get: doGet,
        post: doPost
    };

    /**
     * FINET連携_出荷案内データ取得
     * @returns {Array} 結果請求データ
     */
    function getFinetShippingJSON() {
        log.audit({
            title: 'getFinetShippingJSON - start',
            details: JSON.stringify(new Date())
        });
        /**
         * FINET_請求データ
         * @type {Array}
         */
        var arrResults = [];
    
        /**
         * 更新対象トランザクション内部ID
         * @typedef {object} objTransactionIds
         * @param {Array} objTransactionIds.salesOrderIds 更新対象注文書ID配列
         * @param {Array} objTransactionIds.invoiceIds 更新対象請求書ID配列
         * @param {Array} objTransactionIds.creditMemoIds 更新対象クレジットメモID配列
         */
        let objTransactionIds = {
            salesOrderIds: [],
            invoiceIds: [],
            creditMemoIds: []
        };
    
        /**
         * システム日時（日本時間）
         * @type {Date}
         */
        const systemDateTime = getJapanDateTime();
        /**
         * システム日付（日本時間）YYYYMMDD
         * @type {string}
         */
        const strSystemDate = systemDateTime.getFullYear() + ('00' + (systemDateTime.getMonth() + 1)).slice(-2) + ('00' + systemDateTime.getDate()).slice(-2);
        /**
         * システム時間（日本時間）HHmmSS
         * @type {string}
         */
        const strSystemTime = ('00' + systemDateTime.getHours()).slice(-2) + ('00' + systemDateTime.getMinutes()).slice(-2) + ('00' + systemDateTime.getSeconds()).slice(-2);
    
        /**
         * 場所マスタ情報
         * @type {object} objLocationInfo
         * @param {string} objLocationInfo.key 場所.内部ID
         * @param {object} objLocationInfo.value 場所情報
         * @param {string} objLocationInfo.value.externalId 場所.外部ID
         */
        const objLocationInfo = getLocationInfo();
    
        /**
         * 出荷案内データ（通常出荷）
         * @type {object}
         */
        var datas = getFinetShippingNormalDatas();
        /**
         * 出荷案内データ（赤伝）
         * @type {object}
         */
        var objRedData = getFinetShippingRedDatas();
        /**
         * 出荷案内データ（黒伝）
         * @type {object}
         */
        var objBlackData = getFinetShippingBlackDatas();
    
        var finetItemCodeMapping = getFinetItemCodeMapping(true);
        var unitCodeByItem = getUnitCodeByItem();
    
        var commonTypeCodeById = getCommonTypeCodeById();
    
        // 1.19 ファイルヘッダーレコード.送信データ件数
        let numFileHeaderRecordSendDataCount = 0;
        // 8.3 エンドレコード.レコード件数
        let numEndRecordRecordCount = 0;
        // 8.4 エンドレコード.生版金額合計
        let amountEndRecordRawVersionTotal = 0;
        // 8.5 エンドレコード.割戻金額合計
        let amountEndRecordRebateTotal = 0;
        // 8.6 エンドレコード.回収容器金額合計
        let amountEndRecordRecoverContainerTotal = 0;
        // データシリアル番号
        let numDataSerialNumber = 1;

        let objAllDatasByDestinationCode = groupOriginDatas(datas, objRedData, objBlackData);
    
        /** 赤伝票処理用マスタ情報取得 start */
        
        /**
         * クレジットメモ作成元ID（二階層）
         * クレジットメモ.作成元（請求書）.作成元（注文書）
         * クレジットメモ.作成元（返品）.作成元（請求書）
         * @type {Array}
         */
        let arrRedTwoLayersCreatedFromIds = [];

        /** 赤伝票データ.作成元.作成元内部IDを取得し整理する */
        Object.keys(objAllDatasByDestinationCode).forEach(function(finalDestinationCode) {
            let objCurrentCodeRedData = objAllDatasByDestinationCode[finalDestinationCode.toString()]['red'];
            
            Object.keys(objCurrentCodeRedData).forEach(function(creditMemoId) {
                if (objCurrentCodeRedData[creditMemoId].length > 0) {
                    var tmpCreateFromInvoiceId = objCurrentCodeRedData[creditMemoId][0].getValue({ name: 'createdfrom', join: 'createdfrom' });
                    if (arrRedTwoLayersCreatedFromIds.indexOf(tmpCreateFromInvoiceId.toString()) < 0 && tmpCreateFromInvoiceId) {
                        arrRedTwoLayersCreatedFromIds.push(tmpCreateFromInvoiceId.toString());
                    }
                }
            });
        });

        /**
         * クレジットメモ作成元情報（二階層）
         * クレジットメモ.作成元（請求書）.作成元（注文書）.xxx
         * クレジットメモ.作成元（返品）.作成元（請求書）.xxx
         * @type {object}
         */
        let objRedTwoLayersCreatedFromInfos = {};

        if (arrRedTwoLayersCreatedFromIds.length > 0) {
            let arrRedTwoLayersCreatedFromFilters = [];
            let arrRedTwoLayersCreatedFromIdFilters = [];
            arrRedTwoLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrRedTwoLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrRedTwoLayersCreatedFromIds.length - 1) {
                    arrRedTwoLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrRedTwoLayersCreatedFromFilters.push(arrRedTwoLayersCreatedFromIdFilters);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);

            let arrRedTwoLayersCreatedFromColumns = [];
            /** DJ_注文方法区分.DJ_区分コード */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'}));
            /** トランザクション番号 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'transactionnumber'}));
            /** DJ_注文方法区分 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp'}));
            /** 作成元.DJ_注文方法区分 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}));
            /** DJ_先方発注番号 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno'}));
            /** 作成元注文書.DJ_先方発注番号 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}));
            /** 作成元 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom'}));
            /** DJ_FINETカナ社名・店名・取引先名 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername'}));
            /** DJ_FINETカナ社名・店名・取引先名_option2 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2'}));
            /** DJ_FINETカナ社名・店名・取引先名_option3 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3'}));
            /** DJ_FINETカナ社名・店名・取引先名_option4 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4'}));
            /** DJ_FINETカナ社名・店名・取引先名_option5 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5'}));
            /** 作成元.DJ_FINETカナ社名・店名・取引先名 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}));
            /** 作成元.DJ_FINETカナ社名・店名・取引先名_option2 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}));
            /** 作成元.DJ_FINETカナ社名・店名・取引先名_option3 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}));
            /** 作成元.DJ_FINETカナ社名・店名・取引先名_option4 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}));
            /** 作成元.DJ_FINETカナ社名・店名・取引先名_option5 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}));
            // DJ_FINETカナ住所
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanacustomeraddress'});
            // DJ_FINETカナ住所_option2
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option2'});
            // DJ_FINETカナ住所_option3
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option3'});
            // DJ_FINETカナ住所_option4
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option4'});
            // DJ_FINETカナ住所_option5
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option5'});
            // 作成元.DJ_FINETカナ住所
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'});
            // 作成元.DJ_FINETカナ住所_option2
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'});
            // 作成元.DJ_FINETカナ住所_option3
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'});
            // 作成元.DJ_FINETカナ住所_option4
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'});
            // 作成元.DJ_FINETカナ住所_option5
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'});
            
            let arrRedTwoLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrRedTwoLayersCreatedFromFilters, arrRedTwoLayersCreatedFromColumns);

            arrRedTwoLayersCreatedFromResults.forEach(function(tmpResult) {
                
                objRedTwoLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    createdFrom: tmpResult.getValue({name: 'createdfrom'}),
                    // DJ_注文方法区分.区分コード
                    orderMethodTypeCode: tmpResult.getValue({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'}),
                    // DJ_注文方法区分
                    orderMethodType: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp'}),
                    // トランザクション番号
                    transactionNumber: tmpResult.getValue({name: 'transactionnumber'}),
                    // 作成元.注文方法
                    createdFromOrderMethodType: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}),
                    // DJ_先方発注番号
                    customerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno'}),
                    // 作成元注文書.DJ_先方発注番号
                    createdFromCustomerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername'}),
                    // DJ_FINETカナ社名・店名・取引先名_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2'}),
                    // DJ_FINETカナ社名・店名・取引先名_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3'}),
                    // DJ_FINETカナ社名・店名・取引先名_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4'}),
                    // DJ_FINETカナ社名・店名・取引先名_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5'}),
                    // 作成元.DJ_FINETカナ社名・店名・取引先名
                    createdFromCustomerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ社名・店名・取引先名_option2
                    createdFromCustomerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ社名・店名・取引先名_option3
                    createdFromCustomerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ社名・店名・取引先名_option4
                    createdFromCustomerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ社名・店名・取引先名_option5
                    createdFromCustomerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}),
                    // DJ_FINETカナ住所
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress'}),
                    // DJ_FINETカナ住所_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2'}),
                    // DJ_FINETカナ住所_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3'}),
                    // DJ_FINETカナ住所_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4'}),
                    // DJ_FINETカナ住所_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5'}),
                    // 作成元.DJ_FINETカナ住所
                    createdFromAddress1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ住所_option2
                    createdFromAddress2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ住所_option3
                    createdFromAddress3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ住所_option4
                    createdFromAddress4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ住所_option5
                    createdFromAddress5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'})
                };
            });
        }

        /** 赤伝票処理用マスタ情報取得 end */
    
        /** 黒伝票処理用マスタ情報取得 start */
    
        /**
         * 請求書作成元ID（二階層）
         * 請求書.DJ_クレジットメモ.作成元（請求書）
         * 請求書.DJ_クレジットメモ.作成元（返品）
         * @type {Array}
         */
        let arrBlackTwoLayersCreatedFromIds = [];

        Object.keys(objAllDatasByDestinationCode).map(function (tmpDestinationCode) {
            Object.keys(objAllDatasByDestinationCode[tmpDestinationCode]['black']).map(function (tmpBlackInvoiceId) {
                let tmpBlackCreatedFromId = objAllDatasByDestinationCode[tmpDestinationCode]['black'][tmpBlackInvoiceId][0].getValue({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' });

                if (tmpBlackCreatedFromId && arrBlackTwoLayersCreatedFromIds.indexOf(tmpBlackCreatedFromId.toString()) < 0) {
                    arrBlackTwoLayersCreatedFromIds.push(tmpBlackCreatedFromId.toString());
                }
            });
        });

        /**
         * 請求書作成元ID（四階層）
         * 請求書.DJ_クレジットメモ.作成元（返品）.作成元（請求書）.作成元（注文書）
         * @type {Array}
         */
        let arrBlackFourLayersCreatedFromIds = [];

        /**
         * 請求書作成元情報（二階層）
         * 請求書.DJ_クレジットメモ.作成元（請求書）.xxx
         * 請求書.DJ_クレジットメモ.作成元（返品）.xxx
         * @type {object}
         */
        let objBlackTwoLayersCreatedFromInfos = {};

        if (arrBlackTwoLayersCreatedFromIds.length > 0) {
            let arrBlackTwoLayersCreatedFromFilters = [];
            let arrBlackTwoLayersCreatedFromIdFilters = []
            arrBlackTwoLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrBlackTwoLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrBlackTwoLayersCreatedFromIds.length - 1) {
                    arrBlackTwoLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrBlackTwoLayersCreatedFromFilters.push(arrBlackTwoLayersCreatedFromIdFilters);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);

            let arrBlackTwoLayersCreatedFromColumns = [];
            // 作成元
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom'}));
            // 出荷日
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'shipdate'}));
            // トランザクション番号
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'transactionnumber'}));
            // 作成元.作成元
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom', join: 'createdfrom'}));
            // 作成元.トランザクション番号
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'transactionnumber', join: 'createdfrom'}));
            // 作成元.注文方法区分
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}));
            // 作成元.DJ_先方発注番号
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}));
            // DJ_FINETカナ社名・店名・取引先名
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}));
            // DJ_FINETカナ社名・店名・取引先名_option2
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}));
            // DJ_FINETカナ社名・店名・取引先名_option3
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}));
            // DJ_FINETカナ社名・店名・取引先名_option4
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}));
            // DJ_FINETカナ社名・店名・取引先名_option5
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}));
            // DJ_FINETカナ住所
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}));
            // DJ_FINETカナ住所_option2
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}));
            // DJ_FINETカナ住所_option3
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}));
            // DJ_FINETカナ住所_option4
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}));
            // DJ_FINETカナ住所_option5
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'}));

            let arrBlackTwoLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrBlackTwoLayersCreatedFromFilters, arrBlackTwoLayersCreatedFromColumns);

            arrBlackTwoLayersCreatedFromResults.forEach(function(tmpResult) {
                
                objBlackTwoLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    fourLayersCreatedFrom: tmpResult.getValue({name: 'createdfrom', join: 'createdfrom'}),
                    // 作成元
                    createdFrom: tmpResult.getValue({name: 'createdfrom'}),
                    // 出荷日
                    shipdate: tmpResult.getValue({name: 'shipdate'}),
                    // トランザクション番号
                    transactionNumber: tmpResult.getValue({name: 'transactionnumber'}),
                    // DJ_注文方法区分
                    orderMethodTyp: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}),
                    // 作成元.トランザクション番号
                    createdFromTransactionNumber: tmpResult.getValue({name: 'transactionnumber', join: 'createdfrom'}),
                    // 作成元.DJ_先方発注番号
                    createdFromCustomerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}),
                    // DJ_FINETカナ住所
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}),
                    // DJ_FINETカナ住所_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}),
                    // DJ_FINETカナ住所_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}),
                    // DJ_FINETカナ住所_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}),
                    // DJ_FINETカナ住所_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'})
                };

                /** 作成元ID（四階層）取得し整理する */
                let numBlackResultCreatedFromId = tmpResult.getValue({name: 'createdfrom', join: 'createdfrom'});
                if (numBlackResultCreatedFromId && arrBlackFourLayersCreatedFromIds.indexOf(numBlackResultCreatedFromId.toString()) < 0) {
                    arrBlackFourLayersCreatedFromIds.push(numBlackResultCreatedFromId.toString());
                }
            });
        }

        /**
         * 請求書作成元情報（四階層）
         * 請求書.DJ_クレジットメモ.作成元（返品）.作成元（請求書）.作成元（注文書）.xxx
         */
        let objBlackFourLayersCreatedFromInfos = {};

        if (arrBlackFourLayersCreatedFromIds.length > 0) {
            let arrBlackFourLayersCreatedFromFilters = [];
            let arrBlackFourLayersCreatedFromIdFilters = [];
            arrBlackFourLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrBlackFourLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrBlackFourLayersCreatedFromIds.length - 1) {
                    arrBlackFourLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrBlackFourLayersCreatedFromFilters.push(arrBlackFourLayersCreatedFromIdFilters);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);


            let arrBlackFourLayersCreatedFromColumns = [];
            /** DJ_注文方法区分 */
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp'}));
            /** DJ_先方発注番号 */
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno'}));
            // DJ_FINETカナ社名・店名・取引先名
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername'}));
            // DJ_FINETカナ社名・店名・取引先名_option2
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2'}));
            // DJ_FINETカナ社名・店名・取引先名_option3
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3'}));
            // DJ_FINETカナ社名・店名・取引先名_option4
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4'}));
            // DJ_FINETカナ社名・店名・取引先名_option5
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5'}));
            // DJ_FINETカナ住所
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomeraddress'}));
            // DJ_FINETカナ住所_option2
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option2'}));
            // DJ_FINETカナ住所_option3
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option3'}));
            // DJ_FINETカナ住所_option4
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option4'}));
            // DJ_FINETカナ住所_option5
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option5'}));
    
            let arrBlackFourLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrBlackFourLayersCreatedFromFilters, arrBlackFourLayersCreatedFromColumns);
            arrBlackFourLayersCreatedFromResults.forEach(function(tmpResult) {
                objBlackFourLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    // DJ_注文方法区分
                    orderMethodTyp: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp'}),
                    // DJ_先方発注番号
                    customerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno'}),
                    // DJ_FINETカナ社名・店名・取引先名
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername'}),
                    // DJ_FINETカナ社名・店名・取引先名_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2'}),
                    // DJ_FINETカナ社名・店名・取引先名_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3'}),
                    // DJ_FINETカナ社名・店名・取引先名_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4'}),
                    // DJ_FINETカナ社名・店名・取引先名_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5'}),
                    // DJ_FINETカナ住所
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress'}),
                    // DJ_FINETカナ住所_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2'}),
                    // DJ_FINETカナ住所_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3'}),
                    // DJ_FINETカナ住所_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4'}),
                    // DJ_FINETカナ住所_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5'})
                };
            });
        }
        /** 黒伝票処理用マスタ情報取得 end */
    
        for (let finalDestinationCode in objAllDatasByDestinationCode) {
    
            /** 変数リセット */
            numFileHeaderRecordSendDataCount = 0;
            numEndRecordRecordCount = 0;
            // 8.4 エンドレコード.生版金額合計
            amountEndRecordRawVersionTotal = 0;
            // 8.6 エンドレコード.回収容器金額合計
            amountEndRecordRecoverContainerTotal = 0;
            // データシリアル番号
            numDataSerialNumber = 1;
    
            /**
             * 該当最終送信先コード通常データ
             * @type {object} 
             * @param {string} key トランザクション内部ID
             * @param {object} value データ
             */
            var objCurrentDestinationNormalData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].normal;
            /**
             * 該当最終送信先コード黒データ
             * @type {object} 
             * @param {string} key トランザクション内部ID
             * @param {object} value データ
             */
            var objCurrentDestinationBlackData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].black;
    
            /**
             * 該当最終送信先コード赤データ
             * @type {object} 
             * @param {string} key トランザクション内部ID
             * @param {object} value データ
             */
            var objCurrentDestinationRedData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].red;
    
            /**
             * ファイルヘッダーレコード元データは通常伝票であるか
             * @type {boolean}
             */
            var flgIsNormalData = false;
    
            /**
             * 注文方法区分はFINETであるか
             * @type {boolean}
             */
            var flgIsOrderMethodFinet = false;
            /**
             * ファイルヘッダーレコード元データ
             */
            var objFileHeaderSearchResult = '';
    
            /**
             * データの内一件目データのID
             * @type {string}
             */
            var strFirstDataId = '';
    
            if (Object.keys(objCurrentDestinationNormalData).length > 0) {
                flgIsNormalData = true;
                strFirstDataId = Object.keys(objCurrentDestinationNormalData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationNormalData[strFirstDataId][0];
                flgIsOrderMethodFinet = (objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
            } else if (Object.keys(objCurrentDestinationRedData).length > 0) {
                strFirstDataId = Object.keys(objCurrentDestinationRedData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationRedData[strFirstDataId][0];
            } else if (Object.keys(objCurrentDestinationBlackData).length > 0) {
                strFirstDataId = Object.keys(objCurrentDestinationBlackData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationBlackData[strFirstDataId][0];
            } else {
                continue;
            }
    
            /**
             * ファイルヘッダーレコード元データ
             * @type {object}
             */
            let objFileHeaderData = {
                /** データシリアルNo. */
                serialNumber: numDataSerialNumber,
                /** 出荷区分 */
                shippingType: '04',
                /** システム日付 */
                systemDate: strSystemDate,
                /** システム時刻 */
                systemTime: strSystemTime,
                /** DJ_注文方法区分 */
                orderMethod: objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }),
                /** 送信元センターコード */
                senderCenterCode: objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_final_dest_code' }),
                /** 最終送信先コード */
                finalDestinationCode: (
                    flgIsNormalData
                        ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sender_center_code'})
                        : objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                ),
                /** 最終送信先コード（予備） */
                finalDestinationCodeBk: (
                    flgIsNormalData
                        ? (flgIsOrderMethodFinet ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sendercentercode_s' }) : ' ')
                        : ' '
                ),
                /** 直接送信先企業コード */
                directDestinationCompanyCode: (
                    flgIsNormalData
                        ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sender_center_code' })
                        : objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                ),
                /** 直接送信先企業コード（予備） */
                directDestinationCompanyCodeBk: (
                    flgIsNormalData
                        ? (flgIsOrderMethodFinet ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sendercentercode_s' }) : ' ')
                        : ' '
                )
            };
    
            /**
             * ファイルヘッダレコード
             * @type {object}
             */
            const objFileHeaderJson = createFinetShippingFileHeaderRecord(objFileHeaderData, flgIsNormalData)
    
            // 1.19 ファイルヘッダーレコード.送信データ件数 計数
            numFileHeaderRecordSendDataCount++;
    
            // データシリアル番号
            numDataSerialNumber++;
    
            /**
             * 次店コード情報配列
             * @type {Array}
             */
            let arrStoreCodes = [];
    
            /**
             * 一次店コード
             * @type {string}
             */
            let strFirstStoreCode = '';
    
            /**
             * 二次店コード
             * @type {string}
             */
            let strSecondStoreCode = '';
    
            /**
             * 三次店コード
             * @type {string}
             */
            let strThirdStoreCode = '';
    
            /**
             * 四次店コード
             * @type {string}
             */
            let strForthStoreCode = '';
    
            /**
             * 五次店コード
             * @type {string}
             */
            let strFifthStoreCode = '';
    
            /**
             * 手形情報
             * @type {string}
             */
            let strBillsInfo = '';
    
            /**
             * 倉直区分
             * @type {string}
             */
            let strLocationType = '';
    
            /**
             * 伝票データ配列
             * @type {Array}
             */
            let arrOrderRecords = [];
    
            for (let strNormalDataId in objCurrentDestinationNormalData) {
                /** 通常データを処理 */
    
                if (objTransactionIds.salesOrderIds.indexOf(strNormalDataId.toString()) < 0) {
                    objTransactionIds.salesOrderIds.push(strNormalDataId.toString());
                }
    
                /** 変数値リセット */
                arrStoreCodes = [];
                strBillsInfo = '';
                strLocationType = '';
    
                /**
                 * 該当内部ID分通常データ
                 * @type {Array}
                 */
                let arrCurrentNormalData = objCurrentDestinationNormalData[strNormalDataId];

                try {
                    /** 一次店コード */
                    strFirstStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_first_store_code' });
                    /** 二次店コード */
                    strSecondStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_second_store_code' });
                    /** 三次店コード */
                    strThirdStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_third_store_code' });
                    /** 四次店コード */
                    strForthStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_fourth_store_code' });
                    /** 五次店コード */
                    strFifthStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_fifth_store_code' });
        
                    if (strFirstStoreCode != null && strFirstStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strFirstStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomeraddress' })
                        });
                    }
                    if (strSecondStoreCode != null && strSecondStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strSecondStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername2' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option2' })
                        });
                    }
                    if (strThirdStoreCode != null && strThirdStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strThirdStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername_o3' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option3' })
                        });
                    }
                    if (strForthStoreCode != null && strForthStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strForthStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername4' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option4' })
                        });
                    }
                    if (strFifthStoreCode != null && strFifthStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strFifthStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername5' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option5' })
                        });
                    }
        
                    /**
                     * 出荷区分（通常）
                     * @type {string}
                     */
                    let strNormalShippingType = '00';
                    if (strNormalDataId.indexOf('discount') >= 0) {
                        /** 値引アイテムデータの場合 */
                        strNormalShippingType = '60';
                    }

                    // 手形情報
                    strBillsInfo = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_bills_info' });
                    if (strBillsInfo != null && strBillsInfo != '') {
                        strBillsInfo = commonTypeCodeById[(strBillsInfo.toString())];
                    }
                    // 倉直区分
                    strLocationType = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_location_type' });
                    if (strLocationType != null && strLocationType != '') {
                        strLocationType = commonTypeCodeById[(strLocationType.toString())];
                    }
        
                    // DJ_注文方法区分はFINETであるか
                    flgIsOrderMethodFinet = (arrCurrentNormalData[0].getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
                    
                    /**
                     * 伝票ヘッダーレコード元データ
                     * @type {object}
                     */
                    let objNormalOrderHeaderData = {
                        // データシリアルNo.
                        serialNumber: numDataSerialNumber,
                        // 出荷区分
                        shippingType: strNormalShippingType,
                        // 伝票日付
                        tranDate: arrCurrentNormalData[0].getValue({ name: 'trandate' }),
                        // 出荷日
                        shipDate: arrCurrentNormalData[0].getValue({ name: 'shipdate' }),
                        // 伝票番号
                        transactionNumber: arrCurrentNormalData[0].getValue({ name: 'transactionnumber' }),
                        // 補助伝票No.
                        auxiliaryOrderNo: '',
                        // 一次店コード
                        firstStoreCode: strFirstStoreCode,
                        // 二次店コード
                        secondStoreCode: strSecondStoreCode,
                        // 三次店コード
                        thirdStoreCode: strThirdStoreCode,
                        // 四次店コード
                        forthStoreCode: strForthStoreCode,
                        // 五次店コード
                        fifthStoreCode: strFifthStoreCode,
                        // 手形情報
                        billsInfo: (flgIsOrderMethodFinet ? strBillsInfo : ' '),
                        // 倉直区分
                        locationType: (flgIsOrderMethodFinet ? strLocationType : ' '),
                        // 倉庫コード
                        locationCode: (objLocationInfo.hasOwnProperty(arrCurrentNormalData[0].getValue({ name: 'location' }).toString()) ? objLocationInfo[(arrCurrentNormalData[0].getValue({ name: 'location' }).toString())].externalId.slice(1, 3) : '')
                    };
        
                    /**
                     * 伝票ヘッダーレコード
                     * @type {object}
                     */
                    const objNormalOrderHeaderJson = createFinetShippingOrderHeaderRecord(objNormalOrderHeaderData);
        
                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                    numFileHeaderRecordSendDataCount++;
                    // データシリアル番号
                    numDataSerialNumber++;
        
                    /**
                     * 伝票ヘッダーオプションレコード1（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson1 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード1（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson1 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード2（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson2 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード2（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson2 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード3（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson3 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード3（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson3 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード4（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson4 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード4（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson4 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード5（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson5 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード5（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson5 = null;
        
                    if (flgIsOrderMethodFinet) {
                        /** 注文方法区分は「FINET」である場合 */
        
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjNormalOrderHeaderOptionalJson = createFinetShippingOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: index + 1,
                                // 社名・店名・取引先名
                                customerName: tmpStoreCodeInfo['customerName'],
                                // 住所
                                customerAddress: tmpStoreCodeInfo['address'],
                                // 取引先対応コード
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
        
                            if (tmpObjNormalOrderHeaderOptionalJson != null && tmpObjNormalOrderHeaderOptionalJson != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
        
                            let tmpObjNormalOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjNormalOrderHeaderOptionalSubJson = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                                if (tmpObjNormalOrderHeaderOptionalSubJson != null && tmpObjNormalOrderHeaderOptionalSubJson != '') {
                                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                    numFileHeaderRecordSendDataCount++;
                                    // データシリアル番号
                                    numDataSerialNumber++;
                                }
                            }
        
                            switch (index) {
                                case 0:
                                    objNormalOrderHeaderOptionalJson1 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson1 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objNormalOrderHeaderOptionalJson2 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson2 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objNormalOrderHeaderOptionalJson3 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson3 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objNormalOrderHeaderOptionalJson4 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson4 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objNormalOrderHeaderOptionalJson5 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson5 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objNormalOrderHeaderOptionalJson1 = createFinetShippingOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: arrStoreCodes.length,
                                // 社名・店名・取引先名
                                customerName: arrCurrentNormalData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // 住所
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // 取引先対応コード
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
        
                            if (objNormalOrderHeaderOptionalJson1 != null && objNormalOrderHeaderOptionalJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
        
                            objNormalOrderHeaderOptionalSubJson1 = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                            if (objNormalOrderHeaderOptionalSubJson1 != null && objNormalOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
                        }
                    }
        
                    /**
                     * 伝票明細行レコード（通常）JSON配列
                     * @type {Array}
                     */
                    let arrNormalOrderLineRecords = [];
        
                    arrCurrentNormalData.forEach(function (objCurrentNormalData, index) {
        
                        /**
                         * 明細.アイテム内部ID
                         * @type {number}
                         */
                        let numCurrentNormalItemInternalId = objCurrentNormalData.getValue({ name: 'item' });
        
                        /**
                         * 明細.アイテム.アイテムID
                         * @type {string}
                         */
                        let strCurrentNormalItemId = objCurrentNormalData.getValue({ name: 'itemid', join: 'item' });
        
                        /**
                         * 明細.アイテム.UPCコード
                         * @type {string}
                         */
                        let strCurrentNormalUpcCd = objCurrentNormalData.getValue({ name: 'upccode', join: 'item' });
        
                        let strTmpKey = [
                            strCurrentNormalItemId,
                            objCurrentNormalData.getValue({ name: 'custbody_djkk_finet_sender_center_code' })
                        ].join('-');
        
                        let strCurrentNormalUnit = objCurrentNormalData.getValue({ name: 'unit' });
                        if (numCurrentNormalItemInternalId != null && numCurrentNormalItemInternalId != '') {
                            strCurrentNormalUnit = unitCodeByItem[(numCurrentNormalItemInternalId.toString())];
                        }
                        let numCurrentNormalOrderQuantity = Math.abs(objCurrentNormalData.getValue({ name: 'quantity' }));
                        if (strCurrentNormalUnit == '3') {
                            // バラの場合
                            numCurrentNormalOrderQuantity = Math.abs(objCurrentNormalData.getValue({ name: 'quantity' }));
                        }
                        if (strCurrentNormalUnit == '1') {
                            numCurrentNormalOrderQuantity = Math.abs(Math.ceil(Number(objCurrentNormalData.getValue({ name: 'quantity' }))) / Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
        
                        let strNormalLineNo = objCurrentNormalData.getValue({ name: 'custcol_djkk_exsystem_line_num' });
                        if (strNormalDataId.indexOf('-discount') >= 0) {
                            /** 値引アイテム行の場合 */
                            strNormalLineNo = index + 1;
                        }
                        strNormalLineNo = strNormalLineNo.toString();

                        /**
                         * 明細行レコード元データ
                         * @type {object}
                         */
                        let objNormalOrderLineData = {
                            // データシリアルNo.
                            serialNumber: numDataSerialNumber,
                            // 伝票行No
                            lineNumber: strNormalLineNo,
                            // 商品コード
                            itemCode: (finetItemCodeMapping.hasOwnProperty(strTmpKey.toString()) ? finetItemCodeMapping[(strTmpKey.toString())] : strCurrentNormalUpcCd),
                            // 商品名（カナ）
                            itemNameKana: objCurrentNormalData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // 数量
                            orderQuantity: numCurrentNormalOrderQuantity,
                            // 入数
                            unitQuantity: objCurrentNormalData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 数量(標準)
                            quantity: Math.abs(objCurrentNormalData.getValue({ name: 'quantity' })),
                            // 単位
                            unit: strCurrentNormalUnit,
                            // 単価
                            rate: objCurrentNormalData.getValue({ name: 'rate' }),
                            // .DJ_入数
                            itemUnitQuantity: objCurrentNormalData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 請求締日
                            billingCloseDate: formatDate(objCurrentNormalData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_納品書明細備考
                            deliveryNoteMemo: objCurrentNormalData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // 発注No.
                            orderNo: (flgIsOrderMethodFinet ? objCurrentNormalData.getValue({ name: 'custbody_djkk_customerorderno' }) : objCurrentNormalData.getValue({ name: 'custbody_djkk_customerorderno' }).slice(0, 8)),
                            // 商品コード使用区分
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strTmpKey.toString()) ? '1' : '3')
                        };
        
                        arrNormalOrderLineRecords.push(createFinetShippingLineRecord(objNormalOrderLineData));
        
                        // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 エンドレコード.レコード件数
                        numEndRecordRecordCount++;
                        // データシリアル番号
                        numDataSerialNumber++;
                                            
                        // 8.4 エンドレコード.生版金額合計
                        if (Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strNormalShippingType) >= 0 && Number(strNormalShippingType) <= 9) || Number(strNormalShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentNormalData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentNormalData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentNormalData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentNormalData.getValue({ name: 'quantity' })));
                            }
                        } else {
                            if ((Number(strNormalShippingType) >= 0 && Number(strNormalShippingType) <= 9) || Number(strNormalShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                    });
        
                    /**
                     * 伝票データJSON
                     * @type {object}
                     */
                    let objNormalOrderJson = {
                        orderHeaderRecord: objNormalOrderHeaderJson,
                        orderHeaderOptionalRecord1: objNormalOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objNormalOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objNormalOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objNormalOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objNormalOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objNormalOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objNormalOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objNormalOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objNormalOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objNormalOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrNormalOrderLineRecords
                    }
        
                    if (objNormalOrderHeaderOptionalJson1 == null || objNormalOrderHeaderOptionalJson1 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objNormalOrderHeaderOptionalSubJson1 == null || objNormalOrderHeaderOptionalSubJson1 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord1;
                    }
        
                    if (objNormalOrderHeaderOptionalJson2 == null || objNormalOrderHeaderOptionalJson2 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord2;
                    }
        
                    if (objNormalOrderHeaderOptionalSubJson2 == null || objNormalOrderHeaderOptionalSubJson2 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord2;
                    }
        
                    if (objNormalOrderHeaderOptionalJson3 == null || objNormalOrderHeaderOptionalJson3 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord3;
                    }
        
                    if (objNormalOrderHeaderOptionalSubJson3 == null || objNormalOrderHeaderOptionalSubJson3 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord3;
                    }
        
                    if (objNormalOrderHeaderOptionalJson4 == null || objNormalOrderHeaderOptionalJson4 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord4;
                    }
        
                    if (objNormalOrderHeaderOptionalSubJson4 == null || objNormalOrderHeaderOptionalSubJson4 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord4;
                    }
        
                    if (objNormalOrderHeaderOptionalJson5 == null || objNormalOrderHeaderOptionalJson5 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord5;
                    }
        
                    if (objNormalOrderHeaderOptionalSubJson5 == null || objNormalOrderHeaderOptionalSubJson5 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord5;
                    }
        
                    arrOrderRecords.push(objNormalOrderJson);
                } catch(error) {
                    log.error({
                        title: '出荷案内-通常データ-処理エラー',
                        details: '【トランザクション番号】: ' + arrCurrentNormalData[0].getValue({name: 'tranid'}) + '\n【エラー】: ' + error
                    });
                }
            }
    
            for (let strRedDataId in objCurrentDestinationRedData) {
                /** 赤伝票データ処理 */

                if (objTransactionIds.creditMemoIds.indexOf(strRedDataId.toString()) < 0) {
                    objTransactionIds.creditMemoIds.push(strRedDataId.toString());
                }
    
                /** 変数値リセット */
                arrStoreCodes = [];
                strBillsInfo = '';
                strLocationType = '';
    
                /**
                 * 該当内部ID分赤伝票データ
                 * @type {Array}
                 */
                let arrCurrentRedData = objCurrentDestinationRedData[strRedDataId];

                try {
                    /**
                     * 出荷区分（赤伝）
                     * @type {string}
                     */
                    let strRedShippingType = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' });
                    if (strRedDataId.indexOf('-discount') >= 0) {
                        /** 値引アイテムデータの場合 */
                        strRedShippingType = '61'
                    }
    
                    /**
                     * 作成元.作成元.内部ID（赤伝票）
                     * @type {number}
                     */
                    let numRedCurrentDataCreatedFromId = arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'});
    
                    /**
                     * 該当赤伝票データ作成元（二階層）情報
                     * @type {object}
                     */
                    let objCurrentRedDataTwoLayersCreatedFromInfo = null;
                    if (numRedCurrentDataCreatedFromId && objRedTwoLayersCreatedFromInfos.hasOwnProperty(numRedCurrentDataCreatedFromId.toString())) {
                        objCurrentRedDataTwoLayersCreatedFromInfo = objRedTwoLayersCreatedFromInfos[(numRedCurrentDataCreatedFromId.toString())];
                    }
        
                    /** 一次店コード */
                    strFirstStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' });
                    /** 二次店コード */
                    strSecondStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' });
                    /** 三次店コード */
                    strThirdStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' });
                    /** 四次店コード */
                    strForthStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' });
                    /** 五次店コード */
                    strFifthStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' });
    
                    let flgRedHasCreatedFromSalesOrder = false;
    
                    if (objCurrentRedDataTwoLayersCreatedFromInfo) {
                        flgRedHasCreatedFromSalesOrder = true;
                    }
    
                    /**
                     * 注文方法区分
                     * @type {string}
                     */
                    let strRedOrderMethodType = '';
                    if (flgRedHasCreatedFromSalesOrder) {
                        /** 作成元注文書参照できる場合 */
    
                        strRedOrderMethodType = objCurrentRedDataTwoLayersCreatedFromInfo.orderMethodType;
                        if (strRedShippingType == '10') {
                            /** 出荷区分は「10:返品」の場合 */
                            strRedOrderMethodType = objCurrentRedDataTwoLayersCreatedFromInfo.createdFromOrderMethodType;
                        }
                    } else {
                        strRedOrderMethodType = arrCurrentRedData[0].getValue({name: 'custbody_djkk_ordermethodrtyp'});
                    }
    
                    if (commonTypeCodeById.hasOwnProperty(strRedOrderMethodType.toString())) {
                        strRedOrderMethodType = commonTypeCodeById[strRedOrderMethodType.toString()];
                    } else {
                        strRedOrderMethodType = '';
                    }
                    
                    if (flgRedHasCreatedFromSalesOrder) {
                        if (strRedShippingType == '10') {
                            /** 出荷区分は「10:返品」の場合 */
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName1,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress1
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName2,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress2
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName3,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress3
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName4,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress4
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName5,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress5
                                });
                            }
                        } else {
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName1,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address1
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName2,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address2
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName3,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address3
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName4,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address4
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName5,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address5
                                });
                            }
                        }
                    } else {
                        if (strFirstStoreCode != null && strFirstStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFirstStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strSecondStoreCode != null && strSecondStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strSecondStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strThirdStoreCode != null && strThirdStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strThirdStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strForthStoreCode != null && strForthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strForthStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strFifthStoreCode != null && strFifthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFifthStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                    }
    
                    /**
                     * 赤伝票補助伝票番号
                     * @type {string}
                     */
                    let strRedAuxiliaryOrderNo = '';
                    if (strRedShippingType == '10') {
                        // 出荷区分は返品である場合
                        strRedAuxiliaryOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.transactionNumber;
                    } else {
                        if (arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' })) {
                            strRedAuxiliaryOrderNo = arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' })[0] + arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' }).slice(-7);
                        }
                    }
        
                    flgIsOrderMethodFinet = (arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
    
                    /**
                     * 該当赤伝票に二階層の作成元があるか
                     * @type {boolean}
                     */
                    let flgCurrentRedHasTwoCreatedFrom = false;
                    if (arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'})) {
                        flgCurrentRedHasTwoCreatedFrom = true;
                    }
    
                    /**
                     * 伝票ヘッダーレコード元データ（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderData = {
                        // データシリアルNo.
                        serialNumber: numDataSerialNumber,
                        // 出荷区分
                        shippingType: strRedShippingType,
                        // 伝票日付
                        tranDate: arrCurrentRedData[0].getValue({ name: 'trandate' }),
                        // 出荷日
                        shipDate: arrCurrentRedData[0].getValue({ name: 'trandate' }),
                        // 伝票番号
                        transactionNumber: arrCurrentRedData[0].getValue({ name: 'transactionnumber' }),
                        // 補助伝票No.
                        auxiliaryOrderNo: strRedAuxiliaryOrderNo,
                        // 一次店コード
                        firstStoreCode: strFirstStoreCode,
                        // 二次店コード
                        secondStoreCode: strSecondStoreCode,
                        // 三次店コード
                        thirdStoreCode: strThirdStoreCode,
                        // 四次店コード
                        forthStoreCode: strForthStoreCode,
                        // 五次店コード
                        fifthStoreCode: strFifthStoreCode,
                        // 手形情報
                        billsInfo: ' ',
                        // 倉直区分
                        locationType: ' ',
                        // 倉庫コード
                        locationCode: (arrCurrentRedData[0].getValue({ name: 'location' }) ? objLocationInfo[arrCurrentRedData[0].getValue({ name: 'location' }).toString()].externalId.slice(1, 3) : '')
                    };
        
                    /**
                     * 伝票ヘッダレコード（赤伝票）
                     * @type {object}
                     */
                    const objRedOrderHeaderJson = createFinetShippingOrderHeaderRecord(objRedOrderHeaderData);
        
                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                    numFileHeaderRecordSendDataCount++;
                    // データシリアル番号
                    numDataSerialNumber++;
        
                    /**
                     * 伝票ヘッダーオプションレコード1（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson1 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード1（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson1 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード2（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson2 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード2（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson2 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード3（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson3 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード3（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson3 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード4（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson4 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード4（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson4 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード5（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson5 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード5（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson5 = null;
        
                    if (strRedOrderMethodType == '1') {
                        /** 注文方法区分は「FINET」の場合 */
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjRedOrderHeaderOptionalJson = createFinetShippingOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: index + 1,
                                // 社名・店名・取引先名
                                customerName: tmpStoreCodeInfo['customerName'],
                                // 住所
                                customerAddress: tmpStoreCodeInfo['address'],
                                // 取引先対応コード
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
        
                            if (tmpObjRedOrderHeaderOptionalJson != null && tmpObjRedOrderHeaderOptionalJson != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
        
                            let tmpObjRedOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjRedOrderHeaderOptionalSubJson = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                                if (tmpObjRedOrderHeaderOptionalSubJson != null && tmpObjRedOrderHeaderOptionalSubJson != '') {
                                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                    numFileHeaderRecordSendDataCount++;
                                    // データシリアル番号
                                    numDataSerialNumber++;
                                }
                            }
        
                            switch (index) {
                                case 0:
                                    objRedOrderHeaderOptionalJson1 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson1 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objRedOrderHeaderOptionalJson2 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson2 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objRedOrderHeaderOptionalJson3 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson3 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objRedOrderHeaderOptionalJson4 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson4 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objRedOrderHeaderOptionalJson5 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson5 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objRedOrderHeaderOptionalJson1 = createFinetShippingOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: arrStoreCodes.length,
                                // 社名・店名・取引先名
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // 住所
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // 取引先対応コード
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
        
                            if (objRedOrderHeaderOptionalJson1 != null && objRedOrderHeaderOptionalJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
        
                            objRedOrderHeaderOptionalSubJson1 = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                            if (objRedOrderHeaderOptionalSubJson1 != null && objRedOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
                        }
                    }
        
                    /**
                     * 伝票明細行レコード（赤伝票）JSON配列
                     * @type {Array}
                     */
                    let arrRedOrderLineRecords = [];
        
                    arrCurrentRedData.map(function (objCurrentRedData, index) {
        
                        let strRedTmpKey = [
                            objCurrentRedData.getValue({ name: 'itemid', join: 'item' }),
                            objCurrentRedData.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                        ].join('-');
        
                        let strRedItemInternalId = objCurrentRedData.getValue({ name: 'item' });
                        let strRedUnit = '';
                        if (strRedItemInternalId) {
                            strRedUnit = unitCodeByItem[strRedItemInternalId.toString()];
                        }
        
                        let numRedOrderQuantity = Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                        if (strRedUnit == '3') {
                            /** 出荷単位が「バラ」の場合 */
                            numRedOrderQuantity = Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                        }
                        if (strRedUnit == '1') {
                            /** 出荷単位が「ケース」の場合 */
                            numRedOrderQuantity = Math.ceil(Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' }))) / Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
        
                        if (strRedShippingType == '11' || strRedShippingType == '10') {
                            /** 出荷区分は「11:出荷取消（赤伝）」、「10:返品」の場合 */
                            numRedOrderQuantity = 0 - Math.abs(numRedOrderQuantity);
                        } else {
                            numRedOrderQuantity = Math.abs(numRedOrderQuantity);
                        }
    
                        /**
                         * 赤伝.発注No
                         * @type {string}
                         */
                        let strRedOrderNo = '';
                        strRedOrderNo = objCurrentRedData.getValue({name: 'custbody_djkk_customerorderno'});
    
                        if (strRedShippingType == '10') {
                            /** 出荷区分は「10:返品」の場合 */
                            if (objCurrentRedDataTwoLayersCreatedFromInfo && objCurrentRedDataTwoLayersCreatedFromInfo.createdFrom) {
                                /** 作成元注文書特定できる場合 */
    
                                strRedOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerOrderNo;
                            }
                        } else {
                            /** 出荷区分は「10:返品」の場合 */
                            if (objCurrentRedDataTwoLayersCreatedFromInfo) {
                                /** 作成元注文書特定できる場合 */
    
                                strRedOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.customerOrderNo;
                            }
                        }
    
                        if (strRedOrderNo && strRedOrderNo.length > 8) {
                            strRedOrderNo = strRedOrderNo.slice(0, 8);
                        }
    
                        /**
                         * 明細行レコード元データ（赤伝票）
                         * @type {object}
                         */
                        let objRedOrderLineData = {
                            // データシリアルNo.
                            serialNumber: numDataSerialNumber,
                            // 伝票行No
                            lineNumber: index + 1,
                            // 商品コード
                            itemCode: (
                                finetItemCodeMapping.hasOwnProperty(strRedTmpKey.toString())
                                    ? finetItemCodeMapping[(strRedTmpKey.toString())]
                                    : objCurrentRedData.getValue({ name: 'upccode', join: 'item' })
                            ),
                            // 商品名（カナ）
                            itemNameKana: objCurrentRedData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // 数量
                            orderQuantity: numRedOrderQuantity,
                            // 入数
                            unitQuantity: objCurrentRedData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 数量(標準)
                            quantity: numRedOrderQuantity,
                            // 単位
                            unit: strRedUnit,
                            // 単価
                            rate: objCurrentRedData.getValue({ name: 'rate' }),
                            // DJ_入り数(入り目)
                            itemUnitQuantity: objCurrentRedData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 請求締日
                            billingCloseDate: formatDate(objCurrentRedData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_納品書明細備考
                            deliveryNoteMemo: objCurrentRedData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // 発注No.
                            orderNo: strRedOrderNo,
                            // 商品コード使用区分
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strRedTmpKey.toString()) ? '1' : '3')
                        };
        
                        arrRedOrderLineRecords.push(createFinetShippingLineRecord(objRedOrderLineData));
        
                        // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 エンドレコード.レコード件数
                        numEndRecordRecordCount++;
                        // データシリアル番号
                        numDataSerialNumber++;
                      
                        // 8.4 エンドレコード.生販金額合計
                        if (Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strRedShippingType) >= 0 && Number(strRedShippingType) <= 9) || Number(strRedShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentRedData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentRedData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                            }
        
                        } else {
                            if ((Number(strRedShippingType) >= 0 && Number(strRedShippingType) <= 9) || Number(strRedShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                    });
        
                    let objRedOrderJson = {
                        orderHeaderRecord: objRedOrderHeaderJson,
                        orderHeaderOptionalRecord1: objRedOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objRedOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objRedOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objRedOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objRedOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objRedOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objRedOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objRedOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objRedOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objRedOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrRedOrderLineRecords
                    };
        
                    if (objRedOrderHeaderOptionalJson1 == null || objRedOrderHeaderOptionalJson1 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objRedOrderHeaderOptionalSubJson1 == null || objRedOrderHeaderOptionalSubJson1 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord1;
                    }
        
                    if (objRedOrderHeaderOptionalJson2 == null || objRedOrderHeaderOptionalJson2 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord2;
                    }
        
                    if (objRedOrderHeaderOptionalSubJson2 == null || objRedOrderHeaderOptionalSubJson2 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord2;
                    }
        
                    if (objRedOrderHeaderOptionalJson3 == null || objRedOrderHeaderOptionalJson3 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord3;
                    }
        
                    if (objRedOrderHeaderOptionalSubJson3 == null || objRedOrderHeaderOptionalSubJson3 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord3;
                    }
        
                    if (objRedOrderHeaderOptionalJson4 == null || objRedOrderHeaderOptionalJson4 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord4;
                    }
        
                    if (objRedOrderHeaderOptionalSubJson4 == null || objRedOrderHeaderOptionalSubJson4 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord4;
                    }
        
                    if (objRedOrderHeaderOptionalJson5 == null || objRedOrderHeaderOptionalJson5 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord5;
                    }
        
                    if (objRedOrderHeaderOptionalSubJson5 == null || objRedOrderHeaderOptionalSubJson5 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord5;
                    }
        
                    arrOrderRecords.push(objRedOrderJson);
                } catch(error) {
                    log.error({
                        title: '出荷案内-赤伝票データ-処理エラー',
                        details: '【トランザクション番号】: ' + arrCurrentRedData[0].getValue({name: 'tranid'}) + '\n【エラー】: ' + error
                    });
                }
            }
    
            for (var strBlackDataId in objCurrentDestinationBlackData) {
                /** 黒伝票データ処理 */
    
                if (objTransactionIds.invoiceIds.indexOf(strBlackDataId.toString()) < 0) {
                    objTransactionIds.invoiceIds.push(strBlackDataId.toString());
                }
    
                /**
                 * 該当内部ID分黒伝票データ
                 * @type {Array}
                 */
                let arrCurrentBlackData = objCurrentDestinationBlackData[strBlackDataId];

                try {
                    /**
                     * 作成元.作成元.内部ID
                     * @type {number}
                     */
                    let numBlackCurrentDataCreatedFromId = arrCurrentBlackData[0].getValue({name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo'});
    
                    /**
                     * 黒伝票作成元情報（二階層）
                     */
                    let objCurrentBlackTwoLayersInfo = null;
    
                    if (numBlackCurrentDataCreatedFromId && objBlackTwoLayersCreatedFromInfos.hasOwnProperty(numBlackCurrentDataCreatedFromId)) {
                        objCurrentBlackTwoLayersInfo = objBlackTwoLayersCreatedFromInfos[numBlackCurrentDataCreatedFromId.toString()];
                    }
    
                    /**
                     * 黒伝票作成元情報（四階層）
                     */
                    let objCurrentBlackFourLayersInfo = null;
                    if (objCurrentBlackTwoLayersInfo && objCurrentBlackTwoLayersInfo.fourLayersCreatedFrom) {
                        objCurrentBlackFourLayersInfo = objBlackFourLayersCreatedFromInfos[(objCurrentBlackTwoLayersInfo.fourLayersCreatedFrom.toString())];
                    }
    
                    /** 変数値リセット */
                    arrStoreCodes = [];
                    strBillsInfo = '';
                    strLocationType = '';
        
                    flgIsOrderMethodFinet = (arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
        
                    /**
                     * 出荷区分（黒伝票）
                     * @type {string}
                     */
                    let strBlackShippingType = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' });
        
                    if (strBlackDataId.indexOf('-discount') >= 0) {
                        /** 値引アイテムデータの場合 */
                        strBlackShippingType = '60';
                    }
    
                    /**
                     * 作成元注文書特定できるか
                     * @type {boolean}
                     */
                    let flgBlackHasCreatedFromSalesOrder = false;
    
                    /**
                     * 注文方法区分（黒伝）
                     * @type {string}
                     */
                    let strBlackOrderMethodType = '';
                    
                    if (strBlackShippingType == '01') {
                        /** 出荷区分は「01:返品取消」の場合 */
                        if (objCurrentBlackFourLayersInfo) {
                            strBlackOrderMethodType = objCurrentBlackFourLayersInfo.orderMethodTyp;
                            flgBlackHasCreatedFromSalesOrder = true;
                        }
                    } else {
                        if (objCurrentBlackTwoLayersInfo) {
                            strBlackOrderMethodType = objCurrentBlackTwoLayersInfo.orderMethodTyp;
                            flgBlackHasCreatedFromSalesOrder = true;
                        }
                    }
    
                    if (!flgBlackHasCreatedFromSalesOrder) {
                        strBlackOrderMethodType = arrCurrentBlackData[0].getValue({name: 'custbody_djkk_ordermethodrtyp'});
                    }
    
                    if (strBlackOrderMethodType) {
                        strBlackOrderMethodType = commonTypeCodeById[strBlackOrderMethodType.toString()];
                    }
    
                    /** 一次店コード */
                    strFirstStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' });
                    /** 二次店コード */
                    strSecondStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' });
                    /** 三次店コード */
                    strThirdStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' });
                    /** 四次店コード */
                    strForthStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' });
                    /** 五次店コード */
                    strFifthStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' });
        
                    if (flgBlackHasCreatedFromSalesOrder) {
                        if (strBlackShippingType == '01') {
                            /** 出荷区分は「01:返品取消」の場合 */
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName1,
                                    address: objCurrentBlackFourLayersInfo.address1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName2,
                                    address: objCurrentBlackFourLayersInfo.address2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName3,
                                    address: objCurrentBlackFourLayersInfo.address3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName4,
                                    address: objCurrentBlackFourLayersInfo.address4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName5,
                                    address: objCurrentBlackFourLayersInfo.address5,
                                });
                            }
                        } else {
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName1,
                                    address: objCurrentBlackTwoLayersInfo.address1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName2,
                                    address: objCurrentBlackTwoLayersInfo.address2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName3,
                                    address: objCurrentBlackTwoLayersInfo.address3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName4,
                                    address: objCurrentBlackTwoLayersInfo.address4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName5,
                                    address: objCurrentBlackTwoLayersInfo.address5,
                                });
                            }
                        }
                    } else {
                        if (strFirstStoreCode != null && strFirstStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFirstStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: '',
                            });
                        }
                        if (strSecondStoreCode != null && strSecondStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strSecondStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: '',
                            });
                        }
                        if (strThirdStoreCode != null && strThirdStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strThirdStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: '',
                            });
                        }
                        if (strForthStoreCode != null && strForthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strForthStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: '',
                            });
                        }
                        if (strFifthStoreCode != null && strFifthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFifthStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: '',
                            });
                        }
                    }
    
                    /**
                     * 補助伝票NO.
                     * @type {string}
                     */
                    let strBlackAuxiliaryOrderNo = '';
    
                    if (strBlackShippingType == '01') {
                        /** 出荷区分は「01:返品取消」の場合 */
                        if (objCurrentBlackTwoLayersInfo) {
                            strBlackAuxiliaryOrderNo = objCurrentBlackTwoLayersInfo.createdFromTransactionNumber;
                        }
                    } else if (strBlackShippingType == '02') {
                        /** 出荷区分は「02:出荷訂正（黒伝）」の場合 */
                        if (objCurrentBlackTwoLayersInfo) {
                            strBlackAuxiliaryOrderNo = objCurrentBlackTwoLayersInfo.transactionNumber;
                        }
                    } else {
                        strBlackAuxiliaryOrderNo = arrCurrentBlackData[0].getValue({name: 'transactionnumber', join: 'custbody_djkk_invoice_creditmemo'});
                    }
    
                    if (strBlackAuxiliaryOrderNo && strBlackAuxiliaryOrderNo.length > 8) {
                        strBlackAuxiliaryOrderNo = strBlackAuxiliaryOrderNo[0] + strBlackAuxiliaryOrderNo.slice(-7);
                    }
    
    
                    /**
                     * 伝票ヘッダーレコード元データ（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderData = {
                        // データシリアルNo.
                        serialNumber: numDataSerialNumber,
                        // 出荷区分
                        shippingType: strBlackShippingType,
                        // 伝票日付
                        tranDate: arrCurrentBlackData[0].getValue({ name: 'trandate' }),
                        // 出荷日 
                        shipDate: (
                            Number(strBlackShippingType) == '2' ? 
                            objCurrentBlackTwoLayersInfo.shipDate: 
                            arrCurrentBlackData[0].getValue({ name: 'trandate' })
                        ),
                        // 伝票番号
                        transactionNumber: arrCurrentBlackData[0].getValue({ name: 'transactionnumber' }),
                        // 補助伝票No.
                        auxiliaryOrderNo: strBlackAuxiliaryOrderNo,
                        // 一次店コード
                        firstStoreCode: strFirstStoreCode,
                        // 二次店コード
                        secondStoreCode: strSecondStoreCode,
                        // 三次店コード
                        thirdStoreCode: strThirdStoreCode,
                        // 四次店コード
                        forthStoreCode: strForthStoreCode,
                        // 五次店コード
                        fifthStoreCode: strFifthStoreCode,
                        // 手形情報
                        billsInfo: ' ',
                        // 倉直区分
                        locationType: ' ',
                        // 倉庫コード
                        locationCode: arrCurrentBlackData[0].getValue({ name: 'externalid', join: 'location' }).slice(1, 3)
                    };
        
                    /**
                     * 伝票ヘッダーレコード（黒伝票）
                     * @type {object}
                     */
                    const objBlackOrderHeaderJson = createFinetShippingOrderHeaderRecord(objBlackOrderHeaderData);
        
                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                    numFileHeaderRecordSendDataCount++;
                    // データシリアル番号
                    numDataSerialNumber++;
        
                    /**
                     * 伝票ヘッダーオプションレコード1（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson1 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード1（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson1 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード2（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson2 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード2（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson2 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード3（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson3 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード3（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson3 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード4（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson4 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード4（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson4 = null;
        
                    /**
                     * 伝票ヘッダーオプションレコード5（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson5 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード5（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson5 = null;
    
                    if (strBlackOrderMethodType == '1') {
                        /** 注文方法区分は「FINET」の場合　 */
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjBlackOrderHeaderOptionalJson = createFinetShippingOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: index + 1,
                                // 社名・店名・取引先名
                                customerName: tmpStoreCodeInfo['customerName'],
                                // 住所
                                customerAddress: tmpStoreCodeInfo['address'],
                                // 取引先対応コード
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
        
                            if (tmpObjBlackOrderHeaderOptionalJson != null && tmpObjBlackOrderHeaderOptionalJson != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
        
                            let tmpObjBlackOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjBlackOrderHeaderOptionalSubJson = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                                if (tmpObjBlackOrderHeaderOptionalSubJson != null && tmpObjBlackOrderHeaderOptionalSubJson != '') {
                                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                    numFileHeaderRecordSendDataCount++;
                                    // データシリアル番号
                                    numDataSerialNumber++;
                                }
                            }
        
                            switch (index) {
                                case 0:
                                    objBlackOrderHeaderOptionalJson1 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson1 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objBlackOrderHeaderOptionalJson2 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson2 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objBlackOrderHeaderOptionalJson3 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson3 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objBlackOrderHeaderOptionalJson4 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson4 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objBlackOrderHeaderOptionalJson5 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson5 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objBlackOrderHeaderOptionalJson1 = createFinetShippingOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: arrStoreCodes.length,
                                // 社名・店名・取引先名
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // 住所
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // 取引先対応コード
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
        
                            if (objBlackOrderHeaderOptionalJson1 != null && objBlackOrderHeaderOptionalJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
        
                            objBlackOrderHeaderOptionalSubJson1 = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                            if (objBlackOrderHeaderOptionalSubJson1 != null && objBlackOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
                        }
                    }
        
                    /**
                     * 伝票明細行レコード（黒伝票）JSON配列
                     * @type {Array}
                     */
                    let arrBlackOrderLineRecords = [];
        
                    arrCurrentBlackData.map(function (objCurrentBlackData, index) {
        
                        let strBlackTmpKey = [
                            objCurrentBlackData.getValue({ name: 'itemid', join: 'item' }),
                            objCurrentBlackData.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                        ].join('-');
        
                        let strBlackItemInternalId = objCurrentBlackData.getValue({ name: 'item' });
        
                        let strBlackUnit = '';
                        if (strBlackItemInternalId) {
                            strBlackUnit = unitCodeByItem[strBlackItemInternalId.toString()];
                        }
        
                        let numBlackOrderQuantity = Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                        if (strBlackUnit == '3') {
                            numBlackOrderQuantity = Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                        }
                        if (strBlackUnit == '1') {
                            numBlackOrderQuantity = Math.ceil(Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' }))) / Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
        
                        /**
                         * 黒伝発注No.
                         * @type {string}
                         */
                        let strBlackOrderNo = '';
                        
                        strBlackOrderNo = arrCurrentBlackData[0].getValue({name: 'custbody_djkk_customerorderno'});
                        if (strBlackShippingType == '01') {
                            /** 出荷区分は「01:返品取消」の場合 */
                            if (objCurrentBlackFourLayersInfo) {
                                strBlackOrderNo = objCurrentBlackFourLayersInfo.customerOrderNo;
                            }
                        } else {
                            if (objCurrentBlackTwoLayersInfo) {
                                strBlackOrderNo = objCurrentBlackTwoLayersInfo.createdFromCustomerOrderNo;
                            }
                        }
    
                        if (strBlackOrderNo && strBlackOrderNo.length > 8) {
                            strBlackOrderNo = strBlackOrderNo.slice(0, 8);
                        }
    
                        /**
                         * 明細行レコード元データ（黒伝票）
                         * @type {object}
                         */
                        let objBlackOrderLineData = {
                            // データシリアルNo.
                            serialNumber: numDataSerialNumber,
                            // 伝票行No
                            lineNumber: index + 1,
                            // 商品コード
                            itemCode: (
                                finetItemCodeMapping.hasOwnProperty(strBlackTmpKey.toString())
                                    ? finetItemCodeMapping[(strBlackTmpKey.toString())]
                                    : objCurrentBlackData.getValue({ name: 'upccode', join: 'item' })
                            ),
                            // 商品名（カナ）
                            itemNameKana: objCurrentBlackData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // 数量
                            orderQuantity: numBlackOrderQuantity,
                            // 入数
                            unitQuantity: objCurrentBlackData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 数量(標準)
                            quantity: Math.abs(objCurrentBlackData.getValue({ name: 'quantity' })),
                            // 単位
                            unit: strBlackUnit,
                            // 単価
                            rate: objCurrentBlackData.getValue({ name: 'rate' }),
                            // アイテム.DJ_入り数(入り目)
                            itemUnitQuantity: objCurrentBlackData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 請求締日
                            billingCloseDate: formatDate(objCurrentBlackData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_納品書明細備考
                            deliveryNoteMemo: objCurrentBlackData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // 発注No.
                            orderNo: strBlackOrderNo,
                            // 商品コード使用区分
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strBlackTmpKey.toString()) ? '1' : '3')
                        };
        
                        arrBlackOrderLineRecords.push(createFinetShippingLineRecord(objBlackOrderLineData));
        
                        // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 エンドレコード.レコード件数
                        numEndRecordRecordCount++;
                        // データシリアル番号
                        numDataSerialNumber++;
                      
                        // 8.4 エンドレコード.生版金額合計
                        if (Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strBlackShippingType) >= 0 && Number(strBlackShippingType) <= 9) || Number(strBlackShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentBlackData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentBlackData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                            }
        
                        } else {
                            if ((Number(strBlackShippingType) >= 0 && Number(strBlackShippingType) <= 9) || Number(strBlackShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                    });
        
                    let objBlackOrderJson = {
                        orderHeaderRecord: objBlackOrderHeaderJson,
                        orderHeaderOptionalRecord1: objBlackOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objBlackOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objBlackOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objBlackOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objBlackOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objBlackOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objBlackOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objBlackOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objBlackOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objBlackOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrBlackOrderLineRecords
                    };
    
                    if (objBlackOrderHeaderOptionalJson1 == null || objBlackOrderHeaderOptionalJson1 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objBlackOrderHeaderOptionalSubJson1 == null || objBlackOrderHeaderOptionalSubJson1 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord1;
                    }
        
                    if (objBlackOrderHeaderOptionalJson2 == null || objBlackOrderHeaderOptionalJson2 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord2;
                    }
        
                    if (objBlackOrderHeaderOptionalSubJson2 == null || objBlackOrderHeaderOptionalSubJson2 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord2;
                    }
        
                    if (objBlackOrderHeaderOptionalJson3 == null || objBlackOrderHeaderOptionalJson3 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord3;
                    }
        
                    if (objBlackOrderHeaderOptionalSubJson3 == null || objBlackOrderHeaderOptionalSubJson3 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord3;
                    }
        
                    if (objBlackOrderHeaderOptionalJson4 == null || objBlackOrderHeaderOptionalJson4 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord4;
                    }
        
                    if (objBlackOrderHeaderOptionalSubJson4 == null || objBlackOrderHeaderOptionalSubJson4 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord4;
                    }
        
                    if (objBlackOrderHeaderOptionalJson5 == null || objBlackOrderHeaderOptionalJson5 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord5;
                    }
        
                    if (objBlackOrderHeaderOptionalSubJson5 == null || objBlackOrderHeaderOptionalSubJson5 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord5;
                    }
    
                    arrOrderRecords.push(objBlackOrderJson);
                } catch (error) {
                    log.error({
                        title: '出荷案内-黒伝票データ-処理エラー',
                        details: '【トランザクション番号】: ' + arrCurrentBlackData[0].getValue({name: 'tranid'}) + '\n【エラー】: ' + error
                    });
                }
            }
    
            /**
             * エンドレコード元データ
             * @type {object}
             */
            let objEndData = {
                // データシリアルNo
                serialNumber: numDataSerialNumber,
                // レコード件数
                recordCount: numEndRecordRecordCount,
                // 生販金額合計
                rawVersionTotalAmount: Math.round(amountEndRecordRawVersionTotal),
                // 割戻金額合計
                rebateTotalAmount: amountEndRecordRebateTotal,
                // 回収容器金額合計
                recoverContainerTotalAmount: amountEndRecordRecoverContainerTotal
            };
            const objEndJson = createFinetShippingEndRecord(objEndData);
    
            // 1.19 ファイルヘッダーレコード.送信データ件数 計数
            numFileHeaderRecordSendDataCount++;
            // データシリアル番号
            numDataSerialNumber++;
    
            // 1.19 ファイルヘッダーレコード.送信データ件数
            objFileHeaderJson.sendDataCount = ('000000' + numFileHeaderRecordSendDataCount).slice(-6);
    
            if (arrOrderRecords.length <= 0) {
                /** 有効なデータがない場合 */
                continue;
            }

            objResult = {
                fileHeaderRecord: objFileHeaderJson,
                orderRecords: arrOrderRecords,
                endRecord: objEndJson
            };
    
            arrResults.push(objResult);
        }
    
        log.audit({
            title: 'getFinetShippingJson - objTransactionIds',
            details: JSON.stringify(objTransactionIds)
        });
    
        if (objTransactionIds.invoiceIds.length > 0 || objTransactionIds.creditMemoIds.length > 0 || objTransactionIds.salesOrderIds.length > 0) {
            var updateTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_djkk_mr_finet',
                deploymentId: 'customdeploy_djkk_mr_finet_sales_order',
                params: {
                    custscript_djkk_mr_finet_target_ids: JSON.stringify(objTransactionIds)
                }
            });
            updateTask.submit();
        }
        log.audit({
            title: 'getFinetShippingJSON - end',
            details: JSON.stringify(new Date())
        });
        return arrResults;
    }

    /**
     * FINET連携_請求用データ取得
     * @returns {Array} 結果請求データ
     */
    function getFinetInvoiceJSON() {
        log.audit({
            title: 'getFinetInvoiceJSON - start',
            details: JSON.stringify(new Date())
        });
        /**
         * FINET_請求データ
         * @type {Array}
         */
        var arrResults = [];

        /**
         * 更新対象トランザクション内部ID
         * @typedef {object} objTransactionIds
         * @param {Array} objTransactionIds.invoiceIds 更新対象請求書ID配列
         * @param {Array} objTransactionIds.creditMemoIds 更新対象クレジットメモID配列
         */
        let objTransactionIds = {
            invoiceIds: [],
            creditMemoIds: []
        };

        /**
         * システム日時（日本時間）
         * @type {Date}
         */
        const systemDateTime = getJapanDateTime();
        /**
         * システム日付（日本時間）YYYYMMDD
         * @type {string}
         */
        const strSystemDate = systemDateTime.getFullYear() + ('00' + (systemDateTime.getMonth() + 1)).slice(-2) + ('00' + systemDateTime.getDate()).slice(-2);
        /**
         * システム時間（日本時間）HHmmSS
         * @type {string}
         */
        const strSystemTime = ('00' + systemDateTime.getHours()).slice(-2) + ('00' + systemDateTime.getMinutes()).slice(-2) + ('00' + systemDateTime.getSeconds()).slice(-2);

        const objLocationInfo = getLocationInfo();

        /**
         * 請求データ（通常出荷）
         * @type {object}
         */
        var datas = getFinetInvoiceNormalDatas();
        /**
         * 請求データ（赤伝）
         * @type {object}
         */
        var objRedData = getFinetInvoiceRedData();
        /**
         * 請求データ（黒伝）
         * @type {object}
         */
        var objBlackData = getFinetInvoiceBlackData();

        var finetItemCodeMapping = getFinetItemCodeMapping(true);
        var unitCodeByItem = getUnitCodeByItem();

        var commonTypeCodeById = getCommonTypeCodeById();

        // 1.19 ファイルヘッダーレコード.送信データ件数
        let numFileHeaderRecordSendDataCount = 0;
        // 8.3 エンドレコード.レコード件数
        let numEndRecordRecordCount = 0;
        // 8.4 エンドレコード.生版金額合計
        let amountEndRecordRawVersionTotal = 0;
        // 8.5 エンドレコード.割戻金額合計
        let amountEndRecordRebateTotal = 0;
        // 8.6 エンドレコード.回収容器金額合計
        let amountEndRecordRecoverContainerTotal = 0;
        // 8.9  標準税率適用合計金額
        let endRecordNormalTaxApplyAmount = 0;
        // 8.10  軽減税率適用合計金額
        let endRecordReducedTaxApplyAmount = 0;
        // 8.11  消費税額(標準税率適用)
        let endRecordNormalTaxAmount = 0;
        // 8.12  消費税額(軽減税率適用)
        let endRecordReducedTaxAmount = 0;
        // 8.13  非課税適用合計金額
        let endRecordNoTaxApplyAmount = 0;
        // データシリアル番号
        let numDataSerialNumber = 1;

        let arrFinalDestinationCodes = [];
        Object.keys(datas).map(function (strNormalFinalDestinationCode) {
            if (arrFinalDestinationCodes.indexOf(strNormalFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strNormalFinalDestinationCode.toString());
            }
        });

        Object.keys(objRedData).map(function (strRedFinalDestinationCode) {
            if (arrFinalDestinationCodes.indexOf(strRedFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strRedFinalDestinationCode.toString());
            }
        });

        Object.keys(objBlackData).map(function (strBlackFinalDestinationCode) {
            if (arrFinalDestinationCodes.indexOf(strBlackFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strBlackFinalDestinationCode.toString());
            }
        });

        let objAllDatasByDestinationCode = groupOriginDatas(datas, objRedData, objBlackData);

        /** 赤伝票処理用マスタ情報取得 start */

        /**
         * クレジットメモ作成元ID（二階層）
         * クレジットメモ.作成元（請求書）.作成元（注文書）
         * クレジットメモ.作成元（返品）.作成元（請求書）
         * @type {Array}
         */
        let arrRedTwoLayersCreatedFromIds = [];

        /** 赤伝票データ.作成元.作成元内部IDを取得し整理する */
        Object.keys(objAllDatasByDestinationCode).forEach(function(finalDestinationCode) {
            let objCurrentCodeRedData = objAllDatasByDestinationCode[finalDestinationCode.toString()]['red'];
            
            Object.keys(objCurrentCodeRedData).forEach(function(creditMemoId) {
                if (objCurrentCodeRedData[creditMemoId].length > 0) {
                    var tmpCreateFromInvoiceId = objCurrentCodeRedData[creditMemoId][0].getValue({ name: 'createdfrom', join: 'createdfrom' });
                    if (arrRedTwoLayersCreatedFromIds.indexOf(tmpCreateFromInvoiceId.toString()) < 0 && tmpCreateFromInvoiceId) {
                        arrRedTwoLayersCreatedFromIds.push(tmpCreateFromInvoiceId.toString());
                    }
                }
            });
        });

        /**
         * クレジットメモ作成元情報（二階層）
         * クレジットメモ.作成元（請求書）.作成元（注文書）.xxx
         * クレジットメモ.作成元（返品）.作成元（請求書）.xxx
         * @type {object}
         */
        let objRedTwoLayersCreatedFromInfos = {};

        if (arrRedTwoLayersCreatedFromIds.length > 0) {
            let arrRedTwoLayersCreatedFromFilters = [];
            let arrRedTwoLayersCreatedFromIdFilters = [];

            arrRedTwoLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrRedTwoLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrRedTwoLayersCreatedFromIds.length - 1) {
                    arrRedTwoLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrRedTwoLayersCreatedFromFilters.push(arrRedTwoLayersCreatedFromIdFilters);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);
            
            let arrRedTwoLayersCreatedFromColumns = [];
            /** DJ_注文方法区分.DJ_区分コード */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'}));
            /** トランザクション番号 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'transactionnumber'}));
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}));
            /** DJ_先方発注番号 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno'}));
            /** 作成元注文書.DJ_先方発注番号 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}));
            /** 作成元 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom'}));
            /** DJ_FINETカナ社名・店名・取引先名 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername'}));
            /** DJ_FINETカナ社名・店名・取引先名_option2 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2'}));
            /** DJ_FINETカナ社名・店名・取引先名_option3 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3'}));
            /** DJ_FINETカナ社名・店名・取引先名_option4 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4'}));
            /** DJ_FINETカナ社名・店名・取引先名_option5 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5'}));
            /** 作成元.DJ_FINETカナ社名・店名・取引先名 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}));
            /** 作成元.DJ_FINETカナ社名・店名・取引先名_option2 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}));
            /** 作成元.DJ_FINETカナ社名・店名・取引先名_option3 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}));
            /** 作成元.DJ_FINETカナ社名・店名・取引先名_option4 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}));
            /** 作成元.DJ_FINETカナ社名・店名・取引先名_option5 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}));
            // DJ_FINETカナ住所
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanacustomeraddress'});
            // DJ_FINETカナ住所_option2
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option2'});
            // DJ_FINETカナ住所_option3
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option3'});
            // DJ_FINETカナ住所_option4
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option4'});
            // DJ_FINETカナ住所_option5
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option5'});
            // 作成元.DJ_FINETカナ住所
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'});
            // 作成元.DJ_FINETカナ住所_option2
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'});
            // 作成元.DJ_FINETカナ住所_option3
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'});
            // 作成元.DJ_FINETカナ住所_option4
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'});
            // 作成元.DJ_FINETカナ住所_option5
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'});
            
            let arrRedTwoLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrRedTwoLayersCreatedFromFilters, arrRedTwoLayersCreatedFromColumns);
    
            arrRedTwoLayersCreatedFromResults.forEach(function(tmpResult) {
                
                objRedTwoLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    createdFrom: tmpResult.getValue({name: 'createdfrom'}),
                    // DJ_注文方法区分.区分コード
                    orderMethodTypeCode: tmpResult.getValue({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'}),
                    // トランザクション番号
                    transactionNumber: tmpResult.getValue({name: 'transactionnumber'}),
                    // 作成元.注文方法
                    createdFromOrderMethodType: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}),
                    // DJ_先方発注番号
                    customerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno'}),
                    // 作成元注文書.DJ_先方発注番号
                    createdFromCustomerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername'}),
                    // DJ_FINETカナ社名・店名・取引先名_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2'}),
                    // DJ_FINETカナ社名・店名・取引先名_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3'}),
                    // DJ_FINETカナ社名・店名・取引先名_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4'}),
                    // DJ_FINETカナ社名・店名・取引先名_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5'}),
                    // 作成元.DJ_FINETカナ社名・店名・取引先名
                    createdFromCustomerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ社名・店名・取引先名_option2
                    createdFromCustomerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ社名・店名・取引先名_option3
                    createdFromCustomerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ社名・店名・取引先名_option4
                    createdFromCustomerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ社名・店名・取引先名_option5
                    createdFromCustomerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}),
                    // DJ_FINETカナ住所
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress'}),
                    // DJ_FINETカナ住所_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2'}),
                    // DJ_FINETカナ住所_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3'}),
                    // DJ_FINETカナ住所_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4'}),
                    // DJ_FINETカナ住所_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5'}),
                    // 作成元.DJ_FINETカナ住所
                    createdFromAddress1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ住所_option2
                    createdFromAddress2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ住所_option3
                    createdFromAddress3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ住所_option4
                    createdFromAddress4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}),
                    // 作成元.DJ_FINETカナ住所_option5
                    createdFromAddress5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'})
                };
            });
        }

        /** 赤伝票処理用マスタ情報取得 end */

        /** 黒伝票処理用マスタ情報取得 start */

        /**
         * 請求書作成元ID（二階層）
         * 請求書.DJ_クレジットメモ.作成元（請求書）
         * 請求書.DJ_クレジットメモ.作成元（返品）
         * @type {Array}
         */
        let arrBlackTwoLayersCreatedFromIds = [];

        Object.keys(objAllDatasByDestinationCode).map(function (tmpDestinationCode) {
            Object.keys(objAllDatasByDestinationCode[tmpDestinationCode]['black']).map(function (tmpBlackInvoiceId) {
                let tmpBlackCreatedFromId = objAllDatasByDestinationCode[tmpDestinationCode]['black'][tmpBlackInvoiceId][0].getValue({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' });

                if (tmpBlackCreatedFromId && arrBlackTwoLayersCreatedFromIds.indexOf(tmpBlackCreatedFromId.toString()) < 0) {
                    arrBlackTwoLayersCreatedFromIds.push(tmpBlackCreatedFromId.toString());
                }
            });
        });

        /**
         * 請求書作成元ID（四階層）
         * 請求書.DJ_クレジットメモ.作成元（返品）.作成元（請求書）.作成元（注文書）
         * @type {Array}
         */
        let arrBlackFourLayersCreatedFromIds = [];

        /**
         * 請求書作成元情報（二階層）
         * 請求書.DJ_クレジットメモ.作成元（請求書）.xxx
         * 請求書.DJ_クレジットメモ.作成元（返品）.xxx
         * @type {object}
         */
        let objBlackTwoLayersCreatedFromInfos = {};

        if (arrBlackTwoLayersCreatedFromIds.length > 0) {
            let arrBlackTwoLayersCreatedFromFilters = [];
            let arrBlackTwoLayersCreatedFromIdFilters = [];
            arrBlackTwoLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrBlackTwoLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrBlackTwoLayersCreatedFromIds.length - 1) {
                    arrBlackTwoLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrBlackTwoLayersCreatedFromFilters.push(arrBlackTwoLayersCreatedFromIdFilters);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);

            let arrBlackTwoLayersCreatedFromColumns = [];
            // 作成元
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom'}));
            // 作成元.作成元
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom', join: 'createdfrom'}));
            // 作成元.トランザクション番号
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'transactionnumber', join: 'createdfrom'}));
            // 作成元.注文方法区分
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}));
            // 作成元.DJ_先方発注番号
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}));
            // DJ_FINETカナ社名・店名・取引先名
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}));
            // DJ_FINETカナ社名・店名・取引先名_option2
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}));
            // DJ_FINETカナ社名・店名・取引先名_option3
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}));
            // DJ_FINETカナ社名・店名・取引先名_option4
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}));
            // DJ_FINETカナ社名・店名・取引先名_option5
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}));
            // DJ_FINETカナ住所
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}));
            // DJ_FINETカナ住所_option2
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}));
            // DJ_FINETカナ住所_option3
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}));
            // DJ_FINETカナ住所_option4
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}));
            // DJ_FINETカナ住所_option5
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'}));

            let arrBlackTwoLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrBlackTwoLayersCreatedFromFilters, arrBlackTwoLayersCreatedFromColumns);

            arrBlackTwoLayersCreatedFromResults.forEach(function(tmpResult) {
                
                objBlackTwoLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    fourLayersCreatedFrom: tmpResult.getValue({name: 'createdfrom', join: 'createdfrom'}),
                    // 作成元
                    createdFrom: tmpResult.getValue({name: 'createdfrom'}),
                    // DJ_注文方法区分
                    orderMethodTyp: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}),
                    // 作成元.トランザクション番号
                    createdFromTransactionNumber: tmpResult.getValue({name: 'transactionnumber', join: 'createdfrom'}),
                    // 作成元.DJ_先方発注番号
                    createdFromCustomerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}),
                    // DJ_FINETカナ社名・店名・取引先名_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}),
                    // DJ_FINETカナ住所
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}),
                    // DJ_FINETカナ住所_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}),
                    // DJ_FINETカナ住所_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}),
                    // DJ_FINETカナ住所_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}),
                    // DJ_FINETカナ住所_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'})
                };

                /** 作成元ID（四階層）取得し整理する */
                let numBlackResultCreatedFromId = tmpResult.getValue({name: 'createdfrom', join: 'createdfrom'});
                if (numBlackResultCreatedFromId && arrBlackFourLayersCreatedFromIds.indexOf(numBlackResultCreatedFromId.toString()) < 0) {
                    arrBlackFourLayersCreatedFromIds.push(numBlackResultCreatedFromId.toString());
                }
            });
        }

        /**
         * 請求書作成元情報（四階層）
         * 請求書.DJ_クレジットメモ.作成元（返品）.作成元（請求書）.作成元（注文書）.xxx
         */
        let objBlackFourLayersCreatedFromInfos = {};

        if (arrBlackFourLayersCreatedFromIds.length > 0) {
            let arrBlackFourLayersCreatedFromFilters = [];
            let arrBlackFourLayersCreatedFromIdFilters = [];
            arrBlackFourLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrBlackFourLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrBlackFourLayersCreatedFromIds.length - 1) {
                    arrBlackFourLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrBlackFourLayersCreatedFromFilters.push(arrBlackFourLayersCreatedFromIdFilters);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);

            let arrBlackFourLayersCreatedFromColumns = [];
            /** DJ_注文方法区分 */
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp'}));
            /** DJ_先方発注番号 */
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno'}));
            // DJ_FINETカナ社名・店名・取引先名
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername'}));
            // DJ_FINETカナ社名・店名・取引先名_option2
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2'}));
            // DJ_FINETカナ社名・店名・取引先名_option3
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3'}));
            // DJ_FINETカナ社名・店名・取引先名_option4
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4'}));
            // DJ_FINETカナ社名・店名・取引先名_option5
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5'}));
            // DJ_FINETカナ住所
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomeraddress'}));
            // DJ_FINETカナ住所_option2
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option2'}));
            // DJ_FINETカナ住所_option3
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option3'}));
            // DJ_FINETカナ住所_option4
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option4'}));
            // DJ_FINETカナ住所_option5
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option5'}));
    
            let arrBlackFourLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrBlackFourLayersCreatedFromFilters, arrBlackFourLayersCreatedFromColumns);
            arrBlackFourLayersCreatedFromResults.forEach(function(tmpResult) {
                objBlackFourLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    // DJ_注文方法区分
                    orderMethodTyp: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp'}),
                    // DJ_先方発注番号
                    customerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno'}),
                    // DJ_FINETカナ社名・店名・取引先名
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername'}),
                    // DJ_FINETカナ社名・店名・取引先名_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2'}),
                    // DJ_FINETカナ社名・店名・取引先名_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3'}),
                    // DJ_FINETカナ社名・店名・取引先名_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4'}),
                    // DJ_FINETカナ社名・店名・取引先名_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5'}),
                    // DJ_FINETカナ住所
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress'}),
                    // DJ_FINETカナ住所_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2'}),
                    // DJ_FINETカナ住所_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3'}),
                    // DJ_FINETカナ住所_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4'}),
                    // DJ_FINETカナ住所_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5'})
                };
            });
        }
        
        /** 黒伝票処理用マスタ情報取得 end */

        for (let finalDestinationCode in objAllDatasByDestinationCode) {

            /** 変数リセット */
            numFileHeaderRecordSendDataCount = 0;
            numEndRecordRecordCount = 0;
            // 8.4 エンドレコード.生版金額合計
            amountEndRecordRawVersionTotal = 0;
            // 8.6 エンドレコード.回収容器金額合計
            amountEndRecordRecoverContainerTotal = 0;
            // 8.9  標準税率適用合計金額
            endRecordNormalTaxApplyAmount = 0;
            // 8.10  軽減税率適用合計金額
            endRecordReducedTaxApplyAmount = 0;
            // 8.11  消費税額(標準税率適用)
            endRecordNormalTaxAmount = 0;
            // 8.12  消費税額(軽減税率適用)
            endRecordReducedTaxAmount = 0;
            // 8.13  非課税適用合計金額
            endRecordNoTaxApplyAmount = 0;
            // データシリアル番号
            numDataSerialNumber = 1;

            /**
             * 該当最終送信先コード通常データ
             * @type {object} 
             * @param {string} key トランザクション内部ID
             * @param {object} value データ
             */
            var objCurrentDestinationNormalData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].normal;
            /**
             * 該当最終送信先コード黒データ
             * @type {object} 
             * @param {string} key トランザクション内部ID
             * @param {object} value データ
             */
            var objCurrentDestinationBlackData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].black;

            /**
             * 該当最終送信先コード赤データ
             * @type {object} 
             * @param {string} key トランザクション内部ID
             * @param {object} value データ
             */
            var objCurrentDestinationRedData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].red;

            /**
             * ファイルヘッダーレコード元データは通常伝票であるか
             * @type {boolean}
             */
            var flgIsNormalData = false;

            /**
             * 注文方法区分はFINETであるか
             * @type {boolean}
             */
            var flgIsOrderMethodFinet = false;
            /**
             * ファイルヘッダーレコード元データ
             */
            var objFileHeaderSearchResult = '';

            /**
             * データの内一件目データのID
             * @type {string}
             */
            var strFirstDataId = '';

            if (Object.keys(objCurrentDestinationNormalData).length > 0) {
                flgIsNormalData = true;
                strFirstDataId = Object.keys(objCurrentDestinationNormalData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationNormalData[strFirstDataId][0];
                flgIsOrderMethodFinet = (objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
            } else if (Object.keys(objCurrentDestinationRedData).length > 0) {
                strFirstDataId = Object.keys(objCurrentDestinationRedData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationRedData[strFirstDataId][0];
            } else if (Object.keys(objCurrentDestinationBlackData).length > 0) {
                strFirstDataId = Object.keys(objCurrentDestinationBlackData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationBlackData[strFirstDataId][0];
            } else {
                continue;
            }

            /**
             * ファイルヘッダーレコード元データ
             * @type {object}
             */
            let objFileHeaderData = {
                /** データシリアルNo. */
                serialNumber: numDataSerialNumber,
                /** 出荷区分 */
                shippingType: '06',
                /** システム日付 */
                systemDate: strSystemDate,
                /** システム時刻 */
                systemTime: strSystemTime,
                /** DJ_注文方法区分 */
                orderMethod: objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }),
                /** 送信元センターコード */
                senderCenterCode: objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_final_dest_code', join: 'createdfrom' }),
                /** 最終送信先コード */
                finalDestinationCode: (
                    flgIsNormalData
                        ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' })
                        : objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                ),
                /** 最終送信先コード（予備） */
                finalDestinationCodeBk: (
                    flgIsNormalData
                        ? (flgIsOrderMethodFinet ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sendercentercode_s', join: 'createdfrom' }) : ' ')
                        : ' '
                ),
                /** 直接送信先企業コード */
                directDestinationCompanyCode: (
                    flgIsNormalData
                        ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' })
                        : objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                ),
                /** 直接送信先企業コード（予備） */
                directDestinationCompanyCodeBk: (
                    flgIsNormalData
                        ? (flgIsOrderMethodFinet ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sendercentercode_s', join: 'createdfrom' }) : ' ')
                        : ' '
                )
            };

            /**
             * ファイルヘッダレコード
             * @type {object}
             */
            const objFileHeaderJson = createFinetInvoiceFileHeaderRecord(objFileHeaderData, flgIsNormalData)

            // 1.19 ファイルヘッダーレコード.送信データ件数 計数
            numFileHeaderRecordSendDataCount++;

            // データシリアル番号
            numDataSerialNumber++;

            /**
             * 次店コード情報配列
             * @type {Array}
             */
            let arrStoreCodes = [];

            /**
             * 一次店コード
             * @type {string}
             */
            let strFirstStoreCode = '';

            /**
             * 二次店コード
             * @type {string}
             */
            let strSecondStoreCode = '';

            /**
             * 三次店コード
             * @type {string}
             */
            let strThirdStoreCode = '';

            /**
             * 四次店コード
             * @type {string}
             */
            let strForthStoreCode = '';

            /**
             * 五次店コード
             * @type {string}
             */
            let strFifthStoreCode = '';

            /**
             * 手形情報
             * @type {string}
             */
            let strBillsInfo = '';

            /**
             * 倉直区分
             * @type {string}
             */
            let strLocationType = '';

            /**
             * 伝票データ配列
             * @type {Array}
             */
            let arrOrderRecords = [];

            for (let strNormalDataId in objCurrentDestinationNormalData) {
                /** 通常データを処理 */

                if (objTransactionIds.invoiceIds.indexOf(strNormalDataId.toString()) < 0) {
                    objTransactionIds.invoiceIds.push(strNormalDataId.toString());
                }

                /**
                 * 該当内部ID分通常データ
                 * @type {Array}
                 */
                let arrCurrentNormalData = objCurrentDestinationNormalData[strNormalDataId];

                try {

                    /** 変数値リセット */
                    arrStoreCodes = [];
                    strBillsInfo = '';
                    strLocationType = '';
    
                    /** 一次店コード */
                    strFirstStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_first_store_code', join: 'createdfrom' });
                    /** 二次店コード */
                    strSecondStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_second_store_code', join: 'createdfrom' });
                    /** 三次店コード */
                    strThirdStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_third_store_code', join: 'createdfrom' });
                    /** 四次店コード */
                    strForthStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_fourth_store_code', join: 'createdfrom' });
                    /** 五次店コード */
                    strFifthStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_fifth_store_code', join: 'createdfrom' });
    
                    if (strFirstStoreCode != null && strFirstStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strFirstStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom' })
                        });
                    }
                    if (strSecondStoreCode != null && strSecondStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strSecondStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom' })
                        });
                    }
                    if (strThirdStoreCode != null && strThirdStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strThirdStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom' })
                        });
                    }
                    if (strForthStoreCode != null && strForthStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strForthStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom' })
                        });
                    }
                    if (strFifthStoreCode != null && strFifthStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strFifthStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom' })
                        });
                    }
    
                    // 手形情報
                    strBillsInfo = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_bills_info', join: 'createdfrom' });
                    if (strBillsInfo != null && strBillsInfo != '') {
                        strBillsInfo = commonTypeCodeById[(strBillsInfo.toString())];
                    }
                    // 倉直区分
                    strLocationType = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_location_type', join: 'createdfrom' });
                    if (strLocationType != null && strLocationType != '') {
                        strLocationType = commonTypeCodeById[(strLocationType.toString())];
                    }
    
                    // DJ_注文方法区分はFINETであるか
                    flgIsOrderMethodFinet = (arrCurrentNormalData[0].getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
                    
                    /**
                     * 出荷区分（通常）
                     * @type {string}
                     */
                    let strNormalShippingType = arrCurrentNormalData[0].getValue({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' });
                    if (strNormalDataId.indexOf('-discount') >= 0) {
                        strNormalShippingType = '60';
                    }
    
                    /**
                     * 伝票ヘッダーレコード元データ
                     * @type {object}
                     */
                    let objNormalOrderHeaderData = {
                        // データシリアルNo.
                        serialNumber: numDataSerialNumber,
                        // 出荷区分
                        shippingType: strNormalShippingType,
                        // 伝票日付
                        tranDate: arrCurrentNormalData[0].getValue({ name: 'trandate' }),
                        // 出荷日
                        shipDate: arrCurrentNormalData[0].getValue({ name: 'shipdate' }),
                        // 伝票番号
                        transactionNumber: arrCurrentNormalData[0].getValue({ name: 'transactionnumber' }),
                        // 補助伝票No.
                        auxiliaryOrderNo: '',
                        // 一次店コード
                        firstStoreCode: strFirstStoreCode,
                        // 二次店コード
                        secondStoreCode: strSecondStoreCode,
                        // 三次店コード
                        thirdStoreCode: strThirdStoreCode,
                        // 四次店コード
                        forthStoreCode: strForthStoreCode,
                        // 五次店コード
                        fifthStoreCode: strFifthStoreCode,
                        // 手形情報
                        billsInfo: (flgIsOrderMethodFinet ? strBillsInfo : ' '),
                        // 倉直区分
                        locationType: (flgIsOrderMethodFinet ? strLocationType : ' '),
                        // 倉庫コード
                        locationCode: (objLocationInfo.hasOwnProperty(arrCurrentNormalData[0].getValue({ name: 'location' }).toString()) ? objLocationInfo[(arrCurrentNormalData[0].getValue({ name: 'location' }).toString())].externalId.slice(1, 3) : '')
                    };
    
                    /**
                     * 伝票ヘッダーレコード
                     * @type {object}
                     */
                    const objNormalOrderHeaderJson = createFinetInvoiceOrderHeaderRecord(objNormalOrderHeaderData);
    
                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                    numFileHeaderRecordSendDataCount++;
                    // データシリアル番号
                    numDataSerialNumber++;
    
                    /**
                     * 伝票ヘッダーオプションレコード1（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson1 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード1（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson1 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード2（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson2 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード2（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson2 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード3（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson3 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード3（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson3 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード4（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson4 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード4（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson4 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード5（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson5 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード5（通常）
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson5 = null;
    
                    if (flgIsOrderMethodFinet) {
                        /** 注文方法区分は「FINET」である場合 */
    
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjNormalOrderHeaderOptionalJson = createFinetInvoiceOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: index + 1,
                                // 社名・店名・取引先名
                                customerName: tmpStoreCodeInfo['customerName'],
                                // 住所
                                customerAddress: tmpStoreCodeInfo['address'],
                                // 取引先対応コード
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
    
                            if (tmpObjNormalOrderHeaderOptionalJson != null && tmpObjNormalOrderHeaderOptionalJson != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
    
                            let tmpObjNormalOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjNormalOrderHeaderOptionalSubJson = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                                if (tmpObjNormalOrderHeaderOptionalSubJson != null && tmpObjNormalOrderHeaderOptionalSubJson != '') {
                                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                    numFileHeaderRecordSendDataCount++;
                                    // データシリアル番号
                                    numDataSerialNumber++;
                                }
                            }
    
                            switch (index) {
                                case 0:
                                    objNormalOrderHeaderOptionalJson1 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson1 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objNormalOrderHeaderOptionalJson2 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson2 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objNormalOrderHeaderOptionalJson3 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson3 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objNormalOrderHeaderOptionalJson4 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson4 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objNormalOrderHeaderOptionalJson5 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson5 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objNormalOrderHeaderOptionalJson1 = createFinetInvoiceOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: arrStoreCodes.length,
                                // 社名・店名・取引先名
                                customerName: arrCurrentNormalData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // 住所
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // 取引先対応コード
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
    
                            if (objNormalOrderHeaderOptionalJson1 != null && objNormalOrderHeaderOptionalJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
    
                            objNormalOrderHeaderOptionalSubJson1 = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                            if (objNormalOrderHeaderOptionalSubJson1 != null && objNormalOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
                        }
                    }
    
                    /**
                     * 伝票明細行レコード（通常）JSON配列
                     * @type {Array}
                     */
                    let arrNormalOrderLineRecords = [];
    
                    arrCurrentNormalData.forEach(function (objCurrentNormalData, index) {
    
                        /**
                         * 明細.アイテム内部ID
                         * @type {number}
                         */
                        let numCurrentNormalItemInternalId = objCurrentNormalData.getValue({ name: 'item' });
    
                        /**
                         * 明細.アイテム.アイテムID
                         * @type {string}
                         */
                        let strCurrentNormalItemId = objCurrentNormalData.getValue({ name: 'itemid', join: 'item' });
    
                        /**
                         * 明細.アイテム.UPCコード
                         * @type {string}
                         */
                        let strCurrentNormalUpcCd = objCurrentNormalData.getValue({ name: 'upccode', join: 'item' });
    
                        let strTmpKey = [
                            strCurrentNormalItemId,
                            objCurrentNormalData.getValue({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' })
                        ].join('-');
    
                        let strCurrentNormalUnit = objCurrentNormalData.getValue({ name: 'unit' });
                        if (numCurrentNormalItemInternalId != null && numCurrentNormalItemInternalId != '') {
                            strCurrentNormalUnit = unitCodeByItem[(numCurrentNormalItemInternalId.toString())];
                        }
                        let numCurrentNormalOrderQuantity = Math.abs(objCurrentNormalData.getValue({ name: 'quantity' }));
                        if (strCurrentNormalUnit == '3') {
                            // バラの場合
                            numCurrentNormalOrderQuantity = Math.abs(objCurrentNormalData.getValue({ name: 'quantity' }));
                        }
                        if (strCurrentNormalUnit == '1') {
                            numCurrentNormalOrderQuantity = Math.ceil(Math.abs(Number(objCurrentNormalData.getValue({ name: 'quantity' }))) / Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
    
                        let strNormalLineNo = objCurrentNormalData.getValue({ name: 'custcol_djkk_exsystem_line_num' });
                        if (strNormalDataId.indexOf('-discount') >= 0) {
                            /** 値引アイテム行の場合 */
                            strNormalLineNo = index + 1;
                        }
                        
                        strNormalLineNo = strNormalLineNo.toString();
    
                        /**
                         * 明細行レコード元データ
                         * @type {object}
                         */
                        let objNormalOrderLineData = {
                            // データシリアルNo.
                            serialNumber: numDataSerialNumber,
                            // 伝票行No
                            lineNumber: strNormalLineNo,
                            // 商品コード
                            itemCode: (finetItemCodeMapping.hasOwnProperty(strTmpKey.toString()) ? finetItemCodeMapping[(strTmpKey.toString())] : strCurrentNormalUpcCd),
                            // 商品名（カナ）
                            itemNameKana: objCurrentNormalData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // 数量
                            orderQuantity: numCurrentNormalOrderQuantity,
                            // 入数
                            unitQuantity: objCurrentNormalData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 数量(標準)
                            quantity: Math.abs(objCurrentNormalData.getValue({ name: 'quantity' })),
                            // 単位
                            unit: strCurrentNormalUnit,
                            // 単価
                            rate: objCurrentNormalData.getValue({ name: 'rate' }),
                            // .DJ_入数
                            itemUnitQuantity: objCurrentNormalData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 請求締日
                            billingCloseDate: formatDate(objCurrentNormalData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_納品書明細備考
                            deliveryNoteMemo: objCurrentNormalData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // 発注No.
                            orderNo: (flgIsOrderMethodFinet ? objCurrentNormalData.getValue({ name: 'custbody_djkk_customerorderno' }) : objCurrentNormalData.getValue({ name: 'custbody_djkk_customerorderno' }).slice(0, 8)),
                            // 商品コード使用区分
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strTmpKey.toString()) ? '1' : '3')
                        };
    
                        arrNormalOrderLineRecords.push(createFinetInvoiceLineRecord(objNormalOrderLineData));
    
                        // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 エンドレコード.レコード件数
                        numEndRecordRecordCount++;
                        // データシリアル番号
                        numDataSerialNumber++;
    
                        // 8.4 エンドレコード.生版金額合計
                        if (Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strNormalShippingType) >= 0 && Number(strNormalShippingType) <= 9) || Number(strNormalShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentNormalData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentNormalData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentNormalData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentNormalData.getValue({ name: 'quantity' })));
                            }
                        } else {
                            if ((Number(strNormalShippingType) >= 0 && Number(strNormalShippingType) <= 9) || Number(strNormalShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                      
                        /**
                         * 明細.税率
                         * @type {string}
                         */
                        let strCurrentNormalTaxRate = objCurrentNormalData.getValue({ name: 'rate', join: 'taxitem' });
    
                        if (strCurrentNormalTaxRate == '10.00%') {
                            // 8.9 標準税率適用合計金額
                            endRecordNormalTaxApplyAmount += Number(objCurrentNormalData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentNormalTaxRate == '8.00%') {
                            // 8.10 軽減税率適用合計金額
                            endRecordReducedTaxApplyAmount += Number(objCurrentNormalData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentNormalTaxRate == '10.00%') {
                            // 8.11 消費税額(標準税率適用)
                            endRecordNormalTaxAmount += Number(objCurrentNormalData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentNormalTaxRate == '8.00%') {
                            // 8.12 消費税額(軽減税率適用)
                            endRecordReducedTaxAmount += Number(objCurrentNormalData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentNormalTaxRate == '0.00%') {
                            // 8.13 非課税適用合計金額
                            endRecordNoTaxApplyAmount += Number(objCurrentNormalData.getValue({ name: 'amount' }));
                        }
                    });
    
                    /**
                     * 伝票データJSON
                     * @type {object}
                     */
                    let objNormalOrderJson = {
                        orderHeaderRecord: objNormalOrderHeaderJson,
                        orderHeaderOptionalRecord1: objNormalOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objNormalOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objNormalOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objNormalOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objNormalOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objNormalOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objNormalOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objNormalOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objNormalOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objNormalOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrNormalOrderLineRecords
                    }
    
                    if (objNormalOrderHeaderOptionalJson1 == null || objNormalOrderHeaderOptionalJson1 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objNormalOrderHeaderOptionalSubJson1 == null || objNormalOrderHeaderOptionalSubJson1 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord1;
                    }
    
                    if (objNormalOrderHeaderOptionalJson2 == null || objNormalOrderHeaderOptionalJson2 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord2;
                    }
    
                    if (objNormalOrderHeaderOptionalSubJson2 == null || objNormalOrderHeaderOptionalSubJson2 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord2;
                    }
    
                    if (objNormalOrderHeaderOptionalJson3 == null || objNormalOrderHeaderOptionalJson3 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord3;
                    }
    
                    if (objNormalOrderHeaderOptionalSubJson3 == null || objNormalOrderHeaderOptionalSubJson3 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord3;
                    }
    
                    if (objNormalOrderHeaderOptionalJson4 == null || objNormalOrderHeaderOptionalJson4 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord4;
                    }
    
                    if (objNormalOrderHeaderOptionalSubJson4 == null || objNormalOrderHeaderOptionalSubJson4 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord4;
                    }
    
                    if (objNormalOrderHeaderOptionalJson5 == null || objNormalOrderHeaderOptionalJson5 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord5;
                    }
    
                    if (objNormalOrderHeaderOptionalSubJson5 == null || objNormalOrderHeaderOptionalSubJson5 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord5;
                    }
    
                    arrOrderRecords.push(objNormalOrderJson);
                } catch (error) {
                    log.error({
                        title: '請求-通常データ-処理エラー',
                        details: '【トランザクション番号】: ' + arrCurrentNormalData[0].getValue({name: 'tranid'}) + '\n【エラー】: ' + error
                    });
                }
            }

            for (let strRedDataId in objCurrentDestinationRedData) {
                /** 赤伝票データ処理 */

                if (objTransactionIds.creditMemoIds.indexOf(strRedDataId.toString()) < 0) {
                    objTransactionIds.creditMemoIds.push(strRedDataId.toString());
                }

                /**
                 * 該当内部ID分赤伝票データ
                 * @type {Array}
                 */
                let arrCurrentRedData = objCurrentDestinationRedData[strRedDataId];

                try {

                    /** 変数値リセット */
                    arrStoreCodes = [];
                    strBillsInfo = '';
                    strLocationType = '';
    
                    /**
                     * 出荷区分（赤伝）
                     * @type {string}
                     */
                    let strRedShippingType = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' });
                    if (strRedDataId.indexOf('-discount') >= 0) {
                        /** 割引アイテムデータの場合 */
                        strRedShippingType = '61'
                    }
    
                    /**
                     * 該当処理データの作成元ID（二階層）
                     * クレジットメモ.作成元（請求書）.作成元（注文書）.xxx
                     * クレジットメモ.作成元（返品）.作成元（請求書）.xxx
                     * @type {number}
                     */
                    let numRedCurrentTwoLayersCreatedFromId = arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'});
                    /**
                     * 該当赤伝票データ作成元（二階層）情報
                     * @type {object}
                     */
                    let objCurrentRedDataTwoLayersCreatedFromInfo = null;
                    if (objRedTwoLayersCreatedFromInfos.hasOwnProperty(numRedCurrentTwoLayersCreatedFromId.toString())) {
                        objCurrentRedDataTwoLayersCreatedFromInfo = objRedTwoLayersCreatedFromInfos[numRedCurrentTwoLayersCreatedFromId.toString()];
                    }
    
                    /**
                     * 作成元注文書参照できるか
                     * @type {boolean}
                     */
                    let flgRedHasCreatedFromSalesOrder = false;
                    if (objCurrentRedDataTwoLayersCreatedFromInfo) {
                        flgRedHasCreatedFromSalesOrder = true;
                    }
    
                    /** 一次店コード */
                    strFirstStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' });
                    /** 二次店コード */
                    strSecondStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' });
                    /** 三次店コード */
                    strThirdStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' });
                    /** 四次店コード */
                    strForthStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' });
                    /** 五次店コード */
                    strFifthStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' });
    
                    if (flgRedHasCreatedFromSalesOrder) {
                        // 作成元注文書参照できる場合
    
                        if (strRedShippingType == '10') {
                            // 出荷区分は「10:返品」の場合
    
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName1,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName2,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName3,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName4,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName5,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress5,
                                });
                            }
                        } else {
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName1,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName2,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName3,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName4,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName5,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address5,
                                });
                            }
                        }
                    } else {
                        if (strFirstStoreCode != null && strFirstStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFirstStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strSecondStoreCode != null && strSecondStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strSecondStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strThirdStoreCode != null && strThirdStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strThirdStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strForthStoreCode != null && strForthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strForthStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strFifthStoreCode != null && strFifthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFifthStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                    }
    
                    /**
                     * 赤伝票補助伝票番号
                     * @type {string}
                     */
                    let strRedAuxiliaryOrderNo = '';
                    if (strRedShippingType == '10') {
                        // 出荷区分は返品である場合
                        if (objCurrentRedDataTwoLayersCreatedFromInfo) {
                            strRedAuxiliaryOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.transactionNumber != '' ? objCurrentRedDataTwoLayersCreatedFromInfo.transactionNumber[0] + objCurrentRedDataTwoLayersCreatedFromInfo.transactionNumber.slice(-7) : '';
                        }
                    } else {
                        if (arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' })) {
                            strRedAuxiliaryOrderNo = arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' })[0] + arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' }).slice(-7);
                        }
                    }
    
                    let strRedOrderMethodType = '';
                    if (strRedShippingType != '10') {
                        // クレジットメモ.DJ_FINET出荷区分は「10:返品」以外である場合
    
                        if (objRedTwoLayersCreatedFromInfos.hasOwnProperty(arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'}).toString())) {
                            strRedOrderMethodType = objRedTwoLayersCreatedFromInfos[(arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'}).toString())].orderMethodTypeCode;
                        } else {
                            strRedOrderMethodType = arrCurrentRedData[0].getValue({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'})
                        }
                    } else {
                        if (objRedTwoLayersCreatedFromInfos[(arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'}).toString())].createdFromOrderMethodType) {
                            // クレジットメモ.作成元返品.作成元請求書.作成元注文書が参照できる場合
                            strRedOrderMethodType = commonTypeCodeById[(objRedTwoLayersCreatedFromInfos[(arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'}).toString())].createdFromOrderMethodType.toString())];
                        } else {
                            strRedOrderMethodType = arrCurrentRedData[0].getValue({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'})
                        }
                    }
    
                    flgIsOrderMethodFinet = (strRedOrderMethodType == '1');
                    
                    /**
                     * 伝票ヘッダーレコード元データ（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderData = {
                        // データシリアルNo.
                        serialNumber: numDataSerialNumber,
                        // 出荷区分
                        shippingType: strRedShippingType,
                        // 伝票日付
                        tranDate: arrCurrentRedData[0].getValue({ name: 'trandate' }),
                        // 出荷日
                        shipDate: arrCurrentRedData[0].getValue({ name: 'trandate' }),
                        // 伝票番号
                        transactionNumber: arrCurrentRedData[0].getValue({ name: 'transactionnumber' }),
                        // 補助伝票No.
                        auxiliaryOrderNo: strRedAuxiliaryOrderNo,
                        // 一次店コード
                        firstStoreCode: strFirstStoreCode,
                        // 二次店コード
                        secondStoreCode: strSecondStoreCode,
                        // 三次店コード
                        thirdStoreCode: strThirdStoreCode,
                        // 四次店コード
                        forthStoreCode: strForthStoreCode,
                        // 五次店コード
                        fifthStoreCode: strFifthStoreCode,
                        // 手形情報
                        billsInfo: ' ',
                        // 倉直区分
                        locationType: ' ',
                        // 倉庫コード
                        locationCode: (arrCurrentRedData[0].getValue({ name: 'location' }) ? objLocationInfo[arrCurrentRedData[0].getValue({ name: 'location' }).toString()].externalId.slice(1, 3) : '')
                    };
    
                    /**
                     * 伝票ヘッダレコード（赤伝票）
                     * @type {object}
                     */
                    const objRedOrderHeaderJson = createFinetInvoiceOrderHeaderRecord(objRedOrderHeaderData);
    
                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                    numFileHeaderRecordSendDataCount++;
                    // データシリアル番号
                    numDataSerialNumber++;
    
                    /**
                     * 伝票ヘッダーオプションレコード1（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson1 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード1（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson1 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード2（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson2 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード2（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson2 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード3（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson3 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード3（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson3 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード4（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson4 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード4（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson4 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード5（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson5 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード5（赤伝票）
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson5 = null;
    
                    if (flgIsOrderMethodFinet) {
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjRedOrderHeaderOptionalJson = createFinetInvoiceOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: index + 1,
                                // 社名・店名・取引先名
                                customerName: tmpStoreCodeInfo['customerName'],
                                // 住所
                                customerAddress: tmpStoreCodeInfo['address'],
                                // 取引先対応コード
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
    
                            if (tmpObjRedOrderHeaderOptionalJson != null && tmpObjRedOrderHeaderOptionalJson != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
    
                            let tmpObjRedOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjRedOrderHeaderOptionalSubJson = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                                if (tmpObjRedOrderHeaderOptionalSubJson != null && tmpObjRedOrderHeaderOptionalSubJson != '') {
                                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                    numFileHeaderRecordSendDataCount++;
                                    // データシリアル番号
                                    numDataSerialNumber++;
                                }
                            }
    
                            switch (index) {
                                case 0:
                                    objRedOrderHeaderOptionalJson1 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson1 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objRedOrderHeaderOptionalJson2 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson2 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objRedOrderHeaderOptionalJson3 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson3 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objRedOrderHeaderOptionalJson4 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson4 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objRedOrderHeaderOptionalJson5 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson5 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objRedOrderHeaderOptionalJson1 = createFinetInvoiceOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: arrStoreCodes.length,
                                // 社名・店名・取引先名
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // 住所
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // 取引先対応コード
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
    
                            if (objRedOrderHeaderOptionalJson1 != null && objRedOrderHeaderOptionalJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
    
                            objRedOrderHeaderOptionalSubJson1 = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                            if (objRedOrderHeaderOptionalSubJson1 != null && objRedOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
                        }
                    }
    
                    /**
                     * 伝票明細行レコード（赤伝票）JSON配列
                     * @type {Array}
                     */
                    let arrRedOrderLineRecords = [];
    
                    arrCurrentRedData.map(function (objCurrentRedData, index) {
    
                        let strRedTmpKey = [
                            objCurrentRedData.getValue({ name: 'itemid', join: 'item' }),
                            objCurrentRedData.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                        ].join('-');
    
                        let strRedItemInternalId = objCurrentRedData.getValue({ name: 'item' });
                        let strRedUnit = '';
                        if (strRedItemInternalId) {
                            strRedUnit = unitCodeByItem[strRedItemInternalId.toString()];
                        }
    
                        let numRedOrderQuantity = 0 - Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                        if (strRedUnit == '3') {
                            numRedOrderQuantity = 0 - Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                        }
                        if (strRedUnit == '1') {
                            numRedOrderQuantity = 0 - Math.ceil(Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' }))) / Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
    
                        if (strRedShippingType == '11' || strRedShippingType == '10') {
                            // 出荷区分は「11:出荷取消（赤伝）」「10:返品」の場合
                            numRedOrderQuantity = 0 - Math.abs(numRedOrderQuantity);
                        } else {
                            numRedOrderQuantity = Math.abs(numRedOrderQuantity);
                        }
                        
                        /**
                         * 黒伝.発注No.
                         * @type {string}
                         */
                        let strRedOrderNo = '';
                        if (objCurrentRedDataTwoLayersCreatedFromInfo) {
                            if (strRedShippingType != '10') {
                                // 出荷区分は「10:返品」以外である場合
                                strRedOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.customerOrderNo;
                            } else {
                                strRedOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerOrderNo;
                            }
                        }
    
                        if (strRedOrderNo == null || strRedOrderNo == '') {
                            strRedOrderNo = arrCurrentRedData[0].getValue({name: 'custbody_djkk_customerorderno'});
                        }
    
                        if (strRedOrderNo.length > 8) {
                            strRedOrderNo = strRedOrderNo.slice(0, 8);
                        }
                        
                        /**
                         * 明細行レコード元データ（赤伝票）
                         * @type {object}
                         */
                        let objRedOrderLineData = {
                            // データシリアルNo.
                            serialNumber: numDataSerialNumber,
                            // 伝票行No
                            lineNumber: index + 1,
                            // 商品コード
                            itemCode: (
                                finetItemCodeMapping.hasOwnProperty(strRedTmpKey.toString())
                                    ? finetItemCodeMapping[(strRedTmpKey.toString())]
                                    : objCurrentRedData.getValue({ name: 'upccode', join: 'item' })
                            ),
                            // 商品名（カナ）
                            itemNameKana: objCurrentRedData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // 数量
                            orderQuantity: numRedOrderQuantity,
                            // 入数
                            unitQuantity: objCurrentRedData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 数量(標準)
                            quantity: numRedOrderQuantity,
                            // 単位
                            unit: strRedUnit,
                            // 単価
                            rate: objCurrentRedData.getValue({ name: 'rate' }),
                            // DJ_入り数(入り目)
                            itemUnitQuantity: objCurrentRedData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 請求締日
                            billingCloseDate: formatDate(objCurrentRedData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_納品書明細備考
                            deliveryNoteMemo: objCurrentRedData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // 発注No.
                            orderNo: strRedOrderNo,
                            // 商品コード使用区分
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strRedTmpKey.toString()) ? '1' : '3')
                        };
    
                        arrRedOrderLineRecords.push(createFinetInvoiceLineRecord(objRedOrderLineData));
    
                        // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 エンドレコード.レコード件数
                        numEndRecordRecordCount++;
                        // データシリアル番号
                        numDataSerialNumber++;
    
                        // 8.4 エンドレコード.生版金額合計
                        if (Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strRedShippingType) >= 0 && Number(strRedShippingType) <= 9) || Number(strRedShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentRedData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentRedData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                            }
    
                        } else {
                            if ((Number(strRedShippingType) >= 0 && Number(strRedShippingType) <= 9) || Number(strRedShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                      
                        // 明細.税率
                        let strCurrentRedTaxRate = objCurrentRedData.getValue({ name: 'rate', join: 'taxitem' });
    
                        if (strCurrentRedTaxRate == '10.00%') {
                            // 8.9 標準税率適用合計金額
                            endRecordNormalTaxApplyAmount += Number(objCurrentRedData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentRedTaxRate == '8.00%') {
                            // 8.10 軽減税率適用合計金額
                            endRecordReducedTaxApplyAmount += Number(objCurrentRedData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentRedTaxRate == '10.00%') {
                            // 8.11 消費税額(標準税率適用)
                            endRecordNormalTaxAmount += Number(objCurrentRedData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentRedTaxRate == '8.00%') {
                            // 8.12 消費税額(軽減税率適用)
                            endRecordReducedTaxAmount += Number(objCurrentRedData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentRedTaxRate == '0.00%') {
                            // 8.13 非課税適用合計金額
                            endRecordNoTaxApplyAmount += Number(objCurrentRedData.getValue({ name: 'amount' }));
                        }
    
                    });
    
                    let objRedOrderJson = {
                        orderHeaderRecord: objRedOrderHeaderJson,
                        orderHeaderOptionalRecord1: objRedOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objRedOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objRedOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objRedOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objRedOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objRedOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objRedOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objRedOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objRedOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objRedOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrRedOrderLineRecords
                    };
    
                    if (objRedOrderHeaderOptionalJson1 == null || objRedOrderHeaderOptionalJson1 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objRedOrderHeaderOptionalSubJson1 == null || objRedOrderHeaderOptionalSubJson1 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord1;
                    }
    
                    if (objRedOrderHeaderOptionalJson2 == null || objRedOrderHeaderOptionalJson2 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord2;
                    }
    
                    if (objRedOrderHeaderOptionalSubJson2 == null || objRedOrderHeaderOptionalSubJson2 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord2;
                    }
    
                    if (objRedOrderHeaderOptionalJson3 == null || objRedOrderHeaderOptionalJson3 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord3;
                    }
    
                    if (objRedOrderHeaderOptionalSubJson3 == null || objRedOrderHeaderOptionalSubJson3 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord3;
                    }
    
                    if (objRedOrderHeaderOptionalJson4 == null || objRedOrderHeaderOptionalJson4 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord4;
                    }
    
                    if (objRedOrderHeaderOptionalSubJson4 == null || objRedOrderHeaderOptionalSubJson4 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord4;
                    }
    
                    if (objRedOrderHeaderOptionalJson5 == null || objRedOrderHeaderOptionalJson5 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord5;
                    }
    
                    if (objRedOrderHeaderOptionalSubJson5 == null || objRedOrderHeaderOptionalSubJson5 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord5;
                    }
    
                    arrOrderRecords.push(objRedOrderJson);
                } catch (error) {
                    log.error({
                        title: '請求-赤伝票データ-処理エラー',
                        details: '【トランザクション番号】: ' + arrCurrentRedData[0].getValue({name: 'tranid'}) + '\n【エラー】: ' + error
                    });
                }
            }

            for (var strBlackDataId in objCurrentDestinationBlackData) {
                /** 黒伝票データ処理 */

                if (objTransactionIds.invoiceIds.indexOf(strBlackDataId.toString()) < 0) {
                    objTransactionIds.invoiceIds.push(strBlackDataId.toString());
                }

                /**
                 * 該当内部ID分黒伝票データ
                 * @type {Array}
                 */
                var arrCurrentBlackData = objCurrentDestinationBlackData[strBlackDataId];

                try {
                    /**
                     * 該当黒伝票データ作成元データ（二階層）
                     * @type {object}
                     */
                    let objCurrentBlackTwoLayersInfo = null;
                    if (arrCurrentBlackData[0].getValue({name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo'})
                        && objBlackTwoLayersCreatedFromInfos.hasOwnProperty(arrCurrentBlackData[0].getValue({name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo'}).toString())) {
                        objCurrentBlackTwoLayersInfo = objBlackTwoLayersCreatedFromInfos[(arrCurrentBlackData[0].getValue({name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo'}).toString())];
                    }
    
                    /**
                     * 該当黒伝票データ作成元データ（四階層）
                     * @type {object}
                     */
                    let objCurrentBlackFourLayersInfo = {};
                    if (objCurrentBlackTwoLayersInfo && objCurrentBlackTwoLayersInfo.fourLayersCreatedFrom) {
                        objCurrentBlackFourLayersInfo = objBlackFourLayersCreatedFromInfos[objCurrentBlackTwoLayersInfo.fourLayersCreatedFrom.toString()];
                    }
    
                    /**
                     * 作成元注文書参照できるか
                     * @type {boolean}
                     */
                    let flgBlackHasCreatedFromSalesOrder = false;
                    if (objCurrentBlackTwoLayersInfo) {
                        if (objCurrentBlackTwoLayersInfo.fourLayersCreatedFrom) {
                            flgBlackHasCreatedFromSalesOrder = true;
                        } else if (objCurrentBlackTwoLayersInfo.createdFrom) {
                            flgBlackHasCreatedFromSalesOrder = true;
                        }
                    }
    
                    /** 変数値リセット */
                    arrStoreCodes = [];
                    strBillsInfo = '';
                    strLocationType = '';
    
                    /**
                     * 出荷区分（黒伝）
                     * @type {string}
                     */
                    let strBlackShippingType = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' });
    
                    /**
                     * 注文方法区分
                     */
                    let strBlackOrderMethod = '';
    
                    if (objCurrentBlackTwoLayersInfo) {
                        strBlackOrderMethod = objCurrentBlackTwoLayersInfo.orderMethodTyp;
                        if (strBlackShippingType == '01') {
                            /** 出荷区分は「01:返品取消」の場合 */
                            strBlackOrderMethod = objCurrentBlackFourLayersInfo.orderMethodTyp;
                        }
    
                        if (!flgBlackHasCreatedFromSalesOrder) {
                            strBlackOrderMethod = arrCurrentBlackData[0].getValue({name: 'custbody_djkk_ordermethodrtyp'});
                        }
                        
                    } else {
                        strBlackOrderMethod = arrCurrentBlackData[0].getValue({name: 'custbody_djkk_ordermethodrtyp'});
                    }
    
                    if (strBlackOrderMethod && commonTypeCodeById.hasOwnProperty(strBlackOrderMethod.toString())) {
                        strBlackOrderMethod = commonTypeCodeById[strBlackOrderMethod.toString()];
                    }
    
                    flgIsOrderMethodFinet = (strBlackOrderMethod == '1');
    
                    /** 一次店コード */
                    strFirstStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' });
                    /** 二次店コード */
                    strSecondStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' });
                    /** 三次店コード */
                    strThirdStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' });
                    /** 四次店コード */
                    strForthStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' });
                    /** 五次店コード */
                    strFifthStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' });
    
                    if (flgBlackHasCreatedFromSalesOrder) {
                        // 作成元注文書参照できる場合
    
                        if (strBlackShippingType == '01') {
                            // 出荷区分は「01:返品取消」の場合
    
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName1,
                                    address: objCurrentBlackFourLayersInfo.address1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName2,
                                    address: objCurrentBlackFourLayersInfo.address2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName3,
                                    address: objCurrentBlackFourLayersInfo.address3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName4,
                                    address: objCurrentBlackFourLayersInfo.address4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName5,
                                    address: objCurrentBlackFourLayersInfo.address5,
                                });
                            }
                        } else {
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName1,
                                    address: objCurrentBlackTwoLayersInfo.address1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName2,
                                    address: objCurrentBlackTwoLayersInfo.address2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName3,
                                    address: objCurrentBlackTwoLayersInfo.address3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName4,
                                    address: objCurrentBlackTwoLayersInfo.address4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName5,
                                    address: objCurrentBlackTwoLayersInfo.address5,
                                });
                            }
                        }
                    } else {
                        if (strFirstStoreCode != null && strFirstStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFirstStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strSecondStoreCode != null && strSecondStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strSecondStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strThirdStoreCode != null && strThirdStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strThirdStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strForthStoreCode != null && strForthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strForthStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strFifthStoreCode != null && strFifthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFifthStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                    }
    
                    if (strBlackDataId.indexOf('-discount') >= 0) {
                        /** 割引アイテムデータの場合 */
                        strBlackShippingType = '60'
                    }
    
                    /**
                     * 黒伝票.補助伝票No
                     */
                    let strBlackAuxiliaryOrderNo = '';
                    if (strBlackShippingType == '01') {
                        // 「出荷区分」は「01:返品取消」の場合
                        if (objCurrentBlackTwoLayersInfo) {
                            strBlackAuxiliaryOrderNo = objCurrentBlackTwoLayersInfo.createdFromTransactionNumber;
                        }
                    } else {
                        strBlackAuxiliaryOrderNo = arrCurrentBlackData[0].getValue({name: 'transactionnumber', join: 'custbody_djkk_invoice_creditmemo'});
                    }
    
                    if (strBlackAuxiliaryOrderNo && strBlackAuxiliaryOrderNo.length > 7) {
                        strBlackAuxiliaryOrderNo = strBlackAuxiliaryOrderNo[0] + strBlackAuxiliaryOrderNo.slice(-7);
                    }
    
                    /**
                     * 伝票ヘッダーレコード元データ（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderData = {
                        // データシリアルNo.
                        serialNumber: numDataSerialNumber,
                        // 出荷区分
                        shippingType: strBlackShippingType,
                        // 伝票日付
                        tranDate: arrCurrentBlackData[0].getValue({ name: 'trandate' }),
                        // 出荷日
                        shipDate: arrCurrentBlackData[0].getValue({ name: 'trandate' }),
                        // 伝票番号
                        transactionNumber: arrCurrentBlackData[0].getValue({ name: 'transactionnumber' }),
                        // 補助伝票No.
                        auxiliaryOrderNo: strBlackAuxiliaryOrderNo,
                        // 一次店コード
                        firstStoreCode: strFirstStoreCode,
                        // 二次店コード
                        secondStoreCode: strSecondStoreCode,
                        // 三次店コード
                        thirdStoreCode: strThirdStoreCode,
                        // 四次店コード
                        forthStoreCode: strForthStoreCode,
                        // 五次店コード
                        fifthStoreCode: strFifthStoreCode,
                        // 手形情報
                        billsInfo: ' ',
                        // 倉直区分
                        locationType: ' ',
                        // 倉庫コード
                        locationCode: arrCurrentBlackData[0].getValue({ name: 'externalid', join: 'location' }).slice(1, 3)
                    };
    
                    /**
                     * 伝票ヘッダーレコード（黒伝票）
                     * @type {object}
                     */
                    const objBlackOrderHeaderJson = createFinetInvoiceOrderHeaderRecord(objBlackOrderHeaderData);
    
                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                    numFileHeaderRecordSendDataCount++;
                    // データシリアル番号
                    numDataSerialNumber++;
    
                    /**
                     * 伝票ヘッダーオプションレコード1（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson1 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード1（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson1 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード2（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson2 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード2（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson2 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード3（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson3 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード3（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson3 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード4（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson4 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード4（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson4 = null;
    
                    /**
                     * 伝票ヘッダーオプションレコード5（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson5 = null;
                    /**
                     * 伝票ヘッダーオプションサブレコード5（黒伝票）
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson5 = null;
    
                    if (flgIsOrderMethodFinet) {
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjBlackOrderHeaderOptionalJson = createFinetInvoiceOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: index + 1,
                                // 社名・店名・取引先名
                                customerName: tmpStoreCodeInfo['customerName'],
                                // 住所
                                customerAddress: tmpStoreCodeInfo['address'],
                                // 取引先対応コード
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
    
                            if (tmpObjBlackOrderHeaderOptionalJson != null && tmpObjBlackOrderHeaderOptionalJson != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
    
                            let tmpObjBlackOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjBlackOrderHeaderOptionalSubJson = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                                if (tmpObjBlackOrderHeaderOptionalSubJson != null && tmpObjBlackOrderHeaderOptionalSubJson != '') {
                                    // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                    numFileHeaderRecordSendDataCount++;
                                    // データシリアル番号
                                    numDataSerialNumber++;
                                }
                            }
    
                            switch (index) {
                                case 0:
                                    objBlackOrderHeaderOptionalJson1 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson1 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objBlackOrderHeaderOptionalJson2 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson2 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objBlackOrderHeaderOptionalJson3 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson3 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objBlackOrderHeaderOptionalJson4 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson4 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objBlackOrderHeaderOptionalJson5 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson5 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objBlackOrderHeaderOptionalJson1 = createFinetInvoiceOrderHeaderOptionRecord({
                                // データシリアルNo.
                                serialNumber: numDataSerialNumber,
                                // ヘッダー参照No
                                headerReferenceNumber: arrStoreCodes.length,
                                // 社名・店名・取引先名
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // 住所
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // 取引先対応コード
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
    
                            if (objBlackOrderHeaderOptionalJson1 != null && objBlackOrderHeaderOptionalJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
    
                            objBlackOrderHeaderOptionalSubJson1 = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                            if (objBlackOrderHeaderOptionalSubJson1 != null && objBlackOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                                numFileHeaderRecordSendDataCount++;
                                // データシリアル番号
                                numDataSerialNumber++;
                            }
                        }
                    }
    
                    /**
                     * 伝票明細行レコード（黒伝票）JSON配列
                     * @type {Array}
                     */
                    let arrBlackOrderLineRecords = [];
    
                    arrCurrentBlackData.map(function (objCurrentBlackData, index) {
    
                        let strBlackTmpKey = [
                            objCurrentBlackData.getValue({ name: 'itemid', join: 'item' }),
                            objCurrentBlackData.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                        ].join('-');
    
                        let strBlackItemInternalId = objCurrentBlackData.getValue({ name: 'item' });
    
                        let strBlackUnit = '';
                        if (strBlackItemInternalId) {
                            strBlackUnit = unitCodeByItem[strBlackItemInternalId.toString()];
                        }
    
                        let numBlackOrderQuantity = Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                        if (strBlackUnit == '3') {
                            numBlackOrderQuantity = Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                        }
                        if (strBlackUnit == '1') {
                            numBlackOrderQuantity = Math.ceil(Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' }))) / Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
    
                        /**
                         * 黒伝票.発注No
                         * @type {string}
                         */
                        let strBlackOrderNo = '';
                        
                        if (flgBlackHasCreatedFromSalesOrder) {
                            if (strBlackShippingType == '01') {
                                /** 出荷区分は「01:返品取消」の場合 */
                                
                                strBlackOrderNo = objCurrentBlackFourLayersInfo.customerOrderNo;
                            } else {
                                strBlackOrderNo = objCurrentBlackTwoLayersInfo.createdFromCustomerOrderNo;
                            }
                        }
    
                        if (strBlackOrderNo == null || strBlackOrderNo == '') {
                            strBlackOrderNo = objCurrentBlackData.getValue({name: 'custbody_djkk_customerorderno'});
                        }
    
                        if (strBlackOrderNo.length > 8) {
                            strBlackOrderNo = strBlackOrderNo.slice(0, 8);
                        }
    
                        /**
                         * 明細行レコード元データ（黒伝票）
                         * @type {object}
                         */
                        let objBlackOrderLineData = {
                            // データシリアルNo.
                            serialNumber: numDataSerialNumber,
                            // 伝票行No
                            lineNumber: index + 1,
                            // 商品コード
                            itemCode: (
                                finetItemCodeMapping.hasOwnProperty(strBlackTmpKey.toString())
                                    ? finetItemCodeMapping[(strBlackTmpKey.toString())]
                                    : objCurrentBlackData.getValue({ name: 'upccode', join: 'item' })
                            ),
                            // 商品名（カナ）
                            itemNameKana: objCurrentBlackData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // 数量
                            orderQuantity: numBlackOrderQuantity,
                            // 入数
                            unitQuantity: objCurrentBlackData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 数量(標準)
                            quantity: Math.abs(objCurrentBlackData.getValue({ name: 'quantity' })),
                            // 単位
                            unit: strBlackUnit,
                            // 単価
                            rate: objCurrentBlackData.getValue({ name: 'rate' }),
                            // アイテム.DJ_入り数(入り目)
                            itemUnitQuantity: objCurrentBlackData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // 請求締日
                            billingCloseDate: formatDate(objCurrentBlackData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_納品書明細備考
                            deliveryNoteMemo: objCurrentBlackData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // 発注No.
                            orderNo: strBlackOrderNo,
                            // 商品コード使用区分
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strBlackTmpKey.toString()) ? '1' : '3')
                        };
    
                        arrBlackOrderLineRecords.push(createFinetInvoiceLineRecord(objBlackOrderLineData));
    
                        // 1.19 ファイルヘッダーレコード.送信データ件数 計数
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 エンドレコード.レコード件数
                        numEndRecordRecordCount++;
                        // データシリアル番号
                        numDataSerialNumber++;
    
                        // 8.4 エンドレコード.生版金額合計
                        if (Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strBlackShippingType) >= 0 && Number(strBlackShippingType) <= 9) || Number(strBlackShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentBlackData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentBlackData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                            }
    
                        } else {
                            if ((Number(strBlackShippingType) >= 0 && Number(strBlackShippingType) <= 9) || Number(strBlackShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                      
                        // 明細.税率
                        let strCurrentBlackTaxRate = objCurrentBlackData.getValue({ name: 'rate', join: 'taxitem' });
    
                        if (strCurrentBlackTaxRate == '10.00%') {
                            // 8.9 標準税率適用合計金額
                            endRecordNormalTaxApplyAmount += Number(objCurrentBlackData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentBlackTaxRate == '8.00%') {
                            // 8.10 軽減税率適用合計金額
                            endRecordReducedTaxApplyAmount += Number(objCurrentBlackData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentBlackTaxRate == '10.00%') {
                            // 8.11 消費税額(標準税率適用)
                            endRecordNormalTaxAmount += Number(objCurrentBlackData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentBlackTaxRate == '8.00%') {
                            // 8.12 消費税額(軽減税率適用)
                            endRecordReducedTaxAmount += Number(objCurrentBlackData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentBlackTaxRate == '0.00%') {
                            // 8.13 非課税適用合計金額
                            endRecordNoTaxApplyAmount += Number(objCurrentBlackData.getValue({ name: 'amount' }));
                        }
                    });
    
                    let objBlackOrderJson = {
                        orderHeaderRecord: objBlackOrderHeaderJson,
                        orderHeaderOptionalRecord1: objBlackOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objBlackOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objBlackOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objBlackOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objBlackOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objBlackOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objBlackOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objBlackOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objBlackOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objBlackOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrBlackOrderLineRecords
                    };
                  log.debug({
          title: 'test: ' + arrCurrentBlackData[0].id,
          details: JSON.stringify(arrOrderRecords[0]['orderHeaderOptionalRecord1'])
        });
        log.debug({
          title: 'test: ' + arrCurrentBlackData[0].id,
          details: JSON.stringify(arrOrderRecords[0]['orderHeaderOptionalRecord2'])
        });
                    if (objBlackOrderHeaderOptionalJson1 == null || objBlackOrderHeaderOptionalJson1 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objBlackOrderHeaderOptionalSubJson1 == null || objBlackOrderHeaderOptionalSubJson1 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord1;
                    }
    
                    if (objBlackOrderHeaderOptionalJson2 == null || objBlackOrderHeaderOptionalJson2 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord2;
                    }
    
                    if (objBlackOrderHeaderOptionalSubJson2 == null || objBlackOrderHeaderOptionalSubJson2 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord2;
                    }
    
                    if (objBlackOrderHeaderOptionalJson3 == null || objBlackOrderHeaderOptionalJson3 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord3;
                    }
    
                    if (objBlackOrderHeaderOptionalSubJson3 == null || objBlackOrderHeaderOptionalSubJson3 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord3;
                    }
    
                    if (objBlackOrderHeaderOptionalJson4 == null || objBlackOrderHeaderOptionalJson4 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord4;
                    }
    
                    if (objBlackOrderHeaderOptionalSubJson4 == null || objBlackOrderHeaderOptionalSubJson4 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord4;
                    }
    
                    if (objBlackOrderHeaderOptionalJson5 == null || objBlackOrderHeaderOptionalJson5 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord5;
                    }
    
                    if (objBlackOrderHeaderOptionalSubJson5 == null || objBlackOrderHeaderOptionalSubJson5 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord5;
                    }
                  log.debug({
          title: 'test: ' + arrCurrentBlackData[0].id,
          details: JSON.stringify(arrOrderRecords[0]['orderHeaderOptionalRecord1'])
        });
        log.debug({
          title: 'test2: ' + arrCurrentBlackData[0].id,
          details: JSON.stringify(arrOrderRecords[0]['orderHeaderOptionalRecord2'])
        });
                    arrOrderRecords.push(objBlackOrderJson);
                } catch (error) {
                    log.error({
                        title: '請求-黒伝票データ-処理エラー',
                        details: '【トランザクション番号】: ' + arrCurrentBlackData[0].getValue({name: 'tranid'}) + '\n【エラー】: ' + error
                    });
                }
            }

            /**
             * エンドレコード元データ
             * @type {object}
             */
            let objEndData = {
                // データシリアルNo
                serialNumber: numDataSerialNumber,
                // レコード件数
                recordCount: numEndRecordRecordCount,
                // 生販金額合計
                rawVersionTotalAmount: Math.round(amountEndRecordRawVersionTotal),
                // 割戻金額合計
                rebateTotalAmount: amountEndRecordRebateTotal,
                // 回収容器金額合計
                recoverContainerTotalAmount: amountEndRecordRecoverContainerTotal,
                // 標準税率適用合計金額
                normalTaxApplyAmount: endRecordNormalTaxApplyAmount,
                // 軽減税率適用合計金額
                reducedTaxApplyAmount: endRecordReducedTaxApplyAmount,
                // 消費税額(標準税率適用)
                normalTaxAmount: endRecordNormalTaxAmount,
                // 消費税額(軽減税率適用)
                reducedTaxAmount: endRecordReducedTaxAmount,
                // 非課税適用合計金額
                noTaxApplyAmount: endRecordNoTaxApplyAmount
            };
            const objEndJson = createFinetInvoiceEndRecord(objEndData);

            // 1.19 ファイルヘッダーレコード.送信データ件数 計数
            numFileHeaderRecordSendDataCount++;
            // データシリアル番号
            numDataSerialNumber++;

            // 1.19 ファイルヘッダーレコード.送信データ件数
            objFileHeaderJson.sendDataCount = ('000000' + numFileHeaderRecordSendDataCount).slice(-6);

            if (arrOrderRecords.length <= 0) {
                /** 有効なデータがない場合 */
                continue;
            }

            objResult = {
                fileHeaderRecord: objFileHeaderJson,
                orderRecords: arrOrderRecords,
                endRecord: objEndJson
            };

            arrResults.push(objResult);
        }

        log.audit({
            title: 'getFinetInvoiceJSON - objTransactionIds',
            details: JSON.stringify(objTransactionIds)
        });

        if (objTransactionIds.invoiceIds.length > 0 || objTransactionIds.creditMemoIds.length > 0) {
            var updateTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_djkk_mr_finet',
                deploymentId: 'customdeploy_djkk_mr_finet_invoice',
                params: {
                    custscript_djkk_mr_finet_target_ids: JSON.stringify(objTransactionIds)
                }
            });
            updateTask.submit();
        }
        log.audit({
            title: 'getFinetInvoiceJSON - end',
            details: JSON.stringify(new Date())
        });
        return arrResults;
    }

    /**
     * FINET連携_請求用データ取得
     * @returns {Object}
     */
    function getFinetInvoiceNormalDatas() {
        var objResult = {};
        var filters = [];

        // メインライン != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));

        // 税金ライン != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));

        // 売上原価行 != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));

        // 出荷行 = F
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));

        // 締め請求書に含める = T
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));
        // 作成元.DJ_FINET請求送信フラグ = T
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_bill_mail_flg',
            join: 'createdfrom',
            operator: search.Operator.IS,
            values: true
        }));
        // DJ_FINET連携済みフラグ = F
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_invoice_sent_flg',
            operator: search.Operator.IS,
            values: false
        }));
        // 作成元 != NULL
        filters.push(search.createFilter({
            name: 'createdfrom',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));
        // 作成元.種類 = 注文書
        filters.push(search.createFilter({
            name: 'type',
            join: 'createdfrom',
            operator: search.Operator.ANYOF,
            values: ['SalesOrd']
        }));
        // DJ_外部システム_行番号 != NULL
        filters.push(search.createFilter({
            name: 'custcol_djkk_exsystem_line_num',
            operator: search.Operator.ISNOTEMPTY,
            values: ''
        }));
        // 作成元.DJ_FINET_一次店コード != NULL
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_first_store_code',
            join: 'createdfrom',
            operator: search.Operator.ISNOTEMPTY,
            values: ''
        }));
        // DJ_合計請求書作成済みフラグ
        filters.push(search.createFilter({
            name: 'custbody_djkk_invoicetotal_flag',
            operator: search.Operator.IS,
            values: true
        }));
        var columns = [];
        // 伝票番号
        columns.push(search.createColumn({ name: 'tranid' }));
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        // 日付
        columns.push(search.createColumn({ name: 'trandate' }));
        // 出荷日
        columns.push(search.createColumn({ name: 'shipdate' }));
        // 数量
        columns.push(search.createColumn({ name: 'quantity' }));
        // 単価/率
        columns.push(search.createColumn({ name: 'rate' }));
        // 単位
        columns.push(search.createColumn({ name: 'unit' }));
        // 金額
        columns.push(search.createColumn({ name: 'amount' }));
        // DJ_先方発注番号
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        // DJ_外部システム_行番号
        columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
        // アイテム
        columns.push(search.createColumn({ name: 'item' }));
        // アイテム.DJ_入数
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        // アイテム.DJ_アイテムカナ名称
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        // アイテム.UPCCODE
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        // アイテム.商品コード
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        // 場所.コード
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        // 明細.税率
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
        // 明細.税額
        columns.push(search.createColumn({ name: 'taxamount' }));
        // 場所
        columns.push(search.createColumn({ name: 'location' }));
        // DJ_FINET_最終送信先コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code', join: 'createdfrom' }));
        // DJ_FINET_最終送信先コード（予備）
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code_bk', join: 'createdfrom' }));
        // DJ_FINET_直接送信先企業コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_code', join: 'createdfrom' }));
        // DJ_FINET_直接送信先企業コード（予備）
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_codebk', join: 'createdfrom' }));
        // DJ_FINET_提供企業コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_provider_comp_code', join: 'createdfrom' }));
        // DJ_FINETカナ提供企業名
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaofferconame', join: 'createdfrom' }));
        // DJ_FINET_一次店コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_first_store_code', join: 'createdfrom' }));
        // DJ_FINET_二次店コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_second_store_code', join: 'createdfrom' }));
        // DJ_FINET_三次店コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_third_store_code', join: 'createdfrom' }));
        // DJ_FINET_四次店コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_fourth_store_code', join: 'createdfrom' }));
        // DJ_FINET_五次店コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_fifth_store_code', join: 'createdfrom' }));
        // DJ_FINET_手形情報.区分コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_bills_info', join: 'createdfrom' }));
        // DJ_FINET_倉直区分.区分コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_location_type', join: 'createdfrom' }));
        // 作成元.DJ_FINET_送信元センターコード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' }));
        // DJ_FINET送信元センターコード(予備)
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sendercentercode_s', join: 'createdfrom' }));
        //        // DJ_FINET利用者企業コード(受け手)
        //        columns.push(search.createColumn({name: 'custbody_djkk_finet_user_company_code',join: 'createdfrom'}));

        // DJ_FINETカナ社名・店名・取引先名
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom' }));
        // DJ_FINETカナ住所
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom' }));
        // DJ_FINETカナ社名・店名・取引先名_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom' }));
        // DJ_FINETカナ住所_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom' }));
        // DJ_FINETカナ社名・店名・取引先名_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom' }));
        // DJ_FINETカナ住所_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom' }));
        // DJ_FINETカナ社名・店名・取引先名_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom' }));
        // DJ_FINETカナ住所_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom' }));
        // DJ_FINETカナ社名・店名・取引先名_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom' }));
        // DJ_FINETカナ住所_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom' }));
        // 締日
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        // DJ_注文方法区分.区分コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        // DJ_納品先.DJ_納品先カナ名称
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET出荷区分
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        // DJ_入数
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        // DJ_納品書明細備考
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo' }));
        // DJ_クレジットメモ.作成元
        columns.push(search.createColumn({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' }));
        // アイテム.DJ_値引きアイテム
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));

        var results = searchResult(search.Type.INVOICE, filters, columns);
        for (var i = 0; i < results.length; i++) {
            // 請求書.id
            var tmpId = results[i].id;

            // 「最終送信先コード」
            var tmpFinalDestinationCode = results[i].getValue({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' });

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                var objInvoiceDatas = {};
                var arrInvoiceDetailDatas = [];

                arrInvoiceDetailDatas.push(results[i]);

                objInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objInvoiceDatas;
            } else {
                var tmpObjInvoiceDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjInvoiceDatas.hasOwnProperty(tmpId.toString())) {
                    var arrInvoiceDetailDatas = [];

                    arrInvoiceDetailDatas.push(results[i]);

                    tmpObjInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;
                } else {
                    var tmpArrInvoiceDetailDatas = tmpObjInvoiceDatas[(tmpId.toString())];
                    tmpArrInvoiceDetailDatas.push(results[i]);
                    tmpObjInvoiceDatas[(tmpId.toString())] = tmpArrInvoiceDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjInvoiceDatas;
            }
        }
        return objResult;
    }

    /**
     * FINET請求（赤伝）データ取得
     * @returns {object} FINET請求（赤伝）データ
     */
    function getFinetInvoiceRedData() {
        let objResult = {};

        let arrPrimaryKeys = [];

        let filters = [];

        // メインライン != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));

        // 税金ライン != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));
        // 売上原価行 != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));

        // 出荷行 = F
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));

        // 締め請求書に含める = True
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));

        // DJ_FINET送信区分 != null
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        // DJ_FINETクレジットメモ連携済みフラグ = False
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_invoice_sent_flg',
            operator: search.Operator.IS,
            values: false
        }));

        // DJ_合計請求書作成済みフラグ = True
        filters.push(search.createFilter({
            name: 'custbody_djkk_invoicetotal_flag',
            operator: search.Operator.IS,
            values: true
        }));

        // DJ_納品先 != NULL
        filters.push(search.createFilter({
            name: 'custbody_djkk_delivery_destination',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        let columns = [];
        /** トランザクション番号 */
        columns.push(search.createColumn({ name: 'tranid' }));
        /** DJ_納品先.DJ_FINET送信元センターコード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_FINET出荷区分 */
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_shipping_typ' }));
        /** DJ_FINET出荷区分.区分コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        /** 日付 */
        columns.push(search.createColumn({ name: 'trandate' }));
        /** トランザクション番号 */
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        /** DJ_納品先.DJ_FINET_一次店コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_納品先.DJ_FINET_二次店コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_納品先.DJ_FINET_三次店コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_納品先.DJ_FINET_四次店コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_納品先.DJ_FINET_五次店コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' }));
        /** 場所.外部ID */
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        /** 場所 */
        columns.push(search.createColumn({ name: 'location' }));
        /** DJ_注文方法区分.区分コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        /** DJ_納品先.DJ_納品先カナ名称 */
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        /** 明細行番号 */
        columns.push(search.createColumn({ name: 'line' }));
        /** アイテム.アイテム番号 */
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        /** アイテム.EANコード */
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        /** アイテム.DJ_アイテムカナ名称 */
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        /** アイテム.DJ_出荷単位区分 */
        columns.push(search.createColumn({ name: 'custitem_djkk_shipment_unit_type', join: 'item' }));
        /** アイテム.DJ_入り数 */
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        /** DJ_入数 */
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        /** 数量 */
        columns.push(search.createColumn({ name: 'quantity' }));
        /** 単位 */
        columns.push(search.createColumn({ name: 'unit' }));
        /** 単位.区分コード */
        // columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'unit' }));
        /** 単価 */
        columns.push(search.createColumn({ name: 'rate' }));
        /** 締め請求書期日 */
        columns.push(search.createColumn({ name: 'custbody_suitel10n_jp_ids_date' }));
        /** DJ_先方発注番号 */
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        /** DJ_FINET_最終送信先コード */
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code' }));
        /** 作成元(返品).作成元（請求書） */
        columns.push(search.createColumn({ name: 'createdfrom', join: 'createdfrom' }));
        /** 作成元(返品).DJ_FINET_送信元センターコード */
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' }));
        /** 作成元.トランザクション番号 */
        columns.push(search.createColumn({ name: 'transactionnumber', join: 'createdfrom' }))
        /** アイテム */
        columns.push(search.createColumn({ name: 'item' }));
        /** 締め請求書期日 */
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
      	columns.push(search.createColumn({name: 'createdfrom'}));
		columns.push(search.createColumn({name: 'amount'}));
        columns.push(search.createColumn({name: 'taxamount'}));
        // DJ_納品書明細備考
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo' }));
        // 明細行
        columns.push(search.createColumn({ name: 'line' }));
        // 作成元.作成元
        columns.push(search.createColumn({ name: 'createdfrom', join: 'createdfrom' }));
        // アイテム.DJ_値引きアイテム
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));

        let results = searchResult(search.Type.CREDIT_MEMO, filters, columns);
        results.map(function (tmpResult) {
            /**
             * 内部ID
             * @type {number}
             */
            let tmpId = tmpResult.id;

            let tmpKey = [tmpId, tmpResult.getValue({name: 'line'}).toString()].join('-');

            if (arrPrimaryKeys.indexOf(tmpKey) >= 0) {
                return;
            }

            arrPrimaryKeys.push(tmpKey);

            /**
             * DJ_FINET_最終送信先コード
             * @type {string}
             */
            let tmpFinalDestinationCode = tmpResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' });

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                var objCreditMemoDatas = {};
                var arrCreditMemoDetailDatas = [];

                arrCreditMemoDetailDatas.push(tmpResult);

                objCreditMemoDatas[(tmpId.toString())] = arrCreditMemoDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objCreditMemoDatas;
            } else {
                var tmpObjCreditMemoDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjCreditMemoDatas.hasOwnProperty(tmpId.toString())) {
                    var arrCreditMemoDetailDatas = [];

                    arrCreditMemoDetailDatas.push(tmpResult);

                    tmpObjCreditMemoDatas[(tmpId.toString())] = arrCreditMemoDetailDatas;
                } else {
                    var tmpArrCreditMemoDetailDatas = tmpObjCreditMemoDatas[(tmpId.toString())];
                    tmpArrCreditMemoDetailDatas.push(tmpResult);
                    tmpObjCreditMemoDatas[(tmpId.toString())] = tmpArrCreditMemoDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjCreditMemoDatas;
            }

        });
        return objResult;
    }

    /**
     * FINET請求（黒伝）データ取得
     * @returns {object} FINET請求（黒伝）データ
     */
    function getFinetInvoiceBlackData() {
        /**
         * 検索結果オブジェクト
         * @type {object}
         */
        let objResult = {};

        let arrPrimaryKeys = [];

        let filters = [];

        // メインライン != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));

        // 税金ライン != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));
        // 売上原価行 != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));
        // 出荷行 = F
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));
        // 締め請求書に含める = True
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));

        // DJ_FINET送信区分 != null
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        // DJ_FINET送信区分 != [00:通常出荷(黒)]
        filters.push(search.createFilter({
            name: 'custrecord_djkk_finet_shipping_typ_cd',
            join: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.ISNOT,
            values: '00'
        }));

        // DJ_FINET請求連携済みフラグ
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_invoice_sent_flg',
            operator: search.Operator.IS,
            values: false
        }))

        // DJ_合計請求書作成済みフラグ = True
        filters.push(search.createFilter({
            name: 'custbody_djkk_invoicetotal_flag',
            operator: search.Operator.IS,
            values: true
        }));

        // DJ_納品先 != NULL
        filters.push(search.createFilter({
            name: 'custbody_djkk_delivery_destination',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        let columns = [];
        /** トランザクション番号 */
        columns.push(search.createColumn({ name: 'tranid' }));
        /** DJ_納品先.DJ_FINET送信元センターコード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_FINET出荷区分.区分コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        /** 日付 */
        columns.push(search.createColumn({ name: 'trandate' }));
        /** トランザクション番号 */
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        /** DJ_クレジットメモ.トランザクション番号 */
        columns.push(search.createColumn({ name: 'transactionnumber', join: 'custbody_djkk_invoice_creditmemo' }));
        /** DJ_納品先.DJ_FINET_一次店コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_納品先.DJ_FINET_二次店コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_納品先.DJ_FINET_三次店コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_納品先.DJ_FINET_四次店コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_納品先.DJ_FINET_五次店コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' }));
        /** 場所.外部ID */
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        /** DJ_注文方法区分.区分コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        /** DJ_納品先.DJ_納品先カナ名称 */
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        /** 明細行番号 */
        columns.push(search.createColumn({ name: 'line' }));
        /** アイテム.アイテム番号 */
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        /** アイテム.EANコード */
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        /** アイテム.DJ_アイテムカナ名称 */
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        /** DJ_入数 */
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        /** 数量 */
        columns.push(search.createColumn({ name: 'quantity' }));
        /** 単位 */
        columns.push(search.createColumn({ name: 'unit' }));
        /** 単価 */
        columns.push(search.createColumn({ name: 'rate' }));
        /** 締め請求書期日 */
        columns.push(search.createColumn({ name: 'custbody_suitel10n_jp_ids_date' }));
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        /** DJ_先方発注番号 */
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        /** DJ_FINET_最終送信先コード */
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code' }));
        /** アイテム */
        columns.push(search.createColumn({ name: 'item' }));
		columns.push(search.createColumn({name: 'amount'}));
        columns.push(search.createColumn({name: 'taxamount'}));
        columns.push(search.createColumn({name: 'line'}));
        // /** DJ_クレジットメモ.トランザクション番号 */
        // columns.push(search.createColumn({ name: 'transactionnumber', join: 'custbody_djkk_invoice_creditmemo' }));
        // /** DJ_クレジットメモ.作成元（請求書） */
        // columns.push(search.createColumn({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' }))

        /** DJ_クレジットメモ */
        columns.push(search.createColumn({ name: 'custbody_djkk_invoice_creditmemo' }));
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo'}));
        /** DJ_注文方法区分 */
        columns.push(search.createColumn({ name: 'custbody_djkk_ordermethodrtyp' }));
        // DJ_クレジットメモ.作成元
        columns.push(search.createColumn({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' }));
        // アイテム.DJ_値引きアイテム
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));

        let results = searchResult(search.Type.INVOICE, filters, columns);
        results.map(function (tmpResult) {
            /**
             * 内部ID
             * @type {number}
             */
            let tmpId = tmpResult.id;

            let tmpKey = [tmpId, tmpResult.getValue({name: 'line'}).toString()].join('-');

            if (arrPrimaryKeys.indexOf(tmpKey) >= 0) {
                return;
            }

            arrPrimaryKeys.push(tmpKey);

            /**
             * DJ_FINET_最終送信先コード
             * @type {string}
             */
            let tmpFinalDestinationCode = tmpResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' });

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                var objCreditMemoDatas = {};
                var arrCreditMemoDetailDatas = [];

                arrCreditMemoDetailDatas.push(tmpResult);

                objCreditMemoDatas[(tmpId.toString())] = arrCreditMemoDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objCreditMemoDatas;
            } else {
                var tmpObjCreditMemoDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjCreditMemoDatas.hasOwnProperty(tmpId.toString())) {
                    var arrCreditMemoDetailDatas = [];

                    arrCreditMemoDetailDatas.push(tmpResult);

                    tmpObjCreditMemoDatas[(tmpId.toString())] = arrCreditMemoDetailDatas;
                } else {
                    var tmpArrCreditMemoDetailDatas = tmpObjCreditMemoDatas[(tmpId.toString())];
                    tmpArrCreditMemoDetailDatas.push(tmpResult);
                    tmpObjCreditMemoDatas[(tmpId.toString())] = tmpArrCreditMemoDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjCreditMemoDatas;
            }

        });
        return objResult;
    }

    /**
     * FINET連携_出荷案内用データ取得
     * @returns {Object}
     */
    function getFinetShippingNormalDatas() {
        var objResult = {};
        var filters = [];

        // メインライン != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));

        // 税金ライン != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));
        // 売上原価行 != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));

        // 出荷行 = F
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));

        // 締め請求書に含める = T
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));
        // DJ_FINET請求送信フラグ = T
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipment_mail_flg',
            operator: search.Operator.IS,
            values: true
        }));
        // DJ_FINET出荷案内連携済みフラグ = F
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipment_sent_flg',
            operator: search.Operator.IS,
            values: false
        }));
        // DJ_FINET_一次店コード != NULL
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_first_store_code',
            operator: search.Operator.ISNOTEMPTY,
            values: ''
        }));

        var columns = [];
        // 伝票番号
        columns.push(search.createColumn({ name: 'tranid' }));
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        // 日付
        columns.push(search.createColumn({ name: 'trandate' }));
        // 出荷日
        columns.push(search.createColumn({ name: 'shipdate' }));
        // 数量
        columns.push(search.createColumn({ name: 'quantity' }));
        // 単価/率
        columns.push(search.createColumn({ name: 'rate' }));
        // 単位
        columns.push(search.createColumn({ name: 'unit' }));
        // 金額
        columns.push(search.createColumn({ name: 'amount' }));
        // DJ_先方発注番号
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        // DJ_外部システム_行番号
        columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
        // アイテム
        columns.push(search.createColumn({ name: 'item' }));
        // アイテム.DJ_入数
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        // アイテム.DJ_アイテムカナ名称
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        // アイテム.UPCCODE
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        // アイテム.商品コード
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        // 場所.コード
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        // 明細.税率
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
        // 明細.税額
        columns.push(search.createColumn({ name: 'taxamount' }));
        // 場所
        columns.push(search.createColumn({ name: 'location' }));
        // DJ_FINET_最終送信先コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code' }));
        // DJ_FINET_最終送信先コード（予備）
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code_bk' }));
        // DJ_FINET_直接送信先企業コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_code' }));
        // DJ_FINET_直接送信先企業コード（予備）
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_codebk' }));
        // DJ_FINET_提供企業コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_provider_comp_code' }));
        // DJ_FINETカナ提供企業名
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaofferconame' }));
        // DJ_FINET_一次店コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_first_store_code' }));
        // DJ_FINET_二次店コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_second_store_code' }));
        // DJ_FINET_三次店コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_third_store_code' }));
        // DJ_FINET_四次店コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_fourth_store_code' }));
        // DJ_FINET_五次店コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_fifth_store_code' }));
        // DJ_FINET_手形情報.区分コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_bills_info' }));
        // DJ_FINET_倉直区分.区分コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_location_type' }));
        // 作成元.DJ_FINET_送信元センターコード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sender_center_code' }));
        // DJ_FINET送信元センターコード(予備)
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sendercentercode_s' }));
        //        // DJ_FINET利用者企業コード(受け手)
        //        columns.push(search.createColumn({name: 'custbody_djkk_finet_user_company_code'}));

        // DJ_FINETカナ社名・店名・取引先名
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername' }));
        // DJ_FINETカナ住所
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomeraddress' }));
        // DJ_FINETカナ社名・店名・取引先名_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername2' }));
        // DJ_FINETカナ住所_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option2' }));
        // DJ_FINETカナ社名・店名・取引先名_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername_o3' }));
        // DJ_FINETカナ住所_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option3' }));
        // DJ_FINETカナ社名・店名・取引先名_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername4' }));
        // DJ_FINETカナ住所_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option4' }));
        // DJ_FINETカナ社名・店名・取引先名_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername5' }));
        // DJ_FINETカナ住所_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option5' }));
        // 締日
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        // DJ_注文方法区分.区分コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        // DJ_納品先.DJ_納品先カナ名称
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET出荷区分
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        // DJ_入数
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        // DJ_納品書明細備考
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo' }));
        // アイテム.DJ_値引きアイテム
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));
        
        var results = searchResult(search.Type.SALES_ORDER, filters, columns);

        /**
         * 作成元注文書ID別請求書ステータス
         * @type {object}
         */
        let objInvoiceStatusBySoId = {};

        /**
         * 結果注文書内部ID
         * @type {Array}
         */
        let arrAllSoId = [];
        results.map(function(result) {
            let tmpSoId = result.id;

            if (arrAllSoId.indexOf(tmpSoId.toString()) < 0) {
                arrAllSoId.push(tmpSoId.toString());
            }
        });

        let invoiceFilters = [];
        arrAllSoId.map(function(tmpSoId, index) {
            invoiceFilters.push(['createdfrom.internalid', search.Operator.IS, tmpSoId.toString()]);
            if (index != arrAllSoId.length - 1) {
                invoiceFilters.push('OR');
            }
        });
        let invoiceColumns = [];
        /** 作成元.内部ID */
        invoiceColumns.push(search.createColumn({ name: 'internalid', join: 'createdfrom'}));
        /** ステータス */
        invoiceColumns.push(search.createColumn({name: 'status'}));
        invoiceColumns.push(search.createColumn({name: 'approvalstatus'}));

        let invoiceResults = searchResult(search.Type.TRANSACTION, invoiceFilters, invoiceColumns);
        invoiceResults.map(function(invoiceResult) {
            let tmpResultStatus = invoiceResult.getValue({name: 'approvalstatus'});
            let tmpResultCreatedFromId = invoiceResult.getValue({ name: 'internalid', join: 'createdfrom' });

            if (tmpResultStatus == null || tmpResultStatus == '') {
                return;
            }

            let tmpResultArray = [];
            if (objInvoiceStatusBySoId.hasOwnProperty(tmpResultCreatedFromId.toString())) {
                tmpResultArray = objInvoiceStatusBySoId[tmpResultCreatedFromId.toString()];
            }

            tmpResultArray.push(tmpResultStatus.toString());

            objInvoiceStatusBySoId[tmpResultCreatedFromId.toString()] = tmpResultArray;
        });

        results.map(function(tmpResult) {
            /** 
             * 内部ID
             * @type {string | number}
             */
            let tmpId = tmpResult.id;

            /** 
             * 最終送信先コード
             * @type {string}
             */
            let tmpFinalDestinationCode = tmpResult.getValue({ name: 'custbody_djkk_finet_sender_center_code' });

            let arrRelationInvoiceStatus = [];
            if (objInvoiceStatusBySoId.hasOwnProperty(tmpId.toString())) {
                arrRelationInvoiceStatus = objInvoiceStatusBySoId[tmpId.toString()];
            }

            if (arrRelationInvoiceStatus.length <= 0) {
                /** 関連請求書が一件も作成されていない場合 */
                return;
            }

            if (arrRelationInvoiceStatus.filter(function(tmp) {return tmp != '2';}).length > 0) {
                /** 関連請求書は全部承認済みではない場合 */
                return;
            }

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                let objInvoiceDatas = {};
                let arrInvoiceDetailDatas = [];

                arrInvoiceDetailDatas.push(tmpResult);

                objInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objInvoiceDatas;
            } else {
                let tmpObjInvoiceDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjInvoiceDatas.hasOwnProperty(tmpId.toString())) {
                    let arrInvoiceDetailDatas = [];

                    arrInvoiceDetailDatas.push(tmpResult);

                    tmpObjInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;
                } else {
                    let tmpArrInvoiceDetailDatas = tmpObjInvoiceDatas[(tmpId.toString())];
                    tmpArrInvoiceDetailDatas.push(tmpResult);
                    tmpObjInvoiceDatas[(tmpId.toString())] = tmpArrInvoiceDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjInvoiceDatas;
            }
        });

        return objResult;
    }

    /**
     * FINET連携_出荷案内用（赤データ）データ取得
     * @returns {Object}
     */
    function getFinetShippingRedDatas() {
        let objResult = {};

        let arrPrimaryKeys = [];

        let filters = [];

        // メインライン != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));

        // 税金ライン != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));
        
        // 売上原価行 != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));

        // 出荷行 = F
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));

        // 締め請求書に含める = T
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));

        /** DJ_FINET出荷区分 != NULL */
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        /** DJ_FINET出荷案内連携済みフラグ = False*/
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipment_sent_flg',
            operator: search.Operator.IS,
            values: false
        }));

        /** DJ_納品先 != null */
        filters.push(search.createFilter({
            name: 'custbody_djkk_delivery_destination',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        let columns = [];
        // 伝票番号
        columns.push(search.createColumn({ name: 'tranid' }));
        // トランザクション番号
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        // 日付
        columns.push(search.createColumn({ name: 'trandate' }));
        // 出荷日
        columns.push(search.createColumn({ name: 'shipdate' }));
        // 数量
        columns.push(search.createColumn({ name: 'quantity' }));
        // 単価/率
        columns.push(search.createColumn({ name: 'rate' }));
        // 単位
        columns.push(search.createColumn({ name: 'unit' }));
        // 金額
        columns.push(search.createColumn({ name: 'amount' }));
        // DJ_先方発注番号
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        // DJ_外部システム_行番号
        columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
        // アイテム
        columns.push(search.createColumn({ name: 'item' }));
        // アイテム.DJ_入数
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        // アイテム.DJ_アイテムカナ名称
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        // アイテム.UPCCODE
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        // アイテム.商品コード
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        // 場所.コード
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        // 明細.税率
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
        // 明細.税額
        columns.push(search.createColumn({ name: 'taxamount' }));
        // 場所
        columns.push(search.createColumn({ name: 'location' }));
        // DJ_FINET_最終送信先コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code' }));
        // DJ_FINET_最終送信先コード（予備）
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code_bk' }));
        // DJ_FINET_直接送信先企業コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_code' }));
        // DJ_FINET_直接送信先企業コード（予備）
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_codebk' }));
        // DJ_FINET_提供企業コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_provider_comp_code' }));
        // DJ_FINETカナ提供企業名
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaofferconame' }));
        // DJ_納品先DJ_FINET_一次店コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' }));
        // DJ_納品先DJ_FINET_二次店コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' }));
        // DJ_納品先DJ_FINET_三次店コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' }));
        // DJ_納品先DJ_FINET_四次店コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' }));
        // DJ_納品先DJ_FINET_五次店コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET_手形情報.区分コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_bills_info' }));
        // DJ_FINET_倉直区分.区分コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_location_type' }));
        // 作成元.DJ_納品先.DJ_FINET_送信元センターコード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET送信元センターコード(予備)
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sendercentercode_s' }));
        //        // DJ_FINET利用者企業コード(受け手)
        //        columns.push(search.createColumn({name: 'custbody_djkk_finet_user_company_code'}));

        // DJ_FINETカナ社名・店名・取引先名
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername' }));
        // DJ_FINETカナ住所
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomeraddress' }));
        // DJ_FINETカナ社名・店名・取引先名_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername2' }));
        // DJ_FINETカナ住所_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option2' }));
        // DJ_FINETカナ社名・店名・取引先名_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername_o3' }));
        // DJ_FINETカナ住所_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option3' }));
        // DJ_FINETカナ社名・店名・取引先名_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername4' }));
        // DJ_FINETカナ住所_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option4' }));
        // DJ_FINETカナ社名・店名・取引先名_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername5' }));
        // DJ_FINETカナ住所_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option5' }));
        // 締日
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        // DJ_注文方法区分.区分コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        // DJ_納品先.DJ_納品先カナ名称
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET出荷区分
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        // DJ_入数
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        // DJ_納品書明細備考
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo' }));
        columns.push(search.createColumn({ name: 'createdfrom' }));
        columns.push(search.createColumn({ name: 'createdfrom', join: 'createdfrom' }));
        // 作成元.トランザクション番号
        columns.push(search.createColumn({ name: 'transactionnumber', join: 'createdfrom' }));
        // DJ_注文方法区分
        columns.push(search.createColumn({ name: 'custbody_djkk_ordermethodrtyp' }));
        columns.push(search.createColumn({name: 'line'}));
        // アイテム.DJ_値引きアイテム
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));

        let results = searchResult(search.Type.CREDIT_MEMO, filters, columns);

        results.map(function(tmpResult) {
            /** 
             * 内部ID
             * @type {string | number}
             */
            let tmpId = tmpResult.id;

            let tmpKey = [tmpId, tmpResult.getValue({name: 'line'}).toString()].join('-');

            if (arrPrimaryKeys.indexOf(tmpKey) >= 0) {
                return;
            }

            arrPrimaryKeys.push(tmpKey);
            
            /** 
             * 最終送信先コード
             * @type {string}
             */
            let tmpFinalDestinationCode = tmpResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' });

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                let objInvoiceDatas = {};
                let arrInvoiceDetailDatas = [];

                arrInvoiceDetailDatas.push(tmpResult);

                objInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objInvoiceDatas;
            } else {
                let tmpObjInvoiceDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjInvoiceDatas.hasOwnProperty(tmpId.toString())) {
                    let arrInvoiceDetailDatas = [];

                    arrInvoiceDetailDatas.push(tmpResult);

                    tmpObjInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;
                } else {
                    let tmpArrInvoiceDetailDatas = tmpObjInvoiceDatas[(tmpId.toString())];
                    tmpArrInvoiceDetailDatas.push(tmpResult);
                    tmpObjInvoiceDatas[(tmpId.toString())] = tmpArrInvoiceDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjInvoiceDatas;
            }
        });

        return objResult;
    }

    /**
     * FINET連携_出荷案内用（黒データ）データ取得
     * @returns {Object}
     */
    function getFinetShippingBlackDatas() {
        let objResult = {};

        let arrPrimaryKeys = [];

        let filters = [];

        // メインライン != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));
    
        // 税金ライン != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));
        
        // 出荷行 != T
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));

        // 売上原価行 != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));

        // 締め請求書に含める = T
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));
    
        /** DJ_FINET出荷区分 != NULL */
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));
    
        /** DJ_FINET出荷区分 != 「00:通常出荷(黒)」 */
        filters.push(search.createFilter({
            name: 'name',
            join: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.ISNOT,
            values: '00:通常出荷(黒)'
        }));
    
        /** DJ_FINET出荷案内連携済みフラグ = False*/
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipment_sent_flg',
            operator: search.Operator.IS,
            values: false
        }));
    
        /** ステータス = 承認済み */
        filters.push(search.createFilter({
            name: 'status',
            operator: search.Operator.ANYOF,
            values: ['CustInvc:A']
        }));
    
        /** DJ_納品先 != null */
        filters.push(search.createFilter({
            name: 'custbody_djkk_delivery_destination',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        let columns = [];
        // 伝票番号
        columns.push(search.createColumn({ name: 'tranid' }));
        // 伝票番号
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        // 日付
        columns.push(search.createColumn({ name: 'trandate' }));
        // 出荷日
        columns.push(search.createColumn({ name: 'shipdate' }));
        // 数量
        columns.push(search.createColumn({ name: 'quantity' }));
        // 単価/率
        columns.push(search.createColumn({ name: 'rate' }));
        // 単位
        columns.push(search.createColumn({ name: 'unit' }));
        // 金額
        columns.push(search.createColumn({ name: 'amount' }));
        // DJ_先方発注番号
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        // DJ_外部システム_行番号
        columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
        // アイテム
        columns.push(search.createColumn({ name: 'item' }));
        // アイテム.DJ_入数
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        // アイテム.DJ_アイテムカナ名称
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        // アイテム.UPCCODE
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        // アイテム.商品コード
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        // 場所.コード
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        // 明細.税率
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
        // 明細.税額
        columns.push(search.createColumn({ name: 'taxamount' }));
        // 場所
        columns.push(search.createColumn({ name: 'location' }));
        // DJ_FINET_最終送信先コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code' }));
        // DJ_FINET_最終送信先コード（予備）
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code_bk' }));
        // DJ_FINET_直接送信先企業コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_code' }));
        // DJ_FINET_直接送信先企業コード（予備）
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_codebk' }));
        // DJ_FINET_提供企業コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_provider_comp_code' }));
        // DJ_FINETカナ提供企業名
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaofferconame' }));
        // DJ_納品先.DJ_FINET_一次店コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' }));
        // DJ_納品先.DJ_FINET_二次店コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' }));
        // DJ_納品先.DJ_FINET_三次店コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' }));
        // DJ_納品先.DJ_FINET_四次店コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' }));
        // DJ_納品先.DJ_FINET_五次店コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET_手形情報.区分コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_bills_info' }));
        // DJ_FINET_倉直区分.区分コード
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_location_type' }));
        // 作成元.DJ_FINET_送信元センターコード
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET送信元センターコード(予備)
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sendercentercode_s' }));
        //        // DJ_FINET利用者企業コード(受け手)
        //        columns.push(search.createColumn({name: 'custbody_djkk_finet_user_company_code'}));

        // DJ_FINETカナ社名・店名・取引先名
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername' }));
        // DJ_FINETカナ住所
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomeraddress' }));
        // DJ_FINETカナ社名・店名・取引先名_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername2' }));
        // DJ_FINETカナ住所_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option2' }));
        // DJ_FINETカナ社名・店名・取引先名_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername_o3' }));
        // DJ_FINETカナ住所_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option3' }));
        // DJ_FINETカナ社名・店名・取引先名_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername4' }));
        // DJ_FINETカナ住所_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option4' }));
        // DJ_FINETカナ社名・店名・取引先名_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername5' }));
        // DJ_FINETカナ住所_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option5' }));
        // 締日
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        // DJ_注文方法区分.区分コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        // DJ_納品先.DJ_納品先カナ名称
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET出荷区分
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        // DJ_入数
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        // DJ_納品書明細備考
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo' }));
        // DJ_クレジットメモ
        columns.push(search.createColumn({ name: 'custbody_djkk_invoice_creditmemo' }));
        // DJ_クレジットメモ.作成元
        columns.push(search.createColumn({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' }));
        // DJ_クレジットメモ.トランザクション番号
        columns.push(search.createColumn({ name: 'transactionnumber', join: 'custbody_djkk_invoice_creditmemo' }));
        columns.push(search.createColumn({name: 'line'}));
        // アイテム.DJ_値引きアイテム
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));
        
        let results = searchResult(search.Type.INVOICE, filters, columns);

        results.map(function(tmpResult) {
            /** 
             * 内部ID
             * @type {string | number}
             */
            let tmpId = tmpResult.id;

            let tmpKey = [tmpId, tmpResult.getValue({name: 'line'}).toString()].join('-');

            if (arrPrimaryKeys.indexOf(tmpKey) >= 0) {
                return;
            }

            arrPrimaryKeys.push(tmpKey);

            /** 
             * 最終送信先コード
             * @type {string}
             */
            let tmpFinalDestinationCode = tmpResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' });

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                let objInvoiceDatas = {};
                let arrInvoiceDetailDatas = [];

                arrInvoiceDetailDatas.push(tmpResult);

                objInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objInvoiceDatas;
            } else {
                let tmpObjInvoiceDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjInvoiceDatas.hasOwnProperty(tmpId.toString())) {
                    let arrInvoiceDetailDatas = [];

                    arrInvoiceDetailDatas.push(tmpResult);

                    tmpObjInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;
                } else {
                    let tmpArrInvoiceDetailDatas = tmpObjInvoiceDatas[(tmpId.toString())];
                    tmpArrInvoiceDetailDatas.push(tmpResult);
                    tmpObjInvoiceDatas[(tmpId.toString())] = tmpArrInvoiceDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjInvoiceDatas;
            }
        });

        return objResult;
    }

    /**
     * データ整理
     * @param {object} normalDatas 通常データ
     * @param {object} redDatas 赤伝データ
     * @param {object} blackDatas 黒伝データ
     * @return {object}
     */
    function groupOriginDatas(normalDatas, redDatas, blackDatas) {

        let objResult = {};

        /**
         * 最終送信先コード配列
         * @type {Array}
         */
        let arrFinalDestinationCodes = [];

        Object.keys(normalDatas).forEach(function(strNormalFinalDestinationCode){
            if (arrFinalDestinationCodes.indexOf(strNormalFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strNormalFinalDestinationCode.toString());
            }
        })
    
        Object.keys(redDatas).forEach(function (strRedFinalDestinationCode) {
            if (arrFinalDestinationCodes.indexOf(strRedFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strRedFinalDestinationCode.toString());
            }
        });
    
        Object.keys(blackDatas).forEach(function (strBlackFinalDestinationCode) {
            if (arrFinalDestinationCodes.indexOf(strBlackFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strBlackFinalDestinationCode.toString());
            }
        });
    
        arrFinalDestinationCodes.forEach(function (strFinalDestinationCode) {
    
            /**
             * 該当最終送信先コード分通常データ
             * @type {object}
             */
            let objCurrentCodeNormalDatasById = [];
            if (normalDatas.hasOwnProperty(strFinalDestinationCode.toString())) {
                objCurrentCodeNormalDatasById = normalDatas[(strFinalDestinationCode.toString())];
            }
    
            /**
             * 該当最終送信先コード分赤伝票データ
             * @type {object}
             */
            let objCurrentCodeRedDatasById = [];
            if (redDatas.hasOwnProperty(strFinalDestinationCode.toString())) {
                objCurrentCodeRedDatasById = redDatas[(strFinalDestinationCode.toString())];
            }
    
            /**
             * 該当最終送信先コード分黒伝票データ
             * @type {Array}
             */
            let objCurrentCodeBlackDatasById = [];
            if (blackDatas.hasOwnProperty(strFinalDestinationCode.toString())) {
                objCurrentCodeBlackDatasById = blackDatas[(strFinalDestinationCode.toString())];
            }
    
            let objCurrentCodeDatas = {
                normal: {},
                black: {},
                red: {}
            };
            
            /**
             * 全額払データ整理用配列
             * @type {Array}
             */
            let arrFullAmountDatas = [];
            
            /**
             * 割引データ整理用配列
             * @type {Array}
             */
            let arrDiscountDatas = [];

            let objTmp = {};

            Object.keys(objCurrentCodeNormalDatasById).forEach(function (normalDataId) {
                arrFullAmountDatas = [];
                arrDiscountDatas = [];

                let arrDatasByCurrentId = objCurrentCodeNormalDatasById[normalDataId.toString()];

                arrDatasByCurrentId.forEach(function (tmpData) {
                    /**
                     * アイテム.DJ_値引きアイテム
                     * @type {boolean}
                     */
                    let flgItemDiscount = tmpData.getValue({name: 'custitem_djkk_discounteditem', join: 'item'});
                    if (!flgItemDiscount) {
                        /** アイテム.DJ_値引きアイテム = false の場合 */
                        arrFullAmountDatas.push(tmpData);
                    } else {
                        arrDiscountDatas.push(tmpData);
                    }
                });

                if (arrFullAmountDatas.length > 0) {
                    objTmp = {};
                    objTmp[normalDataId] = arrFullAmountDatas;
                    objCurrentCodeDatas.normal = objectAssign(objCurrentCodeDatas.normal, objTmp);
                }

                if (arrDiscountDatas.length > 0) {
                    objTmp = {};
                    objTmp[normalDataId + '-discount'] = arrDiscountDatas;
                    objCurrentCodeDatas.normal = objectAssign(objCurrentCodeDatas.normal, objTmp);
                }
            });

            Object.keys(objCurrentCodeRedDatasById).forEach(function (redDataId) {
                arrFullAmountDatas = [];
                arrDiscountDatas = [];

                let arrDatasByCurrentId = objCurrentCodeRedDatasById[redDataId.toString()];

                arrDatasByCurrentId.forEach(function (tmpData) {
                    /**
                     * アイテム.DJ_値引きアイテム
                     * @type {boolean}
                     */
                    let flgItemDiscount = tmpData.getValue({name: 'custitem_djkk_discounteditem', join: 'item'});
                    if (!flgItemDiscount) {
                        /** アイテム.DJ_値引きアイテム = false の場合 */
                        arrFullAmountDatas.push(tmpData);
                    } else {
                        arrDiscountDatas.push(tmpData);
                    }
                });

                if (arrFullAmountDatas.length > 0) {
                    objTmp = {};
                    objTmp[redDataId] = arrFullAmountDatas;
                    objCurrentCodeDatas.red = objectAssign(objCurrentCodeDatas.red, objTmp);
                }

                if (arrDiscountDatas.length > 0) {
                    objTmp = {};
                    objTmp[redDataId + '-discount'] = arrDiscountDatas;
                    objCurrentCodeDatas.red = objectAssign(objCurrentCodeDatas.red, objTmp);
                }
            });

            Object.keys(objCurrentCodeBlackDatasById).forEach(function (blackDataId) {
                arrFullAmountDatas = [];
                arrDiscountDatas = [];

                let arrDatasByCurrentId = objCurrentCodeBlackDatasById[blackDataId.toString()];

                arrDatasByCurrentId.forEach(function (tmpData) {
                    /**
                     * アイテム.DJ_値引きアイテム
                     * @type {boolean}
                     */
                    let flgItemDiscount = tmpData.getValue({name: 'custitem_djkk_discounteditem', join: 'item'});
                    if (!flgItemDiscount) {
                        /** アイテム.DJ_値引きアイテム = false の場合 */
                        arrFullAmountDatas.push(tmpData);
                    } else {
                        arrDiscountDatas.push(tmpData);
                    }
                });

                if (arrFullAmountDatas.length > 0) {
                    objTmp = {};
                    objTmp[blackDataId] = arrFullAmountDatas;
                    objCurrentCodeDatas.black = objectAssign(objCurrentCodeDatas.black, objTmp);
                }

                if (arrDiscountDatas.length > 0) {
                    objTmp = {};
                    objTmp[blackDataId + '-discount'] = arrDiscountDatas;
                    objCurrentCodeDatas.black = objectAssign(objCurrentCodeDatas.black, objTmp);
                }
            });
            
            objResult[(strFinalDestinationCode.toString())] = objCurrentCodeDatas;
        });

        return objResult;
    } 

    /**
     * DJ_FINET商品コードマッピングを取得
     * @param {bool} キーに「FINET送信元センターコード」を含めるか
     * @returns {Object}
     */
    function getFinetItemCodeMapping(flgHasSenderCode) {
        var objResult = {};
        var filters = [];
        filters.push(search.createFilter({
            name: 'isinactive',
            operator: search.Operator.IS,
            values: false
        }));
        var columns = [];
        // DJ_商品コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_ficm_item_code' }));
        // DJ_FINET商品コード
        columns.push(search.createColumn({ name: 'custrecord_djkk_ficm_finet_item_code' }));
        // DJ_FINET送信元センターコード.FINET送信元センターコード
        columns.push(search.createColumn({ name: 'custrecord_djkk_fcc_finet_center_code', join: 'custrecord_djkk_ficm_finet_center_code' }));

        var results = searchResult('customrecord_djkk_finet_itemcode_mapping', filters, columns);
        for (var i = 0; i < results.length; i++) {
            var tmpItemCode = results[i].getValue({ name: 'custrecord_djkk_ficm_item_code' });
            var tmpFinetItemCode = results[i].getValue({ name: 'custrecord_djkk_ficm_finet_item_code' });
            var tmpSenderCode = results[i].getValue({ name: 'custrecord_djkk_fcc_finet_center_code', join: 'custrecord_djkk_ficm_finet_center_code' });

            var tmpKey = '';

            if (flgHasSenderCode) {
                tmpKey = [tmpItemCode, tmpSenderCode].join('-');
            } else {
                tmpKey = tmpItemCode;
            }

            if (!objResult.hasOwnProperty(tmpKey.toString())) {
                objResult[(tmpKey.toString())] = tmpFinetItemCode;
            }
        }
        return objResult;
    }

    function getUnitCodeByItem() {
        var codeResults = {};
        var filters = [];
        var columns = [];
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custitem_djkk_shipment_unit_type' }));
        var results = searchResult(search.Type.ITEM, filters, columns);
        for (var i = 0; i < results.length; i++) {
            var tmpResult = results[i];
            var tmpItemId = tmpResult.id;
            var tmpUnitCode = tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custitem_djkk_shipment_unit_type' });

            codeResults[(tmpItemId.toString())] = tmpUnitCode;
        }

        return codeResults;
    }

    /**
     * FINET請求-ファイルヘッダーレコード作成
     * @type {object} objData 
     * @param {string} objData.shippingType 出荷区分
     * @param {number} objData.serialNumber データシリアルNo.
     * @param {string} objData.systemDate システム日付
     * @param {string} objData.systemTime システム時刻
     * @param {string} objData.orderMethod DJ_注文方法区分
     * @param {string} objData.senderCenterCode 送信元センターコード
     * @param {string} objData.finalDestinationCode 最終送信先コード
     * @param {string} objData.finalDestinationCodeBk 最終送信先コード（予備）
     * @param {string} objData.directDestinationCompanyCode 直接送信先企業コード
     * @param {string} objData.directDestinationCompanyCodeBk 直接送信先企業コード（予備）
     * @type {boolean} isNormalData 通常データであるか
     * @returns {object}
     */
    function createFinetInvoiceFileHeaderRecord(objData, isNormalData) {
        return {
            // レコード区分
            recordType: '1',
            // データシリアルNo
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // 出荷区分
            shippingType: objData.shippingType,
            // メーカー計上日
            makerAppropriationDate: objData.systemDate.slice(-6),
            // データ作成時刻
            dataCreateDate: objData.systemTime,
            // ファイルNo
            fileNo: '01',
            // データ処理日
            dataProcessDate: objData.systemDate.slice(-6),
            // 利用者企業コード
            userCompanyCode: ' ',
            // 送信元センターコード
            senderCenterCode: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.senderCenterCode : 'MB8803')
                    : 'MB8803'
            ),
            // 送信元センターコード（予備）
            senderCenterCodeBK: ' ',
            // 最終送信先コード
            finalDestinationCode: objData.finalDestinationCode,
            // 最終送信先コード（予備）
            finalDestinationCodeBK: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.finalDestinationCodeBk : ' ')
                    : ' '
            ),
            // 直接送信先企業コード
            directDestinationCompanyCode: objData.directDestinationCompanyCode,
            // 直接送信先企業コード（予備）
            directDestinationCompanyCodeBK: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.directDestinationCompanyCodeBk : ' ')
                    : ' '
            ),
            // 提供企業コード
            providerCompanyCode: '13032255',
            // 提供企業事業所コード
            providerCompanyOfficeCode: '',
            // 提供企業名
            providerCompanyName: 'ﾆﾁﾌﾂﾎﾞｳｴｷ',
            // 提供企業参照事業所名
            providerCompanyOfficeName: 'ﾎﾝｼｬ',
            // 送信データ件数
            sendDataCount: '',
            // レコードサイズ
            recordSize: '128',
            // データ有無サイン,
            isDataExistence: ' ',
            // フォーマットバージョンNo
            formatVersionNo: '3',
            // 余白
            space: '',
        };
    }

    /**
     * FINET請求-伝票ヘッダーレコード作成
     * @type {object} objData 
     * @param {number} objData.serialNumber データシリアルNo.
     * @param {string} objData.shippingType 出荷区分
     * @param {string} objData.tranDate 伝票日付
     * @param {string} objData.shipDate 出荷日
     * @param {string} objData.transactionNumber 伝票番号
     * @param {string} objData.auxiliaryOrderNo 補助伝票No.
     * @param {string} objData.firstStoreCode 一次店コード
     * @param {string} objData.secondStoreCode 二次店コード
     * @param {string} objData.thirdStoreCode 三次店コード
     * @param {string} objData.forthStoreCode 四次店コード
     * @param {string} objData.fifthStoreCode 五次店コード
     * @param {string} objData.billsInfo 手形情報
     * @param {string} objData.locationType 倉直区分
     * @param {string} objData.locationCode 倉庫コード
     * @returns 
     */
    function createFinetInvoiceOrderHeaderRecord(objData) {
        return {
            // レコード区分
            recordType: '2',
            // データシリアルNo.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // 出荷区分
            shippingType: objData.shippingType,
            // メーカー計上日
            makerRecordDate: formatDate(objData.tranDate).slice(-6),
            // 出荷月日
            shippingDate: formatDate(objData.shipDate).slice(-6),
            // 出荷No.
            shippingNo: objData.transactionNumber[0] + objData.transactionNumber.slice(-7),
            // 補助伝票No．
            auxiliaryOrderNo: objData.auxiliaryOrderNo,
            // 一次店コード
            firstStoreCode: objData.firstStoreCode,
            // 二次店コード
            secondStoreCode: objData.secondStoreCode,
            // 三次店コード
            thirdStoreCode: objData.thirdStoreCode,
            // 四次店コード
            fourthStoreCode: objData.forthStoreCode,
            // 五次店コード
            fifthStoreCode: objData.fifthStoreCode,
            // 取引先コード区分（一次店）
            firstClientCodeType: ((objData.firstStoreCode != null && objData.firstStoreCode != '') ? ' ' : ''),
            // 取引先コード区分（二次店）
            secondClientCodeType: ((objData.secondStoreCode != null && objData.secondStoreCode != '') ? ' ' : ''),
            // 取引先コード区分（三次店）
            thirdClientCodeType: ((objData.thirdStoreCode != null && objData.thirdStoreCode != '') ? ' ' : ''),
            // 取引先コード区分（四次店）
            fourthClientCodeType: ((objData.forthStoreCode != null && objData.forthStoreCode != '') ? ' ' : ''),
            // 取引先コード区分（五次店）
            fifthClientCodeType: ((objData.fifthStoreCode != null && objData.fifthStoreCode != '') ? ' ' : ''),
            // 手形情報
            billsInfo: objData.billsInfo,
            // 倉直区分
            locationType: objData.locationType,
            // 配送形態
            deliveryForm: '',
            // 一斉区分
            onceType: ' ',
            // 積送品区分
            shipmentProductType: '0',
            // 出荷案内以外区分
            otherShippingInfoType: '0',
            // 集計明細区分
            totalLineType: ' ',
            // ルートセールス
            routeSales: ' ',
            // 直配料／引取料
            pickUpAmount: ' ',
            // 倉庫コード
            locationCode: objData.locationCode,
            // 照合部署コード
            collationOfficeCode: '',
            // 製品容器区分
            productContainerType: '0',
            // 元伝票日付
            originOrderDate: '',
            // 余白
            space: '',
        };
    }

    /**
     * FINET請求-伝票ヘッダーオプションレコード作成
     * @type {object} objData 
     * @param {number} objData.serialNumber データシリアルNo.
     * @param {number} objData.headerReferenceNumber ヘッダー参照No
     * @param {string} objData.customerName 社名・店名・取引先名
     * @param {string} objData.customerAddress 住所
     * @param {string} objData.clientSupportCode 取引先対応コード
     * @returns {object}
     */
    function createFinetInvoiceOrderHeaderOptionRecord(objData) {
        return {
            // レコード区分
            recordType: '3',
            // データシリアルNo
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // ヘッダー参照No.
            headerReferenceNumber: objData.headerReferenceNumber,
            // 社名・店名・取引先名  参照先確認
            customerName: objData.customerName,
            // 住所  参照先確認
            customerAddress: objData.customerAddress,
            // 取引先対応コード
            clientSupportCode: objData.clientSupportCode,
            // 日本語区分
            japaneseSection: ' ',
            // 余白
            space: ''
        };
    }

    /**
     * FINET請求-伝票ヘッダーオプションレコード２作成
     * @param {number} serialNumber データシリアルNo
     * @return {object}
     */
    function createFinetInvoiceOrderHeaderOptionSubRecord(serialNumber) {
        return {
            // レコード区分
            recordType: '4',
            // データシリアルNo
            dataSerialNo: ('0000000' + serialNumber).slice(-7),
            // メッセージ
            message: '',
            // 日本語区分
            japaneseSection: ' ',
            // 余白
            space: ''
        };
    }

    /**
     * FINET請求-伝票明細行レコード作成
     * @type {object} objData 
     * @param {number} objData.serialNumber データシリアルNo.
     * @param {number} objData.lineNumber 伝票行No
     * @param {string} objData.itemCode 商品コード
     * @param {string} objData.itemNameKana 商品名（カナ）
     * @param {number} objData.unitQuantity 入数
     * @param {number} objData.orderQuantity 数量
     * @param {number} objData.quantity 数量(標準)
     * @param {string} objData.unit 単位
     * @param {number} objData.rate 単価
     * @param {number} objData.itemUnitQuantity アイテム.DJ_入り数(入り目)
     * @param {string} objData.billingCloseDate 請求締日
     * @param {string} objData.deliveryNoteMemo DJ_納品書明細備考
     * @param {string} objData.orderNo 発注No.
     * @param {string} objData.itemCodeUsageType 商品コード使用区分
     * @returns 
     */
    function createFinetInvoiceLineRecord(objData) {
        return {
            // レコード区分
            recordType: '5',
            // データシリアルNo.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // 伝票行No．
            orderLineNumber: Number(objData.lineNumber).toString(),
            // 商品コード
            itemCode: objData.itemCode,
            // 商品名（カナ）
            itemName: objData.itemNameKana,
            // 入数
            unitQuantityInCarton: objData.unitQuantity,
            // 数量
            orderQuantity: objData.orderQuantity,
            // 単位
            unit: objData.unit,
            // 生販単価
            productionUnitAmount: Math.round(Number(objData.rate) * Number(objData.itemUnitQuantity)),
            // 金額
            amount: Math.abs(Math.round(Number(objData.rate) * Number(objData.quantity))),
            // 価格区分
            amountType: ' ',
            // 単価使用区分
            unitAmountUsageType: '2',
            // 卸売単価
            wholesaleUnitAmount: '',
            // 請求締日
            billingCloseDate: objData.billingCloseDate,
            // 請求口座
            billingAccount: '',
            // 景品割戻区分
            freebieRebateType: (objData.deliveryNoteMemo != null && objData.deliveryNoteMemo != '' && objData.deliveryNoteMemo.indexOf('サンプル') >= 0) ? '4': ' ',
            // 特殊コード
            specialCode: '6',
            // 内景品数量
            interiorPriceCount: '',
            // 発注No．
            orderNo: objData.orderNo,
            // メーカー商品分類
            makerItemType: '',
            // 商品コード使用区分
            itemCodeUsageType: objData.itemCodeUsageType,
            // 消費税区分
            taxType: ' ',
            // 決済期日
            paymentDate: '',
            // 余白
            space: '',
        };
    }

    /**
     * FINET請求-エンドレコード作成
     * @type {object} objData 
     * @param {number} objData.serialNumber データシリアルNo
     * @param {number} objData.recordCount レコード件数
     * @param {number} objData.rawVersionTotalAmount 生販金額合計
     * @param {number} objData.rebateTotalAmount 割戻金額合計
     * @param {number} objData.recoverContainerTotalAmount 回収容器金額合計
     * @param {number} objData.normalTaxApplyAmount 標準税率適用合計金額
     * @param {number} objData.reducedTaxApplyAmount 軽減税率適用合計金額
     * @param {number} objData.normalTaxAmount 消費税額(標準税率適用)
     * @param {number} objData.reducedTaxAmount 消費税額(軽減税率適用)
     * @param {number} objData.noTaxApplyAmount 非課税適用合計金額
     * @return {object}
     */
    function createFinetInvoiceEndRecord(objData) {
        return {
            // レコード区分
            recordType: '8',
            // データシリアルNo.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // レコード件数
            recordCount: objData.recordCount,
            // 生版金額合計
            rawVersionTotalAmount: objData.rawVersionTotalAmount,
            // 割戻金額合計
            rebateTotalAmount: objData.rebateTotalAmount,
            // 回収容器金額合計
            recoverContainerTotalAmount: objData.recoverContainerTotalAmount,
            // 登録番号
            registNumber: 'T6010001097269',
            // 消費税区分
            taxType: ' ',
            // 標準税率適用合計金額
            normalTaxApplyAmount: objData.normalTaxApplyAmount,
            // 軽減税率適用合計金額
            reducedTaxApplyAmount: objData.reducedTaxApplyAmount,
            // 消費税額(標準税率適用)
            normalTaxAmount: objData.normalTaxAmount,
            // 消費税額(軽減税率適用)
            reducedTaxAmount: objData.reducedTaxAmount,
            // 非課税適用合計金額
            noTaxApplyAmount: objData.noTaxApplyAmount,
            // 余白
            space: ''
        }
    }

    /**
     * FINET出荷案内-ファイルヘッダーレコード作成
     * @type {object} objData 
     * @param {string} objData.shippingType 出荷区分
     * @param {number} objData.serialNumber データシリアルNo.
     * @param {string} objData.systemDate システム日付
     * @param {string} objData.systemTime システム時刻
     * @param {string} objData.orderMethod DJ_注文方法区分
     * @param {string} objData.senderCenterCode 送信元センターコード
     * @param {string} objData.finalDestinationCode 最終送信先コード
     * @param {string} objData.finalDestinationCodeBk 最終送信先コード（予備）
     * @param {string} objData.directDestinationCompanyCode 直接送信先企業コード
     * @param {string} objData.directDestinationCompanyCodeBk 直接送信先企業コード（予備）
     * @type {boolean} isNormalData 通常データであるか
     * @returns {object}
     */
    function createFinetShippingFileHeaderRecord(objData, isNormalData) {
        return {
            // レコード区分
            recordType: '1',
            // データシリアルNo
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // 出荷区分
            shippingType: objData.shippingType,
            // メーカー計上日
            makerAppropriationDate: objData.systemDate.slice(-6),
            // データ作成時刻
            dataCreateDate: objData.systemTime,
            // ファイルNo
            fileNo: '01',
            // データ処理日
            dataProcessDate: objData.systemDate.slice(-6),
            // 利用者企業コード
            userCompanyCode: ' ',
            // 送信元センターコード
            senderCenterCode: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.senderCenterCode : 'MB8803')
                    : 'MB8803'
            ),
            // 送信元センターコード（予備）
            senderCenterCodeBK: ' ',
            // 最終送信先コード
            finalDestinationCode: objData.finalDestinationCode,
            // 最終送信先コード（予備）
            finalDestinationCodeBK: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.finalDestinationCodeBk : ' ')
                    : ' '
            ),
            // 直接送信先企業コード
            directDestinationCompanyCode: objData.directDestinationCompanyCode,
            // 直接送信先企業コード（予備）
            directDestinationCompanyCodeBK: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.directDestinationCompanyCodeBk : ' ')
                    : ' '
            ),
            // 提供企業コード
            providerCompanyCode: '13032255',
            // 提供企業事業所コード
            providerCompanyOfficeCode: '',
            // 提供企業名
            providerCompanyName: 'ﾆﾁﾌﾂﾎﾞｳｴｷ',
            // 提供企業参照事業所名
            providerCompanyOfficeName: 'ﾎﾝｼｬ',
            // 送信データ件数
            sendDataCount: '',
            // レコードサイズ
            recordSize: '128',
            // データ有無サイン,
            isDataExistence: ' ',
            // フォーマットバージョンNo
            formatVersionNo: '3',
            // 余白
            space: '',
        };
    }

    /**
     * FINET出荷案内-伝票ヘッダーレコード作成
     * @type {object} objData 
     * @param {number} objData.serialNumber データシリアルNo.
     * @param {string} objData.shippingType 出荷区分
     * @param {string} objData.tranDate 伝票日付
     * @param {string} objData.shipDate 出荷日
     * @param {string} objData.transactionNumber 伝票番号
     * @param {string} objData.auxiliaryOrderNo 補助伝票No.
     * @param {string} objData.firstStoreCode 一次店コード
     * @param {string} objData.secondStoreCode 二次店コード
     * @param {string} objData.thirdStoreCode 三次店コード
     * @param {string} objData.forthStoreCode 四次店コード
     * @param {string} objData.fifthStoreCode 五次店コード
     * @param {string} objData.billsInfo 手形情報
     * @param {string} objData.locationType 倉直区分
     * @param {string} objData.locationCode 倉庫コード
     * @returns 
     */
    function createFinetShippingOrderHeaderRecord(objData) {
        return {
            // レコード区分
            recordType: '2',
            // データシリアルNo.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // 出荷区分
            shippingType: objData.shippingType,
            // メーカー計上日
            makerRecordDate: formatDate(objData.tranDate).slice(-6),
            // 出荷月日
            shippingDate: formatDate(objData.shipDate).slice(-6),
            // 出荷No.
            shippingNo: objData.transactionNumber[0] + objData.transactionNumber.slice(-7),
            // 補助伝票No．
            auxiliaryOrderNo: objData.auxiliaryOrderNo,
            // 一次店コード
            firstStoreCode: objData.firstStoreCode,
            // 二次店コード
            secondStoreCode: objData.secondStoreCode,
            // 三次店コード
            thirdStoreCode: objData.thirdStoreCode,
            // 四次店コード
            fourthStoreCode: objData.forthStoreCode,
            // 五次店コード
            fifthStoreCode: objData.fifthStoreCode,
            // 取引先コード区分（一次店）
            firstClientCodeType: ((objData.firstStoreCode != null && objData.firstStoreCode != '') ? ' ' : ''),
            // 取引先コード区分（二次店）
            secondClientCodeType: ((objData.secondStoreCode != null && objData.secondStoreCode != '') ? ' ' : ''),
            // 取引先コード区分（三次店）
            thirdClientCodeType: ((objData.thirdStoreCode != null && objData.thirdStoreCode != '') ? ' ' : ''),
            // 取引先コード区分（四次店）
            fourthClientCodeType: ((objData.forthStoreCode != null && objData.forthStoreCode != '') ? ' ' : ''),
            // 取引先コード区分（五次店）
            fifthClientCodeType: ((objData.fifthStoreCode != null && objData.fifthStoreCode != '') ? ' ' : ''),
            // 手形情報
            billsInfo: objData.billsInfo,
            // 倉直区分
            locationType: objData.locationType,
            // 配送形態
            deliveryForm: '',
            // 一斉区分
            onceType: ' ',
            // 積送品区分
            shipmentProductType: '0',
            // 出荷案内以外区分
            otherShippingInfoType: '',
            // 集計明細区分
            totalLineType: ' ',
            // ルートセールス
            routeSales: ' ',
            // 直配料／引取料
            pickUpAmount: ' ',
            // 倉庫コード
            locationCode: objData.locationCode,
            // 照合部署コード
            collationOfficeCode: 'CS',
            // 製品容器区分
            productContainerType: '0',
            // 元伝票日付
            originOrderDate: '',
            // 余白
            space: '',
        };
    }

    /**
     * FINET出荷案内-伝票ヘッダーオプションレコード作成
     * @type {object} objData 
     * @param {number} objData.serialNumber データシリアルNo.
     * @param {number} objData.headerReferenceNumber ヘッダー参照No
     * @param {string} objData.customerName 社名・店名・取引先名
     * @param {string} objData.customerAddress 住所
     * @param {string} objData.clientSupportCode 取引先対応コード
     * @returns {object}
     */
    function createFinetShippingOrderHeaderOptionRecord(objData) {
        return {
            // レコード区分
            recordType: '3',
            // データシリアルNo
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // ヘッダー参照No.
            headerReferenceNumber: objData.headerReferenceNumber,
            // 社名・店名・取引先名  参照先確認
            customerName: objData.customerName,
            // 住所  参照先確認
            customerAddress: objData.customerAddress,
            // 取引先対応コード
            clientSupportCode: objData.clientSupportCode,
            // 日本語区分
            japaneseSection: ' ',
            // 余白
            space: ''
        };
    }

    /**
     * FINET出荷案内-伝票ヘッダーオプションレコード２作成
     * @param {number} serialNumber データシリアルNo
     * @return {object}
     */
    function createFinetShippingOrderHeaderOptionSubRecord(serialNumber) {
        return {
            // レコード区分
            recordType: '4',
            // データシリアルNo
            dataSerialNo: ('0000000' + serialNumber).slice(-7),
            // メッセージ
            message: '',
            // 日本語区分
            japaneseSection: ' ',
            // 余白
            space: ''
        };
    }

    /**
     * FINET出荷案内-伝票明細行レコード作成
     * @type {object} objData 
     * @param {number} objData.serialNumber データシリアルNo.
     * @param {number} objData.lineNumber 伝票行No
     * @param {string} objData.itemCode 商品コード
     * @param {string} objData.itemNameKana 商品名（カナ）
     * @param {number} objData.unitQuantity 入数
     * @param {number} objData.orderQuantity 数量
     * @param {number} objData.quantity 数量(標準)
     * @param {string} objData.unit 単位
     * @param {number} objData.rate 単価
     * @param {number} objData.itemUnitQuantity アイテム.DJ_入り数(入り目)
     * @param {string} objData.billingCloseDate 請求締日
     * @param {string} objData.deliveryNoteMemo DJ_納品書明細備考
     * @param {string} objData.orderNo 発注No.
     * @param {string} objData.itemCodeUsageType 商品コード使用区分
     * @returns 
     */
    function createFinetShippingLineRecord(objData) {
        return {
            // レコード区分
            recordType: '5',
            // データシリアルNo.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // 伝票行No．
            orderLineNumber: Number(objData.lineNumber).toString(),
            // 商品コード
            itemCode: objData.itemCode,
            // 商品名（カナ）
            itemName: objData.itemNameKana,
            // 入数
            unitQuantityInCarton: objData.unitQuantity,
            // 数量
            orderQuantity: objData.orderQuantity,
            // 単位
            unit: objData.unit,
            // 生販単価
            productionUnitAmount: Math.round(Number(objData.rate) * Number(objData.itemUnitQuantity)),
            // 金額
            amount: Math.abs(Math.round(Number(objData.rate) * Number(objData.quantity))),
            // 価格区分
            amountType: ' ',
            // 単価使用区分
            unitAmountUsageType: '2',
            // 卸売単価
            wholesaleUnitAmount: '',
            // 請求締日
            billingCloseDate: objData.billingCloseDate,
            // 請求口座
            billingAccount: '',
            // 景品割戻区分
            freebieRebateType: (objData.deliveryNoteMemo != null && objData.deliveryNoteMemo != '' && objData.deliveryNoteMemo.indexOf('サンプル') >= 0) ? '4': ' ',
            // 特殊コード
            specialCode: '6',
            // 内景品数量
            interiorPriceCount: '',
            // 発注No．
            orderNo: objData.orderNo,
            // メーカー商品分類
            makerItemType: '',
            // 商品コード使用区分
            itemCodeUsageType: objData.itemCodeUsageType,
            // 消費税区分
            taxType: ' ',
            // 決済期日
            paymentDate: '',
            // 余白
            space: '',
        };
    }

    /**
     * FINET出荷案内-エンドレコード作成
     * @type {object} objData 
     * @param {number} objData.serialNumber データシリアルNo
     * @param {number} objData.recordCount レコード件数
     * @param {number} objData.rawVersionTotalAmount 生販金額合計
     * @param {number} objData.rebateTotalAmount 割戻金額合計
     * @param {number} objData.recoverContainerTotalAmount 回収容器金額合計
     * @return {object}
     */
    function createFinetShippingEndRecord(objData) {
        return {
            // レコード区分
            recordType: '8',
            // データシリアルNo.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // レコード件数
            recordCount: objData.recordCount,
            // 生版金額合計
            rawVersionTotalAmount: objData.rawVersionTotalAmount,
            // 割戻金額合計
            rebateTotalAmount: objData.rebateTotalAmount,
            // 回収容器金額合計
            recoverContainerTotalAmount: objData.recoverContainerTotalAmount,
            // 余白
            space: ''
        }
    }

    /**
     * 共通検索ファンクション
     * @param searchType 検索対象
     * @param filters 検索条件
     * @param columns 検索結果列
     * @returns 検索結果
     */
    function searchResult(searchType, filters, columns) {
        var allSearchResult = [];

        var resultStep = 1000;
        var resultIndex = 0;

        var objSearch = search.create({
            type: searchType,
            filters: filters,
            columns: columns
        });

        var resultSet = objSearch.run();
        var results = [];

        do {
            results = resultSet.getRange({ start: resultIndex, end: resultIndex + resultStep });
            if (results != null && results != '') {
                for (var i = 0; i < results.length; i++) {
                    allSearchResult.push(results[i]);
                    resultIndex++;
                }
            }
        } while (results.length > 0);

        return allSearchResult;
    }

    /**
     * 日付フォーマット(YYYYMMDD)
     * @param {Date} currentDate 日付
     * @returns {String} フォーマット後日付文字列
     */
    function formatDate(currentDate) {
        if (currentDate != null && currentDate != '') {
            currentDate = format.parse({ value: currentDate, type: format.Type.DATE });
            currentDate = currentDate.getFullYear() + ('00' + (currentDate.getMonth() + 1)).slice(-2) + ('00' + currentDate.getDate()).slice(-2);
        } else {
            currentDate = '';
        }
        return currentDate;
    }

    /**
    * 日本の日付を取得する
    * 
    * @returns 日本の日付
    */
    function getJapanDateTime() {
        var now = new Date();
        var offSet = now.getTimezoneOffset();
        var offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);

        return now;
    }


    /**
     * 場所マスタ情報取得
     * @returns 
     */
    function getLocationInfo() {
        var objLocationInfo = {};

        var filters = [];
        var columns = [];
        columns.push(search.createColumn({ name: 'externalid' }));
        var results = searchResult(search.Type.LOCATION, filters, columns);
        for (var i = 0; i < results.length; i++) {
            var tmpResult = results[i];
            objLocationInfo[(tmpResult.id.toString())] = {
                externalId: tmpResult.getValue({ name: 'externalid' })
            };
        }

        return objLocationInfo;
    }

    /**
     * DJ_汎用区分マスタを取得
     * @returns {object}
     */
    function getCommonTypeCodeById() {
        let commonTypeCodeById = [];

        let filters = [];
        let columns = [];
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code' }));
        let results = searchResult('customrecord_djkk_common_type', filters, columns);
        for (let i = 0; i < results.length; i++) {
            let tmpId = results[i].id;
            let tmpTypeCode = results[i].getValue({ name: 'custrecord_djkk_type_code' });

            if (!commonTypeCodeById.hasOwnProperty(tmpId.toString())) {
                commonTypeCodeById[(tmpId.toString())] = tmpTypeCode;
            }
        }

        return commonTypeCodeById
    }

    /**
     * オブジェクト結合
     * @param {object} objOrigin 結合先オブジェクト
     * @param {object} objData データオブジェクト
     * @return {object}
     */
    function objectAssign(objOrigin, objData) {
        let objResult = objOrigin;

        Object.keys(objData).forEach(function(key) {
            objResult[key] = objData[key];
        })
        return objResult;
    }
});