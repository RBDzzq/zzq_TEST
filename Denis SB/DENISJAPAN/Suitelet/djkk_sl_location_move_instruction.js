/**
 * �q�Ɉړ��w�����X�g
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/16     CPC_��
 *
 */

function suitelet(request, response) {
	
	if (request.getMethod() == 'POST') {
		run(request, response);
		
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response)
		}else{
			createForm(request, response);
		}
	}

}

function run(request, response,locationValue,subsidiaryValue){
	

	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	
	var str = "";
	var fromLocationId='';
	var theCount = parseInt(request.getLineItemCount('inventory_details'));
	for(var i = 0 ; i < theCount ; i ++){
		var check = request.getLineItemValue('inventory_details', 'check', i+1);
		var id = request.getLineItemValue('inventory_details', 'internalid', i+1);
		var tranid = request.getLineItemValue('inventory_details', 'tranid', i+1);
		var date = request.getLineItemValue('inventory_details', 'date', i+1);
		var itemname = request.getLineItemValue('inventory_details', 'itemname', i+1);
		var from = request.getLineItemValue('inventory_details', 'from', i+1);
		fromLocationId=request.getLineItemValue('inventory_details', 'from_id', i+1);
		var from_id = request.getLineItemValue('inventory_details', 'from_id', i+1);
		var to = request.getLineItemValue('inventory_details', 'to', i+1);
		var to_id = request.getLineItemValue('inventory_details', 'to_id', i+1);
		var quantity = request.getLineItemValue('inventory_details', 'quantity', i+1);
		if(check == 'T'){
			str+= id+"_"+from_id+"_"+to_id+"_"+tranid+"   "+date+"   "+itemname+"   "+from+"   "+to+"   "+quantity+",";
		}
		
	}

	scheduleparams['custscript_djkk_ss_location_move_ins_par'] = str;
	scheduleparams['custscript_djkk_ss_location_move_locid'] = fromLocationId;
	scheduleparams['custscript_ss_location_move_fileid'] = request.getParameter('custpage_fileid');	
	scheduleparams['custscript_djkk_ss_location_move_send'] = nlapiGetUser();
	runBatch('customscript_djkk_ss_location_move_ins', 'customdeploy_djkk_ss_location_move_ins',scheduleparams);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

//�o�b�`��ԉ��
function logForm(request, response) {

	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_djkk_cs_location_move_ins');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_location_move_ins');

	if (batchStatus == 'FAILED') {
		// ���s���s�̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
		runstatusField.setDefaultValue(messageColour);
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// ���s���̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('�o�b�`���������s��');
		response.writePage(form);
	}else{
		createForm(request, response);
	}
	
}


function createForm(request, response){
	
	//�p�����[�^�擾
	 var selectFlg = request.getParameter('selectFlg');
	 var locationMoveIdValue = request.getParameter('locationMoveId');
	 var dateValue = request.getParameter('date');
	 var locationFromValue = request.getParameter('locationFrom');
	 var locationToValue = request.getParameter('locationTo');
	 var subValue = request.getParameter('sub');
	 if(isEmpty(subValue)){
		 subValue = nlapiGetSubsidiary();
	 }

	 
	var form = nlapiCreateForm('DJ_�q�Ɉړ��w�����', false);
	form.setScript('customscript_djkk_cs_location_move_ins');
		
	 //��ʍ��ڒǉ�
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '�����߂�','searchReturn()')
		 form.addSubmitButton('���M')
	 }else{
		form.addButton('btn_search', '����', 'search()')
	 }
	 

	form.addFieldGroup('select_group', '����');
	var subField = form.addField('custpage_sub', 'select', '�A��','subsidiary', 'select_group').setDisplayType('inline');
	var locationMoveIdField = form.addField('custpage_location_move_id', 'select', '�݌Ɉړ��ԍ�','inventorytransfer', 'select_group');
	var dateField = form.addField('custpage_date', 'date', '���t',null, 'select_group');
	var locationFromField = form.addField('custpage_location_from', 'select', '�ړ����q��','location', 'select_group');
	locationFromField.setMandatory(true);
	var locationToField = form.addField('custpage_location_to', 'select', '�ړ���q��','location', 'select_group');
	var fileId=form.addField('custpage_fileid', 'text', '�t�@�C��id',null, 'select_group');
	fileId.setDisplayType('hidden');
	if(selectFlg == 'T'){
		locationMoveIdField.setDisplayType('inline');	
		dateField.setDisplayType('inline');	
		locationFromField.setDisplayType('inline');	
		locationToField.setDisplayType('inline');	
	}
	subField.setDefaultValue(subValue);
	locationMoveIdField.setDefaultValue(locationMoveIdValue)
	dateField.setDefaultValue(dateValue)
	locationFromField.setDefaultValue(locationFromValue)
	locationToField.setDefaultValue(locationToValue)
	
	
	var subList = form.addSubList('inventory_details', 'list', '�A�C�e��');
	//subList.addMarkAllButtons()
	subList.addField('check', 'checkbox', '�I��').setDisplayType('hidden');
	subList.addField('internalid', 'text', '����ID').setDisplayType('hidden');
	subList.addField('tranid', 'text', '�݌Ɉړ��ԍ�').setDisplayType('normal');
	var soLink = subList.addField('link', 'url', '�\��').setDisplayType('disabled');
	soLink.setLinkText('�\��');
	subList.addField('date', 'date', '���t').setDisplayType('normal');
	subList.addField('itemname', 'text', '�A�C�e����').setDisplayType('normal');
	subList.addField('from', 'text', '�ړ��O�q��').setDisplayType('normal');
	subList.addField('to', 'text','�ړ���q��').setDisplayType('normal');
	subList.addField('from_id', 'text','�ړ��O�q��ID').setDisplayType('hidden');
	subList.addField('to_id', 'text','�ړ���q��ID').setDisplayType('hidden');
	subList.addField('quantity', 'text','����').setDisplayType('normal');
	
	if(selectFlg == 'T'){
		

		var filit = new Array();
		filit.push(["type","anyof","InvTrnfr"]);
		filit.push("AND");
		filit.push(["mainline","is","F"]);
		filit.push("AND");
		filit.push(["custbody_djkk_warehouse_sent","is","F"]);
		filit.push("AND");
		filit.push(["subsidiary","anyof",subValue]);
		
	
		if(!isEmpty(locationMoveIdValue)){
			filit.push("AND");
			filit.push(["internalid","anyof",locationMoveIdValue]);
		}
		
		if(!isEmpty(dateValue)){
			filit.push("AND");
			filit.push(["trandate","on",dateValue]);
		}
		
//		if(!isEmpty(locationFromValue)){
//			filit.push("AND");
//			filit.push(["trandate","anyof",locationFromValue]);
//		}
		
//		if(!isEmpty(locationToValue)){
//			filit.push("AND");
//			filit.push(["location","anyof",locationToValue]);
//		}
		

		
		
		var inventorytransferSearch = getSearchResults("inventorytransfer",null,filit, 
				[
				   new nlobjSearchColumn("internalid").setSort(false), 
				   new nlobjSearchColumn("trandate"), 
				   new nlobjSearchColumn("item").setSort(false), 
				   new nlobjSearchColumn("location"), 
				   new nlobjSearchColumn("quantity").setSort(false), 
				   new nlobjSearchColumn("formulatext").setFormula("CASE WHEN {quantity}>0 THEN '�ړ���' ELSE '�ړ���' END"),
				   new nlobjSearchColumn("tranid"),
				   new nlobjSearchColumn("transactionname")
				]
				);
		var itemLine = 1;
		var rst = new Array();
		if(!isEmpty(inventorytransferSearch)){
			for(var i = 0 ; i < inventorytransferSearch.length ; i+=2){

				
				if(!isEmpty(locationFromValue)){
					if(inventorytransferSearch[i].getValue('location') != locationFromValue){
						continue;
					}
				}
				
				
				if(!isEmpty(locationToValue)){
					if(inventorytransferSearch[i+1].getValue('location') != locationToValue){
						continue;
					}
				}
				
				subList.setLineItemValue('internalid',itemLine,inventorytransferSearch[i].getValue('internalid'));
			    var theLink = nlapiResolveURL('RECORD', 'inventorytransfer',inventorytransferSearch[i].getValue('internalid') ,'VIEW');
				subList.setLineItemValue('link', itemLine, theLink);
				subList.setLineItemValue('date', itemLine, inventorytransferSearch[i].getValue('trandate'));
				subList.setLineItemValue('itemname', itemLine, inventorytransferSearch[i].getText('item'));			
				subList.setLineItemValue('from', itemLine, inventorytransferSearch[i].getText('location'));
				subList.setLineItemValue('to', itemLine, inventorytransferSearch[i+1].getText('location'));
				subList.setLineItemValue('from_id', itemLine, inventorytransferSearch[i].getValue('location'));
				subList.setLineItemValue('to_id', itemLine, inventorytransferSearch[i+1].getValue('location'));
				subList.setLineItemValue('quantity', itemLine, inventorytransferSearch[i+1].getValue('quantity'));
				subList.setLineItemValue('tranid', itemLine, inventorytransferSearch[i].getValue('transactionname'));
				subList.setLineItemValue('check', itemLine, 'T');
				itemLine++;
				
				var str = inventorytransferSearch[i].getValue('transactionname')+','+
				inventorytransferSearch[i].getValue('trandate')+','+
				inventorytransferSearch[i].getText('item')+','+
				inventorytransferSearch[i].getText('location')+','+
				inventorytransferSearch[i+1].getText('location')+','+
				inventorytransferSearch[i+1].getValue('quantity')+','+
				inventorytransferSearch[i+1].getValue('internalid')+','+
				inventorytransferSearch[i+1].getValue('tranid');
				rst.push(str);
			
			}
		}
		
		var csvDownUrl = "window.open('" + pdfDown(rst,fileId) + "', '_blank');";
		form.addButton('btn_pdf', 'PDF�_�E�����[�h',csvDownUrl)
		
	}
	
		
	
	response.writePage(form);
}


function pdf(rst){
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
	'td { padding: 4px 6px; }'+
	'b { font-weight: bold; color: #333333; }'+
	'</style>'+
	'</head>'+
	'<body padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">'+
	'    <table>'+
	'<thead>'+
	'<tr>'+
	'<th>�݌Ɉړ��ԍ� </th>'+
	'<th>���t </th>'+
	'<th>�A�C�e���� </th>'+
	'<th>�ړ��O�q�� </th>'+
	'<th>�ړ���q��  </th>'+
	'<th>����</th>'+
	'</tr>'+
	'</thead>'

	for(var i = 0 ; i < rst.length;i++)	{	
		var rstLine = rst[i].split(',');
		
		str+='<tr>';
		str+='<td></td>';
		str+='<td align="left" colspan="4"><barcode codetype="code128" height="50" width="260" showtext="false" value="'+rstLine[7]+'"/></td>';
		str+='<td ></td>';
		str+='</tr>';
		
		str+='<tr>';
		str+='<td>'+rstLine[0]+'</td>'
		str+='<td>'+rstLine[1]+'</td>'
		str+='<td>'+rstLine[2]+'</td>'
		str+='<td>'+rstLine[3]+'</td>'
		str+='<td>'+rstLine[4]+'</td>'
		str+='<td>'+rstLine[5]+'</td>'
		str+='</tr>';
	}
	
	str+='</table>'+
	'</body>'+
	'</pdf>'
	return str;
}

function pdfDown(rst,fileId){
	try{
	

	    var renderer = nlapiCreateTemplateRenderer();
	    renderer.setTemplate(pdf(rst));
	    var xml = renderer.renderToString();
	    nlapiLogExecution('DEBUG', '', xml)
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_WAREHOUSE_MOVE);
		xlsFile.setName('�q�Ɉړ��w�����X�g' + '_' + getFormatYmdHms() + '.pdf');
	    
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		IN_STOCK_SEND_FILE_ID = fileID;
		fileId.setDefaultValue(fileID.toString());
		var fl = nlapiLoadFile(fileID);
		var url= fl.getURL();
		return url; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', 'error', e)
	}
}

