/**
 * 配送のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Jul 2021     gsy95
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
	var createdfrom = nlapiGetFieldValue('createdfrom');
	var ordertype = nlapiGetFieldValue('ordertype');
	
	if(!isEmpty(createdfrom) && ordertype == 'VendAuth'){ 
		setLineItemDisableType('item', 'custcol_djkk_custody_item', 'hidden');
		setLineItemDisableType('item', 'custcol_djkk_icl_cuslocation', 'hidden');
	}
	var custody=nlapiGetFieldValue('custbody_djkk_inventory_in_custody');
    if(isEmpty(custody)){
    	setFieldDisableType('custbody_djkk_inventory_in_custody', 'hidden');
    }else{
    	setFieldDisableType('custbody_djkk_inventory_in_custody', 'disabled');
    }
	var so = nlapiGetFieldValue("createdfrom");
	if(!isEmpty(so)&&nlapiGetFieldValue('ordertype')=='SalesOrd'){
		var dj_no = nlapiLookupField("salesorder", so, "custbody_djkk_branch_number");
		nlapiSetFieldValue("custbody_djkk_branch_number", dj_no);
	}
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
	
	
	
	var ordertype = nlapiGetFieldValue('ordertype');
	var so = nlapiGetFieldValue("createdfrom");
	if(!isEmpty(so)&& ordertype == 'SalesOrd'){
		var dj_no = nlapiLookupField("salesorder", so, "custbody_djkk_branch_number");
		nlapiSetFieldValue("custbody_djkk_branch_number", dj_no);	
	var entity=nlapiGetFieldValue('entity');
    if(!isEmpty(entity)){
    	try{
    var shipmentstop=nlapiLookupField('customer', entity, 'custentity_djkk_shipping_suspend_flag');
    	}catch(e){}
    if(shipmentstop=='T'){
    	throw nlapiCreateError('システムエラー', '当顧客が出荷停止の状態のため、出荷することはできません。');
      }
    }	
    
    
	//与信限度額判断
    var rec = nlapiLoadRecord('salesorder', so);
	var total = rec.getFieldValue('total');
	var exchangerate = rec.getFieldValue('exchangerate')
	total = Number(total) * Number(exchangerate);
	var custId = rec.getFieldValue('entity');
	
	var custRec = nlapiLoadRecord('customer', custId);
	var custName = custRec.getFieldValue('entityid');
	var custCreateLimit = custRec.getFieldValue('custentity_djkk_credit_limit');
	var custBalance = custRec.getFieldValue('balance');
	var unbilledorders = custRec.getFieldValue('unbilledorders');
	
	
//	var msg = custName+'\r'+'与信限度額:'+thousandsWithComa(Number(custCreateLimit)) +'\r'+'売掛金残高:'+thousandsWithComa(Number(custBalance))+'\r'+'未請求金額:'+thousandsWithComa(Number(unbilledorders))+'\r'+'注文書金額:'+thousandsWithComa(Number(total));
	//NBの与信チェックを外すwang 0208　CH126
//	var subsidiary = getRoleSubsidiary();
	var customForm = rec.getFieldValue('customform');
	if(customForm != '175'){
	if(custCreateLimit != 0 && !isEmpty(custCreateLimit)){
		if(Number(custCreateLimit) - Number(custBalance) -Number(total) -Number(unbilledorders)  < 0){
			//msg+='\r与信限度額が超えています。'
			throw nlapiCreateError('システムエラー', '与信限度額が超えているため、出荷することはできません。');
			
		}
	}
	}
    
    
    
	}
    var upflag=false;
	  //入出庫処理
	  var itemCount = nlapiGetLineItemCount('item');
		for(var i = 1 ; i < itemCount +1; i ++){
			if (nlapiGetLineItemValue('item', 'itemtype', i) != 'EndGroup') {
			if(nlapiGetLineItemValue('item', 'custcol_djkk_custody_item',i)=='T'){
				upflag=true;
			}
			var locationId = nlapiGetLineItemValue('item', 'location', i);
			if(!isEmpty(locationId)){
				var flg = nlapiLookupField('location', locationId, 'custrecord_djkk_stop_load')
				if(flg == 'T'){
					throw nlapiCreateError('システムエラー', nlapiGetLineItemText('item', 'location', i)+' 入出庫を停止しています。');
				}
			}
		}
		}
		if(upflag){
        nlapiSetFieldValue('shipstatus', 'C');
		}
    
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
	
	
	try{
	if(type=='delete'){
		return '';
	}else {
		
		var numbering='';
		var TheMinimumdigits = 11;
		var NumberTxt='L';
		var submitId='1';
		var usersub=getRoleSubsidiary();
		var nbSearch = nlapiSearchRecord("customrecord_djkk_inventorydetail_number",null,
				[
				   ["custrecord_djkk_invnum_subsidiary","anyof",usersub]
				], 
				[
		           new nlobjSearchColumn("internalid"),
		           new nlobjSearchColumn("custrecord_djkk_invnum_subsidiary"),
		           new nlobjSearchColumn("custrecord_djkk_invnum_form_name"),
				   new nlobjSearchColumn("custrecord_djkk_invnum_item_make"), 
				   new nlobjSearchColumn("custrecord_djkk_invnum_bumber")
				]
				);
		if(!isEmpty(nbSearch)){
			submitId=nbSearch[0].getValue('internalid');
			NumberTxt=nbSearch[0].getValue('custrecord_djkk_invnum_item_make');
			numbering=nbSearch[0].getValue('custrecord_djkk_invnum_bumber');
		}
		
	var id=nlapiGetRecordId();
	var itemfulfillment=nlapiLoadRecord('itemfulfillment', id);
	var ordertype=itemfulfillment.getFieldValue('ordertype');
	var shipStatus=itemfulfillment.getFieldValue('shipstatus');
	var custody=false;
    var createdCustody=itemfulfillment.getFieldValue('custbody_djkk_inventory_in_custody');
		if((ordertype=='SalesOrd')&&(type=='ship'||shipStatus=='C')&&isEmpty(createdCustody)){
			
			var subsidiary=itemfulfillment.getFieldValue('subsidiary');
			var entity=itemfulfillment.getFieldValue('entity');
			var createdfrom=itemfulfillment.getFieldValue('createdfrom');
			var cusRecord=nlapiCreateRecord('customrecord_djkk_inventory_in_custody');
			cusRecord.setFieldValue('custrecord_djkk_ic_subsidiary', subsidiary);
			cusRecord.setFieldValue('custrecord_djkk_ic_customer', entity);
			cusRecord.setFieldValue('custrecord_djkk_createdfrom', createdfrom);
			var count=itemfulfillment.getLineItemCount('item');
			for(var i=1;i<count+1;i++){
				itemfulfillment.selectLineItem('item', i);
				 if (itemfulfillment.getLineItemValue('item', 'itemtype', i) != 'EndGroup') {
				var cusItemFlag=itemfulfillment.getCurrentLineItemValue('item', 'custcol_djkk_custody_item');
				var inventorydetailID='';
				var inventorydetailIDLink ='';
				try{
					
					var inventorydetail=itemfulfillment.editCurrentLineItemSubrecord('item','inventorydetail');
					inventorydetailID=inventorydetail.id;
					if(!isEmpty(inventorydetail)){
						var djInventoryDetailsRecord=nlapiCreateRecord('customrecord_djkk_inventory_details');
						djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_item', inventorydetail.getFieldValue('item'));
						djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_quantity', inventorydetail.getFieldValue('quantity'));
						djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_item_explanation', inventorydetail.getFieldValue('itemdescription'));
						djInventoryDetailsRecord.setFieldValue('custrecord_djkk_ind_unit', inventorydetail.getFieldValue('unit'));
						
						var inventorydetailcount=inventorydetail.getLineItemCount('inventoryassignment');
						for(var idi=1;idi<inventorydetailcount+1;idi++){
							inventorydetail.selectLineItem('inventoryassignment', idi);
							djInventoryDetailsRecord.selectNewLineItem('recmachcustrecord_djkk_inventory_details');
							
							numbering++;
							var newLotNumber =  NumberTxt+ prefixInteger(parseInt(numbering), parseInt(TheMinimumdigits));					
							djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
									'custrecord_djkk_ditl_newseriallot_number', newLotNumber);
							
							djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
									'custrecord_djkk_ditl_seriallot_number', 
									inventorydetail.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber'));
														
							djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
									'custrecord_djkk_ditl_quantity_inventory', 
									inventorydetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));
							djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
									'custrecord_djkk_ditl_quantity_possible', 
									inventorydetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));
							
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
									'custrecord_djkk_ditl_warehouse_code', newLotNumber);
//									inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));
							
							djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
									'custrecord_djkk_ditl_expirationdate', 
									inventorydetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));
							
//							djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
//									'custrecord_djkk_ditl_packingtype', 
//									inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_packingtype'));
							
//							djInventoryDetailsRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 
//									'custrecord_djkk_ditl_storage_type', 
//									inventorydetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_storage_type'));
							
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
						nlapiSubmitField('customrecord_djkk_inventorydetail_number',submitId, 'custrecord_djkk_invnum_bumber',numbering);
						inventorydetailIDLink = nlapiResolveURL('RECORD', 'customrecord_djkk_inventory_details',djInventoryDetailsId, 'VIEW');
						}			
			}
					}catch(e){
						nlapiLogExecution('debug', 'e',e);
					}
				if(cusItemFlag=='T'){
					custody=true;
					cusRecord.selectNewLineItem('recmachcustrecord_djkk_icl_inventory_in_custody');
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_item', itemfulfillment
									.getLineItemValue('item', 'item', i));
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_quantity', itemfulfillment
									.getLineItemValue('item', 'quantity', i));
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_quantity_inventory', itemfulfillment
									.getLineItemValue('item', 'quantity', i));														
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_unit', itemfulfillment
									.getLineItemValue('item', 'units', i));
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_conversionrate', itemfulfillment
									.getLineItemValue('item', 'custcol_djkk_conversionrate', i));
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_inventorylocation', itemfulfillment
									.getLineItemValue('item', 'location', i));					
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_cuslocation', itemfulfillment
									.getLineItemValue('item', 'custcol_djkk_icl_cuslocation', i));		
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_inventorydetails', djInventoryDetailsId);
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_invd_oldid', inventorydetailID);
					
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_inventorydetail_link', inventorydetailIDLink);
					// add U722 by song start
					cusRecord.setCurrentLineItemValue(
							'recmachcustrecord_djkk_icl_inventory_in_custody',
							'custrecord_djkk_icl_cusbin', itemfulfillment
									.getLineItemValue('item', 'custcol_djkk_inventory_inshelf', i));	
					// add U722 by song end																			
					cusRecord.commitLineItem('recmachcustrecord_djkk_icl_inventory_in_custody');					
				}
			}
			}
			if(custody){
				var custodyId=nlapiSubmitRecord(cusRecord, false, true);
				nlapiSubmitField('itemfulfillment', id, 'custbody_djkk_inventory_in_custody', custodyId, false);
				try {
					var locationMain=nlapiLookupField('salesorder', itemfulfillment.getFieldValue('createdfrom'), 'location');
					if (!isEmpty(locationMain)) {
						var locationSearch = nlapiSearchRecord("location", null, 
								[ ["internalid", "anyof", locationMain ] ], 
								[new nlobjSearchColumn("custrecord_djkk_address_fax","address", null),
								new nlobjSearchColumn("custrecord_djkk_mail", "address",null) ]);

						if (!isEmpty(locationSearch)) {
							var fax = locationSearch[0].getValue("custrecord_djkk_address_fax", "address");
							var mails = locationSearch[0].getValue("custrecord_djkk_mail","address");
							var setrecords = new Object();
							 var soId=itemfulfillment.getFieldValue('createdfrom');
							 if(!isEmpty(soId)){
								 setrecords['transaction'] = soId;
							 }else{
								 setrecords=null; 
							 }
							var files=creatPdfFile(id);
							 nlapiSendEmail(nlapiGetUser(), mails, 'DJ_預かり在庫:在庫移動指示書', '在庫移動指示書', null, null, setrecords, files);
						}
						}
				} catch (e2) {
					nlapiLogExecution('debug', e2);
			    	}													
				}
			}			
		}
}catch(e3){
	nlapiLogExecution('debug', e3);
}
}


function creatPdfFile(recordId){
    
	
    var xmlString = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
	'<pdf>'+
	'<head>'+
	'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
	'<#if .locale == "zh_CN">'+
	'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
	'<#elseif .locale == "zh_TW">'+
	'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
	'<#elseif .locale == "ja_JP">'+
	'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
	'<#elseif .locale == "ko_KR">'+
	'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
	'<#elseif .locale == "th_TH">'+
	'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
	'</#if>'+
	'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
	'<#if .locale == "zh_CN">'+
	'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
	'<#elseif .locale == "zh_TW">'+
	'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
	'<#elseif .locale == "ja_JP">'+
	'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
	'<#elseif .locale == "ko_KR">'+
	'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
	'<#elseif .locale == "th_TH">'+
	'font-family: NotoSans, NotoSansThai, sans-serif;'+
	'<#else>'+
	'font-family: NotoSans, sans-serif;'+
	'</#if>'+
	'}'+
	'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
	'td { padding: 4px 6px; }'+
	'b { font-weight: bold; color: #333333; }'+
	'</style>'+
	'</head>'+
	'<body padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">'+
	'    <table><#list results as result><#if result_index == 0>'+
	'<thead>'+
	'<tr>'+
	'<th>アイテム</th>'+
	'<th>説明</th>'+
	'<th>移動先</th>'+
	'<th>移動元</th>'+
	'<th>数量  </th>'+
	'<th>単位</th>'+
	'<th>入り目</th>'+
	'</tr>'+
	'</thead>'+
	'</#if><tr>'+
	'<td>${result.item}</td>'+
	'<td>${result.item.salesdescription}</td>'+
	'<td>${result.custcol_djkk_icl_cuslocation}</td>'+
	'<td>${result.location}</td>'+
	'<td>${result.quantity}</td>'+
	'<td>${result.unit}</td>'+
	'<td>${result.custcol_djkk_conversionrate}</td>'+
	'</tr>'+
	'</#list></table>'+
	'</body>'+
	'</pdf>';
    
	

	var transactionSearch = nlapiSearchRecord("transaction",null,
			[
			   ["internalid","anyof",recordId], 
			   "AND", 
			   ["custcol_djkk_icl_cuslocation","noneof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("item"), 
			   new nlobjSearchColumn("salesdescription","item",null), 
			   new nlobjSearchColumn("custcol_djkk_icl_cuslocation"), 
			   new nlobjSearchColumn("location"), 
			   new nlobjSearchColumn("quantity"), 
			   new nlobjSearchColumn("unit"), 
			   new nlobjSearchColumn("custcol_djkk_conversionrate")
			]
			);
	
    var record = nlapiLoadRecord('itemfulfillment', recordId);
    var renderer = nlapiCreateTemplateRenderer();
    renderer.setTemplate(xmlString);
    renderer.addSearchResults('results',transactionSearch);
    
    var xml = renderer.renderToString();
    var xlsFile = nlapiXMLToPDF(xml);

    // var xlsFile = nlapiXMLToPDF(xmlString);
    // PDFファイル名を設定する
    xlsFile.setName('DJ_預かり在庫:在庫移動指示書 ' + '_' + getFormatYmdHms() + '.pdf');
    xlsFile.setFolder(FILE_CABINET_ID_DJ_DEPOSIT_STOCK_DELIVERY_SLIP);
    xlsFile.setIsOnline(true);

    // save file
    var fileID = nlapiSubmitFile(xlsFile);
    var fl = nlapiLoadFile(fileID);
     return fl;
}
