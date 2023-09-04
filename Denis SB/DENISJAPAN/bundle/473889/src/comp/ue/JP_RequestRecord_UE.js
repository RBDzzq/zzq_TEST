/**
 *    Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([
    'N/record',
    'N/runtime',
    'N/task',
    '../../app/JP_PostGenerationNotifier',
    '../../app/JP_ErrorNotifier',
    '../../datastore/JP_ListStore',
    '../../datastore/JP_Scripts',
    '../../data/JP_InvoiceSummaryRequestDAO',
    ],
 (record,
          runtime,
          task,
          successNotifier,
          ErrorNotifier,
          ListStore,
          JP_Scripts,
          RecordRequestDAO)=> {

        function afterSubmit(context) {

            if(context.type !== context.UserEventType.DELETE){
                let newRecord = context.newRecord;
                let oldRecord = context.oldRecord;
                let batchStatus = new ListStore().BATCH_STATUS;
                let reqRecDao = new RecordRequestDAO();
                let currentStatus = newRecord.getValue({fieldId: reqRecDao.fields.status});
                currentStatus = (currentStatus) ? parseInt(currentStatus) : '';
                let owner = context.type === context.UserEventType.CREATE ?
                    runtime.getCurrentUser().id : newRecord.getValue({fieldId: 'owner'})
                    || oldRecord.getValue({fieldId: 'owner'});
                let isOW = runtime.isFeatureInEffect('SUBSIDIARIES');

                switch (currentStatus) {
                    case batchStatus.PROCESSED:
                        let postProcessNotifier = new successNotifier();
                        reqRecDao.getBatchesForEmail(newRecord.id);
                        postProcessNotifier.notifyCreator(owner, reqRecDao.fileAttributes);
                        break;

                    case batchStatus.ERROR:
                        let errorData =
                            (newRecord && newRecord.getValue({fieldId: reqRecDao.fields.errorDetail}))
                            || (oldRecord && oldRecord.getValue({fieldId: reqRecDao.fields.errorDetail}))
                            || "";
                        log.error('ERROR STATUS', JSON.stringify(errorData));
                        let errArray = errorData.split(':');
                        let err = {
                            name : (errArray[0]) ? errArray[0] : '',
                            details : (errArray[2]) ? errArray[2] : '',
                            nsCode : (errArray[1]) ? errArray[1] : '',
                        };

                        //for newly created request all values would be null so we get the
                        //fields values from the oldRecord otherwise always use the newRecord.
                        let currentRecord = (context.type === context.UserEventType.CREATE) ? newRecord : oldRecord;

                        reqRecDao.getGenerationStat(newRecord.id,
                            isOW ? currentRecord.getValue({fieldId: reqRecDao.fields.subsidiary}) : "");
                        new ErrorNotifier().notifyCreator(currentRecord, err, owner, reqRecDao.generationStat);
                        break;
                }
            }
        }

        return {
            afterSubmit: afterSubmit
        };
    });
