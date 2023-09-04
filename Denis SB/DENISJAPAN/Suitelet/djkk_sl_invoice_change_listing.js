/**
 * DJ_�������ύX���F�ꊇ�������(�H�i)
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/7/8     CPC_�v
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

function run(request, response){	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();	
	var str = "";
	var theCount = parseInt(request.getLineItemCount('list'));
	for(var i = 0 ; i < theCount; i++){
		var chk = request.getLineItemValue('list', 'chk', i+1);
		var invoice_id = request.getLineItemValue('list', 'invoice_id', i+1);
		var detail_no = request.getLineItemValue('list', 'detail_no', i+1);
		var unit_price = request.getLineItemValue('list', 'unit_price', i+1);
//		var item_no = request.getLineItemValue('list', 'item_no', i+1); //changed by song add CH661 end
		
		if(chk == 'T'){
		    // CH165 zheng 20230214 start
			//if(item_no == '�z����'){
				//str+=invoice_id+'_-999_'+unit_price+',';
			//}else{
				str+=invoice_id+'_'+detail_no+'_'+unit_price+',';
			//}
			// CH165 zheng 20230214 end
		}
	}
			
	scheduleparams['custscript_djkk_ss_inv_change_list'] = str;
	runBatch('customscript_djkk_ss_invoice_change', 'customdeploy_djkk_ss_invoice_change',scheduleparams);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

//�o�b�`��ԉ��
function logForm(request, response) {
	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_djkk_cs_invoice_listing');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_invoice_change');

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
//	 var hopeDeliveryDateValue = request.getParameter('hopeDeliveryDate');
	 var deliveryDateValue = request.getParameter('deliveryDate');
	 var beforeDateFlgValue = request.getParameter('beforeDateFlg');
	 
	var form = nlapiCreateForm('DJ_�������ύX���F�ꊇ�������(�H�i)', false);
	form.setScript('customscript_djkk_cs_invoice_listing');
		
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
	var itemField =form.addField('custpage_item', 'select', '�A�C�e��',null, 'select_group')
	//1226start CH168 ���������A�[�i��]�����[�i���ɏC�� step1
//	var hopeDeliveryDateField = form.addField('custpage_delivery_hopedate', 'date', 'DJ_�[�i��]��',null, 'select_group')

	var deliveryDateField = form.addField('custpage_delivery_date', 'date', 'DJ_�[�i��',null, 'select_group')
	var beforeDateFlgField = form.addField('custpage_beforedate_flg', 'checkbox', '�ȑO', 'null', 'select_group')
	//end
	var selectSub = getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	if(isEmpty(subsidiaryValue)){
		subsidiaryValue = selectSub;
	}	
	// add by zdj 20230831 start
	var currentRole = nlapiGetRole();
	var currentUser = nlapiGetUser();
	
	// add by zdj 20230831 end
	var searchinvoice = getSearchResults('invoice',null,
		
			[
				 ["mainline","is","F"],
				 "AND",
				 ["voided","is","F"],
				 "AND",
				 ["taxline","is","F"],
				 "AND",
				 ["createdfrom","isnotempty",""],//add by zhou 20230306  �쐬��NOT NULL
				 "AND",
				 ["subsidiary","anyof",subsidiaryValue],
				 "AND",
				 ["custbody_djkk_sales_checked_flag","is","F"],
//				 "AND",
//				 ["inventorydetail.internalidnumber","isnotempty",""], 
				 "AND", 
				[["custbody_djkk_cs_check_necessary","is","F"],"OR",[["custbody_djkk_cs_check_necessary","is","T"],"AND",["custbody_djkk_cs_check_confirmed","is","T"]]],
				 //add by zzq 20230901 start
				"AND", 
				["custbody_djkk_trans_appr_status","anyof","1","5","6","7"], 
				"AND", 
				["custbody_djkk_trans_appr_deal_flg","is","T"], 
				"AND", 
				[[["custbody_djkk_trans_appr_create_user","noneof","@CURRENT@"],"AND",["custbody_djkk_trans_appr_dev","anyof",currentRole],"AND",["custbody_djkk_trans_appr_create_role","noneof",currentRole]],"OR",[["formulanumeric: CASE WHEN {custbody_djkk_trans_appr_create_role} = {custbody_djkk_trans_appr_dev} THEN 1 ELSE 0 END","equalto","1"],"AND",["custbody_djkk_trans_appr_create_user","noneof","@CURRENT@"]]], 
				"AND", 
				[[["custbody_djkk_trans_appr_dev_user","anyof","@NONE@"]],"OR",[["custbody_djkk_trans_appr_dev_user","noneof","@NONE@"],"AND",["custbody_djkk_trans_appr_dev_user","anyof","@CURRENT@"]]],
				"AND",
	            ["status","anyof","CustInvc:D"],
				//�݌ɏڍ�
		        "AND",
		        [["inventorydetail.internalidnumber","isnotempty",""],"OR",[["item.type","anyof","OthCharge"],"AND",["item.subtype","anyof","Resale","Sale","Purchase"]]]
				 //add by zzq 20230901 end
			],
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("invoicenum"),
			   new nlobjSearchColumn("itemid","item",null),
			   new nlobjSearchColumn("internalid","item",null),
			   new nlobjSearchColumn("altname","customer",null),
			   new nlobjSearchColumn("entity"),
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
		var searchInvoice_name = defaultEmpty(searchinvoice[i].getText("entity"));//changed by zhou 20230306
		var searchInvoice_destination = defaultEmpty(searchinvoice[i].getText("custbody_djkk_delivery_destination"));
		var searchInvoice_createdfrom = defaultEmpty(searchinvoice[i].getText("createdfrom"));		
		var cystomerid = searchinvoice[i].getValue("entity");//changed by zhou 20230306  
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
        // CH165 zheng 20230213 start
        if (isEmpty(newInvoicedestinationid[i]) && isEmpty(newInvoicedestination[i])) {
            continue;
        }
        // CH165 zheng 20230213 end
		deliveryAddField.addSelectOption(newInvoicedestinationid[i],newInvoicedestination[i]);
	}
	salesorderField.addSelectOption('','');
	for(var i = 0; i < newInvoicecreatedfrom.length; i++){
        // CH165 zheng 20230213 start
        if (isEmpty(newInvoicecreatedfromid[i]) && isEmpty(newInvoicecreatedfrom[i])) {
            continue;
        }
        // CH165 zheng 20230213 end
		salesorderField.addSelectOption(newInvoicecreatedfromid[i],newInvoicecreatedfrom[i]);
	}
	
	 if(isEmpty(selectFlg)){
//		hopeDeliveryDateValue = nlapiDateToString(getTheNextDay());
		 //add by zhou CH612 20230529 start
//		deliveryDateValue = nlapiDateToString(getTheNextDay());
		deliveryDateValue = nlapiDateToString(getSystemTime());
		 //add by zhou CH612 20230529 end
	 }

	
	if(selectFlg == 'T'){
		subsidiaryField.setDisplayType('inline');
		invoiceField.setDisplayType('inline');			
		customerField.setDisplayType('inline');
		deliveryAddField.setDisplayType('inline');
		itemField.setDisplayType('inline');
		salesorderField.setDisplayType('inline');
		salesrepField.setDisplayType('inline');
		//CH168 step2 start
		//hopeDeliveryDateField.setDisplayType('inline');
		deliveryDateField.setDisplayType('inline');
		beforeDateFlgField.setDisplayType('inline');
		//end
	}else {
		
	}
	invoiceField.setDefaultValue(invoiceNoValue)
	subsidiaryField.setDefaultValue(subsidiaryValue)
	customerField.setDefaultValue(customerValue)
	deliveryAddField.setDefaultValue(deliveryAddValue)
	itemField.setDefaultValue(itemValue)
	salesorderField.setDefaultValue(salesorderValue)
	salesrepField.setDefaultValue(salesrepValue)
	//CH168 step3 start
//	hopeDeliveryDateField.setDefaultValue(hopeDeliveryDateValue)
	deliveryDateField.setDefaultValue(deliveryDateValue)
	beforeDateFlgField.setDefaultValue(beforeDateFlgValue)
	//end
	

	var subList = form.addSubList('list', 'list', '');
	subList.addMarkAllButtons();
	subList.addField('chk', 'checkbox', '�I��');
	subList.addField('delivery_hope_date', 'text', 'DJ_�[�i��');//DJ_�[�i��
	subList.addField('sales_customer', 'text', '�ڋq');	
	subList.addField('delivery_destination', 'text', 'DJ_�[�i��');
	subList.addField('invoice_no', 'text', '�������ԍ�');
	subList.addField('detail_no', 'text', '����NO');	
//    subList.addField('item_no', 'text', '�J�^���O�R�[�h');//changed by song add CH661
	subList.addField('item_name', 'text', '�A�C�e������');
	subList.addField('perunitquantity', 'text', 'DJ_���萔 ');//DJ_���萔 
	   //20230605 CH613 by zhou start
    var originalPricField = subList.addField('original_price', 'text', '�P��(���i�\)');
    //20230605 CH613 by zhou end
	var unitPriceField = subList.addField('unit_price', 'text', '�P��').setDisplayType('entry');
	unitPriceField.setDisplaySize(10);
	subList.addField('sales_quantity', 'text', '����');
	//20230605 CH613 by zzq start
	var currencyField = subList.addField('currency', 'select', '�ʉ�', 'currency').setDisplayType('inline');
	var currencyHiddenField = subList.addField('currency_hidden', 'select', '�ʉ�HIDDEN', 'currency').setDisplayType('hidden');
	//20230605 CH613 by zzq end
	subList.addField('price', 'text', '���z');
	subList.addField('deliverynote_header', 'text', 'DJ_�[�i�����l�w�b�_');//changed by song add CH661
	subList.addField('delivery_note', 'text', 'DJ_�[�i�����l���� ');//DJ_�[�i�����l����  changed by song add CH661
	subList.addField('department', 'text', '�Z�N�V���� ');//�Z�N�V���� 
//	subList.addField('sales_place', 'text', 'DJ_�ꏊ');//CH166�Ŕ�\��
	subList.addField('sales_place', 'text', 'DJ_�ꏊ');//20221220 CH187 DJ_�ꏊ�ĕ\��
	
	
	subList.addField('invoice_id', 'text', '�������ԍ�ID').setDisplayType('hidden');
	subList.addField('status', 'text', '�X�e�[�^�X').setDisplayType('hidden');
	subList.addField('sales_order', 'text', '�����ԍ�').setDisplayType('hidden');
	subList.addField('sales_employee', 'text', '�c�ƒS����').setDisplayType('hidden');
	subList.addField('sales_vendorname', 'text', '�d���揤�i�R�[�h').setDisplayType('hidden');
	subList.addField('secured', 'text', '�m�ۍς�').setDisplayType('hidden');
	subList.addField('sales_parent', 'text', 'DJ_�e�ꏊ').setDisplayType('hidden');
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
		// CH165 zheng 20230214 start
		//filit.push(["inventorydetail.internalidnumber","isnotempty",""]);
		filit.push([["inventorydetail.internalidnumber","isnotempty",""],"OR",[["item.type","anyof","OthCharge"],"AND",["item.subtype","anyof","Resale","Sale","Purchase"]]]);
		// CH165 zheng 20230214 end
		
		// U571 add by ycx
		filit.push("AND");
		filit.push([["custbody_djkk_cs_check_necessary","is","F"],"OR",[["custbody_djkk_cs_check_necessary","is","T"],"AND",["custbody_djkk_cs_check_confirmed","is","T"]]]);
		// U571 add end ycx 
		
		
		
		if(!isEmpty(invoiceNoValue)){
			filit.push("AND");
			filit.push(["internalid","anyof",invoiceNoValue]);
		}
		
		if(!isEmpty(subsidiaryValue)){
			filit.push("AND");
			filit.push(["subsidiary","anyof",subsidiaryValue]);
		}
		
		if(!isEmpty(customerValue)){
			filit.push("AND");
			filit.push(["entity","anyof",customerValue]);//20230306 changed by zhou
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
		
		//CH168 step4 start
//		if(!isEmpty(hopeDeliveryDateValue)){
//			filit.push("AND");
//			filit.push(["custbody_djkk_delivery_hopedate","on",hopeDeliveryDateValue]);
//		}
		if(!isEmpty(deliveryDateValue)){
			if(beforeDateFlgValue == 'T'){
				filit.push("AND");
				filit.push(["custbody_djkk_delivery_date","onorbefore",deliveryDateValue]);
			}else{				
				filit.push("AND");
				filit.push(["custbody_djkk_delivery_date","on",deliveryDateValue]);
			}
		}
		//add by zzq 20230901 start
		filit.push("AND");
        filit.push(   ["custbody_djkk_trans_appr_status","anyof","1","5","6","7"]);
        filit.push(  "AND");
        filit.push(  ["custbody_djkk_trans_appr_deal_flg","is","T"]);
        filit.push(  "AND");
        filit.push(  [[["custbody_djkk_trans_appr_create_user","noneof","@CURRENT@"],"AND",["custbody_djkk_trans_appr_dev","anyof",currentRole],"AND",["custbody_djkk_trans_appr_create_role","noneof",currentRole]],"OR",[["formulanumeric: CASE WHEN {custbody_djkk_trans_appr_create_role} = {custbody_djkk_trans_appr_dev} THEN 1 ELSE 0 END","equalto","1"],"AND",["custbody_djkk_trans_appr_create_user","noneof","@CURRENT@"]]]); 
        filit.push(  "AND");
        filit.push(  [[["custbody_djkk_trans_appr_dev_user","anyof","@NONE@"]],"OR",[["custbody_djkk_trans_appr_dev_user","noneof","@NONE@"],"AND",["custbody_djkk_trans_appr_dev_user","anyof","@CURRENT@"]]]);
        //add by zzq 20230901 end
		//end
	var invoiceSearch = nlapiSearchRecord("invoice",null,
			filit, 
			[
			   new nlobjSearchColumn("custbody_djkk_delivery_hopedate").setSort(false),// DJ_�[�i��]��
			   new nlobjSearchColumn("altname","customer",null).setSort(false), 
			   new nlobjSearchColumn("custbody_djkk_delivery_destination").setSort(false), 
			   new nlobjSearchColumn("invoicenum").setSort(false), 
			   new nlobjSearchColumn("line").setSort(false), 
			   new nlobjSearchColumn("createdfrom"), 

			   new nlobjSearchColumn("shippingcost"), 
			  
			   new nlobjSearchColumn("custitem_djkk_product_code","item",null),    //itemid  custitem_djkk_product_code
			   new nlobjSearchColumn("custitem_djkk_item_displayname","item",null), 
			   new nlobjSearchColumn("location"), 
			   new nlobjSearchColumn("vendorname","item",null),
			   //20230605 CH613 by zhou start
//			   new nlobjSearchColumn("rate"),
			   new nlobjSearchColumn("fxrate"),
			   new nlobjSearchColumn("custcol_djkk_original_price"), 
			   //20230605 CH613 by zhou end
			   new nlobjSearchColumn("quantity"), 
			 //20230605 CH613 by zzq start
//			   new nlobjSearchColumn("amount"), 
			   new nlobjSearchColumn("fxamount"), 
			   new nlobjSearchColumn("currency"), 
			 //20230605 CH613 by zzq end
			   new nlobjSearchColumn("quantitycommitted","item",null), 
			   new nlobjSearchColumn("shippingcost"),
			   new nlobjSearchColumn("salesrep"),
			   new nlobjSearchColumn("internalid"),
			   new nlobjSearchColumn("status"),
			   new nlobjSearchColumn("shipmethod"),
			   //20221220 add by zhou start CH187 start
			  
			   new nlobjSearchColumn("custcol_djkk_perunitquantity"),//DJ_���萔 �iDJ_���� �j
//			   new nlobjSearchColumn("custcol_djkk_line_deliverynotememo"),// DJ_�[�i�����l����
			   new nlobjSearchColumn("department"),//�Z�N�V���� 
			   new nlobjSearchColumn("location"),//�ꏊ(���׏ꏊ�擾)
			   new nlobjSearchColumn("item"),//itemid
			   new nlobjSearchColumn("itemType"),//itemType
			   new nlobjSearchColumn("custcol_djkk_deliverynotememo"),//���ׂ̔[�i�����l
			   //end
			   new nlobjSearchColumn("displayname","item",null),//���i�� changed by song add CH661
			   new nlobjSearchColumn("custbody_djkk_deliverynotememo"), //DJ_�[�i�����l changed by song add CH661
			]
			);
	


	if(!isEmpty(invoiceSearch)){
		var lineCount = 1;
		var inv = '';
		var invId = '';
		var fee = '';
		var shipmethod = '';
		
		var salesPlaceIdList = [];
		for(var i = 0 ; i < invoiceSearch.length ;i++){
		    var sales_placeid = invoiceSearch[i].getValue("location");
		    if (salesPlaceIdList.indexOf(sales_placeid) == -1) {
		        salesPlaceIdList.push(sales_placeid);
		    }
		}
		
		var locDic = getLocationInfo(salesPlaceIdList);
		for(var i = 0 ; i < invoiceSearch.length ;i++){
			var invoice_id  =invoiceSearch[i].getValue("internalid");
			var invoice_no  =invoiceSearch[i].getValue("invoicenum");			
			var status = invoiceSearch[i].getText("status");
			var detail_no = invoiceSearch[i].getValue("line");
			var sales_order  = invoiceSearch[i].getText("createdfrom");
//			var item_no = invoiceSearch[i].getValue("custitem_djkk_product_code","item",null);//changed by song add CH661
			var item_name = invoiceSearch[i].getValue("displayname","item",null);  //changed by song add CH661
			var sales_vendorname = invoiceSearch[i].getValue("vendorname","item",null);
			var sales_customer = invoiceSearch[i].getValue("altname","customer",null);
			//20221227 changed by zhou start
			//�����_����͂��Ȃ��悤�ɂ���B
			//20230606 CH613 by zzq start
//			var _unit_price = invoiceSearch[i].getValue("rate");
			var _unit_price = invoiceSearch[i].getValue("fxrate");
			var currency = invoiceSearch[i].getValue("currency");// �ʉ�
			//20230606 CH613 by zzq end
			var unit_price = isEmpty(_unit_price)  ? '0' : _unit_price;
			if(Number(unit_price)==0){
				unit_price = '0';
			}else if(currency == '1'){
				var priceStrArr = unit_price.split('.');
				unit_price =  priceStrArr[0];
			}
			//end
			//20230605 CH613 by zhou start
			var _original_price = invoiceSearch[i].getValue("custcol_djkk_original_price");
			var original_price = isEmpty(_original_price)  ? '' : _original_price;
			if(Number(original_price)==0){
			    original_price = '';
			//20230606 CH613 by zzq start
            }else if(currency == '1'){
            //20230606 CH613 by zzq end
                var originalPriceStrArr = original_price.split('.');
                original_price =  originalPriceStrArr[0];
            }
			//20230605 CH613 by zhou end
			var sales_quantity = Number(invoiceSearch[i].getValue("quantity")).toString().replace('-','');
			var secured = invoiceSearch[i].getValue("quantitycommitted","item",null);
			var delivery_destination = invoiceSearch[i].getText("custbody_djkk_delivery_destination");
			var sales_place = invoiceSearch[i].getText("location");
			var sales_placeid = invoiceSearch[i].getValue("location");
			// CH165 zheng 20230213 start
			var parent = '';
			if (sales_placeid) {
			    parent = locDic[sales_placeid]
			}

//            var locationSearch = nlapiSearchRecord("location",null,
//                    [
//                        ["internalid","anyof",sales_placeid]
//                    ],
//                    [
//                        new nlobjSearchColumn("custrecord_djkk_exsystem_parent_location")
//                    ]
//                    )
//            parent = locationSearch[0].getText("custrecord_djkk_exsystem_parent_location"); 

            // CH165 zheng 20230213 end
            var delivery_fee = invoiceSearch[i].getValue("shippingcost");
            //20230605 CH613 by zzq start
//            var price = Number(invoiceSearch[i].getValue("amount")).toString().replace('-','');
            var price = Number(invoiceSearch[i].getValue("fxamount")).toString().replace('-','');
            if(Number(price)==0){
                price = '0';
            }else if(currency == '1'){
                var amountStrArr = price.split('.');
                price =  amountStrArr[0];
            }
            //20230605 CH613 by zzq end
            //20221220 add by zhou start CH187 start
            var deliveryHopedate = invoiceSearch[i].getValue("custbody_djkk_delivery_date");// DJ_�[�i��]��
            var perunitQuantity = invoiceSearch[i].getValue("custcol_djkk_perunitquantity");//DJ_���萔 �iDJ_���� �j
//            var deliveryNoteMemo = invoiceSearch[i].getValue("custcol_djkk_line_deliverynotememo");// DJ_�[�i�����l����
            var department =  invoiceSearch[i].getText("department");//�Z�N�V���� 
            var location =  invoiceSearch[i].getText("location");//�ꏊ(���׏ꏊ�擾)
            var itemId =  invoiceSearch[i].getValue("item");//itemid
            var itemType = invoiceSearch[i].getValue("itemType");//itemType
            var itemDeliverynotememo = invoiceSearch[i].getValue("custcol_djkk_deliverynotememo");//���ׂ̔[�i�����l
               //end
            
            var sales_employee = invoiceSearch[i].getText("salesrep");
            var deliverynotememoHeader = invoiceSearch[i].getValue("custbody_djkk_deliverynotememo");//DJ_�[�i�����l changed by song add CH661
            // CH165 zheng 20230214 start
//          //CH165 add 2022/12/08 by song start
//          if(invId != invoice_id && invId != ''&&!isEmpty(shipmethod)){
//              deliveryNoteMemo = nlapiLookupField('invoice',invId,"custbody_djkk_deliverynotememo")
//              //20230110 changed by zhou CH252 start
//              //�������̃w�b�_�[�i�����l�͔z�����s�ɕ\������
//              subList.setLineItemValue('delivery_note', lineCount, deliveryNoteMemo);// DJ_�[�i�����l
//              //end
//              subList.setLineItemValue('invoice_no', lineCount, inv);
//              subList.setLineItemValue('invoice_id', lineCount, invId);
//              subList.setLineItemValue('item_no',lineCount, '�z����');
//              subList.setLineItemValue('unit_price', lineCount, fee);
//              
//              lineCount++;
//          }   
//          //CH165 add 2022/12/08 by song end
            // CH165 zheng 20230214 end
            
            
           
            
            subList.setLineItemValue('invoice_no', lineCount,invoice_no);
            subList.setLineItemValue('invoice_id', lineCount,invoice_id);
            subList.setLineItemValue('status', lineCount, status);
            subList.setLineItemValue('detail_no', lineCount,detail_no);
            subList.setLineItemValue('sales_order', lineCount, sales_order);
            // CH165 zheng 20230214 start
            // subList.setLineItemValue('item_no', lineCount,item_no);
          //changed by song add CH661 start
//            if (itemType == 'OthCharge') {
//                 subList.setLineItemValue('item_no', lineCount,'�z����');
//            } else {
//                 subList.setLineItemValue('item_no', lineCount,item_no);
//            }
          //changed by song add CH661 end
            // CH165 zheng 20230214 end
            subList.setLineItemValue('item_name', lineCount,item_name);
            subList.setLineItemValue('sales_vendorname', lineCount,sales_vendorname);
            subList.setLineItemValue('sales_customer', lineCount,sales_customer);
            subList.setLineItemValue('unit_price', lineCount,unit_price);
            //20230605 CH613 by zhou start
            subList.setLineItemValue('original_price', lineCount,original_price);
            //20230605 CH613 by zhou end
            subList.setLineItemValue('sales_quantity', lineCount,sales_quantity);
            subList.setLineItemValue('secured', lineCount,secured);
            subList.setLineItemValue('delivery_destination', lineCount,delivery_destination);
//          subList.setLineItemValue('sales_place', lineCount,sales_place);//CH166�Ŕ�\��
            subList.setLineItemValue('price', lineCount,price);
            //20230605 CH613 by zzq start
            subList.setLineItemValue('currency', lineCount,currency);
            subList.setLineItemValue('currency_hidden', lineCount,currency);
            //20230605 CH613 by zzq end
            subList.setLineItemValue('sales_employee', lineCount,sales_employee);
            subList.setLineItemValue('delivery_note', lineCount,itemDeliverynotememo);//changed by song add CH661
            subList.setLineItemValue('deliverynote_header', lineCount,deliverynotememoHeader);//changed by song add CH661
            // CH165 zheng 20230213 start
            if (parent) {
                subList.setLineItemValue('sales_parent', lineCount,parent);   
            }
            // CH165 zheng 20230213 end
            
            //20221220 add by zhou start CH187 start
            subList.setLineItemValue('delivery_hope_date', lineCount,deliveryHopedate);// DJ_�[�i��]��
            subList.setLineItemValue('perunitquantity', lineCount,perunitQuantity);//DJ_���萔 �iDJ_���� �j
            //20230110 changed by zhou CH252 start
            //�e���ׂ̔[�i�����l�͖��ׂɕ\������B
//            subList.setLineItemValue('delivery_note', lineCount, deliveryNoteMemo);// ���ׂ̔[�i�����l
            //end

            subList.setLineItemValue('department', lineCount,department);//�Z�N�V���� 
            subList.setLineItemValue('sales_place', lineCount,location);//�Z�N�V���� 
            //end
            inv = invoice_no;
            invId = invoice_id;
//          fee = isEmpty(delivery_fee) || Number(delivery_fee) == 0 ? '0' : delivery_fee;
            if(isEmpty(delivery_fee) || Number(delivery_fee) == 0){
                fee = '0';
            }else{
                var priceStrArr2 = delivery_fee.split('.');
                fee =  priceStrArr2[0];
            }
            shipmethod = invoiceSearch[i].getValue("shipmethod");
            lineCount++;
    
	}

		// CH165 zheng 20230214 start
		//�Ō�s
//		if(!isEmpty(shipmethod)){
//			nlapiLogExecution('debug', '�z����1','�z����1');
//			//20230110 changed by zhou CH252 start
//			//�������̃w�b�_�[�i�����l�͔z�����s�ɕ\������
//			subList.setLineItemValue('delivery_note', lineCount, deliveryNoteMemo);// DJ_�[�i�����l
//			//end
//			subList.setLineItemValue('invoice_no', lineCount, inv);
//			subList.setLineItemValue('invoice_id', lineCount, invId);
//			subList.setLineItemValue('item_no', lineCount, '�z����');
//			subList.setLineItemValue('unit_price', lineCount, fee);
//		}
		// CH165 zheng 20230214 end
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

function getLocationInfo (lcIdList) {
    
    var locDic = {};
    var locationSearch = nlapiSearchRecord("location",null,
            [
                ["internalid","anyof",lcIdList]
            ],
            [
                new nlobjSearchColumn("internalid"),
                new nlobjSearchColumn("custrecord_djkk_exsystem_parent_location")
            ]
            )
    if (locationSearch) {
        for (var i = 0; i < locationSearch.length; i++) {
            var id = locationSearch[i].getValue("internalid"); 
            var parent = locationSearch[i].getText("custrecord_djkk_exsystem_parent_location"); 
            locDic[id] = parent;
        }
    }
    
    return locDic;
}