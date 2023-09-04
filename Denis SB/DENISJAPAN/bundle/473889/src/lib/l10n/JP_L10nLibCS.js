/**
 *    Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
        "N/https",
        "N/url",
        "N/ui/dialog"],
    (https, url, dialog )=>{

    /**
     *
     * @param config
     * @param config.suiteletScriptId
     * @param config.suiteletDeploymentId
     * @param https
     * @param url
     * @param dialog
     * @returns {{reinstall: reinstall, showDetails: showDetails}}
     */
    class CreateClientScriptFromConfig{

        constructor(config, https, url, dialog, document){
            this.document = document;
            //this.missingRequiredConfig = [];

            // if (this.missingRequiredConfig.length > 0) {
            //     // TODO: Replace with translatable message
            //     throw 'Missing required parameters: ' + this.missingRequiredConfig.join(',')
            // }

            this.SUITELET_SCRIPT_ID = config.suiteletScriptId;
            this.SUITELET_DEPLOYMENT_ID = config.suiteletDeploymentId;
            this.requestUrl = '';
        }

        /**
         * Callback function for failed promises
         *
         * @param {String} reason
         */
        failCallback(reason){
            dialog.alert({
                title: 'Failure',
                message: reason
            });
        }

        /**
         * Update list values based on request response
         *
         * @param {Object} response
         * @param {Object} reinstallParams - the parameters from the reinstall click event
         */
         updateValues(response, reinstallParams){

            let classValueMap = {
                "result-status": "status",
                "result-modifieddate": "updateddate",
                "result-modifiedby": "updatedby"
            };

            let parentNode = document.getElementById('localizationComponent' + reinstallParams.id);
            for (let i = 0; i < parentNode.childNodes.length; i++) {
                let className = parentNode.childNodes[i].className;
                if (classValueMap.hasOwnProperty(className)) {
                    let tdNode = parentNode.childNodes[i];
                    if (className === 'result-status') {
                        let linkNodes = tdNode.getElementsByTagName('a');
                        if (linkNodes.length > 0) {
                            linkNodes[0].setAttribute('data-details', response['details']);
                            linkNodes[0].innerHTML = response[classValueMap[className]];
                            linkNodes[0].className = (response['errorStatus']) ? 'error-status' : '';
                        }
                    } else {
                        tdNode.innerHTML = response[classValueMap[className]];
                    }
                }
            }
        }

        /**
         * Callback function for https.post promise
         *
         * @param {Object} linkObj - Reinstall link DOM object
         * @param {Object} reinstallParams - parameters passed from UI click event
         */
        processResponse(linkObj, reinstallParams){
            /**
             * @param response - context response object
             */
            return (response)=>{
                let responseBody = JSON.parse(response.body);
                this.updateValues(responseBody, reinstallParams);
                linkObj.style.display = 'inline';
            }
        }

        /**
         * Handles 'reinstall' link click
         *
         * @param {Object} obj Reinstall link DOM object
         * @param {Object} params parameters passed from UI click event
         */
         reinstall(obj, params){
            let confirmMessage = params.confirmMessage;
            confirmMessage = confirmMessage.replace('{COMPONENTNAME}', params.name);
            dialog.confirm({
                title: params.confirm,
                message: confirmMessage
            })
                .then(this.confirmCallback(obj, params))
                .catch(this.failCallback);
        }

        /**
         * Callback function for confirm dialog
         *
         * @param {Object} linkObj DOM object representing the a link
         * @param {Object} reinstallParams object containing the action params
         * @param {Boolean} val
         */
         confirmCallback(linkObj, reinstallParams){
            return (val)=>{
                if (val === true) {
                    linkObj.style.display = 'none';
                    this.requestUrl = this.getRequestUrl();

                    let parentNode = document.getElementById('localizationComponent' + reinstallParams.id);
                    let statusNodes = parentNode.getElementsByClassName('result-status');
                    if (statusNodes.length > 0) {
                        let statusLinks = statusNodes[0].getElementsByTagName('a');
                        if (statusLinks.length > 0) {
                            statusLinks[0].className = '';
                            statusLinks[0].innerHTML = '...';
                        }
                    }

                    https.post.promise({
                        url: this.requestUrl,
                        body: reinstallParams
                    }).then(this.processResponse(linkObj, reinstallParams)).catch(this.failCallback);
                }
            }
        }


        /**
         * Show dialog for details
         *
         * @param {Object} obj DOM element
         */
         showDetails(obj){
            let details = obj.getAttribute('data-details');
            if (details) {
                dialog.alert({
                    title: 'Details',
                    message: details
                });
            }
        }

         getRequestUrl(){
            if (!this.requestUrl) {
                return url.resolveScript({
                    scriptId: this.SUITELET_SCRIPT_ID,
                    deploymentId: this.SUITELET_DEPLOYMENT_ID
                });
            } else {
                return this.requestUrl;
            }
        }

         refreshPage(){
            document.location = this.getRequestUrl();
        }

    }

    return CreateClientScriptFromConfig;

});
