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
        class JP_NClassDAO {
            constructor() {
                this.name = 'JP_NClassDAO';

                this.fields = {
                    id : 'id',
                    subsidiary : 'subsidiary',
                    name: 'name'
                };

                this.recordType = query.Type.CLASSIFICATION;
            }

            getClasses(subsidiaryId){

                log.debug("getClasses params: ", subsidiaryId);
                let results = [];
                let classQuery = query.create({type: this.recordType});

                classQuery.columns = [
                    classQuery.createColumn({fieldId: this.fields.id}),
                    classQuery.createColumn({fieldId: this.fields.name})
                ];

                let inactiveCondition = classQuery.createCondition({
                    fieldId: 'isinactive',
                    operator : query.Operator.IS,
                    values : false
                });

                if(subsidiaryId){ //query for OW
                    classQuery.condition = classQuery.and(
                        inactiveCondition,
                        classQuery.createCondition({
                            fieldId: this.fields.subsidiary,
                            operator : query.Operator.INCLUDE_ANY,
                            values : [subsidiaryId]
                        })
                    )
                }
                else{ //query for SI
                    classQuery.condition = inactiveCondition;
                }

                let resultSet = classQuery.run();
                results = resultSet.asMappedResults();

                log.debug('class: ', JSON.stringify(results));
                return results;
            }

        }

        return JP_NClassDAO;
});