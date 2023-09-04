/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
var saveType='';
function clientPageInit(type){
	saveType=type;
	if(nlapiGetFieldValue('customform')=='178'){
		nlapiSetFieldValue('custbody_djkk_trans_appr_deal_flg', 'T');
	}
	if(nlapiGetFieldValue('customform')=='120'){
		if(type == 'create' || type == 'copy') {
			nlapiSetFieldValue('custbody_djkk_invoice_cirdit_flg','creditmemo')
		}
		if(type == 'edit'){
			if(isEmpty(nlapiGetFieldValue('custbody_djkk_invoice_cirdit_flg'))){
				nlapiSetFieldValue('custbody_djkk_invoice_cirdit_flg','creditmemo')
			}
		}
	}
	if(type=='edit'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'){
		setButtunButtonDisable('tbl__cancel');
		setButtunButtonDisable('tbl_secondary_cancel');
		setButtunButtonDisable('spn_CREATENEW_d1');
		setButtunButtonDisable('spn_secondaryCREATENEW_d1');		
		setButtunButtonDisable('spn_ACTIONMENU_d1');
		setButtunButtonDisable('spn_secondaryACTIONMENU_d1');		
	}
	// CH533 zheng 20230524 start
//	if(type == 'copy'||(type == 'create' && !isEmpty('createdfrom'))){
//		//copy�̏ꍇ�A���[�N�t���[�����̓N���A���Ă�������
////		nlapiSetFieldValue('custbody_djkk_trans_appr_deal_flg',''); //DJ_���F�����t���O
//		nlapiSetFieldValue('custbody_djkk_trans_appr_status'); //DJ_���F�X�e�[�^�X
//		nlapiSetFieldValue('custbody_djkk_trans_appr_create_user'); //DJ_�쐬��
//		nlapiSetFieldValue('custbody_djkk_trans_appr_create_role'); //DJ_�쐬���[��
//		
//		nlapiSetFieldValue('custbody_djkk_trans_appr_dev','');  //DJ_���F���샍�[��
//		nlapiSetFieldValue('custbody_djkk_trans_appr_dev_user',''); //DJ_���F�����
//		nlapiSetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt','');  //DJ_���F�������
//		nlapiSetFieldValue('custbody_djkk_trans_appr_user',''); //DJ_���̏��F��
//		nlapiSetFieldValue('custbody_djkk_trans_appr_cdtn_amt',''); //DJ_���̏��F����
//		nlapiSetFieldValue('custbody_djkk_trans_appr1_role',''); //DJ_��ꏳ�F���[��
//		nlapiSetFieldValue('custbody_djkk_trans_appr1_user',''); //DJ_��ꏳ�F��
//		nlapiSetFieldValue('custbody_djkk_trans_appr2_role','');//DJ_��񏳔F���[��
//		nlapiSetFieldValue('custbody_djkk_trans_appr2_user',''); //DJ_��񏳔F��
//		
//		nlapiSetFieldValue('custbody_djkk_trans_appr3_role',''); //DJ_��O���F���[��
//		nlapiSetFieldValue('custbody_djkk_trans_appr3_user',''); //DJ_��O���F��
//		nlapiSetFieldValue('custbody_djkk_trans_appr4_role','');//DJ_��l���F���[��
//		nlapiSetFieldValue('custbody_djkk_trans_appr4_user','');//DJ_��l���F��
//		nlapiSetFieldValue('custbody_djkk_approval_reset_memo',''); //DJ_���F���߃���
//		nlapiSetFieldValue('custbody_djkk_approval_kyaltuka_memo',''); //DJ_���F�p������
//	}
	// CH533 zheng 20230524 start
}




function clientFieldChanged(type, name, linenum) {
	//20230207 add by zhou start CH320
	// DJ_�[�i��/�ڋq
	if((name == 'custbody_djkk_delivery_destination'||name == 'entity') && nlapiGetFieldValue('customform')== '120' ){
		var destinationID = nlapiGetFieldValue('custbody_djkk_delivery_destination');
		var entityId = nlapiGetFieldValue('entity');
		var cust=nlapiGetFieldValue('customform'); 
		if (name == 'custbody_djkk_delivery_destination') {
			if (!isEmpty(destinationID)) {
				var destinationRecord = nlapiLookupField('customrecord_djkk_delivery_destination', destinationID,['custrecord_djkk_customer','custrecord_djkk_sales','custrecord_djkk_prefectures','custrecord_djkk_municipalities','custrecord_djkk_delivery_residence','custrecord_djkk_delivery_residence2','custrecord_djkk_language_napin']);
				var customerID = destinationRecord.custrecord_djkk_customer;
				var salesID = destinationRecord.custrecord_djkk_sales;
				if (!isEmpty(customerID)) {
					nlapiSetFieldValue('entity', customerID,false,true);
					nlapiSetFieldValue('custbody_djkk_delivery_destination', destinationID,false,true);
				}
				
				if (!isEmpty(salesID)) {
					nlapiSetFieldValue('salesrep', salesID,false,true);
				}
			}
		}
		if(!isEmpty(destinationID)){
			var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destinationID); // DJ_�[�i��record
		}
		if(!isEmpty(nlapiGetFieldValue('entity'))){
			var custRecord = nlapiLoadRecord('customer',nlapiGetFieldValue('entity'));
		}
		var deliverySendMailFlag = false;
		if(!isEmpty(destinationID)){
				var deliveryPeriod = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_period');//DJ_�[�i�����M���@
				var deliverySiteFd = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_site_fd');//DJ_�[�i�����M��
				var deliveryPerson = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person');//DJ_�[�i�����M��S����
				var deliverySubName = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_subname');//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
				var deliveryPersont = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person_t');//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
				var deliveryEmail = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_email');//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
				var deliveryFax = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_fax_three');//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
				var deliveryMemo = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_memo');//DJ_�[�i���������M���t����l
//				if(!isEmpty(deliveryPeriod)&& (deliveryPeriod !='10')&& (deliveryPeriod != '9')){
				    if(!isEmpty(deliveryPeriod)&& (deliveryPeriod != '9')){
					nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_�[�i�����M���@
					nlapiSetFieldValue('custbody_djkk_delivery_book_site_fd', deliverySiteFd,false);//DJ_�[�i�����M��
					nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);//DJ_�[�i�����M��S����
					nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo);//DJ_�[�i���������M���l  custbody_djkk_reference_column
				}else if(!isEmpty(deliveryPeriod) && (deliveryPeriod == '9')){
					deliverySendMailFlag = true;
					customerSendmails(deliverySendMailFlag,custRecord);
				}
		}else{
			deliverySendMailFlag = true;
			customerSendmails(deliverySendMailFlag,custRecord);
		}
		var newEntityId = nlapiGetFieldValue('entity');
		if(!isEmpty(newEntityId)){
			custRecord = nlapiLookupField('customer', newEntityId,['custentity_djkk_invoice_book_period','custentity_djkk_invoice_book_site']);
			var invoicePeriod = custRecord.custentity_djkk_invoice_book_period;//DJ_���������M�敪
			var invoiceSite = custRecord.custentity_djkk_invoice_book_site;//DJ_���������M��敪
			nlapiSetFieldValue('custbody_djkk_invoice_book_period', invoicePeriod,false);
			nlapiSetFieldValue('custbody_djkk_invoice_book_site', invoiceSite,false);
		}
	}	
	if( name == 'custbody_djkk_delivery_book_site_fd'){
		var destination = nlapiGetFieldValue('custbody_djkk_delivery_destination') // �[�i��
		var entity = nlapiGetFieldValue('entity') // �ڋq
		var custForm = nlapiGetFieldValue('customform');
		if(custForm = '175'){  //fd
			if(!isEmpty(destination)){
				var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destination); // DJ_�[�i��record
			}
			if(!isEmpty(entity)){
				var custRecord = nlapiLoadRecord('customer',entity);
			}
			var deliverySite = nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd');   //DJ_�[�i�����M��
			if(deliverySite == '15'){   //DJ_�[�i�����M�� =�[�i��
				if(isEmpty(destination)){
					alert("DJ_�[�i������I�т�������")
					return false;
				}else{
					deliverySendMailChangeFormDelivery(deliveryRecord)
				}
			}else if(deliverySite == '16'){//DJ_�[�i�����M�� =�ڋq��
				if(isEmpty(entity)){
					alert("�ڋq�����I�т�������")
					return false;
				}else{
					deliverySendMailChangeFormCustomer(custRecord)
					}
			}else if(deliverySite == '14'){ //DJ_�[�i�����M�� =3rd
				if(!isEmpty(destination) || !isEmpty(entity)){
					if(!isEmpty(destination)){
					deliverySendMailChangeFormDelivery(deliveryRecord)
					}else{
					deliverySendMailChangeFormCustomer(custRecord)	
					}
				}
			}
		}	
	}
	//20230207 add by zhou end CH320
	if(name == 'entity'){
		var subsidiary = nlapiGetFieldValue('subsidiary');
		
		if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
			var entity = nlapiGetFieldValue('entity');
			
			var department = nlapiLookupField('customer', entity, 'custentity_djkk_activity');
			
			nlapiSetFieldValue('department',department);
		}
	}
	//add by zzq  20230703 CH699 start
	if(name=='custbody_djkk_delivery_date'){
        requestday=nlapiGetFieldValue('custbody_djkk_delivery_date');
        nlapiSetFieldValue('trandate',requestday, false, true); 
    }
	//add by zzq  20230703 CH699 end
}

//20221018 add by zhou start
//�ԓ`-�[�i��PDF�o��
function pdfMaker(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_receipt_pdf','customdeploy_djkk_receipt_pdf');
	theLink+='&creditmemo='+nlapiGetRecordId();
	theLink+='&flag='+"creditmemo";
	window.open(theLink);
}
//20221018 add by zhou end

//20230129 add by zhou start
//�ʐ�����PDF�o��
function invoicesPdfMaker(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_pdfmaker','customdeploy_djkk_sl_invoice_pdfmaker');
	theLink+='&creditmemoId='+nlapiGetRecordId();
	theLink+='&type='+'creditmemo';
	window.open(theLink);
}
//20230129 add by zhou start

function csclientSaveRecord(){
	//20230129 add by zhou start CH297 
	if(nlapiGetFieldValue('customform')== '178' || nlapiGetFieldValue('customform')== '120' ){
		var otherrefnum  = nlapiGetFieldValue('otherrefnum');//�������ԍ�
		if(!isEmpty(otherrefnum)){
			nlapiSetFieldValue('custbody_djkk_customerorderno',otherrefnum);//DJ_��������ԍ� 
		}
	}
	 
	//20230130 add by song start U587 
	if(nlapiGetFieldValue('customform')== '120'){
		var shipping_typ  = nlapiGetFieldValue('custbody_djkk_finet_shipping_typ');//DJ_FINET�o�׋敪
		var delivery_destination = nlapiGetFieldValue('custbody_djkk_delivery_destination');//�[�i��
		var invFlag=nlapiGetFieldValue('custbody_4392_includeids');
		if (invFlag=='T') {
			if(isEmpty(shipping_typ)){
				if(confirm('DJ_FINET�o�׋敪��ݒ肵�Ă��������B')){
				}else{
					return false;
				}
			}
		}
		
		if(!isEmpty(shipping_typ)){
			if(isEmpty(delivery_destination)){
				if(confirm('DJ_�[�i���ݒ肵�Ă��������B')){
				}else{
					return false;
				}
			}
		}
	}
	//20230130 add by song end U587 
	//end
//	if((saveType=='create'||saveType=='copy')&&nlapiGetFieldValue('customform')== '178'){
//		try{
//			
//			var record=nlapiCreateRecord('customrecord_djkk_credit_note_approval');	//DJ_�N���W�b�g�������F���
//			
//			// ��v���
//			record.setFieldValue('customform', '188');
//			record.setFieldValue('custrecord_djkk_create_note_subsidiary', nlapiGetFieldValue('subsidiary')); //DJ_�q���
//			
//			record.setFieldValue('custrecord_djkk_create_note_tranid', nlapiGetFieldValue('tranid'));  //�����ԍ�
//			record.setFieldValue('custrecord_djkk_credit_note_customer', nlapiGetFieldValue('entity')); //�ڋq
//			record.setFieldValue('custrecord_djkk_create_note_date', nlapiGetFieldValue('trandate')); //���t
//			record.setFieldValue('custrecord_djkk_create_postingperiod', nlapiGetFieldValue('postingperiod')); //�L������
//			record.setFieldValue('custrecord_djkk_create_note_otherrefnum', nlapiGetFieldValue('otherrefnum')); //�������ԍ�
//			record.setFieldValue('custrecord_djkk_create_note_memo', nlapiGetFieldValue('memo')); //����
//			record.setFieldValue('custrecord_djkk_credit_note_usertotal', nlapiGetFieldValue('total'));//20230524 add by zhou���z(���v)
//			record.setFieldValue('custrecord_djkk_credit_note_createdfrom', nlapiGetFieldValue('createdfrom'));//�쐬��
//			
//			//�o��tab
//			record.setFieldValue('custrecord_djkk_create_note_operator', nlapiGetFieldValue('shipcarrier')); //DJ_�z���Ǝ�
//			record.setFieldValue('custrecord_djkk_create_note_method', nlapiGetFieldValue('shipmethod')); //DJ_�z�����@
//			record.setFieldValue('custrecord_djkk_create_note_tax_code', nlapiGetFieldValue('shippingtaxcode')); //DJ_�z�����̐ŋ��R�[�h
//			record.setFieldValue('custrecord_djkk_create_note_fee_code', nlapiGetFieldValue('handlingtaxcode')); //DJ_�萔���̐ŋ��R�[�h
//			record.setFieldValue('custrecord_djkk_create_note_materials', nlapiGetFieldValue('shippingcost')); //DJ_�z����
//			record.setFieldValue('custrecord_djkk_create_note_by_hand', nlapiGetFieldValue('handlingcost')); //DJ_�萔��
//			record.setFieldValue('custrecord_djkk_create_note_medesc', nlapiGetFieldValue('custbody_djkk_deliverytimedesc')); //DJ_�[�����ԑыL�q
//			record.setFieldValue('custrecord_djkk_create_note_registflg', nlapiGetFieldValue('custbody_djkk_deliverynotregistflg')); //DJ_�[���斢�o�^�t���O
//			//��vtab
//			record.setFieldValue('custrecord_djkk_create_note_accounts', nlapiGetFieldValue('account')); //DJ_����Ȗ�
//			record.setFieldValue('custrecord_djkk_create_note_currency', nlapiGetFieldValue('currency')); //DJ_�ʉ�
//			record.setFieldValue('custrecord_djkk_create_note_exchange_rat', nlapiGetFieldValue('exchangerate')); //DJ_�בփ��[�g
//			record.setFieldValue('custrecord_djkk_create_note_cost', nlapiGetFieldValue('totalcostestimate')); //DJ_�\���g���R�X�g
//			record.setFieldValue('custrecord_djkk_create_note_profit', nlapiGetFieldValue('estgrossprofit')); //DJ_���ϑ����v
//			record.setFieldValue('custrecord_djkk_create_note_gross_profit', nlapiGetFieldValue('estgrossprofitpercent')); //DJ_���ϑ����v�̊���
//			
//			
//			//���[���������M
//			record.setFieldValue('custrecord_djkk_cn_is_period', nlapiGetFieldValue('custbody_djkk_invoice_book_period'));//DJ_���������M�敪
//			record.setFieldValue('custrecord_djkk_cn_is_book_site', nlapiGetFieldValue('custbody_djkk_invoice_book_site'));//DJ_���������M��敪
//			record.setFieldValue('custrecord_djkk_cn_is_book_person', nlapiGetFieldValue('custbody_djkk_invoice_book_person'));//DJ_���������M��S����
//			record.setFieldValue('custrecord_djkk_cn_is_book_subname', nlapiGetFieldValue('custbody_djkk_invoice_book_subname'));//DJ_���������M���Ж� (3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_is_book_person_t', nlapiGetFieldValue('custbody_djkk_invoice_book_person_t'));//DJ_���������M��S����(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_is_automatic_mailtr', nlapiGetFieldValue('custbody_djkk_invoice_automatic_mailtr'));//DJ_���������M�惁�[��(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_is_automatic_faxtrd', nlapiGetFieldValue('custbody_djkk_invoice_automatic_faxtrd'));//DJ_���������M��FAX(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_is_destination_regi', nlapiGetFieldValue('custbody_djkk_invoice_destination_regi'));//DJ_���������M��o�^����
//			
//			record.setFieldValue('custrecord_djkk_cn_de_period', nlapiGetFieldValue('custbody_djkk_delivery_book_period'));//DJ_���i����[�i�����M�敪
//			record.setFieldValue('custrecord_djkk_cn_de_site_fd', nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd'));//DJ_���i����[�i�����M��敪
//			record.setFieldValue('custrecord_djkk_cn_de_person', nlapiGetFieldValue('custbody_djkk_delivery_book_person'));//DJ_���i����[�i�����M��S����
//			record.setFieldValue('custrecord_djkk_cn_de_subname', nlapiGetFieldValue('custbody_djkk_delivery_book_subname'));//DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_de_person_t', nlapiGetFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_de_email', nlapiGetFieldValue('custbody_djkk_delivery_book_email'));//DJ_���i����[�i�����M�惁�[��(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_de_fax_three', nlapiGetFieldValue('custbody_djkk_delivery_book_fax_three'));//DJ_���i����[�i�����M��FAX(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_de_memo_so', nlapiGetFieldValue('custbody_djkk_delivery_book_memo_so'));//DJ_���i����[�i�����M��o�^����
//			
//			record.setFieldValue('custrecord_djkk_cn_int_period', nlapiGetFieldValue('custbody_djkk_totalinv_period'));//DJ_���v���������M�敪
//			record.setFieldValue('custrecord_djkk_cn_int_sendtype', nlapiGetFieldValue('custbody_djkk_totalinv_sendtype'));//DJ_���v���������M��敪
//			record.setFieldValue('custrecord_djkk_cn_int_sendcharge', nlapiGetFieldValue('custbody_djkk_totalinv_sendcharge'));//DJ_���v���������M��S����
//			record.setFieldValue('custrecord_djkk_cn_int_sendsub3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendsub3rd'));//DJ_���v���������M���Ж�(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_int_sendcharge3rd', nlapiGetFieldValue('custbody_djkk_totalin_sendcharge3rd'));//DJ_���v���������M��S����(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_int_sendmail3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendmail3rd'));//DJ_���v���������M�惁�[��(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_int_sendfax3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendfax3rd'));//DJ_���v���������M��FAX(3RD�p�[�e�B�[)
//			record.setFieldValue('custrecord_djkk_cn_int_sendmemo', nlapiGetFieldValue('custbody_djkk_totalinv_sendmemo'));//DJ_���v���������M��o�^����
//
//			// �̔����
//			record.setFieldValue('custrecord_djkk_create_note_salesrep', nlapiGetFieldValue('salesrep')); //DJ_�c�ƒS����
//			record.setFieldValue('custrecord_djkk_create_saleseffectivedat', nlapiGetFieldValue('saleseffectivedate')); //DJ_�R�~�b�V�������
//			
//			// ���F���
//			var roleValue = nlapiGetRole();
//			var userValue = nlapiGetUser();
//				
//			var subsidiary = nlapiGetFieldValue('subsidiary');
//			var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//�g�����U�N�V�������F�Ǘ��\
//					[
//					   ["isinactive","is","F"], 
//					   "AND", 
//					   ["custrecord_djkk_trans_appr_obj","anyof",5],
//					   "AND",
//					   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
//					], 
//					[
//					   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //�쐬���[��
//					   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //��ꏳ�F���[��
//					   
//					]
//					);
//			if(!isEmpty(approvalSearch)){
//				for(var j = 0; j < approvalSearch.length; j++){
//					var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//�쐬���[��
//					var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//��ꏳ�F���[��
//					if(createRole == roleValue){
//						record.setFieldValue('custrecord_djkk_create_note_createrole',createRole);//DJ_�쐬���[��
//						record.setFieldValue('custrecord_djkk_create_note_autho_role',appr1_role); //DJ_���̏��F���[��
//					}
//				}
//			}
//			record.setFieldValue('custrecord_djkk_create_note_flg', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg')); //DJ_���F�����t���O
//			record.setFieldValue('custrecord_djkk_create_note_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status')); //DJ_���F�X�e�[�^�X
//			record.setFieldValue('custrecord_djkk_create_note_createuser', userValue); //DJ_�쐬��
//
//			record.setFieldValue('custrecord_djkk_create_note_oper_roll', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));  //DJ_���F���샍�[��
//			record.setFieldValue('custrecord_djkk_create_note_acknowledge', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user')); //DJ_���F�����
//			record.setFieldValue('custrecord_djkk_create_note_opera_condit', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));  //DJ_���F�������
//			record.setFieldValue('custrecord_djkk_create_note_next_approve', nlapiGetFieldValue('custbody_djkk_trans_appr_user')); //DJ_���̏��F��
//			record.setFieldValue('custrecord_djkk_create_note_appro_criter', nlapiGetFieldValue('custbody_djkk_trans_appr_cdtn_amt')); //DJ_���̏��F����
//			record.setFieldValue('custrecord_djkk_create_note_first_role', nlapiGetFieldValue('custbody_djkk_trans_appr1_role')); //DJ_��ꏳ�F���[��
//			record.setFieldValue('custrecord_djkk_create_note_first_user', nlapiGetFieldValue('custbody_djkk_trans_appr1_user')); //DJ_��ꏳ�F��
//			record.setFieldValue('custrecord_djkk_create_note_second_role', nlapiGetFieldValue('custbody_djkk_trans_appr2_role'));//DJ_��񏳔F���[��
//			record.setFieldValue('custrecord_djkk_create_note_second_user', nlapiGetFieldValue('custbody_djkk_trans_appr2_user')); //DJ_��񏳔F��
//			
//			record.setFieldValue('custrecord_djkk_create_note_third_role', nlapiGetFieldValue('custbody_djkk_trans_appr3_role')); //DJ_��O���F���[��
//			record.setFieldValue('custrecord_djkk_create_note_third_user', nlapiGetFieldValue('custbody_djkk_trans_appr3_user')); //DJ_��O���F��
//			record.setFieldValue('custrecord_djkk_create_note_fourth_role', nlapiGetFieldValue('custbody_djkk_trans_appr4_role')); //DJ_��l���F���[��
//			record.setFieldValue('custrecord_djkk_create_note_fourth_uesr', nlapiGetFieldValue('custbody_djkk_trans_appr4_user')); //DJ_��l���F��
//			record.setFieldValue('custrecord_djkk_create_note_rever_memo', nlapiGetFieldValue('custbody_djkk_approval_reset_memo')); //DJ_���F���߃���
//			record.setFieldValue('custrecord_djkk_approval_kyaltuka_memo', nlapiGetFieldValue('custbody_djkk_approval_kyaltuka_memo')); //DJ_���F�p������ // 20230522 add by zhou
//			// ����
////			record.setFieldValue('custrecord_djkk_create_note_subsidiary', nlapiGetFieldValue('subsidiary')); //DJ_�q���
//			record.setFieldValue('custrecord_djkk_create_note_department', nlapiGetFieldValue('department')); //�Z�N�V����
//			record.setFieldValue('custrecord_djkk_create_note_bulkprocsubm', nlapiGetFieldValue('bulkprocsubmission')); //���MID
//			// CH144 zheng 20230516 start
//			// record.setFieldValue('custrecord_djkk_create_note_rate_s1', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s1')); //DJ_��1�\�񃌁[�g
//			// CH144 zheng 20230516 end
//			record.setFieldValue('custrecord_djkk_create_note_opc_flg', nlapiGetFieldValue('custbody_djkk_exsystem_opc_flg')); //DJ_�O������̍σt���O
//			record.setFieldValue('custrecord_djkk_create_note_date_time', nlapiGetFieldValue('custbody_djkk_exsystem_send_date_time')); //DJ_�O���V�X�e�����M����
//			record.setFieldValue('custrecord_djkk_create_note_includeids', nlapiGetFieldValue('custbody_4392_includeids')); //���ߐ������Ɋ܂߂�
//			record.setFieldValue('custrecord_djkk_create_note_sales', nlapiGetFieldValue('custbody_djkk_company_sales')); //DJ_�Д̑Ώ�
//			record.setFieldValue('custrecord_djkk_create_note_end_user', nlapiGetFieldValue('custbody_djkk_end_user')); //DJ_�G���h���[�U�[
//			record.setFieldValue('custrecord_djkk_create_note_destination', nlapiGetFieldValue('custbody_djkk_delivery_destination')); //DJ_�[�i��
//			record.setFieldValue('custrecord_djkk_create_note_conditions', nlapiGetFieldValue('custbody_djkk_payment_conditions')); //DJ_�x������
//			record.setFieldValue('custrecord_djkk_create_note_registration', nlapiGetFieldValue('custbody_djkk_gst_registration')); //DJ_GST�o�^�ԍ�
//			record.setFieldValue('custrecord_djkk_create_note_deliverynote', nlapiGetFieldValue('custbody_djkk_deliverynote')); //DJ_�[�i���������M
//			record.setFieldValue('custrecord_djkk_create_note_instructions', nlapiGetFieldValue('custbody_djkk_shipping_instructions_f')); //DJ_�o�׎w��
//			record.setFieldValue('custrecord_djkk_create_note_person', nlapiGetFieldValue('custbody_djkk_shipment_person')); //DJ_�o�גS����
//			record.setFieldValue('custrecord_djkk_create_note_location', nlapiGetFieldValue('location')); //DJ_�ꏊ
//			record.setFieldValue('custrecord_djkk_create_note_methodtyp', nlapiGetFieldValue('custbody_djkk_paymentmethodtyp')); //DJ_�x�����@�敪
//			record.setFieldValue('custrecord_djkk_create_note_deliveryrule', nlapiGetFieldValue('custbody_djkk_deliveryruledesc')); //DJ_�[���斈�݌Ɉ�������
//			record.setFieldValue('custrecord_djkk_create_note_cautiondesc', nlapiGetFieldValue('custbody_djkk_cautiondesc')); //DJ_���ӎ���
//			record.setFieldValue('custrecord_djkk_create_note_wmsmemo1', nlapiGetFieldValue('custbody_djkk_wmsmemo1')); //DJ_�q�Ɍ������l�P
//			record.setFieldValue('custrecord_djkk_create_note_deliverermem', nlapiGetFieldValue('custbody_djkk_deliverermemo1')); //DJ_�^����Ќ������l
//			record.setFieldValue('custrecord_djkk_create_note_deliverymemo', nlapiGetFieldValue('custbody_djkk_deliverynotememo')); //DJ_�[�i�����l
//			record.setFieldValue('custrecord_djkk_create_note_orderrequeid', nlapiGetFieldValue('custbody_djkk_orderrequestid')); //DJ_�����˗�ID
//			record.setFieldValue('custrecord_djkk_create_note_netflg', nlapiGetFieldValue('custbody_djkk_netsuitetransflg')); //DJ_NETSUITE�A�g�t���O
//			record.setFieldValue('custrecord_djkk_create_note_nstructdt', nlapiGetFieldValue('custbody_djkk_shippinginstructdt')); //DJ_�o�׎w������
//			record.setFieldValue('custrecord_djkk_create_note_merorderno', nlapiGetFieldValue('custbody_djkk_customerorderno')); //DJ_��������ԍ�
//			record.setFieldValue('custrecord_djkk_create_note_ingsaleflg', nlapiGetFieldValue('custbody_djkk_consignmentbuyingsaleflg')); //DJ_�����d������t���O
//			record.setFieldValue('custrecord_djkk_create_note_hopedate', nlapiGetFieldValue('custbody_djkk_delivery_hopedate')); //DJ_�[�i��]��
//			record.setFieldValue('custrecord_djkk_create_note_class', nlapiGetFieldValue('class')); //�u�����h
//			record.setFieldValue('custrecord_djkk_create_note_wmsmemo2', nlapiGetFieldValue('custbody_djkk_wmsmemo2')); //DJ_�q�Ɍ������l�Q
//			record.setFieldValue('custrecord_djkk_create_note_wmsmemo3', nlapiGetFieldValue('custbody_djkk_wmsmemo3')); //DJ_�q�Ɍ������l3
//			record.setFieldValue('custrecord_djkk_create_note_send', nlapiGetFieldValue('custbody_djkk_warehouse_sent')); //DJ_�q�ɑ��M�ς�
//			record.setFieldValue('custrecord_djkk_create_note_coname', nlapiGetFieldValue('custbody_djkk_finetkanaofferconame')); //DJ_FINET�J�i�񋟊�Ɩ�
//			record.setFieldValue('custrecord_djkk_create_note_cooffice', nlapiGetFieldValue('custbody_djkk_finetkanaoffercooffice')); //DJ_FINET�J�i�񋟊�ƎQ�Ǝ��Ə���
//			record.setFieldValue('custrecord_djkk_create_note_stomername', nlapiGetFieldValue('custbody_djkk_finetkanacustomername')); //DJ_FINET�J�i�Ж��E�X���E����於
//			record.setFieldValue('custrecord_djkk_create_note_address', nlapiGetFieldValue('custbody_djkk_finetkanacustomeraddress')); //DJ_FINET�J�i�Z��
//			record.setFieldValue('custrecord_djkk_create_note_invflg', nlapiGetFieldValue('custbody_djkk_invoicetotal_flag')); //DJ_���v�������쐬�ς݃t���O
//			record.setFieldValue('custrecord_djkk_create_note_base_date', nlapiGetFieldValue('custbody_djkk_rios_base_date')); //DJ_RIOS���
//			record.setFieldValue('custrecord_djkk_create_note_netsuitetran', nlapiGetFieldValue('custbodycustbody_djkk_netsuitetransdt')); //DJ_NETSUITE�A�g����
//			record.setFieldValue('custrecord_djkk_create_note_language', nlapiGetFieldValue('custbody_djkk_language')); //DJ_����
//			record.setFieldValue('custrecord_djkk_create_note_ids_date', nlapiGetFieldValue('custbody_suitel10n_jp_ids_date')); //���ߐ���������
//			record.setFieldValue('custrecord_djkk_create_note_due_date', nlapiGetFieldValue('custbody_jp_invoice_summary_due_date')); //DJ_INVOICE SUMMARY DUE DATE
//			record.setFieldValue('custrecord_djkk_create_note_delivererme2', nlapiGetFieldValue('custbody_djkk_deliverermemo2')); //DJ_�^����Ќ������l2
//			// CH144 zheng 20230516 start
//			//record.setFieldValue('custrecord_djkk_create_note_rate_yen', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_yen')); //DJ_�~�ݎx��
//			//record.setFieldValue('custrecord_djkk_create_note_rate_s2', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s2')); //DJ_��2�\�񃌁[�g
//			//record.setFieldValue('custrecord_djkk_create_note_rate_s3', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s3')); //DJ_��3�\�񃌁[�g
//			//record.setFieldValue('custrecord_djkk_create_note_rate_f', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_f')); //DJ_�O�ݎx���f�[�^�쐬
//			// CH144 zheng 20230516 end
//			record.setFieldValue('custrecord_djkk_create_note_delive', nlapiGetFieldValue('custbody_djkk_reference_delive')); //DJ_�[���񓚔��l��
//			record.setFieldValue('custrecord_djkk_create_note_column', nlapiGetFieldValue('custbody_djkk_reference_column')); //DJ_�[�i�����l��
//			record.setFieldValue('custrecord_djkk_create_note_reference', nlapiGetFieldValue('custbody_djkk_request_reference_bar')); //DJ_���������l��
//			record.setFieldValue('custrecord_djkk_create_note_day', nlapiGetFieldValue('custbody_djkk_annotation_day')); //DJ_������
//			record.setFieldValue('custrecord_djkk_create_note_process', nlapiGetFieldValue('custbody_15699_exclude_from_ep_process')); //EXCLUDE FROM ELECTRONIC BANK PAYMENTS PROCESSING
//			record.setFieldValue('custrecord_djkk_create_note_precautions', nlapiGetFieldValue('custbody_djkk_delivery_precautions')); //DJ_�[�i�撍�ӎ���
//			record.setFieldValue('custrecord_djkk_create_note_precautionss', nlapiGetFieldValue('custbody_djkk_customer_precautions')); //DJ_�ڋq���ӎ���	
//			record.setFieldValue('custrecord_djkk_create_note_instructflg', nlapiGetFieldValue('custbody_djkk_shipping_instructions')); // DJ_�o�׎w���ς�
//			record.setFieldValue('custrecord_djkk_create_note_deliveryadd', nlapiGetFieldValue('custbody_djkk_delivery_address')); //DJ_�[�i��Z��
//			record.setFieldValue('custrecord_djkk_create_note_customeradd', nlapiGetFieldValue('custbody_djkk_customer_address')); //DJ_�ڋq�Z��
//			record.setFieldValue('custrecord_djkk_create_note_ready', nlapiGetFieldValue('custbody_djkk_sendmail_ready')); //DJ_��������
//			record.setFieldValue('custrecord_djkk_create_note_destemail', nlapiGetFieldValue('custbody_djkk_shippinginfodestemail')); //DJ_�o�׈ē����t�惁�[��
//			record.setFieldValue('custrecord_djkk_create_note_fax', nlapiGetFieldValue('custbody_djkk_shippinginfodestfax')); //DJ_�o�׈ē����t��FAX
//			record.setFieldValue('custrecord_djkk_create_note_destname', nlapiGetFieldValue('custbody_djkk_shippinginfodestname')); //DJ_�o�׈ē����t�戶��
//			record.setFieldValue('custrecord_djkk_create_note_desttyp', nlapiGetFieldValue('custbody_djkk_shippinginfodesttyp')); //DJ_�o�׈ē����t��敪
//			record.setFieldValue('custrecord_djkk_create_note_sendtyp', nlapiGetFieldValue('custbody_djkk_shippinginfosendtyp')); //DJ_�o�׈ē����M�敪
//
//			var counts=nlapiGetLineItemCount('item');
//			for(var i=1;i<counts+1;i++){
//				nlapiSelectLineItem('item', i);
//				var inventoryDetail=nlapiViewCurrentLineItemSubrecord('item','inventorydetail');
//				if(!isEmpty(inventoryDetail)){
//					var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
//					for(var m = 1 ; m < invCount+1 ; m++){
//						inventoryDetail.selectLineItem('inventoryassignment', m);
//						record.selectNewLineItem('recmachcustrecord_djkk_credit_note_approval');
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id',i); //DJ_�N���W�b�g�������׍s�ԍ�
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_create_note_detail_item',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_�A�C�e��
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantity',nlapiGetCurrentLineItemValue('item', 'quantity'));//DJ_����
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_unit',nlapiGetCurrentLineItemValue('item', 'units'));//DJ_�P��
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_explain',nlapiGetCurrentLineItemValue('item', 'description'));//DJ_����
//						//20230522 changed by zhou start
//						//�J�X�^�����R�[�h��id��'-1'�̃I�v�V�������T�|�[�g���Ă��܂���
//						var priceCode = nlapiGetCurrentLineItemValue('item', 'price')
//						if(priceCode != -1){
//							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_grid_level',priceCode);//DJ_���i����
//						}
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_rate',nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_�P��/��
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_amount',nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_���z
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_taxcode',nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_�ŋ��R�[�h
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_rate',nlapiGetCurrentLineItemValue('item', 'taxrate1'));//DJ_�ŗ�
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_total',nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_���z
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_amount',nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_�Ŋz
//////						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_option',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_�I�v�V����
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_type',nlapiGetCurrentLineItemValue('item', 'costestimatetype'));//DJ_�������ς̎��
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_expansion_cost',nlapiGetCurrentLineItemValue('item', 'costestimate'));//DJ_�\���g���R�X�g
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_see_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofit'));//DJ_���ϑ����v
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_gross_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofitpercent'));//DJ_���ϑ����v�̊���
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_priming',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_automatic_allocation'));//DJ_��������
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custnum',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customer_order_number'));//DJ_�ڋq�̔����ԍ�
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_temperature',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_temperature'));//DJ_���x
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_test_report',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_testbook_supplement'));//DJ_�������Y�t
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_sample_type',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_type'));//DJ_�T���v�����
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_informatio',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rate_informatio'));//DJ_���[�g���
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_english',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_commodity_english'));//DJ_���i�p�ꖼ
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_charge_number',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_charge_number'));//DJ_�א�
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_ampm',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_ampm'));//DJ_AM�EPM
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_specifications',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_specifications'));//DJ_�K�i
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_document_flag',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_included_document_flag'));//DJ_�������ރt���O
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_perunitquantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity'));//DJ_����
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_casequantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_casequantity'));//DJ_�P�[�X��
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantitys',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_quantity'));//DJ_�o����
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverytemptyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverytemptyp'));//DJ_�z�����x�敪
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nextshipmentdesc',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nextshipmentdesc'));//DJ_���i����o�ח\��L�q
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverynotememo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverynotememo'));//DJ_�[�i�����l
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestid',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestid'));//DJ_�����˗�ID
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestlinen',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestlineno'));//DJ_�˗����׍s�ԍ�
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestquant',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestquantity'));//DJ_�˗�����
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_partshortagetyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_partshortagetyp'));//DJ_�������i�敪
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custody_item',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item'));//DJ_�a����A�C�e��
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_memo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_wms_line_memo'));//DJ_�q�Ɍ������ה��l
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_description',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_finetkanaitemdescription'));//DJ_FINET�J�i���i��
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_divideflg',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestdivideflg'));//DJ_�˗������σt���O
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nuclide',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nuclide'));//DJ_2_�j��
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_user_num',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_num'));//DJ_RIOS���[�U�Ǘ��ԍ�
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_remark',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_remark'));//DJ_RIOS���[�U���l
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_item_code',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_item_code'));//DJ_�A�C�e��(�R�[�h)
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderdetailtyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderdetailtyp'));//DJ_�������׏�ԋ敪
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_file_format',nlapiGetCurrentLineItemValue('item', 'custcol_9572_dd_file_format'));//DJ_���������t�@�C���E�t�H�[�}�b�g
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quoted_amount',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_quoted_amount'));//DJ_������z(����j
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_guarantee_fund',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_guarantee_fund'));//DJ_�ی���(����j
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_delivery',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_payment_delivery'));//DJ_�z���w�����̔[�i���Y�t
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_printing',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_receipt_printing'));//DJ_��̏����
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_category',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_category'));//DJ_�T���v���i�J�e�S��
//						if(!isEmpty(inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'))){
//							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber')); //DJ_�V���A��/���b�g�ԍ�ID
//						}else{
//							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber'));//DJ_�V���A��/���b�g�ԍ�		
//						}	
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_shednum',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber')); //DJ_�ۊǒI
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));//DJ_�L������
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));//DJ_���[�J�[�������b�g�ԍ�
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_serial',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));//DJ_���[�J�[�V���A���ԍ�
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_manufacture_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));//DJ_�����N����
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_probably_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));//DJ_�c�o�׉\����/DJ_�o�׉\������
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_warehouse_no',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));//DJ_�q�ɓ��ɔԍ�
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));//DJ_SMC�ԍ�
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_remark',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));//DJ_���b�g���}�[�N
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_memo',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));//DJ_���b�g����
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_inventory_quantit',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));     //DJ_�݌ɏڍז��׍s����
//						record.commitLineItem('recmachcustrecord_djkk_credit_note_approval');	
//						
////						
//					}
//				}else{
////					
//					inventoryDetail.selectLineItem('inventoryassignment', m);
//					record.selectNewLineItem('recmachcustrecord_djkk_credit_note_approval');
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id',i); //DJ_�N���W�b�g�������׍s�ԍ�
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_create_note_detail_item',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_�A�C�e��
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantity',nlapiGetCurrentLineItemValue('item', 'quantity'));//DJ_����
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_unit',nlapiGetCurrentLineItemValue('item', 'units'));//DJ_�P��
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_explain',nlapiGetCurrentLineItemValue('item', 'description'));//DJ_����
//					//20230522 changed by zhou start
//					//�J�X�^�����R�[�h��id��'-1'�̃I�v�V�������T�|�[�g���Ă��܂���
//					var priceCode = nlapiGetCurrentLineItemValue('item', 'price')
//					if(priceCode != -1){
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_grid_level',priceCode);//DJ_���i����
//					}
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_rate',nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_�P��/��
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_amount',nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_���z
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_taxcode',nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_�ŋ��R�[�h
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_rate',nlapiGetCurrentLineItemValue('item', 'taxrate1'));//DJ_�ŗ�
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_total',nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_���z
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_amount',nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_�Ŋz
//////					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_option',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_�I�v�V����
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_type',nlapiGetCurrentLineItemValue('item', 'costestimatetype'));//DJ_�������ς̎��
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_expansion_cost',nlapiGetCurrentLineItemValue('item', 'costestimate'));//DJ_�\���g���R�X�g
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_see_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofit'));//DJ_���ϑ����v
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_gross_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofitpercent'));//DJ_���ϑ����v�̊���
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_priming',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_automatic_allocation'));//DJ_��������
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custnum',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customer_order_number'));//DJ_�ڋq�̔����ԍ�
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_temperature',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_temperature'));//DJ_���x
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_test_report',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_testbook_supplement'));//DJ_�������Y�t
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_sample_type',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_type'));//DJ_�T���v�����
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_informatio',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rate_informatio'));//DJ_���[�g���
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_english',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_commodity_english'));//DJ_���i�p�ꖼ
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_charge_number',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_charge_number'));//DJ_�א�
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_ampm',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_ampm'));//DJ_AM�EPM
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_specifications',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_specifications'));//DJ_�K�i
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_document_flag',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_included_document_flag'));//DJ_�������ރt���O
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_perunitquantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity'));//DJ_����
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_casequantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_casequantity'));//DJ_�P�[�X��
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantitys',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_quantity'));//DJ_�o����
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverytemptyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverytemptyp'));//DJ_�z�����x�敪
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nextshipmentdesc',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nextshipmentdesc'));//DJ_���i����o�ח\��L�q
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverynotememo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverynotememo'));//DJ_�[�i�����l
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestid',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestid'));//DJ_�����˗�ID
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestlinen',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestlineno'));//DJ_�˗����׍s�ԍ�
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestquant',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestquantity'));//DJ_�˗�����
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_partshortagetyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_partshortagetyp'));//DJ_�������i�敪
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custody_item',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item'));//DJ_�a����A�C�e��
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_memo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_wms_line_memo'));//DJ_�q�Ɍ������ה��l
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_description',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_finetkanaitemdescription'));//DJ_FINET�J�i���i��
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_divideflg',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestdivideflg'));//DJ_�˗������σt���O
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nuclide',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nuclide'));//DJ_2_�j��
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_user_num',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_num'));//DJ_RIOS���[�U�Ǘ��ԍ�
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_remark',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_remark'));//DJ_RIOS���[�U���l
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_item_code',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_item_code'));//DJ_�A�C�e��(�R�[�h)
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderdetailtyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderdetailtyp'));//DJ_�������׏�ԋ敪
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_file_format',nlapiGetCurrentLineItemValue('item', 'custcol_9572_dd_file_format'));//DJ_���������t�@�C���E�t�H�[�}�b�g
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quoted_amount',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_quoted_amount'));//DJ_������z(����j
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_guarantee_fund',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_guarantee_fund'));//DJ_�ی���(����j
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_delivery',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_payment_delivery'));//DJ_�z���w�����̔[�i���Y�t
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_printing',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_receipt_printing'));//DJ_��̏����
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_category',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_category'));//DJ_�T���v���i�J�e�S��
//					record.commitLineItem('recmachcustrecord_djkk_credit_note_approval');	
//					
//				}
//			}
//			var custRecordId=nlapiSubmitRecord(record, true, true);
//			var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_credit_note_approval',custRecordId, 'VIEW');
//			window.ischanged = false;
//			window.location.href=theLink;	   			
//			 return false;
//			
//		}catch(e){
//			   alert(e.message);
//			   return false;
//		   }	
//	}
	
	
	 if(saveType=='edit'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'&&!isEmpty(nlapiGetFieldValue('custbody_djkk_creditmemo_id'))){
		 try{
			 
			 var record= nlapiLoadRecord('customrecord_djkk_credit_note_approval',nlapiGetFieldValue('custbody_djkk_creditmemo_id'));
			// ��v���
//				record.setFieldValue('customform', '188');//20230615 changed by zhou
				record.setFieldValue('custrecord_djkk_create_note_tranid', nlapiGetFieldValue('tranid'));  //�����ԍ�
				record.setFieldValue('custrecord_djkk_credit_note_customer', nlapiGetFieldValue('entity')); //�ڋq
				record.setFieldValue('custrecord_djkk_create_note_date', nlapiGetFieldValue('trandate')); //���t
				record.setFieldValue('custrecord_djkk_create_postingperiod', nlapiGetFieldValue('postingperiod')); //�L������
				record.setFieldValue('custrecord_djkk_create_note_otherrefnum', nlapiGetFieldValue('otherrefnum')); //�������ԍ�
				record.setFieldValue('custrecord_djkk_create_note_memo', nlapiGetFieldValue('memo')); //����
				record.setFieldValue('custrecord_djkk_credit_note_usertotal', nlapiGetFieldValue('total'));//20230524 add by zhou���z(���v)
//				record.setFieldValue('custrecord_djkk_credit_note_createdfrom', nlapiGetFieldValue('createdfrom'));//�쐬��
				record.setFieldValue('custrecord_djkk_credit_creditmemo', '');  //DJ_�N���W�b�g���� 20230616 add by zhou
//				alert('�쐬��2'+nlapiGetFieldValue('createdfrom'))
				
				
				//���[���������M
				record.setFieldValue('custrecord_djkk_cn_is_period', nlapiGetFieldValue('custbody_djkk_invoice_book_period'));//DJ_���������M�敪
				record.setFieldValue('custrecord_djkk_cn_is_book_site', nlapiGetFieldValue('custbody_djkk_invoice_book_site'));//DJ_���������M��敪
				record.setFieldValue('custrecord_djkk_cn_is_book_person', nlapiGetFieldValue('custbody_djkk_invoice_book_person'));//DJ_���������M��S����
				record.setFieldValue('custrecord_djkk_cn_is_book_subname', nlapiGetFieldValue('custbody_djkk_invoice_book_subname'));//DJ_���������M���Ж� (3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_is_book_person_t', nlapiGetFieldValue('custbody_djkk_invoice_book_person_t'));//DJ_���������M��S����(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_is_automatic_mailtr', nlapiGetFieldValue('custbody_djkk_invoice_automatic_mailtr'));//DJ_���������M�惁�[��(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_is_automatic_faxtrd', nlapiGetFieldValue('custbody_djkk_invoice_automatic_faxtrd'));//DJ_���������M��FAX(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_is_destination_regi', nlapiGetFieldValue('custbody_djkk_invoice_destination_regi'));//DJ_���������M��o�^����
				
				record.setFieldValue('custrecord_djkk_cn_de_period', nlapiGetFieldValue('custbody_djkk_delivery_book_period'));//DJ_���i����[�i�����M�敪
				record.setFieldValue('custrecord_djkk_cn_de_site_fd', nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd'));//DJ_���i����[�i�����M��敪
				record.setFieldValue('custrecord_djkk_cn_de_person', nlapiGetFieldValue('custbody_djkk_delivery_book_person'));//DJ_���i����[�i�����M��S����
				record.setFieldValue('custrecord_djkk_cn_de_subname', nlapiGetFieldValue('custbody_djkk_delivery_book_subname'));//DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_de_person_t', nlapiGetFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_de_email', nlapiGetFieldValue('custbody_djkk_delivery_book_email'));//DJ_���i����[�i�����M�惁�[��(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_de_fax_three', nlapiGetFieldValue('custbody_djkk_delivery_book_fax_three'));//DJ_���i����[�i�����M��FAX(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_de_memo_so', nlapiGetFieldValue('custbody_djkk_delivery_book_memo_so'));//DJ_���i����[�i�����M��o�^����
				
				record.setFieldValue('custrecord_djkk_cn_int_period', nlapiGetFieldValue('custbody_djkk_totalinv_period'));//DJ_���v���������M�敪
				record.setFieldValue('custrecord_djkk_cn_int_sendtype', nlapiGetFieldValue('custbody_djkk_totalinv_sendtype'));//DJ_���v���������M��敪
				record.setFieldValue('custrecord_djkk_cn_int_sendcharge', nlapiGetFieldValue('custbody_djkk_totalinv_sendcharge'));//DJ_���v���������M��S����
				record.setFieldValue('custrecord_djkk_cn_int_sendsub3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendsub3rd'));//DJ_���v���������M���Ж�(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_int_sendcharge3rd', nlapiGetFieldValue('custbody_djkk_totalin_sendcharge3rd'));//DJ_���v���������M��S����(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_int_sendmail3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendmail3rd'));//DJ_���v���������M�惁�[��(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_int_sendfax3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendfax3rd'));//DJ_���v���������M��FAX(3RD�p�[�e�B�[)
				record.setFieldValue('custrecord_djkk_cn_int_sendmemo', nlapiGetFieldValue('custbody_djkk_totalinv_sendmemo'));//DJ_���v���������M��o�^����
				
				
				// �̔����
//				record.setFieldValue('custrecord_djkk_create_note_salesrep', nlapiGetFieldValue('salesrep')); //DJ_�c�ƒS����
				record.setFieldValue('custrecord_djkk_create_saleseffectivedat', nlapiGetFieldValue('saleseffectivedate')); //DJ_�R�~�b�V�������
				
				//�o��tab
				record.setFieldValue('custrecord_djkk_create_note_operator', nlapiGetFieldValue('shipcarrier')); //DJ_�z���Ǝ�
				record.setFieldValue('custrecord_djkk_create_note_method', nlapiGetFieldValue('shipmethod')); //DJ_�z�����@
				record.setFieldValue('custrecord_djkk_create_note_tax_code', nlapiGetFieldValue('shippingtaxcode')); //DJ_�z�����̐ŋ��R�[�h
				record.setFieldValue('custrecord_djkk_create_note_fee_code', nlapiGetFieldValue('handlingtaxcode')); //DJ_�萔���̐ŋ��R�[�h
				record.setFieldValue('custrecord_djkk_create_note_materials', nlapiGetFieldValue('shippingcost')); //DJ_�z����
				record.setFieldValue('custrecord_djkk_create_note_by_hand', nlapiGetFieldValue('handlingcost')); //DJ_�萔��
				record.setFieldValue('custrecord_djkk_create_note_medesc', nlapiGetFieldValue('custbody_djkk_deliverytimedesc')); //DJ_�[�����ԑыL�q
				record.setFieldValue('custrecord_djkk_create_note_registflg', nlapiGetFieldValue('custbody_djkk_deliverynotregistflg')); //DJ_�[���斢�o�^�t���O
				//��vtab
				record.setFieldValue('custrecord_djkk_create_note_accounts', nlapiGetFieldValue('account')); //DJ_����Ȗ�
				record.setFieldValue('custrecord_djkk_create_note_currency', nlapiGetFieldValue('currency')); //DJ_�ʉ�
				record.setFieldValue('custrecord_djkk_create_note_exchange_rat', nlapiGetFieldValue('exchangerate')); //DJ_�בփ��[�g
				record.setFieldValue('custrecord_djkk_create_note_cost', nlapiGetFieldValue('totalcostestimate')); //DJ_�\���g���R�X�g
				record.setFieldValue('custrecord_djkk_create_note_profit', nlapiGetFieldValue('estgrossprofit')); //DJ_���ϑ����v
				record.setFieldValue('custrecord_djkk_create_note_gross_profit', nlapiGetFieldValue('estgrossprofitpercent')); //DJ_���ϑ����v�̊���
				
				
				// ���F���
				record.setFieldValue('custrecord_djkk_create_note_flg', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg')); //DJ_���F�����t���O
				record.setFieldValue('custrecord_djkk_create_note_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status')); //DJ_���F�X�e�[�^�X
				record.setFieldValue('custrecord_djkk_create_note_createuser', nlapiGetFieldValue('custbody_djkk_trans_appr_create_user')); //DJ_�쐬��
				record.setFieldValue('custrecord_djkk_create_note_createrole', nlapiGetFieldValue('custbody_djkk_trans_appr_create_role')); //DJ_�쐬���[��
//				record.setFieldValue('custrecord_djkk_create_note_createuser', nlapiGetFieldValue('custbody_djkk_trans_appr_create_user')); //DJ_�쐬��
				record.setFieldValue('custrecord_djkk_create_note_oper_roll', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));  //DJ_���F���샍�[��
				record.setFieldValue('custrecord_djkk_create_note_acknowledge', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user')); //DJ_���F�����
				record.setFieldValue('custrecord_djkk_create_note_opera_condit', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));  //DJ_���F�������
				
				record.setFieldValue('custrecord_djkk_create_note_autho_role', nlapiGetFieldValue('custbody_djkk_trans_appr_next_role')); //DJ_���̏��F���[��
				record.setFieldValue('custrecord_djkk_create_note_next_approve', nlapiGetFieldValue('custbody_djkk_trans_appr_user')); //DJ_���̏��F��
				record.setFieldValue('custrecord_djkk_create_note_appro_criter', nlapiGetFieldValue('custbody_djkk_trans_appr_cdtn_amt')); //DJ_���̏��F����
				record.setFieldValue('custrecord_djkk_create_note_first_role', nlapiGetFieldValue('custbody_djkk_trans_appr1_role')); //DJ_��ꏳ�F���[��
				record.setFieldValue('custrecord_djkk_create_note_first_user', nlapiGetFieldValue('custbody_djkk_trans_appr1_user')); //DJ_��ꏳ�F��
				record.setFieldValue('custrecord_djkk_create_note_second_role', nlapiGetFieldValue('custbody_djkk_trans_appr2_role'));//DJ_��񏳔F���[��
				record.setFieldValue('custrecord_djkk_create_note_second_user', nlapiGetFieldValue('custbody_djkk_trans_appr2_user')); //DJ_��񏳔F��
				
				record.setFieldValue('custrecord_djkk_create_note_third_role', nlapiGetFieldValue('custbody_djkk_trans_appr3_role')); //DJ_��O���F���[��
				record.setFieldValue('custrecord_djkk_create_note_third_user', nlapiGetFieldValue('custbody_djkk_trans_appr3_user')); //DJ_��O���F��
				record.setFieldValue('custrecord_djkk_create_note_fourth_role', nlapiGetFieldValue('custbody_djkk_trans_appr4_role')); //DJ_��l���F���[��
				record.setFieldValue('custrecord_djkk_create_note_fourth_uesr', nlapiGetFieldValue('custbody_djkk_trans_appr4_user')); //DJ_��l���F��
				record.setFieldValue('custrecord_djkk_create_note_rever_memo', nlapiGetFieldValue('custbody_djkk_approval_reset_memo')); //DJ_���F���߃���
				record.setFieldValue('custrecord_djkk_approval_kyaltuka_memo', nlapiGetFieldValue('custbody_djkk_approval_kyaltuka_memo')); //DJ_���F�p������ // 20230522 add by zhou
				// ����
				record.setFieldValue('custrecord_djkk_create_note_subsidiary', nlapiGetFieldValue('subsidiary')); //DJ_�q���
				record.setFieldValue('custrecord_djkk_create_note_department', nlapiGetFieldValue('department')); //�Z�N�V����
				record.setFieldValue('custrecord_djkk_create_note_bulkprocsubm', nlapiGetFieldValue('bulkprocsubmission')); //���MID
				// CH144 zheng 20230516 start
				//record.setFieldValue('custrecord_djkk_create_note_rate_s1', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s1')); //DJ_��1�\�񃌁[�g
				// CH144 zheng 20230516 end
				record.setFieldValue('custrecord_djkk_create_note_opc_flg', nlapiGetFieldValue('custbody_djkk_exsystem_opc_flg')); //DJ_�O������̍σt���O
				record.setFieldValue('custrecord_djkk_create_note_date_time', nlapiGetFieldValue('custbody_djkk_exsystem_send_date_time')); //DJ_�O���V�X�e�����M����
				record.setFieldValue('custrecord_djkk_create_note_includeids', nlapiGetFieldValue('custbody_4392_includeids')); //���ߐ������Ɋ܂߂�
				record.setFieldValue('custrecord_djkk_create_note_sales', nlapiGetFieldValue('custbody_djkk_company_sales')); //DJ_�Д̑Ώ�
				record.setFieldValue('custrecord_djkk_create_note_end_user', nlapiGetFieldValue('custbody_djkk_end_user')); //DJ_�G���h���[�U�[
				record.setFieldValue('custrecord_djkk_create_note_destination', nlapiGetFieldValue('custbody_djkk_delivery_destination')); //DJ_�[�i��
				record.setFieldValue('custrecord_djkk_create_note_conditions', nlapiGetFieldValue('custbody_djkk_payment_conditions')); //DJ_�x������
				record.setFieldValue('custrecord_djkk_create_note_registration', nlapiGetFieldValue('custbody_djkk_gst_registration')); //DJ_GST�o�^�ԍ�
				record.setFieldValue('custrecord_djkk_create_note_deliverynote', nlapiGetFieldValue('custbody_djkk_deliverynote')); //DJ_�[�i���������M
				record.setFieldValue('custrecord_djkk_create_note_instructions', nlapiGetFieldValue('custbody_djkk_shipping_instructions_f')); //DJ_�o�׎w��
				record.setFieldValue('custrecord_djkk_create_note_person', nlapiGetFieldValue('custbody_djkk_shipment_person')); //DJ_�o�גS����
				record.setFieldValue('custrecord_djkk_create_note_location', nlapiGetFieldValue('location')); //DJ_�ꏊ
				nlapiLogExecution('debug','lhm1',nlapiGetFieldValue('location'));
				record.setFieldValue('custrecord_djkk_create_note_methodtyp', nlapiGetFieldValue('custbody_djkk_paymentmethodtyp')); //DJ_�x�����@�敪
				record.setFieldValue('custrecord_djkk_create_note_deliveryrule', nlapiGetFieldValue('custbody_djkk_deliveryruledesc')); //DJ_�[���斈�݌Ɉ�������
				record.setFieldValue('custrecord_djkk_create_note_cautiondesc', nlapiGetFieldValue('custbody_djkk_cautiondesc')); //DJ_���ӎ���
				record.setFieldValue('custrecord_djkk_create_note_wmsmemo1', nlapiGetFieldValue('custbody_djkk_wmsmemo1')); //DJ_�q�Ɍ������l�P
				record.setFieldValue('custrecord_djkk_create_note_deliverermem', nlapiGetFieldValue('custbody_djkk_deliverermemo1')); //DJ_�^����Ќ������l
				record.setFieldValue('custrecord_djkk_create_note_deliverymemo', nlapiGetFieldValue('custbody_djkk_deliverynotememo')); //DJ_�[�i�����l
				record.setFieldValue('custrecord_djkk_create_note_orderrequeid', nlapiGetFieldValue('custbody_djkk_orderrequestid')); //DJ_�����˗�ID
				record.setFieldValue('custrecord_djkk_create_note_netflg', nlapiGetFieldValue('custbody_djkk_netsuitetransflg')); //DJ_NETSUITE�A�g�t���O
				record.setFieldValue('custrecord_djkk_create_note_nstructdt', nlapiGetFieldValue('custbody_djkk_shippinginstructdt')); //DJ_�o�׎w������
				record.setFieldValue('custrecord_djkk_create_note_merorderno', nlapiGetFieldValue('custbody_djkk_customerorderno')); //DJ_��������ԍ�
				record.setFieldValue('custrecord_djkk_create_note_ingsaleflg', nlapiGetFieldValue('custbody_djkk_consignmentbuyingsaleflg')); //DJ_�����d������t���O
				record.setFieldValue('custrecord_djkk_create_note_hopedate', nlapiGetFieldValue('custbody_djkk_delivery_hopedate')); //DJ_�[�i��]��
				record.setFieldValue('custrecord_djkk_create_note_class', nlapiGetFieldValue('class')); //�u�����h
				record.setFieldValue('custrecord_djkk_create_note_wmsmemo2', nlapiGetFieldValue('custbody_djkk_wmsmemo2')); //DJ_�q�Ɍ������l�Q
				record.setFieldValue('custrecord_djkk_create_note_wmsmemo3', nlapiGetFieldValue('custbody_djkk_wmsmemo3')); //DJ_�q�Ɍ������l3
				record.setFieldValue('custrecord_djkk_create_note_send', nlapiGetFieldValue('custbody_djkk_warehouse_sent')); //DJ_�q�ɑ��M�ς�
				record.setFieldValue('custrecord_djkk_create_note_coname', nlapiGetFieldValue('custbody_djkk_finetkanaofferconame')); //DJ_FINET�J�i�񋟊�Ɩ�
				record.setFieldValue('custrecord_djkk_create_note_cooffice', nlapiGetFieldValue('custbody_djkk_finetkanaoffercooffice')); //DJ_FINET�J�i�񋟊�ƎQ�Ǝ��Ə���
				record.setFieldValue('custrecord_djkk_create_note_stomername', nlapiGetFieldValue('custbody_djkk_finetkanacustomername')); //DJ_FINET�J�i�Ж��E�X���E����於
				record.setFieldValue('custrecord_djkk_create_note_address', nlapiGetFieldValue('custbody_djkk_finetkanacustomeraddress')); //DJ_FINET�J�i�Z��
				record.setFieldValue('custrecord_djkk_create_note_invflg', nlapiGetFieldValue('custbody_djkk_invoicetotal_flag')); //DJ_���v�������쐬�ς݃t���O
				record.setFieldValue('custrecord_djkk_create_note_base_date', nlapiGetFieldValue('custbody_djkk_rios_base_date')); //DJ_RIOS���
				record.setFieldValue('custrecord_djkk_create_note_netsuitetran', nlapiGetFieldValue('custbodycustbody_djkk_netsuitetransdt')); //DJ_NETSUITE�A�g����
				record.setFieldValue('custrecord_djkk_create_note_language', nlapiGetFieldValue('custbody_djkk_language')); //DJ_����
				record.setFieldValue('custrecord_djkk_create_note_ids_date', nlapiGetFieldValue('custbody_suitel10n_jp_ids_date')); //���ߐ���������
				record.setFieldValue('custrecord_djkk_create_note_due_date', nlapiGetFieldValue('custbody_jp_invoice_summary_due_date')); //DJ_INVOICE SUMMARY DUE DATE
				record.setFieldValue('custrecord_djkk_create_note_delivererme2', nlapiGetFieldValue('custbody_djkk_deliverermemo2')); //DJ_�^����Ќ������l2
				// CH144 zheng 20230516 start
				//record.setFieldValue('custrecord_djkk_create_note_rate_yen', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_yen')); //DJ_�~�ݎx��
				//record.setFieldValue('custrecord_djkk_create_note_rate_s2', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s2')); //DJ_��2�\�񃌁[�g
				//record.setFieldValue('custrecord_djkk_create_note_rate_s3', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s3')); //DJ_��3�\�񃌁[�g
				//record.setFieldValue('custrecord_djkk_create_note_rate_f', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_f')); //DJ_�O�ݎx���f�[�^�쐬
				// CH144 zheng 20230516 end
				record.setFieldValue('custrecord_djkk_create_note_delive', nlapiGetFieldValue('custbody_djkk_reference_delive')); //DJ_�[���񓚔��l��
				record.setFieldValue('custrecord_djkk_create_note_column', nlapiGetFieldValue('custbody_djkk_reference_column')); //DJ_�[�i�����l��
				record.setFieldValue('custrecord_djkk_create_note_reference', nlapiGetFieldValue('custbody_djkk_request_reference_bar')); //DJ_���������l��
				record.setFieldValue('custrecord_djkk_create_note_day', nlapiGetFieldValue('custbody_djkk_annotation_day')); //DJ_������
				record.setFieldValue('custrecord_djkk_create_note_process', nlapiGetFieldValue('custbody_15699_exclude_from_ep_process')); //EXCLUDE FROM ELECTRONIC BANK PAYMENTS PROCESSING
				record.setFieldValue('custrecord_djkk_create_note_precautions', nlapiGetFieldValue('custbody_djkk_delivery_precautions')); //DJ_�[�i�撍�ӎ���
				record.setFieldValue('custrecord_djkk_create_note_precautionss', nlapiGetFieldValue('custbody_djkk_customer_precautions')); //DJ_�ڋq���ӎ���	
				record.setFieldValue('custrecord_djkk_create_note_instructflg', nlapiGetFieldValue('custbody_djkk_shipping_instructions')); // DJ_�o�׎w���ς�
				record.setFieldValue('custrecord_djkk_create_note_deliveryadd', nlapiGetFieldValue('custbody_djkk_delivery_address')); //DJ_�[�i��Z��
				record.setFieldValue('custrecord_djkk_create_note_customeradd', nlapiGetFieldValue('custbody_djkk_customer_address')); //DJ_�ڋq�Z��
				record.setFieldValue('custrecord_djkk_create_note_ready', nlapiGetFieldValue('custbody_djkk_sendmail_ready')); //DJ_��������
				record.setFieldValue('custrecord_djkk_create_note_destemail', nlapiGetFieldValue('custbody_djkk_shippinginfodestemail')); //DJ_�o�׈ē����t�惁�[��
				record.setFieldValue('custrecord_djkk_create_note_fax', nlapiGetFieldValue('custbody_djkk_shippinginfodestfax')); //DJ_�o�׈ē����t��FAX
				record.setFieldValue('custrecord_djkk_create_note_destname', nlapiGetFieldValue('custbody_djkk_shippinginfodestname')); //DJ_�o�׈ē����t�戶��
				record.setFieldValue('custrecord_djkk_create_note_desttyp', nlapiGetFieldValue('custbody_djkk_shippinginfodesttyp')); //DJ_�o�׈ē����t��敪
				record.setFieldValue('custrecord_djkk_create_note_sendtyp', nlapiGetFieldValue('custbody_djkk_shippinginfosendtyp')); //DJ_�o�׈ē����M�敪
				var recordCount=record.getLineItemCount('recmachcustrecord_djkk_credit_note_approval');
				for(var w=recordCount;w>0;w--){
					record.removeLineItem('recmachcustrecord_djkk_credit_note_approval', w);
				}
				var counts=nlapiGetLineItemCount('item');
				for(var i=1;i<counts+1;i++){
					nlapiSelectLineItem('item', i);
					var inventoryDetail=nlapiViewCurrentLineItemSubrecord('item','inventorydetail');
					if(!isEmpty(inventoryDetail)){
						var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
						for(var m = 1 ; m < invCount+1 ; m++){
							inventoryDetail.selectLineItem('inventoryassignment', m);
							record.selectNewLineItem('recmachcustrecord_djkk_credit_note_approval');
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id',i); //DJ_�N���W�b�g�������׍s�ԍ�
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_create_note_detail_item',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_�A�C�e��
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantity',nlapiGetCurrentLineItemValue('item', 'quantity'));//DJ_����
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_unit',nlapiGetCurrentLineItemValue('item', 'units'));//DJ_�P��
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_explain',nlapiGetCurrentLineItemValue('item', 'description'));//DJ_����
							//20230522 changed by zhou start
							//�J�X�^�����R�[�h��id��'-1'�̃I�v�V�������T�|�[�g���Ă��܂���
							var priceCode = nlapiGetCurrentLineItemValue('item', 'price')
							if(priceCode != -1){
								record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_grid_level',priceCode);//DJ_���i����
							}
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_rate',nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_�P��/��
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_amount',nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_���z
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_taxcode',nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_�ŋ��R�[�h
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_rate',nlapiGetCurrentLineItemValue('item', 'taxrate1'));//DJ_�ŗ�
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_total',nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_���z
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_amount',nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_�Ŋz
////							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_option',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_�I�v�V����
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_type',nlapiGetCurrentLineItemValue('item', 'costestimatetype'));//DJ_�������ς̎��
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_expansion_cost',nlapiGetCurrentLineItemValue('item', 'costestimate'));//DJ_�\���g���R�X�g
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_see_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofit'));//DJ_���ϑ����v
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_gross_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofitpercent'));//DJ_���ϑ����v�̊���
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_priming',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_automatic_allocation'));//DJ_��������
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custnum',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customer_order_number'));//DJ_�ڋq�̔����ԍ�
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_temperature',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_temperature'));//DJ_���x
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_test_report',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_testbook_supplement'));//DJ_�������Y�t
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_sample_type',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_type'));//DJ_�T���v�����
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_informatio',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rate_informatio'));//DJ_���[�g���
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_english',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_commodity_english'));//DJ_���i�p�ꖼ
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_charge_number',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_charge_number'));//DJ_�א�
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_ampm',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_ampm'));//DJ_AM�EPM
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_specifications',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_specifications'));//DJ_�K�i
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_document_flag',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_included_document_flag'));//DJ_�������ރt���O
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_perunitquantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity'));//DJ_����
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_casequantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_casequantity'));//DJ_�P�[�X��
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantitys',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_quantity'));//DJ_�o����
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverytemptyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverytemptyp'));//DJ_�z�����x�敪
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nextshipmentdesc',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nextshipmentdesc'));//DJ_���i����o�ח\��L�q
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverynotememo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverynotememo'));//DJ_�[�i�����l
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestid',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestid'));//DJ_�����˗�ID
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestlinen',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestlineno'));//DJ_�˗����׍s�ԍ�
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestquant',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestquantity'));//DJ_�˗�����
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_partshortagetyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_partshortagetyp'));//DJ_�������i�敪
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custody_item',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item'));//DJ_�a����A�C�e��
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_memo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_wms_line_memo'));//DJ_�q�Ɍ������ה��l
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_description',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_finetkanaitemdescription'));//DJ_FINET�J�i���i��
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_divideflg',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestdivideflg'));//DJ_�˗������σt���O
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nuclide',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nuclide'));//DJ_2_�j��
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_user_num',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_num'));//DJ_RIOS���[�U�Ǘ��ԍ�
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_remark',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_remark'));//DJ_RIOS���[�U���l
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_item_code',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_item_code'));//DJ_�A�C�e��(�R�[�h)
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderdetailtyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderdetailtyp'));//DJ_�������׏�ԋ敪
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_file_format',nlapiGetCurrentLineItemValue('item', 'custcol_9572_dd_file_format'));//DJ_���������t�@�C���E�t�H�[�}�b�g
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quoted_amount',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_quoted_amount'));//DJ_������z(����j
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_guarantee_fund',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_guarantee_fund'));//DJ_�ی���(����j
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_delivery',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_payment_delivery'));//DJ_�z���w�����̔[�i���Y�t
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_printing',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_receipt_printing'));//DJ_��̏����
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_category',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_category'));//DJ_�T���v���i�J�e�S��
							// changed by song add 20230612 start
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_location',nlapiGetCurrentLineItemValue('item', 'location'));     //DJ_�ꏊ
					    	// changed by song add 20230612 end
							if(!isEmpty(inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'))){
								record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber')); //DJ_�V���A��/���b�g�ԍ�ID
							}else{
								record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber'));//DJ_�V���A��/���b�g�ԍ�		
							}	
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_shednum',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber')); //DJ_�ۊǒI
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));//DJ_�L������
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));//DJ_���[�J�[�������b�g�ԍ�
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_serial',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));//DJ_���[�J�[�V���A���ԍ�
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_manufacture_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));//DJ_�����N����
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_probably_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));//DJ_�c�o�׉\����/DJ_�o�׉\������
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_warehouse_no',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));//DJ_�q�ɓ��ɔԍ�
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));//DJ_SMC�ԍ�
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_remark',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));//DJ_���b�g���}�[�N
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_memo',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));//DJ_���b�g����
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_inventory_quantit',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));     //DJ_�݌ɏڍז��׍s����
							record.commitLineItem('recmachcustrecord_djkk_credit_note_approval');	
							
//							
						}
					}else{
//						
//						inventoryDetail.selectLineItem('inventoryassignment', m);
						record.selectNewLineItem('recmachcustrecord_djkk_credit_note_approval');
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id',i); //DJ_�N���W�b�g�������׍s�ԍ�
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_create_note_detail_item',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_�A�C�e��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantity',nlapiGetCurrentLineItemValue('item', 'quantity'));//DJ_����
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_unit',nlapiGetCurrentLineItemValue('item', 'units'));//DJ_�P��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_explain',nlapiGetCurrentLineItemValue('item', 'description'));//DJ_����
						//20230522 changed by zhou start
						//�J�X�^�����R�[�h��id��'-1'�̃I�v�V�������T�|�[�g���Ă��܂���
						var priceCode = nlapiGetCurrentLineItemValue('item', 'price')
						if(priceCode != -1){
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_grid_level',priceCode);//DJ_���i����
						}
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_rate',nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_�P��/��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_amount',nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_���z
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_taxcode',nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_�ŋ��R�[�h
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_rate',nlapiGetCurrentLineItemValue('item', 'taxrate1'));//DJ_�ŗ�
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_total',nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_���z
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_amount',nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_�Ŋz
////						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_option',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_�I�v�V����
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_type',nlapiGetCurrentLineItemValue('item', 'costestimatetype'));//DJ_�������ς̎��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_expansion_cost',nlapiGetCurrentLineItemValue('item', 'costestimate'));//DJ_�\���g���R�X�g
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_see_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofit'));//DJ_���ϑ����v
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_gross_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofitpercent'));//DJ_���ϑ����v�̊���
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_priming',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_automatic_allocation'));//DJ_��������
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custnum',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customer_order_number'));//DJ_�ڋq�̔����ԍ�
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_temperature',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_temperature'));//DJ_���x
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_test_report',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_testbook_supplement'));//DJ_�������Y�t
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_sample_type',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_type'));//DJ_�T���v�����
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_informatio',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rate_informatio'));//DJ_���[�g���
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_english',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_commodity_english'));//DJ_���i�p�ꖼ
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_charge_number',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_charge_number'));//DJ_�א�
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_ampm',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_ampm'));//DJ_AM�EPM
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_specifications',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_specifications'));//DJ_�K�i
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_document_flag',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_included_document_flag'));//DJ_�������ރt���O
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_perunitquantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity'));//DJ_����
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_casequantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_casequantity'));//DJ_�P�[�X��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantitys',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_quantity'));//DJ_�o����
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverytemptyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverytemptyp'));//DJ_�z�����x�敪
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nextshipmentdesc',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nextshipmentdesc'));//DJ_���i����o�ח\��L�q
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverynotememo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverynotememo'));//DJ_�[�i�����l
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestid',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestid'));//DJ_�����˗�ID
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestlinen',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestlineno'));//DJ_�˗����׍s�ԍ�
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestquant',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestquantity'));//DJ_�˗�����
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_partshortagetyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_partshortagetyp'));//DJ_�������i�敪
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custody_item',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item'));//DJ_�a����A�C�e��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_memo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_wms_line_memo'));//DJ_�q�Ɍ������ה��l
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_description',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_finetkanaitemdescription'));//DJ_FINET�J�i���i��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_divideflg',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestdivideflg'));//DJ_�˗������σt���O
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nuclide',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nuclide'));//DJ_2_�j��
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_user_num',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_num'));//DJ_RIOS���[�U�Ǘ��ԍ�
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_remark',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_remark'));//DJ_RIOS���[�U���l
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_item_code',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_item_code'));//DJ_�A�C�e��(�R�[�h)
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderdetailtyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderdetailtyp'));//DJ_�������׏�ԋ敪
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_file_format',nlapiGetCurrentLineItemValue('item', 'custcol_9572_dd_file_format'));//DJ_���������t�@�C���E�t�H�[�}�b�g
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quoted_amount',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_quoted_amount'));//DJ_������z(����j
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_guarantee_fund',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_guarantee_fund'));//DJ_�ی���(����j
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_delivery',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_payment_delivery'));//DJ_�z���w�����̔[�i���Y�t
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_printing',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_receipt_printing'));//DJ_��̏����
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_category',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_category'));//DJ_�T���v���i�J�e�S��
						// changed by song add 20230612 start
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_location',nlapiGetCurrentLineItemValue('item', 'location'));     //DJ_�ꏊ
						// changed by song add 20230612 end
						record.commitLineItem('recmachcustrecord_djkk_credit_note_approval');	
						
					}
				}
				var custRecordId=nlapiSubmitRecord(record, true, true);
				var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_credit_note_approval',custRecordId, 'VIEW');
				var delLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_creditmemo_approval','customdeploy_djkk_sl_creditmemo_approval');
				delLink += '&deleteRecordId=' + nlapiGetRecordId();
				
				nlapiRequestURL(delLink);
				window.ischanged = false;
				window.location.href=theLink;
				 return false;
				
		 }catch(e){
			   alert(e.message);
			   return false;
		   }
	 }
	 
	 return true;
}
function customerSendmails(deliverySendMailFlag,custRecord){
//	if(soCustomform == '121'){
	if(!isEmpty(custRecord) &&  deliverySendMailFlag == true){
			var deliveryPeriod = custRecord.getFieldValue('custentity_djkk_delivery_book_period'); //DJ_�[�i�����M���@
			var deliverySiteFd = custRecord.getFieldValue('custentity_djkk_delivery_book_site_fd'); //DJ_�[�i�����M��(�H�i�p)
			var deliveryPerson = custRecord.getFieldValue('custentity_djkk_delivery_book_person'); //DJ_�[�i�����M��S����
			var deliverySubName = custRecord.getFieldValue('custentity_djkk_delivery_book_subname'); //DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
			var deliveryPersont = custRecord.getFieldValue('custentity_djkk_delivery_book_person_t'); //DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
			var deliveryEmail = custRecord.getFieldValue('custentity_djkk_delivery_book_email'); //DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
			var deliveryFax = custRecord.getFieldValue('custentity_djkk_delivery_book_fax_three'); //DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
			var deliveryMemo = custRecord.getFieldValue('custentity_djkk_delivery_book_memo'); //DJ_�[�i���������M���l
			if(!isEmpty(deliveryPeriod)&& (deliveryPeriod!= '10')){
				nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_�[�i�����M���@
				nlapiSetFieldValue('custbody_djkk_delivery_book_site_fd', deliverySiteFd,false);//DJ_�[�i�����M��
				nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);//DJ_�[�i�����M��S����
				nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo);//DJ_�[�i���������M���l  custbody_djkk_reference_column
			}
		}
//	}
}


function deliverySendMailChangeFormDelivery(deliveryRecord){
	var deliveryPeriod = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_period');//DJ_�[�i�����M���@
	var deliveryPerson = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person');//DJ_�[�i�����M��S����
	var deliverySubName = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_subname');//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
	var deliveryPersont = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person_t');//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
	var deliveryEmail = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_email');//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
	var deliveryFax = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_fax_three');//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
	var deliveryMemo = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_memo');//DJ_�[�i���������M���t����l
	if(!isEmpty(deliveryPeriod)&& deliveryPeriod != '10'){
		nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo,false);	
	}
}
function deliverySendMailChangeFormCustomer(loadingCustomer){
	var deliveryPeriod = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_period')//�[�i�����M���@
	var deliveryPerson = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_person')//�[�i�����M��S����
	var deliverySubName = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_subname')//�[�i�����M���Ж�(3RD�p�[�e�B�[)
	var deliveryPersont = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_person_t')//�[�i�����M��S����(3RD�p�[�e�B�[)
	var deliveryEmail = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_email')//�[�i�����M�惁�[��(3RD�p�[�e�B�[)
	var deliveryFax = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_fax_three')//�[�i�����M��FAX(3RD�p�[�e�B�[)
	var deliveryMemo = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_memo')//�[�i���������M���l
	if(!isEmpty(deliveryPeriod)&& deliveryPeriod != '10'){
		nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo,false);	
	}
}
