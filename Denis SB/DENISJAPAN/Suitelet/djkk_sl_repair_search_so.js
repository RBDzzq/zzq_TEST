/**
 * DJ_�C���i ����������
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/09/24     CPC_��
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	
	
	var selectFlg = request.getParameter('selectFlg');
	var serialValue = request.getParameter('serial');
	var subsidiaryValue = request.getParameter('subsidiary');
	//20220909 add by zhou U721
	var searchType = request.getParameter('searchType');
	var roleSub = getRoleSubsidiary();
	var soNumber = request.getParameter('soNumber');
	//end
	if(searchType == "S"){
		//��ʂ�����
		var form = nlapiCreateForm('����������', true);
		form.setScript('customscript_djkk_cs_repair_search_so');
		
		//���ڂ�ݒ�
		var serialField =  form.addField('custpage_serial', 'text', '�V���A��/���b�g�ԍ�');
		serialField.setDefaultValue(serialValue);
		
		var searchtypeField = form.addField('custpage_searchtype','text','�����W��')
		searchtypeField.setDefaultValue(searchType);
		searchtypeField.setDisplayType('hidden');
		
		var soField =  form.addField('custpage_so', 'text', '�����ԍ�');
		soField.setDefaultValue(soNumber );

		var subsidiaryField = form.addField('custpage_subsidiary', 'select', '�A��');
	//	 var roleSub = getRoleSubsidiary();
		 var subSearch = nlapiSearchRecord("subsidiary",null,
					[
					 	["custrecord_djkk_subsidiary_type","anyof",'2']
					], 
					[
					 	new nlobjSearchColumn("internalid"),
					 	new nlobjSearchColumn("name"),
					]
					);
		 if(subSearch != null){
			 var subArray = [];
			 subsidiaryField.addSelectOption('','') 
			 for(var i = 0; i < subSearch.length ; i++){
				 subsidiaryField.addSelectOption(subSearch[i].getValue("internalid"),subSearch[i].getValue("name")) ;
				 subArray.push(subSearch[i].getValue("internalid")) ;
			 }
		 }
		 
	//	 var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
		 
			if(!isEmpty(subsidiaryValue)){
				subsidiaryField.setDefaultValue(subsidiaryValue);
			}
		
		//�{�^���ݒ�
		if(selectFlg == 'T'){
			//form.addSubmitButton('�ݒ�')
			//form.addButton('btn_cloessearch', '�ݒ�', 'closesearch()')
			form.addButton('btn_return', '�����߂�','searchReturn()')
		}else{
			form.addButton('btn_search', '����', 'search()')
		}
		
		
		
		//�����ꍇ�ꗗ�ݒ�
		if(selectFlg == 'T'){
			
			serialField.setDisplayType('inline');
			subsidiaryField.setDisplayType('inline');
			soField.setDisplayType('inline');
			
			var subList = form.addSubList('list', 'list', '');
			subList.addField('check', 'checkbox', '�I��');
			subList.addField('so', 'text', 'SO�ԍ�');
			var soLink =  subList.addField('so_link', 'url', '������').setDisplayType('disabled');
			soLink.setLinkText('�\��');
			subList.addField('so_date', 'text', '���t');
			subList.addField('serial', 'text', '�V���A��/���b�g�ԍ�');
			subList.addField('item_id', 'text', '�A�C�e��ID').setDisplayType('hidden');
			subList.addField('item', 'text', '�A�C�e��');
			subList.addField('so_id', 'text', 'SO����ID').setDisplayType('hidden');
			subList.addField('unit', 'text', 'DJ_�P��');
			subList.addField('unit_id', 'text', 'DJ_�P�ʓ���ID').setDisplayType('hidden');
			subList.addField('irime', 'text', 'DJ_�����');
			subList.addField('location', 'text', 'DJ_�ꍇ');
			subList.addField('location_id', 'text', 'DJ_�ꍇ����ID').setDisplayType('hidden');
			subList.addField('inventorydetail_id', 'text', '�݌ɏڍד���ID').setDisplayType('hidden');
			
			//�����ݒ�
			var filiter = new Array();
			filiter.push(["transaction.type","anyof","SalesOrd"]);
			
			if(!isEmpty(serialValue)){
				filiter.push("AND");
				filiter.push(["inventorynumber.inventorynumber","contains",serialValue]);
			}
			
			if(!isEmpty(subsidiaryValue)){
				filiter.push("AND");
				filiter.push(["transaction.subsidiary","anyof",subsidiaryValue]);
			}else{
				filiter.push("AND");
				filiter.push(["transaction.subsidiary","anyof",subArray]);
			}
			
			if(!isEmpty(soNumber)){
				filiter.push("AND");
				filiter.push(["transaction.tranid","anyof",soNumber]);
			}
			
			var rst = getSearchResults("inventorydetail",null,filiter, 
					[
					   new nlobjSearchColumn("item",null,"GROUP"), 
					   new nlobjSearchColumn("internalid","item","GROUP"), 
					   new nlobjSearchColumn("internalid","transaction","GROUP"), 
					   new nlobjSearchColumn("tranid","transaction","GROUP"), 
					   new nlobjSearchColumn("inventorynumber",null,"GROUP"),
					   new nlobjSearchColumn("location",null,"GROUP"), 
					   new nlobjSearchColumn("saleunit","item","GROUP"),
					   new nlobjSearchColumn("custitem_djkk_perunitquantity","item","GROUP"),
					   new nlobjSearchColumn("internalid",null,"GROUP") ,
					   new nlobjSearchColumn("trandate","transaction","MAX").setSort(true)
					]
					);
			
			var line = 1;
			if(!isEmpty(rst)){
				for(var i = 0 ; i < rst.length ; i ++){
					subList.setLineItemValue('so_date', line, rst[i].getValue("trandate","transaction","MAX"));
					subList.setLineItemValue('so_id', line, rst[i].getValue("internalid","transaction","GROUP"));
					subList.setLineItemValue('so', line, rst[i].getValue("tranid","transaction","GROUP"));
					var theLink = nlapiResolveURL('RECORD', 'salesorder',rst[i].getValue("internalid","transaction","GROUP") ,'VIEW');
					subList.setLineItemValue('so_link', line, theLink);
					subList.setLineItemValue('item_id', line, rst[i].getValue("internalid","item","GROUP"));
					subList.setLineItemValue('item', line, rst[i].getText("item",null,"GROUP"));
					subList.setLineItemValue('serial', line, rst[i].getText("inventorynumber",null,"GROUP"));
					subList.setLineItemValue('location_id', line, rst[i].getValue("location",null,"GROUP"));
					subList.setLineItemValue('location', line, rst[i].getText("location",null,"GROUP"));
					subList.setLineItemValue('unit', line, rst[i].getText("saleunit","item","GROUP"));
					subList.setLineItemValue('unit_id', line, rst[i].getValue("saleunit","item","GROUP"));
					subList.setLineItemValue('irime', line, rst[i].getValue("custitem_djkk_perunitquantity","item","GROUP"));
					subList.setLineItemValue('inventorydetail_id', line, rst[i].getValue("internalid",null,"GROUP"));
					
					line++;
				}
			}
		}
	}else if(searchType == 'R'){
		//20220909 add by zhou U721
		//��ʂ�����
		var form = nlapiCreateForm('�C���i����', true);
		form.setScript('customscript_djkk_cs_repair_search_so');
		
		//���ڂ�ݒ�
		var serialField =  form.addField('custpage_serial', 'text', '�V���A��/���b�g�ԍ�');
		serialField.setDefaultValue(serialValue);
		 
		//���ڂ�ݒ�
		var soField =  form.addField('custpage_so', 'text', '�����ԍ�');
		soField.setDefaultValue(soNumber);
		
		var searchtypeField = form.addField('custpage_searchtype','text','�����W��')
		searchtypeField.setDefaultValue(searchType);
		searchtypeField.setDisplayType('hidden');
		
		var subsidiaryField = form.addField('custpage_subsidiary', 'select', '�A��');
		 var subSearch = nlapiSearchRecord("subsidiary",null,
					[
					 	["custrecord_djkk_subsidiary_type","anyof",'2']
					], 
					[
					 	new nlobjSearchColumn("internalid"),
					 	new nlobjSearchColumn("name"),
					]
					);
		 if(subSearch != null){
			 subsidiaryField.addSelectOption('','') 
			 var subArray = [];
			 for(var i = 0; i < subSearch.length ; i++){
				 subsidiaryField.addSelectOption(subSearch[i].getValue("internalid"),subSearch[i].getValue("name"));
				 subArray.push(subSearch[i].getValue("internalid"));
			 }
		 }
		 if(!isEmpty(subsidiaryValue)){
				subsidiaryField.setDefaultValue(subsidiaryValue);
		 }
		//�{�^���ݒ�
		if(selectFlg == 'T'){

			form.addButton('btn_return', '�����߂�','searchReturn()')
		}else{
			form.addButton('btn_search', '����', 'search()')
		}
		
		
		
		//�����ꍇ�ꗗ�ݒ�
		if(selectFlg == 'T'){
			
			serialField.setDisplayType('inline');
			subsidiaryField.setDisplayType('inline');
			soField.setDisplayType('inline');
			
			var subList = form.addSubList('list', 'list', '');
			subList.addField('check_repair', 'checkbox', '�I��');
			subList.addField('so', 'text', '�����ԍ�');
			var soLink =  subList.addField('so_link', 'url', '������').setDisplayType('disabled');
			soLink.setLinkText('�\��');
			subList.addField('repair', 'text', '�C���i�ԍ�');
			var soLink =  subList.addField('repair_link', 'url', '�C���i').setDisplayType('disabled');
			soLink.setLinkText('�\��');
			subList.addField('re_createdata', 'text', '�쐬��');
			subList.addField('re_serial_no', 'text', '�V���A���ԍ�');
			subList.addField('re_status', 'text', '�C���X�e�[�^�X');
			subList.addField('re_subsidiary', 'text', '�A��');
			subList.addField('re_item', 'text', '���i');
			//�C���i����
			subList.addField('list_item', 'text', '�A�C�e��');
			subList.addField('list_place', 'text', '�ꏊ');
			subList.addField('list_quantity', 'text', '����');
			subList.addField('list_bin', 'text', '�a����ۊǒI');
			subList.addField('list_cuslocation', 'text', '�a����݌ɏꏊ');
			subList.addField('list_conversionrate', 'text', '����');
			subList.addField('list_unit', 'text', '�P��');
			
			subList.addField('so_id', 'text', 'SO����ID').setDisplayType('hidden');
			subList.addField('item_id', 'text', '�A�C�e��ID').setDisplayType('hidden');
			subList.addField('unit_id', 'text', 'DJ_�P�ʓ���ID').setDisplayType('hidden');
			subList.addField('location_id', 'text', 'DJ_�ꍇ����ID').setDisplayType('hidden');
			subList.addField('inventorydetail_id', 'text', '�݌ɏڍד���ID').setDisplayType('hidden');
			subList.addField('cuslocationid', 'text', 'DJ_�a����݌ɏꏊid').setDisplayType('hidden');
			//�����ݒ�
			var filiter = new Array();
			if(!isEmpty(subsidiaryValue)){
				filiter.push(["custrecord_djkk_re_subsidiary","anyof",subsidiaryValue]);
			}else{
				filiter.push(["custrecord_djkk_re_subsidiary","anyof",subArray]);
			}
			if(!isEmpty(soNumber)){
				filiter.push("AND");
				filiter.push(["custrecord_djkk_re_salesorder","is",soNumber]);
			}
			if(!isEmpty(serialValue)){
				filiter.push("AND");
				filiter.push(["custrecord_djkk_re_serial_no","is",serialValue]);
			}
			var rst = getSearchResults("customrecord_djkk_repair",null,filiter, 
					[
					   new nlobjSearchColumn("internalid"), 
					   new nlobjSearchColumn("custrecord_djkk_re_salesorder_id"), 
					   new nlobjSearchColumn("custrecord_djkk_re_salesorder"), 
					   new nlobjSearchColumn("custrecord_djkk_re_createdata"), 
					   new nlobjSearchColumn("custrecord_djkk_re_serial_no"), 
					   new nlobjSearchColumn("custrecord_djkk_re_item"), 
					   new nlobjSearchColumn("custrecord_djkk_re_status"), 
					   new nlobjSearchColumn("custrecord_djkk_re_subsidiary"), 
					   new nlobjSearchColumn("custrecord_djkk_rd_item","CUSTRECORD_DJKK_RD_REPAIR",null), 
					   new nlobjSearchColumn("custrecord_djkk_rd_place","CUSTRECORD_DJKK_RD_REPAIR",null), 
					   new nlobjSearchColumn("custrecord_djkk_rd_quantity","CUSTRECORD_DJKK_RD_REPAIR",null), 
					   new nlobjSearchColumn("custrecord_djkk_rd_bin","CUSTRECORD_DJKK_RD_REPAIR",null), 
					   new nlobjSearchColumn("custrecord_djkk_rd_cuslocation","CUSTRECORD_DJKK_RD_REPAIR",null), 
					   new nlobjSearchColumn("custrecord_djkk_rd_conversionrate","CUSTRECORD_DJKK_RD_REPAIR",null), 
					   new nlobjSearchColumn("custrecord_djkk_rd_unit","CUSTRECORD_DJKK_RD_REPAIR",null), 
					   new nlobjSearchColumn("custrecord_djkk_rd_inventory_detai","CUSTRECORD_DJKK_RD_REPAIR",null),
					   new nlobjSearchColumn("name")
					]
					);
			
			var line = 1;
			if(!isEmpty(rst)){
				for(var i = 0 ; i < rst.length ; i++){
					var salesorderId =  rst[i].getValue('custrecord_djkk_re_salesorder_id')//
					var salesorder =  rst[i].getValue("custrecord_djkk_re_salesorder") 
					var createdata =  rst[i].getValue("custrecord_djkk_re_createdata")
					var serialNo =  rst[i].getValue("custrecord_djkk_re_serial_no")//
					var item =  rst[i].getText("custrecord_djkk_re_item")
					var status =  rst[i].getText("custrecord_djkk_re_status")
					var subsidiary =  rst[i].getText("custrecord_djkk_re_subsidiary")
					var subsidiaryId =  rst[i].getValue("custrecord_djkk_re_subsidiary")
					//�C���i����
					var itemValue = rst[i].getText("custrecord_djkk_rd_item","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_�A�C�e��
					var placeValue = rst[i].getText("custrecord_djkk_rd_place","CUSTRECORD_DJKK_RD_REPAIR",null) //DJ_�ꏊ 
					var quantityValue = rst[i].getValue("custrecord_djkk_rd_quantity","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_����
					var binValue = rst[i].getText("custrecord_djkk_rd_bin","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_�a����ۊǒI
					var cuslocationValue = rst[i].getText("custrecord_djkk_rd_cuslocation","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_�a����݌ɏꏊ
					var conversionrateValue = rst[i].getValue("custrecord_djkk_rd_conversionrate","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_����
					var unitValue = rst[i].getText("custrecord_djkk_rd_unit","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_�P��
					
					var itemId = rst[i].getValue("custrecord_djkk_rd_item","CUSTRECORD_DJKK_RD_REPAIR",null)//�A�C�e��id
					var placeId = rst[i].getValue("custrecord_djkk_rd_place","CUSTRECORD_DJKK_RD_REPAIR",null) //�ꏊ id
					var unitId = rst[i].getValue("custrecord_djkk_rd_unit","CUSTRECORD_DJKK_RD_REPAIR",null)//�P��id
					var inventory = rst[i].getValue("custrecord_djkk_rd_inventory_detai","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_�݌ɏڍ�
					var cuslocationId = rst[i].getValue("custrecord_djkk_rd_cuslocation","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_�a����݌ɏꏊid
					
					var repairId= rst[i].getValue("internalid");
					var repairName = rst[i].getValue("name");
					
					subList.setLineItemValue('so', line, salesorder);
					var theLink = nlapiResolveURL('RECORD', 'salesorder',salesorderId);
					subList.setLineItemValue('so_link', line, theLink);
					
					subList.setLineItemValue('repair', line, repairName);
					var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_repair',repairId);
					subList.setLineItemValue('repair_link', line, theLink);
					
					subList.setLineItemValue('re_createdata', line, createdata);
					subList.setLineItemValue('re_serial_no', line,serialNo);
					subList.setLineItemValue('re_item', line, item);
					subList.setLineItemValue('re_status', line, status);
					subList.setLineItemValue('re_subsidiary', line,subsidiary);
					//�C���i����
					subList.setLineItemValue('list_item', line,itemValue);
					subList.setLineItemValue('list_place', line,placeValue);
					subList.setLineItemValue('list_quantity', line,quantityValue);
					subList.setLineItemValue('list_bin', line,binValue);
					subList.setLineItemValue('list_cuslocation', line,cuslocationValue);
					subList.setLineItemValue('list_conversionrate', line,conversionrateValue);
					subList.setLineItemValue('list_unit', line,unitValue);
					subList.setLineItemValue('item_id', line,itemId);
					subList.setLineItemValue('unit_id', line,unitId);
					subList.setLineItemValue('location_id', line,placeId);
					subList.setLineItemValue('inventorydetail_id', line,inventory);
					subList.setLineItemValue('so_id', line, salesorderId);
					subList.setLineItemValue('cuslocationid', line, cuslocationId);
					line++;
				}
			}
		}
	}
	
	//end
	response.writePage(form);
}
