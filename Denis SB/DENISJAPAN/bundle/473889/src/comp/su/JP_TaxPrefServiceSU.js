/**
 * Copyright (c) 2023, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
    '../../data/JP_TaxPreferencesDAO'
], (JP_TaxPreferencesDAO) =>{

    function onRequest(context) {
        let id = context.request.parameters.entityid;
        let type = context.request.parameters.entityType;

        let roundingMethod = new JP_TaxPreferencesDAO().getRoundingMethod(id,type,true);

        context.response.setHeader({
            name: 'Content-Type',
            value: 'application/json',
        });

        context.response.write({
            output: JSON.stringify({
                roundingMethod: roundingMethod
            })
        });
    }

    return {
        onRequest: onRequest
    };

});
