/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 *
 * �����Ǘ��ҏW���s��
 *
 */
define(['N/ui/serverWidget', 'N/http', 'N/record', 'N/search', 'N/redirect', 'N/format', 'N/runtime', 'me', 'lib', 'underscore'],
    function (serverWidget, http, record, search, redirect, format, runtime, me, lib, _) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            try {
                if (context.request.method === http.Method.GET) {
                    doGet(context);
                } else {//POST
                    doPost(context);
                }
            } catch (e) {
                log.error({title: e.name, details: e.message});
            }
        }

        function doGet(context) {
            try {
                //Get parameter
                var recordId = context.request.parameters.custscript_custpayment_id;
                var feeParameters = context.request.parameters.fee;
                var consumptionParameters = context.request.parameters.consumption;
                var account = context.request.parameters.account;
                var paramObj = {};
                paramObj.from = context.request.parameters.from;
                paramObj.to = context.request.parameters.to;
                //��v
                paramObj.match = context.request.parameters.match;
                if (paramObj.match == 'true')
                    paramObj.match = true;
                else
                    paramObj.match = false;
                //Get setting values
                var settingValuesObj = getSettingValues(recordId);
                // �t�H�[����`
                var form = serverWidget.createForm({
                    title: '�����[���z����'
                });
                buildForm(form, settingValuesObj);
                //Build sublist
                var invoiceSublist = buildSublist(form);
                fillSublist(invoiceSublist, account, settingValuesObj, paramObj);
                // update status list if save infor exsiting
                updateSublistStatus(form, invoiceSublist, recordId);
                //update �K�p���v�z
                updateApplySumAmount(form, invoiceSublist);
                form.clientScriptModulePath = '../Client/dj_cs_payment_adjustment.js';
                context.response.writePage(form);
            } catch (e) {
                log.error('doGet: ' + e.name, e.message);
            }
        }

        function updateSublistStatus(form, invoiceSublist, paymentId) {
            try {
                var searchSaving = search.lookupFields({
                    type: 'customrecord_dj_custpayment',
                    id: paymentId,
                    columns: ['custrecord_dj_custpayment_saving']
                });
                var saving = searchSaving.custrecord_dj_custpayment_saving;
                if (!me.isEmpty(saving))
                    saving = JSON.parse(saving);
                else
                    return;
                var invoiceList = saving.invoice;
                if (me.isEmpty(invoiceList))
                    return;
                //�萔��
                var fee = form.getField({id: 'fee'});
                fee.defaultValue = saving.feeValue;
                // �v�Z�덷
                var calulator = form.getField({id: 'calculation_error'});
                calulator.defaultValue = saving.calculationValue;
                //sublist line counter
                var numLines = invoiceSublist.lineCount;
                for (var i = 0; i < numLines; i++) {
                    //invoice id
                    var invoiceId = invoiceSublist.getSublistValue({id: 'id', line: i});
                    var invoiceRowObj = _.findWhere(invoiceList, {id: invoiceId});
                    if (!_.isUndefined(invoiceRowObj)) {//found
                        //check
                        invoiceSublist.setSublistValue({id: 'sub_list_check', line: i, value: invoiceRowObj.check});
                        //�K�p�z
                        invoiceSublist.setSublistValue({id: 'sub_list_4', line: i, value: invoiceRowObj.applied});
                        // �����z
                        invoiceSublist.setSublistValue({id: 'sub_list_5', line: i, value: invoiceRowObj.adjustment});
                        //��p����Ȗ�
                        invoiceSublist.setSublistValue({id: 'sub_list_8', line: i, value: invoiceRowObj.account});
                        // �����
                        invoiceSublist.setSublistValue({id: 'sub_list_9', line: i, value: invoiceRowObj.taxco});
                        // ����ŃJ�e�S���[
                        invoiceSublist.setSublistValue({id: 'sub_list_10', line: i, value: invoiceRowObj.taxCaSetting});
                    }
                }

            } catch (e) {
                log.error('updateSublistStatus ' + e.name, e.message);
            }
        }

        function updateApplySumAmount(form, invoiceSublist) {
            try {
                var applySumField = form.getField({id: 'applysumamount'});
                var numLines = invoiceSublist.lineCount;
                var applySumAmount = 0;
                for (var i = 0; i < numLines; i++) {
                    var amount = invoiceSublist.getSublistValue({id: 'sub_list_4', line: i});
                    if (me.isEmpty(amount))
                        amount = 0;
                    else
                        amount = format.parse({value: amount, type: format.Type.INTEGER});
                    applySumAmount += amount;
                }
                applySumAmount = format.format({value: applySumAmount, type: format.Type.INTEGER});
                log.audit('updateApplySumAmount applySumAmount', applySumAmount);
                applySumField.defaultValue = applySumAmount;
            } catch (e) {
                log.error('updateApplySumAmount ' + e.name, e.message);
            }
        }

        function getSettingValues(recordId) {
            try {
                var obj = {};
                log.debug('recordId: ', recordId);
                var fieldLookUp = search.lookupFields({
                    type: 'customrecord_dj_custpayment',
                    id: recordId,
                    columns: [
                        'custrecord_dj_custpayment_client',
                        'custrecord_dj_custpayment_paymentamo',
                        'custrecord_dj_custpayment_paymentdate',
                        'custrecord_dj_custpayment_m_id',
                        'custrecord_dj_custpayment_saving'
                    ]
                });
                obj.id = recordId;
                if (!_.isEmpty(fieldLookUp.custrecord_dj_custpayment_client))
                    obj.customer = fieldLookUp.custrecord_dj_custpayment_client;
                log.debug('obj.customer: ', obj.customer);
                obj.paymentamo = fieldLookUp.custrecord_dj_custpayment_paymentamo;
                obj.paymentdate = fieldLookUp.custrecord_dj_custpayment_paymentdate;
                if (!_.isEmpty(fieldLookUp.custrecord_dj_custpayment_m_id))
                    obj.custpayment_m_id = fieldLookUp.custrecord_dj_custpayment_m_id[0].value;
                obj.saving = fieldLookUp.custrecord_dj_custpayment_saving;
                log.debug('obj.custpayment_m_id: ', obj.custpayment_m_id);

                var fieldLookUpHeader = search.lookupFields({
                    type: 'customrecord_dj_custpayment_management',
                    id: obj.custpayment_m_id,
                    columns: [
                        'custrecord_dj_custpayment_saving_acc',
                        'custrecord_dj_custpayment_saving_taxco',
                        'custrecord_dj_custpayment_saving_taxca'
                    ]
                });
                //��p����Ȗ�
                var acc;
                // �����
                var taxco;
                // ����ŃJ�e�S���[
                var taxCaSetting;
                if (!_.isEmpty(fieldLookUpHeader.custrecord_dj_custpayment_saving_acc))
                    acc = fieldLookUpHeader.custrecord_dj_custpayment_saving_acc[0].value
                if (!_.isEmpty(fieldLookUpHeader.custrecord_dj_custpayment_saving_taxco))
                    taxco = fieldLookUpHeader.custrecord_dj_custpayment_saving_taxco[0].value
                if (!_.isEmpty(fieldLookUpHeader.custrecord_dj_custpayment_saving_taxca))
                    taxCaSetting = fieldLookUpHeader.custrecord_dj_custpayment_saving_taxca[0].value

                var settingList = lib.getSetting();
                if (me.isEmpty(settingList.acc))
                    obj.acc = acc;
                else
                    obj.acc = settingList.acc;

                if (me.isEmpty(settingList.taxco))
                    obj.taxco = taxco
                else
                    obj.taxco = settingList.taxco;

                if (me.isEmpty(settingList.taxca))
                    obj.taxCaSetting = taxCaSetting
                else
                    obj.taxCaSetting = settingList.taxca;

                return obj;
            } catch (e) {
                log.error('getSettingValues: ', e);
                log.error('getSettingValues: ' + e.name, e.message);
                return {};
            }
        }

        function buildForm(form, options) {
            try {
                //submit button
                form.addSubmitButton({
                    label: '�ۑ�'
                });
                //cancel button
                form.addButton({
                    id: 'cancelButton',
                    label: '�L�����Z��',
                    functionName: 'btnReturnButton();'
                });
                //head_id
                var head_id = form.addField({
                    id: 'head_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                head_id.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                head_id.defaultValue = options.custpayment_m_id;
                //payment_id
                var payment_id = form.addField({
                    id: 'payment_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                payment_id.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                payment_id.defaultValue = options.id;
                //�ڋq
                var customerField = form.addField({
                    id: 'customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    label: '�ڋq'
                });

                customerField.defaultValue = options.customer;
                customerField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                //���v
                var total_text = form.addField({
                    id: 'total_text',
                    label: '���v',
                    type: serverWidget.FieldType.TEXT
                });

                if (options.paymentamo)
                    total_text.defaultValue = format.format({
                        value: options.paymentamo,
                        type: format.Type.INTEGER
                    });
                total_text.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                //�K�p���v�z
                var applysumamount = form.addField({
                    id: 'applysumamount',
                    label: '�K�p���v�z',
                    type: serverWidget.FieldType.TEXT
                });
                applysumamount.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.STARTROW
                });
                applysumamount.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                //�K�p�\�z
                var applicable_amount = form.addField({
                    id: 'applicable_amount',
                    label: '�K�p�\�z',
                    type: serverWidget.FieldType.TEXT
                });
                applicable_amount.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.ENDROW
                });
                applicable_amount.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                //�萔��
                var fee = form.addField({
                    id: 'fee',
                    type: serverWidget.FieldType.INTEGER,
                    label: '�萔��'
                });

                var oldfee = form.addField({
                    id: 'oldfee',
                    type: serverWidget.FieldType.INTEGER,
                    label: '�萔��'
                });
                oldfee.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                //�v�Z�덷
                var calculation_error = form.addField({
                    id: 'calculation_error',
                    type: serverWidget.FieldType.INTEGER,
                    label: '�v�Z�덷'
                });
                var oldCalculationError = form.addField({
                    id: 'old_calculation_error',
                    type: serverWidget.FieldType.INTEGER,
                    label: '�萔��'
                });
                oldCalculationError.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                //get info from saving
                if (!me.isEmpty(options.saving)) {
                    var save = JSON.parse(options.saving);
                    if (!me.isEmpty(save.client)) {
                        customerField.defaultValue = save.client;
                    }
                    if (!me.isEmpty(save.feeValue)) {
                        fee.defaultValue = save.feeValue;
                    }
                    if (!me.isEmpty(save.calculationValue)) {
                        calculation_error.defaultValue = save.calculationValue;
                    }
                }
            } catch (e) {
                log.error('buildForm: ' + e.name, e.message);
            }
        }

        function buildSublist(form) {
            try {
                var subtab = form.addSubtab({
                    id: 'custpage_subtab',
                    label: '�������ꗗ'
                });

                var invoiceSubList = form.addSublist({
                    id: 'invoice_sub_list',
                    type: serverWidget.SublistType.LIST,
                    label: '�������ꗗ',
                    tab: 'custpage_subtab'
                });
                /*invoiceSubList.addMarkAllButtons();
                invoiceSubList.addRefreshButton();
                invoiceSubList.helpText = "�����Ώې������Ƀ`�F�b�N�����āA�K�p�z�ɋ��z�����f����܂��B\n" +
                    "�@�@�������̖��������c��������Ƃ��āA�K�p�z�ɋ��z���������͂����B\n";*/

                // �`�F�b�N
                var sub_list_check = invoiceSubList.addField({
                    id: 'sub_list_check',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'ff'
                });
                sub_list_check.label = '';
                invoiceSubList.addField({
                    id: 'sub_list_id',
                    type: serverWidget.FieldType.TEXT,
                    label: '�����ԍ�'
                });
                invoiceSubList.addField({
                    id: 'id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'invoiceID'
                });
                invoiceSubList.addField({
                    id: 'sub_list_1',
                    type: serverWidget.FieldType.DATE,
                    label: '����'
                });
                invoiceSubList.addField({
                    id: 'entity',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    label: '����Ȗ�'
                });
                invoiceSubList.addField({
                    id: 'sub_list_2',
                    type: serverWidget.FieldType.TEXT,
                    label: '����'
                });
                invoiceSubList.addField({
                    id: 'sub_list_3',
                    type: serverWidget.FieldType.CURRENCY,
                    label: '�����z'
                });
                invoiceSubList.addField({
                    id: 'sub_list_4',
                    type: serverWidget.FieldType.INTEGER,
                    label: '�K�p�z'
                }).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});
                invoiceSubList.addField({
                    id: 'sub_list_5',
                    type: serverWidget.FieldType.INTEGER,
                    label: '�����z'
                }).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});

                /*var sub_list_6 = invoiceSubList.addField({
                    id: 'sub_list_6',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'ff '
                });
                sub_list_6.label = '';*/
                /*invoiceSubList.addField({
                    id: 'sub_list_7',
                    type: serverWidget.FieldType.CURRENCY,
                    label: '���K�p'
                });*///.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});
                invoiceSubList.addField({
                    id: 'sub_list_8',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    label: '��p����Ȗ�'
                });
                var tax_code = invoiceSubList.addField({
                    id: 'sub_list_9',
                    type: serverWidget.FieldType.SELECT,
                    //source: 'salestaxitem',
                    label: '�����'
                });
                var listTaxCode = lib.getTaxCode();
                util.each(listTaxCode, function (taxcode) {
                    tax_code.addSelectOption({
                        value: taxcode.id,
                        text: taxcode.text
                    });
                })
                invoiceSubList.addField({
                    id: 'sub_list_10',
                    type: serverWidget.FieldType.SELECT,
                    label: '����ŃJ�e�S��',
                    source: 'customrecord_4572_tax_category',
                });
                return invoiceSubList;
            } catch (e) {
                log.error('buildSublist: ' + e.name, e.message);
                return {};
            }
        }

        function fillSublist(invoiceSubList, account, settingValues, params) {
            try {
                log.audit('fillSubList account', account);
                log.audit('fillSubList settingValue', settingValues);
                log.audit('fillSubList dateImport', params);
                var invoiceList = lib.doGetInvDetail(settingValues.customer, account, params);
                util.each(invoiceList, function (invoice, i) {
                    addSublistRow(invoiceSubList, invoice, settingValues, params, i);
                });
            } catch (e) {
                log.error('fillSublist: ' + e.name, e.message);
            }
        }

        function addSublistRow(invoiceSubList, invoice, settingValues, params, i) {
            try {
                //�`�F�b�N
                if (params.match) {
                    invoiceSubList.setSublistValue({
                        id: 'sub_list_check',
                        line: i,
                        value: 'T'
                    });
                } else {
                    invoiceSubList.setSublistValue({
                        id: 'sub_list_check',
                        line: i,
                        value: 'F'
                    });
                }
                //�����ԍ�
                invoiceSubList.setSublistValue({
                    id: 'sub_list_id',
                    line: i,
                    value: invoice.tranid
                });
                //invoiceID
                invoiceSubList.setSublistValue({
                    id: 'id',
                    line: i,
                    value: invoice.id
                });
                //����
                if (!me.isEmpty(invoice.duedate)) {
                    invoiceSubList.setSublistValue({
                        id: 'sub_list_1',
                        line: i,
                        value: invoice.duedate
                    });
                }
                //����Ȗ�
                invoiceSubList.setSublistValue({
                    id: 'entity',
                    line: i,
                    value: invoice.account
                });
                //����
                if (!me.isEmpty(invoice.department)) {
                    invoiceSubList.setSublistValue({
                        id: 'sub_list_2',
                        line: i,
                        value: invoice.department
                    });
                }
                //�����z
                invoiceSubList.setSublistValue({
                    id: 'sub_list_3',
                    line: i,
                    // value: invoice.amount
                    value: invoice.amountremaining
                });
                //�K�p�z
                if (params.match && !me.isEmpty(invoice.amountremaining))
                    invoiceSubList.setSublistValue({
                        id: 'sub_list_4',
                        line: i,
                        value: invoice.amountremaining
                    });
                //�����z
                /*invoiceSubList.setSublistValue({
                    id: 'sub_list_5',
                    line: i,
                    value: options.sub_list_5
                });*/
                //check 2
                /*invoiceSubList.setSublistValue({
                    id: 'sub_list_6',
                    line: i,
                    value: 'F'
                });*/
                //���K�p
                /*invoiceSubList.setSublistValue({
                    id: 'sub_list_7',
                    line: i,
                    value: invoice.amount //format.parse({value: invoice.amount, type: format.Type.INTEGER})
                });*/
                //��p����Ȗ�
                invoiceSubList.setSublistValue({
                    id: 'sub_list_8',
                    line: i,
                    value: settingValues.acc
                });
                //�����
                invoiceSubList.setSublistValue({
                    id: 'sub_list_9',
                    line: i,
                    value: settingValues.taxco
                });
                //����ŃJ�e�S��
                invoiceSubList.setSublistValue({
                    id: 'sub_list_10',
                    line: i,
                    value: settingValues.taxCaSetting
                });
            }
            catch
                (e) {
                log.error('addSublistRow: ' + e.name, e.message);
            }
        }

        function doPost(context) {
            try {
                var serverRequest = context.request;
                var lines = serverRequest.getLineCount({group: "invoice_sub_list"});
                var listSelectedInvoice = [];
                for (var i = 0; i < lines; i++) {
                    //invoice id
                    var id = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'id',
                        line: i
                    });
                    //check
                    var check = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_check',
                        line: i
                    });
                    // ����Ȗ�
                    var entity = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'entity',
                        line: i
                    });
                    //�K�p�z
                    var applied = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_4',
                        line: i
                    });
                    // �����z
                    var adjustment = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_5',
                        line: i
                    });
                    /*var check_2 = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_6',
                        line: i
                    });*/
                    // ��p����Ȗ�
                    var account = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_8',
                        line: i
                    });
                    // �����
                    var taxco = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_9',
                        line: i
                    });
                    // ����ŃJ�e�S��
                    var taxCaSetting = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_10',
                        line: i
                    });
                    // store json of row
                    var jsonSave = {
                        "id": id,
                        "check": check,
                        "entity": entity,
                        "applied": applied,
                        "adjustment": adjustment,
                        // "check_2": check_2,
                        "account": account,
                        "taxco": taxco,
                        "taxCaSetting": taxCaSetting
                    };
                    listSelectedInvoice.push(jsonSave);
                }

                var payment_id = serverRequest.parameters.payment_id;
                var fee = serverRequest.parameters.fee;
                var calculation_error = serverRequest.parameters.calculation_error;
                //var over_payment = serverRequest.parameters.over_payment;
                /*var objRecord = record.load({
                    type: 'customrecord_dj_custpayment',
                    id: payment_id
                });
                var saving = objRecord.getValue({
                    fieldId: 'custrecord_dj_custpayment_saving'
                });*/
                var searchSaving = search.lookupFields({
                    type: 'customrecord_dj_custpayment',
                    id: payment_id,
                    columns: ['custrecord_dj_custpayment_saving']
                });
                var saving = searchSaving.custrecord_dj_custpayment_saving;

                if (listSelectedInvoice.length != 0) {
                    if (!me.isEmpty(saving)) {
                        saving = JSON.parse(saving);
                        saving.invoice = listSelectedInvoice;
                    } else
                        saving = {"invoice": listSelectedInvoice};
                }
                saving.feeValue = fee;
                saving.calculationValue = calculation_error;
                var customer = serverRequest.parameters.customer;

                record.submitFields({
                    type: 'customrecord_dj_custpayment',
                    id: payment_id,
                    values: {
                        custrecord_dj_custpayment_client: customer,
                        //custrecord_dj_custpayment_paymentdate: paymetdate,
                        custrecord_dj_custpayment_saving: JSON.stringify(saving)
                    }
                });

                // ���v������Ǘ��[�u�����z�v�ɃZ�b�g
                var paymentamo = serverRequest.parameters.total_text;
                paymentamo = getInt(paymentamo);
                setPaymentAmount(payment_id, paymentamo);

                var head_id = serverRequest.parameters.head_id;
                redirect.toSuitelet({
                    scriptId: 'customscript_dj_sl_payment_management',
                    deploymentId: 'customdeploy_dj_sl_payment_management',
                    parameters: {
                        'custscript_custpayment_head_id': head_id
                    }
                });
            } catch (e) {
                log.error('doPost ' + e.name, e.message);
            }
        }

        function getInvoiceList() {
            var objList = [];
            var mysearch = search.load({
                id: 'customsearch_custpayment_invoice_detail'
            });
            var resultSet = mysearch.run().getRange({start: 0, end: 1000});
            util.each(resultSet, function (result) {
                var obj = {};
                obj.id = result.id;
                obj.invoiceCustomer = result.getValue(result.columns[0]);
                obj.tranid = result.getValue(result.columns[2]);
                obj.duedate = result.getValue(result.columns[7]);
                obj.amount = result.getValue(result.columns[3]);
                obj.amountremaining = result.getValue(result.columns[4]);
                obj.department = result.getText(result.columns[6]);
                obj.entity = result.getValue(result.columns[8]);
                objList.push(obj);
            });
            return objList;
        }

        function getNowDateJP() {
            var stNow = new Date();
            stNow.setMilliseconds((3600000 * 9));
            var stYear = stNow.getUTCFullYear();
            var stMonth = stNow.getUTCMonth();
            var stDate = stNow.getUTCDate();
            stNow = new Date(stYear, stMonth, stDate);
            return stNow;
        }

        function isEmpty(stValue) {
            if ((stValue == null) || (stValue == '') || (stValue == undefined)) {
                return true;
            } else {
                return false;
            }
        }

        /**
         *���v������Ǘ��[�u�����z�v�ɃZ�b�g
         * @param paymentListDetailId
         * @param payment_summary
         */
        function setPaymentAmount(paymentListDetailId, payment_summary) {
            var id = record.submitFields({
                type: 'customrecord_dj_custpayment',
                id: paymentListDetailId,
                values: {
                    custrecord_dj_custpayment_paymentamo: payment_summary
                }
            });
        }

        /**
         * 123,456,789 -> 123456789
         * @param stringNumber
         * @returns {number | *}
         */
        function getInt(stringNumber) {
            stringNumber = stringNumber.split(",");
            var stringtotal = '';
            stringNumber.forEach(function (item, index) {
                stringtotal = stringtotal + item;
            });
            stringNumber = parseInt(stringtotal);
            return stringNumber;
        }

        function getTaxCode() {
            var mysearch = search.create({
                type: 'taxgroup',
                columns: [{
                    name: 'itemid'
                }]
            });
            var resultSet = mysearch.run();
            var results = resultSet.getRange({
                start: 0,
                end: 1000
            });
            return (results);
        }

        return {
            onRequest: onRequest
        };
    })
;