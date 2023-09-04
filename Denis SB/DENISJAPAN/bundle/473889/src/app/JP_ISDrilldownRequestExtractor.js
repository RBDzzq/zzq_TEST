/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    './JP_ISGenerationFormRequestExtractor'
], (GenerationFormRequestExtractor) => {

    class JP_ISDrilldownRequestExtractor extends GenerationFormRequestExtractor{

        constructor() {
            super();
            this.name = 'JP_ISDrilldownRequestExtractor';
            let drilldownParams = {
                "custId": "custId",
                "type": "type"
            };

            util.extend(this.PARAMS_MAPPING, drilldownParams);
        }
    }

    return JP_ISDrilldownRequestExtractor;

});
