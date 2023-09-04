/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/query",
        "N/runtime",
        "../JP_CompanyDAO"],

    (query, runtime, CompDAO) =>{

        function NPurchaseOrderDAO() {
            this.name = 'NPurchaseOrderDAO';

            //mapping of the fields and their value,
            //also acts as storage for the field names, so we define them in one place.
            this.fields = {
                timesPrinted :{
                    id: "custpage_jp_timesprinted",
                    val : 0
                },
                printBtn : {
                    id: 'custpage_jp_printpo'
                },
                printFolder: {
                    id: 'custrecord_jp_loc_sub_printed_po',
                    val: ''
                },
                ApplySubcon : {
                    id: 'custentity_jp_posubcontract_act',
                    val: ''
                },
                transactionType : {
                    id: 'type',
                    val: ''
                },
                country : {
                    id: 'country',
                    val : ''
                },
                tranid :{
                    id: 'tranid',
                    val : ''
                },
                entity : {
                    id: 'entity',
                    val : ''
                },
                entityid : { //we use this for the filename if autoname = True
                  id: 'entityid',
                  val: ''
                },
                status : {
                    id: 'status',
                    val: ''
                }
            };

            this.subtab = {
                print : 'custpage_jp_printsubtab'
            };

            //Purchase Order is a subtype of Transaction
            this.recordType = query.Type.TRANSACTION;
        }

        /**
         * Get all the data we need related to the Print Order Numbering in a single query
         *
         * @param id - internalId of the purchase order.
         */
        NPurchaseOrderDAO.prototype.getData = function(id){

            let myQuery = query.create({
                type: this.recordType
            });

            let entityJoin = myQuery.joinTo({target: 'vendor', fieldId:'entity'});

            myQuery.columns = [
                myQuery.createColumn({fieldId: 'id'}),
                myQuery.createColumn({fieldId: this.fields.transactionType.id}),
                myQuery.createColumn({fieldId: this.fields.tranid.id}),
                myQuery.createColumn({fieldId: this.fields.entity.id}),
                myQuery.createColumn({fieldId: this.fields.status.id}),
                entityJoin.createColumn({fieldId: this.fields.ApplySubcon.id}),
                entityJoin.createColumn({fieldId: this.fields.entityid.id})
            ];

            let isOW = runtime.isFeatureInEffect({feature:'SUBSIDIARIES'});

            if(isOW){
                let subsidiaryJoin = myQuery.join({fieldId: 'transactionlines.subsidiary'});

                myQuery.columns.push(
                    subsidiaryJoin.createColumn({fieldId: this.fields.country.id})
                );

                myQuery.columns.push(
                    subsidiaryJoin.createColumn({fieldId: this.fields.printFolder.id})
                );
            }
            else{
                let compDao = new CompDAO();
                this.fields.country.val = compDao.getCompValue(this.fields.country.id);
                this.fields.printFolder.val = compDao.getCompValue(this.fields.printFolder.id);
            }

            myQuery.condition = myQuery.and(
                myQuery.createCondition({fieldId: 'id', operator: query.Operator.ANY_OF, values: [id]}),
                myQuery.createCondition({fieldId: 'type', operator: query.Operator.IS, values: 'PurchOrd'})
            );

            let resultSet = myQuery.run();
            let mappedResult = resultSet.asMappedResults();

            //map to the result to the object
            if (mappedResult && mappedResult[0]){
                let result = mappedResult[0];
                this.fields.ApplySubcon.val = result[this.fields.ApplySubcon.id];
                this.fields.transactionType.val = result[this.fields.transactionType.id];
                this.fields.tranid.val = result[this.fields.tranid.id];
                this.fields.entity.val = result[this.fields.entity.id];
                this.fields.status.val = result[this.fields.status.id];
                this.fields.entityid.val = result[this.fields.entityid.id];

                if(isOW){
                    this.fields.country.val = result[this.fields.country.id];
                    this.fields.printFolder.val = result[this.fields.printFolder.id];
                }
            }
        };

        return NPurchaseOrderDAO;
    });
