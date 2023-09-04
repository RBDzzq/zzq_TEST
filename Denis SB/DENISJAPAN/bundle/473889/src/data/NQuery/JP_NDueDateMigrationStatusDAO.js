/**
 * Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/query", "N/record"],
    (query, record) =>{
        class JP_NDueDateMigrationStatusDAO {

            constructor(){
                this.fields = {
                    id: 'id',
                    isComplete: "custrecord_jp_fld_duedatemigstat"
                };
                this.recordType = "customrecord_jp_duedate_migstat";
                this.instanceId = this.getInstanceId(this.recordType, this.fields.id);
            }

            /**
             * Gets the state of the checkbox isComplete
             *
             * @returns {boolean} value of the field isComplete
             */
            getStatus(){
                if(this.instanceId) {
                    let statQuery = query.create({ type: this.recordType });
                    statQuery.columns = [
                        statQuery.createColumn({ fieldId: this.fields.isComplete })
                    ];
                    statQuery.createCondition({
                        fieldId: this.fields.id,
                        operator: query.Operator.IS,
                        values: [this.instanceId]
                    });
                    let results = statQuery.run();
                    let mappedResult = results.asMappedResults();

                    if (mappedResult && mappedResult[0]) {
                        return mappedResult[0][this.fields.isComplete];
                    }
                }
                return true;    //returns true if instanceId is undefined to avoid blocking customer processes
            }

            /**
             * Sets the state of the checkbox isComplete
             *
             * @param status {boolean} value to be set for the isComplete checkbox
             */
            setStatus(status){
                if(this.instanceId) {
                    let values = {};
                    values[this.fields.isComplete] = status
                    record.submitFields({
                        type: this.recordType,
                        id: this.instanceId,
                        values
                    });
                }
            }

            getInstanceId(recType, fieldId) {
                let returnVal = undefined;
                let statQuery = query.create({ type: recType });
                statQuery.columns = [
                    statQuery.createColumn({ fieldId: fieldId })
                ];
                let results = statQuery.run();
                let mappedResult = results.asMappedResults();

                if (mappedResult && mappedResult[0]) {
                    returnVal = mappedResult[0].id;
                }

                return returnVal;
            }
        }

        return JP_NDueDateMigrationStatusDAO;
    });