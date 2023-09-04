/**
 * DJ_íçï∂èë èCóùïi pdf
 *
 * Version    Date            Author           Remarks
 * 1.00       2021/12/21     CPC_A
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
    var soId=request.getParameter('so');
    var pdfType=request.getParameter('pdfType');
//	êøãÅèë: invoice
//	î[ïièë: delivery
//	éÛóÃèë: receipt
    nlapiLogExecution('debug', 'so id:' + soId);
    nlapiLogExecution('debug', 'pdfType:' + pdfType);
    //CH762 20230818 add by zdj start
//    var typeName = pdfType == 'invoice' ? 'êøãÅèë' : (pdfType == 'delivery' ? 'î[ïièë' : 'éÛóÃèë');
    var typeName = pdfType == 'invoice' ? 'êøãÅèë' : (pdfType == 'delivery' ? 'î[ïièë' : 'î[ïiéÛóÃèë');
    //CH762 20230818 add by zdj start
    var salesorder=nlapiLoadRecord('salesorder', soId);
    nlapiLogExecution('debug', 'soRecord:'+salesorder);

    //CH762 20230818 add by zdj start
    var transactionPDF = defaultEmpty(salesorder.getFieldValue('transactionnumber'));       //PDFóp
    //CH762 20230818 add by zdj end
    
    //DJ_òAåã
    var subsidiary = salesorder.getFieldValue('subsidiary');
    var subsidiaryAddress= nlapiSearchRecord("subsidiary",null,
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
            new nlobjSearchColumn("url"),
            new nlobjSearchColumn("custrecord_djkk_bank_1"),
            new nlobjSearchColumn("custrecord_djkk_bank_2")
        ]
    );
    var bankInfo = [];
    var bank1 = isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_bank_1");
    var bank2 = isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_bank_2");
    if(bank1){
        bank1 = nlapiLoadRecord('customrecord_djkk_bank', bank1);
        bankInfo.push({
            bankName: defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name')),
            branchName: defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name')),
            bankType: defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_type')),
            bankNo: defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'))
        })
    }
    if(bank2){
        bank2 = nlapiLoadRecord('customrecord_djkk_bank', bank2);
        bankInfo.push({
            bankName: defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name')),
            branchName: defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name')),
            bankType: defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_type')),
            bankNo: defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'))
        })            
    }




    var subsidiary1 = defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("legalname"));
    var subsidiary2 = defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_bank_1"));
    var subsidiaryType= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_subsidiary_type"));
    nlapiLogExecution('debug', 'subsidiaryType:'+subsidiaryType);
    //òAåãèZèäÇÃTEL
    var subsidiaryZip = defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("zip","address",null));

    if(subsidiaryZip && subsidiaryZip.substring(0,1) != 'Åß'){
        subsidiaryZip = 'Åß' + subsidiaryZip;
    }
    var subsidiaryTel = defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("phone","address",null));
    if(subsidiaryTel){
        subsidiaryTel = 'TEL: ' + subsidiaryTel;
    }
    var subsidiaryFax= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_address_fax","address",null));
    if(subsidiaryFax){
        subsidiaryFax = 'FAX: ' + subsidiaryFax;
    }
    var subsidiaryMail= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_mail","address",null));
    if(subsidiaryMail){
        subsidiaryMail = 'email: ' + subsidiaryMail;
    }
    var subsidiaryState= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_address_state","address",null));
    var subsidiaryCity= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("city","address",null));
    var subsidiaryAddr1= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("address1","address",null));
    var subsidiaryAddr2= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("address2","address",null));
    var subsidiaryAddr3= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("address3","address",null));
    var subsidiaryName= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("legalname"));
    var subsidiaryDisplayName= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("name"));
    var subsidiaryUrl= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("url"));

    //ì˙ït
    var trandate = formatDate(nlapiStringToDate(salesorder.getFieldValue('trandate')));
//		î‘çÜ
    var tranid = salesorder.getFieldValue('tranid');
    //î[ïiì˙
    var delivery_date = formatDate(nlapiStringToDate(salesorder.getFieldValue('custbody_djkk_delivery_date')));
    //éxï•èåè
    var payment_conditions = salesorder.getFieldValue('custbody_djkk_payment_conditions')||'';
	if(payment_conditions) {
		var payCond = nlapiLoadRecord('customlist_djkk_payment_conditions', payment_conditions);//éxï•èåè
		payment_conditions = payCond.getFieldValue('name');
	}	
    //î≠íçèëî‘çÜ
    var otherrefnum = salesorder.getFieldValue('otherrefnum')||'';

    //å⁄ãq
    var entity = salesorder.getFieldValue('entity');
    
    var customAddress = nlapiSearchRecord("customer",null,
			[
				["internalid","anyof", entity]
			],
			[
				new nlobjSearchColumn("altname"),
				new nlobjSearchColumn("altphone"),
				new nlobjSearchColumn("fax"),
				new nlobjSearchColumn("zipcode","Address",null),
				new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),
				new nlobjSearchColumn("address1","Address",null),
				new nlobjSearchColumn("address2","Address",null),
				new nlobjSearchColumn("addressee","Address",null)
			]
		);
    var cust_name = isEmpty(customAddress) ? '' :  customAddress[0].getValue("altname");
	//å⁄ãqóXï÷
    var cust_zipcode = isEmpty(customAddress) ? '' :  customAddress[0].getValue("zipcode","Address",null);
	if(cust_zipcode && cust_zipcode.substring(0,1) != 'Åß'){
		cust_zipcode = 'Åß' + cust_zipcode;
	}else{
		cust_zipcode = '';
	}
	//ìsìπï{åß
	var cust_state = isEmpty(customAddress) ? '' :  customAddress[0].getValue("custrecord_djkk_address_state","Address",null);
	//å⁄ãqèZèäÇP
	var cust_addr1 = isEmpty(customAddress) ? '' :  customAddress[0].getValue("address1","Address",null);
	//å⁄ãqèZèäÇQ
	var cust_addr2 = isEmpty(customAddress) ? '' :  customAddress[0].getValue("address2","Address",null);
	//å⁄ãqà∂êÊ
	var cust_addressee = isEmpty(customAddress) ? '' :  customAddress[0].getValue("addressee","Address",null);
    var cust_tel = 'TEL: ' + defaultEmpty(isEmpty(customAddress) ? '' :  customAddress[0].getValue("altphone"));
    var cust_fax = 'FAX: '+ defaultEmpty(isEmpty(customAddress) ? '' :  customAddress[0].getValue("fax"));

    
    
    var shipping_zipcode = ''
    var shipping_state = ''
    var shipping_city = ''
    var shipping_addr = ''
    var shipping_name = ''
    	
    var deliveryId = salesorder.getFieldValue('custbody_djkk_delivery_destination');
    if(deliveryId){
        var deliverObj=nlapiLoadRecord('customrecord_djkk_delivery_destination', deliveryId);
        shipping_name = deliverObj.getFieldValue('name')||'';
        shipping_zipcode = deliverObj.getFieldValue('custrecord_djkk_zip')||'';
        if(shipping_zipcode && shipping_zipcode.substring(0,1) != 'Åß'){
        	shipping_zipcode = 'Åß' + shipping_zipcode;
        }
        shipping_state = deliverObj.getFieldValue('custrecord_djkk_prefectures')||'';
        shipping_city = deliverObj.getFieldValue('custrecord_djkk_municipalities')||'';
        shipping_addr = (deliverObj.getFieldValue('custrecord_djkk_delivery_residence') || '')+(deliverObj.getFieldValue('custrecord_djkk_delivery_residence2') || '')
    }
    
    
    
    var itemCode =  ''
    var itemName = ''
    var repairId = salesorder.getFieldValue('custbody_djkk_estimate_re');
    var repairRecord=nlapiLoadRecord('customrecord_djkk_repair', repairId);
    var repairNo = repairRecord.getFieldValue('name'); // èCóùïi.ÉVÉäÉAÉã
    var repairItemId = repairRecord.getFieldValue('custrecord_djkk_re_item'); 

    if(repairItemId){
        var requestItemSearch = nlapiSearchRecord("item",null,
                [
                    ["internalid","anyof", repairItemId]
                ], 
                [
                    new nlobjSearchColumn("itemid"),//ÉAÉCÉeÉÄÉRÅ[Éh
                    new nlobjSearchColumn("displayname"),//ÉAÉCÉeÉÄñº
                ]
                );
        if(!isEmpty(requestItemSearch)){
            itemCode = requestItemSearch[0].getValue('itemid');
            itemName = requestItemSearch[0].getValue('displayname');
        }
    }
    
    
    //so detail
    var sublistCount = salesorder.getLineItemCount('item');
	var itemIdArray = [];
	var itemIdMap = {};
	var itemDetails = [];
	var amountTotal = 0;
	var taxTotal = 0;
	var taxType = {};
	var taxTypeArray = [];
	var receiptRowSpan = 3;
	nlapiLogExecution('debug', 'sublistCount', sublistCount);
	for(var s = 1; s < sublistCount; s ++){
		nlapiLogExecution('debug', 'var s', s);
		salesorder.selectLineItem('item',s);
		receiptRowSpan ++;
		var item = salesorder.getLineItemValue('item', 'item', s);//tem id
        var itemName =salesorder.getLineItemValue('item', 'item_display', s);//name
		var amount = parseFloat(salesorder.getLineItemValue('item', 'amount', s));//amount
		var taxRate = salesorder.getLineItemValue('item', 'taxrate1', s);//ê≈ó¶
		var taxAmount = parseFloat(salesorder.getLineItemValue('item', 'tax1amt', s));//tax
		var quantity = parseFloat(salesorder.getLineItemValue('item', 'quantity', s));//num
        var itemUnit=salesorder.getLineItemValue('item', 'units_display', s);//unit
		var rate = salesorder.getLineItemValue('item', 'rate', s);//íPâø
		amountTotal += amount;
		taxTotal += taxAmount;
		var taxRateData = taxType[taxRate] || 0;
		taxType[taxRate] = taxRateData + taxAmount;
		if(taxTypeArray.indexOf(taxRate) < 0){
			taxTypeArray.push(taxRate);
		}
		itemIdArray.push(item);
		
		var inventoryRecordList = []

		var inventoryRecord = ''
		
        var inventoryDetail=salesorder.editCurrentLineItemSubrecord('item','inventorydetail');
        nlapiLogExecution('debug', 'inventoryDetailaaa', inventoryDetail);
        
        
//	        var temp = {}
////            inventoryDetail.selectLineItem('inventoryassignment',1);
//            var issueinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');
//            var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');
//            temp.issueinventorynumber = issueinventorynumber
//            temp.expirationdate = expirationdate
//            inventoryRecordList.push(temp)
        if(inventoryDetail){
	        var inventoryCount = inventoryDetail.getLineItemCount('inventoryassignment');
	        for(var c = 1; c <= inventoryCount; c ++){
	        	receiptRowSpan ++;
	        	var temp = {}
	            inventoryDetail.selectLineItem('inventoryassignment',c);
	            var issueinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');
	            var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');
	            if(issueinventorynumber) {
	                issueinventorynumber = nlapiLoadRecord('inventorynumber', issueinventorynumber);
	                issueinventorynumber = issueinventorynumber.getFieldValue('inventorynumber');
	            }
	            temp.issueinventorynumber = issueinventorynumber
                temp.expirationdate = formatDate(nlapiStringToDate(expirationdate))
                inventoryRecordList.push(temp)
	        }            	
        }

		itemDetails.push({
			item: item,
			itemName: itemName,
			itemUnit: itemUnit,
			amount: amount,
			taxRate: taxRate,
			taxAmount: taxAmount,
			quantity: quantity,
			rate: rate,
			inventoryRecordList:inventoryRecordList
		});
	}
	
	if(itemIdArray.length){
		nlapiLogExecution('debug', 'itemIdArray', itemIdArray);
		var itemSearch = nlapiSearchRecord("item",null,
				[
				   ["internalid","anyof", itemIdArray]
				], 
				[
				   new nlobjSearchColumn("internalid"),
				   new nlobjSearchColumn("itemid")
				]
				);
		if(!isEmpty(itemSearch)){
			for(var s=0;s<itemSearch.length;s++){
				var internalid= itemSearch[s].getValue('internalid');
				var itemid= itemSearch[s].getValue('itemid');
				itemIdMap[internalid] = itemid;
				nlapiLogExecution('debug', 'item-' + internalid, itemid);
			}
		}
		for( var n = 0; n < itemDetails.length; n ++){
			var internalid = itemDetails[n].item;
			if(internalid){
				itemDetails[n].item = itemIdMap[internalid];
			}
		}
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
        '</#if>'+
        '    <style type="text/css">* {'+
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
        'table {font-size: 9pt;width:100%;border-collapse:collapse}'
        +'.table-noborder td{ border: 0px}'
        +'.detail-table td{ height: 25px; vertical-align: middle;}'
        +'.tax-table td{ height: 25px; vertical-align: middle;}'
        +'.main-table td{ border-right: 0px; border-bottom: 0px;}'
        +'.request-table td{ width: 110px; border-right: 0px; border-bottom: 0px;}'
        +'.border-right{ border-right: 1px solid!important;}'
        +'.width-col td{ border: 0px !important;height: 0px !important;}'
        +'.title-color{ color: #8293d2}'
        +'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'
        +'td { vertical-align: top;height: 18px; border: 1px solid lightgrey; padding-top: 0px; border-collapse:collapse}'
        +'b { font-weight: bold; color: #333333; }'
        +'.bottom-line-2px {border-bottom: 3px solid black; vertical-align: middle;}'
        +'.border-tb-dash {border-top: 1px dashed black; border-bottom: 1px dashed black;}'
        +'.border-top-dot {border-top: 1px dotted black;}'
        +'.tableBorder td { vertical-align: top;height: 20px; border: 1px solid lightgrey; padding-top: 0px; border-collapse:collapse;line-height: 26px;}'
        +'</style>'+
        '</head>'+
        '<body padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';

    str += '<table border="0" class="table-noborder" style="width: 660px;" cellspacing="0" cellpadding="0">'
        +'<tr class="width-col"><td style="width: 55px;"></td><td style="width: 55px;"></td><td style="width: 55px;"></td><td style="width: 55px;"></td><td style="width: 55px;"></td><td style="width: 55px;"></td><td style="width: 55px;"></td><td style="width: 55px;"></td><td style="width: 55px;"></td><td style="width: 55px;"></td><td style="width: 55px;"></td><td style="width: 55px;"></td></tr>'
        +'<tr>'
        +'<td colspan="6" style="height: 40px;"></td>'
        +'<td colspan="6" rowspan="2">'
        +'<table border="1" cellpadding="0">'
        +'<tr><td rowspan="3" style="width: 10px;"></td><td rowspan="3" style="height: 50px;font-size: 24px;vertical-align: middle;"><strong>'+subsidiary1+'</strong></td><td style="height: 5px;">&nbsp;</td><td style="width: 5px;">&nbsp;</td></tr>'
//        +'<tr><td style="width: 80px;vertical-align:middle;padding-right: 10px;" align="right"><img style="width: 60px;height: 30px;" src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" alt=""/></td><td style="width: 5px;">&nbsp;</td></tr>'
        +'<tr><td style="width: 80px;vertical-align:middle;padding-right: 10px;" align="right"><img style="width: 60px;height: 30px;" src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" alt=""/></td><td style="width: 5px;">&nbsp;</td></tr>'
        +'<tr><td style="height: 5px;">&nbsp;</td><td>&nbsp;</td></tr>'
        +'<tr><td></td><td colspan="3" style="vertical-align: bottom;font-size: 18px;"><strong>'+subsidiary1+'</strong></td></tr>'
        +'<tr><td></td><td colspan="3" style="vertical-align: top;padding-left: 10px;">' + subsidiaryZip + '&nbsp;' + subsidiaryState + subsidiaryCity + subsidiaryAddr1 + '&nbsp;&nbsp;' + subsidiaryAddr2 + '&nbsp;&nbsp;' + subsidiaryAddr3 + '</td></tr>'
        +'<tr><td></td><td colspan="3" style="height: 16px;padding-left: 10px;">éÊà¯ã‚çs</td></tr>';
    if(bank1){
    	str += '<tr><td></td><td colspan="3" style="height: 16px;">&nbsp;&nbsp;'+bankInfo[0].bankName+'&nbsp;&nbsp;'+bankInfo[0].branchName+'&nbsp;&nbsp;'+bankInfo[0].bankType+'&nbsp;&nbsp;'+bankInfo[0].bankNo+'</td></tr>';
    }
    if(bank2){
    	str += '<tr><td></td><td colspan="3" style="height: 16px;">&nbsp;&nbsp;'+bankInfo[1].bankName+'&nbsp;'+bankInfo[1].branchName+'&nbsp;&nbsp;'+bankInfo[1].bankType+'&nbsp;&nbsp;'+bankInfo[1].bankNo+'</td></tr>';	
    }
       str +='</table>'
        +'</td>'
        +'</tr>'
        +'<tr>'
        +'<td colspan="6">'
        +'<table border="0">'
        +'<tr class="width-col"><td style="width: 33px;"></td><td style="width: 33px;"></td><td style="width: 33px;"></td><td style="width: 33px;"></td><td style="width: 33px;"></td><td style="width: 33px;"></td><td style="width: 33px;"></td><td style="width: 33px;"></td><td style="width: 33px;"></td><td style="width: 33px;"></td></tr>'
        +'<tr><td align="right"></td><td colspan="9">'+cust_zipcode+'</td></tr>'
        +'<tr><td align="right"></td><td colspan="9"></td>'+cust_state+'</tr>'
        +'<tr><td align="right"></td><td colspan="9">'+cust_addr1 + cust_addr2+'</td></tr>'
        +'<tr><td align="right"></td><td colspan="9"></td></tr>'
        +'<tr><td align="right"></td><td colspan="9">'+cust_addressee+'</td></tr>'
        +'<tr><td colspan="8"></td><td align="right">å‰íÜ</td><td></td></tr>'
        +'<tr><td align="right"></td><td colspan="8">'+cust_tel+'</td></tr>'
        +'<tr><td align="right"></td><td colspan="9">'+cust_fax+'</td></tr>'
        +'</table>'
        +'</td>'
        +'</tr>'
        +'<tr><td style="height: 10px;"></td></tr>'
        +'<tr>'
        +'<td></td>'
        +'<td colspan="3" style="vertical-align: middle;font-size: 24px;"><strong>' + (pdfType == 'invoice' ? 'êø ãÅ èë' : (pdfType == 'delivery' ? 'î[ ïi èë' : 'ï® ïi éÛ óÃ èë')) +'</strong></td>'
        +'<td colspan="2"></td>'
        +'<td colspan="3" style="vertical-align: middle;">â∫ãLÇÃí ÇËî[ïiívÇµÇ‹Ç∑ÅB</td>'
        +'<td style="border: 1px solid #ddd;width: 55px;height: 55px;"></td>'
        +'<td style="border: 1px solid #ddd;width: 55px;height: 55px;border-left: none;"></td>'
        +'<td style="border: 1px solid #ddd;width: 55px;height: 55px;border-left: none;"></td>'
        +'</tr>'
        +'<tr><td style="height: 10px;"></td></tr>'
        +'<tr>'
        +'<td colspan="12">'
        +'<table border="2" style="width: 660px;">'
        +'<tr><td align="center" style="vertical-align: middle;height: 26px;width: 80px;border-bottom: 1px solid #999;border-right: 1px solid #999;color: #fff;background-color: #000;">ì˙&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ït</td><td style="vertical-align: middle;height: 26px;width: 165px;border-bottom: 1px solid #999;border-right: 1px solid #999;">'+trandate+'</td><td style="height: 26px;line-height: 16px;vertical-align: top;padding-left: 10px;" rowspan="1">î[ïiì˙ÅF'+delivery_date+'</td></tr>'
        +'<tr><td align="center" style="vertical-align: middle;height: 26px;border-right: 1px solid #999;color: #fff;background-color: #000;">î‘&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;çÜ</td><td style="vertical-align: middle;height: 26px;border-right: 1px solid #999;">'+tranid+'</td><td style="height: 26px;line-height: 16px;vertical-align: bottom;padding-left: 10px;" rowspan="1">éxï•èåèÅF'+payment_conditions+'<br/>î≠íçèëî‘çÜ:'+otherrefnum+'</td></tr>'
        +'</table>'
        +'</td>'
        +'</tr>'
        +'<tr><td style="height: 10px;"></td></tr>'
        +'<tr>'
        +'<td colspan="12">'
        +'<table class="detail-table" border="2" style="width: 660px;">'
        +'<tr><td align="center" style="width: 100px;border-right: 1px solid #999;color: #fff;background-color: #000;">ÉR&nbsp;&nbsp;Å[&nbsp;&nbsp;Éh</td> <td align="center" style="width: 250px;border-right: 1px solid #999;color: #fff;background-color: #000;">ïi&nbsp;&nbsp;&nbsp;&nbsp;ñº</td> <td align="center" style="width: 80px;border-right: 1px solid #999;color: #fff;background-color: #000;">êî&nbsp;&nbsp;&nbsp;&nbsp;ó </td>';
       if(pdfType != 'receipt') {
    	   str += '<td align="center" style="width: 80px;border-right: 1px solid #999;color: #fff;background-color: #000;">íP&nbsp;&nbsp;&nbsp;&nbsp;âø</td> <td align="center" style="width: 120px;border-right: 1px solid #999;color: #fff;background-color: #000;">ã‡&nbsp;&nbsp;&nbsp;&nbsp;äz</td> <td style="width: 30px;border-right: 0;color: #fff;background-color: #000;font-size: 13px;" align="center">éÊàµ<br/>ãÊï™</td>';
       }else {
    	   str += '<td style="width: 130px;border-right: 0;color: #fff;background-color: #000;font-size: 13px;" align="center">éÛ&nbsp;&nbsp;&nbsp;&nbsp;óÃ&nbsp;&nbsp;&nbsp;&nbsp;àÛ</td>';
       }
       str += '</tr>'
        +'<tr>'
        +'<td style="border-right: 1px solid #ddd;">'+itemCode+'</td>'
        +'<td style="border-right: 1px solid #ddd;">'+itemName+'</td>'
        +'<td style="border-right: 1px solid #ddd;" align="right">1</td>';
       if(pdfType != 'receipt') {
    	   str += '<td style="border-right: 1px solid #ddd;" align="right">0</td>'
    		   +'<td style="border-right: 1px solid #ddd;" align="right">0</td><td style="border-right: 0;"></td>';
       }else{
    	   str += '<td rowspan="' + receiptRowSpan + '" style="border-right: 0;vertical-align: middle;">';
    	   str += '<table border="0" style="width: 100%;" cellspacing="0" cellpadding="0">'
    		   + '<tr><td align="center" style="height: 40px;vertical-align:middle;">îN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;åé&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ì˙</td></tr>'
    		   + '<tr><td align="right" style="height: 40px;vertical-align:middle;"><span style="border: 1px solid; padding: 2px;text-align: center;vertical-align:middle;" corner-radius="20%">àÛ</span></td></tr>'
    		   + '<tr><td align="center" style="height: 40px;vertical-align:middle;">éÛóÃÇ¢ÇΩÇµÇ‹ÇµÇΩÅB</td></tr>';
    	   str += '</table></td>';   
       }
        
        str += '</tr>'
        +'<tr>'
        +'<td style="border-right: 1px solid #ddd;">Repair</td>'
        +'<td style="border-right: 1px solid #ddd;">'+repairNo+'</td>'
     // +'<td style="border-right: 1px solid #ddd;">99-99-99</td>';
        +'<td style="border-right: 1px solid #ddd;"> </td>';//new 
        
        if(pdfType != 'receipt') {
	        str += '<td style="border-right: 1px solid #ddd;"></td>'
	        +'<td style="border-right: 1px solid #ddd;"></td>'
	        +'<td style="border-right:0;"></td>';
        }
        str += '</tr>';

	for(var s = 0; s < itemDetails.length; s ++){
		str += '<tr><td style="border-right: 1px solid #ddd;">'+itemDetails[s].item+'</td><td style="border-right: 1px solid #ddd;">'+itemDetails[s].itemName+'</td><td style="border-right: 1px solid #ddd;" align="right">'+itemDetails[s].quantity + '&nbsp;&nbsp;' + itemUnit +'</td>';
		if(pdfType != 'receipt') {
			str += '<td style="border-right: 1px solid #ddd;" align="right">${' + itemDetails[s].rate + '?string[",##0;; roundingMode=halfUp"]}</td><td style="border-right: 1px solid #ddd;" align="right">${' + itemDetails[s].amount + '?string[",##0;; roundingMode=halfUp"]}</td><td style="border-right: 0;"></td>';
		}
		str += '</tr>';
		for(var i = 0; i < itemDetails[s].inventoryRecordList.length; i ++){
			str += '<tr><td style="border-right: 1px solid #ddd;"></td><td style="border-right: 1px solid #ddd;">'+itemDetails[s].inventoryRecordList[i].issueinventorynumber+'</td><td style="border-right: 1px solid #ddd;">'+itemDetails[s].inventoryRecordList[i].expirationdate+'</td>';
			if(pdfType != 'receipt') {
				str += '<td style="border-right: 1px solid #ddd;"></td><td style="border-right: 1px solid #ddd;"></td><td style="border-right:0;"></td>';				
			}
			str += '</tr>';
		}
		
	}
	if(pdfType != 'receipt') {
		for(var s = 0; s < taxTypeArray.length; s ++){
			str += '<tr><td style="border-right: 1px solid #ddd;">'+'</td><td style="border-right: 1px solid #ddd;">'+'</td><td style="border-right: 1px solid #ddd;" align="right">ê≈ó¶:'+'</td><td style="border-right: 1px solid #ddd;" align="right">'+taxTypeArray[s]+'</td><td style="border-right: 1px solid #ddd;" align="right">ê≈äz:${' + taxType[taxTypeArray[s]] + '?string[",##0;; roundingMode=halfUp"]}</td><td style="border-right: ;"></td></tr>'
		}
	}
        str += '<tr>'
        +'<td style="border-right: 1px solid #ddd;height: 100px;border-bottom: 1px solid #ddd;"></td>'
        +'<td style="border-right: 1px solid #ddd;height: 100px;border-bottom: 1px solid #ddd;"></td>'
        +'<td style="border-right: 1px solid #ddd;height: 100px;border-bottom: 1px solid #ddd;"></td>';
        if(pdfType != 'receipt') {
	        str +='<td style="border-right: 1px solid #ddd;height: 100px;border-bottom: 1px solid #ddd;"></td>'
	        +'<td style="border-right: 1px solid #ddd;height: 100px;border-bottom: 1px solid #ddd;"></td>'
	        +'<td style="border-right: 0;height: 100px;border-bottom: 1px solid #ddd;"></td>';
        }
        str += '</tr>';
        if(pdfType != 'receipt') {
        	//str += '<tr><td colspan="6">ÅyéÊàµãÊï™ÅzÅ@ï€ó‚ïi=C,ó‚ìÄïi=Åi-20ÅéÅ™=F1ÅA-21ÅéÅ´=F2Åj,ì≈ï®=D,åÄï®=G</td></tr>';
        	str += '<tr><td colspan="6"></td></tr>';
        }
        str += '</table>'
        +'</td>'
        +'</tr>'
        +'<tr>'
        +'<td colspan="5">' + (pdfType == 'invoice' ? 'Ç®êUçûéËêîóøÇÕÇ®ãqólÇ≤ïâíSÇ≈Ç®äËÇ¢ê\Çµè„Ç∞Ç‹Ç∑ÅB' : '') + '</td>'
        +'<td colspan="3" style="width: 165px;"></td>'
        +'<td colspan="4" rowspan="2">';
        if(pdfType != 'receipt'){
	        str += '<table class="tax-table" border="2" style="width: 213px;margin: 0;border-top: none">'
	        +'<tr><td align="center" style="vertical-align: middle;width: 60px;border-bottom: 1px solid #999;border-right: 1px solid #999;color: #fff;background-color: #000;">çá&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;åv</td><td style="width: 30px;border-bottom: 1px solid #999;border-right: 1px solid #999;"></td><td style="width: 125px;border-bottom: 1px solid #999;" align="right">${' + amountTotal + '?string[",##0;; roundingMode=halfUp"]}</td></tr>'
	        +'<tr><td align="center" style="vertical-align: middle;border-right: 1px solid #999;border-bottom: 1px solid #999;color: #fff;background-color: #000;">è¡&nbsp;&nbsp;îÔ&nbsp;&nbsp;ê≈</td><td style="border-right: 1px solid #999;border-bottom: 1px solid #999;"></td><td style="border-bottom: 1px solid #999;border-bottom: 1px solid #999;" align="right">${' + taxTotal + '?string[",##0;; roundingMode=halfUp"]}</td></tr>'
	        +'<tr><td align="center" style="vertical-align: middle;border-right: 1px solid #999;color: #fff;background-color: #000;">å‰êøãÅäz</td><td style="border-right: 1px solid #999;"></td><td style="border-bottom: 1px solid #999;" align="right">${' + (amountTotal+taxTotal) + '?string[",##0;; roundingMode=halfUp"]}</td></tr>'
	        +'</table>';
        }
        str +='</td>'
        +'</tr>'
        +'<tr>'
        +'<td colspan="5">'
        +'<table style="width: 275px;">'
        +'<tr><td style="width: 75px;" align="right">Ç®ìÕêÊ:</td><td style="width: 200px;">&nbsp;&nbsp;'+cust_name+'</td></tr>'
        +'<tr><td></td><td>&nbsp;&nbsp;'+shipping_name+'&nbsp;&nbsp;&nbsp;&nbsp;ól</td></tr>'
        +'<tr><td></td><td>&nbsp;&nbsp;Åß'+shipping_zipcode+'&nbsp;&nbsp;'+shipping_state+'</td></tr>'
        +'<tr><td></td><td>&nbsp;&nbsp;'+shipping_addr+'</td></tr>'
        +'</table>'
        +'</td>'
        +'</tr>'
        +'</table>'

    str += '</body>'+
        '</pdf>';

    var renderer = nlapiCreateTemplateRenderer();
    renderer.setTemplate(str);
    var xml = renderer.renderToString();
    var xlsFile = nlapiXMLToPDF(xml);

    // PDFÉtÉ@ÉCÉãñºÇê›íËÇ∑ÇÈ
  //CH762 20230818 add by zdj start
//    xlsFile.setName(typeName + 'PDFèoóÕ' + '_' + getFormatYmdHms() + '.pdf');
    if(pdfType == 'invoice'){
        xlsFile.setName(typeName + '_' + transactionPDF + '_' + getDateYymmddFileName() + '.pdf');
        xlsFile.setFolder(INVOICE_PDF_MAIL_DJ_INVOICEPDF);
    }else if(pdfType == 'delivery'){
        xlsFile.setName(typeName + '_' + transactionPDF + '_' + getDateYymmddFileName() + '.pdf');
        xlsFile.setFolder(DELIVERY_PDF_so_DJ_DELIVERYPDF);
    }else{
        xlsFile.setName(typeName + '_' + transactionPDF + '_' + getDateYymmddFileName() + '.pdf');
        xlsFile.setFolder(DELIVERY_RECIPT_PDF_so_DJ_DELIVERYPDF);
    }
    
  //CH762 20230818 add by zdj end
//    xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
    xlsFile.setIsOnline(true);

    // save file
    var fileID = nlapiSubmitFile(xlsFile);
    var fl = nlapiLoadFile(fileID);

    var url= URL_HEAD +'/'+fl.getURL();
    nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
    nlapiLogExecution('debug', typeName + ' pdf end');

    function getPersonName(id){
        if(!id){
            return '';
        }
        var employeeSearch = nlapiSearchRecord("employee",null,
            [
                ["internalid","anyof", id]
            ],
            [
                new nlobjSearchColumn("lastname"),
                new nlobjSearchColumn("firstname")
            ]
        );
        if(!isEmpty(employeeSearch)){
            return employeeSearch[0].getValue('lastname') + employeeSearch[0].getValue('firstname')
        }
        return '';
    }

    function formatDate(dt){
        return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
    }
    function defaultEmpty(src){
        return src || '';
    }

}
