/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(['N/query',
        'N/search',
        'N/runtime',
        '../../lib/JP_QueryIterator',
        '../JP_CustomerDAO',
        '../JP_TransactionDAO',
        './JP_NCustTreeDAO',
        "../../app/JP_ISGenerationFormFilterExpressionCreator"
    ],
    (query, search, runtime, QueryIterator, CustomerDAO,
         TransactionDAO, CustomerTree, FilterExpressionCreator) => {

        class NCustomerDAO{

            constructor() {
                this.name = 'NCustomerDAO';
                this.fields = {
                    id : 'id',
                    companyName : 'companyname',
                    isperson : 'isperson',
                    lastname : 'lastname',
                    firstname : 'firstname',
                    parent: 'parent',
                    parentparent : 'parentparent',
                    isInactive : 'isinactive',
                    useInvoiceSummary : 'custentity_4392_useids',
                    currencies : 'currency',
                    applyInvcTaxLaw : 'custentity_jp_taxinvchckbox',
                    subsidiary : 'entity<customersubsidiaryrelationship.subsidiary'
                };
                this.recordType = query.Type.CUSTOMER;
            }

            /**
             * Retrieves the parent customer's data when Consolidated Invoice Summary is true
             * based on the different permutations of the provided filters.
             *
             * @param reqData
             * @returns {null}
             */
            getParentCustomers(reqData){

                let isOW = runtime.isFeatureInEffect({feature: "SUBSIDIARIES"});
                let results = null;
                let sqlQuery = '';

                //filter is subsidiary only. customer, customer saved search are blank.
                if(reqData.subsidiary && !reqData.customer && !reqData.customerSavedSearch ||
                    (!isOW && !reqData.customer && !reqData.customerSavedSearch)){
                    sqlQuery = this.getSubsidiaryOnlyQuery(reqData.subsidiary);
                }

                if(reqData.subsidiary && reqData.customer || (!isOW && reqData.customer)){
                    sqlQuery = this.getSubsidiaryAndCustomerQuery(reqData.subsidiary, [reqData.customer]);
                }

                if(reqData.subsidiary && reqData.customerSavedSearch || (!isOW && reqData.customerSavedSearch)){
                    let customers = new CustomerDAO().executeSavedSearch({searchId:reqData.customerSavedSearch});
                    sqlQuery = this.getSubsidiaryAndCustomerQuery(reqData.subsidiary, customers.map(x => x.id));
                }

                log.debug('sql Query', sqlQuery);
                results = this.parseQueryResult(sqlQuery);

                return results;
            };

            getCustomerChild(parentIds, subsidiary){
                let results = null;

                if(parentIds){
                    let sqlQuery = this.getCustomerChildQuery(parentIds, subsidiary);
                    results = this.parseQueryResult(sqlQuery);
                }

                return results;
            };

            parseQueryResult(sqlQuery){
                let results = null;

                let iterator = new QueryIterator(sqlQuery);
                let customer = null;
                while((customer = iterator.next())){

                    if(results === null) results = {};

                    //for easier searching, we store it in a lookup table.
                    if(!!results[customer.id] === false){
                        results[customer.id] = customer;

                        //convert currency field into an array
                        //given that a customer can have more than 1 currency.
                        customer.currencies = [customer.currency];
                    }
                    else{
                        results[customer.id].currencies.push(customer.currency);
                    }
                }

                return results;
            };

            /** Helper Functions */

            /**
             * Returns the query to retrieve customers whose subsidiary is the given subsidiary id,
             *     use invoice summary = T, active customer and a root parent (Parent is null)
             *
             * @param subsidiaryId
             * @returns {*}
             *
             * Sample Result of the Query:
             *
             [
             {"id":"24270","subsidiary":8,"currency":5,
            "companyname":"JP Parent 1","isperson":false,"lastname":null,"firstname":null},
             {"id":"24270","subsidiary":8,"currency":1,
            "companyname":"JP Parent 1","isperson":false,"lastname":null,"firstname":null},
             {"id":"24270","subsidiary":8,"currency":3,
            "companyname":"JP Parent 1","isperson":false,"lastname":null,"firstname":null},
             {"id":"24270","subsidiary":8,"currency":4,
            "companyname":"JP Parent 1","isperson":false,"lastname":null,"firstname":null},
             {"id":"24267","subsidiary":8,"currency":5,
            "companyname":"Japan Customer","isperson":false,"lastname":null,"firstname":null},
             {"id":"24266","subsidiary":8,"currency":5,
            "companyname":"Japanese Customer","isperson":false,"lastname":null,"firstname":null}
             ]
             */

            getSubsidiaryOnlyQuery(subsidiaryId){

                let isMulticurrency = runtime.isFeatureInEffect({feature:'MULTICURRENCY'});

                let  sqlquery = "SELECT " +
                    "BUILTIN_RESULT.TYPE_STRING(Customer.id) AS id ";

                if(subsidiaryId){
                    sqlquery += ", BUILTIN_RESULT.TYPE_INTEGER(CustomerSubsidiaryRelationship.subsidiary) AS subsidiary ";
                }

                if(isMulticurrency){
                    sqlquery += ", BUILTIN_RESULT.TYPE_INTEGER(customerCurrencyBalance.currency) AS currency ";
                }

                sqlquery +=", BUILTIN_RESULT.TYPE_STRING(Customer.companyname) AS companyname " +

                    // If the company happens to be a person, we also retrieve the isperson, lastname and firstname
                    // for display purposes later in the template
                    ", BUILTIN_RESULT.TYPE_BOOLEAN(Customer.isperson) AS isperson " +
                    ", BUILTIN_RESULT.TYPE_STRING(Customer.lastname) AS lastname "  +
                    ", BUILTIN_RESULT.TYPE_STRING(Customer.firstname) AS firstname " +
                    "FROM " +
                    "Customer ";

                if(isMulticurrency){
                    sqlquery += ", customerCurrencyBalance";       //currency join
                }


                if(subsidiaryId){
                    sqlquery += ", CustomerSubsidiaryRelationship "; //subsidiary join
                }

                sqlquery += " WHERE ";

                if(isMulticurrency && subsidiaryId){
                    //retrieve all currencies assigned to the customer
                    sqlquery += "((Customer.\"ID\" = customerCurrencyBalance.customer(+) AND"
                            + " Customer.\"ID\" = CustomerSubsidiaryRelationship.entity(+) "
                            + ")) AND";
                }
                else if(subsidiaryId){
                    sqlquery += "(Customer.\"ID\" = CustomerSubsidiaryRelationship.entity(+) ) AND ";
                }
                else if(isMulticurrency){
                    sqlquery += "(Customer.\"ID\" = customerCurrencyBalance.customer(+)) AND ";
                }

                sqlquery += "( " +
                    "(Customer.custentity_4392_useids = 'T' ";  //Use Invoice Summary = True

                if(subsidiaryId){ //Subsidiary filter for one world.
                    sqlquery += "AND CustomerSubsidiaryRelationship.subsidiary IN ('"+subsidiaryId+"') ";
                }

                sqlquery += "AND Customer.\"PARENT\" IS NULL " + //Customer has no parent (Root Node)
                    "AND NVL(Customer.isinactive, 'F') = 'F'))";  //Active Customer

                return sqlquery;
            };

            getSubsidiaryAndCustomerQuery(subsidiaryId, customerIds){
                let isMulticurrency = runtime.isFeatureInEffect({feature:'MULTICURRENCY'});
                let sqlquery = '';

                if(customerIds){
                    sqlquery = 	"SELECT " +
                        "BUILTIN_RESULT.TYPE_STRING(Customer.id) AS id ";

                    if(isMulticurrency){
                        sqlquery +=", BUILTIN_RESULT.TYPE_INTEGER(customerCurrencyBalance.currency) AS currency ";
                    }

                    sqlquery += ", BUILTIN_RESULT.TYPE_STRING(Customer.companyname) AS companyname " +
                        ", BUILTIN_RESULT.TYPE_BOOLEAN(Customer.isperson) AS isperson" +
                        ", BUILTIN_RESULT.TYPE_STRING(Customer.lastname) AS lastname " +
                        ", BUILTIN_RESULT.TYPE_STRING(Customer.firstname) AS firstname " +
                        "FROM " +
                        "Customer ";

                    if(isMulticurrency){
                        sqlquery += ", customerCurrencyBalance ";
                    }

                    if(subsidiaryId){
                        sqlquery += ", CustomerSubsidiaryRelationship ";
                    }

                    sqlquery += "WHERE ";

                    if(isMulticurrency && subsidiaryId){
                        //retrieve all currencies assigned to the customer
                        sqlquery += "((Customer.\"ID\" = customerCurrencyBalance.customer(+) AND"
                            + " Customer.\"ID\" = CustomerSubsidiaryRelationship.entity(+) "
                            + ")) AND";
                    }
                    else if(subsidiaryId){
                        sqlquery += "(Customer.\"ID\" = CustomerSubsidiaryRelationship.entity(+) ) AND ";
                    }
                    else if(isMulticurrency){
                        sqlquery += "(Customer.\"ID\" = customerCurrencyBalance.customer(+)) AND "
                    }

                    if(subsidiaryId){
                        sqlquery += " ((CustomerSubsidiaryRelationship.subsidiary IN ('"+subsidiaryId+"') AND ";
                    }

                    sqlquery += " UPPER(Customer.id) IN ('"+customerIds.join('\',\'')+"') "+
                        "AND NVL(Customer.isinactive, 'F') = 'F' AND Customer.custentity_4392_useids = 'T'";

                    if(subsidiaryId){
                        sqlquery += "))";
                    }
                }

                return sqlquery;
            };

            /**
             *
             * @param customerIds  List of parent customer ids whose child customers we want to retrieve.
             * @param subsidiaryid Subsidiary ID specified in the Invoice Summary page filter
             * @returns {string} The query to retrieve the parent-child relationships.
             */
            getCustomerChildQuery (customerIds, subsidiaryid){
                let isMulticurrency = runtime.isFeatureInEffect({feature:'MULTICURRENCY'});
                let sqlQuery = '';

                if(customerIds && customerIds.length > 0 ){
                    //remove the brackets. and properly enclose in single qoutes.
                    let parentIdsStr = JSON.stringify(customerIds).replace('[','')
                        .replace(']','')
                        .replace(/"/g, "\'");

                    sqlQuery = "SELECT " +
                        "BUILTIN_RESULT.TYPE_STRING(Customer.id) AS id " +
                        ", BUILTIN_RESULT.TYPE_STRING(Customer.companyname) AS companyname " +
                        ", BUILTIN_RESULT.TYPE_BOOLEAN(Customer.isperson) AS isperson " +
                        ", BUILTIN_RESULT.TYPE_STRING(Customer.lastname) AS lastname " +
                        ", BUILTIN_RESULT.TYPE_STRING(Customer.firstname) AS firstname " +
                        ", BUILTIN_RESULT.TYPE_INTEGER(Customer.\"PARENT\") AS \"PARENT\" " +
                        ", BUILTIN_RESULT.TYPE_INTEGER(Customer_0.\"PARENT\") AS parentparent";

                    if(isMulticurrency){
                        sqlQuery += ", BUILTIN_RESULT.TYPE_INTEGER(customerCurrencyBalance.currency) AS currency ";
                    }

                    sqlQuery += " FROM Customer";

                    if(isMulticurrency){
                        sqlQuery += ", customerCurrencyBalance ";
                    }

                    if(subsidiaryid){
                        sqlQuery += ", CustomerSubsidiaryRelationship ";
                    }

                    sqlQuery += ", Customer Customer_0 " +
                        " WHERE ";

                    let hasOpenParenthesis = false;
                    if(isMulticurrency && subsidiaryid){
                        //retrieve all currencies assigned to the customer
                        sqlQuery += "((Customer.\"ID\" = customerCurrencyBalance.customer(+) AND"
                            + " Customer.\"ID\" = CustomerSubsidiaryRelationship.entity(+) "
                            + ") AND ";
                        hasOpenParenthesis = true;
                    }
                    else if(subsidiaryid){
                        sqlQuery += "((Customer.\"ID\" = CustomerSubsidiaryRelationship.entity(+) ) AND ";
                        hasOpenParenthesis = true;
                    }
                    else if(isMulticurrency){
                        sqlQuery += "((Customer.\"ID\" = customerCurrencyBalance.customer(+)) AND ";
                        hasOpenParenthesis = true;
                    }

                    sqlQuery += "Customer.\"PARENT\" = Customer_0.\"ID\"(+) ";

                    if(hasOpenParenthesis){
                        sqlQuery += ')';
                    }
                    sqlQuery += "AND (((Customer_0.\"PARENT\" IN ("+parentIdsStr+") " +
                        "OR Customer.\"PARENT\" IN ("+parentIdsStr+")) " +
                        "AND Customer.custentity_4392_useids = 'T' " +
                        "AND NVL(Customer.isinactive, 'F') = 'F' ";

                    if(subsidiaryid){
                        sqlQuery += "AND CustomerSubsidiaryRelationship.subsidiary IN ('"+subsidiaryid+"')"
                    }
                    sqlQuery += "))";
                }

                return sqlQuery;
            }

            /**
             * Retrieves the  APPLY INVOICE SUMMARY TAX ADJUSTMENT setting in the customer record.
             * @param customerId  the customer whose setting we want to retrieve.
             * @return {boolean}  the actual customer setting.
             */
            getTaxInvoiceLawSetting(customerId){
                let setting = false;
                if(customerId){
                    let customerQuery = query.create({type: this.recordType});

                    customerQuery.columns = [customerQuery.createColumn({fieldId: this.fields.applyInvcTaxLaw})];
                    customerQuery.condition = customerQuery.and(
                        customerQuery.createCondition({
                            fieldId: 'id',
                            operator: query.Operator.ANY_OF,
                            values: customerId}),
                        customerQuery.createCondition({
                            fieldId: this.fields.isInactive,
                            operator: query.Operator.IS,
                            values: false
                        })
                    );

                    let results = customerQuery.run().asMappedResults();

                    log.debug('getTaxInvoiceLawSetting query result', JSON.stringify(results));
                    if (results && results[0] && results[0][this.fields.applyInvcTaxLaw] === true){
                        setting = true;
                    }
                }
                log.debug('getTaxInvoiceLawSetting return value', setting);
                return setting;
            }

            /**
             * Retrieves the Customers that has APPLY INVOICE SUMMARY TAX ADJUSTMENT = T
             * @param customerList  the list of customers whose setting we want to retrieve.
             * @return [Array]  an array of customer ids.
             */
            getCustomersWithTIL(customerList){
                log.debug('getCustomersWithTIL params', JSON.stringify(customerList));
                let results = [];

                if(customerList && customerList.length > 0) {
                    let customerQuery = query.create({type: this.recordType});
                    customerQuery.columns = [customerQuery.createColumn({fieldId: this.fields.id})];

                    customerQuery.condition = customerQuery.and(
                        customerQuery.createCondition({
                            fieldId: this.fields.id,
                            operator: query.Operator.ANY_OF,
                            values: customerList
                        }),
                        customerQuery.createCondition({
                            fieldId: this.fields.applyInvcTaxLaw,
                            operator: query.Operator.IS,
                            values: true
                        })
                    );

                    let iterator = new QueryIterator(customerQuery);
                    let cust = null;
                    while((cust = iterator.next())){
                        results.push(cust.id);
                    }
                }
                log.debug('getCustomersWithTIL results', JSON.stringify(results));
                return results;
            }

            /**
             * Retrieves the Customers that are from the IS Generation results
             * will not include customers that has no transaction
             * @param params parameters that was from the IS Generation search form
             * @return [Array] an array of customer ids.
             */
            getSearchResult(params){
                log.debug("JP_NCustomerDAO.getSearchResult()", JSON.stringify(params));
                let customerList = [];

                if(params.hierarchyId){
                    let custTree = new CustomerTree();
                    let customerHierarchy = record.load({
                        type: custTree.recordType,
                        id: params.hierarchyId
                    });
                    let hierarchyStore = customerHierarchy.getValue({fieldId: custTree.fields.hierarchystore});

                    if(!!hierarchyStore){
                        customerList = JSON.parse(hierarchyStore);
                    }
                }
                else{
                    let filterExpression = new FilterExpressionCreator().create(params);

                    log.debug("filterExpression in getSearchResult: ", JSON.stringify(filterExpression));
                    let transDAO = new TransactionDAO();
                    let searchResults = transDAO.executeSavedSearch({
                        searchId: "customsearch_suitel10n_jp_ids_cust_trans",
                        filterExpression: filterExpression
                    });

                    let tmp = []; //temporary storage, goal is to remove the duplicates
                    searchResults.forEach((result) => {
                        let entId = result.getValue({name: 'entity', summary: 'group'});

                        if(!tmp[entId]){
                            tmp[entId] = entId;
                        }
                    });

                    customerList = Object.keys(tmp);
                }

                log.debug('getSearchResult result', JSON.stringify(customerList));
                return customerList;
            }

        }

        return NCustomerDAO;
    });
