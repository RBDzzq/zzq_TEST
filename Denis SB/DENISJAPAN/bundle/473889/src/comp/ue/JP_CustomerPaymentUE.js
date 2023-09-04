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
    '../../lib/JP_TCTranslator'
],
    (
        runtime,
        serverWidget,
        JP_Translator
    ) => {

    let APPLICATIONS_GROUP = 'applications';
    let APPLY_TO_INVOICE_SUMMARY_FIELD = 'custpage_suitel10n_jp_custpay_id';
    let SELECT_TYPE = 'select';

    let TRANS_APPLY_TO_IDS = 'CUSTOMERPAYMENT_LABEL_APPLY_TO_IDS';
    let TRANS_HELP_APPLY_TO_IDS = 'CUSTOMERPAYMENT_LABEL_APPLY_TO_IDS_HELP';

    class JP_CustomerPaymentUE{

        beforeLoad(scriptContext){
            try {
                if(runtime.executionContext == runtime.ContextType.USER_INTERFACE){

                    let labels = new JP_Translator().getTexts([TRANS_APPLY_TO_IDS, TRANS_HELP_APPLY_TO_IDS],
                        true);
                    let form = scriptContext.form;
                    let applyField = form.addField({
                        id:APPLY_TO_INVOICE_SUMMARY_FIELD,
                        label:labels[TRANS_APPLY_TO_IDS],
                        type:SELECT_TYPE,
                        container:APPLICATIONS_GROUP
                    });
                    applyField.setHelpText({help:labels[TRANS_HELP_APPLY_TO_IDS]});
                    applyField.addSelectOption({value:'', text:'', isSelected:true});

                    let includeInInvoiceSummary = form.getField({id:'custbody_4392_includeids'});
                    includeInInvoiceSummary.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

                }
            }
            catch (e) {
                log.error(e.name, e.message);
            }
        }
    }

    return {
        beforeLoad : (scriptContext) => {new JP_CustomerPaymentUE().beforeLoad(scriptContext)}
    };

});
