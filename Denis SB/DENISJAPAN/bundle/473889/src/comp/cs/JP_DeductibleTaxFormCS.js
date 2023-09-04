/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    '../../app/JP_TaxFormjQueryWrapper',
    '../../app/JP_DeductibleTaxForm4',
    '../../app/JP_DeductibleTaxForm3',
    '../../app/JP_DeductibleTaxForm2',
    '../../app/JP_DeductibleTaxForm1',
    '../../app/JP_TaxForm1',
    '../../app/JP_TaxForm2',
    '../../app/JP_DeductibleTaxFormConstants',
    'N/ui/dialog',
    'N/currentRecord',
    'N/https',
    'N/url',
    'N/ui/message',
    'N/query',
    'N/runtime',
    '../../lib/JP_StringUtility',
    '../../lib/JP_TCTranslator'
],

 (domUtil,
          form4,
          form3,
          form2,
          form1,
          taxForm1,
          taxForm2,
          formConstants,
          dialog,
          currentRecord,
          https,
          url,
          message,
          query,
          runtime,
          StringUtil,
          translator) => {

        let SUBSIDIARY_FIELD = 'custpage_jpdtcf_subsidiary';
        let CALC_METHOD_FIELD = 'custpage_jpdtcf_calc_method';
        let PERIOD_FROM_FIELD = 'custpage_jpdtcf_period_from';
        let PERIOD_TO_FIELD = 'custpage_jpdtcf_period_to';
        let FIELDID_TRIGGERS_AND_COMPUTATIONS;
        let DEFAULT_PDF_FILENAME = '消費税申告書.pdf';

        let REFRESH = 'L10N_RECOVERABILITY_REFRESH';
        let PRINT_NOT_YET_AVAIL_TITLE = 'DEDUCTFORM_PRINT_PRINT_NOT_YET_AVAIL_TITLE';
        let PRINT_NOT_YET_AVAIL_MSG = 'DEDUCTFORM_PRINT_PRINT_NOT_YET_AVAILABLE_MSG';
        let PRINT_IN_PROG = 'DEDUCTFORM_PRINT_PRINT_IN_PROGRESS_TITLE';
        let ANOTHER_PRINT_IN_PROG = 'DEDUCTFORM_PRINT_ANOTHER_PRINT_IN_PROG_TITLE';
        let ANOTHER_REFRESH_IN_PROG = 'DEDUCTFORM_REFRESH_REFRESH_IN_PROG_TITLE';
        let FRONTEND_ERROR = 'DEDUCTFORM_PRINT_ERROR_FRONTENT_ERROR';
        let BACKEND_ERROR = 'DEDUCTFORM_PRINT_ERROR_BACKEND_ERROR';
        let PRINT_SUCCESSFUL = 'DEDUCTFORM_PRINT_SUCCESSFUL';
        let CANCEL_OPERATION = 'DEDUCTFORM_PRINT_CANCEL';
        let CONFIRM_REFRESH = 'DEDUCTFORM_REFRESH_CONFIRM';
        let MESSAGES = {};
        let isFormLoaded = false;
        let isPrintingInProgress = false;
        let isRefreshInProgress = false;
        let reportData = {};

        let TAXFORM1SEC3BOX = formConstants.Form.TAXFORM1SEC3BOX;
        let TAXFORM2SEC3BOX = formConstants.Form.TAXFORM2SEC3BOX;

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            FIELDID_TRIGGERS_AND_COMPUTATIONS = util.extend({}, form4);
            util.extend(FIELDID_TRIGGERS_AND_COMPUTATIONS, form3);
            util.extend(FIELDID_TRIGGERS_AND_COMPUTATIONS, form2);
            util.extend(FIELDID_TRIGGERS_AND_COMPUTATIONS, form1);
            util.extend(FIELDID_TRIGGERS_AND_COMPUTATIONS, taxForm1);
            util.extend(FIELDID_TRIGGERS_AND_COMPUTATIONS, taxForm2);
            setEventHandlers();
        }

        /**
         * Load messages (translated) to be used.
         */
        function loadMessageObject(){
            if (Object.keys(MESSAGES).length === 0) {
                MESSAGES = new translator().getTexts([
                    PRINT_NOT_YET_AVAIL_TITLE,
                    PRINT_NOT_YET_AVAIL_MSG,
                    PRINT_IN_PROG,
                    ANOTHER_PRINT_IN_PROG,
                    FRONTEND_ERROR,
                    BACKEND_ERROR,
                    PRINT_SUCCESSFUL,
                    CANCEL_OPERATION,
                    REFRESH,
                    CONFIRM_REFRESH,
                    ANOTHER_REFRESH_IN_PROG
                ], true);
            }
        }

        /**
         * This method initiates all event handlers that the CS page will need. It includes event handler callback for after finish-set-values,
         * It also includes the on change listener for input field changes.
         */
        function setEventHandlers(){
            // This event will handle any form input change on elements having class deduc-form-field-editable
            domUtil.prototype.operate({
                selector: '.calc-form-container',
                operation: 'on',
                params: ['change', '.deduc-form-field-editable', (elem)=>{
                    let id = elem.target.id;
                    if(FIELDID_TRIGGERS_AND_COMPUTATIONS[id]){
                        let obj = FIELDID_TRIGGERS_AND_COMPUTATIONS[id];
                        if(obj.triggers){
                            util.each(obj.triggers, (computeFnName)=> {
                                computeField(computeFnName);
                            });
                        }
                    }
                }]
            });
        }


        /**
         * This function shows the forms using domUtil
         */
        function showForms() {
            domUtil.prototype.operate({selector: '.calc-form-loader', operation: 'hide'});
            domUtil.prototype.operate({selector: '.calc-form-container', operation: 'show'});
        }

        /**
         * This function hides the forms using domUtil
         */
        function hideForms() {
            domUtil.prototype.operate({selector: '.calc-form-loader', operation: 'show'});
            domUtil.prototype.operate({selector: '.calc-form-container', operation: 'hide'});
        }

        /**
         * Triggers an asynchronous request to a RESTlet that will run the report
         * and call the appropriate function for processing the values
         *
         * @param {Object} params Request Parameters
         * @param {Number} params.subsidiary Subsidiary ID
         * @param {Number} params.periodStart Period ID of the starting period
         * @param {Number} params.periodEnd Period ID of the ending period
         * @param {Number} params.calcMethod Calculation Method selected
         */
        function getReportData(params) {
            hideForms();
            let serviceUrl = url.resolveScript({
                scriptId: 'customscript_su_jp_sales_purchase_report',
                deploymentId: 'customdeploy_su_jp_sales_purchase_report',
                params: params
            });

            isRefreshInProgress = true;
            https.get.promise({
                url: serviceUrl
            }).then((response) => {
                let responseObj = JSON.parse(response.body);
                if (responseObj.hasOwnProperty('errorCode')) {
                    dialog.alert({message: responseObj['errorCode']+': '+responseObj['message']});
                } else {
                    reportData = responseObj;
                    reportData.calcMethod = params.calcMethod;
                    processReportData();
                }
                isRefreshInProgress = false;
            }).catch((failResult) =>{
                dialog.alert(failResult);
                isRefreshInProgress = false;
            });
        }

        /**
         * Function for refresh button
         */
        function refresh() {
            loadMessageObject();
            let currentRec = currentRecord.get();
            let refreshParams = {
                subsidiary: currentRec.getValue(SUBSIDIARY_FIELD),
                periodStart: currentRec.getValue(PERIOD_FROM_FIELD),
                periodEnd: currentRec.getValue(PERIOD_TO_FIELD),
                calcMethod: currentRec.getValue(CALC_METHOD_FIELD)
            };

            if(isRefreshInProgress){
                dialog.alert({
                    message: MESSAGES[ANOTHER_REFRESH_IN_PROG]
                });
                return;
            }

            if (isFormLoaded) {
                dialog.create({
                    message: MESSAGES[CONFIRM_REFRESH],
                    buttons: [{label: 'OK', value: true},
                        {label: MESSAGES[CANCEL_OPERATION], value: false}]
                }).then((proceed) => {
                    if (proceed) {
                        getReportData(refreshParams);
                    }
                }).catch((failResult) => {
                    dialog.alert(failResult);
                });
            } else {
                getReportData(refreshParams);
            }
        }

        /**
         * Handle processing of report data
         * Pre-populate fields, trigger computations and show the form after
         */
        function processReportData() {
            let preloadFields = [
                // Form 2-2
                'deducform4box1a', 'deducform4box1b', 'deducform4box1c', 'deducform4box9a', 'deducform4box9b',
                'deducform4box9c', 'deducform4box11c', 'deducform4box13c', 'deducform4box17a', 'deducform4box17b',
                'deducform4box17c', 'deducform4box18a', 'deducform4box18b', 'deducform4box18c',
                // Form 2-1
                'deducform3box1d', 'deducform3box1e', 'deducform3box2f', 'deducform3box3f', 'deducform3box6f',
                'deducform3box9d', 'deducform3box9e', 'deducform3box11e', 'deducform3box13d', 'deducform3box13e',
                'deducform3box17d', 'deducform3box17e', 'deducform3box18d', 'deducform3box18e',
                // Form 1-2
                'deducform2box1_1a', 'deducform2box1_1b', 'deducform2box1_1c', 'deducform2box1_2c', 'deducform2box5_1a',
                'deducform2box5_1b', 'deducform2box5_1c', 'deducform2box5_2c',
                // Form 1-1
                'deducform1box1_1d', 'deducform1box1_1e', 'deducform1box1_2e',
                'deducform1box5_1d', 'deducform1box5_1e', 'deducform1box5_2e'
            ];

            domUtil.prototype.operate({
                selector: '.deduc-form-field-editable, .deduc-form-field-readonly',
                operation: 'val',
                params: [0]
            });

            util.each(preloadFields, (preloadField) => {
                computeField(preloadField);
            });

            toggleCalculationFields();
            showForms();
            isFormLoaded = true;
        }
    /**
     * returns the print option field value based on the currently selected subsidiary
     */
        function getPrintOption(){

            let result = -1;
            let isOW = runtime.isFeatureInEffect({feature: "SUBSIDIARIES"});
            let currRec = currentRecord.get();

            if(isOW){
                let selectedSubsidiary = currRec.getValue({fieldId:'custpage_jpdtcf_subsidiary'});

                let printSearch = query.create({
                    type: query.Type.SUBSIDIARY
                });

                printSearch.columns = [
                    printSearch.createColumn({fieldId: 'custrecord_jp_print_option'})
                ]

                printSearch.condition = printSearch.and(
                    printSearch.createCondition({fieldId: 'id',operator: query.Operator.ANY_OF, values: selectedSubsidiary}),
                    printSearch.createCondition({fieldId: 'isInactive',operator: query.Operator.IS, values: false})
                )

                let resultSet = printSearch.run();

                if(resultSet.results.length > 0){
                    //we expect only 1 result.
                    result = resultSet.results[0].values[0];
                }
            }
            else { //SI get the value from company information.
                let printopt = currRec.getValue({fieldId: 'custpage_jp_print_opt'});
                result = (printopt) ? (printopt) : -1;
            }
            return result;
        }


        /**
         * Enable/disable fields based on calculation method
         */
        function toggleCalculationFields() {
            let itemizedClass = 'input.deduc-form-itemized';
            if (reportData.calcMethod === formConstants.CalcMethod.ITEMIZED) {
                domUtil.prototype.operate({selector: itemizedClass,
                    operation: 'removeClass', params: ['deduc-form-field-readonly']});
                domUtil.prototype.operate({selector: itemizedClass,
                    operation: 'addClass', params: ['deduc-form-field-editable']});
                domUtil.prototype.operate({selector: itemizedClass,
                    operation: 'removeAttr', params: ['readonly']});
            } else {
                domUtil.prototype.operate({selector: itemizedClass,
                    operation: 'removeClass', params: ['deduc-form-field-editable']});
                domUtil.prototype.operate({selector: itemizedClass,
                    operation: 'addClass', params: ['deduc-form-field-readonly']});
                domUtil.prototype.operate({selector: itemizedClass,
                    operation: 'attr', params: ['readonly', 'readonly']});
            }
        }


        /**
         * Recursive function that will trigger computation of field and all
         * fields dependent on it
         *
         * @param {String} computeFnName name of the field/function to be trigerred
         */
        function computeField(computeFnName) {
            let fieldObj = FIELDID_TRIGGERS_AND_COMPUTATIONS[computeFnName];
            fieldObj && fieldObj.compute(reportData);
            if (fieldObj.triggers) {
                util.each(fieldObj.triggers, (trigger) => {
                    //compute will stop if the field triggers itself
                    if(computeFnName != trigger)
                        computeField(trigger);
                });
            }
        }

        /**
         * Sends the current content of form to the backend for printing
         */
        function print(){
            loadMessageObject();
            if(!isFormLoaded){
                dialog.create({
                    title: MESSAGES[PRINT_NOT_YET_AVAIL_TITLE],
                    message: MESSAGES[PRINT_NOT_YET_AVAIL_MSG],
                    buttons: [{label: MESSAGES[REFRESH], value: true},
                        {label: MESSAGES[CANCEL_OPERATION], value: false}]
                }).then((doRefresh)=>{
                    if(doRefresh){
                        let currentRec = currentRecord.get();
                        let refreshParams = {
                            subsidiary: currentRec.getValue(SUBSIDIARY_FIELD),
                            periodStart: currentRec.getValue(PERIOD_FROM_FIELD),
                            periodEnd: currentRec.getValue(PERIOD_TO_FIELD),
                            calcMethod: currentRec.getValue(CALC_METHOD_FIELD)
                        };
                        getReportData(refreshParams)
                    }
                });
                return;
            }

            if(isPrintingInProgress){
                dialog.alert({
                    message: MESSAGES[ANOTHER_PRINT_IN_PROG]
                });
                return;
            }

            let printOption = getPrintOption();
            let pageMapping = {1 : 6, 2: 4};

            let printSuiteletUrl = url.resolveScript({
                scriptId: 'customscript_jp_deduc_print_rs',
                deploymentId: 'customdeploy_jp_deduc_print_rs'
            });

            let allPrintFields = getAllPrintableValues();
            allPrintFields['numPages'] = (printOption !== -1) ? pageMapping[printOption]: pageMapping[1];
            let printingInProgressMessage = message.create({
                type: message.Type.INFORMATION,
                title: MESSAGES[PRINT_IN_PROG]
            });
            printingInProgressMessage.show();
            isPrintingInProgress = true;
            https.post.promise({
                url: printSuiteletUrl,
                body: allPrintFields, // {idKey: value, ...}
            }).then(printRequestSuccessHandler(printingInProgressMessage))
                .catch(printingRequestFailedHandler(printingInProgressMessage));
        }

        /**
         * Fetch all printable
         *
         * @returns {Object} key-value pair. {inputId: value}
         * sample: { deducform4box1a: 100, taxformbox1a: 200}
         */
        function getAllPrintableValues(){
            let stringUtil = new StringUtil();
            let allPrintFields = {};
            domUtil.prototype.operate({
                selector: '.calc-form-container input.deduc-form-field-readonly, ' +
                    '.calc-form-container input.deduc-form-field-editable',
                operation: 'each', // https://api.jquery.com/each/
                params: [(ind, elem)=> {
                    let key = domUtil.prototype.operate({selector: elem, operation: 'attr', params: ['id']});
                    let fieldValue = domUtil.prototype.operate({selector: elem, operation: 'val'});

                    //add commas for 1-1, 1-2, 2-1, 2-2
                    if(key.indexOf(TAXFORM1SEC3BOX) == 0 || key.indexOf(TAXFORM2SEC3BOX) == 0)
                        allPrintFields[key] = fieldValue;
                    else
                        allPrintFields[key] = stringUtil.stringNumwithSeparator(fieldValue);
                }]
            });
            return allPrintFields;
        }

        /**
         * Success handler
         * @param printingInProgressMessage {Message} message instance that will be hidden when this handler is called
         *
         * @returns {Function} success handler
         */
        function printRequestSuccessHandler(printingInProgressMessage){
            /**
             * @param response - The response object from the http call
             */
            return (response) => {
                let b = convertBase64StringToUint8Array(response.body);
                // create the blob object with content-type "application/pdf".
                // If content-type = 'application/octet-stream the file will auto-download
                let blob = new window.Blob([b], {type: 'application/pdf'});

                // window.open doesn't work in IE
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(blob, DEFAULT_PDF_FILENAME);
                } else {
                    // create the file object with content-type "application/pdf"
                    let objectUrl = window.URL.createObjectURL(blob);
                    // Open in new tab and preview as PDF
                    window.open(objectUrl);
                }
                isPrintingInProgress = false;
                printingInProgressMessage.hide();
                message.create({
                    type: message.Type.CONFIRMATION,
                    title: MESSAGES[PRINT_SUCCESSFUL],
                    duration: 5000
                }).show();
            }
        }

        /**
         * Failure handler
         *
         * @param printingMessage {message} Message instance that has to be hidden when failure handler is called.
         *
         * @returns {Function} failure handler
         */
        function printingRequestFailedHandler(printingInProgressMessage){
            /**
             * @param failResult {message, name, etc.}
             */
            return (failResult) => {
                // backend error
                if(failResult.name){
                    message.create({
                        type: message.Type.ERROR,
                        message: MESSAGES[BACKEND_ERROR],
                        duration: 10000
                    }).show();
                }
                // client error
                else {
                    dialog.alert({
                        message:  MESSAGES[FRONTEND_ERROR]
                    });
                }
                printingInProgressMessage.hide();
                isPrintingInProgress = false;
            }
        }

        /**
         * Decode a base64-encoded string then convert it Uint8Array
         * @param base64String {string}
         *
         * @returns {Uint8Array}
         */
        function convertBase64StringToUint8Array(base64String){
            // decode string, remove space for IE compatibility. Remove " that may have been added by Restlet
            // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/atob
            let decodedFromBase64 = window.atob(base64String.replace(/\s/g, '')
                .replace(/"/g, ''));
            return convertToUint8Array(decodedFromBase64);

        }

        /**
         * Convert a string to Uint8Array Array
         *
         * @param s {String} input string
         * @returns {Uint8Array}
         */
        function convertToUint8Array(s){
            let len = s.length;
            let buffer = new window.ArrayBuffer(len);
            let uint8Array = new window.Uint8Array(buffer);
            for (let i = 0; i < len; i++) {
                uint8Array[i] = s.charCodeAt(i);
            }
            return uint8Array;
        }

        return {
            pageInit: pageInit,
            refresh: refresh,
            print: print
        };

    });
