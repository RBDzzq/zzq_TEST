/**
 * DJ_���ב��M�\��
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

var IN_STOCK_SEND_FILE_ID = "";
var SEARCH_SUBSIDIARY = "";
var SEARCH_LOCATION = "";
var SEARCH_VTT = "";
var SEARCH_Form = "";
var SEARCH_theCount ="";
var PAGE_STATUS = 0;
function suitelet(request, response){	
	
	if (request.getMethod() == 'POST') {
			var sendEmail_ = request.getParameter('send_email');
			nlapiLogExecution('DEBUG', 'show me the information for sendEmail_', sendEmail_)
			if(!isEmpty(sendEmail_)){
				sendEmail(request, response);
			} else {
				run(request, response);
			}	
		
		
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response)
		}else{
			createForm(request, response);
		}
	}
	
}

function sendEmail(request, response){
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	var jobId = request.getParameter('job_id');
	var jobParam ={
		type:'sendEmail',
		jobId:jobId
	}
	scheduleparams['custscript_djkk_ss_in_stock_send_param5'] = JSON.stringify(jobParam);
	runBatch('customscript_djkk_ss_in_stock_send', 'customdeploy_djkk_ss_in_stock_send',scheduleparams);
	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	parameter['custparam_logform_sendemail'] = '1';
	parameter['jobId'] = jobParam.jobId;
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

function run(request, response,locationValue,subsidiaryValue){
	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	var str = '';
	var str2 = '';
	var str3 = '';
	var strCsv = '';
	var xmlString = '';
	var theCount = parseInt(request.getLineItemCount('list'));
	nlapiLogExecution('DEBUG', 'show me the information for theCount', theCount);
	var valueTotal = [];
	for(var i = 0 ; i < theCount ; i++){
				
		if(request.getLineItemValue('list', 'chk', i+1)=='T'){
			var po_id = request.getLineItemValue('list', 'po_id', i+1);		
			var expectedreceiptdate = defaultEmpty(request.getLineItemValue('list', 'expectedreceiptdate', i+1));	
			var po_no = defaultEmpty(request.getLineItemValue('list', 'po_no', i+1));	
			var type = defaultEmpty(request.getLineItemValue('list', 'type', i+1));		
			var po_line_no = defaultEmpty(request.getLineItemValue('list', 'po_line_no', i+1));	
			var item = defaultEmpty(request.getLineItemValue('list', 'item', i+1));
			var item_id = defaultEmpty(request.getLineItemValue('list', 'item_id', i+1));		
			var count_uom = defaultEmpty(request.getLineItemValue('list', 'count_uom', i+1));	
			var memo = defaultEmpty(request.getLineItemValue('list', 'memo', i+1));
			var commodity_name = defaultEmpty(request.getLineItemValue('list', 'commodity_name', i+1));		
			var lot_number = defaultEmpty(request.getLineItemValue('list', 'lot_number', i+1));	
			var poisonous_drama = defaultEmpty(request.getLineItemValue('list', 'poisonous_drama', i+1));
			var expiration_date = defaultEmpty(request.getLineItemValue('list', 'expiration_date', i+1));
			var temperature_zone_classification = defaultEmpty(request.getLineItemValue('list', 'temperature_zone_classification', i+1));		
			var radioactivity = defaultEmpty(request.getLineItemValue('list', 'radioactivity', i+1));	
			var trading_commodity = defaultEmpty(request.getLineItemValue('list', 'trading_commodity', i+1));
			var expected_number = defaultEmpty(request.getLineItemValue('list', 'expected_number', i+1));
			
			valueTotal.push({
				//These are old fields
				po_id:po_id,
				expectedreceiptdate:expectedreceiptdate,//���ɗ\���
				po_no:po_no,//�g�����U�N�V�����ԍ�
				type:type,//���
				po_line_no:po_line_no,//�g�����U�N�V�������s�ԍ�
				item:item,//���i�R�[�h
				item_id:item_id,//���i�R�[�h
				count_uom:count_uom,//���ʁ�UOM�i�݌ɒP�ʁj
				memo:memo,//���l
				//These are new fields
				commodity_name:commodity_name,//���i��
				lot_number:lot_number,//���b�g�ԍ�
				poisonous_drama:poisonous_drama,//�Ō����敪
				expiration_date:expiration_date,//�L������
				temperature_zone_classification:temperature_zone_classification,//���x�ы敪
				radioactivity:radioactivity,//���ː��L���敪
				trading_commodity_code:trading_commodity,//����揤�i�R�[�h
				expected_number:expected_number//���ח\�萔
			});
//			strCsv+=item_id+","+item_name+","+item_memo+","+inv_no_id+","+inv_no+","+location_id+","+location+","+binnumber_id+","+binnumber+","+vo_or_cu_id+","+vo_or_cu+","+count+","+count_real;
//			 strCsv+="\r\n"
			// xmlString += '�A�C�e��ID,�A�C�e����,�A�C�e������,�Ǘ��ԍ��i�V���A��/���b�g�ԍ��jID,�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j,�ꏊID,�ꏊ,�a����݌�-����ID,�a����݌�ID,�ڋqID,�ڋq,�݌ɐ���,���n����\r\n'+strCsv;
			strCsv += expectedreceiptdate+','+po_no+','+type+','+po_line_no+','+item+','+count_uom+','+commodity_name+','+lot_number+','+poisonous_drama+','+memo+','+expiration_date+','+temperature_zone_classification+','+radioactivity+','+trading_commodity+','+expected_number;
			 strCsv+="\r\n"
		}
		nlapiLogExecution('debug', 'show me the information for strCsv',strCsv);
		str2+=request.getLineItemValue('list', 'type', i+1)+'_';
		str2+=request.getLineItemValue('list', 'po_id', i+1)+'_';
		str2+=request.getLineItemValue('list', 'po_line_no', i+1)+'_';
		str2+=request.getLineItemValue('list', 'item', i+1)+'_';
		str2+=',';
	}
	
	
	str = request.getParameter('custpage_file')+','+nlapiGetUser()+','+request.getParameter('custpage_location');
	scheduleparams['custscript_djkk_ss_in_stock_send_param'] = str;	
	scheduleparams['custscript_djkk_ss_in_stock_send_param2'] = str2;


	var locationValue = request.getParameter('custpage_location');
	nlapiLogExecution('DEBUG', 'show me the information for locationValue2', locationValue)
	var subsidiaryValue = request.getParameter('custpage_subsidiary');
	nlapiLogExecution('DEBUG', 'show me the information for locationValue2', subsidiaryValue)
	var subsidiaryRecord = nlapiLoadRecord('subsidiary', subsidiaryValue);
	var locationRecord = nlapiLoadRecord('location', locationValue);
	var locationName = defaultEmpty(locationRecord.getFieldValue('name'));
	var subsidiaryName = defaultEmpty(subsidiaryRecord.getFieldValue('name'));
	
	var pdfData = {
			valueTotal: valueTotal,
			locationName: locationName,
			subsidiaryName: subsidiaryName
	}
	var jobParam ={
		type:'savePDF',
		jobId:guid()
	}
	var emailParam ={
		type:'sendEmail',
	}
	
	scheduleparams['custscript_djkk_ss_in_stock_send_param3'] = JSON.stringify(pdfData);
//	xmlString += '���ɗ\���,\r\n'+strCsv;
	xmlString += '���ɗ\���,�g�����U�N�V�����ԍ�,���,�g�����U�N�V�����s�ԍ�,���i�R�[�h,���ʁ�UOM�i�݌ɒP�ʁj,���i��,���b�g�ԍ�,�Ō����敪,���l,�L������,���x�ы敪,���ː��L���敪,����揤�i�R�[�h,���ח\�萔\r\n'+strCsv;
	scheduleparams['custscript_djkk_ss_in_stock_send_param4'] = xmlString;
	
	scheduleparams['custscript_djkk_ss_in_stock_send_param5'] = JSON.stringify(jobParam);
	scheduleparams['custscript_djkk_ss_in_stock_send_param6'] = JSON.stringify(emailParam);
	runBatch('customscript_djkk_ss_in_stock_send', 'customdeploy_djkk_ss_in_stock_send',scheduleparams);
	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	parameter['jobId'] = jobParam.jobId;
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}
function logForm(request, response) {
	PAGE_STATUS = 0;
	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_djkk_cs_in_stock_send');
	
	var jobId = request.getParameter('jobId');
	
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_in_stock_send');

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
		var sendEmailLog = request.getParameter('custparam_logform_sendemail');
		if(sendEmailLog){
			createForm(request, response);
		}else{
			// ���s�����̏ꍇ
			var runstatusField = form.addField('custpage_run_info_status', 'text',
					'', null, 'custpage_run_info');
			runstatusField.setDisplayType('inline');
			runstatusField.setDefaultValue('�o�b�`����������');
			
			var jobSearch = nlapiSearchRecord("customrecord_djkk_in_stock_send_job",null,
					[
//					   ["custrecord_job","isnotempty","jobID"]
					   ["custrecord_job","is",jobId]
					], 
					[ 
					   new nlobjSearchColumn("custrecord_job"), 
					   new nlobjSearchColumn("custrecord_detail"), 
					   new nlobjSearchColumn("custrecord_pdf_fileid"), 
					   new nlobjSearchColumn("custrecord_csv_fileid")
					]
					);
			nlapiLogExecution('DEBUG', 'show me the jobSearch', jobSearch);
			
			//11.7�t���O�X�V�ꏊ���ړ�start
			var str_poDataMain = jobSearch[0].getValue("custrecord_detail");			
			var poDataMain = JSON.parse(str_poDataMain);
			var pdfData = poDataMain.pdfData;
			var valueTotal = pdfData.valueTotal;
			var strArr = poDataMain.strArr;
			nlapiLogExecution('DEBUG', 'show me the strArr', strArr);
			
			for (var i = 0 ;i <valueTotal.length;i++){
				var poid= valueTotal[i].po_id;		
				var poLineNo = valueTotal[i].po_line_no;
				try{
					var poRecord = nlapiLoadRecord('purchaseorder', poid);
					poRecord.setLineItemValue('item','custcol_djkk_in_sotck_send_indicate',poLineNo,'T');
					nlapiSubmitRecord(poRecord);
				}catch(e){
					nlapiLogExecution('DEBUG', '�t���O�X�V', e.message);
				}	
			}
			//end
			
			
			
			
			
			 var pdf_fileid = parseInt(jobSearch[0].getValue("custrecord_pdf_fileid"));
			 var csv_fileid = parseInt(jobSearch[0].getValue("custrecord_csv_fileid"));
				nlapiLogExecution('DEBUG', 'show me the pdf_fileid', pdf_fileid);
			 var pdf_fileid_id = nlapiLoadFile(pdf_fileid);
			 var pdf_fileid_url= pdf_fileid_id.getURL();
			 var csv_fileid_id = nlapiLoadFile(csv_fileid);
			 var csv_fileid_url= csv_fileid_id.getURL();
			
			 var csvDownUrl = "window.open('" + csv_fileid_url + "', '_blank');"; 
			 var pdfDownUrl = "window.open('" + pdf_fileid_url + "', '_blank');"; 

			 form.addButton('btn_createPdf', 'PDF�v���r���[',pdfDownUrl);
			 form.addButton('btn_createCsv', 'CSV�_�E�����[�h',csvDownUrl);
			 form.addSubmitButton('���M');
			 var sendEmailField = form.addField('send_email', 'text',
						'', null, 'custpage_run_info');
			 sendEmailField.setDisplayType('hidden');
			 sendEmailField.setDefaultValue('Y');
			 var jobIdField = form.addField('job_id', 'text',
						'', null, 'custpage_run_info');
			 jobIdField.setDisplayType('hidden');
			 jobIdField.setDefaultValue(jobId);
			 response.writePage(form);
		}
	
	}
	
}

function createForm(request, response){
//	PAGE_STATUS = 1;
	var selectFlg = request.getParameter('selectFlg');
	var activityValue = request.getParameter('activity');
	var createdbyValue = request.getParameter('createdby');
	var vendorValue = request.getParameter('vendor');
	var poValue = request.getParameter('po');
	var itemValue = request.getParameter('item');
	var itemEnValue = request.getParameter('item_en');
	var itemJpValue = request.getParameter('item_jp');
	var locationValue = request.getParameter('location');
	var lotValue = request.getParameter('lot');
	var inStockValue = request.getParameter('in_stock');
	var subsidiaryValue = request.getParameter('subsidiary');
	var purchaseorderValue= request.getParameter('purchaseorder');
	var purchaseValue= request.getParameter('purchase');
	var entrydateValue = request.getParameter('entrydate');
	var entrydateEndValue = request.getParameter('entrydateEnd');
	var instructionsValue = request.getParameter('instructions');
	 
	
	var form = nlapiCreateForm('DJ_���ח\�胊�X�g', false);
	form.setScript('customscript_djkk_cs_in_stock_send');
	SEARCH_Form = form;
		
//	 //��ʍ��ڒǉ�
	 if(selectFlg == 'T'){
//		 form.addButton('btn_pdf', 'PDF�_�E�����[�h','pdf()').setDisplayType('hidden');
		 form.addButton('btn_return', '�����߂�','searchReturn()')		 
		 form.addSubmitButton('PDF����');
	 }else{
		 form.addButton('btn_search', '����', 'search()')
	 }
	  

	 form.addFieldGroup('select_group', '����');
	 var subsidiaryField = form.addField('custpage_subsidiary', 'select', '�A��',null, 'select_group');
	 subsidiaryField.setMandatory(true);
	 var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	 if(isEmpty(subsidiaryValue)){
		 subsidiaryValue = selectSub;
	 }
	 var subsidiaryId = nlapiGetFieldValue("custpage_subsidiary");

	 // U381 start  by song 
	 if(subsidiaryValue == SUB_SCETI || subsidiaryValue == SUB_DPKK){
		 var purchaseField = form.addField('custpage_purchase', 'select', 'DJ_�d����',null, 'select_group');
		 var entrydateField = form.addField('custpage_entrydate', 'date', 'DJ_���ɗ\����t�J�n��',null, 'select_group');
		 var instructionsFlg = form.addField('custpage_instructions', 'checkbox', '���Ɉē����M�ς݁E���ח\�胊�X�g�쐬�ς�', 'null', 'select_group');//DJ_���ח\��w����
		 var entrydateEndField = form.addField('custpage_entrydateend', 'date', 'DJ_���ɗ\����t�I����',null, 'select_group');
		 
		 
	 
	//�d����ݒ肷��
		 var searchPo = getSearchResults('vendor',null,
					["subsidiary","anyof",subsidiaryValue], 
					[
					   new nlobjSearchColumn("companyname"), 
					   new nlobjSearchColumn("internalid")
					]
					);
			
		 
		 purchaseField.addSelectOption('', '');
			for(var i = 0; i<searchPo.length;i++){
				purchaseField.addSelectOption(searchPo[i].getValue("internalid"),searchPo[i].getValue('companyname'));
			}
	 }
	 //end
	 var activityField = form.addField('custpage_activity', 'select', '�A�N�e�B�r�e�B','customlist_djkk_activity', 'select_group').setDisplayType('hidden');
	 var createdbyField = form.addField('custpage_createdby', 'select', '�쐬��','employee', 'select_group').setDisplayType('hidden');
	 var vendorField = form.addField('custpage_vendor', 'select', '�d����R�[�h�E��','vendor', 'select_group').setDisplayType('hidden');
	 var locationField = form.addField('custpage_location', 'select', '�q��',null, 'select_group');
	 locationField.setMandatory(true);

	 var itemField = form.addField('custpage_item', 'select', '���i�R�[�h',null, 'select_group');
	 var itemEnField = form.addField('custpage_item_en', 'text', '���i���E�p��','', 'select_group').setDisplayType('hidden');
	 var itemJpField = form.addField('custpage_item_jp', 'text', '���i���E���{��','', 'select_group').setDisplayType('hidden');
	 var poField = form.addField('custpage_po', 'select', 'PO�ԍ�',null, 'select_group');
	// U381 start  by song 
	 var purchaseorderSearch = getSearchResults('purchaseorder',null,
				["subsidiary","anyof",subsidiaryValue], 
				[
				 new nlobjSearchColumn("internalid"),
				 new nlobjSearchColumn("tranid"), 	   
				]
				);
	 
	 	var tranidArr = new Array();
	 	var tranidInternaidArr = new Array();
		for(var i = 0; i<purchaseorderSearch.length;i++){
			var tranid = purchaseorderSearch[i].getValue("internalid");
			var tranidInternaid = purchaseorderSearch[i].getValue("tranid");
			tranidArr.push(tranid);
			tranidInternaidArr.push(tranidInternaid);
		}
		var newTranidArr = unique1(tranidArr);
		var newTranidInternaidArr = unique1(tranidInternaidArr);
			
	 	poField.addSelectOption('', '');
	 	for(var i = 0; i < newTranidInternaidArr.length; i++){
	 		poField.addSelectOption(newTranidArr[i],newTranidInternaidArr[i]);
		}
	 //end
	 var lotField = form.addField('custpage_lot', 'text', '�V�X�e�����b�g�ԍ�','', 'select_group').setDisplayType('hidden');
	 var inStockField = form.addField('custpage_in_stock', 'date', '���ɓ�','', 'select_group').setDisplayType('hidden');	 
	 var fileIdField = form.addField('custpage_file', 'text', 'PDF�t�@�C��ID','', 'select_group').setDisplayType('hidden');

	 //�A�C�e���ݒ肷��
		var searchItem = getSearchResults('item',null,
				["subsidiary","anyof",subsidiaryValue], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("itemid")
				]
				);
		
		itemField.addSelectOption('', '');
		for(var i = 0; i<searchItem.length;i++){
			itemField.addSelectOption(searchItem[i].getValue("internalid"),searchItem[i].getValue('itemid'));
		}
	 
	 
	//�I��q�ɂ�ݒ肷��
	 var filedLocationList = getSearchResults("location",null,
				[
				 "subsidiary","anyof",subsidiaryValue
				], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("name").setSort(false)
				]
				);
		
	 locationField.addSelectOption('', '');
		for(var i = 0; i<filedLocationList.length;i++){
			locationField.addSelectOption(filedLocationList[i].getValue("internalid"),filedLocationList[i].getValue("name"));
		}
	 	 
		if(selectFlg == 'T'){
			subsidiaryField.setDisplayType('inline');
			activityField.setDisplayType('hidden');
			createdbyField.setDisplayType('hidden');
			vendorField.setDisplayType('hidden');
			poField.setDisplayType('inline');
			itemField.setDisplayType('inline');
			itemEnField.setDisplayType('hidden');
			itemJpField.setDisplayType('hidden');
			locationField.setDisplayType('inline');
			lotField.setDisplayType('hidden');
			inStockField.setDisplayType('hidden');
			if(subsidiaryValue == SUB_SCETI || subsidiaryValue == SUB_DPKK){
				purchaseField.setDisplayType('inline');
				entrydateField.setDisplayType('inline');
				entrydateEndField.setDisplayType('inline');
				instructionsFlg.setDisplayType('inline');
			}
	
		}else{
			
		}
		
		subsidiaryField.setDefaultValue(subsidiaryValue);
		activityField.setDefaultValue(activityValue);
		createdbyField.setDefaultValue(createdbyValue);
		vendorField.setDefaultValue(vendorValue);
		poField.setDefaultValue(poValue);
		itemField.setDefaultValue(itemValue);
		itemEnField.setDefaultValue(itemEnValue);
		itemJpField.setDefaultValue(itemJpValue);
		locationField.setDefaultValue(locationValue);
		lotField.setDefaultValue(lotValue);
		inStockField.setDefaultValue(inStockValue);
		// U381 start  by song 
		if(subsidiaryValue == SUB_SCETI || subsidiaryValue == SUB_DPKK){
			 purchaseField.setDefaultValue(purchaseValue);
			 entrydateField.setDefaultValue(entrydateValue);
			 entrydateEndField.setDefaultValue(entrydateEndValue);   
			 instructionsFlg.setDefaultValue(instructionsValue);
		}

		if(!isEmpty(locationValue)){
			var locationRecord = nlapiLoadRecord('location', locationValue);
			var parent = locationRecord.getFieldValue('parent');
			var locationName = locationRecord.getFieldValue("name");
			if(isEmpty(parent)){				
				var LocationList = getSearchResults("location",null,
						[
						 	"name","contains",locationName
						], 
						[
						   new nlobjSearchColumn("internalid"), 
						]
						);
				var parentValueArr = new Array();
				for(var i = 0; i<LocationList.length;i++){
					var parentValue = LocationList[i].getValue("internalid");
					parentValueArr.push(parentValue);
				}
			}
		}
		// end
		
	 
	 
	 var subList = form.addSubList('list', 'list', '');
	 subList.addMarkAllButtons();
	 subList.addField('chk', 'checkbox', '�I��');
	 subList.addField('expectedreceiptdate', 'text', '���ɗ\���');
	 subList.addField('po_no', 'text', '�g�����U�N�V�����ԍ�');
	 subList.addField('type', 'text', '���');
	 subList.addField('po_id', 'text', 'POID').setDisplayType('hidden');
	 subList.addField('po_line_no', 'text', '�g�����U�N�V�����s�ԍ� ');
	 //changed by geng add srart CH099
	 subList.addField('po_line_location', 'text', '�q�� ');
	//changed by geng add end CH099
	 subList.addField('item_id', 'text', '���i����ID ').setDisplayType('hidden');
	 subList.addField('item', 'text', '���i�R�[�h ');
	 subList.addField('count_uom', 'text', '���ʁ�UOM�i�݌ɒP�ʁj ');
	 subList.addField('commodity_name', 'text', '���i��');
	 subList.addField('lot_number', 'text', '���b�g�ԍ�');
	 subList.addField('poisonous_drama', 'text', '�Ō����敪');
	 subList.addField('memo', 'text', '���l');
	 subList.addField('expiration_date', 'text', '�L������');
	 subList.addField('temperature_zone_classification', 'text', '���x�ы敪');
	 subList.addField('radioactivity', 'text', '���ː��L���敪');
	 subList.addField('trading_commodity_code', 'text', '����揤�i�R�[�h');
	 subList.addField('expected_number', 'text', '���ח\�萔');
	 subList.addField('inspection_residue', 'text', '���i�c��');
	 
	 subList.addField('conversionrate', 'text', '����� ').setDisplayType('hidden');
	 subList.addField('packcarton', 'text', '���ʁi�J�[�g�����j ').setDisplayType('hidden');

	 
	 if(selectFlg == 'T')		
	 {			
			var filit = new Array();
			if(instructionsValue == 'F'){
				filit.push(["custcol_djkk_in_sotck_send_indicate","is","F"]);
				filit.push("AND");
			}else{
				filit.push(["custcol_djkk_in_sotck_send_indicate","any",""]);
				filit.push("AND");
			}

			filit.push(["type","anyof","PurchOrd","RtnAuth"]);
			filit.push("AND");
			filit.push(["taxline","is","F"]);
			filit.push("AND");
			filit.push(["mainline","is","F"]);
			filit.push("AND");
			filit.push(["status","anyof","PurchOrd:B","PurchOrd:D","PurchOrd:E","RtnAuth:B","RtnAuth:D"]);
			filit.push("AND");//0418='InvtPart'
			filit.push(["itemType","is","InvtPart"]);
			filit.push("AND");
			filit.push(["inventorydetail.internalidnumber","isnotempty",""]);
			
			//U588Start
			if(subsidiaryValue == SUB_SCETI || subsidiaryValue == SUB_DPKK){
				filit.push("AND");
				filit.push(["custbody_djkk_sotck_send_flag","is","T"]);
			}
			//End

			if(!isEmpty(activityValue)){
				filit.push("AND");
				filit.push(["vendor.custentity_djkk_activity","anyof",activityValue]);
			}
			
			if(!isEmpty(createdbyValue)){
				filit.push("AND");
				filit.push(["createdby","anyof",createdbyValue]);
			}
			// U381 start  by song 
			if(subsidiaryValue == SUB_SCETI || subsidiaryValue == SUB_DPKK){
				if(!isEmpty(purchaseValue)){
					filit.push("AND");
					filit.push(["vendor.internalid","anyof",purchaseValue]);
				}
			}
			//end
			if(!isEmpty(poValue)){
				filit.push("AND");
				filit.push(["internalid","anyof",poValue]);
			}
			if(!isEmpty(itemValue)){
				filit.push("AND");
				filit.push(["item","anyof",itemValue]);
			}
			if(!isEmpty(itemEnValue)){
				filit.push("AND");
				filit.push(["item.custitem_djkk_product_name_line1","contains",itemEnValue]);
			}
			if(!isEmpty(itemJpValue)){
				filit.push("AND");
				filit.push(["item.custitem_djkk_product_name_jpline1","contains",itemJpValue]);
			}
			// U381 start  by song 
			if(isEmpty(parentValueArr)){
				if(!isEmpty(locationValue)){
					filit.push("AND");
					filit.push(["location","anyof",locationValue]);
				}
			}
			if(!isEmpty(parentValueArr)){
				filit.push("AND");
				filit.push(["location","anyof",parentValueArr]);
			}
			if(!isEmpty(lotValue)){
				filit.push("AND");
				filit.push(["serialnumber","contains",lotValue]);
			}
			if(subsidiaryValue == SUB_SCETI || subsidiaryValue == SUB_DPKK){
				if(!isEmpty(entrydateValue)){
					filit.push("AND");
					filit.push(["expectedreceiptdate","onorafter",entrydateValue]);
				}
			}
			if(subsidiaryValue == SUB_SCETI || subsidiaryValue == SUB_DPKK){
				if(!isEmpty(entrydateEndValue)){
					filit.push("AND");
					filit.push(["expectedreceiptdate","onorbefore",entrydateEndValue]);
				}
			}
			//end		
			var purchaseorderSearch = nlapiSearchRecord("transaction",null,
					[
					 filit
					], 
					[
					   new nlobjSearchColumn("custentity_djkk_activity","vendor",null), //�A�N�e�B�r�e�B
//					   new nlobjSearchColumn("altname","vendor",null), //�g�����U�N�V�����̎d����R�[�h�E��
					   new nlobjSearchColumn("expectedreceiptdate"), //���ɗ\���
					   new nlobjSearchColumn("custbody_djkk_ship_via"), //�z�����
					   new nlobjSearchColumn("transactionnumber","fulfillingTransaction",null), //Shipment�ԍ�
					   new nlobjSearchColumn("transactionnumber"), //PO�ԍ� 	�g�����U�N�V�����ԍ�
					   new nlobjSearchColumn("targetlocation"), //PO�^�[�Q�b�g�̏ꏊ
					   new nlobjSearchColumn("custbody_djkk_operation_instructions","fulfillingTransaction",null), //���i�E��Ǝw��
					   new nlobjSearchColumn("custbody_djkk_inspection_finished","fulfillingTransaction",null), //���i�I����]��
					   new nlobjSearchColumn("custbody_djkk_expected_shipping_date","fulfillingTransaction",null), //�o�ח\���
//					   new nlobjSearchColumn("memomain"), //���l
					   new nlobjSearchColumn("line"), //PO�s�ԍ�
					   new nlobjSearchColumn("item"), //���i�R�[�h
					   new nlobjSearchColumn("custitem_djkk_product_name_line1","item",null), //���i���E�p��
					   new nlobjSearchColumn("custitem_djkk_product_category_scetikk","item",null), //�ۊǉ��x
					   new nlobjSearchColumn("formulatext").setFormula("{expectedreceiptdate}"), //���ʁ�UOM�i�݌ɒP�ʁj
					   new nlobjSearchColumn("custcol_djkk_conversionrate"), //�����
					   new nlobjSearchColumn("packcarton","inventoryDetail",null), //���ʁi�J�[�g�����j
					   new nlobjSearchColumn("location"), //�q�ɔԍ������O
					   new nlobjSearchColumn("serialnumber"), //�V�X�e�����b�g�ԍ�
					   new nlobjSearchColumn("custitemnumber_djkk_maker_serial_number","itemNumber",null), //�������b�g�ԍ��A�V���A���ԍ�
					   new nlobjSearchColumn("expirationdate","inventoryDetail",null), //�L������
					   new nlobjSearchColumn("custcol_djkk_remars"), //���l
					   new nlobjSearchColumn("custitemnumber_djkk_smc_nmuber","itemNumber",null),//SMC�ԍ�
//					   new nlobjSearchColumn("quantity"),//����
					   new nlobjSearchColumn("unit"),//�݌ɒP��
					   new nlobjSearchColumn("internalid"),//POID hidden!!!
					   new nlobjSearchColumn("tranid"),//�g�����U�N�V�����ԍ�
					   new nlobjSearchColumn("type"),//���
					  
					   new nlobjSearchColumn("itemid","item",null), //���i�R�[�h 2
					   new nlobjSearchColumn("displayname","item",null), //���i���E���{��
//					   new nlobjSearchColumn("altname","vendor",null), //�g�����U�N�V�����̎d����R�[�h�E��
					   new nlobjSearchColumn("vendorname","item",null),//�g�����U�N�V�����̎d����R�[�h�E��?
					   new nlobjSearchColumn("custitem_djkk_pad_classification","item",null), //	�Ō����敪Y
					   new nlobjSearchColumn("custitem_djkk_radioactivity_classifi","item",null), //���ː��L���敪
					   new nlobjSearchColumn("custitem_djkk_shelf_life","item",null), //	�L������
					   new nlobjSearchColumn("custitem_djkk_shape_content","item",null), //�׎p�敪
					   new nlobjSearchColumn("custitem_djkk_physical_shape","item",null),//��ԃR�[�h
					   new nlobjSearchColumn("custitem_djkk_product_category_scetikk","item",null), //���x�ы敪
					   new nlobjSearchColumn("quantityuom"),//����
//					   new nlobjSearchColumn("custitem_djkk_storage_type","item",null), //���b�g�ԍ�
//					   new nlobjSearchColumn("inventorynumber","item",null), //���b�g�ԍ�
					]
			  );
		if(!isEmpty(purchaseorderSearch)){

			var valueTotal = [];
			var Po = [];
			var bodyLine = "";
			for(var i = 0 ; i < purchaseorderSearch.length ;i++){
				//�l�̎擾
				var expectedreceiptdate = purchaseorderSearch[i].getValue("expectedreceiptdate");//���ɗ\���
				var po_no = purchaseorderSearch[i].getValue("tranid");//�g�����U�N�V�����ԍ�
				var po_id = purchaseorderSearch[i].getValue("internalid");//hidden POID
				var po_line_no = purchaseorderSearch[i].getValue("line");//�g�����U�N�V�������s�ԍ�
				var item = purchaseorderSearch[i].getText("item");//���i�R�[�h
				var item_id =defaultEmpty(purchaseorderSearch[i].getValue("itemid", "item", null));//hidden ���i����ID

				
				var type = purchaseorderSearch[i].getText("type");//���
				var conversionrate = purchaseorderSearch[i].getValue("custcol_djkk_conversionrate"); //hidden �����
				var packcarton = purchaseorderSearch[i].getValue("packcarton","inventoryDetail",null);//hidden ���ʁi�J�[�g�����j
				//new sub
//				var classification = purchaseorderSearch[i].getValue("custitem_djkk_shape_content","item",null);//�׎p�敪
//				var state_code = purchaseorderSearch[i].getValue("custitem_djkk_physical_shape","item",null);//��ԃR�[�h
				var commodity_name = purchaseorderSearch[i].getValue("displayname","item",null);//���i��
				var lot_number = purchaseorderSearch[i].getValue("serialnumber");//���b�g�ԍ�
				var poisonous_drama = purchaseorderSearch[i].getText("custitem_djkk_pad_classification","item",null);//�Ō����敪
				var custcol_djkk_remars = purchaseorderSearch[i].getValue("custcol_djkk_remars");//���l
				var expiration_date = purchaseorderSearch[i].getValue("expirationdate","inventoryDetail",null);//�L������
//				nlapiLogExecution('debug', 'ccccc',expiration_date );
				var temperature_zone_classification = purchaseorderSearch[i].getText("custitem_djkk_product_category_scetikk","item",null);//���x�ы敪
				var radioactivity = purchaseorderSearch[i].getText("custitem_djkk_radioactivity_classifi","item",null);//���ː��L���敪
//				var inventory_cut_code = purchaseorderSearch[i].getValue("xxx");//�݌ɐؕ����R�[�h
				var trading_commodity_code = purchaseorderSearch[i].getValue("vendorname","item",null);//����揤�i�R�[�h
//				new nlobjSearchColumn("entityid","vendor",null)
				var expected_number = purchaseorderSearch[i].getValue("quantityuom");//���ח\�萔
				var targetlocation = purchaseorderSearch[i].getText("targetlocation");//�^�[�Q�b�g�̏ꏊ
				//���ח\�萔�������ꍇ�@�u�[�v�\�����Ȃ�
				
				if(Number(expected_number) < 0){
					expected_number = Number(expected_number) * -1;
				}else{
					expected_number  = Number(expected_number);
				}
				
				
				var po_unit = purchaseorderSearch[i].getValue("unit");//���ʁ�UOM�i�݌ɒP�ʁj  //count_uom
				var count_uom = expected_number + " " + po_unit;
//				var inspection_residue = purchaseorderSearch[i].getValue("xxx");//���i�c��
				//�l��ۑ�
				
				subList.setLineItemValue( 'expectedreceiptdate', i+1, formatDate(nlapiStringToDate(expectedreceiptdate)));
				subList.setLineItemValue( 'type', i+1, type);
				subList.setLineItemValue( 'po_id', i+1, po_id);
				subList.setLineItemValue( 'po_no', i+1, po_no);
				subList.setLineItemValue( 'po_line_no', i+1, po_line_no);
				subList.setLineItemValue( 'item', i+1, item);
				subList.setLineItemValue( 'count_uom', i+1,count_uom );
				subList.setLineItemValue( 'po_line_location', i+1,targetlocation );//�^�[�Q�b�g�̏ꏊ
//				subList.setLineItemValue( 'classification', i+1,classification );
//				subList.setLineItemValue( 'state_code', i+1,state_code );
				subList.setLineItemValue( 'commodity_name', i+1,commodity_name );
				subList.setLineItemValue( 'lot_number', i+1,lot_number );
				subList.setLineItemValue( 'poisonous_drama', i+1,poisonous_drama );
				subList.setLineItemValue( 'memo', i+1, custcol_djkk_remars );
				subList.setLineItemValue( 'expiration_date', i+1,expiration_date );
				subList.setLineItemValue( 'temperature_zone_classification', i+1,temperature_zone_classification );
				subList.setLineItemValue( 'radioactivity', i+1,radioactivity );
//				subList.setLineItemValue( 'inventory_cut_code', i+1,inventory_cut_code );
				subList.setLineItemValue( 'trading_commodity_code', i+1,trading_commodity_code );
				subList.setLineItemValue( 'expected_number', i+1,expected_number );
//				subList.setLineItemValue( 'inspection_residue', i+1,inspection_residue );
				
				valueTotal.push({
					//These are old fields
					po_id:po_id,
					expectedreceiptdate:expectedreceiptdate,//���ɗ\���
					po_no:po_no,//�g�����U�N�V�����ԍ�
					type:type,//���
					po_line_no:po_line_no,//�g�����U�N�V�������s�ԍ�
					item:item,//���i�R�[�h
					item_id:item_id,//���i�R�[�h
					count_uom:count_uom,//���ʁ�UOM�i�݌ɒP�ʁj
					memo:custcol_djkk_remars,//���l
					//These are new fields
					commodity_name:commodity_name,//���i��
					lot_number:lot_number,//���b�g�ԍ�
					poisonous_drama:poisonous_drama,//�Ō����敪
					expiration_date:expiration_date,//�L������
					temperature_zone_classification:temperature_zone_classification,//���x�ы敪
					radioactivity:radioactivity,//���ː��L���敪
					trading_commodity_code:trading_commodity_code,//����揤�i�R�[�h
					expected_number:expected_number//���ח\�萔
				});
			}//for end
		
			var subsidiaryRecord = nlapiLoadRecord('subsidiary', subsidiaryValue);
			var locationRecord = nlapiLoadRecord('location', locationValue);
			SEARCH_LOCATION = defaultEmpty(locationRecord.getFieldValue('name'));
			SEARCH_SUBSIDIARY = defaultEmpty(subsidiaryRecord.getFieldValue('name'));
			SEARCH_VTT = valueTotal;	
			fileIdField.setDefaultValue(IN_STOCK_SEND_FILE_ID);
		
			nlapiLogExecution('debug', 'show SEARCH_SUBSIDIARY under',SEARCH_SUBSIDIARY);
			nlapiLogExecution('debug', 'show PoId',po_id);
		}//if(!isEmpty(purchaseorderSearch)end
	}//if(selectFlg == 'T')end
	
//	var pdfFieldId = uuid();
//	var csvFieldId = uuid();
//	var csvDownUrl = "window.open('" + pdfDown(SEARCH_VTT) + "', '_blank');"; 
	response.writePage(form);
}

function bodyLineStr (str){
	if(isEmpty(str)){
		str = '';
	}
	
	return '<td><span>'+str+'</span></td>'
	//return str+',';
}

function headerCsv(){
	var str ='�A�N�e�B�r�e�B,�d����R�[�h�E��,���ɗ\���,�z�����,Shipment�ԍ�,PO�ԍ�,���i�E��Ǝw��,���i�I����]��,�o�ח\���,���l,PO�s�ԍ�,���i�R�[�h,���i���E�p��,���i���E���{��,�ۊǉ��x,���ʁ�UOM�i�݌ɒP�ʁj,�����,���ʁi�J�[�g�����j,�q�ɔԍ������O,�V�X�e�����b�g�ԍ�,�������b�g�ԍ��A�V���A���ԍ�,�L������,���l,SMC�ԍ�\r\n';
	return str;
}

function pdf(valueTotal,request,response){


	
	var poDataMap = {}; //head
	var poDetailDataMap = {};//body
//	nlapiLogExecution('debug', 'pdf', 'start ' + valueTotal.length);
	for(var i = 0; i < valueTotal.length; i ++){
			var poid= valueTotal[i].po_id;
			var time = valueTotal[i].expectedreceiptdate;
			var pohead = poDataMap[poid];
//			nlapiLogExecution('debug', 'poAddpobody',pobody);
//			var potime = poDetailDataMap[expectedreceiptdate];
//			var poAddTimeid = poDetailDataMap[poid]+':'+ poDetailDataMap[expectedreceiptdate];
			if(!pohead){
				var poSearch= nlapiSearchRecord("transaction",null,
					[
					      ["internalid","anyof",poid],
					      "AND",
						  ["type","anyof","PurchOrd","RtnAuth"],
						  "AND", 
					      ["taxline","is","F"], 
					      "AND", 
					      ["mainline","is","T"]

					], 
					[
					 //subsidiary
					 //department
					   new nlobjSearchColumn("custentity_djkk_activity","vendor",null), 
//					   new nlobjSearchColumn("altname","vendor",null), //����於
					   new nlobjSearchColumn("entityid","vendor",null), //�����R�[�h
//					   new nlobjSearchColumn("altname","vendor",null), 
					   new nlobjSearchColumn("custbody_djkk_ship_via"), 
					   new nlobjSearchColumn("transactionnumber"), //�������ԍ�
					   new nlobjSearchColumn("memo"), //���l
					   new nlobjSearchColumn("trandate"), //������
					   new nlobjSearchColumn("department"), 
					   new nlobjSearchColumn("department"),//�����������R�[�h + ������������
					   new nlobjSearchColumn("type"),//���
					   new nlobjSearchColumn("approvalstatus"),//���ח\�芮������
					]
				); 
				
//				var altname= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("altname","vendor",null));//����於
				var vendorname= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("entityid","vendor",null));//�����R�[�h
				var expectedreceiptdate= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("expectedreceiptdate"));//���ח\���
				if(expectedreceiptdate){
					expectedreceiptdate = formatDate(nlapiStringToDate(expectedreceiptdate));
				}
				
				var transactionnumber= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("transactionnumber"));//�������ԍ�
				var memo= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("memo"));//���l
				var trandate= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("trandate"));//������
				var department= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getText("department"));//�����������R�[�h
				var departmentName = '';//������������
				if(department){
					var depSplits = department.split(' ');
					var depLength = depSplits.length;
					if(depLength == 1){
						departmentName = department;
						department = '';
					}else if(depLength == 2){
						department = depSplits[0];
						departmentName = depSplits[1];
					}else{
						department = depSplits[0];
						departmentName = depSplits.splice(1).join(' ');
					}
				}
				var type= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getText("type"));//���
				var approvalstatus= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getText("approvalstatus"));//���ח\�芮������
				var subsidiary= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("subsidiary","item",null));//
				var location= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("location"));
						
				poDataMap[poid]={
//						altname:altname,
						vendorname:vendorname,
						expectedreceiptdate:expectedreceiptdate,
						transactionnumber:transactionnumber,
						memo:memo,
						trandate:trandate,
						department:department,
						departmentName:departmentName,
						type:type,
						approvalstatus:approvalstatus,
						subsidiary:subsidiary,
						location:location,
				};
				
			}

			var pobody = poDetailDataMap[poid +":"+time];
			if(!pobody){
				pobody = [];
				poDetailDataMap[poid +":"+time] = pobody;
			}
			pobody.push(valueTotal[i]);
			
	 }

	
		var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
		'<pdf>'+
		'<head>'+
		'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
		'<#if .locale == "zh_CN">'+
		'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
		'<#elseif .locale == "zh_TW">'+
		'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
		'<#elseif .locale == "ja_JP">'+
		'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
		'<#elseif .locale == "ko_KR">'+
		'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
		'<#elseif .locale == "th_TH">'+
		'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
		'</#if>'+
		'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
		'<#if .locale == "zh_CN">'+
		'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
		'<#elseif .locale == "zh_TW">'+
		'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
		'<#elseif .locale == "ja_JP">'+
		'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
		'<#elseif .locale == "ko_KR">'+
		'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
		'<#elseif .locale == "th_TH">'+
		'font-family: NotoSans, NotoSansThai, sans-serif;'+
		'<#else>'+
		'font-family: NotoSans, sans-serif;'+
		'</#if>'+
		'}'+
		'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
		'td { padding: 4px 6px;}'+
		'b { font-weight: bold; color: #333333; }'+
		'.nav_t1 td{'+
		'width: 110px;'+
		'height: 20px;'+
		'font-size: 13px;'+
		'display: hidden;'+
		'}'+
		'</style>'+
		'</head>';
		str+='<body padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">';
		var lastPo = '';
		for(var poidAndTime in poDetailDataMap){
			var keyArray = poidAndTime.split(':');
			var poid = keyArray[0];
			var time =  keyArray[1];
			var poData = poDataMap[poid];			
			var poDeailData = poDetailDataMap[poidAndTime];
			var tranid = poDeailData[0]['po_no'];
			
				str += '<table>'+
					//'<tr><td>123</td></tr>';
				    '<tr class="nav_t1" >' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '</tr>' +
					'<tr>' +
				    '<td align="center" style="vertical-align: middle;font-size: 13px;">N001</td>' +
				    '<td style="vertical-align: middle;font-size: 13px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;'+SEARCH_SUBSIDIARY+'</td>' +
//				    '<td ></td>' +
				    '<td ></td>' +
				    '<td ></td>' +
				    '<td colspan="2" rowspan="2" style="vertical-align: middle;font-size: 13px;">�o�͓���:' + formatDateTime(new Date()) + '</td>' +
				    '<td ></td>' +
				    '<td style="vertical-align:middle;font-size: 13px" rowspan="2"><pagenumber/>&nbsp;�y�[�W</td>' +
				    '</tr>' +
					'<tr height="30px">' +
				    '<td align="center" style="vertical-align: middle;font-size: 13px;">S001</td>' +
				    '<td style="vertical-align: middle;font-size: 13px;" colspan="5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;'+SEARCH_LOCATION+'</td>' +
//				    '<td></td>' +
//				    '<td></td>' +
//				    '<td></td>' +
				    '<td></td>' +
				    '</tr></table>' ;
				str+= '<table>' +
			    '<tr height="10px">' +
			    '<td width="160px"></td>' +
			    '<td width="180px"></td>' +
			    '<td width="170px"></td>' +
			    '<td width="150px"></td>' +
			    '<td width="120px"></td>' +
			    '<td width="150px"></td>' +
			    '<td width="180px"></td>' +
			    '<td width="170px"></td>' +
			    '</tr>' +
			    '<tr>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '<td  colspan="2" style="font-size: 22px;font-weight: bold;text-decoration: underline;" align="center">���ח\�胊�X�g</td>' +
			    '<td ></td>' +
//			    '<td colspan="2" rowspan="2" align="left"><barcode codetype="code128" value="PO;' + poid + ';' + tranid + '"/></td>' +
			    '<td colspan="2" rowspan="2" align="left"><barcode codetype="code128" value="' + tranid + '"/></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">���ח\���</td>' +
			    '<td >:&nbsp;&nbsp;'+time+'</td>' +
			    '<td align="left">������</td>' +
			    '<td >:&nbsp;&nbsp;'+formatDate(nlapiStringToDate(poData.trandate))+'</td>' +
			    '<td >���׎��</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.type+'</td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">���ח\��ԍ�</td>' +
			    '<td >:&nbsp;&nbsp;</td>' +
			    '<td align="left">���ח\�芮���敪</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.approvalstatus+'</td>' +
			    '<td >�������ԍ�</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.transactionnumber+'</td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">�����R�[�h</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.vendorname+'</td>' +
			    '<td align="left">����於</td>' +
			    '<td colspan="2">:&nbsp;&nbsp;test</td>' +//+poData.altname+
			    '' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">�����������R�[�h</td>' +
			    '<td>:&nbsp;&nbsp;'+poData.department+'</td>' +
//			    '<td>:&nbsp;&nbsp;'+SEARCH_DPM+'</td>' +
			    '<td align="left">������������</td>' +
			    '<td colspan="2">:&nbsp;&nbsp;'+poData.departmentName+'</td>' +
			    '' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">���l</td>' +
			    '<td colspan="7">:&nbsp;&nbsp;'+poData.memo+'</td>' +
//			    '<td align="left"></td>' +
//			    '<td colspan="2"></td>' +
//			    '' +
//			    '<td ></td>' +
//			    '<td ></td>' +
//			    '<td ></td>' +
			    '</tr></table> ';
				str+=
				'<table style="font-size: 14px;font-weight: bold;border-bottom: 1px dotted black;border-collapse: collapse;">' +
			    '<tr height="20px">' +
			    '<td width="100px"></td>' +
			    '<td width="200px"></td>' +
			    '<td width="400px"></td>' +
			    '<td width="450px"></td>' +
			    '</tr>' +
			    '<tr >' +
			    '<td >No.</td>' +
			    '<td >���i�R�[�h</td>' +
			    '<td >���i��</td>' +
			    '<td >����揤�i�R�[�h</td>' +
			    '</tr></table>' ;
			    str+=

			    '<table style="border-bottom: 1px solid black;border-collapse: collapse;">' +
			    '<tr style="font-size: 13px;font-weight: bold;">' +
			    '<td width="70px" ></td>' +
			    '<td width="140px" ></td>' +
			    '<td width="130px" >���b�g�ԍ�</td>' +
			    '<td width="140px" >�L������</td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="115px"></td>' +
			    '<td width="115px"></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;font-weight: bold;">' +
			    '<td width="70px"></td>' +
			    '<td width="140px"></td>' +
			    '<td width="130px">�Ō����敪</td>' +
			    '<td width="140px">���x�ы敪 </td>' +
			    '<td width="130px">���ː��L���敪 </td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="115px"></td>' +
			    '<td width="115px"></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;font-weight: bold;">' +
			    '<td width="70px"></td>' +
			    '<td width="140px"></td>' +
			    '<td width="130px">���l</td>' +
			    '<td width="140px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="115px" align="right">���ח\�萔</td>' +
			    '<td width="115px" align="right">���i�c��</td>' +
			    '</tr></table>' ;
					
					for(var i = 0; i < poDeailData.length; i ++){
						var valueDetailsArray = poDeailData[i];
						var itemID= valueDetailsArray['item_id'];
						if(isEmpty(itemID)){
							itemID=valueDetailsArray['item'];
						}else{
							itemID=replaceExceptNumberAndLetter(itemID);
						}
						
						
						str += 
						'<table style="font-size: 13px;border-bottom: 1px dotted black;">' +
						'<tr height="60px">' +
					    '<td width="100px" style="vertical-align: middle;">'+Number(i+1)+'</td>' +
					    '<td width="200px" style="vertical-align: middle;">'+defaultEmpty(valueDetailsArray.item)+'</td>' +
					    '<td width="400px" style="vertical-align: middle;">'+defaultEmpty(valueDetailsArray.commodity_name)+'</td>' +
					    '<td width="450px" style="vertical-align: middle;">'+defaultEmpty(valueDetailsArray.trading_commodity_code)+'</td>' +
					    '</tr></table>' ;
					    str+=		
					    '<table style="border-bottom: 1px solid black;border-collapse: collapse;">' +
					    
//					    '<tr height="0px">' +
//					    '<td width="70px"></td>' +
//					    '<td width="140px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="140px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="115px"></td>' +
//					    '<td width="115px"></td>' +
//					    '</tr>' +
					    
					    
					    
					    '<tr style="font-size: 13px;" height="15px">'+
						'<td width="20px" ></td>'+
						'<td width="90px" ></td>'+
						'<td width="80px" >'+defaultEmpty(valueDetailsArray.lot_number)+'</td>'+
						'<td width="85px" >'+defaultEmpty(valueDetailsArray.expiration_date)+'</td>'+
						'<td width="80px"></td>'+
						'<td width="80px"></td>'+
						'<td width="200px" align="right" colspan="3" rowspan="2" style="vertical-align:text-top;text-align:right"><barcode showtext="false" height="30" width="180" align="right" codetype="code128" value="'
//						+valueDetailsArray['po_id']+';'
						+valueDetailsArray['po_line_no']+';'
//						+itemID
						+defaultEmpty(valueDetailsArray.lot_number)
						+'" /></td>' +
						//'<td width="115px"></td>'+
						//'<td width="115px"></td>'+
					    '</tr>'+
					   
//					    '<tr style="font-size: 13px;">' +
//					    '<td width="70px"></td>' +
//					    '<td width="140px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="140px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="130px" colspan="3" rowspan="2" style="vertical-align:top;text-align:right;"><barcode codetype="code128" value="11111111"/></td>' +
//					    '</tr>' +
					    '<tr style="font-size: 13px;" height="15px">' +
					    '<td width="45px"></td>' +
					    '<td width="140px"></td>' +
					    '<td width="130px" >'+defaultEmpty(valueDetailsArray.poisonous_drama)+'</td>' +
					    '<td width="140px" >'+defaultEmpty(valueDetailsArray.temperature_zone_classification)+'</td>' +
					    '<td width="130px" >'+defaultEmpty(valueDetailsArray.radioactivity)+'</td>' +
					    '<td width="130px"></td>' +
					    '</tr>' +
					    '<tr style="font-size: 13px;" height="15px">' +
					    '<td width="45px"></td>' +
					    '<td width="140px"></td>' +
					    '<td width="130px" colspan="3" >'+valueDetailsArray.memo+'</td>' +
//					    '<td width="140px"></td>' +
//					    '<td width="130px"></td>' +
					    '<td width="130px"></td>' +
					    '<td width="140px"></td>' +
					    '<td width="120px" align="right" >'+defaultEmpty(valueDetailsArray.expected_number)+'</td>' +
					    '<td width="115px" align="right" ></td>' +
					    '</tr></table>' ;
//						}			
					}
			    str += '<pbr/>';
			}
		if(str.substring(str.length - 6) == '<pbr/>'){
			str = str.substring(0,str.length - 6);
		}
		str += '</body></pdf>';

		return str;
}


function csvDown(xmlString){
	try{
	
		var xlsFile = nlapiCreateFile('���ב��M' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
		
		xlsFile.setFolder(FILE_CABINET_ID_TOTAL_INV_OUTPUT_FILE);
		xlsFile.setName('���ב��M' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setEncoding('SHIFT_JIS');
	    
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		IN_STOCK_SEND_FILE_ID = fileID;
		var fl = nlapiLoadFile(fileID);
		var url= fl.getURL();
		return url; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', '', e)
	}
}

function pdfDown(purchaseorderSearch){
	try{
	

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(pdf(purchaseorderSearch));
	    //renderer.addSearchResults('results',purchaseorderSearch  );
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_INCOMING_PDF);
		xlsFile.setName('���ב��M' + '_' + getFormatYmdHms() + '.pdf');
	    
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		IN_STOCK_SEND_FILE_ID = fileID;
		var fl = nlapiLoadFile(fileID);
		var url= fl.getURL();
		return url; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'error', e)
	}
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
