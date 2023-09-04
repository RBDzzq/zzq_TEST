/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["N/record",
	"./JP_Renderer",
	"./JP_InvoiceSummaryDirectoryManager",
	"N/runtime",
	"../data/JP_InvoiceSummaryDAO",
    "../datastore/JP_ListStore",
    "N/format"],
(record, Renderer, InvoiceSummaryDirectoryManager, runtime, InvoiceSummaryDAO, JPLists, format) => {

	let HEADER = ["<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdf>\n",
        "<head>",
        "</head>",
        "<body font-size=\"10\" size=\"A4\" font-family=\"sans-serif\" >\n"].join("");

	let FOOTER = "\n</body>\n</pdf>";

	class InvoiceSummaryPDFCreator {

        generateDocument(template, contents, isRegenerate){
            let invoiceSummaryIDs = [];
            let renderedContents = [];
            let SUBSIDIARY = "subsidiary";

            for (let i = 0; i < contents.length; i++) {
                let content = contents[i];
                invoiceSummaryIDs.push(content.id);
                renderedContents.push(content.renderedContent);
            }

            let invSumDAO = new InvoiceSummaryDAO();
            //just get the first IDS, it contains the filters of the generation anyway
            let invSumObj = invSumDAO.getData(invoiceSummaryIDs[0]);

            let body = renderedContents.join('<pbr pagenumber="1" />');
            let pdfContent = [HEADER, body, FOOTER].join("");
            let filename = this.getFileName(isRegenerate, invSumObj);
            let pdfFile = this.getPDFFile(pdfContent, filename, invSumObj[SUBSIDIARY] ?
                invSumObj[SUBSIDIARY].value : null);
            return pdfFile.save();
        };

        /**
         * This function returns the pdf file
         *
         * @returns {file.File} pdf File
         */

         getPDFFile(content, name, subsidiary) {
            return new Renderer().createPdfFile({
                xmlContents: content,
                filename: [name].join("."),
                folderId: this.getFolder(subsidiary)
            });
        }

        /**
         * This function retrieves the folder id where the IDS PDF document will be stored
         * @returns
         */
         getFolder(subsidiary) {
            let folderId;
            let directoryManager = new InvoiceSummaryDirectoryManager();
            folderId = directoryManager.getFolder(subsidiary);

            return folderId;
        }

        /**
         *
         * @param isRegenerate
         * @param invoiceSummaryObj
         * @returns {String}
         */
        getFileName(isRegenerate, invoiceSummaryObj) {
            let STATEMENT_DATE = "custbody_suitel10n_jp_ids_stmnt_date";
            let BATCH_FIELD = "custbody_suitel10n_jp_ids_gen_batch";
            let CLOSING_DATE = "custbody_suitel10n_jp_ids_cd";
            let CUSTOMER = "custbody_suitel10n_jp_ids_customer";
            let SUBSIDIARY = "subsidiary";
            let NUMBER = "tranid";
            let IDS_TAG = "InvoiceSummary";
            let REGEN_TAG = "REGEN";
            let DELIMITER = "_";
            let SETTINGS = 'settings';

            let IDSNumber = invoiceSummaryObj[NUMBER];
            let subs = invoiceSummaryObj[SUBSIDIARY] ? invoiceSummaryObj[SUBSIDIARY].text : '';
            let batchId = invoiceSummaryObj[BATCH_FIELD];
            let statementDateObj = invoiceSummaryObj[STATEMENT_DATE];
            let year = statementDateObj.getFullYear();
            let month = Number(statementDateObj.getMonth()) + 1;
            let day = statementDateObj.getDate();
            let customer = invoiceSummaryObj[CUSTOMER];

            let formatType = parseInt(invoiceSummaryObj[SETTINGS].pdfFormat);
            let formatTypes = new JPLists().ISPDF_FILE_FORMATS;

            day = this.prependZero(day);
            month = this.prependZero(month);
            year = year.toString();
            let statementDate = [year, month, day].join("");
            let cdate = format.parse({
                value: invoiceSummaryObj[CLOSING_DATE],
                type: format.Type.DATE
            });
            let closingDate = "";

            let filenameElements = [];
            switch(formatType){
                case formatTypes.closingdate_custname:
                    closingDate = [
                        cdate.getFullYear().toString(),
                        this.prependZero(parseInt(cdate.getMonth()) + 1 ),
                        this.prependZero(cdate.getDate())
                    ].join("");

                    filenameElements = [closingDate, customer];
                    break;
                case formatTypes.is_recordnumber:
                    filenameElements = [IDSNumber];
                    break;
                case formatTypes.is_recordnumber_closingdate:

                    closingDate = [
                        cdate.getFullYear().toString(),
                        this.prependZero(parseInt(cdate.getMonth()) + 1 ),
                        this.prependZero(cdate.getDate())
                    ].join("");

                    filenameElements = [IDSNumber, closingDate];
                    break;
                case formatTypes.statementdate_batchid:
                    filenameElements = [statementDate, batchId];
                    break;
                case formatTypes.statementdate_subsidiary_batchid:
                    filenameElements = [statementDate, subs, batchId ];
                    break;
                case formatTypes.statementdate_istext_is_recordnumber:
                    filenameElements = [statementDate, IDS_TAG, IDSNumber];
                    break;
            }

            if (isRegenerate) {
                filenameElements.push(REGEN_TAG);
            }

            return filenameElements.join(DELIMITER);
        }

        prependZero(num){
            return (num < 10) ? "0" + num.toString() : num.toString();
        }

    }

	return InvoiceSummaryPDFCreator;
});
