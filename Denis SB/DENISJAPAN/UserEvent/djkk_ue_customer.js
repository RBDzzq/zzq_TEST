/**
 * 顧客のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/26     CPC_苑             新規作成
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
    //20230831 by add start
      if (type == 'edit') {
        var subDisType = form.getField('subsidiary');
        subDisType.setDisplayType('normal');
//        subDisType.setDisplayType('disabled');
    }
    //20230831 by add end
      
	if(type=='create'){
		nlapiSetFieldValue('custentity_djkk_request_class', '1', false, true);
//20220708 add by zhou  start U785
		var roleSubsidiary=getRoleSubsidiary();
		// 食品
		if(roleSubsidiary==SUB_NBKK||roleSubsidiary==SUB_ULKK){
			nlapiSetFieldValue('custentity_djkk_print_group','12');
    	}
//end
	}
	
	try{
	var roleSubsidiary=getRoleSubsidiary();
    nlapiSetFieldValue('custentity_syokuseki', roleSubsidiary); 
    
    var customformID = nlapiGetFieldValue('customform');

    if(customformID=='80'||customformID=='141'||customformID=='142'||customformID=='143'){
    	setFieldDisableType('custentity_djkk_customer_type', 'hidden');
    	var recordType=nlapiGetRecordType();
    	if(recordType=='customer'){
    		  // DJ_顧客タイプ .顧客
            nlapiSetFieldValue('custentity_djkk_customer_type', '3');
    	}else if(recordType=='prospect'){
    		// DJ_顧客タイプ .潜在顧客
            nlapiSetFieldValue('custentity_djkk_customer_type', '2');
    	}else if(recordType=='lead'){
    		// DJ_顧客タイプ .リード
            nlapiSetFieldValue('custentity_djkk_customer_type', '1');
    	}  	   	
    }
	
	
    /***************************/
    // TODO 承認処理 need to delete
//old
//    if(customformID!='117'){
//    	nlapiSetFieldValue('custentity_djkk_approval_deal_flg', 'F'); 
//    	nlapiSetFieldValue('custentity_djkk_effective_recognition', 'T'); 	
//    }
    //new
    
       // change by ycx 2023/02/20
  //old
//    if(customformID!='117'&&customformID!='137'){
//    	nlapiSetFieldValue('custentity_djkk_approval_deal_flg', 'F'); 
//    	nlapiSetFieldValue('custentity_djkk_effective_recognition', 'T'); 	
//   }
  //new
    	nlapiSetFieldValue('custentity_djkk_approval_deal_flg', 'T'); 
    	nlapiSetFieldValue('custentity_djkk_effective_recognition', 'F'); 	
   
    // change end by ycx 2023/02/20
    /***************************/
//    old
//	if(customformID != CUSTOMER_CUSTOMFORM_DISABLED_LS_ID && customformID != CUSTOMER_CUSTOMFORM_DISABLED_LS_FOOD){
//		nlapiSetFieldValue('subsidiary', roleSubsidiary); 
//	}

    //new
	if(customformID != CUSTOMER_CUSTOMFORM_DISABLED_LS_FOOD){
		nlapiSetFieldValue('subsidiary', roleSubsidiary); 
	}
    
    //nlapiSetFieldValue('subsidiary', roleSubsidiary); 
    var userRole=nlapiGetRole();
	var roleName = nlapiLookupField('role', userRole, 'name');
    if(roleName.indexOf('経理')<0&&userRole!='3'){
    	
    	// 親会社
    	setFieldDisableType('parent', 'hidden');
    	
    	// 財務 Tab
//    	formHiddenTab(form,'financialtxt');
    	//changed by geng add start U597
    	//顧客財務Tabの非表示の解除
    	if(customformID=='128' || customformID=='91' || customformID=='138' || customformID=='137'){
    		setFieldDisableType('accountnumber','disabled');
        	setFieldDisableType('pricelevel','disabled');
        	setFieldDisableType('groupinvoices','disabled');
        	setFieldDisableType('receivablesaccount','disabled');
        	setFieldDisableType('openingbalance','disabled');
        	setFieldDisableType('taxitem','disabled');
        	setFieldDisableType('openingbalancedate','disabled');
        	setFieldDisableType('openingbalanceaccount','disabled');
        	setFieldDisableType('custentity_jp4030_due_month','disabled');
        	setFieldDisableType('thirdpartyzipcode','disabled');
        	setFieldDisableType('thirdpartycarrier','disabled');
        	setFieldDisableType('thirdpartyacct','disabled');
        	setFieldDisableType('thirdpartycountry','disabled');
        	setFieldDisableType('custentity_jp_due_date_adjustment','disabled');
        	setLineItemDisableType('currency','currency','disabled');
        	setLineItemDisableType('currency','displaysymbol','disabled');
        	setLineItemDisableType('currency','overridecurrencyformat','disabled');
        	setLineItemDisableType('currency','symbolplacement','disabled');
    	}else{
    	 	// 財務 Tab
        	formHiddenTab(form,'financialtxt');
    	}
    	//changed by geng add end U597
    	//changed by wang add start U091
    	if(customformID=='41' || customformID=='42' || customformID=='43' || customformID=='80'){
    		setFieldDisableType('isinactive','disabled');
//        	setFieldDisableType('custentity_djkk_customer_payment','disabled');
//        	setFieldDisableType('custentity_dj_custpayment_bankname','disabled');
//        	setFieldDisableType('custentity_dj_custpayment_branchname','disabled');
//        	setFieldDisableType('custentity_dj_custpayment_clientname','disabled');
//        	setFieldDisableType('custentity_jp_duedatecompute','disabled');
//        	setFieldDisableType('custentity_jp_due_date_adjustment','disabled');
//        	setFieldDisableType('custentity_djkk_payment_conditions','disabled');
//        	setLineItemDisableType('recmachcustrecord_suitel10n_jp_pt_customer','custrecord_suitel10n_jp_pt_closing_day','disabled');
//        	setLineItemDisableType('recmachcustrecord_suitel10n_jp_pt_customer','custrecord_suitel10n_jp_pt_paym_due_day','disabled');
//        	setLineItemDisableType('recmachcustrecord_suitel10n_jp_pt_customer','custrecord_suitel10n_jp_pt_paym_due_mo','disabled');
    	}
    	
    	//changed by wang add end U091
    	
    }
    form.setScript('customscript_djkk_cs_customer');
	if (type == 'view') {
		//20230301 changed by zhou CH344 start
		if(roleSubsidiary==SUB_SCETI||roleSubsidiary==SUB_DPKK){
			setFieldDisableType('custentity_djkk_customer_payment', 'hidden');
    	}
		//end
			
		if (nlapiGetFieldValue('custentity_djkk_effective_recognition')=='T') {
			if(roleName.indexOf('営業')>-1){
				form.addButton('custpage_shipmentback','出荷回復', 'shipmentback();');
			}else if(roleName.indexOf('経理')>-1||userRole=='3'){
				form.addButton('custpage_shipmentstop','出荷停止', 'shipmentstop();');
				form.addButton('custpage_shipmentback','出荷回復', 'shipmentback();');
			}	
		}								
	}
	if((type=='create'||type=='edit'||type=='copy')&&(roleSubsidiary==SUB_SCETI||roleSubsidiary==SUB_DPKK)){
	form.addButton('custpage_copyaddress','住所コピー', 'copyaddress();');
	}
	form.addFieldGroup('custpage_requestday_group', '請求日');
	//var requestdayField=form.addField('custpage_requestday', 'date', '請求日', null,'custpage_requestday_group');
	
	
	//redio

	
	if(type == 'create'){
		var orgType=form.addField('custpage_requestday_flag', 'radio','出荷日','sd','custpage_requestday_group');
		form.addField('custpage_requestday_flag', 'radio', '納品日', 'dd','custpage_requestday_group');
	}else if(type == 'edit'){
		var approvalStatus = nlapiGetFieldValue('custentity_djkk_approval_status');
		if(approvalStatus == '2'){
		if(userRole == '1022'){
			var orgType=form.addField('custpage_requestday_flag', 'radio','出荷日','sd','custpage_requestday_group');
			form.addField('custpage_requestday_flag', 'radio', '納品日', 'dd','custpage_requestday_group');
		}else{
			var orgType=form.addField('custpage_requestday_flag', 'radio','出荷日','sd','custpage_requestday_group').setDisplayType('disabled');
			form.addField('custpage_requestday_flag', 'radio', '納品日', 'dd','custpage_requestday_group').setDisplayType('disabled');
		}
		}else{
			var orgType=form.addField('custpage_requestday_flag', 'radio','出荷日','sd','custpage_requestday_group');
			form.addField('custpage_requestday_flag', 'radio', '納品日', 'dd','custpage_requestday_group');
		}
	}else if(type == 'view'){
		var orgType=form.addField('custpage_requestday_flag', 'radio','出荷日','sd','custpage_requestday_group').setDisplayType('disabled');
		form.addField('custpage_requestday_flag', 'radio', '納品日', 'dd','custpage_requestday_group').setDisplayType('disabled');
	}
	
	
	var requestdayType=nlapiGetFieldValue('custentity_djkk_requestday_flag');
	//var requestday=nlapiGetFieldValue('custentity_djkk_requestday');
	if(isEmpty(requestdayType)){
		
		// 食品
		if(roleSubsidiary==SUB_NBKK||roleSubsidiary==SUB_ULKK){
			orgType.setDefaultValue('dd');
    		// LS
    	}else if(roleSubsidiary==SUB_SCETI||roleSubsidiary==SUB_DPKK){
    		orgType.setDefaultValue('dd');
    	}else{
    		orgType.setDefaultValue('dd');
    	}	
	}else{
		orgType.setDefaultValue(requestdayType);
	}
	//requestdayField.setDefaultValue(nlapiGetFieldValue('custentity_djkk_requestday'));
	setFieldDisableType('custpage_lsa_vis','hidden');	
	}catch(e){
		
	}
}
function userEventBeforeSubmit(type){
	//20220712 add by zhou
	//U785
	var roleSubsidiary = getRoleSubsidiary();
	var printGroup =  nlapiGetFieldValue('custentity_djkk_print_group');
	if((roleSubsidiary==SUB_NBKK||roleSubsidiary==SUB_ULKK)&&isEmpty(printGroup)){
		nlapiSetFieldValue('custentity_djkk_print_group','12');
	}
	//end
	
	//CH197 start
	var salesrepText = nlapiGetFieldText('salesrep');
	nlapiSetFieldValue('custentity_djkk_salesrep_pdf_show', salesrepText);
	//end
	
	try{
			nlapiSetFieldValue('custentity_djkk_requestday_flag', nlapiGetFieldValue('custpage_requestday_flag'));
}catch(e){
		
	}

	//DENISJAPAN-717
	//var customformID = nlapiGetFieldValue('customform');
	//if(customformID=='128'){//食品側はDJ_言語は利用しないのでLS側を実装します
		var language = nlapiGetFieldValue('language');
		var djLanguage = nlapiGetFieldValue('custentity_djkk_language');//英語13、日本語26
		if(!isEmpty(language)&&isEmpty(djLanguage)){
			if(language == 'en'){
				nlapiSetFieldValue('custentity_djkk_language', '13');
			}else if(language == 'ja_JP'){
				nlapiSetFieldValue('custentity_djkk_language', '26');
			}
		}else if(!isEmpty(djLanguage)&&isEmpty(language)){
			if(djLanguage == '13'){
				nlapiSetFieldValue('language', 'en');
			}else if(djLanguage == '26'){
				nlapiSetFieldValue('language', 'ja_JP');
			}
			//add by zzq　バグ対応 20230619 start
		}else if(!isEmpty(djLanguage)&&!isEmpty(language)){
		    if( djLanguage == '13' && language == 'ja_JP'){
		        nlapiSetFieldValue('custentity_djkk_language', '26');
		    }
		    if( djLanguage == '26' && language == 'en'){
                nlapiSetFieldValue('custentity_djkk_language', '13');
            }
        }
		//add by zzq　バグ対応 20230619 end

	//}
//	nlapiLogExecution('debug', 'language', language);
//	nlapiLogExecution('debug', 'djLanguage', djLanguage);
		
		//20230717 add by zhou start CH738
		try{
			var fieldSub = nlapiGetFieldValue("subsidiary");
			if(fieldSub != SUB_SCETI && fieldSub != SUB_DPKK){
				var productGroup = nlapiGetFieldText('custentity_djkk_product_category_jp');
			}else{
				var productGroup = nlapiGetFieldText('custentity_djkk_product_category_scetikk');
			}
			
			if(!isEmpty(productGroup)){
				productGroup = productGroup.split(' ');
				var productNum = productGroup[0];//xxx
				if(productNum){
					var firstChar = productNum.substring(0, 1);//x
					var firstTwoChars = productNum.substring(0, 2);//xx
					var product = [productNum,firstChar,firstTwoChars];//[xxx,x,xx]
					for (var i = 0; i < product.length; i++) {
						var productGroupsearch = nlapiSearchRecord("customrecord_djkk_customer_group",null,
								[
									[ "custrecord_djkk_cg_id", "is", product[i]],// DJ_製品グループID
									"AND",
									[ "custrecord_djkk_cg_subsidiary", "anyof", fieldSub ] ],
								[ 
								    new nlobjSearchColumn("custrecord_djkk_cg_id"), // DJ_製品グループID
								    new nlobjSearchColumn("name") // 名前
								]);
						if (!isEmpty(productGroupsearch)) {
							nlapiLogExecution('debug', 'productGroupsearch', 'in');
	
							var productId = productGroupsearch[0].getValue("custrecord_djkk_cg_id");
							var productName = productGroupsearch[0].getValue("name");
							var productIdLength = productId.length;
							nlapiLogExecution('debug', 'productName', productName);
							//FOOD
							if (productIdLength == 4 && (fieldSub != SUB_SCETI && fieldSub != SUB_DPKK)) {
								// xxx
								nlapiSetFieldValue('custentity_djkk_customer_group_fd_xxx',productName, false)
							} else if (productIdLength == 2 && (fieldSub != SUB_SCETI && fieldSub != SUB_DPKK)) {
								// xx
								nlapiSetFieldValue('custentity_djkk_customer_group_fd_xx',productName, false)
							} else if (productIdLength == 1 && (fieldSub != SUB_SCETI && fieldSub != SUB_DPKK)){
								// x
								nlapiSetFieldValue('custentity_djkk_customer_group_fd_x',productName, false)
							} 
							//LS
							else if (productIdLength == 4 && (fieldSub == SUB_SCETI || fieldSub == SUB_DPKK)) {
								// xxx
								nlapiSetFieldValue('custentity_djkk_customer_group_ls_xxx',productName, false)
							} else if (productIdLength == 2 && (fieldSub == SUB_SCETI || fieldSub == SUB_DPKK)) {
								// xx
								nlapiSetFieldValue('custentity_djkk_customer_group_ls_xx',productName, false)
							} else if (productIdLength == 1 && (fieldSub == SUB_SCETI || fieldSub == SUB_DPKK)){
								// x
								nlapiSetFieldValue('custentity_djkk_customer_group_ls_x',productName, false)
							}
						}
					}
				}
			}
		}catch(e){
			
		}
		//20230717 add by zhou end
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
//	var create_edit_kbn = nlapiGetFieldValue('custentity_djkk_created_delivery');
//	var entityId1 = nlapiGetFieldValue('entityid');
	 var id = nlapiGetRecordId();
	 if(!isEmpty(id)){
		 var record = nlapiLoadRecord('customer', id);
		 var custrecordentry_auto_flg = record.getFieldValue('custentity_djkk_custrecordentry_auto_flg');
		 var entityId = record.getFieldValue('entityid');
		 var numberIng = record.getFieldValue('custentity_djkk_delivery_destination_num');
			if(isEmpty(numberIng)){
				numberIng=0;
			}
			numberIng++;
		 var numberd=entityId+ '-'+prefixInteger(parseInt(numberIng), parseInt(4));
		 
//		    nlapiLogExecution('debug', 'entityId1', entityId1);
//		    nlapiLogExecution('debug', 'entityId2', entityId2);

		 
		 //var customform = record.getFieldValue('customform');
		 var companyname = record.getFieldValue('companyname');
		 var subsidiary = record.getFieldValue('subsidiary');
		 var language = record.getFieldValue('language');
		 var shipaddr1 = record.getFieldValue('shipaddr1');
		 var shipaddr2 = record.getFieldValue('shipaddr2');
		 var shipaddr3 = record.getFieldValue('shipaddr3');
		 var shipaddressee = record.getFieldValue('shipaddressee');
		 var shipattention = record.getFieldValue('shipattention');
		 var shipcity = record.getFieldValue('shipcity');
		 var shipcomplete = record.getFieldValue('shipcomplete');
//		 var shipcountry = record.getFieldValue('shipcountry');
		 var shipzip = record.getFieldValue('shipzip');
		 var shipphone = '';
		 var shipmail = '';
		 var shipfax = '';
		 var shipstate = '';
		//changed by song add DENISJAPANDEV-1388 start
		 if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
			 record.setFieldValue('custentity_djkk_customer_type','3'); //DJ_顧客タイプ 
		 }
		//changed by song add DENISJAPANDEV-1388 end
		 
		 if(type=="create" && (subsidiary == SUB_SCETI ||subsidiary == SUB_DPKK)&& custrecordentry_auto_flg == 'T'){
		 var count = nlapiGetLineItemCount('addressbook');
			if(count != null && count >= 0){
				for(var linenum = 1 ; linenum <= count ; linenum++){
					var DshipingAddress = nlapiGetLineItemValue("addressbook","defaultbilling",linenum);//デフォルト請求先
					if(DshipingAddress =='T'){
						nlapiSelectLineItem('addressbook', linenum);
						var subrecord = nlapiViewCurrentLineItemSubrecord('addressbook','addressbookaddress');
						var addrphoneInSubRecord  = subrecord.getFieldValue('addrphone');
						var FaxInSubRecord  = subrecord.getFieldValue('custrecord_djkk_address_fax');
						var MailInSubRecord  = subrecord.getFieldValue('custrecord_djkk_mail');
//						var CountryInSubRecord  = subrecord.getFieldValue('country');
						var StateInSubRecord  = subrecord.getFieldValue('custrecord_djkk_address_state');
						if(!isEmpty(addrphoneInSubRecord)){
							shipphone = addrphoneInSubRecord;
						}
						if(!isEmpty(FaxInSubRecord)){
							shipfax = FaxInSubRecord;
						}
						if(!isEmpty(MailInSubRecord)){
							shipmail = MailInSubRecord;
						}
						if(!isEmpty(StateInSubRecord)){
							shipstate = StateInSubRecord;
						}
					}
				}
			}
		
			var deliveryDestinationRecord=nlapiCreateRecord('customrecord_djkk_delivery_destination');
			deliveryDestinationRecord.setFieldValue('customform', '28');
			//DJ_納品先名前
			deliveryDestinationRecord.setFieldValue('custrecorddjkk_name', companyname);
			//連結
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_delivery_subsidiary', subsidiary);
			//顧客
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_customer', id);
			//郵便番号
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_zip', shipzip);
			//国
//			deliveryDestinationRecord.setFieldValue('custrecord_djkk_delivery_destina_country', CountryInSubRecord);
			//都道府県
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_prefectures', shipstate);
			//市区町村
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_municipalities', shipcity);
			//住所1
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_delivery_residence', shipaddr1);
			//住所2
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_delivery_lable', shipaddr2);
			//住所3
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_delivery_residence2', shipaddr3);
			//電話番号
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_delivery_phone_number', shipphone);
			//メール
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_email', shipmail);
			//Fax
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_fax', shipfax);
			//納品先コード
			deliveryDestinationRecord.setFieldValue('custrecord_djkk_delivery_code', numberd);
			//納品先表示名
			deliveryDestinationRecord.setFieldValue('name', numberd+ ' '+companyname);
			
			nlapiSubmitRecord(deliveryDestinationRecord);
			
            nlapiSubmitField('customer', id, 'custentity_djkk_created_delivery', 'T',false);
		}		    		 		 
	 }	
}
