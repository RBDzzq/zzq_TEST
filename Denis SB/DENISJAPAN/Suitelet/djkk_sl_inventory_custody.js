/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jan 2022     LXK
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

	if (request.getMethod() == 'POST') {

	} else {
		createForm(request, response);
	}
}

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function createForm(request, response) {

	// フィールド作成
	var form = nlapiCreateForm('DJ_預かり在庫検索', false);
	form.setScript('customscript_djkk_cs_inventory_custody');

	// 預り倉庫、アイテム、アイテムグループ、ブランド、アクテビティとする。
	form.addFieldGroup('select_group', '検索項目');

	// DJ_連結
	var field_subsidiary = form.addField('custpage_subsidiary', 'select',
			'DJ_連結', null, 'select_group');
	field_subsidiary.setMandatory(true);
	var selectSub=getRoleSubsidiariesAndAddSelectOption(field_subsidiary)
	field_subsidiary.setDefaultValue(selectSub);
	
	
	
	// DJ_預かり在庫場所
	var field_location = form.addField('custpage_location', 'select',
			'DJ_預かり在庫場所', 'location', 'select_group');
	// DJ_アイテム
	var field_item = form.addField('custpage_item', 'select', 'DJ_アイテム',
			'item', 'select_group');
	// DJ_製品グループ
	var field_product_group = form.addField('custpage_product_group', 'select',
			'DJ_製品グループ', 'customrecord_djkk_product_group', 'select_group');
	// DJ_ブランド
	var field_classification = form.addField('custpage_classification',
			'select', 'DJ_ブランド', 'classification', 'select_group');
	// DJ_セクション
	var field_department = form.addField('custpage_department', 'select',
			'DJ_セクション', 'department', 'select_group');

	// 明細行作成
	var subList = form.addSubList('list', 'list', '検索結果');

	// DJ_預かり在庫場所
	subList.addField('icl_cuslocation', 'text', 'DJ_預かり在庫場所');
	// DJ_預かり在庫
	subList.addField('ic_name', 'text', 'DJ_預かり在庫');
	// // DJ_連結
	// subList.addField('ic_subsidiary', 'text', 'DJ_連結 ');
	// DJ_顧客
	subList.addField('ic_customer', 'text', 'DJ_顧客');
	// DJ_作成元
	subList.addField('ic_createdfrom', 'text', 'DJ_作成元');
	// DJ_アイテム
	subList.addField('icl_item', 'text', 'DJ_アイテム');
	// DJ_単位
	subList.addField('icl_unit', 'text', 'DJ_単位');
	// DJ_入目
	subList.addField('icl_conversionrate', 'text', 'DJ_入目');
	// DJ_在庫可能量
	subList.addField('icl_quantity_inventory', 'text', 'DJ_在庫可能量');
	// DJ_出荷予定日
	subList.addField('icl_scheduled_date', 'text', 'DJ_出荷予定日');
	// DJ_分納時対応
	subList.addField('icl_correspondence', 'text', 'DJ_分納時対応');
	// DJ-預かり在庫シリアル/ロット番号
	subList.addField('ditl_newseriallot_number', 'text', 'DJ-預かり在庫シリアル/ロット番号');
	// DJ_倉庫入庫番号
	subList.addField('ditl_warehouse_code', 'text', 'DJ_倉庫入庫番号');
	// DJ_有効期限
	subList.addField('ditl_expirationdate', 'text', 'DJ_有効期限');
	// DJ_可能
	subList.addField('ditl_quantity_possible', 'text', 'DJ_可能');

	var selectFlg = request.getParameter('selectFlg');
	var field_location_value = request.getParameter('field_location');
	var field_item_value = request.getParameter('field_item');
	var field_product_group_value = request.getParameter('field_product_group');
	var field_classification_value = request
			.getParameter('field_classification');
	var field_department_value = request.getParameter('field_department');
	var field_subsidiary_value = request.getParameter('field_subsidiary');
	if (selectFlg == 'T') {

		var csvHeader = 'DJ_預かり在庫場所 , DJ_預かり在庫  , DJ_顧客, DJ_作成元, DJ_アイテム, DJ_単位, DJ_入目, DJ_在庫可能量, DJ_出荷予定, DJ_分納時対, DJ-預かり在庫シリアル/ロット番号, DJ_倉庫入庫番号, DJ_有効期限, DJ_可能\r\n';
		var csvBody = '';

		// セット値
		field_location.setDefaultValue(field_location_value);
		field_location.setDisplayType('inline');
		field_item.setDefaultValue(field_item_value);
		field_item.setDisplayType('inline');
		field_product_group.setDefaultValue(field_product_group_value);
		field_product_group.setDisplayType('inline');
		field_classification.setDefaultValue(field_classification_value);
		field_classification.setDisplayType('inline');
		field_department.setDefaultValue(field_department_value);
		field_department.setDisplayType('inline');
		field_subsidiary.setDefaultValue(field_subsidiary_value);
		field_subsidiary.setDisplayType('inline');

		var searchParam = new Array();

		if (!isEmpty(field_location_value)) {
			searchParam.push([ "custrecord_djkk_icl_cuslocation", "anyof",
					field_location_value ]);
			searchParam.push("AND");
		}
		if (!isEmpty(field_item_value)) {
			searchParam.push([ "custrecord_djkk_icl_item", "anyof",
					field_item_value ]);
			searchParam.push("AND");
		}
		if (!isEmpty(field_product_group_value)) {
			searchParam.push([
					"custrecord_djkk_icl_item.custitem_djkk_product_group",
					"anyof", field_product_group_value ]);
			searchParam.push("AND");
		}
		if (!isEmpty(field_classification_value)) {
			searchParam.push([ "custrecord_djkk_icl_item.custitem_djkk_class",
					"anyof", field_classification_value ]);
			searchParam.push("AND");
		}
		if (!isEmpty(field_department_value)) {
			searchParam.push([
					"custrecord_djkk_icl_item.custitem_djkk_department",
					"anyof", field_department_value ]);
			searchParam.push("AND");
		}

		if (!isEmpty(field_subsidiary)) {
			searchParam
					.push([
							"custrecord_djkk_icl_inventory_in_custody.custrecord_djkk_ic_subsidiary",
							"anyof", field_subsidiary ]);
			searchParam.push("AND");
		}

		if (searchParam.length > 0
				&& searchParam[searchParam.length - 1] == 'AND') {
			searchParam.pop();
		}

		// 保存検索作成
		var custodyLSearch = getSearchResults(
				"customrecord_djkk_inventory_in_custody_l",
				null,
				searchParam,
				[
						// DJ_預かり在庫
						new nlobjSearchColumn(
								"custrecord_djkk_icl_inventory_in_custody"),
						// DJ_アイテム
						new nlobjSearchColumn("custrecord_djkk_icl_item"),
						// DJ_在庫可能量
						new nlobjSearchColumn(
								"custrecord_djkk_icl_quantity_inventory"),
						// DJ_単位
						new nlobjSearchColumn("custrecord_djkk_icl_unit"),
						// DJ_入目
						new nlobjSearchColumn(
								"custrecord_djkk_icl_conversionrate"),
						// DJ_預かり在庫場所
						new nlobjSearchColumn("custrecord_djkk_icl_cuslocation"),
						// DJ_在庫詳細ID
						new nlobjSearchColumn(
								"custrecord_djkk_icl_inventorydetails"),
						// DJ_出荷予定日
						new nlobjSearchColumn(
								"custrecord_djkk_icl_scheduled_date"),
						// DJ_分納時対応
						new nlobjSearchColumn(
								"custrecord_djkk_icl_correspondence"),

						// DJ_作成元
						new nlobjSearchColumn("custrecord_djkk_createdfrom",
								"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",
								null),
						// DJ_連結
						new nlobjSearchColumn("custrecord_djkk_ic_subsidiary",
								"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",
								null),
						// DJ_Id
						new nlobjSearchColumn("name",
								"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",
								null),
						// DJ_顧客
						new nlobjSearchColumn("custrecord_djkk_ic_customer",
								"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",
								null) ]);

		if (!isEmpty(custodyLSearch)) {

			// DJ_在庫詳細ID
			var inventorydetailsAry = [];
			for (var i = 0; i < custodyLSearch.length; i++) {
				var inventorydetails = custodyLSearch[i]
						.getValue("custrecord_djkk_icl_inventorydetails");
				if (inventorydetailsAry.indexOf(inventorydetails) == -1) {
					inventorydetailsAry.push(inventorydetails);
				}
			}
			
			var inventorySearchParam = new Array();
			//inventorySearchParam.push([ "custrecord_djkk_inventory_details","anyof", inventorydetailsAry ]);
			//inventorySearchParam.push("AND");
			inventorySearchParam.push([ "custrecord_djkk_inventory_details.isinactive","is","F"]);
			// DJ_在庫詳細リスト取得
			var inventorySearch = getSearchResults(
					"customrecord_djkk_details_in_the_library",
					null,
					inventorySearchParam,
					[
                            // 内部ID
                            new nlobjSearchColumn("custrecord_djkk_inventory_details"),
							// DJ-預かり在庫シリアル/ロット番号
							new nlobjSearchColumn(
									"custrecord_djkk_ditl_newseriallot_number"),
							// DJ_倉庫入庫番号
							new nlobjSearchColumn(
									"custrecord_djkk_ditl_warehouse_code"),
							// DJ_有効期限
							new nlobjSearchColumn(
									"custrecord_djkk_ditl_expirationdate"),
							// DJ_可能
							new nlobjSearchColumn(
									"custrecord_djkk_ditl_quantity_possible") ]);

			for (var i = 0; i < custodyLSearch.length; i++) {
				var inventory_details = custodyLSearch[i]
						.getValue('custrecord_djkk_icl_inventorydetails');

				var ic_name_value = custodyLSearch[i].getValue("name",
						"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY");
				var icl_quantity_inventory_value = custodyLSearch[i]
						.getValue('custrecord_djkk_icl_quantity_inventory');
				var ic_subsidiary_value = custodyLSearch[i].getText(
						"custrecord_djkk_ic_subsidiary",
						"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY");
				var ic_customer_value = custodyLSearch[i].getText(
						"custrecord_djkk_ic_customer",
						"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY");
				var ic_createdfrom_value = custodyLSearch[i].getText(
						"custrecord_djkk_createdfrom",
						"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY");
				var icl_item_value = custodyLSearch[i]
						.getText('custrecord_djkk_icl_item');
				var icl_unit_value = custodyLSearch[i]
						.getValue('custrecord_djkk_icl_unit');
				var icl_conversionrate_value = custodyLSearch[i]
						.getValue('custrecord_djkk_icl_conversionrate');
				var icl_cuslocation_value = custodyLSearch[i]
						.getText('custrecord_djkk_icl_cuslocation');
				var icl_scheduled_date_value = custodyLSearch[i]
						.getValue('custrecord_djkk_icl_scheduled_date');
				var icl_correspondence_value = custodyLSearch[i]
						.getValue('custrecord_djkk_icl_correspondence');
				var ditl_newseriallot_number_value ='';
				var ditl_warehouse_code_value ='';
				var ditl_expirationdate_value ='';
				var ditl_quantity_possible_value ='';
				for (var j = 0; j < inventorySearch.length; j++) {
					if(inventory_details==inventorySearch[j].getValue("custrecord_djkk_inventory_details")){
				 ditl_newseriallot_number_value = inventorySearch[j]
						.getValue("custrecord_djkk_ditl_newseriallot_number");
				 ditl_warehouse_code_value = inventorySearch[j]
						.getValue("custrecord_djkk_ditl_warehouse_code");
				 ditl_expirationdate_value = inventorySearch[j]
						.getValue("custrecord_djkk_ditl_expirationdate");
				 ditl_quantity_possible_value = inventorySearch[j]
						.getValue("custrecord_djkk_ditl_quantity_possible");
				 break;
					}
				}
				// DJ_在庫可能量
				subList.setLineItemValue('icl_quantity_inventory', i + 1,
						icl_quantity_inventory_value);
				// DJ_ID
				subList.setLineItemValue('ic_name', i + 1, ic_name_value);
				// // DJ_連結
				// subList.setLineItemValue('ic_subsidiary', i + 1,
				// ic_subsidiary_value);
				// DJ_顧客
				subList.setLineItemValue('ic_customer', i + 1,
						ic_customer_value);
				// DJ_作成元
				subList.setLineItemValue('ic_createdfrom', i + 1,
						ic_createdfrom_value);
				// DJ_アイテム
				subList.setLineItemValue('icl_item', i + 1, icl_item_value);
				// DJ_単位
				subList.setLineItemValue('icl_unit', i + 1, icl_unit_value);
				// DJ_入目
				subList.setLineItemValue('icl_conversionrate', i + 1,
						icl_conversionrate_value);
				// DJ_預かり在庫場所
				subList.setLineItemValue('icl_cuslocation', i + 1,
						icl_cuslocation_value);
				// DJ_出荷予定日
				subList.setLineItemValue('icl_scheduled_date', i + 1,
						icl_scheduled_date_value);
				// DJ_分納時対応
				subList.setLineItemValue('icl_correspondence', i + 1,
						icl_correspondence_value);

				// DJ-預かり在庫シリアル/ロット番号
				subList.setLineItemValue('ditl_newseriallot_number', i + 1,
						ditl_newseriallot_number_value);
				// DJ_倉庫入庫番号
				subList.setLineItemValue('ditl_warehouse_code', i + 1,
						ditl_warehouse_code_value);
				// DJ_有効期限
				subList.setLineItemValue('ditl_expirationdate', i + 1,
						ditl_expirationdate_value);
				// DJ_可能
				subList.setLineItemValue('ditl_quantity_possible', i + 1,
						ditl_quantity_possible_value);

				csvBody += icl_cuslocation_value + "," + ic_name_value + ","
						+ ic_customer_value + "," + ic_createdfrom_value + ","
						+ icl_item_value + "," + icl_unit_value + ","
						+ icl_conversionrate_value + ","
						+ icl_quantity_inventory_value + ","
						+ icl_scheduled_date_value + ","
						+ icl_correspondence_value + ","
						+ ditl_newseriallot_number_value + ","
						+ ditl_warehouse_code_value + ","
						+ ditl_expirationdate_value + ","
						+ ditl_quantity_possible_value + "\r\n";
			}

		}
		xmlString = csvHeader + csvBody;
		var csvDownUrl = "window.location.href='" + csvDown(xmlString) + "'";
		form.addButton('sublist_csvdownload', 'CSVダウンロード', csvDownUrl);
		form.addButton('btn_return', '戻る', 'refresh()');

	} else {
		form.addButton('btn_search', '検索', 'search()');

		// 値設定
		if (!isEmpty(field_location_value)) {
			field_location.setDefaultValue(field_location_value);
		}
		if (!isEmpty(field_item_value)) {
			field_item.setDefaultValue(field_item_value);
		}
		if (!isEmpty(field_product_group_value)) {
			field_product_group.setDefaultValue(field_product_group_value);
		}
		if (!isEmpty(field_classification_value)) {
			field_classification.setDefaultValue(field_classification_value);
		}
		if (!isEmpty(field_department_value)) {
			field_department.setDefaultValue(field_department_value);
		}
		if (!isEmpty(field_subsidiary_value)) {
			field_subsidiary.setDefaultValue(field_subsidiary_value);
		}

	}

	response.writePage(form);
}

function getSearchResultsToObj(type, id, filters, columns) {
	var search = nlapiCreateSearch(type, filters, columns);

	// 検索し、結果を渡す
	var searchResult = search.runSearch();
	var maxCount = 0;
	var results = {};
	if (!isEmpty(searchResult)) {
		var resultInfo;
		try {
			do {
				resultInfo = searchResult.getResults(maxCount, maxCount + 1000);
				if (!isEmpty(resultInfo)) {
					resultInfo.forEach(function(row) {
						results[row.id] = row;
					});
				}
				maxCount += 1000;
			} while (resultInfo.length == 1000);
		} catch (e) {
		}
	}
	return results;
}

function csvDown(xmlString) {
	try {

		var xlsFile = nlapiCreateFile('DJ_預かり在庫検索' + '_' + getFormatYmdHms()
				+ '.csv', 'CSV', xmlString);

		xlsFile.setFolder(FILE_CABINET_ID_DJ_INVENTORY_CUSTODY);
		xlsFile.setName('DJ_預かり在庫検索' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setEncoding('SHIFT_JIS');

		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		var fl = nlapiLoadFile(fileID);
		var url = fl.getURL();
		return url;
	} catch (e) {
		nlapiLogExecution('DEBUG', '', e.message)
	}
}

/**
 * システム日付と時間をフォーマットで取得
 */
function getFormatYmdHms() {

	// システム時間
	var now = getSystemTime();

	var str = now.getFullYear().toString();
	str += (now.getMonth() + 1).toString();
	str += now.getDate() + "_";
	str += now.getHours();
	str += now.getMinutes();
	str += now.getMilliseconds();

	return str;
}