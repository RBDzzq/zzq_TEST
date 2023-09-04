/**
 *  '�V���O���s�b�L���O���X�g���z���w��_�a����݌�
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Sep 2022     CPC_�v
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug', '', '�V���O���s�b�L���O���X�g���z���w��_�a����݌�');
	var changeId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_delivery_slip_pro_par');
	nlapiLogExecution('debug', '�a����݌ɒ���', changeId);
	
	var locationSearch = nlapiSearchRecord("location",null,
			[
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
			   new nlobjSearchColumn("internalid")
			]
			);
	var mailArr = new Array();
	for(var i = 0 ; i < locationSearch.length ; i++){
		mailArr[locationSearch[i].getValue('internalid')] = locationSearch[i].getValue("custrecord_djkk_mail","address",null);
	}
	
	var soArray = new Array();
	var soBody = new Array();
	var arr = changeId.split(',');
	var pdfExArr = new Array();
	for(var i = 0 ; i < arr.length ; i ++){
		if(isEmpty(arr[i])){
			continue;
		}
		governanceYield();
		var stock = nlapiLoadRecord('customrecord_djkk_ic_change', arr[i]);  //�a����݌ɒ���
		var locationId = stock.getFieldValue('custrecord_djkk_ica_location');  //�ꏊ
		var soId =  stock.getFieldValue('custrecord_djkk_ica_so');  //so
		nlapiLogExecution('debug', 'soId', soId);
		if(!isEmpty(soId)){
			var salesorderSearch = nlapiSearchRecord("salesorder",null,
					[
					   ["type","anyof","SalesOrd"], 
					   "AND", 
					   ["taxline","is","F"], 
					   "AND", 
					   ["mainline","is","F"], 
					   "AND", 
					   ["internalid","anyof",soId], 
					   "AND", 
					   ["itemType","isnot","shipItem"]
					], 
					[
					   new nlobjSearchColumn("item"), 
					   new nlobjSearchColumn("serialnumbers"),
					   new nlobjSearchColumn("salesdescription","item",null), 
					   new nlobjSearchColumn("expirationdate","inventoryDetail",null),
					   new nlobjSearchColumn("line"), 
					   new nlobjSearchColumn("quantity"),
					   new nlobjSearchColumn("subsidiary"),
					]
					);
			if(!isEmpty(salesorderSearch)){
				nlapiLogExecution('debug', '111', soId);
				for(var g = 0 ; g < salesorderSearch.length ;g++){
					var item = salesorderSearch[g].getValue("item"); //item
					var itemName = salesorderSearch[g].getText("item"); //item
					var serialnumbers = salesorderSearch[g].getValue("serialnumbers"); //�V���A��/���b�g�ԍ�
					var itemNo = salesorderSearch[g].getValue("salesdescription","item",null); //����
					var expirationdate = salesorderSearch[g].getValue("expirationdate","inventoryDetail",null); //�L������
					var lineNo = salesorderSearch[g].getValue("line"); //�s
					var quantity = salesorderSearch[g].getValue("quantity"); //����
					var subsidiary = salesorderSearch[g].getValue("subsidiary");
					var itemSearch = nlapiSearchRecord("item",null,
							[
							 	["internalid","anyof",item],
							],
							[
//							 new nlobjSearchColumn("countryofmanufacture"),//�ύڒn
//							 new nlobjSearchColumn("custitem_djkk_radioactivity_classifi"), //DJ_8_���ː��敪
//							 new nlobjSearchColumn("displayname"),
							 new nlobjSearchColumn("internalid"),
							]
						); 
					var countryofmanufacture= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("countryofmanufacture"));//�ύڒn
					var classifi= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getText("custitem_djkk_radioactivity_classifi"));//DJ_8_���ː��敪
					var displayname= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//���O
					var intId= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("internalid"));//���O
//					var intId = itemSearch[0].getValue("internalid");//���O
					var itemSearchOne = nlapiSearchRecord("item",null,
					[
					 	["internalid","anyof",item],
					],
					[
					  new nlobjSearchColumn("custitem_djkk_deliverytemptyp"), //DJ_�z�����x�敪
					]
					); 
					var deliverytemptyp= defaultEmpty(isEmpty(itemSearchOne) ? '' :  itemSearchOne[0].getText("custitem_djkk_deliverytemptyp"));//DJ_�z�����x�敪
					nlapiLogExecution('DEBUG', 'deliverytemptyp', deliverytemptyp);
//					soBody.push({
//						deliverytemptyp:deliverytemptyp
//					});
						

					
					soBody.push({
						itemName:itemName, //item
						serialnumbers:serialnumbers,  //�V���A��/���b�g�ԍ�
						itemNo:itemNo, //����
						expirationdate:expirationdate, //�L������
						countryofmanufacture:countryofmanufacture, //�ύڒn
						classifi:classifi, //DJ_8_���ː��敪
						lineNo:lineNo,
						displayname:displayname,
						quantity:quantity,
						soId:soId,
						item:item,
						deliverytemptyp:deliverytemptyp,
					});

				}
			}
			nlapiLogExecution('debug', '222', soId);
			var soSearch= nlapiSearchRecord("transaction",null,
					[
					      ["internalid","anyof",soId],
					      "AND",
						  ["type","anyof","SalesOrd"],
						  "AND", 
					      ["taxline","is","F"], 
					      "AND", 
					      ["mainline","is","T"],
					      "AND", 
						  ["itemType","isnot","shipItem"]

					], 
					[
					   new nlobjSearchColumn("shipdate"),   //�o�ד�
					   new nlobjSearchColumn("custbody_djkk_delivery_hopedate"),  //DJ_�[�i��]��
					   new nlobjSearchColumn("memo"), //���l
					   new nlobjSearchColumn("tranid"),   //�����ԍ� 
					   new nlobjSearchColumn("subsidiary"),   //�q���
					   new nlobjSearchColumn("location"),   //�ꏊ
					   new nlobjSearchColumn("custbody_djkk_shippinginstructdt"),   //�o�׎w������
					   new nlobjSearchColumn("shipmethod"),   //�z�����@
					   new nlobjSearchColumn("custbody_djkk_deliverytimedesc"),   //DJ_�[�����ԑыL�q
					   new nlobjSearchColumn("zip","shippingAddress",null), //ZIP
					   new nlobjSearchColumn("phone","shippingAddress",null),  //�d�b
					   new nlobjSearchColumn("entity"),  //�ڋq
					   new nlobjSearchColumn("address1","shippingAddress",null),//�Z��
					    
					]
				); 
			var shipdate= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getValue("shipdate"));//�o�ד�
			var hopedate= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getValue("custbody_djkk_delivery_hopedate"));//DJ_�[�i��]��
			var memo= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getValue("memo"));//���l
			var tranid= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getValue("tranid"));//�����ԍ� 
			var subsidiary= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getText("subsidiary"));//�q���
			var location= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getText("location"));//�ꏊ 
			var shippinginstructdt= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getValue("custbody_djkk_shippinginstructdt"));//�o�׎w������
			var shipmethod= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getText("shipmethod"));//�z�����@ 
			var deliverytimedesc= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getValue("custbody_djkk_deliverytimedesc"));//DJ_�[�����ԑыL�q
			var zip= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getValue("zip","shippingAddress",null));//ZIP
			var phone= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getValue("phone","shippingAddress",null));//phone
			var entity= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getValue("entity"));//�ڋq
			var address= defaultEmpty(isEmpty(soSearch) ? '' :  soSearch[0].getValue("address1","shippingAddress",null));//�Z��


			
			var customerSearch = nlapiSearchRecord("customer",null,
					[
					   ["internalid","anyof",entity]
					], 
					[
					   new nlobjSearchColumn("entityid").setSort(false),   //�ڋqID
					   new nlobjSearchColumn("companyname"),  //�ڋq��
					   new nlobjSearchColumn("custentity_djkk_activity"),     //DJ_�Z�N�V����
					   new nlobjSearchColumn("salesrep"),  //�̔����i���ВS���j
					]
					);
			var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//�ڋqID
			var companyname= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//�ڋq��
			var activity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_activity"));//DJ_�Z�N�V����
			var salesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//�̔����i���ВS���j
			
			
			
			soArray.push({
				shipdate:shipdate,  //�o�ד�
				hopedate:hopedate,  //DJ_�[�i��]��
				memo:memo,  //���l
				tranid:tranid, //�����ԍ� 
				subsidiary:subsidiary, //�q���
				location:location, //�ꏊ 
				shippinginstructdt:shippinginstructdt, //�o�׎w������
				shipmethod:shipmethod, //�z�����@ 
				deliverytimedesc:deliverytimedesc, //DJ_�[�����ԑыL�q
				zip:zip,  //ZIP
				phone:phone, //phone
				address:address, //�Z��
				entityid:entityid, //�ڋqID
				companyname:companyname, //�ڋq��
				activity:activity, //DJ_�Z�N�V����
				salesrep:salesrep, //�̔����i���ВS���j
				soId:soId,
			});
		}
		if(isEmpty(locationId)&&isEmpty(mailArr[locationId])){
			continue;
		}
		
		var count=stock.getLineItemCount('recmachcustrecord_djkk_ica_change');    //�s��
		for(var j=1;j<count+1;j++){
			var icaIcIdValue = stock.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_ic_id',j); //DJ_�a����݌ɔԍ�
			var icaItemValue = stock.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_item',j); //DJ_�a����݌�item
			var icaWarehouseValue = stock.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_warehouse',j); //DJ_�a����݌ɏꏊ
			var changereasonId=stock.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_changereason',j);  //�ύX���R
			var icaUnitText = stock.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_icl_unit',j);
			var icaAdjqty = stock.getLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_adjqty',j);
			var icaMemo = stock.getLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_memo',j);

			
			pdfExArr.push({
				icaIcIdValue:icaIcIdValue,
				icaItemValue:icaItemValue,
				icaWarehouseValue:icaWarehouseValue,
				changereasonId:changereasonId,
				icaUnitText:icaUnitText,
				icaAdjqty:icaAdjqty,
				icaMemo:icaMemo
			})
			
		}
		nlapiLogExecution('debug', '333', soId);
		var csvString = '';
		//���׏��
		csvString +='DJ_�a����݌�ID,DJ_�A�C�e��,DJ_�ꏊ,DJ_�ύX���R,DJ_�P��,�ڋq�z������,DJ_����\r\n';
		
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
		str+='<body padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">';  //soArr
			for(var m = 0;m<soArray.length;m++){
	//			var soData = soArray[soId];
				str+='<table>'+
			    '<tr>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td colspan="4"></td>'+
			    '<td style="font-size: 22px;font-weight: bold;text-decoration: underline;" align="center" colspan="4">�a����݌ɔz���`�[</td>'+
			    '<td colspan="2"></td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="1">'+soArray[m].tranid+'</td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" >N001:</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">'+soArray[m].subsidiary+'</td>'+
			    '<td></td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;"  colspan="2">�o�͓���</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:' + formatDateTime(new Date()) + '</td>'+
			    '<td ></td>' +
			    '<td style="vertical-align:middle;font-size: 13px" colspan="2"><pagenumber/>&nbsp;�y�[�W</td>' +
			    '</tr>'+
			    '<tr>'+
			    '<td></td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" >S001:</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">'+soArray[m].location+'</td>'+
			    '<td style="font-size: 13px;font-weight: bold;text-decoration: underline;" align="left" colspan="2">�a����݌ɔz���`�[</td>'+
			    '<td colspan="4"></td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td colspan="8"></td>'+
			    '<td>�o��</td>'+
			    '<td></td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">����y�[�W </td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;<pagenumber/></td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�o�׍�Ɣԍ�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;S545646546546546</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;&nbsp;�o�א����ԍ�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;S545646546546546</td>'+
		//	    '<td></td>'+
			    '<td colspan="2" rowspan="3">'+
			    '<table>'+
			    '<tr>'+
			    '<td style="width: 40px; height: 40px;border:1px solid #499AFF;"></td>'+
			    '<td style="width: 40px; height: 40px;border:1px solid #499AFF;"></td>'+
			    '<td style="width: 40px; height: 40px;border:1px solid #499AFF;"></td>'+
			    '</tr>'+
			    '</table>'+
			    '</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">����o�ד�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].shipdate+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�o�׎w���ԍ�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;S545646546546546</td>'+
			    '<td colspan="2" rowspan="2" align="left"><barcode codetype="code128" value="SO;' + soId + ';' + tranid + '"/></td>' +
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�o�ח\���</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].shippinginstructdt+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�������ԍ�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].tranid+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�z���`�[</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].shipmethod+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�͐�R�[�h</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].entityid+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�͐�X�֔ԍ�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].zip+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�͐�Z��</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].address+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�͐�d�b�ԍ�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].phone+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�͐�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].companyname+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�z���w���</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].hopedate+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�͐敔����</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].activity+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�z���w�莞�ԑ�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].deliverytimedesc+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�͐�S����</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].salesrep+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="2">���l</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="4">:&nbsp;'+soArray[m].memo+'</td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="3">&nbsp;&nbsp;NO.&nbsp;&nbsp;���i�R�[�h</td>'+
			    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="3">���i��</td>'+
			    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="8">**&nbsp;&nbsp;..�敪</td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;���l</td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;���׃t���[�F���A</td>'+
			    '</tr>'+
			    '</table>'+
			    '<table style="border-bottom: 1px solid black;" >'+
			    '<tr>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '<td></td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="4">�������P ���P�[�����R�[�h </td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">���b�g�ԍ� </td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�ܖ����� </td>'+
			    '<td colspan="4"></td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">���� </td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td colspan="4"></td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�ύڒn�敪</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�z�����x�敪</td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">���ː��L���敪 </td>'+
			    '<td colspan="2"></td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">()</td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td colspan="8"></td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="4">�o�[�R�[�h </td>'+
			    '</tr>'+
			    '</table>';
				for(var u = 0;u<soBody.length;u++){
					if(soArray[m].soId == soBody[u].soId){
								
						str+='<table style="border-bottom: 1px dotted black;border-collapse: collapse;">'+
						    '<tr>'+
						    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="3">&nbsp;&nbsp;NO.'+soBody[u].lineNo+'&nbsp;&nbsp;'+soBody[u].itemName+'</td>'+
						    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="3">'+soBody[u].displayname +'</td>'+
						    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="8">**&nbsp;&nbsp;..�敪</td>'+
						    '</tr>'+
						    '<tr>'+
						    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;���l</td>'+
						    '</tr>'+
						    '<tr>'+
						    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;���׃t���[�F���A</td>'+
						    '</tr>'+
							'</table>';
						str+=		
						    '<table style="border-bottom: 1px solid black;border-collapse: collapse;">' +
							'<tr>'+
							'<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="4">'+soBody[u].itemNo +' </td>'+
							'<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].serialnumbers +' </td>'+
							'<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].expirationdate +'</td>'+
							'<td colspan="5"></td>'+
							'<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].quantity +' </td>'+
						    '</tr>'+
						    '<tr>'+
						    '<td colspan="4"></td>'+
						    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].countryofmanufacture +'</td>'+
						    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+defaultEmpty(soBody[u].deliverytemptyp)+'</td>'+
						    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].classifi +'</td>'+
						    '<td colspan="2"></td>'+
						    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="3">()</td>'+
						    '</tr>'+
						    '<tr style="font-weight: bold;">'+
						    '<td colspan="9"></td>'+
						    '<td width="200px" align="right" colspan="3" rowspan="2" style="vertical-align:text-top;text-align:right"><barcode showtext="false" height="30" width="180" align="right" codetype="code128" value="'
							+soBody[u].soId+';'
							+soBody[u].lineNo+';'
							+soBody[u].item
							+'" /></td>' +
						    '</tr>'+
						    '</table>';
					}
				}
			}
			str += '<pbr/>';
			if(str.substring(str.length - 6) == '<pbr/>'){
				str = str.substring(0,str.length - 6);
			}
			str += '</body></pdf>';

		var renderer = nlapiCreateTemplateRenderer();
		renderer.setTemplate(str);
		var xml = renderer.renderToString();
		var xlsFile = nlapiXMLToPDF(xml);

		// PDF
		xlsFile.setName('�V���O���s�b�L���O���X�g���z���w��_�a����݌ɓ`�[���s' + '_' + getFormatYmdHms() + '.pdf');
		xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
		xlsFile.setIsOnline(true);
		
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		var files = new Array();
		files.push(nlapiLoadFile(fileID)); 
//		var fl = nlapiLoadFile(fileID);
		
		// csv file
		
		var xlsFile = nlapiCreateFile('�V���O���s�b�L���O���X�g���z���w��_�a����݌ɓ`�[' + '_' + getFormatYmdHms() + '.csv', 'CSV', csvString);
		xlsFile.setFolder(FILE_CABINET_ID_DJ_DEPOSIT_STOCK_DELIVERY_SLIP);
		xlsFile.setEncoding('SHIFT_JIS');
		var csvFileID = nlapiSubmitFile(xlsFile);
		if(!isEmpty(csvFileID)){
			files.push(nlapiLoadFile(csvFileID));
		}	
//		var records = new Object();
//		records['transaction'] = arr[i];
		nlapiSendEmail(nlapiGetUser(), mailArr[locationId], '�V���O���s�b�L���O���X�g���z���w��_�a����݌ɓ`�[���s', '�V���O���s�b�L���O���X�g���z���w��_�a����݌ɓ`�[���s', null, null, null, files);
//		nlapiSubmitField('customrecord_djkk_ic_change', arr[i], 'custrecord_djkk_ica_sendmail', 'T', false);		
		}
	
	nlapiLogExecution('debug', '', '�V���O���s�b�L���O���X�g���z���w��_�a����݌Ɋ���');
}
function defaultEmpty(src){
	return src || '';
}
function formatDate(dt){    //���ݓ���
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
}
function formatDateTime(dt){    //���ݓ���
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2) + ' ' + PrefixZero(dt.getHours(), 2) + ":" + PrefixZero(dt.getMinutes(), 2)) : '';
}
