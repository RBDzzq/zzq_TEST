/**
 * Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/search",
        "N/record",
        "N/runtime",
        "./NQuery/JP_NLocationDAO",
        "./JP_BaseDAO",
        "../lib/JP_TCTranslator",
        "./NQuery/JP_TaxDetailsDAO",
        "./JP_CompanyDAO",
        "./JP_TaxPreferencesDAO",
        "./NQuery/JP_NSubsidiaryDAO",
    ],

    (search, record, runtime,
     LocationDAO, BaseDAO, translator, taxDetailsDAO, compDAO, taxPrefDAO, NSubsidiaryDAO) => {

        const TAX_SEARCH = 'customsearch_suitel10n_jp_tax_detail';
        const AR_DEB_ADJ_TRANSACTION = 'customsale_jp_loc_debit_bal_adj';
        const AR_CRED_ADJ_TRANSACTION = 'customsale_jp_loc_cred_bal_adj';

        //string ids
        const stdrate = 'DESC_STANDARDRATE';
        const reducedrate = 'DESC_REDUCEDRATE';

        function JP_TaxInvoiceLawDAO(){
            BaseDAO.call(this);
            this.recordType = AR_DEB_ADJ_TRANSACTION;

            this.fields = {
                ar_adj_item_ow : 'custrecord_jp_ar_deb_adj_item_ow',
                ar_adj_item_si : 'custrecord_jp_ar_deb_adj_item_si',
                department: 'department',
                location : 'location',
                class: 'class',
                trandate : 'trandate',
                invoicesummary : 'custbody_suitel10n_jp_ids_rec',
                includeis : 'custbody_4392_includeids',
                closingdate : 'custbody_suitel10n_inv_closing_date',
                line : {
                    //may need to move this somewhere, maybe in ARADJBase.js
                    //line item fields
                    item :"item",
                    amount : "amount",
                    description : "description",
                    taxCode : "custcol_jp_aradj_taxcode"
                }
            }

            this.strings = new translator().getTexts([stdrate, reducedrate], true);
        }

        util.extend(JP_TaxInvoiceLawDAO.prototype, BaseDAO.prototype);

        /**
         * Runs the Invoice Summary Tax Detail which returns the NetSuite Tax amount and the Total Transaction amount
         * grouped by tax bracket.
         *
         * @param transactionIds object containing the following details:
         *  {
                    transactionIds: transactions,  //list of transaction ids included in the IS
                    entityid : entity,
                    subsidiary : subsidiary,
                    closingDate : closingDate,
                    isID : invSumRecID
                }
         * @return {*}
         */
        JP_TaxInvoiceLawDAO.prototype.getTaxDetails = function(params){
            log.debug('getTaxDetails params', JSON.stringify(params));
            let transactionIds = params.transactionIds;
            let taxDetails = [];
            if (transactionIds && transactionIds.length > 0){
                let totalTaxSearch = search.load({id: TAX_SEARCH});
                let filterExp = totalTaxSearch.filterExpression;
                filterExp.push('AND',  ['internalid', search.Operator.ANYOF,transactionIds]);
                totalTaxSearch.filterExpression = filterExp;
                let iterator = this.getResultsIterator(totalTaxSearch)

                let results = [];
                while (iterator.hasNext()){
                    let result = iterator.next();
                    results.push(result);
                }

                taxDetails = this.parseTaxDetails(results);
            }

            log.debug('getTaxDetails', JSON.stringify(taxDetails));
            return taxDetails;
        }

        /**
         * Creates the actual AR Debit Adjustment based on the computed difference between
         * the NetSuite Computation and the functions computed tax.
         * If there are no delta is 0, then no AR Adjustment is created.
         *
         * @param params object containing the info needed to create the Tax Adjustment, format is as follows:
         *     {
         *         transactionIds : [], //array containing the transactions included in the IS.
         *         entityid : number,   //id of the entity used in this IS
         *         subsidiary : number  //id of the entity's subsidiary.
         *     }
         *
         *  @returns {integer} the id of the AR Adjusment created, 0 if there's none created.
         *
         */
        JP_TaxInvoiceLawDAO.prototype.addTaxAdjustment=function(params){
            log.debug('addTaxAdjustment params: ', JSON.stringify(params));
            let arAdjId;
            let totalDelta = 0;
            let result = this.getTaxDetails(params);
            let roundingMethod = new taxPrefDAO().getRoundingMethod(params.entityid);
            let istaxlawstd = 0;
            let istaxlawrdc = 0;
            let totalTax = 0;

            if(result && result.length > 0){
                let taxDiffs = [];
                result.forEach((taxRate)=> {
                    if(taxRate['rate'] > 0){ //do not process those that are tax-exempt.
                        taxRate.islawtax = taxRate.netamountnotax * (taxRate.rate/100);
                        //round the difference to 2 decimal places
                        taxRate.delta = roundingMethod((taxRate.islawtax-taxRate.taxamount));

                        //we only add item line entries if there are really deltas.
                        if(taxRate.delta !== 0){
                            taxDiffs.push(taxRate);
                            totalDelta += taxRate.delta;
                        }
                        else{
                            totalTax += taxRate.taxamount;
                        }
                    }
                });

                //create tax details record if there is a tax difference
                log.debug('tax Diffs: ', JSON.stringify(taxDiffs));
                let taxGrouping = {};
                if(taxDiffs.length > 0){
                    taxGrouping = this.taxesGroupBy(taxDiffs, 'rate'); //handle tax codes with the same rate
                    let taxLookup = {};
                    let groupingKeys = Object.keys(taxGrouping);

                    //consolidate all similar tax rates.
                    groupingKeys.forEach((taxGroup)=>{
                        taxLookup[taxGroup] = {
                            islawtax : 0,
                            delta : 0,
                            taxamount :0
                        };

                        taxGrouping[taxGroup].forEach((taxItem)=>{
                            taxLookup[taxGroup].islawtax += roundingMethod(taxItem.islawtax);
                            taxLookup[taxGroup].delta += taxItem.delta;
                            taxLookup[taxGroup].taxamount += taxItem.taxamount;
                        });
                    });

                    log.debug('taxLookup', JSON.stringify(taxLookup));
                    params.taxDiffs = taxDiffs;
                    params.totalDelta = totalDelta;
                    arAdjId = this.createTaxAdjustmentTransaction(params);

                    //create the tax details record and link it to the Invoice Summary Transaction
                    let taxDetailsDao = new taxDetailsDAO();
                    let taxDetailsData = {};
                    istaxlawstd = (taxLookup[10]) ? roundingMethod(taxLookup[10].islawtax) : 0;
                    istaxlawrdc = (taxLookup[8]) ? roundingMethod( taxLookup[8].islawtax ) : 0;
                    let nstaxstd = (taxLookup[10]) ? taxLookup[10].taxamount : 0;
                    let nstaxrdc = (taxLookup[8]) ? taxLookup[8].taxamount : 0;
                    taxDetailsData[taxDetailsDao.fields.adjTransID.id] = parseInt(arAdjId);
                    taxDetailsData[taxDetailsDao.fields.taxISLevel.id] =
                        parseFloat(totalTax + istaxlawrdc + istaxlawstd);
                    taxDetailsData[taxDetailsDao.fields.linkedIS.id] = params.isID;
                    taxDetailsData[taxDetailsDao.fields.taxStdRate.id] = nstaxstd;
                    taxDetailsData[taxDetailsDao.fields.taxReducedRate.id] = nstaxrdc;
                    taxDetailsData[taxDetailsDao.fields.taxReducedRateSum.id] = istaxlawrdc;
                    taxDetailsData[taxDetailsDao.fields.taxStdRateSum.id] = istaxlawstd;
                    taxDetailsData[taxDetailsDao.fields.diffStdRate.id] = istaxlawstd - nstaxstd;
                    taxDetailsData[taxDetailsDao.fields.diffReducedRate.id] = istaxlawrdc - nstaxrdc;

                    taxDetailsDao.createTaxDetailsRecord(taxDetailsData);
                }
            }

            return {
                adjustmentId : arAdjId,
                totalTax : parseFloat(totalTax + istaxlawrdc + istaxlawstd)
            };
        }

        JP_TaxInvoiceLawDAO.prototype.createTaxAdjustmentTransaction=function(params){
            log.debug('createTaxAdjustmentTransaction params', JSON.stringify(params))
            let arAdjId = 0;
            let totalDelta = params.totalDelta;
            let taxDiffItems = params.taxDiffs;
            let rateDescription = {
                '10' : this.strings[stdrate],
                '8' :  this.strings[reducedrate]
            };

            if (taxDiffItems.length > 0){ //Create AR Debit/Credit Transaction
                let arAdjType = totalDelta >= 0 ?  AR_DEB_ADJ_TRANSACTION : AR_CRED_ADJ_TRANSACTION;
                let arAdj = record.create({
                    type: arAdjType,
                    isDynamic : true
                });

                let values = [
                    {fieldId: 'entity', value: parseInt(params.entityid)},
                    {fieldId: this.fields.trandate, value: params.closingDate},
                    {fieldId: this.fields.closingdate, value: params.closingDate },
                    {fieldId: this.fields.invoicesummary, value: params.isID},
                    {fieldId: this.fields.includeis, value: false}
                ];

                let itemDetails = this.getItemDetails(params.subsidiary);

                //Department, Location, Class be mandatory based on
                // 'Enable Features' and 'Accounting Preferences'
                if(itemDetails.dlc_dept !== null){
                    values.push({
                        fieldId: this.fields.department,
                        value: parseInt(itemDetails.dlc_dept)});
                }

                if(itemDetails.dlc_location !== null){
                    values.push({
                        fieldId: this.fields.location,
                        value: parseInt(itemDetails.dlc_location)});
                }

                if(itemDetails.dlc_class !== null){
                    values.push({
                        fieldId: this.fields.class,
                        value: parseInt(itemDetails.dlc_class)});
                }

                values.forEach((value) =>{
                    arAdj.setValue({
                        fieldId: value.fieldId,
                        value : value.value
                    });
                });

                log.debug('taxDiffItems',JSON.stringify(taxDiffItems));

                taxDiffItems.forEach(taxDiffItem => {
                    arAdj.selectNewLine('item');
                    //line item values
                    let lineItemVals = [
                        { id: 'item', value: parseInt(itemDetails.itemId)},
                        //In AR Credit Adjustment we use the absolute value, for the total transaction amount
                        //would be negative, and NS does not allow negative total amounts.
                        {id : 'amount', value : (arAdjType === AR_CRED_ADJ_TRANSACTION) ? Math.abs(parseInt(taxDiffItem.delta)) :
                                parseInt(taxDiffItem.delta)},
                        {id: 'description', value: rateDescription[ taxDiffItem.rate ]},
                        {id: 'custcol_jp_aradj_taxcode', value: taxDiffItem.id}
                    ];

                    //looping through fields of one line and populate them.
                    lineItemVals.forEach((lineField) => {
                        arAdj.setCurrentSublistValue({
                            sublistId : 'item',
                            fieldId : lineField.id,
                            value: lineField.value
                        });
                    });

                    arAdj.commitLine('item');
                });

                arAdjId = arAdj.save();
                if (arAdjType === AR_DEB_ADJ_TRANSACTION) {
                    log.debug('created AR Debit Adjustment id:', arAdjId);
                }
                else {
                    log.debug('created AR Credit Adjustment id:', arAdjId);
                }
            }

            return arAdjId;
        }

        /**
         * group taxes based on the fieldId i.e. by tax code or tax rate
         * @param taxes the array of tax objects.
         * @param fieldId the field id we use to group the taxes.
         * @return {{Object}} the grouped taxes.
         */
        JP_TaxInvoiceLawDAO.prototype.taxesGroupBy = function(taxes, fieldId){
            log.debug("taxesGroupBy", JSON.stringify(taxes) + " fieldId: " + fieldId);
            let grouping = {};
            if(taxes){
                taxes.forEach((taxDiff) => {
                    if(!grouping[ taxDiff[fieldId] ]){
                        grouping[ taxDiff[fieldId] ] = [];
                    }
                    grouping[ taxDiff[fieldId] ].push(taxDiff);
                });
            }
            log.debug("grouping", JSON.stringify(grouping));
            return grouping;
        }

        /**
         * Retrieves the item id that will be used in the line items of AR Debit Adjustment.
         * @param subsidiaryId the subsidiary id, if value is null, we assume that the account is SI.
         * @return {Object} returns an object containing pertinent information to the AR Adj. creation.
         */
        JP_TaxInvoiceLawDAO.prototype.getItemDetails=function(subsidiaryId){
            let returnVal = {};
            let itemId = null;
            let itemField = (subsidiaryId) ? this.fields.ar_adj_item_ow :
                this.fields.ar_adj_item_si;

            let subsidiaryLookup = null;
            if(subsidiaryId){ //OW
                subsidiaryLookup = search.lookupFields({
                    type: search.Type.SUBSIDIARY,
                    id: parseInt(subsidiaryId),
                    columns: [itemField]
                });
                itemId = (subsidiaryLookup[itemField] && subsidiaryLookup[itemField][0]) ?
                    subsidiaryLookup[itemField][0].value : null;
            }
            else { //SI
                itemId = new compDAO().getARDebitAdjustmentItem();
            }

            if(itemId){
                //if location is enabled, it becomes a required field in the AR Debit Adjustment, so we also get that.
                let locations = null;
                returnVal['itemId'] = itemId;

                if (runtime.isFeatureInEffect({feature: 'SUBSIDIARIES'})){
                    let nSubsidiaryDAO = new NSubsidiaryDAO();
                    nSubsidiaryDAO.getData(subsidiaryId);
                    returnVal['dlc_dept'] = nSubsidiaryDAO.fields.dlc_department.val;
                    returnVal['dlc_location'] = nSubsidiaryDAO.fields.dlc_location.val;
                    returnVal['dlc_class'] = nSubsidiaryDAO.fields.dlc_class.val;
                }else{
                    let companyDAO = new compDAO();
                    returnVal['dlc_dept'] = companyDAO.getDepartment() ? companyDAO.getDepartment() : null;
                    returnVal['dlc_location'] = companyDAO.getLocation() ? companyDAO.getLocation() : null;
                    returnVal['dlc_class'] = companyDAO.getClass() ? companyDAO.getClass() : null;
                }
            }
            return returnVal;
        }

        return JP_TaxInvoiceLawDAO;
    });
