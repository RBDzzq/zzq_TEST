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

        class JP_ARADJBase{

            constructor(recordType){
                this.recordType = recordType; //subtype of transaction
                this.type = query.Type.TRANSACTION; //main type
                this.fields = {
                    id : 'id',
                    isTransaction : 'custbody_suitel10n_jp_ids_rec',
                    recordtype: 'recordtype'
                };
            }

            /**
             * Retrieves the AR Debit Adjustment associated with the invoice summary, used for qualified invoice system.
             *
             * @param invoiceSummaryID
             * @return {integer} the id of the AR debit Adjustment otherwise if not found returns null.
             */

            _retrieveIDByInvoiceSummary(invoiceSummaryID){
                let result = null;

                if(invoiceSummaryID){
                    let tmp = this._getARData(invoiceSummaryID);
                    result = tmp.id;
                }

                return result;
            }

            _getARData(invoiceSummaryID){
                let result = {
                    id : null
                };
                let arQuery = new query.create({type: query.Type.TRANSACTION});
                arQuery.columns = [
                    arQuery.createColumn({fieldId: this.fields.id})
                ];

                arQuery.condition = arQuery.and(
                    arQuery.createCondition({
                        fieldId: this.fields.isTransaction,
                        operator: query.Operator.ANY_OF,
                        values: invoiceSummaryID
                    }),
                    arQuery.createCondition({
                        fieldId: this.fields.recordtype,
                        operator: query.Operator.ANY_OF,
                        values: this.recordType
                    })
                );

                let qResult = arQuery.run().asMappedResults();
                log.debug('retrieveIDByInvoiceSummary: ' + this.recordType, JSON.stringify(qResult));

                if((qResult && qResult[0])){
                    result = {
                        id: qResult[0][this.fields.id]
                    }
                }

                return result;
            }

        }
        return JP_ARADJBase;
    });
