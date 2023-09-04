/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(['N/record',
        'N/query',
        'N/search',
        '../../lib/JP_QueryIterator',
        '../../data/JP_InvoiceSummaryRequestDAO'],

    (record, query, search, iterator, requestDAO) =>{

        class NCustTreeDAO{

            constructor() {
                this.fields = {
                    id : 'id',
                    hierarchystore: 'custrecord_jp_hierarchy_store',
                    datecreated : 'custrecord_jp_createdate'
                };
                this.recordType = 'customrecord_jp_customer_hierarchy';
            }

            /**
             * Saves the customer parent child hierarchy to sa custom record.
             *
             * @param data The collection of customers arranged in hierarchy.
             * @returns {integer} The internal id of the just created record.
             */
            saveCustomerTree(data){

                let recordId;

                if(!!data){
                    let custTree = record.create({ type: this.recordType, isDynamic: true});
                    custTree.setValue({
                        fieldId: this.fields.hierarchystore,
                        value: JSON.stringify(data)
                    });

                    recordId = custTree.save();
                }

                return recordId;
            }

            /**
             *
             * @param MAXAGE number of days old, all hierarchy records beyond this age and not attached to any
             *                  Invoice Summary Request Record are retrieved.
             * @returns {*[]}  Array of Customer Hierarchy Record ids.
             *
             */

            getAgedCustomerTree(MAXAGE){

                let results = [];

                if(MAXAGE){
                    let reqDao = new requestDAO();

                    let dateToCompare = query.createRelativeDate({
                        dateId: query.DateId.DAYS_AGO,
                        value: MAXAGE
                    });

                    let myQ = query.create({type: this.recordType});
                    let requestJoin = myQ.joinFrom({fieldId: reqDao.fields.hierarchyid,
                        source: reqDao.recordType});

                    myQ.columns = [
                        myQ.createColumn({fieldId: this.fields.id}),
                        myQ.createColumn({fieldId: this.fields.datecreated}),
                        requestJoin.createColumn({fieldId: reqDao.fields.hierarchyid})
                    ];

                    myQ.condition = myQ.and(
                        myQ.createCondition({
                            fieldId : this.fields.datecreated,
                            operator: query.Operator.ON_OR_BEFORE,
                            values: [dateToCompare]
                        }),
                        requestJoin.createCondition({
                            fieldId: reqDao.fields.hierarchyid,
                            operator: query.Operator.EMPTY
                        })
                    );

                    let qIterator = new iterator(myQ);
                    let tree = null;
                    while((tree = qIterator.next())){
                        results.push(tree.id);
                    }
                }

                return results;
            }

            /**
             * Create a lookup table for parent given the customer ID
             * @param hierarchyObj Object derived from the hierarchy record's hierarchy store
             * @returns {integer} Key-value pairs of child and parent customer
             *
             */
            createParentLookupTable(hierarchyId, hierarchyObj){

                let parentLookup = null;
                if(hierarchyId && hierarchyId > -1) {
                    let hierarchyLookup = search.lookupFields({
                        type: this.recordType,
                        id: hierarchyId,
                        columns: [this.fields.hierarchystore]
                    });
                    hierarchyObj = hierarchyLookup[this.fields.hierarchystore] ?
                        JSON.parse(hierarchyLookup[this.fields.hierarchystore]) : null;
                }

                if(hierarchyObj){
                    parentLookup = {};
                    Object.keys(hierarchyObj).forEach((customer) => {
                        parentLookup[customer] = customer; //match a root to itself
                        if(hierarchyObj[customer] && hierarchyObj[customer].children){
                            let childrenKeys = Object.keys(hierarchyObj[customer].children);
                            for(let i = 0; i < childrenKeys.length; i++) {
                                parentLookup[childrenKeys[i]] = customer;
                            }
                        }
                    });
                }

                return parentLookup;
            }

        }

        return NCustTreeDAO;

    });
