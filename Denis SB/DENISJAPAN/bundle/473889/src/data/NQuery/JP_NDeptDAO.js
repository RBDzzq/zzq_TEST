/**
 * Copyright (c) 2023, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/query"],
    (query) => {

        class JP_NDeptDAO {
            constructor() {
                this.name = 'JP_NDeptDAO';

                this.fields = {
                    id : 'id',
                    subsidiary : 'subsidiary',
                    name: 'name'
                };

                this.recordType = query.Type.DEPARTMENT;
            }

            getDepartments(subsidiaryId){

                log.debug("getDepartments params: ", subsidiaryId);
                let results = [];
                let deptQuery = query.create({type: this.recordType});

                deptQuery.columns = [
                    deptQuery.createColumn({fieldId: this.fields.id}),
                    deptQuery.createColumn({fieldId: this.fields.name})
                ];

                let inactiveCondition = deptQuery.createCondition({
                    fieldId: 'isinactive',
                    operator : query.Operator.IS,
                    values : false
                });

                if(subsidiaryId){ //query for OW
                    deptQuery.condition = deptQuery.and(
                        inactiveCondition,
                        deptQuery.createCondition({
                            fieldId: this.fields.subsidiary,
                            operator : query.Operator.INCLUDE_ANY,
                            values : [subsidiaryId]
                        })
                    )
                }
                else{ //query for SI
                    deptQuery.condition = inactiveCondition;
                }

                let resultSet = deptQuery.run();
                results = resultSet.asMappedResults();

                log.debug('department: ', JSON.stringify(results));
                return results;
            }

        }

        return JP_NDeptDAO;

    });