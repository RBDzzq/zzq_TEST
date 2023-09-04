/**
 * SC��FC�쐬PO���X�g_LS
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/11     CPC_��
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
	// �w�b�_�[��
	var form = nlapiCreateForm('DJ_SC��FC�쐬'+formtype+'���X�g_LS', true);
	
	// �������ڂ��쐬
	form.addFieldGroup('custpage_group_filter', '�w�b�_�[');
	var itemField = form.addField('custpage_item', 'text', '�A�C�e��','null', 'custpage_group_filter').setDisplayType('inline');
	var yearField = form.addField('custpage_year', 'text', '�N', 'null','custpage_group_filter').setDisplayType('inline');
	var weekField = form.addField('custpage_week', 'text', '�T', 'null','custpage_group_filter').setDisplayType('inline');//20230522 changed by zhou �u���v��>�u�T�v
	var locationField = form.addField('custpage_location', 'text', '�ꏊ', 'null','custpage_group_filter').setDisplayType('inline');
	var firstDateField = form.addField('custpage_field_firstdate', 'date','�t�@�X�g�f�[�g', 'null', 'custpage_group_filter').setDisplayType('inline');

	// �p�����[�^�擾
	var weekNum = request.getParameter('weeknum');
	var itemInternalid = request.getParameter('item');
	var wkFirstDay = request.getParameter('firstdate');
	var locationid = request.getParameter('locationid');
	var subsidiary = request.getParameter('subsidiary');
	

	// �A�C�e�����O�擾
	if (!isEmpty(itemInternalid)) {
		var itemName = nlapiLookupField('item', itemInternalid, 'name');
		
		// �l�̐ݒ�
		if (!isEmpty(itemName)) {
			itemField.setDefaultValue(itemName);
		}
	}
	
	// �ꏊ�擾
	if (!isEmpty(locationid)) {
		var locationName = nlapiLookupField('customrecord_djkk_location_area',locationid,'name');
		
		// �l�̐ݒ�
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

	// ���׍쐬
	var subList = form.addSubList('custpage_list', 'list', '����');
	subList.addField('list_pono', 'text', formtype+'�ԍ�').setDisplayType('disabled');
	var arrivaldateTxt='';
	if(formtype=='PO'){
		arrivaldateTxt='��̗\���';
	}else{
		arrivaldateTxt='�[�i��]��';
	}
	subList.addField('list_arrivaldate', 'text', arrivaldateTxt).setDisplayType('disabled');
	subList.addField('list_sellbydate', 'text', '�ܖ�����').setDisplayType('disabled');
	subList.addField('list_quantityshiprecv', 'text', '����').setDisplayType('disabled');

	if (!isEmpty(itemInternalid)&&!isEmpty(weekNum)&&!isEmpty(locationid)) {
		// �ۑ������쐬

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
		// ���גl��ݒ�
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