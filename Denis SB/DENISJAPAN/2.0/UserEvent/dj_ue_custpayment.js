/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 * �����Ǘ��[�̉�ʃ��[�h�̏���
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
                    //�X�e�[�^�X�Ɋ֌W�Ȃ��u�X�V�{�^����\������v
                    var form = scriptContext.form;
                    form.clientScriptModulePath = '../Client/dj_cs_payment_management.js';
                    form.addButton({
                        id: 'custpage_refresh',
                        label: '�X�V',
                        functionName: "btnUpdateButton();"
                    });

                    var currentRecord = scriptContext.newRecord;
                    var form = scriptContext.form;
                    var status = currentRecord.getValue('custrecord_dj_custpayment_status');
                    log.debug('status: ',status);
                    if (status === '1') {
                        form.addButton({
                            id: 'custpage_execute',
                            label: '���s',
                            functionName: 'btnExecuteButton(' + currentRecord.id + ');'
                        });
                    }

                    if (status === '4' || status === '7') {
                        form.addButton({
                            id: 'custpage_execute',
                            label: '�Ď��s',
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
                        label: '������������',
                        type: serverWidget.FieldType.INTEGER
                    });
                    completedField.defaultValue = completedCount;
                    var uncompletedField = form.addField({
                        id: 'custpage_custpayment_uncompleted',
                        label: '����������',
                        type: serverWidget.FieldType.INTEGER
                    });
                    uncompletedField.defaultValue = numLines - completedCount;
                }
                if (scriptContext.type === scriptContext.UserEventType.EDIT) {
                    var currentRecord = scriptContext.newRecord;
                    /**
                     * //�y�X�e�[�^�X�ω��z
                     * 1.�����f�[�^�捞��
                     ���J�n��ԁB�����Ǘ��[�Ɉړ��\�B
                     2.�����������s��
                     ���u���s�v�{�^���������B�����Ǘ��[�Ɉړ��s�\�B
                     3.������������
                     ���d��A�����[�����������B�����Ǘ��[�Ɉړ��s�\�B
                     4.���������G���[
                     ���d�󐶐��y�ѓ����[�������s���B�����Ǘ��[�Ɉړ��\�B
                     5.�Ď��s��
                     ���Ď��s���B�����Ǘ��[�Ɉړ��s�\�B
                     6.��������
                     �����������B�����Ǘ��[�Ɉړ��s�\�B
                     7.�ꕔ��������
                     ���ꕔ�d�󐶐��y�ѓ����[�����������B�����Ǘ��[�Ɉړ��\�B
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
