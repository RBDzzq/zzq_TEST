/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define([
    'N/search',
    'N/error',
    'N/record',
    './JP_InvoiceSummaryPDFCreator',
    './JP_InvoiceSummaryFilePrinter',
    '../data/JP_TransactionDAO'
], (
    search,
    error,
    record,
    InvoiceSummaryPDFCreator,
    InvoiceSummaryFilePrinter,
    TransactionDAO
) => {

    const REGEN_ERROR = 'INVOICE_SUMMARY_REGENERATION_ERROR';
    const INV_SUMMARY_REC_TYPE = 'customtransaction_suitel10n_jp_ids';
    const BATCH_TYPE = 'customrecord_suitel10n_jp_ids_gen_batch';
    const HIERARCHY_ID_FIELD = 'custrecord_japan_loc_hierarchy';
    const HIERARCHY_REC_TYPE = 'customrecord_jp_customer_hierarchy';
    const HIERARCHY_STORE_FIELD = 'custrecord_jp_hierarchy_store';
    const TEMPLATE_FIELD = 'custbody_suitel10n_jp_ids_template';
    const INV_SUM_CUSTOMER_FIELD = 'custbody_suitel10n_jp_ids_customer';
    const INV_SUM_START_DATE_FIELD = 'custbody_suitel10n_jp_ids_start_date';
    const INV_SUM_CLOSING_DATE_FIELD = 'custbody_suitel10n_jp_ids_closing_date';
    const INV_SUM_TOTAL_PREV_FIELD = 'custbody_suitel10n_jp_ids_total_prev_p';
    const INV_SUM_TOTAL_SALES_FIELD = 'custbody_suitel10n_jp_ids_total_sales';
    const INV_SUM_TOTAL_RETURN_FIELD = 'custbody_suitel10n_jp_ids_total_return';
    const INV_SUM_TOTAL_SALES_TAX_FIELD = 'custbody_suitel10n_jp_ids_total_tax';
    const INV_SUM_TOTAL_NET_PERIOD_FIELD = 'custbody_suitel10n_jp_ids_net_total';
    const INV_SUM_TOTAL_NET_INVOICE_FIELD = 'custbody_suitel10n_jp_ids_net_invoice';
    const INV_SUM_PERIOD_PAYMENT = 'custbody_suitel10n_jp_ids_prd_payment';
    const INV_SUM_BALANCE_CARRIED_FORWARD = 'custbody_suitel10n_jp_ids_balance_fwd';
    const INV_SUM_PAYMENTS = 'custbody_jp_loc_inv_sum_payments';
    const INV_SUM_BATCH = 'custbody_suitel10n_jp_ids_gen_batch';


    function ISRegenerationManager() {
        this.name = 'ISRegenerationManager';
    }


    /**
     * Start regeneration manager process
     *
     * @param {String} recId Invoice Summary record ID
     * @returns {String} Regenerated PDF File ID
     */
    ISRegenerationManager.prototype.regenerate = (recId) => {

        let invSummaryLookup = search.lookupFields({
            type: INV_SUMMARY_REC_TYPE,
            id: recId,
            columns: TEMPLATE_FIELD
        });

        let details = {
            nsCode: null,
            details: null
        };

        let fileId = null;
        let templateFieldObj = invSummaryLookup[TEMPLATE_FIELD][0];

        if (!templateFieldObj || !templateFieldObj.value) {
            details.nsCode = REGEN_ERROR;
            details.details = 'No template found.';

            throw error.create({
                name: REGEN_ERROR,
                message: JSON.stringify(details)
            });
        }

        updateInvoiceSummaryNetValues(recId);

        let template = templateFieldObj.value;
        let isRegenerate = true;
        let filePrinter = new InvoiceSummaryFilePrinter();
        let renderedContent = filePrinter.generateInvoiceSummaryText(recId, template);
        let contents = [{
            id: recId,
            renderedContent: renderedContent
        }];

        let pdfCreator = new InvoiceSummaryPDFCreator();
        fileId = pdfCreator.generateDocument(template, contents, isRegenerate);

        if (fileId) {
            record.submitFields({
                type: INV_SUMMARY_REC_TYPE,
                id: recId,
                values: {
                    custbody_suitel10n_jp_ids_doc_regen: fileId,
                    custbody_suitel10n_jp_ids_gen_complete: true
                }
            });
        }

		return fileId;
    }


    /**
     * Update Invoice Summary record net amounts
     *
     * @param {String} recId Invoice Summary record ID
     */
    function updateInvoiceSummaryNetValues(recId){

        let invoiceSummaryRec = record.load({
            type: INV_SUMMARY_REC_TYPE,
            id: recId
        });

        let transactions = getAttachedTransactions(recId);
        let entity = invoiceSummaryRec.getValue({
            fieldId: INV_SUM_CUSTOMER_FIELD
        });

        // handle consolidated IS feature
        let batchLookup = search.lookupFields({
            type: BATCH_TYPE,
            id: invoiceSummaryRec.getValue({fieldId: INV_SUM_BATCH}),
            columns: [HIERARCHY_ID_FIELD]
        });
        let hierarchyId = batchLookup[HIERARCHY_ID_FIELD] && batchLookup[HIERARCHY_ID_FIELD][0] ?
            batchLookup[HIERARCHY_ID_FIELD][0].value :
            null;
        let customerFamilyIds = [];
        if(hierarchyId){
            let hierarchyLookup = search.lookupFields({
                type: HIERARCHY_REC_TYPE,
                id: hierarchyId,
                columns: [HIERARCHY_STORE_FIELD]
            });
            let hierarchyObj = JSON.parse(hierarchyLookup[HIERARCHY_STORE_FIELD]);
            if(entity) {
                let customerChildren = hierarchyObj[entity] ? hierarchyObj[entity].children : null;
                customerFamilyIds = customerChildren ? Object.keys(customerChildren) : [];
                customerFamilyIds.push(entity);
            }
        }

        let startDate = invoiceSummaryRec.getValue({
            fieldId: INV_SUM_START_DATE_FIELD
        });
        let closingDate = invoiceSummaryRec.getValue({
            fieldId: INV_SUM_CLOSING_DATE_FIELD
        });

        let salesTranDAO = new TransactionDAO();
        let totalSales = salesTranDAO.getTotalNet(transactions, 'CustInvc');
        let totalReturn = salesTranDAO.getTotalNet(transactions, 'CustCred');
        let totalTax = salesTranDAO.getTotalTax(transactions);

        let totalPrevious = invoiceSummaryRec.getValue({
            fieldId: INV_SUM_TOTAL_PREV_FIELD
        });
        let invoiceSummaryPayments = invoiceSummaryRec.getValue({
            fieldId: INV_SUM_PAYMENTS
        });

        let paymentTranDAO = new TransactionDAO();
        let periodPayment = paymentTranDAO.getPaymentReceivedDuringPeriod({
            entity: entity,
            entities: customerFamilyIds,
            startDate: startDate,
            endDate: closingDate,
            payments: invoiceSummaryPayments
        });
        let balanceForward = getBalanceCarriedForward(totalPrevious, periodPayment);

        let netInvoice = getNetInvoice(totalSales,
				totalReturn,
				totalTax);

        let netTotal = getNetTotal(balanceForward,
				totalSales,
				totalReturn,
				totalTax);

        let fieldValues = [
            {'id':INV_SUM_TOTAL_SALES_FIELD, 'value':totalSales},
            {'id':INV_SUM_TOTAL_RETURN_FIELD, 'value':totalReturn},
            {'id':INV_SUM_TOTAL_SALES_TAX_FIELD, 'value':totalTax},
            {'id':INV_SUM_TOTAL_NET_PERIOD_FIELD, 'value':netTotal},
            {'id':INV_SUM_TOTAL_NET_INVOICE_FIELD, 'value':netInvoice},
            {'id':INV_SUM_PERIOD_PAYMENT, 'value':periodPayment},
            {'id':INV_SUM_BALANCE_CARRIED_FORWARD, 'value':balanceForward}
        ];

        util.each(fieldValues, function(fieldValue) {
            invoiceSummaryRec.setValue({
                fieldId: fieldValue.id,
                value: fieldValue.value
            });
        });

		invoiceSummaryRec.save();
    }


    /**
     * Get Invoice Summary attached transactions
     *
     * @param {String} recId Invoice Summary record ID
     * @returns {Array} Array of transaction IDs
     */
	function getAttachedTransactions(recId){
        let transactions = [];

        let tranDAO = new TransactionDAO();
        let searchObj = tranDAO.createSearch();
        searchObj.filterExpression = [
            ['mainline', search.Operator.IS, true],
            'AND',
            ['custbody_suitel10n_jp_ids_rec', search.Operator.IS, recId]
        ];

        let iterator = tranDAO.getResultsIterator(searchObj);
        while (iterator.hasNext()) {
            let curr = iterator.next();
            let id = curr.id;
        	transactions.push(id);
        }

        return transactions;
    }


    /**
     * Get balance carried forward amount
     * previousTotal - paymentReceived
     *
     * @param {Number} previousTotal Previous total amount
     * @param {Number} paymentReceived Payments received this period
     * @returns {String} Balance difference
     */
	function getBalanceCarriedForward(previousTotal, paymentReceived) {
        let balance = Number(previousTotal) - Number(paymentReceived);
		return balance.toString();
    }


    /**
     * Get Net Invoice amount
     * totalSales - |totalReturn| + totalTax
     *
     * @param {Number} totalSales Total sales amount
     * @param {Number} totalReturn Total credit amount
     * @param {Number} totalTax Total tax amount
     * @returns {String} Net invoice amount in string
     */
	function getNetInvoice(totalSales, totalReturn, totalTax) {
        let netInvoice = Number(totalSales) - Math.abs(Number(totalReturn)) + Number(totalTax);
		return netInvoice.toString();
    }


    /**
     * Get Net total amount
     * (balance + totalSales) - |totalReturn| + totalTax
     *
     * @param {Number} balance Balance carried forward
     * @param {Number} totalSales Total sales amount
     * @param {Number} totalReturn Total credit amount
     * @param {Number} totalTax Total tax amount
     * @returns {String} Net total amount in string
     */
    function getNetTotal(balance, totalSales, totalReturn, totalTax) {
        let netTotal = (Number(balance) + Number(totalSales)) - Math.abs(Number(totalReturn)) + Number(totalTax);
		return netTotal.toString();
	}


    return ISRegenerationManager;

});
