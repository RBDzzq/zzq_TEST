/**
 *    Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
        'N/url',
        'N/runtime',
        'N/https',
        'N/ui/message',
        '../../app/JP_DeductibleTaxCalculator'
    ],
     (url, runtime, https, message,JP_DeductibleTaxCalculator) =>{

        function JP_PurchaseOrderCS(){

            let poid;

            if (JP_PurchaseOrderCS.Instance !== undefined) {
                return JP_PurchaseOrderCS.Instance;
            }

            /**
             * Function for PO Numbering feature's custom button 'Print'
             */
            this.jpclickPrint = ()=>{

                poid = (poid) ? poid : getIdFromURL()['id'];

                let restletUrl = url.resolveScript({
                    scriptId: 'customscript_jp_su_ponumber',
                    deploymentId: 'customdeploy_jp_su_ponumber',
                    params: {
                        poid: poid,
                        userid : runtime.getCurrentUser().id
                    }
                });

                requestData(restletUrl, printCallback, false);
            };

            this.pageInit = (context)=>{
                poid = context.currentRecord.id;
            }

            /**
             *  Callback function on print click.
             */
            function printCallback(response){

                let respObj = JSON.parse(response.body);

                switch (respObj.status) {
                    case 400:

                        if(respObj.errors && respObj.errors.length > 0 ){

                            //combine the error messages into one.
                            let errMsg = '';
                            respObj.errors.forEach((error)=>{
                                errMsg += error.details;
                            });

                            message.create({
                                title: respObj.errors[0].title,
                                message: errMsg,
                                type: message.Type.ERROR,
                                duration: 10000
                            }).show();
                        }
                        break;

                    case 200:
                        let fileUrl = window.location.protocol + "//" + window.location.host + respObj.fileURL;
                        window.open(fileUrl);
                        break;
                }
            }

            /**
             *  Generic function to request data from the backend
             * @param {Object} restlet URL, the resolved script containing the params.
             * @param {Function} callback function after the request is made
             * @param {Boolean} if true, calls the request asynchronously, default is false
             */
            function requestData(restletUrl, callback, isAsync){

                if(isAsync){
                    https.get.promise(restletUrl)
                        .then((resp)=>{
                            callback(resp);
                        });
                }
                else{
                    let response = https.get(restletUrl);
                    callback(response);
                }

            }

            /**
            * View mode does not trigger the client script
            * this function gets the purchse order id based off the URL.
             * */
            function getIdFromURL(){
                let vars = {};
                window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) =>{
                    vars[key] = value;
                });
                return vars;
            }
        }

        return {
            pageInit: (scriptContext)=>{ return new JP_PurchaseOrderCS().pageInit(scriptContext); },
            jpclickPrint: (scriptContext)=>{ return new JP_PurchaseOrderCS().jpclickPrint(scriptContext); }
        };
    })
