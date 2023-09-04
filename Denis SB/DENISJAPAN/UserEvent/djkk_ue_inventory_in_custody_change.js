/**
 * DJ_�a����݌ɒ�����UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/06     CPC_��
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
	if (type == 'create') {
		var date=nlapiDateToString(getSystemTime());
		nlapiSetFieldValue('custrecord_djkk_ica_date', date);
		  try{
    var soid=request.getParameter('soid');
    var delivery=request.getParameter('delivery');
    var entity=request.getParameter('entity');
    var subsidiary=request.getParameter('subsidiary');
    if(!isEmpty(soid)&&!isEmpty(entity)&&!isEmpty(subsidiary)){
    	nlapiSetFieldValue('custrecord_djkk_ica_subsidiary', subsidiary, false, true);
    	nlapiSetFieldValue('custrecord_djkk_ica_customer', entity, false, true);
    	nlapiSetFieldValue('custrecord_djkk_ica_delivery_destination', delivery, true, true);
    	nlapiSetFieldValue('custrecord_djkk_ica_so', soid, false, true);
    	setFieldDisableType('custrecord_djkk_ica_subsidiary','inline');
    	setFieldDisableType('custrecord_djkk_ica_customer','inline');
    	setFieldDisableType('custrecord_djkk_ica_so','inline');

		var resonId='';
		var reasonSearch = nlapiSearchRecord("customrecord_djkk_invadjst_change_reason",null,
				[
				   ["custrecord_djkk_reson_subsidiary","anyof",subsidiary], 
				   "AND", 
				   ["name","contains","�ڋq�z��"]
				], 
				[
				   new nlobjSearchColumn("internalid")
				]
				);
		if(!isEmpty(reasonSearch)){
			resonId=reasonSearch[0].getValue('internalid');
		}	
    	
    	var count=nlapiGetLineItemCount('recmachcustrecord_djkk_ica_change');
    	for (var j = count; j >0; j--) {
				nlapiRemoveLineItem('recmachcustrecord_djkk_ica_change', j);
		}
     var customerID=nlapiGetFieldValue('custrecord_djkk_ica_customer');
     var subsidiary=nlapiGetFieldValue('custrecord_djkk_ica_subsidiary');
     if(!isEmpty(customerID)&&!isEmpty(subsidiary)){
     var iclSearch = getSearchResults("customrecord_djkk_inventory_in_custody_l",null,
    		 [
    		    ["custrecord_djkk_icl_inventory_in_custody.custrecord_djkk_ic_subsidiary","anyof",subsidiary], 
    		    "AND", 
    		    ["custrecord_djkk_icl_inventory_in_custody.custrecord_djkk_ic_customer","anyof",customerID], 
    		    "AND", 
    		    ["custrecord_djkk_icl_customer_delivery","is","F"],
    		    "AND", 
    		    ["custrecord_djkk_icl_inventory_in_custody.custrecord_djkk_createdfrom","anyof",soid]
    		 ], 
    		 [
    		    new nlobjSearchColumn("internalid"),
    		    new nlobjSearchColumn("custrecord_djkk_icl_inventory_in_custody"),
    		    new nlobjSearchColumn("custrecord_djkk_icl_item"), 
    		    new nlobjSearchColumn("custrecord_djkk_icl_inventorylocation"),
    		    new nlobjSearchColumn("custrecord_djkk_icl_cuslocation"), 
    		    new nlobjSearchColumn("custrecord_djkk_icl_conversionrate"), 
    		    new nlobjSearchColumn("custrecord_djkk_icl_unit"), 
    		    new nlobjSearchColumn("custrecord_djkk_icl_quantity_inventory"), 
    		    new nlobjSearchColumn("custrecord_djkk_icl_inventorydetails"), 
    		    new nlobjSearchColumn("custrecord_djkk_createdfrom","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null)
    		 ]
    		 );
     
     if(!isEmpty(iclSearch)){
    	 for (var i = 0; i < iclSearch.length; i++) {
    		 nlapiSelectNewLineItem('recmachcustrecord_djkk_ica_change');
    		     		    		 
    		 // DJ_�A�C�e��
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_item', iclSearch[i].getValue('custrecord_djkk_icl_item'));
    		 
    		 //DJ_�q���
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_line_subsidiary', subsidiary);
    		 
    		 // DJ_�ꏊ
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_warehouse', iclSearch[i].getValue('custrecord_djkk_icl_inventorylocation'));
    		 
    		 // DJ_�a����݌ɏꏊ
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_cuslocation', iclSearch[i].getValue('custrecord_djkk_icl_cuslocation'));
    		 
    		 // DJ_�P��
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_unit', iclSearch[i].getValue('custrecord_djkk_icl_unit'));
    		 
    		 // DJ_�����
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_conversionrate', iclSearch[i].getValue('custrecord_djkk_icl_conversionrate'));
    		 
    		 // DJ_�݌ɐ���
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_inventoryqty', iclSearch[i].getValue('custrecord_djkk_icl_quantity_inventory'));
    		 
    		 // DJ_�V��������
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_newqty', iclSearch[i].getValue('custrecord_djkk_icl_quantity_inventory'));
    		 var link=nlapiResolveURL('SUITELET', 'customscript_djkk_sl_dj_inventory_detail','customdeploy_djkk_sl_dj_inventory_detail');
    			 link+= '&djInvID='+iclSearch[i].getValue('custrecord_djkk_icl_inventorydetails');
    		 // DJ_�݌ɏڍ�
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_detail', link);
    		 
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_changereason', resonId);
    		    		 		 
    		 // DJ_�a����݌�ID
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_ic_id', iclSearch[i].getValue('custrecord_djkk_icl_inventory_in_custody'));
    		 
    		 // DJ_�a����݌ɖ���ID
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_id', iclSearch[i].getValue('internalid'));
    		
    		 // DJ_�a����݌ɍ쐬��
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_createdfrom', iclSearch[i].getValue("custrecord_djkk_createdfrom","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null));   		 
    		 nlapiCommitLineItem('recmachcustrecord_djkk_ica_change')
    	 }
       }
      }
	
    }
  }catch(e){
	  nlapiLogExecution('ERROR', 'e', e);
  }
  }
	//U812 start byWang
	form.setScript('customscript_djkk_cs_inventory_in_cust');
	if (type == 'view') {
	    var id = request.getParameter('id');
	    var record = nlapiLoadRecord('customrecord_djkk_ic_change', id);
	    var ica_sendmail = record.getFieldValue('custrecord_djkk_ica_sendmail');
	    if (ica_sendmail != 'T'){
	    	form.addButton('custpage_deliveryinstructions', '�z���w��','deliveryinstructions()');
			
	    }

	    var detail = '';
	    var changeDetailId = '';
//		var record = nlapiLoadRecord('customrecord_djkk_ic_change', id);
//		var name = record.getFieldValue('name');
//		nlapiLogExecution('debug', 'name',name);
	    //DJ_�a����݌ɒ����ۑ�����
	    var ic_change_lSearch = nlapiSearchRecord("customrecord_djkk_ic_change_l",null,
	    		[
	    		   ["custrecord_djkk_ica_change","anyof",id]
	    		], 
	    		[
	    		   new nlobjSearchColumn("custrecord_djkk_ica_detail"),
	    		   new nlobjSearchColumn("internalid")

	    		]
	    		);
	    if(ic_change_lSearch.length > 0){
	    	//DJ_�a����݌ɒ���_���ׂ��擾
	    	for(var i = 0; i<ic_change_lSearch.length;i++ ){
	    		detail = ic_change_lSearch[i].getValue('custrecord_djkk_ica_detail');
	    		changeDetailId = ic_change_lSearch[i].getValue('internalid');
	    		var detailArray = detail.split('&');
	    		//DJ_�݌ɏڍׂ��擾
	    		var InventoryDetailGetArray = detailArray[1].split('=');
	    		var InventoryDetailId = InventoryDetailGetArray[1];
	    		//DJ_�݌ɏڍוۑ�����
	    		var inventory_detailsSearch = nlapiSearchRecord("customrecord_djkk_inventory_details",null,
	    				[
	    				   ["internalid","anyof",InventoryDetailId]
	    				], 
	    				[
	    				   new nlobjSearchColumn("custrecord_djkk_ditl_newseriallot_number","CUSTRECORD_DJKK_INVENTORY_DETAILS",null)
	    				]
	    				);
	    		var inventoryDetailCheck = isEmpty(inventory_detailsSearch) ? '' : inventory_detailsSearch[0].getValue("custrecord_djkk_ditl_newseriallot_number","CUSTRECORD_DJKK_INVENTORY_DETAILS",null);
	    		nlapiLogExecution('debug', 'inventoryDetailCheck',inventoryDetailCheck);
	    		//DJ_�݌ɏڍׂɒl���������ꍇ��DJ_�a����݌ɒ����[����.DJ_�����ς݂��`�F�b�N�I���ɃZ�b�g
	    		//DJ_�a����݌ɒ���_���ׂ����[�h
	    		if(!isEmpty(inventoryDetailCheck)){
	    			nlapiLogExecution('debug', 'accessBefore',changeDetailId);
	    			var record = nlapiLoadRecord('customrecord_djkk_ic_change_l', changeDetailId);
	    			nlapiLogExecution('debug', 'accessAfter');
	    			record.setFieldValue('custrecord_djkk_prepared_status','T');
	    			nlapiSubmitRecord(record);
	    			

	    		}
	    		
	    		
	    	}
	    }
	}
	//U812 end byWang
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
//	  var id=nlapiGetRecordId();
//	  var record=nlapiLoadRecord('customrecord_djkk_ic_change', id);
//
//	
//	  // DJ_��������
//	  var icaAdjqty = record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_adjqty');
//	  nlapiLogExecution('ERROR', 'icaAdjqty', icaAdjqty);
//	  // DJ_�ύX���R
//	  var icaChangereason = record.getCurrentLineItemValue('custrecord_djkk_ica_changereason', 'custrecord_djkk_ica_adjqty');
//	  nlapiLogExecution('ERROR', 'icaChangereason', icaChangereason);
//	  if(Number(icaAdjqty) > 0 && isEmpty(icaChangereason)){
//		  alert(111);
//		  return false;
//	  }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
	if (type == 'delete') {
		return'';
	}
//
	//�z���w���{�^����ǉ����ĊY���@�\��J�ڂ���
	else if(type == 'create'||type == 'edit'){
  var id=nlapiGetRecordId();
  var record=nlapiLoadRecord('customrecord_djkk_ic_change', id);
  var locationMain=record.getFieldValue('custrecord_djkk_ica_location');
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
	  var changereason=record.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_changereason',i);
	  
	  if(!isEmpty(icclId)&&changereason != '�I��'&&thelink.indexOf('icChangeID')<0){
		  thelink+='&icChangeID='+id;
		  thelink+='&iclineID='+i;
		  nlapiSubmitField('customrecord_djkk_ic_change_l', icclId, 'custrecord_djkk_ica_detail', thelink); 
	  }
	  	  
	  // DJ_�a����݌ɖ���ID
	  var iclId=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_id');
	  
	  // DJ_�V��������
	  var newqty=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_newqty');
	  
	  	if(!isEmpty(iclId)){
	  	  nlapiSubmitField('customrecord_djkk_inventory_in_custody_l', iclId, ['custrecord_djkk_icl_quantity_inventory','custrecord_djkk_icl_customer_delivery'] ,[newqty,customerDeliveryFlag]); 
	  	  	}

	  
	  // �ڋq�z��
//	if (changereason == '�ڋq�z��') {
//	//PDF�쐬�p
//	  var _pdfExArrLine = "";
//	  creatCsvMailFlag=true;
//	  // DJ_�a����݌�ID
//	  xmlString +=record.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_ic_id',i);
//	  xmlString += ',';
//	  _pdfExArrLine += record.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_ic_id',i)+',';
//	  
//	  
//	  // DJ_�A�C�e��
//	  xmlString +=record.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_item',i);
//	  xmlString += ','; 
//	  _pdfExArrLine += record.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_item',i)+',';
//	  
//	  // DJ_�ꏊ
//	  xmlString +=record.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_warehouse',i);
//	  xmlString += ','; 
//	  _pdfExArrLine += record.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_warehouse',i)+',';
//	  
//	  // DJ_�P��
//	  xmlString +=record.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_unit',i);
//	  xmlString += ','; 
//	  _pdfExArrLine += record.getLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_unit',i)+',';
//	  
//	  // DJ_�����
//	  xmlString +=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_conversionrate');
//	  xmlString += ',';
//	  _pdfExArrLine += record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_conversionrate')+',';
//	  
//	  // DJ_��������
//	  var adjqty=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_adjqty');
//	  xmlString +=Number(-adjqty);
//	  xmlString += ',';
//	  _pdfExArrLine += record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_adjqty')+',';
//	  
//	  // DJ_����
//	  xmlString +=record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_memo');
//	  xmlString += '\r\n'; 
//	  _pdfExArrLine += record.getCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_memo');
//	  pdfExArr.push(_pdfExArrLine);
//	  	  	  
//	 
//			if (!isEmpty(newqty) && Number(newqty) == 0) {
//				customerDeliveryFlag = 'T';
//			}
//		}

  }
//  if(creatCsvMailFlag&&record.getFieldValue('custrecord_djkk_ica_sendmail')!='T'){
//	  if (!isEmpty(locationMain)) {
//			var locationSearch = nlapiSearchRecord("location", null, 
//					[ ["internalid", "anyof", locationMain ] ], 
//					[new nlobjSearchColumn("custrecord_djkk_address_fax","address", null),
//					new nlobjSearchColumn("custrecord_djkk_mail", "address",null) ]);
//
//			if (!isEmpty(locationSearch)) {
//				var fax = locationSearch[0].getValue("custrecord_djkk_address_fax", "address");
//				var mails = locationSearch[0].getValue("custrecord_djkk_mail","address");
//	  // create file
//	  var xlsFile = nlapiCreateFile('DJ_�a����݌ɔz���`�[' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
//	  xlsFile.setFolder(FILE_CABINET_ID_DJ_DEPOSIT_STOCK_DELIVERY_SLIP);
//	  xlsFile.setEncoding('SHIFT_JIS');
//
//	  // save file
//	  var fileID = nlapiSubmitFile(xlsFile);
//      if(!isEmpty(fileID)&&!isEmpty(mails)){
//	 var setrecords = new Object();
//	 var soId= record.getFieldValue('custrecord_djkk_ica_so');
//	 if(!isEmpty(soId)){
//		 setrecords['transaction'] = soId;
//	 }else{
//		 setrecords=null;
//	 }
//	 var files = new Array();
//	 files.push(nlapiLoadFile(fileID));
//	 files.push(creatPdfFile(id,pdfExArr));
//	 nlapiSendEmail(nlapiGetUser(), mails, 'DJ_�a����݌�:�q�ɂւ̔z���w���� &�[�i��', '�a����݌ɔz���`�[&�[�i��', null, null, setrecords, files);
//	 nlapiSubmitField('customrecord_djkk_ic_change', id, 'custrecord_djkk_ica_sendmail', 'T', false);
//	 
//      }
//      
//	  }
//	 }
//	}
	}
}
//
//
//function creatPdfFile(recordId,pdfExArr){
//    var xmlString = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
//	'<pdf>'+
//	'<head>'+
//	'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
//	'<#if .locale == "zh_CN">'+
//	'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
//	'<#elseif .locale == "zh_TW">'+
//	'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
//	'<#elseif .locale == "ja_JP">'+
//	'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
//	'<#elseif .locale == "ko_KR">'+
//	'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
//	'<#elseif .locale == "th_TH">'+
//	'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
//	'</#if>'+
//	'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
//	'<#if .locale == "zh_CN">'+
//	'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
//	'<#elseif .locale == "zh_TW">'+
//	'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
//	'<#elseif .locale == "ja_JP">'+
//	'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
//	'<#elseif .locale == "ko_KR">'+
//	'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
//	'<#elseif .locale == "th_TH">'+
//	'font-family: NotoSans, NotoSansThai, sans-serif;'+
//	'<#else>'+
//	'font-family: NotoSans, sans-serif;'+
//	'</#if>'+
//	'}'+
//	'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
//	'td { padding: 4px 6px; }'+
//	'b { font-weight: bold; color: #333333; }'+
//	'</style>'+
//	'</head>'+
//	'<body padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">'+
//	'<table>'+
//	'<thead>'+
//	'<tr>'+
//	'<th>DJ_�a����݌�ID</th>'+
//	'<th>DJ_�A�C�e��</th>'+
//	'<th>DJ_�ꏊ</th>'+
//	'<th>DJ_�P��</th>'+
//	'<th>DJ_����� </th>'+
//	'<th>�ڋq�z������</th>'+
//	'<th>DJ_����</th>'+
//	'</tr>'+
//	'</thead>'
//	for(var i = 0 ; i < pdfExArr.length ; i ++){
//		var pdfExArrLine = pdfExArr[i].split(',');
//		xmlString+=
//		'<tr><td>'+pdfExArrLine[0]+'</td>'+
//		'<td>'+pdfExArrLine[1]+'</td>'+
//		'<td>'+pdfExArrLine[2]+'</td>'+
//		'<td>'+pdfExArrLine[3]+'</td>'+
//		'<td>'+pdfExArrLine[4]+'</td>'+
//		'<td>'+pdfExArrLine[5]+'</td>'+
//		'<td>'+pdfExArrLine[6]+'</td></tr>';
//		
//	} 
//    xmlString+='</table>'+
//	'</body>'+
//	'</pdf>';
//    
//    
//    //var record = nlapiLoadRecord('customrecord_djkk_ic_change', recordId);
//    var renderer = nlapiCreateTemplateRenderer();
//    renderer.setTemplate(xmlString);
//    //renderer.addRecord('record', record);
//    var xml = renderer.renderToString();
//    var xlsFile = nlapiXMLToPDF(xml);
//
//    // var xlsFile = nlapiXMLToPDF(xmlString);
//    // PDF�t�@�C������ݒ肷��
//    xlsFile.setName('DJ_�a����݌ɒ���:�q�ɂւ̔z���w���� &�[�i�� ' + '_' + getFormatYmdHms() + '.pdf');
//    xlsFile.setFolder(FILE_CABINET_ID_DJ_DEPOSIT_STOCK_DELIVERY_SLIP);
//    xlsFile.setIsOnline(true);
//
//    // save file
//    var fileID = nlapiSubmitFile(xlsFile);
//    var fl = nlapiLoadFile(fileID);
//     return fl;
//}