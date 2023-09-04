
function userEventBeforeLoad(type, form, request){
 nlapiLogExecution('DEBUG', 'userEventBeforeLoad', type)
}

function userEventBeforeSubmit(type){
 nlapiLogExecution('DEBUG', 'userEventBeforeSubmit', type)
}


function userEventAfterSubmit(type){
	nlapiLogExecution('debug', 'userEventAfterSubmit',type);
}