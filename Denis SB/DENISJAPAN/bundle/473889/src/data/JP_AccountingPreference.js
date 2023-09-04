/**
 * Copyright (c) 2023, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(['N/config'],
    (config) => {

    let accPref;
    class JP_AccountingPreference{

        getAccPref(id){
            if(!accPref){
                accPref = config.load({
                    type: config.Type.ACCOUNTING_PREFERENCES
                });
            }

            return accPref.getValue({fieldId: id});
        };

        isDeptMandatory(){
            return this.getAccPref('DEPTMANDATORY');
        }

        isLocMandatory(){
            return this.getAccPref('LOCMANDATORY');
        }

        isClassMandatory(){
            return this.getAccPref('CLASSMANDATORY');
        }

    }

        return JP_AccountingPreference;


});
