/**
 * Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    'N/ui/serverWidget',
    'N/record',
    '../data/JP_EntityDAO',
    '../lib/JP_TCTranslator'
    ],
    (widget, record , JP_EntityDAO, translator) => {

    const FLD_GRP_TAX_PREF = 'FLD_GRP_TAX_PREF';
    const FLD_GRP_PAY_PREF = 'FLD_GRP_PAY_PREF';
    const FLD_GRP_INV_SUMM = 'FLD_GRP_INV_SUMM';
    const TAB_JP_LOC = 'CUSTTAB_ENTITY_JP_LOC_CUSTOMTAB';
    let texts = [];

        class JP_EntityUI{
            setDueDateCheckBox(context){
                let currRecord = context.newRecord;
                let entDao = new JP_EntityDAO();
                let includeIS = currRecord.getValue({fieldId: entDao.fields.includeIS});

                //computeDate field is disabled/enabled based whether include invoice summary is un/checked.
                let isCompDueDate = currRecord.getValue({fieldId: entDao.fields.computeDueDate});

                // because we cannot alter the values of the current record in before load and
                // because of the requirement where by default Compute Due Date box is check when
                // Invoice Invoice Summary checkbox is checked, it maybe confusing for existing user to
                // see the Compute Due Date checkbox unchecked and we are still computing automatically the due date.
                // We therefore create this fake check box for display purposes only and hide the real
                // Compute Due Date checkbox.
                // see: https://5291654.app.netsuite.com/app/help/helpcenter.nl?fid=section_4407991781.html
                if( (context.type === context.UserEventType.VIEW ||
                    context.type === context.UserEventType.EDIT) && includeIS && !isCompDueDate){
                    let form = context.form;
                    let compDueDate = form.getField({id: entDao.fields.computeDueDate});
                    compDueDate.updateDisplayType({displayType: widget.FieldDisplayType.HIDDEN});

                    let mycheck = form.addField({
                        id: 'custpage_fakecheck',
                        label: compDueDate.label,
                        type: widget.FieldType.CHECKBOX
                    });
                    let helpTxtId = 'HLP_JPCOMPUTEDUE';
                    let helpText = new translator().getTexts([helpTxtId], true);
                    //for some reason helpText always returns null get the help
                    mycheck.setHelpText({help: helpText[helpTxtId]});
                    mycheck.defaultValue = 'T';
                    mycheck.updateDisplayType({displayType: widget.FieldDisplayType.DISABLED});

                    form.insertField({
                        field: mycheck,
                        nextfield : entDao.fields.computeDueDate
                    });
                }
            }

            /**
             * Sets the Use Invoice Summary as the Tax Invoice Document checkbox to unchecked
             * and disables it when the Include Invoice Summary checkbox is unchecked.
             *
             * @param context UE script context object.
             */
            setTaxInvoiceLawCheckbox(context){
                let currRecord = context.newRecord;
                let form = context.form;
                let entDao = new JP_EntityDAO();
                let includeIS = currRecord.getValue({fieldId: entDao.fields.includeIS});

                if(!includeIS){

                    if(form){ //form is only available on beforeLoad.
                        let taxLawBox = form.getField({id: entDao.fields.taxISLaw});

                        if(taxLawBox){ //for now qualified invoicing system is applicable to customers.
                            taxLawBox.updateDisplayType({displayType: widget.FieldDisplayType.DISABLED});
                            currRecord.setValue({fieldId: entDao.fields.taxISLaw, value : false });
                        }
                    }
                }
            }

            loadTextObject() {
                if (texts.length < 1) {
                    let stringCodes = [
                        FLD_GRP_TAX_PREF,
                        FLD_GRP_PAY_PREF,
                        FLD_GRP_INV_SUMM,
                        TAB_JP_LOC
                    ];
                    texts = new translator().getTexts(stringCodes, true);
                }

            }

            /**
             * Show Japan Localization Subtab
             *
             * @param context UE script context object.
             */
            showJapanLocalizationSubtab(context){
                let form = context.form;
                let data = {};

                //use lookup table in lieu of switch case
                data[record.Type.CUSTOMER] = [
                    {
                        fldGroupId : 'custpage_jp_inv_summ',
                        fldGroupLbl : FLD_GRP_INV_SUMM,
                        dummyFld: 'custpage_dummy_fld_1',
                        fieldList: [
                            'custentity_4392_useids',
                            'custentity_jp_taxinvchckbox'
                        ]
                    },
                    {
                        fldGroupId : 'custpage_jp_pay_pref',
                        fldGroupLbl : FLD_GRP_PAY_PREF,
                        dummyFld: 'custpage_dummy_fld_2',
                        fieldList: [
                            'custentity_jp_due_date_adjustment',
                            'custentity_jp_duedatecompute'
                        ]
                    }
                ];
                data[record.Type.VENDOR] =  [
                    {
                        fldGroupId : 'custpage_jp_tax_pref',
                        fldGroupLbl : FLD_GRP_TAX_PREF,
                        dummyFld: 'custpage_dummy_fld_1',
                        fieldList: [
                            'custentity_jp_vendtaxexempent',
                            'custentity_jp_vendtaxregnum',
                            'custentity_jp_posubcontract_act'
                        ]
                    },
                    {
                        fldGroupId : 'custpage_jp_pay_pref',
                        fldGroupLbl : FLD_GRP_PAY_PREF,
                        dummyFld: 'custpage_dummy_fld_2',
                        fieldList: [
                            'custentity_jp_due_date_adjustment',
                            'custentity_jp_duedatecompute'
                        ]
                    }
                ];

                let dataset = data[context.newRecord.type];

                if (dataset){
                    this.loadTextObject();

                    let tabList = form.getTabs();
                    let customTabList = tabList.filter(value => value.includes('custom'));
                    let JPLocTab;

                    util.each(customTabList, (tab)=> {
                        if (form.getTab(tab).label === texts[TAB_JP_LOC]){
                            JPLocTab = tab;
                        }
                    });

                    util.each(dataset, (data)=> {
                        form.addFieldGroup({
                            id: data.fldGroupId,
                            label: texts[data.fldGroupLbl],
                            tab: JPLocTab
                        });

                        let dummyFld = form.addField({
                            id : data.dummyFld,
                            type : widget.FieldType.TEXT,
                            label : 'Text',
                            container : data.fldGroupId
                        });
                        dummyFld.updateDisplayType({
                            displayType: widget.FieldDisplayType.HIDDEN
                        });

                        util.each(data.fieldList, (fieldId)=> {
                            let fieldObj = form.getField({id: fieldId});
                            if (fieldObj) {
                                fieldObj.updateDisplayType({
                                    displayType: widget.FieldDisplayType.NORMAL
                                });
                                form.insertField({
                                    field: fieldObj,
                                    nextfield: data.dummyFld
                                });
                            }
                        });
                    });
                }
            }
        }

        return JP_EntityUI;
    });
