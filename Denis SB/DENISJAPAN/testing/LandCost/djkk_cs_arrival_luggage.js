/**
 * 到着荷物のClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/17     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */


function clientPageInit(type) {
//	if (type == 'create') {
//		try {
//			nlapiSetLineItemValue('items', 'custrecord_djkk_subsidiary', 1,nlapiGetFieldValue('custrecord_djkk_subsidiary_header'));
//		} catch (e) {
//		}
//	}
}

function clientSaveRecord() {
	//changed by geng add start U783
	var sub = nlapiGetFieldValue('custrecord_djkk_subsidiary_header');
	if(sub==SUB_NBKK || sub==SUB_ULKK){

	var itemCount = nlapiGetLineItemCount('items');
	for(var j=1;j<itemCount+1;j++){
		var loacation = nlapiGetLineItemValue('items','receivinglocation',j);
		//changed by song add start CH239
		if(isEmpty(loacation)){
			alert(j+'行の受領場所は空です');
			return false;
		//changed by song add end CH239
		}else if(!isEmpty(loacation)){
			var locationCode = nlapiLookupField('location',loacation,'custrecord_djkk_wms_location_code');
			if(isEmpty(locationCode)){
				alert(j+'行の受領場所におけるDJ _WMS倉庫コードが空です');
				return false;
			}
		}
		
		var quantity = nlapiGetLineItemValue('items','quantityexpected',j);
		if(isEmpty(quantity)){
			alert(j+'行の予想数量 が空です');
			return false;
		}
		var item = nlapiGetLineItemText('items','shipmentitem',j);
		var Search = nlapiSearchRecord("item",null,
				[
				   ["name","is",item]
				], 
				[
				   new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), 
				   new nlobjSearchColumn("custitem_djkk_product_name_jpline2"),
				   new nlobjSearchColumn("itemid"),
				   new nlobjSearchColumn("upccode")
				   
				]
				);
//		for(var a=0;a<Search.length;a++){
		if(!isEmpty(Search))
			var itemCode = Search[0].getValue("itemid");
			var itemJapanOne =  Search[0].getValue("custitem_djkk_product_name_jpline1");
//			var itemJapanTwo = Search[0].getValue("custitem_djkk_product_name_jpline2");
			var UpcCode =  Search[0].getValue("upccode");
			if(isEmpty(UpcCode)){
				alert(j+'行のアイテムにおけるEANコード が空です');
				return false;
			}
			if(isEmpty(itemCode)){
				alert(j+'行のアイテムにおける商品コード が空です');
				return false;
			}
			if(isEmpty(itemJapanOne)){
				alert(j+'行のアイテムにおけるDJ_品名（日本語）LINE1が空です');
				return false;
			}
//			if(isEmpty(itemJapanTwo)){
//				alert(j+'行のアイテムにおけるDJ_品名（日本語）LINE2が空です');
//				return false;
//			}
			
		}
		
		
		var poId = nlapiGetLineItemValue('items','purchaseorder',j);
		var poRecord = nlapiLoadRecord('purchaseorder', poId);
		var poCount = poRecord.getLineItemCount('item');
		var poNum = poRecord.getFieldValue('tranid');
		if(isEmpty(poNum)){
			alert('発注書の発注書番号が空です');
			return false;
		}		
		for(var k = 1;k<poCount+1;k++){
			var poItem = poRecord.getLineItemValue('item','item',k);
			var NameSearch = nlapiSearchRecord("item",null,
					[
					   ["internalid","anyof",poItem]
					], 
					[
				
					   new nlobjSearchColumn("name")
					]
					);
			if(!isEmpty(NameSearch)){
				var itemName = NameSearch[0].getValue("name");
				if(itemName==item){
					var poDate = poRecord.getLineItemValue('item','expectedreceiptdate',k); 
					var poDetail = poRecord.getLineItemValue('item','inventorydetail',k); 
					if(isEmpty(poDate)){
						alert(k+'行発注書の受領予定日が空です');
						return false;
					}
					if(isEmpty(poDetail)){
						alert(k+'行発注書の在庫番号が空です');
						return false;
					}
				}
			}
		}		
	}
	
	}
	//changed by geng add end U783
	if(!isEmpty(nlapiGetFieldValue('custrecord_djkk_landed_cost'))&&!isEmpty(nlapiGetFieldValue('custrecord_djkk_quantityexpected_sum'))){
		var counts=nlapiGetLineItemCount('items');
		var quantityexpected_sum=0;
		for(var s=1;s<counts+1;s++){		
			 quantityexpected_sum+=Number(nlapiGetLineItemValue('items', 'quantityexpected',s));
			}
		if(quantityexpected_sum!=nlapiGetFieldValue('custrecord_djkk_quantityexpected_sum')){
			alert('予想数量が変更され、DJ_輸入諸掛を削除する必要があります');
			return false;
		}
	}
	return true;
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
//	var item = nlapiGetLineItemValue('items','shipmentitem',1);
//	alert(item);

// if(type=='items'&&name=='custrecord_djkk_po_id'){
//	 if(!isEmpty(nlapiGetCurrentLineItemValue('items', 'purchaseorder'))){
//	 nlapiSetCurrentLineItemValue('items', 'purchaseorder', nlapiGetCurrentLineItemValue('items', 'custrecord_djkk_po_id'), false, true);
//	 }
// }
	 //U696 仕入先のデフォルト配送先はShipTO（通関業者）
	if(name=='purchaseorder'){
	 var sub = nlapiGetFieldValue('custrecord_djkk_subsidiary_header');
	 if(sub == SUB_DPKK || sub == SUB_SCETI){
		 var brokerValue = nlapiGetFieldValue('custrecord_djkk_customs_broker');
		 if (brokerValue == null || brokerValue == ''){
		 var poId = nlapiGetCurrentLineItemValue('items', 'purchaseorder');
		 var poRecord = nlapiLoadRecord('purchaseorder', poId);
		 var vendorId = poRecord.getFieldValue('entity');	 
		 var vendorRecord = nlapiLoadRecord('vendor', vendorId);	 
		 var vendorSearch = nlapiSearchRecord("vendor",null,
		    		[
		    		   ["internalid","anyof",vendorId]
		    		], 
		    		[
		    		   new nlobjSearchColumn("shipaddress")
		    		]
		    		);
		 var shipaddress = defaultEmpty(isEmpty(vendorSearch) ? '' :  vendorSearch[0].getValue("shipaddress"));
		 nlapiSetFieldValue('custrecord_djkk_customs_broker',shipaddress);
		 }
	   }
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {
	//nlapiSetCurrentLineItemValue('items', 'custrecord_djkk_subsidiary', nlapiGetFieldValue('custrecord_djkk_subsidiary_header'));
}
function clientValidateLine(type){
	var poid=nlapiGetCurrentLineItemValue('items', 'purchaseorder');
	if(!isEmpty(poid)){
	var posubsidiary=nlapiLookupField('purchaseorder', poid, 'subsidiary');
	if((posubsidiary!=nlapiGetFieldValue('custrecord_djkk_subsidiary_header'))||isEmpty(posubsidiary)){
		alert('POの連結子会社ロール制限違反');
		return false;
	}
	}else{
		alert('PO空にすることはできません');
		return false;
	}
	return true;
}
function sheet(){
	var theLink = SANDBOX_URL_HEAD +'/app/accounting/transactions/vendbill.nl?whence=';
	var id = nlapiGetRecordId();
	if(!isEmpty(id)){
		theLink = theLink+'&shipmentnumber='+id;
		window.open(theLink);
	}
	
}
/*
 * DJ_輸入諸掛
 * 
 * */
function djkklanedcost() {
	var landedCost = nlapiGetFieldValue('custrecord_djkk_landed_cost');
	var theLink = '';
	if (isEmpty(landedCost)) {
		theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_landed_cost',
				'', 'EDIT');

		// パラメータの追加
		theLink = theLink + '&inboundshipmentID=' + nlapiGetRecordId();

	} else {
		theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_landed_cost',
				landedCost, 'VIEW');
	}
	theLink+='&ifrmcntnr=T';
	open(theLink,'_lanedcost','top=150,left=20,width=2500,height=800,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}
function incRetransmission(){
	if(window.confirm('入荷指示再送を確認しますか?')){
		nlapiSetFieldValue('custrecord_djkk_inc_retransmission_flag','F');
		alert('入荷指示を再送します!');
	}
}
function defaultEmpty(src){
	return src || '';
}

