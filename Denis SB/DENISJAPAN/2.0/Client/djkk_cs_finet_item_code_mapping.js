/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
 define(['N/log', 'N/search'], function(log, search) {

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.line - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     */
    function fieldChanged(scriptContext) {
    	var tmpRecord = scriptContext.currentRecord;
    	var tmpFieldId = scriptContext.fieldId;
    	if (tmpFieldId == 'custrecord_djkk_ficm_finet_center_code' || tmpFieldId == 'custrecord_djkk_ficm_finet_item_code' || tmpFieldId == 'custrecord_djkk_ficm_item') {
    		var tmpFinetCenterCodeId = tmpRecord.getValue({fieldId: 'custrecord_djkk_ficm_finet_center_code'});
    		
    		var tmpFinetCenterCode = '';
    		if (tmpFinetCenterCodeId != null && tmpFinetCenterCodeId != '') {
    			tmpFinetCenterCode = search.lookupFields({
        			type: 'customrecord_djkk_finet_center_code',
        			id: tmpFinetCenterCodeId,
        			columns: 'custrecord_djkk_fcc_finet_center_code'
        		}).custrecord_djkk_fcc_finet_center_code;
    		}
        	var tmpFinetItemCode = tmpRecord.getValue({fieldId: 'custrecord_djkk_ficm_finet_item_code'});
        	var tmpItem = tmpRecord.getValue({fieldId: 'custrecord_djkk_ficm_item'});
        	var tmpItemCode = '';
        	if (tmpItem != null && tmpItem != '') {
        		tmpItemCode = search.lookupFields({type: search.Type.ITEM, id: tmpItem, columns: 'itemid'}).itemid;
        	}

        	tmpRecord.setValue({
        		fieldId: 'name',
        		value: tmpFinetCenterCode + '' + tmpFinetItemCode + '' + tmpItemCode
        	});
    	}
    	
    	if (tmpFieldId == 'custrecord_djkk_ficm_item') {
    		// 「DJ_商品コード」が変更された場合
    		
    		var strFicmItem = tmpRecord.getValue({fieldId: 'custrecord_djkk_ficm_item'});
    		var strFicmItemCode = '';
    		if (strFicmItem != null && strFicmItem != '') {
    			strFicmItemCode = search.lookupFields({type: search.Type.ITEM, id: strFicmItem, columns: 'itemid'}).itemid;
    		}
    		
    		var tmpItemName = '';
    		var tmpProductCode = '';
    		
    		if (strFicmItemCode != null && strFicmItemCode != '') {
    			var filters = [];
    			filters.push(['itemid', 'is', strFicmItemCode]);
    			var columns = [];
    			// 「商品名」
    			columns.push(search.createColumn({name: 'displayname'}));
    			// 「DJ_カタログ製品コード」
    			columns.push(search.createColumn({name: 'custitem_djkk_product_code'}));
    			var results = searchResult(search.Type.ITEM, filters, columns);
    			if (results.length > 0) {
    				tmpItemName = results[0].getValue({name: 'displayname'});
    				tmpProductCode = results[0].getValue({name: 'custitem_djkk_product_code'});
    			}
    		}
    		
    		tmpRecord.setValue({
				fieldId: 'custrecord_djkk_ficm_item_name',
				value: tmpItemName
			});
			tmpRecord.setValue({
				fieldId: 'custrecord_djkk_ficm_product_code',
				value: tmpProductCode
			});
    	}
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
    * Function to be executed after sublist is inserted, removed, or edited.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    *
    * @since 2015.2
    */
    function sublistChanged(scriptContext) {
    }

    /**
    * Function to be executed after line is selected.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    *
    * @since 2015.2
    */
    function lineInit(scriptContext) {

    }

    /**
    * Validation function to be executed when field is changed.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    * @param {string} scriptContext.fieldId - Field name
    * @param {number} scriptContext.line - Line number. Will be undefined if not a sublist or matrix field
    * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
    *
    * @returns {boolean} Return true if field is valid
    *
    */
    function validateField(scriptContext) {
        return true;
    }

    /**
    * Validation function to be executed when sublist line is committed.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    *
    * @returns {boolean} Return true if sublist line is valid
    *
    */
    function validateLine(scriptContext) {
        return true;
    }

    /**
    * Validation function to be executed when sublist line is inserted.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    *
    * @returns {boolean} Return true if sublist line is valid
    *
    */
    function validateInsert(scriptContext) {
        return true;
    }

    /**
    * Validation function to be executed when record is deleted.
    *
    * @param {Object} scriptContext
    * @param {Record} scriptContext.currentRecord - Current form record
    * @param {string} scriptContext.sublistId - Sublist name
    *
    * @returns {boolean} Return true if sublist line is valid
    *
    */
    function validateDelete(scriptContext) {
        return true;
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     */
    function saveRecord(scriptContext) {
    	var tmpRecord = scriptContext.currentRecord;
    	var tmpRecordId = tmpRecord.id;
		var tmpFinetCenterCodeId = tmpRecord.getValue({fieldId: 'custrecord_djkk_ficm_finet_center_code'});
		
		var tmpFinetCenterCode = '';
		if (tmpFinetCenterCodeId != null && tmpFinetCenterCodeId != '') {
			tmpFinetCenterCode = search.lookupFields({
    			type: 'customrecord_djkk_finet_center_code',
    			id: tmpFinetCenterCodeId,
    			columns: 'custrecord_djkk_fcc_finet_center_code'
    		}).custrecord_djkk_fcc_finet_center_code;
		}
    	var tmpFinetItemCode = tmpRecord.getValue({fieldId: 'custrecord_djkk_ficm_finet_item_code'});
    	var tmpItem = tmpRecord.getValue({fieldId: 'custrecord_djkk_ficm_item'});
    	var tmpItemCode = '';
    	if (tmpItem != null && tmpItem != '') {
    		tmpItemCode = search.lookupFields({type: search.Type.ITEM, id: tmpItem, columns: 'itemid'}).itemid;
    	}
    	
    	tmpRecord.setValue({
    		fieldId: 'name',
    		value: tmpFinetCenterCode + '' + tmpFinetItemCode + '' + tmpItemCode
    	});
    	
    	var filters = [];
    	filters.push(search.createFilter({
    		name: 'name',
    		operator: search.Operator.IS,
    		values: tmpFinetCenterCode + '' + tmpFinetItemCode + '' + tmpItemCode
    	}));
    	var results = searchResult('customrecord_djkk_finet_itemcode_mapping', filters, []);
    	for (var i = 0; i < results.length; i++) {
    		var tmpId = results[i].id;
    		if (tmpId != tmpRecordId) {		
        		alert('入力した「名前」が既に存在します。');
        		return false;
    		}
    	}
    	
        return true;
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
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord
    };
});