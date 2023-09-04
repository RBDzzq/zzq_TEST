/**
 * DJ_出荷情報-出荷情報画面
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/01/18     CPC_宋
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
	 var orderValue = request.getParameter('order'); //注文番号
	 var outOrderValue = request.getParameter('outorder'); //外部注文No
	 var customerValue = request.getParameter('customer');//注文.顧客
	 var custpoValue = request.getParameter('custpo');//注文.DJ_先方発注番号
	 //var orderdateValue = request.getParameter('orderdate');//注文.日付
	 var delidateValue = request.getParameter('delidate'); //注文出荷.納品日
	 var senddateValue = request.getParameter('senddate'); //注文.DJ_出荷指示日時
	 var deliveryDestinationValue = request.getParameter('deliverydestination'); //注文.納品先
	 //var creatdateValue = request.getParameter('creatdate');//注文.作成日
	 // CH792 add by zdj 20230815 start
	 var delidateValueStart = request.getParameter('delidatestart'); //注文出荷.納品日始め
	 var senddateValueStart = request.getParameter('senddatestart'); //注文.DJ_出荷指示日時始め
	 var locationValue = request.getParameter('location'); //倉庫No
	 var stockValue = request.getParameter('stock'); //カタログコード
	 var batchValue = request.getParameter('batch'); //管理番号
	 var subsValue = request.getParameter('subs'); //子会社
	 // CH792 add by zdj 20230815 end
	
	 var form = nlapiCreateForm('DJ_出荷情報画面', false);
	 form.setScript('customscript_djkk_cs_stock_shipping_info');
		
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '検索戻す','searchReturn()');
	 }else{
		form.addButton('btn_search', '検索', 'search()');
	 }
	 
	form.addFieldGroup('select_group', '検索');
	// CH792 update by zdj 20230815 start
	//var orderField = form.addField('custpage_order', 'text', 'Order#',null, 'select_group'); //注文番号
	var subsidiaryField = form.addField('custpage_subsidiary', 'select', '子会社',null, 'select_group'); //子会社
	var orderField = form.addField('custpage_order', 'text', 'NS注文書No',null, 'select_group'); //注文番号
	var outOrderField = form.addField('custpage_out_order', 'text', '外部注文No',null, 'select_group'); //外部注文No
	//var customerField = form.addField('custpage_customer', 'select', 'Customer#',null, 'select_group'); //注文.顧客
	var customerField = form.addField('custpage_customer', 'select', '顧客名',null, 'select_group'); //注文.顧客
	//var custpoField = form.addField('custpage_custpo', 'text', 'Customer PO#',null, 'select_group'); //注文.DJ_先方発注番号
	//var orderdateField = form.addField('custpage_orderdate', 'date', 'Order Date',null, 'select_group'); //注文.日付
	var custpoField = form.addField('custpage_custpo', 'text', '顧客発注No',null, 'select_group'); //注文.DJ_先方発注番号
	//var delidateField = form.addField('custpage_delidate', 'date', 'Delivery Date',null, 'select_group'); //注文出荷.納品日
	var locationField = form.addField('custpage_head_location', 'select', '倉庫No',null, 'select_group'); //倉庫No
	var deliveryDestinationField = form.addField('custpage_delivery_destination', 'select', '納品先名',null, 'select_group'); //注文.納品先名
	var stockField = form.addField('custpage_head_stock', 'text', 'カタログコード',null, 'select_group'); //カタログコード
	var batchField = form.addField('custpage_head_batch', 'text', '管理番号',null, 'select_group'); //管理番号
	var delidateFieldStart = form.addField('custpage_delidate_start', 'date', '納品日開始日',null, 'select_group'); //注文出荷.納品日始め
	var delidateField = form.addField('custpage_delidate', 'date', '納品日終了日',null, 'select_group'); //注文出荷.納品日終わり	
	var senddateFieldStart = form.addField('custpage_senddate_start', 'date', '送信日開始日',null, 'select_group'); //注文.DJ_出荷指示日時始め
	//var senddateField = form.addField('custpage_senddate', 'date', 'Send Date',null, 'select_group'); //注文.DJ_出荷指示日時
	var senddateField = form.addField('custpage_senddate', 'date', '送信日終了日',null, 'select_group'); //注文.DJ_出荷指示日時終わり
	//var createrdateField = form.addField('custpage_createrdate', 'date', 'Create Date',null, 'select_group'); //注文.作成日
	//var createrdateField = form.addField('custpage_createrdate', 'date', '作成日',null, 'select_group'); //注文.作成日
	
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
	//選択倉庫を設定する
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
//	subList.addField('custpage_aggregation', 'text', '集約');
//	subList.addField('custpage_deliveryfirst', 'text', '配送先');
//	subList.addField('custpage_injectiondate', 'text', '受注日');
//	subList.addField('custpage_napinday', 'text', '納品日');
//	subList.addField('custpage_custpono', 'text', 'Cust PO No.');
//	subList.addField('custpage_shption', 'text', '運送備考');
//	subList.addField('custpage_napinmemo', 'text', '納品書備考');
//	subList.addField('custpage_lienno', 'text', 'LineNo');
//	subList.addField('custpage_location', 'text', 'WH');
//	subList.addField('custpage_stock', 'text', 'Stock#');
//	subList.addField('custpage_batch', 'text', 'Batch＃');
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
//	subList.addField('custpage_ktraggre', 'text', 'KRT 集約#');
	
	// CH792 update by zdj 20230815 start
	subList.addField('custpage_ordate', 'text', '受注日');
	subList.addField('custpage_emaildate', 'text', '送信日');
	subList.addField('custpage_recidate', 'text', 'Recv Date');
	subList.addField('custpage_delvdate', 'text', '納品日');
	subList.addField('custpage_ord', 'text', 'NS注文書No');
	subList.addField('custpage_outord', 'text', '外部注文No');
	subList.addField('custpage_cust', 'text', '顧客コード');
	subList.addField('custpage_custname', 'text', '顧客名');
	subList.addField('custpage_deliverycode', 'text', '納品先コード');
	subList.addField('custpage_deliveryfirst', 'text', '納品先名');
	subList.addField('custpage_custpono', 'text', '顧客発注No');
	subList.addField('custpage_location', 'text', '倉庫No');
	subList.addField('custpage_stock', 'text', 'カタログコード');
	subList.addField('custpage_descri', 'text', '商品名');
	subList.addField('custpage_qty', 'text', '数量');
	subList.addField('custpage_actqty', 'text', 'KRT数量');
	subList.addField('custpage_qtydiff', 'text', '数量差異');
	subList.addField('custpage_dbb', 'text', '賞味期限');
	subList.addField('custpage_actdbb', 'text', 'KRT賞味期限');
	subList.addField('custpage_dbbdiff', 'text', 'BBD差異');
	subList.addField('custpage_batch', 'text', '管理番号');
	subList.addField('custpage_actbatch', 'text', 'KRT管理番号');
	subList.addField('custpage_batchdiff', 'text', '管理番号差異');
	subList.addField('custpage_shption', 'text', '運送備考');
	subList.addField('custpage_napinmemo', 'text', '納品書備考');
	subList.addField('custpage_ktraggre', 'text', 'KRT 集約#');
	subList.addField('custpage_sedate', 'text', '送信日時');
	// CH792 update by zdj 20230815 end

	if(selectFlg == 'T'){	
		var filit = new Array();
		filit.push(["type","anyof","SalesOrd"]);
		
		filit.push("AND");
		filit.push(["mainline","is","F"]);
		//無効以外
		filit.push("AND");
		filit.push(["voided","is","F"]);
		//税金ライン外す
		filit.push("AND");
		filit.push(["taxline","is","F"]);
		//出荷行
		filit.push("AND");
		filit.push(["shipping","is","F"]);

	    if(!isEmpty(selectSub)){ // 子会社
	        filit.push("AND");
	        filit.push(["subsidiary","anyof", selectSub]);
	    }
	      
		if(!isEmpty(orderValue)){ // 注文番号
			filit.push("AND");
			filit.push(["tranid","anyof",orderValue]);
		}
		// CH792 add by zdj 20230816 start
		if(!isEmpty(outOrderValue)){ // 外部注文No
			filit.push("AND");
			filit.push(["custbody_djkk_exsystem_tranid","is",outOrderValue]);
		}
		// CH792 add by zdj 20230816 end
		if(!isEmpty(customerValue)){//顧客
			filit.push("AND");
			filit.push(["entity","anyof",customerValue]);
		}
		// CH792 add by zdj 20230816 start
		if(!isEmpty(deliveryDestinationValue)){//納品先
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_destination","anyof",deliveryDestinationValue]);
		}
		// CH792 add by zdj 20230816 end
		if(!isEmpty(custpoValue)){ // DJ_先方発注番号
			filit.push("AND");
			filit.push(["custbody_djkk_customerorderno","is",custpoValue]);
		}
//		if(!isEmpty(orderdateValue)){ //日付
//			filit.push("AND");
//			filit.push(["trandate","onorbefore",orderdateValue]);
//		}
		// CH792 ADD BY ZDJ 20230815 START
		if(!isEmpty(delidateValueStart) && !isEmpty(delidateValue) && Date.parse(delidateValue) > Date.parse(delidateValueStart)){ //DJ_納品日
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","within",delidateValueStart,delidateValue]);
		}
		if(!isEmpty(delidateValueStart) && !isEmpty(delidateValue) && Date.parse(delidateValue) == Date.parse(delidateValueStart)){ //DJ_納品日
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","on",delidateValueStart]);
		}
		if(!isEmpty(delidateValue) && isEmpty(delidateValueStart)){ //DJ_納品日
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","onorbefore",delidateValue]);
		}
		if(!isEmpty(delidateValueStart) && isEmpty(delidateValue)){ //DJ_納品日
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","onorafter",delidateValueStart]);
		}
		if(!isEmpty(delidateValueStart) && !isEmpty(delidateValue) && Date.parse(delidateValueStart) > Date.parse(delidateValue)){
			filit.push("AND");
			filit.push(["custbody_djkk_delivery_date","within",'2023-1-1','2023-1-1']);
		}
		if(!isEmpty(senddateValueStart) && !isEmpty(senddateValue) && Date.parse(senddateValue) > Date.parse(senddateValueStart)){ //DJ_出荷指示日時
			filit.push("AND");
			filit.push(["custbody_djkk_shippinginstructdt","within",senddateValueStart,senddateValue]);
		}
		if(!isEmpty(senddateValueStart) && !isEmpty(senddateValue) && Date.parse(senddateValue) == Date.parse(senddateValueStart)){ //DJ_出荷指示日時
			filit.push("AND");
			filit.push(["custbody_djkk_shippinginstructdt","on",senddateValueStart]);
		}
		if(!isEmpty(senddateValue) && isEmpty(senddateValueStart)){ //DJ_出荷指示日時
			filit.push("AND");
			filit.push(["custbody_djkk_shippinginstructdt","onorbefore",senddateValue]);
		}
		if(!isEmpty(senddateValueStart) && isEmpty(senddateValue)){ //DJ_出荷指示日時
			filit.push("AND");
			filit.push(["custbody_djkk_shippinginstructdt","onorafter",senddateValueStart]);
		}
		if(!isEmpty(senddateValueStart) && !isEmpty(senddateValue) && Date.parse(senddateValueStart) > Date.parse(senddateValue)){ //DJ_出荷指示日時
			filit.push("AND");
			filit.push(["custbody_djkk_shippinginstructdt","within",'2023-1-1','2023-1-1']);
		}
		if(!isEmpty(locationValue)){
			var locationId = nlapiLookupField('location', locationValue, 'custrecord_djkk_location_barcode')
			if(!isEmpty(locationId)){ //倉庫No
				filit.push("AND");
				filit.push(["location.custrecord_djkk_location_barcode","is",locationId]);
			}
		}
		if(!isEmpty(stockValue)){ //DJ_カタログ製品コード 
			filit.push("AND");
			filit.push(["item.custitem_djkk_product_code","is",stockValue]);
		}
		if(!isEmpty(batchValue)){
			//シリアル/ロット番号 
			filit.push("AND");
			var filitArr = ["formulanumeric: CASE WHEN {inventorydetail.inventorynumber} = '" + batchValue + "' THEN 1 ELSE 0 END","equalto","1"];
			//filit.push(["inventorydetail.inventorynumber","anyof",batchValue]);
			filit.push(filitArr);
		}
		// CH792 ADD BY ZDJ 20230815 END
//		if(!isEmpty(creatdateValue)){ //作成日
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
				   new nlobjSearchColumn("inventorynumber","inventoryDetail",null),   //管理番号（シリアル/ロット番号）
				   new nlobjSearchColumn("expirationdate","inventoryDetail",null), 
				   // CH792 delete by zdj 20230815 start
				   // new nlobjSearchColumn("custcol_djkk_customer_order_number"),  
				   // CH792 delete by zdj 20230815 end
				   // CH792 add by zdj 20230815 start
				   new nlobjSearchColumn("custbody_djkk_exsystem_tranid"),   // DJ_外部システム連携_注文番号
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
		
//		var inventorynumberSearch = getSearchResults("inventorynumber",null,  //在庫番号
//				[
//				], 
//				[
//					new nlobjSearchColumn("inventorynumber").setSort(false), //管理番号
//					new nlobjSearchColumn("custitemnumber_djkk_lot_remark"),//DJ_ロットリマーク
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
				var tranid = salesorderSearch[i].getValue("tranid");//注文番号
				// CH792 add by zdj 20230815 start
				var exsystemTranid = salesorderSearch[i].getValue("custbody_djkk_exsystem_tranid");//DJ_外部システム連携_注文番号
				// CH792 add by zdj 20230815 end
				var custName = salesorderSearch[i].getValue("companyname","customer",null);//顧客名
				var custId = salesorderSearch[i].getValue("entityid","customer",null);//顧客ID
				var trandate = salesorderSearch[i].getValue("trandate");//日付
				var deliDate = salesorderSearch[i].getValue("custbody_djkk_delivery_date");//納品日
				var shippinginstructdt = salesorderSearch[i].getValue("custbody_djkk_shippinginstructdt");//DJ_出荷指示日時
				nlapiLogExecution('DEBUG', 'shippinginstructdt', shippinginstructdt);
				var shippinginstructdtArr = shippinginstructdt.split(" ");
				var shipDate = shippinginstructdtArr[0];
				var shippinginstructdtStr = shippinginstructdt.toString();
				if (shippinginstructdtStr) {
		            var shipTime1 = shippinginstructdtStr.replace('時',':');
		            var shipTime2 =  shipTime1.replace('分',':');
		            var shipTime = shipTime2.replace('秒','');
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
				var customerorderno = salesorderSearch[i].getValue("custbody_djkk_customerorderno");//DJ_先方発注番号
				// CH792 delete by zdj 20230815 start
				//var custtranid = salesorderSearch[i].getValue("custcol_djkk_customer_order_number");//DJ_外部システム連携_注文番号
				// CH792 delete by zdj 20230815 end
				// CH792 add by zdj 20230815 start
				var destinCode = salesorderSearch[i].getValue("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : code
				// CH792 add by zdj 20230815 end
				var destinName = salesorderSearch[i].getValue("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : 名前
				// CH792 delete by zdj 20230815 start
				// var annotDay = salesorderSearch[i].getValue("custbody_djkk_annotation_day");//注文日
				// CH792 delete by zdj 20230815 end
				var deliveMemo = salesorderSearch[i].getValue("custbody_djkk_deliverermemo1");//DJ_運送会社向け備考
				var deliveryMemo = salesorderSearch[i].getValue("custbody_djkk_deliverynotememo");//DJ_納品書備考
				// CH792 delete by zdj 20230815 start
				// var line = salesorderSearch[i].getValue("line");//明細番号
				// CH792 delete by zdj 20230815 end
				// CH792 update by zdj 20230815 start
				//var location = salesorderSearch[i].getText("location");//場所
				var location = salesorderSearch[i].getValue("custrecord_djkk_location_barcode","location",null);//場所
				// CH792 update by zdj 20230815 end
				var itmeStock = salesorderSearch[i].getValue("custitem_djkk_product_code","item",null);//商品コード→カタログコード
				var serialnumbers = salesorderSearch[i].getText("inventorynumber","inventoryDetail",null);//管理番号
				//invenremarkArr_index = invenremarkArr.indexOf(serialnumbers);
				// CH792 delete by zdj 20230815 start
//				if(invenremarkArr_index < 0){
//					var lotRemark = '';
//				}else{
//					var lotRemark = inventorynumberSearch[invenremarkArr_index].getValue("custitemnumber_djkk_lot_remark"); //DJ_ロットリマーク
//				}
				// CH792 delete by zdj 20230815 end
				
				var fulfIntd = salesorderSearch[i].getValue("internalid","fulfillingTransaction",null);//配送ID
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
					var itemfulSerialnumbers = itemfulfillSearch[itemfulfillArr_index].getValue("serialnumbers"); //配送明細.在庫詳細.シリアル/ロット番号
					var itemfulQuantity = Number(itemfulfillSearch[itemfulfillArr_index].getValue("quantity")); //配送明細.数量
					var itemfulExpirationdate = itemfulfillSearch[itemfulfillArr_index].getValue("expirationdate","inventoryDetail",null); //配送明細.有効期限
					// CH792 delete by zdj 20230815 start
					// var itemfulLinememo = itemfulfillSearch[itemfulfillArr_index].getValue("custcol_djkk_line_memo"); //DJ_明細摘要
					// CH792 delete by zdj 20230815 end
					var itemfulOrderno = itemfulfillSearch[itemfulfillArr_index].getValue("custcol_djkk_summarize_order_no"); //DJ_集約伝票番号
					var itemfulTrandate = itemfulfillSearch[itemfulfillArr_index].getValue("trandate"); //配送.日付
				}
				
				var itemNameJp1 = salesorderSearch[i].getValue("custitem_djkk_product_name_jpline1","item",null);//DJ_品名（日本語）LINE1
				var itemNameJp2 = salesorderSearch[i].getValue("custitem_djkk_product_name_jpline2","item",null);//DJ_品名（日本語）LINE2
				var itemJpName = itemNameJp1 + " " + itemNameJp2;
				var soQuantity = Number(salesorderSearch[i].getValue("quantity"));//数量
				var qtyNum = Number(soQuantity) - Number(itemfulQuantity);
				var soExpirationdate = salesorderSearch[i].getValue("expirationdate","inventoryDetail",null);//注文明細.在庫詳細.有効期限
				
				subList.setLineItemValue('custpage_ord', lineCount,tranid);//注文番号
				// CH792 add by zdj 20230815 start
				subList.setLineItemValue('custpage_outord', lineCount,exsystemTranid);//DJ_外部システム連携_注文番号
				// CH792 add by zdj 20230815 end
				subList.setLineItemValue('custpage_cust', lineCount,custId);//顧客ID
				subList.setLineItemValue('custpage_custname', lineCount,custName);//顧客コード
				subList.setLineItemValue('custpage_ordate', lineCount,trandate);//日付
				subList.setLineItemValue('custpage_delvdate', lineCount,deliDate);//納品日
				// CH792 add by zdj 20230815 start
				if(isEmpty(shipDate)){
					subList.setLineItemValue('custpage_emaildate', lineCount,'');//送信日
				}else{
					subList.setLineItemValue('custpage_emaildate', lineCount,shipDate);//送信日
				}
				// CH792 add by zdj 20230815 end
				// CH792 delete by zdj 20230815 start
				// subList.setLineItemValue('custpage_custtraind', lineCount,custtranid);//DJ_出荷指示日時
				// CH792 delete by zdj 20230815 end
				if(isEmpty(shipTime)){
					subList.setLineItemValue('custpage_sedate', lineCount,'');
				}else{
					subList.setLineItemValue('custpage_sedate', lineCount,shipTime);//DJ_出荷指示日時
				}
				subList.setLineItemValue('custpage_custpono', lineCount,customerorderno);//DJ_先方発注番号
				// CH792 delete by zdj 20230815 start
//				if(!isEmpty(itemfulOrderno)){
//					subList.setLineItemValue('custpage_aggregation', lineCount,"あり");//集約
//				}else{
//					subList.setLineItemValue('custpage_aggregation', lineCount," ");//集約
//				}
				// CH792 delete by zdj 20230815 end
				// CH792 add by zdj 20230815 start
				subList.setLineItemValue('custpage_deliverycode', lineCount,destinCode);//納品先コード
				// CH792 add by zdj 20230815 end
				subList.setLineItemValue('custpage_deliveryfirst', lineCount,destinName);//配送先
				// CH792 delete by zdj 20230815 start
				// subList.setLineItemValue('custpage_injectiondate', lineCount,annotDay);//注文日
				// subList.setLineItemValue('custpage_napinday', lineCount,deliDate);//納品日
				// CH792 delete by zdj 20230815 end
				subList.setLineItemValue('custpage_shption', lineCount,deliveMemo);//DJ_運送会社向け備考
				subList.setLineItemValue('custpage_napinmemo', lineCount,deliveryMemo);//納品書備考
				// CH792 delete by zdj 20230815 start
				// subList.setLineItemValue('custpage_lienno', lineCount,line);//明細番号
				// CH792 delete by zdj 20230815 end
				subList.setLineItemValue('custpage_location', lineCount,location);//場所
				subList.setLineItemValue('custpage_stock', lineCount,itmeStock);//商品コード→カタログコード
				subList.setLineItemValue('custpage_batch', lineCount,serialnumbers);//管理番号
				subList.setLineItemValue('custpage_actbatch', lineCount,itemfulSerialnumbers);//配送明細.在庫詳細.シリアル/ロット番号
				if(serialnumbers != itemfulSerialnumbers){
					subList.setLineItemValue('custpage_batchdiff', lineCount,"*");//配送明細.在庫詳細.シリアル/ロット番号と管理番号比較
				}
				subList.setLineItemValue('custpage_descri', lineCount,itemJpName);//品名1 + 品名2
				subList.setLineItemValue('custpage_qty', lineCount,soQuantity);//So明細数量
				subList.setLineItemValue('custpage_actqty', lineCount,itemfulQuantity);//配送明細.数量
				subList.setLineItemValue('custpage_qtydiff', lineCount,qtyNum);//So明細数量 - 配送明細.数量
				subList.setLineItemValue('custpage_dbb', lineCount,soExpirationdate);//注文明細.在庫詳細.有効期限
				subList.setLineItemValue('custpage_actdbb', lineCount,itemfulExpirationdate);//配送明細.有効期限
				if(soExpirationdate != itemfulExpirationdate){
					subList.setLineItemValue('custpage_dbbdiff', lineCount,"*");//注文明細.在庫詳細.有効期限と配送明細.有効期限比較
				}
				// CH792 delete by zdj 20230815 start
				// subList.setLineItemValue('custpage_remarks', lineCount,lotRemark);//ロットリマーク
				// subList.setLineItemValue('custpage_actrema', lineCount,itemfulLinememo);//DJ_明細摘要
//				if(lotRemark != itemfulLinememo){
//					subList.setLineItemValue('custpage_remadiff', lineCount,"*");//ロットリマークとDJ_明細摘要比較
//				}
				// CH792 delete by zdj 20230815 end
				subList.setLineItemValue('custpage_recidate', lineCount,itemfulTrandate);//配送.日付
				subList.setLineItemValue('custpage_ktraggre', lineCount,itemfulOrderno);//DJ_集約伝票番号
				lineCount++;
			}
			
		}
		
		
	}
	response.writePage(form);
  }
  catch(e){
	  nlapiLogExecution('error', 'エラー', e.message);
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