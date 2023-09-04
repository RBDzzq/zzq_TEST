/**
 * ブランド
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/01/13     CPC_苑
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
//	setFieldDisableType('subsidiary','inline')
	
	if(type == 'create' || type == 'edit'){

		// DJ_連結
		setFieldDisableType('subsidiary','hidden')
	
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
	 var id = nlapiGetRecordId();
	 if(!isEmpty(id)){
		 try{
	 var rec = nlapiLoadRecord('classification', id);
		var  custSub=rec.getFieldValue('custrecord_djkk_cs_subsidiary');
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
		 rec.setFieldValues('custrecord_djkk_cs_subsidiary', djSubsidiaryList);
	 }
 }else{
    rec.setFieldValue('subsidiary', rec.getFieldValue('custrecord_djkk_cs_subsidiary'));
 }
	 nlapiSubmitRecord(rec, false, true);
        }catch(e){
			 nlapiLogExecution('ERROR', 'エラー', e.message)
		 }
     }
}
