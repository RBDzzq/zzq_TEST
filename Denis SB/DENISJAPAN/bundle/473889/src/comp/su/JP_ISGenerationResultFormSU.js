/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([
    "../../app/JP_ISGenerationFormMediator",
    "../../app/JP_ISGenerationFormRequestExtractor",
    "../../app/JP_InvoiceSummaryRequestManager",
    "../../app/JP_GenerationValidator",
    "../../lib/JP_TCTranslator",
    "../../lib/JP_StringUtility",
    "../../data/NQuery/JP_NCustTreeDAO",
    "N/redirect",
    "N/runtime",
    "N/ui/message"
], (
    JP_Mediator,
    JP_RequestExtractor,
    InvoiceSummaryRequestManager,
    GenerationValidator,
    JP_Translator,
    JP_StringUtility,
    NCustTreeDAO,
    redirect,
    runtime,
    message) =>{

    let SEARCH_FORM_SCRIPT_ID = "customscript_is_generation_search_su";
    let SEARCH_FORM_DEPLOY_ID = "customdeploy_is_generation_search_su";

    function onRequest(context) {
        let request = context.request;
        let extractor = new JP_RequestExtractor();
        let reqValues = extractor.extractParameters(request);

        if (request.method == "POST") {
            let validator = new GenerationValidator();
            let generationValidation = validator.validate(reqValues);
            reqValues.hierarchyId = (request.parameters["custpage_hierarchyid"]) ?
                request.parameters['custpage_hierarchyid']:"";

            if (generationValidation.isValid && reqValues.consolidated && reqValues.consolidated === 'T') {
                let subcustValidation = validator.validateSubcustomers(reqValues);
                if (subcustValidation.isValid) {
                    log.debug("Saving Customer Tree", JSON.stringify(validator.customerList));
                    reqValues.hierarchyId = new NCustTreeDAO().saveCustomerTree(validator.customerList);
                    new InvoiceSummaryRequestManager().createRequestRecord(reqValues);
                    redirectToSearchForm();
                } else {
                    showBanner(subcustValidation);
                }
            } else if (generationValidation.isValid) {
                new InvoiceSummaryRequestManager().createRequestRecord(reqValues);
                redirectToSearchForm();
            } else {
                showBanner(generationValidation);
            }
        }

        let COMPONENT_CREATOR = "JP_ISResultFormComponentCreator";
        let mediator = new JP_Mediator(COMPONENT_CREATOR);
        let page = mediator.loadPage(reqValues);

        let resultSublist = page.getSublist({id:'customer_result'});
        if(resultSublist.lineCount < 1){
            let submitButton = page.getButton({id:'submitter'});
            submitButton.isDisabled = true;
        }

    	context.response.writePage(page);
    }

    function redirectToSearchForm(){
        let session = runtime.getCurrentSession();
        session.set({name:'INVOICE_SUMMARY_PROCESSING',value:true});
        redirect.toSuitelet({
            scriptId: SEARCH_FORM_SCRIPT_ID,
            deploymentId: SEARCH_FORM_DEPLOY_ID,
        });
    }

    function showBanner(validationObj){

        let msg = new JP_Translator().getTexts([validationObj.messageCode], true);

        let stringUtility = new JP_StringUtility(msg[validationObj.messageCode]);
        let mymsg = stringUtility.replaceParameters(validationObj.parameters);

        let bannerMessage = message.create({
            message: mymsg,
            type: (validationObj.type === new GenerationValidator().VALIDATION_TYPES.FAILURE) ?
                message.Type.ERROR : message.Type.INFORMATION
        });
        bannerMessage.show({sendToClient : true});
    }

    return {
        onRequest: onRequest
    };
});
