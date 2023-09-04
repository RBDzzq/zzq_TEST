/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(['N/config'],

(config) => {

    let companyInfo;
    class JP_CompanyDAO{
        getCompValue(id){
            if(!companyInfo){
                companyInfo = config.load({
                    type: config.Type.COMPANY_INFORMATION
                });
            }

            return companyInfo.getValue({fieldId: id});
        };

        useHolidayChecking(){
            return {
                'useHolidayChecking': this.getCompValue('custrecord_suitel10n_jp_sub_use_holiday')
            };
        };

        getAttributes(){
            return {
                'statementSearch': this.getCompValue('custrecord_suitel10n_jp_sub_stat_search'),
                'standardtemplate':this.getCompValue('custrecord_suitel10n_jp_ids_def_template'),
                'consolidatedtemplate':this.getCompValue('custrecord_suitel10n_jp_ids_def_con_tpl')
            };
        };

        getPrintOptions(){
            return this.getCompValue('custrecord_jp_print_option');
        };

        getPrintedPOFolder(){
            return this.getCompValue('custrecord_jp_loc_sub_printed_po');
        };

        getInvSummaryFolder() {
            return this.getCompValue('custrecord_jp_loc_invsum_folder')
        }

        getPDFCustomerSetting(){
            return this.getCompValue('custrecord_jp_isgen_individcust')
        }

        getARDebitAdjustmentItem(){
            return this.getCompValue('custrecord_jp_ar_deb_adj_item_si');
        }

        getDepartment(){
            return this.getCompValue('custrecord_jp_department');
        }

        getLocation(){
            return this.getCompValue('custrecord_jp_location');
        }

        getClass(){
            return this.getCompValue('custrecord_jp_class');
        }
    }

    return JP_CompanyDAO;

});
