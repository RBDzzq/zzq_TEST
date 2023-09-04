/**
 *    Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */

define(["N/record",
    "../../data/NQuery/JP_NCustTreeDAO"],
    function (record, custTreeDAO) {

    const MAXLIFE = 30; //The maximum life of a hierarchy record (in days) prior to deletion.
    let custTreeDao;

    let getInputData = () => {
        custTreeDao = new custTreeDAO();
        let custTreeIds = custTreeDao.getAgedCustomerTree(MAXLIFE);
        return custTreeIds;
    }

    let map = context => {
        custTreeDao = new custTreeDAO();
        try{
            record.delete({
                type: custTreeDao.recordType,
                id : context.value
            });
        }
        catch(err){
            log.error("Error Deleting Hierarchy record", JSON.stringify(err));
        }
    }

    return { getInputData, map }
})