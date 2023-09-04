/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    "./JP_BaseDAO",
    "N/record"
], (BaseDAO, record) =>{

    function TaxTypeDAO(){
            BaseDAO.call(this);
            this.fields = {};
            this.searchId = '';
            this.recordType = record.Type.TAX_TYPE;
        }

        util.extend(TaxTypeDAO.prototype, BaseDAO.prototype);

    TaxTypeDAO.prototype.createTaxType=function(params) {
            let taxTypeRec = record.create({
                type: record.Type.TAX_TYPE,
                defaultValues: {
                    country: 'JP'
                }
            });

            taxTypeRec.setValue({fieldId:"name", value:params.name});
            taxTypeRec.setValue({fieldId:"description", value:params.description});
            taxTypeRec.setSublistValue({sublistId:"nexusestax", fieldId: "saletaxacct",
                line: 0, value:params.taxAccountTypes.sale});
            taxTypeRec.setSublistValue({sublistId:"nexusestax", fieldId: "purchtaxacct",
                line: 0, value:params.taxAccountTypes.purchase});
            return taxTypeRec.save();
        }

    return TaxTypeDAO;

});
