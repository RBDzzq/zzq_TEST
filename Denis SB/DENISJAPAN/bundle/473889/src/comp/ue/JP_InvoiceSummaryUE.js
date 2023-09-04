/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 */
define([
    'N/runtime',
    'N/ui/serverWidget',
    '../../lib/JP_TCTranslator',
    '../../data/NQuery/JP_NClientScriptDAO',
    '../../data/NQuery/JP_TaxDetailsDAO',
    '../../data/NQuery/JP_NCustomerDAO',
    '../../data/NQuery/JP_NInvoiceSummaryDAO'
    ],
    (runtime, widget,Translator, ClientScriptDAO, TaxDetails, CustomerDAO, InvoiceSummaryDAO) => {

    const TRANSLATE_REGENERATE_BUTTON = 'IDS_BUTTON_REGENERATE';
    const TAXINVC_SUBLIST_FLH = 'FLH_TAXLAWSUBLIST';

    function JP_InvoiceSummaryUE() {
        this.name = 'JP_InvoiceSummaryUE';

        this.beforeLoad = function(scriptContext) {
            let taxDao = new TaxDetails();
            let fieldKeys = Object.keys(taxDao.fields);
            let labels = fieldKeys.map(field => taxDao.fields[field].labelid.toUpperCase());
            labels.push(TRANSLATE_REGENERATE_BUTTON);
            labels.push(TAXINVC_SUBLIST_FLH);

            let strings = new Translator().getTexts(labels, true);
            let form = scriptContext.form;
            form.addButton({
                id: 'custpage_regenerate_ids_button',
                label: strings[TRANSLATE_REGENERATE_BUTTON],
                functionName: 'regenerateInvoiceSummary'
            });

            if(runtime.executionContext === runtime.ContextType.USER_INTERFACE){
                let sublistType = (scriptContext.type === scriptContext.UserEventType.VIEW )
                    ? widget.SublistType.EDITOR : widget.SublistType.STATICLIST;
                let taxSublist = form.addSublist({
                    id : 'custpage_jp_taxdetails',
                    type : sublistType,
                    label : 'Tax Information'
                });

                //temporary texts, will insert the help text once available.
                taxSublist.helpText = strings[TAXINVC_SUBLIST_FLH];

                let exceptionField = [taxDao.fields.linkedIS.id]; //fields that needs not to show in the table.
                let taxDetailsRecord = taxDao.getTaxDetails(scriptContext.newRecord.id);

                log.debug('taxDetailsRecord', JSON.stringify(taxDetailsRecord));
                for (let field in taxDao.fields){

                    let fieldid = taxDao.fields[field].id;
					let subfield = fieldid.replace('custrecord', 'custpage'); 
                    if(exceptionField.indexOf(fieldid) === -1){

                        if(fieldid === taxDao.fields.adjTransID.id){
                            taxSublist.addField({
                                id : subfield,
                                type: taxDao.fields[field].type,
                                label : strings[taxDao.fields[field].labelid.toUpperCase()],
                                source: 'customsale_jp_loc_debit_bal_adj'
                            });
                        }
                        else{
                            taxSublist.addField({
                                id : subfield,
                                type: taxDao.fields[field].type,
                                label : strings[taxDao.fields[field].labelid.toUpperCase()]
                            });
                        }

                        if(taxDetailsRecord && taxDetailsRecord[0] && taxDetailsRecord[0][fieldid]){
							taxSublist.setSublistValue({
								id: subfield,
								line : 0,
								value : (fieldid === taxDao.fields.adjTransID.id) ? parseInt(taxDetailsRecord[0][fieldid]) :
                                    taxDetailsRecord[0][fieldid]
							});
                        }
                    }
                }
            }

            form.clientScriptFileId = new ClientScriptDAO().getInvoiceSummaryCSScriptFileId();
        }

        this.beforeSubmit = function(context){
            //reflect the customer setting for apply invoice law
            let customerId = context.newRecord.getValue({fieldId: 'custbody_suitel10n_jp_ids_customer'});
            let customerDao = new CustomerDAO();
            let taxInvLawSetting = customerDao.getTaxInvoiceLawSetting(customerId);
            context.newRecord.setValue({
                fieldId: 'custbody_jp_isapplytaxadj',
                value : taxInvLawSetting
            });

            //on deletion of the invoice summary, delete first all the related records.
            if(context.type === context.UserEventType.DELETE){
                let invoiceSummaryDao = new InvoiceSummaryDAO();
                invoiceSummaryDao.deleteRelatedRecords(context.newRecord.id);
            }
        }
    }

    let ISUE = new JP_InvoiceSummaryUE();
    return {
        beforeLoad : (scriptContext)=> {ISUE.beforeLoad(scriptContext)},
        beforeSubmit : (scriptContext) => { ISUE.beforeSubmit(scriptContext)}
    };

});
