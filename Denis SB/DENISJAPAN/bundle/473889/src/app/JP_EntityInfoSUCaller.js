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
], (url, https) => {

    function getEntityInfo(params){

        let entityInfoServiceURL = url.resolveScript({
            scriptId: 'customscript_japan_loc_entityinfo_svc_su',
            deploymentId: 'customdeploy_japan_loc_entityinfo_svc_su'
        });
        let entityInfoServiceResponse = https.post({
            url: entityInfoServiceURL,
            body : {
                entityid : params.entityid,
                tranType : params.tranType
            }
        });
        return JSON.parse(entityInfoServiceResponse.body);
    }

    return {
        getEntityInfo : getEntityInfo
    }

});
