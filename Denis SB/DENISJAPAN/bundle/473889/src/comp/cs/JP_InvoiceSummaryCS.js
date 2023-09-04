/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 */
define([
    '../../app/JP_RegenerationValidator',
    '../../lib/JP_TCTranslator',
    'N/currentRecord',
    'N/ui/message',
    'N/url',
    'N/https'
], (
    RegenerationValidator,
    translator,
    currentRecord,
    message,
    url,
    https
) => {

	let CANNOT_REGENERATE_NOT_CREATED = 'IDS_REGEN_CANNOT_PROCEED_NOT_CREATED';
    let CANNOT_REGENERATE_PRINTING = 'IDS_REGEN_CANNOT_PROCEED_PRINTING';
    let PROCESS_COMPLETION_NOTIFICATION = 'IDS_GEN_PROCESS_COMPLETION_NOTIFICATION';
    let REQUIRED_FEATURES_DISABLED = 'IDS_GEN_REQUIRED_FEATURES_DISABLED';
    let SUITETAX_INCOMPATIBLE = 'IDS_GEN_PAGE_MESSAGE_SUITETAXNOTSUPPORTED';
    let REGENERATION_ONGOING = 'IDS_REGEN_REGENERATION_ONGOING';

    function JP_InvoiceSummaryCS() {

        if (JP_InvoiceSummaryCS.Instance !== undefined) {
            return JP_InvoiceSummaryCS.Instance;
        }

        /**
         * Load messages to be used
         */
        this.loadMessageObject = () => {

            if (this.messages.length < 1) {
                this.messages = new translator().getTexts([
                    CANNOT_REGENERATE_NOT_CREATED,
                    CANNOT_REGENERATE_PRINTING,
                    PROCESS_COMPLETION_NOTIFICATION,
                    REQUIRED_FEATURES_DISABLED,
                    SUITETAX_INCOMPATIBLE,
                    REGENERATION_ONGOING
                ], true);
            }
        };


        /**
         * Regeneration entry point
         */
        this.regenerateInvoiceSummary = (params) => {

            this.loadMessageObject();

            if (!this.regenerating) {
                this.regenerating = true;

                let currentRec = currentRecord.get();
                let validator = new RegenerationValidator();
                let validationResult = validator.validate(currentRec);
                if (validationResult.isValid) {

                    if (this.bannerMessage.hasOwnProperty('hide')) {
                        this.bannerMessage.hide();
                    }
                    this.bannerMessage = message.create({
                        type: message.Type.INFORMATION,
                        message: this.messages[REGENERATION_ONGOING],
                    });
                    this.bannerMessage.show();

                    this.triggerRegenService(currentRec.id);

                } else {
                    if (this.bannerMessage.hasOwnProperty('hide')) {
                        this.bannerMessage.hide();
                    }
                    this.bannerMessage = message.create({
                        type: validationResult.type === validator.VALIDATION_TYPES.FAILURE ? message.Type.ERROR : message.Type.INFORMATION,
                        message: this.messages[validationResult.messageCode],
                    });
                    this.bannerMessage.show();
                    this.regenerating = false;
                }

            } else {
                if (this.bannerMessage.hasOwnProperty('hide')) {
                    this.bannerMessage.hide();
                }
                this.bannerMessage = message.create({
                    type: message.Type.INFORMATION,
                    message: this.messages[REGENERATION_ONGOING],
                });
                this.bannerMessage.show();
            }

        };


        /**
         * Start service call to regeneration suitelet
         *
         * @param {String} id Invoice Summary record ID
         */
        this.triggerRegenService = (id) =>  {

            let regenServiceURL = url.resolveScript({
                scriptId: 'customscript_japan_loc_regeneration_su',
                deploymentId: 'customdeploy_japan_loc_regeneration_su'
            });

            https.post.promise({
                url: regenServiceURL,
                body: {
                    recId: id
                }
            }).then(handleResponse).catch(handleError);

        };


        /**
         * Handle request response
         *
         * @param {Object} response Request response object
         */
        function handleResponse(response) {
            if (JP_InvoiceSummaryCS.Instance.bannerMessage.hasOwnProperty('hide')) {
                JP_InvoiceSummaryCS.Instance.bannerMessage.hide();
            }

            let responseBody = JSON.parse(response.body);
            if (responseBody.fileLink) {
                window.open(responseBody.fileLink, '_blank');
            } else {
                JP_InvoiceSummaryCS.Instance.bannerMessage = message.create({
                    type: message.Type.CONFIRMATION,
                    message: JP_InvoiceSummaryCS.Instance.messages[PROCESS_COMPLETION_NOTIFICATION]
                });
                JP_InvoiceSummaryCS.Instance.bannerMessage.show();
            }

            JP_InvoiceSummaryCS.Instance.regenerating = false;
        }


        /**
         * Handle request error
         *
         * @param {Object} reason Request failure reason
         */
        function handleError(reason) {
            if (JP_InvoiceSummaryCS.Instance.bannerMessage.hasOwnProperty('hide')) {
                JP_InvoiceSummaryCS.Instance.bannerMessage.hide();
            }
            JP_InvoiceSummaryCS.Instance.bannerMessage = message.create({
                type: message.Type.ERROR,
                message: reason.message
            });
            JP_InvoiceSummaryCS.Instance.bannerMessage.show();
            JP_InvoiceSummaryCS.Instance.regenerating = false;
        }


        this.name = 'JP_InvoiceSummary';
        this.messages = [];
        this.regenerating = false;
        this.bannerMessage = {};
        JP_InvoiceSummaryCS.Instance = this;
        return JP_InvoiceSummaryCS.Instance;

    }

    return {
        regenerateInvoiceSummary: (params)=>{ return new JP_InvoiceSummaryCS().regenerateInvoiceSummary(params); },
        pageInit: (scriptContext)=>{} //empty pageInit so that CS can be created
    };

});
