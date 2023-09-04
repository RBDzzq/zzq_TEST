/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define([
    'N/runtime',
    'N/search'
], (
    runtime,
    search
) => {

    let CANNOT_REGENERATE_NOT_CREATED = 'IDS_REGEN_CANNOT_PROCEED_NOT_CREATED';
    let CANNOT_REGENERATE_PRINTING = 'IDS_REGEN_CANNOT_PROCEED_PRINTING';
    let SUITETAX_INCOMPATIBLE = 'IDS_GEN_PAGE_MESSAGE_SUITETAXNOTSUPPORTED';
    let REQUIRED_FEATURES_DISABLED = 'IDS_GEN_REQUIRED_FEATURES_DISABLED';
    let IS_BATCH_FIELD = 'custbody_suitel10n_jp_ids_gen_batch';
    let BATCH_REC = 'customrecord_suitel10n_jp_ids_gen_batch';
    let BATCH_DOC = 'custrecord_suitel10n_jp_ids_doc';
    let IS_GENERATION_COMPLETE_FLAG = 'custbody_suitel10n_jp_ids_gen_complete';

    class RegenerationValidator {

        constructor() {
            this.name = 'RegenerationValidator'
            this.VALIDATION_TYPES = {
                SUCCESS: 'SUCCESS',
                FAILURE: 'FAILURE',
                WARNING: 'WARNING',
            };
        }

        /**
         * Validations during Invoice Summary regeneration
         *
         * @param {Object} currentRecord Current Record object
         * @returns {Object} Validation object
         */
        validate(currentRecord){
            if (this.isSuiteTaxEnabled()) {
                return {
                    isValid: false,
                    messageCode: SUITETAX_INCOMPATIBLE,
                    type: this.VALIDATION_TYPES.FAILURE
                };
            }

            if (!this.isFeaturesEnabled()) {
                return {
                    isValid: false,
                    messageCode: REQUIRED_FEATURES_DISABLED,
                    type: this.VALIDATION_TYPES.FAILURE
                };
            }

            let batchID = currentRecord.getValue(IS_BATCH_FIELD);
            if (!this.hasBatchPDF(batchID)) {
                return {
                    isValid: false,
                    messageCode: CANNOT_REGENERATE_NOT_CREATED,
                    type: this.VALIDATION_TYPES.FAILURE
                };
            }

            if (!this.isGenerationComplete(currentRecord.id, currentRecord.type)) {
                return {
                    isValid: false,
                    messageCode: CANNOT_REGENERATE_PRINTING,
                    type: this.VALIDATION_TYPES.FAILURE
                };
            }

            return {
                isValid: true,
                type: this.VALIDATION_TYPES.SUCCESS
            };
        };


        /**
         * Check if IS generation is complete
         *
         * @param {String} recId Invoice Summary record ID
         * @param {String} type Record type
         * @returns {Boolean} Generation complete flag
         */
        isGenerationComplete(recId, type) {
            let invoiceSummaryLookup = search.lookupFields({
                type: type,
                id: recId,
                columns: IS_GENERATION_COMPLETE_FLAG
            });
            return invoiceSummaryLookup[IS_GENERATION_COMPLETE_FLAG];
        }


        /**
         * Check if batch record has PDF
         *
         * @param {String} batchID
         * @returns {Boolean} has PDF flag
         */
        hasBatchPDF(batchID) {
            let batchLookup = search.lookupFields({
                type: BATCH_REC,
                id: batchID,
                columns: BATCH_DOC
            });
            return batchLookup[BATCH_DOC].length > 0;
        }


        /**
         * Check if SuiteTax is enabled
         *
         * @returns {Boolean} SuiteTax enabled flag
         */
        isSuiteTaxEnabled() {
            return runtime.isFeatureInEffect({
                feature: 'TAX_OVERHAULING'
            });
        }

        /**
         * Check if required features are enabled
         *
         * @returns {Boolean} Features enabled flag
         */
         isFeaturesEnabled() {
            let isAdvancedPrintingEnabled = runtime.isFeatureInEffect({feature:'ADVANCEDPRINTING'});
            let isCustomTransactionsEnabled = runtime.isFeatureInEffect({feature:'CUSTOMTRANSACTIONS'});
            let isServerSuiteScriptEnabled = runtime.isFeatureInEffect({feature:'SERVERSIDESCRIPTING'});
            return (isAdvancedPrintingEnabled && isCustomTransactionsEnabled && isServerSuiteScriptEnabled);
        }
    }

    return RegenerationValidator;

});
