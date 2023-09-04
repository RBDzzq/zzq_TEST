/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Aug 2021     
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */

function scheduled(type) {
//	nlapiLogExecution('debug', '', 'DJ_�ݸ���߯�ݸ�ؽā��z���`�[���s�J�n');
	var str1 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_delivery_slip_iss2');
	var jobParam = JSON.parse(str1);
	var type = jobParam.type;
	var jobId = jobParam.jobId;
	if(type == 'savePDF'){
		var str2 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_delivery_slip_iss3');
		var str3 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_delivery_slip_iss4');
		var strArr = str2.split(',');
		var pdfData = JSON.parse(str3);	
		var fileIdPdf = savePdf(pdfData); 	//�ݸ���߯�ݸ�ؽ�PDF
		var fileIdTwoPdf = savePdfTwo(pdfData);//�o�׎w����PDF
		var fileIdThreePdf = savePdfThree(pdfData);//�z���˗���PDF
		var deliveryPdf = savedeliveryPDF(pdfData);  //�[�i��PDF
		var poDataMain = {
				pdfData:pdfData,
				strArr:strArr
		}
		var str_poDataMain =  JSON.stringify(poDataMain)
		var csvValue = createCsv(pdfData);
		var csvId=csvDown(csvValue);
		var send = nlapiCreateRecord('customrecord_djkk_delivery_slip_iss');
		send.setFieldValue('custrecord_soid',jobId);
		send.setFieldValue('custrecord_so_detail',str_poDataMain);
		send.setFieldValue('custrecord_so_pdf',fileIdPdf);
		send.setFieldValue('custrecord_so_csv',csvId);	
		send.setFieldValue('custrecord_so_pdf_two',fileIdTwoPdf);	
		send.setFieldValue('custrecord_so_pdf_three',fileIdThreePdf);	
		send.setFieldValue('custrecord_so_pdf_four',deliveryPdf);	
		var id = nlapiSubmitRecord(send);
	
	}else if(type == 'sendEmail'){
		
		var jobSearch = nlapiSearchRecord("customrecord_djkk_delivery_slip_iss",null,
				[
				   ["custrecord_soid","is",jobId]
				], 
				[

				   new nlobjSearchColumn("custrecord_soid"), 
				   new nlobjSearchColumn("custrecord_so_detail"), 
				   new nlobjSearchColumn("custrecord_so_pdf"), 
				   new nlobjSearchColumn("custrecord_so_csv"),
				   new nlobjSearchColumn("custrecord_so_pdf_two"),
				   new nlobjSearchColumn("custrecord_so_pdf_three"),
				   new nlobjSearchColumn("custrecord_so_pdf_four")
				]
				);
		var jobId = jobSearch[0].getValue("custrecord_soid");
		var pdf_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf"));//�ݸ���߯�ݸ�ؽ�PDF
		var pdfTwo_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf_two"));//�o�׎w����
		var pdfThree_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf_three"));//�z���˗���PDF
		var deliveryPdf = parseInt(jobSearch[0].getValue("custrecord_so_pdf_four"));//�[�i��PDF
		var csv_fileid = parseInt(jobSearch[0].getValue("custrecord_so_csv"));
		var str_poDataMain = jobSearch[0].getValue("custrecord_so_detail");
//		
		var poDataMain = JSON.parse(str_poDataMain);
		var pdfDataOne = poDataMain.pdfData;
		var valueTotal = pdfDataOne.valueTotal;
		var strArr = poDataMain.strArr;
		
		var locationArr = new Array();
		var soArr = new Array();
		for(var k = 0 ; k < valueTotal.length ; k++){
			var locationId = valueTotal[k].so_location;
			var soId = valueTotal[k].so_id;
			locationArr.push(locationId);
			soArr.push(soId);
		}

		var locationSearch = nlapiSearchRecord("location",null,
				[
				 "internalid","anyof",locationArr
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
				   new nlobjSearchColumn("internalid"),
				   new nlobjSearchColumn("name")
				]
				);
		var mailArr = new Array();
		var records = new Object();
		locationArr = new Array()
		if(!isEmpty(locationSearch)){
			for(var i = 0 ; i < locationSearch.length ; i++){
				mailArr[0] = locationSearch[i].getValue("custrecord_djkk_mail","address",null);
				locationArr = locationSearch[i].getValue("name");

				if(!isEmpty(mailArr[0])){
						if(locationArr.indexOf("Keihin")>-1){
							nlapiSendEmail(nlapiGetUser(), mailArr[0], 'DJ_�ݸ���߯�ݸ�ؽā��z���`�[���sCSV', '�ݸ���߯�ݸ�ؽā��z���`�[���sCSV', null, null, null, nlapiLoadFile(csv_fileid));
						}
						if(locationArr.indexOf('DPKK')>-1){
							nlapiSendEmail(nlapiGetUser(), mailArr[0], 'DJ_�o�׎w�}��', 'DJ_�o�׎w�}���`�[���s', null, null, null, nlapiLoadFile(pdfTwo_fileid));
							nlapiSendEmail(nlapiGetUser(), mailArr[0], 'DJ_�ݸ���߯�ݸ�ؽā��z���`�[���s', '�ݸ���߯�ݸ�ؽā��z���`�[���s', null, null, null, nlapiLoadFile(pdf_fileid));
						}
						if(locationArr.indexOf("Keihin")<0 && locationArr.indexOf("DPKK")<0){
							nlapiSendEmail(nlapiGetUser(), mailArr[0], 'DJ_�z���˗���', 'DJ_�z���˗����`�[���s', null, null, null, nlapiLoadFile(pdfThree_fileid));
						}
						nlapiSendEmail(nlapiGetUser(), mailArr[0], 'DJ_�[�i��', 'DJ_�[�i���������M', null, null, null, nlapiLoadFile(deliveryPdf));
			
				}else{
					nlapiLogExecution('DEBUG', '', '���[���A�h���X���݂��Ȃ����ߑ��M�ł��܂���ł����B');
				}	
			}
		}else{
			nlapiLogExecution('DEBUG', '', '�q�ɂ𑶍݂��Ȃ����߁A�����I��');
		}	
		for(var j = 0 ; j < soArr.length ; j++){
			nlapiSubmitField('salesorder', soArr[j], 'custbody_djkk_shippinglist_sended', 'T', false);
		}
			
	}
}

function createCsv(pdfData){
	var str='�s�g�p,���Ə�����,����Һ���,�s�g�p,�s�g�p,�s�g�p,�I�[�_�[�ԍ�,�I�[�_�[�ԍ��s,�s�g�p,�o�ד�,�[�i��,�s�g�p,�[�i��Z��,�[�i�於��,�[�i��d�b�ԍ�,�[�i��X�֔ԍ�,�s�g�p,�^���ֺ���,�ݕ��ԍ�,';
	str+='�ו��ԍ��i���b�g�ԍ��j,�s�g�p,�s�g�p,�q��,�i��,��,�[��,����,�Г��L��,�ЊO�L��,���ה��l,�f�[�^�쐬��,�\���P�i��z�֒��w��j,�\���Q�i��������v���z�j,�\���R�i�x�������j,�\���S�i���b�g�j,�\���T�i�q�ɃR�[�h�j\r\n';
	var valueTotal = pdfData.valueTotal;	
	var headAllArr = [];
	var headValueArr = [];
	var itemAllArr = [];
	var itemValueArr=[];
	var itemdetailValue = [];
	var itemdetailArr = []
	for(var k = 0; k < valueTotal.length; k ++){
		var soId = valueTotal[k].so_id;
		var soObj = nlapiLoadRecord('salesorder', soId);
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
			var itemLineNum = '';
			if(String(itemLine).length==1){
				itemLineNum='0'+'0'+itemLine;
			}else if(String(itemLine).length==2){
				itemLineNum='0'+itemLine;
			}else if(String(itemLine).length==3){
				itemLineNum=itemLine;
			}
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

				    	str+=''+','+'4035'+','+replace(depositor)+','+''+','+''+','+''+','+replace(transactionnumber)+','+itemLineNum+','+'000'+','+itemShipDate+','+itemDeliDate+','+
				    	''+','+replace(deliveryAll)+','+replace(name)+','+phone+','+zip+','+''+','+shippingVal+','+replace(itemCode)+','+lotnumber+','+''+','+''+','+'44'+','+replace(itemName)+','+itemQuantity+
				    	','+Numvalue+','+pushnumber+','+replace(sowmsmemo)+','+replace(memo)+','+replace(itemsowmsmemo)+','+trandate+','+deliverytime+','+total+','+number+','+lotSeryNum+','+replace(itemLocation)+'\r\n';
					}
				}
			}
		}
	}	
		return str;
}
function pdf(pdfData){	
	var valueTotal = pdfData.valueTotal;
	var soArray = new Array();
	var soBody = new Array();
	var inventoryDetailArr = new Array();
	for(var z = 0; z < valueTotal.length; z ++){
		governanceYield();
		var soId = valueTotal[z].so_id;
		if(isEmpty(soId)){
			continue;
		}
		var location =valueTotal[z].so_location;
		var locationSearch = nlapiSearchRecord("location",null,
				[
				 "internalid","anyof",location
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
				   new nlobjSearchColumn("internalid"),
				   new nlobjSearchColumn("name")
				]
				);
		var locationName = locationSearch[0].getValue("name");;
//		if(locationName.indexOf('DPKK')>-1){
			nlapiLogExecution('DEBUG', 'pdf', 'pdf');
			var soRecord = nlapiLoadRecord('salesorder', soId);
			var shipdate = defaultEmpty(soRecord.getFieldValue('shipdate'));//�o�ד�
			var hopedate = defaultEmpty(soRecord.getFieldValue('custbody_djkk_delivery_hopedate'));//DJ_�[�i��]��
			var memo = defaultEmpty(soRecord.getFieldValue('memo'));//���l
			var tranid = defaultEmpty(soRecord.getFieldValue('tranid'));//�����ԍ� 
			var subsidiary = defaultEmpty(soRecord.getFieldText('subsidiary'));//�q���
			var location = defaultEmpty(soRecord.getFieldText('location'));//�ꏊ 
			var shippinginstructdt = defaultEmpty(soRecord.getFieldValue('custbody_djkk_shippinginstructdt'));//�o�׎w������
			var shipmethod = defaultEmpty(soRecord.getFieldText('shipmethod'));//�z�����@ 
			var deliverytimedesc = defaultEmpty(soRecord.getFieldValue('custbody_djkk_deliverytimedesc'));//DJ_�[�����ԑыL�q
			var entity = defaultEmpty(soRecord.getFieldValue('entity'));//�ڋq    
			
			var customerSearch = nlapiSearchRecord("customer",null,
					[
					   ["internalid","anyof",entity]
					], 
					[
					   new nlobjSearchColumn("entityid").setSort(false),   //�ڋqID
					   new nlobjSearchColumn("companyname"),  //�ڋq��
					   new nlobjSearchColumn("custentity_djkk_activity"),     //DJ_�Z�N�V����
					   new nlobjSearchColumn("salesrep"),  //�̔����i���ВS���j
					   new nlobjSearchColumn("address2","billingAddress",null), //������Z��1
					   new nlobjSearchColumn("phone"), //�d�b�ԍ�
					   new nlobjSearchColumn("zipcode","billingAddress",null), //������X�֔ԍ�
					]
					);
			var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//�ڋqID
			var companyname= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//�ڋq��
			var activity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_activity"));//DJ_�Z�N�V����
			var salesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//�̔����i���ВS���j
			var zip= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//�X�֔ԍ�
			var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//phone
			var address= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//������Z��1
			
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
			
			var soCount = soRecord.getLineItemCount('item');
			for(var a=1;a<soCount+1;a++){
				soRecord.selectLineItem('item',a);
				var item = defaultEmpty(soRecord.getLineItemValue('item','item',a));//item
				var line = defaultEmpty(soRecord.getLineItemValue('item','line',a));//line
				
			    var itemType = nlapiLookupField('item', item, ['islotitem','isserialitem','upccode','displayname']);
				var itemName=itemType.displayname;
				var itemJanCode=itemType.upccode;
				
				var itemName = defaultEmpty(soRecord.getLineItemText('item','item',a));//item
				var itemSearch = nlapiSearchRecord("item",null,
						[
						 	["internalid","anyof",item],
						],
						[
						 new nlobjSearchColumn("countryofmanufacture"),//�ύڒn
						 new nlobjSearchColumn("custitem_djkk_radioactivity_classifi"), //DJ_8_���ː��敪
						 new nlobjSearchColumn("displayname"),
						 new nlobjSearchColumn("custitem_djkk_deliverytemptyp"), //DJ_�z�����x�敪
						]
					); 
				
				var countryofmanufacture= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("countryofmanufacture"));//�ύڒn
				var classifi= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getText("custitem_djkk_radioactivity_classifi"));//DJ_8_���ː��敪
				var displayname= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//���O
				var deliverytemptyp= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getText("custitem_djkk_product_category_sml"));//�z�����x
				
				var lineNo = defaultEmpty(soRecord.getLineItemValue('item','line',a));	//�s
				var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//����
				var itemNo = defaultEmpty(soRecord.getLineItemValue('item','description',a));//����
				
				soBody.push({
					itemName:itemName, //item
					countryofmanufacture:countryofmanufacture, //�ύڒn
					classifi:classifi, //DJ_8_���ː��敪
					displayname:displayname,
					deliverytemptyp:deliverytemptyp,
					lineNo:lineNo,
					quantity:quantity,
					itemNo:itemNo, //����
					soId:soId,
					item:item,
					line:line,
//					upccode:upccode,
				});
				
				var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //�݌ɏڍ�
				if(!isEmpty(inventoryDetail)){
					var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
					if(inventoryDetailCount != 0){
						for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
							inventoryDetail.selectLineItem('inventoryassignment',j);
							var barcode ='';
							var barcodeTxt='';
							
						    barcode+='01';
					    	barcodeTxt+='(01)';
					    	
					    	if(!isEmpty(itemJanCode)){
					    		 barcode+=itemJanCode;
							     barcodeTxt+=itemJanCode;
					    	}else{
					    		barcode+='XXXXXXXXXXXXXX';
						    	barcodeTxt+='XXXXXXXXXXXXXX';
					    	}
					    	nlapiLogExecution('debug','itemJanCode', itemJanCode);
					    	nlapiLogExecution('debug','barcode', barcode);
					    	nlapiLogExecution('debug','barcodeTxt', barcodeTxt);
							
					    	var serialnumbers;
							serialnumbers = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//�V���A��/���b�g�ԍ�
							if(isEmpty(serialnumbers)){
						    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//���b�g�ԍ�internalid
						    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    );    
						    	 serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////�V���A��/���b�g�ԍ�	
						    	
					    	}
							var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //�L������	
							var invquantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'); //����	
							barcode+='17';
					    	barcodeTxt+='(17)';
					    	if(!isEmpty(expirationdate)){
					    		var edate=((expirationdate.replace("/","")).replace("/","")).substring(2,8);;
					    		barcode+=edate;
							    barcodeTxt+=edate;
					    	}else{
					    		barcode+='XXXXXX';
						    	barcodeTxt+='XXXXXX';
					    	}
					    	
						    var makerNumber='';
						    if (itemType.islotitem=='T') {
						    	
						    	// DJ_���[�J�[�������b�g�ԍ�
							    makerNumber=inventoryDetail.getCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code');
							    barcode+='10';
						    	barcodeTxt+='(10)';						    
						    }else if (itemType.isserialitem=='T') {
						    	
						    	// DJ_���[�J�[�V���A���ԍ�
							    makerNumber=inventoryDetail.getCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number');
							    barcode+='20';
						    	barcodeTxt+='(20)';					    	
						    }
						    barcode+=makerNumber;
					    	barcodeTxt+=makerNumber;
					    	
							inventoryDetailArr.push({
								lineNo:lineNo,
								serialnumbers:serialnumbers,
								expirationdate:expirationdate,	
								soId:soId,
								barcodeTxt:barcodeTxt,
								line:line,
								invquantity:invquantity,
							});
						}
					}
				}else{
					inventoryDetailArr.push({
						serialnumbers:'',
						expirationdate:'',
						soId:'',
						barcodeTxt:'',
						line:'',
						invquantity:'',
					}); 
				}
				
			}
//	    }
	}
	
			//�`�[�쐬
//	if(locationName.indexOf('DPKK')>-1){
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
			    '<td style="font-size: 22px;font-weight: bold;text-decoration: underline;" align="center" colspan="3">�ݸ���߯�ݸ�ؽ�</td>'+
			    '<td colspan="3"></td>'+
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
			    '<td style="font-size: 13px;font-weight: bold;text-decoration: underline;" align="left" colspan="2">�ݸ���߯�ݸ�ؽ�</td>'+
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
			    '<td colspan="2" rowspan="3">'+
			    '<table>'+
			    '<tr>'+
			    '<td style="width: 40px; height: 40px;border:1px solid #499AFF;"></td>'+
			    '<td style="width: 40px; height: 40px;border:1px solid #499AFF;border-left:none;"></td>'+
			    '<td style="width: 40px; height: 40px;border:1px solid #499AFF;border-left:none;"></td>'+
			    '</tr>'+
			    '</table>'+
			    '</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">����o�ד�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].shipdate+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">�o�׎w���ԍ�</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;S545646546546546</td>'+
			    '<td colspan="2" rowspan="2" align="left"><barcode codetype="code128" value="'+ soArray[m].tranid + '"/></td>' +
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
						    '<table style="border-bottom: 1px solid black;border-collapse: collapse;">' ;
						    for(var p = 0; p<inventoryDetailArr.length;p++ ){
								var soId = inventoryDetailArr[p].soId;
								var lineNum = inventoryDetailArr[p].line;
								if(soId == soBody[u].soId && lineNum == soBody[u].line){
									var soSerialnumbers = inventoryDetailArr[p].serialnumbers;  
									var soExpirationdate = inventoryDetailArr[p].expirationdate;  
									var soInvquantity = inventoryDetailArr[p].invquantity;  
									str+='<tr>'+
										'<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="4">'+soBody[u].itemNo +' </td>'+
										'<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soSerialnumbers+' </td>'+
										'<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soExpirationdate+'</td>'+
										'<td colspan="5"></td>'+
										'<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soInvquantity+' </td>'+
									    '</tr>';
								    str+= '<tr>'+
								    '<td colspan="4"></td>'+
								    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].countryofmanufacture +'</td>'+
								    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].deliverytemptyp+'</td>'+
								    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].classifi +'</td>'+
								    '<td colspan="2"></td>'+
								    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="3">()</td>'+
								    '</tr>'+
								    '<tr style="font-weight: bold;">'+
								    '<td colspan="9"></td>';					    
						    		var barcodeVxt = inventoryDetailArr[p].barcodeTxt;
						    		str+= '<td width="200px" align="right" colspan="3" rowspan="2" style="vertical-align:text-top;text-align:right"><barcode showtext="true" height="30" width="180" align="right" codetype="code128" value="'
									+barcodeVxt
									+'" /></td>';
						    		str+= '</tr>';
						    	}
						    }
						    str+='</table>';
					}
					
				}
				str += '<pbr/>';
			}
			if(str.substring(str.length - 6) == '<pbr/>'){
				str = str.substring(0,str.length - 6);
			}
			str += '</body></pdf>';
		    return str;
//	}
}


function pdfTwo (pdfData){
	var valueTotal = pdfData.valueTotal;
	var bodyArr = new Array();
	var itemArr = new Array();
	var inventoryDetailArr = new Array();
	for(var z = 0; z < valueTotal.length; z ++){
		var soId = valueTotal[z].so_id;
		var location =valueTotal[z].so_location;
		var locationSearch = nlapiSearchRecord("location",null,
				[
				 "internalid","anyof",location
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
				   new nlobjSearchColumn("internalid"),
				   new nlobjSearchColumn("name")
				]
				);
		var locationName = locationSearch[0].getValue("name");;
		if(locationName.indexOf('DPKK')>-1){
			nlapiLogExecution('DEBUG', 'pdfTwo', 'pdfTwo');
			var soRecord = nlapiLoadRecord('salesorder', soId);
			var shipdate = defaultEmpty(soRecord.getFieldValue("shipdate"));//�o�ד�
			var shipping_company = defaultEmpty(soRecord.getFieldValue("custbody_djkk_shipping_company"));//DJ_�^�����
			var delivery_date = defaultEmpty(soRecord.getFieldValue("custbody_djkk_delivery_date"));//DJ_�[�i��
			var delivery_time = defaultEmpty(soRecord.getFieldValue("custbody_djkk_delivery_time"));//DJ_�z�B�w�莞��
			var tranid = defaultEmpty(soRecord.getFieldValue("tranid"));//�����ԍ�
			var otherrefnum = defaultEmpty(soRecord.getFieldValue("otherrefnum"));//�������ԍ�
			var specifications = defaultEmpty(soRecord.getFieldValue("custcol_djkk_specifications"));//DJ_�K�i
			var entity = defaultEmpty(soRecord.getFieldValue("entity"));//�ڋq
			
			var customerSearch = nlapiSearchRecord("customer",null,
					[
					   ["internalid","anyof",entity]
					], 
					[
					   new nlobjSearchColumn("entityid").setSort(false),   //�ڋqID
					   new nlobjSearchColumn("companyname"),  //�ڋq��
					   new nlobjSearchColumn("custentity_djkk_activity"),     //DJ_�Z�N�V����
					   new nlobjSearchColumn("salesrep"),  //�̔����i���ВS���j
					   new nlobjSearchColumn("phone"),  //�d�b
					   new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//�s���{��
					   new nlobjSearchColumn("city","Address",null),//�s�撬��
					   new nlobjSearchColumn("address3","Address",null),//�Z��2
					   new nlobjSearchColumn("address2","Address",null),//�Z��1

					]
					);
			var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//�ڋqID
			var companyname= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//�ڋq��
			var activity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_activity"));//DJ_�Z�N�V����
			var salesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//�̔����i���ВS��
			var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("phone"));//�d�b				
			var address_state= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//�s���{��
			var city= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","Address",null));//�s�撬��
			var addr2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","Address",null));///�Z��2
			var addr1= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","Address",null));//�Z��1
			
			bodyArr.push({
				shipdate:shipdate,//�o�ד�
//				shipping_company:shipping_company,//DJ_�^�����
				delivery_date:delivery_date,//DJ_�[�i��
//				delivery_time:delivery_time,//DJ_�z�B�w�莞��
//				tranid:tranid,//�����ԍ�
				otherrefnum:otherrefnum,//�������ԍ�
				entityid:entityid,//�ڋqID
				companyname:companyname,//�ڋq��
				activity:activity,//DJ_�Z�N�V����
				salesrep:salesrep,//�̔����i���ВS��
				phone:phone,//�d�b	
				address_state:address_state,//�s���{��
				city:city,////�s�撬��
				addr1:addr1,//�Z��1
				addr2:addr2,//�Z��2
				soId:soId,
			});
			
			var soCount = soRecord.getLineItemCount('item');
			for(var a=1;a<soCount+1;a++){
				soRecord.selectLineItem('item',a);
				var line = soRecord.getLineItemValue('item','line',a);	
				var itemId = defaultEmpty(soRecord.getLineItemValue('item','item',a));//item
				var itemSearch = nlapiSearchRecord("item",null,
						[
						 	["internalid","anyof",itemId],
						],
						[
						 new nlobjSearchColumn("custitem_djkk_radioactivity"),//DJ_4_���˔\��
						 new nlobjSearchColumn("custitem_djkk_radioactivity_classifi"), //DJ_8_���ː��敪
						 new nlobjSearchColumn("serialnumber"),
						 new nlobjSearchColumn("displayname"),//���O
						 new nlobjSearchColumn("itemid"),//code
						]
					    ); 
				
				var radioactivity= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("custitem_djkk_radioactivity"));//DJ_4_���˔\��
				var radioactivity_classifi= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("custitem_djkk_radioactivity_classifi"));//DJ_8_���ː��敪
				var serialnumber= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("serialnumber"));
				var displayname= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//���O
				var itemid= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("itemid"));//code
				
				var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//����
				
				
				itemArr.push({
					soId:soId,
					itemid:itemid,
					specifications:specifications,//DJ_�K�i
					radioactivity:radioactivity,//DJ_4_���˔\��
					radioactivity_classifi:radioactivity_classifi,//DJ_8_���ː��敪
					displayname:displayname,//DJ_8_���ː��敪
					quantity:quantity,//����
					serialnumber:serialnumber,
					line:line,
					tranid:tranid,//�����ԍ�
					shipping_company:shipping_company,//DJ_�^�����
					delivery_time:delivery_time,//DJ_�z�B�w�莞��
				});
				var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //�݌ɏڍ�
				if(!isEmpty(inventoryDetail)){
					var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
					if(inventoryDetailCount != 0){
						for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
							inventoryDetail.selectLineItem('inventoryassignment',j);
							var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//�V���A��/���b�g�ԍ�
							if(isEmpty(receiptinventorynumber)){
						    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//���b�g�ԍ�internalid
						    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    );    
						    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////�V���A��/���b�g�ԍ�	
						    	
					    	}
							var invQuantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'); //����
							
							inventoryDetailArr.push({
									line:line,
									serialnumbers:serialnumbers,	
									invQuantity:invQuantity,
									soId:soId,
							});
						}
					}
				}else{
					inventoryDetailArr.push({
						serialnumbers:'',
						invQuantity:'',
						soId:soId,
						line:line
					}); 
				}
				
			}					
		}
	}
	if(locationName.indexOf('DPKK')>-1){
		var xmlString = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
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
		'</head>'+
		'<body padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">'+
		'<table style="border-top: 2px solid black;border-bottom:2px solid black ;">'+
		'<tr>'+
		'<td style="font-weight: bold;font-size:20px;" >DENIS�t�@�[�}(��)</td>'+
		'<td style="font-weight: bold;font-size:20px;" >�o�׎w�}��&nbsp;&nbsp;�ڍ�</td>'+
		'<td style="font-weight: bold;" align="center">&nbsp;�o�ד�&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+shipdate+'</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="2">&nbsp;</td>'+
		'<td style="font-weight: bold;padding-left:100px;">&nbsp;&nbsp;�A���Ǝ�&nbsp;&nbsp;&nbsp;&nbsp;'+shipping_company+'</td>'+
		'</tr>'+
		'</table>';		
		for(var u = 0;u<bodyArr.length;u++){
			xmlString+='<table style="border-top: 2px solid black;margin-top:2px;">'+
			'<tr>'+
			'<td style="width: 140px;font-weight: bold;">&nbsp;&nbsp;&nbsp;'+bodyArr[u].entityid+'</td>'+
			'<td style="font-weight: bold;" colspan="4">'+bodyArr[u].companyname+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="font-weight: bold;">&nbsp;</td>'+
			'<td style="font-weight: bold;width:120px">�Ɖu������RIA</td>'+
			'<td style="font-weight: bold;" align="center">'+bodyArr[u].salesrep+'</td>'+
			'<td style="font-weight: bold;margin-left:10px;" align="left">'+bodyArr[u].address_state+bodyArr[u].city+bodyArr[u].addr1+bodyArr[u].addr2+'</td>'+
			'<td style="font-weight: bold;padding-right:35px;" align="right">'+bodyArr[u].phone+'</td>'+
			'</tr>'+
			'</table>'+		
			'<table style="border-top: 1px solid black;">'+
			'<tr>'+
			'<td style="width: 140px;font-weight: bold;">��NO</td>'+
			'<td style="font-weight: bold;">�[�i��</td>'+
			'<td style="font-weight: bold;" colspan="5">�z�B����</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="font-weight: bold;">&nbsp;&nbsp;&nbsp;�i��</td>'+
			'<td style="font-weight: bold;" >�i��</td>'+
			'<td style="font-weight: bold;width:140px;" align="center">���b�g</td>'+
			'<td style="font-weight: bold;margin-left:20px;">����&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(����)</td>'+
			'<td style="font-weight: bold;">�K�i�e��</td>'+
			'<td style="font-weight: bold;margin-left:-10px;">�戵�敪</td>'+
			'<td style="font-weight: bold;padding-right:32px;" align="right">���ː�</td>'+
			'</tr>'+
			'</table>'+
			'<table style="border-top: 1px solid black;">';
			for(var o = 0;o<itemArr.length;o++){
				if(bodyArr[u].soId == itemArr[o].soId){
					xmlString+='<tr>'+
					'<td style="width: 140px;font-weight: bold;">'+itemArr[o].tranid+'</td>'+
					'<td style="font-weight: bold;">'+itemArr[o].shipping_company+'</td>'+
					'<td style="font-weight: bold;" colspan="5">'+itemArr[o].delivery_time+'</td>'+
					'</tr>';
					for(var p = 0; p<inventoryDetailArr.length;p++ ){
						var soId = inventoryDetailArr[p].soId;
						if(soId == itemArr[o].soId){
//							if(itemArr[o].soId == inventoryDetailArr[p].soId){
								var serialnumbers = inventoryDetailArr[p].serialnumbers;  
								var quantity = inventoryDetailArr[p].invQuantity;
									xmlString+='<tr>'+
									'<td style="font-weight: bold;">&nbsp;&nbsp;'+itemArr[o].itemid+'</td>'+
									'<td style="font-weight: bold;" >'+itemArr[o].displayname+'</td>'+
									'<td style="font-weight: bold;width:140px;" align="right">'+serialnumbers+'</td>'+
									'<td style="font-weight: bold;margin-left:20px;" align="center">'+quantity+'&nbsp;&nbsp;&nbsp;��</td>'+
									'<td style="font-weight: bold;">'+itemArr[o].specifications+'</td>'+
									'<td style="font-weight: bold;margin-left:-10px;">C</td>';   
									if(!isEmpty(bodyArr[u].radioactivity_classifi)){
										xmlString+='<td style="font-weight: bold;padding-right:32px;" align="right">'+itemArr[u].radioactivity_classifi+'</td>';
									}		
									xmlString+='</tr>';
//							}
						}
					}
					xmlString+='<tr>'+
					'<td align="right">501</td>'+
					'<td align="left" colspan="3" style="width: 240px;">�q�攭���ԍ�:'+bodyArr[u].otherrefnum+'</td>'+
					'<td colspan="3" align="left">�q�攭���ԍ�:E814212201</td>'+
					'</tr>'+
					'<tr>'+
					'<td align="right">502</td>'+
					'<td align="left" colspan="6" style="width: 240px;">*����LOT�w��[���w�� NEW���b�g�[�i��]</td>'+
					'</tr>';
				}
			}
			xmlString+='</table>';
		}
		
		xmlString += '</body></pdf>';
		return xmlString;
	}
}


function pdfThree (pdfData){
	var valueTotal = pdfData.valueTotal;
	var delivery = new Array();
	var inventoryDetailArr = new Array();
	var itemArr = new Array();
	for(var z = 0; z < valueTotal.length; z ++){
		var soId = valueTotal[z].so_id;
		var location =valueTotal[z].so_location;
		var locationSearch = nlapiSearchRecord("location",null,
				[
				 "internalid","anyof",location
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
				   new nlobjSearchColumn("internalid"),
				   new nlobjSearchColumn("name")
				]
				);
		var locationName = locationSearch[0].getValue("name");;
		if(locationName.indexOf('DPKK')<0 && locationName.indexOf('Keihin')<0){
			nlapiLogExecution('DEBUG', 'pdfThree', 'pdfThree');
			var soRecord = nlapiLoadRecord('salesorder', soId); //So
			var subsidiary = defaultEmpty(soRecord.getFieldValue("subsidiary"));//�q���
			var subsidiarySearch= nlapiSearchRecord("subsidiary",null,
					[
						["internalid","anyof",subsidiary]
					], 
					[
						new nlobjSearchColumn("legalname"),  //��������
						new nlobjSearchColumn("name"), //���O
						new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //��Ж��O�p��
						new nlobjSearchColumn("phone","address",null), //tel
						new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
					]
					);	
			var legalname= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("legalname"));//��������
			var subname= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("name"));//���O
			var subsidiary_en= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//��Ж��O�p��
			var subphone= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("phone","address",null));//tel
			var subfax= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax	
		
			
			var tranid = defaultEmpty(soRecord.getFieldValue("tranid"));//�����ԍ�
			var trandate = defaultEmpty(soRecord.getFieldValue("trandate"));//���t
			var entity = defaultEmpty(soRecord.getFieldValue("entity"));//�ڋq
			var customerSearch= nlapiSearchRecord("customer",null,
					[
						["internalid","anyof",entity]
					], 
					[
					    new nlobjSearchColumn("address"), //������Z�� 
				    	new nlobjSearchColumn("country","billingAddress",null), //�����捑
				    	new nlobjSearchColumn("attention","billingAddress",null), //�����戶���i�S���ҁj
				    	new nlobjSearchColumn("city","billingAddress",null), //������s�撬��
				    	new nlobjSearchColumn("zipcode","billingAddress",null), //������X�֔ԍ�
				    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //������s���{�� 		
				    	new nlobjSearchColumn("phone"), //������d�b�ԍ�
				    	new nlobjSearchColumn("fax"), //������Fax						  
					]
					);	
			var cusaddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address"));//������Z�� 
			var country= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("country","billingAddress",null));//�����捑
			var attention= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("attention","billingAddress",null));//�����戶���i�S���ҁj
			var city= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//������s�撬��
			var zipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zip","billingAddress",null));//������X�֔ԍ�
			var state= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//������s���{�� 
			var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//������d�b�ԍ�
			var fax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//������fax
					
			var destination = defaultEmpty(soRecord.getFieldValue("custbody_djkk_delivery_destination"));//DJ_�[�i��
			if(!isEmpty(destination)){
				var destinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
						[
							["internalid","anyof",destination]
						], 
						[
							new nlobjSearchColumn("custrecord_djkk_prefectures"),  //�s���{��
							new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_�s�撬��
							new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_�[�i��Z��1
							new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_�[�i��Z��2
							new nlobjSearchColumn("custrecord_djkk_zip"),  //�X�֔ԍ�
							new nlobjSearchColumn("custrecord_djkk_delivery_phone_number"),  //�[�i��d�b�ԍ�
							new nlobjSearchColumn("custrecord_djkk_fax"),  //�[�i��Fax
							new nlobjSearchColumn("custrecord_djkk_delivery_code"),  //�[�i��R�[�h
							new nlobjSearchColumn("custrecorddjkk_name"),  //�[�i�於�O
								  
						]
						);	
				var destinationZip= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_zip"));//�X�֔ԍ�
				var destinationState= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_prefectures"));//�s���{��
				var destinationCity= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_municipalities"));//DJ_�s�撬��
				var destinationAddress= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_delivery_residence"));//DJ_�[�i��Z��1
				var destinationAddress2= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_delivery_residence2"));//DJ_�[�i��Z��2
				var destinationPhone= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_delivery_phone_number"));//�[�i��d�b�ԍ�
				var destinationFax= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_fax"));//�[�i��Fax
				var delivery_code= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_delivery_code"));//�[�i��R�[�h
				var name= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecorddjkk_name"));//�[�i�於�O			
			}
			 
			
			var memo = defaultEmpty(soRecord.getFieldValue("memo"));//memo
			var delivery_date = defaultEmpty(soRecord.getFieldValue("custbody_djkk_delivery_date"));//DJ_�[�i��
			var shipping_company = defaultEmpty(soRecord.getFieldValue("custbody_djkk_shipping_company"));//�^�����
			var location = defaultEmpty(soRecord.getFieldValue("location"));//�ꏊ
			var otherrefnum = defaultEmpty(soRecord.getFieldValue("otherrefnum"));//�������ԍ�
			delivery.push({
				legalname:legalname, ////��������
				subname:subname,//���O
				subsidiary_en:subsidiary_en,//��Ж��O�p��
				subphone:subphone,//���tel
				subfax:subfax,//���fax
				tranid:tranid,//�����ԍ�
				trandate:trandate,//���t
				entity:entity,//�ڋq
				cusaddress:cusaddress,//������Z�� 
				country:country,//�����捑
				attention:attention,//�����戶���i�S���ҁj
				city:city,//������s�撬��
				zipcode:zipcode,//������X�֔ԍ�
				state:state,//������s���{��
				phone:phone,//������d�b�ԍ�
				fax:fax,//������fax
				destinationZip:destinationZip,//�[�i��X�֔ԍ�
				destinationState:destinationState,//�[�i��s���{��
				destinationCity:destinationCity,//�[�i��s�撬��
				destinationAddress:destinationAddress,//�[�i��Z��1
				destinationAddress2:destinationAddress2,//�[�i��Z��2
				destinationPhone:destinationPhone,//�[�i��d�b�ԍ�
				destinationFax:destinationFax,//�[�i��Fax
				delivery_code:delivery_code,//�[�i��R�[�h
				name:name,//�[�i�於�O	
				delivery_date:delivery_date,//DJ_�[�i��
				shipping_company:shipping_company,//�^�����
				location:location,//�ꏊ
				otherrefnum:otherrefnum,//�������ԍ�
				soId:soId,
			});	
			
			var soCount = soRecord.getLineItemCount('item');			
			for(var a=1;a<soCount+1;a++){
				soRecord.selectLineItem('item',a);
				var itemId = soRecord.getLineItemValue('item','item',a);	
				var line = soRecord.getLineItemValue('item','line',a);	
				var ItemSearch = nlapiSearchRecord("item",null,
						[
						 	["internalid","anyof",itemId],
						],
						[
						  new nlobjSearchColumn("itemid"), //���i�R�[�h
						  new nlobjSearchColumn("displayname"), //���i��
						]
						); 
					
				var itemid= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("itemid"));//���i�R�[�h
				var displayname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("displayname"));//���i��
					
				var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//����
				var unitabbreviation = defaultEmpty(soRecord.getLineItemValue('item','units_display',a));//�P��
				var casequantity = defaultEmpty(soRecord.getLineItemValue('item','custcol_djkk_casequantity',a));//�P�[�X��
				var perunitquantity = defaultEmpty(soRecord.getLineItemValue('item','custcol_djkk_perunitquantity',a));//����
				itemArr.push({
					itemid:itemid,//���i�R�[�h
					displayname:displayname,//���i��
					quantity:quantity,//����
					unitabbreviation:unitabbreviation,//�P��
					casequantity:casequantity,//�P�[�X��
					perunitquantity:perunitquantity,//����		
					line:line,//�s
					soId:soId,
				});	
				
				var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //�݌ɏڍ�
				if(!isEmpty(inventoryDetail)){
					var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
					if(inventoryDetailCount != 0){
						for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
							inventoryDetail.selectLineItem('inventoryassignment',j);
							var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//�V���A��/���b�g�ԍ�
							if(isEmpty(receiptinventorynumber)){
						    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//���b�g�ԍ�internalid
						    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    );    
						    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////�V���A��/���b�g�ԍ�	
					    	}
							var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //�L������
							var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'); //DJ_�q�ɓ��ɔԍ�
							var serialCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'); //DJ_���[�J�[�������b�g�ԍ�
							inventoryDetailArr.push({
									line:line,
									serialnumbers:serialnumbers,//�V���A��/���b�g�ԍ�
									expirationdate:expirationdate,	//�L������
									warehouseCode:warehouseCode,//DJ_�q�ɓ��ɔԍ�
									serialCode:serialCode,//DJ_���[�J�[�������b�g�ԍ�
									soId:soId,
							});
						}
					}
				}else{
					inventoryDetailArr.push({
						serialnumbers:'',//�V���A��/���b�g�ԍ�
						expirationdate:'',
						warehouseCode:'',
						serialCode:'',
						line:line,
						soId:soId,
					}); 
				}
			}		
		}		
	}
	
	
	
	
	if(locationName.indexOf('DPKK')<0 && locationName.indexOf('Keihin')<0){
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
	'</head>'+
//
	'<body header="nlheader" header-height="38.7%" footer="nlfooter" footer-height="7%" padding="0.5in 0.5in 0.5in 0.5in" size="A4">';
	for(var j =0; j < delivery.length;j++){
		str +='<table style="width: 660px;height: 40px; overflow: hidden; display: table;border-collapse: collapse;"><tr style="border-bottom:2px solid #499AFF;color:#499AFF;font-size:1.3em;margin-bottom:0.8em;">'+
		'<td align="left" style="padding: 0em 0em 0em 0em;font-size:16pt;width:460px" valign="middle"><span>'+delivery[j].subname+'</span></td>'+
		'<td align="right" style="padding: 0em 0em 0em 0em;font-size:16pt;width:200px" valign="middle"><span>'+delivery[j].legalname+'</span></td>'+
		'</tr></table>'+
		'<table style="margin:0 0.2in 0.2in; width:660px;border:2px solid #499AFF;" cellpadding="2" cellspacing="1">'+
		'	<tr>'+
		'		<td></td>'+
		'	</tr>'+
		'	<tr>'+
		'		<td align="right" colspan="25">&nbsp;</td>'+
		'		<td align="center" colspan="50" >�z���˗���</td>'+
		'		<td align="right" colspan="25">���t�F'+delivery[j].trandate+'</td>'+
		'	</tr>'+
		'	<tr>'+
		'		<td align="right" colspan="25"></td>'+
		'		<td colspan="50">&nbsp;</td>'+
		'		<td align="right" colspan="25">�󒍔ԍ�'+delivery[j].tranid+'</td>'+
		'	</tr>'+
		'</table>'+
	//	
		'<table cellpadding="2" cellspacing="2" style="width:660px;margin:0 0.2in;border-bottom:1px solid black">'+
		'<tr>'+
		'<td style="width:300px;border-bottom: 1px solid black;">�c��</td>'+
		'<td align="center">'+delivery[j].subsidiary_en+'</td>'+
		'</tr>'+
		'<tr>'+
		'<td></td>'+
		'<td style="padding-right:20px;height: 17px;" align="center">TEL:'+delivery[j].subphone+'</td>'+
		'</tr>'+
		'<tr>'+
		'<td></td>'+
		'<td style="padding-right:20px;height: 17px;" align="center">FAX:'+delivery[j].subfax+'</td>'+
		'</tr>'+
		'</table>'+
	//	
		'<table cellpadding="2" cellspacing="2" style="width:660px;margin:0 0.2in;border-bottom:1px solid black">'+
		'<tr>'+
		'<td style="width: 300px;height: 17px;" colspan="2">�[�i��F'+delivery[j].name+'</td>'+
		'<td>�[�i��R�[�h�F'+delivery[j].delivery_code+'</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 130px;height: 17px;">&nbsp;&nbsp;TEL:'+delivery[j].destinationPhone+'</td>'+
		'<td style="width: 170px;height: 17px;">T'+delivery[j].destinationZip+'</td>'+
		'<td></td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 130px;height: 17px;">&nbsp;&nbsp;FAX:'+delivery[j].destinationFax+'</td>'+
		'<td style="width: 170px;height: 17px;">'+delivery[j].destinationState+'</td>'+
		'<td>������</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 130px;height: 17px;"></td>'+
		'<td style="width: 170px;height: 17px;">'+delivery[j].destinationCity+'&nbsp;'+ +delivery[j].destinationAddress+'</td>'+
		'<td>&nbsp;�R�[�h�FB14-0002(25&nbsp;&nbsp;&nbsp;069)</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="2"></td>'+
		'<td>&nbsp;&nbsp;���́F�z�V�P�~�J���Y�������</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="2"></td>'+
		'<td>&nbsp;&nbsp;&nbsp;WH:26</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 130px;height: 17px;">�[�i��:'+delivery[j].delivery_date+'</td>'+
		'<td style="height: 17px;" colspan="2">��q�̒����ԍ�:'+delivery[j].otherrefnum+'</td>'+
		'</tr>'+	
		'</table>'+
		
		'<table cell-spacing="0" style="width:660px;margin:0 0.2in 0.2in;border-collapse: collapse;"><tr>'+
		'<td style="width:80%; padding-left: 0px; padding-right: 0px;">'+
		'<table cellpadding="0" cellspacing="0" style="width: 100%;"><tr>'+
		'<td style="width: 50%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">�^�����:'+delivery[j].shipping_company+'</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 50%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">���l:'+delivery[j].memo+'</td>'+
		'</tr></table>'+
		'</td>'+
		'<td align="left" cell-spacing="0" style="padding-left: 0px;padding-right: 0px;padding-top: 20px;">'+
		'<table><tr>'+
		'<td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>'+
		'<td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>'+
		'<td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>'+
		'</tr></table>'+
		'</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 50%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">���L�̂Ƃ���z���̒��X�������肢�v���܂��B</td>'+
		'<td style="width: 50%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom" align="right">Page:1</td>'+
		'</tr></table>'+
	//	
		'<table style="width: 660px;border-collapse:collapse; margin-right:3px;" align="center" cellpadding="0" cellspacing="0">'+
		'<tr>'+
		'<td align="center" style="width: 95px;border-style:solid;border-color:#499AFF;border-left-width:2px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">�i�R�[�h</td>'+
		'<td align="center" style="width: 250px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">�i��</td>'+
		'<td align="center" style="width: 105px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">����</td>'+
		'<td align="center" style="width: 105px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">�J�[�g��</td>'+
		'<td align="center" style="width: 105px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;border-right-width:2px; border-bottom-width:1px;line-height:30px;">���v����</td>'+
		'</tr>'+	
		'</table>'+
		
		'<table style="width: 660px;border-collapse:collapse; margin-right:3px;" align="center" cellpadding="0" cellspacing="0">'+
		'<tr>'+
		'<td style="border-left: 2px solid #499AFF;width: 95px;">&nbsp;</td>'+
		'<td style="border-left: 1px solid #499AFF;width: 250px;">&nbsp;</td>'+
		'<td style="border-left: 1px solid #499AFF;width: 105px;">&nbsp;</td>'+
		'<td style="border-left: 1px solid #499AFF;width: 105px;">&nbsp;</td>'+
		'<td style="border-left: 1px solid #499AFF;width: 105px; border-right: 2px solid #499AFF;">&nbsp;</td>'+
		'</tr>';
		for(var a =0; a < itemArr.length;a++){
			if(delivery[j].soId == itemArr[a].soId){				
				str+='<tr>'+
				'<td style="border-left: 2px solid #499AFF;">'+
				'<table style="width: 95px;height: 50px;">'+
				'<tr>'+
				'<td>'+itemArr[a].itemid+'</td>'+
				'</tr>'+
				'</table>'+
				'</td>'+
				
				'<td style="border-left: 1px solid #499AFF;">'+
				'<table style="width: 250px;height: 50px;">'+
				'<tr>'+
				'<td>'+itemArr[a].displayname+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>'+itemArr[a].unitabbreviation+'</td>'+
				'</tr>';
				for(var p = 0; p<inventoryDetailArr.length;p++ ){
					var soId = inventoryDetailArr[p].soId;
					if(soId == itemArr[a].soId){
						var expirationdate = inventoryDetailArr[p].expirationdate;  
						var serialnumbers = inventoryDetailArr[p].serialnumbers;  
							str+='<tr>'+
							'<td>'+serialnumbers+'</td>'+
							'</tr>'+
							'<tr>'+
							'<td>'+expirationdate+'</td>'+
							'</tr>';
					}
				}
				str+='</table>'+
				'</td>'+
				
				'<td style="border-left: 1px solid #499AFF;">'+
				'<table style="width: 105px;height: 50px;">'+
				'<tr>'+
				'<td align="center">'+itemArr[a].perunitquantity+'</td>'+
				'</tr>'+
				'</table>'+
				'</td>'+
				
				'<td style="border-left: 1px solid #499AFF;">'+
				'<table style="width: 105px;height: 50px;">'+
				'<tr>'+
				'<td align="center">'+itemArr[a].casequantity+'</td>'+
				'</tr>'+
				'</table>'+
				'</td>'+
				
				'<td style="border-left: 1px solid #499AFF;border-right: 2px solid #499AFF;">'+
				'<table style="width: 105px;">'+
				'<tr>'+
				'<td align="center">10.00Kg</td>'+
				'</tr>'+
				'<tr>'+
				'<td align="center">'+itemArr[a].quantity+'</td>'+
				'</tr>'+
				'</table>'+
				'</td>'+
				'</tr>';
			}
		}
		str+='</table>'+
		
		'<table style="width: 660px;border-collapse:collapse; margin-right:3px;border-top:2px solid #499AFF;height:40px;" align="center" cellpadding="0" cellspacing="0">'+
		'<tr>'+
		'<td style="width:450px;line-height:40px;"></td>'+
		'<td style="width:105px;line-height:40px;border-left:2px solid #499AFF;" align="center">&nbsp;</td>'+
		'<td style="width:105px;line-height:40px;border-right:2px solid #499AFF;border-left:1px solid #499AFF;" align="center">&nbsp;</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width:450px;line-height:40px;"></td>'+
		'<td style="width:105px;line-height:40px;border-left:2px solid #499AFF;border-bottom:1px solid #499AFF;border-top:1px solid #499AFF;" align="center">&nbsp;</td>'+
		'<td style="width:105px;line-height:40px;border-right:2px solid #499AFF;border-top:1px solid #499AFF;border-left:1px solid #499AFF;border-bottom:1px solid #499AFF" align="center">&nbsp;</td>'+
		'</tr>'+
		'</table>'+
		
		'<table style="width: 660px; border-top:2px soild #499AFF;margin-top:80px;">'+
		'<tr style="color:#499AFF;">'+
		'<td style="width: 525px;padding-top:5px;">'+
		'<span style="font-size:12px;">&nbsp;&nbsp;&nbsp;&nbsp;'+delivery[j].legalname+'</span><br />'+
		'<span style="font-size:9px;">&nbsp;&nbsp;&nbsp;&nbsp;��100-0013�����s���c�������3-6-7 �����փv���C�X</span><br />'+
		'<span style="font-size:12px;">&nbsp;&nbsp;&nbsp;&nbsp;'+delivery[j].subname+'</span><br />'+
		'<span style="font-size:9px;">&nbsp;&nbsp;&nbsp;&nbsp; Kasumigaseki Place, 3-6-7 Kasumigaseki, Chiyoda-ku. Toky 100-0843 JAPAN</span></td>'+
		'<td align="right" style="width: 256px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" style="width: 90px; height: 50px; margin-top: 5px; float: right;" /></td>'+
		'</tr></table>';
		
		str += '<pbr/>';
		}
		if(str.substring(str.length - 6) == '<pbr/>'){
			str = str.substring(0,str.length - 6);
		}
		str += '</body></pdf>';
		return str;
	}
}

function deliveryPDF(pdfData){
	var valueTotal = pdfData.valueTotal;
	var soBody = new Array();
	var inventoryDetailArr = new Array();
	var itemLineArr = new Array();
	var inventoryDetailArr = new Array();
	var moneyArr = new Array();
	var amountTota = 0;
	var taxamountTota = 0;	
	for(var z = 0; z < valueTotal.length; z ++){
		var soId = valueTotal[z].so_id;
		var soRecord = nlapiLoadRecord('salesorder',soId);
		var deliverySite =  defaultEmpty(soRecord.getFieldValue('custbody_djkk_delivery_book_site'));
//		if(deliverySite == '24'){
			var entity = soRecord.getFieldValue('entity');//�ڋq
			var customform = soRecord.getFieldValue('customform');//customform
			var customerSearch= nlapiSearchRecord("customer",null,
					[
						["internalid","anyof",entity]
					], 
					[
					 	new nlobjSearchColumn("CUSTRECORD_DJKK_HONORIFIC_APPELLATION","billingAddress",null), //DJ_�h��
					 	new nlobjSearchColumn("address2","billingAddress",null), //������Z��1
				    	new nlobjSearchColumn("address3","billingAddress",null), //������Z��2
				    	new nlobjSearchColumn("city","billingAddress",null), //������s�撬��
				    	new nlobjSearchColumn("zipcode","billingAddress",null), //������X�֔ԍ�
				    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //������s���{�� 		
				    	new nlobjSearchColumn("phone"), //�d�b�ԍ�
				    	new nlobjSearchColumn("fax"), //Fax
				    	new nlobjSearchColumn("custentity_djkk_language"),  //����
				    	new nlobjSearchColumn("custentity_djkk_reference_express"),  //���z�\��flg
				    	new nlobjSearchColumn("custentity_djkk_delivery_express"),  //�\��flg
					]
					);	
			var honorieicAppellation = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("CUSTRECORD_DJKK_HONORIFIC_APPELLATION","billingAddress",null));//DJ_�h��
			if(honorieicAppellation =='��'){
				honorieicAppellation = '';
			}
			var attention= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//������Z��2
			var customerAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//������Z��1
			var customerCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//������s�撬��
			var customerZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zip","billingAddress",null));//������X�֔ԍ�
			var customerState= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//������s���{�� 
			var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//������d�b�ԍ�
			var fax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//������fax
			var soLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_language"));//����
			var expressFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_reference_express"));//���z�\��flg
			var deliveryFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_delivery_express"));//�\��flg
			
			var subsidiary = soRecord.getFieldValue('subsidiary');//�q���
			var subsidiarySearch= nlapiSearchRecord("subsidiary",null,
					[
						["internalid","anyof",subsidiary]
					], 
					[
						new nlobjSearchColumn("legalname"),  //��������
						new nlobjSearchColumn("name"), //���O
						new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //���O�p��
						new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //�Z���p��
						new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //�s���{��
						new nlobjSearchColumn("address2","address",null), //�Z��1
						new nlobjSearchColumn("address3","address",null), //�Z��2
						new nlobjSearchColumn("city","address",null), //�s�撬��
						new nlobjSearchColumn("zip","address",null), //�X�֔ԍ�
						new nlobjSearchColumn("custrecord_djkk_bank_1"), //��s1
						new nlobjSearchColumn("custrecord_djkk_bank_2"), //��s2
							  
					]
					);		
					
			var legalname= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("legalname"));//��������
			var nameString= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("name"));//���O
			var nameStringTwo = nameString.split(":");
			var name = nameStringTwo.slice(-1);
			var address= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//�s���{��
			var city= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("city","address",null));//�s�撬��
			var bankOne= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_1"));//��s1
			var bankTwo= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_2"));//��s2
			var addressZip= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("zip","address",null));//�X�֔ԍ�
			var nameEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//���O�p��
			var mainaddressEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//�Z���p��
			var address1= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address2","address",null));//�Z��1
			var address2= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address3","address",null));//�Z��2
			var bankOneId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_1"));//��s1
			var bankTwoId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_2"));//��s2
			if(!isEmpty(bankOneId)){
				var bank1 = nlapiLoadRecord('customrecord_djkk_bank', bankOneId);
				var branch_name1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_�x�X��
				var bank_no1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));//DJ_�����ԍ�
			}else{
				var branch_name1 = '';
				var bank_no1 = '';
			}
			if(!isEmpty(bankTwoId)){
				var bank2 = nlapiLoadRecord('customrecord_djkk_bank', bankTwoId);
				var branch_name2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_�x�X��
				var bank_no2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));//DJ_�����ԍ�
			}else{
				var branch_name2 = '';
				var bank_no2 ='';
			}
					
			var trandate = defaultEmpty(soRecord.getFieldValue('trandate'));//���t
			var delivery_date = defaultEmpty(soRecord.getFieldValue('custbody_djkk_delivery_date'));//DJ_�[�i��
			var tranid = defaultEmpty(soRecord.getFieldValue('tranid'));//�����ԍ�
			var terms = defaultEmpty(soRecord.getFieldText('terms'));//�x�������i���ߓ������j
			var soTersm = defaultEmpty(terms.split('/'));
			var soTersmJap = defaultEmpty(soTersm.slice(0,1));
			var soTersmEng  = defaultEmpty(soTersm.slice(-1));
			var otherrefnum = defaultEmpty(soRecord.getFieldValue('otherrefnum'));//�������ԍ�
			var destination = soRecord.getFieldValue('custbody_djkk_delivery_destination');//DJ_�[�i��	
			var destinationName = defaultEmpty(soRecord.getFieldText('custbody_djkk_delivery_destination'));//DJ_�[�i�於�O
			if(!isEmpty(destination)){	
				var destinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
						[
							["internalid","anyof",destination]
						], 
						[
							new nlobjSearchColumn("custrecord_djkk_zip"),  //�X�֔ԍ�
							new nlobjSearchColumn("custrecord_djkk_prefectures"),  //�s���{��
							new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_�s�撬��
							new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_�[�i��Z��1
							new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_�[�i��Z��2
							new nlobjSearchColumn("custrecord_djkk_sales"),//�[�i��c��
								  
						]
						);	
				var destinationZip = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_zip'));
				var destinationState = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_prefectures'));
				var destinationCity = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_municipalities'));
				var destinationAddress = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_delivery_residence'));
				var destinationAddress2 = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));
				var destinationSales = defaultEmpty(destinationSearch[0].getText('custrecord_djkk_sales'));		
			}
			if(soLanguage == '�p��'){
				pdfName = 'Delivery Book';
			}else if(soLanguage == '���{��'|| isEmpty(soLanguage)){
				pdfName = '�[\xa0\xa0�i\xa0\xa0��';
			}
			
			soBody.push({
				honorieicAppellation:honorieicAppellation,//DJ_�h��
				pdfName:pdfName,
				attention:attention,//������Z��2
				customerAddress:customerAddress,//������Z��1
				customerCity:customerCity,//������s�撬��
				customerZipcode:customerZipcode,//������X�֔ԍ�
				customerState:customerState,//������s���{��
				phone:phone,//������d�b�ԍ�
				fax:fax,//������fax
				soLanguage:soLanguage,////����
				expressFlg:expressFlg,//���z�\��flg
				deliveryFlg:deliveryFlg,//�\��flg		
				legalname:legalname,//��������
				name:name,//���O
				address:address,//�s���{��
				city:city,//�s�撬��
				bankOne:bankOne,//��s1
				bankTwo:bankTwo,//��s2
				addressZip:addressZip,//��ЗX�֔ԍ�
				nameEng:nameEng,//��Ж��O�p��
				mainaddressEng:mainaddressEng,//��ЏZ���p��
				address1:address1,//��ЏZ��1
				address2:address2,//��ЏZ��2
				branch_name1:branch_name1,//DJ_�x�X��1
				bank_no1:bank_no1,//DJ_�����ԍ�1
				branch_name2:branch_name2,//DJ_�x�X��2
				bank_no2:bank_no2,//DJ_�x�X��2
				trandate:trandate,//���t
				delivery_date:delivery_date,//DJ_�[�i��
				tranid:tranid,//�����ԍ�
				soTersmJap:soTersmJap,//�x�������i���ߓ������j���{��
				soTersmEng:soTersmEng,//�x�������i���ߓ������j�p��
				otherrefnum:otherrefnum,//�������ԍ�
				destinationName:destinationName,//DJ_�[�i�於�O
				destinationZip:destinationZip, //�[�i��X�֔ԍ�
				destinationState:destinationState,//�[�i��s���{��
				destinationCity:destinationCity,//�[�i��s�撬��
				destinationAddress:destinationAddress,//�[�i��Z��1
				destinationAddress2:destinationAddress2,//�[�i��Z��2
				destinationSales:destinationSales,//�[�i��c��
				soId:soId,
			}); 
			
			var soCount = soRecord.getLineItemCount('item');
			for(var a=1;a<soCount+1;a++){
				soRecord.selectLineItem('item',a);
				var itemId = soRecord.getLineItemValue('item','item',a);	
				var line = soRecord.getLineItemValue('item','line',a);	
				var ItemSearch = nlapiSearchRecord("item",null,
						[
						 	["internalid","anyof",itemId],
						],
						[
						  new nlobjSearchColumn("vendorname"), //�d���揤�i�R�[�h
						  new nlobjSearchColumn("itemid"), //���i�R�[�h
						  new nlobjSearchColumn("displayname"), //���i��
						  new nlobjSearchColumn("custitem_djkk_storage_type"), //�݌ɋ敪
						  new nlobjSearchColumn("custitem_djkk_product_category_sml"), //�z�����x
						]
						); 
					
					var vendorname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("vendorname"));//�d���揤�i�R�[�h
					var itemid= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("itemid"));//���i�R�[�h
					var displayname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("displayname"));//���i��
					var storage_type= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_storage_type"));//�݌ɋ敪
					var deliverytemptyp= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_product_category_sml"));//�z�����x

				var receiptnote = soRecord.getLineItemValue('item', 'custcol_djkk_receipt_printing', a);//DJ_��̏����flag
				var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//����
				
				var amount = defaultEmptyToZero(parseFloat(soRecord.getLineItemValue('item', 'amount', a)));//���z
				if(!isEmpty(amount)){
					var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');		
					amountTota += amount;
					var amountTotal = amountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}else{
					var amountFormat = '';
				}

				
				var taxamount = defaultEmpty(parseFloat(soRecord.getLineItemValue('item','tax1amt',a)));//�Ŋz   

				if(!isEmpty(taxamount)){
					var taxamountFormat = taxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					taxamountTota += taxamount;
					var taxamountTotal = taxamountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}else{
					var taxamountFormat = '';
				}
			

				var rateFormat= defaultEmpty(soRecord.getLineItemValue('item','rate',a));//�P��
				
				var total = defaultEmpty(Number(amountTota+taxamountTota));
				if(!isEmpty(total)){
					var toTotal = total.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}else{
					var toTotal = '';
				}
				//20221020 add by zhou 
				var unitabbreviation = defaultEmpty(soRecord.getLineItemValue('item','units_display',a));//�P��
				
				var soUnitsArray;//�P��array
				var soUnit;//�ύX��P��
				if(!isEmpty(soLanguage)&&!isEmpty(unitabbreviation)&&customform == 121){
					var unitSearch = nlapiSearchRecord("unitstype",null,
							[
							   ["abbreviation","is",unitabbreviation]
							], 
							[
							   new nlobjSearchColumn("abbreviation")
							]
							);
					if(unitSearch != null){
						if(soLanguage == '�p��'){			//�p��
							unitabbreviation = unitSearch[0].getValue('abbreviation')+'';
							soUnitsArray = unitabbreviation.split("/");
							if(soUnitsArray.length == 2){
								soUnit = soUnitsArray[1];
							}
						}else if(soLanguage == '���{��'){				//���{��
							unitabbreviation = unitSearch[0].getValue('abbreviation')+'';
							soUnitsArray = unitabbreviation.split("/");
							if(!isEmpty(soUnitsArray)){
								soUnit = soUnitsArray[0];
							}else if(soUnitsArray.length == 0){
								soUnit = unitabbreviation;
							}
						}
					}
				}
				
				//end
				var taxrate1Format = defaultEmpty(soRecord.getLineItemValue('item','taxrate1',a));//�ŗ�   //
				var pocurrency = transfer(defaultEmpty(soRecord.getLineItemValue('item','pocurrency',a)));//�ʉ�
				if(pocurrency == 'JPY'){
					var pocurrencyMoney = '��';
				}else if(pocurrency == 'USD'){
					var pocurrencyMoney = '$';
				}else{
					var pocurrencyMoney = '';
				}
				moneyArr.push({  
					soId:soId,
					pocurrencyMoney:pocurrencyMoney,
					toTotal:toTotal,
					taxamountTotal:taxamountTotal,
				}); 

				itemLineArr.push({  
					receiptnote:receiptnote,//DJ_��̏����flag
					vendorname:vendorname,//�d���揤�i�R�[�h
					itemid:itemid,//���i�R�[�h
					displayname:displayname,//���i��
					storage_type:storage_type,//�݌ɋ敪
					quantity:quantity,//����
					amount:amountFormat,//���z  
					taxamount:taxamountFormat,//�Ŋz 
					rateFormat:rateFormat,//�P��
					unitabbreviation:defaultEmpty(soUnit),//�P��
					taxrate1Format:taxrate1Format,//�ŗ�
					deliverytemptyp:deliverytemptyp,//�z�����x�敪
					line:line,
					soId:soId,
				}); 
				var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //�݌ɏڍ�
				if(!isEmpty(inventoryDetail)){
					var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
					if(inventoryDetailCount != 0){
						for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
							inventoryDetail.selectLineItem('inventoryassignment',j);
							var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//�V���A��/���b�g�ԍ�
							if(isEmpty(receiptinventorynumber)){
						    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//���b�g�ԍ�internalid
						    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    );    
						    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////�V���A��/���b�g�ԍ�	
					    	}
							var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //�L������	
							inventoryDetailArr.push({
									line:line,
									serialnumbers:serialnumbers,
									expirationdate:expirationdate,	
									soId:soId,
							});
						}
					}
				}else{	
						inventoryDetailArr.push({
							serialnumbers:'',
							expirationdate:'',
							soId:soId,
						}); 
				}
			}		
//		}
	}
//	if(deliverySite == '24'){
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
		str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4">'; 
			for(var u = 0;u<soBody.length;u++){		
				if(soBody[u].soLanguage == '�p��'){
					var bankName = 'Drawing Bank';
					var titleName = 'Delivery as follows.';
					var dateName = 'Date';
					var deliveryName = 'Delivery Date:';
					var numberName = 'Number';
					var paymentName = 'Payment Terms:';
					var orderName = 'Order Number:';
					var codeName = 'Code';
					var poductName = 'Product Name';
					var quantityName = 'Quantity';
					var unitpriceName = 'Unit Price';
					var amountName = 'Amount';
					var tempName = 'Temperature';
					var expirationDateNmae = 'Expiration Date:';
					var orderNameTwo = 'Order Number:';
					var taxRate = 'Tax Rate';
					var taxAmount = 'TaxAmt';
					var totalName = 'Total';
					var consumptionTax = 'Consumption Tax';
					var invoiceNameString = 'Invoice';
					var deliName = 'Delivery';
				}else {
					var bankName = '�����s';
					var titleName = '���L�̒ʂ�[�i�v���܂��B';
					var dateName = '��\xa0\xa0�t';
					var deliveryName = '�[�i���F';
					var numberName = '��\xa0\xa0��';
					var paymentName = '�x������:';
					var orderName = '�M�����ԍ�:';
					var codeName = '�R\xa0\xa0�[\xa0\xa0�h';
					var poductName = '�i\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0��';
					var quantityName = '��\xa0\xa0\xa0��';
					var unitpriceName = '�P\xa0\xa0\xa0��';
					var amountName = '��\xa0\xa0\xa0�z';
					var tempName = '�z�����x';
					var expirationDateNmae = '�L������:';
					var orderNameTwo = '�q�攭���ԍ�:';
					var taxRate = '�ŗ�';
					var taxAmount = '�Ŋz';
					var totalName = '��\xa0\xa0\xa0\xa0\xa0�v';
					var consumptionTax = '��\xa0\xa0��\xa0\xa0��';
					var invoiceNameString = '��\xa0��\xa0��\xa0�z';
					var deliName = '���͐�';
				}
			str+='<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
			'<tr>'+
			'<td style="width: 330PX;">'+
			'<table>'+
			'<tr style="height: 20px;">'+
			'</tr>'+
			'<tr></tr>'+
			'<tr>'+
			'<td>��'+soBody[u].customerZipcode+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+soBody[u].customerState+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+soBody[u].customerCity+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+soBody[u].customerAddress+'</td>'+ 
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+soBody[u].attention+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td align="center">&nbsp;</td>'+
			'<td align="center">'+soBody[u].honorieicAppellation+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;Tel:'+soBody[u].phone+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;Fax:'+soBody[u].fax+'</td>'+
			'</tr>'+
			'</table>'+
			'</td>'+
			'<td>'+
			'<table style="border:1px solid black;">'+
			'<tr>'+
			'<td colspan="2" style="font-weight: bold;font-size:20px;width:55%;line-height:35px;">'+soBody[u].legalname+'</td>'+
			'<td colspan="2" style="width:45%;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" style="width:110px;height: 35px;" /></td>'+
			'</tr>'+
			'<tr>'+
			'</tr>'+
			'<tr>';
				if(soBody[u].soLanguage == '�p��'){
					str+='<td colspan="4">'+soBody[u].nameEng+'</td>';
				}else{
					str+='<td colspan="4">'+soBody[u].name+'</td>';
				}
			str+='</tr>'+
			'<tr>';
			if(soBody[u].soLanguage == '�p��'){
				str+='<td colspan="4" style="font-size:9px;">'+soBody[u].mainaddressEng+'</td>';
			}else{
				str+='<td colspan="4" style="font-size:10px;">��'+soBody[u].addressZip+soBody[u].address+soBody[u].city+soBody[u].address1+soBody[u].address2+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td colspan="4">'+bankName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+soBody[u].bankOne+'</td>'+
			'<td>&nbsp;'+soBody[u].branch_name1+'</td>'+
			'<td>�����a��</td>'+
			'<td>'+soBody[u].bank_no1+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+soBody[u].bankTwo+'</td>'+
			'<td>&nbsp;'+soBody[u].branch_name2+'</td>'+
			'<td>�����a��</td>'+
			'<td>'+soBody[u].bank_no2+'</td>'+
			'</tr>'+
			'</table>'+
			'</td>'+
			'</tr>'+
			'</table>'+
			'<table style="width: 660px;border:none">'+
			'<tr>'+
			'<td style="font-weight: bold;width:300px;font-size:18px;padding:14px 0" align="center">'+soBody[u].pdfName+'</td>'+
			'<td style="font-weight:bold;padding:20px 0;width:210px;" align="right">'+titleName+'</td>'+
			'<td align="right"  colspan="2">'+
			'<table style="width:120px;height:40px;">'+
			'<tr>'+
			'<td style="border: 1px solid black;"></td>'+
			'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
			'<td style="border: 1px solid black;"></td>'+
			'</tr>'+
			'</table>'+
			'</td>'+
			'</tr>'+
			'</table>'+
			'<table style="width:660px;border: 2px solid rebeccapurple;margin-top: 10px;border-collapse:collapse;">'+
			'<tr>'+
			'<td style="width: 60px;color: white;background-color: black;padding-top:10px" rowspan="2">'+dateName+'</td>'+
			'<td style="width: 100px;border-right:1px solid black;">'+soBody[u].trandate+'</td>'+
			'<td align="left">'+deliveryName+'&nbsp;'+soBody[u].delivery_date+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="border-right:1px solid black;">&nbsp;</td>'+
			'<td></td>'+
			'</tr>'+
			'<tr>'+
			'<td style="width: 60px;border-top:1px solid white ;color: white;background-color: black;padding-top:10px" rowspan="2">'+numberName+'</td>'+
			'<td style="width: 100px;border-top:1px solid black;border-right:1px solid black;"></td>';
			if(soBody[u].soLanguage == '�p��'){
				str+='<td align="left">'+paymentName+'&nbsp;'+soBody[u].soTersmEng+'</td>';
			}else {
				str+='<td align="left">'+paymentName+'&nbsp;'+soBody[u].soTersmJap+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td style="border-right:1px solid black;">'+soBody[u].tranid+'</td>'+
			'<td>'+orderName+'&nbsp;'+soBody[u].otherrefnum+'</td>'+
			'</tr>'+
			'</table>'+
			'<table  style="width: 660px; margin-top: 20px;" cellpadding="0" cellspacing="0">'+
			'<tr>'+
			'<td align="right">Page:<pagenumber/></td>'+
			'</tr>'+
			'</table>'+
			//
			'<table  style="width: 660px;border:1px solid black;margin-top: 1px;" cellpadding="0" cellspacing="0">'+
			'<tr style="height:20px">'+
			'<td style="width: 85px;border-left: 1px solid black;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+codeName+'</td>'+
			'<td style="width: 273px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+poductName+'</td>'+
			'<td style="width: 73px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+quantityName+'</td>';
			if(soBody[u].expressFlg == 'T'){
				str+='<td style="width: 105px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+unitpriceName+'</td>';
				str+='<td style="width: 72px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+amountName+'</td>';	
			}
			str+='<td style="width: 52px;border-left: 1px solid white;color: white;background-color: black;line-height:20px;font-size:8px;" align="center" >'+tempName+'</td>';
			str+='</tr>';
			for(var j =0; j < itemLineArr.length;j++){
				if(soBody[u].soId == itemLineArr[j].soId){
						str+='<tr>'+
						'<td style="border-left: 2px solid black;">'+
						'<table style="width:85px;">'+
						'<tr>'+
						'<td>'+itemLineArr[j].itemid+'</td>'+
						'</tr>'+
						'</table>'+
						'</td>'+	
						
						'<td style="border-left: 1px solid black;">'+
						'<table style="width:273px;">'+
						'<tr>'+
						'<td colspan="3" align="left">'+itemLineArr[j].displayname+'&nbsp;</td>'+
						'</tr>'+
						'<tr>';
						if(!isEmpty(itemLineArr[j].storage_type)){
							str+='<td colspan="3">�u'+itemLineArr[j].storage_type+'�v</td>';
						}else{
							str+='<td colspan="3">&nbsp;</td>';
						}
						str+='</tr>';
						for(var p = 0; p<inventoryDetailArr.length;p++ ){
							var soLine = inventoryDetailArr[p].line;
							var soId = inventoryDetailArr[p].soId;
							if(soId == itemLineArr[j].soId){
								if(soLine == itemLineArr[j].line){
									var serialnumbers = inventoryDetailArr[p].serialnumbers;  
									if(!isEmpty(serialnumbers)){
										str+='<tr>'+
										'<td style="width:83px;font-size:10px;">'+itemLineArr[j].vendorname+'</td>'+
										'<td style="width:132px;font-size:10px;" align="left">'+serialnumbers+'</td>'+
										'<td style="width:70px;font-size:10px;" align="right" >'+expirationDateNmae+'</td>'+
										'</tr>';
									}
								}
							}
							
						}
						str+='</table>'+
						'</td>'+
						
						'<td style="border-left: 1px solid black;">'+
						'<table style="width:73px;">'+
						'<tr>'+
						'<td align="center" style="font-size:10px;">&nbsp;'+itemLineArr[j].quantity+'&nbsp;'+itemLineArr[j].unitabbreviation+'</td>'+
						'</tr>'+
						'<tr>'+
						'<td>&nbsp;</td>'+
						'</tr>';			
						for(var p = 0; p<inventoryDetailArr.length;p++ ){
							var soLine = inventoryDetailArr[p].line;
							var soId = inventoryDetailArr[p].soId;
							if(soId == itemLineArr[j].soId){
								if(soLine == itemLineArr[j].line){
									var expirationdate = inventoryDetailArr[p].expirationdate;  
									str+='<tr>'; 
									if(!isEmpty(expirationdate)){
										str+='<td style="font-size:10px;border-bottom:none;">'+expirationdate+'</td>';
									}else{
										str+='<td style="font-size:10px;border-bottom:none;">&nbsp;</td>';
									}
									str+='</tr>';
								}
							}
						}	
						if(soBody[u].expressFlg == 'T'){
							str+='<tr>'+
							'<td align="right" style="font-size:10px;padding-top:2px;">'+taxRate+':</td>'+
							'</tr>';
						}
						str+='</table>'+
						'</td>';
						
						if(soBody[u].expressFlg == 'T'){
							str+='<td style="border-left: 1px solid black;">'+
							'<table style="width:105px;">'+
							'<tr>'+
							'<td colspan="2" align="center" style="font-size:10px;">&nbsp;'+itemLineArr[j].rateFormat+'</td>'+
							'</tr>'+
							'<tr>'+
							'<td colspan="2">&nbsp;</td>'+
							'</tr>';
							for(var p = 0; p<inventoryDetailArr.length;p++ ){
								var soLine = inventoryDetailArr[p].line;
								var soId = inventoryDetailArr[p].soId;
								if(soId == itemLineArr[j].soId){
									if(soLine == itemLineArr[j].line){
										str+='<tr>'+
										'<td colspan="2" style="border-bottom:none;font-size:10px;">&nbsp;</td>'+
										'</tr>';
									}
								}
							}
							str+='<tr>'+
							'<td align="left" style="font-size:10px;padding-top:2px;">'+itemLineArr[j].taxrate1Format+'</td>'+
							'<td align="right" style="font-size:10px;padding-top:2px;">'+taxAmount+':</td>'+
							'</tr>'+
							'</table>'+
							'</td>';
							
							str+='<td style="border-left: 1px solid black;">'+
							'<table style="width:72px;">'+
							'<tr>'+
							'<td style="font-size:10px;" align="right">&nbsp;'+itemLineArr[j].amount+'</td>'+
							'</tr>'+
							'<tr>'+
							'<td>&nbsp;</td>'+
							'</tr>';
							for(var p = 0; p<inventoryDetailArr.length;p++ ){
								var soLine = inventoryDetailArr[p].line;
								var soId = inventoryDetailArr[p].soId;
								if(soId == itemLineArr[j].soId){
									if(soLine == itemLineArr[j].line){
										str+='<tr>'+
										'<td style="border-bottom:none;font-size:10px;">&nbsp;</td>'+
										'</tr>';
									}
								}
							}
							str+='<tr>'+
							'<td align="right" style="font-size:9px;padding-top:2px;">'+itemLineArr[j].taxamount+'</td>'+
							'</tr>'+
							'</table>'+
							'</td>';
							
						}										
						str+='<td style="border-left: 1px solid black;border-right: 2px solid black;width: 15px;">'+
						'<table style="width:52px;">'+
						'<tr>'+
						'<td style="font-size:8px;">'+itemLineArr[j].deliverytemptyp+'</td>'+
						'</tr>'+
						'</table>'+
						'</td>'+
						'</tr>';
										
				}
			}
			str+='<tr>'+
			'<td style="border-left: 2px solid black;"></td>'+
			'<td style="border-left: 1px solid black;padding-bottom:2px;font-size:10px;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+otherrefnum+'</td>'+
			'<td style="border-left: 1px solid black;"></td>';
			if(soBody[u].expressFlg == 'T'){
				str+='<td style="border-left: 1px solid black;"></td>'+
				'<td style="border-left: 1px solid black;"></td>';
			}
			str+='<td style="border-left: 1px solid black;border-right: 2px solid black;"></td>'+
			'</tr>'+
			'</table>'+
			
			'<table style="border-top:2px solid black;width: 660px;" >'+
			'<tr>'+
			'<td style="width:420px;"></td>';
			if(soBody[u].expressFlg == 'T'){
				str+='<td style="width: 80px;height:30px;background-color: black;color: white;padding-top:15px;font-size:8px;" align="center">'+totalName+'</td>'+
				'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+amountTotal+'</td>';
			}
			str+='</tr>'+
			
			'<tr>'+
			'<td style="width:470px;">&nbsp;&nbsp;'+deliName+':'+soBody[u].destinationName+'</td>';
			if(soBody[u].expressFlg == 'T'){
				str+='<td style="width: 80px;height:30px;background-color: black;padding-top:15px;color: white;border-top:1px solid white;font-size:8px;" align="center">'+consumptionTax+'</td>'+
				'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+taxamountTotal+'</td>';
			}
			str+='</tr>'+
			
			'<tr>'+
			'<td>'+
			'<table>';
			if(!isEmpty(soBody[u].destinationSales)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+soBody[u].destinationSales+'</td>'+
				'</tr>';	
			}
			if(!isEmpty(soBody[u].destinationZip)&& !isEmpty(soBody[u].destinationState)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��'+soBody[u].destinationZip+'&nbsp; '+soBody[u].destinationState+'</td>'+
				'</tr>';
			}
			str+='</table>'+
			'</td>';
			if(soBody[u].expressFlg == 'T'){
				str+='<td style="width: 80px;height:30px;background-color: black;padding-top:15px;color: white;border-top:1px solid white;border-bottom:2px solid black;font-size:8px;" align="center">'+invoiceNameString+'</td>'+
				'<td style="width: 30px;height:30px;padding-top:25px;border:1px solid black;border-bottom:2px solid black" align="left">'+pocurrencyMoney+'</td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;border-bottom:2px solid black;" align="center">'+toTotal+'</td>';
			}
			str+='</tr>';
			
			if(!isEmpty(soBody[u].destinationCity)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+soBody[u].destinationCity+'</td>'+
				'</tr>';
			}
			if(!isEmpty(soBody[u].destinationAddress2) || !isEmpty(soBody[u].destinationAddress)){
				str+='<tr>'+
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+soBody[u].destinationAddress+soBody[u].destinationAddress2+'</td>'+
				'</tr>';
			}	
			
			str+='</table>';
			str += '<pbr/>';
		}
		if(str.substring(str.length - 6) == '<pbr/>'){
			str = str.substring(0,str.length - 6);
		}
		str += '</body></pdf>';
		return str;
//	}	
}


function formatDateTime(dt){    //���ݓ���
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2) + ' ' + PrefixZero(dt.getHours(), 2) + ":" + PrefixZero(dt.getMinutes(), 2)) : '';
}
function savePdf(pdfData){
	try{

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(pdf(pdfData));
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_DJ_DELIVERY_SLIP_ISSUE);
		xlsFile.setName('DJ_�ݸ���߯�ݸ�ؽā��z���`�[���s' + '_' + getFormatYmdHms() + '.pdf');
		// save file
		return nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'DJ_�ݸ���߯�ݸ�ؽā��z���`�[', e)
	}
}
function savePdfTwo(pdfData){
	try{

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(pdfTwo(pdfData));
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_DJ_DELIVERY_SLIP_ISSUE);
		xlsFile.setName('DJ_�o�׎w�}��' + '_' + getFormatYmdHms() + '.pdf');
		// save file
		return nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'DJ_�o�׎w�}��', e)
	}
}
function savePdfThree(pdfData){
	try{

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(pdfThree(pdfData));
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_DJ_DELIVERY_SLIP_ISSUE);
		xlsFile.setName('DJ_�z���˗���' + '_' + getFormatYmdHms() + '.pdf');
		// save file
		return nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'DJ_�z���˗���', e)
	}
}
function savedeliveryPDF(pdfData){
	try{

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(deliveryPDF(pdfData));
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_DJ_DELIVERY_SLIP_ISSUE);
		xlsFile.setName('DJ_�[�i��' + '_' + getFormatYmdHms() + '.pdf');
		// save file
		return nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'DJ_�[�i��', e)
	}
}
function csvDown(xmlString){
	try{
	
		var xlsFile = nlapiCreateFile('DJ_�ݸ���߯�ݸ�ؽā��z���`�[���s' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
		
		xlsFile.setFolder(FILE_CABINET_ID_TOTAL_INV_OUTPUT_FILE);
		xlsFile.setName('DJ_�ݸ���߯�ݸ�ؽā��z���`�[���s' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setEncoding('SHIFT_JIS');
	    
		// save file
		return  nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'no error csvDown', e)
	}
}
function replace(text)
{
if ( typeof(text)!= "string" )
   text = String(text);

text = text.replace(/,/g, "_") ;

return text ;
}
function defaultEmpty(src){
	return src || '';
}
function defaultEmptyToZero(src){
	return src || 0;
}
function transfer(text){
	if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

return text ;
}