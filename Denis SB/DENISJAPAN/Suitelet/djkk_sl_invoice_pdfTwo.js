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
	//íçï∂èëÇÃíl
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
	var entity = soRecord.getFieldValue('entity');//å⁄ãq
	var customform = soRecord.getFieldValue('customform');//customform
	var customerSearch= nlapiSearchRecord("customer",null,
			[
				["internalid","anyof",entity]
			], 
			[
			 	new nlobjSearchColumn("custrecord_djkk_honorific_appellation","billingAddress",null), //DJ_åhèÃ
			 	new nlobjSearchColumn("address1","billingAddress",null), //êøãÅêÊèZèä1
		    	new nlobjSearchColumn("address2","billingAddress",null), //êøãÅêÊèZèä2
		    	new nlobjSearchColumn("city","billingAddress",null), //êøãÅêÊésãÊí¨ë∫
		    	new nlobjSearchColumn("zipcode","billingAddress",null), //êøãÅêÊóXï÷î‘çÜ
		    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //êøãÅêÊìsìπï{åß 		
		    	new nlobjSearchColumn("addressphone","billingAddress",null), //ìdòbî‘çÜ
		    	new nlobjSearchColumn("custrecord_djkk_address_fax","billingAddress",null), //Fax
		    	new nlobjSearchColumn("custentity_djkk_language"),  //åæåÍ
		    	new nlobjSearchColumn("custentity_djkk_reference_express"),  //ã‡äzï\é¶flg
		    	new nlobjSearchColumn("custentity_djkk_delivery_express"),  //ï\é¶flg
			]
			);	
	var honorieicAppellation = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custrecord_djkk_honorific_appellation","billingAddress",null));//DJ_åhèÃ
	if(honorieicAppellation){
		honorieicAppellation = '';
	}
	var attention= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//êøãÅêÊèZèä2
	var customerAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address1","billingAddress",null));//êøãÅêÊèZèä1
	var customerCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//êøãÅêÊésãÊí¨ë∫
	var customerZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//êøãÅêÊóXï÷î‘çÜ
	var customerState= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//êøãÅêÊìsìπï{åß 
	var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("addressphone","billingAddress"));//êøãÅêÊìdòbî‘çÜ
	var fax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_fax","billingAddress"));//êøãÅêÊfax
	// add by zzq start
//	var soLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_language"));//åæåÍ
	var soLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_language"));//åæåÍ
	// add by zzq end
	var expressFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_reference_express"));//ã‡äzï\é¶flg
	var deliveryFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_delivery_express"));//ï\é¶flg
	
	var subsidiary = soRecord.getFieldValue('subsidiary');//éqâÔé–
	var subsidiarySearch= nlapiSearchRecord("subsidiary",null,
			[
				["internalid","anyof",subsidiary]
			], 
			[
				new nlobjSearchColumn("legalname"),  //ê≥éÆñºèÃ
				new nlobjSearchColumn("name"), //ñºëO
				new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //ñºëOâpåÍ
				new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //èZèäâpåÍ
				new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //ìsìπï{åß
				new nlobjSearchColumn("address1","address",null), //èZèä1
				new nlobjSearchColumn("address2","address",null), //èZèä2
				new nlobjSearchColumn("city","address",null), //ésãÊí¨ë∫
				new nlobjSearchColumn("zip","address",null), //óXï÷î‘çÜ
				new nlobjSearchColumn("custrecord_djkk_bank_1"), //ã‚çs1
				new nlobjSearchColumn("custrecord_djkk_bank_2"), //ã‚çs2
					  
			]
			);		
	var legalname= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("legalname"));//ê≥éÆñºèÃ
	var nameString= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("name"));//ñºëO
	var nameStringTwo = nameString.split(":");
	var name = nameStringTwo.slice(-1);
	var address= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//ìsìπï{åß
	var city= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("city","address",null));//ésãÊí¨ë∫
	var bankOne= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_1"));//ã‚çs1
	var bankTwo= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_2"));//ã‚çs2
	var addressZip= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("zip","address",null));//óXï÷î‘çÜ
	var nameEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//ñºëOâpåÍ
	var mainaddressEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//èZèäâpåÍ
	var address1= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address1","address",null));//èZèä1
	var address2= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address2","address",null));//èZèä2
	var bankOneId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_1"));//ã‚çs1
	var bankTwoId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_2"));//ã‚çs2
//	nlapiLogExecution('DEBUG', 'bankOneId',bankOneId);
	if(!isEmpty(bankOneId)){
		var bank1 = nlapiLoadRecord('customrecord_djkk_bank', bankOneId);
		var branch_name1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_éxìXñº
		var bank_no1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));//DJ_å˚ç¿î‘çÜ
	}else{
		var branch_name1 = '';
		var bank_no1 = '';
	}
	if(!isEmpty(bankTwoId)){
		var bank2 = nlapiLoadRecord('customrecord_djkk_bank', bankTwoId);
		var branch_name2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_éxìXñº
		var bank_no2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));//DJ_å˚ç¿î‘çÜ
	}else{
		var branch_name2 = '';
		var bank_no2 ='';
	}
	
//	nlapiLogExecution('DEBUG', 'hellow','hellow');
	var trandate = defaultEmpty(soRecord.getFieldValue('trandate'));//ì˙ït
	var delivery_date = defaultEmpty(soRecord.getFieldValue('custbody_djkk_delivery_date'));//DJ_î[ïiì˙
	var tranid = defaultEmpty(soRecord.getFieldValue('tranid'));//íçï∂î‘çÜ
	var terms = defaultEmpty(soRecord.getFieldText('terms'));//éxï•èåèÅií˜Çﬂì˙ñ≥ÇµÅj
	var soTersm = defaultEmpty(terms.split('/'));
	var soTersmJap = defaultEmpty(soTersm.slice(0,1));
	var soTersmEng  = defaultEmpty(soTersm.slice(-1));
//	nlapiLogExecution('DEBUG', 'soTersmJap',soTersmJap);
//	nlapiLogExecution('DEBUG', 'soTersmEng',soTersmEng);
	var otherrefnum = defaultEmpty(soRecord.getFieldValue('otherrefnum'));//î≠íçèëî‘çÜ   20230425 changed by zhou 
	var destination = soRecord.getFieldValue('custbody_djkk_delivery_destination');//DJ_î[ïiêÊ	
	var destinationName = defaultEmpty(soRecord.getFieldText('custbody_djkk_delivery_destination'));//DJ_î[ïiêÊñºëO
	if(!isEmpty(destination)){	
		var destinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
				[
					["internalid","anyof",destination]
				], 
				[
					new nlobjSearchColumn("custrecord_djkk_zip"),  //óXï÷î‘çÜ
					new nlobjSearchColumn("custrecord_djkk_prefectures"),  //ìsìπï{åß
					new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_ésãÊí¨ë∫
					new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_î[ïiêÊèZèä1
					new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_î[ïiêÊèZèä2
					new nlobjSearchColumn("custrecord_djkk_sales"),//î[ïiêÊâcã∆
						  
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
		var lineOtherrefnum = defaultEmpty(soRecord.getLineItemValue('item','custcol_djkk_customer_order_number', a));//ñæç◊çs DJ_å⁄ãqÇÃî≠íçî‘çÜ   20230425 changed by zhou
		var ItemSearch = nlapiSearchRecord("item",null,
				[
				 	["internalid","anyof",itemId],
				],
				[
				  new nlobjSearchColumn("vendorname"), //édì¸êÊè§ïiÉRÅ[Éh
				  new nlobjSearchColumn("itemid"), //è§ïiÉRÅ[Éh
				  new nlobjSearchColumn("displayname"), //è§ïiñº
				  new nlobjSearchColumn("custitem_djkk_storage_type"), //ç›å…ãÊï™
				  new nlobjSearchColumn("custitem_djkk_product_category_sml"), //îzëóâ∑ìx
				]
				); 
			
			var vendorname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("vendorname"));//édì¸êÊè§ïiÉRÅ[Éh
			var itemid= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("itemid"));//è§ïiÉRÅ[Éh
			var displayname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("displayname"));//è§ïiñº
			var storage_type= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_storage_type"));//ç›å…ãÊï™
			var deliverytemptyp= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_product_category_sml"));//îzëóâ∑ìx

		var receiptnote = soRecord.getLineItemValue('item', 'custcol_djkk_receipt_printing', a);//DJ_éÛóÃèëàÛç¸flag
		if(receiptnote == 'T'){
			receiptnoteFlag = 'T';
		}
		var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//êîó 
		
		var amount = defaultEmptyToZero(parseFloat(soRecord.getLineItemValue('item', 'amount', a)));//ã‡äz
		if(!isEmpty(amount)){
			var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];		
			amountTota += amount;
			var amountTotal = amountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
		}else{
			var amountFormat = '';
		}

		
		var taxamount = defaultEmpty(parseFloat(soRecord.getLineItemValue('item','tax1amt',a)));//ê≈äz   

		if(!isEmpty(taxamount)){
			var taxamountFormat = taxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
			taxamountTota += taxamount;
			var taxamountTotal = taxamountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
		}else{
			var taxamountFormat = '';
		}
	

		var rateFormat= defaultEmpty(soRecord.getLineItemValue('item','rate',a));//íPâø
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
		var unitabbreviation = defaultEmpty(soRecord.getLineItemValue('item','units_display',a));//íPà 
		
		var soUnitsArray;//íPà array
		var soUnit;//ïœçXå„íPà 
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
//				if(soLanguage == 'âpåÍ'){			//âpåÍ
				if(soLanguage == LANGUAGE_EN){			//âpåÍ
				// add by zzq end
					unitabbreviation = unitSearch[0].getValue('abbreviation')+'';
					soUnitsArray = unitabbreviation.split("/");
					if(soUnitsArray.length == 2){
						soUnit = soUnitsArray[1];
					}
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ'){				//ì˙ñ{åÍ
				}else if(soLanguage == LANGUAGE_JP){				//ì˙ñ{åÍ
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
		var taxrate1Format = defaultEmpty(soRecord.getLineItemValue('item','taxrate1',a));//ê≈ó¶   //
		var pocurrency = transfer(defaultEmpty(soRecord.getLineItemValue('item','pocurrency',a)));//í â›
		if(pocurrency == 'JPY'){
			var pocurrencyMoney = 'Åè';
		}else if(pocurrency == 'USD'){
			var pocurrencyMoney = '$';
		}else{
			var pocurrencyMoney = '';
		}
		

		itemLineArr.push({
			receiptnoteFlag:receiptnoteFlag,
			lineOtherrefnum:lineOtherrefnum,//ñæç◊çs DJ_å⁄ãqÇÃî≠íçî‘çÜ   20230425 changed by zhou
			receiptnote:receiptnote,//DJ_éÛóÃèëàÛç¸flag
			vendorname:vendorname,//édì¸êÊè§ïiÉRÅ[Éh
			itemid:itemid,//è§ïiÉRÅ[Éh
			displayname:displayname,//è§ïiñº
			storage_type:storage_type,//ç›å…ãÊï™
			quantity:quantity,//êîó 
			amount:amountFormat,//ã‡äz  
			taxamount:taxamountFormat,//ê≈äz 
			rateFormat:rateFormat,//íPâø
			unitabbreviation:defaultEmpty(soUnit),//íPà 
			taxrate1Format:taxrate1Format,//ê≈ó¶
			deliverytemptyp:deliverytemptyp,//îzëóâ∑ìxãÊï™
			line:line,
		}); 
		var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //ç›å…è⁄ç◊
		if(!isEmpty(inventoryDetail)){
			var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
			if(inventoryDetailCount != 0){
				for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
					inventoryDetail.selectLineItem('inventoryassignment',j);
					var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//ÉVÉäÉAÉã/ÉçÉbÉgî‘çÜ
					if(isEmpty(receiptinventorynumber)){
				    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ÉçÉbÉgî‘çÜinternalid
				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
			                    [
			                       ["internalid","is",invReordId]
			                    ], 
			                    [
			                     	new nlobjSearchColumn("inventorynumber"),
			                    ]
			                    );    
				    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////ÉVÉäÉAÉã/ÉçÉbÉgî‘çÜ	
			    	}
					var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //óLù¡ä˙å¿	
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
	
//	//êøãÅèëÇÃíl
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
		var invoiceRecord = nlapiLoadRecord('invoice',invoiceId);   //êøãÅèë
		var invoiceEntity = invoiceRecord.getFieldValue('entity')    //êøãÅèëå⁄ãq	
		var incustomerSearch= nlapiSearchRecord("customer",null,
			[
				["internalid","anyof",invoiceEntity]
			], 
			[
			 	new nlobjSearchColumn("address1","billingAddress",null), //êøãÅêÊèZèä1
    			new nlobjSearchColumn("address2","billingAddress",null), //êøãÅêÊèZèä2
    			new nlobjSearchColumn("city","billingAddress",null), //êøãÅêÊésãÊí¨ë∫
    			new nlobjSearchColumn("zipcode","billingAddress",null), //êøãÅêÊóXï÷î‘çÜ
    			new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //êøãÅêÊìsìπï{åß 		
    			new nlobjSearchColumn("addressphone","billingAddress",null), //ìdòbî‘çÜ
    			new nlobjSearchColumn("custrecord_djkk_address_fax","billingAddress",null), //Fax
    			new nlobjSearchColumn("custentity_djkk_language"),  //åæåÍ
			]
			);	
		var invoiceAddress2= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("address2","billingAddress",null));//êøãÅêÊèZèä 1
		var invoiceAddress1= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("address1","billingAddress",null));//êøãÅêÊèZèä2
		var invoiceCity= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("city","billingAddress",null));//êøãÅêÊésãÊí¨ë∫
		var invoiceZipcode= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("zipcode","billingAddress",null));//êøãÅêÊóXï÷î‘çÜ
		var invoiceState= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//êøãÅêÊìsìπï{åß 
		var invoicePhone= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("addressphone","billingAddress"));//ìdòbî‘çÜ
		var invoiceFax= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("custrecord_djkk_address_fax","billingAddress"));//fax
		// add by zzq start
//		var invoiceLanguage= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getText("custentity_djkk_language"));//êøãÅèëåæåÍ
		var invoiceLanguage= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("custentity_djkk_language"));//êøãÅèëåæåÍ
		// add by zzq end
		
		var invoiceSubsidiary = invoiceRecord.getFieldValue('subsidiary')    //êøãÅèëéqâÔé–
		var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
			[
				["internalid","anyof",invoiceSubsidiary]
			], 
			[
				new nlobjSearchColumn("legalname"),  //ê≥éÆñºèÃ
				new nlobjSearchColumn("name"), //ñºëO
				new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //ñºëOâpåÍ
				new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //èZèäâpåÍ
				new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //ìsìπï{åß
				new nlobjSearchColumn("address1","address",null), //èZèä1
				new nlobjSearchColumn("address2","address",null), //èZèä2
				new nlobjSearchColumn("city","address",null), //ésãÊí¨ë∫
				new nlobjSearchColumn("zip","address",null), //óXï÷î‘çÜ
				new nlobjSearchColumn("custrecord_djkk_bank_1"), //ã‚çs1
				new nlobjSearchColumn("custrecord_djkk_bank_2"), //ã‚çs2
				//20230511 add by zhou DENISJAPAN-759 start	
				new nlobjSearchColumn("custrecord_djkk_invoice_issuer_number"),//ìKäiêøãÅèëî≠çséñã∆é“î‘çÜ
				//20230511 add by zhou DENISJAPAN-759 end
			]
			);	
		var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//ê≥éÆñºèÃ
		var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//ñºëO
		var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address1","address",null));//èZèä1
		var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//èZèä2
		var invoiceBankOne= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getText("custrecord_djkk_bank_1"));//ã‚çs1
		var invoiceBankTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getText("custrecord_djkk_bank_2"));//ã‚çs2
		var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//óXï÷î‘çÜ
		var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//ésãÊí¨ë∫
		var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//ìsìπï{åß
		var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//ñºëOâpåÍ
		var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//ñºëOâpåÍ
		var invoiceBankOneId= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_1"));//ã‚çs1
		var invoiceBankTwoId= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_2"));//ã‚çs2
		//20230511 add by zhou DENISJAPAN-759 start	
		var invoiceIssuerNumber= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_invoice_issuer_number"));//ìKäiêøãÅèëî≠çséñã∆é“î‘çÜ
		//20230511 add by zhou DENISJAPAN-759 end
		
		if(!isEmpty(invoiceBankOneId)){
			var invoiceBank1 = nlapiLoadRecord('customrecord_djkk_bank', invoiceBankOneId);
			var invbranch_name1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_éxìXñº
			var invbank_no1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_no'));//DJ_å˚ç¿î‘çÜ
			//20230511 add by zhou DENISJAPAN-759 start	
			var bankType1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_type'));//DJ_å˚ç¿éÌï 
			var bankNam1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_name'));//DJ_ã‚çsñº
			//20230511 add by zhou DENISJAPAN-759 end
		}
		if(!isEmpty(invoiceBankTwoId)){
			var invoiceBank2 = nlapiLoadRecord('customrecord_djkk_bank', invoiceBankTwoId);
			var invbranch_name2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_éxìXñº
			var invbank_no2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_no'));//DJ_å˚ç¿î‘çÜ
			//20230511 add by zhou DENISJAPAN-759 start	
			var bankType2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_type'));//DJ_å˚ç¿éÌï 
			var bankNam2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_name'));//DJ_ã‚çsñº
			//20230511 add by zhou DENISJAPAN-759 end
		}

			
		
		var invoiceTrandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //êøãÅèëä˙ì˙
		var invoiceTranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //êøãÅèëî‘çÜ
		var invoicedelivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //êøãÅèëî[ïiì˙
		var invoiceTerms = defaultEmpty(invoiceRecord.getFieldText('terms'));    //êøãÅèëéxï•èåèÅií˜Çﬂì˙ñ≥ÇµÅj
		var invTersm = defaultEmpty(invoiceTerms.split('/'));
		var invTersmEng  = defaultEmpty(invTersm.slice(-1));
		var invTersmJap  = defaultEmpty(invTersm.slice(0,1));
//		nlapiLogExecution('DEBUG', 'invTersmJap',invTersmJap);
		var invoiceOtherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //êøãÅèëî≠íçèëî‘çÜ
		var invoiceCreatedfrom = defaultEmpty(invoiceRecord.getFieldText('createdfrom'));    //êøãÅèëéÛíçî‘çÜ
		var incoicedelivery_destination = invoiceRecord.getFieldValue('custbody_djkk_delivery_destination');    //êøãÅèëî[ïiêÊ
		var incoicedelivery_Name = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_delivery_destination'));    //êøãÅèëî[ïiêÊñºëO
		if(!isEmpty(incoicedelivery_destination)){	
			
			var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
					[
						["internalid","anyof",incoicedelivery_destination]
					], 
					[
						new nlobjSearchColumn("custrecord_djkk_zip"),  //óXï÷î‘çÜ
						new nlobjSearchColumn("custrecord_djkk_prefectures"),  //ìsìπï{åß
						new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_ésãÊí¨ë∫
						new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_î[ïiêÊèZèä1
						new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_î[ïiêÊèZèä2
						new nlobjSearchColumn("custrecord_djkk_sales"),//î[ïiêÊâcã∆
							  
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
			var lineInvoiceOtherrefnum = defaultEmpty(invoiceRecord.getLineItemValue('item','custcol_djkk_customer_order_number',k));//ñæç◊çs DJ_å⁄ãqÇÃî≠íçî‘çÜ   20230425 changed by zhou
			var invoiceLine = invoiceRecord.getLineItemValue('item','line',k);	
			var invoiceItemSearch = nlapiSearchRecord("item",null,
					[
					 	["internalid","anyof",invoiceItemId],
					],
					[
					  new nlobjSearchColumn("vendorname"), //édì¸êÊè§ïiÉRÅ[Éh
					  new nlobjSearchColumn("itemid"), //è§ïiÉRÅ[Éh
					  new nlobjSearchColumn("displayname"), //è§ïiñº
					  new nlobjSearchColumn("custitem_djkk_storage_type"), //ç›å…ãÊï™
					  new nlobjSearchColumn("custitem_djkk_product_category_sml"), //îzëóâ∑ìx

					]
					); 
				
				var invoiceVendorName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("vendorname"));//édì¸êÊè§ïiÉRÅ[Éh
				var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//è§ïiÉRÅ[Éh
				var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//è§ïiñº
				var invoiceStorage_type= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getText("custitem_djkk_storage_type"));//ç›å…ãÊï™
				var invoiceDeliverytemptyp= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getText("custitem_djkk_product_category_sml"));//îzëóâ∑ìx
		
			
			var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//êîó 
			var invoiceAmount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','amount',k)));//ã‡äz  
			if(!isEmpty(invoiceAmount)){
				var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];	
				invAmount  += invoiceAmount;
				var invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
			}else{
				var invAmountFormat = '';
			}
			
			
			var invoiceTaxamount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','tax1amt',k)));//ê≈äz   
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
			
			
			var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//íPâø
			var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//íPà 
			//20221020 add by zhou 
			var invoiceUnitsArray;//íPà array
			var invoiceUnit;//ïœçXå„íPà 
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
//					if(invoiceLanguage == 'âpåÍ'){			//âpåÍ
					if(invoiceLanguage == LANGUAGE_EN){			//âpåÍ
					// add by zzq end
						invoiceUnitabbreviation = invoiceUnitSearch[0].getValue('abbreviation')+'';
						invoiceUnitsArray = invoiceUnitabbreviation.split("/");
						if(invoiceUnitsArray.length == 2){
							invoiceUnit = invoiceUnitsArray[1];
						}
						// add by zzq start
//					}else if(invoiceLanguage == 'ì˙ñ{åÍ'){				//ì˙ñ{åÍ
					}else if(invoiceLanguage == LANGUAGE_JP){				//ì˙ñ{åÍ
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
			var invoiceTaxrate1Format = defaultEmpty(invoiceRecord.getLineItemValue('item','taxrate1',k));//ê≈ó¶
			invoiceItemArr.push({
				lineInvoiceOtherrefnum:lineInvoiceOtherrefnum,//ñæç◊çs DJ_å⁄ãqÇÃî≠íçî‘çÜ   20230425 changed by zhou
				invoiceItemId:invoiceItemId,
				invoiceDeliverytemptyp:invoiceDeliverytemptyp,//îzëóâ∑ìxãÊï™
				invoiceVendorName:invoiceVendorName,//édì¸êÊè§ïiÉRÅ[Éh
				invoiceInitemid:invoiceInitemid,//è§ïiÉRÅ[Éh
				invoiceDisplayName:invoiceDisplayName,//è§ïiñº
				invoiceStorage_type:invoiceStorage_type,//ç›å…ãÊï™	
				invoiceQuantity:invoiceQuantity,//êîó 
				invoiceAmount:invAmountFormat,//ã‡äz  
				invoiceTaxamount:invTaxamountFormat,//ê≈äz
				invoiceRateFormat:invoiceRateFormat,//íPâø
				invoiceUnitabbreviation:defaultEmpty(invoiceUnit),//íPà 
				invoiceTaxrate1Format:invoiceTaxrate1Format,//ê≈ó¶
				invoiceLine:invoiceLine,
			}); 
			var inventoryDetail=invoiceRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //ç›å…è⁄ç◊
			if(!isEmpty(inventoryDetail)){
				var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');//ç›å…è⁄ç◊çs
				if(inventoryDetailCount != 0){
					for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
						inventoryDetail.selectLineItem('inventoryassignment',j);
						var invReceiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//ÉVÉäÉAÉã/ÉçÉbÉgî‘çÜ
						if(isEmpty(invReceiptinventorynumber)){
					    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ÉçÉbÉgî‘çÜinternalid
					    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
				                    [
				                       ["internalid","is",invReordId]
				                    ], 
				                    [
				                     	new nlobjSearchColumn("inventorynumber"),
				                    ]
				                    );    
					    	invoiceSerialnumber = inventorynumberSearch[0].getValue("inventorynumber");////ÉVÉäÉAÉã/ÉçÉbÉgî‘çÜ
				    	}
						var invoiceExpirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //óLù¡ä˙å¿
						invInventoryDetail.push({
							invoiceLine:invoiceLine,
							invoiceSerialnumber:invoiceSerialnumber,  //ÉVÉäÉAÉã/ÉçÉbÉgî‘çÜ
							invoiceExpirationdate:invoiceExpirationdate, //óLù¡ä˙å¿
						}); 
					}
				}
			}else{
				invInventoryDetail.push({
					invoiceSerialnumber:'',  //ÉVÉäÉAÉã/ÉçÉbÉgî‘çÜ
					invoiceExpirationdate:'', //óLù¡ä˙å¿
				}); 
			}
		}		
	}
	var pdfName = new Array();
	if(receiptnoteFlag == 'T'){
		if(deliveryFlg == 'T'){
			if(!isEmpty(invoiceId)){
				// add by zzq start
//				if(soLanguage == 'âpåÍ' && invoiceLanguage == 'âpåÍ'){
				if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_EN){
				// add by zzq end
					pdfName.push('Delivery Book','ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ' && invoiceLanguage == 'ì˙ñ{åÍ'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('î[\xa0\xa0ïi\xa0\xa0èë','ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(çT)','êø\xa0\xa0ãÅ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(åoóùçT)');
					// add by zzq start
//				}else if(soLanguage == 'âpåÍ' && invoiceLanguage == 'ì˙ñ{åÍ'){
				}else if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('Delivery Book','ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(çT)','êø\xa0\xa0ãÅ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(åoóùçT)');
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ' && invoiceLanguage == 'âpåÍ'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('î[\xa0\xa0ïi\xa0\xa0èë','ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
				}
			}else{
				// add by zzq start
//				if(soLanguage == 'âpåÍ'){
				if(soLanguage == LANGUAGE_EN){
				// add by zzq end
					pdfName.push('Delivery Book','ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë');
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ'|| isEmpty(soLanguage)){
				}else if(soLanguage == LANGUAGE_JP|| isEmpty(soLanguage)){
				// add by zzq end	
					pdfName.push('î[\xa0\xa0ïi\xa0\xa0èë','ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë');
				}
			}
		}else{
			if(!isEmpty(invoiceId)){
				// add by zzq start
//				if(soLanguage == 'âpåÍ' && invoiceLanguage == 'âpåÍ'){
				if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ'  && invoiceLanguage == 'ì˙ñ{åÍ'){
				}else if(soLanguage == LANGUAGE_JP  && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(çT)','êø\xa0\xa0ãÅ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(åoóùçT)');
					// add by zzq start
//				}else if(soLanguage == 'âpåÍ' && invoiceLanguage == 'ì˙ñ{åÍ'){
				}else if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(çT)','êø\xa0\xa0ãÅ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(åoóùçT)');
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ' && invoiceLanguage == 'âpåÍ'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
				}
			}else{
				pdfName.push('ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë');
			}
		} 
	}else{
		if(deliveryFlg == 'T'){
			if(!isEmpty(invoiceId)){
				// add by zzq start
//				if(soLanguage == 'âpåÍ' && invoiceLanguage == 'âpåÍ'){
				if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end	
					pdfName.push('Delivery Book','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ' && invoiceLanguage == 'ì˙ñ{åÍ'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end	
					pdfName.push('î[\xa0\xa0ïi\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(çT)','êø\xa0\xa0ãÅ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(åoóùçT)');
					// add by zzq start
//				}else if(soLanguage == 'âpåÍ' && invoiceLanguage == 'ì˙ñ{åÍ'){
				}else if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end	
					pdfName.push('Delivery Book','êø\xa0\xa0ãÅ\xa0\xa0èë(çT)','êø\xa0\xa0ãÅ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(åoóùçT)');
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ' && invoiceLanguage == 'âpåÍ'){
				}else if(soLanguage == LANGUAGE_JP && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('î[\xa0\xa0ïi\xa0\xa0èë','Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
				}
			}else{
				// add by zzq start
//				if(soLanguage == 'âpåÍ'){
				if(soLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('Delivery Book');
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ'|| isEmpty(soLanguage)){
				}else if(soLanguage == LANGUAGE_JP|| isEmpty(soLanguage)){
					// add by zzq end
					pdfName.push('î[\xa0\xa0ïi\xa0\xa0èë');
				}
			}
		}else{
			if(!isEmpty(invoiceId)){
				// add by zzq start
//				if(soLanguage == 'âpåÍ' && invoiceLanguage == 'âpåÍ'){
				if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_EN){
					// add by zzq end
					pdfName.push('Invoice Book(Refrain)','Invoice Book','Invoice Book(Manager Refrain)');
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ'  && invoiceLanguage == 'ì˙ñ{åÍ'){
				}else if(soLanguage == LANGUAGE_JP  && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('êø\xa0\xa0ãÅ\xa0\xa0èë(çT)','êø\xa0\xa0ãÅ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(åoóùçT)');
					// add by zzq start
//				}else if(soLanguage == 'âpåÍ' && invoiceLanguage == 'ì˙ñ{åÍ'){
				}else if(soLanguage == LANGUAGE_EN && invoiceLanguage == LANGUAGE_JP){
					// add by zzq end
					pdfName.push('êø\xa0\xa0ãÅ\xa0\xa0èë(çT)','êø\xa0\xa0ãÅ\xa0\xa0èë','êø\xa0\xa0ãÅ\xa0\xa0èë(åoóùçT)');
					// add by zzq start
//				}else if(soLanguage == 'ì˙ñ{åÍ' && invoiceLanguage == 'âpåÍ'){
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
		if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
			// add by zzq start
//			if(soLanguage == 'âpåÍ'){
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
//			}else if(soLanguage == 'ì˙ñ{åÍ' || isEmpty(soLanguage)){
			}else if(soLanguage == LANGUAGE_JP || isEmpty(soLanguage)){
				// add by zzq end
				var bankName = 'à¯éÊã‚çs';
				if(pdfName[a] == 'î[\xa0\xa0ïi\xa0\xa0èë'){
					var titleName = 'â∫ãLÇÃí ÇËî[ïiívÇµÇ‹Ç∑ÅB';
				}
				var dateName = 'ì˙\xa0\xa0ït';
				var deliveryName = 'î[ïió\íËì˙ÅF';
				var numberName = 'î‘\xa0\xa0çÜ';
				var paymentName = 'éxï•èåè:';
				var orderName = 'ãMî≠íçî‘çÜ:';
				var codeName = 'ÉR\xa0\xa0Å[\xa0\xa0Éh';
				var poductName = 'ïi\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0ñº';
				var quantityName = 'êî\xa0\xa0\xa0ó ';
				var unitpriceName = 'íP\xa0\xa0\xa0âø';
				var amountName = 'ã‡\xa0\xa0\xa0äz';
				var tempName = 'îzëóâ∑ìx';
				var expirationDateNmae = 'óLå¯ä˙å¿:';
				var orderNameTwo = 'ãqêÊî≠íçî‘çÜ:';
				var taxRate = 'ê≈ó¶';
				var taxAmount = 'ê≈äz';
				var totalName = 'çá\xa0\xa0\xa0\xa0\xa0åv';
				var consumptionTax = 'è¡\xa0\xa0îÔ\xa0\xa0ê≈';
				var invoiceNameString = 'å‰\xa0êø\xa0ãÅ\xa0äz';
				var deliName = 'Ç®ìÕêÊ';
			}
		}else{
			var bankName = 'à¯éÊã‚çs';
			var titleName = 'â∫ãLÇÃí ÇËéÛóÃívÇµÇ‹Ç∑ÅB';
			var dateName = 'ì˙\xa0\xa0ït';
			var deliveryName = 'î[ïió\íËì˙ÅF';
			var numberName = 'î‘\xa0\xa0çÜ';
			var paymentName = 'éxï•èåè:';
			var orderName = 'ãMî≠íçî‘çÜ:';
			var codeName = 'ÉR\xa0\xa0Å[\xa0\xa0Éh';
			var poductName = 'ïi\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0ñº';
			var quantityName = 'êî\xa0\xa0\xa0ó ';
			var unitpriceName = 'íP\xa0\xa0\xa0âø';
			var amountName = 'ã‡\xa0\xa0\xa0äz';
			var tempName = 'îzëóâ∑ìx';
			var expirationDateNmae = 'óLå¯ä˙å¿:';
			var orderNameTwo = 'ãqêÊî≠íçî‘çÜ:';
			var taxRate = 'ê≈ó¶';
			var taxAmount = 'ê≈äz';
			var totalName = 'çá\xa0\xa0\xa0\xa0\xa0åv';
			var consumptionTax = 'è¡\xa0\xa0îÔ\xa0\xa0ê≈';
			var invoiceName = 'å‰\xa0êø\xa0ãÅ\xa0äz';
			var deliName = 'Ç®ìÕêÊ';
		}
		if(pdfName[a] == 'î[\xa0\xa0ïi\xa0\xa0èë' ||  pdfName[a] == 'Delivery Book' || (pdfName[a] == 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë')){
			nlapiLogExecution('debug','pdfName.length',pdfName.length)
			nlapiLogExecution('debug','pdfName[a]',pdfName[a])
			nlapiLogExecution('debug','receiptnoteFlag',receiptnoteFlag)
			//î[ïièë && ï®ïiéÛóÃèëPDF
			str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4">'+
			'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
			'<tr>'+
			'<td style="width: 330PX;">'+
			'<table>'+
			'<tr style="height: 20px;">'+
			'</tr>'+
			'<tr></tr>'+
			'<tr>'+
			'<td>Åß'+customerZipcode+'</td>'+
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
			if(pdfName [a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
				// add by zzq start
//				if(soLanguage == 'âpåÍ'){
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
			if(pdfName [a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
				// add by zzq start
//				if(soLanguage == 'âpåÍ'){
				if(soLanguage == LANGUAGE_EN){
					// add by zzq end
					str+='<td colspan="4" style="font-size:9px;">'+mainaddressEng+'</td>';
				}else{
					str+='<td colspan="4" style="font-size:10px;">Åß'+addressZip+'&nbsp;'+address+city+address1+address2+'</td>';
				}
			}else{
				str+='<td colspan="4" style="font-size:10px;">Åß'+addressZip+'&nbsp;'+address+city+address1+address2+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td colspan="4">'+bankName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+bankOne+'</td>'+
			'<td>&nbsp;'+branch_name1+'</td>'+
			'<td>ìñç¿óaã‡</td>'+
			'<td>'+bank_no1+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+bankTwo+'</td>'+
			'<td>&nbsp;'+branch_name2+'</td>'+
			'<td>ìñç¿óaã‡</td>'+
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
			if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
				// add by zzq start
//				if(soLanguage == 'âpåÍ'){
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
			if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){	
				if(expressFlg == 'T'){
					str+='<td style="width: 105px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+unitpriceName+'</td>';
					str+='<td style="width: 72px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+amountName+'</td>';	
				}
				str+='<td style="width: 52px;border-left: 1px solid white;color: white;background-color: black;line-height:20px;font-size:8px;" align="center" >'+tempName+'</td>';
			}else{
				str+='<td style="width: 205px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">éÛóÃàÛ</td>';
			}
			str+='</tr>';
				if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
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
						str+='<td colspan="3">Åu'+itemLineArr[j].storage_type+'Åv</td>';
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
					if(expressFlg == 'T' && pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
						str+='<tr>'+
						'<td align="right" style="font-size:10px;padding-top:2px;">'+taxRate+':</td>'+
						'</tr>';
					}
					str+='</table>'+
					'</td>';
					if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
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
					if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
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
				//éÛóÃèëPDF:íçï∂èëÇÃéÛóÃèëÉtÉâÉOëIëèoóÕñæç◊çsÉfÅ[É^
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
							str+='<td colspan="3">Åu'+itemLineArr[j].storage_type+'Åv</td>';
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
						if(expressFlg == 'T' && pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
							str+='<tr>'+
							'<td align="right" style="font-size:10px;padding-top:2px;">'+taxRate+':</td>'+
							'</tr>';
						}
						str+='</table>'+
						'</td>';
						if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
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
						if(pdfName[a] == 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
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
				if(pdfName[a] == 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë' ){
					str+='<tr>'+
					'<td style="border-left: 2px solid black;"></td>'+
					'<td style="border-left: 1px solid black;"></td>'+
					'<td style="border-left: 1px solid black;"></td>'+
					'<td style="border-left: 1px solid black;">'+
					'<table style="width:205px;height:70px;">'+
					'<tr>'+
					'<td align="center">îN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;åé&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ì˙</td>'+
					'</tr>'+
					'<tr>'+
					'<td align="center">&nbsp;</td>'+
					'</tr>'+
					'<tr>'+
					'<td align="center">éÛóÃÇ¢ÇΩÇµÇ‹ÇµÇΩÅB</td>'+
					'</tr>'+
					'</table>'+
					'</td>'+
					'</tr>';
				}
				//20230425 add by zhou end
			}
		    //20230425 changed by zhou start
//			if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë'){
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
//				'<td align="center">îN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;åé&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ì˙</td>'+
//				'</tr>'+
//				'<tr>'+
//				'<td align="center">&nbsp;</td>'+
//				'</tr>'+
//				'<tr>'+
//				'<td align="center">éÛóÃÇ¢ÇΩÇµÇ‹ÇµÇΩÅB</td>'+
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
			if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë' && expressFlg == 'T'){
				str+='<td style="width: 80px;height:30px;background-color: black;color: white;padding-top:15px;font-size:8px;" align="center">'+totalName+'</td>'+
				'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+amountTotal+'</td>';
			}
			str+='</tr>'+	
			'<tr>'+
			'<td style="width:470px;">&nbsp;&nbsp;'+deliName+':'+destinationName+'</td>';
			if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë' && expressFlg == 'T'){
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
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Åß'+destinationZip+'&nbsp; '+destinationState+'</td>'+
				'</tr>';
			}
			str+='</table>'+
			'</td>';
			if(pdfName[a] != 'ï®\xa0\xa0ïi\xa0\xa0éÛ\xa0\xa0óÃ\xa0\xa0èë' && expressFlg == 'T'){
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
//			if(invoiceLanguage == 'âpåÍ'){
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
//			}else if(invoiceLanguage == 'ì˙ñ{åÍ' || isEmpty(invoiceLanguage)){
			}else if(invoiceLanguage == LANGUAGE_JP || isEmpty(invoiceLanguage)){
				// add by zzq end
				
				var bankName = 'à¯éÊã‚çs';
				if(pdfName[a] == 'êø\xa0\xa0ãÅ\xa0\xa0èë(çT)' || pdfName == 'êø\xa0\xa0ãÅ\xa0\xa0èë' || pdfName == 'êø\xa0\xa0ãÅ\xa0\xa0èë(åoóùçT)'){
					var titleName = 'â∫ãLÇÃí ÇËÇ≤êøãÅê\Çµè„Ç∞Ç‹Ç∑ÅB';
				}
				var dateName = 'ì˙\xa0\xa0ït';
				var deliveryName = 'î[ïió\íËì˙ÅF';
				var numberName = 'î‘\xa0\xa0çÜ';
				var paymentName = 'éxï•èåè:';
				var orderName = 'ãMî≠íçî‘çÜ:';
				var codeName = 'ÉR\xa0\xa0Å[\xa0\xa0Éh';
				var poductName = 'ïi\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0ñº';
				var quantityName = 'êî\xa0\xa0\xa0ó ';
				var unitpriceName = 'íP\xa0\xa0\xa0âø';
				var amountName = 'ã‡\xa0\xa0\xa0äz';
				var tempName = 'îzëóâ∑ìx';
				var expirationDateNmae = 'óLå¯ä˙å¿:';
				var orderNameTwo = 'ãqêÊî≠íçî‘çÜ:';
				var taxRate = 'ê≈ó¶';
				var taxAmount = 'ê≈äz';
				var totalName = 'çá\xa0\xa0\xa0\xa0\xa0åv';
				var consumptionTax = 'è¡\xa0\xa0îÔ\xa0\xa0ê≈';
				var invoiceNameString = 'å‰\xa0êø\xa0ãÅ\xa0äz';
				var deliName = 'Ç®ìÕêÊ';
				//20230511 add by zhou DENISJAPAN-759 start	
				var invoiceIssuerNumberName = 'ìKäiêøãÅèëî≠çséñã∆é“î‘çÜ:';
				//20230511 add by zhou DENISJAPAN-759 end
			}
			nlapiLogExecution('debug','êøãÅèëPDF',invoiceIssuerNumberName);
			//êøãÅèëPDF
			str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4">'+
			'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
			'<tr>'+
			'<td style="width: 330PX;">'+
			'<table>'+
			'<tr style="height: 20px;">'+
			'</tr>'+
			'<tr></tr>'+
			'<tr>'+
			'<td>Åß'+invoiceZipcode+'</td>'+
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
//			if(invoiceLanguage == 'âpåÍ'){
			if(invoiceLanguage == LANGUAGE_EN){
				// add by zzq end
				str+='<td colspan="4">'+invoiceNameEng+'</td>';
			}else{
				str+='<td colspan="4">'+invoiceName+'</td>';
			}
			//20230511 add by zhou DENISJAPAN-759 start	
			str+='</tr>';
			// add by zzq start
//			if(invoiceLanguage == 'âpåÍ'){
			if(invoiceLanguage == LANGUAGE_EN){
				// add by zzq end
				str+='<tr><td colspan="4" style="font-size:9px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'</td></tr>';
			}else{
				str+='<tr><td colspan="4" style="font-size:9px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'</td></tr>';
			}
			// add by zzq start
//			if(invoiceLanguage == 'âpåÍ'){
			if(invoiceLanguage == LANGUAGE_EN){
				// add by zzq end
				str+='<tr><td colspan="4" style="font-size:9px;">'+invoiceAddressEng+'</td>';
			//20230511 add by zhou DENISJAPAN-759 end
			}else{
				str+='<tr><td colspan="4" style="font-size:10px;">Åß'+invoiceAddressZip+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td colspan="4">'+bankName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceBankOne+'</td>'+
			'<td>&nbsp;'+invbranch_name1+'</td>'+
			//20230511 add by zhou DENISJAPAN-759 start	
//			'<td>ìñç¿óaã‡</td>'+
			'<td>'+bankType1+'</td>'+
			//20230511 add by zhou DENISJAPAN-759 end
			'<td>'+invbank_no1+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+invoiceBankTwo+'</td>'+
			'<td>&nbsp;'+invbranch_name2+'</td>'+
			//20230511 add by zhou DENISJAPAN-759 start	
//			'<td>ìñç¿óaã‡</td>'+
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
//			if(invoiceLanguage == 'âpåÍ'){
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
					str+='<td colspan="3">Åu'+invoiceItemArr[j].invoiceStorage_type+'Åv</td>';
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
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Åß'+invdestinationZip+'&nbsp; '+invdestinationState+'</td>'+
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
	var xlsFileo = nlapiCreateFile('ÉeÉXÉgópêøãÅèëèoóÕ' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
	
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
	nlapiLogExecution('debug', 'ÉGÉâÅ[', e.message)

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