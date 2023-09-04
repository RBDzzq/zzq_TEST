/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([
    '../../app/JP_ISDrilldownRequestExtractor',
    '../../app/JP_ISGenerationFormMediator'
], (
    RequestExtractor,
    FormMediator
) =>{

    function onRequest(context) {

    	let request = context.request;
        let extractor = new RequestExtractor();

        let reqValues = {};
        reqValues = extractor.extractGetParameters(request);

        let COMPONENT_CREATOR = 'JP_ISDrilldownComponentCreator';
        let mediator = new FormMediator(COMPONENT_CREATOR);
        let page = mediator.loadPage(reqValues);

    	context.response.writePage(page);
    }

    return {
        onRequest: onRequest
    };

});
