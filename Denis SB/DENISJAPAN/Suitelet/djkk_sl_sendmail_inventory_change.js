/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Aug 2022     rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var flag = 'F';
	var id = request.getParameter('id');
	var userid = request.getParameter('userid');
	nlapiLogExecution('debug', 'id', id);
	
	var record = nlapiLoadRecord('customrecord_djkk_ic_change',id);
	var locationMain = record.getFieldValue('custrecord_djkk_ica_location');
	var count=record.getLineItemCount('recmachcustrecord_djkk_ica_change');  
	var xmlString ='';
	var creatCsvMailFlag=false;
	//PDF�쐬�p
	var pdfExArr = new Array();
		  //���׏��
		  xmlString +='DJ_�a����݌�ID,DJ_�A�C�e��,DJ_�ꏊ,DJ_�P��,DJ_�����,�ڋq�z������,DJ_����\r\n';
		  for(var i=1;i<count+1;i++){
			  var customerDeliveryFlag='F';
			  record.selectLineItem('recmachcustrecord_djkk_ica_change', i);
			  var thelink=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_detail');
			  var icclId=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'id');
			  var changereasonId=record.getLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_changereason',i);
			  var invadjstChangeReasonSearch = nlapiSearchRecord("customrecord_djkk_invadjst_change_reason",null,
					  [
					     ["internalid","anyof",changereasonId]
					  ], 
					  [
					     new nlobjSearchColumn("name").setSort(false), 
					  ]
					  );
			  var changereason = invadjstChangeReasonSearch[0].getValue('name')
			  
			  if(!isEmpty(icclId)&&changereason != '�I��'&&thelink.indexOf('icChangeID')<0){
				  thelink+='&icChangeID='+id;
				  thelink+='&iclineID='+i;
				  nlapiSubmitField('customrecord_djkk_ic_change_l', icclId, 'custrecord_djkk_ica_detail', thelink); 
			  }
			  	  
			  // DJ_�a����݌ɖ���ID
			  var iclId=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_id');
			  
			  // DJ_�V��������
			  var newqty=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_newqty');
			  
			  // �ڋq�z��
			if (changereason == '�ڋq�z��') {
			//PDF�쐬�p
			  var _pdfExArrLine = "";
			  creatCsvMailFlag=true;
			  // DJ_�a����݌�ID
			  var icaIcIdValue = record.getLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_ic_id',i);
			  var customrecord_djkk_inventory_in_custodySearch = nlapiSearchRecord("customrecord_djkk_inventory_in_custody",null,
					  [
					     ["internalid","anyof",icaIcIdValue]
					  ], 
					  [
					     new nlobjSearchColumn("name").setSort(false)
					  ]
					  );
			  var icaIcIdText = customrecord_djkk_inventory_in_custodySearch[0].getValue("name");
			  var icaItemValue = record.getLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_item',i);
			  var itemSearch = nlapiSearchRecord("item",null,
					  [
					     ["internalid","anyof",icaItemValue]
					  ], 
					  [
					     new nlobjSearchColumn("itemid").setSort(false)
					  ]
					  );
			  var icaItemText = itemSearch[0].getValue("itemid");
			  var icaWarehouseValue = record.getLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_warehouse',i);
			  var locationSearch = nlapiSearchRecord("location",null,
					  [
					     ["internalid","anyof",icaWarehouseValue]
					  ], 
					  [
					     new nlobjSearchColumn("name").setSort(false)
					  ]
					  );
			  var icaWarehouseText = locationSearch[0].getValue("name");
			  var icaUnitText = record.getLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_unit_display',i);
			  xmlString += icaIcIdText;
			  xmlString += ',';
			  _pdfExArrLine += icaIcIdText+',';
			  
			  
			  // DJ_�A�C�e��
			  xmlString += icaItemText;
			  xmlString += ','; 
			  _pdfExArrLine += icaItemText+',';
			  
			  // DJ_�ꏊ
			  xmlString += icaWarehouseText;
			  xmlString += ','; 
			  _pdfExArrLine += icaWarehouseText+',';
			  
			  // DJ_�P��
			  xmlString += icaUnitText;
			  xmlString += ','; 
			  _pdfExArrLine += icaUnitText+',';
			  
			  // DJ_�����
			  xmlString +=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_conversionrate');
			  xmlString += ',';
			  _pdfExArrLine += record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_conversionrate')+',';
			  
			  // DJ_��������
			  var adjqty=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_adjqty');
			  xmlString +=Number(-adjqty);
			  xmlString += ',';
			  _pdfExArrLine += record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_adjqty')+',';
			  
			  // DJ_����
			  xmlString +=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_memo');
			  xmlString += '\r\n'; 
			  _pdfExArrLine += record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_memo');
			  pdfExArr.push(_pdfExArrLine);
			  nlapiLogExecution('debug', '_pdfExArrLine', _pdfExArrLine);
			  	  	  
			 
					if (!isEmpty(newqty) && Number(newqty) == 0) {
						customerDeliveryFlag = 'T';
					}
				}
			  	if(!isEmpty(iclId)){
			  nlapiSubmitField('customrecord_djkk_inventory_in_custody_l', iclId, ['custrecord_djkk_icl_quantity_inventory','custrecord_djkk_icl_customer_delivery'] ,[newqty,customerDeliveryFlag]); 
			  	}
		  }
		  if(creatCsvMailFlag&&record.getFieldValue('custrecord_djkk_ica_sendmail')!='T'){
			  if (!isEmpty(locationMain)) {
					var locationSearch = nlapiSearchRecord("location", null, 
							[ ["internalid", "anyof", locationMain ] ], 
							[new nlobjSearchColumn("custrecord_djkk_address_fax","address", null),
							new nlobjSearchColumn("custrecord_djkk_mail", "address",null) ]);

					if (!isEmpty(locationSearch)) {
						var fax = locationSearch[0].getValue("custrecord_djkk_address_fax", "address");
						var mails = locationSearch[0].getValue("custrecord_djkk_mail","address");
			  // create file
			  var xlsFile = nlapiCreateFile('DJ_�a����݌ɔz���`�[' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
			  xlsFile.setFolder(FILE_CABINET_ID_DJ_DEPOSIT_STOCK_DELIVERY_SLIP);
			  xlsFile.setEncoding('SHIFT_JIS');

			  // save file
			  var fileID = nlapiSubmitFile(xlsFile);
		      if(!isEmpty(fileID)&&!isEmpty(mails)){
			 var setrecords = new Object();
			 var soId= record.getFieldValue('custrecord_djkk_ica_so');
			 if(!isEmpty(soId)){
				 setrecords['transaction'] = soId;
			 }else{
				 setrecords=null;
			 }
			 var files = new Array();
			 files.push(nlapiLoadFile(fileID));
			 files.push(creatPdfFile(id,pdfExArr));
			 nlapiSendEmail(nlapiGetUser(), mails, 'DJ_�a����݌�:�q�ɂւ̔z���w���� &�[�i��', '�a����݌ɔz���`�[&�[�i��', null, null, setrecords, files);
			 nlapiSubmitField('customrecord_djkk_ic_change', id, 'custrecord_djkk_ica_sendmail', 'T', false);
			 
			 
		      }
		      
			  }
			 }
		}
	flag = 'T';
	response.write(flag);


}


function creatPdfFile(recordId,pdfExArr){
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
	'<th>DJ_�a����݌�ID</th>'+
	'<th>DJ_�A�C�e��</th>'+
	'<th>DJ_�ꏊ</th>'+
	'<th>DJ_�P��</th>'+
	'<th>DJ_����� </th>'+
	'<th>�ڋq�z������</th>'+
	'<th>DJ_����</th>'+
	'</tr>'+
	'</thead>'
	for(var i = 0 ; i < pdfExArr.length ; i ++){
		var pdfExArrLine = pdfExArr[i].split(',');
		xmlString+=
		'<tr><td>'+pdfExArrLine[0]+'</td>'+
		'<td>'+pdfExArrLine[1]+'</td>'+
		'<td>'+pdfExArrLine[2]+'</td>'+
		'<td>'+pdfExArrLine[3]+'</td>'+
		'<td>'+pdfExArrLine[4]+'</td>'+
		'<td>'+pdfExArrLine[5]+'</td>'+
		'<td>'+pdfExArrLine[6]+'</td></tr>';
		
	} 
	xmlString+='</table>'+
	'</body>'+
	'</pdf>';


	//var record = nlapiLoadRecord('customrecord_djkk_ic_change', recordId);
	var renderer = nlapiCreateTemplateRenderer();
	renderer.setTemplate(xmlString);
	//renderer.addRecord('record', record);
	var xml = renderer.renderToString();
	var xlsFile = nlapiXMLToPDF(xml);

	// var xlsFile = nlapiXMLToPDF(xmlString);
	// PDF�t�@�C������ݒ肷��
	xlsFile.setName('DJ_�a����݌ɒ���:�q�ɂւ̔z���w���� &�[�i�� ' + '_' + getFormatYmdHms() + '.pdf');
	xlsFile.setFolder(FILE_CABINET_ID_DJ_DEPOSIT_STOCK_DELIVERY_SLIP);
	xlsFile.setIsOnline(true);

	// save file
	var fileID = nlapiSubmitFile(xlsFile);
	var fl = nlapiLoadFile(fileID);
	return fl;
	}
