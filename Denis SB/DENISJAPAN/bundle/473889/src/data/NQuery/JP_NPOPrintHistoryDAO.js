/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/query"],

    (query) => {

        class NPOPrintHistoryDAO {

            constructor() {
                this.name = 'NPOPrintHistoryDAO';

                //mapping of the fields and their value,
                //also acts as storage for the field names, so we define them in one place.
                this.fields = {
                    user: {
                        id: "custrecord_jp_printuser"
                    },
                    dateTime: {
                        id: "custrecord_jp_print_datetime"
                    },
                    fileLink: {
                        id: 'custrecord_jp_printedpo'
                    },
                    purchaseOrder: {
                        id: "custrecord_jp_po_fkey"
                    },
                    //some employee fields for display in the sublist
                    empFirstName: {
                        id: 'firstname'
                    },
                    empLastName: {
                        id: 'lastname'
                    }
                };

                this.totalPrints = 0;
                this.recordType = 'customrecord_jp_printhistory';
                this.values = []; //collection of print history
            }

            getData(id){
                //for now return 0;
                let myQuery = query.create({
                    type: this.recordType
                });

                let employeeJoin = myQuery.join({fieldId: this.fields.user.id});

                myQuery.columns = [
                    myQuery.createColumn({fieldId: 'id'}),
                    myQuery.createColumn({fieldId: this.fields.fileLink.id}),
                    myQuery.createColumn({fieldId: this.fields.user.id}),
                    myQuery.createColumn({fieldId: this.fields.dateTime.id}),
                    myQuery.createColumn({fieldId: this.fields.purchaseOrder.id}),
                    employeeJoin.createColumn({fieldId: this.fields.empFirstName.id}),
                    employeeJoin.createColumn({fieldId: this.fields.empLastName.id})
                ];

                myQuery.condition = myQuery.createCondition({
                    fieldId: this.fields.purchaseOrder.id,
                    operator: query.Operator.IS,
                    values: [id]
                });

                //sort by datetime
                myQuery.sort = [
                    myQuery.createSort({
                        column: myQuery.columns[3],
                        ascending: false})
                ];

                let resultSet = myQuery.run();
                this.values = resultSet.asMappedResults();
                this.totalPrints = this.values.length;
            };
        }

        return NPOPrintHistoryDAO;
    });
