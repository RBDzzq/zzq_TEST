/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define([
    'N/record',
    'N/search',
    'N/runtime',
    '../../data/JP_InvoiceSummaryBatchDAO',
    '../../data/JP_InvoiceSummaryRequestDAO',
    '../../data/JP_InvoiceSummaryDAO'
],
(
    record,
    search,
    runtime,
    BatchDAO,
    RequestDAO,
    InvoiceSummaryDAO
) => {
    let batchDAO = new BatchDAO();
    let requestDAO = new RequestDAO();
    let ISDAO = new InvoiceSummaryDAO();
    const DELETE_FAILED_MR_PARAMS = 'custscript_jp_delete_failed_mr_params';

    function getInputData() {
        let requestIds = [];
        let deleteData = [];

        try {
            let params = JSON.parse(runtime.getCurrentScript().getParameter({ name: DELETE_FAILED_MR_PARAMS }));

            if(params.id) {
                requestIds = [params.id];
            }
            else {
                requestIds = requestDAO.getFailedRequests();
            }

            requestIds.forEach(function(reqId) {
                let batchIds = batchDAO.getBatchesFromRequest(reqId);

                if(batchIds.length > 1) {
                    batchIds.forEach(batchId => {
                        deleteData.push(createDeleteDataObj(reqId, batchId,
                            ISDAO.getISFromBatch(batchId)[0], true));
                    });
                }
                else if(batchIds.length === 1) {
                    let ISIds = ISDAO.getISFromBatch(batchIds[0]);
                    if(ISIds.length !== 0) {
                        ISIds.forEach(ISId => {
                            deleteData.push(createDeleteDataObj(reqId, batchIds[0], ISId, false));
                        });
                    }
                    else {
                        deleteData.push(createDeleteDataObj(reqId, batchIds[0], null, false));
                    }
                }
                else {
                    deleteData.push(createDeleteDataObj(reqId));
                }
            });
        }
        catch(e) {
            log.error({ title: "InputData_Error", details: [e.name, " : ", e.message].join("") });
            throw e;
        }

        return deleteData;
    }

    function map(mapContext) {
        let batchData = '';
        let deleteItem = JSON.parse(mapContext.value);

        try {
            if(deleteItem.invoicesummary) {
                record.delete({
                    type: ISDAO.recordType,
                    id: deleteItem.invoicesummary
                });
                log.debug({ title: 'Invoice Summary deleted', details: deleteItem.invoicesummary });
            }

            if(deleteItem.batch && deleteItem.multiplebatch) {
                deleteBatch(deleteItem.batch);
            }
            else {
                batchData = deleteItem.batch || '';
            }
        }
        catch(e) {
            log.error({ title: "Map_Error", details: [e.name, " : ", e.message].join("") });
            throw e;
        }

        mapContext.write({
            key: deleteItem.request,
            value: batchData
        });
    }

    function reduce(reduceContext) {
        let requestId = reduceContext.key;
        let batchIds = reduceContext.values.filter(batchId => {
            return batchId ? batchId : null;
        });

        try {
            if(batchIds.length !== 0) {
                // delete only the first batchId since passing batchId to reduce means 1:1 request and batch
                deleteBatch(batchIds[0]);
            }

            record.delete({
                type: requestDAO.recordType,
                id: requestId
            });
            log.debug({ title: 'Request Record deleted', details: requestId });
        }
        catch(e) {
            log.error({ title: "Reduce_Error", details: [e.name, " : ", e.message].join("") });
            throw e;
        }
    }

    function createDeleteDataObj(reqId, batchId, ISId, isBatchMany) {
        return {
            "request": reqId,
            "batch": batchId,
            "invoicesummary": ISId,
            "multiplebatch": isBatchMany
        }

    }

    function deleteBatch(batchId) {
        if(batchId) {
            record.delete({
                type: batchDAO.recordType,
                id: batchId
            });
            log.debug({ title: 'Batch record deleted', details: batchId });
        }
    }

    return {
        getInputData,
        map,
        reduce
    }
});
