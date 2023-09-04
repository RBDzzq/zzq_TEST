/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 */
define(['N/task'], function (task) {

    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try {
            var taskProcess = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_djkk_mr_so_to_import',
                deploymentId: 'customdeploy_djkk_mr_so_to_import_sche'
            });
            var strTaskProcessId = taskProcess.submit();
            log.audit({
                title: 'strTaskProcessId',
                details: strTaskProcessId
            });
        } catch (error) {
            log.error({
                title: 'runMapReduceScript - error',
                details: error
            });
        }
    }
    
    return {
        execute: execute
    };
})