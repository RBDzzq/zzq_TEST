/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/search', 'N/redirect','N/task',], function(runtime, search, redirect,task) {

    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
	//é¿íníIâµè≥îFâÊñ WF
    function onAction(scriptContext) {

    	var oldRecord = scriptContext.oldRecord
    	var recordId =  oldRecord.getValue('id');
    	var ssScript = task.create({	
			taskType : task.TaskType.SCHEDULED_SCRIPT,
			scriptId : 'customscript_djkk_ss_actual_inventory',
			deploymentId : 'customdeploy_djkk_ss_actual_inventory',
			params : {
			'custscript_djkk_recordid' : recordId
			}	
		});
		var scriptTaskId = ssScript.submit();
    }

    return {
        onAction : onAction
    };
    
});
