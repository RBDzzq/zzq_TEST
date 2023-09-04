/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Aug 2021     yang
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	
	nlapiLogExecution('debug', 'hellow', 'hellow');
	var strId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_poprepayment_send_id');

	
	var strArr = strId.split(',');
	for(var i = 0 ; i < strArr.length ; i++){
		governanceYield();
		if(isEmpty(strArr[i])){
			continue;
		}
		var newPo = strArr[i].split('_');
		var poId = newPo[0];
	
		var poArray = new Array();
		var poSearch= nlapiSearchRecord("transaction",null,
				[
				      ["internalid","anyof",poId],
				      "AND",
					  ["type","anyof","PurchOrd","RtnAuth"],
					  "AND", 
				      ["taxline","is","F"], 
				      "AND", 
				      ["mainline","is","T"]
	
				], 
				[
				   new nlobjSearchColumn("tranid"),     
				   new nlobjSearchColumn("terms"),
				   new nlobjSearchColumn("status"), 
				   new nlobjSearchColumn("entity"), 
				   new nlobjSearchColumn("trandate"),
				]
			); 
			if(!isEmpty(poSearch)){
				for(var g = 0 ; g < poSearch.length ;g++){
					var tranid = poSearch[g].getValue("tranid");
					var terms = poSearch[g].getValue("terms");
					var status = poSearch[g].getText("status");
					var entity = poSearch[g].getText("entity");
					var trandate = poSearch[g].getValue("trandate");

					
					poArray.push({
						tranid:tranid,    //発注書番号
						terms:terms,		//支払条件
						status:status,
						entity:entity,	   //仕入先
						trandate:trandate,  // 発注日
					})
				}
			}
	}
	
	
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
	'td { padding: 4px 6px; }'+
	'b { font-weight: bold; color: #333333; }'+
	'</style>'+
	'</head>'+
	'<body padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">'+
	'<table>'+
	'<thead>'+
	'<tr>'+
	'<th>DJ_発注書番号</th>'+
	'<th>DJ_支払条件</th>'+
	'<th>DJ_ステータス</th>'+
	'<th>DJ_仕入先</th>'+
	'<th>DJ_発注日 </th>'+
	'</tr>'+
	'</thead>';
	for(var z = 0 ; z < poArray.length ; z ++){
		xmlString+=
		'<tr><td>'+poArray[z].tranid+'</td>'+
		'<td>'+poArray[z].terms+'</td>'+
		'<td>'+poArray[z].status+'</td>'+
		'<td>'+poArray[z].entity+'</td>'+
		'<td>'+poArray[z].trandate+'</td></tr>';
		
	} 
	xmlString+='</table>'+
	'</body>'+
	'</pdf>';
	
	
	 var renderer = nlapiCreateTemplateRenderer();
     renderer.setTemplate(xmlString);
     var xml = renderer.renderToString();

     var xlsFile = nlapiXMLToPDF(xml);

     // PDFファイル名を設定する
     xlsFile.setName('DJ_購入前払金為替レート（予約レート）送信'+ getFormatYmdHms() +'.pdf');

     xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);

     xlsFile.setIsOnline(true);

    var fileID = nlapiSubmitFile(xlsFile);
    var fl = nlapiLoadFile(fileID);

	nlapiSendEmail(425, 737, 'DJ_購入前払金為替レート（予約レート）送信', 'DJ_購入前払金為替レート（予約レート）送信', null, null, null, fl)
	
}

