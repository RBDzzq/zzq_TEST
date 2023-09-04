/**
 * DJ_�[�i��Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/09/11     CPC_��
 *
 */

/**
 * �ŏ�����
 */
var TheMinimumdigits = 4;
var formType='';
var notfirstflag=false;

/*
 * */
function clientPageInit(type) {
	  formType=type;
	  nlapiDisableField('custrecord_djkk_delivery_code', true);//CH152
	 if(type == 'create'||type == 'copy'){
	       nlapiSetFieldValue('custrecord_djkk_delivery_code', '�����̔�');
//	       nlapiDisableField('custrecord_djkk_delivery_code', true);
	       nlapiSetFieldValue('name', '��������');
	       nlapiDisableField('name', true);
	    } else if(type == 'edit'){
	    	nlapiDisableField('name', true);
	    }

		 // �V�K�ꍇ �A�������ݒ�
	if (type == 'create') {
		nlapiSetFieldValue('custrecord_djkk_delivery_subsidiary',getRoleSub(nlapiGetRole()))
		 nlapiSetFieldValue('custrecord_djkk_delivery_book_site', '24', false, true);		 
		 nlapiSetFieldValue('custrecord_djkk_shippinginfosendtyp', '101', false, true);
		 nlapiSetFieldValue('custrecord_djkk_shippinginfodesttyp', '39', false, true);
		 nlapiSetFieldValue('custrecord_djkk_delivery_book_period', '9', false, true);
	}
	 try{
	 var cus=nlapiGetFieldValue('custrecord_djkk_customer');
	 if(!isEmpty(cus)){
		 var cusCategoryArray=nlapiLookupField('customer', cus,['custentity_djkk_product_category_jp','custentity_djkk_product_category_scetikk']);//DJ_�J�e�S���i�����f�՗p�j/DJ_�J�e�S���iSCETIKK�j
		 var cusA=cusCategoryArray.custentity_djkk_product_category_jp;
		 var cusB=cusCategoryArray.custentity_djkk_product_category_scetikk;
		 if(isEmpty(cusA)&&!isEmpty(cusB)){
			 nlapiSetFieldValue('custrecord_djkk_category', cusB, false, true);
		 }else if(isEmpty(cusB)&&!isEmpty(cusA)){
			 nlapiSetFieldValue('custrecord_djkk_category', cusA, false, true);
		 }		 
	 }
      }catch(e){}
      
      //20230209 add by zhou CH222 start
      var customform = nlapiGetFieldValue('customform');
      if(customform == '27'){
//    	  if(type == 'create' || type == 'edit'||type == 'cppy'){
    	  if(type == 'create'){
    		  var customerID = nlapiGetFieldValue('custrecord_djkk_customer');
    		  if(!isEmpty(customerID)){
    				var customerRecord = nlapiLookupField('customer', customerID, ['custentity_djkk_expdatereservaltyp','custentity_djkk_expdateremainingdays','custentity_djkk_expdateremainingpercent']);
    				var expDateReservalTType = customerRecord.custentity_djkk_expdatereservaltyp;//DJ_�ܖ������t�]�h�~�敪
    	    		var expDateRemainingDays = customerRecord.custentity_djkk_expdateremainingdays;//DJ_�ܖ������c����
    	    		var expDateRemainingPercent = customerRecord.custentity_djkk_expdateremainingpercent;//DJ_�ܖ������c�p�[�Z���e�[�W
    				nlapiSetFieldValue('custrecord_djkk_expdatereservaltyp', expDateReservalTType);
    				nlapiSetFieldValue('custrecord_djkk_expdateremainingdays', expDateRemainingDays);
    				nlapiSetFieldValue('custrecord_djkk_expdateremainingpercent', expDateRemainingPercent);
    		  }
    	  }
      }
      //end
  	//notfirstflag=true;
}

/*
 * */
function clientSaveRecord() {
	var returnType = true;
	 if (returnType&&(formType == 'create'||formType == 'copy')) {
		 var customerID = nlapiGetFieldValue('custrecord_djkk_customer');
		 if(!isEmpty(customerID)){
			 
			var customerRecord=nlapiLookupField('customer', customerID, ['entityid','custentity_djkk_delivery_destination_num']);
			var numberIng= customerRecord.custentity_djkk_delivery_destination_num;
			var entityid = customerRecord.entityid;
			if(isEmpty(numberIng)){
				numberIng=0;
			}
			numberIng++;
			var numberd=entityid+ '-'+prefixInteger(parseInt(numberIng), parseInt(TheMinimumdigits));;
			nlapiSetFieldValue('custrecord_djkk_delivery_code', numberd, false, true);
			//20221226�����start CH236 �����̔Ԃ�ǉ�
			//DJ_�[�i�於�O
			var custrecordname = nlapiGetFieldValue('custrecorddjkk_name');
			nlapiSetFieldValue('name', numberd+ ' '+custrecordname, false, true);
			//end
			//nlapiSubmitField('customer', customerID, 'custentity_djkk_delivery_destination_num',numberIng);
			
		 }else{
			 alert('DJ_�ڋq����͂��Ă��������B');
			 returnType=false;
		 }
	 }
	 
	//changed by song add DENISJAPAN-486 start
	var sodeliverermemo = nlapiGetFieldValue('custrecord_djkk_sodeliverermemo'); //DJ_�������^���������l
	if(!isEmpty(sodeliverermemo)){
		var sodeliverermemoString = sodeliverermemo.toString();
		var sodeliverermemoBytes = getBytes(sodeliverermemoString);
	    if(sodeliverermemoBytes > 35){
			alert("DJ_�������^���������l�̃o�C�g����35���傫���̂ŁA�ē��͂��Ă�������");
			returnType=false;
		}
	}
	
	var sowmsmemo = nlapiGetFieldValue('custrecord_djkk_sowmsmemo'); //DJ_�������^���������l
	if(!isEmpty(sowmsmemo)){
		var sowmsmemoString = sowmsmemo.toString();
		var sowmsmemoBytes = getBytes(sowmsmemoString);
	    if(sowmsmemoBytes > 100){
			alert("DJ_�������^���������l�̃o�C�g����100���傫���̂ŁA�ē��͂��Ă�������");
			returnType=false;
		}
	}
	//changed by song add DENISJAPAN-486 end
	 
	 return returnType;
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
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	if(name=='custrecord_djkk_customer'){
		try{
			 var cus=nlapiGetFieldValue('custrecord_djkk_customer');
			 if(!isEmpty(cus)){
				 var cusCategoryArray=nlapiLookupField('customer', cus,['custentity_djkk_product_category_jp','custentity_djkk_product_category_scetikk','custentity_djkk_expdateremainingpercent','custentity_djkk_expdatereservaltyp','custentity_djkk_expdateremainingdays','custentity_djkk_expdateremainingpercent']);//DJ_�J�e�S���i�����f�՗p�j/DJ_�J�e�S���iSCETIKK�j
				 var cusA=cusCategoryArray.custentity_djkk_product_category_jp;
				 var cusB=cusCategoryArray.custentity_djkk_product_category_scetikk;
				 if(isEmpty(cusA)&&!isEmpty(cusB)){
					 nlapiSetFieldValue('custrecord_djkk_category', cusB, false, true);
				 }else if(isEmpty(cusB)&&!isEmpty(cusA)){
					 nlapiSetFieldValue('custrecord_djkk_category', cusA, false, true);
				 }	
				//20221219 add by zhou CH222 start
				 var expdateremainingpercent = cusCategoryArray.custentity_djkk_expdateremainingpercent;//DJ_�ܖ������c�p�[�Z���e�[�W
				 if(!isEmpty(expdateremainingpercent)&& nlapiGetFieldValue('customform') == '27'){
					 nlapiSetFieldValue('custrecord_djkk_expdateremainingpercent', expdateremainingpercent);
				 }
			 	//end
				//20230209 add by zhou CH222 start
		         var customform = nlapiGetFieldValue('customform');
		         if((type == 'create' || type == 'edit'||type == 'cppy') && customform == '27'){
		        	var expDateReservalTType = cusCategoryArray.custentity_djkk_expdatereservaltyp;//DJ_�ܖ������t�]�h�~�敪
		        	var expDateRemainingDays = cusCategoryArray.custentity_djkk_expdateremainingdays;//DJ_�ܖ������c����
		        	var expDateRemainingPercent = cusCategoryArray.custentity_djkk_expdateremainingpercent;//DJ_�ܖ������c�p�[�Z���e�[�W
		        	nlapiSetFieldValue('custrecord_djkk_expdatereservaltyp', expDateReservalTType,false);
		        	nlapiSetFieldValue('custrecord_djkk_expdateremainingdays', expDateRemainingDays,false);
		        	nlapiSetFieldValue('custrecord_djkk_expdateremainingpercent', expDateRemainingPercent,false);
		  	  	 }
			  //end
			 }
			 //�ڋq�ύX����Ɖc�ƒS���Ҏ҂������ݒ�
			 nlapiSetFieldValue('custrecord_djkk_sales', nlapiLookupField('customer', cus, 'salesrep'));
				}catch(e){}
			}
	if(name=='custrecord_djkk_delivery_destinationkana'){
		var kana=nlapiGetFieldValue('custrecord_djkk_delivery_destinationkana');
		if(!inputCheckKana(kana)){
			alert('���p�����A�����A���t�@�x�b�g�̂ݓ��͉A�S�p�������͕s�B');
			nlapiSetFieldValue('custrecord_djkk_delivery_destinationkana', '', false, true);
		}
	}
	// add by ycx 20220922 DENISJAPAN-486 EDI���M�f�[�^�̍��ڃo�C�g���ɂ���
	if(name=='custrecord_djkk_finetcustomeredicode'){
		var finetcustomeredicode=nlapiGetFieldValue('custrecord_djkk_finetcustomeredicode');
		if(!inputCheckKana(finetcustomeredicode)){
			alert('���p�����A�����A���t�@�x�b�g�̂ݓ��͉A�S�p�������͕s�B');
			nlapiSetFieldValue('custrecord_djkk_finetcustomeredicode', '', false, true);
		}
	}
	if(name=='custrecord_djkk_finetinvoicecustomercd1'){
		var finetinvoicecustomercd1=nlapiGetFieldValue('custrecord_djkk_finetinvoicecustomercd1');
		if(!inputCheckKana(finetinvoicecustomercd1)){
			alert('���p�����A�����A���t�@�x�b�g�̂ݓ��͉A�S�p�������͕s�B');
			nlapiSetFieldValue('custrecord_djkk_finetinvoicecustomercd1', '', false, true);
		}
	}
	
	if(name=='custrecord_djkk_finetinvoicecustomercd2'){
		var finetinvoicecustomercd2=nlapiGetFieldValue('custrecord_djkk_finetinvoicecustomercd2');
		if(!inputCheckKana(finetinvoicecustomercd2)){
			alert('���p�����A�����A���t�@�x�b�g�̂ݓ��͉A�S�p�������͕s�B');
			nlapiSetFieldValue('custrecord_djkk_finetinvoicecustomercd2', '', false, true);
		}
	}
	if(name=='custrecord_djkk_finetinvoicecustomercd3'){
		var finetinvoicecustomercd3=nlapiGetFieldValue('custrecord_djkk_finetinvoicecustomercd3');
		if(!inputCheckKana(finetinvoicecustomercd3)){
			alert('���p�����A�����A���t�@�x�b�g�̂ݓ��͉A�S�p�������͕s�B');
			nlapiSetFieldValue('custrecord_djkk_finetinvoicecustomercd3', '', false, true);
		}
	}
	if(name=='custrecord_djkk_finetinvoicecustomercd4'){
		var finetinvoicecustomercd4=nlapiGetFieldValue('custrecord_djkk_finetinvoicecustomercd4');
		if(!inputCheckKana(finetinvoicecustomercd4)){
			alert('���p�����A�����A���t�@�x�b�g�̂ݓ��͉A�S�p�������͕s�B');
			nlapiSetFieldValue('custrecord_djkk_finetinvoicecustomercd4', '', false, true);
		}
	}
	if(name=='custrecord_djkk_finetinvoicecustomercd5'){
		var finetinvoicecustomercd5=nlapiGetFieldValue('custrecord_djkk_finetinvoicecustomercd5');
		if(!inputCheckKana(finetinvoicecustomercd5)){
			alert('���p�����A�����A���t�@�x�b�g�̂ݓ��͉A�S�p�������͕s�B');
			nlapiSetFieldValue('custrecord_djkk_finetinvoicecustomercd5', '', false, true);
		}
	}
	// add end
	if (name == 'custrecord_djkk_zip') {
		var zipcode = replaceExceptNumber(nlapiGetFieldValue('custrecord_djkk_zip'));
		var codeSearch = nlapiSearchRecord("customrecord_djkk_postal_code",
				null, [ [ "custrecord_djkk_postal_code", "is", zipcode ] ], [
						new nlobjSearchColumn("custrecord_djkk_state"),
						new nlobjSearchColumn("custrecord_djkk_city"),
						new nlobjSearchColumn("custrecord_djkk_address") ]);
		if (!isEmpty(codeSearch)) {
			nlapiSetFieldValue('custrecord_djkk_prefectures', codeSearch[0]
					.getText('custrecord_djkk_state'));
			nlapiSetFieldValue('custrecord_djkk_municipalities', codeSearch[0]
					.getValue('custrecord_djkk_city'));
//20220706 changed by zhou start
//U788
			var addressForSearch = codeSearch[0].getValue('custrecord_djkk_address');
			var address = addressForSearch.replace('�@', '');
			nlapiSetFieldValue('custrecord_djkk_delivery_residence',address,false,true);
//20220706 changed by zhou end
		} else {
			nlapiSetFieldValue('custrecord_djkk_prefectures', '');
			nlapiSetFieldValue('custrecord_djkk_municipalities', '');
			nlapiSetFieldValue('custrecord_djkk_delivery_residence', '',false,true);
		}
	}
	if (name == 'custrecord_djkk_delivery_residence') {
		var addr1 = nlapiGetFieldValue('custrecord_djkk_delivery_residence');
		var zip=nlapiGetFieldValue('custrecord_djkk_zip');
        if(!isEmpty(addr1)&&isEmpty(zip)){
		var addSearch = nlapiSearchRecord("customrecord_djkk_postal_code",
				null, [ [ "custrecord_djkk_address", "contains", addr1 ] ], [
						new nlobjSearchColumn("custrecord_djkk_postal_code"),
						new nlobjSearchColumn("custrecord_djkk_state"),
						new nlobjSearchColumn("custrecord_djkk_city") ]);
		if (!isEmpty(addSearch)) {
			nlapiSetFieldValue('custrecord_djkk_prefectures', addSearch[0]
					.getText('custrecord_djkk_state'));
			nlapiSetFieldValue('custrecord_djkk_municipalities', addSearch[0]
					.getValue('custrecord_djkk_city'));
			nlapiSetFieldValue('custrecord_djkk_zip', addSearch[0]
					.getValue('custrecord_djkk_postal_code'),false,true);
		} else {
//			nlapiSetFieldValue('custrecord_djkk_prefectures', '');
//			nlapiSetFieldValue('custrecord_djkk_municipalities', '');
//			nlapiSetFieldValue('custrecord_djkk_zip', '',false,true);
		}
         }
	}
	if (name == 'custrecorddjkk_name') {
		var shippingname = nlapiGetFieldValue("custrecord_djkk_shippinginfodestname"); //�o�׈ē����M���Ж�
		var customform = nlapiGetFieldValue("customform");  //���
		nlapiLogExecution('error', 'customform', customform)
		var custrecordname = nlapiGetFieldValue("custrecorddjkk_name"); //�[�i�於�O
		if(customform =='28'){ 
			if(shippingname == ''){
				nlapiSetFieldValue('custrecord_djkk_shippinginfodestname',custrecordname);
			}
		}  
	}
	
	if(name == 'custrecord_djkk_shippinginfosendtyp' || name == 'custrecord_djkk_customer' ){
		var customform = nlapiGetFieldValue('customform');
		var shippinginfosendtyp = nlapiGetFieldValue('custrecord_djkk_shippinginfosendtyp');
//		alert(deliveryPeriod);
		if(customform == '28' && shippinginfosendtyp == '101'){ // LS�ADJ_�[���񓚑��M���@ == �ڋq�Q��
			var customer = nlapiGetFieldValue('custrecord_djkk_customer');
			if(isEmpty(customer)){
				if(notfirstflag){
				alert('DJ_�ڋq �����I�т�������');
				}else{
					notfirstflag=true;
				}				
				return false;
			}else{
				var loadingCustomer = nlapiLoadRecord('customer',customer);
				var shippinginfosendtype = loadingCustomer.getFieldValue('custentity_djkk_shippinginfosendtyp')//DJ_�[���񓚑��M���@|DJ_�o�׈ē����M�敪
				var shippinginfodesttype = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodesttyp')//DJ_�[���񓚑��M��|DJ_�o�׈ē����M��敪
				var deliverydestrep = loadingCustomer.getFieldValue('custentity_djkk_customerrep')//DJ_�[���񓚑��M��S����|DJ_�o�׈ē����M��S����
				var shippinginfodestname = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestname')//DJ_�[���񓚑��M���Ж�(3RD�p�[�e�B�[)|DJ_�o�׈ē����M���Ж�(3RD�p�[�e�B�[)
				var shippinginfodestrep = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestrep')//DJ_�[���񓚑��M��S����(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��S����(3RD�p�[�e�B�[)
				var shippinginfodestemail = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestemail')//DJ_�[���񓚑��M�惁�[��(3RD�p�[�e�B�[)|DJ_�o�׈ē����M�惁�[��(3RD�p�[�e�B�[)
				var shippinginfodestfax = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestfax')//DJ_�[���񓚑��M��FAX(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��FAX(3RD�p�[�e�B�[)
				var shippinginfodestmemo = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestmemo')//DJ_�[���񓚎������M���t����l|DJ_�o�׈ē����M��o�^����
				if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype != '36'){
//					nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', shippinginfosendtype,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodesttyp', shippinginfodesttype,false);
					nlapiSetFieldValue('custrecord_djkk_deliverydestrep', deliverydestrep,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestname', shippinginfodestname,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestrep', shippinginfodestrep,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestemail', shippinginfodestemail,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestfax', shippinginfodestfax,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestmemo', shippinginfodestmemo,false);	
				}else{
					nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodesttyp', '',false);
					nlapiSetFieldValue('custrecord_djkk_deliverydestrep', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestname', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestrep', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestemail', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestfax', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestmemo', '',false);	
				}
			}
		}else if(customform == '28' && shippinginfosendtyp!= '101'){
			nlapiSetFieldValue('custrecord_djkk_shippinginfodesttyp', '',false);
			nlapiSetFieldValue('custrecord_djkk_deliverydestrep', '',false);
			nlapiSetFieldValue('custrecord_djkk_shippinginfodestname', '',false);
			nlapiSetFieldValue('custrecord_djkk_shippinginfodestrep', '',false);
			nlapiSetFieldValue('custrecord_djkk_shippinginfodestemail', '',false);
			nlapiSetFieldValue('custrecord_djkk_shippinginfodestfax', '',false);
			nlapiSetFieldValue('custrecord_djkk_shippinginfodestmemo', '',false);	
		}
	}
	
	if(name == 'custrecord_djkk_delivery_book_period'||name == 'custrecord_djkk_customer' ){
		var customform = nlapiGetFieldValue('customform');
		var deliveryPeriod = nlapiGetFieldValue('custrecord_djkk_delivery_book_period');
		if((customform == '28' || customform == '27' )&& deliveryPeriod == '9'){ // ls�A�[�i�����M���@ == �ڋq�Q��
			var customer = nlapiGetFieldValue('custrecord_djkk_customer');
			if(isEmpty(customer)){
				if(notfirstflag){
					alert('DJ_�ڋq �����I�т�������');
					}else{
						notfirstflag=true;
					}				
					return false;
			}else{
				var custRecord = nlapiLoadRecord('customer',customer);
				deliveryPeriod = custRecord.getFieldValue('custentity_djkk_delivery_book_period'); //DJ_�[�i�����M���@
				var deliverySite;
				if(customform == '28'){
					deliverySite = custRecord.getFieldValue('custentity_djkk_delivery_book_site'); //DJ_�[�i�����M��
				}else if( customform == '27'){
					deliverySite = custRecord.getFieldValue('custentity_djkk_delivery_book_site_fd'); //DJ_�[�i�����M��
				}
				var deliveryPerson = custRecord.getFieldValue('custentity_djkk_delivery_book_person'); //DJ_�[�i�����M��S����
				var deliverySubName = custRecord.getFieldValue('custentity_djkk_delivery_book_subname'); //DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
				var deliveryPersont = custRecord.getFieldValue('custentity_djkk_delivery_book_person_t'); //DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
				var deliveryEmail = custRecord.getFieldValue('custentity_djkk_delivery_book_email'); //DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
				var deliveryFax = custRecord.getFieldValue('custentity_djkk_delivery_book_fax_three'); //DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
				var deliveryMemo = custRecord.getFieldValue('custentity_djkk_delivery_book_memo'); //DJ_�[�i���������M���l
				if(!isEmpty(deliveryPeriod)&& (deliveryPeriod!= '10' )){
//					nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_�[�i�����M���@
					if(customform == '28'){
						nlapiSetFieldValue('custrecord_djkk_delivery_book_site', deliverySite,false);//DJ_�[�i�����M��
					}else if( customform == '27'){
						nlapiSetFieldValue('custrecord_djkk_delivery_book_site_fd', deliverySite,false);//DJ_�[�i�����M��
					}
					nlapiSetFieldValue('custrecord_djkk_delivery_book_person', deliveryPerson,false);//DJ_�[�i�����M��S����
					nlapiSetFieldValue('custrecord_djkk_delivery_book_subname', deliverySubName,false);//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_email', deliveryEmail,false);//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_memo', deliveryMemo,false);//DJ_�[�i���������M���l  custbody_djkk_reference_column
				}else{
//					nlapiSetFieldValue('custrecord_djkk_delivery_book_period', deliveryPeriod,false);//DJ_�[�i�����M���@
				
					if(customform == '28'){
						nlapiSetFieldValue('custrecord_djkk_delivery_book_site', '',false);//DJ_�[�i�����M��
					}else if( customform == '27'){
						nlapiSetFieldValue('custrecord_djkk_delivery_book_site_fd', '',false);//DJ_�[�i�����M��
					}
					nlapiSetFieldValue('custrecord_djkk_delivery_book_person', '',false);//DJ_�[�i�����M��S����
					nlapiSetFieldValue('custrecord_djkk_delivery_book_subname', '',false);//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_person_t', '',false);//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_email', '',false);//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_fax_three', '',false);//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_memo', '',false);//DJ_�[�i���������M���l  custbody_djkk_reference_column
				}
			}
		}else if((customform == '28' || customform == '27' )&& deliveryPeriod != '9'){
			if(customform == '28'){
				nlapiSetFieldValue('custrecord_djkk_delivery_book_site', '',false);//DJ_�[�i�����M��
			}else if( customform == '27'){
				nlapiSetFieldValue('custrecord_djkk_delivery_book_site_fd', '',false);//DJ_�[�i�����M��
			}
			nlapiSetFieldValue('custrecord_djkk_delivery_book_person', '',false);//DJ_�[�i�����M��S����
			nlapiSetFieldValue('custrecord_djkk_delivery_book_subname', '',false);//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
			nlapiSetFieldValue('custrecord_djkk_delivery_book_person_t', '',false);//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
			nlapiSetFieldValue('custrecord_djkk_delivery_book_email', '',false);//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
			nlapiSetFieldValue('custrecord_djkk_delivery_book_fax_three', '',false);//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
			nlapiSetFieldValue('custrecord_djkk_delivery_book_memo', '',false);//DJ_�[�i���������M���l  custbody_djkk_reference_column
		}
		notfirstflag=true;
	}
}
