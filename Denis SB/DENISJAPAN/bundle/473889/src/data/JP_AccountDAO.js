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

     function AccountDAO(){
         BaseDAO.call(this);
         this.fields = {};
         this.searchId = '';
         this.recordType = record.Type.ACCOUNT;
    }

    util.extend(AccountDAO.prototype, BaseDAO.prototype);

    AccountDAO.prototype.getAccountDuplicates = function(params){
            return this.getRecordDuplicates({field:"name", value: params.value});
        };

    AccountDAO.prototype.createTaxAccount = function(params){
            let taxAccountRec = record.create({
                type: record.Type.TAX_ACCT,
                defaultValues: {
                    nexus: params.nexusID
                }
            });

            let name = params.name;
            if(params.recordRenaming) {
                let dupRecords = this.getAccountDuplicates({value:name})
                let suffix = this.getRecordLabelSuffix({field:"name", duplicateRecords: dupRecords});
                if (suffix) name = name+" "+suffix;
            }

            taxAccountRec.setValue({fieldId:"name", value:name});
            taxAccountRec.setValue({fieldId:"description", value:params.description});
            taxAccountRec.setValue({fieldId:"taxaccttype", value:params.taxaccounttype});
            return taxAccountRec.save();
        }

    return AccountDAO;

});
