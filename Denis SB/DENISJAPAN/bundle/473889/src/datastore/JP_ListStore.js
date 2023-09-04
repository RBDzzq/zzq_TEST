/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['../lib/JP_TCTranslator'],  (translation) => {


    class JP_ListStore {

        constructor() {
            //ideally this is should have been a custom list,
            //but due to its dynamic nature it is in code.
            this.ISPDF_FILE_FORMATS = {
                closingdate_custname : 1, //  option available and default if individual pdf is checked)
                is_recordnumber : 2,
                is_recordnumber_closingdate : 3,   // default if individual pdf unchecked
                statementdate_batchid : 4,
                statementdate_subsidiary_batchid : 5,
                statementdate_istext_is_recordnumber : 6
            };

            this.BATCH_STATUS = {
                ERROR : 1,
                QUEUED : 2,
                PROCESSED: 3,
                INVALID : 4,
                HANGING : 6
            };

            this.PDF_FORMAT_VALUES = [];
        }

        /**
         * Creates a translated array to be used to populate a select field. Returns a different list depending if OW or SI
         *
         * @param {boolean} isOW
         * @returns {none}
         */
        getFormatSelectOpt(isOW){

            let stringKeys = ['SEL_PDFFORMATOPT1', 'SEL_PDFFORMATOPT2',
                'SEL_PDFFORMATOPT3', 'SEL_PDFFORMATOPT4', 'SEL_PDFFORMATOPT5', 'SEL_PDFFORMATOPT6'];
            let localizedStrings = new translation().getTexts(stringKeys);

            let valueidx = 1;
            for(let x=0; x<stringKeys.length; x++){
                if(!isOW && valueidx===5){
                    //exclude option with subsidiary for SI
                    valueidx++;
                    continue;
                }

                this.PDF_FORMAT_VALUES.push({
                    text: localizedStrings.texts[stringKeys[x]](),
                    value: valueidx++
                });
            }
        }

    }

    return JP_ListStore;

});
