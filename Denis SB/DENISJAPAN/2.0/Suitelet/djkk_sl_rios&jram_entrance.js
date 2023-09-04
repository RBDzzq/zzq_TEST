/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/redirect', 'N/error', 'N/format', 'N/http', 'N/https', 'N/record', 'N/transaction', 'N/ui/serverWidget', 'N/url','N/runtime', 'N/search', 'N/log', 'N/task','N/currentRecord'],
function(redirect,error, format, http, https, record, transaction, serverWidget, url,runtime,search,log,task,currentRecord) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	if (context.request.method === 'GET') {
    		var flag = context.request.parameters.flag;
        	var scriptId = context.request.parameters.scriptId;
        	var deploymentId = context.request.parameters.deploymentId;
        	var url = context.request.parameters.url;
	        var form = serverWidget.createForm({
	            title: 'DJ_注文受信ページの転送'
	        });
	        form.clientScriptModulePath = '../Client/djkk_cs_rios&jram_entrance.js';
	        if(flag != 'T'){
	            form.addButton({
	                id: 'cancelButton1',
	                label: 'JRAM注文受信',
	                functionName: 'JRAMButton();'
	            });
	            form.addButton({
	                id: 'cancelButton2',
	                label: 'RIOS注文受信',
	                functionName: 'RIOSButton();'
	            });
	        }else{
		        form.addSubmitButton({label: '実行'});
		        var scriptIdField = form.addField({
                    id: 'custpage_scriptid',
                    label: 'DJ_scriptId',
                    type: serverWidget.FieldType.TEXT
                });
		        scriptIdField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
		        var deploymentIdField = form.addField({
                    id: 'custpage_deploymentid',
                    label: 'DJ_deploymentId',
                    type: serverWidget.FieldType.TEXT
                });
		        deploymentIdField.updateDisplayType({
		        	displayType: serverWidget.FieldDisplayType.DISABLED
		        });
		        var urlField = form.addField({
                    id: 'custpage_url',
                    label: 'DJ_url',
                    type: serverWidget.FieldType.TEXT
                });
		        urlField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
		        
		        scriptIdField.defaultValue = ''+scriptId;
		        deploymentIdField.defaultValue = ''+deploymentId;
		        urlField.defaultValue = ''+url;
	        }
//	        form.addSubmitButton({label: '実行'});
	        context.response.writePage(form);
        }else if (context.request.method === 'POST') {
        	var scriptId = context.request.parameters.custpage_scriptid;
        	var deploymentId = context.request.parameters.custpage_deploymentid;
        	var url = context.request.parameters.custpage_url;
        	var serverRequest = context.request;
	        // CSV DATA BACKUP
	        var scriptTask = task.create({taskType: task.TaskType.MAP_REDUCE});
	        scriptTask.scriptId = scriptId;
	        scriptTask.deploymentId = deploymentId;
	        var scriptTaskId = scriptTask.submit();
	        redirect.redirect({
//	        	url: '/app/common/scripting/scriptrecord.nl?id='+url
	        	url:'/app/common/scripting/mapreducescriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY'+url
	        });
    	}
    }
    function defaultEmpty(src){
    	return src || '';
    }
    return {
        onRequest: onRequest
    };
    
    
});
