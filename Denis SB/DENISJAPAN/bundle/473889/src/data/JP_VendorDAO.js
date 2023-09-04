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

     function VendorDAO(){
             BaseDAO.call(this);
             this.fields = {};
             this.searchId = '';
             this.recordType = record.Type.VENDOR;
         }

         util.extend(VendorDAO.prototype, BaseDAO.prototype);

    VendorDAO.prototype.getVendorDuplicates=function(params) {
             return this.getRecordDuplicates({field:"entityid", value: params.value});
         };

    VendorDAO.prototype.createVendor=function(params) {
             let vendorRec = record.create({type: record.Type.VENDOR});

             let companyname = params.companyname;
             if(params.recordRenaming) {
                 let dupRecords = this.getVendorDuplicates({value:companyname})
                 let suffix = this.getRecordLabelSuffix({field:"entityid", duplicateRecords: dupRecords});
                 if (suffix) companyname = companyname+" "+suffix;
             }

             vendorRec.setValue({fieldId:"companyname", value:companyname});
             vendorRec.setValue({fieldId:"subsidiary", value:params.subsidiary});
             vendorRec.setValue({fieldId:"category", value:params.category});
             return vendorRec.save();
         }

    return VendorDAO;

});
