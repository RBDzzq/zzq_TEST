/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
    '../../data/JP_EntityDAO',
    'N/search',
    'N/record'
], (JP_EntityDAO, search, record) =>{

    function onRequest(context) {

        let id = context.request.parameters.entityid;
        let tranType = context.request.parameters.tranType;
        let entityType;

        switch (tranType) {
            case record.Type.VENDOR_BILL:
            case record.Type.VENDOR_CREDIT:
            case record.Type.PURCHASE_ORDER:
                entityType = search.Type.VENDOR;
                break;
            case record.Type.EXPENSE_REPORT:
                entityType = search.Type.EMPLOYEE;
                break;
            default:
                entityType = search.Type.CUSTOMER;
                break;
        }

        let entityInfo = new JP_EntityDAO({type: entityType}).retrieveEntityById(id);

        context.response.setHeader({
		    name: 'Content-Type',
		    value: 'application/json',
        });

        context.response.write({
            output: JSON.stringify(entityInfo)
        });
    }

    return {
        onRequest: onRequest
    };

});
