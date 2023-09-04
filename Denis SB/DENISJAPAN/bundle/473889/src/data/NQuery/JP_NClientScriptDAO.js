/**
 * Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/query"],
    (query) =>{
        class ClientScriptDAO {

            constructor(){
                this.fields = {
                    id: 'id',
                    scriptId: 'scriptid',
                    scriptFileId: 'scriptfile.id'
                };
                this.recordType = query.Type.CLIENT_SCRIPT;
                this.PURCHASE_ORDER_CS_SCRIPT = 'customscript_japan_po_cs';
                this.INVOICE_SUMMARY_CS_SCRIPT = 'customscript_japan_invoice_summary_cs';
            }

            /**
             * Returns the script file ID of the given client script
             *
             * @param scriptId - client script ID
             * @returns {Integer} script file ID
             */
            getScriptFileId(scriptId){
                let csQuery = query.create({ type: this.recordType });
                csQuery.columns = [
                    csQuery.createColumn({fieldId: this.fields.id}),
                    csQuery.createColumn({fieldId: this.fields.scriptFileId})
                ];
                csQuery.condition = csQuery.and(
                    csQuery.createCondition({
                        fieldId: this.fields.scriptId,
                        operator: query.Operator.ANY_OF,
                        values: [scriptId]
                    }));

                return csQuery.run().results[0].values[1] || '';
            }

            /*
            * Returns the script file ID of the purchase order CS
            *
            * @returns {Integer}
            * */
            getPurchaseOrderCSScriptFileId(){
                return this.getScriptFileId(this.PURCHASE_ORDER_CS_SCRIPT);
            }

            /*
            * Returns the script file ID of the invoice summary CS
            *
            * @returns {Integer}
            * */
            getInvoiceSummaryCSScriptFileId(){
                return this.getScriptFileId(this.INVOICE_SUMMARY_CS_SCRIPT);
            }
        }

        return ClientScriptDAO;
    });