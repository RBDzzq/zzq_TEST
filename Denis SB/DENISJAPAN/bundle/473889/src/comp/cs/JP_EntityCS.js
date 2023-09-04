/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define([
    '../../app/JP_PaymentDueDateValidator',
    '../../data/NQuery/JP_NSubsidiaryDAO',
    '../../datastore/JP_FieldsStore',
    '../../data/JP_EntityDAO',
    '../../app/JP_TaxRegNumValidator'
],

(
    JP_PaymentDueDateValidator,
    JP_NSubsidiaryDAO,
    JP_FieldsStore,
    JP_EntityDAO,
    JP_TaxRegNumValidator
) => {

    let PAYMENT_TERMS_SUBLIST_PREFIX = 'recmachcustrecord_suitel10n_jp_pt_';
    let SUBSIDIARY_FIELD = 'subsidiary';
    let SUBSIDIARY_MACHINE = 'submachine';

    function JP_EntityCS(){

        /**
         * Handle hiding and showing of fields based on subsidiary countries
         *
         * @param {Object} scriptContext
         */
        function showHideFields(scriptContext){
            let currentRecord = scriptContext.currentRecord;
            let subsidiariesCountry = getEntitySubsidiariesCountry(currentRecord);

            let recordObj = {
                type : currentRecord.type,
                countries: subsidiariesCountry
            };

            let fieldsObj = new JP_FieldsStore().getFieldsToShowHide(recordObj);
            let fields = Object.keys(fieldsObj);
            for (let id in fields) {
                let displayField = fieldsObj[fields[id]].display;
                let recordField = currentRecord.getField({fieldId:fields[id]});
                recordField.isDisplay = displayField;
            }
        }


        /**
         * Get countries of all subsidiaries including primary subsidiary and all
         * subsidiaries if entity is multi-sub
         *
         * @param {Object} rec Current Record object
         * @returns {Array}
         */
        function getEntitySubsidiariesCountry(rec){
            // get list of subsidiaries
            let primarySubsidiary = rec.getValue({fieldId:SUBSIDIARY_FIELD});
            let subsidiaryList = [primarySubsidiary];
            let count = rec.getLineCount({sublistId:SUBSIDIARY_MACHINE});
            for (let i = 0; i < count; i++) {
                let subsidiaryId = rec.getSublistValue({sublistId:SUBSIDIARY_MACHINE, fieldId: SUBSIDIARY_FIELD, line: i});
                subsidiaryList.push(subsidiaryId);
            }

            //get list of countries from subsidiaries
            let subsidiaryDao = new JP_NSubsidiaryDAO();
            let subsidiaryData = subsidiaryDao.getMultipleData(subsidiaryList, true);

            //get unique countries from list
            let subsidiariesCountry = subsidiaryData.map((item) => item.country)
                .filter((value, index, self) => self.indexOf(value) === index);

        	return subsidiariesCountry;
        }

        function setTaxInvoiceCheckBox(currRecord){
            let entDao = new JP_EntityDAO();
            let includeIS = currRecord.getValue({fieldId: entDao.fields.includeIS});
            let taxInvFld = currRecord.getField({fieldId: entDao.fields.taxISLaw});

            if (taxInvFld){
                taxInvFld.isDisabled = !includeIS;
            }

            if(!includeIS){
                currRecord.setValue({
                    fieldId: entDao.fields.taxISLaw,
                    value : false
                });
            }
        }

        function setDueDateCheckBox(currRecord){
            let entDao = new JP_EntityDAO();
            let includeIS = currRecord.getValue({fieldId: entDao.fields.includeIS});

            //computeDate field is disabled/enabled based whether include invoice summary is un/checked.
            let compDueDate = currRecord.getField({fieldId: entDao.fields.computeDueDate});

            if(includeIS){
                compDueDate.isDisabled = true;
                currRecord.setValue({
                    fieldId: entDao.fields.computeDueDate,
                    value: true
                });
            }else if (includeIS === false){
                compDueDate.isDisabled = false;
                currRecord.setValue({
                    fieldId: entDao.fields.computeDueDate,
                    value: false
                });
            }
        }

        this.pageInit = (scriptContext)=>{
            try {
                showHideFields(scriptContext);
                setDueDateCheckBox(scriptContext.currentRecord);
                setTaxInvoiceCheckBox(scriptContext.currentRecord);
            } catch (e) {
                log.error(e.name, e.message);
            }
        };

        this.fieldChanged = (scriptContext)=>{
            try {
                let entDao = new JP_EntityDAO();

                if (scriptContext.fieldId === SUBSIDIARY_FIELD && scriptContext.sublistId === null) {
                    showHideFields(scriptContext);
                }
                else if(scriptContext.fieldId === entDao.fields.includeIS) {
                    setDueDateCheckBox(scriptContext.currentRecord);
                    setTaxInvoiceCheckBox(scriptContext.currentRecord);
                }
           } catch (e) {
               log.error(e.name, e.message);
           }
        };

        this.validateLine = (scriptContext)=>{
            try {
                let currentRecord = scriptContext.currentRecord;
                if (scriptContext.sublistId === PAYMENT_TERMS_SUBLIST_PREFIX + currentRecord.type) {
                    return new JP_PaymentDueDateValidator().validateCurrentPaymentTerm(currentRecord);
                }
           } catch (e) {
               log.error(e.name, e.message);
           }

           return true;
        };

        this.sublistChanged = (scriptContext)=>{
        	try {
                if (scriptContext.sublistId === SUBSIDIARY_MACHINE) {
                	 showHideFields(scriptContext);
                }
           } catch (e) {
               log.error(e.name, e.message);
           }
        };

        this.saveRecord = (scriptContext) =>{
            try {
                let currentRecord = scriptContext.currentRecord;
                let subsidiariesCountry = getEntitySubsidiariesCountry(currentRecord);
                return (new JP_PaymentDueDateValidator().checkIDSMandatoryFields(currentRecord, subsidiariesCountry) &&
                    new JP_TaxRegNumValidator().validateTaxRegNumUI(currentRecord));
            } catch (e) {
                log.error(e.name, e.message);
            }

            return true;
        };

    }

    let entityCS = new JP_EntityCS();

    return {
        pageInit: (scriptContext)=>{ return entityCS.pageInit(scriptContext); },
        fieldChanged: (scriptContext)=>{ return entityCS.fieldChanged(scriptContext); },
        validateLine: (scriptContext)=>{ return entityCS.validateLine(scriptContext); },
        sublistChanged: (scriptContext)=>{ return entityCS.sublistChanged(scriptContext); },
        saveRecord: (scriptContext)=>{ return entityCS.saveRecord(scriptContext); }
    };

});
