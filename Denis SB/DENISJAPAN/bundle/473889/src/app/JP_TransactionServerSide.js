/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    'N/record',
    'N/search',
    'N/ui/serverWidget',
    '../datastore/JP_FieldsStore',
    '../data/JP_EntityDAO',
    '../data/JP_SubsidiaryDAO'
],

 (
    record,
    search,
    serverWidget,
    FieldsStore,
    EntityDAO,
    SubsidiaryDAO
) => {

    let CLOSING_DATE = "custbody_suitel10n_inv_closing_date";
    let PAYMENT_DUE_DATE = "duedate";
    let ENTITY = "entity";
    let SUBSIDIARY = "subsidiary";
    let TAX_EXEMPT_ENTITY = "custbody_jp_vendtaxexempent";

    function TransactionServerSide() {
        this.dateFields = {
            closingDate: CLOSING_DATE,
            dueDate: PAYMENT_DUE_DATE
        };
        this.overrides = {};
    }

        /**
         * Update fields to show/hide based on the subsidiary country
         *
         * @param {Object} scriptContext Entry point context
         */
        TransactionServerSide.prototype.showHideFields = function(scriptContext) {
            let currentRecord = scriptContext.newRecord;
            let country = new SubsidiaryDAO().getSubsidiaryCountry(currentRecord.getValue({ fieldId: SUBSIDIARY }));

            let fieldsStore = new FieldsStore();

            let recordObj = {
                type: currentRecord.type,
                countries: country
            };

            let fieldsObj = fieldsStore.getFieldsToShowHide(recordObj);
            let fields = Object.keys(fieldsObj);
            for (let id in fields) {
                let displayField = this.overrides.hasOwnProperty(fields[id]) ?
                    this.overrides[fields[id]] : fieldsObj[fields[id]].display;
                let recordField = scriptContext.form.getField({ id: fields[id] });
                if (!displayField) {
                    recordField.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
                }
            }
        };


        /**
         * Convenience method to get field value regardless of event type
         *
         * @param {String} fieldId Field Id
         * @param {Object} context Script context
         * @returns {*}
         */
        TransactionServerSide.prototype.getFieldValue = function(fieldId, context){
            let value;
            let newRecord = context.newRecord;
            let oldRecord = context.oldRecord;
            let modifiedFields = newRecord.getFields();

            /* old record always contains all field values */
            /* new record only contains field values that are subjected to xedit */
            /* behavior is the same in beforeSubmit and afterSubmit */
            if (modifiedFields.indexOf(fieldId) !== -1) {
                value = newRecord.getValue(fieldId);
            } else if (oldRecord) {
                value = oldRecord.getValue(fieldId);
            }

            return value;
        };


        /**
         * Get entity information
         *
         * @param {Object} scriptContext
         */
        TransactionServerSide.prototype.getEntityInfo= function(scriptContext){
            let entityInfo;
            let entityId = this.getFieldValue(ENTITY, scriptContext);
            let entityType;

            switch (scriptContext.newRecord.type) {
                case record.Type.VENDOR_BILL:
                case record.Type.VENDOR_CREDIT:
                case record.Type.PURCHASE_ORDER:
                    entityType = search.Type.VENDOR;
                    break;
                case record.Type.EXPENSE_REPORT:
                    entityType = search.Type.EMPLOYEE;
                    break;
                default:
                    entityType = search.Type.CUSTOMER;
                    break;
            }

            let entityDAO = new EntityDAO({type: entityType});
            entityInfo = entityDAO.retrieveEntityById(entityId);

            return entityInfo;
        };

        /**
         * Checks if a specific field was updated with a new value
         *
         * @param {String} fieldId Field Id
         * @param {Object} context Script context
         * @returns boolean
         */
        TransactionServerSide.prototype.isFieldModified=function(fieldId, context){
            let newRecord = context.newRecord;
            let oldRecord = context.oldRecord;

            if (oldRecord) {
                let newValue = newRecord.getValue(fieldId);
                let oldValue = oldRecord.getValue(fieldId);
                return newRecord.getFields().indexOf(fieldId) !== -1 && newValue !== oldValue;
            }
            return false;
        };

        /**
        * Set Tax-exempt entity based from Tax-exempt entity fld in vendor record
        * if checked in vendor, field on vendor bill & vendor credit is checked
        * else, field on vendor bill & vendor credit is unchecked but can be checked
        *
        * @param {Object} scriptContext Entry point context
        */
        TransactionServerSide.prototype.setTaxExemptEntity = function(scriptContext) {
            let currentRecord = scriptContext.newRecord;
            let entityInfo = this.getEntityInfo(scriptContext);
            let taxExemptEntity = entityInfo.taxExemptEntity;
            let recordField = scriptContext.form.getField({ id:TAX_EXEMPT_ENTITY });

            if (recordField){
                if(taxExemptEntity){
                    currentRecord.setValue({
                        fieldId: TAX_EXEMPT_ENTITY,
                        value: true
                    });
                }
            }
        }

    return TransactionServerSide;

});
