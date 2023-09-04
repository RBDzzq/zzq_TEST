/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    'N/search',
    'N/runtime',
    '../data/JP_CompanyDAO',
    '../data/JP_CustomerDAO',
    '../data/JP_SavedSearchDAO',
    '../data/JP_SubsidiaryDAO',
    '../data/JP_InvoiceSummaryRequestDAO',
    '../data/JP_AccountingPreference',
    '../data/NQuery/JP_NCustomerDAO',
    '../data/NQuery/JP_NSubsidiaryDAO',
    '../lib/JP_SearchIterator',
    '../datastore/JP_RecordTypes',
    '../datastore/JP_ListStore',
    '../lib/JP_ArrayUtility'
], (
    search,
    runtime,
    CompanyDAO,
    CustomerDAO,
    SavedSearchDAO,
    SubsidiaryDAO,
    RequestDAO,
    AccountingPreference,
    NCustomerDAO,
    NSubsidiaryDAO,
    SearchIterator,
    JP_Types,
    JP_Lists,
    JP_ArrayUtil
) =>{

    const INVALID_STATEMENT_SEARCH_OW = 'IDS_GEN_MISSING_STATEMENT_SEARCH_OW';
    const INVALID_STATEMENT_SEARCH_SI = 'IDS_GEN_MISSING_STATEMENT_SEARCH_SI';
    const ONGOING_GENERATION_NOTIFICATION_OW = 'IDS_GEN_ONGOING_GENERATION_NOTIFICATION_OW';
    const ONGOING_GENERATION_NOTIFICATION_SI = 'IDS_GEN_ONGOING_GENERATION_NOTIFICATION_SI';
    const REQUIRED_FEATURES_DISABLED = 'IDS_GEN_REQUIRED_FEATURES_DISABLED';
    const REQUIRED_AR_DEBIT_ADJ_ITEM = 'IDS_GEN_AR_DEBIT_ADJ_ITEM_REQUIRED';
    const CUSTOMER_APPLY_INV_SUMMARY_TAX_ADJ = 'IDS_GEN_CUSTOMER_APPLY_INV_SUMMARY_TAX_ADJ';
    const INVALID_QIS_CIS = "INVALID_QIS_CIS";
    const INVALID_CURRENCY = 'ERR_INVAL_CURRENCY';
    const NOT_PARENT_CUSTOMER = 'ERR_NOTPARENTCUSTOMER';
    const MULTISUB_ENABLED = 'ERR_INVAL_MULTISUB';
    const ERR_MISSING_DLC = 'ERR_MISSING_DLC';

    let requestStatuses = new JP_Lists().BATCH_STATUS;

    class GenerationValidator{

        constructor() {
            this.VALIDATION_TYPES = {
                SUCCESS: 'SUCCESS',
                FAILURE: 'FAILURE',
                WARNING: 'WARNING'
            };
            this.customerList = [];
        }
        /**
         * Validate the generation against all validations
         *
         * @param {Object} reqValues Request parameters
         * @returns {Object}
         */
        validate(reqValues) {

            if (!this.areFeaturesEnabled()) {
                return {
                    isValid: false,
                    messageCode: REQUIRED_FEATURES_DISABLED,
                    type: this.VALIDATION_TYPES.FAILURE
                };
            }

            let compAttributes;
            let OW = this.isOW();
            if (OW){
                compAttributes = new SubsidiaryDAO().getAttributes(reqValues["subsidiary"]);
            } else {
                compAttributes = new CompanyDAO().getAttributes();
            }

            let statementSearchValidation = this.validateStatementSearch(compAttributes);
            if (!statementSearchValidation.isValid) {
                return {
                    isValid: false,
                    messageCode: (OW) ? INVALID_STATEMENT_SEARCH_OW : INVALID_STATEMENT_SEARCH_SI,
                    type: this.VALIDATION_TYPES.FAILURE,
                    parameters: {
                        SUBSIDIARY: (OW) ? statementSearchValidation.name : ''
                    }
                };
            }

            let request = this.checkRequest(reqValues);
            if (!request.isValid) {
                let customerId = request.parameters['customer'];
                let customerSavedSearchId = request.parameters['customerSavedSearch'];
                let customerName = '';
                let customerSavedSearchTitle = '';
                if(customerId){
                    customerName = new CustomerDAO().getCustomerName(customerId);
                } else if (customerSavedSearchId){
                    customerSavedSearchTitle = new SavedSearchDAO().getSavedSearchTitle(customerSavedSearchId);
                }

                return {
                    isValid: false,
                    messageCode: (OW) ? ONGOING_GENERATION_NOTIFICATION_OW : ONGOING_GENERATION_NOTIFICATION_SI,
                    type: this.VALIDATION_TYPES.FAILURE,
                    parameters: {
                        SUBSIDIARY: (OW) ? compAttributes.name : '',
                        CLOSINGDATE: reqValues['closingDate'],
                        USER: request.owner,
                        CUSTOMER: customerName,
                        CUSTOMER_SAVED_SEARCH: customerSavedSearchTitle,
                        INCLUDE_OVERDUE_INVOICES: request.parameters['overdue'] ? 'True' : 'False',
                        INCLUDE_NO_TRANSACTIONS: request.parameters['noTransaction'] ? 'True' : 'False'
                    }
                };
            }

            //Consolidated Invoice Summary Validation
            if(reqValues['consolidated'] && reqValues['consolidated'] === 'T'){
                if(this.areConsolidatedFeaturesInvalid()){
                    return {
                        isValid: false,
                        messageCode: MULTISUB_ENABLED,
                        type : this.VALIDATION_TYPES.FAILURE
                    }
                }
            }

            if (!this.isCustApplyInvTaxAdj(reqValues)){
                return {
                    isValid: false,
                    messageCode: (reqValues['consolidated'] && reqValues['consolidated'] === 'T') ? INVALID_QIS_CIS
                        : CUSTOMER_APPLY_INV_SUMMARY_TAX_ADJ,
                    type: this.VALIDATION_TYPES.FAILURE
                };
            }

            if (!this.isARDebAdjItemSet(reqValues)){
                return {
                    isValid: false,
                    messageCode: REQUIRED_AR_DEBIT_ADJ_ITEM,
                    type: this.VALIDATION_TYPES.FAILURE
                };
            }

            //Validate Department, Location, Class
            let missingDLC = this.validateDLCFields(reqValues);
            if (missingDLC.length > 0){
                return{
                    isValid: false,
                    messageCode: ERR_MISSING_DLC,
                    type: this.VALIDATION_TYPES.FAILURE
                }
            }

            return {
                isValid: true,
                type: this.VALIDATION_TYPES.SUCCESS
            };
        };

        getNoParentError(){
            return {
                isValid : false,
                messageCode : NOT_PARENT_CUSTOMER,
                type : this.VALIDATION_TYPES.FAILURE
            };
        };

        /**
         * Checks if all the currencies that the parent customer has are equal to the child currencies.
         *
         * @param customerStruct
         * @param request
         * @returns {{isValid: boolean}}
         */
        areCurrenciesValid(customerStruct, request){

            let result = {isValid: true};

            if(customerStruct && request){
                let parentKeys = Object.keys(customerStruct);
                let arrayUtil = new JP_ArrayUtil();

                for(let id=0; id<parentKeys.length; id++){
                    let parent = customerStruct[ parentKeys[id] ];
                    let parentCurrencies = parent.currencies;
                    let childrenKeys = (parent.children) ? Object.keys(parent.children) : [];

                    if(childrenKeys.length > 0){

                        for(let n=0; n<childrenKeys.length; n++){

                            let childCurrencies = parent.children[  childrenKeys[n] ].currencies;

                            if(!arrayUtil.isArrayASubset(parentCurrencies, childCurrencies)){
                                result = this.validateBasedOnFilter(request, INVALID_CURRENCY, customerStruct, parentKeys[id]);
                            }

                            if(!result.isValid) break; //inner for loop break;
                        }
                    }
                    else {
                        result = this.validateBasedOnFilter(request, NOT_PARENT_CUSTOMER, customerStruct, parentKeys[id]);
                    }

                    if(!result.isValid) break; //outer for loop break;
                }
            }

            return result;
        };

        /**
         * helper function that validates based on the filter provided.
         *
         * @param {object} request The request object.
         * @param {string} code The transaction collection id representing the error to display.
         * @param {object} customerStruct The parent-child relationship data struncture.
         * Sample Data:
         * {"29720":{"id":"29720","subsidiary":8,"currency":1,
            "companyname":"Japanese Customer","isperson":false,"lastname":null,"firstname":null,"currencies":[1,4,5]},
        "32856":{"id":"32856","subsidiary":8,"currency":5,
            "companyname":"Japan Customer","isperson":false,"lastname":null,"firstname":null,"currencies":[5]},
        "33291":{"id":"33291","subsidiary":8,"currency":3,
            "companyname":"JP Parent 1","isperson":false,"lastname":null,"firstname":null,"currencies":[3,1,5,4],
	        "children":{"33292":{"id":"33292","companyname":"JP Child 11","isperson":false,
	                "lastname":null,"firstname":null,"parent":33291,"parentparent":null,"currency":1,
	                "currencies":[1,4,5,3]},
	                "33294":{"id":"33294","companyname":"JP Child 12","isperson":false,"lastname":null,
	                "firstname":null,"parent":33291,"parentparent":null,"currency":5,
	                "currencies":[5]},
	                "33296":{"id":"33296","companyname":"JP Child 121","isperson":false,"lastname":null,
	                "firstname":null,"parent":33294,"parentparent":33291,"currency":5,"currencies":[5]},
	                "33295":{"id":"33295","companyname":"JP Child 13","isperson":false,"lastname":null,
	                "firstname":null,"parent":33291,"parentparent":null,"currency":5,"currencies":[5]}}
            }
        };
         * @param {integer} parentId The the id of the parent customer who we are processing.
         * @returns {object}  The error object.
         */
        validateBasedOnFilter(request, code, customerStruct, parentId){
            let result = {isValid: true};

            // for subsidiary and customer or customer saved search we bring an error.
            if(request.subsidiary && (request.customer || request.customerSavedSearch) ){
                result = this.getErrorCode(code);
            }
            else if(request.subsidiary){
                delete customerStruct[ parentId ];
            }

            return result;
        };

        /**
         * helper function returns the error object based off the provided code.
         *
         * @param code {string} The transaction collection id representing the error to display.
         * @returns {object}  The error object.
         */
        getErrorCode(code){
            return {
                isValid : false,
                messageCode : code,
                type : this.VALIDATION_TYPES.FAILURE
            };
        };

        /**
         *
         * @param {Object} Attributes
         * @returns {Object}
         */
        validateStatementSearch(attributes) {
            let statementSearchID = attributes.statementSearch;
            let name = attributes.name;

            return {
                isValid: (statementSearchID !== ''),
                name: name
            }
        }

        /**
         * Check if MultiSubsidiary feature is enabled.
         * We are not allowed to generate Consolidated Invoice Summary if both One World
         * and MultiSubsidiary Features are enabled.
         *
         * @returns {Boolean}
         */
        areConsolidatedFeaturesInvalid(){
            let isOW = runtime.isFeatureInEffect({feature: 'SUBSIDIARIES'});
            let isMultiSub = runtime.isFeatureInEffect({feature: 'MULTISUBSIDIARYCUSTOMER'});
            return (isOW && isMultiSub);
        };


        /**
         * Check if required features are enabled
         *
         * @returns {Boolean}
         */
        areFeaturesEnabled() {
            let isAdvancedPrintingEnabled = runtime.isFeatureInEffect({feature:'ADVANCEDPRINTING'});
            let isCustomTransactionsEnabled = runtime.isFeatureInEffect({feature:'CUSTOMTRANSACTIONS'});
            let isServerSuiteScriptEnabled = runtime.isFeatureInEffect({feature:'SERVERSIDESCRIPTING'});
            return (isAdvancedPrintingEnabled && isCustomTransactionsEnabled && isServerSuiteScriptEnabled);
        }

        /**
         * Check if there is an existing request with the same closing date
         * Invalid cases
         * - OW: same subsidiary, request is not error
         * - OW: same subsidiary, request is error, different user
         * - SI: request is not error
         * - SI: request error, different user
         * - OW & SI: other filters have different values
         *
         * @param {Object} params Parameters
         * @returns {Object}
         */
        checkRequest(params) {
            let requestDAO = new RequestDAO();
            let isValid = true;
            let owner = '';

            let requestSearch = search.create({
                type : JP_Types.REQUEST_RECORD,
                filters : [
                    [requestDAO.fields.closingDate, search.Operator.ON, params['closingDate']],
                    'AND',
                    [requestDAO.fields.status, search.Operator.NONEOF, [requestStatuses.PROCESSED, requestStatuses.INVALID]]
                ],
                columns : [
                    requestDAO.fields.subsidiary,
                    requestDAO.fields.status,
                    requestDAO.fields.includeOverdue,
                    requestDAO.fields.includeNoTransaction,
                    requestDAO.fields.owner,
                    requestDAO.fields.closingDate,
                    requestDAO.fields.customerFilter,
                    requestDAO.fields.customerSavedSearch
                ]
            });
            let iterator = new SearchIterator(requestSearch);
            let parameters;

            while (iterator.hasNext()) {
                let request = iterator.next();
                let sub = request.getValue({name: requestDAO.fields.subsidiary});
                let status = request.getValue({name: requestDAO.fields.status});
                let ownerId = request.getValue({name: requestDAO.fields.owner});

                // Display customer and flag filters of currently running request
                parameters = {
                    customer: request.getValue({name:requestDAO.fields.customerFilter}),
                    customerSavedSearch: request.getValue({name:requestDAO.fields.customerSavedSearch}),
                    noTransaction: request.getValue({name:requestDAO.fields.includeNoTransaction}),
                    overdue: request.getValue({name:requestDAO.fields.includeOverdue})
                };
                owner = request.getText({name: requestDAO.fields.owner});

                if (!this.requestIsInErrorState(status) || (this.requestIsInErrorState(status) &&
                    !this.currentUserIsRequestOwner(ownerId))) {
                    /*
                     * Not ERROR or ERROR triggered by other user
                     */

                    if (!this.isOW() || (this.isOW() && sub === params['subsidiary'])) {
                        isValid = false;
                        break;
                    }
                } else {
                    /*
                     * ERROR and the user is the request owner
                     */

                    let cust = request.getValue({name: requestDAO.fields.customerFilter});
                    let custSavedSearch = request.getValue({name: requestDAO.fields.customerSavedSearch});
                    let isOverdue = request.getValue({name: requestDAO.fields.includeOverdue}) ? 'T' : 'F';
                    let isNoTrans = request.getValue({name: requestDAO.fields.includeNoTransaction}) ? 'T' : 'F';
                    if (params['customer'] !== cust || params['customerSavedSearch'] !== custSavedSearch
                        || params['overdue'] !== isOverdue || params['noTransaction'] !== isNoTrans) {
                        if (!this.isOW() || (this.isOW() && sub === params['subsidiary'])) {
                            isValid = false;
                            break;
                        }
                    }
                }
            }

            return {
                isValid: isValid,
                owner: owner,
                parameters: parameters
            };
        }


        /**
         * Check if user is owner
         *
         * @param {String} id
         * @returns {Boolean}
         */
        currentUserIsRequestOwner(id) {
            return runtime.getCurrentUser().id === Number(id);
        }


        /**
         * Check if Request is in error state
         *
         * @param {String} status Status ID
         * @returns {Boolean}
         */
        requestIsInErrorState(status){
            return requestStatuses.ERROR === Number(status);
        }

        /**
         * Check if SUBSIDIARIES feature is enabled
         *
         * @returns {Boolean}
         */
        isOW() {
            return runtime.isFeatureInEffect({
                feature: 'SUBSIDIARIES'
            });
        }

        /**
         * Check if the customer is a root and has at least one subcustomer
         * Sub-customer currencies should be available on the root parent customer
         *
         * @param {obj} reqValues Search parameter data
         * @returns {obj} Validation result
         */
        validateSubcustomers(reqValues){

            let nCustDao = new NCustomerDAO();

            //retrieve parent node customers based off the filter values.
            this.customerList = nCustDao.getParentCustomers(reqValues);
            log.debug("validateSubcustomers", JSON.stringify(this.customerList))
            if(this.customerList){
                let parentIds = Object.keys(this.customerList);
                //these nodes would be the parents on our next query initially set them to the parentIds
                let leafnodes = parentIds;

                let customerIdsList = [];
                let orphans = [];

                while(leafnodes && leafnodes.length > 0){
                    let immediateChildren = nCustDao.getCustomerChild(leafnodes, reqValues['subsidiary']);
                    //reset the leafnodes
                    let levelParent = leafnodes;
                    leafnodes = [];

                    if(levelParent === parentIds && !immediateChildren){
                        return this.getNoParentError();
                    }

                    if(immediateChildren){
                        //locate the parent customer and attach the child to it.
                        let childrenIds = Object.keys(immediateChildren);

                        for(let id=0; id<childrenIds.length;id++){
                            let childCustomer = immediateChildren[ childrenIds[id] ];

                            customerIdsList.push(childCustomer.id);

                            //find the new leaf nodes
                            if(childCustomer.parentparent &&
                                levelParent.indexOf(childCustomer.parentparent.toString()) > -1){
                                leafnodes.push(childCustomer.id);
                            }

                            let rootParent = this.findRootParent(childCustomer.parent);

                            if(rootParent){
                                this.pushChildrenToParent(rootParent, childCustomer);
                            }
                            else {
                                // it could be that due to the order of the search result, we have not yet
                                // processed its parent.
                                orphans.push(childCustomer);
                            }
                        }

                        //find the parents of orphans one last time
                        orphans.forEach((orphan)=>{
                            let orphanRoot = this.findRootParent(orphan.id);
                            if(orphanRoot){
                                this.pushChildrenToParent(orphanRoot, orphan);
                            }
                        });
                    }

                    //we check if the leaf nodes has an immediate parent.
                    //if it does not have a parent, this means that its parent is either of different
                    //subsidiary or use invoice summary was false. In such cases, we remove it from the
                    //list to prevent getting more of its deeper level children.
                    if(leafnodes.length > 0){
                        let newLeafNodes = [];
                        newLeafNodes = leafnodes.filter((leaf)=>{
                            return ( customerIdsList.indexOf(leaf.toString()) > -1);
                        });

                        leafnodes = newLeafNodes;
                    }
                }

                //remove parents without children
                for(let i=0; i<parentIds.length; i++){
                    let parentid = parentIds[i];

                    //one of the supposed parent has no children
                    if(this.customerList[parentid] && (!this.customerList[parentid].children ||
                        this.customerList[parentid].children.length === 0) ){

                        if(reqValues.subsidiary && ( reqValues.customer || reqValues.customerSavedSearch)){
                            return this.getNoParentError();
                        }
                        else{
                            delete this.customerList[parentid];
                        }
                    }
                }

                return this.areCurrenciesValid(this.customerList, reqValues);
            }
            else{
                if(reqValues.subsidiary && ( reqValues.customer || reqValues.customerSavedSearch)){
                    return this.getNoParentError();
                }
                else{
                    return {isValid: true, type: this.VALIDATION_TYPES.SUCCESS};
                }

            }

        };

        /**
         * Add the child to the customer list
         *
         * @param {int} parentId Parent customer id
         * @param {obj} child Data of subcustomer
         */
        pushChildrenToParent(parentId, child){
            if(parentId && child){
                //if the parent children list is not yet created, create it.
                if(!this.customerList[parentId].children){
                    this.customerList[parentId].children = {};
                }
                this.customerList[parentId].children[child.id] = child;
            }
        };

        /**
         * Identify the parent customer of an entity
         *
         * @param {int} parentId Customer whose parent we are searching for
         * @returns {int} ID of progenitor of the customer
         */
        findRootParent(parentId){

            let rootParent;

            if(parentId && this.customerList){
                let customerKeys = Object.keys(this.customerList);
                let idx = customerKeys.indexOf(parentId.toString());

                if(idx === -1){
                    for(let n=0; n<customerKeys.length; n++){
                        let currCustomer = this.customerList[ customerKeys[n] ];

                        if(currCustomer && currCustomer.children){
                            let childKeys = Object.keys(currCustomer.children);
                            if(childKeys.indexOf(parentId.toString()) > -1){
                                rootParent = currCustomer.id;
                                break;
                            }
                        }
                    }

                    //if after parsing the child root parent is still null, assign it to null
                    rootParent = (rootParent === -1) ? null : rootParent;
                }
                else{
                    rootParent = customerKeys[idx];
                }
            }

            return rootParent;
        };

        /**
         * Check if AR Debit Adjustment Item is set in company information/subsidiary
         *
         * @param {object} request values from IS Search form
         * @returns {boolean} true if AR Debit Adjustment Item is set
         */
        isARDebAdjItemSet(params) {
            let ARDebAdjItem;
            let subsidiaryID = params["subsidiary"];
            let customerList = this.getCustomerList(params);
            let customerWithTIL = new NCustomerDAO().getCustomersWithTIL(customerList);

            //AR Adjustment Item is NOT required if NO customer/s has Tax Adjustment enabled
            if (customerWithTIL.length === 0) return true;

            //AR Adjustment Item is required if ALL customers has Tax Adjustment enabled
            if(customerWithTIL.length === customerList.length){
                if (this.isOW()) {
                    let nSubsidiaryDAO = new NSubsidiaryDAO();
                    nSubsidiaryDAO.getData(subsidiaryID);
                    ARDebAdjItem = nSubsidiaryDAO.fields.arDebAdjItem.val;
                } else{
                    ARDebAdjItem = new CompanyDAO().getARDebitAdjustmentItem();
                }
            }

            return !ARDebAdjItem ? false : true;
        };

        /**
         * Check if all/no customers has 'Apply Invoice Summary Tax Adjustment' checked
         *
         * @param {object} request values from IS Search form
         * @returns {boolean} true if all customers has 'Apply Invoice Summary Tax Adjustment' checked
         */
        isCustApplyInvTaxAdj(params){
            log.debug("isCustApplyInvTaxAdj", JSON.stringify(params));
            //for now, we disable validation for Consolidated IS + Qualified IS
            // return (params['consolidated'] === 'T') ? this.validateQISConsolidated(params) :
            //     this.validateQISNonConsolidated(params);

            return this.validateQISNonConsolidated(params);
        };

        /**
         * Retrieves the customer ids based on the given search filter parameters.
         *
         * @param {object} request values from IS Search form
         * @returns {Array} Array of customer IDs.
         */
        getCustomerList(params){
            let customerList = [];
            customerList = new NCustomerDAO().getSearchResult(params);

            return customerList;
        }

        /**
         * Checks if all the customers included has 'Apply Invoice Summary Tax Adjustment' checked.
         * Used for non-consolidated IS generation
         *
         * @param {object} request values from IS Search form
         * @returns {boolean} whether or not all the customers has the 'Apply Invoice Summary Tax Adjustment' checked
         */
        validateQISNonConsolidated(params){
            let customerList = this.getCustomerList(params);
            let customerWithTIL  = new NCustomerDAO().getCustomersWithTIL(customerList);

            return (customerWithTIL.length === 0 || customerWithTIL.length === customerList.length);
        }

        /**
         * Checks if all the parent customers included has 'Apply Invoice Summary Tax Adjustment' checked.
         * Used for consolidated IS generation
         *
         * @returns {boolean} whether or not all the parent customers has the 'Apply Invoice Summary Tax Adjustment' checked
         */
        validateQISConsolidated(params){
            let customerDao = new NCustomerDAO();
            this.customerList = Object.keys(customerDao.getParentCustomers(params));
            log.debug('validateQISConsolidated Customer List', JSON.stringify(this.customerList));
            let custWithTIL = customerDao.getCustomersWithTIL(this.customerList);
            return (custWithTIL.length === 0 || ( this.customerList && custWithTIL.length === this.customerList.length) );
        }

        /**
         * Checks if Department, Location, Class is set in subsidiary/company info.
         * DLC fields are mandatory according to Accounting Preferences
         *
         * @returns {array} missing mandatory DLC fields
         */
        validateDLCFields(params){
            let missingFeature = [];

            let customerList = this.getCustomerList(params);
            let customerWithTIL  = new NCustomerDAO().getCustomersWithTIL(customerList);

            if(customerWithTIL.length === customerList.length){
                let AR_Dept, AR_Loc, AR_Class;
                let OW = this.isOW();
                if (OW){
                    let nSubsidiaryDAO = new NSubsidiaryDAO();
                    nSubsidiaryDAO.getData(params["subsidiary"]);
                    AR_Dept = nSubsidiaryDAO.fields.dlc_department.val;
                    AR_Loc = nSubsidiaryDAO.fields.dlc_location.val;
                    AR_Class = nSubsidiaryDAO.fields.dlc_class.val;
                }else{
                    let companyDAO = new CompanyDAO();
                    AR_Dept = companyDAO.getDepartment() ? companyDAO.getDepartment() : null;
                    AR_Loc = companyDAO.getLocation() ? companyDAO.getLocation() : null;
                    AR_Class = companyDAO.getClass() ? companyDAO.getClass() : null;
                }

                let accPref = new AccountingPreference();
                let locMandatory = (runtime.isFeatureInEffect('MULTILOCINVT') || accPref.isLocMandatory());

                let dlcFields = [{
                    pref: accPref.isDeptMandatory(),
                    value: AR_Dept
                },{
                    pref: locMandatory,
                    value: AR_Loc
                },{
                    pref: accPref.isClassMandatory(),
                    value: AR_Class
                }];

                dlcFields.forEach(function(dlcField){
                    if (dlcField.pref && dlcField.value === null){
                        missingFeature.push(dlcField);
                    }
                });
            }

            return missingFeature;
        }

    }

    return GenerationValidator;
});
