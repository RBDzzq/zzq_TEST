/**
 * Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/query"],

    (query) => {

        class JP_NLocationDAO {

            constructor() {
                this.name = 'JP_NLocationDAO';

                this.fields = {
                    id : 'id',
                    subsidiary : 'subsidiary',
                    name: 'name'
                };

                this.recordType = query.Type.LOCATION;
            }

            getLocations(subsidiaryId){

                log.debug("getLocations params: ", subsidiaryId);
                let results = [];
                let locationQuery = query.create({type: this.recordType});

                locationQuery.columns = [
                    locationQuery.createColumn({fieldId: this.fields.id}),
                    locationQuery.createColumn({fieldId: this.fields.name})
                ];
                let inactiveCondition = locationQuery.createCondition({
                    fieldId: 'isinactive',
                    operator : query.Operator.IS,
                    values : false
                });


                if(subsidiaryId){ //query for OW
                    locationQuery.condition = locationQuery.and(
                        inactiveCondition,
                        locationQuery.createCondition({
                            fieldId: this.fields.subsidiary,
                            operator : query.Operator.INCLUDE_ANY,
                            values : [subsidiaryId]
                        })
                    )
                }
                else{ //query for SI
                    locationQuery.condition = inactiveCondition;
                }

                let resultSet = locationQuery.run();
                results = resultSet.asMappedResults();

                log.debug('location: ', JSON.stringify(results));
                return results;
            }

        }

        return JP_NLocationDAO;
    });
