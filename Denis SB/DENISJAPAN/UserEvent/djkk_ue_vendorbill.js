/**
 * 支払請求書のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/03/25     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
	//changed by geng add start U826
	try{
		var ship = request.getParameter('shipmentnumber');
		if(!isEmpty(ship)){
			nlapiSetFieldValue('custbody_djkk_arrival_number', ship);
		}
	} catch (e){
		
	}
	
	//changed by geng add end U826
	//project/contract add button get values
	try {
		var projectid = request.getParameter('projectid');
		if (!isEmpty(projectid)) {

			// DJ_プロジェクト
			nlapiSetFieldValue('custbody_djkk_project', projectid);
		}
	} catch (e) {

	}
	if (!isEmpty(nlapiGetFieldValue('podocnum'))) {

		// DJ_プロジェクト
		nlapiSetFieldValue('custbody_djkk_createform', 'T');
	}
	
	setFieldDisableType('custbody_djkk_createform', 'hidden');
	
	// CH265 zheng 20230403 start
	if (type == 'view') {
	    
	    var id = nlapiGetRecordId();
	    var showFlg = checkPaymentBtnShows(id);
	    if (showFlg) {
	        var paymentBtn = form.getButton('payment');
	        if (paymentBtn) {
	            paymentBtn.setVisible(false);
	            var userRole = nlapiGetRole();
	            if(userRole == '1022'){
	                paymentBtn.setVisible(true);
	            }   
	        }
	    }
	}
	// CH265 zheng 20230403 end
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){

}

function checkPaymentBtnShows (id) {
    
    var btnShow = false;
    var vendorbillSearch = nlapiSearchRecord("vendorbill",null,
            [
               ["type","anyof","VendBill"], 
               "AND", 
               ["mainline","is","T"], 
               "AND", 
               ["status","anyof","VendBill:A"], 
               //"AND", 
               //["customform","anyof","164"], 
               "AND", 
               ["createdfrom","anyof","@NONE@"], 
               "AND", 
               ["internalid","anyof",id]
            ], 
            [
               new nlobjSearchColumn("internalid")
            ]
      );
    
    if (vendorbillSearch && vendorbillSearch.length > 0) {
        btnShow = true;
    }
    
    return btnShow;
}
