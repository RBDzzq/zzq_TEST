/**
 *    Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/render',
        'N/record',
        'N/file',
        '../../lib/JP_DateUtility',
        '../../data/JP_FolderDAO',
        '../../data/NQuery/JP_NPurchaseOrderDAO',
        '../../data/NQuery/JP_NPOPrintHistoryDAO',
        '../../data/NQuery/JP_NVendorDAO',
        "../../lib/JP_TCTranslator"],

     (render, record, file, DateUtil, FolderDAO, PODAO, PrintHistoryDAO, VendorDAO, translator) =>{

        let vendorDao, poDAO, params;
        let validationResult = {
            errors : []
        };
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {

            params = context.request.parameters;

            log.debug({title: "PO Number", details: JSON.stringify(params)});
            let returnValues;
            if(params){
                if(params.type == 'country'){ //service to get country
                    returnValues = getCountry(params);
                }
                else{ //print function
                    returnValues = performPrint(params);
                }
            }

            context.response.write( returnValues );
        }

        function performPrint(parameters){
            let fileId, returnVals;

            if(parameters.poid) {
                let poFile;
                let printHistory = new PrintHistoryDAO();
                let poid;

                try {
                    poid = parseInt(parameters.poid);
                    poDAO = new PODAO();
                    poDAO.getData(poid);

                    checkIfValidForPrinting(poDAO.fields.printFolder.val);

                    if(validationResult.errors && validationResult.errors.length === 0){
                        poFile = render.transaction({
                            entityId: poid,
                            printMode: render.PrintMode.PDF
                        });

                        poFile.folder = poDAO.fields.printFolder.val;

                        printHistory.getData(poid);

                        let totalPrints = printHistory.totalPrints + 1;
                        //filename follows the format <PO#>_<VendorName>_<NumberOfTimesPrintedValue>
                        poFile.name = poDAO.fields.tranid.val + "_" + poDAO.fields.entityid.val + "_" +
                            totalPrints + ".pdf";

                        fileId = poFile.save();
                    }
                }
                catch (err) {
                    //catch all for other errors.
                    log.error({title: "Catch all Error", details: JSON.stringify(err)});
                    validationResult.errors.push({
                        title: "",
                        details: JSON.stringify(err)
                    });
                }
                finally {
                    //only create the print history record if successful
                    if(validationResult.errors && validationResult.errors.length === 0){
                        let dateUtil = new DateUtil(new Date());

                        let newHistRec = record.create({
                            type: printHistory.recordType
                        });

                        newHistRec.setValue({
                            fieldId: 'custrecord_jp_printuser',
                            value: parameters.userid
                        });

                        newHistRec.setValue({
                            fieldId: printHistory.fields.dateTime.id,
                            value: dateUtil.getDate()
                        });

                        newHistRec.setValue({
                            fieldId: printHistory.fields.purchaseOrder.id,
                            value: parameters.poid
                        });

                        //this is not ideal, but for some reason, I cannot get the url
                        //of the file without reloading it.
                        let pdf = file.load({id: fileId});
                        newHistRec.setValue({
                            fieldId: printHistory.fields.fileLink.id,
                            value: pdf.url
                        });

                        newHistRec.save();

                        //update the PO Number of print.
                        printHistory.getData(poid);
                        let vals = {};
                        vals[poDAO.fields.timesPrinted.id] = printHistory.totalPrints;
                        log.debug({title: "New total prints", details: JSON.stringify(vals)});

                        record.submitFields({
                            type: record.Type.PURCHASE_ORDER,
                            id: poid,
                            values: {
                                custpage_jp_timesprinted: printHistory.totalPrints
                            }
                        });

                        returnVals = JSON.stringify({
                            status: 200,
                            text: "Success!!!",
                            fileURL: pdf.url
                        });
                    }
                    else {
                        returnVals = JSON.stringify({
                            status: 400,
                            text: "Failed!!!",
                            errors: validationResult.errors
                        });
                    }
                }
            }

            return returnVals;
        }

        /**
         * Checks if purchase order can be printed
         *
         * @param int Folder ID set as printed PO destination in subsidiary/company information
         */
        function checkIfValidForPrinting(printPOFolder){
            vendorDao = new VendorDAO();
            vendorDao.getData(poDAO.fields.entity.val);
            let CONCURRENCYMSG = "PO_ERR_CONCURRENCY_MSG";
            let CONCURRENCYTITLE = "PO_ERR_CONCURRENCY_TITLE";
            let MISSINGFOLDER = 'PO_ERR_MISSINGFOLDER';

            let strings = new translator().getTexts([CONCURRENCYTITLE,
                CONCURRENCYMSG, MISSINGFOLDER], true);


            if(!vendorDao.fields.ApplySubcon.val){
                validationResult.errors.push({
                    title: strings[CONCURRENCYTITLE],
                    details: strings[CONCURRENCYMSG]
                });
            }else{
                // Custom print is only available when vendor's Apply Subcontract field is T
                // No need to check folder if checkbox is changed to F
                let printPOFolderPath = printPOFolder && new FolderDAO().getFolderPath(printPOFolder);
                let printPOFolderIsValid = printPOFolderPath && printPOFolderPath.indexOf('Printed Purchase Orders') !== -1;

                if(!printPOFolderPath || !printPOFolderIsValid){
                    validationResult.errors.push({
                        title: '',
                        details: strings[MISSINGFOLDER]
                    });
                }
            }
        }

        function getCountry(parameters){
            let returnVals;

            try{
                vendorDao = new VendorDAO();
                vendorDao.getData(parameters.entityId);

                returnVals = {
                    countryCode : vendorDao.fields.country.val
                }
            }
            catch (e) {
                returnVals = {
                    err: JSON.stringify(e)
                }
            }

            return returnVals;
        }

        return {
            onRequest: onRequest
        };

    });
