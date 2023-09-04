/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount 
 *
 *
 * テストURL：https://debugger.na0.netsuite.com/app/site/hosting/restlet.nl?script=956&deploy=1&recordData={recordData:%20[{%22caseNo%22:%22CS02%22,%22foreignId%22:%22T430080%22,%22item%22:%22T430080%22,%22class%22:%22T430080%22},{%22caseNo%22:%22CS02%22,%22foreignId%22:%22T440080%22,%22item%22:%22T440080%22,%22class%22:%22T440080%22},{%22caseNo%22:%22CS02%22,%22foreignId%22:%22T450080%22,%22item%22:%22T450080%22,%22class%22:%22T450080%22}]}
 * JSONのデータを引数として取得して、カスタマイズレコードに保存する。（JSON格納）
 */
define(['N/search', "N/runtime", "N/email", "N/task", "N/https", 'N/record', './Common_2_Data_Setting', 'N/log'],

function(search, runtime, email, task, https, record, tableTypeObj, log) {

    /**
     * Function called upon sending a GET request to the RESTlet.
     * 
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all
     * supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request
     * Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {
    	log.audit("INFO", "OCIデータ受信開始");
    	var resultData = dataConversion(requestParams);
    	if (resultData.status == 1) {
    		log.audit("INFO", "OCIデータ受信終了");
    		return resultData;
    	}
        return setData(resultData.joinId, resultData.recordData, requestParams.caseNo);

    }

    /**
     * Function called upon sending a PUT request to the RESTlet.
     * 
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request
     * Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be
     * a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request
     * Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPut(requestBody) {

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
    	log.audit("INFO", "OCIデータ受信開始");
    	log.audit({
    		title: 'doPost - requestBody',
    		details: requestBody
    	});
    	log.audit({
    		title: 'doPost - requestBody',
    		details: JSON.stringify(requestBody)
    	});
    	var resultData = dataConversion(requestBody);
    	log.debug({
    		title: 'doPost - resultData',
    		details: JSON.stringify(resultData)
    	});
    	if (resultData.status == 1) {
    		log.audit("INFO", "OCIデータ受信終了");
    		return resultData;
    	}
        return setData(resultData.joinId, resultData.recordData, requestBody.caseNo);
    }

    /**
     * Function called upon sending a DELETE request to the RESTlet.
     * 
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all
     * supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request
     * Content-Type is 'application/json'
     * @since 2015.2
     */
    function doDelete(requestParams) {
    	
    }

    return {
        'get' : doGet,
        put : doPut,
        post : doPost,
        'delete' : doDelete
    };
    function dataConversion(dataJSON) {
    	var caseNo = dataJSON.caseNo;
    	var masterTableName = tableTypeObj.DataRecordTypes.caseTable[caseNo];
    	if (masterTableName == undefined) {
			var errorMsg = tableTypeObj.DataRecordTypes.errorLogMapping['E_RLR_001'];
			log.error("ERROR", "E_RLR_001 " + errorMsg);
			var jsonData = {};
			jsonData.status = 1;
			jsonData.message = "E_RLR_001 " + errorMsg;
			return jsonData;
		}
    	
    	var objRecord = record.create({
            type : "customrecord_json_main",
            isDynamic : true
        });
    	objRecord.setValue({
            fieldId : 'custrecord_json_main_record',
            value : JSON.stringify(dataJSON)
        });
    	objRecord.setValue({
            fieldId : 'custrecord_json_main_processed',
            value : true
        });
        var recordId = objRecord.save({
            enableSourcing : false,
            ignoreMandatoryFields : false
        });
    	var masterTables = tableTypeObj.DataRecordTypes.masterTables;
    	var masterTable = masterTables[masterTableName];
    	var headers = [];
    	var bodys = [];
    	var keys = masterTable.keys;
		var vals = masterTable.vals;
    	for (var i = 0; i < vals.length; i++) {
    		var bufObj = {};
			var val = vals[i];
			for (var j = 0; j < keys.length; j++) {
                bufObj[keys[j]] = val[j];
            }
			if (bufObj[tableTypeObj.Constant.NS_SUBLIST] == "") {
				headers.push(bufObj[tableTypeObj.Constant.JSON_ITEM]);
			}
			else {
				bodys.push(bufObj[tableTypeObj.Constant.JSON_ITEM]);
			}
    	}
    	
    	var jsonData = {};
    	jsonData.recordData = [];
    	var recordDatas = dataJSON.record_data;
    	for (var m = 0; m < recordDatas.length; m++) {
    		var foreignId = m;
    		var recordData = recordDatas[m];
    		var recordLines = recordData.recordLine;
    		for (var p = 0; p < recordLines.length; p++) {
//                if (caseNo == "INSERT_SALESORDER" || caseNo == "INSERT_TRANSFERORDER") {
//    				if (recordLines[p].item_deleteflg == "T") {
//    					continue;
//    				}
//    				if (recordLines[p]['misi_deleteflg'] == '1') {
//    					continue;
//    				}
//    			}
    			var lineData = {};
        		lineData.caseNo = caseNo;
        		lineData.foreignId = m;
        		for (var n = 0; n < headers.length; n++) {
        			if (headers[n].split('|').length == 2) {
        				if (recordData[headers[n].split('|')[0]] === undefined || recordData[headers[n].split('|')[0]] == null || recordData[headers[n].split('|')[0]] === '') {
        					lineData[headers[n].split('|')[0]] = "";
                		} else {
        					lineData[headers[n].split('|')[0]] = recordData[headers[n].split('|')[0]];
        				}
        			}
        			else {
        				if (recordData[headers[n]] === undefined || recordData[headers[n]] == null || recordData[headers[n]] === '') {
        					lineData[headers[n]] = "";
                		} else {
        					lineData[headers[n]] = recordData[headers[n]];
        				}
        			}
        		}
    			var recordLine = recordLines[p];
    			for (var q = 0; q < bodys.length; q++) {
    				var bodysq = bodys[q].replace('DETAIL','');
    				if (recordLine[bodysq] === undefined || recordLine[bodysq] == null || recordLine[bodysq] === '') {
    					lineData[bodys[q]] = "";
        			} else {
        				lineData[bodys[q]] = recordLine[bodysq];
        			}
    			}
    			jsonData.recordData.push(lineData);
    		}
    	}
    	jsonData.joinId = recordId;
    	log.debug({
    		title: 'dataConversion - jsonData',
    		details: JSON.stringify(jsonData)
    	});
    	return jsonData;
    };
    // メイン関数（GETおよびPOSTで設定）
    function setData(joinId, dataJSON, caseNo) {
        var recordId = "";
        try {
            var error;
            var status = '';
            var response = [];
            inputData = JSON.stringify(dataJSON);// オブジェクトから文字列に変換する
            // DBに保存する
            var objRecord = record.create({
                type : "customrecord_json_main",
                isDynamic : true
            });
            // json値をフィールドに設定する
            objRecord.setValue({
                fieldId : 'custrecord_json_main_record',
                value : "{\"recordData\":" + inputData + "}"
            });
            objRecord.setValue({
                fieldId : 'custrecord_json_main_joinid',
                value : joinId
            });
            recordId = objRecord.save({
                enableSourcing : false,
                ignoreMandatoryFields : false
            });
            var params = {};
            var prameterKey = 'custscript_json_id';
            params[prameterKey] = recordId;
            if (caseNo == 'INSERT_SALESORDER') {
            	// 定期バッチを実行する
                var mapReduceScriptId = 'customscript_json_parse_mr_step1';

                // Create a map/reduce task
                var mrTask = task.create({
                    taskType : task.TaskType.MAP_REDUCE,
                    scriptId : mapReduceScriptId,
                    deploymentId : 'customdeploy_json_parse_mr_step1',
                    params : params
                });
                // Submit the map/reduce task
                var mrTaskId = mrTask.submit();
            } else if (caseNo == 'INSERT_TRANSFERORDER') {
            	// 定期バッチを実行する
                var mapReduceScriptId = 'customscript_json_parse_mr_step1';

                // Create a map/reduce task
                var mrTask = task.create({
                    taskType : task.TaskType.MAP_REDUCE,
                    scriptId : mapReduceScriptId,
                    deploymentId : 'customdeploy_json_parse_mr_step1_dup1',
                    params : params
                });
                // Submit the map/reduce task
                var mrTaskId = mrTask.submit();
            }
            var jsonDataOk = {};
            jsonDataOk.status = 0;
			return jsonDataOk;
        } catch (ex) {
            if (recordId != "") {
                record.delete({
                    type: 'customrecord_json_main',
                    id: recordId,
                });
            }
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
        	var errorMsg = tableTypeObj.DataRecordTypes.errorLogMapping['E_RLR_003'];
			log.error("ERROR", "E_RLR_003 " + errorMsg + ": " + ex.message);
			var jsonData = {};
			jsonData.status = 1;
			jsonData.message = "E_RLR_003 " + errorMsg + ": " + ex.message;
			return jsonData;
        } finally {
        	log.audit("INFO", "OCIデータ受信終了");
        }
    };
    
});