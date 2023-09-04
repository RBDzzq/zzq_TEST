/**
 *    Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([
    '../../app/JP_PurchaseOrderUI',
    '../../app/JP_TransactionServerSide'
    ],

     (POUI, TransactionServerSide) => {

    function JP_PurchaseOrder_UE(){
        TransactionServerSide.call(this);
    }

         util.extend(JP_PurchaseOrder_UE.prototype, TransactionServerSide.prototype);

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        JP_PurchaseOrder_UE.prototype.beforeLoad=function(scriptContext) {
            let purchaseUI = new POUI();
            purchaseUI.constructUI(scriptContext);

            if([scriptContext.UserEventType.VIEW,
                scriptContext.UserEventType.EDIT,
                scriptContext.UserEventType.CREATE].indexOf(scriptContext.type) > -1){
                this.showHideFields(scriptContext);
            }
        }

        return {
          beforeLoad : (context) =>{ new JP_PurchaseOrder_UE().beforeLoad(context) }
        };

    });
