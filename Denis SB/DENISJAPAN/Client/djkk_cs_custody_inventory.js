/**
 * DJ_�a����݌Ɏ��n�I�����F���
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Dec 2022     �v
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	if(type == 'edit'){
		var nowRole = nlapiGetRole();
		var nowUser = nlapiGetUser();
		var createRole = nlapiGetFieldValue('custrecord_djkk_body_createrole');  //DJ_�쐬���[��
		var createUser = nlapiGetFieldValue('custrecord_djkk_body_createuser');  //DJ_�쐬��
		var status = nlapiGetFieldValue('custrecord_djkk_body_status');//DJ_���F�X�e�[�^�X
		if(!isEmpty(status)&& status!= '4'){
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_lin_num',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_lin_sub',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_shed_item',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_item_memo',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_stock_no',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_location',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_location_id',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_binnumber',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_purchase',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_library',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_actual_quantity',true);			
		}else if(isEmpty(status)){
			if(nowRole == createRole && nowUser == createUser){
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_item_memo',true);
			}else{
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_lin_num',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_lin_sub',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_shed_item',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_item_memo',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_stock_no',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_location',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_location_id',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_binnumber',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_purchase',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_library',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_actual_quantity',true);	
			}
		}	
	}
}
function start(){
	var icId=nlapiGetRecordId();
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_custody_inventory','customdeploy_djkk_sl_custody_inventory');
	theLink += '&icId=' + icId;
	var rse = nlapiRequestURL(theLink);
	var flg = rse.getBody();
	if(flg != 'F'){
		alert('�쐬�ς�');
		window.ischanged = false;
		location=location;
	}else{
		alert('�ُ픭��');
	}
}

function clientSaveRecord(){
	var count = nlapiGetLineItemCount('recmachcustrecord_djkk_custody_stock_list');//����
	for(var n=1;n<count+1;n++){
		var linNum = nlapiGetLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_lin_num',n);
		if(isEmpty(linNum)){
			nlapiSetLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_lin_num',n,n);
		}
	}
	return true;
}


function clientFieldChanged(type, name, linenum) {
	if(name == 'custrecord_djkk_custody_shed_item'){
		var shed_item = nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_shed_item');
		var subList  = nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_lin_sub');
		var itemSearch = nlapiSearchRecord("item",null,
				[
				   ["internalid","anyof",shed_item], 
				   "AND", 
				   ["subsidiary","anyof",subList]
				], 
				[
				   new nlobjSearchColumn("salesdescription"),//�A�C�e������
				   new nlobjSearchColumn("usebins"),//�ۊǒI���g�p
				]
				);
		if(!isEmpty(itemSearch)){
			var salesdescription = itemSearch[0].getValue("salesdescription");
			var usebins = itemSearch[0].getValue("usebins");
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_item_memo', salesdescription, false, true);
			if(usebins == 'F'){
				nlapiDisableLineItemField('recmachcustrecord_djkk_custody_stock_list','custrecord_djkk_custody_binnumber',true);
			}
		}
	}
	
	if(name == 'custrecord_djkk_custody_stock_no'){
		var amountCheck = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_custody_stock_no2');//DJ_�Ǘ��ԍ�
		if(isEmpty(amountCheck)){
			var library = 0;
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_library', library, false, true);
		}else{
			alert('�ύX�s��');
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_stock_no', amountCheck, false, true);
		}
	}
}