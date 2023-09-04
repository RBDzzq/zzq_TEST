/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    'N/record',
    './JP_DatesCalculator',
    './JP_DueDateAdjuster',
    './JP_PaymentTermUtility',
    './JP_TransactionValidator',
    './JP_CompInfoSUCaller',
    './JP_EntityInfoSUCaller',
    '../data/JP_EntityDAO',
    '../datastore/JP_FieldsStore',
    '../lib/JP_StringUtility',
    '../lib/JP_TCTranslator'
    ],

     (
         record,
        DatesCalculator,
        DueDateAdjuster,
        PaymentTermUtility,
        TransactionValidator,
        CompInfoSUCaller,
        EntityInfoSUCaller,
        EntityDAO,
        FieldsStore,
        StringUtility,
        translator) => {

        let DUE_DATE_FIELD = 'duedate';
        let ENTITY_FIELD = 'entity';
        let SUBSIDIARY_FIELD = 'subsidiary';
        let TRAN_DATE_FIELD = 'trandate';
        let CLOSING_DATE_FIELD = 'custbody_suitel10n_inv_closing_date';
        let JP_COUNTRY = 'JP';
        let DUE_DATE_ADJ_NO_CHANGE = '3';
        let INCLUDE_INVOICE_SUMMARY_FIELD = "custbody_4392_includeids";
        let TAX_EXEMPT_ENTITY = "custbody_jp_vendtaxexempent";

        class TransactionUI {

            constructor() {
                this.name = 'TransactionUI';
                this.messages = [];
                this.entityObj = {};
                this.paymentTerm = {};
                this.dateFields = {
                    closingDate: CLOSING_DATE_FIELD,
                    dueDate: DUE_DATE_FIELD
                };
                this.overrides = {};
            }

            /**
             * Load messages using record type and get message values
             *
             * @param {Array} messagesArray
             * @param {String} type
             */
            loadMessageObject(type){

                if (Object.keys(this.messages).length < 1) {

                    let stringCodes = new TransactionValidator().getMessageCodes(type);
                    let translationIds = [];
                    if (stringCodes.length > 0) {

                        for(let keys in stringCodes){
                            translationIds.push(stringCodes[keys]);
                        }

                        this.messages = new translator().getTexts(translationIds, true);
                    }
                }
            };


            /**
             * Show Hide fields using subsidiary country, transaction type, transaction category
             *
             * @param {Object} currentRecord Current record object
             */
            showHideFields(currentRecord, countryParam) {

                let subsidiary = currentRecord.getValue({ fieldId: SUBSIDIARY_FIELD });
                let country = countryParam ? countryParam : CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;

                let fieldsStore = new FieldsStore();
                let fieldsObj = fieldsStore.getFieldsToShowHide({
                    type: currentRecord.type,
                    countries: [country]
                });

                let fields = Object.keys(fieldsObj);
                for (let id in fields) {
                    let displayField = this.overrides.hasOwnProperty(fields[id]) ?
                        this.overrides[fields[id]] : fieldsObj[fields[id]].display;
                    let recordField = currentRecord.getField({ fieldId: fields[id] });
                    recordField.isDisplay = displayField;
                }
            };


            /**
             * Set payment terms from entity
             *
             * @param {Object} currentRecord
             */
            setPaymentTermsFromJPEntity(currentRecord, countryParam){
                let entityid = currentRecord.getValue({ fieldId: ENTITY_FIELD });
                let subsidiary = currentRecord.getValue({ fieldId: SUBSIDIARY_FIELD });
                let country = countryParam ? countryParam : CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry;

                let params = {
                    tranType: currentRecord.type,
                    entityid: entityid
                };
                let entityInfo = entityid && country === JP_COUNTRY ? EntityInfoSUCaller.getEntityInfo(params) : {};
                let isJPEntityWithTerms = entityid && country === JP_COUNTRY && entityInfo.hasOwnProperty('terms') &&
                    entityInfo.terms.length > 0;

                let entityValidation = new TransactionValidator().entityUsesInvoiceSummary({
                    type: currentRecord.type,
                    useInvoiceSummary: (entityInfo.hasOwnProperty('useInvoiceSummary')) ? entityInfo.useInvoiceSummary : false
                });

                if (!entityValidation.isValid) {

                    let message = this.messages[entityValidation.messageCode];
                    if (entityValidation.parameters) {
                        let stringUtil = new StringUtility(message);
                        message = stringUtil.replaceParameters(entityValidation.parameters);
                    }
                    alert(message);
                }

                this.entityObj = {
                    entityid: entityid,
                    country: country,
                    entityInfo: entityInfo,
                    isJPEntityWithTerms: isJPEntityWithTerms
                };
            };


            /**
             * Enable/disable the terms field if entity has payment terms
             *
             * @param {Object} currentRecord Current record object
             */
            enableDisableTermsField(currentRecord){
                let termsField = currentRecord.getField({ fieldId: 'terms' });
                if (termsField) {
                    switch(currentRecord.type){
                        case 'vendorbill':
                        case 'expensereport':
                            termsField.isDisabled = this.entityObj.isJPEntityWithTerms ? true : false;
                            break;
                        case 'invoice':
                        case 'creditmemo':
                        case 'salesorder':
                            let includeInInvoiceSummaryField = currentRecord.getField({ fieldId: INCLUDE_INVOICE_SUMMARY_FIELD});
                            if(includeInInvoiceSummaryField){
                                let includeInInvoiceSummary = currentRecord.getValue({ fieldId: INCLUDE_INVOICE_SUMMARY_FIELD});
                                termsField.isDisabled = includeInInvoiceSummary ? true : false;
                            }
                            break;
                        default:
                            break;
                    }
                }
            };


            /**
             * Set values for Date fields
             *
             * @param {Object} currentRecord Current record object
             */
            setDateFieldValues(currentRecord) {
                if (this.entityObj.isJPEntityWithTerms && this.entityObj.entityInfo.computeDueDate) {
                    let tranDate = currentRecord.getValue({ fieldId: TRAN_DATE_FIELD });
                    this.paymentTerm = new PaymentTermUtility(this.entityObj.entityInfo).getNextTerm(tranDate);
                    if (this.paymentTerm) {
                        let datesCalculator = new DatesCalculator(this.paymentTerm);
                        let closingDate = datesCalculator.calculateClosingDate(tranDate);
                        this.setClosingDate(currentRecord, tranDate);
                        let dueDate = datesCalculator.calculateDueDate(closingDate);

                        if (this.entityObj.entityInfo.dueDateAdj !== DUE_DATE_ADJ_NO_CHANGE) { // Not equal to 'No Change'
                            let dueDateAdjuster = new DueDateAdjuster();
                            let tranSubsidiary = (this.entityObj.entityInfo.subsidiary) ?
                                this.entityObj.entityInfo.subsidiary : '';
                            dueDate = dueDateAdjuster.doAdjustment(dueDate, tranSubsidiary, this.entityObj.entityInfo.dueDateAdj);
                        }

                        currentRecord.setValue({ fieldId: DUE_DATE_FIELD, value: dueDate });
                    }
                }
                else {
                    //use case: without JP Payment Terms and Core Term.
                    let entityInfo = EntityInfoSUCaller.getEntityInfo({
                        tranType: currentRecord.type,
                        entityid: currentRecord.getValue({fieldId: ENTITY_FIELD})
                    });

                    if (!!entityInfo.coreTerms === false) {
                        currentRecord.setValue({fieldId: this.dateFields.closingDate, value: ''});
                        //simulate core behavior, if we do not do this, when changing Vendors on the Vendor Bill
                        //record, the last due date would stick specially when switching from a vendor with payment term
                        //and compute due date=T to a Vendor without payment term and compute due date=F.
                        currentRecord.setValue({
                            fieldId: DUE_DATE_FIELD, value:
                                currentRecord.getValue({fieldId: 'trandate'})
                        });
                    }
                }
            };


            /**
             * Set Closing date field value
             *
             * @param {Object} currentRecord Current record object
             * @param {Date} tranDate Transaction date
             * @param {Date} closingDate Closing date
             */
            setClosingDate(currentRecord, tranDate, closingDate) {
                if (!closingDate) {
                    let datesCalculator = new DatesCalculator(this.paymentTerm);
                    closingDate = datesCalculator.calculateClosingDate(tranDate);
                }

                currentRecord.setValue({
                    fieldId: this.dateFields.closingDate,
                    value: closingDate
                });
            };


            /**
             * Check if current payment term is a valid one
             *
             * @returns {Boolean}
             */
            isValidPaymentTerm() {
                let hasClosingDay = this.paymentTerm.hasOwnProperty('closingDay') && this.paymentTerm.closingDay;
                let hasDueDay = this.paymentTerm.hasOwnProperty('paymentDueDay') && this.paymentTerm.paymentDueDay > 0;
                let hasDueMonth = this.paymentTerm.hasOwnProperty('paymentDueMonth') &&
                    this.paymentTerm.paymentDueMonth > -1;
                return hasClosingDay && hasDueDay && hasDueMonth;
            };


            /**
             * Get Holiday checking of subsidiary or company information
             *
             * @param {Number} subsidiary
             */
            getHolidayChecking(subsidiary){
                return CompInfoSUCaller.getCompInfo(subsidiary).useHolidayChecking;
            };

            /**
             * Set Tax-exempt entity based from Tax-exempt entity fld in vendor record
             * if checked in vendor, field on vendor bill & vendor credit is checked
             * else, field on vendor bill & vendor credit is unchecked but can be checked
             *
             * @param {Object} currentRecord Current record object
             */
            setTaxExemptEntity(currentRecord, country){
                if (country === JP_COUNTRY){
                    let entityid = currentRecord.getValue({ fieldId: ENTITY_FIELD });
                    let entityInfo, taxExemptEntity;

                    if(entityid){
                        let entityDao = new EntityDAO({type: this.getTransactionEntityType(currentRecord.type)});
                        entityInfo = entityDao.retrieveEntityById(entityid);
                        taxExemptEntity = entityInfo.taxExemptEntity;
                    }

                    let taxExemptEntityFld = currentRecord.getField({ fieldId: TAX_EXEMPT_ENTITY });

                    if (taxExemptEntityFld && taxExemptEntity){
                        currentRecord.setValue({
                            fieldId: TAX_EXEMPT_ENTITY,
                            value: true
                        });
                    }
                }
            }
            /**
             * retrieves the entity to which a given transaction belongs to using a lookup table.
             *
             * @param {string} record type of the transaction
             */
            getTransactionEntityType(recordType){
                let entityLookup = {};

                entityLookup[record.Type.VENDOR_BILL] = record.Type.VENDOR;
                entityLookup[record.Type.VENDOR_CREDIT] = record.Type.VENDOR;
                entityLookup[record.Type.PURCHASE_ORDER] = record.Type.VENDOR;
                entityLookup[record.Type.EXPENSE_REPORT] = record.Type.EMPLOYEE;

                return entityLookup[recordType];
            }

        }

        return TransactionUI;
    });
