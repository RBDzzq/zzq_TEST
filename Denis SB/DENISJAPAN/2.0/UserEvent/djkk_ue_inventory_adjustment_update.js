/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
 define(['N/record', 'N/search', 'N/log', 'N/runtime'], function(record, search, log, runtime) {
	 /**
	     * Function definition to be triggered before record is loaded.
	     * 
	     * @param {Object} scriptContext
	     * @param {Record} scriptContext.newRecord - New record
	     * @param {string} scriptContext.type - Trigger type
	     * @param {Form} scriptContext.form - Current form
	     * @Since 2015.2
	     */
	    function beforeLoad(scriptContext) {
	    	var type=scriptContext.type;
	    	var record=scriptContext.newRecord;
	    	try{
//	    	 var acc = runtime.getCurrentScript().getParameter({
//                 name:'DJRecordId'
//             });
//           var numLines = record.getLineCount({
//	                sublistId: 'inventory'
//	            });
//	    	 log.debug('numLines', numLines);
//	            for (var i = 0; i < numLines; i++) {
//	            	
//	            	var location = record.getSublistValue({
//	                    sublistId : 'inventory',
//	                    fieldId : 'location',
//	                    line: i
//	                });
//	            	
//	            	var inventorydetail = record.getSublistSubrecord({
//	            		sublistId: 'inventory',
//	            		fieldId: 'inventorydetail',
//	            		line: i
//	            	});
//
//	            	var inventorydetailNumLines = record.getLineCount({
//		                sublistId: 'inventoryassignment'
//		            });
//	            	
//	            	log.debug('inventorydetailNumLines', inventorydetailNumLines);
//	            	
//	            	inventorydetail.setSublistValue({
//	                    sublistId : 'inventoryassignment',
//	                    fieldId : 'issueinventorynumber',
//	                    line: 0,
//	                    value : 2361
//	                });
//	            	
//	            	
//	    		}
//	    	 
	    	 
             
              
//	    	record.setValue({
//				fieldId: 'subsidiary',
//				value: '6'
//			});
//	    	record.selectNewLine({ 
//	    		sublistId:'inventory'
//	    		});
//	    	 record.setCurrentSublistValue({
//                 sublistId: 'inventory',
//                 fieldId: 'item',
//                 value:'3783',
//                 ignoreFieldChange:true
//             });
	    	}catch(e){
	    		log.debug('e',e);
	    	}
//	    	
//	    	record.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'item', value: '3783'});
//	    	record.setCurrentSublistText({ sublistId:'inventory',fieldId:'location',value:'1205'});
//	    	record.setCurrentSublistValue({ sublistId:'inventory',fieldId:'adjustqtyby',value:Number('10')});
//	    	const sb = record.getCurrentSublistSubrecord({ sublistId:'inventory', fieldId:'inventorydetail' });
//	    	record.selectNewLine({ sublistId:'inventoryassignment'});
//	    	record.setCurrentSublistText({ sublistId: 'inventoryassignment',fieldId: 'receiptinventorynumber', value: 'test1234556'}); 
//	    	record.commitLine({ sublistId:'inventoryassignment'});
//	    	record.commitLine({ sublistId:'inventory' });

	    }
    /**
     * Function definition to be triggered before record is loaded.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
        
            
    }

    /**
     * Function definition to be triggered before record is loaded.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
        // �ｿｽV�ｿｽK�ｿｽﾆ編集�ｿｽﾌ場合
        if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
            // �ｿｽ�ｿｽ�ｿｽR�ｿｽ[�ｿｽh�ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ謫ｾ�ｿｽ�ｿｽ�ｿｽ�ｿｽ
            var newRecord = scriptContext.newRecord;
            var recordId = newRecord.id;
            
            var allInventoryNumber = [];
            var filters = [];
            filters.push(search.createFilter({
            	name: 'internalid',
            	operator: search.Operator.IS,
            	values: recordId
            }));
            var columns = [];
            columns.push(search.createColumn({name: 'inventorynumber', join: 'inventorydetail'}));
            var results = searchResult(search.Type.INVENTORY_ADJUSTMENT, filters, columns);
            if (results != null && results != '') {
            	for (var i = 0; i < results.length; i++) {
            		var tmpInventoryNumber = results[i].getValue({name: 'inventorynumber', join: 'inventorydetail'});
            		if (tmpInventoryNumber != null && tmpInventoryNumber != '') {
            			if (allInventoryNumber.indexOf(tmpInventoryNumber) < 0) {
                			allInventoryNumber.push(tmpInventoryNumber);
                		}
            		}
            	}
            }
            
            if (allInventoryNumber.length > 0) {
            	for (var i = 0; i < allInventoryNumber.length; i++) {
            		record.submitFields({
            			type: record.Type.INVENTORY_NUMBER,
            			id: allInventoryNumber[i],
            			values: {
            				custitemnumber_djkk_in_update_datetime: new Date()
            			}
            		});
            	}
            }
            
        }
    }
    /**
     * �ｿｽ�ｿｽ�ｿｽﾊ鯉ｿｽ�ｿｽ�ｿｽ�ｿｽt�ｿｽ@�ｿｽ�ｿｽ�ｿｽN�ｿｽV�ｿｽ�ｿｽ�ｿｽ�ｿｽ
     * @param searchType �ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽﾎ擾ｿｽ
     * @param filters �ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ
     * @param columns �ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽﾊ暦ｿｽ
     * @returns �ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ�ｿｽ
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
    return {
    	beforeLoad : beforeLoad,
        beforeSubmit : beforeSubmit,
        afterSubmit : afterSubmit
    };
});
