/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 */

define([
    '../../app/JP_TransactionUI',
    '../../app/JP_CompInfoSUCaller'
],

(
    JP_TransactionUI,
    JP_CompInfoSUCaller
    ) =>{

    let SUBSIDIARY_FIELD = "subsidiary";

    class JP_PaymentTransactionCS extends JP_TransactionUI{

        constructor() {
            super();
        }

        pageInit(scriptContext){
            try {
                let currentRecord = scriptContext.currentRecord;
                let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                let country = JP_CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;
                this.showHideFields(currentRecord, country);
            } catch (e) {
                log.error(e.name, e.message);
            }

        }


        fieldChanged(scriptContext){
            try {
                if(scriptContext.fieldId == SUBSIDIARY_FIELD) {
                    let currentRecord = scriptContext.currentRecord;
                    let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                    let country = JP_CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;
                    this.showHideFields(currentRecord, country);
                }
            } catch (e) {
                log.error(e.name, e.message);
            }
        }

    }

    let payTransCS = new JP_PaymentTransactionCS();

    return {
        pageInit: (scriptContext)=>{ return payTransCS.pageInit(scriptContext); },
        fieldChanged: (scriptContext)=>{ return payTransCS.fieldChanged(scriptContext); }
    };

});
