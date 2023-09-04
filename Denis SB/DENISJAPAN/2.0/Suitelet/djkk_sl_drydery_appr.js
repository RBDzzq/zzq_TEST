/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(
		[ 'N/ui/serverWidget', 'N/search', "N/https", "N/log", 'N/runtime',
				'N/file', 'N/task', 'N/record', 'N/url', 'N/format',
				'N/currentRecord' ],
		function(serverWidget, search, https, log, runtime, file, task, record,
				url, format, currentRecord) {

			function onRequest(context) {
				
				var recordId = context.request.parameters.id;
				log.error({title:'recordId',details:recordId});
				
					var mrScript = task.create({
						
						taskType : task.TaskType.SCHEDULED_SCRIPT,
						scriptId : 'customscript_djkk_appr_brybery_ss',
						deploymentId : 'customdeploy_djkk_appr_brybery_ss',
						params : {
						'custscript_djkk_record_id' : recordId
						}	
					});
					var scriptTaskId = mrScript.submit();
					log.error({title:'test',details:'test'});
//					var formBatch = createBatchForm();
//					context.response.writePage(formBatch);						
			}
			
			
			//add form start
			function createBatchForm(){
				var batch = getScheduledScriptRunStatus("customscript_djkk_appr_brybery_ss");
				 formBatch = serverWidget.createForm({
					title : 'batch status'
				});
				formBatch.addFieldGroup({
					id : 'field_group_id_batch',
					label : '実行情報',
				});
				formBatch.clientScriptModulePath = '../Client/djkk_cs_brybery_trans.js';
				
				if(batch=='完了'){
					formBatch.addButton({
					label : 'OK',
					id : 'custpage_sl_body_back',
					functionName : 'goback()'
					});
					var html = '<font color="black"> バッチ処理を完了 </font>';
					var custpageFont = formBatch.addField({
					id : 'custpage_sl_info_status',
					type : serverWidget.FieldType.INLINEHTML,
					label : "status",
					container : 'field_group_id_batch'
				});
				custpageFont.defaultValue = html;
				}else if(batch=='失敗'|| batch=='保留'){
					formBatch.addButton({
					label : 'OK',
					id : 'custpage_sl_body_back',
					functionName : 'goback()'
					});
					var html = '<font color="red"> バッチ処理を失敗しました </font>';
					var custpageFont = formBatch.addField({
					id : 'custpage_sl_info_status',
					type : serverWidget.FieldType.INLINEHTML,
					label : "status",
					container : 'field_group_id_batch'
				});
				custpageFont.defaultValue = html;
				}else if(batch!='失敗'&&batch!='完了'&&batch!='保留'){
					formBatch.addButton({
					label : 'OK',
					id : 'custpage_sl_body_back',
					functionName : 'jump()'
					});
					var html = '<font color="black"> バッチ処理を実行中</font>';
					var custpageFont = formBatch.addField({
					id : 'custpage_sl_info_status',
					type : serverWidget.FieldType.INLINEHTML,
					label : "status",
					container : 'field_group_id_batch'
				});
				custpageFont.defaultValue = html;
				}
				return formBatch;
			}
			
			
			function getScheduledScriptRunStatus(deploymentId) {

				var scheduledscriptinstanceSearchObj = search.create({
					type : "scheduledscriptinstance",
					filters : [ [ "script.scriptid", "is", 'customscript_djkk_appr_brybery_ss'] ],
					columns : [ search.createColumn({
						name : "status",
						label : "ステータス"
					}), search.createColumn({
						name : "timestampcreated",
						label : "作成日"
					}) ]
				});

				var scheduledscriptinstanceResults = getAllResults(scheduledscriptinstanceSearchObj);
				log.debug('scheduledscriptinstanceResults',scheduledscriptinstanceResults[scheduledscriptinstanceResults.length - 1]);
				return scheduledscriptinstanceResults[scheduledscriptinstanceResults.length - 1].getValue({
					name : "status",
					label : "ステータス"
				});

			}
			
			
			function getAllResults(mySearch) {
				var resultSet = mySearch.run();
				var resultArr = [];
				var start = 0;
				var step = 1000;
				var results = resultSet.getRange({
					start : start,
					end : step
				});

				while (results && results.length > 0) {
					resultArr = resultArr.concat(results);
					start = Number(start) + Number(step);
					results = resultSet.getRange({
						start : start,
						end : Number(start) + Number(step)
					});

				}
				return resultArr;
			}
			return {
				onRequest : onRequest
			};
		});
