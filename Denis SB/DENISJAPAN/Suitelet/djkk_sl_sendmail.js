/**
 * DJ_�z���w��
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/07/09     CPC_��
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	var flag = 'F';
	var soid = request.getParameter('soid');
	var customerid = request.getParameter('customerid');
	var suspend_flag=request.getParameter('suspend_flag');
	var userid = request.getParameter('userid');
	
	if (!isEmpty(soid)) {
		try{
		var saleRecord = nlapiLoadRecord('salesorder', soid);
		var location = saleRecord.getFieldValue('location');
		var itemCounts = saleRecord.getLineItemCount('item');
		var locationArray = [];
		nlapiLogExecution('DEBUG', 'itemCounts', itemCounts);
		for(var s = 0; s < itemCounts; s++){
			var locationInLine  = saleRecord.getLineItemValue('item', 'location', s+1);//�ꏊ
			var deliverynote = saleRecord.getLineItemValue('item', 'custcol_djkk_payment_delivery', s+1);
			nlapiLogExecution('DEBUG', 'locationInLine', locationInLine);
			nlapiLogExecution('DEBUG', 'deliverynote', deliverynote);

			if(deliverynote == 'T'){
				if(locationArray.indexOf(locationInLine) < 0){
					locationArray.push(locationInLine);
				}
				nlapiLogExecution('DEBUG', 'locationInLine', locationInLine);

			}
		}
		var locationArrayJS = JSON.stringify(locationArray);
		nlapiLogExecution('DEBUG', 'locationArray', locationArrayJS);
		var entity=saleRecord.getFieldValue('entity');
		var setrecords = new Object();
		setrecords['transaction'] = soid;
		if (!isEmpty(location)) {
			if (!isEmpty(locationArray)) {
				var fileArray = new Array();
				var deliverynoteFlag = [];
				var itemCounts = saleRecord.getLineItemCount('item');
				if(itemCounts != 0){
					for(var s = 0; s < itemCounts; s++){
						var deliverynote = saleRecord.getLineItemValue('item', 'custcol_djkk_payment_delivery', s+1);
						var itemId=saleRecord.getLineItemValue('item', 'item', s+1);
						if(deliverynote == 'T'){
							deliverynoteFlag.push({deliverynote:deliverynote,itemId:itemId});
						}
					}
				}
				var debugDeliverynoteFlag = JSON.stringify(deliverynoteFlag);
				nlapiLogExecution('DEBUG', 'deliverynoteFlag', debugDeliverynoteFlag);
				if(!isEmpty(deliverynoteFlag)){
					var locationArrayJS = JSON.stringify(locationArray);
					nlapiLogExecution('DEBUG', 'locationArrayJS', locationArrayJS);
					for(var n = 0 ; n < locationArray.length ; n++){
						var locationInArray = locationArray[n];
						var locationSearch = nlapiSearchRecord("location",null,
								[
								   ["internalid","anyof",locationInArray], 
								], 
								[
								   new nlobjSearchColumn("name"),
								   new nlobjSearchColumn("custrecord_djkk_address_fax","address", null),
								   new nlobjSearchColumn("custrecord_djkk_mail", "address",null)
								]
								);
						var locationName = locationSearch[0].getValue("name");
						var publishDate = saleRecord.getFieldValue('trandate');//�쐬��&���͓�
						var deliveryDate = saleRecord.getFieldValue('custbody_djkk_delivery_date');//���s��&�[�i��
						// �[�i���������MPDF  �t�H�[�}�b�g����
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
						'td{'+
						'height: 30px;'+
						'}'+
						'</style>'+
						'</head>'+
						'<body padding="0.5in 0.5in 0.5in 0.5in" size="Letter">'+
						'<table cellspacing="0" border="0" cellpadding="0" style="width: 660px; border-collapse: collapse;margin: auto;">'+
						'<tr>'+
						'<td></td>'+
						'<td align="center" style="height: 30px;"><span style="color: #0054ac;font-size: 22px;">�[&nbsp;&nbsp;�i&nbsp;&nbsp;��&nbsp;&nbsp;��&nbsp;&nbsp;��&nbsp;&nbsp;��&nbsp;&nbsp;�M</span>'+
						'</td>'+
						'</tr>'+
						'<tr>'+
						'<td align="left" style="padding: 0;margin: 0;"><span style="color: black ;font-size: 8px;">�쐬��:'+publishDate+'</span></td>'+
						'<td align="center" style="height: 20px;"><span style="color: darkgray ;font-size: 8px;"></span></td>'+
						'<td align="right" style="padding: 0;margin: 0;vertical-align:top"><span style=" color: black ;font-size: 8px;">���s��:'+deliveryDate+'</span></td>'+
						'</tr>'+
						'<tr>'+
						'<td>&nbsp;</td>'+
						'</tr>'+
						'<tr>'+
						'<td></td>'+
						'<td align="center" style="font-size: 24px;font-weight: bold;">'+locationName+'</td>'+
						'</tr>'+
						'<tr>'+
						'<td>&nbsp;</td>'+
						'</tr>'+
						'</table>'+
						'<table cellspacing="0" border="0" cellpadding="0" style="width: 660px; border-collapse: collapse;margin: auto;">'+
						'<tr>'+
						'<td align = "center" style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 73.33px;font-size :9px">�A�C�e��</td>'+
						'<td align = "center" style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 73.33px;font-size :9px">���i��</td>'+
						'<td align = "center" style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 73.33px;font-size :9px">����</td>'+
						'<td align = "center" style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 73.33px;font-size :9px">�P��</td>'+
						'<td align = "center" style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 73.33px;font-size :9px">�P��</td>'+
						'<td align = "center" style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 73.33px;font-size :9px">���z</td>'+
						'<td align = "center" style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 73.33px;font-size :9px">�ŗ�</td>'+
						'<td align = "center" style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 73.33px;font-size :9px">�Ŋz</td>'+
						'<td align = "center" style ="vertical-align:center;border:1px solid #0054ac;border-bottom:none;width: 73.33px;font-size :9px">���v</td>'+
						'</tr>';
						if(itemCounts != 0){
							for(var s = 1; s < itemCounts+1; s++){
								var deliverynote = saleRecord.getLineItemValue('item', 'custcol_djkk_payment_delivery', s);//�A�C�e��ID
								var location = saleRecord.getLineItemValue('item', 'location', s);//�A�C�e��ID
								if(deliverynote == 'T' && location == locationInArray){
									var item=saleRecord.getLineItemValue('item', 'item', s);
									var itemSearch = nlapiSearchRecord("item",null,
											[
											   ["internalid","anyof",item]
											], 
											[
											   new nlobjSearchColumn("itemid"),						   
											   new nlobjSearchColumn("displayname")
											]
											);
									var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));//���i��
									var itemid = defaultEmpty(itemSearch[0].getValue('itemid'));//�A�C�e��id
									var quantity = defaultEmpty(parseFloat(saleRecord.getLineItemValue('item', 'quantity', s)));//����
									var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
									
									var units_display = defaultEmpty(saleRecord.getLineItemValue('item', 'units_display', s));//�P��
									
									var origrate = defaultEmptyToZero(parseFloat(saleRecord.getLineItemValue('item', 'rate', s)));//�P��
									var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
									
									var amount = defaultEmptyToZero(parseFloat(saleRecord.getLineItemValue('item', 'amount', s)));//���z
									var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
									
									var taxRate = defaultEmpty(saleRecord.getLineItemValue('item', 'taxrate1', s));//�ŗ�
									
									var taxAmount = defaultEmptyToZero(parseFloat(saleRecord.getLineItemValue('item', 'tax1amt', s)));//�Ŋz
									var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
									
									var grossamt = amount+taxAmount;//���v
									var grossamtFormat = grossamt.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

									str += '<tr>'+
									'<td  style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: auto;width: 73.33px;font-size :9px">'+itemid+'</td>'+
									'<td  style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: auto;width: 73.33px;font-size :9px">'+displayname+'</td>'+
									'<td  style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: auto;width: 73.33px;font-size :9px">'+quantityFormat+'</td>'+
									'<td  style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: auto;width: 73.33px;font-size :9px">'+units_display+'</td>'+
									'<td  style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: auto;width: 73.33px;font-size :9px">'+origrateFormat+'</td>'+
									'<td  style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: auto;width: 73.33px;font-size :9px">'+amountFormat+'</td>'+
									'<td  style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: auto;width: 73.33px;font-size :9px">'+taxRate+'</td>'+
									'<td  style ="vertical-align:center;border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: auto;width: 73.33px;font-size :9px">'+taxAmountFormat+'</td>'+
									'<td  style ="vertical-align:center;border:1px solid #0054ac;border-bottom:none;width: 73.33px;font-size :9px">'+grossamtFormat+'</td>'+
									'</tr>';
								}
							}
						}
						str += '<tr>'+
						'<td  colspan= "9" style ="border-top:1px solid #0054ac;width: auto;height: 0px;"></td>'+
						'</tr>'+
						'</table>'+
						'<table  cellspacing="0" border="0" cellpadding="0" style="width: 660px; border-collapse: collapse;margin: auto;"></table>'+
						'</body>'+
	 					'</pdf>';
	
						var renderer = nlapiCreateTemplateRenderer();
						renderer.setTemplate(str);
						var xml = renderer.renderToString();
						var xlsFile = nlapiXMLToPDF(xml);
	
						// PDF�t�@�C������ݒ肷��
						xlsFile.setName('DJ_�[�i���������MPDF'+ getFormatYmdHms() +'.pdf');
						xlsFile.setFolder(DELIVERYNOTE_FILE_CABINET_ID);
						xlsFile.setIsOnline(true);
						var fileID = nlapiSubmitFile(xlsFile);
						
						var loadingFile = nlapiLoadFile(fileID);
						
//						var locationSearch = nlapiSearchRecord("location", null, 
//						[ ["internalid", "anyof", locationInArray ] ], 
//						[new nlobjSearchColumn("custrecord_djkk_address_fax","address", null),
//						new nlobjSearchColumn("custrecord_djkk_mail", "address",null) ]);
						var fax = locationSearch[0].getValue("custrecord_djkk_address_fax", "address");
						var mails = locationSearch[0].getValue("custrecord_djkk_mail","address");
						nlapiLogExecution('DEBUG', 'mails', mails);
						fileArray.push(fileID);
						
						var fileList=new Array();
						fileList.push(loadingFile);
						//changed by geng add start
						var locationSearchId = [];
						var locationSearchArr = nlapiSearchRecord("location",null,
								[
								   ["name","contains","Keihin"]
								], 
								[
								   new nlobjSearchColumn("internalid"), 
								   new nlobjSearchColumn("name").setSort(false)
								]
								);
						for(var locationId = 0;locationId<locationSearchArr.length;locationId++){
							locationSearchId.push(locationSearchArr[locationId].getValue("internalid"));
						}
						if(locationSearchId.indexOf(saleRecord.getFieldValue('location'))>-1){
							fileList.push(createCsv(saleRecord));
						}
//						if(saleRecord.getFieldValue('location') == '7'){
//							fileList.push(createCsv(saleRecord));
//						}
						//changed by geng add end
						//Fax�@�\�ꎞ��~
//						if (!isEmpty(fax)) {
//							nlapiLogExecution('debug','aaaaa',fax);
////							var templete = nlapiLoadRecord('faxtemplate',custemailtmpl_notice_faxtemp_delivery_send);
////							var templete =  nlapiLoadRecord('emailtemplate',custemailtmpl_notice_mailtemp_delivery_send);
//							var mailRenderer = nlapiCreateTemplateRenderer();
////							var mailTemplate = templete.getFieldValue('content');
////							var title = templete.getFieldValue('subject');
//							var title = "�z���������M"
//							var mailTemplate = '<table border="0" cellpadding="0" cellspacing="0" width="100%">'+
//							'<tbody>'+
//							'<tr>'+
//							'<td>'+
//							'<table border="0" cellpadding="0" cellspacing="2">'+
//							'<tbody>'+
//							'<tr>'+
//							'<td>�z���������M</td>'+
//							'</tr>'+
//							'</tbody>'+
//							'</table>'+
//							'</td>'+
//							'</tr>'+
//							'<tr>'+
//							'<td>&nbsp;</td>'+
//							'</tr>'+
//							'</tbody>'+
//							'</table>'+
//							''+
//							'<table border="0" cellpadding="0" cellspacing="0" width="100%">'+
//							'<tbody>'+
//							'<tr>'+
//							'<td>&nbsp;</td>'+
//							'</tr>'+
//							'<tr>'+
//							'<td>&nbsp;</td>'+
//							'</tr>'+
//							'</tbody>'+
//							'</table>';
//							mailRenderer.setTemplate(mailTemplate);
//							mailRenderer.addRecord('transaction', saleRecord);
//							var body = mailRenderer.renderToString();
//							nlapiSendFax(userid, fax, title, body,setrecords,fileList);
//							flag = 'T';
//						}
						
						//���[�����M
						if (!isEmpty(mails)) {
							var templete2 = nlapiLoadRecord('emailtemplate',custemailtmpl_notice_mailtemp_delivery_send);
							var mailRenderer2 = nlapiCreateTemplateRenderer();
							var mailTemplate2 = templete2.getFieldValue('content');
							var title2 = templete2.getFieldValue('subject');
							mailRenderer2.setTemplate(mailTemplate2);
			
							mailRenderer2.addRecord('transaction', saleRecord);
							var body2 = mailRenderer2.renderToString();				
							nlapiSendEmail(userid, mails, title2, body2, null, null, setrecords, fileList);
							flag = 'T';
						}
					}
			}
				
				//�g�������킩��Ȃ�  start
				var itemCount=saleRecord.getLineItemCount('item');
				var itemArray=new Array();
				for(var it=1;it<itemCount+1;it++){
					var itemId=saleRecord.getLineItemValue('item', 'item', it);
//					if(saleRecord.getLineItemValue('item', 'custcol_djkk_included_document_flag', it)=='T' && saleRecord.getLineItemValue('item', 'custcol_djkk_payment_delivery', it) =='T'){
					if(saleRecord.getLineItemValue('item', 'custcol_djkk_payment_delivery', it) =='T'){
						itemArray.push(itemId);
					}
				}
				var debugItemArray = JSON.stringify(itemArray)
				nlapiLogExecution('DEBUG', 'itemArray', debugItemArray);
				if(!isEmpty(itemArray)){
					var itemFilesSearch = nlapiSearchRecord("customrecord_djkk_item_files",null,
							[
                            ["file.internalid","noneof","@NONE@"], 
                             "AND",
							   ["custrecord_djkk_file_item.internalid","anyof",itemArray]
							], 
							[
							   new nlobjSearchColumn("internalid","file",null)
							]
							);
					if (!isEmpty(itemFilesSearch)) {
		    			for (var j = 0; j < itemFilesSearch.length; j++) {
		    				fileArray.push(itemFilesSearch[j].getValue("internalid","file"));
		    			}
		    		}
				}
				//�g�������킩��Ȃ�  end
				if(flag == 'T'){
				nlapiSubmitField('salesorder', soid, 'custbody_djkk_shipping_instructions', 'T');
				}
				
			}
		}	
	}catch(e){
		flag = e;
	}
	if (flag == 'F') {
		response.write('F');
		nlapiLogExecution('debug', 'F');
	} else if(flag == 'T') {
		nlapiLogExecution('debug', 'T');
		response.write('T');
	}else{
		nlapiLogExecution('debug', flag);
		response.write(flag);
	}
	}
	if(!isEmpty(customerid)){
		var form=nlapiCreateForm('�o�ג�~', true);
		form.addButton('custpage_refresh', '�X�V', 'parent.location.reload();');
		try{
		var setrecords = new Object();
		setrecords['entity'] = customerid;
		var record=nlapiLoadRecord('customer', customerid);	
		if(suspend_flag=='T'){
		var salesrep=record.getFieldValue('salesrep');	
		var mailAddress=nlapiLookupField('employee', salesrep, 'email');
		var body=record.getFieldText('custentity_djkk_suspend_reason');
		body+=record.getFieldValue('custentity_djkk_suspend_reason_input');
		nlapiSendEmail(userid, mailAddress, '�o�ג�~', body, null, null, setrecords, null);
		nlapiSubmitField('customer', customerid, 'custentity_djkk_shipping_suspend_flag', 'T');
		form.addField('custpage_lable1', 'label', '�o�ג�~�����B');
		}else if(suspend_flag=='F'){
			var mailAddress=mail_address_shipmentback;
			var body=record.getFieldText('custentity_djkk_reinstate_reason');
			body+=record.getFieldValue('custentity_djkk_reinstate_reason_input');
			nlapiSendEmail(userid, mailAddress, '�o�׉�', body, null, null, setrecords, null);
			nlapiSubmitField('customer', customerid, 'custentity_djkk_shipping_suspend_flag', 'F');
			form.addField('custpage_lable2', 'label', '�o�׉񕜊����B');
		}
		}catch(e2){
			form.addField('custpage_lable3', 'label', '���[���̑��M�Ɏ��s���܂����B'+e2.message);
		}
		response.writePage(form);
	}
}

function createCsv(soObj){
	
//	var str = '';
//	str+= '�A�C�e��,�ꏊ,����,�P��,���z\r\n';
//	for(var i = 0 ; i < so.getLineItemCount('item');i++){
//		var item = so.getLineItemValue('item', 'item', i+1);
//		var location = so.getLineItemText('item', 'location', i+1);
//		var quantity = so.getLineItemValue('item', 'quantity', i+1);
//		var rate = so.getLineItemValue('item', 'rate', i+1);
//		var amount = so.getLineItemValue('item', 'amount', i+1);
//		str+=item+','+location+','+quantity+','+rate+','+amount+'\r\n';
//	}
	
	var str='�s�g�p,���Ə�����,����Һ���,�s�g�p,�s�g�p,�s�g�p,�I�[�_�[�ԍ�,�I�[�_�[�ԍ��s,�s�g�p,�o�ד�,�[�i��,�s�g�p,�[�i��Z��,�[�i�於��,�[�i��d�b�ԍ�,�[�i��X�֔ԍ�,�s�g�p,�^���ֺ���,�ݕ��ԍ�,';
	str+='�ו��ԍ��i���b�g�ԍ��j,�s�g�p,�s�g�p,�q��,�i��,��,�[��,����,�Г��L��,�ЊO�L��,���ה��l,�f�[�^�쐬��,�\���P�i��z�֒��w��j,�\���Q�i��������v���z�j,�\���R�i�x�������j,�\���S�i���b�g�j,�\���T�i�q�ɃR�[�h�j\r\n';


		var depositor = defaultEmpty(soObj.getFieldValue('custbody_djkk_depositor'));//DJ_�����
		var transactionnumber = defaultEmpty(soObj.getFieldValue('transactionnumber'));//�g�����U�N�V�����ԍ�
//		�[�i��.DJ_�s���{���{�[�i��.DJ_�s�撬���{�[�i��.DJ_�[�i��Z��1�{�[�i��.DJ_�[�i��Z��2
		var deliveryId = soObj.getFieldValue('custbody_djkk_delivery_destination');//DJ_�[�i��
		var deliveryAll ='';
		var name = '';
		var phone = '';
		var zip = '';
		if(!isEmpty(deliveryId)){
			var deliveryObj = nlapiLoadRecord('customrecord_djkk_delivery_destination',deliveryId);
			var prefectures = deliveryObj.getFieldValue('custrecord_djkk_prefectures');//�[�i��.DJ_�s���{��
			var municipalities = deliveryObj.getFieldValue('custrecord_djkk_municipalities');//�[�i��.DJ_�s�撬��
			var residence = deliveryObj.getFieldValue('custrecord_djkk_delivery_residence');//�[�i��.DJ_�[�i��Z��1
			var residenceTwo = deliveryObj.getFieldValue('custrecord_djkk_delivery_residence2');//�[�i��.DJ_�[�i��Z��2
			 deliveryAll = prefectures+municipalities+residence+residenceTwo;
			 name = deliveryObj.getFieldValue('custrecorddjkk_name');//�[�i��.���O
			 phone = deliveryObj.getFieldValue('custrecord_djkk_delivery_phone_number');//'�[�i��.DJ_�[�i��d�b�ԍ�
			 zip = deliveryObj.getFieldValue('custrecord_djkk_zip');//�[�i��.DJ_�X�֔ԍ�
		}
		var sowmsmemo = defaultEmpty(soObj.getFieldValue('custbody_djkk_de_sowmsmemo'));//DJ_�[�i�撍�����q�Ɍ������l
		var memo = defaultEmpty(soObj.getFieldValue('memo'));//����
		var trandate = soObj.getFieldValue('trandate');//�쐬���t
		var shippingCompany = soObj.getFieldValue('custbody_djkk_shipping_company');//DJ_�^�����
		var shippingVal = '';
		if(isEmpty(shippingCompany)){
			shippingVal = '';
		}else{
			shippingVal = nlapiLookupField('customrecord_djkk_shippingcompany_mst',shippingCompany,'custrecord_djkk_shippingcompany_code');
		}
		var deliveryTimeObj = defaultEmpty(soObj.getFieldValue('custbody_djkk_delivery_time_zone'));//DJ_�z�B�w�莞�ԑ�(����p)
		var deliverytime='';
		if(isEmpty(deliveryTimeObj)){
			deliverytime='';
		}else{
			deliverytime = nlapiLookupField('customrecord_djkk_csv_group',deliveryTimeObj,'custrecord9');
		}
		var payment = defaultEmpty(soObj.getFieldText('custbody_djkk_payment_conditions'));//DJ_�x�����@
		var total = '';
		var number = ''
		if(payment=='�����'){
			total = soObj.getFieldValue('total');//���v
			number = '01';
		}else{
			total = '0';
			number='00';
		}		
		var soCount = soObj.getLineItemCount('item');
		for(var a=1;a<soCount+1;a++){
			var item = soObj.getLineItemValue('item','item',a);
			var itemName = defaultEmpty(soObj.getLineItemText('item','item',a));//SO.����.�A�C�e��.�A�C�e�����O
			var itemShipDate = soObj.getLineItemValue('item','custcol_djkk_ship_date',a);//SO.����.�o�ד�
			var itemDeliDate = soObj.getLineItemValue('item','custcol_djkk_delivery_date',a);//SO.����.�[�i��
			var itemLine = a;//'���C���ԍ�
			var itemCode =itemName; //SO.����.�A�C�e��.�A�C�e���R�[�h
			var itemQuantity = Number(soObj.getLineItemValue('item','quantity',a));//�A�C�e��.����
			var itemLocation = soObj.getLineItemText('item','location',a);//SO.����.�q��.���O
			var pushnumber = Number(nlapiLookupField('item',item,'custitem_djkk_perunitquantity'));//SO.����.�A�C�e��.����
			var Numvalue = Number(itemQuantity)%Number(pushnumber);//SO.����.�A�C�e��.���ʁ�SO.����.�A�C�e��.����
			var itemsowmsmemo = defaultEmpty(soObj.getLineItemValue('item','custcol_djkk_item_sowmsmemo',a));//SO.
			
			soObj.selectLineItem('item',a);
			var inventoryDetail=soObj.editCurrentLineItemSubrecord('item','inventorydetail');
			if(!isEmpty(inventoryDetail)){
				var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
				var item = inventoryDetail.getFieldValue('item');
				nlapiLogExecution('debug','inventoryDetailCount', inventoryDetailCount);
				if(inventoryDetailCount != 0){
					for(var i = 1 ;i < inventoryDetailCount+1 ; i++){
						inventoryDetail.selectLineItem('inventoryassignment',i);
						var lotnumber='';
				    	var receiptinventorynumber = inventoryDetail.getLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code',i);
				    	var contoralnumber = inventoryDetail.getLineItemValue('inventoryassignment', 'custrecord_djkk_control_number',i);
				    	var lotSeryNum = inventoryDetail.getLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code',i);
				    	
				    	if(isEmpty(receiptinventorynumber)){
				    		lotnumber=contoralnumber
				    	}else{
				    		lotnumber=receiptinventorynumber
				    	}
				    	str+=''+','+'4035'+','+replace(depositor)+','+''+','+''+','+''+','+replace(transactionnumber)+','+itemLine+','+'000'+','+itemShipDate+','+itemDeliDate+','+
				    	''+','+replace(deliveryAll)+','+replace(name)+','+phone+','+zip+','+''+','+shippingVal+','+replace(itemCode)+','+lotnumber+','+''+','+''+','+'44'+','+replace(itemName)+','+itemQuantity+
				    	','+Numvalue+','+pushnumber+','+replace(sowmsmemo)+','+replace(memo)+','+replace(itemsowmsmemo)+','+trandate+','+deliverytime+','+total+','+number+','+lotSeryNum+','+replace(itemLocation)+'\r\n';
					}
				}
			}
		}	
	
	var xlsFile = nlapiCreateFile('�P�C�q���q�ɏo�׎w��' + '_' + getFormatYmdHms() + '.csv', 'CSV', str);
	
	xlsFile.setFolder(FILE_CABINET_ID_KEIHIN_SHIPPING);
	xlsFile.setName('�P�C�q���q�ɏo�׎w��' + '_' + getFormatYmdHms() + '.csv');
	xlsFile.setEncoding('SHIFT_JIS');
    
	// save file
	var fileID = nlapiSubmitFile(xlsFile);
	return nlapiLoadFile(fileID);
	 
}
function defaultEmptyToZero(src){
	return src || 0;
}
function defaultEmpty(src){
	return src || '';
}
function replace(text)
{
if ( typeof(text)!= "string" )
   text = String(text);

text = text.replace(/,/g, "_") ;

return text ;
}