/**
 * JSONのデータを分析して、テーブル別にデータを保存する
 * 定期スクリプト?A : => トランザク、マスタ
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', './Common_2_Data_Setting', 'N/format', 'N/email', 'N/runtime', 'N/task', '../Common/denis_common', 'N/file'],
function(record, search, tableTypeObj, format, email, runtime, taskUtil, denisCommon, file) {
   const DEFAULT_SUBSIDIARY = 1;
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     * 元のJSONのデータの一行のデータのキーの配列を返す
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	log.audit("INFO", "OCIデータ受信step2開始");

    	var script = runtime.getCurrentScript();
        var paramVal = script.getParameter({
            name : 'custscript_json_parse_mr_step2_first'
        });
        var paramVal2 = script.getParameter({
            name : 'custscript_json_parse_mr_step2_second'
        });
        log.debug("INFO", "paramVal:" + paramVal);
        log.audit("INFO", "paramVal2 : " + paramVal2);
        var internalid = search.createColumn({
            name : 'internalid',
            sort: search.Sort.ASC,
            summary : search.Summary.GROUP,
            label: "内部ID",
        });
        var customrecord_json_detailSearchColJsonid = search.createColumn({
            name : 'custrecord_json_main_id',
            sort: search.Sort.ASC,
            summary : search.Summary.GROUP,
            label: "JSONデータ保存(メイン)の内部ID",
        });
        var customrecord_json_detailSearchColJson = search.createColumn({
            name : 'custrecord_json_detail_main_line_no',
            sort: search.Sort.ASC,
            summary : search.Summary.GROUP,
            label: "JSONデータのヘッダデータの行番号",
        });
        var customrecord_json_detailSearchColCaseNo = search.createColumn({
            name : 'custrecord_json_detail_case_no',
            sort: search.Sort.ASC,
            summary : search.Summary.GROUP,
            label: "Case no",
        });
        var customrecord_json_foreignId = search.createColumn({
            name : 'custrecord_json_detail_foreignid',
            sort: search.Sort.ASC,
            summary : search.Summary.GROUP,
            label: "foreignid",
        });
        var customrecord_json_detailSearch;
        if (paramVal == "TT") {
        	customrecord_json_detailSearch = search.create({
                type : 'customrecord_json_detail',
                filters : [['custrecord_json_detail_preesed_flg', 'is', 'F'], 'AND',
                           ['custrecord_json_detail_first', 'is', 'K'], 'AND',
                           ['custrecord_json_main_id', 'is', paramVal2], ], 
                columns : [internalid, customrecord_json_detailSearchColJsonid, customrecord_json_detailSearchColJson,
                        customrecord_json_detailSearchColCaseNo,customrecord_json_foreignId,],
            });
        } else {
        	customrecord_json_detailSearch = search.create({
                type : 'customrecord_json_detail',
                filters : [['custrecord_json_detail_preesed_flg', 'is', 'F'], , 'AND',
                           ['custrecord_json_main_id', 'is', paramVal2], ], 
                columns : [internalid, customrecord_json_detailSearchColJsonid, customrecord_json_detailSearchColJson,
                        customrecord_json_detailSearchColCaseNo,customrecord_json_foreignId,],
            });
        }
        return customrecord_json_detailSearch;
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     * 
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
        var now = new Date();
        log.audit("INFO", "OCIデータ受信step2Map開始time :" + now);
    	var arrValue = JSON.parse(context.value);
        var Id = arrValue.values["GROUP(internalid)"].value;
        var mainId = arrValue.values["GROUP(custrecord_json_main_id)"].value;
        var mainLineNo = arrValue.values["GROUP(custrecord_json_detail_main_line_no)"];
        var mainCaseNo = arrValue.values["GROUP(custrecord_json_detail_case_no)"];
        var mainRecordType = arrValue.values["GROUP(custrecord_json_detail_record_type)"];
        var foreignId = (arrValue.values["GROUP(custrecord_json_detail_foreignid)"]).toString();
    	var otherId = record.submitFields({
            type: 'customrecord_json_detail',
            id: Id,
            values: {
                'custrecord_json_detail_preesed_flg': 'T',
            },
        });
    	context.write({
            key : mainId + "," + mainCaseNo + "," + foreignId,
            value : context.key
        });
        var now2 = new Date();
   	    log.audit("INFO", "OCIデータ受信step2MaP終了Time :" + now2);
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {
        var now = new Date();
        log.audit("INFO", "OCIデータ受信step2Reduce開始time :" + now);
    	var targetDataArray;
    	var mainRecord;
    	log.debug({
    		title: 'reduce - context',
    		details: JSON.stringify(context)
    	})
    	var arrValue = context.key.split(",");
        var stKey = context.key;
        var mainId = arrValue[0];
        var mainLineNo = 0;
        var mainCaseNo = arrValue[1];
        var mainRecordType = 0;
        var foreignId = arrValue[2];
        try
        {
            //　元のJSONのデータの一行のデータのキーにより、このデータに対するレコードのマッピング情報を取得する
            var oneRecordObject = makeStoreRecords(mainId, mainLineNo, mainCaseNo, foreignId);
            var sublistArray = [];
            var sublistObject = [];
            var removedArray = [];
            if(!oneRecordObject){
                return;
            }
            var field, sublist, subfield, fieldType, val;
            
            var storeRecord = oneRecordObject; // storeRords[i]はJSONの一行のデータに対応
            var recordsTypes = oneRecordObject["recordInfo"]["recordsTypes"];
            var error = "";
            var subsidiary = oneRecordObject["recordInfo"]["subsidiary"];
            // 対象ResultSet
            targetDataArray = oneRecordObject["recordInfo"]["targetDataArray"];
            var lineNos = oneRecordObject["recordInfo"]["lineNos"];
            mainRecord = oneRecordObject["recordInfo"]["mainRecord"];
            var recordsType = recordsTypes[0];
//            if(targetDataArray && targetDataArray.length > 0){
//                for (var j = 0; j < targetDataArray.length; j++) {
//                    var otherId = record.submitFields({
//                        type: 'customrecord_json_detail',
//                        id: targetDataArray[j]["id"],
//                        values: {
//                            'custrecord_json_detail_preesed_flg': 'T',
//                        },
//                    });
//                };
//            };

            var keyRecordId;
            var setValues = storeRecord[lineNos[0]];
            var searchFilter = _createFilter(setValues);
            var searchColumns = [];
            var subset;
            if (searchFilter) {
            	var internalId = search.createColumn({
    		            name : 'internalId'
    		        });
                searchColumns.push(internalId);
                var objSavedSearch = search.create({
                    type : recordsType,
                    filters : searchFilter,
                    columns : searchColumns,
                });
                var resultset = objSavedSearch.run();
                subset = resultset.getRange({
                    start : 0,
                    end : 1,
                });
            }
            sublistArray = [];
            sublistObject = [];
            
            var flgRunProcess = true;
            log.debug({
            	title: 'subset.length',
            	details: (subset && subset.length > 0)
            });
            log.debug({
            	title: 'setValues',
            	details: JSON.stringify(setValues)
            });
            
            var flgDeleteRecord = false;
            
            var arrIsInactive = setValues.filter(function(obj) {
        		if (obj['NS_Field'] == 'isinactive') {
        			return true;
        		} else {
        			return false;
        		}
        	});
            
            if (arrIsInactive != null && arrIsInactive != '' && arrIsInactive.length > 0) {
            	if (arrIsInactive[0]['val'] == '1') {
            		flgRunProcess = false;
            		
            		if (subset && subset.length > 0) {
            			record.delete({
            				type: recordsType,
            				id: subset[0]["id"]
            			});
            		}
            	}
            }
            
        	if (flgRunProcess) {
        		// レコードが存在する場合の処理
                if (subset && subset.length > 0) {
                	
                    var recordObject = record.load({
                        type : recordsType,
                        id : subset[0]["id"],
                        isDynamic : true,
                    });
                    if (!keyRecordId) {
                        keyRecordId = recordObject["id"];
                    }
                    
                    // TODO
                    recordObject = _setValues(storeRecord, recordObject, keyRecordId, false, sublistArray, sublistObject, recordsType, lineNos, mainCaseNo);
                    
                    // sublist処理
                    if (sublistArray && sublistArray.length > 0) {
                        // 重複排除
                        var sublistArr = sublistArray.filter(function(x, i, self) {
                            return self.indexOf(x) === i;
                        });
                        
                        log.debug({
                        	title: 'sublistObject',
                        	details: JSON.stringify(sublistObject)
                        });
                        
                        for (var sub = 0; sub < sublistObject.length; sub++) {
    					    var sublistObjects = sublistObject[sub];
    					    
    						for (var arr = 0; arr < sublistArr.length; arr++) {
    							if (sub == 0) {
    								var itemCount = recordObject.getLineCount({
    			                        sublistId : sublistArr[arr]
    			                    });

    			                    if (itemCount > 0) {
    			                        for (var line = itemCount; line > 0; line--) {
    			                            recordObject.removeLine({
    			                                                  sublistId : sublistArr[arr],
    			                                                  line : line - 1
    			                                              });
    			                        }
    			                    }
    							}
    							
    							
    							var lineNum = recordObject.selectNewLine({
    								sublistId : sublistArr[arr],
    							});
    							
    							// sublistObjectをループ
    							for (var obj = 0; obj < sublistObjects.length; obj++) {
    								// 当該サブリストのフィールドのみ、値を設定する
    								if (sublistObjects[obj]['sublist'] == sublistArr[arr]) {
    									if (sublistObjects[obj]['field'] == null || sublistObjects[obj]['field'] == '') {
    										continue;
    									}
    									recordObject.setCurrentSublistValue({
    										sublistId : sublistArr[arr],
    										fieldId : sublistObjects[obj]['field'],
    										value : sublistObjects[obj]['val'],
    										ignoreFieldChange : false,
    									});
    								};
    							}
    							// Subrecordの処理
    							if ('addressbook' == sublistArr[arr]) {
    								var subrecord = recordObject.getCurrentSublistSubrecord({
    									sublistId : 'addressbook',
    									fieldId : 'addressbookaddress',
    								});
    								for (var obj = 0; obj < sublistObjects.length; obj++) {
    									// 当該サブリストのフィールドのみ、値を設定する
    									if (sublistObjects[obj]['sublist'] == sublistArr[arr]) {
    										subrecord.setValue({
    											fieldId : sublistObjects[obj]['field'],
    											value : sublistObjects[obj]['val'],
    										});
    									};
    								};
    							}

    							recordObject.commitLine({
    								sublistId : sublistArr[arr],
    							});
    						};
    					};
                    };

                    // レコードが存在しない場合の処理
                } else {
                    var recordObject = record.create({
                        type : recordsType,
                        isDynamic : true,
                    });
                    // keyField(entityId)の値をrecordObjectにセット
                    
                    // keyField以外のデータをrecordObjectにセット(一つ目のTypeRecordsの場合3番目の引数はundefined)
                    recordObject = _setValues(storeRecord, recordObject, keyRecordId, true, sublistArray, sublistObject, recordsType, lineNos, mainCaseNo);

                    // sublist処理
                    if (sublistArray) {
                        // 重複排除
                        var sublistArr = sublistArray.filter(function(x, i, self) {
                            return self.indexOf(x) === i;
                        });
                        
                        log.debug({
                        	title: 'sublistObject',
                        	details: JSON.stringify(sublistObject)
                        });
                        
                        // sublistArrをループ
    					for (var sub = 0; sub < sublistObject.length; sub++) {
    					    var sublistObjects = sublistObject[sub];
    						for (var arr = 0; arr < sublistArr.length; arr++) {
    							var lineNum = recordObject.selectNewLine({
    								sublistId : sublistArr[arr],
    							});
    							// sublistObjectをループ
    							for (var obj = 0; obj < sublistObjects.length; obj++) {
    								// 当該サブリストのフィールドのみ、値を設定する
    								if (sublistObjects[obj]['sublist'] == sublistArr[arr]) {
    									if (sublistObjects[obj]['field'] == null || sublistObjects[obj]['field'] == '') {
    										continue;
    									}
    									recordObject.setCurrentSublistValue({
    										sublistId : sublistArr[arr],
    										fieldId : sublistObjects[obj]['field'],
    										value : sublistObjects[obj]['val'],
    										ignoreFieldChange : false,
    									});
    								};
    							}
    							// Subrecordの処理
    							if ('addressbook' == sublistArr[arr]) {
    								var subrecord = recordObject.getCurrentSublistSubrecord({
    									sublistId : 'addressbook',
    									fieldId : 'addressbookaddress',
    								});
    								for (var obj = 0; obj < sublistObjects.length; obj++) {
    									// 当該サブリストのフィールドのみ、値を設定する
    									if (sublistObjects[obj]['sublist'] == sublistArr[arr]) {
    										subrecord.setValue({
    											fieldId : sublistObjects[obj]['field'],
    											value : sublistObjects[obj]['val'],
    										});
    									};
    								};
    							}

    							recordObject.commitLine({
    								sublistId : sublistArr[arr],
    							});
    						};
    					};
                    };
                }
                sublistObject = [];
                //連結
                //if (subsidiary) {
                    //recordObject.setValue({
                        //fieldId : 'subsidiary',
                        //value : subsidiary,
                    //});
                //} else {
                    //recordObject.setValue({
                        //fieldId : 'subsidiary',
                       // value : DEFAULT_SUBSIDIARY,
                    //});
                //}
                // recordObject.setFieldValue('custbody_paas_case_no', storeRecord.recordInfo.caseNo);
                // recordObject.setFieldValue('custbody_paas_case_type', caseTable[storeRecord.recordInfo.caseNo]);
                // recordObject.setFieldValue('custentity_paas_case_no', storeRecord.recordInfo.caseNo);
                // recordObject.setFieldValue('custrecord_paas_case_no_class', storeRecord.recordInfo.caseNo);
                // recordObject.setFieldValue('custrecord_paas_case_no_dept', storeRecord.recordInfo.caseNo);
                // recordObject.setFieldValue('custbody_if_json_record', dataJSON_id); ///JSON record ID
                // Fix location/caseNo error END
                // 一つ目のTypeRecords(Primary)で新規の場合、 keyRecordIdがundefiled
                
                
                
                
                
                var arrSublistIds = sublistArray.filter(function(x, i, self) {
                    return self.indexOf(x) === i;
                });
                
                var flgDeleteRecord = true;
                for (var i = 0; i < arrSublistIds.length; i++) {
                	var tmpSublistLineCount = recordObject.getLineCount({sublistId: arrSublistIds[i]});
                	if (tmpSublistLineCount != 0) {
                		flgDeleteRecord = false;
                	}
                }
                
                log.debug({
                	title: 'subset',
                	details: JSON.stringify(subset)
                });
                
                if (subset != null && subset != '' && subset.length > 0) {
                	if (flgDeleteRecord) {
                		if (subset[0]["id"] != null && subset[0]["id"] != '') {
                			record.delete({
                				type: recordsType,
                				id: subset[0]["id"]
                			});
                    	}
                	}
                }
                
                if (!flgDeleteRecord) {
                	insertInventorydetail(mainCaseNo,foreignId,mainId,recordObject);	
                }
                
                var recordInternalId = 0;
                var now3 = new Date();
                log.audit("INFO", "OCIデータ受信step2Reduce保存開始time :" + now3);
                
                if (!flgDeleteRecord) {
                	if (!keyRecordId) {
                        keyRecordId = recordObject.save({
                            enableSourcing : false,
                            ignoreMandatoryFields : true
                        });
                        recordInternalId = keyRecordId;
                        // 二つ目以降のTypeRecordsの場合、keyRecordId != undefined
                    } else {
                        recordInternalId = recordObject.save({
                            enableSourcing : false,
                            ignoreMandatoryFields : true
                        });
                    };	
                }
        	}
            
            var now4 = new Date();
            log.audit("INFO", "OCIデータ受信step2Reduce保存完了time :" + now4);
//            if (mainCaseNo == 'INSERT_SALESORDER' || mainCaseNo == 'INSERT_TRANSFERORDER') {
//            	var param3 = mainCaseNo + "-" + foreignId + "-" + mainId + "-" + recordInternalId + "-" + mainRecord;
//                context.write({ //OK　件数合計用　成功実行すれば、OKグループに追加
//                   key : param3,
//                   value : "1"
//                });
//            }
            
            //reduce用キー
//            context.write({ //OK　件数合計用　成功実行すれば、OKグループに追加
//                key : "OK",
//                value : "1"
//            });
        }
        catch(e)
        {
            //reduce用キー
//            context.write({ //OK　件数合計用　成功実行すれば、OKグループに追加
//                key : "NG",
//                value : "1"
//            });
//            context.write({
//                key : mainId + "-" + mainRecord,
//                value : "1"
//            });
        	if(targetDataArray && targetDataArray.length > 0){
                for (var j = 0; j < targetDataArray.length; j++) {
                    var otherId = record.submitFields({
                        type: 'customrecord_json_detail',
                        id: targetDataArray[j]["id"],
                        values: {
                            'custrecord_json_detail_errormsg': 'error',
                        },
                    });
                };
            };
        	var masterTableName = tableTypeObj.DataRecordTypes.caseTable[mainCaseNo];
        	var masterTables = tableTypeObj.DataRecordTypes.masterTables;
            var masterTable = masterTables[masterTableName];
            var errorlog = masterTable.errorlog;
            var errorType = "";
			var errorName = "";
			if (errorlog != undefined && errorlog.length > 0) {
				errorType = errorlog[0];
				errorName = errorlog[1];
			}
			var errorMsg = tableTypeObj.DataRecordTypes.errorLogMapping['E_RLR_006'];
			errorMsg = errorMsg.replace('{param1}', mainId);
			log.error("ERROR", "E_RLR_006 " + errorMsg +": " + e.message);
			
			var searchFilters = [];
            searchFilters.push(['custrecord_djkk_exsystem_error_name','is',mainId]);
            var searchColumns = [];
            var internalid = search.createColumn({
                		            name : 'internalid'
                		        });
            searchColumns.push(internalid);
            var entityid = search.createColumn({
                		            name : 'custrecord_djkk_exsystem_error_orderno'
                		        });
            searchColumns.push(entityid);
            var searchResults = getTableInfo('customrecord_djkk_exsystem_error_orderno',searchFilters,searchColumns);
            if (searchResults.length > 0) {
            	var errorcode = searchResults[0].getValue('custrecord_djkk_exsystem_error_orderno');
            	errorcode = errorcode + ",&" + mainRecord + "&";
            	record.submitFields({
                    type: 'customrecord_djkk_exsystem_error_orderno',
                    id: searchResults[0].getValue('internalid'),
                    values: {
                        'custrecord_djkk_exsystem_error_orderno': errorcode,
                    },
                });
            } else {
            	var errorcode = "&" + mainRecord + "&";
            	denisCommon.writeLog(null, mainId, errorcode);
            }
        }
        var now2 = new Date();
   	    log.audit("INFO", "OCIデータ受信step2Reduce終了Time :" + now2);
    }
    function insertInventorydetail(caseNo,foreignId,mainId,recordObject) {
    	log.debug({title: 'caseNo', details: JSON.stringify(caseNo)});
    	log.debug({title: 'foreignId', details: JSON.stringify(foreignId)});
    	log.debug({title: 'mainId', details: JSON.stringify(mainId)});
    	var now = new Date();
        log.audit("INFO", "OCIデータ受信step2在庫詳細開始time :" + now);
//    	var caseNo = data.caseNo;
//        var foreignId = data.foreignId;
//        var mainId = data.mainId;
//        var recordId = data.recordId;
        //var mainRecord = data.mainRecord;
        var recordsTypes = "";
    	var jsonRecordmain = record.load({
            type : 'customrecord_json_main',
            id : mainId,
        });
    	var jsonRecord = record.load({
            type : 'customrecord_json_main',
            id : jsonRecordmain.getValue({fieldId: 'custrecord_json_main_joinid'})
        });
    	var strJson = jsonRecord.getValue({fieldId: 'custrecord_json_main_record'});
    	var jsonDataObj = JSON.parse(strJson);
    	var lines = jsonDataObj.record_data[foreignId].recordLine;
    	var masterTableName = tableTypeObj.DataRecordTypes.caseTable[caseNo];
    	var masterTables = tableTypeObj.DataRecordTypes.masterTableSub;
    	var masterTable = masterTables[masterTableName];
    	var keys = masterTable.keys;
		var tableObjects = [];
        var recordsSubTypes = "";
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
            if (i == 0) {
            	recordsTypes = bufObj[tableTypeObj.Constant.NS_RECORDS];
                recordsSubTypes = bufObj[tableTypeObj.Constant.NS_SUBLIST];
            }
            tableObjects.push(bufObj);
        }
        var subName = recordsSubTypes.split(".")[0];
        var subSubName = recordsSubTypes.split(".")[1];
        var subSubSubName = recordsSubTypes.split(".")[2];
//        var recordObject = record.load({
//            type : recordsTypes,
//            id : recordId,
//            isDynamic : true
//        });
        var num = 0;
        for (var arr = 0; arr < lines.length; arr++) {
        	var zkLines = lines[arr].zk;
        	if (!(zkLines && zkLines.length > 0)) {
        		num++;
        		continue;
        	}
        	if (lines[arr]['misi_deleteflg'] == '1') {
        		continue;
        	}
        	if (lines[arr].item_deleteflg == "T") {
        		continue;
        	}
        	recordObject.selectLine({
                sublistId : subName,
                line : num,
            });
        	var subrecord = recordObject.getCurrentSublistSubrecord({
                sublistId : subName,
                fieldId : subSubName,
            });
        	
        	var subRecordLineCount = subrecord.getLineCount({sublistId: subSubSubName});
        	
        	for (var i = subRecordLineCount - 1; i >= 0; i--) {
        		subrecord.removeLine({sublistId: subSubSubName, line: i});
        	}
        	
        	for (var zkArr = 0; zkArr < zkLines.length; zkArr++) {
        		var zkLine = zkLines[zkArr];
        		if (zkLine.zk_deleteflg == "T") {
        			continue;
        		}
        		subrecord.selectNewLine({
					sublistId : subSubSubName,
				});
        		for (var vals = 0; vals < tableObjects.length; vals++) {
        			var tableObject = tableObjects[vals];
        			var jsonItem = tableObject[tableTypeObj.Constant.JSON_ITEM];
        			var subField = tableObject[tableTypeObj.Constant.NS_SUBFIELD];
        			var fieldType = tableObject[tableTypeObj.Constant.NS_FIELDTYPE];
        			
        			
        			if (zkLine[jsonItem] === undefined || zkLine[jsonItem] == null || zkLine[jsonItem] === '') {
            			continue;
            		}
        			var val;
        			if (fieldType == 'date') { // date
    					strval = zkLine[jsonItem];
    					if (strval === undefined || strval == null || strval === '') {
    	                	continue;
    	                }
    	                else {
    	                	strval = strval.replace(new RegExp('-',"gm"),'/');
    	                	var now = new Date(strval);
    	                    var offSet = now.getTimezoneOffset();
    	                    var offsetHours = 9 + (offSet / 60);
    	                    now.setHours(now.getHours() - offsetHours);
    	                	val = format.parse({
    	                	                value : now,
    	                	                type : format.Type.DATETIME,
    	                	            });
    	                };
    				} else if (fieldType == 'dateymd') { // date
    					strval = zkLine[jsonItem];
    					if (strval === undefined || strval == null || strval === '') {
    	                	continue;
    	                }
    	                else {
    	                	strval = strval.replace(new RegExp('-',"gm"),'/');
    	                	strval = strval.substring(0, 10);
    	                	val = format.parse({
    	                	                value : new Date(strval),
    	                	                type : format.Type.DATETIME,
    	                	            });
    	                };
    				}else if (fieldType == 'datechar') { // date
                		var strvalold = zkLine[jsonItem];
                		if (strvalold === undefined || strvalold == null || strvalold === '') {
                    		continue;
                		}
                		strval = strvalold.substring(0, 4) + "/" + strvalold.substring(4, 6) + "/" + strvalold.substring(6, 8);
                		val = format.parse({
                             value : new Date(strval),
                             type : format.Type.DATETIME,
                         });
              		} else {
    					val = zkLine[jsonItem];
    				}
        			if (val === undefined || val == null || val === '') {
    	            	continue;
    	            }
                    if (fieldType == 'special') {
                      subrecord.setCurrentSublistText({
        				sublistId : subSubSubName,
                        fieldId : subField,
//                        line : zkArr,
                        text : val,
                      });
                    } else {

            			log.debug({
            				title: 'subSubSubName',
            				details: subSubSubName
            			});
            			
            			log.debug({
            				title: 'subField',
            				details: subField
            			});
            			log.debug({
            				title: 'zkArr',
            				details: zkArr
            			});
            			log.debug({
            				title: 'val',
            				details: JSON.stringify(val)
            			});
                    	
                      subrecord.setCurrentSublistValue({
        				sublistId : subSubSubName,
                        fieldId : subField,
//                        line : zkArr,
                        value : val,
                      });
                    }
        		}
        		
        		subrecord.commitLine({
                    sublistId : subSubSubName,
                });
        	}
        	recordObject.commitLine({
                sublistId : subName,
            });
        	num++;
        	var now2 = new Date();
       	    log.audit("INFO", "OCIデータ受信step2在庫詳細終了Time :" + now2);
        }
        
//        recordObject.save({
//            enableSourcing : false,
//            ignoreMandatoryFields : true
//        });
    
    }

    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
//    	var str = "";
//        var a = [];
//    	summary.output.iterator().each(function(key, value) {
//    		 a.push(key);
//    	     return true;
//    	});
//		try {
//			if (a.length > 0) {
//	            var errorRecord = "";
//	            for (var m = 0; m < a.length; m++) {
//	                if (a[m].split('-').length == 2) {
//	                	var searchFilters = [];
//	                    searchFilters.push(['custrecord_djkk_exsystem_error_name','is',a[m].split('-')[0]]);
//	                    var searchColumns = [];
//	                    var internalid = search.createColumn({
//	                        		            name : 'internalid'
//	                        		        });
//	                    searchColumns.push(internalid);
//	                    var entityid = search.createColumn({
//	                        		            name : 'custrecord_djkk_exsystem_error_orderno'
//	                        		        });
//	                    searchColumns.push(entityid);
//	                    var searchResults = getTableInfo('customrecord_djkk_exsystem_error_orderno',searchFilters,searchColumns);
//	                    if (searchResults.length > 0) {
//	                    	var errorcode = searchResults[0].getValue('custrecord_djkk_exsystem_error_orderno');
//	                    	errorcode = errorcode + ",&" + a[m].split('-')[1] + "&";
//	                    	record.submitFields({
//	                            type: 'customrecord_djkk_exsystem_error_orderno',
//	                            id: searchResults[0].getValue('internalid'),
//	                            values: {
//	                                'custrecord_djkk_exsystem_error_orderno': errorcode,
//	                            },
//	                        });
//	                    } else {
//	                    	var errorcode = "&" + a[m].split('-')[1] + "&";
//	                    	denisCommon.writeLog(null, a[m].split('-')[0], errorcode);
//	                    }
//	                } else {
//	                    str = str + a[m] + ",";
//	                }
//	            }
//	            if (str != "") {
//	            	str = str.substring(0, str.length - 1);
//	            	var params = {'custscript_step3_param' : str,};
//	                var scriptTask = taskUtil.create({
//	                    taskType : taskUtil.TaskType.MAP_REDUCE,
//	                });
//	                scriptTask.scriptId = 'customscript_djkk_ss_updsubr';
//	                scriptTask.params = params;
//	                var scriptTaskId = scriptTask.submit();
//	            }
//			}
//        }
//		catch(e)
//		{
//			log.error("ERROR", "E_RLR_006 " + e.message);
//		}
   	    log.audit("INFO", "OCIデータ受信step2終了");
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
    function sendMailFromNS(datanum, subjectdata, data) {
        var userId = -5;// runtime.getCurrentUser();

        var toAddressArr = 'kailong.jiang@evangsol.co.jp';
        var parameterSubject = subjectdata;
        var parameterTxtarea = "エラー件数:" + datanum + "\r\n" + "エラー内容:\r\n";
        for (var i = 0; i < data.length; i++) {
        	parameterTxtarea = parameterTxtarea + data[i];
        	if (i != data.length -1) {
        		parameterTxtarea = parameterTxtarea + "\r\n";
        	}
        }
        var ccAddressArr = '';
        var mailBccArray = '';
        var attachments = null;

        log.debug({
            title : 'DEBUG',
            details : 'send mail start'
        });
        email.send({
            author : userId,
            recipients : toAddressArr,
            subject : parameterSubject,
            body : parameterTxtarea,
        });
        log.debug({
            title : 'DEBUG',
            details : 'send mail end'
        });
    };

// // 関数makeStoreRecordsで作成するstoreRecordsのサンプル
//  var sample_storeRecords = [
//      {
//          'classification': [
//              {
//                  keyFlag:      true,
//                  NS_FIELD:     'externalid',
//                  NS_SUBLIST:   '',
//                  NS_SUBFIELD:  '',
//                  NS_FIELDTYPE: 'text',
//                  vals:         'T430080',
//                  NS_FIELD_TEMP:custrecord_json_detail_str_data_1
//              }, {
//                  keyFlag:      false,
//                  NS_FIELD:     'item',
//                  NS_SUBLIST:   '',
//                  NS_SUBFIELD:  '',
//                  NS_FIELDTYPE: 'select',
//                  vals:         'T430080',
//                  NS_FIELD_TEMP:custrecord_json_detail_str_data_2
//              }
//          ],
//          'inventoryitem': [
//              {
//                  keyFlag:      true,
//                  NS_FIELD:     'externalid',
//                  NS_SUBLIST:   '',
//                  NS_SUBFIELD:  '',
//                  NS_FIELDTYPE: 'text',
//                  vals:         'T430080',
//                  NS_FIELD_TEMP:custrecord_json_detail_str_data_1
//              },{
//                  keyFlag:      false,
//                  NS_FIELD:     'item',
//                  NS_SUBLIST:   '',
//                  NS_SUBFIELD:  '',
//                  NS_FIELDTYPE: 'select',
//                  vals:         'T430080',
//                  NS_FIELD_TEMP:custrecord_json_detail_str_data_2
//              },{
//                  keyFlag:      false,
//                  NS_FIELD:     'class',
//                  NS_SUBLIST:   '',
//                  NS_SUBFIELD:  '',
//                  NS_FIELDTYPE: 'select',
//                  vals:         'T430080',
//                  NS_FIELD_TEMP:custrecord_json_detail_str_data_3
//              }
//          ]
//      }
//  ]
//
//  // 関数makeStoreRecordsの内部関数_makeTableObject が返すtableObjectsのサンプル
//  var sample_tableObjects = [
//{
//  'classification': [
//      {
//          keyFlag:      true,
//          NS_FIELD:     'externalid',
//          NS_SUBLIST:   '',
//          NS_SUBFIELD:  '',
//          NS_FIELDTYPE: 'text',
//          NS_FIELD_TEMP:custrecord_json_detail_str_data_1
//      }, {
//          keyFlag:      false,
//          NS_FIELD:     'item',
//          NS_SUBLIST:   '',
//          NS_SUBFIELD:  '',
//          NS_FIELDTYPE: 'select',
//          NS_FIELD_TEMP:custrecord_json_detail_str_data_2
//      },{
//          keyFlag:      true,
//          NS_FIELD:     'externalid',
//          NS_SUBLIST:   '',
//          NS_SUBFIELD:  '',
//          NS_FIELDTYPE: 'text',
//          NS_FIELD_TEMP:custrecord_json_detail_str_data_1
//      },{
//          keyFlag:      false,
//          NS_FIELD:     'item',
//          NS_SUBLIST:   '',
//          NS_SUBFIELD:  '',
//          NS_FIELDTYPE: 'select',
//          NS_FIELD_TEMP:custrecord_json_detail_str_data_2
//      },{
//          keyFlag:      false,
//          NS_FIELD:     'class',
//          NS_SUBLIST:   '',
//          NS_SUBFIELD:  '',
//          NS_FIELDTYPE: 'select',
//          NS_FIELD_TEMP:custrecord_json_detail_str_data_3
//      }
//  ]
//}
//  ]
    /**
     * マップに対象データを取得する
     * 元のJSONのデータの一行のデータのキーにより、このデータを取得する
     * @param jsonMainId
     * @param mainLineNo
     * @param caseNo
     * @returns {Array}
     */
    function getData(jsonMainId, strforeignId, caseNo) {
        const customrecord_json_detailSearchColid = search.createColumn({
            name : 'custrecord_json_detail_main_line_no',
            sort : search.Sort.ASC
        });
        
        const customrecord_json_detailSearchColJsonid = search.createColumn({
            name : 'custrecord_json_main_id'
        });
        const customrecord_json_detailSearchColCaseNo = search.createColumn({
            name : 'custrecord_json_detail_case_no'
        });
        const customrecord_json_detailSearchColForeignid = search.createColumn({
            name : 'custrecord_json_detail_foreignid'
        });// foreignId
        const customrecord_json_detailSearchColSubsidiary = search.createColumn({
            name : 'custrecord_json_detail_subsidiary'
        });// 連結
        const customrecord_json_detailSearchColRecordeddate = search.createColumn({
            name : 'custrecord_json_detail_recordeddate'
        });// 日付

        const customrecord_json_detailSearchColXCT6RIK5 = search.createColumn({
            name : 'custrecord_json_detail_record_type'
        });
        const customrecord_json_detailSearchColCustrecordJsonDetailDetailLineNo = search.createColumn({
            name : 'custrecord_json_detail_detail_line_no'
        });
        const customrecord_json_detailSearchColXA7FH9A3 = search.createColumn({
            name : 'custrecord_json_detail_record_sublist'
        });
        const customrecord_json_detailSearchColX5C8E03M = search.createColumn({
            name : 'custrecord_json_detail_preesed_flg'
        });
        const customrecord_json_detailSearchColXRNQUOB6 = search.createColumn({
            name : 'custrecord_json_detail_str_data_01'
        });
        const customrecord_json_detailSearchColX6YYMPPF = search.createColumn({
            name : 'custrecord_json_detail_str_data_02'
        });
        const customrecord_json_detailSearchColXS14V9PN = search.createColumn({
            name : 'custrecord_json_detail_str_data_03'
        });
        const customrecord_json_detailSearchColXMRV8ZOF = search.createColumn({
            name : 'custrecord_json_detail_str_data_04'
        });
        const customrecord_json_detailSearchColX9GBHI94 = search.createColumn({
            name : 'custrecord_json_detail_str_data_05'
        });
        const customrecord_json_detailSearchColX9GBHI_6 = search.createColumn({
            name : 'custrecord_json_detail_str_data_06'
        });
        const customrecord_json_detailSearchColX9GBHI_7 = search.createColumn({
            name : 'custrecord_json_detail_str_data_07'
        });
        const customrecord_json_detailSearchColX9GBHI_8 = search.createColumn({
            name : 'custrecord_json_detail_str_data_08'
        });
        const customrecord_json_detailSearchColX9GBHI_9 = search.createColumn({
            name : 'custrecord_json_detail_str_data_09'
        });
        const customrecord_json_detailSearchColX9GBHI_10 = search.createColumn({
            name : 'custrecord_json_detail_str_data_10'
        });
        const customrecord_json_detailSearchColX9GBHI_11 = search.createColumn({
            name : 'custrecord_json_detail_str_data_11'
        });
        const customrecord_json_detailSearchColX9GBHI_12 = search.createColumn({
            name : 'custrecord_json_detail_str_data_12'
        });
        const customrecord_json_detailSearchColX9GBHI_13 = search.createColumn({
            name : 'custrecord_json_detail_str_data_13'
        });
        const customrecord_json_detailSearchColX9GBHI_14 = search.createColumn({
            name : 'custrecord_json_detail_str_data_14'
        });
        const customrecord_json_detailSearchColX9GBHI_15 = search.createColumn({
            name : 'custrecord_json_detail_str_data_15'
        });
        const customrecord_json_detailSearchColX9GBHI_16 = search.createColumn({
            name : 'custrecord_json_detail_str_data_16'
        });
        const customrecord_json_detailSearchColX9GBHI_17 = search.createColumn({
            name : 'custrecord_json_detail_str_data_17'
        });
        const customrecord_json_detailSearchColX9GBHI_18 = search.createColumn({
            name : 'custrecord_json_detail_str_data_18'
        });
        const customrecord_json_detailSearchColX9GBHI_19 = search.createColumn({
            name : 'custrecord_json_detail_str_data_19'
        });
        const customrecord_json_detailSearchColX9GBHI_20 = search.createColumn({
            name : 'custrecord_json_detail_str_data_20'
        });
        const customrecord_json_detailSearchColX9GBHI_21 = search.createColumn({
            name : 'custrecord_json_detail_str_data_21'
        });
        const customrecord_json_detailSearchColX9GBHI_22 = search.createColumn({
            name : 'custrecord_json_detail_str_data_22'
        });
        const customrecord_json_detailSearchColX9GBHI_23 = search.createColumn({
            name : 'custrecord_json_detail_str_data_23'
        });
        const customrecord_json_detailSearchColX9GBHI_24 = search.createColumn({
            name : 'custrecord_json_detail_str_data_24'
        });
        const customrecord_json_detailSearchColX9GBHI_25 = search.createColumn({
            name : 'custrecord_json_detail_str_data_25'
        });
        const customrecord_json_detailSearchColX9GBHI_26 = search.createColumn({
            name : 'custrecord_json_detail_str_data_26'
        });
        const customrecord_json_detailSearchColX9GBHI_27 = search.createColumn({
            name : 'custrecord_json_detail_str_data_27'
        });
        const customrecord_json_detailSearchColX9GBHI_28 = search.createColumn({
            name : 'custrecord_json_detail_str_data_28'
        });
        const customrecord_json_detailSearchColX9GBHI_29 = search.createColumn({
            name : 'custrecord_json_detail_str_data_29'
        });
        const customrecord_json_detailSearchColX9GBHI_30 = search.createColumn({
            name : 'custrecord_json_detail_str_data_30'
        });
        const customrecord_json_detailSearchColX9GBHI_31 = search.createColumn({
            name : 'custrecord_json_detail_str_data_31'
        });
        const customrecord_json_detailSearchColX9GBHI_32 = search.createColumn({
            name : 'custrecord_json_detail_str_data_32'
        });
        const customrecord_json_detailSearchColX9GBHI_33 = search.createColumn({
            name : 'custrecord_json_detail_str_data_33'
        });
        const customrecord_json_detailSearchColX9GBHI_34 = search.createColumn({
            name : 'custrecord_json_detail_str_data_34'
        });
        const customrecord_json_detailSearchColX9GBHI_35 = search.createColumn({
            name : 'custrecord_json_detail_str_data_35'
        });
        const customrecord_json_detailSearchColX9GBHI_36 = search.createColumn({
            name : 'custrecord_json_detail_str_data_36'
        });
        const customrecord_json_detailSearchColX9GBHI_37 = search.createColumn({
            name : 'custrecord_json_detail_str_data_37'
        });
        const customrecord_json_detailSearchColX9GBHI_38 = search.createColumn({
            name : 'custrecord_json_detail_str_data_38'
        });
        const customrecord_json_detailSearchColX9GBHI_39 = search.createColumn({
            name : 'custrecord_json_detail_str_data_39'
        });
        const customrecord_json_detailSearchColX9GBHI_40 = search.createColumn({
            name : 'custrecord_json_detail_str_data_40'
        });
        const customrecord_json_detailSearchColX9GBHI_41 = search.createColumn({
            name : 'custrecord_json_detail_str_data_41'
        });
        const customrecord_json_detailSearchColX9GBHI_42 = search.createColumn({
            name : 'custrecord_json_detail_str_data_42'
        });
        const customrecord_json_detailSearchColX9GBHI_43 = search.createColumn({
            name : 'custrecord_json_detail_str_data_43'
        });
        const customrecord_json_detailSearchColX9GBHI_44 = search.createColumn({
            name : 'custrecord_json_detail_str_data_44'
        });
        const customrecord_json_detailSearchColX9GBHI_45 = search.createColumn({
            name : 'custrecord_json_detail_str_data_45'
        });
        const customrecord_json_detailSearchColX9GBHI_46 = search.createColumn({
            name : 'custrecord_json_detail_str_data_46'
        });
        const customrecord_json_detailSearchColX9GBHI_47 = search.createColumn({
            name : 'custrecord_json_detail_str_data_47'
        });
        const customrecord_json_detailSearchColX9GBHI_48 = search.createColumn({
            name : 'custrecord_json_detail_str_data_48'
        });
        const customrecord_json_detailSearchColX9GBHI_49 = search.createColumn({
            name : 'custrecord_json_detail_str_data_49'
        });
        const customrecord_json_detailSearchColX9GBHI_50 = search.createColumn({
            name : 'custrecord_json_detail_str_data_50'
        });
        const customrecord_json_detailSearchColX9GBHI_51 = search.createColumn({
            name : 'custrecord_json_detail_str_data_51'
        });
        const customrecord_json_detailSearchColX9GBHI_52 = search.createColumn({
            name : 'custrecord_json_detail_str_data_52'
        });
        const customrecord_json_detailSearchColX9GBHI_53 = search.createColumn({
            name : 'custrecord_json_detail_str_data_53'
        });
        const customrecord_json_detailSearchColX9GBHI_54 = search.createColumn({
            name : 'custrecord_json_detail_str_data_54'
        });
        const customrecord_json_detailSearchColX9GBHI_55 = search.createColumn({
            name : 'custrecord_json_detail_str_data_55'
        });
        const customrecord_json_detailSearchColX9GBHI_56 = search.createColumn({
            name : 'custrecord_json_detail_str_data_56'
        });
        const customrecord_json_detailSearchColX9GBHI_57 = search.createColumn({
            name : 'custrecord_json_detail_str_data_57'
        });
        const customrecord_json_detailSearchColX9GBHI_58 = search.createColumn({
            name : 'custrecord_json_detail_str_data_58'
        });
        const customrecord_json_detailSearchColX9GBHI_59 = search.createColumn({
            name : 'custrecord_json_detail_str_data_59'
        });
        const customrecord_json_detailSearchColX9GBHI_60 = search.createColumn({
            name : 'custrecord_json_detail_str_data_60'
        });
        const customrecord_json_detailSearchColX9GBHI_61 = search.createColumn({
            name : 'custrecord_json_detail_str_data_61'
        });
        const customrecord_json_detailSearchColX9GBHI_62 = search.createColumn({
            name : 'custrecord_json_detail_str_data_62'
        });
        const customrecord_json_detailSearchColX9GBHI_63 = search.createColumn({
            name : 'custrecord_json_detail_str_data_63'
        });
        const customrecord_json_detailSearchColX9GBHI_64 = search.createColumn({
            name : 'custrecord_json_detail_str_data_64'
        });
        const customrecord_json_detailSearchColX9GBHI_65 = search.createColumn({
            name : 'custrecord_json_detail_str_data_65'
        });
        const customrecord_json_detailSearchColX9GBHI_66 = search.createColumn({
            name : 'custrecord_json_detail_str_data_66'
        });
        const customrecord_json_detailSearchColX9GBHI_67 = search.createColumn({
            name : 'custrecord_json_detail_str_data_67'
        });
        const customrecord_json_detailSearchColX9GBHI_68 = search.createColumn({
            name : 'custrecord_json_detail_str_data_68'
        });
        const customrecord_json_detailSearchColX9GBHI_69 = search.createColumn({
            name : 'custrecord_json_detail_str_data_69'
        });
        const customrecord_json_detailSearchColX9GBHI_70 = search.createColumn({
            name : 'custrecord_json_detail_str_data_70'
        });
        const customrecord_json_detailSearchColX9GBHI_71 = search.createColumn({
            name : 'custrecord_json_detail_str_data_71'
        });
        const customrecord_json_detailSearchColX9GBHI_72 = search.createColumn({
            name : 'custrecord_json_detail_str_data_72'
        });
        const customrecord_json_detailSearchColX9GBHI_73 = search.createColumn({
            name : 'custrecord_json_detail_str_data_73'
        });
        const customrecord_json_detailSearchColX9GBHI_74 = search.createColumn({
            name : 'custrecord_json_detail_str_data_74'
        });
        const customrecord_json_detailSearchColX9GBHI_75 = search.createColumn({
            name : 'custrecord_json_detail_str_data_75'
        });
        const customrecord_json_detailSearchColX9GBHI_76 = search.createColumn({
            name : 'custrecord_json_detail_str_data_76'
        });
        const customrecord_json_detailSearchColX9GBHI_77 = search.createColumn({
            name : 'custrecord_json_detail_str_data_77'
        });
        const customrecord_json_detailSearchColX9GBHI_78 = search.createColumn({
            name : 'custrecord_json_detail_str_data_78'
        });
        const customrecord_json_detailSearchColX9GBHI_79 = search.createColumn({
            name : 'custrecord_json_detail_str_data_79'
        });
        const customrecord_json_detailSearchColX9GBHI_80 = search.createColumn({
            name : 'custrecord_json_detail_str_data_80'
        });
        const customrecord_json_detailSearchColX9GBHI_81 = search.createColumn({
            name : 'custrecord_json_detail_str_data_81'
        });
        const customrecord_json_detailSearchColX9GBHI_82 = search.createColumn({
            name : 'custrecord_json_detail_str_data_82'
        });
        const customrecord_json_detailSearchColX9GBHI_83 = search.createColumn({
            name : 'custrecord_json_detail_str_data_83'
        });
        const customrecord_json_detailSearchColX9GBHI_84 = search.createColumn({
            name : 'custrecord_json_detail_str_data_84'
        });
        const customrecord_json_detailSearchColX9GBHI_85 = search.createColumn({
            name : 'custrecord_json_detail_str_data_85'
        });
        const customrecord_json_detailSearchColX9GBHI_86 = search.createColumn({
            name : 'custrecord_json_detail_str_data_86'
        });
        const customrecord_json_detailSearchColX9GBHI_87 = search.createColumn({
            name : 'custrecord_json_detail_str_data_87'
        });
        const customrecord_json_detailSearchColX9GBHI_88 = search.createColumn({
            name : 'custrecord_json_detail_str_data_88'
        });
        const customrecord_json_detailSearchColX9GBHI_89 = search.createColumn({
            name : 'custrecord_json_detail_str_data_89'
        });
        const customrecord_json_detailSearchColX9GBHI_90 = search.createColumn({
            name : 'custrecord_json_detail_str_data_90'
        });
        const customrecord_json_detailSearchColX9GBHI_91 = search.createColumn({
            name : 'custrecord_json_detail_str_data_91'
        });
        const customrecord_json_detailSearchColX9GBHI_92 = search.createColumn({
            name : 'custrecord_json_detail_str_data_92'
        });
        const customrecord_json_detailSearchColX9GBHI_93 = search.createColumn({
            name : 'custrecord_json_detail_str_data_93'
        });
        const customrecord_json_detailSearchColX9GBHI_94 = search.createColumn({
            name : 'custrecord_json_detail_str_data_94'
        });
        const customrecord_json_detailSearchColX9GBHI_95 = search.createColumn({
            name : 'custrecord_json_detail_str_data_95'
        });
        const customrecord_json_detailSearchColX9GBHI_96 = search.createColumn({
            name : 'custrecord_json_detail_str_data_96'
        });
        const customrecord_json_detailSearchColX9GBHI_97 = search.createColumn({
            name : 'custrecord_json_detail_str_data_97'
        });
        const customrecord_json_detailSearchColX9GBHI_98 = search.createColumn({
            name : 'custrecord_json_detail_str_data_98'
        });
        const customrecord_json_detailSearchColX9GBHI_99 = search.createColumn({
            name : 'custrecord_json_detail_str_data_99'
        });
        const customrecord_json_detailSearchColXVXZ5HYH = search.createColumn({
            name : 'custrecord_json_detail_str_data_100'
        });
        
        const customrecord_json_detailSearch = search.create({
            type : 'customrecord_json_detail',
            filters : [['custrecord_json_main_id', 'anyof', jsonMainId], 'AND',
                    ['custrecord_json_detail_foreignid', 'is', strforeignId], 'AND',
                    ['custrecord_json_detail_case_no', 'is', caseNo],
            ],
            columns : [customrecord_json_detailSearchColid, customrecord_json_detailSearchColJsonid,
                    customrecord_json_detailSearchColCaseNo, customrecord_json_detailSearchColForeignid,// foreignId
                    customrecord_json_detailSearchColSubsidiary,// 連結
                    customrecord_json_detailSearchColRecordeddate,// 日付
                    customrecord_json_detailSearchColXCT6RIK5,
                    customrecord_json_detailSearchColCustrecordJsonDetailDetailLineNo, customrecord_json_detailSearchColXA7FH9A3,
                    customrecord_json_detailSearchColX5C8E03M, customrecord_json_detailSearchColXRNQUOB6,
                    customrecord_json_detailSearchColX6YYMPPF, customrecord_json_detailSearchColXS14V9PN,
                    customrecord_json_detailSearchColXMRV8ZOF, customrecord_json_detailSearchColX9GBHI94,
                    customrecord_json_detailSearchColX9GBHI_6, customrecord_json_detailSearchColX9GBHI_7,
                    customrecord_json_detailSearchColX9GBHI_8, customrecord_json_detailSearchColX9GBHI_9,
                    customrecord_json_detailSearchColX9GBHI_10, customrecord_json_detailSearchColX9GBHI_11,
                    customrecord_json_detailSearchColX9GBHI_12, customrecord_json_detailSearchColX9GBHI_13,
                    customrecord_json_detailSearchColX9GBHI_14, customrecord_json_detailSearchColX9GBHI_15,
                    customrecord_json_detailSearchColX9GBHI_16, customrecord_json_detailSearchColX9GBHI_17,
                    customrecord_json_detailSearchColX9GBHI_18, customrecord_json_detailSearchColX9GBHI_19,
                    customrecord_json_detailSearchColX9GBHI_20, customrecord_json_detailSearchColX9GBHI_21,
                    customrecord_json_detailSearchColX9GBHI_22, customrecord_json_detailSearchColX9GBHI_23,
                    customrecord_json_detailSearchColX9GBHI_24, customrecord_json_detailSearchColX9GBHI_25,
                    customrecord_json_detailSearchColX9GBHI_26, customrecord_json_detailSearchColX9GBHI_27,
                    customrecord_json_detailSearchColX9GBHI_28, customrecord_json_detailSearchColX9GBHI_29,
                    customrecord_json_detailSearchColX9GBHI_30, customrecord_json_detailSearchColX9GBHI_31,
                    customrecord_json_detailSearchColX9GBHI_32, customrecord_json_detailSearchColX9GBHI_33,
                    customrecord_json_detailSearchColX9GBHI_34, customrecord_json_detailSearchColX9GBHI_35,
                    customrecord_json_detailSearchColX9GBHI_36, customrecord_json_detailSearchColX9GBHI_37,
                    customrecord_json_detailSearchColX9GBHI_38, customrecord_json_detailSearchColX9GBHI_39,
                    customrecord_json_detailSearchColX9GBHI_40, customrecord_json_detailSearchColX9GBHI_41,
                    customrecord_json_detailSearchColX9GBHI_42, customrecord_json_detailSearchColX9GBHI_43,
                    customrecord_json_detailSearchColX9GBHI_44, customrecord_json_detailSearchColX9GBHI_45,
                    customrecord_json_detailSearchColX9GBHI_46, customrecord_json_detailSearchColX9GBHI_47,
                    customrecord_json_detailSearchColX9GBHI_48, customrecord_json_detailSearchColX9GBHI_49,
                    customrecord_json_detailSearchColX9GBHI_50, customrecord_json_detailSearchColX9GBHI_51,
                    customrecord_json_detailSearchColX9GBHI_52, customrecord_json_detailSearchColX9GBHI_53,
                    customrecord_json_detailSearchColX9GBHI_54, customrecord_json_detailSearchColX9GBHI_55,
                    customrecord_json_detailSearchColX9GBHI_56, customrecord_json_detailSearchColX9GBHI_57,
                    customrecord_json_detailSearchColX9GBHI_58, customrecord_json_detailSearchColX9GBHI_59,
                    customrecord_json_detailSearchColX9GBHI_60, customrecord_json_detailSearchColX9GBHI_61,
                    customrecord_json_detailSearchColX9GBHI_62, customrecord_json_detailSearchColX9GBHI_63,
                    customrecord_json_detailSearchColX9GBHI_64, customrecord_json_detailSearchColX9GBHI_65,
                    customrecord_json_detailSearchColX9GBHI_66, customrecord_json_detailSearchColX9GBHI_67,
                    customrecord_json_detailSearchColX9GBHI_68, customrecord_json_detailSearchColX9GBHI_69,
                    customrecord_json_detailSearchColX9GBHI_70, customrecord_json_detailSearchColX9GBHI_71,
                    customrecord_json_detailSearchColX9GBHI_72, customrecord_json_detailSearchColX9GBHI_73,
                    customrecord_json_detailSearchColX9GBHI_74, customrecord_json_detailSearchColX9GBHI_75,
                    customrecord_json_detailSearchColX9GBHI_76, customrecord_json_detailSearchColX9GBHI_77,
                    customrecord_json_detailSearchColX9GBHI_78, customrecord_json_detailSearchColX9GBHI_79,
                    customrecord_json_detailSearchColX9GBHI_80, customrecord_json_detailSearchColX9GBHI_81,
                    customrecord_json_detailSearchColX9GBHI_82, customrecord_json_detailSearchColX9GBHI_83,
                    customrecord_json_detailSearchColX9GBHI_84, customrecord_json_detailSearchColX9GBHI_85,
                    customrecord_json_detailSearchColX9GBHI_86, customrecord_json_detailSearchColX9GBHI_87,
                    customrecord_json_detailSearchColX9GBHI_88, customrecord_json_detailSearchColX9GBHI_89,
                    customrecord_json_detailSearchColX9GBHI_90, customrecord_json_detailSearchColX9GBHI_91,
                    customrecord_json_detailSearchColX9GBHI_92, customrecord_json_detailSearchColX9GBHI_93,
                    customrecord_json_detailSearchColX9GBHI_94, customrecord_json_detailSearchColX9GBHI_95,
                    customrecord_json_detailSearchColX9GBHI_96, customrecord_json_detailSearchColX9GBHI_97,
                    customrecord_json_detailSearchColX9GBHI_98, customrecord_json_detailSearchColX9GBHI_99,
                    customrecord_json_detailSearchColXVXZ5HYH, ],
        });

        var resultSet = [];
        const customrecord_json_detailSearchPagedData = customrecord_json_detailSearch.runPaged({
            pageSize : 1000,
        });
        for (var i = 0; i < customrecord_json_detailSearchPagedData.pageRanges.length; i++) {
            const customrecord_json_detailSearchPage = customrecord_json_detailSearchPagedData.fetch({
                index : i,
            });
            customrecord_json_detailSearchPage.data.forEach(function(result) {
                resultSet.push(result);
            });
        }
        return resultSet;
    };
    

    /**
     * APIでDataBaseに保存するデータを作成
     * 元のJSONのデータの一行のデータのキーにより、このデータに対するレコードのマッピング情報を取得する
     * @param jsonMainId
     * @param mainLineNo
     * @param caseNo
     * @returns
     */
    function makeStoreRecords(jsonMainId, mainLineNo, caseNo, strforeignId) {

        // caseNoから、オブジェクト化したMasterTableと使用するRecordsを格納した配列を作成する内部関数
        var _makeTableObject = function(masterTableName) {
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
                    if (!primaryRecords) {
                    }
                    // PrimaryRecordsのインデックスを取得
                    var primaryIndex = -1;
                    for (var i = 0; i < recordsTypes.length; i++) {
                        if (recordsTypes[i] == primaryRecords) {
                            primaryIndex = i;
                            break;
                        };
                    }
                    // primaryRecordsを最初の要素に設定
                    buf = recordsTypes[0];
                    recordsTypes[0] = recordsTypes[primaryIndex];
                    recordsTypes[primaryIndex] = buf;
                }
                return [tableObjects, recordsTypes];

            } catch (e) {
                var error;

                if (e.hasOwnProperty('details')) {
                    error = e.getDetails();
                } else {
                    error = e;
                }
            };

        };

        var storeRecords = [];
        var recordsTypesArray = [];
        var tableObjects = []; // MasterTableをオブジェクトに変換したもの Objects in Array
        var recordsTypes = []; // 使用するRecordsのTypeを保管
        //元のJSONのデータの一行のデータのキーにより、このデータを取得する
        var inputData = getData(jsonMainId, strforeignId, caseNo);
        // データが取得できない場合は、処理終了
        if(!(inputData && inputData.length > 0)){
            return;
        }
        var caseNo = inputData[0].getValue({
            name : "custrecord_json_detail_case_no",
        });
        var foreignId = inputData[0].getValue({
            name : "custrecord_json_detail_foreignid",
        });
        var subsidiary = inputData[0].getValue({
            name : "custrecord_json_detail_subsidiary",
        });
        var recordedDate = inputData[0].getValue({
            name : "custrecord_json_detail_recordeddate",
        });
		var lineNos = [];
		for (var j = 0; j < inputData.length; j++) {
		    var lineNo = inputData[j].getValue({
                name : "custrecord_json_detail_main_line_no",
            });
			lineNos.push(lineNo);
		}
		lineNos = lineNos.filter(function(val, i, self) {
                    return i === self.indexOf(val);
                });
        // caseNoに相当するMasterTableのデータ（配列）を取得する
        var masterTableName = tableTypeObj.DataRecordTypes.caseTable[caseNo];

        //　元のJSONのデータの一行のデータに対するマッピング情報を取得する
        [tableObjects, recordsTypes] = _makeTableObject(masterTableName);

        // InputDataの各レコードに対応するオブジェクトの作成（レコードタイプ単位で分けて）
        var oneRecordObject = {}
        for (var i = 0; i < lineNos.length; i++) { // RecordType別にまとめる
            var lineNo = lineNos[i];
            var bufRecord = [];
            // for (var item in inputData[j]) { // レコード（Object）のKey毎の処理
            for (var k = 0; k < tableObjects.length; k++) { // JSON_ITEM名とRecordsが同じMasterTableデータを取得
                var json_item = tableObjects[k][tableTypeObj.Constant.JSON_ITEM].split('|')[0];
                var key_item = tableObjects[k][tableTypeObj.Constant.JSON_ITEM].split('|')[1];
                // if (tableObjects[k][tableTypeObj.Constant.JSON_ITEM] == item && tableObjects[k][tableTypeObj.Constant.NS_RECORDS] ==
                // recordsType) {
                // Objectの作成およびレスポンス配列への格納
                var bufObject = {};
                // if (tableObjects[k][tableTypeObj.Constant.JSON_ITEM] == tableTypeObj.Constant.KEY_ITEM) {
                if (key_item == tableTypeObj.Constant.KEY_ITEM) {
                    bufObject.keyFlag = true;
                } else {
                    bufObject.keyFlag = false;
                }
                bufObject[tableTypeObj.Constant.NS_FIELD] = tableObjects[k][tableTypeObj.Constant.NS_FIELD];
                bufObject[tableTypeObj.Constant.NS_RECORDS] = tableObjects[k][tableTypeObj.Constant.NS_RECORDS];
				bufObject[tableTypeObj.Constant.NS_SUBLIST] = tableObjects[k][tableTypeObj.Constant.NS_SUBLIST];
                bufObject[tableTypeObj.Constant.NS_SUBFIELD] = tableObjects[k][tableTypeObj.Constant.NS_SUBFIELD];
                bufObject[tableTypeObj.Constant.NS_FIELDTYPE] = tableObjects[k][tableTypeObj.Constant.NS_FIELDTYPE];
                bufObject[tableTypeObj.Constant.NS_FIELD_TEMP] = tableObjects[k][tableTypeObj.Constant.NS_FIELD_TEMP];
                bufRecord.push(bufObject);
            }
            // }
            oneRecordObject[lineNo] = bufRecord;
        }

        // 一行のJSONデータのレコード情報:値を設定する
        //　元のJSONのデータの一行のデータ　と　マッピング情報と再マッピングする（マッピング情報に値項目を追加される）
        var totalRecord = [];
        var mainRecord = "";
        for (var j = 0; j < inputData.length; j++) {
            var tempRecordType = inputData[j].getValue({
                name : "custrecord_json_detail_main_line_no",
            });
            var tempSublist = inputData[j].getValue({
                name : "custrecord_json_detail_record_sublist",
            });
            //当該ケースNoに対するマッピング情報のレコードタイプずつループする
            for ( var item2 in oneRecordObject[tempRecordType]) {
                var filedObj = oneRecordObject[tempRecordType][item2];

                if (filedObj[tableTypeObj.Constant.NS_FIELD_TEMP]) {
                	if (filedObj.keyFlag && mainRecord == "") {
                		mainRecord = inputData[j].getValue({name : filedObj[tableTypeObj.Constant.NS_FIELD_TEMP]});
                	}
                    //サブリストの場合は、当該サブリストの当該フィールドに値を設定する
                    if (tempSublist && tempSublist == filedObj[tableTypeObj.Constant.NS_SUBLIST]) {
                        filedObj.val = inputData[j].getValue({
                            name : filedObj[tableTypeObj.Constant.NS_FIELD_TEMP],
                        });
                    } else if (!tempSublist && !filedObj[tableTypeObj.Constant.NS_SUBLIST]) {//ヘッダデータの場合は、ヘッダのフィールドに値を設定する
                        filedObj.val = inputData[j].getValue({
                            name : filedObj[tableTypeObj.Constant.NS_FIELD_TEMP],
                        });
                    } else {//サブリストの場合は、当該サブリスト以外のサブリストのフィールドに設定しない
                        //　処理しない
                    };
                };
            };
        }

        // 元のInputDataのレコードの情報を取得し、オブジェクトに格納して、そのオブジェクトを戻す
        oneRecordObject['recordInfo'] = {
            'caseNo' : caseNo,
            'foreignId' : foreignId,
            'subsidiary' : subsidiary,
            'trandate' : recordedDate, // /
            "recordsTypes" : recordsTypes,
			"lineNos":lineNos,
            "targetDataArray":inputData,
            "mainRecord":mainRecord,
        }

        return oneRecordObject;

    };

    /**
     * KEY_ITEMのFieldに値をセットする内部関数
     * @param setValues　 値情報
     * @param recordObject　レコード情報
     * @returns
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
            var fieldType = setValues[j][Constants.NS_FIELDTYPE].split('|')[0]; // フィールドのタイプ
            var selectRecord = setValues[j][Constants.NS_FIELDTYPE].split('|')[1];// 当該フィールドの値を設定するために、検索するレコードタイプ
            var selectFilter = setValues[j][Constants.NS_FIELDTYPE].split('|')[2];// 当該フィールドの値を設定するために、検索するレコードタイプのフィルター用フィールド
            var lookupField = setValues[j][Constants.NS_FIELDTYPE].split('|')[3]; // 未指定の場合は、内部IDを取得する、指定する場合は、このフィールドを使用する
            var val = "";
         // / 各条件による値のセット
            if (fieldType == 'select') { // select
                 val = _searchVal(selectRecord, selectFilter, setValues[j]['val'])||setValues[j]['val'];
                 if (lookupField) {
                    // 指定フィールドの値を取得する（上記の検索条件より、内部IDを当該のレコードの指定フィールドの値）
                    var location = search.lookupFields({
                        type : selectRecord,
                        id : val,
                        columns : [lookupField],
                    });
                    // recordObject.setValue({
                    // fieldId : 'custbody_ns_custom_location',
                    // value : location,
                    // });
                };
            } else if (fieldType == 'date') { // date
                val = setValues[j]['val'];
                // 日付の値が8文字（yyyy?dd）の場合ののみ日付型に変換（それ以外の場合はエラーが発生）
                if (strval === undefined || strval == null || strval === '') {
                	continue;
                }
                else {
                	strval = strval.replace(new RegExp('-',"gm"),'/');
                	val = format.parse({
                	                value : new Date(strval),
                	                type : format.Type.DATETIME,
                	            });
                };
            } else if (fieldType == 'checkbox') { // チェックボックス
                val = setValues[j]['val'];
                if (val == '1')
					val = true;
				if (val == '0')
					val = false;
            } else if (fieldType == 'JSON') {
                val = JSON.stringify(setValues[j]['val']);
                // } else if (fieldType == 'tax'){
                // val = setValues[j]['val'];
                // if (val == 'CT00'){
                // val = 12;
                // }
                // if (val == 'CT08'){
                // val = 7;
                // }
                // if (val == 'CT10'){
                // val = 14;
                // }
            } else {
                val = setValues[j]['val'];
            }
            if (val === undefined || val == null || val === '') {
            	continue;
            }
            if (field) {
                recordObject.setValue({
                    fieldId : field,
                    value : val,
                });
            }
        }
        return recordObject;
    };
    
    /**
     * ReocrdsのFieldに値をセットする内部関数
     * @param setValues 値情報
     * @param recordObject　レコード情報
     * @param recordId　内部ID
     * @param newRecordFlag　新規作成か更新かフラグ
     * @param _sublistArray　サブリスト名称配列
     * @param _sublistObject　サブリストのフィールド情報
     * @param recordsType　レコードタイプ
     * @returns
     */
    function _setValues(storeRecord, recordObject, recordId, newRecordFlag, _sublistArray, _sublistObject, recordsType, lineNos, mainCaseNo) {
        var Constants = tableTypeObj.Constant;
        var field, fieldType, sublist, subfield, val;
        var newline = true;
		for (var k = 0; k < lineNos.length; k++) {
			var recordsType = lineNos[k];
			var setValues = storeRecord[recordsType];
			var _sublistObjects = [];
			
			var tmpDeleteFlg = setValues.filter(function(tmp) {
				if (tmp['NS_Field_TEMP'] == 'custrecord_json_detail_str_data_88'){
					if (tmp['val'] == '1') {
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			});
			
			if (tmpDeleteFlg != null && tmpDeleteFlg != '' && tmpDeleteFlg.length > 0) {
				continue;
			}
			
			for (var j = 0; j < setValues.length; j++) {
				// foreignIdのデータは、ここでは保存しない
//				if (setValues[j]['keyFlag'] == true) {
//					continue;
//				}
				// 各値の変数への格納
				var field = setValues[j][Constants.NS_FIELD];
				var fieldType = setValues[j][Constants.NS_FIELDTYPE].split('|')[0]; // フィールドのタイプ
				var selectRecord = setValues[j][Constants.NS_FIELDTYPE].split('|')[1];// 当該フィールドの値を設定するために、検索するレコードタイプ
				var selectFilter = setValues[j][Constants.NS_FIELDTYPE].split('|')[2];// 当該フィールドの値を設定するために、検索するレコードタイプのフィルター用フィールド
				var lookupField = setValues[j][Constants.NS_FIELDTYPE].split('|')[3]; // 未指定の場合は、内部IDを取得する、指定する場合は、このフィールドを使用する
				var location;
				sublist = setValues[j][Constants.NS_SUBLIST];
				subfield = setValues[j][Constants.NS_SUBFIELD];
				
				// / 各条件による値のセット
				if (fieldType == 'date') { // date
					strval = setValues[j]['val'];
					// 日付の値が8文字（yyyy?dd）の場合ののみ日付型に変換（それ以外の場合はエラーが発生）
					if (strval === undefined || strval == null || strval === '') {
	                	continue;
	                }
	                else {
	                	strval = strval.replace(new RegExp('-',"gm"),'/');
	                	var now = new Date(strval);
	                    var offSet = now.getTimezoneOffset();
	                    var offsetHours = 9 + (offSet / 60);
	                    now.setHours(now.getHours() - offsetHours);
	                	val = format.parse({
	                	                value : now,
	                	                type : format.Type.DATETIME,
	                	            });
	                };
				} else if (fieldType == 'dateymd') { // date
					strval = setValues[j]['val'];
					// 日付の値が8文字（yyyy?dd）の場合ののみ日付型に変換（それ以外の場合はエラーが発生）
					if (strval === undefined || strval == null || strval === '') {
	                	continue;
	                }
	                else {
	                	strval = strval.replace(new RegExp('-',"gm"),'/');
	                	strval = strval.substring(0, 10);
	                	val = format.parse({
	                	                value : new Date(strval),
	                	                type : format.Type.DATETIME,
	                	            });
	                };
				} else if (fieldType == 'dateymdcsv') { // date
					var strvalold = setValues[j]['val'];
					if (strvalold === undefined || strvalold == null || strvalold === '') {
	                	continue;
	                }
					strval = strvalold.substring(0, 4) + "/" + strvalold.substring(4, 6) + "/" + strvalold.substring(6, 8);
                	val = format.parse({
                	                value : new Date(strval),
                	                type : format.Type.DATETIME,
                	            });
                  } else if (fieldType == 'dateymdhms') { // date
					strval = setValues[j]['val'];
					// 日時の値が（YYYY年MM月DD日 HH?mm分SS秒）の場合ののみ日付型に変換（それ以外の場合はエラーが発生）
					if (strval === undefined || strval == null || strval === '') {
	                	continue;
	                }
	                else {
                      var strTmp = strval.substring(0,4) + "/" + strval.substring(5,7) + "/" + strval.substring(8,10) + " " + strval.substring(12,14) + ":" + strval.substring(15,17) + ":" + strval.substring(18,20);
	                	//var now = new Date(strTmp);007
								 var dateTmp = new Date(strTmp);
                      var offSet = dateTmp.getTimezoneOffset();
                      var offsetHours = 9 + (offSet / 60);
                      dateTmp.setHours(dateTmp.getHours() - offsetHours);
                      val = format.parse({
	                	    value : dateTmp,
	                	    type : format.Type.DATETIME,
	                	  });
                   //log.audit("INFOINFOINFOINFOINFOINFOINFOINFOINFOINFOINFO", "valvalvalvalvalvalvalvalval :" + val);
	                };
				}else if (fieldType == 'datechar') { // date
                    var strvalold = setValues[j]['val'];
                    if (strvalold === undefined || strvalold == null || strvalold === '') {
                        continue;
                    }
                    strval = strvalold.substring(0, 4) + "/" + strvalold.substring(4, 6) + "/" + strvalold.substring(6, 8);
                    val = format.parse({
                                 value : new Date(strval),
                                 type : format.Type.DATETIME,
                             });
                } else if (fieldType == 'checkbox') { // チェックボックス
					val = setValues[j]['val'];
					if (val == '1')
						val = true;
					if (val == '0')
						val = false;
				} else if (fieldType == 'decimal') { // チェックボックス
					strval = setValues[j]['val'];
					if (strval === undefined || strval == null || strval === '') {
	                	continue;
	                } else {
                        val = Number((Number(strval)).toFixed(2));
                    }
				} else if (fieldType == 'JSON') {
					val = JSON.stringify(setValues[j]['val']);
					// } else if (fieldType == 'tax'){
					// val = setValues[j]['val'];
					// if (val == 'CT00'){
					// val = 12;
					// }
					// if (val == 'CT08'){
					// val = 7;
					// }
					// if (val == 'CT10'){
					// val = 14;
					// }
				} else {
					val = setValues[j]['val'];
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
						// field:field,
						val : val,
					};
					_sublistObjects.push(sublistObj);

					// //場所の値をセット
					// if(location){
					// var sublistLocation = {
					// field: 'location',
					// val: location,
					// };
					// _sublistObject.push(sublistLocation);
					//                
					// }

				} else {
					// recordオブジェクトのインスタンスに、入力するデータをセット
					if (field) {
						recordObject.setValue({
							fieldId : field,
							value : val,
						});
					};
				};
			}
			_sublistObject.push(_sublistObjects);
		}
        return recordObject;
    };
    
    /**
     * filterオブジェクトを作成する内部関数
     * @param setValues
     * @returns
     */
    function _createFilter(setValues) {
        var Constants = tableTypeObj.Constant;
        var searchFilter;
        // KeyField(入力データ:foreignId → Netsuite:entityId)に入力するレコードを取得するフィルターを作成
        for (var j = 0; j < setValues.length; j++) {
            if (setValues[j]['keyFlag'] == true && setValues[j]['val'] != null) {
                var key_field = setValues[j][Constants.NS_FIELD];
                var fieldType = setValues[j][Constants.NS_FIELDTYPE].split('|')[0]; // フィールドのタイプ
                var selectRecord = setValues[j][Constants.NS_FIELDTYPE].split('|')[1];// 当該フィールドの値を設定するために、検索するレコードタイプ
                var selectFilter = setValues[j][Constants.NS_FIELDTYPE].split('|')[2];// 当該フィールドの値を設定するために、検索するレコードタイプのフィルター用フィールド
                var lookupField = setValues[j][Constants.NS_FIELDTYPE].split('|')[3]; // 未指定の場合は、内部IDを取得する、指定する場合は、このフィールドを使用する
                var val = "";
             // / 各条件による値のセット
                if (fieldType == 'select') { // select
                     val = _searchVal(selectRecord, selectFilter, setValues[j]['val'])||setValues[j]['val'];
                     if (lookupField) {
                        // 指定フィールドの値を取得する（上記の検索条件より、内部IDを当該のレコードの指定フィールドの値）
                        var location = search.lookupFields({
                            type : selectRecord,
                            id : val,
                            columns : [lookupField],
                        });
                        // recordObject.setValue({
                        // fieldId : 'custbody_ns_custom_location',
                        // value : location,
                        // });
                    };
                } else if (fieldType == 'date') { // date
                    val = setValues[j]['val'];
                    // 日付の値が8文字（yyyy?dd）の場合ののみ日付型に変換（それ以外の場合はエラーが発生）
                    if (val.length == 8) {
                        var year = val.slice(0, 4);
                        var month = val.slice(4, 6);
                        var day = val.slice(6, 8);
                        val = year + '/' + month + '/' + day;
                    };
                } else if (fieldType == 'checkbox') { // チェックボックス
                    val = setValues[j]['val'];
                    if (val == 'true' || val == '1')
                        val = 'T';
                    if (val == 'false' || val == '')
                        val = 'F';
                } else if (fieldType == 'JSON') {
                    val = JSON.stringify(setValues[j]['val']);
                    // } else if (fieldType == 'tax'){
                    // val = setValues[j]['val'];
                    // if (val == 'CT00'){
                    // val = 12;
                    // }
                    // if (val == 'CT08'){
                    // val = 7;
                    // }
                    // if (val == 'CT10'){
                    // val = 14;
                    // }
                } else {
                    val = setValues[j]['val'];
                }
                if (val === undefined || val == null || val === '') {
                	continue;
                }
                // フィルターobjectを作成
                searchFilter = search.createFilter({
                    name : key_field,
                    operator : search.Operator.IS,
                    values : val,
                });
                break;
            };
        }
        return searchFilter;
    };
    
    /**
     * select型の値を取得する内部関数
     * @param selectRecord
     * @param searchFilter
     * @param searchValue
     */
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
        };

    };

    /**
     * 連結の名称より、連結の内部IDを取得する
     * @param subsidiary
     */
    function getSubsidiaryIdBySubsidiaryName(subsidiaryName) {

        var objSavedSearch = search.create({
            type : "subsidiary",
            filters : [
            // ["formulatext: {namenohierarchy}","is","Honeycomb Mfg."]
            ["formulatext: {namenohierarchy}", "is", subsidiaryName]],
            columns : [search.createColumn({
                name : "internalId",
                sort : search.Sort.ASC,
                label : "Id",
            }), search.createColumn({
                name : "name",
                sort : search.Sort.ASC,
                label : "名前",
            }), search.createColumn({
                name : "city",
                label : "市区町村",
            }), search.createColumn({
                name : "state",
                label : "都道府県",
            }), search.createColumn({
                name : "country",
                label : "国",
            }), search.createColumn({
                name : "currency",
                label : "通貨",
            }), search.createColumn({
                name : "namenohierarchy",
                label : "名前（階層なし）",
            }), search.createColumn({
                name : "formulatext",
                formula : "{namenohierarchy}",
                label : "計算式（テキスト）",
            })]
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
            return DEFAULT_SUBSIDIARY;
        };
    };
  
    function getTableInfo(tableid,filterlist,columnlist) {
    	var objSearch = search.create({
    			            type : tableid,
    			            filters : filterlist,
    			            columns : columnlist,
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
    	return searchResults;
    };
});
