/**
 * バ�?�コー�?
 * handy sample use,not used in denis 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/24     CPC_�?
 *
 */

/**
 * @param {String}
 *            type Context Types: scheduled, ondemand, userinterface, aborted,
 *            skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug', 'バ�?�コー�? Start');
	var recordtype = nlapiGetContext().getSetting('SCRIPT',
			'custscript_djkk_recordtype');
	var internalid = nlapiGetContext().getSetting('SCRIPT',
			'custscript_djkk_internalid');
	var lineid = nlapiGetContext().getSetting('SCRIPT',
	'custscript_djkk_line');
	var quantity = nlapiGetContext().getSetting('SCRIPT',
			'custscript_djkk_quantity');
	nlapiLogExecution('debug', 'recordtype:', recordtype);
	nlapiLogExecution('debug', 'internalid:', internalid);
	nlapiLogExecution('debug', 'lineid:', lineid);
	nlapiLogExecution('debug', 'quantity:', quantity);
	if (!isEmpty(recordtype) && !isEmpty(internalid) && !isEmpty(quantity)&& !isEmpty(lineid)) {
		creatItemreceipt(internalid,lineid,quantity);
	} else {
		var cacheTableSearch = nlapiSearchRecord("customrecord_djkk_barcode_cache_table",null,
				[
				   ["custrecord_djkk_processing_end","is","F"]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_recordtype"), 
				   new nlobjSearchColumn("custrecord_djkk_internalid"), 
				   new nlobjSearchColumn("custrecord_djkk_line"), 
				   new nlobjSearchColumn("custrecord_djkk_quantity"), 
				   new nlobjSearchColumn("custrecord_djkk_dataarray"), 
				   new nlobjSearchColumn("internalid")
				]
				);
		
		if (!isEmpty(cacheTableSearch)) {
			for (var i = 0; i < cacheTableSearch.length; i++) {
			governanceYield();
			var recordtypeR= cacheTableSearch[i].getValue("custrecord_djkk_recordtype");
			var internalidR= cacheTableSearch[i].getValue("custrecord_djkk_internalid");
			var lineR= cacheTableSearch[i].getValue("custrecord_djkk_line");
			var quantityR= cacheTableSearch[i].getValue("custrecord_djkk_quantity");
			var dataarrayR= cacheTableSearch[i].getValue("custrecord_djkk_dataarray");
			var cacheTableId= cacheTableSearch[i].getValue("internalid");
			creatItemreceipt(internalidR,lineR,quantityR,dataarrayR,cacheTableId);
			
			}
		}   
		
	}
}

function creatItemreceipt(internalid,linenum,quantity,dataarrayR,cacheTableId) {
	try {
		var jsonDate = eval("(" + dataarrayR + ")");
		var packagec=jsonDate[0]['packagec'];
		var status=jsonDate[0]['status'];
		var lot=jsonDate[0]['lot'];
		var expirydate=jsonDate[0]['expirydate'];
		if(!isEmpty(expirydate)){
		var year=expirydate.slice(0,4);
	    var month=Number(expirydate.slice(4,6))-1;
	    var day=expirydate.slice(6,8);
	    var dateExpiry  = new Date();
        dateExpiry.setFullYear(year, month, day);
        expirydate=nlapiDateToString(dateExpiry);
		}
		var inventoryc=jsonDate[0]['inventoryc'];
		var location=jsonDate[0]['location'];
		
		var itemreceiptRecord = nlapiTransformRecord('purchaseorder',internalid, 'itemreceipt');
		var count = itemreceiptRecord.getLineItemCount('item');
		for (var i = 1; i < count + 1; i++) {
			itemreceiptRecord.selectLineItem('item', i);			
			itemreceiptRecord.setCurrentLineItemValue('item','itemreceive', 'F');
			itemreceiptRecord.commitLineItem('item');
		}
		itemreceiptRecord.selectLineItem('item', linenum);
		itemreceiptRecord.setCurrentLineItemValue('item', 'itemreceive','T');
		itemreceiptRecord.setCurrentLineItemValue('item', 'location',location);
		itemreceiptRecord.setCurrentLineItemValue('item', 'quantity',quantity);
		// 在庫詳細のオブジェクトを取得す�?
		var subrecord2 = itemreceiptRecord.editCurrentLineItemSubrecord('item', 'inventorydetail');
		if (subrecord2 == null) {
			subrecord2 = itemreceiptRecord.createCurrentLineItemSubrecord('item', 'inventorydetail');
		}
		// 在庫番号を設定す�?
		subrecord2.selectNewLineItem('inventoryassignment');
		subrecord2.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber', lot);
		subrecord2.setCurrentLineItemValue('inventoryassignment','quantity', quantity);
		// 在庫ス�?ータス:
		/*inventorystatus DELECT change by ycx 2021.10.05 
		subrecord2.setCurrentLineItemValue('inventoryassignment','inventorystatus',status);*/
		// DJ_荷姿区�?
		subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_packingtype',packagec);
		// DJ_在庫区�?
		subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_storage_type',inventoryc);
		// 賞味期限
		subrecord2.setCurrentLineItemValue('inventoryassignment','expirationdate',expirydate);
		
		subrecord2.commitLineItem('inventoryassignment');
		subrecord2.commit();
		itemreceiptRecord.commitLineItem('inventory');
		itemreceiptRecord.commitLineItem('item');
		var itemreceiptId = nlapiSubmitRecord(itemreceiptRecord, false,
				true);
		if(!isEmpty(itemreceiptId)){
			nlapiSubmitField('customrecord_djkk_barcode_cache_table', cacheTableId, 'custrecord_djkk_processing_end', 'T');			
		}
	} catch (e) {
		nlapiLogExecution('debug', 'error', e);
	}
}
