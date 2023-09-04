/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(['N/query', 'N/runtime', '../../lib/JP_QueryIterator'],

    function(query, runtime, QueryIterator) {

        const CLOSING_DATE_ID = 'custrecord_suitel10n_jp_ids_su_cd';
        const SUBSIDIARY_ID = 'custrecord_suitel10n_jp_ids_su_sub';
        const CUSTOMER_ID = 'custrecord_suitel10n_jp_ids_su_cust';
        const CUSTOMER_SAVED_SEARCH_ID = 'custrecord_japan_loc_cust_savedsearch';
        const NO_TRANS_ID = 'custrecord_suitel10n_jp_ids_su_no_trans';
        const OVERDUE_ID = 'custrecord_suitel10n_jp_ids_su_overdue';
        const OWNER_ID = 'owner';
        const DATECREATED_ID = 'created';
        const STATUS_ID = 'custrecord_suitel10n_jp_ids_gen_b_stat';
        const GEN_PARAMS_ID = 'custrecord_suitel10n_jp_ids_su_params';
        const ENTITYID_FIELD = 'entityid';
        const NAME_FIELD = 'name';
        const INTERNALID = 'id';
        const ERROR_DETAIL_ID = 'custrecord_suitel10n_jp_ids_err_detail';
        const LAST_BATCH_RUN = 'custrecord_suitel10n_jp_lastrun';

        class NBatchDAO{
            constructor(){
                this.name = 'JP_NBatchDAO';
                this.fields = {
                    "closingDate": CLOSING_DATE_ID,
                    "noTrans":NO_TRANS_ID,
                    "overdue": OVERDUE_ID,
                    "saveSearch":CUSTOMER_SAVED_SEARCH_ID,
                    "dateCreated": DATECREATED_ID,
                    "errorDetail": ERROR_DETAIL_ID,
                    "lastBatchRun": LAST_BATCH_RUN,

                    "owner": OWNER_ID,
                    "customer": CUSTOMER_ID,
                    "subsidiary": SUBSIDIARY_ID,
                    "generationParams": GEN_PARAMS_ID,
                    "status": STATUS_ID,
                    "hierarchyId" : "custrecord_japan_loc_hierarchy",
                    "statementDate" : "custrecord_suitel10n_jp_ids_su_sd"
                };
                this.recordType = 'customrecord_suitel10n_jp_ids_gen_batch';
            }

            /**
             * Retrieve field values to be displayed on the IS Generation Status SU
             *
             * @param settings {obj} Contains sort and display filters
             * @returns {obj} Key-value pairs of batch field ids and values
             */
            getBatchData(settings){

                let batchQuery = query.create({type: this.recordType});
                let fieldVals = [CLOSING_DATE_ID, NO_TRANS_ID, OVERDUE_ID, CUSTOMER_SAVED_SEARCH_ID,
                    DATECREATED_ID, ERROR_DETAIL_ID, LAST_BATCH_RUN];

                batchQuery.columns = [];
                for(const field of fieldVals){
                    batchQuery.columns.push(batchQuery.createColumn({
                        fieldId: field,
                    }));
                }
                const sortIndex = fieldVals.indexOf(settings.sortBy);
                batchQuery.sort = [
                    batchQuery.createSort({
                        column: batchQuery.columns[sortIndex > -1 ? sortIndex : 0]
                    })
                ];
                let entityJoin = batchQuery.autoJoin({fieldId:CUSTOMER_ID});
                batchQuery.columns.push(
                    entityJoin.createColumn({
                        fieldId: ENTITYID_FIELD,
                        alias: CUSTOMER_ID
                    })
                );
                if(runtime.isFeatureInEffect('SUBSIDIARIES')){
                    let subsidiaryJoin = batchQuery.autoJoin({fieldId:SUBSIDIARY_ID});
                    batchQuery.columns.push(
                        subsidiaryJoin.createColumn({
                            fieldId: NAME_FIELD,
                            alias: SUBSIDIARY_ID
                        })
                    );
                }
                let employeeJoin = batchQuery.autoJoin({fieldId:OWNER_ID});
                batchQuery.columns.push(
                    employeeJoin.createColumn({
                        fieldId: ENTITYID_FIELD,
                        alias: OWNER_ID
                    })
                );
                let statusJoin = batchQuery.autoJoin({fieldId:STATUS_ID});
                batchQuery.columns.push(
                    statusJoin.createColumn({
                        fieldId: NAME_FIELD,
                        alias: STATUS_ID
                    })
                );
                batchQuery.columns.push(
                    batchQuery.createColumn({
                        fieldId: INTERNALID,
                        alias: GEN_PARAMS_ID
                    })
                );
                batchQuery.condition = batchQuery.createCondition({
                    fieldId: STATUS_ID,
                    operator: query.Operator.ANY_OF,
                    values: settings.statusFilter
                });
                let batchData = [];
                let iterator = new QueryIterator(batchQuery);
                let batch = null;
                while((batch = iterator.next())){
                    batchData.push(batch);
                }
                return batchData;
            }

        }

        return NBatchDAO;
    });
