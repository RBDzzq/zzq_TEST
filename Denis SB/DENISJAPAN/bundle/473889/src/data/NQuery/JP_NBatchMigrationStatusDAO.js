/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/query", "N/record"],
(query, record) =>{
    class BatchMigrationStatusDAO {

        constructor(){
            this.fields = {
                id: 'id',
                isComplete: "custrecord_jp_is_complete"
            };
            this.recordType = "customrecord_jp_migration_status";
            this.instanceId = this.getInstanceId(this.recordType, this.fields.id);
        }

        /**
         * Gets the state of the checkbox isComplete
         *
         * @returns {boolean} value of the field isComplete
         */
        getStatus(){
            if(this.instanceId) {
                let statusQuery = query.create({ type: this.recordType });
                statusQuery.columns = [
                    statusQuery.createColumn({ fieldId: this.fields.isComplete })
                ];
                statusQuery.createCondition({
                    fieldId: this.fields.id,
                    operator: query.Operator.IS,
                    values: [this.instanceId]
                });
                let results = statusQuery.run();
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
                record.submitFields({
                    type: this.recordType,
                    id: this.instanceId,
                    values: {
                        "custrecord_jp_is_complete": status
                    }
                });
            }
        }

        getInstanceId(recType, fieldId) {
            let statusQuery = query.create({ type: recType });
            statusQuery.columns = [
                statusQuery.createColumn({ fieldId: fieldId })
            ];
            let results = statusQuery.run();
            let mappedResult = results.asMappedResults();

            if (mappedResult && mappedResult[0]) {
                return mappedResult[0].id;
            } else {
                return undefined;
            }
        }
    }

    return BatchMigrationStatusDAO;
});