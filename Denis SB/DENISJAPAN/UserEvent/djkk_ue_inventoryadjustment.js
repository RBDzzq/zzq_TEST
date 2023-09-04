/**
 * �݌ɒ�����UserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/03/09     CPC_��
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

	setFieldDisableType('account', 'disabled');
     var role=nlapiGetRole();
     
     // TODO DJ_�o���S��_test|�Ǘ���
     if(role!='1014'&&role!='3'){
    	 
    	 // �\���P��
    	 setLineItemDisableType('inventory', 'unitcost', 'disabled');  	 
     }
     var admitId=nlapiGetFieldValue('custbody_djkk_ic_admit_id');
     if(type=='view'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'&&!isEmpty(admitId)){
    	 var reid=nlapiGetRecordId();
      nlapiDeleteRecord(nlapiGetRecordType(), reid);		
	  nlapiSetRedirectURL('RECORD', 'customrecord_djkk_ic_admit',admitId, 'VIEW');
     }else if(type=='edit'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'&&!isEmpty(admitId)){
    	 var feieldNote = form.addField('custpage_cachedataflag', 'inlinehtml');
    		var messageColour = '<font size=5 color="red"> �����F�̍݌ɒ����͕ҏW��ԂŕύX�����邩�ǂ����K���ۑ��{�^���������肢�v���܂��B</br>�����ۑ����Ȃ�30���㑀��\�ł��B</font>';
    		feieldNote.setLayoutType('outside', 'startrow');
    	    feieldNote.setDefaultValue(messageColour);
     }
     
//     // TODO DJ_�o���S��_test|�Ǘ���
//     if(role!='1014'&&role!='3'){
//    	 
//    	 // ��������
//    	 setLineItemDisableType('inventory', 'adjustqtyby', 'disabled');
//     }
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit approve, reject,
 *            cancel (SO, ER, Time Bill, PO & RMA only) pack, ship (IF)
 *            markcomplete (Call, Task) reassign (Case) editforecast (Opp,
 *            Estimate)
 * @returns {Void}
 *
 */
function userEventBeforeSubmit(type) {
	  if((type=='create'||type=='copy')&&nlapiGetFieldValue('customform')=='195'&&isEmpty(nlapiGetFieldValue('custbody_djkk_ic_admit_id'))){
		   try{
			var record=nlapiCreateRecord('customrecord_djkk_ic_admit');		
			
			// ��v���
			record.setFieldValue('customform', '181');
			record.setFieldValue('custrecord_djkk_admit_tranid', nlapiGetFieldValue('tranid'));
			record.setFieldValue('custrecord_djkk_admit_customer', nlapiGetFieldValue('customer'));
			record.setFieldValue('custrecord_djkk_admit_account', nlapiGetFieldValue('account'));
			record.setFieldValue('custrecord_djkk_admit_estimatedtotalvalu', nlapiGetFieldValue('estimatedtotalvalue'));
			record.setFieldValue('custrecord_djkk_admit_trandate', nlapiGetFieldValue('trandate'));
			record.setFieldValue('custrecord_djkk_admit_postingperiod', nlapiGetFieldValue('postingperiod'));
			record.setFieldValue('custrecord_djkk_admit_memo', nlapiGetFieldValue('memo'));
			record.setFieldValue('custrecord_djkk_admit_completion_date', nlapiGetFieldValue('custbody_djkk_completion_date'));//DJ_��������
//			record.setFieldValue('custrecord_djkk_admit_transaction_id', nlapiGetFieldValue('transactionnumber'));//DJ_�g�����U�N�V�����ԍ�
			
			// ����
			record.setFieldValue('custrecord_djkk_admit_subsidiary', nlapiGetFieldValue('subsidiary'));
			record.setFieldValue('custrecord_djkk_admit_department', nlapiGetFieldValue('department'));
			record.setFieldValue('custrecord_djkk_admit_class', nlapiGetFieldValue('class'));
			record.setFieldValue('custrecord_djkk_admit_adjlocation', nlapiGetFieldValue('adjlocation'));
			record.setFieldValue('custrecord_djkk_admit_re', nlapiGetFieldValue('custbody_djkk_change_reason'));
			record.setFieldValue('custrecord_djkk_admit_reason', nlapiGetFieldValue('custbody_djkk_waste_reason'));
			
			// ���F���
			var roleValue = nlapiGetRole();
			var userValue = nlapiGetUser();
			
			var subsidiary = nlapiGetFieldValue('subsidiary');
			var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//�g�����U�N�V�������F�Ǘ��\
					[
					   ["isinactive","is","F"], 
					   "AND", 
					   ["custrecord_djkk_trans_appr_obj","anyof",16],
					   "AND",
					   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //�쐬���[��
					   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //��ꏳ�F���[��
					   
					]
					);
			if(!isEmpty(approvalSearch)){
				for(var j = 0; j < approvalSearch.length; j++){
					var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//�쐬���[��
					var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//��ꏳ�F���[��
					if(createRole == roleValue){
						record.setFieldValue('custrecord_djkk_admit_create_role',createRole);//DJ_�쐬���[��
						record.setFieldValue('custrecord_djkk_admit_next_autho_role',appr1_role); //DJ_���̏��F���[��
					}
				}
			}
			record.setFieldValue('custrecord_djkk_admit_flg', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg'));
			record.setFieldValue('custrecord_djkk_admit_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status'));
//			record.setFieldValue('custrecord_djkk_admit_create_role', nlapiGetFieldValue('custbody_djkk_trans_appr_create_role'));
			record.setFieldValue('custrecord_djkk_admit_create_user', userValue);
			record.setFieldValue('custrecord_djkk_admit_appr_oper_roll', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));
			record.setFieldValue('custrecord_djkk_admit_acknowledge_operat', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user'));
			record.setFieldValue('custrecord_djkk_admit_appr_opera_conditi', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));
			
//			record.setFieldValue('custrecord_djkk_admit_next_autho_role', nlapiGetFieldValue('custbody_djkk_trans_appr_next_role'));
			record.setFieldValue('custrecord_djkk_admit_next_approver', nlapiGetFieldValue('custbody_djkk_trans_appr_user'));
			record.setFieldValue('custrecord_djkk_admit_next_appro_criteri', nlapiGetFieldValue('custbody_djkk_trans_appr_cdtn_amt'));
			record.setFieldValue('custrecord_djkk_admit_first_appro_role', nlapiGetFieldValue('custbody_djkk_trans_appr1_role'));
			record.setFieldValue('custrecord_djkk_admit_first_approver', nlapiGetFieldValue('custbody_djkk_trans_appr1_user'));
			record.setFieldValue('custrecord_djkk_admit_second_appr_role', nlapiGetFieldValue('custbody_djkk_trans_appr2_role'));
			record.setFieldValue('custrecord_djkk_admit_second_approver', nlapiGetFieldValue('custbody_djkk_trans_appr2_user'));
			
			record.setFieldValue('custrecord_djkk_admit_third_approva_role', nlapiGetFieldValue('custbody_djkk_trans_appr3_role'));
			record.setFieldValue('custrecord_djkk_admit_third_approver', nlapiGetFieldValue('custbody_djkk_trans_appr3_user'));
			record.setFieldValue('custrecord_djkk_admit_fourth_appro_role', nlapiGetFieldValue('custbody_djkk_trans_appr4_role'));
			record.setFieldValue('custrecord_djkk_admit_fourth_approver', nlapiGetFieldValue('custbody_djkk_trans_appr4_user'));
			record.setFieldValue('custrecord_djkk_admit_appro_rever_memo', nlapiGetFieldValue('custbody_djkk_approval_reset_memo'));
			record.setFieldValue('custrecord_djkk_admit_kyaltuka_memo', nlapiGetFieldValue('custbody_djkk_approval_kyaltuka_memo')); //DJ_���F�p������ // 20230529 add by zhou
			
			
		    var counts=nlapiGetLineItemCount('inventory');
		    for(var i=1;i<counts+1;i++){
		    	nlapiSelectLineItem('inventory', i);
				
		    	var inventoryDetail=nlapiViewCurrentLineItemSubrecord('inventory','inventorydetail');
				if(!isEmpty(inventoryDetail)){
					var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
					
					for(var m = 1 ; m < invCount+1 ; m++){
						inventoryDetail.selectLineItem('inventoryassignment', m);
						record.selectNewLineItem('recmachcustrecord_djkk_ic_admit');
						
						record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_subsidiary',nlapiGetFieldValue('subsidiary'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', i);	    	
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item', nlapiGetCurrentLineItemValue('inventory', 'item'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', nlapiGetCurrentLineItemValue('inventory', 'description'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse', nlapiGetCurrentLineItemValue('inventory', 'location'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit', nlapiGetCurrentLineItemValue('inventory', 'units'));		    	
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', nlapiGetCurrentLineItemValue('inventory', 'quantityonhand'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_current_value', nlapiGetCurrentLineItemValue('inventory', 'currentvalue'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty', nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty', nlapiGetCurrentLineItemValue('inventory', 'newquantity'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_predi_unit_price', nlapiGetCurrentLineItemValue('inventory', 'unitcost'));			    				    	
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_section', nlapiGetCurrentLineItemValue('inventory', 'department'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', nlapiGetCurrentLineItemValue('inventory', 'class'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_reason_for_change', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_memo_i', nlapiGetCurrentLineItemValue('inventory', 'memo'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_admit_detail_keeped'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_remars', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_remars'));//DJ_���l
						if(!isEmpty(inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'))){
							record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail',inventoryDetail.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber'));
							record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'));
						}else{
							record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber'));	
						}	    	
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));    			    	
				    	record.commitLineItem('recmachcustrecord_djkk_ic_admit');	
					}
				}else{					
					record.selectNewLineItem('recmachcustrecord_djkk_ic_admit');
					record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_subsidiary',getRoleSubsidiary());
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', i);	    	
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item', nlapiGetCurrentLineItemValue('inventory', 'item'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', nlapiGetCurrentLineItemValue('inventory', 'description'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse', nlapiGetCurrentLineItemValue('inventory', 'location'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit', nlapiGetCurrentLineItemValue('inventory', 'units'));		    	
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', nlapiGetCurrentLineItemValue('inventory', 'quantityonhand'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_current_value', nlapiGetCurrentLineItemValue('inventory', 'currentvalue'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty', nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty', nlapiGetCurrentLineItemValue('inventory', 'newquantity'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_predi_unit_price', nlapiGetCurrentLineItemValue('inventory', 'unitcost'));			    				    	
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_section', nlapiGetCurrentLineItemValue('inventory', 'department'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', nlapiGetCurrentLineItemValue('inventory', 'class'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_reason_for_change', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_memo_i', nlapiGetCurrentLineItemValue('inventory', 'memo'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_admit_detail_keeped'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_remars', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_remars'));//DJ_���l
			    	record.commitLineItem('recmachcustrecord_djkk_ic_admit');
				}
				
		    }
		    
			var custRecordId=nlapiSubmitRecord(record, true, true);
			
            var newCustRecord=nlapiLoadRecord('customrecord_djkk_ic_admit', custRecordId);
			var newCount=newCustRecord.getLineItemCount('recmachcustrecord_djkk_ic_admit');
			var keepFalg='F';
			if(!isEmpty(newCustRecord.getFieldValue('custrecord_djkk_admit_re'))){
				keepFalg=nlapiLookupField('customrecord_djkk_invadjst_change_reason', newCustRecord.getFieldValue('custrecord_djkk_admit_re'), 'custrecord_djkk_wh_contact_flg');
			}
			for(var i=1;i<newCount+1;i++){
				var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_inv_keep','customdeploy_djkk_sl_inv_keep');
			      theLink +='&keepid=' + newCustRecord.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'id', i);	      			
					  if(keepFalg=='T'){
				      if(newCustRecord.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped', i)!='T'){
				    	 theLink +='&keeptype=keep';
				    	 newCustRecord.setLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeplink', i,theLink);
				   }
				 }
					
				newCustRecord.commitLineItem('recmachcustrecord_djkk_ic_admit');
			}
			nlapiSubmitRecord(newCustRecord, false, true);
			
		    nlapiSetFieldValue('custbody_djkk_ic_admit_id', custRecordId, false, true);
		    nlapiSetFieldValue('custbody_cache_data_flag', 'T', false, true);
	   }catch(e){
			throw nlapiCreateError('�V�X�e���G���[', e.message);
			nlapiSetFieldValue('custbody_cache_data_flag', 'T', false, true);
	   }			
	 }
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit, approve,
 *            cancel, reject (SO, ER, Time Bill, PO & RMA only) pack, ship (IF
 *            only) dropship, specialorder, orderitems (PO only) paybills
 *            (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type) {
	if(type=='delete'){
		return;
	}
}
