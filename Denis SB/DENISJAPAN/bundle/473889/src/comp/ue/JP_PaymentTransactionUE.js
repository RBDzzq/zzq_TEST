/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 */
define(["../../app/JP_TransactionServerSide"],
    (TransactionServerSide) => {

    function JP_PaymentTransactionUE(){
            TransactionServerSide.call(this);
        }

        util.extend(JP_PaymentTransactionUE.prototype, TransactionServerSide.prototype);

        JP_PaymentTransactionUE.prototype.beforeLoad=function(scriptContext){
            try {
                if (scriptContext.type === scriptContext.UserEventType.VIEW) {
                    this.showHideFields(scriptContext);
                }
            }
            catch (e) {
                log.error(e.name, e.message);
            }
        }


    return {
        beforeLoad: (scriptContext)=> {new JP_PaymentTransactionUE().beforeLoad(scriptContext)}
    };

});
