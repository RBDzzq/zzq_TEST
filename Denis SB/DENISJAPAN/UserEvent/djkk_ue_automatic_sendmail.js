/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Nov 2022     zhou
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
	// CH775 add by zdj 20230807 start
	if(type=='copy'){
		nlapiSetFieldValue('custbody_djkk_delivery_book_flag','F');
		nlapiSetFieldValue('custbody_djkk_invoice_book_flag','F');
		nlapiSetFieldValue('custbody_djkk_delivery_appr_flag','F');
		nlapiSetFieldValue('custbody_djkk_invoice_appr_flag','F');
	}
	// CH775 add by zdj 20230807 end
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
      if (type == 'delete') {
          return;
      }
	  nlapiLogExecution('debug','start','start')
	 
	  var recordType =  nlapiGetRecordType();
	  nlapiLogExecution('debug','recordType232323',recordType)
	  var recordId =  nlapiGetRecordId();
	  var div;
	  var newDiv;
	  var invoiceSumDiv;
	  var creditmemoInvDiv;//�N���W�b�g����  ���������M  �敪Flag
	  var creditmemoDelDiv;//�N���W�b�g����  ���i����[�i�����M   �敪Flag
	  // CH775 add by zdj 20230804 start
	  var invoiceDelDiv;
	  // CH775 add by zdj 20230804 end
	  var shippinginfoSendmailObj = {};
	  var invoiceSendmailObj = {}
	  var deliverySendmailObj = {}
	  var invoiceSumSendmailObj = {}
	  var shippinginfosendtype = '36';//'36'  //DJ_�[���񓚑��M|DJ_�o�׈ē����M�s�v�̏ꍇ
	  var invoiceSendmailsendtype  = '17';//'17' ���������M�s�v�̏ꍇ
	  var deliveryPeriodtype = '10';//�[�i�����M���@�s�v�̏ꍇ
	  
	  var invoiceSumPeriodtype = '25';//���v���������M���@�s�v�̏ꍇ
	  var salesrep =  nlapiGetFieldValue('salesrep');//salesrep
	  var customer =  nlapiGetFieldValue('entity');//�ڋq
 	  var delivery =  nlapiGetFieldValue('custbody_djkk_delivery_destination');//�[�i��
 	  var customform = nlapiGetFieldValue('customform');//customform ls/food
 	  var subsidiary =  nlapiGetFieldValue('subsidiary');//subsidiary
 	  var invoiceFlag =  nlapiGetFieldValue('custbody_djkk_invoice_book_flag');//subsidiary
 	  // CH775 add by zdj 20230807 start
 	 var deliveryFlag =  nlapiGetFieldValue('custbody_djkk_delivery_book_flag');
 	  // CH775 add by zdj 20230807 end
	  if(recordType == 'salesorder' && customform == '121'){
		  div = 7;
		  var status =  defaultEmpty(nlapiGetFieldValue('orderstatus'));
		  shippinginfosendtype = defaultEmpty(nlapiGetFieldValue('custbody_djkk_shippinginfosendtyp'));//DJ_�[���񓚑��M���@|DJ_�o�׈ē����M�敪
		  var shippinginfodesttype = defaultEmpty(nlapiGetFieldValue('custbody_djkk_shippinginfodesttyp'));//DJ_�[���񓚑��M��|DJ_�o�׈ē����M��敪
		  var deliverydestrep = defaultEmpty(nlapiGetFieldValue('custbody_djkk_customerrep_new'));//DJ_�[���񓚑��M��S����|DJ_�o�׈ē����M��S����
		  var shippinginfodestname = defaultEmpty(nlapiGetFieldValue('custbody_djkk_shippinginfodestname'));//DJ_�[���񓚑��M���Ж�(3RD�p�[�e�B�[)|DJ_�o�׈ē����M���Ж�(3RD�p�[�e�B�[)
		  var shippinginfodestrep = defaultEmpty(nlapiGetFieldValue('custbody_djkk_shippinginfodestrep_new'));//DJ_�[���񓚑��M��S����(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��S����(3RD�p�[�e�B�[)
		  var shippinginfodestemail = defaultEmpty(nlapiGetFieldValue('custbody_djkk_shippinginfodestemail'));//DJ_�[���񓚑��M�惁�[��(3RD�p�[�e�B�[)|DJ_�o�׈ē����M�惁�[��(3RD�p�[�e�B�[)
		  var shippinginfodestfax = defaultEmpty(nlapiGetFieldValue('custbody_djkk_shippinginfodestfax'));//DJ_�[���񓚑��M��FAX(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��FAX(3RD�p�[�e�B�[)
		  var shippinginfodestmemo = defaultEmpty(nlapiGetFieldValue('custbody_djkk_reference_delive'));//DJ_�[���񓚎������M���t����l|DJ_�o�׈ē����M��o�^����
		  shippinginfoSendmailObj = {
				  shippinginfosendtype:shippinginfosendtype,
				  shippinginfodesttype:shippinginfodesttype,
				  deliverydestrep:deliverydestrep,
				  shippinginfodestname:shippinginfodestname,
				  shippinginfodestrep:shippinginfodestrep,
				  shippinginfodestemail:shippinginfodestemail,
				  shippinginfodestfax:shippinginfodestfax,
				  shippinginfodestmemo:shippinginfodestmemo
		  };
	  }
	  
	  if(recordType == 'invoice' && (!invoiceFlag || invoiceFlag == 'F')){
		  //�ʐ�����   - ������ 
		  var currentContext = nlapiGetContext();
		  nlapiLogExecution('debug','currentContext.getExecutionContext()',currentContext.getExecutionContext())
		  div = 8;
		  var status =  defaultEmpty(nlapiGetFieldValue('approvalstatus'));
		  invoiceSendmailsendtype = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_book_period'));//DJ_���������M�敪
		  var invoiceSendmaildesttype = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_book_site'));//DJ_���������M��敪
		  var invoiceSendmailrep = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_book_person'));//DJ_���������M��S����
		  var invoiceSendmaildestname = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_book_subname'));//DJ_���������M���Ж�(3RD�p�[�e�B�[)
		  var invoiceSendmaildestrep = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_book_person_t'));//DJ_���������M��S����(3RD�p�[�e�B�[)
		  var invoiceSendmaildestemail = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_automatic_mailtr'));//DJ_���������M�惁�[��(3RD�p�[�e�B�[)
		  var invoiceSendmaildestfax = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_automatic_faxtrd'));//DJ_���������M��FAX(3RD�p�[�e�B�[)
		  var invoiceSendmaildestmemo = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_destination_regi'));//DJ_���������M��o�^����
		  invoiceSendmailObj = {
				  invoiceSendmailsendtype:invoiceSendmailsendtype,
				  invoiceSendmaildesttype:invoiceSendmaildesttype,
				  invoiceSendmailrep:invoiceSendmailrep,
				  invoiceSendmaildestname:invoiceSendmaildestname,
				  invoiceSendmaildestrep:invoiceSendmaildestrep,
				  invoiceSendmaildestemail:invoiceSendmaildestemail,
				  invoiceSendmaildestfax:invoiceSendmaildestfax,
				  invoiceSendmaildestmemo:invoiceSendmaildestmemo
		  };
	  }
//	  if(recordType == 'salesorder'){
//		  //�[�i��
//		  // IF FOOD - MAILNAME :���i����[�i��  SO  FOODFORM
//		  // IF LS - MAILNAME :�[�i��  SO LSFORM
//		  newDiv = 9;
//		  var status =  defaultEmpty(nlapiGetFieldValue('orderstatus'));
//		  deliveryPeriodtype = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_period'));//DJ_�[�i�����M���@
//		  var deliverySite;//DJ_�[�i�����M��
//		  if(customform == '121'){
//			  deliverySite = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_site'));
//		  }else{
//			  deliverySite = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd'));
//		  }
//		  var deliveryPerson = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_person'));//DJ_�[�i�����M��S����
//		  var deliverySubName = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_subname'));//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
//		  var deliveryPersont = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
//		  var deliveryEmail = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_email'));//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
//		  var deliveryFax = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_fax_three'));//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
//		  var deliveryMemo = defaultEmpty(nlapiGetFieldValue('custbody_djkk_reference_column'));//DJ_�[�i���������M���t����l
//		  deliverySendmailObj = {
//				  deliveryPeriodtype:deliveryPeriodtype,
//				  deliverySite:deliverySite,
//				  deliveryPerson:deliveryPerson,
//				  deliverySubName:deliverySubName,
//				  deliveryPersont:deliveryPersont,
//				  deliveryEmail:deliveryEmail,
//				  deliveryFax:deliveryFax,
//				  deliveryMemo:deliveryMemo,
//		  };
//	  }
	  
	  
	  
	  if(recordType == 'creditmemo' && customform == '120'){
		  if (!deliveryFlag || deliveryFlag == 'F'){
			// FOOD - MAILNAME :���i����[�i�� �N���W�b�g����   FOODFORM
			  creditmemoDelDiv = 11;
//			  var status =  defaultEmpty(nlapiGetFieldValue('orderstatus'));
			  deliveryPeriodtype = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_period'));//DJ_�[�i�����M���@
			  var deliverySite;//DJ_�[�i�����M��
				  deliverySite = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd'));
			  var deliveryPerson = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_person'));//DJ_�[�i�����M��S����
			  var deliverySubName = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_subname'));//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
			  var deliveryPersont = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
			  var deliveryEmail = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_email'));//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
			  var deliveryFax = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_fax_three'));//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
			  var deliveryMemo = defaultEmpty(nlapiGetFieldValue('custbody_djkk_reference_column'));//DJ_�[�i���������M���t����l
			  deliverySendmailObj = {
					  deliveryPeriodtype:deliveryPeriodtype,
					  deliverySite:deliverySite,
					  deliveryPerson:deliveryPerson,
					  deliverySubName:deliverySubName,
					  deliveryPersont:deliveryPersont,
					  deliveryEmail:deliveryEmail,
					  deliveryFax:deliveryFax,
					  deliveryMemo:deliveryMemo,
			  };
		  }
		  
		  if (!invoiceFlag || invoiceFlag == 'F'){
			//�ʐ�����  - �N���W�b�g���� 
			  creditmemoInvDiv = 12;
//			  var status =  defaultEmpty(nlapiGetFieldValue('approvalstatus'));
			  invoiceSendmailsendtype = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_book_period'));//DJ_���������M�敪
			  var invoiceSendmaildesttype = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_book_site'));//DJ_���������M��敪
			  var invoiceSendmailrep = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_book_person'));//DJ_���������M��S����
			  var invoiceSendmaildestname = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_book_subname'));//DJ_���������M���Ж�(3RD�p�[�e�B�[)
			  var invoiceSendmaildestrep = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_book_person_t'));//DJ_���������M��S����(3RD�p�[�e�B�[)
			  var invoiceSendmaildestemail = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_automatic_mailtr'));//DJ_���������M�惁�[��(3RD�p�[�e�B�[)
			  var invoiceSendmaildestfax = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_automatic_faxtrd'));//DJ_���������M��FAX(3RD�p�[�e�B�[)
			  var invoiceSendmaildestmemo = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_destination_regi'));//DJ_���������M��o�^����
			  invoiceSendmailObj = {
					  invoiceSendmailsendtype:invoiceSendmailsendtype,
					  invoiceSendmaildesttype:invoiceSendmaildesttype,
					  invoiceSendmailrep:invoiceSendmailrep,
					  invoiceSendmaildestname:invoiceSendmaildestname,
					  invoiceSendmaildestrep:invoiceSendmaildestrep,
					  invoiceSendmaildestemail:invoiceSendmaildestemail,
					  invoiceSendmaildestfax:invoiceSendmaildestfax,
					  invoiceSendmaildestmemo:invoiceSendmaildestmemo
			  };
		  }
	  }
	  
	  // CH775 add by zdj 20230804 start
	  if(recordType == 'invoice' && customform == '160'){
		  if (!deliveryFlag || deliveryFlag == 'F'){
			  invoiceDelDiv = 13;

			  deliveryPeriodtype = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_period'));//DJ_�[�i�����M���@
			  var deliverySite;//DJ_�[�i�����M��
				  deliverySite = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd'));
			  var deliveryPerson = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_person'));//DJ_�[�i�����M��S����
			  var deliverySubName = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_subname'));//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
			  var deliveryPersont = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
			  var deliveryEmail = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_email'));//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
			  var deliveryFax = defaultEmpty(nlapiGetFieldValue('custbody_djkk_delivery_book_fax_three'));//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
			  var deliveryMemo = defaultEmpty(nlapiGetFieldValue('custbody_djkk_reference_column'));//DJ_�[�i���������M���t����l
			  deliverySendmailObj = {
					  deliveryPeriodtype:deliveryPeriodtype,
					  deliverySite:deliverySite,
					  deliveryPerson:deliveryPerson,
					  deliverySubName:deliverySubName,
					  deliveryPersont:deliveryPersont,
					  deliveryEmail:deliveryEmail,
					  deliveryFax:deliveryFax,
					  deliveryMemo:deliveryMemo,
			  };
		  }
	  }
	  // CH775 add by zdj 20230804 end
	  
	  //���v���������M
//	  if(recordType == 'invoice'){
//		  nlapiLogExecution('debug','invoiceSumFlg')
//		  invoiceSumDiv = 10;
//		  var status =  defaultEmpty(nlapiGetFieldValue('approvalstatus'));
//		  if(customform == '179'){//ls
//			  invoiceSumPeriodtype = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_sum_period'));//DJ_���v���������M���@  
//		  }else if(customform == '160'){  //�H�i
//			  var invoiceSumFlg = nlapiGetFieldValue('custentity_djkk_totalinv_pdfsend_flg');
//			  nlapiLogExecution('debug','invoiceSumFlg',invoiceSumFlg)
//			  if(invoiceSumFlg == "T"){
//				  invoiceSumPeriodtype = '28';//DJ_���v���������M���@  (����)
//				  nlapiLogExecution('debug','invoiceSumFlg3',invoiceSumPeriodtype)
//			  }else{
//				  invoiceSumPeriodtype = '25';//DJ_���v���������M���@  (�s�v)
//			  }
//		  }
//		  nlapiLogExecution('debug','invoiceSumFlg1',invoiceSumPeriodtype)
//		  var invoiceSumSite = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_sum_site'));//DJ_���v���������M��
//		  var invoiceSumPerson = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_sum_person'));//DJ_���v���������M��S����
//		  var invoiceSumSubName = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_sum_subname'));//DJ_���v���������M���Ж�(3RD�p�[�e�B�[)
//		  var invoiceSumPersont = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_sum_person_t'));//DJ_���v���������M��S����(3RD�p�[�e�B�[)
//		  var invoiceSumEmail = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_sum_email'));//DJ_���v���������M�惁�[��(3RD�p�[�e�B�[)
//		  var invoiceSumFax = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_sum_fax'));//DJ_���v���������M��FAX(3RD�p�[�e�B�[)
//		  var invoiceSumMemo = defaultEmpty(nlapiGetFieldValue('custbody_djkk_invoice_sum_memo'));//DJ_���v�������������M���t����l
//		  invoiceSumSendmailObj = {
//				  invoiceSumPeriodtype:invoiceSumPeriodtype,
//				  invoiceSumSite:invoiceSumSite,
//				  invoiceSumPerson:invoiceSumPerson,
//				  invoiceSumSubName:invoiceSumSubName,
//				  invoiceSumPersont:invoiceSumPersont,
//				  invoiceSumEmail:invoiceSumEmail,
//				  invoiceSumFax:invoiceSumFax,
//				  invoiceSumMemo:invoiceSumMemo,
//		  };
//		  nlapiLogExecution('debug','invoiceSumFlg2',invoiceSumPeriodtype)
//	  }
	  
	  var entity ={
			  customer:customer,
			  delivery:delivery
	  }
	  //���M�s�v�̏ꍇ�ȊO
	  if(shippinginfosendtype != '36' && div == 7 && !isEmpty(shippinginfosendtype)){
		  //DJ_�[���񓚑��M|DJ_�o�׈ē����M
		  var data = {
				  div:div,
				  recordId:recordId,
				  shippinginfoSendmailObj:shippinginfoSendmailObj,
				  entity:entity,
				  status:status,
				  customform:customform,
				  subsidiary:subsidiary,
				  salesrep:salesrep
		  }
		  data = JSON.stringify(data);
		  var scheduleparams = new Array();
		  scheduleparams['custscript_data'] = data;
		  runBatch('customscript_djkk_ss_automatic_sendmail', 'customdeploy_djkk_ss_automatic_sendmail', scheduleparams);
		  var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_automatic_sendmail');
		  nlapiLogExecution('debug','salesorder runBatch',batchStatus)
		  nlapiLogExecution('debug','salesorder sendmail end')
	  }
//	  if(invoiceSendmailsendtype != '17' && div == 8 && !isEmpty(invoiceSendmailsendtype)){
//		  //DJ_���������M
//		  var data = {
//				  div:div,
//				  recordId:recordId,
//				  invoiceSendmailObj:invoiceSendmailObj,
//				  entity:entity,
//				  status:status,
//				  customform:customform,
//				  subsidiary:subsidiary,
//				  salesrep:salesrep
//		  }
//		  data = JSON.stringify(data);
//		  var scheduleparams = new Array();
//		  scheduleparams['custscript_data'] = data;
//		  runBatch('customscript_djkk_ss_automatic_sendmail', 'customdeploy_djkk_ss_automatic_sendmail', scheduleparams);
//		  var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_automatic_sendmail');
//		  nlapiLogExecution('debug','invoice runBatch',batchStatus)
//		  nlapiLogExecution('debug','invoice sendmail end')
//	  } 
//	  if(deliveryPeriodtype != '10' && newDiv == 9 && deliverySite!= '24' && !isEmpty(deliveryPeriodtype)){
//		//�[�i�����M
//		  var data = {
//				  div:newDiv,
//				  recordId:recordId,
//				  deliverySendmailObj:deliverySendmailObj,
//				  entity:entity,
//				  status:status,
//				  customform:customform,
//				  subsidiary:subsidiary,
//				  salesrep:salesrep,
//				  recordType : recordType
//				  
//		  }
//		  nlapiLogExecution('debug','data.recordType121212',data.recordType)
//		  data = JSON.stringify(data);
//		  
//		  var scheduleparams = new Array();
//		  scheduleparams['custscript_data'] = data;
//		  runBatch('customscript_djkk_ss_automatic_sendmail', 'customdeploy_djkk_ss_automatic_sendmail', scheduleparams);
//		  var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_automatic_sendmail');
//		  nlapiLogExecution('debug','delivery runBatch',batchStatus)
//		  nlapiLogExecution('debug','delivery sendmail end')
//	  }
	  
//	  if(invoiceSumPeriodtype != '25' && invoiceSumDiv == 10 && !isEmpty(invoiceSumPeriodtype)){
//			//���v���������M
//		  nlapiLogExecution('debug','invoiceSum on','invoiceSum on')
//			  var data = {
//					  div:invoiceSumDiv,
//					  recordId:recordId,
//					  invoiceSumSendmailObj:invoiceSumSendmailObj,
//					  entity:entity,
//					  status:status,
//					  customform:customform,
//					  subsidiary:subsidiary,
//					  salesrep:salesrep
//			  }
//			  data = JSON.stringify(data);
//			  var scheduleparams = new Array();
//			  scheduleparams['custscript_data'] = data;
//			  runBatch('customscript_djkk_ss_automatic_sendmail', 'customdeploy_djkk_ss_automatic_sendmail', scheduleparams);
//			  var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_automatic_sendmail');
//			  nlapiLogExecution('debug','invoiceSum runBatch',batchStatus)
//			  nlapiLogExecution('debug','invoiceSum sendmail end')
//		  }
	  if(recordType == 'creditmemo' && customform == '120'){
	      var data = {};
	      data.div = [];
	      data.deliverySendmailObj = {};
	      data.invoiceSendmailObj = {};
	      var sendEmailFlag = false;
	      if(deliveryPeriodtype != '10' && creditmemoDelDiv == 11 && deliverySite!= '24' && !isEmpty(deliveryPeriodtype)&&(!deliveryFlag || deliveryFlag == 'F')){
	          sendEmailFlag = true;
	          data.div.push(creditmemoDelDiv);
	          data.recordId = recordId;
	          data.deliverySendmailObj = deliverySendmailObj;
	          data.entity = entity;
	          data.status = '';
	          data.customform = customform;
	          data.subsidiary = subsidiary;
	          data.salesrep = salesrep;
	          data.recordType = recordType;
	      }
	      if(invoiceSendmailsendtype != '17' && creditmemoInvDiv == 12 && !isEmpty(invoiceSendmailsendtype) && (!invoiceFlag || invoiceFlag == 'F')){
	          sendEmailFlag = true;
	          if(!isEmpty(data.div)){
	              data.div.push(creditmemoInvDiv);
	              data.invoiceSendmailObj = invoiceSendmailObj;
	          }else{
	              data.div.push(creditmemoInvDiv);
	              data.recordId = recordId;
	              data.invoiceSendmailObj = invoiceSendmailObj;
	              data.entity = entity;
	              data.status = '';
	              data.customform = customform;
	              data.subsidiary = subsidiary;
	              data.salesrep = salesrep;
	              data.recordType = recordType;
	          }
	      }
	      if(sendEmailFlag){
	          data = JSON.stringify(data);
	          nlapiLogExecution('debug','data2',data)
	          var scheduleparams = new Array();
	          scheduleparams['custscript_data'] = data;
	          runBatch('customscript_djkk_ss_automatic_sendmail', 'customdeploy_djkk_ss_automatic_sendmail', scheduleparams);
	          var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_automatic_sendmail');
	          nlapiLogExecution('debug','�N���W�b�g���� ���������M  runBatch',batchStatus)
	          nlapiLogExecution('debug','�N���W�b�g���� ���������M end')
	      }
//		  if(deliveryPeriodtype != '10' && creditmemoDelDiv == 11 && deliverySite!= '24' && !isEmpty(deliveryPeriodtype)){
//			//�[�i�����M
//			  var data = {
//					  div:creditmemoDelDiv,
//					  recordId:recordId,
//					  deliverySendmailObj:deliverySendmailObj,
//					  entity:entity,
//					  status:'',
//					  customform:customform,
//					  subsidiary:subsidiary,
//					  salesrep:salesrep
//			  }
//			  data = JSON.stringify(data);
//			  var scheduleparams = new Array();
//			  scheduleparams['custscript_data'] = data;
//			  runBatch('customscript_djkk_ss_automatic_sendmail', 'customdeploy_djkk_ss_automatic_sendmail', scheduleparams);
//			  var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_automatic_sendmail');
//			  nlapiLogExecution('debug','�N���W�b�g���� ���i����[�i�����M  runBatch',batchStatus)
//			  nlapiLogExecution('debug','�N���W�b�g���� ���i����[�i�����M end')
//		  }
//		  if(invoiceSendmailsendtype != '17' && creditmemoInvDiv == 12 && !isEmpty(invoiceSendmailsendtype)){
//			  //DJ_���������M
//			  nlapiLogExecution('debug','data1',data)
//			  var data = {
//					  div:creditmemoInvDiv,
//					  recordId:recordId,
//					  invoiceSendmailObj:invoiceSendmailObj,
//					  entity:entity,
//					  status:'',
//					  customform:customform,
//					  subsidiary:subsidiary,
//					  salesrep:salesrep
//			  }
//			  
//			  data = JSON.stringify(data);
//			  nlapiLogExecution('debug','data2',data)
//			  var scheduleparams = new Array();
//			  scheduleparams['custscript_data'] = data;
//			  runBatch('customscript_djkk_ss_automatic_sendmail', 'customdeploy_djkk_ss_automatic_sendmail', scheduleparams);
//			  var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_automatic_sendmail');
//			  nlapiLogExecution('debug','�N���W�b�g���� ���������M  runBatch',batchStatus)
//			  nlapiLogExecution('debug','�N���W�b�g���� ���������M end')
//		  } 
	  }
	  
	  // CH775 add by zdj 20230804 start
	  nlapiLogExecution('debug','entity',JSON.stringify(entity));
	  if(recordType == 'invoice'){
	      var invoice=nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
	      var status =  defaultEmpty(nlapiGetFieldValue('approvalstatus'));
	      var data = {};
          data.div = [];
          data.deliverySendmailObj = {};
          data.invoiceSendmailObj = {};
	      var sendEmailFlag= false;
	      var deliveryappFlag =  nlapiGetFieldValue('custbody_djkk_delivery_appr_flag');
	      if((!deliveryappFlag || deliveryappFlag == 'F')&&(!deliveryFlag || deliveryFlag == 'F') && status=='2'){
	    	  invoice.setFieldValue('custbody_djkk_delivery_appr_flag', 'T');
	          if(deliveryPeriodtype != '10' && invoiceDelDiv == 13 && deliverySite!= '24' && !isEmpty(deliveryPeriodtype) && customform == '160'){
	              sendEmailFlag = true;
	              data.div.push(invoiceDelDiv);
	              data.recordId = recordId;
	              data.deliverySendmailObj = deliverySendmailObj;
	              data.entity = entity;
	              data.status = '';
	              data.customform = customform;
	              data.subsidiary = subsidiary;
	              data.salesrep = salesrep;
	              data.recordType = recordType;
	          }
	      }
          var invappFlag =  nlapiGetFieldValue('custbody_djkk_invoice_appr_flag');
          if((!invoiceFlag || invoiceFlag == 'F')&&(!invappFlag || invappFlag == 'F') && status=='2'){
              invoice.setFieldValue('custbody_djkk_invoice_appr_flag', 'T');
              if(invoiceSendmailsendtype != '17' && div == 8 && !isEmpty(invoiceSendmailsendtype)){
                  sendEmailFlag = true;
                  if(!isEmpty(data.div)){
                      data.div.push(div);
                      data.status = status;
                      data.invoiceSendmailObj = invoiceSendmailObj;
                  }else{
                      data.div.push(div);
                      data.recordId = recordId;
                      data.invoiceSendmailObj = invoiceSendmailObj;
                      data.entity = entity;
                      data.status = status;
                      data.customform = customform;
                      data.subsidiary = subsidiary;
                      data.salesrep = salesrep;
                      data.recordType = recordType;
                  }
		      }
		  }
		  if(sendEmailFlag){
		      nlapiSubmitRecord(invoice, false, true);
		      data = JSON.stringify(data);
	          var scheduleparams = new Array();
	          nlapiLogExecution('debug','data',JSON.stringify(data));
	          scheduleparams['custscript_data'] = data;
	          runBatch('customscript_djkk_ss_automatic_sendmail', 'customdeploy_djkk_ss_automatic_sendmail', scheduleparams);
	          var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_automatic_sendmail');
	          nlapiLogExecution('debug','�N���W�b�g���� ���i����[�i�����M  runBatch',batchStatus);
	          nlapiLogExecution('debug','�N���W�b�g���� ���i����[�i�����M end');
		  }
		  
	  }
	  // CH775 add by zdj 20230804 end
}
function defaultEmpty(src){
	return src || '';
}