/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
        'N/runtime',
        'N/search',
        'N/email',
        'N/file',
        'N/query',
        '../lib/JP_StringUtility',
        '../data/JP_InvoiceSummaryRequestDAO',
        '../lib/JP_TCTranslator'
    ],

    (runtime,
             search,
             email,
             file,
             query,
             JP_StringUtility,
             RequestRecordDAO,
             translator) => {

        let WARNING = 'warning';
        let GENERIC_ERROR = 'generic_error';
        let SUITEAPP_ERROR = 'suiteapp_error';

        // 0 is false; SI / 1 is true; OW
        let errorMessages = {};
        errorMessages[WARNING] =['IDS_GEN_WARNING_MESSAGE_SI', 'IDS_GEN_WARNING_MESSAGE_OW'];
        errorMessages[GENERIC_ERROR] = ['IDS_GEN_ERROR_MESSAGE_GENERIC_SI', 'IDS_GEN_ERROR_MESSAGE_GENERIC_OW'];
        errorMessages[SUITEAPP_ERROR] = ['IDS_GEN_ERROR_MESSAGE_SI', 'IDS_GEN_ERROR_MESSAGE_OW'];

        //Bundle defined error codes
        let INV_SUM_DATE_PERIOD_START = 'INV_SUM_DATE_PERIOD_START';
        let SS_DEPLOYMENT_NOT_FOUND = 'SS_DEPLOYMENT_NOT_FOUND';
        let UPDATE_RELATED_IDS_TRANSACTIONS_ERROR = 'UPDATE_RELATED_IDS_TRANSACTIONS_ERROR';
        let INVOICE_SUMMARY_REGENERATION_ERROR = 'INVOICE_SUMMARY_REGENERATION_ERROR';

        //NS defined error codes
        let INVALID_KEY_OR_REF = 'INVALID_KEY_OR_REF';
        let USER_ERROR = 'USER_ERROR';
        let NO_TEMPLATE_ON_GENERATION = 'NO_TEMPLATE_ON_GENERATION';

        class JP_ErrorNotifier{

            constructor(type) {
                this.type = type ? type.toLowerCase() : GENERIC_ERROR;
            }

            notifyCreator(requestRecord, error, owner, genStat) {

                try{
                    //Email object
                    let emailObj = this.getBodyAndSubject(error, this.type);
                    let subj = emailObj.subject;
                    let body = emailObj.body;
                    let errorType = emailObj.errorType;
                    let msgTemplate = this.getMessageTemplate(errorType);

                    //Translate email components
                    let strings= new translator().getTexts([
                        subj,
                        body,
                        msgTemplate
                    ], true);

                    let templateSubject = strings[subj];
                    let templateMessage = strings[body];
                    let template = strings[msgTemplate];

                    let reqDao = new RequestRecordDAO();
                    let sub = requestRecord.getText({fieldId: reqDao.fields.subsidiary});
                    let cust = requestRecord.getText({fieldId: reqDao.fields.customerFilter});
                    let custSavedSearch = requestRecord.getText({fieldId: reqDao.fields.customerSavedSearch});
                    let closingDate = requestRecord.getText({fieldId: reqDao.fields.closingDate});
                    let isOverdue = requestRecord.getValue({fieldId: reqDao.fields.includeOverdue});
                    let isNoTransactions = requestRecord.getValue({fieldId: reqDao.fields.includeNoTransaction});

                    //Error object
                    let code = error.name;
                    let errorDetails = error.details;

                    //Replace email message with batch and error data
                    let stringUtil = new JP_StringUtility(template);
                    let message = stringUtil.replaceParameters({
                        SUCCESS: genStat.generated,
                        TOTAL : genStat.total,
                        SUBSIDIARY: sub,
                        CUSTOMER: cust,
                        CUSTOMERSAVEDSEARCH: custSavedSearch,
                        ISOVERDUE: isOverdue === true ? 'Yes' : 'No',
                        ISNOTRANSACTIONS: isNoTransactions === true ? 'Yes' : 'No',
                        CLOSINGDATE: closingDate,
                        REASON: templateMessage,
                        NSERROR: code ? code+': '+errorDetails : error,
                        TEMPLATEPATH: this.getFilePath()
                    });

                    //Send email to batch record owner
                    return email.send({
                        author: owner,
                        recipients: [owner],
                        subject: templateSubject,
                        body: message,
                    });
                }
                catch(e){
                    log.error(e.name,e.message);
                }
            }

            getFilePath(){
                let filePath;
                search.create({
                    type : 'file',
                    filters : [
                        ['name', 'is', 'default_multi_currency_template.xml']
                    ],
                    columns : ['internalid']
                }).run().each(
                    (result) => {
                        let path = file.load({
                            id : result.id
                        }).path;

                        path = path.split("/");
                        path.splice(-1);
                        filePath = path.join(" > ");

                        return true;
                    }
                );

                return filePath;
            }

            getBodyAndSubject(error, errorType){
                let code = error.name;
                let nsDetails = error.details;
                let nsCode = error.nsCode;
                let XML_PARSE_ERROR = 'XML';
                let ACCOUNTING_PERIOD = 'The transaction date you specified is not within the date range of your accounting period.';
                let NO_TEMPLATE_REGEN = 'No template found';
                let IDS_TEMPLATE_FIELD = 'custbody_suitel10n_jp_ids_template';
                let IDS_TRANSACTIONS_FIELD = 'custbody_suitel10n_jp_ids_transactions';

                let emailObj = {
                    body: null,
                    subject: null,
                    errorType: SUITEAPP_ERROR
                };

                switch (code) {
                    case SS_DEPLOYMENT_NOT_FOUND:
                        emailObj.subject = 'IDS_GEN_UNDEPLOYED_SCRIPT_SUBJ';
                        emailObj.body = nsDetails.indexOf('No deployment found for IDS Regeneration SS') != -1 ?
                            'IDS_REGEN_UNDEPLOYED_SCRIPT_MSG' : 'IDS_GEN_UNDEPLOYED_SCRIPT_MSG';
                        break;
                    case UPDATE_RELATED_IDS_TRANSACTIONS_ERROR:
                        if (nsCode === 'TypeError' && nsDetails.indexOf('custbody_suitel10n_jp_ids_rec') != -1) {
                            emailObj.subject = 'IDS_GEN_PDF_MODIFIED_TRANSLIST_SUBJ';
                            emailObj.body = 'IDS_GEN_PDF_MODIFIED_TRANSLIST_MSG';
                        }
                        break;
                    case INVOICE_SUMMARY_REGENERATION_ERROR:
                        if (nsDetails.indexOf(NO_TEMPLATE_REGEN) != -1) {
                            emailObj.subject = 'IDS_GEN_PDF_MISSING_TEMPLATE_SUBJ';
                            emailObj.body = 'IDS_GEN_MISSING_TEMPLATE_MSG';
                        }
                        break;
                }

                if (!emailObj.body && !emailObj.subject) {

                    emailObj.subject = 'IDS_GEN_GENERIC_ERROR_SUBJ';
                    emailObj.body = 'IDS_GEN_GENERIC_ERROR_MSG';

                    if (nsCode === INVALID_KEY_OR_REF) {
                        if (nsDetails.indexOf(IDS_TEMPLATE_FIELD) != -1) {
                            emailObj.subject = 'IDS_GEN_IDS_MISSING_TEMPLATE_SUBJ';
                            emailObj.body = 'IDS_GEN_MISSING_TEMPLATE_MSG';
                        } else if (nsDetails.indexOf(IDS_TRANSACTIONS_FIELD) != -1) {
                            emailObj.body = 'IDS_GEN_IDS_MODIFIED_TRANSLIST_MSG';
                            emailObj.subject = 'IDS_GEN_IDS_MODIFIED_TRANSLIST_SUBJ';
                        }
                    } else if (nsCode === NO_TEMPLATE_ON_GENERATION) {
                        emailObj.subject = 'IDS_GEN_IDS_MISSING_TEMPLATE_SUBJ';
                        emailObj.body = 'IDS_GEN_MISSING_TEMPLATE_MSG';
                    } else if (nsCode === USER_ERROR) {
                        if (nsDetails.indexOf(XML_PARSE_ERROR) != -1) {
                            emailObj.subject = 'IDS_GEN_PDF_UNPARSEABLE_TEMPLATE_SUBJ';
                            emailObj.body = 'IDS_GEN_PDF_UNPARSEABLE_TEMPLATE_MSG';
                        } else if (nsDetails.indexOf(ACCOUNTING_PERIOD) != -1) {
                            emailObj.subject = 'IDS_GEN_ACCOUNTING_PERIOD_ERROR_SUBJ';
                            emailObj.body = 'IDS_GEN_ACCOUNTING_PERIOD_ERROR_MSG';
                        }
                    } else if (nsCode === INV_SUM_DATE_PERIOD_START) {
                        emailObj.subject = 'IDS_GEN_IDS_NO_PAYMENT_TERMS_SUBJ';
                        emailObj.body = 'IDS_GEN_IDS_NO_PAYMENT_TERMS_MSG';
                    } else {
                        emailObj.errorType = GENERIC_ERROR;
                    }

                    if(errorType === WARNING){
                        emailObj.errorType = WARNING;
                        emailObj.body = 'IDS_GEN_GENERIC_WARNING_MSG';
                    }

                }
                return emailObj;
            }

            getMessageTemplate(errorType){
                let isOW = runtime.isFeatureInEffect('SUBSIDIARIES') ? 1 : 0;
                return errorMessages[errorType][isOW];
            }

        }


        return JP_ErrorNotifier;
    });
