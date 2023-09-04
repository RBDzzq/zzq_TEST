/**
 * DJ_�[�i��PDF
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
//	var flag = request.getParameter('flag');//page flag
	var flag = nlapiGetContext().getSetting('SCRIPT', 'custscriptinvoice');
//	nlapiLogExecution('error', 'flag', flag);
	if(flag == "invoice"){	
		var invoiceid = nlapiGetContext().getSetting('SCRIPT', 'custscriptinvoiceid_lu');
//		var invoiceid = request.getParameter('custscriptinvoiceid_lu');//invoice
//		nlapiLogExecution('error', 'invoiceid', invoiceid);
		var salesrepSearchColumn =  new nlobjSearchColumn("salesrep");//�ڋq(For retrieval)
		var subsidiarySearchColumn = new nlobjSearchColumn("subsidiary");//�A���q��� (For retrieval)
		var entitySearchColumn =  new nlobjSearchColumn("entity");//�ڋq(For retrieval)
		var tranidSearchColumn = new nlobjSearchColumn("tranid");//�������ԍ�
		var memoSearchColumn = new nlobjSearchColumn("memo");//memo
		var departmentSearchColumn = new nlobjSearchColumn("department");//�Z�N�V����
		var paymentConditionsColumn = new nlobjSearchColumn("custbody_djkk_payment_conditions");//�x������
		var otherrefnumSearchColumn =  new nlobjSearchColumn("otherrefnum");//��Д����ԍ�
		var transactionnumberSearchColumn = new nlobjSearchColumn("tranid","createdFrom",null);//�󒍔ԍ�(maybe not true)
		var deliveryCodeSearchColumn =  new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��R�[�h
		var deliveryNameSearchColumn = new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i�於�O
		var deliveryZipSearchColumn = new nlobjSearchColumn("custrecord_djkk_zip","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�X�֔ԍ�
		var deliveryPrefecturesSearchColumn = new nlobjSearchColumn("custrecord_djkk_prefectures","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�s���{��
		var deliveryMunicipalitiesSearchColumn = new nlobjSearchColumn("custrecord_djkk_municipalities","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�s�撬��
		var deliveryResidenceSearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��1
		var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_lable","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��2
		var deliveryResidence3SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��3
		var duedateSearchColumn = new nlobjSearchColumn("duedate");//���s��
		var deliveryDateSearchColumn = new nlobjSearchColumn("custbody_djkk_delivery_date");//DJ_�[�i��
	
		var column = [
					salesrepSearchColumn,
					memoSearchColumn,
					departmentSearchColumn,
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
					deliveryResidence3SearchColumn,
					deliveryDateSearchColumn
		             ]
		var invoiceSearch = nlapiSearchRecord("invoice",null,
				[
	//			   ["type","anyof","CustInvc"],
	//			   "AND",
				   ["internalid","anyof",invoiceid]
				], 
				column
				);
		var subsidiary = defaultEmpty(invoiceSearch[0].getValue(subsidiarySearchColumn));//�A���q���internalid (For retrieval)
		nlapiLogExecution('DEBUG', 'subsidiary', subsidiary);	
		var subsidiaryrSearch = nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",subsidiary]
				], 
				[
				 	new nlobjSearchColumn("legalname"),//�A����������
				 	new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),//�A��DJ_��Ж��O�p��
				 	new nlobjSearchColumn("fax"),//������pFAX
//				 	new nlobjSearchColumn("phone"), //�A��TEL?????
				 	new nlobjSearchColumn("custrecord_djkk_address_fax","Address",null), //�A��FAX
				    new nlobjSearchColumn("phone","Address",null),//�A��TEL
				 	new nlobjSearchColumn("custrecord_djkk_shippingdeliverynotice"),//DJ_�o�׈ē��E���i����[�i���o�͗p���m�点����
				]
				);
		var legalName = defaultEmpty(subsidiaryrSearch[0].getValue("legalname"));//�A����������
		var EnglishName = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_subsidiary_en"));//�A��DJ_��Ж��O�p��
		var Fax = 'FAX: ' + defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","Address",null));//�A��FAX
		var phone = 'TEL: ' + defaultEmpty(subsidiaryrSearch[0].getValue("phone","Address",null));//�A��TEL	
		var transactionFax = defaultEmpty(subsidiaryrSearch[0].getValue("fax"));//������pFAX
		var shippingdeliverynotice = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_shippingdeliverynotice"));//DJ_�o�׈ē��E���i����[�i���o�͗p���m�点����
		
		var entity = defaultEmpty(invoiceSearch[0].getValue(entitySearchColumn));//�ڋqinternalid(For retrieval)	
		var customerSearch = nlapiSearchRecord("customer",null,
				[
				   ["internalid","anyof",entity]
				], 
				[	
				 	new nlobjSearchColumn("billcity"),//�s��
				 	new nlobjSearchColumn("companyname"),//���O
				 	new nlobjSearchColumn("phone"),//phone
				 	new nlobjSearchColumn("fax"),//fax
				 	new nlobjSearchColumn("entityid"),//�ڋqcode
				 	new nlobjSearchColumn("zipcode","Address",null),
				 	new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//
				 	new nlobjSearchColumn("address1","Address",null),//
				 	new nlobjSearchColumn("address2","Address",null),//
				 	new nlobjSearchColumn("address3","Address",null),//
				 	new nlobjSearchColumn("addressee","Address",null)//	
				]
				);
		var customerRecord=nlapiLoadRecord('customer', entity);
		var paymentPeriodMonths = customerRecord.getLineItemValue("recmachcustrecord_suitel10n_jp_pt_customer","custrecord_suitel10n_jp_pt_paym_due_mo_display",1);//�x��������
		var customePhone = customerRecord.getLineItemValue("addressbook","phone",1);//p
		if(customerSearch != null){
			var companyName = defaultEmpty(customerSearch[0].getValue("companyname"));//�ڋq��
			var billcity = defaultEmpty(customerSearch[0].getValue("billcity"));//�s��
			var customerCode = defaultEmpty(customerSearch[0].getValue("entityid"));//�ڋqcode
			var customeFax = defaultEmpty(customerSearch[0].getValue("fax"));//�ڋqFAX
			nlapiLogExecution('DEBUG', 'customeFax', customeFax);
			var customePhone = defaultEmpty(customerSearch[0].getValue("phone"));//�ڋqTEL
			nlapiLogExecution('DEBUG', 'customePhone', customePhone);
		    var custZipCode = defaultEmpty(customerSearch[0].getValue("zipcode","Address",null));//�ڋq�X��
			if(custZipCode && custZipCode.substring(0,1) != '��'){
				custZipCode = '��' + custZipCode;
			}else{
				custZipCode = '';
			}
			var custState = defaultEmpty(customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//�ڋq�s���{��
			var custAddr1 = defaultEmpty(customerSearch[0].getValue("address1","Address",null));//�ڋq�Z���P
			var custAddr2 = defaultEmpty(customerSearch[0].getValue("address2","Address",null));//�ڋq�Z��2
			var custAddr3 = defaultEmpty(customerSearch[0].getValue("address3","Address",null));//�ڋq�Z��3
			var custAddressee = defaultEmpty(customerSearch[0].getValue("addressee","Address",null));//�ڋq����
		}	
		var tranid = defaultEmpty(invoiceSearch[0].getValue(tranidSearchColumn));//�������ԍ�
		var memo = defaultEmpty(invoiceSearch[0].getValue(memoSearchColumn));//������memo
		var salesrep =  defaultEmpty(invoiceSearch[0].getText(salesrepSearchColumn));//�c�ƒS����
		nlapiLogExecution('DEBUG', 'salesrep', salesrep);
		var department =  defaultEmpty(invoiceSearch[0].getText(departmentSearchColumn));//�Z�N�V����
		nlapiLogExecution('DEBUG', 'department', department);
		var otherrefnum = defaultEmpty(invoiceSearch[0].getValue(otherrefnumSearchColumn));//��Д����ԍ�
		var transactionnumber = defaultEmpty(invoiceSearch[0].getValue(transactionnumberSearchColumn));//�󒍔ԍ�(maybe not true)
		var deliveryCode = defaultEmpty(invoiceSearch[0].getValue(deliveryCodeSearchColumn));//DJ_�[�i�� : DJ_�[�i��R�[�h
		var deliveryName = defaultEmpty(invoiceSearch[0].getValue(deliveryNameSearchColumn));//DJ_�[�i�� : DJ_�[�i�於�O
		var deliveryZip = defaultEmpty(invoiceSearch[0].getValue(deliveryZipSearchColumn));//DJ_�[�i�� : DJ_�X�֔ԍ�
		if(deliveryZip && deliveryZip.substring(0,1) != '��'){
			deliveryZip = '��' + deliveryZip;
		}else{
			deliveryZip = '';
		}
		var deliveryPrefectures = defaultEmpty(invoiceSearch[0].getValue(deliveryPrefecturesSearchColumn));//DJ_�[�i�� : DJ_�s���{��
		var deliveryMunicipalities = defaultEmpty(invoiceSearch[0].getValue(deliveryMunicipalitiesSearchColumn));//DJ_�[�i�� : DJ_�s�撬��
		var deliveryResidence = defaultEmpty(invoiceSearch[0].getValue(deliveryResidenceSearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��1
		var deliveryResidence2 = defaultEmpty(invoiceSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��2
		var deliveryResidence3 = defaultEmpty(invoiceSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��3
		var duedate = defaultEmpty(invoiceSearch[0].getValue(duedateSearchColumn));//���s��
		var deliveryDate = defaultEmpty(invoiceSearch[0].getValue(deliveryDateSearchColumn));//DJ_�[�i��
		
		//�A�C�e�� 
		var itemIdArray = [];
		var itemDetails = [];
		var amountTotal = 0;
		var taxTotal = 0;
		var taxType = {};
		var invoiceRecord = nlapiLoadRecord("invoice",invoiceid)
		var Counts = invoiceRecord.getLineItemCount('item');//�A�C�e�����ו�
		if(Counts != 0) {
			for(var s = 1; s <=  Counts; s++){
				var item = defaultEmpty(invoiceRecord.getLineItemValue('item', 'item', s));//�A�C�e��ID
				var quantity = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item', 'quantity', s)));//����
//                var quantityFormat = 0;
//                if (quantity) {
//                    quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
//                }
				
				var units_display = defaultEmpty(invoiceRecord.getLineItemValue('item', 'units_display', s));//�P��
				
				var origrate = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'rate', s)));//�P��
				nlapiLogExecution('DEBUG', 'origrate', origrate);
				//var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
				var amount = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'amount', s)));//���z
				var amountNum = parseFloat(invoiceRecord.getLineItemValue('item', 'amount', s));
				nlapiLogExecution('DEBUG', 'amount', amount);
				//var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
				var taxRate = defaultEmpty(invoiceRecord.getLineItemValue('item', 'taxrate1', s));//�ŗ�
				
				var taxAmount = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'tax1amt', s)));//�Ŋz
				var taxAmountNum = parseFloat(invoiceRecord.getLineItemValue('item', 'tax1amt', s));
				nlapiLogExecution('DEBUG', 'taxAmount', taxAmount);
				//var taxAmountFormat = defaultEmptyToZero(taxAmount(invoiceRecord.getLineItemValue('item', 'tax1amt', s)));
				
				var itemSearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","anyof",item]
						], 
						[
						   new nlobjSearchColumn("itemid"),						   
						   new nlobjSearchColumn("displayname")
						]
						);	
				var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));
				displayname = displayname.replace(new RegExp("&","g"),"&amp;")
				var itemid = defaultEmpty(itemSearch[0].getValue('itemid'));
				amountTotal = amountTotal + amountNum;
				var amountTotalNEW = defaultEmptyToZero(amountTotal);
				nlapiLogExecution('DEBUG', 'amountTotalNEW', amountTotalNEW);
				taxTotal = taxTotal + taxAmountNum;
				var taxTotalNEW = defaultEmptyToZero(taxTotal);
				
				var taxRateData = taxType[taxRate] || 0;
				taxType[taxRate] = taxRateData + taxAmountNum + amountNum;
			

				
				itemDetails.push({
					  item : item,//�A�C�e��ID
					  units_display : units_display,//�P��
					  amount : amount,//���z
					  quantity : quantity,//����
					  origrate : origrate,//�P��
					  displayname:displayname,//���id��
					  itemid:itemid//���icode
				});
			}
		}
//		var amountTotalFormat = amountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//		
//		var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
//		var origrate = ifZero(defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'rate', s))));//�P��
		var headValue  = {
				salesrep:salesrep,//�c�ƒS����
				department:department,//�Z�N�V����
				legalName:legalName,//�A����������
				EnglishName:EnglishName,//�A��DJ_��Ж��O�p��
				transactionFax:transactionFax,//������pFAX
				phone:phone,//�A��TEL
				Fax:Fax,//�A��FAX
				paymentPeriodMonths:paymentPeriodMonths,//�x��������
				companyName :companyName,//�ڋq��
				customeFax:customeFax.substring(3),//�ڋqFAX
				billcity:billcity,//�s��
				customerCode:customerCode,//�ڋqcodeNum
				customePhone:customePhone.substring(3),//�ڋqTEL
			    custZipCode :custZipCode,//�ڋq�X��
				custState:custState,//�ڋq�s���{��
				custAddr1:custAddr1,//�ڋq�Z���P
				custAddr2:custAddr2,//�ڋq�Z���Q
				custAddr3:custAddr3,//�ڋq�Z��3
				custAddressee:custAddressee,//�ڋq����
				tranid:tranid,//�������ԍ�
				memo:memo, //������memo
				otherrefnum:otherrefnum,//��Д����ԍ�
				transactionnumber:transactionnumber,//�󒍔ԍ�(maybe not true)
				deliveryCode:deliveryCode,//DJ_�[�i�� : DJ_�[�i��R�[�h
				deliveryName :deliveryName,//DJ_�[�i�� : DJ_�[�i�於�O
				deliveryZip:deliveryZip,//DJ_�[�i�� : DJ_�X�֔ԍ�
				deliveryPrefectures :deliveryPrefectures,//DJ_�[�i�� : DJ_�s���{��
				deliveryMunicipalities: deliveryMunicipalities,//DJ_�[�i�� : DJ_�s�撬��
				deliveryResidence:deliveryResidence,//DJ_�[�i�� : DJ_�[�i��Z��1
				deliveryResidence2 :deliveryResidence2,//DJ_�[�i�� : DJ_�[�i��Z��2
				deliveryResidence3 :deliveryResidence3,//DJ_�[�i�� : DJ_�[�i��Z��
				duedate:duedate,//���s��
				deliveryDate:deliveryDate//DJ_�[�i��
				};
		var TotalForTaxEight = 0;
		var TotalForTaxTen = 0;
		for(var k in taxType){
			if(k == '8.0%'){
				 TotalForTaxEight = taxType[k];//�ŗ�8%�Őŋ����z
				 var TotalForTaxEightNew = defaultEmptyToZero(TotalForTaxEight);
			}else if(k == '10.0%'){
				 TotalForTaxTen = taxType[k];//�ŗ�10%�Őŋ����z
				 var TotalForTaxTenNew = defaultEmptyToZero(TotalForTaxTen);
			}
		}
		//var total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//���v(�ō�)
		var total01 = ( TotalForTaxEight + TotalForTaxTen );
		var total02 = defaultEmptyToZero(total01);
//		TotalForTaxEight = TotalForTaxEight.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//		TotalForTaxTen = TotalForTaxTen.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
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
		'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
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
		'<td colspan="3" rowspan="2" align="center" style="margin-left:25px;border-bottom: 4px black solid;vertical-align:bottom;font-size: 32px;letter-spacing: 35px;line-height:10%;">&nbsp;�[�i��</td>'+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:bottom">'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</td>'+
		''+
		'</tr>'+
		'<tr>'+
		''+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.phone+'�^������pFAX�F'+headValue.transactionFax+'</td>'+
		''+
		'</tr>'+
		'<tr>'+
		''+
		'<td colspan="3"></td>'+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.Fax+'</td>'+
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="3"></td>'+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-weight: 200;font-size:20px">&nbsp;&nbsp;�[�i�����S���җl</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="font-weight: 200;font-size:20px" colspan="2"></td>'+
		'<td colspan="5" style="font-weight: 200;font-size:20px"></td>'+
		'</tr>'+
		'<tr height="10px">'+
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;">���f�͊i�ʂ̂��������ėL��������܂��B���̓x�͂��������肪�Ƃ��������܂����B</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;border-bottom: 4px solid black;">���L�̒ʂ�[�i�v���܂����̂ŁA���������������B </td>'+
		'</tr>'+
		''+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<tr>'+
		'<td style="width: 65px;"></td>'+
		'<td style="width: 90px;"></td>'+
		'<td style="width: 100px;"></td>'+
		'<td style="width: 100px;"></td>'+
		'<td style="width: 100px;"></td>'+
		'<td style="width: 110px;"></td>'+
		'<td style="width: 95px;"></td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td >&nbsp;&nbsp;������F</td>'+
		'<td colspan="5">'+headValue.customerCode+'&nbsp;'+headValue.companyName+'</td>'+
		'<td align="right">'+'MS</td>'+
		'<td align="left"></td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td></td>'+
//		'<td></td>'+
		'<td colspan="5">�� &nbsp;'+headValue.custState+'&nbsp;&nbsp;&nbsp;'+headValue.billcity+headValue.custAddr1+headValue.custAddr2+headValue.custAddr3+'</td>'+
		'</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td style="width: 65px;border-bottom: 1px black solid;"></td>'+
		'<td style="width: 45px;border-bottom: 1px black solid;">Tel &nbsp;:</td>'+
		'<td style="width: 170px;border-bottom: 1px black solid;">'+headValue.customePhone+'</td>'+
		'<td style="width: 45px;border-bottom: 1px black solid;">Fax &nbsp;:</td>'+
		'<td colspan="3" style="border-bottom: 1px black solid;">'+headValue.customeFax+'</td>'+
		'</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		''+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td  colspan="1" style="width: 110px;border-top: 1px solid black;">&nbsp;&nbsp;�������ԍ��F&nbsp;&nbsp;'+headValue.tranid+'</td>'+
//		'<td style="width: 100px;border-top: 1px solid black;"></td>'+
		'<td colspan="2" style="width: 80px;border-top: 1px solid black;">'+salesrep+'</td>'+
		'<td width="60px" style="border-top: 1px solid black;">'+department+'</td>'+
		'<td width="100px" style="border-top: 1px solid black;">���s���F'+headValue.duedate+'</td>'+
		'<td colspan="2" style="border-top: 1px solid black;width:90px">���l&nbsp;:&nbsp;'+headValue.memo+'</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;�󒍔ԍ��F</td>'+
		'<td colspan="2">'+headValue.transactionnumber+'</td>'+
		'<td>&emsp;&emsp;�[�i���F</td>'+
		'<td>'+headValue.deliveryDate+'</td>'+
		'<td colspan="2"></td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;��Д����ԍ�</td>'+
		'<td colspan="2">'+headValue.otherrefnum+'</td>'+
		'<td>&emsp;&emsp;�[�i��F</td>'+
		'<td>'+headValue.deliveryCode+'</td>'+
		'<td colspan="2">'+headValue.deliveryName+'</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td style="vertical-align:top;">&nbsp;&nbsp;�x�������F</td>'+
		'<td colspan="2" style="vertical-align:top;">'+headValue.paymentPeriodMonths+'</td>'+
		'<td></td>'+
		'<td style="vertical-align:top;">'+headValue.deliveryZip+'</td>'+
		'<td border="0" colspan="2">'+headValue.deliveryPrefectures+'&nbsp;'+headValue.deliveryMunicipalities+headValue.deliveryPrefectures+headValue.deliveryResidence+headValue.deliveryResidence2+'</td>'+
		'</tr>'+
		'</table>'+
		'<table border="0" border-color="red" cellspacing="0" cellpadding="1" width="660px" align="center">'+
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
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">��&nbsp;&nbsp;��</td>'+
		'<td width="15px" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td colspan="2" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">����</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">�P��</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">���z</td>'+
		'</tr>'+
		'</table>'+
		'</macro>'+

		'<macro id="nlfooter">'+
		'<table border="0" cellspacing="1" cellpadding="0" align="center" width="660px" height="126px">'+
//		'<tr heigth="8px">'+
//		'<td width="150px"></td>'+
//		'<td width="170px"></td>'+
//		'<td width="90px"></td>'+
//		'<td width="170px"></td>'+
//		'<td width="80px"></td>'+
//		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;" heigth="35px">'+
		'<td width="150px" ></td>'+
		'<td width="170px" style="border-top:2px solid black"></td>'+
		'<td width="90px"  style="border-top:2px solid black;border-right:2px dotted black;"></td>'+
		'<td width="170px" style="border-top:2px solid black;line-height:21px">&nbsp;���v</td>'+
		'<td width="80px"  style="border-top:2px solid black;line-height:21px" align="right">'+amountTotalNEW+'</td>'+
		'</tr>'+
//		
//		'<tr heigth="8px">'+
//		'<td width="150px"></td>'+
//		'<td width="170px"></td>'+
//		'<td width="90px"></td>'+
//		'<td width="170px"></td>'+
//		'<td width="80px"></td>'+
//		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;" heigth="35px">'+
		'<td width="250px"></td>'+
		'<td width="150px">8% �Ώۍ��v(�ō�)</td>'+
		'<td width="70px" style="border-right:2px dotted black">'+TotalForTaxEightNew+'</td>'+
		'<td width="80px" style="line-height:14px">&nbsp;�����</td>'+
		'<td width="50px" style="line-height:14px" align="right">'+taxTotalNEW+'</td>'+
		'</tr>'+
//	
//		'<tr heigth="8px">'+
//		'<td width="150px"></td>'+
//		'<td width="170px"></td>'+
//		'<td width="90px"></td>'+
//		'<td width="170px"></td>'+
//		'<td width="80px"></td>'+
//		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;" heigth="35px">'+
		'<td width="250px" style="border-bottom:4px solid black">&nbsp;&nbsp;���y���ŗ��Ώ�</td>'+
		'<td width="150px" style="border-bottom:4px solid black">10%�Ώۍ��v(�ō�)</td>'+
		'<td width="70px"  style="border-bottom:4px solid black;border-right:2px dotted black">'+TotalForTaxTenNew+'</td>'+
		'<td width="80px"  style="border-bottom:4px solid black;line-height:10px">&nbsp;���v(�ō�)��</td>'+
		'<td width="50px"  style="border-bottom:4px solid black;line-height:8px" align="right">'+total02+'</td>'+
		'</tr>'+
		
		'<tr style="height:10px">'+
		''+
		'</tr>'+
		'<tr style="font-weight: bold;font-size: 15px;">'+
		/*******old******/
//		'<td colspan="5" align="center">���݁A�z�����[�h�^�C�����v���X�P���Ƃ����Ē����Ă���܂��B�ʏ탊�[�h�^�C���ɖ߂�ۂ�<br/>�A���߂Ă��A���\���グ�܂��B<br/>�R���i�E�B���X�������X�N�y���ɂ��A���Ѓe�����[�N�����ׁ̈A��ς����f�����|���v��<br/>�܂����A�������̒���낵�����肢�\���グ�܂��B</td>'+
		/*******old******/
		/*******new******/
		'<td colspan="5" align="center">'+shippingdeliverynotice+'</td>'+
		/*******new******/
		'</tr>'+
		'<tr>'+
		'<td colspan="5"></td>'+
		'</tr>'+
		'<tr style="font-weight: bold;font-size: 15px;">'+
		'<td colspan="5" align="center">***** �S<totalpages/>�y�[�W�F<pagenumber/>*****</td>'+
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
		str+='<body header="nlheader" header-height="26%" footer="nlfooter" footer-height="14%" padding="0.5in 0.5in 0.5in 0.5in" size="Letter" border="0px" border-color="blue">';
		str+=
			'<table border="0px" padding-top="14px">' +
			'<tr>'+
			'<td style="height:10px; width:8px;"></td>'+
			'<td width="90px"></td>'+
			'<td width="15px"></td>'+
			'<td width="125px"></td>'+
			'<td width="125px"></td>'+
			'<td width="60px"></td>'+
			'<td width="65px"></td>'+
			'<td></td>'+
			'<td></td>'+
			'</tr>';
			for(var k = 0 ; k < itemDetails.length;k++){
				str += '<tr style="font-weight: bold;font-size: 12px;height:30px">'+
				'<td></td>'+
				'<td style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
				'<td width="15px"></td>'+
				'<td colspan="2" style="vertical-align: top;">'+itemDetails[k].displayname+'</td>'+
				'<td style="vertical-align: top;" align="center">��</td>'+
				'<td style="vertical-align: top;">'+itemDetails[k].quantity+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
				'<td style="vertical-align: top;" align="center">'+itemDetails[k].origrate+'</td>'+
				'<td style="vertical-align: top;" align="center">'+itemDetails[k].amount+'</td>'+
				'</tr>';
//				'<tr style="font-weight: bold;font-size: 10px;height:20px">'+
//				'<td></td>'+
//				'<td style="vertical-align: top;">93482608</td>'+
//				'<td width="15px"></td>'+
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
	  }else if(flag == "creditmemo"){
		  
		var creditmemoid = request.getParameter('creditmemo');//invoice
		var creditmemoRecord = nlapiLoadRecord("creditmemo",creditmemoid)
		
		var salesrepSearchColumn =  new nlobjSearchColumn("salesrep");//�ڋq(For retrieval)
		var subsidiarySearchColumn = new nlobjSearchColumn("subsidiary");//�A���q��� (For retrieval)
		var entitySearchColumn =  new nlobjSearchColumn("entity");//�ڋq(For retrieval)
		var tranidSearchColumn = new nlobjSearchColumn("tranid");//�������ԍ�
		var memoSearchColumn = new nlobjSearchColumn("memo");//memo
		var otherrefnumSearchColumn =  new nlobjSearchColumn("otherrefnum");//��Д����ԍ�
		var transactionnumberSearchColumn = new nlobjSearchColumn("transactionnumber");//�󒍔ԍ�(maybe not true)
		var deliveryCodeSearchColumn =  new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��R�[�h
		var deliveryNameSearchColumn = new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i�於�O
		var deliveryZipSearchColumn = new nlobjSearchColumn("custrecord_djkk_zip","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�X�֔ԍ�
		var deliveryPrefecturesSearchColumn = new nlobjSearchColumn("custrecord_djkk_prefectures","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�s���{��
		var deliveryMunicipalitiesSearchColumn = new nlobjSearchColumn("custrecord_djkk_municipalities","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�s�撬��
		var deliveryResidenceSearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��1
		var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_�[�i�� : DJ_�[�i��Z��2
		var deliveryDateSearchColumn = new nlobjSearchColumn("custbody_djkk_delivery_date");//DJ_�[�i��
	
		var column = [
		              salesrepSearchColumn,
				      memoSearchColumn,
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
		              deliveryDateSearchColumn
		             ]
		var creditmemoSearch = nlapiSearchRecord("creditmemo",null,
				[
	//			   ["type","anyof","CustInvc"],
	//			   "AND",
				   ["internalid","anyof",creditmemoid]
				], 
				column
				);
		var subsidiary = defaultEmpty(creditmemoSearch[0].getValue(subsidiarySearchColumn));//�A���q���internalid (For retrieval)
		nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)	
		var subsidiaryrSearch = nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",subsidiary]
				], 
				[
				 	new nlobjSearchColumn("legalname"),//�A����������
				 	new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),//�A��DJ_��Ж��O�p��
				 	new nlobjSearchColumn("fax"),//������pFAX
//				 	new nlobjSearchColumn("phone"), //�A��TEL?????
				 	new nlobjSearchColumn("custrecord_djkk_address_fax","Address",null), //�A��FAX
				    new nlobjSearchColumn("phone","Address",null),//�A��TEL
				 	new nlobjSearchColumn("custrecord_djkk_shippingdeliverynotice"),//DJ_�o�׈ē��E���i����[�i���o�͗p���m�点����
				]
				);
		var legalName = defaultEmpty(subsidiaryrSearch[0].getValue("legalname"));//�A����������
		var EnglishName = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_subsidiary_en"));//�A��DJ_��Ж��O�p��
		var Fax = 'FAX: ' + defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","Address",null));//�A��FAX
		var phone = 'TEL: ' + defaultEmpty(subsidiaryrSearch[0].getValue("phone","Address",null));//�A��TEL	
		var transactionFax = defaultEmpty(subsidiaryrSearch[0].getValue("fax"));//������pFAX
		var shippingdeliverynotice = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_shippingdeliverynotice"));//DJ_�o�׈ē��E���i����[�i���o�͗p���m�点����
		
		var entity = defaultEmpty(creditmemoSearch[0].getValue(entitySearchColumn));//�ڋqinternalid(For retrieval)	
		nlapiLogExecution('DEBUG', 'entity', entity)
		var customerSearch = nlapiSearchRecord("customer",null,
				[
				   ["internalid","anyof",entity]
				], 
				[	
//				 	new nlobjSearchColumn("billcity"),//�s��
				 	new nlobjSearchColumn("city"),//�s��
				 	new nlobjSearchColumn("companyname"),//���O
				 	new nlobjSearchColumn("custentity_djkk_exsystem_phone_text"),//�ڋqTEL
				 	new nlobjSearchColumn("fax"),//fax
				 	new nlobjSearchColumn("entityid"),//�ڋqcode
				 	new nlobjSearchColumn("custentity_djkk_customer_payment"),//�x������
				 	new nlobjSearchColumn("zipcode","Address",null),
				 	new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//
				 	new nlobjSearchColumn("address1","Address",null),//
				 	new nlobjSearchColumn("address2","Address",null),//
				 	new nlobjSearchColumn("address3","Address",null),//
				 	new nlobjSearchColumn("addressee","Address",null)//	
				]
				);
		
		
		
//		var customerRecord=nlapiLoadRecord('customer', entity);
	if(!isEmpty(customerSearch)){
		var companyName = defaultEmpty(customerSearch[0].getValue("companyname"));//�ڋq��
		var billcity = defaultEmpty(customerSearch[0].getValue("city"));//�s��
		var customerCode = defaultEmpty(customerSearch[0].getValue("entityid"));//�ڋqcode
		var customeFax = defaultEmpty(customerSearch[0].getValue("fax"));//�ڋqFAX
		var customePhone = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_phone_text"));//�ڋqTEL
	    var custZipCode = defaultEmpty(customerSearch[0].getValue("zipcode","Address",null));//�ڋq�X��
		if(custZipCode && custZipCode.substring(0,1) != '��'){
			custZipCode = '��' + custZipCode;
		}else{
			custZipCode = '';
		}
		var custState = defaultEmpty(customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//�ڋq�s���{��
		var custAddr1 = defaultEmpty(customerSearch[0].getValue("address1","Address",null));//�ڋq�Z���P
		var custAddr2 = defaultEmpty(customerSearch[0].getValue("address2","Address",null));//�ڋq�Z���Q
		var custAddr3 = defaultEmpty(customerSearch[0].getValue("address3","Address",null));//�ڋq�Z��3
		var custAddressee = defaultEmpty(customerSearch[0].getValue("addressee","Address",null));//�ڋq����
		var paymentPeriod =  defaultEmpty(customerSearch[0].getText("custentity_djkk_customer_payment"));//�x������
	}
	nlapiLogExecution('DEBUG', '2')
	nlapiLogExecution('DEBUG', 'paymentPeriod',paymentPeriod)

		var memo =  defaultEmpty(creditmemoSearch[0].getValue(memo));//memo
		var salesrep =  defaultEmpty(creditmemoSearch[0].getText(salesrepSearchColumn));//�c�ƒS����
		var tranid = defaultEmpty(creditmemoSearch[0].getValue(tranidSearchColumn));//�������ԍ�
		var otherrefnum = defaultEmpty(creditmemoSearch[0].getValue(otherrefnumSearchColumn));//��Д����ԍ�
		var transactionnumber = defaultEmpty(creditmemoSearch[0].getValue(transactionnumberSearchColumn));//�󒍔ԍ�(maybe not true)
		var deliveryCode = defaultEmpty(creditmemoSearch[0].getValue(deliveryCodeSearchColumn));//DJ_�[�i�� : DJ_�[�i��R�[�h
		var deliveryName = defaultEmpty(creditmemoSearch[0].getValue(deliveryNameSearchColumn));//DJ_�[�i�� : DJ_�[�i�於�O
		var deliveryZip = defaultEmpty(creditmemoSearch[0].getValue(deliveryZipSearchColumn));//DJ_�[�i�� : DJ_�X�֔ԍ�
		if(deliveryZip && deliveryZip.substring(0,1) != '��'){
			deliveryZip = '��' + deliveryZip;
		}else{
			deliveryZip = '';
		}
		var deliveryPrefectures = defaultEmpty(creditmemoSearch[0].getValue(deliveryPrefecturesSearchColumn));//DJ_�[�i�� : DJ_�s���{��
		var deliveryMunicipalities = defaultEmpty(creditmemoSearch[0].getValue(deliveryMunicipalitiesSearchColumn));//DJ_�[�i�� : DJ_�s�撬��
		var deliveryResidence = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidenceSearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��1
		var deliveryResidence2 = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_�[�i�� : DJ_�[�i��Z��2
		var duedate = formatDate(new Date());//���s��
		var deliveryDate = defaultEmpty(creditmemoSearch[0].getValue(deliveryDateSearchColumn));//DJ_�[�i��
		
		//�A�C�e�� 
		var itemIdArray = [];
		var itemDetails = [];
		var amountTotal = 0;
		var taxTotal = 0;
		var taxType = {};
		nlapiLogExecution('DEBUG', '3')
		var Counts = creditmemoRecord.getLineItemCount('item');//�A�C�e�����ו�
		if(Counts != 0) {
			for(var s = 1; s <=  Counts; s++){
				var item = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'item', s));//�A�C�e��ID
				var quantity = defaultEmpty(parseInt(creditmemoRecord.getLineItemValue('item', 'quantity', s)));//����
				var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
				
				var units_display = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'units_display', s));//�P��
				
				var origrate = ifZero(defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'rate', s))));//�P��
				var amount = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'amount', s)));//���z
				var amountFormat = ifZero(amount);
				
				var taxRate = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'taxrate1', s));//�ŗ�
				
				var taxAmount = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'tax1amt', s)));//�Ŋz
				var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
				var itemSearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","anyof",item]
						], 
						[
						   new nlobjSearchColumn("itemid"),						   
						   new nlobjSearchColumn("displayname"), 
						   new nlobjSearchColumn("custitem_djkk_product_code")
						   
						]
						);	
				var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));
				var productCode = defaultEmpty(itemSearch[0].getValue('custitem_djkk_product_code'));//DJ_�J�^���O���i�R�[�h
				displayname = displayname.replace(new RegExp("&","g"),"&amp;")
				var itemid = defaultEmpty(itemSearch[0].getValue('itemid'));
				amountTotal += amount;
				taxTotal += taxAmount;
				
				var taxRateData = taxType[taxRate] || 0;
				taxType[taxRate] = taxRateData + taxAmount + amount;
			
				
				
				itemDetails.push({
					  item : item,//�A�C�e��ID
					  units_display : units_display,//�P��
					  amount : parseInt(amountFormat),//���z
					  quantity : parseInt(quantityFormat),//����
					  origrate : parseInt(origrate),//�P��
					  displayname:displayname,//���id��
					  productCode:productCode,//���icode
					  itemid:itemid//���icode
				});
			}
		}
		var amountTotalFormat = ifZero(parseInt(amountTotal));
		var headValue  = {
		salesrep:salesrep,//�c�ƒS����
		legalName:legalName,//�A����������
		EnglishName:EnglishName,//�A��DJ_��Ж��O�p��
		transactionFax:transactionFax,//������pFAX
		phone:phone,//�A��TEL
		Fax:Fax,//�A��FAX
		paymentPeriod:paymentPeriod,//DJ_�ڋq�x������
		companyName :companyName,//�ڋq��
		customeFax:customeFax,//�ڋqFAX
		billcity:billcity,//�s��
		customerCode:customerCode,//�ڋqcodeNum
		customePhone:customePhone,//�ڋqTEL
	    custZipCode :custZipCode,//�ڋq�X��
		custState:custState,//�ڋq�s���{��
		custAddr1:custAddr1,//�ڋq�Z���P
		custAddr2:custAddr2,//�ڋq�Z���Q
		custAddr3:custAddr3,//�ڋq�Z��3
		custAddressee:custAddressee,//�ڋq����
		tranid:tranid,//�������ԍ�
		otherrefnum:otherrefnum,//��Д����ԍ�
		transactionnumber:transactionnumber,//�󒍔ԍ�(maybe not true)
		deliveryCode:deliveryCode,//DJ_�[�i�� : DJ_�[�i��R�[�h
		deliveryName :deliveryName,//DJ_�[�i�� : DJ_�[�i�於�O
		deliveryZip:deliveryZip,//DJ_�[�i�� : DJ_�X�֔ԍ�
		deliveryPrefectures :deliveryPrefectures,//DJ_�[�i�� : DJ_�s���{��
		deliveryMunicipalities: deliveryMunicipalities,//DJ_�[�i�� : DJ_�s�撬��
		deliveryResidence:deliveryResidence,//DJ_�[�i�� : DJ_�[�i��Z��1
		deliveryResidence2 :deliveryResidence2,//DJ_�[�i�� : DJ_�[�i��Z��2
		duedate:duedate,//���s��
		deliveryDate:deliveryDate//DJ_�[�i��
		};
		var TotalForTaxEight = 0;
		var TotalForTaxTen = 0;
		for(var k in taxType){
			if(k == '8.0%'){
				 TotalForTaxEight = taxType[k];//�ŗ�8%�Őŋ����z
			}else if(k == '10.0%'){
				 TotalForTaxTen = taxType[k];//�ŗ�20%�Őŋ����z
			}
		}
		var total = TotalForTaxEight + TotalForTaxTen;//���v(�ō�)
		TotalForTaxEight = ifZero(parseInt(TotalForTaxEight));
		TotalForTaxTen = ifZero(parseInt(TotalForTaxTen));
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
		'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
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
		'<td colspan="3" rowspan="2" align="center" style="margin-left:25px;border-bottom: 4px black solid;vertical-align:bottom;font-size: 32px;letter-spacing: 35px;line-height:10%;">&nbsp;�[�i��</td>'+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:bottom">'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</td>'+
		''+
		'</tr>'+
		'<tr>'+
		''+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.phone+'�^������pFAX�F'+headValue.transactionFax+'</td>'+
		''+
		'</tr>'+
		'<tr>'+
		''+
		'<td colspan="3"></td>'+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.Fax+'</td>'+
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="3"></td>'+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-weight: 200;font-size:20px">&nbsp;&nbsp;�[�i�����S���җl</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="font-weight: 200;font-size:20px" colspan="2"></td>'+
		'<td colspan="5" style="font-weight: 200;font-size:20px"></td>'+
		'</tr>'+
		'<tr height="10px">'+
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;">���f�͊i�ʂ̂��������ėL��������܂��B���̓x�͂��������肪�Ƃ��������܂����B</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;border-bottom: 4px solid black;">���L�̒ʂ�[�i�v���܂����̂ŁA���������������B </td>'+
		'</tr>'+
		''+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<tr>'+
		'<td style="width: 65px;"></td>'+
		'<td style="width: 90px;"></td>'+
		'<td style="width: 100px;"></td>'+
		'<td style="width: 100px;"></td>'+
		'<td style="width: 100px;"></td>'+
		'<td style="width: 110px;"></td>'+
		'<td style="width: 95px;"></td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;������F</td>'+
		'<td colspan="5">'+headValue.companyName+'</td>'+//changed by zhou 20230208
		'<td align="center">I</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td></td>'+
		'<td>�� &nbsp;550-0002</td>'+
		'<td colspan="5">'+headValue.custState+'&nbsp;&nbsp;&nbsp;'+headValue.billcity+headValue.custAddr1+headValue.custAddr2+headValue.custAddr3+'</td>'+
		'</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td style="width: 65px;border-bottom: 1px black solid;"></td>'+
		'<td style="width: 50px;border-bottom: 1px black solid;">Tel</td>'+
		'<td style="width: 110px;border-bottom: 1px black solid;">'+headValue.customePhone+'</td>'+
		'<td style="width: 70px;border-bottom: 1px black solid;">Fax</td>'+
		'<td colspan="3" style="border-bottom: 1px black solid;">'+headValue.customeFax+'</td>'+
		'</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		''+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td style="width: 95px;border-top: 1px solid black;">&nbsp;&nbsp;�������ԍ��F</td>'+
		'<td style="width: 95px;border-top: 1px solid black;">'+headValue.transactionnumber+'</td>'+//20230208 changed by zhou 
		'<td style="width: 60px;border-top: 1px solid black;"><span></span><span style="margin-left: 15px;"></span></td>'+//20230208 changed by zhou 
		'<td width="60px" style="border-top: 1px solid black;">���s���F</td>'+
		'<td width="120px" style="border-top: 1px solid black;">'+headValue.duedate+'</td>'+
		'<td colspan="2" style="border-top: 1px solid black;">���l�F'+headValue.duedate+'</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;�󒍔ԍ��F</td>'+
		'<td colspan="2">'+headValue.transactionnumber+'</td>'+
		'<td>�[�i���F</td>'+
		'<td>'+headValue.deliveryDate+'</td>'+
		'<td colspan="2"></td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
//		'<td>&nbsp;&nbsp;��Д����ԍ�:</td>'+
		'<td colspan="3">��Д����ԍ�:'+headValue.otherrefnum+'</td>'+
		'<td>�[�i��F</td>'+
		'<td colspan="3">'+headValue.deliveryName+'</td>'+//changed by zhou 20230208
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td style="vertical-align:top;">&nbsp;&nbsp;�x�������F</td>'+
		'<td colspan="2" style="vertical-align:top;">'+headValue.paymentPeriod+'</td>'+
		'<td></td>'+
		'<td style="vertical-align:top;">'+headValue.deliveryZip+'</td>'+
		'<td colspan="2">'+headValue.deliveryPrefectures+'&nbsp;'+headValue.deliveryMunicipalities+headValue.deliveryPrefectures+headValue.deliveryResidence+headValue.deliveryResidence2+'</td>'+//20230208 changed by zhou
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
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">��&nbsp;&nbsp;��</td>'+
		'<td width="15px" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td colspan="2" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">����</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">�P��</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">���z</td>'+
		'</tr>'+
		'</table>'+
		'</macro>'+
		'<macro id="nlfooter">'+
		
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		'<td width="170px"></td>'+
		'<td width="80px"></td>'+
		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;">'+
		'<td width="150px" ></td>'+
		'<td width="170px" style="border-top:1px solid black"></td>'+
		'<td width="90px"  style="border-top:1px solid black;border-right:1px dotted black"></td>'+
		'<td width="170px" style="border-top:1px solid black">���v</td>'+
		'<td width="80px"  style="border-top:1px solid black">'+amountTotalFormat+'</td>'+
		'</tr>'+
		
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		'<td width="170px"></td>'+
		'<td width="80px"></td>'+
		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;">'+
		'<td width="250px">&nbsp;&nbsp;���y���ŗ��Ώ�</td>'+//changed by zhou 20230209
		'<td width="150px">8% �Ώۍ��v(�ō�)</td>'+
		'<td width="70px"  style="border-right:1px dotted black">'+TotalForTaxEight+'</td>'+
		'<td width="80px">�����</td>'+
		'<td width="50px">'+ifZero(parseInt(taxTotal))+'</td>'+
		'</tr>'+
	
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		'<td width="170px"></td>'+
		'<td width="80px"></td>'+
		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;heigth:30px;">'+
		'<td width="250px" style="border-bottom:4px solid black"></td>'+//changed by zhou 20230209
		'<td width="150px" style="border-bottom:4px solid black">10%�Ώۍ��v(�ō�)</td>'+
		'<td width="70px"  style="border-bottom:4px solid black;border-right:1px dotted black">'+TotalForTaxTen+'</td>'+
		'<td width="80px"  style="border-bottom:4px solid black">���v(�ō�)��</td>'+
		'<td width="50px"  style="border-bottom:4px solid black">'+ifZero(parseInt(total))+'</td>'+
		'</tr>'+
		
		'<tr style="height:10px">'+
		''+
		'</tr>'+
		'<tr style="font-weight: bold;font-size: 15px;">'+
		'<td colspan="5" align="center">'+shippingdeliverynotice+'</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="5"></td>'+
		'</tr>'+
		'<tr style="font-weight: bold;font-size: 15px;">'+
		'<td colspan="5" align="center">***** �S<totalpages/>�y�[�W�F<pagenumber/>*****</td>'+
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
		str+='<body header="nlheader" header-height="30%" footer="nlfooter" footer-height="28%" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';
		str+=
			'<table>'+
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
			'</tr>';
			for(var k = 0 ; k < itemDetails.length;k++){
				nlapiLogExecution('debug','start',itemDetails[k].displayname)
				str += '<tr style="font-weight: bold;font-size: 12px;height:40px">'+
				'<td></td>'+
				'<td style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
				'<td width="15px"></td>'+
				'<td colspan="2" style="vertical-align: top;">'+itemDetails[k].displayname+'</td>'+
				'<td style="vertical-align: top;" align="center">��</td>'+
				'<td style="vertical-align: top;">'+itemDetails[k].quantity+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
				'<td style="vertical-align: top;" align="center">'+itemDetails[k].origrate+'</td>'+
				'<td style="vertical-align: top;" align="center">'+itemDetails[k].amount+'</td>'+
				'</tr>'+
				'<tr style="font-weight: bold;font-size: 10px;height:20px">'+
				'<td></td>'+
				'<td style="vertical-align: top;">'+itemDetails[k].productCode+'</td>'+
				'<td width="15px"></td>'+
				'<td></td>'+
				'<td></td>'+
				'<td></td>'+
				'<td></td>'+
				'<td></td>'+
				'</tr>';
			}
			
			str+='</table>';
			
		str += '</body></pdf>';
		var renderer = nlapiCreateTemplateRenderer();
		  renderer.setTemplate(str);
		  var xml = renderer.renderToString();
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
}

//function formatAmount1(str) {
//    var tempStr = Number(str);
//    var str = String(tempStr);
//    var newStr = "";
//    var count = 0;
//    for (var i = str.length - 1; i >= 0; i--) {
//        if (count % 3 == 0 && count != 0) {
//            newStr = str.charAt(i) + "," + newStr;
//        } else {
//            newStr = str.charAt(i) + newStr;
//        }
//        count++;
//    }
//    str = newStr;
//
//    return str;
//}

function formatDate(dt){    //���ݓ���
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
}
function defaultEmpty(src){
	return src || '';
}
//function defaultEmptyToZero(src){
//	return src || 0;
//}

function defaultEmptyToZero(src){
  nlapiLogExecution('DEBUG', 'src', src);
  var tempStr = Number(src);
  nlapiLogExecution('DEBUG', 'tempStr', tempStr);
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

	// �V�X�e������
	var now = getSystemTime();

	var str = now.getFullYear().toString();
	str += (now.getMonth() + 1).toString();
	str += now.getDate() + "_";
	str += now.getHours();
	str += now.getMinutes();
	str += now.getMilliseconds();

	return str;
}