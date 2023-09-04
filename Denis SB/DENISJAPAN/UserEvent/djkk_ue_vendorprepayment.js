/**
 * �d����O����UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/05/26     CPC_��
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
	try{
 	   var poid=nlapiGetFieldValue('purchaseorder');
 	   if(!isEmpty(poid)){
 	   var pjid=nlapiLookupField('purchaseorder', poid, 'custbody_djkk_project');
 	   nlapiSetFieldValue('custbody_djkk_project', pjid, false, true);
 	   }
    }catch(e){
 	   nlapiLogExecution('debug', e);
    }
	
	try {
		var projectid = request.getParameter('projectid');
		if (!isEmpty(projectid)) {

			// DJ_�v���W�F�N�g
			nlapiSetFieldValue('custbody_djkk_project', projectid);
		}
	} catch (e) {

	}
 
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
	if(type=='create'){
	try {
		var setrecords = new Object();
		setrecords['transaction'] = nlapiGetRecordId();
		nlapiSendEmail(nlapiGetUser(), mail_address_manager, '�d����O���o���S���ґ��M','�d����O���o���S���ґ��M', null, null, setrecords);
	} catch (e) {
		nlapiLogExecution('debug', e);
	}
	}
}
