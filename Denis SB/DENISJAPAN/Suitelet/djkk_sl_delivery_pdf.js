/**
 * DJ_納品書PDF
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
		var salesrepSearchColumn =  new nlobjSearchColumn("salesrep");//顧客(For retrieval)
		var subsidiarySearchColumn = new nlobjSearchColumn("subsidiary");//連結子会社 (For retrieval)
		var entitySearchColumn =  new nlobjSearchColumn("entity");//顧客(For retrieval)
		var tranidSearchColumn = new nlobjSearchColumn("tranid");//請求書番号
		var tranNumberSearchColumn = new nlobjSearchColumn("transactionnumber");//請求書トランザクション番号
		var memoSearchColumn = new nlobjSearchColumn("custbody_djkk_deliverynotememo");//memo
		var paymentConditionsColumn = new nlobjSearchColumn("custbody_djkk_payment_conditions");//支払条件
		var otherrefnumSearchColumn =  new nlobjSearchColumn("otherrefnum");//御社発注番号
		// バリエーション支援 20230803 update by zdj start
		//var transactionnumberSearchColumn = new nlobjSearchColumn("transactionnumber","createdFrom",null);//受注番号(maybe not true)
		var transactionnumberSearchColumn = new nlobjSearchColumn("custbody_djkk_exsystem_tranid");//DJ_外部システム連携_注文番号
		// バリエーション支援 20230803 update by zdj end
		var deliveryCodeSearchColumn =  new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先コード
		// add by zzq CH600 20230612 start
		var deliverySearchColumn =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//DJ_納品先
		// add by zzq CH600 20230612 end
		var deliveryNameSearchColumn = new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先名前
		var deliveryZipSearchColumn = new nlobjSearchColumn("custrecord_djkk_zip","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_郵便番号
		var deliveryPrefecturesSearchColumn = new nlobjSearchColumn("custrecord_djkk_prefectures","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_都道府県
		var deliveryMunicipalitiesSearchColumn = new nlobjSearchColumn("custrecord_djkk_municipalities","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_市区町村
		var deliveryResidenceSearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所1
		// add by zzq CH653 20230619 start
//		var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所2
		var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_lable","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所2
		var deliveryResidence3SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所3
		// add by zzq CH653 20230619 end
		var duedateSearchColumn = new nlobjSearchColumn("duedate");//発行日
		var deliveryDateSearchColumn = new nlobjSearchColumn("custbody_djkk_delivery_date");//DJ_納品日
	
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
		var subsidiary = defaultEmpty(invoiceSearch[0].getValue(subsidiarySearchColumn));//連結子会社internalid (For retrieval)
		// add by zhou 20230602 CH601 start
		var memo = defaultEmpty(invoiceSearch[0].getValue(memoSearchColumn));//メモ
		// add by zhou 20230602 CH601 end
		nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)	
		var subsidiaryrSearch = nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",subsidiary]
				], 
				[
				 	new nlobjSearchColumn("legalname"),//連結正式名称
				 	new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),//連結DJ_会社名前英語
				 	new nlobjSearchColumn("fax"),//発注専用FAX
//				 	new nlobjSearchColumn("phone"), //連結TEL?????
				 	new nlobjSearchColumn("custrecord_djkk_address_fax","Address",null), //連結FAX
				    new nlobjSearchColumn("phone","Address",null),//連結TEL
				 	new nlobjSearchColumn("custrecord_djkk_shippingdeliverynotice"),//DJ_出荷案内・価格入り納品書出力用お知らせ文言
	                //CH655 20230725 add by zdj start
                    new nlobjSearchColumn("phone","shippingAddress",null),//配送先phone
                    new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//配送先fax
                  //CH655 20230725 add by zdj end
				]
				);
		var legalName = defaultEmpty(subsidiaryrSearch[0].getValue("legalname"));//連結正式名称
		var EnglishName = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_subsidiary_en"));//連結DJ_会社名前英語
		var Fax = 'FAX: ' + defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","Address",null));//連結FAX
		nlapiLogExecution('DEBUG', 'FAX', Fax)
		var phone = 'TEL: ' + defaultEmpty(subsidiaryrSearch[0].getValue("phone","Address",null));//連結TEL	
		var transactionFax = defaultEmpty(subsidiaryrSearch[0].getValue("fax"));//発注専用FAX
		nlapiLogExecution('DEBUG', 'transactionFax', transactionFax)
		var shippingdeliverynotice = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_shippingdeliverynotice"));//DJ_出荷案内・価格入り納品書出力用お知らせ文言
	    //CH655 20230725 add by zdj start
        var shipaddressPhone= 'TEL: ' + defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("phone","shippingAddress",null));//配送先phone
        var shipaddressFax= defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","shippingAddress",null));//配送先fax
        //CH655 20230725 add by zdj end
		var entity = defaultEmpty(invoiceSearch[0].getValue(entitySearchColumn));//顧客internalid(For retrieval)	
		var customerSearch = nlapiSearchRecord("customer",null,
				[
				   ["internalid","anyof",entity]
				], 
				[	
				 	new nlobjSearchColumn("billcity"),//市区
				 	new nlobjSearchColumn("companyname"),//名前
	//			 	new nlobjSearchColumn("phone"),//
//				 	new nlobjSearchColumn("fax"),//fax
				 	new nlobjSearchColumn("custentity_djkk_exsystem_fax_text"),//fax
				 	new nlobjSearchColumn("entityid"),//顧客code
				 	new nlobjSearchColumn("zipcode","Address",null),
				 	new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//
				 	new nlobjSearchColumn("address1","Address",null),//
				 	new nlobjSearchColumn("address2","Address",null),//
				 	new nlobjSearchColumn("addressee","Address",null),//	
				 	// add by zhou 20230608 CH600 start
				 	new nlobjSearchColumn("custentity_djkk_exsystem_phone_text"),//顧客TEL
				    // add by zhou 20230608 CH600 end
				 	//add by zzq CH690 20230627 start
				 	new nlobjSearchColumn("currency"),//顧客基本通貨 
					//add by zzq CH690 20230627 end
				 	// バリエーション支援 20230803 add by zdj start
				 	new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_顧客支払条件
		    	    new nlobjSearchColumn("terms"), //支払い条件
		    	    new nlobjSearchColumn("custentity_djkk_delivery_book_subname"), //DJ_価格入り納品書送信先会社名(3RDパーティー)
		    	    new nlobjSearchColumn("custentity_djkk_delivery_book_person_t") //DJ_価格入り納品書送信先担当者(3RDパーティー)
				 	// バリエーション支援 20230803 add by zdj end
				]
				);
		var customerRecord=nlapiLoadRecord('customer', entity);
		//var paymentPeriodMonths = defaultEmpty(customerRecord.getLineItemValue("recmachcustrecord_suitel10n_jp_pt_customer","custrecord_suitel10n_jp_pt_paym_due_mo_display",1));//支払期限月
		var customePhone = customerRecord.getLineItemValue("addressbook","phone",1);//p
		if(customerSearch != null){
			// バリエーション支援 20230803 update by zdj start
			var companyName1 = defaultEmpty(customerSearch[0].getValue("companyname"));//顧客名
			var companyNameCustomer = defaultEmpty(customerSearch[0].getValue("companyname"));//DJ_価格入り納品書送信先会社名(3RDパーティー)
			var personCustomer = defaultEmpty(customerSearch[0].getValue("custentity_djkk_delivery_book_person_t"));//DJ_価格入り納品書送信先担当者(3RDパーティー)
			// バリエーション支援 20230803 update by zdj end
			var billcity = defaultEmpty(customerSearch[0].getValue("billcity"));//市区
			var customerCode = defaultEmpty(customerSearch[0].getValue("entityid"));//顧客code
//			var customeFax = defaultEmpty(customerSearch[0].getValue("fax"));//顧客FAX
			var customeFax = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_fax_text"));//顧客FAX
			nlapiLogExecution('DEBUG', 'customeFax', customeFax);
			// add by zhou 20230608 CH600 start
//			var customePhone = defaultEmpty(customerSearch[0].getValue("phone"));//顧客TEL
			var customePhone = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_phone_text"));//顧客TEL
			// add by zhou 20230608 CH600 end
		    var custZipCode = defaultEmpty(customerSearch[0].getValue("zipcode","Address",null));//顧客郵便
		    // バリエーション支援 20230803 add by zdj start
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
			// バリエーション支援 20230803 add by zdj end
			if(custZipCode && custZipCode.substring(0,1) != '〒'){
				custZipCode = '〒' + custZipCode;
			}else{
				custZipCode = '';
			}
			//add by zzq CH690 20230627 start
			var custcurrency = defaultEmpty(customerSearch[0].getValue("currency"));////顧客基本通貨
			//add by zzq CH690 20230627 end
			var custState = defaultEmpty(customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//顧客都道府県
			var custAddr1 = defaultEmpty(customerSearch[0].getValue("address1","Address",null));//顧客住所１
			var custAddr2 = defaultEmpty(customerSearch[0].getValue("address2","Address",null));//顧客住所２
			var custAddr3 = defaultEmpty(customerSearch[0].getValue("address3","Address",null));//顧客住所3
			var custAddressee = defaultEmpty(customerSearch[0].getValue("addressee","Address",null));//顧客宛先
		}
		var tranid = defaultEmpty(invoiceSearch[0].getValue(tranidSearchColumn));//請求書番号
		var tranNumber = defaultEmpty(invoiceSearch[0].getValue(tranNumberSearchColumn));//請求書番号
		var salesrep =  defaultEmpty(invoiceSearch[0].getText(salesrepSearchColumn));//営業担当者
		var otherrefnum = defaultEmpty(invoiceSearch[0].getValue(otherrefnumSearchColumn));//御社発注番号
		var transactionnumber = defaultEmpty(invoiceSearch[0].getValue(transactionnumberSearchColumn));//受注番号(maybe not true)
		if(isEmpty(transactionnumber)){
			transactionnumber = '';
		}
		var deliveryCode = defaultEmpty(invoiceSearch[0].getValue(deliveryCodeSearchColumn));//DJ_納品先 : DJ_納品先コード
		// add by CH600 20230612 start
		var deliveryId = defaultEmpty(invoiceSearch[0].getValue(deliverySearchColumn));//DJ_納品先
		nlapiLogExecution('DEBUG', 'deliveryId', deliveryId);
		//CH736　20230717 by zzq start
		var invoiceRecord = nlapiLoadRecord('invoice',invoiceid);
		var letter01 = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_site_fd')); //DJ_価格入り納品書送信先区分
		nlapiLogExecution('debug', 'letter01', letter01);
		var letter02 = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_fax_three')); //DJ_価格入り納品書送信先FAX(3RDパーティー)
		nlapiLogExecution('debug', 'letter02', letter02);
		var companyNameInvo = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_subname'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
		 // CH807 add by zzq 20230815 start
        var personInvo = '納品書ご担当者様'; 
        var person_3rd = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
        var person = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_person'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
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
            // バリエーション支援 20230803 update by zdj start
            companyNameDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecorddjkk_name'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
            personDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_delivery_book_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
            // バリエーション支援 20230803 update by zdj end
        }
     // バリエーション支援 20230803 add by zdj start
        var companyName = '';
     // バリエーション支援 20230803 add by zdj end
        if(letter01){
		if(letter01 == '14'){   //3rdパーティー
			// バリエーション支援 20230803 add by zdj start
			companyName = companyNameInvo + ' ' + personInvo;
			// バリエーション支援 20230803 add by zdj end
		    if(letter02){
		       deliveryCodeFax = letter02;
		    }
		}else if(letter01 == '15'){  //納品先
			// バリエーション支援 20230803 add by zdj start
			// CH807 add by zzq 20230815 start
//			companyName = companyNameDelivery + ' ' + '納品書ご担当者様';
			companyName = companyNameDelivery + ' ' + personInvo;
			// CH807 add by zzq 20230815 end
			// バリエーション支援 20230803 add by zdj end
		    if(deliveryId && !isEmpty(deliveryFax)){
	           deliveryCodeFax = deliveryFax;
	        }
		}else if(letter01 == '16'){  //顧客先
			// バリエーション支援 20230803 add by zdj start
			// CH807 add by zzq 20230815 start
//			companyName = companyNameCustomer + ' ' + '納品書ご担当者様';
			companyName = companyNameCustomer + ' ' + personInvo;
			// CH807 add by zzq 20230815 end
			// バリエーション支援 20230803 add by zdj end
		    if(customeFax){
                deliveryCodeFax = customeFax;
          }
		 }
        }else{
            if(customeFax){
                deliveryCodeFax = customeFax;   
            }
         // バリエーション支援 20230803 add by zdj start
         // CH807 add by zzq 20230815 start
//            companyName = companyNameCustomer + ' ' + '納品書ご担当者様';
            companyName = companyNameCustomer + ' ' + personInvo;
            // CH807 add by zzq 20230815 end
         // バリエーション支援 20230803 add by zdj end
        }
		//CH736　20230717 by zzq end
		// add by CH600 20230612 end
		var deliveryName = defaultEmpty(invoiceSearch[0].getValue(deliveryNameSearchColumn));//DJ_納品先 : DJ_納品先名前
		var deliveryZip = defaultEmpty(invoiceSearch[0].getValue(deliveryZipSearchColumn));//DJ_納品先 : DJ_郵便番号
		if(deliveryZip && deliveryZip.substring(0,1) != '〒'){
			deliveryZip = '〒' + deliveryZip;
		}else{
			deliveryZip = '';
		}
		var deliveryPrefectures = defaultEmpty(invoiceSearch[0].getValue(deliveryPrefecturesSearchColumn));//DJ_納品先 : DJ_都道府県
		var deliveryMunicipalities = defaultEmpty(invoiceSearch[0].getValue(deliveryMunicipalitiesSearchColumn));//DJ_納品先 : DJ_市区町村
		var deliveryResidence = defaultEmpty(invoiceSearch[0].getValue(deliveryResidenceSearchColumn));//DJ_納品先 : DJ_納品先住所1
		//add by zzq CH653 20230619 start
		var deliveryResidence2 = defaultEmpty(invoiceSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_納品先 : DJ_納品先住所2
		var deliveryResidence3 = defaultEmpty(invoiceSearch[0].getValue(deliveryResidence3SearchColumn));//DJ_納品先 : DJ_納品先住所3
		//add by zzq CH653 20230619 end
		var duedate = defaultEmpty(invoiceSearch[0].getValue(duedateSearchColumn));//発行日
		var deliveryDate = defaultEmpty(invoiceSearch[0].getValue(deliveryDateSearchColumn));//DJ_納品日
		
		//アイテム 
		var itemIdArray = [];
		var itemDetails = [];
		var amountTotal = 0;
		var taxTotal = 0;
		var taxType = {};
		var invoiceRecord = nlapiLoadRecord("invoice",invoiceid)
		// バリエーション支援 20230803 add by zdj start
		var tmpLocationDic = getLocations(invoiceRecord);
		// バリエーション支援 20230803 add by zdj end
		var Counts = invoiceRecord.getLineItemCount('item');//アイテム明細部
		if(Counts != 0) {
			for(var s = 1; s <=  Counts; s++){
				var item = defaultEmpty(invoiceRecord.getLineItemValue('item', 'item', s));//アイテムID
				var quantity = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item', 'quantity', s)));//数量
                var quantityFormat = 0;
                if (quantity) {
                    quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
                }
				
				var units_display = defaultEmpty(invoiceRecord.getLineItemValue('item', 'units_display', s));//単位
				
				 if(!isEmpty(units_display)){
				     var unitsArray = units_display.split("/");
                     if(!isEmpty(unitsArray)){
                         units_display = unitsArray[0];
                     }
				 }
				
				var origrate = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'rate', s)));//単価
				nlapiLogExecution('debug', 'origrate000', origrate);
//				var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				origrateFormat = formatAmount1(origrate);
				nlapiLogExecution('debug', 'origrateFormat', origrateFormat);
				
				var amount = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'amount', s)));//金額
				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		
				var taxRate = defaultEmpty(invoiceRecord.getLineItemValue('item', 'taxrate1', s));//税率
				
				var taxAmount = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'tax1amt', s)));//税額
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
		                   new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), //配送料フラグ
		                   //20230608 add by zzq CH653 end
		                   //20230720 add by zzq CH735 start
		                   new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_品名（日本語）LINE1
		                   new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), //DJ_品名（日本語）LINE2
		                   new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_品名（英語）LINE1
		                   new nlobjSearchColumn("custitem_djkk_product_name_line2"), //DJ_品名（英語）LINE2
		                   // バリエーション支援 20230803 add by zdj start
		                   new nlobjSearchColumn("custitem_djkk_product_code"), //カタログ製品コード
		                   // バリエーション支援 20230803 add by zdj end
		                   new nlobjSearchColumn("type")// 種類
						   //20230720 add by zzq CH735 end
						]
						);	
				//20230720 add by zzq CH735 start
//				var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));
//				displayname = displayname.replace(new RegExp("&","g"),"&amp;")
				var invoiceItemType = defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("type")); //アイテムtype
				var itemDisplayName= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//商品名
				// バリエーション支援 20230803 add by zdj start
				var productCode= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("custitem_djkk_product_code"));//カタログ製品コード
				// バリエーション支援 20230803 add by zdj end
				var displayname = '';
				//add by zdj 20230802 start
				var itemNouhinBikou = invoiceRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',s); //DJ_納品書備考
				//add by zdj 20230802 end
				 // アイテムは再販用その他の手数料
				if(invoiceItemType == 'OthCharge') {
				    displayname = othChargeDisplayname(itemDisplayName); // 手数料
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
				// バリエーション支援 20230803 add by zdj start
				var itemLocId = defaultEmpty(invoiceRecord.getLineItemValue('item','location',s)); // 場所
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
		        // バリエーション支援 20230803 add by zdj end
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
	                     item : item,// アイテムID
	                     units_display : units_display,// 単位
//	                     amount : defaultEmptyToZero1(amount),// 金額
	                     amount : formatAmount1(amount),// 金額
	                     quantity : quantity,// 数量
//	                     origrate : defaultEmptyToZero1(origrate),// 単価
	                     origrate : formatAmount1(origrate),// 単価
	                     displayname:displayname,// 商品d名
	                     itemid:itemid,// 商品code
	                     // add by zzq CH653 20230618 start
	                     deliverychargeFlg:deliverychargeFlg// 配送料フラグ
	                     // add by zzq CH653 20230618 end
	                     });
	                     
	              }else{
	                     itemDetails.push({
	                     item : item,// アイテムID
	                     units_display : units_display,// 単位
	                     amount : amountFormat,// 金額
	                     quantity : quantityFormat,// 数量
	                     origrate : origrateFormat,// 単価
	                     displayname:displayname,// 商品d名
	                     itemid:itemid,// 商品code
	                     // add by zzq CH653 20230618 start
	                     deliverychargeFlg:deliverychargeFlg// 配送料フラグ
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
				salesrep:salesrep,//営業担当者
				legalName:legalName,//連結正式名称
				EnglishName:EnglishName,//連結DJ_会社名前英語
				transactionFax:transactionFax,//発注専用FAX
				//CH655 20230725 add by zdj start
				shipaddressPhone:shipaddressPhone,//連結配送先phone
				shipaddressFax:shipaddressFax,//連結配送先fax
				//CH655 20230725 add by zdj end
				phone:phone,//連結TEL
				Fax:Fax,//連結FAX
				paymentPeriodMonths:paymentPeriodMonths,//支払期限月
				companyName :companyName,//顧客名
				companyName1 : companyName1,
				customeFax:customeFax,//顧客FAX
				billcity:billcity,//市区
				customerCode:customerCode,//顧客codeNum
				customePhone:customePhone,//顧客TEL
			    custZipCode :custZipCode,//顧客郵便
				custState:custState,//顧客都道府県
				custAddr1:custAddr1,//顧客住所１
				custAddr2:custAddr2,//顧客住所２
				custAddr3:custAddr3,//顧客住所3
				custAddressee:custAddressee,//顧客宛先
				tranid:tranid,//請求書番号
				tranNumber:tranNumber,//請求書番号
				otherrefnum:otherrefnum,//御社発注番号
				transactionnumber:transactionnumber,//受注番号(maybe not true)
				deliveryCode:deliveryCode,//DJ_納品先 : DJ_納品先コード
				deliveryName :deliveryName,//DJ_納品先 : DJ_納品先名前
				deliveryZip:deliveryZip,//DJ_納品先 : DJ_郵便番号
				deliveryPrefectures :deliveryPrefectures,//DJ_納品先 : DJ_都道府県
				deliveryMunicipalities: deliveryMunicipalities,//DJ_納品先 : DJ_市区町村
				deliveryResidence:deliveryResidence,//DJ_納品先 : DJ_納品先住所1
				deliveryResidence2 :deliveryResidence2,//DJ_納品先 : DJ_納品先住所2
				//add by zzq CH653 20230619 start
				deliveryResidence3 :deliveryResidence3,//DJ_納品先 : DJ_納品先住所3
				//add by zzq CH653 20230619 end
				duedate:duedate,//発行日
				deliveryDate:deliveryDate,//DJ_納品日
				// add by zhou 20230602 CH601 start
				memo:memo,//メモ
				// add by zhou 20230602 CH601 end
				// add by zzq 20230612 CH600 start
				deliveryCodeFax : deliveryCodeFax
				//add by zzq 20230612 CH600 end
				};
		var TotalForTaxEight = 0;
		var TotalForTaxTen = 0;
		for(var k in taxType){
			if(k == '8.0%'){
				 TotalForTaxEight = taxType[k];//税率8%で税金総額
			}else if(k == '10.0%'){
				 TotalForTaxTen = taxType[k];//税率20%で税金総額
			}
		}
//		var total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
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
//			total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
			total = ( amountTotal + taxTotal ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
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
		'<td colspan="3" rowspan="2" align="center" style="margin-left:25px;border-bottom: 4px black solid;vertical-align:bottom;font-size: 32px;letter-spacing: 35px;line-height:10%;">&nbsp;納品書</td>'+
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
		// バリエーション支援 20230803 update by zdj start
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.phone+'／発注専用FAX：'+headValue.transactionFax+'</td>'+
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'／発注専用FAX：'+headValue.transactionFax+'</td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'／発注専用FAX：'+headValue.shipaddressFax+'</td>'+
		// バリエーション支援 20230803 update by zdj end
		//CH655 20230725 add by zdj end
		''+
		'</tr>'+
		'<tr style="height:12px">'+
		''+
		'<td colspan="3"></td>'+
		'<td></td>'+
		//CH655 20230725 add by zdj start
//		'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.Fax+'</td>'+
		// バリエーション支援 20230803 update by zdj start
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.shipaddressFax+'</td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
		// バリエーション支援 20230803 update by zdj end
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
		'<td colspan="7" style="font-size: 12px; font-weight: bold;">平素は格別のお引き立て有難うございます。この度はご注文ありがとうございました。</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;border-bottom: 4px solid black;">下記の通り納品致しましたので、ご査収ください。 </td>'+
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
		'<td>&nbsp;&nbsp;請求先：</td>'+
		'<td>'+headValue.customerCode+'</td>'+
		'<td colspan="4">'+dealFugou(headValue.companyName1)+'</td>'+
//		'<td align="center">I</td>'+
		'<td align="center">&nbsp;</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td></td>'+
		'<td>〒 &nbsp;550-0002</td>'+
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
//		'<td style="width: 90px;border-top: 1px solid black;">&nbsp;&nbsp;請求書番号：</td>'+
//		'<td style="width: 100px;border-top: 1px solid black;">'+headValue.tranNumber+'</td>'+
//		'<td style="width: 60px;border-top: 1px solid black;"><span>森本</span><span style="margin-left: 15px;">06</span></td>'+
//		'<td width="60px" style="border-top: 1px solid black;">発行日：</td>'+
//		'<td width="120px" style="border-top: 1px solid black;">'+headValue.duedate+'</td>'+
//		// add by zhou 20230602 CH601 start
////		'<td colspan="2" style="border-top: 1px solid black;">備考</td>'+
//		'<td colspan="2" style="border-top: 1px solid black; overflow: hidden;">備考：'+getStrLenSlice(dealFugou(headValue.memo), 14)+'</td>'+
//		// add by zhou 20230602 CH601 end
//		'</tr>'+
		//20230720 by zzq start
	    '<tr style="font-weight: 460;font-size: 13px;">'+
	    '<td style="width: 90px;">&nbsp;&nbsp;請求書番号：</td>'+
	    '<td style="width: 100px;">'+headValue.tranNumber+'</td>'+
	    '<td style="width: 60px;"><span>森本</span><span style="margin-left: 15px;">06</span></td>'+
	    // バリエーション支援 20230803 update by zdj start
	    //'<td width="60px">発行日：</td>'+
	    //'<td width="120px">'+headValue.duedate+'</td>'+
	    '<td width="60px">納品日：</td>'+
	    '<td width="120px">'+headValue.deliveryDate+'</td>'+
	    // バリエーション支援 20230803 update by zdj end
	    // add by zhou 20230602 CH601 start
//	    '<td colspan="2" style="border-top: 1px solid black;">備考</td>'+
	    '<td colspan="2">備考：'+getStrLenSlice(dealFugou(headValue.memo), 14)+'</td>'+
	    // add by zhou 20230602 CH601 end
	    '</tr>'+
	  //20230720 by zzq end
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;受注番号：</td>'+
		'<td colspan="2">'+headValue.transactionnumber+'</td>'+
		// バリエーション支援 20230803 update by zdj start
		//'<td>納品日：</td>'+
		//'<td>'+headValue.deliveryDate+'</td>'+
		'<td>納品先：</td>'+
		'<td>'+headValue.deliveryCode+'</td>'+
		//'<td colspan="2"></td>'+
		'<td colspan="2" rowspan="2">'+dealFugou(headValue.deliveryName)+'</td>'+
		// バリエーション支援 20230803 update by zdj end
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;御社発注番号</td>'+
		'<td colspan="2">'+headValue.otherrefnum+'</td>'+
		// バリエーション支援 20230803 update by zdj start
		//'<td>納品先：</td>'+
		//'<td>'+headValue.deliveryCode+'</td>'+
		'<td colspan="2">&nbsp;</td>'+
		'</tr>'+
		// バリエーション支援 20230803 update by zdj end
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td style="vertical-align:top;">&nbsp;&nbsp;支払条件：</td>'+
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
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">明&nbsp;&nbsp;細</td>'+
		'<td width="15px" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td colspan="2" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">数量</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">単価</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">金額</td>'+
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
//		'<td width="170px" style="border-top:1px solid black">&nbsp;合計</td>'+
		'<td width="80px"  style="border-top:1px solid black">&nbsp;合計</td>'+
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
		'<td width="150px">8% 対象合計(税込)</td>'+
		'<td width="70px"  style="border-right:1px solid black" align="right">'+displaysymbol + TotalForTaxEight+'&nbsp;</td>'+
		'<td width="80px">&nbsp;消費税</td>'+
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
		'<td width="250px" style="border-bottom:4px solid black">&nbsp;&nbsp;※軽減税率対象</td>'+
		'<td width="150px" style="border-bottom:4px solid black">10%対象合計(税込)</td>'+
		'<td width="70px"  style="border-bottom:4px solid black;border-right:1px solid black" align="right">'+displaysymbol + TotalForTaxTen+'&nbsp;</td>'+
		'<td width="80px"  style="border-bottom:4px solid black">&nbsp;合計(税込)</td>'+
//		'<td width="50px"  style="border-bottom:4px solid black" align="right">'+'￥' + total+'</td>'+
		'<td width="50px"  style="border-bottom:4px solid black" align="right">'+'￥' + total+'</td>'+
		'</tr>'+
		
		'<tr style="height:10px">'+
		''+
		'</tr>'+
		'<tr style="font-weight: bold;font-size: 14px;">'+
		/*******old******/
//		'<td colspan="5" align="center">現在、配送リードタイムをプラス１日とさせて頂いております。通常リードタイムに戻る際は<br/>、改めてご連絡申し上げます。<br/>コロナウィルス感染リスク軽減による、弊社テレワーク導入の為、大変ご迷惑をお掛け致し<br/>ますが、ご理解の程よろしくお願い申し上げます。</td>'+
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
		'<td colspan="5" align="center">***** 全<totalpages/>ページ：<pagenumber/>*****</td>'+
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
                var taxCodeText = itemDetails[k].deliverychargeFlg == 'T' ? '' : '※';
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
//            '<td style="vertical-align: top;" align="center">※</td>'+
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
//			var xlsFileo = nlapiCreateFile('納品' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
//			
//			xlsFileo.setFolder(109338);
//			nlapiSubmitFile(xlsFileo);
//		  
		  var xlsFile = nlapiXMLToPDF(xml);
		  
		  // PDF
		  //CH762 20230817 add by zdj start
		  //xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
		  xlsFile.setName('納品書' + '_' + tranNumber + '_' + getDateYymmddFileName() + '.pdf');
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
		// バリエーション支援 20230803 add by zdj start
		var tmpLocationDic = getLocations(creditmemoRecord);
		// バリエーション支援 20230803 add by zdj end
		var salesrepSearchColumn =  new nlobjSearchColumn("salesrep");//顧客(For retrieval)
		var subsidiarySearchColumn = new nlobjSearchColumn("subsidiary");//連結子会社 (For retrieval)
		var entitySearchColumn =  new nlobjSearchColumn("entity");//顧客(For retrieval)
		var tranidSearchColumn = new nlobjSearchColumn("tranid");//請求書番号
		var memoSearchColumn = new nlobjSearchColumn("custbody_djkk_deliverynotememo");//memo
		var otherrefnumSearchColumn =  new nlobjSearchColumn("otherrefnum");//御社発注番号
		// バリエーション支援 20230803 update by zdj start
		//var transactionnumberSearchColumn = new nlobjSearchColumn("transactionnumber");//受注番号(maybe not true)
		//CH762 20230817 add by zdj start
        var transactionnumberSearchColumn2 = new nlobjSearchColumn("transactionnumber");//受注番号(maybe not true)
        //CH762 20230817 add by zdj start
		var transactionnumberSearchColumn = new nlobjSearchColumn("custbody_djkk_exsystem_tranid");//DJ_外部システム連携_注文番号
		// バリエーション支援 20230803 update by zdj start
		var deliveryCodeSearchColumn =  new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先コード
		var deliveryNameSearchColumn = new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先名前
		var deliveryZipSearchColumn = new nlobjSearchColumn("custrecord_djkk_zip","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_郵便番号
		var deliveryPrefecturesSearchColumn = new nlobjSearchColumn("custrecord_djkk_prefectures","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_都道府県
		var deliveryMunicipalitiesSearchColumn = new nlobjSearchColumn("custrecord_djkk_municipalities","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_市区町村
		var deliveryResidenceSearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所1
	      // add by zzq CH653 20230619 start
//      var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所2
        var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_lable","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所2
        var deliveryResidence3SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所3
        // add by zzq CH653 20230619 end
		var deliveryDateSearchColumn = new nlobjSearchColumn("custbody_djkk_delivery_date");//DJ_納品日
		// add by zzq CH600 20230612 start
        var deliverySearchColumn =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//DJ_納品先
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
		var subsidiary = defaultEmpty(creditmemoSearch[0].getValue(subsidiarySearchColumn));//連結子会社internalid (For retrieval)
		// add by zhou 20230602 CH601 start
		var memo = defaultEmpty(creditmemoSearch[0].getValue(memoSearchColumn));//メモ
		// add by zhou 20230602 CH601 end
		nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)	
		var subsidiaryrSearch = nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",subsidiary]
				], 
				[
				 	new nlobjSearchColumn("legalname"),//連結正式名称
				 	new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),//連結DJ_会社名前英語
				 	new nlobjSearchColumn("fax"),//発注専用FAX
//				 	new nlobjSearchColumn("phone"), //連結TEL?????
				 	new nlobjSearchColumn("custrecord_djkk_address_fax","Address",null), //連結FAX
				    new nlobjSearchColumn("phone","Address",null),//連結TEL
				 	new nlobjSearchColumn("custrecord_djkk_shippingdeliverynotice"),//DJ_出荷案内・価格入り納品書出力用お知らせ文言
	                //CH655 20230725 add by zdj start
                    new nlobjSearchColumn("phone","shippingAddress",null),//配送先phone
                    new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//配送先fax
                    //CH655 20230725 add by zdj end
				]
				);
		var legalName = defaultEmpty(subsidiaryrSearch[0].getValue("legalname"));//連結正式名称
		var EnglishName = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_subsidiary_en"));//連結DJ_会社名前英語
		var Fax = 'FAX: ' + defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","Address",null));//連結FAX
		var phone = 'TEL: ' + defaultEmpty(subsidiaryrSearch[0].getValue("phone","Address",null));//連結TEL	
		var transactionFax = defaultEmpty(subsidiaryrSearch[0].getValue("fax"));//発注専用FAX
		var shippingdeliverynotice = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_shippingdeliverynotice"));//DJ_出荷案内・価格入り納品書出力用お知らせ文言
		//CH655 20230725 add by zdj start
        var shipaddressPhone= 'TEL: ' + defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("phone","shippingAddress",null));//配送先phone
        var shipaddressFax= defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","shippingAddress",null));//配送先fax
        //CH655 20230725 add by zdj end
		
		var entity = defaultEmpty(creditmemoSearch[0].getValue(entitySearchColumn));//顧客internalid(For retrieval)	
		nlapiLogExecution('DEBUG', 'entity', entity)
		var customerSearch = nlapiSearchRecord("customer",null,
				[
				   ["internalid","anyof",entity]
				], 
				[	
//				 	new nlobjSearchColumn("billcity"),//市区
				 	new nlobjSearchColumn("city"),//市区
				 	new nlobjSearchColumn("companyname"),//名前
				 	new nlobjSearchColumn("custentity_djkk_exsystem_phone_text"),//顧客TEL
//				 	new nlobjSearchColumn("fax"),//fax
				 	new nlobjSearchColumn("custentity_djkk_exsystem_fax_text"),//fax
				 	new nlobjSearchColumn("entityid"),//顧客code
				 	new nlobjSearchColumn("custentity_djkk_customer_payment"),//支払条件
				 	new nlobjSearchColumn("zipcode","Address",null),
				 	new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//
				 	new nlobjSearchColumn("address1","Address",null),//
				 	new nlobjSearchColumn("address2","Address",null),//
				 	new nlobjSearchColumn("address3","Address",null),//
				 	new nlobjSearchColumn("addressee","Address",null),//	
				 	//add by zzq CH690 20230627 start
				 	new nlobjSearchColumn("currency"),//顧客基本通貨 
					//add by zzq CH690 20230627 end
				 	// バリエーション支援 20230803 add by zdj start
				 	new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_顧客支払条件
		    	    new nlobjSearchColumn("terms"), //支払い条件
		    	    new nlobjSearchColumn("custentity_djkk_delivery_book_subname"), //DJ_価格入り納品書送信先会社名(3RDパーティー)
		    	    new nlobjSearchColumn("custentity_djkk_delivery_book_person_t") //DJ_価格入り納品書送信先担当者(3RDパーティー)
				 	// バリエーション支援 20230803 add by zdj end
				]
				);
		
		var customerRecord=nlapiLoadRecord('customer', entity);
		//20230728 add by zdj start
        var paymentPeriodMonths = defaultEmpty(customerRecord.getLineItemValue("recmachcustrecord_suitel10n_jp_pt_customer","custrecord_suitel10n_jp_pt_paym_due_mo_display",1));//支払期限月
        var customePhone = customerRecord.getLineItemValue("addressbook","phone",1);//p
        //20230728 add by zdj end
	if(!isEmpty(customerSearch)){
		// バリエーション支援 20230803 update by zdj start
		var companyName1 = defaultEmpty(customerSearch[0].getValue("companyname"));//顧客名
		var companyNameCustomer = defaultEmpty(customerSearch[0].getValue("companyname"));//DJ_価格入り納品書送信先会社名(3RDパーティー)
		var personCustomer = defaultEmpty(customerSearch[0].getValue("custentity_djkk_delivery_book_person_t"));//DJ_価格入り納品書送信先担当者(3RDパーティー)
		// バリエーション支援 20230803 update by zdj end
		var billcity = defaultEmpty(customerSearch[0].getValue("city"));//市区
		var customerCode = defaultEmpty(customerSearch[0].getValue("entityid"));//顧客code
//		var customeFax = defaultEmpty(customerSearch[0].getValue("fax"));//顧客FAX
		var customeFax = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_fax_text"));//顧客FAX
		var customePhone = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_phone_text"));//顧客TEL
	    var custZipCode = defaultEmpty(customerSearch[0].getValue("zipcode","Address",null));//顧客郵便
	    // バリエーション支援 20230803 add by zdj start
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
		// バリエーション支援 20230803 add by zdj end
		if(custZipCode && custZipCode.substring(0,1) != '〒'){
			custZipCode = '〒' + custZipCode;
		}else{
			custZipCode = '';
		}
		//add by zzq CH690 20230627 start
		var custcurrency = defaultEmpty(customerSearch[0].getValue("currency"));////顧客基本通貨
		//add by zzq CH690 20230627 end
		var custState = defaultEmpty(customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//顧客都道府県
		var custAddr1 = defaultEmpty(customerSearch[0].getValue("address1","Address",null));//顧客住所１
		var custAddr2 = defaultEmpty(customerSearch[0].getValue("address2","Address",null));//顧客住所２
		var custAddr3 = defaultEmpty(customerSearch[0].getValue("address3","Address",null));//顧客住所3
		var custAddressee = defaultEmpty(customerSearch[0].getValue("addressee","Address",null));//顧客宛先
		var paymentPeriod =  defaultEmpty(customerSearch[0].getText("custentity_djkk_customer_payment"));//支払条件
	}
	nlapiLogExecution('DEBUG', '2')
	nlapiLogExecution('DEBUG', 'paymentPeriod',paymentPeriod)

//		var memo =  defaultEmpty(creditmemoSearch[0].getValue(memo));//memo
		var salesrep =  defaultEmpty(creditmemoSearch[0].getText(salesrepSearchColumn));//営業担当者
		var tranid = defaultEmpty(creditmemoSearch[0].getValue(tranidSearchColumn));//請求書番号
		var otherrefnum = defaultEmpty(creditmemoSearch[0].getValue(otherrefnumSearchColumn));//御社発注番号
		var transactionnumber2 = defaultEmpty(creditmemoSearch[0].getValue(transactionnumberSearchColumn2));//transactionnumber PDF 
		var transactionnumber = defaultEmpty(creditmemoSearch[0].getValue(transactionnumberSearchColumn));//受注番号(maybe not true)
		if(isEmpty(transactionnumber)){
			transactionnumber = '';
		}
		var deliveryCode = defaultEmpty(creditmemoSearch[0].getValue(deliveryCodeSearchColumn));//DJ_納品先 : DJ_納品先コード
		// add by CH600 20230612 start
        var deliveryId = defaultEmpty(creditmemoSearch[0].getValue(deliverySearchColumn));//DJ_納品先
        nlapiLogExecution('DEBUG', 'deliveryId', deliveryId);
        
        var letter01 = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_site_fd')); //DJ_価格入り納品書送信先区分
        nlapiLogExecution('debug', 'letter01', letter01);
        var letter02 = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_fax_three')); //DJ_価格入り納品書送信先FAX(3RDパーティー)
        nlapiLogExecution('debug', 'letter02', letter02);
        var companyNameInvo = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_subname'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
        // CH807 add by zzq 20230815 start
		var personInvo = '納品書ご担当者様'; 
		var person_3rd = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
		var person = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_person'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
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
            // バリエーション支援 20230803 update by zdj start
            companyNameDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecorddjkk_name'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
            personDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_delivery_book_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
            // バリエーション支援 20230803 update by zdj end
        }
     // バリエーション支援 20230803 add by zdj start
        var companyName = '';
     // バリエーション支援 20230803 add by zdj end
        if(letter01){
        if(letter01 == '14'){   //3rdパーティー
        	// バリエーション支援 20230803 add by zdj start
            companyName = companyNameInvo + ' ' + personInvo;
         // バリエーション支援 20230803 add by zdj end
            if(letter02){
               deliveryCodeFax = letter02;
            }
        }else if(letter01 == '15'){  //納品先
        	// バリエーション支援 20230803 add by zdj start
            // CH807 add by zzq 20230815 start
//            companyName = companyNameDelivery + ' ' + '納品書ご担当者様';
            companyName = companyNameDelivery + ' ' + personInvo;
            // CH807 add by zzq 20230815 end
            // バリエーション支援 20230803 add by zdj end
            if(deliveryId && !isEmpty(deliveryFax)){
               deliveryCodeFax = deliveryFax;
            }
        }else if(letter01 == '16'){  //顧客先
        	// バリエーション支援 20230803 add by zdj start
            // CH807 add by zzq 20230815 start
//          companyName = companyNameCustomer + ' ' + '納品書ご担当者様';
            companyName = companyNameCustomer + ' ' + personInvo;
         // CH807 add by zzq 20230815 end
         // バリエーション支援 20230803 add by zdj end
            if(customeFax){
                deliveryCodeFax = customeFax;
          }
         }
        }else{
            if(customeFax){
                deliveryCodeFax = customeFax;   
            }
            // CH807 add by zzq 20230815 start
//          var companyName = companyNameCustomer + ' ' + '納品書ご担当者様';
            var companyName = companyNameCustomer + ' ' + personInvo;
            // CH807 add by zzq 20230815 end
        }
        //CH736　20230717 by zzq end
        // add by CH600 20230612 end
		var deliveryName = defaultEmpty(creditmemoSearch[0].getValue(deliveryNameSearchColumn));//DJ_納品先 : DJ_納品先名前
		var deliveryZip = defaultEmpty(creditmemoSearch[0].getValue(deliveryZipSearchColumn));//DJ_納品先 : DJ_郵便番号
		if(deliveryZip && deliveryZip.substring(0,1) != '〒'){
			deliveryZip = '〒' + deliveryZip;
		}else{
			deliveryZip = '';
		}
		var deliveryPrefectures = defaultEmpty(creditmemoSearch[0].getValue(deliveryPrefecturesSearchColumn));//DJ_納品先 : DJ_都道府県
		var deliveryMunicipalities = defaultEmpty(creditmemoSearch[0].getValue(deliveryMunicipalitiesSearchColumn));//DJ_納品先 : DJ_市区町村
		var deliveryResidence = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidenceSearchColumn));//DJ_納品先 : DJ_納品先住所1
		//add by zzq CH653 20230619 start
        var deliveryResidence2 = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_納品先 : DJ_納品先住所2
        var deliveryResidence3 = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidence3SearchColumn));//DJ_納品先 : DJ_納品先住所3
        //add by zzq CH653 20230619 end
		var duedate = formatDate(new Date());//発行日
		var deliveryDate = defaultEmpty(creditmemoSearch[0].getValue(deliveryDateSearchColumn));//DJ_納品日
		
		//アイテム 
		var itemIdArray = [];
		var itemDetails = [];
		var amountTotal = 0;
		var taxTotal = 0;
		var taxType = {};
		nlapiLogExecution('DEBUG', '3')
		var Counts = creditmemoRecord.getLineItemCount('item');//アイテム明細部
		if(Counts != 0) {
			for(var s = 1; s <=  Counts; s++){
				//add by zzq CH690 20230627 start
				var item = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'item', s));//アイテムID
//				var quantity = defaultEmpty(parseInt(creditmemoRecord.getLineItemValue('item', 'quantity', s)));//数量
//				var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
//				var origrate = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'rate', s)));//単価
//				var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//				var amount = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'amount', s)));//金額
//				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//				var taxAmount = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'tax1amt', s)));//税額
//				var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
				
				var quantity = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item', 'quantity', s)));//数量
				var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
				
				var units_display = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'units_display', s));//単位
                if(!isEmpty(units_display)){
                    var unitsArray = units_display.split("/");
                    if(!isEmpty(unitsArray)){
                        units_display = unitsArray[0];
                    }
                }
				var origrate = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'rate', s)));//単価
//				var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				origrateFormat = formatAmount1(origrate);
				var amount = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'amount', s)));//金額
				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
				var taxRate = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'taxrate1', s));//税率
					
				var taxAmount = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'tax1amt', s)));//税額
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
                          new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), //配送料フラグ
                          //20230608 add by zzq CH653 end
						 //20230720 add by zzq CH735 start
                           new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_品名（日本語）LINE1
                           new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), //DJ_品名（日本語）LINE2
                           new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_品名（英語）LINE1
                           new nlobjSearchColumn("custitem_djkk_product_name_line2"), //DJ_品名（英語）LINE2
                           // バリエーション支援 20230803 add by zdj start
		                   new nlobjSearchColumn("custitem_djkk_product_code"), //カタログ製品コード
		                   // バリエーション支援 20230803 add by zdj end
                           new nlobjSearchColumn("type")// 種類
                           //20230720 add by zzq CH735 end
						]
						);	
                //20230720 add by zzq CH735 start
//              var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));
//              displayname = displayname.replace(new RegExp("&","g"),"&amp;")
                var invoiceItemType = defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("type")); //アイテムtype
                var itemDisplayName= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//商品名
                // バリエーション支援 20230803 add by zdj start
				var productCode= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("custitem_djkk_product_code"));//カタログ製品コード
				// バリエーション支援 20230803 add by zdj end
                var displayname = '';
                //add by zdj 20230802 start
				var itemNouhinBikou = creditmemoRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',s); //DJ_納品書備考
				//add by zdj 20230802 end
                 // アイテムは再販用その他の手数料
                if(invoiceItemType == 'OthCharge') {
                    displayname = othChargeDisplayname(itemDisplayName); // 手数料
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
				// バリエーション支援 20230803 add by zdj start
				var itemLocId = defaultEmpty(creditmemoRecord.getLineItemValue('item','location',s)); // 場所
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
		        // バリエーション支援 20230803 add by zdj end
				//add by zdj 20230802 end
                //20230720 add by zzq CH735 end
				var productCode = defaultEmpty(itemSearch[0].getValue('custitem_djkk_product_code'));//DJ_カタログ製品コード
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
                       item : item,// アイテムID
                       units_display : units_display,// 単位
//                       amount : defaultEmptyToZero1(amount),// 金額
                       amount : formatAmount1(amount),// 金額
                       quantity : quantity,// 数量
//                       origrate : defaultEmptyToZero1(origrate),// 単価
                       origrate : formatAmount1(origrate),// 単価
                       displayname:displayname,// 商品d名
                       itemid:itemid,// 商品code
                       productCode:productCode,//商品code
                       // add by zzq CH653 20230618 start
                       deliverychargeFlg:deliverychargeFlg// 配送料フラグ
                       // add by zzq CH653 20230618 end
                       });
                       
                }else{
                       itemDetails.push({
                       item : item,// アイテムID
                       units_display : units_display,// 単位
                       amount : amountFormat,// 金額
                       quantity : quantityFormat,// 数量
                       origrate : origrateFormat,// 単価
                       displayname:displayname,// 商品d名
                       itemid:itemid,// 商品code
                       productCode:productCode,//商品code
                       // add by zzq CH653 20230618 start
                       deliverychargeFlg:deliverychargeFlg// 配送料フラグ
                       // add by zzq CH653 20230618 end
                      });
                   }
                }
              //20230720 add by zzq CH735 end
				 nlapiLogExecution('debug', 'origrate', origrate);
				//add by zzq CH690 20230627 end				
				
//				itemDetails.push({
//					  item : item,//アイテムID
//					  units_display : units_display,//単位
//					  amount : parseInt(amountFormat),//金額
//					  quantity : parseInt(quantityFormat),//数量
//					  origrate : parseInt(origrate),//単価
//					  displayname:displayname,//商品d名
//					  productCode:productCode,//商品code
//					  itemid:itemid,//商品code
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
		salesrep:salesrep,//営業担当者
		legalName:legalName,//連結正式名称
		EnglishName:EnglishName,//連結DJ_会社名前英語
		transactionFax:transactionFax,//発注専用FAX
		shipaddressPhone:shipaddressPhone,//配送先phone
		shipaddressFax:shipaddressFax,//配送先fax
		phone:phone,//連結TEL
		Fax:Fax,//連結FAX
		//20230728 add by zdj start
		paymentPeriodMonths:paymentPeriodMonths,//支払期限月
		//20230728 add by zdj end
		paymentPeriod:paymentPeriod,//DJ_顧客支払条件
		companyName :companyName,//顧客名
		companyName1 : companyName1,
		customeFax:customeFax,//顧客FAX
		billcity:billcity,//市区
		customerCode:customerCode,//顧客codeNum
		customePhone:customePhone,//顧客TEL
	    custZipCode :custZipCode,//顧客郵便
		custState:custState,//顧客都道府県
		custAddr1:custAddr1,//顧客住所１
		custAddr2:custAddr2,//顧客住所２
		custAddr3:custAddr3,//顧客住所3
		custAddressee:custAddressee,//顧客宛先
		tranid:tranid,//請求書番号
		otherrefnum:otherrefnum,//御社発注番号
		transactionnumber:transactionnumber,//受注番号(maybe not true)
		deliveryCode:deliveryCode,//DJ_納品先 : DJ_納品先コード
		deliveryName :deliveryName,//DJ_納品先 : DJ_納品先名前
		deliveryZip:deliveryZip,//DJ_納品先 : DJ_郵便番号
		deliveryPrefectures :deliveryPrefectures,//DJ_納品先 : DJ_都道府県
		deliveryMunicipalities: deliveryMunicipalities,//DJ_納品先 : DJ_市区町村
		deliveryResidence:deliveryResidence,//DJ_納品先 : DJ_納品先住所1
		deliveryResidence2 :deliveryResidence2,//DJ_納品先 : DJ_納品先住所2
		//add by zzq CH653 20230619 start
        deliveryResidence3 :deliveryResidence3,//DJ_納品先 : DJ_納品先住所3
        //add by zzq CH653 20230619 end
		duedate:duedate,//発行日
		deliveryDate:deliveryDate,//DJ_納品日
		// add by zhou 20230602 CH601 start
		memo:memo,//メモ
		// add by zhou 20230602 CH601 end
		// add by zzq 20230612 CH600 start
        deliveryCodeFax : deliveryCodeFax,
        //add by zzq 20230612 CH600 end
        // add by zdj 20230728 start
        deliveryCode : deliveryCode  //DJ_納品先 : DJ_納品先コード
        //add by zdj 20230728 end
		};
		var TotalForTaxEight = 0;
		var TotalForTaxTen = 0;
		for(var k in taxType){
			if(k == '8.0%'){
				 TotalForTaxEight = taxType[k];//税率8%で税金総額
			}else if(k == '10.0%'){
				 TotalForTaxTen = taxType[k];//税率20%で税金総額
			}
		}
//		var total = TotalForTaxEight + TotalForTaxTen;//合計(税込)
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
//			total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
			total = ( amountTotal + taxTotal ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
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
		'<td colspan="3" rowspan="2" align="center" style="margin-left:25px;border-bottom: 4px black solid;vertical-align:bottom;font-size: 32px;letter-spacing: 35px;line-height:10%;">&nbsp;納品書</td>'+
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
		// バリエーション支援 20230803 update by zdj start
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.phone+'／発注専用FAX：'+headValue.transactionFax+'</td>'+
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'／発注専用FAX：'+headValue.transactionFax+'</td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'／発注専用FAX：'+headValue.shipaddressFax+'</td>'+
		// バリエーション支援 20230803 update by zdj end
		//CH655 20230725 add by zdj end
		''+
		'</tr>'+
		'<tr style="height:12px">'+
		''+
		'<td colspan="3"></td>'+
		'<td></td>'+
		//CH655 20230725 add by zdj start
//		'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.Fax+'</td>'+
		// バリエーション支援 20230803 update by zdj start
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.shipaddressFax+'</td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
		// バリエーション支援 20230803 update by zdj end
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
		'<td colspan="7" style="font-size: 12px; font-weight: bold;">平素は格別のお引き立て有難うございます。この度はご注文ありがとうございました。</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;border-bottom: 4px solid black;">下記の通り納品致しましたので、ご査収ください。 </td>'+
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
		'<td>&nbsp;&nbsp;請求先：</td>'+
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
		'<td>〒 &nbsp;550-0002</td>'+
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
//		'<td style="width: 95px;border-top: 1px solid black;">&nbsp;&nbsp;請求書番号：</td>'+
//		'<td style="width: 95px;border-top: 1px solid black;">'+headValue.transactionnumber+'</td>'+//20230208 changed by zhou 
//		'<td style="width: 60px;border-top: 1px solid black;"><span></span><span style="margin-left: 15px;"></span></td>'+//20230208 changed by zhou 
//		'<td width="60px" style="border-top: 1px solid black;">発行日：</td>'+
//		'<td width="120px" style="border-top: 1px solid black;">'+headValue.duedate+'</td>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
        '<td style="width: 90px;">&nbsp;&nbsp;請求書番号：</td>'+
//        '<td style="width: 100px;">'+headValue.transactionnumber+'</td>'+//20230208 changed by zhou 
        '<td style="width: 100px;">'+headValue.tranid+'</td>'+//20230208 changed by zhou 
//        '<td style="width: 60px;"><span></span><span style="margin-left: 15px;"></span></td>'+//20230208 changed by zhou 
        '<td style="width: 60px;"><span>森本</span><span style="margin-left: 15px;">06</span></td>'+//20230208 changed by zhou 
        // バリエーション支援 20230803 update by zdj start
        //'<td width="60px">発行日：</td>'+
        //'<td width="120px">'+headValue.duedate+'</td>'+
        '<td width="60px">納品日：</td>'+
        '<td width="120px">'+headValue.deliveryDate+'</td>'+
        // バリエーション支援 20230803 update by zdj end
		//20230728 by zdj end
		// add by zhou 20230602 CH601 start
//		'<td colspan="2" style="border-top: 1px solid black;">備考：'+headValue.duedate+'</td>'+
//		'<td colspan="2" style="border-top: 1px solid black; overflow: hidden;">備考：'+dealFugou(getStrLenSlice(headValue.memo, 14))+'</td>'+
        '<td colspan="2">備考：'+getStrLenSlice(dealFugou(headValue.memo, 14))+'</td>'+
		// add by zhou 20230602 CH601 end
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;受注番号：</td>'+
		'<td colspan="2">'+headValue.transactionnumber+'</td>'+
		// バリエーション支援 20230803 update by zdj start
		//'<td>納品日：</td>'+
		//'<td>'+headValue.deliveryDate+'</td>'+
		'<td>納品先：</td>'+
		'<td>'+headValue.deliveryCode+'</td>'+
		//'<td colspan="2"></td>'+
		'<td colspan="2" rowspan="2">'+dealFugou(headValue.deliveryName)+'</td>'+
		// バリエーション支援 20230803 update by zdj end
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		//20230728 add by zdj start
//		'<td>&nbsp;&nbsp;御社発注番号:</td>'+
		'<td>&nbsp;&nbsp;御社発注番号</td>'+
		//20230728 add by zdj end
		'<td colspan="2">'+headValue.otherrefnum+'</td>'+
		// バリエーション支援 20230803 update by zdj start
		//'<td>納品先：</td>'+
		//'<td>'+headValue.deliveryCode+'</td>'+
		'<td colspan="2">&nbsp;</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td style="vertical-align:top;">&nbsp;&nbsp;支払条件：</td>'+
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
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">明&nbsp;&nbsp;細</td>'+
		'<td width="15px" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td colspan="2" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">数量</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">単価</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">金額</td>'+
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
//		'<td width="170px" style="border-top:1px solid black">合計</td>'+
		'<td width="80px"  style="border-top:1px solid black">合計</td>'+
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
		'<td width="150px">8% 対象合計(税込)</td>'+
		'<td width="70px"  style="border-right:1px solid black" align="right">'+ifZero(TotalForTaxEight)+'&nbsp;</td>'+
		'<td width="80px">消費税</td>'+
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
		'<td width="250px" style="border-bottom:4px solid black">&nbsp;&nbsp;※軽減税率対象</td>'+//changed by zhou 20230209
		'<td width="150px" style="border-bottom:4px solid black">10%対象合計(税込)</td>'+
		'<td width="70px"  style="border-bottom:4px solid black;border-right:1px solid black" align="right">'+ifZero(TotalForTaxTen)+'&nbsp;</td>'+
		'<td width="80px"  style="border-bottom:4px solid black">合計(税込)</td>'+
		'<td width="50px"  style="border-bottom:4px solid black" align="right">'+'￥'+ifZero(total)+'</td>'+
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
		'<td colspan="5" align="center">***** 全<totalpages/>ページ：<pagenumber/>*****</td>'+
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
				var taxCodeText = itemDetails.deliverychargeFlg == 'T' ? '' : '※';
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
////				'<td style="vertical-align: top;" align="center">※</td>'+
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
//	        var xlsFileo = nlapiCreateFile('納品' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
//	        
//	        xlsFileo.setFolder(109338);
//	        nlapiSubmitFile(xlsFileo);
		  var xlsFile = nlapiXMLToPDF(xml);

		  // PDF
		  //CH762 20230817 add by zdj start
		  //xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
		  xlsFile.setName('納品書' + '_' + transactionnumber2 + '_' + getDateYymmddFileName() + '.pdf');
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

function formatDate(dt){    //現在日期
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

	// システム時間
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
 * 符号処理
 * @param val
 * @returns {String}
 */
function dealFugou (value) {
    var reValue = '';
    reValue = value.replace(new RegExp('&','g'),'&amp;')
                   .replace(new RegExp('&amp;lt;','g'),'&lt;') // [&]を置き換えると、元々エスケープ処理されている[<]が変化するため、戻す
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
 * 符号処理
 * @param val
 * @returns {String}
 */
function dealFugou (value) {
    var reValue = '';
    reValue = value.replace(new RegExp('&','g'),'&amp;')
                   .replace(new RegExp('&amp;lt;','g'),'&lt;') // [&]を置き換えると、元々エスケープ処理されている[<]が変化するため、戻す
                   .replace(new RegExp('&amp;gt;','g'),'&gt;');
    return reValue;
}

//バリエーション支援 20230803 update by zdj start
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
//バリエーション支援 20230803 update by zdj end