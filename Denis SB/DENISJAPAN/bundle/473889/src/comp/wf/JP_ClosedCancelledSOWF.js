/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 * @NModuleScope SameAccount
 */

define([
    'N/search',
    'N/record',
    '../../data/JP_EntityDAO',
    '../../app/JP_PaymentTermUtility',
    '../../app/JP_DatesCalculator'
],
    (
        search,
        record,
        EntityDAO,
        PaymentTermUtility,
        DatesCalculator
    ) =>  {

    let CLOSING_DATE_FIELD = 'custbody_suitel10n_inv_closing_date';
    let INVOICE_SUMMARY_DATE_FIELD = 'custbody_suitel10n_jp_ids_date';
    let ENTITY_FIELD = 'entity';
    let LAST_MODIFIED_DATE_FIELD = 'lastmodifieddate';

    function onAction(scriptContext){
        try {
            let currentRecord = scriptContext.newRecord;
            let entityDAO = new EntityDAO({type: search.Type.CUSTOMER});
            let entityInfo = entityDAO.retrieveEntityById(currentRecord.getValue({fieldId:ENTITY_FIELD}));
            let paymentTermUtility = new PaymentTermUtility(entityInfo);

            let lastModifiedDate = currentRecord.getValue({fieldId:LAST_MODIFIED_DATE_FIELD});
            let term = paymentTermUtility.getNextTerm(lastModifiedDate);
            let datesCalculator = new DatesCalculator(term);
            let _closingDate = datesCalculator.calculateClosingDate(lastModifiedDate);
            let closingDate = new Date(_closingDate.setHours(0,0,0,0)); // Timezone correction

            if(closingDate){

                let params = {};
                params[CLOSING_DATE_FIELD] = closingDate;
                params[INVOICE_SUMMARY_DATE_FIELD] = closingDate;

                record.submitFields({
                    type: currentRecord.type,
                    id: currentRecord.id,
                    values:params
                 });

            }
        } catch (e) {
            log.error(e.name, e.message);
        }
    }

    return {
        onAction : onAction
    };

});
