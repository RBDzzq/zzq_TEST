/**
 * Module Description
 * WO���������@�\
 * Version    Date            Author           Remarks
 * 1.00       26 Jul 2021     
 *
 */
/**
 * for handy test
 * @param {*} request 
 * @param {*} response 
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
	

	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	

	

	scheduleparams['custscript_djkk_ss_hikiate_adjust_wok_id'] = request.getParameter('custpage_record_id')
	scheduleparams['custscript_djkk_ss_hikiate_adjust_param'] = request.getParameter('custpage_param');
	runBatch('customscript_djkk_ss_hikiate_adjust', 'customdeploy_djkk_ss_hikiate_adjust', scheduleparams);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}


//�o�b�`��ԉ��
function logForm(request, response) {

	var form = nlapiCreateForm('�������', false);
	form.setScript('customscript_djkk_cs_inspection_list');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_hikiate_adjust');

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
	
	
	var recId = request.getParameter('workorderId')
	
	if(isEmpty(recId)){
		var form = nlapiCreateForm('�����}�j���A������', false);
		form.addField('custpage_label', 'label', '�����������܂����B')
		response.writePage(form);	
		return;
	}
	
	var form = nlapiCreateForm('�����}�j���A������', false);
	form.setScript('customscript_djkk_cs_hikiate_adjust');
	var recField = form.addField('custpage_record_id', 'text', '���R�[�hID');
	recField.setDisplayType('hidden');
	recField.setDefaultValue(recId);
	var paramField = form.addField('custpage_param', 'textarea', '�p�����[�^');
	paramField.setDisplayType('hidden');
	form.addSubmitButton('�݌ɏڍ׍X�V');
	
	var list = form.addSubList('list', 'list', '�݌ɏڍ�')
	list.addField('item' ,'text', '�A�C�e��');
	list.addField('item_type' ,'text', '�A�C�e�����');
	list.addField('item_id' ,'text', '�A�C�e��ID').setDisplayType('hidden');
	list.addField('count' ,'text', '���[�h�I�[�_�[����');
	list.addField('inv_no' ,'text', '�V���A��/���b�g�ԍ�');
	list.addField('able_date' ,'text', '�L������');
	list.addField('done_count' ,'text', '�����ςݐ���');
	list.addField('adjust_count' ,'currency', '�蓮��������').setDisplayType('entry');
	list.addField('arr_count' ,'text', '�\����');		
	list.addField('one_inv_no' ,'checkbox', '�P�ꃍ�b�g').setDisplayType('disabled');
	
	list.addField('in_location_no' ,'text', '�q�ɓ��ɔԍ�');	
	list.addField('maker_no' ,'text', '���[�J�̐����ԍ�');	
	list.addField('smc_no' ,'text', 'SMC�ԍ�');	
	list.addField('create_date' ,'text', '�����N����');	
	list.addField('ship_date' ,'text', '�o�׉\������');	

	
	
	var rec = nlapiLoadRecord('workorder', recId);
	
	var recItemCount = rec.getLineItemCount('item');
	var itemCountArr = new Array();
	var itemUnitArr = new Array();
	var itemDetailArr = new Array();
	var itemList = new Array();
	//itemList.push('item');
	itemList.push('internalid');
	itemList.push('anyof')
	for(var i = 0 ; i < recItemCount ; i++){
		rec.selectLineItem('item', i+1)
		itemList.push(rec.getCurrentLineItemValue('item', 'item' ));
		itemCountArr[rec.getCurrentLineItemValue('item', 'item')] = rec.getCurrentLineItemValue('item', 'quantity');
		itemUnitArr[rec.getCurrentLineItemValue('item', 'item')] = rec.getCurrentLineItemValue('item', 'units');
		var inventorydetailavail = rec.getCurrentLineItemValue('item','inventorydetailavail')
		if(inventorydetailavail == 'T'){
			var inventoryDetail=rec.editCurrentLineItemSubrecord('item','inventorydetail');		
			if(!isEmpty(inventoryDetail)){				
				var invDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');				
				for(var j = 0 ; j < invDetailCount ; j++){
					inventoryDetail.selectLineItem('inventoryassignment',j+1);
					itemDetailArr[inventoryDetail.getCurrentLineItemText('inventoryassignment','issueinventorynumber')] = inventoryDetail.getCurrentLineItemValue('inventoryassignment','quantity');
				
				}
			}
		}	
	}
	

	//���A���^�C���̍݌ɏ��
	var inventorydetailSearch = nlapiSearchRecord("item",null,
			[
//			   ["inventorynumber.quantityavailable","greaterthan","0"], 
//			   "AND", 
			   itemList, 
			   "AND", 
			   ["inventoryNumber.location","anyof",rec.getFieldValue('location')]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP").setSort(false), 
			   new nlobjSearchColumn("itemid","","GROUP"), 
			   new nlobjSearchColumn("custitem_djkk_single_lot_provision","","MAX"), 
			   new nlobjSearchColumn("quantityonhand","inventoryNumber","GROUP"), 
			   new nlobjSearchColumn("quantityavailable","inventoryNumber","GROUP"), 
			   new nlobjSearchColumn("inventorynumber","inventoryNumber","GROUP"), 
			   new nlobjSearchColumn("internalid","inventoryNumber","GROUP"),
			   new nlobjSearchColumn("location",null,"GROUP"),
			   new nlobjSearchColumn("type","","MAX"), 
			   new nlobjSearchColumn("custitemnumber_djkk_maker_serial_number","inventoryNumber","MAX"), 
			   new nlobjSearchColumn("custitemnumber_djkk_smc_nmuber","inventoryNumber","MAX"), 
			   new nlobjSearchColumn("custitemnumber_djkk_make_date","inventoryNumber","MAX"), 
			   new nlobjSearchColumn("custitemnumber_djkk_shipment_date","inventoryNumber","MAX"),
			   new nlobjSearchColumn("custitemnumber_djkk_warehouse_number","inventoryNumber","MAX"),
			   new nlobjSearchColumn("expirationdate","inventoryNumber","MAX"),
			   new nlobjSearchColumn('stockunit','','MAX'),
			   new nlobjSearchColumn('unitstype','','MAX')
			]
			);
	
	//��{�P�ʓ]��
	var unitstypeSearch = getSearchResults("unitstype",null,
			[
			   ["isinactive","is","F"]
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("unitname"), 
			   new nlobjSearchColumn("conversionrate"),
			   new nlobjSearchColumn("name")
			]
			);
	var unitsArr = new Array();
	if(!isEmpty(unitstypeSearch)){
		for(var i = 0 ; i < unitstypeSearch.length ; i++){
			var json = {};
			json.unitname = unitstypeSearch[i].getValue('unitname');
			json.conversionrate = unitstypeSearch[i].getValue('conversionrate')
			json.typename = unitstypeSearch[i].getValue('name')
			
			unitsArr.push(json);
		}
		
	}
	
	if(!isEmpty(inventorydetailSearch)){
		var lineNumber = 1;
		for(var i = 0 ; i < inventorydetailSearch.length ; i++){
			list.setLineItemValue('item', lineNumber, inventorydetailSearch[i].getValue("itemid","","GROUP"));
			list.setLineItemValue('item_id', lineNumber, inventorydetailSearch[i].getValue("internalid",null,"GROUP"));
			list.setLineItemValue('inv_no', lineNumber, inventorydetailSearch[i].getValue("inventorynumber","inventoryNumber","GROUP"))

			//���ʓ]��
			var count = itemCountArr[inventorydetailSearch[i].getValue("internalid",null,"GROUP")];
			var unit = itemUnitArr[inventorydetailSearch[i].getValue("internalid",null,"GROUP")];
			var unitName = inventorydetailSearch[i].getValue('unitstype','','MAX');
			//nlapiLogExecution('DEBUG', '', unit+'-'+unitName+'-'+getUnitCount(unitsArr,unit,unitName,count))
			//count = getUnitCount(unitsArr,unit,unitName,count)
			
			list.setLineItemValue('count', lineNumber, Number(count));
			list.setLineItemValue('one_inv_no', i+1, inventorydetailSearch[i].getValue("custitem_djkk_single_lot_provision","item","MAX"))
			var doneCount = itemDetailArr[inventorydetailSearch[i].getValue("inventorynumber","inventoryNumber","GROUP")];
			list.setLineItemValue('done_count', lineNumber, isEmpty(doneCount) ? '0' : doneCount);			
			list.setLineItemValue('adjust_count', lineNumber, isEmpty(doneCount) ? '0' : doneCount);
			var arr_count = inventorydetailSearch[i].getValue("quantityavailable","inventoryNumber","GROUP")
			if(Number(arr_count)== 0 && Number(doneCount) > 0){
				arr_count = doneCount;
			}
			list.setLineItemValue('arr_count', lineNumber,arr_count )
			list.setLineItemValue('item_type', lineNumber, inventorydetailSearch[i].getValue("type","item","MAX"));
			list.setLineItemValue('in_location_no', lineNumber, inventorydetailSearch[i].getValue("custitemnumber_djkk_warehouse_number","inventoryNumber","MAX"));
			list.setLineItemValue('maker_no', lineNumber, inventorydetailSearch[i].getValue("custitemnumber_djkk_maker_serial_number","inventoryNumber","MAX"));
			list.setLineItemValue('smc_no', lineNumber, inventorydetailSearch[i].getValue("custitemnumber_djkk_smc_nmuber","inventoryNumber","MAX"));
			list.setLineItemValue('create_date', lineNumber, inventorydetailSearch[i].getValue("custitemnumber_djkk_make_date","inventoryNumber","MAX"));
			list.setLineItemValue('ship_date', lineNumber, inventorydetailSearch[i].getValue("custitemnumber_djkk_shipment_date","inventoryNumber","MAX"));
			list.setLineItemValue('able_date', lineNumber, inventorydetailSearch[i].getValue("expirationdate","inventoryNumber","MAX"));
			
			
			lineNumber++
		}
	}

	
	
	
	response.writePage(form);	
}

//�P�ʐ��ʓ]��
function getUnitCount (arr,name,typename,count){
	if(isEmpty(arr)){
		return count;
	
	}
	
	for(var i = 0 ; i < arr.length ; i ++){
		if(arr[i].unitname == name && arr[i].typename == typename){
			return count/Number(arr[i].conversionrate )
		}
	}
	return count;
}