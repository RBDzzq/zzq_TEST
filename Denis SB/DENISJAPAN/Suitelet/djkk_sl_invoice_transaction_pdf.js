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
	var entity = invoiceRecord.getFieldValue('entity');//ŒÚ‹q
	var customerSearch= nlapiSearchRecord("customer",null,
			[
				["internalid","anyof",entity]
			], 
			[
			 	new nlobjSearchColumn("address2","billingAddress",null), //¿‹æZŠ1
		    	new nlobjSearchColumn("address3","billingAddress",null), //¿‹æZŠ2
		    	new nlobjSearchColumn("city","billingAddress",null), //¿‹æs‹æ’¬‘º
		    	new nlobjSearchColumn("zipcode","billingAddress",null), //¿‹æ—X•Ö”Ô†
		    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //¿‹æ“s“¹•{Œ§ 		
		    	new nlobjSearchColumn("phone"), //“d˜b”Ô†
		    	new nlobjSearchColumn("fax"), //Fax
		    	new nlobjSearchColumn("entityid"), //id
		    	new nlobjSearchColumn("salesrep"), //”Ì”„ˆõi“–Ğ’S“–j
		    	// add by zzq start
//		    	new nlobjSearchColumn("language"),  //Œ¾Œê
		    	// add by zzq end
			]
			);	
	var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//ZŠ1
	var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//ZŠ2
	var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//s‹æ’¬‘º
	var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//—X•Ö”Ô†
	var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//“s“¹•{Œ§ 
	var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//“d˜b”Ô†
	var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
	var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
	var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//”Ì”„ˆõi“–Ğ’S“–j
	// add by zzq start
//	var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//Œ¾Œê
//	var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("language"));//ŒÚ‹qŒ¾Œê
	var custLanguage = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_language'));    //¿‹‘Œ¾Œê
	// add by zzq end
//	nlapiLogExecution('debug', 'custLanguage', custLanguage)

	var trandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //¿‹‘“ú•t
	var otherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //”­’‘”Ô†
	var delivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //¿‹‘”[•i“ú
	var tranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //¿‹‘”Ô†
	var createdfrom = defaultEmpty(invoiceRecord.getFieldText('createdfrom'));    //¿‹‘ì¬Œ³
	var payment = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_payment_conditions'));    //¿‹‘x•¥ğŒ
	var salesrep = defaultEmpty(invoiceRecord.getFieldText('salesrep'));    //‰c‹Æ’S“–Ò
	var memo = defaultEmpty(invoiceRecord.getFieldValue('memo'));    //memo
	
	var subsidiary = defaultEmpty(invoiceRecord.getFieldValue('subsidiary'));    //¿‹‘q‰ïĞ
	var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
			[
				["internalid","anyof",subsidiary]
			], 
			[
				new nlobjSearchColumn("legalname"),  //³®–¼Ì
				new nlobjSearchColumn("name"), //–¼‘O
				new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //–¼‘O‰pŒê
				new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //ZŠ‰pŒê
				new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //“s“¹•{Œ§
				new nlobjSearchColumn("address2","address",null), //ZŠ1
				new nlobjSearchColumn("address3","address",null), //ZŠ2
				new nlobjSearchColumn("city","address",null), //s‹æ’¬‘º
				new nlobjSearchColumn("zip","address",null), //—X•Ö”Ô†
				new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
				new nlobjSearchColumn("phone","address",null), //phone
			]
			);	
	var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//³®–¼Ì
	var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//–¼‘O
	var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//ZŠ1
	var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//ZŠ2
	var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//—X•Ö”Ô†
	var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//s‹æ’¬‘º
	var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//“s“¹•{Œ§
	var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//–¼‘O‰pŒê
	var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//ZŠ‰pŒê
	var invoiceFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax
	var invoicePhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","address",null));//phone
		
	var incoicedelivery_destination = invoiceRecord.getFieldValue('custbody_djkk_delivery_destination');    //¿‹‘”[•iæ
	if(!isEmpty(incoicedelivery_destination)){	
		
		var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
				[
					["internalid","anyof",incoicedelivery_destination]
				], 
				[
					new nlobjSearchColumn("custrecord_djkk_zip"),  //—X•Ö”Ô†
					new nlobjSearchColumn("custrecord_djkk_prefectures"),  //“s“¹•{Œ§
					new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_s‹æ’¬‘º
					new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_”[•iæZŠ1
					new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_”[•iæZŠ2
					new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_”[•iæ–¼‘O
						  
				]
				);	
		var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//—X•Ö”Ô†
		var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//“s“¹•{Œ§
		var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_s‹æ’¬‘º
		var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_”[•iæZŠ1
		var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_”[•iæZŠ2
		var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_”[•iæ–¼‘O
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
				  new nlobjSearchColumn("itemid"), //¤•iƒR[ƒh
				  new nlobjSearchColumn("displayname"), //¤•i–¼

				]
				); 
			
			var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//¤•iƒR[ƒh
			var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//¤•i–¼
			var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//”—Ê
			var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//’P‰¿
			var invoiceAmount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','amount',k)));//‹àŠz  
			if(!isEmpty(invoiceAmount)){
				var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');	
				invAmount  += invoiceAmount;
				var invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var invAmountFormat = '';
			}
			
			var invoiceTaxrate1Format = defaultEmpty(invoiceRecord.getLineItemValue('item','taxrate1',k));//Å—¦
			var invoiceTaxamount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','tax1amt',k)));//ÅŠz   
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
			
			var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//’PˆÊ
			itemLine.push({
				invoiceInitemid:invoiceInitemid,  //¤•iƒR[ƒh
				invoiceDisplayName:invoiceDisplayName,//¤•i–¼
				invoiceQuantity:invoiceQuantity,//”—Ê
				invoiceRateFormat:invoiceRateFormat,//’P‰¿
				invoiceAmount:invAmountFormat,//‹àŠz  
				invoiceTaxrate1Format:invoiceTaxrate1Format,//Å—¦
				invoiceTaxamount:invTaxamountFormat,//ÅŠz  
				invoiceUnitabbreviation:invoiceUnitabbreviation,
			}); 
	}


	// add by zzq start
//	if(custLanguage == '“ú–{Œê'){
	if(custLanguage == LANGUAGE_JP){
	// add by zzq end
		var dateName = '“ú\xa0\xa0•t';
		var deliveryName = '”[•i“ú';
		var paymentName = 'x•¥ğŒ';
		var numberName = '”Ô\xa0\xa0†';
		var numberName2 = 'ŒäĞ”­’”Ô†';
		var codeName = 'ƒR[ƒh';
		var invoiceName = '*\xa0\xa0\*\xa0\xa0\*¿\xa0\xa0\xa0\xa0\‹\xa0\xa0\xa0\xa0\‘*\xa0\xa0\*\xa0\xa0\*';
		var quantityName = '”\xa0\xa0\xa0\xa0\xa0\xa0\xa0—Ê';
		var unitpriceName = '’P\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0‰¿';
		var amountName = '‹à\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0Šz';
		var poductName = '•i\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\–¼';
		var taxRateName = '***\xa0\xa0\Å\xa0—¦:';
		var taxAmountName = 'ÅŠz:';
		var custCode = 'ŒÚ‹qƒR[ƒh\xa0\xa0:';
		var destinationName = '”[•iæ\xa0\xa0:';
		var totalName = '‡\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0Œv';
		var consumptionTaxName = 'Á\xa0\xa0”ï\xa0\xa0Å';
		var invoiceName1 = 'Œä¿‹Šz';
		var personName = '’S“–Ò\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
		var memoName = 'ƒ\xa0\xa0ƒ‚'
		var validterm='—LŒøŠúŒÀ';
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
		str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;§'+invdestinationZip+'</td>';
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
	'<td>§'+invoiceZipcode+'</td>'+
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
	'<td align="right" style="padding-right: 75px;padding-bottom:0px;margin-top:-8px;" colspan="2">Œä’†</td>'+
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
	'<td colspan="2" style="font-size: 10px;margin-top:-2px;">§'+invoiceAddressZip+'&nbsp;</td>'+
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
	if(payment=='‘O•¥‚¢'){
		// add by zzq start
//		if(custLanguage == '“ú–{Œê'){
		if(custLanguage == LANGUAGE_JP){
		// add by zzq end
			str+='<td style="width: 225px;margin-top:-8px;">&nbsp;&nbsp;'+validterm+':&nbsp;'+Monthadd(trandate,1)+'</td>';
		}else{
			str+='<td style="width: 225px;margin-top:-8px;">&nbsp;&nbsp;validterm:&nbsp;'+Monthadd(trandate,1)+'</td>';
		}
	}else if(payment=='‘ãˆø‚«'){
		str+='<td style="width: 225px;margin-top:-8px;"></td>';
	}
	str+=
	'<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+payment+'</td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+tranid+'/ó’&nbsp;:'+createdfrom+'</td>'+
	'<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+':'+otherrefnum+'<span style="text-align:right;padding-left:90px;">NBKKAS11</span></td>'+
//	'<td style="border:1px solid black;"></td>'
	'</tr>'+
	'<tr>'+
	'<td style="width: 225px;margin-top:-8px;">&nbsp;</td>';
	if(payment=='‘O•¥‚¢'){
		// add by zzq start
//		if(custLanguage == '“ú–{Œê'){
		if(custLanguage == LANGUAGE_JP){
		// add by zzq end
			str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">”[•iğŒ&nbsp;:ó’‚æ‚è2~3“úŒã‚É”[•i</td>';
		}else{
			str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">TermsOfDelivery&nbsp;:ó’‚æ‚è2~3“úŒã‚É”[•i</td>';
		}
		
	}else if(payment=='‘ãˆø‚«'){
		str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;"></td>';
	}
	str+=
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'<td style="width: 50px;margin-top:-8px;"></td>'+
	'</tr>'+
	'<tr>';
	// add by zzq start
//	if(custLanguage == '“ú–{Œê'){
	if(custLanguage == LANGUAGE_JP){
	// add by zzq end
		str+='<td style="width: 225px;margin-top:-8px;">”õl:'+memo+'</td>';
	}else{
		str+='<td style="width: 225px;margin-top:-8px;">Memo:'+memo+'</td>';
	}
	
	if(payment=='‘O•¥‚¢'){
		// add by zzq start
//		if(custLanguage == '“ú–{Œê'){
		if(custLanguage == LANGUAGE_JP){
		// add by zzq end
			str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">’S“–&nbsp;:'+salesrep+'</td>';
		}else{
			str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">Bear&nbsp;:'+salesrep+'</td>';
		}
		
	}else if(payment=='‘ãˆø‚«'){
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
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;&nbsp;PageF&nbsp;<pagenumber/></td>'+
//			'</tr>';
//		}else{
//			str+='<td style="width: 130px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 200px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 110px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;&nbsp;PageF&nbsp;<pagenumber/></td>'+
//			'</tr>';
//		}
	if(payment=='‘O•¥‚¢'){
		str+='<tr><td colspan="5">‚¨¢˜b‚É‚È‚Á‚Ä‚¨‚è‚Ü‚·B‚²”­’’¸‚«‚Ü‚µ‚½ŒA‚Ì‰º‹L‚Ì’Ê‚è‚²¿‹\‚µã‚°‚Ü‚·B<br/>‚²“ü‹àŠm”FŒã‚Ìo‰×‚Æ‚È‚è‚Ü‚·‚Ì‚ÅAw’èŒûÀ‚Ö‚¨U‚İ’¸‚¯‚Ü‚·—lA‚æ‚ë‚µ‚­‚¨Šè‚¢’v‚µ‚Ü‚·B</td></tr>';
	}else if(payment=='‘ãˆø‚«'){
		str+='<tr><td colspan="5">‰º‹L‚Ì‚Æ‚¨‚è”[•i’v‚µ‚Ü‚µ‚½‚Ì‚ÅA‚²¸û‰º‚³‚¢B</td></tr>';
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
//		if(custLanguage == '“ú–{Œê'){
		if(custLanguage == LANGUAGE_JP){
		// add by zzq end	
			str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
		}else{
			str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
		}
		str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceTaxamount+'</td>'+
		'</tr>';
		if(payment=='‘ãˆø‚«'){
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
//			if(custLanguage == '“ú–{Œê'){
			if(custLanguage == LANGUAGE_JP){
			// add by zzq end
				str+='<td width="250px">¦ŒyŒ¸Å—¦‘ÎÛ </td>'+
				'<td width="64px"></td>'+
				'<td width="132px">‡Œv</td>'+
				'<td>Á”ïÅ</td>'+
				'<td width="132px">Œä¿‹Šz</td>'+
				'</tr>';
			}else{
				str+='<td width="250px">¦TargetOfReducedTax </td>'+
				'<td width="64px"></td>'+
				'<td width="132px">Total</td>'+
				'<td>Tax</td>'+
				'<td width="132px">AmountRequested</td>'+
				'</tr>';
			}
			
			str+='<tr>'+
			'<td width="250px"></td>';
			// add by zzq start
//			if(custLanguage == '“ú–{Œê'){
			if(custLanguage == LANGUAGE_JP){
			// add by zzq end
				str+='<td width="64px">'+itemLine[i].invoiceTaxrate1Format+'‘ÎÛ:</td>';
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
//			'<td width="64px">10%‘ÎÛ:</td>'+
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
	var xlsFileo = nlapiCreateFile('‘O‹à¿‹‘PDF' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
	
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
	nlapiLogExecution('debug', 'ƒGƒ‰[', e.message)

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
 * •„†ˆ—
 * @param val
 * @returns {String}
 */
function dealFugou (value) {
    var reValue = '';
    reValue = value.replace(new RegExp('&','g'),'&amp;')
                   .replace(new RegExp('&amp;lt;','g'),'&lt;') // [&]‚ğ’u‚«Š·‚¦‚é‚ÆAŒ³XƒGƒXƒP[ƒvˆ—‚³‚ê‚Ä‚¢‚é[<]‚ª•Ï‰»‚·‚é‚½‚ßA–ß‚·
                   .replace(new RegExp('&amp;gt;','g'),'&gt;');
    return reValue;
}