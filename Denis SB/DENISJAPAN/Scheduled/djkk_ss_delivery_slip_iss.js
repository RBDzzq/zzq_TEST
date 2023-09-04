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
//	nlapiLogExecution('debug', '', 'DJ_ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票発行開始');
	var str1 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_delivery_slip_iss2');
	var jobParam = JSON.parse(str1);
	var type = jobParam.type;
	var jobId = jobParam.jobId;
	if(type == 'savePDF'){
		var str2 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_delivery_slip_iss3');
		var str3 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_delivery_slip_iss4');
		var strArr = str2.split(',');
		var pdfData = JSON.parse(str3);	
		var fileIdPdf = savePdf(pdfData); 	//ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄPDF
		var fileIdTwoPdf = savePdfTwo(pdfData);//出荷指示書PDF
		var fileIdThreePdf = savePdfThree(pdfData);//配送依頼書PDF
		var deliveryPdf = savedeliveryPDF(pdfData);  //納品書PDF
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
		var pdf_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf"));//ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄPDF
		var pdfTwo_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf_two"));//出荷指示書
		var pdfThree_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf_three"));//配送依頼書PDF
		var deliveryPdf = parseInt(jobSearch[0].getValue("custrecord_so_pdf_four"));//納品書PDF
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
							nlapiSendEmail(nlapiGetUser(), mailArr[0], 'DJ_ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票発行CSV', 'ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票発行CSV', null, null, null, nlapiLoadFile(csv_fileid));
						}
						if(locationArr.indexOf('DPKK')>-1){
							nlapiSendEmail(nlapiGetUser(), mailArr[0], 'DJ_出荷指図書', 'DJ_出荷指図書伝票発行', null, null, null, nlapiLoadFile(pdfTwo_fileid));
							nlapiSendEmail(nlapiGetUser(), mailArr[0], 'DJ_ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票発行', 'ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票発行', null, null, null, nlapiLoadFile(pdf_fileid));
						}
						if(locationArr.indexOf("Keihin")<0 && locationArr.indexOf("DPKK")<0){
							nlapiSendEmail(nlapiGetUser(), mailArr[0], 'DJ_配送依頼書', 'DJ_配送依頼書伝票発行', null, null, null, nlapiLoadFile(pdfThree_fileid));
						}
						nlapiSendEmail(nlapiGetUser(), mailArr[0], 'DJ_納品書', 'DJ_納品書自動送信', null, null, null, nlapiLoadFile(deliveryPdf));
			
				}else{
					nlapiLogExecution('DEBUG', '', 'メールアドレス存在しないため送信できませんでした。');
				}	
			}
		}else{
			nlapiLogExecution('DEBUG', '', '倉庫を存在しないため、処理終了');
		}	
		for(var j = 0 ; j < soArr.length ; j++){
			nlapiSubmitField('salesorder', soArr[j], 'custbody_djkk_shippinglist_sended', 'T', false);
		}
			
	}
}

function createCsv(pdfData){
	var str='不使用,事業所ｺｰﾄﾞ,寄託者ｺｰﾄﾞ,不使用,不使用,不使用,オーダー番号,オーダー番号行,不使用,出荷日,納品日,不使用,納品先住所,納品先名称,納品先電話番号,納品先郵便番号,不使用,運送便ｺｰﾄﾞ,貨物番号,';
	str+='細分番号（ロット番号）,不使用,不使用,倉号,品名,個数,端数,入数,社内記事,社外記事,明細備考,データ作成日,予備１（宅配便着指定）,予備２（代引き合計金額）,予備３（支払条件）,予備４（ロット）,予備５（倉庫コード）\r\n';
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
		var depositor = defaultEmpty(soObj.getFieldValue('custbody_djkk_depositor'));//DJ_寄託者
		var transactionnumber = defaultEmpty(soObj.getFieldValue('transactionnumber'));//トランザクション番号
//		納品先.DJ_都道府県＋納品先.DJ_市区町村＋納品先.DJ_納品先住所1＋納品先.DJ_納品先住所2
		var deliveryId = soObj.getFieldValue('custbody_djkk_delivery_destination');//DJ_納品先
		var deliveryAll ='';
		var name = '';
		var phone = '';
		var zip = '';
		if(!isEmpty(deliveryId)){
			var deliveryObj = nlapiLoadRecord('customrecord_djkk_delivery_destination',deliveryId);
			var prefectures = deliveryObj.getFieldValue('custrecord_djkk_prefectures');//納品先.DJ_都道府県
			var municipalities = deliveryObj.getFieldValue('custrecord_djkk_municipalities');//納品先.DJ_市区町村
			var residence = deliveryObj.getFieldValue('custrecord_djkk_delivery_residence');//納品先.DJ_納品先住所1
			var residenceTwo = deliveryObj.getFieldValue('custrecord_djkk_delivery_residence2');//納品先.DJ_納品先住所2
			 deliveryAll = prefectures+municipalities+residence+residenceTwo;
			 name = deliveryObj.getFieldValue('custrecorddjkk_name');//納品先.名前
			 phone = deliveryObj.getFieldValue('custrecord_djkk_delivery_phone_number');//'納品先.DJ_納品先電話番号
			 zip = deliveryObj.getFieldValue('custrecord_djkk_zip');//納品先.DJ_郵便番号
		}
		var sowmsmemo = defaultEmpty(soObj.getFieldValue('custbody_djkk_de_sowmsmemo'));//DJ_納品先注文時倉庫向け備考
		var memo = defaultEmpty(soObj.getFieldValue('memo'));//メモ
		var trandate = soObj.getFieldValue('trandate');//作成日付
		var shippingCompany = soObj.getFieldValue('custbody_djkk_shipping_company');//DJ_運送会社
		var shippingVal = '';
		if(isEmpty(shippingCompany)){
			shippingVal = '';
		}else{
			shippingVal = nlapiLookupField('customrecord_djkk_shippingcompany_mst',shippingCompany,'custrecord_djkk_shippingcompany_code');
		}
		var deliveryTimeObj = defaultEmpty(soObj.getFieldValue('custbody_djkk_delivery_time_zone'));//DJ_配達指定時間帯(佐川用)
		var deliverytime='';
		if(isEmpty(deliveryTimeObj)){
			deliverytime='';
		}else{
			deliverytime = nlapiLookupField('customrecord_djkk_csv_group',deliveryTimeObj,'custrecord9');
		}
		var payment = defaultEmpty(soObj.getFieldText('custbody_djkk_payment_conditions'));//DJ_支払方法
		var total = '';
		var number = ''
		if(payment=='代引き'){
			total = soObj.getFieldValue('total');//合計
			number = '01';
		}else{
			total = '0';
			number='00';
		}		
		var soCount = soObj.getLineItemCount('item');
		for(var a=1;a<soCount+1;a++){
			var item = soObj.getLineItemValue('item','item',a);
			var itemName = defaultEmpty(soObj.getLineItemText('item','item',a));//SO.明細.アイテム.アイテム名前
			var itemShipDate = soObj.getLineItemValue('item','custcol_djkk_ship_date',a);//SO.明細.出荷日
			var itemDeliDate = soObj.getLineItemValue('item','custcol_djkk_delivery_date',a);//SO.明細.納品日
			var itemLine = a;//'ライン番号
			var itemLineNum = '';
			if(String(itemLine).length==1){
				itemLineNum='0'+'0'+itemLine;
			}else if(String(itemLine).length==2){
				itemLineNum='0'+itemLine;
			}else if(String(itemLine).length==3){
				itemLineNum=itemLine;
			}
			var itemCode =itemName; //SO.明細.アイテム.アイテムコード
			var itemQuantity = Number(soObj.getLineItemValue('item','quantity',a));//アイテム.数量
			var itemLocation = soObj.getLineItemText('item','location',a);//SO.明細.倉庫.名前
			var pushnumber = Number(nlapiLookupField('item',item,'custitem_djkk_perunitquantity'));//SO.明細.アイテム.入数
			var Numvalue = Number(itemQuantity)%Number(pushnumber);//SO.明細.アイテム.数量％SO.明細.アイテム.入数
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
			var shipdate = defaultEmpty(soRecord.getFieldValue('shipdate'));//出荷日
			var hopedate = defaultEmpty(soRecord.getFieldValue('custbody_djkk_delivery_hopedate'));//DJ_納品希望日
			var memo = defaultEmpty(soRecord.getFieldValue('memo'));//備考
			var tranid = defaultEmpty(soRecord.getFieldValue('tranid'));//注文番号 
			var subsidiary = defaultEmpty(soRecord.getFieldText('subsidiary'));//子会社
			var location = defaultEmpty(soRecord.getFieldText('location'));//場所 
			var shippinginstructdt = defaultEmpty(soRecord.getFieldValue('custbody_djkk_shippinginstructdt'));//出荷指示日時
			var shipmethod = defaultEmpty(soRecord.getFieldText('shipmethod'));//配送方法 
			var deliverytimedesc = defaultEmpty(soRecord.getFieldValue('custbody_djkk_deliverytimedesc'));//DJ_納入時間帯記述
			var entity = defaultEmpty(soRecord.getFieldValue('entity'));//顧客    
			
			var customerSearch = nlapiSearchRecord("customer",null,
					[
					   ["internalid","anyof",entity]
					], 
					[
					   new nlobjSearchColumn("entityid").setSort(false),   //顧客ID
					   new nlobjSearchColumn("companyname"),  //顧客名
					   new nlobjSearchColumn("custentity_djkk_activity"),     //DJ_セクション
					   new nlobjSearchColumn("salesrep"),  //販売員（当社担当）
					   new nlobjSearchColumn("address2","billingAddress",null), //請求先住所1
					   new nlobjSearchColumn("phone"), //電話番号
					   new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
					]
					);
			var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//顧客ID
			var companyname= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//顧客名
			var activity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_activity"));//DJ_セクション
			var salesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//販売員（当社担当）
			var zip= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//郵便番号
			var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//phone
			var address= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//請求先住所1
			
			soArray.push({
				shipdate:shipdate,  //出荷日
				hopedate:hopedate,  //DJ_納品希望日
				memo:memo,  //備考
				tranid:tranid, //注文番号 
				subsidiary:subsidiary, //子会社
				location:location, //場所 
				shippinginstructdt:shippinginstructdt, //出荷指示日時
				shipmethod:shipmethod, //配送方法 
				deliverytimedesc:deliverytimedesc, //DJ_納入時間帯記述
				zip:zip,  //ZIP
				phone:phone, //phone
				address:address, //住所
				entityid:entityid, //顧客ID
				companyname:companyname, //顧客名
				activity:activity, //DJ_セクション
				salesrep:salesrep, //販売員（当社担当）
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
						 new nlobjSearchColumn("countryofmanufacture"),//積載地
						 new nlobjSearchColumn("custitem_djkk_radioactivity_classifi"), //DJ_8_放射性区分
						 new nlobjSearchColumn("displayname"),
						 new nlobjSearchColumn("custitem_djkk_deliverytemptyp"), //DJ_配送温度区分
						]
					); 
				
				var countryofmanufacture= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("countryofmanufacture"));//積載地
				var classifi= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getText("custitem_djkk_radioactivity_classifi"));//DJ_8_放射性区分
				var displayname= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//名前
				var deliverytemptyp= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getText("custitem_djkk_product_category_sml"));//配送温度
				
				var lineNo = defaultEmpty(soRecord.getLineItemValue('item','line',a));	//行
				var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//数量
				var itemNo = defaultEmpty(soRecord.getLineItemValue('item','description',a));//説明
				
				soBody.push({
					itemName:itemName, //item
					countryofmanufacture:countryofmanufacture, //積載地
					classifi:classifi, //DJ_8_放射性区分
					displayname:displayname,
					deliverytemptyp:deliverytemptyp,
					lineNo:lineNo,
					quantity:quantity,
					itemNo:itemNo, //説明
					soId:soId,
					item:item,
					line:line,
//					upccode:upccode,
				});
				
				var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //在庫詳細
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
							serialnumbers = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
							if(isEmpty(serialnumbers)){
						    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
						    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    );    
						    	 serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////シリアル/ロット番号	
						    	
					    	}
							var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //有效期限	
							var invquantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'); //数量	
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
						    	
						    	// DJ_メーカー製造ロット番号
							    makerNumber=inventoryDetail.getCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code');
							    barcode+='10';
						    	barcodeTxt+='(10)';						    
						    }else if (itemType.isserialitem=='T') {
						    	
						    	// DJ_メーカーシリアル番号
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
	
			//伝票作成
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
			    '<td style="font-size: 22px;font-weight: bold;text-decoration: underline;" align="center" colspan="3">ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ</td>'+
			    '<td colspan="3"></td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="1">'+soArray[m].tranid+'</td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" >N001:</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">'+soArray[m].subsidiary+'</td>'+
			    '<td></td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;"  colspan="2">出力日時</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:' + formatDateTime(new Date()) + '</td>'+
			    '<td ></td>' +
			    '<td style="vertical-align:middle;font-size: 13px" colspan="2"><pagenumber/>&nbsp;ページ</td>' +
			    '</tr>'+
			    '<tr>'+
			    '<td></td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" >S001:</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">'+soArray[m].location+'</td>'+
			    '<td style="font-size: 13px;font-weight: bold;text-decoration: underline;" align="left" colspan="2">ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ</td>'+
			    '<td colspan="4"></td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td colspan="8"></td>'+
			    '<td>出荷</td>'+
			    '<td></td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">印刷ページ </td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;<pagenumber/></td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">出荷作業番号</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;S545646546546546</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;&nbsp;出荷製造番号</td>'+
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
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">印刷出荷日</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].shipdate+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">出荷指示番号</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;S545646546546546</td>'+
			    '<td colspan="2" rowspan="2" align="left"><barcode codetype="code128" value="'+ soArray[m].tranid + '"/></td>' +
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">出荷予定日</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].shippinginstructdt+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">発生元番号</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].tranid+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">配送伝票</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].shipmethod+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先コード</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].entityid+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先郵便番号</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].zip+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先住所</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].address+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先電話番号</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].phone+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].companyname+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">配送指定日</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].hopedate+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先部署名</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].activity+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">配送指定時間帯</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].deliverytimedesc+'</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先担当者</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].salesrep+'</td>'+
			    '</tr>'+
			    '<tr>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="2">備考</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="4">:&nbsp;'+soArray[m].memo+'</td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="3">&nbsp;&nbsp;NO.&nbsp;&nbsp;商品コード</td>'+
			    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="3">商品名</td>'+
			    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="8">**&nbsp;&nbsp;..区分</td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;備考</td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;明細フリーェリア</td>'+
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
			    '<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="4">中岡ロケ ロケーョンコード </td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">ロット番号 </td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">賞味期限 </td>'+
			    '<td colspan="4"></td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">数量 </td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td colspan="4"></td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">積載地区分</td>'+
			    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">配送温度区分</td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">放射性有無区分 </td>'+
			    '<td colspan="2"></td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">()</td>'+
			    '</tr>'+
			    '<tr style="font-weight: bold;">'+
			    '<td colspan="8"></td>'+
			    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="4">バーコード </td>'+
			    '</tr>'+
			    '</table>';
				for(var u = 0;u<soBody.length;u++){
					if(soArray[m].soId == soBody[u].soId){
								
						str+='<table style="border-bottom: 1px dotted black;border-collapse: collapse;">'+
						    '<tr>'+
						    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="3">&nbsp;&nbsp;NO.'+soBody[u].lineNo+'&nbsp;&nbsp;'+soBody[u].itemName+'</td>'+
						    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="3">'+soBody[u].displayname +'</td>'+
						    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="8">**&nbsp;&nbsp;..区分</td>'+
						    '</tr>'+
						    '<tr>'+
						    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;備考</td>'+
						    '</tr>'+
						    '<tr>'+
						    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;明細フリーェリア</td>'+
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
			var shipdate = defaultEmpty(soRecord.getFieldValue("shipdate"));//出荷日
			var shipping_company = defaultEmpty(soRecord.getFieldValue("custbody_djkk_shipping_company"));//DJ_運送会社
			var delivery_date = defaultEmpty(soRecord.getFieldValue("custbody_djkk_delivery_date"));//DJ_納品日
			var delivery_time = defaultEmpty(soRecord.getFieldValue("custbody_djkk_delivery_time"));//DJ_配達指定時間
			var tranid = defaultEmpty(soRecord.getFieldValue("tranid"));//注文番号
			var otherrefnum = defaultEmpty(soRecord.getFieldValue("otherrefnum"));//発注書番号
			var specifications = defaultEmpty(soRecord.getFieldValue("custcol_djkk_specifications"));//DJ_規格
			var entity = defaultEmpty(soRecord.getFieldValue("entity"));//顧客
			
			var customerSearch = nlapiSearchRecord("customer",null,
					[
					   ["internalid","anyof",entity]
					], 
					[
					   new nlobjSearchColumn("entityid").setSort(false),   //顧客ID
					   new nlobjSearchColumn("companyname"),  //顧客名
					   new nlobjSearchColumn("custentity_djkk_activity"),     //DJ_セクション
					   new nlobjSearchColumn("salesrep"),  //販売員（当社担当）
					   new nlobjSearchColumn("phone"),  //電話
					   new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//都道府県
					   new nlobjSearchColumn("city","Address",null),//市区町村
					   new nlobjSearchColumn("address3","Address",null),//住所2
					   new nlobjSearchColumn("address2","Address",null),//住所1

					]
					);
			var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//顧客ID
			var companyname= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//顧客名
			var activity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_activity"));//DJ_セクション
			var salesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//販売員（当社担当
			var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("phone"));//電話				
			var address_state= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//都道府県
			var city= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","Address",null));//市区町村
			var addr2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","Address",null));///住所2
			var addr1= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","Address",null));//住所1
			
			bodyArr.push({
				shipdate:shipdate,//出荷日
//				shipping_company:shipping_company,//DJ_運送会社
				delivery_date:delivery_date,//DJ_納品日
//				delivery_time:delivery_time,//DJ_配達指定時間
//				tranid:tranid,//注文番号
				otherrefnum:otherrefnum,//発注書番号
				entityid:entityid,//顧客ID
				companyname:companyname,//顧客名
				activity:activity,//DJ_セクション
				salesrep:salesrep,//販売員（当社担当
				phone:phone,//電話	
				address_state:address_state,//都道府県
				city:city,////市区町村
				addr1:addr1,//住所1
				addr2:addr2,//住所2
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
						 new nlobjSearchColumn("custitem_djkk_radioactivity"),//DJ_4_放射能量
						 new nlobjSearchColumn("custitem_djkk_radioactivity_classifi"), //DJ_8_放射性区分
						 new nlobjSearchColumn("serialnumber"),
						 new nlobjSearchColumn("displayname"),//名前
						 new nlobjSearchColumn("itemid"),//code
						]
					    ); 
				
				var radioactivity= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("custitem_djkk_radioactivity"));//DJ_4_放射能量
				var radioactivity_classifi= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("custitem_djkk_radioactivity_classifi"));//DJ_8_放射性区分
				var serialnumber= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("serialnumber"));
				var displayname= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//名前
				var itemid= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("itemid"));//code
				
				var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//数量
				
				
				itemArr.push({
					soId:soId,
					itemid:itemid,
					specifications:specifications,//DJ_規格
					radioactivity:radioactivity,//DJ_4_放射能量
					radioactivity_classifi:radioactivity_classifi,//DJ_8_放射性区分
					displayname:displayname,//DJ_8_放射性区分
					quantity:quantity,//数量
					serialnumber:serialnumber,
					line:line,
					tranid:tranid,//注文番号
					shipping_company:shipping_company,//DJ_運送会社
					delivery_time:delivery_time,//DJ_配達指定時間
				});
				var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //在庫詳細
				if(!isEmpty(inventoryDetail)){
					var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
					if(inventoryDetailCount != 0){
						for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
							inventoryDetail.selectLineItem('inventoryassignment',j);
							var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
							if(isEmpty(receiptinventorynumber)){
						    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
						    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    );    
						    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////シリアル/ロット番号	
						    	
					    	}
							var invQuantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'); //数量
							
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
		'<td style="font-weight: bold;font-size:20px;" >DENISファーマ(株)</td>'+
		'<td style="font-weight: bold;font-size:20px;" >出荷指図書&nbsp;&nbsp;詳細</td>'+
		'<td style="font-weight: bold;" align="center">&nbsp;出荷日&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+shipdate+'</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="2">&nbsp;</td>'+
		'<td style="font-weight: bold;padding-left:100px;">&nbsp;&nbsp;輸送業者&nbsp;&nbsp;&nbsp;&nbsp;'+shipping_company+'</td>'+
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
			'<td style="font-weight: bold;width:120px">免疫検査課RIA</td>'+
			'<td style="font-weight: bold;" align="center">'+bodyArr[u].salesrep+'</td>'+
			'<td style="font-weight: bold;margin-left:10px;" align="left">'+bodyArr[u].address_state+bodyArr[u].city+bodyArr[u].addr1+bodyArr[u].addr2+'</td>'+
			'<td style="font-weight: bold;padding-right:35px;" align="right">'+bodyArr[u].phone+'</td>'+
			'</tr>'+
			'</table>'+		
			'<table style="border-top: 1px solid black;">'+
			'<tr>'+
			'<td style="width: 140px;font-weight: bold;">受注NO</td>'+
			'<td style="font-weight: bold;">納品日</td>'+
			'<td style="font-weight: bold;" colspan="5">配達時間</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="font-weight: bold;">&nbsp;&nbsp;&nbsp;品番</td>'+
			'<td style="font-weight: bold;" >品名</td>'+
			'<td style="font-weight: bold;width:140px;" align="center">ロット</td>'+
			'<td style="font-weight: bold;margin-left:20px;">数量&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(引落)</td>'+
			'<td style="font-weight: bold;">規格容量</td>'+
			'<td style="font-weight: bold;margin-left:-10px;">取扱区分</td>'+
			'<td style="font-weight: bold;padding-right:32px;" align="right">放射性</td>'+
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
									'<td style="font-weight: bold;margin-left:20px;" align="center">'+quantity+'&nbsp;&nbsp;&nbsp;未</td>'+
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
					'<td align="left" colspan="3" style="width: 240px;">客先発注番号:'+bodyArr[u].otherrefnum+'</td>'+
					'<td colspan="3" align="left">客先発注番号:E814212201</td>'+
					'</tr>'+
					'<tr>'+
					'<td align="right">502</td>'+
					'<td align="left" colspan="6" style="width: 240px;">*同一LOT指定納期指定 NEWロット納品希望</td>'+
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
			var subsidiary = defaultEmpty(soRecord.getFieldValue("subsidiary"));//子会社
			var subsidiarySearch= nlapiSearchRecord("subsidiary",null,
					[
						["internalid","anyof",subsidiary]
					], 
					[
						new nlobjSearchColumn("legalname"),  //正式名称
						new nlobjSearchColumn("name"), //名前
						new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //会社名前英語
						new nlobjSearchColumn("phone","address",null), //tel
						new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
					]
					);	
			var legalname= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("legalname"));//正式名称
			var subname= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("name"));//名前
			var subsidiary_en= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//会社名前英語
			var subphone= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("phone","address",null));//tel
			var subfax= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax	
		
			
			var tranid = defaultEmpty(soRecord.getFieldValue("tranid"));//注文番号
			var trandate = defaultEmpty(soRecord.getFieldValue("trandate"));//日付
			var entity = defaultEmpty(soRecord.getFieldValue("entity"));//顧客
			var customerSearch= nlapiSearchRecord("customer",null,
					[
						["internalid","anyof",entity]
					], 
					[
					    new nlobjSearchColumn("address"), //請求先住所 
				    	new nlobjSearchColumn("country","billingAddress",null), //請求先国
				    	new nlobjSearchColumn("attention","billingAddress",null), //請求先宛名（担当者）
				    	new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
				    	new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
				    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県 		
				    	new nlobjSearchColumn("phone"), //請求先電話番号
				    	new nlobjSearchColumn("fax"), //請求先Fax						  
					]
					);	
			var cusaddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address"));//請求先住所 
			var country= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("country","billingAddress",null));//請求先国
			var attention= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("attention","billingAddress",null));//請求先宛名（担当者）
			var city= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//請求先市区町村
			var zipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zip","billingAddress",null));//請求先郵便番号
			var state= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//請求先都道府県 
			var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//請求先電話番号
			var fax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//請求先fax
					
			var destination = defaultEmpty(soRecord.getFieldValue("custbody_djkk_delivery_destination"));//DJ_納品先
			if(!isEmpty(destination)){
				var destinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
						[
							["internalid","anyof",destination]
						], 
						[
							new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
							new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
							new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
							new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
							new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
							new nlobjSearchColumn("custrecord_djkk_delivery_phone_number"),  //納品先電話番号
							new nlobjSearchColumn("custrecord_djkk_fax"),  //納品先Fax
							new nlobjSearchColumn("custrecord_djkk_delivery_code"),  //納品先コード
							new nlobjSearchColumn("custrecorddjkk_name"),  //納品先名前
								  
						]
						);	
				var destinationZip= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_zip"));//郵便番号
				var destinationState= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_prefectures"));//都道府県
				var destinationCity= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_municipalities"));//DJ_市区町村
				var destinationAddress= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_delivery_residence"));//DJ_納品先住所1
				var destinationAddress2= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_delivery_residence2"));//DJ_納品先住所2
				var destinationPhone= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_delivery_phone_number"));//納品先電話番号
				var destinationFax= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_fax"));//納品先Fax
				var delivery_code= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecord_djkk_delivery_code"));//納品先コード
				var name= defaultEmpty(isEmpty(destinationSearch) ? '' :  destinationSearch[0].getValue("custrecorddjkk_name"));//納品先名前			
			}
			 
			
			var memo = defaultEmpty(soRecord.getFieldValue("memo"));//memo
			var delivery_date = defaultEmpty(soRecord.getFieldValue("custbody_djkk_delivery_date"));//DJ_納品日
			var shipping_company = defaultEmpty(soRecord.getFieldValue("custbody_djkk_shipping_company"));//運送会社
			var location = defaultEmpty(soRecord.getFieldValue("location"));//場所
			var otherrefnum = defaultEmpty(soRecord.getFieldValue("otherrefnum"));//発注書番号
			delivery.push({
				legalname:legalname, ////正式名称
				subname:subname,//名前
				subsidiary_en:subsidiary_en,//会社名前英語
				subphone:subphone,//会社tel
				subfax:subfax,//会社fax
				tranid:tranid,//注文番号
				trandate:trandate,//日付
				entity:entity,//顧客
				cusaddress:cusaddress,//請求先住所 
				country:country,//請求先国
				attention:attention,//請求先宛名（担当者）
				city:city,//請求先市区町村
				zipcode:zipcode,//請求先郵便番号
				state:state,//請求先都道府県
				phone:phone,//請求先電話番号
				fax:fax,//請求先fax
				destinationZip:destinationZip,//納品先郵便番号
				destinationState:destinationState,//納品先都道府県
				destinationCity:destinationCity,//納品先市区町村
				destinationAddress:destinationAddress,//納品先住所1
				destinationAddress2:destinationAddress2,//納品先住所2
				destinationPhone:destinationPhone,//納品先電話番号
				destinationFax:destinationFax,//納品先Fax
				delivery_code:delivery_code,//納品先コード
				name:name,//納品先名前	
				delivery_date:delivery_date,//DJ_納品日
				shipping_company:shipping_company,//運送会社
				location:location,//場所
				otherrefnum:otherrefnum,//発注書番号
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
						  new nlobjSearchColumn("itemid"), //商品コード
						  new nlobjSearchColumn("displayname"), //商品名
						]
						); 
					
				var itemid= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("itemid"));//商品コード
				var displayname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("displayname"));//商品名
					
				var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//数量
				var unitabbreviation = defaultEmpty(soRecord.getLineItemValue('item','units_display',a));//単位
				var casequantity = defaultEmpty(soRecord.getLineItemValue('item','custcol_djkk_casequantity',a));//ケース数
				var perunitquantity = defaultEmpty(soRecord.getLineItemValue('item','custcol_djkk_perunitquantity',a));//入数
				itemArr.push({
					itemid:itemid,//商品コード
					displayname:displayname,//商品名
					quantity:quantity,//数量
					unitabbreviation:unitabbreviation,//単位
					casequantity:casequantity,//ケース数
					perunitquantity:perunitquantity,//入数		
					line:line,//行
					soId:soId,
				});	
				
				var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //在庫詳細
				if(!isEmpty(inventoryDetail)){
					var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
					if(inventoryDetailCount != 0){
						for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
							inventoryDetail.selectLineItem('inventoryassignment',j);
							var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
							if(isEmpty(receiptinventorynumber)){
						    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
						    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    );    
						    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////シリアル/ロット番号	
					    	}
							var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //有效期限
							var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'); //DJ_倉庫入庫番号
							var serialCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'); //DJ_メーカー製造ロット番号
							inventoryDetailArr.push({
									line:line,
									serialnumbers:serialnumbers,//シリアル/ロット番号
									expirationdate:expirationdate,	//有效期限
									warehouseCode:warehouseCode,//DJ_倉庫入庫番号
									serialCode:serialCode,//DJ_メーカー製造ロット番号
									soId:soId,
							});
						}
					}
				}else{
					inventoryDetailArr.push({
						serialnumbers:'',//シリアル/ロット番号
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
		'		<td align="center" colspan="50" >配送依頼書</td>'+
		'		<td align="right" colspan="25">日付：'+delivery[j].trandate+'</td>'+
		'	</tr>'+
		'	<tr>'+
		'		<td align="right" colspan="25"></td>'+
		'		<td colspan="50">&nbsp;</td>'+
		'		<td align="right" colspan="25">受注番号'+delivery[j].tranid+'</td>'+
		'	</tr>'+
		'</table>'+
	//	
		'<table cellpadding="2" cellspacing="2" style="width:660px;margin:0 0.2in;border-bottom:1px solid black">'+
		'<tr>'+
		'<td style="width:300px;border-bottom: 1px solid black;">田井</td>'+
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
		'<td style="width: 300px;height: 17px;" colspan="2">納品先：'+delivery[j].name+'</td>'+
		'<td>納品先コード：'+delivery[j].delivery_code+'</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 130px;height: 17px;">&nbsp;&nbsp;TEL:'+delivery[j].destinationPhone+'</td>'+
		'<td style="width: 170px;height: 17px;">T'+delivery[j].destinationZip+'</td>'+
		'<td></td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 130px;height: 17px;">&nbsp;&nbsp;FAX:'+delivery[j].destinationFax+'</td>'+
		'<td style="width: 170px;height: 17px;">'+delivery[j].destinationState+'</td>'+
		'<td>請求先</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 130px;height: 17px;"></td>'+
		'<td style="width: 170px;height: 17px;">'+delivery[j].destinationCity+'&nbsp;'+ +delivery[j].destinationAddress+'</td>'+
		'<td>&nbsp;コード：B14-0002(25&nbsp;&nbsp;&nbsp;069)</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="2"></td>'+
		'<td>&nbsp;&nbsp;名称：ホシケミカルズ株式会社</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="2"></td>'+
		'<td>&nbsp;&nbsp;&nbsp;WH:26</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 130px;height: 17px;">納品日:'+delivery[j].delivery_date+'</td>'+
		'<td style="height: 17px;" colspan="2">願客の注文番号:'+delivery[j].otherrefnum+'</td>'+
		'</tr>'+	
		'</table>'+
		
		'<table cell-spacing="0" style="width:660px;margin:0 0.2in 0.2in;border-collapse: collapse;"><tr>'+
		'<td style="width:80%; padding-left: 0px; padding-right: 0px;">'+
		'<table cellpadding="0" cellspacing="0" style="width: 100%;"><tr>'+
		'<td style="width: 50%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">運送会社:'+delivery[j].shipping_company+'</td>'+
		'</tr>'+
		'<tr>'+
		'<td style="width: 50%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">備考:'+delivery[j].memo+'</td>'+
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
		'<td style="width: 50%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">下記のとおり配送の程宜しくお願い致します。</td>'+
		'<td style="width: 50%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom" align="right">Page:1</td>'+
		'</tr></table>'+
	//	
		'<table style="width: 660px;border-collapse:collapse; margin-right:3px;" align="center" cellpadding="0" cellspacing="0">'+
		'<tr>'+
		'<td align="center" style="width: 95px;border-style:solid;border-color:#499AFF;border-left-width:2px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">品コード</td>'+
		'<td align="center" style="width: 250px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">品名</td>'+
		'<td align="center" style="width: 105px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">入数</td>'+
		'<td align="center" style="width: 105px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">カートン</td>'+
		'<td align="center" style="width: 105px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;border-right-width:2px; border-bottom-width:1px;line-height:30px;">合計数量</td>'+
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
		'<span style="font-size:9px;">&nbsp;&nbsp;&nbsp;&nbsp;〒100-0013東京都千代田区霞が関3-6-7 霞が関プレイス</span><br />'+
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
			var entity = soRecord.getFieldValue('entity');//顧客
			var customform = soRecord.getFieldValue('customform');//customform
			var customerSearch= nlapiSearchRecord("customer",null,
					[
						["internalid","anyof",entity]
					], 
					[
					 	new nlobjSearchColumn("CUSTRECORD_DJKK_HONORIFIC_APPELLATION","billingAddress",null), //DJ_敬称
					 	new nlobjSearchColumn("address2","billingAddress",null), //請求先住所1
				    	new nlobjSearchColumn("address3","billingAddress",null), //請求先住所2
				    	new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
				    	new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
				    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県 		
				    	new nlobjSearchColumn("phone"), //電話番号
				    	new nlobjSearchColumn("fax"), //Fax
				    	new nlobjSearchColumn("custentity_djkk_language"),  //言語
				    	new nlobjSearchColumn("custentity_djkk_reference_express"),  //金額表示flg
				    	new nlobjSearchColumn("custentity_djkk_delivery_express"),  //表示flg
					]
					);	
			var honorieicAppellation = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("CUSTRECORD_DJKK_HONORIFIC_APPELLATION","billingAddress",null));//DJ_敬称
			if(honorieicAppellation =='空白'){
				honorieicAppellation = '';
			}
			var attention= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//請求先住所2
			var customerAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//請求先住所1
			var customerCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//請求先市区町村
			var customerZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zip","billingAddress",null));//請求先郵便番号
			var customerState= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//請求先都道府県 
			var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//請求先電話番号
			var fax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//請求先fax
			var soLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_language"));//言語
			var expressFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_reference_express"));//金額表示flg
			var deliveryFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_delivery_express"));//表示flg
			
			var subsidiary = soRecord.getFieldValue('subsidiary');//子会社
			var subsidiarySearch= nlapiSearchRecord("subsidiary",null,
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
						new nlobjSearchColumn("custrecord_djkk_bank_1"), //銀行1
						new nlobjSearchColumn("custrecord_djkk_bank_2"), //銀行2
							  
					]
					);		
					
			var legalname= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("legalname"));//正式名称
			var nameString= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("name"));//名前
			var nameStringTwo = nameString.split(":");
			var name = nameStringTwo.slice(-1);
			var address= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
			var city= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("city","address",null));//市区町村
			var bankOne= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_1"));//銀行1
			var bankTwo= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_2"));//銀行2
			var addressZip= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("zip","address",null));//郵便番号
			var nameEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
			var mainaddressEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//住所英語
			var address1= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address2","address",null));//住所1
			var address2= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address3","address",null));//住所2
			var bankOneId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_1"));//銀行1
			var bankTwoId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_2"));//銀行2
			if(!isEmpty(bankOneId)){
				var bank1 = nlapiLoadRecord('customrecord_djkk_bank', bankOneId);
				var branch_name1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_支店名
				var bank_no1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));//DJ_口座番号
			}else{
				var branch_name1 = '';
				var bank_no1 = '';
			}
			if(!isEmpty(bankTwoId)){
				var bank2 = nlapiLoadRecord('customrecord_djkk_bank', bankTwoId);
				var branch_name2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_支店名
				var bank_no2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));//DJ_口座番号
			}else{
				var branch_name2 = '';
				var bank_no2 ='';
			}
					
			var trandate = defaultEmpty(soRecord.getFieldValue('trandate'));//日付
			var delivery_date = defaultEmpty(soRecord.getFieldValue('custbody_djkk_delivery_date'));//DJ_納品日
			var tranid = defaultEmpty(soRecord.getFieldValue('tranid'));//注文番号
			var terms = defaultEmpty(soRecord.getFieldText('terms'));//支払条件（締め日無し）
			var soTersm = defaultEmpty(terms.split('/'));
			var soTersmJap = defaultEmpty(soTersm.slice(0,1));
			var soTersmEng  = defaultEmpty(soTersm.slice(-1));
			var otherrefnum = defaultEmpty(soRecord.getFieldValue('otherrefnum'));//発注書番号
			var destination = soRecord.getFieldValue('custbody_djkk_delivery_destination');//DJ_納品先	
			var destinationName = defaultEmpty(soRecord.getFieldText('custbody_djkk_delivery_destination'));//DJ_納品先名前
			if(!isEmpty(destination)){	
				var destinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
						[
							["internalid","anyof",destination]
						], 
						[
							new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
							new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
							new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
							new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
							new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
							new nlobjSearchColumn("custrecord_djkk_sales"),//納品先営業
								  
						]
						);	
				var destinationZip = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_zip'));
				var destinationState = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_prefectures'));
				var destinationCity = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_municipalities'));
				var destinationAddress = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_delivery_residence'));
				var destinationAddress2 = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));
				var destinationSales = defaultEmpty(destinationSearch[0].getText('custrecord_djkk_sales'));		
			}
			if(soLanguage == '英語'){
				pdfName = 'Delivery Book';
			}else if(soLanguage == '日本語'|| isEmpty(soLanguage)){
				pdfName = '納\xa0\xa0品\xa0\xa0書';
			}
			
			soBody.push({
				honorieicAppellation:honorieicAppellation,//DJ_敬称
				pdfName:pdfName,
				attention:attention,//請求先住所2
				customerAddress:customerAddress,//請求先住所1
				customerCity:customerCity,//請求先市区町村
				customerZipcode:customerZipcode,//請求先郵便番号
				customerState:customerState,//請求先都道府県
				phone:phone,//請求先電話番号
				fax:fax,//請求先fax
				soLanguage:soLanguage,////言語
				expressFlg:expressFlg,//金額表示flg
				deliveryFlg:deliveryFlg,//表示flg		
				legalname:legalname,//正式名称
				name:name,//名前
				address:address,//都道府県
				city:city,//市区町村
				bankOne:bankOne,//銀行1
				bankTwo:bankTwo,//銀行2
				addressZip:addressZip,//会社郵便番号
				nameEng:nameEng,//会社名前英語
				mainaddressEng:mainaddressEng,//会社住所英語
				address1:address1,//会社住所1
				address2:address2,//会社住所2
				branch_name1:branch_name1,//DJ_支店名1
				bank_no1:bank_no1,//DJ_口座番号1
				branch_name2:branch_name2,//DJ_支店名2
				bank_no2:bank_no2,//DJ_支店名2
				trandate:trandate,//日付
				delivery_date:delivery_date,//DJ_納品日
				tranid:tranid,//注文番号
				soTersmJap:soTersmJap,//支払条件（締め日無し）日本語
				soTersmEng:soTersmEng,//支払条件（締め日無し）英語
				otherrefnum:otherrefnum,//発注書番号
				destinationName:destinationName,//DJ_納品先名前
				destinationZip:destinationZip, //納品先郵便番号
				destinationState:destinationState,//納品先都道府県
				destinationCity:destinationCity,//納品先市区町村
				destinationAddress:destinationAddress,//納品先住所1
				destinationAddress2:destinationAddress2,//納品先住所2
				destinationSales:destinationSales,//納品先営業
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
						  new nlobjSearchColumn("vendorname"), //仕入先商品コード
						  new nlobjSearchColumn("itemid"), //商品コード
						  new nlobjSearchColumn("displayname"), //商品名
						  new nlobjSearchColumn("custitem_djkk_storage_type"), //在庫区分
						  new nlobjSearchColumn("custitem_djkk_product_category_sml"), //配送温度
						]
						); 
					
					var vendorname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("vendorname"));//仕入先商品コード
					var itemid= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("itemid"));//商品コード
					var displayname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("displayname"));//商品名
					var storage_type= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_storage_type"));//在庫区分
					var deliverytemptyp= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_product_category_sml"));//配送温度

				var receiptnote = soRecord.getLineItemValue('item', 'custcol_djkk_receipt_printing', a);//DJ_受領書印刷flag
				var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//数量
				
				var amount = defaultEmptyToZero(parseFloat(soRecord.getLineItemValue('item', 'amount', a)));//金額
				if(!isEmpty(amount)){
					var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');		
					amountTota += amount;
					var amountTotal = amountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}else{
					var amountFormat = '';
				}

				
				var taxamount = defaultEmpty(parseFloat(soRecord.getLineItemValue('item','tax1amt',a)));//税額   

				if(!isEmpty(taxamount)){
					var taxamountFormat = taxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					taxamountTota += taxamount;
					var taxamountTotal = taxamountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}else{
					var taxamountFormat = '';
				}
			

				var rateFormat= defaultEmpty(soRecord.getLineItemValue('item','rate',a));//単価
				
				var total = defaultEmpty(Number(amountTota+taxamountTota));
				if(!isEmpty(total)){
					var toTotal = total.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}else{
					var toTotal = '';
				}
				//20221020 add by zhou 
				var unitabbreviation = defaultEmpty(soRecord.getLineItemValue('item','units_display',a));//単位
				
				var soUnitsArray;//単位array
				var soUnit;//変更後単位
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
						if(soLanguage == '英語'){			//英語
							unitabbreviation = unitSearch[0].getValue('abbreviation')+'';
							soUnitsArray = unitabbreviation.split("/");
							if(soUnitsArray.length == 2){
								soUnit = soUnitsArray[1];
							}
						}else if(soLanguage == '日本語'){				//日本語
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
				var taxrate1Format = defaultEmpty(soRecord.getLineItemValue('item','taxrate1',a));//税率   //
				var pocurrency = transfer(defaultEmpty(soRecord.getLineItemValue('item','pocurrency',a)));//通貨
				if(pocurrency == 'JPY'){
					var pocurrencyMoney = '￥';
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
					receiptnote:receiptnote,//DJ_受領書印刷flag
					vendorname:vendorname,//仕入先商品コード
					itemid:itemid,//商品コード
					displayname:displayname,//商品名
					storage_type:storage_type,//在庫区分
					quantity:quantity,//数量
					amount:amountFormat,//金額  
					taxamount:taxamountFormat,//税額 
					rateFormat:rateFormat,//単価
					unitabbreviation:defaultEmpty(soUnit),//単位
					taxrate1Format:taxrate1Format,//税率
					deliverytemptyp:deliverytemptyp,//配送温度区分
					line:line,
					soId:soId,
				}); 
				var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //在庫詳細
				if(!isEmpty(inventoryDetail)){
					var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
					if(inventoryDetailCount != 0){
						for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
							inventoryDetail.selectLineItem('inventoryassignment',j);
							var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
							if(isEmpty(receiptinventorynumber)){
						    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
						    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    );    
						    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////シリアル/ロット番号	
					    	}
							var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //有效期限	
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
				if(soBody[u].soLanguage == '英語'){
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
					var bankName = '引取銀行';
					var titleName = '下記の通り納品致します。';
					var dateName = '日\xa0\xa0付';
					var deliveryName = '納品日：';
					var numberName = '番\xa0\xa0号';
					var paymentName = '支払条件:';
					var orderName = '貴発注番号:';
					var codeName = 'コ\xa0\xa0ー\xa0\xa0ド';
					var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0名';
					var quantityName = '数\xa0\xa0\xa0量';
					var unitpriceName = '単\xa0\xa0\xa0価';
					var amountName = '金\xa0\xa0\xa0額';
					var tempName = '配送温度';
					var expirationDateNmae = '有効期限:';
					var orderNameTwo = '客先発注番号:';
					var taxRate = '税率';
					var taxAmount = '税額';
					var totalName = '合\xa0\xa0\xa0\xa0\xa0計';
					var consumptionTax = '消\xa0\xa0費\xa0\xa0税';
					var invoiceNameString = '御\xa0請\xa0求\xa0額';
					var deliName = 'お届先';
				}
			str+='<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
			'<tr>'+
			'<td style="width: 330PX;">'+
			'<table>'+
			'<tr style="height: 20px;">'+
			'</tr>'+
			'<tr></tr>'+
			'<tr>'+
			'<td>〒'+soBody[u].customerZipcode+'</td>'+
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
				if(soBody[u].soLanguage == '英語'){
					str+='<td colspan="4">'+soBody[u].nameEng+'</td>';
				}else{
					str+='<td colspan="4">'+soBody[u].name+'</td>';
				}
			str+='</tr>'+
			'<tr>';
			if(soBody[u].soLanguage == '英語'){
				str+='<td colspan="4" style="font-size:9px;">'+soBody[u].mainaddressEng+'</td>';
			}else{
				str+='<td colspan="4" style="font-size:10px;">〒'+soBody[u].addressZip+soBody[u].address+soBody[u].city+soBody[u].address1+soBody[u].address2+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td colspan="4">'+bankName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+soBody[u].bankOne+'</td>'+
			'<td>&nbsp;'+soBody[u].branch_name1+'</td>'+
			'<td>当座預金</td>'+
			'<td>'+soBody[u].bank_no1+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+soBody[u].bankTwo+'</td>'+
			'<td>&nbsp;'+soBody[u].branch_name2+'</td>'+
			'<td>当座預金</td>'+
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
			if(soBody[u].soLanguage == '英語'){
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
							str+='<td colspan="3">「'+itemLineArr[j].storage_type+'」</td>';
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
				'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+soBody[u].destinationZip+'&nbsp; '+soBody[u].destinationState+'</td>'+
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


function formatDateTime(dt){    //現在日期
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2) + ' ' + PrefixZero(dt.getHours(), 2) + ":" + PrefixZero(dt.getMinutes(), 2)) : '';
}
function savePdf(pdfData){
	try{

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(pdf(pdfData));
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_DJ_DELIVERY_SLIP_ISSUE);
		xlsFile.setName('DJ_ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票発行' + '_' + getFormatYmdHms() + '.pdf');
		// save file
		return nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'DJ_ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票', e)
	}
}
function savePdfTwo(pdfData){
	try{

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(pdfTwo(pdfData));
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_DJ_DELIVERY_SLIP_ISSUE);
		xlsFile.setName('DJ_出荷指図書' + '_' + getFormatYmdHms() + '.pdf');
		// save file
		return nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'DJ_出荷指図書', e)
	}
}
function savePdfThree(pdfData){
	try{

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(pdfThree(pdfData));
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_DJ_DELIVERY_SLIP_ISSUE);
		xlsFile.setName('DJ_配送依頼書' + '_' + getFormatYmdHms() + '.pdf');
		// save file
		return nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'DJ_配送依頼書', e)
	}
}
function savedeliveryPDF(pdfData){
	try{

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(deliveryPDF(pdfData));
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_DJ_DELIVERY_SLIP_ISSUE);
		xlsFile.setName('DJ_納品書' + '_' + getFormatYmdHms() + '.pdf');
		// save file
		return nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'DJ_納品書', e)
	}
}
function csvDown(xmlString){
	try{
	
		var xlsFile = nlapiCreateFile('DJ_ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票発行' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
		
		xlsFile.setFolder(FILE_CABINET_ID_TOTAL_INV_OUTPUT_FILE);
		xlsFile.setName('DJ_ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票発行' + '_' + getFormatYmdHms() + '.csv');
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