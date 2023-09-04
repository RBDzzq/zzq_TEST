
/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 *
 * Created for backward compatibility, when regenerating a batch.
 * @NModuleScope SameAccount
 * @NApiVersion 2.1
 */

define([],
    () => {

        class JP_BatchToRequestAdaptor{

            constructor(batchRecord) {
                this.batchRecord = batchRecord;

                //maps the batchRecord field to a the corresponding request fields
                this.fieldMap = {
                    'custrecord_suitel10n_jp_ids_gen_b_stat': 'custrecord_jp_loc_gen_req_status',
                    'custrecord_suitel10n_jp_ids_su_sub':'custrecord_jp_loc_gen_req_sub',
                    'custrecord_suitel10n_jp_ids_su_cd': 'custrecord_jp_loc_gen_req_cd',
                    'custrecord_suitel10n_jp_ids_su_cust':'custrecord_jp_loc_gen_req_cust',
                    'custrecord_suitel10n_jp_ids_su_overdue' : 'custrecord_jp_loc_gen_req_overdue',
                    'custrecord_suitel10n_jp_ids_su_sd': 'custrecord_jp_loc_gen_req_sd',
                    'custrecord_suitel10n_jp_ids_su_params' : 'custrecord_jp_loc_gen_req_params',
                    'custrecord_suitel10n_jp_ids_su_no_trans':'custrecord_jp_loc_gen_req_no_trans',
                    'custrecord_japan_loc_cust_savedsearch' : 'custrecord_jp_loc_gen_req_savedsearch',
                    'custrecord_suitel10n_jp_ids_err_detail':'custrecord_jp_loc_gen_req_err_detail'
                }
            }

            getValue(options){
                let returnValue = '';

                if(options && options.fieldId && this.fieldMap[options.fieldId]){
                    returnValue = this.batchRecord.getValue({fieldId: this.fieldMap[options.fieldId]});
                }

                return returnValue;
            }

            getText(options){
                let returnValue = '';

                if(options && options.fieldId && this.fieldMap[options.fieldId]){
                    returnValue = this.batchRecord.getText({fieldId: this.fieldMap[options.fieldId]});
                }

                return returnValue;
            }

        }

        return JP_BatchToRequestAdaptor;
    });
