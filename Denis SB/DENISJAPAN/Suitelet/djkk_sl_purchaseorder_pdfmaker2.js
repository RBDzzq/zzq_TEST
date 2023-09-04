/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Feb 2022     Rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	
	var purchaseorderId = request.getParameter('purchaseorderid');//purchaseOrderId取得
	var roleSub = request.getParameter('roleSub');//purchaseOrderId取得
	
//	var roleId = nlapiGetUser();
//	nlapiLogExecution('DEBUG', 'roleId',roleId);
//	var employee = nlapiLoadRecord('employee',roleId)
//	var roleSub = defaultEmpty(employee.getFieldValue('subsidiary'));
	nlapiLogExecution('debug', 'roleSub', roleSub);

	if(!isEmpty(purchaseorderId)){

//		nlapiLogExecution('debug', 'purchaseorderId',purchaseorderId);
		var record = nlapiLoadRecord('purchaseorder', purchaseorderId);//purchaseOrderIdでデータ取得
	    var vendorId = record.getFieldValue('entity');//仕入先IDを取得
	    var vendorRecord = nlapiLoadRecord('vendor', vendorId);//仕入先IDで仕入先画面データを取得
	    var customForm = record.getFieldValue('customform');
	    //20230314 add by zhou start
	    //CH066 
	    var destinationCustoms = record.getFieldValue('custbody_djkk_destination_customs');//DJ_通関業者
	    if(!isEmpty(destinationCustoms)){
	    	var destinationRecord = nlapiLookupField('customrecord_djkk_destination',destinationCustoms,["name","custrecord_djkk_subname","custrecord_djkk_rep","custrecord_djkk_phone"])
	 	    var destinationName = destinationRecord.name;//名前
	 	    var destinationSub = destinationRecord.custrecord_djkk_subname;//DJ_会社名
	 	    var destinationRep = destinationRecord.custrecord_djkk_rep;//DJ_担当者
	 	    var destinationRepPhone = destinationRecord.custrecord_djkk_phone;//DJ_電話番号
	    }
	   
	    /************TODO*************/
	    //20230314 zhou memo: テスト地域の判断  現在、POは国内外の条件は不明と判断している。理論的に地域を判断するのは発注書の仕入先に由来する。
	    var destinationForeignRegions = 1 ; 
	    //20230314 add by zhou end
	    
	    // DENISJAPANDEV-1383 zheng 20230307 start
	    // changed add by song  DENISJAPANDEV-1388 注意事項をPOの枠外に出力する start
	    // var vendorPrecautions = defaultEmpty(vendorRecord.getFieldValue('custentity_djkk_precautions'));//仕入先DJ_注意事項を取得
	    var vendorPrecautions = defaultEmpty(vendorRecord.getFieldValue('comments'));//POコメント
	    // changed add by song  DENISJAPANDEV-1388 注意事項をPOの枠外に出力する end
	    var POFlag = record.getFieldValue('custbody_djkk_production_po_number');//POFLAG U762
	    // DENISJAPANDEV-1383 zheng 20230307 end
	    
	     // DENISJAPANDEV-1383 zheng 20230302 start
	    var DjLanguage = defaultEmpty(record.getFieldText('custbody_djkk_language')); //「日本語」と「英語」
	    var POTitle = 'PURCHASE ORDER';
	    if (DjLanguage != '英語') {
	        POTitle = '発注書';
	    }
	    if(POFlag == 'T'){
	    	POTitle = 'BLANKET PURCHASE ORDER';
	        if (DjLanguage != '英語') {
	            POTitle = '一括発注書';
	        }
	    }
	    // DENISJAPANDEV-1383 zheng 20230301 end
	    
	  //POFLAG U258
	    var subtotal = record.getFieldValue('subtotal');
	    var taxtotal = record.getFieldValue('taxtotal');
	    var total = record.getFieldValue('total');
	    var totalFormat  = Number(total).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	    var taxtotalFormat = Number(taxtotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	    
//		nlapiLogExecution('debug', 'taxtotal',taxtotal);
	    
//20220815 add by zhou U139
	    var language = record.getFieldValue('custbody_djkk_language');
//end
	    var vendorComments = record.getFieldValue('custbody_djkk_vendor_comments');
	    	    	    
        // 1 2 仕入先の正式名称と請求先と配送先の情報を取得
        var vendorSearchShip = nlapiSearchRecord("vendor",null,
                [
                   ["internalid","anyof",vendorId],
                   'AND',
                   ["address.isdefaultshipping","is","T"]
                ], 
                [
                   new nlobjSearchColumn("entityid"),//ID 
                   new nlobjSearchColumn("addressee","shippingAddress",null), //名前（宛名と思う　確認中）
                   new nlobjSearchColumn("address","shippingAddress",null),//住所
                   new nlobjSearchColumn("attention","shippingAddress",null),//宛名（担当者）  
                   new nlobjSearchColumn("addressphone","shippingAddress",null),//電話番号（住所） 
                   new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//FAX（カスタム） 
                   new nlobjSearchColumn("isdefaultbilling","shippingAddress",null), //デフォルト請求先住所
                   new nlobjSearchColumn("isdefaultshipping","shippingAddress",null),//デフォルト配送先住所
                   new nlobjSearchColumn("custrecord_djkk_address_state","shippingAddress",null), //都道府県
                   new nlobjSearchColumn("city","shippingAddress",null), //市町村
                   new nlobjSearchColumn("address","shippingAddress",null), //アドレス
                   new nlobjSearchColumn("shipaddress1"),
                   new nlobjSearchColumn("shipaddress2"),
                   new nlobjSearchColumn("shipaddress3"), 
                ]
                );
        
        if (vendorSearchShip) {
            //配送先
            var shipEntityid = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("entityid")));
            var shipAddressee = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("addressee","shippingAddress",null)));
            var shipAttention = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("attention","shippingAddress",null)));
            var shipAddressphone = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("addressphone","shippingAddress",null)));
            var shipCustrecord_djkk_address_fax = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("custrecord_djkk_address_fax","shippingAddress",null)));
            var isdefaultbilling = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("isdefaultbilling","shippingAddress",null)));
            var isdefaultshipping = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("isdefaultshipping","shippingAddress",null)));
            var shipState = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("custrecord_djkk_address_state","shippingAddress",null)));
            var shipCity = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("city","shippingAddress",null)));
            var shipAddress1 = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("shipaddress1")));
            var shipAddress2 = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("shipaddress2")));
            var shipAddress3 = defaultEmpty(isEmpty(vendorSearchShip) ? '' :  transfer(vendorSearchShip[0].getValue("shipaddress3")));
            var shipAddress = shipAddress1 + shipAddress2 + shipAddress3;
        }

        var vendorSearchBill = nlapiSearchRecord("vendor",null,
                [
                   ["internalid","anyof",vendorId],
                   'AND',
                   ["address.isdefaultbilling","is","T"]
                ], 
                [
                 new nlobjSearchColumn("address1","billingAddress",null), //請求先 住所1
                 new nlobjSearchColumn("address2","billingAddress",null), //請求先住所2
                 new nlobjSearchColumn("address3","billingAddress",null), //請求先住所3
                 new nlobjSearchColumn("address"), //請求先住所
                 new nlobjSearchColumn("country","billingAddress",null), //請求先国
                 new nlobjSearchColumn("attention","billingAddress",null), //請求先宛名（担当者）
                 new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
                 new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
                 new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県
                 new nlobjSearchColumn("addressphone","billingAddress",null), //請求先電話番号
                 new nlobjSearchColumn("custrecord_djkk_address_fax","billingAddress",null)//請求先Fax    
                ]
                );
        
        if (vendorSearchBill) {
            //請求先
            var billaddress1 = defaultEmpty(isEmpty(vendorSearchBill) ? '' :  transfer(vendorSearchBill[0].getValue("address1","billingAddress",null)));
            var billaddress2 = defaultEmpty(isEmpty(vendorSearchBill) ? '' :  transfer(vendorSearchBill[0].getValue("address2","billingAddress",null)));
            var billaddress3 = defaultEmpty(isEmpty(vendorSearchBill) ? '' :  transfer(vendorSearchBill[0].getValue("address3","billingAddress",null)));
            var billaddress = billaddress1 + '&nbsp;' + billaddress2 + '&nbsp;' + billaddress3 ;//20230208 changed by zhou
            var billcountry = defaultEmpty(isEmpty(vendorSearchBill) ? '' :  transfer(vendorSearchBill[0].getValue("country","billingAddress",null)));
            var billattention = defaultEmpty(isEmpty(vendorSearchBill) ? '' :  transfer(vendorSearchBill[0].getValue("attention","billingAddress",null)));
            var billcity = defaultEmpty(isEmpty(vendorSearchBill) ? '' :  transfer(vendorSearchBill[0].getValue("city","billingAddress",null)));
            var billzipcode = defaultEmpty(isEmpty(vendorSearchBill) ? '' :  transfer(vendorSearchBill[0].getValue("zipcode","billingAddress",null)));
            var billstate = defaultEmpty(isEmpty(vendorSearchBill) ? '' :  transfer(vendorSearchBill[0].getValue("custrecord_djkk_address_state","billingAddress",null)));
            var billphone = defaultEmpty(isEmpty(vendorSearchBill) ? '' :  vendorSearchBill[0].getValue("addressphone","billingAddress",null));
            var billCustrecord_djkk_address_fax = defaultEmpty(isEmpty(vendorSearchBill) ? '' :  vendorSearchBill[0].getValue("custrecord_djkk_address_fax","billingAddress",null));
        }
	    
	    // 3 連結情報 連結画面で住所INFOデータを取得
	    var subsidiary = record.getFieldValue('subsidiary');
		var subsidiarySearch= nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",subsidiary]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), 
				   new nlobjSearchColumn("custrecord_djkk_address_state","address",null),
				   new nlobjSearchColumn("city","address",null), 
				   new nlobjSearchColumn("address1","address",null), 
				   new nlobjSearchColumn("address2","address",null), 
				   new nlobjSearchColumn("address3","address",null),
				   new nlobjSearchColumn("phone","address",null), 
				   new nlobjSearchColumn("zip","address",null), 
				   new nlobjSearchColumn("custrecord_djkk_mail","address",null), 
				   new nlobjSearchColumn("custrecord_djkk_subsidiary_type"), 
				   new nlobjSearchColumn("legalname"), 
				   new nlobjSearchColumn("name"), 
				   new nlobjSearchColumn("custrecord_djkk_subsidiary_url"),
				   new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
				   new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),
				   // DENISJAPANDEV-1383 zheng 20230303 start
				   new nlobjSearchColumn("namenohierarchy"),
				   new nlobjSearchColumn("custrecord_djkk_mainaddress_en","address",null)
				   // DENISJAPANDEV-1383 zheng 20230303 end
				]
	);
		var subsidiaryProvince= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null)));
		var subsidiaryCity= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("city","address",null)));
		var subsidiaryAddr1= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("address1","address",null)));
		var subsidiaryAddr2= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("address2","address",null)));
		var subsidiaryAddr3= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("address3","address",null)));
//		var subsidiaryAddr= subsidiaryAddr1+subsidiaryAddr2+subsidiaryAddr3;言語判断がかかります
		//Fax
		var subsidiaryFax = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("custrecord_djkk_address_fax","address")));
		//Tel
		var subsidiaryTel = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("phone","address")));
		//email
		var email = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("custrecord_djkk_mail","address",null)));
		//正式名称
		var legalname = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("legalname")));
		//名前
		var name = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("name")));
		// DENISJAPANDEV-1383 zheng 20230303 start
	    //名前(階層なし)
        var namenohierarchy = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("namenohierarchy")));
        var mainaddressEn = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("custrecord_djkk_mainaddress_en","address",null)));
        // DENISJAPANDEV-1383 zheng 20230303 end
		//場所
		var subsidiaryZip = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("zip","address",null)));
		//住所英語
		var subsidiaryAddEn = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng")));
		
		//会社名前英語
		var custrecord_djkk_subsidiary_en = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en")));
		
		
		
		
		
		//		nlapiLogExecution('ERROR', 'subsidiaryAddEn', subsidiaryAddEn);
		
		//LogoURL
		var subsidiaryLogoURLCurrent = defaultEmpty(isEmpty(subsidiarySearch) ? '' : subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_url"));
		
		var subsidiaryLogoURL = transfer(subsidiaryLogoURLCurrent); 
				

		
		
//		nlapiLogExecution('debug', 'subsidiaryLogoURL', subsidiaryLogoURL);
//		nlapiLogExecution('debug', 'subsidiaryZipAndCountryEn', subsidiaryAddArrayEn[5]);
		
	    
		// 4 従業員情報
		var employeePhone = '';
		var employeeFax = '';
		var employeelastname = '';
		var employeefirstname = '';
		
		var employeeId = record.getFieldValue('employee');//従業員IDを取得
		if (employeeId != null) {
		var employeeSearch = nlapiSearchRecord("employee",null,
				[
				   ["internalid","is",employeeId]
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
		

		employeePhone = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("phone")));// 従業員電話
		employeeFax = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("fax")));//従業員ファックス
		//employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("lastname")));//従業員lastname
		//employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("firstname")));//従業員firstname
		if (DjLanguage == '英語') {
            employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_lastname")));//従業員lastname
            employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_firstname")));//従業員firstname
		} else {
            employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("lastname")));//従業員lastname
            employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("firstname")));//従業員firstname
		}
		}
		
	    // 5インコタームとインコターム場所（発注書画面に取得出来る）
		//20230404 changed by zhou start
//		var incoterm = defaultEmpty(record.getFieldText('custbody_djkk_incoterm'));
		var incoterm = defaultEmpty(record.getFieldText('incoterm'));
		//20230404 changed by zhou end
		var incotermSiteValue = defaultEmpty(record.getFieldValue('custbody_djkk_po_incoterms_location'));
//	    nlapiLogExecution('debug', 'incoterm', incoterm);
//	    nlapiLogExecution('debug', 'incotermSiteValue', incotermSiteValue);

	    // 6POでDJ_インコタイム日付を追加
	    var incotermTime = defaultEmpty(record.getFieldValue('custbody_djkk_incoterm_data'));
	    var incotermTimeFormat = '';
	    if (incotermTime != '') {
	    	incotermTimeFormat = formatDate(new Date(incotermTime));
	    }
	    

	    
	    //アイテムを取得
	    var itemDetails = [];//全アイテムTabの情報
		var itemIdArray = [];//アイテムID配列
		var itemIdMP = [];//アイテムの商品コード
		var itemDetails2 = [];//アイテムTabにアイテム名、商品コード、仕入れ先商品コード保存用の配列
		var amountTotal = 0;
		var itemList = record.getLineItemCount('item');//アイテム明細部
		if(itemList != 0) {
	      for(var s = 1; s <= itemList; s++){
	    	  	var item = defaultEmpty(record.getLineItemValue('item', 'item', s));//アイテムID
	    	  	var description = defaultEmpty(record.getLineItemValue('item', 'description', s));//説明
	    	  	var quantity = defaultEmpty(parseFloat(record.getLineItemValue('item', 'quantity', s)));//数量
//	    	  	var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
	    	  	
				var units_display = defaultEmpty(record.getLineItemValue('item', 'units_display', s));//単位
				var unitsArray;//単位array
				var unit = defaultEmpty();//pdf出力用単位
				if(!isEmpty(language)&&!isEmpty(units_display)&& customForm == 169){
					var unitSearch = nlapiSearchRecord("unitstype",null,
							[
							   ["abbreviation","is",units_display]
							], 
							[
							   new nlobjSearchColumn("abbreviation")
							]
							);	
					if(unitSearch != null){
						if(language == '13'){			//英語
							units_display = unitSearch[0].getValue('abbreviation')+'';
							unitsArray = units_display.split("/");
							if(unitsArray.length == 2){
								unit = unitsArray[1];
								nlapiLogExecution('debug','unit',unit)
								nlapiLogExecution('debug','unitsArray',unitsArray)
							}	
						}else if(language == '26'){				//日本語
							units_display = unitSearch[0].getValue('abbreviation')+'';
							unitsArray = units_display.split("/");
							if(!isEmpty(unitsArray)){
								unit = unitsArray[0];
							}else if(unitsArray.length == 0){
								unit = units_display;
							}
						}
					}
				}
				var origrate = defaultEmptyToZero(parseFloat(record.getLineItemValue('item', 'origrate', s)));//単価
				var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
				var amount = defaultEmptyToZero(parseFloat(record.getLineItemValue('item', 'amount', s)));//金額
				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
	            var quantityFormat = formatAmount1(quantity);
				if (DjLanguage == '日本語') {
				    origrateFormat = origrateFormat.split('.')[0];
				    amountFormat = amountFormat.split('.')[0];
				} else {
				    quantityFormat = formatAmount2(quantity.toString());
				}
				amountTotal += amount;
		   
			itemIdArray.push(item);	
			itemDetails.push({
				  item : item,
				  units_display : defaultEmpty(unit),
				  amount : amountFormat,
				  quantity : quantityFormat,
				  origrate : origrateFormat,
				  description : description
				});
			// nlapiLogExecution('debug', 'units_display', itemDetals[0].amount);

	      } 
			}else {
				itemDetails.push({
					  item : '',
					  units_display : '',
					  amount : '',
					  quantity : '',
					  origrate : '',
					  description : '',
					  itemName : '',
					  itemCode : '',
					  vendorItemCode : ''
					}); 
	      }
	      var amountTotalFormat = amountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	      nlapiLogExecution('error', 'itemIdArray', itemIdArray);
			if(itemIdArray.length){	
				var itemSearch = nlapiSearchRecord("item",null,     //在item表中搜索
						[
						   ["internalid","anyof", itemIdArray]
						], 
						[
						   new nlobjSearchColumn("internalid"),
						   new nlobjSearchColumn("itemid"),						   
						   new nlobjSearchColumn("vendorname"), 
						   new nlobjSearchColumn("displayname"),
						   new nlobjSearchColumn("custitem_djkk_product_name_jpline1"),//DJ_品名（日本語）LINE1
						   new nlobjSearchColumn("custitem_djkk_product_name_jpline2"),	//DJ_品名（日本語）LINE2		   
						   new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_品名（英語）LINE1
						   new nlobjSearchColumn("custitem_djkk_product_name_line2"),//DJ_品名（英語）LINE2
						   new nlobjSearchColumn("custitem_djkk_product_code"),//DJ_カタログ製品コード
						   new nlobjSearchColumn("upccode")//EANコード
						]
						);
				if(!isEmpty(itemSearch)){
					for(var n = 0; n < itemSearch.length; n++){
						var itemId= defaultEmpty(itemSearch[n].getValue('internalid'));//画面ID
						var itemType= nlapiLookupField('item', itemId, 'recordtype')
						var itemid= defaultEmpty(itemSearch[n].getValue('itemid'));
						itemIdMP[n] = itemid;//8.1商品コード
						nlapiLogExecution('debug', 'itemIdMP[n]', itemIdMP[n]);
						var vendorname = defaultEmpty(itemSearch[n].getValue('vendorname'));//8.2仕入先商品コード
						nlapiLogExecution('debug', 'vendorname', vendorname);
						var itemName = defaultEmpty(itemSearch[n].getValue('displayname'));//7アイテム名前
						var itemName1;//DJ_品名LINE1
						var itemName2;//DJ_品名LINE2
						if(language == '13'){			//英語
							itemName1 = defaultEmpty(itemSearch[n].getValue('custitem_djkk_product_name_line1'));//DJ_品名（英語）LINE1
							itemName2 = defaultEmpty(itemSearch[n].getValue('custitem_djkk_product_name_line2'));//DJ_品名（英語）LINE2
						}else if(language == '26'){				//日本語
							itemName1 = defaultEmpty(itemSearch[n].getValue('custitem_djkk_product_name_jpline1'));//DJ_品名（日本語）LINE1
							itemName2 = defaultEmpty(itemSearch[n].getValue('custitem_djkk_product_name_jpline2'));//DJ_品名（日本語）LINE2
						}
						var productCode = defaultEmpty(itemSearch[n].getValue('custitem_djkk_product_code'));//DJ_カタログ製品コード
						var upcCode = defaultEmpty(itemSearch[n].getValue('upccode'));//EANコード
						for(var j = 0; j < itemDetails.length; j++){
							if ( itemDetails[j].item == itemId) {
								itemDetails[j].itemType = itemType;
								itemDetails[j].itemName = itemName;
								itemDetails[j].itemCode = itemIdMP[n];
								itemDetails[j].vendorItemCode = vendorname;
								itemDetails[j].itemName1 = itemName1;
								itemDetails[j].itemName2 = itemName2;
								itemDetails[j].productCode = productCode;
								itemDetails[j].upcCode = upcCode;
							}
						}
						
						
					}
				}
			}
			
		      

			
			
//		請求先に営業担当者を取得start3.22
		var salesrepresentative  = transfer(defaultEmpty(record.getFieldValue('custbody_djkk_sales_representative')));
		var salesrepresentativeCh = '';
		
		// 読点
		var comma = '';
		if (salesrepresentative != '') {
			comma = '、'	;		
			if (DjLanguage == '英語') {
		         salesrepresentativeCh = nlapiLookupField('employee', salesrepresentative, ['custentity_djkk_english_firstname','custentity_djkk_english_lastname'])
			} else {
	            salesrepresentativeCh = nlapiLookupField('employee', salesrepresentative, ['firstname','lastname'])   
			}
		}
//		end3.22
				    
	    // 9連結情報→データの取得は[1]と同じはず（Fieldは英語も取得）

	    // 10POヘッダーへコメント
	    // U161
		var poComment = '';

	    if (customForm = 110){//
//	    	poComment = transfer(defaultEmpty(record.getFieldValue('memo')));
	    	poComment = transfer(defaultEmpty(record.getFieldValue('custbody_djkk_vendor_comments')));//20220901 changed by zhou
	    }else {
	    	poComment = transfer(defaultEmpty(record.getFieldValue('custbody_djkk_vendor_comments')));
	    }
	    
	    // 11仕入先コード
	    var vendorCode = transfer(defaultEmpty(vendorRecord.getFieldValue('entityid')));
	    
	    // 12セクション
//	    var section = transfer(defaultEmpty(record.getFieldValue('department')));
	    var section = transfer(defaultEmpty(record.getFieldText('department')));
	    if(!isEmpty(section)){
	    	var sectionArray=section.split(" ");
	    	section  = sectionArray[0] 
	    }
	    
	    // 13受領予定日（納品予定日）→受領希望日
	    var receiptedScheduleDate = defaultEmpty(record.getFieldValue('duedate'));
	    
	    // 14ロケーション
	    var location = transfer(defaultEmpty(record.getFieldText('location')));
	    
	    // DENISJAPANDEV-1383 zheng 20230301 start
	    // 15DJ_言語
	    // var DjLanguage = defaultEmpty(record.getFieldText('custbody_djkk_language')); //「日本語」と「英語」
	    // DENISJAPANDEV-1383 zheng 20230301 end
	    
	    // 16連結名前
//	    var subsidiaryName
	    
	    // 17正式名称（仕入先名）仕入れ先の名前と思う
		var companyname  = transfer(defaultEmpty(vendorRecord.getFieldValue('companyname')));
	    
	    // 18日付(発注日の認識)
        var purchaseDate = new Date(record.getFieldValue('trandate'));
		// DENISJAPANDEV-1383 zheng 20230302 start
	    // var purchaseDate = new Date();
	    //var purchaseDate = getSystemTime();
	    // DENISJAPANDEV-1383 zheng 20230302 end
	    var purchaseDateFormat = formatDate2(purchaseDate);
	    
	    // 19PO番号
	    var poNumber = transfer(record.getFieldValue('transactionnumber'));
//	    var poNumber = defaultEmpty(record.getFieldValue('custbody_djkk_production_po_number')) ;
	    
	    // 20通貨
	    var currency = transfer(defaultEmpty(record.getFieldText('currency')));
	    
	    // 21支払条件 3.18
	    var paymentTerms = '';
	    var paymentTermsAll = transfer(defaultEmpty(record.getFieldText('terms')));
	    var paymentTermsArray=paymentTermsAll.split("/");

	    // 22固定項目名
	    if (DjLanguage == '英語') {
		    var FixedNameDate = 'Date :';
		    var FixedNamePoNo = 'P/O No:';
		    var FixedNameTo = 'To:';
		    var FixedNameTel = 'Tel:';
		    var FixedNameFax = 'Fax:';
		    var FixedNameShipTo = 'Ship to:';
		    var FixedNameBillTo = 'Bill to:';
		    var FixedNameTradeTerms = 'TRADE TERMS:';
		    var FixedNamePaymentTerms = 'PAYMENT TERMS:';
		    var FixedNameReference = 'Reference';
		    var FixedNameProductDescription = 'Product Description';
		    var FixedNameQuantity = 'Quantity';
		    var FixedNameUnitPrice = 'Unit Price';
		    var FixedNameTotalPrice = 'Total Price';
		    var FixedNamePage = 'Page:';
		    var FixedNameOrderTitle = 'WE ARE PLEASED TO PLACE AN ORDER UNDER THE FOLLOWING CONDITIONS:';
		    var FixedNameLaTest = 'LATEST';
		    var FixedNameOrderConfirm1 = 'PLEASE SET AUTHORIZED PERSON SIGN TO CONFIRM ORDER';
		    var FixedNameOrderConfirm2 = 'ACCEPTANCE AND SEND IT TO US BY RETURN:';
		    var FixedNameReceptionDate = 'RECEPTION DATE:'; 
		    var FixedNameAuthorizedSignautre = 'AUTHORIZED SIGNAUTRE:'; 
		    var FixedNameCitStamp = 'CIT.STAMP:';
		    var FixedNameAttn = 'ATTN:';
		    var FixedNamePersonInCharge = 'Person in charge:';
		    var Precautions = 'Attention:';
		    var subsidiaryAddr= subsidiaryAddEn;//3.18added
		    if (paymentTermsArray.length == 2) {
		    	paymentTerms = paymentTermsArray[1]; 		    	
		    }
		    // billToName設定
		    name = custrecord_djkk_subsidiary_en;
		    
		    // DENISJAPANDEV-1383 zheng 20230302 start
		    var FixedNameSubTotal = 'SubTotal';
		    var FixedNameTaxTotal = 'TaxTotal';
		    var FixedNameTotal = 'Total';
		    // DENISJAPANDEV-1383 zheng 20230302 end
//		    var FixedNameTaxtotal = 'taxtotal';
//		    var FixedNameSubtotal = 'subtotal';
//		    var FixedNameTotal = 'total';
		    
		    
	    }else{
		    var FixedNameDate = '日付 :';
		    var FixedNamePoNo = '発注書番号 :';
		    var FixedNamePageNo = 'ページ番号 :';
		    var FixedNameTo = '担当者：';
		    var FixedNameTel = 'Tel：';
		    var FixedNameFax = 'Fax：';
		    var FixedNameShipTo = '配送先:';
		    var FixedNameBillTo = '請求先:';
		    var FixedNameTradeTerms = '取引条件 :';
		    var FixedNamePaymentTerms = '支払い条件 :';
		    var FixedNameReference = '品コード';
		    var FixedNameProductDescription = '説明';
		    var FixedNameQuantity = '数量';
		    var FixedNameUnitPrice = '単価/率';
		    var FixedNameTotalPrice = '総額';
		    var FixedNamePage = 'ページ番号:';
		    var FixedNameOrderTitle = '以下の条件でご注文いただけます:';
		    var FixedNameLaTest = '最新';
		    var FixedNameOrderConfirm1 = '注文を確認するために許可された人のサインを設定してください';
		    var FixedNameOrderConfirm2 = '承諾して返送してください：';
		    var FixedNameReceptionDate = '受付日:'; 
		    var FixedNameAuthorizedSignautre = '承認された署名:'; 
		    var FixedNameCitStamp = 'CIEスタンプ:';
		    var FixedNameAttn = '担当者:';
		    // CH514 zheng 20230515 start
		    // var FixedNamePersonInCharge = '従業員:';
		    var FixedNamePersonInCharge = '担当:';
		    // CH514 zheng 20230515 end
		    var Precautions = '注意事項:';
	        // DENISJAPANDEV-1383 zheng 20230302 start
            var FixedNameSubTotal = '小計';
            var FixedNameTaxTotal = '消費税';
            var FixedNameTotal = '合計';
            // DENISJAPANDEV-1383 zheng 20230302 end
		    var subsidiaryAddr= subsidiaryAddr1+subsidiaryAddr2+subsidiaryAddr3;//3.18added
		    if (paymentTermsArray.length == 2) {
		    	paymentTerms = paymentTermsArray[0]; 		    	
		    }
	    }
	    
	    
	}

	// DENISJAPANDEV-1383 zheng 20230306 start
    if (billaddress == null) {
        billaddress = '';
    }
    // DENISJAPANDEV-1383 zheng 20230306 end
	var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
	'<pdf>'+
	'<head>'+
	'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
	'<#if .locale == "zh_CN">'+
	'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
	'<#elseif .locale == "zh_TW">'+
	'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
	'javascript:NLMultiButton_doAction(\'multibutton_pdfsubmit\', \'submitas\');return false;	<#elseif .locale == "ja_JP">'+
	'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
	'<#elseif .locale == "ko_KR">'+
	'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
	'<#elseif .locale == "th_TH">'+
	'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
	'</#if>'+
	'<macrolist>'+
	'<macro id="nlheader">'+
	'<table style="width: 660px;height: 40px; overflow: hidden; display: table;border-collapse: collapse;"><tr style="border-bottom:2px solid #6F8CAD;color:#4678d0;font-size:1.3em;margin-bottom:0.8em;">'+
	'<td align="left" style="width:30%; padding: 0em 0em 0.3em 1.3em;"><img src="' +subsidiaryLogoURL+ '" style=" height: 30px; margin-top: 0px; float: left;" /></td>'+
	'<td align="right" style="padding: 0em 0em 0em 0em;font-size:16pt;" valign="middle"><span>'+ legalname +'</span></td>'+
	'</tr></table>'+
	'<table style="margin:0 0.2in 0.2in; width:660px;border:2px solid #6F8CAD;" cellpadding="2" cellspacing="1">'+
	'	<tr>'+
	'		<td></td>'+
	'	</tr>'+
	'	<tr>'+
	'		<td align="right" colspan="25">&nbsp;</td>'+
	'		<td align="center" colspan="50" >'+POTitle+'</td>'+
	'		<td align="right" colspan="25">' + FixedNameDate + purchaseDateFormat + '</td>'+
	'	</tr>'+
	'	<tr>'+
	'		<td align="right" colspan="25"></td>'+
	'		<td colspan="50">&nbsp;</td>'+
	'		<td align="right" colspan="25">' + FixedNamePoNo + poNumber + '</td>'+
	'	</tr>'+
	'</table>'+
	''+
	'<table border="0" cellpadding="2" cellspacing="2" style="width:660px;margin:0 0.2in;">'+
	'<tr>'+
	'<td style="width: 340px; border-bottom: 1px solid black;">' + companyname + '</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="height: 17px;">&nbsp;&nbsp;&nbsp;&nbsp;'  + billstate + billcity  + '</td>'+
	'<td style="padding-left:10px;height: 17px;">'+ FixedNameTo + billattention + '</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="padding-left:20px;height: 17px;">&nbsp;&nbsp;&nbsp;&nbsp;' + billaddress + '</td>'+
	'<td style="padding-left:10px;height: 17px;">'+ FixedNameTel + String(billphone) + '</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="padding-left:20px;height: 17px"></td>'+
	'<td style="padding-left:10px;height: 17px;">'+ FixedNameFax + billCustrecord_djkk_address_fax +'</td>'+
	'<td align="right" style="width: 220px;height: 17px;">' + FixedNamePage + ' &nbsp; <pagenumber/>&nbsp;/&nbsp;<totalpages/>&nbsp;</td>'+
	'</tr>'+
	'</table>'+
	'&nbsp;'+
	''+
	'<p style="margin-left: 0.2in">' + FixedNameOrderTitle + '</p>'+
	''+
	'<table border="0" style="position:relative;left:8px;width: 660px;" align="center" cellpadding="3.2" cellspacing="3.2">'+
	'<tr>'+
	'<td style="width: 55px;height: 17px;" align="right">' + FixedNameShipTo + '</td>';
	/**TODO*/
	//20230314 changed by zhou start
	if(isEmpty(destinationCustoms)){
		str +='<td style="width: 275px;">' + shipAddressee  + '</td>';
	}else{
	    str +='<td style="width: 275px;">' + destinationName + '</td>';
	}
	//20230314 changed by zhou 
	var tmpNamenohierarchy = '';
	if (DjLanguage == '日本語'){
	    tmpNamenohierarchy = legalname;
	} else {
	    tmpNamenohierarchy = custrecord_djkk_subsidiary_en;
	}
	
	str +='<td style="width: 55px;" align="right">' + FixedNameBillTo + '</td>'+
	// DENISJAPANDEV-1383 zheng 20230303 start
	// '<td style="width: 300px;">' + name + '</td>'+
	'<td style="width: 275px;">' + tmpNamenohierarchy + '</td>'+
	// DENISJAPANDEV-1383 zheng 20230303 end
	'</tr>'+
	'<tr>'+
	'<td style="height: 17px;"></td>';
	// DENISJAPANDEV-1383 zheng 20230302 start
	// if(roleSub !=SUB_SCETI || roleSub !=SUB_DPKK){
	if(roleSub !=SUB_SCETI && roleSub !=SUB_DPKK){
	// DENISJAPANDEV-1383 zheng 20230302 end
		//20230314 changed by zhou start
		/**TODO*/
		if(!isEmpty(destinationCustoms)){
			str +='<td  style="height: 17px;">Notify to our Customs Broker</td>';
		}else {
			str +='<td  style="height: 17px;">' + getStrLenSlice(shipState + ' ' + shipCity, 23) + '</td>';
		}
		//20230314 changed by zhou start
		str +='<td style="height: 17px;"></td>'
	// DENISJAPANDEV-1383 zheng 20230303 start
	// '<td style="width: 300px;height: 17px;">' + subsidiaryAddr +'</td>';
	if (DjLanguage == '日本語'){
	    str += '<td style="height: 17px;">' + subsidiaryZip +'</td>';   
	} else {
	    if (mainaddressEn) {
            var tmpMainaddressEn = mainaddressEn.split('\n');
            var tmpAddr1 = '';
            if (tmpMainaddressEn.length > 1) {
                tmpAddr1 = tmpMainaddressEn[1];
            }
            str += '<td style="height: 17px;">' + tmpAddr1 + '</td>';
	    } else {
	        str += '<td style="height: 17px;">&nbsp;</td>';   
	    }
	}
    // DENISJAPANDEV-1383 zheng 20230303 end
	}else{
		/**TODO*/
		//20230314 changed by zhou start
		if(!isEmpty(destinationCustoms)){
		//str +='<td colspan = "2" style="height: 17px;">' + shipState + shipCity + '</td>'+
			str +='<td colspan = "2" style="height: 17px;">Notify to our Customs Broker</td>';
		}else {
			str +='<td colspan = "2" style="height: 17px;">' + shipState + shipCity + '</td>';
		}
		//20230314 changed by zhou end
		
		// '<td style="width: 300px;height: 17px;">test1' + subsidiaryAddr +'</td>';
		str +='<td style="height: 17px;">' + subsidiaryZip +'</td>';
	}
	str +='</tr>'+
	
	
	'<tr>'+
	'<td></td>';
	/**TODO*/
	//20230314 changed by zhou start
	/**********old*********/
    //'<td colspan="2" style="height: 17px;">'+ shipAddress1 + shipAddress2 + shipAddress3+'</td>'
	if(!isEmpty(destinationCustoms)){
		str +='<td colspan="2" style="height: 17px;">'+ destinationSub +'</td>'
	}else{
		str +='<td colspan="2" style="height: 17px;">'+ shipAddress1 + shipAddress2 + shipAddress3+'</td>'
	}
	/**********new*********/
	//20230314 changed by zhou end
	// DENISJAPANDEV-1383 zheng 20230303 start
	// str2  = '<td style="width: 300px;height: 17px;">'  + subsidiaryCity + '</td>'
	if (DjLanguage == '日本語'){
	    str2  = '<td style="height: 17px;">'  + subsidiaryProvince + ' ' + subsidiaryCity + '</td>'    
	} else {
	    if (mainaddressEn) {
            var tmpMainaddressEn = mainaddressEn.split('\n');
            var tmpAddr2 = '';
            if (tmpMainaddressEn.length > 2) {
                tmpAddr2 = tmpMainaddressEn[2];
            }
            str2  = '<td style="height: 17px;">'  + tmpAddr2 + '</td>'
        } else {
            str2  = '<td style="height: 17px;">&nbsp;</td>'   
        }
	}
	
	// DENISJAPANDEV-1383 zheng 20230303 end
	 //if (DjLanguage == '日本語'){
	  //str2 = str2;
	  //}else{
	   // str2 ='<td style="width: 300px;height: 17px;">'+ FixedNamePersonInCharge  + defaultEmpty(salesrepresentativeCh.firstname) +'&nbsp;'+ defaultEmpty(salesrepresentativeCh.lastname) + comma + employeefirstname +'&nbsp;'+ employeelastname +'</td>'  }
	  //}
	str += str2
	str +='</tr>'+
	'<tr>'+
	'<td style="height: 17px;"></td>';
	/**TODO*/
	//20230314 changed by zhou start
	if(!isEmpty(destinationCustoms)){
	    str +='<td colspan="2" style="height: 17px;">'+ FixedNameAttn +destinationRep + '</td>';
	}else{
		str +='<td colspan="2" style="height: 17px;">'+ FixedNameAttn + shipAttention + '</td>';
	}
	//20230314 changed by zhou end
	
	
	// DENISJAPANDEV-1383 zheng 20230303 start
	// str3  = '<td style="width: 300px;height: 17px;">'+ subsidiaryProvince +'&nbsp;&nbsp;' + subsidiaryZip +'</td>'
	// str3  = '<td style="width: 300px;height: 17px;">'+ subsidiaryAddr +'</td>'
	// DENISJAPANDEV-1383 zheng 20230303 end
	if (DjLanguage == '日本語'){
		  //str3 = str3;
		     str3  = '<td style="height: 17px;">'+ subsidiaryAddr +'</td>'
		  }else{
		     // str3 ='<td style="height: 17px;">'+ FixedNameTel + employeePhone + '</td>'
		     if (mainaddressEn) {
		         var tmpMainaddressEn = mainaddressEn.split('\n');
		            var tmpAddr3 = '';
		            if (tmpMainaddressEn.length > 3) {
		                tmpAddr3 = tmpMainaddressEn[3];
		            }
		         str3  = '<td style="height: 17px;">'+ tmpAddr3 +'</td>'
		     } else {
		         str3  = '<td style="height: 17px;">&nbsp;</td>'   
		     }
		  }	
		str += str3
		str +='</tr>'+
		'<tr>'+
		'<td style="height: 17px;"></td>';
		//20230314 changed by zhou start
		/**********old*********/
//		'<td colspan="2" style="height: 17px;">Tel: ' + shipAddressphone + '</td>'
		if(!isEmpty(destinationCustoms)){
			str +='<td colspan="2" style="height: 17px;">Tel: '+ destinationRepPhone + '</td>';
		}else{
			str +='<td colspan="2" style="height: 17px;">Tel: ' + shipAddressphone + '</td>';
		}
		//20230314 changed by zhou end
		var tmpPersons = '';
		var tmpEmployeeNames = employeefirstname + employeelastname;
		if (DjLanguage == '英語') {
		    if (salesrepresentativeCh) {
		        if (tmpEmployeeNames) {
		            tmpPersons = defaultEmpty(salesrepresentativeCh.custentity_djkk_english_firstname) +'&nbsp;'+ defaultEmpty(salesrepresentativeCh.custentity_djkk_english_lastname)  + comma;
		        } else {
		            tmpPersons = defaultEmpty(salesrepresentativeCh.custentity_djkk_english_firstname) +'&nbsp;'+ defaultEmpty(salesrepresentativeCh.custentity_djkk_english_lastname);
		        }
		    }
		} else {
		    if (salesrepresentativeCh) {
		        if (tmpEmployeeNames) {
		            tmpPersons = defaultEmpty(salesrepresentativeCh.firstname) +'&nbsp;'+ defaultEmpty(salesrepresentativeCh.lastname)  + comma;
		        } else {
		            tmpPersons = defaultEmpty(salesrepresentativeCh.firstname) +'&nbsp;'+ defaultEmpty(salesrepresentativeCh.lastname);
		        }
		    }
		}
		str4  = '<td style="height: 17px;">'+ FixedNamePersonInCharge  + tmpPersons + employeefirstname +'&nbsp;'+ employeelastname +'</td>'
		 //if (DjLanguage == '日本語'){
		 //}else{
		    //str4 ='<td style="height: 17px;">'+ FixedNameFax + employeeFax + '</td>'
		 //}	
		str += str4
		nlapiLogExecution('DEBUG', 'subsidiaryTel', subsidiaryTel)
		
//		'<td style="width: 300px;height: 17px;">'+ FixedNamePersonInCharge  + salesrepresentative + comma + +employeefirstname +'&nbsp;'+ employeelastname +'</td>'+
		str += '</tr>'+
		'<tr>'+
		'<td colspan="3" style="height: 17px;"></td>'
		str5  = '<td style="height: 17px;">'+ FixedNameTel + subsidiaryTel + '</td>'
		 if (DjLanguage == '日本語'){
		  str5 = str5;
		  }else{
		   str5 ='<td style="height: 17px;">'+ FixedNameTel + subsidiaryTel + '</td>'  }	
		str += str5			
//		'<td style="height: 17px;">'+ FixedNameTel + employeePhone + '</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="3" style="height: 17px;"></td>'
		
		str += '</tr>'+
		'<tr>'+
		'<td colspan="3" style="height: 17px;"></td>'
		str6  = '<td style="height: 17px;">'+ FixedNameFax + subsidiaryFax + '</td>'
		 if (DjLanguage == '日本語'){
		  str6 = str6;
		  }else{
		   str6 ='<td style="height: 17px;">'+ FixedNameFax + subsidiaryFax + '</td>'  }	
		str += str6
		str += '</tr>'+
	'</table>'+
	''+
	''+
	'<table cell-spacing="0" style="width:660px;margin-left: 0.2in;border-collapse: collapse;"><tr>'+
	'<td style="width:80%; padding-left: 0px; padding-right: 0px;">'+
	'<table cellpadding="0" cellspacing="0" style="width: 100%;"><tr style="border-bottom: 1px;">'+
	'<td style="width: 45%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">'+FixedNameTradeTerms + '&nbsp;' + incoterm + '&nbsp;' + incotermSiteValue + '</td>'+
	'<td align="right" style="width: 40%;padding: 2px 2px 2px 0px; height: 25px;" vertical-align="bottom"><span>' + incotermTimeFormat + '&nbsp;&nbsp;&nbsp; ('+FixedNameLaTest+')</span></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">' + FixedNamePaymentTerms + '&nbsp;' + paymentTerms + '</td>'+
	'<td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>'+
	'</tr></table>'+
	'</td>'+
	'<td align="left" cell-spacing="0" style="padding-left: 0px;padding-right: 0px;padding-top: 3px;">'+
	// DENISJAPANDEV-1383 zheng 20230302 start
	// '<table><tr>'+
//	'<table cellpadding="0" cellspacing="0"><tr>'+
//	// '<td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>'+
//	'<td style="width: 40px; height: 40px;border-left:1px solid #499AFF;border-top:1px solid #499AFF;border-bottom:1px solid #499AFF;">&nbsp;</td>'+
//	// '<td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>'+
//	'<td style="width: 40px; height: 40px;border-left:1px solid #499AFF;border-top:1px solid #499AFF;border-bottom:1px solid #499AFF;">&nbsp;</td>'+
//	// '<td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>'+
//	'<td style="width: 40px; height: 40px;border-left:1px solid #499AFF;border-top:1px solid #499AFF;border-bottom:1px solid #499AFF;border-right:1px solid #499AFF;">&nbsp;</td>'+
//	// DENISJAPANDEV-1383 zheng 20230302 end
//	'</tr></table>'+
	'</td>'+
	'</tr></table>'+
	
	'<table border="0" style="width: 660px;border-collapse:collapse; margin-right:3px;margin-left:-3px;" align="center" cellpadding="0" cellspacing="0">'+
	'<tr>'+
	'<td align="center" style="width: 40px;height:15px;border-right:0">&nbsp;</td>'+
	'<td align="center" style="width: 40px;height:15px;border-right:0">&nbsp;</td>'+
	'<td align="center" style="width: 40px;height:15px;border-right:0">&nbsp;</td>'+
	'<td align="center" style="width: 40px;height:15px;border-right:0">&nbsp;</td>'+
	'<td align="center" style="width: 40px;height:15px;border-right:0">&nbsp;</td>'+
	'<td align="center" style="width: 40px;height:15px;border-right:0"></td>'+
	'</tr>'+
	'</table>'+		
	'<table style="width: 660px;border-collapse:collapse; margin-right:3px;margin-left:-3px;" align="center" cellpadding="0" cellspacing="0">'+
	'<tr>';
	
	// DENISJAPANDEV-1383 zheng 20230302 start
	// if(roleSub !=SUB_SCETI || roleSub !=SUB_DPKK){
	if(roleSub !=SUB_SCETI && roleSub !=SUB_DPKK){
    // DENISJAPANDEV-1383 zheng 20230302 end
		str +='<td align="center" style="width: 25px;border-right:0"></td>'+
			'<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:2px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameReference + '</td>'+
	         // DENISJAPANDEV-1383 zheng 20230301 start
			//'<td align="center" style="width: 250px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">'+ FixedNameProductDescription + '</td>'+
			'<td align="center" style="width: 260px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">'+ FixedNameProductDescription + '</td>'+
			// '<td align="center" style="width: 125px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameQuantity + '</td>'+
			'<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameQuantity + '</td>'+
			// '<td align="center" style="width: 85px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameUnitPrice + '</td>'+
			'<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameUnitPrice + '</td>'+
			// DENISJAPANDEV-1383 zheng 20230301 end
			'<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;border-right-width:2px; border-bottom-width:1px;line-height:30px;">' + FixedNameTotalPrice + '</td>';
	}else{
		str +='<td align="center" style="width: 25px;border-right:0"></td>'+
			'<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:2px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameReference + '</td>'+
			// DENISJAPANDEV-1383 zheng 20230303 start
			// '<td align="center" style="width: 250px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">'+ FixedNameProductDescription + '</td>'+
			// '<td align="center" style="width: 85px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameQuantity + '</td>'+
			// '<td align="center" style="width: 85px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameUnitPrice + '</td>'+
			// '<td align="center" style="width: 140px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;border-right-width:2px; border-bottom-width:1px;line-height:30px;">' + FixedNameTotalPrice + '</td>';
            '<td align="center" style="width: 260px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">'+ FixedNameProductDescription + '</td>'+
            '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameQuantity + '</td>'+
            '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameUnitPrice + '</td>'+
            '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;border-right-width:2px; border-bottom-width:1px;line-height:30px;">' + FixedNameTotalPrice + '</td>';
		    // DENISJAPANDEV-1383 zheng 20230301 end
		}
	
	str += '</tr>'+
	'</table>'+
	'</macro>'+
	'<macro id="nlfooter">'+
//	'<table  width="660px" cellspacing="0">'+
//	'<tr>'+
//	'<td align="right">OUR INTERNAL REF:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="right">'+ section +'&nbsp;&nbsp;&nbsp;&nbsp;'+ vendorCode +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + receiptedScheduleDate + '</td>'+
//	'</tr>'+
//	'</table>'+
	'<table border="0" class="footer" style="width: 660px; border-top:2px soild #6F8CAD;">'+
	'<tr>'+
	'<td align="right" style="width:660px;margin-right:55px">' + location + '</td>'+
	'</tr>'+
	'<tr style="color:#4678d0;">'+
	'<td style="width: 525px;padding-top:5px;">'+
	'<span style="font-size:12px;">&nbsp;&nbsp;&nbsp;&nbsp;'+ legalname+'</span><br />'+
	'<span style="font-size:9px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+ subsidiaryZip + '&nbsp;' + subsidiaryProvince + '&nbsp;'+ subsidiaryCity+ '&nbsp;' + subsidiaryAddr+'</span><br />'+
	'<span style="font-size:12px;">&nbsp;&nbsp;&nbsp;&nbsp;'+ custrecord_djkk_subsidiary_en+'</span><br />'+
	'<span style="font-size:9px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+ mainaddressEn+'</span></td>'+
	//'<td align="right" style="width: 256px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" style="width: 90px; height: 50px; margin-top: 5px; float: right;" /></td>'+
	'<td align="right" style="width: 256px;"><img src="/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width: 90px; height: 50px; margin-top: 5px; float: right;" /></td>'+
	'</tr></table>'+
	'</macro>'+
	'</macrolist>'+
	'<style type="text/css">* {'+
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
	'table {'+
	'font-size: 9pt;'+
	'table-layout: fixed;'+
	'}'+
	'th {'+
	'font-weight: bold;'+
	'font-size: 8pt;'+
	'vertical-align: middle;'+
	'padding: 5px 6px 3px;'+
	'background-color: #e3e3e3;'+
	'color: #333333;'+
	'}'+
	'td {'+
	'padding: 4px 6px;'+
	'}'+
	'td p { align:left }'+
	'b {'+
	'font-weight: bold;'+
	'color: #333333;'+
	'}'+
	'table.header td {'+
	'padding: 0;'+
	'font-size: 10pt;'+
	'}'+
	'table.footer td {'+
	'padding: 0;'+
	'font-size: 8pt;'+
	'}'+
	'table.itemtable th {'+
	'padding-bottom: 10px;'+
	'padding-top: 10px;'+
	'}'+
	'table.body td {'+
	'padding-top: 2px;'+
	'}'+
	'tr.totalrow {'+
	'background-color: #e3e3e3;'+
	'line-height: 200%;'+
	'}'+
	'td.totalboxtop {'+
	'font-size: 12pt;'+
	'background-color: #e3e3e3;'+
	'}'+
	'td.addressheader {'+
	'font-size: 8pt;'+
	'padding-top: 6px;'+
	'padding-bottom: 2px;'+
	'}'+
	'td.address {'+
	'padding-top: 0;'+
	'}'+
	'td.totalboxmid {'+
	'font-size: 28pt;'+
	'padding-top: 20px;'+
	'background-color: #e3e3e3;'+
	'}'+
	'td.totalboxbot {'+
	'background-color: #e3e3e3;'+
	'font-weight: bold;'+
	'}'+
	'span.title {'+
	'font-size: 28pt;'+
	'}'+
	'span.number {'+
	'font-size: 16pt;'+
	'}'+
	'span.itemname {'+
	'font-weight: bold;'+
	'line-height: 150%;'+
	'}'+
	'hr {'+
	'width: 100%;'+
	'color: #d3d3d3;'+
	'background-color: #d3d3d3;'+
	'height: 1px;'+
	'}'+
	'.itemdetailtb{width:660px; border-collapse:collapse;margin-left:0.2in; margin-top:30px;}'+
	'.itemdetailhtr{height:20px;}'+
	'.itemhlineno{width:5%;}'+
	'.itemhref{width:12%; border-left: 2px solid #499AFF; border-top: 2px solid #499AFF; border-bottom: 1px solid #499AFF;}'+
	'.itemhprodesc{width:14%; border-left: 1px solid #499AFF; border-top: 2px solid #499AFF; border-bottom: 1px solid #499AFF;}'+
	'.itemhquan,.itemhunitprice,.itemhtotalprice{width:13%; border-left: 1px solid #499AFF; border-top: 2px solid #499AFF; border-bottom: 1px solid #499AFF;}'+
	'.itemhtotalprice{border-right: 2px solid #499AFF;}'+
	'.itemref{border-left: 2px solid #499AFF;}'+
	'.itemprodesc,.itemquan,.itemunitprice,.itemtotalprice{border-left: 1px solid #499AFF;}'+
	'.itemtotalprice{border-right: 2px solid #499AFF;}'+
	'.itemref,.itemreflast{min-height:40px;}'+
	'.itemreflast{border-left: 2px solid #499AFF;}'+
	'.itemprodesclast,.itemquanlast,.itemunitpricelast,.itemtotalpricelast{border-left: 1px solid #499AFF;}'+
	'.itemtotalpricelast{border-right: 2px solid #499AFF;}'+
	'.itemreflast,.itemprodesclast,.itemquanlast,.itemunitpricelast,.itemtotalpricelast{border-bottom: 2px solid #499AFF;}'+
	'.topbd{border-top: 2px solid #499AFF;}'+
	'.totaltd{border-left: 2px solid #499AFF; border-bottom: 1px solid #499AFF;}'+
	'.pricetd{border-left: 1px solid #499AFF; border-bottom: 1px solid #499AFF; border-right: 2px solid #499AFF;}'+
	'.currencytd{border-left: 2px solid #499AFF; border-bottom: 2px solid #499AFF;}'+
	'.lasttd{border-left: 1px solid #499AFF; border-bottom: 2px solid #499AFF; border-right: 2px solid #499AFF;}'+
	'.totaltd,.pricetd,.currencytd,.lasttd{height:30px; vertical-align:middle;}'+
	'.msg{margin-top:10px; border-top:1px; border-bottom:1px;}'+
	'.noleftpadding{padding-left:0px;}'+
	'.internalref{margin-left:0.2in; width:660px;border-collapse: collapse;}'+
	'.internalrefmsg{line-height:16pt;}'+
	'</style>'+
	'</head>'+
	'<body header="nlheader" header-height="44.2%" footer="nlfooter" footer-height="3%" padding="0.2in 0.5in 0.5in 0.5in" size="A4">'+
	'<table style="width: 660px;" align="center" cellpadding="0" cellspacing="0" border="0">';
//	'<tr>'+
//	'<td style="border:none;width:20px;height:30px;padding:0;margin:0;">&nbsp;</td>'+
//	'<td style="border:none;padding:0;margin:0;">&nbsp;</td>'+
//	'<td style="border:none;padding:0;margin:0;">&nbsp;</td>'+
//	'<td style="border:none;padding:0;margin:0;">&nbsp;</td>'+
//	'<td align="right" style="border:none;padding:0;margin:0;">&nbsp;</td>'+
//	'<td align="right" style="border:none;padding:0;margin:0;">&nbsp;</td>'+
//	'</tr>';
	    var tmpDetailCnt = 0;
		for(var j =0; j < itemDetails.length;j++){
		    // DENISJAPANDEV-1383 zheng 20230302 start
			// if(roleSub !=SUB_SCETI || roleSub !=SUB_DPKK){
		    // CH461 20230516 zheng start
		    var displayQuantity = '';
		    var displayRate = '';
		    if (itemDetails[j].itemType != 'discountitem') {
		        displayQuantity = itemDetails[j].quantity + '&nbsp;' + itemDetails[j].units_display;
		        displayRate = itemDetails[j].origrate;
		    }
		    // CH461 20230516 zheng end
			if(roleSub !=SUB_SCETI && roleSub !=SUB_DPKK){
			// DENISJAPANDEV-1383 zheng 20230302 end
		//		var itemDetail = itemDetails[j];
				nlapiLogExecution('debug','itemDetails[j].itemType1',j+1+'+'+itemDetails[j].itemType)
				if(itemDetails[j].itemType != 'subtotalitem'&&!isEmpty(itemDetails[j].itemType)){
					var no = j+1;
					tmpDetailCnt = tmpDetailCnt + 1;
					nlapiLogExecution('debug','itemDetails[j].itemType2',j+1+'+'+itemDetails[j].itemType)
					str += '<tr style="line-height:11px">';
					if (tmpDetailCnt % 8 == 0) {
					    str += '<td style="width: 25px;">'+ prefixInteger(no, 2) +'0</td>'+
		                    '<td style="border-left: 2px solid #499AFF;width: 100px;">&nbsp;</td>'+
		                    // DENISJAPANDEV-1383 zheng 20230301 start
		                    // '<td style="border-left: 1px solid #499AFF;width: 250px;"></td>'+
		                    '<td style="border-left: 1px solid #499AFF;width: 260px;">&nbsp;</td>'+
		                    // '<td style="border-left: 1px solid #499AFF;width: 125px;"></td>'+
		                    '<td style="border-left: 1px solid #499AFF;width: 100px;">&nbsp;</td>'+
		                    // '<td style="border-left: 1px solid #499AFF;width: 85px;"></td>'+
		                    '<td style="border-left: 1px solid #499AFF;width: 100px;">&nbsp;</td>'+
		                    // DENISJAPANDEV-1383 zheng 20230301 end
		                    '<td style="border-left: 1px solid #499AFF;width: 100px; border-right:  2px solid #499AFF;">&nbsp;</td>'+
		                    '</tr>'+
		                    '<tr style="line-height:12px">'+
		                    '<td style="width: 20px;"></td>'+
		                    '<td style="border-bottom: 1px solid #499AFF;border-left: 2px solid #499AFF;">'+
		                    // DENISJAPANDEV-1383 zheng 20230301 start
		                    //'<table style="width: 100px;height: 50px;">'+
		                    '<table style="width: 100%;" cellpadding="0" cellspacing="0">'+
		                    '<tr>'+
		                    //'<td>'+ itemDetails[j].itemCode +'</td>'+
		                    '<td>&nbsp;'+ itemDetails[j].itemCode +'</td>'+
		                    '</tr>'+
		                    '<tr>'+
		                    //'<td>'+ itemDetails[j].vendorItemCode +'</td>'+
		                    '<td>&nbsp;'+ itemDetails[j].vendorItemCode +'</td>'+
		                    '</tr>'+
		                    '<tr>'+
		                    //'<td>'+ itemDetails[j].productCode +'</td>'+
		                    '<td>&nbsp;'+ itemDetails[j].productCode +'</td>'+
		                    '</tr>'+
		                    '<tr>'+
		                    //'<td>'+ itemDetails[j].upcCode +'</td>'+
		                    '<td>&nbsp;'+ itemDetails[j].upcCode +'</td>'+
		                    '</tr>'+
		                    '</table>'+
		                    '</td>'+
		                    '<td style="border-bottom: 1px solid #499AFF;border-left: 1px solid #499AFF;">'+
		                    // '<table style="width: 250px;">'+
		                    '<table style="width: 250px;" cellpadding="0" cellspacing="0">'+
		                    '<tr>'+
		                    // '<td>'+ itemDetails[j].itemName1  +'</td>'+
		                    '<td>&nbsp;'+ itemDetails[j].itemName1  +'</td>'+
		                    '</tr>'+
		                    '<tr>'+
		                    // '<td>'+ itemDetails[j].itemName2  +'</td>'+
		                    '<td>&nbsp;'+ itemDetails[j].itemName2  +'</td>'+
		                    '</tr>'+
		                    // DENISJAPANDEV-1383 zheng 20230301 end
		                    '<tr>'+
		                    '<td>';
		                    var description = itemDetails[j].description ;
		                    var descriptionArr = description.split('\n');
		                    str +='<table style="width: 250px;" cellpadding="0" cellspacing="0">';
		                    for(var dcp = 0 ; dcp < descriptionArr.length ; dcp++){
	                              if (dcp >= 2) {
	                                    break;
	                                }
		                        str +='<tr>'+
		                        '<td>'+getStrLenSlice(descriptionArr[dcp], 21)+'</td>'+
		                        '</tr>';
		                    }
		                    str +='</table>'+
		                    '</td>'+
		                    '</tr>'+
		                    '</table>'+
		                    '</td>'+
		                    '<td align="right"  style="border-bottom: 1px solid #499AFF;border-left: 1px solid #499AFF;">'+ displayQuantity + '</td>'+
		                    '<td align="right" style="border-bottom: 1px solid #499AFF;border-left: 1px solid #499AFF;width: 85px;">'+ displayRate +'&nbsp;</td>'+
		                    '<td align="right" style="border-bottom: 1px solid #499AFF;border-left: 1px solid #499AFF; border-right: 2px solid #499AFF;">'+ itemDetails[j].amount +'&nbsp;</td>'+
		                    '</tr>';
		                      str += '<tr style="line-height:11px"><td style="width: 25px;">&nbsp;</td>'+
	                            '<td style="width: 100px;">&nbsp;</td>'+
	                            '<td style="width: 260px;">&nbsp;</td>'+
	                            '<td style="width: 100px;">&nbsp;</td>'+
	                            '<td style="width: 100px;">&nbsp;</td>'+
	                            '<td style="width: 100px; ">&nbsp;</td>'+
	                            '</tr>';
					} else {
					    str += '<td style="width: 25px;">'+ prefixInteger(no, 2) +'0</td>'+
		                    '<td style="border-left: 2px solid #499AFF;width: 100px;">&nbsp;</td>'+
		                    // DENISJAPANDEV-1383 zheng 20230301 start
		                    // '<td style="border-left: 1px solid #499AFF;width: 250px;"></td>'+
		                    '<td style="border-left: 1px solid #499AFF;width: 260px;">&nbsp;</td>'+
		                    // '<td style="border-left: 1px solid #499AFF;width: 125px;"></td>'+
		                    '<td style="border-left: 1px solid #499AFF;width: 100px;">&nbsp;</td>'+
		                    // '<td style="border-left: 1px solid #499AFF;width: 85px;"></td>'+
		                    '<td style="border-left: 1px solid #499AFF;width: 100px;">&nbsp;</td>'+
		                    // DENISJAPANDEV-1383 zheng 20230301 end
		                    '<td style="border-left: 1px solid #499AFF;width: 100px; border-right:  2px solid #499AFF;">&nbsp;</td>'+
		                    '</tr>'+
		                    '<tr style="line-height:12px">'+
		                    '<td style="width: 20px;"></td>'+
		                    '<td style="border-left: 2px solid #499AFF;">'+
		                    // DENISJAPANDEV-1383 zheng 20230301 start
		                    //'<table style="width: 100px;height: 50px;">'+
		                    '<table style="width: 100%;" cellpadding="0" cellspacing="0">'+
		                    '<tr>'+
		                    //'<td>'+ itemDetails[j].itemCode +'</td>'+
		                    '<td>&nbsp;'+ getStrLenSlice(itemDetails[j].itemCode, 7) +'</td>'+
		                    '</tr>'+
		                    '<tr>'+
		                    //'<td>'+ itemDetails[j].vendorItemCode +'</td>'+
		                    '<td>&nbsp;'+ getStrLenSlice(itemDetails[j].vendorItemCode, 7) +'</td>'+
		                    '</tr>'+
		                    '<tr>'+
		                    //'<td>'+ itemDetails[j].productCode +'</td>'+
		                    '<td>&nbsp;'+ getStrLenSlice(itemDetails[j].productCode, 7) +'</td>'+
		                    '</tr>'+
		                    '<tr>'+
		                    //'<td>'+ itemDetails[j].upcCode +'</td>'+
		                    '<td>&nbsp;'+ getStrLenSlice(itemDetails[j].upcCode, 7) +'</td>'+
		                    '</tr>'+
		                    '</table>'+
		                    '</td>'+
		                    '<td style="border-left: 1px solid #499AFF;">'+
		                    // '<table style="width: 250px;">'+
		                    '<table style="width: 250px;" cellpadding="0" cellspacing="0">'+
		                    '<tr>'+
		                    // '<td>'+ itemDetails[j].itemName1  +'</td>'+
		                    '<td>&nbsp;'+ getStrLenSlice(itemDetails[j].itemName1, 21)  +'</td>'+
		                    '</tr>'+
		                    '<tr>'+
		                    // '<td>'+ itemDetails[j].itemName2  +'</td>'+
		                    '<td>&nbsp;'+ getStrLenSlice(itemDetails[j].itemName2, 21)  +'</td>'+
		                    '</tr>'+
		                    // DENISJAPANDEV-1383 zheng 20230301 end
		                    '<tr>'+
		                    '<td>';
		                    var description = itemDetails[j].description ;
		                    var descriptionArr = description.split('\n');
		                    str +='<table style="width: 250px;" cellpadding="0" cellspacing="0">';
		                    for(var dcp = 0 ; dcp < descriptionArr.length ; dcp++){
		                        if (dcp >= 2) {
		                            break;
		                        }
		                        str +='<tr>'+
		                        '<td>'+getStrLenSlice(descriptionArr[dcp], 21)+'</td>'+
		                        '</tr>';
		                    }
		                    str +='</table>'+
		                    '</td>'+
		                    '</tr>'+
		                    '</table>'+
		                    '</td>'+
		                    '<td align="right"  style="border-left: 1px solid #499AFF;">'+ displayQuantity + '</td>'+
		                    '<td align="right" style="border-left: 1px solid #499AFF;width: 85px;">'+ displayRate +'&nbsp;</td>'+
		                    '<td align="right" style="border-left: 1px solid #499AFF; border-right: 2px solid #499AFF;">'+ itemDetails[j].amount +'&nbsp;</td>'+
		                    '</tr>';   
					}
				}
			}else{
				if(itemDetails[j].itemType != 'subtotalitem'&&!isEmpty(itemDetails[j].itemType)){
//				var itemDetail = itemDetails[j];
					var no = j+1;
					str += '<tr style="line-height:11px">'+
					'<td style="width: 25px;">'+ prefixInteger(no, 2) +'0</td>'+
					'<td style="border-left: 2px solid #499AFF;width: 100px;"></td>'+
					// DENISJAPANDEV-1383 zheng 20230303 start
					// '<td style="border-left: 1px solid #499AFF;width: 250px;"></td>'+
					// '<td style="border-left: 1px solid #499AFF;width: 85px;"></td>'+
					// '<td style="border-left: 1px solid #499AFF;width: 85px;"></td>'+
					// '<td style="border-left: 1px solid #499AFF;width: 140px; border-right:  2px solid #499AFF;"></td>'+
                    '<td style="border-left: 1px solid #499AFF;width: 260px;"></td>'+
                    '<td style="border-left: 1px solid #499AFF;width: 100px;"></td>'+
                    '<td style="border-left: 1px solid #499AFF;width: 100px;"></td>'+
                    '<td style="border-left: 1px solid #499AFF;width: 100px; border-right:  2px solid #499AFF;"></td>'+
					// DENISJAPANDEV-1383 zheng 20230303 end
					'</tr>'+
					'<tr>'+
					'<td style="width: 20px;"></td>'+
					'<td style="border-left: 2px solid #499AFF;">'+
					'<table style="width: 100px;height: 50px;">'+
					'<tr>'+
					'<td>'+ getStrLenSlice(itemDetails[j].itemCode, 7) +'</td>'+
					'</tr>'+
					'<tr>'+
					'<td>'+ getStrLenSlice(itemDetails[j].vendorItemCode, 7) +'</td>'+
					'</tr>'+
					'<tr>'+
					'<td>'+ getStrLenSlice(itemDetails[j].productCode, 7) +'</td>'+
					'</tr>'+
					'<tr>'+
					'<td>'+ getStrLenSlice(itemDetails[j].upcCode, 7) +'</td>'+
					'</tr>'+
					'</table>'+
					'</td>'+
					'<td style="border-left: 1px solid #499AFF;">'+
					// DENISJAPANDEV-1383 zheng 20230303 start
					//'<table style="width: 250px;">'+
					'<table style="width: 260px;">'+
					// DENISJAPANDEV-1383 zheng 20230303 end
					'<tr>'+
					'<td>'+ itemDetails[j].description +'</td>'+
					'</tr>'+
					'<tr>'+
					'<td>'+ itemDetails[j].itemName1  +'</td>'+
					'</tr>'+
					'<tr>'+
					'<td>'+ itemDetails[j].itemName2  +'</td>'+
					'</tr>'+
					'</table>'+
					'</td>'+
					// DENISJAPANDEV-1383 zheng 20230303 start
					// '<td style="border-left: 1px solid #499AFF;">'+ itemDetails[j].quantity + '&nbsp;' + itemDetails[j].units_display + '</td>'+
					// '<td align="right" style="border-left: 1px solid #499AFF;width: 85px;">'+ itemDetails[j].origrate +'</td>'+
					// '<td align="right" style="border-left: 1px solid #499AFF; border-right: 2px solid #499AFF;">'+ itemDetails[j].amount +'</td>'+
                    '<td align="right" style="border-left: 1px solid #499AFF;">'+ displayQuantity + '</td>'+
                    '<td align="right" style="border-left: 1px solid #499AFF;width: 85px;">'+ displayRate +'&nbsp;</td>'+
                    '<td align="right" style="border-left: 1px solid #499AFF; border-right: 2px solid #499AFF;">'+ itemDetails[j].amount +'&nbsp;</td>'+
					// DENISJAPANDEV-1383 zheng 20230303 end
					'</tr>';
				}
			}
	}

    if(roleSub !=SUB_SCETI && roleSub !=SUB_DPKK){
        var tmpLoopCnt = dealPage(tmpDetailCnt);
        if (tmpLoopCnt > 0) {
            for(var t2 = 0; t2 < tmpLoopCnt;t2++) {
                str += '<tr style="line-height:11px">'+
                '<td style="">&nbsp;</td>'+
                '<td style="border-left: 2px solid #499AFF;width: 100px;">&nbsp;</td>'+
                '<td style="border-left: 1px solid #499AFF;width: 260px;">&nbsp;</td>'+
                '<td style="border-left: 1px solid #499AFF;width: 100px;">&nbsp;</td>'+
                '<td style="border-left: 1px solid #499AFF;width: 100px;">&nbsp;</td>'+
                '<td style="border-left: 1px solid #499AFF;width: 100px; border-right:  2px solid #499AFF;">&nbsp;</td>'+
                '</tr>';
                if (tmpLoopCnt - 1 == t2) {
                    str += '<tr style="line-height:12px">'+
                    '<td style="width: 25px;">&nbsp;</td>'+
                    '<td style="border-bottom: 1px solid #499AFF;border-left: 2px solid #499AFF;width: 100px;">' +
                    '<table style="width: 100%;" cellpadding="0" cellspacing="0">'+
                    '<tr>'+
                    '<td>&nbsp;</td>'+
                    '</tr>'+
                    '<tr>'+
                    '<td>&nbsp;</td>'+
                    '</tr>'+
                    '<tr>'+
                    '<td>&nbsp;</td>'+
                    '</tr>';
                    str +='<tr>'+
                    '<td>&nbsp;</td>'+
                    '</tr>'+
                    '</table>'+
                    '</td>'+
                    '<td style="border-left: 1px solid #499AFF;border-bottom: 1px solid #499AFF;width: 260px;">&nbsp;</td>'+
                    '<td style="border-left: 1px solid #499AFF;border-bottom: 1px solid #499AFF;width: 100px;">&nbsp;</td>'+
                    '<td style="border-left: 1px solid #499AFF;border-bottom: 1px solid #499AFF;width: 100px;">&nbsp;</td>'+
                    '<td style="border-left: 1px solid #499AFF;border-bottom: 1px solid #499AFF;width: 100px; border-right:  2px solid #499AFF;">&nbsp;</td>'+
                    '</tr>'
                } else {
                    str += '<tr style="line-height:12px">'+
                    '<td style="width: 25px;">&nbsp;</td>'+
                    '<td style="border-left: 2px solid #499AFF;width: 100px;">' +
                    '<table style="width: 100%;" cellpadding="0" cellspacing="0">'+
                    '<tr>'+
                    '<td>&nbsp;</td>'+
                    '</tr>'+
                    '<tr>'+
                    '<td>&nbsp;</td>'+
                    '</tr>'+
                    '<tr>'+
                    '<td>&nbsp;</td>'+
                    '</tr>';
                    str +='<tr>'+
                    '<td>&nbsp;</td>'+
                    '</tr>'+
                    '</table>'+
                    '</td>'+
                    '<td style="border-left: 1px solid #499AFF;width: 260px;">&nbsp;</td>'+
                    '<td style="border-left: 1px solid #499AFF;width: 100px;">&nbsp;</td>'+
                    '<td style="border-left: 1px solid #499AFF;width: 100px;">&nbsp;</td>'+
                    '<td style="border-left: 1px solid #499AFF;width: 100px; border-right:  2px solid #499AFF;">&nbsp;</td>'+
                    '</tr>'   
                }
            }
        } else {
            str += '<tr >'+
            '<td style="width: 20px;height: 10px;"></td>'+
            '<td style="height: 10px;border-top:2px solid #499AFF; border-left: 2px solid #499AFF;"></td>'+
            '<td style="height: 10px;border-top:2px solid #499AFF;" colspan="3"></td>'+
            '<td style="border-top:2px solid #499AFF; border-right: 2px solid #499AFF;height: 10px;"></td>'+
            '</tr>';  
        }
    } else {
        str += '<tr >'+
        '<td style="width: 20px;height: 10px;"></td>'+
        '<td style="height: 10px;border-top:2px solid #499AFF; border-left: 2px solid #499AFF;"></td>'+
        '<td style="height: 10px;border-top:2px solid #499AFF;" colspan="3"></td>'+
        '<td style="border-top:2px solid #499AFF; border-right: 2px solid #499AFF;height: 10px;"></td>'+
        '</tr>';
    }
	
	str += '<tr >'+
	'<td style="width: 20px;"></td>'+
	'<td style="border-left: 2px solid #499AFF;border-right: 2px solid #499AFF;height: 75px;" colspan="5">';
//	+ poComment + 
	var poCommentArr = poComment.split('\n');
	str +='<table border="0" style="width:100%" cellpadding="1" cellspacing="0">';
	for(var poc = 0 ; poc < poCommentArr.length ; poc++){
	    if (poc >= 5) {
	        break;
	    }
		str +='<tr style="line-height:12px">'+
		'<td>'+getStrLenSlice(poCommentArr[poc], 56)+'</td>'+
		'</tr>';
	}
	str +='</table>'+
	'</td>'+
	//'<td style="border-right: 2px solid #499AFF;height: 75px;"></td>'+
	'</tr>';
	//attention , it may be should change	!
	str += '<tr>'+
	'<td rowspan="2" height="25px" >&nbsp;</td>'+
	'<td valign="middle" height="30px" class="noleftpadding" colspan="3" rowspan="2" style="padding-top:10px; border-top:2px solid #499AFF;">'+
	'<p class="msg" style="margin-top:10px">'+FixedNameOrderConfirm1+'<br />'+FixedNameOrderConfirm2+'</p>'+
	''+
//	'<p>'+FixedNameReceptionDate+'</p>'+
	'</td>';

	
	str+='<td height="30px" align="center" class="topbd totaltd">'+
	'<table>';
	if(roleSub !=SUB_SCETI && roleSub !=SUB_DPKK){
	str+='<tr>'+
	// DENISJAPANDEV-1383 zheng 20230302 start
	//'<td style="line-height:10px;">SubTotal&nbsp;('+ currency +')</td>'+
	'<td style="line-height:10px;">'+FixedNameSubTotal+'&nbsp;('+ currency +')</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="line-height:10px;">'+FixedNameTaxTotal+'&nbsp;('+ currency +')</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="line-height:10px;">'+FixedNameTotal+'&nbsp;('+ currency +')</td>'+
	'</tr>';
	// DENISJAPANDEV-1383 zheng 20230302 end
	}else {
	    // DENISJAPANDEV-1383 zheng 20230303 start
		str+='<tr>'+
		//'<td style="line-height:10px;">Total&nbsp;('+ currency +')</td>'+
		'<td style="line-height:10px;">'+FixedNameTotal+'('+ currency +')</td>'+
		'</tr>';
		// DENISJAPANDEV-1383 zheng 20230303 end
	}

	str+='</table>'+
	'</td>'+
	'<td height="30px" align="right" class="topbd pricetd">'+
	// DENISJAPANDEV-1383 zheng 20230302 start
	'<table>';
	if(roleSub !=SUB_SCETI && roleSub !=SUB_DPKK){
	    if (DjLanguage == '日本語') {
	        amountTotalFormat = amountTotalFormat.split('.')[0];
	        taxtotalFormat = taxtotalFormat.split('.')[0];
	        totalFormat = totalFormat.split('.')[0];
	    }
		str+='<tr>'+
		//'<td style="line-height:10px;">'+amountTotalFormat+'</td>'+
		'<td align="right" style="line-height:10px;">'+amountTotalFormat+'</td>'+
		'</tr>'+
		'<tr>'+
		//'<td style="line-height:10px;">' + taxtotalFormat + '</td>'+
		'<td align="right" style="line-height:10px;">' + taxtotalFormat + '</td>'+
		'</tr>'+
		'<tr>'+
		//'<td style="line-height:10px;">' + totalFormat + '</td>'+
		'<td align="right" style="line-height:10px;">' + totalFormat + '</td>'+
		// DENISJAPANDEV-1383 zheng 20230302 end
		'</tr>';
	}else{
		str+='<tr>'+
		// DENISJAPANDEV-1383 zheng 20230303 start
		// '<td style="line-height:10px;">' + total + '</td>'+
		'<td style="line-height:10px;">' + totalFormat + '</td>'+
		// DENISJAPANDEV-1383 zheng 20230303 end
		'</tr>';
	}
	str+='</table>'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'</tr>'+
	'<tr>'+
	'<td height="20px" >&nbsp;</td>'+
	'<td height="20px" class="noleftpadding" colspan="5">'+FixedNameReceptionDate+'<br /></td>'+
	'</tr>';
	if(subsidiary == SUB_DPKK || subsidiary == SUB_SCETI){
	    str+='<tr>'+
	    '<td height="20px" >&nbsp;</td>'+
	    '<td height="20px" class="noleftpadding">'+Precautions+'</td>'+
	//  '<td height="20px" align="left" colspan="4">'+vendorPrecautions+'</td>'+//todo
	    '</tr>';
	} else {
	       var vdFieldList = [];
	       vdFieldList.push("custentity_djkk_vd_cautiondesc_title");
	       vdFieldList.push("custentity_djkk_vd_cautiondesc_detail");
	       var vdObj = nlapiLookupField('vendor', vendorId, vdFieldList)
	       var cautiondescTitle = vdObj.custentity_djkk_vd_cautiondesc_title;
	       var cautiondescDetail = vdObj.custentity_djkk_vd_cautiondesc_detail;
	       if (cautiondescTitle) {
	           str+='<tr>'+
	            '<td height="20px" >&nbsp;</td>'+
	            '<td height="20px" class="noleftpadding" style="font-weight: bold;color:red">'+cautiondescTitle+'</td>'+
	        //  '<td height="20px" align="left" colspan="4">'+vendorPrecautions+'</td>'+//todo
	            '</tr>';
	       }
	       if (cautiondescDetail) {
	           var tmpCautiondescDetails = cautiondescDetail.split('\n');
	           var tmpList = [];
	           for(var pt = 0 ; pt < tmpCautiondescDetails.length ; pt++){
	               if (pt > 3) {
	                   break;
	               }
	               var tmpValue = getStrLenSlice(tmpCautiondescDetails[pt], 39);
	               tmpList.push(tmpValue);
	               if (pt != tmpCautiondescDetails.length - 1) {
	                   tmpList.push('<br/>');
	               }
	           }
	           cautiondescDetail = tmpList.join('');
	           str+='<tr>'+
	           '<td height="30px">&nbsp;</td>'+
	           '<td height="40px" style="background-color:#DADADA;" colspan="3">'+cautiondescDetail+'</td>'+
	           '</tr>';
               str+='<tr>'+
               '<td height="20px">&nbsp;</td>'+
               '</tr>';
	       }
	}
    str+='<tr>'+
	  '<td height="20px" >&nbsp;</td>'+
	  '<td height="20px" class="noleftpadding" colspan="2">'+FixedNameAuthorizedSignautre+'<br /></td>'+
	  '<td height="20px" >'+FixedNameCitStamp+'</td>'+
	  '<td height="20px" ></td>'+
	  '<td height="20px" ></td>'+
	  '</tr>';
    str+='<tr>'+
    '<td height="20px" >&nbsp;</td>'+
    '<td height="20px" class="noleftpadding" colspan="2">&nbsp;</td>'+
    '<td height="20px" >&nbsp;</td>'+
    '<td height="20px" colspan="2" align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OUR INTERNAL REF:</td>'+
    '</tr>';
    var tmpDate = '';
    if (receiptedScheduleDate) {
        tmpDate = formatDate2(new Date(receiptedScheduleDate));
    }
    str+='<tr>'+
    '<td height="20px" >&nbsp;</td>'+
    '<td height="20px" class="noleftpadding" colspan="2">&nbsp;</td>'+
    '<td height="20px" >&nbsp;</td>'+
    '<td height="20px" colspan="2" align="right">'+ section +'&nbsp;&nbsp;&nbsp;&nbsp;'+ vendorCode +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + tmpDate + '</td>'+
    '</tr>';
	str+='</table>';
	str+='</body>'+
	'</pdf>'

	var renderer = nlapiCreateTemplateRenderer();
	renderer.setTemplate(str);
	var xml = renderer.renderToString();
	var xlsFile = nlapiXMLToPDF(xml);
	
	// PDF
	// 調査 zheng 20230316 start
	xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
	// xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
	// xlsFile.setIsOnline(true);
	
	// save file
	// var fileID = nlapiSubmitFile(xlsFile);
	// var fl = nlapiLoadFile(fileID);
	
	// var url= URL_HEAD +'/'+fl.getURL();
	// nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
	response.setContentType('PDF',  xlsFile.getName(), 'inline');
	response.write(xlsFile);
	// 調査 zheng 20230316 end
}
function defaultEmpty(src){
	return src || '';
}
function defaultEmptyToZero(src){
	return src || 0;
}
function formatDate(dt){    //日付
	return dt ? (dt.getFullYear() + "-" + PrefixZero((dt.getMonth() + 1), 2) + "-" + PrefixZero(dt.getDate(), 2)) : '';
}

function formatDate2(dt){    //日付 Example:22-01-18
//	return dt ? (dt.getFullYear() + "-" + PrefixZero((dt.getMonth() + 1), 2) + "-" + PrefixZero(dt.getDate(), 2)) : '';
	if (dt == null) {
		return '';
	}else {
		var year = dt.getFullYear()
		var year = year < 2000 ? year + 1900 : year
		var yy = year.toString().substr(2, 2)
		
		var month = PrefixZero((dt.getMonth() + 1), 2)
		var date = PrefixZero(dt.getDate(), 2)
		return yy + "-" + month + "-" + date
	}
}

function transfer(text){
	if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

return text ;
}

//DENISJAPANDEV-1383 zheng 20230303 start
function formatAmount2(str) {
    var tempStr = Number(str);
    var str = String(tempStr);
    var newStr = "";
    var count = 0;
    if (str.indexOf(".") == -1) {
        for (var i = str.length - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + "," + newStr;
            } else {
                newStr = str.charAt(i) + newStr;
            }
            count++;
        }
        str = newStr + '.00';
    } else {
        for (var i = str.indexOf(".") - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + "," + newStr;
            } else {
                newStr = str.charAt(i) + newStr;
            }
            count++;
        }
        str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
    }
    return str;
}

function formatAmount1(str) {
    var tempStr = Number(str);
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

//DENISJAPANDEV-1383 zheng 20230303 end
function dealPage(tmpDetailCnt) {
    
    var returnVal = 0;
    if (tmpDetailCnt <= 3) {
        returnVal = 3 - tmpDetailCnt;
    } else if (3 < tmpDetailCnt && tmpDetailCnt <= 8) {
        returnVal = 8 - tmpDetailCnt;
    } else {
        var tmpCnt = tmpDetailCnt % 8;
        if (tmpCnt == 0) {
            returnVal = tmpCnt;
        } else if (tmpCnt <= 3) {
            returnVal = 3 - tmpCnt;
        } else {
            returnVal = 8 - tmpCnt;
        }
    }

    return returnVal;
}

function prefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}

function getStrLenSlice(value, fullAngleCount) {

    if (!value || !fullAngleCount) {
        return '';
    }

    var valueStr = String(value);

    var strLenSlice = value;
    var len = 0;

    for (var i = 0; i < valueStr.length; i++) {
        var y = valueStr.charCodeAt(i);

        if (y > 255) {
            len += 2;
        } else {
            len += 1;
        }
        if (len > (fullAngleCount * 2)) {
            strLenSlice = valueStr.slice(0, i);
            break;
        }

    }

    return strLenSlice;
}