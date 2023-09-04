/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 May 2023     ZZQ
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var mailTempleteObj = request.getParameter('mailTempleteObj'); //mailTempleteObj
	var faxTempleteObj = request.getParameter('faxTempleteObj'); //faxTempleteObj
	var pdfFileId = request.getParameter('pdfFileId'); //pdfFileId
	var pdfFileIdArr = [];
	pdfFileIdArr.push(pdfFileId);
	nlapiLogExecution('debug','mailTempleteObj',JSON.stringify(mailTempleteObj));
	nlapiLogExecution('debug','faxTempleteObj',JSON.stringify(faxTempleteObj));
	nlapiLogExecution('debug','pdfFileId',pdfFileId);
	if(mailTempleteObj){
		var mailover =automaticSendmail(JSON.parse(mailTempleteObj),pdfFileIdArr);
		nlapiLogExecution('debug','mailover',mailover);
		response.write(mailover);
	}
	if(faxTempleteObj){
		var faxover =automaticSendFax(JSON.parse(faxTempleteObj),pdfFileIdArr);
		nlapiLogExecution('debug','send',faxover);
		response.write(faxover);
	}
}
