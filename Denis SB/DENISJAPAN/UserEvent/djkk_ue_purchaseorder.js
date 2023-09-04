/**
 * 発注書のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/03/08     CPC_苑             新規作成
 *
 */
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {

	// add by ycx0323 
	//project/contract add button get values
	try {
		var projectid = request.getParameter('projectid');
		if (!isEmpty(projectid)) {

			// DJ_プロジェクト
			nlapiSetFieldValue('custbody_djkk_project', projectid);
		}
	} catch (e) {

	}
	
//	try {
//		var contractid = request.getParameter('contractid');
//		if (!isEmpty(contractid)) {
//
//			// DJ_契約書
//			nlapiSetFieldValue('custbody_djkk_contract', contractid);
//		}
//	} catch (e) {
//
//	}
	// add end

		setFieldDisableType('exchangerate', 'disabled');

	//setLineItemDisableType('item', 'custcol_djkk_inventorydetail_auto_flg', 'hidden');
//	setLineItemDisableType('item', 'custcol_djkk_item_item_record_type', 'hidden')
//	if(type=='edit'&&!isEmpty(nlapiGetFieldValue('custbody_djkk_ship_via'))){		
//		setFieldDisableType('custbody_djkk_ship_via', 'disabled');
//	}
	// 2/25発注書PDF生成ボタンを追加
	form.setScript('customscript_djkk_cs_purchaseorder');
//	if(type=='view'){
//		form.addButton('custpage_pdfMaker', 'PDF生成','pdfMaker();');
//	}
	


	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit approve, reject,
 *            cancel (SO, ER, Time Bill, PO & RMA only) pack, ship (IF)
 *            markcomplete (Call, Task) reassign (Case) editforecast (Opp,
 *            Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type) {
	//if(type=='create'){

		// DJ枝番自動採番
		var custrecord_djkk_now_number = nlapiGetFieldValue("custbody_djkk_branch_number");
		if (isEmpty(custrecord_djkk_now_number)) {
			nlapiSetFieldValue("custbody_djkk_branch_number", getDjkkNowNumber('購入枝番'));
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit, approve,
 *            cancel, reject (SO, ER, Time Bill, PO & RMA only) pack, ship (IF
 *            only) dropship, specialorder, orderitems (PO only) paybills
 *            (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type) {

    if (type == 'delete') {
        return;
    }

	/**
	 * 最小桁数
	 */
	var TheMinimumdigits = 11;
	var updateArray=new Array();
	var roleSub = getRoleSubsidiary();
		var purchaseorder=nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
		var count=purchaseorder.getLineItemCount('item');				
		var csvFlag=purchaseorder.getFieldValue("custbody_djkk_csv_import_flag");
//		if(type=='edit'&&csvFlag=='T'){
		if(csvFlag=='T'){

			var numbering=1;
            var numberingId='';
            var itemMake='';
            var makeNumber='';
            var itemSub= purchaseorder.getFieldValue('subsidiary');

				var numberSearch = nlapiSearchRecord(
						"customrecord_djkk_inventorydetail_number",
						null,
						[ [ "custrecord_djkk_invnum_subsidiary",
								"is", itemSub ] ],
						[
								new nlobjSearchColumn("internalid"),
								new nlobjSearchColumn(
										"custrecord_djkk_invnum_bumber"),
								new nlobjSearchColumn(
										"custrecord_djkk_invnum_item_make") ]);

				if (!isEmpty(numberSearch)) {
					numberingId = numberSearch[0].getValue("internalid");
					itemMake = numberSearch[0].getValue("custrecord_djkk_invnum_item_make");
					numbering = Number(numberSearch[0].getValue("custrecord_djkk_invnum_bumber")) + 1;
				}

			for(var i=1;i<count+1;i++){
			purchaseorder.selectLineItem('item', i);
			// CH820 add by zdj 20230830 start
			var execution = nlapiGetContext().getExecutionContext();
			nlapiLogExecution('error','execution',execution);
			if(execution == 'csvimport'){
				var quantity = purchaseorder.getCurrentLineItemValue('item', 'quantity');
				var itemID = purchaseorder.getCurrentLineItemValue('item', 'item');
				var rateExp = nlapiLookupField('item', itemID, 'custitem_djkk_min_inv_unit_cus_duty');
				nlapiLogExecution('error','quantity',quantity);
				nlapiLogExecution('error','rateExp',rateExp);
				if(!isEmpty(rateExp)&&!isEmpty(quantity)){
					var dutyRate=quantity*rateExp;
					purchaseorder.setCurrentLineItemValue('item', 'custcol_djkk_min_inv_unit_cus_duty',rateExp);
					purchaseorder.setCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate',dutyRate);
				}else {
					purchaseorder.setCurrentLineItemValue('item', 'custcol_djkk_min_inv_unit_cus_duty','');
					purchaseorder.setCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate','');
				}
			}
			// CH820 add by zdj 20230830 end
		if (purchaseorder.getLineItemValue('item', 'itemtype', i) != 'EndGroup'){
			var auto_flg=purchaseorder.getLineItemValue('item', 'custcol_djkk_inventorydetail_auto_flg', i);
			var itemId=purchaseorder.getLineItemValue('item', 'item', i);
			var itemValues = nlapiLookupField('item', itemId, 'itemid');
			
//            makeNumber=purchaseorder.getLineItemValue('item', 'custcol_djkk_maker_serial_code', i);
//            if(!isEmpty(makeNumber)){
//			itemMake=makeNumber+itemValues;
//			var numberSearch = nlapiSearchRecord("customrecord_djkk_inventorydetail_number",null,
//					[
//					   ["custrecord_djkk_invnum_item_make","is",itemMake]
//					], 
//					[
//					    new nlobjSearchColumn("internalid"), 
//                        new nlobjSearchColumn("custrecord_djkk_invnum_bumber")
//					]
//					);
//			
//			if(!isEmpty(numberSearch)){
//				numberingId=numberSearch[0].getValue("internalid");
//				numbering=Number(numberSearch[0].getValue("custrecord_djkk_invnum_bumber"))+1;
//			}
//            }
//            if(auto_flg=='T'){
//            	 nlapiLogExecution('debug', '1');
//    			var inventoryDetail=purchaseorder.editCurrentLineItemSubrecord('item','inventorydetail');
//    			
//    			if(!isEmpty(inventoryDetail)){
//    				 nlapiLogExecution('debug', '2');
//    				var inventoryDetailCount=inventoryDetail.getLineItemCount('inventoryassignment');
//    				for(var j=1;j<inventoryDetailCount+1;j++){
//    				    inventoryDetail.selectLineItem('inventoryassignment',j);
//    				    if(isEmpty(itemMake)){
//    				    	 nlapiLogExecution('debug', '3');
//    				    	itemSub=purchaseorder.getFieldValue('subsidiary');
//    			            var numberSearch = nlapiSearchRecord("customrecord_djkk_inventorydetail_number",null,
//    			                    [
//    			                       ["custrecord_djkk_invnum_subsidiary","is",itemSub]
//    			                    ], 
//    			                    [
//    			                        new nlobjSearchColumn("internalid"), 
//    			                        new nlobjSearchColumn("custrecord_djkk_invnum_bumber"),
//    			                        new nlobjSearchColumn("custrecord_djkk_invnum_item_make")
//    			                    ]
//    			                    );
//    			            
//    			            if(!isEmpty(numberSearch)){
//    			                numberingId=numberSearch[0].getValue("internalid");
//    			                itemMake=numberSearch[0].getValue("custrecord_djkk_invnum_item_make");
//    			                numbering=Number(numberSearch[0].getValue("custrecord_djkk_invnum_bumber"))+1;
//    			            }  			               				        
//    				    }
//    					var receiptinventorynumber =  itemMake+ prefixInteger(parseInt(numbering), parseInt(TheMinimumdigits));	
//    			       nlapiLogExecution('debug', '2', receiptinventorynumber)
//    			        inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',receiptinventorynumber);
//    			       
//    			        /**/
//    			        if(!isEmpty(itemId)){
//    			            
//    			            // アイテムマスタ.DJ_Shelf Life（Days）/アイテムマスタ.DJ_出荷可能期間（Days）
//    			            var itemValues=nlapiLookupField('item', itemId, ['custitem_djkk_shelf_life','custitem_djkk_warranty_month']);
//    			            var shelfLife=Number(itemValues.custitem_djkk_shelf_life);
//    			            if(shelfLife=='NaN'){
//    			                shelfLife=0;
//    			            }
//    			            var warrantyMonth=Number(itemValues.custitem_djkk_warranty_month);
//    			            if(warrantyMonth=='NaN'){
//    			                warrantyMonth=0;
//    			            }
//    			            
//    			            
//    			        }
//
//    			        var ymd=inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');
//    			        
//    			        if(!isEmpty(ymd)){
//    			        	
//    			            // 有効期限
//    			            inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'expirationdate', dateAddDays(ymd, shelfLife));
//    			          }
//
//    			        
//    			        // 有効期限
//
//    			            var expirationdate=inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');
//    			            if(!isEmpty(expirationdate)){
//    			            	
//    			                // 出荷可能期限日
//    			                inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date', dateAddDays(expirationdate, -warrantyMonth));
//    			              }
//    			        /**/
//    					inventoryDetail.commitLineItem('inventoryassignment');    					
//    					numbering=parseInt(numbering)+1;
//    			    }
//    				inventoryDetail.commit();
//    				updateArray.push([numberingId,numbering,itemMake]);
//    			}
//    			purchaseorder.commitLineItem('item');
//            }
			
            


//			if (auto_flg == 'T') {

				var inventoryDetail = purchaseorder.editCurrentLineItemSubrecord('item', 'inventorydetail');

				if (!isEmpty(inventoryDetail)) {

					var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
					
					for (var j = 1; j < inventoryDetailCount + 1; j++) {
						inventoryDetail.selectLineItem('inventoryassignment', j);
					
						
						
						var receiptinventorynumber = itemMake+ prefixInteger(parseInt(numbering),parseInt(TheMinimumdigits));
						if (auto_flg == 'T') {
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',receiptinventorynumber);
						}

						if (!isEmpty(itemId)) {

							// アイテムマスタ.DJ_Shelf
							// Life（Days）/アイテムマスタ.DJ_出荷可能期間（Days）
							var itemValues = nlapiLookupField('item', itemId, ['custitem_djkk_shelf_life','custitem_djkk_warranty_month' ]);
							var shelfLife = Number(itemValues.custitem_djkk_shelf_life);
							if (shelfLife == 'NaN') {
								shelfLife = 0;
							}
							var warrantyMonth = Number(itemValues.custitem_djkk_warranty_month);
							if (warrantyMonth == 'NaN') {
								warrantyMonth = 0;
							}

						}

						var ymd = inventoryDetail.getCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd');
						var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment','expirationdate');
						var shipmentdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date');
						if (!isEmpty(ymd)&&isEmpty(expirationdate)) {

							// 有効期限

								inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'expirationdate',dateAddDays(ymd,+shelfLife));

						}
						
						// 有効期限
						
						if (!isEmpty(ymd)&&isEmpty(shipmentdate)) {
							expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment','expirationdate');
							// 出荷可能期限日
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',dateAddDays(expirationdate,-warrantyMonth));
						}
						/**/
						inventoryDetail.commitLineItem('inventoryassignment');
						numbering = parseInt(numbering) + 1;
					}
					inventoryDetail.commit();
					updateArray.push([ numberingId, numbering, itemMake ]);
				}
				//purchaseorder.commitLineItem('item');
//			}
            
			}
			purchaseorder.commitLineItem('item');
	    }
			purchaseorder.setFieldValue('custbody_djkk_csv_import_flag', 'F');
			nlapiSubmitRecord(purchaseorder, false, true);
			for (var s = 0; s < updateArray.length;s++) {
				var id = updateArray[s][0];
				if (!isEmpty(id)) {
					nlapiSubmitField('customrecord_djkk_inventorydetail_number',id, 'custrecord_djkk_invnum_bumber',Number(updateArray[s][1]));
				} 
			}			
	}
}
