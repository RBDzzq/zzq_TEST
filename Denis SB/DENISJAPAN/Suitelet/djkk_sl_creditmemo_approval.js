/**
 * DJ_�N���W�b�g�������F��ʂ�SL
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
		
		var Status = request.getParameter('Status');
		
		var deleteRecordId = request.getParameter('deleteRecordId');
		if(!isEmpty(deleteRecordId)){
			var scheduleparams = new Array();
			scheduleparams['custscript_djkk_deleterecordtype'] = 'creditmemo';
			scheduleparams['custscript_djkk_deleterecordid'] = deleteRecordId;
			runBatch('customscript_djkk_ss_trandata_delete', 'customdeploy_djkk_ss_trandata_deleterec', scheduleparams);
		}else{							
		var record = nlapiLoadRecord('customrecord_djkk_credit_note_approval',recId);
		//20230616 add by zhou start
		if(Status=='edit'){
			var creditmemoId = record.getFieldValue('custrecord_djkk_credit_creditmemo');//�N���W�b�g�����W�����id
			if(!isEmpty(creditmemoId)){
				nlapiLogExecution('debug','creditmemoId',creditmemoId)
				throw nlapiCreateError('�V�X�e���G���[','���ݎ��s���̃I�y���[�^�����܂��B�u�G���[�̃��[���o�b�N�v�{�^�����N���b�N���Ĉُ����菜���Ă��玎���Ă�������',true);
			}
		}
		//20230616 add by zhou end
		var rec2 = nlapiCreateRecord('creditmemo'); //�N���W�b�g����
		var createdfrom =  record.getFieldValue('custrecord_djkk_credit_note_createdfrom');//�쐬��
				
		if(!isEmpty(createdfrom)){
			var therecordType=nlapiLookupField('transaction', createdfrom, 'recordtype');
				nlapiLogExecution('debug','createdfrom returnauthorization',createdfrom);
				nlapiLogExecution('debug','createdfrom therecordType',therecordType);
				var	rec2 =nlapiTransformRecord(therecordType, createdfrom, 'creditmemo');
		}else{
			nlapiLogExecution('debug','createdfrom empty',createdfrom)
		    var rec2 = nlapiCreateRecord('creditmemo');
		    rec2.setFieldValue('currency', record.getFieldValue('custrecord_djkk_create_note_currency')); //DJ_�ʉ�
		    rec2.setFieldValue('subsidiary',record.getFieldValue('custrecord_djkk_create_note_subsidiary'));//�q���
		}
		
		
		if(Status=='edit'){
			rec2.setFieldValue('custbody_cache_data_flag','T');//DJ_�L���b�V���f�[�^�t���O	
		}
		//��v���
		rec2.setFieldValue('tranid',record.getFieldValue('custrecord_djkk_create_note_tranid'));//�Q�Ɣԍ�
		rec2.setFieldValue('entity',record.getFieldValue('custrecord_djkk_credit_note_customer'));//�ڋq
		rec2.setFieldValue('trandate',record.getFieldValue('custrecord_djkk_create_note_date'));//���t
		rec2.setFieldValue('postingperiod',record.getFieldValue('custrecord_djkk_create_postingperiod'));//�L������
		rec2.setFieldValue('otherrefnum',record.getFieldValue('custrecord_djkk_create_note_otherrefnum'));//�������ԍ�
		rec2.setFieldValue('memo',record.getFieldValue('custrecord_djkk_create_note_memo'));//����
		rec2.setFieldValue('custbody_djkk_creditmemo_id', recId);//DJ_�N���W�b�g����ID
		rec2.setFieldValue('createdfrom',createdfrom);//DJ_�쐬��(���F�p)
		
		
		//���[���������M
		
		
		
		rec2.setFieldValue('custbody_djkk_invoice_period', record.getFieldValue('custrecord_djkk_cn_is_period'));//DJ_���������M�敪
		rec2.setFieldValue('custbody_djkk_invoice_book_site', record.getFieldValue('custrecord_djkk_cn_is_book_site'));//DJ_���������M��敪
		rec2.setFieldValue('custbody_djkk_invoice_book_person', record.getFieldValue('custrecord_djkk_cn_is_book_person'));//DJ_���������M��S����
		rec2.setFieldValue('custbody_djkk_invoice_book_subname', record.getFieldValue('custrecord_djkk_cn_is_book_subname'));//DJ_���������M���Ж� (3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_invoice_book_person_t', record.getFieldValue('custrecord_djkk_cn_is_book_person_t'));//DJ_���������M��S����(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_invoice_automatic_mailtr', record.getFieldValue('custrecord_djkk_cn_is_automatic_mailtr'));//DJ_���������M�惁�[��(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_invoice_automatic_faxtrd', record.getFieldValue('custrecord_djkk_cn_is_automatic_faxtrd'));//DJ_���������M��FAX(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_invoice_destination_regi', record.getFieldValue('custrecord_djkk_cn_is_destination_regi'));//DJ_���������M��o�^����
		
		rec2.setFieldValue('custbody_djkk_delivery_book_period', record.getFieldValue('custrecord_djkk_cn_de_period'));//DJ_���i����[�i�����M�敪
		rec2.setFieldValue('custbody_djkk_delivery_book_site_fd', record.getFieldValue('custrecord_djkk_cn_de_site_fd'));//DJ_���i����[�i�����M��敪
		rec2.setFieldValue('custbody_djkk_delivery_book_person', record.getFieldValue('custrecord_djkk_cn_de_person'));//DJ_���i����[�i�����M��S����
		rec2.setFieldValue('custbody_djkk_delivery_book_subname', record.getFieldValue('custrecord_djkk_cn_de_subname'));//DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_delivery_book_person_t', record.getFieldValue('custrecord_djkk_cn_de_person_t'));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_delivery_book_email', record.getFieldValue('custrecord_djkk_cn_de_email'));//DJ_���i����[�i�����M�惁�[��(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_delivery_book_fax_three', record.getFieldValue('custrecord_djkk_cn_de_fax_three'));//DJ_���i����[�i�����M��FAX(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_delivery_book_memo_so', record.getFieldValue('custrecord_djkk_cn_de_memo_so'));//DJ_���i����[�i�����M��o�^����
		
		rec2.setFieldValue('custbody_djkk_totalinv_period', record.getFieldValue('custrecord_djkk_cn_int_period'));//DJ_���v���������M�敪
		rec2.setFieldValue('custbody_djkk_totalinv_sendtype', record.getFieldValue('custrecord_djkk_cn_int_sendtype'));//DJ_���v���������M��敪
		rec2.setFieldValue('custbody_djkk_totalinv_sendcharge', record.getFieldValue('custrecord_djkk_cn_int_sendcharge'));//DJ_���v���������M��S����
		rec2.setFieldValue('custbody_djkk_totalinv_sendsub3rd', record.getFieldValue('custrecord_djkk_cn_int_sendsub3rd'));//DJ_���v���������M���Ж�(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_totalinv_sendcharge3rd', record.getFieldValue('custbody_djkk_cn_int_sendcharge3rd'));//DJ_���v���������M��S����(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_totalinv_sendmail3rd', record.getFieldValue('custrecord_djkk_cn_int_sendmail3rd'));//DJ_���v���������M�惁�[��(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_totalinv_sendfax3rd', record.getFieldValue('custrecord_djkk_cn_int_sendfax3rd'));//DJ_���v���������M��FAX(3RD�p�[�e�B�[)
		rec2.setFieldValue('custbody_djkk_totalinv_sendmemo', record.getFieldValue('custrecord_djkk_cn_int_sendmemo'));//DJ_���v���������M��o�^����
		
		
		
		
//		//�o��tab
//		record.setFieldValue('shipcarrier', nlapiGetFieldValue('custrecord_djkk_create_note_operator')); //DJ_�z���Ǝ�
//		record.setFieldValue('shipmethod', nlapiGetFieldValue('custrecord_djkk_create_note_method')); //DJ_�z�����@
//		record.setFieldValue('shippingtaxcode', nlapiGetFieldValue('custrecord_djkk_create_note_tax_code')); //DJ_�z�����̐ŋ��R�[�h
//		record.setFieldValue('handlingtaxcode', nlapiGetFieldValue('custrecord_djkk_create_note_fee_code')); //DJ_�萔���̐ŋ��R�[�h
//		record.setFieldValue('shippingcost', nlapiGetFieldValue('custrecord_djkk_create_note_materials')); //DJ_�z����
//		record.setFieldValue('handlingcost', nlapiGetFieldValue('custrecord_djkk_create_note_by_hand')); //DJ_�萔��
//		record.setFieldValue('custbody_djkk_deliverytimedesc', nlapiGetFieldValue('custrecord_djkk_create_note_medesc')); //DJ_�[�����ԑыL�q
//		record.setFieldValue('custbody_djkk_deliverynotregistflg', nlapiGetFieldValue('custrecord_djkk_create_note_registflg')); //DJ_�[���斢�o�^�t���O
//		//��vtab
//		record.setFieldValue('account', nlapiGetFieldValue('custrecord_djkk_create_note_accounts')); //DJ_����Ȗ�
//		record.setFieldValue('currency', nlapiGetFieldValue('custrecord_djkk_create_note_currency')); //DJ_�ʉ�
//		record.setFieldValue('exchangerate', nlapiGetFieldValue('custrecord_djkk_create_note_exchange_rat')); //DJ_�בփ��[�g
//		record.setFieldValue('totalcostestimate', nlapiGetFieldValue('custrecord_djkk_create_note_cost')); //DJ_�\���g���R�X�g
//		record.setFieldValue('estgrossprofit', nlapiGetFieldValue('custrecord_djkk_create_note_profit')); //DJ_���ϑ����v
//		record.setFieldValue('estgrossprofitpercent', nlapiGetFieldValue('custrecord_djkk_create_note_gross_profit')); //DJ_���ϑ����v�̊���
		//�o��tab
		rec2.setFieldValue('shipcarrier', record.getFieldValue('custrecord_djkk_create_note_operator')); //DJ_�z���Ǝ�
		rec2.setFieldValue('shipmethod', record.getFieldValue('custrecord_djkk_create_note_method')); //DJ_�z�����@
		rec2.setFieldValue('shippingtaxcode', record.getFieldValue('custrecord_djkk_create_note_tax_code')); //DJ_�z�����̐ŋ��R�[�h
		rec2.setFieldValue('handlingtaxcode', record.getFieldValue('custrecord_djkk_create_note_fee_code')); //DJ_�萔���̐ŋ��R�[�h
		rec2.setFieldValue('shippingcost', record.getFieldValue('custrecord_djkk_create_note_materials')); //DJ_�z����
		rec2.setFieldValue('handlingcost', record.getFieldValue('custrecord_djkk_create_note_by_hand')); //DJ_�萔��
		rec2.setFieldValue('custbody_djkk_deliverytimedesc', record.getFieldValue('custrecord_djkk_create_note_medesc')); //DJ_�[�����ԑыL�q
		rec2.setFieldValue('custbody_djkk_deliverynotregistflg', record.getFieldValue('custrecord_djkk_create_note_registflg')); //DJ_�[���斢�o�^�t���O
		//��vtab
		rec2.setFieldValue('account', record.getFieldValue('custrecord_djkk_create_note_accounts')); //DJ_����Ȗ�
//		rec2.setFieldValue('currency', record.getFieldValue('custrecord_djkk_create_note_currency')); //DJ_�ʉ�
		rec2.setFieldValue('exchangerate', record.getFieldValue('custrecord_djkk_create_note_exchange_rat')); //DJ_�בփ��[�g
		rec2.setFieldValue('totalcostestimate', record.getFieldValue('custrecord_djkk_create_note_cost')); //DJ_�\���g���R�X�g
		rec2.setFieldValue('estgrossprofit', record.getFieldValue('custrecord_djkk_create_note_profit')); //DJ_���ϑ����v
		rec2.setFieldValue('estgrossprofitpercent', record.getFieldValue('custrecord_djkk_create_note_gross_profit')); //DJ_���ϑ����v�̊���
	
		//�̔����
		rec2.setFieldValue('salesrep',record.getFieldValue('custrecord_djkk_create_note_salesrep'));//DJ_�c�ƒS����
		rec2.setFieldValue('saleseffectivedate',record.getFieldValue('custrecord_djkk_create_saleseffectivedat'));//DJ_�R�~�b�V�������
		
		//���F���
		rec2.setFieldValue('custbody_djkk_trans_appr_deal_flg',record.getFieldValue('custrecord_djkk_create_note_flg'));// DJ_���F�����t���O
		rec2.setFieldValue('custbody_djkk_trans_appr_status',record.getFieldValue('custrecord_djkk_create_note_status'));//DJ_���F�X�e�[�^�X
		rec2.setFieldValue('custbody_djkk_trans_appr_create_role',record.getFieldValue('custrecord_djkk_create_note_createrole'));//DJ_�쐬���[��
		rec2.setFieldValue('custbody_djkk_trans_appr_create_user',record.getFieldValue('custrecord_djkk_create_note_createuser'));//DJ_�쐬��
		rec2.setFieldValue('custbody_djkk_trans_appr_dev',record.getFieldValue('custrecord_djkk_create_note_oper_roll'));//DJ_���F���샍�[��
		rec2.setFieldValue('custbody_djkk_trans_appr_dev_user',record.getFieldValue('custrecord_djkk_create_note_acknowledge'));//DJ_���F�����
		rec2.setFieldValue('custbody_djkk_trans_appr_do_cdtn_amt',record.getFieldValue('custrecord_djkk_create_note_opera_condit'));//DJ_���F�������
		
		rec2.setFieldValue('custbody_djkk_trans_appr_next_role',record.getFieldValue('custrecord_djkk_create_note_autho_role'));//DJ_���̏��F���[��
		rec2.setFieldValue('custbody_djkk_trans_appr_user',record.getFieldValue('custrecord_djkk_create_note_next_approve'));//DJ_���̏��F��
		rec2.setFieldValue('custbody_djkk_trans_appr_cdtn_amt',record.getFieldValue('custrecord_djkk_create_note_appro_criter'));//DJ_���̏��F����
		rec2.setFieldValue('custbody_djkk_trans_appr1_role',record.getFieldValue('custrecord_djkk_create_note_first_role'));//DJ_��ꏳ�F���[��
		rec2.setFieldValue('custbody_djkk_trans_appr1_user',record.getFieldValue('custrecord_djkk_create_note_first_user'));//DJ_��ꏳ�F��
		rec2.setFieldValue('custbody_djkk_trans_appr2_role',record.getFieldValue('custrecord_djkk_create_note_second_role'));//DJ_��񏳔F���[��
		rec2.setFieldValue('custbody_djkk_trans_appr2_user',record.getFieldValue('custrecord_djkk_create_note_second_user'));//DJ_��񏳔F��
		
		rec2.setFieldValue('custbody_djkk_trans_appr3_role',record.getFieldValue('custrecord_djkk_create_note_third_role'));//DJ_��O���F���[��
		rec2.setFieldValue('custbody_djkk_trans_appr3_user',record.getFieldValue('custrecord_djkk_create_note_third_user'));//DJ_��O���F��
		rec2.setFieldValue('custbody_djkk_trans_appr4_role',record.getFieldValue('custrecord_djkk_create_note_fourth_role'));//DJ_��l���F���[��
		rec2.setFieldValue('custbody_djkk_trans_appr4_user',record.getFieldValue('custrecord_djkk_create_note_fourth_uesr'));//DJ_��l���F��
		rec2.setFieldValue('custbody_djkk_approval_reset_memo',record.getFieldValue('custrecord_djkk_create_note_rever_memo'));//DJ_���F���߃���
		rec2.setFieldValue('custbody_djkk_approval_kyaltuka_memo',record.getFieldValue('custrecord_djkk_approval_kyaltuka_memo')); //DJ_���F�p������ // 20230522 add by zhou
		//����
//		rec2.setFieldValue('subsidiary',record.getFieldValue('custrecord_djkk_create_note_subsidiary'));//�q���
		rec2.setFieldValue('department',record.getFieldValue('custrecord_djkk_create_note_department'));//�Z�N�V����
		rec2.setFieldValue('bulkprocsubmission',record.getFieldValue('custrecord_djkk_create_note_bulkprocsubm'));//���MID
		// CH144 zheng 20230516 start
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_s1',record.getFieldValue('custrecord_djkk_create_note_rate_s1'));//DJ_��1�\�񃌁[�g
		// CH144 zheng 20230516 end
		rec2.setFieldValue('custbody_djkk_exsystem_opc_flg',record.getFieldValue('custrecord_djkk_create_note_opc_flg'));//DJ_�O������̍σt���O
		rec2.setFieldValue('custbody_djkk_exsystem_send_date_time',record.getFieldValue('custrecord_djkk_create_note_date_time'));//DJ_�O���V�X�e�����M����
		rec2.setFieldValue('custbody_4392_includeids',record.getFieldValue('custrecord_djkk_create_note_includeids'));//���ߐ������Ɋ܂߂�
		rec2.setFieldValue('custbody_djkk_company_sales',record.getFieldValue('custrecord_djkk_create_note_sales'));//DJ_�Д̑Ώ�
		rec2.setFieldValue('custbody_djkk_end_user',record.getFieldValue('custrecord_djkk_create_note_end_user'));//DJ_�G���h���[�U�[
		rec2.setFieldValue('custbody_djkk_delivery_destination',record.getFieldValue('custrecord_djkk_create_note_destination'));//DJ_�[�i��
		rec2.setFieldValue('custbody_djkk_payment_conditions',record.getFieldValue('custrecord_djkk_create_note_conditions'));//DJ_�x������
		rec2.setFieldValue('custbody_djkk_gst_registration',record.getFieldValue('custrecord_djkk_create_note_registration'));//DJ_GST�o�^�ԍ�
		rec2.setFieldValue('custbody_djkk_deliverynote',record.getFieldValue('custrecord_djkk_create_note_deliverynote'));//DJ_�[�i���������M
		rec2.setFieldValue('custbody_djkk_shipping_instructions_f',record.getFieldValue('custrecord_djkk_create_note_instructions'));//DJ_�o�׎w��
		rec2.setFieldValue('custbody_djkk_shipment_person',record.getFieldValue('custrecord_djkk_create_note_person'));//DJ_�o�גS����
		rec2.setFieldValue('location',record.getFieldValue('custrecord_djkk_create_note_location'));//�ꏊ
		rec2.setFieldValue('custbody_djkk_paymentmethodtyp',record.getFieldValue('custrecord_djkk_create_note_methodtyp'));//DJ_�x�����@�敪
		rec2.setFieldValue('custbody_djkk_deliveryruledesc',record.getFieldValue('custrecord_djkk_create_note_deliveryrule'));//DJ_�[���斈�݌Ɉ�������
		rec2.setFieldValue('custbody_djkk_cautiondesc',record.getFieldValue('custrecord_djkk_create_note_cautiondesc'));//DJ_���ӎ���
		rec2.setFieldValue('custbody_djkk_wmsmemo1',record.getFieldValue('custrecord_djkk_create_note_wmsmemo1'));//DJ_�q�Ɍ������l�P
		rec2.setFieldValue('custbody_djkk_deliverermemo1',record.getFieldValue('custrecord_djkk_create_note_deliverermem'));//DJ_�^����Ќ������l
		rec2.setFieldValue('custbody_djkk_deliverynotememo',record.getFieldValue('custrecord_djkk_create_note_deliverymemo'));//DJ_�[�i�����l
		rec2.setFieldValue('custbody_djkk_orderrequestid',record.getFieldValue('custrecord_djkk_create_note_orderrequeid'));//DJ_�����˗�ID
		rec2.setFieldValue('custbody_djkk_netsuitetransflg',record.getFieldValue('custrecord_djkk_create_note_netflg'));//DJ_NETSUITE�A�g�t���O
		rec2.setFieldValue('custbody_djkk_shippinginstructdt',record.getFieldValue('custrecord_djkk_create_note_nstructdt'));//DJ_�o�׎w������
		rec2.setFieldValue('custbody_djkk_customerorderno',record.getFieldValue('custrecord_djkk_create_note_merorderno'));//DJ_��������ԍ�
		rec2.setFieldValue('custbody_djkk_consignmentbuyingsaleflg',record.getFieldValue('custrecord_djkk_create_note_ingsaleflg'));//DJ_�����d������t���O
		rec2.setFieldValue('custbody_djkk_delivery_hopedate',record.getFieldValue('custrecord_djkk_create_note_hopedate'));//DJ_�[�i��]��
		rec2.setFieldValue('class',record.getFieldValue('custrecord_djkk_create_note_class'));//�u�����h
		rec2.setFieldValue('custbody_djkk_wmsmemo2',record.getFieldValue('custrecord_djkk_create_note_wmsmemo2'));//DJ_�q�Ɍ������l�Q
		rec2.setFieldValue('custbody_djkk_wmsmemo3',record.getFieldValue('custrecord_djkk_create_note_wmsmemo3'));//DJ_�q�Ɍ������l3
		rec2.setFieldValue('custbody_djkk_warehouse_sent',record.getFieldValue('custrecord_djkk_create_note_send'));//DJ_�q�ɑ��M�ς�
		rec2.setFieldValue('custbody_djkk_finetkanaofferconame',record.getFieldValue('custrecord_djkk_create_note_coname'));//DJ_FINET�J�i�񋟊�Ɩ�
		rec2.setFieldValue('custbody_djkk_finetkanaoffercooffice',record.getFieldValue('custrecord_djkk_create_note_cooffice'));//DJ_FINET�J�i�񋟊�ƎQ�Ǝ��Ə���
		rec2.setFieldValue('custbody_djkk_finetkanacustomername',record.getFieldValue('custrecord_djkk_create_note_stomername'));//DJ_FINET�J�i�Ж��E�X���E����於
		rec2.setFieldValue('custbody_djkk_finetkanacustomeraddress',record.getFieldValue('custrecord_djkk_create_note_address'));//DJ_FINET�J�i�Z��
		rec2.setFieldValue('custrecord_djkk_cn_istotal_flag',record.getFieldValue('custrecord_djkk_create_note_invflg'));//DJ_���v�������쐬�ς݃t���O
		rec2.setFieldValue('custbody_djkk_rios_base_date',record.getFieldValue('custrecord_djkk_create_note_base_date'));//DJ_RIOS���
		rec2.setFieldValue('custbodycustbody_djkk_netsuitetransdt',record.getFieldValue('custrecord_djkk_create_note_netsuitetran'));//DJ_NETSUITE�A�g����
		rec2.setFieldValue('custbody_djkk_language',record.getFieldValue('custrecord_djkk_create_note_language'));//DJ_����
		
		
		rec2.setFieldValue('custbody_suitel10n_jp_ids_date',record.getFieldValue('custrecord_djkk_create_note_ids_date'));//���ߐ���������
		rec2.setFieldValue('custbody_jp_invoice_summary_due_date',record.getFieldValue('custrecord_djkk_create_note_due_date'));//INVOICE SUMMARY DUE DATE
		rec2.setFieldValue('custbody_djkk_deliverermemo2',record.getFieldValue('custrecord_djkk_create_note_delivererme2'));//DJ_�^����Ќ������l2
		// CH144 zheng 20230516 start
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_yen',record.getFieldValue('custrecord_djkk_create_note_rate_yen'));//DJ_�~�ݎx��
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_s2',record.getFieldValue('custrecord_djkk_create_note_rate_s2'));//DJ_��2�\�񃌁[�g
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_s3',record.getFieldValue('custrecord_djkk_create_note_rate_s3'));//DJ_��3�\�񃌁[�g
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_f',record.getFieldValue('custrecord_djkk_create_note_rate_f'));//DJ_�O�ݎx���f�[�^�쐬
		// CH144 zheng 20230516 end
		rec2.setFieldValue('custbody_djkk_reference_delive',record.getFieldValue('custrecord_djkk_create_note_delive'));//DJ_�[���񓚔��l��
		rec2.setFieldValue('custbody_djkk_reference_column',record.getFieldValue('custrecord_djkk_create_note_column'));//DJ_�[�i�����l��
		rec2.setFieldValue('custbody_djkk_request_reference_bar',record.getFieldValue('custrecord_djkk_create_note_reference'));//DJ_���������l��
		rec2.setFieldValue('custbody_djkk_annotation_day',record.getFieldValue('custrecord_djkk_create_note_day'));//������
		rec2.setFieldValue('custbody_15699_exclude_from_ep_process',record.getFieldValue('custrecord_djkk_create_note_process'));//EXCLUDE FROM ELECTRONIC BANK PAYMENTS PROCESSING
		rec2.setFieldValue('custbody_djkk_delivery_precautions',record.getFieldValue('custrecord_djkk_create_note_precautions'));//DJ_�[�i�撍�ӎ���
		rec2.setFieldValue('custbody_djkk_customer_precautions',record.getFieldValue('custrecord_djkk_create_note_precautionss'));//DJ_�ڋq���ӎ���
		rec2.setFieldValue('custbody_djkk_shipping_instructions',record.getFieldValue('custrecord_djkk_create_note_instructflg'));//DJ_�o�׎w���ς�
		rec2.setFieldValue('custbody_djkk_delivery_address',record.getFieldValue('custrecord_djkk_create_note_deliveryadd'));//DJ_�[�i��Z��
		rec2.setFieldValue('custbody_djkk_customer_address',record.getFieldValue('custrecord_djkk_create_note_customeradd'));//DJ_�ڋq�Z��
		rec2.setFieldValue('custbody_djkk_sendmail_ready',record.getFieldValue('custrecord_djkk_create_note_ready'));// DJ_��������
		rec2.setFieldValue('custbody_djkk_shippinginfodestemail',record.getFieldValue('custrecord_djkk_create_note_destemail'));//DJ_�o�׈ē����t�惁�[��
		rec2.setFieldValue('custbody_djkk_shippinginfodestfax',record.getFieldValue('custrecord_djkk_create_note_fax'));//DJ_�o�׈ē����t��FAX
		rec2.setFieldValue('custbody_djkk_shippinginfodestname',record.getFieldValue('custrecord_djkk_create_note_destname'));//DJ_�o�׈ē����t�戶��
		rec2.setFieldValue('custbody_djkk_shippinginfodesttyp',record.getFieldValue('custrecord_djkk_create_note_desttyp'));//DJ_�o�׈ē����t��敪
		rec2.setFieldValue('custbody_djkk_shippinginfosendtyp',record.getFieldValue('custrecord_djkk_create_note_sendtyp'));//DJ_�o�׈ē����M�敪

		var subsidiary = record.getFieldValue('custrecord_djkk_create_note_subsidiary')
		if(subsidiary==SUB_NBKK || subsidiary==SUB_ULKK){
			rec2.setFieldValue('customform', '120'); //customform
		}else if(subsidiary==SUB_DPKK || subsidiary==SUB_SCETI){
			rec2.setFieldValue('customform', '112'); //customform
		}
		if(Status=='edit'){
			rec2.setFieldValue('custbody_cache_data_flag','T');//DJ_�L���b�V���f�[�^�t���O			
		}

		var count=record.getLineItemCount('recmachcustrecord_djkk_credit_note_approval');  //����
		var itemCountArray=new Array();
		for(var s=1;s<count+1;s++){
			itemCountArray.push(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id', s));//line num
		}
		itemCountArray=unique(itemCountArray);
		if(!isEmpty(createdfrom)){
			for(var s=itemCountArray.length;s>0;s--){
				rec2.removeLineItem('item', s);
			}
		}
		for(var i=0;i<itemCountArray.length;i++){
			var inc=1;
			rec2.selectNewLineItem('item');
			for(var n=1;n<count+1;n++){
				if(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id', n)==itemCountArray[i]){
					if(inc==1){
						rec2.setCurrentLineItemValue('item', 'item', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_create_note_detail_item',n));//item
						rec2.setCurrentLineItemValue('item', 'quantity', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantity',n));//����
						rec2.setCurrentLineItemValue('item', 'units', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_unit',n));//�P��
						rec2.setCurrentLineItemValue('item', 'description', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_explain',n));//DJ_����
						//20230522 changed by zhou start
						//�J�X�^�����R�[�h��id��'-1'�̃I�v�V�������T�|�[�g���Ă��܂���
						var priceCode =  record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_grid_level',n);
						if(!isEmpty(priceCode)){
							rec2.setCurrentLineItemValue('item', 'price',priceCode);//DJ_���i����
						}else{
							rec2.setCurrentLineItemValue('item', 'price',-1);//DJ_���i����
						}
						//20230522 changed by zhou end
						rec2.setCurrentLineItemValue('item', 'rate', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_rate',n));//DJ_�P��/��
						rec2.setCurrentLineItemValue('item', 'amount', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_amount',n));//DJ_���z
						rec2.setCurrentLineItemValue('item', 'taxcode', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_taxcode',n));//DJ_�ŋ��R�[�h
						rec2.setCurrentLineItemValue('item', 'taxrate1', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_rate',n));//DJ_�ŗ�
						rec2.setCurrentLineItemValue('item', 'grossamt', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_total',n));//DJ_���z
						rec2.setCurrentLineItemValue('item', 'tax1amt', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_amount',n));//DJ_�Ŋz
						rec2.setCurrentLineItemValue('item', 'costestimatetype', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_type',n));//DJ_�������ς̎��
						rec2.setCurrentLineItemValue('item', 'costestimate', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_expansion_cost',n));//DJ_�\���g���R�X�g
						rec2.setCurrentLineItemValue('item', 'estgrossprofit', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_see_profit',n));//DJ_���ϑ����v
						rec2.setCurrentLineItemValue('item', 'estgrossprofitpercent', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_gross_profit',n));//DJ_���ϑ����v�̊���
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_automatic_allocation', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_priming',n));//DJ_��������
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_customer_order_number', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custnum',n));//DJ_�ڋq�̔����ԍ�
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_temperature', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_temperature',n));//DJ_���x
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_testbook_supplement', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_test_report',n));//DJ_�������Y�t
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_sample_type', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_sample_type',n));//DJ_�T���v�����
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_rate_informatio', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_informatio',n));//DJ_���[�g���
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_commodity_english', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_english',n));//DJ_���i�p�ꖼ
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_charge_number', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_charge_number',n));//DJ_�א�				
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_ampm', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_ampm',n));//DJ_AM�EPM
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_specifications', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_specifications',n));//DJ_�K�i
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_included_document_flag', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_document_flag',n));//DJ_�������ރt���O
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_perunitquantity', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_perunitquantity',n));//DJ_����
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_casequantity', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_casequantity',n));//DJ_�P�[�X��
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_quantity', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantitys',n));//DJ_�o����
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_deliverytemptyp', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverytemptyp',n));//DJ_�z�����x�敪
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_nextshipmentdesc', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nextshipmentdesc',n));//DJ_���i����o�ח\��L�q
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_deliverynotememo', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverynotememo',n));//DJ_�[�i�����l
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_orderrequestid', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestid',n));//DJ_�����˗�ID
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_orderrequestlineno', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestlinen',n));//DJ_�˗����׍s�ԍ�
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_orderrequestquantity', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestquant',n));//DJ_�˗�����
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_partshortagetyp', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_partshortagetyp',n));//DJ_�������i�敪
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_custody_item', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custody_item',n));//DJ_�a����A�C�e��
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_wms_line_memo', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_memo',n));//DJ_�q�Ɍ������ה��l
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_finetkanaitemdescription', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_description',n));//DJ_FINET�J�i���i��
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_orderrequestdivideflg', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_divideflg',n));//DJ_�˗������σt���O
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_nuclide', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nuclide',n));//DJ_2_�j��
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_rios_user_num', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_user_num',n));//DJ_RIOS���[�U�Ǘ��ԍ�
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_rios_user_remark', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_remark',n));//DJ_RIOS���[�U���l
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_item_code', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_item_code',n));//DJ_�A�C�e��(�R�[�h)
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_orderdetailtyp', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderdetailtyp',n));//DJ_�������׏�ԋ敪
						rec2.setCurrentLineItemValue('item', 'custcol_9572_dd_file_format', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_file_format',n));//DJ_���������t�@�C���E�t�H�[�}�b�g
						rec2.setCurrentLineItemValue('item', 'custcolcustbody_djkk_quoted_amount', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quoted_amount',n));//DJ_������z(����j
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_payment_delivery', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_delivery',n));//DJ_�z���w�����̔[�i���Y�t
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_receipt_printing', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_printing',n));//DJ_��̏����
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_sample_category', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_category',n));//DJ_�T���v���i�J�e�S��
						// changed by song add 20230612 start
						rec2.setCurrentLineItemValue('item', 'location', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_location',n));//DJ_�ꏊ
						// changed by song add 20230612 end

					if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n))
							||!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail', n))){
						
						var inventoryDetail=rec2.createCurrentLineItemSubrecord('item','inventorydetail');
						inventoryDetail.selectNewLineItem('inventoryassignment');												
						if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n))){
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n));
				    	}else{
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail', n));
				    	}
						inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_shednum', n)); //DJ_�ۊǒI
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_date', n));//DJ_�L������
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot', n));//DJ_���[�J�[�������b�g�ԍ�
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_serial', n));//DJ_���[�J�[�V���A���ԍ�
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_manufacture_date', n));//DJ_�����N����
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_probably_date', n)); //DJ_�c�o�׉\����/DJ_�o�׉\������
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_warehouse_no', n));//DJ_�q�ɓ��ɔԍ�
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_smc_num', n)); //DJ_SMC�ԍ�
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_remark', n)); //DJ_���b�g���}�[�N
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_memo', n)); //DJ_���b�g����
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_inventory_quantit', n)); //	DJ_�݌ɏڍז��׍s����
				    						    	
						inventoryDetail.commitLineItem('inventoryassignment');
						inventoryDetail.commit();
					}
					}else{
						if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n))
								||!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail', n))){
							var inventoryDetail=rec2.createCurrentLineItemSubrecord('item','inventorydetail');
							inventoryDetail.selectNewLineItem('inventoryassignment');												
							if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n))){
					    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n));
					    	}else{
					    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail', n));
					    	}
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_shednum', n)); //DJ_�ۊǒI
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_date', n));//DJ_�L������
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot', n));//DJ_���[�J�[�������b�g�ԍ�
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_serial', n));//DJ_���[�J�[�V���A���ԍ�
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_manufacture_date', n));//DJ_�����N����
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_probably_date', n)); //DJ_�c�o�׉\����/DJ_�o�׉\������
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_warehouse_no', n));//DJ_�q�ɓ��ɔԍ�
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_smc_num', n)); //DJ_SMC�ԍ�
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_remark', n)); //DJ_���b�g���}�[�N
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_memo', n)); //DJ_���b�g����
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_inventory_quantit', n)); //	DJ_�݌ɏڍז��׍s����
					    						    	
							inventoryDetail.commitLineItem('inventoryassignment');
							inventoryDetail.commit();
						}		
					}
					inc++;
				}	
				
			}
			rec2.commitLineItem('item');
		}
		var rec2id = nlapiSubmitRecord(rec2,false,true);
		if(Status=='approval'){
			nlapiSubmitField('customrecord_djkk_credit_note_approval',recId, 'custrecord_djkk_credit_creditmemo', rec2id); //DJ_�N���W�b�g����
			nlapiSubmitField('customrecord_djkk_credit_note_approval',recId, 'custrecord_djkk_credit_creat_status', 1); //DJ_�N���W�b�g�����쐬�X�e�[�^�X
			nlapiSetRedirectURL('RECORD', 'creditmemo',rec2id, 'VIEW');
		}
		if(Status=='edit'){
			nlapiSubmitField('customrecord_djkk_credit_note_approval',recId, 'custrecord_djkk_credit_creditmemo', rec2id);//DJ_�N���W�b�g���� 20230616 add by zhou
//			nlapiSubmitField('customrecord_djkk_credit_note_approval',recId, 'custrecord_djkk_credit_note_edit_status', rec2id);//DJ_���s�X�e�[�^�X 
			var delRecord=nlapiCreateRecord('customrecord_djkk_transact_data_delete');
			delRecord.setFieldValue('custrecord_djkk_del_trantype', '�N���W�b�g����');
			delRecord.setFieldValue('custrecord_djkk_del_recordtype', 'creditmemo');
			delRecord.setFieldValue('custrecord_djkk_del_internalid', rec2id);
			delRecord.setFieldValue('custrecord_djkk_del_url', nlapiResolveURL('RECORD', 'creditmemo',rec2id, 'VIEW'));
			nlapiSubmitRecord(delRecord);
		}
		response.write(rec2id);
	}
	}
	catch(e){
	    nlapiLogExecution('debug', '�G���[', e);
		nlapiLogExecution('debug', '�G���[', e.message);
		//20230522 changed by zhou start  running error : upload to the custrecord
//		nlapiSubmitField('customrecord_djkk_credit_note_approval',recId, 'custrecord_djkk_credit_creat_status', 2); //DJ_�N���W�b�g�����쐬�X�e�[�^�X
//		response.write('F');	
		var record = nlapiLoadRecord('customrecord_djkk_credit_note_approval',recId);
		record.setFieldValue('custrecord_djkk_create_note_error',e.message);	
		nlapiSubmitRecord(record, false, true);		
		response.write('�ُ픭��:'+ e.message);
		//20230522 changed by zhou end
		
	}
}