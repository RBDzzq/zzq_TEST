/**
 * ���ח\�著�M
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Aug 2021     ZHOU
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
var ISUKO_LOCATION = 69;
var SEARCH_SUBSIDIARY = "";
var SEARCH_LOCATION = "";
function scheduled(type) {

	nlapiLogExecution('debug', '', '�J�n');
	var str5 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_in_stock_send_param5');//job param
	nlapiLogExecution('DEBUG', 'SHOW ME str5', str5);
	var jobParam = JSON.parse(str5);
	var type = jobParam.type;
	var jobId = jobParam.jobId;
	
//	var strArr3 = str3.split(',');
//	nlapiLogExecution('DEBUG', '�p�����[�^', str)
//	nlapiLogExecution('DEBUG', 'show strArr3', str3)
//	nlapiLogExecution('DEBUG', 'show str4', str4);
//	return;

	
	nlapiLogExecution('DEBUG', 'show type', type);
	nlapiLogExecution('DEBUG', 'show jobId', jobId);
	

	
	
	if(type == 'savePDF'){
		var str = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_in_stock_send_param');
		var str2 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_in_stock_send_param2');
		var str3 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_in_stock_send_param3');
		var str4 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_in_stock_send_param4');//csv_value
		var strArr = str.split(',');
		var strArr2 = str2.split(',');
		nlapiLogExecution('DEBUG', 'SHOW ME strArr2', strArr2[0]);
		var pdfData = JSON.parse(str3);
		var fileIdPdf = savePdf(pdfData);
		nlapiLogExecution('DEBUG', 'fileIdPdf', fileIdPdf);
		var fileIdCsv = csvDown(str4);
		
//		nlapiLogExecution('debug', 'show me the jobId', fileIdPdf+fileIdCsv);
		var poDataMain = {
				pdfData:pdfData,
				strArr:strArr
		}
		
		var str_poDataMain =  JSON.stringify(poDataMain)
		var send = nlapiCreateRecord('customrecord_djkk_in_stock_send_job');
		send.setFieldValue('custrecord_job',jobId);
		send.setFieldValue('custrecord_detail',str_poDataMain);
		send.setFieldValue('custrecord_pdf_fileid',fileIdPdf);
		send.setFieldValue('custrecord_csv_fileid',fileIdCsv);
		var id = nlapiSubmitRecord(send);
		//search by jobid
		
//		var jobSearch = nlapiSearchRecord("customrecord_djkk_in_stock_send_job",null,
//				[
//				   ["custrecord_job","is",jobId]
//				], 
//				[
//
//				   new nlobjSearchColumn("custrecord_job"), 
//				   new nlobjSearchColumn("custrecord_detail"), 
//				   new nlobjSearchColumn("custrecord_pdf_fileid"), 
//				   new nlobjSearchColumn("custrecord_csv_fileid")
//				]
//				);
//		
//		var jobId = jobSearch[0].getValue("custrecord_job");
//		var pdf_fileid = parseInt(jobSearch[0].getValue("custrecord_pdf_fileid"));
//		var csv_fileid = parseInt(jobSearch[0].getValue("custrecord_csv_fileid"));
//		var str_poDataMain = jobSearch[0].getValue("custrecord_detail");
//		
//		var poDataMain = JSON.parse(str_poDataMain);
//		var pdfData = poDataMain.pdfData;
//		var valueTotal = pdfData.valueTotal;
//		var strArr = poDataMain.strArr;
//		nlapiLogExecution('DEBUG', 'show me the strArr', strArr);
//		
//		for (var i = 0 ;i <valueTotal.length;i++){
//			var poid= valueTotal[i].po_id;		
//			var poLineNo = valueTotal[i].po_line_no;
//			try{
//				var poRecord = nlapiLoadRecord('purchaseorder', poid);
//				poRecord.setLineItemValue('item','custcol_djkk_in_sotck_send_indicate',poLineNo,'T');
//				nlapiSubmitRecord(poRecord);
//			}catch(e){
//				nlapiLogExecution('DEBUG', '�t���O�X�V', e.message);
//			}	
//		}

	}else if(type == 'sendEmail'){
		
		
		var jobSearch = nlapiSearchRecord("customrecord_djkk_in_stock_send_job",null,
				[
				   ["custrecord_job","is",jobId]
				], 
				[

				   new nlobjSearchColumn("custrecord_job"), 
				   new nlobjSearchColumn("custrecord_detail"), 
				   new nlobjSearchColumn("custrecord_pdf_fileid"), 
				   new nlobjSearchColumn("custrecord_csv_fileid")
				]
				);
		
		var jobId = jobSearch[0].getValue("custrecord_job");
		var pdf_fileid = parseInt(jobSearch[0].getValue("custrecord_pdf_fileid"));
		var csv_fileid = parseInt(jobSearch[0].getValue("custrecord_csv_fileid"));
		var str_poDataMain = jobSearch[0].getValue("custrecord_detail");
		
		var poDataMain = JSON.parse(str_poDataMain);
		var pdfData = poDataMain.pdfData;
		var valueTotal = pdfData.valueTotal;
		var strArr = poDataMain.strArr;
//		nlapiLogExecution('DEBUG', 'show me the strArr', strArr);
		
		var locationSearch = nlapiSearchRecord("location",null,
				[
				 "internalid","anyof",strArr[2]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
				   new nlobjSearchColumn("internalid")
				]
				);
		var mailArr = new Array();
		if(!isEmpty(locationSearch)){
			for(var i = 0 ; i < locationSearch.length ; i++){
				mailArr[0] = locationSearch[i].getValue("custrecord_djkk_mail","address",null);
			}
			
			if(!isEmpty(mailArr[0])){
				nlapiLogExecution('DEBUG', 'show me the before', type);
				nlapiSendEmail(strArr[1], mailArr[0], '���ח\�著�M', '',null,null,null,nlapiLoadFile(pdf_fileid));
				nlapiSendEmail(strArr[1], mailArr[0], '���ח\�著�M', '',null,null,null,nlapiLoadFile(csv_fileid));
				nlapiLogExecution('DEBUG', 'show me the after', type);
			}else{
				nlapiLogExecution('DEBUG', '', '���[���A�h���X���݂��Ȃ����ߑ��M�ł��܂���ł����B');
			}	
		}else{
			nlapiLogExecution('DEBUG', '', '�q�ɂ𑶍݂��Ȃ����߁A�����I��');
		}
		
//		var poidMap = {};
//		for (var i = 0 ;i <valueTotal.length;i++){
//			var poid= valueTotal[i].po_id;		
//			var poLineNo = valueTotal[i].po_line_no;
//			try{
//				var poRecord = nlapiLoadRecord('purchaseorder', poid);
//				poRecord.setLineItemValue('item','custcol_djkk_in_sotck_send_indicate',poLineNo,'T');
//				nlapiSubmitRecord(poRecord);
//			}catch(e){
//				nlapiLogExecution('DEBUG', '�t���O�X�V', e.message);
//			}	
				
//			poidMap[poid] = {
//				type:valueTotal[i].type,
//				po_id:valueTotal[i].po_id,
//				po_line_no:valueTotal[i].po_line_no,
//				item:valueTotal[i].item
//			}
//		}
//		nlapiSubmitRecord(poRecord);
//		var poidMap__ =  JSON.stringify(poidMap)
//		nlapiLogExecution('DEBUG', 'valueTotal', poidMap__);
//		//�t���O�X�V
//		for(var KEY in poidMap){
//				try{
//					nlapiSubmitField('purchaseorder', poid, 'custbody_djkk_in_stock_flg', 'T');
//				}catch(e){
//					nlapiLogExecution('DEBUG', '�t���O�X�V', e.message);
//				}
//		}
		
	}
	
	nlapiLogExecution('DEBUG', '', '�I��');
}

function pdf(pdfData){

	var valueTotal = pdfData.valueTotal;
	
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
					   new nlobjSearchColumn("altname","vendor",null), //����於
					   new nlobjSearchColumn("entityid","vendor",null), //�����R�[�h
					   new nlobjSearchColumn("altname","vendor",null), 
					   new nlobjSearchColumn("custbody_djkk_ship_via"), 
					   new nlobjSearchColumn("transactionnumber"), //�������ԍ�
					   new nlobjSearchColumn("memo"), //���l
					   new nlobjSearchColumn("trandate"), //������
//					   new nlobjSearchColumn("department"), 
					   new nlobjSearchColumn("department"),//�����������R�[�h + ������������
					   new nlobjSearchColumn("type"),//���
					   new nlobjSearchColumn("approvalstatus"),//���ח\�芮������
					]
				); 
				
				var altname= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("altname","vendor",null));//����於
				var vendorname= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("entityid","vendor",null));//�����R�[�h
				var expectedreceiptdate= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("expectedreceiptdate"));//���ח\���
				if(expectedreceiptdate){
					expectedreceiptdate = formatDate(nlapiStringToDate(expectedreceiptdate));
				}
				
				var transactionnumber= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("transactionnumber"));//�������ԍ�
				var memo= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("memo"));//���l
				var trandate= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getValue("trandate"));//������
				var department= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getText("department"));//�����������R�[�h
				var departmentName = '';//������������
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
				var type= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getText("type"));//���
				var approvalstatus= defaultEmpty(isEmpty(poSearch) ? '' :  poSearch[0].getText("approvalstatus"));//���ח\�芮������
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
				nlapiLogExecution('DEBUG', 'poDataMap', poDataMap);
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
				    '<td style="vertical-align: middle;font-size: 13px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;'+pdfData.subsidiaryName+'</td>' +
//				    '<td ></td>' +
				    '<td ></td>' +
				    '<td ></td>' +
				    '<td colspan="2" rowspan="2" style="vertical-align: middle;font-size: 13px;">�o�͓���:' + formatDateTime(new Date()) + '</td>' +
				    '<td ></td>' +
				    '<td style="vertical-align:middle;font-size: 13px" rowspan="2"><pagenumber/>&nbsp;�y�[�W</td>' +
				    '</tr>' +
					'<tr height="30px">' +
				    '<td align="center" style="vertical-align: middle;font-size: 13px;">S001</td>' +
				    '<td style="vertical-align: middle;font-size: 13px;" colspan="5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;'+pdfData.locationName+'</td>' +
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
			    '<td  colspan="2" style="font-size: 22px;font-weight: bold;text-decoration: underline;" align="center">���ח\�胊�X�g</td>' +
			    '<td ></td>' +
//			    '<td colspan="2" rowspan="2" align="left"><barcode codetype="code128" value="PO;' + poid + ';' + tranid + '"/></td>' +
			    '<td colspan="2" rowspan="2" align="left"><barcode codetype="code128" value="' + tranid + '"/></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">���ח\���</td>' +
			    '<td >:&nbsp;&nbsp;'+time+'</td>' +
			    '<td align="left">������</td>' +
			    '<td >:&nbsp;&nbsp;'+formatDate(nlapiStringToDate(poData.trandate))+'</td>' +
			    '<td >���׎��</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.type+'</td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">���ח\��ԍ�</td>' +
			    '<td >:&nbsp;&nbsp;</td>' +
			    '<td align="left">���ח\�芮���敪</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.approvalstatus+'</td>' +
			    '<td >�������ԍ�</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.transactionnumber+'</td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">�����R�[�h</td>' +
			    '<td >:&nbsp;&nbsp;'+poData.vendorname+'</td>' +
			    '<td align="left">����於</td>' +
			    '<td colspan="2">:&nbsp;&nbsp;'+poData.altname+'</td>' +
			    '' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">�����������R�[�h</td>' +
			    '<td>:&nbsp;&nbsp;'+poData.department+'</td>' +
//			    '<td>:&nbsp;&nbsp;'+SEARCH_DPM+'</td>' +
			    '<td align="left">������������</td>' +
			    '<td colspan="2">:&nbsp;&nbsp;'+poData.departmentName+'</td>' +
			    '' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '<td ></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;">' +
			    '<td align="left">���l</td>' +
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
			    '<td >���i�R�[�h</td>' +
			    '<td >���i��</td>' +
			    '<td >����揤�i�R�[�h</td>' +
			    '</tr></table>' ;
			    str+=

			    '<table style="border-bottom: 1px solid black;border-collapse: collapse;">' +
			    '<tr style="font-size: 13px;font-weight: bold;">' +
			    '<td width="70px" ></td>' +
			    '<td width="140px" ></td>' +
			    '<td width="130px" >���b�g�ԍ�</td>' +
			    '<td width="140px" >�L������</td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="115px"></td>' +
			    '<td width="115px"></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;font-weight: bold;">' +
			    '<td width="70px"></td>' +
			    '<td width="140px"></td>' +
			    '<td width="130px">�Ō����敪</td>' +
			    '<td width="140px">���x�ы敪 </td>' +
			    '<td width="130px">���ː��L���敪 </td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="115px"></td>' +
			    '<td width="115px"></td>' +
			    '</tr>' +
			    '<tr style="font-size: 13px;font-weight: bold;">' +
			    '<td width="70px"></td>' +
			    '<td width="140px"></td>' +
			    '<td width="130px">���l</td>' +
			    '<td width="140px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="130px"></td>' +
			    '<td width="115px" align="right">���ח\�萔</td>' +
			    '<td width="115px" align="right">���i�c��</td>' +
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
//						+valueDetailsArray['po_id']+';'
						+valueDetailsArray['po_line_no']+';'
//						+itemID
						+defaultEmpty(valueDetailsArray.lot_number)
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

function savePdf(purchaseorderSearch){
	try{

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(pdf(purchaseorderSearch));
	    //renderer.addSearchResults('results',purchaseorderSearch  );
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_INCOMING_PDF);
		xlsFile.setName('���ב��M' + '_' + getFormatYmdHms() + '.pdf');
		// save file
		return nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'no error', e)
	}
}
function csvDown(xmlString){
	try{
	
		var xlsFile = nlapiCreateFile('���ב��M' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
		
		xlsFile.setFolder(FILE_CABINET_ID_TOTAL_INV_OUTPUT_FILE);
		xlsFile.setName('���ב��M' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setEncoding('SHIFT_JIS');
	    
		// save file
		return  nlapiSubmitFile(xlsFile);
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'no error csvDown', e)
	}
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
