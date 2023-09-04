/**
 * JSON�̃f�[�^�𕪐͂��āA�e�[�u���ʂɃf�[�^��ۑ����� ����X�N���v�g?@ : => JSON Parse
 * 
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime', './Common_2_Data_Setting', 'N/task', 'N/format', './getSelectData', 'N/log'], function(record, search, runtime, tableTypeObj, task, format, selectData, log) {

    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     * �f�[�^�x�[�X�ŕۑ�����JSON�f�[�^���擾���āi�ꌏ�̂݁A�������ς݂̃f�[�^���ΏۂƂ���j�A�s�P�ʂŕ������āAJSON Parse���R�[�h�^�C�v�̃f�[�^���쐬����B
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
        log.audit("INFO", "OCI�f�[�^��Mstep1�J�n");
        var now = new Date();
        log.audit("INFO", "OCI�f�[�^��Mstep1�J�ntime :" + now);
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

        // ���R�[�h���X�V����F�����ς݃t���O�������ςݏ�Ԃɐݒ�
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
        //�@�s�P�ʂ̃f�[�^�z���߂�
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair. 
     * JSON�f�[�^�̍s�f�[�^�P�ʂ���������
     * 
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
        //log.audit("INFO", "Map�J�n");
        var storeKey = context.key;// storeRecord�̃L�[

        var Constants = tableTypeObj.Constant;
        var response = []; // ���X�|���X�p�̔z�� map�ŕԂ�
        var sublistArray = [];
        var sublistObject = [];
        var removedArray = [];
        var storeRecord = JSON.parse(context.value);// storeRecord��InputData[i]�ɑΉ�
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

                // �O���L�[
                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_foreignid',
                    value : storeRecord.recordInfo.foreignId
                });

                // �A��
                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_subsidiary',
                    value : storeRecord.recordInfo.subsidiary
                });
                // ���t
                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_recordeddate',
                    value : storeRecord.recordInfo.trandate
                });
                // �D��
                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_first',
                    value : firstRun
                });

                // keyField(entityId)�̒l��recordObject�ɃZ�b�g
                recordObject = _setKeyValue(setValues, recordObject);
                // keyField�ȊO�̃f�[�^��recordObject�ɃZ�b�g(��ڂ�TypeRecords�̏ꍇ3�Ԗڂ̈�����undefined)
                recordObject = _setValues(setValues, recordObject, keyRecordId, true, sublistArray, sublistObject, recordsType, storeRecord.recordInfo.caseNo);

                recordObject.setValue({
                    fieldId : 'custrecord_json_detail_case_no',
                    value : storeRecord.recordInfo.caseNo
                });
                var recordId = recordObject.save({
                    enableSourcing : false,
                    ignoreMandatoryFields : false
                });

                // sublist����
                if (sublistArray) {
                    // �d���r��
                    var sublistArr = sublistArray.filter(function(x, i, self) {
                        return self.indexOf(x) === i;
                    });
                    //�T�u���X�g�̃f�[�^�̈�s�̃f�[�^���AJSON Parse�̈�s�̃f�[�^���쐬����B
                    // sublistArr�����[�v
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

                        // sublistObject�����[�v�F��s�̃f�[�^�̊e�t�B�[���h�̒l��ݒ肷��
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
            context.write({ // OK �������v�p �������s����΁AOK�O���[�v�ɒǉ�
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
        	context.write({ // OK �������v�p �������s����΁AOK�O���[�v�ɒǉ�
                key : storeRecord.recordInfo.internalId + "-" + "1",
                value : context.key
            });
        } finally {
            
        }

        // reduce�p�L�[
//        context.write({ // OK �������v�p �������s����΁AOK�O���[�v�ɒǉ�
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
                 
                 // �p�b�`���Ăяo��
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
    	 log.audit("INFO", "OCI�f�[�^��Mstep1�I��time :" + now2);
    	 log.audit("INFO", "OCI�f�[�^��Mstep1�I��");
    }

    return {
        getInputData : getInputData,
        map : map,
        reduce : reduce,
        summarize : summarize
    };

    // // �f�[�^�T���v��
    // var recordData = [
    // {"caseNo" : "CS02","foreignId" : "T430080","destination":"1","recordedDate":"20200202", "item" : "T430080","class" : "T430080"},
    // {"caseNo" : "CS02","foreignId" : "T440080","destination":"1","recordedDate":"20200202", "item" : "T440080","class" : "T440080"},
    // {"caseNo" : "CS02","foreignId" : "T450080","destination":"1","recordedDate":"20200202","item" : "T450080", "class" : "T450080"}
    // ];
    // // �֐�makeStoreRecords�ō쐬����storeRecords�̃T���v��
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
    // // �֐�makeStoreRecords�̓����֐�_makeTableObject ���Ԃ�tableObjects�̃T���v��
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
     * API��DataBase�ɕۑ�����f�[�^���쐬�iOutput�̃C���[�W��output_sample�Q�Ɓj
     */
    function makeStoreRecords(inputData, internalId) {
        // caseNo����A�I�u�W�F�N�g������MasterTable�Ǝg�p����Records���i�[�����z����쐬��������֐�
        var _makeTableObject = function(masterTableName, caseNo) {
            try {
                var masterTables = tableTypeObj.DataRecordTypes.masterTables;
                var masterTable = masterTables[masterTableName];
                // MasterTable�̔z����I�u�W�F�N�g�ɕϊ�(tableObjects)���g�p����Records��ۊǂ���z����쐬�irecordsTypes)
                var keys = masterTable.keys;
                var tableObjects = []; // MasterTable���I�u�W�F�N�g�ɕϊ��������� Objects in Array
                var recordsTypes = []; // �g�p����Records��Type��ۊ�
                for (var i = 0; i < masterTable.vals.length; i++) {
                    var bufObj = {};
                    var vals = masterTable.vals[i];
                    if (keys.length != vals.length) {
                        return false;
                    }
                    // �z��keys���I�u�W�F�N�g�̃L�[�ɁA�z��vals���I�u�W�F�N�g�̒l�ɐݒ�
                    for (var j = 0; j < keys.length; j++) {
                        bufObj[keys[j]] = vals[j];
                    }
                    recordsTypes.push(bufObj[tableTypeObj.Constant.NS_RECORDS]);
                    tableObjects.push(bufObj);
                }
                // �z��recordsTyeps�̏d�������v�f���폜
                recordsTypes = recordsTypes.filter(function(val, i, self) {
                    return i === self.indexOf(val);
                });
                // ���͂���Records�������̏ꍇ�̏���(�z��recordsTypes�̑��v�f��PrimaryRecords�ɐݒ�)
                if (recordsTypes.length > 1) {
                    // primaryRecords�i��Ƀ��R�[�h��ۑ�����K�v������Records�j�̎擾
                    var primaryRecords = tableTypeObj.DataRecordTypes.primaryRelations[masterTableName];
                    // PrimaryRecords�̃C���f�b�N�X���擾
                    var primaryIndex = -1;
                    for (var i = 0; i < recordsTypes.length; i++) {
                        if (recordsTypes[i] == primaryRecords) {
                            primaryIndex = i;
                            break;
                        }
                    }
                    // primaryRecords���ŏ��̗v�f�ɐݒ�
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
        for (var j = 0; j < inputData.length; j++) { // InpoutData�̃��R�[�h���iObject�j�ɕϊ�
            var caseNo = inputData[j]['caseNo'];
            var foreignId = inputData[j]['foreignId'];
            var subsidiary = inputData[j]['subsidiary'];//�A��
            var recordedDate = inputData[j]['recordedDate']; // /
            if (recordedDate && recordedDate.length == 8) {
                var year = recordedDate.slice(0, 4);
                var month = recordedDate.slice(4, 6);
                var day = recordedDate.slice(6, 8);
                recordedDate = year + '/' + month + '/' + day;
            }
            // MasterTable�̃I�u�W�F�N�g�Ǝg�p����Records���i�[�����z����擾

            // caseNo�ɑ�������MasterTable�̃f�[�^�i�z��j���擾����
            var masterTableName = tableTypeObj.DataRecordTypes.caseTable[caseNo];

            [tableObjects, recordsTypes] = _makeTableObject(masterTableName, caseNo);
            // InputData�̊e���R�[�h�ɑΉ�����I�u�W�F�N�g�̍쐬
            var oneRecordObject = {};
            for (var i = 0; i < recordsTypes.length; i++) { // RecordType�ʂɂ܂Ƃ߂�
                var recordsType = recordsTypes[i];
                var bufRecord = [];
                for ( var item in inputData[j]) { // ���R�[�h�iObject�j��Key���̏���
                    if (inputData[j].hasOwnProperty(item) && item != tableTypeObj.Constant.CASE_ID) {
                        var val = inputData[j][item]; // Key�ɑ΂���Value�̕ϐ��ւ̊i�[
                        for (var k = 0; k < tableObjects.length; k++) { // JSON_ITEM����Records������MasterTable�f�[�^���擾
                            var json_item = tableObjects[k][tableTypeObj.Constant.JSON_ITEM].split('|')[0]; //JSON�f�[�^�̃t�B�[���h�̖��O
                            var key_item = tableObjects[k][tableTypeObj.Constant.JSON_ITEM].split('|')[1]; //���Y�t�B�[���h���L�[�Ƃ��ė��p���邩�t���O
                            if (json_item == item && tableObjects[k][tableTypeObj.Constant.NS_RECORDS] == recordsType) {
                                // Object�̍쐬����у��X�|���X�z��ւ̊i�[
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
            // ����InputData�̃��R�[�h�̏����擾���A�I�u�W�F�N�g�Ɋi�[
            oneRecordObject['recordInfo'] = {
                'caseNo' : caseNo,
                'foreignId' : foreignId,
                'subsidiary' : subsidiary,
                'trandate' : recordedDate, // /
                'recordsTypes' : recordsTypes, // / ���R�[�h�^�C�v(������)
                'internalId' : internalId
            // ����ID
            };
            storeRecords.push(oneRecordObject);
        }

        return storeRecords;// JSON�̍s�f�[�^���̔z��
    };
    
    /**
     * KEY_ITEM��Field�ɒl���Z�b�g��������֐�
     * 
     * @param setValues�@ �l���
     * @param recordObject�@���R�[�h���
     */
    function _setKeyValue(setValues, recordObject) {
        var Constants = tableTypeObj.Constant;

        for (var j = 0; j < setValues.length; j++) {
            // foreignId�̃f�[�^�ȊO�́A�����ł͕ۑ����Ȃ�
            if (setValues[j]['keyFlag'] == false) {
                continue;
            }
            // �l�̃Z�b�g
            var field = setValues[j][Constants.NS_FIELD];
            var fieldTemp = setValues[j][Constants.NS_FIELD_TEMP];
//            var fieldType = setValues[j][Constants.NS_FIELDTYPE].split('|')[0]; // �t�B�[���h�̃^�C�v
//            var selectRecord = setValues[j][Constants.NS_FIELDTYPE].split('|')[1]; // ���Y�t�B�[���h�̒l��ݒ肷�邽�߂ɁA�������郌�R�[�h�^�C�v
//            var selectFilter = setValues[j][Constants.NS_FIELDTYPE].split('|')[2]; // ���Y�t�B�[���h�̒l��ݒ肷�邽�߂ɁA�������郌�R�[�h�^�C�v�̃t�B���^�[�p�t�B�[���h
//            var lookupField  = setValues[j][Constants.NS_FIELDTYPE].split('|')[3]; // ���w��̏ꍇ�́A����ID���擾����A�w�肷��ꍇ�́A���̃t�B�[���h���g�p����
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
     * Reocrds��Field�ɒl���Z�b�g��������֐�
     * 
     * @param setValues �l���
     * @param recordObject�@���R�[�h���
     * @param recordId�@����ID
     * @param newRecordFlag�@�V�K�쐬���X�V���t���O
     * @param _sublistArray�@�T�u���X�g���̔z��
     * @param _sublistObject�@�T�u���X�g�̃t�B�[���h���
     * @param recordsType�@���R�[�h�^�C�v
     */ 
    function _setValues(setValues, recordObject, recordId, newRecordFlag, _sublistArray, _sublistObject, recordsType, caseNo) {
        var Constants = tableTypeObj.Constant;
        var field, fieldType, sublist, subfield, val;
        var newline = true;
        for (var j = 0; j < setValues.length; j++) {
            // foreignId�̃f�[�^�́A�����ł͕ۑ����Ȃ�
            if (setValues[j]['keyFlag'] == true) {
                continue;
            }
            // �e�l�̕ϐ��ւ̊i�[
            var field = setValues[j][Constants.NS_FIELD];
            var fieldTemp = setValues[j][Constants.NS_FIELD_TEMP];
            var fieldType = setValues[j][Constants.NS_FIELDTYPE].split('|')[0]; // �t�B�[���h�̃^�C�v
			var selectRecord = setValues[j][Constants.NS_FIELDTYPE].split('|')[1];// ���Y�t�B�[���h�̒l��ݒ肷�邽�߂ɁA�������郌�R�[�h�^�C�v
			var selectFilter = setValues[j][Constants.NS_FIELDTYPE].split('|')[2];// ���Y�t�B�[���h�̒l��ݒ肷�邽�߂ɁA�������郌�R�[�h�^�C�v�̃t�B���^�[�p�t�B�[���h
			var lookupField = setValues[j][Constants.NS_FIELDTYPE].split('|')[3]; // ���w��̏ꍇ�́A����ID���擾����A�w�肷��ꍇ�́A���̃t�B�[���h���g�p����
//            var fieldType = setValues[j][Constants.NS_FIELDTYPE].split('|')[0]; // �t�B�[���h�̃^�C�v
//            var selectRecord = setValues[j][Constants.NS_FIELDTYPE].split('|')[1];// ���Y�t�B�[���h�̒l��ݒ肷�邽�߂ɁA�������郌�R�[�h�^�C�v
//            var selectFilter = setValues[j][Constants.NS_FIELDTYPE].split('|')[2];// ���Y�t�B�[���h�̒l��ݒ肷�邽�߂ɁA�������郌�R�[�h�^�C�v�̃t�B���^�[�p�t�B�[���h
//            var lookupField = setValues[j][Constants.NS_FIELDTYPE].split('|')[3]; // ���w��̏ꍇ�́A����ID���擾����A�w�肷��ꍇ�́A���̃t�B�[���h���g�p����
            var location;
            sublist = setValues[j][Constants.NS_SUBLIST];
            subfield = setValues[j][Constants.NS_SUBFIELD];
         // / �e�����ɂ��l�̃Z�b�g
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
                // sublist�ɒl���Z�b�g
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
                // record�I�u�W�F�N�g�̃C���X�^���X�ɁA���͂���f�[�^���Z�b�g
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
     * select�^�̒l���擾��������֐�
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
