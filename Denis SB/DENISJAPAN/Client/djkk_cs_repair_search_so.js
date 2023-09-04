/**
 * DJ_�C���i ����������
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/09/24     CPC_��
 *
 */

function clientSaveRecord(){
	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	
	var serilNo = '';
	var item = '';
	var so = '';
	var sono = '';
	var location_id= '';
	var irime= '';
	var unit= '';
	var inventorydetail_id= '';
	var quantity = '';
	var cuslocationid = '';
	if(type == 'list' && name == 'check'){
		
		if(confirm('���̒������ł�낵�ł��傤���H')){
			serilNo = nlapiGetLineItemValue('list', 'serial', linenum);
			item = nlapiGetLineItemValue('list', 'item_id', linenum);
			so = nlapiGetLineItemValue('list', 'so_id', linenum);
			sono = nlapiGetLineItemValue('list', 'so', linenum);
			location_id = nlapiGetLineItemValue('list', 'location_id', linenum);
			irime = nlapiGetLineItemValue('list', 'irime', linenum);
			unit = nlapiGetLineItemValue('list', 'unit_id', linenum);
			inventorydetail_id= nlapiGetLineItemValue('list', 'inventorydetail_id', linenum);		
			window.ischanged = false;
			window.close();
			window.opener.setsoinfo(serilNo,item,so,sono,location_id,irime,unit,inventorydetail_id);
		}else{
			nlapiSetLineItemValue('list', 'check', 'F',linenum);
		}

	}
	if(type == 'list' && name == 'check_repair'){
		
		if(confirm('���̏C���i�ł�낵�ł��傤���H')){
			serilNo = nlapiGetLineItemValue('list', 're_serial_no', linenum);
			item = nlapiGetLineItemValue('list', 'item_id', linenum);
			so = nlapiGetLineItemValue('list', 'so_id', linenum);
			sono = nlapiGetLineItemValue('list', 'so', linenum);
			location_id = nlapiGetLineItemValue('list', 'location_id', linenum);
			cuslocationid = nlapiGetLineItemValue('list', 'cuslocationid', linenum);
			unit = nlapiGetLineItemValue('list', 'unit_id', linenum);
			inventorydetail_id= nlapiGetLineItemValue('list', 'inventorydetail_id', linenum);		
			quantity = nlapiGetLineItemValue('list', 'list_quantity', linenum);		
			window.ischanged = false;
			window.close();
			window.opener.setreinfo(serilNo,item,so,sono,location_id,cuslocationid,unit,inventorydetail_id,quantity);
		}else{
			nlapiSetLineItemValue('list', 'check', 'F',linenum);
		}

	}	
}

function closesearch(){
	
}



function search(){
	
	var sub = nlapiGetFieldValue('custpage_subsidiary');
	
//	if(isEmpty(sub)){
//		alert('�A�g����͂��Ă��������B')
//		return ture;
//	}
	var searchType = nlapiGetFieldValue('custpage_searchtype')
	
	var parameter = setParam();
		
	parameter += '&selectFlg=T';
	parameter += '&searchType='+searchType;
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair_search_so', 'customdeploy_djkk_sl_repair_search_so');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function searchReturn(){
	
	var searchType = nlapiGetFieldValue('custpage_searchtype')
	var parameter = setParam();
	parameter += '&selectFlg=F';
	parameter += '&searchType='+searchType;
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair_search_so', 'customdeploy_djkk_sl_repair_search_so');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function clearf(){
	var parameter = '';
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_summary', 'customdeploy_djkk_sl_invoice_summary');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}
function setParam(){

	var parameter = '';
	parameter += '&serial='+nlapiGetFieldValue('custpage_serial');
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');
	parameter += '&soNumber='+nlapiGetFieldValue('custpage_so');
	
	
	return parameter;
}