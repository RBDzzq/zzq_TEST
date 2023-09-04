/**
 * DJ_‰¿Ši•\‚ÌUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/05     CPC_‰‘
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {
	setLineItemDisableType('recmachcustrecord_djkk_pldt_pl_fd','custrecord_djkk_pl_enddate_calculationfd','hidden')
	setLineItemDisableType('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_pldt_code_fd', 'hidden','hidden');


}

function userEventBeforeSubmit(type) {

	
	
}

function userEventAfterSubmit(type) {
	try{
		  var custrecord_djkk_pl_name = nlapiGetFieldValue('custrecord_djkk_pl_name_fd');
		  var custrecord_djkk_pl_code = nlapiGetFieldValue('custrecord_djkk_pl_code_fd');
		  nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(),'name',  custrecord_djkk_pl_code+ ' '+custrecord_djkk_pl_name,false);
		  
		  // add by song 2023/01/16 CH051 start
		  var str = '';
		  var scheduleparams = new Array();
		  var recordId =  nlapiGetRecordId();
		  var pricelistFd = nlapiLoadRecord('customrecord_djkk_price_list_fd',recordId);
		  var conts = pricelistFd.getLineItemCount('recmachcustrecord_djkk_pldt_pl_fd');
		  nlapiLogExecution('debug', 'conts', conts);
		  for(var i = 1;i < conts+1; i++){
			  var chk = pricelistFd.getLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_pldt_invalid_fd', i);
			  var id = pricelistFd.getLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'id', i);
			  if(chk == 'T'){
				  str += id+'_'+chk+',';
			  }
		  }
//		  str = JSON.stringify(str);
//		  nlapiLogExecution('debug', 'str', str);
		  scheduleparams['custscript_djkk_price_recordid'] = str;
		  runBatch('customscript_djkk_ss_price_list_fd', 'customdeploy_djkk_ss_price_list_fd', scheduleparams);
		// add by song 2023/01/16 CH051 end
		  }catch(e){
			  
	}
}

