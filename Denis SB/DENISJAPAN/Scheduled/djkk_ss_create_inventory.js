/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Dec 2022     �v
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
//�a����n�I���쐬�a��݌ɒ���
function scheduled(type) {
	nlapiLogExecution('debug', 'test', 'test');
	try{
		var recordId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_custbodyid');
		var record = nlapiLoadRecord('customrecord_djkk_custbody_shedunloading',recordId); //DJ_�a����݌Ɏ��n�I�����F���
		var subsidiary = record.getFieldValue('custrecord_djkk_body_sub');//�A��
		var headLocation = record.getFieldValue('custrecord_djkk_body_location');//�ꏊ
		var trandate = record.getFieldValue('custrecord_djkk_body_date');//���t
		var count = record.getLineItemCount('recmachcustrecord_djkk_custody_stock_list');//����
		var countArr = new Array(); //�ڋq
		var itemCountArray=new Array(); //�s
		for (var s = 1; s < count+1; s++) {
			countArr.push(record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_purchase', s));//DJ_�a����݌Ɍڋq 
		}
		var newCountArr = unique1(countArr);
		var recidArr = new Array();
		for(var j = 0; j < newCountArr.length; j++){
			var rec2 = nlapiCreateRecord('customrecord_djkk_ic_change'); //DJ_�a����݌ɒ���
			rec2.setFieldValue('custrecord_djkk_ica_subsidiary',subsidiary);//�q���
			rec2.setFieldValue('custrecord_djkk_ica_date',  trandate); //���t
			var customer = newCountArr[j];
			rec2.setFieldValue('custrecord_djkk_ica_customer',  customer); //�ڋq			
				for(var n=1;n<count+1;n++){
					rec2.selectNewLineItem('recmachcustrecord_djkk_ica_change') //DJ_�a����݌ɒ�������
					if(record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_purchase', n)==customer){
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_inventory_adjustment', 'T') //DJ_�݌ɒ���Flg
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_item', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_shed_item',n));//DJ_�A�C�e��
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_line_subsidiary',subsidiary );//DJ_�q���
						var library = record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_library',n); //�݌ɐ���
						var quantity = record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_actual_quantity',n); //���n����
						var adjustment = (quantity) - (library); //��������
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_inventoryqty', library); //DJ_�݌ɐ���
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_adjqty', adjustment); //DJ_��������
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_newqty', quantity); //DJ_�V��������
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_warehouse', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_origina_location',n)); ////DJ_���̏ꏊ
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_cuslocation', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_warehouse',n)); //DJ_�a����݌ɏꏊ
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_unit', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_company',n)); //DJ_�P��
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_conversionrate', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_eye',n)); //DJ_�����
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_ic_id',record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_location_id',n)); //DJ_�a����݌�ID
						rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_id', record.getLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_storage_id',n)); //DJ_�a����݌ɖ���ID
						
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
				nlapiLogExecution('debug', '�a��݌ɒ����쐬�ς�', '�a��݌ɒ����쐬�ς�');
		}	
		nlapiSubmitField('customrecord_djkk_custbody_shedunloading',recordId, 'custrecord_djkk_body_adjust', recidArr);
		nlapiSubmitField('customrecord_djkk_custbody_shedunloading',recordId, 'custrecord_djkk_body_head_status', 1);

	}
	catch(e){
		nlapiLogExecution('debug', '�G���[', e.message);
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