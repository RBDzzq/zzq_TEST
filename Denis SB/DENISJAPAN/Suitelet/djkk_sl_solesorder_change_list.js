/**
 * DJ_�������ꊇ���F�C������
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/21      CPC_��
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
	var theCount = parseInt(request.getLineItemCount('list'));
	for(var i = 0 ; i < theCount; i++){
		var chk = request.getLineItemValue('list', 'chk', i+1);
		var sales_order_id = request.getLineItemValue('list', 'sales_order_id', i+1);
		var detail_no = request.getLineItemValue('list', 'detail_no', i+1);
		var unit_price = request.getLineItemValue('list', 'unit_price', i+1);
		var item_no = request.getLineItemValue('list', 'item_no', i+1);
		var sales_place_id = request.getLineItemValue('list', 'sales_place_id', i+1);
		
		if(chk == 'T'){
			if(item_no == '�z����'){
				str+=sales_order_id+'_-999_'+unit_price+',';
			}else{
				str+=sales_order_id+'_'+detail_no+'_'+unit_price+'_'+sales_place_id+',';
			}
			
		}
	}

	//CH700 zheng 20230711 start
	var strNew = '';
	var tmpSubsidiary = nlapiGetSubsidiary();
	var tmpRole = nlapiGetRole();
	var tmpUser = nlapiGetUser();
	strNew = tmpSubsidiary + '_' + tmpRole + '_' + tmpUser;
	scheduleparams['custscript_djkk_ss_salesorder_chg_parnew'] = strNew;
	//CH700 zheng 20230711 end
	scheduleparams['custscript_djkk_ss_salesorder_change_par'] = str;
	runBatch('customscript_djkk_ss_salesorder_change','customdeploy_djkk_ss_salesorder_change',scheduleparams);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

//�o�b�`��ԉ��
function logForm(request, response) {

	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_djkk_cs_salesorder_change');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_salesorder_change');

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
	 var soValue = request.getParameter('soNo');
	 var subsidiaryValue = request.getParameter('subsidiary');
	 var customerValue = request.getParameter('customer');
	 var locationValue = request.getParameter('location');//add by zhou U017
	 var deliveryAddValue = request.getParameter('deliveryAdd');
	 var itemValue = request.getParameter('item');
	 var salesrepValue = request.getParameter('salesrep');
	 var hopeDeliveryDateValue = request.getParameter('hopeDeliveryDate');
	 var hopeDeliveryDateEndValue = request.getParameter('hopeDeliveryDateEnd');//3.25 add zhou todolist U673
	 var deliveryDateValue = request.getParameter('deliveryDate');
	 var deliveryDateEndValue = request.getParameter('deliveryDateEnd');//3.25 add zhou todolist U673
	 var loadOutDateValue = request.getParameter('loadOutDate');//3.25 add zhou todolist U673
	 var loadOutDateEndValue = request.getParameter('loadOutDateEnd');//3.25 add zhou todolist U673
	 var admitValue = request.getParameter('admit'); // add by  sys  U374
	var form = nlapiCreateForm('DJ_�������ꊇ���F���', false);
	form.setScript('customscript_djkk_cs_salesorder_change');
		
	 //��ʍ��ڒǉ�
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '�����߂�','searchReturn()')
		 form.addSubmitButton('�X�V')
	 }else{
		form.addButton('btn_search', '����', 'search()')
	 }
	 

	form.addFieldGroup('select_group', '����');

	var subsidiaryField = form.addField('custpage_subsidiary', 'select', '�󒍉��', null,'select_group');
	 subsidiaryField.setMandatory(true);
	 var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	 if(isEmpty(subsidiaryValue)){
		 subsidiaryValue = selectSub;
	 }
	

	var soField = form.addField('custpage_salesorder', 'select', '�������ԍ�',null, 'select_group');
	// CH399 zheng 20230327 start
	var salesorderFilters = [];
	salesorderFilters.push(["mainline","is","F"]);
	salesorderFilters.push("AND");
	salesorderFilters.push(["voided","is","F"]);
	salesorderFilters.push("AND");
	salesorderFilters.push(["taxline","is","F"]);
	salesorderFilters.push("AND");
	salesorderFilters.push(["subsidiary","anyof",subsidiaryValue]);
	salesorderFilters.push("AND");
	salesorderFilters.push(["inventorydetail.internalidnumber","isnotempty",""]);
	salesorderFilters.push("AND");
	salesorderFilters.push(["itemnumber.quantityonhand","greaterthan","0"]);
	salesorderFilters.push("AND");
	if(admitValue == 'T'){
	    salesorderFilters.push(["status","anyof","SalesOrd:B","SalesOrd:D","SalesOrd:E","SalesOrd:F"]);
	} else {
	    salesorderFilters.push(["status","anyof","SalesOrd:A"]);
	}
	
	// CH399 zheng 20230327 end
	var soSearch = getSearchResults('salesorder',null,
			
	        salesorderFilters,
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("internalid"),

			]
			);

	var tranidArr = new Array();
	var internalidArr = new Array();
	if(!isEmpty(soSearch)){
		for(var i = 0; i<soSearch.length;i++){
			var searchSoName = defaultEmpty(soSearch[i].getValue("tranid"));
			var searchSoId = defaultEmpty(soSearch[i].getValue("internalid"));
			tranidArr.push(searchSoName); //�������ԍ�
			internalidArr.push(searchSoId);//����ID
		}
		var newtranidArr = unique1(tranidArr);//�������ԍ�
		var newInternalidArr = unique1(internalidArr);//����ID
		
		soField.addSelectOption('','');
		for(var i = 0; i < newtranidArr.length; i++){
			soField.addSelectOption(newInternalidArr[i],newtranidArr[i]);
		}
	}
	
	
	var salesrepField = form.addField('custpage_saler', 'select', '�c�ƒS����','', 'select_group');
	// CH399 zheng 20230327 start
	salesrepField.addSelectOption('','');
    var employeeSearch = getSearchResults("employee",null,
        [
           ["salesrep","is","T"], 
           "AND", 
           ["subsidiary","anyof",subsidiaryValue]
        ], 
        [
           new nlobjSearchColumn("internalid"), 
           new nlobjSearchColumn("entityid").setSort(false)
        ]
        );
    for(var i = 0; i<employeeSearch.length;i++){
        salesrepField.addSelectOption(employeeSearch[i].getValue("internalid"),employeeSearch[i].getValue('entityid'));
    }
	// CH399 zheng 20230327 end
	
	var customerField = form.addField('custpage_customer', 'select', '�ڋq',null, 'select_group');
	var customerSearch  = getSearchResults("customer",null,
			[
			 	["subsidiary","anyof",subsidiaryValue],
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("altname"),
			]
			);
		
	customerField.addSelectOption('','');
	for(var i = 0; i<customerSearch.length;i++){
		customerField.addSelectOption(customerSearch[i].getValue("internalid"),customerSearch[i].getValue('altname'));
	}
	
	
	if(subsidiaryValue!= SUB_SCETI && subsidiaryValue != SUB_DPKK){  // add by  sys  U374
		var admitField = form.addField('custpage_admit', 'checkbox', 'DJ_���F�ς�',null, 'select_group');
	}
	
	var locationField = form.addField('custpage_location', 'multiselect', 'DJ_�ꏊ',null, 'select_group');//add by zhouU017
	var deliveryAddField =form.addField('custpage_delivery_destination', 'select', 'DJ_�[�i��',null, 'select_group');
	var destinationSearch = getSearchResults("customrecord_djkk_delivery_destination",null,
			[
			   ["custrecord_djkk_delivery_subsidiary","anyof",subsidiaryValue]
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("custrecorddjkk_name")
			]
			);
	
	deliveryAddField.addSelectOption('', '');
	for(var i = 0; i<destinationSearch.length;i++){
		deliveryAddField.addSelectOption(destinationSearch[i].getValue("internalid"),destinationSearch[i].getValue('custrecorddjkk_name'));
	}
	
	
	var itemField =form.addField('custpage_item', 'select', '�A�C�e��',null, 'select_group');
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
	
	var hopeDeliveryDateField = form.addField('custpage_delivery_hopedate', 'date', 'DJ_�[�i��]���J�n��',null, 'select_group');
	var hopeDeliveryDateEndField = form.addField('custpage_delivery_hopedate_end', 'date', 'DJ_�[�i��]���I����',null, 'select_group');//3.25 add zhou todolist U673
	var deliveryDateField = form.addField('custpage_delivery_date', 'date', 'DJ_�[�i���J�n��',null, 'select_group');
	var deliveryDateEndField = form.addField('custpage_delivery_date_end', 'date', 'DJ_�[�i���I����',null, 'select_group');//3.25 add zhou todolist U673
	var loadOutDateField = form.addField('custpage_load_out_date', 'date', 'DJ_�o�ד��J�n��',null, 'select_group');//3.25 add zhou todolist U673
	var loadOutDateEndField = form.addField('custpage_load_out_date_end', 'date', 'DJ_�o�ד��I����',null, 'select_group');//3.25 add zhou todolist U673
	loadOutDateField.setDefaultValue(loadOutDateValue);
	
	if(isEmpty(subsidiaryValue)){
		subsidiaryValue =selectSub;
	}
	
	
	//�I��q�ɂ�ݒ肷��
	var filedLocationList = nlapiSearchRecord("location",null,
			[
			 ["subsidiary","anyof",subsidiaryValue],
			 "AND",
			 ["formulanumeric: LENGTH({externalid})","equalto","5"]
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("name").setSort(false)
			]
			);	
	locationField.addSelectOption('', '');
	if(filedLocationList != null){
		for(var i = 0; i<filedLocationList.length;i++){
			var locationName = filedLocationList[i].getValue("name")
			var locationId = filedLocationList[i].getValue("internalid")
			locationField.addSelectOption(locationId,locationName);
		}
	}	
//	subsidiaryValue != SUB_SCETI||subsidiaryValue != SUB_DPKK
	if(selectFlg == 'F'){
		if(subsidiaryValue == SUB_SCETI||subsidiaryValue == SUB_DPKK){
			locationField.setDisplayType('hidden');
		}
	}
	if(selectFlg == 'T'){		
		subsidiaryField.setDisplayType('inline');
		customerField.setDisplayType('inline');
		if(subsidiaryValue == SUB_SCETI||subsidiaryValue == SUB_DPKK){
			locationField.setDisplayType('hidden');
		}else{
			locationField.setDisplayType('inline');
		}
		deliveryAddField.setDisplayType('inline');
		itemField.setDisplayType('inline');
		soField.setDisplayType('inline');
		salesrepField.setDisplayType('inline');
		hopeDeliveryDateField.setDisplayType('inline');
		hopeDeliveryDateEndField.setDisplayType('inline');//3.25 add zhou todolist U673
		deliveryDateField.setDisplayType('inline');
		deliveryDateEndField.setDisplayType('inline');//3.25 add zhou todolist U673
		loadOutDateField.setDisplayType('inline');//3.25 add zhou todolist U673
		loadOutDateEndField.setDisplayType('inline');//3.25 add zhou todolist U673
		if(subsidiaryValue!= SUB_SCETI && subsidiaryValue != SUB_DPKK){
			admitField.setDisplayType('inline');
		}
	}
	

	
	//�������̂ݎ��s����B
	if(isEmpty(selectFlg)){
	    // CH399 zheng 20230324 start
		//hopeDeliveryDateValue = nlapiDateToString(getTheNextDay());//3.25 add zhou todolist U673
		//hopeDeliveryDateEndValue = nlapiDateToString(getTheNextDay());//3.25 add zhou todolist U673
		//deliveryDateValue = nlapiDateToString(getTheNextDay());//3.25 add zhou todolist U673
		//deliveryDateEndValue = nlapiDateToString(getTheNextDay());//3.25 add zhou todolist U673
		//loadOutDateValue = nlapiDateToString(getSystemTime());//3.25 add zhou todolist U673
		//loadOutDateEndValue = nlapiDateToString(getSystemTime());//3.25 add zhou todolist U673
		// CH399 zheng 20230324 end
	}
	
	subsidiaryField.setDefaultValue(subsidiaryValue);
	customerField.setDefaultValue(customerValue);
	if(!isEmpty(locationValue)){
		var locationArray = locationValue.split(',');
		locationField.setDefaultValue(locationArray);	
	}
	deliveryAddField.setDefaultValue(deliveryAddValue);
	itemField.setDefaultValue(itemValue);
	soField.setDefaultValue(soValue);
	salesrepField.setDefaultValue(salesrepValue);
	hopeDeliveryDateField.setDefaultValue(hopeDeliveryDateValue);
	hopeDeliveryDateEndField.setDefaultValue(hopeDeliveryDateEndValue);//3.25 add zhou todolist U673
	deliveryDateField.setDefaultValue(deliveryDateValue);
	deliveryDateEndField.setDefaultValue(deliveryDateEndValue);//3.25 add zhou todolist U673
	loadOutDateField.setDefaultValue(loadOutDateValue);//3.25 add zhou todolist U673
	loadOutDateEndField.setDefaultValue(loadOutDateEndValue);//3.25 add zhou todolist U673
	if(subsidiaryValue!= SUB_SCETI && subsidiaryValue != SUB_DPKK){
		admitField.setDefaultValue(admitValue); // by  sys U374
	}
	

	
	
	var subList = form.addSubList('list', 'list', '');
	subList.addMarkAllButtons();
	if(subsidiaryValue!= SUB_SCETI && subsidiaryValue != SUB_DPKK){ 
		subList.addField('chk', 'checkbox', '�z��');
	}else{
		subList.addField('chk', 'checkbox', '�I��');
	}
	subList.addField('sales_order', 'text', '�������ԍ�');
	subList.addField('status', 'text', '�X�e�[�^�X');
	subList.addField('sales_order_id', 'text', '�������ԍ�ID').setDisplayType('hidden');
	subList.addField('detail_no', 'text', '����NO');
	subList.addField('item_no', 'text', '�A�C�e��');
	subList.addField('item_name', 'text', '�A�C�e������');
	//changed by geng add start U076
	subList.addField('item_number', 'text', '�V���A��/���b�g�ԍ�');
	subList.addField('item_date', 'text', '�L������');
	subList.addField('item_lot_number', 'text', 'DJ_���[�J�[�������b�g�ԍ�');
	subList.addField('item_man_date', 'text', 'DJ_�����N����');
	// DENISJAPANDEV-1387 zheng 20230306 start
	// subList.addField('item_probably', 'text', 'DJ_�c�o�׉\����/DJ_�o�׉\������');
	subList.addField('item_probably', 'text', 'DJ_�o�׉\������');
	// DENISJAPANDEV-1387 zheng 20230306 end
	subList.addField('item_warehouse', 'text', 'DJ_�q�ɓ��ɔԍ�');
	subList.addField('item_smc_num', 'text', 'DJ_SMC�ԍ�');
	subList.addField('item_lote_remark', 'text', 'DJ_���b�g���}�[�N');
	subList.addField('item_lot_memo', 'text', 'DJ_���b�g����');
	//changed by geng add end U076
	subList.addField('sales_employee', 'text', '�c�ƒS����');
	subList.addField('sales_subsidiary', 'text', '�󒍉��');
	subList.addField('sales_customer', 'text', '�ڋq');
	subList.addField('unit_price', 'text', '�P��');//.setDisplayType('entry');
	subList.addField('sales_quantity', 'text', '����');
	subList.addField('price', 'text', '���z');
	subList.addField('secured', 'text', '�m�ۍς�');
	subList.addField('delivery_destination', 'text', 'DJ_�[�i��');
	subList.addField('delivery_hopedate', 'text', 'DJ_�[�i��]��(RIOS)');
	subList.addField('delivery_data', 'text', 'DJ_�[�i��');
	subList.addField('load_out_data', 'text', 'DJ_�o�ד�');
	subList.addField('sales_place', 'text', 'DJ_�ꏊ');
	subList.addField('sales_place_id', 'text', 'DJ_�ꏊID').setDisplayType('hidden');
	subList.addField('memo', 'text', 'DJ_�[�i�����l');
	//subList.addField('delivery_fee', 'text', '�z����').setDisplayType('entry');
	
//	subList.addField('manager_number', 'text', 'DJ_�Ǘ��ԍ�');
	
	if(selectFlg == 'T'){
		
		
		var filit = new Array();
		//��ޒ�����
		filit.push(["type","anyof","SalesOrd"]);
//		//���׍s
		filit.push("AND");
		filit.push(["mainline","is","F"]);
		//�����ȊO
		filit.push("AND");
		filit.push(["voided","is","F"]);
		//�ŋ����C���O��
		filit.push("AND");
		filit.push(["taxline","is","F"]);
		//
		// CH399 zheng 20230327 start
		//filit.push("AND");
		//filit.push(["formulanumeric: {quantity}-{quantitybilled}","notequalto","0"]);
		// CH399 zheng 20230327 end
		//������:�z���ۗ�B, ������:���F�ۗ�A, ������:�ꕔ�z������D E:�ꕔ�����ۗ��@F:�����ۗ��@�̂����ꂩ
//		filit.push("AND");
//		filit.push(["status","anyof","SalesOrd:A"]); 

//		filit.push("AND");
//		itemtype is �݌�
//		filit.push(["item.type","is","InvtPart"]);
		
		//�݌ɏڍ�
		filit.push("AND");
		filit.push(["inventorydetail.internalidnumber","isnotempty",""]);
		//�݌ɐ���
		filit.push("AND");
		filit.push(["itemnumber.quantityonhand","greaterthan","0"]);
		
		if(!isEmpty(subsidiaryValue)){
			filit.push("AND");
			filit.push(["subsidiary","anyof",subsidiaryValue]);
		}
		if(!isEmpty(customerValue)){
			filit.push("AND");
			filit.push(["customer.internalid","anyof",customerValue]);
		}
//		//add by zhou U017
		if(subsidiaryValue != SUB_SCETI||subsidiaryValue != SUB_DPKK){
			if(!isEmpty(locationValue)){
				var locationArray = locationValue.split(',');
				filit.push("AND");
				filit.push(["location","anyof",locationArray]);
			}
		}
		
		if(subsidiaryValue == SUB_SCETI || subsidiaryValue == SUB_DPKK){
			filit.push("AND");
			filit.push(["status","anyof","SalesOrd:A"]); 
		}else{
			if(admitValue == 'T'){
				filit.push("AND");
				// CH399 zheng 20230327 start
				// filit.push(["status","anyof","SalesOrd:B"]);
				filit.push(["status","anyof","SalesOrd:B","SalesOrd:D","SalesOrd:E","SalesOrd:F"]);
				// CH399 zheng 20230327 start
			}else{
				filit.push("AND");
				filit.push(["status","anyof","SalesOrd:A"]); 
			}
		}
		
		if(!isEmpty(deliveryAddValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_destination","anyof",deliveryAddValue]);
		}
		
		if(!isEmpty( itemValue)){
			filit.push("AND");
			filit.push(["item","anyof",itemValue]);
		}
		
		if(!isEmpty( soValue)){
			filit.push("AND");
			filit.push(["internalid","anyof",soValue]);
		}
		
		if(!isEmpty( salesrepValue)){
			filit.push("AND");
			filit.push(["salesrep","anyof",salesrepValue]);
		}
		if(!isEmpty(hopeDeliveryDateValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_hopedate","onorafter",hopeDeliveryDateValue]);
		}
		//3.25 add zhou todolist U673
		if(!isEmpty(hopeDeliveryDateEndValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_hopedate","onorbefore",hopeDeliveryDateEndValue]);
		}
		//not change
		if(!isEmpty(deliveryDateValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","onorafter",deliveryDateValue]);
		}
		//3.25 add zhou todolist U673
		if(!isEmpty(deliveryDateEndValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","onorbefore",deliveryDateEndValue]);
		}
		//3.25 add zhou todolist U673
		if(!isEmpty(loadOutDateValue)){
			filit.push("AND");
			filit.push(["shipdate","onorafter",loadOutDateValue]);
		}
		//3.25 add zhou todolist U673
		if(!isEmpty(loadOutDateEndValue)){
			filit.push("AND");
			filit.push(["shipdate","onorbefore",loadOutDateEndValue]);
		}
		
		
	var invoiceSearch = nlapiSearchRecord("salesorder",null,
			filit, 
	[
			   new nlobjSearchColumn("transactionname"), 
			   new nlobjSearchColumn("altname","customer",null), 
			   new nlobjSearchColumn("custbody_djkk_delivery_destination"), 
			   new nlobjSearchColumn("custbody_djkk_delivery_date"), 
			   new nlobjSearchColumn("shippingcost"), 
			   new nlobjSearchColumn("line"), 
			   new nlobjSearchColumn("itemid","item",null), 
			   new nlobjSearchColumn("salesdescription","item",null), 
			   new nlobjSearchColumn("location"), 
			   new nlobjSearchColumn("subsidiary"), 
			   new nlobjSearchColumn("rate"), 
			   new nlobjSearchColumn("quantity"), 
			   new nlobjSearchColumn("amount"), 
			   new nlobjSearchColumn("custbody_djkk_delivery_hopedate"), 
			   new nlobjSearchColumn("quantitycommitted","item",null), 
			   new nlobjSearchColumn("shippingcost"),
			   new nlobjSearchColumn("salesrep"),
			   new nlobjSearchColumn("internalid"),
			   new nlobjSearchColumn("status"),
			   new nlobjSearchColumn("shipmethod"),
			   new nlobjSearchColumn("shipdate"),//3.25 add zhou todolist U673
			   new nlobjSearchColumn("custcol_djkk_deliverynotememo"),
			   //add 05/07
			   new nlobjSearchColumn("islotitem","item"), 
			   new nlobjSearchColumn("isserialitem","item"), 
			   new nlobjSearchColumn("quantity","inventorydetail",null),  //����
			   //changed by geng add start U076
			   new nlobjSearchColumn("inventorynumber","inventoryDetail",null),   //�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j
			   new nlobjSearchColumn("expirationdate","inventoryDetail",null),   //�L������
			   
			]
			);
	

	var inventorynumberSearch = getSearchResults("inventorynumber",null,  //�݌ɔԍ�
			[
			], 
			[
				new nlobjSearchColumn("inventorynumber").setSort(false), //�Ǘ��ԍ�
				new nlobjSearchColumn("custitemnumber_djkk_smc_nmuber"),//SMC�ԍ�
				new nlobjSearchColumn("custitemnumber_djkk_maker_serial_number"),//���[�J�̐����ԍ� (�J�X�^��)
				new nlobjSearchColumn("custitemnumber_djkk_make_date"),//�����N���� (�J�X�^��)
				new nlobjSearchColumn("custitemnumber_djkk_shipment_date"),//DJ_�o�׉\������ (�J�X�^��)
				new nlobjSearchColumn("custitemnumber_djkk_lot_memo"),//DJ_���b�g����	 (�J�X�^��)
				new nlobjSearchColumn("custitemnumber_djkk_lot_remark"),//DJ_���b�g���}�[�N
				new nlobjSearchColumn("custitemnumber_djkk_warehouse_number"),//DJ_���b�g���}�[�N (�J�X�^��)
			]
			);
	var invenremarkArr  = new Array();
	if(!isEmpty(inventorynumberSearch)){
		for(var i = 0 ; i < inventorynumberSearch.length ; i++){
			invenremarkArr.push(inventorynumberSearch[i].getValue("inventorynumber"));
		}
	}
	//changed by geng add end U076
	
	
	if(!isEmpty(invoiceSearch)){
		var lineCount = 1;
		var so = "";
		var soId = "";
		var fee = "";
		var shipmethod = "";
		for(var i = 0 ; i < invoiceSearch.length ;i++){
			//5.7 start �V���A���^���b�g�݌ɏڍׂ���A�C�e���ƈ�ʍ݌ɃA�C�e��
			var islotitem  =invoiceSearch[i].getValue("islotitem","item");
			var isserialitem  =invoiceSearch[i].getValue("isserialitem","item");
			var quantity  =invoiceSearch[i].getValue("quantity","inventorydetail");
			if(((islotitem == "T" || isserialitem == "T") && (quantity != "" )) || (islotitem == "F" && isserialitem == "F") ){
			//5.7 end
			
			var inventoryQuan = invoiceSearch[i].getValue("quantity","inventoryDetail",null);
		
			
			var inventoryDate = invoiceSearch[i].getValue("expirationdate","inventoryDetail",null);//�L������
			var itemNumLot = invoiceSearch[i].getText("inventorynumber","inventoryDetail",null); 
			var itemNumLotValue = invoiceSearch[i].getValue("inventorynumber","inventoryDetail",null);
			var sales_order_id  =invoiceSearch[i].getValue("internalid");
			var status = invoiceSearch[i].getText("status");
			var detail_no = invoiceSearch[i].getValue("line");
			var sales_order  = invoiceSearch[i].getValue("transactionname");
			var item_no = invoiceSearch[i].getValue("itemid","item",null);
			var item_name = invoiceSearch[i].getValue("salesdescription","item",null);
			var sales_subsidiary = invoiceSearch[i].getText("subsidiary");
			var sales_customer = invoiceSearch[i].getValue("altname","customer",null);
			var _unit_price = invoiceSearch[i].getValue("rate");
			var unit_price = isEmpty(_unit_price)  ? '0' : _unit_price;
			
			var memo =  invoiceSearch[i].getValue("custcol_djkk_deliverynotememo");
			
			if(Number(unit_price)==0){
				unit_price = '0.00';
			}
			 //changed by geng add start U076
			invenremarkArr_index = invenremarkArr.indexOf(itemNumLot);
			if(invenremarkArr_index < 0){
				var smc_nmuber = '';
				var serial_number = '';
				var make_date = '';
				var shipment_date = '';
				var lot_remark = '';
				var make_date = '';
			}else{
				var smc_nmuber = inventorynumberSearch[invenremarkArr_index].getValue("custitemnumber_djkk_smc_nmuber"); //SMC�ԍ�
				var serial_number = inventorynumberSearch[invenremarkArr_index].getValue("custitemnumber_djkk_maker_serial_number"); //���[�J�̐����ԍ� (�J�X�^��)
				var make_date = inventorynumberSearch[invenremarkArr_index].getValue("custitemnumber_djkk_make_date"); //�����N���� (�J�X�^��)
				var shipment_date = inventorynumberSearch[invenremarkArr_index].getValue("custitemnumber_djkk_shipment_date"); //DJ_�o�׉\������ (�J�X�^��)
				var lot_memo = inventorynumberSearch[invenremarkArr_index].getValue("custitemnumber_djkk_lot_memo"); //DJ_���b�g����	 (�J�X�^��)
				var lot_remark = inventorynumberSearch[invenremarkArr_index].getValue("custitemnumber_djkk_lot_remark"); //DJ_���b�g���}�[�N
				var warehouse_number = inventorynumberSearch[invenremarkArr_index].getValue("custitemnumber_djkk_warehouse_number"); //DJ_���b�g���}�[�N (�J�X�^��)
			}
			//changed by geng add end U076
			var sales_quantity = Number(invoiceSearch[i].getValue("quantity")).toString().replace('-','');
			var secured = invoiceSearch[i].getValue("quantitycommitted","item",null);
			var delivery_data = invoiceSearch[i].getValue("custbody_djkk_delivery_date");
			var delivery_destination = invoiceSearch[i].getText("custbody_djkk_delivery_destination");
			var sales_place = invoiceSearch[i].getText("location");
			var sales_place_id = invoiceSearch[i].getValue("location");
			var delivery_fee = invoiceSearch[i].getValue("shippingcost");
			var price = Number(invoiceSearch[i].getValue("amount")).toString().replace('-','');
			var delivery_shipdate = invoiceSearch[i].getValue("shipdate");//3.25 add zhou todolist U673
			var delivery_hopedate = invoiceSearch[i].getValue("custbody_djkk_delivery_hopedate");
			var sales_employee = invoiceSearch[i].getText("salesrep");

//			if(subsidiaryValue != SUB_SCETI && subsidiaryValue!= SUB_DPKK){
//				if(soId != sales_order_id && !isEmpty(soId) && !isEmpty(shipmethod)){
//					subList.setLineItemValue('sales_order', lineCount, so);
//					subList.setLineItemValue('sales_order_id', lineCount, soId);
//					subList.setLineItemValue('item_no', lineCount, '�z����');
//					subList.setLineItemValue('unit_price', lineCount, fee);
//					lineCount++;
//				}
//			}
			
			subList.setLineItemValue('detail_no', lineCount, detail_no);
			subList.setLineItemValue('sales_order', lineCount, sales_order);
			subList.setLineItemValue('sales_order_id', lineCount, sales_order_id);
			subList.setLineItemValue('status', lineCount, status);
			subList.setLineItemValue('item_no', lineCount, item_no);
			subList.setLineItemValue('item_name', lineCount, item_name);
			subList.setLineItemValue('sales_subsidiary', lineCount, sales_subsidiary);
			subList.setLineItemValue('sales_customer', lineCount, sales_customer);
			subList.setLineItemValue('unit_price', lineCount, unit_price);
			subList.setLineItemValue('sales_quantity', lineCount,inventoryQuan );
	
			subList.setLineItemValue('secured', lineCount, secured );
			subList.setLineItemValue('delivery_data', lineCount, delivery_data);
			subList.setLineItemValue('delivery_destination', lineCount, delivery_destination);
			subList.setLineItemValue('sales_place', lineCount,sales_place);
			subList.setLineItemValue('sales_place_id', lineCount,sales_place_id);
			//subList.setLineItemValue('delivery_fee', lineCount, delivery_fee);
			subList.setLineItemValue('price', lineCount, price);
			subList.setLineItemValue('delivery_hopedate', lineCount, delivery_hopedate);
			subList.setLineItemValue('sales_employee', lineCount, sales_employee);
			subList.setLineItemValue('memo', lineCount, memo);
			subList.setLineItemValue('load_out_data', lineCount, delivery_shipdate);//3.25 add zhou todolist U673
			//changed by geng add start U076
			subList.setLineItemValue('item_number', lineCount, itemNumLot);
			
			subList.setLineItemValue('item_date', lineCount, inventoryDate);
			subList.setLineItemValue('item_lot_number', lineCount, serial_number);
			subList.setLineItemValue('item_man_date', lineCount, make_date);
			subList.setLineItemValue('item_probably', lineCount, shipment_date);
			subList.setLineItemValue('item_warehouse', lineCount, warehouse_number);
			subList.setLineItemValue('item_smc_num', lineCount, smc_nmuber);
			subList.setLineItemValue('item_lote_remark', lineCount, lot_remark);
			subList.setLineItemValue('item_lot_memo', lineCount, lot_memo);
			//changed by geng add end U076
			so = sales_order;
			soId = sales_order_id;
			fee = fee = isEmpty(delivery_fee) || Number(delivery_fee) == 0 ? '0.00' : delivery_fee;;
			shipmethod = invoiceSearch[i].getValue("shipmethod");
			lineCount++;
		}
		
		//�Ō�s
//			if(subsidiaryValue != SUB_SCETI && subsidiaryValue!= SUB_DPKK){
//				if(!isEmpty(shipmethod)){
//					subList.setLineItemValue('sales_order', lineCount, so);
//					subList.setLineItemValue('sales_order_id', lineCount, soId);
//					subList.setLineItemValue('item_no', lineCount, '�z����');
//					subList.setLineItemValue('unit_price', lineCount, fee);
//				}
//			}
	

		}	
		
//		for(var a = 0 ; a < itemNumLotValueArr.length ;a++){
//			var itemLotId = itemNumLotValueArr[a];
//			nlapiLogExecution('DEBUG', 'itemLotId', itemLotId);
//		}
		
		
		
	}
	}
		
	response.writePage(form);
}
function defaultEmpty(src){
	return src || '';
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