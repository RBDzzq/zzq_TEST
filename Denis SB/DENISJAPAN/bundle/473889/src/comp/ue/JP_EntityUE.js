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
    "../../app/JP_EntityUI",
    'N/ui/serverWidget'
],

(JP_SubsidiaryDAO, JP_FieldsStore, EntityUI, serverWidget) => {

    let SUBSIDIARY_FIELD = 'subsidiary';
    let SUBSIDIARY_MACHINE = 'submachine';

    function JP_EntityUE(){
        this.beforeLoad = function(scriptContext){

            let currentRecord = scriptContext.newRecord;
            try {
                new EntityUI().showJapanLocalizationSubtab(scriptContext);
                if (scriptContext.type === 'view') {
                    let subsidiariesCountry = getEntitySubsidiariesCountry(currentRecord);

                    let recordObj = {
                        type : currentRecord.type,
                        countries : subsidiariesCountry
                    }

                    let fieldsObj = new JP_FieldsStore().getFieldsToShowHide(recordObj);
                    let fields = Object.keys(fieldsObj);

                    let form = scriptContext.form;
                    for (let id in fields) {
                        let displayField = fieldsObj[fields[id]].display;
                        if (!displayField) {
                            let formField = form.getField({id:fields[id]});
                            formField.updateDisplayType({
                                displayType: serverWidget.FieldDisplayType.HIDDEN
                            });
                        }
                    }

                    if(subsidiariesCountry.indexOf('JP') !== -1){
                        let entUI = new EntityUI();
                        entUI.setDueDateCheckBox(scriptContext);
                        entUI.setTaxInvoiceLawCheckbox(scriptContext);
                    }
                }

            }
            catch (e) {
                log.error(e.name, e.message);
            }
        }

        function getEntitySubsidiariesCountry(rec){
            let count = rec.getLineCount({sublistId:SUBSIDIARY_MACHINE});
            let subdisiaryDao = new JP_SubsidiaryDAO();

            let primarySubCountry = subdisiaryDao.getSubsidiaryCountry(rec.getValue({fieldId: SUBSIDIARY_FIELD}));
            let subsidiariesCountry = [primarySubCountry];
            for (let i = 0; i < count; i++) {
                let subsidiaryId = rec.getSublistValue({sublistId:SUBSIDIARY_MACHINE, fieldId: SUBSIDIARY_FIELD, line: i});
                let country = subdisiaryDao.getSubsidiaryCountry(subsidiaryId);
                if (subsidiariesCountry.indexOf(country) < 0) {
                    subsidiariesCountry.push(country);
                }
            }
            return subsidiariesCountry;
        }

        this.beforeSubmit = function(scriptContext){
            let subsidiariesCountry = getEntitySubsidiariesCountry(scriptContext.newRecord);
            if(subsidiariesCountry.indexOf('JP') !== -1){
                new EntityUI().setTaxInvoiceLawCheckbox(scriptContext);
            }
        }
    }

    let entityUE = new JP_EntityUE();
    return {
        beforeLoad: (scriptContext)=>{ entityUE.beforeLoad(scriptContext); },
        beforeSubmit : (scriptContext)=>{entityUE.beforeSubmit(scriptContext); }
    };

});
