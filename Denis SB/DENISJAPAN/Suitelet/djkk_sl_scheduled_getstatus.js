/**
 * 共通SL   SSスクリプトの運転状況を取得する
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jun 2023     zhou
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var customscriptId = request.getParameter('customscriptId');//SS customscriptID
	var customdeployId = request.getParameter('customdeployId');//SS customdeployID
	nlapiLogExecution('debug','customdeployId',customdeployId)
	if(!isEmpty(customdeployId)){
		var batchStatus = getScheduledScriptRunStatus(customdeployId);
		nlapiLogExecution('debug','batchStatus',batchStatus)
		response.write(batchStatus);//Batch Status
	}
}
