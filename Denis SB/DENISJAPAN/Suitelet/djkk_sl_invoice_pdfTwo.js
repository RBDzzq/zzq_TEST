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
	//注文書の値
try{	
	var soID = request.getParameter('salesorderid'); //soID
	var itemLineArr = new Array();
	var inventoryDetailArr = new Array();
	var amountTota = 0;
	var taxamountTota = 0;
	
	var roleId = nlapiGetUser();
	var employee = nlapiLoadRecord('employee',roleId)
	var roleSub = defaultEmpty(employee.getFieldValue('subsidiary'));

	
	
	var soRecord = nlapiLoadRecord('salesorder',soID);
	//line24 add by zhou 
	var entity = soRecord.getFieldValue('entity');//顧客
	var customform = soRecord.getFieldValue('customform');//customform
	var customerSearch= nlapiSearchRecord("customer",null,
			[
				["internalid","anyof",entity]
			], 
			[
			 	new nlobjSearchColumn("custrecord_djkk_honorific_appellation","billingAddress",null), //DJ_敬称
			 	new nlobjSearchColumn("address1","billingAddress",null), //請求先住所1
		    	new nlobjSearchColumn("address2","billingAddress",null), //請求先住所2
		    	new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
		    	new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
		    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県 		
		    	new nlobjSearchColumn("addressphone","billingAddress",null), //電話番号
		    	new nlobjSearchColumn("custrecord_djkk_address_fax","billingAddress",null), //Fax
		    	new nlobjSearchColumn("custentity_djkk_language"),  //言語
		    	new nlobjSearchColumn("custentity_djkk_reference_express"),  //金額表示flg
		    	new nlobjSearchColumn("custentity_djkk_delivery_express"),  //表示flg
			]
			);	
	var honorieicAppellation = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custrecord_djkk_honorific_appellation","billingAddress",null));//DJ_敬称
	if(honorieicAppellation){
		honorieicAppellation = '';
	}
	var attention= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//請求先住所2
	var customerAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address1","billingAddress",null));//請求先住所1
	var customerCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//請求先市区町村
	var customerZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//請求先郵便番号
	var customerState= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//請求先都道府県 
	var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("addressphone","billingAddress"));//請求先電話番号
	var fax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_fax","billingAddress"));//請求先fax
	// add by zzq start
//	var soLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_language"));//言語
	var soLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_language"));//言語
	// add by zzq end
	var expressFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_reference_express"));//金額表示flg
	var deliveryFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_delivery_express"));//表示flg
	
	var subsidiary = soRecord.getFieldValue('subsidiary');//子会社
	var subsidiarySearch= nlapiSearchRecord("subsidiary",null,
			[
				["internalid","anyof",subsidiary]
			], 
			[
				new nlobjSearchColumn("legalname"),  //正式名称
				new nlobjSearchColumn("name"), //名前
				new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
				new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
				new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
				new nlobjSearchColumn("address1","address",null), //住所1
				new nlobjSearchColumn("address2","address",null), //住所2
				new nlobjSearchColumn("city","address",null), //市区町村
				new nlobjSearchColumn("zip","address",null), //郵便番号
				new nlobjSearchColumn("custrecord_djkk_bank_1"), //銀行1
				new nlobjSearchColumn("custrecord_djkk_bank_2"), //銀行2
					  
			]
			);		
	var legalname= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("legalname"));//正式名称
	var nameString= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("name"));//名前
	var nameStringTwo = nameString.split(":");
	var name = nameStringTwo.slice(-1);
	var address= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
	var city= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("city","address",null));//市区町村
	var bankOne= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_1"));//銀行1
	var bankTwo= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_2"));//銀行2
	var addressZip= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("zip","address",null));//郵便番号
	var nameEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
	var mainaddressEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//住所英語
	var address1= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address1","address",null));//住所1
	var address2= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address2","address",null));//住所2
	var bankOneId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_1"));//銀行1
	var bankTwoId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_2"));//銀行2
//	nlapiLogExecution('DEBUG', 'bankOneId',bankOneId);
	if(!isEmpty(bankOneId)){
		var bank1 = nlapiLoadRecord('customrecord_djkk_bank', bankOneId);
		var branch_name1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_支店名
		var bank_no1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));//DJ_口座番号
	}else{
		var branch_name1 = '';
		var bank_no1 = '';
	}
	if(!isEmpty(bankTwoId)){
		var bank2 = nlapiLoadRecord('customrecord_djkk_bank', bankTwoId);
		var branch_name2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_支店名
		var bank_no2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));//DJ_口座番号
	}else{
		var branch_name2 = '';
		var bank_no2 ='';
	}
	
//	nlapiLogExecution('DEBUG', 'hellow','hellow');
	var trandate = defaultEmpty(soRecord.getFieldValue('trandate'));//日付
	var delivery_date = defaultEmpty(soRecord.getFieldValue('custbody_djkk_delivery_date'));//DJ_納品日
	var tranid = defaultEmpty(soRecord.getFieldValue('tranid'));//注文番号
	var terms = defaultEmpty(soRecord.getFieldText('terms'));//支払条件（締め日無し）
	var soTersm = defaultEmpty(terms.split('/'));
	var soTersmJap = defaultEmpty(soTersm.slice(0,1));
	var soTersmEng  = defaultEmpty(soTersm.slice(-1));
//	nlapiLogExecution('DEBUG', 'soTersmJap',soTersmJap);
//	nlapiLogExecution('DEBUG', 'soTersmEng',soTersmEng);
	var otherrefnum = defaultEmpty(soRecord.getFieldValue('otherrefnum'));//発注書番号   20230425 changed by zhou 
	var destination = soRecord.getFieldValue('custbody_djkk_delivery_destination');//DJ_納品先	
	var destinationName = defaultEmpty(soRecord.getFieldText('custbody_djkk_delivery_destination'));//DJ_納品先名前
	if(!isEmpty(destination)){	
		var destinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
				[
					["internalid","anyof",destination]
				], 
				[
					new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
					new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
					new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
					new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
					new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
					new nlobjSearchColumn("custrecord_djkk_sales"),//納品先営業
						  
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
	var receiptnoteFlag = 'F';
	for(var a=1;a<soCount+1;a++){
		soRecord.selectLineItem('item',a);
		var itemId = soRecord.getLineItemValue('item','item',a);	
		var line = soRecord.getLineItemValue('item','line',a);	
		var lineOtherrefnum = defaultEmpty(soRecord.getLineItemValue('item','custcol_djkk_customer_order_number', a));//明細行 DJ_顧客の発注番号   20230425 changed by zhou
		var ItemSearch = nlapiSearchRecord("item",null,
				[
				 	["internalid","anyof",itemId],
				],
				[
				  new nlobjSearchColumn("vendorname"), //仕入先商品コード
				  new nlobjSearchColumn("itemid"), //商品コード
				  new nlobjSearchColumn("displayname"), //商品名
				  new nlobjSearchColumn("custitem_djkk_storage_type"), //在庫区分
				  new nlobjSearchColumn("custitem_djkk_product_category_sml"), //配送温度
				]
				); 
			
			var vendorname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("vendorname"));//仕入先商品コード
			var itemid= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("itemid"));//商品コード
			var displayname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("displayname"));//商品名
			var storage_type= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_storage_type"));//在庫区分
			var deliverytemptyp= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_product_category_sml"));//配送温度

		var receiptnote = soRecord.getLineItemValue('item', 'custcol_djkk_receipt_printing', a);//DJ_受領書印刷flag
		if(receiptnote == 'T'){
			receiptnoteFlag = 'T';
		}
		var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//数量
		
		var amount = defaultEmptyToZero(parseFloat(soRecord.getLineItemValue('item', 'amount', a)));//金額
		if(!isEmpty(amount)){
			var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];		
			amountTota += amount;
			var amountTotal = amountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
		}else{
			var amountFormat = '';
		}

		
		var taxamount = defaultEmpty(parseFloat(soRecord.getLineItemValue('item','tax1amt',a)));//税額   

		if(!isEmpty(taxamount)){
			var taxamountFormat = taxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
			taxamountTota += taxamount;
			var taxamountTotal = taxamountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
		}else{
			var taxamountFormat = '';
		}
	

		var rateFormat= defaultEmpty(soRecord.getLineItemValue('item','rate',a));//単価
		if (!isEmpty(rateFormat)) {
		    rateFormat = Number(rateFormat).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
		}
		
		var total = defaultEmpty(Number(amountTota+taxamountTota));
		if(!isEmpty(total)){
			var toTotal = total.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
		}else{
			var toTotal = '';
		}
		//20221020 add by zhou 
		var unitabbreviation = defaultEmpty(soRecord.getLineItemValue('item','units_display',a));//単位
		
		var soUnitsArray;//単位array
		var soUnit;//変更後単位
		if(!isEmpty(soLanguage)&&!isEmpty(unitabbreviation)&&customform == 121){
			var unitSearch = nlapiSearchRecord("unitstype",null,
					[
					   ["abbreviation","is",unitabbreviation]
					], 
					[
					   new nlobjSearchColumn("abbreviation")
					]
					);
			if(unitSearch != null){
				// add by zzq start
//				if(soLanguage == '英語'){			//英語
				if(soLanguage == LANGUAGE_EN){			//英語
				// add by zzq end
					unitabbreviation = unitSearch[0].getValue('abbreviation')+'';
					soUnitsArray = unitabbreviation.split("/");
					if(soUnitsArray.length == 2){
						soUnit = soUnitsArray[1];
					}
					// add by zzq start
//				}else if(soLanguage == '日本語'){				//日本語
				}else if(soLanguage == LANGUAGE_JP){				//日本語
					// add by zzq end
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
		var taxrate1Format = defaultEmpty(soRecord.getLineItemValue('item','taxrate1',a));//税率   //
		var pocurrency = transfer(defaultEmpty(soRecord.getLineItemValue('item','pocurrency',a)));//通貨
		if(pocurrency == 'JPY'){
			var pocurrencyMoney = '￥';
		}else if(pocurrency == 'USD'){
			var pocurrencyMoney = '$';
		}else{
			var pocurrencyMoney = '';
		}
		

		itemLineArr.push({
			receiptnoteFlag:receiptnoteFlag,
			lineOtherrefnum:lineOtherrefnum,//明細行 DJ_顧客の発注番号   20230425 changed by zhou
			receiptnote:receiptnote,//DJ_受領書印刷flag
			vendorname:vendorname,//仕入先商品コード
			itemid:itemid,//商品コード
			displayname:displayname,//商品名
			storage_type:storage_type,//在庫区分
			quantity:quantity,//数量
			amount:amountFormat,//金額  
			taxamount:taxamountFormat,//税額 
			rateFormat:rateFormat,//単価
			unitabbreviation:defaultEmpty(soUnit),//単位
			taxrate1Format:taxrate1Format,//税率
			deliverytemptyp:deliverytemptyp,//配送温度区分
			line:line,
		}); 
		var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //在庫詳細
		if(!isEmpty(inventoryDetail)){
			var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
			if(inventoryDetailCount != 0){
				for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
					inventoryDetail.selectLineItem('inventoryassignment',j);
					var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
					if(isEmpty(receiptinventorynumber)){
				    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
			                    [
			                       ["internalid","is",invReordId]
			                    ], 
			                    [
			                     	new nlobjSearchColumn("inventorynumber"),
			                    ]
			                    );    
				    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////シリアル/ロット番号	
			    	}
					var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //有效期限	
					inventoryDetailArr.push({
							line:line,
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
	
//	//請求書の値
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
		var invoiceRecord = nlapiLoadRecord('invoice',invoiceId);   //請求書
		var invoiceEntity = invoiceRecord.getFieldValue('entity')    //請求書顧客	
		var incustomerSearch= nlapiSearchRecord("customer",null,
			[
				["internalid","anyof",invoiceEntity]
			], 
			[
			 	new nlobjSearchColumn("address1","billingAddress",null), //請求先住所1
    			new nlobjSearchColumn("address2","billingAddress",null), //請求先住所2
    			new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
    			new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
    			new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県 		
    			new nlobjSearchColumn("addressphone","billingAddress",null), //電話番号
    			new nlobjSearchColumn("custrecord_djkk_address_fax","billingAddress",null), //Fax
    			new nlobjSearchColumn("custentity_djkk_language"),  //言語
			]
			);	
		var invoiceAddress2= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("address2","billingAddress",null));//請求先住所 1
		var invoiceAddress1= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("address1","billingAddress",null));//請求先住所2
		var invoiceCity= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("city","billingAddress",null));//請求先市区町村
		var invoiceZipcode= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("zipcode","billingAddress",null));//請求先郵便番号
		var invoiceState= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//請求先都道府県 
		var invoicePhone= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("addressphone","billingAddress"));//電話番号
		var invoiceFax= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("custrecord_djkk_address_fax","billingAddress"));//fax
		// add by zzq start
//		var invoiceLanguage= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getText("custentity_djkk_language"));//請求書言語
		var invoiceLanguage= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("custentity_djkk_language"));//請求書言語
		// add by zzq end
		
		var invoiceSubsidiary = invoiceRecord.getFieldValue('subsidiary')    //請求書子会社
		var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
			[
				["internalid","anyof",invoiceSubsidiary]
			], 
			[
				new nlobjSearchColumn("legalname"),  //正式名称
				new nlobjSearchColumn("name"), //名前
				new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
				new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
				new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
				new nlobjSearchColumn("address1","address",null), //住所1
				new nlobjSearchColumn("address2","address",null), //住所2
				new nlobjSearchColumn("city","address",null), //市区町村
				new nlobjSearchColumn("zip","address",null), //郵便番号
				new nlobjSearchColumn("custrecord_djkk_bank_1"), //銀行1
				new nlobjSearchColumn("custrecord_djkk_bank_2"), //銀行2
				//20230511 add by zhou DENISJAPAN-759 start	
				new nlobjSearchColumn("custrecord_djkk_invoice_issuer_number"),//適格請求書発行事業者番号
				//20230511 add by zhou DENISJAPAN-759 end
			]
			);	
		var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//正式名称
		var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//名前
		var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address1","address",null));//住所1
		var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//住所2
		var invoiceBankOne= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getText("custrecord_djkk_bank_1"));//銀行1
		var invoiceBankTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getText("custrecord_djkk_bank_2"));//銀行2
		var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//郵便番号
		var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//市区町村
		var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
		var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
		var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//名前英語
		var invoiceBankOneId= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_1"));//銀行1
		var invoiceBankTwoId= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_2"));//銀行2
		//20230511 add by zhou DENISJAPAN-759 start	
		var invoiceIssuerNumber= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_invoice_issuer_number"));//適格請求書発行事業者番号
		//20230511 add by zhou DENISJAPAN-759 end
		
		if(!isEmpty(invoiceBankOneId)){
			var invoiceBank1 = nlapiLoadRecord('customrecord_djkk_bank', invoiceBankOneId);
			var invbranch_name1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_支店名
			var invbank_no1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_no'));//DJ_口座番号
			//20230511 add by zhou DENISJAPAN-759 start	
			var bankType1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_type'));//DJ_口座種別
			var bankNam1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_name'));//DJ_銀行名
			//20230511 add by zhou DENISJAPAN-759 end
		}
		if(!isEmpty(invoiceBankTwoId)){
			var invoiceBank2 = nlapiLoadRecord('customrecord_djkk_bank', invoiceBankTwoId);
			var invbranch_name2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_支店名
			var invbank_no2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_no'));//DJ_口座番号
			//20230511 add by zhou DENISJAPAN-759 start	
			var bankType2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_type'));//DJ_口座種別
			var bankNam2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_name'));//DJ_銀行名
			//20230511 add by zhou DENISJAPAN-759 end
		}

			
		
		var invoiceTrandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //請求書期日
		var invoiceTranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //請求書番号
		var invoicedelivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //請求書納品日
		var invoiceTerms = defaultEmpty(invoiceRecord.getFieldText('terms'));    //請求書支払条件（締め日無し）
		var invTersm = defaultEmpty(invoiceTerms.split('/'));
		var invTersmEng  = defaultEmpty(invTersm.slice(-1));
		var invTersmJap  = defaultEmpty(invTersm.slice(0,1));
//		nlapiLogExecution('DEBUG', 'invTersmJap',invTersmJap);
		var invoiceOtherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //請求書発注書番号
		var invoiceCreatedfrom = defaultEmpty(invoiceRecord.getFieldText('createdfrom'));    //請求書受注番号
		var incoicedelivery_destination = invoiceRecord.getFieldValue('custbody_djkk_delivery_destination');    //請求書納品先
		var incoicedelivery_Name = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_delivery_destination'));    //請求書納品先名前
		if(!isEmpty(incoicedelivery_destination)){	
			
			var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
					[
						["internalid","anyof",incoicedelivery_destination]
					], 
					[
						new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
						new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
						new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
						new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
						new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
						new nlobjSearchColumn("custrecord_djkk_sales"),//納品先営業
							  
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
			var lineInvoiceOtherrefnum = defaultEmpty(invoiceRecord.getLineItemValue('item','custcol_djkk_customer_order_number',k));//明細行 DJ_顧客の発注番号   20230425 changed by zhou
			var invoiceLine = invoiceRecord.getLineItemValue('item','line',k);	
			var invoiceItemSearch = nlapiSearchRecord("item",null,
					[
					 	["internalid","anyof",invoiceItemId],
					],
					[
					  new nlobjSearchColumn("vendorname"), //仕入先商品コード
					  new nlobjSearchColumn("itemid"), //商品コード
					  new nlobjSearchColumn("displayname"), //商品名
					  new nlobjSearchColumn("custitem_djkk_storage_type"), //在庫区分
					  new nlobjSearchColumn("custitem_djkk_product_category_sml"), //配送温度

					]
					); 
				
				var invoiceVendorName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("vendorname"));//仕入先商品コード
				var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//商品コード
				var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
				var invoiceStorage_type= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getText("custitem_djkk_storage_type"));//在庫区分
				var invoiceDeliverytemptyp= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getText("custitem_djkk_product_category_sml"));//配送温度
		
			
			var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//数量
			var invoiceAmount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','amount',k)));//金額  
			if(!isEmpty(invoiceAmount)){
				var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];	
				invAmount  += invoiceAmount;
				var invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
			}else{
				var invAmountFormat = '';
			}
			
			
			var invoiceTaxamount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','tax1amt',k)));//税額   
			if(!isEmpty(invoiceTaxamount)){
				var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
				invTaxamount += invoiceTaxamount;
				var invTaxmountTotal = invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
			}else{
				var invTaxamountFormat = '';
			}
			
				
			var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
			if(!isEmpty(invoTotal)){
				var invoToTotal = invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
			}else{
				var invoToTotal ='';
			}
			
			
			var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//単価
			var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//単位
			//20221020 add by zhou 
			var invoiceUnitsArray;//単位array
			var invoiceUnit;//変更後単位
			if(!isEmpty(invoiceLanguage)&&!isEmpty(invoiceUnitabbreviation)&&customform == 121){
				var invoiceUnitSearch = nlapiSearchRecord("unitstype",null,
						[
						   ["abbreviation","is",invoiceUnitabbreviation]
						], 
						[
						   new nlobjSearchColumn("abbreviation")
						]
						); 
				if(invoiceUnitSearch != null){
					// add by zzq start
//					if(invoiceLanguage == '英語'){			//英語
					if(invoiceLanguage == LANGUAGE_EN){			//英語
					// add by zzq end
						invoiceUnitabbreviation = invoiceUnitSearch[0].getValue('abbreviation')+'';
						invoiceUnitsArray = invoiceUnitabbreviation.split("/");
						if(invoiceUnitsArray.length == 2){
							invoiceUnit = invoiceUnitsArray[1];
						}
						// add by zzq start
//					}else if(invoiceLanguage == '日本語'){				//日本語
					}else if(invoiceLanguage == LANGUAGE_JP){				//日本語
						// add by zzq end
						invoiceUnitabbreviation = invoiceUnitSearch[0].getValue('abbreviation')+'';
						invoiceUnitsArray = invoiceUnitabbreviation.split("/");
						if(!isEmpty(invoiceUnitsArray)){
							invoiceUnit = invoiceUnitsArray[0];
						}else if(invoiceUnitsArray.length == 0){
							invoiceUnit = invoiceUnitabbreviation;
						}
					}
				}
			}
			//end
			var invoiceTaxrate1Format = defaultEmpty(invoiceRecord.getLineItemValue('item','taxrate1',k));//税率
			invoiceItemArr.push({
				lineInvoiceOtherrefnum:lineInvoiceOtherrefnum,//明細行 DJ_顧客の発注番号   20230425 changed by zhou
				invoiceItemId:invoiceItemId,
				invoiceDeliverytemptyp:invoiceDeliverytemptyp,//配送温度区分
				invoiceVendorName:invoiceVendorName,//仕入先商品コード
				invoiceInitemid:invoiceInitemid,//商品コード
				invoiceDisplayName:invoiceDisplayName,//商品名
				invoiceStorage_type:invoiceStorage_type,//在庫区分	
				invoiceQuantity:invoiceQuantity,//数量
				invoiceAmount:invAmountFormat,//金額  
				invoiceTaxamount:invTaxamountFormat,//税額
				invoiceRateFormat:invoiceRateFormat,//単価
				invoiceUnitabbreviation:defaultEmpty(invoiceUnit),//単位
				invoiceTaxrate1Format:invoiceTaxrate1Format,//税率
				invoiceLine:invoiceLine,
			}); 
			var inventoryDetail=invoiceRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //在庫詳細
			if(!isEmpty(inventoryDetail)){
				var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');//在庫詳細行
				if(inventoryDetailCount != 0){
					for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
						inventoryDetail.selectLineItem('inventoryassignment',j);
						var invReceiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
						if(isEmpty(invReceiptinventorynumber)){
					    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
					    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
				                    [
				                       ["internalid","is",invReordId]
				                    ], 
				                    [
				                     	new nlobjSearchColumn("inventorynumber"),
				                    ]
				                    );    
					    	invoiceSerialnumber = inventorynumberSearch[0].getValue("inventorynumber");////シリアル/ロット番号
				    	}
						var invoiceExpirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //有效期限
						invInventoryDetail.push({
							invoiceLine:invoiceLine,
							invoiceSerialnumber:invoiceSerialnumber,  //シリアル/ロット番号
							invoiceExpirationdate:invoiceExpirationdate, //有效期限
						}); 
					}
				}
			}else{
				invInventoryDetail.push({
					invoiceSerialnumber:'',  //シリアル/ロット番号
					invoiceExpirationdate:'', //有效期限
				}); 
			}
		}		
	}
	var pdfName = new Array();
	if(receiptnoteFlag == 'T'){
		if(deliveryFlg == 'T'){
			if(!isEmpty(invoiceId)){
				// add by zzq start
//				if(soLanguage == '英語' && invoiceLanguage == '英語'){
				if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_EN){
				// add by zzq end
					pdfName.push('Delivery Book','物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
					// add by zzq start
//				}else if(soLanguage == '日本語' && invoiceLanguage == '日本語'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('納\xa0\xa0品\xa0\xa0書','物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(控)','請\xa0\xa0求\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(経理控)');
					// add by zzq start
//				}else if(soLanguage == '英語' && invoiceLanguage == '日本語'){
				}else if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('Delivery Book','物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(控)','請\xa0\xa0求\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(経理控)');
					// add by zzq start
//				}else if(soLanguage == '日本語' && invoiceLanguage == '英語'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('納\xa0\xa0品\xa0\xa0書','物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
				}
			}else{
				// add by zzq start
//				if(soLanguage == '英語'){
				if(soLanguage == LANGUAGE_EN){
				// add by zzq end
					pdfName.push('Delivery Book','物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書');
					// add by zzq start
//				}else if(soLanguage == '日本語'|| isEmpty(soLanguage)){
				}else if(soLanguage == LANGUAGE_JP|| isEmpty(soLanguage)){
				// add by zzq end	
					pdfName.push('納\xa0\xa0品\xa0\xa0書','物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書');
				}
			}
		}else{
			if(!isEmpty(invoiceId)){
				// add by zzq start
//				if(soLanguage == '英語' && invoiceLanguage == '英語'){
				if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
					// add by zzq start
//				}else if(soLanguage == '日本語'  && invoiceLanguage == '日本語'){
				}else if(soLanguage == LANGUAGE_JP  && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(控)','請\xa0\xa0求\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(経理控)');
					// add by zzq start
//				}else if(soLanguage == '英語' && invoiceLanguage == '日本語'){
				}else if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(控)','請\xa0\xa0求\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(経理控)');
					// add by zzq start
//				}else if(soLanguage == '日本語' && invoiceLanguage == '英語'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
				}
			}else{
				pdfName.push('物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書');
			}
		} 
	}else{
		if(deliveryFlg == 'T'){
			if(!isEmpty(invoiceId)){
				// add by zzq start
//				if(soLanguage == '英語' && invoiceLanguage == '英語'){
				if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end	
					pdfName.push('Delivery Book','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
					// add by zzq start
//				}else if(soLanguage == '日本語' && invoiceLanguage == '日本語'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end	
					pdfName.push('納\xa0\xa0品\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(控)','請\xa0\xa0求\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(経理控)');
					// add by zzq start
//				}else if(soLanguage == '英語' && invoiceLanguage == '日本語'){
				}else if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end	
					pdfName.push('Delivery Book','請\xa0\xa0求\xa0\xa0書(控)','請\xa0\xa0求\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(経理控)');
					// add by zzq start
//				}else if(soLanguage == '日本語' && invoiceLanguage == '英語'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('納\xa0\xa0品\xa0\xa0書','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
				}
			}else{
				// add by zzq start
//				if(soLanguage == '英語'){
				if(soLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('Delivery Book');
					// add by zzq start
//				}else if(soLanguage == '日本語'|| isEmpty(soLanguage)){
				}else if(soLanguage == LANGUAGE_JP|| isEmpty(soLanguage)){
					// add by zzq end
					pdfName.push('納\xa0\xa0品\xa0\xa0書');
				}
			}
		}else{
			if(!isEmpty(invoiceId)){
				// add by zzq start
//				if(soLanguage == '英語' && invoiceLanguage == '英語'){
				if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
					// add by zzq start
//				}else if(soLanguage == '日本語'  && invoiceLanguage == '日本語'){
				}else if(soLanguage == LANGUAGE_JP  && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('請\xa0\xa0求\xa0\xa0書(控)','請\xa0\xa0求\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(経理控)');
					// add by zzq start
//				}else if(soLanguage == '英語' && invoiceLanguage == '日本語'){
				}else if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('請\xa0\xa0求\xa0\xa0書(控)','請\xa0\xa0求\xa0\xa0書','請\xa0\xa0求\xa0\xa0書(経理控)');
					// add by zzq start
//				}else if(soLanguage == '日本語' && invoiceLanguage == '英語'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
					// add by zzq end
				}
			}		
		} 
	}
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
	//add by zzq start
	'<#elseif .locale == "en">'+
    '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
  //add by zzq end
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
	for(var a = 0;a<pdfName.length;a++){
		if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
			// add by zzq start
//			if(soLanguage == '英語'){
			if(soLanguage == LANGUAGE_EN){
				// add by zzq end
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
				// add by zzq start
//			}else if(soLanguage == '日本語' || isEmpty(soLanguage)){
			}else if(soLanguage == LANGUAGE_JP || isEmpty(soLanguage)){
				// add by zzq end
				var bankName = '引取銀行';
				if(pdfName[a] == '納\xa0\xa0品\xa0\xa0書'){
					var titleName = '下記の通り納品致します。';
				}
				var dateName = '日\xa0\xa0付';
				var deliveryName = '納品予定日：';
				var numberName = '番\xa0\xa0号';
				var paymentName = '支払条件:';
				var orderName = '貴発注番号:';
				var codeName = 'コ\xa0\xa0ー\xa0\xa0ド';
				var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0名';
				var quantityName = '数\xa0\xa0\xa0量';
				var unitpriceName = '単\xa0\xa0\xa0価';
				var amountName = '金\xa0\xa0\xa0額';
				var tempName = '配送温度';
				var expirationDateNmae = '有効期限:';
				var orderNameTwo = '客先発注番号:';
				var taxRate = '税率';
				var taxAmount = '税額';
				var totalName = '合\xa0\xa0\xa0\xa0\xa0計';
				var consumptionTax = '消\xa0\xa0費\xa0\xa0税';
				var invoiceNameString = '御\xa0請\xa0求\xa0額';
				var deliName = 'お届先';
			}
		}else{
			var bankName = '引取銀行';
			var titleName = '下記の通り受領致します。';
			var dateName = '日\xa0\xa0付';
			var deliveryName = '納品予定日：';
			var numberName = '番\xa0\xa0号';
			var paymentName = '支払条件:';
			var orderName = '貴発注番号:';
			var codeName = 'コ\xa0\xa0ー\xa0\xa0ド';
			var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0名';
			var quantityName = '数\xa0\xa0\xa0量';
			var unitpriceName = '単\xa0\xa0\xa0価';
			var amountName = '金\xa0\xa0\xa0額';
			var tempName = '配送温度';
			var expirationDateNmae = '有効期限:';
			var orderNameTwo = '客先発注番号:';
			var taxRate = '税率';
			var taxAmount = '税額';
			var totalName = '合\xa0\xa0\xa0\xa0\xa0計';
			var consumptionTax = '消\xa0\xa0費\xa0\xa0税';
			var invoiceName = '御\xa0請\xa0求\xa0額';
			var deliName = 'お届先';
		}
		if(pdfName[a] == '納\xa0\xa0品\xa0\xa0書' ||  pdfName[a] == 'Delivery Book' || (pdfName[a] == '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書')){
			nlapiLogExecution('debug','pdfName.length',pdfName.length)
			nlapiLogExecution('debug','pdfName[a]',pdfName[a])
			nlapiLogExecution('debug','receiptnoteFlag',receiptnoteFlag)
			//納品書 && 物品受領書PDF
			str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4">'+
			'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
			'<tr>'+
			'<td style="width: 330PX;">'+
			'<table>'+
			'<tr style="height: 20px;">'+
			'</tr>'+
			'<tr></tr>'+
			'<tr>'+
			'<td>〒'+customerZipcode+'</td>'+
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
			'<td colspan="2" style="width:45%;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 35px;" /></td>'+
			'</tr>'+
			'<tr>'+
			'</tr>'+
			'<tr>';
			if(pdfName [a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
				// add by zzq start
//				if(soLanguage == '英語'){
				if(soLanguage == LANGUAGE_EN){
					// add by zzq end
					str+='<td colspan="4">'+nameEng+'</td>';
				}else{
					str+='<td colspan="4">'+name+'</td>';
				}
			}else{
				str+='<td colspan="4">'+name+'</td>';
			}
			str+='</tr>'+
			'<tr>';
			if(pdfName [a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
				// add by zzq start
//				if(soLanguage == '英語'){
				if(soLanguage == LANGUAGE_EN){
					// add by zzq end
					str+='<td colspan="4" style="font-size:9px;">'+mainaddressEng+'</td>';
				}else{
					str+='<td colspan="4" style="font-size:10px;">〒'+addressZip+'&nbsp;'+address+city+address1+address2+'</td>';
				}
			}else{
				str+='<td colspan="4" style="font-size:10px;">〒'+addressZip+'&nbsp;'+address+city+address1+address2+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td colspan="4">'+bankName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+bankOne+'</td>'+
			'<td>&nbsp;'+branch_name1+'</td>'+
			'<td>当座預金</td>'+
			'<td>'+bank_no1+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+bankTwo+'</td>'+
			'<td>&nbsp;'+branch_name2+'</td>'+
			'<td>当座預金</td>'+
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
			'<td style="width: 100px;border-right:1px solid black;">'+formatDate2(trandate)+'</td>';
			if (delivery_date) {
			    str+='<td align="left">'+deliveryName+'&nbsp;'+formatDate2(delivery_date)+'</td>';
			} else {
			    str+='<td align="left">&nbsp;</td>';   
			}
			'</tr>'+
			'<tr>'+
			'<td style="border-right:1px solid black;">&nbsp;</td>'+
			'<td></td>'+
			'</tr>'+
			'<tr>'+
			'<td style="width: 60px;border-top:1px solid white ;color: white;background-color: black;padding-top:10px" rowspan="2">'+numberName+'</td>'+
			'<td style="width: 100px;border-top:1px solid black;border-right:1px solid black;"></td>';
			if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
				// add by zzq start
//				if(soLanguage == '英語'){
				if(soLanguage == LANGUAGE_EN){
					// add by zzq end
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
			//this line's width be changed 73 to 88  by zhou  20230425
			'<td style="width: 88px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+quantityName+'</td>';
			if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){	
				if(expressFlg == 'T'){
					str+='<td style="width: 105px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+unitpriceName+'</td>';
					str+='<td style="width: 72px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+amountName+'</td>';	
				}
				str+='<td style="width: 52px;border-left: 1px solid white;color: white;background-color: black;line-height:20px;font-size:8px;" align="center" >'+tempName+'</td>';
			}else{
				str+='<td style="width: 205px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">受領印</td>';
			}
			str+='</tr>';
				if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
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
						str+='<td colspan="3">「'+itemLineArr[j].storage_type+'」</td>';
					}else{
						str+='<td colspan="3">&nbsp;</td>';
					}
					str+='</tr>';
					for(var p = 0; p<inventoryDetailArr.length;p++ ){
						var line = inventoryDetailArr[p].line;
						if(line == itemLineArr[j].line){
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
					//this line's width be changed 73 to 88  by zhou  20230425
					'<table style="width:88px;">'+
					'<tr>'+
					'<td align="center" style="font-size:10px;">&nbsp;'+itemLineArr[j].quantity+'&nbsp;'+itemLineArr[j].unitabbreviation+'</td>'+
					'</tr>'+
					'<tr>'+
					'<td>&nbsp;</td>'+
					'</tr>';
					for(var p = 0; p<inventoryDetailArr.length;p++ ){
						var line = inventoryDetailArr[p].line;
						if(line == itemLineArr[j].line){
							var expirationdate = inventoryDetailArr[p].expirationdate;  
							str+='<tr>'; 
							if(!isEmpty(expirationdate)){
								str+='<td style="font-size:10px;border-bottom:none;">'+formatDate2(expirationdate)+'</td>';
							}else{
								str+='<td style="font-size:10px;border-bottom:none;">&nbsp;</td>';
							}
							str+='</tr>';
						}
					}
					if(expressFlg == 'T' && pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
						str+='<tr>'+
						'<td align="right" style="font-size:10px;padding-top:2px;">'+taxRate+':</td>'+
						'</tr>';
					}
					str+='</table>'+
					'</td>';
					if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
						if(expressFlg == 'T'){
							str+='<td style="border-left: 1px solid black;">'+
								'<table style="width:105px;">'+
								'<tr>'+
								'<td colspan="2" align="center" style="font-size:10px;">&nbsp;'+itemLineArr[j].rateFormat+'</td>'+
								'</tr>'+
								'<tr>'+
								'<td colspan="2">&nbsp;</td>'+
								'</tr>';
							for(var p = 0; p<inventoryDetailArr.length;p++ ){
								var line = inventoryDetailArr[p].line;
								if(line == itemLineArr[j].line){
									str+='<tr>'+
									'<td colspan="2" style="border-bottom:none;font-size:10px;">&nbsp;</td>'+
									'</tr>';
								}
							}
								str+='<tr>'+
								'<td align="left" style="font-size:10px;padding-top:2px;">'+itemLineArr[j].taxrate1Format+'</td>'+
								'<td align="right" style="font-size:10px;padding-top:2px;">'+taxAmount+':</td>'+
								'</tr>'+
								'</table>'+
								'</td>';
							
							str+='<td style="border-left: 1px solid black;">'+
								'<table style="width:72px;">'+
								'<tr>'+
								'<td style="font-size:10px;" align="right">&nbsp;'+itemLineArr[j].amount+'</td>'+
								'</tr>'+
								'<tr>'+
								'<td>&nbsp;</td>'+
								'</tr>';
								for(var p = 0; p<inventoryDetailArr.length;p++ ){
									var line = inventoryDetailArr[p].line;
									if(line == itemLineArr[j].line){
										str+='<tr>'+
										'<td style="border-bottom:none;font-size:10px;">&nbsp;</td>'+
										'</tr>';
									}
								}
								str+='<tr>'+
								'<td align="right" style="font-size:10px;padding-top:2px;">'+itemLineArr[j].taxamount+'</td>'+
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
					//20230425 add by zhou start
					if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
						str+='<tr>'+
						'<td style="border-left: 2px solid black;"></td>'+
						'<td style="border-left: 1px solid black;padding-bottom:2px;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+itemLineArr[j].lineOtherrefnum+'</td>'+
						'<td style="border-left: 1px solid black;"></td>';
						if(expressFlg == 'T'){
							str+='<td style="border-left: 1px solid black;"></td>'+
							'<td style="border-left: 1px solid black;"></td>';
						}
						str+='<td style="border-left: 1px solid black;border-right: 2px solid black;"></td>'+
						'</tr>';
					}
					//20230425 add by zhou end
				}
			}else{
				//受領書PDF:注文書の受領書フラグ選択出力明細行データ
				for(var j =0; j < itemLineArr.length;j++){
					if(itemLineArr[j].receiptnote == 'T'){
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
							str+='<td colspan="3">「'+itemLineArr[j].storage_type+'」</td>';
						}else{
							str+='<td colspan="3">&nbsp;</td>';
						}
						str+='</tr>';
						for(var p = 0; p<inventoryDetailArr.length;p++ ){
							var line = inventoryDetailArr[p].line;
							if(line == itemLineArr[j].line){
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
						//this line's width be changed 73 to 88  by zhou  20230425
						'<table style="width:88px;">'+
						'<tr>'+
						'<td align="center" style="font-size:10px;">&nbsp;'+itemLineArr[j].quantity+'&nbsp;'+itemLineArr[j].unitabbreviation+'</td>'+
						'</tr>'+
						'<tr>'+
						'<td>&nbsp;</td>'+
						'</tr>';
						for(var p = 0; p<inventoryDetailArr.length;p++ ){
							var line = inventoryDetailArr[p].line;
							if(line == itemLineArr[j].line){
								var expirationdate = inventoryDetailArr[p].expirationdate;  
								str+='<tr>'; 
								if(!isEmpty(expirationdate)){
									str+='<td style="font-size:10px;border-bottom:none;">'+formatDate2(expirationdate)+'</td>';
								}else{
									str+='<td style="font-size:10px;border-bottom:none;">&nbsp;</td>';
								}
								str+='</tr>';
							}
						}
						if(expressFlg == 'T' && pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
							str+='<tr>'+
							'<td align="right" style="font-size:10px;padding-top:2px;">'+taxRate+':</td>'+
							'</tr>';
						}
						str+='</table>'+
						'</td>';
						if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
							if(expressFlg == 'T'){
								str+='<td style="border-left: 1px solid black;">'+
									'<table style="width:105px;">'+
									'<tr>'+
									'<td colspan="2" align="center" style="font-size:10px;">&nbsp;'+itemLineArr[j].rateFormat+'</td>'+
									'</tr>'+
									'<tr>'+
									'<td colspan="2">&nbsp;</td>'+
									'</tr>';
								for(var p = 0; p<inventoryDetailArr.length;p++ ){
									var line = inventoryDetailArr[p].line;
									if(line == itemLineArr[j].line){
										str+='<tr>'+
										'<td colspan="2" style="border-bottom:none;font-size:10px;">&nbsp;</td>'+
										'</tr>';
									}
								}
									str+='<tr>'+
									'<td align="left" style="font-size:10px;padding-top:2px;">'+itemLineArr[j].taxrate1Format+'</td>'+
									'<td align="right" style="font-size:10px;padding-top:2px;">'+taxAmount+':</td>'+
									'</tr>'+
									'</table>'+
									'</td>';
								
								str+='<td style="border-left: 1px solid black;">'+
									'<table style="width:72px;">'+
									'<tr>'+
									'<td style="font-size:10px;" align="right">&nbsp;'+itemLineArr[j].amount+'</td>'+
									'</tr>'+
									'<tr>'+
									'<td>&nbsp;</td>'+
									'</tr>';
									for(var p = 0; p<inventoryDetailArr.length;p++ ){
										var line = inventoryDetailArr[p].line;
										if(line == itemLineArr[j].line){
											str+='<tr>'+
											'<td style="border-bottom:none;font-size:10px;">&nbsp;</td>'+
											'</tr>';
										}
									}
									str+='<tr>'+
									'<td align="right" style="font-size:10px;padding-top:2px;">'+itemLineArr[j].taxamount+'</td>'+
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
					
						//20230425 add by zhou start
						if(pdfName[a] == '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
							str+='<tr>'+
							'<td style="border-left: 2px solid black;"></td>'+
							'<td style="border-left: 1px solid black;padding-bottom:2px;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+itemLineArr[j].lineOtherrefnum+'</td>'+
							'<td style="border-left: 1px solid black;"></td>'+
							'<td style="border-left: 1px solid black;"></td>'+
							'</tr>';
						}
					}
					//20230425 add by zhou end
				}
				nlapiLogExecution('debug','pdfName[a]    2',pdfName[a])
				nlapiLogExecution('debug','receiptnoteFlag    2',receiptnoteFlag)
				//20230425 add by zhou start
				if(pdfName[a] == '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書' ){
					str+='<tr>'+
					'<td style="border-left: 2px solid black;"></td>'+
					'<td style="border-left: 1px solid black;"></td>'+
					'<td style="border-left: 1px solid black;"></td>'+
					'<td style="border-left: 1px solid black;">'+
					'<table style="width:205px;height:70px;">'+
					'<tr>'+
					'<td align="center">年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</td>'+
					'</tr>'+
					'<tr>'+
					'<td align="center">&nbsp;</td>'+
					'</tr>'+
					'<tr>'+
					'<td align="center">受領いたしました。</td>'+
					'</tr>'+
					'</table>'+
					'</td>'+
					'</tr>';
				}
				//20230425 add by zhou end
			}
		    //20230425 changed by zhou start
//			if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書'){
//				str+='<tr>'+
//				'<td style="border-left: 2px solid black;"></td>'+
//				'<td style="border-left: 1px solid black;padding-bottom:2px;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+otherrefnum+'</td>'+
//				'<td style="border-left: 1px solid black;"></td>';
//				if(expressFlg == 'T'){
//					str+='<td style="border-left: 1px solid black;"></td>'+
//					'<td style="border-left: 1px solid black;"></td>';
//				}
//				str+='<td style="border-left: 1px solid black;border-right: 2px solid black;"></td>'+
//				'</tr>';
//			}else{
//				str+='<tr>'+
//				'<td style="border-left: 2px solid black;"></td>'+
//				'<td style="border-left: 1px solid black;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+otherrefnum+'</td>'+
//				'<td style="border-left: 1px solid black;"></td>'+
//				'<td style="border-left: 1px solid black;">'+
//				'<table style="width:205px;height:70px;">'+
//				'<tr>'+
//				'<td align="center">年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</td>'+
//				'</tr>'+
//				'<tr>'+
//				'<td align="center">&nbsp;</td>'+
//				'</tr>'+
//				'<tr>'+
//				'<td align="center">受領いたしました。</td>'+
//				'</tr>'+
//				'</table>'+
//				'</td>'+
//				'</tr>';
//			}
			 //20230425 changed by zhou end
			str+='</table>'+
			'<table style="border-top:2px solid black;width: 660px;" >'+
			'<tr>'+
			'<td style="width:420px;"></td>';
			if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書' && expressFlg == 'T'){
				str+='<td style="width: 80px;height:30px;background-color: black;color: white;padding-top:15px;font-size:8px;" align="center">'+totalName+'</td>'+
				'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+amountTotal+'</td>';
			}
			str+='</tr>'+	
			'<tr>'+
			'<td style="width:470px;">&nbsp;&nbsp;'+deliName+':'+destinationName+'</td>';
			if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書' && expressFlg == 'T'){
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
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+destinationZip+'&nbsp; '+destinationState+'</td>'+
				'</tr>';
			}
			str+='</table>'+
			'</td>';
			if(pdfName[a] != '物\xa0\xa0品\xa0\xa0受\xa0\xa0領\xa0\xa0書' && expressFlg == 'T'){
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
			// add by zzq start
//			if(invoiceLanguage == '英語'){
			if(invoiceLanguage == LANGUAGE_EN){
				// add by zzq end
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
				//20230511 add by zhou DENISJAPAN-759 start	
				var invoiceIssuerNumberName = 'Registered Enterprises Number:'
				//20230511 add by zhou DENISJAPAN-759 end
					// add by zzq start
//			}else if(invoiceLanguage == '日本語' || isEmpty(invoiceLanguage)){
			}else if(invoiceLanguage == LANGUAGE_JP || isEmpty(invoiceLanguage)){
				// add by zzq end
				
				var bankName = '引取銀行';
				if(pdfName[a] == '請\xa0\xa0求\xa0\xa0書(控)' || pdfName == '請\xa0\xa0求\xa0\xa0書' || pdfName == '請\xa0\xa0求\xa0\xa0書(経理控)'){
					var titleName = '下記の通りご請求申し上げます。';
				}
				var dateName = '日\xa0\xa0付';
				var deliveryName = '納品予定日：';
				var numberName = '番\xa0\xa0号';
				var paymentName = '支払条件:';
				var orderName = '貴発注番号:';
				var codeName = 'コ\xa0\xa0ー\xa0\xa0ド';
				var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0名';
				var quantityName = '数\xa0\xa0\xa0量';
				var unitpriceName = '単\xa0\xa0\xa0価';
				var amountName = '金\xa0\xa0\xa0額';
				var tempName = '配送温度';
				var expirationDateNmae = '有効期限:';
				var orderNameTwo = '客先発注番号:';
				var taxRate = '税率';
				var taxAmount = '税額';
				var totalName = '合\xa0\xa0\xa0\xa0\xa0計';
				var consumptionTax = '消\xa0\xa0費\xa0\xa0税';
				var invoiceNameString = '御\xa0請\xa0求\xa0額';
				var deliName = 'お届先';
				//20230511 add by zhou DENISJAPAN-759 start	
				var invoiceIssuerNumberName = '適格請求書発行事業者番号:';
				//20230511 add by zhou DENISJAPAN-759 end
			}
			nlapiLogExecution('debug','請求書PDF',invoiceIssuerNumberName);
			//請求書PDF
			str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4">'+
			'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
			'<tr>'+
			'<td style="width: 330PX;">'+
			'<table>'+
			'<tr style="height: 20px;">'+
			'</tr>'+
			'<tr></tr>'+
			'<tr>'+
			'<td>〒'+invoiceZipcode+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceState+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceCity+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceAddress1+'</td>'+ 
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceAddress2+'</td>'+
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
			'<td colspan="2" style="width:45%;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 35px;" /></td>'+
			'</tr>'+
			'<tr>'+
			'</tr>'+
			'<tr>';
			// add by zzq start
//			if(invoiceLanguage == '英語'){
			if(invoiceLanguage == LANGUAGE_EN){
				// add by zzq end
				str+='<td colspan="4">'+invoiceNameEng+'</td>';
			}else{
				str+='<td colspan="4">'+invoiceName+'</td>';
			}
			//20230511 add by zhou DENISJAPAN-759 start	
			str+='</tr>';
			// add by zzq start
//			if(invoiceLanguage == '英語'){
			if(invoiceLanguage == LANGUAGE_EN){
				// add by zzq end
				str+='<tr><td colspan="4" style="font-size:9px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'</td></tr>';
			}else{
				str+='<tr><td colspan="4" style="font-size:9px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'</td></tr>';
			}
			// add by zzq start
//			if(invoiceLanguage == '英語'){
			if(invoiceLanguage == LANGUAGE_EN){
				// add by zzq end
				str+='<tr><td colspan="4" style="font-size:9px;">'+invoiceAddressEng+'</td>';
			//20230511 add by zhou DENISJAPAN-759 end
			}else{
				str+='<tr><td colspan="4" style="font-size:10px;">〒'+invoiceAddressZip+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td colspan="4">'+bankName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceBankOne+'</td>'+
			'<td>&nbsp;'+invbranch_name1+'</td>'+
			//20230511 add by zhou DENISJAPAN-759 start	
//			'<td>当座預金</td>'+
			'<td>'+bankType1+'</td>'+
			//20230511 add by zhou DENISJAPAN-759 end
			'<td>'+invbank_no1+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceBankTwo+'</td>'+
			'<td>&nbsp;'+invbranch_name2+'</td>'+
			//20230511 add by zhou DENISJAPAN-759 start	
//			'<td>当座預金</td>'+
			'<td>'+bankType2+'</td>'+
			//20230511 add by zhou DENISJAPAN-759 end
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
			'<td style="width: 100px;border-right:1px solid black;">'+formatDate2(invoiceTrandate)+'</td>';
			if(invoicedelivery_date){
			    str+='<td align="left">'+deliveryName+'&nbsp;'+formatDate2(invoicedelivery_date)+'</td>';
			} else {
			    str+='<td align="left">&nbsp;</td>';
			}
			'</tr>'+
			'<tr>'+
			'<td style="border-right:1px solid black;">&nbsp;</td>'+
			'<td></td>'+
			'</tr>'+
			'<tr>'+
			'<td style="width: 60px;border-top:1px solid white ;color: white;background-color: black;padding-top:10px" rowspan="2">'+numberName+'</td>'+
			'<td style="width: 100px;border-top:1px solid black;border-right:1px solid black;"></td>';
			// add by zzq start
//			if(invoiceLanguage == '英語'){
			if(invoiceLanguage == LANGUAGE_EN){	
				// add by zzq end
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
			//this line's width be changed 70 to 85  by zhou  20230425
			'<td style="width: 85px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+quantityName+'</td>'+	
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
					str+='<td colspan="3">「'+invoiceItemArr[j].invoiceStorage_type+'」</td>';
				//20230425 add by zhou start
				}else{
					str+='<td colspan="3" style="margin-top: 11.75px;"></td>';
				}
				//20230425 add by zhou end
				str+='</tr>';
				for(var p = 0;p<invInventoryDetail.length;p++){
					var invLine = invInventoryDetail[p].invoiceLine;
					if(invLine == invoiceItemArr[j].invoiceLine){
						var invoiceSerialnumberLot = invInventoryDetail[p].invoiceSerialnumber;  
						str+='<tr>'+
						'<td style="width:80px;font-size:10px;">'+invoiceItemArr[j].invoiceVendorName+'</td>'+
						'<td style="width:135px;font-size:10px;" align="left" >'+invoiceSerialnumberLot+'</td>'+
						'<td style="width:70px;font-size:10px;" align="right" >'+expirationDateNmae+'</td>'+
						'</tr>';
					}
				}
				str+='</table>'+
				'</td>'+
				
				'<td style="border-left: 1px solid black;">'+
				//this line's width be changed 70 to 85  by zhou  20230425
				'<table style="width:85px;">'+
				'<tr>'+
				'<td align="center" style="font-size:10px;">'+invoiceItemArr[j].invoiceQuantity+'&nbsp;'+invoiceItemArr[j].invoiceUnitabbreviation+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;</td>'+
				'</tr>';
				for(var p = 0;p<invInventoryDetail.length;p++){
					var invLine = invInventoryDetail[p].invoiceLine;
					if(invLine == invoiceItemArr[j].invoiceLine){
						var invoiceExpirationDate = invInventoryDetail[p].invoiceExpirationdate;  
						str+='<tr>'+
						'<td style="font-size:10px;">&nbsp;'+invoiceExpirationDate+'</td>'+	
						'</tr>';
					}
				}
				str+='<tr>'+
				'<td align="right" style="font-size:10px;">'+taxRate+':</td>'+
				'</tr>'+
				'</table>'+
				'</td>';
				str+='<td style="border-left: 1px solid black;">'+
				'<table style="width:105px;">'+
				'<tr>'+
				'<td colspan="2" align="center" style="font-size:10px;">&nbsp;'+invoiceItemArr[j].invoiceRateFormat+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;</td>'+
				'</tr>';
				for(var p = 0;p<invInventoryDetail.length;p++){
					var invLine = invInventoryDetail[p].invoiceLine;
					if(invLine == invoiceItemArr[j].invoiceLine){
						str+='<tr>'+
						'<td>&nbsp;</td>'+
						'</tr>';
					}
				}
				str+='<tr>'+
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
				'</tr>';
				for(var p = 0;p<invInventoryDetail.length;p++){
					var invLine = invInventoryDetail[p].invoiceLine;
					if(invLine == invoiceItemArr[j].invoiceLine){
						str+='<tr>'+
						'<td>&nbsp;</td>'+
						'</tr>';
					}
				}
				str+='<tr>'+
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
				//20230425 changed by zhou start
				str+='<tr>'+
				'<td style="border-left: 2px solid black;"></td>'+
				'<td style="border-left: 1px solid black;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+invoiceItemArr[j].lineInvoiceOtherrefnum+'</td>'+
				'<td style="border-left: 1px solid black;"></td>'+
				'<td style="border-left: 1px solid black;"></td>'+
				'<td style="border-left: 1px solid black;"></td>'+
				'<td style="border-left: 1px solid black;border-right: 2px solid black;"></td>'+
				'</tr>';
				//20230425 changed by zhou end
			}
			//20230425 changed by zhou start
//			str+='<tr>'+
//			'<td style="border-left: 2px solid black;"></td>'+
//			'<td style="border-left: 1px solid black;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+invoiceItemArr[j].lineInvoiceOtherrefnum+'</td>'+
//			'<td style="border-left: 1px solid black;"></td>'+
//			'<td style="border-left: 1px solid black;"></td>'+
//			'<td style="border-left: 1px solid black;"></td>'+
//			'<td style="border-left: 1px solid black;border-right: 2px solid black;"></td>'+
//			'</tr>';
			//20230425 changed by zhou end
			
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
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+invdestinationZip+'&nbsp; '+invdestinationState+'</td>'+
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
	
	// test
	var xlsFileo = nlapiCreateFile('テスト用請求書出力' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
	
	xlsFileo.setFolder(109338);
	nlapiSubmitFile(xlsFileo);
	
	var xlsFile = nlapiXMLToPDF(xml);
	// PDF
	xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
	xlsFile.setFolder(FIVE_PDF_IN_DJ_FIVEPDF);
	xlsFile.setIsOnline(true);
	// save file
	var fileID = nlapiSubmitFile(xlsFile);
	var fl = nlapiLoadFile(fileID);  
	var url= URL_HEAD +'/'+fl.getURL();
	nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
	
}
catch(e){
	nlapiLogExecution('debug', 'エラー', e.message)

}
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

function formatDate2(paramdt){
    if (paramdt == null) {
        return '';
    }else {
        var dt = nlapiStringToDate(paramdt);
        var year = dt.getFullYear()
        var year = year < 2000 ? year + 1900 : year
        var yy = year.toString().substr(2, 2)
        
        var month = PrefixZero((dt.getMonth() + 1), 2)
        var date = PrefixZero(dt.getDate(), 2)
        return yy + "-" + month + "-" + date
    }
}