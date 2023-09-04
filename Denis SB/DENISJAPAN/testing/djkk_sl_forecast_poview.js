/**
 * SC��FC�쐬PO���X�g
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
	var form = nlapiCreateForm('DJ_SC��FC�쐬'+formtype+'���X�g', true);
	
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
	//20230707 changed by zhou start
	if(formtype=='PO'){
	    subList.addField('list_pono', 'text', formtype+'�ԍ�').setDisplayType('disabled');
	}else{
		subList.addField('list_pono', 'text', '�h�L�������g�ԍ�').setDisplayType('disabled');
	}
	//20230707 changed by zhou end
	var arrivaldateTxt='';
	if(formtype=='PO'){
		arrivaldateTxt='��̗\���';
		subList.addField('list_vendor', 'text', '�d����').setDisplayType('disabled');
	}else{
		arrivaldateTxt='�[�i��';//20230707 changed by zhou
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
		// ���גl��ݒ�
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
						head = '�N���W�b�g����';
					}else if(purchaseorderSearch[n].getValue('type') == "CustInvc"){
						head = '������';
					}
					subList.setLineItemValue('list_pono', itemLine,head+' #'+purchaseorderSearch[n].getValue('tranid'));
				}
				if(formtype=='PO'){
				subList.setLineItemValue('list_arrivaldate', itemLine,purchaseorderSearch[n].getValue('expectedreceiptdate'));
				//20230427 add by zhou start Ch455
				//zhou memo :�݌ɏڍׂ�2�s�ɕ�����Ă���PO��Actual In�ŕ\�������PO���ׂ̐��ʂ��\�������B
				//���݂̌������ʂɂ��A���C�u�������̏ڍׂ����o����A�f�[�^���\�z�O�ɂȂ邱�Ƃ�����܂�
				//������F�݃��C�u�����ڍׂ����݂���ꍇ�A�݃��C�u�����ڍא���po�ڍא������D�悳���
				var poLineQuan =  purchaseorderSearch[n].getValue("quantity");
				var poInvLineQuan =  purchaseorderSearch[n].getValue("quantity","inventoryDetail", null);//�݌ɏڍא�
				if(!isEmpty(poInvLineQuan)){
					subList.setLineItemValue('list_quantityshiprecv', itemLine,poInvLineQuan);
				}else{
					subList.setLineItemValue('list_quantityshiprecv', itemLine,poLineQuan);
				}
				//20230427 add by zhou end
				subList.setLineItemValue('list_vendor', itemLine,purchaseorderSearch[n].getValue("altname","vendor",null));
				}else{
					var soLineQuan =  purchaseorderSearch[n].getValue("quantity");
					var soInvLineQuan =  purchaseorderSearch[n].getValue("quantity","inventoryDetail", null);//�݌ɏڍא� 
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