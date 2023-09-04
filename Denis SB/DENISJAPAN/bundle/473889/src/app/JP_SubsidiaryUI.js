/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
        "N/error",
        "N/search",
        "N/runtime",
        "N/ui/serverWidget",
        "../lib/JP_TCTranslator",
        "../data/JP_FileDAO",
        "../data/JP_FolderDAO",
        "../data/JP_AccountingPreference",
        "../data/NQuery/JP_NDeptDAO",
        "../data/NQuery/JP_NLocationDAO",
        "../data/NQuery/JP_NClassDAO",
        "../data/NQuery/JP_NHolidayDAO",
        "../data/JP_SubsidiaryHolidayDAO",
        "../datastore/JP_ListStore",
        "../app/JP_TaxRegNumValidator"
    ],

     (error, search, runtime, serverWidget,
      translation, fileDAO, folderDAO, accountingPreferences,
      departmentDAO, locationDAO, classDAO, holidayDAO, subsidiaryHolidayDAO,
      ListStore, TaxRegValidator) => {

        // Invoice Summaries fields
        let INVOICE_SUMMARIES_FOLDER = "Invoice Summaries";
        let FLD_INVSUM_FIELD = "custrecord_jp_loc_invsum_folder";
        let FLD_INVSUM_PATH = "custrecord_jp_inv_sum_tpl_path";
        let FLD_INVSUM_TEXT_FIELD = "custpage_jp_loc_invsum_select";
        let DEFAULT_STD_XML_TEMPLATE = "default_template.xml";
        let DEFAULT_CON_XML_TEMPLATE = "consolidated_default_template.xml";

        // Printed PO Fields
        let PRINTED_PO_FOLDER = "Printed Purchase Orders";
        let PRINTED_PO_FIELD = "custrecord_jp_loc_sub_printed_po";
        let PRINTED_PO_PATH = "custrecord_jp_printed_po_path";
        let PRINTED_PO_TEXT_FIELD = 'custpage_po_numbering';

        //Custom Advanced PDF Template Fields
        let PDF_INVOICE_TITLE_FIELD = "custpage_pdf_inv_title";
        let PDF_INVOICE_GREETING_FIELD = "custpage_pdf_inv_greet";
        let PDF_SO_TITLE_FIELD = "custpage_pdf_so_title";
        let PDF_SO_GREETING_FIELD = "custpage_pdf_so_greet";
        let PDF_PO_TITLE_FIELD = "custpage_pdf_po_title";
        let PDF_PO_GREETING_FIELD = "custpage_pdf_po_greet";
        let PDF_JOURNAL_TITLE_FIELD = "custpage_pdf_journ_title";
        let PDF_BANK_ACCT_INFO_FIELD = "custrecord_jp_pdf_bank_acct_info";
        let PDF_INVOICE_TITLE_STORE = "custrecord_jp_pdf_title_invoice";
        let PDF_INVOICE_GREETING_STORE = "custrecord_jp_pdf_greet_invoice";
        let PDF_SO_TITLE_STORE = "custrecord_jp_pdf_title_so";
        let PDF_SO_GREETING_STORE = "custrecord_jp_pdf_greet_so";
        let PDF_PO_TITLE_STORE = "custrecord_jp_pdf_title_po";
        let PDF_PO_GREETING_STORE = "custrecord_jp_pdf_greet_po";
        let PDF_JOURNAL_TITLE_STORE = "custrecord_jp_pdf_title_journal";
        let PDF_SEAL_INVOICE_FIELD = "custrecord_jp_pdf_seal_invoice";
        let PDF_SEAL_SO_FIELD = "custrecord_jp_pdf_seal_so";
        let PDF_SEAL_PO_FIELD = "custrecord_jp_pdf_seal_po";
        const PDF_MEMO_TITLE = "custrecord_pdf_memo_title";
        const PDF_SEAL_MEMO = "custrecord_jp_pdf_seal_memo";
        const PDF_MEMO_GREET = "custrecord_pdf_memo_greet";

        let INTERNALID = 'internalid';
        let DEFAULT_STD_TPL = "custrecord_suitel10n_jp_ids_def_template";
        let DEFAULT_CON_TPL = "custrecord_suitel10n_jp_ids_def_con_tpl";
        let STATEMENT_SEARCH = "custrecord_suitel10n_jp_sub_stat_search";
        let FLD_PRINTOPT = "custrecord_jp_print_option";
        let HOLIDAY_TAB_ID = "custpage_suitel10n_jp_non_op_days_tab";
        let HOLIDAY_CHECKING = "custrecord_suitel10n_jp_sub_use_holiday";
        let TAX_REG_NUMBER = "custrecord_jp_loc_tax_reg_number";
        let AR_DEB_ADJ_ITEM_OW = "custrecord_jp_ar_deb_adj_item_ow";
        let AR_DEB_ADJ_ITEM_SI = "custrecord_jp_ar_deb_adj_item_si";
        let jp_loc_subtab = "custpage_suite10n_jpsetup";
        let setting_group_id = 'custpage_settings_filter_group';
        let ponum_group_id = 'custpage_ponum_filter_group';
        let mock_individual_pdf = 'custpage_indivpdf';
        let pdf_name_options = 'custpage_jp_pdfname';
        let FLD_PDF_FILEFORMAT = 'custrecord_jp_ispdf_format';
        let FLD_INDIVCUST = 'custrecord_jp_isgen_individcust';
        let pdftemp_group_id = 'custpage_pdftemp_filter_group';
        let pdf_titles_list = "customlist_jp_txn_pdf_title";
        let pdf_greetings_list = "customlist_jp_txn_pdf_greeting";
        let dept_fld = 'custrecord_jp_department';
        let location_fld = 'custrecord_jp_location';
        let class_fld = 'custrecord_jp_class';
        let mock_dept_fld = 'custpage_jp_dept';
        let mock_location_fld = 'custpage_jp_location';
        let mock_class_fld = 'custpage_jp_class';

        //dummy fields (DM for short)
        let UI_STD_IDS_FIELD = "custpage_ui_std_ids_template";
        let UI_CON_IDS_FIELD = "custpage_ui_con_ids_template";
        let DM_STATEMENT_SEARCH = 'custpage_suitel10n_jp_sub_stat_search';

        let texts = {
            label: {
                folderselection : "PO_LABEL_FOLDERSELECTION",
                isfolderselection: "IS_LBL_FOLDERSELECTION",
                invoicetitle: "CUSTRECORD_JP_PDF_TITLE_INVOICE_NAME",
                invoicegreet: "CUSTRECORD_JP_PDF_GREET_INVOICE_NAME",
                salesordertitle: "CUSTRECORD_JP_PDF_TITLE_SO_NAME",
                salesordergreet: "CUSTRECORD_JP_PDF_GREET_SO_NAME",
                purordertitle: "CUSTRECORD_JP_PDF_TITLE_PO_NAME",
                purordergreet: "CUSTRECORD_JP_PDF_GREET_PO_NAME",
                journaltitle: "CUSTRECORD_JP_PDF_TITLE_JOURNAL_NAME",
                ardebadjitem: "CUSTRECORD_JP_AR_DEB_ADJ_ITEM",
                individualpdf : "LBL_INDIVIDUAL_PDF",
                pdfname : "LBL_PDFNAME",
                nonopdays : "SUBSIDIARY_TAB_LABEL_NON_OP_DAYS",
                nonopname: "SUBSIDIARY_LABEL_NONOPDAYS_NAME",
                holidaydate : "SUB_HOLIDAYLISTDATELBL",
                dlc_dept: "LBL_JP_DEPT",
                dlc_location: "LBL_JP_LOCATION",
                dlc_class: "LBL_JP_CLASS"
            },
            flh: {
                folderselection: "PO_FLH_FOLDERSELECTION",
                statementsearch: "PO_FLH_STATEMENTSEARCH",
                isfolderselection: "IS_FLH_FOLDERSELECTION",
                invoicetitle: "PDF_FLH_INVTITLE",
                invoicegreet: "PDF_FLH_INVGREET",
                salesordertitle: "PDF_FLH_SOTITLE",
                salesordergreet: "PDF_FLH_SOGREET",
                purordertitle: "PDF_FLH_POTITLE",
                purordergreet: "PDF_FLH_POGREET",
                journaltitle: "PDF_FLH_JOURNTITLE",
                individualpdf : "FLH_INDIVIDUAL_PDF",
                pdfname : "FLH_PDFNAME",
                defaultstdtemplate : "SUBSIDIARY_LABEL_DEFAULT_TEMPLATE_HELP",
                defaultcontemplate : "IS_FLH_TEMPLATEFLD_CONSOLIDATED",
                dlc_dept: "CUSTRECORD_JP_DEPARTMENT_FLH",
                dlc_location: "CUSTRECORD_JP_LOCATION_FLH",
                dlc_class: "CUSTRECORD_JP_CLASS_FLH"
            },
            section : {
                invoicesummary : "PO_SECTION_INVOICESUM",
                ponumbering: "PO_SECTION_PONUMBERING",
                pdftemplate: "PDF_SECTION_PDFTEMPLATE"
            },
            tab : {
                jptab : "PO_TABNAME"
            },
            error : {
                pofolder : "PO_ERR_FOLDERSELECTION",
                invsum : "IS_ERR_FOLDERSELECTION",
                taxregnum_title: "ERR_TITLE_MISSING_TAX_REG_NUM",
                taxregnum_msg: "ERR_MSG_MISSING_TAX_REG_NUM"
            },
            sublist :{
                sublistname : "SUBSIDIARY_LABEL_NONOPDAYS_SUBLIST_NAME"
            }
        };
        
        let tcTexts;

        let jpflds = [DEFAULT_STD_TPL, DEFAULT_CON_TPL, STATEMENT_SEARCH, HOLIDAY_CHECKING, FLD_PRINTOPT,
            TAX_REG_NUMBER, AR_DEB_ADJ_ITEM_OW, AR_DEB_ADJ_ITEM_SI, PDF_BANK_ACCT_INFO_FIELD, PDF_SEAL_INVOICE_FIELD,
            PDF_SEAL_SO_FIELD, PDF_SEAL_PO_FIELD, PDF_MEMO_TITLE, PDF_SEAL_MEMO, PDF_MEMO_GREET ];

        let PDF_LIST_INVOICE_ENTRY = 1;
        let PDF_LIST_SO_ENTRY = 2;
        let PDF_LIST_PO_ENTRY = 3;
        let PDF_LIST_JOURNAL_ENTRY = 4;
        let customPDFFields = [
            {id: PDF_INVOICE_TITLE_FIELD, text: 'invoicetitle',
                store: PDF_INVOICE_TITLE_STORE, source: pdf_titles_list, defaultValue: PDF_LIST_INVOICE_ENTRY},
            {id: PDF_SO_TITLE_FIELD, text: 'salesordertitle',
                store: PDF_SO_TITLE_STORE, source: pdf_titles_list, defaultValue: PDF_LIST_SO_ENTRY},
            {id: PDF_PO_TITLE_FIELD, text: 'purordertitle',
                store: PDF_PO_TITLE_STORE, source: pdf_titles_list, defaultValue: PDF_LIST_PO_ENTRY},
            {id: PDF_INVOICE_GREETING_FIELD, text: 'invoicegreet',
                store: PDF_INVOICE_GREETING_STORE, source: pdf_greetings_list, defaultValue: PDF_LIST_INVOICE_ENTRY},
            {id: PDF_SO_GREETING_FIELD, text: 'salesordergreet',
                store: PDF_SO_GREETING_STORE, source: pdf_greetings_list, defaultValue: PDF_LIST_SO_ENTRY},
            {id: PDF_PO_GREETING_FIELD, text: 'purordergreet',
                store: PDF_PO_GREETING_STORE, source: pdf_greetings_list, defaultValue: PDF_LIST_PO_ENTRY},
            {id: PDF_JOURNAL_TITLE_FIELD, text: 'journaltitle',
                store: PDF_JOURNAL_TITLE_STORE, source: pdf_titles_list, defaultValue: PDF_LIST_JOURNAL_ENTRY}
        ];

        class SubsidiaryUI{

            constructor() {
                this.loadTexts();
            }
            
            loadTexts() {
                let translationids = [];

                //extract the translation ids from the texts object to pass on to n/translate
                for( let key in texts) {
                    for(let prop in texts[key]){
                        translationids.push(texts[key][prop]);
                    }
                }

                tcTexts = new translation().getTexts(translationids, true);
            }

            /**
             * Hides JP bundle specific fields.
             *
             * @param {object} form subsidiary form
             */
            hideFields(form){
                util.each(jpflds, (fieldId) =>{
                    let fieldObj = form.getField({id: fieldId});
                    fieldObj.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
                });
            };

            /**
             * Prepares and populates the Standard and Consolidated Invoice Summary Template Fields
             *
             * @param {object} context script context
             */
            addUIIDSTemplateFields(context){
                let form = context.form;
                let newRecord = context.newRecord;

                // STANDARD
                let defaultStdIDSTemplate = form.getField({id: DEFAULT_STD_TPL});
                let defaultStdTemplateVal = newRecord.getValue({fieldId: DEFAULT_STD_TPL});

                // CONSOLIDATED
                let defaultConIDSTemplate = form.getField({id: DEFAULT_CON_TPL});
                let defaultConTemplateVal = newRecord.getValue({fieldId: DEFAULT_CON_TPL});

                let uiStdIDSField = form.addField({
                    id: UI_STD_IDS_FIELD,
                    type : serverWidget.FieldType.SELECT,
                    label: defaultStdIDSTemplate.label,
                    defaultValue: defaultStdTemplateVal,
                    container: setting_group_id
                });

                let uiConIDSField = form.addField({
                    id: UI_CON_IDS_FIELD,
                    type : serverWidget.FieldType.SELECT,
                    label: defaultConIDSTemplate.label,
                    defaultValue: defaultConTemplateVal,
                    container: setting_group_id
                });

                uiStdIDSField.setHelpText(tcTexts[texts.flh.defaultstdtemplate] );
                uiConIDSField.setHelpText(tcTexts[texts.flh.defaultcontemplate] );

                let statementTemplates = new fileDAO().getStatementTemplates();

                statementTemplates.unshift({id:  "", name: ""});
                statementTemplates.map(function(template){
                    uiStdIDSField.addSelectOption({
                        value : template.id,
                        text : template.name,
                        isSelected : (
                            defaultStdTemplateVal && defaultStdTemplateVal === template.id ||
                            !defaultStdTemplateVal && template.name === DEFAULT_STD_XML_TEMPLATE
                        )
                    });
                    uiConIDSField.addSelectOption({
                        value : template.id,
                        text : template.name,
                        isSelected : (
                            defaultConTemplateVal && defaultConTemplateVal === template.id ||
                            !defaultConTemplateVal && template.name === DEFAULT_CON_XML_TEMPLATE
                        )
                    });
                });
            };

            /**
             * This method adds the Holiday Tab to the specified form
             * and loads the holiday sublist based on the Subsidiary value
             * @param context script context
             * @param isOW OW identifier
             * @returns void
             */
            addHolidayTab(context, isOW){
                let form = context.form;

                form.addTab({
                    id: HOLIDAY_TAB_ID,
                    label : tcTexts[texts.label.nonopdays]
                });

                let sublistDefinition = this.getSublistDefinition(context, isOW);

                let holidaySublist = form.addSublist({
                    id: sublistDefinition.name,
                    label: sublistDefinition.label,
                    type: sublistDefinition.type,
                    tab: HOLIDAY_TAB_ID
                });

                util.each(sublistDefinition.fields, (fieldObj) => {
                    let field = holidaySublist.addField(fieldObj);

                    if(fieldObj.id === 'jpholidate'){
                        field.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED})
                    }
                });

                let holidays = new holidayDAO().getHolidays();
                let fldDay = sublistDefinition.holidayField;
                let holidayField = holidaySublist.getField({id:fldDay});
                log.debug("holidays", JSON.stringify(holidays));
                holidayField.addSelectOption({ "text": "", "value": 0});

                holidays.map((item)=>{
                    holidayField.addSelectOption({
                        text : item.trans_name || item.name,
                        value : item.id
                    });
                });

                if(isOW){
                    holidayField.isMandatory = true;
                    holidaySublist.updateUniqueFieldId({id:fldDay});
                }

                log.debug({title: "context type", details: context.type });

                if(context.type !== context.UserEventType.CREATE){
                    let subHolidayDao = new subsidiaryHolidayDAO();
                    let savedHolidays = subHolidayDao.getHolidays(context.newRecord.id);

                    for(let j=0; j<savedHolidays.length; j++){

                        holidaySublist.setSublistValue({
                            id: sublistDefinition.fields[0].id,
                            line: j,
                            value: savedHolidays[j].holidayId
                        });

                        holidaySublist.setSublistValue({
                            id: sublistDefinition.fields[1].id,
                            line: j,
                            value: savedHolidays[j].dateValue
                        });
                    }
                }
            };

            addJapanSetupSubtab(context, isOW){
                let form = context.form;
                let rec = context.newRecord;

                form.addTab({
                    id: jp_loc_subtab,
                    label : tcTexts[texts.tab.jptab]
                });

                form.addFieldGroup({
                    id: setting_group_id,
                    label: tcTexts[texts.section.invoicesummary],
                    tab: jp_loc_subtab
                });

                //create copies of the existing fields and put them into the tab.
                //as of this writing we cannot assign a container for a field created in the suite builder.
                let stmtSearchFld = form.getField({id: STATEMENT_SEARCH});

                let fakeStmtSearchFld = form.addField({
                    id: DM_STATEMENT_SEARCH,
                    type : stmtSearchFld.type,
                    label: stmtSearchFld.label,
                    container: setting_group_id
                });

                fakeStmtSearchFld.setHelpText(tcTexts[texts.flh.statementsearch]);

                //populate the fake statement search Field,
                //we would have used the source argument on form.addField (saved search id: -119)
                //but we loose the filtering functionality.
                let statementValue = rec.getValue({fieldId:STATEMENT_SEARCH});
                let fieldOptions = stmtSearchFld.getSelectOptions();

                fakeStmtSearchFld.addSelectOption({text:" ", value:" "});
                fieldOptions.forEach((option) => {
                    let isSelected = (option.value == statementValue);
                    fakeStmtSearchFld.addSelectOption({
                        text: option.text,
                        value: option.value,
                        isSelected: isSelected
                    });
                });

                this.addUIIDSTemplateFields(context);

                //if OW, display AR_DEB_ADJ_ITEM_OW fld and hide AR_DEB_ADJ_ITEM_SI
                //else, hide AR_DEB_ADJ_ITEM_OW and display AR_DEB_ADJ_ITEM_SI
                let AR_DEB_ADJ_ITEM;
                let AR_DEB_ADJ_ITEM_FLD;
                let AR_DEB_ADJ_ITEM_HIDE;
                let AR_DEB_ADJ_ITEM_HIDE_FLD;
                if (runtime.isFeatureInEffect('SUBSIDIARIES')) {
                    AR_DEB_ADJ_ITEM = AR_DEB_ADJ_ITEM_OW;
                    AR_DEB_ADJ_ITEM_HIDE = AR_DEB_ADJ_ITEM_SI;
                } else {
                    AR_DEB_ADJ_ITEM = AR_DEB_ADJ_ITEM_SI;
                    AR_DEB_ADJ_ITEM_HIDE = AR_DEB_ADJ_ITEM_OW;
                }
                AR_DEB_ADJ_ITEM_FLD = form.getField({id: AR_DEB_ADJ_ITEM});
                if (AR_DEB_ADJ_ITEM_FLD) {
                    AR_DEB_ADJ_ITEM_FLD.label = tcTexts[texts.label.ardebadjitem];
                }
                AR_DEB_ADJ_ITEM_HIDE_FLD = form.getField({id: AR_DEB_ADJ_ITEM_HIDE});
                if (AR_DEB_ADJ_ITEM_HIDE_FLD) {
                    AR_DEB_ADJ_ITEM_HIDE_FLD.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
                }

                // Move existing UI fields to JP Localization Setup subtab
                util.each([HOLIDAY_CHECKING, FLD_PRINTOPT, TAX_REG_NUMBER, AR_DEB_ADJ_ITEM], (fieldId)=> {
                    let fieldObj = form.getField({id: fieldId});
                    if (fieldObj) {
                        fieldObj.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.NORMAL
                        });
                        form.insertField({
                            field: fieldObj,
                            nextfield: DM_STATEMENT_SEARCH
                        });
                    }
                });

                let invSumFolder = form.addField({
                    id: FLD_INVSUM_TEXT_FIELD,
                    type: serverWidget.FieldType.TEXT,
                    label: tcTexts[texts.label.isfolderselection],
                    container: setting_group_id
                });
                invSumFolder.setHelpText(tcTexts[texts.flh.isfolderselection]);

                let currInvSumFolder = rec.getValue({fieldId: FLD_INVSUM_FIELD});
                if(currInvSumFolder){
                    let invSumLookup = search.lookupFields({
                        type: search.Type.FOLDER,
                        id: currInvSumFolder,
                        columns: INTERNALID
                    });
                    invSumFolder.defaultValue = invSumLookup[INTERNALID] ? rec.getValue({fieldId: FLD_INVSUM_PATH}) : '';
                }

                //mock field/checkbox, this should be a part of the IS Individual PDF per Customer.
                //added it here since some of the defaulting behavior of the current backlog depends on this.
                let fldIndivPdf = form.addField({
                    type: serverWidget.FieldType.CHECKBOX,
                    id: mock_individual_pdf,
                    label: tcTexts[texts.label.individualpdf],
                    container: setting_group_id
                });

                let defaultVal = (rec.getValue({fieldId: FLD_INDIVCUST})) ? 'T' : 'F';
                fldIndivPdf.setHelpText(tcTexts[texts.flh.individualpdf]);
                fldIndivPdf.defaultValue = defaultVal;

                let fldPdfName = form.addField({
                    type: serverWidget.FieldType.SELECT,
                    id:  pdf_name_options,
                    label : tcTexts[texts.label.pdfname],
                    container : setting_group_id
                });

                let listStore = new ListStore();
                listStore.getFormatSelectOpt(isOW);

                let currentFormat = rec.getValue({fieldId: FLD_PDF_FILEFORMAT});
                let isIndividualCust = rec.getValue({fieldId: FLD_INDIVCUST});
                let selectedFormat = currentFormat;

                if(!currentFormat){
                    selectedFormat = (isIndividualCust) ? listStore.ISPDF_FILE_FORMATS.closingdate_custname :
                        listStore.ISPDF_FILE_FORMATS.is_recordnumber_closingdate;
                }

                selectedFormat = parseInt(selectedFormat);
                listStore.PDF_FORMAT_VALUES.forEach(function(option){
                    option.isSelected = (option.value === selectedFormat);
                    fldPdfName.addSelectOption(option);
                });
                fldPdfName.setHelpText(tcTexts[texts.flh.pdfname]);

                let accPref = new accountingPreferences();
                let dlcFields = [{
                    feature: 'DEPARTMENTS',
                    fldID: mock_dept_fld,
                    label: tcTexts[texts.label.dlc_dept],
                    flh: tcTexts[texts.flh.dlc_dept],
                    getFld: dept_fld,
                    mandatory: accPref.isDeptMandatory(),
                    optionList: (rec.id) ? new departmentDAO().getDepartments(rec.id) : []
                },{
                    feature: 'LOCATIONS',
                    fldID: mock_location_fld,
                    label: tcTexts[texts.label.dlc_location],
                    flh: tcTexts[texts.flh.dlc_location],
                    getFld: location_fld,
                    mandatory: (runtime.isFeatureInEffect('MULTILOCINVT') || accPref.isLocMandatory()),
                    optionList: (rec.id) ? new locationDAO().getLocations(rec.id) : []
                },{
                    feature: 'CLASSES',
                    fldID: mock_class_fld,
                    label: tcTexts[texts.label.dlc_class],
                    flh: tcTexts[texts.flh.dlc_class],
                    getFld: class_fld,
                    mandatory: accPref.isClassMandatory(),
                    optionList: (rec.id) ? new classDAO().getClasses(rec.id) : []
                }];

                dlcFields.forEach(function(dlcField){
                    if (runtime.isFeatureInEffect(dlcField.feature)){
                        let mockFld = form.addField({
                            type: serverWidget.FieldType.SELECT,
                            id:  dlcField.fldID,
                            label : dlcField.label,
                            container : setting_group_id
                        });
                        mockFld.setHelpText(dlcField.flh);
                        if (rec.id){
                            let optionList = [];
                            optionList = dlcField.optionList;
                            mockFld.isMandatory = dlcField.mandatory;
                            let selectedOption = parseInt(rec.getValue({fieldId: dlcField.getFld}));
                            mockFld.addSelectOption({value: '', text: ''});
                            optionList.forEach(option => {
                                let isSelected = (option.id === selectedOption);
                                mockFld.addSelectOption({
                                    value: option.id,
                                    text: option.name,
                                    isSelected: isSelected
                                });
                            });
                        }
                    }
                });

                form.addFieldGroup({
                    id: ponum_group_id,
                    label: tcTexts[texts.section.ponumbering],
                    tab: jp_loc_subtab
                });

                let pofolderfld = form.addField({
                    id: PRINTED_PO_TEXT_FIELD,
                    type : serverWidget.FieldType.TEXT,
                    label: tcTexts[texts.label.folderselection],
                    container: ponum_group_id
                });
                pofolderfld.setHelpText(tcTexts[texts.flh.folderselection]);

                let currPOFolder = rec.getValue({fieldId: PRINTED_PO_FIELD});
                if(currPOFolder){
                    let poFolderLookup = search.lookupFields({
                        type: search.Type.FOLDER,
                        id: currPOFolder,
                        columns: INTERNALID
                    });
                    pofolderfld.defaultValue = poFolderLookup[INTERNALID] ? rec.getValue({fieldId: PRINTED_PO_PATH}) : '';
                }

                form.addFieldGroup({
                    id: pdftemp_group_id,
                    label: tcTexts[texts.section.pdftemplate],
                    tab: jp_loc_subtab
                });

                util.each(customPDFFields, (fieldParam) => {
                    this.initializeCustomPDFDisplayField(context, fieldParam);
                });

                let journalTitleFld = form.getField({ id: PDF_JOURNAL_TITLE_FIELD });
                journalTitleFld.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE });
                let invoiceGreetingFld = form.getField({ id: PDF_INVOICE_GREETING_FIELD });
                invoiceGreetingFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });

                let memoFields = [
                    {field: PDF_MEMO_TITLE, nextfield: PDF_SO_TITLE_FIELD},
                    {field: PDF_MEMO_GREET, nextfield: PDF_SO_GREETING_FIELD}
                ]

                memoFields.forEach((fld)=>{
                    let currFld = form.getField({id: fld.field});
                    form.insertField({field : currFld, nextfield : fld.nextfield});
                    currFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.NORMAL});
                });

                let shownFields = [PDF_BANK_ACCT_INFO_FIELD, PDF_SEAL_INVOICE_FIELD, PDF_SEAL_MEMO,
                    PDF_SEAL_SO_FIELD, PDF_SEAL_PO_FIELD];

                util.each(shownFields, (fieldId) => {
                    let fieldObj = form.getField({ id: fieldId });
                    form.insertField({
                        field: fieldObj,
                        nextfield: PDF_JOURNAL_TITLE_FIELD
                    });
                    fieldObj.updateDisplayType({ displayType: serverWidget.FieldDisplayType.NORMAL });

                    if(fieldId === PDF_BANK_ACCT_INFO_FIELD) {
                        fieldObj.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW });
                    }
                    if(fieldId === PDF_SEAL_INVOICE_FIELD) {
                        fieldObj.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
                    }
                });
            };

            /**
             * Stores the default template.
             *
             * @param context {Object} the scriptContext
             * @returns None
             */
            storeJPValues(context){
                let rec = context.newRecord;
                const actualToMockMap = [
                    {actual: DEFAULT_STD_TPL, mock: UI_STD_IDS_FIELD},
                    {actual: DEFAULT_CON_TPL, mock: UI_CON_IDS_FIELD},
                    {actual: STATEMENT_SEARCH, mock: DM_STATEMENT_SEARCH},
                    {actual: dept_fld, mock: mock_dept_fld},
                    {actual: location_fld, mock: mock_location_fld},
                    {actual: class_fld, mock: mock_class_fld},
                    {actual: FLD_PDF_FILEFORMAT, mock: pdf_name_options}
                ];

                actualToMockMap.forEach((field)=>{
                    rec.setValue({
                        fieldId: field.actual,
                        value: rec.getValue({fieldId: field.mock})
                    });
                });

                new TaxRegValidator().validateTaxRegNumBackEnd(rec);
                let folderDao = new folderDAO();

                // Printed Purchase Orders
                let poFolderPath = rec.getValue({fieldId: PRINTED_PO_TEXT_FIELD});
                let poFolderId = folderDao.doesExist(poFolderPath, PRINTED_PO_FOLDER);
                if(!poFolderId){
                    throw error.create({name: 'PO_FOLDER_ERROR', message: tcTexts[texts.error.pofolder]});
                }
                rec.setValue({
                    fieldId: PRINTED_PO_FIELD,
                    value: poFolderId
                });
                rec.setValue({
                    fieldId: PRINTED_PO_PATH,
                    value: poFolderPath
                });

                // Invoice Summaries
                let invSumFolderPath = rec.getValue({fieldId: FLD_INVSUM_TEXT_FIELD});
                let invSumFolderId = folderDao.doesExist(invSumFolderPath, INVOICE_SUMMARIES_FOLDER);
                if(!invSumFolderId){
                    throw error.create({name: 'IS_FOLDER_ERROR', message: tcTexts[texts.error.invsum]});
                }
                rec.setValue({
                    fieldId: FLD_INVSUM_FIELD,
                    value: invSumFolderId
                });
                rec.setValue({
                    fieldId: FLD_INVSUM_PATH,
                    value: invSumFolderPath
                });

                log.debug({title: mock_individual_pdf, details: rec.getValue({fieldId: mock_individual_pdf})});
                rec.setValue({
                    fieldId: FLD_INDIVCUST,
                    value: (rec.getValue({fieldId: mock_individual_pdf}) == 'T' )
                });

                // Custom Advanced PDF Template
                util.each(customPDFFields, (fieldParam) => {
                    let currentValue = rec.getValue({fieldId: fieldParam.id});
                    rec.setValue({
                        fieldId: fieldParam.store,
                        value: currentValue
                    })
                });
            };

            /**
             * Creates the sublist definition to pass into the constructor based on whether account is OW or SI
             *
             * @param context {Object} the scriptContext
             * @param isOW {boolean} true if OW else false
             * @returns Object returns the object definition.
             */
            getSublistDefinition(context, isOW){
                let fldDay, type, lblHoliday;
                let jpholidate = 'jpholidate';
                let SUBLIST_ID = 'custpage_suitel10n_jp_non_op_days_sublist';

                let SUBLIST_NAME = tcTexts[texts.sublist.sublistname] || 'List of Days';

                if(isOW){
                    fldDay = 'day';
                    lblHoliday = tcTexts[texts.label.nonopname] || 'Holiday';
                    type = 'inlineeditor';
                }
                else{
                    fldDay = 'trans_name';
                    lblHoliday = tcTexts[texts.label.nonopname] || 'Name';
                    type = 'staticlist';
                }

                return  {
                    'form': context.form,
                    'name': SUBLIST_ID,
                    'label': SUBLIST_NAME,
                    'fields': [
                        {
                            'id': fldDay,
                            'label': lblHoliday,
                            'type': 'select'
                        },

                        {
                            'id': jpholidate,
                            'label': tcTexts[texts.label.holidaydate],
                            'type': serverWidget.FieldType.TEXT
                        }],
                    'holidayField': fldDay,
                    'type': type,
                    'tabOrGroup': HOLIDAY_TAB_ID
                };
            }

            /**
             * Copies value from store field to the displayed field
             * Sets default value if store is blank and user is editing
             *
             * @param context {Object} subsidiary UE script context
             * @param fldParam {Object} field parameters related to the store and displayed field
             */
             setFldValFromStore(context, fldParam) {
                let recordContext = context.newRecord;
                let storeValue = recordContext.getValue({ fieldId: fldParam.store });
                if(!storeValue && context.type === context.UserEventType.EDIT) {
                    storeValue = fldParam.defaultValue;
                }

                recordContext.setValue({
                    fieldId: fldParam.id,
                    value: storeValue
                });
            }

            /**
             * Creates the custom PDF displayed field with value from the store field
             *
             * @param context {Object} subsidiary UE script context
             * @param fldParam {Object} field parameters related to the store and displayed field
             */
             initializeCustomPDFDisplayField(context, fldParam) {
                this.addCustomPDFField(context.form,
                    fldParam.id,
                    fldParam.source,
                    texts.label[fldParam.text], texts.flh[fldParam.text]);
                this.setFldValFromStore(context, fldParam);
            }

            /**
             * Adds select field with help text under custom pdf field group
             *
             * @param form {Object} form context
             * @param id {string} field id
             * @param source {string} customlist internal id used as source for the field
             * @param label {string} translated label string
             * @param help {string} translated flh string
             */
            addCustomPDFField(form, id, source, label, help){
                let params = {
                    id: id,
                    type: serverWidget.FieldType.SELECT,
                    source: source,
                    label: tcTexts[label],
                    container: pdftemp_group_id
                };
                let fieldObj = form.addField(params);
                fieldObj.setHelpText(tcTexts[help]);
            }
        }

        return SubsidiaryUI;
    });
