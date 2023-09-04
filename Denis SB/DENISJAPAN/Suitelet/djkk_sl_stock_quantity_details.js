/**
 * DJ_在庫数量-在庫数量画面
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
	 var locationValue = request.getParameter('location');  //WH
	 var cataValue = request.getParameter('catacode');   //StockCode
	
	 var form = nlapiCreateForm('DJ_在庫数量画面', false);
	 form.setScript('customscript_djkk_cs_stock_quantity_deta');
		
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '検索戻す','searchReturn()');
	 }else{
		form.addButton('btn_search', '検索', 'search()');
	 }
	 
	form.addFieldGroup('select_group', '検索');
	var locationField = form.addField('custpage_location', 'select', 'WH',null, 'select_group');//倉庫
	var filedLocationList = getSearchResults("location",null,
		[
			
		], 
		[
			  new nlobjSearchColumn("internalid"), 
			  new nlobjSearchColumn("name").setSort(false)
		]
		);
	locationField.addSelectOption('', '');
	if(filedLocationList != null){
		for(var i = 0; i<filedLocationList.length;i++){
			var locationName = filedLocationList[i].getValue("name");
			var locationId = filedLocationList[i].getValue("internalid");
			locationField.addSelectOption(locationId,locationName);
		}
	}
	
	var stockField = form.addField('custpage_catalogcode', 'text', 'カタログコード',null, 'select_group'); //カタログコード
	
	if(selectFlg == 'T'){
		locationField.setDisplayType('inline');
		stockField.setDisplayType('inline');	
	}
	locationField.setDefaultValue(locationValue);
	stockField.setDefaultValue(cataValue);
	
	var subList = form.addSubList('list', 'list', '');
	subList.addField('custpage_wh', 'text', 'WH');
	subList.addField('custpage_itemcode', 'text', 'アイテムコード');
	subList.addField('custpage_code', 'text', 'カタログコード');
	subList.addField('custpage_batch', 'text', '管理番号');
	subList.addField('custpage_batchnum', 'text', 'ロットリマークス');
	subList.addField('custpage_batchid', 'text', 'メーカー製造ロット番号');
	subList.addField('custpage_tion', 'text', '商品名');
	subList.addField('custpage_nbkk', 'text', '賞味期限NBKK');
	subList.addField('custpage_krt', 'text', '賞味期限KRT');
	subList.addField('custpage_qtyavailable', 'text', '利用可能数');
	subList.addField('custpage_qtynbkk', 'text', '実在庫数NBKK');
	subList.addField('custpage_qtykrt', 'text', '実在庫数KRT');
	subList.addField('custpage_cha', 'text', '差分');
	subList.addField('custpage_rem', 'text', 'Remarks');
	
	if(selectFlg == 'T'){	
		var filit = new Array();
		filit.push(["isinactive","is","F"]);
		if(!isEmpty(locationValue)){//倉庫
			filit.push("AND");
			filit.push(["custrecord_djkk_stockquantity_line_local","anyof",locationValue]);
		}
		if(!isEmpty(cataValue)){//カタログコード 
			filit.push("AND");
			filit.push(["custrecord_djkk_stockquantity_line_item.custitem_djkk_product_code","contains",cataValue]);
		}
		var stockquanSearch = getSearchResults("customrecord_djkk_stock_quantity_line",null,  //DJ_在庫数量明細
				filit,
				[
					new nlobjSearchColumn("custrecord_djkk_stockquantity_line_local"),   //DJ_在庫数量明細.倉庫
					new nlobjSearchColumn("custitem_djkk_product_code","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null),  //DJ_在庫数量明細.在庫コード(item)
					new nlobjSearchColumn("custrecord_djkk_stockquantity_line_batch"),   //DJ_在庫数量明細.バッチNo.
					new nlobjSearchColumn("custitem_djkk_item_displayname","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null),  //DJ_製品表示名
					new nlobjSearchColumn("custrecord_djkk_stockquantity_line_date"),  //DJ_在庫数量明細.賞味期限
					new nlobjSearchColumn("custrecord_djkk_stockquantity_line_stock"), //DJ_在庫数量明細.在庫数量
					new nlobjSearchColumn("vendor","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null),//在庫コード : 優先仕入先
					new nlobjSearchColumn("custrecord_djkk_stockquantity_line_item"),//在庫コード 
				]
				);
		
		
		var inventorynumberSearch = getSearchResults("inventorynumber",null,  //在庫番号
				[
				], 
				[
					new nlobjSearchColumn("inventorynumber").setSort(false), //管理番号
					new nlobjSearchColumn("location"), //location
					new nlobjSearchColumn("item"),//name
					new nlobjSearchColumn("custitemnumber_djkk_lot_remark"),//DJ_ロットリマーク
					new nlobjSearchColumn("custitemnumber_djkk_maker_serial_number"),//DJ_メーカー製造ロット番号
					new nlobjSearchColumn("expirationdate"),//有効期限
//					new nlobjSearchColumn("formulanumeric").setFormula("{quantityavailable}+{quantityonorder}"),//数量
					new nlobjSearchColumn("quantityonhand"),//数量
					new nlobjSearchColumn("quantityavailable"),//利用可能数
				]
				);
		var inventorynumberArr = new Array();
		if(!isEmpty(inventorynumberSearch)){
			for(var i = 0 ; i < inventorynumberSearch.length ; i++){
				var inventorynumberId = inventorynumberSearch[i].getValue("inventorynumber")
				var locationId = inventorynumberSearch[i].getValue("location")
				var tempIndex = inventorynumberId+locationId
				inventorynumberArr.push(tempIndex);
				nlapiLogExecution('DEBUG', 'tempIndex',tempIndex);
//				inventorynumberArr.push(inventorynumberSearch[i].getValue("inventorynumber"));
			}
		}
		
		
		var arrivalSearch = getSearchResults("customrecord_djkk_arrival_results",null,   //DJ_入荷実績
				[
				],
				[
					new nlobjSearchColumn("custrecord_djkk_stock_code"),   //DJ_在庫コード
					new nlobjSearchColumn("custrecord_djkk_batch_number"),  //DJ_バッチNO.
				]
				);
		var arrCodeArr = new Array();
		var arrbatchArr = new Array();
		if(!isEmpty(arrivalSearch)){
			for(var i = 0 ; i < arrivalSearch.length ; i++){
				arrCodeArr.push(arrivalSearch[i].getValue("custrecord_djkk_stock_code"));
				arrbatchArr.push(arrivalSearch[i].getValue("custrecord_djkk_batch_number"));
			}
		}
		
		
		if(!isEmpty(stockquanSearch)){
			var lineCount = 1;
			for(var i = 0 ; i < stockquanSearch.length ;i++){
				nlapiLogExecution('DEBUG', 'stockquanSearch.length',stockquanSearch.length);
				var ineLocationText  =stockquanSearch[i].getText("custrecord_djkk_stockquantity_line_local");//DJ_在庫数量明細.倉庫
				var ineLocationValue  =stockquanSearch[i].getValue("custrecord_djkk_stockquantity_line_local");//DJ_在庫数量明細.倉庫
				var ineLocationparts = ineLocationText.split(':');
				var ineLocation = ineLocationparts[0];


				var ineItem = stockquanSearch[i].getValue("custitem_djkk_product_code","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null);//DJ_在庫数量明細.在庫コード(item)
				var ineBatch = stockquanSearch[i].getValue("custrecord_djkk_stockquantity_line_batch");//DJ_在庫数量明細.バッチNo.
				var displayname = stockquanSearch[i].getValue("custitem_djkk_item_displayname","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null);//DJ_製品表示名
				var ineDate = stockquanSearch[i].getValue("custrecord_djkk_stockquantity_line_date"); //DJ_在庫数量明細.賞味期限
				var ineStock = stockquanSearch[i].getValue("custrecord_djkk_stockquantity_line_stock");//DJ_在庫数量明細.在庫数量
				var vendor = stockquanSearch[i].getText("vendor","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null);//在庫コード : 優先仕入先
//				var line_item = stockquanSearch[i].getText("custrecord_djkk_stockquantity_line_item");//在庫コード
//				var inventorynumberArr_index = inventorynumberArr.indexOf(ineBatch);
				var currentIndex = ineBatch+ineLocationValue;
				nlapiLogExecution('DEBUG', 'currentIndex',currentIndex);
				var inventorynumberArr_index = inventorynumberArr.indexOf(currentIndex);
				
				if(inventorynumberArr_index < 0){
					var itemCode = ''
					var lotRemark = '';
					var makerSerialNumber = '';
					var expirationdate = '';
					var quantity = '';
					var qtyavailable = '';
				}else{
					var columnID = inventorynumberSearch[inventorynumberArr_index].getAllColumns();
					var itemValue = inventorynumberSearch[inventorynumberArr_index].getValue("item");//アイテムコード
					var itemCode = nlapiLookupField('item', itemValue, 'itemid'); 
					var lotRemark = inventorynumberSearch[inventorynumberArr_index].getValue("custitemnumber_djkk_lot_remark");//DJ_ロットリマーク
					var makerSerialNumber = inventorynumberSearch[inventorynumberArr_index].getValue("custitemnumber_djkk_maker_serial_number");//DJ_メーカー製造ロット番号
					var expirationdate = inventorynumberSearch[inventorynumberArr_index].getValue("expirationdate"); //有効期限
					var quantity=inventorynumberSearch[inventorynumberArr_index].getValue(columnID[6]);
//					var quantity = inventorynumberSearch[inventorynumberArr_index][5]//.getValue("formulanumeric").setFormula("{quantityavailable}+{quantityonorder}");//数量
					var qtyavailable = inventorynumberSearch[inventorynumberArr_index].getValue("quantityavailable"); //数量
				}			
				var difference = Number(quantity) - Number(ineStock); //QtyNBKK - QtyKRT
								
				subList.setLineItemValue('custpage_wh', lineCount,ineLocation);
				subList.setLineItemValue('custpage_itemcode', lineCount,itemCode);
				subList.setLineItemValue('custpage_code', lineCount,ineItem);
				subList.setLineItemValue('custpage_batch', lineCount,ineBatch);
				subList.setLineItemValue('custpage_tion', lineCount,displayname);
				subList.setLineItemValue('custpage_krt', lineCount,ineDate);
				subList.setLineItemValue('custpage_qtykrt', lineCount,ineStock);
				subList.setLineItemValue('custpage_batchnum', lineCount,lotRemark);
				subList.setLineItemValue('custpage_nbkk', lineCount,expirationdate);
				subList.setLineItemValue('custpage_qtyavailable', lineCount,qtyavailable);
				subList.setLineItemValue('custpage_qtynbkk', lineCount,quantity);
				subList.setLineItemValue('custpage_cha', lineCount,difference);
//				subList.setLineItemValue('custpage_batchid', lineCount,vendor);
				subList.setLineItemValue('custpage_batchid', lineCount,makerSerialNumber);
				var arrCodeArr_index = arrCodeArr.indexOf(ineItem);
				var arrbatchArr_index = arrbatchArr.indexOf(ineBatch);
				if(arrCodeArr_index < 0 && arrbatchArr_index < 0){
					subList.setLineItemValue('custpage_rem', lineCount,"未検品");
				}else{
					subList.setLineItemValue('custpage_rem', lineCount,"検品終了");
				}
				
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