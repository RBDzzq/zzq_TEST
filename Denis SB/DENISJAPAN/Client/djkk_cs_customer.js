/**
 * �ڋq��Client
 * 
 * Version     ���t            �S����       ���l
 * 1.00        2021/02/18     YUAN      �V�K�쐬
 *
 */
var useType='';
var parentSub = '';

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
	useType=type;
	if(type=='create'){
	nlapiSetFieldValue('isperson', 'F', true, true);
	}
	var sub=nlapiGetFieldValue('subsidiary'); 
    var form = nlapiGetFieldText('customform');
    var recordType = nlapiGetRecordType();
    if(!isEmpty(sub)){
        if(sub == SUB_SCETI || SUB_DPKK){
            // DJ_���݌ڋq�t�H�[��7
            if (form.indexOf('�ڋq') > -1 && form.indexOf('����') < 0) {

                // DJ_�ڋq�^�C�v .�ڋq
                nlapiSetFieldValue('custentity_djkk_customer_type', '3');

                // DJ_���[�h�E�t�H�[��65
            } else if (form.indexOf('���[�h') > -1) {

                // DJ_�ڋq�^�C�v .���[�h
                nlapiSetFieldValue('custentity_djkk_customer_type', '1');

                // DJ_���݌ڋq�t�H�[��66
            } else if (form.indexOf('���݌ڋq') > -1) {

                // DJ_�ڋq�^�C�v .���݌ڋq
                nlapiSetFieldValue('custentity_djkk_customer_type', '2');
            }
        }else if(sub == SUB_NBKK || SUB_ULKK){
        	// U071:?ADJ_�[�i�����i�H�iG�f�t�H���g�FSML�j�󒍌�A2�`3����ɔ[�i�j
    		nlapiSetFieldValue('custentity_djkk_delivery_conditions', '2');
    		
    		//changed by song add DENISJAPANDEV-1388 start
    		if(RecordType == 'lead'){ //���[�h
    			nlapiSetFieldValue('customform', '142'); //�J�X�^���t�H�[��
    			nlapiSetFieldValue('custentity_djkk_customer_type', '1'); //DJ_�ڋq�^�C�v 
    		}else if(RecordType = 'customer'){ //�ڋq
    			nlapiSetFieldValue('customform', '80'); //�J�X�^���t�H�[��
    			nlapiSetFieldValue('custentity_djkk_customer_type', '3'); //DJ_�ڋq�^�C�v 
    		}else if(RecordType == 'prospect'){ //���݌ڋq
    			nlapiSetFieldValue('customform', '141'); //�J�X�^���t�H�[��
    			nlapiSetFieldValue('custentity_djkk_customer_type', '2'); //DJ_�ڋq�^�C�v 
    		}
    		//changed by song add DENISJAPANDEV-1388 end
    		
        }
    }
    // DENISJAPAN-255 add by ycx 2021/06/02
    var userRole=nlapiGetRole();
//	nlapiLogExecution('DEBUG', 'userRole1', userRole);
	// �Ǘ���
	if(userRole!=3&&userRole!=1025&&userRole!=1026){
	// ���[���E�Ӊ�Ђ̎擾
	var roleSubsidiary = nlapiGetFieldValue('custentity_syokuseki');
//	nlapiLogExecution('DEBUG', 'roleSubsidiary', roleSubsidiary);
	var customformID = nlapiGetFieldValue('customform');
	//nlapiLogExecution('DEBUG', 'customformID', customformID);
	if(customformID != CUSTOMER_CUSTOMFORM_DISABLED_LS_ID && customformID != CUSTOMER_CUSTOMFORM_DISABLED_LS_FOOD){
	setFieldDisableType('subsidiary', 'disabled');
	}
	
	//setFieldDisableType('subsidiary', 'disabled');
//	if(type!='edit'){
//		nlapiSetFieldValue('subsidiary', roleSubsidiary, false, true);
//	}
	}
	if(userRole!=1022){
		var roleSubsidiary = nlapiGetFieldValue('custentity_syokuseki');
		
		var customformID = nlapiGetFieldValue('customform');
		var shippingitem = nlapiGetFieldValue('shippingitem');
//		nlapiLogExecution('DEBUG', 'shippingitem', shippingitem);
		if(customformID == 91 || customformID == 137 || customformID == 138 || customformID == 128){
			//setFieldDisableType('custentity_djkk_payment_conditions', 'disabled');
			setFieldDisableType('custentity_djkk_transfer_person_name', 'disabled');
			setFieldDisableType('custentity_djkk_bank_account_holder', 'disabled');
			setFieldDisableType('custentity_djkk__djkk_bank_account_half', 'disabled');
			setFieldDisableType('custentity_dj_custpayment_bankname', 'hidden');
			setFieldDisableType('custentity_dj_custpayment_branchname', 'hidden');
			setFieldDisableType('custentity_dj_custpayment_clientname', 'hidden');
			setFieldDisableType('custentity_dj_custpayment_accountnumber', 'hidden');
//			nlapiSetFieldValue('salesrep', ' ');
//			nlapiSetFieldValue('subsidiary', 6);
		}
		if(true){
			var subsidiary = nlapiGetFieldValue('subsidiary');
//			nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)
			if(subsidiary == 6){
				nlapiSetFieldValue('shippingitem', 206);
			}
		}		
	}
//	if(customformID == 91 || customformID == 137 || customformID == 138 || customformID == 128){
//		nlapiSetFieldText('salesrep', ' ');
//	}
	
	// add end
	
	//U168�o���f�[�V����
	var subsidiary = nlapiGetFieldValue('subsidiary');
	if (type == 'create'){
		if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK ){
			nlapiSetFieldValue('custentity_4392_useids', 'T');
		}
	}
	//20230202 add by zhou CH209 start
	var userRole=nlapiGetRole();
	//1022:DJ_�o���S��
	if((subsidiary == SUB_SCETI || subsidiary == SUB_DPKK)&& userRole != '1022'){
		
		setFieldDisableType('custentity_djkk_credit_limit', 'disabled');
	}
		//end
	//20220914 add by zhou U118
	var recordType =  nlapiGetRecordType();
	if(type == 'create' && recordType == 'lead' ){		//&& (subsidiary == SUB_NBKK || subsidiary == SUB_ULKK)
		nlapiSetFieldValue('custentity_djkk_customer_type', 1);
		if(nlapiGetFieldValue('customform')!=142){
		nlapiSetFieldValue('customform', 142);
		}
		setFieldDisableType('customform', 'hidden');
	}else if(type == 'create' && recordType == 'prospect'){//&& (subsidiary == SUB_NBKK || subsidiary == SUB_ULKK)
		nlapiSetFieldValue('custentity_djkk_customer_type', 2);
		if(nlapiGetFieldValue('customform')!=141){
		nlapiSetFieldValue('customform', 141);
		}
		setFieldDisableType('customform', 'hidden');
	}
	//end
	
	

	//20221219 add by zhou CH180 starat
	//�ڋq�}�X�^�c�ƃT�u�^�u�����̃��[���ŉ{���\�Ƃ���
	//NBKK�̔��S���ANBKK�w���̔��S���AUL�̔��S���AUL�w���̔��S��
	var userRole=nlapiGetRole();
	if(customformID == '80'||customformID == '141'||customformID == '142'||customformID == '143'){
//		1012	NB_�w���E�̔��S��	 	
//		1013	NB_�̔��S��
//		1002	UL_�w���E�̔��S��
//		1003	UL_�̔��S��
		if(userRole !='1012' && userRole !='1013' && userRole !='1002' && userRole !='1003' && userRole !='3'){
			setTableHidden('salestxt');//�c�ƃT�u�^�u
		}
	}
	//end
	
	// changed  by song add DENISJAPAN-724   start
	nlapiDisableField('custentity_djkk_cus_oldid', true);
	// changed  by song add DENISJAPAN-724   end
}


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

	var salesrep = nlapiGetFieldValue('salesrep');
	if(isEmpty(salesrep)){
		alert('�̔����i���ВS���j�͓��͂��Ȃ��ł��B');
//		return true;
	}
	
	
	//changed by geng add start U280
	var sub = nlapiGetFieldValue('subsidiary');
	if(sub==SUB_NBKK||sub==SUB_ULKK){
		var email = nlapiGetFieldValue('email');
		var phone = nlapiGetFieldValue('phone');
		var fax = nlapiGetFieldValue('fax');
		var add = nlapiGetFieldValue('defaultaddress');
//		if(isEmpty(email)){
//			alert('�d�q���[���͓��͂��Ȃ��ł��B');
//		}
		if(isEmpty(phone)){
			alert('�d�b�ԍ����o�^����Ă��܂���B');
		}
//		if(isEmpty(fax)){
//			alert('FAX�͓��͂��Ȃ��ł��B');
//		}
		if(isEmpty(add)){
			alert('�Z�����o�^����Ă��܂���B');
		}
	}
	//changed by geng add end U280
	
	//changed by song add DENISJAPAN-486 start
	var sodeliverermemo = nlapiGetFieldValue('custentity_djkk_sodeliverermemo'); //DJ_�������^���������l
	if(!isEmpty(sodeliverermemo)){
		var sodeliverermemoString = sodeliverermemo.toString();
		var sodeMemoBytes = getBytes(sodeliverermemoString);
        if(sodeMemoBytes > 35){
		    alert("DJ_�������^���������l�̃o�C�g����35���傫���̂ŁA�ē��͂��Ă�������");
		    return false;
		}
	}
	
	var sowmsmemo = nlapiGetFieldValue('custentity_djkk_sowmsmemo'); //DJ_�������q�Ɍ������l
	if(!isEmpty(sowmsmemo)){
		var sowmsmemotring = sowmsmemo.toString();
		var sowmsmemoBytes = getBytes(sowmsmemotring);
		if(sowmsmemoBytes > 160){
			alert("DJ_�������q�Ɍ������l�̃o�C�g����160���傫���̂ŁA�ē��͂��Ă�������");
		    return false;
		}
	}
	
	//changed by song add DENISJAPAN-486 end
	return true;	
}

var getBytes = function (string) {
	var utf8 = unescape(encodeURIComponent(string));
	var arr = [];

	for (var i = 0; i < utf8.length; i++) {
	    arr.push(utf8.charCodeAt(i));
	}
	return arr.length;
}
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
function clientFieldChanged(type, name, linenum) {
	
	//2022/03/24 geng �ڋq DJ_�x������ �x�������i���ߓ�����) start
	// changed by ycx 2022/03/28
	if(name == 'custentity_djkk_payment_conditions'){
		var subsidiary = nlapiGetFieldValue('subsidiary');
		if(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK ){
		var conditionsValue = nlapiGetFieldValue('custentity_djkk_payment_conditions');
		if(conditionsValue == 2){
			nlapiSetFieldValue('terms',7)
			}else if(conditionsValue == 1){
			nlapiSetFieldValue('terms',10)
			}		
			
	}
	  
	}
	//end
	
	//changed by geng add srart U625
	if(name=='custentity_djkk_area'){
		var custarea = nlapiGetFieldValue('custentity_djkk_area');
		var subValCust = nlapiGetFieldValue('subsidiary');
		var customform = nlapiGetFieldValue('customform');
		if(!isEmpty(custarea)){
			// changed by song add 2022/11/24 CH123
//			if((subValCust==SUB_DPKK || subValCust==SUB_SCETI)|| customform=='128'){
				if(custarea=='14'||custarea=='12'){
					nlapiSetFieldValue('taxitem','8');
				}else{
					nlapiSetFieldValue('taxitem','');
				}
//			}
			//CH123 changed by song add end 2022/11/24
		}
	}
	//changed by geng add end U625
	if(name == 'parent'){
	    var sub=nlapiGetFieldValue('subsidiary'); 	    
	    parentSub = sub;
	}
	//changed by song add DENISJAPANDEV-1388 start
	if(name == 'subsidiary'){
		var recordType = nlapiGetRecordType();
		var sub=nlapiGetFieldValue('subsidiary'); 
		if(!isEmpty(sub)){
		    var customForm=nlapiGetFieldValue('customform'); 
			if(sub == SUB_NBKK || sub == SUB_ULKK){
	    		if(recordType == 'lead'){ //���[�h
	    		    if (customForm != '142') {
	                    nlapiSetFieldValue('customform', '142'); //�J�X�^���t�H�[��   
	    		    }
	    			nlapiSetFieldValue('custentity_djkk_customer_type', '1',false,true); //DJ_�ڋq�^�C�v 
	    		}else if(recordType = 'customer'){ //�ڋq
	    		    if (customForm != '80') {
	                    nlapiSetFieldValue('customform', '80'); //�J�X�^���t�H�[��   
	    		    }
	    			nlapiSetFieldValue('custentity_djkk_customer_type', '3',false,true); //DJ_�ڋq�^�C�v 
	    		}else if(recordType == 'prospect'){ //���݌ڋq
	    		    if (customForm != '141') {
	                    nlapiSetFieldValue('customform', '141'); //�J�X�^���t�H�[��   
	    		    }
	    			nlapiSetFieldValue('custentity_djkk_customer_type', '2',false,true); //DJ_�ڋq�^�C�v 
	    		}
			}
		} else {
		    nlapiSetFieldValue('subsidiary', parentSub, false); //�J�X�^���t�H�[��
		}
	}
	//changed by song add DENISJAPANDEV-1388 end
	
    // DJ_�ڋq�^�C�v
    if (name == 'custentity_djkk_customer_type') {
        var customerType = nlapiGetFieldValue('custentity_djkk_customer_type');
        var form = nlapiGetFieldText('customform');
        var isperson=nlapiGetFieldValue('isperson');
        var sub=nlapiGetFieldValue('subsidiary');
        if(!isEmpty(sub)){
        	/*91	DJ_���[�h�E�t�H�[��_LS
        	142	DJ_���[�h�E�t�H�[��_�H�i
        	138	DJ_���݌ڋq�t�H�[��_LS
        	141	DJ_���݌ڋq�t�H�[��_�H�i
        	137	DJ_�֌W��ЊԌڋq�t�H�[��_LS
        	143	DJ_�֌W��ЊԌڋq�t�H�[��_�H�i
        	128	DJ_�ڋq�t�H�[��_LS
        	117	DJ_�ڋq�t�H�[��_���F
        	80	DJ_�ڋq�t�H�[��_�H�i	
        	-8	���[�h�E�t�H�[��(�W��)
           -9	�֌W��ЊԌڋq�t�H�[��(�W��)
            -2	�ڋq�t�H�[��(�W��)*/
            // ���[�h
            if (customerType == '1' && form.indexOf('���[�h') < 0) {

              // �H�i
            	if(sub==SUB_NBKK||sub==SUB_ULKK){
            		nlapiSetFieldValue('customform', '142');
            		
            		// LS
            	}else if(sub==SUB_SCETI||sub==SUB_DPKK){
            		nlapiSetFieldValue('customform', '91');
            	}else{
            		nlapiSetFieldValue('customform', '142');
            	}
                
                // ���݌ڋq
            } else if (customerType == '2' && form.indexOf('���݌ڋq') < 0) {

               // �H�i
            	if(sub==SUB_NBKK||sub==SUB_ULKK){
            		nlapiSetFieldValue('customform', '141');
            		
            		// LS
            	}else if(sub==SUB_SCETI||sub==SUB_DPKK){
            		nlapiSetFieldValue('customform', '138');
            	}else{
            		nlapiSetFieldValue('customform', '141');
            	}

                // �ڋq
            } else if (customerType == '3' && (form.indexOf('�ڋq') < 0 || form.indexOf('���݌ڋq') > -1)) {

              // �H�i
            	if(sub==SUB_NBKK||sub==SUB_ULKK){
            		nlapiSetFieldValue('customform', '80');
            		
            		// LS
            	}else if(sub==SUB_SCETI||sub==SUB_DPKK){
            		nlapiSetFieldValue('customform', '128');
            	}else{
            		nlapiSetFieldValue('customform', '80');
            	}
            }
        }
        if(!isEmpty(customerType)&&useType=='create'){
        if(isperson=='T'&&(customerType=='2'||customerType=='3')){
        	 var getReceivabAcc=getReceivab(customerType,'2');
          	  nlapiSetFieldValue('receivablesaccount', getReceivabAcc);
          	  nlapiSetFieldValue('openingbalanceaccount', getReceivabAcc);
        }else{
          var getReceivabAcc=getReceivab(customerType,'1');
       	  nlapiSetFieldValue('receivablesaccount', getReceivabAcc);
       	  nlapiSetFieldValue('openingbalanceaccount', getReceivabAcc);
        }
        }
    }
    
    if(name=='isperson'&&useType=='create'){
    	var customerTypec = nlapiGetFieldValue('custentity_djkk_customer_type');
    	var isperson=nlapiGetFieldValue('isperson');
    	 if(!isEmpty(customerTypec)){
      if(isperson=='T'&&(customerTypec=='2'||customerTypec=='3')){
    	  var getReceivabAcc=getReceivab(customerTypec,'2');
    	  nlapiSetFieldValue('receivablesaccount', getReceivabAcc);
    	  nlapiSetFieldValue('openingbalanceaccount', getReceivabAcc);
    	  
      }else{
    	  var getReceivabAcc=getReceivab(customerTypec,'1');
    	  nlapiSetFieldValue('receivablesaccount', getReceivabAcc);
    	  nlapiSetFieldValue('openingbalanceaccount', getReceivabAcc);
      }
    	 }
    }
 // DJ_�ڋq�x������
	if (name == 'custentity_djkk_customer_payment') {
		var customerPaymentID = nlapiGetFieldValue('custentity_djkk_customer_payment');
		if (!isEmpty(customerPaymentID)) {
			var customerPaymentDataArray = nlapiLookupField(
					'customrecord_djkk_customer_payment', customerPaymentID, [
							'custrecord_djkk_end_day',
							'custrecord_djkk_payment_date',
							'custrecord_djkk_payment_period_month' ]);
			nlapiSelectNewLineItem('recmachcustrecord_suitel10n_jp_pt_customer');
						
			// ���� 	
			nlapiSetCurrentLineItemValue(
					'recmachcustrecord_suitel10n_jp_pt_customer',
					'custrecord_suitel10n_jp_pt_closing_day',
					customerPaymentDataArray.custrecord_djkk_end_day);
			
			// �x������
			nlapiSetCurrentLineItemValue(
					'recmachcustrecord_suitel10n_jp_pt_customer',
					'custrecord_suitel10n_jp_pt_paym_due_day',
					customerPaymentDataArray.custrecord_djkk_payment_date);
			
			// �x��������
			nlapiSetCurrentLineItemValue(
					'recmachcustrecord_suitel10n_jp_pt_customer',
					'custrecord_suitel10n_jp_pt_paym_due_mo',
					customerPaymentDataArray.custrecord_djkk_payment_period_month);
			nlapiCommitLineItem('recmachcustrecord_suitel10n_jp_pt_customer');
			//20221219 changed by zhou CH217
			//�uDJ_�ڋq�x�������v�� �I���������X�g�̃A�C�e�����\�����ꑱ����悤�ɂ���
			/**********old**********/
//			nlapiSetFieldValue('custentity_djkk_customer_payment','', false,
//					true);
			/**********old**********/
			/**********new**********/
			var cust = nlapiGetFieldValue('customform');
			if(cust == '80'||cust == '141'||cust == '142'||cust == '143'){
				nlapiSetFieldValue('custentity_djkk_customer_payment',customerPaymentID, false,true);
			}
			/**********new**********/
		}
	}
	
	//���������M�ƍ��v���������M�����`�F�b�N�s��
	if(name == 'custentity_djkk_totalinv_pdfsend_flg' || name == 'custentity_djkk_invoice_automatic'){
		if(nlapiGetFieldValue('custentity_djkk_totalinv_pdfsend_flg') == 'T' && nlapiGetFieldValue('custentity_djkk_invoice_automatic')  == 'T'){
			alert('�������������M�ƍ��v�������������M�t���O�����`�F�b�N�o���܂���');
			nlapiSetFieldValue(name, 'F');
		}
	}
	
	//�E���v�������������M�t���O�Ƀ`�F�b�N����ꂽ�玩���I�Ɂu���v������������O�v�t���O�Ƀ`�F�b�N������B
	if(name == 'custentity_djkk_totalinv_pdfsend_flg'){
		if(nlapiGetFieldValue('custentity_djkk_totalinv_pdfsend_flg') == 'T'){
			nlapiSetFieldValue('custentity_djkk_totalinv_print_ex', 'T')
		}
		
	}
	
//	// DENISJAPAN-255 add by ycx 2021/06/02
//	var userRole=nlapiGetRole();
//	
//	// �Ǘ���
//	if(userRole!='3'){   
//	// DJ_��ЊԎ���p
//	if (name == 'custentity_djkk_intercompany_transac') {
//		try {
//			var intercompany = nlapiGetFieldValue('custentity_djkk_intercompany_transac');
//			var headerSubsidiary = nlapiGetFieldValue('subsidiary');
//			if (intercompany == 'F') {
//				var scount = nlapiGetLineItemCount('submachine');
//				for (var su = 1; su < scount + 1; su++) {
//					var lineSubsidiary = nlapiGetLineItemValue('submachine','subsidiary', su);
//					if (lineSubsidiary != headerSubsidiary) {
//						nlapiRemoveLineItem('submachine', su);
//					}
//				}
//
//			}
//		} catch (e) {}
//	}
//	}
//	//add end
	
	//DJ_���v������PDF���t�t���O �`���b�N���ꂽ�ꍇ�ADJ_���v�������������M�t���O�����ݒ肷��
//	if(name == 'custentity_djkk_totalinv_pdfsend_flg' ) {
//		if(nlapiGetFieldValue('custentity_djkk_totalinv_pdfsend_flg') == 'T'){
//			nlapiSetFieldValue('custentity_djkk_totalinv_autosend_flg', 'T');
//		}
//		
//	}
//20220711 add by zhou
//U785
	if(type == 'addressbook' ) {
		//�H�i
		var subsidiary = getRoleSubsidiary();
		if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){ 
		var DbillingAddress = nlapiGetLineItemValue("addressbook","defaultbilling",linenum);//�f�t�H���g������
			if(DbillingAddress =='T'){
				nlapiSelectLineItem('addressbook', linenum);
				var subrecord = nlapiViewCurrentLineItemSubrecord('addressbook','addressbookaddress');
				if(!isEmpty(subrecord)){
					var addrphoneInSubRecord  = subrecord.getFieldValue('addrphone');
					var FaxInSubRecord  = subrecord.getFieldValue('custrecord_djkk_address_fax');
					var phone = nlapiGetFieldValue('phone');
					var fax = nlapiGetFieldValue('fax');
					if(isEmpty(phone)){
						nlapiSetFieldValue('phone',addrphoneInSubRecord);
					}
					if(isEmpty(fax)){
						nlapiSetFieldValue('fax',FaxInSubRecord);
							
					}
				}
			}
		}
	}
//end
	//20221219 add by zhou CH214
	if(name == 'custentity_4392_useids'){ 
		var cust = nlapiGetFieldValue('customform');
		if((cust == '80'||cust == '141'||cust == '142'||cust == '143')&&nlapiGetFieldValue('custentity_4392_useids') == 'F'){
			console.log('111')
			nlapiSetFieldValue('custentity_jp_duedatecompute','F')
//			nlapiSetFieldValue('custentity_jp_due_date_adjustment','')
		}
	}
	//end
	
	
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type){
//	// DENISJAPAN-255 add by ycx 2021/06/02
//	var userRole=nlapiGetRole();
//	
//	// �Ǘ���
//	if(userRole!='3'){   
//	if (type == 'submachine') {
//		try {
//			var flag = false;
//			var headerSubsidiary = nlapiGetFieldValue('subsidiary');
//			var scount = nlapiGetLineItemCount('submachine');
//			// DJ_��ЊԎ���p
//			var intercompany = nlapiGetFieldValue('custentity_djkk_intercompany_transac');
//			if (intercompany == 'F') {
//				for (var su = 1; su < scount + 1; su++) {
//					var lineSubsidiary = nlapiGetLineItemValue('submachine','subsidiary', su);
//					if (lineSubsidiary != headerSubsidiary) {
//						flag = true;
//						nlapiRemoveLineItem('submachine', su);
//					}
//				}
//				if (flag) {
//					alert('DJ_��ЊԎ���p�I������Ă��܂���A�q��ЕҏW�s��');
//				}
//			}
//		} catch (e) {}
//	}
//  }
//	// add end
}
/*
 * �o�ג�~
 * */
function shipmentstop(){
	var theLink = '';
	var id=nlapiGetRecordId();
	var record=nlapiLoadRecord('customer', id);
	var salesrep=record.getFieldValue('salesrep');	
	var stopFlag=record.getFieldValue('custentity_djkk_shipping_suspend_flag');
	if(stopFlag=='T'){
		alert('���̌ڋq�͂��łɁu�o�ג�~�v��Ԃɂ���܂�');
	}else{
		var theLink = nlapiResolveURL('SUITELET',
				'customscript_djkk_sl_customer_shipstop',
				'customdeploy_djkk_sl_customer_shipstop');
				 theLink+='&stoptype=T';
		        theLink+='&customerid='+id;
		        nlExtOpenWindow(theLink, 'newwindow',600, 300, this, false, '�o�ג�~');
	}
}

/*
 * �o�׉�
 * */
function shipmentback(){
	var theLink = '';
	var id=nlapiGetRecordId();
	var record=nlapiLoadRecord('customer', id);
	var stopFlag=record.getFieldValue('custentity_djkk_shipping_suspend_flag');
	if(stopFlag=='F'){
		alert('���̌ڋq�́u�o�ג�~�v�X�e�[�^�X�ł͂���܂���');
	}else{
		var theLink = nlapiResolveURL('SUITELET',
				'customscript_djkk_sl_customer_shipstop',
				'customdeploy_djkk_sl_customer_shipstop');
				 theLink+='&stoptype=F';
		        theLink+='&customerid='+id;
		        nlExtOpenWindow(theLink, 'newwindow',600, 300, this, false, '�o�׉�');
	}
}

/*
 * DJ_�ڋq���|���茟��
 * */
function getReceivab(type,isperson){
var receivabSearch = nlapiSearchRecord("customrecord_djkk_accounts_receivab",null,
		[
		   ["custrecord_djkk_customer_type","anyof",type], 
		   "AND", 
		   ["custrecord_djkk_isperson","anyof",isperson]
		], 
		[
		   new nlobjSearchColumn("custrecord_djkk_receivablesaccount")
		]
		);
if(!isEmpty(receivabSearch)){
return receivabSearch[0].getValue('custrecord_djkk_receivablesaccount');
}else{
	return '';
}
return '';
}


/*
 * U719 �Z���̃R�s�[
 * */
function copyaddress() {
	var count = nlapiGetLineItemCount('addressbook');
    if(count=='0'){
		alert('�R�s�[�ł���Z��������܂���');
		return;
	}
	nlapiSelectLineItem('addressbook', count);	
    var label=nlapiGetCurrentLineItemValue('addressbook', 'label');
	var subrecord = nlapiViewCurrentLineItemSubrecord('addressbook','addressbookaddress');
	nlapiSelectNewLineItem('addressbook');
	var copySubrecord = nlapiCreateCurrentLineItemSubrecord('addressbook','addressbookaddress');

	copySubrecord.setFieldValue('country', subrecord.getFieldValue('country'),false,true);
	copySubrecord.setFieldValue('zip', subrecord.getFieldValue('zip'),false,true);
	copySubrecord.setFieldValue('custrecord_djkk_address_state', subrecord.getFieldValue('custrecord_djkk_address_state'),false,true);
	copySubrecord.setFieldValue('city', subrecord.getFieldValue('city'),false,true);
	copySubrecord.setFieldValue('addr1', subrecord.getFieldValue('addr1'),false,true);
	copySubrecord.setFieldValue('addr2', subrecord.getFieldValue('addr2'),false,true);
	copySubrecord.setFieldValue('custrecord_djkk_address_fax', subrecord.getFieldValue('custrecord_djkk_address_fax'),false,true);
	copySubrecord.setFieldValue('addressee', subrecord.getFieldValue('addressee'),false,true);
	copySubrecord.setFieldValue('attention', subrecord.getFieldValue('attention'),false,true);
	copySubrecord.setFieldValue('addrphone', subrecord.getFieldValue('addrphone'),false,true);
//	copySubrecord.setFieldValue('custrecord_djkk_shipcompany_instructions', subrecord.getFieldValue('custrecord_djkk_shipcompany_instructions'),false,true);//DENISJAPAN-489���\��
//	copySubrecord.setFieldValue('custrecord_djkk_location_instructions', subrecord.getFieldValue('custrecord_djkk_location_instructions'),false,true);//DENISJAPAN-489���\��
	copySubrecord.setFieldValue('custrecord_djkk_mail', subrecord.getFieldValue('custrecord_djkk_mail'),false,true);
	copySubrecord.commit();
	nlapiSetCurrentLineItemValue('addressbook', 'label', label,false,true);
	nlapiCommitLineItem('addressbook');
}