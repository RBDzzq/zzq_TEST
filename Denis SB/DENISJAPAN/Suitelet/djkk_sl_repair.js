/**
 * DJ_修理品
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/09/24     CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var recordId=request.getParameter('creatpdfid');
	var repairPDFId=request.getParameter('repairid');
	var repairEstimateId=request.getParameter('repairestimateid');
	var inlocationid=request.getParameter('inlocationid');
	var outlocationid=request.getParameter('outlocationid');
	var repairEstimateFlag=request.getParameter('repairEstimateFlag');
	var entity=request.getParameter('entity');
	nlapiLogExecution('debug','aaa','aaa')
	if(!isEmpty(inlocationid)){
		nlapiLogExecution('debug', '入庫 start,ID:'+inlocationid);
		var numbering='';
		var TheMinimumdigits = 11;
		var NumberTxt='L';
		var submitId='824';
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
		var repairRecord=nlapiLoadRecord('customrecord_djkk_repair', inlocationid);						
		var inloRecord=nlapiCreateRecord('customrecord_djkk_inventory_in_custody');
		inloRecord.setFieldValue('custrecord_djkk_ic_subsidiary', repairRecord.getFieldValue('custrecord_djkk_re_subsidiary'));
		inloRecord.setFieldValue('custrecord_djkk_ic_customer', repairRecord.getFieldValue('custrecord_djkk_re_customer'));
		inloRecord.setFieldValue('custrecord_djkk_ic_repairid',inlocationid);		
		var recounts=repairRecord.getLineItemCount('recmachcustrecord_djkk_rd_repair');
		for (var s = 1; s < recounts+1; s++) {
			repairRecord.selectLineItem('recmachcustrecord_djkk_rd_repair', s);
			inloRecord.selectNewLineItem('recmachcustrecord_djkk_icl_inventory_in_custody');
			
			inloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody','custrecord_djkk_icl_item'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_item'));
			
			inloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody','custrecord_djkk_icl_quantity'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_quantity'));
			
			inloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody','custrecord_djkk_icl_quantity_inventory'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_quantity'));
					
			inloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody','custrecord_djkk_icl_unit'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_unit'));
			
			inloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody','custrecord_djkk_icl_conversionrate'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_conversionrate'));
			
			inloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody','custrecord_djkk_icl_inventorylocation'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_place'));
			
			inloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody','custrecord_djkk_icl_inventorydetail_link'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventory_detai'));
			var idtid=repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventorydetails');
			inloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody','custrecord_djkk_icl_inventorydetails'
					,idtid);
			var idtRecord=nlapiLoadRecord('customrecord_djkk_inventory_details', idtid);
			var idtRecordCount=idtRecord.getLineItemCount('recmachcustrecord_djkk_inventory_details');
			for(var n=1;n<idtRecordCount+1;n++){
				idtRecord.selectLineItem('recmachcustrecord_djkk_inventory_details', n);
				numbering++;
				var newLotNumber =  NumberTxt+ prefixInteger(parseInt(numbering), parseInt(TheMinimumdigits));		
				//idtRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_newseriallot_number', newLotNumber);
				idtRecord.commitLineItem('recmachcustrecord_djkk_inventory_details');
			}
			nlapiSubmitField('customrecord_djkk_inventorydetail_number',submitId, 'custrecord_djkk_invnum_bumber',numbering);
			nlapiSubmitRecord(idtRecord, false, true);
			inloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody','custrecord_djkk_icl_cuslocation'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_cuslocation'));
			
			//保管棚対応する
			inloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody','custrecord_djkk_icl_cusbin'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_bin'));
			
			inloRecord.commitLineItem('recmachcustrecord_djkk_icl_inventory_in_custody');
		}
		var inloRecordId=nlapiSubmitRecord(inloRecord, true, true);
		nlapiSubmitField('customrecord_djkk_repair', inlocationid, 'custrecord_djkk_re_inventory_in_custody', inloRecordId, false);
		
		response.write(inloRecordId);
		nlapiLogExecution('debug', '入庫 end');
	}
	if(!isEmpty(outlocationid)){
		nlapiLogExecution('debug', '出庫 start:,ID:'+outlocationid);

		var repairRecord=nlapiLoadRecord('customrecord_djkk_repair', outlocationid);
		var sub=repairRecord.getFieldValue('custrecord_djkk_re_subsidiary');
		var resonId='';
		var reasonSearch = nlapiSearchRecord("customrecord_djkk_invadjst_change_reason",null,
				[
				   ["custrecord_djkk_reson_subsidiary","anyof",sub], 
				   "AND", 
				   ["name","contains","修理品出庫"]
				], 
				[
				   new nlobjSearchColumn("internalid")
				]
				);
		if(!isEmpty(reasonSearch)){
			resonId=reasonSearch[0].getValue('internalid');
		}
		
		var iic=repairRecord.getFieldValue('custrecord_djkk_re_inventory_in_custody');
		var iicRecord=nlapiLoadRecord('customrecord_djkk_inventory_in_custody', iic);
		var outloRecord=nlapiCreateRecord('customrecord_djkk_ic_change');
		outloRecord.setFieldValue('custrecord_djkk_ica_date', nlapiDateToString(getSystemTime()));
		outloRecord.setFieldValue('custrecord_djkk_ica_subsidiary',sub);
		outloRecord.setFieldValue('custrecord_djkk_ica_customer', repairRecord.getFieldValue('custrecord_djkk_re_customer'));
		outloRecord.setFieldValue('custrecord_djkk_ica_repair', outlocationid);
		var recounts=repairRecord.getLineItemCount('recmachcustrecord_djkk_rd_repair');
		for (var s = 1; s < recounts+1; s++) {
			repairRecord.selectLineItem('recmachcustrecord_djkk_rd_repair', s);
			outloRecord.selectNewLineItem('recmachcustrecord_djkk_ica_change');
			outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_inventory_adjustment','T');
			
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_item'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_item'));
		    
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_line_subsidiary',sub);
		    
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_warehouse'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_place'));
		    
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_cuslocation'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_cuslocation'));
		        
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_unit'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_unit'));
		    
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_conversionrate'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_conversionrate'));
		    
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_inventoryqty'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_quantity'));
		    
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_adjqty'
					,0-Number(repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_quantity')));
		    
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_newqty','0');
		    
		    // DJ_在庫調整変更理由リスト : 修理品出庫
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_changereason',resonId);
		    
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_memo'
					,repairRecord.getCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_mome'));
		    
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_ic_id',iic);
		    var iicId= iicRecord.getLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody', 'id', s);
		    outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_icl_id',iicId);
		   
		    var invDId= iicRecord.getLineItemValue('recmachcustrecord_djkk_icl_inventory_in_custody', 'custrecord_djkk_icl_inventorydetails', s);
		    nlapiLogExecution('debug','invDId', invDId);
		    if(!isEmpty(invDId)){
//		    var oldInv=nlapiLoadRecord('customrecord_djkk_inventory_details', invDId);
////		    var indCount=indRecord.getLineItemCount('recmachcustrecord_djkk_inventory_details');
////		    for(var indi=1;indi<indCount+1;indi++){
////		    	indRecord.selectLineItem('recmachcustrecord_djkk_inventory_details', indi);
////		    	indRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_change_reason',resonId);
////		    	indRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_quantity_possible','0');
////		    	indRecord.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity', indRecord.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_inventory'))
////		    	indRecord.commitLineItem('recmachcustrecord_djkk_inventory_details');
////		    }
////		    nlapiSubmitRecord(indRecord, false, true);
//		    /**/
//			var inventyDetil=nlapiCreateRecord('customrecord_djkk_inventory_details');			
//			inventyDetil.setFieldValue('custrecord_djkk_ind_item', oldInv.getFieldValue('custrecord_djkk_ind_item'));
//			inventyDetil.setFieldValue('custrecord_djkk_ind_quantity', oldInv.getFieldValue('custrecord_djkk_ind_quantity'));
//			inventyDetil.setFieldValue('custrecord_djkk_ind_item_explanation', oldInv.getFieldValue('custrecord_djkk_ind_item_explanation'));
//			inventyDetil.setFieldText('custrecord_djkk_ind_unit', oldInv.getFieldValue('custrecord_djkk_ind_unit'));
//			inventyDetil.setFieldValue('isinactive', 'T');
//			
//			var dcounts=oldInv.getLineItemCount('recmachcustrecord_djkk_inventory_details');
//			for(var ss=1;ss<dcounts+1;ss++){
//				oldInv.selectLineItem('recmachcustrecord_djkk_inventory_details', ss);
//				var lotNum=oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_newseriallot_number');
//				    inventyDetil.selectNewLineItem('recmachcustrecord_djkk_inventory_details');										
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_internalcode',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_internalcode'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_newseriallot_number',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_newseriallot_number'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_seriallot_number',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_seriallot_number'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_maker_serial_code',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_maker_serial_code'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_control_number',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_control_number'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_storage_shelves',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_storage_shelves'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_expirationdate',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_expirationdate'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_make_ymd',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_make_ymd'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_shipment_date',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_shipment_date'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_warehouse_code',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_warehouse_code'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_smc_code',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_smc_code'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_storage_type',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_storage_type'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_packingtype',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_packingtype'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_expired_flag',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_expired_flag'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_shipment_date_flag',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_shipment_date_flag'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_lot_remark',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_lot_remark'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_lot_memo',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_lot_memo'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_bicking_cardon',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_bicking_cardon'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_packing_cardon',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_packing_cardon'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_quantity_inventory',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_quantity_inventory'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_quantity',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_quantity_inventory'));
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible', '0');
//					inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_change_reason', resonId);
//					inventyDetil.commitLineItem('recmachcustrecord_djkk_inventory_details');
//					oldInv.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible', '0');
//					oldInv.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_change_reason', resonId);
//					oldInv.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity', oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_inventory'));
//					oldInv.commitLineItem('recmachcustrecord_djkk_inventory_details');
//				
//			}
//			nlapiSubmitRecord(oldInv, false, true);
//			var newinvId=nlapiSubmitRecord(inventyDetil, false, true);
			
			var	inventorydetailIDLink =nlapiResolveURL('SUITELET', 'customscript_djkk_sl_dj_inventory_detail','customdeploy_djkk_sl_dj_inventory_detail');
			inventorydetailIDLink+= '&djInvID='+invDId;
			outloRecord.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change','custrecord_djkk_ica_detail',inventorydetailIDLink);
		    }		    		    
		    outloRecord.commitLineItem('recmachcustrecord_djkk_ica_change');
			
		}
		var outloRecordId=nlapiSubmitRecord(outloRecord, true, true);
		nlapiSubmitField('customrecord_djkk_repair', outlocationid, 'custrecord_djkk_rd_ic_change', outloRecordId, false);
		
		response.write(outloRecordId);
		nlapiLogExecution('debug', '出庫 end');
	}
	
	if(!isEmpty(recordId)){
		nlapiLogExecution('debug', '納品書＆請求書pdf start,ID:'+recordId);
		var xmlString = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">\n' +
        '<pdf>\n' +
        '    <head>\n' +
        '        <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />\n' +
        '        <#if .locale == "zh_CN">\n' +
        '        <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />\n' +
        '        <#elseif .locale == "zh_TW">\n' +
        '        <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />\n' +
        '        <#elseif .locale == "ja_JP">\n' +
        '        <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />\n' +
        '        <#elseif .locale == "ko_KR">\n' +
        '        <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />\n' +
        '        <#elseif .locale == "th_TH">\n' +
        '        <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />\n' +
        '    </#if>\n' +
        '    <macrolist>\n' +
        '        <macro id="nlheader">\n' +
        '            <table style="width: 100%; font-size: 10pt;">\n' +
        '                <tr style="border-bottom:2px solid #6F8CAD;color:#4678d0;font-size:1.3em;margin-bottom:0.8em;">\n' +
        '                    <td align="left" style="width:50%; padding: 0em 0em 0.3em 1.3em;">\n' +
        '                        <span style="color:#4678d0;font-weight:bold; font-family: Arial, Helvetica, sans-serif;">SCETI\n' +
        '                        </span>\n' +
        '                    </td>\n' +
        '                    <td align="right" style="padding: 0em 1.3em 0.3em 0em;">\n' +
        '                        <span>セティ株式会社</span>\n' +
        '                    </td>\n' +
        '                </tr>\n' +
        '            </table>\n' +
        '        </macro>\n' +
        '        <macro id="nlfooter">\n' +
        '            <table style="width: 100%; font-size: 8pt;">\n' +
        '                <tr style="color:#4678d0;">\n' +
        '                    <td style="padding-top:5px;">\n' +
        '                        <span style="font-size:1.2em;">セティ株式会社</span>\n' +
        '                        <br/>〒100-0013 東京都千代田区霞が関３-６-７　霞が関プレイス\n' +
        '                        <br/>\n' +
        '                        <span style="font-size:1.2em;">SCETI K.K.</span>\n' +
        '                        <br/>Kasumigaseki Place, 3-6-7 Kasumigaseki, Chiyoda-ku, Tokyo 100-0013 JAPAN\n' +
        '                    </td>\n' +
        '                    <td align="right" style="width: 256px;">\n' +
        '                        <img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs"\n' +
        '                             style="width: 90px; height: 50px; margin-top: 5px; float: right;"/>\n' +
        '                    </td>\n' +
        '                </tr>\n' +
        '            </table>\n' +
        '        </macro>\n' +
        '    </macrolist>\n' +
        '    <style type="text/css">* {\n' +
        '        <#if .locale == "zh_CN">\n' +
        '        font-family: NotoSans, NotoSansCJKsc, sans-serif;\n' +
        '        <#elseif .locale == "zh_TW">\n' +
        '        font-family: NotoSans, NotoSansCJKtc, sans-serif;\n' +
        '        <#elseif .locale == "ja_JP">\n' +
        '        font-family: NotoSans, NotoSansCJKjp, sans-serif;\n' +
        '        <#elseif .locale == "ko_KR">\n' +
        '        font-family: NotoSans, NotoSansCJKkr, sans-serif;\n' +
        '        <#elseif .locale == "th_TH">\n' +
        '        font-family: NotoSans, NotoSansThai, sans-serif;\n' +
        '        <#else>\n' +
        '        font-family: NotoSans, sans-serif;\n' +
        '    </#if>\n' +
        '            }\n' +
        '            table {\n' +
        '            font-size: 9pt;\n' +
        '            table-layout: fixed;\n' +
        '            }\n' +
        '            th {\n' +
        '            font-weight: bold;\n' +
        '            font-size: 8pt;\n' +
        '            vertical-align: middle;\n' +
        '            padding: 5px 6px 3px;\n' +
        '            background-color: #e3e3e3;\n' +
        '            color: #333333;\n' +
        '            }\n' +
        '            td {\n' +
        '            padding: 4px 6px;\n' +
        '            }\n' +
        '            td p { align:left }\n' +
        '            b {\n' +
        '            font-weight: bold;\n' +
        '            color: #333333;\n' +
        '            }\n' +
        '            table.header td {\n' +
        '            padding: 0;\n' +
        '            font-size: 10pt;\n' +
        '            }\n' +
        '            table.footer td {\n' +
        '            padding: 0;\n' +
        '            font-size: 8pt;\n' +
        '            }\n' +
        '            table.itemtable th {\n' +
        '            padding-bottom: 10px;\n' +
        '            padding-top: 10px;\n' +
        '            }\n' +
        '            table.body td {\n' +
        '            padding-top: 2px;\n' +
        '            }\n' +
        '            tr.totalrow {\n' +
        '            background-color: #e3e3e3;\n' +
        '            line-height: 200%;\n' +
        '            }\n' +
        '            td.totalboxtop {\n' +
        '            font-size: 12pt;\n' +
        '            background-color: #e3e3e3;\n' +
        '            }\n' +
        '            td.addressheader {\n' +
        '            font-size: 8pt;\n' +
        '            padding-top: 6px;\n' +
        '            padding-bottom: 2px;\n' +
        '            }\n' +
        '            td.address {\n' +
        '            padding-top: 0;\n' +
        '            }\n' +
        '            td.totalboxmid {\n' +
        '            font-size: 28pt;\n' +
        '            padding-top: 20px;\n' +
        '            background-color: #e3e3e3;\n' +
        '            }\n' +
        '            td.totalboxbot {\n' +
        '            background-color: #e3e3e3;\n' +
        '            font-weight: bold;\n' +
        '            }\n' +
        '            span.title {\n' +
        '            font-size: 28pt;\n' +
        '            }\n' +
        '            span.number {\n' +
        '            font-size: 16pt;\n' +
        '            }\n' +
        '            span.itemname {\n' +
        '            font-weight: bold;\n' +
        '            line-height: 150%;\n' +
        '            }\n' +
        '            hr {\n' +
        '            width: 100%;\n' +
        '            color: #d3d3d3;\n' +
        '            background-color: #d3d3d3;\n' +
        '            height: 1px;\n' +
        '            }\n' +
        '            .itemdetailtb{width: 100%; border-collapse:collapse;margin-left:0.2in; margin-top:30px;}\n' +
        '            .itemdetailhtr{height:20px;}\n' +
        '            .itemhlineno{width:5%;}\n' +
        '            .itemhref{width:12%; border-left: 2px solid #499AFF; border-top: 2px solid #499AFF; border-bottom: 1px solid\n' +
        '            #499AFF;}\n' +
        '            .itemhprodesc{width:38%; border-left: 1px solid #499AFF; border-top: 2px solid #499AFF; border-bottom: 1px\n' +
        '            solid #499AFF;}\n' +
        '            .itemhquan,.itemhunitprice,.itemhtotalprice{width:13%; border-left: 1px solid #499AFF; border-top: 2px solid\n' +
        '            #499AFF; border-bottom: 1px solid #499AFF;}\n' +
        '            .itemhtotalprice{border-right: 2px solid #499AFF;}\n' +
        '            .itemref{border-left: 2px solid #499AFF;}\n' +
        '            .itemprodesc,.itemquan,.itemunitprice,.itemtotalprice{border-left: 1px solid #499AFF;}\n' +
        '            .itemtotalprice{border-right: 2px solid #499AFF;}\n' +
        '            .itemref,.itemreflast{min-height:40px;}\n' +
        '            .itemreflast{border-left: 2px solid #499AFF;}\n' +
        '            .itemprodesclast,.itemquanlast,.itemunitpricelast,.itemtotalpricelast{border-left: 1px solid #499AFF;}\n' +
        '            .itemtotalpricelast{border-right: 2px solid #499AFF;}\n' +
        '            .itemreflast,.itemprodesclast,.itemquanlast,.itemunitpricelast,.itemtotalpricelast{border-bottom: 2px solid\n' +
        '            #499AFF;}\n' +
        '            .topbd{border-top: 2px solid #499AFF;}\n' +
        '            .bottombd{border-bottom: 2px solid #499AFF!important;border-top: 2px solid #499AFF; vertical-align:middle;}\n' +
        '            .totalmidtd{border-left: 1px solid #499AFF; border-bottom: 2px solid #499AFF;}\n' +
        '            .totaltd{border-left: 2px solid #499AFF; border-bottom: 1px solid #499AFF;}\n' +
        '            .pricetd{border-left: 1px solid #499AFF; border-bottom: 1px solid #499AFF; border-right: 2px solid #499AFF;}\n' +
        '            .currencytd{border-left: 2px solid #499AFF; border-bottom: 2px solid #499AFF;}\n' +
        '            .lasttd{border-left: 1px solid #499AFF; border-bottom: 2px solid #499AFF; border-right: 2px solid #499AFF;}\n' +
        '            .totaltd,.pricetd,.currencytd,.lasttd{height:30px; vertical-align:middle;}\n' +
        '            .msg{margin-top:10px; border-top:1px; border-bottom:1px;}\n' +
        '            .noleftpadding{padding-left:0px;}\n' +
        '            .internalref{margin-left:0.2in; width: 100%;border-collapse: collapse;}\n' +
        '            .internalrefmsg{line-height:16pt;}\n' +
        '</style>\n' +
        '        </head>\n' +
        '<body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">\n' +
        '<table style="margin:0 0.2in 0.2in; width: 100%;border:2px solid #6F8CAD;">\n' +
        '    <tr>\n' +
        '        <td align="center">INVOICE</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td align="right">\n' +
        '            <span>Date : ${record.trandate}</span>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td align="right">\n' +
        '            <span>INVOICE No : ${record.tranid}</span>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td align="right">\n' +
        '            <span>DSM P/O : #[2845134370]</span>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '</table>\n' +
        '\n' +
        '<table cellpadding="0" cellspacing="1" style="width: 100%;margin:0 0.2in;">\n' +
        '    <tr>\n' +
        '        <td colspan="2" style="padding-left: 16px; height: 17px; border-bottom: 1px;">Invoice to:&nbsp;${record.entity}\n' +
        '        </td>\n' +
        '        <td style="height: 16px;">&nbsp;</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td colspan="3" style="width: 220px; padding-left: 26px; height: 1px; font:1px;">&nbsp;</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td colspan="1" rowspan="3" style="width: 220px;padding-left: 26px;">[30 Pasir Panjang Road #13-31]<br/>\n' +
        '            [Mapletree Business City]<br/>[Singapore 117440]\n' +
        '        </td>\n' +
        '        <td align="center" style="width: 220px;">&nbsp;</td>\n' +
        '        <td style="width: 220px;">&nbsp;</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td align="center" style="width: 220px;">&nbsp;</td>\n' +
        '        <td style="width: 234px;">&nbsp;</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td align="center" style="width: 220px;">&nbsp;</td>\n' +
        '        <td align="right" style="width: 220px;">Page :&nbsp; <pagenumber/>&nbsp;/<totalpages/>&nbsp;\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '</table>\n' +
        '&nbsp;\n' +
        '\n' +
        '<table style="width: 100%;margin-left: 0.2in">\n' +
        '    <tr>\n' +
        '        <td colspan="2" style="font-size: 15pt">[Sceti shipper code No 1NY01(import/export) - 7 0100 0109 6591]</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td colspan="2" style="font-size: 10pt">[Tel. +81.3.5510.2681]</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td colspan="2">\n' +
        '            &nbsp;\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td colspan="2" style="font-size: 13pt">Deliver to :&nbsp;[DNP Asia Pacific Distribution Ctr]</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td style="width:150px">[Tokyo, July 29th, 2021]</td>\n' +
        '        <td style="width: 150px;">ETA:&nbsp;[SINGAPORE, July 31 at 00:20 AM]</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td>[Sankyu(Singapore) Pte Ltd]\n' +
        '            <br/>\n' +
        '            [Tuas Logistics Hub]\n' +
        '            <br/>\n' +
        '            [60 Tuas Bay Drive]\n' +
        '            <br/>\n' +
        '            [Singapore 637568]\n' +
        '        </td>\n' +
        '        <td>[MAWB: 131-5767-9882]<br/>[HAWB: STE-3106 6072]\n' +
        '            <br/>\n' +
        '            [Flight: JL711]\n' +
        '            <br/>\n' +
        '            [FREIGHT COLLECT]\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '</table>\n' +
        '&nbsp;\n' +
        '\n' +
        '<table cell-spacing="0" style="width: 100%;margin-left: 0.2in;border-collapse: collapse;">\n' +
        '    <tr>\n' +
        '        <td style="width:80%; padding-left: 0px; padding-right: 0px;">\n' +
        '            <table cellpadding="0" cellspacing="0" style="width: 100%;">\n' +
        '                <tr>\n' +
        '                    <td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;"\n' +
        '                        vertical-align="bottom">[Country of origin: U.S.A]\n' +
        '                    </td>\n' +
        '                    <td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>\n' +
        '                </tr>\n' +
        '                <tr>\n' +
        '                    <td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;"\n' +
        '                        vertical-align="bottom">PAYMENT TERMS :&nbsp;[end of month from invoice date]\n' +
        '                    </td>\n' +
        '                    <td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>\n' +
        '                </tr>\n' +
        '            </table>\n' +
        '        </td>\n' +
        '        <td align="left" cell-spacing="0" style="padding-left: 0px;padding-right: 0px;padding-top: 3px;">\n' +
        '            <table>\n' +
        '                <tr>\n' +
        '                    <td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>\n' +
        '                    <td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>\n' +
        '                    <td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>\n' +
        '                </tr>\n' +
        '            </table>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '</table>\n' +
        '<!-- DETIALS START --> <#if record.item?has_content> &nbsp;\n' +
        '\n' +
        '<table cell-spacing="0" class="itemdetailtb">\n' +
        '    <tr class="itemdetailhtr">\n' +
        '        <td class="itemhlineno">&nbsp;</td>\n' +
        '        <td class="itemhref">Reference</td>\n' +
        '        <td class="itemhprodesc">Product Description</td>\n' +
        '        <td class="itemhquan">Quantity<br/>(Kgs)\n' +
        '        </td>\n' +
        '        <td class="itemhunitprice">Unit Price<br/>(USD/Kg)\n' +
        '        </td>\n' +
        '        <td class="itemhtotalprice">Total Amount<br/>(USD)\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '    <#assign amountSum = 0>\n' +
        '    <#list record.item as item>\n' +
        '    <#assign amountSum += item.amount>\n' +
        '    <tr><#if !item?is_last>\n' +
        '        <td><#if item_index lt 9>0${item_index + 1}0\n' +
        '        </#if>\n' +
        '        <#if item_index gt 8><#if item_index lt 100>0${item_index + 1}\n' +
        '    </#if>\n' +
        '</#if>\n' +
        '<#if item_index gt 98>${item_index + 1}\n' +
        '</#if></td>\n' +
        '<td class="itemref">${item.item}</td>\n' +
        '<td class="itemprodesc">${item.description}</td>\n' +
        '<td align="center" class="itemquan">${item.quantity}&nbsp;${item.units}</td>\n' +
        '<td align="right" class="itemunitprice">${item.rate?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
        '<td align="right" class="itemtotalprice">${item.amount?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
        '<#else>\n' +
        '<td><#if item_index lt 9>0${item_index + 1}0\n' +
        '</#if> <#if item_index gt 8><#if item_index lt 100>0${item_index + 1}</#if></#if> <#if item_index gt 98>${item_index + 1}</#if></td>\n' +
        '<td class="itemreflast">${item.item}</td>\n' +
        '<td class="itemprodesclast">${item.description}</td>\n' +
        '<td align="center" class="itemquanlast">${item.quantity}&nbsp;${item.units}</td>\n' +
        '<td align="right" class="itemunitpricelast">${item.rate?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
        '<td align="right" class="itemtotalpricelast">${item.amount?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
        '        </#if></tr>\n' +
        '        </#list>\n' +
        '<tr>\n' +
        '<td rowspan="2">&nbsp;</td>\n' +
        '<td class="noleftpadding" colspan="3" rowspan="2" style="padding-top:10px;">\n' +
        '    <p class="msg">PLEASE SET AUTHORIZED PERSON SIGN TO CONFIRM ORDER<br/>ACCEPTANCE AND SEND IT TO US BY RETURN:\n' +
        '    </p>\n' +
        '\n' +
        '    <p>RECEPTION DATE:</p>\n' +
        '</td>\n' +
        '<td align="center" class="topbd totaltd">Total</td>\n' +
        '<td align="right" class="topbd pricetd">${amountSum?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td align="center" class="currencytd">(${record.currency})</td>\n' +
        '<td class="lasttd">&nbsp;</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td>&nbsp;</td>\n' +
        '<td class="noleftpadding" colspan="3">\n' +
        '    <span style="padding-right: 120px;">AUTHORIZED SIGNATURE:</span>\n' +
        '    <span>CIE.STAMP:</span>\n' +
        '</td>\n' +
        '<td colspan="2">&nbsp;</td>\n' +
        '</tr></table>\n' +
        '        </#if> <!-- DETIALS END --> &nbsp;\n' +
        '\n' +
        '<table cell-spacing="0" class="internalref">\n' +
        '<tr>\n' +
        '    <td width="75%">&nbsp;</td>\n' +
        '    <td class="internalrefmsg">OUR INTERNAL REF:<br/>11 1092 542 20-10-27<br/>Goods In Transit\n' +
        '    </td>\n' +
        '</tr>\n' +
        '</table>\n' +
        '<pbr/>\n' +
        '<table style="margin:0 0.2in 0.2in; width: 100%;border:2px solid #6F8CAD;">\n' +
        '<tr>\n' +
        '    <td align="center">PACKING LIST</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td align="left">\n' +
        '        <barcode codetype="code128" height="70" width="180" showtext="false" value="VR:${record.tranid}"/>\n' +
        '    </td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td align="right">\n' +
        '        <span>Date : ${record.trandate}</span>\n' +
        '    </td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td align="right">\n' +
        '        <span>DSM P/O : #[2845134370]</span>\n' +
        '    </td>\n' +
        '</tr>\n' +
        '</table>\n' +
        '\n' +
        '<table cellpadding="0" cellspacing="1" style="width: 100%;margin:0 0.2in;">\n' +
        '<tr>\n' +
        '    <td colspan="2" style="padding-left: 16px; height: 17px; border-bottom: 1px;">Invoice to:&nbsp;${record.entity}\n' +
        '    </td>\n' +
        '    <td style="height: 16px;">&nbsp;</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td colspan="3" style="width: 220px; padding-left: 26px; height: 1px; font:1px;">&nbsp;</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td colspan="1" rowspan="3" style="width: 220px;padding-left: 26px;">[30 Pasir Panjang Road #13-31]<br/>[Mapletree\n' +
        '        Business City]<br/>[Singapore 117440]\n' +
        '    </td>\n' +
        '    <td align="center" style="width: 220px;">&nbsp;</td>\n' +
        '    <td style="width: 220px;">&nbsp;</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td align="center" style="width: 220px;">&nbsp;</td>\n' +
        '    <td style="width: 234px;">&nbsp;</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td align="center" style="width: 220px;">&nbsp;</td>\n' +
        '    <td align="right" style="width: 220px;">Page :&nbsp; <pagenumber/>&nbsp;/<totalpages/>&nbsp;\n' +
        '    </td>\n' +
        '</tr>\n' +
        '</table>\n' +
        '        &nbsp;\n' +
        '\n' +
        '<table style="width: 100%;margin-left: 0.2in">\n' +
        '<tr>\n' +
        '    <td colspan="2" style="font-size: 15pt">[Sceti shipper code No 1NY01(import/export) - 7 0100 0109 6591]</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td colspan="2" style="font-size: 10pt">[Tel. +81.3.5510.2681]</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td colspan="2">\n' +
        '        &nbsp;\n' +
        '    </td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td colspan="2" style="font-size: 13pt">Deliver to :&nbsp;[DNP Asia Pacific Distribution Ctr]</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td style="width:150px">[Tokyo, July 29th, 2021]</td>\n' +
        '    <td style="width: 150px;">ETA:&nbsp;[SINGAPORE, July 31 at 00:20 AM]</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td>[Sankyu(Singapore) Pte Ltd]\n' +
        '        <br/>\n' +
        '        [Tuas Logistics Hub]\n' +
        '        <br/>\n' +
        '        [60 Tuas Bay Drive]\n' +
        '        <br/>\n' +
        '        [Singapore 637568]\n' +
        '    </td>\n' +
        '    <td>[MAWB: 131-5767-9882]<br/>[HAWB: STE-3106 6072]\n' +
        '        <br/>\n' +
        '        [Flight: JL711]\n' +
        '        <br/>\n' +
        '        [FREIGHT COLLECT]\n' +
        '    </td>\n' +
        '</tr>\n' +
        '</table>\n' +
        '        &nbsp;\n' +
        '\n' +
        '<table cell-spacing="0" style="width: 100%;margin-left: 0.2in;border-collapse: collapse;">\n' +
        '<tr>\n' +
        '    <td style="width:80%; padding-left: 0px; padding-right: 0px;">\n' +
        '        <table cellpadding="0" cellspacing="0" style="width: 100%;">\n' +
        '            <tr>\n' +
        '                <td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;"\n' +
        '                    vertical-align="bottom">[26 carton drums on 4 pallets]\n' +
        '                </td>\n' +
        '                <td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>\n' +
        '            </tr>\n' +
        '            <tr>\n' +
        '                <td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;"\n' +
        '                    vertical-align="bottom">Pallet size: [123cm x 102cm x 125cm x 1 pallet]\n' +
        '                </td>\n' +
        '                <td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>\n' +
        '            </tr>\n' +
        '            <tr>\n' +
        '                <td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;"\n' +
        '                    vertical-align="bottom">TOTAL GROSS WEIGHT [772] Kgs\n' +
        '                </td>\n' +
        '                <td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>\n' +
        '            </tr>\n' +
        '            <tr>\n' +
        '                <td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;"\n' +
        '                    vertical-align="bottom">TOTAL VOLUME [4.767] m3\n' +
        '                </td>\n' +
        '                <td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>\n' +
        '            </tr>\n' +
        '        </table>\n' +
        '    </td>\n' +
        '    <td align="left" cell-spacing="0" style="padding-left: 0px;padding-right: 0px;padding-top: 3px;">\n' +
        '        <table>\n' +
        '            <tr>\n' +
        '                <td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>\n' +
        '                <td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>\n' +
        '                <td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>\n' +
        '            </tr>\n' +
        '        </table>\n' +
        '    </td>\n' +
        '</tr>\n' +
        '</table>\n' +
        '        <!-- DETIALS START --> <#if record.item?has_content> &nbsp;\n' +
        '\n' +
        '<table cell-spacing="0" class="itemdetailtb">\n' +
        '<tr class="itemdetailhtr">\n' +
        '    <td class="itemhlineno">&nbsp;</td>\n' +
        '    <td class="itemhref">Reference</td>\n' +
        '    <td class="itemhprodesc" style="width:20%">Product Description</td>\n' +
        '    <td class="itemhquan">Packaging per drum</td>\n' +
        '    <td class="itemhunitprice">Total Quantity<br/>(Bags)\n' +
        '    </td>\n' +
        '    <td class="itemhunitprice">Total Net Weight<br/>(Kgs)\n' +
        '    </td>\n' +
        '    <td class="itemhunitprice">Total Gross Weight<br/>(Kgs)\n' +
        '    </td>\n' +
        '    <td class="itemhtotalprice" style="width: 25%">Barcode\n' +
        '    </td>\n' +
        '</tr>\n' +
        '<#assign qtySum = 0>\n' +
        '<#assign netSum = 0>\n' +
        '<#assign grossSum = 0>\n' +
        '<#list record.item as item>\n' +
        '<#assign grossWeight = item.quantity>\n' +
        '<#assign qtySum += item.quantity>\n' +
        '<#assign netSum += item.quantity>\n' +
        '<#assign grossSum += grossWeight>\n' +
        '<tr><#if !item?is_last>\n' +
        '    <td><#if item_index lt 9>0${item_index + 1}0\n' +
        '    </#if>\n' +
        '    <#if item_index gt 8><#if item_index lt 100>0${item_index + 1}\n' +
        '</#if>\n' +
        '</#if> <#if item_index gt 98>${item_index + 1}</#if></td>\n' +
        '<td class="itemref">${item.item}</td>\n' +
        '<td class="itemprodesc">${item.description}</td>\n' +
        '<td align="center" class="itemquan"></td>\n' +
        '<td align="right" class="itemunitprice">${item.quantity}</td>\n' +
        '<td align="right" class="itemunitprice"></td>\n' +
        '<td align="right" class="itemunitprice">${grossWeight?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
        '<td align="right" class="itemtotalprice"><barcode codetype="code128" height="70" width="180" showtext="false" value="${record.internalid};${item.line}"/></td>\n' +
        '<#else>\n' +
        '<td><#if item_index lt 9>0${item_index + 1}0\n' +
        '</#if> <#if item_index gt 8><#if item_index lt 100>0${item_index + 1}</#if></#if> <#if item_index gt 98>${item_index + 1}</#if></td>\n' +
        '<td class="itemreflast">${item.item}</td>\n' +
        '<td class="itemprodesclast">${item.description}</td>\n' +
        '<td align="center" class="itemquanlast"></td>\n' +
        '<td align="right" class="itemunitpricelast">${item.quantity}</td>\n' +
        '<td align="right" class="itemunitpricelast"></td>\n' +
        '<td align="right" class="itemunitpricelast">${grossWeight?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
        '<td align="right" class="itemtotalpricelast"><barcode codetype="code128" height="70" width="180" showtext="false" value="${record.internalid};${item.line}"/></td>\n' +
        '        </#if></tr>\n' +
        '        </#list>\n' +
        '<tr>\n' +
        '<td rowspan="2">&nbsp;</td>\n' +
        '<td class="noleftpadding" colspan="2" rowspan="2" style="padding-top:10px;">\n' +
        '    <p class="msg">PLEASE SET AUTHORIZED PERSON SIGN TO CONFIRM ORDER<br/>ACCEPTANCE AND SEND IT TO US BY RETURN:\n' +
        '    </p>\n' +
        '\n' +
        '    <p>RECEPTION DATE:</p>\n' +
        '</td>\n' +
        '<td align="center" class="bottombd totaltd">Total</td>\n' +
        '<td align="right" class="topbd bottombd totalmidtd">${qtySum?string[",##0;; roundingMode=halfUp"]}</td>\n' +
        '<td align="right" class="topbd bottombd totalmidtd">${netSum?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
        '<td align="right" class="bottombd pricetd">${grossSum?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td>&nbsp;</td>\n' +
        '<td>&nbsp;</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td>&nbsp;</td>\n' +
        '<td class="noleftpadding" colspan="4">\n' +
        '    <span style="padding-right: 120px;">AUTHORIZED SIGNATURE:</span>\n' +
        '    <span>CIE.STAMP:</span>\n' +
        '</td>\n' +
        '<td colspan="2">&nbsp;</td>\n' +
        '</tr></table>\n' +
        '        </#if> <!-- DETIALS END --> &nbsp;\n' +
        '\n' +
        '<table cell-spacing="0" class="internalref">\n' +
        '<tr>\n' +
        '    <td width="75%">&nbsp;</td>\n' +
        '    <td class="internalrefmsg">OUR INTERNAL REF:<br/>11 1092 542 20-10-27<br/>Goods In Transit\n' +
        '    </td>\n' +
        '</tr>\n' +
        '</table>\n' +
        '        </body>\n' +
        '        </pdf>\n';
    var recordId=request.getParameter('creatpdfid');
    var record = nlapiLoadRecord('invoice', recordId);
    var renderer = nlapiCreateTemplateRenderer();
    renderer.setTemplate(xmlString);
    renderer.addRecord('record', record);
    var xml = renderer.renderToString();
    var xlsFile = nlapiXMLToPDF(xml);

    // var xlsFile = nlapiXMLToPDF(xmlString);
    // PDFファイル名を設定する
    xlsFile.setName('納品書＆請求書PDF出力' + '_' + getFormatYmdHms() + '.pdf');
    xlsFile.setFolder(FILE_CABINET_ID_DJ_DELIVERY_INV_PDF);
    xlsFile.setIsOnline(true);

    // save file
    var fileID = nlapiSubmitFile(xlsFile);
    var fl = nlapiLoadFile(fileID);

    var url= URL_HEAD +'/'+fl.getURL();
    nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
    nlapiLogExecution('debug', '納品書＆請求書 pdf end');
	}   
	if(!isEmpty(repairPDFId)){
		nlapiLogExecution('debug', '修理品pdf start,ID:'+repairPDFId);
		var repairRecord=nlapiLoadRecord('customrecord_djkk_repair', repairPDFId);
		var tranid = repairRecord.getFieldValue('tranid');
		nlapiLogExecution('debug', '修理品 tran ID:'+tranid);
		//DJ_連結
		var subsidiary = repairRecord.getFieldValue('custrecord_djkk_re_subsidiary');
		var subsidiaryAddress= nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",subsidiary]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), 
				   new nlobjSearchColumn("phone","address",null), 
				   new nlobjSearchColumn("legalname"), 
				   new nlobjSearchColumn("url")
				]
		);
		//連結住所のTEL
		var subsidiaryTel = defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("phone","address",null));
		var subsidiaryFax= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_address_fax","address",null));
		var subsidiaryName= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("legalname"));
		var subsidiaryUrl= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("url"));

		var publishDate = formatDate(new Date());//発行日
		var createDate = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_createdata'));//受付日,作成日
		if(createDate){
			createDate = formatDate(nlapiStringToDate(createDate));
		}
		//管理番号
		var bookno = repairRecord.getFieldValue('name');
		//医療機関名
		var medName = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_institution'));
		//医療機関住所
		var medAddr= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_addr'));
		//医療機関電話番号
		var medTel= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_tel'));
		//医療機関担当者
		var medInCharge= getPersonName(defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_in_charge')));
		//販売店名
		var shopName = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_name'));
		//販売店住所
		var shopAddr= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_addr'));
		//販売店電話番号
		var shopTel= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_tel'));
		//販売店担当者
		var shopInCharge= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_representative'));
		//依頼品
		var requestItem= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_item'));
		var requestcode = '';
		if(requestItem){
			var requestItemSearch = nlapiSearchRecord("item",null,
					[
					   ["internalid","anyof", requestItem]
					], 
					[
					   new nlobjSearchColumn("itemid"),
					   new nlobjSearchColumn("displayname")
					]
					);
			if(!isEmpty(requestItemSearch)){
				requestcode = requestItemSearch[0].getValue('displayname');
				requestItem = requestItemSearch[0].getValue('itemid');
			}
		}		
		
		//ンリアル番号
		var serialNo= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_serial_no'));
		//作業開始日
		var workStartDate= repairRecord.getFieldValue('custrecord_djkk_re_work_startdate');
		if(workStartDate){
			workStartDate = formatDate(nlapiStringToDate(workStartDate));
		}
		workStartDate = defaultEmpty(workStartDate);
		//作業完了日
		var workEndDate= repairRecord.getFieldValue('custrecord_djkk_re_work_enddate');
		if(workEndDate){
			workEndDate = formatDate(nlapiStringToDate(workEndDate));
		}
		workEndDate = defaultEmpty(workEndDate);
		
		//前回校正日
		var lastCalDate= repairRecord.getFieldValue('custrecord_djkk_re_lastcalibration_date');
		if(lastCalDate){
			lastCalDate = formatDate(nlapiStringToDate(lastCalDate));
		}
		lastCalDate = defaultEmpty(lastCalDate);
		//出荷日
		var sendDate= repairRecord.getFieldValue('custrecord_djkk_re_send_date');
		if(sendDate){
			sendDate = formatDate(nlapiStringToDate(sendDate));
		}
		sendDate = defaultEmpty(sendDate);
		//依頼内容
		var requestDetail= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_request_detail'));
		//故障原因
		var reportCause= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_wo_report_cause'));
		//作業内容
		var reportDesc= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_wo_report_description'));
		//備考
		var reportMemo= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_wo_report_mome'));
		//作業者
		var operator= getPersonName(defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_operator')));
		//医療機器修理業責任技術者
		var techInCharge= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_tech_in_charge'));
		//医僚機器修理担当
		//請求内容
		var itemDetails = ['','','','','','','','','',''];
		var itemDetailsName = ['','','','','','','','','',''];
		var estimateSearch = nlapiSearchRecord("estimate",null,
				[
				   ["custbody_djkk_estimate_re","anyof",repairPDFId], 
				   "AND", 
				   ["type","anyof","Estimate"]
				], 
				[
				   new nlobjSearchColumn("trandate").setSort(false),
				   new nlobjSearchColumn("internalid") 
				]
				);
		if(!isEmpty(estimateSearch)){
			var estimateId = estimateSearch[0].getValue('internalid'); // only need get first estimate
			nlapiLogExecution('debug', 'estimateId', estimateId);
			if(estimateSearch.length > 1){
				for(var m = 1; m < estimateSearch.length; m++){
					nlapiLogExecution('debug', 'other estimateId', estimateSearch[m].getValue('internalid'));
				}
			}
			var estimateObj = nlapiLoadRecord('estimate', estimateId);
			var sublistCount = estimateObj.getLineItemCount('item');
			var itemIdArray = [];
			var itemIdMap = {};
			var itemNameID={};
			nlapiLogExecution('debug', 'sublistCount', sublistCount);
			for(var s = 1; s <= sublistCount && s <= 10; s ++){
				var item = estimateObj.getLineItemValue('item', 'item', s);//item
				var itemName =estimateObj.getLineItemValue('item', 'custcol_djkk_item_display', s);//item name
				nlapiLogExecution('debug', 'item', item + ' : ' + itemName);				
				itemIdArray.push(item);
				itemDetails[s - 1] = item;
				itemDetailsName[s-1]=item;
			}
			if(itemIdArray.length){
				nlapiLogExecution('debug', 'itemIdArray', itemIdArray);
				var itemSearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","anyof", itemIdArray]
						], 
						[
						   new nlobjSearchColumn("internalid"),
						   new nlobjSearchColumn("itemid"),
						   new nlobjSearchColumn("displayname")
						]
						);
				if(!isEmpty(itemSearch)){
					for(var s=0;s<itemSearch.length;s++){
						var internalid= itemSearch[s].getValue('internalid');
						var itemid= itemSearch[s].getValue('itemid');
						var itemname=itemSearch[s].getValue('displayname');
						itemIdMap[internalid] = itemid;
						itemNameID[internalid]=itemname;
						
						nlapiLogExecution('debug', 'item-' + internalid, itemid);
					}
				}
				for( var n = 0; n < 10; n ++){
					var internalid = itemDetails[n];
					if(internalid){
						itemDetails[n] = itemIdMap[internalid];
					}
				}
				for( var j = 0; j < 10; j ++){
					var internalid = itemDetailsName[j];
					if(internalid){
						itemDetailsName[j] = itemNameID[internalid];
					}
				}
			}
		}	
		
		
		var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
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
		'    <style type="text/css">* {'+
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
		'   table { font-size: 9pt; width: 100%; border-collapse:collapse}'+
		'   .table-noborder td{ border: 0px!important}'+
		'   .summary-table td{ height: 20px}'+
		'   .main-table td{ border-right: 0px; border-bottom: 0px;}'+
		'	.request-table td{ width: 110px; border-right: 0px; border-bottom: 0px;}' +
		'   .border-right{ border-right: 1px solid!important;}' +
		'   .width-col td{ border: 0px;height: 0px;}' +
		'   .title-color{ color: #8293d2}' +
		'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
		' td { vertical-align: top;height: 27px; border: 1px solid lightgrey; padding-top: 10px; border-collapse:collapse}'+
		'b { font-weight: bold; color: #333333; }'+
		'.bottom-line-2px {border-bottom: 3px solid black; vertical-align: middle;}' +
		'.border-tb-dash {border-top: 1px dashed black; border-bottom: 1px dashed black;}' +
		'.border-top-dot {border-top: 1px dotted black;}' +
		'</style>'+
		'</head>'+
		'<body padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';

		str += '<table border="0" class="table-noborder" style="width: 660px;" cellspacing="0" cellpadding="0">' +
	    '    <tr>' +
	    '        <td rowspan="3" style="width: 200px;">&nbsp;</td>' +
	    '        <td align="center" style="vertical-align: top;"><span style="font-size: 24px; border-top: 4px solid white; text-align:center;">' +
	    '            <strong>修&nbsp;&nbsp;&nbsp;&nbsp;理&nbsp;&nbsp;&nbsp;&nbsp;報&nbsp;&nbsp;&nbsp;&nbsp;告&nbsp;&nbsp;&nbsp;&nbsp;書</strong></span></td>' +
	    '        <td rowspan="3" style="width: 200px;vertical-align: top;">' +
	    '            <span style="border-top: 4px solid silver; border-bottom: 4px solid silver;font-size: 24px; color:#0054ac;">' +
	    '                <strong>' + subsidiaryName + '</strong>' +
	    '            </span>' +
	    '        </td>' +
	    '    </tr>' +
	    '    <tr><td align="center"><span style="font-size: 24px; border-top: 4px solid white; text-align:center;"><strong style="text-align: center;">及び</strong></span></td></tr>'  +
	    '    <tr><td align="center"><span style="font-size: 24px; border-top: 4px solid white; text-align:center;"><strong style="text-align: center;">サービス報&nbsp;&nbsp;&nbsp;&nbsp;告&nbsp;&nbsp;&nbsp;&nbsp;書</strong></span></td></tr>'  +
	    '</table>' +
	    '' +
	    '<table border="0" style="width: 660px;" cellspacing="0" cellpadding="0">' +
	    '    <tr>' +
	    '        <td align="right" style="border:0 ">' +
	    '            <table border="0" cellspacing="0" cellpadding="0" style="width: 210px; border-bottom: 0;border-style: solid; border-color: darkgrey">' +
	    '                <tr>' +
	    '                    <td class="title-color" align="right" style="text-decoration: underline; width: 80px; border-right: 0;border-bottom: 0">管理番号</td><td align="right" style="text-decoration: underline; width: 130px;border-bottom: 0;">' + bookno + '</td>' +
	    '                </tr>' +
	    '            </table>' +
	    '        </td>' +
	    '    </tr>' +
	    '</table>' +
	    '<table class="main-table" border="0" style="width: 660px;" cellspacing="0" cellpadding="0">' +
	    '	<tr class="width-col"><td style="width: 90px;"></td><td style="width: 60px"></td><td style="width: 120px"></td><td style="width: 100px"></td>' + 
	    '       <td style="width: 90px"></td><td style="width: 100px"></td><td style="width: 100px"></td></tr>' +
	    '    <tr>' +
	    '        <td class="title-color">発行日</td>' +
	    '        <td colspan="2" width="230px">' + publishDate + '</td>' +
	    '        <td class="title-color">受付日</td>' +
	    '        <td colspan="3" class="border-right">' + createDate + '</td>' +
	    '    </tr>' +
	    '    <tr>' +
	    '        <td class="title-color" rowspan="3">医療機関</td>' +
	    '        <td class="title-color">医療機関名</td>' +
	    '        <td colspan="3">' + medName + '</td>' +
	    '        <td class="title-color">こ担当者</td>' +
	    '        <td class="border-right">' + medInCharge + '</td>' +
	    '    </tr>' +
	    '    <tr>' +
	    '        <td class="title-color">住所</td>' +
	    '        <td colspan="5" class="border-right">' + medAddr + '</td>' +
	    '    </tr>' +
	    '    <tr>' +
	    '        <td class="title-color">電話番号</td>' +
	    '        <td colspan="5" class="border-right">' + medTel + '</td>' +
	    '    </tr>' +
	    '    <tr>' +
	    '        <td class="title-color" rowspan="3">販売店</td>' +
	    '        <td class="title-color">販売店名</td>' +
	    '        <td colspan="3">' + shopName + '</td>' +
	    '        <td class="title-color">こ担当者</td>' +
	    '        <td class="border-right">' + shopInCharge + '</td>' +
	    '    </tr>' +
	    '    <tr>' +
	    '        <td class="title-color">住所</td>' +
	    '        <td colspan="5" class="border-right">' + shopAddr + '</td>' +
	    '    </tr>' +
	    '    <tr>' +
	    '        <td class="title-color">電話番号</td>' +
	    '        <td colspan="5" class="border-right">' + shopTel + '</td>' +
	    '    </tr>' +
	    '    <tr>' +
	    '        <td class="title-color">依頼品</td>' +
	    '        <td colspan="4">' + requestcode +'</td>' +
	    '        <td class="title-color">ンリアル番号</td>' +
	    '        <td class="border-right">' + serialNo + '</td>' +
	    '    </tr>' +
	    '    <tr>' +
	    '        <td class="title-color">作業開始日</td>' +
	    '        <td colspan="2">' + workStartDate + '</td>' +
	    '        <td class="title-color">前回校正日</td>' +
	    '        <td colspan="3" class="border-right">' + lastCalDate + '</td>' +
	    '    </tr>' +
	    '' +
	    '    <tr>' +
	    '        <td class="title-color">作業完了日</td>' +
	    '        <td colspan="2">' + workEndDate + '</td>' +
	    '        <td class="title-color">出荷日</td>' +
	    '        <td colspan="3" class="border-right">' + sendDate + '</td>' +
	    '    </tr>' +
	    '    <tr style="height: 60px;">' +
	    '        <td class="title-color">依頼内容</td>' +
	    '        <td colspan="6" class="border-right">' + requestDetail + '</td>' +
	    '    </tr>' +
	    '    <tr style="height: 60px;">' +
	    '        <td class="title-color">故障原因</td>' +
	    '        <td colspan="6" class="border-right">' + reportCause + '</td>' +
	    '    </tr>' +
	    '    <tr style="height: 90px;">' +
	    '        <td class="title-color">作業内容</td>' +
	    '        <td colspan="6" class="border-right">' + reportDesc + '</td>' +
	    '    </tr>' +
	    '    <tr style="height: 60px;">' +
	    '        <td class="title-color">備考</td>' +
	    '        <td colspan="6" class="border-right">' + reportMemo + '</td>' +
	    '    </tr>' +
	    '    <tr>' +
	    '        <td class="title-color">請求内容</td>' +
	    '        <td colspan="6" class="border-right">' +
	    '            <table class="request-table" border="0" border-top="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">' +
	    '                <tr>' +
	    '                    <td style="border-top: 0; border-left: 0">'+itemDetailsName[0]+'</td>' +
	    '                    <td style="border-top: 0;">'+itemDetailsName[1]+'</td>' +
	    '                    <td style="border-top: 0;">'+itemDetailsName[2]+'</td>' +
	    '                    <td style="border-top: 0;">'+itemDetailsName[3]+'</td>' +
	    '                    <td style="border-top: 0;">'+itemDetailsName[4]+'</td>' +
	    '                </tr>' +
	    '                <tr>' +
	    '                    <td style="border-left: 0;">'+itemDetailsName[5]+'</td>' +
	    '                    <td>'+itemDetailsName[6]+'</td>' +
	    '                    <td>'+itemDetailsName[7]+'</td>' +
	    '                    <td>'+itemDetailsName[8]+'</td>' +
	    '                    <td>'+itemDetailsName[9]+'</td>' +
	    '                </tr>' +
	    '            </table>' +
	    '        </td>' +
	    '    </tr>    ' +
	    '    <tr>' +
	    '        <td class="title-color">作業者</td>' +
	    '        <td colspan="2" align="center">' + operator + '&nbsp;&nbsp;&nbsp;印</td>' +
	    '        <td class="title-color" colspan="2">医療機器修理業責任技術者</td>' +
	    '        <td colspan="2" class="border-right" align="center">' + techInCharge + '&nbsp;&nbsp;&nbsp;印</td>' +
	    '    </tr>' +
	    '    <tr>' +
	    '        <td colspan="7" style="border-right: 1px solid!important; border-bottom: 1px solid!important;">' +
	    '            <table class="table-noborder summary-table" border="0" cellspacing="0" cellpadding="0" style="width: 660px;">' +
	    '                <tr>' +
	    '                    <td colspan="2" align="center">&nbsp;</td>' +
	    '                </tr>' +
	    '                <tr>' +
	    '                    <td class="title-color" colspan="2" align="center" style="text-decoration: underline;">修理等に関するお問い合わせ先</td>' +
	    '                </tr>' +
	    '                <tr>' +
	    '                    <td align="right">' + subsidiaryName + '&nbsp;&nbsp;&nbsp;&nbsp;</td>' +
	    '                    <td align="left">&nbsp;&nbsp;&nbsp;&nbsp;<span class="title-color">担当 :</span>医僚機器修理担当</td>' +
	    '                </tr>' +
	    '                <tr>' +
	    '                    <td colspan="2" align="center"><span class="title-color">電話番号:</span>&nbsp;' + subsidiaryTel + '</td>            ' +
	    '                </tr>' +
	    '                <tr>' +
	    '                    <td colspan="2" align="center"><span class="title-color">FAX番号:</span>&nbsp;' + subsidiaryFax + '</td>' +
	    '                </tr>' +
	    '                <tr>' +
	    '                    <td colspan="2" align="center"></td>' +
	    '                </tr>' +
	    '                <tr>' +
	    '                    <td colspan="2" align="center">' + subsidiaryUrl + '</td>' +
	    '                </tr>' +
	    '            </table>' +
	    '        </td>' +
	    '    </tr>' +
	    '</table>';

		str += '</body>'+
		'</pdf>';
		
		 var renderer = nlapiCreateTemplateRenderer();
		    renderer.setTemplate(str);
		    var xml = renderer.renderToString();
		    var xlsFile = nlapiXMLToPDF(xml);
		    
		    // PDFファイル名を設定する
		    xlsFile.setName('修理品PDF出力' + '_' + getFormatYmdHms() + '.pdf');
		    xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
		    xlsFile.setIsOnline(true);

		    // save file
		    var fileID = nlapiSubmitFile(xlsFile);
		    var fl = nlapiLoadFile(fileID);

		    var url= URL_HEAD +'/'+fl.getURL();
		    nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
		nlapiLogExecution('debug', '修理品pdf end');
	}
	
	if(!isEmpty(repairEstimateId)){
		nlapiLogExecution('debug', '見    積pdf start,ID:'+repairEstimateId);
		var estimateRecord=nlapiLoadRecord('estimate', repairEstimateId);
		var repairId = estimateRecord.getFieldValue('custbody_djkk_estimate_re');
		nlapiLogExecution('debug', 'repairCode:'+repairId);
		// CH762 add by zdj 20230818 start
		var transactionPDF = estimateRecord.getFieldValue('transactionnumber');
		
		var repairRecord=nlapiLoadRecord('customrecord_djkk_repair', repairId);
		//DJ_連結
		var subsidiary = estimateRecord.getFieldValue('subsidiary');
		var subsidiaryAddress= nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",subsidiary]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), 
				   new nlobjSearchColumn("custrecord_djkk_address_state","address",null),
				   new nlobjSearchColumn("city","address",null), 
				   new nlobjSearchColumn("address1","address",null), 
				   new nlobjSearchColumn("address2","address",null), 
				   new nlobjSearchColumn("address3","address",null),
				   new nlobjSearchColumn("phone","address",null), 
				   new nlobjSearchColumn("zip","address",null), 
				   new nlobjSearchColumn("custrecord_djkk_mail","address",null), 
				   new nlobjSearchColumn("custrecord_djkk_subsidiary_type"), 
				   new nlobjSearchColumn("legalname"), 
				   new nlobjSearchColumn("name"), 
				   new nlobjSearchColumn("url")
				]
		);
		var subsidiaryType= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_subsidiary_type"));
		nlapiLogExecution('debug', 'subsidiaryType:'+subsidiaryType);
		//連結住所のTEL
		var subsidiaryZip = defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("zip","address",null));

		if(subsidiaryZip && subsidiaryZip.substring(0,1) != '〒'){
			subsidiaryZip = '〒' + subsidiaryZip;
		}
		var subsidiaryTel = defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("phone","address",null));
		if(subsidiaryTel){
			subsidiaryTel = 'TEL: ' + subsidiaryTel;
		}
		var subsidiaryFax= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_address_fax","address",null));
		if(subsidiaryFax){
			subsidiaryFax = 'FAX: ' + subsidiaryFax;
		}
		var subsidiaryMail= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_mail","address",null));
		if(subsidiaryMail){
			subsidiaryMail = 'email: ' + subsidiaryMail;
		}
		var subsidiaryState= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_address_state","address",null));
		var subsidiaryCity= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("city","address",null));
		var subsidiaryAddr1= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("address1","address",null));
		var subsidiaryAddr2= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("address2","address",null));
		var subsidiaryAddr3= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("address3","address",null));
		var subsidiaryName= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("legalname"));
		var subsidiaryDisplayName= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("name"));
		var subsidiaryUrl= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("url"));

		var publishDate = formatDate(new Date());//発行日
		var createDate = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_createdata'));//受付日,作成日
		if(createDate){
			createDate = formatDate(nlapiStringToDate(createDate));
		}
		//医療機関名
		var medName = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_institution'));
		//医療機関住所
		var medAddr= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_addr'));
		//医療機関電話番号
		var medTel= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_tel'));
		//医療機関担当者
		var medInCharge= getPersonName(defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_in_charge')));
		//販売店名
		var shopName = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_name'));
		//販売店部門
		var shopDepart = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_depart'));
		//販売店住所
		var shopAddr= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_addr'));
		//販売店電話番号
		var shopTel= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_tel'));
		//販売店担当者
		var shopInCharge= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_representative'));
		//依頼品
		var requestItem= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_item'));
		//itemcode
		var requestItemCode='';
		if(requestItem){
			var requestItemSearch = nlapiSearchRecord("item",null,
					[
					   ["internalid","anyof", requestItem]
					], 
					[
					   new nlobjSearchColumn("itemid"),
					   new nlobjSearchColumn("displayname")
					]
					);
			if(!isEmpty(requestItemSearch)){
				requestItem = requestItemSearch[0].getValue('itemid');
				requestItemCode=requestItemSearch[0].getValue('displayname');
			}
		}		
		//ンリアル番号
		var serialNo= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_serial_no'));
		
		//エンドユーザー
		var endUser = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_end_user'));
		var ppm20 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_1'));
		var ppm8 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_2'));
		var ppm3 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_3'));
		// 測定不可
		var answer4 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_4'));
		nlapiLogExecution('debug', '測定', answer4);
		var answer5 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_5'));
		var answer6 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_6'));
		var answer7 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_7'));
		var answer8 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_8'));
		//メモ
		var memo = defaultEmpty(estimateRecord.getFieldValue('memo'));
		
		var sublistCount = estimateRecord.getLineItemCount('item');
		var itemIdArray = [];
		var itemIdMap = {};
		var itemDetails = [];
		var amountTotal = 0;
		var taxTotal = 0;
		var taxType = {};
		var taxTypeArray = [];
		nlapiLogExecution('debug', 'sublistCount', sublistCount);
		for(var s = 1; s <= sublistCount && s <= 10; s ++){
			var item = estimateRecord.getLineItemValue('item', 'item', s);//item
			var itemcode = nlapiLookupField('item',item,'displayname');
			var amount = parseFloat(estimateRecord.getLineItemValue('item', 'amount', s));//金額
			var taxRate = estimateRecord.getLineItemValue('item', 'taxrate1', s);//税率
			var taxAmount = parseFloat(estimateRecord.getLineItemValue('item', 'tax1amt', s));//税額
			var quantity = parseFloat(estimateRecord.getLineItemValue('item', 'quantity', s));//数量
			var rate = estimateRecord.getLineItemValue('item', 'rate', s);//修理単価
			var price = estimateRecord.getLineItemValue('item', 'custcol_djkk_pricing', s);//定価
			amountTotal += amount;
			taxTotal += taxAmount;
			var taxRateData = taxType[taxRate] || 0;
			taxType[taxRate] = taxRateData + taxAmount;
			if(taxTypeArray.indexOf(taxRate) < 0){
				taxTypeArray.push(taxRate);
			}
			itemIdArray.push(item);
			itemDetails.push({
				item: item,
				amount: amount,
				taxRate: taxRate,
				taxAmount: taxAmount,
				quantity: quantity,
				rate: rate,
				price: price,
				itemcode:itemcode
			});
		}
		if(itemIdArray.length){
			nlapiLogExecution('debug', 'itemIdArray', itemIdArray);
			var itemSearch = nlapiSearchRecord("item",null,
					[
					   ["internalid","anyof", itemIdArray]
					], 
					[
					   new nlobjSearchColumn("internalid"),
					   new nlobjSearchColumn("itemid")
					]
					);
			if(!isEmpty(itemSearch)){
				for(var s=0;s<itemSearch.length;s++){
					var internalid= itemSearch[s].getValue('internalid');
					var itemid= itemSearch[s].getValue('itemid');
					itemIdMap[internalid] = itemid;
					nlapiLogExecution('debug', 'item-' + internalid, itemid);
				}
			}
		}
		

		/*var currency = defaultEmpty(estimateRecord.getFieldValue('currency'));
		nlapiLogExecution('debug', 'currency', currency);
		var trandate = formatDate(nlapiStringToDate(defaultEmpty(estimateRecord.getFieldValue('trandate'))));
		var custom = defaultEmpty(estimateRecord.getFieldValue('entity'));
		var customObj=nlapiLoadRecord('customer', custom);
		var priceListType = '', priceListId = '';

		var priceListSearch = [];
		var priceMap = {};
		governanceYield();
		//価格表
		if("1" == subsidiaryType){// 食品
			priceListId = customObj.getFieldValue('custentity_djkk_pl_code_fd');			
			priceListSearch = nlapiSearchRecord("customrecord_djkk_price_list_fd",null,
					[
					   ["internalid","anyof", priceListId], 
					   "AND", 
					   ["custrecord_djkk_pldt_pl.custrecord_djkk_pldt_itemcode_fd","anyof", itemIdArray]
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_pldt_itemcode_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null), 
					   new nlobjSearchColumn("custrecord_djkk_pl_startdate_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null), 
					   new nlobjSearchColumn("custrecord_djkk_pl_enddate_calculationfd","CUSTRECORD_DJKK_PLDT_PL_FD",null), 
					   new nlobjSearchColumn("custrecord_djkk_pldt_saleprice_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null)
					]
					);
			if(!isEmpty(priceListSearch)){
				for(var k = 0; k < priceListSearch.length; k ++){
					var line = priceListSearch[k];
					var itemCode = line.getValue("custrecord_djkk_pldt_itemcode_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null);
					var startDate = formatDate(nlapiStringToDate(line.getValue("custrecord_djkk_pl_startdate_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null)));
					var endDate = formatDate(nlapiStringToDate(line.getValue("custrecord_djkk_pl_enddate_calculationfd","CUSTRECORD_DJKK_PLDT_PL_FD",null)));
					var price = line.getValue("custrecord_djkk_pldt_saleprice_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null);
					nlapiLogExecution('debug', 'priceListSearch itemCode', itemCode);
					nlapiLogExecution('debug', 'priceListSearch startDate', startDate);
					nlapiLogExecution('debug', 'priceListSearch endDate', endDate);
					nlapiLogExecution('debug', 'priceListSearch price', price);
					if(trandate >= startDate && trandate <= endDate){
						priceMap[itemCode] = price;
					}
				}
			}
		} else {//LS
			priceListId = customObj.getFieldValue('custentity_djkk_pl_code');
			priceListSearch = nlapiSearchRecord("customrecord_djkk_price_list",null,
					[
					   ["internalid","anyof", priceListId], 
					   "AND", 
					   ["custrecord_djkk_pldt_pl.custrecord_djkk_pldt_itemcode","anyof", itemIdArray]
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_pldt_itemcode","CUSTRECORD_DJKK_PLDT_PL",null), 
					   new nlobjSearchColumn("custrecord_djkk_pl_startdate","CUSTRECORD_DJKK_PLDT_PL",null), 
					   new nlobjSearchColumn("custrecord_djkk_pl_enddate_calculation","CUSTRECORD_DJKK_PLDT_PL",null), 
					   new nlobjSearchColumn("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL",null)
					]
					);
			if(!isEmpty(priceListSearch)){
				for(var k = 0; k < priceListSearch.length; k ++){
					var line = priceListSearch[k];
					var itemCode = line.getValue("custrecord_djkk_pldt_itemcode","CUSTRECORD_DJKK_PLDT_PL",null);
					var startDate = formatDate(nlapiStringToDate(line.getValue("custrecord_djkk_pl_startdate","CUSTRECORD_DJKK_PLDT_PL",null)));
					var endDate = formatDate(nlapiStringToDate(line.getValue("custrecord_djkk_pl_enddate_calculation","CUSTRECORD_DJKK_PLDT_PL",null)));
					var price = line.getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL",null);
					nlapiLogExecution('debug', 'priceListSearch itemCode', itemCode);
					nlapiLogExecution('debug', 'priceListSearch startDate', startDate);
					nlapiLogExecution('debug', 'priceListSearch endDate', endDate);
					nlapiLogExecution('debug', 'priceListSearch price', price);
					if(trandate >= startDate && trandate <= endDate){
						priceMap[itemCode] = price;
					}
				}
			}
		}*/
		var noPriceItem = [];
		for( var n = 0; n < itemDetails.length; n ++){
			var itemDetail = itemDetails[n];
			itemDetail.item = itemIdMap[itemDetail.item];
			/*var price = priceMap[itemDetail.item];
			if(price == null){
				noPriceItem.push(itemDetail.item);
			}else{
				itemDetail.price = price;
			}*/
		}
		/*if(noPriceItem.length){//アイテム販売 / 価格設定 
			var itemPriceSearch = nlapiSearchRecord("item",null,
					[
					   ["internalid","anyof", noPriceItem], 
					   "AND", 
					   ["pricing.currency","anyof", currency], 
					   "AND", 
					   ["pricing.internalid","anyof","1"]
					], 
					[
					   new nlobjSearchColumn("internalid"), 
					   new nlobjSearchColumn("unitprice","pricing",null)
					]
					);
			if(!isEmpty(itemPriceSearch)){
				for(var k = 0; k < itemPriceSearch.length; k ++){
					var line = itemPriceSearch[k];
					var item = line.getValue('internalid');
					var price = line.getValue("unitprice","pricing",null);
					priceMap[item] = price;
				}
			}
		}
		
		for( var n = 0; n < itemDetails.length; n ++){
			var itemDetail = itemDetails[n];
			var price = priceMap[itemDetail.item];
			if(itemDetail.price == null){
				itemDetail.price = price;
			}
		}*/
		
		var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
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
		
		'<macrolist>'+
		'<macro id="nlfooter">'+
		'    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '<tr>' +
	    
	    '<td colspan="2" align="center"><img style="margin-left: 30px; width: 120px; height: 60px;" src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" /></td>' +
	    '</tr>' +
	    '    </table>' +
	    '</macro>'+
		'</macrolist>'+
		
		
		
		
		
		'    <style type="text/css">* {'+
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
		'   table { font-size: 9pt; width: 100%; border-collapse:collapse;}'+
		' td {height: 20px}' +
		' .opt-table td {height: 5px;}' +
		' .item-table td {vertical-align: middle; border:1px solid;}' +
		'   .sale-shop-title { font-size: 22px; height: 30px;}' +
		'   .table-noborder td{ border: 0px!important}'+
		'   .summary-table td{ height: 20px}'+
		'   .main-table td{ border-right: 0px; border-bottom: 0px;}'+
		'	.request-table td{ width: 110px; border-right: 0px; border-bottom: 0px;}' +
		'   .border-right{ border-right: 1px solid!important;}' +
		'   .width-col td{ border: 0px;height: 0px;}' +
		'   .title-color{ color: #8293d2}' +
		'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
		'b { font-weight: bold; color: #333333; }'+
		'.bottom-line-2px {border-bottom: 3px solid black; vertical-align: middle;}' +
		'.border-tb-dash {border-top: 1px dashed black; border-bottom: 1px dashed black;}' +
		'.border-top-dot {border-top: 1px dotted black;}' +
		'</style>'+
		'</head>'+
		
		'<body footer="nlfooter" footer-height="1%"  size="Letter">';
		
		str += '<table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '        <tr>' +
	    '            <td style="width: 80px" rowspan="2">&nbsp;</td><td align="center" style="text-align: center; height: 30px;"><span  style="color: #0054ac; font-size: 22px;">' + subsidiaryDisplayName + '</span></td><td align="right" style="width: 80px;vertical-align: middle;" rowspan="2">' + publishDate + '</td>' +
	    '        </tr>' +
	    '        <tr>' +
	    '        <td align="center"><span style="color: lightgray; height: 25px;">' + subsidiaryName + '</span></td>' +
	    '        </tr>' +
	    '        <tr>' +
	    '            <td>&nbsp;</td>' +
	    '        </tr>' +
	    '        <tr>' +
	    '            <td colspan="3" align="center" style="font-size: 24px; font-weight: bold;">見&nbsp;&nbsp;&nbsp;&nbsp;積&nbsp;&nbsp;&nbsp;&nbsp;書</td>' +
	    '        </tr>' +
	    '        <tr>' +
	    '            <td>&nbsp;</td>' +
	    '        </tr>' +
	    '    </table>' +
	    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '        <tr>' +
	    '            <td style="width: 330px;">' +
	    '                <table border="0" style="width: 100%" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '                    <tr><td colspan="2" class="sale-shop-title">' + shopName + '</td></tr>' +
	    '                    <tr><td colspan="2" class="sale-shop-title">' + shopDepart + '</td></tr>' +
	    '                    <tr><td colspan="2" class="sale-shop-title">' + shopInCharge + '&nbsp;&nbsp;&nbsp;&nbsp;様</td></tr>' +
	    '                    <tr><td colspan="2">&nbsp;</td></tr>' +
	    '                    <tr><td align="right" style="vertical-align: top;">シリアルNo.</td><td align="center" style="font-weight: bold;font-size: 22px; width: 220px; border-bottom: 1px solid;">' + serialNo + '</td></tr>' +
	    '                </table>' +
	    '            </td>            ' +
	    '            <td style="width: 330px;">' +
	    '                <table border="0" style="width: 100%" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '                    <tr><td align="right" style="font-size: 20px; font-weight: bold;height: 30px;">DENNISファーマ株式会社</td></tr>' +  //' + subsidiaryName + '
	    '                    <tr><td align="right"><span style="background-color: black; height: 20px; width: 20px;">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;医療機械修理担当</td></tr>' +
	    '                    <tr><td align="right">〒285-0802</td></tr>' +//' + subsidiaryZip + '
	    '                    <tr><td align="right">千葉県佐倉市大作1丁目8番5号</td></tr>' +//' + subsidiaryState + subsidiaryCity + subsidiaryAddr1 + subsidiaryAddr2 + subsidiaryAddr3 + '
	    '                    <tr><td align="right">TEL:043-498-2597</td></tr>' +//' + subsidiaryTel + '
	    '                    <tr><td align="right">FAX:043-498-2009</td></tr>' +//' + subsidiaryFax + '
	    '                    <tr><td align="right">e-mail:corepair@denispharma.jp</td></tr>' +//' + subsidiaryMail + '
	    '                </table>' +
	    '            </td>' +
	    '        </tr>' +
	    '    </table>' +
	    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '        <tr><td>いつも大変お世話になっております。</td></tr>' +
	    '        <tr><td>ご依頼いただいております'+requestItemCode+'の修理につきましてご連絡いたします。</td></tr>' +
	    '        <tr><td>メモ:'+memo+'</td></tr>' +
	    '        <tr><td style="font-weight: bold;">こ担当者：' + medName + '&nbsp;&nbsp;' + medInCharge + '&nbsp;&nbsp;(電話：' + medTel + ')'+ '</td></tr>' +
	    '        <tr><td style="font-weight: bold;">エンドユーザー：' + endUser + '</td></tr>' +
	    '    </table>' +
	    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '        <tr>       ' +
	    '            ' +
	    '            <td style="width: 270px; vertical-align: top;">' +
	    '                <table class="opt-table" border="0" style="width: 100%; border: 1px dotted; border-bottom: 0;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '                    <tr><td style="height: 4px!important;"></td></tr>' +
	    '                </table>' +
	    '                <table border="0" style="width: 100%;border: 1px dotted;border-top: 0;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '                    <tr><td style="width: 10px"></td><td colspan="2">20ppm,8ppm,3ppmに調整された</td></tr>' +
	    '                    <tr><td style="width: 10px"></td><td colspan="2">標準COガスでｍｐ測定結果</td></tr>' +
	    '                    <tr>' +
	    '                        <td style="width: 10px"></td>' +
	    '                    <td>受取時：</td>' +
	    '                    <td>' +
	    '                        <table border="0" style="width: 100%;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '                            <tr><td align="right">20ppm→</td><td align="center">' + ppm20 + '</td><td>ppm</td></tr>' +
	    '                            <tr><td align="right">8ppm→</td><td align="center">' + ppm8 + '</td><td>ppm</td></tr>' +
	    '                            <tr><td align="right">3ppm→</td><td align="center">' + ppm3 + '</td><td>ppm</td></tr>' +
	    '                            <tr><td align="right" style="vertical-align: top;"><input type="checkbox" name="answer4" value="1"'+ (answer4 == 'T' ? ' checked="true" ' : '') + '/></td><td colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;測定不可</td></tr>' +
	    '                        </table>' +
	    '                    </td>' +
	    '                </tr>' +
	    '                </table>' +
	    '            </td>            ' +
	    '            <td style="width: 20px"></td>' +
	    '            <td style="vertical-align: top;">' +
	    '                <table class="opt-table" border="0" style="width: 100%; border: 1px dotted; border-bottom: 0;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '                    <tr><td style="height: 4px!important;"></td></tr>' +
	    '                </table>' +
	    '                <table border="0" style="width: 100%; border: 1px dotted; border-top: 0;table-layout: fixed;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '                    <tr><td style="width: 10px; height: 0px;"></td><td style="width: 50px; height: 0px;"></td><td style="height: 0px;"></td></tr>' +
	    '                    <tr><td></td><td colspan="2"><span style="margin-top: 5px;height: 40px;">不具合が見られた部位</span></td></tr>' +
	    '                    <tr><td></td><td><input type="checkbox" name="answer5" style="line-height:5px" value="1"'+ (answer5 == 'T' ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>電池プラグ（破損のため交換必須）</td></tr>' +
	    '                    <tr><td></td><td><input type="checkbox" name="answer6" value="1"'+ (answer6 == 'T' ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>センサー（故障しておりCALができません。信頼性ある測定値が得られない為、交換必須となります。）</td></tr>' +
	    '                    <tr style="height:40px"><td></td><td><input type="checkbox" name="answer7" value="1"'+ (answer7 == 'T' ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>センサー（故障ではありませんが劣化が考えられます。購入後または前回センサー交換時期より３年以上経過されている方に推奨しています。）</td></tr>' +
//	    '                    <tr><td></td><td><input type="checkbox" name="answer8" value="1"'+ (answer8 ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>その他（ ' + answer8 + ' ）</td></tr>' +
	    '                    <tr><td></td><td><input type="checkbox" name="answer8" value="1"'+ (answer8 ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="select" name="val" style="vertical-align:top;"><option>'+answer8+'</option><option value="1">その他(トップカバー交換)</option><option>その他(基盤交換)</option><option style="font-size:10px">その他(基盤交換及びトップカバー交換)</option></input></td></tr>' +
	    '                </table>' +
	    '            </td>' +
	    '        </tr>' +
	    '    </table>' +
	    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '        <tr><td style="width: 10px"></td><td align="center" style="width: 80px; vertical-align:middle; font-size: 22px;">金&nbsp;&nbsp;&nbsp;&nbsp;額</td><td align="center" style=" vertical-align:middle;font-weight: bold; font-size: 22px; width: 150px; height: 40px; border: 2px solid">${' + (amountTotal + taxTotal) + '?string[",##0;; roundingMode=halfUp"]}</td><td style="vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;※お振込手数料はお客様ご負担にてお願い申し上げます</td></tr>' +
	    '        <tr><td colspan="3" style="height: 5px;"></td></tr>' +
	    '    </table>' +
	    '    <table class="item-table" border="1" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '        <tr><td rowspan="2" align="center" style="width: 50px;background-color: black; color: white;">ご回答欄</td><td align="center">修理内容</td><td align="center">定価</td><td align="center">修理単価</td><td align="center">数量</td><td align="center">金額</td></tr>' +
	    '        <tr><td colspan="5" style="height: 4px;"></td></tr>';
		for(var k = 0; k < itemDetails.length; k++){
			var itemDetail = itemDetails[k];
			str += '<tr><td align="center"><input type="checkbox" name="item' + k + '" value="1"/></td><td>'+ itemDetail.itemcode + '</td><td align="right">${' + itemDetail.price + '?string[",##0;; roundingMode=halfUp"]}</td><td align="right">${' + itemDetail.rate + '?string[",##0;; roundingMode=halfUp"]}</td><td align="right">' + itemDetail.quantity + '</td><td align="right">${' + itemDetail.amount + '?string[",##0;; roundingMode=halfUp"]}</td></tr>';
		}
		
	    str += 
	    '        <tr><td align="center"><input type="checkbox" name="check" value="1"/></td><td>修理をせずに返却する</td><td></td><td></td><td></td><td></td></tr>' +
	    '        <tr>' +
	    '            <td rowspan="' + (taxTypeArray.length + 1) + '" align="center" style="border-right:0;height: 44px;vertical-align: middle;">' +
	    '                 <img style="width: 25px;height: 25px; border: 0;" src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=71422&amp;'+URL_PARAMETERS_C+'&amp;h=iFo_OJ5Iu7ZJUSeaBFqCi8Jtc12tzC11QLVI24QLVrt5ntog"/>' + 
	    '            </td>' +
	    '            <td rowspan="' + (taxTypeArray.length + 1) + '" style="border-left: 0">' +
	    '                 ご希望される修理に<br/>√をご記入下さい' + 
	    '            </td>' +
	    '            <td colspan="3" align="right">消費税' + taxTypeArray[0] + '</td>' +
	    '            <td align="right">${' + taxType[taxTypeArray[0]] + '?string[",##0;; roundingMode=halfUp"]}</td>' +
	    '        </tr>';
	    for(var k = 1; k < taxTypeArray.length; k ++){
		    str += '<tr>' +
		    '            <td colspan="3" align="right">消費税' + taxTypeArray[k] + '</td>' +
		    '            <td align="right">${' + taxType[taxTypeArray[k]] + '?string[",##0;; roundingMode=halfUp"]}</td>' +
		    '        </tr>';
	    }
	    
	    str += 
	    '        <tr>' +
	    '            <td colspan="3" align="right">合計</td>' +
	    '            <td align="right">${' + taxTotal + '?string[",##0;; roundingMode=halfUp"]}</td>' +
	    '        </tr>' +
	    '        <tr>' +
	    '            <td colspan="6" style="height: 80px; vertical-align: top;padding-top: 5px;">【通信欄】※伝達事項がございましたら、こちらにご記入をお願いいたします。</td>' +
	    '        </tr>' +
	    '    </table>' +
	    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
	    '        <tr>' +
	    '            <td colspan="2" style="height: 20px;"></td>' +
	    '        </tr>        ' +
	    '        <tr>' +
	    '            <td style="width: 100px"></td>' +
	    '            <td rowspan="2" style="width: 150px;font-weight:bold;">【見積の回答方法】</td><td>修理単価を提示した修理内容より、実施を御希望の修理に√をご記入の上</td>' +
	    '        </tr>' +
	    '        <tr>' +
	    '            <td></td>' +
	    '            <td>本見積書をFAXまたはEメールにて弊社宛にお送り下さい。</td>' +
	    '        </tr>        ' +
	    '        <tr>' +
	    '            <td></td>' +
	    '            <td style="font-weight:bold;">【修理開始について】</td><td>見積回答を頂いてから修理を開始いたします。</td>' +
	    '        </tr>        ' +
	    '        <tr>' +
	    '            <td></td>' +
	    '            <td style="font-weight:bold;">【修理後の発送について】</td><td>見積回答後、約1週間後に弊社より発送いたします。</td>' +
	    '        </tr>' +

	    '    </table>';
		
		str += '</body>'+
		'</pdf>';
		
		var renderer = nlapiCreateTemplateRenderer();
		renderer.setTemplate(str);
		var xml = renderer.renderToString();
		var xlsFile = nlapiXMLToPDF(xml);

		// PDFファイル名を設定する
		//xlsFile.setName('見積PDF出力' + '_' + getFormatYmdHms() + '.pdf');
		xlsFile.setName('見積' + '_' + transactionPDF + '_' + getDateYymmddFileName() + '.pdf');
//		xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
		xlsFile.setFolder(ESTIMATE_PDF_DJ_ESTIMATEPDF);
		xlsFile.setIsOnline(true);
		
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		var fl = nlapiLoadFile(fileID);
		
		var url= URL_HEAD +'/'+fl.getURL();
		nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
		nlapiLogExecution('debug', '見    積 pdf end');
	}
	
	function getPersonName(id){
		if(!id){
			return '';
		}
		var employeeSearch = nlapiSearchRecord("employee",null,
			[
			   ["internalid","anyof", id]
			], 
			[
			   new nlobjSearchColumn("lastname"), 
			   new nlobjSearchColumn("firstname")
			]
			);
		if(!isEmpty(employeeSearch)){
			return employeeSearch[0].getValue('lastname') + employeeSearch[0].getValue('firstname')
		}
		return '';
	}

	function formatDate(dt){
		return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
	}
	function defaultEmpty(src){
		return src || '';
	}

}
