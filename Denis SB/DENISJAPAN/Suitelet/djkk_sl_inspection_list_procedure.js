/**
 * DJ_���i�ꗗ���-���i�菇
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/19     CPC_��
 *
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var form = nlapiCreateForm('DJ_�݌Ɍ��i�菇�ꗗ���', true);
	form.setScript('customscript_djkk_cs_inspection_list_pro');
	var transactionId=request.getParameter('transactionID');
	var itemId=request.getParameter('itemID');
	var invnumberId=request.getParameter('inventoryID');
	var id=request.getParameter('keyId');
	
	var locationValue = request.getParameter('location')
	var subsidiaryValue = request.getParameter('subsidiary')
	var maxItemCount = request.getParameter('maxItemCount');
	var binnumberValue = request.getParameter('binnumber');
	
	
	
	// ��ʍ��ڍ쐬
	form.addFieldGroup('custpage_group', 'DJ_�݌Ɍ��i�菇');
	var transactionname=form.addField('custpage_transaction', 'text', 'DJ_�g�����U�N�V����', 'null', 'custpage_group').setDisplayType('inline');
	var transactionfield=form.addField('custpage_transactionid', 'text', 'DJ_�g�����U�N�V����ID', 'null', 'custpage_group').setDisplayType('hidden');
	
	var itemname=form.addField('custpage_item', 'text', 'DJ_�A�C�e��', 'null', 'custpage_group').setDisplayType('inline');
	var itemidfield=form.addField('custpage_itemid', 'text', 'DJ_�A�C�e��ID', 'null', 'custpage_group').setDisplayType('hidden');
	
	var invnumbername=form.addField('custpage_invname', 'text', 'DJ_�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j', 'null', 'custpage_group').setDisplayType('inline');
	var invnumberidfield=form.addField('custpage_invid', 'text', 'DJ_�Ǘ��ԍ��i�V���A��/���b�g�ԍ��jID', 'null', 'custpage_group').setDisplayType('hidden');
	var inspectionlevel=form.addField('custpage_inspectionlevel', 'text', 'DJ_���i���x��', 'null', 'custpage_group').setDisplayType('inline');
	var inspectionlevelid=form.addField('custpage_inspectionlevelid', 'text', 'DJ_���i���x��ID', 'null', 'custpage_group').setDisplayType('hidden');	
	var inspected=form.addField('custpage_inspected', 'checkbox', ' DJ_���i��', 'null', 'custpage_group').setDisplayType('inline');
	var inspectedid=form.addField('custpage_inspectedid', 'text', 'DJ_�݌Ɍ��i�菇ID', 'null', 'custpage_group').setDisplayType('hidden');

	var moveMaxCount=form.addField('custpage_move_count', 'text', '�ړ��\����', 'null', 'custpage_group').setDisplayType('inline');
	moveMaxCount.setDefaultValue(maxItemCount);
	
	var location=form.addField('custpage_location', 'select', ' �ړ����q��', 'location', 'custpage_group').setDisplayType('inline');
	var binnumberField=form.addField('custpage_binnumber', 'select', ' �ړ����ۊǒI', 'bin', 'custpage_group').setDisplayType('inline');
	binnumberField.setDefaultValue(binnumberValue)
	var subsidiary=form.addField('custpage_subsidiary', 'select', 'DJ_�A��', 'subsidiary', 'custpage_group').setDisplayType('inline');
	location.setDefaultValue(locationValue)
	subsidiary.setDefaultValue(subsidiaryValue)
	
	form.addSubTab('custpage_proceduredetails', '���i�菇');
	// ���׍쐬_���i�菇�}�X�^�[�ɂ��A
	if(checkkenpinteijun(itemId)){
		var subList = form.addSubList('proceduredetails', 'list', '���i�菇','custpage_procedure');
		subList.addField('checkbox', 'checkbox','DJ_�菇���i��');
		subList.addField('procedurenumber', 'text', 'DJ_�菇NO').setDisplayType('disabled');
		subList.addField('procedurecontents', 'text', '�菇���e').setDisplayType('disabled');
		subList.addField('personincharge', 'text', 'DJ_�S����').setDisplayType('disabled');
		subList.addField('personincharge_id', 'text', 'DJ_�S����ID').setDisplayType('hidden');
	}
	

	
	// ���׍쐬_���i���� 
	form.addSubTab('custpage_procedureresultdetails', '���i����');
	var subListReresult = form.addSubList('procedureresultdetails', 'inlineeditor', '���i����','custpage_procedure');
	var iprSubsidiaryField=subListReresult.addField('ipr_subsidiary', 'select', '�q���','subsidiary');
	iprSubsidiaryField.setDisplayType('hidden');
	iprSubsidiaryField.setDefaultValue(subsidiaryValue);
	var iprClassField=subListReresult.addField('ipr_class', 'select', '�敪','customlist_djkk_inv_ip_result_class');
	iprClassField.setDisplayType('entry');
	iprClassField.setMandatory(true);
	var iprQuantityField=subListReresult.addField('ipr_quantity', 'text', '����');
	iprQuantityField.setDisplayType('entry');
	iprQuantityField.setMandatory(true);
	var iprMoveLocationField=subListReresult.addField('ipr_move_location', 'select', '�ړ��ꏊ');
	iprMoveLocationField.addSelectOption('0', '', true);
	iprMoveLocationField.setDisplayType('entry');
	iprMoveLocationField.setMandatory(true);
	
	var iprMoveBinField = subListReresult.addField('ipr_move_bin', 'select', '�ۊǒI');
	iprMoveBinField.addSelectOption('', '', true);
	iprMoveBinField.setDisplayType('entry');

	var iprMoveReasonField=subListReresult.addField('ipr_move_reason', 'select', '�ړ����R');
	iprMoveReasonField.setDisplayType('entry');
	iprMoveReasonField.addSelectOption('0', '', true);
	subListReresult.addField('ipr_detail_reason', 'select', '�ڍח��R','customrecord_djkk_inspe_reasondetail').setDisplayType('entry');
	var lot_remark=subListReresult.addField('lot_remark', 'select', '���b�g���}�[�N','');	
	var lot_memo=subListReresult.addField('lot_memo', 'text', '���b�g����');
	//20220519 add by zhou start
	var makerNum=subListReresult.addField('custpage_makernum', 'text', '���[�J�[�����ԍ�').setDisplayType('entry');;
	var dueTime=subListReresult.addField('custpage_duetime', 'date', '�L������').setDisplayType('hidden');;
	var manufacturingDay=subListReresult.addField('custpage_date', 'date', '������').setDisplayType('entry');;
	var deliveryPeriod=subListReresult.addField('custpage_deliveryperiod', 'date', '�o�׊���').setDisplayType('entry');;
	//20220519 add by zhou end
	
	var locationLst = new Array();
	locationLst.push("location");
	locationLst.push("anyof");
	
	var lot_remarkSearch = nlapiSearchRecord("customrecord_djkk_lot_remark",null,
			[
			   ["custrecord_djkk_lot_remark_subsidiary","anyof",subsidiaryValue]
			], 
			[
			 new nlobjSearchColumn("internalid"), 
			 new nlobjSearchColumn("name")
			]
			);
	lot_remark.addSelectOption('', '', true);
	if (!isEmpty(lot_remarkSearch)) {
		for (var rlms = 0; rlms < lot_remarkSearch.length; rlms++) {
			lot_remark.addSelectOption(lot_remarkSearch[rlms].getValue('internalid'), lot_remarkSearch[rlms].getValue('name'));
			
		}
	}
	
	var iprReasonSearch = nlapiSearchRecord("customrecord_djkk_invadjst_change_reason",null,
			[
			   ["custrecord_djkk_reson_subsidiary","anyof",subsidiaryValue], 
			   "AND", 
			   ["custrecord_djkk_not_ic_flag","is","T"]
			], 
			[
			 new nlobjSearchColumn("internalid"), 
			 new nlobjSearchColumn("name").setSort(false)
			]
			);
	if (!isEmpty(iprReasonSearch)) {
		for (var ipri = 0; ipri < iprReasonSearch.length; ipri++) {
			iprMoveReasonField.addSelectOption(iprReasonSearch[ipri].getValue('internalid'), iprReasonSearch[ipri].getValue('name'));
			
		}
	}
	
	//�e�ꏊ�擾
	var locationRecord = nlapiLoadRecord('location', locationValue);
	var parent = locationRecord.getFieldValue('parent');
	var parentName = "";
	if(!isEmpty(parent)){
		parentName = nlapiLookupField('location', parent , 'name');
	}
	
	// �q�ɐݒ�
	var lineLocationSearch = nlapiSearchRecord("location",null,
			[["subsidiary","anyof",subsidiaryValue] , "AND" ,  ["name","contains",parentName]]
			, 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("name").setSort(false)
			]
			);

	if (!isEmpty(lineLocationSearch)) {
		for (var m = 0; m < lineLocationSearch.length; m++) {
			iprMoveLocationField.addSelectOption(lineLocationSearch[m].getValue('internalid'), lineLocationSearch[m].getValue('name'));
			locationLst.push(lineLocationSearch[m].getValue('internalid'))
		}
	}
	
	//�ۊǒI�ݒ�
	//�q�Ƀr�� �i�I�ԁj
	var filedLocationShelfList = getSearchResults("bin",null,
			[
			 locationLst
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("location"), 
			   new nlobjSearchColumn("binnumber").setSort(false)
			]
			);
	
	
	for(var i = 0; i<filedLocationShelfList.length;i++){
		iprMoveBinField.addSelectOption(filedLocationShelfList[i].getValue("internalid"),'('+filedLocationShelfList[i].getText("location")+')'+filedLocationShelfList[i].getValue("binnumber"));
	}
	
	
	if(id == '-1'){
		// ���i�}�X�^����̃f�[�^
		form.addButton('sublist_chkokbtn', '���i��','chkok()');
		
		// ��ʂɃf�[�^��ݒ肵�܂��B�i�{�f�B�j
		if (!isEmpty(transactionId)&&!isEmpty(itemId)&&!isEmpty(invnumberId)) {
			try {
				transactionname.setDefaultValue(nlapiLookupField('transaction', transactionId,'transactionname'));
				transactionfield.setDefaultValue(transactionId);
				itemname.setDefaultValue(nlapiLookupField('item', itemId,'name'));
				itemidfield.setDefaultValue(itemId);
				invnumbername.setDefaultValue(nlapiLookupField('inventorynumber',invnumberId,'inventorynumber'));
				invnumberidfield.setDefaultValue(invnumberId);
				inspectionlevel.setDefaultValue(nlapiLookupField('item', itemId,'custitem_djkk_inspection_level', true));
				inspectionlevelid.setDefaultValue(nlapiLookupField('item', itemId,'custitem_djkk_inspection_level'));	

			} catch (e) {
			}
		}
		
		// ��ʒl��ݒ肵�܂��B�i���ׁj
		if(checkkenpinteijun(itemId)){
			var procedureSearch = nlapiSearchRecord("customrecord_djkk_inspection_procedure",null,
					[
	                  ["custrecord_djkk_ip_item","anyof",itemId]
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_ip_procedure_number"), 
					   new nlobjSearchColumn("custrecord_djkk_ip_procedure_contents"), 
					   new nlobjSearchColumn("custrecord_djkk_ip_person_in_charge")
					]
					);
			var itemLine = 1;
			if (!isEmpty(procedureSearch)) {
				for (var i = 0; i < procedureSearch.length; i++) {
					subList.setLineItemValue('procedurenumber', itemLine, procedureSearch[i].getValue('custrecord_djkk_ip_procedure_number'));
					subList.setLineItemValue('procedurecontents', itemLine, procedureSearch[i].getValue('custrecord_djkk_ip_procedure_contents'));
					subList.setLineItemValue('personincharge', itemLine, procedureSearch[i].getText('custrecord_djkk_ip_person_in_charge'));
					subList.setLineItemValue('personincharge_id', itemLine, procedureSearch[i].getValue('custrecord_djkk_ip_person_in_charge'));
					itemLine++;
				}
			}
		}		
		
	}else{
		//�e�[�u������̃f�[�^
		
	form.addButton('sublist_upbtn', '�X�V','up()');	
	form.addButton('sublist_upbtn', '�폜','droup()');	

	var customrecord_djkk_inv_ip = nlapiLoadRecord('customrecord_djkk_inv_ip',id);
	

	
	inspectedid.setDefaultValue(id);
	transactionname.setDefaultValue(customrecord_djkk_inv_ip.getFieldText('custrecord_djkk_inv_transaction_number'));
	transactionfield.setDefaultValue(customrecord_djkk_inv_ip.getFieldValue('custrecord_djkk_inv_transaction_number'))	
	itemname.setDefaultValue(customrecord_djkk_inv_ip.getFieldText('custrecord_djkk_inv_ip_item'));
	itemidfield.setDefaultValue(customrecord_djkk_inv_ip.getFieldValue('custrecord_djkk_inv_ip_item'))
	inspectionlevel.setDefaultValue(customrecord_djkk_inv_ip.getFieldText('custrecord_djkk_inv_ip_inspection_level'));
	inspectionlevelid.setDefaultValue(customrecord_djkk_inv_ip.getFieldValue('custcustrecord_djkk_inv_ip_inspection_levelrecord_djkk_inv_ip_item'))
	invnumbername.setDefaultValue(customrecord_djkk_inv_ip.getFieldText('custrecord_djkk_inv_ip_invnumber'));
	invnumberidfield.setDefaultValue(customrecord_djkk_inv_ip.getFieldValue('custrecord_djkk_inv_ip_invnumber'))
	inspected.setDefaultValue(customrecord_djkk_inv_ip.getFieldValue('custrecord_djkk_inv_ip_inspected'))
	binnumberField.setDefaultValue(customrecord_djkk_inv_ip.getFieldValue('custrecord_djkk_inv_ip_bin'))
	
	
	//LS�ꍇ�菇�\��
	if(checkkenpinteijun(itemId)){
		var lineCount = customrecord_djkk_inv_ip.getLineItemCount('recmachcustrecord_djkk_inv_ipl_main')

		for (var i = 0; i < lineCount; i++) {
			customrecord_djkk_inv_ip.selectLineItem('recmachcustrecord_djkk_inv_ipl_main', i+1);
			
			subList.setLineItemValue('checkbox', i+1,customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_inspected'));
			subList.setLineItemValue('procedurenumber', i+1,customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_procedure_number') );
			subList.setLineItemValue('procedurecontents', i+1, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_procedure_co') );
			subList.setLineItemValue('personincharge', i+1, customrecord_djkk_inv_ip.getCurrentLineItemText('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_person_in_charge') );
			subList.setLineItemValue('personincharge_id', i+1, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_person_in_charge') );
		
		}
	}
	
	
	var iprCount = customrecord_djkk_inv_ip.getLineItemCount('recmachcustrecord_djkk_inv_ipr_main')

	for (var j = 1; j < iprCount+1; j++) {
		customrecord_djkk_inv_ip.selectLineItem('recmachcustrecord_djkk_inv_ipr_main', j);
		
		subListReresult.setLineItemValue('ipr_subsidiary', j,customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_subsidiary'));
		subListReresult.setLineItemValue('ipr_class', j,customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_class'));
		subListReresult.setLineItemValue('ipr_quantity', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_quantity'));
		subListReresult.setLineItemValue('ipr_move_location', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_location'));
		subListReresult.setLineItemValue('ipr_move_reason', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_reason'));
		subListReresult.setLineItemValue('ipr_detail_reason', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_detail_reason'));
		//�ۊǒI
		subListReresult.setLineItemValue('ipr_move_bin', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_bin'));
		//20220519 add by zhou start
		subListReresult.setLineItemValue('custpage_makernum', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_makern'));//���[�J�[�����ԍ�
		subListReresult.setLineItemValue('custpage_duetime', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_duetime'));//�ܖ�����
		subListReresult.setLineItemValue('custpage_date', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_madedate'));//������
		subListReresult.setLineItemValue('custpage_deliveryperiod', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_deliveryperiod'));//�o�׊���
		//20220519 add by zhou end
		subListReresult.setLineItemValue('lot_remark', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_remark'));
		subListReresult.setLineItemValue('lot_memo', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_memo'));
	  }		
	}


	
	
	
	response.writePage(form);
}

function checkkenpinteijun(item){
	if(isEmpty(item)){
		return false;
	}
	var rst = nlapiSearchRecord("customrecord_djkk_inspection_procedure",null,
			[
			   ["custrecord_djkk_ip_item","anyof",item],
			   "AND", 
			   ["isinactive","is","F"]
			], 
			[
			 new nlobjSearchColumn("internalid")
			]
			);
	
	if(!isEmpty(rst)){
		if(rst.length>0){
			return true;
		}
	}
	return false;
}
