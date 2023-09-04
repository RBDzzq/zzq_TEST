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

        function NVendorDAO() {
            this.name = 'NVendorDAO';

            //mapping of the fields and their value,
            //also acts as storage for the field names, so we define them in one place.
            this.fields = {
                ApplySubcon: {
                    id: "custentity_jp_posubcontract_act",
                    val: ''
                }
            };
            this.recordType = query.Type.VENDOR;
        }

        NVendorDAO.prototype.getData = function(id){

            if(id){
                let myQuery = query.create({
                    type: this.recordType
                });

                myQuery.columns = [
                    myQuery.createColumn({fieldId: 'id'}),
                    myQuery.createColumn({fieldId: this.fields.ApplySubcon.id}),
                ];

                myQuery.condition = myQuery.createCondition({
                    fieldId: 'id',
                    operator: query.Operator.ANY_OF,
                    values: [id]
                });

                let resultSet = myQuery.run();
                let mappedResult = resultSet.asMappedResults();

                //map to the result to the object
                if (mappedResult && mappedResult[0]){
                    this.fields.ApplySubcon.val = mappedResult[0].custentity_jp_posubcontract_act;
                }
            }
        };

       return NVendorDAO;
    });
