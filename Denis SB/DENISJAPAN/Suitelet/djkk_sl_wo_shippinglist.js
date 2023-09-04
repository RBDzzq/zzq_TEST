/**
 * DJ_WO�ݸ���߯�ݸ�ؽ�
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/13     
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	
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
     var idList ='[';
      for (var m = 1; m < theCount + 1; m++) {
        if(request.getLineItemValue('list', 'check', m)=='T'){			        	
        	if(m01!=0){
        		idList+=',';
    			}
        	idList+='{';
        	idList+='"woid":"'+request.getLineItemValue('list', 'wo_id', m)+'"';
        	idList+=',';
        	idList+='"subsidiary":"'+request.getLineItemValue('list', 'subsidiary', m)+'"';
        	idList+=',';
        	idList+='"item":"'+request.getLineItemValue('list', 'item', m)+'"';
        	idList+=',';
        	idList+='"inventorynumber":"'+request.getLineItemValue('list', 'inventorynumber', m)+'"';
        	idList+=',';
        	idList+='"location":"'+request.getLineItemValue('list', 'location', m)+'"';
        	idList+=',';
        	idList+='"locationid":"'+request.getLineItemValue('list', 'locationid', m)+'"';
        	idList+=',';	
        	idList+='"quantity":"'+request.getLineItemValue('list', 'quantity', m)+'"';
        	idList+=',';
        	idList+='"unit":"'+request.getLineItemValue('list', 'unit', m)+'"';
        	idList+='}';
        	m01++;
        	}
        }
      idList+=']';
	scheduleparams['custscript_djkk_wo_shipping_json'] = idList;
	runBatch('customscript_djkk_ss_wo_shippinglist', 'customdeploy_djkk_ss_wo_shippinglist',scheduleparams);

	var parameter = new Array();
	var ctx = nlapiGetContext();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

//�o�b�`��ԉ��
function logForm(request, response) {

	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_djkk_cs_wo_shippinglist');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_wo_shippinglist');

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
	
	//�p�����[�^�擾
	 var selectFlg = request.getParameter('selectFlg');
	 var woNoValue = request.getParameter('woNo');
	 var subsidiaryValue = request.getParameter('subsidiary');
	 var locationValue = request.getParameter('location');
	
	var form = nlapiCreateForm('DJ_���[�N�I�[�_�[�s�b�L���O���X�g', false);
	form.setScript('customscript_djkk_cs_wo_shippinglist');
		
	 //��ʍ��ڒǉ�
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '�����߂�','searchReturn()')
		 form.addSubmitButton('�X�V')
	 }else{
		form.addButton('btn_search', '����', 'search()')
	 }
	 

	form.addFieldGroup('select_group', '����');
	var subsidiaryField = form.addField('custpage_subsidiary', 'select', '���','subsidiary', 'select_group');
	var woNoField = form.addField('custpage_wo_no', 'select', '���[�N�I�[�_�[�ԍ�','workorder', 'select_group');
	var locationField = form.addField('custpage_location', 'select', '�ꏊ','location', 'select_group');
	
	//form.addField('custpage_param', 'textarea', '�p�����[�^',null, 'select_group').setDisplayType('hidden');


	
	if(selectFlg == 'T'){
		woNoField.setDisplayType('inline');
		subsidiaryField.setDisplayType('inline');
		locationField.setDisplayType('inline');
			
	}
	woNoField.setDefaultValue(woNoValue)
	subsidiaryField.setDefaultValue(subsidiaryValue);
	locationField.setDefaultValue(locationValue);
	
	var subList = form.addSubList('list', 'list', '������');
	subList.addMarkAllButtons();
	subList.addField('check', 'checkbox', '�I��');
	subList.addField('wo_no', 'text', '���[�N�I�[�_�[�ԍ�');
	subList.addField('wo_id', 'text', '���[�N�I�[�_�[ID').setDisplayType('hidden');
	var woLink = subList.addField('wo_link', 'url', '�\��').setDisplayType('disabled');
	woLink.setLinkText('�\��');
	subList.addField('subsidiary', 'text', '���');
	subList.addField('item', 'text', '�A�C�e��');
	subList.addField('inventorynumber', 'text', '�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j');
	subList.addField('location', 'text', '�ꏊ');
	subList.addField('locationid', 'text', '�ꏊid').setDisplayType('hidden');
	subList.addField('quantity', 'text', '����');
	subList.addField('unit', 'text', '�P��');
	
	if(selectFlg == 'T'){
		
		var filiterArr = new Array();
		filiterArr.push(["type","anyof","WorkOrd"]);
		filiterArr.push("AND");
		filiterArr.push(["status","anyof","WorkOrd:B"]);
		filiterArr.push("AND");
		filiterArr.push(["mainline","is","F"]);
//		filiterArr.push("AND");
//		filiterArr.push(["inventorydetail.internalid","noneof","@NONE@"]);	
//		filiterArr.push("AND");
//		filiterArr.push(["custbody_djkk_shippinglist_sended","is","F"]);
		filiterArr.push("AND");
		filiterArr.push(["formulanumeric: {quantity}","greaterthan","0"]);
		
		if(!isEmpty(woNoValue)){
			filiterArr.push("AND");
			filiterArr.push(["internalid","anyof",woNoValue]);
		}
		if(!isEmpty(subsidiaryValue)){
			filiterArr.push("AND");
			filiterArr.push(["subsidiary","anyof",subsidiaryValue]);
		}
		if(!isEmpty(locationValue)){
			filiterArr.push("AND");
			filiterArr.push(["location","anyof",locationValue]);
		}	
		var workorderSearch = getSearchResults("workorder",null,
				filiterArr, 
				[				   
				   new nlobjSearchColumn("internalid",null,"GROUP"), 
				   new nlobjSearchColumn("tranid",null,"GROUP"), 
				   new nlobjSearchColumn("subsidiary",null,"GROUP"), 
				   new nlobjSearchColumn("item",null,"GROUP").setSort(true), 
				   new nlobjSearchColumn("inventorynumber","inventoryDetail","GROUP").setSort(true), 
				   new nlobjSearchColumn("location",null,"GROUP").setSort(true), 
				   new nlobjSearchColumn("quantity",null,"GROUP"), 
				   new nlobjSearchColumn("unit",null,"GROUP")
				]
				);
		
		if(!isEmpty(workorderSearch)){
			for(var i = 0 ; i < workorderSearch.length;i++){
				subList.setLineItemValue('wo_id', i+1, workorderSearch[i].getValue("internalid",null,"GROUP"));
				var theLink = nlapiResolveURL('RECORD', 'workorder',workorderSearch[i].getValue("internalid",null,"GROUP") ,'VIEW');
				subList.setLineItemValue('wo_link', i+1, theLink);
				subList.setLineItemValue('wo_no', i+1, workorderSearch[i].getValue("tranid",null,"GROUP"));
				subList.setLineItemValue('item', i+1, workorderSearch[i].getText("item",null,"GROUP"));
				var linvn=workorderSearch[i].getText("inventorynumber","inventoryDetail","GROUP");
				if(!isEmpty(linvn)&&linvn!='- None -'){
				subList.setLineItemValue('inventorynumber', i+1, linvn);
				}
				subList.setLineItemValue('quantity', i+1, workorderSearch[i].getValue("quantity",null,"GROUP"));
				var lunit=workorderSearch[i].getText("unit",null,"GROUP");
				if(!isEmpty(lunit)&&lunit!='- None -'){
				subList.setLineItemValue('unit', i+1, lunit);
				}
				subList.setLineItemValue('subsidiary', i+1, workorderSearch[i].getText("subsidiary",null,"GROUP"));
				var llocation=workorderSearch[i].getText("location",null,"GROUP");
				if(!isEmpty(llocation)&&llocation!='- None -'){
				subList.setLineItemValue('location', i+1, llocation);
				}
				subList.setLineItemValue('locationid', i+1, workorderSearch[i].getValue("location",null,"GROUP"));
			}
		}
	
	}
	response.writePage(form);
}