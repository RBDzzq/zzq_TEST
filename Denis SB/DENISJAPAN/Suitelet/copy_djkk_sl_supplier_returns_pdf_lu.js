/**
 * バーコード
 *
 * Version    Date            Author           Remarks
 * 1.00       2021/05/26     CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){

	var vendorreturnauthorizationId = request.getParameter('vendorreturnauthorizationId');
	if(!isEmpty(vendorreturnauthorizationId)){
		var record = nlapiLoadRecord('vendorreturnauthorization', vendorreturnauthorizationId);
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
				]
	);
		var legalname = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("legalname")));//子会社正式名称
		var custrecord_djkk_subsidiary_en = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en")));//会社名前英語
		var titleName = 'INVOICE PACKING LIST'; //タイトル
		var subsidiaryProvince= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null)));//都道府県
		var subsidiaryCity= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("city","address",null)));//市区町村
		var subsidiaryAddr1= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("address1","address",null)));//住所1
		var subsidiaryAddr2= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("address2","address",null)));//住所2
		var subsidiaryAddr3= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("address3","address",null)));//住所2
		var subsidiaryFax = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("custrecord_djkk_address_fax","address")));//Fax
		var subsidiaryTel = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("phone","address")));//Tel
		var email = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("custrecord_djkk_mail","address",null)));//email
		var name = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("name")));//子会社名前 		
		var subsidiaryZip = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("zip","address",null)));//ZIP
		var subsidiaryAddEn = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng")));//DJ_住所英語メモ
	    var subsidiaryAddr= subsidiaryAddr1+subsidiaryAddr2+subsidiaryAddr3;//住所1+住所2+住所3
		var subsidiaryLogoURLCurrent = defaultEmpty(isEmpty(subsidiarySearch) ? '' : subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_url"));//子会社LogoURL
		var subsidiaryLogoURL = transfer(subsidiaryLogoURLCurrent); 
		
		var vendorId = record.getFieldValue('entity');//仕入先IDを取得
		var vendorName = record.getFieldText('entity');//仕入先名
		var tranid = record.getFieldValue('tranid'); //参照番号
		var trandate = record.getFieldValue('trandate'); //日付
		var currency = record.getFieldText('currency'); //通貨
		var memo = record.getFieldText('memo'); //memo
		
		//20230404 changed by zhou start
		var incoterm = record.getFieldText('custbody_djkk_incoterm'); //DJ_インコターム
//		var incoterm = record.getFieldText('incoterm'); //so.インコターム
		//end
	    //仕入先の正式名称と請求先と配送先の情報を取得
	    var vendorSearch = nlapiSearchRecord("vendor",null,
	    		[
	    		   ["internalid","anyof",vendorId]
	    		], 
	    		[
	    		   new nlobjSearchColumn("entityid"),//ID 
	    		   // new nlobjSearchColumn("companyname"),//正式名称
	    		   new nlobjSearchColumn("addressee","shippingAddress",null), //名前（宛名と思う　確認中）
	    		   new nlobjSearchColumn("address","shippingAddress",null),//住所
	    		   new nlobjSearchColumn("attention","shippingAddress",null),//宛名（担当者）  
	    		   new nlobjSearchColumn("addressphone","shippingAddress",null),//電話番号（住所） 
	    		   new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//FAX（カスタム） 
	    		   new nlobjSearchColumn("isdefaultbilling","shippingAddress",null), //デフォルト請求先住所
	    		   new nlobjSearchColumn("isdefaultshipping","shippingAddress",null),//デフォルト配送先住所
//	    		   new nlobjSearchColumn("custrecord_djkk_address_state","shippingAddress",null), //都道府県
//	    		   new nlobjSearchColumn("city","shippingAddress",null), //市町村
	    		   new nlobjSearchColumn("address","shippingAddress",null), //アドレス
	    		   new nlobjSearchColumn("address1","shippingAddress",null), //住所1
				   new nlobjSearchColumn("address2","shippingAddress",null), //住所2
				   new nlobjSearchColumn("address3","shippingAddress",null), //住所3
	    		   new nlobjSearchColumn("address"), //請求先住所
	    		   new nlobjSearchColumn("country","billingAddress",null), //請求先国
	    		   new nlobjSearchColumn("attention","billingAddress",null), //請求先宛名（担当者）
	    		   new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
	    		   new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
	    		   new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県
	    		   new nlobjSearchColumn("phone"), //請求先電話番号
	    		   new nlobjSearchColumn("fax"), //請求先Fax
	    		   new nlobjSearchColumn("terms"), 
	    		   ]
	    );
	    var shipPhone = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getValue("phone")));
	    var shipFax = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getValue("fax")));
	    var shipAttention = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getValue("attention","shippingAddress",null)));
	    var shipAddressee = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getValue("addressee","shippingAddress",null)));
	    var shipAddress = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getValue("address","shippingAddress",null)));
	    nlapiLogExecution('DEBUG', 'shipAddress', shipAddress);
	    var billaddress = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getValue("address")));
	    var billcountry = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getText("country","billingAddress",null)));
	    var billattention = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getValue("attention","billingAddress",null)));
	    var billcity = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getValue("city","billingAddress",null)));
	    var billzipcode = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getValue("zipcode","billingAddress",null)));
	    var billstate = defaultEmpty(isEmpty(vendorSearch) ? '' :  transfer(vendorSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null)));
	    var billphone = defaultEmpty(isEmpty(vendorSearch) ? '' :  vendorSearch[0].getValue("addressphone","billingAddress",null));
	    var billCustrecord_djkk_address_fax = defaultEmpty(isEmpty(vendorSearch) ? '' :  vendorSearch[0].getValue("custrecord_djkk_address_fax","billingAddress",null));
	    var terms = defaultEmpty(isEmpty(vendorSearch) ? '' :  vendorSearch[0].getText("terms"));
	    var address1 = defaultEmpty(isEmpty(vendorSearch) ? '' :  vendorSearch[0].getValue("address1","shippingAddress",null));
	    var address2 = defaultEmpty(isEmpty(vendorSearch) ? '' :  vendorSearch[0].getValue("address2","shippingAddress",null));
	    var address3 = defaultEmpty(isEmpty(vendorSearch) ? '' :  vendorSearch[0].getValue("address3","shippingAddress",null));
	    
	    var memo = defaultEmpty(record.getFieldValue('memo'));
		var itemList = record.getLineItemCount('item');//アイテム明細部
		var itemDetails = new Array();
		var inventoryDetailArr = new Array();
		if(itemList != 0) {
		      for(var s = 1; s < itemList+1; s++){
		    	  	var item = defaultEmpty(record.getLineItemText('item', 'item', s));//アイテム名前
		    	  	var itemID = defaultEmpty(record.getLineItemValue('item', 'item', s));//アイテムID
		    	  	var itemRecord = nlapiLookupField('item', itemID , [ 'custitem_djkk_product_name_line1','custitem_djkk_product_name_line2' ]);
		    	  	var itemEngName = itemRecord.custitem_djkk_product_name_line1;
		    	  	var itemEngName2 = itemRecord.custitem_djkk_product_name_line2;
		  	  		var description = defaultEmpty(record.getLineItemValue('item', 'description', s));//説明
		  	  		var quantity = defaultEmpty(parseFloat(record.getLineItemValue('item', 'quantity', s)));//数量
		  	  		var units_display = defaultEmpty(record.getLineItemValue('item', 'units_display', s));//単位
		  	  		var line = defaultEmpty(record.getLineItemValue('item', 'line', s));//単位
					var origrate = defaultEmptyToZero(parseFloat(record.getLineItemValue('item', 'origrate', s)));//単価
					var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					var amount = defaultEmptyToZero(parseFloat(record.getLineItemValue('item', 'amount', s)));//金額
					var invAmount = '';
					if(!isEmpty(amount)){
						var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
						nlapiLogExecution('DEBUG', 'amount', amount);
						invAmount  += amountFormat;
						nlapiLogExecution('DEBUG', 'invAmount', invAmount);
	//					var invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					}else{
						var amountFormat = '';
						invAmount = '';
					}
	
		  	  		itemDetails.push({
		  	  			item:item,
		  	  			description:description,
		  	  			quantity:quantity,
		  	  			units_display:units_display,
		  	  			line:line,
		  	  			itemEngName:itemEngName,
		  	  			itemEngName2:itemEngName2,
		  	  			origrateFormat:origrateFormat,
		  	  			amountFormat:amountFormat,
		  	  			invAmount:invAmount,
		  	  		});
		  	  	    record.selectLineItem('item', s);
		  	  		var inventoryDetail=record.editCurrentLineItemSubrecord('item','inventorydetail'); //在庫詳細
		  	  		nlapiLogExecution('DEBUG', 'inventoryDetail', inventoryDetail);	    
			  	  	if(!isEmpty(inventoryDetail)){
			  	  		var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
				  	  	if(inventoryDetailCount != 0){
					  	  	for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
					  	  		inventoryDetail.selectLineItem('inventoryassignment',j);
					  	  		var receiptinventorynumber;
					  	  		receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
					  	  		if(isEmpty(receiptinventorynumber)){
					  	  			var invReordId;//ロット番号internalid
						  	  		invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
							    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
						                    [
						                       ["internalid","is",invReordId]
						                    ], 
						                    [
						                     	new nlobjSearchColumn("inventorynumber"),
						                    ]
						                    );    
							    	receiptinventorynumber = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////シリアル/ロット番号	
					  	  		}
					  	  		var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //有效期限	
					  	  	nlapiLogExecution('DEBUG', 'expirationdate', expirationdate);
						  	  	inventoryDetailArr.push({
									line:line,
									receiptinventorynumber:receiptinventorynumber,
									expirationdate:expirationdate,					
						  	  	});
					  	  	}
				  	  	}
			  	  	}else{
				  	  	inventoryDetailArr.push({
					  	  	receiptinventorynumber:'',
					  	  	expirationdate:'',
					  	    line:line,
						}); 
			  	  	}
		      }
		}
	}
    var xmlString = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">\n' +
        '<pdf>\n' +
        '    <head>\n' +
        '        <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />\n' +
        '        <#if .locale == "zh_CN">\n' +
        '        <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />\n' +
        '        <#elseif .locale == "zh_TW">\n' +
        '        <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />\n' +
        '        <#elseif .locale == "ja_JP">\n' +
        '        <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />\n' +
        '        <#elseif .locale == "ko_KR">\n' +
        '        <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />\n' +
        '        <#elseif .locale == "th_TH">\n' +
        '        <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />\n' +
        '    </#if>\n' +
        '    <macrolist>\n' +
        '        <macro id="nlheader">\n' +
        '            <table style="width: 100%; font-size: 5pt;">\n' +
        '                <tr style="border-bottom:2px solid #6F8CAD;color:#4678d0;font-size:1.3em;margin-bottom:0.8em;">\n' +
        '                    <td align="left" style="width:50%; padding: 0em 0em 0.3em 1.3em;">\n' +
        '                        <span style="color:#4678d0;font-weight:bold; font-family: Arial, Helvetica, sans-serif;height: 30px;">'+legalname+'\n' +
        '                        </span>\n' +
        '                    </td>\n' +
        '                    <td align="right" style="padding: 0em 1.3em 0.3em 0em;">\n' +
        '                        <span>'+legalname+'</span>\n' +
        '                    </td>\n' +
        '                </tr>\n' +
        '            </table>\n' +
        '        </macro>\n' +
        
        '        <macro id="nlfooter">\n' +
        '            <table style="width: 100%; font-size: 8pt;">\n' +
        '                <tr style="color:#4678d0;">\n' +
        '                    <td style="padding-top:5px;">\n' +
    							'<span style="font-size:12px;">&nbsp;&nbsp;&nbsp;&nbsp;'+ legalname+'</span><br />'+
    							'<span style="font-size:9px;">&nbsp;&nbsp;&nbsp;&nbsp;〒'+ subsidiaryZip + '&nbsp;' + subsidiaryProvince + '&nbsp;'+ subsidiaryCity+ '&nbsp;' + subsidiaryAddr+'</span><br />'+
    							'<span style="font-size:12px;">&nbsp;&nbsp;&nbsp;&nbsp;'+ custrecord_djkk_subsidiary_en+'</span><br />'+
    							'<span style="font-size:9px;">&nbsp;&nbsp;&nbsp;&nbsp; '+ subsidiaryAddEn+'</span>'+
        '                    </td>\n' +
        '                    <td align="right" style="width: 256px;">\n' +
        '                        <img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs"\n' +
        '                             style="width: 90px; height: 50px; margin-top: 5px; float: right;"/>\n' +
        '                    </td>\n' +
        '                </tr>\n' +
        '            </table>\n' +
        '        </macro>\n' +
        '    </macrolist>\n' +
        '    <style type="text/css">* {\n' +
        '        <#if .locale == "zh_CN">\n' +
        '        font-family: NotoSans, NotoSansCJKsc, sans-serif;\n' +
        '        <#elseif .locale == "zh_TW">\n' +
        '        font-family: NotoSans, NotoSansCJKtc, sans-serif;\n' +
        '        <#elseif .locale == "ja_JP">\n' +
        '        font-family: NotoSans, NotoSansCJKjp, sans-serif;\n' +
        '        <#elseif .locale == "ko_KR">\n' +
        '        font-family: NotoSans, NotoSansCJKkr, sans-serif;\n' +
        '        <#elseif .locale == "th_TH">\n' +
        '        font-family: NotoSans, NotoSansThai, sans-serif;\n' +
        '        <#else>\n' +
        '        font-family: NotoSans, sans-serif;\n' +
        '    </#if>\n' +
        '            }\n' +
        '            table {\n' +
        '            font-size: 9pt;\n' +
        '            table-layout: fixed;\n' +
        '            }\n' +
        '            th {\n' +
        '            font-weight: bold;\n' +
        '            font-size: 8pt;\n' +
        '            vertical-align: middle;\n' +
        '            padding: 5px 6px 3px;\n' +
        '            background-color: #e3e3e3;\n' +
        '            color: #333333;\n' +
        '            }\n' +
        '            td {\n' +
        '            padding: 4px 6px;\n' +
        '            }\n' +
        '            td p { align:left }\n' +
        '            b {\n' +
        '            font-weight: bold;\n' +
        '            color: #333333;\n' +
        '            }\n' +
        '            table.header td {\n' +
        '            padding: 0;\n' +
        '            font-size: 10pt;\n' +
        '            }\n' +
        '            table.footer td {\n' +
        '            padding: 0;\n' +
        '            font-size: 8pt;\n' +
        '            }\n' +
        '            table.itemtable th {\n' +
        '            padding-bottom: 10px;\n' +
        '            padding-top: 10px;\n' +
        '            }\n' +
        '            table.body td {\n' +
        '            padding-top: 2px;\n' +
        '            }\n' +
        '            tr.totalrow {\n' +
        '            background-color: #e3e3e3;\n' +
        '            line-height: 200%;\n' +
        '            }\n' +
        '            td.totalboxtop {\n' +
        '            font-size: 12pt;\n' +
        '            background-color: #e3e3e3;\n' +
        '            }\n' +
        '            td.addressheader {\n' +
        '            font-size: 8pt;\n' +
        '            padding-top: 6px;\n' +
        '            padding-bottom: 2px;\n' +
        '            }\n' +
        '            td.address {\n' +
        '            padding-top: 0;\n' +
        '            }\n' +
        '            td.totalboxmid {\n' +
        '            font-size: 28pt;\n' +
        '            padding-top: 20px;\n' +
        '            background-color: #e3e3e3;\n' +
        '            }\n' +
        '            td.totalboxbot {\n' +
        '            background-color: #e3e3e3;\n' +
        '            font-weight: bold;\n' +
        '            }\n' +
        '            span.title {\n' +
        '            font-size: 28pt;\n' +
        '            }\n' +
        '            span.number {\n' +
        '            font-size: 16pt;\n' +
        '            }\n' +
        '            span.itemname {\n' +
        '            font-weight: bold;\n' +
        '            line-height: 150%;\n' +
        '            }\n' +
        '            hr {\n' +
        '            width: 100%;\n' +
        '            color: #d3d3d3;\n' +
        '            background-color: #d3d3d3;\n' +
        '            height: 1px;\n' +
        '            }\n' +
        '            .itemdetailtb{width: 100%; border-collapse:collapse;margin-left:0.2in; margin-top:10px;}\n' +
        '            .itemdetailhtr{height:20px;}\n' +
        '            .itemhlineno{width:5%;}\n' +
        '            .itemhref{width:12%; border-left: 2px solid #499AFF; border-top: 2px solid #499AFF; border-bottom: 1px solid\n' +
        '            #499AFF;}\n' +
        '            .itemhprodesc{width:38%; border-left: 1px solid #499AFF; border-top: 2px solid #499AFF; border-bottom: 1px\n' +
        '            solid #499AFF;}\n' +
        '            .itemhquan,.itemhunitprice,.itemhtotalprice{width:13%; border-left: 1px solid #499AFF; border-top: 2px solid\n' +
        '            #499AFF; border-bottom: 1px solid #499AFF;}\n' +
        '            .itemhtotalprice{border-right: 2px solid #499AFF;}\n' +
        '            .itemref{border-left: 2px solid #499AFF;}\n' +
        '            .itemprodesc,.itemquan,.itemunitprice,.itemtotalprice{border-left: 1px solid #499AFF;}\n' +
        '            .itemtotalprice{border-right: 2px solid #499AFF;}\n' +
        '            .itemref,.itemreflast{min-height:40px;}\n' +
        '            .itemreflast{border-left: 2px solid #499AFF;}\n' +
        '            .itemprodesclast,.itemquanlast,.itemunitpricelast,.itemtotalpricelast{border-left: 1px solid #499AFF;}\n' +
        '            .itemtotalpricelast{border-right: 2px solid #499AFF;}\n' +
        '            .itemreflast,.itemprodesclast,.itemquanlast,.itemunitpricelast,.itemtotalpricelast{border-bottom: 2px solid\n' +
        '            #499AFF;}\n' +
        '            .topbd{border-top: 2px solid #499AFF;}\n' +
        '            .bottombd{border-bottom: 2px solid #499AFF!important;border-top: 2px solid #499AFF; vertical-align:middle;}\n' +
        '            .totalmidtd{border-left: 1px solid #499AFF; border-bottom: 2px solid #499AFF;}\n' +
        '            .totaltd{border-left: 2px solid #499AFF; border-bottom: 1px solid #499AFF;}\n' +
        '            .pricetd{border-left: 1px solid #499AFF; border-bottom: 1px solid #499AFF; border-right: 2px solid #499AFF;}\n' +
        '            .currencytd{border-left: 2px solid #499AFF; border-bottom: 2px solid #499AFF;}\n' +
        '            .lasttd{border-left: 1px solid #499AFF; border-bottom: 2px solid #499AFF; border-right: 2px solid #499AFF;}\n' +
        '            .totaltd,.pricetd,.currencytd,.lasttd{height:30px; vertical-align:middle;}\n' +
        '            .msg{margin-top:10px; border-top:1px; border-bottom:1px;}\n' +
        '            .noleftpadding{padding-left:0px;}\n' +
        '            .internalref{margin-left:0.2in; width: 100%;border-collapse: collapse;}\n' +
        '            .internalrefmsg{line-height:16pt;}\n' +
        '</style>\n' +
        '        </head>\n' +
        '<body header="nlheader" header-height="4%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="A4">\n' +
        '<table style="margin:0 0.2in 0.2in; width: 100%;border:2px solid #6F8CAD;">\n' +
        '    <tr>\n' +
        '        <td align="center" style="font-size:18px;font-weight:bold">'+ titleName +'</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td align="right">\n' +
        '            <span>Date : '+trandate+'</span>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td align="right">\n' +
        '            <span>P/O NO : '+ tranid +'</span>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '</table>\n' +
        '\n' +
        '<table cellpadding="0" cellspacing="1" style="width: 100%;margin:0 0.2in;">' +
        '    <tr>' +
        '        <td  colspan="2" style="padding-left: 16px; height: 17px; border-bottom: 1px;">Invoice to:&nbsp;'+ vendorName +'</td>' +
        '        <td  style="height: 17px;">&nbsp;</td>\n' +
        '    </tr>' +
        '    <tr style ="margin-top:10px">' +
        '        <td style="padding-left: 16px; height: 17px; ">'+ shipAttention +'</td>' +
        '        <td style="height: 17px;" align="center">'+ shipAttention +'</td>' +
        '        <td style="height: 17px; " align="right">&nbsp;</td>\n' +
        '    </tr>' +
        '    <tr>\n' +
        '        <td  colspan="3" style="padding-left: 16px; height: 17px; ">'+billstate+billcity+'</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td  style="padding-left: 16px; height: 17px; ">'+address1+address2+address3+'</td>\n' + 
        '        <td  style="height: 17px;" align="center">'+shipPhone+'</td>\n' +
        '        <td style="height: 17px; " align="right">&nbsp;</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td  colspan="3" style="padding-left: 16px; height: 17px; ">'+billzipcode+'</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td style="padding-left: 16px; height: 17px; ">'+billcountry+'</td>\n' +
        '        <td style="height: 17px;" align="center">'+shipFax+'</td>\n' +
        '        <td style="height: 17px; " align="right">Page :&nbsp; <pagenumber/></td>\n' +
        '    </tr>\n' +
        '</table>' +
        '<table cellpadding="0" cellspacing="1" style="width: 100%;margin:16px 0.2in;">\n' +
        '    <tr style = "margin-top:15px">\n' +
        '         <td colspan="5" style="padding-left: 16px; height: 17px;" >SHIP TO:'+shipAddressee+'</td>\n' +
        '        <td  colspan="5" style="padding-left: 18px; height: 17px; ">Bill to:</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '         <td colspan="6" style="padding-left: 16px; height: 17px;" >Tel:'+shipPhone+'</td>\n' +
        '         <td colspan="4" style="padding-left: 16px; height: 17px; ">Person in change:</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '         <td colspan="6">&nbsp;</td>\n' +
        '         <td colspan="2" style="padding-left: 16px;height: 17px;">3:11</td>\n' +
        '         <td colspan="2" style="height: 17px; " align="center">TEL:</td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '         <td colspan="6">&nbsp;</td>\n' +
        '         <td colspan="2">&nbsp;</td>\n' +
        '         <td colspan="2" style="height: 17px;" align="center">FAX:</td>\n' +
        '    </tr>\n' +
        '</table>\n' +

    	'<table cell-spacing="0" style="width:660px;margin-left: 0.2in;border-collapse: collapse;"><tr>'+
    	'<td style="width:80%; padding-left: 0px; padding-right: 0px;">'+
    	'<table cellpadding="0" cellspacing="0" style="width: 100%;"><tr style="border-bottom: 1px;">'+
    	'<td style="width: 45%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">TRAED TERMS:&nbsp;'+incoterm+'</td>'+
    	'<td align="right" style="width: 40%;padding: 2px 2px 2px 0px; height: 25px;" vertical-align="bottom"><span>(LATEST)</span></td>'+
    	'</tr>'+
    	'<tr>'+
    	'<td style="width: 98%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">PAYMENT TERMS:'+terms+'</td>'+
    	'<td style="width: 2%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>'+
    	'</tr>'+
    	'<tr>'+
    	'<td style="width: 98%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">Memo:'+memo+'</td>'+
    	'<td style="width: 2%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>'+
    	'</tr>'+
    	'</table>'+
    	'</td>'+
    	'<td align="left" cell-spacing="0" style="padding-left: 0px;padding-right: 0px;padding-top: 3px;">'+
    	'<table><tr>'+
    	'<td style="width: 60px; height: 50px;border:1px solid #499AFF;">&nbsp;</td>'+
    	'<td style="width: 60px; height: 50px;border:1px solid #499AFF;">&nbsp;</td>'+
    	'<td style="width: 60px; height: 50px;border:1px solid #499AFF;">&nbsp;</td>'+
    	'</tr>'+
    	'</table>'+
    	'</td>'+
    	'</tr></table>'+
        
        '<table cell-spacing="0" style="width: 660px;margin:20px 0.2in;">\n' +
        '    <tr class="itemdetailhtr">\n' +
        '        <td style="widhth:30px;">&nbsp;</td>\n' +
        '        <td style="width:90px;border:2px solid #499AFF;border-right:0px;">Reference</td>\n' +
        '        <td style="width:90px;border:2px solid #499AFF;border-right:0px;">ロットNo</td>\n' +
        '        <td style="width:90px;border:2px solid #499AFF;border-right:0px;">賞味期限</td>\n' +
        '        <td style="width:160px;border:2px solid #499AFF;border-right:0px;">Product Description</td>\n' +
        '        <td style="width:60px;border:2px solid #499AFF;border-right:0px;">Quantity<br/>(Kgs)\n' +
        '        </td>\n' +
        '        <td style="width:60px;border:2px solid #499AFF;border-right:0px;">Unit Price(USD/Kg)\n' +
        '        </td>\n' +
        '        <td style="width:60px;border:2px solid #499AFF;">Total Amount<br/>(USD)\n' +
        '        </td>\n' +
        '    </tr>\n' ;
        for(var j =0; j < itemDetails.length;j++){
        	for(var p = 0; p<inventoryDetailArr.length;p++ ){
        		var line = inventoryDetailArr[p].line;
        		var lotNO = inventoryDetailArr[p].receiptinventorynumber;  
        		var lotDate = inventoryDetailArr[p].expirationdate;  
        		nlapiLogExecution('DEBUG', 'lotNO', lotNO);
        		nlapiLogExecution('DEBUG', 'lotDate', lotDate);
        		if(line == itemDetails[j].line){
	        	xmlString += '<tr class="itemdetailhtr">'+
		           	 '        <td style="widhth:30px;margin-left:-6px;">' + itemDetails[j].line + '</td>\n' +
		           	 '        <td style="width:90px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + itemDetails[j].item + '</td>\n' +
		           	 '        <td style="width:90px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + lotNO +'</td>\n' +
		           	 '        <td style="width:90px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + lotDate +'</td>\n' +
		           	 '        <td style="width:160px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + itemDetails[j].itemEngName +" "+ itemDetails[j].itemEngName2 +'</td>\n' +
		           	 '        <td style="width:60px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + itemDetails[j].quantity +'</td>\n' +
			         '        <td style="width:60px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + currency +'</td>\n' +
			         '        <td style="width:60px;border:2px solid #499AFF;border-top:0px;">' + itemDetails[j].amountFormat +'</td>\n' +
		           	 '        </tr>\n' ;
        		}
        	}
        }
        xmlString += '<tr>\n' +
        '<td class="noleftpadding" colspan="6"  style="padding-top:10px;">\n' +
        '    <p align="left" style="margin-left:20px;">RECEPTION DATE:</p>\n' +
        '</td>\n' +
        '<td align="right" class="topbd totaltd" style="width:120px;border:2px solid #499AFF;border-right:0px;border-top:0px;">Total</td>\n' +
        '<td align="right" class="topbd pricetd" style="width:120px;border:2px solid #499AFF;border-top:0px;">'+ invAmount+'</td>\n' +
        '</tr>\n' +
        
        '<tr>\n' +
        '<td colspan="6">&nbsp;</td>\n' +
        '<td align="right"  style="border:2px solid #499AFF;border-right:0px;border-top:0px;">'+currency+'</td>\n' +
        '<td style="border:2px solid #499AFF;border-top:0px;">&nbsp;</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="noleftpadding" colspan="6">\n' +
        '    <span align="left" style="margin-left:20px;">AUTHORIZED SIGNATURE:</span>\n' +
        '    <span>CIE.STAMP:</span>' +
        '</td>\n' +
        '<td colspan="2">&nbsp;</td>\n' +
        '</tr>\n'+   
        '</table>\n' +
//        '        </#if> <!-- DETIALS END --> &nbsp;\n' +
//        '\n' +
        
//        '<table cell-spacing="0" class="internalref">\n' +
//        '<tr>\n' +
//        '    <td width="75%">&nbsp;</td>\n' +
//        '    <td class="internalrefmsg">OUR INTERNAL REF:<br/>11 1092 542 20-10-27<br/>Goods In Transit\n' +
//        '    </td>\n' +
//        '</tr>\n' +
//        '</table>\n' +
//        '<pbr/>\n' +
//        '<table style="margin:0 0.2in 0.2in; width: 100%;border:2px solid #6F8CAD;">\n' +
//        '<tr>\n' +
//        '    <td align="center">Packing list</td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td align="left">\n' +
//        '        <barcode codetype="code128" height="70" width="180" showtext="false" value="VR:${record.tranid}"/>\n' +
//        '    </td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td align="right">\n' +
//        '        <span>Date : ${record.trandate}</span>\n' +
//        '    </td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td align="right">\n' +
//        '        <span>DSM P/O : '+tranid+'</span>\n' +
//        '    </td>\n' +
//        '</tr>\n' +
//        '</table>\n' +
//        '\n' +
//        '<table cellpadding="0" cellspacing="1" style="width: 100%;margin:0 0.2in;">\n' +
//        '<tr>\n' +
//        '    <td colspan="2" style="padding-left: 16px; height: 17px; border-bottom: 1px;">Invoice to:&nbsp;${record.entity}\n' +
//        '    </td>\n' +
//        '    <td style="height: 16px;">&nbsp;</td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td colspan="3" style="width: 220px; padding-left: 26px; height: 1px; font:1px;">&nbsp;</td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td colspan="1" rowspan="3" style="width: 220px;padding-left: 26px;">[30 Pasir Panjang Road #13-31]<br/>[Mapletree\n' +
//        '        Business City]<br/>[Singapore 117440]\n' +
//        '    </td>\n' +
//        '    <td align="center" style="width: 220px;">&nbsp;</td>\n' +
//        '    <td style="width: 220px;">&nbsp;</td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td align="center" style="width: 220px;">&nbsp;</td>\n' +
//        '    <td style="width: 234px;">&nbsp;</td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td align="center" style="width: 220px;">&nbsp;</td>\n' +
//        '    <td align="right" style="width: 220px;">Page :&nbsp; <pagenumber/>&nbsp;/<totalpages/>&nbsp;\n' +
//        '    </td>\n' +
//        '</tr>\n' +
//        '</table>\n' +
//        '        &nbsp;\n' +
//        '\n' +
//        '<table style="width: 100%;margin-left: 0.2in">\n' +
//        '<tr>\n' +
//        '    <td colspan="2" style="font-size: 15pt">[Sceti shipper code No 1NY01(import/export) - 7 0100 0109 6591]</td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td colspan="2" style="font-size: 10pt">[Tel. +81.3.5510.2681]</td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td colspan="2">\n' +
//        '        &nbsp;\n' +
//        '    </td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td colspan="2" style="font-size: 13pt">Deliver to :&nbsp;[DNP Asia Pacific Distribution Ctr]</td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td style="width:150px">[Tokyo, July 29th, 2021]</td>\n' +
//        '    <td style="width: 150px;">ETA:&nbsp;[SINGAPORE, July 31 at 00:20 AM]</td>\n' +
//        '</tr>\n' +
//        '<tr>\n' +
//        '    <td>[Sankyu(Singapore) Pte Ltd]\n' +
//        '        <br/>\n' +
//        '        [Tuas Logistics Hub]\n' +
//        '        <br/>\n' +
//        '        [60 Tuas Bay Drive]\n' +
//        '        <br/>\n' +
//        '        [Singapore 637568]\n' +
//        '    </td>\n' +
//        '    <td>[MAWB: 131-5767-9882]<br/>[HAWB: STE-3106 6072]\n' +
//        '        <br/>\n' +
//        '        [Flight: JL711]\n' +
//        '        <br/>\n' +
//        '        [FREIGHT COLLECT]\n' +
//        '    </td>\n' +
//        '</tr>\n' +
//        '</table>\n' +
//        '        &nbsp;\n' +
//        '\n' +
//        '<table cell-spacing="0" style="width: 100%;margin-left: 0.2in;border-collapse: collapse;">\n' +
//        '<tr>\n' +
//        '    <td style="width:80%; padding-left: 0px; padding-right: 0px;">\n' +
//        '        <table cellpadding="0" cellspacing="0" style="width: 100%;">\n' +
//        '            <tr>\n' +
//        '                <td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;"\n' +
//        '                    vertical-align="bottom">[26 carton drums on 4 pallets]\n' +
//        '                </td>\n' +
//        '                <td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>\n' +
//        '            </tr>\n' +
//        '            <tr>\n' +
//        '                <td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;"\n' +
//        '                    vertical-align="bottom">Pallet size: [123cm x 102cm x 125cm x 1 pallet]\n' +
//        '                </td>\n' +
//        '                <td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>\n' +
//        '            </tr>\n' +
//        '            <tr>\n' +
//        '                <td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;"\n' +
//        '                    vertical-align="bottom">Memo：'+ memo +'</td>\n' +
//        '                <td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>\n' +
//        '            </tr>\n' +
//        '            <tr>\n' +
//        '                <td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;"\n' +
//        '                    vertical-align="bottom">TOTAL VOLUME [4.767] m3\n' +
//        '                </td>\n' +
//        '                <td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>\n' +
//        '            </tr>\n' +
//        '        </table>\n' +
//        '    </td>\n' +
//        '    <td align="left" cell-spacing="0" style="padding-left: 0px;padding-right: 0px;padding-top: 3px;">\n' +
//        '        <table>\n' +
//        '            <tr>\n' +
//        '                <td style="width: 60px; height: 50px;border:1px solid #499AFF;">&nbsp;</td>\n' +
//        '                <td style="width: 60px; height: 50px;border:1px solid #499AFF;">&nbsp;</td>\n' +
//        '                <td style="width: 60px; height: 50px;border:1px solid #499AFF;">&nbsp;</td>\n' +
//        '            </tr>\n' +
//        '        </table>\n' +
//        '    </td>\n' +
//        '</tr>\n' +
//        '</table>\n' +
////        '        <!-- DETIALS START --> <#if record.item?has_content> &nbsp;\n' +
////        '\n' + 
//        '<table cell-spacing="0" style="width: 660px;margin:20px 0.2in;">\n' +
//        '   <tr class="itemdetailhtr">\n' +
//        '    <td style="widhth:30px;">&nbsp;</td>\n' +
//        '    <td style="width:90px;border:2px solid #499AFF;border-right:0px;">Reference</td>\n' +
//        '    <td style="width:140px;border:2px solid #499AFF;border-right:0px;">Product Description</td>\n' +
//        '    <td style="width:60px;border:2px solid #499AFF;border-right:0px;">Packaging per drum</td>\n' +
//        '    <td style="width:60px;border:2px solid #499AFF;border-right:0px;">Total Quantity<br/>(Bags)\n' +
//        '    </td>\n' +
//        '    <td style="width:60px;border:2px solid #499AFF;border-right:0px;">Total Net Weight<br/>(Kgs)\n' +
//        '    </td>\n' +
//        '    <td style="width:60px;border:2px solid #499AFF;border-right:0px;">Total Gross Weight<br/>(Kgs)\n' +
//        '    </td>\n' +
//        '    <td style="width:140px;border:2px solid #499AFF;">Barcode\n' +
//        '    </td>\n' +
//        '</tr>\n' ;  
//        for(var j =0; j < itemDetails.length;j++){
//        	for(var p = 0; p<inventoryDetailArr.length;p++ ){
//        		var line = inventoryDetailArr[p].line;
//        		nlapiLogExecution('DEBUG', 'line', line);
//        		nlapiLogExecution('DEBUG', 'itemDetails[j].line', itemDetails[j].line);
//        		var lotNO = inventoryDetailArr[p].receiptinventorynumber;  
//        		var lotDate = inventoryDetailArr[p].expirationdate;  
//        		if(line == itemDetails[j].line){
//	        	xmlString += '<tr class="itemdetailhtr">'+
//		           	 '        <td style="widhth:30px;margin-left:-10px;">' + itemDetails[j].line + '</td>\n' +
//		           	 '        <td style="width:90px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + itemDetails[j].item + '</td>\n' +
//		           	 '        <td style="width:140px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + itemDetails[j].itemEngName +'</td>\n' +
//		           	 '        <td style="width:60px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + "" +'</td>\n' +
//		           	 '        <td style="width:60px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + itemDetails[j].quantity +'</td>\n' +
//		         	 '        <td style="width:60px;border:2px solid #499AFF;border-right:0px;border-top:0px;">' + "" +'</td>\n' +
//		         	 '		  <td style="width:60px;border:2px solid #499AFF;border-right:0px;border-top:0px;">${grossWeight?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
//		        	 '        <td style="width:140px;border:2px solid #499AFF;border-top:0px;"><barcode codetype="code128" height="40" width="110" showtext="false" value="${record.internalid};${item.line}"/></td>\n' +
//		           	 '        </tr>\n' ;
//        		}
//        	}
//        }
//        xmlString += '<tr>\n' +
////      '<td rowspan="2" colspan="3">&nbsp;</td>\n' +
//      '<td class="noleftpadding" colspan="4"  style="padding-top:10px;">\n' +
////      '    <p class="msg">PLEASE SET AUTHORIZED PERSON SIGN TO CONFIRM ORDER<br/>ACCEPTANCE AND SEND IT TO US BY RETURN:\n' +
////      '    </p>\n' +
////      '\n' +
//      '    <p align="left" style="margin-left:20px;">RECEPTION DATE:</p>\n' +
//      '</td>\n' +
//	  '<td align="center" class="bottombd totaltd">Total</td>\n' +
//	  '<td  class="topbd bottombd totalmidtd">${qtySum?string[",##0;; roundingMode=halfUp"]}</td>\n' +
//	  '<td  class="topbd bottombd totalmidtd">${netSum?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
//	  '<td  class="bottombd pricetd">${grossSum?string[",##0.00;; roundingMode=halfUp"]}</td>\n' +
//      '</tr>\n' +
////      
//      '<tr>\n' +
//      '<td>&nbsp;</td>\n' +
//      '<td>&nbsp;</td>\n' +
//      '</tr>\n' +
//      
//      '<tr>\n' +
//      '<td>&nbsp;</td>\n' +
//      '<td class="noleftpadding" colspan="4">\n' +
//      '    <span style="padding-right: 120px;">AUTHORIZED SIGNATURE:</span>\n' +
//      '    <span>CIE.STAMP:</span>\n' +
//      '</td>\n' +
//      '<td colspan="2">&nbsp;</td>\n' +
//      '</tr></table>\n' +
//      '<table cell-spacing="0" class="internalref">\n' +
//      '<tr>\n' +
//      '    <td width="75%">&nbsp;</td>\n' +
//      '    <td class="internalrefmsg">OUR INTERNAL REF:<br/>11 1092 542 20-10-27<br/>Goods In Transit\n' +
//      '    </td>\n' +
//      '</tr>\n' +
//      '</table>\n' +
      '</body>\n' +
      '</pdf>\n';
    // var recordId=request.getParameter('vendorreturnauthorizationId')；
    var recordId=request.getParameter('vendorreturnauthorizationId');
    var record = nlapiLoadRecord('vendorreturnauthorization', recordId);
    var renderer = nlapiCreateTemplateRenderer();
    renderer.setTemplate(xmlString);
    renderer.addRecord('record', record);
    var xml = renderer.renderToString();
    var xlsFile = nlapiXMLToPDF(xml);

    // var xlsFile = nlapiXMLToPDF(xmlString);
    // PDFファイル名を設定する
    xlsFile.setName('仕入先返品(輸入)PDF印刷' + '_' + getFormatYmdHms() + '.pdf');
    xlsFile.setFolder(FILE_CABINET_ID_IMPORT_PDF);
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