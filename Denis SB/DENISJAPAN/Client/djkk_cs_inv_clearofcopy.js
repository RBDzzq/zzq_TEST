/**
 * U188 �������A�x���������A�O�������|�������̃R�s�[�쐬�F�݌ɏڍ׃N���A�����X
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Aug 2022     ZHOU
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clearclientPageInit(type){
	nlapiLogExecution('debug','start');
	var recordType = nlapiGetRecordType();
	var customform = nlapiGetFieldValue('customform');
	var subsidiary = getRoleSubsidiary();
	nlapiLogExecution('debug','recordType',recordType);
//	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK){
	if(type=='copy'){
		if(recordType != null){
			var count;
			if(recordType == "inventoryadjustment" || recordType == "bintransfer"|| recordType == "inventorytransfer"){
				count = nlapiGetLineItemCount('inventory');
			}else if(recordType == "assemblybuild"){
				count = nlapiGetLineItemCount('component');
			}else{
				count = nlapiGetLineItemCount('item');
			}
			nlapiLogExecution('debug','count1',count);
			if(count != null && count >= 0){
				for(var n = 0 ; n < count ; n++){
					var inventorydetailFlag;
					if(recordType == "inventoryadjustment" || recordType == "bintransfer" || recordType == "inventorytransfer"){
						inventorydetailFlag =nlapiGetLineItemValue("inventory","inventorydetailavail",n+1);
					}else if(recordType == "assemblybuild"){
						inventorydetailFlag =nlapiGetLineItemValue("component","componentinventorydetailavail",n+1);
					}
					else{
						inventorydetailFlag =nlapiGetLineItemValue("item","inventorydetailavail",n+1);
					}
					if(inventorydetailFlag == 'T'){
						//�݌ɏڍ׃N���A�����X
						var inventoryDetail;
						if(recordType == "inventoryadjustment" || recordType == "bintransfer" || recordType == "inventorytransfer"){
							nlapiSelectLineItem('inventory', n+1);
							inventoryDetail = nlapiRemoveCurrentLineItemSubrecord('inventory','inventorydetail');
//							nlapiSetCurrentLineItemValue('inventory','inventorydetail','')
						}else if(recordType == "assemblybuild"){
							nlapiSelectLineItem('component', n+1);
							inventoryDetail = nlapiRemoveCurrentLineItemSubrecord('component','componentinventorydetail');
						}else{
							nlapiSelectLineItem('item', n+1);
							inventoryDetail = nlapiRemoveCurrentLineItemSubrecord('item','inventorydetail');
//							nlapiSetCurrentLineItemValue('item','inventorydetail','')
						}

					}	
				}
			}	
		}
	}
}
