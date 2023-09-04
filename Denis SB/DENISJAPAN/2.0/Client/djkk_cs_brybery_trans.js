/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/url'], function(search,url) {
	 /**
     * Function to be executed after page is initialized.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     * @since 2015.2
     */
	function start(id){
		 var output = url.resolveScript({
	            scriptId: 'customscript_djkk_brybery_appr_sl',
	            deploymentId: 'customdeploy_djkk_brybery_appr_sl',
	            returnExternalUrl: false,
	            params: {
	                'id': id
	            }
	        });

	        window.location.href = output;

	}
    function pageInit(scriptContext) {
  
    }
	
	
	
    function setTableHIDDEN(table) {
    	try {
    		document.getElementById(table).style.display = 'none';
    		//document.getElementById(table).style.visibility = "hidden";
    	} catch (e) {
    	}
    }
    
    /**
     * Function to be executed when field is changed.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

//        var curRec = scriptContext.currentRecord;
//        if (scriptContext.fieldId == 'custpage_djkk_trans_appr_user') {
//            var customApprUser = curRec.getValue('custpage_djkk_trans_appr_user');
//            var dealType = getApprovalObj(curRec.type);
//            if (dealType != '10') {
//                curRec.setValue({
//                    fieldId : 'custrecord_djkk_next_appr_name',
//                    value : customApprUser,
//                    ignoreFieldChange : true
//                });
//            } else {
//                curRec.setValue({
//                    fieldId : 'custrecord_djkk_arriv_appr_user',
//                    value : customApprUser,
//                    ignoreFieldChange : true
//                });
//            }
//        }
//        if(scriptContext.fieldId == 'custrecord_djkk_brybery_detail_item'){
//        	var result= '';
//        	var vendorName = '';
//        	var tax = '';
//        	var unit = '';
//        	var itemId = curRec.getCurrentSublistValue({
//        		sublistId: 'recmachcustrecord_djkk_brybery_page',
//        		fieldId: 'custrecord_djkk_brybery_detail_item'
//        	});
//        	var type = 'item';
//			var Filters = [];
//			var Filterid = search.createFilter({
//				name : 'internalid',
//				operator : 'anyof',
//				values : itemId
//			});
//			Filters.push(Filterid);
//			var Columns = [];
//			var fileColumn = search.createColumn({
//				name : 'baseprice',
//				label : '基準価格'
//			});
//			var fileColumn1 = search.createColumn({
//				name : 'saleunit',
//				label : '主要販売単位'
//			});
//			var fileColumn2 = search.createColumn({
//				name : 'taxschedule',
//				label : '消費税税率'
//			});
//			Columns.push(fileColumn);
//			Columns.push(fileColumn1);
//			Columns.push(fileColumn2);
//			var searchResult = createSearch(type, Filters,
//					Columns);
//			if (searchResult && searchResult.length > 0) {
//					var resultObj = searchResult[0];
//					result = resultObj.getValue(fileColumn);
//					unit = resultObj.getValue(fileColumn1);
//					tax = resultObj.getValue(fileColumn2);
//			}
//			var vendorId = curRec.getValue({fieldId:'custrecord_djkk_bribery_vendor'});
//			curRec.setCurrentSublistValue({
//			    sublistId: 'recmachcustrecord_djkk_brybery_page',
//			    fieldId: 'custrecord_djkk_brybery_detail_quantity',
//			    value: 1,
//			    ignoreFieldChange: true
//			});
//			curRec.setCurrentSublistValue({
//			    sublistId: 'recmachcustrecord_djkk_brybery_page',
//			    fieldId: 'custrecord_djkk_brybery_detail_rate',
//			    value: result,
//			    ignoreFieldChange: true
//			});
//			curRec.setCurrentSublistValue({
//			    sublistId: 'recmachcustrecord_djkk_brybery_page',
//			    fieldId: 'custrecord_djkk_brybery_detail_unity',
//			    value: unit,
//			    ignoreFieldChange: true
//			});
////			curRec.setCurrentSublistValue({
////			    sublistId: 'recmachcustrecord_djkk_brybery_page',
////			    fieldId: 'custrecord_djkk_brybery_detail_amount',
////			    value: Number(result)*1,
////			    ignoreFieldChange: true
////			});
//			curRec.setCurrentSublistValue({
//			    sublistId: 'recmachcustrecord_djkk_brybery_page',
//			    fieldId: 'custrecord_djkk_brybery_detail_rate_code',
//			    value: tax,
//			    ignoreFieldChange: true
//			});
//        }
//        if(scriptContext.fieldId =='custrecord_djkk_brybery_detail_location'){
//        	var item = curRec.getCurrentSublistValue({
//        		sublistId: 'recmachcustrecord_djkk_brybery_page',
//        		fieldId: 'custrecord_djkk_brybery_detail_item'
//        	});
//        	if(!item){
//        		alert('商品が選択されていません');
//        		curRec.setCurrentSublistValue({
//    			    sublistId: 'recmachcustrecord_djkk_brybery_page',
//    			    fieldId: 'custrecord_djkk_brybery_detail_location',
//    			    value: "",
//    			    ignoreFieldChange: true
//    			});
//        	}
//        }  

    }

    /**
     * 承認対象を取得する
     */
    function getApprovalObj(recType) {

        var result = '10';

        if (recType == 'estimate') {
            result = '1';
        } else if (recType == 'salesorder') {
            result = '2';
        } else if (recType == 'customerdeposit') {
            result = '3';
        } else if (recType == 'returnauthorization') {
            result = '4';
        } else if (recType == 'creditmemo') {
            result = '5';
        } else if (recType == 'purchaseorder') {
            result = '6';
        } else if (recType == 'vendorbill') {
            result = '7';
        } else if (recType == 'vendorreturnauthorization') {
            result = '8';
        } else if (recType == 'vendorcredit') {
            result = '9';
        } else if (recType == 'invoice') {
            result = '11';
        }else if(recType == 'customrecord_djkk_bribery_acknowledgment'){
        	result = '12';
        }

        return result;
    }

	function createSearch(searchType, searchFilters, searchColumns) {

		var resultList = [];
		var resultIndex = 0;
		var resultStep = 1000;

		var objSearch = search.create({
			type : searchType,
			filters : searchFilters,
			columns : searchColumns
		});
		var objResultSet = objSearch.run();

		do {
			var results = objResultSet.getRange({
				start : resultIndex,
				end : resultIndex + resultStep
			});

			if (results.length > 0) {
				resultList = resultList.concat(results);
				resultIndex = resultIndex + resultStep;
			}
		} while (results.length == 1000);

		return resultList;
	}
    
    return {
    	pageInit : pageInit,
    	setTableHIDDEN: setTableHIDDEN,
        fieldChanged : fieldChanged,
        start:start
    };
});
