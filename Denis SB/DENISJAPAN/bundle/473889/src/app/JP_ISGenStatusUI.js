 /**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
        '../data/JP_InvoiceSummaryRequestDAO',
        '../data/JP_SavedSearchDAO',
        '../data/JP_FileDAO',
        '../lib/JP_FormBuilder',
        '../lib/JP_StringUtility',
        'N/ui/serverWidget',
        'N/runtime',
        'N/format',
        'N/ui/message',
        '../lib/JP_TCTranslator'
    ],

(requestDAO, SavedSearchDAO,
         FileDAO, Builder, StringUtility,
         serverWidget, runtime, format, message, translator) => {

    const CLOSING_DATE_ID = 'custrecord_jp_loc_gen_req_cd';

    const OWNER_FORM = 'custpage_jp_owner';
    const DATECREATED_FORM = 'custpage_date_created';
    const CLOSING_DATE_FORM = 'custpage_jp_closing_date';
    const SUBSIDIARY_FORM = 'custpage_jp_subsidiary';
    const CUSTOMER_FORM = 'custpage_jp_customer';
    const CUSTOMER_SAVED_SEARCH_FORM = 'custpage_jp_customer_saved_search';
    const NO_TRANS_FORM = 'custpage_jp_no_trans';
    const OVERDUE_FORM = 'custpage_jp_overdue';
    const GEN_PARAMS_FORM = 'custpage_jp_template';
    const STATUS_FORM = 'custpage_jp_status';
    const REFRESH_FORM = 'custpage_jp_refresh';
    const ACTION_FORM = 'custpage_jp_action';

    const OWNER_TITLE = 'IDS_LABEL_FILTER_OWNER';
    const DATECREATED_TITLE = 'IDS_LABEL_FILTER_CREATED';
    const CLOSING_DATE_TITLE = 'IDS_LABEL_FILTER_CLOSING_DATE';
    const SUBSIDIARY_TITLE = 'IDS_LABEL_FILTER_SUBSIDIARY';
    const CUSTOMER_TITLE = 'IDS_LABEL_FILTER_CUSTOMER';
    const CUSTOMER_SAVED_SEARCH_TITLE = 'IDS_LABEL_FILTER_CUSTOMERSAVEDSEARCH';
    const NO_TRANS_TITLE = 'IDS_GENERATIONSTATUS_INC_NO_TRANS';
    const OVERDUE_TITLE = 'IDS_LABEL_FILTER_INC_OVERDUE';
    const TEMPLATE_TITLE = 'IDS_LABEL_FILTER_TEMPLATE';
    const STATUS_TITLE = 'IDS_LABEL_FILTER_STATUS';
    const ACTION_TITLE = 'IDS_GENERATIONSTATUS_ACTION';
    const REFRESH_BUTTON = 'IDS_GENERATIONSTATUS_REFRESH';
    const REFRESH_FN = 'refresh';
    const FIELDGROUPLABEL = 'STATUS_FILTERS';
    const FILTERLABEL = "LBL_ISGENSTATUS";
    const OPT_ALL = 'OPT_ISGENSTATUSALL';
    const OPT_QUEUED = 'OPT_ISGENSTATUSQUEUED';
    const OPT_INVALID = 'OPT_ISGENSTATUSINVALID';
    const OPT_ERROR = 'OPT_ISGENSTATUSERR';
    const FILTERHELP = 'ISFILTERHELP';

    const IS_GEN_STATUS_TITLE = 'IDS_GENERATIONSTATUS_TITLE';
    const IS_GEN_STATUS_RECORD = 'IDS_GENERATIONSTATUS_RECORD';
    const YES = 'IDS_LABEL_YES';
    const NO = 'IDS_LABEL_NO';

    const ERROR = 1;
    const QUEUED = 2;
    const INVALID = 4;

    const filterLookup = {
        0 : [ERROR, QUEUED, INVALID],
        1 : [ERROR],
        2 : [QUEUED],
        4 : [INVALID]
    };

    const FIELDS_LOOKUP = {};

    const BTN_REGEN = 'custpage_jp_regenerate';
    const BTN_DELETE = 'custpage_jp_delete';
    const BTN_BACK_TO_SEARCH = 'custpage_jp_back_to_search_form';

    const BTN_REGEN_LABEL = "IDS_GENERATIONSTATUS_RERUN_STUCK";
    const BTN_BACK_TO_SEARCH_LABEL = "IDS_LABEL_BACK_TO_GEN_INV_SUMMARY";
    const STATUS_INFO_TITLE = "IDS_GENERATIONSTATUS_INFO_TITLE";
    const STATUS_INFO_MESSAGE = "IDS_GENERATIONSTATUS_INFO_MESSAGE";
    const LINK_DELETE = "IDS_GENERATIONSTATUS_DELETE";
    const BTN_DELETE_LABEL = "IDS_GENERATIONSTATUS_DELETE_BTN";
    const ACTION_ROW = 'action_row';

    const FAILED_STATUSES = [ERROR, INVALID];

    const TIMEOUT = 21600000; //six hours in milliseconds.

    const BUTTONS = {};

    BUTTONS[REFRESH_FORM] = {label:REFRESH_BUTTON, function:REFRESH_FN};
    BUTTONS[BTN_BACK_TO_SEARCH] = {label: BTN_BACK_TO_SEARCH_LABEL, function: 'returnToSearchForm'};
    BUTTONS[BTN_REGEN] = {label: BTN_REGEN_LABEL, function: 'rerunStuckBatches'};
    BUTTONS[BTN_DELETE] = {label: BTN_DELETE_LABEL, function: 'deleteAllFailedJobs'};

    let stuck, failed;
    let requestDao, fields;
    let texts;

    /**
     *  -5 => super admin
     *  3  => administrator (hidden and non customizable)
     */
    const adminIds = [-5, 3];

    class ISGenStatusUI {

        constructor() {
            this.name = 'JP_ISGenStatusUI';
            this.buttons = {
                refresh : REFRESH_FORM,
                rerun: BTN_REGEN,
                returnToSearch: BTN_BACK_TO_SEARCH,
                deleteFail: BTN_DELETE
            }
            texts = new translator().getTexts([
                OWNER_TITLE,
                DATECREATED_TITLE,
                CLOSING_DATE_TITLE,
                SUBSIDIARY_TITLE,
                CUSTOMER_TITLE,
                CUSTOMER_SAVED_SEARCH_TITLE,
                NO_TRANS_TITLE,
                OVERDUE_TITLE,
                TEMPLATE_TITLE,
                STATUS_TITLE,
                ACTION_TITLE,
                REFRESH_BUTTON,
                IS_GEN_STATUS_TITLE,
                IS_GEN_STATUS_RECORD,
                BTN_REGEN_LABEL,
                BTN_BACK_TO_SEARCH_LABEL,
                STATUS_INFO_TITLE,
                STATUS_INFO_MESSAGE,
                LINK_DELETE,
                BTN_DELETE_LABEL,
                YES, NO,
                FIELDGROUPLABEL,
                FILTERLABEL,
                OPT_ALL, OPT_QUEUED, OPT_INVALID, OPT_ERROR,
                FILTERHELP
            ], true);
            stuck = false;
            failed = false;

            this.selectOptions = [
                {value: 0, text: texts[OPT_ALL]},
                {value: 1, text: texts[OPT_ERROR]},
                {value: 2, text: texts[OPT_QUEUED]},
                {value: 4, text: texts[OPT_INVALID]}
            ];
        }

        /**
         * Generate the serverWidget form given field definitions and field values
         *
         * @param isRerun {boolean} true if rerun stuck batches was pressed.
         * @param settings {Object} Contains sort and display filters
         * @returns {serverWidget.form} Form created from fields and field values
         */
        buildUI(isRerun, settings ){

            message.create({
                title: texts[STATUS_INFO_TITLE],
                message: texts[STATUS_INFO_MESSAGE],
                type: message.Type.INFORMATION
            }).show({sendToClient : true});

            requestDao = new requestDAO();
            fields = requestDao.fields;

            //we reuse the fields in batch dao to avoid declaring the same variables twice.
            FIELDS_LOOKUP[fields.owner] = {formId:OWNER_FORM, label:OWNER_TITLE};
            FIELDS_LOOKUP[fields.dateCreated] = {formId:DATECREATED_FORM, label:DATECREATED_TITLE};
            FIELDS_LOOKUP[fields.closingDate] = {formId:CLOSING_DATE_FORM, label:CLOSING_DATE_TITLE};
            FIELDS_LOOKUP[fields.subsidiary] = {formId:SUBSIDIARY_FORM, label:SUBSIDIARY_TITLE};
            FIELDS_LOOKUP[fields.customerFilter] = {formId:CUSTOMER_FORM, label:CUSTOMER_TITLE};
            FIELDS_LOOKUP[fields.customerSavedSearch] = {formId:CUSTOMER_SAVED_SEARCH_FORM,
                label:CUSTOMER_SAVED_SEARCH_TITLE};
            FIELDS_LOOKUP[fields.includeNoTransaction] = {formId:NO_TRANS_FORM, label:NO_TRANS_TITLE};
            FIELDS_LOOKUP[fields.includeOverdue] = {formId:OVERDUE_FORM, label:OVERDUE_TITLE};
            FIELDS_LOOKUP[fields.generationParameters] = {formId:GEN_PARAMS_FORM, label:TEMPLATE_TITLE};
            FIELDS_LOOKUP[fields.status] = {formId:STATUS_FORM, label:STATUS_TITLE};
            FIELDS_LOOKUP[ACTION_ROW] = {formId:ACTION_FORM, label:ACTION_TITLE}

            const fieldgroupId = "isgenstatusfilter";

            this.selectOptions.forEach((option) =>{
                if(option.value == settings.filter){
                    option.isSelected = true;
                }
            });

            let formDef = {
                formTitle: texts[IS_GEN_STATUS_TITLE],
                sublists: [{
                    id : 'sublist',
                    type : serverWidget.SublistType.STATICLIST,
                    label : texts[IS_GEN_STATUS_RECORD],
                    sublistFields: getFieldDefinitions(),
                    sublistValues: getFieldValues(settings)
                }],
                fieldSets : [{
                    fieldGroup : {
                        id : fieldgroupId,
                        label : texts[FIELDGROUPLABEL]
                    },
                    fields : [{
                        id : 'custpage_statusfilter',
                        type : serverWidget.FieldType.SELECT,
                        label : texts[FILTERLABEL],
                        container : fieldgroupId,
                        options : this.selectOptions,
                        help: texts[FILTERHELP]
                    }]
                }],
                buttons: getPageButtons(),
                clientScript: "../comp/cs/JP_ISGenStatusCS.js"
            };

            let form = new Builder().buildForm(formDef);

            /**
             * ___________________________________
             * | stuck | rerun | Button Disabled |
             * ===================================
             * |   T   |   F   |      F          |
             * ===================================
             * |   T   |   T   |      T          |
             * ===================================
             * |   F   |   T   |      T          |
             * ===================================
             * |  F    |   F   |      T          |
             * ==================================
             * if isAdmin == false regen button is always disabled  regardless of the value of stuck & rerun
             */

            let isAdmin = (adminIds.indexOf(runtime.getCurrentUser().role) > -1);
            form.getButton({id: BTN_REGEN}).isDisabled = !(stuck && !isRerun && isAdmin);
            form.getButton({id: BTN_DELETE}).isDisabled = !(isAdmin && failed) ;

            return form;
        }

    }

    /**
     * Retrieve buttons to be displayed in the IS Generation Status SU
     *
     * @returns {array} Array of serverWidget button
     */
    function getPageButtons(){
        let buttons = [];
        for(let [button, value] of Object.entries(BUTTONS)){
            buttons.push({
                id: button,
                label: texts[value.label],
                functionName: value.function
            })
        }
        return buttons;
    }

    /**
     * Retrieve fields to be displayed in the IS Generation Status SU
     *
     * @returns {array} Array of serverWidget field components
     */
    function getFieldDefinitions(){

        let fieldDefs = [];

        for(let [field, value] of Object.entries(FIELDS_LOOKUP)){
            if(!runtime.isFeatureInEffect({feature: 'SUBSIDIARIES'}) && field === fields.subsidiary){continue;}
            fieldDefs.push({
                id: value.formId,
                label: texts[value.label],
                type: serverWidget.FieldType.TEXT
            })
        }
        return fieldDefs;
    }

    /**
     * Retrieve field values for the IS Generation Status SU
     *
     * @param settings {Object} Contains sort and display filter
     * @returns {array} Array of key-value pairs of form field ID and form field values
     */
    function getFieldValues(settings){

        let statusFilter = filterLookup[settings.filter] ? filterLookup[settings.filter] : filterLookup[0];
        let searchArgs = {
            sortBy: CLOSING_DATE_ID,
            statusFilter : statusFilter
        };

        // Gen params are truncated at 250, template is retrieved using saved search
        let requestData = new requestDAO().getRequestData(searchArgs);
        let statementTemplates = new FileDAO().getStatementTemplates();
        let templateLookup = {};
        for(const template of statementTemplates){
            templateLookup[template.id] = template.name
        }
        // As of 20.2, saved searches cannot be joined with using N/query
        let savedSearches = new SavedSearchDAO().getSavedSearches('Customer');
        let customerSavedSearchLookup = {};
        for(const savedSearch of savedSearches){
            customerSavedSearchLookup[savedSearch.id] = savedSearch.getValue({name:'title'});
        }

        let fieldValues = [];
        for(let i in requestData){
            let statusValue = requestData[i][fields.status] ?
                parseInt(requestData[i][fields.status]["value"]) : undefined;
            if(!stuck && requestData[i][fields.lastRequestRun]){

                let createTime = format.parse({
                    value: requestData[i][fields.lastRequestRun],
                    type: format.Type.DATETIME
                }).getTime();
                let currentTime = new Date().getTime();
                stuck = ( ( currentTime - createTime > TIMEOUT ) && statusValue === QUEUED );
            }

            let isAdmin = (adminIds.indexOf(runtime.getCurrentUser().role) > -1);

            if(FAILED_STATUSES.indexOf(statusValue) > -1 && isAdmin) {
                requestData[i][ACTION_ROW] = texts[LINK_DELETE];
                failed = true;
            }

            for(let [id, value] of Object.entries(requestData[i])){
                switch(id) {
                    case fields.customerSavedSearch:
                        value = customerSavedSearchLookup[value];
                        break;
                    case fields.generationParameters:
                        if(!!value){
                            let params = JSON.parse(value);
                            value = templateLookup[params.template];
                        }
                        break;
                    case fields.includeNoTransaction:
                    case fields.includeOverdue:
                        value = value ? texts[YES] : texts[NO];
                        break;
                    case fields.status:
                        let statusString = new StringUtility(value.text);
                        let statusLink = statusString.generateHTMLLink({
                            url: "javascript:;",
                            class: STATUS_FORM,
                            details: requestData[i][fields.id]
                        });
                        value = statusLink;
                        break;
                    case ACTION_ROW:
                        let deleteString = new StringUtility(texts[LINK_DELETE]);
                        let deleteLink = deleteString.generateHTMLLink({
                            url: "javascript:;",
                            class: ACTION_FORM,
                            details: requestData[i][fields.id]
                        });
                        value = deleteLink;
                        break;
                    case fields.lastRequestRun:
                    case fields.errorDetail:
                    case fields.id:
                        continue;
                    default:
                        break;
                }
                if(!value){continue;}

                fieldValues.push({
                    id: FIELDS_LOOKUP[id].formId,
                    line: parseInt(i),
                    value: value
                });
            }
        }

        return fieldValues;
    }

    return ISGenStatusUI;

});
