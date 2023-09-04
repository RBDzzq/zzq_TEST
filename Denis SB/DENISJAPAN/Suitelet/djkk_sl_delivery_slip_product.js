/**
 * DJ_�a����݌ɒ����`�[���s
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2022     CPC_�v
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	if (request.getMethod() == 'POST') {
		run(request, response);
		
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response)
		}else{
			createForm(request, response);
		}
	}
}

function run(request, response,locationValue,subsidiaryValue){
	
	 var scheduleparams = new Array();
	 var idList='';	
     var theCount = parseInt(request.getLineItemCount('list'));
     var m01=0;
     for (var m = 1; m < theCount + 1; m++) {
        if(request.getLineItemValue('list', 'check', m)=='T'){			        	
        	if(m01!=0){
        		idList+=',';
    			}
        	idList+=request.getLineItemValue('list', 'stock_id', m);		        	
        	m01++;
        	}
       }
	
	scheduleparams['custscript_djkk_ss_delivery_slip_pro_par'] = idList;
	runBatch('customscript_djkk_ss_delivery_slip_pro', 'customdeploy_djkk_ss_delivery_slip_pro',scheduleparams);


	var parameter = new Array();
	var ctx = nlapiGetContext();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
	
}

function logForm(request, response) {
	
	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_djkk_cs_delivery_slip_pro');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_delivery_slip_pro');

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
	 var stockValue = request.getParameter('stock');
	 var subsidiaryValue = request.getParameter('subsidiary');
	 var locationValue = request.getParameter('location');
	
	var form = nlapiCreateForm('�V���O���s�b�L���O���X�g���z���w��_�a����݌�', false);
	form.setScript('customscript_djkk_cs_delivery_slip_pro');  //
	 //��ʍ��ڒǉ�
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '�����߂�','searchReturn()')
		 form.addSubmitButton('�X�V')
	 }else{
		form.addButton('btn_search', '����', 'search()')
	 }
	 

	form.addFieldGroup('select_group', '����');
	var subsidiaryField = form.addField('custpage_subsidiary', 'select', '���',null,'select_group');
	var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	
	if(isEmpty(subsidiaryValue)){
		 subsidiaryValue=selectSub;
		}else{
			subsidiaryField.setDefaultValue(subsidiaryValue);
		}
	
	var locationField = form.addField('custpage_location', 'select', 'DJ_�ꏊ',null, 'select_group');
	
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
	
	var stockField = form.addField('custpage_stock', 'select', 'DJ_�a����݌ɒ����ԍ�',null, 'select_group');
	
	var custodySearch = getSearchResults("customrecord_djkk_ic_change",null,
			[
			   ["custrecord_djkk_ica_subsidiary","anyof",subsidiaryValue],
			   "AND",
			   ["custrecord_djkk_ica_sendmail","is","F"]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("internalid")
			]
			);
	stockField.addSelectOption('', '');
	for(var i = 0; i<custodySearch.length;i++){
		stockField.addSelectOption(custodySearch[i].getValue("internalid"),custodySearch[i].getValue("name"));
	}
	
	
	if(selectFlg == 'T'){	
		subsidiaryField.setDisplayType('inline');
		locationField.setDisplayType('inline');
		stockField.setDisplayType('inline');
			
	}else{
		
	}
	subsidiaryField.setDefaultValue(subsidiaryValue);
	locationField.setDefaultValue(locationValue);
	stockField.setDefaultValue(stockValue);
	
	var subList = form.addSubList('list', 'list', 'DJ_�a����݌�');
	subList.addMarkAllButtons();
	subList.addField('check', 'checkbox', '�I��');
	subList.addField('stock_no', 'text', 'DJ_�a����݌ɒ����ԍ�');
	subList.addField('stock_id', 'text', 'DJ_�a����݌ɒ���ID').setDisplayType('hidden');
	var soLink = subList.addField('stock_link', 'url', '�\��').setDisplayType('disabled');
	soLink.setLinkText('�\��');
	subList.addField('entity', 'text', '�ڋq');
	subList.addField('subsidiary', 'text', '���');
	subList.addField('location', 'text', '�ꏊ');
	
	
	if(selectFlg == 'T'){
		
		var filiterArr = new Array();
		filiterArr.push(["custrecord_djkk_ica_sendmail","is","F"]);
		if(!isEmpty(stockValue)){
			filiterArr.push("AND");
			filiterArr.push(["internalid","anyof",stockValue]);
		}
		if(!isEmpty(subsidiaryValue)){
			filiterArr.push("AND");
			filiterArr.push(["custrecord_djkk_ica_subsidiary","anyof",subsidiaryValue]);
		}
		if(!isEmpty(locationValue)){
			filiterArr.push("AND");
			filiterArr.push(["custrecord_djkk_ica_location","anyof",locationValue]);
		}
		var custodySearchTwo = getSearchResults("customrecord_djkk_ic_change",null,
				[
				 filiterArr
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_ica_subsidiary"), 
				   new nlobjSearchColumn("custrecord_djkk_ica_customer"), 
				   new nlobjSearchColumn("custrecord_djkk_ica_location"), 
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("name"), 
				]
				);
		if(!isEmpty(custodySearchTwo)){
			for(var i = 0 ; i < custodySearchTwo.length;i++){
				subList.setLineItemValue('stock_no', i+1, custodySearchTwo[i].getValue("name")); //DJ_�a����݌ɒ����ԍ�
				subList.setLineItemValue('stock_id', i+1, custodySearchTwo[i].getValue("internalid"));  //DJ_�a����݌ɒ���ID
				subList.setLineItemValue('entity', i+1, custodySearchTwo[i].getText("custrecord_djkk_ica_customer"));  //�ڋq
				subList.setLineItemValue('subsidiary', i+1, custodySearchTwo[i].getText("custrecord_djkk_ica_subsidiary"));  //���
				subList.setLineItemValue('location', i+1, custodySearchTwo[i].getText("custrecord_djkk_ica_location"));  //�ꏊ
				var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_ic_change',custodySearchTwo[i].getValue('internalid') ,'VIEW');
				subList.setLineItemValue('stock_link', i+1, theLink);
			}
		}
		
	}
	
	response.writePage(form);
	
}