/**
 * 発注書、支払請求書、前払金買掛金調整のコピー作成：在庫詳細クリアランス
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jul 2022     zhou
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
	var recordType = nlapiGetRecordType();
	if(type=='copy'){
		if(recordType != null){
			nlapiLogExecution('debug','start1','start');
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
//					var inventorydetailFlag;
//					if(recordType == "inventoryadjustment" || recordType == "bintransfer" || recordType == "inventorytransfer"){
//						inventorydetailFlag =nlapiGetLineItemValue("inventory","inventorydetailavail",n+1);
//					}else if(recordType == "assemblybuild"){
//						inventorydetailFlag =nlapiGetLineItemValue("component","componentinventorydetailavail",n+1);
//					}
//					else{
//						inventorydetailFlag =nlapiGetLineItemValue("item","inventorydetailavail",n+1);
//					}
//					if(inventorydetailFlag == 'T'){
						//在庫詳細クリアランス
						var inventoryDetail;
						if(recordType == "inventoryadjustment" || recordType == "bintransfer" || recordType == "inventorytransfer"){
							nlapiSelectLineItem('inventory', n+1);
							inventoryDetail = nlapiRemoveCurrentLineItemSubrecord('inventory','inventorydetail');
						}else if(recordType == "assemblybuild"){
							nlapiSelectLineItem('component', n+1);
							inventoryDetail = nlapiRemoveCurrentLineItemSubrecord('component','componentinventorydetail');
						}else{
							nlapiSelectLineItem('item', n+1);
							inventoryDetail = nlapiRemoveCurrentLineItemSubrecord('item','inventorydetail');
						}
						nlapiLogExecution('debug','inventoryDetail',inventoryDetail);
//					}	
				}
			}	
		}
	}
}
