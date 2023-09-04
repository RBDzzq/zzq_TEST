/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/log'], function(search, record, log) {

    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     * 
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
        var allSearchResult = [];

        var resultStep = 1000;
        var resultIndex = 0;

        var objSearch = search.load({id: 'customsearch440'});
        
        var resultSet = objSearch.run();
        var results = [];

        do {
            results = resultSet.getRange({start: resultIndex, end: resultIndex + resultStep});
            if (results != null && results != '') {
                for (var i = 0; i < results.length; i++) {
                    var tmpResult = results[i];

                    var tmpDate = tmpResult.getValue({name: 'custrecord_djkk_shipment_date', join: 'inventoryDetailLines'});
                    var tmpNumber = tmpResult.getValue({name: 'inventorynumber'});

                    if (tmpDate == null || tmpDate == '') {
                    	resultIndex++;
                        continue;
                    }
                    allSearchResult.push({
                        id: tmpNumber,
                        date: tmpDate
                    });
                    

                    resultIndex++;
                }
            }
        } while(results.length > 0);
        return allSearchResult;
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     * 
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
        var info = JSON.parse(context.value);
        try {
        	record.submitFields({
                type: record.Type.INVENTORY_NUMBER,
                id: info['id'],
                values: {
                    custitemnumber_djkk_shipment_date: info['date']
                }
            });	
        } catch(e) {
        	log.error({
        		title: 'map',
        		details: JSON.stringify(e)
        	});
        }
         
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     * 
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {
    }

    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     * 
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
    }

    return {
        getInputData : getInputData,
        map : map,
        reduce : reduce,
        summarize : summarize
    };

});