/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define([
        '../../data/JP_SubsidiaryDAO',
        '../../datastore/JP_FieldsStore',
        '../../app/JP_SubsidiaryUI',
        '../../data/JP_SubsidiaryHolidayDAO',
        '../../datastore/JP_ListStore',
        '../../lib/JP_TCTranslator',
        'N/ui/serverWidget',
        'N/runtime',
        'N/ui/message',
        'N/error'
    ],

    (JP_SubsidiaryDAO, JP_FieldsStore, JP_SubsidiaryUI,
             JP_SubHolidayDAO, listStore,translation,
             serverWidget, runtime, message, error)=> {

        let FLD_COUNTRY = 'country';
        let JP_COUNTRY = "JP";

        function JP_SubsidiaryUE() {

            this.beforeLoad = function(context){

                try{
                    if(runtime.executionContext == runtime.ContextType.USER_INTERFACE ){
                        let form = context.form;
                        let subsidiaryUI = new JP_SubsidiaryUI();
                        subsidiaryUI.hideFields(form);
                        let isOW = runtime.isFeatureInEffect('SUBSIDIARIES');
                        let country = context.newRecord.getValue(FLD_COUNTRY);

                        if(country == JP_COUNTRY || context.type == context.UserEventType.CREATE ||
                            (!isOW && country == JP_COUNTRY) ){
                            subsidiaryUI.addJapanSetupSubtab(context, isOW);
                            subsidiaryUI.addHolidayTab(context, isOW);
                        }
                    }
                }
                catch(err){
                    log.error({title: "Subsidiary beforeLoad error" , details: JSON.stringify(err)});
                    throw err.message;
                }
            };

            this.beforeSubmit = function(context){
                try{
                    let allowedContext = [runtime.ContextType.USER_INTERFACE,
                        runtime.ContextType.USEREVENT];
                    let country = context.newRecord.getValue(FLD_COUNTRY);
                    let oldCountry = context.oldRecord && context.oldRecord.getValue(FLD_COUNTRY);
                    let isOW = runtime.isFeatureInEffect('SUBSIDIARIES');

                    let contextIsValid = allowedContext.indexOf(runtime.executionContext) > -1;
                    let eventIsValid = context.type !== context.UserEventType.DELETE;
                    let countryIsValid = !isOW || country === JP_COUNTRY || oldCountry === JP_COUNTRY;

                    if(contextIsValid && eventIsValid && countryIsValid){
                        let isIndividualCustomer = context.newRecord.getValue("custpage_indivpdf");
                        let pdfFormat = parseInt(context.newRecord.getValue("custpage_jp_pdfname") );
                        let lstStore = new listStore();

                        if(isIndividualCustomer == 'F' && pdfFormat == lstStore.ISPDF_FILE_FORMATS.closingdate_custname){
                            let localizedStrings = new translation().getTexts(
                                ['ERR_MSG_INVALIDFRMT', 'ERR_TITLE_INVALIDFRMT'], true);

                            log.error({
                                title: localizedStrings[ERR_TITLE_INVALIDFRMT],
                                details: localizedStrings[ERR_MSG_INVALIDFRMT]
                            });

                            throw error.create({
                                name: localizedStrings[ERR_TITLE_INVALIDFRMT],
                                message: localizedStrings[ERR_MSG_INVALIDFRMT]
                            });
                        }
                        else{
                            new JP_SubsidiaryUI().storeJPValues(context);
                        }
                    }
                }
                catch(err){
                    log.error({title: "Subsidiary beforeSubmit error" , details: JSON.stringify(err)});
                    throw err.message;
                }
            };

            this.afterSubmit = function(context){
                let allowedContext = [runtime.ContextType.USER_INTERFACE,
                    runtime.ContextType.USEREVENT];

                if(allowedContext.indexOf(runtime.executionContext) > -1){
                    let rec = context.newRecord;

                    let newHolidays = [];
                    let sublistFld = runtime.isFeatureInEffect('SUBSIDIARIES') ? 'day' : 'trans_name';
                    let sublistId = "custpage_suitel10n_jp_non_op_days_sublist";
                    let lineCount = rec.getLineCount({sublistId: sublistId});

                    for(let y=0; y<lineCount; y++){

                        let sublistVal =  rec.getSublistValue({
                            sublistId: sublistId,
                            fieldId: sublistFld,
                            line: y
                        });

                        newHolidays.push(sublistVal);
                    }

                    let subholidayDao = new JP_SubHolidayDAO();
                    subholidayDao.updateSubsidiaryHolidayRelationship(newHolidays, context.newRecord.id);
                }
            };

            return this;
        }

        let subUE = new JP_SubsidiaryUE();

        return {
            beforeLoad: (context)=>{ subUE.beforeLoad(context); },
            beforeSubmit: (context)=>{ subUE.beforeSubmit(context) },
            afterSubmit: (context)=>{ subUE.afterSubmit(context) }
        };

    });
