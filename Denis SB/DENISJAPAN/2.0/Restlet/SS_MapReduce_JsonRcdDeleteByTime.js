/**
 * delete purchorder
 * 
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime'], function(record, search, runtime) {

    function getInputData() {
    	log.debug("INFO", "json record delete getInputData開始");
    	var script = runtime.getCurrentScript();
        var syncAt = script.getParameter({
            name : 'custscript_jrcreated_time'
        });
        var searchFilters = [];
    	searchFilters.push(["formulanumeric: TO_DATE('" + syncAt + "','yyyy-MM-dd HH24:MI:SS')-{created}","GREATERTHANOREQUALTO","0"]);
    	var searchColumns = [];
	    var internalid = search.createColumn({
	    		            name : 'internalid'
	    		        });
	    searchColumns.push(internalid);
	    var mainId = search.createColumn({
	    		            name : 'custrecord_json_main_id'
	    		        });
	    searchColumns.push(mainId);
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
		var internalids = new Array();
		if(searchResults.length > 0){
			for (var i = 0; i < searchResults.length; i++) {
				var searchResult = searchResults[i];
				var iinternalid = searchResult.getValue('internalid');
				var jsonmainid = searchResult.getValue('custrecord_json_main_id');
				internalids.push({
                    id : iinternalid,
                    mainId : jsonmainid
                });
			}
		}
		log.debug("INFO", "json record delete getInputData終了");
		return internalids;
    }

    function map(context) {
    	log.debug("INFO", "json record map開始");
    	var data = JSON.parse(context.value);
    	var id = data.id;
    	var mainid = data.mainId;
    	log.debug("INFO", "id:" + id);
    	var deletejsRecord = record.delete({
                type: 'customrecord_json_detail',
                id: id,
            });
    	log.debug("INFO", "json record map終了");
    	context.write({
            key : mainid,
            value : context.key
        });
    }

    function reduce(context) {
    	log.debug("INFO", "json record reduce開始");
    	var id = context.key;
    	log.debug("INFO", "mainid:" + id);
    	var recordData = record.load({type:'customrecord_json_main', id:id});
    	var joinId = recordData.getValue({fieldId: 'custrecord_json_main_joinid'});
    	var deletejsRecord = record.delete({
            type: 'customrecord_json_main',
            id: id,
        });
    	var deleteJoinjsRecord = record.delete({
            type: 'customrecord_json_main',
            id: joinId,
        });
  	    log.debug("INFO", "json record reduce終了");
    }
    
    function summarize(summary) {
    	
    }
    return {
        getInputData : getInputData,
        map : map,
        reduce : reduce,
        summarize : summarize
    };

});
