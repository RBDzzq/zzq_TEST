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

	// �t�B�[���h�쐬
	var form = nlapiCreateForm('DJ_�a����݌Ɍ���', false);
	form.setScript('customscript_djkk_cs_inventory_custody');

	// �a��q�ɁA�A�C�e���A�A�C�e���O���[�v�A�u�����h�A�A�N�e�r�e�B�Ƃ���B
	form.addFieldGroup('select_group', '��������');

	// DJ_�A��
	var field_subsidiary = form.addField('custpage_subsidiary', 'select',
			'DJ_�A��', null, 'select_group');
	field_subsidiary.setMandatory(true);
	var selectSub=getRoleSubsidiariesAndAddSelectOption(field_subsidiary)
	field_subsidiary.setDefaultValue(selectSub);
	
	
	
	// DJ_�a����݌ɏꏊ
	var field_location = form.addField('custpage_location', 'select',
			'DJ_�a����݌ɏꏊ', 'location', 'select_group');
	// DJ_�A�C�e��
	var field_item = form.addField('custpage_item', 'select', 'DJ_�A�C�e��',
			'item', 'select_group');
	// DJ_���i�O���[�v
	var field_product_group = form.addField('custpage_product_group', 'select',
			'DJ_���i�O���[�v', 'customrecord_djkk_product_group', 'select_group');
	// DJ_�u�����h
	var field_classification = form.addField('custpage_classification',
			'select', 'DJ_�u�����h', 'classification', 'select_group');
	// DJ_�Z�N�V����
	var field_department = form.addField('custpage_department', 'select',
			'DJ_�Z�N�V����', 'department', 'select_group');

	// ���׍s�쐬
	var subList = form.addSubList('list', 'list', '��������');

	// DJ_�a����݌ɏꏊ
	subList.addField('icl_cuslocation', 'text', 'DJ_�a����݌ɏꏊ');
	// DJ_�a����݌�
	subList.addField('ic_name', 'text', 'DJ_�a����݌�');
	// // DJ_�A��
	// subList.addField('ic_subsidiary', 'text', 'DJ_�A�� ');
	// DJ_�ڋq
	subList.addField('ic_customer', 'text', 'DJ_�ڋq');
	// DJ_�쐬��
	subList.addField('ic_createdfrom', 'text', 'DJ_�쐬��');
	// DJ_�A�C�e��
	subList.addField('icl_item', 'text', 'DJ_�A�C�e��');
	// DJ_�P��
	subList.addField('icl_unit', 'text', 'DJ_�P��');
	// DJ_����
	subList.addField('icl_conversionrate', 'text', 'DJ_����');
	// DJ_�݌ɉ\��
	subList.addField('icl_quantity_inventory', 'text', 'DJ_�݌ɉ\��');
	// DJ_�o�ח\���
	subList.addField('icl_scheduled_date', 'text', 'DJ_�o�ח\���');
	// DJ_���[���Ή�
	subList.addField('icl_correspondence', 'text', 'DJ_���[���Ή�');
	// DJ-�a����݌ɃV���A��/���b�g�ԍ�
	subList.addField('ditl_newseriallot_number', 'text', 'DJ-�a����݌ɃV���A��/���b�g�ԍ�');
	// DJ_�q�ɓ��ɔԍ�
	subList.addField('ditl_warehouse_code', 'text', 'DJ_�q�ɓ��ɔԍ�');
	// DJ_�L������
	subList.addField('ditl_expirationdate', 'text', 'DJ_�L������');
	// DJ_�\
	subList.addField('ditl_quantity_possible', 'text', 'DJ_�\');

	var selectFlg = request.getParameter('selectFlg');
	var field_location_value = request.getParameter('field_location');
	var field_item_value = request.getParameter('field_item');
	var field_product_group_value = request.getParameter('field_product_group');
	var field_classification_value = request
			.getParameter('field_classification');
	var field_department_value = request.getParameter('field_department');
	var field_subsidiary_value = request.getParameter('field_subsidiary');
	if (selectFlg == 'T') {

		var csvHeader = 'DJ_�a����݌ɏꏊ , DJ_�a����݌�  , DJ_�ڋq, DJ_�쐬��, DJ_�A�C�e��, DJ_�P��, DJ_����, DJ_�݌ɉ\��, DJ_�o�ח\��, DJ_���[����, DJ-�a����݌ɃV���A��/���b�g�ԍ�, DJ_�q�ɓ��ɔԍ�, DJ_�L������, DJ_�\\r\n';
		var csvBody = '';

		// �Z�b�g�l
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

		// �ۑ������쐬
		var custodyLSearch = getSearchResults(
				"customrecord_djkk_inventory_in_custody_l",
				null,
				searchParam,
				[
						// DJ_�a����݌�
						new nlobjSearchColumn(
								"custrecord_djkk_icl_inventory_in_custody"),
						// DJ_�A�C�e��
						new nlobjSearchColumn("custrecord_djkk_icl_item"),
						// DJ_�݌ɉ\��
						new nlobjSearchColumn(
								"custrecord_djkk_icl_quantity_inventory"),
						// DJ_�P��
						new nlobjSearchColumn("custrecord_djkk_icl_unit"),
						// DJ_����
						new nlobjSearchColumn(
								"custrecord_djkk_icl_conversionrate"),
						// DJ_�a����݌ɏꏊ
						new nlobjSearchColumn("custrecord_djkk_icl_cuslocation"),
						// DJ_�݌ɏڍ�ID
						new nlobjSearchColumn(
								"custrecord_djkk_icl_inventorydetails"),
						// DJ_�o�ח\���
						new nlobjSearchColumn(
								"custrecord_djkk_icl_scheduled_date"),
						// DJ_���[���Ή�
						new nlobjSearchColumn(
								"custrecord_djkk_icl_correspondence"),

						// DJ_�쐬��
						new nlobjSearchColumn("custrecord_djkk_createdfrom",
								"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",
								null),
						// DJ_�A��
						new nlobjSearchColumn("custrecord_djkk_ic_subsidiary",
								"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",
								null),
						// DJ_Id
						new nlobjSearchColumn("name",
								"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",
								null),
						// DJ_�ڋq
						new nlobjSearchColumn("custrecord_djkk_ic_customer",
								"CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",
								null) ]);

		if (!isEmpty(custodyLSearch)) {

			// DJ_�݌ɏڍ�ID
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
			// DJ_�݌ɏڍ׃��X�g�擾
			var inventorySearch = getSearchResults(
					"customrecord_djkk_details_in_the_library",
					null,
					inventorySearchParam,
					[
                            // ����ID
                            new nlobjSearchColumn("custrecord_djkk_inventory_details"),
							// DJ-�a����݌ɃV���A��/���b�g�ԍ�
							new nlobjSearchColumn(
									"custrecord_djkk_ditl_newseriallot_number"),
							// DJ_�q�ɓ��ɔԍ�
							new nlobjSearchColumn(
									"custrecord_djkk_ditl_warehouse_code"),
							// DJ_�L������
							new nlobjSearchColumn(
									"custrecord_djkk_ditl_expirationdate"),
							// DJ_�\
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
				// DJ_�݌ɉ\��
				subList.setLineItemValue('icl_quantity_inventory', i + 1,
						icl_quantity_inventory_value);
				// DJ_ID
				subList.setLineItemValue('ic_name', i + 1, ic_name_value);
				// // DJ_�A��
				// subList.setLineItemValue('ic_subsidiary', i + 1,
				// ic_subsidiary_value);
				// DJ_�ڋq
				subList.setLineItemValue('ic_customer', i + 1,
						ic_customer_value);
				// DJ_�쐬��
				subList.setLineItemValue('ic_createdfrom', i + 1,
						ic_createdfrom_value);
				// DJ_�A�C�e��
				subList.setLineItemValue('icl_item', i + 1, icl_item_value);
				// DJ_�P��
				subList.setLineItemValue('icl_unit', i + 1, icl_unit_value);
				// DJ_����
				subList.setLineItemValue('icl_conversionrate', i + 1,
						icl_conversionrate_value);
				// DJ_�a����݌ɏꏊ
				subList.setLineItemValue('icl_cuslocation', i + 1,
						icl_cuslocation_value);
				// DJ_�o�ח\���
				subList.setLineItemValue('icl_scheduled_date', i + 1,
						icl_scheduled_date_value);
				// DJ_���[���Ή�
				subList.setLineItemValue('icl_correspondence', i + 1,
						icl_correspondence_value);

				// DJ-�a����݌ɃV���A��/���b�g�ԍ�
				subList.setLineItemValue('ditl_newseriallot_number', i + 1,
						ditl_newseriallot_number_value);
				// DJ_�q�ɓ��ɔԍ�
				subList.setLineItemValue('ditl_warehouse_code', i + 1,
						ditl_warehouse_code_value);
				// DJ_�L������
				subList.setLineItemValue('ditl_expirationdate', i + 1,
						ditl_expirationdate_value);
				// DJ_�\
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
		form.addButton('sublist_csvdownload', 'CSV�_�E�����[�h', csvDownUrl);
		form.addButton('btn_return', '�߂�', 'refresh()');

	} else {
		form.addButton('btn_search', '����', 'search()');

		// �l�ݒ�
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

	// �������A���ʂ�n��
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

		var xlsFile = nlapiCreateFile('DJ_�a����݌Ɍ���' + '_' + getFormatYmdHms()
				+ '.csv', 'CSV', xmlString);

		xlsFile.setFolder(FILE_CABINET_ID_DJ_INVENTORY_CUSTODY);
		xlsFile.setName('DJ_�a����݌Ɍ���' + '_' + getFormatYmdHms() + '.csv');
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
 * �V�X�e�����t�Ǝ��Ԃ��t�H�[�}�b�g�Ŏ擾
 */
function getFormatYmdHms() {

	// �V�X�e������
	var now = getSystemTime();

	var str = now.getFullYear().toString();
	str += (now.getMonth() + 1).toString();
	str += now.getDate() + "_";
	str += now.getHours();
	str += now.getMinutes();
	str += now.getMilliseconds();

	return str;
}