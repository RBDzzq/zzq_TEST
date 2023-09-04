/**
 * DJ_�������ύX���F�ꊇ�������(LS)
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/13     CPC_��
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
		var invoice_id = request.getLineItemValue('list', 'invoice_id', i+1);
		var detail_no = request.getLineItemValue('list', 'detail_no', i+1);
		var unit_price = request.getLineItemValue('list', 'unit_price', i+1);
		var item_no = request.getLineItemValue('list', 'item_no', i+1);
		
		if(chk == 'T'){
			str+=invoice_id+'_'+detail_no+'_'+unit_price+',';
		}					
	}		
	scheduleparams['custscript_djkk_ss_inv_change_list_param'] = str;
	runBatch('customscript_djkk_ss_invoice_change_list', 'customdeploy_djkk_ss_invoice_change_list',scheduleparams);

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
	//�p�����[�^�擾
	 var selectFlg = request.getParameter('selectFlg');
	 var invoiceNoValue = request.getParameter('invoiceNo');
	 var subsidiaryValue = request.getParameter('subsidiary');
	 var customerValue = request.getParameter('customer');
	 var deliveryAddValue = request.getParameter('deliveryAdd');
	 var itemValue = request.getParameter('item');
	 var salesorderValue = request.getParameter('salesorder');
	 var salesrepValue = request.getParameter('salesrep');
	 var hopeDeliveryDateValue = request.getParameter('hopeDeliveryDate');
	 var hopeDeliveryDateEndValue = request.getParameter('hopeDeliveryDateEnd');//3.26 add geng todolist U674
	 var deliveryDateValue = request.getParameter('deliveryDate');
	 var deliveryDateEndValue = request.getParameter('deliveryDateEnd');//3.26 add geng todolist U674
	 var loadOutDateValue = request.getParameter('loadOutDate');//3.26 add geng todolist U674
	 var loadOutDateEndValue = request.getParameter('loadOutDateEnd');//3.26 add geng todolist U674
	 var userValue = request.getParameter('user');
	 var activeValue = request.getParameter('active');
	 
	 var form = nlapiCreateForm('DJ_�������ύX���F�ꊇ�������(LS)', false);
	 form.setScript('customscript_djkk_cs_invoice_change_list');
		
	 //��ʍ��ڒǉ�
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '�����߂�','searchReturn()')
		 form.addSubmitButton('�X�V')
	 }else{
		form.addButton('btn_search', '����', 'search()')
	 }
	 
	form.addFieldGroup('select_group', '����');
	var invoiceField = form.addField('custpage_invoice', 'select', '�������ԍ�',null, 'select_group')
	var salesorderField = form.addField('custpage_salesorder', 'select', '�������ԍ�',null, 'select_group')
	var salesrepField = form.addField('custpage_saler', 'select', '�c�ƒS����','employee', 'select_group')
	var subsidiaryField = form.addField('custpage_subsidiary', 'select', '�󒍉��','', 'select_group')
	var customerField = form.addField('custpage_customer', 'select', '�ڋq',null, 'select_group')
	var deliveryAddField =form.addField('custpage_delivery_destination', 'select', 'DJ_�[�i��',null, 'select_group')
	var userField =form.addField('custpage_user', 'select', 'DJ_���͎�',null, 'select_group')
	var activeField = form.addField('custpage_active', 'select', 'DJ_�Z�N�V����',null, 'select_group');
	var itemField =form.addField('custpage_item', 'select', '�A�C�e��',null, 'select_group')
	var hopeDeliveryDateField = form.addField('custpage_delivery_hopedate', 'date', 'DJ_�[�i��]��(RIOS)�J�n��',null, 'select_group')
	var hopeDeliveryDateEndField = form.addField('custpage_delivery_hopedate_end', 'date', 'DJ_�[�i��]��(RIOS)�I����',null, 'select_group');//3.26 add geng todolist U674
	var deliveryDateField = form.addField('custpage_delivery_date', 'date', 'DJ_�[�i���J�n��',null, 'select_group');//3.26 add geng todolist U674
	var deliveryDateEndField = form.addField('custpage_delivery_date_end', 'date', 'DJ_�[�i���I����',null, 'select_group');//3.26 add geng todolist U674
	var loadOutDateField = form.addField('custpage_load_out_date', 'date', 'DJ_�o�ד��J�n��',null, 'select_group');//3.26 add geng todolist U674
	var loadOutDateEndField = form.addField('custpage_load_out_date_end', 'date', 'DJ_�o�ד��I����',null, 'select_group');//3.26 add geng todolist U674
		
	var searchinvoice = getSearchResults('invoice',null,
			
			[
				 ["mainline","is","F"],
				 "AND",
				 ["voided","is","F"],
				 "AND",
				 ["taxline","is","F"],
				 "AND",
				 ["subsidiary","anyof",subsidiaryValue],
				 "AND",
				 ["custbody_djkk_sales_checked_flag","is","F"],
				 "AND",
				 ["inventorydetail.internalidnumber","isnotempty",""]
				 
			],
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("invoicenum"),
			   new nlobjSearchColumn("itemid","item",null),
			   new nlobjSearchColumn("internalid","item",null),
			   new nlobjSearchColumn("altname","customer",null),
			   new nlobjSearchColumn("internalid","customer",null),
			   new nlobjSearchColumn("custbody_djkk_delivery_destination"),
			   new nlobjSearchColumn("internalid","custbody_djkk_delivery_destination",null),
			   new nlobjSearchColumn("createdfrom"),
			   new nlobjSearchColumn("internalid","createdfrom",null),
			]
			);
	
	var invoiceinvoicenum = new Array();
	var invoiceinvoicenumNew = new Array();
	var invoiceitem = new Array();
	var invoicename = new Array();
	var invoicedestination = new Array();
	var invoicecreatedfrom = new Array();
	var invoicecreatedid = new Array();
	var invoicecystomerid = new Array();
	var invoicedestinationid = new Array();
	var	invoicecreatedfromid = new Array();
	var	invoicecreitemid = new Array();
	for(var i = 0; i<searchinvoice.length;i++){
		var searchInvoice_id = defaultEmpty(searchinvoice[i].getValue("internalid"))
		var searchInvoice_no  =defaultEmpty(searchinvoice[i].getValue("invoicenum"));	
		var searchInvoice_item = defaultEmpty(searchinvoice[i].getValue("itemid","item",null));
		var searchInvoice_name = defaultEmpty(searchinvoice[i].getValue("altname","customer",null));
		var searchInvoice_destination = defaultEmpty(searchinvoice[i].getText("custbody_djkk_delivery_destination"));
		var searchInvoice_createdfrom = defaultEmpty(searchinvoice[i].getText("createdfrom"));		
		var cystomerid = searchinvoice[i].getValue("internalid","customer",null);
		var destinationid = searchinvoice[i].getValue("internalid","custbody_djkk_delivery_destination",null);
		var itemid = searchinvoice[i].getValue("internalid","item",null);
		var createdfromid = searchinvoice[i].getValue("internalid","createdfrom",null);
			
		invoiceinvoicenum.push(searchInvoice_no);
		invoiceitem.push(searchInvoice_item);
		invoicename.push(searchInvoice_name);
		invoicedestination.push(searchInvoice_destination);
		invoicecreatedfrom.push(searchInvoice_createdfrom);		
		invoicecreatedid.push(searchInvoice_id);		
		invoicecystomerid.push(cystomerid);
		invoicedestinationid.push(destinationid);
		invoicecreatedfromid.push(createdfromid);
		invoicecreitemid.push(itemid);
		
	}
	var newInvoiceinvoicenum = unique1(invoiceinvoicenum);
	var newInvoiceitem = unique1(invoiceitem);
	var newInvoicename = unique1(invoicename);
	var newInvoicedestination = unique1(invoicedestination);
	var newInvoicecreatedfrom = unique1(invoicecreatedfrom);
	var newInvoicecreatedid = unique1(invoicecreatedid);
	var newInvoicecystomerid = unique1(invoicecystomerid);
	var newInvoicedestinationid = unique1(invoicedestinationid);
	var newInvoicecreatedfromid = unique1(invoicecreatedfromid);
	var newInvoicecreitemid = unique1(invoicecreitemid);
	
	invoiceField.addSelectOption('','');
	for(var i = 0; i < newInvoiceinvoicenum.length; i++){
		invoiceField.addSelectOption(newInvoicecreatedid[i],newInvoiceinvoicenum[i]);
	}
	
	itemField.addSelectOption('','');
	for(var i = 0; i < newInvoiceitem.length; i++){
		itemField.addSelectOption(newInvoicecreitemid[i],newInvoiceitem[i]);
	}
	customerField.addSelectOption('','');
	for(var i = 0; i < newInvoicename.length; i++){
		customerField.addSelectOption(newInvoicecystomerid[i],newInvoicename[i]);
	}
	deliveryAddField.addSelectOption('','');
	for(var i = 0; i < newInvoicedestination.length; i++){
		deliveryAddField.addSelectOption(newInvoicedestinationid[i],newInvoicedestination[i]);
	}
	salesorderField.addSelectOption('','');
	for(var i = 0; i < newInvoicecreatedfrom.length; i++){
		salesorderField.addSelectOption(newInvoicecreatedfromid[i],newInvoicecreatedfrom[i]);
	}
		
	var userRole=nlapiGetUser();
	var userRoleSearch = nlapiSearchRecord("employee",null,
			[
			   ["internalid","anyof",userRole]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false)
			]
			);
	var userName = userRoleSearch[0].getValue("entityid");	
		
	var employeeSearch = nlapiSearchRecord("employee",null,
			[
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false),
			   new nlobjSearchColumn("internalid")
			]
			);
	if(!isEmpty(employeeSearch)){
		userField.addSelectOption(userRole,userName);
		userField.addSelectOption('','');
		for(var i = 0; i<employeeSearch.length;i++ ){
			userField.addSelectOption(employeeSearch[i].getValue("internalid"),employeeSearch[i].getValue("entityid"));				
		}
	}
		
	var activeSearch = getSearchResults("department",null,
			[
			   ["custrecord_djkk_dp_subsidiary","anyof",subsidiaryValue]
			], 
			[
			   new nlobjSearchColumn("name"),
			   new nlobjSearchColumn("internalid")
			]
			);
	if(!isEmpty(activeSearch)){
		activeField.addSelectOption('', '');
		for(var i = 0; i<activeSearch.length;i++){
			activeField.addSelectOption(activeSearch[i].getValue("internalid"),activeSearch[i].getValue("name"));
		}
	}
			
	if(selectFlg == 'T'){
		subsidiaryField.setDisplayType('inline');
		invoiceField.setDisplayType('inline');			
		customerField.setDisplayType('inline');
		deliveryAddField.setDisplayType('inline');
		itemField.setDisplayType('inline');
		salesorderField.setDisplayType('inline');
		salesrepField.setDisplayType('inline');
		hopeDeliveryDateField.setDisplayType('inline');
		userField.setDisplayType('inline');		
		hopeDeliveryDateEndField.setDisplayType('inline');//3.26 add geng todolist U674
		deliveryDateField.setDisplayType('inline');  
		deliveryDateEndField.setDisplayType('inline');//3.26 add geng todolist U674
		loadOutDateField.setDisplayType('inline');//3.26 add geng todolist U674
		loadOutDateEndField.setDisplayType('inline');//3.26 add geng todolist U674
		activeField.setDisplayType('inline');
	}
		
	var selectSub = getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	if(isEmpty(subsidiaryValue)){
		subsidiaryValue = selectSub;
	}
	
	//�������̂ݎ��s����B
	if(isEmpty(selectFlg)){
		hopeDeliveryDateValue = nlapiDateToString(getTheNextDay());//3.25 add zhou todolist U673
		hopeDeliveryDateEndValue = nlapiDateToString(getTheNextDay());//3.25 add zhou todolist U673
		deliveryDateValue = nlapiDateToString(getTheNextDay());//3.25 add zhou todolist U673
		deliveryDateEndValue = nlapiDateToString(getTheNextDay());//3.25 add zhou todolist U673
		loadOutDateValue = nlapiDateToString(getSystemTime());//3.25 add zhou todolist U673
		loadOutDateEndValue = nlapiDateToString(getSystemTime());//3.25 add zhou todolist U673			
	}
			
	invoiceField.setDefaultValue(invoiceNoValue)
	subsidiaryField.setDefaultValue(subsidiaryValue)
	customerField.setDefaultValue(customerValue)
	deliveryAddField.setDefaultValue(deliveryAddValue)
	itemField.setDefaultValue(itemValue)     
	salesorderField.setDefaultValue(salesorderValue)
	salesrepField.setDefaultValue(salesrepValue)
	hopeDeliveryDateField.setDefaultValue(hopeDeliveryDateValue)
	hopeDeliveryDateEndField.setDefaultValue(hopeDeliveryDateEndValue)//3.26 add geng todolist U674
    deliveryDateField.setDefaultValue(deliveryDateValue)
    deliveryDateEndField.setDefaultValue(deliveryDateEndValue);//3.26 add geng todolist U674
	loadOutDateField.setDefaultValue(loadOutDateValue);//3.26 add geng todolist U674
	loadOutDateEndField.setDefaultValue(loadOutDateEndValue);//3.26 add geng todolist U674
	userField.setDefaultValue(userValue);
	activeField.setDefaultValue(activeValue);
	
	var subList = form.addSubList('list', 'list', '');
	subList.addMarkAllButtons();
	subList.addField('chk', 'checkbox', '�I��');
	subList.addField('invoice_no', 'text', '�������ԍ�');
	subList.addField('invoice_id', 'text', '�������ԍ�ID').setDisplayType('hidden');
	subList.addField('status', 'text', '�X�e�[�^�X');
	subList.addField('detail_no', 'text', '����NO');
    subList.addField('item_no', 'text', '�A�C�e��');	
	subList.addField('item_name', 'text', '�A�C�e������');
	subList.addField('sales_quantity', 'text', '����');
	subList.addField('unit', 'text', '�P��');
	subList.addField('unit_price', 'text', '�P��');	
	subList.addField('price', 'text', '�̔����i');
	subList.addField('secured', 'text', '�m�ۍς�');
	subList.addField('sales_vendorname', 'text', '�d���揤�i�R�[�h'); 
	subList.addField('sales_order', 'text', '�����ԍ�');
	subList.addField('sales_employee', 'text', '�c�ƒS����');
	subList.addField('sales_subsidiary', 'text', '�󒍉��');
	subList.addField('sales_customer', 'text', '�ڋq');
	subList.addField('billaddressee', 'text', '������'); //
	subList.addField('delivery_destination', 'text', 'DJ_�[�i��');
	subList.addField('delivery_hopedate', 'text', 'DJ_�[�i��]��(RIOS)');
	subList.addField('delivery_data', 'text', 'DJ_�[�i��');
	subList.addField('load_out_data', 'text', 'DJ_�o�ד�');//3.26 add geng todolist U674
	subList.addField('sales_place', 'text', 'DJ_�ꏊ');

	if(selectFlg == 'T'){		
		var filit = new Array();
		filit.push(["type","anyof","CustInvc"]);
		filit.push("AND");
		filit.push(["mainline","is","F"]);
		filit.push("AND");
		filit.push(["voided","is","F"]);
		filit.push("AND");
		filit.push(["taxline","is","F"]);
//		if(subsidiaryValue =='6' || subsidiaryValue == '7'){
		filit.push("AND");
		filit.push(["status","anyof","CustInvc:D"]);
//		    }
		
		//�c�ƃ`�F�b�N�t���O�A�`�F�b�N�ꍇ�ΏۊO�Ƃ���
		filit.push("AND");
		filit.push(["custbody_djkk_sales_checked_flag","is","F"]);
		
		//�݌ɏڍ�
		filit.push("AND");
		filit.push(["inventorydetail.internalidnumber","isnotempty",""]);
				
		if(!isEmpty(invoiceNoValue)){
			filit.push("AND");
			filit.push(["internalid","anyof",invoiceNoValue]);
		}	
		if(!isEmpty(subsidiaryValue)){
			filit.push("AND");
			filit.push(["subsidiary","anyof",subsidiaryValue]);
		}
		if(!isEmpty(userValue)){
			filit.push("AND");
			filit.push(["createdby","anyof",userValue]);
		}
		if(!isEmpty(activeValue)){
			filit.push("AND");
			filit.push(["department","anyof",activeValue]);
		}
		if(!isEmpty(customerValue)){
			filit.push("AND");
			filit.push(["customer.internalid","anyof",customerValue]);
		}
		
		if(!isEmpty(deliveryAddValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_destination","anyof",deliveryAddValue]);
		}
		
		if(!isEmpty( itemValue)){
			filit.push("AND");
			filit.push(["item","anyof",itemValue]);
		}
		
		if(!isEmpty( salesorderValue)){
			filit.push("AND");
			filit.push(["createdfrom.internalid","anyof",salesorderValue]);
		}
		
		if(!isEmpty( salesrepValue)){
			filit.push("AND");
			filit.push(["salesrep","anyof",salesrepValue]);
		}
		
		if(!isEmpty(hopeDeliveryDateValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_hopedate","onorafter",hopeDeliveryDateValue]);
		}
		
		//3.26 add geng todolist U674
		if(!isEmpty(hopeDeliveryDateEndValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_hopedate","onorbefore",hopeDeliveryDateEndValue]);
		}
		
		if(!isEmpty(deliveryDateValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","onorafter",deliveryDateValue]);
		}
		//3.26 add geng todolist U674
		if(!isEmpty(deliveryDateEndValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","onorbefore",deliveryDateEndValue]);
		}
		//3.26 add geng todolist U674
		if(!isEmpty(loadOutDateValue)){
			filit.push("AND");
			filit.push(["shipdate","onorafter",loadOutDateValue]);
		}
		//3.26 add geng todolist U674
		if(!isEmpty(loadOutDateEndValue)){
			filit.push("AND");
			filit.push(["shipdate","onorbefore",loadOutDateEndValue]);
		}
	var invoiceSearch = nlapiSearchRecord("invoice",null,
			filit, 
			[
			   new nlobjSearchColumn("invoicenum"), 
			   new nlobjSearchColumn("createdfrom"), 
			   new nlobjSearchColumn("altname","customer",null), 
			   new nlobjSearchColumn("custbody_djkk_delivery_destination"), 
			   new nlobjSearchColumn("custbody_djkk_delivery_date"), 
			   new nlobjSearchColumn("shippingcost"), 
			   new nlobjSearchColumn("line"), 
			   new nlobjSearchColumn("itemid","item",null), 
			   new nlobjSearchColumn("displayname","item",null),  //
			   new nlobjSearchColumn("vendorname","item",null), //�d���揤�i�R�[�h
			   new nlobjSearchColumn("location"), 
			   new nlobjSearchColumn("subsidiary"), 
			   new nlobjSearchColumn("rate"), 
			   new nlobjSearchColumn("quantity"), 
			   new nlobjSearchColumn("amount"), 
			   new nlobjSearchColumn("unit"), //�P��
			   new nlobjSearchColumn("custbody_djkk_delivery_hopedate"), 
			   new nlobjSearchColumn("quantitycommitted","item",null), 
			   new nlobjSearchColumn("shippingcost"),
			   new nlobjSearchColumn("salesrep"),
			   new nlobjSearchColumn("internalid"),
			   new nlobjSearchColumn("status"),
			   new nlobjSearchColumn("shipdate"),//3.26 add geng todolist U674
			   new nlobjSearchColumn("shipmethod"),
//			   new nlobjSearchColumn("transactionname","salesorder",null),
			   new nlobjSearchColumn("custbody_djkk_billaddresslist"),//������I��
			   new nlobjSearchColumn("entity")
			   
			]
			);
	
	if(!isEmpty(invoiceSearch)){
		var lineCount = 1;
		var inv = "";
		var invId = "";
		var fee = "";
		var shipmethod = "";
		for(var i = 0 ; i < invoiceSearch.length ;i++){
			var invoice_id  =invoiceSearch[i].getValue("internalid");
			var invoice_no  =invoiceSearch[i].getValue("invoicenum");
			var status = invoiceSearch[i].getText("status");
			var detail_no = invoiceSearch[i].getValue("line");
			var sales_order  = invoiceSearch[i].getText("createdfrom");
			var item_no = invoiceSearch[i].getValue("itemid","item",null);
			var item_name = invoiceSearch[i].getValue("displayname","item",null);
			var sales_subsidiary = invoiceSearch[i].getText("subsidiary");
			var sales_customer = invoiceSearch[i].getValue("altname","customer",null);
			var sales_vendorname = invoiceSearch[i].getValue("vendorname","item",null);
			var unit = invoiceSearch[i].getValue("unit");
//			var billaddressee = invoiceSearch[i].getValue("billaddressee");	
			var billaddressValue = invoiceSearch[i].getValue("custbody_djkk_billaddresslist");//������
			billaddressValue = billaddressValue.split(',');
			nlapiLogExecution('debug','billaddressValue',billaddressValue)
			var billaddressId = billaddressValue[0];//������id
			var billaddressLable =  billaddressValue[1];//������I��lable
			if(isEmpty(billaddressId)){
				var customer = invoiceSearch[i].getValue("entity");
				var customerSearch = nlapiSearchRecord("customer",null,
						[
						   ["isdefaultbilling","is","T"], 
						   "AND", 
						   ["internalid","anyof",customer]
						], 
						[
						   new nlobjSearchColumn("addresslabel")
						]
						);
				if(!isEmpty(customerSearch)){
					var billaddressLable =  customerSearch[0].getValue("addresslabel");//�f�t�H���g������Z�����x��
				}
			}
			var _unit_price = invoiceSearch[i].getValue("rate");
			var unit_price = isEmpty(_unit_price)  ? '0' : _unit_price;
			if(Number(unit_price)==0){
				unit_price = '0.00';
			}	
			var sales_quantity = Number(invoiceSearch[i].getValue("quantity")).toString().replace('-','');
			var secured = invoiceSearch[i].getValue("quantitycommitted","item",null);
			var delivery_data = invoiceSearch[i].getValue("custbody_djkk_delivery_date");
			var delivery_destination = invoiceSearch[i].getText("custbody_djkk_delivery_destination");
			var sales_place = invoiceSearch[i].getText("location");
			var delivery_fee = invoiceSearch[i].getValue("shippingcost");
			var price = Number(invoiceSearch[i].getValue("amount")).toString().replace('-','');
			var delivery_hopedate = invoiceSearch[i].getValue("custbody_djkk_delivery_hopedate");
			var delivery_shipdate = invoiceSearch[i].getValue("shipdate");//3.26 add geng todolist U674
			var sales_employee = invoiceSearch[i].getText("salesrep");
						
			subList.setLineItemValue('invoice_no', lineCount,invoice_no);
			subList.setLineItemValue('invoice_id', lineCount,invoice_id);
			subList.setLineItemValue('status', lineCount, status);
			subList.setLineItemValue('detail_no', lineCount,detail_no);
			subList.setLineItemValue('sales_order', lineCount, sales_order);
			subList.setLineItemValue('item_no', lineCount,item_no);
			subList.setLineItemValue('item_name', lineCount,item_name);
			subList.setLineItemValue('sales_vendorname', lineCount,sales_vendorname);
			subList.setLineItemValue('unit', lineCount,unit);
			subList.setLineItemValue('sales_subsidiary', lineCount,sales_subsidiary);
			subList.setLineItemValue('sales_customer', lineCount,sales_customer);
			subList.setLineItemValue('unit_price', lineCount,unit_price);
			subList.setLineItemValue('sales_quantity', lineCount,sales_quantity);
			subList.setLineItemValue('secured', lineCount,secured);
			subList.setLineItemValue('delivery_data', lineCount,delivery_data);
			subList.setLineItemValue('delivery_destination', lineCount,delivery_destination);
			subList.setLineItemValue('sales_place', lineCount,sales_place);
			subList.setLineItemValue('price', lineCount,price);
			subList.setLineItemValue('delivery_hopedate', lineCount,delivery_hopedate);
			subList.setLineItemValue('sales_employee', lineCount,sales_employee);
			subList.setLineItemValue('billaddressee', lineCount,billaddressLable);
			subList.setLineItemValue('load_out_data', lineCount, delivery_shipdate);//3.26 add geng todolist U674
			lineCount++;
	}	
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