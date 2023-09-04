/**
 * DJ_���v�������ꊇ���
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2021     gsy95
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){	
	
	createForm(request, response);
//	
//	if (request.getMethod() == 'POST') {
//		run(request, response);
//		
//	}else{
//		if (!isEmpty(request.getParameter('custparam_logform'))) {
//			logForm(request, response)
//		}else{
//			createForm(request, response);
//		}
//	}
	
}

function run(request, response,locationValue,subsidiaryValue){
	

	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	

	
	
	
	//scheduleparams['custscript_djkk_ss_inspection_list_info'] = str;
	runBatch('customscript_djkk_ss_invoice_change_list', 'customdeploy_djkk_ss_invoice_change_list',null);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

//�o�b�`��ԉ��
function logForm(request, response) {

	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_djkk_cs_invoice_change_list');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_invoice_change_list');

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
		createForm(request, response);
	}
	
}

function createForm(request, response){

	 var selectFlg = request.getParameter('selectFlg');
	 var invoicesummaryNoValue = request.getParameter('invoicesummaryNo');
	 var subsidiaryValue = request.getParameter('subsidiary');
	 var customerValue = request.getParameter('customer');
	 var invoicetrandateValue = request.getParameter('invoicetrandate');
	 
	 
	 
	
	var form = nlapiCreateForm('DJ_���v�������ꊇ���', false);
	form.setScript('customscript_djkk_cs_invoice_summary_print');
	

		
//	 //��ʍ��ڒǉ�
//	 if(selectFlg == 'T'){
//		 form.addButton('btn_return', '�����߂�','searchReturn()')
//		 form.addSubmitButton('�쐬')
//	 }else{
//		form.addButton('btn_search', '����', 'search()')
//	 }
	 
	 
	 form.addButton('btn_search', '����', 'search()')
	 form.addSubmitButton('���')

	 form.addFieldGroup('select_group', '����');
	 var subsidiaryField = form.addField('custpage_subsidiary', 'select', '�q���','subsidiary', 'select_group')
	 var invoicesummaryNoField = form.addField('custpage_invoice_summary_tranid', 'select', '���v�������ԍ�','tranid', 'select_group')
	 var invoicetrandateField = form.addField('custpage_lose_date', 'date', '����',null, 'select_group')
	 var customerField = form.addField('custpage_customer', 'multiselect', '�ڋq','customer', 'select_group')
	
	 
	 
	 if(selectFlg == 'T'){
			subsidiaryField.setDisplayType('inline');		
			customerField.setDisplayType('inline');
			invoicesummaryNoField.setDisplayType('inline');
			invoicetrandateField.setDisplayType('inline');

			
			subsidiaryField.setDefaultValue(subsidiaryValue)
			customerField.setDefaultValue(customerValue)
			invoicesummaryNoField.setDefaultValue(invoicesummaryNoValue)
			invoicetrandateField.setDefaultValue(invoicetrandateValue)

			
					
			
		}else{
			
		}
			 
	 
	 
	 var subList = form.addSubList('list', 'list', '');
	 subList.addField('implementation_choice', 'checkbox', '�I��');
	 subList.addField('invoice_subsidiary', 'text', '�q��� ');
	 subList.addField('invoicesummary_no', 'text', '���v�������ԍ�');
	 subList.addField('in_customer', 'text', '�ڋq');
	 subList.addField('delivery_hopedate', 'text', '����');
	 subList.addField('invoice_summary_ringe', 'text', '�\��');

	 
	//if(selectFlg == 'T')		
	 {
			
			var filit = new Array();
			filit.push( ["voided","is","F"]);
			filit.push("AND");
			filit.push(["type","anyof","Custom102"]);
			filit.push("AND");
			filit.push(["mainline","is","T"]);
			//filit.push("AND");

			
		var invoiceSearch = nlapiSearchRecord("transaction",null,
				filit, 
				[
                    new nlobjSearchColumn("subsidiary"), 
                    new nlobjSearchColumn("transactionname"), 
                    new nlobjSearchColumn("formuladate").setFormula("{custbody_suitel10n_jp_ids_cd}"),
                    new nlobjSearchColumn("formulatext").setFormula("{custbody_suitel10n_jp_ids_customer}")
				]
				);
		
		
		if(!isEmpty(invoiceSearch)){
			for(var i = 0 ; i < invoiceSearch.length ;i++){
				subList.setLineItemValue('invoicesummary_no', i+1, invoiceSearch[i].getValue("transactionname"));	
				subList.setLineItemValue('invoice_subsidiary', i+1, invoiceSearch[i].getText("subsidiary"));
				subList.setLineItemValue('in_customer', i+1, invoiceSearch[i].getValue("formulatext"));
				subList.setLineItemValue('delivery_hopedate', i+1, invoiceSearch[i].getValue("formuladate"));
			
			}
		}
		}
		

	 
	 
	 
	 response.writePage(form);
}
