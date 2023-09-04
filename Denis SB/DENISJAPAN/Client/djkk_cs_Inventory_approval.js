/**
 * DJ_�݌ɒ������F���CS
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Aug 2022     CPC_�v
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

    return true; 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
	if(type=='edit'&&nlapiGetFieldValue('custrecord_djkk_admit_status')!='2'&&isEmpty(nlapiGetFieldValue('custrecord_djkk_admit_customer_error'))){
	var icId = nlapiGetRecordId();
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_approval','customdeploydjkk_sl_inventory_approval');
	theLink += '&icId=' + icId;
	theLink += '&Status=edit';
	var rse = nlapiRequestURL(theLink);
	var flg = rse.getBody();
	if(flg.indexOf('�ُ픭��')>-1){
		window.ischanged = false;
		window.location.href=theLink;		  			
	}else{
		var theLink = nlapiResolveURL('RECORD', 'inventoryadjustment',flg, 'EDIT');
		window.ischanged = false;
		window.location.href=theLink;
	}
	//20230616 add by zhou start
	}else{
		alert('���ݎ��s���̃I�y���[�^�����܂��B�u�G���[�̃��[���o�b�N�v�{�^�����N���b�N���Ĉُ����菜���Ă��玎���Ă�������');
		try{
			window.history.back();
			window.close;
		}catch(e){
			window.open("about:blank", "_top")
		}
	}	
	//20230616 add by zhou end
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
//	if(name == 'custrecord_djkk_admit_item'){
//		var itemId = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_admit_item');//itemid		
//		var itemSearch = getSearchResults("item",null,
//		    		 [
//		    		    ["internalid","anyof",itemId], 
//		    		    'AND',
//		    		    ["inventorynumber.quantityavailable","greaterthan","0"]
//		    		 ], 
//		    		 [
//		    		    new nlobjSearchColumn("salesdescription"),//����
//		    		    new nlobjSearchColumn("custitem_djkk_class"), //�u�����h
//		    		    
//		    		 ]
//		    		 );	
//		if(!isEmpty(itemSearch)){
//			for(var i = 0 ; i < itemSearch.length ; i++){
//				nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', itemSearch[i].getValue('salesdescription'));
//				nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', itemSearch[i].getText('custitem_djkk_class'));
//			}
//		}
//	}
//	
//	if(name == 'custrecord_djkk_admit_warehouse' || name == 'custrecord_djkk_admit_detail'){  
//		var detail = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_admit_detail');//�Ǘ��ԍ�
//		var itemId = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_admit_item');//itemid
//		var location = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_admit_warehouse');//�ꏊ
//		var itemSearchOne = getSearchResults("inventorydetail",null,
//					[
//					   ["item","anyof",itemId], 
//					   'AND',
//					   ["inventorynumber","anyof",detail],
//					   'AND',
//					   ["location","anyof",location],
//					   'AND',
//					   ["isinventoryaffecting","is","T"]
//					], 
//					[
////					    new nlobjSearchColumn("quantityavailable","inventoryNumber",null),  //�\
//					    new nlobjSearchColumn("quantityonhand","inventoryNumber",null),//�݌�
//					    new nlobjSearchColumn("internalid","binNumber",null)
//					]
//					);
//		if(!isEmpty(itemSearchOne)){
////			var binnumber = itemSearchOne[0].getValue("quantityonhand","inventoryNumber",null);
//			nlapiLogExecution('debug', 'hellow','hellow');
//			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', itemSearchOne[0].getValue("quantityonhand","inventoryNumber",null)); //�݌ɏڍא���
//			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum', itemSearchOne[0].getText("internalid","binNumber",null)); //�ۊǒI�ԍ�
//		}else{
////			nlapiLogExecution('debug', 'hellow2','hellow2');
//			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty','',false,true);
//			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum','',false,true);
//		}
//	}
//	
//	if(name == 'custrecord_djkk_admit_adjqty'){ 
//		var quantityOne = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_admit_inventoryqty');//�݌ɐ���	
//		var adjqty = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_admit_adjqty');//��������
//		var quantityOneNum = Number(quantityOne);
//		var adjqtyNum = Number(adjqty);
//			if(adjqty > 0){     //�V�������ʌv�Z
//				nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty',quantityOneNum + adjqtyNum);
//			}else{
//				nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty',quantityOneNum - (-adjqtyNum));
//			}
//	}
//	
//	if(name  == "custrecord_djkk_admit_lot" || name == "custrecord_djkk_admit_serial"){
//		var itemId = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_admit_item');//itemid	
//		if (!isEmpty(itemId)) {
//			var itemValues = nlapiLookupField('item', itemId, [ 'islotitem','isserialitem' ]);
//			if(itemValues.islotitem=='T'){
////				nlapiLogExecution('debug', 'hellow', 'hellow');
//				if(name == "custrecord_djkk_admit_serial"){      //DJ_���[�J�[�V���A���ԍ�
////					nlapiLogExecution('debug', 'hellow', 'hellow');
//					alert('���b�g�A�C�e���Ȃ̂ŁA�uDJ_���[�J�[�������b�g�ԍ��v����͂��Ă��������B');
//					nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial','',false,true);
//				}
//			}else if (itemValues.isserialitem=='T') {
//				if(name=='custrecord_djkk_admit_lot'){        //DJ_���[�J�[�������b�g�ԍ�
//					alert('�V���A���A�C�e���Ȃ̂ŁA�uDJ_���[�J�[�V���A���ԍ��v����͂��Ă��������B');
//					nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot','',false,true);
//				}
//		   }
//		}else{
//			alert('�A�C�e����I�����Ă�������');
//			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot', '', false, true);
//			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial', '', false, true);
//		}
//	}
//	
//	
//	if(name=='custrecord_djkk_admit_manufacture_date'||name=='custrecord_djkk_admit_date' || name == 'custrecord_djkk_admit_smc_num'){
//		var itemId = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_admit_item');//itemid
//		if (!isEmpty(itemId)) {
//			var itemValues = nlapiLookupField('item', itemId, ['custitem_djkk_shelf_life','custitem_djkk_warranty_month','custitem_djkk_smc_sub_manager_flg']);
//			var shelfLife=Number(itemValues.custitem_djkk_shelf_life);
//			if(shelfLife=='NaN'){
//			    shelfLife=0;
//			}
//			var warrantyMonth=Number(itemValues.custitem_djkk_warranty_month);
//		    if(warrantyMonth=='NaN'){
//		        warrantyMonth=0;
//			} 	
//		    
//		    if(name=='custrecord_djkk_admit_smc_num'){   //Smc �ԍ�
//		    	var subflg = itemValues.custitem_djkk_smc_sub_manager_flg;
//		    	if(subflg=='T'){
//		    		 alert('�A�C�e���}�X�^.SMC/Sublot�Ǘ��t���O���`�F�b�N�I���̏ꍇ�A���͕s�ł��B');
//					 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num', '', false, true);
//		    	}
//		    }
//		    
//		    if(name == 'custrecord_djkk_admit_date'){     //DJ_�L������
//		    	var expirationdate=nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date');
//		    	if(!isEmpty(expirationdate)){    //DJ_�����N����
//		    		nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date', dateAddDays(expirationdate, -warrantyMonth),false,true);
//		    	}
//		    }
//		    
//		    if(name == 'custrecord_djkk_admit_manufacture_date'){    //DJ_�����N����
//		    	var manufacturedate=nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date');
//		    	if(!isEmpty(manufacturedate)){
//		    		var expirationdates=dateAddDays(manufacturedate, shelfLife);
//		    		nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date',expirationdates,false,true); //DJ_�L������
//		    		
//		    		if(!isEmpty(expirationdates)){		    			
//		    			// �o�׉\������
//		    			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date', dateAddDays(expirationdates, -warrantyMonth),false,true);
//		    		}
//		    	}
//		    }
//		    
//		}else{
//			alert('�A�C�e����I�����Ă�������');
//			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date', '', false, true);
//			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date', '', false, true);
//			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date', '', false, true);
//		}
//	}
//	
}


//function details(){ //�݌ɏڍ�
//	var theLink = '';
//	theLink+=URL_HEAD +'/app/common/search/searchresults.nl?searchid=661&whence=';
//	open(theLink,'_lanedcost','top=150,left=20,width=2500,height=800,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
//}

function joken(){ //���F	
	var icId = nlapiGetRecordId();
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_approval','customdeploydjkk_sl_inventory_approval');
	theLink += '&icId=' + icId;
	theLink += '&Status=approval';
	var rse = nlapiRequestURL(theLink);
	var flg = rse.getBody();
	if(flg != 'F'){
		alert('���F�ς݁A�݌ɒ�������������܂���');
		var theLink = nlapiResolveURL('RECORD', 'inventoryadjustment',flg, 'VIEW');
		window.ischanged = false;
		window.location.href=theLink;
	}else{
		alert('�ُ픭��');
		var theLink = URL_HEAD +'/app/common/scripting/scriptrecord.nl?id=1201';
		window.open(theLink);
	}
	
}
//20230531 add by zht start
//DJ_�O����/���|���������FWF�Q�ƁA�G���[���[���o�b�N
function errorback(){
	var icId = nlapiGetRecordId();
	var record = nlapiLoadRecord('customrecord_djkk_ic_admit',icId);
	var adjustId = record.getFieldValue('custrecord_djkk_admit_trans_adjust');
	var error=record.getFieldValue('custrecord_djkk_admit_customer_error');
	if(!isEmpty(error)){
		record.setFieldValue('custrecord_djkk_admit_customer_error','');
		nlapiSubmitRecord(record);
	}
	
    if(!isEmpty(adjustId)){
	var delLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_approval','customdeploydjkk_sl_inventory_approval');
	delLink += '&deleteRecordId=' + adjustId;
	nlapiRequestURL(delLink);
	alert('���΂炭���҂����������B�u�G���[�̃��[���o�b�N �v�{�^����������܂ŉ�ʂ��X�V���Ă��������B');
	}
	
	window.ischanged = false;
	window.location.href=window.location.href
}	
//20230531 add by zht end

function rejection(){ //�p��
	alert('�p�������A�݌ɒ�������������Ă��܂���');
	var icId = nlapiGetRecordId();
	window.ischanged = false;
	location=location;
}		
	
function keepback(){
var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_inv_keep','customdeploy_djkk_sl_inv_keep');
theLink +='&keepid=' + nlapiGetRecordId();
theLink +='&keeptype=keepback';
open(theLink,'_keepback','top=150,left=20,width=2500,height=800,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}	
	
	
	
	
	
	
	
