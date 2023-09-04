/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["./JP_BaseDAO", "N/record"],

(BaseDAO, record) => {

	 function TaxCodeDAO(){
             BaseDAO.call(this);
             this.fields = {};
             this.searchId = '';
             this.recordType = record.Type.SALES_TAX_ITEM;
         }

         util.extend(TaxCodeDAO.prototype, BaseDAO.prototype);

    TaxCodeDAO.prototype.getTaxCodeDuplicates=function(params) {
             return this.getRecordDuplicates({field:"itemid", value: params.value});
         };

    TaxCodeDAO.prototype.createTaxCode=function (params){
             let taxTypeRec = record.create({
                 type: record.Type.SALES_TAX_ITEM,
                 defaultValues: {
                     nexuscountry: 'JP'
                 }
             });

             let itemid = params.itemid;
             if(params.recordRenaming) {
                 let dupRecords = this.getTaxCodeDuplicates({value:itemid})
                 let suffix = this.getRecordLabelSuffix({field:"itemid", duplicateRecords: dupRecords});
                 if (suffix) itemid = itemid+" "+suffix;
             }

             taxTypeRec.setValue({fieldId:"itemid", value: itemid});
             taxTypeRec.setValue({fieldId:"description", value: params.description});
             taxTypeRec.setValue({fieldId:"rate", value: params.rate});
             taxTypeRec.setValue({fieldId:"includechildren", value: params.includechildren});
             taxTypeRec.setValue({fieldId:"exempt", value: params.exempt});
             taxTypeRec.setValue({fieldId:"isdefault", value: params.isdefault});
             taxTypeRec.setValue({fieldId:"available", value: params.availability});
             taxTypeRec.setValue({fieldId:"taxagency", value: params.vendor});
             taxTypeRec.setValue({fieldId:"taxtype", value: params.taxType});
             taxTypeRec.setValue({fieldId:"acct1", value: params.purchaseTaxAccount});
             taxTypeRec.setValue({fieldId:"acct2", value: params.salesTaxAccount});
             return taxTypeRec.save();
         }

    return TaxCodeDAO;

});
