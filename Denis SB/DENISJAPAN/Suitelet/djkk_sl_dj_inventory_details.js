/**
 * DJ_在庫詳細
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/10/25     CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	if (request.getMethod() == 'POST') {
		POSTForm(request, response);
		
	}else{
	    createForm(request, response);
	}
	
}

/**
 *Post
 */
function POSTForm(request, response){
	var icChangeID = request.getParameter('custpage_icchangeid');
	var iclineId = request.getParameter('custpage_iclineid');
	var djInvID = request.getParameter('custpage_djinvid');
	var repairid = request.getParameter('custpage_repairid');
	var repairLineId=request.getParameter('custpage_repairlineid');
	var record=nlapiLoadRecord('customrecord_djkk_inventory_details', djInvID);
	var recordCount=record.getLineItemCount('recmachcustrecord_djkk_inventory_details');
	var theCount = parseInt(request.getLineItemCount('inventory_details'));
	var delArray=new Array();
	for(var i = 1 ; i < theCount+1 ; i++){
		delArray.push(record.getLineItemValue('recmachcustrecord_djkk_inventory_details', 'id', i));
		if(request.getLineItemValue('inventory_details', 'custpage_checkbox', i)=='T'){
			var lidpage=request.getLineItemValue('inventory_details', 'custpage_idvid', i);			
			for(var j = 1 ; j < recordCount+1 ; j++){
			record.selectLineItem('recmachcustrecord_djkk_inventory_details', j);
			var idInside=record.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'id');
			if(idInside==lidpage){
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_newseriallot_number',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_newseriallot_number', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_seriallot_number',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_seriallot_number', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_maker_serial_code',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_maker_serial_code', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_control_number',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_control_number', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_storage_shelves',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_storage_shelves', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_expirationdate',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_expirationdate', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_make_ymd',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_make_ymd', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_shipment_date',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_shipment_date', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_warehouse_code',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_warehouse_code', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_smc_code',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_smc_code', i));
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_storage_type',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_storage_type', i));
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_packingtype',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_packingtype', i));
			//record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_expired_flag',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_expired_flag', i));
			//record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_shipment_date_flag',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_shipment_date_flag', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_lot_remark',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_lot_remark', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_lot_memo',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_lot_memo', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_bicking_cardon',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_bicking_cardon', i));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_packing_cardon',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_packing_cardon', i));
			var quantity_possible=0;
			var ditl_quantity=0;
			if(!isEmpty(icChangeID)&&!isEmpty(iclineId)){
				quantity_possible=Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity_possible', i))-Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', i));			
				ditl_quantity=Number(nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity'))+Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', i));
				}
				if(!isEmpty(repairid)&&!isEmpty(repairLineId)){
				quantity_possible=Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', i));
				ditl_quantity=Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', i));
				}
			
			
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible',quantity_possible);		
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity',ditl_quantity);
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_change_reason',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_change_reason', i));
			record.commitLineItem('recmachcustrecord_djkk_inventory_details');
			}
		  }			
		}
	}
	nlapiSubmitRecord(record, false, true);
	var newRecord=nlapiCreateRecord('customrecord_djkk_inventory_details');
	newRecord.setFieldValue('custrecord_djkk_ind_item', request.getParameter('custpage_djkk_ind_item'));
	newRecord.setFieldValue('custrecord_djkk_ind_quantity', request.getParameter('custpage_djkk_ind_quantity'));
	newRecord.setFieldValue('custrecord_djkk_ind_item_explanation', request.getParameter('custpage_djkk_ind_item_explanation'));
	newRecord.setFieldText('custrecord_djkk_ind_unit', request.getParameter('custpage_djkk_ind_unit'));
	if(!isEmpty(icChangeID)&&!isEmpty(iclineId)){
	newRecord.setFieldValue('isinactive', 'T');
	}
	for(var i = 1 ; i < theCount+1 ; i++){
		if(request.getLineItemValue('inventory_details', 'custpage_checkbox', i)=='T'){
			newRecord.selectNewLineItem('recmachcustrecord_djkk_inventory_details');
			
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_seriallot_number',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_seriallot_number', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_maker_serial_code',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_maker_serial_code', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_control_number',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_control_number', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_storage_shelves',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_storage_shelves', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_expirationdate',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_expirationdate', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_make_ymd',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_make_ymd', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_shipment_date',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_shipment_date', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_warehouse_code',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_warehouse_code', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_smc_code',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_smc_code', i));
//			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_storage_type',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_storage_type', i));
//			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_packingtype',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_packingtype', i));
			//newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_expired_flag',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_expired_flag', i));
			//newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_shipment_date_flag',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_shipment_date_flag', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_lot_remark',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_lot_remark', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_lot_memo',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_lot_memo', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_bicking_cardon',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_bicking_cardon', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_packing_cardon',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_packing_cardon', i));
			var quantity_possible=0;			
			var ditl_quantity=0;
			if(!isEmpty(icChangeID)&&!isEmpty(iclineId)){
			ditl_quantity=Number(nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity'))+Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', i));
			quantity_possible=Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity_possible', i))-Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_newseriallot_number',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_newseriallot_number', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_inventory',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity_inventory', i));
			}
			if(!isEmpty(repairid)&&!isEmpty(repairLineId)){
			quantity_possible=Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', i));
			ditl_quantity=Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', i));
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_inventory',Number(request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', i)));
			}
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible',quantity_possible);
			
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity',ditl_quantity);
			newRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_change_reason',request.getLineItemValue('inventory_details', 'custpage_djkk_ditl_change_reason', i));
			newRecord.commitLineItem('recmachcustrecord_djkk_inventory_details');
		}
	 }
	var newINVId=nlapiSubmitRecord(newRecord, false, true);
	var inventorydetailIDLink = nlapiResolveURL('RECORD', 'customrecord_djkk_inventory_details',newINVId, 'VIEW');
	if(!isEmpty(icChangeID)&&!isEmpty(iclineId)){
	var icR=nlapiLoadRecord('customrecord_djkk_ic_change', icChangeID);
	icR.setLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_detail', iclineId, inventorydetailIDLink);
	nlapiSubmitRecord(icR, false, true);
	nlapiSetRedirectURL('RECORD', 'customrecord_djkk_ic_change', icChangeID);
	} 
	if(!isEmpty(repairid)&&!isEmpty(repairLineId)){
		var rpr=nlapiLoadRecord('customrecord_djkk_repair', repairid);
		rpr.setLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventorydetails', repairLineId, newINVId);
		rpr.setLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventory_detai', repairLineId, inventorydetailIDLink);
		nlapiSubmitRecord(rpr, false, true);	
		for(var a=0;a<delArray.length;a++){
		nlapiDeleteRecord('customrecord_djkk_details_in_the_library', delArray[a]);
		}
		nlapiDeleteRecord('customrecord_djkk_inventory_details', djInvID);
		nlapiSetRedirectURL('RECORD', 'customrecord_djkk_repair', repairid);
	}
	
}

/**
 *画面作成
 */
function createForm(request, response){
	
	var djInvID = request.getParameter('djInvID');
	
	var icChangeID = request.getParameter('icChangeID');
	var iclineId = request.getParameter('iclineID');
	
	var repairId= request.getParameter('repairId');
	var repairLineId= request.getParameter('repairLineId');
	
	var form = nlapiCreateForm('DJ_在庫詳細', true);
	form.setScript('customscript_djkk_cs_dj_inventory_detail');
	nlapiLogExecution('DEBUG', 'icChangeID', icChangeID);
	nlapiLogExecution('DEBUG', 'iclineId', iclineId);
	if(!isEmpty(icChangeID)&&!isEmpty(iclineId)){
	
	try{
	var djInv=nlapiLoadRecord('customrecord_djkk_inventory_details', djInvID);	
	var icChange=nlapiLoadRecord('customrecord_djkk_ic_change', icChangeID);
	var sub=icChange.getFieldValue('custrecord_djkk_ica_subsidiary');
	icChange.selectLineItem('recmachcustrecord_djkk_ica_change', iclineId);	
	var ic_adjqty=icChange.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_adjqty');
	var ic_changereason=icChange.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_changereason');
    form.addSubmitButton('更新');
    form.addFieldGroup('item', '在庫').setShowBorder(false);
    var icChangeIDField= form.addField('custpage_icchangeid', 'text', 'DJ_預かり在庫調整内部ID',null, 'item');
    icChangeIDField.setDefaultValue(icChangeID);
    icChangeIDField.setDisplayType('hidden');
    var iclineIdField=form.addField('custpage_iclineid', 'text', 'DJ_預かり在庫調整LineID',null, 'item');
    iclineIdField.setDefaultValue(iclineId);
    iclineIdField.setDisplayType('hidden');
    var repairIdField=form.addField('custpage_repairid', 'text', 'DJ_修理ID',null, 'item');
    repairIdField.setDefaultValue(repairId);
    repairIdField.setDisplayType('hidden'); 
    var repairLineIdField=form.addField('custpage_repairlineid', 'text', 'DJ_修理LineID',null, 'item');
    repairLineIdField.setDefaultValue(repairLineId);
    repairLineIdField.setDisplayType('hidden'); 
    var djInvIDField=form.addField('custpage_djinvid', 'text', 'DJ_在庫詳細ID',null, 'item');
    djInvIDField.setDefaultValue(djInvID);
    djInvIDField.setDisplayType('hidden');
	var itemField=form.addField('custpage_djkk_ind_item', 'select', 'DJ_アイテム','item', 'item');
	itemField.setDisplayType('inline');
	itemField.setDefaultValue(djInv.getFieldValue('custrecord_djkk_ind_item'));
	var explanationField=form.addField('custpage_djkk_ind_item_explanation', 'text', 'DJ_説明',null, 'item');
	explanationField.setDisplayType('inline');
	explanationField.setDefaultValue(djInv.getFieldValue('custrecord_djkk_ind_item_explanation'));
	var quantityField=form.addField('custpage_djkk_ind_quantity', 'text', 'DJ_数量',null, 'item');
	quantityField.setDisplayType('inline');
	quantityField.setDefaultValue(ic_adjqty);
	
	var unitField=form.addField('custpage_djkk_ind_unit', 'text', 'DJ_単位','', 'item');
	unitField.setDisplayType('inline');
	unitField.setDefaultValue(djInv.getFieldText('custrecord_djkk_ind_unit'));
	
	form.addFieldGroup('change_reason', '変更理由').setShowBorder(true);
	var changeReasonField=form.addField('custpage_change_reason', 'select', 'DJ_変更理由','', 'change_reason');
	changeReasonField.addSelectOption('', '');
	var reasonSearch = nlapiSearchRecord("customrecord_djkk_invadjst_change_reason",null,
			[
			   ["custrecord_djkk_reson_subsidiary","anyof",sub],
			   "AND", 
			   ["name","contains","顧客配送"]
			], 
			[
			   new nlobjSearchColumn("internalid"),
			   new nlobjSearchColumn("name")
			]
			);
	if(!isEmpty(reasonSearch)){
		for(var s=0;s<reasonSearch.length;s++){
			changeReasonField.addSelectOption(reasonSearch[s].getValue('internalid'), reasonSearch[s].getValue('name'));
		}
	}
	changeReasonField.setMandatory(true);
	changeReasonField.setDefaultValue(ic_changereason);
	var subList = form.addSubList('inventory_details', 'list', '在庫詳細');
	subList.addMarkAllButtons();
	var checkbox= subList.addField('custpage_checkbox', 'checkbox','選択');
	var lineidcode=subList.addField('custpage_idvid', 'text', 'Line内部ID');
	lineidcode.setDisplayType('hidden');
	var internalcode=subList.addField('custpage_djkk_ditl_internalcode', 'text', 'DJ_内部ID');
	internalcode.setDisplayType('hidden');
	var newseriallot_number=subList.addField('custpage_djkk_ditl_newseriallot_number', 'text', 'DJ-預かり在庫シリアル/ロット番号')
	newseriallot_number.setDisplayType('inline');
	var seriallot_number=subList.addField('custpage_djkk_ditl_seriallot_number', 'text', 'DJ-元のシリアル/ロット番号');
	seriallot_number.setDisplayType('inline');
	var quantity_inventory=subList.addField('custpage_djkk_ditl_quantity_inventory', 'float', 'DJ_預かり在庫入荷量');
	quantity_inventory.setDisplayType('inline');
	quantity_inventory.setDisplaySize('5');
	var quantity_possible= subList.addField('custpage_djkk_ditl_quantity_possible', 'float', 'DJ_可能');
	quantity_possible.setDisplayType('inline');
	quantity_possible.setDisplaySize('5');
	var change_reason=subList.addField('custpage_djkk_ditl_change_reason', 'select', 'DJ_変更理由', 'customrecord_djkk_invadjst_change_reason');
	change_reason.setDisplayType('hidden');
	var quantity=subList.addField('custpage_djkk_ditl_quantity', 'float', 'DJ_数量');
	quantity.setDisplayType('entry');
	quantity.setDisplaySize('5');
	var maker_serial_code=subList.addField('custpage_djkk_ditl_maker_serial_code', 'text', 'DJ_メーカー製造ロット番号');
	maker_serial_code.setDisplayType('entry');
	maker_serial_code.setDisplaySize('5');
	var control_number=subList.addField('custpage_djkk_ditl_control_number', 'text', 'DJ_メーカーシリアル番号');
	control_number.setDisplayType('entry');
	control_number.setDisplaySize('5');
	var storage_shelves=subList.addField('custpage_djkk_ditl_storage_shelves', 'select', 'DJ_保管棚'); //, 'bin'
	var binSearch = nlapiSearchRecord("bin",null,
			[
			   ["custrecord_djkk_bin_subsidiary","anyof",sub]
			], 
			[
			   new nlobjSearchColumn("binnumber").setSort(false), 
			   new nlobjSearchColumn("internalid"), 
			]
			);
	for(var i = 0; i<binSearch.length;i++){
		storage_shelves.addSelectOption(binSearch[i].getValue("internalid"),binSearch[i].getValue("binnumber"));
	}
	storage_shelves.setDisplayType('entry');
//	storage_shelves.setDisplaySize('10');
	
	var expirationdate=subList.addField('custpage_djkk_ditl_expirationdate', 'date', 'DJ_有効期限').setDisplayType('entry');
	var make_ymd=subList.addField('custpage_djkk_ditl_make_ymd', 'date', 'DJ_製造年月日').setDisplayType('entry');
	var shipment_date=subList.addField('custpage_djkk_ditl_shipment_date', 'date', 'DJ_出荷可能期限日').setDisplayType('entry');
	var warehouse_code=subList.addField('custpage_djkk_ditl_warehouse_code', 'text', 'DJ_倉庫入庫番号');
	warehouse_code.setDisplayType('entry');
//	warehouse_code.setDisplaySize('5');
	var smc_code=subList.addField('custpage_djkk_ditl_smc_code', 'text', 'DJ_SMC番号');
	smc_code.setDisplayType('entry');
	smc_code.setDisplaySize('5');
//	var storage_type=subList.addField('custpage_djkk_ditl_storage_type', 'select', 'DJ_在庫区分', 'customlist_djkk_storage_type');
	/*TODO*/
//	var packingtype=subList.addField('custpage_djkk_ditl_packingtype', 'select', 'DJ_荷姿区分', 'customlist_djkk_packingtype');
	/*TODO*/
	//var expired_flag=subList.addField('custpage_djkk_ditl_expired_flag', 'checkbox', 'DJ_有効期限切れフラグ').setDisplayType('entry');
	//var date_flag=subList.addField('custpage_djkk_ditl_shipment_date_flag', 'checkbox', 'DJ_出荷可能日切れフラグ').setDisplayType('entry');
	var lot_remark=subList.addField('custpage_djkk_ditl_lot_remark', 'select', 'DJ_ロットリマーク').setDisplayType('entry');
	var lot_remarkSearch = nlapiSearchRecord("customrecord_djkk_lot_remark",null,
			[
			   ["custrecord_djkk_lot_remark_subsidiary","anyof",sub]
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
	/*TODO*/
	var lot_memo=subList.addField('custpage_djkk_ditl_lot_memo', 'text', 'DJ_ロットメモ');
	lot_memo.setDisplayType('entry');
	lot_memo.setDisplaySize('5');
	var bicking_cardon=subList.addField('custpage_djkk_ditl_bicking_cardon', 'text', 'DJ_ビッキング・カードン').setDisplayType('entry');
	bicking_cardon.setDisplaySize('5');
	var packing_cardon=subList.addField('custpage_djkk_ditl_packing_cardon', 'text', 'DJ_梱包カードン');
	packing_cardon.setDisplayType('entry');
	packing_cardon.setDisplaySize('5');

	
	var count=djInv.getLineItemCount('recmachcustrecord_djkk_inventory_details');
	var itemLine = 1;
	for(var i=1;i<count+1;i++){
		djInv.selectLineItem('recmachcustrecord_djkk_inventory_details', i);
		if(Number(djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible'))>0){
		subList.setLineItemValue('custpage_idvid', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'id'));
		subList.setLineItemValue('custpage_djkk_ditl_internalcode', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_internalcode'));
		subList.setLineItemValue('custpage_djkk_ditl_newseriallot_number', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_newseriallot_number'));
		subList.setLineItemValue('custpage_djkk_ditl_seriallot_number', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_seriallot_number'));
		subList.setLineItemValue('custpage_djkk_ditl_maker_serial_code', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_maker_serial_code'));
		subList.setLineItemValue('custpage_djkk_ditl_control_number', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_control_number'));
		subList.setLineItemValue('custpage_djkk_ditl_storage_shelves', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_storage_shelves'));
		subList.setLineItemValue('custpage_djkk_ditl_expirationdate', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_expirationdate'));
		subList.setLineItemValue('custpage_djkk_ditl_make_ymd', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_make_ymd'));
		subList.setLineItemValue('custpage_djkk_ditl_shipment_date', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_shipment_date'));
		subList.setLineItemValue('custpage_djkk_ditl_warehouse_code', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_warehouse_code'));
		subList.setLineItemValue('custpage_djkk_ditl_smc_code', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_smc_code'));
//		subList.setLineItemValue('custpage_djkk_ditl_storage_type', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_storage_type'));
//		subList.setLineItemValue('custpage_djkk_ditl_packingtype', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_packingtype'));
		//subList.setLineItemValue('custpage_djkk_ditl_expired_flag', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_expired_flag'));
		//subList.setLineItemValue('custpage_djkk_ditl_shipment_date_flag', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_shipment_date_flag'));
		subList.setLineItemValue('custpage_djkk_ditl_lot_remark', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_lot_remark'));
		subList.setLineItemValue('custpage_djkk_ditl_lot_memo', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_lot_memo'));
		subList.setLineItemValue('custpage_djkk_ditl_bicking_cardon', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_bicking_cardon'));
		subList.setLineItemValue('custpage_djkk_ditl_packing_cardon', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_packing_cardon'));
		subList.setLineItemValue('custpage_djkk_ditl_quantity_inventory', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_inventory'));
		subList.setLineItemValue('custpage_djkk_ditl_quantity_possible', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible'));
		subList.setLineItemValue('custpage_djkk_ditl_change_reason', itemLine,ic_changereason);
		//subList.setLineItemValue('custpage_djkk_ditl_quantity', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible'));
		itemLine++;
		}
	}
	}
	catch(e){
		response.write(e.message);
		return;
		}
	}
	if(!isEmpty(repairId)&&!isEmpty(repairLineId)){
		try{
		var djInv=nlapiLoadRecord('customrecord_djkk_inventory_details', djInvID);	
		var icChange=nlapiLoadRecord('customrecord_djkk_repair', repairId);
		
		var sub=icChange.getFieldValue('custrecord_djkk_re_subsidiary');
		icChange.selectLineItem('recmachcustrecord_djkk_rd_repair', repairLineId);	
		
		var ic_adjqty=icChange.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_quantity');
		var ic_changereason='';
	    form.addSubmitButton('更新');
	    form.addFieldGroup('item', '在庫').setShowBorder(false);
	    var icChangeIDField= form.addField('custpage_icchangeid', 'text', 'DJ_預かり在庫調整内部ID',null, 'item');
	    icChangeIDField.setDefaultValue(icChangeID);
	    icChangeIDField.setDisplayType('hidden');
	    var iclineIdField=form.addField('custpage_iclineid', 'text', 'DJ_預かり在庫調整LineID',null, 'item');
	    iclineIdField.setDefaultValue(iclineId);
	    iclineIdField.setDisplayType('hidden');
	    var repairIdField=form.addField('custpage_repairid', 'text', 'DJ_修理ID',null, 'item');
	    repairIdField.setDefaultValue(repairId);
	    repairIdField.setDisplayType('hidden'); 
	    var repairLineIdField=form.addField('custpage_repairlineid', 'text', 'DJ_修理LineID',null, 'item');
	    repairLineIdField.setDefaultValue(repairLineId);
	    repairLineIdField.setDisplayType('hidden'); 
	    var djInvIDField=form.addField('custpage_djinvid', 'text', 'DJ_在庫詳細ID',null, 'item');
	    djInvIDField.setDefaultValue(djInvID);
	    djInvIDField.setDisplayType('hidden');
		var itemField=form.addField('custpage_djkk_ind_item', 'select', 'DJ_アイテム','item', 'item');
		itemField.setDisplayType('inline');
		itemField.setDefaultValue(djInv.getFieldValue('custrecord_djkk_ind_item'));
		var explanationField=form.addField('custpage_djkk_ind_item_explanation', 'text', 'DJ_説明',null, 'item');
		explanationField.setDisplayType('inline');
		explanationField.setDefaultValue(djInv.getFieldValue('custrecord_djkk_ind_item_explanation'));
		var quantityField=form.addField('custpage_djkk_ind_quantity', 'text', 'DJ_数量',null, 'item');
		quantityField.setDisplayType('inline');
		quantityField.setDefaultValue(ic_adjqty);
		
		var unitField=form.addField('custpage_djkk_ind_unit', 'text', 'DJ_単位','', 'item');
		unitField.setDisplayType('inline');
		unitField.setDefaultValue(djInv.getFieldText('custrecord_djkk_ind_unit'));
		
		form.addFieldGroup('change_reason', '変更理由').setShowBorder(false);
		var changeReasonField=form.addField('custpage_change_reason', 'select', 'DJ_変更理由','', 'change_reason');
		changeReasonField.setDisplayType('hidden')
		changeReasonField.addSelectOption('', '');
		var reasonSearch = nlapiSearchRecord("customrecord_djkk_invadjst_change_reason",null,
				[
				   ["custrecord_djkk_reson_subsidiary","anyof",sub]
				], 
				[
				   new nlobjSearchColumn("internalid"),
				   new nlobjSearchColumn("name")
				]
				);
		if(!isEmpty(reasonSearch)){
			for(var s=0;s<reasonSearch.length;s++){
				changeReasonField.addSelectOption(reasonSearch[s].getValue('internalid'), reasonSearch[s].getValue('name'));
			}
		}
		//changeReasonField.setMandatory(true);
		changeReasonField.setDefaultValue(ic_changereason);
		var subList = form.addSubList('inventory_details', 'list', '在庫詳細');
		subList.addMarkAllButtons();
		var checkbox= subList.addField('custpage_checkbox', 'checkbox','選択');
		var lineidcode=subList.addField('custpage_idvid', 'text', 'Line内部ID');
		lineidcode.setDisplayType('hidden');
		var internalcode=subList.addField('custpage_djkk_ditl_internalcode', 'text', 'DJ_内部ID');
		internalcode.setDisplayType('hidden');
		var newseriallot_number=subList.addField('custpage_djkk_ditl_newseriallot_number', 'text', 'DJ-預かり在庫シリアル/ロット番号')
		newseriallot_number.setDisplayType('hidden');
		var seriallot_number=subList.addField('custpage_djkk_ditl_seriallot_number', 'text', 'DJ-元のシリアル/ロット番号');
		seriallot_number.setDisplayType('inline');
		var quantity_inventory=subList.addField('custpage_djkk_ditl_quantity_inventory', 'float', 'DJ_預かり在庫入荷量');
		quantity_inventory.setDisplayType('inline');
		quantity_inventory.setDisplaySize('5');
		var quantity_possible= subList.addField('custpage_djkk_ditl_quantity_possible', 'float', 'DJ_可能');
		quantity_possible.setDisplayType('inline');
		quantity_possible.setDisplaySize('5');
		var change_reason=subList.addField('custpage_djkk_ditl_change_reason', 'select', 'DJ_変更理由', 'customrecord_djkk_invadjst_change_reason');
		change_reason.setDisplayType('hidden');
		var quantity=subList.addField('custpage_djkk_ditl_quantity', 'float', 'DJ_数量');
		quantity.setDisplayType('entry');
		quantity.setDisplaySize('5');
		var maker_serial_code=subList.addField('custpage_djkk_ditl_maker_serial_code', 'text', 'DJ_メーカー製造ロット番号');
		maker_serial_code.setDisplayType('inline');
		maker_serial_code.setDisplaySize('5');
		var control_number=subList.addField('custpage_djkk_ditl_control_number', 'text', 'DJ_メーカーシリアル番号');
		control_number.setDisplayType('inline');
		control_number.setDisplaySize('5');
		var storage_shelves=subList.addField('custpage_djkk_ditl_storage_shelves', 'select', 'DJ_保管棚','bin'); //,'bin'
		storage_shelves.setDisplayType('inline');
		storage_shelves.setDisplaySize('5');		
		
		var expirationdate=subList.addField('custpage_djkk_ditl_expirationdate', 'date', 'DJ_有効期限').setDisplayType('inline');
		var make_ymd=subList.addField('custpage_djkk_ditl_make_ymd', 'date', 'DJ_製造年月日').setDisplayType('inline');
		var shipment_date=subList.addField('custpage_djkk_ditl_shipment_date', 'date', 'DJ_出荷可能期限日').setDisplayType('inline');
		var warehouse_code=subList.addField('custpage_djkk_ditl_warehouse_code', 'text', 'DJ_倉庫入庫番号');
		warehouse_code.setDisplayType('inline');
		warehouse_code.setDisplaySize('5');
		var smc_code=subList.addField('custpage_djkk_ditl_smc_code', 'text', 'DJ_SMC番号');
		smc_code.setDisplayType('inline');
		smc_code.setDisplaySize('5');
//		var storage_type=subList.addField('custpage_djkk_ditl_storage_type', 'select', 'DJ_在庫区分', 'customlist_djkk_storage_type').setDisplayType('inline');
		/*TODO*/
//		var packingtype=subList.addField('custpage_djkk_ditl_packingtype', 'select', 'DJ_荷姿区分', 'customlist_djkk_packingtype').setDisplayType('inline');
		/*TODO*/
		//var expired_flag=subList.addField('custpage_djkk_ditl_expired_flag', 'checkbox', 'DJ_有効期限切れフラグ').setDisplayType('hidden');
		//var date_flag=subList.addField('custpage_djkk_ditl_shipment_date_flag', 'checkbox', 'DJ_出荷可能日切れフラグ').setDisplayType('hidden');
		var lot_remark=subList.addField('custpage_djkk_ditl_lot_remark', 'select', 'DJ_ロットリマーク', 'customrecord_djkk_lot_remark').setDisplayType('entry');
		/*TODO*/
		var lot_memo=subList.addField('custpage_djkk_ditl_lot_memo', 'text', 'DJ_ロットメモ');
		lot_memo.setDisplayType('entry');
		lot_memo.setDisplaySize('5');
		var bicking_cardon=subList.addField('custpage_djkk_ditl_bicking_cardon', 'text', 'DJ_ビッキング・カードン');
		bicking_cardon.setDisplayType('hidden');
		bicking_cardon.setDisplaySize('5');
		var packing_cardon=subList.addField('custpage_djkk_ditl_packing_cardon', 'text', 'DJ_梱包カードン');
		packing_cardon.setDisplayType('hidden');
		packing_cardon.setDisplaySize('5');

		
		var count=djInv.getLineItemCount('recmachcustrecord_djkk_inventory_details');
		var itemLine = 1;
		for(var i=1;i<count+1;i++){
			djInv.selectLineItem('recmachcustrecord_djkk_inventory_details', i);
			if(Number(djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible'))>0){
			subList.setLineItemValue('custpage_idvid', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'id'));
			subList.setLineItemValue('custpage_djkk_ditl_internalcode', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_internalcode'));
			subList.setLineItemValue('custpage_djkk_ditl_newseriallot_number', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_newseriallot_number'));
			subList.setLineItemValue('custpage_djkk_ditl_seriallot_number', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_seriallot_number'));
			subList.setLineItemValue('custpage_djkk_ditl_maker_serial_code', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_maker_serial_code'));
			subList.setLineItemValue('custpage_djkk_ditl_control_number', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_control_number'));
			subList.setLineItemValue('custpage_djkk_ditl_storage_shelves', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_storage_shelves'));
			subList.setLineItemValue('custpage_djkk_ditl_expirationdate', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_expirationdate'));
			subList.setLineItemValue('custpage_djkk_ditl_make_ymd', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_make_ymd'));
			subList.setLineItemValue('custpage_djkk_ditl_shipment_date', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_shipment_date'));
			subList.setLineItemValue('custpage_djkk_ditl_warehouse_code', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_warehouse_code'));
			subList.setLineItemValue('custpage_djkk_ditl_smc_code', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_smc_code'));
//			subList.setLineItemValue('custpage_djkk_ditl_storage_type', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_storage_type'));
//			subList.setLineItemValue('custpage_djkk_ditl_packingtype', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_packingtype'));
			//subList.setLineItemValue('custpage_djkk_ditl_expired_flag', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_expired_flag'));
			//subList.setLineItemValue('custpage_djkk_ditl_shipment_date_flag', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_shipment_date_flag'));
			subList.setLineItemValue('custpage_djkk_ditl_lot_remark', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_lot_remark'));
			subList.setLineItemValue('custpage_djkk_ditl_lot_memo', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_lot_memo'));
			subList.setLineItemValue('custpage_djkk_ditl_bicking_cardon', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_bicking_cardon'));
			subList.setLineItemValue('custpage_djkk_ditl_packing_cardon', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_packing_cardon'));
			subList.setLineItemValue('custpage_djkk_ditl_quantity_inventory', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_inventory'));
			subList.setLineItemValue('custpage_djkk_ditl_quantity_possible', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible'));
			subList.setLineItemValue('custpage_djkk_ditl_change_reason', itemLine,ic_changereason);
			//subList.setLineItemValue('custpage_djkk_ditl_quantity', itemLine,djInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible'));
			itemLine++;
			}
		}
		}
		catch(e){
			response.write(e.message);
			return;
			}
		
		
	}
	response.writePage(form);
}
