/**
 * DJ_�[�i��PDF
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 May 2022     ZHOU
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var flag = request.getParameter('flag');//page flag
	if(flag == "invoice"){	
		var invoiceid = request.getParameter('invoiceid');//invoice
		var salesrepSearchColumn =  new nlobjSearchColumn("salesrep");//�ڋq(For retrieval)
		var subsidiarySearchColumn = new nlobjSearchColumn("subsidiary");//�A���q��� (For retrieval)
		var entitySearchColumn =  new nlobjSearchColumn("entity");//�ڋq(For retrieval)
		var tranidSearchColumn = new nlobjSearchColumn("tranid");//�������ԍ�
		var tranNumberSearchColumn = new nlobjSearchColumn("transactionnumber");//�������g�����U�N�V�����ԍ�
		var memoSearchColumn = new nlobjSearchColumn("custbody_djkk_deliverynotememo");//memo
		var paymentConditionsColumn = new nlobjSearchColumn("custbody_djkk_payment_conditions");//�x������
		var otherrefnumSearchColumn =  new nlobjSearchColumn("otherrefnum");//��Д����ԍ�
		// �o���G�[�V�����x�� 20230803 update by zdj start
		//var transactionnumberSearchColumn = new nlobjSearchColumn("transactionnumber","createdFrom",null);//�󒍔ԍ�(maybe not true)
		var transactionnumberSearchColumn = new nlobjSearchColumn("custbody_djkk_exsystem_tranid");//DJ_�O���V�X�e���A�g_�����ԍ�
		// �o���G�[�V�����x�� 20230803 update by zdj end
		var deliveryCodeSearchColumn =  new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��R�[�h
		// add by zzq CH600 20230612 start
		var deliverySearchColumn =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//DJ_�[�i��
		// add by zzq CH600 20230612 end
		var deliveryNameSearchColumn = new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i�於�O
		var deliveryZipSearchColumn = new nlobjSearchColumn("custrecord_djkk_zip","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�X�֔ԍ�
		var deliveryPrefecturesSearchColumn = new nlobjSearchColumn("custrecord_djkk_prefectures","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�s���{��
		var deliveryMunicipalitiesSearchColumn = new nlobjSearchColumn("custrecord_djkk_municipalities","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�s�撬��
		var deliveryResidenceSearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��1
		// add by zzq CH653 20230619 start
//		var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��2
		var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_lable","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��2
		var deliveryResidence3SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��3
		// add by zzq CH653 20230619 end
		var duedateSearchColumn = new nlobjSearchColumn("duedate");//���s��
		var deliveryDateSearchColumn = new nlobjSearchColumn("custbody_djkk_delivery_date");//DJ_�[�i��
	
		var column = [
					salesrepSearchColumn,
					memoSearchColumn,
					paymentConditionsColumn,
					subsidiarySearchColumn,
					entitySearchColumn,
					tranidSearchColumn,
					otherrefnumSearchColumn,
					transactionnumberSearchColumn,
					deliveryCodeSearchColumn,
					deliveryNameSearchColumn,
					deliveryZipSearchColumn,
					deliveryPrefecturesSearchColumn,
					deliveryMunicipalitiesSearchColumn,
					deliveryResidenceSearchColumn,
					deliveryResidence2SearchColumn,
					// add by zzq CH653 20230619 start
					deliveryResidence3SearchColumn,
					// add by zzq CH653 20230619 end
					deliveryDateSearchColumn,
					tranNumberSearchColumn,
					// add by zzq CH600 20230612 start
					deliverySearchColumn
					// add by zzq CH600 20230612 end
		             ]
		var invoiceSearch = nlapiSearchRecord("invoice",null,
				[
	//			   ["type","anyof","CustInvc"],
	//			   "AND",
				   ["internalid","anyof",invoiceid]
				], 
				column
				);
		var subsidiary = defaultEmpty(invoiceSearch[0].getValue(subsidiarySearchColumn));//�A���q���internalid (For retrieval)
		// add by zhou 20230602 CH601 start
		var memo = defaultEmpty(invoiceSearch[0].getValue(memoSearchColumn));//����
		// add by zhou 20230602 CH601 end
		nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)	
		var subsidiaryrSearch = nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",subsidiary]
				], 
				[
				 	new nlobjSearchColumn("legalname"),//�A����������
				 	new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),//�A��DJ_��Ж��O�p��
				 	new nlobjSearchColumn("fax"),//������pFAX
//				 	new nlobjSearchColumn("phone"), //�A��TEL?????
				 	new nlobjSearchColumn("custrecord_djkk_address_fax","Address",null), //�A��FAX
				    new nlobjSearchColumn("phone","Address",null),//�A��TEL
				 	new nlobjSearchColumn("custrecord_djkk_shippingdeliverynotice"),//DJ_�o�׈ē��E���i����[�i���o�͗p���m�点����
	                //CH655 20230725 add by zdj start
                    new nlobjSearchColumn("phone","shippingAddress",null),//�z����phone
                    new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//�z����fax
                  //CH655 20230725 add by zdj end
				]
				);
		var legalName = defaultEmpty(subsidiaryrSearch[0].getValue("legalname"));//�A����������
		var EnglishName = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_subsidiary_en"));//�A��DJ_��Ж��O�p��
		var Fax = 'FAX: ' + defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","Address",null));//�A��FAX
		nlapiLogExecution('DEBUG', 'FAX', Fax)
		var phone = 'TEL: ' + defaultEmpty(subsidiaryrSearch[0].getValue("phone","Address",null));//�A��TEL	
		var transactionFax = defaultEmpty(subsidiaryrSearch[0].getValue("fax"));//������pFAX
		nlapiLogExecution('DEBUG', 'transactionFax', transactionFax)
		var shippingdeliverynotice = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_shippingdeliverynotice"));//DJ_�o�׈ē��E���i����[�i���o�͗p���m�点����
	    //CH655 20230725 add by zdj start
        var shipaddressPhone= 'TEL: ' + defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("phone","shippingAddress",null));//�z����phone
        var shipaddressFax= defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","shippingAddress",null));//�z����fax
        //CH655 20230725 add by zdj end
		var entity = defaultEmpty(invoiceSearch[0].getValue(entitySearchColumn));//�ڋqinternalid(For retrieval)	
		var customerSearch = nlapiSearchRecord("customer",null,
				[
				   ["internalid","anyof",entity]
				], 
				[	
				 	new nlobjSearchColumn("billcity"),//�s��
				 	new nlobjSearchColumn("companyname"),//���O
	//			 	new nlobjSearchColumn("phone"),//
//				 	new nlobjSearchColumn("fax"),//fax
				 	new nlobjSearchColumn("custentity_djkk_exsystem_fax_text"),//fax
				 	new nlobjSearchColumn("entityid"),//�ڋqcode
				 	new nlobjSearchColumn("zipcode","Address",null),
				 	new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//
				 	new nlobjSearchColumn("address1","Address",null),//
				 	new nlobjSearchColumn("address2","Address",null),//
				 	new nlobjSearchColumn("addressee","Address",null),//	
				 	// add by zhou 20230608 CH600 start
				 	new nlobjSearchColumn("custentity_djkk_exsystem_phone_text"),//�ڋqTEL
				    // add by zhou 20230608 CH600 end
				 	//add by zzq CH690 20230627 start
				 	new nlobjSearchColumn("currency"),//�ڋq��{�ʉ� 
					//add by zzq CH690 20230627 end
				 	// �o���G�[�V�����x�� 20230803 add by zdj start
				 	new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_�ڋq�x������
		    	    new nlobjSearchColumn("terms"), //�x��������
		    	    new nlobjSearchColumn("custentity_djkk_delivery_book_subname"), //DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
		    	    new nlobjSearchColumn("custentity_djkk_delivery_book_person_t") //DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
				 	// �o���G�[�V�����x�� 20230803 add by zdj end
				]
				);
		var customerRecord=nlapiLoadRecord('customer', entity);
		//var paymentPeriodMonths = defaultEmpty(customerRecord.getLineItemValue("recmachcustrecord_suitel10n_jp_pt_customer","custrecord_suitel10n_jp_pt_paym_due_mo_display",1));//�x��������
		var customePhone = customerRecord.getLineItemValue("addressbook","phone",1);//p
		if(customerSearch != null){
			// �o���G�[�V�����x�� 20230803 update by zdj start
			var companyName1 = defaultEmpty(customerSearch[0].getValue("companyname"));//�ڋq��
			var companyNameCustomer = defaultEmpty(customerSearch[0].getValue("companyname"));//DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
			var personCustomer = defaultEmpty(customerSearch[0].getValue("custentity_djkk_delivery_book_person_t"));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
			// �o���G�[�V�����x�� 20230803 update by zdj end
			var billcity = defaultEmpty(customerSearch[0].getValue("billcity"));//�s��
			var customerCode = defaultEmpty(customerSearch[0].getValue("entityid"));//�ڋqcode
//			var customeFax = defaultEmpty(customerSearch[0].getValue("fax"));//�ڋqFAX
			var customeFax = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_fax_text"));//�ڋqFAX
			nlapiLogExecution('DEBUG', 'customeFax', customeFax);
			// add by zhou 20230608 CH600 start
//			var customePhone = defaultEmpty(customerSearch[0].getValue("phone"));//�ڋqTEL
			var customePhone = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_phone_text"));//�ڋqTEL
			// add by zhou 20230608 CH600 end
		    var custZipCode = defaultEmpty(customerSearch[0].getValue("zipcode","Address",null));//�ڋq�X��
		    // �o���G�[�V�����x�� 20230803 add by zdj start
		    var customerPayment = defaultEmpty(customerSearch[0].getText("custentity_djkk_customer_payment"));
			var customerTerms = defaultEmpty(customerSearch[0].getText("terms"));
			var paymentPeriodMonths = '';
			if(customerTerms){
                var tmpVal = customerTerms.split("/")[0];
                if (tmpVal) {
                	paymentPeriodMonths = tmpVal;
                }else {
                	paymentPeriodMonths = '';
                }
            } else if(customerPayment){
               var tmpVal = customerPayment.split("/")[0];
               if (tmpVal) {
            	   paymentPeriodMonths = tmpVal;
               }else {
            	   paymentPeriodMonths = '';
               }
            }    
			// �o���G�[�V�����x�� 20230803 add by zdj end
			if(custZipCode && custZipCode.substring(0,1) != '��'){
				custZipCode = '��' + custZipCode;
			}else{
				custZipCode = '';
			}
			//add by zzq CH690 20230627 start
			var custcurrency = defaultEmpty(customerSearch[0].getValue("currency"));////�ڋq��{�ʉ�
			//add by zzq CH690 20230627 end
			var custState = defaultEmpty(customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//�ڋq�s���{��
			var custAddr1 = defaultEmpty(customerSearch[0].getValue("address1","Address",null));//�ڋq�Z���P
			var custAddr2 = defaultEmpty(customerSearch[0].getValue("address2","Address",null));//�ڋq�Z���Q
			var custAddr3 = defaultEmpty(customerSearch[0].getValue("address3","Address",null));//�ڋq�Z��3
			var custAddressee = defaultEmpty(customerSearch[0].getValue("addressee","Address",null));//�ڋq����
		}
		var tranid = defaultEmpty(invoiceSearch[0].getValue(tranidSearchColumn));//�������ԍ�
		var tranNumber = defaultEmpty(invoiceSearch[0].getValue(tranNumberSearchColumn));//�������ԍ�
		var salesrep =  defaultEmpty(invoiceSearch[0].getText(salesrepSearchColumn));//�c�ƒS����
		var otherrefnum = defaultEmpty(invoiceSearch[0].getValue(otherrefnumSearchColumn));//��Д����ԍ�
		var transactionnumber = defaultEmpty(invoiceSearch[0].getValue(transactionnumberSearchColumn));//�󒍔ԍ�(maybe not true)
		if(isEmpty(transactionnumber)){
			transactionnumber = '';
		}
		var deliveryCode = defaultEmpty(invoiceSearch[0].getValue(deliveryCodeSearchColumn));//DJ_�[�i�� : DJ_�[�i��R�[�h
		// add by CH600 20230612 start
		var deliveryId = defaultEmpty(invoiceSearch[0].getValue(deliverySearchColumn));//DJ_�[�i��
		nlapiLogExecution('DEBUG', 'deliveryId', deliveryId);
		//CH736�@20230717 by zzq start
		var invoiceRecord = nlapiLoadRecord('invoice',invoiceid);
		var letter01 = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_site_fd')); //DJ_���i����[�i�����M��敪
		nlapiLogExecution('debug', 'letter01', letter01);
		var letter02 = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_fax_three')); //DJ_���i����[�i�����M��FAX(3RD�p�[�e�B�[)
		nlapiLogExecution('debug', 'letter02', letter02);
		var companyNameInvo = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_subname'));//DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
		 // CH807 add by zzq 20230815 start
        var personInvo = '�[�i�����S���җl'; 
        var person_3rd = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
        var person = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_person'));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
        if(letter01){
            if(letter01 == '14'){
                personInvo = person_3rd;
            }else{
                if(person){
                    personInvo = person;
                }
            }
        }
        // CH807 add by zzq 20230815 end
        nlapiLogExecution('DEBUG', 'personInvo', personInvo)  
		var deliveryCodeFax = '';
        var companyNameDelivery = '';
        var deliveryFax = '';
        var personDelivery = '';
        if(!isEmpty(deliveryId)){
//            deliveryCodeFax = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_fax'));
            deliveryFax = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_fax'))
            // �o���G�[�V�����x�� 20230803 update by zdj start
            companyNameDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecorddjkk_name'));//DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
            personDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_delivery_book_person_t'));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
            // �o���G�[�V�����x�� 20230803 update by zdj end
        }
     // �o���G�[�V�����x�� 20230803 add by zdj start
        var companyName = '';
     // �o���G�[�V�����x�� 20230803 add by zdj end
        if(letter01){
		if(letter01 == '14'){   //3rd�p�[�e�B�[
			// �o���G�[�V�����x�� 20230803 add by zdj start
			companyName = companyNameInvo + ' ' + personInvo;
			// �o���G�[�V�����x�� 20230803 add by zdj end
		    if(letter02){
		       deliveryCodeFax = letter02;
		    }
		}else if(letter01 == '15'){  //�[�i��
			// �o���G�[�V�����x�� 20230803 add by zdj start
			// CH807 add by zzq 20230815 start
//			companyName = companyNameDelivery + ' ' + '�[�i�����S���җl';
			companyName = companyNameDelivery + ' ' + personInvo;
			// CH807 add by zzq 20230815 end
			// �o���G�[�V�����x�� 20230803 add by zdj end
		    if(deliveryId && !isEmpty(deliveryFax)){
	           deliveryCodeFax = deliveryFax;
	        }
		}else if(letter01 == '16'){  //�ڋq��
			// �o���G�[�V�����x�� 20230803 add by zdj start
			// CH807 add by zzq 20230815 start
//			companyName = companyNameCustomer + ' ' + '�[�i�����S���җl';
			companyName = companyNameCustomer + ' ' + personInvo;
			// CH807 add by zzq 20230815 end
			// �o���G�[�V�����x�� 20230803 add by zdj end
		    if(customeFax){
                deliveryCodeFax = customeFax;
          }
		 }
        }else{
            if(customeFax){
                deliveryCodeFax = customeFax;   
            }
         // �o���G�[�V�����x�� 20230803 add by zdj start
         // CH807 add by zzq 20230815 start
//            companyName = companyNameCustomer + ' ' + '�[�i�����S���җl';
            companyName = companyNameCustomer + ' ' + personInvo;
            // CH807 add by zzq 20230815 end
         // �o���G�[�V�����x�� 20230803 add by zdj end
        }
		//CH736�@20230717 by zzq end
		// add by CH600 20230612 end
		var deliveryName = defaultEmpty(invoiceSearch[0].getValue(deliveryNameSearchColumn));//DJ_�[�i�� : DJ_�[�i�於�O
		var deliveryZip = defaultEmpty(invoiceSearch[0].getValue(deliveryZipSearchColumn));//DJ_�[�i�� : DJ_�X�֔ԍ�
		if(deliveryZip && deliveryZip.substring(0,1) != '��'){
			deliveryZip = '��' + deliveryZip;
		}else{
			deliveryZip = '';
		}
		var deliveryPrefectures = defaultEmpty(invoiceSearch[0].getValue(deliveryPrefecturesSearchColumn));//DJ_�[�i�� : DJ_�s���{��
		var deliveryMunicipalities = defaultEmpty(invoiceSearch[0].getValue(deliveryMunicipalitiesSearchColumn));//DJ_�[�i�� : DJ_�s�撬��
		var deliveryResidence = defaultEmpty(invoiceSearch[0].getValue(deliveryResidenceSearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��1
		//add by zzq CH653 20230619 start
		var deliveryResidence2 = defaultEmpty(invoiceSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��2
		var deliveryResidence3 = defaultEmpty(invoiceSearch[0].getValue(deliveryResidence3SearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��3
		//add by zzq CH653 20230619 end
		var duedate = defaultEmpty(invoiceSearch[0].getValue(duedateSearchColumn));//���s��
		var deliveryDate = defaultEmpty(invoiceSearch[0].getValue(deliveryDateSearchColumn));//DJ_�[�i��
		
		//�A�C�e�� 
		var itemIdArray = [];
		var itemDetails = [];
		var amountTotal = 0;
		var taxTotal = 0;
		var taxType = {};
		var invoiceRecord = nlapiLoadRecord("invoice",invoiceid)
		// �o���G�[�V�����x�� 20230803 add by zdj start
		var tmpLocationDic = getLocations(invoiceRecord);
		// �o���G�[�V�����x�� 20230803 add by zdj end
		var Counts = invoiceRecord.getLineItemCount('item');//�A�C�e�����ו�
		if(Counts != 0) {
			for(var s = 1; s <=  Counts; s++){
				var item = defaultEmpty(invoiceRecord.getLineItemValue('item', 'item', s));//�A�C�e��ID
				var quantity = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item', 'quantity', s)));//����
                var quantityFormat = 0;
                if (quantity) {
                    quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
                }
				
				var units_display = defaultEmpty(invoiceRecord.getLineItemValue('item', 'units_display', s));//�P��
				
				 if(!isEmpty(units_display)){
				     var unitsArray = units_display.split("/");
                     if(!isEmpty(unitsArray)){
                         units_display = unitsArray[0];
                     }
				 }
				
				var origrate = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'rate', s)));//�P��
				nlapiLogExecution('debug', 'origrate000', origrate);
//				var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				origrateFormat = formatAmount1(origrate);
				nlapiLogExecution('debug', 'origrateFormat', origrateFormat);
				
				var amount = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'amount', s)));//���z
				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		
				var taxRate = defaultEmpty(invoiceRecord.getLineItemValue('item', 'taxrate1', s));//�ŗ�
				
				var taxAmount = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'tax1amt', s)));//�Ŋz
				nlapiLogExecution('debug', 'taxAmount', taxAmount);
				var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

				var itemSearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","anyof",item]
						], 
						[
						   new nlobjSearchColumn("itemid"),						   
						   new nlobjSearchColumn("displayname"),
						   //20230619 add by zzq CH653 start
		                   new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), //�z�����t���O
		                   //20230608 add by zzq CH653 end
		                   //20230720 add by zzq CH735 start
		                   new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_�i���i���{��jLINE1
		                   new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), //DJ_�i���i���{��jLINE2
		                   new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_�i���i�p��jLINE1
		                   new nlobjSearchColumn("custitem_djkk_product_name_line2"), //DJ_�i���i�p��jLINE2
		                   // �o���G�[�V�����x�� 20230803 add by zdj start
		                   new nlobjSearchColumn("custitem_djkk_product_code"), //�J�^���O���i�R�[�h
		                   // �o���G�[�V�����x�� 20230803 add by zdj end
		                   new nlobjSearchColumn("type")// ���
						   //20230720 add by zzq CH735 end
						]
						);	
				//20230720 add by zzq CH735 start
//				var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));
//				displayname = displayname.replace(new RegExp("&","g"),"&amp;")
				var invoiceItemType = defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("type")); //�A�C�e��type
				var itemDisplayName= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//���i��
				// �o���G�[�V�����x�� 20230803 add by zdj start
				var productCode= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("custitem_djkk_product_code"));//�J�^���O���i�R�[�h
				// �o���G�[�V�����x�� 20230803 add by zdj end
				var displayname = '';
				//add by zdj 20230802 start
				var itemNouhinBikou = invoiceRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',s); //DJ_�[�i�����l
				//add by zdj 20230802 end
				 // �A�C�e���͍Ĕ̗p���̑��̎萔��
				if(invoiceItemType == 'OthCharge') {
				    displayname = othChargeDisplayname(itemDisplayName); // �萔��
				}else{
				    if (!isEmpty(itemSearch)) {
				        var jpName1 = itemSearch[0].getValue("custitem_djkk_product_name_jpline1");
                        var jpName2 = itemSearch[0].getValue("custitem_djkk_product_name_jpline2");
                            if (!isEmpty(jpName1) && !isEmpty(jpName2)) {
                                displayname = jpName1 + ' ' + jpName2;
                            } else if (!isEmpty(jpName1) && isEmpty(jpName2)) {
                                displayname = jpName1;
                            } else if (isEmpty(jpName1) && !isEmpty(jpName2)) {
                                displayname = jpName2;
                        }
				    }
				}
				//add by zdj 20230802 start
				if(displayname){
					if(itemNouhinBikou){
						displayname = displayname + '<br/>' + itemNouhinBikou;
					}
				}else {
					if(itemNouhinBikou){
						displayname = itemNouhinBikou;
					}
				}
				//add by zdj 20230802 end
				// �o���G�[�V�����x�� 20230803 add by zdj start
				var itemLocId = defaultEmpty(invoiceRecord.getLineItemValue('item','location',s)); // �ꏊ
		        var locBarCode = '';
		        if (itemLocId) {
		            var tmpDicBarCode = tmpLocationDic[itemLocId];
		            if (tmpDicBarCode) {
		                locBarCode = tmpDicBarCode;
		            }
		        }
		        var itemid = '';
		        if(!isEmpty(productCode) && !isEmpty(locBarCode)){
		        	itemid = productCode + ' ' + locBarCode;
                }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
                	itemid = locBarCode;
                }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
                	itemid = productCode;
                }else{
                	itemid = ' ';
                }
		        // �o���G�[�V�����x�� 20230803 add by zdj end
				//20230720 add by zzq CH735 end
				//var itemid = defaultEmpty(itemSearch[0].getValue('itemid'));
				//20230619 add by zzq CH653 start
				nlapiLogExecution('debug', '000', itemSearch[0].getValue('custitem_djkk_deliverycharge_flg'));
				var deliverychargeFlg = defaultEmpty(itemSearch[0].getValue('custitem_djkk_deliverycharge_flg'));
				nlapiLogExecution('debug', '001', deliverychargeFlg);
                //20230608 add by zzq CH653 end				
				amountTotal += amount;
				taxTotal += taxAmount;
				
				var taxRateData = taxType[taxRate] || 0;
				taxType[taxRate] = taxRateData + taxAmount + amount;			
				//add by zzq CH690 20230627 start
				//20230720 add by zzq CH735 start
				if(!(amount == 0 && deliverychargeFlg == 'T')){
	                 if(custcurrency == 1){
	                     itemDetails.push({
	                     item : item,// �A�C�e��ID
	                     units_display : units_display,// �P��
//	                     amount : defaultEmptyToZero1(amount),// ���z
	                     amount : formatAmount1(amount),// ���z
	                     quantity : quantity,// ����
//	                     origrate : defaultEmptyToZero1(origrate),// �P��
	                     origrate : formatAmount1(origrate),// �P��
	                     displayname:displayname,// ���id��
	                     itemid:itemid,// ���icode
	                     // add by zzq CH653 20230618 start
	                     deliverychargeFlg:deliverychargeFlg// �z�����t���O
	                     // add by zzq CH653 20230618 end
	                     });
	                     
	              }else{
	                     itemDetails.push({
	                     item : item,// �A�C�e��ID
	                     units_display : units_display,// �P��
	                     amount : amountFormat,// ���z
	                     quantity : quantityFormat,// ����
	                     origrate : origrateFormat,// �P��
	                     displayname:displayname,// ���id��
	                     itemid:itemid,// ���icode
	                     // add by zzq CH653 20230618 start
	                     deliverychargeFlg:deliverychargeFlg// �z�����t���O
	                     // add by zzq CH653 20230618 end
	                    });
	                 }
				}
				//20230720 add by zzq CH735 end
				 nlapiLogExecution('debug', 'origrate', origrate);
				//add by zzq CH690 20230627 end
		     }			
		  }
		//add by zzq CH690 20230627 start
		var amountTotalFormat = '';
		if(custcurrency == 1){
			amountTotalFormat = defaultEmptyToZero1(amountTotal);
		}else{
			amountTotalFormat = amountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		}
		
		var taxTotalFormat = '';
		if(custcurrency == 1){
			taxTotalFormat = defaultEmptyToZero1(taxTotal);
		}else{
			taxTotalFormat = (taxTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		}
		
		//20230901 add by CH762 start 
        var DELIVERYPDF_ADDRESS = '';
        if(subsidiary == SUB_NBKK){
            DELIVERYPDF_ADDRESS = DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF_NBKK;
        }else if(subsidiary == SUB_ULKK){
            DELIVERYPDF_ADDRESS = DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF_ULKK;
        }else{
            DELIVERYPDF_ADDRESS = DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF;
        }
       //20230901 add by CH762 end 
		
//		add by zzq CH690 20230627 end
		var headValue  = {
				salesrep:salesrep,//�c�ƒS����
				legalName:legalName,//�A����������
				EnglishName:EnglishName,//�A��DJ_��Ж��O�p��
				transactionFax:transactionFax,//������pFAX
				//CH655 20230725 add by zdj start
				shipaddressPhone:shipaddressPhone,//�A���z����phone
				shipaddressFax:shipaddressFax,//�A���z����fax
				//CH655 20230725 add by zdj end
				phone:phone,//�A��TEL
				Fax:Fax,//�A��FAX
				paymentPeriodMonths:paymentPeriodMonths,//�x��������
				companyName :companyName,//�ڋq��
				companyName1 : companyName1,
				customeFax:customeFax,//�ڋqFAX
				billcity:billcity,//�s��
				customerCode:customerCode,//�ڋqcodeNum
				customePhone:customePhone,//�ڋqTEL
			    custZipCode :custZipCode,//�ڋq�X��
				custState:custState,//�ڋq�s���{��
				custAddr1:custAddr1,//�ڋq�Z���P
				custAddr2:custAddr2,//�ڋq�Z���Q
				custAddr3:custAddr3,//�ڋq�Z��3
				custAddressee:custAddressee,//�ڋq����
				tranid:tranid,//�������ԍ�
				tranNumber:tranNumber,//�������ԍ�
				otherrefnum:otherrefnum,//��Д����ԍ�
				transactionnumber:transactionnumber,//�󒍔ԍ�(maybe not true)
				deliveryCode:deliveryCode,//DJ_�[�i�� : DJ_�[�i��R�[�h
				deliveryName :deliveryName,//DJ_�[�i�� : DJ_�[�i�於�O
				deliveryZip:deliveryZip,//DJ_�[�i�� : DJ_�X�֔ԍ�
				deliveryPrefectures :deliveryPrefectures,//DJ_�[�i�� : DJ_�s���{��
				deliveryMunicipalities: deliveryMunicipalities,//DJ_�[�i�� : DJ_�s�撬��
				deliveryResidence:deliveryResidence,//DJ_�[�i�� : DJ_�[�i��Z��1
				deliveryResidence2 :deliveryResidence2,//DJ_�[�i�� : DJ_�[�i��Z��2
				//add by zzq CH653 20230619 start
				deliveryResidence3 :deliveryResidence3,//DJ_�[�i�� : DJ_�[�i��Z��3
				//add by zzq CH653 20230619 end
				duedate:duedate,//���s��
				deliveryDate:deliveryDate,//DJ_�[�i��
				// add by zhou 20230602 CH601 start
				memo:memo,//����
				// add by zhou 20230602 CH601 end
				// add by zzq 20230612 CH600 start
				deliveryCodeFax : deliveryCodeFax
				//add by zzq 20230612 CH600 end
				};
		var TotalForTaxEight = 0;
		var TotalForTaxTen = 0;
		for(var k in taxType){
			if(k == '8.0%'){
				 TotalForTaxEight = taxType[k];//�ŗ�8%�Őŋ����z
			}else if(k == '10.0%'){
				 TotalForTaxTen = taxType[k];//�ŗ�20%�Őŋ����z
			}
		}
//		var total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//���v(�ō�)
//		TotalForTaxEight = TotalForTaxEight.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//		TotalForTaxTen = TotalForTaxTen.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		
		//add by zzq CH690 20230627 start
		var total = '';
		if(custcurrency == 1){
//			total = defaultEmptyToZero1(TotalForTaxEight + TotalForTaxTen);
			total = defaultEmptyToZero1(amountTotal + taxTotal);
			TotalForTaxEight = defaultEmptyToZero1(TotalForTaxEight);
			TotalForTaxTen = defaultEmptyToZero1(TotalForTaxTen)
		}else{
			nlapiLogExecution('debug', 'total', TotalForTaxEight + TotalForTaxTen);
//			total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//���v(�ō�)
			total = ( amountTotal + taxTotal ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//���v(�ō�)
			TotalForTaxEight = TotalForTaxEight.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			TotalForTaxTen = TotalForTaxTen.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		}
		//add by zzq CH690 20230627 end
		var str = '';
		nlapiLogExecution('DEBUG', 'zzq');
		var tmpCurrency = invoiceRecord.getFieldValue('currency');
		var displaysymbol = '';
//		if (tmpCurrency) {
//		    var tmpRecd = nlapiLoadRecord('currency', tmpCurrency, 'symbol');
//		    if (tmpRecd) {
//		        displaysymbol = tmpRecd.getFieldValue('displaysymbol');
//		    }
//		}
		str += '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
		'<pdf>'+
		'<head>'+
		'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
		'<#if .locale == "zh_CN">'+
		'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
		'<#elseif .locale == "zh_TW">'+
		'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
		'<#elseif .locale == "ja_JP">'+
		'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
		'<#elseif .locale == "ko_KR">'+
		'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
		'<#elseif .locale == "th_TH">'+
		'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
		'</#if>'+
		'<macrolist>'+
		'<macro id="nlheader">'+
		'<table border="0" cellspacing="0" cellpadding="0" width="660px" align="center">'+
		'<tr>'+
		'<td style="width:104px;"></td>'+
		'<td style="width:104px;"></td>'+
		'<td style="width:102px;"></td>'+
		'<td style="width:80px;"></td>'+
		'<td style="width:102px;"></td>'+
		'<td style="width:104px;"></td>'+
		'<td style="width:104px;"></td>'+
		'</tr>'+
		'<tr>'+
		''+
		'<td colspan="3" rowspan="2" align="center" style="margin-left:25px;border-bottom: 4px black solid;vertical-align:bottom;font-size: 32px;letter-spacing: 35px;line-height:10%;">&nbsp;�[�i��</td>'+
		'<td></td>'+
		// update by zdj 20230802 start
		//'<td colspan="3" style="font-size: 12px;vertical-align:bottom">'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</td>'+
		'<td colspan="3"><span style="font-size: 11px;font-family: heiseimin; vertical-align:bottom" >'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</span></td>'+
		// update by zdj 20230802 end
		''+
		'</tr>'+
		'<tr>'+
		''+
		'<td></td>'+
		//CH655 20230725 add by zdj start
		// �o���G�[�V�����x�� 20230803 update by zdj start
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.phone+'�^������pFAX�F'+headValue.transactionFax+'</td>'+
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'�^������pFAX�F'+headValue.transactionFax+'</td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'�^������pFAX�F'+headValue.shipaddressFax+'</td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj end
		//CH655 20230725 add by zdj end
		''+
		'</tr>'+
		'<tr style="height:12px">'+
		''+
		'<td colspan="3"></td>'+
		'<td></td>'+
		//CH655 20230725 add by zdj start
//		'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.Fax+'</td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj start
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.shipaddressFax+'</td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj end
		//CH655 20230725 add by zdj end
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="3"></td>'+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
		''+
		'</tr>'+
		'<tr>'+
		//add by zzq CH600 start
		'<td colspan="7" style="font-weight: 200;font-size:20px">'+dealFugou(headValue.companyName)+'</td>'+
		//add by zzq CH600 end
		'</tr>'+
		'<tr>'+
		//add by zzq CH600 start
		'<td style="font-weight: 200;font-size:20px">FAX:</td>'+
		'<td colspan="6" style="font-weight: 200;font-size:20px" align="left">'+headValue.deliveryCodeFax+'</td>'+
		//add by zzq CH600 end
		'</tr>'+
		'<tr height="10px">'+
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;">���f�͊i�ʂ̂��������ėL��������܂��B���̓x�͂��������肪�Ƃ��������܂����B</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;border-bottom: 4px solid black;">���L�̒ʂ�[�i�v���܂����̂ŁA���������������B </td>'+
		'</tr>'+
		''+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<tr>'+
		'<td style="width: 65px;"></td>'+
		'<td style="width: 110px;"></td>'+
		'<td style="width: 100px;"></td>'+
		'<td style="width: 90px;"></td>'+
		'<td style="width: 100px;"></td>'+
		'<td style="width: 110px;"></td>'+
		'<td style="width: 95px;"></td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;������F</td>'+
		'<td>'+headValue.customerCode+'</td>'+
		'<td colspan="4">'+dealFugou(headValue.companyName1)+'</td>'+
//		'<td align="center">I</td>'+
		'<td align="center">&nbsp;</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td></td>'+
		'<td>�� &nbsp;550-0002</td>'+
		// CH756&757 update by zdj 20230802 start
		//'<td colspan="5">'+headValue.custState+'&nbsp;&nbsp;&nbsp;'+headValue.billcity+headValue.custAddr1+headValue.custAddr2+'</td>'+
		'<td colspan="5">'+headValue.custState+headValue.billcity+headValue.custAddr1+headValue.custAddr2+'</td>'+
		// CH756&757 update by zdj 20230802 end
		'</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		//20230720 by zzq start
//		'<td style="width: 65px;border-bottom: 1px black solid;"></td>'+
//		'<td style="width: 50px;border-bottom: 1px black solid;">Tel</td>'+
//		'<td style="width: 110px;border-bottom: 1px black solid;">'+headValue.customePhone+'</td>'+
//		'<td style="width: 70px;border-bottom: 1px black solid;">Fax</td>'+
//		'<td colspan="3" style="border-bottom: 1px black solid;">'+headValue.customeFax+'</td>'+
	    '<td style="width: 65px;border-bottom: 2px black solid;"></td>'+
	    '<td style="width: 50px;border-bottom: 2px black solid;">Tel</td>'+
	    '<td style="width: 110px;border-bottom: 2px black solid;">'+headValue.customePhone+'</td>'+
	    '<td style="width: 70px;border-bottom: 2px black solid;">Fax</td>'+
	    '<td colspan="3" style="border-bottom: 2px black solid;">'+headValue.customeFax+'</td>'+
	    //20230720 by zzq end
		'</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px" padding-top="4px">'+
		''+
//		'<tr style="font-weight: 460;font-size: 13px;">'+
//		'<td style="width: 90px;border-top: 1px solid black;">&nbsp;&nbsp;�������ԍ��F</td>'+
//		'<td style="width: 100px;border-top: 1px solid black;">'+headValue.tranNumber+'</td>'+
//		'<td style="width: 60px;border-top: 1px solid black;"><span>�X�{</span><span style="margin-left: 15px;">06</span></td>'+
//		'<td width="60px" style="border-top: 1px solid black;">���s���F</td>'+
//		'<td width="120px" style="border-top: 1px solid black;">'+headValue.duedate+'</td>'+
//		// add by zhou 20230602 CH601 start
////		'<td colspan="2" style="border-top: 1px solid black;">���l</td>'+
//		'<td colspan="2" style="border-top: 1px solid black; overflow: hidden;">���l�F'+getStrLenSlice(dealFugou(headValue.memo), 14)+'</td>'+
//		// add by zhou 20230602 CH601 end
//		'</tr>'+
		//20230720 by zzq start
	    '<tr style="font-weight: 460;font-size: 13px;">'+
	    '<td style="width: 90px;">&nbsp;&nbsp;�������ԍ��F</td>'+
	    '<td style="width: 100px;">'+headValue.tranNumber+'</td>'+
	    '<td style="width: 60px;"><span>�X�{</span><span style="margin-left: 15px;">06</span></td>'+
	    // �o���G�[�V�����x�� 20230803 update by zdj start
	    //'<td width="60px">���s���F</td>'+
	    //'<td width="120px">'+headValue.duedate+'</td>'+
	    '<td width="60px">�[�i���F</td>'+
	    '<td width="120px">'+headValue.deliveryDate+'</td>'+
	    // �o���G�[�V�����x�� 20230803 update by zdj end
	    // add by zhou 20230602 CH601 start
//	    '<td colspan="2" style="border-top: 1px solid black;">���l</td>'+
	    '<td colspan="2">���l�F'+getStrLenSlice(dealFugou(headValue.memo), 14)+'</td>'+
	    // add by zhou 20230602 CH601 end
	    '</tr>'+
	  //20230720 by zzq end
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;�󒍔ԍ��F</td>'+
		'<td colspan="2">'+headValue.transactionnumber+'</td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj start
		//'<td>�[�i���F</td>'+
		//'<td>'+headValue.deliveryDate+'</td>'+
		'<td>�[�i��F</td>'+
		'<td>'+headValue.deliveryCode+'</td>'+
		//'<td colspan="2"></td>'+
		'<td colspan="2" rowspan="2">'+dealFugou(headValue.deliveryName)+'</td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj end
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;��Д����ԍ�</td>'+
		'<td colspan="2">'+headValue.otherrefnum+'</td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj start
		//'<td>�[�i��F</td>'+
		//'<td>'+headValue.deliveryCode+'</td>'+
		'<td colspan="2">&nbsp;</td>'+
		'</tr>'+
		// �o���G�[�V�����x�� 20230803 update by zdj end
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td style="vertical-align:top;">&nbsp;&nbsp;�x�������F</td>'+
		'<td colspan="2" style="vertical-align:top;">'+headValue.paymentPeriodMonths+'</td>'+
		'<td></td>'+
		'<td style="vertical-align:top;">'+headValue.deliveryZip+'</td>'+
		'<td colspan="2" rowspan="2">'+headValue.deliveryPrefectures+'&nbsp;'+headValue.deliveryMunicipalities+headValue.deliveryResidence+headValue.deliveryResidence2+headValue.deliveryResidence3+'</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
        '<td style="vertical-align:top;">&nbsp;</td>'+
        '<td colspan="2" style="vertical-align:top;">&nbsp;</td>'+
        '<td></td>'+
        '<td style="vertical-align:top;">&nbsp;</td>'+
        '</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
		'<tr>'+
		'<td width="8px"></td>'+
		'<td width="90px"></td>'+
		'<td width="15px"></td>'+
		'<td width="125px"></td>'+
		'<td width="125px"></td>'+
		'<td width="60px"></td>'+
		'<td width="65px"></td>'+
		'<td></td>'+
		'<td></td>'+
		'</tr>'+
		'<tr style="font-weight: 400;font-size: 12px;">'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">��&nbsp;&nbsp;��</td>'+
		'<td width="15px" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td colspan="2" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">����</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">�P��</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">���z</td>'+
		'</tr>'+
		'</table>'+
		'</macro>'+
		'<macro id="nlfooter">'+
		
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		'<td width="150px"></td>'+
		'<td width="100px"></td>'+
		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
//		'<td width="150px" ></td>'+
		'<td width="250px"></td>'+
//		'<td width="170px" style="border-top:1px solid black"></td>'+
		'<td width="150px" style="border-top:1px solid black"></td>'+
//		'<td width="90px"  style="border-top:1px solid black;border-right:1px solid black"></td>'+
		'<td width="70px"  style="border-top:1px solid black;border-right:1px"></td>'+
//		'<td width="170px" style="border-top:1px solid black">&nbsp;���v</td>'+
		'<td width="80px"  style="border-top:1px solid black">&nbsp;���v</td>'+
//		'<td width="80px"  style="border-top:1px solid black" align="right">'+displaysymbol + amountTotalFormat+'</td>'+
//		'<td width="80px"  style="border:1px solid black" align="right">'+displaysymbol + amountTotalFormat+'</td>'+
		'<td width="50px"  style="border-top:1px solid black" align="right">'+displaysymbol + amountTotalFormat+'</td>'+
		'</tr>'+
		
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		'<td width="170px"></td>'+
		'<td width="80px"></td>'+
		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
		'<td width="250px"></td>'+
		'<td width="150px">8% �Ώۍ��v(�ō�)</td>'+
		'<td width="70px"  style="border-right:1px solid black" align="right">'+displaysymbol + TotalForTaxEight+'&nbsp;</td>'+
		'<td width="80px">&nbsp;�����</td>'+
//		'<td width="50px" align="right">'+displaysymbol + taxTotalFormat+'</td>'+
		'<td width="50px" align="right">'+displaysymbol + taxTotalFormat+'</td>'+
		'</tr>'+
	
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		'<td width="170px"></td>'+
		'<td width="80px"></td>'+
		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
		'<td width="250px" style="border-bottom:4px solid black">&nbsp;&nbsp;���y���ŗ��Ώ�</td>'+
		'<td width="150px" style="border-bottom:4px solid black">10%�Ώۍ��v(�ō�)</td>'+
		'<td width="70px"  style="border-bottom:4px solid black;border-right:1px solid black" align="right">'+displaysymbol + TotalForTaxTen+'&nbsp;</td>'+
		'<td width="80px"  style="border-bottom:4px solid black">&nbsp;���v(�ō�)</td>'+
//		'<td width="50px"  style="border-bottom:4px solid black" align="right">'+'��' + total+'</td>'+
		'<td width="50px"  style="border-bottom:4px solid black" align="right">'+'��' + total+'</td>'+
		'</tr>'+
		
		'<tr style="height:10px">'+
		''+
		'</tr>'+
		'<tr style="font-weight: bold;font-size: 14px;">'+
		/*******old******/
//		'<td colspan="5" align="center">���݁A�z�����[�h�^�C�����v���X�P���Ƃ����Ē����Ă���܂��B�ʏ탊�[�h�^�C���ɖ߂�ۂ�<br/>�A���߂Ă��A���\���グ�܂��B<br/>�R���i�E�B���X�������X�N�y���ɂ��A���Ѓe�����[�N�����ׁ̈A��ς����f�����|���v��<br/>�܂����A�������̒���낵�����肢�\���グ�܂��B</td>'+
		/*******old******/
		/*******new******/
		//update by zdj 20230802 start
		//'<td colspan="5" align="center">'+shippingdeliverynotice+'</td>'+
		'<td colspan="5"><span align="center" style="font-family: heiseimin;" >'+shippingdeliverynotice+'</span></td>'+
		//update by zdj 20230802 end
		/*******new******/
		'</tr>'+
		'<tr>'+
		'<td colspan="5"></td>'+
		'</tr>'+
		'<tr style="font-weight: bold;font-size: 15px;">'+
		'<td colspan="5" align="center">***** �S<totalpages/>�y�[�W�F<pagenumber/>*****</td>'+
		'</tr>'+
		'</table>'+
		'</macro>'+
		'</macrolist>'+
		'<style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
		'<#if .locale == "zh_CN">'+
		'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
		'<#elseif .locale == "zh_TW">'+
		'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
		'<#elseif .locale == "ja_JP">'+
		'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
		'<#elseif .locale == "ko_KR">'+
		'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
		'<#elseif .locale == "th_TH">'+
		'font-family: NotoSans, NotoSansThai, sans-serif;'+
		'<#else>'+
		'font-family: NotoSans, sans-serif;'+
		'</#if>'+
		'}'+
		'</style>'+
		'</head>';
		str+='<body header="nlheader" header-height="27%" footer="nlfooter" footer-height="14%" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';
		str+=
//		    //20230728 add by zdj start
            //20230720 by zzq start
//          '<table border="0" padding-top="18px">' +
            '<table border="0" padding-top="-2px">'
		    
            //20230720 by zzq end
            //'<tr>'+
            //'<tr height="20px" border = "1px"  margin-top="10px">'+
            //'<td border="1px" width="8px"></td>'+
//          '<td width="90px"></td>'+
            //'<td border="1px" width="100px"></td>'+
            //'<td border="1px" width="15px"></td>'+
            //'<td border="1px" width="125px"></td>'+
            //'<td border="1px" width="125px"></td>'+
//          '<td width="60px"></td>'+
            //'<td border="1px" width="30px"></td>'+
//          '<td width="80px"></td>'+
            //'<td border="1px" width="100px"></td>'+
            //'<td border="1px"></td>'+
            //'<td border="1px"></td>'+
            //'</tr>';
//            //20230728 add by zdj end
		    
		    

			for(var k = 0 ; k < itemDetails.length;k++){
			  //add by zzq CH653 20230619 start
                var taxCodeText = itemDetails[k].deliverychargeFlg == 'T' ? '' : '��';
                var itemQuantity = itemDetails[k].quantity;
                if(itemQuantity){
                    itemQuantity = formatAmount1(itemDetails[k].quantity)
                }
                //20230728 add by zdj start
                str += '<tr style="font-weight: bold;font-size: 12px;height:20px"  margin-top="3px">'+
                '<td width="8px"></td>'+
                '<td width="100px" style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
                '<td width="15px"></td>'+
                '<td width="250px" colspan="2" style="vertical-align: top;">'+dealFugou(itemDetails[k].displayname)+'</td>'+
                //'<td width="125px"></td>'+
                '<td width="30px" style="vertical-align: top;" align="center">'+taxCodeText+'</td>'+
                '<td width="90px" style="vertical-align: top;" align="right">'+itemQuantity+'&nbsp;&nbsp;'+itemDetails[k].units_display+'&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
                '<td width="83px" style="vertical-align: top;" align="right">'+displaysymbol + itemDetails[k].origrate+'</td>'+
                '<td width="84px" style="vertical-align: top;" align="right">'+displaysymbol + itemDetails[k].amount+'&nbsp;</td>'+
              //20230728 add by zdj end
                //add by zzq CH653 20230619 end
//                str += '<tr style="font-weight: bold;font-size: 12px;height:30px">'+
                //str += '<tr style="font-weight: bold;font-size: 12px;height:30px" padding-top = "10px">'+
                //'<td></td>'+
                //'<td style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
//                '<td></td>'+
//                '<td colspan="2" style="vertical-align: top;">'+dealFugou(itemDetails[k].displayname)+'</td>'+
                //add by zzq CH653 20230619 start
//            '<td style="vertical-align: top;" align="center">��</td>'+
//                '<td style="vertical-align: top;" align="center">'+taxCodeText+'</td>'+
                //add by zzq CH653 20230619 end
//            '<td style="vertical-align: top;" align="right">'+itemDetails[k].quantity+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
                //'<td style="vertical-align: top;" align="right">'+itemQuantity+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
//                '<td style="vertical-align: top;" align="right">'+displaysymbol + itemDetails[k].origrate+'</td>'+
//                '<td style="vertical-align: top;" align="right">'+displaysymbol + itemDetails[k].amount+'&nbsp;</td>'+
                '</tr>';
//            '<tr style="font-weight: bold;font-size: 10px;height:20px">'+
//            '<td></td>'+
//            '<td style="vertical-align: top;">93482608</td>'+
//            '<td width="15px"></td>'+
//            '<td></td>'+
//            '<td></td>'+
//            '<td></td>'+
//            '<td></td>'+
//            '<td></td>'+
//            '</tr>';
			}
		    
			str+='</table>';
			
		str += '</body></pdf>';
		var renderer = nlapiCreateTemplateRenderer();
		  renderer.setTemplate(str);
		  var xml = renderer.renderToString();
		  
//			// test
//			var xlsFileo = nlapiCreateFile('�[�i' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
//			
//			xlsFileo.setFolder(109338);
//			nlapiSubmitFile(xlsFileo);
//		  
		  var xlsFile = nlapiXMLToPDF(xml);
		  
		  // PDF
		  //CH762 20230817 add by zdj start
		  //xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
		  xlsFile.setName('�[�i��' + '_' + tranNumber + '_' + getDateYymmddFileName() + '.pdf');
		  //xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
		  //20230901 add by CH762 start 
          //xlsFile.setFolder(DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF);
          xlsFile.setFolder(DELIVERYPDF_ADDRESS);
		  //20230901 add by CH762 end 
		  //CH762 20230817 add by zdj end
		  xlsFile.setIsOnline(true);
		  
		  // save file
		  var fileID = nlapiSubmitFile(xlsFile);
		  var fl = nlapiLoadFile(fileID);
		  
		  var url= URL_HEAD +'/'+fl.getURL();
		  nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
	  }else if(flag == "creditmemo"){
		  
		var creditmemoid = request.getParameter('creditmemo');//invoice
		var creditmemoRecord = nlapiLoadRecord("creditmemo",creditmemoid)
		// �o���G�[�V�����x�� 20230803 add by zdj start
		var tmpLocationDic = getLocations(creditmemoRecord);
		// �o���G�[�V�����x�� 20230803 add by zdj end
		var salesrepSearchColumn =  new nlobjSearchColumn("salesrep");//�ڋq(For retrieval)
		var subsidiarySearchColumn = new nlobjSearchColumn("subsidiary");//�A���q��� (For retrieval)
		var entitySearchColumn =  new nlobjSearchColumn("entity");//�ڋq(For retrieval)
		var tranidSearchColumn = new nlobjSearchColumn("tranid");//�������ԍ�
		var memoSearchColumn = new nlobjSearchColumn("custbody_djkk_deliverynotememo");//memo
		var otherrefnumSearchColumn =  new nlobjSearchColumn("otherrefnum");//��Д����ԍ�
		// �o���G�[�V�����x�� 20230803 update by zdj start
		//var transactionnumberSearchColumn = new nlobjSearchColumn("transactionnumber");//�󒍔ԍ�(maybe not true)
		//CH762 20230817 add by zdj start
        var transactionnumberSearchColumn2 = new nlobjSearchColumn("transactionnumber");//�󒍔ԍ�(maybe not true)
        //CH762 20230817 add by zdj start
		var transactionnumberSearchColumn = new nlobjSearchColumn("custbody_djkk_exsystem_tranid");//DJ_�O���V�X�e���A�g_�����ԍ�
		// �o���G�[�V�����x�� 20230803 update by zdj start
		var deliveryCodeSearchColumn =  new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��R�[�h
		var deliveryNameSearchColumn = new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i�於�O
		var deliveryZipSearchColumn = new nlobjSearchColumn("custrecord_djkk_zip","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�X�֔ԍ�
		var deliveryPrefecturesSearchColumn = new nlobjSearchColumn("custrecord_djkk_prefectures","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�s���{��
		var deliveryMunicipalitiesSearchColumn = new nlobjSearchColumn("custrecord_djkk_municipalities","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�s�撬��
		var deliveryResidenceSearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��1
	      // add by zzq CH653 20230619 start
//      var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��2
        var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_lable","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��2
        var deliveryResidence3SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��3
        // add by zzq CH653 20230619 end
		var deliveryDateSearchColumn = new nlobjSearchColumn("custbody_djkk_delivery_date");//DJ_�[�i��
		// add by zzq CH600 20230612 start
        var deliverySearchColumn =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//DJ_�[�i��
        // add by zzq CH600 20230612 end
		var column = [
		              salesrepSearchColumn,
				      memoSearchColumn,
		              subsidiarySearchColumn,
		              entitySearchColumn,
		              tranidSearchColumn,
		              otherrefnumSearchColumn,
		              transactionnumberSearchColumn,
		              deliveryCodeSearchColumn,
                      //CH762 20230817 add by zdj start
                      transactionnumberSearchColumn2,
                      //CH762 20230817 add by zdj end
		              deliveryNameSearchColumn,
		              deliveryZipSearchColumn,
		              deliveryPrefecturesSearchColumn,
		              deliveryMunicipalitiesSearchColumn,
		              deliveryResidenceSearchColumn,
		              deliveryResidence2SearchColumn,
	                  // add by zzq CH653 20230619 start
	                  deliveryResidence3SearchColumn,
	                  // add by zzq CH653 20230619 end
		              deliveryDateSearchColumn,
	                    // add by zzq CH600 20230612 start
	                    deliverySearchColumn
	                    // add by zzq CH600 20230612 end
		             ]
		var creditmemoSearch = nlapiSearchRecord("creditmemo",null,
				[
	//			   ["type","anyof","CustInvc"],
	//			   "AND",
				   ["internalid","anyof",creditmemoid]
				], 
				column
				);
		var subsidiary = defaultEmpty(creditmemoSearch[0].getValue(subsidiarySearchColumn));//�A���q���internalid (For retrieval)
		// add by zhou 20230602 CH601 start
		var memo = defaultEmpty(creditmemoSearch[0].getValue(memoSearchColumn));//����
		// add by zhou 20230602 CH601 end
		nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)	
		var subsidiaryrSearch = nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",subsidiary]
				], 
				[
				 	new nlobjSearchColumn("legalname"),//�A����������
				 	new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),//�A��DJ_��Ж��O�p��
				 	new nlobjSearchColumn("fax"),//������pFAX
//				 	new nlobjSearchColumn("phone"), //�A��TEL?????
				 	new nlobjSearchColumn("custrecord_djkk_address_fax","Address",null), //�A��FAX
				    new nlobjSearchColumn("phone","Address",null),//�A��TEL
				 	new nlobjSearchColumn("custrecord_djkk_shippingdeliverynotice"),//DJ_�o�׈ē��E���i����[�i���o�͗p���m�点����
	                //CH655 20230725 add by zdj start
                    new nlobjSearchColumn("phone","shippingAddress",null),//�z����phone
                    new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//�z����fax
                    //CH655 20230725 add by zdj end
				]
				);
		var legalName = defaultEmpty(subsidiaryrSearch[0].getValue("legalname"));//�A����������
		var EnglishName = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_subsidiary_en"));//�A��DJ_��Ж��O�p��
		var Fax = 'FAX: ' + defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","Address",null));//�A��FAX
		var phone = 'TEL: ' + defaultEmpty(subsidiaryrSearch[0].getValue("phone","Address",null));//�A��TEL	
		var transactionFax = defaultEmpty(subsidiaryrSearch[0].getValue("fax"));//������pFAX
		var shippingdeliverynotice = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_shippingdeliverynotice"));//DJ_�o�׈ē��E���i����[�i���o�͗p���m�点����
		//CH655 20230725 add by zdj start
        var shipaddressPhone= 'TEL: ' + defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("phone","shippingAddress",null));//�z����phone
        var shipaddressFax= defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","shippingAddress",null));//�z����fax
        //CH655 20230725 add by zdj end
		
		var entity = defaultEmpty(creditmemoSearch[0].getValue(entitySearchColumn));//�ڋqinternalid(For retrieval)	
		nlapiLogExecution('DEBUG', 'entity', entity)
		var customerSearch = nlapiSearchRecord("customer",null,
				[
				   ["internalid","anyof",entity]
				], 
				[	
//				 	new nlobjSearchColumn("billcity"),//�s��
				 	new nlobjSearchColumn("city"),//�s��
				 	new nlobjSearchColumn("companyname"),//���O
				 	new nlobjSearchColumn("custentity_djkk_exsystem_phone_text"),//�ڋqTEL
//				 	new nlobjSearchColumn("fax"),//fax
				 	new nlobjSearchColumn("custentity_djkk_exsystem_fax_text"),//fax
				 	new nlobjSearchColumn("entityid"),//�ڋqcode
				 	new nlobjSearchColumn("custentity_djkk_customer_payment"),//�x������
				 	new nlobjSearchColumn("zipcode","Address",null),
				 	new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//
				 	new nlobjSearchColumn("address1","Address",null),//
				 	new nlobjSearchColumn("address2","Address",null),//
				 	new nlobjSearchColumn("address3","Address",null),//
				 	new nlobjSearchColumn("addressee","Address",null),//	
				 	//add by zzq CH690 20230627 start
				 	new nlobjSearchColumn("currency"),//�ڋq��{�ʉ� 
					//add by zzq CH690 20230627 end
				 	// �o���G�[�V�����x�� 20230803 add by zdj start
				 	new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_�ڋq�x������
		    	    new nlobjSearchColumn("terms"), //�x��������
		    	    new nlobjSearchColumn("custentity_djkk_delivery_book_subname"), //DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
		    	    new nlobjSearchColumn("custentity_djkk_delivery_book_person_t") //DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
				 	// �o���G�[�V�����x�� 20230803 add by zdj end
				]
				);
		
		var customerRecord=nlapiLoadRecord('customer', entity);
		//20230728 add by zdj start
        var paymentPeriodMonths = defaultEmpty(customerRecord.getLineItemValue("recmachcustrecord_suitel10n_jp_pt_customer","custrecord_suitel10n_jp_pt_paym_due_mo_display",1));//�x��������
        var customePhone = customerRecord.getLineItemValue("addressbook","phone",1);//p
        //20230728 add by zdj end
	if(!isEmpty(customerSearch)){
		// �o���G�[�V�����x�� 20230803 update by zdj start
		var companyName1 = defaultEmpty(customerSearch[0].getValue("companyname"));//�ڋq��
		var companyNameCustomer = defaultEmpty(customerSearch[0].getValue("companyname"));//DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
		var personCustomer = defaultEmpty(customerSearch[0].getValue("custentity_djkk_delivery_book_person_t"));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
		// �o���G�[�V�����x�� 20230803 update by zdj end
		var billcity = defaultEmpty(customerSearch[0].getValue("city"));//�s��
		var customerCode = defaultEmpty(customerSearch[0].getValue("entityid"));//�ڋqcode
//		var customeFax = defaultEmpty(customerSearch[0].getValue("fax"));//�ڋqFAX
		var customeFax = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_fax_text"));//�ڋqFAX
		var customePhone = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_phone_text"));//�ڋqTEL
	    var custZipCode = defaultEmpty(customerSearch[0].getValue("zipcode","Address",null));//�ڋq�X��
	    // �o���G�[�V�����x�� 20230803 add by zdj start
	    var customerPayment = defaultEmpty(customerSearch[0].getText("custentity_djkk_customer_payment"));
		var customerTerms = defaultEmpty(customerSearch[0].getText("terms"));
		var paymentPeriodMonths = '';
		if(customerTerms){
            var tmpVal = customerTerms.split("/")[0];
            if (tmpVal) {
            	paymentPeriodMonths = tmpVal;
            }else {
            	paymentPeriodMonths = '';
            }
        } else if(customerPayment){
           var tmpVal = customerPayment.split("/")[0];
           if (tmpVal) {
        	   paymentPeriodMonths = tmpVal;
           }else {
        	   paymentPeriodMonths = '';
           }
        }    
		// �o���G�[�V�����x�� 20230803 add by zdj end
		if(custZipCode && custZipCode.substring(0,1) != '��'){
			custZipCode = '��' + custZipCode;
		}else{
			custZipCode = '';
		}
		//add by zzq CH690 20230627 start
		var custcurrency = defaultEmpty(customerSearch[0].getValue("currency"));////�ڋq��{�ʉ�
		//add by zzq CH690 20230627 end
		var custState = defaultEmpty(customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//�ڋq�s���{��
		var custAddr1 = defaultEmpty(customerSearch[0].getValue("address1","Address",null));//�ڋq�Z���P
		var custAddr2 = defaultEmpty(customerSearch[0].getValue("address2","Address",null));//�ڋq�Z���Q
		var custAddr3 = defaultEmpty(customerSearch[0].getValue("address3","Address",null));//�ڋq�Z��3
		var custAddressee = defaultEmpty(customerSearch[0].getValue("addressee","Address",null));//�ڋq����
		var paymentPeriod =  defaultEmpty(customerSearch[0].getText("custentity_djkk_customer_payment"));//�x������
	}
	nlapiLogExecution('DEBUG', '2')
	nlapiLogExecution('DEBUG', 'paymentPeriod',paymentPeriod)

//		var memo =  defaultEmpty(creditmemoSearch[0].getValue(memo));//memo
		var salesrep =  defaultEmpty(creditmemoSearch[0].getText(salesrepSearchColumn));//�c�ƒS����
		var tranid = defaultEmpty(creditmemoSearch[0].getValue(tranidSearchColumn));//�������ԍ�
		var otherrefnum = defaultEmpty(creditmemoSearch[0].getValue(otherrefnumSearchColumn));//��Д����ԍ�
		var transactionnumber2 = defaultEmpty(creditmemoSearch[0].getValue(transactionnumberSearchColumn2));//transactionnumber PDF 
		var transactionnumber = defaultEmpty(creditmemoSearch[0].getValue(transactionnumberSearchColumn));//�󒍔ԍ�(maybe not true)
		if(isEmpty(transactionnumber)){
			transactionnumber = '';
		}
		var deliveryCode = defaultEmpty(creditmemoSearch[0].getValue(deliveryCodeSearchColumn));//DJ_�[�i�� : DJ_�[�i��R�[�h
		// add by CH600 20230612 start
        var deliveryId = defaultEmpty(creditmemoSearch[0].getValue(deliverySearchColumn));//DJ_�[�i��
        nlapiLogExecution('DEBUG', 'deliveryId', deliveryId);
        
        var letter01 = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_site_fd')); //DJ_���i����[�i�����M��敪
        nlapiLogExecution('debug', 'letter01', letter01);
        var letter02 = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_fax_three')); //DJ_���i����[�i�����M��FAX(3RD�p�[�e�B�[)
        nlapiLogExecution('debug', 'letter02', letter02);
        var companyNameInvo = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_subname'));//DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
        // CH807 add by zzq 20230815 start
		var personInvo = '�[�i�����S���җl'; 
		var person_3rd = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
		var person = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_person'));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
		if(letter01){
	        if(letter01 == '14'){
	            personInvo = person_3rd;
	        }else{
	            if(person){
	                personInvo = person;
	            }
	        }
		}
		// CH807 add by zzq 20230815 end
        var deliveryCodeFax = '';
        var deliveryFax = '';
        var companyNameDelivery = '';
        var personDelivery = '';
        if(!isEmpty(deliveryId)){
//            deliveryCodeFax = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_fax'));
            deliveryFax = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_fax'))
            // �o���G�[�V�����x�� 20230803 update by zdj start
            companyNameDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecorddjkk_name'));//DJ_���i����[�i�����M���Ж�(3RD�p�[�e�B�[)
            personDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_delivery_book_person_t'));//DJ_���i����[�i�����M��S����(3RD�p�[�e�B�[)
            // �o���G�[�V�����x�� 20230803 update by zdj end
        }
     // �o���G�[�V�����x�� 20230803 add by zdj start
        var companyName = '';
     // �o���G�[�V�����x�� 20230803 add by zdj end
        if(letter01){
        if(letter01 == '14'){   //3rd�p�[�e�B�[
        	// �o���G�[�V�����x�� 20230803 add by zdj start
            companyName = companyNameInvo + ' ' + personInvo;
         // �o���G�[�V�����x�� 20230803 add by zdj end
            if(letter02){
               deliveryCodeFax = letter02;
            }
        }else if(letter01 == '15'){  //�[�i��
        	// �o���G�[�V�����x�� 20230803 add by zdj start
            // CH807 add by zzq 20230815 start
//            companyName = companyNameDelivery + ' ' + '�[�i�����S���җl';
            companyName = companyNameDelivery + ' ' + personInvo;
            // CH807 add by zzq 20230815 end
            // �o���G�[�V�����x�� 20230803 add by zdj end
            if(deliveryId && !isEmpty(deliveryFax)){
               deliveryCodeFax = deliveryFax;
            }
        }else if(letter01 == '16'){  //�ڋq��
        	// �o���G�[�V�����x�� 20230803 add by zdj start
            // CH807 add by zzq 20230815 start
//          companyName = companyNameCustomer + ' ' + '�[�i�����S���җl';
            companyName = companyNameCustomer + ' ' + personInvo;
         // CH807 add by zzq 20230815 end
         // �o���G�[�V�����x�� 20230803 add by zdj end
            if(customeFax){
                deliveryCodeFax = customeFax;
          }
         }
        }else{
            if(customeFax){
                deliveryCodeFax = customeFax;   
            }
            // CH807 add by zzq 20230815 start
//          var companyName = companyNameCustomer + ' ' + '�[�i�����S���җl';
            var companyName = companyNameCustomer + ' ' + personInvo;
            // CH807 add by zzq 20230815 end
        }
        //CH736�@20230717 by zzq end
        // add by CH600 20230612 end
		var deliveryName = defaultEmpty(creditmemoSearch[0].getValue(deliveryNameSearchColumn));//DJ_�[�i�� : DJ_�[�i�於�O
		var deliveryZip = defaultEmpty(creditmemoSearch[0].getValue(deliveryZipSearchColumn));//DJ_�[�i�� : DJ_�X�֔ԍ�
		if(deliveryZip && deliveryZip.substring(0,1) != '��'){
			deliveryZip = '��' + deliveryZip;
		}else{
			deliveryZip = '';
		}
		var deliveryPrefectures = defaultEmpty(creditmemoSearch[0].getValue(deliveryPrefecturesSearchColumn));//DJ_�[�i�� : DJ_�s���{��
		var deliveryMunicipalities = defaultEmpty(creditmemoSearch[0].getValue(deliveryMunicipalitiesSearchColumn));//DJ_�[�i�� : DJ_�s�撬��
		var deliveryResidence = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidenceSearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��1
		//add by zzq CH653 20230619 start
        var deliveryResidence2 = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��2
        var deliveryResidence3 = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidence3SearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��3
        //add by zzq CH653 20230619 end
		var duedate = formatDate(new Date());//���s��
		var deliveryDate = defaultEmpty(creditmemoSearch[0].getValue(deliveryDateSearchColumn));//DJ_�[�i��
		
		//�A�C�e�� 
		var itemIdArray = [];
		var itemDetails = [];
		var amountTotal = 0;
		var taxTotal = 0;
		var taxType = {};
		nlapiLogExecution('DEBUG', '3')
		var Counts = creditmemoRecord.getLineItemCount('item');//�A�C�e�����ו�
		if(Counts != 0) {
			for(var s = 1; s <=  Counts; s++){
				//add by zzq CH690 20230627 start
				var item = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'item', s));//�A�C�e��ID
//				var quantity = defaultEmpty(parseInt(creditmemoRecord.getLineItemValue('item', 'quantity', s)));//����
//				var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
//				var origrate = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'rate', s)));//�P��
//				var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//				var amount = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'amount', s)));//���z
//				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//				var taxAmount = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'tax1amt', s)));//�Ŋz
//				var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
				
				var quantity = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item', 'quantity', s)));//����
				var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
				
				var units_display = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'units_display', s));//�P��
                if(!isEmpty(units_display)){
                    var unitsArray = units_display.split("/");
                    if(!isEmpty(unitsArray)){
                        units_display = unitsArray[0];
                    }
                }
				var origrate = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'rate', s)));//�P��
//				var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				origrateFormat = formatAmount1(origrate);
				var amount = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'amount', s)));//���z
				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
				var taxRate = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'taxrate1', s));//�ŗ�
					
				var taxAmount = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'tax1amt', s)));//�Ŋz
				var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				 //add by zzq CH690 20230627 end
				var itemSearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","anyof",item]
						], 
						[
						   new nlobjSearchColumn("itemid"),						   
						   new nlobjSearchColumn("displayname"), 
						   new nlobjSearchColumn("custitem_djkk_product_code"),
						  //20230619 add by zzq CH653 start
                          new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), //�z�����t���O
                          //20230608 add by zzq CH653 end
						 //20230720 add by zzq CH735 start
                           new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_�i���i���{��jLINE1
                           new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), //DJ_�i���i���{��jLINE2
                           new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_�i���i�p��jLINE1
                           new nlobjSearchColumn("custitem_djkk_product_name_line2"), //DJ_�i���i�p��jLINE2
                           // �o���G�[�V�����x�� 20230803 add by zdj start
		                   new nlobjSearchColumn("custitem_djkk_product_code"), //�J�^���O���i�R�[�h
		                   // �o���G�[�V�����x�� 20230803 add by zdj end
                           new nlobjSearchColumn("type")// ���
                           //20230720 add by zzq CH735 end
						]
						);	
                //20230720 add by zzq CH735 start
//              var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));
//              displayname = displayname.replace(new RegExp("&","g"),"&amp;")
                var invoiceItemType = defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("type")); //�A�C�e��type
                var itemDisplayName= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//���i��
                // �o���G�[�V�����x�� 20230803 add by zdj start
				var productCode= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("custitem_djkk_product_code"));//�J�^���O���i�R�[�h
				// �o���G�[�V�����x�� 20230803 add by zdj end
                var displayname = '';
                //add by zdj 20230802 start
				var itemNouhinBikou = creditmemoRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',s); //DJ_�[�i�����l
				//add by zdj 20230802 end
                 // �A�C�e���͍Ĕ̗p���̑��̎萔��
                if(invoiceItemType == 'OthCharge') {
                    displayname = othChargeDisplayname(itemDisplayName); // �萔��
                }else{
                    if (!isEmpty(itemSearch)) {
                        var jpName1 = itemSearch[0].getValue("custitem_djkk_product_name_jpline1");
                        var jpName2 = itemSearch[0].getValue("custitem_djkk_product_name_jpline2");
                            if (!isEmpty(jpName1) && !isEmpty(jpName2)) {
                                displayname = jpName1 + ' ' + jpName2;
                            } else if (!isEmpty(jpName1) && isEmpty(jpName2)) {
                                displayname = jpName1;
                            } else if (isEmpty(jpName1) && !isEmpty(jpName2)) {
                                displayname = jpName2;
                        }
                    }
                }
                //add by zdj 20230802 start
				if(displayname){
					if(itemNouhinBikou){
						displayname = displayname + '<br/>' + itemNouhinBikou;
					}
				}else {
					if(itemNouhinBikou){
						displayname = itemNouhinBikou;
					}
				}
				// �o���G�[�V�����x�� 20230803 add by zdj start
				var itemLocId = defaultEmpty(creditmemoRecord.getLineItemValue('item','location',s)); // �ꏊ
		        var locBarCode = '';
		        if (itemLocId) {
		            var tmpDicBarCode = tmpLocationDic[itemLocId];
		            if (tmpDicBarCode) {
		                locBarCode = tmpDicBarCode;
		            }
		        }
		        var itemid = '';
		        if(!isEmpty(productCode) && !isEmpty(locBarCode)){
		        	itemid = productCode + ' ' + locBarCode;
                }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
                	itemid = locBarCode;
                }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
                	itemid = productCode;
                }else{
                	itemid = ' ';
                }
		        // �o���G�[�V�����x�� 20230803 add by zdj end
				//add by zdj 20230802 end
                //20230720 add by zzq CH735 end
				var productCode = defaultEmpty(itemSearch[0].getValue('custitem_djkk_product_code'));//DJ_�J�^���O���i�R�[�h
				displayname = displayname.replace(new RegExp("&","g"),"&amp;")
				//var itemid = defaultEmpty(itemSearch[0].getValue('itemid'));
				//20230619 add by zzq CH653 start
                var deliverychargeFlg = defaultEmpty(itemSearch[0].getValue('custitem_djkk_deliverycharge_flg'));
                //20230608 add by zzq CH653 end
				amountTotal += amount;
				taxTotal += taxAmount;
				
				var taxRateData = taxType[taxRate] || 0;
				taxType[taxRate] = taxRateData + taxAmount + amount;
				//20230720 add by zzq CH735 start
                if(!(amount == 0 && deliverychargeFlg == 'T')){
                    //add by zzq CH690 20230627 start
                    if(custcurrency == 1){
                       itemDetails.push({
                       item : item,// �A�C�e��ID
                       units_display : units_display,// �P��
//                       amount : defaultEmptyToZero1(amount),// ���z
                       amount : formatAmount1(amount),// ���z
                       quantity : quantity,// ����
//                       origrate : defaultEmptyToZero1(origrate),// �P��
                       origrate : formatAmount1(origrate),// �P��
                       displayname:displayname,// ���id��
                       itemid:itemid,// ���icode
                       productCode:productCode,//���icode
                       // add by zzq CH653 20230618 start
                       deliverychargeFlg:deliverychargeFlg// �z�����t���O
                       // add by zzq CH653 20230618 end
                       });
                       
                }else{
                       itemDetails.push({
                       item : item,// �A�C�e��ID
                       units_display : units_display,// �P��
                       amount : amountFormat,// ���z
                       quantity : quantityFormat,// ����
                       origrate : origrateFormat,// �P��
                       displayname:displayname,// ���id��
                       itemid:itemid,// ���icode
                       productCode:productCode,//���icode
                       // add by zzq CH653 20230618 start
                       deliverychargeFlg:deliverychargeFlg// �z�����t���O
                       // add by zzq CH653 20230618 end
                      });
                   }
                }
              //20230720 add by zzq CH735 end
				 nlapiLogExecution('debug', 'origrate', origrate);
				//add by zzq CH690 20230627 end				
				
//				itemDetails.push({
//					  item : item,//�A�C�e��ID
//					  units_display : units_display,//�P��
//					  amount : parseInt(amountFormat),//���z
//					  quantity : parseInt(quantityFormat),//����
//					  origrate : parseInt(origrate),//�P��
//					  displayname:displayname,//���id��
//					  productCode:productCode,//���icode
//					  itemid:itemid,//���icode
//					  //20230619 add by zzq CH653 start
//					  deliverychargeFlg:deliverychargeFlg
//					  //20230608 add by zzq CH653 end
//				});
			}
		}
		//add by zzq CH690 20230627 start
		var amountTotalFormat = '';
		if(custcurrency == 1){
			amountTotalFormat = ifZero(defaultEmptyToZero1(amountTotal));
		}else{
			amountTotalFormat = ifZero(amountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
		}
		
		var taxTotalFormat = '';
		if(custcurrency == 1){
			taxTotalFormat = defaultEmptyToZero1(taxTotal);
		}else{
			taxTotalFormat = (taxTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		}
		
        //20230901 add by CH762 start 
        var DELIVERYPDF_ADDRESS = '';
        if(subsidiary == SUB_NBKK){
            DELIVERYPDF_ADDRESS = DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF_NBKK;
        }else if(subsidiary == SUB_ULKK){
            DELIVERYPDF_ADDRESS = DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF_ULKK;
        }else{
            DELIVERYPDF_ADDRESS = DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF;
        }
       //20230901 add by CH762 end 
		
//		add by zzq CH690 20230627 end
//		var amountTotalFormat = ifZero(parseInt(amountTotal));
		var headValue  = {
		salesrep:salesrep,//�c�ƒS����
		legalName:legalName,//�A����������
		EnglishName:EnglishName,//�A��DJ_��Ж��O�p��
		transactionFax:transactionFax,//������pFAX
		shipaddressPhone:shipaddressPhone,//�z����phone
		shipaddressFax:shipaddressFax,//�z����fax
		phone:phone,//�A��TEL
		Fax:Fax,//�A��FAX
		//20230728 add by zdj start
		paymentPeriodMonths:paymentPeriodMonths,//�x��������
		//20230728 add by zdj end
		paymentPeriod:paymentPeriod,//DJ_�ڋq�x������
		companyName :companyName,//�ڋq��
		companyName1 : companyName1,
		customeFax:customeFax,//�ڋqFAX
		billcity:billcity,//�s��
		customerCode:customerCode,//�ڋqcodeNum
		customePhone:customePhone,//�ڋqTEL
	    custZipCode :custZipCode,//�ڋq�X��
		custState:custState,//�ڋq�s���{��
		custAddr1:custAddr1,//�ڋq�Z���P
		custAddr2:custAddr2,//�ڋq�Z���Q
		custAddr3:custAddr3,//�ڋq�Z��3
		custAddressee:custAddressee,//�ڋq����
		tranid:tranid,//�������ԍ�
		otherrefnum:otherrefnum,//��Д����ԍ�
		transactionnumber:transactionnumber,//�󒍔ԍ�(maybe not true)
		deliveryCode:deliveryCode,//DJ_�[�i�� : DJ_�[�i��R�[�h
		deliveryName :deliveryName,//DJ_�[�i�� : DJ_�[�i�於�O
		deliveryZip:deliveryZip,//DJ_�[�i�� : DJ_�X�֔ԍ�
		deliveryPrefectures :deliveryPrefectures,//DJ_�[�i�� : DJ_�s���{��
		deliveryMunicipalities: deliveryMunicipalities,//DJ_�[�i�� : DJ_�s�撬��
		deliveryResidence:deliveryResidence,//DJ_�[�i�� : DJ_�[�i��Z��1
		deliveryResidence2 :deliveryResidence2,//DJ_�[�i�� : DJ_�[�i��Z��2
		//add by zzq CH653 20230619 start
        deliveryResidence3 :deliveryResidence3,//DJ_�[�i�� : DJ_�[�i��Z��3
        //add by zzq CH653 20230619 end
		duedate:duedate,//���s��
		deliveryDate:deliveryDate,//DJ_�[�i��
		// add by zhou 20230602 CH601 start
		memo:memo,//����
		// add by zhou 20230602 CH601 end
		// add by zzq 20230612 CH600 start
        deliveryCodeFax : deliveryCodeFax,
        //add by zzq 20230612 CH600 end
        // add by zdj 20230728 start
        deliveryCode : deliveryCode  //DJ_�[�i�� : DJ_�[�i��R�[�h
        //add by zdj 20230728 end
		};
		var TotalForTaxEight = 0;
		var TotalForTaxTen = 0;
		for(var k in taxType){
			if(k == '8.0%'){
				 TotalForTaxEight = taxType[k];//�ŗ�8%�Őŋ����z
			}else if(k == '10.0%'){
				 TotalForTaxTen = taxType[k];//�ŗ�20%�Őŋ����z
			}
		}
//		var total = TotalForTaxEight + TotalForTaxTen;//���v(�ō�)
//		TotalForTaxEight = ifZero(parseInt(TotalForTaxEight));
//		TotalForTaxTen = ifZero(parseInt(TotalForTaxTen));
		//add by zzq CH690 20230627 start
		var total = '';
		if(custcurrency == 1){
//			total =  defaultEmptyToZero1((TotalForTaxEight + TotalForTaxTen));
			total =  defaultEmptyToZero1((amountTotal + taxTotal));
			TotalForTaxEight = defaultEmptyToZero1(TotalForTaxEight);
			TotalForTaxTen = defaultEmptyToZero1(TotalForTaxTen)
		}else{
			nlapiLogExecution('debug', 'total', TotalForTaxEight + TotalForTaxTen);
//			total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//���v(�ō�)
			total = ( amountTotal + taxTotal ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//���v(�ō�)
			TotalForTaxEight = TotalForTaxEight.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			TotalForTaxTen = TotalForTaxTen.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		}
		//add by zzq CH690 20230627 end
		//20230728 by zdj start
		
		//20230728 by zdj end
		var str = '';
		str += '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
		'<pdf>'+
		'<head>'+
		'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
		'<#if .locale == "zh_CN">'+
		'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
		'<#elseif .locale == "zh_TW">'+
		'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
		'<#elseif .locale == "ja_JP">'+
		'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
		'<#elseif .locale == "ko_KR">'+
		'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
		'<#elseif .locale == "th_TH">'+
		'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
		'</#if>'+
		'<macrolist>'+
		'<macro id="nlheader">'+
		'<table border="0" cellspacing="0" cellpadding="0" width="660px" align="center">'+
		'<tr>'+
		'<td style="width:104px;"></td>'+
		'<td style="width:104px;"></td>'+
		'<td style="width:102px;"></td>'+
		'<td style="width:80px;"></td>'+
		'<td style="width:102px;"></td>'+
		'<td style="width:104px;"></td>'+
		'<td style="width:104px;"></td>'+
		'</tr>'+
		'<tr>'+
		''+
		'<td colspan="3" rowspan="2" align="center" style="margin-left:25px;border-bottom: 4px black solid;vertical-align:bottom;font-size: 32px;letter-spacing: 35px;line-height:10%;">&nbsp;�[�i��</td>'+
		'<td></td>'+
		// update by zdj 20230802 start
		//'<td colspan="3" style="font-size: 12px;vertical-align:bottom">'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</td>'+
		'<td colspan="3"><span style="font-size: 11px;font-family: heiseimin; vertical-align:bottom" >'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</span></td>'+
		// update by zdj 20230802 end
		''+
		'</tr>'+
		'<tr>'+
		''+
		'<td></td>'+
		//CH655 20230725 add by zdj start
		// �o���G�[�V�����x�� 20230803 update by zdj start
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.phone+'�^������pFAX�F'+headValue.transactionFax+'</td>'+
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'�^������pFAX�F'+headValue.transactionFax+'</td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'�^������pFAX�F'+headValue.shipaddressFax+'</td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj end
		//CH655 20230725 add by zdj end
		''+
		'</tr>'+
		'<tr style="height:12px">'+
		''+
		'<td colspan="3"></td>'+
		'<td></td>'+
		//CH655 20230725 add by zdj start
//		'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.Fax+'</td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj start
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.shipaddressFax+'</td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj end
		//CH655 20230725 add by zdj end
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="3"></td>'+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
		''+
		'</tr>'+
		'<tr>'+
		//add by zzq CH600 start
        '<td colspan="7" style="font-weight: 200;font-size:20px">'+dealFugou(headValue.companyName)+'</td>'+
        //add by zzq CH600 end
        '</tr>'+
        '<tr>'+
        //add by zzq CH600 start
        '<td style="font-weight: 200;font-size:20px">FAX:</td>'+
        '<td colspan="6" style="font-weight: 200;font-size:20px" align="left">'+headValue.deliveryCodeFax+'</td>'+
        //add by zzq CH600 end
		'</tr>'+
		'<tr height="10px">'+
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;">���f�͊i�ʂ̂��������ėL��������܂��B���̓x�͂��������肪�Ƃ��������܂����B</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;border-bottom: 4px solid black;">���L�̒ʂ�[�i�v���܂����̂ŁA���������������B </td>'+
		'</tr>'+
		''+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<tr>'+
		'<td style="width: 65px;"></td>'+
//		'<td style="width: 90px;"></td>'+
		'<td style="width: 110px;"></td>'+
		'<td style="width: 100px;"></td>'+
//		'<td style="width: 100px;"></td>'+
		'<td style="width: 90px;"></td>'+
		'<td style="width: 100px;"></td>'+
		'<td style="width: 110px;"></td>'+
		'<td style="width: 95px;"></td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;������F</td>'+
		//20230602 CH601 start
		//20230728 add zdj
		'<td>'+headValue.customerCode+'</td>'+
//		'<td colspan="5">'+dealFugou(headValue.companyName)+'</td>'+//changed by zhou 20230208
		'<td colspan="4">'+dealFugou(headValue.companyName1)+'</td>'+//changed by zhou 20230208
		//20230728 end zdj
		//20230602 CH601 end
//		'<td align="center">I</td>'+
		'<td align="center">&nbsp;</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td></td>'+
		'<td>�� &nbsp;550-0002</td>'+
		//20230728 add zdj
//		'<td colspan="5">'+headValue.custState+'&nbsp;&nbsp;&nbsp;'+headValue.billcity+headValue.custAddr1+headValue.custAddr2+headValue.custAddr3+'</td>'+
		'<td colspan="5">'+headValue.custState+headValue.billcity+headValue.custAddr1+headValue.custAddr2+'</td>'+
		//20230728 end zdj
		'</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		//20230728 by zdj start
//		'<td style="width: 65px;border-bottom: 1px black solid;"></td>'+
//		'<td style="width: 50px;border-bottom: 1px black solid;">Tel</td>'+
//		'<td style="width: 110px;border-bottom: 1px black solid;">'+headValue.customePhone+'</td>'+
//		'<td style="width: 70px;border-bottom: 1px black solid;">Fax</td>'+
//		'<td colspan="3" style="border-bottom: 1px black solid;">'+headValue.customeFax+'</td>'+
		'<td style="width: 65px;border-bottom: 2px black solid;"></td>'+
        '<td style="width: 50px;border-bottom: 2px black solid;">Tel</td>'+
        '<td style="width: 110px;border-bottom: 2px black solid;">'+headValue.customePhone+'</td>'+
        '<td style="width: 70px;border-bottom: 2px black solid;">Fax</td>'+
        '<td colspan="3" style="border-bottom: 2px black solid;">'+headValue.customeFax+'</td>'+
		//20230728 by zdj end
		'</tr>'+
		'</table>'+
		//20230728 by zdj start
//		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px"  padding-top="4px">'+
		''+
//		'<tr style="font-weight: 460;font-size: 13px;">'+
//		'<td style="width: 95px;border-top: 1px solid black;">&nbsp;&nbsp;�������ԍ��F</td>'+
//		'<td style="width: 95px;border-top: 1px solid black;">'+headValue.transactionnumber+'</td>'+//20230208 changed by zhou 
//		'<td style="width: 60px;border-top: 1px solid black;"><span></span><span style="margin-left: 15px;"></span></td>'+//20230208 changed by zhou 
//		'<td width="60px" style="border-top: 1px solid black;">���s���F</td>'+
//		'<td width="120px" style="border-top: 1px solid black;">'+headValue.duedate+'</td>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
        '<td style="width: 90px;">&nbsp;&nbsp;�������ԍ��F</td>'+
//        '<td style="width: 100px;">'+headValue.transactionnumber+'</td>'+//20230208 changed by zhou 
        '<td style="width: 100px;">'+headValue.tranid+'</td>'+//20230208 changed by zhou 
//        '<td style="width: 60px;"><span></span><span style="margin-left: 15px;"></span></td>'+//20230208 changed by zhou 
        '<td style="width: 60px;"><span>�X�{</span><span style="margin-left: 15px;">06</span></td>'+//20230208 changed by zhou 
        // �o���G�[�V�����x�� 20230803 update by zdj start
        //'<td width="60px">���s���F</td>'+
        //'<td width="120px">'+headValue.duedate+'</td>'+
        '<td width="60px">�[�i���F</td>'+
        '<td width="120px">'+headValue.deliveryDate+'</td>'+
        // �o���G�[�V�����x�� 20230803 update by zdj end
		//20230728 by zdj end
		// add by zhou 20230602 CH601 start
//		'<td colspan="2" style="border-top: 1px solid black;">���l�F'+headValue.duedate+'</td>'+
//		'<td colspan="2" style="border-top: 1px solid black; overflow: hidden;">���l�F'+dealFugou(getStrLenSlice(headValue.memo, 14))+'</td>'+
        '<td colspan="2">���l�F'+getStrLenSlice(dealFugou(headValue.memo, 14))+'</td>'+
		// add by zhou 20230602 CH601 end
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;�󒍔ԍ��F</td>'+
		'<td colspan="2">'+headValue.transactionnumber+'</td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj start
		//'<td>�[�i���F</td>'+
		//'<td>'+headValue.deliveryDate+'</td>'+
		'<td>�[�i��F</td>'+
		'<td>'+headValue.deliveryCode+'</td>'+
		//'<td colspan="2"></td>'+
		'<td colspan="2" rowspan="2">'+dealFugou(headValue.deliveryName)+'</td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj end
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		//20230728 add by zdj start
//		'<td>&nbsp;&nbsp;��Д����ԍ�:</td>'+
		'<td>&nbsp;&nbsp;��Д����ԍ�</td>'+
		//20230728 add by zdj end
		'<td colspan="2">'+headValue.otherrefnum+'</td>'+
		// �o���G�[�V�����x�� 20230803 update by zdj start
		//'<td>�[�i��F</td>'+
		//'<td>'+headValue.deliveryCode+'</td>'+
		'<td colspan="2">&nbsp;</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td style="vertical-align:top;">&nbsp;&nbsp;�x�������F</td>'+
		'<td colspan="2" style="vertical-align:top;">'+headValue.paymentPeriodMonths+'</td>'+
		'<td></td>'+
		'<td style="vertical-align:top;">'+headValue.deliveryZip+'</td>'+
		'<td colspan="2" rowspan="2">'+headValue.deliveryPrefectures+'&nbsp;'+headValue.deliveryMunicipalities+headValue.deliveryResidence+headValue.deliveryResidence2+headValue.deliveryResidence3+'</td>'+//20230208 changed by zhou
		'</tr>'+
        '<tr style="font-weight: 460;font-size: 13px;">'+
        '<td style="vertical-align:top;">&nbsp;</td>'+
        '<td colspan="2" style="vertical-align:top;">&nbsp;</td>'+
        '<td></td>'+
        '<td style="vertical-align:top;">&nbsp;</td>'+
        '</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
		'<tr>'+
		'<td width="8px"></td>'+
		'<td width="90px"></td>'+
		'<td width="15px"></td>'+
		'<td width="125px"></td>'+
		'<td width="125px"></td>'+
		'<td width="60px"></td>'+
		'<td width="65px"></td>'+
		'<td></td>'+
		'<td></td>'+
		'</tr>'+
		'<tr style="font-weight: 400;font-size: 12px;">'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">��&nbsp;&nbsp;��</td>'+
		'<td width="15px" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td colspan="2" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">����</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">�P��</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">���z</td>'+
		'</tr>'+
		'</table>'+
		'</macro>'+
		'<macro id="nlfooter">'+
		
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		//20230728 by zdj start
//		'<td width="170px"></td>'+
		//20230728 by zdj start
		'<td width="150px"></td>'+
		//20230728 by zdj start
//		'<td width="80px"></td>'+
		'<td width="100px"></td>'+
		//20230728 by zdj end
		'</tr>'+
	
		//20230728 by zdj start
//		'<tr style="font-weight: bold;font-size: 13px;">'+
		'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
//		'<td width="150px" ></td>'+
		'<td width="250px" ></td>'+
//		'<td width="170px" style="border-top:1px solid black"></td>'+
		'<td width="150px" style="border-top:1px solid black"></td>'+
//		'<td width="90px"  style="border-top:1px solid black;border-right:1px dotted black"></td>'+
		'<td width="70px"  style="border-top:1px solid black;border-right:1px"></td>'+
//		'<td width="170px" style="border-top:1px solid black">���v</td>'+
		'<td width="80px"  style="border-top:1px solid black">���v</td>'+
//		'<td width="80px"  style="border-top:1px solid black" align="right">'+amountTotalFormat+'</td>'+
		'<td width="50px"  style="border-top:1px solid black" align="right">'+amountTotalFormat+'</td>'+
		//20230728 by zdj end
		'</tr>'+
		
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		'<td width="170px"></td>'+
		'<td width="80px"></td>'+
		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;">'+
		'<td width="250px">&nbsp;&nbsp;</td>'+//changed by zhou 20230209
		'<td width="150px">8% �Ώۍ��v(�ō�)</td>'+
		'<td width="70px"  style="border-right:1px solid black" align="right">'+ifZero(TotalForTaxEight)+'&nbsp;</td>'+
		'<td width="80px">�����</td>'+
		'<td width="50px" align="right">'+ifZero(taxTotalFormat)+'</td>'+
		'</tr>'+
	
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		'<td width="170px"></td>'+
		'<td width="80px"></td>'+
		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;heigth:30px;">'+
		'<td width="250px" style="border-bottom:4px solid black">&nbsp;&nbsp;���y���ŗ��Ώ�</td>'+//changed by zhou 20230209
		'<td width="150px" style="border-bottom:4px solid black">10%�Ώۍ��v(�ō�)</td>'+
		'<td width="70px"  style="border-bottom:4px solid black;border-right:1px solid black" align="right">'+ifZero(TotalForTaxTen)+'&nbsp;</td>'+
		'<td width="80px"  style="border-bottom:4px solid black">���v(�ō�)</td>'+
		'<td width="50px"  style="border-bottom:4px solid black" align="right">'+'��'+ifZero(total)+'</td>'+
		'</tr>'+
		
		'<tr style="height:10px">'+
		''+
		'</tr>'+
//		'<tr style="font-weight: bold;font-size: 15px;">'+
		'<tr style="font-weight: bold;font-size: 14px;">'+
		//update by zdj 20230802 start
		//'<td colspan="5" align="center">'+shippingdeliverynotice+'</td>'+
		'<td colspan="5"><span align="center" style="font-family: heiseimin;" >'+shippingdeliverynotice+'</span></td>'+
		//update by zdj 20230802 end
		'</tr>'+
		'<tr>'+
		'<td colspan="5"></td>'+
		'</tr>'+
		'<tr style="font-weight: bold;font-size: 15px;">'+
		'<td colspan="5" align="center">***** �S<totalpages/>�y�[�W�F<pagenumber/>*****</td>'+
		'</tr>'+
		'</table>'+
		'</macro>'+
		'</macrolist>'+
		'<style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
		'<#if .locale == "zh_CN">'+
		'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
		'<#elseif .locale == "zh_TW">'+
		'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
		'<#elseif .locale == "ja_JP">'+
		'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
		'<#elseif .locale == "ko_KR">'+
		'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
		'<#elseif .locale == "th_TH">'+
		'font-family: NotoSans, NotoSansThai, sans-serif;'+
		'<#else>'+
		'font-family: NotoSans, sans-serif;'+
		'</#if>'+
		'}'+
		'</style>'+
		'</head>';
		str+='<body header="nlheader" header-height="27%" footer="nlfooter" footer-height="14%" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';
		str+=
		    //20230728 add by zdj start
		    '<table padding-top="-2px">'
//			'<table>'+
//			'<tr >'+
//			'<td width="8px"></td>'+
//			'<td width="100px"></td>'+
//			'<td width="15px"></td>'+
//			'<td width="125px"></td>'+
//			'<td width="125px"></td>'+
////			'<td width="60px"></td>'+
//			'<td width="30px"></td>'+
//			'<td width="90px"></td>'+
//			'<td></td>'+
//			'<td></td>'+
//			'</tr>';
		    //20230728 add by zdj start
		    //20230728 add by zdj end
			for(var k = 0 ; k < itemDetails.length;k++){
				nlapiLogExecution('debug','start',itemDetails[k].displayname);
				//add by zzq ch653 20230619 start
				var taxCodeText = itemDetails.deliverychargeFlg == 'T' ? '' : '��';
				 var itemQuantity = itemDetails[k].quantity;
	                if(itemQuantity){
	                    itemQuantity = formatAmount1(itemDetails[k].quantity)
	                }
				//add by zzq ch653 20230619 end
	            //20230728 add by zdj start
	            str += '<tr style="font-weight: bold;font-size: 12px;height:20px"  margin-top="3px">'+
	            '<td width="8px"></td>'+
	            '<td width="100px" style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
	            '<td width="15px"></td>'+
	            '<td width="250px" colspan="2" style="vertical-align: top;">'+dealFugou(itemDetails[k].displayname)+'</td>'+
	            //'<td width="125px"></td>'+
	            '<td width="30px" style="vertical-align: top;" align="center">'+taxCodeText+'</td>'+
	            '<td width="90px" style="vertical-align: top;" align="right">'+ifZero(itemQuantity)+'&nbsp;&nbsp;'+itemDetails[k].units_display+'&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
	            '<td width="83px" style="vertical-align: top;" align="right">'+itemDetails[k].origrate+'</td>'+
	            '<td width="84px" style="vertical-align: top;" align="right">'+ifZero(itemDetails[k].amount)+'&nbsp;</td>'+
	            //20230728 add by zdj end
//				str += '<tr style="font-weight: bold;font-size: 12px;height:40px">'+
//				'<td></td>'+
//				'<td style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
////				'<td width="15px"></td>'+
//				'<td></td>'+
//				'<td colspan="2" style="vertical-align: top;">'+dealFugou(itemDetails[k].displayname)+'</td>'+
//				//add by zzq ch653 20230619 start
////				'<td style="vertical-align: top;" align="center">��</td>'+
//				'<td style="vertical-align: top;" align="center">'+taxCodeText+'</td>'+
//				//add by zzq ch653 20230619 end
////				'<td style="vertical-align: top;" align="right">'+ifZero(itemDetails[k].quantity)+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
//				'<td style="vertical-align: top;" align="right">'+ifZero(itemQuantity)+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
//				'<td style="vertical-align: top;" align="right">'+itemDetails[k].origrate+'</td>'+
//				'<td style="vertical-align: top;" align="right">'+ifZero(itemDetails[k].amount)+'&nbsp;</td>'+
				'</tr>';
//				'<tr style="font-weight: bold;font-size: 10px;height:20px">'+
//				'<td></td>'+
//				'<td style="vertical-align: top;">'+itemDetails[k].productCode+'</td>'+
//				'<td></td>'+
//				'<td></td>'+
//				'<td></td>'+
//				'<td></td>'+
//				'<td></td>'+
//				'<td></td>'+
//				'</tr>';
			}
			
			str+='</table>';
			
		str += '</body></pdf>';
		var renderer = nlapiCreateTemplateRenderer();
		  renderer.setTemplate(str);
		  var xml = renderer.renderToString();
	        // test
//	        var xlsFileo = nlapiCreateFile('�[�i' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
//	        
//	        xlsFileo.setFolder(109338);
//	        nlapiSubmitFile(xlsFileo);
		  var xlsFile = nlapiXMLToPDF(xml);

		  // PDF
		  //CH762 20230817 add by zdj start
		  //xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
		  xlsFile.setName('�[�i��' + '_' + transactionnumber2 + '_' + getDateYymmddFileName() + '.pdf');
		  //xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
		  //20230901 add by CH762 start 
//		  xlsFile.setFolder(DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF);
		  xlsFile.setFolder(DELIVERYPDF_ADDRESS);
		  //20230901 add by CH762 end 
		  //CH762 20230817 add by zdj end
		  xlsFile.setIsOnline(true);
		  
		  // save file
		  var fileID = nlapiSubmitFile(xlsFile);
		  var fl = nlapiLoadFile(fileID);
		  
		  var url= URL_HEAD +'/'+fl.getURL();
		  nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
	
	}
}

function formatDate(dt){    //���ݓ���
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
}
function defaultEmpty(src){
	return src || '';
}
function defaultEmptyToZero(src){
	return src || 0;
}
function defaultEmptyToZero1(src){
	  var tempStr = Number(src);
	  var str = String(tempStr);
	  var newStr = "";
	  var count = 0;
	  for (var i = str.length - 1; i >= 0; i--) {
	      if (count % 3 == 0 && count != 0) {
	          newStr = str.charAt(i) + "," + newStr;
	      } else {
	          newStr = str.charAt(i) + newStr;
	      }
	      count++;
	  }
	  str = newStr;

	  return str;
	}
function ifZeroAndToFixed2(Num){
	if(Number(Num) != 0){
		var str = '-' + Num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');;
	}else{
		var str = '0.00';
	}
	return str;
}
function ifZero(Num){
	if(Number(Num) != 0){
		var str = '-' + Num;
	}else{
		var str = '0';
	}
	return str;
}
function getFormatYmdHms() {

	// �V�X�e������
	var now = getSystemTime();

	var str = now.getFullYear().toString();
	str += (now.getMonth() + 1).toString();
	str += now.getDate() + "_";
	str += now.getHours();
	str += now.getMinutes();
	str += now.getMilliseconds();

	return str;
}
//CH601 zhou 20230602 start
/**
 * ��������
 * @param val
 * @returns {String}
 */
function dealFugou (value) {
    var reValue = '';
    reValue = value.replace(new RegExp('&','g'),'&amp;')
                   .replace(new RegExp('&amp;lt;','g'),'&lt;') // [&]��u��������ƁA���X�G�X�P�[�v��������Ă���[<]���ω����邽�߁A�߂�
                   .replace(new RegExp('&amp;gt;','g'),'&gt;');
    return reValue;
}
//CH601 zhou 20230602 end

function getStrLenSlice(value, fullAngleCount) {

    if (!value || !fullAngleCount) {
        return '';
    }

    var valueStr = String(value);

    var length = 0;
    var result = '';

    for (var i = 0; i < valueStr.length; i++) {
        var charCode = valueStr.charCodeAt(i);
        var charLength = 1;

        if ((charCode >= 0x3040 && charCode <= 0x309F) || (charCode >= 0x30A0 && charCode <= 0x30FF) || (charCode >= 0x4E00 && charCode <= 0x9FFF)) {
            charLength = 2;
        }

        if (length + charLength > fullAngleCount * 2) {
            break;
        }

        result += valueStr.charAt(i);

        length += charLength;
    }

    return result;
}
function formatAmount1(number) {
    var parts = number.toString().split(".");
    var integerPart = parts[0];
    var decimalPart = parts.length > 1 ? "." + parts[1] : "";
    
    var pattern = /(\d)(?=(\d{3})+$)/g;
    integerPart = integerPart.replace(pattern, "$1,");
    
    return integerPart + decimalPart;
}

//20230720 add by zzq CH735 start
function othChargeDisplayname(dpn) {
    var itemDisplayName = '';
    if (dpn) {
        invoiceDisplayName = dpn.split("/");
        itemDisplayName = invoiceDisplayName[0];
    }
    return itemDisplayName;
}
//20230720 add by zzq CH735 end
/**
 * ��������
 * @param val
 * @returns {String}
 */
function dealFugou (value) {
    var reValue = '';
    reValue = value.replace(new RegExp('&','g'),'&amp;')
                   .replace(new RegExp('&amp;lt;','g'),'&lt;') // [&]��u��������ƁA���X�G�X�P�[�v��������Ă���[<]���ω����邽�߁A�߂�
                   .replace(new RegExp('&amp;gt;','g'),'&gt;');
    return reValue;
}

//�o���G�[�V�����x�� 20230803 update by zdj start
function getLocations (recd) {

    var resultDic = {};
    var tmpLocationIdList = [];
    var tmpCount = recd.getLineItemCount('item');
    for(var z = 1; z < tmpCount + 1;z++ ){
        var tmpLocId = recd.getLineItemValue('item','location', z);
        if (tmpLocId) {
            tmpLocationIdList.push(tmpLocId);
        }
    }
    
    if (tmpLocationIdList.length > 0) {
        var locationSearch = nlapiSearchRecord("location",null,
                [
                   ["internalid","anyof", tmpLocationIdList], 
                   "AND", 
                   ["isinactive","is","F"]
                ], 
                [
                   new nlobjSearchColumn("internalid"), 
                   new nlobjSearchColumn("custrecord_djkk_location_barcode")
                ]
                );
       if (locationSearch && locationSearch.length > 0) {
           for(var t = 0; t < locationSearch.length; t++){
               var tmpId = locationSearch[t].getValue("internalid");
               var tmpBarCode = locationSearch[t].getValue("custrecord_djkk_location_barcode");
               if (tmpId && tmpBarCode) {
                   resultDic[tmpId] = tmpBarCode;
               }
           }
       }
    }

   return resultDic;
}
//�o���G�[�V�����x�� 20230803 update by zdj end