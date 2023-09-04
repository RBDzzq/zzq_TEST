/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/file', 'N/search', 'N/runtime', '/SuiteScripts/DENISJAPAN/2.0/Common/file_cabinet_common'],
    /**
     * @param{file} file
     * @param{search} search
     */
    (record, file, search, runtime, cabinet) => {
        const FOLDER_RAW_ID = 362;
        const FOLDER_PROCESSING_ID = 360;
        const FOLDER_DONE_ID = 359;
        const FOLDER_BAK_ID = 361;
        const FOLDER_ERROR_ID = 363;
        const DEFAULT_BIN = '11'; //�?フォルト保管�?	場�?: ケイヒン?���?�式�?
        const DEFAULT_STATUS = '1';
        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            const rawFiles = getRawFiles();
            rawFiles.forEach((fileId, index) => {
                //copy raw file to processing folder
                const processingFileId = file.copy({
                    id: parseInt(fileId),
                    folder: FOLDER_PROCESSING_ID,
                    conflictResolution: file.NameConflictResolution.OVERWRITE
                });
                log.debug("processing file id", processingFileId.id);
                //backup file
                moveFileToFolder(fileId, FOLDER_BAK_ID);
                //load csv file content and spread records to reduce processing
                const csvFile = file.load({
                    id: processingFileId.id
                });
                log.debug("csv file size", csvFile.size);
                try {
                    if (csvFile.size < 10485760) { // max 10M
                        const csvData = csvFile.getContents();
                        const lines = csvData.split(/\r?\n|\r/);
                        const tranidList = [];
                        const shippingData = {};
                        const lineNoList = [];
                        const itemCodeList = [];
                        const itemUseBinMap = {};
                        const lotNoList = [];
                        const lotNoMapId = {};
                        lines.forEach((line) => {
                            const cells = line.split(',');
                            const tranid = cells[6];
                            if (!tranid) {
                                return true;
                            }
                            let lineNo = cells[7];
                            let itemCode = cells[18];
                            let lotno = cells[19];
                            let qty = parseInt(cells[24]);
                            if (!!tranid && tranidList.indexOf(tranid) < 0) {
                                tranidList.push(tranid);
                                log.debug("tranid", tranid);
                            }
                            log.debug("line detail", {itemCode, lotno, qty});

                            let dataKey = tranid + '#' + lineNo; // group by line
                            let shippingDetails = shippingData[dataKey];
                            if (!shippingDetails) {
                                shippingDetails = {
                                    'itemcode': itemCode,
                                    'qty': 0,
                                    'lots': []
                                };
                                shippingData[dataKey] = shippingDetails;
                            }
                            shippingDetails.qty = shippingDetails.qty + qty;
                            shippingDetails.lots.push({'lotno': lotno, 'qty': qty});
                            // lineNoList.push(lineNo);
                            lotNoList.push(lotno);
                            itemCodeList.push(itemCode);
                            return true;
                        });
                        //search lot internal id
                        log.debug('lot no list', lotNoList);
                        log.debug('shippingData', shippingData);
                        // log.debug('line no list', lineNoList);
                        const lotFilters = [];
                        lotNoList.forEach((lotNo) => {
                            lotFilters.push(["formulatext: {inventorynumber}", "is", lotNo]);
                            lotFilters.push('OR');
                        });
                        if (lotFilters.length) {
                            lotFilters.splice(lotFilters.length - 1, 1);
                        }
                        const inventoryNumberCol = search.createColumn({name: "inventorynumber", label: "番号", summary: "GROUP"});
                        var inventorydetailSearchObj = search.create({
                            type: "inventorydetail",
                            filters: lotFilters,
                            columns:
                                [
                                    inventoryNumberCol
                                ]
                        });
                        /* test lot data
                        let runResult = inventorydetailSearchObj.run();
                         let pageList = runResult.getRange({
                             start : 0,
                             end : 5
                         });
                         for (var i = 0; i < pageList.length; i++) {
                             log.debug('lot data', pageList[i]);
                         }*/

                        var searchResultCount = inventorydetailSearchObj.runPaged().count;
                        log.debug("inventorydetailSearchObj result count", searchResultCount);
                        inventorydetailSearchObj.run().each((result) => {
                            // .run().each has a limit of 4,000 results
                            let lotId = result.getValue(inventoryNumberCol);
                            let lotNoTxt = result.getText(inventoryNumberCol);
                            log.debug('lot no search result', {result, lotNoTxt, lotId});
                            lotNoMapId[lotNoTxt] = lotId;
                            return true;
                        });
                        log.debug('lot no map data', lotNoMapId);

                        //search items check usebin
                        const itemFilters = [];
                        itemCodeList.forEach((itemCode) => {
                            itemFilters.push(["itemid", "is", itemCode]);
                            itemFilters.push('OR');
                        });
                        if (itemFilters.length) {
                            itemFilters.splice(itemFilters.length - 1, 1);
                        }
                        var itemSearchObj = search.create({
                            type: "item",
                            filters: itemFilters,
                            columns:
                                [
                                    search.createColumn({
                                        name: "itemid",
                                        sort: search.Sort.ASC,
                                        label: "名前"
                                    }),
                                    search.createColumn({name: "usebins", label: "保管棚を使用"})
                                ]
                        });
                        var itemSearchObjCount = itemSearchObj.runPaged().count;
                        log.debug("itemSearchObj result count",itemSearchObjCount);
                        itemSearchObj.run().each(function(result){
                            // .run().each has a limit of 4,000 results
                            let itemid = result.getValue('itemid');
                            let usebins = result.getValue('usebins');
                            log.debug('item - usebin', {itemid, usebins});
                            itemUseBinMap[itemid] = usebins;
                            return true;
                        });
                        const soList = getSalesOrderList(tranidList);
                        log.debug('so in file', {soList, tranidList});
                        soList.forEach((so) => {
                            log.debug('so info', so);
                            const tranid = so[0];
                            const internalid = so[1];
                            const otherrefnum = so[2];
                            let dataKey = otherrefnum;
                            const shippingDetails = [];
                            for(let key in shippingData){
                                if(key.startsWith(dataKey)){
                                    shippingDetails.push(shippingData[key]);
                                }
                            }
                            log.debug('so ship data of(' + dataKey + ')', shippingDetails);
                            //when transform, only items with left shipping number will be copied
                            const shipRecords = record.transform({
                                fromType: 'salesorder',
                                fromId: parseInt(internalid),
                                toType: 'itemfulfillment',
                                isDynamic: true
                            });
                            /*shipRecords.commitLine({
                                sublistId: 'item'
                            });*/
                            var count = shipRecords.getLineCount({
                                sublistId: 'item'
                            });
                            // log.debug('shipRecords is dynamic', shipRecords.isDynamic);
                            log.debug('shipRecords line count', count);
                            let processedCount = 0;
                            for (var i = 0; i < count; i++) {
                                log.debug('process shipRecords line', i);
                                shipRecords.selectLine({
                                    sublistId: 'item',
                                    line: i
                                });
                                /*const lineNo = shipRecords.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'orderline'
                                });*/
                                /*const lineNo = (i + 1) + '';
                                log.debug('processing so line', lineNo);
                                if (lineNoList.indexOf(lineNo) < 0) {
                                    log.debug('ignore line', lineNo);
                                    shipRecords.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'itemreceive',
                                        value: false,
                                        ignoreFieldChange: false
                                    });

                                    continue;
                                }*/

                                const qtyRemaining = shipRecords.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantityremaining'
                                });
                                const itemCode = shipRecords.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemname'
                                });
                                /*if (shippingDetails.qty > qtyRemaining) {
                                    shipRecords.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'itemreceive',
                                        value: false,
                                        ignoreFieldChange: false
                                    });
                                    log.debug('line[' + dataKey + '] qty exceeds', 'qty remaining is ' + qtyRemaining + ', but ' + shippingDetails.qty + ' is shipped');
                                    continue;
                                }*/
                                //find match ship record, do not consider partial shipping
                                let matchShipItem = '';
                                for(let s = 0; s < shippingDetails.length; s ++){
                                    const shipItem = shippingDetails[s];
                                    const shipItemCode = shipItem['itemcode'];
                                    const shipQty = shipItem['qty'];
                                    if(shipItemCode == itemCode && shipQty <= qtyRemaining){
                                        matchShipItem = shippingDetails.splice(s, 1)[0];
                                        break;
                                    }
                                }
                                if(!matchShipItem){ // no shipItem found, uncheck 配�??
                                    log.debug('shipItem not found for', {itemCode, qtyRemaining});
                                    shipRecords.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'itemreceive',
                                        value: false,
                                        ignoreFieldChange: false
                                    });
                                    continue;
                                }
                                //set item line quantity
                                shipRecords.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    value: matchShipItem.qty,
                                    ignoreFieldChange: true
                                });
                                // remove 在庫詳細
                                /*shipRecords.removeCurrentSublistSubrecord(
                                    {
                                        sublistId: 'item',
                                        fieldId: 'inventorydetail'
                                    }
                                );*/
                                const inventorySubRecord = shipRecords.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail'
                                });
                                const inventoryAssignmentCount = inventorySubRecord.getLineCount({
                                    sublistId: 'inventoryassignment'
                                });
                                const lots = matchShipItem.lots;
                                const itemcode = matchShipItem.itemcode;
                                const useBin = itemUseBinMap[itemcode];
                                log.debug({title: 'found matching item', details: {matchShipItem}});
                                if(inventoryAssignmentCount == 0){
                                    log.error({title: 'no inventory detail in so'});
                                }
                                const toBeDeletedAssignment = [];
                                for (var j = 0; j < inventoryAssignmentCount; j++) {
                                    inventorySubRecord.selectLine({
                                        sublistId: 'inventoryassignment',
                                        line: j
                                    });
                                    const expectedLot = inventorySubRecord.getCurrentSublistText({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'issueinventorynumber'
                                    });
                                    const expectedQty = inventorySubRecord.getCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity'
                                    });
                                    log.debug({title: 'processing inventory assignment', details: {'index': j, expectedLot, expectedQty}});
                                    let foundLot = '';
                                    for(let e = 0; e < lots.length; e++){
                                        const shitLot = lots[e];
                                        const shitLotNo = shitLot['lotno'];
                                        const shipLotQty = shitLot['qty'];
                                        if(shitLotNo == expectedLot && shipLotQty == expectedQty){
                                            foundLot = lots.splice(e, 1)[0];
                                            break;
                                        }
                                    }
                                    log.debug({title: 'found matching lot', details: foundLot});
                                    if(!foundLot){//TODO: should not happen
                                        //if no ship item found, then remove the line
                                        toBeDeletedAssignment.push(j);
                                        continue;
                                    }
                                    /*inventorySubRecord.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'issueinventorynumber',
                                        value: lotNoMapId[lot.lotno],
                                        ignoreFieldChange: true
                                    });*/
                                    //if item set use bin to true, then binnumber is required
                                    log.debug({title: 'itemcode - usbin', details: useBin});
                                    if(useBin){
                                        inventorySubRecord.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'binnumber',
                                            value: DEFAULT_BIN,
                                            ignoreFieldChange: true
                                        });
                                    }
                                    inventorySubRecord.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'inventorystatus',
                                        value: DEFAULT_STATUS,
                                        ignoreFieldChange: true
                                    });
                                    /*inventorySubRecord.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity',
                                        value: lot.qty,
                                        ignoreFieldChange: true
                                    });*/

                                }
                                inventorySubRecord.commitLine({
                                    sublistId: 'inventoryassignment'
                                });
                                /*inventorySubRecord.save({
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                });*/
                                /*shipRecords.commitLine({
                                    sublistId: 'item'
                                });*/
                                processedCount ++;
                            }
                            if (processedCount > 0) {
                                shipRecords.commitLine({
                                    sublistId: 'item'
                                });
                                /*const shipRecordsItemCount = shipRecords.getLineCount({
                                    sublistId: 'item'
                                });
                                log.debug('shipRecordsItemCount', shipRecordsItemCount);
                                tobeDeletedLine.forEach((lineIdx) => {
                                    log.debug({title: 'remove line', details: lineIdx});
                                    shipRecords.removeLine({
                                        sublistId: 'item',
                                        line: lineIdx
                                    });
                                })*/
                                shipRecords.setValue({
                                    fieldId: 'shipstatus',
                                    value: 'C',
                                    ignoreFieldChange: true
                                });
                                shipRecords.save({
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                });
                            }
                            return true;
                        })

                        moveFileToFolder(processingFileId.id, FOLDER_DONE_ID);
                    } else {
                        log.audit({title: 'file process error', details: 'file size is too large'})
                        //move file to error folder
                        moveFileToFolder(processingFileId, FOLDER_ERROR_ID);
                    }
                } catch (e) {
                    log.error({title: 'file process runtime exception', details: e});
                    //move file to error folder
                    moveFileToFolder(processingFileId.id, FOLDER_ERROR_ID);
                }
                return true;
            })
            const scriptObj = runtime.getCurrentScript();
            log.debug('Remaining governance units: ' + scriptObj.getRemainingUsage());
        }

        const moveFileToFolder = (fileId, targetFolderId) => {
            if (typeof (fileId) != 'number') {
                fileId = parseInt(fileId);
            }
            //move file to folder
            file.copy({
                id: fileId,
                folder: targetFolderId,
                conflictResolution: file.NameConflictResolution.OVERWRITE
            });
            file.delete({
                id: fileId
            })
        }

        const getRawFiles = () => {
            // find all files not processed
            const documentSearch = search.create({
                type: 'file',
                'columns': ['internalid', 'name'],
                filters: ['folder', 'anyof', null, FOLDER_RAW_ID]
            });
            const rawFiles = [];
            documentSearch.run().each((result) => {
                rawFiles.push(result.getValue('internalid'));
                log.debug('found file', result.getValue('internalid') + ' : ' + result.getValue('name'));
                return true;
            });
            return rawFiles;
        }

        const getSalesOrderList = (tranidList) => {
            var searchType = 'salesorder';
            var searchFilters = [];
            searchFilters.push(["type", "anyof", "SalesOrd"]);
            searchFilters.push("AND");
            var subFilters = [];
            tranidList.forEach((id) => {
                // subFilters.push(["tranid", "is", id]);//注�?书番号
                subFilters.push(["otherrefnum", "equalto", id]);//发注书番号
                subFilters.push("OR");
            })
            
            subFilters.pop();
            //subFilters.splice(searchFilters.length - 1, 1);
            searchFilters.push(subFilters);
            // searchFilters.push("AND");
            // searchFilters.push(["custbody_djkk_delivery_hopedate", "on", date]);
            log.debug('searchFilters: ', searchFilters);
            var searchColumns = [];
            searchColumns.push(search.createColumn({
                name: "tranid",
                summary: "GROUP"
            }));
            searchColumns.push(search.createColumn({
                name: "internalid",
                summary: "GROUP"
            }));
            searchColumns.push(search.createColumn({
                name: "otherrefnum",
                summary: "GROUP"
            }));
            var resultList = [];
            var searchResults = createSearch(searchType, searchFilters, searchColumns);
            log.debug('searchResults: ', searchResults);
            for (var i = 0; i < searchResults.length; i++) {
                var searchResult = searchResults[i];
                var lineData = [];
                for (var j = 0; j < searchColumns.length; j++) {
                    var value = searchResult.getValue(searchColumns[j]);
                    lineData.push(value);
                }
                resultList.push(lineData);
            }
            return resultList;
        }

        const getSalesOrderShipList = (tranidList) => {
            var searchType = 'itemfulfillment';
            var searchFilters = [];
            /*searchFilters.push(["type", "anyof", "SalesOrd"]);
            searchFilters.push("AND");*/
            searchFilters.push(["createdfrom", "anyof", tranidList]);
            // searchFilters.push("AND");
            // searchFilters.push(["custbody_djkk_delivery_hopedate", "on", date]);
            var searchColumns = [];
            searchColumns.push(search.createColumn({
                name: "itemname"
            }));
            searchColumns.push(search.createColumn({
                name: "itemquantity"
            }));
            var resultList = [];
            var searchResults = createSearch(searchType, searchFilters, searchColumns);
            log.debug('searchResults: ', searchResults);
            for (var i = 0; i < searchResults.length; i++) {
                var searchResult = searchResults[i];
                var lineData = [];
                for (var j = 0; j < searchColumns.length; j++) {
                    var value = searchResult.getValue(searchColumns[j]);
                    lineData.push(value);
                }
                resultList.push(lineData);
            }
            return resultList;
        }


        /**
         * 検索共通メソ�?�?
         */
        const createSearch = (searchType, searchFilters, searchColumns) => {

            let resultList = [];
            let resultIndex = 0;
            const resultStep = 1000;

            const objSearch = search.create({
                type: searchType,
                filters: searchFilters,
                columns: searchColumns
            });
            const objResultSet = objSearch.run();

            do {
                var results = objResultSet.getRange({
                    start: resultIndex,
                    end: resultIndex + resultStep
                });

                if (results.length > 0) {
                    resultList = resultList.concat(results);
                    resultIndex = resultIndex + resultStep;
                }
            } while (results.length == 1000);

            return resultList;
        }

        return {execute}
    });
