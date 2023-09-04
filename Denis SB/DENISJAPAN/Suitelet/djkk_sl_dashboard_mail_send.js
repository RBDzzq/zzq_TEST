/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Jul 2021     admin
 *
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	
	// �P�[���񓚁@�Q�����@�R�[�i
	var dashboard_mail_send_div = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_send_mail_type');
	 if (request.getMethod() == 'POST') {
			try {
				
				var ctx = nlapiGetContext();
				var scheduleparams = new Array();
				var idList='';
				//22/05/19 sys start
				var locationList = '';
				var itemList = '';
				var FromList = '';
				var ToList = '';
				var docnoList = '';
				//22/05/19 sys end
				scheduleparams['custscript_send_div'] = dashboard_mail_send_div;
			     var theCount = parseInt(request.getLineItemCount('custpage_list'));
			     var m01=0;
			      for (var m = 1; m < theCount + 1; m++) {
			        if(request.getLineItemValue('custpage_list', 'check', m)=='T'){			        	
			        	if(m01!=0){
			        		idList+=',';
			        		//22/05/19 sys start
			        		locationList+=',';
			        		itemList+=',';
			        		FromList+=',';
			        		ToList+=',';
			        		docnoList+=',';
			        		//22/05/19 sys end
			    			}
			        	idList+=request.getLineItemValue('custpage_list', 'internalid', m);		
			        	//22/05/19 sys start
			        	locationList+=request.getLineItemValue('custpage_list', 'placeid', m);	
			        	itemList+=request.getLineItemValue('custpage_list', 'item', m);	
			        	FromList+=request.getLineItemValue('custpage_list', 'emailfrom', m);	
			        	ToList+=request.getLineItemValue('custpage_list', 'emailto', m);
			        	docnoList+=request.getLineItemValue('custpage_list', 'docno', m);
			        	//22/05/19 sys end
			        	m01++;
			        	}
			        }
				scheduleparams['custscript_send_list_id'] = idList;

				//22/05/19 sys start
				scheduleparams['custscript_send_location'] = locationList;			
				scheduleparams['custscript_send_item'] = itemList;
				scheduleparams['custscript_send_from'] = FromList;
				scheduleparams['custscript_send_to'] = ToList;
				scheduleparams['custscript_send_docno'] = docnoList;
				runBatch('customscript_djkk_ss_dashboard_mail_send', 'customdeploy_djkk_ss_dashboard_mail_send', scheduleparams);
				//22/05/19 sys end
				var parameter= new Array();
				parameter['custparam_logform'] = '1';
			nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(), null, parameter);
			} catch (e) {
				var form = nlapiCreateForm('DJ_�������M��', true);
				var errorField = form.addField('custpage_runbatch_error', 'text', '', null);
				errorField.setDisplayType('inline');
				errorField.setDefaultValue('<font color="red"> �o�b�`���������s���܂��� </font>');
			    response.writePage(form);
				
			}
	 }else {
			if (!isEmpty(request.getParameter('custparam_logform'))) {
				logForm(request, response,dashboard_mail_send_div)
			}else{
				createForm(request, response,dashboard_mail_send_div);
			}
		}
}
	
/**
* @param {nlobjRequest}
 *            request Request object
* @param {nlobjResponse}
*            response Response object
* @returns {Void} Any output is written via response object
*/
function createForm(request, response,dashboard_mail_send_div) {
	var sendMailType='';
	if(dashboard_mail_send_div == 1){
		sendMailType='�[����';
	}else if (dashboard_mail_send_div == 2) {
		sendMailType='����';
	}else if (dashboard_mail_send_div == 3){
		sendMailType='�z��';
	}
	
	//�p�����[�^�擾
	var field_no_value = request.getParameter('field_no');
	var field_shipdate_value = request.getParameter('field_shipdate');
	var field_field_dj_deliverydate_value = request.getParameter('field_dj_deliverydate');
	var field_field_customer_jp_value = request.getParameter('field_customer_jp');
	var field_customer_en_value = request.getParameter('field_customer_en');
	var field_dj_type_value = '';
	var batch = request.getParameter('batchFlg');
	var selectFlg = request.getParameter('selectFlg');
	var lst = request.getParameter('list');
	var field_sub_value = request.getParameter('field_sub');
	var form = nlapiCreateForm('DJ_'+sendMailType+'�̎������M��', false);
	form.setScript('customscript_djkk_cs_dashboard_mail_send');
			
	// �t�B�[���h�쐬
	form.addFieldGroup('select_group', '��������');
	var field_sub = form.addField('custpage_sub', 'select', '�A��', '','select_group')
    var selectSub=getRoleSubsidiariesAndAddSelectOption(field_sub);
	var field_dj_type = form.addField('custpage_dj_type', 'text', 'DJ_��ރ^�C�v', null, 'select_group');	
	field_dj_type.setDefaultValue(sendMailType);
	field_dj_type.setDisplayType('inline');
	var deployID =form.addField('custpage_deployid', 'text', 'DJ_deployID', null, 'select_group')
	deployID.setDisplayType('hidden');
	deployID.setDefaultValue(nlapiGetContext().getDeploymentId());
	var field_no = form.addField('custpage_no', 'text', '�h�L�������g�ԍ�', null, 'select_group')
	var field_shipdate =form.addField('custpage_shipdate', 'date', '�o�ד�', null, 'select_group')
	var field_dj_deliverydate = form.addField('custpage_dj_deliverydate', 'date', 'DJ_�[�i��', null,'select_group')
	var field_customer_jp = form.addField('custpage_customer_jp', 'text', '�ڋq���O�i���{��j', null,'select_group')
	var field_customer_en = form.addField('custpage_customer_en', 'text', '�ڋq���O�i�p��j', null,'select_group')

	if(isEmpty(field_sub_value)){
		field_sub_value = selectSub;
	}
	
	//�l�ݒ�
	if(!isEmpty(field_sub_value)){
		field_sub.setDefaultValue(field_sub_value);
	}	
	if(!isEmpty(field_no_value)){
		field_no.setDefaultValue(field_no_value);
	}	
	if(!isEmpty(field_shipdate_value)){
		field_shipdate.setDefaultValue(field_shipdate_value);
	}
	if(!isEmpty(field_field_dj_deliverydate_value)){
		field_dj_deliverydate.setDefaultValue(field_field_dj_deliverydate_value);
	}
	if(!isEmpty(field_field_customer_jp_value)){
		field_customer_jp.setDefaultValue(field_field_customer_jp_value);
	}
	if(!isEmpty(field_customer_en_value)){
		field_customer_en.setDefaultValue(field_customer_en_value);
	}
	if(selectFlg == 'T'){
		
		field_sub.setDisplayType('inline');
		field_no.setDisplayType('inline');
		field_shipdate.setDisplayType('inline');
		field_dj_deliverydate.setDisplayType('inline');
		field_dj_deliverydate.setDisplayType('inline');
		field_customer_jp.setDisplayType('inline');
		field_customer_en.setDisplayType('inline');
		form.addButton('btn_searchReturn', '�����߂�', 'searchReturn()');
		form.addSubmitButton('�đ��M');
		
		//�ۑ������p�����[�^�ݒ�
		var searchParam = new Array();
		searchParam.push([ "messages.messagetype", "anyof", "EMAIL" ]);
		searchParam.push("AND");
		searchParam.push([ "subsidiary", "anyof", field_sub_value ]);
								
		if (dashboard_mail_send_div == 1) {
			// �[����
			searchParam.push("AND");
			searchParam.push([ "type", "anyof", "SalesOrd"]);
			searchParam.push("AND");
			searchParam.push(["status","anyof","SalesOrd:B","SalesOrd:E","SalesOrd:A","SalesOrd:D"]);
			searchParam.push("AND");
			searchParam.push([ "custbody_djkk_delivery_replyauto", "is", "T" ]);
			searchParam.push("AND");
			searchParam.push([ "messages.subject", "contains", "�󒍔[���񓚎������M" ]);
			
		} else if (dashboard_mail_send_div == 2) {
			// ����
			searchParam.push("AND");
			searchParam.push([ "type", "anyof","CustInvc" ]);			
			searchParam.push("AND");
			searchParam.push([ "custbody_djkk_invoice_automa", "is", "T" ]);
			searchParam.push("AND");
			searchParam.push([ "messages.subject", "contains", "���������M" ]);
		} else if (dashboard_mail_send_div == 3) {
			// �z��
			searchParam.push("AND");
			searchParam.push([ "type", "anyof", "SalesOrd"]);//, "ItemShip"		
			searchParam.push("AND");
			searchParam.push(["status","anyof","SalesOrd:B","SalesOrd:E","SalesOrd:A","SalesOrd:D"]);			
			searchParam.push("AND");
			//20220520 changed by zhou start
			searchParam.push(["custcol_djkk_payment_delivery","is","T"]);
			//20220520 changed by zhou end
			searchParam.push("AND");
			searchParam.push([ "messages.subject", "contains", "�z���������M" ]);
			//22/05/19 sys  start
			searchParam.push("AND");
			searchParam.push(["item.type","is","InvtPart"])
			//22/05/19 sys  end
		}

		
		if(!isEmpty(field_no_value)){
			searchParam.push("AND");
			searchParam.push([ "numbertext","is", field_no_value]);
		}

		if(!isEmpty(field_shipdate_value)){
			searchParam.push("AND");
			searchParam.push(["shipdate","on",field_shipdate_value]);
		}
		
		if(!isEmpty(field_field_dj_deliverydate_value)){
			searchParam.push("AND");
			searchParam.push(["custbody_djkk_delivery_date","on",field_field_dj_deliverydate_value]);
		}
		
		if(!isEmpty(field_field_customer_jp_value)){
			searchParam.push("AND");
			searchParam.push(["customer.companyname","contains",field_field_customer_jp_value]);
		}
		
		if(!isEmpty(field_customer_en_value)){
			searchParam.push("AND");
			searchParam.push(["customer.custentity_djkk_name_english","contains",field_customer_en_value]);
		}
		
	
		//22/05/19 sys  start
		if(dashboard_mail_send_div == 3){
			var deliverySearch = getSearchResults(
					"transaction",
					null,
					searchParam,
					[
							new nlobjSearchColumn("type"),
							new nlobjSearchColumn("internalid"),
							new nlobjSearchColumn("recordType"),
							new nlobjSearchColumn("tranid"),
							new nlobjSearchColumn("itemid","item",null),
							new nlobjSearchColumn("location")	
					]);
							var itemArr = new Array();
							var mailsArr = new Array();
							var fromArr = new Array();
							for(var i =0;i<deliverySearch.length;i++){
								var location = parseInt(deliverySearch[i].getValue("location"));
								var item = deliverySearch[i].getValue("itemid","item",null);
								itemArr.push(item);
								var internalid = deliverySearch[i].getValue("internalid");
								var salesorderSearch = nlapiSearchRecord("salesorder",null,
										[
										   ["type","anyof","SalesOrd"], 
										   "AND", 
										   ["internalid","anyof",internalid]
										], 
										[
										   new nlobjSearchColumn("authoremail","messages",null)
										]
										);
								var formMail = salesorderSearch[0].getValue("authoremail","messages",null);
								fromArr.push(formMail);
								
								var locationSearch = nlapiSearchRecord("location",null,
									[
									 	["internalid","anyof",location]
									],
									[
									 	new nlobjSearchColumn("custrecord_djkk_mail", "address",null)
									]
									)

										var mails = locationSearch[0].getValue("custrecord_djkk_mail","address");
										mailsArr.push(mails)
															
							}
		}else {
			//22/05/19 sys  end
		// �ۑ������쐬
		var transactionSearch = getSearchResults(
				"transaction",
				null,
				searchParam,
				[
						new nlobjSearchColumn("type", null, "GROUP"),
						new nlobjSearchColumn("internalid", null, "GROUP"),
						new nlobjSearchColumn("recordType", null, "GROUP"),
						new nlobjSearchColumn("tranid", null, "GROUP"),
						new nlobjSearchColumn("isemailed", "messages", "GROUP"),
						new nlobjSearchColumn("messagedate", "messages", "GROUP")
								.setSort(true),
						new nlobjSearchColumn("authoremail", "messages", "GROUP"),
						new nlobjSearchColumn("recipientemail", "messages", "GROUP"),
						new nlobjSearchColumn("cc", "messages", "GROUP"),
						new nlobjSearchColumn("bcc", "messages", "GROUP"),
						new nlobjSearchColumn("subject", "messages", "GROUP"),
						new nlobjSearchColumn("hasattachment", "messages", "GROUP"),
						new nlobjSearchColumn("internalid", "messages", "GROUP")
								.setSort(true) ]);
		
		}
		
		var listCount = 0;
		if(!isEmpty(transactionSearch)){
			listCount = transactionSearch.length;
		}
		//22/05/19 sys  start
		if(!isEmpty(deliverySearch)){              
			listCount = deliverySearch.length
		}
		//22/05/19 sys  end

		// ���׍s�쐬
		var subList = form.addSubList('custpage_list', 'list', '���v�F'+ listCount);
		subList.addMarkAllButtons()
		subList.addField('check', 'checkbox', '�I��');
		var linkField=subList.addField('linkurl', 'url', '�\��');
		linkField.setLinkText('�\��');
		subList.addField('internalid', 'text', 'ID').setDisplayType('hidden');
		subList.addField('doctype', 'text', '���');
		subList.addField('docno', 'text', '�h�L�������g�ԍ�');	
		if(dashboard_mail_send_div == 3){      //22/05/19 sys
			subList.addField('item', 'text', '�A�C�e��');
			subList.addField('place', 'text', '�ꏊ');
			subList.addField('placeid', 'text', '�ꏊID').setDisplayType('hidden');
			subList.addField('emailfrom', 'text', 'FROM');
			subList.addField('emailto', 'text', 'TO');
			subList.addField('emailtitle', 'text', '����');
		}else{
			subList.addField('emailsendflg', 'text', '�d�q���[�����M�ς�');
			subList.addField('emailsenddate', 'text', '���M���t');
			subList.addField('emailfrom', 'text', 'FROM');
			subList.addField('emailto', 'text', 'TO');
			subList.addField('emailcc', 'text', 'CC');
			subList.addField('emailbcc', 'textarea', 'BCC');
			subList.addField('emailtitle', 'text', '����');
			subList.addField('emailattachmentflg', 'text', '�t�@�C���L��');
		}
		


		// ���׍s�ݒ�
		if (!isEmpty(transactionSearch)){
			for (var i = 0; i < listCount; i++) {
				subList.setLineItemValue('internalid',i + 1, transactionSearch[i].getValue("internalid", "messages", "GROUP"));
				subList.setLineItemValue('doctype',i + 1, transactionSearch[i].getText("type", null, "GROUP"));
				var theLink = nlapiResolveURL('RECORD', transactionSearch[i].getValue("recordType", null, "GROUP"), transactionSearch[i].getValue("internalid", null, "GROUP"),'VIEW');
				subList.setLineItemValue('docno', i + 1, transactionSearch[i].getValue("tranid", null, "GROUP"));
				subList.setLineItemValue('linkurl', i + 1, theLink);
				subList.setLineItemValue('emailsendflg', i + 1,transactionSearch[i].getValue("isemailed", "messages", "GROUP") == 'T' ? '�͂�' : '������');
				subList.setLineItemValue('emailsenddate', i + 1,transactionSearch[i].getValue("messagedate", "messages", "GROUP"));
				subList.setLineItemValue('emailfrom', i + 1, transactionSearch[i].getValue("authoremail", "messages", "GROUP"));
				subList.setLineItemValue('emailto', i + 1, transactionSearch[i].getValue("recipientemail", "messages", "GROUP"));
				subList.setLineItemValue('emailcc', i + 1, transactionSearch[i].getValue("cc", "messages", "GROUP") == '- None -' ? '' : transactionSearch[i].getValue("cc", "messages", "GROUP"));
				subList.setLineItemValue('emailbcc', i + 1, transactionSearch[i].getValue("bcc", "messages", "GROUP") == '- None -' ? '' : transactionSearch[i].getValue("bcc", "messages", "GROUP"));
				subList.setLineItemValue('emailtitle', i + 1, transactionSearch[i].getValue("subject", "messages", "GROUP"));
				subList.setLineItemValue('emailattachmentflg', i + 1,transactionSearch[i].getValue("hasattachment","messages", "GROUP") == 'T' ? '�͂�' : '������');
			}
		}
		if(!isEmpty(deliverySearch)){           //22/05/19 sys  start
			for (var i = 0; i < listCount; i++) {
				subList.setLineItemValue('internalid',i + 1, deliverySearch[i].getValue("internalid"));
				subList.setLineItemValue('doctype',i + 1, deliverySearch[i].getText("type"));
				var theLink = nlapiResolveURL('RECORD', deliverySearch[i].getValue("recordType"), deliverySearch[i].getValue("internalid"),'VIEW');
				subList.setLineItemValue('docno', i + 1, deliverySearch[i].getValue("tranid"));
				subList.setLineItemValue('linkurl', i + 1, theLink);
				subList.setLineItemValue('emailfrom', i + 1, fromArr[i]);
				subList.setLineItemValue('emailto', i + 1, mailsArr[i]);
				subList.setLineItemValue('emailtitle', i + 1, "�z���������M");
				subList.setLineItemValue('item', i + 1, deliverySearch[i].getValue("itemid","item",null));
				subList.setLineItemValue('place', i + 1, deliverySearch[i].getText("location"));
				subList.setLineItemValue('placeid', i + 1, deliverySearch[i].getValue("location"));
				
			}
		}//22/05/19 sys  end
		
	}else{
		form.addButton('btn_search', '����', 'search()');
	}

	response.writePage(form);
}

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function logForm(request, response,dashboard_mail_send_div) {
	var sendMailType='';
	if(dashboard_mail_send_div == 1){
		sendMailType='�[����';
	}else if (dashboard_mail_send_div == 2) {
		sendMailType='����';
	}else if (dashboard_mail_send_div == 3){
		sendMailType='�z��';
	}
	var form = nlapiCreateForm('DJ_'+sendMailType+'�̎������M��', false);
	form.setScript('customscript_djkk_cs_dashboard_mail_send');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_dashboard_mail_send');

	if (batchStatus == 'FAILED') {
		// ���s���s�̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
		runstatusField.setDefaultValue(messageColour);
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// ���s���̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('�o�b�`���������s��');
		response.writePage(form);
	}else{
		createForm(request, response,dashboard_mail_send_div);
	}
	
}