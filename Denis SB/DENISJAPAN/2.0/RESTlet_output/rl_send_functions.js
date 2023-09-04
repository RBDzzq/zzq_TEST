/**
 * 概要：各ケース番号に対するJSONのデータの出力のため、保存検索の作成して、実行するモジュールです。
 * 
 * @NApiVersion 2.x
 */
define([ 'N/search', 'N/format', 'N/record', '../Common/common', '../Common/denis_common','../Restlet/Customform_Data_Setting' , 'N/email'], function(search, format, record, buncommon,deniscommon,customformDataObj, email) {

    /**
     * ケース番号：O01：在庫数を取得する
     * @param params[0] アイテムの内部IDのリスト
     * @param params[1]　場所の内部IDのリスト
     */
	function master_address_getinfo(dataJSON) {
		var syncAt = dataJSON.sync_at;
		var errorType = dataJSON.error_type;
		var errorName = dataJSON.error_name;
		var errorKey = dataJSON.error_key;
		var errorMsg = dataJSON.error_Msg;
		errorMsg = errorMsg.replace('{param1}', syncAt);
    	if (syncAt === undefined || syncAt == null || syncAt === '') {
    		var jsonDataE = {};
    		jsonDataE.status = 1;
    		jsonDataE.message = errorKey + " " + errorMsg;
  	        return jsonDataE;
    	} else {
    		var flag = isDatetime(syncAt);
    		if (!flag) {
    			var jsonDataEE = {};
    			jsonDataEE.status = 1;
    			jsonDataEE.message = errorKey + " " + errorMsg;
      	        return jsonDataEE;
			}
    	}
    	
    	var stateCodeByName = getStateCodeByName();
    	
		var searchFilters = [];
		searchFilters.push(["formulanumeric: TO_DATE('" + syncAt + "','yyyy-MM-dd HH24:MI:SS')-{datecreated}","lessthanorequalto","0"]);
		searchFilters.push("OR");
		searchFilters.push(["formulanumeric: TO_DATE('" + syncAt + "','yyyy-MM-dd HH24:MI:SS')-{lastmodifieddate}","lessthanorequalto","0"]);
		var searchColumns = [];
		var searchColumnsSub = [];
      	var id = search.createColumn({
			name : 'internalid'
        });
      	searchColumns.push(id);
		var addinternalid = search.createColumn({
			name : 'internalid',
            join : 'Address'
        });
		searchColumns.push(addinternalid);
		var email = search.createColumn({
			name : 'email',
        });
		searchColumns.push(email);
		var country = search.createColumn({
			name : 'country',
            join : 'Address'
        });
		searchColumns.push(country);
		var zipCode = search.createColumn({
			name : 'zipcode',
            join : 'Address'
        });
		searchColumns.push(zipCode);
		var state = search.createColumn({
			name : 'custrecord_djkk_address_state',
            join : 'Address'
        });
		searchColumns.push(state);

		var city = search.createColumn({
			name : 'city',
            join : 'Address'
        });
		searchColumns.push(city);
		var address1 = search.createColumn({
			name : 'address1',
            join : 'Address'
        });
		searchColumns.push(address1);
		var address2 = search.createColumn({
			name : 'address2',
            join : 'Address'
        });
		searchColumns.push(address2);
		var fax = search.createColumn({
			name : 'custrecord_djkk_address_fax',
            join : 'Address'
        });
		searchColumns.push(fax);
		var addressee = search.createColumn({
			name : 'addressee',
            join : 'Address'
        });
		searchColumns.push(addressee);
		var attention = search.createColumn({
			name : 'attention',
            join : 'Address'
        });
		searchColumns.push(attention);
		var addressphone = search.createColumn({
			name : 'addressphone',
            join : 'Address'
        });
		searchColumns.push(addressphone);
      	var state = search.createColumn({
			name : 'custrecord_djkk_address_state',
            join : 'Address'
        });
		searchColumns.push(state);
		var isinactive = search.createColumn({
            name : 'isinactive'
        });
		searchColumns.push(isinactive);
		searchColumnsSub.push(isinactive);
		var datecreated = search.createColumn({
            name : 'datecreated'
        });
		searchColumns.push(datecreated);

		var lastmodifieddate = search.createColumn({
            name : 'lastmodifieddate'
        });
		searchColumns.push(lastmodifieddate);

		var searchResultsCus = getTableInfo('customer',searchFilters,searchColumns);
		var searchFiltersSub = [];
		searchFiltersSub.push(["formulanumeric: TO_DATE('" + syncAt + "','yyyy-MM-dd HH24:MI:SS')-{systemnotes.date}","lessthanorequalto","0"]);
		var searchColumnsSub = [];
		var idSub = search.createColumn({
			name : 'internalid',
			summary : "GROUP"
        });
		searchColumnsSub.push(idSub);
      	var emailB = search.createColumn({
			summary: "MAX",
			name : 'email',
            sort: search.Sort.ASC
        });
      	searchColumnsSub.push(emailB);
		var addinternalidSub = search.createColumn({
			summary: "MAX",
			name : 'internalid',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(addinternalidSub);
		var countrySub = search.createColumn({
			summary: "MAX",
			name : 'country',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(countrySub);
		var zipSub = search.createColumn({
			summary: "MAX",
			name : 'zip',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(zipSub);
		var citySub = search.createColumn({
			summary: "MAX",
			name : 'city',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(citySub);
		var stateSub = search.createColumn({
			summary: "MAX",
			name : 'custrecord_djkk_address_state',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(stateSub);
		var address1Sub = search.createColumn({
			summary: "MAX",
			name : 'address1',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(address1Sub);
		var address2Sub = search.createColumn({
			summary: "MAX",
			name : 'address2',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(address2Sub);
		var faxSub = search.createColumn({
			summary: "MAX",
			name : 'custrecord_djkk_address_fax',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(faxSub);
		var addresseeSub = search.createColumn({
			summary: "MAX",
			name : 'addressee',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(addresseeSub);
		var attentionSub = search.createColumn({
			summary: "MAX",
			name : 'attention',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(attentionSub);
		var phone = search.createColumn({
			summary: "MAX",
			name : 'phone',
            join : 'Address',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(phone);
      	var stateSub = search.createColumn({
			summary: "MAX",
			name : 'custrecord_djkk_address_state',
            join : 'Address',
            sort: search.Sort.ASC
        });
      	searchColumnsSub.push(stateSub);

		var lastdate = search.createColumn({
			summary: "MAX",
            name : 'date',
            join : 'systemnotes',
            sort: search.Sort.ASC
        });
		searchColumnsSub.push(lastdate);
        var legalNameColumn = search.createColumn({
			summary: 'MAX',
			name: 'legalname',
			sort:search.Sort.ASC
		});
		searchColumnsSub.push(legalNameColumn);
		var searchResultsSub = getTableInfo('subsidiary',searchFiltersSub,searchColumnsSub);
		var jsonData = {};
        jsonData.status = 0;
        jsonData.record_data = [];
		if(searchResultsCus.length > 0){
			for (var m = 0; m < searchResultsCus.length; m++) {
				var searchResultAll = searchResultsCus[m];
				var tmpId = searchResultAll.getValue(addinternalid);
				if (tmpId == null || tmpId == '') {
					continue;
				}
				var lineData = {};
				lineData.addrid = searchResultAll.getValue(addinternalid);
				lineData.country = searchResultAll.getValue(country);
				lineData.zip = searchResultAll.getValue(zipCode);
				lineData.state = searchResultAll.getValue(state);
				lineData.city = searchResultAll.getValue(city);
				lineData.addr1 = searchResultAll.getValue(address1);
				lineData.addr2 = searchResultAll.getValue(address2);
				lineData.custrecord_djkk_address_fax = searchResultAll.getValue(fax);
				lineData.addressee = searchResultAll.getValue(addressee);
				lineData.attention = searchResultAll.getValue(attention);
              
				lineData.addrphone = searchResultAll.getValue(addressphone);

				log.debug({
					title: 'address - state',
					details: searchResultAll.getValue(state)
				});
				
//				var customformVal = customformDataObj.DataRecordTypes.customformData[searchResultAll.getValue(state)];

				var customformVal = stateCodeByName[searchResultAll.getValue(state)];
				if(customformVal === undefined || customformVal == null || customformVal === ''){

					if (lineData.country != 'JP' && (lineData.state == null || lineData.state == '')) {
						lineData.prefid = '';
					} else {
						var strname = searchResultAll.getValue(state);
						var strId = searchResultAll.getValue(addinternalid);;
						var strmailId = searchResultAll.getValue(email);
						var subjectdata = "住所内容不備のご連絡";
						if(strname === undefined || strname == null || strname === ''){
							strname = null;
						}
						var maildata = ["下記「顧客住所」に関して、ご入力いただいたの「都道府県」には不備があり、ご確認をお願い致します。 顧客「" + strname +  "」、内部ID:" + searchResultAll.getValue(id)];
						//log.debug("title", subjectdata);
						//log.debug("value", maildata);
						// if(!(strmailId === undefined || strmailId == null || strmailId === '')){
						// 	sendMailFromNS("1", subjectdata, maildata,strmailId);
						// }else{
						// 	sendMailFromNS("1", subjectdata, maildata,"hongquan.yang@evangsol.co.jp");
						// }
						sendMailFromNS("1", subjectdata, maildata,"hongquan.yang@evangsol.co.jp");
						continue;
					}
				}else{
					lineData.prefid = customformVal;
				}
				
				
				lineData.createtime = getDate(searchResultAll.getValue('datecreated'));
				lineData.createuser = "netsuite";
				lineData.lastupdatetime = getDate(searchResultAll.getValue('lastmodifieddate'));
				lineData.updateuser = "netsuite";
				if (searchResultAll.getValue('isinactive')) {
					lineData.deleteflg = "1";
	    		}
	    		else {
	    			lineData.deleteflg = "0";
	    		}

				jsonData.record_data.push(lineData);
			}
		}
		if (searchResultsSub.length > 0) {
            for (var i = 0; i < searchResultsSub.length; i++) {
            	var searchResults = searchResultsSub[i];
            	
				var tmpLegalName = searchResults.getValue(legalNameColumn);

				var reg1 = RegExp(/DENIS JAPAN K.K./);
				var reg2 = RegExp(/NICHIFUTSU BOEKI K.K./);
				var reg3 = RegExp(/UNION LIQUORS K.K./);
				var reg4 = RegExp(/Denis Japan株式会社/);
				var reg5 = RegExp(/日仏貿易株式会社/);
				var reg6 = RegExp(/ユニオンリカーズ株式会社/);
				if((!tmpLegalName.match(reg1)) && (!tmpLegalName.match(reg2)) && (!tmpLegalName.match(reg3)) && (!tmpLegalName.match(reg4)) && (!tmpLegalName.match(reg5)) && (!tmpLegalName.match(reg6))){
					continue;
				}
              
            	var tmpId = searchResults.getValue(addinternalidSub);
            	if (tmpId == null || tmpId == '') {
            		continue;
            	}
            	var lineDataAll = {};
		      	lineDataAll.addrid = searchResults.getValue(addinternalidSub);
		        lineDataAll.country = searchResults.getValue(countrySub);
		        lineDataAll.zip = searchResults.getValue(zipSub);
		        lineDataAll.state = searchResults.getValue(stateSub);
		        lineDataAll.city = searchResults.getValue(citySub);
		        lineDataAll.addr1 = searchResults.getValue(address1Sub);
		        lineDataAll.addr2 = searchResults.getValue(address2Sub);
		        lineDataAll.custrecord_djkk_address_fax = searchResults.getValue(faxSub);
		        lineDataAll.addressee = searchResults.getValue(addresseeSub);
		        lineDataAll.attention = searchResults.getValue(attentionSub);
		        lineDataAll.addrphone = searchResults.getValue(phone);
//			    var customformValB = customformDataObj.DataRecordTypes.customformData[searchResults.getValue(stateSub)];

				var customformValB = stateCodeByName[searchResults.getValue(stateSub)];
				if(customformValB === undefined || customformValB == null || customformValB === ''){
					var strnameB = searchResults.getValue(stateSub);
					var strIdB = searchResults.getValue(idSub);
					var strmailIdB = searchResults.getValue(emailB);
					if(strnameB === undefined || strnameB == null || strnameB === ''){
						strnameB = null;
					}
					log.debug({
						title: '住所内容不備 - rl_send_functions',
						details: ''
					});
					var subjectdataB = "住所内容不備のご連絡";
					var maildataB = ["下記「DJ_納品先」に関して、ご入力いただいたの「都道府県」には不備があり、ご確認をお願い致します。 DJ_納品先「" + strnameB +  "」、内部ID:" + strIdB];
					
					// if(!(strmailIdB === undefined || strmailIdB == null || strmailIdB === '')){
					// 	sendMailFromNS("1", subjectdataB, maildataB,strmailIdB);
					// }else{
					// 	sendMailFromNS("1", subjectdataB, maildataB,"hongquan.yang@evangsol.co.jp");
					// }
					sendMailFromNS("1", subjectdataB, maildataB,"hongquan.yang@evangsol.co.jp");
					continue;
				}else{
					lineDataAll.prefid = customformValB;
				}

			    lineDataAll.createtime = getDate(searchResults.getValue(lastdate));
			    lineDataAll.createuser = "netsuite";
			    lineDataAll.lastupdatetime = getDate(searchResults.getValue(lastdate));
			    lineDataAll.updateuser = "netsuite";
				if (searchResults.getValue('isinactive')) {
					lineDataAll.deleteflg = "1";
			  	}
			  	else {
			  		lineDataAll.deleteflg = "0";
			  	}
				jsonData.record_data.push(lineDataAll);
          	}
		}
		return jsonData;
	};

	function master_location_getinfo(dataJSON) {
		var syncAt = dataJSON.sync_at;
		var errorType = dataJSON.error_type;
		var errorName = dataJSON.error_name;
		var errorKey = dataJSON.error_key;
		var errorMsg = dataJSON.error_Msg;
		errorMsg = errorMsg.replace('{param1}', syncAt);
    	if (syncAt === undefined || syncAt == null || syncAt === '') {
    		var jsonDataE = {};
    		jsonDataE.status = 1;
    		jsonDataE.message = errorKey + " " + errorMsg;
  	        return jsonDataE;
    	} else {
    		var flag = isDatetime(syncAt);
    		if (!flag) {
    			var jsonDataEE = {};
    			jsonDataEE.status = 1;
    			jsonDataEE.message = errorKey + " " + errorMsg;
      	        return jsonDataEE;
			}
    	}
		var searchFiltersFirst = [];
		var searchColumnsFirst = [];
		var inid = search.createColumn({
			name : 'internalid'
        });
		searchColumnsFirst.push(inid);
		var nameTmp = search.createColumn({
			name : 'namenohierarchy'
        });
		searchColumnsFirst.push(nameTmp);
		var searchResults = getTableInfo('location',searchFiltersFirst,searchColumnsFirst);

		var locationIdByName = {};
		
		for (var i = 0; i < searchResults.length; i++) {
			var tmpId = searchResults[i].id;
			var tmpName = searchResults[i].getValue({name: 'namenohierarchy'});
			
			if (!locationIdByName.hasOwnProperty(tmpName.toString())) {
				locationIdByName[(tmpName.toString())] = tmpId;
			}
		}
		
		var subsidiaryIds = getSubsidiaryIds(true);
		
		var searchFilters = [];
		searchFilters.push(["formulanumeric: TO_DATE('" + syncAt + "','yyyy-MM-dd HH24:MI:SS')-{systemnotes.date}","lessthanorequalto","0"]);
		var tmpFilters = [];
		for (var i = 0; i < subsidiaryIds.length; i++) {
			tmpFilters.push(['subsidiary', 'is', (subsidiaryIds[i].toString())]);
			if (i != (subsidiaryIds.length - 1)) {
				tmpFilters.push('or');	
			}
		}
		searchFilters.push('and');
		searchFilters.push(tmpFilters);
		var searchColumns = [];
		var internalid = search.createColumn({
			name : 'internalid',
			summary : "GROUP"
        });
		searchColumns.push(internalid);
		var name = search.createColumn({
			summary: "MAX",
			name : 'name',
            sort: search.Sort.ASC
        });
		searchColumns.push(name);
		var subsidiary = search.createColumn({
			summary: "MAX",
			name : 'subsidiary',
            sort: search.Sort.ASC
        });
		searchColumns.push(subsidiary);
		var locationcostinggroup = search.createColumn({
			summary: "MAX",
			name : 'locationcostinggroup',
            sort: search.Sort.ASC
        });
		searchColumns.push(locationcostinggroup);
		var makeinventoryavailable = search.createColumn({
			summary: "MAX",
			name : 'makeinventoryavailable',
            sort: search.Sort.ASC
        });
		searchColumns.push(makeinventoryavailable);
		var uses = search.createColumn({
			summary: "MAX",
			name : 'usesbins',
            sort: search.Sort.ASC
        });
		searchColumns.push(uses);
		var addressid = search.createColumn({
			summary: "MAX",
			name : 'internalid',
			join : 'address',
            sort: search.Sort.ASC
        });
		searchColumns.push(addressid);
		var returnId = search.createColumn({
			summary: "MAX",
			name : 'internalid',
			join : 'returnaddress',
            sort: search.Sort.ASC
        });
		searchColumns.push(returnId);
//		var custrecord_djkk_tempcondtyp = search.createColumn({
//			summary: "MAX",
//			name : 'custrecord_djkk_tempcondtyp',
//            sort: search.Sort.ASC
//        });
//		searchColumns.push(custrecord_djkk_tempcondtyp);
		var custrecord_djkk_inventory_type = search.createColumn({
			summary: "MAX",
			name : 'custrecord_djkk_type_code',
			join : 'custrecord_djkk_inventory_type',
            sort: search.Sort.ASC
        });
		searchColumns.push(custrecord_djkk_inventory_type);
      	var custrecord_djkk_locationcustomerid = search.createColumn({
			summary: "MAX",
			name: 'entityid',
            join: 'custrecord_djkk_locationcustomerid',
            sort: search.Sort.ASC
        });
		searchColumns.push(custrecord_djkk_locationcustomerid);
		var custrecord_djkk_deliverydestid = search.createColumn({
			summary: "MAX",
			name : 'custrecord_djkk_deliverydestid',
            sort: search.Sort.ASC
        });
		searchColumns.push(custrecord_djkk_deliverydestid);

		var dj_locationsendtyp = search.createColumn({
			summary: "MAX",
			name : 'custrecord_djkk_type_code',
			join : 'custrecord_djkk_locationsendtyp',
            sort: search.Sort.ASC
        });
		searchColumns.push(dj_locationsendtyp);
//		var custrecord_djkk_2digitifcode = search.createColumn({
//			summary: "MAX",
//			name : 'custrecord_djkk_2digitifcode',
//            sort: search.Sort.ASC
//        });
//		searchColumns.push(custrecord_djkk_2digitifcode);
		var custrecord_djkk_wms_location_code = search.createColumn({
			summary: "MAX",
			name : 'custrecord_djkk_wms_location_code',
            sort: search.Sort.ASC
        });
		searchColumns.push(custrecord_djkk_wms_location_code);
		var lastdate = search.createColumn({
			summary: "MAX",
            name : 'date',
            join : 'systemnotes',
            sort: search.Sort.ASC
        });
		searchColumns.push(lastdate);
		var isinactive = search.createColumn({
			summary: "MAX",
			name : 'isinactive',
            sort: search.Sort.ASC
        });
		searchColumns.push(isinactive);
		var parentLocation = search.createColumn({
			summary: "MAX",
			name: 'internalid',
			join: 'custrecord_djkk_exsystem_parent_location',
			sort: search.Sort.ASC
		});
		searchColumns.push(parentLocation);
		var ecallocationinventoryflg = search.createColumn({
			summary: "MAX",
			name: 'custrecord_djkk_ecallocationinventoryflg',
			sort: search.Sort.ASC
		});
		searchColumns.push(ecallocationinventoryflg);
		var wmsMail = search.createColumn({
			summary: "MAX",
			name: 'custrecord_djkk_wms_mail',
			sort: search.Sort.ASC
		});
		searchColumns.push(wmsMail);
		
		var searchResultsData = getTableInfo('location',searchFilters,searchColumns);
		var searchFiltersAA = [];
		var searchColumnsAA = [];
		var inid = search.createColumn({
			name : 'internalid'
        });
		searchColumnsAA.push(inid);
		var nameAA = search.createColumn({
			name : 'name'
        });
		searchColumnsAA.push(nameAA);
		
		var searchResultsAA = getTableInfo('subsidiary',searchFiltersAA,searchColumnsAA);
		var jsonData = {};
        jsonData.status = 0;
        jsonData.record_data = [];
		if (searchResultsData.length > 0) {
 		    for (var i = 0; i < searchResultsData.length; i++) {
				var lineDataAll = {};
	            var searchResultsAll = searchResultsData[i];
	            var nameFirst = searchResultsAll.getValue(nameTmp);
	            var parentId = "";
                var nameNew = "";
				var locationnm = "";
	            if (nameFirst.indexOf(":") != -1) {
					var nameArr = nameFirst.split(':');
					nameNew = (nameArr[nameArr.length-2]).replace(/\s/g,"");
					locationnm = (nameArr[nameArr.length-1]).replace(/^[\s\n\t]+/g, "");
	            }else{
                    locationnm = nameFirst;
                }

	            lineDataAll.locationid = searchResultsAll.getValue(internalid);
	            lineDataAll.locationnm = locationnm;
	            
				var company = searchResultsAll.getValue(subsidiary);
               	var idTmp = "";
				for (var k = 0; k < searchResultsAA.length; k++) {

	                var searchResultsAAA = searchResultsAA[k];
	                var companyBB = searchResultsAAA.getValue("name");
					if (companyBB.indexOf(":") != -1) {
					var nameAA = companyBB.split(':');
					companyBB = (nameAA[nameAA.length-1]).replace(/^[\s\n\t]+/g, "");
	            }
	                if (!(company === undefined || company == null || company === '')) {
						if (company == companyBB) {
							idTmp = searchResultsAAA.getValue('internalid');
                            break;
						}
					}
	            }

				lineDataAll.parentid = searchResultsAll.getValue(parentLocation);
				lineDataAll.subsidiaryid = idTmp;
				lineDataAll.locationcostinggroup = searchResultsAll.getValue(locationcostinggroup);
				if (searchResultsAll.getValue(makeinventoryavailable))
				{
					lineDataAll.makeinventoryavailableflg = "1";
				} else {
				    lineDataAll.makeinventoryavailableflg = "0";
				}
				if (searchResultsAll.getValue(uses)) {
					lineDataAll.usebinsflg = "1";
				} else {
					lineDataAll.usebinsflg = "0";
				}
				lineDataAll.addrid = searchResultsAll.getValue(addressid);
				lineDataAll.returnaddrid = searchResultsAll.getValue(returnId);
//				lineDataAll.dj_tempcondtyp = searchResultsAll.getValue(custrecord_djkk_tempcondtyp);
				lineDataAll.dj_inventorytyp = searchResultsAll.getValue(custrecord_djkk_inventory_type);
				
          		lineDataAll.dj_customerid = searchResultsAll.getValue(custrecord_djkk_locationcustomerid);
          		var tmpDeliveryDestId = searchResultsAll.getValue(custrecord_djkk_deliverydestid);
                if (tmpDeliveryDestId.indexOf('|') > 0) {
                    tmpDeliveryDestId = tmpDeliveryDestId.split('|')[0];
                }
                lineDataAll.dj_deliverydestid = tmpDeliveryDestId;
				
				lineDataAll.dj_locationsendtyp = searchResultsAll.getValue(dj_locationsendtyp);
//				lineDataAll.dj_2digitifcode = searchResultsAll.getValue(custrecord_djkk_2digitifcode);
				lineDataAll.dj_wms_locationid = searchResultsAll.getValue(custrecord_djkk_wms_location_code);
				lineDataAll.dj_ecallocationinventoryflg = (searchResultsAll.getValue(ecallocationinventoryflg) ? '1' : '0');
				lineDataAll.dj_wms_mail = searchResultsAll.getValue(wmsMail);
				lineDataAll.createtime = getDate(searchResultsAll.getValue(lastdate));
				lineDataAll.createuser = "netsuite";
				lineDataAll.lastupdatetime = getDate(searchResultsAll.getValue(lastdate));
				lineDataAll.updateuser = "netsuite";
				if (searchResultsAll.getValue(isinactive)) {
					lineDataAll.deleteflg = "1";
				}
				else {
					lineDataAll.deleteflg = "0";
				}
				jsonData.record_data.push(lineDataAll);
            }
        }
    	
		return jsonData;
	};

	function master_item_getinfo(dataJSON) {
		var syncAt = dataJSON.sync_at;
		var errorType = dataJSON.error_type;
		var errorName = dataJSON.error_name;
		var errorKey = dataJSON.error_key;
		var errorMsg = dataJSON.error_Msg;
		errorMsg = errorMsg.replace('{param1}', syncAt);
    	if (syncAt === undefined || syncAt == null || syncAt === '') {
    		var jsonDataE = {};
    		jsonDataE.status = 1;
    		jsonDataE.message = errorKey + " " + errorMsg;
  	        return jsonDataE;
    	} else {
    		var flag = isDatetime(syncAt);
    		if (!flag) {
    			var jsonDataEE = {};
    			jsonDataEE.status = 1;
    			jsonDataEE.message = errorKey + " " + errorMsg;
      	        return jsonDataEE;
			}
    	}
    	
    	var allSubsidiaryIds = getSubsidiaryIds(true);
    	
    	var taxFilters = [];
    	var taxColumns = [];
    	
    	
		var searchFilters = [];
		searchFilters.push(["formulanumeric: TO_DATE('" + syncAt + "','yyyy-MM-dd HH24:MI:SS')-{systemnotes.date}","lessthanorequalto","0"]);
		searchFilters.push('AND');
		
        searchFilters.push(['subsidiary','anyof', allSubsidiaryIds]);
		var searchColumns = [];
		var internalidA = search.createColumn({
			name : 'internalid',
        });
	    searchColumns.push(internalidA);

		var subsidiary = search.createColumn({
			name : 'subsidiary',
        });
		searchColumns.push(subsidiary);

		var searchResultList = getTableInfo('item',searchFilters,searchColumns);
		var searchFiltersA = [];
		var searchColumnsA = [];

		var id = search.createColumn({
			name : 'itemid',
			summary : "GROUP"
        });
	    searchColumnsA.push(id);
		var lastdate = search.createColumn({
			summary: "MAX",
            name : 'date',
            join : 'systemnotes',
            sort: search.Sort.ASC
        });
		searchColumnsA.push(lastdate);
		var searchResultsListA = getTableInfo('item',searchFiltersA,searchColumnsA);

		var searchFiltersB = [];
		searchFiltersB.push(["formulanumeric: TO_DATE('" + syncAt + "','yyyy-MM-dd HH24:MI:SS')-{systemnotes.date}","lessthanorequalto","0"]);
		searchFiltersB.push('AND');
        searchFiltersB.push(['subsidiary','anyof',allSubsidiaryIds]);
        searchFiltersB.push('AND');
        searchFiltersB.push(['custitem_djkk_effective_recognition', 'is', true]);
		var searchColumnsB = [];

		var internalidB = search.createColumn({
			name : 'internalid',
        });
	    searchColumnsB.push(internalidB);
		var itemid = search.createColumn({
			name : 'itemid',
        });
	    searchColumnsB.push(itemid);
		var type = search.createColumn({
			name : 'type',
        });
		searchColumnsB.push(type);
		var displayname = search.createColumn({
			name : 'displayname',

        });
		searchColumnsB.push(displayname);
		var parent = search.createColumn({
			name : 'parent',
        });
		searchColumnsB.push(parent);
		var purchaseunit = search.createColumn({
			name : 'purchaseunit',
        });
		searchColumnsB.push(purchaseunit);
		var stockunit = search.createColumn({
			name : 'stockunit',
        });
		searchColumnsB.push(stockunit);
		var saleunit = search.createColumn({
			name : 'saleunit',
        });
		searchColumnsB.push(saleunit);
		var department = search.createColumn({
			name : 'department',
        });
		searchColumnsB.push(department);
		var upccode = search.createColumn({
			name : 'upccode',
        });
		searchColumnsB.push(upccode);
		var taxschedule = search.createColumn({
			name : 'taxschedule',
        });
		searchColumnsB.push(taxschedule);
		var custitem_djkk_deliverytemptyp = search.createColumn({
			name : 'custrecord_djkk_deliverytemptyp',
			join :'custitem_djkk_deliverytemptyp'
        });
		searchColumnsB.push(custitem_djkk_deliverytemptyp);
		searchColumnsB.push(search.createColumn({
			name: 'custitem_djkk_shelf_life'
		}))
		var custitem_djkk_perunitquantity = search.createColumn({
			name : 'custitem_djkk_perunitquantity',
        });
		searchColumnsB.push(custitem_djkk_perunitquantity);
		var custitem_djkk_tempcondperiodchangeflg = search.createColumn({
			name : 'custitem_djkk_tempcondperiodchangeflg',
        });
		searchColumnsB.push(custitem_djkk_tempcondperiodchangeflg);
		var custitem_djkk_inspection_level = search.createColumn({
			name : 'custitem_djkk_inspection_level',
        });
		searchColumnsB.push(custitem_djkk_inspection_level);
		var custitem_djkk_nextshipmentdesc = search.createColumn({
			name : 'custitem_djkk_nextshipmentdesc',
        });
		searchColumnsB.push(custitem_djkk_nextshipmentdesc);
		var custitem_djkk_organicflg = search.createColumn({
			name : 'custitem_djkk_organicflg',
        });
		searchColumnsB.push(custitem_djkk_organicflg);
		
		var isinactive = search.createColumn({
			name : 'isinactive',
        });
		searchColumnsB.push(isinactive);
		searchColumnsB.push(search.createColumn({
			name: 'unitstype'
		}));
		searchColumnsB.push(search.createColumn({
			name: 'custitem_djkk_product_code'
		}));
		searchColumnsB.push(search.createColumn({
			name: 'custrecord_djkk_type_code',
			join: 'custitem_djkk_shipment_unit_type'
		}));
		searchColumnsB.push(search.createColumn({
			name: 'custitem_djkk_no_bbd'
		}));
		searchColumnsB.push(search.createColumn({name: 'includechildren'}));
		// DJ_配送料フラグ
		searchColumnsB.push(search.createColumn({name: 'custitem_djkk_deliverycharge_flg'}));
		// DJ_品名（日本語）LINE1
		searchColumnsB.push(search.createColumn({name: 'custitem_djkk_product_name_jpline1'}));
		// DJ_品名（日本語）LINE2
		searchColumnsB.push(search.createColumn({name: 'custitem_djkk_product_name_jpline2'}));
		var searchResultsListB = getTableInfo('item',searchFiltersB,searchColumnsB);
		var jsonData = {};
        jsonData.status = 0;
        jsonData.record_data = [];

        var allUnitsType = [];
        var objTaxCodeInfo = getTaxCodeByName();
		if (searchResultsListB.length > 0) {
			for (var m = 0; m < searchResultsListB.length; m++ ) {
				var searchResultsAll = searchResultsListB[m];
              	var idTmp = searchResultsAll.getValue('internalid');
				var subsidiaryArr = [];
				var arrSubsidiaryName = [];
				for (var i = 0; i < searchResultList.length; i++) {
					var searchResultsAllData = searchResultList[i];
					var idOut = searchResultsAllData.getValue('internalid');
					var subId = searchResultsAllData.getValue(subsidiary);
					if (parseInt(idTmp) == parseInt(idOut)) {
						subsidiaryArr.push(subId);
						arrSubsidiaryName.push(searchResultsAllData.getText(subsidiary));
					}
				}
				
				if (subsidiaryArr.length > 1) {
					log.debug({
						title: 'master item arrSubsidiaryName',
						details: JSON.stringify(arrSubsidiaryName)
					});
				}
				
				if (arrSubsidiaryName.indexOf('1-2 DENIS JAPAN K.K.') >= 0 
						&& arrSubsidiaryName.indexOf('1-2 DENIS JAPAN K.K. : 2-1 NICHIFUTSU BOEKI K.K.') < 0
						&& arrSubsidiaryName.indexOf('1-2 DENIS JAPAN K.K. : 2-1 NICHIFUTSU BOEKI K.K. : 3-1 UNION LIQUORS K.K.') < 0) {
					var flgIncludeChildren = searchResultsAll.getValue({name: 'includechildren'});
					
					if (!flgIncludeChildren) {
						continue;
					}
				}
				
				if (subsidiaryArr.length > 1) {
					log.debug({
						title: 'master item arrSubsidiaryName',
						details: JSON.stringify(arrSubsidiaryName)
					});
				}
				
				var strVal;
				subsidiaryArr = subsidiaryArr.join(',');
				if (subsidiaryArr.length > 1) {
					strVal = subsidiaryArr.replace(new RegExp(',',"gm"),'&,&');
					strVal = "&" + strVal +"&";
				}else {
					strVal = subsidiaryArr;
				}
				
				var currentUnitsType = searchResultsAll.getValue('unitstype');
				if (currentUnitsType) {
					if (allUnitsType.indexOf(currentUnitsType.toString()) < 0) {
						allUnitsType.push(currentUnitsType.toString());
					}
				}
				
				var lineData = {};
				var tmpItemId = searchResultsAll.getValue(itemid);
				if (tmpItemId.indexOf(':') >= 0) {
					tmpItemId = tmpItemId.split(' : ');
					tmpItemId = tmpItemId[(tmpItemId.length - 1)];
				}
				lineData.itemid = tmpItemId;
				lineData.itemtyp = searchResultsAll.getValue(type);
				lineData.itemnm = searchResultsAll.getValue({name: 'displayname'});
				lineData.parentid = searchResultsAll.getValue(parent);
				lineData.puichaseunittyp = searchResultsAll.getValue(purchaseunit);
				lineData.stockunittyp = searchResultsAll.getValue(stockunit);
				lineData.salesunittyp = searchResultsAll.getValue({
					name: 'custrecord_djkk_type_code',
					join: 'custitem_djkk_shipment_unit_type'
				});
				lineData.departmentid = searchResultsAll.getValue(department);
				lineData.upccd = searchResultsAll.getValue(upccode);
				lineData.subsidiaryid = strVal;
				
				var taxCodeName = searchResultsAll.getText(taxschedule);
				lineData.salestaxcode = objTaxCodeInfo.hasOwnProperty(taxCodeName) ? objTaxCodeInfo[taxCodeName]: '';
				
//				if(searchResultsAll.getText(taxschedule) == "消費税(標準)10.0%"){
//					lineData.salestaxcode = "01"; 
//				}else if(searchResultsAll.getText(taxschedule) == "消費税(軽減)8.0%"){
//					lineData.salestaxcode = "02"; 
//				}else if(searchResultsAll.getText(taxschedule) == "非課税"){
//					lineData.salestaxcode = "08"; 
//				}else if(searchResultsAll.getText(taxschedule) == "免税"){
//					lineData.salestaxcode = "09"; 
//				}else if(searchResultsAll.getText(taxschedule) == "不課税"){
//					lineData.salestaxcode = "07"; 
//				}else {
//					lineData.salestaxcode = "";
//				}
				lineData.dj_deliverytemptyp = searchResultsAll.getValue(custitem_djkk_deliverytemptyp);
				lineData.dj_packagetyp = '';
				lineData.dj_expdatedays = searchResultsAll.getValue({name: 'custitem_djkk_shelf_life'});
				lineData.dj_perunitquantity = searchResultsAll.getValue(custitem_djkk_perunitquantity);
				var changeFlg = searchResultsAll.getValue(custitem_djkk_tempcondperiodchangeflg);
				if (changeFlg) {
					lineData.dj_tempcondperiodchangeflg = "1";
				}
				else {
					lineData.dj_tempcondperiodchangeflg = "0";
				}
				lineData.dj_inspection_level = searchResultsAll.getValue(custitem_djkk_inspection_level);
				lineData.dj_nextshipmentdesc = searchResultsAll.getValue(custitem_djkk_nextshipmentdesc);
				var nicFlg = searchResultsAll.getValue(custitem_djkk_organicflg);
				if (nicFlg) {
					lineData.dj_organicflg = "1";
				}
				else {
					lineData.dj_organicflg = "0";
				}
				lineData.dj_promotionflg = "0";
				var dateTmp = "";
				for (var j = 0; j < searchResultsListA.length; j++) {
					var searchResults = searchResultsListA[j];
					dateTmp = searchResults.getValue(lastdate);
				}
				lineData.dj_productcode = searchResultsAll.getValue({name: 'custitem_djkk_product_code'});
				if (searchResultsAll.getValue({name: 'custitem_djkk_no_bbd'})) {
					lineData.dj_no_bbd = "1";
				}
				else {
					lineData.dj_no_bbd = "0";
				}
                // DJ_配送料フラグ
				lineData.dj_deliverycharge_flg = (searchResultsAll.getValue({name: 'custitem_djkk_deliverycharge_flg'}) ? '1': '0');
				lineData.dj_productnamejpline1 = searchResultsAll.getValue({name: 'custitem_djkk_product_name_jpline1'});
				lineData.dj_productnamejpline2 = searchResultsAll.getValue({name: 'custitem_djkk_product_name_jpline2'});
				lineData.createtime = getDate(dateTmp);
				lineData.createuser = "netsuite";
				lineData.lastupdatetime = getDate(dateTmp);
				lineData.updateuser = "netsuite";
				if (searchResultsAll.getValue(isinactive)) {
					lineData.deleteflg = "1";
				}
				else {
					lineData.deleteflg = "0";
				}
				jsonData.record_data.push(lineData);
			}
		}
		var allSalesUnitInfo = {};
		for (var i = 0; i < allUnitsType.length; i++) {
			var tmpUnitsTypeRecord = record.load({
				type: record.Type.UNITS_TYPE,
				id: allUnitsType[i]
			});
			var tmpLineCount = tmpUnitsTypeRecord.getLineCount({sublistId: 'uom'});
			for (var linenum = 0; linenum < tmpLineCount; linenum++) {
				var tmpId = tmpUnitsTypeRecord.getSublistValue({sublistId: 'uom', fieldId: 'internalid', line: linenum});
				var tmpRate = tmpUnitsTypeRecord.getSublistValue({sublistId: 'uom', fieldId: 'conversionrate', line: linenum});
				allSalesUnitInfo[(tmpId.toString())] = tmpRate;
			}
		}
		
//		var resultData = jsonData.record_data;
//		if (resultData && resultData.length > 0) {
//			for (var i = 0; i < resultData.length; i++) {
//				var tmpSalesUnitId = resultData[i].salesunittyp;
//				if (tmpSalesUnitId) {
//					if (allSalesUnitInfo.hasOwnProperty(tmpSalesUnitId.toString())) {
//						resultData[i].dj_perunitquantity = allSalesUnitInfo[(tmpSalesUnitId.toString())].toString();
//					} else {
//						resultData[i].dj_perunitquantity = '0';
//					}	
//				}
//			}
//		}
//		jsonData.record_data = resultData;
		
		return jsonData;
	};

	function master_priceList_getinfo(dataJSON) {
		var syncAt = dataJSON.sync_at;
		var errorType = dataJSON.error_type;
		var errorName = dataJSON.error_name;
		var errorKey = dataJSON.error_key;
		var errorMsg = dataJSON.error_Msg;
		errorMsg = errorMsg.replace('{param1}', syncAt);
    	if (syncAt === undefined || syncAt == null || syncAt === '') {
    		var jsonDataE = {};
    		jsonDataE.status = 1;
    		jsonDataE.message = errorKey + " " + errorMsg;
  	        return jsonDataE;
    	} else {
    		var flag = isDatetime(syncAt);
    		if (!flag) {
    			var jsonDataEE = {};
    			jsonDataEE.status = 1;
    			jsonDataEE.message = errorKey + " " + errorMsg;
      	        return jsonDataEE;
			}
    	}
		var searchFilters = [];

		var searchColumns = [];
		var internalid = search.createColumn({
			name : 'internalid',
        });
	    searchColumns.push(internalid);
		var custrecord_djkk_pl_code = search.createColumn({
			name : 'custrecord_djkk_pl_code',
        });
	    searchColumns.push(custrecord_djkk_pl_code);
		var custrecord_djkk_pl_name = search.createColumn({
			name : 'custrecord_djkk_pl_name',
        });
	    searchColumns.push(custrecord_djkk_pl_name);
		var id = search.createColumn({
			name : 'custrecord_djkk_pl_price_currency',
        });
	    searchColumns.push(id);
		var createddate = search.createColumn({
			name : 'created',
        });
	    searchColumns.push(createddate);
		var lastmodifieddate = search.createColumn({
			name : 'lastmodified',
        });
	    searchColumns.push(lastmodifieddate);
		var isinactive = search.createColumn({
			name : 'isinactive',
        });
	    searchColumns.push(isinactive);
		//detail
		var itemid = search.createColumn({
			name : 'custrecord_djkk_pldt_itemcode',
			join : 'custrecord_djkk_pldt_pl'
        });
	    searchColumns.push(itemid);
		var custrecord_djkk_pl_startdate = search.createColumn({
			name : 'custrecord_djkk_pl_startdate',
			join : 'custrecord_djkk_pldt_pl'
        });
	    searchColumns.push(custrecord_djkk_pl_startdate);
		var custrecord_djkk_pl_enddate = search.createColumn({
			name : 'custrecord_djkk_pl_enddate',
			join : 'custrecord_djkk_pldt_pl'
        });
	    searchColumns.push(custrecord_djkk_pl_enddate);
		var custrecord_djkk_pldt_cod_price = search.createColumn({
			name : 'custrecord_djkk_pldt_cod_price',
			join : 'custrecord_djkk_pldt_pl'
        });
	    searchColumns.push(custrecord_djkk_pldt_cod_price);
		var createddateB = search.createColumn({
			name : 'created',
			join : 'custrecord_djkk_pldt_pl'
        });
	    searchColumns.push(createddateB);
		var lastmodifieddateB = search.createColumn({
			name : 'lastmodified',
			join : 'custrecord_djkk_pldt_pl'
        });
	    searchColumns.push(lastmodifieddateB);
		var isinactiveB = search.createColumn({
			name : 'isinactive',
			join : 'custrecord_djkk_pldt_pl'
        });
	    searchColumns.push(isinactiveB);
		var searchResultsList = getTableInfo('customrecord_djkk_price_list',searchFilters,searchColumns);
		var jsonData = {};
		jsonData.status = 0;
		jsonData.record_Data = [];
		if (searchResultsList.length > 0) {

            var kval = [];
            for (var i = 0; i < searchResultsList.length; i++) {
				var searchResult = searchResultsList[i];
            	kval.push(searchResult.getValue(internalid));
            }
            kval = kval.filter(function(val, i, self) {
				return i === self.indexOf(val);
            });
            for (var m = 0; m < kval.length; j=m++) {
            	var lineData = {};
            	lineData.line = [];
            	var num = 0;
				for (var n = 0; n < searchResultsList.length; n++) {
					var searchResultNew = searchResultsList[n];
					if (kval[m] == searchResultNew.getValue(internalid)){
						if (num == 0) {
							lineData.priceListCd = searchResultNew.getValue(custrecord_djkk_pl_code);
							lineData.priceListNm = searchResultNew.getValue(custrecord_djkk_pl_name);
							lineData.currency = searchResultNew.getText(id);
							lineData.createtime = getDate(searchResultNew.getValue(createddate));
							lineData.createuser = "netsuite";
							lineData.lastupdatetime = getDate(searchResultNew.getValue(lastmodifieddate));
							lineData.updateuser = "netsuite";
							var flg  = searchResultNew.getValue(isinactive);
							if (flg) {
								lineData.deleteflg = "1";
							}
							else {
								lineData.deleteflg = "0";
							}
							num++;
						}

						if (!(searchResultNew.getValue(itemid) === undefined || searchResultNew.getValue(itemid) == null || searchResultNew.getValue(itemid) === '')) {
                            var lineDataDetail = {};
							lineDataDetail.itemid = searchResultNew.getText(itemid);
							lineDataDetail.applyfromdate = getDate(searchResultNew.getValue(custrecord_djkk_pl_startdate),'yyyymmdd');
							lineDataDetail.applytodate = getDate(searchResultNew.getValue(custrecord_djkk_pl_enddate),'yyyymmdd');
							lineDataDetail.price = searchResultNew.getValue(custrecord_djkk_pldt_cod_price);
							lineDataDetail.createtime = getDate(searchResultNew.getValue(createddateB));
							lineDataDetail.createuser = "netsuite";
							lineDataDetail.lastupdatetime = getDate(searchResultNew.getValue(lastmodifieddateB));
							lineDataDetail.updateuser = "netsuite";
							var detailFlg = searchResultNew.getValue(isinactiveB);
							if (detailFlg) {
								lineDataDetail.deleteflg = "1";
							}
							else {
								lineDataDetail.deleteflg = "0";
							}
							lineData.line.push(lineDataDetail);
						}
					} else {
            				if (lineData.line.length > 0) {
            					jsonData.record_Data.push(lineData);
                                break;
            				}
            		}
					if (m == kval.length -1 && n == searchResultsList.length - 1) {
            			jsonData.record_Data.push(lineData);
            		}
				}
			}
		}
		return jsonData;
	};

	function master_inventorynumber_getinfo(dataJSON) {
		var syncAt = dataJSON.sync_at;
		var year = syncAt.substring(0,4);
		var month = syncAt.substring(5,7);
		var day = syncAt.substring(8,10);
		var time = syncAt.substring(11,13);
		var second = syncAt.substring(14,16);
		var dateNew = year + "/" + month + "/" + day + " " + time + "時" + second + "分";
		var dateTmp = syncAt.substring(0,4);
		var errorType = dataJSON.error_type;
		var errorName = dataJSON.error_name;
		var errorKey = dataJSON.error_key;
		var errorMsg = dataJSON.error_Msg;
		errorMsg = errorMsg.replace('{param1}', syncAt);
    	if (syncAt === undefined || syncAt == null || syncAt === '') {
    		var jsonDataE = {};
    		jsonDataE.status = 1;
    		jsonDataE.message = errorKey + " " + errorMsg;
  	        return jsonDataE;
    	} else {
    		var flag = isDatetime(syncAt);
    		if (!flag) {
    			var jsonDataEE = {};
    			jsonDataEE.status = 1;
    			jsonDataEE.message = errorKey + " " + errorMsg;
      	        return jsonDataEE;
			}
    	}
		var searchFilters = [];
		searchFilters.push(["datecreated","onorafter",dateNew]);
		searchFilters.push('OR');
        searchFilters.push(["custitemnumber_djkk_in_update_datetime","onorafter",dateNew]);

		var searchColumns = [];
		var internalid = search.createColumn({
			name : 'internalid',
        });
	    searchColumns.push(internalid);
		var location = search.createColumn({
			name : 'location',
        });
	    searchColumns.push(location);
		var itemId = search.createColumn({
			name : 'itemid',
			join : 'item',
        });
	    searchColumns.push(itemId);
		var custitemnumber_djkk_maker_serial_number = search.createColumn({
			name : 'custitemnumber_djkk_maker_serial_number',
        });
	    searchColumns.push(custitemnumber_djkk_maker_serial_number);
		var status = search.createColumn({
			name : 'status',
        });
	    //searchColumns.push(status);
		var expirationdate = search.createColumn({
			name : 'expirationdate',
        });
	    searchColumns.push(expirationdate);
		var quantityonhand = search.createColumn({
			name : 'quantityonhand',
        });
	    searchColumns.push(quantityonhand);
		var memo = search.createColumn({
			name : 'custitemnumber_djkk_lot_memo',
        });
	    searchColumns.push(memo);
		var quantityavailable = search.createColumn({
			name : 'quantityavailable',
        });
	    searchColumns.push(quantityavailable);
		var inventorynumber = search.createColumn({
			name : 'inventorynumber',
        });
	    searchColumns.push(inventorynumber);
		var datecreated = search.createColumn({
			name : 'datecreated',
        });
	    searchColumns.push(datecreated);
		var custitemnumber_djkk_in_update_datetime = search.createColumn({
			name : 'custitemnumber_djkk_in_update_datetime',
        });
	    searchColumns.push(custitemnumber_djkk_in_update_datetime);
    	searchColumns.push(search.createColumn({
            name: 'item'
        }));
    	searchColumns.push(search.createColumn({
    		name: 'custitemnumber_djkk_shipment_date'
    	}));
	    var searchResultsList = getTableInfo('inventorynumber',searchFilters,searchColumns);
		var jsonData = {};
        jsonData.status = 0;
        jsonData.record_data = [];
      
        var allItems = [];
        var allLocations = [];
        var allInventoryIds = [];
      
		if (searchResultsList.length > 0) {
			for (var m = 0; m < searchResultsList.length; m++ ) {
              var searchResultsAll = searchResultsList[m];

              var tmpInventoryId = searchResultsAll.getValue(internalid);
              var tmpItem = searchResultsAll.getValue({name: 'item'});
              var tmpLocation = searchResultsAll.getValue(location);

              if (allItems.indexOf(tmpItem.toString()) < 0 && tmpItem != null && tmpItem != '') {
                  allItems.push(tmpItem.toString());
              }
              if (allLocations.indexOf(tmpLocation.toString()) < 0 && tmpLocation != null && tmpLocation != '') {
                  allLocations.push(tmpLocation.toString());
              }
              if (allInventoryIds.indexOf(tmpInventoryId.toString()) < 0 && tmpInventoryId != null && tmpInventoryId != '') {
                  allInventoryIds.push(tmpInventoryId.toString());
              }

          }

          var objLotInfoByKey = {};
          if (allItems.length > 0 && allLocations.length > 0 && allInventoryIds.length > 0) {
              var filters = [];
              var tmpFilters = [];
              filters.push(['isinactive', search.Operator.IS, false]);
              filters.push('and');
              tmpFilters = [];
              for (var i = 0; i < allItems.length; i++) {
                  tmpFilters.push(['custrecord_djkk_exsystem_iq_item', search.Operator.IS, allItems[i].toString()]);
                  if(i != (allItems.length - 1)) {
                      tmpFilters.push('or');	
                  }
              }
              filters.push(tmpFilters);

              filters.push('and');
              tmpFilters = [];
              for (var i = 0; i < allLocations.length; i++) {
                  tmpFilters.push(['custrecord_djkk_exsystem_iq_location', search.Operator.IS, allLocations[i].toString()]);
                  if(i != (allLocations.length - 1)) {
                      tmpFilters.push('or');	
                  }
              }
              filters.push(tmpFilters);

              filters.push('and');
              tmpFilters = [];
              for (var i = 0; i < allInventoryIds.length; i++) {
                  tmpFilters.push(['custrecord_djkk_exsystem_iq_inventory', search.Operator.IS, allInventoryIds[i].toString()]);
                  if(i != (allInventoryIds.length - 1)) {
                      tmpFilters.push('or');	
                  }
              }
              filters.push(tmpFilters);

              var columns = [];
              columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_item'}));
              columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_location'}));
              columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_inventory'}));
              columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_quantity'}));
              columns.push(search.createColumn({name: 'lastmodified'}));
              var results = searchResult('customrecord_djkk_exsystem_item_quantity', filters, columns);
              for (var i = 0; i < results.length; i++) {
                  var tmpResult = results[i];
                  var tmpId = tmpResult.id;
                  var tmpItem = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_item'});
                  var tmpLocation = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_location'});
                  var tmpLotId = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_inventory'});
                  var tmpQuantity = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_quantity'});
                  var tmpUpdateDateTime = tmpResult.getValue({name: 'lastmodified'});
                  var tmpKey = [tmpItem, tmpLocation, tmpLotId].join('-');
                  objLotInfoByKey[tmpKey] = {
                      quantity: Number(tmpQuantity),
                      updateDateTime: getDate(tmpUpdateDateTime)
                  };
              }
          }
          for (var m = 0; m < searchResultsList.length; m++) {
              var searchResultsAll = searchResultsList[m];

              var tmpInventoryId = searchResultsAll.getValue(internalid);
              var tmpItem = searchResultsAll.getValue({name: 'item'});
              var tmpLocation = searchResultsAll.getValue(location);

              var tmpKey = [tmpItem, tmpLocation, tmpInventoryId].join('-');

              var tmpQuantity = 0;
              var tmpUpdateTime = '';
              if (objLotInfoByKey.hasOwnProperty(tmpKey)) {
                  tmpQuantity = Number(objLotInfoByKey[tmpKey].quantity);
                  tmpUpdateTime = objLotInfoByKey[tmpKey].updateDateTime;
              }
              var lineData = {};
              lineData.inventoryid = tmpInventoryId;
              lineData.locationid = tmpLocation;
              lineData.itemid = searchResultsAll.getValue(itemId);
              lineData.lotno = searchResultsAll.getValue(custitemnumber_djkk_maker_serial_number);
              lineData.status = "";
              var dateGet = searchResultsAll.getValue(expirationdate);
              lineData.expdate = dateGet.substring(0,4) + dateGet.substring(5,7) + dateGet.substring(8,10);
              var numTmp = Number(searchResultsAll.getValue(quantityonhand));
              lineData.quantity = numTmp.toFixed(2);
              lineData.inventorymemo = searchResultsAll.getValue(memo);
              var num1;
              var num2;
              if (searchResultsAll.getValue(quantityonhand) === undefined || searchResultsAll.getValue(quantityonhand) == null || searchResultsAll.getValue(quantityonhand) === '') {
                  num1 = 0.00;
              } else {
                  num1 = Number(searchResultsAll.getValue(quantityonhand));
              }
              if (searchResultsAll.getValue(quantityavailable) === undefined || searchResultsAll.getValue(quantityavailable) == null || searchResultsAll.getValue(quantityavailable) === '') {
                  num2 = 0.00;
              } else {
                  num2 = Number(searchResultsAll.getValue(quantityavailable));
              }
  //				lineData.dj_allocationquantity = (num1 - num2).toFixed(2);
              lineData.dj_manageno = searchResultsAll.getValue(inventorynumber);
              lineData.dj_shipmentexpdate = getDate(searchResultsAll.getValue({name: 'custitemnumber_djkk_shipment_date'}), 'yyyymmdd');
              lineData.ns_availablequantity = num2;
              lineData.ns_awsallocationquantity = tmpQuantity;
              lineData.ns_receiveddt = tmpUpdateTime;
              lineData.createtime = getDate(searchResultsAll.getValue(datecreated));
              lineData.createuser = "netsuite";
              lineData.lastupdatetime = getDate(searchResultsAll.getValue(custitemnumber_djkk_in_update_datetime));
              lineData.updateuser = "netsuite";
              jsonData.record_data.push(lineData);
          }
		}
		return jsonData;
	};

	function customer_address_getinfo(dataJSON) {
		var syncAt = dataJSON.sync_at;
		var errorType = dataJSON.error_type;
		var errorName = dataJSON.error_name;
		var errorKey = dataJSON.error_key;
		var errorMsg = dataJSON.error_Msg;
		errorMsg = errorMsg.replace('{param1}', syncAt);
    	if (syncAt === undefined || syncAt == null || syncAt === '') {
    		var jsonDataE = {};
    		jsonDataE.status = 1;
    		jsonDataE.message = errorKey + " " + errorMsg;
  	        return jsonDataE;
    	} else {
    		var flag = isDatetime(syncAt);
    		if (!flag) {
    			var jsonDataEE = {};
    			jsonDataEE.status = 1;
    			jsonDataEE.message = errorKey + " " + errorMsg;
      	        return jsonDataEE;
			}
    	}
    	var searchFilters = [];
		searchFilters.push(["formulanumeric: TO_DATE('" + syncAt + "','yyyy-MM-dd HH24:MI:SS')-{datecreated}","lessthanorequalto","0"]);
		searchFilters.push("OR");
		searchFilters.push(["formulanumeric: TO_DATE('" + syncAt + "','yyyy-MM-dd HH24:MI:SS')-{lastmodifieddate}","lessthanorequalto","0"]);
		var searchColumns = [];
    	var id = search.createColumn({
			name : 'internalid'
        });
      	searchColumns.push(id);
    	var isdefaultshipping = search.createColumn({
			name : 'isdefaultshipping'
        });
      	searchColumns.push(isdefaultshipping);
    	var isdefaultbilling = search.createColumn({
			name : 'isdefaultbilling'
        });
      	searchColumns.push(isdefaultbilling);
    	var addresslabel = search.createColumn({
			name : 'addresslabel'
        });
      	searchColumns.push(addresslabel);
		var addinternalid = search.createColumn({
			name : 'addressinternalid'
				
        });
		searchColumns.push(addinternalid);
		var searchResultsList = getTableInfo('customer',searchFilters,searchColumns);	
		log.debug({
			title: 'customer_address_getinfo',
			details: searchResultsList.length
		})
		var jsonData = {};
        jsonData.status = 0;
        jsonData.record_data = [];

		if (searchResultsList.length > 0) {
			var idlist = []; 
			for (var i = 0; i < searchResultsList.length; i++ ) {
				var searchResultsAllList = searchResultsList[i];
				idlist.push(searchResultsAllList.getValue(id));
			}
			idlist = idlist.filter(function(val, i, self) {
                return i === self.indexOf(val);
            });
			for (var j = 0; j < idlist.length; j++ ) {
				var num = 0;
				for (var m = 0; m < searchResultsList.length; m++ ){
					var searchResultsAllData = searchResultsList[m];
					if(idlist[j] == searchResultsAllData.getValue(id)){
						num++;
						var addrId = searchResultsAllData.getValue(addinternalid);
						if (addrId == null || addrId == '') {
							continue;
						}
						var lineData = {};
						//lineData.internalid = searchResultsAllData.getValue(id);
						lineData.addrlineno = num;
						var flagq1 = searchResultsAllData.getValue(isdefaultshipping);
						var flagq2 = searchResultsAllData.getValue(isdefaultbilling);
						if(flagq1){
							lineData.defaultshippingflg = "1";
						}else{
							lineData.defaultshippingflg = "0";
						}
						if(flagq2){
							lineData.defaultbillingflg = "1";
						}else{
							lineData.defaultbillingflg = "0";
						}

						lineData.addrlabel = searchResultsAllData.getValue(addresslabel);
						lineData.addrid = searchResultsAllData.getValue(addinternalid);
						jsonData.record_data.push(lineData);
					}else{
						num = 0;
					}
				}
			}
		}
		return jsonData;
	};
	
	function master_employee_getinfo(dataJSON) {
		var syncAt = dataJSON.sync_at;
		var errorType = dataJSON.error_type;
		var errorName = dataJSON.error_name;
		var errorKey = dataJSON.error_key;
		var errorMsg = dataJSON.error_Msg;
		errorMsg = errorMsg.replace('{param1}', syncAt);
    	if (syncAt === undefined || syncAt == null || syncAt === '') {
    		var jsonDataE = {};
    		jsonDataE.status = 1;
    		jsonDataE.message = errorKey + " " + errorMsg;
  	        return jsonDataE;
    	} else {
    		var flag = isDatetime(syncAt);
    		if (!flag) {
    			var jsonDataEE = {};
    			jsonDataEE.status = 1;
    			jsonDataEE.message = errorKey + " " + errorMsg;
      	        return jsonDataEE;
			}
    	}
    	
    	var jsonData = {};
        jsonData.status = 0;
        jsonData.record_data = [];
    	
    	var allSubsidiaryIds = getSubsidiaryIds(true);
    	
        var arrModifyEmployeeIds = [];

    	var filters = [];
		// filters.push(['custentity_djkk_useexsystemflg', 'is', true]);
		// filters.push('and');
    	filters.push(['lastmodifieddate', 'onorafter', format.format({value: new Date(syncAt.split('-').join('/')), type: format.Type.DATE})]);
    	var tmpFilters = [];
		for (var i = 0; i < allSubsidiaryIds.length; i++) {
			tmpFilters.push(['subsidiary', 'is', (allSubsidiaryIds[i].toString())]);
			if (i != (allSubsidiaryIds.length - 1)) {
				tmpFilters.push('or');	
			}
		}
		filters.push('and');
		filters.push(tmpFilters);
    	var columns = [];
    	columns.push(search.createColumn({name: 'lastname'}));
    	columns.push(search.createColumn({name: 'firstname'}));
    	columns.push(search.createColumn({name: 'title'}));
    	columns.push(search.createColumn({name: 'supervisor'}));
    	columns.push(search.createColumn({name: 'email'}));
    	columns.push(search.createColumn({name: 'department'}));
    	columns.push(search.createColumn({name: 'class'}));
    	columns.push(search.createColumn({name: 'subsidiary'}));
    	columns.push(search.createColumn({name: 'custentity_djkk_useexsystemflg'}));
    	columns.push(search.createColumn({name: 'datecreated'}));
    	columns.push(search.createColumn({name: 'lastmodifieddate'}));
    	columns.push(search.createColumn({name: 'isinactive'}));
    	columns.push(search.createColumn({name: 'issalesrep'}));
    	columns.push(search.createColumn({name: 'custentity_djkk_useexsystemflg'}));

    	var results = searchResult(search.Type.EMPLOYEE, filters, columns);
    	
        columns.push(search.createColumn({name: 'date', join: 'systemnotes', sort: search.Sort.DESC}));
        columns.push(search.createColumn({name: 'field', join: 'systemnotes'}));
        columns.push(search.createColumn({name: 'oldvalue', join: 'systemnotes'}));
        columns.push(search.createColumn({name: 'newvalue', join: 'systemnotes'}));

        var resultsWithSystemLog = searchResult(search.Type.EMPLOYEE, filters, columns);

        resultsWithSystemLog.forEach(function(tmpResult) {
            var tmpField = tmpResult.getValue({name: 'field', join: 'systemnotes'});

            if (tmpField != 'custentity_djkk_useexsystemflg') {
                return;
            }

            var oldValue = tmpResult.getValue({name: 'oldvalue', join: 'systemnotes'});
            var newValue = tmpResult.getValue({name: 'newvalue', join: 'systemnotes'});

            if (!(oldValue == 'T' && newValue == 'F')) {
                return;
            }

            var tmpId = tmpResult.id;
            if (arrModifyEmployeeIds.indexOf(tmpId.toString()) < 0) {
                arrModifyEmployeeIds.push(tmpId.toString());
            }
        });

    	var returnDatas = [];    	
    	for (var i = 0; i < results.length; i++) {
    		var objTmp = {};
    		
    		var flgIsSalesRep = results[i].getValue({name: 'issalesrep'});
    		var flgIsExsystem = results[i].getValue({name: 'custentity_djkk_useexsystemflg'});
    		
            if (arrModifyEmployeeIds.indexOf(results[i].id.toString()) < 0) {
                if (!(flgIsSalesRep || flgIsExsystem)) {
                    continue;
                }
            }
    		
    		var tmpCreatedDate = results[i].getValue({name: 'datecreated'});
    		if (tmpCreatedDate != null && tmpCreatedDate != '') {
    			tmpCreatedDate = format.parse({value: tmpCreatedDate, type: format.Type.DATE});
    			tmpCreatedDate = tmpCreatedDate.getFullYear() + '年' + ('00' + (tmpCreatedDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpCreatedDate.getDate()).slice(-2) + '日 ' + ('00' + tmpCreatedDate.getHours()).slice(-2) + '時' + ('00' + tmpCreatedDate.getMinutes()).slice(-2) + '分';
			} else {
				tmpCreatedDate = '';
			}
    		
    		var tmpLastModifiedDate = results[i].getValue({name: 'lastmodifieddate'});
    		if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
				tmpLastModifiedDate = format.parse({value: tmpLastModifiedDate, type: format.Type.DATE});
				tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '年' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '日 ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '時' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '分';
			} else {
				tmpLastModifiedDate = '';
			}
    		
    		objTmp.employeeid = results[i].id;
    		objTmp.lastnm = results[i].getValue({name: 'lastname'});
    		objTmp.firstnm = results[i].getValue({name: 'firstname'});
    		objTmp.title = results[i].getValue({name: 'title'});
    		objTmp.supervisorid = results[i].getValue({name: 'supervisor'});
    		objTmp.mailaddress = results[i].getValue({name: 'email'});
    		objTmp.departmentid = results[i].getValue({name: 'department'});
    		objTmp.classid = results[i].getValue({name: 'class'});
    		objTmp.subsidiaryid = results[i].getValue({name: 'subsidiary'});
    		objTmp.issalesrep = (results[i].getValue({name: 'issalesrep'}) ? '1': '0');
    		objTmp.dj_useexsystemflg = (results[i].getValue({name: 'custentity_djkk_useexsystemflg'}) ? '1' : '0');
    		objTmp.createtime = tmpCreatedDate;
    		objTmp.createuser = 'netsuite';
    		objTmp.lastupdatetime = tmpLastModifiedDate;
    		objTmp.updateuser = 'netsuite';
    		objTmp.deleteflg = (results[i].getValue({name: 'isinactive'}) ? '1' : '0');

    		returnDatas.push(objTmp);
    	}
    	
		jsonData.record_data = returnDatas;
		
		return jsonData;
	};
	
	function master_subsidiary_getinfo(dataJSON) {
		var syncAt = dataJSON.sync_at;
		var errorType = dataJSON.error_type;
		var errorName = dataJSON.error_name;
		var errorKey = dataJSON.error_key;
		var errorMsg = dataJSON.error_Msg;
		errorMsg = errorMsg.replace('{param1}', syncAt);
    	if (syncAt === undefined || syncAt == null || syncAt === '') {
    		var jsonDataE = {};
    		jsonDataE.status = 1;
    		jsonDataE.message = errorKey + " " + errorMsg;
  	        return jsonDataE;
    	} else {
    		var flag = isDatetime(syncAt);
    		if (!flag) {
    			var jsonDataEE = {};
    			jsonDataEE.status = 1;
    			jsonDataEE.message = errorKey + " " + errorMsg;
      	        return jsonDataEE;
			}
    	}
    	
    	var currencyInfo = getCurrencyCodeByName();
    	
		var searchFilters = [];
		searchFilters.push(["formulanumeric: TO_DATE('" + syncAt + "','yyyy-MM-dd HH24:MI:SS')-{systemnotes.date}","lessthanorequalto","0"]);
		var searchColumns = [];
		var internalid = search.createColumn({
			name : 'internalid',
			summary : "GROUP"
        });
	    searchColumns.push(internalid);
		var namenohierarchy = search.createColumn({
			summary: "MAX",	
			name : 'namenohierarchy',
			sort: search.Sort.ASC
        });
	    searchColumns.push(namenohierarchy);
		var country = search.createColumn({
			summary: "MAX",
			name : 'country',
            sort: search.Sort.ASC
        });
	    searchColumns.push(country);
		var currency = search.createColumn({
			summary: "MAX",
			name : 'currency',
            sort: search.Sort.ASC
        });
	    searchColumns.push(currency);
		var language = search.createColumn({
			summary: "MAX",
			name : 'language',
            sort: search.Sort.ASC
        });
	    searchColumns.push(language);
		var parent = search.createColumn({
			summary: "MAX",
			name : 'parent',
            sort: search.Sort.ASC
        });
	    searchColumns.push(parent);
		var email = search.createColumn({
			summary: "MAX",
			name : 'email',
            sort: search.Sort.ASC
        });
	    searchColumns.push(email);
		var fax = search.createColumn({
			summary: "MAX",
			name : 'fax',
            sort: search.Sort.ASC
        });
	    searchColumns.push(fax);
		var phone = search.createColumn({
			summary: "MAX",
			name : 'phone',
            sort: search.Sort.ASC
        });
	    searchColumns.push(phone);
		var addressinternalid = search.createColumn({
			summary: "MAX",
			name : 'internalid',
			join : 'address',
            sort: search.Sort.ASC
        });
	    searchColumns.push(addressinternalid);
		var custrecord_djkk_finet_final_code = search.createColumn({
			summary: "MAX",
			name : 'custrecord_djkk_finet_final_code',
            sort: search.Sort.ASC
        });
	    searchColumns.push(custrecord_djkk_finet_final_code);
		var custrecord_djkk_seijoishii_vendor_code = search.createColumn({
			summary: "MAX",
			name : 'custrecord_djkk_seijoishii_vendor_code',
            sort: search.Sort.ASC
        });
	    searchColumns.push(custrecord_djkk_seijoishii_vendor_code);
		var lastdate = search.createColumn({
			summary: "MAX",
            name : 'date',
            join : 'systemnotes',
            sort: search.Sort.ASC
        });
		searchColumns.push(lastdate);
		var isinactive = search.createColumn({
			summary: "MAX",
			name : 'isinactive',
            sort: search.Sort.ASC
        });
		searchColumns.push(isinactive);
		var legalName = search.createColumn({
			summary: "MAX",
			name : 'legalName',
            sort: search.Sort.ASC
        });
		searchColumns.push(legalName);
		var shippingDeliveryNotice = search.createColumn({
			summary: "MAX",
			name : 'custrecord_djkk_shippingdeliverynotice',
            sort: search.Sort.ASC
        });
		searchColumns.push(shippingDeliveryNotice);
		searchColumns.push(search.createColumn({
			name: 'phone',
			join: 'shippingaddress',
			summary: 'MAX'
		}));
		searchColumns.push(search.createColumn({
			name: 'custrecord_djkk_address_fax',
			join: 'shippingaddress',
			summary: 'MAX'
		}));
		var searchResultsList = getTableInfo('subsidiary',searchFilters,searchColumns);
		var jsonData = {};
        jsonData.status = 0;
        jsonData.record_data = [];

		if (searchResultsList.length > 0) {
			for (var m = 0; m < searchResultsList.length; m++ ) {
				var searchResultsAll = searchResultsList[m];
				var lineData = {};
				lineData.subsidiaryid = searchResultsAll.getValue(internalid);
				var company = searchResultsAll.getValue(legalName);
	           var reg1 = RegExp(/DENIS JAPAN K.K./);
	           var reg2 = RegExp(/NICHIFUTSU BOEKI K.K./);
	           var reg3 = RegExp(/UNION LIQUORS K.K./);
               var reg4 = RegExp(/Denis Japan株式会社/);
	           var reg5 = RegExp(/日仏貿易株式会社/);
	           var reg6 = RegExp(/ユニオンリカーズ株式会社/);
				if((!company.match(reg1)) && (!company.match(reg2)) && (!company.match(reg3)) && (!company.match(reg4)) && (!company.match(reg5)) && (!company.match(reg6))){
//				if((!company.match(reg2)) && (!company.match(reg3))){
				    continue;
				}
				lineData.subsidiarynm = company;
				lineData.country = searchResultsAll.getValue(country);
				
				var tmpCurrency = searchResultsAll.getValue(currency);
				if (tmpCurrency != null && tmpCurrency != '') {
					if (currencyInfo.hasOwnProperty(tmpCurrency.toString())) {
						tmpCurrency = currencyInfo[(tmpCurrency.toString())];
					}
				}
				lineData.currency = tmpCurrency;
				lineData.language = searchResultsAll.getValue(language);
				lineData.parentid = searchResultsAll.getValue(parent);
				lineData.email = searchResultsAll.getValue(email);
				lineData.fax = searchResultsAll.getValue(fax);
				lineData.phone = searchResultsAll.getValue(phone);
				lineData.addrid = searchResultsAll.getValue(addressinternalid);
				lineData.dj_finetfinaldestcode = searchResultsAll.getValue(custrecord_djkk_finet_final_code);
				var vendor_code = searchResultsAll.getValue(custrecord_djkk_seijoishii_vendor_code);
				var strVal;
				if (vendor_code.length > 1) {
					strVal = vendor_code.replace(new RegExp(',',"gm"),'&,&');
					strVal = "&" + strVal +"&";
				}else {
					strVal = "";
				}
				lineData.dj_seijoishiicustomercode = strVal;
				lineData.dj_shippingdeliverynotice = searchResultsAll.getValue(shippingDeliveryNotice);
				lineData.dj_shippingaddrphone = searchResultsAll.getValue({
					name: 'phone',
					join: 'shippingaddress',
					summary: 'MAX'
				});
				lineData.dj_shippingaddrfax = searchResultsAll.getValue({
					name: 'custrecord_djkk_address_fax',
					join: 'shippingaddress',
					summary: 'MAX'
				})
				lineData.createtime = getDate(searchResultsAll.getValue(lastdate));
				lineData.createuser = "netsuite";
				lineData.lastupdatetime = getDate(searchResultsAll.getValue(lastdate));
				lineData.updateuser = "netsuite";
				var flagTmp = searchResultsAll.getValue(isinactive);
				if (flagTmp) {
					lineData.deleteflg = "1";
				}
				else {
					lineData.deleteflg = "0";
				}
            jsonData.record_data.push(lineData);
			}
		}
		return jsonData;
	};

	function master_delivery_destination_getinfo(dataJSON) {
		var syncAt = dataJSON.sync_at;
    	
		var stateCodeByName = getStateCodeByName();

		var jsonData = {};
        jsonData.status = 0;
        jsonData.record_data = [];

		var filters = [];
		var arrDateFilters = [];
		arrDateFilters.push(['created', 'onorafter', format.format({value: new Date(syncAt.split('-').join('/')), type: format.Type.DATE})]);
		arrDateFilters.push('OR');
		arrDateFilters.push(['lastmodified', 'onorafter', format.format({value: new Date(syncAt.split('-').join('/')), type: format.Type.DATE})]);
		
		filters.push(arrDateFilters);
		filters.push('AND');
		filters.push(['custrecord_djkk_customer.subsidiary', 'ANYOF', ['2', '4']]);
		var columns = [];
		// 納品先コード
		columns.push(search.createColumn({name: 'custrecord_djkk_delivery_code'}));
		// DJ_顧客.エンティティID
		columns.push(search.createColumn({name: 'entityid', join: 'custrecord_djkk_customer'}));
		// DJ_納品先名前
		columns.push(search.createColumn({name: 'custrecorddjkk_name'}));
		// DJ_賞味期限逆転防止区分
		columns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_expdatereservaltyp'}));
		// DJ_賞味期限残日数
		columns.push(search.createColumn({name: 'custrecord_djkk_expdateremainingdays'}));
		// DJ_賞味期限残パーセンテージ
		columns.push(search.createColumn({name: 'custrecord_djkk_expdateremainingpercent'}));
		// DJ_受注出荷関連ルール記述
		columns.push(search.createColumn({name: 'custrecord_djkk_orderruledesc'}));
		// DJ_消化仕入れフラグ
		columns.push(search.createColumn({name: 'custrecord_djkk_consignmentbuyingflg'}));
		// DJ_常温配送固定フラグ
		columns.push(search.createColumn({name: 'custrecord_djkk_alwaysnormaltempflg'}));
		// DJ_商品配送温度適用開始日
		columns.push(search.createColumn({name: 'custrecord_djkk_itemtempapplyfromdate'}));
		// DJ_商品配送温度適用終了日
		columns.push(search.createColumn({name: 'custrecord_djkk_itemtempapplytodate'}));
		// DJ_出荷案内送信区分.区分コード
		columns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_shippinginfosendtyp'}));
		// DJ_出荷案内送信先担当者
		columns.push(search.createColumn({name: 'custrecord_djkk_deliverydestrep'}));
		// DJ_出荷案内送信先区分
		columns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_shippinginfodesttyp'}));
		// DJ_出荷案内送信先会社名（３ｒｄパーティー）
		columns.push(search.createColumn({name: 'custrecord_djkk_shippinginfodestname'}));
		// DJ_出荷案内送信先担当者（３ｒｄパーティー）
		columns.push(search.createColumn({name: 'custrecord_djkk_shippinginfodestrep'}));
		// DJ_出荷案内送信先メール（３ｒｄパーティー）
		columns.push(search.createColumn({name: 'custrecord_djkk_shippinginfodestemail'}));
		// DJ_出荷案内送信先Fax（３ｒｄパーティー）
		columns.push(search.createColumn({name: 'custrecord_djkk_shippinginfodestfax'}));
		// DJ_出荷案内送信先登録メモ
		columns.push(search.createColumn({name: 'custrecord_djkk_shippinginfodestmemo'}));
		// DJ_注文時倉庫向け備考
		columns.push(search.createColumn({name: 'custrecord_djkk_sowmsmemo'}));
		// DJ_注文時運送向け備考
		columns.push(search.createColumn({name: 'custrecord_djkk_sodeliverermemo'}));
		// DJ_FINET送信元センターコード
		columns.push(search.createColumn({name: 'custrecord_djkk_finetcustomeredicode'}));
		// DJ_FINET一次店コード
		columns.push(search.createColumn({name: 'custrecord_djkk_finetinvoicecustomercd1'}));
		// DJ_FINET二次店コード
		columns.push(search.createColumn({name: 'custrecord_djkk_finetinvoicecustomercd2'}));
		// DJ_FINET三次店コード
		columns.push(search.createColumn({name: 'custrecord_djkk_finetinvoicecustomercd3'}));
		// DJ_FINET四次店コード
		columns.push(search.createColumn({name: 'custrecord_djkk_finetinvoicecustomercd4'}));
		// DJ_FINET五次店コード
		columns.push(search.createColumn({name: 'custrecord_djkk_finetinvoicecustomercd5'}));
		// DJ_FINET出荷案内送信区分
		columns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_finet_shipment_mail_typ'}));
		// DJ_FINET請求送信区分
		columns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_finet_bill_mail_typ'}));
		// DJ_FINETデータの備考を納品書備考にセットする
		columns.push(search.createColumn({name: 'custrecord_djkk_finetrem_to_delvmemo_flg'}));
		// DJ_販売価格表コード（食品）.DJ_販売価格表コード（食品）
		columns.push(search.createColumn({name: 'custrecord_djkk_pl_code_fd', join: 'custrecord_djkk_price_code_fd'}));
		// 作成日時
		columns.push(search.createColumn({name: 'created'}));
		// 最終更新日時
		columns.push(search.createColumn({name: 'lastmodified'}));
		// 無効
		columns.push(search.createColumn({name: 'isinactive'}));
		// DJ_郵便番号
		columns.push(search.createColumn({name: 'custrecord_djkk_zip'}));
		// DJ_都道府県
		columns.push(search.createColumn({name: 'custrecord_djkk_prefectures'}));
		// DJ_市区町村
		columns.push(search.createColumn({name: 'custrecord_djkk_municipalities'}));
		// DJ_納品先住所2
		columns.push(search.createColumn({name: 'custrecord_djkk_delivery_residence'}));
		// DJ_納品先住所3
		columns.push(search.createColumn({name: 'custrecord_djkk_delivery_residence2'}));
		// DJ_英文納品先名（検索名）
		columns.push(search.createColumn({name: 'custrecord_djkk_delivery_destination_en'}));
		// DJ_納品先電話番号TEXT
		columns.push(search.createColumn({name: 'custrecord_djkk_delivery_phone_text'}));
		// DJ_Email
		columns.push(search.createColumn({name: 'custrecord_djkk_email'}));
		// DJ_Fax
		columns.push(search.createColumn({name: 'custrecord_djkk_fax'}));
		// DJ_都道府県
		columns.push(search.createColumn({name: 'custrecord_djkk_prefectures'}));
        columns.push(search.createColumn({name: 'custrecord_djkk_delivery_lable'}));
		
		var results = searchResult('customrecord_djkk_delivery_destination', filters, columns);
		for (var i = 0; i < results.length; i++) {
			var tmpResult = results[i];
			
			var flgProcess = true;
			var tmpState = tmpResult.getValue({name: 'custrecord_djkk_prefectures'});
			if (!tmpState) {
				flgProcess = false;
			} else {
				if (!stateCodeByName.hasOwnProperty(tmpState.toString())) {
					flgProcess = false;
				} else {
					tmpState = stateCodeByName[tmpState.toString()];
				}
			}
			
			if (!flgProcess) {
				var strmailId = tmpResult.getValue('custrecord_djkk_email');
				var subjectdata = "住所内容不備のご連絡";
				var maildata = "下記「DJ_納品先」に関して、ご入力いただいたの「都道府県」には不備があり、ご確認をお願い致します。 DJ_納品先「" + tmpResult.getValue('custrecord_djkk_prefectures') +  "」、内部ID:" + tmpResult.id;
				// if(!(strmailId === undefined || strmailId == null || strmailId === '')){
				// 	sendMailFromNS("1", subjectdata, maildata, strmailId);
				// }else{
				// 	sendMailFromNS("1", subjectdata, maildata,["hongquan.yang@evangsol.co.jp", "m-mori@evangsol.co.jp"]);
				// }
                sendMailFromNS("1", subjectdata, maildata,["hongquan.yang@evangsol.co.jp", "m-mori@evangsol.co.jp"]);
				continue;
			}
			var strItemTempApplyFromDate = tmpResult.getValue({name: 'custrecord_djkk_itemtempapplyfromdate'});
            strItemTempApplyFromDate = strItemTempApplyFromDate.split('/').join('');
			var strItemTempApplyToDate = tmpResult.getValue({name: 'custrecord_djkk_itemtempapplytodate'});
			strItemTempApplyToDate = strItemTempApplyToDate.split('/').join('');
			var objResult = {
				deliverydestid: tmpResult.getValue({name: 'custrecord_djkk_delivery_code'}),
				customerid: tmpResult.getValue({name: 'entityid', join: 'custrecord_djkk_customer'}),
				deliverydestName: tmpResult.getValue({name: 'custrecorddjkk_name'}),
				addrlabel: tmpResult.getValue({name: 'custrecord_djkk_delivery_residence'}),
				dj_expdatereservaltyp: tmpResult.getValue({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_expdatereservaltyp'}),
				dj_expdateremainingdays: tmpResult.getValue({name: 'custrecord_djkk_expdateremainingdays'}),
				dj_expdateremainingpercent: tmpResult.getValue({name: 'custrecord_djkk_expdateremainingpercent'}),
				dj_orderruledesc: tmpResult.getValue({name: 'custrecord_djkk_orderruledesc'}),
				dj_consignmentbuyingflg: (tmpResult.getValue({name: 'custrecord_djkk_consignmentbuyingflg'}) ? '1' : '0'),
				dj_alwaysnormaltempflg: (tmpResult.getValue({name: 'custrecord_djkk_alwaysnormaltempflg'}) ? '1' : '0'),
				dj_itemtempapplyfromdate: strItemTempApplyFromDate,
				dj_itemtempapplytodate: strItemTempApplyToDate,
				dj_shippinginfosendtyp: tmpResult.getValue({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_shippinginfosendtyp'}),
				dj_deliverydestrep: tmpResult.getValue({name: 'custrecord_djkk_deliverydestrep'}),
				dj_shippinginfodesttyp: tmpResult.getValue({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_shippinginfodesttyp'}),
				dj_shippinginfodestname: tmpResult.getValue({name: 'custrecord_djkk_shippinginfodestname'}),
				dj_shippinginfodestrep: tmpResult.getValue({name: 'custrecord_djkk_shippinginfodestrep'}),
				dj_shippinginfodestemail: tmpResult.getValue({name: 'custrecord_djkk_shippinginfodestemail'}),
				dj_shippinginfodestfax: tmpResult.getValue({name: 'custrecord_djkk_shippinginfodestfax'}),
				dj_shippinginfodestmemo: tmpResult.getValue({name: 'custrecord_djkk_shippinginfodestmemo'}),
				dj_sowmsmemo: tmpResult.getValue({name: 'custrecord_djkk_sowmsmemo'}),
				dj_sodeliverermemo: tmpResult.getValue({name: 'custrecord_djkk_sodeliverermemo'}),
				dj_finetcustomerEDIcode: tmpResult.getValue({name: 'custrecord_djkk_finetcustomeredicode'}),
				dj_finetinvoicecustomercode1: tmpResult.getValue({name: 'custrecord_djkk_finetinvoicecustomercd1'}),
				dj_finetinvoicecustomercode2: tmpResult.getValue({name: 'custrecord_djkk_finetinvoicecustomercd2'}),
				dj_finetinvoicecustomercode3: tmpResult.getValue({name: 'custrecord_djkk_finetinvoicecustomercd3'}),
				dj_finetinvoicecustomercode4: tmpResult.getValue({name: 'custrecord_djkk_finetinvoicecustomercd4'}),
				dj_finetinvoicecustomercode5: tmpResult.getValue({name: 'custrecord_djkk_finetinvoicecustomercd5'}),
				dj_finetshipmentmailtyp: tmpResult.getValue({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_finet_shipment_mail_typ'}),
				dj_finetbillmailtyp: tmpResult.getValue({name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_finet_bill_mail_typ'}),
				dj_finetremarkstodeliverynotememoflg: (tmpResult.getValue({name: 'custrecord_djkk_finetrem_to_delvmemo_flg'}) ? '1' : '0'),
				dj_priceListCd: tmpResult.getValue({name: 'custrecord_djkk_pl_code_fd', join: 'custrecord_djkk_price_code_fd'}),
				createtime: getDate(tmpResult.getValue({name: 'created'})),
				lastupdatetime: getDate(tmpResult.getValue({name: 'lastmodified'})),
				deleteflg: (tmpResult.getValue({name: 'isinactive'}) ? '1' : '0'),
				dj_zip: tmpResult.getValue({name: 'custrecord_djkk_zip'}),
				dj_state: tmpResult.getValue({name: 'custrecord_djkk_prefectures'}),
				dj_city: tmpResult.getValue({name: 'custrecord_djkk_municipalities'}),
				dj_addr1: tmpResult.getValue({name: 'custrecord_djkk_delivery_residence'}),
				dj_addr2: tmpResult.getValue({name: 'custrecord_djkk_delivery_lable'}),
				dj_addressee: tmpResult.getValue({name: 'custrecord_djkk_delivery_destination_en'}),
				dj_phone: tmpResult.getValue({name: 'custrecord_djkk_delivery_phone_text'}),
				dj_email: tmpResult.getValue({name: 'custrecord_djkk_email'}),
				dj_fax: tmpResult.getValue({name: 'custrecord_djkk_fax'}),
				dj_state_id: tmpState,
				createuser: 'netsuite',
				updateuser: 'netsuite',
				addrid: '住所ID確認中',
				dj_country: '日本',
			};
			
			jsonData.record_data.push(objResult);
		}
        
		return jsonData;
	}
	
	function getJapanDateTime() {
		var now = new Date();
        var offSet = now.getTimezoneOffset();
        var offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);
        return '' + now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate())
                + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
	};

	function pad(v) {
        if (v >= 10) {
            return v;
        } else {
            return "0" + v;
        }
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
    	if (strdate === undefined || strdate == null || strdate === '' || strdate === ' ') {
    		return "";
    	}
    	var strDate = "";
    	if (strType == 'yyyy-mm-dd') {
    		strDate = strdate.replace(new RegExp('/',"gm"),'-');
         } else if (strType == 'yyyymmdd') {
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
  function sendMailFromNS(datanum, subjectdata, data,toAddressArr) {
        var userId = -5;// runtime.getCurrentUser();

        //var toAddressArr = 'kailong.jiang@evangsol.co.jp';
        var parameterSubject = subjectdata;
        var parameterTxtarea = "エラー件数:" + datanum + "\r\n" + "エラー内容:\r\n";
        for (var i = 0; i < data.length; i++) {
        	parameterTxtarea = parameterTxtarea + data[i];
        	
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

    /**
	 * 通貨コードを取得
	 * @returns
	 */
	function getCurrencyCodeByName() {
		var objResult = {};
		var columns = [];
		columns.push(search.createColumn({name: 'symbol'}));
		columns.push(search.createColumn({name: 'name'}));
		var results = searchResult(search.Type.CURRENCY, [], columns);
		for (var i = 0; i < results.length; i++) {
			var tmpName = results[i].getValue({name: 'name'});
			var tmpCode = results[i].getValue({name: 'symbol'});
			
			objResult[(tmpName.toString())] = tmpCode;
		}
		
		return objResult;
	}
	
	function getSubsidiaryByName() {
		var objResult = {};
		var columns = [];
		columns.push(search.createColumn({name: 'namenohierarchy'}));
		var results = searchResult(search.Type.SUBSIDIARY, [], columns);
		for (var i = 0; i < results.length; i++) {
			var tmpId = results[i].id;
			var tmpName = results[i].getValue({name: 'namenohierarchy'});
			
			if (!objResult.hasOwnProperty(tmpName)) {
				objResult[(tmpName.toString())] = tmpId;
			}
		}
		
		return objResult;
	}
	
	function getSubsidiaryIds(flgAddDenis) {
		var allSubsidiaryId = [];
		
		var allSubsidiaryByName = getSubsidiaryByName();
		var targetSubsidiaryName = [];
		targetSubsidiaryName.push('2-1 NICHIFUTSU BOEKI K.K.');
		targetSubsidiaryName.push('3-1 UNION LIQUORS K.K.');
		
		if (flgAddDenis) {
			targetSubsidiaryName.push('1-2 DENIS JAPAN K.K.');
		}
		for (var i = 0; i < targetSubsidiaryName.length; i++) {
			if (allSubsidiaryByName.hasOwnProperty(targetSubsidiaryName[i])) {
				var tmpId = allSubsidiaryByName[(targetSubsidiaryName[i])];
				if (allSubsidiaryId.indexOf(tmpId.toString()) < 0) {
					allSubsidiaryId.push(tmpId.toString());
				}
			}
		}
		return allSubsidiaryId;
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
            results = resultSet.getRange({start: resultIndex, end: resultIndex + resultStep});
            if (results != null && results != '') {
                for (var i = 0; i < results.length; i++) {
                    allSearchResult.push(results[i]);
                    resultIndex++;
                }
            }
        } while(results.length > 0);

        return allSearchResult;
    }
    
	function getStateCodeByName() {
		 var stateCodeByName = {};
		 var filters = [];
		 var columns = [];
		 columns.push(search.createColumn({name: 'custrecord_djkk_pd_pref_id'}));
		 var results = searchResult('customrecord_djkk_pref_delivery_area', filters, columns);
		 for (var i = 0; i < results.length; i++) {
			 var tmpId = results[i].getValue({name: 'custrecord_djkk_pd_pref_id'});
			 var tmpName = results[i].getText({name: 'custrecord_djkk_pd_pref_id'});
			 
			 if (!stateCodeByName.hasOwnProperty(tmpName)) {
				 stateCodeByName[(tmpName)] = tmpId;
			 }
		 }
		 return stateCodeByName;
	 }
	 
	function getTaxCodeByName() {
		var taxCodeInfo = {};
		
		var filters = [];
		
		var columns = [];
		columns.push(search.createColumn({
			name: 'custrecord_djkk_type_code', 
			join: 'custrecord_djkk_exsystemtaxcd'
		}));
		columns.push(search.createColumn({
			name: 'itemid'
		}))
		var results = searchResult(search.Type.SALES_TAX_ITEM, filters, columns);
		results.forEach(function(tmpResult) {
			var tmpItemId = tmpResult.getValue({name: 'itemid'});
			taxCodeInfo[tmpItemId.toString()] = tmpResult.getValue({
				name: 'custrecord_djkk_type_code', 
				join: 'custrecord_djkk_exsystemtaxcd'
			});
		});
		return taxCodeInfo;
	}
	
	
	return {
        master_address_getinfo : master_address_getinfo,
        master_location_getinfo : master_location_getinfo,
		master_item_getinfo : master_item_getinfo,
        master_priceList_getinfo : master_priceList_getinfo,
        master_inventorynumber_getinfo : master_inventorynumber_getinfo,
        master_employee_getinfo: master_employee_getinfo,
        customer_address_getinfo : customer_address_getinfo,
        master_subsidiary_getinfo : master_subsidiary_getinfo,
        master_delivery_destination_getinfo: master_delivery_destination_getinfo
	};

});