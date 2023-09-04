/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 * �����Ǘ��[��ʁA�����w�b�_�[�ɕۑ�
 *
 *
 */
define(['N/ui/serverWidget', 'N/http', 'N/record', 'N/search', 'N/redirect', 'N/format', 'N/runtime', 'N/url', 'N/task', 'underscore', 'me', 'lib', 'moment'],

    function (serverWidget, http, record, search, redirect, format, runtime, url, task, _, me, lib, moment) {

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
                var recordId = context.request.parameters.custscript_custpayment_head_id;
                var dateImport = {};
                dateImport.from = context.request.parameters.custscript_import_date_from;
                dateImport.to = context.request.parameters.custscript_import_date_to;

                if (context.request.method === http.Method.GET) {
                    doGet(context, recordId, dateImport);
                } else {
                    doPost(context);
                }

            } catch (e) {
                log.error({
                    title: e.name,
                    details: e.message
                });
            }
        }

        function doGetSettingValues(objRecord) {
            try {
                var result = {};
                result.importDate = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_importdate'});
                /*importDate = format.format({
                    value: importDate,
                    type: format.Type.DATE
                });*/
                result.importPerson = objRecord.getText({fieldId: 'custrecord_dj_custpayment_importperson'});
                result.fromCSVDate = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_date_from_csv'});
                result.fromDate = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_date_from'});
                result.toDate = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_date_to'});
                result.amountSum = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_amountsum'});
                result.amountSumString = format.format({value: result.amountSum, type: format.Type.INTEGER});
                result.importNumber = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_importnumber'});
                result.importNumber = format.format({value: result.importNumber, type: format.Type.INTEGER});
                result.status = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_status'});
                result.name = objRecord.getValue({fieldId: 'name'});
                result.saveAcc = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_acc'});
                result.saveTaxCo = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_taxco'});
                result.saveTaxCa = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_taxca'});
                result.saveError = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_error'});
                result.savePlus = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_plus'});
                result.saveMinus = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_saving_minus'});
                result.saveTaxCoError = objRecord.getValue({fieldId: 'custrecord_dj_custpaym_saving_taxco_e'});
                result.saveTaxCaError = objRecord.getValue({fieldId: 'custrecord_dj_custpaym_saving_taxca_e'});
                result.subsidiary = objRecord.getValue({fieldId: 'custrecord_dj_custpayment_subsidiary'});
                var objSetting = getSetting();
                if (me.isEmpty(result.saveAcc)) {
                    result.saveAcc = objSetting.acc;
                }
                if (me.isEmpty(result.saveTaxCo)) {
                    result.saveTaxCo = objSetting.taxco;
                }
                if (me.isEmpty(result.saveTaxCa)) {
                    result.saveTaxCa = objSetting.taxca;
                }
                if (me.isEmpty(result.saveError)) {
                    result.saveError = objSetting.error;
                }
                if (me.isEmpty(result.savePlus)) {
                    result.savePlus = objSetting.plus;
                }
                if (me.isEmpty(result.saveMinus)) {
                    result.saveMinus = objSetting.minus;
                }
                if (me.isEmpty(result.saveTaxCoError)) {
                    result.saveTaxCoError = objSetting.taxco_e;
                }
                if (me.isEmpty(result.saveTaxCaError)) {
                    result.saveTaxCaError = objSetting.taxca_e;
                }
                return result;
            } catch (e) {
                log.error('doGetSettingValues: ' + e.name, e.message);
                return {};
            }
        }

        function doAddSublistRow(paymentSublist, option, i) {
            try {
                log.audit("doAddSublistRow option",option)
                //id
                paymentSublist.setSublistValue({
                    id: 'custpage_id',
                    line: i,
                    value: option.id
                });
                // if (!me.isEmpty(option.feeid))
                //     paymentSublist.setSublistValue({
                //         id: 'custpage_feeid',
                //         line: i,
                //         value: option.feeid
                //     });
                log.debug("doAddSublistRow option.batchflg",option.batchflg);
                //�I��
                paymentSublist.setSublistValue({
                    id: 'custpage_sub_list_check',
                    line: i,
                    value: option.sub_list_check
                });
                // �o�b�`���s�����X�e�[�^�X
                if (option.batchflg) {
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_batchflg',
                        line: i,
                        value: 'T'
                    });
                } else {
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_batchflg',
                        line: i,
                        value: 'F'
                    });
                }
                //�����ԍ�
                paymentSublist.setSublistValue({
                    id: 'custpage_sub_list_id',
                    line: i,
                    value: option.sub_list_id
                });
                // ��������
                if (!me.isEmpty(option.depositacc))
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_depositacc',
                        line: i,
                        value: option.depositacc
                    });
                //���Ӑ�No
                if (!me.isEmpty(option.sub_list_2))
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_2',
                        line: i,
                        value: option.sub_list_2
                    });
                //�ڋq
                if (!me.isEmpty(option.sub_list_3))
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_3',
                        line: i,
                        value: option.sub_list_3
                    });
                //������
                if (!me.isEmpty(option.sub_list_4))
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_4',
                        line: i,
                        value: option.sub_list_4
                    });
                //��s
                if (!me.isEmpty(option.sub_list_5))
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_5',
                        line: i,
                        value: option.sub_list_5
                    });
                //�x�X
                if (!me.isEmpty(option.sub_list_6))
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_6',
                        line: i,
                        value: option.sub_list_6
                    });
                //�˗��l
                if (!me.isEmpty(option.sub_list_7))
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_7',
                        line: i,
                        value: option.sub_list_7
                    });
                //�����z
                if (!me.isEmpty(option.sub_list_8)) {
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_8',
                        line: i,
                        value: format.parse({value: option.sub_list_8, type: format.Type.INTEGER})
                    });
                }
                //�����v
                if (!me.isEmpty(option.sub_list_9)) {
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_9',
                        line: i,
                        value: format.parse({value: option.sub_list_9, type: format.Type.INTEGER})
                    });
                }
                //��v
                paymentSublist.setSublistValue({
                    id: 'custpage_sub_list_10',
                    line: i,
                    value: option.sub_list_10
                });
                //�����
                paymentSublist.setSublistValue({
                    id: 'custpage_sub_list_11',
                    line: i,
                    value: option.sub_list_11
                });
                //�萔��
                paymentSublist.setSublistValue({
                    id: 'custpage_sub_list_12',
                    line: i,
                    value: option.sub_list_12
                });

                //���v�K�p�z
                paymentSublist.setSublistValue({
                    id: 'custpage_sub_list_14',
                    line: i,
                    value: format.parse({value: option.sub_list_8, type: format.Type.INTEGER})
                });

                if (!me.isEmpty(option.saving)) {
                    var saving = JSON.parse(option.saving);
                    if (!me.isEmpty(saving.totalAppliedAmount)) {
                        //���v�K�p�z
                        paymentSublist.setSublistValue({
                            id: 'custpage_sub_list_14',
                            line: i,
                            value: parseInt(saving.totalAppliedAmount, 10)
                        });
                    } else {
                        paymentSublist.setSublistValue({
                            id: 'custpage_sub_list_14',
                            line: i,
                            value: format.parse({value: option.sub_list_8, type: format.Type.INTEGER})
                        });
                    }
                    if (!me.isEmpty(saving.totalAdjustmentAmount)) {
                        //���v�����z
                        paymentSublist.setSublistValue({
                            id: 'custpage_sub_list_15',
                            line: i,
                            value: parseInt(saving.totalAdjustmentAmount,10)
                        });
                    }
                }
                if (!me.isEmpty(option.saving3) || !me.isEmpty(option.saving4)) {

                    var savingAmount = 0;

                    if (!me.isEmpty(option.saving3)){
                        var saving3 = JSON.parse(option.saving3);
                        savingAmount += parseInt(saving3.amount,10);
                    }

                    if (!me.isEmpty(option.saving4)){
                        var saving4 = JSON.parse(option.saving4);
                        savingAmount += parseInt(saving4.amount,10);
                    }

                    //���v�����z
                    paymentSublist.setSublistValue({
                        id: 'custpage_sub_list_15',
                        line: i,
                        value: savingAmount
                    });
                }

            } catch (e) {
                log.error('doAddSublistRow: ' + e.name, e.message);
            }
        }

        function bindingHeader(form, recordId, objSetting, dateImport) {
            try {
                form.addSubmitButton({
                    label: '�ۑ�'
                });
                form.addButton({
                    id: 'cancelButton',
                    label: '�L�����Z��',
                    functionName: 'btnClearButton(' + recordId + ');'
                });

                form.addButton({
                    id: 'updateButton',
                    label: '����',
                    functionName: 'btnSearchButton(' + recordId + ');'
                });

                //id
                var head_id = form.addField({
                    id: 'custpage_head_id',
                    label: 'id : ',
                    type: serverWidget.FieldType.TEXT
                });
                head_id.defaultValue = recordId;
                head_id.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var subsidiary = form.addField({
                    id: 'custpage_custom_subsidiary',
                    label: 'subsidiary : ',
                    type: serverWidget.FieldType.SELECT,
                    source : 'subsidiary'
                });
                subsidiary.defaultValue = objSetting.subsidiary;
                subsidiary.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var subsidiaryField = form.addField({
                    id: 'custpage_custom_subsidiary_text',
                    label: 'SubsidiaryText : ',
                    type: serverWidget.FieldType.TEXT
                });
                subsidiaryField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                subsidiaryField.defaultValue = lib.getSubsidiaryText(objSetting.subsidiary);

                //�捞��
                var textNowDate = form.addField({
                    id: 'custpage_textdate',
                    label: '�捞��',
                    type: serverWidget.FieldType.DATE
                });
                textNowDate.defaultValue = objSetting.importDate;
                textNowDate.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                //CSV�̓�����
                var dateFromCSV = form.addField({
                    id: 'custpage_import_date_from_csv',
                    label: 'CSV�̓�����',
                    type: serverWidget.FieldType.DATE
                });
                dateFromCSV.defaultValue = objSetting.fromCSVDate;
                dateFromCSV.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });


                //�������̊���
                var dateFrom = form.addField({
                    id: 'custpage_import_date_from',
                    label: '�������̊���(FROM)',
                    type: serverWidget.FieldType.DATE
                });
                if (!me.isEmpty(dateImport.from)) {

                    dateFrom.defaultValue = dateImport.from;
                } else {
                    dateFrom.defaultValue = objSetting.fromDate;
                }
                dateFrom.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.STARTROW
                });
                var dateTo = form.addField({
                    id: 'custpage_import_date_to',
                    label: 'TO',
                    type: serverWidget.FieldType.DATE
                });
                if (!me.isEmpty(dateImport.to)) {

                    dateTo.defaultValue = dateImport.to;
                } else {
                    dateTo.defaultValue = objSetting.toDate;
                }
                dateTo.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.ENDROW
                });

                //�X�e�[�^�X
                var textStatus = form.addField({
                    id: 'custpage_textstatus',
                    label: '�X�e�[�^�X',
                    type: serverWidget.FieldType.TEXT
                });
                var fieldLookUp = search.lookupFields({
                    type: 'customlist_dj_custpayment_status_list',
                    id: objSetting.status,
                    columns: ['name']
                });
                textStatus.defaultValue = fieldLookUp.name;
                textStatus.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                //�捞�S����
                var textUser = form.addField({
                    id: 'custpage_textuser',
                    label: '�捞�S����',
                    type: serverWidget.FieldType.TEXT
                });
                textUser.defaultValue = objSetting.importPerson;
                textUser.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                var textNumber = form.addField({
                    id: 'custpage_textnumber',
                    label: '�捞����',
                    type: serverWidget.FieldType.TEXT
                });
                textNumber.defaultValue = objSetting.importNumber;
                textNumber.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                //���v���z

                var textTotal = form.addField({
                    id: 'custpage_texttotal',
                    label: '���v���z',
                    type: serverWidget.FieldType.TEXT
                });
                textTotal.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                textTotal.defaultValue = objSetting.amountSumString;
            } catch (e) {
                log.error('bindingHeader: ' + e.name, e.message);
            }
        }

        function bindingSubTabError(form, options) {
            try {
                //�덷�Ή�
                var errorSubtab = form.addSubtab({
                    id: 'error_subtab',
                    label: '�덷�Ή�',
                    tab: 'tabid'
                });

                var error_difference_label = form.addField({
                    id: 'custpage_error_difference_label',
                    label: '�덷�F�����z',
                    type: serverWidget.FieldType.TEXT,
                    container: 'error_subtab'
                });
                error_difference_label.defaultValue = '�덷�F�����z&nbsp;&nbsp;';
                error_difference_label.label = '';
                error_difference_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                error_difference_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                error_difference_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });

                var error_difference = form.addField({
                    id: 'custpage_error_difference',
                    label: 'error_difference',
                    type: serverWidget.FieldType.INTEGER,
                    container: 'error_subtab'
                });
                error_difference.label = '';
                error_difference.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                });
                error_difference.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                error_difference.defaultValue = options.saveError;

                var plus_error_label = form.addField({
                    id: 'custpage_plus_error_label',
                    label: '�v���X�덷',
                    type: serverWidget.FieldType.TEXT,
                    container: 'error_subtab'
                });
                plus_error_label.defaultValue = '�v���X�덷 &nbsp;&nbsp;&nbsp;';
                plus_error_label.label = '';
                plus_error_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                plus_error_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                plus_error_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });

                var plus_error = form.addField({
                    id: 'custpage_plus_error',
                    label: 'plus_error',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    container: 'error_subtab'
                });

                plus_error.label = '';


                plus_error.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                plus_error.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                plus_error.defaultValue = options.savePlus;

                var minus_error_label = form.addField({
                    id: 'custpage_minus_error_label',
                    label: '�}�C�i�X�덷 ',
                    type: serverWidget.FieldType.TEXT,
                    container: 'error_subtab'
                });
                minus_error_label.defaultValue = '�}�C�i�X�덷 &nbsp;';
                minus_error_label.label = '';
                minus_error_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                minus_error_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                minus_error_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });

                var minus_error = form.addField({
                    id: 'custpage_minus_error',
                    label: 'minus_error',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    container: 'error_subtab'
                });

                minus_error.label = '';


                minus_error.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                minus_error.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                minus_error.defaultValue = options.saveMinus;


            } catch (e) {
                log.error('bindingSubTabError: ' + e.name, e.message);
            }
        }

        function bindingSubTabFee(form, options) {
            try {
                var tab = form.addTab({
                    id: 'tabid',
                    label: 'Tab'
                });

                //�萔������
                var commissionSubtab = form.addSubtab({
                    id: 'commission',
                    label: '�萔������',
                    tab: 'tabid'
                });

                var fee_account_item_label = form.addField({
                    id: 'custpage_fee_account_item_label',
                    label: '�萔������Ȗ�',
                    type: serverWidget.FieldType.TEXT,
                    container: 'commission'
                });
                fee_account_item_label.defaultValue = '�萔������Ȗ�';
                fee_account_item_label.label = '';
                fee_account_item_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                fee_account_item_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                fee_account_item_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });

                var fee_account_item = form.addField({
                    id: 'custpage_fee_account_item',
                    type: serverWidget.FieldType.SELECT,
                    label: 'fee_account_item',
                    source: 'account',
                    container: 'commission'
                });
                fee_account_item.label = '';
                fee_account_item.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                fee_account_item.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                fee_account_item.defaultValue = options.saveAcc;

                var tax_code_label = form.addField({
                    id: 'custpage_tax_code_label',
                    label: '����ŃR�[�h',
                    type: serverWidget.FieldType.TEXT,
                    container: 'commission'
                });
                tax_code_label.defaultValue = '����ŃR�[�h&nbsp;&nbsp;';
                tax_code_label.label = '';
                tax_code_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                tax_code_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                tax_code_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });

                var tax_code = form.addField({
                    id: 'custpage_tax_code',
                    label: 'tax_code',
                    type: serverWidget.FieldType.SELECT,
                    //source: 'customrecord_ssi_tax_group_2',
                    container: 'commission'
                });

                tax_code.label = '';
                tax_code.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                tax_code.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                util.each(getTaxCode(), function (obj) {
                    tax_code.addSelectOption({
                        value: obj.id,
                        text: obj.text
                    });
                })
                tax_code.defaultValue = options.saveTaxCo;

                var tax_category_label = form.addField({
                    id: 'custpage_tax_category_label',
                    label: '����ŃJ�e�S�� ',
                    type: serverWidget.FieldType.TEXT,
                    container: 'commission'
                });
                tax_category_label.defaultValue = '����ŃJ�e�S�� ';
                tax_category_label.label = '';
                tax_category_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                tax_category_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                tax_category_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
                //�J�X�^�����R�[�h�ucustomrecord_4572_tax_category�v���烊�X�g�l���擾
                var tax_category = form.addField({
                    id: 'custpage_tax_category',
                    label: 'tax_category',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customrecord_4572_tax_category',
                    container: 'commission'
                });

                tax_category.label = '';
                tax_category.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE

                });
                tax_category.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                tax_category.defaultValue = options.saveTaxCa;
            } catch (e) {
                log.error('bindingSubTabFee: ' + e.name, e.message);
            }
        }

        function doCreateSublist(form) {
            try {
                var paymentSubList = form.addSublist({
                    id: 'custpage_payment_sub_list',
                    type: serverWidget.SublistType.LIST,
                    label: '�����Ǘ��ꗗ'
                });
                paymentSubList.addField({
                    id: 'custpage_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                // paymentSubList.addField({
                //     id: 'custpage_feeid',
                //     type: serverWidget.FieldType.TEXT,
                //     label: 'ID'
                // }).updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.HIDDEN
                // });

                paymentSubList.addField({
                    id: 'custpage_sub_list_check',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: '���O'
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_batchflg',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: '�o�b�`���s����'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_id',
                    type: serverWidget.FieldType.TEXT,
                    label: '�����ԍ�'
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_id_hidden',
                    type: serverWidget.FieldType.TEXT,
                    label: '�����ԍ�'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_depositacc',
                    type: serverWidget.FieldType.TEXT,
                    label: '��������'
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_2',
                    type: serverWidget.FieldType.TEXT,
                    label: '���Ӑ�No.'
                }).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY})
                    .updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

                paymentSubList.addField({
                    id: 'custpage_sub_list_3',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    label: '�ڋq'
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_4',
                    type: serverWidget.FieldType.DATE,
                    label: '������'
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_5',
                    type: serverWidget.FieldType.TEXT,
                    label: '��s'
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_6',
                    type: serverWidget.FieldType.TEXT,
                    label: '�x�X'
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_7',
                    type: serverWidget.FieldType.TEXT,
                    label: '�˗��l'
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_8',
                    type: serverWidget.FieldType.CURRENCY,
                    label: '�����z'
                });

                paymentSubList.addField({
                    id: 'custpage_sub_list_9',
                    type: serverWidget.FieldType.CURRENCY,
                    label: '�����v'
                }).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY})
                    .updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

                paymentSubList.addField({
                    id: 'custpage_sub_list_14',
                    type: serverWidget.FieldType.CURRENCY,
                    label: '�K�p�z'
                }).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY})
                    .updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

                paymentSubList.addField({
                    id: 'custpage_sub_list_15',
                    type: serverWidget.FieldType.CURRENCY,
                    label: '�����z'
                }).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY})
                    .updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

                paymentSubList.addField({
                    id: 'custpage_sub_list_10',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: '��v'
                }).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

                paymentSubList.addField({
                    id: 'custpage_sub_list_11',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: '�����'
                }).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

                paymentSubList.addField({
                    id: 'custpage_sub_list_12',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: '�萔��'
                }).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

                paymentSubList.addField({
                    id: 'custpage_sub_list_13',
                    type: serverWidget.FieldType.TEXT,
                    label: '���z�������i�[�G���A'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                return paymentSubList;
            } catch (e) {
                log.error('doCreateSublist: ' + e.name, e.message);
            }
        }

        function doGet(context, recordId, dateImport) {
            try {
                var objRecord = record.load({
                    type: 'customrecord_dj_custpayment_management',
                    id: recordId
                });

                //doGetSetting
                var objSetting = doGetSettingValues(objRecord);
                var paymentList = getPaymentList(recordId, dateImport);

                // �t�H�[����`
                var form = serverWidget.createForm({
                    title: '�����Ǘ��['
                });
                //Binding form header
                bindingHeader(form, recordId, objSetting, dateImport);
                // �����Ǘ��ꗗ
                var paymentSublist = doCreateSublist(form);
                //bind data to sublist
                bindDataToSublist(paymentList, paymentSublist, objSetting, dateImport);
                //add Tab and subTab
                bindingSubTabFee(form, objSetting);
                bindingSubTabError(form, objSetting);

                form.clientScriptModulePath = '../Client/dj_cs_payment_management.js';
                context.response.writePage(form);
                //--end doGet--
            } catch (e) {
                log.error('doGet: ' + e.name, e.message);
            }
        }

        function doFillInvoiceToSublistRow(paymentObj, objSetting, dateImport, line) {
            try {
                var options = {};

                options.id = paymentObj.id;

                //���O
                options.sub_list_check = paymentObj.exclusion;
                //�����ԍ�
                options.sub_list_id = '<a href="javascript:void(0)" onclick="goPaymentAdjustmentBefore('+line+');">' + paymentObj.depositnum + '</a>';

                // ��������
                options.depositacc = paymentObj.depositacc;
                //���Ӑ�No
                options.sub_list_2 = paymentObj.customerno;
                //�ڋq
                options.sub_list_3 = paymentObj.client;
                //���p�J�i�Ж�
                options.client_half = paymentObj.client_half;
                //������
                options.sub_list_4 = paymentObj.paymentdate;
                //��s
                options.sub_list_5 = paymentObj.bank;
                //�x�X
                options.sub_list_6 = paymentObj.branchoff;
                //�˗��l
                options.sub_list_7 = paymentObj.request;
                //�����z
                options.sub_list_8 = paymentObj.paymentamo;
                //�����v
                options.sub_list_9 = paymentObj.claimsum;
                //��v
                options.sub_list_10 = 'F';
                if (paymentObj.paymentamo == paymentObj.claimsum) {
                    options.sub_list_10 = 'T';
                } else {
                    options.sub_list_10 = 'F';
                }
                //�����
                if (paymentObj.consumption) {
                    options.sub_list_11 = 'T';
                } else {
                    options.sub_list_11 = 'F';
                }
                //�萔��
                if (paymentObj.fee) {
                    options.sub_list_12 = 'T';
                } else {
                    options.sub_list_12 = 'F';
                }

                options.saving = paymentObj.saving;
                options.saving2 = paymentObj.saving2;
                options.saving3 = paymentObj.saving3;
                options.saving4 = paymentObj.saving4;
                options.batchflg = paymentObj.batchflg;

                return options;
            } catch (e) {
                log.error('doFillInvoiceToSublistRow: ' + e.name, e.message);
                return {};
            }
        }

        function bindDataToSublist(paymentList, paymentSublist, objSetting, dateImport) {
            try {
                log.audit('bindDataToSublist dateImport ', dateImport);
                //sort as �����ԍ� ascending
                var paymentListSumarySort = _.sortBy(paymentList, me.string_comparator('depositnum'));
                var line = 0;
                util.each(paymentListSumarySort, function (paymentObj, line) {
                    // getSaiken(paymentObj, dateImport);
                    var options = doFillInvoiceToSublistRow(paymentObj, objSetting, dateImport, line);
                    doAddSublistRow(paymentSublist, options, line);

                });
            } catch (e) {
                log.error('bindDataToSublist: ' + e.name, e.message);
            }
        }


        function getHeaderPostValues(context) {
            try {
                obj = {};
                obj.id = context.request.parameters.custpage_head_id;
                obj.subsidiary = context.request.parameters.custpage_custom_subsidiary;
                obj.importDateFromCSV = context.request.parameters.custpage_import_date_from_csv;
                //�������̊���
                obj.importDateFrom = context.request.parameters.custpage_import_date_from;
                obj.importDateTo = context.request.parameters.custpage_import_date_to;
                //tab values
                obj.fee_account_item = context.request.parameters.custpage_fee_account_item;
                obj.tax_code = context.request.parameters.custpage_tax_code;
                obj.tax_category = context.request.parameters.custpage_tax_category;
                obj.error_difference = context.request.parameters.custpage_error_difference;
                obj.plus_error = context.request.parameters.custpage_plus_error;
                obj.minus_error = context.request.parameters.custpage_minus_error;
                obj.taxco_error = context.request.parameters.custpage_taxco_error;
                obj.taxca_error = context.request.parameters.custpage_taxca_error;
                return obj;
            } catch (e) {
                log.error('getHeaderPostValues: ' + e.name, e.message);
                return {};
            }
        }

        function doPost(context) {
            try {
                //get post data
                var postValue = getHeaderPostValues(context);
                log.audit('doPost postValue ', postValue);

                //update header
                record.submitFields({
                    type: 'customrecord_dj_custpayment_management',
                    id: postValue.id,
                    values: {
                        custrecord_dj_custpayment_saving_acc: postValue.fee_account_item,
                        custrecord_dj_custpayment_saving_taxco: postValue.tax_code,
                        custrecord_dj_custpayment_saving_taxca: postValue.tax_category,
                        custrecord_dj_custpayment_saving_error: postValue.error_difference,
                        custrecord_dj_custpayment_saving_plus: postValue.plus_error,
                        custrecord_dj_custpayment_saving_minus: postValue.minus_error,
                        custrecord_dj_custpayment_date_from_csv: postValue.importDateFromCSV,
                        custrecord_dj_custpayment_date_from: postValue.importDateFrom,
                        custrecord_dj_custpayment_date_to: postValue.importDateTo
                    }
                });

                //Get customer List
                var lines = context.request.getLineCount({group: 'custpage_payment_sub_list'});


                //update detail
                var rowValue = {};
                for (var i = 0; i < lines; i++) {
                    rowValue.paymentId = context.request.getSublistValue({
                        group: 'custpage_payment_sub_list',
                        name: 'custpage_id',
                        line: i
                    });
                    //�I��
                    rowValue.check = context.request.getSublistValue({
                        group: 'custpage_payment_sub_list',
                        name: 'custpage_sub_list_check',
                        line: i
                    });
                    // ���Ӑ�
                    rowValue.customerno = context.request.getSublistValue({
                        group: 'custpage_payment_sub_list',
                        name: 'custpage_sub_list_2',
                        line: i
                    });
                    // �ڋq
                    rowValue.customer = context.request.getSublistValue({
                        group: 'custpage_payment_sub_list',
                        name: 'custpage_sub_list_3',
                        line: i
                    });
                    // �����v
                    rowValue.totalReceivables = context.request.getSublistValue({
                        group: 'custpage_payment_sub_list',
                        name: 'custpage_sub_list_9',
                        line: i
                    });
                    // ��v
                    rowValue.match = context.request.getSublistValue({
                        group: 'custpage_payment_sub_list',
                        name: 'custpage_sub_list_10',
                        line: i
                    });
                    // �����
                    rowValue.consumption = context.request.getSublistValue({
                        group: 'custpage_payment_sub_list',
                        name: 'custpage_sub_list_11',
                        line: i
                    });
                    // �萔��
                    rowValue.fee = context.request.getSublistValue({
                        group: 'custpage_payment_sub_list',
                        name: 'custpage_sub_list_12',
                        line: i
                    });



                    if (!me.isEmpty(rowValue.customer)) {

                        //update to database
                        log.audit('rowValues', rowValue);
                        record.submitFields({
                            type: 'customrecord_dj_custpayment',
                            id: rowValue.paymentId,
                            values: {
                                custrecord_dj_custpayment_exclusion: rowValue.check,
                                custrecord_dj_custpayment_client: rowValue.customer,
                                custrecord_dj_custpayment_claimsum: parseInt(rowValue.totalReceivables),
                                custrecord_dj_custpayment_customerno: rowValue.customerno,
                                custrecord_dj_custpayment_match: rowValue.match,
                                custrecord_dj_custpayment_consumption: rowValue.consumption,
                                custrecord_dj_custpayment_fee: rowValue.fee
                            }
                        });
                    } else {
                        record.submitFields({
                            type: 'customrecord_dj_custpayment',
                            id: rowValue.paymentId,
                            values: {
                                custrecord_dj_custpayment_exclusion: rowValue.check,
                                custrecord_dj_custpayment_client: rowValue.customer,
                                custrecord_dj_custpayment_claimsum: 0,
                                custrecord_dj_custpayment_customerno: '',
                                custrecord_dj_custpayment_match: rowValue.match,
                                custrecord_dj_custpayment_consumption: rowValue.consumption,
                                custrecord_dj_custpayment_fee: rowValue.fee
                            }
                        });
                    }
                }//end for

                redirect.toRecord({
                    type: 'customrecord_dj_custpayment_management',
                    id: postValue.id
                });
            } catch (e) {
                log.error('doPost: ' + e.name, e.message);
            }
        }

        function getPaymentList(paymentListHeadId, dateImport) {
            try {
                var columnsArr = [];
                columnsArr.push({
                    name: 'custrecord_dj_custpayment_depositnum',
                    sort: search.Sort.ASC
                });
                columnsArr.push({name: 'custrecord_dj_custpayment_m_id'});
                columnsArr.push({name: 'custrecord_dj_custpayment_exclusion'});
                columnsArr.push({name: 'custrecord_dj_custpayment_depositacc'});
                columnsArr.push({name: 'custrecord_dj_custpayment_customerno'});
                columnsArr.push({name: 'custrecord_dj_custpayment_client'});
                columnsArr.push({name: 'custrecord_dj_custpayment_paymentdate'});
                columnsArr.push({name: 'custrecord_dj_custpayment_bank'});
                columnsArr.push({name: 'custrecord_dj_custpayment_branchoff'});
                columnsArr.push({name: 'custrecord_dj_custpayment_request'});
                columnsArr.push({name: 'custrecord_dj_custpayment_paymentamo'});
                columnsArr.push({name: 'custrecord_dj_custpayment_claimsum'});
                columnsArr.push({name: 'custrecord_dj_custpayment_match'});
                columnsArr.push({name: 'custrecord_dj_custpayment_consumption'});
                columnsArr.push({name: 'custrecord_dj_custpayment_fee'});
                columnsArr.push({name: 'custrecord_dj_custpayment_client_half'});
                columnsArr.push({name: 'custrecord_dj_custpayment_saving'});
                columnsArr.push({name: 'custrecord_dj_custpayment_saving_s'});
                columnsArr.push({name: 'custrecord_dj_custpayment_saving_t'});
                columnsArr.push({name: 'custrecord_dj_custpayment_saving_a'});
                columnsArr.push({name: 'custrecord_dj_custpayment_error_flag'});
                var filtersArr = [];
                filtersArr.push({
                    name: 'custrecord_dj_custpayment_m_id',
                    operator: search.Operator.IS,
                    values: [paymentListHeadId]
                });
                if (!me.isEmpty(dateImport.from) && !me.isEmpty(dateImport.to)) {
                    filtersArr.push({
                        name: 'custrecord_dj_custpayment_paymentdate',
                        operator: search.Operator.WITHIN,
                        values: [dateImport.from, dateImport.to]
                    });
                }
                //From~
                else if (!me.isEmpty(dateImport.from) && me.isEmpty(dateImport.to)) {
                    filtersArr.push({
                        name: 'custrecord_dj_custpayment_paymentdate',
                        operator: search.Operator.ONORAFTER,
                        values: [dateImport.from]
                    });
                }
                //~To
                else if (me.isEmpty(dateImport.from) && !me.isEmpty(dateImport.to)) {
                    filtersArr.push({
                        name: 'custrecord_dj_custpayment_paymentdate',
                        operator: search.Operator.ONORBEFORE,
                        values: [dateImport.to]
                    });
                }
                var myPaymentListSearch = search.create({
                    type: 'customrecord_dj_custpayment',
                    columns: columnsArr,
                    filters: filtersArr
                });
                var resultSet = myPaymentListSearch.run();
                var objList = [];
                resultSet.each(function (result) {
                    var obj = {};
                    obj.id = result.id;
                    obj.head_id = result.getValue({name: 'custrecord_dj_custpayment_m_id'});
                    obj.depositnum = result.getValue({name: 'custrecord_dj_custpayment_depositnum'});
                    var exclusion = result.getValue({name: 'custrecord_dj_custpayment_exclusion'});
                    if (exclusion) {
                        obj.exclusion = 'T';
                    } else {
                        obj.exclusion = 'F';
                    }
                    obj.depositacc = result.getValue({name: 'custrecord_dj_custpayment_depositacc'});
                    obj.customerno = result.getValue({name: 'custrecord_dj_custpayment_customerno'});
                    //�ڋq
                    obj.client = result.getValue({name: 'custrecord_dj_custpayment_client'});
                    obj.paymentdate = result.getValue({name: 'custrecord_dj_custpayment_paymentdate'});
                    obj.bank = result.getValue({name: 'custrecord_dj_custpayment_bank'});
                    obj.branchoff = result.getValue({name: 'custrecord_dj_custpayment_branchoff'});
                    obj.request = result.getValue({name: 'custrecord_dj_custpayment_request'});
                    obj.paymentamo = result.getValue({name: 'custrecord_dj_custpayment_paymentamo'});
                    if (!me.isEmpty(obj.paymentamo)) {
                        obj.paymentamo = format.parse({value: obj.paymentamo, type: format.Type.INTEGER});
                    }
                    obj.claimsum = result.getValue({name: 'custrecord_dj_custpayment_claimsum'});
                    if (!me.isEmpty(obj.claimsum)) {
                        obj.claimsum = format.parse({value: obj.claimsum, type: format.Type.INTEGER});
                    }
                    //��v
                    obj.match = result.getValue({name: 'custrecord_dj_custpayment_match'});
                    // �����
                    obj.consumption = result.getValue({name: 'custrecord_dj_custpayment_consumption'});
                    // �萔��
                    obj.fee = result.getValue({name: 'custrecord_dj_custpayment_fee'});
                    obj.saving = result.getValue({name: 'custrecord_dj_custpayment_saving'});
                    obj.saving2 = result.getValue({name: 'custrecord_dj_custpayment_saving_s'});
                    obj.saving3 = result.getValue({name: 'custrecord_dj_custpayment_saving_t'});
                    obj.saving4 = result.getValue({name: 'custrecord_dj_custpayment_saving_a'});
                    obj.batchflg = result.getValue({name: 'custrecord_dj_custpayment_error_flag'});
                    objList.push(obj);
                    return true;
                });
                return (objList);
            } catch (e) {
                log.error('getPaymentList: ' + e.name, e.message);
                return [];
            }
        }

        function getSetting() {
            try {
                var columnsArr = [];
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_acc'});
                columnsArr.push({name: 'custrecord_dj_cuspm_setting_acc_tax_plus'});
                columnsArr.push({name: 'custrecord_dj_cuspm_seting_acc_tax_minus'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_taxco'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_taxca'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_error'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_plus'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_minus'});

                var mysearch = search.create({
                    type: 'customrecord_dj_custpayment_setting',
                    columns: columnsArr
                });
                var resultSet = mysearch.run().getRange({start: 0, end: 1});
                var obj = {};
                util.each(resultSet, function (result) {
                    obj.acc = result.getValue({name: 'custrecord_dj_custpayment_setting_acc'});
                    obj.accTaxPlus = result.getValue({name: 'custrecord_dj_cuspm_setting_acc_tax_plus'});
                    obj.accTaxMinus = result.getValue({name: 'custrecord_dj_cuspm_seting_acc_tax_minus'});
                    obj.taxco = result.getValue({name: 'custrecord_dj_custpayment_setting_taxco'});
                    obj.taxca = result.getValue({name: 'custrecord_dj_custpayment_setting_taxca'});
                    obj.error = result.getValue({name: 'custrecord_dj_custpayment_setting_error'});
                    obj.plus = result.getValue({name: 'custrecord_dj_custpayment_setting_plus'});
                    obj.minus = result.getValue({name: 'custrecord_dj_custpayment_setting_minus'});
                })
                return obj;
            } catch (e) {
                log.error(' ' + e.name, e.message);
                return {};
            }
        }

        function getFee() {
            try {
                var mysearch = search.create({
                    type: 'customrecord_dj_custfee',
                    columns: [{
                        name: 'name'
                    }, {
                        name: 'custrecord_dj_custfee_sum'
                    }, {
                        name: 'custrecord_dj_custfee_base'
                    }]
                });
                var resultSet = mysearch.run().getRange({start: 0, end: 100});
                var results = [];
                util.each(resultSet, function (result) {
                    var obj = {};
                    obj.id = result.id;
                    obj.name = result.getValue({name: 'name'});
                    obj.sum = result.getValue({name: 'custrecord_dj_custfee_sum'});
                    obj.base = result.getValue({name: 'custrecord_dj_custfee_base'});
                    results.push(obj);
                })
                return results;
            } catch (e) {
                log.error('getFee ' + e.name, e.message);
                return [];
            }
        }


        function getTaxCode() {
            try {
                var objList = [];
                var mysearch = search.create({
                    // type: 'taxgroup',
                    type: 'salestaxitem',
                    columns: [{
                        name: 'itemid'
                    }]
                });
                var resultSet = mysearch.run().getRange({start: 0, end: 1000});
                util.each(resultSet, function (result) {
                    var obj = {};
                    obj.id = result.id;
                    obj.text = result.getValue({name: 'itemid'});
                    objList.push(obj);
                });
                return objList;
            } catch (e) {
                log.error('getTaxCode ' + e.name, e.message);
                return [];
            }
        }

        return {
            onRequest: onRequest
        };

    });