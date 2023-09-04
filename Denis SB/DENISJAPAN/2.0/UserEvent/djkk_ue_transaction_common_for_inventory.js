/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/log', 'N/ui/serverWidget'], function(record, search, log, serverWidget) {

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
		var currentForm = scriptContext.form;
		var currentRecordType = scriptContext.newRecord.Type;
      if ([record.Type.SALES_ORDER, record.Type.TRANSFER_ORDER].indexOf(currentRecordType) >= 0) {
        var fieldInventoryInfo = currentForm.getField({id: 'custbody_djkk_exsystem_line_inventory'});
		fieldInventoryInfo.updateDisplayType({
			displayType: serverWidget.FieldDisplayType.HIDDEN
		});
      }
		
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
        if (scriptContext.type == scriptContext.UserEventType.DELETE) {

			var recordType = scriptContext.oldRecord.type;

          	var allInventoryNumber = [];
            var filters = [];
            filters.push(search.createFilter({
              name: 'internalid',
              operator: search.Operator.IS,
              values: scriptContext.oldRecord.id
            }));
            var columns = [];
            columns.push(search.createColumn({name: 'inventorynumber', join: 'inventorydetail'}));
            var results = searchResult(search.Type.TRANSACTION, filters, columns);
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
          
			if (recordType == record.Type.SALES_ORDER || recordType == record.Type.TRANSFER_ORDER) {
				var currentRecord = record.load({
					type: recordType,
					id: scriptContext.oldRecord.id,
					isDynamic: true
				});

			
				var tmpExsystemTranId = currentRecord.getValue({fieldId: 'custbody_djkk_exsystem_tranid'});
				if (tmpExsystemTranId != null && tmpExsystemTranId != '') {
						
					var status = currentRecord.getValue({fieldId: 'orderstatus'});
		
					if (status != 'A') {
						var objUpdateInfo = {}
						var arrAllItem = [];
						var arrAllLocation = [];
						var arrAllInventoryNumber = [];
	
						var lineCount = currentRecord.getLineCount({sublistId: 'item'});
	
						for (var i = 0; i < lineCount; i++) {
							currentRecord.selectLine({sublistId: 'item', line: i});
	
							var flgHasSubrecord = currentRecord.hasCurrentSublistSubrecord({
								sublistId: 'item',
								fieldId: 'inventorydetail'
							});
	log.debug({
		title: 'flgHasSubrecord',
		details: flgHasSubrecord
	})
							if (flgHasSubrecord) {
								var currentSubrecord = currentRecord.getCurrentSublistSubrecord({
									sublistId: 'item',
									fieldId: 'inventorydetail'
								});
	
								var currentSubrecordLineCount = currentSubrecord.getLineCount({sublistId: 'inventoryassignment'});
	
								for (var j = 0; j < currentSubrecordLineCount; j++) {
									currentSubrecord.selectLine({
										sublistId: 'inventoryassignment',
										line: j
									});
	
									var currentItem = currentRecord.getCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'item'
									});
	
									var currentLocation = '';
									if (currentRecord.type != record.Type.TRANSFER_ORDER) {
										currentLocation = currentRecord.getCurrentSublistValue({
											sublistId: 'item',
											fieldId: 'location'
										})
									} else {
										currentLocation = currentRecord.getValue({fieldId: 'location'});
									}
	
									var currentInventoryNumber = currentSubrecord.getCurrentSublistValue({
										sublistId: 'inventoryassignment',
										fieldId: 'issueinventorynumber'
									});
	
									var currentQuantity = currentSubrecord.getCurrentSublistValue({
										sublistId: 'inventoryassignment',
										fieldId: 'quantity'
									});
	
									if (arrAllItem.indexOf(currentItem.toString()) < 0) {
										arrAllItem.push(currentItem.toString());
									}
                                  log.debug({
                                    title: 'test- currentItem',
                                    details: currentItem
                                  });
                                    if (currentItem != null && currentItem != '') {
                                        if (arrAllItem.indexOf(currentItem.toString()) < 0) {
										    arrAllItem.push(currentItem.toString());
									    }
                                    }
log.debug({
                                    title: 'test- currentLocation',
                                    details: currentLocation
                                  });
                                    if (currentLocation != null && currentLocation != '') {
                                        if (arrAllLocation.indexOf(currentLocation.toString()) < 0) {
										    arrAllLocation.push(currentLocation.toString());
									    }
                                    }
									log.debug({
                                    title: 'test- currentInventoryNumber',
                                    details: currentInventoryNumber
                                  });
	                                if (currentInventoryNumber != null && currentInventoryNumber != '') {
                                        if (arrAllInventoryNumber.indexOf(currentInventoryNumber.toString()) < 0) {
										    arrAllInventoryNumber.push(currentInventoryNumber.toString());
									    }
                                    }
	
									var tmpKey = [currentItem, currentLocation, currentInventoryNumber].join('-')
	
									if (objUpdateInfo.hasOwnProperty(tmpKey)) {
										objUpdateInfo[tmpKey] = objUpdateInfo[tmpKey] - currentQuantity;
									} else {
										objUpdateInfo[tmpKey] = 0 - currentQuantity;
									}
								}
							}
						}

						var objCustomRecordInfo = {};
	
						if (arrAllItem.length > 0 || arrAllLocation.length > 0 || arrAllInventoryNumber.length > 0) {
							var filters = [];
							var tmpItemFilter = [];
							arrAllItem.map(function(tmpItem, index) {
								tmpItemFilter.push(['custrecord_djkk_exsystem_iq_item', 'is', tmpItem.toString()]);
								if (index != arrAllItem.length - 1) {
									tmpItemFilter.push('or');
								}
							});
							var tmpLocationFilter = [];
							arrAllLocation.map(function(tmpLocation, index) {
								tmpLocationFilter.push(['custrecord_djkk_exsystem_iq_location', 'is', tmpLocation.toString()]);
								if (index != arrAllLocation.length - 1) {
									tmpLocationFilter.push('or');
								}
							});
							var tmpInventoryNumberFilter = [];
							arrAllInventoryNumber.map(function(tmpInventoryNumber, index) {
								tmpInventoryNumberFilter.push(['custrecord_djkk_exsystem_iq_inventory', 'is', tmpInventoryNumber.toString()]);
								if (index != arrAllInventoryNumber.length - 1) {
									tmpInventoryNumberFilter.push('or');
								}
							});
		
							filters.push(tmpItemFilter);
							if (tmpLocationFilter.length <= 0) {
								filters.push('and');
								filters.push(tmpLocationFilter);
							}
							
							if (tmpInventoryNumberFilter.length <= 0) {
								filters.push('and');
								filters.push(tmpInventoryNumberFilter);
							}
		
							var columns = [];
							columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_item'}));
							columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_location'}));
							columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_inventory'}));
							columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_quantity'}));
							var results = searchResult('customrecord_djkk_exsystem_item_quantity', filters, columns);
							results.map(function(tmpResult) {
								var tmpItem = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_item'});
								var tmpLocation = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_location'});
								var tmpInventoryNumber = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_inventory'});
		
								var tmpKey = [tmpItem, tmpLocation, tmpInventoryNumber].join('-');
		
								objCustomRecordInfo[tmpKey] = {
									id: tmpResult.id,
									quantity: Number(tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_quantity'}))
								};
							});
						}
	
						log.debug({
							title: 'objCustomRecordInfo',
							details: JSON.stringify(objCustomRecordInfo)
						});
						log.debug({
							title: 'objUpdateInfo',
							details: JSON.stringify(objUpdateInfo)
						});
	
						for (var key in objUpdateInfo) {
							var recordInfo = objCustomRecordInfo[key];
	
                          	// TODO
                            record.submitFields({
                                type: record.Type.INVENTORY_NUMBER,
                                id: key.split('-')[2],
                                values: {
                                    custitemnumber_djkk_in_update_datetime: new Date()
                                }
                            });
							record.submitFields({
								type: 'customrecord_djkk_exsystem_item_quantity',
								id: recordInfo.id,
								values: {
									custrecord_djkk_exsystem_iq_quantity: recordInfo.quantity + objUpdateInfo[key]
								}
							});
						}
					}
				}
			}
		}
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
    	log.audit({
    		title: 'ue inventory number',
    		details: 'aftersubmit start ' + scriptContext.type
    	});
    	
    	if (scriptContext.type != scriptContext.UserEventType.DELETE) {
    		
    		var oldRecord = scriptContext.oldRecord;
    		var newRecord = scriptContext.newRecord;
    		var recordId = newRecord.id;
            var recordType = newRecord.type;
            
            var currentRecord = record.load({
            	type: recordType,
            	id: recordId
            });
            
            var tmpExsystemTranId = currentRecord.getValue({fieldId: 'custbody_djkk_exsystem_tranid'});
            if ((recordType == record.Type.SALES_ORDER || recordType == record.Type.TRANSFER_ORDER) && (tmpExsystemTranId != null && tmpExsystemTranId != '')) {
            	// 外部システムから作成したの注文書、移動伝票である場合
            	try {
            		updateExsystemLotQuantity(scriptContext.type, oldRecord, currentRecord);	
            	} catch(error) {
            		log.error({
            			title: 'updateExsystemLotQuantity - error',
            			details: error
            		});
            	}
            	
            }
            
    		// 新規と編集の場合
            if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
                // レコード情報を取得する
                
                var allInventoryNumber = [];
                var filters = [];
                filters.push(search.createFilter({
                	name: 'internalid',
                	operator: search.Operator.IS,
                	values: recordId
                }));
                var columns = [];
                columns.push(search.createColumn({name: 'inventorynumber', join: 'inventorydetail'}));
                var results = searchResult(search.Type.TRANSACTION, filters, columns);
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
                
                var lineCount = currentRecord.getLineCount({sublistId: 'item'});
                log.debug({title: 'aftersubmit - line', details: ((recordType != record.Type.SALES_ORDER && recordType != record.Type.TRANSFER_ORDER) || 
                    ((recordType == record.Type.SALES_ORDER || recordType == record.Type.TRANSFER_ORDER) && tmpExsystemTranId == '') ||
                    (recordType == record.Type.INVENTORY_ADJUSTMENT))});
                // 2023-02-24 EvangSol楊 UIから作成するの注文書、移動伝票にも「DJ_外部システム_行番号」を採番できるように条件改修 START
                // if (recordType != record.Type.SALES_ORDER && recordType != record.Type.TRANSFER_ORDER) {
                if ( (recordType != record.Type.SALES_ORDER && recordType != record.Type.TRANSFER_ORDER) || 
                    ((recordType == record.Type.SALES_ORDER || recordType == record.Type.TRANSFER_ORDER) && tmpExsystemTranId == '')) {
                // 2023-02-24 EvangSol楊 UIから作成するの注文書、移動伝票にも「DJ_外部システム_行番号」を採番できるように条件改修 END
                	for (var i = 0; i < lineCount; i++) {
                		// 2022-10-17 add by liu 改修前のバックアップ
//                		currentRecord.setSublistValue({
//                    		sublistId: 'item',
//                    		fieldId: 'custcol_djkk_exsystem_line_num',
//                    		line: i,
//                    		value: i + 1
//                    	});
                		
                		// 2022-10-17 add by liu 改修start
                		var itemType = currentRecord.getSublistValue({
            				sublistId: 'item',
            				fieldId: 'itemtype',
            				line: i
            			});
                		log.debug({title: 'test-itemType', details: itemType});
                		if(itemType != 'EndGroup'){
                			currentRecord.setSublistValue({
                        		sublistId: 'item',
                        		fieldId: 'custcol_djkk_exsystem_line_num',
                        		line: i,
                        		value: i + 1
                        	});
                		}
                		// 2022-10-17 add by liu 改修end
                    }	
                }
                
                if (recordType == record.Type.INVENTORY_ADJUSTMENT) {
                    // 在庫調整である場合
                    var numInventoryLineCount = currentRecord.getLineCount({sublistId: 'inventory'});
                    for (var i = 0; i < numInventoryLineCount; i++) {
                        currentRecord.setSublistValue({
                            sublistId: 'inventory',
                            fieldId: 'custcol_djkk_exsystem_line_num',
                            line: i,
                            value: i + 1
                        });
                    }
                }

                if (recordType == record.Type.WORK_ORDER) {
                	// ワークオーダーである場合
                	
                	var currentAssembly = currentRecord.getValue({
                		fieldId: 'assemblyitem'
                	});
                	var currentHeaderQuantity = currentRecord.getValue({
                		fieldId: 'quantity'
                	});
                	var currentBillOfMaterial = currentRecord.getValue({
                		fieldId: 'billofmaterials'
                	});
                	currentRecord.setValue({
                		fieldId: 'custbody_djkk_exsystem_wo_assembly',
                		value: currentAssembly
                	});
                	
                	currentRecord.setValue({
                		fieldId: 'custbody_djkk_exsystem_wo_quantity',
                		value: currentHeaderQuantity
                	});
                	
                	currentRecord.setValue({
                		fieldId: 'custbody_djkk_exsystem_wo_billmaterial',
                		value:currentBillOfMaterial
                	});
                } 
                // add by song 2022/11/21 U814 start
                if(recordType == record.Type.SALES_ORDER){
                	var intercotransaction = currentRecord.getValue({
                		fieldId: 'intercotransaction'
                	});
                	if(intercotransaction != ''){
                		currentRecord.setValue({
                    		fieldId: 'custbody_djkk_delivery_date',
                    		value:new Date()
                    	});
                	}
                }
                // add by song 2022/11/21 U814 end
                currentRecord.save();
            }
    	}
    }
    
    function updateExsystemLotQuantity(contextType, oldRecord, newRecord) {
    	
    	var allItems = [];
    	var allLocations = [];
    	var allLotIds = [];
    	
    	var oldStatus = (oldRecord != null && oldRecord != '') ? oldRecord.getValue({fieldId: 'orderstatus'}) : '';
    	
    	var newStatus = newRecord.getValue({fieldId: 'orderstatus'});
    	
    	log.debug({
    		title: 'updateExsystemLotQuantity - oldStatus',
    		details: oldStatus
    	});
    	
    	log.debug({
    		title: 'updateExsystemLotQuantity - newStatus',
    		details: newStatus
    	});
    	
    	log.debug({
    		title: 'updateExsystemLotQuantity - contextType',
    		details: contextType
    	});
    	
    	
    	if (['A', 'B', ''].indexOf(oldStatus) >= 0 || ['A', 'B'].indexOf(newStatus) >= 0) {
    		
    		var allKey = [];
    		
    		var oldLotInfo = {};
    		
			var strLotInfo = '';
            if (oldRecord != null && oldRecord != '') {
                strLotInfo = search.lookupFields({
					type: oldRecord.type,
					id: oldRecord.id,
					columns: ['custbody_djkk_exsystem_line_inventory']
				})['custbody_djkk_exsystem_line_inventory'];
            }

          	log.debug({
                title: 'strLotInfo',
              	details: JSON.stringify(strLotInfo)
            });
			if (strLotInfo != null && strLotInfo != '') {
				oldLotInfo = JSON.parse(strLotInfo);
                Object.keys(oldLotInfo).forEach(function(tmpKey) {
					if (allKey.indexOf(tmpKey) < 0) {
						allKey.push(tmpKey);
					}
                  var arrOldKeys = tmpKey.split('-');
              if (allItems.indexOf(arrOldKeys[0].toString()) < 0) {
						allItems.push(arrOldKeys[0].toString());
					}
					if (allLocations.indexOf(arrOldKeys[1].toString()) < 0) {
						allLocations.push(arrOldKeys[1].toString());
					}
					if (allLotIds.indexOf(arrOldKeys[2].toString()) < 0) {
						allLotIds.push(arrOldKeys[2].toString());
					}
				});
              
			} else {
				if (oldRecord != null && oldRecord != '') {
					var oldLineCount = oldRecord.getLineCount({sublistId: 'item'});
					for (var oldLineNum = 0; oldLineNum < oldLineCount; oldLineNum++) {
						var currentItem = oldRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: oldLineNum
						});
						var currentLocation = oldRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'location',
							line: oldLineNum
						});
						
						var flgHasSubrecord = oldRecord.hasSublistSubrecord({
							sublistId: 'item',
							fieldId: 'inventorydetail',
							line: oldLineNum
						});
						if (flgHasSubrecord) {
							var tmpSubrecord = oldRecord.getSublistSubrecord({
								sublistId: 'item',
								fieldId: 'inventorydetail',
								line: oldLineNum
							});
							var tmpSubRecordLineCount = tmpSubrecord.getLineCount({sublistId: 'inventoryassignment'});
							for (var subLineNum = 0; subLineNum < tmpSubRecordLineCount; subLineNum++) {
								var currentLotId = tmpSubrecord.getSublistValue({
									sublistId: 'inventoryassignment',
									fieldId: 'issueinventorynumber',
									line: subLineNum
								});
								
								var currentLotQuantity = Number(tmpSubrecord.getSublistValue({
									sublistId: 'inventoryassignment',
									fieldId: 'quantity',
									line: subLineNum
								}));
								
								if (allItems.indexOf(currentItem.toString()) < 0) {
									allItems.push(currentItem.toString());
								}
								if (newRecord.type != record.Type.TRANSFER_ORDER) {
									if (allLocations.indexOf(currentLocation.toString()) < 0) {
										allLocations.push(currentLocation.toString());
									}
								}
								if (allLotIds.indexOf(currentLotId.toString()) < 0) {
									allLotIds.push(currentLotId.toString());
								}
								
								var tmpKey = [currentItem, currentLocation, currentLotId].join('-');
								if (oldLotInfo.hasOwnProperty(tmpKey)) {
									oldLotInfo[tmpKey] = Number(oldLotInfo[tmpKey]) + currentLotQuantity;
								} else {
									oldLotInfo[tmpKey] = currentLotQuantity;
								}
								
								if (allKey.indexOf(tmpKey) < 0) {
									allKey.push(tmpKey);
								}
							}
						}
					}
					
				}
			}
			log.debug({
				title: 'oldLotInfo',
				details: JSON.stringify(oldLotInfo)
			});
    		
    		log.debug({
    			title: 'allKey',
    			details: JSON.stringify(allKey)
    		});
    		
    		var newLotInfo = {}; 
    		
    		var newLineCount = newRecord.getLineCount({sublistId: 'item'});
    		
    		for (var newLineNum = 0; newLineNum < newLineCount; newLineNum++) {
    			var currentItem = newRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'item',
    				line: newLineNum
    			});
    			var currentLocation = '';
				if (newRecord.type == record.Type.TRANSFER_ORDER) {
					currentLocation = newRecord.getValue({
						fieldId: 'location'
					});
				} else {
					currentLocation = newRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'location',
						line: newLineNum
					})
				}
    			
    			var flgHasSubrecord = newRecord.hasSublistSubrecord({
    				sublistId: 'item',
    				fieldId: 'inventorydetail',
    				line: newLineNum
    			});
    			if (flgHasSubrecord) {
    				var tmpSubrecord = newRecord.getSublistSubrecord({
    					sublistId: 'item',
    					fieldId: 'inventorydetail',
    					line: newLineNum
    				});
    				var tmpSubRecordLineCount = tmpSubrecord.getLineCount({sublistId: 'inventoryassignment'});
    				for (var subLineNum = 0; subLineNum < tmpSubRecordLineCount; subLineNum++) {
    					var currentLotId = tmpSubrecord.getSublistValue({
    						sublistId: 'inventoryassignment',
    						fieldId: 'issueinventorynumber',
    						line: subLineNum
    					});
    					
    					var currentLotQuantity = Number(tmpSubrecord.getSublistValue({
    						sublistId: 'inventoryassignment',
    						fieldId: 'quantity',
    						line: subLineNum
    					}));
    					
    					if (allItems.indexOf(currentItem.toString()) < 0) {
    						allItems.push(currentItem.toString());
    					}
						if (newRecord.type != record.Type.TRANSFER_ORDER) {
							if (allLocations.indexOf(currentLocation.toString()) < 0) {
								allLocations.push(currentLocation.toString());
							}
						}

    					if (allLotIds.indexOf(currentLotId.toString()) < 0) {
    						allLotIds.push(currentLotId.toString());
    					}
    					
    					var tmpKey = [currentItem, currentLocation, currentLotId].join('-');
    					if (newLotInfo.hasOwnProperty(tmpKey)) {
    						newLotInfo[tmpKey] = Number(newLotInfo[tmpKey]) + currentLotQuantity;
    					} else {
    						newLotInfo[tmpKey] = currentLotQuantity;
    					}
    					if (allKey.indexOf(tmpKey) < 0) {
    						allKey.push(tmpKey);
    					}
    				}
    			}
    		}
    		
    		log.debug({
    			title: 'newLotInfo',
    			details: JSON.stringify(newLotInfo)
    		});
    		log.debug({
    			title: 'allKey',
    			details: JSON.stringify(allKey)
    		});
    		var updateInfo = {};
    		for (var keyIndex = 0; keyIndex < allKey.length; keyIndex++) {
    			var tmpKey = allKey[keyIndex];
    			if (((['A', ''].indexOf(oldStatus) >= 0) && newStatus == 'B') || contextType == 'approve') {
            		// ステータスが「承認保留」から「配送保留」に更新された場合
    				if (newLotInfo.hasOwnProperty(tmpKey)) {
    					updateInfo[tmpKey] = Number(newLotInfo[tmpKey]);	
    				}
            	}
            	
            	if (oldStatus == 'B' && newStatus == 'A') {
            		// ステータスが「配送保留」から「承認保留」に更新された場合
            		if (newLotInfo.hasOwnProperty(tmpKey)) {
    					updateInfo[tmpKey] = 0 - Number(newLotInfo[tmpKey]);	
    				}
            	}
            	
            	if (oldStatus == 'B' && newStatus == 'B') {
            		// ステータス変更なしの場合
            		var flgOldHasKey = oldLotInfo.hasOwnProperty(tmpKey);
            		var flgNewHasKey = newLotInfo.hasOwnProperty(tmpKey);
            		if (flgOldHasKey && flgNewHasKey) {
            			updateInfo[tmpKey] = Number(newLotInfo[tmpKey]) - Number(oldLotInfo[tmpKey]); 
            		}
            		if (flgOldHasKey && !flgNewHasKey) {
            			updateInfo[tmpKey] = 0 - Number(oldLotInfo[tmpKey]);
            		}
            		
            		if (!flgOldHasKey && flgNewHasKey) {
            			updateInfo[tmpKey] = Number(newLotInfo[tmpKey]);
            		}
            	}	
    		}
    		
			if (newRecord.type == record.Type.TRANSFER_ORDER) {
				allLocations.push(newRecord.getValue({fieldId: 'location'}).toString());
			}

    		log.debug({
    			title: 'updateExsystemLotQuantity - updateInfo',
    			details: JSON.stringify(updateInfo)
    		});
    		
    		log.debug({
    			title: 'updateExsystemLotQuantity - allItems',
    			details: JSON.stringify(allItems)
    		});
    		log.debug({
    			title: 'updateExsystemLotQuantity - allLocations',
    			details: JSON.stringify(allLocations)
    		});
    		log.debug({
    			title: 'updateExsystemLotQuantity - allLotIds',
    			details: JSON.stringify(allLotIds)
    		});
    		if (allItems.length > 0 && allLocations.length > 0 && allLotIds.length > 0) {
    			
    			var objRecordInfoByKey = {};
    			
    			var filters = [];
    			var tmpFilters = [];
    			filters.push(['isinactive', search.Operator.IS, false]);
    			filters.push('and');
    			tmpFilters = [];
    			for (var i = 0; i < allItems.length; i++) {
    				tmpFilters.push(['custrecord_djkk_exsystem_iq_item', search.Operator.IS, allItems[i].toString()]);
    				if(i != allItems.length - 1) {
    					tmpFilters.push('or');	
    				}
    			}
    			filters.push(tmpFilters);
    			
    			filters.push('and');
    			tmpFilters = [];
    			for (var i = 0; i < allLocations.length; i++) {
    				tmpFilters.push(['custrecord_djkk_exsystem_iq_location', search.Operator.IS, allLocations[i].toString()]);
    				if(i != allLocations.length - 1) {
    					tmpFilters.push('or');	
    				}
    			}
    			filters.push(tmpFilters);
    			
    			filters.push('and');
    			tmpFilters = [];
    			for (var i = 0; i < allLotIds.length; i++) {
    				tmpFilters.push(['custrecord_djkk_exsystem_iq_inventory', search.Operator.IS, allLotIds[i].toString()]);
    				if(i != allLotIds.length - 1) {
    					tmpFilters.push('or');	
    				}
    			}
    			filters.push(tmpFilters);
    			
    			var columns = [];
    			columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_item'}));
    			columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_location'}));
    			columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_inventory'}));
    			columns.push(search.createColumn({name: 'custrecord_djkk_exsystem_iq_quantity'}));
    			var results = searchResult('customrecord_djkk_exsystem_item_quantity', filters, columns);
    			for (var i = 0; i < results.length; i++) {
    				var tmpResult = results[i];
    				var tmpId = tmpResult.id;
    				var tmpItem = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_item'});
    				var tmpLocation = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_location'});
    				var tmpLotId = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_inventory'});
    				var tmpQuantity = tmpResult.getValue({name: 'custrecord_djkk_exsystem_iq_quantity'});
    				
    				var tmpKey = [tmpItem, tmpLocation, tmpLotId].join('-');
    				objRecordInfoByKey[tmpKey] = {
    					id: tmpId,
    					quantity: Number(tmpQuantity)
    				};
    			}
    			
    			log.debug({
    				title: 'updateInfo',
    				details: JSON.stringify(updateInfo)
    			});
    			
    			log.debug({
    				title: 'objRecordInfoByKey',
    				details: JSON.stringify(objRecordInfoByKey)
    			});
    			
    			for (var updateKey in updateInfo) {
        			var updateQuantity = Number(updateInfo[updateKey]);
        			var tmpItem = updateKey.split('-')[0];
        			var tmpLocation = updateKey.split('-')[1];
        			var tmpLot = updateKey.split('-')[2];
        			
        			if (objRecordInfoByKey.hasOwnProperty(updateKey)) {
        				var tmpRecordInfo = objRecordInfoByKey[updateKey];
        				record.submitFields({
        					type: 'customrecord_djkk_exsystem_item_quantity',
        					id: tmpRecordInfo.id,
        					values: {
        						custrecord_djkk_exsystem_iq_quantity: Number(tmpRecordInfo.quantity) + updateQuantity
        					}
        				});
        				log.audit({
        					title: '外部システム在庫数量管理レコード更新',
        					details: 'ID: ' + tmpRecordInfo.id + ' quantity: ' + (Number(tmpRecordInfo.quantity) + updateQuantity)
        				});
        			} else {
        				var tmpRecord = record.create({type: 'customrecord_djkk_exsystem_item_quantity'});
        				tmpRecord.setValue({
        					fieldId: 'custrecord_djkk_exsystem_iq_item',
        					value: tmpItem
        				});
        				tmpRecord.setValue({
        					fieldId: 'custrecord_djkk_exsystem_iq_location',
        					value: tmpLocation
        				});
        				tmpRecord.setValue({
        					fieldId: 'custrecord_djkk_exsystem_iq_inventory',
        					value: tmpLot
        				});
        				tmpRecord.setValue({
        					fieldId: 'custrecord_djkk_exsystem_iq_quantity',
        					value: updateQuantity
        				});
        				var tmpRecordId = tmpRecord.save();
        				log.audit({
        					title: '外部システム在庫数量管理レコード作成 - id',
        					details: tmpRecordId
        				});
        			}
        		}
    		}

			newRecord.setValue({
				fieldId: 'custbody_djkk_exsystem_line_inventory',
				value: JSON.stringify(newLotInfo)
			});
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
        beforeSubmit : beforeSubmit,
        afterSubmit : afterSubmit
    };
});