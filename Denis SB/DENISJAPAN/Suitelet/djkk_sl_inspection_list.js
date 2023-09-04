/**
 * DJ_���i�ꗗ���
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/19     CPC_��
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
	

	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	
	var str = "";
	var theCount = parseInt(request.getLineItemCount('inventory_details'));
	for(var i = 0 ; i < theCount ; i++){
		if(request.getLineItemValue('inventory_details', 'chk', i+1)=='T'){
			var kennhinId = request.getLineItemValue('inventory_details', 'kenhinid', i+1);

			str+=kennhinId+',';
		}
		
	}
	
	
	
	scheduleparams['custscript_djkk_ss_inspection_list_info'] = str;
	runBatch('customscript_djkk_ss_inspection_list', 'customdeploy_djkk_ss_inspection_list', scheduleparams);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

//�o�b�`��ԉ��
function logForm(request, response) {

	var form = nlapiCreateForm('���i�݌Ɉړ���', false);
	form.setScript('customscript_djkk_cs_inspection_list');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_inspection_list');

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

//��ʍ쐬
function createForm(request, response){
	var form = nlapiCreateForm('DJ_���i�ꗗ���', false);
	form.setScript('customscript_djkk_cs_inspection_list');
	
	var locationValue = request.getParameter('location')
	var subsidiaryValue = request.getParameter('subsidiary')

	//�������ڂ��쐬
	form.addFieldGroup('custpage_group_filter', '��������');
	
	var subsidiary = form.addField('custpage_subsidiary', 'select', '�A���q���', null,'custpage_group_filter');
	subsidiary.setMandatory(true);
	var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiary)
	var loaction = form.addField('custpage_location', 'select', '�ꏊ', 'null','custpage_group_filter').setMandatory(true);
	
	

	

	//�������i���eKey�擾
	var customrecord_djkk_inv_ipSearch = getSearchResults("customrecord_djkk_inv_ip",null,
			[
				], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("custrecord_djkk_inv_ip_key"),
				   new nlobjSearchColumn("custrecord_djkk_inv_ip_inspected"),
				   new nlobjSearchColumn("custrecord_djkk_inv_ip_done")
				   
				]
				);
	
	var key = new Array();
	for(var i = 0; i < customrecord_djkk_inv_ipSearch.length ; i++){
		key.push(customrecord_djkk_inv_ipSearch[i].getValue("custrecord_djkk_inv_ip_key"));
	}
	
	//��Вl�ݒ�
	if(isEmpty(subsidiaryValue)){
		subsidiaryValue=selectSub;
	}	
	subsidiary.setDefaultValue(subsidiaryValue);  

	//���i���q�ɐݒ�
	var locationSearch = nlapiSearchRecord("location",null,
			[
			 ["subsidiary","anyof",subsidiaryValue],
			 "AND",
			   ["name","contains","���i��"]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("internalid")
			]
			);

	loaction.addSelectOption('-1', '')
	if(!isEmpty(locationSearch)){
		for(var i = 0 ; i < locationSearch.length ; i++){
			loaction.addSelectOption(locationSearch[i].getValue("internalid"), locationSearch[i].getValue("name"))
		}
	}

    
    
    //�q�ɐݒ�
    if(!isEmpty(locationValue)){
    	loaction.setDefaultValue(locationValue);
    }else{
    	loaction.setDefaultValue('-1');
    	locationValue = '-1'
    }
    
	//���׍쐬
	var subList = form.addSubList('inventory_details', 'list', '�A�C�e��');
	subList.addMarkAllButtons();
	subList.addRefreshButton();
	subList.addField('kenhinid', 'text', '���iID').setDisplayType('hidden');
	subList.addField('sub', 'text', 'sub').setDisplayType('hidden');
	subList.addField('from', 'text', 'from').setDisplayType('hidden');
	subList.addField('chk', 'checkbox','�I��');
	subList.addField('state', 'text','���i��')//.setDisplayType('entry');
	var tranLink = subList.addField('transactionlink', 'url', '�\��').setDisplayType('disabled');
	tranLink.setLinkText('�\��');
	subList.addField('transactionname', 'text', '��̏��ԍ�').setDisplayType('disabled');
	subList.addField('transaction_moto', 'text', '�������ԍ�').setDisplayType('disabled');
	subList.addField('transactiondate', 'date', '��̓��t').setDisplayType('disabled');
	subList.addField('transactionid', 'text', '�g�����U�N�V��������ID').setDisplayType('hidden');
	subList.addField('item', 'text', '�A�C�e��').setDisplayType('disabled');
	subList.addField('itemtyid', 'text', '�A�C�e������ID').setDisplayType('hidden');
	//20220519 add by zhou start
	subList.addField('displayname', 'text', '���i��').setDisplayType('disabled');
	subList.addField('vendorname', 'text', '�d���揤�i�R�[�h').setDisplayType('disabled');
	//20220519 add by zhou end
	subList.addField('receiptinventorynumber', 'text', '�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j').setDisplayType('disabled');
	subList.addField('receiptinventorynumberid', 'text', '�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j����ID').setDisplayType('hidden');	
	subList.addField('quantity', 'text', '����').setDisplayType('disabled');
	subList.addField('inspectionlevel', 'text', 'DJ_���i���x��').setDisplayType('disabled');
	subList.addField('usefortest', 'text', '�e�X�g�p').setDisplayType('hidden');
	
	var inspectionprocedureurl=subList.addField('inspectionprocedureurl', 'url', '���i�菇�{�^��').setDisplayType('normal');
	var image='';
	try{

    // �摜/button.png
	image  = "<img position=\"absolute\" left=\"300mm\" width=\"80mm\" height=\"40mm\" src= \"";
    image += nlapiEscapeXML(nlapiLoadFile('219235').getURL());
    image += "\" align=\"left\"></img>\n";
	}catch(e){
		image  ='<font color="black">���i</font>';
	}
	inspectionprocedureurl.setLinkText(image);
	inspectionprocedureurl.setLayoutType('outsidebelow', 'startrow');
	
	
	

	var lstLocationFilter = new Array();
	if(subsidiaryValue != '-1' ){
		lstLocationFilter.push("subsidiary")
		lstLocationFilter.push("anyof")
		lstLocationFilter.push(subsidiaryValue)
		
	}
	

	var inventorydetailFilter = new Array();
	var filter1 = new Array();
	filter1.push("inventorynumber");
	filter1.push("noneof");
	filter1.push("@NONE@");
	inventorydetailFilter.push(filter1);
	
	var filter2 = new Array();
	filter2.push("item.custitem_djkk_inspection_required");
	filter2.push("is");
	filter2.push("T");
	inventorydetailFilter.push("AND")
	inventorydetailFilter.push(filter2);
	
	if(locationValue != '-1'){
		var filter3 = new Array();
		filter3.push("location");
		filter3.push("anyof");
		filter3.push(locationValue);
		inventorydetailFilter.push("AND")
		inventorydetailFilter.push(filter3);
	}
	
	if(subsidiaryValue != '-1'){
		var filter4 = new Array();
		filter4.push("transaction.subsidiary");
		filter4.push("anyof");
		filter4.push(subsidiaryValue);
		inventorydetailFilter.push("AND")
		inventorydetailFilter.push(filter4);
	}
	
	inventorydetailFilter.push("AND");
	inventorydetailFilter.push(["transaction.type","anyof","ItemRcpt"])
	
	var inventorydetailSearch = getSearchResults("inventorydetail",null,
			[
				inventorydetailFilter
			], 
			[
			   new nlobjSearchColumn("inventorynumber",null,"GROUP"), 
			   new nlobjSearchColumn("internalid","inventorynumber","MAX"), 
			   new nlobjSearchColumn("location",null,"MAX"), 
			   new nlobjSearchColumn("item",null,"MAX"), 
			   new nlobjSearchColumn("internalid","item","MAX"), 
			   new nlobjSearchColumn("custitem_djkk_inspection_level","item","MAX"),
			   new nlobjSearchColumn("transactionname","transaction","MAX"),
			   new nlobjSearchColumn("internalid","transaction","MAX"),
			   new nlobjSearchColumn("trandate","transaction","MAX"),
			   new nlobjSearchColumn("quantityavailable","inventoryNumber","MAX"),
			   new nlobjSearchColumn("createdfrom","transaction","MAX"),
			   new nlobjSearchColumn("stockunit","item","MAX"), 
			   new nlobjSearchColumn("unitstype","item","MAX"),
			   new nlobjSearchColumn("internalid","binNumber","MAX")
			   
			]
			);
	

	var itemLine = 1;
	if (!isEmpty(inventorydetailSearch) && locationValue != '-1') {
		
		var inventorynumberArr = new Array();
		inventorynumberArr.push("internalid")
		inventorynumberArr.push("anyof")
		for(var i = 0 ; i < inventorydetailSearch.length ; i ++){
			inventorynumberArr.push(inventorydetailSearch[i].getValue("internalid","inventorynumber","MAX"))
		}
		var inventorynumberSearch = getSearchResults("inventorynumber",null,
				[
				   inventorynumberArr, 
				   "AND", 
				   ["location","anyof",locationValue]
				], 
				[
				   new nlobjSearchColumn("quantityonhand"),
				   new nlobjSearchColumn("internalid")
				]
				);
		
		var inventorynumberPostion = new Array();
		for(var i = 0 ; i < inventorynumberSearch.length ; i++){
			inventorynumberPostion.push(inventorynumberSearch[i].getValue('internalid'))

		}
		
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
		
		
		
		for (var n = 0; n < inventorydetailSearch.length; n++) {
			//�݌ɉ\����
			var invOkCount = inventorynumberSearch[inventorynumberPostion.indexOf(inventorydetailSearch[n].getValue('internalid','inventorynumber','MAX'))].getValue("quantityonhand");
			var unit = inventorydetailSearch[n].getValue('stockunit','item','MAX');
			var unitName = inventorydetailSearch[n].getValue('unitstype','item','MAX');
			invOkCount = getUnitCount(unitsArr,unit,unitName,invOkCount)
			//subList.setLineItemValue('usefortest', itemLine, inventorynumberSearch[inventorynumberPostion.indexOf(inventorydetailSearch[n].getValue('internalid','inventorynumber','MAX'))].getValue("quantityonhand")+' '+unit)
			
			var binnumber = inventorydetailSearch[n].getValue("internalid","binNumber","MAX");
			
			if(invOkCount <= 0 || isEmpty(invOkCount)){
				continue;
			}
			
			subList.setLineItemValue('sub', itemLine, subsidiaryValue);
			subList.setLineItemValue('from', itemLine, locationValue);
			var theLink = nlapiResolveURL('RECORD', 'itemreceipt',inventorydetailSearch[n].getValue('internalid','transaction','MAX') ,'VIEW');
			subList.setLineItemValue('transactionlink', itemLine, theLink);
			
			subList.setLineItemValue('transactionname', itemLine, inventorydetailSearch[n].getValue('transactionname','transaction','MAX'));
			subList.setLineItemValue('transaction_moto', itemLine, inventorydetailSearch[n].getValue("createdfrom","transaction","MAX"));
			subList.setLineItemValue('transactionid', itemLine, inventorydetailSearch[n].getValue('internalid','transaction','MAX'));
			subList.setLineItemValue('transactiondate', itemLine, inventorydetailSearch[n].getValue('trandate','transaction','MAX'));
			subList.setLineItemValue('item', itemLine, inventorydetailSearch[n].getValue("item",null,"MAX"));
			//20220519 add by zhou start
			var itemId = inventorydetailSearch[n].getValue("internalid","item","MAX")
			var itemSearch = nlapiSearchRecord("item",null,
					[
					 	["internalid","anyof",itemId]
					], 
					[
					 	new nlobjSearchColumn("displayname"),//���i��
					 	new nlobjSearchColumn("vendorname")//�d���揤�i�R�[�h
					]
					);	
			var displayname = itemSearch[0].getValue("displayname");
			var vendorname = itemSearch[0].getValue("vendorname");
			subList.setLineItemValue('displayname', itemLine, displayname);
			subList.setLineItemValue('vendorname', itemLine, vendorname);
			//20220519 add by zhou end
			subList.setLineItemValue('itemtyid', itemLine, inventorydetailSearch[n].getValue("internalid","item","MAX"));
			subList.setLineItemValue('receiptinventorynumber', itemLine, inventorydetailSearch[n].getText('inventorynumber',null,'GROUP'));
			subList.setLineItemValue('receiptinventorynumberid', itemLine, inventorydetailSearch[n].getValue('inventorynumber',null,'GROUP'));					
			subList.setLineItemValue('quantity', itemLine, invOkCount);			
			subList.setLineItemValue('inspectionlevel', itemLine, inventorydetailSearch[n].getValue('custitem_djkk_inspection_level','item','MAX'));
			
		
			
			var theprlink=nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inspection_list_pro','customdeploy_djkk_sl_inspection_list_pro');
			theprlink = theprlink + '&transactionID=' + inventorydetailSearch[n].getValue('internalid','transaction','MAX');
			theprlink = theprlink + '&itemID=' + inventorydetailSearch[n].getValue('internalid','item','MAX');
			theprlink = theprlink + '&inventoryID=' + inventorydetailSearch[n].getValue('internalid','inventorynumber','MAX');
			theprlink = theprlink + '&location=' + locationValue;
			theprlink = theprlink + '&subsidiary=' + subsidiaryValue;
			theprlink = theprlink + '&maxItemCount=' + invOkCount;
			theprlink = theprlink + '&binnumber=' + binnumber;
			
			
			
			var keyNum = key.indexOf( inventorydetailSearch[n].getValue("internalid","item","MAX")+"-"+inventorydetailSearch[n].getValue('inventorynumber',null,'GROUP'))
			if(keyNum >= 0){
				

				if(customrecord_djkk_inv_ipSearch[keyNum].getValue("custrecord_djkk_inv_ip_inspected") == 'T'){
					subList.setLineItemValue('state', itemLine, '���i�ς�');
				}else{
					subList.setLineItemValue('state', itemLine, '���i��');
				}
				
				subList.setLineItemValue('kenhinid', itemLine,customrecord_djkk_inv_ipSearch[keyNum].getValue("internalid",null) );

				theprlink += "&keyId="+customrecord_djkk_inv_ipSearch[keyNum].getValue("internalid",null)
				
				//�����ςݏꍇ�A���ړ��X�e�[�^�X�\��
				if(customrecord_djkk_inv_ipSearch[keyNum].getValue("custrecord_djkk_inv_ip_done") == 'T'){
					subList.setLineItemValue('state', itemLine, '�ړ��`�[�쐬�ς�');
					//���i�����s��
					theprlink="";
				}


			}else{
				subList.setLineItemValue('state', itemLine, '�����i');
				
				subList.setLineItemValue('kenhinid', itemLine,'-1' );
				
				theprlink += "&keyId=-1"
			}
			
			if(!isEmpty(theprlink)){
				subList.setLineItemValue('inspectionprocedureurl', itemLine, theprlink);
				
			}
			

			itemLine++;
		}
	}
	//status.setDefaultValue(1);
	form.addSubmitButton('�݌Ɉړ�')
	//form.addButton('sublist_upbtn', '�݌Ɉړ�','up()');
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