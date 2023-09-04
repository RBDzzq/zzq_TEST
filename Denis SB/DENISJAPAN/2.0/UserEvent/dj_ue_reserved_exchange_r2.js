/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 * 請求書 輸入用社内レートの最新レート
 *
 *
 */
define(['N/ui/serverWidget', 'N/url', 'N/runtime', 'N/record', 'N/redirect', 'N/search', 'N/task', 'N/action', 'underscore'],

    function (serverWidget, url, runtime, record, redirect, search, task, action, _) {




        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {

            var newRecord = scriptContext.newRecord;

            // DJ_予約為替レート_選択
            var rateFlg = newRecord.getValue({
                fieldId:'custbody_dj_reserved_exchange_rate_flg'
            });

            if (!rateFlg) {
                return;
            }

            var rateId1;
            var recType = newRecord.type;
            log.debug('recType', recType);

            // DJ_予約為替レート_販売
            rateId1 = newRecord.getValue({
                fieldId:'custbody_dj_reserved_exchange_rate_s1'
            });

            log.debug('rateId1',rateId1)
            if (!rateId1) {
                var entity;
                var filters = [];
                filters.push(['custrecord_djkk_reservation_rate_type','is','1'])

                entity = newRecord.getValue({
                    fieldId: 'entity'
                });
                log.debug('entity', entity);
                filters.push('AND')
                filters.push(['custrecord_djkk_rer_customer','anyof',entity])
                filters.push('AND')
                filters.push(['custrecord_djkk_reservation_rate_categ','is','2'])



                var s = search.create({
                    type: 'customrecord_djkk_reserved_exchange_rate',
                    columns: [search.createColumn({
                        name : 'custrecord_djkk_reserved_exchange_rate'
                    }), search.createColumn({
                        name : 'custrecord_djkk_date',
                        sort : search.Sort.DESC
                    })],
                    filters: filters
                });


                var resultSet = s.run();

                var results = resultSet.getRange({
                    start : 0,
                    end : 1
                });

                log.debug('results',results)
                if (results && results.length > 0) {

                    var rate = results[0].id;

                    if (rate){

                        newRecord.setValue({
                            fieldId: 'custbody_dj_reserved_exchange_rate_s1',
                            value : rate
                        });
                    }
                }
            }
        }



        return {
            beforeSubmit: beforeSubmit
        };

    });
