/**
 * 見積送信
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Sep 2022     ZHOU
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	var str = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_pdfid');//job param
	nlapiLogExecution('DEBUG', 'SHOW ME str5', str);
	var idParam = JSON.parse(str);
	var repairEstimateId = idParam.repairEstimateId;
	var entity = idParam.entity;
	var sendmail = pdf(repairEstimateId,entity);
	function pdf(repairEstimateId,entity){
		if(!isEmpty(repairEstimateId)){
			nlapiLogExecution('debug', '見    積pdf start,ID:'+repairEstimateId);
			var estimateRecord=nlapiLoadRecord('estimate', repairEstimateId);
			var repairId = estimateRecord.getFieldValue('custbody_djkk_estimate_re');
			nlapiLogExecution('debug', 'repairCode:'+repairId);
			
			var repairRecord=nlapiLoadRecord('customrecord_djkk_repair', repairId);
			//DJ_連結
			var subsidiary = estimateRecord.getFieldValue('subsidiary');
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
					   new nlobjSearchColumn("url")
					]
			);
			var subsidiaryType= defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_subsidiary_type"));
			nlapiLogExecution('debug', 'subsidiaryType:'+subsidiaryType);
			//連結住所のTEL
			var subsidiaryZip = defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("zip","address",null));

			if(subsidiaryZip && subsidiaryZip.substring(0,1) != '〒'){
				subsidiaryZip = '〒' + subsidiaryZip;
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

			var publishDate = formatDate(new Date());//発行日
			var createDate = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_createdata'));//受付日,作成日
			if(createDate){
				createDate = formatDate(nlapiStringToDate(createDate));
			}
			//医療機関名
			var medName = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_institution'));
			//医療機関住所
			var medAddr= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_addr'));
			//医療機関電話番号
			var medTel= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_tel'));
			//医療機関担当者
			var medInCharge= getPersonName(defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_in_charge')));
			//販売店名
			var shopName = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_name'));
			//販売店部門
			var shopDepart = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_depart'));
			//販売店住所
			var shopAddr= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_addr'));
			//販売店電話番号
			var shopTel= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_tel'));
			//販売店担当者
			var shopInCharge= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_representative'));
			//依頼品
			var requestItem= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_item'));
			//itemcode
			var requestItemCode='';
			if(requestItem){
				var requestItemSearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","anyof", requestItem]
						], 
						[
						   new nlobjSearchColumn("itemid"),
						   new nlobjSearchColumn("displayname")
						]
						);
				if(!isEmpty(requestItemSearch)){
					requestItem = requestItemSearch[0].getValue('itemid');
					requestItemCode=requestItemSearch[0].getValue('displayname');
				}
			}		
			//ンリアル番号
			var serialNo= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_serial_no'));
			
            //CH762 20230818 add by zdj start
			var transactionPDF = defaultEmpty(estimateRecord.getFieldValue('transactionnumber'));       //PDF用
            //CH762 20230818 add by zdj end
			
			//エンドユーザー
			var endUser = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_end_user'));
			var ppm20 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_1'));
			var ppm8 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_2'));
			var ppm3 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_3'));
			// 測定不可
			var answer4 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_4'));
			nlapiLogExecution('debug', '測定', answer4);
			var answer5 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_5'));
			var answer6 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_6'));
			var answer7 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_7'));
			var answer8 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_8'));
			//メモ
			var memo = defaultEmpty(estimateRecord.getFieldValue('memo'));
			
			var sublistCount = estimateRecord.getLineItemCount('item');
			var itemIdArray = [];
			var itemIdMap = {};
			var itemDetails = [];
			var amountTotal = 0;
			var taxTotal = 0;
			var taxType = {};
			var taxTypeArray = [];
			nlapiLogExecution('debug', 'sublistCount', sublistCount);
			for(var s = 1; s <= sublistCount && s <= 10; s ++){
				var item = estimateRecord.getLineItemValue('item', 'item', s);//item
				var amount = parseFloat(estimateRecord.getLineItemValue('item', 'amount', s));//金額
				var taxRate = estimateRecord.getLineItemValue('item', 'taxrate1', s);//税率
				var taxAmount = parseFloat(estimateRecord.getLineItemValue('item', 'tax1amt', s));//税額
				var quantity = parseFloat(estimateRecord.getLineItemValue('item', 'quantity', s));//数量
				var rate = estimateRecord.getLineItemValue('item', 'rate', s);//修理単価
				var price = estimateRecord.getLineItemValue('item', 'custcol_djkk_pricing', s);//定価
				amountTotal += amount;
				taxTotal += taxAmount;
				var taxRateData = taxType[taxRate] || 0;
				taxType[taxRate] = taxRateData + taxAmount;
				if(taxTypeArray.indexOf(taxRate) < 0){
					taxTypeArray.push(taxRate);
				}
				itemIdArray.push(item);
				itemDetails.push({
					item: item,
					amount: amount,
					taxRate: taxRate,
					taxAmount: taxAmount,
					quantity: quantity,
					rate: rate,
					price: price
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
			}
			var noPriceItem = [];
			for( var n = 0; n < itemDetails.length; n ++){
				var itemDetail = itemDetails[n];
				itemDetail.item = itemIdMap[itemDetail.item];
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
			
			'<macrolist>'+
			'<macro id="nlfooter">'+
			'    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '<tr>' +
		    
		    '<td colspan="2" align="center"><img style="margin-left: 30px; height: 60px;" src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" /></td>' +
		    '</tr>' +
		    '    </table>' +
		    '</macro>'+
			'</macrolist>'+
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
			'   table { font-size: 9pt; width: 100%; border-collapse:collapse;}'+
			' td {height: 20px}' +
			' .opt-table td {height: 5px;}' +
			' .item-table td {vertical-align: middle; border:1px solid;}' +
			'   .sale-shop-title { font-size: 22px; height: 30px;}' +
			'   .table-noborder td{ border: 0px!important}'+
			'   .summary-table td{ height: 20px}'+
			'   .main-table td{ border-right: 0px; border-bottom: 0px;}'+
			'	.request-table td{ width: 110px; border-right: 0px; border-bottom: 0px;}' +
			'   .border-right{ border-right: 1px solid!important;}' +
			'   .width-col td{ border: 0px;height: 0px;}' +
			'   .title-color{ color: #8293d2}' +
			'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
			'b { font-weight: bold; color: #333333; }'+
			'.bottom-line-2px {border-bottom: 3px solid black; vertical-align: middle;}' +
			'.border-tb-dash {border-top: 1px dashed black; border-bottom: 1px dashed black;}' +
			'.border-top-dot {border-top: 1px dotted black;}' +
			'</style>'+
			'</head>'+
			
			'<body footer="nlfooter" footer-height="1%"  size="Letter">';
			
			str += '<table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr>' +
		    '            <td style="width: 80px" rowspan="2">&nbsp;</td><td align="center" style="text-align: center; height: 30px;"><span  style="color: #0054ac; font-size: 22px;">' + subsidiaryDisplayName + '</span></td><td align="right" style="width: 80px;vertical-align: middle;" rowspan="2">' + publishDate + '</td>' +
		    '        </tr>' +
		    '        <tr>' +
		    '        <td align="center"><span style="color: lightgray; height: 25px;">' + subsidiaryName + '</span></td>' +
		    '        </tr>' +
		    '        <tr>' +
		    '            <td>&nbsp;</td>' +
		    '        </tr>' +
		    '        <tr>' +
		    '            <td colspan="3" align="center" style="font-size: 24px; font-weight: bold;">見&nbsp;&nbsp;&nbsp;&nbsp;積&nbsp;&nbsp;&nbsp;&nbsp;書</td>' +
		    '        </tr>' +
		    '        <tr>' +
		    '            <td>&nbsp;</td>' +
		    '        </tr>' +
		    '    </table>' +
		    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr>' +
		    '            <td style="width: 330px;">' +
		    '                <table border="0" style="width: 100%" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                    <tr><td colspan="2" class="sale-shop-title">' + shopName + '</td></tr>' +
		    '                    <tr><td colspan="2" class="sale-shop-title">' + shopDepart + '</td></tr>' +
		    '                    <tr><td colspan="2" class="sale-shop-title">' + shopInCharge + '&nbsp;&nbsp;&nbsp;&nbsp;様</td></tr>' +
		    '                    <tr><td colspan="2">&nbsp;</td></tr>' +
		    '                    <tr><td align="right" style="vertical-align: top;">シリアルNo.</td><td align="center" style="font-weight: bold;font-size: 22px; width: 220px; border-bottom: 1px solid;">' + serialNo + '</td></tr>' +
		    '                </table>' +
		    '            </td>            ' +
		    '            <td style="width: 330px;">' +
		    '                <table border="0" style="width: 100%" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                    <tr><td align="right" style="font-size: 20px; font-weight: bold;height: 30px;">DENNISファーマ株式会社</td></tr>' +  //' + subsidiaryName + '
		    '                    <tr><td align="right"><span style="background-color: black; height: 20px; width: 20px;">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;医療機械修理担当</td></tr>' +
		    '                    <tr><td align="right">〒285-0802</td></tr>' +//' + subsidiaryZip + '
		    '                    <tr><td align="right">千葉県佐倉市大作1丁目8番5号</td></tr>' +//' + subsidiaryState + subsidiaryCity + subsidiaryAddr1 + subsidiaryAddr2 + subsidiaryAddr3 + '
		    '                    <tr><td align="right">TEL:043-498-2597</td></tr>' +//' + subsidiaryTel + '
		    '                    <tr><td align="right">FAX:043-498-2009</td></tr>' +//' + subsidiaryFax + '
		    '                    <tr><td align="right">e-mail:corepair@denispharma.jp</td></tr>' +//' + subsidiaryMail + '
		    '                </table>' +
		    '            </td>' +
		    '        </tr>' +
		    '    </table>' +
		    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr><td>いつも大変お世話になっております。</td></tr>' +
		    '        <tr><td>ご依頼いただいております'+requestItemCode+'(' + requestItem + ')の修理につきましてご連絡いたします。</td></tr>' +
		    '        <tr><td>メモ:'+memo+'</td></tr>' +
		    '        <tr><td style="font-weight: bold;">こ担当者：' + medName + '&nbsp;&nbsp;' + medInCharge + '&nbsp;&nbsp;(電話：' + medTel + ')'+ '</td></tr>' +
		    '        <tr><td style="font-weight: bold;">エンドユーザー：' + endUser + '</td></tr>' +
		    '    </table>' +
		    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr>       ' +
		    '            ' +
		    '            <td style="width: 270px; vertical-align: top;">' +
		    '                <table class="opt-table" border="0" style="width: 100%; border: 1px dotted; border-bottom: 0;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                    <tr><td style="height: 4px!important;"></td></tr>' +
		    '                </table>' +
		    '                <table border="0" style="width: 100%;border: 1px dotted;border-top: 0;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                    <tr><td style="width: 10px"></td><td colspan="2">20ppm,8ppm,3ppmに調整された</td></tr>' +
		    '                    <tr><td style="width: 10px"></td><td colspan="2">標準COガスでｍｐ測定結果</td></tr>' +
		    '                    <tr>' +
		    '                        <td style="width: 10px"></td>' +
		    '                    <td>受取時：</td>' +
		    '                    <td>' +
		    '                        <table border="0" style="width: 100%;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                            <tr><td align="right">20ppm→</td><td align="center">' + ppm20 + '</td><td>ppm</td></tr>' +
		    '                            <tr><td align="right">8ppm→</td><td align="center">' + ppm8 + '</td><td>ppm</td></tr>' +
		    '                            <tr><td align="right">3ppm→</td><td align="center">' + ppm3 + '</td><td>ppm</td></tr>' +
		    '                            <tr><td align="right" style="vertical-align: top;"><input type="checkbox" name="answer4" value="1"'+ (answer4 == 'T' ? ' checked="true" ' : '') + '/></td><td colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;測定不可</td></tr>' +
		    '                        </table>' +
		    '                    </td>' +
		    '                </tr>' +
		    '                </table>' +
		    '            </td>            ' +
		    '            <td style="width: 20px"></td>' +
		    '            <td style="vertical-align: top;">' +
		    '                <table class="opt-table" border="0" style="width: 100%; border: 1px dotted; border-bottom: 0;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                    <tr><td style="height: 4px!important;"></td></tr>' +
		    '                </table>' +
		    '                <table border="0" style="width: 100%; border: 1px dotted; border-top: 0;table-layout: fixed;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                    <tr><td style="width: 10px; height: 0px;"></td><td style="width: 50px; height: 0px;"></td><td style="height: 0px;"></td></tr>' +
		    '                    <tr><td></td><td colspan="2"><span style="margin-top: 5px;height: 40px;">不具合が見られた部位</span></td></tr>' +
		    '                    <tr><td></td><td><input type="checkbox" name="answer5" style="line-height:5px" value="1"'+ (answer5 == 'T' ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>電池プラグ（破損のため交換必須）</td></tr>' +
		    '                    <tr><td></td><td><input type="checkbox" name="answer6" value="1"'+ (answer6 == 'T' ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>センサー（故障しておりCALができません。信頼性ある測定値が得られない為、交換必須となります。）</td></tr>' +
		    '                    <tr style="height:40px"><td></td><td><input type="checkbox" name="answer7" value="1"'+ (answer7 == 'T' ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>センサー（故障ではありませんが劣化が考えられます。購入後または前回センサー交換時期より３年以上経過されている方に推奨しています。）</td></tr>' +
//		    '                    <tr><td></td><td><input type="checkbox" name="answer8" value="1"'+ (answer8 ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>その他（ ' + answer8 + ' ）</td></tr>' +
		    '                    <tr><td></td><td><input type="checkbox" name="answer8" value="1"'+ (answer8 ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="select" name="val" style="vertical-align:top;"><option>'+answer8+'</option><option value="1">その他(トップカバー交換)</option><option>その他(基盤交換)</option><option style="font-size:10px">その他(基盤交換及びトップカバー交換)</option></input></td></tr>' +
		    '                </table>' +
		    '            </td>' +
		    '        </tr>' +
		    '    </table>' +
		    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr><td style="width: 10px"></td><td align="center" style="width: 80px; vertical-align:middle; font-size: 22px;">金&nbsp;&nbsp;&nbsp;&nbsp;額</td><td align="center" style=" vertical-align:middle;font-weight: bold; font-size: 22px; width: 150px; height: 40px; border: 2px solid">${' + (amountTotal + taxTotal) + '?string[",##0;; roundingMode=halfUp"]}</td><td style="vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;※お振込手数料はお客様ご負担にてお願い申し上げます</td></tr>' +
		    '        <tr><td colspan="3" style="height: 5px;"></td></tr>' +
		    '    </table>' +
		    '    <table class="item-table" border="1" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr><td rowspan="2" align="center" style="width: 50px;background-color: black; color: white;">ご回答欄</td><td align="center">修理内容</td><td align="center">定価</td><td align="center">修理単価</td><td align="center">数量</td><td align="center">金額</td></tr>' +
		    '        <tr><td colspan="5" style="height: 4px;"></td></tr>';
			for(var k = 0; k < itemDetails.length; k++){
				var itemDetail = itemDetails[k];
				str += '<tr><td align="center"><input type="checkbox" name="item' + k + '" value="1"/></td><td>' + itemDetail.item + '</td><td align="right">${' + itemDetail.price + '?string[",##0;; roundingMode=halfUp"]}</td><td align="right">${' + itemDetail.rate + '?string[",##0;; roundingMode=halfUp"]}</td><td align="right">' + itemDetail.quantity + '</td><td align="right">${' + itemDetail.amount + '?string[",##0;; roundingMode=halfUp"]}</td></tr>';
			}
			
		    str += 
		    '        <tr><td align="center"><input type="checkbox" name="check" value="1"/></td><td>修理をせずに返却する</td><td></td><td></td><td></td><td></td></tr>' +
		    '        <tr>' +
		    '            <td rowspan="' + (taxTypeArray.length + 1) + '" align="center" style="border-right:0;height: 44px;vertical-align: middle;">' +
		    '                 <img style="width: 25px;height: 25px; border: 0;" src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=71422&amp;'+URL_PARAMETERS_C+'&amp;h=iFo_OJ5Iu7ZJUSeaBFqCi8Jtc12tzC11QLVI24QLVrt5ntog"/>' + 
		    '            </td>' +
		    '            <td rowspan="' + (taxTypeArray.length + 1) + '" style="border-left: 0">' +
		    '                 ご希望される修理に<br/>√をご記入下さい' + 
		    '            </td>' +
		    '            <td colspan="3" align="right">消費税' + taxTypeArray[0] + '</td>' +
		    '            <td align="right">${' + taxType[taxTypeArray[0]] + '?string[",##0;; roundingMode=halfUp"]}</td>' +
		    '        </tr>';
		    for(var k = 1; k < taxTypeArray.length; k ++){
			    str += '<tr>' +
			    '            <td colspan="3" align="right">消費税' + taxTypeArray[k] + '</td>' +
			    '            <td align="right">${' + taxType[taxTypeArray[k]] + '?string[",##0;; roundingMode=halfUp"]}</td>' +
			    '        </tr>';
		    }
		    
		    str += 
		    '        <tr>' +
		    '            <td colspan="3" align="right">合計</td>' +
		    '            <td align="right">${' + taxTotal + '?string[",##0;; roundingMode=halfUp"]}</td>' +
		    '        </tr>' +
		    '        <tr>' +
		    '            <td colspan="6" style="height: 80px; vertical-align: top;padding-top: 5px;">【通信欄】※伝達事項がございましたら、こちらにご記入をお願いいたします。</td>' +
		    '        </tr>' +
		    '    </table>' +
		    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr>' +
		    '            <td colspan="2" style="height: 20px;"></td>' +
		    '        </tr>        ' +
		    '        <tr>' +
		    '            <td style="width: 100px"></td>' +
		    '            <td rowspan="2" style="width: 150px;font-weight:bold;">【見積の回答方法】</td><td>修理単価を提示した修理内容より、実施を御希望の修理に√をご記入の上</td>' +
		    '        </tr>' +
		    '        <tr>' +
		    '            <td></td>' +
		    '            <td>本見積書をFAXまたはEメールにて弊社宛にお送り下さい。</td>' +
		    '        </tr>        ' +
		    '        <tr>' +
		    '            <td></td>' +
		    '            <td style="font-weight:bold;">【修理開始について】</td><td>見積回答を頂いてから修理を開始いたします。</td>' +
		    '        </tr>        ' +
		    '        <tr>' +
		    '            <td></td>' +
		    '            <td style="font-weight:bold;">【修理後の発送について】</td><td>見積回答後、約1週間後に弊社より発送いたします。</td>' +
		    '        </tr>' +

		    '    </table>';
			
			str += '</body>'+
			'</pdf>';
			
			var renderer = nlapiCreateTemplateRenderer();
			renderer.setTemplate(str);
			var xml = renderer.renderToString();
			var xlsFile = nlapiXMLToPDF(xml);
			
			// PDFファイル名を設定する  
			//CH762 20230818 add by zdj start
//			xlsFile.setName('修理品見積' + '_' + getFormatYmdHms() + '.pdf');
			xlsFile.setName('見積' + '_' + transactionPDF + '_' + getDateYymmddFileName() + '.pdf');
			nlapiLogExecution('DEBUG', 'ESTIMATE_PDF_DJ_ESTIMATEPDF', ESTIMATE_PDF_DJ_ESTIMATEPDF);
			xlsFile.setFolder(ESTIMATE_PDF_DJ_ESTIMATEPDF);
			//CH762 20230818 add by zdj end
//			xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
			xlsFile.setIsOnline(true);
			
			// save file
			var fileID = nlapiSubmitFile(xlsFile);
			var fl = nlapiLoadFile(fileID);
			
			//U063 見積送信
			var mailRenderer = nlapiCreateTemplateRenderer();
			var title = "修理品見積送信"
			var mailTemplate = '<table border="0" cellpadding="0" cellspacing="0" width="100%">'+
			'<tbody>'+
			'<tr>'+
			'<td>'+
			'<table border="0" cellpadding="0" cellspacing="2">'+
			'<tbody>'+
			'<tr>'+
			'<td>修理品見積送信</td>'+
			'</tr>'+
			'</tbody>'+
			'</table>'+
			'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;</td>'+
			'</tr>'+
			'</tbody>'+
			'</table>'+
			''+
			'<table border="0" cellpadding="0" cellspacing="0" width="100%">'+
			'<tbody>'+
			'<tr>'+
			'<td>&nbsp;</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;</td>'+
			'</tr>'+
			'</tbody>'+
			'</table>';
			mailRenderer.setTemplate(mailTemplate);
			var body = mailRenderer.renderToString();
			var userid = nlapiGetUser();
			var customerSearch = nlapiSearchRecord("customer",null,
					[
					   ["isdefaultbilling","is","T"], 
					   "AND", 
					   ["internalid","anyof",entity]
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_mail","Address",null)
					]
					);
			if(customerSearch != null){
				var mails = defaultEmpty(customerSearch[0].getValue("custrecord_djkk_mail","Address",null));
			}
			nlapiSendEmail(userid, mails, title, body, null, null, null, fl);
			nlapiLogExecution('debug', 'customer mails',mails);
			
			var url= URL_HEAD +'/'+fl.getURL();
			nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
			nlapiLogExecution('debug', '見    積 pdf end');
		}
	}
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
