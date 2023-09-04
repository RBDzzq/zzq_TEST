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
            /** ���� = false */
            arrDataFilter.push(search.createFilter({
                name: 'isinactive',
                operator: search.Operator.IS,
                values: false
            }));
            /** DJ_�A�g�X�e�[�^�X != ������ or ������ */
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
            /** DJ_�A�g��� */
            arrDataColumns.push(search.createColumn({ name: 'custrecord_djkk_exsystem_process_type' }));
            /** DJ_�A�g�X�e�[�^�X */
            arrDataColumns.push(search.createColumn({ name: 'custrecord_djkk_exsystem_process_status' }));
            /** DJ_�A�g�f�[�^ */
            arrDataColumns.push(search.createColumn({ name: 'custrecord_djkk_exsystem_data_file' }));
            /** DJ_���捞�f�[�^ */
            arrDataColumns.push(search.createColumn({ name: 'custrecord_djkk_exsystem_error_data' }));

            let dataResults = utils.searchResult('customrecord_djkk_exsystem_so_to_import', arrDataFilter, arrDataColumns);
            for (let i = 0; i < dataResults.length; i++) {
                let tmpResult = dataResults[i];

                /**
                 * �A�g���(INSERT_SALESORDER�AINSERT_TRANSFERORDER)
                 * @type {string}
                 */
                let strType = tmpResult.getValue({ name: 'custrecord_djkk_exsystem_process_type' });
                /**
                 * �A�g�X�e�[�^�X
                 * @type {string}
                 */
                let strStatus = tmpResult.getText({ name: 'custrecord_djkk_exsystem_process_status' });
                /**
                 * �A�g�f�[�^�t�@�C������ID
                 * @type {number}
                 */
                let numDataFileId = tmpResult.getValue({ name: 'custrecord_djkk_exsystem_data_file' });
                /**
                 * �f�[�^�z��
                 * @type {Array}
                 */
                let arrData = [];

                if (strStatus == '������') {
                    /**
                     * �t�@�C�����f�[�^�擾
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
         * ������ރL�[�iINSERT_SALESORDER�AINSERT_TRANSFERORDER�j
         * @type {string}
         */
        const strKey = mapContext.key;
        /**
         * �f�[�^�z��
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

            /** �����Ώۃ��R�[�h���������ɍX�V */
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
         * �A�g���(INSERT_SALESORDER�AINSERT_TRANSFERORDER)
         * @type {string}
         */
        const strProcessType = reduceContext.key;
        /**
         * @type {object}
         */
        const objReduceValue = JSON.parse(reduceContext.values[0]);
        /**
         * �f�[�^�I�u�W�F�N�g
         * @type {object}
         */
        const objConvertedData = objReduceValue['convertedData'];

        /**
         * ���ԃ��R�[�h����ID
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
         * ��������
         * @type {object}
         */
        let objReduceResult = {
            isSuccess: true,
            orderRequestId: objConvertedData['custbody_djkk_orderrequestid'],
            resultTransactionId: '',
            error: ''
        };

        /**
         * �������R�[�hID
         * @type {number}
         */
        let numOriginRecordId = 0;

        /**
         * �������R�[�h���쐬���ꂽ�z������ID
         * @type {number}
         */
        let numOriginRecordItemFulfillmentId = 0;

        /**
         * �������R�[�h���쐬���ꂽ����������ID
         * @type {number}
         */
        let numOriginRecordInvoiceId = 0;

        /**
         * �������R�[�h�����t�B���^�[
         * @type {Array}
         */
        let arrOriginRecordFilters = [];
        arrOriginRecordFilters.push(['custbody_djkk_exsystem_tranid', search.Operator.IS, objConvertedData['custbody_djkk_exsystem_tranid']]);
        arrOriginRecordFilters.push('or');
        arrOriginRecordFilters.push(['createdfrom.custbody_djkk_exsystem_tranid', search.Operator.IS, objConvertedData['custbody_djkk_exsystem_tranid']]);

        /**
         * �������R�[�h��������
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
            /** �z�������ɍ쐬���ꂽ�ꍇ */

            objReduceResult.isSuccess = false;
            objReduceResult.error = '�z���쐬���ꂽ���߁A�������s���Ȃ��B';;

            reduceContext.write({
                key: numDataRecordId,
                value: objReduceResult
            });
            return;
        }

        if (numOriginRecordInvoiceId != '') {
            /** �����������ɍ쐬���ꂽ�ꍇ */

            objReduceResult.isSuccess = false;
            objReduceResult.error = '�������쐬���ꂽ���߁A�������s���Ȃ��B';;

            reduceContext.write({
                key: numDataRecordId,
                value: objReduceResult
            });
            return;
        }

        /**
         * ���R�[�h
         * @type {record}
         */
        let objRecord = null;

        /**
         * ���ו��ꏊ�z��
         * @type {Array}
         */
        let arrLineLocations = []

        try {
            log.debug({
                title: 'reduce - numOriginRecordId',
                details: numOriginRecordId
            });

            if (numOriginRecordId != 0) {
                /** �������R�[�h�����݂���ꍇ�A�ҏW */
                if (objReduceValue['deleteFlg']) {
                    /** �폜�t���O = T �̏ꍇ */

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
                 * DJ_�O���V�X�e��_�݌ɐ��ʊǗ��X�V���
                 * @type {object}
                 */
                let objInventoryUpdateInfo = {};

                objRecord = record.load({
                    type: (strProcessType.startsWith('INSERT_SALESORDER') ? record.Type.SALES_ORDER : record.Type.TRANSFER_ORDER),
                    id: numOriginRecordId,
                    isDynamic: true
                });

                /** �����݌ɏڍד��e�𒊏o */
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
                /** DJ_�O���V�X�e��_���׍݌ɏڍ� */
                objRecord.setValue({
                    fieldId: 'custbody_djkk_exsystem_line_inventory',
                    value: JSON.stringify(objInventoryUpdateInfo)
                });
            } else {
                /** �������R�[�h�����݂��Ȃ��ꍇ�A�V�K�쐬 */

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
                title: 'reduce - ���R�[�h�쐬���s',
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
             * ���t�A�����^�C�v�t�B�[���hID
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

            /** �w�b�_���t�B�[���h�l���Z�b�g */
            Object.keys(objConvertedData).map(function (strFieldId) {
                if (strFieldId != 'item') {
                    /** ���ו��ȊO�̍��ڂ��Z�b�g */

                    if (['currency', 'custbody_djkk_shippinginstructdt', 'createddate', 'custbody_djkk_exsystem_send_date_time', 'custbody_djkk_payment_conditions'].indexOf(strFieldId) >= 0) {
                        /** Text�Z�b�g�ȊO�̃t�B�[���h���Z�b�g */

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
                title: 'reduce - �w�b�_���l�Z�b�g���s',
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
                title: '�f�[�^�G���[',
                details: '���ו��f�[�^����s�ȏ�w�肷��K�v������܂��B ���ԃ��R�[�hID: ' + numDataRecordId + ' OrderRequestId: ' + objConvertedData['custbody_djkk_orderrequestid']
            });
            reduceContext.write({
                key: numDataRecordId,
                value: objReduceResult
            });
            return;
        }

        /**
         * ���ו��s��
         * @type {number}
         */
        const numLineCount = objRecord.getLineCount({ sublistId: 'item' });
        // try {
           //  /** ���ו��������׍s���폜 */
           //  for (let lineIndex = numLineCount - 1; lineIndex >= 0; lineIndex--) {
           // 	 objRecord.removeLine({ sublistId: 'item', line: lineIndex });
           //  }
        // } catch (error) {
           //  log.error({
           // 	 title: '���ו��������׍s�폜�G���[',
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
                       /** ���ו��V�K���׍s�ǉ� */
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
                    /** ���ו��f�[�^�ɍ݌ɏڍ׃f�[�^���܂܂�Ă��Ȃ��ꍇ */

                    /** ���׍s�R�~�b�g */
                    objRecord.commitLine({ sublistId: 'item' });
                    return;
                }

                /**
                 * ���ו��݌ɏڍ׃T�u���R�[�h
                 * @type {record}
                 */
                const objSubrecord = objRecord.getCurrentSublistSubrecord({
                    sublistId: 'item',
                    fieldId: 'inventorydetail'
                });

                // /** �����݌ɏڍז��׍s���폜 */
                // const numSubrecordLineCount = objSubrecord.getLineCount({ sublistId: 'inventoryassignment' });
                // for (let sublistLineIndex = numSubrecordLineCount - 1; sublistLineIndex >= 0; sublistLineIndex--) {
                   //  objSubrecord.removeLine({ sublistId: 'inventoryassignment', line: sublistLineIndex });
                // }

                // objLineData['inventoryDetail'].map(function (objSubrecordLineData) {

                   //  /** �݌ɏڍ׃T�u���R�[�h���׍s�ɐV�K���׍s��ǉ� */
                   //  objSubrecord.selectNewLine({ sublistId: 'inventoryassignment' });

                   //  Object.keys(objSubrecordLineData).map(function (strSubListFieldId) {
                   // 	 if (['issueinventorynumber'].indexOf(strSubListFieldId) >= 0) {
                   // 		 /** �w�荀�ڂ�text�Ńt�B�[���h�ɃZ�b�g */

                   // 		 objSubrecord.setCurrentSublistText({
                   // 			 sublistId: 'inventoryassignment',
                   // 			 fieldId: strSubListFieldId,
                   // 			 text: objSubrecordLineData[strSubListFieldId]
                   // 		 });
                   // 	 } else if (['expirationdate'].indexOf(strSubListFieldId) >= 0) {
                   // 		 /** �w�荀�ڂ���t�Ƃ��ăt�B�[���h�ɃZ�b�g */

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

                   //  /** �݌ɏڍ׃T�u���R�[�h���׍s�R�~�b�g */
                   //  objSubrecord.commitLine({ sublistId: 'inventoryassignment' });
                // });

                                var arrCurrentLineInventoryData = objLineData['inventoryDetail'];

                /** �f�[�^��w�薳���̊����݌ɏڍז��׍s���폜 */
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
                            /** �w�荀�ڂ�text�Ńt�B�[���h�ɃZ�b�g */

                            objSubrecord.setCurrentSublistText({
                                sublistId: 'inventoryassignment',
                                fieldId: strSubListFieldId,
                                text: tmpData[strSubListFieldId]
                            });
                        } else if (['expirationdate'].indexOf(strSubListFieldId) >= 0) {
                            /** �w�荀�ڂ���t�Ƃ��ăt�B�[���h�ɃZ�b�g */

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
                title: 'reduce - ���ו��l�Z�b�g�G���[',
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
         * ���R�[�h��ۑ����A����ID���擾
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
                title: 'reduce - ���R�[�h�쐬',
                details: '����ID: ' + numRecordId
            });

            objReduceResult.resultTransactionId = numRecordId;
        } catch (error) {
            log.error({
                title: 'reduce - ���R�[�h�쐬���s',
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
                /** �������A���uDJ_�����d������t���O�v=True �ł���ꍇ�A���������쐬 */

                /**
                 * ��������萿�������쐬����
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
                    // �쐬��.DJ_FINET�������M�t���O = True�ł���ꍇ

                    recordInvoice.setText({
                      fieldId: 'custbody_djkk_finet_shipping_typ',
                      text: '00:�ʏ�o��(��)'
                    });
                }

                const numInvoiceId = recordInvoice.save();

                log.audit({
                    title: '�������쐬',
                    details: '����ID: ' + numInvoiceId + ' �쐬��ID: ' + numRecordId
                });

                arrLineLocations.forEach(function(locationId) {
                    /**
                     * ���������z�����쐬����
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
                        title: '�z���쐬',
                        details: '����ID: ' + numFulfillmentId + ' �쐬��ID: ' + numRecordId
                    });
                });
                
            }
        } catch (error) {
            log.error({
                title: '�������쐬���s',
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
             * ���������g�����U�N�V����ID
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

            /**DJ_�Ώۃg�����U�N�V���� */
            objDataRecord.setValue({
                fieldId: 'custrecord_djkk_exsystem_target_tran',
                value: arrSuccessTransactionId
            })

            if (arrFailedResult.length == 0) {
                /** �S�������ς݂̏ꍇ */

                // DJ_�A�g�X�e�[�^�X = ������
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_process_status',
                    value: 2
                });
                // DJ_�G���[���b�Z�[�W
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_error_message',
                    value: arrFailedResult.map(function (objFailedResult) { return objFailedResult.error; }).join('\n')
                });
                // DJ_���捞�f�[�^
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_error_data',
                    value: ''
                });

            } else {
                /** DJ_�A�g�X�e�[�^�X = �������s */
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_process_status',
                    value: 3
                });

                /** DJ_�G���[���b�Z�[�W */
                objDataRecord.setValue({
                    fieldId: 'custrecord_djkk_exsystem_error_message',
                    value: arrFailedResult.map(function (objFailedResult) { return objFailedResult.error; }).join('\n')
                });

                /**
                 * �f�[�^�t�@�C������ID
                 * @type {number}
                 */
                const numOriginDataFileId = objDataRecord.getValue({ fieldId: 'custrecord_djkk_exsystem_data_file' });

                /**
                 * �����G���[�f�[�^
                 */
                const arrErrorData = getErrorData(numOriginDataFileId, arrFailedResult.map(function (objFailedResult) { return objFailedResult.orderRequestId; }));

                /** DJ_���捞�f�[�^ */
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
     * �������f�[�^��ϊ���Reduce�ɓn��
     * @param {context} mapContext 
     * @param {string} strKey 
     * @param {Array} arrInputData ���f�[�^�z��
     */
    function convertSalesOrderData(mapContext, strKey, arrInputData) {
        log.audit({
            title: 'convertSalesOrderData - start',
            details: JSON.stringify(new Date())
        });
        /**
         * �ėp�敪�}�X�^
         * @type {object}
         * @param {string} objCommonTypeInfo.key �敪��ރR�[�h-�敪�R�[�h
         * @param {number} objCommonTypeInfo.value �敪����ID
         */
        let objCommonTypeInfo = {};
        /**
         * �ڋq�}�X�^���擾
         * @type {object}
         * @param {string} objCustomerInfo.key �ڋqID
         * @param {number} objCustomerInfo.value �ڋq����ID
         */
        let objCustomerInfo = {};

        /**
         * ���[�����M�֘A���-�ڋq
         * @type {object}
         */
        let objCustomerMailSenderInfo = {};

        /**
         * �[�i��}�X�^���擾
         * @type {object}
         * @param {string} objDeliveryInfo.key DJ_�[�i��R�[�h
         * @param {number} objDeliveryInfo.value �[�i�����ID
         */
        let objDeliveryInfo = {};
        /**
         * �A�C�e���}�X�^���擾
         * @type {object}
         * @param {string} objItemInfo.key �A�C�e��ID
         * @param {number} objItemInfo.value �A�C�e������ID
         */
        let objItemInfo = {};
        /**
         * DJ_�z�����x�}�X�^
         * @type {string} key DJ_�̓C�I�X���x�敪
         * @type {number} value ����ID
         */
        let objDeliveryAreaTempInfo = {};
        /**
         * �ŋ��R�[�h�}�X�^
         */
        let objTaxInfo = {};

        /**
         * DJ_�[�i��
         * @type {string} key custrecord_djkk_delivery_code
         * @type {number} value ����ID
         */
        let objDeliveryDestinationInfo = {};

        /**
         * ���[�����M�֘A���-�[�i��
         * @type {object}
         */
        let objDeliveryMailSenderInfo = {};

        /**
         * �z�����A�C�e�����
         * @type {Array}
         */
        let arrDeliveryItems = [];

        let arrDeliveryItemFilters = [];
        /** �A�C�e��.DJ_�z�����t���O = 1 */
        arrDeliveryItemFilters.push(search.createFilter({
            name: 'custitem_djkk_deliverycharge_flg',
            operator: search.Operator.IS,
            values: true
        }));
        /** �A�C�e��.DJ_�L�����F = True*/
        arrDeliveryItemFilters.push(search.createFilter({
            name: 'custitem_djkk_effective_recognition',
            operator: search.Operator.IS,
            values: true
        }));

        let arrDeliveryItemColumns = [];
        /** ��� */
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
         * �f�[�^��customerid�l�z��
         * @type {Array}
         */
            let arrAllCustomerCode = [];

            /**
             * �f�[�^���[����ID(shipping_deliverydestid)�l�z��
             * @type {Array}
             */
            let arrAllDeliveryCode = [];

            /**
             * �f�[�^���A�C�e��ID(misi_itemid)�l�z��
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
                title: 'map - convertSalesOrderData - �}�X�^�����G���[',
                details: error
            });
            return;
        }

        arrInputData.map(function (obj, index) {

            /**
             * ��������
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
             * �z�����A�C�e������ID
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
                /** �z�����A�C�e������ł��Ȃ��ꍇ */

                objMapResult.isSuccess = false;
                objMapResult.error = '�L���Ȕz�����A�C�e��������ł��܂���B';

                mapContext.write({
                    key: strKey + '-' + index,
                    value: objMapResult
                });
                return;
            }

            try {

                if (objData['deleteflg'] == '1') {
                    /** �폜�t���O = 1(true)�ł���ꍇ�A�����s�v */
                    objMapResult.deleteFlg = true;
                }

                let objSendMailInfo = null;

                let flgMailSenderFromDelivery = false;
                if (objData['shipping_deliverydestid'] != null && objData['shipping_deliverydestid'] != '') {
                    // �[�i�悪�Z�b�g���ꂽ�ꍇ
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
                 * �w�b�_���ϊ���f�[�^
                 * @type {object}
                 */
                let objConvertedData = {
                    // �J�X�^���t�H�[��
                    customform: 175,
                    // �����ԍ�
                    custbody_djkk_exsystem_tranid: objData['tranid'],
                    // �ڋqID
                    entity: objCustomerInfo[(objData['customerid'])],
                    // ���t
                    trandate: convertDateTime(objData['orderdate'], format.Type.DATE, 'YYYYMMDD'),
                    // �X�e�[�^�X
                    orderstatus: 'B',
                    // �c�ƒS����
                    salesrep: objData['salesrepid'],
                    // �󒍒S����
                    custbody_djkk_trans_appr_create_user: objData['csemployeeid'],
                    // DJ_��������ԍ�
                    custbody_djkk_customerorderno: objData['dj_customerorderno'],
                    // �q���
                    // subsidiary: objData['subsidiaryid'],
                    // �Z�N�V����
                    department: objData['departmentid'],
                    // �ʉ�
                    currency: objData['currency'],
                    // �N���X
                    class: objData['classid'],
                    // �q��
                    location: objData['locationid'],
                    // DJ_EC�x�����@�敪
                    custbody_djkk_paymentmethodtyp: objCommonTypeInfo[('19-' + objData['dj_paymentmethodtyp'])],
                    // DJ_�x������
                    custbody_djkk_payment_conditions: objData['dj_paymentcondtyp'],
                    // DJ_�[���斈�݌Ɉ�������
                    custbody_djkk_deliveryruledesc: objData['dj_deliveryruledesc'],
                    // DJ_���ӎ���
                    custbody_djkk_cautiondesc: objData['dj_cautiondesc'],
                    // DJ_�q�Ɍ������l�P
                    custbody_djkk_wmsmemo1: objData['dj_wmsmemo1'],
                    // DJ_�q�Ɍ������l�Q
                    custbody_djkk_wmsmemo2: objData['dj_wmsmemo2'],
                    // DJ_�q�Ɍ������l�R
                    custbody_djkk_wmsmemo3: objData['dj_wmsmemo3'],
                    // DJ_�^����Ќ������l1
                    custbody_djkk_deliverermemo1: objData['dj_deliverermemo1'],
                    // DJ_�^����Ќ������l2
                    custbody_djkk_deliverermemo2: objData['dj_deliverermemo2'],
                    // DJ_�[�i�����l
                    custbody_djkk_deliverynotememo: objData['dj_deliverynotememo'],
                    // DJ_�����˗�ID
                    custbody_djkk_orderrequestid: objData['dj_orderrequestid'],
                    // DJ_�c�ƒS����ID
                    custbody_djkk_salesrepid: objData['dj_salesrepid'],
                    // DJ_Netsuite�A�g�Ώۃt���O
                    custbody_djkk_netsuitetransflg: convertBoolean(objData['dj_netsuitetransflg']),
                    // DJ_Netsuite�A�g����
                    custbodycustbody_djkk_netsuitetransdt: convertDateTime(objData['dj_netsuitetransdt'], format.Type.DATE, 'YYYY�NMM��DD�� HH��mm��ss�b'),
                    // DJ_�o�׎w������
                    custbody_djkk_shippinginstructdt: convertDateTime(objData['dj_shippinginstructdt'], format.Type.DATETIME, 'YYYY�NMM��DD�� HH��mm��ss�b'),
                    // DJ_�o�׈ē����t��敪
                    custbody_djkk_shippinginfodesttyp: objCommonTypeInfo[('34-' + objData['dj_shippinginfodesttyp'])],
                    // DJ_�o�׈ē����t�戶��
                    custbody_djkk_shippinginfodestname: objData['dj_shippinginfodestname'],
                    // DJ_�o�׈ē����t�惁�[��
                    custbody_djkk_shippinginfodestemail: objData['dj_shippinginfodestemail'],
                    // DJ_�o�׈ē����t��FAX
                    custbody_djkk_shippinginfodestfax: objData['dj_shippinginfodestfax'],
                    // DJ_�o�׈ē����M�敪
                    custbody_djkk_shippinginfosendtyp: objCommonTypeInfo[('33-' + objData['dj_shippinginfosendtyp'])],
                    // DJ_�����d������t���O
                    custbody_djkk_consignmentbuyingsaleflg: convertBoolean(objData['dj_consignmentbuyingsalesflg']),
                    // DJ_FINET�J�i�񋟊�Ɩ�
                    custbody_djkk_finetkanaofferconame: objData['dj_finetkanaoffercompanyname'],
                    // DJ_FINET�J�i�񋟊�ƎQ�Ǝ��Ə���
                    custbody_djkk_finetkanaoffercooffice: objData['dj_finetkanaoffercompanyofficename'],
                    // DJ_FINET�J�i�Ж��E�X���E����於
                    custbody_djkk_finetkanacustomername: objData['dj_finetkanacustomername'],
                    // DJ_FINET�J�i�Z��
                    custbody_djkk_finetkanacustomeraddress: objData['dj_finetkanacustomeraddress'],
                    // DJ_FINET�J�i�Ж��E�X���E����於_option2
                    custbody_djkk_finetkanacustomername2: objData['dj_finetkanacustomername2'],
                    // DJ_FINET�J�i�Z��_option2
                    custbody_djkk_finetkanaaddress_option2: objData['dj_finetkanacustomeraddress2'],
                    // DJ_FINET�J�i�Ж��E�X���E����於_option3
                    custbody_djkk_finetkanacustomername_o3: objData['dj_finetkanacustomername3'],
                    // DJ_FINET�J�i�Z��_option3
                    custbody_djkk_finetkanaaddress_option3: objData['dj_finetkanacustomeraddress3'],
                    // DJ_FINET�J�i�Ж��E�X���E����於_option4
                    custbody_djkk_finetkanacustomername4: objData['dj_finetkanacustomername4'],
                    // DJ_FINET�J�i�Z��_option4
                    custbody_djkk_finetkanaaddress_option4: objData['dj_finetkanacustomeraddress4'],
                    // DJ_FINET�J�i�Ж��E�X���E����於_option5
                    custbody_djkk_finetkanacustomername5: objData['dj_finetkanacustomername5'],
                    // DJ_FINET�J�i�Z��_option5
                    custbody_djkk_finetkanaaddress_option5: objData['dj_finetkanacustomeraddress5'],
                    // DJ_�O������̍σt���O
                    custbody_djkk_exsystem_opc_flg: convertBoolean(objData['dj_advancepaymentreceivedflg']),
                    // DJ_�O���V�X�e�����M����
                    custbody_djkk_exsystem_send_date_time: convertDateTime(objData['dj_exsystemreceivedt'], format.Type.DATETIME, 'YYYY�NMM��DD�� HH��mm��ss�b'),
                    // DJ_FINET_���M���Z���^�[�R�[�h
                    custbody_djkk_finet_sender_center_code: objData['dj_finetcustomerEDIcode'],
                    // DJ_FINET_�ŏI���M��R�[�h
                    custbody_djkk_finet_final_dest_code: objData['dj_finetfinaldestcode'],
                    // DJ_FINET_�ŏI���M��R�[�h�i�\���j
                    custbody_djkk_finet_final_dest_code_bk: objData['dj_finetfinaldestcodebk'],
                    // DJ_FINET_���ڑ��M���ƃR�[�h
                    custbody_djkk_finet_direct_dest_code: objData['dj_finetdirectdestcode'],
                    // DJ_FINET_���ڑ��M���ƃR�[�h�i�\���j
                    custbody_djkk_finet_direct_dest_codebk: objData['dj_finetdirectdestcodebk'],
                    // DJ_FINET_�񋟊�ƃR�[�h
                    custbody_djkk_finet_provider_comp_code: objData['dj_finetprovidercompcode'],
                    // DJ_FINET_�񋟊�Ǝ��Ə��R�[�h
                    custbody_djkk_finet_provider_office_cd: objData['dj_finetproviderofficecd'],
                    // DJ_FINET_�ꎟ�X�R�[�h
                    custbody_djkk_finet_first_store_code: objData['dj_finetfirststorecode'],
                    // DJ_FINET_�񎟓X�R�[�h
                    custbody_djkk_finet_second_store_code: objData['dj_finetsecondstorecode'],
                    // DJ_FINET_�O���X�R�[�h
                    custbody_djkk_finet_third_store_code: objData['dj_finetthirdstorecode'],
                    // DJ_FINET_�l���X�R�[�h
                    custbody_djkk_finet_fourth_store_code: objData['dj_finetfourthstorecode'],
                    // DJ_FINET_�܎��X�R�[�h
                    custbody_djkk_finet_fifth_store_code: objData['dj_finetfifthstorecode'],
                    // DJ_FINET_��`���
                    custbody_djkk_finet_bills_info: objCommonTypeInfo[('39-' + objData['dj_finetbillsinfo'])],
                    // DJ_FINET_�q���敪
                    custbody_djkk_finet_location_type: objCommonTypeInfo[('40-' + objData['dj_finetlocationtype'])],
                    // DJ_FINET�A�g�Ώۃt���O
                    custbody_djkk_finet_applicable_flg: convertBoolean(objData['dj_finetapplicableflg']),
                    // DJ_FINET�o�׈ē����M�t���O
                    custbody_djkk_finet_shipment_mail_flg: convertBoolean(objData['dj_finetshipmentmailflg']),
                    // DJ_FINET�������M�t���O
                    custbody_djkk_finet_bill_mail_flg: convertBoolean(objData['dj_finetbillmailflg']),
                    // DJ_�������@�敪
                    custbody_djkk_ordermethodrtyp: objCommonTypeInfo[('10-' + objData['dj_ordermethodrtyp'])],
                    // DJ_FINET_���M���Z���^�[�R�[�h
                    custbody_djkk_finet_sender_center_code: objData['dj_finetcustomeredicode'],
                    // DJ_EC����敪�R�[�h
                    custbody_djkk_customertype: objData['dj_customertype'],
                    // �쐬����
                    createddate: convertDateTime(objData['createtime'], format.Type.DATETIME, 'YYYY�NMM��DD�� HH��mm��ss�b'),
                    // �쐬��
                    recordcreatedby: objData['createuser'],
                    // // �o�ד�
                    // shipdate: convertDateTime(objData['shipping_expectedshippingdate'], format.Type.DATE, 'YYYYMMDD'),
                    // DJ_�[�i��
                    custbody_djkk_delivery_date: convertDateTime(objData['shipping_dj_deliverydate'], format.Type.DATE, 'YYYYMMDD'),
                    // DJ_�[�����ԑыL�q
                    custbody_djkk_deliverytimedesc: objData['shipping_dj_deliverytimedesc'],
                    // DJ_�[�i��]��
                    custbody_djkk_delivery_hopedate: convertDateTime(objData['shipping_dj_expecteddeliverydate'], format.Type.DATE, 'YYYYMMDD'),
                    // // �z�����@
                    // shipmethod: objData['shipping_deliverymethod'],
                    // // �z����
                    // shippingcost: objData['shipping_deliverycharges'],
                    // // �z�����̐ŋ��R�[�h
                    // shippingtaxcode: objTaxInfo[objData['shipping_deliverytaxcd']],
                    // // �萔���̐ŋ��R�[�h
                    // handlingtaxcode: objTaxInfo[objData['shipping_taxcdforfee']],
                    // DJ_�[�i��
                    custbody_djkk_delivery_destination: objDeliveryDestinationInfo[(objData['shipping_deliverydestid'])],
                    // DJ_�[���斢�o�^�t���O
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
                    // �z�����̐ŋ��R�[�h���w�肳��Ă��Ȃ��ꍇ�A�ݒ�Ȃ���
                    delete objConvertedData['shippingtaxcode'];
                }

                if (objData['shipping_taxcdforfee'] == '') {
                    // �萔���̐ŋ��R�[�h���w�肳��Ă��Ȃ��ꍇ�A�ݒ�Ȃ���
                    delete objConvertedData['handlingtaxcode'];
                }

                /**
                 * ���ו��ϊ���f�[�^�z��
                 * @type {Array}
                 */
                let arrConvertedLineData = [];

                objData['recordLine'].map(function (objLineData) {

                    if (objLineData['misi_deleteflg'] == '1') {
                        // ����.�폜�t���O = 1 �ł���ꍇ�A�쐬�s�v
                        return;
                    }

                    /**
                     * ���׍s�ϊ���f�[�^
                     * @type {object}
                     */
                    let objLineConvertedData = {
                        // �A�C�e��
                        item: objItemInfo[(objLineData['misi_itemid'])],
                        // DJ_�A�C�e��?�p��
                        custcol_djkk_item: objItemInfo[(objLineData['misi_itemid'])],
                        // �q��
                        location: objLineData['misi_locationid'],
                        // �݌ɕۊǒI
                        inventorylocation: objLineData['misi_locationid'],
                        // �z���I��
                        itemfulfillmentchoice: objLineData['misi_deliverytyp'],
                        // ����
                        quantity: objLineData['misi_quantity'],
                        // �P��
                        units: objLineData['misi_unit'],
                        // �P��
                        rate: objLineData['misi_price'],
                        // ���z
                        amount: objLineData['misi_netamount'],
                        // �ŋ��R�[�h
                        taxcode: objTaxInfo[(objLineData['misi_taxcd'])],
                        // �����D��x
                        orderpriority: objLineData['misi_orderpriority'],
                        // �Z�N�V����
                        department: objLineData['misi_detaildepartmentid'],
                        // �N���X
                        class: objLineData['misi_detailclassid'],
                        // DJ_����
                        custcol_djkk_perunitquantity: objLineData['misi_dj_perunitquantity'],
                        // DJ_�P�[�X��
                        custcol_djkk_casequantity: objLineData['misi_dj_casequantity'],
                        // DJ_�o����
                        custcol_djkk_quantity: objLineData['misi_dj_quantity'],
                        // DJ_�z�����x�敪
                        custcol_djkk_deliverytemptyp: objDeliveryAreaTempInfo[(objLineData['misi_dj_deliverytemptyp'])],
                        // DJ_���i����o�ח\��L�q
                        custcol_djkk_nextshipmentdesc: objLineData['misi_dj_nextshipmentdesc'],
                        // DJ_�q�Ɍ������ה��l
                        custcol_djkk_wms_line_memo: objLineData['misi_dj_sowmsdetailmemo'],
                        // DJ_�[�i�����ה��l
                        custcol_djkk_deliverynotememo: objLineData['misi_dj_deliverynotememo'],
                        // DJ_�����˗�ID
                        custcol_djkk_orderrequestid: objLineData['misi_dj_orderrequestid'],
                        // DJ_�˗����׍s�ԍ�
                        custcol_djkk_orderrequestlineno: objLineData['misi_dj_orderrequestlineno'],
                        // DJ_�˗�����
                        custcol_djkk_orderrequestquantity: objLineData['misi_dj_orderrequestquantity'],
                        // DJ_�������i�敪
                        custcol_djkk_partshortagetyp: objCommonTypeInfo[('35-' + objLineData['misi_dj_partshortagetyp'])],
                        // DJ_FINET�J�i���i��
                        custcol_djkk_finetkanaitemdescription: objLineData['misi_dj_finetkanaitemdescription'],
                        // DJ_�˗������σt���O
                        custcol_djkk_orderrequestdivideflg: convertBoolean(objLineData['misi_dj_orderrequestdivideflg']),
                        // DJ_�������׏�ԋ敪
                        custcol_djkk_orderdetailtyp: objCommonTypeInfo[('13-' + objLineData['misi_dj_orderdetailtyp'])],
                        // DJ_�O���V�X�e��_���׍s�ԍ�
                        custcol_djkk_exsystem_line_num: objLineData['misi_lineno']
                    };

                    if (!objLineData.hasOwnProperty('zk') || objLineData['zk'].length <= 0) {
                        /** �݌ɏڍ׃f�[�^���܂܂�Ă��Ȃ��ꍇ */

                        arrConvertedLineData.push(objLineConvertedData);
                        return;
                    }

                    let arrConvertedInventoryData = [];
                    objLineData['zk'].map(function (objInventoryData) {
                        if (objInventoryData['zk_deleteflg'] == '1') {
                            /** �폜�t���O = 1 �̏ꍇ�A�쐬�s�v */
                            return;
                        }

                        /**
                         * �ϊ���݌ɏڍז��׍s�f�[�^
                         * @type {object}
                         */
                        let objConvertedInventoryData = {
                            // �V���A��/���b�g�ԍ�
                            issueinventorynumber: objInventoryData['zk_dj_manageno'],
                            // DJ_��������
                            quantity: objInventoryData['zk_dj_allocationquantity'],
                            // // �ܖ�����
                            // expirationdate: convertDateTime(objInventoryData['zk_expdate'], format.Type.DATE, 'YYYYMMDD'),
                            // DJ_���[�J�̐����ԍ�
                            custrecord_djkk_maker_serial_code: objInventoryData['zk_lotno']
                        };

                        arrConvertedInventoryData.push(objConvertedInventoryData);
                    });

                    objLineConvertedData['inventoryDetail'] = arrConvertedInventoryData;
                    arrConvertedLineData.push(objLineConvertedData);
                });

                if (numDeliveryChargeItemId != 0) {
                    /** �z�����s��ǉ� */
                    arrConvertedLineData.push({
                        item: numDeliveryChargeItemId,
                        quantity: 1,
                        rate: (objData.hasOwnProperty('shipping_deliverycharges') ? Number(objData['shipping_deliverycharges']) : 0),
                        custcol_djkk_exsystem_line_num: objData['recordLine'].length + 1
                    });

                    // // �o�ד�
                    // shipdate: convertDateTime(objData['shipping_expectedshippingdate'], format.Type.DATE, 'YYYYMMDD'),
                    // // DJ_�[�i��
                    // custbody_djkk_delivery_date: convertDateTime(objData['shipping_dj_deliverydate'], format.Type.DATE, 'YYYYMMDD'),
                    // // DJ_�[�����ԑыL�q
                    // custbody_djkk_deliverytimedesc: objData['shipping_dj_deliverytimedesc'],
                    // // DJ_�[�i��]��
                    // custbody_djkk_delivery_hopedate: convertDateTime(objData['shipping_dj_expecteddeliverydate'], format.Type.DATE, 'YYYYMMDD'),
                    // // �z�����@
                    // shipmethod: objData['shipping_deliverymethod'],
                    // // �z����
                    // shippingcost: objData['shipping_deliverycharges'],
                    // // �z�����̐ŋ��R�[�h
                    // shippingtaxcode: objTaxInfo[objData['shipping_deliverytaxcd']],
                    // // �萔���̐ŋ��R�[�h
                    // handlingtaxcode: objTaxInfo[objData['shipping_taxcdforfee']],
                    // // DJ_�[�i��
                    // custbody_djkk_delivery_destination: objDeliveryDestinationInfo[(objData['shipping_deliverydestid'])],
                    // // DJ_�[���斢�o�^�t���O
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
         * �ėp�敪�}�X�^
         * @type {object}
         * @param {string} objCommonTypeInfo.key �敪��ރR�[�h-�敪�R�[�h
         * @param {number} objCommonTypeInfo.value �敪����ID
         */
        let objCommonTypeInfo = {};

        /**
         * �ڋq�}�X�^���
         * @type {object}
         * @param {string} objCustomerInfo.key �ڋqID
         * @param {number} objCustomerInfo.value �ڋq����ID
         */
        let objCustomerInfo = {};
        /**
         * �A�C�e���}�X�^���擾
         * @type {object}
         * @param {string} objItemInfo.key �A�C�e��ID
         * @param {number} objItemInfo.value �A�C�e������ID
         */
        let objItemInfo = {};

        /**
         * DJ_�z�����x�}�X�^
         * @type {string} key DJ_�̓C�I�X���x�敪
         * @type {number} value ����ID
         */
        let objDeliveryAreaTempInfo = {};

        /**
         * �ŋ��R�[�h�}�X�^
         */
        let objTaxInfo = {};

        /**
         * DJ_�[�i��
         * @type {string} key custrecord_djkk_delivery_code
         * @type {number} value ����ID
         */
        let objDeliveryDestinationInfo = {};

        try {
            /**
             * �f�[�^��customerid�l�z��
             * @type {Array}
             */
            let arrAllCustomerCode = [];

            /**
             * �f�[�^���A�C�e��ID(misi_itemid)�l�z��
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
                title: 'map - convertTransferOrderData - �}�X�^�[�����G���[',
                details: error
            });
            return;
        }

        arrInputData.map(function (obj, index) {
            /**
             * ��������
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
                    /** �폜�t���O = 1(true)�ł���ꍇ�A�����s�v */
                    objMapResult.deleteFlg = true;
                }

                /**
                 * �w�b�_���ϊ���f�[�^
                 * @type {object}
                 */
                let objConvertedData = {
                    // �J�X�^���t�H�[��
                    customform: 104,
                    // �q���
                    subsidiary: objData['subsidiaryid'],
                    // �����ԍ�
                    custbody_djkk_exsystem_tranid: objData['orderno'],
                    // ���t
                    trandate: convertDateTime(objData['date'], format.Type.DATE, 'YYYYMMDD'),
                    // �ړ���
                    location: objData['transfromlocationid'],
                    // �ړ���
                    transferlocation: objData['transtolocationid'],
                    // �X�e�[�^�X
                    orderstatus: 'B',
                    // �Z�N�V����
                    department: objData['departmentid'],
                    // �N���X
                    class: objData['classid'],
                    // DJ_�ڋq
                    custbody_djkk_customerid: objCustomerInfo[objData['dj_customerid']],
                    // �c�ƒS����
                    salesrep: objData['dj_salesrepid'],
                    // DJ_�󒍒S����ID
                    custbody_djkk_csemployeeid: objData['dj_csemployeeid'],
                    // DJ_��������ԍ�
                    custbody_djkk_customerorderno: objData['dj_customerorderno'],
                    // DJ_�[���斈�݌Ɉ�������
                    custbody_djkk_deliveryruledesc: objData['dj_deliveryruledesc'],
                    // DJ_���ӎ���
                    custbody_djkk_cautiondesc: objData['dj_cautiondesc'],
                    // DJ_�q�Ɍ������l�P
                    custbody_djkk_wmsmemo1: objData['dj_wmsmemo1'],
                    // DJ_�q�Ɍ������l�Q
                    custbody_djkk_wmsmemo2: objData['dj_wmsmemo2'],
                    // DJ_�q�Ɍ������l�R
                    custbody_djkk_wmsmemo3: objData['dj_wmsmemo3'],
                    // DJ_�^����Ќ������l�P
                    custbody_djkk_deliverermemo1: objData['dj_deliverermemo1'],
                    // DJ_�^����Ќ������l�Q
                    custbody_djkk_deliverermemo2: objData['dj_deliverermemo2'],
                    // DJ_�[�i�����l
                    custbody_djkk_deliverynotememo: objData['dj_deliverynotememo'],
                    // DJ_�����˗�ID
                    custbody_djkk_orderrequestid: objData['dj_orderrequestid'],
                    // DJ_Netsuite�A�g�Ώۃt���O
                    custbody_djkk_netsuitetransflg: convertBoolean(objData['dj_netsuitetransflg']),
                    // DJ_Netsuite�A�g����
                    custbodycustbody_djkk_netsuitetransdt: convertDateTime(objData['dj_netsuitetransdt'], format.Type.DATE, 'YYYY�NMM��DD�� HH��mm��ss�b'),
                    // DJ_�o�׎w������
                    custbody_djkk_shippinginstructdt: convertDateTime(objData['dj_shippinginstructdt'], format.Type.DATETIME, 'YYYY�NMM��DD�� HH��mm��ss�b'),
                    // DJ_FINET�J�i�񋟊�Ɩ�
                    custbody_djkk_finetkanaofferconame: objData['dj_finetkanaoffercompanyname'],
                    // DJ_FINET�J�i
                    custbody_djkk_finetkanaoffercooffice: objData['dj_finetkanaoffercompanyofficename'],
                    // DJ_FINET�J�i�Ж��E�X���E����於
                    custbody_djkk_finetkanacustomername: objData['dj_finetkanacustomername'],
                    // DJ_FINET�J�i�Z��
                    custbody_djkk_finetkanacustomeraddress: objData['dj_finetkanacustomeraddress'],
                    // �쐬����
                    createddate: convertDateTime(objData['createtime'], format.Type.DATETIME, 'YYYY�NMM��DD�� HH��mm��ss�b'),
                    // �쐬��
                    recordcreatedby: objData['createuser'],
                    // �o�ד�
                    shipdate: convertDateTime(objData['shipping_expectedshippingdate'], format.Type.DATE, 'YYYYMMDD'),
                    // DJ_�[�i��
                    custbody_djkk_delivery_date: convertDateTime(objData['shipping_dj_deliverydate'], format.Type.DATE, 'YYYYMMDD'),
                    // DJ_�[�����ԑыL�q
                    custbody_djkk_deliverytimedesc: objData['shipping_dj_deliverytimedesc'],
                    // �z���Ǝ�
                    shipcarrier: '',
                    // �z�����@
                    shipmethod: objData['shipping_deliverymethod'],
                    // �z����
                    shippingcost: objData['shipping_deliveryfee'],
                    // �萔��
                    handlingcost: objData['shipping_fee'],
                    // DJ_�[�i��
                    custbody_djkk_delivery_destination: objDeliveryDestinationInfo[(objData['shipping_deliverydestid'])],
                    // DJ_�c�ƒS����ID
                    custbody_djkk_salesrepid: objData['dj_salesrepid']
                };

                /**
                 * ���ו��ϊ���f�[�^�z��
                 * @type {Array}
                 */
                let arrConvertedLineData = [];

                objData['recordLine'].map(function (objLineData) {

                    if (objLineData['misi_deleteflg'] == '1') {
                        // ����.�폜�t���O = 1 �ł���ꍇ�A�쐬�s�v
                        return;
                    }

                    /**
                     * ���׍s�ϊ���f�[�^
                     * @type {object}
                     */
                    let objLineConvertedData = {
                        // �A�C�e��
                        item: objItemInfo[(objLineData['misi_itemid'])],
                        // DJ_�A�C�e��?�p��
                        custcol_djkk_item: objItemInfo[(objLineData['misi_itemid'])],
                        // �q��
                        location: objLineData['misi_locationid'],
                        // �݌ɕۊǒI
                        inventorylocation: objLineData['misi_locationid'],
                        // �z���I��
                        itemfulfillmentchoice: objLineData['misi_deliverytyp'],
                        // ����
                        quantity: objLineData['misi_quantity'],
                        // �P��
                        units: objLineData['misi_unit'],
                        // �P��
                        rate: objLineData['misi_price'],
                        // ���z
                        amount: objLineData['misi_netamount'],
                        // �ŋ��R�[�h
                        taxcode: objTaxInfo[(objLineData['misi_taxcd'])],
                        // �����D��x
                        orderpriority: objLineData['misi_orderpriority'],
                        // �Z�N�V����
                        department: objLineData['misi_detaildepartmentid'],
                        // �N���X
                        class: objLineData['misi_detailclassid'],
                        // DJ_����
                        custcol_djkk_perunitquantity: objLineData['misi_dj_perunitquantity'],
                        // DJ_�P�[�X��
                        custcol_djkk_casequantity: objLineData['misi_dj_casequantity'],
                        // DJ_�o����
                        custcol_djkk_quantity: objLineData['misi_dj_quantity'],
                        // DJ_�z�����x�敪
                        custcol_djkk_deliverytemptyp: objDeliveryAreaTempInfo[(objLineData['misi_dj_deliverytemptyp'])],
                        // DJ_���i����o�ח\��L�q
                        custcol_djkk_nextshipmentdesc: objLineData['misi_dj_nextshipmentdesc'],
                        // DJ_�[�i�����ה��l
                        custcol_djkk_deliverynotememo: objLineData['misi_dj_deliverynotememo'],
                        // DJ_�q�Ɍ������ה��l
                        custcol_djkk_wms_line_memo: objLineData['dj_sowmsdetailmemo'],
                        // DJ_�����˗�ID
                        custcol_djkk_orderrequestid: objLineData['misi_dj_orderrequestid'],
                        // DJ_�˗����׍s�ԍ�
                        custcol_djkk_orderrequestlineno: objLineData['misi_dj_orderrequestlineno'],
                        // DJ_�˗�����
                        custcol_djkk_orderrequestquantity: objLineData['misi_dj_orderrequestquantity'],
                        // DJ_�������i�敪
                        custcol_djkk_partshortagetyp: objCommonTypeInfo[('35-' + objLineData['misi_dj_partshortagetyp'])],
                        // DJ_FINET�J�i���i��
                        custcol_djkk_finetkanaitemdescription: objLineData['misi_dj_finetkanaitemdescription'],
                        // DJ_�˗������σt���O
                        custcol_djkk_orderrequestdivideflg: convertBoolean(objLineData['misi_dj_orderrequestdivideflg']),
                        // DJ_�������׏�ԋ敪
                        custcol_djkk_orderdetailtyp: objCommonTypeInfo[('13-' + objLineData['misi_dj_orderdetailtyp'])],
                        // DJ_�O���V�X�e��_���׍s�ԍ�
                        custcol_djkk_exsystem_line_num: objLineData['misi_lineno']
                    };

                    if (!objLineData.hasOwnProperty('zk') || objLineData['zk'].length <= 0) {
                        /** �݌ɏڍ׃f�[�^���܂܂�Ă��Ȃ��ꍇ */

                        arrConvertedLineData.push(objLineConvertedData);
                        return;
                    }

                    let arrConvertedInventoryData = [];
                    objLineData['zk'].map(function (objInventoryData) {
                        if (objInventoryData['zk_deleteflg'] == '1') {
                            /** �폜�t���O = 1 �̏ꍇ�A�쐬�s�v */
                        }

                        /**
                         * �ϊ���݌ɏڍז��׍s�f�[�^
                         * @type {object}
                         */
                        let objConvertedInventoryData = {
                            // �V���A��/���b�g�ԍ�
                            issueinventorynumber: objInventoryData['zk_dj_manageno'],
                            // DJ_��������
                            quantity: objInventoryData['zk_dj_allocationquantity'],
                            // // �ܖ�����
                            // expirationdate: convertDateTime(objInventoryData['zk_expdate'], format.Type.DATE, 'YYYYMMDD'),
                            // DJ_���[�J�̐����ԍ�
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
     * �ėp�敪�}�X�^�擾
     * @returns {object} objInfo
     * @type {string} objInfo.key �敪��ރR�[�h-�敪�R�[�h
     * @type {number} objInfo.value ����ID
     */
    function getCommonTypeMaster() {
        let objInfo = {};

        let filters = [];
        /** ���� = false */
        filters.push(search.createFilter({
            name: 'isinactive',
            operator: search.Operator.IS,
            values: false
        }));
        let columns = [];
        /** �敪��ރR�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_category_code' }));
        /** �敪�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code' }));

        let results = utils.searchResult('customrecord_djkk_common_type', filters, columns);
        for (let i = 0; i < results.length; i++) {
            let tmpResult = results[i];
            /** �敪��ރR�[�h */
            let numTypeCode = tmpResult.getValue({ name: 'custrecord_djkk_category_code' });
            /** �敪�R�[�h */
            let numCode = tmpResult.getValue({ name: 'custrecord_djkk_type_code' });

            objInfo[(numTypeCode + '-' + numCode)] = tmpResult.id;
        }
        return objInfo
    }

    /**
     * �u�[���l�ϊ�
     * 1 - true�A0 - false
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
     * �����ϊ�
     * @param {*} value ���f�[�^
     * @param {*} type ��ށiformat.Type.DATE�Aformat.Type.DATETIME�Aformat.Type.TIME�j
     * @param {*} strFormat �t�H�[�}�b�g
     * @returns {string} �ϊ������������
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
     * �ŋ��R�[�h�}�X�^���擾
     * @returns {object} �ŋ��R�[�h�}�X�^
     * @type {string} key �ŋ��R�[�h.DJ_�O���V�X�e���p�ŋ��R�[�h.�敪�R�[�h
     * @type {number} value �ŋ��R�[�h.����ID
     */
    function getTaxInfo() {
        let objResult = {};

        let columns = [];
        /** DJ_�O���V�X�e���p�ŋ��R�[�h.�敪�R�[�h */
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
     * ���f�[�^���G���[/�������̃f�[�^�z��𒊏o
     * @param {number} numDataFileId ���f�[�^�t�@�C������ID
     * @param {Array} arrFailedOrderRequestId �G���[�f�[�^�����˗�ID
     * @returns {Array} �G���[�f�[�^�z��
     */
    function getErrorData(numDataFileId, arrFailedOrderRequestId) {
        /**
         * ���f�[�^�t�@�C�����e
         * @type {object}
         */
        const objOriginData = JSON.parse(file.load({ id: numDataFileId }).getContents());

        /**
         * ���f�[�^�z��
         * @type {Array}
         */
        const arrOriginData = objOriginData['record_data'];

        /**
         * �G���[�f�[�^�𒊏o
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
        // �[�i�����M���@
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_period'}));
        // �[�i�����M��S����
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_person'}));
        // �[�i�����M���Ж�(3RD�p�[�e�B�[)
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_subname'}));
        // �[�i�����M��S����(3RD�p�[�e�B�[)
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_person_t'}));
        // �[�i�����M�惁�[��(3RD�p�[�e�B�[)
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_email'}));
        // �[�i�����M��FAX(3RD�p�[�e�B�[)
        columns.push(search.createColumn({name: 'custentity_djkk_delivery_book_fax_three'}));
        // �[�i���������M���l
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
        // DJ_�o�׈ē����M��敪
        columns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_shippinginfodesttyp'}));
        // DJ_�[�i�����M���@
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_period'}));
        // DJ_�[�i�����M��S����
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_person'}));
        // DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_subname'}));
        // DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_person_t'}));
        // DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_email'}));
        // DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_book_fax_three'}));
        // DJ_�[�i���������M���t����l
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