/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount 
 *
 *
 * テストURL：https://debugger.na0.netsuite.com/app/site/hosting/restlet.nl?script=956&deploy=1&recordData={recordData:%20[{%22caseNo%22:%22CS02%22,%22foreignId%22:%22T430080%22,%22item%22:%22T430080%22,%22class%22:%22T430080%22},{%22caseNo%22:%22CS02%22,%22foreignId%22:%22T440080%22,%22item%22:%22T440080%22,%22class%22:%22T440080%22},{%22caseNo%22:%22CS02%22,%22foreignId%22:%22T450080%22,%22item%22:%22T450080%22,%22class%22:%22T450080%22}]}
 * JSONのデータを引数として取得して、カスタマイズレコードに保存する。（JSON格納）
 */
define(['N/search', 'N/format', '../Restlet/Common_2_Data_Setting', './rl_send_functions', '../Restlet/Customform_Data_Setting', 'N/email', 'N/log'], function(search, format, searchTypeObj, outputSetting, customformDataObj, email, log) {
    function doGet(requestParams) {
        return selectData(requestParams);
    }
    
    function doPut(requestBody) {
    }
    
    function doPost(requestBody) {
        return selectData(requestBody);
    }
    
    function doDelete(requestParams) {
    }
    return {
        'get' : doPut,
        put : doPut,
        post : doPost,
        'delete' : doDelete
    };
    /**
     * Automatically enable the Time Tracking Integration flag
     */
	function selectData(dataJSON) {
		log.audit("INFO", "保存検索開始");
		var caseNo = dataJSON.caseNo;
      log.audit("INFO", "caseNo:"+caseNo);
		var searchObj = searchTypeObj.DataRecordTypes.outputTables[caseNo];
		if (searchObj == undefined) {
			var errorMsg = searchTypeObj.DataRecordTypes.errorLogMapping['E_RLS_001'];
			log.error("ERROR", "E_RLS_001 " + errorMsg);
			var jsonData = {};
			jsonData.status = 1;
			jsonData.message = "E_RLS_001 " + errorMsg;
			return jsonData;
		}
		try
        {
			var methodName = searchObj.search.name;
			var strType = methodName.substring(0, 5);
			if (strType == "FUNC_") {
				var result = specialFunc(dataJSON, searchObj, methodName);
				return result;
			}
			else if (strType == "SQLS_")
			{
				var result = sqlsQuery(dataJSON, searchObj, methodName);
		        return result;
			}
			else
			{
				var result = saveQuery(dataJSON, searchObj, methodName);
		        return result;
			}
        }
		catch(e)
		{
			var errorLog = searchObj.search.errorlog;
			var errorType = "";
			var errorName = "";
			if (errorLog != undefined && errorLog.length > 0) {
				errorType = errorLog[0];
				errorName = errorLog[1];
			}
			log.error("ERROR", "E_SYS_001 " + e.message);
			var jsonData = {};
			jsonData.status = 1;
			jsonData.message = "E_SYS_001 " + e.message;
			return jsonData;
		}
		finally
        {
            log.audit("INFO", "保存検索終了");
        }
    };
    
    function specialFunc(dataJSON, searchObj, methodName) {
    	var errorLog = searchObj.search.errorlog;
		var errorType = "";
		var errorName = "";
		var errorKey = "";
		if (errorLog != undefined && errorLog.length > 0) {
			errorType = errorLog[0];
			errorName = errorLog[1];
			errorKey = errorLog[2];
		}
		dataJSON.error_type = errorType;
		dataJSON.error_name = errorName;
		dataJSON.error_key = errorKey;
		dataJSON.error_Msg = searchTypeObj.DataRecordTypes.errorLogMapping[errorKey];
		var methodNameFUNC = methodName.substring(5);
		var result = outputSetting[methodNameFUNC](dataJSON);
		return result;
    };
    
    function sqlsQuery(dataJSON, searchObj, methodName) {
    	var checknames = searchObj.checks.checkname;
		for (var a = 0; a < checknames.length; a++) {
			var checkname = checknames[a].split("-");
			var name = dataJSON[checkname[0]];
			if (checkname[1] == "date") {
				if (checkname[2] == "nullandformat") {
					if (name === undefined || name == null || name === '') {
						var errorLog = searchObj.search.errorlog;
						var errorType = "";
						var errorName = "";
						if (errorLog != undefined && errorLog.length > 0) {
							errorType = errorLog[0];
							errorName = errorLog[1];
						}
						var errorMsg = searchTypeObj.DataRecordTypes.errorLogMapping['E_BUS_002'];
						errorMsg = errorMsg.replace('{param1}', name);
						log.error("ERROR", "E_BUS_002 " + errorMsg);
						var jsonData = {};
						jsonData.status = 1;
						jsonData.message = "E_BUS_002 " + errorMsg;
						return jsonData;
					}
					else {
						var flag = isDatetime(name);
						if (!flag) {
							var errorLog = searchObj.search.errorlog;
							var errorType = "";
							var errorName = "";
							if (errorLog != undefined && errorLog.length > 0) {
								errorType = errorLog[0];
								errorName = errorLog[1];
							}
							var errorMsg = searchTypeObj.DataRecordTypes.errorLogMapping['E_BUS_002'];
							errorMsg = errorMsg.replace('{param1}', name);
							log.error("ERROR", "E_BUS_002 " + errorMsg);
							var jsonData = {};
							jsonData.status = 1;
							jsonData.message = "E_BUS_002 " + errorMsg;
							return jsonData;
						}
					}
				}
			}
		}
		var methodNameSQLS = methodName.substring(5);
		var oldTableObjects = [];
		
		var searchFilters = [];
		var params = searchObj.search.params;
		for (var m = 0; m < params.length; m++) {
			var arrayparams = params[m].split("-");
			if (arrayparams.length == 1) {
				searchFilters.push(arrayparams[0]);
			}
			else if (arrayparams.length == 4) {
				if (arrayparams[0] == "invalid") {
					searchFilters.push([arrayparams[1],arrayparams[2],arrayparams[3]]);
				}
				else if (arrayparams[0] == "text") {
					var textFilter = "formulatext: TO_CHAR({" + arrayparams[1] + "})";
					var textCondition = arrayparams[2];
					var textparams = arrayparams[3];
					var textValue = "";
					if (textparams.substring(0,1)=="{") {
						textValue = dataJSON[arrayparams[3].substring(1, arrayparams[3].length-1)];
					}
					else {
						textValue = arrayparams[3];
					}
					searchFilters.push([textFilter,textCondition,textValue]);
				}
				else if (arrayparams[0] == "number"){
					var textparams = arrayparams[3];
					var textValue = "";
					if (textparams.substring(0,1)=="{") {
						textValue = dataJSON[arrayparams[3].substring(1, arrayparams[3].length-1)];
					}
					else {
						textValue = arrayparams[3];
					}
					searchFilters.push([arrayparams[1],arrayparams[2],textValue]);
				}
				else if (arrayparams[0] == "date") {
					var param1 = arrayparams[1];
					if (param1.substring(0,1)=="{") {
						param1 = dataJSON[param1.substring(1, param1.length-1)];
					}
					searchFilters.push(["formulanumeric: TO_DATE('" + param1 + "','yyyy-MM-dd HH24:MI:SS')-{" + arrayparams[3] + "}",arrayparams[2],"0"]);
				}
			}
		}
		var paramnull = searchObj.search.paramnull;
		for (var n = 0; n < paramnull.length; n++) {
			var arrayparamsnull = paramnull[n].split("-");
			var nullValue = dataJSON[arrayparamsnull[0]];
			if (nullValue === undefined || nullValue == null || nullValue === '') {
				var searchFiltersnull = [];
				if (arrayparamsnull.length == 1) {
					searchFiltersnull.push(arrayparamsnull[0]);
				}
				else if (arrayparamsnull.length == 5) {
					if (arrayparamsnull[1] == "invalid") {
						searchFiltersnull.push([arrayparamsnull[2],arrayparamsnull[3],arrayparamsnull[4]]);
					}
					else if (arrayparamsnull[1] == "text") {
						var textFilter = "formulatext: TO_CHAR({" + arrayparamsnull[2] + "})";
						var textCondition = arrayparamsnull[3];
						var textparams = arrayparamsnull[4];
						var textValue = "";
						if (textparams.substring(0,1)=="{") {
							textValue = dataJSON[arrayparamsnull[4].substring(1, arrayparamsnull[4].length-1)];
						}
						else {
							textValue = arrayparamsnull[4];
						}
						searchFiltersnull.push([textFilter,textCondition,textValue]);
					}
					else if (arrayparamsnull[1] == "number"){
						var textparams = arrayparamsnull[4];
						var textValue = "";
						if (textparams.substring(0,1)=="{") {
							textValue = dataJSON[arrayparamsnull[4].substring(1, arrayparamsnull[4].length-1)];
						}
						else {
							textValue = arrayparamsnull[4];
						}
						searchFiltersnull.push([arrayparamsnull[2],arrayparamsnull[3],textValue]);
					}
					else if (arrayparamsnull[1] == "date") {
						var param1 = arrayparamsnull[2];
						if (param1.substring(0,1)=="{") {
							param1 = dataJSON[param1.substring(1, param1.length-1)];
						}
						searchFilters.push(["formulanumeric: TO_DATE('" + param1 + "','yyyy-MM-dd HH24:MI:SS')-{" + arrayparams[4] + "}",arrayparams[3],"0"]);
					}
				}
				searchFilters = searchFiltersnull;
			}
		}
		
		var keys = searchObj.keys;
		var vals = searchObj.vals;
		for (var i = 0; i < vals.length; i++) {
			var bufObj = {};
			var val = vals[i];
			for (var j = 0; j < keys.length; j++) {
                bufObj[keys[j]] = val[j];
            }
			oldTableObjects.push(bufObj);
		}
		var tableObjects = orderby(oldTableObjects);
		var searchColumns = [];
		var jsonName = [];
		for (var k = 0; k < tableObjects.length; k++) {
			var ns_field = tableObjects[k][searchTypeObj.Constant.NS_FIELD];
			var ns_fieldType = tableObjects[k][searchTypeObj.Constant.NS_FIELDTYPE];
			var ns_dateFormat = tableObjects[k][searchTypeObj.Constant.NS_DATEFORMAT];
			jsonName.push(ns_field + "," + ns_fieldType + "," + ns_dateFormat);
			var json_item = tableObjects[k][searchTypeObj.Constant.JSON_ITEM];
			var keysort = tableObjects[k][searchTypeObj.Constant.NS_SORT];
			if (json_item != "") {
				var arrayitem = json_item.split(".");
				if (arrayitem.length == 2) {
					if (keysort == "ASC") {
						var location = search.createColumn({
				            name : arrayitem[1],
				            join : arrayitem[0],
				            sort: search.Sort.ASC
				        });
						searchColumns.push(location);
					}
					else if (keysort == "DESC") {
						var location = search.createColumn({
							name : arrayitem[1],
				            join : arrayitem[0],
				            sort: search.Sort.DESC
				        });
						searchColumns.push(location);
					}
					else if (keysort == "GROUP") {
						var location = search.createColumn({
							summary : "GROUP",
							name : arrayitem[1],
				            join : arrayitem[0]
				        });
						searchColumns.push(location);
					}
					else if (keysort == "ASCMAX") {
						var location = search.createColumn({
							summary : "MAX",
							name : arrayitem[1],
				            join : arrayitem[0],
				            sort: search.Sort.ASC
				        });
						searchColumns.push(location);
					}
					else {
						var location = search.createColumn({
							name : arrayitem[1],
				            join : arrayitem[0]
				        });
						searchColumns.push(location);
					}
				}
				else {
					if (keysort == "ASC") {
						var location = search.createColumn({
				            name : json_item,
				            sort: search.Sort.ASC
				        });
						searchColumns.push(location);
					}
					else if (keysort == "DESC") {
						var location = search.createColumn({
				            name : json_item,
				            sort: search.Sort.DESC
				        });
						searchColumns.push(location);
					}
					else if (keysort == "GROUP") {
						var location = search.createColumn({
							summary : "GROUP",
							name : json_item
				        });
						searchColumns.push(location);
					}
					else if (keysort == "ASCMAX") {
						var location = search.createColumn({
							summary : "MAX",
							name : json_item,
				            sort: search.Sort.ASC
				        });
						searchColumns.push(location);
					}
					else {
						var location = search.createColumn({
				            name : json_item
				        });
						searchColumns.push(location);
					}
				}
			}
		}
		
		var objSearch = search.create({
            type : methodNameSQLS,
            filters : searchFilters,
            columns : searchColumns
        });
		var columns = objSearch.columns;
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
        var jsonData = {};
        jsonData.status = 0;
        jsonData.record_data = [];
        var caseNo = dataJSON.caseNo;
        var itemTypes = [];
        if (caseNo == "CMB0202_ITEM") {
        	var joinsearchFilters = [];
			var joinsearchColumns = [];
			var itemTypeName = search.createColumn({
	            name : 'name'
	        });
			joinsearchColumns.push(itemTypeName);
			var itemTypeNum = search.createColumn({
	            name : 'custrecord_bkd_oci_item_type_num'
	        });
			joinsearchColumns.push(itemTypeNum);
			var joinobjSearch = search.create({
	            type : 'customrecord_bkd_item_type',
	            filters : joinsearchFilters,
	            columns : joinsearchColumns
	        });
			var joinrecode = joinobjSearch.run();
			var joinsearchResults = [];
	        if (joinrecode != null) {
	        	var joinresultIndex = 0;
	            var joinresultStep = 1000;
	            do {
	                var joinsearchlinesResults = joinrecode.getRange({
	                    start : joinresultIndex,
	                    end : joinresultIndex + joinresultStep
	                });

	                if (joinsearchlinesResults.length > 0) {
	                	joinsearchResults = joinsearchResults.concat(joinsearchlinesResults);
	                	joinresultIndex = joinresultIndex + joinresultStep;
	                }
	            } while (joinsearchlinesResults.length > 0);
	        }
        	itemTypes = joinsearchResults;
        }
        for (var m = 0; m < searchResults.length; m++) {
            var searchResult = searchResults[m];
            var lineData = {};
          	var flg = false;
            for (var n = 0; n < jsonName.length; n++) {
            	var arrayjsonName = jsonName[n].split(",");
            	
            	if (arrayjsonName[0] != "") {
            		var tablejoin = arrayjsonName[1].split("-");
            		if (tablejoin.length == 5) {
            			var joinvalue = "";
            			if (tablejoin[1] == "value") {
            				joinvalue = searchResult.getValue(columns[n]);
            			} else {
            				joinvalue = searchResult.getText(columns[n]);
            			}
            			if (joinvalue === undefined || joinvalue == null || joinvalue === '') {
            				lineData[arrayjsonName[0]] = "";
            			} else {
            				var val = "";
            		    	for (var i = 0; i < itemTypes.length; i++) {
            					var itemType = itemTypes[i];
            					var name = itemType.getValue('name');
            					if (name == joinvalue) {
            						val = itemType.getValue('custrecord_bkd_oci_item_type_num');
            						break;
            					}
            				}
            		    	lineData[arrayjsonName[0]] = val;
            			}
            		} else {
            			if (arrayjsonName[1] == "" || arrayjsonName[1] == "text") {
                			lineData[arrayjsonName[0]] = searchResult.getValue(columns[n]);
                		}
                		else if (arrayjsonName[1] == "number") {
                		    if (searchResult.getValue(columns[n]) === undefined || searchResult.getValue(columns[n]) == null || searchResult.getValue(columns[n]) == "") {
                				lineData[arrayjsonName[0]] = "";
                     	    }
                     	    else {
                     	    	lineData[arrayjsonName[0]] = parseInt(searchResult.getValue(columns[n]));
                     	    }
                		}
                	    else if (arrayjsonName[1] == "date") {
                			lineData[arrayjsonName[0]] = getDate(searchResult.getValue(columns[n]),arrayjsonName[2]);
                		}
                		else if (arrayjsonName[1] == "TF") {
                			if (searchResult.getValue(columns[n])) {
                				lineData[arrayjsonName[0]] = "1";
                			}
                			else {
                				lineData[arrayjsonName[0]] = "0";
                			}
                		}
                		else if (arrayjsonName[1] == "textname") {
                			
                			if (searchResult.getText(columns[n]) === undefined || searchResult.getText(columns[n]) == null || searchResult.getText(columns[n]) === '') {
                				lineData[arrayjsonName[0]] = "";
                			}
                			else {
                				lineData[arrayjsonName[0]] = searchResult.getText(columns[n]);
                			}
                		}
                		else if (arrayjsonName[1] == "decimal") {
                			if (searchResult.getValue(columns[n]) === undefined || searchResult.getValue(columns[n]) == null || searchResult.getValue(columns[n]) === '') {
                				lineData[arrayjsonName[0]] = "";
                			}
                			else {
                				if (arrayjsonName[2]) {
                					var str = searchResult.getValue(columns[n]);
                    				var val = Number((Number(str)).toFixed(Number(arrayjsonName[2])));
                    				lineData[arrayjsonName[0]] = val;
                				}
                				else {
                    				lineData[arrayjsonName[0]] = Number(searchResult.getValue(columns[n]));
                				}
                			}
                		}
                		else if (arrayjsonName[1] == "fix") {
                			lineData[arrayjsonName[0]] = arrayjsonName[2];
                		}
                        else if (arrayjsonName[1] == "changeand") {
                            if (searchResult.getValue(columns[n]) === undefined || searchResult.getValue(columns[n]) == null || searchResult.getValue(columns[n]) === '') {
                				lineData[arrayjsonName[0]] = "";
                			}
                			else {
                                var changeVal = searchResult.getValue(columns[n]).split(",");
                                if (changeVal.length > 1) {
                                    var strval = searchResult.getValue(columns[n]).replace(new RegExp(',',"gm"),'&,&');
                    			    lineData[arrayjsonName[0]] = "&" + strval +"&";
                                }
                                else {
                                    lineData[arrayjsonName[0]] = searchResult.getValue(columns[n]);
                                }
                			}
                		} else if (arrayjsonName[1] == "customform") {
                			// TODO
                            var customformVal = customformDataObj.DataRecordTypes.customformData[searchResult.getValue(columns[n])];
							if (customformVal === undefined || customformVal == null || customformVal === '')
							{
								var strname = searchResult.getValue('custrecord_djkk_prefectures');
								var strId = searchResult.id;
								var strmailId = searchResult.getValue('custrecord_djkk_email');
							    if(strname === undefined || strname == null || strname === ''){
					                strname = null;
				                }
							    log.debug({
							    	title: '住所内容不備 - rl_send',
							    	details: ''
							    });
								var subjectdata = "住所内容不備のご連絡";
								var maildata = "下記「DJ_納品先」に関して、ご入力いただいたの「都道府県」には不備があり、ご確認をお願い致します。 DJ_納品先「" + strname +  "」、内部ID:" + strId;
								if(!(strmailId === undefined || strmailId == null || strmailId === '')){
									sendMailFromNS("1", subjectdata, maildata,strmailId);
								}else{
									sendMailFromNS("1", subjectdata, maildata,["hongquan.yang@evangsol.co.jp", "m-mori@evangsol.co.jp"]);
								}
								flg = true;
							}
							else {
                                lineData[arrayjsonName[0]] = customformVal;
							}
                		}
            		}
            	}
            }
			if(!flg){
				jsonData.record_data.push(lineData);
			}
        }
        return jsonData;
    };

      function sendMailFromNS(datanum, subjectdata, data,toAddressArr) {
        var userId = -5;// runtime.getCurrentUser();

        //var toAddressArr = 'kailong.jiang@evangsol.co.jp';
        var parameterSubject = subjectdata;
        var parameterTxtarea = "エラー件数:" + datanum + "\r\n" + "エラー内容:\r\n";
        for (var i = 0; i < data.length; i++) {
        	parameterTxtarea = parameterTxtarea + data[i];
//        	if (i != data.length -1) {
//        		parameterTxtarea = parameterTxtarea + "\r\n";
//        	}
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

    function saveQuery(dataJSON, searchObj, methodName) {
    	var params = searchObj.search.params;
		var keys = searchObj.keys;
		var vals = searchObj.vals;
		var oldTableObjects = [];
		for (var i = 0; i < vals.length; i++) {
			var bufObj = {};
			var val = vals[i];
			for (var j = 0; j < keys.length; j++) {
                bufObj[keys[j]] = val[j];
            }
			oldTableObjects.push(bufObj);
		}
		var tableObjects = orderby(oldTableObjects);
		var searchFilters = [];
		if (params.length != 0)
		{
			// TODO
//		    searchFilters.push(['isinactive', 'is', 'F']);
//		    searchFilters.push('AND');
		}
		var searchColumns = [];
		var jsonName = [];
		for (var k = 0; k < tableObjects.length; k++) {
			var json_item = tableObjects[k][searchTypeObj.Constant.JSON_ITEM];
			var location = search.createColumn({
	            name : json_item
	        });
			searchColumns.push(location);
			var ns_field = tableObjects[k][searchTypeObj.Constant.NS_FIELD];
			var ns_fieldType = tableObjects[k][searchTypeObj.Constant.NS_FIELDTYPE];
			jsonName.push(ns_field + "," + ns_fieldType);
		}
		var objSearch = search.load({
            type : null,
            columns : searchColumns,
            filters : searchFilters,
            id : methodName
        });
		var columns = objSearch.columns;
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
        var jsonData = {};
        jsonData.status = 0;
        jsonData.record_data = [];
        for (var m = 0; m < searchResults.length; m++) {
            var searchResult = searchResults[m];
            var lineData = {};
            for (var n = 0; n < jsonName.length; n++) {
            	var arrayjsonName = jsonName[n].split(",");
            	if (arrayjsonName[0] != "") {
            		if (arrayjsonName[1] == "" || arrayjsonName[1] == "text") {
            			lineData[arrayjsonName[0]] = searchResult.getValue(columns[n]);
            		}
            		else if (arrayjsonName[1] == "number") {
            		    if (searchResult.getValue(columns[n]) === undefined || searchResult.getValue(columns[n]) == null || searchResult.getValue(columns[n]) == "") {
            				lineData[arrayjsonName[0]] = "";
                 	    }
                 	    else {
                 	    	lineData[arrayjsonName[0]] = parseInt(searchResult.getValue(columns[n]));
                 	    }
            		}
            		else if (arrayjsonName[1] == "TF") {
            			if (searchResult.getValue(columns[n])) {
            				lineData[arrayjsonName[0]] = "1";
            			}
            			else {
            				lineData[arrayjsonName[0]] = "0";
            			}
            		}
            	}
            }
            jsonData.record_data.push(lineData);
        }
        return jsonData;
    };
    
    function orderby(newTableObjects) {
    	for(var i=0;i<newTableObjects.length-1;i++){
            for(var j=0;j<newTableObjects.length-1-i;j++){
                if(newTableObjects[j][searchTypeObj.Constant.NS_SEARCH_COL_INX]>newTableObjects[j+1][searchTypeObj.Constant.NS_SEARCH_COL_INX]){
                    var temp=newTableObjects[j];
                    newTableObjects[j]=newTableObjects[j+1];
                    newTableObjects[j+1]=temp;
                }
            }
        }
        return newTableObjects;
    };
    
    function isDatetime(date){
    	var regex=/^(?:19|20)[0-9][0-9]-(?:(?:0[1-9])|(?:1[0-2]))-(?:(?:[0-2][1-9])|(?:[1-3][0-1])) (?:(?:[0-2][0-3])|(?:[0-1][0-9])):[0-5][0-9]:[0-5][0-9]$/;
    	if(!regex.test(date)){
    	    return false;
    	}
    	else {
    		return true;
    	}
    };
    
    function getDate(strdate, strType){
    	if (strdate === undefined || strdate == null || strdate === '') {
    		return "";
    	}
    	var strDate = "";
    	if (strType == 'yyyymmdd') {
    		var date = format.parse({
                value : strdate,
                type : format.Type.DATE
            });
        	
    		strDate = '' + date.getFullYear()  + pad(date.getMonth() + 1) + pad(date.getDate());
    	}
    	else {
    		var date = format.parse({
                value : strdate,
                type : format.Type.DATE
            });
        	
    		strDate = '' + date.getFullYear() + "年" + pad(date.getMonth() + 1) + "月" + pad(date.getDate())
                       + "日 " + pad(date.getHours()) + "時" + pad(date.getMinutes()) + "分";
    	}
    	return strDate;
    };
    
    function pad(v) {
        if (v >= 10) {
            return v;
        } else {
            return "0" + v;
        }
    };
});
