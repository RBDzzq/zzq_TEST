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
function suitelet(request, response){
	
try{	
	var invAmount = 0;
	var invTaxamount = 0;
	var itemLine = new Array();
	var invoiceID = request.getParameter('invoiceid'); //ID
	var invoiceRecord = nlapiLoadRecord('invoice',invoiceID);
	var entity = invoiceRecord.getFieldValue('entity');//顧客
	var customerSearch= nlapiSearchRecord("customer",null,
			[
				["internalid","anyof",entity]
			], 
			[
			 	new nlobjSearchColumn("address2","billingAddress",null), //請求先住所1
		    	new nlobjSearchColumn("address3","billingAddress",null), //請求先住所2
		    	new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
		    	new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
		    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県 		
		    	new nlobjSearchColumn("phone"), //電話番号
		    	new nlobjSearchColumn("fax"), //Fax
		    	new nlobjSearchColumn("entityid"), //id
		    	new nlobjSearchColumn("salesrep"), //販売員（当社担当）
		    	// add by zzq start
//		    	new nlobjSearchColumn("language"),  //言語
		    	// add by zzq end
			]
			);	
	var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//住所1
	var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//住所2
	var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//市区町村
	var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//郵便番号
	var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//都道府県 
	var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//電話番号
	var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
	var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
	var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//販売員（当社担当）
	// add by zzq start
//	var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//言語
//	var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("language"));//顧客言語
	var custLanguage = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_language'));    //請求書言語
	// add by zzq end
//	nlapiLogExecution('debug', 'custLanguage', custLanguage)

	var trandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //請求書日付
	var otherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //発注書番号
	var delivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //請求書納品日
	var tranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //請求書番号
	var createdfrom = defaultEmpty(invoiceRecord.getFieldText('createdfrom'));    //請求書作成元
	var payment = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_payment_conditions'));    //請求書支払条件
	var salesrep = defaultEmpty(invoiceRecord.getFieldText('salesrep'));    //営業担当者
	var memo = defaultEmpty(invoiceRecord.getFieldValue('memo'));    //memo
	
	var subsidiary = defaultEmpty(invoiceRecord.getFieldValue('subsidiary'));    //請求書子会社
	var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
			[
				["internalid","anyof",subsidiary]
			], 
			[
				new nlobjSearchColumn("legalname"),  //正式名称
				new nlobjSearchColumn("name"), //名前
				new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
				new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
				new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
				new nlobjSearchColumn("address2","address",null), //住所1
				new nlobjSearchColumn("address3","address",null), //住所2
				new nlobjSearchColumn("city","address",null), //市区町村
				new nlobjSearchColumn("zip","address",null), //郵便番号
				new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
				new nlobjSearchColumn("phone","address",null), //phone
			]
			);	
	var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//正式名称
	var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//名前
	var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//住所1
	var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//住所2
	var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//郵便番号
	var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//市区町村
	var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
	var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
	var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//住所英語
	var invoiceFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax
	var invoicePhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","address",null));//phone
		
	var incoicedelivery_destination = invoiceRecord.getFieldValue('custbody_djkk_delivery_destination');    //請求書納品先
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
					new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_納品先名前
						  
				]
				);	
		var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//郵便番号
		var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//都道府県
		var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_市区町村
		var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_納品先住所1
		var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_納品先住所2
		var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_納品先名前
	}
	
	var invoiceCount = invoiceRecord.getLineItemCount('item');
	for(var k=1;k<invoiceCount+1;k++){
		invoiceRecord.selectLineItem('item',k);
		var invoiceItemId = invoiceRecord.getLineItemValue('item','item',k);	//item
		var invoiceItemSearch = nlapiSearchRecord("item",null,
				[
				 	["internalid","anyof",invoiceItemId],
				],
				[
				  new nlobjSearchColumn("itemid"), //商品コード
				  new nlobjSearchColumn("displayname"), //商品名

				]
				); 
			
			var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//商品コード
			var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
			var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//数量
			var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//単価
			var invoiceAmount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','amount',k)));//金額  
			if(!isEmpty(invoiceAmount)){
				var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');	
				invAmount  += invoiceAmount;
				var invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var invAmountFormat = '';
			}
			
			var invoiceTaxrate1Format = defaultEmpty(invoiceRecord.getLineItemValue('item','taxrate1',k));//税率
			var invoiceTaxamount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','tax1amt',k)));//税額   
			if(!isEmpty(invoiceTaxamount)){
				var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				invTaxamount += invoiceTaxamount;
				var invTaxmountTotal = invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var invTaxamountFormat = '';
			}
			nlapiLogExecution('error', 'invAmount', invAmount);
			nlapiLogExecution('error', 'invTaxamount', invTaxamount);
			var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
			if(!isEmpty(invoTotal)){
				var invoToTotal = invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var invoToTotal ='';
			}
			
			var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//単位
			itemLine.push({
				invoiceInitemid:invoiceInitemid,  //商品コード
				invoiceDisplayName:invoiceDisplayName,//商品名
				invoiceQuantity:invoiceQuantity,//数量
				invoiceRateFormat:invoiceRateFormat,//単価
				invoiceAmount:invAmountFormat,//金額  
				invoiceTaxrate1Format:invoiceTaxrate1Format,//税率
				invoiceTaxamount:invTaxamountFormat,//税額  
				invoiceUnitabbreviation:invoiceUnitabbreviation,
			}); 
	}


	// add by zzq start
//	if(custLanguage == '日本語'){
	if(custLanguage == LANGUAGE_JP){
	// add by zzq end
		var dateName = '日\xa0\xa0付';
		var deliveryName = '納品日';
		var paymentName = '支払条件';
		var numberName = '番\xa0\xa0号';
		var numberName2 = '御社発注番号';
		var codeName = 'コード';
		var invoiceName = '*\xa0\xa0\*\xa0\xa0\*請\xa0\xa0\xa0\xa0\求\xa0\xa0\xa0\xa0\書*\xa0\xa0\*\xa0\xa0\*';
		var quantityName = '数\xa0\xa0\xa0\xa0\xa0\xa0\xa0量';
		var unitpriceName = '単\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0価';
		var amountName = '金\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0額';
		var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\名';
		var taxRateName = '***\xa0\xa0\税\xa0率:';
		var taxAmountName = '税額:';
		var custCode = '顧客コード\xa0\xa0:';
		var destinationName = '納品先\xa0\xa0:';
		var totalName = '合\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0計';
		var consumptionTaxName = '消\xa0\xa0費\xa0\xa0税';
		var invoiceName1 = '御請求額';
		var personName = '担当者\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
		var memoName = 'メ\xa0\xa0モ'
		var validterm='有効期限';
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
	}
	
	
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
	
	'<macrolist>'+
	'<macro id="nlfooter">'+
	'<table style="border-top: 1px dashed black;width: 660px;font-weight: bold;">'+
	'<tr style="padding-top:5px;">'+
	'<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
	if(!isEmpty(incoicedelivery_Name)){
		str+='<td style="width:220px;">'+destinationName+'&nbsp;'+incoicedelivery_Name+'</td>';
	}else{
		str+='<td style="width:220px;">'+destinationName+'</td>';
	}
	str+='<td style="width:100px;">&nbsp;&nbsp;'+totalName+'</td>'+
	'<td style="width:100px;" align="right">'+invoAmountTotal+'</td>'+
	'</tr>'+
	
	'<tr>'+
	'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>';
	if(!isEmpty(invdestinationZip)){
		str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+invdestinationZip+'</td>';
	}
	str+='</tr>'+
	
	'<tr>'+
	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	if(!isEmpty(invdestinationState)){
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
	}else{
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	}
	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
	'<td style="width:100px;margin-top:-8px;" align="right">'+invTaxmountTotal+'</td>'+
	'</tr>'+
	
	'<tr>'+
	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
		str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationCity+invdestinationAddress+'</td>';
	}
	str+='</tr>'+
	
	'<tr>'+
	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	if(!isEmpty(invdestinationAddress2)){
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationAddress2+'</td>';
	}else{
		str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	}
	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'</td>'+
	'<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal+'</td>'+
	'</tr>'+
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
	
	str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4" footer="nlfooter" footer-height="8%">'+
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
	'<td>〒'+invoiceZipcode+'</td>'+
	'<td align="right" style="margin-right:-22px;">&nbsp;'+entityid+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invAddress+'</td>'+
	'<td align="right" style="padding-right: 30px;margin-top:-8px;">03</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="right" style="padding-right: 75px;padding-bottom:0px;margin-top:-8px;" colspan="2">御中</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Tel:'+invPhone+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Fax:'+invFax+'</td>'+
	'</tr>'+
	'<tr style="height: 40px;"></tr>'+
	'</table>'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	
	'<td style="padding-left: 30px;">'+
	'<table style="width: 280px;font-weight: bold;">'+
	'<tr>'+
//	'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" style="width:110px;height: 60px;" /></td>'+
	'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="margin-left:-32px;margin-top:-8px;">&nbsp;'+custSalesrep+'</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="font-size:17px;margin-top:-5px;" colspan="2">'+invoiceNameEng+'&nbsp;</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="font-size: 20px;margin-top:-2px;" colspan="2" >'+invoiceLegalname+'&nbsp;</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 10px;margin-top:-2px;">〒'+invoiceAddressZip+'&nbsp;</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+'&nbsp;</td>'+
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
	'<td style="line-height: 30px;font-weight:bold;border: 1px solid black;height: 30px;width:660px;" align="center" colspan="5">'+invoiceName+'</td>'+
	'</tr>'+
	'</table>'+	
	'<table style="width: 660px;font-weight: bold;">'+
	'<tr>'+
	'<td style="width:510px;margin-top:-5px;margin-left:-20px;" colspan="2">IN-0R000060jpn</td>'+
	'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;" align="right"></td>'+
	'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
	'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
	'</tr>'+	
	'<tr>'+
	'<td style="width: 225px;">&nbsp;&nbsp;'+dateName+':&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
	'<td style="width: 285px;margin-left:-25px;">'+deliveryName+'&nbsp;:&nbsp;&nbsp;'+delivery_date+'</td>'+
	'<td style="width: 50px;"></td>'+
	'<td style="width: 50px;"></td>'+
	'<td style="width: 50px;"></td>'+
	'</tr>'+
	'<tr>';
	if(payment=='前払い'){
		// add by zzq start
//		if(custLanguage == '日本語'){
		if(custLanguage == LANGUAGE_JP){
		// add by zzq end
			str+='<td style="width: 225px;margin-top:-8px;">&nbsp;&nbsp;'+validterm+':&nbsp;'+Monthadd(trandate,1)+'</td>';
		}else{
			str+='<td style="width: 225px;margin-top:-8px;">&nbsp;&nbsp;validterm:&nbsp;'+Monthadd(trandate,1)+'</td>';
		}
	}else if(payment=='代引き'){
		str+='<td style="width: 225px;margin-top:-8px;"></td>';
	}
	str+=
	'<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+payment+'</td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+tranid+'/受注&nbsp;:'+createdfrom+'</td>'+
	'<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+':'+otherrefnum+'<span style="text-align:right;padding-left:90px;">NBKKAS11</span></td>'+
//	'<td style="border:1px solid black;"></td>'
	'</tr>'+
	'<tr>'+
	'<td style="width: 225px;margin-top:-8px;">&nbsp;</td>';
	if(payment=='前払い'){
		// add by zzq start
//		if(custLanguage == '日本語'){
		if(custLanguage == LANGUAGE_JP){
		// add by zzq end
			str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">納品条件&nbsp;:受注より2~3日後に納品</td>';
		}else{
			str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">TermsOfDelivery&nbsp;:受注より2~3日後に納品</td>';
		}
		
	}else if(payment=='代引き'){
		str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;"></td>';
	}
	str+=
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'</tr>'+
	'<tr>';
	// add by zzq start
//	if(custLanguage == '日本語'){
	if(custLanguage == LANGUAGE_JP){
	// add by zzq end
		str+='<td style="width: 225px;margin-top:-8px;">備考:'+memo+'</td>';
	}else{
		str+='<td style="width: 225px;margin-top:-8px;">Memo:'+memo+'</td>';
	}
	
	if(payment=='前払い'){
		// add by zzq start
//		if(custLanguage == '日本語'){
		if(custLanguage == LANGUAGE_JP){
		// add by zzq end
			str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">担当&nbsp;:'+salesrep+'</td>';
		}else{
			str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">Bear&nbsp;:'+salesrep+'</td>';
		}
		
	}else if(payment=='代引き'){
		str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;"></td>';
	}
	str+=
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'</tr>'+
	'</table>'+
	
	'<table style="width: 660px;font-weight: bold;">';	
//	str+='<tr>';
//		if(!isEmpty(memo)){	
//			str+='<td style="width: 330px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+memo+'</td>'+
//			'<td style="width: 110px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
//			'</tr>';
//		}else{
//			str+='<td style="width: 130px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 200px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 110px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
//			'</tr>';
//		}
	if(payment=='前払い'){
		str+='<tr><td colspan="5">お世話になっております。ご発注頂きました件、の下記の通りご請求申し上げます。<br/>ご入金確認後の出荷となりますので、指定口座へお振込み頂けます様、よろしくお願い致します。</td></tr>';
	}else if(payment=='代引き'){
		str+='<tr><td colspan="5">下記のとおり納品致しましたので、ご査収下さい。</td></tr>';
	}
	str+='<tr height="10px"></tr>';
	str+='<tr  style="border-bottom: 1px dashed black;">'+
	'<td style="width: 130px;margin-top:-6px;">&nbsp;&nbsp;'+codeName+'</td>'+
	'<td style="width: 200px;margin-top:-6px;" align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+poductName+'</td>'+
	'<td style="width: 110px;margin-top:-6px;">&nbsp;&nbsp;'+quantityName+'</td>'+
	'<td style="width: 100px;margin-top:-6px;">&nbsp;&nbsp;'+unitpriceName+'</td>'+
	'<td style="width: 100px;margin-top:-6px;">&nbsp;&nbsp;'+amountName+'</td>'+
	'</tr>';
	for(var i = 0;i<itemLine.length;i++){
		str+='<tr>'+
		'<td style="width: 130px;">&nbsp;&nbsp;'+itemLine[i].invoiceInitemid+'</td>'+
		'<td style="width: 200px;">'+dealFugou(itemLine[i].invoiceDisplayName)+'</td>'+
		'<td style="width: 110px;" align="center">&nbsp;&nbsp;'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>'+
		'<td style="width: 100px;" align="right">'+itemLine[i].invoiceRateFormat+'</td>'+
		'<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceAmount+'</td>'+
		'</tr>'+
		
		'<tr>'+
		'<td style="width: 130px;">&nbsp;</td>'+
		'<td style="width: 200px;">&nbsp;</td>'+
		'<td style="width: 110px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'</td>';
		// add by zzq start
//		if(custLanguage == '日本語'){
		if(custLanguage == LANGUAGE_JP){
		// add by zzq end	
			str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
		}else{
			str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
		}
		str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceTaxamount+'</td>'+
		'</tr>';
		if(payment=='代引き'){
			str+='<tr>'+
			'<td colspan="5">'+
			'<table width="660px">'+
			'<tr>'+
			'<td width="180px"></td>'+
			'<td width="120px" style="border-bottom:1px solid black"></td>'+
			'<td width="132px" style="border-bottom:1px solid black"></td>'+
			'<td style="border-bottom:1px solid black"></td>'+
			'<td width="132px" style="border-bottom:1px solid black"></td>'+
			'</tr>'+
			'<tr>';
			// add by zzq start
//			if(custLanguage == '日本語'){
			if(custLanguage == LANGUAGE_JP){
			// add by zzq end
				str+='<td width="250px">※軽減税率対象 </td>'+
				'<td width="64px"></td>'+
				'<td width="132px">合計</td>'+
				'<td>消費税</td>'+
				'<td width="132px">御請求額</td>'+
				'</tr>';
			}else{
				str+='<td width="250px">※TargetOfReducedTax </td>'+
				'<td width="64px"></td>'+
				'<td width="132px">Total</td>'+
				'<td>Tax</td>'+
				'<td width="132px">AmountRequested</td>'+
				'</tr>';
			}
			
			str+='<tr>'+
			'<td width="250px"></td>';
			// add by zzq start
//			if(custLanguage == '日本語'){
			if(custLanguage == LANGUAGE_JP){
			// add by zzq end
				str+='<td width="64px">'+itemLine[i].invoiceTaxrate1Format+'対象:</td>';
			}else{
				str+='<td width="64px">'+itemLine[i].invoiceTaxrate1Format+'Object:</td>';
			}
			
			str+='<td width="132px">'+itemLine[i].invoiceAmount+'</td>'+
			'<td>'+itemLine[i].invoiceTaxamount+'</td>';
			var amount =(Number(replace(itemLine[i].invoiceAmount))+Number(replace(itemLine[i].invoiceTaxamount))).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			str+='<td width="132px">'+amount+'</td>'+
			'</tr>'+
//			'<tr>'+
//			'<td width="250px"></td>'+
//			'<td width="64px">10%対象:</td>'+
//			'<td width="132px"></td>'+
//			'<td></td>'+
//			'<td width="132px"></td>'+
//			'</tr>'+
			'</table>'+
			'</td>'+
			'</tr>';
		}
	}
	
	
	str+='</table>';
	str+='</body>';

	str += '</pdf>';
	var renderer = nlapiCreateTemplateRenderer();
	renderer.setTemplate(str);
	var xml = renderer.renderToString();
	
	// test
	var xlsFileo = nlapiCreateFile('前金請求書PDF' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
	
	xlsFileo.setFolder(109338);
	nlapiSubmitFile(xlsFileo);
	
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
catch(e){
	nlapiLogExecution('debug', 'エラー', e.message)

}

}
function defaultEmpty(src){
	return src || '';
}
function Monthadd(Nowdate,num){
		  var date = nlapiStringToDate(Nowdate);
		  date.setMonth(date.getMonth() + num);
		  var month = date.getMonth() + 1 ;
		  if(month<10){
			  month = '0'+month;
		  }
		  var day = date.getDate();
		  if(day<10){
			  day = '0'+day;
		  }
		  return date.getFullYear() + '/' + month + '/' + day;
	}
function replace(text)
{
if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/,/g, "") ;

return text ;
}
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