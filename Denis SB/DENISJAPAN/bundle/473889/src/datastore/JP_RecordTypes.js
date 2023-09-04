/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 * I see these record types being defined as variables over and over throughout the code.
 * Please use this enumeration instead. Following the DRY (Do not Repeat Yourself) principle.
 */
define([],  () => {

    return {
        REQUEST_RECORD: 'customrecord_jp_loc_gen_request',
        BATCH_RECORD : 'customrecord_suitel10n_jp_ids_gen_batch'
    }
});
