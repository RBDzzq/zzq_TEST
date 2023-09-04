/**
 * Copyright 2019 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 *
 */

if (!suitel10n) {
    var suitel10n = {};
}

suitel10n.jp = suitel10n.jp || {};
suitel10n.jp.comp = suitel10n.jp.comp || {};
suitel10n.jp.comp.rs = suitel10n.jp.comp.rs || {};

suitel10n.jp.comp.rs.SalesPurchaseReport = function SalesPurchaseReport() {
    var PURCHASE_REPORT_NAME = 'Purchase by Main Tax Category Report';
    var SALES_REPORT_NAME = 'Sales by Tax Classification Report';
    var NET_AMOUNT = 'netamount';
    var TAX_AMOUNT = 'taxamount';
    var GRS_AMOUNT = 'grsamount';

    var NAME = 'name';
    var TAX_CODE_RECORD = 'salestaxitem';
    var TAX_CLASSIFICATION = 'custrecord_4572_tax_classification';
    var MAIN_TAX_CATEGORY = 'customlist_4572_main_tax_category';
    var INTERNAL_ID = 'internalid';
    var MAIN_TAX_CAT_UNASSIGNED = 'UNASSIGNED';

    var SALES = 'Sales';
    var PURCHASES = 'Purchases';
    var reportDao = new suitel10n.jp.data.ReportDAO();

    /**
     * Restlet that will return the data from Purchase and Sales Report in JSON format
     *
     * @param {Object} params
     * @param {number} params.subsidiary - Subsidiary ID
     * @param {number} params.periodStart - Period ID of the starting period
     * @param {number} params.periodEnd - Period ID of the ending period
     * @returns {string} JSON string of summarized data from sales and purchase report
     *
     * Sample return:
     * {
     *    "Sales":{ "Tax Classification ID 1":{"netamount":100,"taxamount":200,"grsamount":300}, "Tax Classification ID 2":{"netamount":100,"taxamount":200,"grsamount":300}},
     *    "Purchases":{
     *        "Main Tax Category 1":{ { "Tax Classification ID 1":{"netamount":100,"taxamount":200,"grsamount":300}, "Tax Classification ID 2":{"netamount":100,"taxamount":200,"grsamount":300}},
     *        "Main Tax Category 2":{ { "Tax Classification ID 1":{"netamount":100,"taxamount":200,"grsamount":300}, "Tax Classification ID 2":{"netamount":100,"taxamount":200,"grsamount":300}}
     *    }
     *}
     */
    this.doGet = function (params){
        var requestObj = {
                subsidiary: params.subsidiary,
                periodStart: params.periodStart,
                periodEnd: params.periodEnd
            };

        try{
            //Check if the request parameters are valid
            checkValidParams(requestObj);

            var taxCodeObj = {};
            requestObj.taxCodeClassObj = initializeTaxCodeClassObj();
            requestObj.mainTaxCatObj = initializeTaxCategoryObj();

            taxCodeObj[SALES] = runSalesByTaxCodeReport(requestObj);
            taxCodeObj[PURCHASES] = runPurchaseByTaxCategoryReport(requestObj);

            nlapiLogExecution('AUDIT', 'result', JSON.stringify(taxCodeObj));
            return JSON.stringify(taxCodeObj);
        } catch(ex){
            var errObj = {};

            errObj.message = JSON.stringify(ex);
            errObj.errorCode = 'SUMMARIZE_SALES_PURCHASE_REPORT_ERROR';

            var stringErrorObj = JSON.stringify(errObj);
            nlapiLogExecution('ERROR', 'SalesPurchaseReport Error', stringErrorObj);
            return stringErrorObj;
        }
    }

    /**
     * Format details from Sales Saved Report and summarize it to JSON format
     *
     * @param {Object} requestObj
     * @param {number} requestObj.salesReportId - Internal ID of Sales' Saved Report
     * @param {number} requestObj.subsidiary - Subsidiary ID
     * @param {number} requestObj.periodStart - Period ID of the starting period
     * @param {number} requestObj.periodEnd - Period ID of the ending period
     * @param {object} requestObj.taxCodeClassObj - the tax code - tax classification object
     * @returns {string} JSON string of summarized data from sales report
     *
     * Sample return:
     *    { "Tax Classification ID 1":{"netamount":100,"taxamount":200,"grsamount":300}, "Tax Classification ID 2":{"netamount":100,"taxamount":200,"grsamount":300}}
     */
    function runSalesReport(requestObj){
        var reportId = requestObj.salesReportId;
        var subsidiary = requestObj.subsidiary;
        var periodStart = requestObj.periodStart;
        var periodEnd = requestObj.periodEnd;
        var taxCodeClassObj = requestObj.taxCodeClassObj;

        var taxCodeObj = {};
        for(var taxCode in taxCodeClassObj){
            var classification = taxCodeClassObj[taxCode];
            taxCodeObj[classification] = {netamount:0 , taxamount:0, grsamount:0};
        }

        // Initialize settings
        var reportSettings = new nlobjReportSettings(periodStart, periodEnd);
        reportSettings.setSubsidiary(subsidiary);

        var reportData =  nlapiRunReport(reportId, reportSettings);

        // COLUMNS
        var cols = reportData.getColumnHierarchy().getVisibleChildren();

        var NET_AMOUNT_COLUMN = cols[1];
        var TAX_AMOUNT_COLUMN = cols[2];
        var GRS_AMOUNT_COLUMN = cols[3];

        var taxCodeLevel = reportData.getRowHierarchy().getChildren();

        //group json by tax classification
        for(var i in taxCodeLevel){
            var taxCodeName = taxCodeLevel[i].getValue();
            var type = taxCodeClassObj[taxCodeName] ? taxCodeClassObj[taxCodeName] : '';
            if(type){
                if (taxCodeLevel[i].getSummaryLine()) {
                    var summaryLine = taxCodeLevel[i].getSummaryLine();

                    taxCodeObj[type][NET_AMOUNT] += parseFloat(summaryLine.getValue(NET_AMOUNT_COLUMN));
                    taxCodeObj[type][TAX_AMOUNT] += parseFloat(summaryLine.getValue(TAX_AMOUNT_COLUMN));
                    taxCodeObj[type][GRS_AMOUNT] += parseFloat(summaryLine.getValue(GRS_AMOUNT_COLUMN));
                }
            }
        }

        return taxCodeObj;
    }

    /**
     * Format details from Purchase Saved Report and summarize it to JSON format
     *
     * @param {Object} requestObj
     * @param {number} requestObj.purchaseReportId - Internal ID of Sales' Saved Report
     * @param {number} requestObj.subsidiary - Subsidiary ID
     * @param {number} requestObj.periodStart - Period ID of the starting period
     * @param {number} requestObj.periodEnd - Period ID of the ending period
     * @param {object} requestObj.taxCodeClassObj - the tax code - tax classification object
     * @param {object} requestObj.mainTaxCatObj - the main tax category id-name object
     * @returns {string} JSON string of summarized data from sales report
     *
     * Sample return:
     *    { "Tax Classification ID 1":{"netamount":100,"taxamount":200,"grsamount":300}, "Tax Classification ID 2":{"netamount":100,"taxamount":200,"grsamount":300}}
     */
    function runPurchaseReport(requestObj){
        var reportId = requestObj.purchaseReportId;
        var subsidiary = requestObj.subsidiary;
        var periodStart = requestObj.periodStart;
        var periodEnd = requestObj.periodEnd;
        var taxCodeClassObj = requestObj.taxCodeClassObj;
        var mainTaxCatObj = requestObj.mainTaxCatObj;

        var taxCodeObj = {};
        for(var mainTaxCat in mainTaxCatObj){
            var mainTaxCatId = mainTaxCatObj[mainTaxCat];
            taxCodeObj[mainTaxCatId] = {};
            for(var taxCode in taxCodeClassObj){
                var classification = taxCodeClassObj[taxCode];
                taxCodeObj[mainTaxCatId][classification] = {netamount:0 , taxamount:0, grsamount:0};
            }
        }

        // Initialize settings
        var reportSettings = new nlobjReportSettings(periodStart, periodEnd);
        reportSettings.setSubsidiary(subsidiary);
        var reportData =  nlapiRunReport(reportId, reportSettings);

        // COLUMNS
        var cols = reportData.getColumnHierarchy().getVisibleChildren();

        var netAmountCol = cols[1];
        var taxAmountCol = cols[2];
        var grossAmtCol = cols[3];

        var mainTaxCatLevel = reportData.getRowHierarchy().getChildren();
        for(var i in mainTaxCatLevel){
            var mainTaxCatName = mainTaxCatLevel[i].getValue();
            var mainTaxCategory = mainTaxCatObj[mainTaxCatName] ? mainTaxCatObj[mainTaxCatName] : MAIN_TAX_CAT_UNASSIGNED; 
            
            var taxCodeLevel = mainTaxCatLevel[i].getChildren();
            for(var j in taxCodeLevel){
                var taxCodeName = taxCodeLevel[j].getValue();
                var type = taxCodeClassObj[taxCodeName] ? taxCodeClassObj[taxCodeName] : '';

                if(type){
                    if (taxCodeLevel[j].getSummaryLine()) {
                        var summaryLine = taxCodeLevel[j].getSummaryLine();

                        taxCodeObj[mainTaxCategory][type][NET_AMOUNT] += parseFloat(summaryLine.getValue(netAmountCol));
                        taxCodeObj[mainTaxCategory][type][TAX_AMOUNT] += parseFloat(summaryLine.getValue(taxAmountCol));
                        taxCodeObj[mainTaxCategory][type][GRS_AMOUNT] += parseFloat(summaryLine.getValue(grossAmtCol));
                    }
                }
            }
        }

        return taxCodeObj;
    }

    /**
     * @returns {object} returns the tax code - tax classification
     */
    function initializeTaxCodeClassObj(){
        var taxCodeClassObj = {};
        var columns = [new nlobjSearchColumn(TAX_CLASSIFICATION), new nlobjSearchColumn(NAME)];
        var taxCodeClass = nlapiCreateSearch(TAX_CODE_RECORD, [], columns).runSearch();
        taxCodeClass.forEachResult(function(taxCode){
            var taxClass = taxCode.getValue(TAX_CLASSIFICATION)
            if(taxClass){
                taxCodeClassObj[taxCode.getValue(NAME)] = taxClass;
            }
            return true;
        });

        return taxCodeClassObj;
    }

    /**
     * @returns {object} returns main category name - id
     */
    function initializeTaxCategoryObj(){
        var mainTaxCatObj = {};
        //assign container for transactions with no tax category
        mainTaxCatObj[MAIN_TAX_CAT_UNASSIGNED] = MAIN_TAX_CAT_UNASSIGNED;

        var columns = [new nlobjSearchColumn(NAME), new nlobjSearchColumn(INTERNAL_ID)];
        var mainTaxCategories = nlapiCreateSearch(MAIN_TAX_CATEGORY, [], columns).runSearch();
        mainTaxCategories.forEachResult(function(mainTaxCategory){
            mainTaxCatObj[mainTaxCategory.getValue(NAME)] = mainTaxCategory.getValue(INTERNAL_ID);
            return true;
        });

        return mainTaxCatObj;
    }

    function runSalesByTaxCodeReport(requestObj){
        requestObj.salesReportId = getReportId(SALES_REPORT_NAME);
        return runSalesReport(requestObj);
    }

    function runPurchaseByTaxCategoryReport(requestObj){
        requestObj.purchaseReportId = getReportId(PURCHASE_REPORT_NAME);
        return runPurchaseReport(requestObj);
    }

    function getReportId(reportName){
        var reportId = reportDao.getReportId(reportName);
        if(!reportId){
            throw nlapiCreateError('TAX_FORM_REPORT_NOT_FOUND', 'Saved Report with name ' + reportName + 'not found.');
        }

        return reportId;
    }

    function checkValidParams(params){
        if (!params.periodStart || !params.periodEnd) {
            throw nlapiCreateError('INVALID_PERIOD_PARAM', 'Period range is not valid.');
        }

        if (!params.subsidiary) {
            throw nlapiCreateError('INVALID_SUBSIDIARY', 'Subsidiary is missing.');
        }
    }
};

suitel10n.jp.comp.rs.run = function(request) {
    nlapiLogExecution('AUDIT', 'request', JSON.stringify(request));
    var rsSalesPurchaseReport = new suitel10n.jp.comp.rs.SalesPurchaseReport();
    return rsSalesPurchaseReport.doGet(JSON.parse(request));
}