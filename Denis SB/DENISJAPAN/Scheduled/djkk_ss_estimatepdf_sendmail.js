/**
 * ���ϑ��M
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
			nlapiLogExecution('debug', '��    ��pdf start,ID:'+repairEstimateId);
			var estimateRecord=nlapiLoadRecord('estimate', repairEstimateId);
			var repairId = estimateRecord.getFieldValue('custbody_djkk_estimate_re');
			nlapiLogExecution('debug', 'repairCode:'+repairId);
			
			var repairRecord=nlapiLoadRecord('customrecord_djkk_repair', repairId);
			//DJ_�A��
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
			//�A���Z����TEL
			var subsidiaryZip = defaultEmpty(isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("zip","address",null));

			if(subsidiaryZip && subsidiaryZip.substring(0,1) != '��'){
				subsidiaryZip = '��' + subsidiaryZip;
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

			var publishDate = formatDate(new Date());//���s��
			var createDate = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_createdata'));//��t��,�쐬��
			if(createDate){
				createDate = formatDate(nlapiStringToDate(createDate));
			}
			//��Ë@�֖�
			var medName = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_institution'));
			//��Ë@�֏Z��
			var medAddr= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_addr'));
			//��Ë@�֓d�b�ԍ�
			var medTel= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_tel'));
			//��Ë@�֒S����
			var medInCharge= getPersonName(defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_medical_in_charge')));
			//�̔��X��
			var shopName = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_name'));
			//�̔��X����
			var shopDepart = defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_depart'));
			//�̔��X�Z��
			var shopAddr= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_addr'));
			//�̔��X�d�b�ԍ�
			var shopTel= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_tel'));
			//�̔��X�S����
			var shopInCharge= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_shop_representative'));
			//�˗��i
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
			//�����A���ԍ�
			var serialNo= defaultEmpty(repairRecord.getFieldValue('custrecord_djkk_re_serial_no'));
			
            //CH762 20230818 add by zdj start
			var transactionPDF = defaultEmpty(estimateRecord.getFieldValue('transactionnumber'));       //PDF�p
            //CH762 20230818 add by zdj end
			
			//�G���h���[�U�[
			var endUser = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_end_user'));
			var ppm20 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_1'));
			var ppm8 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_2'));
			var ppm3 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_3'));
			// ����s��
			var answer4 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_4'));
			nlapiLogExecution('debug', '����', answer4);
			var answer5 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_5'));
			var answer6 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_6'));
			var answer7 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_7'));
			var answer8 = defaultEmpty(estimateRecord.getFieldValue('custbody_djkk_repair_answer_8'));
			//����
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
				var amount = parseFloat(estimateRecord.getLineItemValue('item', 'amount', s));//���z
				var taxRate = estimateRecord.getLineItemValue('item', 'taxrate1', s);//�ŗ�
				var taxAmount = parseFloat(estimateRecord.getLineItemValue('item', 'tax1amt', s));//�Ŋz
				var quantity = parseFloat(estimateRecord.getLineItemValue('item', 'quantity', s));//����
				var rate = estimateRecord.getLineItemValue('item', 'rate', s);//�C���P��
				var price = estimateRecord.getLineItemValue('item', 'custcol_djkk_pricing', s);//�艿
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
		    '            <td colspan="3" align="center" style="font-size: 24px; font-weight: bold;">��&nbsp;&nbsp;&nbsp;&nbsp;��&nbsp;&nbsp;&nbsp;&nbsp;��</td>' +
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
		    '                    <tr><td colspan="2" class="sale-shop-title">' + shopInCharge + '&nbsp;&nbsp;&nbsp;&nbsp;�l</td></tr>' +
		    '                    <tr><td colspan="2">&nbsp;</td></tr>' +
		    '                    <tr><td align="right" style="vertical-align: top;">�V���A��No.</td><td align="center" style="font-weight: bold;font-size: 22px; width: 220px; border-bottom: 1px solid;">' + serialNo + '</td></tr>' +
		    '                </table>' +
		    '            </td>            ' +
		    '            <td style="width: 330px;">' +
		    '                <table border="0" style="width: 100%" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                    <tr><td align="right" style="font-size: 20px; font-weight: bold;height: 30px;">DENNIS�t�@�[�}�������</td></tr>' +  //' + subsidiaryName + '
		    '                    <tr><td align="right"><span style="background-color: black; height: 20px; width: 20px;">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;��Ë@�B�C���S��</td></tr>' +
		    '                    <tr><td align="right">��285-0802</td></tr>' +//' + subsidiaryZip + '
		    '                    <tr><td align="right">��t�����q�s���1����8��5��</td></tr>' +//' + subsidiaryState + subsidiaryCity + subsidiaryAddr1 + subsidiaryAddr2 + subsidiaryAddr3 + '
		    '                    <tr><td align="right">TEL:043-498-2597</td></tr>' +//' + subsidiaryTel + '
		    '                    <tr><td align="right">FAX:043-498-2009</td></tr>' +//' + subsidiaryFax + '
		    '                    <tr><td align="right">e-mail:corepair@denispharma.jp</td></tr>' +//' + subsidiaryMail + '
		    '                </table>' +
		    '            </td>' +
		    '        </tr>' +
		    '    </table>' +
		    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr><td>������ς����b�ɂȂ��Ă���܂��B</td></tr>' +
		    '        <tr><td>���˗����������Ă���܂�'+requestItemCode+'(' + requestItem + ')�̏C���ɂ��܂��Ă��A���������܂��B</td></tr>' +
		    '        <tr><td>����:'+memo+'</td></tr>' +
		    '        <tr><td style="font-weight: bold;">���S���ҁF' + medName + '&nbsp;&nbsp;' + medInCharge + '&nbsp;&nbsp;(�d�b�F' + medTel + ')'+ '</td></tr>' +
		    '        <tr><td style="font-weight: bold;">�G���h���[�U�[�F' + endUser + '</td></tr>' +
		    '    </table>' +
		    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr>       ' +
		    '            ' +
		    '            <td style="width: 270px; vertical-align: top;">' +
		    '                <table class="opt-table" border="0" style="width: 100%; border: 1px dotted; border-bottom: 0;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                    <tr><td style="height: 4px!important;"></td></tr>' +
		    '                </table>' +
		    '                <table border="0" style="width: 100%;border: 1px dotted;border-top: 0;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                    <tr><td style="width: 10px"></td><td colspan="2">20ppm,8ppm,3ppm�ɒ������ꂽ</td></tr>' +
		    '                    <tr><td style="width: 10px"></td><td colspan="2">�W��CO�K�X�ł������茋��</td></tr>' +
		    '                    <tr>' +
		    '                        <td style="width: 10px"></td>' +
		    '                    <td>��掞�F</td>' +
		    '                    <td>' +
		    '                        <table border="0" style="width: 100%;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '                            <tr><td align="right">20ppm��</td><td align="center">' + ppm20 + '</td><td>ppm</td></tr>' +
		    '                            <tr><td align="right">8ppm��</td><td align="center">' + ppm8 + '</td><td>ppm</td></tr>' +
		    '                            <tr><td align="right">3ppm��</td><td align="center">' + ppm3 + '</td><td>ppm</td></tr>' +
		    '                            <tr><td align="right" style="vertical-align: top;"><input type="checkbox" name="answer4" value="1"'+ (answer4 == 'T' ? ' checked="true" ' : '') + '/></td><td colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;����s��</td></tr>' +
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
		    '                    <tr><td></td><td colspan="2"><span style="margin-top: 5px;height: 40px;">�s�������ꂽ����</span></td></tr>' +
		    '                    <tr><td></td><td><input type="checkbox" name="answer5" style="line-height:5px" value="1"'+ (answer5 == 'T' ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>�d�r�v���O�i�j���̂��ߌ����K�{�j</td></tr>' +
		    '                    <tr><td></td><td><input type="checkbox" name="answer6" value="1"'+ (answer6 == 'T' ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>�Z���T�[�i�̏Ⴕ�Ă���CAL���ł��܂���B�M�������鑪��l�������Ȃ��ׁA�����K�{�ƂȂ�܂��B�j</td></tr>' +
		    '                    <tr style="height:40px"><td></td><td><input type="checkbox" name="answer7" value="1"'+ (answer7 == 'T' ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>�Z���T�[�i�̏�ł͂���܂��񂪗򉻂��l�����܂��B�w����܂��͑O��Z���T�[�����������R�N�ȏ�o�߂���Ă�����ɐ������Ă��܂��B�j</td></tr>' +
//		    '                    <tr><td></td><td><input type="checkbox" name="answer8" value="1"'+ (answer8 ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td>���̑��i ' + answer8 + ' �j</td></tr>' +
		    '                    <tr><td></td><td><input type="checkbox" name="answer8" value="1"'+ (answer8 ? ' checked="true" ' : '') + '/>&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="select" name="val" style="vertical-align:top;"><option>'+answer8+'</option><option value="1">���̑�(�g�b�v�J�o�[����)</option><option>���̑�(��Ռ���)</option><option style="font-size:10px">���̑�(��Ռ����y�уg�b�v�J�o�[����)</option></input></td></tr>' +
		    '                </table>' +
		    '            </td>' +
		    '        </tr>' +
		    '    </table>' +
		    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr><td style="width: 10px"></td><td align="center" style="width: 80px; vertical-align:middle; font-size: 22px;">��&nbsp;&nbsp;&nbsp;&nbsp;�z</td><td align="center" style=" vertical-align:middle;font-weight: bold; font-size: 22px; width: 150px; height: 40px; border: 2px solid">${' + (amountTotal + taxTotal) + '?string[",##0;; roundingMode=halfUp"]}</td><td style="vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;�����U���萔���͂��q�l�����S�ɂĂ��肢�\���グ�܂�</td></tr>' +
		    '        <tr><td colspan="3" style="height: 5px;"></td></tr>' +
		    '    </table>' +
		    '    <table class="item-table" border="1" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr><td rowspan="2" align="center" style="width: 50px;background-color: black; color: white;">���񓚗�</td><td align="center">�C�����e</td><td align="center">�艿</td><td align="center">�C���P��</td><td align="center">����</td><td align="center">���z</td></tr>' +
		    '        <tr><td colspan="5" style="height: 4px;"></td></tr>';
			for(var k = 0; k < itemDetails.length; k++){
				var itemDetail = itemDetails[k];
				str += '<tr><td align="center"><input type="checkbox" name="item' + k + '" value="1"/></td><td>' + itemDetail.item + '</td><td align="right">${' + itemDetail.price + '?string[",##0;; roundingMode=halfUp"]}</td><td align="right">${' + itemDetail.rate + '?string[",##0;; roundingMode=halfUp"]}</td><td align="right">' + itemDetail.quantity + '</td><td align="right">${' + itemDetail.amount + '?string[",##0;; roundingMode=halfUp"]}</td></tr>';
			}
			
		    str += 
		    '        <tr><td align="center"><input type="checkbox" name="check" value="1"/></td><td>�C���������ɕԋp����</td><td></td><td></td><td></td><td></td></tr>' +
		    '        <tr>' +
		    '            <td rowspan="' + (taxTypeArray.length + 1) + '" align="center" style="border-right:0;height: 44px;vertical-align: middle;">' +
		    '                 <img style="width: 25px;height: 25px; border: 0;" src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=71422&amp;'+URL_PARAMETERS_C+'&amp;h=iFo_OJ5Iu7ZJUSeaBFqCi8Jtc12tzC11QLVI24QLVrt5ntog"/>' + 
		    '            </td>' +
		    '            <td rowspan="' + (taxTypeArray.length + 1) + '" style="border-left: 0">' +
		    '                 ����]�����C����<br/>������L��������' + 
		    '            </td>' +
		    '            <td colspan="3" align="right">�����' + taxTypeArray[0] + '</td>' +
		    '            <td align="right">${' + taxType[taxTypeArray[0]] + '?string[",##0;; roundingMode=halfUp"]}</td>' +
		    '        </tr>';
		    for(var k = 1; k < taxTypeArray.length; k ++){
			    str += '<tr>' +
			    '            <td colspan="3" align="right">�����' + taxTypeArray[k] + '</td>' +
			    '            <td align="right">${' + taxType[taxTypeArray[k]] + '?string[",##0;; roundingMode=halfUp"]}</td>' +
			    '        </tr>';
		    }
		    
		    str += 
		    '        <tr>' +
		    '            <td colspan="3" align="right">���v</td>' +
		    '            <td align="right">${' + taxTotal + '?string[",##0;; roundingMode=halfUp"]}</td>' +
		    '        </tr>' +
		    '        <tr>' +
		    '            <td colspan="6" style="height: 80px; vertical-align: top;padding-top: 5px;">�y�ʐM���z���`�B�������������܂�����A������ɂ��L�������肢�������܂��B</td>' +
		    '        </tr>' +
		    '    </table>' +
		    '    <table border="0" style="width: 660px;" cellspacing="0" cellpadding="0" border-collapse="collapse">' +
		    '        <tr>' +
		    '            <td colspan="2" style="height: 20px;"></td>' +
		    '        </tr>        ' +
		    '        <tr>' +
		    '            <td style="width: 100px"></td>' +
		    '            <td rowspan="2" style="width: 150px;font-weight:bold;">�y���ς̉񓚕��@�z</td><td>�C���P����񎦂����C�����e���A���{�����]�̏C���Ɂ�����L���̏�</td>' +
		    '        </tr>' +
		    '        <tr>' +
		    '            <td></td>' +
		    '            <td>�{���Ϗ���FAX�܂���E���[���ɂĕ��Ј��ɂ����艺�����B</td>' +
		    '        </tr>        ' +
		    '        <tr>' +
		    '            <td></td>' +
		    '            <td style="font-weight:bold;">�y�C���J�n�ɂ��āz</td><td>���ω񓚂𒸂��Ă���C�����J�n�������܂��B</td>' +
		    '        </tr>        ' +
		    '        <tr>' +
		    '            <td></td>' +
		    '            <td style="font-weight:bold;">�y�C����̔����ɂ��āz</td><td>���ω񓚌�A��1�T�Ԍ�ɕ��Ђ�蔭���������܂��B</td>' +
		    '        </tr>' +

		    '    </table>';
			
			str += '</body>'+
			'</pdf>';
			
			var renderer = nlapiCreateTemplateRenderer();
			renderer.setTemplate(str);
			var xml = renderer.renderToString();
			var xlsFile = nlapiXMLToPDF(xml);
			
			// PDF�t�@�C������ݒ肷��  
			//CH762 20230818 add by zdj start
//			xlsFile.setName('�C���i����' + '_' + getFormatYmdHms() + '.pdf');
			xlsFile.setName('����' + '_' + transactionPDF + '_' + getDateYymmddFileName() + '.pdf');
			nlapiLogExecution('DEBUG', 'ESTIMATE_PDF_DJ_ESTIMATEPDF', ESTIMATE_PDF_DJ_ESTIMATEPDF);
			xlsFile.setFolder(ESTIMATE_PDF_DJ_ESTIMATEPDF);
			//CH762 20230818 add by zdj end
//			xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
			xlsFile.setIsOnline(true);
			
			// save file
			var fileID = nlapiSubmitFile(xlsFile);
			var fl = nlapiLoadFile(fileID);
			
			//U063 ���ϑ��M
			var mailRenderer = nlapiCreateTemplateRenderer();
			var title = "�C���i���ϑ��M"
			var mailTemplate = '<table border="0" cellpadding="0" cellspacing="0" width="100%">'+
			'<tbody>'+
			'<tr>'+
			'<td>'+
			'<table border="0" cellpadding="0" cellspacing="2">'+
			'<tbody>'+
			'<tr>'+
			'<td>�C���i���ϑ��M</td>'+
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
			nlapiLogExecution('debug', '��    �� pdf end');
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
