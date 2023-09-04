/**
 * Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/query", "../../lib/JP_QueryIterator"],
    (query, qIterator) => {

    class JP_NBaseDAO{
        createQuery(type){
            return (type) ? query.create({type}) : null;
        }

        getIterator(q){
            return (q) ? new qIterator(q) : null;
        }
    }

    return JP_NBaseDAO;
});