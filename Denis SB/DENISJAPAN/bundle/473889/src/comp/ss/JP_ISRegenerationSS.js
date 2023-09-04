/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 *
 */
define([
    'N/runtime',
    'N/file',
    'N/search',
    '../../app/JP_ISRegenerationManager',
    '../../app/JP_PostGenerationNotifier'
], (
    runtime,
    file,
    search,
    ISRegenerationManager,
    PostGenerationNotifier
) =>{

    let INV_SUM_REC_PARAM = 'custscript_inv_sum_rec_id';

    function execute(scriptContext) {

        let script = runtime.getCurrentScript();
        let recId = script.getParameter({
            name: INV_SUM_REC_PARAM
        });

        let fileAttributes = {
            url: '',
            file: ''
        };

        let regenManager = new ISRegenerationManager();
        let fileId = regenManager.regenerate(recId);
        if (fileId) {
            let fileObj = file.load({
                id: fileId
            });
            fileAttributes.url = fileObj.url;
            fileAttributes.file = fileObj.name;
        }

        let notifier = new PostGenerationNotifier();
		notifier.notifyCreator(runtime.getCurrentUser().id , [fileAttributes]);
    }

    return {
        execute: execute
    };

});
