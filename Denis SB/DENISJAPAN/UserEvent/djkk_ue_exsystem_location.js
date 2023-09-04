/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/log', 'N/ui/serverWidget'], function(record, search, log, serverWidget) {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
    	function beforeLoad(scriptContext) {
//    		var currentForm = scriptContext.form;
//    		var currentRecord = scriptContext.newRecord;
//    		
//    		var strDelivery = currentRecord.getValue({fieldId: 'custrecord_djkk_deliverydestid'});
//    		var currentDeliveryIds = [];
//    		if (strDelivery.indexOf('|') >= 0) {
//    			var tmp = strDelivery.split('|')[1].split(',');
//    			for (var i = 0; i < tmp.length; i++) {
//    				currentDeliveryIds.push(tmp[i].toString());
//    			}
//    		}
//    		
//        	var fieldDelivery = currentForm.addField({
//        		id: 'custpage_djkk_delivery',
//        		label: 'DJ_納品先',
//        		type: serverWidget.FieldType.MULTISELECT,
//        	});
//        	
//        	var filters = [];
//        	var columns = [];
//        	columns.push(search.createColumn({name: 'name'}));
//        	columns.push(search.createColumn({name: 'custrecord_djkk_delivery_code'}));
//        	var results = searchResult('customrecord_djkk_delivery_destination', filters, columns);
//        	for (var i = 0; i < results.length; i++) {
//        		var tmpId = results[i].id;
//        		var tmpName = results[i].getValue({name: 'name'});
//        		var tmpCode = results[i].getValue({name: 'custrecord_djkk_delivery_code'});
//        		
//        		fieldDelivery.addSelectOption({
//        			value: tmpId,
//        			text: tmpCode + ' ' + tmpName,
//        		});
//        	}
//        	
//        	currentRecord.setValue({
//        		fieldId: 'custpage_djkk_delivery',
//        		value: currentDeliveryIds
//        	});
        }
        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function beforeSubmit(scriptContext) {
        	var type = scriptContext.type;
            if (type != scriptContext.UserEventType.DELETE) {
            	var newRecord = scriptContext.newRecord;
            	
            	var strCodes = '';
            	
        		var deliveryIds = newRecord.getValue({fieldId: 'custrecord_djkk_location_delivery'});	
        		var deliveryCodes = [];
            	
            	if (deliveryIds != null && deliveryIds != '' && deliveryIds.length > 0) {
            		
            		var filters = [];
            		filters.push(search.createFilter({
            			name: 'internalid',
            			operator: search.Operator.ANYOF,
            			values: deliveryIds
            		}));
            		var columns = [];
            		columns.push(search.createColumn({name: 'custrecord_djkk_delivery_code'}));
            		var results = searchResult('customrecord_djkk_delivery_destination', filters, columns);
            		for (var i = 0; i < results.length; i++) {
            			var currentCode = results[i].getValue({name: 'custrecord_djkk_delivery_code'});
            			if (deliveryCodes.indexOf(currentCode.toString()) < 0) {
            				deliveryCodes.push(currentCode.toString());
            			}
            		}
            		
            		if (deliveryCodes.length > 0) {
                		strCodes += '&' + deliveryCodes.join('&,&') + '&';
                		strCodes += '|' + deliveryIds.join(',');
                	}
            	}
            	
            	newRecord.setValue({
            		fieldId: 'custrecord_djkk_deliverydestid',
            		value: strCodes 
            	});
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function afterSubmit(context) {
        	var contextType = context.type;
        	if (contextType != 'delete') {
        		var currentRecord = context.newRecord;

        		var recordId = currentRecord.id;
        		var recordType = currentRecord.type;
        		
        		var parent = currentRecord.getValue({fieldId: 'parent'});
        		
        		try {
        			record.submitFields({
        				type: recordType,
        				id: recordId,
        				values: {
        					custrecord_djkk_exsystem_parent_location: parent
        				}
        			});
        		} catch(error) {
        			log.error({
        				title: 'afterSubmit',
        				details: error.message
        			});
        		}
        	}
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
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });
