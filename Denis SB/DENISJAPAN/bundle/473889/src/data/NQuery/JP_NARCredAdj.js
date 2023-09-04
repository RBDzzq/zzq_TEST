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
    "./JP_ARADJBase"
    ],

    (query, ARBase) => {

        class JP_NARCredAdjDAO extends ARBase{

            constructor(){
                super('customsale_jp_loc_cred_bal_adj');
            }

            /**
             * Retrieves the AR Credit Adjustment associated with the invoice summary, used for qualified invoice system.
             *
             * @param invoiceSummaryID
             * @return {integer} the id of the AR credit Adjustment otherwise if not found returns null.
             */

            retrieveIDByInvoiceSummary(invoiceSummaryID){

                if(invoiceSummaryID){
                    return this._retrieveIDByInvoiceSummary(invoiceSummaryID);
                }
            }

        }
        return JP_NARCredAdjDAO;
    });