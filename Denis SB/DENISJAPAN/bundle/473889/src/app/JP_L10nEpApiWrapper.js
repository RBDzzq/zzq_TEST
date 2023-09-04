/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 *
 */
define([
    'require',
    '../data/JP_FileDAO',
    '../lib/JP_TCTranslator'
], (
    require,
    FileDao,
    translator
) =>{
	let EP_API_NOT_FOUND_MSG_CODE = 'L10N_INSTALLATION_UNABLE_TO_LOCATE';

    class L10nEpApiWrapper {

        constructor() {
            this.texts = new translator().getTexts([EP_API_NOT_FOUND_MSG_CODE],true);

            try{
                let fileDao = new FileDao();
                this.apiPath = fileDao.getEpApiFullPath();
            } catch(ex){
                throw {
                    result: 'SUITEAPP_UNAVAILABLE',
                    message: this.texts[EP_API_NOT_FOUND_MSG_CODE]
                };
            }
        }

        /**
         * Upsert template to Core SuiteApp
         *
         * @param {String} params.bundleId - Bundle ID
         * @param {String} params.bundleName - Bundle Name
         * @param {String} params.appId - App ID of the Bundle
         * @param {Integer} params.fileId - file ID of the JSON file of the request
         *
         *
         * @returns {Object} result - returns the result of the API from Core SuiteApp
         */
        upsertTemplate(params){
            let result;

            if(this.apiPath){
                require([this.apiPath], (api) => {
                    result = api.upsertTemplate(params);
                });
            } else {
                throw {
                    result: 'EP_API_NOT_FOUND',
                    message: this.texts[EP_API_NOT_FOUND_MSG_CODE]
                };
            }
            return result;
        }

        /**
         * Sets template to Inactive in Core SuiteApp
         *
         * @param {String} params.bundleId - Bundle ID
         * @param {String} params.bundleName - Bundle Name
         * @param {String} params.appId - App ID of the Bundle
         * @param {Integer} params.templateName - file ID of the JSON file of the request
         *
         *
         * @returns {Object} result - returns the result of the API from Core SuiteApp
         */
        inactivateTemplate(params){
            let result;

            if(this.apiPath){
                require([this.apiPath], (api) => {
                    result = api.inactivateTemplate({
                        bundleId: params.bundleId,
                        bundleName: params.bundleName,
                        appId: params.appId,
                        templateName: params.templateName
                    });
                });
            } else {
                throw {
                    result: 'EP_API_NOT_FOUND',
                    message: this.texts[EP_API_NOT_FOUND_MSG_CODE]
                };
            }

            return result;
        }

    }

    return L10nEpApiWrapper;

});
