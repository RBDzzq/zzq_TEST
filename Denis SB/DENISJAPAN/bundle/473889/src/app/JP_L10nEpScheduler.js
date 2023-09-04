/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    'N/task',
    '../datastore/JP_L10nStore',
    '../data/JP_L10nDAO'
], (task, jpL10nStore, L10nDAO) => {

    class L10nEpScheduler{
        /**
         * Calls the Scheduled Script for upserting EP templates
         *
         * @param {Array} Array of {id, fileId}
         *
         */
        submitL10nSchedScriptUpsert(componentIdsAndFileIds){
            let l10nStore = new jpL10nStore()
            let ssTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
            ssTask.scriptId = l10nStore.ssSchedulerScriptId;
            ssTask.deploymentId = l10nStore.ssSchedulerDeployment;

            let params = {};
            params[l10nStore.scriptBundleId] = new L10nDAO().getBundleId();
            params[l10nStore.scriptBundleName] = l10nStore.bundleName;
            params[l10nStore.scriptAppId] = l10nStore.appId;

            if (componentIdsAndFileIds.length == 0) {
                log.error('NO_EP_TEMPLATE_FOUND', '');
                return;
            }

            params[l10nStore.scriptFileIds] = JSON.stringify(componentIdsAndFileIds);
            ssTask.params = params;
            ssTask.submit();
        };
    }

    return L10nEpScheduler;
});
