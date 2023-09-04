/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Jul 2021     admin
 *
 */

/**
 * @param {String}
 *            type Context Types: scheduled, ondemand, userinterface, aborted,
 *            skipped
 * @returns {Void}
 */
function scheduled(type) {

	nlapiLogExecution('DEBUG', 'メッセージ送信', '開始');
	
	var idStr = nlapiGetContext().getSetting('SCRIPT',
	'custscript_send_list_id');
	var dashboard_mail_send_div = nlapiGetContext().getSetting('SCRIPT',
	'custscript_send_div');
	
	
if(dashboard_mail_send_div == 3){
	
	var locationStr = nlapiGetContext().getSetting('SCRIPT','custscript_send_location');
	var itemStr = nlapiGetContext().getSetting('SCRIPT','custscript_send_item');
	var fromStr = nlapiGetContext().getSetting('SCRIPT','custscript_send_from');
	var toStr = nlapiGetContext().getSetting('SCRIPT','custscript_send_to');
	var docnoStr = nlapiGetContext().getSetting('SCRIPT','custscript_send_docno');
	var locationArr_old = new Array();
	locationArr_old = locationStr.split(',');
	
	var locationArr_new = new Array();
	locationArr_new = locationStr.split(',');
	for(var i =0;i<locationArr_new.length;i++){
		for(var j=i+1;j<locationArr_new.length;j++){
			if(locationArr_new[i] == locationArr_new[j]){
				locationArr_new.splice(j,1);
				j--;
			}
		}
	}
		
	var itemArr = new Array();
    itemArr = itemStr.split(',');
    var fromArr = new Array();
    fromArr = fromStr.split(',');
    var toArr = new Array();
    toArr = toStr.split(',');
    var docnoArr = new Array();
    docnoArr = docnoStr.split(',');
	var location_item = new Array();
	for(var i = 0; i <= locationArr_new.length -1; i++){
		for(var j = 0; j <= itemArr.length -1; j++) {        
			if(locationArr_old[j] == locationArr_new[i]){  
				location_item.push(locationArr_new[i]+','+itemArr[j]+','+fromArr[j]+','+toArr[j]+','+docnoArr[j]);		
			}
		}
	}
	
	var locationSearch = nlapiSearchRecord("location",null,
			[
			 	["internalid","anyof",locationArr_new]
			],
			[
			 	new nlobjSearchColumn("custrecord_djkk_mail", "address",null),
			 	new nlobjSearchColumn("name")
			]
			);
	for(var a=0;a<locationSearch.length;a++){
		var mails = locationSearch[a].getValue("custrecord_djkk_mail","address");
		var name = locationSearch[a].getValue("name");
		var locationNew = locationArr_new[a];
		var subject = '配送自動送信';
		var body = '';
		var str = '';
		
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
		'<td align = "center" style ="width: 60px;"></td>'+
		'<td align = "center" style ="width: 100px;"></td>'+
		'<td align = "center" style ="width: 100px;"></td>'+
		'<td align = "center" style ="width: 100px;"></td>'+
		'<td align = "center" style ="width: 100px;"></td>'+
		'<td align = "center" style ="width: 100px;"></td>'+
		'<td align = "center" style ="width: 100px;"></td>'+
		'</tr>'+
		'<tr>'+
		'<td align = "center" colspan = "7" style ="font-size :20px;vertical-align:middle;">配送自動送信</td>'+
		'</tr>'+
		'<tr>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 165px;font-size :9px;vertical-align:middle;">種類</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 165px;font-size :9px;vertical-align:middle;">ドキュメント番号 </td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 165px;font-size :9px;vertical-align:middle;">場所ID</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 165px;font-size :9px;vertical-align:middle;">アイテム</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 165px;font-size :9px;vertical-align:middle;">FROM</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;width: 165px;font-size :9px;vertical-align:middle;">TO</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;border-right:1px solid #0054ac;width: 165px;font-size :9px;vertical-align:middle;">件名 </td>'+

		'</tr>';
		for(var j =0; j < location_item.length;j++){
			var locationInline = location_item[j].split(',');
			if (locationNew == locationInline[0]){
			str += '<tr>'+		
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;border-bottom:1px solid #0054ac;width: auto;width: 165px;font-size :9px;vertical-align:middle;">注文書</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;border-bottom:1px solid #0054ac;width: auto;width: 165px;font-size :9px;vertical-align:middle;">'+ locationInline[4] +'</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;border-bottom:1px solid #0054ac;width: auto;width: 165px;font-size :9px;vertical-align:middle;">'+ locationInline[0] +'</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;border-bottom:1px solid #0054ac;width: auto;width: 165px;font-size :9px;vertical-align:middle;">'+ locationInline[1] +'</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;border-bottom:1px solid #0054ac;width: auto;width: 165px;font-size :9px;vertical-align:middle;">'+ locationInline[2] +'</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;border-bottom:1px solid #0054ac;width: auto;width: 165px;font-size :9px;vertical-align:middle;">'+ locationInline[3] +'</td>'+
		'<td align = "center" style ="border-left:1px solid #0054ac;border-top:1px solid #0054ac;border-bottom:1px solid #0054ac;border-right:1px solid #0054ac;width: auto;width: 165px;font-size :9px;vertical-align:middle;">配送自動送信</td>'+
		'</tr>';
			}
		}
		str+='</table>'+
		'</body>'+
		'</pdf>';
		
				
		 var renderer = nlapiCreateTemplateRenderer();
         renderer.setTemplate(str);
         var xml = renderer.renderToString();

         var xlsFile = nlapiXMLToPDF(xml);

         // PDFファイル名を設定する
         xlsFile.setName('DJ_納品書自動送信PDF'+ getFormatYmdHms() +'.pdf');

         xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);

         xlsFile.setIsOnline(true);

        var fileID = nlapiSubmitFile(xlsFile);
        var fl = nlapiLoadFile(fileID);


		nlapiSendEmail(nlapiGetUser(),mails,subject, body, null, null, null, fl);
	}  
}else{

	var searchParam = new Array();


	var internalidArr = new Array();
	var arrId = idStr.split(',');
	internalidArr.push("internalid");
	internalidArr.push("anyof");
	for (var i = 0; i < arrId.length; i++) {
		if (!isEmpty(arrId[i])) {
			internalidArr.push(arrId[i]);
		}

	}
	// パラメータ設定
	searchParam.push(internalidArr);

	var messageSearch = getSearchResults("message",null,
			searchParam, 
			[
			   new nlobjSearchColumn("authoremail"), 
			   new nlobjSearchColumn("cc"), 
			   new nlobjSearchColumn("bcc"), 
			   new nlobjSearchColumn("subject"), 
			   new nlobjSearchColumn("message"), 
			   new nlobjSearchColumn("hasattachment"), 
			   new nlobjSearchColumn("attachments"), 
			   new nlobjSearchColumn("internalid","attachments",null)
			]
			);

	for (var i = 0; i < messageSearch.length; i++) {
		
		governanceYield();
		
		var authoremail = messageSearch[i].getValue("authoremail");
		var subject = messageSearch[i].getValue("subject");
		var message = messageSearch[i].getValue("message")
		var cc = messageSearch[i].getValue("cc")
		var bcc = messageSearch[i].getValue("bcc")
		var fileID = messageSearch[i].getValue("internalid","attachments")
		var file = null;
		if(!isEmpty(fileID)){
			file = nlapiLoadFile(fileID)
		}
		

		nlapiSendEmail(nlapiGetUser(), authoremail, subject, message, null, null, null, file)		
	}
}
	nlapiLogExecution('DEBUG', 'メッセージ送信', '終了');
}
