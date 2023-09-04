/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/format', 'N/file', 'N/runtime', 'SuiteScripts/DENISJAPAN/2.0/Common/utils'],

(record, search, format, file, runtime, utils) => {
    /**
     * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
     * @param {Object} inputContext
     * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
     *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
     * @param {Object} inputContext.ObjectRef - Object that references the input data
     * @typedef {Object} ObjectRef
     * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
     * @property {string} ObjectRef.type - Type of the record instance that contains the input data
     * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
     * @since 2015.2
     */

    const getInputData = (inputContext) => {
        log.audit({
            title: 'getInputData - start',
            details: JSON.stringify(new Date())
        });
        let objDataForMap = {
            'INSERT_SALESORDER': [],
            'INSERT_TRANSFERORDER': []
        };
        try {
            var currentScript = runtime.getCurrentScript();
            var paramRecordId = currentScript.getParameter({
                name: 'custscript_djkk_mr_so_to_import_recordid'
            });

            log.audit({
                title: 'paramRecordId',
                details: paramRecordId
            });

            let arrDataFilter = [];
            /** 無効 = false */
            arrDataFilter.push(search.createFilter({
                name: 'isinactive',
                operator: search.Operator.IS,
                values: false
            }));
            /** DJ_連携ステータス != 処理済 or 処理中 */
            arrDataFilter.push(search.createFilter({
                name: 'custrecord_djkk_exsystem_process_status',
                operator: search.Operator.NONEOF,
                values: ['2', '4']
            }));
            if (paramRecordId != null && paramRecordId != '') {
                arrDataFilter.push(search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: paramRecordId
                }));
            }

            let arrDataColumns = [];
            /** DJ_連携種類 */
            arrDataColumns.push(search.createColumn({ name: 'custrecord_djkk_exsystem_process_type' }));
            /** DJ_連携ステータス */
            arrDataColumns.push(search.createColumn({ name: 'custrecord_djkk_exsystem_process_status' }));
            /** DJ_連携データ */
            arrDataColumns.push(search.createColumn({ name: 'custrecord_djkk_exsystem_data_file' }));
            /** DJ_未取込データ */
            arrDataColumns.push(search.createColumn({ name: 'custrecord_djkk_exsystem_error_data' }));

            let dataResults = utils.searchResult('customrecord_djkk_exsystem_so_to_import', arrDataFilter, arrDataColumns);
            for (let i = 0; i < dataResults.length; i++) {
                let tmpResult = dataResults[i];

                /**
                 * 連携種類(INSERT_SALESORDER、INSERT_TRANSFERORDER)
                 * @type {string}
                 */
                let strType = tmpResult.getValue({ name: 'custrecord_djkk_exsystem_process_type' });
                /**
                 * 連携ステータス
                 * @type {string}
                 */
                let strStatus = tmpResult.getText({ name: 'custrecord_djkk_exsystem_process_status' });
                /**
                 * 連携データファイル内部ID
                 * @type {number}
                 */
                let numDataFileId = tmpResult.getValue({ name: 'custrecord_djkk_exsystem_data_file' });
                /**
                 * データ配列
                 * @type {Array}
                 */
                let arrData = [];

                if (strStatus == '未処理') {
                    /**
                     * ファイルよりデータ取得
                     * @type {Array}
                     */
                    let arrFileData = JSON.parse(file.load({ id: numDataFileId }).getContents())['record_data'];
                    arrFileData.map(function (objData) {
                        arrData.push({
                            recordId: tmpResult.id,
                            data: objData
                        });
                    });
                } else {
                    JSON.parse(tmpResult.getValue({ name: 'custrecord_djkk_exsystem_error_data' })).map(function (objData) {
                        arrData.push({
                            recordId: tmpResult.id,
                            data: objData
                        });
                    });
                }

                objDataForMap[strType] = objDataForMap[strType].concat(arrData);
            }
        } catch(error) {
            log.error({
                title: 'inputData - error',
                details: error
            });
        }

        log.audit({
            title: 'getInputData - end',
            details: JSON.stringify(new Date())
        });
        return objDataForMap;
    }

    /**
     * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
     * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
     * context.
     * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
     *     is provided automatically based on the results of the getInputData stage.
     * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
     *     function on the current key-value pair
     * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
     *     pair
     * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
     *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
     * @param {string} mapContext.key - Key to be processed during the map stage
     * @param {string} mapContext.value - Value to be processed during the map stage
     * @since 2015.2
     */

    const map = (mapContext) => {
        log.audit({
            title: 'map - start',
            details: JSON.stringify(new Date())
        });

        /**
         * 処理種類キー（INSERT_SALESORDER、INSERT_TRANSFERORDER）
         * @type {string}
         */
        const strKey = mapContext.key;
        /**
         * データ配列
         * @type {Array}
         */
        let arrInputData = JSON.parse(mapContext.value);

        log.debug({
            title: 'map - strKey',
            details: strKey
        });

        log.debug({
            title: 'map - arrInputData',
            details: mapContext.value
        });

        arrInputData.forEach(function(objInputData) {
            let strRecordId = objInputData['recordId'];

            /** 処理対象レコードを処理中に更新 */
            record.submitFields({
                type: 'customrecord_djkk_exsystem_so_to_import',
                id: strRecordId,
                values: {
                    custrecord_djkk_exsystem_process_status: 4
                }
            })
        });

        if (strKey == 'INSERT_SALESORDER') {
            convertSalesOrderData(mapContext, strKey, arrInputData);
        } else {
            convertTransferOrderData(mapContext, strKey, arrInputData);
        }

        log.audit({
            title: 'map - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
     * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
     * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
     *     provided automatically based on the results of the map stage.
     * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
     *     reduce function on the current group
     * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
     * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
     *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
     * @param {string} reduceContext.key - Key to be processed during the reduce stage
     * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
     *     for processing
     * @since 2015.2
     */
    const reduce = (reduceContext) => {
        log.audit({
            title: 'reduce - start',
            details: JSON.stringify(new Date())
        });

        /**
         * 連携種類(INSERT_SALESORDER、INSERT_TRANSFERORDER)
         * @type {string}
         */
        const strProcessType = reduceContext.key;
        /**
         * @type {object}
         */
        const objReduceValue = JSON.parse(reduceContext.values[0]);
        /**
         * データオブジェクト
         * @type {object}
         */
        const objConvertedData = objReduceValue['convertedData'];

        /**
         * 中間レコード内部ID
         * @type {number}
         */
        const numDataRecordId = objReduceValue['orderRequestId'];

        for (let i = 0; i < Math.ceil(reduceContext.values[0].length / 3000); i++) {
            log.debug({
                title: 'objConvertedData - ' + i,
                details: reduceContext.values[0].substring(i * 3000, (i + 1) * 3000)
            });
        }

        log.debug({
            title: 'reduce - numDataRecordId',
            details: numDataRecordId
        });

        /**
         * 処理結果
         * @type {object}
         */
        let objReduceResult = {
            isSuccess: true,
            orderRequestId: objConvertedData['custbody_djkk_orderrequestid'],
            resultTransactionId: '',
            error: ''
        };

        /**
         * 既存レコードID
         * @type {number}
         */
        let numOriginRecordId = 0;

        /**
         * 既存レコードより作成された配送内部ID
         * @type {number}
         */
        let numOriginRecordItemFulfillmentId = 0;

        /**
         * 既存レコードより作成された請求書内部ID
         * @type {number}
         */
        let numOriginRecordInvoiceId = 0;

        /**
         * 既存レコード検索フィルター
         * @type {Array}
         */
        let arrOriginRecordFilters = [];
        arrOriginRecordFilters.push(['custbody_djkk_exsystem_tranid', search.Operator.IS, objConvertedData['custbody_djkk_exsystem_tranid']]);
        arrOriginRecordFilters.push('or');
        arrOriginRecordFilters.push(['createdfrom.custbody_djkk_exsystem_tranid', search.Operator.IS, objConvertedData['custbody_djkk_exsystem_tranid']]);

        /**
         * 既存レコード検索結果
         * @type {Array}
         */
        let arrOriginRecordResults = utils.searchResult(search.Type.TRANSACTION, arrOriginRecordFilters, []);
        arrOriginRecordResults.map(function (result) {
            let tmpId = result.id;
            let tmpType = result.recordType;

            if ([record.Type.SALES_ORDER, record.Type.TRANSFER_ORDER].indexOf(tmpType) >= 0) {
                numOriginRecordId = tmpId;
                return;
            }
            if (tmpType == record.Type.ITEM_FULFILLMENT) {
                numOriginRecordItemFulfillmentId = tmpId;
                return;
            }
            if (tmpType == record.Type.INVOICE) {
                numOriginRecordInvoiceId = tmpId;
                return;
            }
        });

        if (numOriginRecordItemFulfillmentId != '') {
            /** 配送が既に作成された場合 */

            objReduceResult.isSuccess = false;
            objReduceResult.error = '配送作成されたため、処理実行しない。';;

            reduceContext.write({
                key: numDataRecordId,
                value: objReduceResult
            });
            return;
        }

        if (numOriginRecordInvoiceId != '') {
            /** 請求書が既に作成された場合 */

            objReduceResult.isSuccess = false;
            objReduceResult.error = '請求書作成されたため、処理実行しない。';;

            reduceContext.write({
                key: numDataRecordId,
                value: objReduceResult
            });
            return;
        }

        /**
         * レコード
         * @type {record}
         */
        let objRecord = null;

        /**
         * 明細部場所配列
         * @type {Array}
         */
        let arrLineLocations = []

        try {
            log.debug({
                title: 'reduce - numOriginRecordId',
                details: numOriginRecordId
            });

            if (numOriginRecordId != 0) {
                /** 既存レコードが存在する場合、編集 */
                if (objReduceValue['deleteFlg']) {
                    /** 削除フラグ = T の場合 */

                    record.delete({
                        type: (strProcessType.startsWith('INSERT_SALESORDER') ? record.Type.SALES_ORDER : record.Type.TRANSFER_ORDER),
                        id: numOriginRecordId
                    });

                    reduceContext.write({
                        key: numDataRecordId,
                        value: objReduceResult
                    });
                    return;
                }

                /**
                 * DJ_外部システム_在庫数量管理更新情報
                 * @type {object}
                 */
                let objInventoryUpdateInfo = {};

                objRecord = record.load({
                    type: (strProcessType.startsWith('INSERT_SALESORDER') ? record.Type.SALES_ORDER : record.Type.TRANSFER_ORDER),
                    id: numOriginRecordId,
                    isDynamic: true
                });

                /** 既存在庫詳細内容を抽出 */
                const oldLineCount = objRecord.getLineCount({sublistId: 'item'});

                for (let oldLineNum = 0; oldLineNum < oldLineCount; oldLineNum++) {
                    objRecord.selectLine({sublistId: 'item', line: oldLineNum});

                    let oldLineItem = objRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item'
                    });

                    let oldLineLocation = objRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'location'
                    });

                    let flgHasSubrecord = objRecord.hasCurrentSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail'
                    });
                    if (!flgHasSubrecord) {
                        continue;
                    }
                    let oldSubrecord = objRecord.getCurrentSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail'
                    });

                    let oldSubrecordLineCount = oldSubrecord.getLineCount({sublistId: 'inventoryassignment'});

                    for (let oldSubrecordLineNum = 0; oldSubrecordLineNum < oldSubrecordLineCount; oldSubrecordLineNum++) {
                        oldSubrecord.selectLine({sublistId: 'inventoryassignment', line: oldSubrecordLineNum});

                        let oldSubInventoryNumber = oldSubrecord.getCurrentSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'issueinventorynumber'
                        });

                        let oldSubQuantity = oldSubrecord.getCurrentSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'quantity'
                        });

                        var strKey = [oldLineItem, oldLineLocation, oldSubInventoryNumber].join('-');

                        if (objInventoryUpdateInfo.hasOwnProperty(strKey)) {
                            objInventoryUpdateInfo[strKey] = objInventoryUpdateInfo[strKey] + oldSubQuantity;
                        } else {
                            objInventoryUpdateInfo[strKey] = oldSubQuantity;
                        }
                    }
                }
              log.debug({
                    title: 'objInventoryUpdateInfo',
                    details: JSON.stringify(objInventoryUpdateInfo)
                });
                /** DJ_外部システム_明細在庫詳細 */
                objRecord.setValue({
                    fieldId: 'custbody_djkk_exsystem_line_inventory',
                    value: JSON.stringify(objInventoryUpdateInfo)
                });
            } else {
                /** 既存レコードが存在しない場合、新規作成 */

                if (objReduceValue['deleteFlg']) {

                    reduceContext.write({
                        key: numDataRecordId,
                        value: objReduceResult
                    });
                    return;
                }

                objRecord = record.create({
                    type: (strProcessType.startsWith('INSERT_SALESORDER') ? record.Type.SALES_ORDER : record.Type.TRANSFER_ORDER),
                    isDynamic: true
                });
            }
        } catch (error) {
            log.error({
                title: 'reduce - レコード作成失敗',
                details: error
            });

            objReduceResult.isSuccess = false;
            objReduceResult.error = JSON.stringify(error);

            reduceContext.write({
                key: numDataRecordId,
                value: objReduceResult
            });
            return;
        }

        try {
            /**
             * 日付、日時タイプフィールドID
             * @type {Array}
             */
            const arrDateTypeFieldId = [
                'trandate',
                'shipdate',
                'custbody_djkk_delivery_date',
                'custbodycustbody_djkk_netsuitetransdt',
                'custbody_djkk_shippinginstructdt',
                'shipdate',
                'custbody_djkk_delivery_date',
                'custbody_djkk_delivery_hopedate'
            ];

            /** ヘッダ部フィールド値をセット */
            Object.keys(objConvertedData).map(function (strFieldId) {
                if (strFieldId != 'item') {
                    /** 明細部以外の項目をセット */

                    if (['currency', 'custbody_djkk_shippinginstructdt', 'createddate', 'custbody_djkk_exsystem_send_date_time', 'custbody_djkk_payment_conditions'].indexOf(strFieldId) >= 0) {
                        /** Textセット以外のフィールドをセット */

                        objRecord.setText({
                            fieldId: strFieldId,
                            text: objConvertedData[strFieldId]
                        });
                    } else if (arrDateTypeFieldId.indexOf(strFieldId) >= 0) {
                        objRecord.setValue({
                            fieldId: strFieldId,
                            value: (objConvertedData[strFieldId] ? new Date(objConvertedData[strFieldId]) : '')
                        });
                    } else {
                        objRecord.setValue({
                            fieldId: strFieldId,
                            value: objConvertedData[strFieldId]
                        });
                    }
                }
            });
        } catch (error) {
            log.error({
                title: 'reduce - ヘッダ部値セット失敗',
                details: error
            });

            objReduceResult.isSuccess = false;
            objReduceResult.error = JSON.stringify(error);

            reduceContext.write({
                key: numDataRecordId,
                value: objReduceResult
            });
            return;
        }

        if (!objConvertedData.hasOwnProperty('item')) {
            log.error({
                title: 'データエラー',
                details: '明細部データを一行以上指定する必要があります。 中間レコードID: ' + numDataRecordId + ' OrderRequestId: ' + objConvertedData['custbody_djkk_orderrequestid']
            });
            reduceContext.write({
                key: numDataRecordId,
                value: objReduceResult
            });
            return;
        }

        /**
         * 明細部行数
         * @type {number}
         */
        const numLineCount = objRecord.getLineCount({ sublistId: 'item' });
        // try {
           //  /** 明細部既存明細行を削除 */
           //  for (let lineIndex = numLineCount - 1; lineIndex >= 0; lineIndex--) {
           // 	 objRecord.removeLine({ sublistId: 'item', line: lineIndex });
           //  }
        // } catch (error) {
           //  log.error({
           // 	 title: '明細部既存明細行削除エラー',
           // 	 details: error
           //  });

           //  objReduceResult.isSuccess = false;
           //  objReduceResult.error = JSON.stringify(error);

           //  reduceContext.write({
           // 	 key: numDataRecordId,
           // 	 value: objReduceResult
           //  });
           //  return;
        // }
           const arrLineData = objConvertedData['item'];

           let objLineNumByExSystemLineNum = {};
           for (let lineIndex = numLineCount - 1; lineIndex >= 0; lineIndex--) {
               objRecord.selectLine({sublistId: 'item', line: lineIndex});
               let tmpCurrentLineNum = objRecord.getCurrentSublistValue({
                   sublistId: 'item',
                   fieldId: 'custcol_djkk_exsystem_line_num'
               });

               let tmpCurrentLineData = arrLineData.filter(function(tmpData) {
                   if (tmpData['custcol_djkk_exsystem_line_num'].toString() == tmpCurrentLineNum.toString()) {
                       return true;
                   }
                   return false;
               })

               if (tmpCurrentLineData.length <= 0) {
                   objRecord.removeLine({
                       sublistId: 'item',
                       line: lineIndex
                   });
                   continue;
               }

               objLineNumByExSystemLineNum[tmpCurrentLineNum.toString()] = lineIndex;
           }

        try {
            arrLineData.map(function (objLineData) {

                if (objLineData.hasOwnProperty('location')) {
                    if (arrLineLocations.indexOf(objLineData['location'].toString()) < 0) {
                        arrLineLocations.push(objLineData['location'].toString());
                    }
                }

                let numCurrentDataExsystemLineNum = objLineData['custcol_djkk_exsystem_line_num'];

                   if (objLineNumByExSystemLineNum.hasOwnProperty(numCurrentDataExsystemLineNum.toString())) {
                       objRecord.selectLine({
                           sublistId: 'item', 
                           line: objLineNumByExSystemLineNum[numCurrentDataExsystemLineNum.toString()]
                       });
                   } else {
                       /** 明細部新規明細行追加 */
                       objRecord.selectNewLine({ sublistId: 'item' });
                   }

                Object.keys(objLineData).map(function (strLineFieldId) {
                    if (strLineFieldId == 'inventoryDetail') {
                        return;
                    }

                    if (['item', 'location'].indexOf(strLineFieldId) >= 0) {
                        var tmpOldLineValue = objRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: strLineFieldId
                        });

                        var tmpNewLineValue = objLineData[strLineFieldId];

                        if (tmpOldLineValue == tmpNewLineValue) {
                            return;
                        }
                    }
                  
                    if ([].indexOf(strLineFieldId) < 0) {
                        objRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: strLineFieldId,
                            value: objLineData[strLineFieldId]
                        });
                    } else {
                        objRecord.setCurrentSublistText({
                            sublistId: 'item',
                            fieldId: strLineFieldId,
                            text: objLineData[strLineFieldId]
                        });
                    }
                });

                if (!objLineData.hasOwnProperty('inventoryDetail')) {
                    /** 明細部データに在庫詳細データが含まれていない場合 */

                    /** 明細行コミット */
                    objRecord.commitLine({ sublistId: 'item' });
                    return;
                }

                /**
                 * 明細部在庫詳細サブレコード
                 * @type {record}
                 */
                const objSubrecord = objRecord.getCurrentSublistSubrecord({
                    sublistId: 'item',
                    fieldId: 'inventorydetail'
                });

                // /** 既存在庫詳細明細行を削除 */
                // const numSubrecordLineCount = objSubrecord.getLineCount({ sublistId: 'inventoryassignment' });
                // for (let sublistLineIndex = numSubrecordLineCount - 1; sublistLineIndex >= 0; sublistLineIndex--) {
                   //  objSubrecord.removeLine({ sublistId: 'inventoryassignment', line: sublistLineIndex });
                // }

                // objLineData['inventoryDetail'].map(function (objSubrecordLineData) {

                   //  /** 在庫詳細サブレコード明細行に新規明細行を追加 */
                   //  objSubrecord.selectNewLine({ sublistId: 'inventoryassignment' });

                   //  Object.keys(objSubrecordLineData).map(function (strSubListFieldId) {
                   // 	 if (['issueinventorynumber'].indexOf(strSubListFieldId) >= 0) {
                   // 		 /** 指定項目をtextでフィールドにセット */

                   // 		 objSubrecord.setCurrentSublistText({
                   // 			 sublistId: 'inventoryassignment',
                   // 			 fieldId: strSubListFieldId,
                   // 			 text: objSubrecordLineData[strSubListFieldId]
                   // 		 });
                   // 	 } else if (['expirationdate'].indexOf(strSubListFieldId) >= 0) {
                   // 		 /** 指定項目を日付としてフィールドにセット */

                   // 		 objSubrecord.setCurrentSublistValue({
                   // 			 sublistId: 'inventoryassignment',
                   // 			 fieldId: strSubListFieldId,
                   // 			 value: (objSubrecordLineData[strSubListFieldId] ? new Date(objSubrecordLineData[strSubListFieldId]) : '')
                   // 		 });
                   // 	 } else {
                   // 		 objSubrecord.setCurrentSublistValue({
                   // 			 sublistId: 'inventoryassignment',
                   // 			 fieldId: strSubListFieldId,
                   // 			 value: objSubrecordLineData[strSubListFieldId]
                   // 		 });
                   // 	 }
                   //  });

                   //  /** 在庫詳細サブレコード明細行コミット */
                   //  objSubrecord.commitLine({ sublistId: 'inventoryassignment' });
                // });

                                var arrCurrentLineInventoryData = objLineData['inventoryDetail'];

                /** データ上指定無しの既存在庫詳細明細行を削除 */
                let numSubrecordLineCount = objSubrecord.getLineCount({ sublistId: 'inventoryassignment' });
                for (let sublistLineIndex = numSubrecordLineCount - 1; sublistLineIndex >= 0; sublistLineIndex--) {
                    objSubrecord.selectLine({
                        sublistId: 'inventoryassignment',
                        line: sublistLineIndex
                    });

                    let strCurrentLineInventoryNumber = objSubrecord.getCurrentSublistText({
                        sublistId: 'inventoryassignment',
                        fieldId: 'issueinventorynumber'
                    });

                    let arrCurrentNumberData = arrCurrentLineInventoryData.filter(function(tmpData) {
                        if (tmpData['issueinventorynumber'] == strCurrentLineInventoryNumber) {
                            return true;
                        }

                        return false;
                    });

                    if (arrCurrentNumberData == null || arrCurrentNumberData.length <= 0) {
                        objSubrecord.removeLine({ sublistId: 'inventoryassignment', line: sublistLineIndex });
                        continue;
                    }
                }

                let objLineNumberByInventoryNumber = {};

                numSubrecordLineCount = objSubrecord.getLineCount({ sublistId: 'inventoryassignment' });
                for (let sublistLineIndex = 0; sublistLineIndex < numSubrecordLineCount; sublistLineIndex++) {
                    objSubrecord.selectLine({
                        sublistId: 'inventoryassignment',
                        line: sublistLineIndex
                    });

                    let strCurrentLineInventoryNumber = objSubrecord.getCurrentSublistText({
                        sublistId: 'inventoryassignment',
                        fieldId: 'issueinventorynumber'
                    });

                    let arrLineNumbers = [];
                    if (objLineNumberByInventoryNumber.hasOwnProperty(strCurrentLineInventoryNumber.toString())) {
                        arrLineNumbers = objLineNumberByInventoryNumber[strCurrentLineInventoryNumber.toString()];
                    }
                    arrLineNumbers.push(sublistLineIndex.toString());

                    objLineNumberByInventoryNumber[strCurrentLineInventoryNumber.toString()] = arrLineNumbers;
                }

                arrCurrentLineInventoryData.forEach(function(tmpData) {
                    let strDataInventoryNumber = tmpData['issueinventorynumber'];
                    
                    if (objLineNumberByInventoryNumber.hasOwnProperty(strDataInventoryNumber.toString()) && objLineNumberByInventoryNumber[strDataInventoryNumber.toString()].length > 0) {
                        
                        let arrCurrentInventoryNumberLine = objLineNumberByInventoryNumber[strDataInventoryNumber.toString()];
                        objSubrecord.selectLine({
                            sublistId: 'inventoryassignment',
                            line: arrCurrentInventoryNumberLine[0]
                        });

                        arrCurrentLineInventoryData = arrCurrentInventoryNumberLine.slice(1, arrCurrentLineInventoryData.length);

                        objLineNumberByInventoryNumber[strDataInventoryNumber.toString()] = arrCurrentInventoryNumberLine;
                    } else {
                        objSubrecord.selectNewLine({sublistId: 'inventoryassignment'});
                    }

                    Object.keys(tmpData).map(function (strSubListFieldId) {
                        if (['issueinventorynumber'].indexOf(strSubListFieldId) >= 0) {
                            /** 指定項目をtextでフィールドにセット */

                            objSubrecord.setCurrentSublistText({
                                sublistId: 'inventoryassignment',
                                fieldId: strSubListFieldId,
                                text: tmpData[strSubListFieldId]
                            });
                        } else if (['expirationdate'].indexOf(strSubListFieldId) >= 0) {
                            /** 指定項目を日付としてフィールドにセット */

                            objSubrecord.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: strSubListFieldId,
                                value: (tmpData[strSubListFieldId] ? new Date(tmpData[strSubListFieldId]) : '')
                            });
                        } else {
                            objSubrecord.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: strSubListFieldId,
                                value: tmpData[strSubListFieldId]
                            });
                        }
                    });
                    objSubrecord.commitLine({sublistId: 'inventoryassignment'});
                });
                objSubrecord.commit();

                
                objRecord.commitLine({ sublistId: 'item' });
            });
        } catch (error) {
            log.error({
                title: 'reduce - 明細部値セットエラー',
                details: error
            });
            objReduceResult.isSuccess = false;
            objReduceResult.error = JSON.stringify(error);

            reduceContext.write({
                key: numDataRecordId,
                value: objReduceResult
            });

            return;
        }

        log.debug({
            title: 'objRecord.lineCount',
            details: objRecord.getLineCount({sublistId: 'item'})
        });

        /**
         * レコードを保存し、内部IDを取得
         * @type {number}
         */
        let numRecordId = '';
        
        try {
          log.audit({
                title: 'before save',
                details: objRecord.getValue({fieldId: 'trandate'})
            });
            numRecordId = objRecord.save();
            log.audit({
                title: 'reduce - レコード作成',
                details: '内部ID: ' + numRecordId
            });

            objReduceResult.resultTransactionId = numRecordId;
        } catch (error) {
            log.error({
                title: 'reduce - レコード作成失敗',
                details: error
            });

            objReduceResult.isSuccess = false;
            objReduceResult.error = JSON.stringify(error)
        }

        log.debug({
            title: 'recordType: ' + objRecord.type,
            details: 'custbody_djkk_consignmentbuyingsaleflg: ' + objRecord.getValue({ fieldId: 'custbody_djkk_consignmentbuyingsaleflg' })
        });

        try {
            if (objRecord.type == record.Type.SALES_ORDER
                && objRecord.getValue({ fieldId: 'custbody_djkk_consignmentbuyingsaleflg' })
                && numRecordId != '') {
                /** 注文書、且つ「DJ_消化仕入売上フラグ」=True である場合、請求書を作成 */

                /**
                 * 注文書より請求書を作成する
                 * @type {record}
                 */
                let recordInvoice = record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: numRecordId,
                    toType: record.Type.INVOICE,
                    isDynamic: true
                });

                  let flgOriginTranFinet = search.lookupFields({
                  type: record.Type.SALES_ORDER,
                  id: numRecordId,
                  columns: ['custbody_djkk_finet_bill_mail_flg']
                })['custbody_djkk_finet_bill_mail_flg'];

                // recordInvoice.setValue({
                //     fieldId: 'approvalstatus',
                //     value: 2
                // });
                if (flgOriginTranFinet) {
                    // 作成元.DJ_FINET請求送信フラグ = Trueである場合

                    recordInvoice.setText({
                      fieldId: 'custbody_djkk_finet_shipping_typ',
                      text: '00:通常出荷(黒)'
                    });
                }

                const numInvoiceId = recordInvoice.save();

                log.audit({
                    title: '請求書作成',
                    details: '内部ID: ' + numInvoiceId + ' 作成元ID: ' + numRecordId
                });

                arrLineLocations.forEach(function(locationId) {
                    /**
                     * 注文書より配送を作成する
                     * @type {record}
                     */
                    let recordItemFulfillment = record.transform({
                        fromType: record.Type.SALES_ORDER,
                        fromId: numRecordId,
                        toType: record.Type.ITEM_FULFILLMENT,
                        isDynamic: true,
                        defaultValues: {
                            inventorylocation: locationId
                        }
                    });
                    recordItemFulfillment.setValue({
                        fieldId: 'shipstatus',
                        value: 'C'
                    });
                    const numFulfillmentId = recordItemFulfillment.save();
                    log.audit({
                        title: '配送作成',
                        details: '内部ID: ' + numFulfillmentId + ' 作成元ID: ' + numRecordId
                    });
                });
                
            }
        } catch (error) {
            log.error({
                title: '請求書作成失敗',
                details: error
            });
            objReduceResult.isSuccess = false;
            objReduceResult.error = JSON.stringify(error);
        }

        reduceContext.write({
            key: numDataRecordId,
            value: objReduceResult
        });

        log.audit({
            title: 'reduce - end',
            details: JSON.stringify(new Date())
        });
    }


    /**
     * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
     * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
     * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
     * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
     *     script
     * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
     * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
     *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
     * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
     * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
     * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
     *     script
     * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
     * @param {Object} summaryContext.inputSummary - Statistics about the input stage
     * @param {Object} summaryContext.mapSummary - Statistics about the map stage
     * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
     * @since 2015.2
     */
    const summarize = (summaryContext) => {
        log.audit({
            title: 'summarize - start',
            details: JSON.stringify(new Date())
        });

        let objRecordUpdateInfo = {};
        summaryContext.output.iterator().each(function (key, value) {

            if (!objRecordUpdateInfo.hasOwnProperty(key)) {
                objRecordUpdateInfo[key] = [];
            }
            objRecordUpdateInfo[key].push(JSON.parse(value))

            return true;
        });

        for (let i = 0; i < Math.ceil(JSON.stringify(objRecordUpdateInfo).length / 3000); i++) {
            log.debug({
                title: 'objConvertedData - ' + i,
                details: JSON.stringify(objRecordUpdateInfo).substring(i * 3000, (i + 1) * 3000)
            });
        }

        log.debug({
            title: 'summarize - objRecordUpdateInfo',
            details: JSON.stringify(objRecordUpdateInfo)
        });

        Object.keys(objRecordUpdateInfo).map(function (recordId) {
            let arrReduceResult = objRecordUpdateInfo[recordId];

            let arrFailedResult = arrReduceResult.filter(function (objResult) {
                if (!objResult.isSuccess) {
                    return true;
                }
                return false;
            });

            let objDataRecord = record.load({
                type: 'customrecord_djkk_exsystem_so_to_import',
                id: recordId
            });

            /**
             * 処理成功トランザクションID
             */
            let arrSuccessTransactionId = [];

            arrSuccessTransactionId = objDataRecord.getValue({ fieldId: 'custrecord_djkk_exsystem_target_tran' });

            arrReduceResult.map(function (tmpResult) {
                if (tmpResult.isSuccess) {
                    let tmpSuccessTransactionId = tmpResult.resultTransactionId;

                    if (tmpSuccessTransactionId == null || tmpSuccessTransactionId == '') {
                        return;
                    }

                    if (arrSuccessTransactionId.indexOf(tmpSuccessTransactionId.toString()) < 0) {
                        arrSuccessTransactionId.push(tmpSuccessTransactionId.toString());
                    }
                }
            });

            /**DJ_対象トランザクション */
            objDataRecord.setValue({
                fieldId: 'custrecord_djkk_exsystem_target_tran',
                value: arrSuccessTransactionId
            })

            if (arrFailedResult.length == 0) {
                /** 全件処理済みの場合 */

                // DJ_連携ステータス = 処理済
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_process_status',
                    value: 2
                });
                // DJ_エラーメッセージ
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_error_message',
                    value: arrFailedResult.map(function (objFailedResult) { return objFailedResult.error; }).join('\n')
                });
                // DJ_未取込データ
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_error_data',
                    value: ''
                });

            } else {
                /** DJ_連携ステータス = 処理失敗 */
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_process_status',
                    value: 3
                });

                /** DJ_エラーメッセージ */
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_error_message',
                    value: arrFailedResult.map(function (objFailedResult) { return objFailedResult.error; }).join('\n')
                });

                /**
                 * データファイル内部ID
                 * @type {number}
                 */
                const numOriginDataFileId = objDataRecord.getValue({ fieldId: 'custrecord_djkk_exsystem_data_file' });

                /**
                 * 処理エラーデータ
                 */
                const arrErrorData = getErrorData(numOriginDataFileId, arrFailedResult.map(function (objFailedResult) { return objFailedResult.orderRequestId; }));

                /** DJ_未取込データ */
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_error_data',
                    value: JSON.stringify(arrErrorData)
                });
            }

            objDataRecord.save();
        });
        log.audit({
            title: 'summarize - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 注文書データを変換しReduceに渡す
     * @param {context} mapContext 
     * @param {string} strKey 
     * @param {Array} arrInputData 元データ配列
     */
    function convertSalesOrderData(mapContext, strKey, arrInputData) {
        log.audit({
            title: 'convertSalesOrderData - start',
            details: JSON.stringify(new Date())
        });
        /**
         * 汎用区分マスタ
         * @type {object}
         * @param {string} objCommonTypeInfo.key 区分種類コード-区分コード
         * @param {number} objCommonTypeInfo.value 区分内部ID
         */
        let objCommonTypeInfo = {};
        /**
         * 顧客マスタ情報取得
         * @type {object}
         * @param {string} objCustomerInfo.key 顧客ID
         * @param {number} objCustomerInfo.value 顧客内部ID
         */
        let objCustomerInfo = {};

        /**
         * メール送信関連情報-顧客
         * @type {object}
         */
        let objCustomerMailSenderInfo = {};

        /**
         * 納品先マスタ情報取得
         * @type {object}
         * @param {string} objDeliveryInfo.key DJ_納品先コード
         * @param {number} objDeliveryInfo.value 納品先内部ID
         */
        let objDeliveryInfo = {};
        /**
         * アイテムマスタ情報取得
         * @type {object}
         * @param {string} objItemInfo.key アイテムID
         * @param {number} objItemInfo.value アイテム内部ID
         */
        let objItemInfo = {};
        /**
         * DJ_配送温度マスタ
         * @type {string} key DJ_はイオス温度区分
         * @type {number} value 内部ID
         */
        let objDeliveryAreaTempInfo = {};
        /**
         * 税金コードマスタ
         */
        let objTaxInfo = {};

        /**
         * DJ_納品先
         * @type {string} key custrecord_djkk_delivery_code
         * @type {number} value 内部ID
         */
        let objDeliveryDestinationInfo = {};

        /**
         * メール送信関連情報-納品先
         * @type {object}
         */
        let objDeliveryMailSenderInfo = {};

        /**
         * 配送料アイテム情報
         * @type {Array}
         */
        let arrDeliveryItems = [];

        let arrDeliveryItemFilters = [];
        /** アイテム.DJ_配送料フラグ = 1 */
        arrDeliveryItemFilters.push(search.createFilter({
            name: 'custitem_djkk_deliverycharge_flg',
            operator: search.Operator.IS,
            values: true
        }));
        /** アイテム.DJ_有効承認 = True*/
        arrDeliveryItemFilters.push(search.createFilter({
            name: 'custitem_djkk_effective_recognition',
            operator: search.Operator.IS,
            values: true
        }));

        let arrDeliveryItemColumns = [];
        /** 会社 */
        arrDeliveryItemColumns.push(search.createColumn({name: 'subsidiary'}));

        let arrDeliveryItemResults = utils.searchResult(search.Type.ITEM, arrDeliveryItemFilters, arrDeliveryItemColumns);
        arrDeliveryItemResults.map(function(tmpResult) {
            arrDeliveryItems.push({
                id: tmpResult.id,
                subsidiary: tmpResult.getValue({name: 'subsidiary'}).toString()
            });
        });

        try {
            /**
         * データ内customerid値配列
         * @type {Array}
         */
            let arrAllCustomerCode = [];

            /**
             * データ内納入先ID(shipping_deliverydestid)値配列
             * @type {Array}
             */
            let arrAllDeliveryCode = [];

            /**
             * データ内アイテムID(misi_itemid)値配列
             * * @type {Array}
             */
            let arrAllItemId = [];

            arrInputData.map(function (objData) {
                let tmpCustomerId = objData['data']['customerid'];
                let tmpDeliveryDestId = objData['data']['shipping_deliverydestid'];

                if (tmpCustomerId && arrAllCustomerCode.indexOf(tmpCustomerId.toString()) < 0) {
                    arrAllCustomerCode.push(tmpCustomerId.toString());
                }
                if (tmpDeliveryDestId && arrAllDeliveryCode.indexOf(tmpDeliveryDestId.toString()) < 0) {
                    arrAllDeliveryCode.push(tmpDeliveryDestId.toString());
                }

                objData['data']['recordLine'].map(function (objLineData) {
                    let tmpItemId = objLineData['misi_itemid'];

                    if (tmpItemId && arrAllItemId.indexOf(tmpItemId.toString()) < 0) {
                        arrAllItemId.push(tmpItemId.toString());
                    }
                });
            });

            objCommonTypeInfo = getCommonTypeMaster();

            objCustomerInfo = utils.getMasterInfoByCode(search.Type.CUSTOMER, 'entityid', arrAllCustomerCode);

            objCustomerMailSenderInfo = getMailSenderInfoCustomer(arrAllCustomerCode);

            objDeliveryInfo = utils.getMasterInfoByCode('customrecord_djkk_delivery_destination', 'custrecord_djkk_delivery_code', arrAllDeliveryCode);

            objItemInfo = utils.getMasterInfoByCode(search.Type.ITEM, 'itemid', arrAllItemId);

            objDeliveryAreaTempInfo = utils.getMasterInfoByCode('customrecord_djkk_deliveryareatemp', 'custrecord_djkk_deliverytemptyp', []);

            objDeliveryDestinationInfo = utils.getMasterInfoByCode('customrecord_djkk_delivery_destination', 'custrecord_djkk_delivery_code', []);

            objDeliveryMailSenderInfo = getMailSenderInfoDelivery(arrAllDeliveryCode);

            objTaxInfo = getTaxInfo();

        } catch (error) {
            log.error({
                title: 'map - convertSalesOrderData - マスタ処理エラー',
                details: error
            });
            return;
        }

        arrInputData.map(function (obj, index) {

            /**
             * 処理結果
             * @type {object}
             */
            let objMapResult = {
                isSuccess: true,
                orderRequestId: obj['recordId'],
                convertedData: {},
                deleteFlg: false,
                error: ''
            };

            let objData = obj['data']

            /**
             * 配送料アイテム内部ID
             * @type {number}
             */
            let numDeliveryChargeItemId = 0;

            arrDeliveryItems.filter(function(tmpItem) {
                return tmpItem.subsidiary == objData['subsidiaryid'];
            }).map(function(tmpItem, index) {
                if (index != 0) {
                    return;
                }
                numDeliveryChargeItemId = tmpItem.id;
            });

            if (arrDeliveryItems == 0) {
                /** 配送料アイテム特定できない場合 */

                objMapResult.isSuccess = false;
                objMapResult.error = '有効な配送料アイテムが特定できません。';

                mapContext.write({
                    key: strKey + '-' + index,
                    value: objMapResult
                });
                return;
            }

            try {

                if (objData['deleteflg'] == '1') {
                    /** 削除フラグ = 1(true)である場合、処理不要 */
                    objMapResult.deleteFlg = true;
                }

                let objSendMailInfo = null;

                let flgMailSenderFromDelivery = false;
                if (objData['shipping_deliverydestid'] != null && objData['shipping_deliverydestid'] != '') {
                    // 納品先がセットされた場合
                    if (objDeliveryMailSenderInfo.hasOwnProperty(objData['shipping_deliverydestid'].toString())) {

                        if (objDeliveryMailSenderInfo[(objData['shipping_deliverydestid'].toString())]['shipping_info_dest_type'] == '2') {
                            flgMailSenderFromDelivery = true;
                        }
                    }
                }

                if (flgMailSenderFromDelivery) {
                    objSendMailInfo = objDeliveryMailSenderInfo[(objData['shipping_deliverydestid'].toString())];
                } else {
                    objSendMailInfo = objCustomerMailSenderInfo[(objData['customerid'].toString())];
                }

               log.debug({
                   title: 'salesorder - flgMailSenderFromDelivery',
                   details: flgMailSenderFromDelivery
               });
               log.debug({
                   title: 'salesorder - objSendMailInfo',
                   details: JSON.stringify(objSendMailInfo)
               });

                /**
                 * ヘッダ部変換後データ
                 * @type {object}
                 */
                let objConvertedData = {
                    // カスタムフォーム
                    customform: 175,
                    // 注文番号
                    custbody_djkk_exsystem_tranid: objData['tranid'],
                    // 顧客ID
                    entity: objCustomerInfo[(objData['customerid'])],
                    // 日付
                    trandate: convertDateTime(objData['orderdate'], format.Type.DATE, 'YYYYMMDD'),
                    // ステータス
                    orderstatus: 'B',
                    // 営業担当者
                    salesrep: objData['salesrepid'],
                    // 受注担当者
                    custbody_djkk_trans_appr_create_user: objData['csemployeeid'],
                    // DJ_先方発注番号
                    custbody_djkk_customerorderno: objData['dj_customerorderno'],
                    // 子会社
                    // subsidiary: objData['subsidiaryid'],
                    // セクション
                    department: objData['departmentid'],
                    // 通貨
                    currency: objData['currency'],
                    // クラス
                    class: objData['classid'],
                    // 倉庫
                    location: objData['locationid'],
                    // DJ_EC支払方法区分
                    custbody_djkk_paymentmethodtyp: objCommonTypeInfo[('19-' + objData['dj_paymentmethodtyp'])],
                    // DJ_支払条件
                    custbody_djkk_payment_conditions: objData['dj_paymentcondtyp'],
                    // DJ_納入先毎在庫引当条件
                    custbody_djkk_deliveryruledesc: objData['dj_deliveryruledesc'],
                    // DJ_注意事項
                    custbody_djkk_cautiondesc: objData['dj_cautiondesc'],
                    // DJ_倉庫向け備考１
                    custbody_djkk_wmsmemo1: objData['dj_wmsmemo1'],
                    // DJ_倉庫向け備考２
                    custbody_djkk_wmsmemo2: objData['dj_wmsmemo2'],
                    // DJ_倉庫向け備考３
                    custbody_djkk_wmsmemo3: objData['dj_wmsmemo3'],
                    // DJ_運送会社向け備考1
                    custbody_djkk_deliverermemo1: objData['dj_deliverermemo1'],
                    // DJ_運送会社向け備考2
                    custbody_djkk_deliverermemo2: objData['dj_deliverermemo2'],
                    // DJ_納品書備考
                    custbody_djkk_deliverynotememo: objData['dj_deliverynotememo'],
                    // DJ_注文依頼ID
                    custbody_djkk_orderrequestid: objData['dj_orderrequestid'],
                    // DJ_営業担当者ID
                    custbody_djkk_salesrepid: objData['dj_salesrepid'],
                    // DJ_Netsuite連携対象フラグ
                    custbody_djkk_netsuitetransflg: convertBoolean(objData['dj_netsuitetransflg']),
                    // DJ_Netsuite連携日時
                    custbodycustbody_djkk_netsuitetransdt: convertDateTime(objData['dj_netsuitetransdt'], format.Type.DATE, 'YYYY年MM月DD日 HH時mm分ss秒'),
                    // DJ_出荷指示日時
                    custbody_djkk_shippinginstructdt: convertDateTime(objData['dj_shippinginstructdt'], format.Type.DATETIME, 'YYYY年MM月DD日 HH時mm分ss秒'),
                    // DJ_出荷案内送付先区分
                    custbody_djkk_shippinginfodesttyp: objCommonTypeInfo[('34-' + objData['dj_shippinginfodesttyp'])],
                    // DJ_出荷案内送付先宛名
                    custbody_djkk_shippinginfodestname: objData['dj_shippinginfodestname'],
                    // DJ_出荷案内送付先メール
                    custbody_djkk_shippinginfodestemail: objData['dj_shippinginfodestemail'],
                    // DJ_出荷案内送付先FAX
                    custbody_djkk_shippinginfodestfax: objData['dj_shippinginfodestfax'],
                    // DJ_出荷案内送信区分
                    custbody_djkk_shippinginfosendtyp: objCommonTypeInfo[('33-' + objData['dj_shippinginfosendtyp'])],
                    // DJ_消化仕入売上フラグ
                    custbody_djkk_consignmentbuyingsaleflg: convertBoolean(objData['dj_consignmentbuyingsalesflg']),
                    // DJ_FINETカナ提供企業名
                    custbody_djkk_finetkanaofferconame: objData['dj_finetkanaoffercompanyname'],
                    // DJ_FINETカナ提供企業参照事業所名
                    custbody_djkk_finetkanaoffercooffice: objData['dj_finetkanaoffercompanyofficename'],
                    // DJ_FINETカナ社名・店名・取引先名
                    custbody_djkk_finetkanacustomername: objData['dj_finetkanacustomername'],
                    // DJ_FINETカナ住所
                    custbody_djkk_finetkanacustomeraddress: objData['dj_finetkanacustomeraddress'],
                    // DJ_FINETカナ社名・店名・取引先名_option2
                    custbody_djkk_finetkanacustomername2: objData['dj_finetkanacustomername2'],
                    // DJ_FINETカナ住所_option2
                    custbody_djkk_finetkanaaddress_option2: objData['dj_finetkanacustomeraddress2'],
                    // DJ_FINETカナ社名・店名・取引先名_option3
                    custbody_djkk_finetkanacustomername_o3: objData['dj_finetkanacustomername3'],
                    // DJ_FINETカナ住所_option3
                    custbody_djkk_finetkanaaddress_option3: objData['dj_finetkanacustomeraddress3'],
                    // DJ_FINETカナ社名・店名・取引先名_option4
                    custbody_djkk_finetkanacustomername4: objData['dj_finetkanacustomername4'],
                    // DJ_FINETカナ住所_option4
                    custbody_djkk_finetkanaaddress_option4: objData['dj_finetkanacustomeraddress4'],
                    // DJ_FINETカナ社名・店名・取引先名_option5
                    custbody_djkk_finetkanacustomername5: objData['dj_finetkanacustomername5'],
                    // DJ_FINETカナ住所_option5
                    custbody_djkk_finetkanaaddress_option5: objData['dj_finetkanacustomeraddress5'],
                    // DJ_前払金受領済フラグ
                    custbody_djkk_exsystem_opc_flg: convertBoolean(objData['dj_advancepaymentreceivedflg']),
                    // DJ_外部システム送信日時
                    custbody_djkk_exsystem_send_date_time: convertDateTime(objData['dj_exsystemreceivedt'], format.Type.DATETIME, 'YYYY年MM月DD日 HH時mm分ss秒'),
                    // DJ_FINET_送信元センターコード
                    custbody_djkk_finet_sender_center_code: objData['dj_finetcustomerEDIcode'],
                    // DJ_FINET_最終送信先コード
                    custbody_djkk_finet_final_dest_code: objData['dj_finetfinaldestcode'],
                    // DJ_FINET_最終送信先コード（予備）
                    custbody_djkk_finet_final_dest_code_bk: objData['dj_finetfinaldestcodebk'],
                    // DJ_FINET_直接送信先企業コード
                    custbody_djkk_finet_direct_dest_code: objData['dj_finetdirectdestcode'],
                    // DJ_FINET_直接送信先企業コード（予備）
                    custbody_djkk_finet_direct_dest_codebk: objData['dj_finetdirectdestcodebk'],
                    // DJ_FINET_提供企業コード
                    custbody_djkk_finet_provider_comp_code: objData['dj_finetprovidercompcode'],
                    // DJ_FINET_提供企業事業所コード
                    custbody_djkk_finet_provider_office_cd: objData['dj_finetproviderofficecd'],
                    // DJ_FINET_一次店コード
                    custbody_djkk_finet_first_store_code: objData['dj_finetfirststorecode'],
                    // DJ_FINET_二次店コード
                    custbody_djkk_finet_second_store_code: objData['dj_finetsecondstorecode'],
                    // DJ_FINET_三次店コード
                    custbody_djkk_finet_third_store_code: objData['dj_finetthirdstorecode'],
                    // DJ_FINET_四次店コード
                    custbody_djkk_finet_fourth_store_code: objData['dj_finetfourthstorecode'],
                    // DJ_FINET_五次店コード
                    custbody_djkk_finet_fifth_store_code: objData['dj_finetfifthstorecode'],
                    // DJ_FINET_手形情報
                    custbody_djkk_finet_bills_info: objCommonTypeInfo[('39-' + objData['dj_finetbillsinfo'])],
                    // DJ_FINET_倉直区分
                    custbody_djkk_finet_location_type: objCommonTypeInfo[('40-' + objData['dj_finetlocationtype'])],
                    // DJ_FINET連携対象フラグ
                    custbody_djkk_finet_applicable_flg: convertBoolean(objData['dj_finetapplicableflg']),
                    // DJ_FINET出荷案内送信フラグ
                    custbody_djkk_finet_shipment_mail_flg: convertBoolean(objData['dj_finetshipmentmailflg']),
                    // DJ_FINET請求送信フラグ
                    custbody_djkk_finet_bill_mail_flg: convertBoolean(objData['dj_finetbillmailflg']),
                    // DJ_注文方法区分
                    custbody_djkk_ordermethodrtyp: objCommonTypeInfo[('10-' + objData['dj_ordermethodrtyp'])],
                    // DJ_FINET_送信元センターコード
                    custbody_djkk_finet_sender_center_code: objData['dj_finetcustomeredicode'],
                    // DJ_EC会員区分コード
                    custbody_djkk_customertype: objData['dj_customertype'],
                    // 作成日時
                    createddate: convertDateTime(objData['createtime'], format.Type.DATETIME, 'YYYY年MM月DD日 HH時mm分ss秒'),
                    // 作成者
                    recordcreatedby: objData['createuser'],
                    // // 出荷日
                    // shipdate: convertDateTime(objData['shipping_expectedshippingdate'], format.Type.DATE, 'YYYYMMDD'),
                    // DJ_納品日
                    custbody_djkk_delivery_date: convertDateTime(objData['shipping_dj_deliverydate'], format.Type.DATE, 'YYYYMMDD'),
                    // DJ_納入時間帯記述
                    custbody_djkk_deliverytimedesc: objData['shipping_dj_deliverytimedesc'],
                    // DJ_納品希望日
                    custbody_djkk_delivery_hopedate: convertDateTime(objData['shipping_dj_expecteddeliverydate'], format.Type.DATE, 'YYYYMMDD'),
                    // // 配送方法
                    // shipmethod: objData['shipping_deliverymethod'],
                    // // 配送料
                    // shippingcost: objData['shipping_deliverycharges'],
                    // // 配送料の税金コード
                    // shippingtaxcode: objTaxInfo[objData['shipping_deliverytaxcd']],
                    // // 手数料の税金コード
                    // handlingtaxcode: objTaxInfo[objData['shipping_taxcdforfee']],
                    // DJ_納品先
                    custbody_djkk_delivery_destination: objDeliveryDestinationInfo[(objData['shipping_deliverydestid'])],
                    // DJ_納入先未登録フラグ
                    custbody_djkk_deliverynotregistflg: convertBoolean(objData['shipping_dj_deliverynotregistflg'])
                };

                if (objSendMailInfo != null) {
                    Object.keys(objSendMailInfo)
                        .filter(function(tmpKey) {
                            if (tmpKey == 'shipping_info_dest_type') {
                                return false;
                            }
                            return true;
                        })
                        .forEach(function(tmpKey) {
                            objConvertedData[tmpKey.toString()] = objSendMailInfo[tmpKey.toString()];
                        });
                }

                if (objData['shipping_deliverytaxcd'] == '') {
                    // 配送料の税金コードが指定されていない場合、設定なしに
                    delete objConvertedData['shippingtaxcode'];
                }

                if (objData['shipping_taxcdforfee'] == '') {
                    // 手数料の税金コードが指定されていない場合、設定なしに
                    delete objConvertedData['handlingtaxcode'];
                }

                /**
                 * 明細部変換後データ配列
                 * @type {Array}
                 */
                let arrConvertedLineData = [];

                objData['recordLine'].map(function (objLineData) {

                    if (objLineData['misi_deleteflg'] == '1') {
                        // 明細.削除フラグ = 1 である場合、作成不要
                        return;
                    }

                    /**
                     * 明細行変換後データ
                     * @type {object}
                     */
                    let objLineConvertedData = {
                        // アイテム
                        item: objItemInfo[(objLineData['misi_itemid'])],
                        // DJ_アイテム?廃棄
                        custcol_djkk_item: objItemInfo[(objLineData['misi_itemid'])],
                        // 倉庫
                        location: objLineData['misi_locationid'],
                        // 在庫保管棚
                        inventorylocation: objLineData['misi_locationid'],
                        // 配送選択
                        itemfulfillmentchoice: objLineData['misi_deliverytyp'],
                        // 数量
                        quantity: objLineData['misi_quantity'],
                        // 単位
                        units: objLineData['misi_unit'],
                        // 単価
                        rate: objLineData['misi_price'],
                        // 金額
                        amount: objLineData['misi_netamount'],
                        // 税金コード
                        taxcode: objTaxInfo[(objLineData['misi_taxcd'])],
                        // 注文優先度
                        orderpriority: objLineData['misi_orderpriority'],
                        // セクション
                        department: objLineData['misi_detaildepartmentid'],
                        // クラス
                        class: objLineData['misi_detailclassid'],
                        // DJ_入数
                        custcol_djkk_perunitquantity: objLineData['misi_dj_perunitquantity'],
                        // DJ_ケース数
                        custcol_djkk_casequantity: objLineData['misi_dj_casequantity'],
                        // DJ_バラ数
                        custcol_djkk_quantity: objLineData['misi_dj_quantity'],
                        // DJ_配送温度区分
                        custcol_djkk_deliverytemptyp: objDeliveryAreaTempInfo[(objLineData['misi_dj_deliverytemptyp'])],
                        // DJ_欠品次回出荷予定記述
                        custcol_djkk_nextshipmentdesc: objLineData['misi_dj_nextshipmentdesc'],
                        // DJ_倉庫向け明細備考
                        custcol_djkk_wms_line_memo: objLineData['misi_dj_sowmsdetailmemo'],
                        // DJ_納品書明細備考
                        custcol_djkk_deliverynotememo: objLineData['misi_dj_deliverynotememo'],
                        // DJ_注文依頼ID
                        custcol_djkk_orderrequestid: objLineData['misi_dj_orderrequestid'],
                        // DJ_依頼明細行番号
                        custcol_djkk_orderrequestlineno: objLineData['misi_dj_orderrequestlineno'],
                        // DJ_依頼数量
                        custcol_djkk_orderrequestquantity: objLineData['misi_dj_orderrequestquantity'],
                        // DJ_部分欠品区分
                        custcol_djkk_partshortagetyp: objCommonTypeInfo[('35-' + objLineData['misi_dj_partshortagetyp'])],
                        // DJ_FINETカナ商品名
                        custcol_djkk_finetkanaitemdescription: objLineData['misi_dj_finetkanaitemdescription'],
                        // DJ_依頼分割済フラグ
                        custcol_djkk_orderrequestdivideflg: convertBoolean(objLineData['misi_dj_orderrequestdivideflg']),
                        // DJ_注文明細状態区分
                        custcol_djkk_orderdetailtyp: objCommonTypeInfo[('13-' + objLineData['misi_dj_orderdetailtyp'])],
                        // DJ_外部システム_明細行番号
                        custcol_djkk_exsystem_line_num: objLineData['misi_lineno']
                    };

                    if (!objLineData.hasOwnProperty('zk') || objLineData['zk'].length <= 0) {
                        /** 在庫詳細データが含まれていない場合 */

                        arrConvertedLineData.push(objLineConvertedData);
                        return;
                    }

                    let arrConvertedInventoryData = [];
                    objLineData['zk'].map(function (objInventoryData) {
                        if (objInventoryData['zk_deleteflg'] == '1') {
                            /** 削除フラグ = 1 の場合、作成不要 */
                            return;
                        }

                        /**
                         * 変換後在庫詳細明細行データ
                         * @type {object}
                         */
                        let objConvertedInventoryData = {
                            // シリアル/ロット番号
                            issueinventorynumber: objInventoryData['zk_dj_manageno'],
                            // DJ_引当数量
                            quantity: objInventoryData['zk_dj_allocationquantity'],
                            // // 賞味期限
                            // expirationdate: convertDateTime(objInventoryData['zk_expdate'], format.Type.DATE, 'YYYYMMDD'),
                            // DJ_メーカの製造番号
                            custrecord_djkk_maker_serial_code: objInventoryData['zk_lotno']
                        };

                        arrConvertedInventoryData.push(objConvertedInventoryData);
                    });

                    objLineConvertedData['inventoryDetail'] = arrConvertedInventoryData;
                    arrConvertedLineData.push(objLineConvertedData);
                });

                if (numDeliveryChargeItemId != 0) {
                    /** 配送料行を追加 */
                    arrConvertedLineData.push({
                        item: numDeliveryChargeItemId,
                        quantity: 1,
                        rate: (objData.hasOwnProperty('shipping_deliverycharges') ? Number(objData['shipping_deliverycharges']) : 0),
                        custcol_djkk_exsystem_line_num: objData['recordLine'].length + 1
                    });

                    // // 出荷日
                    // shipdate: convertDateTime(objData['shipping_expectedshippingdate'], format.Type.DATE, 'YYYYMMDD'),
                    // // DJ_納品日
                    // custbody_djkk_delivery_date: convertDateTime(objData['shipping_dj_deliverydate'], format.Type.DATE, 'YYYYMMDD'),
                    // // DJ_納入時間帯記述
                    // custbody_djkk_deliverytimedesc: objData['shipping_dj_deliverytimedesc'],
                    // // DJ_納品希望日
                    // custbody_djkk_delivery_hopedate: convertDateTime(objData['shipping_dj_expecteddeliverydate'], format.Type.DATE, 'YYYYMMDD'),
                    // // 配送方法
                    // shipmethod: objData['shipping_deliverymethod'],
                    // // 配送料
                    // shippingcost: objData['shipping_deliverycharges'],
                    // // 配送料の税金コード
                    // shippingtaxcode: objTaxInfo[objData['shipping_deliverytaxcd']],
                    // // 手数料の税金コード
                    // handlingtaxcode: objTaxInfo[objData['shipping_taxcdforfee']],
                    // // DJ_納品先
                    // custbody_djkk_delivery_destination: objDeliveryDestinationInfo[(objData['shipping_deliverydestid'])],
                    // // DJ_納入先未登録フラグ
                    // custbody_djkk_deliverynotregistflg: convertBoolean(objData['shipping_dj_deliverynotregistflg'])
                }

                objConvertedData['item'] = arrConvertedLineData;

                log.debug({
                    title: 'map',
                    details: 'key: ' + strKey + ' value: ' + JSON.stringify({
                        recordId: obj['recordId'],
                        convertedData: objConvertedData
                    })
                });
                objMapResult.convertedData = objConvertedData;

                mapContext.write({
                    key: strKey + '-' + index,
                    value: objMapResult
                });
            } catch (error) {
                log.error({
                    title: 'map - convertSalesOrderData - error',
                    details: error
                });

                objMapResult.isSuccess = false;
                objMapResult.error = error;

                mapContext.write({
                    key: strKey + '-' + index,
                    value: objMapResult
                });
            }
        });
        log.audit({
            title: 'convertSalesOrderData - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 
     * @param {*} mapContext 
     * @param {*} strKey 
     * @param {*} arrInputData 
     */
    function convertTransferOrderData(mapContext, strKey, arrInputData) {
        log.audit({
            title: 'convertTransferOrderData - start',
            details: JSON.stringify(new Date())
        });
        /**
         * 汎用区分マスタ
         * @type {object}
         * @param {string} objCommonTypeInfo.key 区分種類コード-区分コード
         * @param {number} objCommonTypeInfo.value 区分内部ID
         */
        let objCommonTypeInfo = {};

        /**
         * 顧客マスタ情報
         * @type {object}
         * @param {string} objCustomerInfo.key 顧客ID
         * @param {number} objCustomerInfo.value 顧客内部ID
         */
        let objCustomerInfo = {};
        /**
         * アイテムマスタ情報取得
         * @type {object}
         * @param {string} objItemInfo.key アイテムID
         * @param {number} objItemInfo.value アイテム内部ID
         */
        let objItemInfo = {};

        /**
         * DJ_配送温度マスタ
         * @type {string} key DJ_はイオス温度区分
         * @type {number} value 内部ID
         */
        let objDeliveryAreaTempInfo = {};

        /**
         * 税金コードマスタ
         */
        let objTaxInfo = {};

        /**
         * DJ_納品先
         * @type {string} key custrecord_djkk_delivery_code
         * @type {number} value 内部ID
         */
        let objDeliveryDestinationInfo = {};

        try {
            /**
             * データ内customerid値配列
             * @type {Array}
             */
            let arrAllCustomerCode = [];

            /**
             * データ内アイテムID(misi_itemid)値配列
             * * @type {Array}
             */
            let arrAllItemId = [];

            arrInputData.map(function (objData) {
                let tmpCustomerId = objData['data']['customerid'];

                if (tmpCustomerId && arrAllCustomerCode.indexOf(tmpCustomerId.toString()) < 0) {
                    arrAllCustomerCode.push(tmpCustomerId.toString());
                }

                objData['data']['recordLine'].map(function (objLineData) {
                    let tmpItemId = objLineData['misi_itemid'];

                    if (tmpItemId && arrAllItemId.indexOf(tmpItemId.toString()) < 0) {
                        arrAllItemId.push(tmpItemId.toString());
                    }
                });
            });

            objCommonTypeInfo = getCommonTypeMaster();

            objCustomerInfo = utils.getMasterInfoByCode(search.Type.CUSTOMER, 'entityid', arrAllCustomerCode);

            objItemInfo = utils.getMasterInfoByCode(search.Type.ITEM, 'itemid', arrAllItemId);

            objDeliveryAreaTempInfo = utils.getMasterInfoByCode('customrecord_djkk_deliveryareatemp', 'custrecord_djkk_deliverytemptyp', []);

            objDeliveryDestinationInfo = utils.getMasterInfoByCode('customrecord_djkk_delivery_destination', 'custrecord_djkk_delivery_code', []);

            objTaxInfo = getTaxInfo();
        } catch (error) {
            log.error({
                title: 'map - convertTransferOrderData - マスター処理エラー',
                details: error
            });
            return;
        }

        arrInputData.map(function (obj, index) {
            /**
             * 処理結果
             * @type {object}
             */
            let objMapResult = {
                isSuccess: true,
                orderRequestId: obj['recordId'],
                convertedData: {},
                deleteFlg: false,
                error: ''
            };

            try {
                let objData = obj['data']

                if (objData['deleteflg'] == '1') {
                    /** 削除フラグ = 1(true)である場合、処理不要 */
                    objMapResult.deleteFlg = true;
                }

                /**
                 * ヘッダ部変換後データ
                 * @type {object}
                 */
                let objConvertedData = {
                    // カスタムフォーム
                    customform: 104,
                    // 子会社
                    subsidiary: objData['subsidiaryid'],
                    // 注文番号
                    custbody_djkk_exsystem_tranid: objData['orderno'],
                    // 日付
                    trandate: convertDateTime(objData['date'], format.Type.DATE, 'YYYYMMDD'),
                    // 移動元
                    location: objData['transfromlocationid'],
                    // 移動先
                    transferlocation: objData['transtolocationid'],
                    // ステータス
                    orderstatus: 'B',
                    // セクション
                    department: objData['departmentid'],
                    // クラス
                    class: objData['classid'],
                    // DJ_顧客
                    custbody_djkk_customerid: objCustomerInfo[objData['dj_customerid']],
                    // 営業担当者
                    salesrep: objData['dj_salesrepid'],
                    // DJ_受注担当者ID
                    custbody_djkk_csemployeeid: objData['dj_csemployeeid'],
                    // DJ_先方発注番号
                    custbody_djkk_customerorderno: objData['dj_customerorderno'],
                    // DJ_納入先毎在庫引当条件
                    custbody_djkk_deliveryruledesc: objData['dj_deliveryruledesc'],
                    // DJ_注意事項
                    custbody_djkk_cautiondesc: objData['dj_cautiondesc'],
                    // DJ_倉庫向け備考１
                    custbody_djkk_wmsmemo1: objData['dj_wmsmemo1'],
                    // DJ_倉庫向け備考２
                    custbody_djkk_wmsmemo2: objData['dj_wmsmemo2'],
                    // DJ_倉庫向け備考３
                    custbody_djkk_wmsmemo3: objData['dj_wmsmemo3'],
                    // DJ_運送会社向け備考１
                    custbody_djkk_deliverermemo1: objData['dj_deliverermemo1'],
                    // DJ_運送会社向け備考２
                    custbody_djkk_deliverermemo2: objData['dj_deliverermemo2'],
                    // DJ_納品書備考
                    custbody_djkk_deliverynotememo: objData['dj_deliverynotememo'],
                    // DJ_注文依頼ID
                    custbody_djkk_orderrequestid: objData['dj_orderrequestid'],
                    // DJ_Netsuite連携対象フラグ
                    custbody_djkk_netsuitetransflg: convertBoolean(objData['dj_netsuitetransflg']),
                    // DJ_Netsuite連携日時
                    custbodycustbody_djkk_netsuitetransdt: convertDateTime(objData['dj_netsuitetransdt'], format.Type.DATE, 'YYYY年MM月DD日 HH時mm分ss秒'),
                    // DJ_出荷指示日時
                    custbody_djkk_shippinginstructdt: convertDateTime(objData['dj_shippinginstructdt'], format.Type.DATETIME, 'YYYY年MM月DD日 HH時mm分ss秒'),
                    // DJ_FINETカナ提供企業名
                    custbody_djkk_finetkanaofferconame: objData['dj_finetkanaoffercompanyname'],
                    // DJ_FINETカナ
                    custbody_djkk_finetkanaoffercooffice: objData['dj_finetkanaoffercompanyofficename'],
                    // DJ_FINETカナ社名・店名・取引先名
                    custbody_djkk_finetkanacustomername: objData['dj_finetkanacustomername'],
                    // DJ_FINETカナ住所
                    custbody_djkk_finetkanacustomeraddress: objData['dj_finetkanacustomeraddress'],
                    // 作成日時
                    createddate: convertDateTime(objData['createtime'], format.Type.DATETIME, 'YYYY年MM月DD日 HH時mm分ss秒'),
                    // 作成者
                    recordcreatedby: objData['createuser'],
                    // 出荷日
                    shipdate: convertDateTime(objData['shipping_expectedshippingdate'], format.Type.DATE, 'YYYYMMDD'),
                    // DJ_納品日
                    custbody_djkk_delivery_date: convertDateTime(objData['shipping_dj_deliverydate'], format.Type.DATE, 'YYYYMMDD'),
                    // DJ_納入時間帯記述
                    custbody_djkk_deliverytimedesc: objData['shipping_dj_deliverytimedesc'],
                    // 配送業者
                    shipcarrier: '',
                    // 配送方法
                    shipmethod: objData['shipping_deliverymethod'],
                    // 配送料
                    shippingcost: objData['shipping_deliveryfee'],
                    // 手数料
                    handlingcost: objData['shipping_fee'],
                    // DJ_納品先
                    custbody_djkk_delivery_destination: objDeliveryDestinationInfo[(objData['shipping_deliverydestid'])],
                    // DJ_営業担当者ID
                    custbody_djkk_salesrepid: objData['dj_salesrepid']
                };

                /**
                 * 明細部変換後データ配列
                 * @type {Array}
                 */
                let arrConvertedLineData = [];

                objData['recordLine'].map(function (objLineData) {

                    if (objLineData['misi_deleteflg'] == '1') {
                        // 明細.削除フラグ = 1 である場合、作成不要
                        return;
                    }

                    /**
                     * 明細行変換後データ
                     * @type {object}
                     */
                    let objLineConvertedData = {
                        // アイテム
                        item: objItemInfo[(objLineData['misi_itemid'])],
                        // DJ_アイテム?廃棄
                        custcol_djkk_item: objItemInfo[(objLineData['misi_itemid'])],
                        // 倉庫
                        location: objLineData['misi_locationid'],
                        // 在庫保管棚
                        inventorylocation: objLineData['misi_locationid'],
                        // 配送選択
                        itemfulfillmentchoice: objLineData['misi_deliverytyp'],
                        // 数量
                        quantity: objLineData['misi_quantity'],
                        // 単位
                        units: objLineData['misi_unit'],
                        // 単価
                        rate: objLineData['misi_price'],
                        // 金額
                        amount: objLineData['misi_netamount'],
                        // 税金コード
                        taxcode: objTaxInfo[(objLineData['misi_taxcd'])],
                        // 注文優先度
                        orderpriority: objLineData['misi_orderpriority'],
                        // セクション
                        department: objLineData['misi_detaildepartmentid'],
                        // クラス
                        class: objLineData['misi_detailclassid'],
                        // DJ_入数
                        custcol_djkk_perunitquantity: objLineData['misi_dj_perunitquantity'],
                        // DJ_ケース数
                        custcol_djkk_casequantity: objLineData['misi_dj_casequantity'],
                        // DJ_バラ数
                        custcol_djkk_quantity: objLineData['misi_dj_quantity'],
                        // DJ_配送温度区分
                        custcol_djkk_deliverytemptyp: objDeliveryAreaTempInfo[(objLineData['misi_dj_deliverytemptyp'])],
                        // DJ_欠品次回出荷予定記述
                        custcol_djkk_nextshipmentdesc: objLineData['misi_dj_nextshipmentdesc'],
                        // DJ_納品書明細備考
                        custcol_djkk_deliverynotememo: objLineData['misi_dj_deliverynotememo'],
                        // DJ_倉庫向け明細備考
                        custcol_djkk_wms_line_memo: objLineData['dj_sowmsdetailmemo'],
                        // DJ_注文依頼ID
                        custcol_djkk_orderrequestid: objLineData['misi_dj_orderrequestid'],
                        // DJ_依頼明細行番号
                        custcol_djkk_orderrequestlineno: objLineData['misi_dj_orderrequestlineno'],
                        // DJ_依頼数量
                        custcol_djkk_orderrequestquantity: objLineData['misi_dj_orderrequestquantity'],
                        // DJ_部分欠品区分
                        custcol_djkk_partshortagetyp: objCommonTypeInfo[('35-' + objLineData['misi_dj_partshortagetyp'])],
                        // DJ_FINETカナ商品名
                        custcol_djkk_finetkanaitemdescription: objLineData['misi_dj_finetkanaitemdescription'],
                        // DJ_依頼分割済フラグ
                        custcol_djkk_orderrequestdivideflg: convertBoolean(objLineData['misi_dj_orderrequestdivideflg']),
                        // DJ_注文明細状態区分
                        custcol_djkk_orderdetailtyp: objCommonTypeInfo[('13-' + objLineData['misi_dj_orderdetailtyp'])],
                        // DJ_外部システム_明細行番号
                        custcol_djkk_exsystem_line_num: objLineData['misi_lineno']
                    };

                    if (!objLineData.hasOwnProperty('zk') || objLineData['zk'].length <= 0) {
                        /** 在庫詳細データが含まれていない場合 */

                        arrConvertedLineData.push(objLineConvertedData);
                        return;
                    }

                    let arrConvertedInventoryData = [];
                    objLineData['zk'].map(function (objInventoryData) {
                        if (objInventoryData['zk_deleteflg'] == '1') {
                            /** 削除フラグ = 1 の場合、作成不要 */
                        }

                        /**
                         * 変換後在庫詳細明細行データ
                         * @type {object}
                         */
                        let objConvertedInventoryData = {
                            // シリアル/ロット番号
                            issueinventorynumber: objInventoryData['zk_dj_manageno'],
                            // DJ_引当数量
                            quantity: objInventoryData['zk_dj_allocationquantity'],
                            // // 賞味期限
                            // expirationdate: convertDateTime(objInventoryData['zk_expdate'], format.Type.DATE, 'YYYYMMDD'),
                            // DJ_メーカの製造番号
                            custrecord_djkk_maker_serial_code: objInventoryData['zk_lotno']
                        };

                        arrConvertedInventoryData.push(objConvertedInventoryData);
                    });

                    objLineConvertedData['inventoryDetail'] = arrConvertedInventoryData;
                    arrConvertedLineData.push(objLineConvertedData);
                });

                objConvertedData['item'] = arrConvertedLineData;

                log.debug({
                    title: 'map',
                    details: 'key: ' + strKey + ' value: ' + JSON.stringify({
                        recordId: obj['recordId'],
                        convertedData: objConvertedData
                    })
                })

                objMapResult.convertedData = objConvertedData;

                mapContext.write({
                    key: strKey + '-' + index,
                    value: objMapResult
                });
            } catch (error) {
                log.error({
                    title: 'map - convertTransferOrderData - error',
                    details: error
                });
                objMapResult.isSuccess = false;
                objMapResult.error = error

                mapContext.write({
                    key: strKey + '-' + index,
                    value: objMapResult
                })
            }
        });
        log.audit({
            title: 'convertTransferOrderData - end',
            details: JSON.stringify(new Date())
        });
    }

    /**
     * 汎用区分マスタ取得
     * @returns {object} objInfo
     * @type {string} objInfo.key 区分種類コード-区分コード
     * @type {number} objInfo.value 内部ID
     */
    function getCommonTypeMaster() {
        let objInfo = {};

        let filters = [];
        /** 無効 = false */
        filters.push(search.createFilter({
            name: 'isinactive',
            operator: search.Operator.IS,
            values: false
        }));
        let columns = [];
        /** 区分種類コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_category_code' }));
        /** 区分コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code' }));

        let results = utils.searchResult('customrecord_djkk_common_type', filters, columns);
        for (let i = 0; i < results.length; i++) {
            let tmpResult = results[i];
            /** 区分種類コード */
            let numTypeCode = tmpResult.getValue({ name: 'custrecord_djkk_category_code' });
            /** 区分コード */
            let numCode = tmpResult.getValue({ name: 'custrecord_djkk_type_code' });

            objInfo[(numTypeCode + '-' + numCode)] = tmpResult.id;
        }
        return objInfo
    }

    /**
     * ブール値変換
     * 1 - true、0 - false
     * @param {string | number} value 
     * @returns {boolean}
     */
    function convertBoolean(value) {
        if (!value) {
            return false;
        }
        return value == '1' ? true : false;
    }

    /**
     * 日時変換
     * @param {*} value 元データ
     * @param {*} type 種類（format.Type.DATE、format.Type.DATETIME、format.Type.TIME）
     * @param {*} strFormat フォーマット
     * @returns {string} 変換後日時文字列
     */
    function convertDateTime(value, type, strFormat) {
        if (!value) {
            return '';
        }
        return format.format({
            type: type,
            value: utils.parseStringToDate(value, strFormat),
            timezone: format.Timezone.AMERICA_LOS_ANGELES
        });
    }

    /**
     * 税金コードマスタを取得
     * @returns {object} 税金コードマスタ
     * @type {string} key 税金コード.DJ_外部システム用税金コード.区分コード
     * @type {number} value 税金コード.内部ID
     */
    function getTaxInfo() {
        let objResult = {};

        let columns = [];
        /** DJ_外部システム用税金コード.区分コード */
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_exsystemtaxcd' }));

        let results = utils.searchResult(search.Type.SALES_TAX_ITEM, [], columns);
        for (let i = 0; i < results.length; i++) {
            let tmpResult = results[i];
            let tmpCode = tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_exsystemtaxcd' });
            objResult[(tmpCode.toString())] = tmpResult.id;
        }

        return objResult;
    }

    /**
     * 元データよりエラー/未処理のデータ配列を抽出
     * @param {number} numDataFileId 元データファイル内部ID
     * @param {Array} arrFailedOrderRequestId エラーデータ注文依頼ID
     * @returns {Array} エラーデータ配列
     */
    function getErrorData(numDataFileId, arrFailedOrderRequestId) {
        /**
         * 元データファイル内容
         * @type {object}
         */
        const objOriginData = JSON.parse(file.load({ id: numDataFileId }).getContents());

        /**
         * 元データ配列
         * @type {Array}
         */
        const arrOriginData = objOriginData['record_data'];

        /**
         * エラーデータを抽出
         * @type {Array}
         */
        return arrOriginData.filter(function (objData) {
            if (arrFailedOrderRequestId.indexOf(objData['dj_orderrequestid']) < 0) {
                return false;
            }
            return true;
        });
    }

    
    function getMailSenderInfoCustomer(arrCodes) {
        let objSendMailInfoByCode = {};
        
        if (arrCodes.length <= 0) {
            return objSendMailInfoByCode;
        }

        let filters = [];
        arrCodes.forEach(function(tmpCode, index) {
            filters.push(['entityid', search.Operator.IS, tmpCode.toString()]);

            if (index != arrCodes.length - 1) {
                filters.push('OR');
            }
        })
        let columns = [];
        columns.push(search.createColumn({name: 'entityid'}));
        // 納品書送信方法
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_period'}));
        // 納品書送信先担当者
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_person'}));
        // 納品書送信先会社名(3RDパーティー)
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_subname'}));
        // 納品書送信先担当者(3RDパーティー)
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_person_t'}));
        // 納品書送信先メール(3RDパーティー)
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_email'}));
        // 納品書送信先FAX(3RDパーティー)
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_fax_three'}));
        // 納品書自動送信備考
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_memo'}));
        
        let results = utils.searchResult(search.Type.CUSTOMER, filters, columns);
        results.forEach(function(tmpResult) {
            let tmpCustomerCode = tmpResult.getValue({name: 'entityid'});

            objSendMailInfoByCode[tmpCustomerCode.toString()] = {
                custbody_djkk_delivery_book_period: tmpResult.getValue({name: 'custentity_djkk_delivery_book_period'}),
                custbody_djkk_delivery_book_person: tmpResult.getValue({name: 'custentity_djkk_delivery_book_person'}),
                custbody_djkk_delivery_book_subname: tmpResult.getValue({name: 'custentity_djkk_delivery_book_subname'}),
                custbody_djkk_delivery_book_person_t: tmpResult.getValue({name: 'custentity_djkk_delivery_book_person_t'}),
                custbody_djkk_delivery_book_email: tmpResult.getValue({name: 'custentity_djkk_delivery_book_email'}),
                custbody_djkk_delivery_book_fax_three: tmpResult.getValue({name: 'custentity_djkk_delivery_book_fax_three'}),
                custbody_djkk_delivery_book_memo_so: tmpResult.getValue({name: 'custentity_djkk_delivery_book_memo'})
            }
        });

        return objSendMailInfoByCode;
    }

    function getMailSenderInfoDelivery(arrCodes) {
        let objSendMailInfoByCode = {};
        
        if (arrCodes.length <= 0) {
            return objSendMailInfoByCode;
        }

        let filters = [];
        arrCodes.forEach(function(tmpCode, index) {
            filters.push(['custrecord_djkk_delivery_code', search.Operator.IS, tmpCode.toString()]);

            if (index != arrCodes.length - 1) {
                filters.push('OR');
            }
        })
        let columns = [];
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_code'}));
        // DJ_出荷案内送信先区分
        columns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_shippinginfodesttyp'}));
        // DJ_納品書送信方法
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_period'}));
        // DJ_納品書送信先担当者
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_person'}));
        // DJ_納品書送信先会社名(3RDパーティー)
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_subname'}));
        // DJ_納品書送信先担当者(3RDパーティー)
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_person_t'}));
        // DJ_納品書送信先メール(3RDパーティー)
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_email'}));
        // DJ_納品書送信先FAX(3RDパーティー)
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_fax_three'}));
        // DJ_納品書自動送信送付先備考
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_memo'}));

        let results = utils.searchResult('customrecord_djkk_delivery_destination', filters, columns);
        results.forEach(function(tmpResult) {
            let tmpCustomerCode = tmpResult.getValue({name: 'custrecord_djkk_delivery_code'});

            objSendMailInfoByCode[tmpCustomerCode.toString()] = {
                shipping_info_dest_type: tmpResult.getValue({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_shippinginfodesttyp'}),
                custbody_djkk_delivery_book_period: tmpResult.getValue({name: 'custrecord_djkk_delivery_book_period'}),
                custbody_djkk_delivery_book_person: tmpResult.getValue({name: 'custrecord_djkk_delivery_book_person'}),
                custbody_djkk_delivery_book_subname: tmpResult.getValue({name: 'custrecord_djkk_delivery_book_subname'}),
                custbody_djkk_delivery_book_person_t: tmpResult.getValue({name: 'custrecord_djkk_delivery_book_person_t'}),
                custbody_djkk_delivery_book_email: tmpResult.getValue({name: 'custrecord_djkk_delivery_book_email'}),
                custbody_djkk_delivery_book_fax_three: tmpResult.getValue({name: 'custrecord_djkk_delivery_book_fax_three'}),
                custbody_djkk_delivery_book_memo_so: tmpResult.getValue({name: 'custrecord_djkk_delivery_book_memo'}),
            }
        });

        return objSendMailInfoByCode;
    }

    return { getInputData, map, reduce, summarize }

});