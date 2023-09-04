/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 */
define(['N/search', 'N/task', 'N/log', 'N/record'], function (search, task, log, record) {

    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        // 入荷実績実行用データ         
        var arrivalDatas = [];
        // 出荷実績実行用データ
        var shipmentDatas = [];
        // セット品実績用データ
        var setProductDatas = [];
        // 転送実績用データ
        var transferRecordDatas = [];

        var filters = [];
        // 無効 = F
        filters.push(search.createFilter({
            name: 'isinactive',
            operator: search.Operator.IS,
            values: 'F'
        }));
        // 取込済み = f
        filters.push(search.createFilter({
            name: 'custrecord_djkk_arrival_shipping_finish',
            operator: search.Operator.IS,
            values: 'F'
        }));
        var columns = [];
        // 種類
        columns.push(search.createColumn({
            name: 'custrecord_djkk_arrival_shipping_type'
        }));
        // データ
        columns.push(search.createColumn({
            name: 'custrecord_djkk_arrival_shipping_data'
        }));

        var results = searchResult('customrecord_djkk_arrival_shipping_data', filters, columns);

        /**
         * 対象データDeliveryDocument配列
         * @type {Array}
         */
        var arrDeliveryDocument = [];
        for (var i = 0; i < results.length; i++) {
            var tmpResultData = JSON.parse(results[i].getValue({ name: 'custrecord_djkk_arrival_shipping_data' }));

            if (tmpResultData.hasOwnProperty('DeliveryDocument')) {
                var tmpDeliveryDocument = tmpResultData['DeliveryDocument'];

                if (arrDeliveryDocument.indexOf(tmpDeliveryDocument) < 0) {
                    arrDeliveryDocument.push(tmpDeliveryDocument.toString());
                }
            }

            if (tmpResultData.hasOwnProperty('OrderNumber')) {
                var tmpDeliveryDocument = tmpResultData['OrderNumber'];

                if (arrDeliveryDocument.indexOf(tmpDeliveryDocument) < 0) {
                    arrDeliveryDocument.push(tmpDeliveryDocument.toString());
                }
            }

            if (tmpResultData.hasOwnProperty('PONumber')) {
                var tmpDeliveryDocument = tmpResultData['PONumber'];

                if (arrDeliveryDocument.indexOf(tmpDeliveryDocument) < 0) {
                    arrDeliveryDocument.push(tmpDeliveryDocument.toString());
                }
            }
        }

        log.debug({
            title: 'arrDeliveryDocument',
            details: JSON.stringify(arrDeliveryDocument)
        });

        /** DeliveryDocumentより対象トランザクション種類を取得 */
        var objTransactionInfo = {};
        if (arrDeliveryDocument.length > 0) {
            var transactionInfoFilters = [];

            var tranidFilters = [];
            for (var i = 0; i < arrDeliveryDocument.length; i++) {
                tranidFilters.push(['custbody_djkk_exsystem_tranid', 'is', arrDeliveryDocument[i].toString()]);
                if (i != arrDeliveryDocument.length - 1) {
                    tranidFilters.push('or');
                }
            }

            var transactionnumberFilters = [];
            for (var i = 0; i < arrDeliveryDocument.length; i++) {
                transactionnumberFilters.push(['transactionnumber', 'is', arrDeliveryDocument[i].toString()]);
                if (i != arrDeliveryDocument.length - 1) {
                    transactionnumberFilters.push('or');
                }
            }

            transactionInfoFilters.push(tranidFilters);
            transactionInfoFilters.push('or');
            transactionInfoFilters.push(transactionnumberFilters);

            var transactionInfoColumns = [];
            transactionInfoColumns.push(search.createColumn({ name: 'status' }));
            transactionInfoColumns.push(search.createColumn({ name: 'custbody_djkk_exsystem_tranid' }));
            transactionInfoColumns.push(search.createColumn({ name: 'transactionnumber' }));
            var transactionInfoResutls = searchResult(search.Type.TRANSACTION, transactionInfoFilters, transactionInfoColumns);
            for (var i = 0; i < transactionInfoResutls.length; i++) {
                var tmpTransactionInfoResult = transactionInfoResutls[i];
                var tmpExsystemTranId = tmpTransactionInfoResult.getValue({ name: 'custbody_djkk_exsystem_tranid' });
                if (tmpExsystemTranId == null || tmpExsystemTranId == '') {
                    tmpExsystemTranId = tmpTransactionInfoResult.getValue({ name: 'transactionnumber' });
                }

                if (!objTransactionInfo.hasOwnProperty(tmpExsystemTranId.toString())) {
                    objTransactionInfo[(tmpExsystemTranId.toString())] = {
                        type: tmpTransactionInfoResult.recordType,
                        status: tmpTransactionInfoResult.getValue({ name: 'status' })
                    };
                }
            }
        }

        log.debug({
            title: 'objTransactionInfo',
            details: JSON.stringify(objTransactionInfo)
        });

        for (var i = 0; i < results.length; i++) {
            var tmpResultId = results[i].id;

            var tmpResultType = results[i].getValue({ name: 'custrecord_djkk_arrival_shipping_type' });
            var tmpResultData = JSON.parse(results[i].getValue({ name: 'custrecord_djkk_arrival_shipping_data' }));

            var tmpOrderNumber = '';
            if (tmpResultData.hasOwnProperty('OrderNumber')) {
                tmpOrderNumber = tmpResultData['OrderNumber'];
            } else if (tmpResultData.hasOwnProperty('PONumber')) {
                tmpOrderNumber = tmpResultData['PONumber'];
            } else {
                tmpOrderNumber = tmpResultData['DeliveryDocument'];
            }

            if (!objTransactionInfo.hasOwnProperty(tmpOrderNumber.toString())) {
                continue;
            }
            var tmpTransactionInfo = objTransactionInfo[tmpOrderNumber.toString()];

            tmpResultData['recordId'] = tmpResultId.toString();

            if (tmpResultType.toString() == '転送実績') {

                if (tmpTransactionInfo.type == record.Type.INVENTORY_ADJUSTMENT) {
                    continue;
                }

                if (['B', 'D', 'E'].indexOf(tmpTransactionInfo.status) >= 0) {
                    continue;
                }
            }

            if (tmpResultType.toString() == 'セット品実績') {

                if (tmpTransactionInfo.status != 'pendingBuild') {
                    // ワークオーダー.ステータスは「リリース済み」ではない場合
                    continue;
                }
            }

            switch (tmpResultType.toString()) {
                case '入荷実績':
                    arrivalDatas.push(tmpResultData);
                    if (JSON.stringify(arrivalDatas).length >= 500000) {
                        arrivalDatas = arrivalDatas.slice(0, arrivalDatas.length - 1);
                        continue;
                    }
                    break;
                case '出荷実績':
                    shipmentDatas.push(tmpResultData);
                    if (JSON.stringify(shipmentDatas).length >= 500000) {
                        shipmentDatas = shipmentDatas.slice(0, shipmentDatas.length - 1);
                        continue;
                    }
                    break;
                case 'セット品実績':
                    setProductDatas.push(tmpResultData);
                    if (JSON.stringify(setProductDatas).length >= 500000) {
                        setProductDatas = setProductDatas.slice(0, setProductDatas.length - 1);
                        continue;
                    }
                    break;
                case '転送実績':
                    transferRecordDatas.push(tmpResultData);
                    if (JSON.stringify(transferRecordDatas).length >= 500000) {
                        transferRecordDatas = transferRecordDatas.slice(0, transferRecordDatas.length - 1);
                        continue;
                    }
                    break;
            }
        }
log.debug({
            title: 'transferRecordDatas.length',
            details: transferRecordDatas.length
        })
        if (arrivalDatas.length > 0) {
            // 対象となる入荷実績データが一件以上存在する場合

            var params = {
                custscript_djkk_mr_ws_param: arrivalDatas,
                custscript_djkk_mr_ws_param_processname: 'execute_arrival'
            };
            runMapReduceScript(params, 'customscript_djkk_mr_wms', 'customdeploy_djkk_mr_wms_arrival');
        }
        if (shipmentDatas.length > 0) {
            log.debug({
                title: 'shipmentDatas.length',
                details: JSON.stringify(shipmentDatas).length
            })
            // 対象となる出荷実績データが一件以上存在する場合
            var params = {
                custscript_djkk_mr_ws_param: shipmentDatas,
                custscript_djkk_mr_ws_param_processname: 'execute_shipment'
            };
            runMapReduceScript(params, 'customscript_djkk_mr_wms', 'customdeploy_djkk_mr_wms_shipment');
        }
        if (setProductDatas.length > 0) {
            // 対象となるセット品実績データが一件以上存在する場合
            var params = {
                custscript_djkk_mr_ws_param: setProductDatas,
                custscript_djkk_mr_ws_param_processname: 'execute_set_product'
            };
            runMapReduceScript(params, 'customscript_djkk_mr_wms', 'customdeploy_djkk_mr_wms_set_product');
        }
        if (transferRecordDatas.length > 0) {
            // 対象となる転送実績データが一件以上存在する場合
            var params = {
                custscript_djkk_mr_ws_param: transferRecordDatas,
                custscript_djkk_mr_ws_param_processname: 'execute_transfer_record'
            };
            runMapReduceScript(params, 'customscript_djkk_mr_wms', 'customdeploy_djkk_mr_wms_transfer_order');
        }

        // 消化仕入売上注文受領
        var paramsDP = {
            custscript_djkk_mr_ws_param: '',
            custscript_djkk_mr_ws_param_processname: 'execute_dp_order_receive'
        };
        runMapReduceScript(paramsDP, 'customscript_djkk_mr_wms', 'customdeploy_djkk_mr_wms_receive_dporder');
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
     * Map/Reduceスクリプト実行
     * @param {Object} params スクリプトパラメータ
     * @param {*} scriptId スクリプトID
     * @param {*} deployId スクリプトデプロイメントID
     */
    function runMapReduceScript(params, scriptId, deployId) {
        try {
            var updateTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: scriptId,
                deploymentId: deployId,
                params: params
            });
            var updateTaskId = updateTask.submit();
            log.audit({
                title: 'runMapReduceScript - updateTaskId',
                details: updateTaskId
            });
        } catch (error) {
            log.error({
                title: 'runMapReduceScript - error',
                details: error
            });
        }
    }

    return {
        execute: execute
    };
});