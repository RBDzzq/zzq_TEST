/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([ 'N/search', 'N/record', './Customform_Data_Setting', 'N/log'], function(search, record, customformDataObj, log) {
	
	function INSERT_SALESORDER(setValues, setValue, Constants, val) {
		
    	var valNew = val;
    	if (setValue[Constants.NS_FIELD] == "orderstatus") {

    		valNew = 'B';
    	} else if (setValue[Constants.NS_FIELD] == "custbody_djkk_paymentmethodtyp") {

    		valNew = getCommonType(customformDataObj.DataRecordTypes.customformData['type_19'],val);

    	} else if (setValue[Constants.NS_FIELD] == "custbody_djkk_ordermethodrtyp") {

    		valNew = getCommonTypeId('10', val.toString());

    	}
    	else if (setValue[Constants.NS_FIELD] == "custbody_djkk_shippinginfosendtyp") {

    		valNew = getCommonType(customformDataObj.DataRecordTypes.customformData['type_33'],val);

    	}
    	else if (setValue[Constants.NS_FIELD] == "custbody_djkk_shippinginfodesttyp") {
    		valNew = getCommonType(customformDataObj.DataRecordTypes.customformData['type_34'],val);
    	}
    	else if (setValue[Constants.NS_FIELD] == "orderstatus") {
    		val = "A";
    		valNew = val;
    	}
    	else if (setValue[Constants.NS_FIELD] == "customform") {
    		val = "175";
    		valNew = val;
    	}
    	else if (setValue[Constants.NS_SUBFIELD] == "custcol_djkk_partshortagetyp") {
    		valNew = getCommonType(customformDataObj.DataRecordTypes.customformData['type_35'],val);
    	}else if (setValue[Constants.NS_SUBFIELD] == "item") {
    		valNew = getItemInternalid(val);
    	}else if (setValue[Constants.NS_SUBFIELD] == "taxcode") {
    		valNew = getTaxcodeInternalid(val);
    	}else if (setValue[Constants.NS_FIELD] == "currency") {
    		var currencyIdByCode = getCurrencyIdByCode();
    		valNew = currencyIdByCode[(val.toString())];
    	} else if (setValue[Constants.NS_FIELD] == "custbody_djkk_finet_bills_info") {
    		valNew = getCommonTypeId('39', val.toString());
    	} else if (setValue[Constants.NS_FIELD] == "custbody_djkk_finet_location_type") {
    		valNew = getCommonTypeId('40', val.toString());
    	} 
    	return valNew;
    };
  
  	function INSERT_TRANSFERORDER(setValues, setValue, Constants, val) {
    	var valNew = val;
    	if (setValue[Constants.NS_FIELD] == "orderstatus") {

    		val = "B";
    		valNew = val;
    	}else if (setValue[Constants.NS_FIELD] == "customform") {
    		val = "104";
    		valNew = val;
//    	}else if (setValue[Constants.NS_FIELD] == "dj_customerid") {
//    		
//    		var customerId = getCustomerByEntityId(val.toString());
//    		valNew = customerId;
    	}
    	return valNew;
    };
  
  	function getTaxcodeInternalid(taxCodeVal) {
  		var val = "";
  		var filters = [];
  		filters.push(search.createFilter({
  			name: 'custrecord_djkk_category_code',
  			join: 'custrecord_djkk_exsystemtaxcd',
  			operator: search.Operator.IS,
  			values: taxCodeVal
		}));
		filters.push(search.createFilter({
  			name: 'custrecord_djkk_type_code',
  			join: 'custrecord_djkk_exsystemtaxcd',
  			operator: search.Operator.IS,
  			values: '08'
		}));
  		var results = searchResult(search.Type.SALES_TAX_ITEM, filters, []);
  		if (results.length > 0) {
  			val = results[0].id;
  		}
  		return val;
  		
//  		
//		var val = "";
//		var taxCodeTmp = "";
//		if(taxCodeVal == "01"){
//			taxCodeTmp = "消費税(10%)";
//		}else if(taxCodeVal == "02"){
//			taxCodeTmp = "消費税(8%)";
//		}else if(taxCodeVal == "08"){
//			taxCodeTmp = "非課税";
//		}else if(taxCodeVal == "09"){
//			taxCodeTmp = "免税";
//		}else if(taxCodeVal == "07"){
//			taxCodeTmp = "不課税";
//		}else{
//			taxCodeTmp = taxCodeVal;
//		}
//		var searchFilters = [];
//		var searchColumns = [];
//      	var id = search.createColumn({
//			name : 'internalid'
//        });
//      	searchColumns.push(id);
//      	var exsystemtaxcd = search.createColumn({
//			name : 'custrecord_djkk_exsystemtaxcd'
//        });
//      	searchColumns.push(exsystemtaxcd);
//      	var searchResults = getTableInfo('salestaxitem',searchFilters,searchColumns);
//      	if (searchResults.length > 0) {
//      		for (var i = 0; i < searchResults.length; i++) {
//      			var searchResult = searchResults[i];
//      			if(taxCodeTmp == searchResult.getText('custrecord_djkk_exsystemtaxcd')){
//      				val = searchResult.getValue('internalid');
//      				break;
//      			}
//      		}
//      	}
//      	return val;
	};
	function getItemInternalid(itemId) {
		var val = "";
		var searchFilters = [];
		searchFilters.push(["itemid","is",itemId]);
		var searchColumns = [];
      	var id = search.createColumn({
			name : 'internalid'
        });
      	searchColumns.push(id);
      	searchColumns.push(search.createColumn({name: 'itemid'}));
      	var searchResults = getTableInfo('item',searchFilters,searchColumns);
      	for (var i = 0; i < searchResults.length; i++) {
      		var tmpItemId = searchResults[i].getValue({name: 'itemid'});
      		if (tmpItemId == itemId) {
      			val = searchResults[i].getValue('internalid');
      			break;
      		}
      	}
      	return val;
	}; 
  
	function getCommonType(typeName,typeCode) {
		var val = "";
		var searchFilters = [];
		searchFilters.push(["custrecord_djkk_category_code","is",typeName]);
		searchFilters.push('AND');
		searchFilters.push(["custrecord_djkk_type_code","is",typeCode]);

		var searchColumns = [];
      	var id = search.createColumn({
			name : 'internalid'
        });
      	searchColumns.push(id);
      	var searchResults = getTableInfo('customrecord_djkk_common_type',searchFilters,searchColumns);
      	if (searchResults.length > 0) {
      		val = searchResults[0].getValue('internalid');
      	}
      	return val;
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
    function getCurrencyIdByCode() {
		var objResult = {};
		var columns = [];
		columns.push(search.createColumn({name: 'symbol'}));
		var results = searchResult(search.Type.CURRENCY, [], columns);
		for (var i = 0; i < results.length; i++) {
			var tmpId = results[i].id;
			var tmpCode = results[i].getValue({name: 'symbol'});
			
			objResult[(tmpCode.toString())] = tmpId;
		}
		
		return objResult;
	}
    
    function getCustomerByEntityId(entityid) {
    	var resultId = ''; 
    	
    	var filters = [];
    	filters.push(search.createFilter({
    		name: 'entityid',
    		operator: search.Operator.IS,
    		values: entityid
    	}));
    	var columns = [];
    	var results = searchResult(search.Type.CUSTOMER, filters, columns);
    	if (results.length > 0) {
    		resultId = results[0].id;
    	}
    	return resultId;
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
	
	function getCommonTypeId(typeCode, code) {
		var resultId = '';
		
		var filters = [];
		filters.push(search.createFilter({
			name: 'custrecord_djkk_category_code',
			operator: search.Operator.IS,
			values: typeCode
		}));
		filters.push(search.createFilter({
			name: 'custrecord_djkk_type_code',
			operator: search.Operator.IS,
			values: code
		}));
		var results = searchResult('customrecord_djkk_common_type', filters, []);
		if (results.length > 0) {
			resultId = results[0].id;
		}
		return resultId;
	}
	
	return {
		INSERT_SALESORDER : INSERT_SALESORDER,
     INSERT_TRANSFERORDER : INSERT_TRANSFERORDER,
	};

});
