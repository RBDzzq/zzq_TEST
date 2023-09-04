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

        class JP_NARDebtAdjDAO extends ARBase{

            constructor(){
                super('customsale_jp_loc_debit_bal_adj');
            }

            /**
             * Retrieves the AR Debit Adjustment associated with the invoice summary, used for qualified invoice system.
             *
             * @param invoiceSummaryID
             * @return {integer} the id of the AR debit Adjustment otherwise if not found returns null.
             */

            retrieveIDByInvoiceSummary(invoiceSummaryID){
                return this._retrieveIDByInvoiceSummary(invoiceSummaryID);
            }
        }
        return JP_NARDebtAdjDAO;
    });
