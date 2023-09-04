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
		var entity = invoiceRecord.getFieldValue('entity');//�ڋq
		var customerSearch= nlapiSearchRecord("customer",null,
				[
					["internalid","anyof",entity]
				], 
				[
				 	new nlobjSearchColumn("address2","billingAddress",null), //������Z��2
			    	new nlobjSearchColumn("address3","billingAddress",null), //������Z��3
			    	new nlobjSearchColumn("city","billingAddress",null), //������s�撬��
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
				 	new nlobjSearchColumn("address1","billingAddress",null) //������Z��1

				]
				);	
		var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//�Z��2
		var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//�Z��3
		var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//�s�撬��
		var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//�X�֔ԍ�
		var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//�s���{�� 
		var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//�d�b�ԍ�
		var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
		var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
		var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//�̔����i���ВS���j
		var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//����
		var currency= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("currency"));//�̔����i���ВS���j
		var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_pl_code_fd","CUSTENTITY_DJKK_PL_CODE_FD",null));//DJ_�̔����i�\�R�[�h�i�H�i�jcode
//		var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_pl_code_fd"));//DJ_�̔����i�\�R�[�h�i�H�i�jcode
		var custNameText= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//name add by lj
		var customerPayment = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_customer_payment"));//add by lj
		var address1 = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address1","billingAddress",null));//add by lj


		//	nlapiLogExecution('debug', 'custLanguage', custLanguage)

		var trandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //���������t
		var delivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //�������[�i��
		var tranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //�������ԍ�
		var transactionnumber = defaultEmpty(invoiceRecord.getFieldValue('transactionnumber'));    //�g�����U�N�V�����ԍ��@221207�����ǉ�
		var createdfrom = defaultEmpty(invoiceRecord.getFieldValue('createdfrom'));    //�������쐬��
		var otherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //�������ԍ�
		var soNumber = '';
		if(!isEmpty(createdfrom)){
			var so = nlapiLoadRecord('salesorder',createdfrom);
			soNumber = so.getFieldValue('transactionnumber');
		}
		var payment = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_payment_conditions'));    //�������x������
		var salesrep = defaultEmpty(invoiceRecord.getFieldText('salesrep'));    //�c�ƒS����
		var memo = defaultEmpty(invoiceRecord.getFieldValue('memo'));    //memo
		
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
						new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_�[�i��Z��2
						new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_�[�i�於�O
							  
					]
					);	
			var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//�X�֔ԍ�
			var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//�s���{��
			var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_�s�撬��
			var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_�[�i��Z��1
			var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_�[�i��Z��2
			var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_�[�i�於�O
		}
		
		var invoiceCount = invoiceRecord.getLineItemCount('item');
		var invoToTotal =0;
        var invoAmountTotal = 0;
        var invTaxmountTotal = 0;
		for(var k=1;k<invoiceCount+1;k++){
			invoiceRecord.selectLineItem('item',k);
			var invoiceItemId = invoiceRecord.getLineItemValue('item','item',k);	//item
			var invoiceItemSearch = nlapiSearchRecord("item",null,
					[
					 	["internalid","anyof",invoiceItemId],
					],
					[
					  new nlobjSearchColumn("itemid"), //���i�R�[�h
					  new nlobjSearchColumn("displayname"), //���i��
					  new nlobjSearchColumn("custitem_djkk_product_code"), //�J�^���O���i�R�[�h
					]
					); 
				
				var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//���i�R�[�h
				var productCode= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("custitem_djkk_product_code"));//�J�^���O���i�R�[�h
				var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//���i��
				invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;")
				var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//����
				var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//�P��
				if(!isEmpty(invoiceRateFormat)){
				    invoiceRateFormat = invoiceRateFormat.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}
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
				invTaxamount = 0;
				if(!isEmpty(invoiceTaxamount)){
					var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					invTaxamount += invoiceTaxamount;
					invTaxmountTotal = invTaxmountTotal + invoiceTaxamount;
					// invTaxmountTotal = invTaxmountTotal + invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
				}else{
					var invTaxamountFormat = '0';
				}
				
				var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
				// modify by lj start DENISJAPANDEV-1376
				if(!isEmpty(invoTotal)){
					invoToTotal = invoToTotal + invoTotal;
					// invoToTotal = invoToTotal + invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
				}
				// modify by lj end DENISJAPANDEV-1376

				
				var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//�P��
				itemLine.push({
					invoiceInitemid:invoiceInitemid,  //���i�R�[�h
					invoiceDisplayName:invoiceDisplayName,//���i��
					invoiceQuantity:invoiceQuantity,//����
					invoiceRateFormat:invoiceRateFormat,//�P��
					invoiceAmount:invAmountFormat,//���z  
					invoiceTaxrate1Format:invoiceTaxrate1Format,//�ŗ�
					invoiceTaxamount:invTaxamountFormat,//�Ŋz  
					invoiceUnitabbreviation:invoiceUnitabbreviation,
					productCode:productCode,//�J�^���O���i�R�[�h
				}); 
		}
	}else if(type == 'creditmemo'){
		//�N���W�b�g����
		nlapiLogExecution('debug','start','start')
		var invAmount = 0;
		var invTaxamount = 0;
		var itemLine = new Array();
		var creditmemoId = request.getParameter('custscriptcustscript01'); //creditmemoID
		var creditmemoRecord = nlapiLoadRecord('custscriptcustscript02',creditmemoId);
		nlapiLogExecution('error', 'creditmemoId', creditmemoId);
		nlapiLogExecution('error', 'creditmemoRecord', creditmemoRecord);
		var entity = creditmemoRecord.getFieldValue('entity');//�ڋq
		var customerSearch= nlapiSearchRecord("customer",null,
				[
					["internalid","anyof",entity]
				], 
				[
				 	new nlobjSearchColumn("address2","billingAddress",null), //������Z��2
			    	new nlobjSearchColumn("address3","billingAddress",null), //������Z��3
			    	new nlobjSearchColumn("city","billingAddress",null), //������s�撬��
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
				 	new nlobjSearchColumn("address1","billingAddress",null) //������Z��1

				]
				);	
		var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//�Z��2
		var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//�Z��3
		var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//�s�撬��
		var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//�X�֔ԍ�
		var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//�s���{�� 
		var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//�d�b�ԍ�
		var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
		var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
		var custNameText= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//name add by zhou
		var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//�̔����i���ВS���j
		var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//����
		nlapiLogExecution('debug','custLanguage',custLanguage)
		var currency= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("currency"));//�̔����i���ВS���j
		var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_pl_code_fd","CUSTENTITY_DJKK_PL_CODE_FD",null));//DJ_�̔����i�\�R�[�h�i�H�i�jcode
//		var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_pl_code_fd"));//DJ_�̔����i�\�R�[�h�i�H�i�jcode
		var customerPayment = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_customer_payment"));//add by lj
		var address1 = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address1","billingAddress",null));//add by lj
		
		//	nlapiLogExecution('debug', 'custLanguage', custLanguage)

		var trandate = defaultEmpty(creditmemoRecord.getFieldValue('trandate'));    //�N���W�b�g�������t
		var delivery_date = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_date'));    //�N���W�b�g�����[�i��
		var tranid = defaultEmpty(creditmemoRecord.getFieldValue('tranid'));    //�N���W�b�g�����ԍ�
		var transactionnumber = defaultEmpty(creditmemoRecord.getFieldValue('transactionnumber'));    //�g�����U�N�V�����ԍ��@221207�����ǉ�
		var createdfrom = defaultEmpty(creditmemoRecord.getFieldValue('createdfrom'));    //�N���W�b�g�����쐬��
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
		var salesrep = defaultEmpty(creditmemoRecord.getFieldText('salesrep'));    //�c�ƒS����
		var memo = defaultEmpty(creditmemoRecord.getFieldValue('memo'));    //memo
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
						new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_�[�i��Z��2
						new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_�[�i�於�O
							  
					]
					);	
			var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//�X�֔ԍ�
			var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//�s���{��
			var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_�s�撬��
			var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_�[�i��Z��1
			var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_�[�i��Z��2
			var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_�[�i�於�O
		}
		
		var invoiceCount = creditmemoRecord.getLineItemCount('item');
		for(var k=1;k<invoiceCount+1;k++){
			creditmemoRecord.selectLineItem('item',k);
			var invoiceItemId = creditmemoRecord.getLineItemValue('item','item',k);	//item
			var invoiceItemSearch = nlapiSearchRecord("item",null,
					[
					 	["internalid","anyof",invoiceItemId],
					],
					[
					  new nlobjSearchColumn("itemid"), //���i�R�[�h
					  new nlobjSearchColumn("displayname"), //���i��
					  new nlobjSearchColumn("custitem_djkk_product_code"), //�J�^���O���i�R�[�h
					]
					); 
				
				var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//���i�R�[�h
				var productCode= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("custitem_djkk_product_code"));//�J�^���O���i�R�[�h
				var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//���i��
				invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;")
				var invoiceQuantity = defaultEmpty(creditmemoRecord.getLineItemValue('item','quantity',k));//����
				var invoiceRateFormat = defaultEmpty(creditmemoRecord.getLineItemValue('item','rate',k));//�P��
				if(!isEmpty(invoiceRateFormat)){
				    invoiceRateFormat = invoiceRateFormat.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}
				var invoiceAmount = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item','amount',k)));//���z
				var invoAmountTotal = '';
				if(!isEmpty(invoiceAmount)){
					var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');	
					invAmount  += invoiceAmount;
					// modify by lj start DENISJAPANDEV-1376
					invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
					// modify by lj end DENISJAPANDEV-1376
				}else{
					var invAmountFormat = '';
				}
				
				var invoiceTaxrate1Format = defaultEmpty(creditmemoRecord.getLineItemValue('item','taxrate1',k));//�ŗ�
				var invoiceTaxamount = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item','tax1amt',k)));//�Ŋz   
				invoiceTaxamount = defaultEmpty(isEmpty(invoiceTaxamount) ? 0 :  invoiceTaxamount);
				var invTaxmountTotal = '0';
				if(!isEmpty(invoiceTaxamount)){
					var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					invTaxamount += invoiceTaxamount;
					invTaxmountTotal = invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
				}else{
					var invTaxamountFormat = '';
				}
				var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
				// modify by lj start DENISJAPANDEV-1376
				if(!isEmpty(invoTotal)){
					var invoToTotal = invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
				}else{
					var invoToTotal ='';
				}
				// modify by lj end DENISJAPANDEV-1376
				
				var invoiceUnitabbreviation = defaultEmpty(creditmemoRecord.getLineItemValue('item','units_display',k));//�P��
				itemLine.push({
					invoiceInitemid:invoiceInitemid,  //���i�R�[�h
					invoiceDisplayName:invoiceDisplayName,//���i��
					invoiceQuantity:invoiceQuantity,//����
					invoiceRateFormat:'-'+invoiceRateFormat,//�P��
					invoiceAmount:'-'+invAmountFormat,//���z  
					invoiceTaxrate1Format:invoiceTaxrate1Format,//�ŗ�
					invoiceTaxamount:'-'+invTaxamountFormat,//�Ŋz  
					invoiceUnitabbreviation:invoiceUnitabbreviation,
					productCode:productCode,//�J�^���O���i�R�[�h
				}); 
		}
	}

	
	if(custLanguage == '���{��'){
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
		var consumptionTaxName = '��\xa0\xa0��\xa0\xa0��';
		var invoiceName1 = '�䐿���z';
		var personName = '�S����\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
		var memoName = '��\xa0\xa0��';
		var custName = '�ڋq��\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
		var addressNmae = '�Z��\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';

	}else{
		var dateName = 'Date';
		var deliveryName = 'Delivery Date';
		var paymentName = 'Payment Terms';
		var numberName = 'Number';
		var numberName2 = 'Order number:';
		var codeName = 'Code';
		var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Invoice*\xa0\xa0\*\xa0\xa0\*';
		var quantityName = 'Quantity';
		var unitpriceName = 'Unit Price';
		var amountName = 'amount';
		var poductName = 'Product name';
		var taxRateName = 'tax rate:';
		var taxAmountName = 'TaxAmt:';
		var custCode = 'Customer code:';
		var destinationName = 'Delivery:';
		var totalName = 'Total';
		var consumptionTaxName = 'Excise tax';
		var invoiceName1 = 'Invoice';
		var personName = 'Person:';
		var memoName = 'Memo';
		var custName = 'Customer name:';
		var addressNmae = 'address:';
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
	var subsidiary = getRoleSubsidiary();
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
	'</#if>'+
	
	'<macrolist>'+
	'<macro id="nlfooter">'+
	'<table style="border-top: 1px solid black;width: 660px;font-weight: bold;">'+
	'<tr style="padding-top:5px;">'+
	'<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
	if(!isEmpty(incoicedelivery_Name)){
		str+='<td style="width:270px;">'+destinationName+'&nbsp;'+incoicedelivery_Name+'</td>';
	}else{
		str+='<td style="width:270px;">'+destinationName+'</td>';
	}
	str+='<td style="width:70px;">&nbsp;&nbsp;'+totalName+'</td>'+
	'<td style="width:70px;" align="right">'+invoAmountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0]+'</td>'+
	'</tr>'+
	
	'<tr>'+
	'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>';
	if(!isEmpty(invdestinationZip)){
		str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��'+invdestinationZip+'</td>';
	}
	str+='</tr>'+
	'<tr>';
	// �ڋq��
//	'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + custName + custNameText + '</td>';
//	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	if(!isEmpty(invdestinationState)){
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
	}else{
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	}
	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
	'<td style="width:100px;margin-top:-8px;" align="right">'+invTaxmountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0]+'</td>'+
	'</tr>'+
	
	'<tr>'+
//	�Z��
	'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + addressNmae  + invoiceAddressState + '</td>';

//	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
		str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationCity+invdestinationAddress+'</td>';
	}

	str+='</tr>'+
	
	'<tr>'+
	'<td style="width:220px;margin-top:-8px;;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + invoiceCity + '</td>';
//	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	if(!isEmpty(invdestinationAddress2)){
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationAddress2+'</td>';
	}else{
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	}
	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'</td>'+
	'<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0]+'</td>'+
	'</tr>'+
//	�Z��
	'<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>' +
	'<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td></tr>' +
	'<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address3 + '</td></tr>' +

	'</table>'+
	'<table style="width: 660px;font-weight: bold;">'+
	'<tr><td style="width:220px;margin-top:-8px;margin-left:7px">�U������</td></tr>' +
	'<tr><td style="width:660px;margin-top:-8px;margin-left:7px">�O�H����UFJ��s(0005) �R�ʎx�X(084) ���ʗa�� No.0191019</td></tr>' +
	'</table>'+
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
	
	str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4" footer="nlfooter" footer-height="12%">'+
	'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
	'<tr>'+
	'<td>'+
	'<table style="font-weight: bold;width:335px;">'+
	'<tr style="height: 18px;" colspan="2"></tr>'+	
	'<tr>'+
	'<td style="border:1px solid black;" corner-radius="4%">'+
	'<table>'+
	'<tr style="height:10px;"></tr>'+
	'<tr>'+
	'<td>��'+invoiceZipcode+'</td>'+
	'<td align="right" style="margin-right:-22px;">&nbsp;</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invAddress+'</td>'+
	'<td align="right" style="padding-right: 30px;margin-top:-8px;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address1+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="right" style="padding-right: 75px;padding-bottom:0px;margin-top:-8px;" colspan="2">�䒆</td>'+
	'</tr>'+
	'<tr>';
	if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
		str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
		'</tr>';
	}
	// modify by lj start DENISJAPANDEV-1376
	else{
//		str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Tel:'+invPhone+'</td>'+
//		'</tr>'+
//		'<tr>'+
//		'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Fax:'+invFax+'</td>'+
//		'</tr>';
		str += '</tr>';
	}
	// modify by lj end DENISJAPANDEV-1376

	
	str += '<tr style="height: 40px;"></tr>'+
	'</table>'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	
	'<td style="padding-left: 30px;">'+
	'<table style="width: 280px;font-weight: bold;">'+
	'<tr>'+
	'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
//	'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
	'</tr>';
	//20230208 changed by zhou start CH298
	//20230628 changed by zzq start CH701
	if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
		str+='<tr>'+
		'<td colspan="2" style="margin-left:-72px;margin-top:-8px;">&nbsp;'+custNameText+'</td>'+
		'</tr>';
	}
	//20230628 changed by zzq start CH701
	//end
	str+='<tr>'+
	'<td style="font-size:17px;margin-top:-5px;" colspan="2">'+invoiceNameEng+'&nbsp;</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="font-size: 20px;margin-top:-2px;" colspan="2" >'+invoiceLegalname+'&nbsp;</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 10px;margin-top:-2px;">��'+invoiceAddressZip+'&nbsp;</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+invoiceAddressThree+'&nbsp;</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="font-size: 10px;margin-top:-4px;">TEL:&nbsp;'+invoicePhone+'</td>'+
	'<td style="font-size: 10px;margin-top:-4px;">FAX:&nbsp;'+invoiceFax+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressEng+'</td>'+
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
	'<tr>'+
	'<td style="width: 225px;">&nbsp;&nbsp;'+dateName+'&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
	'<td style="width: 285px;margin-left:-25px;">'+deliveryName+'&nbsp;:&nbsp;&nbsp;'+delivery_date+'</td>'+
	'<td style="width: 50px;"></td>'+
	'<td style="width: 50px;"></td>'+
	'<td style="width: 50px;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="width: 225px;margin-top:-8px;">&nbsp;</td>'+
	// modify by lj start DENISJAPANDEV-1385
//	'<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+payment+'</td>'+
	'<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+ customerPayment + '</td>'+
	// modify by lj END DENISJAPANDEV-1385
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'+
	'<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+'&nbsp;'+otherrefnum+'</td>'+
	'</tr>';
	
	// modify by lj start DENISJAPANDEV-1376
	//20221206 add by zhou CH116 start
	//changed by zhou 20230208 CH298 
//	if((subsidiary != SUB_SCETI && subsidiary != SUB_DPKK ) &&  type != 'creditmemo'){
//		str+='<tr>'+
//		'<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;�ʉ݃R�[�h&nbsp;:'+currency+'</td>'+
//		'<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">���i�R�[�h&nbsp;:'+priceCode+'</td>'+
//		'</tr>';
//	}
	//end
	// modify by lj end DENISJAPANDEV-1376
	str+= '</table>'+
	
	'<table style="width: 660px;font-weight: bold;">';	
	str+='<tr>';
		if(!isEmpty(memo)){	
			str+='<td style="width: 330px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+memo+'</td>'+
			'<td style="width: 110px;margin-top:-8px;">&nbsp;</td>'+
			'<td style="width: 100px;margin-top:-8px;">&nbsp;</td>'+
			'<td style="width: 100px;margin-top:-8px;">&nbsp;&nbsp;Page�F&nbsp;<pagenumber/></td>'+
			'</tr>';
		}else{
			str+='<td style="width: 130px;margin-top:-8px;">&nbsp;</td>'+
			'<td style="width: 200px;margin-top:-8px;">&nbsp;</td>'+
			'<td style="width: 110px;margin-top:-8px;">&nbsp;</td>'+
			'<td style="width: 100px;margin-top:-8px;">&nbsp;</td>'+
			'<td style="width: 100px;margin-top:-8px;">&nbsp;&nbsp;Page�F&nbsp;<pagenumber/></td>'+
			'</tr>';
		}
	str+= '</table>';
		
	str+= '<table style="width: 660px;font-weight: bold;">';	
	str+='<tr  style="border-bottom: 1px solid black;">'+
	'<td style="width: 130px;margin-top:-6px;">&nbsp;&nbsp;'+codeName+'</td>'+
	'<td style="width: 210px;margin-top:-6px;" align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+poductName+'</td>'+
	'<td style="width: 110px;margin-top:-6px;">&nbsp;&nbsp;'+quantityName+'</td>'+
	'<td style="width: 100px;margin-top:-6px;">&nbsp;&nbsp;'+unitpriceName+'</td>'+
	'<td style="width: 100px;margin-top:-6px;">&nbsp;&nbsp;'+amountName+'</td>'+
	'</tr>';
	for(var i = 0;i<itemLine.length;i++){
		str+='<tr>'+
		'<td style="width: 130px;margin-bottom:-5px;">&nbsp;&nbsp;'+itemLine[i].invoiceInitemid+'</td>'+
		'<td style="width: 210px;margin-bottom:-5px;">'+itemLine[i].invoiceDisplayName+'</td>'+
		'<td style="width: 110px;margin-bottom:-5px;" align="center">'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>';
		if(custLanguage == '���{��' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
			var itemRateForma = itemLine[i].invoiceRateFormat;
			var itemAmount = itemLine[i].invoiceAmount;
			str+= '<td style="width: 100px;margin-bottom:-5px;" align="right">'+itemRateForma.split('.')[0]+'</td>'+
			'<td style="width: 100px;margin-bottom:-5px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemAmount.split('.')[0]+'</td>'+
			'</tr>';
		}else{
			str+= '<td style="width: 100px;margin-bottom:-5px;" align="right">'+itemLine[i].invoiceRateFormat+'</td>'+
			'<td style="width: 100px;margin-bottom:-5px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceAmount+'</td>'+
			'</tr>';
		}
		
		str+= '<tr>'+
		'<td style="width: 130px;margin-left: 36px;margin-top:-3px;">'+itemLine[i].productCode+'</td>'+
		'<td style="width: 210px;margin-top:-3px;">&nbsp;</td>'+
		'<td style="width: 110px;margin-top:-3px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'</td>';
		if(custLanguage == '���{��' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
			var itemTaxamount = itemLine[i].invoiceTaxamount;
			str+='<td style="width: 100px;margin-top:-3px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
			str+='<td style="width: 100px;margin-top:-3px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount.split('.')[0]+'</td>';
		}else{
			str+='<td style="width: 100px;margin-top:-3px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
			str+='<td style="width: 100px;margin-top:-3px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceTaxamount+'</td>';
		}
		
		str+='</tr>';
	}	
	str+='</table>';
	str+='</body>';

	str += '</pdf>';
	var renderer = nlapiCreateTemplateRenderer();
	renderer.setTemplate(str);
	var xml = renderer.renderToString();
	var xlsFile = nlapiXMLToPDF(xml);
	// PDF
	xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
	xlsFile.setFolder(INVOICE_REQUESE_PDF_DJ_INVOICEREQUESTPDF);
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