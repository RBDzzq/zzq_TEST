/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([
    'N/file',
    '../../app/JP_ISRegenerationController'
], (
    file,
    ISRegenerationController
) =>{

    function onRequest(context) {

        let request = context.request;
        let response = context.response;
        let params = request.parameters;
        let recId = params.recId;

        let fileLink = '';
        let regenController = new ISRegenerationController();
        let fileId = regenController.regenerate(recId);
        if (fileId) {
            let fileObj = file.load({
                id: fileId
            });
            fileLink = fileObj.url;
        }

        response.setHeader({
            name: 'Content-Type',
            value: 'application/json',
        });

        response.write({
            output: JSON.stringify({
                fileLink: fileLink,
                fileId: fileId
            })
        });

    }

    return {
        onRequest: onRequest
    }

});
