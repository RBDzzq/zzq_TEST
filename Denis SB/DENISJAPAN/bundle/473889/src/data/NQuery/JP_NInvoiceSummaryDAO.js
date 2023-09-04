/**
 * Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
        "N/query",
        "N/record",
        "./JP_NARDebtAdj",
        "./JP_NARCredAdj",
        "./JP_TaxDetailsDAO"
    ],

    (query, record, ARDebitDAO, ARCreditDAO, TaxDetailsDAO) => {

        class JP_NInvoiceSummaryDAO{

            constructor(){
                this.recordType = 'customtransaction_suitel10n_jp_ids';
                this.fields = {
                    batchRecord: 'custbody_suitel10n_jp_ids_gen_batch',
                    regenInvoiceSummaryDoc: 'custbody_suitel10n_jp_ids_doc_regen',
                    batch : "custbody_suitel10n_jp_ids_gen_batch",
                    statementDate : "custbody_suitel10n_jp_ids_stmnt_date",
                    customerFilter : "custbody_suitel10n_jp_ids_cust",
                    invoiceStatus: 'status',
                    entity : 'entity',
                    id: 'internalid',
                    customer : 'custbody_suitel10n_jp_ids_customer',
                    netTotal : 'custbody_suitel10n_jp_ids_net_total',
                    isConsolidated: 'custbody_jp_inc_all_trans_sub',
                    dateCreated : 'datecreated',
                    closingDate : 'custbody_suitel10n_jp_ids_cd',
                    transactionId : 'tranid',
                    transactions : 'custbody_suitel10n_jp_ids_transactions'
                };
            }

            deleteRelatedRecords(invoiceSummaryID){
                if(invoiceSummaryID){
                    //first delete the AR Debit Adjustment if any.
                    let arDebitDAO = new ARDebitDAO();
                    let arDebitId = arDebitDAO.retrieveIDByInvoiceSummary(invoiceSummaryID);

                    if(arDebitId){
                        record.delete({
                            type: arDebitDAO.recordType,
                            id: arDebitId
                        });
                    }

                    //then delete the AR Credit Adjustment if any.
                    let arCreditDAO = new ARCreditDAO();
                    let arCreditId = arCreditDAO.retrieveIDByInvoiceSummary(invoiceSummaryID);

                    if(arCreditId){
                        record.delete({
                            type: arCreditDAO.recordType,
                            id: arCreditId
                        });
                    }

                    //then delete the tax details records.
                    let taxDetailsDao = new TaxDetailsDAO();
                    let taxDetailsID = taxDetailsDao.retrieveTaxDetailsId(invoiceSummaryID);

                    if(taxDetailsID){
                        record.delete({
                            type: taxDetailsDao.recordType,
                            id: taxDetailsID
                        });
                    }
                }
            }

        }
        return JP_NInvoiceSummaryDAO;
    });
