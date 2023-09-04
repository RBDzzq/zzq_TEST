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
	//DJ_óaÇ©ÇËç›å…é¿íníIâµè≥îFâÊñ WF
    function onAction(scriptContext) {

    	var oldRecord = scriptContext.oldRecord
    	var recordId =  oldRecord.getValue('id');
    	var ssScript = task.create({	
			taskType : task.TaskType.SCHEDULED_SCRIPT,
			scriptId : 'customscript_djkk_ss_create_inventory',
			deploymentId : 'customdeploy_djkk_ss_create_inventory',
			params : {
			'custscript_djkk_custbodyid' : recordId
			}	
		});
		var scriptTaskId = ssScript.submit();
    }

    return {
        onAction : onAction
    };
    
});
