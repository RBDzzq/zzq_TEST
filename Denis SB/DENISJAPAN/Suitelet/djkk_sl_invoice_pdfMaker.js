/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Oct 2022     rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

//�ʐ�����PDF
function suitelet(request, response){
	
try{
	var type = request.getParameter('type'); //type ������ or�N���W�b�g����
	if(type == 'invoice'){
		//������
		var invAmount = 0;
		var invTaxamount = 0;
		var itemLine = new Array();
		var invoiceID = request.getParameter('invoiceid'); //ID
		var invoiceRecord = nlapiLoadRecord('invoice',invoiceID);
		// CH408 zheng 20230517 start
		var tmpLocationDic = getLocations(invoiceRecord);
		// CH408 zheng 20230517 end
		var entity = invoiceRecord.getFieldValue('entity');//�ڋq
		nlapiLogExecution('debug', 'entity', entity);
		var customerSearch= nlapiSearchRecord("customer",null,
				[
					["internalid","anyof",entity]
				], 
				[
				 	new nlobjSearchColumn("address2","billingAddress",null), //������Z��2
			    	new nlobjSearchColumn("address3","billingAddress",null), //������Z��3
			    	new nlobjSearchColumn("city","billingAddress",null), //������s�撬��
			    	//CH734 20230719 by zzq start
			    	new nlobjSearchColumn("country","billingAddress",null), ////�����捑
			    	//CH734 20230719 by zzq end
			    	new nlobjSearchColumn("zipcode","billingAddress",null), //������X�֔ԍ�
			    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //������s���{�� 		
			    	new nlobjSearchColumn("phone"), //�d�b�ԍ�
			    	new nlobjSearchColumn("fax"), //Fax
			    	new nlobjSearchColumn("entityid"), //id
			    	new nlobjSearchColumn("salesrep"), //�̔����i���ВS���j
			    	new nlobjSearchColumn("language"),  //����
			    	new nlobjSearchColumn("currency"),  //��{�ʉ�
			    	new nlobjSearchColumn("custrecord_djkk_pl_code_fd","custentity_djkk_pl_code_fd",null),   //DJ_�̔����i�\�R�[�h�i�H�i�j
			    	new nlobjSearchColumn("companyname"), //naem 
//				 	new nlobjSearchColumn("custentity_djkk_pl_code_fd")   //DJ_�̔����i�\�R�[�h�i�H�i�j
		    	    new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_�ڋq�x������
		    	    new nlobjSearchColumn("terms"), //�x��������
				 	new nlobjSearchColumn("address1","billingAddress",null), //������Z��1
				 	//20230721 by zzq start
				 	new nlobjSearchColumn("state","billingAddress",null), //������Z�� : �s���{��
				 	new nlobjSearchColumn("billaddress")
				 	//20230721 by zzq end

				]
				);	
		var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//�Z��2
		var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//�Z��3
		var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//�s�撬��
		//CH734 20230719 by zzq start
		var invoiceCountry= defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("country","billingAddress",null)));//�����捑
		var invoiceCityUnder= defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("city","billingAddress",null)));//�s�撬��
		var invoicestateEn= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("state","billingAddress",null));
		//CH734 20230719 by zzq end
		var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("zipcode","billingAddress",null)));//�X�֔ԍ�
		var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//�s���{�� 
		var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//�d�b�ԍ�
		var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
		var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
		var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//�̔����i���ВS���j
		// add by zzq start
//		var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//����
		var language= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("language"));//����
		// add by zzq end
		var currency= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("currency"));//�̔����i���ВS���j
		var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_pl_code_fd","CUSTENTITY_DJKK_PL_CODE_FD",null));//DJ_�̔����i�\�R�[�h�i�H�i�jcode
//		var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_pl_code_fd"));//DJ_�̔����i�\�R�[�h�i�H�i�jcode
		var custNameText= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//name add by lj
		var customerPayment = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_customer_payment"));//add by lj
		var customerTerms = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("terms"));//add by zzq
		//nlapiLogExecution('DEBUG', '000', customerTerms);
		var address1 = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("address1","billingAddress",null)));//add by lj

		//20230721 by zzq start
		var invoicebillcountryEn = '';
        if(invoiceCountry){
            if(invoiceCountry == 'JP'){
                invoicebillcountryEn = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getText("country","billingAddress",null)));
            }else{
                invoicebillcountryEn = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("billaddress")));
                if(invoicebillcountryEn){
                   var invoiceCountryEnArr = invoicebillcountryEn.split('\n');
                    invoicebillcountryEn = invoiceCountryEnArr[invoiceCountryEnArr.length-1];
                }
            }
        }
        var invoiceCountryEnAddress = invoicestateEn + '&nbsp;' + invoicebillcountryEn;
		//20230721 by zzq end
		
		//�x������
		//add by zzq start
		var customerPaymentTerms = '';
        if(language == SYS_LANGUAGE_JP){
            if(customerTerms){
                var tmpVal = customerTerms.split("/")[0];
                if (tmpVal) {
                    customerPaymentTerms = tmpVal;
                }
            } else if(customerPayment){
               var tmpVal = customerPayment.split("/")[0];
               if (tmpVal) {
                   customerPaymentTerms = tmpVal;
               }
            }
        } else if(language == SYS_LANGUAGE_EN){
            if(customerTerms){
                var tmpVal = customerTerms.split("/")[1];
                if (tmpVal) {
                    customerPaymentTerms = tmpVal;
                }
            } else if(customerPayment){
               var tmpVal = customerPayment.split("/")[1];
               if (tmpVal) {
                   customerPaymentTerms = tmpVal;
               }
            }
        }
        //add by zzq end

		var trandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //���������t
		var delivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //�������[�i��
		var tranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //�������ԍ�
		//CH762 20230811 add by zdj start
		var transactionPDF = defaultEmpty(invoiceRecord.getFieldValue('transactionnumber'));       //PDF�p
		//CH762 20230811 add by zdj end
		var transactionnumber = defaultEmpty(invoiceRecord.getFieldValue('transactionnumber'));    //�g�����U�N�V�����ԍ��@221207�����ǉ�
		//�o���G�[�V�����x�� 20230803 add by zdj start
		var exsystemTranid = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_exsystem_tranid'));
		if(exsystemTranid){
		    transactionnumber = transactionnumber + '/' + exsystemTranid;
		}
		//�o���G�[�V�����x�� 20230803 add by zdj end
		var createdfrom = defaultEmpty(invoiceRecord.getFieldValue('createdfrom'));    //�������쐬��
		// add by CH598 20230601 start
//		var otherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //�������ԍ�
		var otherrefnum = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_customerorderno'));    //��������ԍ�
		// add by CH598 20230601 end
		var soNumber = '';
		if(!isEmpty(createdfrom)){
			var so = nlapiLoadRecord('salesorder',createdfrom);
			soNumber = so.getFieldValue('transactionnumber');
		}
		var payment = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_payment_conditions'));    //�������x������
//		var salesrep = defaultEmpty(invoiceRecord.getFieldText('salesrep'));    //�c�ƒS����
		var salesrepId = defaultEmpty(invoiceRecord.getFieldValue('salesrep'));    //�c�ƒS����
		// add CH599 zzq 20230520 start
//		if(!isEmpty(salesrep)){
//            if(salesrep.match(/ (.+)/)){
//                salesrep = salesrep.match(/ (.+)/)[1];
//            }
//        }
		var salesrep = '';
		if (salesrepId) {
		    var employeeSearch = nlapiSearchRecord("employee",null,
              [
                 ["internalid","is",salesrepId]
              ], 
              [
                 new nlobjSearchColumn("phone"), 
                 new nlobjSearchColumn("fax"),
                 new nlobjSearchColumn("lastname"),
                 new nlobjSearchColumn("firstname"),
                 new nlobjSearchColumn("custentity_djkk_english_lastname"),
                 new nlobjSearchColumn("custentity_djkk_english_firstname")
              ]
              );
		    var employeelastname = '';
		    var employeefirstname = '';
		    if (language == SYS_LANGUAGE_EN) {
		        //add by zzq CH641 20230613 end
		        employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_lastname")));//�]�ƈ�lastname
		        employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_firstname")));//�]�ƈ�firstname
		        if(employeelastname && employeelastname){
		            salesrep = employeefirstname +'&nbsp;'+ employeelastname;
		        }else if(employeelastname && !employeelastname) {
		            salesrep = employeefirstname;
		        }else if(!employeelastname && employeelastname) {
                    salesrep = employeelastname;
                }
		    } else {
		        employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("lastname")));//�]�ƈ�lastname
		        employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("firstname")));//�]�ƈ�firstname
		        if(employeelastname && employeelastname){
                    salesrep = employeelastname +'&nbsp;'+ employeefirstname;
                }else if(employeelastname && !employeelastname) {
                    salesrep = employeefirstname;
                }else if(!employeelastname && employeelastname) {
                    salesrep = employeelastname;
                }
		    }
      }
		// add CH599 zzq 20230520 end
		// add CH408 20230520 start
		var memo = defaultEmpty(invoiceRecord.getFieldValue('memo'));    //memo
		var dvyMemo = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_deliverynotememo')); //�[�i�����l
		// add CH408 20230520 end
		
		var subsidiary = defaultEmpty(invoiceRecord.getFieldValue('subsidiary'));    //�������q���
		var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
				[
					["internalid","anyof",subsidiary]
				], 
				[
					new nlobjSearchColumn("legalname"),  //��������
					new nlobjSearchColumn("name"), //���O
					new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //���O�p��
					new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //�Z���p��
					new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //�s���{��
					new nlobjSearchColumn("address1","address",null), //�Z��1
					new nlobjSearchColumn("address2","address",null), //�Z��1
					new nlobjSearchColumn("address3","address",null), //�Z��2
					new nlobjSearchColumn("city","address",null), //�s�撬��
					new nlobjSearchColumn("zip","address",null), //�X�֔ԍ�
					new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
					new nlobjSearchColumn("phone","address",null), //phone
					//20230510 add by zhou DENISJAPAN-759 start
					new nlobjSearchColumn("custrecord_djkk_invoice_issuer_number"),//�K�i���������s���ƎҔԍ�
					new nlobjSearchColumn("custrecord_djkk_bank_1"),//DJ_��s1
					new nlobjSearchColumn("custrecord_djkk_bank_2"),//DJ_��s2
					//20230510 add by zhou DENISJAPAN-759 end
					//CH655 20230725 add by zdj start
	                new nlobjSearchColumn("phone","shippingAddress",null),//�z����phone
	                new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//�z����fax
	              //CH655 20230725 add by zdj end
				]
				);	
		var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//��������
		var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//���O
		var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address1","address",null));//�Z��1
		var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//�Z��2
		var invoiceAddressThree= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//�Z��3
		var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//�X�֔ԍ�
		var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//�s�撬��
		var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//�s���{��
		var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//���O�p��
		var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//�Z���p��
		var invoiceFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax
		var invoicePhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","address",null));//phone
		//CH655 20230725 add by zdj start
		var invoiceShipaddressPhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","shippingAddress",null));//�z����phone
		var invoiceShipaddressFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","shippingAddress",null));//�z����fax
		//CH655 20230725 add by zdj end
		
		//20230510 add by zhou DENISJAPAN-759 start
		var invoiceIssuerNumber= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_invoice_issuer_number"));//�K�i���������s���ƎҔԍ�
		var bank1 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_1");
		var bank2 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_2");
		var bankInfo = [];
		var bank1Value = '';
		var bank2Value = '';
//		if(bank1){
//			bank1 = nlapiLoadRecord('customrecord_djkk_bank', bank1);
//			bank1Value = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))+')' + 
//			' '+defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code')) + ')'+
//			' '+defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_type')) + 'No.'+ defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
//		}
//		if(bank2){
//			bank2 = nlapiLoadRecord('customrecord_djkk_bank', bank2);
//			bank2Value = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))+')' + 
//			' '+defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code')) + ')'+
//			' '+defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_type')) + 'No.'+ defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
//		}
		if(bank1){
			bank1 = nlapiLoadRecord('customrecord_djkk_bank', bank1);
			var bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name'));
			if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))){
				bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))+')';
			}
			var bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));
			if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code'))){
				bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
			}
			var bankType1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_type'));
			var bankNo1 = '';
			if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'))){
			    //CH756&CH757 20230801 by zdj start
//				bankNo1 = 'No.'+ defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
			    bankNo1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
			    //CH756&CH757 20230801 by zdj end
			}
		}
		if(bank2){
			bank2 = nlapiLoadRecord('customrecord_djkk_bank', bank2);
			var bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name'));
			if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))){
				bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))+')';
			}
			var bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));
			if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code'))){
				bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
			}
			var bankType2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_type'));
			var bankNo2 = '';
			if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'))){
			    //CH756&CH757 20230801 by zdj start
//				bankNo2 = 'No.'+ defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
			    bankNo2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
			    //CH756&CH757 20230801 by zdj end
			}
		}
		//20230510 add by zhou DENISJAPAN-759 end
		
		var incoicedelivery_destination = invoiceRecord.getFieldValue('custbody_djkk_delivery_destination');    //�������[�i��
		if(!isEmpty(incoicedelivery_destination)){	
			
			var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
					[
						["internalid","anyof",incoicedelivery_destination]
					], 
					[
						new nlobjSearchColumn("custrecord_djkk_zip"),  //�X�֔ԍ�
						new nlobjSearchColumn("custrecord_djkk_prefectures"),  //�s���{��
						new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_�s�撬��
						new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_�[�i��Z��1
						//add by CH653 20230619 start
//						new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_�[�i��Z��2
						new nlobjSearchColumn("custrecord_djkk_delivery_lable"),  //DJ_�[�i��Z��2
						new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_�[�i��Z��3
						//add by CH653 20230619 end
						new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_�[�i�於�O
							  
					]
					);	
			var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//�X�֔ԍ�
			var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//�s���{��
			var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_�s�撬��
			var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_�[�i��Z��1
			//add by CH653 20230619 start
//			var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_�[�i��Z��2
			var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_lable'));//DJ_�[�i��Z��3
			var invdestinationAddress3 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_�[�i��Z��3
			//add by CH653 20230619 end
			var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_�[�i�於�O
		}
		
		var tmpCurrency = invoiceRecord.getFieldValue('currency');
		var displaysymbol = '';
		if (tmpCurrency) {
		    var tmpRecd = nlapiLoadRecord('currency', tmpCurrency, 'symbol');
		    if (tmpRecd) {
		        displaysymbol = tmpRecd.getFieldValue('displaysymbol');
		    }
		}
		
		var invoiceCount = invoiceRecord.getLineItemCount('item');
		var invoToTotal =0;
        var invoAmountTotal = 0;
        //add by zzq 20230625 CH654 start
        //add by zzq 20230614 start
//        var invTaxmountTotal = 0;
        var invTaxmountTotal = 0;
//        var invTaxmountTotal8 = 0;
//        var invTaxmountTotal10 = 0;
      //add by zzq 20230614 end
		for(var k=1;k<invoiceCount+1;k++){
			invoiceRecord.selectLineItem('item',k);
			var invoiceItemId = invoiceRecord.getLineItemValue('item','item',k);	//item
			var invoiceItemSearch = nlapiSearchRecord("item",null,
					[
					 	["internalid","anyof",invoiceItemId],
					],
					[
					  new nlobjSearchColumn("itemid"), //���i�R�[�h
				      //20230608 add by zzq CH599 start
                      new nlobjSearchColumn("displayname"), //���i��
                      new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_�i���i���{��jLINE1
                      new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), //DJ_�i���i���{��jLINE2
                      new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_�i���i�p��jLINE1
                      new nlobjSearchColumn("custitem_djkk_product_name_line2"), //DJ_�i���i�p��jLINE2
                      //20230608 add by zzq CH599 end
					  new nlobjSearchColumn("custitem_djkk_product_code"), //�J�^���O���i�R�[�h
					//20230608 add by zzq CH599 start
                      new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), //�z�����t���O
                      //20230608 add by zzq CH599 end
                      //add by zzq 20230614 start
                      new nlobjSearchColumn("type")
					  //add by zzq 20230614 end
					]
					); 
			 //20230608 add by zzq CH599 start
			var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//�P��
			if(!isEmpty(invoiceRateFormat)){
                invoiceRateFormat = parseFloat(invoiceRateFormat).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); 
            }
			nlapiLogExecution('DEBUG', 'Number(invoiceRateFormat)>0', Number(invoiceRateFormat)>0);
			nlapiLogExecution('DEBUG', 'custitem_djkk_deliverycharge_flg', invoiceItemSearch[0].getValue("custitem_djkk_deliverycharge_flg"));
            if(!(Number(invoiceRateFormat)==0 && invoiceItemSearch[0].getValue("custitem_djkk_deliverycharge_flg") == 'T')){
                var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//���i�R�[�h
                var productCode= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("custitem_djkk_product_code"));//�J�^���O���i�R�[�h
              //20230608 add by zzq CH599 start
//              var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//���i��
//              invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;");
             // by add zzq CH671 20230704 start
                var invoiceItemType = defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("type")); //�A�C�e��type
                nlapiLogExecution('debug', 'invoiceItemType', invoiceItemType);
                var itemDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//���i��
                var invoiceDisplayName = '';
                var invoiceItemNouhinBikou = invoiceRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',k); //DJ_�[�i�����l
                     if(invoiceItemType == 'OthCharge') { // �A�C�e���͍Ĕ̗p���̑��̎萔��
                        invoiceDisplayName = othChargeDisplayname(itemDisplayName, language); // �萔��
                        nlapiLogExecution('debug', 'invoiceDisplayName', invoiceDisplayName);
                    }else{
                        if (!isEmpty(invoiceItemSearch)) {
                            // add by zzq start
                            // if(custLanguage == '���{��'){
                            if (language == SYS_LANGUAGE_JP) {
                                // add by zzq end
                                var jpName1 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_jpline1");
                                var jpName2 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_jpline2");
                                    if (!isEmpty(jpName1) && !isEmpty(jpName2)) {
                                        invoiceDisplayName = jpName1 + ' ' + jpName2;
                                    } else if (!isEmpty(jpName1) && isEmpty(jpName2)) {
                                        invoiceDisplayName = jpName1;
                                    } else if (isEmpty(jpName1) && !isEmpty(jpName2)) {
                                        invoiceDisplayName = jpName2;
                                }
                            } else {
                                var enName1 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_line1");
                                var enName2 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_line2");
                                    if (!isEmpty(enName1) && !isEmpty(enName2)) {
                                        invoiceDisplayName = enName1 + ' ' + enName2;
                                    } else if (!isEmpty(enName1) && isEmpty(enName2)) {
                                        invoiceDisplayName = enName1;
                                    } else if (isEmpty(enName1) && !isEmpty(enName2)) {
                                        invoiceDisplayName = enName2;
                                }
                            }
                            // add by zzq end
                        }
                    }
                    if (invoiceDisplayName) {
                        if (invoiceItemNouhinBikou) {
                            invoiceDisplayName = invoiceDisplayName + '<br/>' + invoiceItemNouhinBikou;
                        }
                    } else {
                        if (invoiceItemNouhinBikou) {
                            invoiceDisplayName = invoiceItemNouhinBikou;
                        }
                    }
              // 20230608 add by zzq CH599 start
             
// var invoiceItemType= defaultEmpty(isEmpty(invoiceItemSearch) ? '' : invoiceItemSearch[0].getValue("type"));//���
// if(invoiceItemType == 'OthCharge'){
// // if(invoiceDisplayName){
//////                    var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//���i��
////                      invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;");
////                }
//                }
                //add by zzq 20230614 end
                //20230608 add by zzq CH599 end
             // by add zzq CH671 20230704 end
                var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//����
                
                var invoiceAmount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','amount',k)));//���z  
                invAmount = 0;
                if(!isEmpty(invoiceAmount)){
                    var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');   
                    invAmount  += invoiceAmount;
                    // modify by lj start DENISJAPANDEV-1376
                    invoAmountTotal = invoAmountTotal + invoiceAmount;
                    // invoAmountTotal = invoAmountTotal + invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
                    // modify by lj end DENISJAPANDEV-1376
                }else{
                    var invAmountFormat = '0';
                }
                
                var invoiceTaxrate1Format = defaultEmpty(invoiceRecord.getLineItemValue('item','taxrate1',k));//�ŗ�
                var invoiceTaxamount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','tax1amt',k)));//�Ŋz   
                var invoiceTaxcode = defaultEmpty(invoiceRecord.getLineItemValue('item','taxcode',k));//�ŗ�
                invTaxamount = 0;
                if(!isEmpty(invoiceTaxamount)){
                    var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                    invTaxamount += invoiceTaxamount;
                  //add by zzq 20230625 CH654 start
                  //add by zzq 20230614 start
//                    invTaxmountTotal = invTaxmountTotal + invoiceTaxamount;
                    invTaxmountTotal = invTaxmountTotal + invoiceTaxamount;
                    //add by zzq 20230625 CH654 end
//                    if(invoiceTaxrate1Format == '10.0%'){
//                        invTaxmountTotal10 = invTaxmountTotal10 + invoiceTaxamount;
//                    }else if(invoiceTaxrate1Format == '8.0%'){
//                        invTaxmountTotal8 = invTaxmountTotal8 + invoiceTaxamount;
//                    }
                  //add by zzq 20230614 end
                    // invTaxmountTotal = invTaxmountTotal + invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
                }else{
                    invTaxamountFormat = '0';
                }
                
                var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
                // modify by lj start DENISJAPANDEV-1376
                if(!isEmpty(invoTotal)){
                    invoToTotal = invoToTotal + invoTotal;
                    // invoToTotal = invoToTotal + invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
                }
                // modify by lj end DENISJAPANDEV-1376

                
                var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//�P��
                nlapiLogExecution('DEBUG', 'invoiceUnitabbreviation', invoiceUnitabbreviation);
                nlapiLogExecution('DEBUG', 'language', language);
                if(!isEmpty(language)&&!isEmpty(invoiceUnitabbreviation)){
                    var unitSearch = nlapiSearchRecord("unitstype",null,
                            [
                               ["abbreviation","is",invoiceUnitabbreviation]
                            ], 
                            [
                               new nlobjSearchColumn("abbreviation")
                            ]
                            );  
                    if(unitSearch != null){
                        if(language == SYS_LANGUAGE_EN){            //�p��
                            var units_display = unitSearch[0].getValue('abbreviation')+'';
                            nlapiLogExecution('DEBUG', 'units_display_EN', units_display);
                            unitsArray = units_display.split("/");
                            nlapiLogExecution('DEBUG', 'unitsArray.length', unitsArray.length);
                            if(unitsArray.length == 2){
                                invoiceUnitabbreviation = unitsArray[1];
                            }
                        }else if(language == SYS_LANGUAGE_JP){              //���{��
                            var units_display = unitSearch[0].getValue('abbreviation')+'';
                            nlapiLogExecution('DEBUG', 'units_display_JP', units_display);
                            unitsArray = units_display.split("/");
                            if(!isEmpty(unitsArray)){
                                invoiceUnitabbreviation = unitsArray[0];
                            }else if(unitsArray.length == 0){
                                invoiceUnitabbreviation = units_display;
                            }
                        }
                    }
                }
                // CH408 zheng 20230517 start
                var itemLocId = defaultEmpty(invoiceRecord.getLineItemValue('item','location',k)); // �ꏊ
                var locBarCode = '';
                if (itemLocId) {
                    var tmpDicBarCode = tmpLocationDic[itemLocId];
                    if (tmpDicBarCode) {
                        locBarCode = tmpDicBarCode;
                    }
                }
                
                // CH599 zzq 20230608 start
//                if(!isEmpty(productCode) && !isEmpty(locBarCode)){
//                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode+'<br/>'+locBarCode;
//                }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
//                    invoiceInitemid = invoiceInitemid+'<br/>'+ ' '+'<br/>'+locBarCode;
//                }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
//                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode+'<br/>'+' ';
//                }else{
//                    invoiceInitemid = invoiceInitemid+'<br/>'+ ' '+'<br/>'+' ';
//                }
                // CH599 zzq 20230608 end
              //CH734 20230717 by zzq start
                if(!isEmpty(productCode) && !isEmpty(locBarCode)){
                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode + ' ' + locBarCode;
                }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
                    invoiceInitemid = invoiceInitemid+'<br/>'+ locBarCode;
                }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode;
                }else{
                    invoiceInitemid = invoiceInitemid+'<br/>'+ ' ';
                }
                //CH734 20230717 by zzq end
                
                // CH408 zheng 20230517 end
                itemLine.push({
                    invoiceInitemid:invoiceInitemid,  //���i�R�[�h
                    invoiceDisplayName:invoiceDisplayName,//���i��
                    invoiceQuantity:invoiceQuantity,//����
                    invoiceRateFormat:invoiceRateFormat,//�P��
                    invoiceAmount:invAmountFormat,//���z  
                    invoiceTaxrate1Format:invoiceTaxrate1Format,//�ŗ�
                    //add by zzq 20230625 CH654 start
//                    invoiceTaxamount:invTaxamountFormat,//�Ŋz  
                    invoiceTaxamount:invoiceTaxamount,//�Ŋz  
                  //add by zzq 20230625 CH654 end
                    invoiceUnitabbreviation:invoiceUnitabbreviation,
                    productCode:productCode,//�J�^���O���i�R�[�h
                    locBarCode:locBarCode,//DJ_�ꏊ�o�[�R�[�h
                    invoiceTaxcode :invoiceTaxcode//�ŗ��R�[�h
                }); 
            }
          //20230608 add by zzq CH599 end
		}
		//20230625 add by zzq CH654 start
		var resultItemTaxArr = [];
		var invoiceTaxrate1FormatArr = [];
		for(var i = 0;i < itemLine.length; i++){
		    nlapiLogExecution('DEBUG', 'itemLine[i].invoiceTaxamount', itemLine[i].invoiceTaxamount);
		    var tax = invoiceTaxrate1FormatArr.indexOf(itemLine[i].invoiceTaxcode);
		    if(tax > -1){
		        if(itemLine[i].invoiceTaxamount){
		            resultItemTaxArr[tax].invoiceTaxamount = parseFloat(resultItemTaxArr[tax].invoiceTaxamount) + parseFloat(itemLine[i].invoiceTaxamount);
		        }
		    }else{
		        invoiceTaxrate1FormatArr.push(itemLine[i].invoiceTaxcode);
		        var resultItemTaxObj = {};
		        if(itemLine[i].invoiceTaxamount){
		            resultItemTaxObj.invoiceTaxamount = itemLine[i].invoiceTaxamount;
		        }else{
		            resultItemTaxObj.invoiceTaxamount = 0;
		        }
		        resultItemTaxObj.invoiceTaxrate1Format = itemLine[i].invoiceTaxrate1Format;
		        resultItemTaxObj.invoiceTaxcode = itemLine[i].invoiceTaxcode;
		        resultItemTaxArr.push(resultItemTaxObj);
		    }
		}
		 resultItemTaxArr.sort(function(a, b) {
	            if (a.invoiceTaxcode == 8) {
	              return -1;
	            } else if (b.invoiceTaxcode == 8) {
	              return 1;
	            } else if (a.invoiceTaxcode == 11) {
	              return -1;
	            } else if (b.invoiceTaxcode == 11) {
	              return 1;
	            } else if (a.invoiceTaxcode == 10) {
	              return -1;
	            } else if (b.invoiceTaxcode == 10) {
	              return 1;
	            } else {
	              return 0;
	            }
	          });
		//20230625 add by zzq CH654 end
	}else if(type == 'creditmemo'){
		//�N���W�b�g����
		nlapiLogExecution('debug','start','start');
		var invAmount = 0;
		var invTaxamount = 0;
		var itemLine = new Array();
		var creditmemoId = request.getParameter('creditmemoId'); //creditmemoID
		var creditmemoRecord = nlapiLoadRecord('creditmemo',creditmemoId);
	    // CH408 zheng 20230517 start
        var tmpLocationDic = getLocations(creditmemoRecord);
        // CH408 zheng 20230517 end
		var entity = creditmemoRecord.getFieldValue('entity');//�ڋq
		var customerSearch= nlapiSearchRecord("customer",null,
				[
					["internalid","anyof",entity]
				], 
				[
				 	new nlobjSearchColumn("address2","billingAddress",null), //������Z��2
			    	new nlobjSearchColumn("address3","billingAddress",null), //������Z��3
			    	new nlobjSearchColumn("city","billingAddress",null), //������s�撬��
			    	//CH734 20230719 by zzq start
			    	new nlobjSearchColumn("country","billingAddress",null), //country
			    	//CH734 20230719 by zzq end
			    	new nlobjSearchColumn("zipcode","billingAddress",null), //������X�֔ԍ�
			    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //������s���{�� 		
			    	new nlobjSearchColumn("phone"), //�d�b�ԍ�
			    	new nlobjSearchColumn("fax"), //Fax	`
			    	new nlobjSearchColumn("entityid"), //id
			    	new nlobjSearchColumn("companyname"), //naem
			    	new nlobjSearchColumn("salesrep"), //�̔����i���ВS���j
			    	new nlobjSearchColumn("language"),  //����
			    	new nlobjSearchColumn("currency"),  //��{�ʉ�
			    	new nlobjSearchColumn("custrecord_djkk_pl_code_fd","custentity_djkk_pl_code_fd",null),   //DJ_�̔����i�\�R�[�h�i�H�i�j
//				 	new nlobjSearchColumn("custentity_djkk_pl_code_fd")   //DJ_�̔����i�\�R�[�h�i�H�i�j
		    	    new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_�ڋq�x������
		    	    new nlobjSearchColumn("terms"), //�x��������
				 	new nlobjSearchColumn("address1","billingAddress",null), //������Z��1
	                //20230721 by zzq start
                    new nlobjSearchColumn("state","billingAddress",null), //������Z�� : �s���{��
                    new nlobjSearchColumn("billaddress")
                    //20230721 by zzq end

				 	

				]
				);	
		var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//�Z��2
		var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//�Z��3
		var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//�s�撬��
		//CH734 20230719 by zzq start
		var invoiceCountry= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("country","billingAddress",null));//country
		var invoiceCityUnder= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//�s�撬��
		//CH734 20230719 by zzq end
		var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//�X�֔ԍ�
		var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//�s���{�� 
		var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//�d�b�ԍ�
		var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
		var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
		nlapiLogExecution('debug', 'entityid0', entityid);
		var custNameText= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//name add by zhou
		var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//�̔����i���ВS���j
		// add by zzq start
//		var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//����
		var language= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("language"));//����
//		nlapiLogExecution('debug','custLanguage',custLanguage);
		nlapiLogExecution('debug','language',language);
		// add by zzq end
		var currency= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("currency"));//�̔����i���ВS���j
		var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_pl_code_fd","CUSTENTITY_DJKK_PL_CODE_FD",null));//DJ_�̔����i�\�R�[�h�i�H�i�jcode
//		var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_pl_code_fd"));//DJ_�̔����i�\�R�[�h�i�H�i�jcode
		var customerPayment = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_customer_payment"));//add by lj
		var customerTerms = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("terms"));//add by zzq
		var address1 = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address1","billingAddress",null));//add by lj
		
		//	nlapiLogExecution('debug', 'custLanguage', custLanguage)
		

        //20230721 by zzq start
		var invoicestateEn = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("state","billingAddress",null)));
        var invoicebillcountryEn = '';
        if(invoiceCountry){
            if(invoiceCountry == 'JP'){
                invoicebillcountryEn = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getText("country","billingAddress",null)));
            }else{
                invoicebillcountryEn = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("billaddress")));
                if(invoicebillcountryEn){
                   var invoiceCountryEnArr = invoicebillcountryEn.split('\n');
                    invoicebillcountryEn = invoiceCountryEnArr[invoiceCountryEnArr.length-1];
                }
            }
        }
        var invoiceCountryEnAddress = invoicestateEn + '&nbsp;' + invoicebillcountryEn;
        //20230721 by zzq end
		//�x������
		//add by zzq start
        var customerPaymentTerms = '';
        if (language == SYS_LANGUAGE_JP) {
            if (customerTerms) {
                var tmpVal = customerTerms.split("/")[0];
                if (tmpVal) {
                    customerPaymentTerms = tmpVal;
                }
            } else if (customerPayment) {
                var tmpVal = customerPayment.split("/")[0];
                if (tmpVal) {
                    customerPaymentTerms = tmpVal;
                }
            }
        } else if (language == SYS_LANGUAGE_EN) {
            if (customerTerms) {
                var tmpVal = customerTerms.split("/")[1];
                if (tmpVal) {
                    customerPaymentTerms = tmpVal;
                }
            } else if (customerPayment) {
                var tmpVal = customerPayment.split("/")[1];
                if (tmpVal) {
                    customerPaymentTerms = tmpVal;
                }
            }
        }
       // nlapiLogExecution('DEBUG', 'customerPaymentTerms', customerPaymentTerms);
        //add by zzq end

		var trandate = defaultEmpty(creditmemoRecord.getFieldValue('trandate'));    //�N���W�b�g�������t
		var delivery_date = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_date'));    //�N���W�b�g�����[�i��
		var tranid = defaultEmpty(creditmemoRecord.getFieldValue('tranid'));    //�N���W�b�g�����ԍ�
		//CH762 20230811 add by zdj start
		var transactionPDF = defaultEmpty(creditmemoRecord.getFieldValue('transactionnumber'));       //PDF�p
		//CH762 20230811 add by zdj end
		var transactionnumber = defaultEmpty(creditmemoRecord.getFieldValue('transactionnumber'));    //�g�����U�N�V�����ԍ��@221207�����ǉ�
		//�o���G�[�V�����x�� 20230803 add by zdj start
        var exsystemTranid = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_exsystem_tranid'));
        if(exsystemTranid){
            transactionnumber = transactionnumber + '/' + exsystemTranid;
        }
        //�o���G�[�V�����x�� 20230803 add by zdj end
		var createdfrom = defaultEmpty(creditmemoRecord.getFieldValue('createdfrom'));    //�N���W�b�g�����쐬��
		var otherrefnum = '';//��Д����ԍ�
		// add by CH598 20230601 start
//		var otherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //�������ԍ�
		var otherrefnum = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_customerorderno'));    //��������ԍ�
		// add by CH598 20230601 end
		nlapiLogExecution('debug','createdfrom',createdfrom)
		var soNumber = '';
		if(!isEmpty(createdfrom)){
			var transactionSearch = nlapiSearchRecord("transaction",null,
					[
					   ["internalid","anyof",createdfrom]
					], 
					[
					   new nlobjSearchColumn("transactionnumber")
					]
					);
			
			
			if(!isEmpty(transactionSearch)){
					var createdfromTran = defaultEmpty(transactionSearch[0].getValue("transactionnumber"));	//�쐬��    �g�����U�N�V�����ԍ�
				nlapiLogExecution('debug','',createdfromTran)
			}
		}
		var payment = defaultEmpty(creditmemoRecord.getFieldText('custbody_djkk_payment_conditions'));    //�N���W�b�g�����x������
		// add by zzq CH599 20230607 start
//		var salesrep = defaultEmpty(creditmemoRecord.getFieldText('salesrep'));    //�c�ƒS����
//		var salesrep = defaultEmpty(creditmemoRecord.getFieldText('salesrep'));    //�c�ƒS����
	      var salesrepId = defaultEmpty(creditmemoRecord.getFieldValue('salesrep'));    //�c�ƒS����
	        // add CH599 zzq 20230520 start
//	      if(!isEmpty(salesrep)){
//	            if(salesrep.match(/ (.+)/)){
//	                salesrep = salesrep.match(/ (.+)/)[1];
//	            }
//	        }
	        var salesrep = '';
	        if (salesrepId) {
	            var employeeSearch = nlapiSearchRecord("employee",null,
	              [
	                 ["internalid","is",salesrepId]
	              ], 
	              [
	                 new nlobjSearchColumn("phone"), 
	                 new nlobjSearchColumn("fax"),
	                 new nlobjSearchColumn("lastname"),
	                 new nlobjSearchColumn("firstname"),
	                 new nlobjSearchColumn("custentity_djkk_english_lastname"),
	                 new nlobjSearchColumn("custentity_djkk_english_firstname")
	              ]
	              );
	            var employeelastname = '';
	            var employeefirstname = '';
	            if (language == SYS_LANGUAGE_EN) {
	                //add by zzq CH641 20230613 end
	                employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_lastname")));//�]�ƈ�lastname
	                employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_firstname")));//�]�ƈ�firstname
	                if(employeelastname && employeelastname){
	                    salesrep = employeefirstname +'&nbsp;'+ employeelastname;
	                }else if(employeelastname && !employeelastname) {
	                    salesrep = employeefirstname;
	                }else if(!employeelastname && employeelastname) {
	                    salesrep = employeelastname;
	                }
	            } else {
	                employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("lastname")));//�]�ƈ�lastname
	                employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("firstname")));//�]�ƈ�firstname
	                if(employeelastname && employeelastname){
	                    salesrep = employeelastname +'&nbsp;'+ employeefirstname;
	                }else if(employeelastname && !employeelastname) {
	                    salesrep = employeefirstname;
	                }else if(!employeelastname && employeelastname) {
	                    salesrep = employeelastname;
	                }
	            }
	      }
		// add by zzq CH599 20230607 end
		// add CH408 20230520 start
		var memo = defaultEmpty(creditmemoRecord.getFieldValue('memo'));    //memo
		var dvyMemo = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_deliverynotememo')); //�[�i�����l
		// add CH408 20230520 end
		var subsidiary = defaultEmpty(creditmemoRecord.getFieldValue('subsidiary'));    //�N���W�b�g�����q���
		var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
				[
					["internalid","anyof",subsidiary]
				], 
				[
					new nlobjSearchColumn("legalname"),  //��������
					new nlobjSearchColumn("name"), //���O
					new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //���O�p��
					new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //�Z���p��
					new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //�s���{��
					new nlobjSearchColumn("address1","address",null), //�Z��1
					new nlobjSearchColumn("address2","address",null), //�Z��1
					new nlobjSearchColumn("address3","address",null), //�Z��2
					new nlobjSearchColumn("city","address",null), //�s�撬��
					new nlobjSearchColumn("zip","address",null), //�X�֔ԍ�
					new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
					new nlobjSearchColumn("phone","address",null), //phone
					//20230510 add by zhou DENISJAPAN-759 start
					new nlobjSearchColumn("custrecord_djkk_invoice_issuer_number"),//�K�i���������s���ƎҔԍ�
					new nlobjSearchColumn("custrecord_djkk_bank_1"),//DJ_��s1
					new nlobjSearchColumn("custrecord_djkk_bank_2"),//DJ_��s2
					//20230510 add by zhou DENISJAPAN-759 end
	                //CH655 20230725 add by zdj start
                    new nlobjSearchColumn("phone","shippingAddress",null),//�z����phone
                    new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//�z����fax
                  //CH655 20230725 add by zdj end
				]
				);	
		var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//��������
		var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//���O
		var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address1","address",null));//�Z��1
		var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//�Z��2
		var invoiceAddressThree= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//�Z��3
		var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//�X�֔ԍ�
		var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//�s�撬��
		var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//�s���{��
		var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//���O�p��
		var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//�Z���p��
		var invoiceFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax
		var invoicePhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","address",null));//phone
		//20230510 add by zhou DENISJAPAN-759 start
		var invoiceIssuerNumber= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_invoice_issuer_number"));//�K�i���������s���ƎҔԍ�
		var bank1 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_1");
		var bank2 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_2");
		var bankInfo = [];
		var bank1Value = '';
		var bank2Value = '';
		if(bank1){
			bank1 = nlapiLoadRecord('customrecord_djkk_bank', bank1);
			var bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name'));
			if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))){
				bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))+')';
			}
			var bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));
			if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code'))){
				bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
			}
			var bankType1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_type'));
			var bankNo1 = '';
			if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'))){
			    //CH756&CH757 20230801 by zdj start
//				bankNo1 = 'No.'+ defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
			    bankNo1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
			    //CH756&CH757 20230801 by zdj end
			}
		}
		if(bank2){
			bank2 = nlapiLoadRecord('customrecord_djkk_bank', bank2);
			var bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name'));
			if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))){
				bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))+')';
			}
			var bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));
			if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code'))){
				bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
			}
			var bankType2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_type'));
			var bankNo2 = '';
			if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'))){
			    //CH756&CH757 20230801 by zdj start
//				bankNo2 = 'No.'+ defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
			    bankNo2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
			    //CH756&CH757 20230801 by zdj end
			}
		}
		//20230510 add by zhou DENISJAPAN-759 end
		var incoicedelivery_destination = creditmemoRecord.getFieldValue('custbody_djkk_delivery_destination');    //�N���W�b�g�����[�i��
		if(!isEmpty(incoicedelivery_destination)){	
			
			var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
					[
						["internalid","anyof",incoicedelivery_destination]
					], 
					[
						new nlobjSearchColumn("custrecord_djkk_zip"),  //�X�֔ԍ�
						new nlobjSearchColumn("custrecord_djkk_prefectures"),  //�s���{��
						new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_�s�撬��
						new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_�[�i��Z��1
						//add by CH653 20230619 start
						new nlobjSearchColumn("custrecord_djkk_delivery_lable"),  //DJ_�[�i��Z��2
						new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_�[�i��Z��3
						//add by CH653 20230619 end
						new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_�[�i�於�O
							  
					]
					);	
			var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//�X�֔ԍ�
			var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//�s���{��
			var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_�s�撬��
			var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_�[�i��Z��1
			//add by CH653 20230619 start
//          var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_�[�i��Z��2
            var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_lable'));//DJ_�[�i��Z��3
            var invdestinationAddress3 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_�[�i��Z��3
            //add by CH653 20230619 end
			var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_�[�i�於�O
		}
		
		var tmpCurrency = creditmemoRecord.getFieldValue('currency');
		var displaysymbol = '';
		if (tmpCurrency) {
		    var tmpRecd = nlapiLoadRecord('currency', tmpCurrency, 'symbol');
		    if (tmpRecd) {
		        displaysymbol = tmpRecd.getFieldValue('displaysymbol');
		    }
		}
	        
		var invoiceCount = creditmemoRecord.getLineItemCount('item');
		//add by zzq 20230614 start
		var invTaxmountTotal = '0';
		var invoAmountTotal = 0;
		var invoToTotal =0;
		var invTaxmountTotal10 = 0;
		var invTaxmountTotal8 = 0;
		//add by zzq 20230614 end
		for(var k=1;k<invoiceCount+1;k++){
			creditmemoRecord.selectLineItem('item',k);
			var invoiceItemId = creditmemoRecord.getLineItemValue('item','item',k);	//item
			var invoiceItemSearch = nlapiSearchRecord("item",null,
					[
					 	["internalid","anyof",invoiceItemId],
					],
					[
					  new nlobjSearchColumn("itemid"), //���i�R�[�h
					  //20230608 add by zzq CH599 start
					  new nlobjSearchColumn("displayname"), //���i��
					  new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_�i���i���{��jLINE1
					  new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), //DJ_�i���i���{��jLINE2
					  new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_�i���i�p��jLINE1
					  new nlobjSearchColumn("custitem_djkk_product_name_line2"), //DJ_�i���i�p��jLINE2
					  //20230608 add by zzq CH599 end
					  new nlobjSearchColumn("custitem_djkk_product_code"), //�J�^���O���i�R�[�h
				   	  //20230608 add by zzq CH599 start
					  new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), //�z�����t���O
					  //20230608 add by zzq CH599 end
					//add by zzq 20230614 start
                      new nlobjSearchColumn("type")
                      //add by zzq 20230614 end
					]
					); 
			     //20230608 add by zzq CH599 start
		 		var invoiceRateFormat = defaultEmpty(creditmemoRecord.getLineItemValue('item','rate',k));//�P��
		 		if(!isEmpty(invoiceRateFormat)){
		 		    invoiceRateFormat = parseFloat(invoiceRateFormat).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); 
		 		}
		 		nlapiLogExecution('DEBUG', 'invoiceRateFormatOne', invoiceRateFormat);
				if(!(Number(invoiceRateFormat)==0 && invoiceItemSearch[0].getValue("custitem_djkk_deliverycharge_flg") == 'T')){
				    var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//���i�R�[�h
	                var productCode= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("custitem_djkk_product_code"));//�J�^���O���i�R�[�h
	              //20230608 add by zzq CH599 start
//	                var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//���i��
//	                invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;");
	                
	             // by add zzq CH671 20230704 start
	                var invoiceItemType = defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("type")); //�A�C�e��type
	                nlapiLogExecution('debug', 'invoiceItemType', invoiceItemType);
	                var itemDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//���i��
	                var invoiceDisplayName = '';
	                var invoiceItemNouhinBikou = creditmemoRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',k); //DJ_�[�i�����l
                      if (invoiceItemType == 'OthCharge') { // �A�C�e���͍Ĕ̗p���̑��̎萔��
                        invoiceDisplayName = othChargeDisplayname(itemDisplayName, language); // �萔��
                        nlapiLogExecution('debug', 'invoiceDisplayName', invoiceDisplayName);
                    } else {
                        if (!isEmpty(invoiceItemSearch)) {
                            // add by zzq start
                            // if(custLanguage == '���{��'){
                            if (language == SYS_LANGUAGE_JP) {
                                // add by zzq end
                                var jpName1 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_jpline1");
                                var jpName2 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_jpline2");
                                    if (!isEmpty(jpName1) && !isEmpty(jpName2)) {
                                        invoiceDisplayName = jpName1 + ' ' + jpName2;
                                    } else if (!isEmpty(jpName1) && isEmpty(jpName2)) {
                                        invoiceDisplayName = jpName1;
                                    } else if (isEmpty(jpName1) && !isEmpty(jpName2)) {
                                        invoiceDisplayName = jpName2;
                                    }
                            } else {
                                var enName1 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_line1");
                                var enName2 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_line2");
                                    if (!isEmpty(enName1) && !isEmpty(enName2)) {
                                        invoiceDisplayName = enName1 + ' ' + enName2;
                                    } else if (!isEmpty(enName1) && isEmpty(enName2)) {
                                        invoiceDisplayName = enName1;
                                    } else if (isEmpty(enName1) && !isEmpty(enName2)) {
                                        invoiceDisplayName = enName2;
                                }
                            }

                        }
                    }
                    if (invoiceDisplayName) {
                        if (invoiceItemNouhinBikou) {
                          invoiceDisplayName = invoiceDisplayName + '<br/>' + invoiceItemNouhinBikou;
                        }
                    } else {
                        if (invoiceItemNouhinBikou) {
                           invoiceDisplayName = invoiceItemNouhinBikou;
                        }
                    }
                    // 20230608 add by zzq CH599 end
                    // 20230608 add by zzq CH599 start
	             
//	                var invoiceItemType= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("type"));//���
//	                if(invoiceItemType == 'OthCharge'){
//	                	if(invoiceDisplayName){
////	                    var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//���i��
//	                    invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;");
//	                }
//	                }
	                //add by zzq 20230614 end
	             // by add zzq CH671 20230704 end
	                var invoiceQuantity = defaultEmpty(creditmemoRecord.getLineItemValue('item','quantity',k));//����
	                var invoiceAmount = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item','amount',k)));//���z
	                nlapiLogExecution('debug', 'invoiceAmount', typeof(invoiceAmount));
	                //add by zzq 20330614 start
//	                var invoAmountTotal = 0;
	                //add by zzq 20330614 end
	                if(!isEmpty(invoiceAmount)){
	                    var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');	
	                    nlapiLogExecution('debug', 'invoiceAmount1', typeof(invoiceAmount));
	                    invAmount  += invoiceAmount;
	                    // modify by lj start DENISJAPANDEV-1376
	                    //add by zhou 20230517_CH508 start					
//					    invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	                    invoAmountTotal = invoAmountTotal + invoiceAmount;
	                    //add by zhou 20230517_CH508 end
					
	                    nlapiLogExecution('debug', 'invoiceAmount2', typeof(invoiceAmount));
	                    // modify by lj end DENISJAPANDEV-1376
	                }else{
//	                    var invAmountFormat = '';
	                    var invAmountFormat = '0';
	                }
				
	                var invoiceTaxrate1Format = defaultEmpty(creditmemoRecord.getLineItemValue('item','taxrate1',k));//�ŗ�
	                var invoiceTaxcode = defaultEmpty(creditmemoRecord.getLineItemValue('item','taxcode',k));//�ŗ�
	                var invoiceTaxamount = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item','tax1amt',k)));//�Ŋz   
	                invoiceTaxamount = defaultEmpty(isEmpty(invoiceTaxamount) ? 0 :  invoiceTaxamount);
	              //add by zzq 20330614 start
//	                var invTaxmountTotal = '0';
	              //add by zzq 20330614 end
	                if(!isEmpty(invoiceTaxamount)){
	                    nlapiLogExecution('debug', 'invoiceTaxamount', typeof(invoiceTaxamount));
	                    var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	                    nlapiLogExecution('debug', 'invoiceTaxamount1', typeof(invoiceTaxamount));
					    invTaxamount += invoiceTaxamount;
					    //add by zhou 20230517_CH508 start
//				      	invTaxmountTotal = invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
					  //add by zzq 20330614 start
					    invTaxmountTotal = invTaxamount;
//					    if(invoiceTaxrate1Format == '10.0%'){
//					        invTaxmountTotal10 = invTaxmountTotal10 + invoiceTaxamount;
//					    }else if(invoiceTaxrate1Format == '8.0%'){
//					        invTaxmountTotal8 = invTaxmountTotal8 + invoiceTaxamount;
//					    }
					  //add by zzq 20330614 end
					    //add by zhou 20230517_CH508 end
	                }else{
	                    var invTaxamountFormat = '';
	                }
	                nlapiLogExecution('debug', 'szk invAmount', invAmount);
	                nlapiLogExecution('debug', 'szk invTaxamount', invTaxamount);
	                nlapiLogExecution('debug', 'szk Number(invAmount+invTaxamount)', Number(invAmount+invTaxamount));
	                 invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
	                 nlapiLogExecution('debug', 'szk invoTotal', invoTotal);
	                // modify by lj start DENISJAPANDEV-1376
	                 //add by zzq 20330614 start
//	                var invoToTotal = 0;
	              //add by zzq 20330614 end
	                if(!isEmpty(invoTotal)){
	                    nlapiLogExecution('debug', 'invoTotal', typeof(invoTotal));
	                    //add by zhou 20230517_CH508 start
//					    var invoToTotal = invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	                  //add by zzq 20330614 start
//	                    var invoToTotal = invoToTotal + invoTotal;
	                    invoToTotal = invoTotal;
	                  //add by zzq 20330614 end
					    //add by zhou 20230517_CH508 end
					    nlapiLogExecution('debug', 'invoTotal1', typeof(invoTotal));
	                }
	                // modify by lj end DENISJAPANDEV-1376
	                
	                var invoiceUnitabbreviation = defaultEmpty(creditmemoRecord.getLineItemValue('item','units_display',k));//�P��
	                if(!isEmpty(language)&&!isEmpty(invoiceUnitabbreviation)){
	                    var unitSearch = nlapiSearchRecord("unitstype",null,
	                            [
	                               ["abbreviation","is",invoiceUnitabbreviation]
	                            ], 
	                            [
	                               new nlobjSearchColumn("abbreviation")
	                            ]
	                            );  
	                    if(unitSearch != null){
	                        if(language == SYS_LANGUAGE_EN){            //�p��
	                            units_display = unitSearch[0].getValue('abbreviation')+'';
	                            unitsArray = units_display.split("/");
	                            if(unitsArray.length == 2){
	                                invoiceUnitabbreviation = unitsArray[1];
	                            }
	                        }else if(language == SYS_LANGUAGE_JP){              //���{��
	                            units_display = unitSearch[0].getValue('abbreviation')+'';
	                            unitsArray = units_display.split("/");
	                            if(!isEmpty(unitsArray)){
	                                invoiceUnitabbreviation = unitsArray[0];
	                            }else if(unitsArray.length == 0){
	                                invoiceUnitabbreviation = units_display;
	                            }
	                        }
	                    }
	                }
	                // CH408 zheng 20230517 start
	                var itemLocId = defaultEmpty(creditmemoRecord.getLineItemValue('item','location',k)); // �ꏊ
	                var locBarCode = '';
	                if (itemLocId) {
	                    var tmpDicBarCode = tmpLocationDic[itemLocId];
	                    if (tmpDicBarCode) {
	                        locBarCode = tmpDicBarCode;
	                    }
	                }
//	                if(!isEmpty(invAmountFormat)){
//	                    invAmountFormat = '-'+invAmountFormat;
//	                }
//	                if(!isEmpty(invTaxamountFormat)){
//	                    invTaxamountFormat = '-'+invTaxamountFormat;
//	                }
	                // CH599 zzq 20230608 start
//	                if(!isEmpty(productCode) && !isEmpty(locBarCode)){
//	                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode+'<br/>'+locBarCode;
//	                }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
//	                    invoiceInitemid = invoiceInitemid+'<br/>'+ ' '+'<br/>'+locBarCode;
//	                }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
//	                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode+'<br/>'+' ';
//	                }else{
//	                    invoiceInitemid = invoiceInitemid+'<br/>'+ ' '+'<br/>'+' ';
//	                }
	                //CH734 20230717 by zzq start
	                if(!isEmpty(productCode) && !isEmpty(locBarCode)){
	                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode + ' ' + locBarCode;
	                }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
	                    invoiceInitemid = invoiceInitemid+'<br/>'+ locBarCode;
	                }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
	                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode;
	                }else{
	                    invoiceInitemid = invoiceInitemid+'<br/>'+ ' ';
	                }
	                //CH734 20230717 by zzq end
	                // CH599 zzq 20230608 end
	                
	                // CH408 zheng 20230517 end
	                itemLine.push({
	                    invoiceInitemid:invoiceInitemid,  //���i�R�[�h
	                    invoiceDisplayName:invoiceDisplayName,//���i��
	                    invoiceQuantity:'-'+invoiceQuantity,//����
	                    invoiceRateFormat:invoiceRateFormat,//�P��
	                    invoiceAmount:invAmountFormat,//���z  
	                    invoiceTaxrate1Format:invoiceTaxrate1Format,//�ŗ�
//	                    invoiceTaxamount:invTaxamountFormat,//�Ŋz  
	                    invoiceTaxamount:invoiceTaxamount,//�Ŋz  
	                    invoiceUnitabbreviation:invoiceUnitabbreviation,
	                    productCode:productCode,//�J�^���O���i�R�[�h
	                    locBarCode:locBarCode,//DJ_�ꏊ�o�[�R�[�h
	                    invoiceTaxcode :invoiceTaxcode//�ŗ��R�[�h
	                }); 
				}
			 //20230608 add by zzq CH599 end
		}
		//20230625 add by zzq CH654 start
        var resultItemTaxArr = [];
        var invoiceTaxrate1FormatArr = [];
        for(var i = 0;i < itemLine.length; i++){
            nlapiLogExecution('DEBUG', 'itemLine[i].invoiceTaxrate1Format', itemLine[i].invoiceTaxrate1Format);
            var tax = invoiceTaxrate1FormatArr.indexOf(itemLine[i].invoiceTaxcode);
            if(tax > -1){
                if(itemLine[i].invoiceTaxamount){
                    resultItemTaxArr[tax].invoiceTaxamount = parseFloat(resultItemTaxArr[tax].invoiceTaxamount) + parseFloat(itemLine[i].invoiceTaxamount);
                }
            }else{
                invoiceTaxrate1FormatArr.push(itemLine[i].invoiceTaxcode);
                var resultItemTaxObj = {};
                if(itemLine[i].invoiceTaxamount){
                    resultItemTaxObj.invoiceTaxamount = itemLine[i].invoiceTaxamount;
                }else{
                    resultItemTaxObj.invoiceTaxamount = 0;
                }
                resultItemTaxObj.invoiceTaxrate1Format = itemLine[i].invoiceTaxrate1Format;
                resultItemTaxObj.invoiceTaxcode = itemLine[i].invoiceTaxcode;
                resultItemTaxArr.push(resultItemTaxObj);
            }
        }
        resultItemTaxArr.sort(function(a, b) {
            if (a.invoiceTaxcode == 8) {
              return -1;
            } else if (b.invoiceTaxcode == 8) {
              return 1;
            } else if (a.invoiceTaxcode == 11) {
              return -1;
            } else if (b.invoiceTaxcode == 11) {
              return 1;
            } else if (a.invoiceTaxcode == 10) {
              return -1;
            } else if (b.invoiceTaxcode == 10) {
              return 1;
            } else {
              return 0;
            }
          });
        //20230625 add by zzq CH654 end
	}
	
	    //20230731 CH756&CH757 by zdj start
	    var swiftValue = '';
	    if(language == SYS_LANGUAGE_EN){
	        if(subsidiary == SUB_DPKK){
	           bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
	           bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
	           bankType1 = 'No\xa0\:\xa0';
	           bankNo1 = '1827718';
	           swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
	     }else if(subsidiary == SUB_SCETI){
	           bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
               bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
               bankType1 = 'No\xa0\:\xa0';
	           bankNo1 = '1798632';
	           swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
	     }else if(subsidiary == SUB_NBKK){
	           bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
               bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
               bankType1 = 'No\xa0\:\xa0';
	           bankNo1 = '0568447';
	           swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
	     }else if(subsidiary == SUB_ULKK){
	           bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
               bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
               bankType1 = 'No\xa0\:\xa0';
	           bankNo1 = '1895356';
	           swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
	     }
	     }else{
	           bankName1 = bankName1;
	           bankBranchName1 = bankBranchName1;
	           bankType1 = bankType1;
	           bankNo1 = bankNo1;
	           bankName2 = bankName2;
	           bankBranchName2 = bankBranchName2;
	           bankType2 = bankType2;
	           bankNo2 = bankNo2
	    }
	    //20230731 CH756&CH757 by zdj end
	    
	  //20230901 add by CH762 start 
        var INVOICEREQUESTPDF_ADDRESS = '';
        if(subsidiary == SUB_NBKK){
            INVOICEREQUESTPDF_ADDRESS = INVOICE_REQUESE_PDF_DJ_INVOICEREQUESTPDF_NBKK;
        }else if(subsidiary == SUB_ULKK){
            INVOICEREQUESTPDF_ADDRESS = INVOICE_REQUESE_PDF_DJ_INVOICEREQUESTPDF_ULKK;
        }else{
            INVOICEREQUESTPDF_ADDRESS = INVOICE_REQUESE_PDF_DJ_INVOICEREQUESTPDF;
        }
       //20230901 add by CH762 end 
	    
	// add by zzq start
//	if(custLanguage == '���{��'){
	if(language == SYS_LANGUAGE_JP){
	    //20230731 CH756&CH757 by zdj start
	    var Vibration = '�U������';
	    //20230731 CH756&CH757 by zdj end
		// add by zzq end
		var dateName = '��\xa0\xa0�t';
		var deliveryName = '�[�i��';
		var paymentName = '�x������';
		var numberName = '��\xa0\xa0��';
		var numberName2 = '��Д����ԍ�:';
		var codeName = '�R�[�h';
		var invoiceName = '*\xa0\xa0\*\xa0\xa0\*��\xa0\xa0\xa0\xa0\��\xa0\xa0\xa0\xa0\��*\xa0\xa0\*\xa0\xa0\*';
		var quantityName = '��\xa0\xa0\xa0\xa0\xa0\xa0\xa0��';
		var unitpriceName = '�P\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0��';
		var amountName = '��\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0�z';
		var poductName = '�i\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\��';
		var taxRateName = '***\xa0\xa0\��\xa0��:';
		var taxAmountName = '�Ŋz:';
		var custCode = '�ڋq�R�[�h\xa0\xa0:';
		var destinationName = '�[�i��\xa0\xa0:';
		var totalName = '��\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0�v';
		//add by zzq 20230614 start
		var consumptionTaxName = '��\xa0\xa0��\xa0\xa0��';
//		var consumptionTaxName10 = '��\xa0\xa0��\xa0\xa0��\xa010%';
//		var consumptionTaxName8 = '��\xa0\xa0��\xa0\xa0��\xa08%';
		//add by zzq 20230614 end
		var invoiceName1 = '�䐿���z';
		var personName = '�S����\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
		var memoName = '��\xa0\xa0�l';
		var custName = '�ڋq��\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
		var addressNmae = '�Z��\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
		// CH756&CH757 20230731 by zdj start
		//var invoiceIssuerNumberName = '�K�i���������s���ƎҔԍ�:';
		var invoiceIssuerNumberName = '�o�^�ԍ�:';
		// CH756&CH757 20230731 by zdj end
		var stomach =  '�䒆';
		//CH734 20230719 by zzq start
		if(invoiceCity){
		    invoiceCity = invoiceCity + '&nbsp;' + address1;
		}else{
		    invoiceCity = address1;
		}
		//CH734 20230719 by zzq end
	}else{
	    //20230731 CH756&CH757 by zdj start
        var Vibration = 'Bank Account';
        //20230731 CH756&CH757 by zdj end
		var dateName = 'Date';
		var deliveryName = 'Delivery Date';
		var paymentName = 'Payment Terms';
		//�o���G�[�V�����x�� 20230803 add by zdj start
//		var numberName = 'Number';
		var numberName = 'No';
		//�o���G�[�V�����x�� 20230803 add by zdj end
		var numberName2 = 'Order Number:';
		var codeName = 'Code';
		if(type == 'creditmemo'){
			var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Credit Memo*\xa0\xa0\*\xa0\xa0\*';
		}else{
			var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Invoice*\xa0\xa0\*\xa0\xa0\*';
		}
		var quantityName = 'Quantity';
		var unitpriceName = 'Unit Price';
		var amountName = 'Amount';
		var poductName = 'Product Name';
		var taxRateName = 'Tax Rate:';
		var taxAmountName = 'Tax:';
		var custCode = 'Customer Code:';
		var destinationName = 'Delivery:';
		var totalName = 'Total';
		//add by zzq 20230614 start
		var consumptionTaxName = 'Tax';
//		var consumptionTaxName10 = 'Excise Tax 10%';
//		var consumptionTaxName8 = 'Excise Tax 8%';
		//add by zzq 20230614 end
		var invoiceName1 = 'Invoice';
		//20230731 CH756&CH757 by zdj start
		var personName = 'PIC:';
		//var personName = 'Person:';
		//20230731 CH756&CH757 by zdj end
		var memoName = 'Memo';
		var custName = 'Customer Name:';
		var addressNmae = 'Address:';
		var invoiceIssuerNumberName = 'Registered Number:';
		var stomach =  ' ';
		//�o���G�[�V�����x��  20230802 by zdj start
		//CH734 20230719 by zzq start
		var city = '';
		if(invoiceCity && invoiceZipcode){
		    city = invoiceCity + '\xa0\xa0' + invoiceZipcode + '\xa0\xa0' + invoiceCountryEnAddress;
        }else if(invoiceCity && !invoiceZipcode){
            city = invoiceCity + '\xa0\xa0' + invoiceCountryEnAddress;
        }else if(invoiceZipcode && !invoiceCity){
            city = invoiceZipcode + '\xa0\xa0' + invoiceCountryEnAddress;
        }else{
            city = invoiceCountryEnAddress;
        }
		//CH734 20230719 by zzq end
		//�o���G�[�V�����x��  20230802 by zdj start
	}
	// add by lj start DENISJAPANDEV-1376
//	var invTaxmountTotal = parseInt(invoAmountTotal.replace(',','')) * 0.08;
//	if(!isEmpty(invoTotal)){
//		var invoToTotal = (invTaxmountTotal + invoTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//	}else{
//		var invoToTotal ='';
//	}
//	invTaxmountTotal = invTaxmountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	// add by lj start DENISJAPANDEV-1376
	//var subsidiary = getRoleSubsidiary();
	var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
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
	// add by zzq start
	'<#elseif .locale == "en">'+
    '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
    // add by zzq end
	'</#if>'+
	'<macrolist>'+
	'<macro id="nlheader">'+
	'<table border="" style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
    '<tr>'+
    '<td>'+
    '<table border="0" style="font-weight: bold;width:335px;">'+
    '<tr style="height: 18px;" colspan="2"></tr>'+  
    '<tr>'+
    '<td style="border:1px solid black;" corner-radius="4%">'+
    '<table border="0">'+
//    '<tr style="height:10px;"><td style="width:250px;"></td><td></td></tr>'+
    '<tr style="height:10px;"><td style="width:250px;"></td><td style="width:35px;"></td></tr>'+
    '<tr>'
    //CH734 20230717 by zzq start
//  '<td>��'+invoiceZipcode+'</td>'+
    if (language == SYS_LANGUAGE_JP) {   
        str+='<td>��'+invoiceZipcode+'</td>'
    }else{
        //�o���G�[�V�����x��  20230802 by zdj start
//        str+='<td>&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceZipcode+'</td>'
        str+='<td>&nbsp;&nbsp;&nbsp;&nbsp;'+custNameText+'</td>'
        //�o���G�[�V�����x��  20230802 by zdj start
    }
    //CH734 20230717 by zzq end
        str+='<td align="right" style="margin-right:-22px;">&nbsp;</td>'+
    '</tr>'+
    '<tr>'+
    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invAddress+'</td>'+
        //add by zhou 20230601_CH598 start
    //'<td align="right" style="padding-right: 30px;margin-top:-8px;">'+dealFugou(custNameText)+'</td>'+
        //add by zhou 20230601_CH598 end
    '</tr>'
    //CH734 20230719 by zzq start
    var invoiceAddressDates = [];
    if (address3) {
        invoiceAddressDates.push(address3)
    }
    if (address2) {
        invoiceAddressDates.push(address2)
    }
    if (address1) {
        invoiceAddressDates.push(address1)
    }
    if (city) {
        invoiceAddressDates.push(city)
    }
//    if (custNameText) {
//        invoiceAddressDates.push(custNameText)
//    }
    if(language == SYS_LANGUAGE_EN){
        if(invoiceAddressDates.length != 0){
            for(var i = 0; i < invoiceAddressDates.length; i++){
                str+= '<tr>'+
                '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceAddressDates[i]+'</td>'+
                '</tr>'
          }
            if(invoiceAddressDates.length <5){
                for(var k = invoiceAddressDates.length; k<5 ; k++){
                str+= '<tr>'+
                '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
                '</tr>'
                }
            }
        }
    }else{
        //CH734 20230717 by zzq start
        str+= '<tr>'+
    //  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
    //  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'&nbsp;&nbsp;'+address1+'</td>'+
        '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
        '</tr>'+
        '<tr>'+
    //  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address1+'</td>'+
        '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
        '</tr>'+
        '<tr>'+
    //  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
           '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
        '</tr>'+
        '<tr>'+
    //  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
        '<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(custNameText)+'</td>'+
        //'<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
        '<td align="left" style="padding-bottom:0px;margin-top:-8px;">'+stomach+'</td>'+
        '</tr>'+
        '<tr>'+
        '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
        //20230731 CH756&CH757 by zdj start
        '</tr>'
        //20230731 CH756&CH757 by zdj end
    }
    //CH734 20230719 by zzq end
    str+='<tr>'+
    //CH734 20230717 by zzq start
//  '<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(custNameText)+'</td>'+
    '<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'
//  '<td align="left" style="padding-bottom:0px;margin-top:-8px;">�䒆</td>'+
     str += '<td align="left" style="padding-bottom:0px;margin-top:-8px;">&nbsp;</td>' + 
     '</tr>';
//     '<tr>';
//    if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
//        str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
//        '</tr>'
////        '<tr>'+
////        '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
////        '</tr>';
//    }
//    // modify by lj start DENISJAPANDEV-1376
//    else{
////      str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Tel:'+invPhone+'</td>'+
////      '</tr>'+
////      '<tr>'+
////      '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Fax:'+invFax+'</td>'+
////      '</tr>';
//        str += '</tr>';
//    }
    // modify by lj end DENISJAPANDEV-1376

    // CH756&CH757 20230731 by zdj start
    // str += '<tr style="height: 40px;"></tr>'+
    // '</table>'+
    str += '<tr style="height: 30px;"></tr>'+
    '</table>'+
    // CH756&CH757 20230731 by zdj end
    '</td>'+
    '</tr>'+
    '</table>'+
    '</td>'+
    
    '<td style="padding-left: 30px;">'+
    '<table style="width: 320px;font-weight: bold;">'+
    // CH756&CH757 20230731 by zdj start
    '<tr style="height: 25px;">'+
    //'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
    '<td width="6%px" colspan="2">&nbsp;</td>'
    nlapiLogExecution('DEBUG', 'subsidiary', subsidiary);
    if(subsidiary == SUB_NBKK){
        str+='<td style=";margin-top:-16px;" rowspan="5"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id='+NBKK_INSYOU_ID+'&amp;'+URL_PARAMETERS_C+'&amp;'+NBKK_INSYOU_URL+'" style="width:100px;height: 100px; position:absolute;top:25px;left:-82px;" /></td>'
    }else if(subsidiary == SUB_ULKK){
        str+='<td style=";margin-top:-16px;" rowspan="5"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id='+ULKK_INSYOU_ID+'&amp;'+URL_PARAMETERS_C+'&amp;'+ULKK_INSYOU_URL+'" style="width:100px;height: 100px; position:absolute;top:29px;left:-26px;" /></td>'
    }else{
        str+='<td style=";margin-top:-16px;" rowspan="5">&nbsp;</td>'
    }
    //  '<td colspan="2" style="width:50%;margin-top:-16px;"><img src="/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
    str+='<td width = "10px">&nbsp;</td>'
    str+='</tr>';
    // CH756&CH757 20230731 by zdj start
    //20230208 changed by zhou start CH298
    //20230628 changed by zzq start CH701
//  if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
//      str+='<tr>'+
//      //add by zhou 20230601_CH598 start
//      '<td colspan="2" style="margin-left:-72px;margin-top:-8px;">&nbsp;'+dealFugou(custNameText)+'</td>'+
//      //add by zhou 20230601_CH598 end
//      '</tr>';
//  }
    //20230628 changed by zzq start CH701
    //end
    str+='<tr>'+
    '<td style="font-size:17px;margin-top:-5px;" colspan="3">'+invoiceNameEng+'&nbsp;</td>'+
    '</tr>'+
    '<tr>'+
//    '<td style="font-size: 20px;margin-top:-2px;font-family: NotoSansCJKkr_Bold ; " colspan="3" >'+invoiceLegalname+'&nbsp;</td>'+
    '<td colspan="3" ><span style="font-size: 19px;font-family: heiseimin;" >'+invoiceLegalname+'</span>&nbsp;</td>'+
    '</tr>'+
    '<tr>'+
//    '<td colspan="2" style="font-size: 10px;margin-top:-2px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'&nbsp;</td>'+
    '<td colspan="3" style="font-size: 10px;margin-top:-2px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'&nbsp;</td>'+
    '</tr>'+
    '<tr>'
    //CH734 20230717 by zzq start
//  if (language == SYS_LANGUAGE_JP) {   
    //'<td colspan="2" style="font-size: 10px;margin-top:-2px;">��'+invoiceAddressZip+'&nbsp;</td>'
        str+='<td colspan="2" style="font-size: 10px;margin-top:-2px;">��'+invoiceAddressZip+'&nbsp;</td>'
//  }else{
//      str+='<td colspan="2" style="font-size: 10px;margin-top:-2px;">'+invoiceAddressZip+'&nbsp;</td>'
//  }
    //CH734 20230717 by zzq end
    str+='</tr>'+
    '<tr>'+
    '<td colspan="3" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+invoiceAddressThree+'&nbsp;</td>'+
    '</tr>'+
    '<tr>'+
    '<td style="font-size: 10px;margin-top:-4px;">TEL:&nbsp;'+invoicePhone+'</td>'+
    '<td style="font-size: 10px;margin-top:-4px;">FAX:&nbsp;'+invoiceFax+'</td>'+
    '</tr>'+
    '<tr>'+
    '<td colspan="3" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressEng+'</td>'+
    '</tr>'+
    '</table>'+
    '</td>'+
    '</tr>'+
    '</table>';
    
    str+='<table style="width: 660px;margin-top: 10px;font-weight: bold;">'+
    '<tr>'+
    '<td style="line-height: 30px;font-weight:bold;font-size: 11pt;border: 1px solid black;height: 30px;width:660px;" align="center" colspan="5">'+invoiceName+'</td>'+
    '</tr>'+
    '</table>'+ 
    '<table style="width: 660px;font-weight: bold;">'+
    '<tr>'+
    '<td style="width:510px;margin-top:-5px;margin-left:-20px;" colspan="2">&nbsp;</td>'+
    '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;" align="right"></td>'+
    '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
    '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
    '</tr>'+    
    '<tr padding-bottom="-11px">'+
    '<td style="width: 225px;">&nbsp;&nbsp;'+dateName+'&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
    '<td style="width: 285px;margin-left:-25px;">'+deliveryName+'&nbsp;:&nbsp;'+delivery_date+'</td>'+
    '<td style="width: 50px;"></td>'+
    '<td style="width: 50px;"></td>'+
    '<td style="width: 50px;"></td>'+
    '</tr>'+
    '<tr>'+
    '<td style="width: 225px;margin-top:-8px;">&nbsp;</td>'+
    // modify by lj start DENISJAPANDEV-1385
//  '<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+payment+'</td>'+
    // add zhou CF413 20230523 start
    '<td style="width: 285px;margin-top:-8px;margin-left:-25px;">&nbsp;</td>'+
//  '<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+ customerPayment + '</td>'+
    // add zhou CF413 20230523 end
    // modify by lj END DENISJAPANDEV-1385
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '</tr>'+
    '<tr>'+
    // add zhou CF413 20230523 start
//  '<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'+
//  '<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+'&nbsp;'+otherrefnum+'</td>'+
    '<td style="width: 300px;margin-top:-8px;">&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'+
    '<td style="width: 100px;margin-left:-25px;margin-top:-8px;">'+paymentName+'&nbsp;:&nbsp;'+ customerPaymentTerms + '</td>'+
    '<td style="width: 260px;margin-left:-50px;margin-top:-8px;" colspan="3">&nbsp;'+numberName2+''+dealFugou(otherrefnum)+'</td>'+
    // add zhou CF413 20230523 end
    '</tr>';
    
    // modify by lj start DENISJAPANDEV-1376
    //20221206 add by zhou CH116 start
    //changed by zhou 20230208 CH298 
//  if((subsidiary != SUB_SCETI && subsidiary != SUB_DPKK ) &&  type != 'creditmemo'){
//      str+='<tr>'+
//      '<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;�ʉ݃R�[�h&nbsp;:'+currency+'</td>'+
//      '<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">���i�R�[�h&nbsp;:'+priceCode+'</td>'+
//      '</tr>';
//  }
    //end
    // modify by lj end DENISJAPANDEV-1376
    str+= '</table>'+
    
    '<table style="width: 660px;font-weight: bold;" border="0">';   
    str+='<tr>';
        var tmpMemo = '';
        if (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) {
            tmpMemo = dvyMemo;
        } else {
            tmpMemo = memo;
        }
        nlapiLogExecution('DEBUG', 'tmpMemo', tmpMemo);
        if(!isEmpty(tmpMemo)){
            // add by zhou ch598 20230601 start
//          str+='<td style="width: 330px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+tmpMemo+'</td>'+
            str+='<td style="width: 330px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+dealFugou(tmpMemo)+'</td>'+
            // add by zhou ch598 20230601 end
            '<td style="width: 110px;">&nbsp;</td>'+
            '<td style="width: 100px;">&nbsp;</td>'+
            '<td style="width: 100px;">&nbsp;&nbsp;Page�F&nbsp;<pagenumber/></td>'+
            '</tr>';
        }else{
            str+='<td style="width: 130px;margin-top:-8px;">&nbsp;</td>'+
            '<td style="width: 200px;">&nbsp;</td>'+
            '<td style="width: 110px;">&nbsp;</td>'+
            '<td style="width: 100px;">&nbsp;</td>'+
            '<td style="width: 100px;">&nbsp;&nbsp;Page�F&nbsp;<pagenumber/></td>'+
            '</tr>';
        }
    str+= '</table>';
        
    str+= '<table border="0" style="width: 660px;font-weight: bold;">'; 
    str+='<tr style="border-bottom: 1px solid black;">'+
    '<td style="width: 130px;">&nbsp;&nbsp;'+codeName+'</td>'+
    '<td style="width: 210px;" align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+poductName+'</td>'+
    '<td style="width: 110px;">&nbsp;&nbsp;'+quantityName+'</td>'+
    '<td style="width: 100px;">&nbsp;&nbsp;'+unitpriceName+'</td>'+
    '<td style="width: 100px;">&nbsp;&nbsp;'+amountName+'</td>'+
    '</tr>'+
    '</table>'+
	'</macro>'+
	'<macro id="nlfooter">'+
	'<table border="0" style="border-top: 1px solid black;width: 660px;font-weight: bold;">'+
	'<tr style="padding-top:5px;">'+
	'<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
	nlapiLogExecution('debug', 'entityid', entityid);
	if(!isEmpty(incoicedelivery_Name)){
		str+='<td style="width:270px;">'+destinationName+'&nbsp;'+dealFugou(incoicedelivery_Name)+'</td>';
	}else{
		str+='<td style="width:270px;">'+destinationName+'</td>';
	}
	//add by zhou 20230517_CH508 start
	// add by zzq start
//	if(custLanguage == '���{��' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	// add by zzq end
		var invoAmountTotal0 =  parseFloat(invoAmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	}else{
		nlapiLogExecution('debug', 'invoAmountTotal', parseFloat(invoAmountTotal));
		var invoAmountTotal0 =  parseFloat(invoAmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	//add by zhou 20230517_CH508 enda
//	var dealSalesrep = ''; 
//	if (salesrep) {
//	    var tmpSalesreps = salesrep.split(' ');
//	    if (tmpSalesreps && tmpSalesreps.length > 1) {
//	        tmpSalesreps.reverse();
//	        tmpSalesreps.pop();
//	        tmpSalesreps.reverse();
//	        dealSalesrep = tmpSalesreps.join(' ');
//	    }
//	}
	 if(type =='creditmemo' && Number(invoAmountTotal0)){
	     invoAmountTotal0 = '-'+invoAmountTotal0
     }
	str+='<td style="width:80px;">&nbsp;&nbsp;'+totalName+'</td>'+
	'<td style="width:90px;" align="right">'+invoAmountTotal0+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>'
	if(!isEmpty(invdestinationZip)){
	  //CH734 20230717 by zzq start
	    if(language == SYS_LANGUAGE_JP){
	        str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��' + invdestinationZip + '</td>';
	    }else{
	        str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��' + invdestinationZip + '</td>';
	    }
//            if (language == SYS_LANGUAGE_JP) {
//                str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��' + invdestinationZip + '</td>';
//            } else {
//                str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + invdestinationZip + '</td>';
//            }
	  //CH734 20230717 by zzq end
	}
	str+='</tr>'+
	'<tr>'+
	// �ڋq��
	//add by zhou 20230720_CH598 start
	//add by zhou 20230601_CH598 start
//	'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + custName +dealFugou(custNameText)+ '</td>';
	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//add by zhou 20230601_CH598 end
	//add by zhou 20230720_CH598 end
	if(!isEmpty(invdestinationState)){
	    if(language == SYS_LANGUAGE_JP){
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
	    }else{
	        str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
	    }
	}else{
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	}
	//add by zhou 20230517_CH508 start
	// add by zzq start
//	if(custLanguage == '���{��' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	//add by zzq 20230625 CH654 start
	// add by zzq 20230614 start

//	   if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//           var consumptionTax8 = parseFloat(invTaxmountTotal8).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//       }else{
//           var consumptionTax8 = displaysymbol + parseFloat(invTaxmountTotal8).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//       }
	// add by zzq 20230614 end
	   if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
           var consumptionTax0 = parseFloat(invTaxmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
       }else{
           var consumptionTax0 = parseFloat(invTaxmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
       }
	 //add by zzq 20230625 CH654 end
//	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
//	'<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax0+'</td>'+
	 //add by zzq 20230625 CH654 start
//	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName8+'</td>'+
//	'<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax8+'</td>'+
   if(type =='creditmemo' && Number(consumptionTax0)){
       consumptionTax0 = '-'+consumptionTax0
     }
	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
	'<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax0+'</td>'+
	//add by zzq 20230625 CH654 end
	'</tr>'+
	//add by zhou 20230517_CH508 end
	'<tr>'+
//	�Z��
	//add by zzq 20230720_CH672 start
//	'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + addressNmae  + dealFugou(invoiceAddressState) + '</td>';
	'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;</td>';
	//add by zzq 20230720_CH672 end
//	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
	    if(language == SYS_LANGUAGE_JP){
		str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationCity)+dealFugou(invdestinationAddress)+'</td>';
	    }else{
	        str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationCity)+dealFugou(invdestinationAddress)+'</td>';
	    }
	}

	str+='</tr>'+
	
	'<tr>'+
	//add by zzq 20230720_CH672 start
	//'<td style="width:220px;margin-top:-8px;;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + dealFugou(invoiceCityUnder) + '</td>';
	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	//add by zzq 20230720_CH672 end
	if(!isEmpty(invdestinationAddress2)){
	    if(language == SYS_LANGUAGE_JP){
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress2)+'</td>';
	    }else{
	        str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress2)+'</td>';
	    }
	}else{
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	}
	//add by zhou 20230517_CH508 start
	// add by zzq start
//	if(custLanguage == '���{��' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	// add by zzq end
		var invoToTotal0 = parseFloat(invoToTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	}else{
		var invoToTotal0 = parseFloat(invoToTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	//add by zhou 20230601_CH598 start
//	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'</td>'+
	//add by zzq 20230614 start
	var invoiceSymbol = invoiceName1+'&nbsp;&nbsp;';
	//add by zzq 2023025 CH654 start
//    if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//        // add by zzq end
//            var consumptionTax10 = parseFloat(invTaxmountTotal10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//        }else{
//            var consumptionTax10 = displaysymbol + parseFloat(invTaxmountTotal10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//        }
  //add by zzq 2023025 CH654 end
	//add by zzq 20230614 end
	//add by zzq 20230614 start
	if(type =='creditmemo' && Number(invoToTotal0)){
	    invoToTotal0 = displaysymbol+'-'+invoToTotal0
     }else{
         invoToTotal0 = displaysymbol+invoToTotal0
     }
	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'&nbsp;&nbsp;</td>'+
//	//add by zhou 20230601_CH598 end
	'<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal0+'</td>';
	   //add by zzq 2023025 CH654 start
//	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName10+'</td>'+
	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;</td>'+
	//add by zhou 20230601_CH598 end
//	'<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax10+'</td>'+
	'<td style="width:100px;margin-top:-8px;" align="right">&nbsp;</td>'+
	  //add by zzq 2023025 CH654 end
	//add by zzq 20230614 end
	//add by zhou 20230517_CH508 end
	'</tr>';
//	�Z��
	// add by CH599 20230609 zzq start
	//add by CH653 20230619 start
	//add by CH653 20230720 zzq start
//	'<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>' +
	if(!isEmpty(invdestinationAddress3)){
//        str+='<tr><td style="margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td>' +
	    str+='<tr><td style="margin-top:-8px;margin-left:26px"></td>'
	    if(language == SYS_LANGUAGE_JP){
	        str+='<td style="width:220px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress3)+'</td></tr>';
	    }else{
	        str+='<td style="width:220px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress3)+'</td></tr>';
	    }
    }else{
//        str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>';
        str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>';
    }
	//add by CH653 20230619 end
//	'<tr><td style="margin-top:-8px;margin-left:26px" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td>' +
	//add by zzq 20230614 start
//	str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td></tr>' +
	str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>' +
//	str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td>' +
//	'<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceSymbol + '</td>' +
//	'<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal0+'</td></tr>' +
	//add by zzq 20230614 end
//	'<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address3 + '</td></tr>' +
	'<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>' +
//	'<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>' +
//	'<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td></tr>' +
//	'<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address3 + '</td></tr>' +
	// add by CH599 20230609 zzq end
	//add by CH653 20230720 zzq end
	'</table>'+
	'<table style="width: 660px;font-weight: bold;">'
	//20230731 CH756&CH757 by zdj start
	//'<tr><td colspan="3" style="width:220px;margin-top:-8px;margin-left:7px">'+Vibration+'</td></tr>';
//	'<tr><td colspan="3" style="width:220px;margin-top:-8px;margin-left:7px">�U������</td></tr>';
	
	if(language == SYS_LANGUAGE_JP){
	   if(bankName1){
	        //20230731 CH756&CH757 by zdj start
//	      str+='<tr>'+
	        str+='<tr padding-top="1px">'+
	        //20230731 CH756&CH757 by zdj end
	            '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankName1+'</td>'+
	            '<td style="margin-top:-8px;margin-left:7px;width:18%">'+bankBranchName1+'</td>'+
	            '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
	          //'<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankNo1+'</td>'+
	          '<td style="margin-top:-8px;margin-left:7px;width:22%">&nbsp;</td>'+
	          '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
	            '</tr>';
	    };
	    //20230731 CH756&CH757 by zdj start
	//  if(bankName1 && bankName2){
////	        str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
//	      str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
	//  }
	    //20230731 CH756&CH757 by zdj start
	    if(bankName2){
	        //20230731 CH756&CH757 by zdj start
	        str+='<tr padding-top="1px">'+
	        //20230731 CH756&CH757 by zdj start
	        '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName2+'</td>'+
	        '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankBranchName2+'</td>'+
	        '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
//	      '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankNo2+'</td>'+
          '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
          '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
	        '</tr>';
	        };
        }else{
            if(bankName1){
                //20230731 CH756&CH757 by zdj start
//            str+='<tr>'+
              //�o���G�[�V�����x�� 20230804 add by zdj start
                str+='<tr>'+
                '<td>&emsp;</td>'+
                '</tr>'
              //�o���G�[�V�����x�� 20230804 add by zdj end
                str+='<tr padding-top="1px">'+
                //20230731 CH756&CH757 by zdj end
//                    '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankName1+'</td>'+
//                    '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankBranchName1+'</td>'+
//                    '<td style="margin-top:-8px;margin-left:7px;width:25%">'+swiftValue+'</td>'+
//                    '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankType1+bankNo1+'</td>'+
                 //�o���G�[�V�����x�� 20230803 add by zdj start
                '<td  colspan = "3" style="margin-top:-8px;margin-left:7px;width:25%">'+bankName1+'&emsp;'+bankBranchName1+'&emsp;'+swiftValue+'&emsp;'+bankType1+bankNo1+'</td>'+
                 //�o���G�[�V�����x�� 20230803 add by zdj end
//                '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo1+'</td>'+
                    '</tr>';
            };
            //20230731 CH756&CH757 by zdj start
        //  if(bankName1 && bankName2){
////                str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
//            str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
        //  }
            
//            if(bankName2){
//                str+='<tr padding-top="1px">'+
//                '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankName2+'</td>'+
//                '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankBranchName2+'</td>'+
//                '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
//                '<td style="margin-top:-8px;margin-left:7px;width:25%">'+SWIFTValue+'</td>'+
//                '</tr>';
//                };
        }
//	if(bankName1){
//	    //20230731 CH756&CH757 by zdj start
////		str+='<tr>'+
//	    str+='<tr padding-top="1px">'+
//	    //20230731 CH756&CH757 by zdj end
//			'<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName1+'</td>'+
//			'<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName1+'</td>'+
//			'<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
////			'<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo1+'</td>'+
//			'</tr>';
//	};
//	//20230731 CH756&CH757 by zdj start
////	if(bankName1 && bankName2){
//////		str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
////	    str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
////	}
//	//20230731 CH756&CH757 by zdj start
//	if(bankName2){
//	    //20230731 CH756&CH757 by zdj start
//		str+='<tr padding-top="1px">'+
//		//20230731 CH756&CH757 by zdj start
//		'<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName2+'</td>'+
//		'<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName2+'</td>'+
//		'<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
////		'<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo2+'</td>'+
//		'</tr>';
//};
	//20230731 CH756&CH757 by zdj end
	str+='</table>'+
	'</macro>'+
	'</macrolist>'+
	
	
	'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
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
	// add by zzq start
	'<#elseif .locale == "en">'+
    'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
	// add by zzq end    
	'<#else>'+
	'font-family: NotoSans, sans-serif;'+
	'</#if>'+
	'}'+
	'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
	'td { padding: 4px 6px;}'+
	'b { font-weight: bold; color: #333333; }'+
	'.nav_t1 td{'+
	'width: 110px;'+
	'height: 20px;'+
	'font-size: 13px;'+
	'display: hidden;'+
	'}'+
	'</style>'+
	'</head>';
	
	// CH756&757 20230731 by zdj start
	// str+='<body header="nlheader" header-height="30%" padding="0.5in 0.5in 0.5in 0.5in" size="A4" footer="nlfooter" footer-height="12%">'+
	str+='<body header="nlheader" header-height="26%" padding="0.2in 0.5in 0.3in 0.5in" size="A4" footer="nlfooter" footer-height="10%">'+
	//'<table style="width: 660px;font-weight: bold;" padding-top="10px">'; 
	'<table style="width: 660px;font-weight: bold;" padding-top="54px">'; 
	// CH756&757 20230731 by zdj end
//    str+='<tr>'+
//    '<td style="width: 130px;"></td>'+
//    '<td style="width: 210px;"></td>'+
//    '<td style="width: 110px;"></td>'+
//    '<td style="width: 100px;"></td>'+
//    '<td style="width: 100px;"></td>'+
//    '</tr>';
	for(var i = 0;i<itemLine.length;i++){
	    //add by zzq CH703 20230714 start
	    var itemQuantity = formatAmount1(itemLine[i].invoiceQuantity);
	    //add by zzq CH703 20230714 end
		str+='<tr>'+
		// add by CH599 20230609 zzq start
//		'<td style="width: 130px;" rowspan="3">&nbsp;'+itemLine[i].invoiceInitemid+'</td>'+
		'<td style="width: 130px;">'+itemLine[i].invoiceInitemid+'</td>'+
		// add by CH599 20230609 zzq end
		'<td style="width: 210px;">'+dealFugou(itemLine[i].invoiceDisplayName)+'</td>'+
		 //add by zzq CH703 20230714 start
//		'<td style="width: 110px;" align="center">'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>';
		'<td style="width: 110px;" align="right">'+itemQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>';
		//add by zzq CH703 20230714 end
		// add by zzq start
//		if(custLanguage == '���{��' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
		if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
		// add by zzq end
			var itemRateForma = itemLine[i].invoiceRateFormat;
			//nlapiLogExecution('DEBUG', 'itemRateForma', itemRateForma);
			var itemAmount = itemLine[i].invoiceAmount;
			if(itemAmount){
			    itemAmount = itemAmount.split('.')[0]
			}
			if(type =='creditmemo' && Number(itemAmount)){
			    itemAmount = '-'+itemAmount
			}
			str+= '<td style="width: 100px;" align="right">'+itemRateForma.split('.')[0]+'</td>'+
			'<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemAmount+'</td>'+
			'</tr>';
		}else{
		    var itemAmount = itemLine[i].invoiceAmount
		    if(type =='creditmemo' && itemAmount){
                itemAmount = '-'+itemLine[i].invoiceAmount
            }
			str+= '<td style="width: 100px;" align="right">'+itemLine[i].invoiceRateFormat+'</td>'+
			'<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemAmount+'</td>'+
			'</tr>';
		}
		
//		str+= '<tr>'+
////		'<td style="width: 130px;">&nbsp;'+itemLine[i].productCode+'</td>'+
//		'<td style="width: 210px;">&nbsp;</td>'+
//		'<td style="width: 110px;" align="right">&nbsp;</td>';
//        str+='<td style="width: 100px;">&nbsp;</td>';
//        str+='<td style="width: 100px;" align="right">&nbsp;</td>';
//		str+='</tr>';
//		
//		// CH408 zheng 20230518 start
//        str+= '<tr>'+
////        '<td style="width: 130px;">&nbsp;'+itemLine[i].locBarCode+'</td>'+
//        '<td style="width: 210px;">&nbsp;</td>'+
//        '<td style="width: 110px;" align="right">&nbsp;</td>';
//        str+='<td style="width: 100px;">&nbsp;</td>';
//        str+='<td style="width: 100px;" align="right">&nbsp;</td>';
//        str+='</tr>';
        
//        str+= '<tr>'+
//        '<td style="width: 130px;margin-left: 36px;">&nbsp;</td>'+
//        '<td style="width: 210px;">&nbsp;</td>'+
//        '<td style="width: 110px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'</td>';
//     // add by zzq start
////      if(custLanguage == '���{��' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//        if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//        // add by zzq end
//            var itemTaxamount = itemLine[i].invoiceTaxamount;
//            str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//            str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount.split('.')[0]+'</td>';
//        }else{
//            str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//            str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+displaysymbol+itemLine[i].invoiceTaxamount+'</td>';
//        }
//        // CH408 zheng 20230518 end
//        
//        str+='</tr>';
	}
	for(var k = 0;k<resultItemTaxArr.length;k++){
	    str+= '<tr>'+
        '<td style="width: 130px;margin-left: 36px;">&nbsp;</td>'+
        '<td style="width: 210px;">&nbsp;</td>'+
	    '<td style="width: 110px;" align="right" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'&nbsp;'+resultItemTaxArr[k].invoiceTaxrate1Format+'&nbsp;&nbsp;'+taxAmountName+'</td>';
     // add by zzq start
	    var itemTaxamount = resultItemTaxArr[k].invoiceTaxamount;
        if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
            // add by zzq end
//            itemTaxamount = itemTaxamount.toString();
            if(!itemTaxamount){
                itemTaxamount = 0;
            }else{
                itemTaxamount = itemTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                itemTaxamount = itemTaxamount.split('.')[0];
            }
//            str+='<td style="width: 100px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//            str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount+'</td>';
        }else{
//            itemTaxamount = itemTaxamount.toString();
            if(!itemTaxamount){
                itemTaxamount = 0;
            }else{
                itemTaxamount = itemTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            }
//            str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//            str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount+'</td>';
        }
        if(type =='creditmemo' && itemTaxamount){
            itemTaxamount = '-'+itemTaxamount;
        }
        str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount+'</td>';
        // CH408 zheng 20230518 end
        
        str+='</tr>';
	}
	str+='</table>';
	str+='</body>';

	str += '</pdf>';
	var renderer = nlapiCreateTemplateRenderer();
	renderer.setTemplate(str);
	var xml = renderer.renderToString();
	
	// test
//	var xlsFileo = nlapiCreateFile('�e�X�g�p�ʐ������o��' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
//	
//	xlsFileo.setFolder(109338);
//	nlapiSubmitFile(xlsFileo);
	
	var xlsFile = nlapiXMLToPDF(xml);
	// PDF
	//CH762 20230811 add by zdj start
//	xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
	xlsFile.setName('�ʐ�����' + '_' + transactionPDF + '_' + getDateYymmddFileName() + '.pdf');
	//CH762 20230811 add by zdj end
	
	//20230901 add by CH762 start 
//	xlsFile.setFolder(INVOICE_REQUESE_PDF_DJ_INVOICEREQUESTPDF);
	xlsFile.setFolder(INVOICEREQUESTPDF_ADDRESS);
	//20230901 add by CH762 end 
	xlsFile.setIsOnline(true);
	// save file
	var fileID = nlapiSubmitFile(xlsFile);
	var fl = nlapiLoadFile(fileID);  
	var url= URL_HEAD +'/'+fl.getURL();
	nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
	
}
catch(e){
		nlapiLogExecution('debug', '�G���[', e.message)

}

}
function defaultEmpty(src){
	return src || '';
}

// CH408 zheng 20230517 start
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
// CH408 zheng 20230517 end

// add by zzq CH671 20230704 start
function othChargeDisplayname(dpn, language) {
    var itemDisplayName = '';
    if (dpn) {
        invoiceDisplayName = dpn.split("/");
        if (language == SYS_LANGUAGE_JP) { // ���{��
            itemDisplayName = invoiceDisplayName[0];
            nlapiLogExecution('debug', 'itemDisplayNameJP', itemDisplayName);
        } else if (language == SYS_LANGUAGE_EN && invoiceDisplayName.length > 1) { // �p��
            itemDisplayName = invoiceDisplayName[1];
            nlapiLogExecution('debug', 'itemDisplayNameEN', itemDisplayName);
        } else {
            itemDisplayName = invoiceDisplayName[0];
        }
    }
    return itemDisplayName;
}
// add by zzq CH671 20230704 end

// CH598 zhou 20230602 start
/**
 * ��������
 * @param val
 * @returns {String}
 */
function dealFugou (value) {
    var reValue = '';
    if(value){
        reValue = value.replace(new RegExp('&','g'),'&amp;')
                   .replace(new RegExp('&amp;lt;','g'),'&lt;') // [&]��u��������ƁA���X�G�X�P�[�v��������Ă���[<]���ω����邽�߁A�߂�
                   .replace(new RegExp('&amp;gt;','g'),'&gt;');
        return reValue;
    }
    return value;
}

//CH598 zhou 20230602 end
function transfer(text){
    if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

return text ;
}
function formatAmount1(number) {
    var parts = number.toString().split(".");
    var integerPart = parts[0];
    var decimalPart = parts.length > 1 ? "." + parts[1] : "";
    
    var pattern = /(\d)(?=(\d{3})+$)/g;
    integerPart = integerPart.replace(pattern, "$1,");
    
    return integerPart + decimalPart;
}