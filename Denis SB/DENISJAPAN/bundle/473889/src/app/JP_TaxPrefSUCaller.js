/**
 * Copyright (c) 2023, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    'N/url',
    'N/https'
], (url, https) => {

    function getTaxPref(params){

        let taxPrefServiceURL = url.resolveScript({
            scriptId: 'customscript_japan_loc_taxpref_svc_su',
            deploymentId: 'customdeploy_japan_loc_taxpref_svc_su'
        });

        let taxPrefServiceResponse = https.post({
            url: taxPrefServiceURL,
            body : {
                entityid : params.entityid,
                entityType: params.entityType
            }
        });
        return JSON.parse(taxPrefServiceResponse.body);
    }

    return {
        getTaxPref : getTaxPref
    }

});