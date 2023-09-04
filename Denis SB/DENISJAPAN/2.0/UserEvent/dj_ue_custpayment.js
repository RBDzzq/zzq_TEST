/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 * 入金管理票の画面ロードの処理
 *
 *
 */
define(['N/ui/serverWidget', 'N/url', 'N/runtime', 'N/record', 'N/redirect', 'N/search', 'N/task', 'underscore'],

    function (serverWidget, url, runtime, record, redirect, search, task, _) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {
            log.debug('beforeLoad scriptContext.type',scriptContext.type)
            try {
                if (scriptContext.type === scriptContext.UserEventType.VIEW) {
                    //ステータスに関係なく「更新ボタンを表示する」
                    var form = scriptContext.form;
                    form.clientScriptModulePath = '../Client/dj_cs_payment_management.js';
                    form.addButton({
                        id: 'custpage_refresh',
                        label: '更新',
                        functionName: "btnUpdateButton();"
                    });

                    var currentRecord = scriptContext.newRecord;
                    var form = scriptContext.form;
                    var status = currentRecord.getValue('custrecord_dj_custpayment_status');
                    log.debug('status: ',status);
                    if (status === '1') {
                        form.addButton({
                            id: 'custpage_execute',
                            label: '実行',
                            functionName: 'btnExecuteButton(' + currentRecord.id + ');'
                        });
                    }

                    if (status === '4' || status === '7') {
                        form.addButton({
                            id: 'custpage_execute',
                            label: '再実行',
                            functionName: 'btnExecuteButton(' + currentRecord.id + ');'
                        });
                    }

                    var custPaymentManagementRecord = record.load({
                        type: currentRecord.type,
                        id: currentRecord.id,
                        isDynamic: true
                    });

                    var numLines = custPaymentManagementRecord.getLineCount({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id'
                    });

                    log.debug('numLines',numLines)
                    var completedCount = 0;
                    for (var i=0;i<numLines;i++) {
                        var errorFlag = custPaymentManagementRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_error_flag',
                            line: i
                        });
                        if (errorFlag) {
                            completedCount++;
                        }
                    }
                    log.debug('completedCount',completedCount)

                    var completedField = form.addField({
                        id: 'custpage_custpayment_completed',
                        label: '処理完了件数',
                        type: serverWidget.FieldType.INTEGER
                    });
                    completedField.defaultValue = completedCount;
                    var uncompletedField = form.addField({
                        id: 'custpage_custpayment_uncompleted',
                        label: '未処理件数',
                        type: serverWidget.FieldType.INTEGER
                    });
                    uncompletedField.defaultValue = numLines - completedCount;
                }
                if (scriptContext.type === scriptContext.UserEventType.EDIT) {
                    var currentRecord = scriptContext.newRecord;
                    /**
                     * //【ステータス変化】
                     * 1.入金データ取込済
                     →開始状態。入金管理票に移動可能。
                     2.自動消込実行中
                     →「実行」ボタン押下時。入金管理票に移動不可能。
                     3.自動消込完了
                     →仕訳、入金票生成完了時。入金管理票に移動不可能。
                     4.自動消込エラー
                     →仕訳生成及び入金票生成失敗時。入金管理票に移動可能。
                     5.再実行中
                     →再実行中。入金管理票に移動不可能。
                     6.強制完了
                     →強制完了。入金管理票に移動不可能。
                     7.一部消込完了
                     →一部仕訳生成及び入金票生成完了時。入金管理票に移動可能。
                     */
                    var status = currentRecord.getValue('custrecord_dj_custpayment_status');
                    if (status === '1' || status === '4' || status === '7' ) {
                        //lookup to get From To
                        var searchRec = search.lookupFields({
                            type: 'customrecord_dj_custpayment_management',
                            id: currentRecord.id,
                            columns: [
                                'custrecord_dj_custpayment_date_from',
                                'custrecord_dj_custpayment_date_to'
                            ]
                        });
                        var fromDate = searchRec.custrecord_dj_custpayment_date_from;
                        var toDate = searchRec.custrecord_dj_custpayment_date_to;
                        redirect.toSuitelet({
                            scriptId: 'customscript_dj_sl_payment_management',
                            deploymentId: 'customdeploy_dj_sl_payment_management',
                            parameters: {
                                'custscript_custpayment_head_id': currentRecord.id,
                                'custscript_import_date_from': fromDate,
                                'custscript_import_date_to': toDate
                            }
                        });
                    }
                    if (status === '2' || status === '3') {
                        redirect.toRecord({
                            type: 'customrecord_dj_custpayment_management',
                            id: currentRecord.id
                        });
                    }
                    log.debug('Record: ' + currentRecord.id);
                }
            } catch (e) {
                log.error('UE: ' + e.name);
            }
        }

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

        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {
            try {
                var currentRecord = scriptContext.newRecord;
                var status = currentRecord.getValue('custrecord_dj_custpayment_status');
                var res = record.load({
                    type: currentRecord.type,
                    id: currentRecord.id
                })
                var subsidiary = res.getValue('custrecord_dj_custpayment_subsidiary');

                log.audit({
                    title: 'afterSubmit audit',
                    details: status
                });
                log.debug('subsidiary',subsidiary);
                if (status === '1' || status === '4') {
                }
                if (status === '2' || status === '5') {
                    var scriptTask = task.create({taskType: task.TaskType.MAP_REDUCE});
                    scriptTask.scriptId = 'customscript_dj_mr_create_journal_custp';
                    scriptTask.deploymentId = 'customdeploy_dj_mr_create_journal_custp';
                    scriptTask.params = {custscript_custpay_head_id: currentRecord.id, custscript_subsidiary : subsidiary};
                    log.debug('scriptTask',scriptTask);
                    log.debug('scriptTask.params',scriptTask.params);
                    var scriptTaskId = scriptTask.submit();
                }


            } catch (e) {
                log.error('UE afterSubmit :' + e);
            }
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });
