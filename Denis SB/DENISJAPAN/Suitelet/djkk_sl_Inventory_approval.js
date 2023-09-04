/**
 * DJ_�݌ɒ������F��ʂ�SL
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Aug 2022     CPC_�v
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	try{
		var recId = request.getParameter('icId');
//		var user = nlapiGetUser();
//		var userSubsidiry = nlapiGetSubsidiary();
//		
//		var subsidiary = nlapiLookupField('customrecord_djkk_ic_admit',recId,'custrecord_djkk_admit_subsidiary');//�q���
//		nlapiLogExecution('debug','user',user)
//		nlapiLogExecution('debug','subsidiary',subsidiary)
//		nlapiLogExecution('debug','userSubsidiryBefore',userSubsidiry)
//		
//		var employeeRecord = nlapiLoadRecord('employee',user);
//		employeeRecord.setFieldValue('subsidiary',subsidiary);
//		nlapiSubmitRecord(employeeRecord);
//		
//		nlapiSubmitField('employee',user, 'subsidiary', subsidiary);
//		sleep('500');
//		var userSubsidiryAfter1 = nlapiGetSubsidiary();
//		var userSubsidiryAfter2 = nlapiLookupField('employee',user,'subsidiary');
//		nlapiLogExecution('debug','userSubsidiryAfter1',userSubsidiryAfter1)
//		nlapiLogExecution('debug','userSubsidiryAfter2',userSubsidiryAfter2)
		
//		var recId = request.getParameter('icId');
		
		var Status = request.getParameter('Status');
		
		var deleteRecordId = request.getParameter('deleteRecordId');
		if(!isEmpty(deleteRecordId)){
			nlapiLogExecution('debug', 'deleteRecordId',deleteRecordId);
			var scheduleparams = new Array();
			scheduleparams['custscript_djkk_deleterecordtype'] = 'inventoryadjustment';
			scheduleparams['custscript_djkk_deleterecordid'] = deleteRecordId;
			runBatch('customscript_djkk_ss_trandata_delete', 'customdeploy_djkk_ss_trandata_deleterec', scheduleparams);
		}else{							
		var record = nlapiLoadRecord('customrecord_djkk_ic_admit',recId);
		//20230616 add by zhou start
		if(Status=='edit'){
			var inventoryadjustmentId = record.getFieldValue('custrecord_djkk_admit_trans_adjust');//DJ_�݌ɒ����W�����id
			if(!isEmpty(inventoryadjustmentId)){
				nlapiLogExecution('debug','inventoryadjustment',inventoryadjustmentId)
				throw nlapiCreateError('�V�X�e���G���[','���ݎ��s���̃I�y���[�^�����܂��B�u�G���[�̃��[���o�b�N�v�{�^�����N���b�N���Ĉُ����菜���Ă��玎���Ă�������',true);
			}
		}
		//20230616 add by zhou end
		var tranid=record.getFieldValue('custrecord_djkk_admit_tranid');//�Q�Ɣԍ�
		var subsidiary = record.getFieldValue('custrecord_djkk_admit_subsidiary');//�q���
		
		var account = record.getFieldValue('custrecord_djkk_admit_account');//��������Ȗ�
		var estimatedtotalvalu = record.getFieldValue('custrecord_djkk_admit_estimatedtotalvalu');//DJ_���葍���l
		var trandate = record.getFieldValue('custrecord_djkk_admit_trandate');//DJ_���t
		var postingperiod = record.getFieldValue('custrecord_djkk_admit_postingperiod');//DJ_�L������
		var admitRe = record.getFieldValue('custrecord_djkk_admit_re');//�ύX���R
		var customer = record.getFieldValue('custrecord_djkk_admit_customer');//DJ_�ڋq
		var headMemo = record.getFieldValue('custrecord_djkk_admit_memo');//DJ_����
		var headClass = record.getFieldValue('custrecord_djkk_admit_class');//DJ_�u�����h
		var headDepartment = record.getFieldValue('custrecord_djkk_admit_department');//DJ_�Z�N�V����
		var headReason = record.getFieldValue('custrecord_djkk_admit_reason');//DJ_�p�����R
		var headAdjlocation = record.getFieldValue('custrecord_djkk_admit_adjlocation');//DJ_�����ꏊ
		var completionDate = record.getFieldValue('custrecord_djkk_admit_completion_date');//DJ_��������
		var count=record.getLineItemCount('recmachcustrecord_djkk_ic_admit');  //����				
		
		var rec2 = nlapiCreateRecord('inventoryadjustment');
		if(Status=='edit'){
			rec2.setFieldValue('custbody_cache_data_flag','T');//DJ_�L���b�V���f�[�^�t���O			
		}
		rec2.setFieldValue('tranid',tranid);//�Q�Ɣԍ�
		rec2.setFieldValue('subsidiary',subsidiary);//�q���
		rec2.setFieldValue('trandate',  trandate); //���t
		rec2.setFieldValue('custbody_djkk_change_reason', admitRe);//�ύX���R	
		rec2.setFieldValue('account',account);//��������Ȗ�
		rec2.setFieldValue('estimatedtotalvalue',estimatedtotalvalu);//���葍���l
		rec2.setFieldValue('postingperiod',postingperiod);//�L������
		rec2.setFieldValue('customer', customer);//�ڋq
		rec2.setFieldValue('memo', headMemo);//����
		rec2.setFieldValue('class', headClass);//�u�����h
		rec2.setFieldValue('department', headDepartment);//�Z�N�V����
		rec2.setFieldValue('custbody_djkk_waste_reason', headReason);//�p�����R
		rec2.setFieldValue('adjlocation', headAdjlocation);//�����ꏊ
		rec2.setFieldValue('custbody_djkk_completion_date', completionDate);//DJ_��������
		rec2.setFieldValue('custbody_djkk_ic_admit_id', recId);//DJ_�݌ɒ���
		if(Status=='approval'){
			rec2.setFieldValue('custbody_djkk_trans_appr_status', '2');//DJ_���F�X�e�[�^�X		
		}
      
      rec2.setFieldValue('custbody_djkk_trans_appr_deal_flg', record.getFieldValue('custrecord_djkk_admit_flg'));
		rec2.setFieldValue('custbody_djkk_trans_appr_status', record.getFieldValue('custrecord_djkk_admit_status'));
		rec2.setFieldValue('custbody_djkk_trans_appr_create_role', record.getFieldValue('custrecord_djkk_admit_create_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr_create_user', record.getFieldValue('custrecord_djkk_admit_create_user'));
		rec2.setFieldValue('custbody_djkk_trans_appr_dev', record.getFieldValue('custrecord_djkk_admit_appr_oper_roll'));
		rec2.setFieldValue('custbody_djkk_trans_appr_dev_user', record.getFieldValue('custrecord_djkk_admit_acknowledge_operat'));
		rec2.setFieldValue('custbody_djkk_trans_appr_do_cdtn_amt', record.getFieldValue('custrecord_djkk_admit_appr_opera_conditi'));
		
		rec2.setFieldValue('custbody_djkk_trans_appr_next_role', record.getFieldValue('custrecord_djkk_admit_next_autho_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr_user', record.getFieldValue('custrecord_djkk_admit_next_approver'));
		rec2.setFieldValue('custbody_djkk_trans_appr_cdtn_amt', record.getFieldValue('custrecord_djkk_admit_next_appro_criteri'));
		rec2.setFieldValue('custbody_djkk_trans_appr1_role', record.getFieldValue('custrecord_djkk_admit_first_appro_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr1_user', record.getFieldValue('custrecord_djkk_admit_first_approver'));
		rec2.setFieldValue('custbody_djkk_trans_appr2_role', record.getFieldValue('custrecord_djkk_admit_second_appr_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr2_user', record.getFieldValue('custrecord_djkk_admit_second_approver'));
		
		rec2.setFieldValue('custbody_djkk_trans_appr3_role', record.getFieldValue('custrecord_djkk_admit_third_approva_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr3_user', record.getFieldValue('custrecord_djkk_admit_third_approver'));
		rec2.setFieldValue('custbody_djkk_trans_appr4_role', record.getFieldValue('custrecord_djkk_admit_fourth_appro_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr4_user', record.getFieldValue('custrecord_djkk_admit_fourth_approver'));
		rec2.setFieldValue('custbody_djkk_approval_reset_memo', record.getFieldValue('custrecord_djkk_admit_appro_rever_memo'));
		rec2.setFieldValue('custbody_djkk_approval_kyaltuka_memo', record.getFieldValue('custrecord_djkk_admit_kyaltuka_memo')); //DJ_���F�p������ // 20230529 add by zhou
		
		if(subsidiary==SUB_NBKK || subsidiary==SUB_ULKK){
			rec2.setFieldValue('customform', '156'); //customform
		}else if(subsidiary==SUB_DPKK || subsidiary==SUB_SCETI){
			rec2.setFieldValue('customform', '180'); //customform
		}
		
		
		var itemCountArray=new Array();
		for(var s=1;s<count+1;s++){
			itemCountArray.push(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', s));//line num
		}
		itemCountArray=unique(itemCountArray);
		for(var i=0;i<itemCountArray.length;i++){
			var inc=1;
			rec2.selectNewLineItem('inventory');
			for(var n=1;n<count+1;n++){
				
				if(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', n)==itemCountArray[i]){
					if(inc==1){

						
						rec2.setCurrentLineItemValue('inventory', 'item', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item',n));//item
						rec2.setCurrentLineItemValue('inventory', 'description', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain',n));//����
						rec2.setCurrentLineItemValue('inventory', 'location', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse',n));//�ꏊ
						rec2.setCurrentLineItemValue('inventory', 'units', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit',n));//�P��
						rec2.setCurrentLineItemValue('inventory', 'quantityonhand', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty',n));//�݌ɐ���
						rec2.setCurrentLineItemValue('inventory', 'adjustqtyby', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty',n));//��������
						rec2.setCurrentLineItemValue('inventory', 'newquantity', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty',n));//�V��������
						rec2.setCurrentLineItemValue('inventory', 'unitcost', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_predi_unit_price',n));//�\���P��
						rec2.setCurrentLineItemValue('inventory', 'department', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_section',n));//�Z�N�V����
						rec2.setCurrentLineItemValue('inventory', 'class', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand',n));//�u�����h
						rec2.setCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_reason_for_change',n));//�ύX���R
						rec2.setCurrentLineItemValue('inventory', 'memo', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_memo_i',n));//���� 
						rec2.setCurrentLineItemValue('inventory', 'custcol_djkk_admit_detail_keeped', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped',n));//DJ_�c�ƃ}���L�[�v�ς�
						rec2.setCurrentLineItemValue('inventory', 'custcol_djkk_remars', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_remars',n));//DJ_���l
					
					if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n))
							||!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', n))){
						var inventoryDetail=rec2.createCurrentLineItemSubrecord('inventory','inventorydetail');
						inventoryDetail.selectNewLineItem('inventoryassignment');
												
						if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n))){
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n));
				    	}else{
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', n));
				    	}
						inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity', n));
				    						    	
						inventoryDetail.commitLineItem('inventoryassignment');
						inventoryDetail.commit();
					}
					}else{
						if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n))
								||!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', n))){
						var inventoryDetail=rec2.editCurrentLineItemSubrecord('inventory','inventorydetail');
						inventoryDetail.selectNewLineItem('inventoryassignment');

				    	if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n))){
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n));
				    	}else{
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', n));
				    	}
				    					    	
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity', n));
				    						    	
						inventoryDetail.commitLineItem('inventoryassignment');
						inventoryDetail.commit();
						}
					}
					inc++;
				}	
				
			}
			rec2.commitLineItem('inventory');
		}
		nlapiLogExecution('debug', '1');
		var rec2id = nlapiSubmitRecord(rec2,false,true);
		if(Status=='approval'){
			nlapiSubmitField('customrecord_djkk_ic_admit',recId, ['custrecord_djkk_admit_trans_adjust','custrecord_djkk_admit_create_status'], [rec2id,'1']); //DJ_�݌ɒ��� /DJ_�݌ɒ����쐬�X�e�[�^�X	
			nlapiSetRedirectURL('RECORD', 'inventoryadjustment',rec2id, 'VIEW');//20230531 add by zht
		}
		
		else if(Status=='edit'){
			nlapiSubmitField('customrecord_djkk_ic_admit',recId, 'custrecord_djkk_admit_trans_adjust',rec2id); //DJ_�݌ɒ��� /DJ_�݌ɒ����쐬�X�e�[�^�X	
			var delRecord=nlapiCreateRecord('customrecord_djkk_transact_data_delete');
			delRecord.setFieldValue('custrecord_djkk_del_trantype', '�݌ɒ���');
			delRecord.setFieldValue('custrecord_djkk_del_recordtype', 'inventoryadjustment');
			delRecord.setFieldValue('custrecord_djkk_del_internalid', rec2id);
			delRecord.setFieldValue('custrecord_djkk_del_url', nlapiResolveURL('RECORD', 'inventoryadjustment',rec2id, 'VIEW'));
			nlapiSubmitRecord(delRecord);
		}
		response.write(rec2id);
//		nlapiSubmitField('employee',user, 'subsidiary', userSubsidiry);
	}
	}
	catch(e){
		nlapiLogExecution('debug', '�G���[', e.message);
		nlapiLogExecution('debug', 'e', e);
		var record = nlapiLoadRecord('customrecord_djkk_ic_admit',recId);
		record.setFieldValue('custrecord_djkk_admit_customer_error',e.message);
		nlapiSubmitRecord(record);
		response.write('�ُ픭��:'+ e.message);
//		nlapiSubmitField('employee',user, 'subsidiary', userSubsidiry);
	}
}