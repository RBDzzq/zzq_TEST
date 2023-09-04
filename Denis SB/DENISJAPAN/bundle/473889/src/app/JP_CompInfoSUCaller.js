/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    'N/url',
    'N/https'
], (url, https) =>{

    function getCompInfo(subsidiary){
        const compinfoServiceURL = url.resolveScript({
            scriptId: 'customscript_japan_loc_compinfo_svc_su',
            deploymentId: 'customdeploy_japan_loc_compinfo_svc_su'
        });
        const compinfoServiceResponse = https.post({
            url: compinfoServiceURL,
            body : {
                subsidiary : subsidiary,
            }
        });
        return JSON.parse(compinfoServiceResponse.body);
    }

    return {
        getCompInfo : getCompInfo
    }

});
