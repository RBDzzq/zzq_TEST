/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["./JP_BaseDAO", "N/record", 'N/search'],

    (BaseDAO, record, search) => {

        function JP_SchedScriptInstanceDAO(){
                BaseDAO.call(this);
                this.fields = {};
                this.searchId = '';
                this.recordType = record.Type.SCHEDULED_SCRIPT_INSTANCE;
            }

            util.extend(JP_SchedScriptInstanceDAO.prototype, BaseDAO.prototype);

            /**
             * Retrieve the script deployment record given the script deployment id
             *   and checks if the deployment is queued or running.
             *
             * Scheduled Script Status include the following:
             * ================================================
             * Cancelled. This status indicates that due to a NetSuite server error,
             *      the script was cancelled before or during script execution.
             * Complete. This status indicates the script completed normally.
             * Deferred. This status indicates that the script is eligible for processing,
             *      but has not been processed due to processing constraints.
             *      For example, deferred status occurs when one job must wait for another job to finish.
             * Failed. This status indicates that the script has been processed, but failed to complete normally.
             *      If your script has failed, examine it for possible errors.
             * Pending. This status indicates that the script has been submitted and is waiting to be processed.
             * Processing. This status indicates the script is running.
             * Retry. This status indicates that the script entered the processing state,
             *      but failed to complete normally. In this case, the script is eligible to be retried. T
             *      he script will be retried automatically — you do not need to create a new deployment.
             *      Review the script execution log to help you determine why the script initially failed
             *      (for example, a timeout problem occurred).
             *
             * @param scriptId {string} the script deployment id
             * @returns {boolean} true if script is currently running.
             */
            JP_SchedScriptInstanceDAO.prototype.hasQueuedInstance=function(scriptid) {

                let hasInstance = false;
                if(scriptid){
                    let ssInstanceSearch = this.createSearch();

                    ssInstanceSearch.filterExpression = [
                        ['scriptdeployment.scriptid', search.Operator.CONTAINS, scriptid ],
                        'AND',
                        ['status', search.Operator.ANYOF, ['Pending', 'Processing'] ]
                    ];
                    ssInstanceSearch.columns = [
                        {name: 'status'},
                        {name: 'scriptid', join: 'scriptdeployment'}
                    ];

                    let iterator = this.getResultsIterator(ssInstanceSearch);

                    hasInstance = (iterator.getCount() > 0)
                }

                return hasInstance;
            };

        return JP_SchedScriptInstanceDAO;

    });
