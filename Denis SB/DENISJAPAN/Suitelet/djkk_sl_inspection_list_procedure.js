/**
 * DJ_検品一覧画面-検品手順
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/19     CPC_苑
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
	var form = nlapiCreateForm('DJ_在庫検品手順一覧画面', true);
	form.setScript('customscript_djkk_cs_inspection_list_pro');
	var transactionId=request.getParameter('transactionID');
	var itemId=request.getParameter('itemID');
	var invnumberId=request.getParameter('inventoryID');
	var id=request.getParameter('keyId');
	
	var locationValue = request.getParameter('location')
	var subsidiaryValue = request.getParameter('subsidiary')
	var maxItemCount = request.getParameter('maxItemCount');
	var binnumberValue = request.getParameter('binnumber');
	
	
	
	// 画面項目作成
	form.addFieldGroup('custpage_group', 'DJ_在庫検品手順');
	var transactionname=form.addField('custpage_transaction', 'text', 'DJ_トランザクション', 'null', 'custpage_group').setDisplayType('inline');
	var transactionfield=form.addField('custpage_transactionid', 'text', 'DJ_トランザクションID', 'null', 'custpage_group').setDisplayType('hidden');
	
	var itemname=form.addField('custpage_item', 'text', 'DJ_アイテム', 'null', 'custpage_group').setDisplayType('inline');
	var itemidfield=form.addField('custpage_itemid', 'text', 'DJ_アイテムID', 'null', 'custpage_group').setDisplayType('hidden');
	
	var invnumbername=form.addField('custpage_invname', 'text', 'DJ_管理番号（シリアル/ロット番号）', 'null', 'custpage_group').setDisplayType('inline');
	var invnumberidfield=form.addField('custpage_invid', 'text', 'DJ_管理番号（シリアル/ロット番号）ID', 'null', 'custpage_group').setDisplayType('hidden');
	var inspectionlevel=form.addField('custpage_inspectionlevel', 'text', 'DJ_検品レベル', 'null', 'custpage_group').setDisplayType('inline');
	var inspectionlevelid=form.addField('custpage_inspectionlevelid', 'text', 'DJ_検品レベルID', 'null', 'custpage_group').setDisplayType('hidden');	
	var inspected=form.addField('custpage_inspected', 'checkbox', ' DJ_検品済', 'null', 'custpage_group').setDisplayType('inline');
	var inspectedid=form.addField('custpage_inspectedid', 'text', 'DJ_在庫検品手順ID', 'null', 'custpage_group').setDisplayType('hidden');

	var moveMaxCount=form.addField('custpage_move_count', 'text', '移動可能数量', 'null', 'custpage_group').setDisplayType('inline');
	moveMaxCount.setDefaultValue(maxItemCount);
	
	var location=form.addField('custpage_location', 'select', ' 移動元倉庫', 'location', 'custpage_group').setDisplayType('inline');
	var binnumberField=form.addField('custpage_binnumber', 'select', ' 移動元保管棚', 'bin', 'custpage_group').setDisplayType('inline');
	binnumberField.setDefaultValue(binnumberValue)
	var subsidiary=form.addField('custpage_subsidiary', 'select', 'DJ_連結', 'subsidiary', 'custpage_group').setDisplayType('inline');
	location.setDefaultValue(locationValue)
	subsidiary.setDefaultValue(subsidiaryValue)
	
	form.addSubTab('custpage_proceduredetails', '検品手順');
	// 明細作成_検品手順マスターにより、
	if(checkkenpinteijun(itemId)){
		var subList = form.addSubList('proceduredetails', 'list', '検品手順','custpage_procedure');
		subList.addField('checkbox', 'checkbox','DJ_手順検品済');
		subList.addField('procedurenumber', 'text', 'DJ_手順NO').setDisplayType('disabled');
		subList.addField('procedurecontents', 'text', '手順内容').setDisplayType('disabled');
		subList.addField('personincharge', 'text', 'DJ_担当者').setDisplayType('disabled');
		subList.addField('personincharge_id', 'text', 'DJ_担当者ID').setDisplayType('hidden');
	}
	

	
	// 明細作成_検品結果 
	form.addSubTab('custpage_procedureresultdetails', '検品結果');
	var subListReresult = form.addSubList('procedureresultdetails', 'inlineeditor', '検品結果','custpage_procedure');
	var iprSubsidiaryField=subListReresult.addField('ipr_subsidiary', 'select', '子会社','subsidiary');
	iprSubsidiaryField.setDisplayType('hidden');
	iprSubsidiaryField.setDefaultValue(subsidiaryValue);
	var iprClassField=subListReresult.addField('ipr_class', 'select', '区分','customlist_djkk_inv_ip_result_class');
	iprClassField.setDisplayType('entry');
	iprClassField.setMandatory(true);
	var iprQuantityField=subListReresult.addField('ipr_quantity', 'text', '数量');
	iprQuantityField.setDisplayType('entry');
	iprQuantityField.setMandatory(true);
	var iprMoveLocationField=subListReresult.addField('ipr_move_location', 'select', '移動場所');
	iprMoveLocationField.addSelectOption('0', '', true);
	iprMoveLocationField.setDisplayType('entry');
	iprMoveLocationField.setMandatory(true);
	
	var iprMoveBinField = subListReresult.addField('ipr_move_bin', 'select', '保管棚');
	iprMoveBinField.addSelectOption('', '', true);
	iprMoveBinField.setDisplayType('entry');

	var iprMoveReasonField=subListReresult.addField('ipr_move_reason', 'select', '移動理由');
	iprMoveReasonField.setDisplayType('entry');
	iprMoveReasonField.addSelectOption('0', '', true);
	subListReresult.addField('ipr_detail_reason', 'select', '詳細理由','customrecord_djkk_inspe_reasondetail').setDisplayType('entry');
	var lot_remark=subListReresult.addField('lot_remark', 'select', 'ロットリマーク','');	
	var lot_memo=subListReresult.addField('lot_memo', 'text', 'ロットメモ');
	//20220519 add by zhou start
	var makerNum=subListReresult.addField('custpage_makernum', 'text', 'メーカー製造番号').setDisplayType('entry');;
	var dueTime=subListReresult.addField('custpage_duetime', 'date', '有効期限').setDisplayType('hidden');;
	var manufacturingDay=subListReresult.addField('custpage_date', 'date', '製造日').setDisplayType('entry');;
	var deliveryPeriod=subListReresult.addField('custpage_deliveryperiod', 'date', '出荷期間').setDisplayType('entry');;
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
	
	//親場所取得
	var locationRecord = nlapiLoadRecord('location', locationValue);
	var parent = locationRecord.getFieldValue('parent');
	var parentName = "";
	if(!isEmpty(parent)){
		parentName = nlapiLookupField('location', parent , 'name');
	}
	
	// 倉庫設定
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
	
	//保管棚設定
	//倉庫ビン （棚番）
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
		// 検品マスタからのデータ
		form.addButton('sublist_chkokbtn', '検品済','chkok()');
		
		// 画面にデータを設定します。（ボディ）
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
		
		// 画面値を設定します。（明細）
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
		//テーブルからのデータ
		
	form.addButton('sublist_upbtn', '更新','up()');	
	form.addButton('sublist_upbtn', '削除','droup()');	

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
	
	
	//LS場合手順表示
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
		//保管棚
		subListReresult.setLineItemValue('ipr_move_bin', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_bin'));
		//20220519 add by zhou start
		subListReresult.setLineItemValue('custpage_makernum', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_makern'));//メーカー製造番号
		subListReresult.setLineItemValue('custpage_duetime', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_duetime'));//賞味期限
		subListReresult.setLineItemValue('custpage_date', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_madedate'));//製造日
		subListReresult.setLineItemValue('custpage_deliveryperiod', j, customrecord_djkk_inv_ip.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_deliveryperiod'));//出荷期間
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
