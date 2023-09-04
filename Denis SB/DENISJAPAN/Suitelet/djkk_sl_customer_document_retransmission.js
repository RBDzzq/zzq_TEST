/**
 * U333  �ڋq�����̏��ލđ��M�@�\
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Apr 2023     zhou
 *
 */

function suitelet(request, response){	
	
	if (request.getMethod() == 'POST') {
				run(request, response);
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			csvOut(request, response)
		}else{
			createForm(request, response);
		}
	}
	
}



function run(request, response){
	nlapiLogExecution('debug', 'action station', '�J�n');
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	var strCsv = '';
//	var xmlString = '';
	var theCount = parseInt(request.getLineItemCount('list'));
	var express = request.getParameter('custpage_express');
	var expressType;
	if(express == '3887'){
		expressType = '����^�A�������';
	}else if(express == '4'){
		expressType = '���Z';
	}else if(express == '685'){
		expressType = '���{�ʉ^�������';
	}else if(express == '684'){
		expressType = '���}�g�^�A�������';
	}
	var date = request.getParameter('custpage_date');//���t
	

	var fieldIdTextval = request.getParameter('custpage_fieldid');//
	var jobId = guid();//�\�Ǘ��Abatch�֘AID
//	var timeZoneTextval = request.getParameter('custpage_time_zone');//���ԑ�  20230213 changed by zhou  U046�ۑ�K��s�v
	nlapiLogExecution('debug', 'action express', express);
	nlapiLogExecution('debug', 'action expressType', expressType);
	var dataBatchnumber;
	if(expressType== '���{�ʉ^�������'){
		var lineDataObj = {}//���X�g�s�I�u�W�F�N�g
		var dataserialnumberArr = [];//dataserialnumberArr
		var otherDataArr = [];//�����쐬�@�\���X�g���̑��̗v�fArray
		//
		for(var i = 0 ; i < theCount ; i++){
			if(request.getLineItemValue('list', 'chk', i+1)=='T'){
				var dataserialnumber = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_dataserialnumber', i+1));//�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�	
				var substitution = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_total_amount', i+1));//��v������z
				var insurancePremium = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_insurance_premium', i+1));//��v�ی���
				var deliveryTimeZone = defaultEmpty(request.getLineItemValue('list', 'custpage_ne_deliverytimezone', i+1));//�z�B�w�莞��  changed by zhou 20230310
				nlapiLogExecution('debug','2023insurancePremium',insurancePremium)
				nlapiLogExecution('debug','2023deliveryTimeZone',deliveryTimeZone)
				
				dataserialnumberArr.push(dataserialnumber);
				otherDataArr.push({
					dataserialnumber:dataserialnumber,//DJ_�Ǘ��ԍ�  �z��I�u�W�F�N�g�\��v�f
					substitution:substitution,//��v������z
					insurancePremium:insurancePremium,//��v�ی���
					deliveryTimeZone:deliveryTimeZone,//�z�B�w�莞��  changed by zhou 20230310
				    data:'',//DJ_DATA  �z��I�u�W�F�N�g�\��v�f
				    internalid:''
				})
			}
		}
		scheduleparams['custscript_djkk_data'] = JSON.stringify(otherDataArr);
		scheduleparams['custscript_djkk_fieldid'] = JSON.stringify(fieldIdTextval);
		scheduleparams['custscript_djkk_freight_company'] = expressType;
		scheduleparams['custscript_djkk_jobid'] = jobId;

		var batchStatus = runBatch('customscript_djkk_ss_invoice_creation', 'customdeploy_djkk_ss_invoice_creation',scheduleparams);
		nlapiLogExecution('debug','batch',batchStatus)
	}else if(expressType == '����^�A�������'){}else{}
	
	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	parameter['express'] = express;
	parameter['jobId'] = jobId;
	parameter['fieldId'] = fieldIdTextval;
	
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}
function csvOut(request, response) {
	var form = nlapiCreateForm('DJ_�ڋq�����̏��ލđ��M���', false);
	
	form.setScript('customscript_djkk_cs_cust_sendmail_again');
	
	
	
	
	var jobId = request.getParameter('jobId');
	 var expressCode=  form.addField('custpage_express_code', 'text', 'express').setDisplayType('hidden');
	 expressCode.setDefaultValue(express);
	 
	 
	 
	 
	form.addFieldGroup('custpage_run_info', '�^�]���');
	var runstatusField = form.addField('custpage_run_info_status', 'text',
			'', null, 'custpage_run_info');
	runstatusField.setDisplayType('inline');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_invoice_creation');

	if (batchStatus == 'FAILED') {
		// ���s���s�̏ꍇ
		var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
		runstatusField.setDefaultValue(messageColour);
		form.addButton('btn_approved', '�߂�','go_back()');
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// ���s���̏ꍇ
		runstatusField.setDefaultValue('�o�b�`���������s��');
		form.addButton('custpage_refresh', '�X�V', 'refresh();');
		response.writePage(form);
	}else{
		runstatusField.setDefaultValue('����������');
		
		var jobSearch = getSearchResults("customrecord_djkk_csv_outut_record",null,
				[
				   ["custrecord_djkk_csv_key","is",jobId]
				], 
				[ 
				   new nlobjSearchColumn("custrecord_djkk_csv_key"), 
				   new nlobjSearchColumn("custrecord_output_csv_fileid"), 
				]
				);
		nlapiLogExecution('DEBUG', 'show me the jobId', jobId);
		if(!isEmpty(jobSearch)){
			 var csv_fileid = parseInt(jobSearch[0].getValue("custrecord_output_csv_fileid"));
			 nlapiLogExecution('DEBUG', 'show me the jobSearch', csv_fileid);
			 var csv_fileid_id = nlapiLoadFile(csv_fileid);
			 var csv_fileid_url= csv_fileid_id.getURL();
			 var csvDownUrl = "window.open('" + csv_fileid_url + "', '_blank');"; 
			 form.addButton('btn_approved', 'CSV�̃_�E�����[�h',csvDownUrl);
			 form.addButton('btn_approved', '�߂�','go_back()');
		}
		
	}

	 response.writePage(form);
}
function createForm(request, response){
	var clubValue=request.getParameter('sub');//���
	var customerPo=request.getParameter('customerPo');//�ڋq�����ԍ�
	var section=request.getParameter('section');//�Z�N�V����
	var customer=request.getParameter('customercode');//�ڋq�i������j�R�[�h
	var type=request.getParameter('type');//���ރ^�C�v
//	var customername=request.getParameter('customername');//�ڋq�i������j���O
	var issuedateForm=request.getParameter('issuedateForm');//�쐬��
	var delivery=request.getParameter('delivery');//�[�i��id
	var issuedateTo=request.getParameter('issuedateTo');//�쐬��
//	var deliveryName=request.getParameter('deliveryName');//�[�i�於�O
	var documentNo=request.getParameter('documentNo');//���ޔԍ����ޔԍ�
	var trannumber=request.getParameter('trannumber');//�󒍔ԍ�
	var numberArr = [];
	if(!isEmpty(trannumber)){
		var str = trannumber.split(',');
		for(var c=0;c<str.length;c++){
			numberArr.push(str[c]);
		}
	}
	var shipbydateForm=request.getParameter('shipbydateForm');//�o�ד�From
	var shipbydateTo=request.getParameter('shipbydateTo');//�o�ד�To
	var deliverydateForm=request.getParameter('deliverydateForm');//�[�i��From
	var deliverydateTo=request.getParameter('deliverydateTo');//�[�i��To
	
	var selectFlg=request.getParameter('selectFlg');//selectFlg
	
	
	
	
	
	
	var filit = new Array();
	//�󒍔ԍ�
	if(!isEmpty(trannumber)){
	    filit.push(["internalid","is",numberArr]);
		filit.push("AND");
	}
	 //�o�ד�From
	if(!isEmpty(shipbydateForm)){
		filit.push(["shipdate","onorafter",shipbydateForm]);
		filit.push("AND");
	}
	//�o�ד�To
	if(!isEmpty(shipbydateTo)){
		filit.push(["shipdate","onorbefore",shipbydateTo]);
		filit.push("AND");
	}
	//���
	if(!isEmpty(clubValue)){
		filit.push(["subsidiary","anyof",clubValue]);
		filit.push("AND");
	}
	//�쐬��From
	if(!isEmpty(issuedateForm)){
		filit.push(["trandate","onorafter",issuedateForm]);
		filit.push("AND");
	}
	//�[�i��
	if(!isEmpty(delivery)){
		filit.push(["custbody_djkk_delivery_destination","onorafter",delivery]);
		filit.push("AND");
	}
	//�쐬��To
	if(!isEmpty(issuedateTo)){
		filit.push(["trandate","onorbefore",issuedateTo]);
		filit.push("AND");;
	}
	//�[�i��From
	if(!isEmpty(deliverydateForm)){
		filit.push(["custbody_djkk_delivery_date","onorafter",deliverydateForm]);
		filit.push("AND");
	}
	//�[�i��To
	if(!isEmpty(deliverydateTo)){
		filit.push(["custbody_djkk_delivery_date","onorbefore",deliverydateTo]);
		filit.push("AND");
	}
	//�Z�N�V����
	if(!isEmpty(section)){
		filit.push(["department","anyof",section]);
		filit.push("AND");
	}
	//type ���ރ^�C�v
	if(type = 'Invoice'){
		filit.push(["type","anyof","CustCred","CustInvc"]);
		filit.push("AND");
	}
		filit.push(["itemtype","is","InvtPart"]);
		filit.push("AND");
		filit.push(["custcol_djkk_invoice_creation_over","is","F"]);
		
	var position = request.getParameter('position');
	var form = nlapiCreateForm('DJ_�ڋq�����̏��ލđ��M���', false);
	form.setScript('customscript_djkk_cs_cust_sendmail_again');
		
 	 //��ʍ��ڒǉ�
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '�߂�','searchReturn()')		 
		 form.addSubmitButton('CSV�o��');
		 form.addFieldGroup('select_group_after', '����');

		 var clubField = form.addField('custpage_club', 'text', '���/subsidiary',null, 'select_group_after');//���
		 clubField.setDefaultValue(clubValue);
		 var customerPoField = form.addField('custpage_customerpo', 'text', '�ڋq�����ԍ�/Customer PO No',null, 'select_group_after');
		 customerPoField.setDefaultValue(customerPo);
		 //select line2
		 var sectionField = form.addField('custpage_section', 'text', '�Z�N�V����',null, 'select_group_after');//�Z�N�V����
		 sectionField.setDefaultValue(section);
		 var customerCodeField = form.addField('custpage_customer', 'text', '�ڋq�i������j�R�[�h/Customer Code',null, 'select_group_after');
		 customerCodeField.setDefaultValue(customer);
		 //select line3
		 var typeField = form.addField('custpage_type', 'text', '���ރ^�C�v/Document Type',null, 'select_group_after');
		 typeField.setDefaultValue(type);
//		 var customerNameField = form.addField('custpage_customername', 'select', '�ڋq�i������j���O/Customer Name',null, 'select_group_after');
//		 customerNameField.setDefaultValue('testData');
		 //select line4
		 var issueDateFormField = form.addField('custpage_issuedate_form', 'date', '�쐬��/Issue Date Form',null, 'select_group_after');
		 issueDateFormField.setDefaultValue(issuedateForm);
		 var deliveryCodeField = form.addField('custpage_delivery', 'text', '�[�i��R�[�h/ShipTo Code',null, 'select_group_after');
		 deliveryCodeField.setDefaultValue(delivery);
		 //select line5
		 var issueDateToField = form.addField('custpage_issuedate_to', 'date', '�쐬��/Issue Date to',null, 'select_group_after');
		 issueDateToField.setDefaultValue(issuedateTo);
//		 var deliveryNameField = form.addField('custpage_deliveryname', 'select', '�[�i�於�O/ShipTo Name',null, 'select_group_after');
//		 deliveryNameField.setDefaultValue('testData');
		 //select line6
		 var documentNoField = form.addField('custpage_documentno', 'text', '���ޔԍ����ޔԍ�/Document No',null, 'select_group_after');
		 documentNoField.setDefaultValue(documentNo);
		 var trannumberField = form.addField('custpage_trannumber', 'longtext', '�󒍔ԍ�/SO',null, 'select_group_after'); 
		 trannumberField.setDefaultValue(trannumber);
		 
		 //select line7
		 var shipByDateFormField = form.addField('custpage_shipbydate_form', 'date', '�o�ד�From',null, 'select_group_after');
		 shipByDateFormField.setDefaultValue(trannumber);
		 //select line8
		 var shipByDateToField = form.addField('custpage_shipbydate_to', 'date', '�o�ד�To',null, 'select_group_after');
		 shipByDateToField.setDefaultValue(shipbydateTo);
		 //select line9
		 var deliveryDateFormField = form.addField('custpage_deliverydate_form', 'date', '�[�i��From',null, 'select_group_after');
		 deliveryDateFormField.setDefaultValue(deliverydateForm);
		 //select line10
		 var deliveryDateToField = form.addField('custpage_deliverydate_to', 'date', '�[�i��To',null, 'select_group_after');
		 deliveryDateToField.setDefaultValue(deliverydateTo);
		 
	 }else{
		 nlapiLogExecution('debug','form', 'in')
		 form.addButton('btn_search', '����', 'search()')
		 form.addButton('btn_clear', '�N���A', 'clearf()')
		 form.addFieldGroup('select_line1', '����')
		 form.addFieldGroup('select_line2', '����').setShowBorder(false);
		 form.addFieldGroup('select_line3', '����').setShowBorder(false);
		 form.addFieldGroup('select_line4', '����').setShowBorder(false);
		 form.addFieldGroup('select_line5', '����').setShowBorder(false);
		 form.addFieldGroup('select_line6', '����').setShowBorder(false);
		 form.addFieldGroup('select_line7', '����').setShowBorder(false);
		 form.addFieldGroup('select_line8', '����').setShowBorder(false);
		 form.addFieldGroup('select_line9', '����').setShowBorder(false);
		 form.addFieldGroup('select_line10', '����').setShowBorder(false);
		 //select line1
		 var clubField = form.addField('custpage_club', 'select', '���/subsidiary',null, 'select_line1');//���
		 clubField.setMandatory(true);
		 var customerPoField = form.addField('custpage_customerpo', 'select', '�ڋq�����ԍ�/Customer PO No',null, 'select_line1');
		 //select line2
		 var sectionField = form.addField('custpage_section', 'select', '�Z�N�V����',null, 'select_line2');//�Z�N�V����
		 var customerCodeField = form.addField('custpage_customer', 'select', '�ڋq�i������j�R�[�h/Customer Code',null, 'select_line2');
		 //select line3
		 var typeField = form.addField('custpage_type', 'select', '���ރ^�C�v/Document Type',null, 'select_line3');
//		 var customerNameField = form.addField('custpage_customername', 'select', '�ڋq�i������j���O/Customer Name',null, 'select_line3');
		 //select line4
		 var issueDateFormField = form.addField('custpage_issuedate_form', 'date', '�쐬��/Issue Date Form',null, 'select_line4');
		 var deliveryCodeField = form.addField('custpage_delivery', 'select', '�[�i��R�[�h/ShipTo Code',null, 'select_line4');
		 //select line5
		 var issueDateToField = form.addField('custpage_issuedate_to', 'date', '�쐬��/Issue Date to',null, 'select_line5');
//		 var deliveryNameField = form.addField('custpage_deliveryname', 'select', '�[�i�於�O/ShipTo Name',null, 'select_line5');
		 //select line6
		 var documentNoField = form.addField('custpage_documentno', 'select', '���ޔԍ����ޔԍ�/Document No',null, 'select_line6');
		 var trannumberField = form.addField('custpage_trannumber', 'multiselect', '�󒍔ԍ�/SO',null, 'select_line6'); 
		 //select line7
		 var shipByDateFormField = form.addField('custpage_shipbydate_form', 'date', '�o�ד�From',null, 'select_line7');
		 //select line8
		 var shipByDateToField = form.addField('custpage_shipbydate_to', 'date', '�o�ד�To',null, 'select_line8');
		 //select line9
		 var deliveryDateFormField = form.addField('custpage_deliverydate_form', 'date', '�[�i��From',null, 'select_line9');
		 //select line10
		 var deliveryDateToField = form.addField('custpage_deliverydate_to', 'date', '�[�i��To',null, 'select_line10');
		 
		 
		 var selectSub=getRoleSubsidiariesAndAddSelectOption(clubField);
		 if(isEmpty(clubValue)){
			 clubValue = selectSub;
		 }
		 
		 if(!isEmpty(clubValue)){
			 //�[�i��
			 var deliveryList = getSearchResults("customrecord_djkk_delivery_destination",null,
						[
						   ["custrecord_djkk_delivery_subsidiary","anyof",clubValue] //itemid
						], 
						[
						   new nlobjSearchColumn("custrecord_djkk_delivery_code"), //code
						   new nlobjSearchColumn("custrecorddjkk_name"), //name
						   new nlobjSearchColumn("internalid")
						]
						);
			 deliveryCodeField.addSelectOption('', '');
			 if(!isEmpty(deliveryList)){
				 for(var des=0;des<deliveryList.length;des++){
					 deliveryCodeField.addSelectOption(deliveryList[des].getValue("internalid"),deliveryList[des].getValue("custrecord_djkk_delivery_code")+' '+deliveryList[des].getValue("custrecorddjkk_name"));
				 }
			 }
			 var customerSearch = getSearchResults("customer",null,
						[
						   ["subsidiary","anyof",clubValue] //itemid
						], 
						[	
						 	new nlobjSearchColumn("entityid"),//�ڋqcode
						 	new nlobjSearchColumn("companyname"),//���O
						 	new nlobjSearchColumn("internalid")
						]
						);
			 customerCodeField.addSelectOption('', '');
			 if(!isEmpty(customerSearch)){
				 for(var cus=0;cus<customerSearch.length;cus++){
					 customerCodeField.addSelectOption(customerSearch[cus].getValue("internalid"),customerSearch[cus].getValue("entityid")+' '+customerSearch[cus].getValue("companyname"));
				 }
			 }
			 
			 //�Z�N�V����
			 var departmentSearch = getSearchResults("department",null,
					 [
					  	["subsidiary","anyof",clubValue] //itemid
					 ], 
					 [
					    new nlobjSearchColumn("name").setSort(false), 
					    new nlobjSearchColumn("internalid")
					 ]
					 );
			 sectionField.addSelectOption('', '');
			 if(!isEmpty(departmentSearch)){
				 for(var a=0;a<departmentSearch.length;a++){
					 sectionField.addSelectOption(departmentSearch[a].getValue("internalid"),departmentSearch[a].getValue("name"));
				 }
			 }
			 
		 }
		 
		//���ރ^�C�v
		 typeField.addSelectOption('SOA', '�[����');
		 typeField.addSelectOption('DO', '�[�i��');
		 typeField.addSelectOption('Invoice', '������');
		 typeField.addSelectOption('ConsolidatedInvoice', '���v������');
		 
		 
		 var salesorderSearch = getSearchResults("salesorder",null,
				 [
				   ["itemtype","is","InvtPart"],
				   "AND",
				   ["subsidiary","is",clubValue],//add by zhou 20230213
				   "AND",
				   ["status","anyof","SalesOrd:B","SalesOrd:E","SalesOrd:D"]//add by zhou 20230213
				   
				 ], 
				 [
				    new nlobjSearchColumn("internalid"),
				    new nlobjSearchColumn("tranid")//
				 ]
				 );
		 		trannumberField.addSelectOption('', '');
				var tranidArr = [];
				var internalidArr = [];
				for(var i = 0; i<salesorderSearch.length;i++){

				var tranid = salesorderSearch[i].getValue("tranid");
				var internalid = salesorderSearch[i].getValue("internalid");
				tranidArr.push(tranid);
				internalidArr.push(internalid);
				}

				var newTranidArr = unique1(tranidArr);
				var newInternalidArr = unique1(internalidArr);
				for(var i = 0; i<newTranidArr.length;i++){
					trannumberField.addSelectOption(newInternalidArr[i],newTranidArr[i])
				}
		 
				
				
				 clubField.setDefaultValue(clubValue)//���
				 customerPoField.setDefaultValue(customerPo)//�ڋq�����ԍ�
				 sectionField.setDefaultValue(section)//�Z�N�V����
				 customerCodeField.setDefaultValue(customer)//�ڋq�i������j�R�[�h
				 typeField.setDefaultValue(type)//���ރ^�C�v
				 issueDateFormField.setDefaultValue(issuedateForm)//�쐬��
				 deliveryCodeField.setDefaultValue(delivery)//�[�i��R�[�h
				 issueDateToField.setDefaultValue(issuedateTo)//�쐬��
				 documentNoField.setDefaultValue(documentNo)//���ޔԍ����ޔԍ�
				 trannumberField.setDefaultValue(numberArr)//�󒍔ԍ�
				 shipByDateFormField.setDefaultValue(shipbydateForm)//�o�ד�From
				 shipByDateToField.setDefaultValue(shipbydateTo)//�o�ד�To
				 deliveryDateFormField.setDefaultValue(deliverydateForm)//�[�i��From
				 deliveryDateToField.setDefaultValue(deliverydateTo)// �[�i��To
	 }

	 // ���ו\��
	 if(selectFlg == 'T'){
		 nlapiLogExecution('debug','���ו\��', 'in')
	 	var subList = form.addSubList('list', 'list', '');
		subList.addMarkAllButtons();
		subList.addField('chk', 'checkbox', '�I��')
		subList.addField('custpage_section', 'text', 'Activity/�Z�N�V����');
		subList.addField('custpage_trannumber', 'text', 'SO#/�󒍔ԍ�');
		subList.addField('custpage_customercode', 'text', 'Customer Code/�ڋq�i������j�R�[�h');
		subList.addField('custpage_customerpo', 'text', 'Customer PO No/�ڋq�����ԍ�');
		subList.addField('custpage_customername', 'text', 'Customer Name/�ڋq�i������j���O');
		subList.addField('custpage_deliverycode', 'text', 'ShipTo Code/�[�i��R�[�h');
		subList.addField('custpage_deliveryname', 'text', 'ShipTo Name/�[�i�於�O');
		subList.addField('custpage_invoiceno', 'text', 'Invoice#/�������ԍ�');
		subList.addField('custpage_shipbydate', 'text', 'ShipBy Date/�o�ד�');
		subList.addField('custpage_deliverydate', 'text', 'NeedBy Date/�[�i��');
		subList.addField('custpage_entryperson', 'text', 'Entry Person/���͎�');
		subList.addField('custpage_type', 'checkbox', 'Document Type/���ރ^�C�v');
		subList.addField('custpage_documentno', 'text', 'Document No/���ޔԍ�');
		/****TODO***/
		subList.addField('custpage_issuedate', 'text', 'Issue Date/�쐬���i�͈́j');//???
		subList.addField('custpage_lastaction', 'text', 'Last Action/�Ō�̎��{��');
		subList.addField('custpage_actiontype', 'text', 'Action Type/���M�敪');
		subList.addField('custpage_email', 'text', 'Email');
		subList.addField('custpage_fax', 'text', 'Fax');
		subList.addField('custpage_overflag', 'checkbox', 'Completed�iFlag�j/����').setDisplayType('disabled'); //�q��;
		subList.addField('custpage_error', 'text', 'Errors/�G���[');
		if(type == 'SOA'){
			//�[����
			var searchresults = getSearchResults("salesorder",null,
					 [
					 	   filit
					 ], 
					 [
						   new nlobjSearchColumn("internalid"), //����ID
						   new nlobjSearchColumn("department"), //Activity/�Z�N�V����
						   new nlobjSearchColumn("tranid"), //SO#/�󒍔ԍ�
						   new nlobjSearchColumn("custcol_djkk_customer_order_number"), //Customer PO No/�ڋq�����ԍ�
						   new nlobjSearchColumn("entityid","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Code/�ڋq�i������j�R�[�h
						   new nlobjSearchColumn("altname","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Name/�ڋq�i������j���O	
						   new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Code/�[�i��R�[�h
						   new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Name/�[�i�於�O	
						   new nlobjSearchColumn("invoicenum"), //Invoice#/�������ԍ�
						   new nlobjSearchColumn("shipdate"), //ShipBy Date/�o�ד�
						   new nlobjSearchColumn("custbody_djkk_delivery_date"), //NeedBy Date/�[�i��
						   new nlobjSearchColumn("custbody_djkk_input_person"), //Entry Person/���͎�	
						   //Document Type/���ރ^�C�v
						   //Document No/���ޔԍ�
						   new nlobjSearchColumn("trandate"), //Issue Date/�쐬���i�͈́j
						   //Last Action/�Ō�̎��{��	
						   new nlobjSearchColumn("custbody_djkk_shippinginfosendtyp")//Action Type/���M�敪�iFAX/Email�j	
						   //Email�ɂđ��M�̏ꍇ�A���M���e-mail�A�h���X
						   //Fax�ɂđ��M�̏ꍇ�A���M���Fax�ԍ�
						   //Completed�iFlag�j/�đ��M�����i�t���O
						   //���M����Ă��Ȃ��ꍇ�͕\��
					 ]
					 );
			if(searchresults !=null){
				for(var i = 0 ; i < searchresults.length; i++){
			 		
			 	}
			}
					 	
		}else if(type == 'DO'){
			//�[�i��
			var searchresults = getSearchResults("salesorder",null,
					 [
					 	   filit
					 ], 
					 [
						   new nlobjSearchColumn("internalid"), //����ID
						   new nlobjSearchColumn("department"), //Activity/�Z�N�V����
						   new nlobjSearchColumn("tranid"), //SO#/�󒍔ԍ�
						   new nlobjSearchColumn("custcol_djkk_customer_order_number"), //Customer PO No/�ڋq�����ԍ�
						   new nlobjSearchColumn("entityid","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Code/�ڋq�i������j�R�[�h
						   new nlobjSearchColumn("altname","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Name/�ڋq�i������j���O	
						   new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Code/�[�i��R�[�h
						   new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Name/�[�i�於�O	
						   new nlobjSearchColumn("invoicenum"), //Invoice#/�������ԍ�
						   new nlobjSearchColumn("shipdate"), //ShipBy Date/�o�ד�
						   new nlobjSearchColumn("custbody_djkk_delivery_date"), //NeedBy Date/�[�i��
						   new nlobjSearchColumn("custbody_djkk_input_person"), //Entry Person/���͎�	
						   //Document Type/���ރ^�C�v
						   //Document No/���ޔԍ�
						   new nlobjSearchColumn("trandate"), //Issue Date/�쐬���i�͈́j
						   //Last Action/�Ō�̎��{��	
						   new nlobjSearchColumn("custbody_djkk_delivery_book_period")//Action Type/���M�敪�iFAX/Email�j	
						   //Email�ɂđ��M�̏ꍇ�A���M���e-mail�A�h���X
						   //Fax�ɂđ��M�̏ꍇ�A���M���Fax�ԍ�
						   //Completed�iFlag�j/�đ��M�����i�t���O
						   //���M����Ă��Ȃ��ꍇ�͕\��
					 ]
					 );
			if(searchresults !=null){
				for(var i = 0 ; i < searchresults.length; i++){
			 		
			 	}
			}
		}else if(type == 'Invoice') {
			//������
			var searchresults = getSearchResults("transaction",null,
//					   ["type","anyof","CustCred","CustInvc"],
					 [
					 	   filit
					 ], 
					 [
						   new nlobjSearchColumn("internalid"), //����ID
						   new nlobjSearchColumn("department"), //Activity/�Z�N�V����
						   new nlobjSearchColumn("tranid"), //SO#/�󒍔ԍ�
						   new nlobjSearchColumn("custcol_djkk_customer_order_number"), //Customer PO No/�ڋq�����ԍ�
						   new nlobjSearchColumn("entityid","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Code/�ڋq�i������j�R�[�h
						   new nlobjSearchColumn("altname","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Name/�ڋq�i������j���O	
						   new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Code/�[�i��R�[�h
						   new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Name/�[�i�於�O	
						   new nlobjSearchColumn("invoicenum"), //Invoice#/�������ԍ�
						   new nlobjSearchColumn("shipdate"), //ShipBy Date/�o�ד�
						   new nlobjSearchColumn("custbody_djkk_delivery_date"), //NeedBy Date/�[�i��
						   new nlobjSearchColumn("custbody_djkk_input_person"), //Entry Person/���͎�	
						   //Document Type/���ރ^�C�v
						   //Document No/���ޔԍ�
						   new nlobjSearchColumn("trandate"), //Issue Date/�쐬���i�͈́j
						   //Last Action/�Ō�̎��{��	
						   new nlobjSearchColumn("custbody_djkk_invoice_book_period")//Action Type/���M�敪�iFAX/Email�j	
						   //Email�ɂđ��M�̏ꍇ�A���M���e-mail�A�h���X
						   //Fax�ɂđ��M�̏ꍇ�A���M���Fax�ԍ�
						   //Completed�iFlag�j/�đ��M�����i�t���O
						   //���M����Ă��Ȃ��ꍇ�͕\��
					 ]
					 );
			if(searchresults !=null){
				for(var i = 0 ; i < searchresults.length; i++){
			 		
			 	}
			}
		}else if(type == 'ConsolidatedInvoice') {
			//���v������
			
		}
	 }
	 
	 
	
	 
	response.writePage(form);
}
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function defaultEmpty(src){
	return src || '';
}
function defaultEmptyToZero(src){
	return src || 0;
}
function formatDate(dt){    //���ݓ���
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
}
function formatDateTime(dt){    //���ݓ���
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2) + ' ' + PrefixZero(dt.getHours(), 2) + ":" + PrefixZero(dt.getMinutes(), 2)) : '';
}
function unique1(arr){
	  var hash=[];
	  for (var i = 0; i < arr.length; i++) {
	     if(hash.indexOf(arr[i])==-1){
	      hash.push(arr[i]);
	     }
	  }
	  return hash;
}