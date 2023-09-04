/**
 * DJ_修理品 注文書検索
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/09/24     CPC_苑
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
		//画面を書く
		var form = nlapiCreateForm('注文書検索', true);
		form.setScript('customscript_djkk_cs_repair_search_so');
		
		//項目を設定
		var serialField =  form.addField('custpage_serial', 'text', 'シリアル/ロット番号');
		serialField.setDefaultValue(serialValue);
		
		var searchtypeField = form.addField('custpage_searchtype','text','検索標準')
		searchtypeField.setDefaultValue(searchType);
		searchtypeField.setDisplayType('hidden');
		
		var soField =  form.addField('custpage_so', 'text', '注文番号');
		soField.setDefaultValue(soNumber );

		var subsidiaryField = form.addField('custpage_subsidiary', 'select', '連結');
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
		
		//ボタン設定
		if(selectFlg == 'T'){
			//form.addSubmitButton('設定')
			//form.addButton('btn_cloessearch', '設定', 'closesearch()')
			form.addButton('btn_return', '検索戻す','searchReturn()')
		}else{
			form.addButton('btn_search', '検索', 'search()')
		}
		
		
		
		//検索場合一覧設定
		if(selectFlg == 'T'){
			
			serialField.setDisplayType('inline');
			subsidiaryField.setDisplayType('inline');
			soField.setDisplayType('inline');
			
			var subList = form.addSubList('list', 'list', '');
			subList.addField('check', 'checkbox', '選択');
			subList.addField('so', 'text', 'SO番号');
			var soLink =  subList.addField('so_link', 'url', '注文書').setDisplayType('disabled');
			soLink.setLinkText('表示');
			subList.addField('so_date', 'text', '日付');
			subList.addField('serial', 'text', 'シリアル/ロット番号');
			subList.addField('item_id', 'text', 'アイテムID').setDisplayType('hidden');
			subList.addField('item', 'text', 'アイテム');
			subList.addField('so_id', 'text', 'SO内部ID').setDisplayType('hidden');
			subList.addField('unit', 'text', 'DJ_単位');
			subList.addField('unit_id', 'text', 'DJ_単位内部ID').setDisplayType('hidden');
			subList.addField('irime', 'text', 'DJ_入り目');
			subList.addField('location', 'text', 'DJ_場合');
			subList.addField('location_id', 'text', 'DJ_場合内部ID').setDisplayType('hidden');
			subList.addField('inventorydetail_id', 'text', '在庫詳細内部ID').setDisplayType('hidden');
			
			//条件設定
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
		//画面を書く
		var form = nlapiCreateForm('修理品検索', true);
		form.setScript('customscript_djkk_cs_repair_search_so');
		
		//項目を設定
		var serialField =  form.addField('custpage_serial', 'text', 'シリアル/ロット番号');
		serialField.setDefaultValue(serialValue);
		 
		//項目を設定
		var soField =  form.addField('custpage_so', 'text', '注文番号');
		soField.setDefaultValue(soNumber);
		
		var searchtypeField = form.addField('custpage_searchtype','text','検索標準')
		searchtypeField.setDefaultValue(searchType);
		searchtypeField.setDisplayType('hidden');
		
		var subsidiaryField = form.addField('custpage_subsidiary', 'select', '連結');
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
		//ボタン設定
		if(selectFlg == 'T'){

			form.addButton('btn_return', '検索戻す','searchReturn()')
		}else{
			form.addButton('btn_search', '検索', 'search()')
		}
		
		
		
		//検索場合一覧設定
		if(selectFlg == 'T'){
			
			serialField.setDisplayType('inline');
			subsidiaryField.setDisplayType('inline');
			soField.setDisplayType('inline');
			
			var subList = form.addSubList('list', 'list', '');
			subList.addField('check_repair', 'checkbox', '選択');
			subList.addField('so', 'text', '注文番号');
			var soLink =  subList.addField('so_link', 'url', '注文書').setDisplayType('disabled');
			soLink.setLinkText('表示');
			subList.addField('repair', 'text', '修理品番号');
			var soLink =  subList.addField('repair_link', 'url', '修理品').setDisplayType('disabled');
			soLink.setLinkText('表示');
			subList.addField('re_createdata', 'text', '作成日');
			subList.addField('re_serial_no', 'text', 'シリアル番号');
			subList.addField('re_status', 'text', '修理ステータス');
			subList.addField('re_subsidiary', 'text', '連結');
			subList.addField('re_item', 'text', '製品');
			//修理品明細
			subList.addField('list_item', 'text', 'アイテム');
			subList.addField('list_place', 'text', '場所');
			subList.addField('list_quantity', 'text', '数量');
			subList.addField('list_bin', 'text', '預かり保管棚');
			subList.addField('list_cuslocation', 'text', '預かり在庫場所');
			subList.addField('list_conversionrate', 'text', '入目');
			subList.addField('list_unit', 'text', '単位');
			
			subList.addField('so_id', 'text', 'SO内部ID').setDisplayType('hidden');
			subList.addField('item_id', 'text', 'アイテムID').setDisplayType('hidden');
			subList.addField('unit_id', 'text', 'DJ_単位内部ID').setDisplayType('hidden');
			subList.addField('location_id', 'text', 'DJ_場合内部ID').setDisplayType('hidden');
			subList.addField('inventorydetail_id', 'text', '在庫詳細内部ID').setDisplayType('hidden');
			subList.addField('cuslocationid', 'text', 'DJ_預かり在庫場所id').setDisplayType('hidden');
			//条件設定
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
					//修理品明細
					var itemValue = rst[i].getText("custrecord_djkk_rd_item","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_アイテム
					var placeValue = rst[i].getText("custrecord_djkk_rd_place","CUSTRECORD_DJKK_RD_REPAIR",null) //DJ_場所 
					var quantityValue = rst[i].getValue("custrecord_djkk_rd_quantity","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_数量
					var binValue = rst[i].getText("custrecord_djkk_rd_bin","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_預かり保管棚
					var cuslocationValue = rst[i].getText("custrecord_djkk_rd_cuslocation","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_預かり在庫場所
					var conversionrateValue = rst[i].getValue("custrecord_djkk_rd_conversionrate","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_入目
					var unitValue = rst[i].getText("custrecord_djkk_rd_unit","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_単位
					
					var itemId = rst[i].getValue("custrecord_djkk_rd_item","CUSTRECORD_DJKK_RD_REPAIR",null)//アイテムid
					var placeId = rst[i].getValue("custrecord_djkk_rd_place","CUSTRECORD_DJKK_RD_REPAIR",null) //場所 id
					var unitId = rst[i].getValue("custrecord_djkk_rd_unit","CUSTRECORD_DJKK_RD_REPAIR",null)//単位id
					var inventory = rst[i].getValue("custrecord_djkk_rd_inventory_detai","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_在庫詳細
					var cuslocationId = rst[i].getValue("custrecord_djkk_rd_cuslocation","CUSTRECORD_DJKK_RD_REPAIR",null)//DJ_預かり在庫場所id
					
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
					//修理品明細
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
