/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    './JP_TransactionUI',
    './JP_DatesCalculator',
    './JP_TransactionValidator',
    './JP_CompInfoSUCaller',
    '../lib/JP_StringUtility'],
     (TransactionUI,
        DatesCalculator,
        TransactionValidator,
        CompInfoSUCaller,
        StringUtility
        ) => {

        let CLOSING_DATE_FIELD = "custbody_suitel10n_inv_closing_date";
        let INVOICE_SUMMARY_DATE_FIELD = "custbody_suitel10n_jp_ids_date";
        let SUBSIDIARY_FIELD = "subsidiary";
        let ENTITY_FIELD = "entity";
        let TRANSFORM_FIELD = "transform";
        let JP_COUNTRY = "JP";
        let INCLUDE_INVOICE_SUMMARY_FIELD = "custbody_4392_includeids";
        let INVOICE_SUMMARY_RECORD_FIELD = "custbody_suitel10n_jp_ids_rec";

        class SalesTransactionUI extends TransactionUI{

            constructor() {
                super();
                this.name = 'SalesTransactionUI';
            }

            /**
             * Update other closing date field
             *
             * @param {Object} currentRecord Current record object
             * @param {Date} closingDate Closing date value
             */
            syncClosingDate(currentRecord, closingDate){
                let otherClosingDateField = this.dateFields.closingDate === CLOSING_DATE_FIELD ?
                    INVOICE_SUMMARY_DATE_FIELD : CLOSING_DATE_FIELD;
                currentRecord.setValue({
                    fieldId: otherClosingDateField,
                    value: closingDate,
                    ignoreFieldChange: true
                });
            }

            /**
             * Set closing date fields to blank
             *
             * @param {Object} currentRecord Current record object
             */

            clearClosingDateFields(currentRecord){
                currentRecord.setValue({fieldId: this.dateFields.closingDate, value: '', ignoreFieldChange: true});
                this.syncClosingDate(currentRecord, '');
            }

            /**
             * Set closing date depending based on payment term
             *
             * @param {Object} currentRecord Current record object
             * @param {Date} tranDate Transaction date
             */
            setAndSyncClosingDate (currentRecord, tranDate) {
                let datesCalculator = new DatesCalculator(this.paymentTerm);
                let closingDate = datesCalculator.calculateClosingDate(tranDate);
                this.setClosingDate(currentRecord, tranDate, closingDate);
                this.syncClosingDate(currentRecord, closingDate);
            }

            /**
             * Set initial values of Invoice Summary related fields
             *
             * @param {Object} currentRecord Current record object
             * @param {String} mode Client script mode
             * */

            setInitialValues(currentRecord, mode) {

                if(this.entityObj.isJPEntityWithTerms){

                    let isTransform = currentRecord.getValue({fieldId: TRANSFORM_FIELD});
                    if (isTransform) {
                        currentRecord.setValue({
                            fieldId: INCLUDE_INVOICE_SUMMARY_FIELD,
                            value: this.entityObj.entityInfo.useInvoiceSummary
                        });
                        if(!this.entityObj.entityInfo.useInvoiceSummary){
                            currentRecord.setValue({
                                fieldId: INVOICE_SUMMARY_DATE_FIELD,
                                value: ''
                            });
                        }
                    } else if (mode === 'edit') {
                        let invoiceSummary = currentRecord.getValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD});
                        let includeISField = currentRecord.getField({fieldId: INCLUDE_INVOICE_SUMMARY_FIELD});
                        if (includeISField) {
                            includeISField.isDisabled = (invoiceSummary) ? true : false;
                        }
                    } else if (mode === 'copy') {
                        currentRecord.setValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD,value:''});
                    }
                }
            }

            /**
             * Validate entity field
             *
             * @param {Object} currentRecord Current record object
             * @param {String} oldEntity ID of the previous entity
             */
            validateEntityField(validationParams){
                let currentRecord = validationParams.scriptContext.currentRecord;
                let oldEntity = validationParams.oldEntity;

                this.loadMessageObject(currentRecord.type);
                let invoiceSummary = currentRecord.getValue({fieldId: INVOICE_SUMMARY_RECORD_FIELD});
                let transactionValidator = new TransactionValidator();
                let entityEval = transactionValidator.validateEntity({
                    invoiceSummary: invoiceSummary,
                    recordType: currentRecord.type
                });

                let isValid = (entityEval.isValid) ? true : false;
                if (!isValid) {
                    let message = this.messages[entityEval.messageCode];
                    if (entityEval.parameters) {
                        let stringUtil = new StringUtility(message);
                        message = stringUtil.replaceParameters(entityEval.parameters);
                    }
                    alert(message);
                    currentRecord.setValue({fieldId: ENTITY_FIELD, value: oldEntity, ignoreFieldChange: true});
                }
                return isValid;
            }

            /**
             * Check if subsidiary country is not JP or there is no entity
             *
             * @param {Object} currentRecord Current record object
             */
            getSubsidiaryCountry(currentRecord){
                let entity = currentRecord.getValue({fieldId: ENTITY_FIELD});
                let subsidiary = currentRecord.getValue({fieldId: SUBSIDIARY_FIELD});
                let country = subsidiary ? CompInfoSUCaller.getCompInfo(subsidiary).subsidiaryCountry : 'BLANK';

                return {
                    ticker : country,
                    isNonJapanOrHasNoEntity : (!entity || country != JP_COUNTRY),
                    entity : entity
                };
            }

            /**
             * Initialize objects, fields and display settings
             *
             * @param {Object} initParams Initialization parameters
             */
            initObjectsAndFieldSettings(initParams){

                let currentRecord = initParams.scriptContext.currentRecord;
                let mode = initParams.scriptContext.mode;
                let country = initParams.country;

                this.loadMessageObject(currentRecord.type);
                this.setPaymentTermsFromJPEntity(currentRecord, country);
                this.setInitialValues(currentRecord, mode);
                this.enableDisableTermsField(currentRecord);
            }
        }

        return SalesTransactionUI;

    });
