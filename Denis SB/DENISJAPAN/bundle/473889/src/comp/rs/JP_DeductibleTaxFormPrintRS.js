/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['../../app/JP_TaxFormPDFRenderer', 'N/error'],

 (TaxFormRenderer, error) =>{

    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {
        try {
            return new TaxFormRenderer().generatePDFForTaxForm({
                fieldValues: requestBody
            })
        } catch (ex){
            log.error({
                title: 'JP_DeductibleTaxFormPrintRS',
                message: JSON.stringify(ex)
            });
            if(!ex.errorCode){
                ex.errorCode = 'PRINT_ERROR_CODE'
            }
            throw error.create({
                name: ex.errorCode,
                message: ex.message || JSON.stringify(ex)
            });
        }
    }

    return {
        post: doPost
    };

});
