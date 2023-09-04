/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/12     CPC_苑
 *
 */

function backtoitemreceipt() {
	var poid = nlapiGetFieldValue('custpage_poid');
//	try{
//		var detailscount = nlapiGetLineItemCount('inventory_details');
//		var inventoryDetailsArray = new Array();
//		for (var q = 1; q < Number(detailscount) + 1; q++) {		
//				var receiptinventoryArray = new Array();
//				var receiptinventoryArray2= new Array();
//				receiptinventoryArray['receiptinventorynumber']=nlapiGetLineItemValue('inventory_details', 'receiptinventorynumber', q);
//				receiptinventoryArray2['ilc'+Number(nlapiGetLineItemValue('inventory_details', 'itemlinecode', q))]=receiptinventoryArray;
//				inventoryDetailsArray['lc'+Number(nlapiGetLineItemValue('inventory_details', 'linecode', q))]=receiptinventoryArray2;
//		}
//		//alert(inventoryDetailsArray['lc2']['ilc1']['receiptinventorynumber']);
//	var poid = nlapiGetFieldValue('custpage_poid');
//	var purchaseorder = nlapiLoadRecord('purchaseorder', poid);
//
//	var count = purchaseorder.getLineItemCount('item');
//	
//	for (var i = 1; i < count + 1; i++) {
//
//		purchaseorder.selectLineItem('item', i);
//		var itemType=purchaseorder.getCurrentLineItemValue('item','custcol_djkk_item_item_record_type');
//		var itemQuantity=purchaseorder.getCurrentLineItemValue('item','quantity');
//		var lineCode=Number(purchaseorder.getCurrentLineItemValue('item','line'));		
//		if(itemType=='lotnumberedinventoryitem'){	
////		alert(i);
////		var inventoryDetail=nlapiCreateCurrentLineItemSubrecord('item','inventorydetail');
////		alert('testing');
////		alert(('lc'+lineCode).toString());
////		alert(inventoryDetailsArray['lc'+lineCode]['ilc1']['receiptinventorynumber']);
////		inventoryDetail.selectNewLineItem('inventoryassignment');
////		inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', inventoryDetailsArray['lc'+lineCode]['ilc1']['receiptinventorynumber']);		
////		inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', itemQuantity);
////		inventoryDetail.commitLineItem('inventoryassignment');
////		inventoryDetail.commit();
////		alert('3');	
//		}else if(itemType=='serializedinventoryitem'){
//			var inventoryDetails=nlapiCreateCurrentLineItemSubrecord('item','inventorydetail');
//			for(var j=1;j<Number(itemQuantity)+1;j++){
//			inventoryDetails.selectNewLineItem('inventoryassignment');
//			inventoryDetails.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',inventoryDetailsArray['lc'+lineCode]['ilc'+Number(j)]['receiptinventorynumber']);		
//			inventoryDetails.setCurrentLineItemValue('inventoryassignment', 'quantity', '1');
//			inventoryDetails.commitLineItem('inventoryassignment');
//			inventoryDetails.commit();
//			}
//		}
//		nlapiCommitLineItem('item');
//	}
//	nlapiSubmitRecord(purchaseorder, false, true);
//	}catch(e){
//		alert(e);
//	}

	if (!isEmpty(poid)) {
		var thelink = "/app/accounting/transactions/itemrcpt.nl?e=T&memdoc=0&whence=&transform=purchord&id="
				+ poid;
		window.close();
		window.open(thelink);
	}
}

function saverecord() {
	var theLink = nlapiResolveURL('SUITELET',
			'customscript_djkk_sl_inventory_details',
			'customdeploy_djkk_sl_inventory_details');
	
	// パラメータの追加
	theLink = theLink + '&POID=' + nlapiGetFieldValue('custpage_poid')+ '&viewtype=updatepo';
	window.close();
	window.open(theLink);	
}

function refresh() {
	location.href=location.href;
}

function createreceiptinventorynumber() {
	//alert('自動採番開始');
	var count=nlapiGetLineItemCount('inventory_details');
	for(var i=1;i<count+1;i++){
		var itemtype=nlapiGetLineItemValue('inventory_details', 'itemtypecode', i);
		if(itemtype!='inventoryitem'){
		nlapiSetLineItemValue('inventory_details', 'receiptinventorynumber', i,itemtype+ i);
		}
	}
	//alert('自動採番終わり');
}

