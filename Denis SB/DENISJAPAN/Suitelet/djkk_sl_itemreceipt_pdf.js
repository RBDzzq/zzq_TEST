/**
 * 受領書barcodePdf
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/11/21     CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){	
	try{
		var savefolder='48371';
		var itemreceiptId =request.getParameter('itemreceiptId');
		var returnUrl='';		
		var itemreceiptRecord=nlapiLoadRecord('itemreceipt', itemreceiptId);
		var tranid=itemreceiptRecord.getFieldValue('tranid');		
		var count=itemreceiptRecord.getLineItemCount('item');
		for(var i=1;i<count+1;i++){
			itemreceiptRecord.selectLineItem('item', i);
			var item=itemreceiptRecord.getCurrentLineItemValue('item', 'item');
			var itemdescription=itemreceiptRecord.getCurrentLineItemValue('item', 'itemdescription');
			var unitsdisplay=itemreceiptRecord.getCurrentLineItemValue('item', 'unitsdisplay');
			
		    var itemType = nlapiLookupField('item', item, ['islotitem','isserialitem','upccode','displayname']);
			var inventoryDetail=itemreceiptRecord.viewCurrentLineItemSubrecord('item', 'inventorydetail');
			var itemName=itemType.displayname;
			var itemJanCode=itemType.upccode;
			 if(!isEmpty(inventoryDetail)){
					var inventoryDetailCount=inventoryDetail.getLineItemCount('inventoryassignment');
					for(var j=1;j<inventoryDetailCount+1;j++){
						var barcode ='';
						var barcodeTxt='';
					    inventoryDetail.selectLineItem('inventoryassignment',j);
					    
					    barcode+='01';
				    	barcodeTxt+='(01)';
				    	
				    	if(!isEmpty(itemJanCode)){
				    		 barcode+=itemJanCode;
						     barcodeTxt+=itemJanCode;
				    	}else{
				    		barcode+='XXXXXXXXXXXXXX';
					    	barcodeTxt+='XXXXXXXXXXXXXX';
				    	}
				    	
					    var expirationdate=inventoryDetail.getCurrentLineItemValue('inventoryassignment','expirationdate');
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
				    	var quantity=inventoryDetail.getCurrentLineItemValue('inventoryassignment','quantity');
						var filename =tranid+'_'+itemName+'_'+makerNumber+'_'+ getFormatYmdHms()+'.pdf';
						var barcodeMemo=itemName+' '+itemdescription+' '+unitsdisplay+'  X'+quantity;
						// 受領書GS1	
//						var xmlString = '<?xml version="1.0" encoding="utf-8"?>';
//						xmlString += '<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
//						xmlString += '<pdf>';
//						xmlString += '<head>';								
//						xmlString += '</head>';
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
						'td{'+
						'font-size: 9px;'+
						'}'+
						'</style>'+
						'</head>';
					   // 600*240px
					  // xmlString += '<body width="159mm" height="64mm">';
						// xmlString += '<body padding="50pt 52pt 0pt 52pt" width="450pt" height="181pt">';
					   xmlString += '<body padding="10pt 10pt 10pt 10pt" width="450pt" height="181pt">';
						
						xmlString += '<table align="center">';
						
						xmlString += '<tr>';
						// 27?o×70?o   1 mm=2.8346 pt
						// have()is barcodeTxt no()is barcode
						// 199pt 77pt
						xmlString += '<td lang="ja" align="center"><barcode codetype="code128" style="width: 358.2pt; height: 138.6pt;" showtext="true" value="'+barcodeTxt+'"/></td>';//<br/>'+barcodeTxt+'
						xmlString += '</tr>';
						xmlString += '<tr>';
						xmlString +='<td align="center">'+' '+'</td>';
						xmlString += '</tr>';
						xmlString += '<tr>';
						xmlString +='<td align="center">'+barcodeMemo+'</td>';                                                                                                                               
						xmlString += '</tr>';

					
						
						xmlString += '</table>';
						xmlString += '</body>';
						xmlString += '</pdf>';
					
					   var renderer = nlapiCreateTemplateRenderer();
					   renderer.setTemplate(xmlString);
					   var xml = renderer.renderToString();
					   var xlsFile = nlapiXMLToPDF(xml);
					    // PDFファイル名を設定する
					    xlsFile.setName(filename);
					    xlsFile.setFolder(savefolder);
					    xlsFile.setIsOnline(true);
					    // save file
					    var fileID = nlapiSubmitFile(xlsFile);
					    var fl = nlapiLoadFile(fileID);
					    var url= URL_HEAD +'/'+fl.getURL();					    					   					    
					    returnUrl+=url;
					    returnUrl+='|||';
					    
					   }
				    }
		      }
	    response.write(returnUrl);
	}catch(e){
		response.write('Error:'+e.message);
	}
}
