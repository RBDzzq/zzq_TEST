/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jun 2023     10046
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var ctx = nlapiGetContext();	
	var type = request.getParameter('type');
	nlapiLogExecution('debug', 'type', type)
	var id = request.getParameter('id');
	nlapiLogExecution('debug', 'id', id)
	var filters = request.getParameter('filters');
	nlapiLogExecution('debug', 'filters', filters)
	var columns=request.getParameter('columns');
	nlapiLogExecution('debug', 'columns', columns)
	var results = request.getParameter('results');
	var maxCount = request.getParameter('maxCount');

	if(isEmpty(results)){
		results = [];
	}
    if(isEmpty(maxCount)){
    	maxCount = 0;
	}
	var results=newSearchResults(type, id, filters, columns,results,maxCount);
	if(results.endflag){
		nlapiLogExecution('debug', 'results', JSON.stringify(results.results));
		response.write(JSON.stringify(results.results));
	}else{
		var parameter= new Array();
		 
		parameter['type'] = type
		parameter['id'] = id;
		parameter['filters'] = filters;
		parameter['columns'] = columns;
		parameter['results'] = results.results;
		parameter['maxCount'] = results.maxCount;
	nlapiSetRedirectURL('suitelet',ctx.getScriptId(), ctx.getDeploymentId(), null, parameter);
	}
}

function getSearchResults(type, id, filters, columns) {
    var results = [];
    var parameter= new Array();
	 
	parameter['type'] = type
	parameter['id'] = id;
	parameter['filters'] = JSON.stringify(filters);
	parameter['columns'] = JSON.stringify(columns);
    var theLink='https://5722722-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=742&deploy=1&compid=5722722_SB1&h=2e910dedeb579a63337b';

	theLink +='&type=' + type;
	theLink +='&id=' + id;
	theLink +='&filters=' + filters;
	theLink +='&columns=' + columns;
	var rse = nlapiRequestURL(theLink);
	var results = rse.getBody();
	var results= eval("(" + results+ ")");
    return results;
}

function newSearchResults(type, id, filters, columns,results,maxCount) {
	if(isEmpty(filters)||filters=='null'){
		filters =null;
	}else{
		filters =eval("(" + filters+ ")");
	}
	if(isEmpty(columns||columns=='null')){
		columns = null;
	}else{
		columns =eval("(" + columns+ ")");
	}
	nlapiLogExecution('debug', 'filters', JSON.stringify(filters));
	nlapiLogExecution('debug', 'columns', JSON.stringify(columns));
    var search = nlapiCreateSearch(type, filters, columns);
    var remainingUsage=nlapiGetContext().getRemainingUsage()
    // åüçıÇµÅAåãâ ÇìnÇ∑
    var searchResult = search.runSearch(); 
  if(!isEmpty(searchResult)){
    var resultInfo;
    try{
    do {
        resultInfo = searchResult.getResults(maxCount, maxCount + 1000);
        remainingUsage=nlapiGetContext().getRemainingUsage();      
       
      //  nlapiLogExecution('debug', '',dian+'|'+nlapiGetContext().getRemainingUsage());
        if (!isEmpty(resultInfo)) {
            resultInfo.forEach(function(row) {
                results.push(row);
            });
        }
        maxCount += 1000;
        if(remainingUsage<20){
        	return {results:results,maxCount:maxCount,endflag:false};
        }
    } while (resultInfo.length == 1000);
    }catch(e){}
   }
    return {results:results,maxCount:maxCount,endflag:true};
}