/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["N/error"], (error) =>{

    class JP_ISGenerationFormRequestExtractor{

        constructor() {
            /* Parameter mapping --> <post parameter> : <get parameter> */
            this.PARAMS_MAPPING = {
                "custpage_subsidiary_filter" : "subsidiary",
                "custpage_customer_filter" : "customer",
                "custpage_customer_savedsearch_filter" : "customerSavedSearch",
                "custpage_closingdate_filter" : "closingDate",
                "custpage_notransaction_filter" : "noTransaction",
                "custpage_overdue_filter" : "overdue",
                "custpage_statementdate" : "statementDate",
                "custpage_template" : "template",
                "custpage_consolidated_filter" : "consolidated",
                "hierarchyId" : "hierarchyId"
            };
        }

        extractParameters(request){
            log.debug("calling the extraction", JSON.stringify(request));

            return (request.method == 'GET') ? this.extractGetParameters(request) :
                this.extractPostParameters(request)
        }

        extractGetParameters(request){

            if (!request) {
                throw error.create({
                    name: 'JPB007',
                    message: 'JP_ISGenerationFormRequestExtractor.extractGetParameters requires an object parameter.',
                    notifyOff: false
                });
            }

            let parameters = {};
            if (!request.parameters) {
                return parameters;
            }

            log.debug("Request Parameters",JSON.stringify(request.parameters));
            let allParameters = request.parameters;

            for(let key in this.PARAMS_MAPPING) {
                let value = allParameters[this.PARAMS_MAPPING[key]];
                parameters[this.PARAMS_MAPPING[key]] = value;
            }

            return parameters;
        };

        extractPostParameters(request){

            log.debug("In extractPostParameters", JSON.stringify(request));
            if (!request) {
                throw error.create({
                    name: 'JPB008',
                    message: 'JP_ISGenerationFormRequestExtractor.extractPostParameters requires an object parameter.',
                    notifyOff: false
                });
            }

            let parameters = {};
            if (!request.parameters) {
                return parameters;
            }

            let allParameters = request.parameters;
            let jpParams = Object.keys(this.PARAMS_MAPPING);

            for (let i = 0; i < jpParams.length; i++) {
                let paramKey = jpParams[i];
                let paramValue = allParameters[paramKey]? allParameters[paramKey]: "";
                parameters[this.PARAMS_MAPPING[paramKey]] = paramValue;
            }
            return parameters;
        };
    }

    return JP_ISGenerationFormRequestExtractor;

});
