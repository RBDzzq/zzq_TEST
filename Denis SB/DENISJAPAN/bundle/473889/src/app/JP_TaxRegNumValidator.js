/**
 * Copyright (c) 2023, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    'N/record',
    '../lib/JP_TCTranslator'
    ],(
        record,
        translator
    ) => {

    const TAXREGNUM_LENGTH = 14;
    const VALIDATION_TAXREGNUM_LEN = 'VALIDATION_TAXREGNUM_LEN';
    const MAND_TAX_REG_NUM_ERR_MSG = 'MANDATORY_VENDOR_TAX_REG_NUM';
    const ENT_VEND_TAX_REG_NUM_FLD = 'custentity_jp_vendtaxregnum';
    const ENT_QUALIFIED_INVOICE_ISSUER_FLD = 'custentity_jp_vendtaxexempent';
    const TRANS_VEND_TAX_REG_NUM_FLD = 'custbody_jp_vendtaxregnum';
    const TRANS_QUALIFIED_INVOICE_ISSUER_FLD = 'custbody_jp_vendtaxexempent';

    let messages = [];
    let vendorTransaction = {};

    class JP_TaxRegNumValidator{

        constructor() {
            this.name = 'JP_TaxRegNumValidator';

            let vendorTransFields = {
                taxRegNum : TRANS_VEND_TAX_REG_NUM_FLD,
                qualifiedInvIssuer : TRANS_QUALIFIED_INVOICE_ISSUER_FLD
            }
            vendorTransaction[record.Type.VENDOR_BILL] = vendorTransFields;
            vendorTransaction[record.Type.VENDOR_CREDIT] = vendorTransFields;
            vendorTransaction[record.Type.PURCHASE_ORDER] = vendorTransFields;
            vendorTransaction[record.Type.VENDOR] = {
                taxRegNum : ENT_VEND_TAX_REG_NUM_FLD,
                qualifiedInvIssuer : ENT_QUALIFIED_INVOICE_ISSUER_FLD
            };
            vendorTransaction[record.Type.SUBSIDIARY] = {taxRegNum: 'custrecord_jp_loc_tax_reg_number' };
        }

        /**
         * Initializes a message object to load the translated messages
         *
         */
        loadMessageObject() {
            if (messages.length < 1) {
                let stringCodes = [
                    MAND_TAX_REG_NUM_ERR_MSG,
                    VALIDATION_TAXREGNUM_LEN
                ];
                messages = new translator().getTexts(stringCodes, true);
            }
        }

        /**
         * Does validation for vendor tax registration field for the front end
         * should be 14-digit number, validation does not include Subsidiary
         * since we cannot attach CS on a Subsidiary Record.
         *
         * @param {Object} currentRecord currentRecord Object
         * @returns {Boolean}
         */
        validateTaxRegNumUI(currentRecord) {
            return this.validate(currentRecord, true);
        }
        /**
         * Does validation for vendor tax registration field for the backend.
         *
         * @param {Object} currentRecord currentRecord Object
         * @returns {Boolean}
         */
        validateTaxRegNumBackEnd(currentRecord){
            return this.validate(currentRecord, false);
        }

        validate(currentRecord, isFrontEnd){
            let result = true;
            let taxRegNum, qualifiedInvIssuer;

            let rec = vendorTransaction[currentRecord.type];
            if(rec){
                taxRegNum = currentRecord.getValue({fieldId: rec.taxRegNum});
                if(rec.qualifiedInvIssuer){
                    qualifiedInvIssuer = currentRecord.getValue({fieldId: rec.qualifiedInvIssuer});
                }
            }

            this.loadMessageObject();

            //Check if Qualified Invoice Issuer is true
            if (qualifiedInvIssuer && !taxRegNum){
                //vendor tax registration number becomes mandatory
                this.showMessage(messages[MAND_TAX_REG_NUM_ERR_MSG], isFrontEnd);
                result = false;
            }

            if(taxRegNum && taxRegNum.length !== TAXREGNUM_LENGTH ){
                this.showMessage(messages[VALIDATION_TAXREGNUM_LEN], isFrontEnd);
                result = false
            }

            return result;
        }

        showMessage(msg, isFrontEnd){
            if(isFrontEnd){
                alert(msg);
            }
            else{
                throw new Error(msg);
            }
        }
    }

    return JP_TaxRegNumValidator;
});