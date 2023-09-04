/**
 * DJ_修理品
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/09/24     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
	form.setScript('customscript_djkk_cs_repair');
	//新規のみ場合アイテムなど選択可能とする
	if(type=='create'){
		//シリア番号検索
		//20220909 changed by zhou U721
		var subsidiary = getRoleSubsidiary();
		if(subsidiary == SUB_DPKK||subsidiary == SUB_SCETI||subsidiary == SUB_DJKK){
			form.addButton('custpage_searchso', '注文書検索','searchso();');	
			form.addButton('custpage_searchso2', '修理品検索','searchrepair();');	
		}
		//end
	}
	if(type=='view'){
		form.addButton('custpage_repairpdf', '修理品PDF出力','repairPDF();');
		
		var state = nlapiGetFieldValue('custrecord_djkk_re_status')
		//請求書出力済み 後場合完了ボタン表示する。
		if(state == '9'){
			form.addButton('custpage_statusclose()', '完了', 'statusClose()')
		}
		
		//完了場合表示しない
		if(isEmpty(nlapiGetFieldValue('custrecord_djkk_re_inventory_in_custody'))  && state != '10'){
		form.addButton('custpage_inlocation', '入庫','inlocationazukari();');
		}
		
		//完了場合表示しない
		if(state != '10'){
			form.addButton('custpage_estimate', '見積','createstimate();');	
		}
			
		//完了場合表示しない
		if(isEmpty(nlapiGetFieldValue('custrecord_djkk_rd_ic_change')) && state != '10'){
		form.addButton('custpage_outlocation', '出庫','outlocation();');
		}
	}else{
		setLineItemDisableType('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventory_detai', 'hidden');
	}
	setLineItemDisableType('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventorydetails', 'hidden');
	
	var soid='';
	try{
		soid=request.getParameter('soid');
	}catch(e){
		
	}
	
	
	if(!isEmpty(soid)&&type=='create'){
		var soRecord=nlapiLoadRecord('salesorder', soid);
		
		// DJ_作成日
		nlapiSetFieldValue('custrecord_djkk_re_createdata',nlapiDateToString(getSystemTime()));
		
		// DJ_注文書
		nlapiSetFieldValue('custrecord_djkk_re_salesorder_id',soid);
		
		// DJ_注文番号
		nlapiSetFieldValue('custrecord_djkk_re_salesorder',soRecord.getFieldValue('tranid'));
		
		// DJ_連結
		nlapiSetFieldValue('custrecord_djkk_re_subsidiary',soRecord.getFieldValue('subsidiary'));
		
		// DJ_返送先
		nlapiSetFieldValue('custrecord_djkk_re_return',soRecord.getFieldValue('entity'));
				
		// DJ_顧客
		nlapiSetFieldValue('custrecord_djkk_re_customer',soRecord.getFieldValue('entity'));
				
		// DJ_購入日
		nlapiSetFieldValue('custrecord_djkk_re_shopdata',soRecord.getFieldValue('trandate'));
			
		var linksCounts=soRecord.getLineItemCount('links');
		var invoiceNumbers=new Array();
		for(var i=1;i<linksCounts+1;i++){
			if(soRecord.getLineItemValue('links', 'type', i)=='請求書'){
				invoiceNumbers.push(soRecord.getLineItemValue('links', 'tranid', i));
			}
		}
		var invoiceNumber='';
		if(invoiceNumbers.length>1){
			for(var s=0;s<invoiceNumbers.length;s++){
				invoiceNumber+=invoiceNumbers[s];
				if(s!=invoiceNumbers.length-1){
					invoiceNumber+='|';
				}
			}
		}else{
			invoiceNumber=invoiceNumbers[0];
		}
		// DJ_請求書番号
		nlapiSetFieldValue('custrecord_djkk_re_invoice_number',invoiceNumber);
		
		// DJ_作成者
		nlapiSetFieldValue('custrecord_djkk_re_user',nlapiGetUser());
		
		var itemArray=new Array();
		var salesorderSearch = getSearchResults("salesorder",null,
				[
				   ["type","anyof","SalesOrd"], 
				   "AND", 
				   ["internalid","anyof",soid], 
				   "AND", 
				   ["item.custitem_djkk_re_object","is","T"], 
				   "AND", 
				   ["mainline","is","F"], 
				   "AND", 
				   ["taxline","is","F"]
				], 
				[
				   new nlobjSearchColumn("item"), 
				   new nlobjSearchColumn("quantity"),
				   new nlobjSearchColumn("unitid"),
				   new nlobjSearchColumn("custcol_djkk_conversionrate"),				   
				   new nlobjSearchColumn("targetlocation"), 
				   new nlobjSearchColumn("internalid","inventoryDetail",null)
				]
				);
		if(!isEmpty(salesorderSearch)){
			for (var s = 0; s < salesorderSearch.length; s++) {
			nlapiSelectNewLineItem('recmachcustrecord_djkk_rd_repair');			
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_subsidiary', soRecord.getFieldValue('subsidiary'), false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_item', salesorderSearch[s].getValue('item'), false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_quantity', salesorderSearch[s].getValue('quantity'), false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_unit', salesorderSearch[s].getValue('unitid'), false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_conversionrate', salesorderSearch[s].getValue('custcol_djkk_conversionrate'), false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_place', salesorderSearch[s].getValue('targetlocation'), false, true);
			var inventorydetaiId=salesorderSearch[s].getValue("internalid","inventoryDetail",null);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventorydetails',inventorydetaiId , false, true);
//			var thelink = nlapiResolveURL('RECORD', 'inventorydetail',inventorydetaiId, 'VIEW');
//			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventory_detai',thelink , false, true);
			nlapiCommitLineItem('recmachcustrecord_djkk_rd_repair');
			}
		}
		
	}	
	
	//初期連結設定する
	nlapiSetFieldValue('custrecord_djkk_re_subsidiary',getRoleSubsidiary());
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
	if (type=='create') {
//		var numbering='';
//		var TheMinimumdigits = 11;
//		var NumberTxt='L';
//		var submitId='824';
//		var usersub=getRoleSubsidiary();
//		var nbSearch = nlapiSearchRecord("customrecord_djkk_inventorydetail_number",null,
//				[
//				   ["custrecord_djkk_invnum_subsidiary","anyof",usersub]
//				], 
//				[
//		           new nlobjSearchColumn("internalid"),
//		           new nlobjSearchColumn("custrecord_djkk_invnum_subsidiary"),
//		           new nlobjSearchColumn("custrecord_djkk_invnum_form_name"),
//				   new nlobjSearchColumn("custrecord_djkk_invnum_item_make"), 
//				   new nlobjSearchColumn("custrecord_djkk_invnum_bumber")
//				]
//				);
//		if(!isEmpty(nbSearch)){
//			submitId=nbSearch[0].getValue('internalid');
//			NumberTxt=nbSearch[0].getValue('custrecord_djkk_invnum_item_make');
//			numbering=nbSearch[0].getValue('custrecord_djkk_invnum_bumber');
//		}
		var id=nlapiGetRecordId();
		var repairRecord=nlapiLoadRecord('customrecord_djkk_repair', id);
		var soid=repairRecord.getFieldValue('custrecord_djkk_re_salesorder_id');
		var saleRecord=nlapiLoadRecord('salesorder', soid);
		var repairCount=repairRecord.getLineItemCount('recmachcustrecord_djkk_rd_repair');
		var soCount=saleRecord.getLineItemCount('item');
		for(var i=1;i<repairCount+1;i++){
			repairRecord.selectLineItem('recmachcustrecord_djkk_rd_repair', i);
			var reparInvId=repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventorydetails');
			for(var si=1;si<soCount+1;si++){
				saleRecord.selectLineItem('item', si);
				var inventorydetailIDLink ='';
				
				var inventorydetail=saleRecord.editCurrentLineItemSubrecord('item','inventorydetail');
				//不明のところ、在庫詳細なし場合エラーを出ています。
				if(isEmpty(inventorydetail)){
					continue;
				}
				
				var inventorydetailID=inventorydetail.id;
				if(inventorydetailID==reparInvId){
					try{
						if(!isEmpty(inventorydetail)){
							var djInventoryDetailsRecord=nlapiCreateRecord('customrecord_djkk_inventory_details');
							djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_item', inventorydetail.getFieldValue('item'));
							djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_quantity', 1);
							//djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_quantity', inventorydetail.getFieldValue('quantity'));
							djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_item_explanation', inventorydetail.getFieldValue('itemdescription'));
							djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_unit', inventorydetail.getFieldValue('unit'));
							
							var inventorydetailcount=inventorydetail.getLineItemCount('inventoryassignment');
							for(var idi=1;idi<inventorydetailcount+1;idi++){
								inventorydetail.selectLineItem('inventoryassignment', idi);
								djInventoryDetailsRecord.selectNewLineItem('recmachcustrecord_djkk_inventory_details');
								
//								numbering++;
//								var newLotNumber =  NumberTxt+ prefixInteger(parseInt(numbering), parseInt(TheMinimumdigits));					
//								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
//										'custrecord_djkk_ditl_newseriallot_number', newLotNumber);
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_seriallot_number', 
										inventorydetail.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber'));
															
//								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
//										'custrecord_djkk_ditl_quantity_inventory', 
//										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_quantity_inventory', 1);
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_quantity_possible', 1);
//								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
//										'custrecord_djkk_ditl_quantity_possible', 
//										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_internalcode', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'));

								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_storage_shelves', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'binnumber'));
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_maker_serial_code', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_control_number', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_make_ymd', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_shipment_date', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_warehouse_code', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_expirationdate', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));
								
//								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
//										'custrecord_djkk_ditl_packingtype', 
//										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_packingtype'));
								
//								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
//										'custrecord_djkk_ditl_storage_type', 
//										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_storage_type'));
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_smc_code', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));
																
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_lot_remark', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_lot_memo', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));
															
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_bicking_cardon', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'pickcarton'));
								
								djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
										'custrecord_djkk_ditl_packing_cardon', 
										inventorydetail.getCurrentLineItemValue('inventoryassignment', 'packcarton'));
								
								
								djInventoryDetailsRecord.commitLineItem('recmachcustrecord_djkk_inventory_details');	
							}									
							var djInventoryDetailsId=nlapiSubmitRecord(djInventoryDetailsRecord, false, true);
							if(!isEmpty(djInventoryDetailsId)){
							//nlapiSubmitField('customrecord_djkk_inventorydetail_number',submitId, 'custrecord_djkk_invnum_bumber',numbering);
							inventorydetailIDLink =nlapiResolveURL('SUITELET', 'customscript_djkk_sl_dj_inventory_detail','customdeploy_djkk_sl_dj_inventory_detail');
							inventorydetailIDLink+= '&djInvID='+djInventoryDetailsId+'&repairId='+id+'&repairLineId='+i;
							//nlapiResolveURL('RECORD', 'customrecord_djkk_inventory_details',djInventoryDetailsId, 'VIEW');
							}			
				}
						}catch(e){}
						
						repairRecord.setCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventory_detai', inventorydetailIDLink);
						repairRecord.setCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventorydetails', djInventoryDetailsId);
						repairRecord.commitLineItem('recmachcustrecord_djkk_rd_repair');
				
				}
			}
		}
		nlapiSubmitRecord(repairRecord, false, true);
	}
}
