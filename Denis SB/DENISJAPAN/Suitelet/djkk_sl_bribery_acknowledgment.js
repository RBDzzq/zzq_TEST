/**
 * DJ_�O����/���|���������F���SL
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Dec 2022     ZHOU
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
		nlapiLogExecution('debug','recId',recId)
		
		var Status = request.getParameter('Status');
		nlapiLogExecution('debug','Status',Status)
		var deleteRecordId = request.getParameter('deleteRecordId');
		nlapiLogExecution('debug', 'deleteRecordId',deleteRecordId);
		if(!isEmpty(deleteRecordId)){
			var scheduleparams = new Array();
			scheduleparams['custscript_djkk_deleterecordtype'] = 'vendorcredit';
			scheduleparams['custscript_djkk_deleterecordid'] = deleteRecordId;
			runBatch('customscript_djkk_ss_trandata_delete', 'customdeploy_djkk_ss_trandata_deleterec', scheduleparams);
		}else{							
		var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
		//20230616 add by zhou start
		if(Status=='edit'){
			var vendorcreditId = record.getFieldValue('custrecord_djkk_over_id');//�O����/���|�������W�����id
			if(!isEmpty(vendorcreditId)){
				nlapiLogExecution('debug','vendorcredit',vendorcreditId)
				throw nlapiCreateError('�V�X�e���G���[','���ݎ��s���̃I�y���[�^�����܂��B�u�G���[�̃��[���o�b�N�v�{�^�����N���b�N���Ĉُ����菜���Ă��玎���Ă�������',true);
			}
		}
		//20230616 add by zhou end
	//	nlapiLogExecution('debug','record',subsidiary)
		//��v���
		var customform =  record.getFieldValue('customform');
		var transactionnumber =  record.getFieldValue('custrecord_djkk_transactionnumber');//�g�����U�N�V�����ԍ�
		var tranid =  record.getFieldValue('custrecord_djkk_bribery_tranid');//�Q�Ɣԍ�
		var vendor =  record.getFieldValue('custrecord_djkk_bribery_vendor');//�d���� 
		var account =  record.getFieldValue('custrecord_djkk_bribery_account');//����Ȗ� 
		var amount =  record.getFieldValue('custrecord_djkk_bribery_amount');//���z
		var createdfromRecognition =  record.getFieldValue('custrecord_djkk_bribery_createdfrom');//DJ_�쐬��(���F�p)
		var currency =  record.getFieldValue('custrecord_djkk_bribery_currency');//DJ_�ʉ� 
		var exchangerate =  record.getFieldValue('custrecord_djkk_bribery_exchangerate');//DJ_�בփ��[�g *
		var taxtotal =  record.getFieldValue('custrecord_djkk_bribery_taxtotal');//DJ_�ŋ�
		var duedate =  record.getFieldValue('custrecord_djkk_bribery_duedate');//DJ_����
		var nowDate =  record.getFieldValue('custrecord_djkk_bribery_now_date');//���t 
		var postingperiod =  record.getFieldValue('custrecord_djkk_bribery_postingperiod');//�L������ 
		var memo =  record.getFieldValue('custrecord_djkk_bribery_memo');//����
		var closingDate =  record.getFieldValue('custrecord_djkk_bribery_closing_date');//����
		var deliveryDate =  record.getFieldValue('custrecord_djkk_bribery_deliverydate');//�[��
		var count=record.getLineItemCount('recmachcustrecord_djkk_brybery_page');  //item����	
		var costCount=record.getLineItemCount('recmachcustrecord_djkk_amount_acknowledgment');  //��p����	
		//����
		var subsidiary =  record.getFieldValue('custrecord_djkk_bribery_subsidiary');//�q���
		var department =  record.getFieldValue('custrecord_djkk_department');//�Z�N�V����
		var class =  record.getFieldValue('custrecord_djkk_class');//�u�����h
		var location =  record.getFieldValue('custrecord_djkk_location');//�ꏊ
		var overId =  record.getFieldValue('custrecord_djkk_over_id');//DJ_�O����/���|������
		
		//���̑�
		var operationInston =  record.getFieldValue('custrecord_djkk_bribery_operation_inston');//DJ_���i�E��Ǝw��
		var inspectionFinished =  record.getFieldValue('custrecord_djkk_inspection_finished');//DJ_���i�I����]��	
		var reservedExchangerateP1 =  record.getFieldValue('custrecord_djkk_reserved_exchangerate_p1');//DJ_��1�\�񃌁[�g
		var bankAcctInfo =  record.getFieldValue('custrecord_djkk_jp_bank_acct_info');//DJ_��s�������
		var estimateinfo =  record.getFieldValue('custrecord_djkk_custbody_jp_estimateinfo');//DJ_���Ϗ��
		var message =  record.getFieldValue('custrecord_djkk_bribery_jp_message');//DJ_�ʐM��
		var expectedShippingDate =  record.getFieldValue('custrecord_djkk_expected_shipping_date');//DJ_�o�ח\���
		var vendorComments =  record.getFieldValue('custrecord_djkk_bribery_vendor_comments');//DJ_�d����R�����g
		var exchangeRateYen =  record.getFieldValue('custrecord_dj_reserved_exchange_rate_yen');//DJ_�~�ݎx��
		var exchangeRate =  record.getFieldValue('custrecord_djkk_reserved_exchange_rate_f');//DJ_�O�ݎx���f�[�^�쐬
		var exchangerateP2 =  record.getFieldValue('custrecord_djkk_reserved_exchangerate_p2');//DJ_��2�\�񃌁[�g
		var exchangerateP3 =  record.getFieldValue('custrecord_djkk_reserved_exchangerate_p3');//DJ_��3�\�񃌁[�g
		var project =  record.getFieldValue('custrecord_djkk_bribery_project');//DJ_�v���W�F�N�g
		var deliveryPrecautions =  record.getFieldValue('custrecord_djkk_delivery_precautions');//DJ_�[�i�撍�ӎ���
		var pop =  record.getFieldValue('custrecord_djkk_production_po_number');//DJ_PRODUCTION PURCHASE ORDER�ԍ�
		var language =  record.getFieldValue('custrecord_djkk_bribery_language');//DJ_����
		var incotermsLocation =  record.getFieldValue('custrecord_djkk_br_incoterms_location');//DJ_�o�׌�
		var poFcCreated =  record.getFieldValue('custrecord_djkk_bribery_po_fc_created');//DJ_PO�v���|�[�U��
		var sotckSendFlag =  record.getFieldValue('custrecord_djkk_djkk_sotck_send_flag');//DJ_���͗\��t���O
		var customerPrecautions =  record.getFieldValue('custrecord_djkk_br_customer_precautions');//DJ_�ڋq���ӎ���
		
		//����TAB
		var billaddress =  record.getFieldValue('custrecord_djkk_bribery_billaddress');//DJ_�d����Z��
		var billaddresslist =  record.getFieldValue('custrecord_djkk_bribery_billaddresslist');//DJ_�d����Z���̑I��
		
		
		
		if(!isEmpty(createdfromRecognition)){
		var therecordType=nlapiLookupField('transaction', createdfromRecognition, 'recordtype');
		var	rec2 =nlapiTransformRecord(therecordType, createdfromRecognition, 'vendorcredit');
		}else{
	    var rec2 = nlapiCreateRecord('vendorcredit');
	    rec2.setFieldValue('usertotal',amount);//���z
	    rec2.setFieldValue('currency',currency);//DJ_�ʉ�
	    rec2.setFieldValue('taxtotal',taxtotal);//DJ_�ŋ�
	    rec2.setFieldValue('subsidiary',subsidiary);//�q���
		}
		
		if(Status=='edit'){
			rec2.setFieldValue('custbody_cache_data_flag','T');//DJ_�L���b�V���f�[�^�t���O			
		}		
		
		//��v���
//		rec2.setFieldValue('customform',customform);
		rec2.setFieldValue('transactionnumber',transactionnumber);//�g�����U�N�V�����ԍ�
		rec2.setFieldValue('tranid',tranid);//�Q�Ɣԍ�
		rec2.setFieldValue('entity',vendor);//�d���� 
		rec2.setFieldValue('account',account);//����Ȗ� 
		
		
		rec2.setFieldValue('createdfrom',createdfromRecognition);//DJ_�쐬��(���F�p)
		
		rec2.setFieldValue('exchangerate',exchangerate);//DJ_�בփ��[�g *
		
		rec2.setFieldValue('duedate',duedate);//DJ_����
		rec2.setFieldValue('trandate',nowDate);//���t 
		rec2.setFieldValue('postingperiod',postingperiod);//�L������ 
		rec2.setFieldValue('memo',memo);//����
		rec2.setFieldValue('custbody_suitel10n_inv_closing_date',closingDate);//����
		rec2.setFieldValue('custbody_jp_deliverydate',deliveryDate);//�[��
		rec2.setFieldValue('custbody_djkk_bribery_acknowledgmentid',recId);//DJ_�O����/���|���������F
		
		//����
		
		rec2.setFieldValue('department',department);//�Z�N�V����
		rec2.setFieldValue('class',class);//�u�����h
		rec2.setFieldValue('location',location);//�ꏊ
		
		//���̑�
		rec2.setFieldValue('custbody_djkk_operation_instructions', operationInston);//DJ_���i�E��Ǝw��
		rec2.setFieldValue('custbody_djkk_inspection_finished', inspectionFinished);//DJ_���i�I����]��	
		// CH144 zheng 20230516 start
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_p1', reservedExchangerateP1);//DJ_��1�\�񃌁[�g
		// CH144 zheng 20230516 end
		rec2.setFieldValue('custbody_jp_bank_acct_info', bankAcctInfo);//DJ_��s�������
		rec2.setFieldValue('custbody_jp_estimateinfo', estimateinfo);//DJ_���Ϗ��
		rec2.setFieldValue('custbody_jp_message',message);//DJ_�ʐM��
		rec2.setFieldValue('custbody_djkk_expected_shipping_date',expectedShippingDate);//DJ_�o�ח\���
		rec2.setFieldValue('custbody_djkk_vendor_comments',vendorComments );//DJ_�d����R�����g
		// CH144 zheng 20230516 start
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_yen',exchangeRateYen);//DJ_�~�ݎx��
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_f',exchangeRate);//DJ_�O�ݎx���f�[�^�쐬
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_p2',exchangerateP2);//DJ_��2�\�񃌁[�g
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_p3',exchangerateP3);//DJ_��3�\�񃌁[�g
		// CH144 zheng 20230516 end
		rec2.setFieldValue('custbody_djkk_project',project);//DJ_�v���W�F�N�g
		rec2.setFieldValue('custbody_djkk_delivery_precautions',deliveryPrecautions);//DJ_�[�i�撍�ӎ���
		rec2.setFieldValue('custbody_djkk_production_po_number',pop);//DJ_PRODUCTION PURCHASE ORDER�ԍ�
		rec2.setFieldValue('custbody_djkk_language',language);//DJ_����
		rec2.setFieldValue('custbody_djkk_incoterms_location',incotermsLocation);//DJ_�o�׌�
		rec2.setFieldValue('custbody_djkk_incoterms_location',poFcCreated);//DJ_PO�v���|�[�U��
		rec2.setFieldValue('custbody_djkk_sotck_send_flag',sotckSendFlag);//DJ_���͗\��t���O
		rec2.setFieldValue('custbody_djkk_customer_precautions',customerPrecautions);//DJ_�ڋq���ӎ���
		
		//����TAB
		rec2.setFieldValue('custrecord_djkk_bribery_billaddress',billaddress);//DJ_�d����Z��
		rec2.setFieldValue('custrecord_djkk_br_billaddresslist_id',billaddresslist);//DJ_�d����Z���̑I��
			
		//���F���
		
		
		rec2.setFieldValue('custbody_djkk_trans_appr_deal_flg', record.getFieldValue('custrecord_djkk_brybery_checkbox'));
		rec2.setFieldValue('custbody_djkk_trans_appr_status', record.getFieldValue('custrecord_djkk_page_status'));
		rec2.setFieldValue('custbody_djkk_trans_appr_create_role', record.getFieldValue('custrecord_djkk_start_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr_create_user', record.getFieldValue('custrecord_djkk_start_role_name'));
		
		rec2.setFieldValue('custbody_djkk_trans_appr_dev_user', record.getFieldValue('custrecord_djkk_brybery_appr_dev_u'));
		rec2.setFieldValue('custbody_djkk_trans_appr_dev', record.getFieldValue('custrecord_djkk_brybery_tr'));
		rec2.setFieldValue('custbody_djkk_trans_appr_do_cdtn_amt', record.getFieldValue('custrecord_djkk_brybery_appr_term'));
		
		rec2.setFieldValue('custbody_djkk_trans_appr_next_role', record.getFieldValue('custrecord_djkk_next_appr_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr_user', record.getFieldValue('custrecord_djkk_next_appr_name'));
		rec2.setFieldValue('custbody_djkk_trans_appr_cdtn_amt', record.getFieldValue('custrecord_djkk_next_appr_term'));
		rec2.setFieldValue('custbody_djkk_trans_appr1_role', record.getFieldValue('custrecord_djkk_first_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr1_user', record.getFieldValue('custrecord_djkk_brybery_first_name'));
		rec2.setFieldValue('custbody_djkk_trans_appr2_role', record.getFieldValue('custrecord_djkk_end_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr2_user', record.getFieldValue('custrecord_djkk_brybery_second_name'));
		
		rec2.setFieldValue('custbody_djkk_trans_appr3_role', record.getFieldValue('custrecord_djkk_third_brybery_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr3_user', record.getFieldValue('custrecord_djkk_third_brybery_name'));
		rec2.setFieldValue('custbody_djkk_trans_appr4_role', record.getFieldValue('custrecord_djkk_last_brybery_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr4_user', record.getFieldValue('custrecord_djkk_last_brybery_name'));
		rec2.setFieldValue('custbody_djkk_approval_reset_memo', record.getFieldValue('custrecord_djkk_over_brybery_memo'));  
		rec2.setFieldValue('custbody_djkk_approval_kyaltuka_memo', record.getFieldValue('custrecord_djkk_brybery_kyaltuka_memo'));  

		nlapiLogExecution('debug','subsidiary after',subsidiary)
		//???
		if(subsidiary==SUB_NBKK || subsidiary==SUB_ULKK){
			rec2.setFieldValue('customform', '147'); //customform
		}else if(subsidiary==SUB_DPKK || subsidiary==SUB_SCETI){
			rec2.setFieldValue('customform', '134'); //customform
		}else{
			rec2.setFieldValue('customform', '142'); //customform
		}

		
		var itemCountArray=new Array();
		for(var s=1;s<count+1;s++){
			itemCountArray.push(record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', s));//line num
		}
		itemCountArray=unique(itemCountArray);
		try{
			
			if(!isEmpty(createdfromRecognition)){
				for(var s=itemCountArray.length;s>0;s--){
					rec2.removeLineItem('item', s);
				}
				}
			
		for(var i=0;i<itemCountArray.length;i++){
			var inc=1;		
			rec2.selectNewLineItem('item');
			for(var n=1;n<count+1;n++){
//				nlapiLogExecution('debug','create item','create item')
				if(record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', n)==itemCountArray[i]){
					if(inc==1){				
						nlapiLogExecution('debug','inc',inc)
						rec2.setCurrentLineItemValue('item', 'item', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_item',n));//DJ_�A�C�e��
						rec2.setCurrentLineItemValue('item', 'location', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_location',n));//�ꏊ
						rec2.setCurrentLineItemValue('item', 'quantity', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity',n));//DJ_����
						rec2.setCurrentLineItemValue('item', 'units', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_unity',n));//�P��
						rec2.setCurrentLineItemValue('item', 'rate', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate',n));//DJ_�P��/��
						nlapiLogExecution('debug','amount',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount',n))
						rec2.setCurrentLineItemValue('item', 'amount', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount',n));//DJ_���z
						rec2.setCurrentLineItemValue('item', 'taxcode', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate_code',n));//DJ_�ŋ��R�[�h
						rec2.setCurrentLineItemValue('item', 'vendorname', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_vendor',n));//DJ_�d���於
						//�V�X�e����item�Ɛ��ʂɊ�Â��Ď����I�ɐŊz���v�Z���܂�
//						rec2.setCurrentLineItemValue('item', 'tax1amt', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_tax_money_brybery',n));//DJ_�Ŋz
//						rec2.setCurrentLineItemValue('item', 'grossamt', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_all_money_brybery',n));//DJ_���z
						rec2.setCurrentLineItemValue('item', 'description', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_description',n));//DJ_����
//						rec2.setCurrentLineItemValue('item', 'department', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_department',n));//DJ_�Z�N�V����
						rec2.setCurrentLineItemValue('item', 'class', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_class',n));//DJ_�u�����h
						rec2.setCurrentLineItemValue('item', 'customer', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_customer',n));//DJ_�ڋq:�v���W�F�N�g
						rec2.setCurrentLineItemValue('item', 'isbillableT', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_isbillablet',n));//DJ_�����\

						
						//						rec2.setCurrentLineItemValue('item', 'amortizationsched', record.getLineItemText('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationsche',n));//DJ_���p�X�P�W���[��
						rec2.setCurrentLineItemValue('item', 'amortizationsched', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_br_amortizationscheid',n));//DJ_���p�X�P�W���[��id/hidden
						
						rec2.setCurrentLineItemValue('item', 'amortizstartdate', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizstartdate',n));//DJ_���p�J�n
						rec2.setCurrentLineItemValue('item', 'amortizationenddate', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationendd',n));//DJ_���p�I��
						rec2.setCurrentLineItemValue('item', 'amortizationresidual', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_amortizationresidual',n));//DJ_�c�]
						rec2.setCurrentLineItemValue('item', 'custcol_sol_fa_demo_1', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_custcol_sol_fa_demo_1',n));//DJ_���Y�o�^
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_customs_duty_rate2',n));//DJ_�\��֐�(�����z2)
						rec2.setCurrentLineItemValue('item', 'custcol_4572_tax_category', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_4572_tax_category',n));//DJ_�ŋ��J�e�S��
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_po_memorandum', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_po_memorandum',n));//DJ_���Y�^
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_origin', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_origin',n));//DJ_���Y��
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_in_sotck_send_indicate', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_in_sotck_send_indicate',n));//DJ_���ח\��w����
						
						
						
					    if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number', n))){
					    	nlapiLogExecution('debug','create inventorydetail','create inventorydetail')
							var inventoryDetail=rec2.createCurrentLineItemSubrecord('item','inventorydetail');
					    	var receiptinventorynumber = record.getLineItemText('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number', n)
							inventoryDetail.selectNewLineItem('inventoryassignment');
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',receiptinventorynumber);//�V���A��/���b�g�ԍ�    
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_binnery_num', n));//DJ_�ۊǒI�ԍ�
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_over_date_brybery', n));//�L������
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_serial_number', n));//DJ_���[�J�[�V���A���ԍ�//
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_lot_number', n));//DJ_���[�J�[�������b�g�ԍ�
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_manufacturing_date', n));//DJ_�����N����
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_probort_date', n));//DJ_�o�׉\������
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_ware_house_num_brybery', n));//DJ_�q�ɓ��ɔԍ�
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_smc_num', n));//DJ_SMC�ԍ�
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_list_brybery', n));//DJ_���b�g���}�[�N
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_memmo_brybery', n));//DJ_���b�g����	
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity', n));//����				    	
							inventoryDetail.commitLineItem('inventoryassignment');
							inventoryDetail.commit();
							nlapiLogExecution('debug','create inventorydetail in ','create inventorydetail in')
						}
					}else{
						if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number', n))){
							nlapiLogExecution('debug','create inventorydetailedit','create inventorydetailedit')
							var inventoryDetail=rec2.editCurrentLineItemSubrecord('item','inventorydetail');
							var receiptinventorynumber = record.getLineItemText('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number', n)
							inventoryDetail.selectNewLineItem('inventoryassignment');
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',receiptinventorynumber);//�V���A��/���b�g�ԍ�    
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_binnery_num', n));//DJ_�ۊǒI�ԍ�
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_over_date_brybery', n));//�L������
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_serial_number', n));//DJ_���[�J�[�V���A���ԍ�//
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_lot_number', n));//DJ_���[�J�[�������b�g�ԍ�
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_manufacturing_date', n));//DJ_�����N����
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_probort_date', n));//DJ_�o�׉\������
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_ware_house_num_brybery', n));//DJ_�q�ɓ��ɔԍ�
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_smc_num', n));//DJ_SMC�ԍ�
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_list_brybery', n));//DJ_���b�g���}�[�N
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_memmo_brybery', n));//DJ_���b�g����	
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity', n));//����				    	
							inventoryDetail.commitLineItem('inventoryassignment');
							inventoryDetail.commit();
						}
					}
					inc++;
				}	
			}
			rec2.commitLineItem('item');
		}
		nlapiLogExecution('debug','ccostCount ',costCount)
		for(var c = 1 ; c < costCount+1 ; c++){
			nlapiLogExecution('debug','ccostCount ','in' +c);
			if(!isEmpty(createdfromRecognition)){
				rec2.selectLineItem('expense', c);
				if(rec2.getCurrentLineItemValue('expense', 'account')!=record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_account',c)){
				rec2.setCurrentLineItemValue('expense', 'account', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_account',c));//����Ȗ�
				}
			}else{
				rec2.selectNewLineItem('expense');
				rec2.setCurrentLineItemValue('expense', 'account', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_account',c));//����Ȗ�
			}
			
			rec2.setCurrentLineItemValue('expense', 'amount', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amount',c));//���z
			rec2.setCurrentLineItemValue('expense', 'taxcode', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxcode',c));//�ŋ��R�[�h
			rec2.setCurrentLineItemValue('expense', 'taxrate1', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxrate',c));//�ŗ�
//			rec2.setCurrentLineItemValue('expense', 'tax', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_tax',c));//�Ŋz
//			rec2.setCurrentLineItemValue('expense', '', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_pst',c));//pst
//			rec2.setCurrentLineItemValue('expense', 'grossamt', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_grossamt',c));//���z
			rec2.setCurrentLineItemValue('expense', 'memo', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_memo',c));//����
			rec2.setCurrentLineItemValue('expense', 'department', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_department',c));//�Z�N�V����
			rec2.setCurrentLineItemValue('expense', 'class', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_class',c));//�u�����h
			rec2.setCurrentLineItemValue('expense', 'location', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_location',c));//�ꏊ
			rec2.setCurrentLineItemValue('expense', 'customer', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_customer',c));//�ڋq
			rec2.setCurrentLineItemValue('expense', 'isbillable', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_claim',c));//�����\
//			rec2.setCurrentLineItemValue('expense', 'amortizationsched ', record.getLineItemText('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amortizatio',c));//���p�X�P�W���[��
			rec2.setCurrentLineItemValue('expense', 'amortizationsched ', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_br_cost_amortizationid',c));//���p�X�P�W���[��id/hidden
			rec2.setCurrentLineItemValue('expense', 'amortizstartdate', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizstartdate',c));//���p�J�n
			rec2.setCurrentLineItemValue('expense', 'amortizationenddate', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizationend',c));//���p�I��
			rec2.setCurrentLineItemValue('expense', 'amortizationresidual', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_residual',c));//�c�]
			rec2.setCurrentLineItemValue('expense', 'custcol_4572_tax_category', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_tax_category',c));//�ŋ��J�e�S��
			rec2.commitLineItem('expense');
		}
		nlapiLogExecution('debug','end ','end')
		}catch(e){
			nlapiLogExecution('debug', '�G���[1  ', e.message);
		} 
		
		
		var rec2id = nlapiSubmitRecord(rec2,false,true);
		nlapiLogExecution('debug', 'rec2id', rec2id);
		if(Status=='approval'){
			var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
			record.setFieldValue('custrecord_djkk_over_id',rec2id);
			nlapiSubmitRecord(record,false,true);
			nlapiSetRedirectURL('RECORD', 'vendorcredit',rec2id, 'VIEW');
		}else if(Status=='edit'){
//			try{
			var delRecord=nlapiCreateRecord('customrecord_djkk_transact_data_delete');
			delRecord.setFieldValue('custrecord_djkk_del_trantype', '�O����/���|������');
			delRecord.setFieldValue('custrecord_djkk_del_recordtype', 'vendorcredit');
			delRecord.setFieldValue('custrecord_djkk_del_internalid', rec2id);
			delRecord.setFieldValue('custrecord_djkk_del_url', nlapiResolveURL('RECORD', 'vendorcredit',rec2id, 'VIEW'));
			var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
			record.setFieldValue('custrecord_djkk_over_id',rec2id);
			nlapiSubmitRecord(record,false,true);
			var delid = nlapiSubmitRecord(delRecord,false,true);
			nlapiLogExecution('debug', 'delid', delid);
			response.write(rec2id);
//			}catch(e){
//				nlapiLogExecution('debug', '�G���[  delRecord', e.message);
//			}
		}else{
			response.write(rec2id);
		}
		
	}
	}
	catch(e){
		nlapiLogExecution('debug', '�G���[', e.message);
		var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
		record.setFieldValue('custrecord_djkk_bribery_error',e.message);
		nlapiSubmitRecord(record);
		response.write('�ُ픭��:'+ e.message);
	}
}
