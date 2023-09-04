/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Sep 2022     
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	//�������̒l
	var soID = request.getParameter('soid'); //soID
	var itemLineArr = new Array();
	var inventoryDetailArr = new Array();
	var amountTota = 0;
	var taxamountTota = 0;
	
	var soRecord = nlapiLoadRecord('salesorder',soID);
	//line24 add by zhou 
	var entity = soRecord.getFieldValue('entity');//�ڋq
	var customerSearch= nlapiSearchRecord("customer",null,
			[
				["internalid","anyof",entity]
			], 
			[
			 	new nlobjSearchColumn("CUSTRECORD_DJKK_HONORIFIC_APPELLATION","billingAddress",null), //DJ_�h��
			 	new nlobjSearchColumn("address2","billingAddress",null), //������Z��1
		    	new nlobjSearchColumn("address3","billingAddress",null), //������Z��2
		    	new nlobjSearchColumn("city","billingAddress",null), //������s�撬��
		    	new nlobjSearchColumn("zipcode","billingAddress",null), //������X�֔ԍ�
		    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //������s���{�� 		
		    	new nlobjSearchColumn("phone"), //�d�b�ԍ�
		    	new nlobjSearchColumn("fax"), //Fax
		    	new nlobjSearchColumn("custentity_djkk_language"),  //����
		    	new nlobjSearchColumn("custentity_djkk_reference_express"),  //���z�\��flg
		    	new nlobjSearchColumn("custentity_djkk_delivery_express"),  //�\��flg
			]
			);	
	var honorieicAppellation = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("CUSTRECORD_DJKK_HONORIFIC_APPELLATION","billingAddress",null));//DJ_�h��
	if(honorieicAppellation =='��'){
		honorieicAppellation = '';
	}
	var attention= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//������Z��2
	var customerAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//������Z��1
	var customerCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//������s�撬��
	var customerZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//������X�֔ԍ�
	var customerState= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//������s���{�� 
	var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//������d�b�ԍ�
	var fax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//������fax
	var soLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_language"));//����
	var expressFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_reference_express"));//���z�\��flg
	var deliveryFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_delivery_express"));//�\��flg
	
	var subsidiary = soRecord.getFieldValue('subsidiary');//�q���
	var subsidiarySearch= nlapiSearchRecord("subsidiary",null,
			[
				["internalid","anyof",subsidiary]
			], 
			[
				new nlobjSearchColumn("legalname"),  //��������
				new nlobjSearchColumn("name"), //���O
				new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //���O�p��
				new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //�Z���p��
				new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //�s���{��
				new nlobjSearchColumn("address2","address",null), //�Z��1
				new nlobjSearchColumn("address3","address",null), //�Z��2
				new nlobjSearchColumn("city","address",null), //�s�撬��
				new nlobjSearchColumn("zip","address",null), //�X�֔ԍ�
				new nlobjSearchColumn("custrecord_djkk_bank_1"), //��s1
				new nlobjSearchColumn("custrecord_djkk_bank_2"), //��s2
					  
			]
			);		
	var legalname= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("legalname"));//��������
	var nameString= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("name"));//���O
	var nameStringTwo = nameString.split(":");
	var name = nameStringTwo.slice(-1);
	var address= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//�s���{��
	var city= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("city","address",null));//�s�撬��
	var bankOne= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_1"));//��s1
	var bankTwo= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_2"));//��s2
	var addressZip= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("zip","address",null));//�X�֔ԍ�
	var nameEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//���O�p��
	var mainaddressEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//�Z���p��
	var address1= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address2","address",null));//�Z��1
	var address2= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address3","address",null));//�Z��2
	var bankOneId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_1"));//��s1
	var bankTwoId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_2"));//��s2
//	nlapiLogExecution('DEBUG', 'bankOneId',bankOneId);
	if(!isEmpty(bankOneId)){
		var bank1 = nlapiLoadRecord('customrecord_djkk_bank', bankOneId);
		var branch_name1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_�x�X��
		var bank_no1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));//DJ_�����ԍ�
	}else{
		var branch_name1 = '';
		var bank_no1 = '';
	}
	if(!isEmpty(bankTwoId)){
		var bank2 = nlapiLoadRecord('customrecord_djkk_bank', bankTwoId);
		var branch_name2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_�x�X��
		var bank_no2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));//DJ_�����ԍ�
	}else{
		var branch_name2 = '';
		var bank_no2 ='';
	}
	
//	nlapiLogExecution('DEBUG', 'hellow','hellow');
	var trandate = defaultEmpty(soRecord.getFieldValue('trandate'));//���t
	var delivery_date = defaultEmpty(soRecord.getFieldValue('custbody_djkk_delivery_date'));//DJ_�[�i��
	var tranid = defaultEmpty(soRecord.getFieldValue('tranid'));//�����ԍ�
	var terms = defaultEmpty(soRecord.getFieldText('terms'));//�x�������i���ߓ������j
	var soTersm = defaultEmpty(terms.split('/'));
	var soTersmJap = defaultEmpty(soTersm.slice(0,1));
	var soTersmEng  = defaultEmpty(soTersm.slice(-1));
//	nlapiLogExecution('DEBUG', 'soTersmJap',soTersmJap);
//	nlapiLogExecution('DEBUG', 'soTersmEng',soTersmEng);
	var otherrefnum = defaultEmpty(soRecord.getFieldValue('otherrefnum'));//�������ԍ�
	var destination = soRecord.getFieldValue('custbody_djkk_delivery_destination');//DJ_�[�i��	
	var destinationName = defaultEmpty(soRecord.getFieldText('custbody_djkk_delivery_destination'));//DJ_�[�i�於�O
	if(!isEmpty(destination)){	
		var destinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
				[
					["internalid","anyof",destination]
				], 
				[
					new nlobjSearchColumn("custrecord_djkk_zip"),  //�X�֔ԍ�
					new nlobjSearchColumn("custrecord_djkk_prefectures"),  //�s���{��
					new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_�s�撬��
					new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_�[�i��Z��1
					new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_�[�i��Z��2
					new nlobjSearchColumn("custrecord_djkk_sales"),//�[�i��c��
						  
				]
				);	
		var destinationZip = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_zip'));
		var destinationState = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_prefectures'));
		var destinationCity = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_municipalities'));
		var destinationAddress = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_delivery_residence'));
		var destinationAddress2 = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));
		var destinationSales = defaultEmpty(destinationSearch[0].getText('custrecord_djkk_sales'));
	}
	var soCount = soRecord.getLineItemCount('item');
		
	for(var a=1;a<soCount+1;a++){
		var receiptnote = soRecord.getLineItemValue('item', 'custcol_djkk_receipt_printing', a);//DJ_��̏����
			if(receiptnote == 'T'){
			soRecord.selectLineItem('item',a);
			var itemId = soRecord.getLineItemValue('item','item',a);	
			var ItemSearch = nlapiSearchRecord("item",null,
					[
					 	["internalid","anyof",itemId],
					],
					[
					  new nlobjSearchColumn("vendorname"), //�d���揤�i�R�[�h
					  new nlobjSearchColumn("itemid"), //���i�R�[�h
					  new nlobjSearchColumn("displayname"), //���i��
					  new nlobjSearchColumn("custitem_djkk_storage_type"), //�݌ɋ敪
					  new nlobjSearchColumn("custitem_djkk_product_category_sml"), //�z�����x
					]
					); 
				
				var vendorname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("vendorname"));//�d���揤�i�R�[�h
				var itemid= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("itemid"));//���i�R�[�h
				var displayname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("displayname"));//���i��
				var storage_type= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_storage_type"));//�݌ɋ敪
				var deliverytemptyp= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_product_category_sml"));//�z�����x
	
			
			var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//����
			
			var amount = defaultEmptyToZero(parseFloat(soRecord.getLineItemValue('item', 'amount', a)));//���z
			if(!isEmpty(amount)){
				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');		
				amountTota += amount;
				var amountTotal = amountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var amountFormat = '';
			}
	
			
			var taxamount = defaultEmpty(parseFloat(soRecord.getLineItemValue('item','tax1amt',a)));//�Ŋz   
	
			if(!isEmpty(taxamount)){
				var taxamountFormat = taxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				taxamountTota += taxamount;
				var taxamountTotal = taxamountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var taxamountFormat = '';
			}
		
	
			var rateFormat= defaultEmpty(soRecord.getLineItemValue('item','rate',a));//�P��
			
			var total = defaultEmpty(Number(amountTota+taxamountTota));
			if(!isEmpty(total)){
				var toTotal = total.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var toTotal = '';
			}
			//20221020 add by zhou 
			var unitabbreviation = defaultEmpty(soRecord.getLineItemValue('item','units_display',a));//�P��
			
			var soUnitsArray;//�P��array
			var soUnit;//�ύX��P��
			if(!isEmpty(soLanguage)&&!isEmpty(unitabbreviation)){
				var unitSearch = nlapiSearchRecord("unitstype",null,
						[
						   ["abbreviation","is",unitabbreviation]
						], 
						[
						   new nlobjSearchColumn("abbreviation")
						]
						);
				if(unitSearch != null){
					if(soLanguage == '�p��'){			//�p��
						unitabbreviation = unitSearch[0].getValue('abbreviation')+'';
						soUnitsArray = unitabbreviation.split("/");
						if(soUnitsArray.length == 2){
							soUnit = soUnitsArray[0];
						}
					}else if(soLanguage == '���{��'){				//���{��
						unitabbreviation = unitSearch[0].getValue('abbreviation')+'';
						soUnitsArray = unitabbreviation.split("/");
						if(!isEmpty(soUnitsArray)){
							soUnit = soUnitsArray[0];
						}else if(soUnitsArray.length == 0){
							soUnit = unitabbreviation;
						}
					}
				}
			}
			
			//end
			var taxrate1Format = defaultEmpty(soRecord.getLineItemValue('item','taxrate1',a));//�ŗ�   //
			var pocurrency = transfer(defaultEmpty(soRecord.getLineItemValue('item','pocurrency',a)));//�ʉ�
			if(pocurrency == 'JPY'){
				var pocurrencyMoney = '��';
			}else if(pocurrency == 'USD'){
				var pocurrencyMoney = '$';
			}else{
				var pocurrencyMoney = '';
			}
			
	
			itemLineArr.push({
				vendorname:vendorname,//�d���揤�i�R�[�h
				itemid:itemid,//���i�R�[�h
				displayname:displayname,//���i��
				storage_type:storage_type,//�݌ɋ敪
				quantity:quantity,//����
				amount:amountFormat,//���z  
				taxamount:taxamountFormat,//�Ŋz 
				rateFormat:rateFormat,//�P��
				unitabbreviation:defaultEmpty(soUnit),//�P��
				taxrate1Format:taxrate1Format,//�ŗ�
				deliverytemptyp:deliverytemptyp,//�z�����x�敪
				itemId:itemId,
			}); 
			var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //�݌ɏڍ�
			if(!isEmpty(inventoryDetail)){
				var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
				if(inventoryDetailCount != 0){
					for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
						inventoryDetail.selectLineItem('inventoryassignment',j);
						var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//�V���A��/���b�g�ԍ�
						if(isEmpty(receiptinventorynumber)){
					    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//���b�g�ԍ�internalid
					    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
				                    [
				                       ["internalid","is",invReordId]
				                    ], 
				                    [
				                     	new nlobjSearchColumn("inventorynumber"),
				                    ]
				                    );    
					    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////�V���A��/���b�g�ԍ�	
				    	}
						var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //�L������	
						inventoryDetailArr.push({
								itemId:itemId,
								serialnumbers:serialnumbers,
								expirationdate:expirationdate,					
						});
					}
				}
			}else{	
					inventoryDetailArr.push({
						serialnumbers:'',
						expirationdate:'',
					}); 
			}
		}									
	}
//	//�������̒l
	var invoiceItemArr = new Array();
	var invInventoryDetail = new Array();
	var invAmount = 0;
	var invTaxamount = 0;
	var invoiceSearch = nlapiSearchRecord("invoice",null,
			[
			   ["type","anyof","CustInvc"], 
			   "AND", 
			   ["createdfrom","anyof",soID]
			], 
			[
			   new nlobjSearchColumn("internalid")
			]
			);
	if(!isEmpty(invoiceSearch)){
		var invoiceId = invoiceSearch[0].getValue('internalid');
		var invoiceRecord = nlapiLoadRecord('invoice',invoiceId);   //������
		var invoiceEntity = invoiceRecord.getFieldValue('entity')    //�������ڋq	
		var incustomerSearch= nlapiSearchRecord("customer",null,
			[
				["internalid","anyof",invoiceEntity]
			], 
			[
			 	new nlobjSearchColumn("address2","billingAddress",null), //������Z��1
    			new nlobjSearchColumn("address3","billingAddress",null), //������Z��2
    			new nlobjSearchColumn("city","billingAddress",null), //������s�撬��
    			new nlobjSearchColumn("zipcode","billingAddress",null), //������X�֔ԍ�
    			new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //������s���{�� 		
    			new nlobjSearchColumn("phone"), //�d�b�ԍ�
    			new nlobjSearchColumn("fax"), //Fax
    			new nlobjSearchColumn("custentity_djkk_language"),  //����
			]
			);	
		var invoiceAddress2= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("address2","billingAddress",null));//������Z�� 1
		var invoiceAddress1= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("address3","billingAddress",null));//������Z��2
		var invoiceCity= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("city","billingAddress",null));//������s�撬��
		var invoiceZipcode= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("zipcode","billingAddress",null));//������X�֔ԍ�
		var invoiceState= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//������s���{�� 
		var invoicePhone= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("phone"));//�d�b�ԍ�
		var invoiceFax= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("fax"));//fax
		var invoiceLanguage= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getText("custentity_djkk_language"));//����������
		
		var invoiceSubsidiary = invoiceRecord.getFieldValue('subsidiary')    //�������q���
		var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
			[
				["internalid","anyof",invoiceSubsidiary]
			], 
			[
				new nlobjSearchColumn("legalname"),  //��������
				new nlobjSearchColumn("name"), //���O
				new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //���O�p��
				new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //�Z���p��
				new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //�s���{��
				new nlobjSearchColumn("address2","address",null), //�Z��1
				new nlobjSearchColumn("address3","address",null), //�Z��2
				new nlobjSearchColumn("city","address",null), //�s�撬��
				new nlobjSearchColumn("zip","address",null), //�X�֔ԍ�
				new nlobjSearchColumn("custrecord_djkk_bank_1"), //��s1
				new nlobjSearchColumn("custrecord_djkk_bank_2"), //��s2	  
			]
			);	
		var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//��������
		var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//���O
		var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//�Z��1
		var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//�Z��2
		var invoiceBankOne= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getText("custrecord_djkk_bank_1"));//��s1
		var invoiceBankTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getText("custrecord_djkk_bank_2"));//��s2
		var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//�X�֔ԍ�
		var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//�s�撬��
		var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//�s���{��
		var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//���O�p��
		var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//���O�p��
		var invoiceBankOneId= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_1"));//��s1
		var invoiceBankTwoId= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_2"));//��s2
		
		if(!isEmpty(invoiceBankOneId)){
			var invoiceBank1 = nlapiLoadRecord('customrecord_djkk_bank', invoiceBankOneId);
			var invbranch_name1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_�x�X��
			var invbank_no1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_no'));//DJ_�����ԍ�
		}
		if(!isEmpty(invoiceBankTwoId)){
			var invoiceBank2 = nlapiLoadRecord('customrecord_djkk_bank', invoiceBankTwoId);
			var invbranch_name2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_�x�X��
			var invbank_no2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_no'));//DJ_�����ԍ�
		}

			
		
		var invoiceTrandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //����������
		var invoiceTranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //�������ԍ�
		var invoicedelivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //�������[�i��
		var invoiceTerms = defaultEmpty(invoiceRecord.getFieldText('terms'));    //�������x�������i���ߓ������j
		var invTersm = defaultEmpty(invoiceTerms.split('/'));
		var invTersmEng  = defaultEmpty(invTersm.slice(-1));
		var invTersmJap  = defaultEmpty(invTersm.slice(0,1));
//		nlapiLogExecution('DEBUG', 'invTersmJap',invTersmJap);
		var invoiceOtherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //�������������ԍ�
		var invoiceCreatedfrom = defaultEmpty(invoiceRecord.getFieldText('createdfrom'));    //�������󒍔ԍ�
		var incoicedelivery_destination = invoiceRecord.getFieldValue('custbody_djkk_delivery_destination');    //�������[�i��
		var incoicedelivery_Name = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_delivery_destination'));    //�������[�i�於�O
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
						new nlobjSearchColumn("custrecord_djkk_sales"),//�[�i��c��
							  
					]
					);	
			var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));
			var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));
			var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));
			var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));
			var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));
			var invdestinationSales = defaultEmpty(invDestinationSearch[0].getText('custrecord_djkk_sales'));
		}
	
		var invoiceCount = invoiceRecord.getLineItemCount('item');
		var invoiceAmountTotal = 0;
		var invoiceTaxamountTotal = 0;
		for(var k=1;k<invoiceCount+1;k++){
			invoiceRecord.selectLineItem('item',k);
			var invoiceItemId = invoiceRecord.getLineItemValue('item','item',k);			
			var invoiceItemSearch = nlapiSearchRecord("item",null,
					[
					 	["internalid","anyof",invoiceItemId],
					],
					[
					  new nlobjSearchColumn("vendorname"), //�d���揤�i�R�[�h
					  new nlobjSearchColumn("itemid"), //���i�R�[�h
					  new nlobjSearchColumn("displayname"), //���i��
					  new nlobjSearchColumn("custitem_djkk_storage_type"), //�݌ɋ敪
					  new nlobjSearchColumn("custitem_djkk_product_category_sml"), //�z�����x

					]
					); 
				
				var invoiceVendorName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("vendorname"));//�d���揤�i�R�[�h
				var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//���i�R�[�h
				var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//���i��
				var invoiceStorage_type= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getText("custitem_djkk_storage_type"));//�݌ɋ敪
				var invoiceDeliverytemptyp= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getText("custitem_djkk_product_category_sml"));//�z�����x
		
			
			var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//����
			var invoiceAmount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','amount',k)));//���z  
			if(!isEmpty(invoiceAmount)){
				var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');	
				invAmount  += invoiceAmount;
				var invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var invAmountFormat = '';
			}
			
			
			var invoiceTaxamount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','tax1amt',k)));//�Ŋz   
			if(!isEmpty(invoiceTaxamount)){
				var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				invTaxamount += invoiceTaxamount;
				var invTaxmountTotal = invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var invTaxamountFormat = '';
			}
			
				
			var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
			if(!isEmpty(invoTotal)){
				var invoToTotal = invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var invoToTotal ='';
			}
			
			
			var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//�P��
			var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//�P��
			//20221020 add by zhou 
			var invoiceUnitsArray;//�P��array
			var invoiceUnit;//�ύX��P��
			if(!isEmpty(invoiceLanguage)&&!isEmpty(invoiceUnitabbreviation)){
				var invoiceUnitSearch = nlapiSearchRecord("unitstype",null,
						[
						   ["abbreviation","is",invoiceUnitabbreviation]
						], 
						[
						   new nlobjSearchColumn("abbreviation")
						]
						); 
				if(invoiceUnitSearch != null){
					if(invoiceLanguage == '�p��'){			//�p��
						invoiceUnitabbreviation = invoiceUnitSearch[0].getValue('abbreviation')+'';
						invoiceUnitsArray = invoiceUnitabbreviation.split("/");
						if(invoiceUnitsArray.length == 2){
							invoiceUnit = invoiceUnitsArray[0];
						}
					}else if(invoiceLanguage == '���{��'){				//���{��
						invoiceUnitabbreviation = invoiceUnitSearch[0].getValue('abbreviation')+'';
						invoiceUnitsArray = invoiceUnitabbreviation.split("/");
						if(!isEmpty(invoiceUnitsArray)){
							invoiceUnit = invoiceUnitabbreviation[0];
						}else if(soUnitsArray.length == 0){
							invoiceUnit = invoiceUnitabbreviation;
						}
					}
				}
			}
			//end
			var invoiceTaxrate1Format = defaultEmpty(invoiceRecord.getLineItemValue('item','taxrate1',k));//�ŗ�
			invoiceItemArr.push({
				invoiceItemId:invoiceItemId,
				invoiceDeliverytemptyp:invoiceDeliverytemptyp,//�z�����x�敪
				invoiceVendorName:invoiceVendorName,//�d���揤�i�R�[�h
				invoiceInitemid:invoiceInitemid,//���i�R�[�h
				invoiceDisplayName:invoiceDisplayName,//���i��
				invoiceStorage_type:invoiceStorage_type,//�݌ɋ敪	
				invoiceQuantity:invoiceQuantity,//����
				invoiceAmount:invAmountFormat,//���z  
				invoiceTaxamount:invTaxamountFormat,//�Ŋz
				invoiceRateFormat:invoiceRateFormat,//�P��
				invoiceUnitabbreviation:defaultEmpty(invoiceUnit),//�P��
				invoiceTaxrate1Format:invoiceTaxrate1Format,//�ŗ�
			}); 
			var inventoryDetail=invoiceRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //�݌ɏڍ�
			if(!isEmpty(inventoryDetail)){
				var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');//�݌ɏڍ׍s
				if(inventoryDetailCount != 0){
					for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
						inventoryDetail.selectLineItem('inventoryassignment',j);
						var invReceiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//�V���A��/���b�g�ԍ�
						if(isEmpty(invReceiptinventorynumber)){
					    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//���b�g�ԍ�internalid
					    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
				                    [
				                       ["internalid","is",invReordId]
				                    ], 
				                    [
				                     	new nlobjSearchColumn("inventorynumber"),
				                    ]
				                    );    
					    	invoiceSerialnumber = inventorynumberSearch[0].getValue("inventorynumber");////�V���A��/���b�g�ԍ�
				    	}
						var invoiceExpirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //�L������
						invInventoryDetail.push({
							invoiceItemId:invoiceItemId,
							invoiceSerialnumber:invoiceSerialnumber,  //�V���A��/���b�g�ԍ�
							invoiceExpirationdate:invoiceExpirationdate, //�L������
						}); 
					}
				}
			}else{
				invInventoryDetail.push({
					invoiceSerialnumber:'',  //�V���A��/���b�g�ԍ�
					invoiceExpirationdate:'', //�L������
				}); 
			}
		}		
	}
	var pdfName = new Array();
	pdfName.push('��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��');
		
//	nlapiLogExecution('DEBUG', 'pdfName.length',pdfName.length);
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
	for(var a = 0;a<pdfName.length;a++){
		if(pdfName[a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��'){
			if(soLanguage == '�p��'){
				var bankName = 'Drawing Bank';
				if(pdfName[a] == 'Delivery Book'){
					var titleName = 'Delivery as follows.';
				}
				var dateName = 'Date';
				var deliveryName = 'Delivery Date:';
				var numberName = 'Number';
				var paymentName = 'Payment Terms:';
				var orderName = 'Order Number:';
				var codeName = 'Code';
				var poductName = 'Product Name';
				var quantityName = 'Quantity';
				var unitpriceName = 'Unit Price';
				var amountName = 'Amount';
				var tempName = 'Temperature';
				var expirationDateNmae = 'Expiration Date:';
				var orderNameTwo = 'Order Number:';
				var taxRate = 'Tax Rate';
				var taxAmount = 'TaxAmt';
				var totalName = 'Total';
				var consumptionTax = 'Consumption Tax';
				var invoiceNameString = 'Invoice';
				var deliName = 'Delivery';
			}else if(soLanguage == '���{��' || isEmpty(soLanguage)){
				var bankName = '�����s';
				if(pdfName[a] == '�[\xa0\xa0�i\xa0\xa0��'){
					var titleName = '���L�̒ʂ�[�i�v���܂��B';
				}
				var dateName = '��\xa0\xa0�t';
				var deliveryName = '�[�i���F';
				var numberName = '��\xa0\xa0��';
				var paymentName = '�x������:';
				var orderName = '�M�����ԍ�:';
				var codeName = '�R\xa0\xa0�[\xa0\xa0�h';
				var poductName = '�i\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0��';
				var quantityName = '��\xa0\xa0\xa0��';
				var unitpriceName = '�P\xa0\xa0\xa0��';
				var amountName = '��\xa0\xa0\xa0�z';
				var tempName = '�z�����x';
				var expirationDateNmae = '�L������:';
				var orderNameTwo = '�q�攭���ԍ�:';
				var taxRate = '�ŗ�';
				var taxAmount = '�Ŋz';
				var totalName = '��\xa0\xa0\xa0\xa0\xa0�v';
				var consumptionTax = '��\xa0\xa0��\xa0\xa0��';
				var invoiceNameString = '��\xa0��\xa0��\xa0�z';
				var deliName = '���͐�';
			}
		}else{
			var bankName = '�����s';
			var titleName = '���L�̒ʂ��̒v���܂��B';
			var dateName = '��\xa0\xa0�t';
			var deliveryName = '�[�i���F';
			var numberName = '��\xa0\xa0��';
			var paymentName = '�x������:';
			var orderName = '�M�����ԍ�:';
			var codeName = '�R\xa0\xa0�[\xa0\xa0�h';
			var poductName = '�i\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0��';
			var quantityName = '��\xa0\xa0\xa0��';
			var unitpriceName = '�P\xa0\xa0\xa0��';
			var amountName = '��\xa0\xa0\xa0�z';
			var tempName = '�z�����x';
			var expirationDateNmae = '�L������:';
			var orderNameTwo = '�q�攭���ԍ�:';
			var taxRate = '�ŗ�';
			var taxAmount = '�Ŋz';
			var totalName = '��\xa0\xa0\xa0\xa0\xa0�v';
			var consumptionTax = '��\xa0\xa0��\xa0\xa0��';
			var invoiceName = '��\xa0��\xa0��\xa0�z';
			var deliName = '���͐�';
		}
		if(pdfName[a] == '�[\xa0\xa0�i\xa0\xa0��' ||  pdfName[a] == 'Delivery Book' || pdfName[a] == '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��'){
			//�[�i�� && ���i��̏�PDF
			str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4">'+
			'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
			'<tr>'+
			'<td style="width: 330PX;">'+
			'<table>'+
			'<tr style="height: 20px;">'+
			'</tr>'+
			'<tr></tr>'+
			'<tr>'+
			'<td>��'+customerZipcode+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+customerState+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+customerCity+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+customerAddress+'</td>'+ 
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+attention+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td align="center">&nbsp;</td>'+
			'<td align="center">'+honorieicAppellation+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;Tel:'+phone+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;Fax:'+fax+'</td>'+
			'</tr>'+
			'</table>'+
			''+
			'</td>'+
			'<td>'+
			'<table style="border:1px solid black;">'+
			'<tr>'+
			'<td colspan="2" style="font-weight: bold;font-size:20px;width:55%;line-height:35px;">'+legalname+'</td>'+
			'<td colspan="2" style="width:45%;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" style="width:110px;height: 35px;" /></td>'+
			'</tr>'+
			'<tr>'+
			'</tr>'+
			'<tr>';
			if(pdfName [a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��'){
				if(soLanguage == '�p��'){
					str+='<td colspan="4">'+nameEng+'</td>';
				}else{
					str+='<td colspan="4">'+name+'</td>';
				}
			}else{
				str+='<td colspan="4">'+name+'</td>';
			}
			str+='</tr>'+
			'<tr>';
			if(pdfName [a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��'){
				if(soLanguage == '�p��'){
					str+='<td colspan="4" style="font-size:9px;">'+mainaddressEng+'</td>';
				}else{
					str+='<td colspan="4" style="font-size:10px;">��'+addressZip+address+city+address1+address2+'</td>';
				}
			}else{
				str+='<td colspan="4" style="font-size:10px;">��'+addressZip+address+city+address1+address2+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td colspan="4">'+bankName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+bankOne+'</td>'+
			'<td>&nbsp;'+branch_name1+'</td>'+
			'<td>�����a��</td>'+
			'<td>'+bank_no1+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+bankTwo+'</td>'+
			'<td>&nbsp;'+branch_name2+'</td>'+
			'<td>�����a��</td>'+
			'<td>'+bank_no2+'</td>'+
			'</tr>'+
			'</table>'+
			'</td>'+
			'</tr>'+
			'</table>'+
			'<table style="width: 660px;border:none">'+
			'<tr>'+
			'<td style="font-weight: bold;width:300px;font-size:18px;padding:14px 0" align="center">'+pdfName[a]+'</td>'+
			'<td style="font-weight:bold;padding:20px 0;width:210px;" align="right">'+titleName+'</td>'+
			'<td align="right"  colspan="2">'+
			'<table style="width:120px;height:40px;">'+
			'<tr>'+
			'<td style="border: 1px solid black;"></td>'+
			'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
			'<td style="border: 1px solid black;"></td>'+
			'</tr>'+
			'</table>'+
			'</td>'+
			'</tr>'+
			'</table>'+
			'<table style="width:660px;border: 2px solid rebeccapurple;margin-top: 10px;border-collapse:collapse;">'+
			'<tr>'+
			'<td style="width: 60px;color: white;background-color: black;padding-top:10px" rowspan="2">'+dateName+'</td>'+
			'<td style="width: 100px;border-right:1px solid black;">'+trandate+'</td>'+
			'<td align="left">'+deliveryName+'&nbsp;'+delivery_date+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="border-right:1px solid black;">&nbsp;</td>'+
			'<td></td>'+
			'</tr>'+
			'<tr>'+
			'<td style="width: 60px;border-top:1px solid white ;color: white;background-color: black;padding-top:10px" rowspan="2">'+numberName+'</td>'+
			'<td style="width: 100px;border-top:1px solid black;border-right:1px solid black;"></td>';
			if(pdfName[a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��'){
				if(soLanguage == '�p��'){
					str+='<td align="left">'+paymentName+'&nbsp;'+soTersmEng+'</td>';
				}else {
					str+='<td align="left">'+paymentName+'&nbsp;'+soTersmJap+'</td>';
				}
			}else{
				str+='<td align="left">'+paymentName+'&nbsp;'+soTersmJap+'</td>';
			}		
			str+='</tr>'+
			'<tr>'+
			'<td style="border-right:1px solid black;">'+tranid+'</td>'+
			'<td>'+orderName+'&nbsp;'+otherrefnum+'</td>'+
			'</tr>'+
			'</table>'+
			'<table  style="width: 660px; margin-top: 20px;" cellpadding="0" cellspacing="0">'+
			'<tr>'+
			'<td align="right">Page:<pagenumber/></td>'+
			'</tr>'+
			'</table>'+
			'<table  style="width: 660px;border:1px solid black;margin-top: 1px;" cellpadding="0" cellspacing="0">'+
			'<tr style="height:20px">'+
			'<td style="width: 85px;border-left: 1px solid black;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+codeName+'</td>'+
			'<td style="width: 273px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+poductName+'</td>'+
			'<td style="width: 73px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+quantityName+'</td>';
			if(pdfName[a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��'){	
				if(expressFlg == 'T'){
					str+='<td style="width: 105px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+unitpriceName+'</td>';
					str+='<td style="width: 72px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+amountName+'</td>';	
				}
				str+='<td style="width: 52px;border-left: 1px solid white;color: white;background-color: black;line-height:20px;font-size:8px;" align="center" >'+tempName+'</td>';
			}else{
				str+='<td style="width: 205px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">��̈�</td>';
			}
			str+='</tr>';
			for(var j =0; j < itemLineArr.length;j++){				
			str+='<tr>'+
			'<td style="border-left: 2px solid black;">'+
			'<table style="width:85px;">'+
			'<tr>'+
			'<td>'+itemLineArr[j].itemid+'</td>'+
			'</tr>'+
			'</table>'+
			'</td>'+	
			
			'<td style="border-left: 1px solid black;">'+
			'<table style="width:273px;">'+
			'<tr>'+
			'<td colspan="3" align="left">'+itemLineArr[j].displayname+'&nbsp;</td>'+
			'</tr>'+
			'<tr>';
			if(!isEmpty(itemLineArr[j].storage_type)){
				str+='<td colspan="3">�u'+itemLineArr[j].storage_type+'�v</td>';
			}else{
				str+='<td colspan="3">&nbsp;</td>';
			}
			str+='</tr>';
			for(var p = 0; p<inventoryDetailArr.length;p++ ){
				var soitem = inventoryDetailArr[p].itemId;
				if(soitem == itemLineArr[j].itemId){
					var serialnumbers = inventoryDetailArr[p].serialnumbers;  
					if(!isEmpty(serialnumbers)){
						str+='<tr>'+
						'<td style="width:83px;font-size:10px;">'+itemLineArr[j].vendorname+'</td>'+
						'<td style="width:132px;font-size:10px;" align="left">'+serialnumbers+'</td>'+
						'<td style="width:70px;font-size:10px;" align="right" >'+expirationDateNmae+'</td>'+
						'</tr>';
					}
				}
			}
			str+='</table>'+
			'</td>'+
			'<td style="border-left: 1px solid black;">'+
			'<table style="width:73px;">'+
			'<tr>'+
			'<td align="center" style="font-size:10px;">'+itemLineArr[j].quantity+'&nbsp;'+itemLineArr[j].unitabbreviation+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;</td>'+
			'</tr>';
			for(var p = 0; p<inventoryDetailArr.length;p++ ){
				var soitem = inventoryDetailArr[p].itemId;
				if(soitem == itemLineArr[j].itemId){
					var expirationdate = inventoryDetailArr[p].expirationdate;  
					str+='<tr>'; 
					if(!isEmpty(expirationdate)){
						str+='<td style="font-size:10px;">'+expirationdate+'</td>';
					}else{
						str+='<td style="font-size:10px;">&nbsp;</td>';
					}
					str+='</tr>';
				}
			}
			if(expressFlg == 'T' && pdfName[a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��'){
				str+='<tr>'+
				'<td align="right" style="font-size:10px;">'+taxRate+':</td>'+
				'</tr>';
			}
			str+='</table>'+
			'</td>';
			if(pdfName[a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��'){
				if(expressFlg == 'T'){
					str+='<td style="border-left: 1px solid black;">'+
						'<table style="width:105px;">'+
						'<tr>'+
						'<td colspan="2" align="center">&nbsp;'+itemLineArr[j].rateFormat+'</td>'+
						'</tr>'+
						'<tr>'+
						'<td colspan="2">&nbsp;</td>'+
						'</tr>';
					for(var p = 0; p<inventoryDetailArr.length;p++ ){
						var soitem = inventoryDetailArr[p].itemId;
						if(soitem == itemLineArr[j].itemId){
							str+='<tr>'+
							'<td colspan="2" style="border-bottom:none;font-size:10px;">&nbsp;</td>'+
							'</tr>';
						}
					}
						str+='<tr>'+
						'<td align="left" style="font-size:10px;">'+itemLineArr[j].taxrate1Format+'</td>'+
						'<td align="right" style="font-size:10px;">'+taxAmount+':</td>'+
						'</tr>'+
						'</table>'+
						'</td>';
					
					str+='<td style="border-left: 1px solid black;">'+
						'<table style="width:72px;">'+
						'<tr>'+
						'<td style="font-size:10px;" align="right">'+itemLineArr[j].amount+'</td>'+
						'</tr>'+
						'<tr>'+
						'<td>&nbsp;</td>'+
						'</tr>';
						for(var p = 0; p<inventoryDetailArr.length;p++ ){
							var soitem = inventoryDetailArr[p].itemId;
							if(soitem == itemLineArr[j].itemId){
								str+='<tr>'+
								'<td>&nbsp;</td>'+
								'</tr>';
							}
						}
						str+='<tr>'+
						'<td align="right" style="font-size:10px;">'+itemLineArr[j].taxamount+'</td>'+
						'</tr>'+
						'</table>'+
						'</td>';
				}	
				str+='<td style="border-left: 1px solid black;border-right: 2px solid black;width: 15px;">'+
				'<table style="width:52px;">'+
				'<tr>'+
				'<td style="font-size:8px;">'+itemLineArr[j].deliverytemptyp+'</td>'+
				'</tr>'+
				'</table>'+
				'</td>'+
				'</tr>';
			}else{
				str+='<td style="border-left: 1px solid black;">'+
				'</td>';
				str+='</tr>';		
			}
			}
			if(pdfName[a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��'){
				str+='<tr>'+
				'<td style="border-left: 2px solid black;"></td>'+
				'<td style="border-left: 1px solid black;padding-bottom:2px;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+otherrefnum+'</td>'+
				'<td style="border-left: 1px solid black;"></td>';
				if(expressFlg == 'T'){
					str+='<td style="border-left: 1px solid black;"></td>'+
					'<td style="border-left: 1px solid black;"></td>';
				}
				str+='<td style="border-left: 1px solid black;border-right: 2px solid black;"></td>'+
				'</tr>';
			}else{
				str+='<tr>'+
				'<td style="border-left: 2px solid black;"></td>'+
				'<td style="border-left: 1px solid black;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+otherrefnum+'</td>'+
				'<td style="border-left: 1px solid black;"></td>'+
				'<td style="border-left: 1px solid black;">'+
				'<table style="width:205px;height:70px;">'+
				'<tr>'+
				'<td align="center">�N&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��</td>'+
				'</tr>'+
				'<tr>'+
				'<td align="center">&nbsp;</td>'+
				'</tr>'+
				'<tr>'+
				'<td align="center">��̂������܂����B</td>'+
				'</tr>'+
				'</table>'+
				'</td>'+
				'</tr>';
			}

			str+='</table>'+
			'<table style="border-top:2px solid black;width: 660px;" >'+
			'<tr>'+
			'<td style="width:420px;"></td>';
			if(pdfName[a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��' && expressFlg == 'T'){
				str+='<td style="width: 80px;height:30px;background-color: black;color: white;padding-top:15px;font-size:8px;" align="center">'+totalName+'</td>'+
				'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+amountTotal+'</td>';
			}
			str+='</tr>'+	
			'<tr>'+
			'<td style="width:470px;">&nbsp;&nbsp;'+deliName+':'+destinationName+'</td>';
			if(pdfName[a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��' && expressFlg == 'T'){
				str+='<td style="width: 80px;height:30px;background-color: black;padding-top:15px;color: white;border-top:1px solid white;font-size:8px;" align="center">'+consumptionTax+'</td>'+
				'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+taxamountTotal+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td>'+
			'<table>';
			if(!isEmpty(destinationSales)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+destinationSales+'</td>'+
				'</tr>';	
			}
			if(!isEmpty(destinationZip)&& !isEmpty(destinationState)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��'+destinationZip+'&nbsp; '+destinationState+'</td>'+
				'</tr>';
			}
			str+='</table>'+
			'</td>';
			if(pdfName[a] != '��\xa0\xa0�i\xa0\xa0��\xa0\xa0��\xa0\xa0��' && expressFlg == 'T'){
				str+='<td style="width: 80px;height:30px;background-color: black;padding-top:15px;color: white;border-top:1px solid white;border-bottom:2px solid black;font-size:8px;" align="center">'+invoiceNameString+'</td>'+
				'<td style="width: 30px;height:30px;padding-top:25px;border:1px solid black;border-bottom:2px solid black" align="left">'+pocurrencyMoney+'</td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;border-bottom:2px solid black;" align="center">'+toTotal+'</td>';
			}
			str+='</tr>';
			if(!isEmpty(destinationCity)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+destinationCity+'</td>'+
				'</tr>';
			}
			if(!isEmpty(destinationAddress2) || !isEmpty(destinationAddress)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+destinationAddress+destinationAddress2+'</td>'+
				'</tr>';
			}
			
			str+='</table>';
			str+='</body>';
		}else{
			if(invoiceLanguage == '�p��'){
				var bankName = 'Drawing Bank';
				if(pdfName[a] == 'Invoice Book(Refrain)' || pdfName[a] == 'Invoice Book' || pdfName[a] == 'Invoice Book(Manager Refrain)'){
					var titleName = 'I request you as follows.';
				}

				var dateName = 'Date';
				var deliveryName = 'Delivery Date:';
				var numberName = 'Number';
				var paymentName = 'Payment Terms:';
				var orderName = 'Order Number:';
				var codeName = 'Code';
				var poductName = 'Product Name';
				var quantityName = 'Quantity';
				var unitpriceName = 'Unit Price';
				var amountName = 'Amount';
				var tempName = 'Temperature';
				var expirationDateNmae = 'Expiration Date:';
				var orderNameTwo = 'Order Number:';
				var taxRate = 'Tax Rate';
				var taxAmount = 'TaxAmt';
				var totalName = 'Total';
				var consumptionTax = 'Consumption Tax';
				var invoiceNameString = 'Invoice';
				var deliName = 'Delivery';
			}else if(invoiceLanguage == '���{��' || isEmpty(invoiceLanguage)){
				var bankName = '�����s';
				if(pdfName[a] == '��\xa0\xa0��\xa0\xa0��(�T)' || pdfName == '��\xa0\xa0��\xa0\xa0��' || pdfName == '��\xa0\xa0��\xa0\xa0��(�o���T)'){
					var titleName = '���L�̒ʂ育�����\���グ�܂��B';
				}
				var dateName = '��\xa0\xa0�t';
				var deliveryName = '�[�i���F';
				var numberName = '��\xa0\xa0��';
				var paymentName = '�x������:';
				var orderName = '�M�����ԍ�:';
				var codeName = '�R\xa0\xa0�[\xa0\xa0�h';
				var poductName = '�i\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0��';
				var quantityName = '��\xa0\xa0\xa0��';
				var unitpriceName = '�P\xa0\xa0\xa0��';
				var amountName = '��\xa0\xa0\xa0�z';
				var tempName = '�z�����x';
				var expirationDateNmae = '�L������:';
				var orderNameTwo = '�q�攭���ԍ�:';
				var taxRate = '�ŗ�';
				var taxAmount = '�Ŋz';
				var totalName = '��\xa0\xa0\xa0\xa0\xa0�v';
				var consumptionTax = '��\xa0\xa0��\xa0\xa0��';
				var invoiceNameString = '��\xa0��\xa0��\xa0�z';
				var deliName = '���͐�';
			}
			//������PDF
			str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4">'+
			'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
			'<tr>'+
			'<td style="width: 330PX;">'+
			'<table>'+
			'<tr style="height: 20px;">'+
			'</tr>'+
			'<tr></tr>'+
			'<tr>'+
			'<td>��'+invoiceZipcode+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceState+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceCity+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceAddress2+'</td>'+ 
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceAddress1+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td align="center">&nbsp;</td>'+
			'<td align="center">'+honorieicAppellation+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;Tel:'+invoicePhone+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;Fax:'+invoiceFax+'</td>'+
			'</tr>'+
			'</table>'+
			''+
			'</td>'+
			'<td>'+
			'<table style="border:1px solid black;">'+
			'<tr>'+
			'<td colspan="2" style="font-weight: bold;font-size:20px;width:55%;line-height:35px;">'+invoiceLegalname+'</td>'+
			'<td colspan="2" style="width:45%;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" style="width:110px;height: 35px;" /></td>'+
			'</tr>'+
			'<tr>'+
			'</tr>'+
			'<tr>';
			if(invoiceLanguage == '�p��'){
				str+='<td colspan="4">'+invoiceNameEng+'</td>';
			}else{
				str+='<td colspan="4">'+invoiceName+'</td>';
			}
			str+='</tr>'+
			'<tr>';
			if(invoiceLanguage == '�p��'){
				str+='<td colspan="4" style="font-size:9px;">'+invoiceAddressEng+'</td>';
			}else{
				str+='<td colspan="4" style="font-size:10px;">��'+invoiceAddressZip+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td colspan="4">'+bankName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceBankOne+'</td>'+
			'<td>&nbsp;'+invbranch_name1+'</td>'+
			'<td>�����a��</td>'+
			'<td>'+invbank_no1+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceBankTwo+'</td>'+
			'<td>&nbsp;'+invbranch_name2+'</td>'+
			'<td>�����a��</td>'+
			'<td>'+invbank_no2+'</td>'+
			'</tr>'+
			'</table>'+
			'</td>'+
			'</tr>'+
			'</table>'+
			'<table style="width: 660px;border:none">'+
			'<tr>'+
			'<td style="font-weight: bold;width:300px;font-size:18px;padding:14px 0" align="center">'+pdfName[a]+'</td>'+
			'<td style="font-weight:bold;padding:20px 0;width:210px;" align="right">'+titleName+'</td>'+
			'<td align="right"  colspan="2">'+
			'<table style="width:120px;height:40px;">'+
			'<tr>'+
			'<td style="border: 1px solid black;"></td>'+
			'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
			'<td style="border: 1px solid black;"></td>'+
			'</tr>'+
			'</table>'+
			'</td>'+
			'</tr>'+
			'</table>'+
			'<table style="width:660px;border: 2px solid rebeccapurple;margin-top: 10px;border-collapse:collapse;">'+
			'<tr>'+
			'<td style="width: 60px;color: white;background-color: black;padding-top:10px" rowspan="2">'+dateName+'</td>'+
			'<td style="width: 100px;border-right:1px solid black;">'+invoiceTrandate+'</td>'+
			'<td align="left">'+deliveryName+'&nbsp;'+invoicedelivery_date+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="border-right:1px solid black;">&nbsp;</td>'+
			'<td></td>'+
			'</tr>'+
			'<tr>'+
			'<td style="width: 60px;border-top:1px solid white ;color: white;background-color: black;padding-top:10px" rowspan="2">'+numberName+'</td>'+
			'<td style="width: 100px;border-top:1px solid black;border-right:1px solid black;"></td>';
			if(invoiceLanguage == '�p��'){
				str+='<td align="left">'+paymentName+'&nbsp;'+invTersmEng+'</td>';
			}else{
				str+='<td align="left">'+paymentName+'&nbsp;'+invTersmJap+'</td>';
			}		
			str+='</tr>'+
			'<tr>'+
			'<td style="border-right:1px solid black;">'+invoiceTranid+'</td>'+
			'<td>'+orderName+'&nbsp;'+invoiceOtherrefnum+'</td>'+
			'</tr>'+
			'</table>'+
			'<table  style="width: 660px; margin-top: 20px;" cellpadding="0" cellspacing="0">'+
			'<tr>'+
			'<td align="right">Page:<pagenumber/></td>'+
			'</tr>'+
			'</table>'+
			'<table  style="width: 660px; margin-top:1px;border:1px solid black;" cellpadding="0" cellspacing="0">'+
			'<tr style="height:20px">'+
			'<td style="width: 85px;border-left: 1px solid black;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+codeName+'</td>'+
			'<td style="width: 273px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+poductName+'</td>'+
			'<td style="width: 70px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+quantityName+'</td>'+	
			'<td style="width: 105px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+unitpriceName+'</td>'+
			'<td style="width: 75px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+amountName+'</td>'+	
			'<td style="width: 52px;border-left: 1px solid white;color: white;background-color: black;line-height:20px;font-size:8px;" align="center" >'+tempName+'</td>'+
			'</tr>';
			for(var j =0; j < invoiceItemArr.length;j++){
			str+='<tr>'+
			'<td style="border-left: 2px solid black;">'+
			'<table style="width:85px;">'+
			'<tr>'+
			'<td>'+invoiceItemArr[j].invoiceInitemid+'</td>'+
			'</tr>'+
			'</table>'+
			'</td>'+	
			
			'<td style="border-left: 1px solid black;">'+
			'<table style="width:273px;">'+
			'<tr>'+
			'<td colspan="3" align="left">'+invoiceItemArr[j].invoiceDisplayName+'</td>'+
			'</tr>'+
			'<tr>';
			if(!isEmpty(itemLineArr[j].storage_type)){
				str+='<td colspan="3">�u'+invoiceItemArr[j].invoiceStorage_type+'�v</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td style="width:80px;font-size:10px;">'+invoiceItemArr[j].invoiceVendorName+'</td>'+
			'<td style="width:135px;font-size:10px;" align="left" >'+invInventoryDetail[j].invoiceSerialnumber+'</td>'+
			'<td style="width:70px;font-size:10px;" align="right" >'+expirationDateNmae+'</td>'+
			'</tr>'+
			'</table>'+
			'</td>'+
			
			'<td style="border-left: 1px solid black;">'+
			'<table style="width:70px;">'+
			'<tr>'+
			'<td align="center">'+invoiceItemArr[j].invoiceQuantity+'&nbsp;'+invoiceItemArr[j].invoiceUnitabbreviation+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="font-size:10px;">&nbsp;'+invInventoryDetail[j].invoiceExpirationdate+'</td>'+	
			'</tr>'+
			'<tr>'+
			'<td align="right" style="font-size:10px;">'+taxRate+':</td>'+
			'</tr>'+
			'</table>'+
			'</td>';
			str+='<td style="border-left: 1px solid black;">'+
			'<table style="width:105px;">'+
			'<tr>'+
			'<td colspan="2" align="center">&nbsp;'+invoiceItemArr[j].invoiceRateFormat+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;</td>'+
			'</tr>'+
			'<tr>'+
			'<td align="left" style="padding-top:3px;font-size:10px;">'+invoiceItemArr[j].invoiceTaxrate1Format+'</td>'+
			'<td align="right" style="font-size:10px;padding-top:3px;">'+taxAmount+':</td>'+
			'</tr>'+
			'</table>'+
			'</td>';
			
			str+='<td style="border-left: 1px solid black;">'+
			'<table style="width:75px;">'+
			'<tr>'+
			'<td style="font-size:10px;" align="right">'+invoiceItemArr[j].invoiceAmount+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;</td>'+
			'</tr>'+
			'<tr>'+
			'<td align="right" style="font-size:10px;" >'+invoiceItemArr[j].invoiceTaxamount+'</td>'+
			'</tr>'+
			'</table>'+
			'</td>';
			str+='<td style="border-left: 1px solid black;border-right: 2px solid black;width: 15px;">'+
			'<table style="width:52px;">'+
			'<tr>'+
			'<td style="font-size:8px;">'+invoiceItemArr[j].invoiceDeliverytemptyp+'</td>'+
			'</tr>'+
			'</table>'+
			'</td>';
			str+='</tr>';
			}
			str+='<tr>'+
			'<td style="border-left: 2px solid black;"></td>'+
			'<td style="border-left: 1px solid black;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+invoiceOtherrefnum+'</td>'+
			'<td style="border-left: 1px solid black;"></td>'+
			'<td style="border-left: 1px solid black;"></td>'+
			'<td style="border-left: 1px solid black;"></td>'+
			'<td style="border-left: 1px solid black;border-right: 2px solid black;"></td>'+
			'</tr>';
			
			
			str+='</table>'+
			'<table style="border-top:2px solid black;width: 660px;" >'+
			'<tr>'+
			'<td style="width:420px;"></td>'+
			'<td style="width: 80px;height:30px;background-color: black;color: white;padding-top:15px;font-size:8px;" align="center">'+totalName+'</td>'+
			'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
			'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+invoAmountTotal+'</td>';
			
			str+='</tr>'+	
			'<tr>'+
			'<td style="width:470px;">&nbsp;&nbsp;'+deliName+':'+incoicedelivery_Name+'</td>'+
			'<td style="width: 80px;height:30px;background-color: black;padding-top:15px;color: white;border-top:1px solid white;font-size:8px;" align="center">'+consumptionTax+'</td>'+
			'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
			'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+invTaxmountTotal+'</td>';
			
			str+='</tr>'+
			'<tr>'+
			'<td>'+
			'<table>';
			if(!isEmpty(invdestinationSales)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationSales+'</td>'+
				'</tr>';	
			}
			if(!isEmpty(invdestinationZip)&& !isEmpty(invdestinationState)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��'+invdestinationZip+'&nbsp; '+invdestinationState+'</td>'+
				'</tr>';
			}
			str+='</table>'+
			'</td>'+
			'<td style="width: 80px;height:30px;background-color: black;padding-top:15px;color: white;border-top:1px solid white;font-size:8px;border-bottom:2px solid black" align="center">'+invoiceNameString+'</td>'+
			'<td style="width: 30px;height:30px;padding-top:25px;border:1px solid black;border-bottom:2px solid black" align="left">'+pocurrencyMoney+'</td>'+
			'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;border-bottom:2px solid black" align="center">'+invoToTotal+'</td>';
			
			str+='</tr>';
			if(!isEmpty(invdestinationCity)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationCity+'</td>'+
				'</tr>';
			}
			if(!isEmpty(invdestinationAddress)|| !isEmpty(invdestinationAddress2)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationAddress+invdestinationAddress2+'</td>'+
				'</tr>';
			}
			
			str+='</table>';
			str+='</body>';
		}
	}
	str += '</pdf>';
	var renderer = nlapiCreateTemplateRenderer();
	renderer.setTemplate(str);
	var xml = renderer.renderToString();
	var xlsFile = nlapiXMLToPDF(xml);
	// PDF
	xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
	xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
	xlsFile.setIsOnline(true);
	// save file
	var fileID = nlapiSubmitFile(xlsFile);
	var fl = nlapiLoadFile(fileID);  
	var url= URL_HEAD +'/'+fl.getURL();
	nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
	
}

function defaultEmpty(src){
	return src || '';
}
function defaultEmptyToZero(src){
	return src || 0;
}
function transfer(text){
	if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

return text ;
}