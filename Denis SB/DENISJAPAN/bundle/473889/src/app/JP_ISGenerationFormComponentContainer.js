/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
        "../lib/JP_SearchIterator",
        "../data/JP_SavedSearchDAO",
        "../data/JP_CompanyDAO",
        "../data/JP_SubsidiaryDAO",
        "../data/JP_FileDAO",
        "N/ui/serverWidget",
        "N/runtime",
        "N/search",
        "../app/JP_ISGenerationResultValuesHandler",
        "../lib/JP_TCTranslator"],
    (
        SearchIterator,
        SavedSearchDAO,
        CompDAO,
        subDAO,
        fileDAO,
        serverWidget,
        runtime,
        search,
        ISGenerationResultValuesHandler,
        translator)=> {
        let requestValues;

        let GENERATIONPAGE = "IDS_LABEL_IDS_GENERATATION_PAGE";
        let SEARCHBUTTON = "IDS_LABEL_SEARCH_BUTTON";
        let GENERATEBUTTON = "IDS_LABEL_GENERATE_BUTTON";
        let FILTERGROUP = "IDS_LABEL_FILTERGROUP";
        let SUBSIDIARY = "IDS_LABEL_FILTER_SUBSIDIARY";
        let SUBSIDIARYHELP = "IDS_LABEL_FILTER_SUBSIDIARY_HELP";
        let CUSTOMER = "IDS_LABEL_FILTER_CUSTOMER";
        let CUSTOMERHELP = "IDS_LABEL_FILTER_CUSTOMER_HELP";
        let CUSTOMERSAVEDSEARCH = "IDS_LABEL_FILTER_CUSTOMERSAVEDSEARCH";
        let CUSTOMERSAVEDSEARCHHELP = "IDS_LABEL_FILTER_CUSTOMERSAVEDSEARCH_HELP";
        let EDIT = "IDS_LABEL_LINK_EDIT";
        let PREVIEW = "IDS_LABEL_LINK_PREVIEW";
        let INCNOTRANS = "IDS_LABEL_FILTER_INC_NO_TRANS";
        let INCNOTRANSHELP = "IDS_LABEL_FILTER_INC_NO_TRANS_HELP";
        let CLOSINGDATE = "IDS_LABEL_FILTER_CLOSING_DATE";
        let CLOSINGDATEHELP = "IDS_LABEL_FILTER_CLOSING_DATE_HELP";
        let OVERDUE = "IDS_LABEL_FILTER_INC_OVERDUE";
        let OVERDUEHELP = "IDS_LABEL_FILTER_INC_OVERDUE_HELP";
        let CONSOLIDATED = "IDS_LABEL_FILTER_CONSOLIDATED";
        let CONSOLIDATEDHELP = "IDS_LABEL_FILTER_CONSOLIDATED_HELP";
        let STATEMENTDATE = "IDS_LABEL_DOC_STATEMENT_DATE";
        let STATEMENTDATEHELP = "IDS_LABEL_DOC_STATEMENT_DATE_HELP";
        let STATEMENTTEMPLATE = "SUBSIDIARY_LABEL_DEFAULT_TEMPLATE";
        let STATEMENTTMPHELP = "IS_FLH_TEMPLATEFLD_STANDARD";
        let CRITERIABUTTON = "IDS_LABEL_RETURN_TO_CRITERIA_BUTTON";
        let OUTSTANDINGJOBS = "IDS_LABEL_VIEW_OUTSTANDING_JOBS";
        let SUBLISTLABEL = "IDS_LABEL_IDS_SULIST_LABEL";
        let SUBLISTNAME = "IDS_LABEL_IDS_SULIST_NAME";
        let PREVIOUSBALANCE = "IDS_LABEL_IDS_SULIST_PREVIOUS_BALANCE";
        let PAYMENTSRECEIVED = "IDS_LABEL_IDS_SULIST_PAYMENTS_RECEIVED";
        let INVOICECOUNT = "IDS_LABEL_IDS_SULIST_INVOICE_COUNT";
        let SOCOUNT = "IDS_LABEL_IDS_SULIST_SO_COUNT";
        let CMCOUNT = "IDS_LABEL_IDS_SULIST_CM_COUNT";
        let OR = "IDS_LABEL_OR";
        let DOCUMENTGROUP = "IDS_LABEL_DOCUMENTGROUP";
        let DEFAULT_STD_XML_TEMPLATE = "default_template.xml";
        let DEFAULT_CON_XML_TEMPLATE = "consolidated_default_template.xml";

         class JP_ISGenerationFormComponentContainer{

            constructor(reqValues) {
                this.strings = new translator().getTexts([
                    GENERATIONPAGE,
                    SEARCHBUTTON,
                    GENERATEBUTTON,
                    FILTERGROUP,
                    SUBSIDIARY,
                    SUBSIDIARYHELP,
                    CUSTOMER,
                    CUSTOMERHELP,
                    CUSTOMERSAVEDSEARCH,
                    CUSTOMERSAVEDSEARCHHELP,
                    EDIT,
                    PREVIEW,
                    INCNOTRANS,
                    INCNOTRANSHELP,
                    CLOSINGDATE,
                    CLOSINGDATEHELP,
                    OVERDUE,
                    OVERDUEHELP,
                    CONSOLIDATED,
                    CONSOLIDATEDHELP,
                    STATEMENTDATE,
                    STATEMENTDATEHELP,
                    STATEMENTTEMPLATE,
                    STATEMENTTMPHELP,
                    CRITERIABUTTON,
                    OUTSTANDINGJOBS,
                    SUBLISTLABEL,
                    SUBLISTNAME,
                    PREVIOUSBALANCE,
                    PAYMENTSRECEIVED,
                    INVOICECOUNT,
                    SOCOUNT,
                    CMCOUNT,
                    OR,
                    DOCUMENTGROUP
                ], true);

                requestValues = reqValues;
            }

             /* FORM TITLE */
             getSearchFormTitle(){
                 return this.strings[GENERATIONPAGE];
             };

             /* SEARCH submit button */
             getSearchFormSubmitButton(){
                 return { label : this.strings[SEARCHBUTTON]};
             };

             /* GENERATE submit button */
             getGenerateISSubmitButton(){
                 return { label : this.strings[GENERATEBUTTON]};
             };

             /* CLIENT SCRIPT */
             getClientScript() {
                 return '../comp/cs/JP_ISGenerationFormCS.js';
             };

             /* FILTER fields */
             getFilterFieldSets(){

                 let fieldDefinitions = [];

                 /* SUBSIDIARY field */
                 if(this.isOW()){

                     let subsidiaryFieldGroup = {
                         id : "subsidiaryFilters",
                         label : this.strings[FILTERGROUP]
                     };

                     let subsidiaryDefault = requestValues.subsidiary ?
                         requestValues.subsidiary :
                         search.lookupFields({
                             type : search.Type.EMPLOYEE,
                             id : runtime.getCurrentUser().id,
                             columns : 'subsidiary'
                         }).subsidiary[0].value;

                     let subsidiaryFields = [];
                     let subsidiaryField = {
                         id : "custpage_subsidiary_filter",
                         type : serverWidget.FieldType.SELECT,
                         label : this.strings[SUBSIDIARY],
                         source : "subsidiary",
                         container : "subsidiaryFilters",
                         help: this.strings[SUBSIDIARYHELP],
                         isMandatory: true,
                         displayType : serverWidget.FieldDisplayType.NORMAL,
                         defaultValue: subsidiaryDefault
                     };
                     subsidiaryFields.push(subsidiaryField);

                     let subsidiaryFieldsDefinition = {
                         fieldGroup: subsidiaryFieldGroup,
                         fields: subsidiaryFields
                     };
                     fieldDefinitions.push(subsidiaryFieldsDefinition);
                 }

                 /* CUSTOMER fields */
                 let customerFieldGroup = {
                     id : "customerFilters",
                     label : this.isOW() ? " " : this.strings[FILTERGROUP]
                 };
                 let customerFields = [];

                 let customerField = {
                     id : "custpage_customer_filter",
                     type : serverWidget.FieldType.SELECT,
                     label : this.strings[CUSTOMER],
                     source : "customer",
                     container : "customerFilters",
                     help: this.strings[CUSTOMERHELP],
                     displayType : serverWidget.FieldDisplayType.NORMAL,
                     defaultValue: requestValues.customer
                 };
                 customerFields.push(customerField);

                 let orField = {
                     id : "custpage_or_field",
                     type : serverWidget.FieldType.TEXT,
                     label : " ",
                     container : "customerFilters",
                     displayType : serverWidget.FieldDisplayType.INLINE,
                     defaultValue : "<span style=\"display: inline-block; margin-top: 10px; color: gray\">"+
                         this.strings[OR]+"</span>"
                 };
                 customerFields.push(orField);

                 let customerSavedSearchField = {
                     id : "custpage_customer_savedsearch_filter",
                     type : serverWidget.FieldType.SELECT,
                     label : this.strings[CUSTOMERSAVEDSEARCH],
                     container : "customerFilters",
                     help: this.strings[CUSTOMERSAVEDSEARCHHELP],
                     displayType : serverWidget.FieldDisplayType.NORMAL,
                     options : this.populateCustomerSavedSearchField(requestValues.customerSavedSearch)
                 };
                 customerFields.push(customerSavedSearchField);

                 let editPreviewSavedSearch = {
                     id : "custpage_customer_editprev_savedsearch",
                     type : serverWidget.FieldType.TEXT,
                     label : " ",
                     container : "customerFilters",
                     displayType : serverWidget.FieldDisplayType.INLINE,
                     defaultValue : "<span style=\"color: gray\">" + this.strings[EDIT]  + " "
                         + this.strings[PREVIEW] + "</span>"
                 };
                 customerFields.push(editPreviewSavedSearch);

                 let consolidatedISField = {
                     id : "custpage_consolidated_filter",
                     type : serverWidget.FieldType.CHECKBOX,
                     label : this.strings[CONSOLIDATED],
                     container : "customerFilters",
                     help: this.strings[CONSOLIDATEDHELP],
                     displayType : serverWidget.FieldDisplayType.NORMAL,
                     defaultValue: requestValues.consolidated,
                     breakType: serverWidget.FieldBreakType.STARTCOL
                 };
                 customerFields.push(consolidatedISField);

                 let noTransactionField = {
                     id : "custpage_notransaction_filter",
                     type : serverWidget.FieldType.CHECKBOX,
                     label : this.strings[INCNOTRANS],
                     container : "customerFilters",
                     help: this.strings[INCNOTRANSHELP],
                     displayType : serverWidget.FieldDisplayType.NORMAL,
                     defaultValue: requestValues.noTransaction
                 };

                 customerFields.push(noTransactionField);

                 //hidden field to retain the hierarchy id in between pages, specially when posting to itself.
                 let hierarchyField = {
                     id : "custpage_hierarchyid",
                     type : serverWidget.FieldType.INTEGER,
                     label : "Hierarchy Id", //for internal use no need to translate
                     container : "customerFilters",
                     help: "Contains the reference of the hierarchy id created when search was clicked.",
                     displayType : serverWidget.FieldDisplayType.HIDDEN,
                     defaultValue: (requestValues.hierarchyId) ? requestValues.hierarchyId : ''
                 };

                 customerFields.push(hierarchyField);

                 let customerFieldsDefinition = {
                     fieldGroup: customerFieldGroup,
                     fields: customerFields
                 };
                 fieldDefinitions.push(customerFieldsDefinition);

                 /* DATE fields */

                 let dateFieldGroup = {
                     id : "dateFilters",
                     label : " "
                 };
                 let dateFields = [];

                 let closingDateField = {
                     id : "custpage_closingdate_filter",
                     type : serverWidget.FieldType.DATE,
                     label : this.strings[CLOSINGDATE],
                     container : "dateFilters",
                     help: this.strings[CLOSINGDATEHELP],
                     isMandatory: true,
                     displayType : serverWidget.FieldDisplayType.NORMAL,
                     defaultValue: requestValues.closingDate
                 };
                 dateFields.push(closingDateField);

                 let includeOverdueField = {
                     id : "custpage_overdue_filter",
                     type : serverWidget.FieldType.CHECKBOX,
                     label : this.strings[OVERDUE],
                     container : "dateFilters",
                     help: this.strings[OVERDUEHELP],
                     displayType : serverWidget.FieldDisplayType.NORMAL,
                     defaultValue: requestValues.overdue,
                     breakType: serverWidget.FieldBreakType.STARTCOL
                 };
                 dateFields.push(includeOverdueField);

                 let dateFieldsDefinition = {
                     fieldGroup: dateFieldGroup,
                     fields: dateFields
                 };
                 fieldDefinitions.push(dateFieldsDefinition);

                 return fieldDefinitions;
             };

             /* DOCUMENT fields */
             getDocumentFieldSet(){
                 let fields = [];

                 let fieldGroup = {
                     id : "documentfields",
                     label : this.strings[DOCUMENTGROUP]
                 };

                 let statementDateField = {
                     id : "custpage_statementdate",
                     type : serverWidget.FieldType.DATE,
                     label : this.strings[STATEMENTDATE],
                     container : "documentfields",
                     help: this.strings[STATEMENTDATEHELP],
                     isMandatory: true,
                     displayType : serverWidget.FieldDisplayType.NORMAL,
                     defaultValue: requestValues.closingDate
                 };
                 fields.push(statementDateField);

                 let selectedTemplate = (requestValues.template != "") ? requestValues.template : null;
                 let isConsolidated = requestValues.consolidated && requestValues.consolidated === 'T';

                 if (this.isOW()) {
                     let subsidiaryDisplayField = {
                         id : "custpage_subsidiarydisplay",
                         type : serverWidget.FieldType.SELECT,
                         label : this.strings[SUBSIDIARY],
                         source: "subsidiary",
                         container : "documentfields",
                         help: this.strings[SUBSIDIARYHELP],
                         isMandatory: false,
                         displayType : serverWidget.FieldDisplayType.INLINE,
                         defaultValue: requestValues.subsidiary
                     };
                     fields.push(subsidiaryDisplayField);

                     let subAttributes = new subDAO().getAttributes(requestValues.subsidiary);
                     let subsidiaryStdTemplate = subAttributes ? subAttributes.standardtemplate : null;
                     let subsidiaryConTemplate = subAttributes ? subAttributes.consolidatedtemplate : null;
                     if(!selectedTemplate){
                         selectedTemplate = isConsolidated ? subsidiaryConTemplate : subsidiaryStdTemplate;
                     }
                 }
                 else {
                     let compAttributes = new CompDAO().getAttributes(requestValues.subsidiary);
                     let companyStdTemplate = compAttributes ? compAttributes.standardtemplate : null;
                     let companyConTemplate = compAttributes ? compAttributes.consolidatedtemplate : null;
                     if(!selectedTemplate){
                         selectedTemplate = isConsolidated ? companyConTemplate: companyStdTemplate;
                     }
                 }

                 //applicable to both SI and OW.
                 let templates = new fileDAO().getStatementTemplates().map(function(temp){
                     return {
                         value : temp.id,
                         text : temp.name,
                         isSelected : (
                             selectedTemplate && selectedTemplate === temp.id ||
                             !selectedTemplate && isConsolidated && temp.name === DEFAULT_CON_XML_TEMPLATE ||
                             !selectedTemplate && !isConsolidated && temp.name === DEFAULT_STD_XML_TEMPLATE
                         )
                     }
                 });

                 let templateField = {
                     id: 'custpage_template',
                     type : serverWidget.FieldType.SELECT,
                     label: this.strings[STATEMENTTEMPLATE],
                     container: "documentfields",
                     help: this.strings[STATEMENTTMPHELP],
                     isMandatory: true,
                     displayType: serverWidget.FieldDisplayType.NORMAL,
                     options: templates
                 };

                 fields.push(templateField);

                 return {
                     fieldGroup: fieldGroup,
                     fields: fields
                 };
             };


             /* RETURN TO CRITERIA button */
             getReturnToSearchButton(){
                 return {
                     id : "return_to_criteria",
                     label : this.strings[CRITERIABUTTON],
                     functionName: "returnToSearch("+JSON.stringify(requestValues)+")"
                 }
             };

             /* VIEW OUTSTANDING JOBS button */
             getViewOutstandingJobsButton(){
                 return {
                     id : "view_outstanding_jobs",
                     label : this.strings[OUTSTANDINGJOBS],
                     functionName: "viewOutstandingJobs"
                 }
             };

             /* CUSTOMER RESULT sublist */
             getCustomerResultSublist(){

                 let sublistFields = [];

                 let customerName = {
                     id: "customer",
                     type: serverWidget.FieldType.TEXT,
                     label: "<span style=\"float: right\">"+this.strings[SUBLISTNAME]+"</span>",
                     displayType: "inline"
                 };
                 sublistFields.push(customerName);

                 let previousBalance = {
                     id: "previous_balance",
                     type: serverWidget.FieldType.TEXT,
                     label: "<span style=\"float: right\">"+this.strings[PREVIOUSBALANCE]+"</span>",
                     displayType: "inline",
                 };
                 sublistFields.push(previousBalance);

                 let paymentReceived = {
                     id: "payments_received",
                     type: serverWidget.FieldType.TEXT,
                     label: "<span style=\"float: right\">"+this.strings[PAYMENTSRECEIVED]+"</span>",
                     displayType: "inline"
                 };
                 sublistFields.push(paymentReceived);

                 let invAmount = {
                     id: "invoice_amount",
                     type: serverWidget.FieldType.TEXTAREA,
                     label: "<span style=\"float: right\">"+this.strings[INVOICECOUNT]+"</span>"
                 };
                 sublistFields.push(invAmount);

                 let soAmount = {
                     id: "sales_order_amount",
                     type: serverWidget.FieldType.TEXTAREA,
                     label: "<span style=\"float: right\">"+this.strings[SOCOUNT]+"</span>"
                 };
                 sublistFields.push(soAmount);

                 let cmAmount = {
                     id: "credit_memo_amount",
                     type: serverWidget.FieldType.TEXTAREA,
                     label: "<span style=\"float: right\">"+this.strings[CMCOUNT]+"</span>"
                 };
                 sublistFields.push(cmAmount);

                 let sublistValues = this.getCustomerResultSublistValues(requestValues);

                 return {
                     id : 'customer_result',
                     type : serverWidget.SublistType.STATICLIST,
                     label : this.strings[SUBLISTLABEL],
                     sublistFields : sublistFields,
                     sublistValues: sublistValues
                 }
             };

             getCustomerResultSublistValues(reqValues) {
                 let values = [];
                 let sublistValuesHandler = new ISGenerationResultValuesHandler(reqValues);
                 let customerResults = sublistValuesHandler.getValues();

                 for (let i = 0; i < customerResults.length; i++) {
                     let result = customerResults[i];

                     for (let key in result) {
                         let fieldValue = {
                             id: key,
                             line: i,
                             value: result[key]
                         };
                         values.push(fieldValue);
                     }
                 }

                 return values;
             }

             populateCustomerSavedSearchField(savedSearchParam){
                 let hasSavedSearchParameter = (typeof savedSearchParam !== 'undefined');
                 let customerSavedSearchOptions = [{value:'',text:''}];
                 let savedSearches = new SavedSearchDAO().getSavedSearches('Customer');

                 for(let i in savedSearches){
                     let savedSearch = savedSearches[i];
                     let title = savedSearch.getValue('title');
                     let internalId = savedSearch.id;
                     let isSelected = hasSavedSearchParameter && (internalId === savedSearchParam);
                     customerSavedSearchOptions.push({value:internalId,text:title,isSelected:isSelected});
                 }
                 return customerSavedSearchOptions;
             }

             /**
              * Check if account is OneWorld
              *
              * @returns {Boolean} Return true if OW, false if SI
              */
             isOW() {
                 return runtime.isFeatureInEffect({
                     feature: "SUBSIDIARIES"
                 });
             }
        }

        return JP_ISGenerationFormComponentContainer;

    });
