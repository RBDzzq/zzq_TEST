/**
 * �O����/���|������ ue
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Jun 2023     10046
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
    var acknowledgmentid=nlapiGetFieldValue('custbody_djkk_bribery_acknowledgmentid');
    if(type=='view'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'&&!isEmpty(acknowledgmentid)){
   	 var reid=nlapiGetRecordId();
     nlapiDeleteRecord(nlapiGetRecordType(), reid);		
	  nlapiSetRedirectURL('RECORD', 'customrecord_djkk_bribery_acknowledgment',acknowledgmentid, 'VIEW');
    }else if(type=='edit'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'&&!isEmpty(acknowledgmentid)){
    	var feieldNote = form.addField('custpage_cachedataflag', 'inlinehtml');
		var messageColour = '<font size=5 color="red"> �����F�̑O����/���|�������͕ҏW��ԂŕύX�����邩�ǂ����K���ۑ��{�^���������肢�v���܂��B</br>�����ۑ����Ȃ�30���㑀��\�ł��B</font>';
		feieldNote.setLayoutType('outside', 'startrow');
	    feieldNote.setDefaultValue(messageColour);
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
	 if((type=='create'||type=='copy')&&nlapiGetFieldValue('customform')=='142' &&isEmpty(nlapiGetFieldValue('custbody_djkk_bribery_acknowledgmentid'))){
			
			try{
				
			var record=nlapiCreateRecord('customrecord_djkk_bribery_acknowledgment');
			//��v���
			record.setFieldValue('customform', '179');
			record.setFieldValue('custrecord_djkk_transactionnumber', nlapiGetFieldValue('transactionnumber'));//�g�����U�N�V�����ԍ�
			record.setFieldValue('custrecord_djkk_bribery_tranid', nlapiGetFieldValue('tranid'));//�Q�Ɣԍ�
			record.setFieldValue('custrecord_djkk_bribery_vendor', nlapiGetFieldValue('entity'));//DJ_�d���� 
			record.setFieldValue('custrecord_djkk_bribery_account', nlapiGetFieldValue('account'));//����Ȗ� 
			record.setFieldValue('custrecord_djkk_bribery_amount', nlapiGetFieldValue('usertotal'));//���z
			record.setFieldValue('custrecord_djkk_bribery_createdfrom', nlapiGetFieldValue('createdfrom'));//DJ_�쐬��(���F�p)
			record.setFieldValue('custrecord_djkk_bribery_currency', nlapiGetFieldValue('currency'));//DJ_�ʉ� 
			record.setFieldValue('custrecord_djkk_bribery_exchangerate', nlapiGetFieldValue('exchangerate'));//DJ_�בփ��[�g *
			record.setFieldValue('custrecord_djkk_bribery_taxtotal', nlapiGetFieldValue('taxtotal'));//DJ_�ŋ�
			record.setFieldValue('custrecord_djkk_bribery_duedate', nlapiGetFieldValue('duedate'));//DJ_����
			record.setFieldValue('custrecord_djkk_bribery_now_date', nlapiGetFieldValue('trandate'));//���t 
			record.setFieldValue('custrecord_djkk_bribery_postingperiod', nlapiGetFieldValue('postingperiod'));//�L������ 
			record.setFieldValue('custrecord_djkk_bribery_memo', nlapiGetFieldValue('memo'));//����
			record.setFieldValue('custrecord_djkk_bribery_closing_date', nlapiGetFieldValue('custbody_suitel10n_inv_closing_date'));//����
			record.setFieldValue('custrecord_djkk_bribery_deliverydate', nlapiGetFieldValue('custbody_jp_deliverydate'));//�[��
			
			//����
			record.setFieldValue('custrecord_djkk_bribery_subsidiary', nlapiGetFieldValue('subsidiary'));//�q���
			record.setFieldValue('custrecord_djkk_department', nlapiGetFieldValue('department'));//�Z�N�V����
			record.setFieldValue('custrecord_djkk_class', nlapiGetFieldValue('class'));//�u�����h
			record.setFieldValue('custrecord_djkk_location', nlapiGetFieldValue('location'));//�ꏊ
			
			//���̑�
			record.setFieldValue('custrecord_djkk_bribery_operation_inston', nlapiGetFieldValue('custbody_djkk_operation_instructions'));//DJ_���i�E��Ǝw��
			record.setFieldValue('custrecord_djkk_inspection_finished', nlapiGetFieldValue('custbody_djkk_inspection_finished'));//DJ_���i�I����]��	
			// CH144 zheng 20230516 start
			//record.setFieldValue('custrecord_djkk_reserved_exchangerate_p1', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p1'));//DJ_��1�\�񃌁[�g
			// CH144 zheng 20230516 end
			record.setFieldValue('custrecord_djkk_jp_bank_acct_info', nlapiGetFieldValue('custbody_jp_bank_acct_info'));//DJ_��s�������
			record.setFieldValue('custrecord_djkk_custbody_jp_estimateinfo', nlapiGetFieldValue('custbody_jp_estimateinfo'));//DJ_���Ϗ��
			record.setFieldValue('custrecord_djkk_bribery_jp_message', nlapiGetFieldValue('custbody_jp_message'));//DJ_�ʐM��
			record.setFieldValue('custrecord_djkk_expected_shipping_date', nlapiGetFieldValue('custbody_djkk_expected_shipping_date'));//DJ_�o�ח\���
			record.setFieldValue('custrecord_djkk_bribery_vendor_comments', nlapiGetFieldValue('custbody_djkk_vendor_comments'));//DJ_�d����R�����g
			// CH144 zheng 20230516 start
			//record.setFieldValue('custrecord_dj_reserved_exchange_rate_yen', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_yen'));//DJ_�~�ݎx��
			//record.setFieldValue('custrecord_djkk_reserved_exchange_rate_f', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_f'));//DJ_�O�ݎx���f�[�^�쐬
			//record.setFieldValue('custrecord_djkk_reserved_exchangerate_p2', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p2'));//DJ_��2�\�񃌁[�g
			//record.setFieldValue('custrecord_djkk_reserved_exchangerate_p3', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p3'));//DJ_��3�\�񃌁[�g
			// CH144 zheng 20230516 end
			record.setFieldValue('custrecord_djkk_bribery_project', nlapiGetFieldValue('custbody_djkk_project'));//DJ_�v���W�F�N�g
			record.setFieldValue('custrecord_djkk_delivery_precautions', nlapiGetFieldValue('custbody_djkk_delivery_precautions'));//DJ_�[�i�撍�ӎ���
			record.setFieldValue('custrecord_djkk_production_po_number', nlapiGetFieldValue('custbody_djkk_production_po_number'));//DJ_PRODUCTION PURCHASE ORDER�ԍ�
			record.setFieldValue('custrecord_djkk_bribery_language', nlapiGetFieldValue('custbody_djkk_language'));//DJ_����
			record.setFieldValue('custrecord_djkk_br_incoterms_location', nlapiGetFieldValue('custbody_djkk_incoterms_location'));//DJ_�o�׌�
			record.setFieldValue('custrecord_djkk_bribery_po_fc_created', nlapiGetFieldValue('custbody_djkk_po_fc_created'));//DJ_PO�v���|�[�U��
			record.setFieldValue('custrecord_djkk_djkk_sotck_send_flag', nlapiGetFieldValue('custbody_djkk_sotck_send_flag'));//DJ_���͗\��t���O
			record.setFieldValue('custrecord_djkk_br_customer_precautions', nlapiGetFieldValue('custbody_djkk_customer_precautions'));//DJ_�ڋq���ӎ���
			
			//����TAB
			record.setFieldValue('custrecord_djkk_bribery_billaddress', nlapiGetFieldValue('billaddress'));//DJ_�d����Z��
			record.setFieldValue('custrecord_djkk_br_billaddresslist_id', nlapiGetFieldValue('billaddresslist'));//DJ_�d����Z���̑I��(ID)
			record.setFieldValue('custrecord_djkk_bribery_billaddresslist', nlapiGetFieldText('billaddresslist'));//DJ_�d����Z���̑I��
			
			//���F���
			var roleValue = nlapiGetRole();
			var userValue = nlapiGetUser();
			var subsidiary = nlapiGetFieldValue('subsidiary');
			var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//�g�����U�N�V�������F�Ǘ��\
					[
					   ["isinactive","is","F"], 
					   "AND", 
					   ["custrecord_djkk_trans_appr_obj","anyof",12],
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
						record.setFieldValue('custrecord_djkk_start_role',createRole);//DJ_�쐬���[��
						record.setFieldValue('custrecord_djkk_next_appr_role',appr1_role); //DJ_���̏��F���[��
					}
				}
			}
			
			record.setFieldValue('custrecord_djkk_brybery_checkbox', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg'));
			record.setFieldValue('custrecord_djkk_page_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status'));
			record.setFieldValue('custrecord_djkk_start_role_name', userValue);
//			record.setFieldValue('custrecord_djkk_start_role', nlapiGetFieldValue('custbody_djkk_trans_appr_create_role'));
			//record.setFieldValue('custrecord_djkk_start_role_name', nlapiGetFieldValue('custbody_djkk_trans_appr_create_user'));
			record.setFieldValue('custrecord_djkk_brybery_tr', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));
			record.setFieldValue('custrecord_djkk_brybery_appr_dev_u', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user'));
			record.setFieldValue('custrecord_djkk_brybery_appr_term', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));
				
//			record.setFieldValue('custrecord_djkk_next_appr_role', nlapiGetFieldValue('custbody_djkk_trans_appr_next_role'));
			record.setFieldValue('custrecord_djkk_next_appr_name', nlapiGetFieldValue('custbody_djkk_trans_appr_user'));
			record.setFieldValue('custrecord_djkk_next_appr_term', nlapiGetFieldValue('custbody_djkk_trans_appr_cdtn_amt'));
			record.setFieldValue('custrecord_djkk_first_role', nlapiGetFieldValue('custbody_djkk_trans_appr1_role'));
			record.setFieldValue('custrecord_djkk_brybery_first_name', nlapiGetFieldValue('custbody_djkk_trans_appr1_user'));
			record.setFieldValue('custrecord_djkk_end_role', nlapiGetFieldValue('custbody_djkk_trans_appr2_role'));
			record.setFieldValue('custrecord_djkk_brybery_second_name', nlapiGetFieldValue('custbody_djkk_trans_appr2_user'));
			
			record.setFieldValue('custrecord_djkk_third_brybery_role', nlapiGetFieldValue('custbody_djkk_trans_appr3_role'));
			record.setFieldValue('custrecord_djkk_third_brybery_name', nlapiGetFieldValue('custbody_djkk_trans_appr3_user'));
			record.setFieldValue('custrecord_djkk_last_brybery_role', nlapiGetFieldValue('custbody_djkk_trans_appr4_role'));
			record.setFieldValue('custrecord_djkk_last_brybery_name', nlapiGetFieldValue('custbody_djkk_trans_appr4_user'));
			record.setFieldValue('custrecord_djkk_over_brybery_memo', nlapiGetFieldValue('custbody_djkk_approval_reset_memo'));

			record.setFieldValue('custrecord_djkk_brybery_kyaltuka_memo', nlapiGetFieldValue('custbody_djkk_approval_kyaltuka_memo'));
//			record.setFieldValue('custrecord_djkk_bribery_memo', nlapiGetFieldValue('memo'));//
			nlapiLogExecution('debug','item start','')	
			//�A�C�e������
			var itemCounts=nlapiGetLineItemCount('item');
		    for(var i=1;i<itemCounts+1;i++){
		    	nlapiSelectLineItem('item', i);
				
		    	var inventoryDetail=nlapiViewCurrentLineItemSubrecord('item','inventorydetail');
				if(!isEmpty(inventoryDetail)){
					var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
					for(var m = 1 ; m < invCount+1 ; m++){
						inventoryDetail.selectLineItem('inventoryassignment', m);
						record.selectNewLineItem('recmachcustrecord_djkk_brybery_page');
						
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', i);//DJ_�s�ԍ�
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_detail_sub', nlapiGetFieldValue('subsidiary'));//DJ_�q���
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_item', nlapiGetCurrentLineItemValue('item', 'item'));//DJ_�A�C�e��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_location', nlapiGetCurrentLineItemValue('item', 'location'));//	DJ_�ꏊ
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_unity', nlapiGetCurrentLineItemValue('item', 'units'));//DJ_�P��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate', nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_�P��/��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount', nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_���z
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate_code', nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_�ŋ��R�[�h
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_page', nlapiGetCurrentLineItemValue('item', 'memo'));//DJ_�O����/���|������
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_vendor', nlapiGetCurrentLineItemValue('item', 'vendorname'));//DJ_�d���於
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_tax_money_brybery', nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_�Ŋz
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_all_money_brybery', nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_���z
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_description', nlapiGetCurrentLineItemValue('item', 'description'));//DJ_����
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_department', nlapiGetCurrentLineItemValue('item', 'department'));//DJ_�Z�N�V����
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_class', nlapiGetCurrentLineItemValue('item', 'class'));//DJ_�u�����h
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_customer', nlapiGetCurrentLineItemValue('item', 'customer'));//DJ_�ڋq:�v���W�F�N�g
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_isbillablet', nlapiGetCurrentLineItemValue('item', 'isbillableT'));//DJ_�����\
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_br_amortizationscheid', nlapiGetCurrentLineItemValue('item', 'amortizationsched'));//DJ_���p�X�P�W���[��id/hidden
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationsche', nlapiGetCurrentLineItemText('item', 'amortizationsched'));//DJ_���p�X�P�W���[��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizstartdate', nlapiGetCurrentLineItemValue('item', 'amortizstartdate'));//DJ_���p�J�n
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationendd', nlapiGetCurrentLineItemValue('item', 'amortizationenddate'));//DJ_���p�I��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_amortizationresidual', nlapiGetCurrentLineItemValue('item', 'amortizationresidual'));//DJ_�c�]
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_custcol_sol_fa_demo_1', nlapiGetCurrentLineItemValue('item', 'custcol_sol_fa_demo_1'));//DJ_���Y�o�^
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_customs_duty_rate2', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate'));//DJ_�\��֐�(�����z2)
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_4572_tax_category', nlapiGetCurrentLineItemValue('item', 'custcol_4572_tax_category'));//DJ_�ŋ��J�e�S��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_po_memorandum', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_memorandum'));//DJ_���Y�^
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_origin', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_origin'));//DJ_���Y��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_in_sotck_send_indicate', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_in_sotck_send_indicate'));//DJ_���ח\��w����
						
						var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber')
						if(isEmpty(receiptinventorynumber)){
					    	var invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//���b�g�ԍ�internalid
					    	receiptinventorynumber = nlapiLookupField('inventorynumber', invReordId,'inventorynumber');
						}
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number',invReordId);	//�V���A��/���b�g�ԍ�    	
				    	
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_binnery_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber'));//DJ_�ۊǒI�ԍ�
						
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_over_date_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));//�L������
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_lot_number',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));//DJ_���[�J�[�������b�g�ԍ�
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_serial_number',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));//DJ_���[�J�[�V���A���ԍ�	
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_manufacturing_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));//DJ_�����N����
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_probort_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));//DJ_�o�׉\������
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_ware_house_num_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));//DJ_�q�ɓ��ɔԍ�
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));//DJ_SMC�ԍ�
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_list_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));//DJ_���b�g���}�[�N
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_memmo_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));//DJ_���b�g����	
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));//����		 
				    	record.commitLineItem('recmachcustrecord_djkk_brybery_page');	
					}
			    }else{
					record.selectNewLineItem('recmachcustrecord_djkk_brybery_page');
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', i);//DJ_�s�ԍ�
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_detail_sub', nlapiGetFieldValue('subsidiary'));//DJ_�q���
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_item', nlapiGetCurrentLineItemValue('item', 'item'));//DJ_�A�C�e��
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_location', nlapiGetCurrentLineItemValue('item', 'location'));//	DJ_�ꏊ
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_unity', nlapiGetCurrentLineItemValue('item', 'units'));//DJ_�P��
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate', nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_�P��/��
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount', nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_���z
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate_code', nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_�ŋ��R�[�h
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_page', nlapiGetCurrentLineItemValue('item', 'memo'));//DJ_�O����/���|������
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_vendor', nlapiGetCurrentLineItemValue('item', 'vendorname'));//DJ_�d���於
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_tax_money_brybery', nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_�Ŋz
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_all_money_brybery', nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_���z
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_description', nlapiGetCurrentLineItemValue('item', 'description'));//DJ_����
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_department', nlapiGetCurrentLineItemValue('item', 'department'));//DJ_�Z�N�V����
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_class', nlapiGetCurrentLineItemValue('item', 'class'));//DJ_�u�����h
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_customer', nlapiGetCurrentLineItemValue('item', 'customer'));//DJ_�ڋq:�v���W�F�N�g
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_isbillablet', nlapiGetCurrentLineItemValue('item', 'isbillableT'));//DJ_�����\
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_br_amortizationscheid', nlapiGetCurrentLineItemValue('item', 'amortizationsched'));//DJ_���p�X�P�W���[��id/hidden
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationsche', nlapiGetCurrentLineItemText('item', 'amortizationsched'));//DJ_���p�X�P�W���[��
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizstartdate', nlapiGetCurrentLineItemValue('item', 'amortizstartdate'));//DJ_���p�J�n
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationendd', nlapiGetCurrentLineItemValue('item', 'amortizationenddate'));//DJ_���p�I��
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_amortizationresidual', nlapiGetCurrentLineItemValue('item', 'amortizationresidual'));//DJ_�c�]
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_custcol_sol_fa_demo_1', nlapiGetCurrentLineItemValue('item', 'custcol_sol_fa_demo_1'));//DJ_���Y�o�^
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_customs_duty_rate2', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate'));//DJ_�\��֐�(�����z2)
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_4572_tax_category', nlapiGetCurrentLineItemValue('item', 'custcol_4572_tax_category'));//DJ_�ŋ��J�e�S��
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_po_memorandum', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_memorandum'));//DJ_���Y�^
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_origin', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_origin'));//DJ_���Y��
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_in_sotck_send_indicate', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_in_sotck_send_indicate'));//DJ_���ח\��w����
			    	record.commitLineItem('recmachcustrecord_djkk_brybery_page');
				}
		    }
		    nlapiLogExecution('debug','item end','')	
		  //��p����
			var costCounts=nlapiGetLineItemCount('expense');
			nlapiLogExecution('debug','cost start','start')
		    for(var c=1;c<costCounts+1;c++){
		    	nlapiSelectLineItem('expense', c);
				{
					nlapiLogExecution('debug','in costline ',nlapiGetCurrentLineItemValue('expense', 'account'))
					record.selectNewLineItem('recmachcustrecord_djkk_amount_acknowledgment');
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_account',nlapiGetCurrentLineItemValue('expense', 'account'));//����Ȗ�
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amount',nlapiGetCurrentLineItemValue('expense', 'amount'));//���z
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxcode',nlapiGetCurrentLineItemValue('expense', 'taxcode'));//�ŋ��R�[�h
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxrate',nlapiGetCurrentLineItemValue('expense', 'taxrate1'));//�ŗ�
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_tax',nlapiGetCurrentLineItemValue('expense', 'tax'));//�Ŋz
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_pst',nlapiGetCurrentLineItemValue('expense', 'item'));//PST
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_grossamt',nlapiGetCurrentLineItemValue('expense', 'grossamt'));//���z
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_memo',nlapiGetCurrentLineItemValue('expense', 'memo'));//����
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_department',nlapiGetCurrentLineItemValue('expense', 'department'));//�Z�N�V����
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_class',nlapiGetCurrentLineItemValue('expense', 'class'));//�u�����h
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_location',nlapiGetCurrentLineItemValue('expense', 'location'));//�ꏊ
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_customer',nlapiGetCurrentLineItemValue('expense', 'customer'));//�ڋq
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_claim',nlapiGetCurrentLineItemValue('expense', 'isbillable'));//�����\
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amortizatio',nlapiGetCurrentLineItemText('expense', 'amortizationsched'));//���p�X�P�W���[��
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_cost_amortizationid',nlapiGetCurrentLineItemValue('expense', 'amortizationsched'));//���p�X�P�W���[��id/hidden
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizstartdate',nlapiGetCurrentLineItemValue('expense', 'amortizstartdate'));//���p�J�n	
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizationend',nlapiGetCurrentLineItemValue('expense', 'amortizationenddate'));//���p�I��
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_residual',nlapiGetCurrentLineItemValue('expense', 'amortizationresidual'));//�c�]
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_tax_category',nlapiGetCurrentLineItemValue('expense', 'custcol_4572_tax_category'));//�ŋ��J�e�S��
			    	record.commitLineItem('recmachcustrecord_djkk_amount_acknowledgment');
				}
		    }
			nlapiLogExecution('debug','cost end','end')
		    
			var custRecordId=nlapiSubmitRecord(record, true, true);
			nlapiSetFieldValue('custbody_djkk_bribery_acknowledgmentid', custRecordId, false, true);
		    nlapiSetFieldValue('custbody_cache_data_flag', 'T', false, true);
			}catch(e){
				throw nlapiCreateError('�V�X�e���G���[', e.message);
				 nlapiSetFieldValue('custbody_cache_data_flag', 'T', false, true);
		   }
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
  
}
