/**
 * DJ_�o�׏��-�o�׏����
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/01/18     CPC_�v
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	
	createForm(request, response);
}


function createForm(request, response){
  try{ 
	 var selectFlg = request.getParameter('selectFlg');
	 var orderValue = request.getParameter('order'); //�����ԍ�
	 var outOrderValue = request.getParameter('outorder'); //�O������No
	 var customerValue = request.getParameter('customer');//����.�ڋq
	 var custpoValue = request.getParameter('custpo');//����.DJ_��������ԍ�
	 //var orderdateValue = request.getParameter('orderdate');//����.���t
	 var delidateValue = request.getParameter('delidate'); //�����o��.�[�i��
	 var senddateValue = request.getParameter('senddate'); //����.DJ_�o�׎w������
	 var deliveryDestinationValue = request.getParameter('deliverydestination'); //����.�[�i��
	 //var creatdateValue = request.getParameter('creatdate');//����.�쐬��
	 // CH792 add by zdj 20230815 start
	 var delidateValueStart = request.getParameter('delidatestart'); //�����o��.�[�i���n��
	 var senddateValueStart = request.getParameter('senddatestart'); //����.DJ_�o�׎w�������n��
	 var locationValue = request.getParameter('location'); //�q��No
	 var stockValue = request.getParameter('stock'); //�J�^���O�R�[�h
	 var batchValue = request.getParameter('batch'); //�Ǘ��ԍ�
	 var subsValue = request.getParameter('subs'); //�q���
	 // CH792 add by zdj 20230815 end
	
	 var form = nlapiCreateForm('DJ_�o�׏����', false);
	 form.setScript('customscript_djkk_cs_stock_shipping_info');
		
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '�����߂�','searchReturn()');
	 }else{
		form.addButton('btn_search', '����', 'search()');
	 }
	 
	form.addFieldGroup('select_group', '����');
	// CH792 update by zdj 20230815 start
	//var orderField = form.addField('custpage_order', 'text', 'Order#',null, 'select_group'); //�����ԍ�
	var subsidiaryField = form.addField('custpage_subsidiary', 'select', '�q���',null, 'select_group'); //�q���
	var orderField = form.addField('custpage_order', 'text', 'NS������No',null, 'select_group'); //�����ԍ�
	var outOrderField = form.addField('custpage_out_order', 'text', '�O������No',null, 'select_group'); //�O������No
	//var customerField = form.addField('custpage_customer', 'select', 'Customer#',null, 'select_group'); //����.�ڋq
	var customerField = form.addField('custpage_customer', 'select', '�ڋq��',null, 'select_group'); //����.�ڋq
	//var custpoField = form.addField('custpage_custpo', 'text', 'Customer PO#',null, 'select_group'); //����.DJ_��������ԍ�
	//var orderdateField = form.addField('custpage_orderdate', 'date', 'Order Date',null, 'select_group'); //����.���t
	var custpoField = form.addField('custpage_custpo', 'text', '�ڋq����No',null, 'select_group'); //����.DJ_��������ԍ�
	//var delidateField = form.addField('custpage_delidate', 'date', 'Delivery Date',null, 'select_group'); //�����o��.�[�i��
	var locationField = form.addField('custpage_head_location', 'select', '�q��No',null, 'select_group'); //�q��No
	var deliveryDestinationField = form.addField('custpage_delivery_destination', 'select', '�[�i�於',null, 'select_group'); //����.�[�i�於
	var stockField = form.addField('custpage_head_stock', 'text', '�J�^���O�R�[�h',null, 'select_group'); //�J�^���O�R�[�h
	var batchField = form.addField('custpage_head_batch', 'text', '�Ǘ��ԍ�',null, 'select_group'); //�Ǘ��ԍ�
	var delidateFieldStart = form.addField('custpage_delidate_start', 'date', '�[�i���J�n��',null, 'select_group'); //�����o��.�[�i���n��
	var delidateField = form.addField('custpage_delidate', 'date', '�[�i���I����',null, 'select_group'); //�����o��.�[�i���I���	
	var senddateFieldStart = form.addField('custpage_senddate_start', 'date', '���M���J�n��',null, 'select_group'); //����.DJ_�o�׎w�������n��
	//var senddateField = form.addField('custpage_senddate', 'date', 'Send Date',null, 'select_group'); //����.DJ_�o�׎w������
	var senddateField = form.addField('custpage_senddate', 'date', '���M���I����',null, 'select_group'); //����.DJ_�o�׎w�������I���
	//var createrdateField = form.addField('custpage_createrdate', 'date', 'Create Date',null, 'select_group'); //����.�쐬��
	//var createrdateField = form.addField('custpage_createrdate', 'date', '�쐬��',null, 'select_group'); //����.�쐬��
	
	var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	if(subsValue){
	    selectSub = subsValue;
	}
	// CH792 update by zdj 20230815 end
	var customerSearch  = getSearchResults("customer",null,
			[
                ["subsidiary","anyof", selectSub],
                "AND",
                ["isinactive","is","F"]
			],
			[
			   new nlobjSearchColumn("entityid"),
			   new nlobjSearchColumn("companyname"),
			   new nlobjSearchColumn("internalid"),
			]
			);
	var custId = new Array();
	var custName = new Array();
	var custNameId = new Array();
	for(var i = 0; i<customerSearch.length;i++){
		var internalid = customerSearch[i].getValue("internalid");
		var entityid = customerSearch[i].getValue("entityid") + ' ' + customerSearch[i].getValue("companyname");
		
		custId.push(defaultEmpty(internalid));
		custNameId.push(defaultEmpty(entityid));
		// custName.push(defaultEmpty());
	}
	var newcustId = unique1(custId);
	// var newcustName = unique1(custName);
	var newcustNameId = unique1(custNameId);
	customerField.addSelectOption('','');
	for(var i = 0; i < newcustNameId.length; i++){
		customerField.addSelectOption(newcustId[i],newcustNameId[i]);
	}
	//�I��q�ɂ�ݒ肷��
	var filedLocationList = nlapiSearchRecord("location",null,
			[
               ["formulatext: case when LENGTH({custrecord_djkk_location_barcode}) >= 5 then 1 else 0 end","is","1"],
               "AND",
               ["subsidiary","anyof", selectSub],
               "AND",
               ["isinactive","is","F"]
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("custrecord_djkk_location_barcode").setSort(false),
			   new nlobjSearchColumn("namenohierarchy")
			]
			);	
	locationField.addSelectOption('', '');
	if(filedLocationList != null){
		for(var i = 0; i<filedLocationList.length;i++){
			var locationName = filedLocationList[i].getValue("namenohierarchy");
			var locationId = filedLocationList[i].getValue("internalid");
			locationField.addSelectOption(locationId,locationName);
		}
	}	

	//CH792 add by zdj 20230816 start
	var deliverySearch = getSearchResults("customrecord_djkk_delivery_destination",null,
			[
                ["custrecord_djkk_delivery_subsidiary","anyof", selectSub],
                "AND",
                ["isinactive","is","F"]
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("name")
			]
			);
	deliveryDestinationField.addSelectOption('', '');
	for(var i = 0; i<deliverySearch.length;i++){
		deliveryDestinationField.addSelectOption(deliverySearch[i].getValue("internalid"),deliverySearch[i].getValue('name'));
	}
	
	if(selectFlg == 'T'){
	    subsidiaryField.setDisplayType('inline');
		orderField.setDisplayType('inline');
		outOrderField.setDisplayType('inline');
		customerField.setDisplayType('inline');	
		custpoField.setDisplayType('inline');	
		//orderdateField.setDisplayType('inline');
		delidateFieldStart.setDisplayType('inline');
		delidateField.setDisplayType('inline');	
		senddateFieldStart.setDisplayType('inline');
		senddateField.setDisplayType('inline');	
		deliveryDestinationField.setDisplayType('inline');	
		locationField.setDisplayType('inline');
		stockField.setDisplayType('inline');
		batchField.setDisplayType('inline');
		//createrdateField.setDisplayType('inline');	
	} else {
	    subsidiaryField.setMandatory(true);
	}

	subsidiaryField.setDefaultValue(selectSub);
	orderField.setDefaultValue(orderValue);
	outOrderField.setDefaultValue(outOrderValue);
	customerField.setDefaultValue(customerValue);
	custpoField.setDefaultValue(custpoValue);
	//orderdateField.setDefaultValue(orderdateValue);
	delidateFieldStart.setDefaultValue(delidateValueStart);
	delidateField.setDefaultValue(delidateValue);
	senddateFieldStart.setDefaultValue(senddateValueStart);
	senddateField.setDefaultValue(senddateValue);
	deliveryDestinationField.setDefaultValue(deliveryDestinationValue);
	locationField.setDefaultValue(locationValue);
	stockField.setDefaultValue(stockValue);
	batchField.setDefaultValue(batchValue);
	//createrdateField.setDefaultValue(creatdateValue);
	
	var subList = form.addSubList('list', 'list', '');
//	subList.addField('custpage_ord', 'text', 'Order#');
//	subList.addField('custpage_cust', 'text', 'Customer#');
//	subList.addField('custpage_custname', 'text', 'CustomerName');
//	subList.addField('custpage_ordate', 'text', 'OrderDate');
//	subList.addField('custpage_delvdate', 'text', 'DelveryDate');
//	subList.addField('custpage_sedate', 'text', 'SendDate');
//	subList.addField('custpage_custtraind', 'text', 'CustPONo');
//	subList.addField('custpage_aggregation', 'text', '�W��');
//	subList.addField('custpage_deliveryfirst', 'text', '�z����');
//	subList.addField('custpage_injectiondate', 'text', '�󒍓�');
//	subList.addField('custpage_napinday', 'text', '�[�i��');
//	subList.addField('custpage_custpono', 'text', 'Cust PO No.');
//	subList.addField('custpage_shption', 'text', '�^�����l');
//	subList.addField('custpage_napinmemo', 'text', '�[�i�����l');
//	subList.addField('custpage_lienno', 'text', 'LineNo');
//	subList.addField('custpage_location', 'text', 'WH');
//	subList.addField('custpage_stock', 'text', 'Stock#');
//	subList.addField('custpage_batch', 'text', 'Batch��');
//	subList.addField('custpage_actbatch', 'text', 'ActBatch#');
//	subList.addField('custpage_batchdiff', 'text', 'Batch# Difference');
//	subList.addField('custpage_descri', 'text', 'Description');
//	subList.addField('custpage_qty', 'text', 'Qty');
//	subList.addField('custpage_actqty', 'text', 'ActQty');
//	subList.addField('custpage_qtydiff', 'text', 'Qty Difference');
//	subList.addField('custpage_dbb', 'text', 'DBB');
//	subList.addField('custpage_actdbb', 'text', 'ActDBB');
//	subList.addField('custpage_dbbdiff', 'text', 'DBB Difference');
//	subList.addField('custpage_remarks', 'text', 'Remarks');
//	subList.addField('custpage_actrema', 'text', 'ActRemarks');
//	subList.addField('custpage_remadiff', 'text', 'Remarks Difference');
//	subList.addField('custpage_recidate', 'text', 'RecieveDate');
//	subList.addField('custpage_ktraggre', 'text', 'KRT �W��#');
	
	// CH792 update by zdj 20230815 start
	subList.addField('custpage_ordate', 'text', '�󒍓�');
	subList.addField('custpage_emaildate', 'text', '���M��');
	subList.addField('custpage_recidate', 'text', 'Recv Date');
	subList.addField('custpage_delvdate', 'text', '�[�i��');
	subList.addField('custpage_ord', 'text', 'NS������No');
	subList.addField('custpage_outord', 'text', '�O������No');
	subList.addField('custpage_cust', 'text', '�ڋq�R�[�h');
	subList.addField('custpage_custname', 'text', '�ڋq��');
	subList.addField('custpage_deliverycode', 'text', '�[�i��R�[�h');
	subList.addField('custpage_deliveryfirst', 'text', '�[�i�於');
	subList.addField('custpage_custpono', 'text', '�ڋq����No');
	subList.addField('custpage_location', 'text', '�q��No');
	subList.addField('custpage_stock', 'text', '�J�^���O�R�[�h');
	subList.addField('custpage_descri', 'text', '���i��');
	subList.addField('custpage_qty', 'text', '����');
	subList.addField('custpage_actqty', 'text', 'KRT����');
	subList.addField('custpage_qtydiff', 'text', '���ʍ���');
	subList.addField('custpage_dbb', 'text', '�ܖ�����');
	subList.addField('custpage_actdbb', 'text', 'KRT�ܖ�����');
	subList.addField('custpage_dbbdiff', 'text', 'BBD����');
	subList.addField('custpage_batch', 'text', '�Ǘ��ԍ�');
	subList.addField('custpage_actbatch', 'text', 'KRT�Ǘ��ԍ�');
	subList.addField('custpage_batchdiff', 'text', '�Ǘ��ԍ�����');
	subList.addField('custpage_shption', 'text', '�^�����l');
	subList.addField('custpage_napinmemo', 'text', '�[�i�����l');
	subList.addField('custpage_ktraggre', 'text', 'KRT �W��#');
	subList.addField('custpage_sedate', 'text', '���M����');
	// CH792 update by zdj 20230815 end

	if(selectFlg == 'T'){	
		var filit = new Array();
		filit.push(["type","anyof","SalesOrd"]);
		
		filit.push("AND");
		filit.push(["mainline","is","F"]);
		//�����ȊO
		filit.push("AND");
		filit.push(["voided","is","F"]);
		//�ŋ����C���O��
		filit.push("AND");
		filit.push(["taxline","is","F"]);
		//�o�׍s
		filit.push("AND");
		filit.push(["shipping","is","F"]);

	    if(!isEmpty(selectSub)){ // �q���
	        filit.push("AND");
	        filit.push(["subsidiary","anyof", selectSub]);
	    }
	      
		if(!isEmpty(orderValue)){ // �����ԍ�
			filit.push("AND");
			filit.push(["tranid","anyof",orderValue]);
		}
		// CH792 add by zdj 20230816 start
		if(!isEmpty(outOrderValue)){ // �O������No
			filit.push("AND");
			filit.push(["custbody_djkk_exsystem_tranid","is",outOrderValue]);
		}
		// CH792 add by zdj 20230816 end
		if(!isEmpty(customerValue)){//�ڋq
			filit.push("AND");
			filit.push(["entity","anyof",customerValue]);
		}
		// CH792 add by zdj 20230816 start
		if(!isEmpty(deliveryDestinationValue)){//�[�i��
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_destination","anyof",deliveryDestinationValue]);
		}
		// CH792 add by zdj 20230816 end
		if(!isEmpty(custpoValue)){ // DJ_��������ԍ�
			filit.push("AND");
			filit.push(["custbody_djkk_customerorderno","is",custpoValue]);
		}
//		if(!isEmpty(orderdateValue)){ //���t
//			filit.push("AND");
//			filit.push(["trandate","onorbefore",orderdateValue]);
//		}
		// CH792 ADD BY ZDJ 20230815 START
		if(!isEmpty(delidateValueStart) && !isEmpty(delidateValue) && Date.parse(delidateValue) > Date.parse(delidateValueStart)){ //DJ_�[�i��
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","within",delidateValueStart,delidateValue]);
		}
		if(!isEmpty(delidateValueStart) && !isEmpty(delidateValue) && Date.parse(delidateValue) == Date.parse(delidateValueStart)){ //DJ_�[�i��
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","on",delidateValueStart]);
		}
		if(!isEmpty(delidateValue) && isEmpty(delidateValueStart)){ //DJ_�[�i��
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","onorbefore",delidateValue]);
		}
		if(!isEmpty(delidateValueStart) && isEmpty(delidateValue)){ //DJ_�[�i��
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","onorafter",delidateValueStart]);
		}
		if(!isEmpty(delidateValueStart) && !isEmpty(delidateValue) && Date.parse(delidateValueStart) > Date.parse(delidateValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","within",'2023-1-1','2023-1-1']);
		}
		if(!isEmpty(senddateValueStart) && !isEmpty(senddateValue) && Date.parse(senddateValue) > Date.parse(senddateValueStart)){ //DJ_�o�׎w������
			filit.push("AND");
			filit.push(["custbody_djkk_shippinginstructdt","within",senddateValueStart,senddateValue]);
		}
		if(!isEmpty(senddateValueStart) && !isEmpty(senddateValue) && Date.parse(senddateValue) == Date.parse(senddateValueStart)){ //DJ_�o�׎w������
			filit.push("AND");
			filit.push(["custbody_djkk_shippinginstructdt","on",senddateValueStart]);
		}
		if(!isEmpty(senddateValue) && isEmpty(senddateValueStart)){ //DJ_�o�׎w������
			filit.push("AND");
			filit.push(["custbody_djkk_shippinginstructdt","onorbefore",senddateValue]);
		}
		if(!isEmpty(senddateValueStart) && isEmpty(senddateValue)){ //DJ_�o�׎w������
			filit.push("AND");
			filit.push(["custbody_djkk_shippinginstructdt","onorafter",senddateValueStart]);
		}
		if(!isEmpty(senddateValueStart) && !isEmpty(senddateValue) && Date.parse(senddateValueStart) > Date.parse(senddateValue)){ //DJ_�o�׎w������
			filit.push("AND");
			filit.push(["custbody_djkk_shippinginstructdt","within",'2023-1-1','2023-1-1']);
		}
		if(!isEmpty(locationValue)){
			var locationId = nlapiLookupField('location', locationValue, 'custrecord_djkk_location_barcode')
			if(!isEmpty(locationId)){ //�q��No
				filit.push("AND");
				filit.push(["location.custrecord_djkk_location_barcode","is",locationId]);
			}
		}
		if(!isEmpty(stockValue)){ //DJ_�J�^���O���i�R�[�h 
			filit.push("AND");
			filit.push(["item.custitem_djkk_product_code","is",stockValue]);
		}
		if(!isEmpty(batchValue)){
			//�V���A��/���b�g�ԍ� 
			filit.push("AND");
			var filitArr = ["formulanumeric: CASE WHEN {inventorydetail.inventorynumber} = '" + batchValue + "' THEN 1 ELSE 0 END","equalto","1"];
			//filit.push(["inventorydetail.inventorynumber","anyof",batchValue]);
			filit.push(filitArr);
		}
		// CH792 ADD BY ZDJ 20230815 END
//		if(!isEmpty(creatdateValue)){ //�쐬��
//			filit.push("AND");
//			filit.push(["datecreated","onorbefore",creatdateValue]);
//		}
		
		
		var salesorderSearch = getSearchResults("salesorder",null,
				[
				 	filit, 
				], 
				[
				   new nlobjSearchColumn("tranid"), 
				   new nlobjSearchColumn("companyname","customer",null),
				   new nlobjSearchColumn("entityid","customer",null),
				   new nlobjSearchColumn("trandate"), 
				   new nlobjSearchColumn("custbody_djkk_delivery_date"), 
				   new nlobjSearchColumn("custbody_djkk_shippinginstructdt"),
				   new nlobjSearchColumn("custbody_djkk_customerorderno"), 
				   new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null),
				   // CH792 delete by zdj 20230815 start
				   //new nlobjSearchColumn("custbody_djkk_annotation_day"),
				   // CH792 delete by zdj 20230815 end
				   new nlobjSearchColumn("custbody_djkk_deliverermemo1"), 
				   new nlobjSearchColumn("custbody_djkk_deliverynotememo"), 
				   // CH792 delete by zdj 20230815 start
				   // new nlobjSearchColumn("line"), 
				   // CH792 delete by zdj 20230815 end
				   // CH792 update by zdj 20230815 start
				   //new nlobjSearchColumn("location"), 
				   new nlobjSearchColumn("custrecord_djkk_location_barcode","location",null),
				   // CH792 update by zdj 20230815 end
				   new nlobjSearchColumn("custitem_djkk_product_code","item",null),
				   new nlobjSearchColumn("serialnumbers"), 
				   new nlobjSearchColumn("internalid","fulfillingTransaction",null),
				   new nlobjSearchColumn("custitem_djkk_product_name_jpline1","item",null), 
				   new nlobjSearchColumn("custitem_djkk_product_name_jpline2","item",null),
				   new nlobjSearchColumn("quantity"), 
				   new nlobjSearchColumn("inventorynumber","inventoryDetail",null),   //�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j
				   new nlobjSearchColumn("expirationdate","inventoryDetail",null), 
				   // CH792 delete by zdj 20230815 start
				   // new nlobjSearchColumn("custcol_djkk_customer_order_number"),  
				   // CH792 delete by zdj 20230815 end
				   // CH792 add by zdj 20230815 start
				   new nlobjSearchColumn("custbody_djkk_exsystem_tranid"),   // DJ_�O���V�X�e���A�g_�����ԍ�
				   new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null),
				   // CH792 add by zdj 20230815 end
				]
				);
		
		
		
		var itemfulfillSearch = getSearchResults("itemfulfillment",null,
				[
				   ["type","anyof","ItemShip"],
				   "AND",
				   ["taxline","is","F"], 
				    "AND", 
				   ["mainline","is","T"],
                   "AND", 
                   ["subsidiary","anyof", selectSub]
				], 
				[
				 	new nlobjSearchColumn("internalid"),
				 	new nlobjSearchColumn("serialnumbers"),
				 	new nlobjSearchColumn("quantity"), 
				 	new nlobjSearchColumn("expirationdate","inventoryDetail",null),
				 	new nlobjSearchColumn("custcol_djkk_line_memo"),
				 	new nlobjSearchColumn("custcol_djkk_summarize_order_no"),
				 	new nlobjSearchColumn("trandate"),
				 	
				]
				);
		var itemfulfillArr = new Array();
		if(!isEmpty(itemfulfillSearch)){
			for(var i = 0 ; i < itemfulfillSearch.length ;i++){
				itemfulfillArr.push(itemfulfillSearch[i].getValue("internalid"));	
			}
		}
		
//		var inventorynumberSearch = getSearchResults("inventorynumber",null,  //�݌ɔԍ�
//				[
//				], 
//				[
//					new nlobjSearchColumn("inventorynumber").setSort(false), //�Ǘ��ԍ�
//					new nlobjSearchColumn("custitemnumber_djkk_lot_remark"),//DJ_���b�g���}�[�N
//				]
//				);
//		var invenremarkArr  = new Array();
//		if(!isEmpty(inventorynumberSearch)){
//			for(var i = 0 ; i < inventorynumberSearch.length ; i++){
//				invenremarkArr.push(inventorynumberSearch[i].getValue("inventorynumber"));
//			}
//		}

		if(!isEmpty(salesorderSearch)){
			var lineCount = 1;
			for(var i = 0 ; i < salesorderSearch.length ;i++){
				//nlapiLogExecution('DEBUG', 'salesorderSearch.length', salesorderSearch.length);
				var tranid = salesorderSearch[i].getValue("tranid");//�����ԍ�
				// CH792 add by zdj 20230815 start
				var exsystemTranid = salesorderSearch[i].getValue("custbody_djkk_exsystem_tranid");//DJ_�O���V�X�e���A�g_�����ԍ�
				// CH792 add by zdj 20230815 end
				var custName = salesorderSearch[i].getValue("companyname","customer",null);//�ڋq��
				var custId = salesorderSearch[i].getValue("entityid","customer",null);//�ڋqID
				var trandate = salesorderSearch[i].getValue("trandate");//���t
				var deliDate = salesorderSearch[i].getValue("custbody_djkk_delivery_date");//�[�i��
				var shippinginstructdt = salesorderSearch[i].getValue("custbody_djkk_shippinginstructdt");//DJ_�o�׎w������
				nlapiLogExecution('DEBUG', 'shippinginstructdt', shippinginstructdt);
				var shippinginstructdtArr = shippinginstructdt.split(" ");
				var shipDate = shippinginstructdtArr[0];
				var shippinginstructdtStr = shippinginstructdt.toString();
				if (shippinginstructdtStr) {
		            var shipTime1 = shippinginstructdtStr.replace('��',':');
		            var shipTime2 =  shipTime1.replace('��',':');
		            var shipTime = shipTime2.replace('�b','');
		            shipTime = shipTime.split(' ')[1];
		            var tmpTimes = shipTime.split(':');
		            var tmpTimeYy = tmpTimes[0];
		            if (tmpTimeYy.length == 1) {
		                shipTime = shipDate + ' ' + '0' + tmpTimeYy + ':' + tmpTimes[1] + ':' + tmpTimes[2];
		            } else {
		                shipTime = shipDate + ' ' + shipTime;
		            }
		            nlapiLogExecution('DEBUG', 'shipTime', shipTime);   
				}
				var customerorderno = salesorderSearch[i].getValue("custbody_djkk_customerorderno");//DJ_��������ԍ�
				// CH792 delete by zdj 20230815 start
				//var custtranid = salesorderSearch[i].getValue("custcol_djkk_customer_order_number");//DJ_�O���V�X�e���A�g_�����ԍ�
				// CH792 delete by zdj 20230815 end
				// CH792 add by zdj 20230815 start
				var destinCode = salesorderSearch[i].getValue("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : code
				// CH792 add by zdj 20230815 end
				var destinName = salesorderSearch[i].getValue("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : ���O
				// CH792 delete by zdj 20230815 start
				// var annotDay = salesorderSearch[i].getValue("custbody_djkk_annotation_day");//������
				// CH792 delete by zdj 20230815 end
				var deliveMemo = salesorderSearch[i].getValue("custbody_djkk_deliverermemo1");//DJ_�^����Ќ������l
				var deliveryMemo = salesorderSearch[i].getValue("custbody_djkk_deliverynotememo");//DJ_�[�i�����l
				// CH792 delete by zdj 20230815 start
				// var line = salesorderSearch[i].getValue("line");//���הԍ�
				// CH792 delete by zdj 20230815 end
				// CH792 update by zdj 20230815 start
				//var location = salesorderSearch[i].getText("location");//�ꏊ
				var location = salesorderSearch[i].getValue("custrecord_djkk_location_barcode","location",null);//�ꏊ
				// CH792 update by zdj 20230815 end
				var itmeStock = salesorderSearch[i].getValue("custitem_djkk_product_code","item",null);//���i�R�[�h���J�^���O�R�[�h
				var serialnumbers = salesorderSearch[i].getText("inventorynumber","inventoryDetail",null);//�Ǘ��ԍ�
				//invenremarkArr_index = invenremarkArr.indexOf(serialnumbers);
				// CH792 delete by zdj 20230815 start
//				if(invenremarkArr_index < 0){
//					var lotRemark = '';
//				}else{
//					var lotRemark = inventorynumberSearch[invenremarkArr_index].getValue("custitemnumber_djkk_lot_remark"); //DJ_���b�g���}�[�N
//				}
				// CH792 delete by zdj 20230815 end
				
				var fulfIntd = salesorderSearch[i].getValue("internalid","fulfillingTransaction",null);//�z��ID
				var itemfulfillArr_index = itemfulfillArr.indexOf(fulfIntd);
				if(itemfulfillArr_index < 0){
					var itemfulSerialnumbers = '';
					var itemfulQuantity = '';
					var itemfulExpirationdate = '';
					// CH792 delete by zdj 20230815 start
					// var itemfulLinememo = '';
					// CH792 delete by zdj 20230815 end
					var itemfulOrderno = '';
					var itemfulTrandate = '';
				}else{
					var itemfulSerialnumbers = itemfulfillSearch[itemfulfillArr_index].getValue("serialnumbers"); //�z������.�݌ɏڍ�.�V���A��/���b�g�ԍ�
					var itemfulQuantity = Number(itemfulfillSearch[itemfulfillArr_index].getValue("quantity")); //�z������.����
					var itemfulExpirationdate = itemfulfillSearch[itemfulfillArr_index].getValue("expirationdate","inventoryDetail",null); //�z������.�L������
					// CH792 delete by zdj 20230815 start
					// var itemfulLinememo = itemfulfillSearch[itemfulfillArr_index].getValue("custcol_djkk_line_memo"); //DJ_���דE�v
					// CH792 delete by zdj 20230815 end
					var itemfulOrderno = itemfulfillSearch[itemfulfillArr_index].getValue("custcol_djkk_summarize_order_no"); //DJ_�W��`�[�ԍ�
					var itemfulTrandate = itemfulfillSearch[itemfulfillArr_index].getValue("trandate"); //�z��.���t
				}
				
				var itemNameJp1 = salesorderSearch[i].getValue("custitem_djkk_product_name_jpline1","item",null);//DJ_�i���i���{��jLINE1
				var itemNameJp2 = salesorderSearch[i].getValue("custitem_djkk_product_name_jpline2","item",null);//DJ_�i���i���{��jLINE2
				var itemJpName = itemNameJp1 + " " + itemNameJp2;
				var soQuantity = Number(salesorderSearch[i].getValue("quantity"));//����
				var qtyNum = Number(soQuantity) - Number(itemfulQuantity);
				var soExpirationdate = salesorderSearch[i].getValue("expirationdate","inventoryDetail",null);//��������.�݌ɏڍ�.�L������
				
				subList.setLineItemValue('custpage_ord', lineCount,tranid);//�����ԍ�
				// CH792 add by zdj 20230815 start
				subList.setLineItemValue('custpage_outord', lineCount,exsystemTranid);//DJ_�O���V�X�e���A�g_�����ԍ�
				// CH792 add by zdj 20230815 end
				subList.setLineItemValue('custpage_cust', lineCount,custId);//�ڋqID
				subList.setLineItemValue('custpage_custname', lineCount,custName);//�ڋq�R�[�h
				subList.setLineItemValue('custpage_ordate', lineCount,trandate);//���t
				subList.setLineItemValue('custpage_delvdate', lineCount,deliDate);//�[�i��
				// CH792 add by zdj 20230815 start
				if(isEmpty(shipDate)){
					subList.setLineItemValue('custpage_emaildate', lineCount,'');//���M��
				}else{
					subList.setLineItemValue('custpage_emaildate', lineCount,shipDate);//���M��
				}
				// CH792 add by zdj 20230815 end
				// CH792 delete by zdj 20230815 start
				// subList.setLineItemValue('custpage_custtraind', lineCount,custtranid);//DJ_�o�׎w������
				// CH792 delete by zdj 20230815 end
				if(isEmpty(shipTime)){
					subList.setLineItemValue('custpage_sedate', lineCount,'');
				}else{
					subList.setLineItemValue('custpage_sedate', lineCount,shipTime);//DJ_�o�׎w������
				}
				subList.setLineItemValue('custpage_custpono', lineCount,customerorderno);//DJ_��������ԍ�
				// CH792 delete by zdj 20230815 start
//				if(!isEmpty(itemfulOrderno)){
//					subList.setLineItemValue('custpage_aggregation', lineCount,"����");//�W��
//				}else{
//					subList.setLineItemValue('custpage_aggregation', lineCount," ");//�W��
//				}
				// CH792 delete by zdj 20230815 end
				// CH792 add by zdj 20230815 start
				subList.setLineItemValue('custpage_deliverycode', lineCount,destinCode);//�[�i��R�[�h
				// CH792 add by zdj 20230815 end
				subList.setLineItemValue('custpage_deliveryfirst', lineCount,destinName);//�z����
				// CH792 delete by zdj 20230815 start
				// subList.setLineItemValue('custpage_injectiondate', lineCount,annotDay);//������
				// subList.setLineItemValue('custpage_napinday', lineCount,deliDate);//�[�i��
				// CH792 delete by zdj 20230815 end
				subList.setLineItemValue('custpage_shption', lineCount,deliveMemo);//DJ_�^����Ќ������l
				subList.setLineItemValue('custpage_napinmemo', lineCount,deliveryMemo);//�[�i�����l
				// CH792 delete by zdj 20230815 start
				// subList.setLineItemValue('custpage_lienno', lineCount,line);//���הԍ�
				// CH792 delete by zdj 20230815 end
				subList.setLineItemValue('custpage_location', lineCount,location);//�ꏊ
				subList.setLineItemValue('custpage_stock', lineCount,itmeStock);//���i�R�[�h���J�^���O�R�[�h
				subList.setLineItemValue('custpage_batch', lineCount,serialnumbers);//�Ǘ��ԍ�
				subList.setLineItemValue('custpage_actbatch', lineCount,itemfulSerialnumbers);//�z������.�݌ɏڍ�.�V���A��/���b�g�ԍ�
				if(serialnumbers != itemfulSerialnumbers){
					subList.setLineItemValue('custpage_batchdiff', lineCount,"*");//�z������.�݌ɏڍ�.�V���A��/���b�g�ԍ��ƊǗ��ԍ���r
				}
				subList.setLineItemValue('custpage_descri', lineCount,itemJpName);//�i��1 + �i��2
				subList.setLineItemValue('custpage_qty', lineCount,soQuantity);//So���א���
				subList.setLineItemValue('custpage_actqty', lineCount,itemfulQuantity);//�z������.����
				subList.setLineItemValue('custpage_qtydiff', lineCount,qtyNum);//So���א��� - �z������.����
				subList.setLineItemValue('custpage_dbb', lineCount,soExpirationdate);//��������.�݌ɏڍ�.�L������
				subList.setLineItemValue('custpage_actdbb', lineCount,itemfulExpirationdate);//�z������.�L������
				if(soExpirationdate != itemfulExpirationdate){
					subList.setLineItemValue('custpage_dbbdiff', lineCount,"*");//��������.�݌ɏڍ�.�L�������Ɣz������.�L��������r
				}
				// CH792 delete by zdj 20230815 start
				// subList.setLineItemValue('custpage_remarks', lineCount,lotRemark);//���b�g���}�[�N
				// subList.setLineItemValue('custpage_actrema', lineCount,itemfulLinememo);//DJ_���דE�v
//				if(lotRemark != itemfulLinememo){
//					subList.setLineItemValue('custpage_remadiff', lineCount,"*");//���b�g���}�[�N��DJ_���דE�v��r
//				}
				// CH792 delete by zdj 20230815 end
				subList.setLineItemValue('custpage_recidate', lineCount,itemfulTrandate);//�z��.���t
				subList.setLineItemValue('custpage_ktraggre', lineCount,itemfulOrderno);//DJ_�W��`�[�ԍ�
				lineCount++;
			}
			
		}
		
		
	}
	response.writePage(form);
  }
  catch(e){
	  nlapiLogExecution('error', '�G���[', e.message);
  }
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