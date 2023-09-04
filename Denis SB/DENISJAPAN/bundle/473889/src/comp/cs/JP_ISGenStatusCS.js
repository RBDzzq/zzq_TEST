/**
 *    Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog',
    'N/search',
    'N/url',
    '../../datastore/JP_RecordTypes',
    '../../lib/JP_TCTranslator'
],
(dialog, search, url, JP_Types, translator) => {
    let STATUS_FORM = 'custpage_jp_status';
    let ACTION_FORM = 'custpage_jp_action';
    let ERROR_DETAIL = 'custrecord_jp_loc_gen_req_err_detail';
    let ERROR_DETAILS_STRING = 'IDS_GENERATIONSTATUS_ERROR_DETAILS';
    let DELETE_FAILED_TITLE = 'IDS_GENERATIONSTATUS_DELETE_TITLE';
    let DELETE_FAILED_STRING = 'IDS_GENERATIONSTATUS_DELETE_STRING';

    let MESSAGES = {};
    let rerunArg = '&rerun=1';
    let deleteExpression = '&toDelete=\\w*';

    function ISGenStatusCS() {
        this.pageInit = () => {
            addStatusClickListener();
            addDeleteLinkListener();
        }

        this.fieldChanged = (scriptContext)=>{

            if(scriptContext.fieldId === "custpage_statusfilter"){
                //this is to eliminate the popup "Changes you made may not be saved."
                window.onbeforeunload = function() {};
                let currRec = scriptContext.currentRecord;

                //redirect
                location.href = location.href.replace(/&filter=\d*/, "") +
                    '&filter=' + currRec.getValue({fieldId: 'custpage_statusfilter'});
            }
        }
    }

    function loadMessageObject() {
        if (Object.keys(MESSAGES).length === 0) {
            MESSAGES = new translator().getTexts([ERROR_DETAILS_STRING, DELETE_FAILED_TITLE,
                DELETE_FAILED_STRING], true)
        }
    }

    function addStatusClickListener() {
        loadMessageObject();
        let statLinks = document.getElementsByClassName(STATUS_FORM);
        for(let i=0; i<statLinks.length; i++) {
            statLinks[i].addEventListener("click", (event) => {
                let requestId = event.target.dataset.details;
                dialog.alert({
                    title: MESSAGES[ERROR_DETAILS_STRING],
                    message: getRequestErrorDetails(requestId)
                });
            });
        }
    }

    function getRequestErrorDetails(id) {
        let requestLookup = search.lookupFields({
            type: JP_Types.REQUEST_RECORD,
            id: id,
            columns: [ERROR_DETAIL]
        });
        return requestLookup[ERROR_DETAIL];
    }

    function refresh(){
        location.href = location.href.replace(rerunArg, "");

        let deleteArgs = location.href.match(deleteExpression)
        if(deleteArgs) {
            location.href = location.href.replace(deleteArgs[0], "");
        }
    }

    function rerunStuckBatches(){
        if(location.href.search(rerunArg) === -1){
            location.href = location.href + rerunArg;
        }
        else{
            location.reload();
        }
    }

    function addDeleteLinkListener() {
        loadMessageObject();
        let deleteLinks = document.getElementsByClassName(ACTION_FORM);
        let requestId = null;

        for(let i=0; i<deleteLinks.length; i++) {
            deleteLinks[i].addEventListener("click", (event) => {
                requestId = event.target.dataset.details;
                showDeleteConfirmation({ id: requestId });
            });
        }
    }

    function showDeleteConfirmation(params) {
        dialog.confirm({
            title: MESSAGES[DELETE_FAILED_TITLE],
            message: MESSAGES[DELETE_FAILED_STRING]
        }).then((result) => {
            return confirmDeletion(result, params);
        });
    }

    function confirmDeletion(result, params){
        if (result) {
            deleteFailedGenerations(params);
        }
    }

    function deleteFailedGenerations(params) {
        if(!location.href.match(deleteExpression)){
            location.href = [location.href, '&toDelete=', params ? params.id : 'all'].join('');
        }
        else{
            location.reload();
        }
    }

    function deleteAllFailedJobs() {
        showDeleteConfirmation();
    }

    function returnToSearchForm(){
        let searchCriteriaURL = url.resolveScript({
            scriptId: 'customscript_is_generation_search_su',
            deploymentId: 'customdeploy_is_generation_search_su'
        });

        location.href = searchCriteriaURL;
    }

    let isGenCS = new ISGenStatusCS();
    return {
        pageInit: (scriptContext) => { return isGenCS.pageInit(scriptContext); },
        fieldChanged :  (scriptContext) => { return isGenCS.fieldChanged(scriptContext); },
        refresh: refresh,
        rerunStuckBatches : rerunStuckBatches,
        returnToSearchForm: returnToSearchForm,
        deleteAllFailedJobs: deleteAllFailedJobs
    };
});
