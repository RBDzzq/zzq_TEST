/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 */

define([
    "N/query",
    "N/record",
    "N/search",
    "N/format",
    "N/email",
    "N/error",
    "../../data/JP_InvoiceSummaryBatchDAO",
    "../../data/JP_InvoiceSummaryRequestDAO"
],
(
    query,
    record,
    search,
    format,
    email,
    error,
    BatchDAO,
    RequestDAO
) =>{
    let batchDAO = new BatchDAO();
    let requestDAO = new RequestDAO();
    let ERROR = 1;
    let QUEUED = 2;
    let HANGING = 6;
    let INVALID = 4;

    function getInputData() {

        let requestIds = [];
        try {
            let requestSearch = requestDAO.createSearch();
            requestSearch.filters = [
                {name: 'custrecord_jp_loc_gen_req_status', operator:search.Operator.ANYOF,
                    values: [ERROR, QUEUED, HANGING, INVALID]}
            ];
            requestSearch.columns = [
                {name: 'internalid'}
            ];
            let searchIterator = requestDAO.getResultsIterator(requestSearch);
            while(searchIterator.hasNext()){
                requestIds.push(searchIterator.next().id);
            }
        } catch(e) {
            log.error({ title: "InputData_Error", details: [e.name, " : ", e.message].join("") });
            throw e;
        }

        log.debug({ title: "request list", details: requestIds });
        return requestIds;
    }

    function map(context) {
        try {
            let requestId = JSON.parse(context.value);

            let batchSearch = batchDAO.createSearch();
            batchSearch.filters = [
                {name: 'custrecord_japan_loc_parent_request', operator:search.Operator.IS, values: requestId}
            ];
            batchSearch.colums = [
                {name: 'internalid'}
            ];
            let searchIterator = batchDAO.getResultsIterator(batchSearch);
            if(!searchIterator.hasNext()){
                log.error('Deleting request:',requestId);
                record.delete({type:'customrecord_jp_loc_gen_request',id:requestId});
            }
        } catch(e) {
            log.error({ title: "Map_Error", details: [e.name, " : ", e.message].join("") });
            throw e;
        }
    }

    return {
        getInputData: getInputData,
        map: map
    }

});
