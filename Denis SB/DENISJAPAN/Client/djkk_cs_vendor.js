/**
 * �w�����Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/01     CPC_��            �V�K�쐬
 *
 */
var useType='';
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
	useType=type;
	//20221024 add by zhou
	//CH038 �E�d����}�X�^�@DJ_�t�H�[�L���X�g�ΏہADJ_�x�������Ώۃt���O�̏����l�̓`�F�b�N�I���̏�Ԃɂ���
	var subsidiary = getRoleSubsidiary();
	nlapiSetFieldValue('custentity_djkk_new_brand', null);
	if(type == 'create'){
		if(nlapiGetFieldValue('customform')== 76){
			nlapiSetFieldValue('custentity_djkk_fc_flag', 'T',false);
			nlapiSetFieldValue('custentity_djkk_billable_flag', 'T',false);
		}
	}
	//end
	if(type == 'edit'){
		setFieldDisableType('entityid', 'disabled');
	}
	// DENISJAPAN-255 add by ycx 2021/06/02
	var userRole=nlapiGetRole();
	
	// �Ǘ���
	if(userRole!='3'||userRole!='1025'||userRole!='1026'){
	// ���[���E�Ӊ�Ђ̎擾
	var roleSubsidiary = nlapiGetFieldValue('custentity_syokuseki');
	
	var customformID = nlapiGetFieldValue('customform');
	
	if(customformID != VENDOR_CUSTOMFORM_DISABLED_LS_ID && customformID != VENDOR_CUSTOMFORM_DISABLED_LS_FOOD){
		setFieldDisableType('subsidiary', 'disabled');
	}
	//setFieldDisableType('subsidiary', 'disabled');
//	if(type!='edit'){
//		nlapiSetFieldValue('subsidiary', roleSubsidiary, false, true);
//	}
	}
	// add end
	//nlapiSetFieldValue('custentity_djkk_requester', nlapiGetUser(), false, true);
    if(useType=='create'){
    	var isperson=nlapiGetFieldValue('isperson');
      if(isperson=='T'){
    	  var accountid=getVReceivab('2');
    	  nlapiSetFieldValue('payablesaccount', accountid,false,true);
    	  nlapiSetFieldValue('openingbalanceaccount', accountid,false,true);
      }else{
    	  var accountid=getVReceivab('1');
    	  nlapiSetFieldValue('payablesaccount', accountid,false,true); 
    	  nlapiSetFieldValue('openingbalanceaccount',accountid,false,true);
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
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
	
	if(name=='custentity_djkk_billable_flag'){
		if(nlapiGetFieldValue('custentity_djkk_billable_flag')=='T'){
		    nlapiSetFieldValue('custentity_djkk_fc_flag', 'F',false,true); 
		}
	}
	if(name=='custentity_djkk_fc_flag'){
		if(nlapiGetFieldValue('custentity_djkk_fc_flag')=='T'){
			nlapiSetFieldValue('custentity_djkk_billable_flag', 'F',false,true); 	
		}
	}
    if((name=='isperson'||name=='subsidiary')&&useType=='create'){
    	var isperson=nlapiGetFieldValue('isperson');
      if(isperson=='T'){
    	  var accountid=getVReceivab('2');
    	  nlapiSetFieldValue('payablesaccount', accountid,false,true);
    	  nlapiSetFieldValue('openingbalanceaccount', accountid,false,true);
      }else{
    	  var accountid=getVReceivab('1');
    	  nlapiSetFieldValue('payablesaccount', accountid,false,true); 
    	  nlapiSetFieldValue('openingbalanceaccount',accountid,false,true);
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
//   }
//	//add end
//	// DJ_�w����x������(�@�\�폜����)
//	if (name == 'custentity_djkk_vendor_payment') {
//		var vendorPaymentID = nlapiGetFieldValue('custentity_djkk_vendor_payment');
//		if (!isEmpty(vendorPaymentID)) {
//			var vendorPaymentDataArray = nlapiLookupField(
//					'customrecord_djkk_vendor_payment', vendorPaymentID, [
//							'custrecord_djkk_end_day',
//							'custrecord_djkk_payment_date',
//							'custrecord_djkk_payment_period_month' ]);
//			nlapiSelectNewLineItem('recmachcustrecord_suitel10n_jp_pt_vendor');
//			
//			// ���� 	
//			nlapiSetCurrentLineItemValue(
//					'recmachcustrecord_suitel10n_jp_pt_vendor',
//					'custrecord_suitel10n_jp_pt_closing_day',
//					vendorPaymentDataArray.custrecord_djkk_end_day);
//			
//			// �x������
//			nlapiSetCurrentLineItemValue(
//					'recmachcustrecord_suitel10n_jp_pt_vendor',
//					'custrecord_suitel10n_jp_pt_paym_due_day',
//					vendorPaymentDataArray.custrecord_djkk_payment_date);
//			
//			// �x��������
//			nlapiSetCurrentLineItemValue(
//					'recmachcustrecord_suitel10n_jp_pt_vendor',
//					'custrecord_suitel10n_jp_pt_paym_due_mo',
//					vendorPaymentDataArray.custrecord_djkk_payment_period_month);
//			nlapiCommitLineItem('recmachcustrecord_suitel10n_jp_pt_vendor');
//			nlapiSetFieldValue('custentity_djkk_vendor_payment','', false,
//					true);
//		}
//	}
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

//U399 Tax���ڂ�K�{����
function clientSaveRecord() {
	var custForm = nlapiGetFieldValue('customform');
	if(custForm == '66'){
		var brand = nlapiGetFieldValue('custentity_djkk_new_brand');
		var brandCode = nlapiGetFieldValue('custentity_djkk_brand_code');
		if(isEmpty(brand)&&isEmpty(brandCode)){
			alert('DJ_�u�����h���܂���DJ_�u�����h����͂��Ă��������B')
			return false;
		}
	}
	var sub = nlapiGetFieldValue('subsidiary');
	var count = nlapiGetLineItemCount('submachine');
	//20221024 changed by zhou  CH067
	//�d�����V�K�o�^�̏ꍇ��Tax���ڂ͕K�{���͂ɂȂ��Ă��Ȃ��ł��B
//	if(count == 0){
//		  alert('�ŋ��R�[�h����͂��Ă��������B');
//		  return false;
//	}
//	if(sub != SUB_NBKK && sub != SUB_ULKK){
//		for(var i = 1;i <= count ;i++){
//			var taxitem = nlapiGetLineItemValue('submachine', 'taxitem', i);
//			   if(taxitem == ''){
//				  alert('�ŋ��R�[�h����͂��Ă��������B');
//				  return false;
//			   }
//		 }
//	}
	//end
	return true;
}

/*
 * DJ_�d���攄�|����
 * */
function getVReceivab(isperson){
	var receivabSearch = nlapiSearchRecord("customrecord_djkk_accounts_vendor",null,
			[
			   ["custrecord_djkk_isperson_vendor","anyof",isperson]
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_v_payablesaccount")
			]
			);
if(!isEmpty(receivabSearch)){
return receivabSearch[0].getValue('custrecord_djkk_v_payablesaccount');
}else{
	return '';
}
return '';
}