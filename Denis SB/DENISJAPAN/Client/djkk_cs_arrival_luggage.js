/**
 * �����ו���Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/17     CPC_��
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

function comclientSaveRecord() {
	//changed by geng add start U783
	var sub = nlapiGetFieldValue('custrecord_djkk_subsidiary_header');
	if(sub==SUB_NBKK || sub==SUB_ULKK){

		var itemCount = nlapiGetLineItemCount('items');
		//20230511 changed by zhou start
		var poArr = [];
		var itemArr = [];
		var lineObj = [];
		for (var j = 1; j < itemCount + 1; j++) {	
			var loacation = nlapiGetLineItemValue('items','receivinglocation',j);
			if (isEmpty(loacation)) {
				alert(j + '�s�̎�̏ꏊ�͋�ł�');
				return false;
				// changed by song add end CH239
			} else if (!isEmpty(loacation)) {
				var locationCode = nlapiLookupField('location', loacation,'custrecord_djkk_wms_location_code');
				if (isEmpty(locationCode)) {
					alert(j + '�s�̎�̏ꏊ�ɂ�����DJ _WMS�q�ɃR�[�h����ł�');
					return false;
				}
			}
			var quantity = nlapiGetLineItemValue('items', 'quantityexpected', j);
			if (isEmpty(quantity)) {
				alert(j + '�s�̗\�z���� ����ł�');
				return false;
			}
			var poReceiptDate = nlapiGetLineItemValue('items','custrecord_djkk_receipt_date',j);
			if(isEmpty(poReceiptDate)){
				alert(j+'�s�������̎�̗\�������ł�');
				return false;
			}
			var itemInternalidInLine = nlapiGetLineItemValue('items','shipmentitem',j);
			
			var itemNameInLine = nlapiGetLineItemText('items','shipmentitem',j);
			var poId = nlapiGetLineItemValue('items','purchaseorder',j);
			itemArr.push(itemNameInLine)//���׍sitem��
			poArr.push(poId)//���׍sPO.Id
			lineObj.push({  //���׍sPO.Iditem���APOid�A�s�ԍ��G���x���[�v�I�u�W�F�N�g   ���i�ȑΉ�
				itemNameInLine:itemNameInLine,//���׍sitem��
				poId:poId,//���׍sPO.Id
				linenum:j,//���݂�j�s��
				itemInternalidInLine:itemInternalidInLine
			})
			var poReceiptDate = nlapiGetLineItemValue('items','custrecord_djkk_receipt_date', j);
			if(isEmpty(poReceiptDate)){
				alert(j+'�s�������̎�̗\�������ł�');
				return false;
		    } 
		}
		
		//item�����A�쐬���̗v�������O�Ƀ`�F�b�N
		for(var it = 0 ; it < itemArr.length ; it++){
			 var itemSearch = nlapiSearchRecord("item",null,
						[
						   ["name","is",itemArr[it]]
						], 
						[
						   new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), 
						   new nlobjSearchColumn("custitem_djkk_product_name_jpline2"),
						   new nlobjSearchColumn("itemid"),
						   new nlobjSearchColumn("upccode"),
						   new nlobjSearchColumn("itemid"),
						   new nlobjSearchColumn("internalid")
						]
						);
			 if(!isEmpty(itemSearch)){
				 for(var its = 0 ; its < itemSearch.length ; its++){
					 var itemname = itemSearch[its].getValue("itemid");
					 var itemInternalid = itemSearch[its].getValue("internalid");
					 var newlineObj = lineObj.find(function(item) {
						  return item.itemNameInLine === itemname;
						});
						
						if (newlineObj) {
							newlineObj.itemInternalidInLine = itemInternalid;
						}
					 var itemCode = itemSearch[its].getValue("itemid");
					 var itemJapanOne =  itemSearch[its].getValue("custitem_djkk_product_name_jpline1");
					 var itemJapanTwo = itemSearch[its].getValue("custitem_djkk_product_name_jpline2");
					 var UpcCode =  itemSearch[its].getValue("upccode");
					 if(isEmpty(UpcCode)){
						 alert(Number(its+1)+'�s�̃A�C�e���ɂ�����EAN�R�[�h ����ł�');
						 nlapiLogExecution('error','UpcCode', its+1);
						 return false;
				  	 }
					 if(isEmpty(itemCode)){
						 alert(Number(its+1)+'�s�̃A�C�e���ɂ����鏤�i�R�[�h ����ł�');
						 return false;
					 }
					 if(isEmpty(itemJapanOne)){
						 alert(Number(its+1)+'�s�̃A�C�e���ɂ�����DJ_�i���i���{��jLINE1����ł�');
						 return false;
					 }
					 
//					 if(isEmpty(itemJapanTwo)){
//					 	alert(j+'�s�̃A�C�e���ɂ�����DJ_�i���i���{��jLINE2����ł�');
//					 	return false;
//					 }
				 }
			 }
		}
		
		 
		 
		 
		 var status = nlapiGetFieldValue('custrecord_djkk_inboundshipment_status');//�����ו���STATUS
		 poArr =  uniqueArray(poArr);
		 for (var pol = 0; pol < poArr.length; pol++) {
			var poRecord = nlapiLoadRecord('purchaseorder', poArr[pol])
			var poid = poArr[pol];// Po.internalid
			var poCount = poRecord.getLineItemCount('item');
			var poNum = poRecord.getFieldValue('tranid');
			
//			var cust = nlapiGetFieldValue('customform');
			for (var k = 1; k < poCount + 1; k++) {
				var poItem = poRecord.getLineItemValue('item', 'item', k);
				for (var m = 0; m < lineObj.length; m++) {
					var itemInternalid = lineObj[m].itemInternalidInLine;
					var linenum = lineObj[m].linenum;
					// ���݂̌������ʂ́A���O�ɏ������܂ꂽ�z��I�u�W�F�N�g�ilineObj�j�Ɣ�r���A1��1�őΉ�
					if (poid == lineObj[m].poId && poItem == itemInternalid&& isEmpty(poNum)) {
						alert(linenum + '�s�̔������̔������ԍ�����ł�');
						return false;
					}
				

					if (poid == lineObj[m].poId &&poItem == itemInternalid) {
						var poDetail = poRecord.getLineItemValue('item','inventorydetail', k);
						if (isEmpty(poDetail) && status == '3') {
//						if (isEmpty(poDetail) ) {
							alert(linenum + '�s�������̍݌ɔԍ�����ł�');
							return false;
						}
						// end
					}
				}
			}

		}
		 
	
//	 var itemCount = nlapiGetLineItemCount('items');
//	for(var j=1;j<itemCount+1;j++){
//		var loacation = nlapiGetLineItemValue('items','receivinglocation',j);
//		//changed by song add start CH239
//		if(isEmpty(loacation)){
//			alert(j+'�s�̎�̏ꏊ�͋�ł�');
//			return false;
//		//changed by song add end CH239
//		}else if(!isEmpty(loacation)){
//			var locationCode = nlapiLookupField('location',loacation,'custrecord_djkk_wms_location_code');
//			if(isEmpty(locationCode)){
//				alert(j+'�s�̎�̏ꏊ�ɂ�����DJ _WMS�q�ɃR�[�h����ł�');
//				return false;
//			}
//		}
//
//		var quantity = nlapiGetLineItemValue('items','quantityexpected',j);
//		if(isEmpty(quantity)){
//			alert(j+'�s�̗\�z���� ����ł�');
//			return false;
//		}
//		var itemNameInLine = nlapiGetLineItemText('items','shipmentitem',j);
//		var Search = nlapiSearchRecord("item",null,
//				[
//				   ["name","is",itemNameInLine]
//				], 
//				[
//				   new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), 
//				   new nlobjSearchColumn("custitem_djkk_product_name_jpline2"),
//				   new nlobjSearchColumn("itemid"),
//				   new nlobjSearchColumn("upccode")
//				   
//				]
//				);
//		if(!isEmpty(Search)){
//			var itemCode = Search[0].getValue("itemid");
//			var itemJapanOne =  Search[0].getValue("custitem_djkk_product_name_jpline1");
//			var itemJapanTwo = Search[0].getValue("custitem_djkk_product_name_jpline2");
//			var UpcCode =  Search[0].getValue("upccode");
//			if(isEmpty(UpcCode)){
//				alert(j+'�s�̃A�C�e���ɂ�����EAN�R�[�h ����ł�');
//				return false;
//			}
//			if(isEmpty(itemCode)){
//				alert(j+'�s�̃A�C�e���ɂ����鏤�i�R�[�h ����ł�');
//				return false;
//			}
//			if(isEmpty(itemJapanOne)){
//				alert(j+'�s�̃A�C�e���ɂ�����DJ_�i���i���{��jLINE1����ł�');
//				return false;
//			}
////			if(isEmpty(itemJapanTwo)){
////				alert(j+'�s�̃A�C�e���ɂ�����DJ_�i���i���{��jLINE2����ł�');
////				return false;
////			}
//		}
//			
//		
//		
//		var poId = nlapiGetLineItemValue('items','purchaseorder',j);
//		var poRecord = nlapiLoadRecord('purchaseorder', poId);
//		var poCount = poRecord.getLineItemCount('item');
//		var poNum = poRecord.getFieldValue('tranid');
//		var poReceiptDate = nlapiGetLineItemValue('items','custrecord_djkk_receipt_date',j);
//		var cust = nlapiGetFieldValue('customform');
//		if(isEmpty(poNum)){
//			alert('�������̔������ԍ�����ł�');
//			return false;
//		}		
//		var status = nlapiGetFieldValue('custrecord_djkk_inboundshipment_status');
//		for(var k = 1;k<poCount+1;k++){
//			var poItem = poRecord.getLineItemValue('item','item',k);
//			var NameSearch = nlapiSearchRecord("item",null,
//					[
//					   ["internalid","anyof",poItem]
//					], 
//					[
//				
//					   new nlobjSearchColumn("name")
//					]
//					);
//			if(!isEmpty(NameSearch)){
//				var itemName = NameSearch[0].getValue("name");
//				if(itemName==itemNameInLine){
////					var poDate = poRecord.getLineItemValue('item','expectedreceiptdate',k); 
//					var poDetail = poRecord.getLineItemValue('item','inventorydetail',k); 
//					//20230117 changed by zhou start 
////					if(isEmpty(poDate) && isEmpty(poReceiptDate)&& cust != '62'){
////						alert(k+'�s�������̎�̗\�������ł�');
////						return false;
////					}else if(isEmpty(poReceiptDate) && cust == '62' ){
////						alert(k+'�s�������̎�̗\�������ł�');
////						return false;
////					}
//					if(isEmpty(poDetail) && status == '3'){
//						alert(j+'�s�������̍݌ɔԍ�����ł�');
//						return false;
//					}
//					//end
//				}
//			}
//		}	
//		//20230117 add by zhou start 
//		if(isEmpty(poReceiptDate)){
//			alert(j+'�s�������̎�̗\�������ł�');
//			return false;
//		}
//		//end
//		
//	}
	
	}
	//changed by geng add end U783
	if(!isEmpty(nlapiGetFieldValue('custrecord_djkk_landed_cost'))&&!isEmpty(nlapiGetFieldValue('custrecord_djkk_quantityexpected_sum'))){
		var counts=nlapiGetLineItemCount('items');
		var quantityexpected_sum=0;
		for(var s=1;s<counts+1;s++){
			 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
			 quantityexpected_sum+=Number(nlapiGetLineItemValue('items', 'quantityexpected',s));
			 }
			}
		if(quantityexpected_sum!=nlapiGetFieldValue('custrecord_djkk_quantityexpected_sum')){
			alert('�\�z���ʂ��ύX����ADJ_�A�����|���폜����K�v������܂�');
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

// if(type=='items'&&name=='custrecord_djkk_po_id'){
//	 if(!isEmpty(nlapiGetCurrentLineItemValue('items', 'purchaseorder'))){
//	 nlapiSetCurrentLineItemValue('items', 'purchaseorder', nlapiGetCurrentLineItemValue('items', 'custrecord_djkk_po_id'), false, true);
//	 }
// }
	 //U696 �d����̃f�t�H���g�z�����ShipTO�i�ʊ֋Ǝҁj
//	if(name=='purchaseorder'){
//	 var sub = nlapiGetFieldValue('custrecord_djkk_subsidiary_header');
//	 if(sub == SUB_DPKK || sub == SUB_SCETI){
//		 var brokerValue = nlapiGetFieldValue('custrecord_djkk_customs_broker');
//		 if (brokerValue == null || brokerValue == ''){
//		 var poId = nlapiGetCurrentLineItemValue('items', 'purchaseorder');
//		 var poRecord = nlapiLoadRecord('purchaseorder', poId);
//		 //changed by geng add start U380
//		 var incotermsLocation = poRecord.getFieldValue('custbody_djkk_po_incoterms_location');
////		 var incoterms = poRecord.getFieldValue('custbody_djkk_incoterm');//DJ-712DJ_�C���R�^�[�����O���܂����B�֘A���O��
////		 var incotermsval = nlapiLookupField('customrecord_djkk_incoterm', incoterms, 'name');
////		 nlapiSetCurrentLineItemValue('items', 'custrecord_djkk_cust_incoterms', incotermsval);
//		 nlapiSetCurrentLineItemValue('items', 'custrecord_djkk_incoterms_location', incotermsLocation);
//		//changed by geng add end U380
//		 var vendorId = poRecord.getFieldValue('entity');	 
//		 var vendorRecord = nlapiLoadRecord('vendor', vendorId);	 
//		 var vendorSearch = nlapiSearchRecord("vendor",null,
//		    		[
//		    		   ["internalid","anyof",vendorId]
//		    		], 
//		    		[
//		    		   new nlobjSearchColumn("shipaddress")
//		    		]
//		    		);
//		 var shipaddress = defaultEmpty(isEmpty(vendorSearch) ? '' :  vendorSearch[0].getValue("shipaddress"));
//		 nlapiSetFieldValue('custrecord_djkk_customs_broker',shipaddress);
//		 }
//	   }
//	}
	
	if(name=='shipmentitem'){
		var itemname =  nlapiGetCurrentLineItemText('items','shipmentitem');
		var receiptDate =  nlapiGetCurrentLineItemValue('items','custrecord_djkk_receipt_date');
		var headerReceiptDate=nlapiGetFieldValue('custrecord_djkk_delivery_date');
			
		var poId = nlapiGetCurrentLineItemValue('items','purchaseorder');
		var poRecord = nlapiLoadRecord('purchaseorder', poId);
		var poCount = poRecord.getLineItemCount('item');
		var poNum = poRecord.getFieldValue('tranid');
		
		if(isEmpty(receiptDate)){
			if(isEmpty(headerReceiptDate)){
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
					if(itemName== itemname){
						var poDate = poRecord.getLineItemValue('item','expectedreceiptdate',k); 
						nlapiSetCurrentLineItemValue('items', 'custrecord_djkk_receipt_date', poDate);
					}
				}
			}
		}else{
			nlapiSetCurrentLineItemValue('items', 'custrecord_djkk_receipt_date', headerReceiptDate);
		}
		}
		//20230317 add by zhou start
		//CH066
		var sub = nlapiGetFieldValue('custrecord_djkk_subsidiary_header');
		if(sub == SUB_DPKK || sub == SUB_SCETI){
			var destinationCustoms = poRecord.getFieldValue('custbody_djkk_destination_customs');//DJ_�ʊ֋Ǝ�
			if(!isEmpty(destinationCustoms)){
			nlapiSetCurrentLineItemValue('items', 'custrecord_djkk_destination_cust', destinationCustoms,true,true);
			}
		}
		//end
	}
	if(name=='custrecord_djkk_destination_cust'){
		var itemCount = nlapiGetLineItemCount('items');
		var destinationCustomsArr = [];
		var str = '';
		for(var j=1;j<itemCount+2;j++){
			//zhou memo :
			//itemCount+2�̗��R�Fline�s�����s���ȗ��R�A���݂̎擾�s�������ۂ̕\���s�������i����1�s���Ȃ�
			//�inlapiGetLineItemCount('items')�j���߁A���݂̍s���𐳂����\������ɂ́A���[�v�Ɏ擾�s����2�ǉ�����K�v������܂��B
			var itemDestinationCustoms = nlapiGetLineItemValue('items','custrecord_djkk_destination_cust',j);//�A�C�e��.DJ_�ʊ֋Ǝ�
			if(!isEmpty(itemDestinationCustoms)){
				destinationCustomsArr.push(itemDestinationCustoms);
				str+=itemDestinationCustoms+','
			}
			
		}
		nlapiSetFieldValues('custrecord_djkk_customs_broker',destinationCustomsArr)
	}
	if(name=='custrecord_djkk_delivery_date'){
		var headerReceiptDate=nlapiGetFieldValue('custrecord_djkk_delivery_date');
		if(!isEmpty(headerReceiptDate)){
			var count=nlapiGetLineItemCount('items');
			for(var i=1;i<count+1;i++){
				nlapiSelectLineItem('items', i)
				nlapiSetCurrentLineItemValue('items', 'custrecord_djkk_receipt_date', headerReceiptDate);
				nlapiCommitLineItem('items');
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
	 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
	if(!isEmpty(poid)){
	var posubsidiary=nlapiLookupField('purchaseorder', poid, 'subsidiary');
	if((posubsidiary!=nlapiGetFieldValue('custrecord_djkk_subsidiary_header'))||isEmpty(posubsidiary)){
		alert('PO�̘A���q��Ѓ��[�������ᔽ');
		return false;
	}
	}else{
		alert('PO��ɂ��邱�Ƃ͂ł��܂���');
		return false;
	}
}
	return true;
}
//20230317 add by zhou start
//CH066
function clientValidateDelete(type){
	//20230317 add by zhou start
	//CH066
	var sub = nlapiGetFieldValue('custrecord_djkk_subsidiary_header');
	if(sub == SUB_DPKK || sub == SUB_SCETI){
		nlapiSetFieldValues('custrecord_djkk_customs_broker','')
		var itemCount = nlapiGetLineItemCount('items');
		var destinationCustomsArr = [];
		var currentItemDestinationCustoms = nlapiGetCurrentLineItemValue('items', 'custrecord_djkk_destination_cust');//���݂̍s��DJ_�ʊ֋Ǝ�
		for(var j=1;j<itemCount+2;j++){
			//zhou memo :
			//itemCount+2�̗��R�Fline�s�����s���ȗ��R�A���݂̎擾�s�������ۂ̕\���s�������i����1�s���Ȃ�
			//�inlapiGetLineItemCount('items')�j���߁A���݂̍s���𐳂����\������ɂ́A���[�v�Ɏ擾�s����2�ǉ�����K�v������܂��B
			var itemDestinationCustoms = nlapiGetLineItemValue('items','custrecord_djkk_destination_cust',j);//�A�C�e��.DJ_�ʊ֋Ǝ�
			if(!isEmpty(itemDestinationCustoms)){
				destinationCustomsArr.push(itemDestinationCustoms);
			}
			
		}
		var newArr = removeItemOnce(destinationCustomsArr,currentItemDestinationCustoms);//���݂̂��ׂĂ̍s��DJ_�ʊ֋Ǝ�
		nlapiSetFieldValues('custrecord_djkk_customs_broker',newArr)
		return true;	
	}else{
		return true;
	}
}
//end
function sheet(){
	var theLink = URL_HEAD +'/app/accounting/transactions/vendbill.nl?whence=';
	var id = nlapiGetRecordId();
	if(!isEmpty(id)){
		theLink = theLink+'&shipmentnumber='+id;
		window.open(theLink);
	}
	
}
/*
 * DJ_�A�����|
 * 
 * */
function djkklanedcost() {
	var landedCost = nlapiGetFieldValue('custrecord_djkk_landed_cost');
	var theLink = '';
	if (isEmpty(landedCost)) {
		theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_landed_cost',
				'', 'EDIT');

		// �p�����[�^�̒ǉ�
		theLink = theLink + '&inboundshipmentID=' + nlapiGetRecordId();

	} else {
		theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_landed_cost',
				landedCost, 'VIEW');
	}
	theLink+='&ifrmcntnr=T';
	open(theLink,'_lanedcost','top=150,left=20,width=2500,height=800,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}

function incRetransmission(){
	if(window.confirm('���׎w���đ����m�F���܂���?')){
		var itemCount = nlapiGetLineItemCount('items');
		for(var i=1;i<itemCount+1;i++){
			var itemFlag = nlapiGetLineItemValue('items', 'custrecord_djkk_arrival_complete', i);
			if(itemFlag=='T'){
				nlapiSelectLineItem('items', i);
				nlapiSetCurrentLineItemValue('items', 'custrecord_djkk_arrival_complete', 'F');
//				nlapiSetLineItemValue('items', 'custrecord_djkk_desc', i, 'test');// 
				nlapiCommitLineItem('items');
			}
		}
//		nlapiSetFieldValue('custrecord_djkk_inc_retransmission_flag','F');
		alert('���׎w�����đ����܂�!');
	}
}


function defaultEmpty(src){
	return src || '';
}
function removeItemOnce(arr, value) {
	  var index = arr.indexOf(value);
	  if (index > -1) {
	    arr.splice(index, 1);
	  }
	  return arr;
}
function uniqueArray(arr) {
	var newArr = [];
	for (var i = 0; i < arr.length; i++) {
		if (newArr.indexOf(arr[i]) === -1) {
			newArr.push(arr[i]);
		}
	}
	return newArr;
}