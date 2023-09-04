/**
 * JSONのデータを分析して、テーブル別にデータを保存する 定期スクリプト?@ : => JSON Parse
 * 
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime', './Common_2_Data_Setting', 'N/task', 'N/format', './getSelectData', 'N/log'], function(record, search, runtime, tableTypeObj, task, format, selectData, log) {

    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     * データベースで保存したJSONデータを取得して（一件のみ、未処理済みのデータが対象とする）、行単位で分割して、JSON Parseレコードタイプのデータを作成する。
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
        log.audit("INFO", "OCIデータ受信step1開始");
        var now = new Date();
        log.audit("INFO", "OCIデータ受信step1開始time :" + now);
    	var script = runtime.getCurrentScript();
        var jsonId = script.getParameter({
            name : 'custscript_json_id'
        });
        var myCustomListSearch = search.create({
            type : 'customrecord_json_main',
            filters : [["custrecord_json_main_processed", "is", "F"],"AND",["internalId","is",jsonId],  ],
            columns : [{
                name : 'internalId'
            }, {
                name : "custrecord_json_main_record"
            }]
        });
        var resultSet = myCustomListSearch.run();
        var results = resultSet.getRange({
            start : 0,
            end : 1
        });
        var jsonData = null;
        if (results.length == 0) {
            return [];
        }
        for ( var i in results) {
            var internalId = results[i].getValue({
                name : 'internalId'
            });
            jsonData = results[i].getValue({
                name : 'custrecord_json_main_record'
            });

            break;
        };

        // レコードを更新する：処理済みフラグを処理済み状態に設定
        var otherId = record.submitFields({
            type : 'customrecord_json_main',
            id : internalId,
            values : {
                'custrecord_json_main_processed' : 'T'
            }
        });
        //log.audit("INFO", "internalId:"+internalId);
        if (jsonData) {
            var jsonDataObj = JSON.parse(jsonData);
            return makeStoreRecords(jsonDataObj.recordData, internalId);
        } else {
            return [];
        }
        //　行単位のデータ配列を戻す
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair. 
     * JSONデータの行データ単位を処理する
     * 
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
        //log.audit("INFO", "Map開始");
        var storeKey = context.key;// storeRecordのキー

        var Constants = tableTypeObj.Constant;
        var response = []; // レスポンス用の配列 mapで返す
        var sublistArray = [];
        var sublistObject = [];
        var removedArray = [];
        var storeRecord = JSON.parse(context.value);// storeRecordはInputData[i]に対応
        var masterTableName = tableTypeObj.DataRecordTypes.caseTable[storeRecord.recordInfo.caseNo];
    	var masterTables = tableTypeObj.DataRecordTypes.masterTables;
    	var masterTable = masterTables[masterTableName];
    	var errorlog = masterTable.errorlog;
    	var firstRun = masterTable.firstRun;

        try {
            var field, sublist, subfield, fieldType, val;
            var recordsTypes = storeRecord.recordInfo.recordsTypes;
            var error = "";

            var keyRecordId;
            for (var k = 0; k < recordsTypes.length; k++) {
                var recordsType = recordsTypes[k];

                var setValues = storeRecord[recordsType];

                var recordObject = record.create({
                    type : "customrecord_json_detail",
                    isDynamic : true
                });
                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_record_type',
                    value : recordsType
                });
                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_main_line_no',
                    value : storeKey
                });
                recordObject.setValue({
                    fieldId : 'custrecord_json_main_id',
                    value : storeRecord.recordInfo.internalId
                });

                // 外部キー
                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_foreignid',
                    value : storeRecord.recordInfo.foreignId
                });

                // 連結
                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_subsidiary',
                    value : storeRecord.recordInfo.subsidiary
                });
                // 日付
                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_recordeddate',
                    value : storeRecord.recordInfo.trandate
                });
                // 優先
                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_first',
                    value : firstRun
                });

                // keyField(entityId)の値をrecordObjectにセット
                recordObject = _setKeyValue(setValues, recordObject);
                // keyField以外のデータをrecordObjectにセット(一つ目のTypeRecordsの場合3番目の引数はundefined)
                recordObject = _setValues(setValues, recordObject, keyRecordId, true, sublistArray, sublistObject, recordsType, storeRecord.recordInfo.caseNo);

                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_case_no',
                    value : storeRecord.recordInfo.caseNo
                });
                var recordId = recordObject.save({
                    enableSourcing : false,
                    ignoreMandatoryFields : false
                });

                // sublist処理
                if (sublistArray) {
                    // 重複排除
                    var sublistArr = sublistArray.filter(function(x, i, self) {
                        return self.indexOf(x) === i;
                    });
                    //サブリストのデータの一行のデータずつ、JSON Parseの一行のデータを作成する。
                    // sublistArrをループ
                  for (var arr = 0; arr < sublistArr.length; arr++) {
                        var recordObjectSublist = record.create({
                            type : "customrecord_json_detail",
                            isDynamic : true
                        });
                        recordObjectSublist.setValue({
                            fieldId : 'custrecord_json_detail_record_type',
                            value : recordsType
                        });
                        recordObjectSublist.setValue({
                            fieldId : 'custrecord_json_detail_main_line_no',
                            value : storeKey
                        });
                        recordObjectSublist.setValue({
                            fieldId : 'custrecord_json_main_id',
                            value : storeRecord.recordInfo.internalId
                        });
                        recordObjectSublist.setValue({
                            fieldId : 'custrecord_json_detail_record_sublist',
                            value : sublistArr[arr]
                        });
                        recordObjectSublist.setValue({
                            fieldId : 'custrecord_json_detail_case_no',
                            value : storeRecord.recordInfo.caseNo
                        });
                        recordObjectSublist.setValue({
                            fieldId : 'custrecord_json_detail_foreignid',
                            value : storeRecord.recordInfo.foreignId
                        });
                        recordObjectSublist.setValue({
                            fieldId : 'custrecord_json_detail_first',
                            value : firstRun
                        });

                        // sublistObjectをループ：一行のデータの各フィールドの値を設定する
                        for (var obj = 0; obj < sublistObject.length; obj++) {
                            if (sublistArr[arr] == sublistObject[obj]['sublist'] && recordsType == sublistObject[obj]['recordsType']) {
                                recordObjectSublist.setValue({
                                    fieldId : sublistObject[obj]['fieldTemp'],
                                    value : sublistObject[obj]['val']
                                });
                            }
                        }

                        var recordId = recordObjectSublist.save({
                            enableSourcing : false,
                            ignoreMandatoryFields : false
                        });
                    }
                }

            }
            context.write({ // OK 件数合計用 成功実行すれば、OKグループに追加
                key : storeRecord.recordInfo.internalId + "-" + "0",
                value : context.key
            });
        } catch (e) {
            var errorType = "";
			var errorName = "";
			if (errorlog != undefined && errorlog.length > 0) {
				errorType = errorlog[0];
				errorName = errorlog[1];
			}
        	var errorMsg = tableTypeObj.DataRecordTypes.errorLogMapping['E_RLR_004'];
			log.error("ERROR", "E_RLR_004 " + e.message);
        	context.write({ // OK 件数合計用 成功実行すれば、OKグループに追加
                key : storeRecord.recordInfo.internalId + "-" + "1",
                value : context.key
            });
        } finally {
            
        }

        // reduce用キー
//        context.write({ // OK 件数合計用 成功実行すれば、OKグループに追加
//            key : storeKey,
//            value : storeKey + '  ' + context.value
//        });
        
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     * 
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {
//        context.write({
//            key : context.key,
//            value : context.values.length
//        });
    	context.write({
            key : context.key,
            value : context.values.length
        });
    }

    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     * 
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
    	 var a = [];
    	 summary.output.iterator().each(function(key, value) {
    		 a.push(key);
    	     return true;
    	 });
         
    	 if (a.length > 0) {
             for (var k = 0; k < a.length; k++) {
            	 var flag = true;
                 var aa = a[k];
                 var aaarr = aa.split("-");
                 if (aaarr[1] == "1") {
                     flag = false;
                     break;
                 }
             }
             if (flag) {
            	 var params = {};
                 var prameterKey = 'custscript_json_parse_mr_step2_first';
                 var prameterSecond = 'custscript_json_parse_mr_step2_second';
                 params[prameterKey] = "TT";
                 params[prameterSecond] = a[0].split("-")[0];
                 
                 // パッチを呼び出す
                 var solTask = task.create({
                     taskType : task.TaskType.MAP_REDUCE,
                     scriptId : 'customscript_json_parse_mr_step2',
                     params : params
                 });
                 var taskId = solTask.submit();
             } else {
            	 var searchFilters = [];
        	     searchFilters.push(['custrecord_json_main_id','is',a[0]]);
        	     var searchColumns = [];
        	     var entityid = search.createColumn({
        	    		            name : 'internalid'
        	    		        });
        	     searchColumns.push(entityid);
        		 var objSearch = search.create({
    		            type : 'customrecord_json_detail',
    		            filters : searchFilters,
    		            columns : searchColumns,
    		        });
    			 var recode = objSearch.run();
    			 var searchResults = [];
    			 if (recode != null) {
    				 var resultIndex = 0;
    				 var resultStep = 1000;
    				 do { 
    					 var searchlinesResults = recode.getRange({
    					                    start : resultIndex,
    					                    end : resultIndex + resultStep
    					                });
    			
    					 if (searchlinesResults.length > 0) {
    					     searchResults = searchResults.concat(searchlinesResults);
    					     resultIndex = resultIndex + resultStep;
    					 }
    				 } while (searchlinesResults.length > 0);
    			 }
    			 if(searchResults.length > 0){
    				 for (var m = 0; m < searchResults.length; m++) {
    					 var searchResult = searchResults[m];
    					 var deletePoRecord = record.delete({
    		                 type: 'customrecord_json_detail',
    		                 id: searchResult.getValue('internalid'),
    		                 });
    				 }
    			 }
    			 var otherId = record.submitFields({
    		            type : 'customrecord_json_main',
    		            id : a[0],
    		            values : {
    		                'custrecord_json_main_errormsg' : 'error'
    		            }
    		        });
             }
    	 }
         var now2 = new Date();
    	 log.audit("INFO", "OCIデータ受信step1終了time :" + now2);
    	 log.audit("INFO", "OCIデータ受信step1終了");
    }

    return {
        getInputData : getInputData,
        map : map,
        reduce : reduce,
        summarize : summarize
    };

    // // データサンプル
    // var recordData = [
    // {"caseNo" : "CS02","foreignId" : "T430080","destination":"1","recordedDate":"20200202", "item" : "T430080","class" : "T430080"},
    // {"caseNo" : "CS02","foreignId" : "T440080","destination":"1","recordedDate":"20200202", "item" : "T440080","class" : "T440080"},
    // {"caseNo" : "CS02","foreignId" : "T450080","destination":"1","recordedDate":"20200202","item" : "T450080", "class" : "T450080"}
    // ];
    // // 関数makeStoreRecordsで作成するstoreRecordsのサンプル
    // var sample_storeRecords = [
    // {
    // 'classification': [
    // {
    // keyFlag: true,
    // NS_FIELD: 'externalid',
    // NS_SUBLIST: '',
    // NS_SUBFIELD: '',
    // NS_FIELDTYPE: 'text',
    // vals: 'T430080',
    // NS_FIELD_TEMP:custrecord_json_detail_str_data_1
    // }, {
    // keyFlag: false,
    // NS_FIELD: 'item',
    // NS_SUBLIST: '',
    // NS_SUBFIELD: '',
    // NS_FIELDTYPE: 'select',
    // vals: 'T430080',
    // NS_FIELD_TEMP:custrecord_json_detail_str_data_2
    // }
    // ],
    // 'inventoryitem': [
    // {
    // keyFlag: true,
    // NS_FIELD: 'externalid',
    // NS_SUBLIST: '',
    // NS_SUBFIELD: '',
    // NS_FIELDTYPE: 'text',
    // vals: 'T430080',
    // NS_FIELD_TEMP:custrecord_json_detail_str_data_1
    // },{
    // keyFlag: false,
    // NS_FIELD: 'item',
    // NS_SUBLIST: '',
    // NS_SUBFIELD: '',
    // NS_FIELDTYPE: 'select',
    // vals: 'T430080',
    // NS_FIELD_TEMP:custrecord_json_detail_str_data_2
    // },{
    // keyFlag: false,
    // NS_FIELD: 'class',
    // NS_SUBLIST: '',
    // NS_SUBFIELD: '',
    // NS_FIELDTYPE: 'select',
    // vals: 'T430080',
    // NS_FIELD_TEMP:custrecord_json_detail_str_data_3
    // }
    // ]
    // }
    // ]
    //
    // // 関数makeStoreRecordsの内部関数_makeTableObject が返すtableObjectsのサンプル
    // var sample_tableObjects = [
    // {
    // 'classification': [
    // {
    // keyFlag: true,
    // NS_FIELD: 'externalid',
    // NS_SUBLIST: '',
    // NS_SUBFIELD: '',
    // NS_FIELDTYPE: 'text',
    // NS_FIELD_TEMP:custrecord_json_detail_str_data_1
    // }, {
    // keyFlag: false,
    // NS_FIELD: 'item',
    // NS_SUBLIST: '',
    // NS_SUBFIELD: '',
    // NS_FIELDTYPE: 'select',
    // NS_FIELD_TEMP:custrecord_json_detail_str_data_2
    // },{
    // keyFlag: true,
    // NS_FIELD: 'externalid',
    // NS_SUBLIST: '',
    // NS_SUBFIELD: '',
    // NS_FIELDTYPE: 'text',
    // NS_FIELD_TEMP:custrecord_json_detail_str_data_1
    // },{
    // keyFlag: false,
    // NS_FIELD: 'item',
    // NS_SUBLIST: '',
    // NS_SUBFIELD: '',
    // NS_FIELDTYPE: 'select',
    // NS_FIELD_TEMP:custrecord_json_detail_str_data_2
    // },{
    // keyFlag: false,
    // NS_FIELD: 'class',
    // NS_SUBLIST: '',
    // NS_SUBFIELD: '',
    // NS_FIELDTYPE: 'select',
    // NS_FIELD_TEMP:custrecord_json_detail_str_data_3
    // }
    // ]
    // }
    // ]
    /**
     * APIでDataBaseに保存するデータを作成（Outputのイメージはoutput_sample参照）
     */
    function makeStoreRecords(inputData, internalId) {
        // caseNoから、オブジェクト化したMasterTableと使用するRecordsを格納した配列を作成する内部関数
        var _makeTableObject = function(masterTableName, caseNo) {
            try {
                var masterTables = tableTypeObj.DataRecordTypes.masterTables;
                var masterTable = masterTables[masterTableName];
                // MasterTableの配列をオブジェクトに変換(tableObjects)＆使用するRecordsを保管する配列も作成（recordsTypes)
                var keys = masterTable.keys;
                var tableObjects = []; // MasterTableをオブジェクトに変換したもの Objects in Array
                var recordsTypes = []; // 使用するRecordsのTypeを保管
                for (var i = 0; i < masterTable.vals.length; i++) {
                    var bufObj = {};
                    var vals = masterTable.vals[i];
                    if (keys.length != vals.length) {
                        return false;
                    }
                    // 配列keysをオブジェクトのキーに、配列valsをオブジェクトの値に設定
                    for (var j = 0; j < keys.length; j++) {
                        bufObj[keys[j]] = vals[j];
                    }
                    recordsTypes.push(bufObj[tableTypeObj.Constant.NS_RECORDS]);
                    tableObjects.push(bufObj);
                }
                // 配列recordsTyepsの重複した要素を削除
                recordsTypes = recordsTypes.filter(function(val, i, self) {
                    return i === self.indexOf(val);
                });
                // 入力するRecordsが複数の場合の処理(配列recordsTypesの第一要素をPrimaryRecordsに設定)
                if (recordsTypes.length > 1) {
                    // primaryRecords（先にレコードを保存する必要があるRecords）の取得
                    var primaryRecords = tableTypeObj.DataRecordTypes.primaryRelations[masterTableName];
                    // PrimaryRecordsのインデックスを取得
                    var primaryIndex = -1;
                    for (var i = 0; i < recordsTypes.length; i++) {
                        if (recordsTypes[i] == primaryRecords) {
                            primaryIndex = i;
                            break;
                        }
                    }
                    // primaryRecordsを最初の要素に設定
                    buf = recordsTypes[0];
                    recordsTypes[0] = recordsTypes[primaryIndex];
                    recordsTypes[primaryIndex] = buf;
                }
                return [tableObjects, recordsTypes];

            } catch (e) {
            	var masterTableName = tableTypeObj.DataRecordTypes.caseTable[caseNo];
            	var masterTables = tableTypeObj.DataRecordTypes.masterTables;
            	var masterTable = masterTables[masterTableName];
            	var errorlog = masterTable.errorlog;
                var errorType = "";
    			var errorName = "";
    			if (errorlog != undefined && errorlog.length > 0) {
    				errorType = errorlog[0];
    				errorName = errorlog[1];
    			}
            	var errorMsg = tableTypeObj.DataRecordTypes.errorLogMapping['E_RLR_004'];
    			log.error("ERROR", "E_RLR_004 " + errorMsg);
            }

        };
        var storeRecords = [];
        var recordsTypesArray = [];
        for (var j = 0; j < inputData.length; j++) { // InpoutDataのレコード毎（Object）に変換
            var caseNo = inputData[j]['caseNo'];
            var foreignId = inputData[j]['foreignId'];
            var subsidiary = inputData[j]['subsidiary'];//連結
            var recordedDate = inputData[j]['recordedDate']; // /
            if (recordedDate && recordedDate.length == 8) {
                var year = recordedDate.slice(0, 4);
                var month = recordedDate.slice(4, 6);
                var day = recordedDate.slice(6, 8);
                recordedDate = year + '/' + month + '/' + day;
            }
            // MasterTableのオブジェクトと使用するRecordsを格納した配列を取得

            // caseNoに相当するMasterTableのデータ（配列）を取得する
            var masterTableName = tableTypeObj.DataRecordTypes.caseTable[caseNo];

            [tableObjects, recordsTypes] = _makeTableObject(masterTableName, caseNo);
            // InputDataの各レコードに対応するオブジェクトの作成
            var oneRecordObject = {};
            for (var i = 0; i < recordsTypes.length; i++) { // RecordType別にまとめる
                var recordsType = recordsTypes[i];
                var bufRecord = [];
                for ( var item in inputData[j]) { // レコード（Object）のKey毎の処理
                    if (inputData[j].hasOwnProperty(item) && item != tableTypeObj.Constant.CASE_ID) {
                        var val = inputData[j][item]; // Keyに対するValueの変数への格納
                        for (var k = 0; k < tableObjects.length; k++) { // JSON_ITEM名とRecordsが同じMasterTableデータを取得
                            var json_item = tableObjects[k][tableTypeObj.Constant.JSON_ITEM].split('|')[0]; //JSONデータのフィールドの名前
                            var key_item = tableObjects[k][tableTypeObj.Constant.JSON_ITEM].split('|')[1]; //当該フィールドがキーとして利用するかフラグ
                            if (json_item == item && tableObjects[k][tableTypeObj.Constant.NS_RECORDS] == recordsType) {
                                // Objectの作成およびレスポンス配列への格納
                                var bufObject = {};
                                if (key_item == tableTypeObj.Constant.KEY_ITEM) {
                                    bufObject.keyFlag = true;
                                } else {
                                    bufObject.keyFlag = false;
                                }
                                bufObject[tableTypeObj.Constant.NS_FIELD] = tableObjects[k][tableTypeObj.Constant.NS_FIELD];
                                bufObject[tableTypeObj.Constant.NS_SUBLIST] = tableObjects[k][tableTypeObj.Constant.NS_SUBLIST];
                                bufObject[tableTypeObj.Constant.NS_SUBFIELD] = tableObjects[k][tableTypeObj.Constant.NS_SUBFIELD];
                                bufObject[tableTypeObj.Constant.NS_FIELDTYPE] = tableObjects[k][tableTypeObj.Constant.NS_FIELDTYPE];
                                bufObject[tableTypeObj.Constant.NS_FIELD_TEMP] = tableObjects[k][tableTypeObj.Constant.NS_FIELD_TEMP];
                                bufObject.val = val;
                                bufRecord.push(bufObject);
                            }
                        }
                    }
                }
                oneRecordObject[recordsType] = bufRecord;
            }
            // 元のInputDataのレコードの情報を取得し、オブジェクトに格納
            oneRecordObject['recordInfo'] = {
                'caseNo' : caseNo,
                'foreignId' : foreignId,
                'subsidiary' : subsidiary,
                'trandate' : recordedDate, // /
                'recordsTypes' : recordsTypes, // / レコードタイプ(複数可)
                'internalId' : internalId
            // 内部ID
            };
            storeRecords.push(oneRecordObject);
        }

        return storeRecords;// JSONの行データ情報の配列
    };
    
    /**
     * KEY_ITEMのFieldに値をセットする内部関数
     * 
     * @param setValues　 値情報
     * @param recordObject　レコード情報
     */
    function _setKeyValue(setValues, recordObject) {
        var Constants = tableTypeObj.Constant;

        for (var j = 0; j < setValues.length; j++) {
            // foreignIdのデータ以外は、ここでは保存しない
            if (setValues[j]['keyFlag'] == false) {
                continue;
            }
            // 値のセット
            var field = setValues[j][Constants.NS_FIELD];
            var fieldTemp = setValues[j][Constants.NS_FIELD_TEMP];
//            var fieldType = setValues[j][Constants.NS_FIELDTYPE].split('|')[0]; // フィールドのタイプ
//            var selectRecord = setValues[j][Constants.NS_FIELDTYPE].split('|')[1]; // 当該フィールドの値を設定するために、検索するレコードタイプ
//            var selectFilter = setValues[j][Constants.NS_FIELDTYPE].split('|')[2]; // 当該フィールドの値を設定するために、検索するレコードタイプのフィルター用フィールド
//            var lookupField  = setValues[j][Constants.NS_FIELDTYPE].split('|')[3]; // 未指定の場合は、内部IDを取得する、指定する場合は、このフィールドを使用する
            var val = setValues[j]['val'];
            if (fieldTemp) {
                recordObject.setValue({
                    fieldId : fieldTemp,
                    value : val
                });
            }
        }
        return recordObject;
    };
    /**
     * ReocrdsのFieldに値をセットする内部関数
     * 
     * @param setValues 値情報
     * @param recordObject　レコード情報
     * @param recordId　内部ID
     * @param newRecordFlag　新規作成か更新かフラグ
     * @param _sublistArray　サブリスト名称配列
     * @param _sublistObject　サブリストのフィールド情報
     * @param recordsType　レコードタイプ
     */ 
    function _setValues(setValues, recordObject, recordId, newRecordFlag, _sublistArray, _sublistObject, recordsType, caseNo) {
        var Constants = tableTypeObj.Constant;
        var field, fieldType, sublist, subfield, val;
        var newline = true;
        for (var j = 0; j < setValues.length; j++) {
            // foreignIdのデータは、ここでは保存しない
            if (setValues[j]['keyFlag'] == true) {
                continue;
            }
            // 各値の変数への格納
            var field = setValues[j][Constants.NS_FIELD];
            var fieldTemp = setValues[j][Constants.NS_FIELD_TEMP];
            var fieldType = setValues[j][Constants.NS_FIELDTYPE].split('|')[0]; // フィールドのタイプ
			var selectRecord = setValues[j][Constants.NS_FIELDTYPE].split('|')[1];// 当該フィールドの値を設定するために、検索するレコードタイプ
			var selectFilter = setValues[j][Constants.NS_FIELDTYPE].split('|')[2];// 当該フィールドの値を設定するために、検索するレコードタイプのフィルター用フィールド
			var lookupField = setValues[j][Constants.NS_FIELDTYPE].split('|')[3]; // 未指定の場合は、内部IDを取得する、指定する場合は、このフィールドを使用する
//            var fieldType = setValues[j][Constants.NS_FIELDTYPE].split('|')[0]; // フィールドのタイプ
//            var selectRecord = setValues[j][Constants.NS_FIELDTYPE].split('|')[1];// 当該フィールドの値を設定するために、検索するレコードタイプ
//            var selectFilter = setValues[j][Constants.NS_FIELDTYPE].split('|')[2];// 当該フィールドの値を設定するために、検索するレコードタイプのフィルター用フィールド
//            var lookupField = setValues[j][Constants.NS_FIELDTYPE].split('|')[3]; // 未指定の場合は、内部IDを取得する、指定する場合は、このフィールドを使用する
            var location;
            sublist = setValues[j][Constants.NS_SUBLIST];
            subfield = setValues[j][Constants.NS_SUBFIELD];
         // / 各条件による値のセット
            if (fieldType == 'select') {
            	if (setValues[j]['val'] == null) {
                    continue;
                };
                val = _searchTextVal(selectRecord, selectFilter, setValues[j]['val'])||setValues[j]['val'];
            } else {
            	val = setValues[j]['val'];
            }
            if (caseNo == "INSERT_SALESORDER") {
            	val = selectData.INSERT_SALESORDER(setValues, setValues[j], Constants, val);
            }else if(caseNo == "INSERT_TRANSFERORDER"){
            	val = selectData.INSERT_TRANSFERORDER(setValues, setValues[j], Constants, val);
            }
			if (val === undefined || val == null || val === '') {
            	continue;
            }

            if (sublist) {
                // sublistに値をセット
                _sublistArray.push(sublist);

                var sublistObj = {
                    recordsType : recordsType,
                    sublist : sublist,
                    field : subfield,
                    fieldTemp : fieldTemp,
                    val : val,
                };
                _sublistObject.push(sublistObj);

            } else {
                // recordオブジェクトのインスタンスに、入力するデータをセット
                if (fieldTemp) {
                    recordObject.setValue({
                        fieldId : fieldTemp,
                        value : val
                    });
                }
            }
        }
        return recordObject;
    };
    
    /**
     * select型の値を取得する内部関数
     * @param selectRecord
     * @param searchFilter
     * @param searchValue
     */
    function _searchTextVal(selectRecord, searchFilter, searchValue) {

        var objSavedSearch = search.create({
            type : selectRecord,

            filters : [[
                        "formulatext: TO_CHAR({" + searchFilter + "})",
                        search.Operator.IS,
                        searchValue
                    ]],

            columns : [{
                name : 'internalId',
            }],
        });
        var resultset = objSavedSearch.run();
        var subset = resultset.getRange({
            start : 0,
            end : 1,
        });
        if (subset && subset.length > 0) {
            return subset[0].getValue({
                name : 'internalId',
            });
        } else {
        	var val = _searchVal(selectRecord, searchFilter, searchValue);
        	if (!(val === undefined || val == null || val === '')) {
        		return val;
        	}
        }

    };
    
    function _searchVal(selectRecord, searchFilter, searchValue) {

        var objSavedSearch = search.create({
            type : selectRecord,

            filters : [[
                        searchFilter,
                        search.Operator.IS,
                        searchValue
                    ]],

            columns : [{
                name : 'internalId',
            }],
        });
        var resultset = objSavedSearch.run();
        var subset = resultset.getRange({
            start : 0,
            end : 1,
        });
        if (subset && subset.length > 0) {
            return subset[0].getValue({
                name : 'internalId',
            });
        };

    };

});
