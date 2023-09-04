/**
 * SC課FC作成POリスト_LS
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/11     CPC_苑
 *
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	var formtype = request.getParameter('type');
	// ヘッダー名
	var form = nlapiCreateForm('DJ_SC課FC作成'+formtype+'リスト_LS', true);
	
	// 検索項目を作成
	form.addFieldGroup('custpage_group_filter', 'ヘッダー');
	var itemField = form.addField('custpage_item', 'text', 'アイテム','null', 'custpage_group_filter').setDisplayType('inline');
	var yearField = form.addField('custpage_year', 'text', '年', 'null','custpage_group_filter').setDisplayType('inline');
	var weekField = form.addField('custpage_week', 'text', '週', 'null','custpage_group_filter').setDisplayType('inline');//20230522 changed by zhou 「周」＝>「週」
	var locationField = form.addField('custpage_location', 'text', '場所', 'null','custpage_group_filter').setDisplayType('inline');
	var firstDateField = form.addField('custpage_field_firstdate', 'date','ファストデート', 'null', 'custpage_group_filter').setDisplayType('inline');

	// パラメータ取得
	var weekNum = request.getParameter('weeknum');
	var itemInternalid = request.getParameter('item');
	var wkFirstDay = request.getParameter('firstdate');
	var locationid = request.getParameter('locationid');
	var subsidiary = request.getParameter('subsidiary');
	

	// アイテム名前取得
	if (!isEmpty(itemInternalid)) {
		var itemName = nlapiLookupField('item', itemInternalid, 'name');
		
		// 値の設定
		if (!isEmpty(itemName)) {
			itemField.setDefaultValue(itemName);
		}
	}
	
	// 場所取得
	if (!isEmpty(locationid)) {
		var locationName = nlapiLookupField('customrecord_djkk_location_area',locationid,'name');
		
		// 値の設定
		if (!isEmpty(locationid)) {
			locationField.setDefaultValue(locationName);
		}
	}
	
	if (!isEmpty(weekNum)) {
		var paramArr = new Array();
		var paramArr = weekNum.split('-');
		var paramYear = paramArr[0];
		var paramWeek = paramArr[1];
		if (!isEmpty(paramYear)) {
			yearField.setDefaultValue(paramYear);
		}
		if (!isEmpty(paramWeek)) {
			weekField.setDefaultValue(paramWeek);
		}
	}
	if (!isEmpty(wkFirstDay)) {
		firstDateField.setDefaultValue(wkFirstDay);
	}

	// 明細作成
	var subList = form.addSubList('custpage_list', 'list', '明細');
	subList.addField('list_pono', 'text', formtype+'番号').setDisplayType('disabled');
	var arrivaldateTxt='';
	if(formtype=='PO'){
		arrivaldateTxt='受領予定日';
	}else{
		arrivaldateTxt='納品希望日';
	}
	subList.addField('list_arrivaldate', 'text', arrivaldateTxt).setDisplayType('disabled');
	subList.addField('list_sellbydate', 'text', '賞味期限').setDisplayType('disabled');
	subList.addField('list_quantityshiprecv', 'text', '数量').setDisplayType('disabled');

	if (!isEmpty(itemInternalid)&&!isEmpty(weekNum)&&!isEmpty(locationid)) {
		// 保存検索作成

		var purchaseorderSearch = '';
		if(formtype=='PO'){
			purchaseorderSearch =nlapiSearchRecord("purchaseorder", null, [
				[ "type", "anyof", "PurchOrd" ],
				"AND",
				[ "mainline", "is", "F" ],
				"AND",
				[ "taxline", "is", "F" ],
				"AND",
				[ "status", "anyof", "PurchOrd:B", "PurchOrd:D", "PurchOrd:E","PurchOrd:P" ],
				"AND",
//				[ "formulanumeric: {quantityuom}-{quantityshiprecv}","greaterthan", "0" ], "AND",
				[ "item.internalid", "anyof", itemInternalid ], 
				   "AND", 
				["location.custrecord_djkk_location_area","anyof",locationid], 
				   "AND", 
				   ["subsidiary","anyof",subsidiary]
				],
				[
						new nlobjSearchColumn("expectedreceiptdate").setSort(false).setFunction('weekOfYear'),
						new nlobjSearchColumn("tranid"),
						new nlobjSearchColumn("expectedreceiptdate"),
						new nlobjSearchColumn("quantity"),
						new nlobjSearchColumn("expirationdate","inventoryDetail", null) ]);
		}else if(formtype=='SO'){
			purchaseorderSearch= nlapiSearchRecord("salesorder",null,
					[
					   ["type","anyof","SalesOrd"], 
					   "AND", 
					   ["mainline","is","F"], 
					   "AND", 
					   ["taxline","is","F"], 
					   "AND", 
					   ["status","noneof","SalesOrd:A","SalesOrd:H"], 
					   "AND", 
					   ["item.internalid","anyof",itemInternalid], 
					   "AND", 
					   ["quantityshiprecv","greaterthan","0"], 
					   "AND", 
					   ["location.custrecord_djkk_location_area","anyof",locationid], 
					   "AND", 
					   ["subsidiary","anyof",subsidiary]
					], 
					[
						new nlobjSearchColumn("custcol_djkk_delivery_hopedate").setSort(false).setFunction('weekOfYear'),
						new nlobjSearchColumn("tranid"),
						new nlobjSearchColumn("actualshipdate"),
						new nlobjSearchColumn("quantityshiprecv"),
						new nlobjSearchColumn("expirationdate","inventoryDetail", null) ]
					);
		}
		// 明細値を設定
		var itemLine = 1;
		if (!isEmpty(purchaseorderSearch)) {
			for (var n = 0; n < purchaseorderSearch.length; n++) {
				var columnID = purchaseorderSearch[n].getAllColumns();	 
				if(changeFcWeekOfYear(purchaseorderSearch[n].getValue(columnID[0]))==weekNum){
				subList.setLineItemValue('list_pono', itemLine,purchaseorderSearch[n].getValue('tranid'));
				if(formtype=='PO'){
					subList.setLineItemValue('list_arrivaldate', itemLine,purchaseorderSearch[n].getValue('expectedreceiptdate'));
					subList.setLineItemValue('list_quantityshiprecv', itemLine,purchaseorderSearch[n].getValue("quantity"));
					}else if(formtype=='SO'){
						subList.setLineItemValue('list_arrivaldate', itemLine,purchaseorderSearch[n].getValue('custcol_djkk_delivery_hopedate'));
						subList.setLineItemValue('list_quantityshiprecv', itemLine,purchaseorderSearch[n].getValue("quantityshiprecv"));
					}
				subList.setLineItemValue('list_sellbydate', itemLine,purchaseorderSearch[n].getValue("expirationdate","inventoryDetail"));
							
				itemLine++;
				}
			}
		}
	}
	response.writePage(form);
}