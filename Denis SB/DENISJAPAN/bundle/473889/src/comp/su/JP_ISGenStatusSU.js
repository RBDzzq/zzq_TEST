/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
        '../../app/JP_ISGenStatusUI',
        '../../data/JP_SchedScriptInstanceDAO',
        '../../datastore/JP_Scripts',
        'N/task',
        'N/redirect'
    ],

(ISGenStatusUI, SSInstanceDAO, JP_Scripts, task , redirect) => {

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        let params = context.request.parameters;

        let isRerun = (params && params.rerun);
        let ssInstanceDao = new SSInstanceDAO();
        let alreadyTriggered = ssInstanceDao.hasQueuedInstance(JP_Scripts.MR_SCHEDULER_SS_DEPLOYMENT);

        let triggerTask = (!!isRerun && !alreadyTriggered);

        if(triggerTask){
            let ssTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
            ssTask.scriptId = JP_Scripts.MR_SCHEDULER_SS_SCRIPT;
            ssTask.deploymentId = JP_Scripts.MR_SCHEDULER_SS_DEPLOYMENT
            ssTask.submit();
        }

        let toDelete = (context.request.parameters && context.request.parameters.toDelete);
        let isDeleteMRRunning = ssInstanceDao.hasQueuedInstance(JP_Scripts.DELETE_FAILED_GEN_MR_DEPLOYMENT);

        let triggerDelete = (!!toDelete && !isDeleteMRRunning);

        if(triggerDelete) {
            let mrTask = task.create({ taskType: task.TaskType.MAP_REDUCE });
            mrTask.scriptId = JP_Scripts.DELETE_FAILED_GEN_MR_SCRIPT;
            mrTask.deploymentId = JP_Scripts.DELETE_FAILED_GEN_MR_DEPLOYMENT;
            mrTask.params = { "custscript_jp_delete_failed_mr_params": toDelete === 'all' ? {} : {id: toDelete} };
            mrTask.submit();

            redirect.toTaskLink({ id: 'LIST_MAPREDUCESCRIPTSTATUS' });
        }

        let settings = {
            filter :  (params && params.filter) ? params.filter : 0
        };

        context.response.writePage(new ISGenStatusUI().buildUI(triggerTask, settings));
    }

    return {
        onRequest
    };

});
