/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
 define(['N/record', 'N/search', 'N/log'], function(record, search, log) {
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
        // �V�K�ƕҏW�̏ꍇ
        if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
            // ���R�[�h�����擾����
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
            var results = searchResult(search.Type.INVENTORY_TRANSFER, filters, columns);
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
     * ���ʌ����t�@���N�V����
     * @param searchType �����Ώ�
     * @param filters ��������
     * @param columns �������ʗ�
     * @returns ��������
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
        beforeSubmit : beforeSubmit,
        afterSubmit : afterSubmit
    };
});
