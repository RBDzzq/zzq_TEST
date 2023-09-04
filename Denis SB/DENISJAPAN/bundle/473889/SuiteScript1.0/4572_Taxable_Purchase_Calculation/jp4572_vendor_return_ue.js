/**
 * © 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
var JP4572;
if (!JP4572){
    JP4572 = {};
}

JP4572.vendorReturnUE = {};

JP4572.vendorReturnUE.beforeLoad = function() {
    var TAX_CATEGORY_REC_ID = 'customrecord_4572_tax_category';
    var MAIN_CATEGORY_LIST_ID = 'customlist_4572_main_tax_category';
    var TAX_CATEGORY_COL_ID = 'custcol_4572_tax_category';
    var REFUND_FLD_ID = 'custrecord_4572_refund';
    var MAIN_TAX_CATEGORY_FLD_ID = 'custrecord_4572_main_tax_category';
    
    function updateLine(group, noOfLines) {
        for (var x = 1; x <= noOfLines; x++){
            var taxCategoryId = nlapiGetLineItemValue(group, TAX_CATEGORY_COL_ID, x);
            if (taxCategoryId){
                if (taxCategories[taxCategoryId] && taxCategories[taxCategoryId].main){
                    var taxRefCatId = mainCategories[taxCategories[taxCategoryId].main].filter(function(t) {
                        return t.refund == 'T';
                    })[0].id;
                    if (taxRefCatId) {
                        nlapiSetLineItemValue(group, TAX_CATEGORY_COL_ID, x, taxRefCatId);
                    }
                }                    
            } 
        }    
    }
    
    var mainCategories = {};
    (nlapiSearchRecord(MAIN_CATEGORY_LIST_ID) || []).forEach(function(res) {
        mainCategories[res.getId()] = [];    
    });
    
    var taxCategories = {};
    var cols = [new nlobjSearchColumn(MAIN_TAX_CATEGORY_FLD_ID), new nlobjSearchColumn(REFUND_FLD_ID)];
    (nlapiSearchRecord(TAX_CATEGORY_REC_ID, null, null, cols) || []).forEach(function(res) {
        taxCategories[res.getId()] = {
            id: res.getId(),
            main: res.getValue(MAIN_TAX_CATEGORY_FLD_ID),
            refund: res.getValue(REFUND_FLD_ID)
        };
        if (mainCategories[res.getValue(MAIN_TAX_CATEGORY_FLD_ID)]) {
            mainCategories[res.getValue(MAIN_TAX_CATEGORY_FLD_ID)].push(taxCategories[res.getId()]);    
        }
    });
    
    var noOfItemLines = nlapiGetLineItemCount('item');
    if (noOfItemLines){
        updateLine('item', noOfItemLines);
    }
    
    var noOfExpenseLines = nlapiGetLineItemCount('expense');
    if (noOfExpenseLines){
        updateLine('expense', noOfExpenseLines);
    }
};
