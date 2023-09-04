/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define([
    'N/url',
    'N/runtime',
    'N/search',
    '../../lib/JP_StringUtility',
    '../../lib/JP_TCTranslator',
],

(url,runtime,search,JP_StringUtility, translator) => {

    function JP_ISGenerationFormCS(){

        let EDIT = 'IDS_LABEL_LINK_EDIT';
        let PREVIEW = 'IDS_LABEL_LINK_PREVIEW';
        let messages;

        if (JP_ISGenerationFormCS.Instance !== undefined) {
            return JP_ISGenerationFormCS.Instance;
        }

        this.returnToSearch = (params) => {

            window.location.href = url.resolveScript({
                scriptId: 'customscript_is_generation_search_su',
                deploymentId: 'customdeploy_is_generation_search_su',
                params: params
            });
        };

        this.viewOutstandingJobs = ()=> {
            window.location.href = url.resolveScript({
                scriptId: 'customscript_jp_loc_is_gen_status',
                deploymentId: 'customdeploy_jp_loc_is_gen_status'
            });
        };

        function setEditPreviewLinks(currentRecord){
            let savedSearch = currentRecord.getValue({fieldId:'custpage_customer_savedsearch_filter'});

            if(savedSearch){
                let editSavedSearchURL = url.resolveTaskLink({
                    id: 'SRCH_CUSTOMER',
                    params:{
                        id:savedSearch,
                        e:'T',
                        cu:'T'
                    }
                });
                let editString = new JP_StringUtility(messages[EDIT]);
                let editLink = editString.generateHTMLLink({
                    url: editSavedSearchURL,
                    target: '_blank'
                });

                let viewSavedSearchURL = url.resolveTaskLink({
                    id: 'LIST_SEARCHRESULTS',
                    params:{
                        searchid:savedSearch
                    }
                });
                let previewString = new JP_StringUtility(messages[PREVIEW]);
                let previewLink = previewString.generateHTMLLink({
                    url: viewSavedSearchURL,
                    target: '_blank'
                });
                currentRecord.setValue({
                    fieldId:'custpage_customer_editprev_savedsearch',
                    value: editLink + ' ' + previewLink
                });

            } else {
                currentRecord.setValue({
                    fieldId:'custpage_customer_editprev_savedsearch',
                    value: '<span style="color: gray">' + messages[EDIT] + ' ' + messages[PREVIEW] + '</span>'
                });
            }

        }

        this.pageInit = (scriptContext)=>{
            messages = new translator().getTexts([EDIT, PREVIEW], true);
            setEditPreviewLinks(scriptContext.currentRecord);
        }

        this.fieldChanged = (scriptContext)=> {
            let currentRecord = scriptContext.currentRecord;
            if(scriptContext.fieldId == 'custpage_customer_filter'){
                currentRecord.setValue({fieldId:'custpage_customer_savedsearch_filter',value:'',ignoreFieldChange:true});
                setEditPreviewLinks(currentRecord);
            } else if(scriptContext.fieldId == 'custpage_customer_savedsearch_filter'){
                currentRecord.setValue({fieldId:'custpage_customer_filter',value:'',ignoreFieldChange:true});
                setEditPreviewLinks(currentRecord);
            }
        }

        JP_ISGenerationFormCS.Instance = this;
        return JP_ISGenerationFormCS.Instance;

    }

    return {
        returnToSearch: (scriptContext)=>{ return new JP_ISGenerationFormCS().returnToSearch(scriptContext); },
        viewOutstandingJobs: (scriptContext) =>{ return new JP_ISGenerationFormCS().viewOutstandingJobs(scriptContext); },
        pageInit: (scriptContext)=>{ return new JP_ISGenerationFormCS().pageInit(scriptContext); },
        fieldChanged: (scriptContext)=>{ return new JP_ISGenerationFormCS().fieldChanged(scriptContext); }
    };

});
