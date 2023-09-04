/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
    '../../data/JP_CompanyDAO',
    '../../data/NQuery/JP_NSubsidiaryDAO',
    'N/runtime'
], (
    JP_CompanyDAO,
    JP_NSubsidiaryDAO,
    runtime
) =>{

    function onRequest(context) {

        let useHolidayChecking = '';
        let subsidiaryCountry = 'JP';
        let poPrintFolder = '';

        let subsidiary = context.request.parameters.subsidiary;
        if(subsidiary && runtime.isFeatureInEffect({feature:'SUBSIDIARIES'})){
            let nSubsidiaryDAO = new JP_NSubsidiaryDAO();
            nSubsidiaryDAO.getData(subsidiary);
            useHolidayChecking = nSubsidiaryDAO.fields.useHolidayChecking.val;
            subsidiaryCountry = nSubsidiaryDAO.fields.country.val;
            poPrintFolder = nSubsidiaryDAO.fields.printFolder.val;
        }else{
            let compDAO = new JP_CompanyDAO();
            useHolidayChecking = compDAO.useHolidayChecking().useHolidayChecking;
            poPrintFolder = compDAO.getPrintedPOFolder();
        }

        context.response.setHeader({
		    name: 'Content-Type',
		    value: 'application/json',
        });

        context.response.write({
            output: JSON.stringify({
                useHolidayChecking : useHolidayChecking,
                subsidiaryCountry : subsidiaryCountry,
                poPrintFolder: poPrintFolder
            })
        });

    }

    return {
        onRequest: onRequest
    };

});
