/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Oct 2021     admin
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
//	 setFieldDisableType('subsidiary','inline')
	
	if(type == 'create' || type == 'edit'){

		// DJ_òAåã
		setFieldDisableType('custrecord_djkk_dp_subsidiary','hidden')
	
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

function userEventAfterSubmit(type){
	 var id = nlapiGetRecordId();
	 if(!isEmpty(id)){
		 try{
	 var rec = nlapiLoadRecord('department', id);
		var  custSub=rec.getFieldValue('custrecord_djkk_dp_subsidiary');
    	 if(isEmpty(custSub)){
	 var subsidiaryValue = rec.getFieldValue('subsidiary').split('');
		
	 var includechildrenValue = rec.getFieldValue('includechildren');
		
	 var djSubsidiaryList = [];
		
	 var djkkList = [SUB_DJKK,SUB_NBKK,SUB_ULKK,SUB_SCETI,SUB_DPKK];
	 var nbkkList = [SUB_NBKK,SUB_ULKK];
	 var scrtiList = [SUB_SCETI,SUB_DPKK];

	 if(subsidiaryValue.length > 0){

		 for (var i = 0; i < subsidiaryValue.length; i++) {

			 djSubsidiaryList.push(subsidiaryValue[i]);
			 if(includechildrenValue == 'T'){

				 if(subsidiaryValue[i] == SUB_DJKK){
					 djSubsidiaryList = djSubsidiaryList.concat(djkkList);
				 }else if(subsidiaryValue[i] == SUB_NBKK){
					 djSubsidiaryList = djSubsidiaryList.concat(nbkkList);
				 }else if(subsidiaryValue[i] == SUB_SCETI){
					 djSubsidiaryList = djSubsidiaryList.concat(scrtiList);
				 }
			 }
		 }
	 }

	 if(djSubsidiaryList.length > 0){
		 rec.setFieldValues('custrecord_djkk_dp_subsidiary', djSubsidiaryList);
	 }
}else{
   rec.setFieldValue('subsidiary', rec.getFieldValue('custrecord_djkk_dp_subsidiary'));
}
	 nlapiSubmitRecord(rec, false, true);
       }catch(e){
			 nlapiLogExecution('ERROR', 'ÉGÉâÅ[', e.message)
		 }
    }
}
