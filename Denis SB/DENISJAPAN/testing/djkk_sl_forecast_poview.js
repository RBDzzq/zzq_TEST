/**
 * SC課FC作成POリスト
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
	var form = nlapiCreateForm('DJ_SC課FC作成'+formtype+'リスト', true);
	
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
	//20230707 changed by zhou start
	if(formtype=='PO'){
	    subList.addField('list_pono', 'text', formtype+'番号').setDisplayType('disabled');
	}else{
		subList.addField('list_pono', 'text', 'ドキュメント番号').setDisplayType('disabled');
	}
	//20230707 changed by zhou end
	var arrivaldateTxt='';
	if(formtype=='PO'){
		arrivaldateTxt='受領予定日';
		subList.addField('list_vendor', 'text', '仕入先').setDisplayType('disabled');
	}else{
		arrivaldateTxt='納品日';//20230707 changed by zhou
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
//				"AND",
//				[ "status", "anyof", "PurchOrd:B", "PurchOrd:D", "PurchOrd:E","PurchOrd:P" ],
			    "AND", 
			    ["approvalstatus","anyof","1","2"],
				"AND",
//				[ "formulanumeric: {quantityuom}-{quantityshiprecv}","greaterthan", "0" ], "AND",
				[ "item", "anyof", itemInternalid ], 
				"AND", 
				["location.custrecord_djkk_location_area","anyof",locationid], 
				"AND", 
				["subsidiary","anyof",subsidiary],
				"AND", 
				["vendor.custentity_djkk_fc_flag","is","T"]
				],
				[
						new nlobjSearchColumn("expectedreceiptdate").setSort(false).setFunction('weekOfYear'),
						new nlobjSearchColumn("tranid"),
						new nlobjSearchColumn("expectedreceiptdate"),
						new nlobjSearchColumn("quantity"),
						new nlobjSearchColumn("expirationdate","inventoryDetail", null),
						new nlobjSearchColumn("quantity","inventoryDetail", null),//20230427 add by zhou 
						new nlobjSearchColumn("altname","vendor",null) ]);
		}else{
			purchaseorderSearch= nlapiSearchRecord("transaction",null,
					//20230707 changed by zhou start
					[
					   ["type","anyof","CustCred","CustInvc"], 
//					   "AND", 
//					   ["status","anyof","CustInvc:B","CustCred:B"], //20230713 changed by zhou
					   "AND",  
					   ["mainline","is","F"], 
					   "AND", 
					   ["taxline","is","F"], 
					   "AND", 
					   ["cogs","is","F"],
					   "AND", 
					   ["item.internalid","anyof",itemInternalid], 
					   "AND", 
					   ["quantity","greaterthan","0"], 
						"AND", 
					   ["location.custrecord_djkk_location_area","anyof",locationid], 
					   "AND", 
					   ["subsidiary","anyof",subsidiary]
					], 
					[
						new nlobjSearchColumn("custbody_djkk_delivery_date").setSort(false).setFunction('weekOfYear'), 
						new nlobjSearchColumn("tranid"),
						new nlobjSearchColumn("custbody_djkk_delivery_date"),
						new nlobjSearchColumn("quantity"),
						new nlobjSearchColumn("quantity","inventoryDetail", null),
						new nlobjSearchColumn("expirationdate","inventoryDetail", null),
						new nlobjSearchColumn("type")//20230427 add by zhou CH676
						]
					);
			//20230707 changed by zhou end
		}
		// 明細値を設定
		var itemLine = 1;
		if (!isEmpty(purchaseorderSearch)) {
			nlapiLogExecution('debug','purchaseorderSearch.length',purchaseorderSearch.length)
			for (var n = 0; n < purchaseorderSearch.length; n++) {
				var columnID = purchaseorderSearch[n].getAllColumns();	 
				if(newChangeFcWeekOfYear(purchaseorderSearch[n].getValue(columnID[0]))==weekNum){
				if(formtype=='PO'){
					subList.setLineItemValue('list_pono', itemLine,purchaseorderSearch[n].getValue('tranid'));
				}else{
					var head = '';
					if(purchaseorderSearch[n].getValue('type') == "CustCred"){
						head = 'クレジットメモ';
					}else if(purchaseorderSearch[n].getValue('type') == "CustInvc"){
						head = '請求書';
					}
					subList.setLineItemValue('list_pono', itemLine,head+' #'+purchaseorderSearch[n].getValue('tranid'));
				}
				if(formtype=='PO'){
				subList.setLineItemValue('list_arrivaldate', itemLine,purchaseorderSearch[n].getValue('expectedreceiptdate'));
				//20230427 add by zhou start Ch455
				//zhou memo :在庫詳細が2行に分かれているPOをActual Inで表示するとPO明細の数量が表示される。
				//現在の検索結果により、ライブラリ内の詳細が抽出され、データが予想外になることがあります
				//解決策：在ライブラリ詳細が存在する場合、在ライブラリ詳細数はpo詳細数よりも優先される
				var poLineQuan =  purchaseorderSearch[n].getValue("quantity");
				var poInvLineQuan =  purchaseorderSearch[n].getValue("quantity","inventoryDetail", null);//在庫詳細数
				if(!isEmpty(poInvLineQuan)){
					subList.setLineItemValue('list_quantityshiprecv', itemLine,poInvLineQuan);
				}else{
					subList.setLineItemValue('list_quantityshiprecv', itemLine,poLineQuan);
				}
				//20230427 add by zhou end
				subList.setLineItemValue('list_vendor', itemLine,purchaseorderSearch[n].getValue("altname","vendor",null));
				}else{
					var soLineQuan =  purchaseorderSearch[n].getValue("quantity");
					var soInvLineQuan =  purchaseorderSearch[n].getValue("quantity","inventoryDetail", null);//在庫詳細数 
					if(!isEmpty(soInvLineQuan)){
						subList.setLineItemValue('list_quantityshiprecv', itemLine,Math.abs(soInvLineQuan));
					}else{
						subList.setLineItemValue('list_quantityshiprecv', itemLine,Math.abs(soLineQuan));
					}
					subList.setLineItemValue('list_arrivaldate', itemLine,purchaseorderSearch[n].getValue('custbody_djkk_delivery_date'));
					
				}
				//20230707 changed by zhou end
				subList.setLineItemValue('list_sellbydate', itemLine,purchaseorderSearch[n].getValue("expirationdate","inventoryDetail"));
					
				itemLine++;
				}
			}
		}
	}
	response.writePage(form);
}