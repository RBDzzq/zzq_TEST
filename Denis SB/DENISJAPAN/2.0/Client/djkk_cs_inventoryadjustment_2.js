/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/https', 'N/url', 'N/search'], function(currentRecord, https, url, search) {
    /**
     * Function to be executed after page is initialized.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     * @since 2015.2
     */
    function pageInit(scriptContext) {
    	try{
    		
    		var mode = scriptContext.mode;
            var curRec = scriptContext.currentRecord;
//            curRec.setValue({
//			fieldId: 'subsidiary',
//			value: '6'
//            });
            
////            var lineNum = curRec.selectNewLine({
////        	    sublistId: 'inventory'
////        	});
//            
//            curRec.selectNewLine({
//          		sublistId : 'inventory'
//          	})
//            alert('aaaa');
//            curRec.setCurrentSublistValue({
//                sublistId : 'inventory',
//                fieldId : 'item',
//                value : '3783'
//            });
//            alert('bbbb');
//            curRec.setCurrentSublistValue({
//                sublistId : 'inventory',
//                fieldId : 'location',
//                value : '1205'
//            });
//            alert('ccc');
//        	curRec.setCurrentSublistValue({
//                sublistId : 'inventory',
//                fieldId : 'adjustqtyby',
//                value : '1'
//            });
//        	
//        	alert('aaaa');
//        	var inventorydetail = curRec.getCurrentSublistSubrecord({
//        		sublistId : 'inventory',
//        		fieldId : 'inventorydetail'
//        	});
//       
//        	alert(inventorydetail.isDynamic);
//  
//        	inventorydetail.selectLine({
//        		sublistId : 'inventoryassignment',
//        		line : 0
//        	})
//  	
//        	inventorydetail.setCurrentSublistValue({
//        		sublistId : 'inventoryassignment',
//        		fieldId : 'receiptinventorynumber',
//        		value : 'test1234'
//        	});
//  	
//        	inventorydetail.setCurrentSublistValue({
//        		sublistId : 'inventoryassignment',
//        		fieldId : 'quantity',
//        		value : '2'
//        	});
//  	
//        	inventorydetail.commitLine({sublistId: "inventoryassignment"});
//  	
//        	curRec.commitLine('inventory');
        	
        	
    	}catch(e){
    		log.debug('e',e);
    	}

    }
    return {
        pageInit : pageInit
    };
});
