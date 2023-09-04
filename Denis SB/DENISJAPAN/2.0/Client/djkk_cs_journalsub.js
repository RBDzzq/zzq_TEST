/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 */

define(['N/search'], function(search){

	function fieldChanged(scriptContext) {
        try {
        	var TAXTYPE_UCHIZEI = '“àÅ';
            var TAXTYPE_SOGAKU = '‘Šz';
            var DRCR_DR = 'ŽØ•û';
            
            var currentRecord = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;
            var sublistFieldName = scriptContext.fieldId;
            if (sublistName === 'line' && sublistFieldName === 'account') {
            	if (currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: sublistFieldName })) {
            		var searchColumns = [];
                	var taxcode = search.createColumn({
    		            name : 'custrecord_dj_je_taxcode'
    		        });
                    searchColumns.push(taxcode);
                    var taxacct = search.createColumn({
    		            name : 'custrecord_dj_je_taxacct'
    		        });
                    searchColumns.push(taxacct);
                    var taxtype = search.createColumn({
    		            name : 'custrecord_dj_je_taxtype'
    		        });
                    searchColumns.push(taxtype);
                    var searchFilters = [];
                    searchFilters.push(["custrecord_dj_je_account",'is',currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: sublistFieldName })]);
                    var objSearch = search.create({
			            type : 'customrecord_dj_je',
			            filters : searchFilters,
			            columns : searchColumns,
			        });
	                var recode = objSearch.run();
                    var subset = recode.getRange({
                        start : 0,
                        end : 1,
                    });
                    if (subset && subset.length > 0) {
                    	if (subset[0].getText('custrecord_dj_je_taxtype') == TAXTYPE_UCHIZEI) {
                    		currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'taxcode', value: subset[0].getValue('custrecord_dj_je_taxcode') });
                            currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'tax1acct', value: subset[0].getText('custrecord_dj_je_taxacct').split(' ')[0] });
                            var tbl = document.getElementById('line_splits');
                            var forcusNum = 0;
                            for (var i = 0; i < 20; i++) {
                            	if (tbl.children[0].children[0].cells[i].innerText == TAXTYPE_SOGAKU) {
                            		forcusNum = i + 5;
                            		break;
                            	}
                            }
                            tbl.machine.gotoField(forcusNum,false);
                    	} else {
                    		currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'taxcode', value: subset[0].getValue('custrecord_dj_je_taxcode') });
                            currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'tax1acct', value: subset[0].getText('custrecord_dj_je_taxacct').split(' ')[0] });
                    	}
                    } else {
                    	currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'taxcode', value: '' });
                        currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'tax1acct', value: '' });
                    }
            	}
            }
            
            //‘Šz‚ð•ÏXŽž
            if (sublistName === 'line' && sublistFieldName === 'grossamt') {
            	
        		var subTaxCode = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'taxcode' });
        		var grossmat = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'grossamt' });
        		
            	if (currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'account' }) &&
            			!isEmpty(subTaxCode)&& !isEmpty(grossmat)) {
            		
            		var searchColumns = [];
                	var taxcode = search.createColumn({
    		            name : 'custrecord_dj_je_taxcode'
    		        });
                    searchColumns.push(taxcode);
                    var taxacct = search.createColumn({
    		            name : 'custrecord_dj_je_acct_drcr'
    		        });
                    searchColumns.push(taxacct);
                    var taxtype = search.createColumn({
    		            name : 'custrecord_dj_je_taxtype'
    		        });
                    searchColumns.push(taxtype);
                    var searchFilters = [];
                    searchFilters.push(["custrecord_dj_je_account",'is',currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'account' })]);
                    var objSearch = search.create({
			            type : 'customrecord_dj_je',
			            filters : searchFilters,
			            columns : searchColumns,
			        });
	                var recode = objSearch.run();
                    var subset = recode.getRange({
                        start : 0,
                        end : 1,
                    });

                    if (subset && subset.length > 0) {
                    	if (subset[0].getText('custrecord_dj_je_taxtype') == TAXTYPE_UCHIZEI) {
                    		var subTaxCode = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'taxcode' });
                    		var grossmat = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'grossamt' });
                    		var drcr = subset[0].getText('custrecord_dj_je_acct_drcr');

                    		var taxRate = search.lookupFields({
                                type: 'salestaxitem',
                                id: subTaxCode,
                                columns: ['rate']
                            });
                    		taxRate = parseFloat(taxRate.rate) / 100;
                    		var amount = parseFloat(grossmat) / (1 + taxRate);
                    		
                    		if (drcr == DRCR_DR){
                    			currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'debit', value: amount });
                    		}else{
                    			currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'credit', value: amount });
                    		}                    		
                    	}
                    }
            	}
            }
            
       } catch (e) {
           log.error(e.name, e.message);
       }
    };
    
    function isEmpty(obj) {
        if (obj === undefined || obj == null || obj === '') {
            return true;
        }
        if (obj.length && obj.length > 0) {
            return false;
        }
        if (obj.length === 0) {
            return true;
        }
        for ( var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        if (typeof (obj) == 'boolean') {
            return false;
        }
        if (typeof (obj) == 'number') {
            return false;
        }
        return true;
    }

    return {
    	fieldChanged : fieldChanged,
    };
});