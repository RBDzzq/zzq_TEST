/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/search','../../data/JP_InvoiceSummaryDAO'], (search, InvoiceSummaryDAO) =>{

    function retrieveInvoiceList(requestParams) {
    	if (!requestParams.customer) return [];

    	let params = {
    		customer : requestParams.customer,
    	    subsidiary : requestParams.subsidiary
    	};

        return new InvoiceSummaryDAO().getCustomerInvoiceSummaries(params);
    }

	function doGet(requestParams) {
		return JSON.stringify(retrieveInvoiceList(requestParams));
	}

    return {
        'get': doGet
    };
});
