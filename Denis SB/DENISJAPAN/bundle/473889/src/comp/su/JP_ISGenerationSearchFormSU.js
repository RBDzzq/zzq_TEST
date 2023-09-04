/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["../../app/JP_ISGenerationFormMediator",
        "../../app/JP_ISGenerationFormRequestExtractor",
        "../../lib/JP_TCTranslator",
        "../../lib/JP_SearchIterator",
        "../../data/JP_CustomerDAO",
        "../../app/JP_GenerationValidator",
        "../../data/NQuery/JP_NCustomerDAO",
        "../../data/NQuery/JP_NCustTreeDAO",
        "N/redirect",
        "N/ui/message",
        "N/runtime",
        "N/error"
],  (
        JP_Mediator,
        JP_RequestExtractor,
        JP_Translator,
        JP_SearchIterator,
        JP_CustomerDAO,
        JP_GenerationValidator,
        JP_NCustomerDAO,
        JP_NCustTreeDAO,
        redirect,
        message,
        runtime,
        error
        ) =>{


    let PROCESS_COMPLETION_NOTIFICATION = "IDS_GEN_PROCESS_COMPLETION_NOTIFICATION";
    let GENERATION_INSTRUCTIONS_TITLE = "IDS_GEN_GENERATION_INSTRUCTION_TITLE";
    let GENERATION_INSTRUCTIONS_OW = "IDS_GEN_GENERATION_INSTRUCTION_MESSAGE_OW";
    let GENERATION_INSTRUCTIONS_SI = "IDS_GEN_GENERATION_INSTRUCTION_MESSAGE_SI";
    let INVALID_CUSTOMER_SUBSIDIARY_SELECTION = "IDS_GEN_INVALID_CUSTOMER_SUBSIDIARY_SELECTION";
    let SUITETAX_NOT_SUPPORTED = "IDS_GEN_PAGE_MESSAGE_SUITETAXNOTSUPPORTED";
    let INVALID_CURRENCY = 'ERR_INVAL_CURRENCY';
    let NOT_PARENT_CUSTOMER = 'ERR_NOTPARENTCUSTOMER';
    let MULTISUB_ENABLED = 'ERR_INVAL_MULTISUB';

    let messages;

    function showProcessCompletionNotificationBanner(){
        let session = runtime.getCurrentSession();
        let isOW = runtime.isFeatureInEffect({feature:'SUBSIDIARIES'});
        let isProcessing = session.get({name:'INVOICE_SUMMARY_PROCESSING'});

        if(isProcessing){
            let processCompNotifMsg = message.create({
               message: messages[PROCESS_COMPLETION_NOTIFICATION],
               type: message.Type.CONFIRMATION
            });
            processCompNotifMsg.show({sendToClient : true});
            session.set({name:'INVOICE_SUMMARY_PROCESSING',value:''});
        }else{
            let GENERATION_INSTRUCTIONS = isOW ? GENERATION_INSTRUCTIONS_OW : GENERATION_INSTRUCTIONS_SI;
            let generationInstruction = message.create({
                title: messages[GENERATION_INSTRUCTIONS_TITLE],
                message: messages[GENERATION_INSTRUCTIONS],
                type: message.Type.INFORMATION
            });
            generationInstruction.show({sendToClient : true});
        }
    }

    function isCustomerSubsidiarySelectionValid(params){
        let subsidiary = params['subsidiary'];
        let customer = params['customer'];

        if(subsidiary && customer) {
            let customerSubs = new JP_CustomerDAO().getCustomerSubsidiaries(customer);
            if(customerSubs.indexOf(subsidiary) === -1){
                let customerSubMismatchMsg = message.create({
                    message: messages[INVALID_CUSTOMER_SUBSIDIARY_SELECTION],
                    type: message.Type.ERROR
                });
                customerSubMismatchMsg.show({sendToClient : true});
                return false;
            }
        }

        return true;
    }

    function handleSuiteTaxCompatibility(){
        if(runtime.isFeatureInEffect({feature:'TAX_OVERHAULING'})){
            throw error.create({
                name:'SUITETAX_FEATURE_INCOMPATIBLE',
                message: messages[SUITETAX_NOT_SUPPORTED]
            });
        }
    }

    function onRequest(context) {

        messages = new JP_Translator().getTexts([
            PROCESS_COMPLETION_NOTIFICATION,
            INVALID_CUSTOMER_SUBSIDIARY_SELECTION,
            SUITETAX_NOT_SUPPORTED,
            GENERATION_INSTRUCTIONS_TITLE,
            GENERATION_INSTRUCTIONS_OW,
            GENERATION_INSTRUCTIONS_SI,
            INVALID_CURRENCY,
            NOT_PARENT_CUSTOMER,
            MULTISUB_ENABLED
        ], true);

        handleSuiteTaxCompatibility();

        let RESULT_FORM_SCRIPT_ID = "customscript_is_generation_result_su";
        let RESULT_FORM_DEPLOY_ID = "customdeploy_is_generation_result_su";

        let request = context.request;
        let extractor = new JP_RequestExtractor();
        let reqValues = extractor.extractParameters(request);

        if (request.method === "GET") {
            reqValues.closingDate = (!!reqValues.closingDate) ? reqValues.closingDate : new Date();
            showProcessCompletionNotificationBanner();

        } else {
            let validCustomerSelection = runtime.isFeatureInEffect({feature:'SUBSIDIARIES'}) ?
                isCustomerSubsidiarySelectionValid(reqValues) : true;

            if(validCustomerSelection && reqValues.consolidated === 'T'){

                let validator = new JP_GenerationValidator();
                if(validator.areConsolidatedFeaturesInvalid()){
                    message.create({
                        message: messages[MULTISUB_ENABLED],
                        type: message.Type.ERROR
                    }).show({sendToClient : true});
                } else {
                    let consolidatedValidation = validator.validateSubcustomers(reqValues);
                    if(consolidatedValidation.isValid){

                        reqValues.hierarchyId = new JP_NCustTreeDAO().saveCustomerTree(validator.customerList);
                        redirect.toSuitelet({
                            scriptId: RESULT_FORM_SCRIPT_ID,
                            deploymentId: RESULT_FORM_DEPLOY_ID,
                            parameters: reqValues
                        });
                    } else {
                        message.create({
                            message: messages[consolidatedValidation.messageCode],
                            type: message.Type.ERROR
                        }).show({sendToClient : true});
                    }
                }
            } else if (validCustomerSelection) {
                redirect.toSuitelet({
                    scriptId: RESULT_FORM_SCRIPT_ID,
                    deploymentId: RESULT_FORM_DEPLOY_ID,
                    parameters: reqValues
                });
            }
        }

        let COMPONENT_CREATOR = "JP_ISSearchFormComponentCreator";
        let mediator = new JP_Mediator(COMPONENT_CREATOR);
        let page = mediator.loadPage(reqValues);

        context.response.writePage(page);
    }

    return {
        onRequest: onRequest
    };
});
