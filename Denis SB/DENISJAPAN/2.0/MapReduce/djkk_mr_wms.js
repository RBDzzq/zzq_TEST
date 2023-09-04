/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/log', 'N/runtime', 'N/format', 'N/config', 'N/email'], function (recordModule, searchModule, log, runtime, format, config, email) {

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
		log.audit({
            title: 'getInputData - start',
            details: JSON.stringify(new Date())
        });
        // パラメータを取得する
        var currentScript = runtime.getCurrentScript();

        var parameterDatas = currentScript.getParameter({
            name: 'custscript_djkk_mr_ws_param'
        });
        var parameterProcessName = currentScript.getParameter({
            name: 'custscript_djkk_mr_ws_param_processname'
        });

        log.audit({
            title: 'getInputData - parameterDatas',
            details: parameterDatas
        });

        log.audit({
            title: 'getInputData - parameterProcessName',
            details: parameterProcessName
        });

        var datasForMap = [];

        switch (parameterProcessName.toString()) {
            case 'execute_inbound_update':
                // 入荷指示済み更新
                var arrayDatas = '';
                arrayDatas = JSON.parse(parameterDatas);

                for (var inboundId in arrayDatas) {
                    datasForMap.push({
                        processName: parameterProcessName,
                        inboundId: inboundId,
                        type: arrayDatas[(inboundId.toString())][0]['type'],
                        lineIds: arrayDatas[(inboundId.toString())]
                    });
                }
                break;

            case 'IF_E_0020_R_NS_FRM_HFT':
                // 入荷実績
                datasForMap = JSON.parse(parameterDatas);
                for (var i = 0; i < datasForMap.length; i++) {
                    datasForMap[i].processName = parameterProcessName;
                }
                break;
            case 'IF_E_0030_S_NS_TO_HFT':
                // 出荷指示

                datasForMap = JSON.parse(parameterDatas);
                for (var i = 0; i < datasForMap.length; i++) {
                    datasForMap[i].processName = parameterProcessName;
                }
                break;
            case 'IF_E_0040_R_NS_FRM_HFT':
                // 出荷実績
                datasForMap = JSON.parse(parameterDatas);
                for (var i = 0; i < datasForMap.length; i++) {
                    datasForMap[i].processName = parameterProcessName;
                }
                break;
            case 'IF_E_0050_S_NS_TO_HFT':
                // 転送依頼 - 送信済み更新
                var arrUpdateInfo = JSON.parse(parameterDatas);
                for (var i = 0; i < arrUpdateInfo.length; i++) {
                    datasForMap.push({
                        id: arrUpdateInfo[i].id,
                        type: arrUpdateInfo[i].type,
                        processName: parameterProcessName
                    });
                }
                break;
            case 'IF_E_0070_R_NS_FRM_HFT':
                // 在庫数量
                datasForMap = JSON.parse(parameterDatas);
                var allStockCode = [];
                var allWareHouseNumber = [];
                for (var i = 0; i < datasForMap.length; i++) {
                    var tmpStockCode = datasForMap[i].StockCode;
                    var tmpWareHouseNumber = datasForMap[i].WarehouseNumber;
                    if (allStockCode.indexOf(tmpStockCode) < 0) {
                        allStockCode.push(tmpStockCode);
                    }
                    if (allWareHouseNumber.indexOf(tmpWareHouseNumber) < 0) {
                        allWareHouseNumber.push(tmpWareHouseNumber);
                    }
                }

                var itemInfo = {};
                var filters = [];
                for (var i = 0; i < allStockCode.length; i++) {
                    filters.push(['itemid', 'is', allStockCode[i]]);
                    if (i < (allStockCode.length - 1)) {
                        filters.push('or');
                    }
                }
                var columns = [];
                columns.push(searchModule.createColumn({ name: 'itemid' }));
                var results = searchResult(searchModule.Type.ITEM, filters, columns);
                for (var i = 0; i < results.length; i++) {
                    var tmpItemId = results[i].getValue({ name: 'itemid' });
                    var tmpId = results[i].id;
                    itemInfo[(tmpItemId.toString())] = tmpId;
                }

                var locationInfo = {};
                var locationFilters = [];
                for (var i = 0; i < allWareHouseNumber.length; i++) {
                    locationFilters.push(['custrecord_djkk_wms_location_code', 'is', allWareHouseNumber[i]]);
                    if (i < (allWareHouseNumber.length - 1)) {
                        locationFilters.push('or');
                    }
                }

                var locationColumns = [];
                locationColumns.push(searchModule.createColumn({ name: 'custrecord_djkk_wms_location_code' }));
                var locationResults = searchResult(searchModule.Type.LOCATION, locationFilters, locationColumns);
                for (var i = 0; i < locationResults.length; i++) {
                    var tmpCode = locationResults[i].getValue({ name: 'custrecord_djkk_wms_location_code' });
                    var tmpId = locationResults[i].id;

                    locationInfo[(tmpCode.toString())] = tmpId;
                }

                for (var i = 0; i < datasForMap.length; i++) {
                    datasForMap[i].processName = parameterProcessName;
                    datasForMap[i].StockCode = itemInfo[(datasForMap[i].StockCode.toString())];
                    datasForMap[i].WarehouseNumber = locationInfo[(datasForMap[i].WarehouseNumber.toString())];
                }
                var infoByItem = {};
                for (var i = 0; i < datasForMap.length; i++) {
                    var tmpItemId = datasForMap[i].StockCode;

                    if (infoByItem.hasOwnProperty(tmpItemId.toString())) {
                        infoByItem[(tmpItemId.toString())].push(datasForMap[i]);
                    } else {
                        var tmp = [];
                        tmp.push(datasForMap[i]);
                        infoByItem[(tmpItemId.toString())] = tmp;
                    }
                }
                datasForMap = [];
                for (var id in infoByItem) {
                    datasForMap.push({
                        processName: parameterProcessName,
                        datas: infoByItem[(id.toString())]
                    });
                }
                break;
            case 'RESET_ERROR_ORDER_NUMBER':
                // DJ_外部システム_注文作成エラー
                var tmpDatas = JSON.parse(parameterDatas);
                datasForMap = [];
                for (var i = 0; i < tmpDatas.length; i++) {
                    datasForMap.push({
                        id: tmpDatas[i],
                        processName: parameterProcessName
                    });
                }
                break;
            case 'ORDER_PREPAYMENT_CONFIRMED':
                // 注文前払金確認済み
                var tmpDatas = JSON.parse(parameterDatas);
                datasForMap = [];
                for (var i = 0; i < tmpDatas.length; i++) {
                    datasForMap.push({
                        id: tmpDatas[i],
                        processName: parameterProcessName
                    });
                }
                break;
            case 'SHIPPING_HISTORY':
                // 出荷履歴
                datasForMap = JSON.parse(parameterDatas);
                for (var i = 0; i < datasForMap.length; i++) {
                    datasForMap[i].processName = parameterProcessName;
                }
                break;
            case 'SET_PRODUCT_ORDER':
                // セット品作成依頼
                datasForMap = JSON.parse(parameterDatas);
                for (var i = 0; i < datasForMap.length; i++) {
                    datasForMap[i].processName = parameterProcessName;
                }
                break;
            case 'IF_E_0060_R_NS_FRM_HFT':
                // 転送実績
                datasForMap = JSON.parse(parameterDatas);
                for (var i = 0; i < datasForMap.length; i++) {
                    datasForMap[i].processName = parameterProcessName;
                }
                break;
            case 'IF_E_0090_R_NS_FRM_HFT':
                // セット品作成実績取込
                datasForMap = JSON.parse(parameterDatas);
                for (var i = 0; i < datasForMap.length; i++) {
                    datasForMap[i].processName = parameterProcessName;
                }
                break;

            case 'INVENTORY_TRANSFER_RESULTS':
                datasForMap = JSON.parse(parameterDatas);
                for (var i = 0; i < datasForMap.length; i++) {
                    datasForMap[i].processName = parameterProcessName;
                }
                break;
            case 'execute_arrival':
                // 入荷実績
                // 預け倉庫内部ID取得
                var keepingLocationId = getDepositLocation();

                var arrayDatas = [];
                arrayDatas = JSON.parse(parameterDatas);
                var allOrderNumber = [];

                for (var i = 0; i < arrayDatas.length; i++) {
                    var tmpOrderNumber = arrayDatas[i]['PONumber'];
                    if (allOrderNumber.indexOf(tmpOrderNumber) < 0) {
                        allOrderNumber.push(tmpOrderNumber);
                    }
                }
                // 受注番号別内部IDを取得
                var idByOrderNumber = getInternalIdByTranID(allOrderNumber, 'custbody_djkk_exsystem_tranid');

                for (var i = 0; i < allOrderNumber.length; i++) {
                    var datasOfCurrentOrder = arrayDatas.filter(function (x) {
                        if (x.OrderNumber == allOrderNumber[i]) {
                            return true;
                        } else {
                            return false;
                        }
                    });

                    datasForMap.push({
                        processName: parameterProcessName,
                        transactionId: idByOrderNumber[(allOrderNumber[i].toString())],
                        keepingLocationId: keepingLocationId,
                        datas: datasOfCurrentOrder
                    });
                }
                break;
            case 'execute_shipment':
                // 出荷実績

                // 預け倉庫内部ID取得
                var keepingLocationId = getDepositLocation();

                var arrayDatas = '';
                arrayDatas = JSON.parse(parameterDatas);
                var allOrderNumber = [];
                var allItemCode = [];
                for (var i = 0; i < arrayDatas.length; i++) {
                    var tmpOrderNumber = arrayDatas[i].OrderNumber;
                    if (allOrderNumber.indexOf(tmpOrderNumber) < 0) {
                        allOrderNumber.push(tmpOrderNumber);
                    }

                    var tmpItemCode = arrayDatas[i]['StockCode'];

                    if (allItemCode.indexOf(tmpItemCode.toString()) < 0) {
                        allItemCode.push(tmpItemCode.toString());
                    }
                }
                // 受注番号別内部IDを取得
                var idByOrderNumber = getInternalIdByTranID(allOrderNumber, 'custbody_djkk_exsystem_tranid');
                
                var objInfoByOrderNumber = getInfoByKey(searchModule.Type.TRANSACTION, 'custbody_djkk_exsystem_tranid', allOrderNumber, ['tranid', 'type']);

                /**
                 * 商品コードに該当するアイテム内部ID
                 * @type {object}
                 */
                var objItemInternalIdByItemCode = getItemInternalIdByItemCode(allItemCode);

                var preferenceConfig = config.load({ type: config.Type.USER_PREFERENCES });
                var strDateFormat = preferenceConfig.getValue({ fieldId: 'DATEFORMAT' });

                for (var i = 0; i < arrayDatas.length; i++) {
                    var currentOrderNumber = arrayDatas[i]['OrderNumber'];
                    arrayDatas[i]['OrderNumberId'] = idByOrderNumber[(arrayDatas[i]['OrderNumber'].toString())];
                    arrayDatas[i]['KeepingLocationId'] = keepingLocationId;
                    arrayDatas[i]['StockCodeId'] = objItemInternalIdByItemCode[(arrayDatas[i]['StockCode'].toString())];
                    
                    var tmpExpirationDate = arrayDatas[i]['ActDateBestBefore'];
                    if (tmpExpirationDate != null && tmpExpirationDate != '') {
                        tmpExpirationDate = formatDate(tmpExpirationDate, strDateFormat);
                    }
                    arrayDatas[i]['ActDateBestBefore'] = tmpExpirationDate;

                    if (objInfoByOrderNumber.hasOwnProperty(currentOrderNumber.toString())) {
                        arrayDatas[i]['OrderTranId'] = objInfoByOrderNumber[currentOrderNumber.toString()]['tranid'];
                    }
                }

                for (var i = 0; i < allOrderNumber.length; i++) {
                    var datasOfCurrentOrder = arrayDatas.filter(function (x) {
                        if (x.OrderNumber == allOrderNumber[i]) {
                            return true;
                        } else {
                            return false;
                        }
                    });

                    if (datasOfCurrentOrder == null || datasOfCurrentOrder == '' || datasOfCurrentOrder.length <= 0) {
                        continue;
                    }
                    datasForMap.push({
                        processName: parameterProcessName,
                        datas: datasOfCurrentOrder
                    });
                }
                break;
            case 'execute_transfer_record':
                // 転送実績取込処理（バッチ）
                var arrayDatas = JSON.parse(parameterDatas);
                var allTranIds = [];
                var allTransactionDate = [];
                var allItemId = [];
                var allInventoryNumber = [];
                for (var i = 0; i < arrayDatas.length; i++) {
                    var tmpDeliveryDocument = arrayDatas[i]['DeliveryDocument'];
                    var tmpActTransactionDate = arrayDatas[i]['ActTransactionDate'];
                    var tmpStockCodeFrom = arrayDatas[i]['StockCodeFrom'];
                    var tmpActBatchNumberFrom = arrayDatas[i]['ActBatchNumberFrom'];
                    if (allTranIds.indexOf(tmpDeliveryDocument.toString()) < 0) {
                        allTranIds.push(tmpDeliveryDocument.toString());
                    }
                    if (allTransactionDate.indexOf(tmpActTransactionDate) < 0) {
                        allTransactionDate.push(tmpActTransactionDate);
                    }
                    if (allItemId.indexOf(tmpStockCodeFrom) < 0) {
                        allItemId.push(tmpStockCodeFrom);
                    }
                    if (allInventoryNumber.indexOf(tmpActBatchNumberFrom) < 0) {
                        allInventoryNumber.push(tmpActBatchNumberFrom);
                    }
                }

                var allInternalIdByTranId = getInternalIdByTranID(allTranIds, 'transactionnumber');
                var allInventoryNumberInfo = getInventoryNumberInfo(allItemId, allInventoryNumber);
                var allLocationIdByCode = getLocationIdByCode();

                for (var i = 0; i < arrayDatas.length; i++) {
                    arrayDatas[i]['DeliveryDocumentId'] = allInternalIdByTranId[(arrayDatas[i]['DeliveryDocument'].toString())];
                    arrayDatas[i]['processName'] = parameterProcessName;
                    arrayDatas[i]['WHFromId'] = allLocationIdByCode[(arrayDatas[i]['WHFrom'].toString())];
                    arrayDatas[i]['WHToId'] = allLocationIdByCode[(arrayDatas[i]['WHTo'].toString())];

                    var tmpLocation = arrayDatas[i]['WHFromId'];
                    var tmpItemId = arrayDatas[i]['StockCodeFrom'];
                    var tmpInventoryNumber = arrayDatas[i]['ActBatchNumberFrom'];

                    var currentInventoryInfo = allInventoryNumberInfo.filter(function (x) {
                        if (x.inventoryNumber == tmpInventoryNumber && x.location == tmpLocation && x.item == tmpItemId) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (currentInventoryInfo != null && currentInventoryInfo != '' && currentInventoryInfo.length > 0) {
                        arrayDatas[i]['ActBatchNumberFromId'] = currentInventoryInfo[0].inventoryId;
                    }
                }

                for (var i = 0; i < allTranIds.length; i++) {
                    for (var j = 0; j < allTransactionDate.length; j++) {
                        var tmpTranId = allTranIds[i];
                        var tmpDate = allTransactionDate[j];

                        var currentDatas = arrayDatas.filter(function (x) {
                            if (x['DeliveryDocument'] == tmpTranId && x['ActTransactionDate'] == tmpDate) {
                                return true;
                            } else {
                                return false;
                            }
                        });
                        if (currentDatas == null || currentDatas == '' || currentDatas.length <= 0) {
                            continue;
                        }
                        datasForMap.push({
                            processName: parameterProcessName,
                            datas: currentDatas
                        });
                    }
                }

                break;
            case 'execute_set_product':
                // セット品実績処理（バッチより）
                var arrayDatas = JSON.parse(parameterDatas);
                var allTranIds = [];
                var allTransactionDate = [];
                var allItemId = [];
                var allInventoryNumber = [];
                var allLocationCode = [];

                for (var i = 0; i < arrayDatas.length; i++) {
                    var tmpDeliveryDocument = arrayDatas[i]['DeliveryDocument'];
                    var tmpActTransactionDate = arrayDatas[i]['ActTransactionDate'];
                    var tmpStockCodeFrom = arrayDatas[i]['StockCodeFrom'];
                    var tmpActBatchNumberFrom = arrayDatas[i]['ActBatchNumberFrom'];
                    var tmpLocationCode = arrayDatas[i]['WHTo'];

                    if (allTranIds.indexOf(tmpDeliveryDocument.toString()) < 0) {
                        allTranIds.push(tmpDeliveryDocument.toString());
                    }
                    if (allTransactionDate.indexOf(tmpActTransactionDate) < 0) {
                        allTransactionDate.push(tmpActTransactionDate);
                    }
                    if (allItemId.indexOf(tmpStockCodeFrom) < 0) {
                        allItemId.push(tmpStockCodeFrom);
                    }
                    if (allInventoryNumber.indexOf(tmpActBatchNumberFrom) < 0) {
                        allInventoryNumber.push(tmpActBatchNumberFrom);
                    }

                    if (allLocationCode.indexOf(tmpLocationCode.toString()) < 0) {
                        allLocationCode.push(tmpLocationCode.toString());
                    }
                }

                var allInternalIdByTranId = getInternalIdByTranID(allTranIds, 'transactionnumber');
                var allInventoryNumberInfo = getInventoryNumberInfo(allItemId, allInventoryNumber);
                var allLocationInfo = getLocationIdByCode();
                var allItemInternalIdByItemId = {};
                var itemFilters = [];
                for (var i = 0; i < allItemId.length; i++) {
                    itemFilters.push(['itemid', 'is', allItemId[i].toString()]);
                    if (i < allItemId.length - 1) {
                        itemFilters.push('or');
                    }
                }
                var itemColumns = [];
                itemColumns.push(searchModule.createColumn({ name: 'itemid' }));
                var itemResults = searchResult(searchModule.Type.ITEM, itemFilters, itemColumns);
                for (var i = 0; i < itemResults.length; i++) {
                    var tmpId = itemResults[i].id;
                    var tmpItemId = itemResults[i].getValue({ name: 'itemid' });

                    if (!allItemInternalIdByItemId.hasOwnProperty(tmpId.toString())) {
                        allItemInternalIdByItemId[(tmpItemId.toString())] = tmpId.toString();
                    }
                }

                for (var i = 0; i < arrayDatas.length; i++) {
                    arrayDatas[i]['DeliveryDocumentId'] = allInternalIdByTranId[(arrayDatas[i]['DeliveryDocument'].toString())];
                    arrayDatas[i]['processName'] = parameterProcessName;
                    arrayDatas[i]['StockCodeFromId'] = allItemInternalIdByItemId[(arrayDatas[i]['StockCodeFrom'].toString())];
                    arrayDatas[i]['WHToId'] = allLocationInfo[(arrayDatas[i]['WHTo'].toString())];
                    var tmpLocation = arrayDatas[i]['WHToId'];
                    var tmpItemId = arrayDatas[i]['StockCodeFrom'];
                    var tmpInventoryNumber = arrayDatas[i]['ActBatchNumberFrom'];

                    var currentInventoryInfo = allInventoryNumberInfo.filter(function (x) {
                        if (x.inventoryNumber == tmpInventoryNumber && x.location == tmpLocation && x.item == tmpItemId) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (currentInventoryInfo != null && currentInventoryInfo != '' && currentInventoryInfo.length > 0) {
                        arrayDatas[i]['ActBatchNumberFromId'] = currentInventoryInfo[0].inventoryId;
                    }
                }

                for (var i = 0; i < allTranIds.length; i++) {
                    for (var j = 0; j < allTransactionDate.length; j++) {
                        var tmpTranId = allTranIds[i];
                        var tmpDate = allTransactionDate[j];

                        var currentDatas = arrayDatas.filter(function (x) {
                            if (x['DeliveryDocument'] == tmpTranId && x['ActTransactionDate'] == tmpDate) {
                                return true;
                            } else {
                                return false;
                            }
                        });
                        if (currentDatas == null || currentDatas == '' || currentDatas.length <= 0) {
                            continue;
                        }
                        datasForMap.push({
                            processName: parameterProcessName,
                            datas: currentDatas
                        });
                    }
                }
                break;
            case 'execute_dp_order_receive':
                // 消化仕入売上注文受領
                var arrayDatas = [];

                var filters = [];
                filters.push(searchModule.createFilter({
                    name: 'custbody_djkk_consignmentbuyingsaleflg',
                    operator: searchModule.Operator.IS,
                    values: true
                }));
                filters.push(searchModule.createFilter({
                    name: 'internalid',
                    operator: searchModule.Operator.IS,
                    values: 100811
                }));
                filters.push(searchModule.createFilter({
                    name: 'mainline',
                    operator: searchModule.Operator.IS,
                    values: false
                }));
                filters.push(searchModule.createFilter({
                    name: 'taxline',
                    operator: searchModule.Operator.IS,
                    values: false
                }));
                var columns = [];
                columns.push(searchModule.createColumn({ name: 'status' }));
                var results = searchResult(searchModule.Type.SALES_ORDER, filters, columns);

                var allIds = [];

                for (var i = 0; i < results.length; i++) {
                    var tmpResultId = results[i].id;
                    var tmpStatus = results[i].getValue({ name: 'status' });
                    if (allIds.indexOf(tmpResultId) < 0) {
                        if (tmpStatus != 'pendingFulfillment') {
                            continue;
                        }
                        arrayDatas.push({
                            recordId: tmpResultId,
                            processName: parameterProcessName
                        });
                        allIds.push(tmpResultId.toString());
                    }
                }
                datasForMap = arrayDatas;
                break;
        }

        log.debug({
            title: 'input - datasForMap',
            details: JSON.stringify(datasForMap)
        });
		log.audit({
            title: 'getInputData - end',
            details: JSON.stringify(new Date())
        });
        return datasForMap;
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     * 
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
		log.audit({
            title: 'map - start',
            details: JSON.stringify(new Date())
        });
        var info = JSON.parse(context.value);
        log.debug({
            title: 'map - info',
            details: JSON.stringify(info)
        });
        var processName = info['processName'];
        var systemDate = getJapanDateTime();

        switch (processName) {
            case 'execute_inbound_update':
                // 入荷指示更新
                executeInboundShipmentUpdate(info['type'], info['inboundId'], info['lineIds']);
                break;
            case 'IF_E_0020_R_NS_FRM_HFT':
                // 入荷実績
                executeArrivalRecord(JSON.stringify(info));
                break;
            case 'IF_E_0030_S_NS_TO_HFT':
                // 出荷指示
                executeShippingOrderData(info['transactionId'], info['lineIds']);
                break;
            case 'IF_E_0040_R_NS_FRM_HFT':
                // 出荷実績
                executeShipmentRecord(JSON.stringify(info));
                break;
            case 'IF_E_0050_S_NS_TO_HFT':
                // 転送依頼 - WMS送信済み更新
                recordModule.submitFields({
                    type: info['type'],
                    id: info['id'],
                    values: {
                        custbody_djkk_exsystem_wms_sended: true
                    }
                });
                break;
            case 'IF_E_0070_R_NS_FRM_HFT':
                // 在庫数量
                executeStockQuantity(info['datas']);
                break;
            case 'RESET_ERROR_ORDER_NUMBER':
                // DJ_外部システム_注文作成エラー リセット
                log.debug({
                    title: 'RESET_ERROR_ORDER_NUMBER',
                    details: 'info: ' + info
                });
                executeErrorOrderNumber(info['id']);
                break;
            case 'ORDER_PREPAYMENT_CONFIRMED':
                // 注文前払金確認済み　更新
                executeOrderPrepaymentConfirmed(info['id'], systemDate);
                break;
            case 'recovery':
                recordModule.submitFields({
                    type: recordModule.Type.INVENTORY_NUMBER,
                    id: info['id'],
                    values: {
                        custitemnumber_djkk_in_update_datetime: new Date()
                    }
                });
                break;
            case 'SHIPPING_HISTORY':
                recordModule.submitFields({
                    type: recordModule.Type.ITEM_FULFILLMENT,
                    id: info['id'],
                    values: {
                        custbody_djkk_exsystem_shippinghistory: true
                    }
                });
                break;
            case 'SET_PRODUCT_ORDER':
                // セット品作成依頼
                executeSetProductOrder(info['transactionId'], info['lineIds']);
                break;
            case 'IF_E_0060_R_NS_FRM_HFT':
                executeTransferRecord(context.value);
                // 転送実績
                break;
            case 'IF_E_0090_R_NS_FRM_HFT':
                // セット品作成実績取込
                executeSetProductResults(context.value);
                break;
            case 'INVENTORY_TRANSFER_RESULTS':
                // 在庫移動実績取込
                executeInventoryTransferResults(JSON.stringify(info));
                break;
            case 'execute_arrival':
                // 入荷実績実行（定期）
                break;
            case 'execute_shipment':
                // 出荷実績実行（定期）
                executeShipmentScheduled(info['datas']);
                break;
            case 'execute_transfer_record':
                // 転送実績処理（定期）
                executeTransferRecordScheduled(info['datas']);
                break;
            case 'execute_set_product':
                // セット品実績処理(定期)
                executeSetProductScheduled(info['datas']);
                break;
            case 'execute_dp_order_receive':
                // 消化仕入売上注文受領
                executeDPOrderReceive(info['recordId']);
                break;
        }
		log.audit({
            title: 'map - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     * 
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) { }

    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     * 
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) { }

    function executeInboundShipmentUpdate(type, inboundId, arrayLineIdWithPoId) {
		log.audit({
            title: 'executeInboundShipmentUpdate - start',
            details: JSON.stringify(new Date())
        });
        if (type == recordModule.Type.INBOUND_SHIPMENT) {
            try {
                var inboundRecord = recordModule.load({
                    type: type,
                    id: inboundId
                });

                var lineCount = inboundRecord.getLineCount({
                    sublistId: 'items'
                });
                for (var i = 0; i < lineCount; i++) {
                    var currentLineId = inboundRecord.getSublistValue({
                        sublistId: 'items',
                        fieldId: 'id',
                        line: i
                    });
                    var currentPoId = inboundRecord.getSublistValue({
                        sublistId: 'items',
                        fieldId: 'purchaseorder',
                        line: i
                    });

                    var tmp = arrayLineIdWithPoId.filter(function (x) {
                        if (x.poId == currentPoId && x.lineId == currentLineId) {
                            return true;
                        } else {
                            return false;
                        }
                    });

                    if (tmp != null && tmp != '' && tmp.length > 0) {
                        inboundRecord.setSublistValue({
                            sublistId: 'items',
                            fieldId: 'custrecord_djkk_arrival_complete',
                            line: i,
                            value: true
                        });
                    }
                }

                inboundRecord.save();
            } catch (error) {
                log.error({
                    title: 'executeInboundShipmentUpdate - error',
                    details: error.message
                });
            }
        } else {
            recordModule.submitFields({
                type: type,
                id: inboundId ,
                values: {
                    custbody_djkk_exsystem_wms_sended: true
                }
            });
        }
		log.audit({
            title: 'executeInboundShipmentUpdate - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 在庫数量作成
     * @param {String} itemId アイテムID
     * @param {Array} arrayDatas 
     */
    function executeStockQuantity(arrayDatas) {
		log.audit({
            title: 'executeStockQuantity - start',
            details: JSON.stringify(new Date())
        });
        log.debug({
            title: 'executeStockQuantity - arrayDatas',
            details: JSON.stringify(arrayDatas)
        });

        try {
            var recordId = '';

            var currentItemId = arrayDatas[0].StockCode;

            var filters = [];
            // 無効
            filters.push(searchModule.createFilter({
                name: 'isinactive',
                operator: searchModule.Operator.IS,
                values: 'F'
            }));
            // 在庫数量.アイテム
            filters.push(searchModule.createFilter({
                name: 'custrecord_djkk_stockquantity_head_item',
                operator: searchModule.Operator.IS,
                values: currentItemId
            }));

            var objSearch = searchModule.create({
                type: 'customrecord_djkk_stock_quantity_head',
                filters: filters,
                columns: []
            });
            var objResultSet = objSearch.run();
            var results = objResultSet.getRange({
                start: 0,
                end: 1
            });

            if (results != null && results != '' && results.length > 0) {
                recordId = results[0].id;
            }

            log.debug({
                title: 'executeStockQuantity - recordId',
                details: executeStockQuantity
            });

            var totalQuantity = 0;
            var record = '';

            if (recordId != null && recordId != '') {
                // 既存レコードに指定のアイテムが該当するのが存在した場合
                record = recordModule.load({
                    type: 'customrecord_djkk_stock_quantity_head',
                    id: recordId,
                    isDynamic: true
                });
                totalQuantity = record.getValue({
                    fieldId: 'custrecord_djkk_stockquantity_head_total'
                });
            } else {
                record = recordModule.create({
                    type: 'customrecord_djkk_stock_quantity_head',
                    isDynamic: true
                });
                // 在庫数量.アイテム
                record.setValue({
                    fieldId: 'custrecord_djkk_stockquantity_head_item',
                    value: currentItemId
                });
            }
            for (var i = 0; i < arrayDatas.length; i++) {
                record.selectNewLine({
                    sublistId: 'recmachcustrecord_djkk_stock_quantity_head'
                });
                // 在庫コード
                record.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_djkk_stock_quantity_head',
                    fieldId: 'custrecord_djkk_stockquantity_line_item',
                    value: arrayDatas[i].StockCode
                });
                // 倉庫
                record.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_djkk_stock_quantity_head',
                    fieldId: 'custrecord_djkk_stockquantity_line_local',
                    value: arrayDatas[i].WarehouseNumber
                });
                // バッチNo.
                record.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_djkk_stock_quantity_head',
                    fieldId: 'custrecord_djkk_stockquantity_line_batch',
                    value: arrayDatas[i].BatchNumber
                });
                // 在庫数量
                record.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_djkk_stock_quantity_head',
                    fieldId: 'custrecord_djkk_stockquantity_line_stock',
                    value: arrayDatas[i].Qty
                });
                var tmpDate = arrayDatas[i].DateBestBefore;
                tmpDate = tmpDate.substring(0, 4) + '/' + tmpDate.substring(4, 6) + '/' + tmpDate.substring(6, 8);
                // 賞味期限
                record.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_djkk_stock_quantity_head',
                    fieldId: 'custrecord_djkk_stockquantity_line_date',
                    value: format.parse({ value: new Date(tmpDate), type: format.Type.DATE })
                });
                record.commitLine({
                    sublistId: 'recmachcustrecord_djkk_stock_quantity_head'
                });
                totalQuantity += Number(arrayDatas[i].Qty);
            }

            // 在庫数量.合計数量
            record.setValue({
                fieldId: 'custrecord_djkk_stockquantity_head_total',
                value: totalQuantity
            });
            recordId = record.save();
            log.debug({
                title: '在庫数量レコード作成',
                details: '内部ID : ' + recordId
            });
        } catch (e) {
            log.error({
                title: 'executeStockQuantity - error',
                details: JSON.stringify(e.message)
            });
        }
		log.audit({
            title: 'executeStockQuantity - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 入荷実績実行
     * @param {String} strData データ文字列
     */
    function executeArrivalRecord(strData) {
		log.audit({
            title: 'executeArrivalRecord - start',
            details: JSON.stringify(new Date())
        });
        log.debug({
            title: 'executeArrivalRecord - start',
            details: 'strData: ' + strData
        });
        var objData = {};
        try {
            objData = JSON.parse(strData);
        } catch (error) {
            log.error({
                title: 'executeArrivalRecord - json変換エラー',
                details: JSON.stringify(error)
            });
        }

        if (Object.keys(objData).length > 0) {
            try {
                var record = recordModule.create({
                    type: 'customrecord_djkk_arrival_shipping_data'
                });
                // 種類
                record.setValue({
                    fieldId: 'custrecord_djkk_arrival_shipping_type',
                    value: '入荷実績'
                });
                // 取込済み
                record.setValue({
                    fieldId: 'custrecord_djkk_arrival_shipping_finish',
                    value: false
                });
                // データ
                record.setValue({
                    fieldId: 'custrecord_djkk_arrival_shipping_data',
                    value: strData
                });
                var recordId = record.save();
                log.audit({
                    title: '入荷実績取込 - 中間レコード作成',
                    details: '内部ID: ' + recordId
                });
            } catch (error) {
                log.error({
                    title: 'executeArrivalRecord - error',
                    details: JSON.stringify(error.message)
                });
                sendMail('発注番号: ' + objData['PONumber'], '入荷実績', 'カスタムレコード - 入荷・出荷実績データ 作成失敗: ' + error.message, [], true);
            }

            try {
                var arrivalResultsRecord = recordModule.create({
                    type: 'customrecord_djkk_arrival_results'
                });

                log.debug({
                    title: 'data - PONumber',
                    details: objData['PONumber']
                });

                // DJ_発注番号
                arrivalResultsRecord.setValue({
                    fieldId: 'custrecord_djkk_po_number',
                    value: objData['PONumber']
                });
                // DJ_倉庫コード
                arrivalResultsRecord.setValue({
                    fieldId: 'custrecord_djkk_ware_house_number',
                    value: objData['WarehouseNumber']
                });
                // DJ_在庫コード
                arrivalResultsRecord.setValue({
                    fieldId: 'custrecord_djkk_stock_code',
                    value: objData['StockCode']
                });
                // DJ_バッチNo.
                arrivalResultsRecord.setValue({
                    fieldId: 'custrecord_djkk_batch_number',
                    value: objData['BatchNumber']
                });
                // DJ_検品完了日
                arrivalResultsRecord.setValue({
                    fieldId: 'custrecord_djkk_ar_act_transaction_date',
                    value: objData['ActTransactionDate']
                });
                // DJ_納品個数
                arrivalResultsRecord.setValue({
                    fieldId: 'custrecord_djkk_act_pcs_qty',
                    value: objData['ActPcsQty']
                });
                // DJ_賞味期限
                arrivalResultsRecord.setValue({
                    fieldId: 'custrecord_djkk_act_date_best_before',
                    value: objData['ActDateBestBefore']
                });

                var arriveResultsRecordId = arrivalResultsRecord.save();
                log.audit({
                    title: 'executeArrivalRecord - arrivaResultsRecordId',
                    details: arriveResultsRecordId
                });
            } catch (error) {
                log.error({
                    title: 'executeArrivalRecord - arrivalResultsRecord - error',
                    details: JSON.stringify(error.message)
                });
                sendMail('発注番号: ' + objData['PONumber'], '入荷実績', 'カスタムレコード - DJ_入荷実績 作成失敗: ' + error.message, [], true);
            }
        }
		log.audit({
            title: 'executeArrivalRecord - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 転送実績取込（中間レコード作成）
     */
    function executeTransferRecord(strData) {
		log.audit({
            title: 'executeTransferRecord - start',
            details: JSON.stringify(new Date())
        });
        try {
            var record = recordModule.create({
                type: 'customrecord_djkk_arrival_shipping_data'
            });
            // 種類
            record.setValue({
                fieldId: 'custrecord_djkk_arrival_shipping_type',
                value: '転送実績'
            });
            // 取込済み
            record.setValue({
                fieldId: 'custrecord_djkk_arrival_shipping_finish',
                value: false
            });
            // データ
            record.setValue({
                fieldId: 'custrecord_djkk_arrival_shipping_data',
                value: strData
            });
            var recordId = record.save();
            log.audit({
                title: '転送実績取込 - 中間レコード作成',
                details: '内部ID: ' + recordId
            });
        } catch (error) {
            log.error({
                title: 'executeTransferRecord - error',
                details: error.message
            });
            sendMail('', '転送実績', error.message, [], true);
        }
		log.audit({
            title: 'executeTransferRecord - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * セット品作成実績取込
     * @param {*} strData 
     */
    function executeSetProductResults(strData) {
		log.audit({
            title: 'executeSetProductResults - start',
            details: JSON.stringify(new Date())
        });
        try {
            var record = recordModule.create({
                type: 'customrecord_djkk_arrival_shipping_data'
            });
            // 種類
            record.setValue({
                fieldId: 'custrecord_djkk_arrival_shipping_type',
                value: 'セット品実績'
            });
            // 取込済み
            record.setValue({
                fieldId: 'custrecord_djkk_arrival_shipping_finish',
                value: false
            });
            // データ
            record.setValue({
                fieldId: 'custrecord_djkk_arrival_shipping_data',
                value: strData
            });
            var recordId = record.save();
            log.audit({
                title: 'セット品作成実績 - 中間レコード作成',
                details: '内部ID: ' + recordId
            });
        } catch (error) {
            log.error({
                title: 'executeTransferRecord - error',
                details: error.message
            });
            sendMail('', 'セット品実績', error.message, [], true);
        }
		log.audit({
            title: 'executeSetProductResults - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 出荷実績
     * @param {String} strData データ文字列
     */
    function executeShipmentRecord(strData) {
		log.audit({
            title: 'executeShipmentRecord - start',
            details: JSON.stringify(new Date())
        });
        log.debug({
            title: 'executeShipmentRecord - start',
            details: 'strData: ' + strData
        });

        try {
            JSON.parse(strData);
        } catch (error) {
            log.error({
                title: 'executeShipmentRecord - JSON変換エラー',
                details: JSON.stringify(error)
            });
            sendMail('', '出荷実績', error.message, [], true);
        }

        try {
            var record = recordModule.create({
                type: 'customrecord_djkk_arrival_shipping_data'
            });
            // 種類
            record.setValue({
                fieldId: 'custrecord_djkk_arrival_shipping_type',
                value: '出荷実績'
            });
            // 取込済み
            record.setValue({
                fieldId: 'custrecord_djkk_arrival_shipping_finish',
                value: false
            });
            // データ
            record.setValue({
                fieldId: 'custrecord_djkk_arrival_shipping_data',
                value: strData
            });
            var recordId = record.save();
            log.audit({
                title: '出荷実績取込 - 中間レコード作成',
                details: '内部ID: ' + recordId
            });
        } catch (error) {
            log.error({
                title: 'executeShipmentRecord - error',
                details: JSON.stringify(error.message)
            });
            sendMail('', '出荷実績', error.message, [], true);
        }
		log.audit({
            title: 'executeShipmentRecord - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 出荷実績実行（定期）
     * @param {Array} arrDatas
     * @param {String} arrDatas.dataRecordId 入荷・出荷実績データ レコードID
     * @param {String} arrDatas.keepingLocationId 預け倉庫ID
     * @param {String} arrDatas.orderNumber 受注番号
     * @param {String} arrDatas.orderNumberId 受注番号内部ID
     * @param {String} arrDatas.lineNumber 明細行番号
     * @param {String} arrDatas.batchNumber 在庫コード
     * @param {String} arrDatas.actBatchNumber バッチ番号
     * @param {String} arrDatas.actQty 出荷個数
     * @param {String} arrDatas.actRemark 特記事項
     * @param {String} arrDatas.actDataBestBefore 賞味期限
     * @param {String} arrDatas.actConsOrderNumber 集約した場合の伝票No
     * @param {String} arrDatas.actConsLineNumber 集約した場合の行No
     */
    function executeShipmentScheduled(arrDatas) {
		log.audit({
            title: 'executeShipmentScheduled - start',
            details: JSON.stringify(new Date())
        });
        log.debug({
            title: 'executeShipmentScheduled - arrDatas',
            details: JSON.stringify(arrDatas)
        });

        // 実行対象トランザクションの種類
        var transactionType = '';
        // 実行対象トランザクションID
        var transactionId = arrDatas[0]['OrderNumberId'];
        var transactionStatus = '';

        // 中間レコードID
        var dataRecordIds = [];

        var flgProcessSuccess = true;

        var resultTransactionId = '';
        var allLineLocationIds = [];

        var objItemIdsByLocation = {};

        try {
            // var allLotNumber = [];
            var allOrderNumber = [];
            for (var i = 0; i < arrDatas.length; i++) {
                var tmpOrderNumber = arrDatas[i]['OrderNumber'];
                // var tmpLotNumber = arrDatas[i]['BatchNumber'];

                if (allOrderNumber.indexOf(tmpOrderNumber) < 0) {
                    allOrderNumber.push(tmpOrderNumber);
                }

                // if (allLotNumber.indexOf(tmpLotNumber) < 0) {
                //     allLotNumber.push(tmpLotNumber);
                // }
            }

            var allItemId = [];
            var allItemInternalId = [];

            var itemFilters = [];
            var tmpFilters = [];
            for (var i = 0; i < allOrderNumber.length; i++) {
                tmpFilters.push(['custbody_djkk_exsystem_tranid', 'is', allOrderNumber[i].toString()]);
                if (i < allOrderNumber.length - 1) {
                    tmpFilters.push('or');
                }
            }
            itemFilters.push(tmpFilters);
            itemFilters.push('and');
            itemFilters.push(['mainline', 'is', false]);
            itemFilters.push('and');
            itemFilters.push(['taxline', 'is', false]);
            var itemColumns = [];
            itemColumns.push(searchModule.createColumn({ name: 'item' }));
            itemColumns.push(searchModule.createColumn({ name: 'itemid', join: 'item' }));
            itemColumns.push(searchModule.createColumn({ name: 'type', join: 'item' }));
            var itemResults = searchResult(searchModule.Type.TRANSACTION, itemFilters, itemColumns);
            for (var i = 0; i < itemResults.length; i++) {
                var tmpType = itemResults[i].recordType;
                if (tmpType != searchModule.Type.SALES_ORDER && tmpType != searchModule.Type.TRANSFER_ORDER) {
                    continue;
                }

                var tmpItemType = itemResults[i].getValue({ name: 'type', join: 'item' });
                if (tmpItemType == 'OthCharge') {
                    continue;
                }

                var tmpItemId = itemResults[i].getValue({ name: 'itemid', join: 'item' });
                if (allItemId.indexOf(tmpItemId.toString()) < 0) {
                    allItemId.push(tmpItemId.toString());
                }

                var tmpItemInternalId = itemResults[i].getValue({ name: 'item' });
                if (allItemInternalId.indexOf(tmpItemInternalId) < 0) {
                    allItemInternalId.push(tmpItemInternalId.toString());
                }

                transactionType = itemResults[i].recordType;
            }

            log.debug({ title: 'allItemId', details: JSON.stringify(allItemId) });

            var transactionRecord = recordModule.load({
                type: transactionType,
                id: transactionId
            });
            transactionStatus = transactionRecord.getValue({
                fieldId: 'orderstatus'
            });
            if (transactionType == recordModule.Type.SALES_ORDER) {

                var transactionLineCount = transactionRecord.getLineCount({ sublistId: 'item' });
                for (var lineNum = 0; lineNum < transactionLineCount; lineNum++) {
                    var tmpLineLocation = transactionRecord.getSublistValue({
                        sublistId: 'item',
                        line: lineNum,
                        fieldId: 'location'
                    });

                    var tmpLineItem = transactionRecord.getSublistValue({
                        sublistId: 'item',
                        line: lineNum,
                        fieldId: 'item'
                    });

                    if (allItemInternalId.indexOf(tmpLineItem.toString()) < 0) {
                        continue;
                    }

                    var tmpLineQuantity = transactionRecord.getSublistValue({
                        sublistId: 'item',
                        line: lineNum,
                        fieldId: 'quantity'
                    });
                    var tmpLineFulfilledQuantity = transactionRecord.getSublistValue({
                        sublistId: 'item',
                        line: lineNum,
                        fieldId: 'quantityfulfilled'
                    });

                    if (tmpLineQuantity == tmpLineFulfilledQuantity) {
                        continue;
                    }

                    // var arrCurrentLineDataForLocation = arrDatas.filter(function(tmpData) {
                    //     return tmpData['LineNumber'] == transactionRecord.getSublistValue({sublistId: 'item', line: lineNum, fieldId: 'custcol_djkk_exsystem_line_num'});
                    // })

                    // if (!arrCurrentLineDataForLocation || arrCurrentLineDataForLocation.length <= 0) {
                    //     continue;
                    // }

                    if (allLineLocationIds.indexOf(tmpLineLocation.toString()) < 0) {
                        allLineLocationIds.push(tmpLineLocation.toString());
                    }

                    var tmpArrItemIds = [];
                    if (objItemIdsByLocation.hasOwnProperty(tmpLineLocation.toString())) {
                        tmpArrItemIds = objItemIdsByLocation[tmpLineLocation.toString()];
                    }

                    if (tmpArrItemIds.indexOf(tmpLineItem.toString()) < 0) {
                        tmpArrItemIds.push(tmpLineItem.toString());
                    }

                    objItemIdsByLocation[tmpLineLocation.toString()] = tmpArrItemIds;
                }
            } else {
                allLineLocationIds.push(transactionRecord.getValue({ fieldId: 'location' }));
            }
        } catch (error) {
            log.error({
                title: 'executeShipmentScheduled - データ処理エラー',
                details: error.message
            });

            sendMail(arrDatas[0]['OrderNumber'], '出荷実績', error.message, [], true);
            return;
        }

        /**
         * アイテムごとデータ配列
         * @type {object}
         */
        var objDataGroupByItemId = {};
        arrDatas.forEach(function(tmpData) {
            var currentItemId = tmpData['StockCodeId'];

            var arrCurrentItemDatas = [];
            if (objDataGroupByItemId.hasOwnProperty(currentItemId.toString())) {
                arrCurrentItemDatas = objDataGroupByItemId[(currentItemId.toString())];
            }
            arrCurrentItemDatas.push(tmpData);
            objDataGroupByItemId[(currentItemId.toString())] = arrCurrentItemDatas;
        });

        log.debug({
            title: 'allLineLocationIds',
            details: JSON.stringify(allLineLocationIds)
        });
        log.debug({
            title: 'transactionStatus',
            details: transactionStatus
        })
        
        if (allLineLocationIds.length == 0) {
            try {
                var itemFulfillmentRecordError = recordModule.transform({
                    fromType: transactionType,
                    fromId: transactionId,
                    toType: recordModule.Type.ITEM_FULFILLMENT
                });
            } catch (error) {
                log.error({
                    title: 'executeShipmentScheduled - 配送作成失敗',
                    details: error.message
                });
                
                sendMail('作成元種類: ' + transactionType + '\n　　作成元トランザクション番号: ' + arrDatas[0]['OrderTranId'] + '\n　　外部システム注文番号: ' + arrDatas[0]['OrderNumber'], '出荷実績', '配送作成失敗: ' + error.message, [], true);
            }

        }

        // if (['B', 'D', 'E'].indexOf(transactionStatus) < 0) {
        //     // 注文書/移動伝票.ステータスは「配送保留」「一部配送完了」「請求保留/一部配送完了」ではない場合
        //     log.audit({
        //         title: '配送処理実行しない',
        //         details: 'トランザクションID : ' + transactionId
        //     });
        // } else {
            for (var locationIndex = 0; locationIndex < allLineLocationIds.length; locationIndex++) {
                try {
                    log.debug({
                        title: 'transactionType',
                        details: transactionType
                    });
                    log.debug({
                        title: 'transactionId',
                        details: transactionId
                    });

                    var itemFulfillmentRecord = recordModule.transform({
                        fromType: transactionType,
                        fromId: transactionId,
                        toType: recordModule.Type.ITEM_FULFILLMENT,
                        isDynamic: true,
                        defaultValues: {
                            inventorylocation: allLineLocationIds[locationIndex]
                        }
                    });

                    itemFulfillmentRecord.setValue({
                        fieldId: 'customform',
                        value: '119'
                    })
                    // 配送.日付
                    itemFulfillmentRecord.setValue({
                        fieldId: 'trandate',
                        value: new Date()
                    });

                    // ステータス
                    itemFulfillmentRecord.setValue({
                        fieldId: 'shipstatus',
                        value: 'C'
                    });

                    var lineCount = itemFulfillmentRecord.getLineCount({ sublistId: 'item' });
                    for (var i = 0; i < lineCount; i++) {
                        
                        var currentLocationId = itemFulfillmentRecord.getSublistValue({
                            sublistId: 'item',
                            line: i,
                            fieldId: 'location'
                        });
                        var currentItemInternalId = itemFulfillmentRecord.getSublistValue({
                            sublistId: 'item',
                            line: i,
                            fieldId: 'item'
                        });

                        itemFulfillmentRecord.selectLine({
                            sublistId: 'item',
                            line: i
                        });

                        if (currentLocationId.toString() != allLineLocationIds[locationIndex].toString()) {
                            itemFulfillmentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'itemreceive',
                                value: false
                            });
                            itemFulfillmentRecord.commitLine({sublistId: 'item'});
                            continue;
                        }

                        // 該当行のデータを取得
                        var currentLineData = [];
                        if (objDataGroupByItemId.hasOwnProperty(currentItemInternalId.toString())) {
                            currentLineData = objDataGroupByItemId[(currentItemInternalId.toString())];
                        }

                        if (currentLineData == null || currentLineData == '' || currentLineData.length <= 0) {
                            // 該当行のデータがない場合、行を配送しないように更新
                            itemFulfillmentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'itemreceive',
                                value: false
                            });
                            itemFulfillmentRecord.commitLine({sublistId: 'item'});
                            continue;
                        }

                        // 該当行の実際配送数量を計算しセットする
                        var totalQuantity = 0;
                        currentLineData.forEach(function(tmpData) {
                            totalQuantity += Number(tmpData['ActQty']);
                        });

                        if (totalQuantity <= 0) {
                            
                            itemFulfillmentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'itemreceive',
                                value: false
                            });
                            itemFulfillmentRecord.commitLine({sublistId: 'item'});
                            continue;
                        }
                        
                        var currentQuantity = itemFulfillmentRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity'
                        });

                        if (Number(currentQuantity) <= totalQuantity) {
                            totalQuantity = currentQuantity;
                        }

                        // itemFulfillmentRecord.setCurrentSublistValue({
                        //     sublistId: 'item',
                        //     fieldId: 'quantity',
                        //     value: totalQuantity
                        // });

                        // DJ_明細摘要
                        itemFulfillmentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_djkk_line_memo',
                            value: currentLineData[0]['ActRemark']
                        });
                        // DJ_集約伝票番号
                        itemFulfillmentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_djkk_summarize_order_no',
                            value: currentLineData[0]['ActConsOrderNumber']
                        });
                        // DJ_集約行番号
                        itemFulfillmentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_djkk_summarize_line_no',
                            value: Number(currentLineData[0]['ActConsLineNumber'])
                        });
                        // 在庫詳細サブレコードを取得
                        var subrecord = itemFulfillmentRecord.getCurrentSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail'
                        });

                        if (subrecord == null || subrecord == '') {
                            itemFulfillmentRecord.commitLine({ sublistId: 'item' });
                            continue;
                        }

                        /**
                        * 在庫詳細明細部行数
                        * @type {number}
                        */
                        var currentSubrecordLineCount = subrecord.getLineCount({sublistId: 'inventoryassignment'});

                        for (var j = currentSubrecordLineCount - 1; j >= 0; j--) {
                            if (totalQuantity <= 0) {
                                /** 該当明細数量に対し全量引当した場合 */
                                
                                subrecord.removeLine({sublistId: 'inventoryassignment', line: j});
                                continue;
                            }

                            subrecord.selectLine({sublistId: 'inventoryassignment', line: j});

                            var currentLineInventoryNumber = subrecord.getCurrentSublistText({
                                sublistId: 'inventoryassignment',
                                fieldId: 'issueinventorynumber',
                            });

                            var currentSubrecordLineData = currentLineData.filter(function(tmpLineData) {
                                if (tmpLineData['ActBatchNumber'] == currentLineInventoryNumber 
                                    && Number(tmpLineData['ActQty']) > 0) {
                                    return true;
                                }
                                return false;
                            });

                            if (currentSubrecordLineData.length <= 0) {
                                /** 実績データに該当在庫詳細明細行の番号分のデータがない場合 */
                                subrecord.removeLine({sublistId: 'inventoryassignment', line: j});
                                continue;
                            }
                        }

                        currentSubrecordLineCount = subrecord.getLineCount({sublistId: 'inventoryassignment'});

                        for (var j = 0; j < currentSubrecordLineCount; j++) {
                            if (totalQuantity <= 0) {
                                /** 該当明細数量に対し全量引当した場合 */
                                
                                subrecord.removeLine({sublistId: 'inventoryassignment', line: j});
                                continue;
                            }

                            subrecord.selectLine({sublistId: 'inventoryassignment', line: j});

                            var currentLineInventoryNumber = subrecord.getCurrentSublistText({
                                sublistId: 'inventoryassignment',
                                fieldId: 'issueinventorynumber',
                            });

                            var currentSubrecordLineData = currentLineData.filter(function(tmpLineData) {
                                if (tmpLineData['ActBatchNumber'] == currentLineInventoryNumber
                                    && Number(tmpLineData['ActQty']) > 0) {
                                    return true;
                                }
                                return false;
                            });

                            // currentSubrecordLineData.forEach(function(tmpLineData) {

                            //     if (totalQuantity <= 0) {
                            //         return;
                            //     }

                            //     if (Number(tmpLineData['ActQty']) <= totalQuantity) {
                            //         subrecord.setCurrentSublistValue({
                            //             sublistId: 'inventoryassignment',
                            //             fieldId: 'quantity',
                            //             value: Number(tmpLineData['ActQty'])
                            //         });
                                    
                            //         totalQuantity = totalQuantity - Number(tmpLineData['ActQty']);

                            //         tmpLineData['ActQty'] = 0;
                            //     } else {
                            //         subrecord.setCurrentSublistValue({
                            //             sublistId: 'inventoryassignment',
                            //             fieldId: 'quantity',
                            //             value: totalQuantity
                            //         });

                            //         tmpLineData['ActQty'] = tmpLineData['ActQty'] - totalQuantity;

                            //         totalQuantity = 0;
                            //     }
                            // });

                            if (Number(currentSubrecordLineData[0]['ActQty']) <= totalQuantity) {
                                subrecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    value: Number(currentSubrecordLineData[0]['ActQty'])
                                });
                                
                                totalQuantity = totalQuantity - Number(currentSubrecordLineData[0]['ActQty']);

                                currentSubrecordLineData[0]['ActQty'] = 0;
                            } else {
                                subrecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    value: totalQuantity
                                });

                                currentSubrecordLineData[0]['ActQty'] = currentSubrecordLineData[0]['ActQty'] - totalQuantity;

                                totalQuantity = 0;
                            }
                            

                            // 在庫詳細.明細.賞味期限
                            if (currentSubrecordLineData[0]['ActDateBestBefore'] != null && currentSubrecordLineData[0]['ActDateBestBefore'] != '') {
                                subrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'expirationdate', value: new Date(currentSubrecordLineData[0]['ActDateBestBefore']) });
                            }
                            subrecord.commitLine({ sublistId: 'inventoryassignment' });
                        }

                        if (totalQuantity <= 0) {
                            /** 該当明細行に対し全数引当した場合、次の明細行の処理に */
                            itemFulfillmentRecord.commitLine({ sublistId: 'item' });
                            continue;                            
                        }
                        
                        currentLineData
                        .filter(function(tmpLineData) {
                            if (Number(tmpLineData['ActQty']) <= 0) {
                                return false;
                            }
                            return true;
                        })
                        .forEach(function(tmpLineData) {
                            if (totalQuantity <= 0) {
                                return;
                            }
                            subrecord.selectNewLine({ sublistId: 'inventoryassignment' });
                            // 在庫詳細.明細.ロット/シリアル番号
                            subrecord.setCurrentSublistText({ sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', text: tmpLineData['ActBatchNumber'] });
                            
                            if (totalQuantity > Number(tmpLineData['ActQty']) && Number(tmpLineData['ActQty']) > 0) {
                                // 在庫詳細.明細.数量
                                subrecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment', 
                                    fieldId: 'quantity', 
                                    value: Number(tmpLineData['ActQty'])
                                });
                                
                                totalQuantity = totalQuantity - Number(tmpLineData['ActQty']);

                                tmpLineData['ActQty'] = 0;
                            } else {
                                // 在庫詳細.明細.数量
                                subrecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment', 
                                    fieldId: 'quantity', 
                                    value: totalQuantity
                                });
                                tmpLineData['ActQty'] = Number(tmpLineData['ActQty']) - totalQuantity;

                                totalQuantity = 0;
                            }
                            
                            // 在庫詳細.明細.賞味期限
                            if (tmpLineData['ActDateBestBefore'] != null && tmpLineData['ActDateBestBefore'] != '') {
                                subrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'expirationdate', value: new Date(tmpLineData['ActDateBestBefore']) });
                            }
                            subrecord.commitLine({ sublistId: 'inventoryassignment' });
                        });
                        itemFulfillmentRecord.commitLine({sublistId: 'item'});
                    }
                    // 余剰データをセット

                    Object.keys(objDataGroupByItemId)
                    .filter(function(tmpItemId) {
                        var arrCurrentItemDatas = objDataGroupByItemId[tmpItemId.toString()].filter(function(tmpData) {
                            if (Number(tmpData['ActQty']) == 0) {
                                return false;
                            }
                            return true;
                        });

                        if (arrCurrentItemDatas.length == 0) {
                            return false;
                        }
                        return true;
                    })
                    .forEach(function(tmpItemId) {

                        var flgProcess = true;
                        allLineLocationIds.forEach(function(tmpLocationId, index) {
                            if (index <= locationIndex) {
                                return;
                            }

                            if (objItemIdsByLocation.hasOwnProperty(tmpLocationId.toString())) {
                                if (objItemIdsByLocation[tmpLocationId.toString()].indexOf(tmpItemId.toString()) >= 0) {
                                    flgProcess = false;
                                }
                            }
                        });

                        if (!flgProcess) {
                            return;
                        }
                        var tmpLineCount = itemFulfillmentRecord.getLineCount({sublistId: 'item'});
                        for (var tmpLineNum = 0; tmpLineNum < tmpLineCount; tmpLineNum++) {
                            itemFulfillmentRecord.selectLine({sublistId: 'item', line: tmpLineNum});
                            var tmpCurrentLineItemId = itemFulfillmentRecord.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item'
                            });

                            if (tmpCurrentLineItemId != tmpItemId) {
                                continue;
                            }

                            var arrDataWithQuantity = objDataGroupByItemId[tmpItemId.toString()].filter(function(tmpData) {
                                if (Number(tmpData['ActQty']) == 0) {
                                    return false;
                                }
                                return true;
                            });

                            if (arrDataWithQuantity.length == 0) {
                                continue;
                            }

                            var tmpSubrecord = itemFulfillmentRecord.getCurrentSublistSubrecord({
                                sublistId: 'item',
                                fieldId: 'inventorydetail'
                            });
                            arrDataWithQuantity.forEach(function(tmpData) {
                                tmpSubrecord.selectNewLine({ sublistId: 'inventoryassignment' });
                                // 在庫詳細.明細.ロット/シリアル番号
                                tmpSubrecord.setCurrentSublistText({ 
                                    sublistId: 'inventoryassignment', 
                                    fieldId: 'issueinventorynumber', 
                                    text: tmpData['ActBatchNumber'] 
                                });
                                
                                tmpSubrecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment', 
                                    fieldId: 'quantity', 
                                    value: tmpData['ActQty']
                                });
                                
                                // 在庫詳細.明細.賞味期限
                                if (tmpData['ActDateBestBefore'] != null && tmpData['ActDateBestBefore'] != '') {
                                    tmpSubrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'expirationdate', value: new Date(tmpData['ActDateBestBefore']) });
                                }
                                tmpSubrecord.commitLine({ sublistId: 'inventoryassignment' });
                            });

                            itemFulfillmentRecord.commitLine({sublistId: 'item'});
                        }
                    });
                    resultTransactionId = itemFulfillmentRecord.save();
                    log.audit({
                        title: 'executeShipmentScheduled - 配送作成',
                        details: '内部ID : ' + resultTransactionId
                    });

                } catch (error) {
                    log.error({
                        title: 'executeShipmentScheduled - 移動伝票 - 配送作成失敗',
                        details: error.message
                    });
                    log.debug({
                        title: 'mailtest',
                        details: JSON.stringify(arrDatas[0])
                    })
                    flgProcessSuccess = false;
                    sendMail('作成元種類: ' + transactionType + '\n　　作成元トランザクション番号: ' + arrDatas[0]['OrderTranId'] + '\n　　外部システム注文番号: ' + arrDatas[0]['OrderNumber'], '出荷実績', '配送作成失敗: ' + error.message, [], true);
                    break;

                }

                if (resultTransactionId != null && resultTransactionId != '') {
                    if (transactionType == recordModule.Type.SALES_ORDER) {
                        // 作成元は受注書である場合
                        // TODO
                    }
                    if (transactionType == recordModule.Type.TRANSFER_ORDER) {
                        // 作成元は移動伝票である場合

                        // 作成元移動伝票に関連する配送件数を取得
                        var arrFulfillmentIdOfCreatedFrom = [];
                        var arrReceiptIdOfCreatedFrom = [];

                        var arrFilters = [];
                        arrFilters.push(searchModule.createFilter({
                            name: 'createdfrom',
                            operator: searchModule.Operator.IS,
                            values: transactionId
                        }));
                        var arrResults = searchResult(searchModule.Type.TRANSACTION, arrFilters, []);
                        arrResults.forEach(function(tmpResult) {
                            var tmpRecordId = tmpResult.id;
                            var tmpRecordType = tmpResult.recordType;

                            if (tmpRecordType == recordModule.Type.ITEM_FULFILLMENT) {
                                if (arrFulfillmentIdOfCreatedFrom.indexOf(tmpRecordId.toString()) < 0) {
                                    arrFulfillmentIdOfCreatedFrom.push(tmpRecordId.toString());
                                }
                            }

                            if (tmpRecordType == recordModule.Type.ITEM_RECEIPT) {
                                if (arrReceiptIdOfCreatedFrom.indexOf(tmpRecordId.toString()) < 0) {
                                    arrReceiptIdOfCreatedFrom.push(tmpRecordId.toString());
                                }
                            }
                        })

                        try {
                            var strOriginExsystemOrderNum = searchModule.lookupFields({
                                type: transactionType,
                                id: transactionId,
                                columns: ['custbody_djkk_exsystem_tranid']
                            })['custbody_djkk_exsystem_tranid'];

                            for (var j = 0; j < (arrFulfillmentIdOfCreatedFrom.length - arrReceiptIdOfCreatedFrom.length); j++) {
                                // 受領を作成
                                var itemReceiptRecord = recordModule.transform({
                                    fromType: transactionType,
                                    fromId: transactionId,
                                    toType: recordModule.Type.ITEM_RECEIPT,
                                    isDynamic: true
                                });

                                // 受領.日付
                                itemReceiptRecord.setValue({
                                    fieldId: 'trandate',
                                    value: new Date()
                                });
                                itemReceiptRecord.setValue({
                                    fieldId: 'customform',
                                    value: '182'
                                })

                                // var lineCount = itemReceiptRecord.getLineCount({ sublistId: 'item' });
                                // for (var i = 0; i < lineCount; i++) {
                                //     // 明細.DJ_外部システム_行番号 を取得
                                //     var lineNum = itemReceiptRecord.getSublistValue({
                                //         sublistId: 'item',
                                //         line: i,
                                //         fieldId: 'custcol_djkk_exsystem_line_num'
                                //     });

                                //     var currentLocationId = itemReceiptRecord.getSublistValue({
                                //         sublistId: 'item',
                                //         line: i,
                                //         fieldId: 'location'
                                //     });
                                //     var currentItemInternalId = itemReceiptRecord.getSublistValue({
                                //         sublistId: 'item',
                                //         line: i,
                                //         fieldId: 'item'
                                //     });

                                //     itemReceiptRecord.selectLine({
                                //         sublistId: 'item',
                                //         line: i
                                //     });

                                //     //                                if (currentLocationId.toString() != allLineLocationIds[locationIndex].toString()) {
                                //     //                                    itemReceiptRecord.setCurrentSublistValue({
                                //     //                                        sublistId: 'item',
                                //     //                                        fieldId: 'itemreceive',
                                //     //                                        value: false
                                //     //                                    });
                                //     //                                    continue;
                                //     //                                }

                                //     // 該当行のデータを取得
                                //     var currentLineData = arrDatas.filter(function (x) {
                                //         if (x['LineNumber'] == lineNum) {
                                //             return true;
                                //         } else {
                                //             return false;
                                //         }
                                //     });

                                //     if (currentLineData == null || currentLineData == '' || currentLineData.length <= 0) {
                                //         // 該当行のデータがない場合、行を配送しないように更新
                                //         itemReceiptRecord.setCurrentSublistValue({
                                //             sublistId: 'item',
                                //             fieldId: 'itemreceive',
                                //             value: false
                                //         });
                                //         continue;
                                //     }

                                //     // 該当行の実際配送数量を計算しセットする
                                //     var totalQuantity = 0;
                                //     for (var j = 0; j < currentLineData.length; j++) {
                                //         totalQuantity += Number(currentLineData[j]['ActQty']);
                                //     }
                                //     itemReceiptRecord.setCurrentSublistValue({
                                //         sublistId: 'item',
                                //         fieldId: 'quantity',
                                //         value: totalQuantity
                                //     });

                                //     // DJ_明細摘要
                                //     itemReceiptRecord.setCurrentSublistValue({
                                //         sublistId: 'item',
                                //         fieldId: 'custcol_djkk_line_memo',
                                //         value: currentLineData[0]['ActRemark']
                                //     });
                                //     // DJ_集約伝票番号
                                //     itemReceiptRecord.setCurrentSublistValue({
                                //         sublistId: 'item',
                                //         fieldId: 'custcol_djkk_summarize_order_no',
                                //         value: currentLineData[0]['ActConsOrderNumber']
                                //     });
                                //     // DJ_集約行番号
                                //     itemReceiptRecord.setCurrentSublistValue({
                                //         sublistId: 'item',
                                //         fieldId: 'custcol_djkk_summarize_line_no',
                                //         value: Number(currentLineData[0]['ActConsLineNumber'])
                                //     });

                                //     // 在庫詳細サブレコードを取得
                                //     var subrecord = itemReceiptRecord.getCurrentSublistSubrecord({
                                //         sublistId: 'item',
                                //         fieldId: 'inventorydetail'
                                //     });

                                //     if (subrecord == null || subrecord == '') {
                                //         itemReceiptRecord.commitLine({ sublistId: 'item' });
                                //         continue;
                                //     }

                                //     // 在庫詳細明細行数を取得
                                //     var subRecordLineCount = subrecord.getLineCount({ sublistId: 'inventoryassignment' });
                                //     // 在庫詳細明細行を削除
                                //     for (var subLineNum = subRecordLineCount - 1; subLineNum >= 0; subLineNum--) {
                                //         subrecord.removeLine({
                                //             sublistId: 'inventoryassignment',
                                //             line: subLineNum
                                //         });
                                //     }

                                //     for (var j = 0; j < currentLineData.length; j++) {
                                //         subrecord.selectNewLine({ sublistId: 'inventoryassignment' });
                                //         subrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: currentLineData[j]['ActBatchNumber'] });
                                //         subrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantity', value: currentLineData[j]['ActQty'] });
                                //         // 在庫詳細.明細.賞味期限
                                //         if (currentLineData[j]['ActDateBestBefore']) {
                                //             subrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'expirationdate', value: new Date(currentLineData[j]['ActDateBestBefore']) });
                                //         }
                                        
                                //         subrecord.commitLine({ sublistId: 'inventoryassignment' });
                                //     }

                                //     itemReceiptRecord.commitLine({ sublistId: 'item' });
                                // }
                                var itemReceiptRecordId = itemReceiptRecord.save();
                                log.audit({
                                    title: 'executeShipmentScheduled - 受領',
                                    details: '内部ID : ' + itemReceiptRecordId
                                });
                            }

                            arrDatas.filter(function (tmpData) {
                                if (tmpData['OrderNumber'] == strOriginExsystemOrderNum) {
                                    return true;
                                }
                                return false
                            }).map(function (tmpData) {
                                if (dataRecordIds.indexOf(tmpData['recordId']) < 0) {
                                    dataRecordIds.push(tmpData['recordId']);
                                }
                            });
                        } catch (error) {
                            log.error({
                                title: 'executeShipmentScheduled - 受領作成失敗',
                                details: error.message
                            });
                            flgProcessSuccess = false;
                            sendMail('作成元種類: ' + transactionType + '\n　　作成元トランザクション番号: ' + arrDatas[0]['OrderTranId'] + '\n　　外部システム注文番号: ' + arrDatas[0]['OrderNumber'], '出荷実績', '移動伝票 より 受領作成失敗: ' + error.message, [], true);
                        }
                    }
                }
            }

            if (resultTransactionId != null && resultTransactionId != '') {
                if (transactionType == recordModule.Type.SALES_ORDER) {
                    try {

                        var strOriginExsystemOrderNum = searchModule.lookupFields({
                            type: transactionType,
                            id: transactionId,
                            columns: ['custbody_djkk_exsystem_tranid']
                        })['custbody_djkk_exsystem_tranid'];

                        /**
                        * 請求書レコード（注文書よりトランスフォーム）
                        * @type {record}
                        */
                        var recordInvoice = recordModule.transform({
                            fromType: transactionType,
                            fromId: transactionId,
                            toType: recordModule.Type.INVOICE,
                            isDynamic: true
                        });


                        var flgOriginTranFinet = searchModule.lookupFields({
                            type: transactionType,
                            id: transactionId,
                            columns: ['custbody_djkk_finet_bill_mail_flg']
                        })['custbody_djkk_finet_bill_mail_flg'];

                        if (flgOriginTranFinet) {
                            // 作成元.DJ_FINET請求送信フラグ = Trueである場合

                            recordInvoice.setText({
                                fieldId: 'custbody_djkk_finet_shipping_typ',
                                text: '00:通常出荷(黒)'
                            });
                        }

                        var recordInvoiceId = recordInvoice.save();
                        log.audit({
                            title: 'executeShipmentScheduled - 請求書作成',
                            details: '内部ID: ' + recordInvoiceId
                        });

                        arrDatas.filter(function (tmpData) {
                            if (tmpData['OrderNumber'] == strOriginExsystemOrderNum) {
                                return true;
                            }
                            return false
                        }).map(function (tmpData) {
                            if (dataRecordIds.indexOf(tmpData['recordId']) < 0) {
                                dataRecordIds.push(tmpData['recordId']);
                            }
                        });
                    } catch (error) {
                        log.error({
                            title: 'executeShipmentScheduled - 請求書作成失敗',
                            details: error
                        });
                        flgProcessSuccess = false;
                        sendMail('作成元種類: ' + transactionType + '\n　　作成元トランザクション番号: ' + arrDatas[0]['OrderTranId'] + '\n　　外部システム注文番号: ' + arrDatas[0]['OrderNumber'], '出荷実績', '注文書 より 請求書作成失敗: ' + error.message, [], true);
                    }
                }
            }
        // }
        

        if (flgProcessSuccess) { 
            if (resultTransactionId != null && resultTransactionId != '') {
                log.audit({
                    title: 'executeShipmentScheduled - resultTransactionId',
                    details: JSON.stringify(resultTransactionId)
                });
                log.audit({
                    title: 'executeShipmentScheduled - dataRecordIds',
                    details: JSON.stringify(dataRecordIds)
                });
    
                for (var i = 0; i < dataRecordIds.length; i++) {
                    updateDataRecord(dataRecordIds[i], transactionId);
                }
            }
        }
        
		log.audit({
            title: 'executeShipmentScheduled - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 入荷・出荷実績データ レコード更新
     * @param {String} dataRecordId 入荷・出荷実績データ レコードID
     * @param {String} resultRecordId 作成結果トランザクションID
     */
    function updateDataRecord(dataRecordId, resultTransactionId) {
		log.audit({
            title: 'updateDataRecord - start',
            details: JSON.stringify(new Date())
        });
        try {
            recordModule.submitFields({
                type: 'customrecord_djkk_arrival_shipping_data',
                id: dataRecordId,
                values: {
                    custrecord_djkk_arrival_shipping_finish: true,
                    custrecord_djkk_arrival_shipping_result: resultTransactionId
                }
            });
            log.audit({
                title: 'updateDataRecord - 入荷・出荷実績データ更新',
                details: '内部ID : ' + dataRecordId
            });
        } catch (error) {
            log.error({
                title: 'updateDataRecord - 入荷・出荷実績データ更新エラー',
                details: error.message
            });
        }
		log.audit({
            title: 'updateDataRecord - end',
            details: JSON.stringify(new Date())
        });
    }

    function executeErrorOrderNumber(recordId) {
		log.audit({
            title: 'executeErrorOrderNumber - start',
            details: JSON.stringify(new Date())
        });
        log.debug({
            title: 'executeErrorOrderNumber - recordId',
            details: recordId
        });
        recordModule.submitFields({
            type: 'customrecord_djkk_exsystem_error_orderno',
            id: recordId,
            values: {
                'isinactive': true
            }
        });
		log.audit({
            title: 'executeErrorOrderNumber - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 前払い金受領済み 更新
     * 
     * @param salesOrderId 注文書内部ID,
     * @param sysDate システム日時
     */
    function executeOrderPrepaymentConfirmed(salesOrderId, sysDate) {
		log.audit({
            title: 'executeOrderPrepaymentConfirmed - start',
            details: JSON.stringify(new Date())
        });
        recordModule.submitFields({
            type: recordModule.Type.SALES_ORDER,
            id: salesOrderId,
            values: {
                'custbody_djkk_exsystem_send_date_time': sysDate
            }
        });
		log.audit({
            title: 'executeOrderPrepaymentConfirmed - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 出荷指示更新
     * @param {String} transactionId 更新対象トランザクションID
     * @param {Array} lineIds 更新対象行番号
     */
    function executeShippingOrderData(transactionId, lineIds) {
		log.audit({
            title: 'executeShippingOrderData - start',
            details: JSON.stringify(new Date())
        });
        try {
            var inventoryTransferRecord = recordModule.load({
                type: recordModule.Type.INVENTORY_TRANSFER,
                id: transactionId
            });

            var lineCount = inventoryTransferRecord.getLineCount({ sublistId: 'inventory' });
            for (var i = 0; i < lineCount; i++) {
                var tmpLineNum = inventoryTransferRecord.getSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'line',
                    line: i
                });

                if (lineIds.indexOf(tmpLineNum) >= 0) {
                    inventoryTransferRecord.setSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'custcol_djkk_wms_flg',
                        line: i,
                        value: true
                    });
                }
            }

            inventoryTransferRecord.save();
        } catch (error) {
            log.debug({
                title: 'executeShippingOrderData - error',
                details: error.message
            });
        }
		log.audit({
            title: 'executeShippingOrderData - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * セット品作成依頼更新
     * @param {String} transactionId 
     * @param {Array} lineIds 
     */
    function executeSetProductOrder(transactionId, lineIds) {
		log.audit({
            title: 'executeSetProductOrder - start',
            details: JSON.stringify(new Date())
        });
        log.debug({
            title: 'executeSetProductOrder',
            details: 'transactionId: ' + transactionId + ' lineIds: ' + JSON.stringify(lineIds)
        });
        try {
            var workOrderRecord = recordModule.load({
                type: recordModule.Type.WORK_ORDER,
                id: transactionId
            });

            var lineCount = workOrderRecord.getLineCount({ sublistId: 'item' });
            for (var i = 0; i < lineCount; i++) {
                var tmpLineNum = workOrderRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'line',
                    line: i
                });

                if (lineIds.indexOf(tmpLineNum) >= 0) {
                    workOrderRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_djkk_wms_flg',
                        line: i,
                        value: true
                    });
                }
            }

            workOrderRecord.save();
        } catch (error) {
            log.debug({
                title: 'executeSetProductOrder - error',
                details: error.message
            });
        }
		log.audit({
            title: 'executeSetProductOrder - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 在庫移動実績取込
     * @param {String} strData 
     */
    function executeInventoryTransferResults(strData) {
		log.audit({
            title: 'executeInventoryTransferResults - start',
            details: JSON.stringify(new Date())
        });
        var objData = JSON.parse(strData);

        try {
            var inventoryTransferRecord = recordModule.create({
                type: 'customrecord_djkk_inventory_transfer_res'
            });

            // DJ_社内納品番号(DeliveryDocument)
            inventoryTransferRecord.setValue({
                fieldId: 'custrecord_djkk_delivery_document',
                value: objData['DeliveryDocument']
            });
            // DJ_移管倉庫コードFrom
            inventoryTransferRecord.setValue({
                fieldId: 'custrecord_djkk_wh_from',
                value: objData['WHFrom']
            });
            // DJ_移管倉庫コードTo
            inventoryTransferRecord.setValue({
                fieldId: 'custrecord_djkk_wh_to',
                value: objData['WHTo']
            });
            // DJ_在庫コードFrom
            inventoryTransferRecord.setValue({
                fieldId: 'custrecord_djkk_stock_code_from',
                value: objData['StockCodeFrom']
            });
            // DJ_バッチ番号From
            inventoryTransferRecord.setValue({
                fieldId: 'custrecord_djkk_batch_number_from',
                value: objData['BatchNumberFrom']
            });
            // DJ_移管作業完了日
            inventoryTransferRecord.setValue({
                fieldId: 'custrecord_djkk_act_transaction_date',
                value: objData['ActTransactionDate']
            });
            // DJ_実績バッチ番号From
            inventoryTransferRecord.setValue({
                fieldId: 'custrecord_djkk_act_batch_number_from',
                value: objData['ActBatchNumberFrom']
            });
            // DJ_移管作業処理済数量
            inventoryTransferRecord.setValue({
                fieldId: 'custrecord_djkk_act_qty_to',
                value: objData['ActQtyTo']
            });

            var inventoryTransferRecordId = inventoryTransferRecord.save();
            log.audit({
                title: 'executeInventoryTransferResults - success',
                details: 'recordId: ' + inventoryTransferRecordId
            });
        } catch (error) {
            log.error({
                title: 'executeInventoryTransferResults - error',
                details: error.message
            });
            log.error({
                title: 'executeInventoryTransferResults - error - data',
                details: strData
            });
            sendMail('社内納品番号: ' + objData['DeliveryDocument'], '在庫移動実績取込', '在庫移動実績取込失敗: ' + error.message, [], true);
        }
		log.audit({
            title: 'executeInventoryTransferResults - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 転送実績取込（定期）
     * @param {Array} arrayDatas
     * @param {Object} arrayDatas[i]
     * @param {String} array[i]['recordId'] 中間レコード内部ID
     * @param {Object} array[i] データ
     * @param {String} array[i]['DeliveryDocument'] 社内納品書番号（Internal Delvery Note No.）
     * @param {String} array[i]['WHFrom'] 移管倉庫コードFrom
     * @param {String} array[i]['WHTo'] 移管倉庫コードTo
     * @param {String} array[i]['LineNumber'] 明細行番号
     * @param {String} array[i]['StockCodeFrom'] 在庫コードFrom
     * @param {String} array[i]['BatchNumberFrom'] バッチ番号From
     * @param {String} array[i]['ActTransactionDate'] 移管作業 完了日をｾｯﾄ
     * @param {String} array[i]['ActBatchNumberFrom'] 実績：バッチ番号From
     * @param {String} array[i]['ActQtyTo'] 移管作業 処理済数量
     * @param {String} array[i]['DeliveryDocumentId'] トランザクション内部ID
     * @param {String} array[i]['ActBatchNumberFromId'] 在庫番号内部ID
     */
    function executeTransferRecordScheduled(arrayDatas) {
		log.audit({
            title: 'executeTransferRecordScheduled - start',
            details: JSON.stringify(new Date())
        });
        log.audit({
            title: 'executeTransferRecordScheduled - arrayDatas',
            details: JSON.stringify(arrayDatas)
        });
        var itemFulfillmentRecordId = '';

        // 中間レコード内部ID
        var allDataRecordIds = [];
        for (var i = 0; i < arrayDatas.length; i++) {
            var tmpDataRecordId = arrayDatas[i]['recordId'];
            if (allDataRecordIds.indexOf(tmpDataRecordId.toString()) < 0) {
                allDataRecordIds.push(tmpDataRecordId.toString());
            }
        }

        var transferOrderId = arrayDatas[0]['DeliveryDocumentId'];

        try {
            var itemFulfillmentRecord = recordModule.transform({
                fromType: recordModule.Type.TRANSFER_ORDER,
                fromId: transferOrderId,
                toType: recordModule.Type.ITEM_FULFILLMENT,
                isDynamic: true
            });

            var strTranDate = arrayDatas[0]['ActTransactionDate'];
            var tmpTranDate = new Date(strTranDate.substring(0, 4) + '/' + strTranDate.substring(4, 6) + '/' + strTranDate.substring(6, 8));
            itemFulfillmentRecord.setValue({
                fieldId: 'trandate',
                value: tmpTranDate
            });

            itemFulfillmentRecord.setValue({
                fieldId: 'shipstatus',
                value: 'C'
            });

            var lineCount = itemFulfillmentRecord.getLineCount({ sublistId: 'item' });
            for (var i = 0; i < lineCount; i++) {

                // 明細.DJ_外部システム_行番号 を取得
                var lineNum = itemFulfillmentRecord.getSublistValue({
                    sublistId: 'item',
                    line: i,
                    fieldId: 'custcol_djkk_exsystem_line_num'
                });

                // 該当行のデータを取得
                var currentLineData = arrayDatas.filter(function (x) {
                    if (x['LineNumber'] == lineNum) {
                        return true;
                    } else {
                        return false;
                    }
                });

                itemFulfillmentRecord.selectLine({
                    sublistId: 'item',
                    line: i
                });

                if (currentLineData == null || currentLineData == '' || currentLineData.length <= 0) {
                    // 該当行のデータがない場合、行を配送しないように更新
                    itemFulfillmentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemreceive',
                        value: false
                    });
                    continue;
                }

                // 該当行の実際配送数量を計算しセットする
                var totalQuantity = 0;
                for (var j = 0; j < currentLineData.length; j++) {
                    totalQuantity += Number(currentLineData[j]['ActQtyTo']);
                }
                itemFulfillmentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: totalQuantity
                });

                // 在庫詳細サブレコードを取得
                var subrecord = itemFulfillmentRecord.getCurrentSublistSubrecord({
                    sublistId: 'item',
                    fieldId: 'inventorydetail'
                });

                if (subrecord == null || subrecord == '') {
                    itemFulfillmentRecord.commitLine({ sublistId: 'item' });
                    continue;
                }

                var tmpRemoveInventoryQuantity = {};

                // 在庫詳細明細行数を取得
                var subRecordLineCount = subrecord.getLineCount({ sublistId: 'inventoryassignment' });
                // 在庫詳細明細行を削除
                for (var subLineNum = subRecordLineCount - 1; subLineNum >= 0; subLineNum--) {
                    var tmpInventoryId = subrecord.getSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'issueinventorynumber',
                        line: subLineNum
                    });
                    var tmpQuantity = Number(subrecord.getSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'quantity',
                        line: subLineNum
                    }));
                    if (tmpRemoveInventoryQuantity.hasOwnProperty(tmpInventoryId.toString())) {
                        tmpRemoveInventoryQuantity[(tmpInventoryId)] = Number(tmpRemoveInventoryQuantity[(tmpInventoryId)]) + tmpQuantity;
                    } else {
                        tmpRemoveInventoryQuantity[(tmpInventoryId)] = tmpQuantity;
                    }
                    subrecord.removeLine({
                        sublistId: 'inventoryassignment',
                        line: subLineNum
                    });
                }

                for (var j = 0; j < currentLineData.length; j++) {
                    subrecord.selectNewLine({ sublistId: 'inventoryassignment' });
                    subrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', value: currentLineData[j]['ActBatchNumberFromId'] });
                    subrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantity', value: currentLineData[j]['ActQtyTo'] });

                    if (tmpRemoveInventoryQuantity.hasOwnProperty(currentLineData[j]['ActBatchNumberFromId'].toString())) {
                        if (Number(tmpRemoveInventoryQuantity[(currentLineData[j]['ActBatchNumberFromId'].toString())]) > 0) {
                            var tmpQuantityAvailable = Number(subrecord.getCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantityavailable' }));
                            tmpQuantityAvailable += tmpRemoveInventoryQuantity[(currentLineData[j]['ActBatchNumberFromId'].toString())];
                            subrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantityavailable', value: tmpQuantityAvailable });

                            tmpRemoveInventoryQuantity[(currentLineData[j]['ActBatchNumberFromId'].toString())] = Number(tmpRemoveInventoryQuantity[(currentLineData[j]['ActBatchNumberFromId'].toString())]) - Number(currentLineData[j]['ActQtyTo']);
                        }
                    }
                    subrecord.commitLine({ sublistId: 'inventoryassignment' });
                }

                itemFulfillmentRecord.commitLine({ sublistId: 'item' });
            }

            itemFulfillmentRecordId = itemFulfillmentRecord.save();
            log.audit({
                title: 'executeTransferRecordScheduled - 配送作成',
                details: itemFulfillmentRecordId
            });
        } catch (error) {
            log.error({
                title: 'executeTransferRecordScheduled - 配送作成失敗',
                details: error.message
            });
            sendMail('社内納品書番号: ' + arrayDatas[0]['DeliveryDocumentId'], '転送実績取込', '転送実績取込-配送作成失敗: ' + error.message, [], true);
        }

        if (itemFulfillmentRecordId != null && itemFulfillmentRecordId != '') {
            try {
                var itemReceiptRecord = recordModule.transform({
                    fromType: recordModule.Type.TRANSFER_ORDER,
                    fromId: transferOrderId,
                    toType: recordModule.Type.ITEM_RECEIPT,
                    isDynamic: true
                });

                var strTranDate = arrayDatas[0]['ActTransactionDate'];
                var tmpTranDate = new Date(strTranDate.substring(0, 4) + '/' + strTranDate.substring(4, 6) + '/' + strTranDate.substring(6, 8));
                itemReceiptRecord.setValue({
                    fieldId: 'trandate',
                    value: tmpTranDate
                });

                var lineCount = itemReceiptRecord.getLineCount({ sublistId: 'item' });
                for (var i = 0; i < lineCount; i++) {

                    // 明細.DJ_外部システム_行番号 を取得
                    var lineNum = itemReceiptRecord.getSublistValue({
                        sublistId: 'item',
                        line: i,
                        fieldId: 'custcol_djkk_exsystem_line_num'
                    });

                    // 該当行のデータを取得
                    var currentLineData = arrayDatas.filter(function (x) {
                        if (x['LineNumber'] == lineNum) {
                            return true;
                        } else {
                            return false;
                        }
                    });

                    itemReceiptRecord.selectLine({
                        sublistId: 'item',
                        line: i
                    });

                    if (currentLineData == null || currentLineData == '' || currentLineData.length <= 0) {
                        // 該当行のデータがない場合、行を配送しないように更新
                        itemReceiptRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemreceive',
                            value: false
                        });
                        continue;
                    }

                    // 該当行の実際配送数量を計算しセットする
                    var totalQuantity = 0;
                    for (var j = 0; j < currentLineData.length; j++) {
                        totalQuantity += Number(currentLineData[j]['ActQtyTo']);
                    }
                    itemReceiptRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: totalQuantity
                    });

                    // 在庫詳細サブレコードを取得
                    var subrecord = itemReceiptRecord.getCurrentSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail'
                    });

                    if (subrecord == null || subrecord == '') {
                        itemReceiptRecord.commitLine({ sublistId: 'item' });
                        continue;
                    }

                    // 在庫詳細明細行数を取得
                    var subRecordLineCount = subrecord.getLineCount({ sublistId: 'inventoryassignment' });
                    // 在庫詳細明細行を削除
                    for (var subLineNum = subRecordLineCount - 1; subLineNum >= 0; subLineNum--) {
                        subrecord.removeLine({
                            sublistId: 'inventoryassignment',
                            line: subLineNum
                        });
                    }

                    for (var j = 0; j < currentLineData.length; j++) {
                        subrecord.selectNewLine({ sublistId: 'inventoryassignment' });
                        subrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: currentLineData[j]['ActBatchNumberFrom'] });
                        subrecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantity', value: currentLineData[j]['ActQtyTo'] });
                        subrecord.commitLine({ sublistId: 'inventoryassignment' });
                    }

                    itemReceiptRecord.commitLine({ sublistId: 'item' });
                }

                var itemReceiptRecordId = itemReceiptRecord.save();
                log.audit({
                    title: 'executeTransferRecordScheduled - 受領作成',
                    details: itemReceiptRecordId
                });

            } catch (error) {
                log.error({
                    title: 'executeTransferRecordScheduled - 受領作成失敗',
                    details: error.message
                });
                sendMail('社内納品書番号: ' + arrayDatas[0]['DeliveryDocumentId'], '転送実績取込', '転送実績取込-受領作成失敗: ' + error.message, [], true);
            }
        }

        if (itemReceiptRecordId != null && itemReceiptRecordId != '') {
            log.audit({
                title: 'executeTransferRecordScheduled - itemReceiptRecordId',
                details: JSON.stringify(itemReceiptRecordId)
            });
            log.audit({
                title: 'executeTransferRecordScheduled - allDataRecordIds',
                details: JSON.stringify(allDataRecordIds)
            });
            for (var i = 0; i < allDataRecordIds.length; i++) {
                updateDataRecord(allDataRecordIds[i], itemReceiptRecordId);
            }
        }
		log.audit({
            title: 'executeTransferRecordScheduled - end',
            details: JSON.stringify(new Date())
        });
    }

    function executeSetProductScheduled(datas) {
		log.audit({
            title: 'executeSetProductScheduled - start',
            details: JSON.stringify(new Date())
        });
        // 中間レコード内部IDをまとめる
        var dataRecordIds = [];
        for (var i = 0; i < datas.length; i++) {
            var tmpRecordId = datas[i]['recordId'];
            if (dataRecordIds.indexOf(tmpRecordId.toString()) < 0) {
                dataRecordIds.push(tmpRecordId.toString());
            }
        }

        var transactionId = datas[0]['DeliveryDocumentId'];

        // ワークオーダー.部品表を取得

        var workOrderRecord = recordModule.load({
            type: recordModule.Type.WORK_ORDER,
            id: transactionId
        });
        var workOrderMaterials = workOrderRecord.getValue({ fieldId: 'billofmaterials' });

        if (workOrderMaterials == null || workOrderMaterials == '') {
            // ワークオーダー.部品表はNULLである場合
            log.audit({
                title: 'セット品実績処理実行しない',
                details: 'トランザクションID : ' + transactionId
            });
        } else {
            try {
                // アセンブリ構成レコードを生成する
                var assemblyRecord = recordModule.transform({
                    fromType: recordModule.Type.WORK_ORDER,
                    fromId: transactionId,
                    toType: recordModule.Type.ASSEMBLY_BUILD,
                    isDynamic: true
                });
                // カスタムフォーム
                assemblyRecord.setValue({
                    fieldId: 'customform',
                    value: 118
                });
                var strTranDate = datas[0]['ActTransactionDate'];
                var tmpTranDate = new Date(strTranDate.substring(0, 4) + '/' + strTranDate.substring(4, 6) + '/' + strTranDate.substring(6, 8));

                assemblyRecord.setValue({
                    fieldId: 'trandate',
                    value: tmpTranDate
                });
                // アセンブリ構成.場所
                assemblyRecord.setValue({
                    fieldId: 'location',
                    value: datas[0]['WHToId']
                });
                // ヘッダ在庫詳細を作成
                var hasHeaderSubRecord = assemblyRecord.hasSubrecord({fieldId: 'inventorydetail'});
                if (hasHeaderSubRecord) {
                    assemblyRecord.removeSubrecord({fieldId: 'inventorydetail'});
                }
                var headerSubRecord = assemblyRecord.getSubrecord({fieldId: 'inventorydetail'});
                headerSubRecord.selectNewLine({sublistId: 'inventoryassignment'});
                headerSubRecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: datas[0]['BatchNumberTo']})
                headerSubRecord.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: datas[0]['ActQtyTo']});
                headerSubRecord.commitLine({sublistId: 'inventoryassignment'});

                var assemblyLineCount = assemblyRecord.getLineCount({ sublistId: 'component' });
                for (var assemblyLineNum = 0; assemblyLineNum < assemblyLineCount; assemblyLineNum++) {
                    assemblyRecord.selectLine({ sublistId: 'component', line: assemblyLineNum });

                    // 該当行のデータを取得する
                    var currentLineDatas = datas.filter(function (x) {
                        if (Number(x['LineNumber']) == (assemblyLineNum + 1)) {
                            return true;
                        } else {
                            return false;
                        }
                    });

                    if (currentLineDatas == null || currentLineDatas == '' || currentLineDatas.length <= 0) {
                        // この行に該当するデータが存在しない場合
                        assemblyRecord.setCurrentSublistValue({
                            sublistId: 'component',
                            fieldId: 'quantity',
                            value: '0'
                        });
                        assemblyRecord.commitLine({ sublistId: 'component' });
                        continue;
                    }

                    // この行の合計実績数量を計算
                    var totalQuantity = 0;
                    for (var i = 0; i < currentLineDatas.length; i++) {
                        totalQuantity += Number(currentLineDatas[i]['QtyFrom']);
                    }

                    assemblyRecord.setCurrentSublistValue({
                        sublistId: 'component',
                        fieldId: 'quantity',
                        value: totalQuantity
                    });

                    var currentLineSubrecord = assemblyRecord.getCurrentSublistSubrecord({
                        sublistId: 'component',
                        fieldId: 'componentinventorydetail'
                    });

                    var numCurrentSubrecordLineCount = currentLineSubrecord.getLineCount({sublistId: 'inventoryassignment'});
                    var arrAllocationedNumber = [];
                    for (var sublineNum = numCurrentSubrecordLineCount - 1; sublineNum >= 0; sublineNum--) {
                        currentLineSubrecord.selectLine({sublistId: 'inventoryassignment', line: sublineNum});

                        var tmpCurrentLineInventoryNumber = currentLineSubrecord.getCurrentSublistText({sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber'});

                        var arrCurrentSubLineDatas = currentLineDatas.filter(function(element) {
                            if (element['ActBatchNumberFrom'] == tmpCurrentLineInventoryNumber) {
                                return true;
                            }
                            return false;
                        });

                        if (arrCurrentSubLineDatas.length <= 0) {
                            currentLineSubrecord.removeLine({sublistId: 'inventoryassignment', line: sublineNum});
                            continue;
                        }

                        var numCurrentSubLineQuantity = 0;
                        arrCurrentSubLineDatas.forEach(function(element) {
                            numCurrentSubLineQuantity = numCurrentSubLineQuantity + Number(element['QtyFrom']);
                        });

                        currentLineSubrecord.setCurrentSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'quantity',
                            value: numCurrentSubLineQuantity
                        });
                        currentLineSubrecord.commitLine({sublistId: 'inventoryassignment'});
                        arrAllocationedNumber.push(tmpCurrentLineInventoryNumber);
                    }

                    for (var dataIndex = 0; dataIndex < currentLineDatas.length; dataIndex++) {
                        var tmpDataInventoryNumber = currentLineDatas[dataIndex]['ActBatchNumberFrom'];
                        if (arrAllocationedNumber.indexOf(tmpDataInventoryNumber) >= 0) {
                            continue;
                        }
                        currentLineSubrecord.selectNewLine({ sublistId: 'inventoryassignment' });

                        currentLineSubrecord.setCurrentSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'issueinventorynumber',
                            value: currentLineDatas[dataIndex]['ActBatchNumberFromId']
                        });
                        currentLineSubrecord.setCurrentSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'quantity',
                            value: currentLineDatas[dataIndex]['QtyFrom']
                        });

                        currentLineSubrecord.commitLine({ sublistId: 'inventoryassignment' });
                    }

                    assemblyRecord.commitLine({ sublistId: 'component' });
                }

                var assemblyRecordId = assemblyRecord.save();
                log.debug({
                    title: 'executeSetProductScheduled - assemblyRecordId',
                    details: assemblyRecordId
                });
                for (var i = 0; i < dataRecordIds.length; i++) {
                    updateDataRecord(dataRecordIds[i], assemblyRecordId);
                }
            } catch (error) {
                log.error({
                    title: 'executeSetProductScheduled - error',
                    details: error.message
                });
            }
        }
		log.audit({
            title: 'executeSetProductScheduled - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 消化仕入売上注文受領
     * 
     * @param {String} orderId 注文書内部ID
     */
    function executeDPOrderReceive(orderId) {
		log.audit({
            title: 'executeDPOrderReceive - start',
            details: JSON.stringify(new Date())
        });
        try {
            var itemFulfillmentRecord = recordModule.transform({
                fromType: recordModule.Type.SALES_ORDER,
                fromId: orderId,
                toType: recordModule.Type.ITEM_FULFILLMENT
            });
            itemFulfillmentRecord.setValue({
                fieldId: 'shipstatus',
                value: 'C'
            });
            var itemFulfillmentRecordId = itemFulfillmentRecord.save();
            log.audit({ title: '消化仕入売上注文受領 - 配送作成', details: itemFulfillmentRecordId });
        } catch (error) {
            log.error({ title: '消化仕入売上注文受領 - 配送作成失敗', details: error.message });
        }
        try {
            var invoiceRecord = recordModule.transform({
                fromType: recordModule.Type.SALES_ORDER,
                fromId: orderId,
                toType: recordModule.Type.INVOICE
            });
            invoiceRecord.setValue({ fieldId: 'approvalstatus', values: 2 });
            var invoiceRecordId = invoiceRecord.save();
            log.audit({ title: '消化仕入売上注文請求 - 請求作成', details: invoiceRecordId });
        } catch (error) {
            log.error({ title: '消化仕入売上注文請求 - 請求作成失敗', details: error.message });
        }
		log.audit({
            title: 'executeDPOrderReceive - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 日付フォーマット
     * @param {String} strDate 日付文字列
     * @param {String} strFormat フォーマット文字列
     * @return {String} 変換後日付
     */
    function formatDate(strDate, strFormat) {
        var resultDate = '';
        if (strFormat == null || strFormat == '') {
            return '';
        }
        var tmpDate = new Date(strDate.substring(0, 4) + '/' + strDate.substring(4, 6) + '/' + strDate.substring(6, 8));
        resultDate = strFormat;

        var sizeY = (resultDate.match(new RegExp('Y', "g")) || []).length;
        var sizeM = (resultDate.match(new RegExp('M', "g")) || []).length;
        var sizeD = (resultDate.match(new RegExp('D', "g")) || []).length;

        if (sizeY == 4) {
            resultDate = resultDate.replace('YYYY', tmpDate.getFullYear());
        }
        if (sizeY == 2) {
            resultDate = resultDate.replace('YY', tmpDate.getFullYear().toString().slice(-2));
        }

        if (sizeM == 2) {
            resultDate = resultDate.replace('MM', ('00' + (tmpDate.getMonth() + 1).toString()).slice(-2));
        }
        if (sizeM == 1) {
            resultDate = resultDate.replace('M', (tmpDate.getMonth() + 1).toString());
        }

        if (sizeD == 2) {
            resultDate = resultDate.replace('DD', ('00' + (tmpDate.getDate()).toString()).slice(-2));
        }
        if (sizeD == 1) {
            resultDate = resultDate.replace('D', (tmpDate.getDate()).toString());
        }
        return resultDate;
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

        var objSearch = searchModule.create({
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
     * トランザクションIDによって、内部IDを取得
     * @param {Array} tranIds トランザクションID
     * @param {String} fieldId トランザクション番号参照先フィールドID
     * @returns {Object} トランザクションID: 内部ID
     */
    function getInternalIdByTranID(tranIds, fieldId) {
        var idByTranId = {};
        var filters = [];
        var tmp = [];
        for (var i = 0; i < tranIds.length; i++) {
            tmp.push([fieldId, 'is', tranIds[i].toString()]);
            if (i < (tranIds.length - 1)) {
                tmp.push('or');
            }
        }
        filters.push(['mainline', searchModule.Operator.IS, false]);
        filters.push('and');
        filters.push(['taxline', searchModule.Operator.IS, false]);
        filters.push('and');
        filters.push(tmp);

        var columns = [];
        columns.push(searchModule.createColumn({ name: fieldId }));
        var results = searchResult(searchModule.Type.TRANSACTION, filters, columns);
        for (var i = 0; i < results.length; i++) {
            var tmpId = results[i].id;
            var tmpTranId = results[i].getValue({ name: fieldId });

            if (!idByTranId.hasOwnProperty(tmpTranId.toString())) {
                idByTranId[(tmpTranId.toString())] = tmpId;
            }
        }

        return idByTranId;
    }

    /**
     * トランザクションIDによって、内部IDを取得
     * @param {Array} arrItemIds アイテムID(itemid)
     * @param {Array} arrInventoryNumbers 在庫番号
     * @returns {Array}
     */
    function getInventoryNumberInfo(arrItemIds, arrInventoryNumbers) {
        var inventoryNumberInfo = [];
        if (arrItemIds.length <= 0 && arrInventoryNumbers.length <= 0) {
            return inventoryNumberInfo;
        }
        var filters = [];
        var tmpItem = [];
        for (var i = 0; i < arrItemIds.length; i++) {
            tmpItem.push(['item.itemid', 'is', arrItemIds[i].toString()]);
            if (i < (arrItemIds.length - 1)) {
                tmpItem.push('or');
            }
        }
        var tmpInventoryNumber = [];
        for (var i = 0; i < arrInventoryNumbers.length; i++) {
            tmpInventoryNumber.push(['inventorynumber', 'is', arrInventoryNumbers[i].toString()]);
            if (i < (arrInventoryNumbers.length - 1)) {
                tmpInventoryNumber.push('or');
            }
        }

        if (arrInventoryNumbers.length <= 0) {
            filters.push(tmpInventoryNumber);
            if (arrItemIds.length > 0) {
                filters.push('and');
            }
            
        }
        if (arrItemIds.length <= 0) {
            filters.push(tmpItem);
        }
        

        var columns = [];
        columns.push(searchModule.createColumn({ name: 'inventorynumber' }));
        columns.push(searchModule.createColumn({ name: 'itemid', join: 'item' }));
        columns.push(searchModule.createColumn({ name: 'item' }));
        columns.push(searchModule.createColumn({ name: 'location' }));

        var results = searchResult(searchModule.Type.INVENTORY_NUMBER, filters, columns);
        for (var i = 0; i < results.length; i++) {
            inventoryNumberInfo.push({
                inventoryId: results[i].id,
                inventoryNumber: results[i].getValue({ name: 'inventorynumber' }),
                item: results[i].getValue({ name: 'itemid', join: 'item' }),
                itemInternalId: results[i].getValue({ name: 'item' }),
                location: results[i].getValue({ name: 'location' })
            });
        }

        return inventoryNumberInfo;
    }

    /**
     * 預け倉庫を取得
     * @returns {String} 預け倉庫内部ID
     */
    function getDepositLocation() {
        var depositLocationId = '';

        var filters = [];
        filters.push(['name', 'contains', '川崎陸送']);
        filters.push('and');
        filters.push(['name', 'contains', '預かり在庫']);
        var results = searchResult(searchModule.Type.LOCATION, filters, []);
        if (results.length > 0) {
            depositLocationId = results[0].id;
        }

        return depositLocationId;
    }

    function getLocationIdByCode(arrLocationCodes) {
        var locationIdByCode = {};
        var filters = [];
        var columns = [];
        columns.push(searchModule.createColumn({ name: 'custrecord_djkk_wms_location_code' }));
        var results = searchResult(searchModule.Type.LOCATION, filters, columns);
        for (var i = 0; i < results.length; i++) {
            var tmpId = results[i].id;
            var tmpCode = results[i].getValue({ name: 'custrecord_djkk_wms_location_code' });

            if (tmpCode != null && tmpCode != '') {
                locationIdByCode[(tmpCode.toString())] = tmpId;
            }
        }

        return locationIdByCode;
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
     * メール送信
     * @param {string} dataKey データキー
     * @param {string} processName 処理名
     * @param {string} errorMessage エラー内容
     * @param {string | Array} recipients 受信者（デフォルト受信者のみに送信する場合指定不要）
     * @param {boolean} sendToDefaultRecipient デフォルト受信者に送信するか（デフォルト値: True）
     * @throws {string} 受信者（recipients）に指定なし、
     *                  且つデフォルト受信者送信フラグ（sendToDefaultRecipient）にFalseと指定した場合、エラー
     */
    function sendMail(dataKey, processName, errorMessage, recipients, sendToDefaultRecipient) {

        const dateSystemDate = getJapanDateTime();

        /**
         * システム日付文字列（YYYYMMDD）
         * @type {String}
         */
        const strSystemDate = dateToString(dateSystemDate, 'YYYY年MM月DD日 HH:mm:ss');

        /**
         * 受信者メールアドレス
         * @type {Array}
         */
        const arrRecipients = [];

        if (recipients == undefined) {
            recipients = [];
        }

        if (sendToDefaultRecipient == undefined) {
            sendToDefaultRecipient = true;
        }

        if (sendToDefaultRecipient) {
            /** デフォルト受信者に送信する場合 */

            arrRecipients.push('hongquan.yang@evangsol.co.jp');
            arrRecipients.push('m-mori@evangsol.co.jp');
        }

        /** 指定したの受信者を追加 */
        if (typeof recipients == 'string') {
            arrRecipients.push(recipients);
        } else {
            for (var i = 0; i < recipients.length; i++) {
                arrRecipients.push(recipients[i]);
            }
        }

        if (arrRecipients.length <= 0) {
            throw '一件や一件以上の受信者を指定してください。';
        }

        const title = '【Netsuite連携処理エラー】' + processName + '処理エラー';
        var body = '';
        body += '【処理名】\n';
        body += '　　' + processName + '\n';
        body += '【データキー】\n';
        body += '　　' + dataKey + '\n';
        body += '【発生時刻】\n';
        body += '　　' + strSystemDate + '\n';
        body += '【エラー内容】\n';
        body += '　　' + errorMessage;

        log.audit({
            title: 'sendMail-body',
            details: body
        });

        // TODO 送信者従業員更新
        //20230515 changed by zhou start
        //受信者の一時的な変更1
        // arrRecipients = 'kugenuma@car24.co.jp';
        //20230515 changed by zhou end
        
        email.send({
            author: 120,
            subject: title,
            body: body,
            recipients: arrRecipients
        });
    }

    /**
     * 日付を文字列に変換
     * @param {Date} date 日付
     * @param {String} strFormat 日付フォーマット
     * @returns {string} 日付文字列
     */
    function dateToString(date, strFormat) {
        if (!date) {
            log.error({
                title: 'dateToString - error',
                details: 'パラメータ - date が入力されていない。'
            });
        }
        if (!strFormat) {
            return JSON.stringify(date);
        }

        /**
         * 結果日付文字列
         * @type {string}
         */
        var strResultDate = strFormat;

        strResultDate = strResultDate.replace(/YYYY/g, date.getFullYear());
        strResultDate = strResultDate.replace(/YY/g, date.getFullYear().toString().substring(2, 2));
        strResultDate = strResultDate.replace(/MM/g, ('00' + (date.getMonth() + 1)).slice(-2));
        strResultDate = strResultDate.replace(/M/g, (date.getMonth() + 1));
        strResultDate = strResultDate.replace(/DD/g, ('00' + date.getDate()).slice(-2));
        strResultDate = strResultDate.replace(/D/g, date.getDate());

        strResultDate = strResultDate.replace(/HH/g, ('00' + date.getHours()).slice(-2));
        strResultDate = strResultDate.replace(/H/g, date.getHours());
        strResultDate = strResultDate.replace(/mm/g, ('00' + date.getMinutes()).slice(-2));
        strResultDate = strResultDate.replace(/m/g, date.getMinutes());
        strResultDate = strResultDate.replace(/ss/g, ('00' + date.getSeconds()).slice(-2));
        strResultDate = strResultDate.replace(/s/g, date.getSeconds());

        strResultDate = strResultDate.replace(/SSS/g, ('000' + date.getMilliseconds()).slice(-3));
        strResultDate = strResultDate.replace(/S/g, date.getMilliseconds());

        return strResultDate;
    }

    /**
     * 指定商品コードに該当するアイテム内部IDを取得
     * @param {array} arrItemCodes 
     * @returns {object}
     */
    function getItemInternalIdByItemCode(arrItemCodes) {
        let objResults = {};

        if (arrItemCodes.length <= 0) {
            return objResults;
        }

        let filters = [];
        arrItemCodes.forEach(function(tmpItemCode, index) {
            filters.push(['itemid', searchModule.Operator.IS, tmpItemCode.toString()]);
            if (index != arrItemCodes.length - 1) {
                filters.push('or');
            }
        })
        let columns = [];
        columns.push(searchModule.createColumn({name: 'itemid'}));

        let results = searchResult(searchModule.Type.ITEM, filters, columns);
        results.forEach(function(tmpResult) {
            let tmpItemCode = tmpResult.getValue({name: 'itemid'});
            
            objResults[(tmpItemCode.toString())] = tmpResult.id;
        });

        return objResults;
    }

    function getInfoByKey(recordType, strKeyFieldId, arrTargetKeyValue, arrColumnNames) {
        var objResult = {};

        if (arrTargetKeyValue == null || arrTargetKeyValue == []) {
            return objResult;
        }

        var filters = [];
        arrTargetKeyValue.forEach(function(tmpKey, index) {
            filters.push([strKeyFieldId, 'is', tmpKey.toString()]);
            if (index != arrTargetKeyValue.length - 1) {
                filters.push('or');
            }
        });
        var columns = [];
        columns.push(searchModule.createColumn({name: strKeyFieldId}));
        arrColumnNames.forEach(function(tmpColumnName) {
            columns.push(searchModule.createColumn({name: tmpColumnName}));
        })
        var results = searchResult(recordType, filters, columns);
        results.forEach(function(tmpResult) {
            var tmpKeyValue = tmpResult.getValue({name: strKeyFieldId});

            if (objResult.hasOwnProperty(tmpKeyValue.toString())) { return; }

            var objCurrentKeyResult = {};

            arrColumnNames.forEach(function(tmpColumnName) {
                objCurrentKeyResult[tmpColumnName] = tmpResult.getValue({name: tmpColumnName});
            });

            objResult[tmpKeyValue.toString()] = objCurrentKeyResult;
        });

        return objResult;
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

});