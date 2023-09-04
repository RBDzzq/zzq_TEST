/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Feb 2022     rextec
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
var IN_STOCK_SEND_FILE_ID = "";
var SEARCH_SUBSIDIARY = "";
var SEARCH_LOCATION = "";
var SEARCH_VTT = "";
var SEARCH_Form = "";
var SEARCH_theCount ="";
function scheduled(type,request,response) {
//[,,,]
	
	var selectFlg = request.getParameter('selectFlg');
	var activityValue = request.getParameter('activity');
	var createdbyValue = request.getParameter('createdby');
	var vendorValue = request.getParameter('vendor');
	var poValue = request.getParameter('po');
	var itemValue = request.getParameter('item');
	var itemEnValue = request.getParameter('item_en');
	var itemJpValue = request.getParameter('item_jp');
	var locationValue = request.getParameter('location');
	var lotValue = request.getParameter('lot');
	var inStockValue = request.getParameter('in_stock');
	var subsidiaryValue = request.getParameter('subsidiary');
	var purchaseorderValue= request.getParameter('purchaseorder');
	
	var strId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_in_stock_choose');
	var _strArr = strId.split(',');
//[[],[],[]]
	var valueTotal = [];
	for(var i = 0 ; i < _strArr.length ; i++){
		if(isEmpty(_strArr[i])){
			continue;
		}
		var __strArr = _strArr[i].split('_');
		valueTotal.push(__strArr);
	}
	
	var subsidiaryRecord = nlapiLoadRecord('subsidiary', subsidiaryValue);
	var locationRecord = nlapiLoadRecord('location', locationValue);
	SEARCH_LOCATION = defaultEmpty(locationRecord.getFieldValue('name'));
	SEARCH_SUBSIDIARY = defaultEmpty(subsidiaryRecord.getFieldValue('name'));
	SEARCH_VTT = valueTotal;	
	
	var form = nlapiCreateForm('DJ_入荷予定リスト', false);
	form.setScript('customscript_djkk_cs_in_stock_send');
	var csvDownUrl = "window.open('" + pdfDown(valueTotal) + "', '_blank');"; 
	if(selectFlg == 'F'){ 
	}else{
		form.addButton('btn_pdf', 'PDFダウンロード',csvDownUrl);
	}
}

function pdf(valueTotal){


	
	var poDataMap = {}; //head
	var poDetailDataMap = {};//body
//	nlapiLogExecution('debug', 'pdf', 'start ' + valueTotal.length);
	for(var i = 0; i < valueTotal.length; i ++){
			var poid= valueTotal[i].po_id;
			var time = valueTotal[i].expectedreceiptdate;
			var pohead = poDataMap[poid];
//			nlapiLogExecution('debug', 'poAddpobody',pobody);
//			var potime = poDetailDataMap[expectedreceiptdate];
//			var poAddTimeid = poDetailDataMap[poid]+':'+ poDetailDataMap[expectedreceiptdate];
			if(!pohead){
				var poSearch= nlapiSearchRecord("transaction",null,
					[
					      ["internalid","anyof",poid],
					      "AND",
						  ["type","anyof","PurchOrd","RtnAuth"],
						  "AND", 
					      ["taxline","is","F"], 
					      "AND", 
					      ["mainline","is","T"]

					], 
					[
					 //subsidiary
					 //department
					   new nlobjSearchColumn("custentity_djkk_activity","vendor",null), 
					   new nlobjSearchColumn("altname","vendor",null), //取引先名
					   new nlobjSearchColumn("entityid","vendor",null), //取引先コード
					   new nlobjSearchColumn("altname","vendor",null), 
					   new nlobjSearchColumn("custbody_djkk_ship_via"), 
					   new nlobjSearchColumn("transactionnumber"), //発生元番号
					   new nlobjSearchColumn("memo"), //備考
					   new nlobjSearchColumn("trandate"), //発生日
//					   new nlobjSearchColumn("department"), 
					   new nlobjSearchColumn("department"),//発生元部署コード + 発生元部署名
					   new nlobjSearchColumn("type"),//種類
					   new nlobjSearchColumn("approvalstatus"),//入荷予定完了分区
					]
				); 
				
				var altname= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("altname","vendor",null));//取引先名
				var vendorname= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("entityid","vendor",null));//取引先コード
				var expectedreceiptdate= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("expectedreceiptdate"));//入荷予定日
				if(expectedreceiptdate){
					expectedreceiptdate = formatDate(nlapiStringToDate(expectedreceiptdate));
				}
				
				var transactionnumber= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("transactionnumber"));//発生元番号
				var memo= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("memo"));//備考
				var trandate= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("trandate"));//発生日
				var department= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getText("department"));//発生元部署コード
				var departmentName = '';//発生元部署名
				if(department){
					var depSplits = department.split(' ');
					var depLength = depSplits.length;
					if(depLength == 1){
						departmentName = department;
						department = '';
					}else if(depLength == 2){
						department = depSplits[0];
						departmentName = depSplits[1];
					}else{
						department = depSplits[0];
						departmentName = depSplits.splice(1).join(' ');
					}
				}
				var type= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getText("type"));//種類
				var approvalstatus= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getText("approvalstatus"));//入荷予定完了分区
				var subsidiary= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("subsidiary","item",null));//
				var location= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("location"));
						
				poDataMap[poid]={
						altname:altname,
						vendorname:vendorname,
						expectedreceiptdate:expectedreceiptdate,
						transactionnumber:transactionnumber,
						memo:memo,
						trandate:trandate,
						department:department,
						departmentName:departmentName,
						type:type,
						approvalstatus:approvalstatus,
						subsidiary:subsidiary,
						location:location,
				};
				
			}

			var pobody = poDetailDataMap[poid +":"+time];
			if(!pobody){
				pobody = [];
				poDetailDataMap[poid +":"+time] = pobody;
			}
			pobody.push(valueTotal[i]);
			
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
		str+='<body padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">';
		var lastPo = '';
		for(var poidAndTime in poDetailDataMap){
			var keyArray = poidAndTime.split(':');
			var poid = keyArray[0];
			var time =  keyArray[1];
			var poData = poDataMap[poid];			
			var poDeailData = poDetailDataMap[poidAndTime];
			var tranid = poDeailData[0]['po_no'];
			
				str += '<table>'+
					//'<tr><td>123</td></tr>';
				    '<tr class="nav_t1" >' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '<td></td>' +
				    '</tr>' +
					'<tr>' +
				    '<td align="center" style="vertical-align: middle;font-size: 13px;">N001</td>' +
				    '<td style="vertical-align: middle;font-size: 13px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;'+SEARCH_SUBSIDIARY+'</td>' +
//				    '<td ></td>' +
				    '<td ></td>' +
				    '<td ></td>' +
				    '<td colspan="2" rowspan="2" style="vertical-align: middle;font-size: 13px;">出力日時:' + formatDateTime(new Date()) + '</td>' +
				    '<td ></td>' +
				    '<td style="vertical-align:middle;font-size: 13px" rowspan="2"><pagenumber/>&nbsp;ページ</td>' +
				    '</tr>' +
					'<tr height="30px">' +
				    '<td align="center" style="vertical-align: middle;font-size: 13px;">S001</td>' +
				    '<td style="vertical-align: middle;font-size: 13px;" colspan="5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;'+SEARCH_LOCATION+'</td>' +
//				    '<td></td>' +
//				    '<td></td>' +
//				    '<td></td>' +
				    '<td></td>' +
				    '</tr></table>' ;
				str+= '<table>' +
			    '<tr height="10px">' +
			    '<td width="160px"></td>' +
			    '<td width="180px"></td>' +
			    '<td width="170px"></td>' +
			    '<td width="150px"></td>' +
			    '<td width="120px"></td>' +
			    '<td width="150px"></td>' +
			    '<td width="180px"></td>' +
			    '<td width="170px"></td>' +
			    '</tr>' +
			    '<tr>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '<td  colspan="2" style="font-size: 22px;font-weight: bold;text-decoration: underline;" align="center">入荷予定リスト</td>' +
			    '<td ></td>' +
			    '<td colspan="2" rowspan="2" align="left"><barcode codetype="code128" value="PO;' + poid + ';' + tranid + '"/></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">入荷予定日</td>' +
			    '<td >:&nbsp;&nbsp;'+time+'</td>' +
			    '<td align="left">発生日</td>' +
			    '<td >:&nbsp;&nbsp;'+formatDate(nlapiStringToDate(poData.trandate))+'</td>' +
			    '<td >入荷種別</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.type+'</td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">入荷予定番号</td>' +
			    '<td >:&nbsp;&nbsp;</td>' +
			    '<td align="left">入荷予定完了区分</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.approvalstatus+'</td>' +
			    '<td >発生元番号</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.transactionnumber+'</td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">取引先コード</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.vendorname+'</td>' +
			    '<td align="left">取引先名</td>' +
			    '<td colspan="2">:&nbsp;&nbsp;'+poData.altname+'</td>' +
			    '' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">発生元部署コード</td>' +
			    '<td>:&nbsp;&nbsp;'+poData.department+'</td>' +
//			    '<td>:&nbsp;&nbsp;'+SEARCH_DPM+'</td>' +
			    '<td align="left">発生元部署名</td>' +
			    '<td colspan="2">:&nbsp;&nbsp;'+poData.departmentName+'</td>' +
			    '' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">備考</td>' +
			    '<td colspan="7">:&nbsp;&nbsp;'+poData.memo+'</td>' +
//			    '<td align="left"></td>' +
//			    '<td colspan="2"></td>' +
//			    '' +
//			    '<td ></td>' +
//			    '<td ></td>' +
//			    '<td ></td>' +
			    '</tr></table> ';
				str+=
				'<table style="font-size: 14px;font-weight: bold;border-bottom: 1px dotted black;border-collapse: collapse;">' +
			    '<tr height="20px">' +
			    '<td width="100px"></td>' +
			    '<td width="200px"></td>' +
			    '<td width="400px"></td>' +
			    '<td width="450px"></td>' +
			    '</tr>' +
			    '<tr >' +
			    '<td >No.</td>' +
			    '<td >商品コード</td>' +
			    '<td >商品名</td>' +
			    '<td >取引先商品コード</td>' +
			    '</tr></table>' ;
			    str+=

			    '<table style="border-bottom: 1px solid black;border-collapse: collapse;">' +
			    '<tr style="font-size: 13px;font-weight: bold;">' +
			    '<td width="70px" ></td>' +
			    '<td width="140px" ></td>' +
			    '<td width="130px" >ロット番号</td>' +
			    '<td width="140px" >有効期限</td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="115px"></td>' +
			    '<td width="115px"></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;font-weight: bold;">' +
			    '<td width="70px"></td>' +
			    '<td width="140px"></td>' +
			    '<td width="130px">毒劇物区分</td>' +
			    '<td width="140px">温度帯区分 </td>' +
			    '<td width="130px">放射性有無区分 </td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="115px"></td>' +
			    '<td width="115px"></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;font-weight: bold;">' +
			    '<td width="70px"></td>' +
			    '<td width="140px"></td>' +
			    '<td width="130px">備考</td>' +
			    '<td width="140px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="115px" align="right">入荷予定数</td>' +
			    '<td width="115px" align="right">検品残数</td>' +
			    '</tr></table>' ;
					
					for(var i = 0; i < poDeailData.length; i ++){
						var valueDetailsArray = poDeailData[i];
						var itemID= valueDetailsArray['item_id'];
						if(isEmpty(itemID)){
							itemID=valueDetailsArray['item'];
						}else{
							itemID=replaceExceptNumberAndLetter(itemID);
						}
						
						
						str += 
						'<table style="font-size: 13px;border-bottom: 1px dotted black;">' +
						'<tr height="60px">' +
					    '<td width="100px" style="vertical-align: middle;">'+Number(i+1)+'</td>' +
					    '<td width="200px" style="vertical-align: middle;">'+defaultEmpty(valueDetailsArray.item)+'</td>' +
					    '<td width="400px" style="vertical-align: middle;">'+defaultEmpty(valueDetailsArray.commodity_name)+'</td>' +
					    '<td width="450px" style="vertical-align: middle;">'+defaultEmpty(valueDetailsArray.trading_commodity_code)+'</td>' +
					    '</tr></table>' ;
					    str+=		
					    '<table style="border-bottom: 1px solid black;border-collapse: collapse;">' +
					    
//					    '<tr height="0px">' +
//					    '<td width="70px"></td>' +
//					    '<td width="140px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="140px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="115px"></td>' +
//					    '<td width="115px"></td>' +
//					    '</tr>' +
					    
					    
					    
					    '<tr style="font-size: 13px;" height="15px">'+
						'<td width="20px" ></td>'+
						'<td width="90px" ></td>'+
						'<td width="80px" >'+defaultEmpty(valueDetailsArray.lot_number)+'</td>'+
						'<td width="85px" >'+defaultEmpty(valueDetailsArray.expiration_date)+'</td>'+
						'<td width="80px"></td>'+
						'<td width="80px"></td>'+
						'<td width="200px" align="right" colspan="3" rowspan="2" style="vertical-align:text-top;text-align:right"><barcode showtext="false" height="30" width="180" align="right" codetype="code128" value="'
						+valueDetailsArray['po_id']+';'
						+valueDetailsArray['po_line_no']+';'
						+itemID
						+'" /></td>' +
						//'<td width="115px"></td>'+
						//'<td width="115px"></td>'+
					    '</tr>'+
					   
//					    '<tr style="font-size: 13px;">' +
//					    '<td width="70px"></td>' +
//					    '<td width="140px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="140px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="130px"></td>' +
//					    '<td width="130px" colspan="3" rowspan="2" style="vertical-align:top;text-align:right;"><barcode codetype="code128" value="11111111"/></td>' +
//					    '</tr>' +
					    '<tr style="font-size: 13px;" height="15px">' +
					    '<td width="45px"></td>' +
					    '<td width="140px"></td>' +
					    '<td width="130px" >'+defaultEmpty(valueDetailsArray.poisonous_drama)+'</td>' +
					    '<td width="140px" >'+defaultEmpty(valueDetailsArray.temperature_zone_classification)+'</td>' +
					    '<td width="130px" >'+defaultEmpty(valueDetailsArray.radioactivity)+'</td>' +
					    '<td width="130px"></td>' +
					    '</tr>' +
					    '<tr style="font-size: 13px;" height="15px">' +
					    '<td width="45px"></td>' +
					    '<td width="140px"></td>' +
					    '<td width="130px" colspan="3" >'+valueDetailsArray.memo+'</td>' +
//					    '<td width="140px"></td>' +
//					    '<td width="130px"></td>' +
					    '<td width="130px"></td>' +
					    '<td width="140px"></td>' +
					    '<td width="120px" align="right" >'+defaultEmpty(valueDetailsArray.expected_number)+'</td>' +
					    '<td width="115px" align="right" ></td>' +
					    '</tr></table>' ;
//						}			
					}
			    str += '<pbr/>';
			}
		if(str.substring(str.length - 6) == '<pbr/>'){
			str = str.substring(0,str.length - 6);
		}
		str += '</body></pdf>';

		return str;
	}


function csvDown(xmlString){
	try{
	
		var xlsFile = nlapiCreateFile('入荷送信' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
		
		xlsFile.setFolder(FILE_CABINET_ID_TOTAL_INV_OUTPUT_FILE);
		xlsFile.setName('入荷送信' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setEncoding('SHIFT_JIS');
	    
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		IN_STOCK_SEND_FILE_ID = fileID;
		var fl = nlapiLoadFile(fileID);
		var url= fl.getURL();
		return url; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', '', e)
	}
}

function pdfDown(purchaseorderSearch){
	try{
	

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(pdf(purchaseorderSearch));
	    //renderer.addSearchResults('results',purchaseorderSearch  );
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_INCOMING_PDF);
		xlsFile.setName('入荷送信' + '_' + getFormatYmdHms() + '.pdf');
	    
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		IN_STOCK_SEND_FILE_ID = fileID;
		var fl = nlapiLoadFile(fileID);
		var url= fl.getURL();
		return url; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'error', e)
	}
}

function defaultEmpty(src){
	return src || '';
}
function formatDate(dt){    //現在日期
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
}
function formatDateTime(dt){    //現在日期
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2) + ' ' + PrefixZero(dt.getHours(), 2) + ":" + PrefixZero(dt.getMinutes(), 2)) : '';
}