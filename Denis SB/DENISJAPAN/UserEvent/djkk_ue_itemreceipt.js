/**
 *受領書のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/02/25     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * 
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
//	var user = nlapiGetUser();
//	form.setScript('customscript_djkk_cs_itemreceipt');
//	if (user == '167') {
//		var functionName='djkkInventoryDetails()';
//		var lableName='DJKK在庫詳細作成';
//		if(type=='view'){
//			functionName='djkkInventoryDetailsview()';
//			var lableName='DJKK在庫詳細一覧';
//		}
//	 form.addButton('custpage_djkk_inventory_details', lableName, functionName);
//	}
//	setFieldDisableType('custbody_djkk_ship_via', 'disabled');
	form.setScript('customscript_djkk_cs_itemreceipt');
	if(type=='view'){
		var sub=nlapiGetFieldValue('subsidiary');
		var subType=nlapiLookupField('subsidiary',sub, 'custrecord_djkk_subsidiary_type');
        if(subType=='2'){
			form.addButton('custpage_pdfMaker', 'GS1生成','pdfMaker();');
		}
		
		
	}
	try{
	if(type == 'create'){
		var poId = nlapiGetFieldValue('createdfrom');
		var ordertype = nlapiGetFieldValue('ordertype');
		if(!isEmpty(poId)&&ordertype=='PurchOrd'){
			
				var record = nlapiLoadRecord('purchaseorder', poId)
				var linksCount = record.getLineItemCount('links')
				var count = 1;
				for(var i = 0 ; i < linksCount ; i++){
					if(record.getLineItemValue('links', 'type', i+1) == '受領書'){
						count++
					}
				}
					
				nlapiSetFieldValue('custbody_djkk_branch_number',record.getFieldValue('custbody_djkk_branch_number') +  "_"+count);					
	}			
  }
	}catch(e){
		
	}
}

function userEventBeforeSubmit(type){
	if(type=='delete'){
		return null;
	}
	if(type == 'create'){
		var sub=nlapiGetFieldValue('subsidiary');
		var subType=nlapiLookupField('subsidiary',sub, 'custrecord_djkk_subsidiary_type');
		
		//	食品
		if(subType=='1'){
			nlapiSetFieldValue('customform', itemreceipt_food_form_id, false, true);
			
		// LS
		}else if(subType=='2'){
			nlapiSetFieldValue('customform', itemreceipt_ls_form_id, false, true);
		}
		
		var createdfromId = nlapiGetFieldValue('createdfrom');
		var ordertype = nlapiGetFieldValue('ordertype');
		if(!isEmpty(createdfromId) && ordertype=='PurchOrd'){
		var record = nlapiLoadRecord('purchaseorder', createdfromId)
		var linksCount = record.getLineItemCount('links')
		var count = 1;
		for(var i = 0 ; i < linksCount ; i++){
			if(record.getLineItemValue('links', 'type', i+1) == '受領書'){
				count++
			}
		}
			
		nlapiSetFieldValue('custbody_djkk_branch_number',record.getFieldValue('custbody_djkk_branch_number') +  "_"+count);		
	}
		// Add by ycx U800 2022/09/09
			if(ordertype=='RtnAuth'){
				var returnauthorizationCreatedfromRecordInventoryDetailArray=new Array();
				if(!isEmpty(createdfromId)){
				var returnauthorizationCreatedfromId=nlapiLookupField('returnauthorization', createdfromId, 'createdfrom');
				if(!isEmpty(returnauthorizationCreatedfromId)){
					var returnauthorizationCreatedfromTransactionSearch = nlapiSearchRecord("transaction",null,
							[
							   ["internalid","anyof",returnauthorizationCreatedfromId]
							], 
							[
							   new nlobjSearchColumn("recordType",null,"GROUP")
							]
							);
		if(!isEmpty(returnauthorizationCreatedfromTransactionSearch)){
	       var returnauthorizationCreatedfromRecordType=returnauthorizationCreatedfromTransactionSearch[0].getValue("recordType",null,"GROUP");
	   	if(!isEmpty(returnauthorizationCreatedfromRecordType)){
	       var returnauthorizationCreatedfromRecord=nlapiLoadRecord(returnauthorizationCreatedfromRecordType,returnauthorizationCreatedfromId);
	       var returnauthorizationCreatedfromRecordCount=returnauthorizationCreatedfromRecord.getLineItemCount('item');
	       for(var tm = 1 ; tm < returnauthorizationCreatedfromRecordCount+1 ; tm++){
	    	   
	    	   returnauthorizationCreatedfromRecord.selectLineItem('item', tm);
	    	   if (returnauthorizationCreatedfromRecord.getLineItemValue('item', 'itemtype', tm) != 'EndGroup'){
	    	   var returnauthorizationCreatedfromRecordInventoryDetail=returnauthorizationCreatedfromRecord.viewCurrentLineItemSubrecord('item','inventorydetail');
	    	   if(!isEmpty(returnauthorizationCreatedfromRecordInventoryDetail)){
	    			var returnauthorizationCreatedfromRecordInventoryDetailount=returnauthorizationCreatedfromRecordInventoryDetail.getLineItemCount('inventoryassignment');
					for(var sj=1;sj<returnauthorizationCreatedfromRecordInventoryDetailount+1;sj++){
	    		   returnauthorizationCreatedfromRecordInventoryDetail.selectLineItem('inventoryassignment',sj);
	    		   returnauthorizationCreatedfromRecordInventoryDetailArray.push(returnauthorizationCreatedfromRecordInventoryDetail.getCurrentLineItemValue('inventoryassignment','issueinventorynumber_display'));
					}
	    	   }
	       }
	       }	
	       
				var counts=nlapiGetLineItemCount('item');
				for(var s = 1 ; s < counts+1 ; s++){
				 nlapiSelectLineItem('item',s);
				 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
				 var inventoryDetail=nlapiViewCurrentLineItemSubrecord('item','inventorydetail');
				 if(!isEmpty(inventoryDetail)){
						var inventoryDetailCount=inventoryDetail.getLineItemCount('inventoryassignment');
						for(var j=1;j<inventoryDetailCount+1;j++){
						    inventoryDetail.selectLineItem('inventoryassignment',j);
						    var receiptinventorynumber=inventoryDetail.getCurrentLineItemValue('inventoryassignment','receiptinventorynumber');
						    
						    //230124deleteByWang
//						    if(returnauthorizationCreatedfromRecordInventoryDetailArray.indexOf(receiptinventorynumber) > -1){
//						    	throw nlapiCreateError('システムエラー', 'DJ:返品の場合、新しい管理番号を作成しないと保存できない。');
//						     }
						   }
					    }
				       }
				     }
				   }
				  }
				 }
			}
			}
			// Add End
			
			
			
  }
	  if (type == 'create') {
	  //入出庫処理
	  var itemCount = nlapiGetLineItemCount('item');
		for(var i = 0 ; i < itemCount ; i ++){
			if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup'&&nlapiGetCurrentLineItemValue('item', 'itemreceive') == 'T') {
			var locationId = nlapiGetLineItemValue('item', 'location', i+1);
			if(!isEmpty(locationId)){
				var flg = nlapiLookupField('location', locationId, 'custrecord_djkk_stop_load')
				if(flg == 'T'){
					throw nlapiCreateError('システムエラー', nlapiGetLineItemText('item', 'location', i+1)+' 入出庫を停止しています。');
				}
			}
			}
		}
	  }
     
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
	try{
	if(type=='delete'){
		return null;
	}
	var itemreceiptRecord=nlapiLoadRecord('itemreceipt', nlapiGetRecordId());
	var counts=itemreceiptRecord.getLineItemCount('item');
	for(var i=1;i<counts+1;i++){
		 itemreceiptRecord.selectLineItem('item', i);
		 if (itemreceiptRecord.getLineItemValue('item', 'itemtype', i) != 'EndGroup'){
		 var inventoryDetail=itemreceiptRecord.editCurrentLineItemSubrecord('item','inventorydetail');
			if(!isEmpty(inventoryDetail)){
				var inventoryDetailCount=inventoryDetail.getLineItemCount('inventoryassignment');
				for(var j=1;j<inventoryDetailCount+1;j++){
				    inventoryDetail.selectLineItem('inventoryassignment',j);
				    var numberedrecordid=inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'numberedrecordid');
				    var shipment_date=inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');
				     nlapiSubmitField('inventorynumber', numberedrecordid, 'custitemnumber_djkk_shipment_date', shipment_date, false)
				}
			}
	}
	}
   }catch(error){		
	}
}
