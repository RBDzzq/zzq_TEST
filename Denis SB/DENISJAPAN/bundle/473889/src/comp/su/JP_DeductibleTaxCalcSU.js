/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['../../app/JP_DeductibleTaxCalcUI'], (JP_DeductibleUI) =>{

        function onRequest(context){
            let ui = new JP_DeductibleUI(context.form);
            context.response.writePage(ui.buildUI());
        }

        return {
            onRequest: onRequest
        };

    });
