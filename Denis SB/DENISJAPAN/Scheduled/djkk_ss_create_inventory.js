/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Dec 2022     ‘v
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
//—a‚èÀ’n’I‰µì¬—a‚èİŒÉ’²®
function scheduled(type) {
	nlapiLogExecution('debug', 'test', 'test');
	try{
		var recordId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_custbodyid');
		var record = nlapiLoadRecord('customrecord_djkk_custbody_shedunloading',recordId); //DJ_—a‚©‚èİŒÉÀ’n’I‰µ³”F‰æ–Ê
		var subsidiary = record.getFieldValue('custrecord_djkk_body_sub');//˜AŒ‹
		var headLocation = record.getFieldValue('custrecord_djkk_body_location');//êŠ
		var trandate = record.getFieldValue('custrecord_djkk_body_date');//“ú•t
		var count = record.getLineItemCount('recmachcustrecord_djkk_custody_stock_list');//–¾×
		var countArr = new Array(); //ŒÚ‹q
		var itemCountArray=new Array(); //s
		for (var s = 1; s < count+1; s++) {
			countArr.push(record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_purchase', s));//DJ_—a‚©‚èİŒÉŒÚ‹q 
		}
		var newCountArr = unique1(countArr);
		var recidArr = new Array();
		for(var j = 0; j < newCountArr.length; j++){
			var rec2 = nlapiCreateRecord('customrecord_djkk_ic_change'); //DJ_—a‚©‚èİŒÉ’²®
			rec2.setFieldValue('custrecord_djkk_ica_subsidiary',subsidiary);//q‰ïĞ
			rec2.setFieldValue('custrecord_djkk_ica_date',  trandate); //“ú•t
			var customer = newCountArr[j];
			rec2.setFieldValue('custrecord_djkk_ica_customer',  customer); //ŒÚ‹q			
				for(var n=1;n<count+1;n++){
					rec2.selectNewLineItem('recmachcustrecord_djkk_ica_change') //DJ_—a‚©‚èİŒÉ’²®–¾×
					if(record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_purchase', n)==customer){
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_inventory_adjustment', 'T') //DJ_İŒÉ’²®Flg
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_item', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_shed_item',n));//DJ_ƒAƒCƒeƒ€
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_line_subsidiary',subsidiary );//DJ_q‰ïĞ
						var library = record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_library',n); //İŒÉ”—Ê
						var quantity = record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_actual_quantity',n); //À’n”—Ê
						var adjustment = (quantity) - (library); //’²®”—Ê
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_inventoryqty', library); //DJ_İŒÉ”—Ê
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_adjqty', adjustment); //DJ_’²®”—Ê
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_newqty', quantity); //DJ_V‚µ‚¢”—Ê
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_warehouse', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_origina_location',n)); ////DJ_Œ³‚ÌêŠ
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_cuslocation', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_warehouse',n)); //DJ_—a‚©‚èİŒÉêŠ
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_unit', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_company',n)); //DJ_’PˆÊ
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_conversionrate', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_eye',n)); //DJ_“ü‚è–Ú
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_ic_id',record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_location_id',n)); //DJ_—a‚©‚èİŒÉID
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_id', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_storage_id',n)); //DJ_—a‚©‚èİŒÉ–¾×ID
						
						var oldIdvId = record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_library_id',n);
						var oldInv=nlapiLoadRecord('customrecord_djkk_inventory_details',oldIdvId);
						var inventyDetil=nlapiCreateRecord('customrecord_djkk_inventory_details');			
						inventyDetil.setFieldValue('custrecord_djkk_ind_item', oldInv.getFieldValue('custrecord_djkk_ind_item'));
						inventyDetil.setFieldValue('custrecord_djkk_ind_quantity', oldInv.getFieldValue('custrecord_djkk_ind_quantity'));
						inventyDetil.setFieldValue('custrecord_djkk_ind_item_explanation', oldInv.getFieldValue('custrecord_djkk_ind_item_explanation'));
						inventyDetil.setFieldText('custrecord_djkk_ind_unit', oldInv.getFieldValue('custrecord_djkk_ind_unit'));
						inventyDetil.setFieldValue('isinactive', 'T');
					
						var dcounts=oldInv.getLineItemCount('recmachcustrecord_djkk_inventory_details');
						for(var ss=1;ss<dcounts+1;ss++){
							oldInv.selectLineItem('recmachcustrecord_djkk_inventory_details', ss);
							var lotNum=oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_newseriallot_number');
							if(lotNum==record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_stock_no',n)){
								inventyDetil.selectNewLineItem('recmachcustrecord_djkk_inventory_details');
													
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_internalcode',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_internalcode'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_newseriallot_number',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_newseriallot_number'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_seriallot_number',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_seriallot_number'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_maker_serial_code',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_maker_serial_code'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_control_number',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_control_number'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_storage_shelves',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_storage_shelves'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_expirationdate',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_expirationdate'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_make_ymd',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_make_ymd'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_shipment_date',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_shipment_date'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_warehouse_code',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_warehouse_code'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_smc_code',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_smc_code'));
//								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_storage_type',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_storage_type'));
//								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_packingtype',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_packingtype'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_lot_remark',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_lot_remark'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_lot_memo',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_lot_memo'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_bicking_cardon',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_bicking_cardon'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_packing_cardon',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_packing_cardon'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_quantity_inventory',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_quantity_inventory'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_quantity',oldInv.getCurrentLineItemValue('recmachcustrecord_djkk_inventory_details','custrecord_djkk_ditl_quantity'));
								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_actual_quantity',n));
//								inventyDetil.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_change_reason', resonId);
								inventyDetil.commitLineItem('recmachcustrecord_djkk_inventory_details');
								oldInv.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_quantity_possible', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_actual_quantity',n));
//								oldInv.setCurrentLineItemValue('recmachcustrecord_djkk_inventory_details', 'custrecord_djkk_ditl_change_reason', resonId);
								oldInv.commitLineItem('recmachcustrecord_djkk_inventory_details');
							}
						}
						nlapiSubmitRecord(oldInv, false, true);
						var invId=nlapiSubmitRecord(inventyDetil, false, true);		
						inventorydetailIDLink = nlapiResolveURL('RECORD', 'customrecord_djkk_inventory_details',invId, 'VIEW');
						
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_detail',inventorydetailIDLink);
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_createdfrom',record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_createdfrom',n));
					}
					rec2.commitLineItem('recmachcustrecord_djkk_ica_change');
				}
				var recid = nlapiSubmitRecord(rec2);
				nlapiLogExecution('debug', 'recid', recid);
				recidArr.push(recid);
				nlapiLogExecution('debug', '—a‚èİŒÉ’²®ì¬Ï‚İ', '—a‚èİŒÉ’²®ì¬Ï‚İ');
		}	
		nlapiSubmitField('customrecord_djkk_custbody_shedunloading',recordId, 'custrecord_djkk_body_adjust', recidArr);
		nlapiSubmitField('customrecord_djkk_custbody_shedunloading',recordId, 'custrecord_djkk_body_head_status', 1);

	}
	catch(e){
		nlapiLogExecution('debug', 'ƒGƒ‰[', e.message);
		nlapiSubmitField('customrecord_djkk_custbody_shedunloading',recordId, 'custrecord_djkk_body_head_status', 2);
	}
}
function unique1(arr){
	  var hash=[];
	  for (var i = 0; i < arr.length; i++) {
	     if(hash.indexOf(arr[i])==-1){
	      hash.push(arr[i]);
	     }
	  }
	  return hash;
}