/**
 * 在庫移動UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/16     CPC_苑
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
//	form.setScript('customscript_djkk_cs_inventorytransfer');
//	if (type == 'view') {
//		form.addButton('custpage_popuplmi', '倉庫移動指示リスト', 'popuplmi();');
//	}
}

//20220930 add by zhou U809 userEventBeforeSubmit 在庫移動後のDJ_在庫調整承認画面の作成
function userEventBeforeSubmit(type) {
	var recordType = nlapiGetRecordType();
//	var recordId = nlapiGetRecordId();
//	var loadRecord =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
	if(recordType=='inventorytransfer'){
		var tranidArray = [];
		var subsidiary = nlapiGetFieldValue('subsidiary');//子会社
		var warehouse = nlapiGetFieldValue('location');  //移動元
		var transferlocation = nlapiGetFieldValue('transferlocation');  //移動先
		var class = nlapiGetFieldText('class');  //ブランド 
		var count = nlapiGetLineItemCount('inventory');
		for(var k = 1 ; k < count+1 ; k++){
			nlapiSelectLineItem('inventory',k);
			var managementCheck = nlapiGetCurrentLineItemValue('inventory','custcol_djkk_new_management_num');
			if(managementCheck == 'T'){
				nlapiSelectLineItem('inventory', k);
				var admitRe = nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons');//変更理由
				var item = nlapiGetCurrentLineItemValue('inventory', 'item');//item
				var itemAccountSearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","is",item]
						], 
						[
						   new nlobjSearchColumn("expenseaccount"), 
//						   new nlobjSearchColumn("assetaccount")
						]
						);
				if(!isEmpty(itemAccountSearch)){
					var account = itemAccountSearch[0].getValue('expenseaccount');//勘定科目
				}
				var inventoryqty = nlapiGetCurrentLineItemValue('inventory', 'quantityonhand');  //在庫数量 
				var units = nlapiGetCurrentLineItemValue('inventory', 'units');  //単位
				var adjqty = nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby');  //移動数量 
				var description = nlapiGetCurrentLineItemValue('inventory', 'description');  //説明
				var inventorydetailFlag = nlapiGetCurrentLineItemValue("inventory","inventorydetailavail");
				nlapiLogExecution('debug','変更理由',admitRe)
				if(inventorydetailFlag == 'T'){
					//在庫詳細設定
					var invArray = [];
					var inventoryDetail = nlapiEditCurrentLineItemSubrecord('inventory','inventorydetail');
					if(!isEmpty(inventoryDetail)){
							var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
							if(inventoryDetailCount != 0){
							for(var h = 1 ;h < inventoryDetailCount+1 ; h++){
							    inventoryDetail.selectLineItem('inventoryassignment',h);
							    var invReordId;
		    				    var inventorynumber;
	    				    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
	    				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    ); 
	    				    	if(!isEmpty(inventorynumberSearch)){
			    				    inventorynumber = inventorynumberSearch[0].getValue("inventorynumber");//シリアル/ロット番号	
	    				    	}
							    var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//有効期限
							    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_メーカー製造ロット番号
							    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_製造年月日
							    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_出荷可能期限日
							    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_倉庫入庫番号
							    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC番号
							    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_ロットメモ	
							    var binnumber =  inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber');  //送付元の保管棚
							    var tobinnumber =  inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'tobinnumber');  //収納先保管棚
	    			  		    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_ロットリマーク
//							    var lotRemark = inventoryDetail.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',h);
							    var quantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity');//数量		
							    var controlNumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_メーカーシリアル番号
							    invArray.push({
							    	subsidiary:subsidiary,
							    	bland:class,
							    	description:description,
							    	inventoryqty:inventoryqty,
							    	units:units,
							    	invReordId:invReordId,
							    	inventorynumber:inventorynumber,
							    	expirationdate:expirationdate,
							    	makernum:makernum,
							    	madedate:madedate,
							    	deliveryperiod:deliveryperiod,
							    	warehouseCode:warehouseCode,
							    	smc:smc,
							    	lotMemo:lotMemo,
							    	binnumber:binnumber,
							    	lotRemark:lotRemark,
							    	quantity:quantity,
							    	controlNumber:controlNumber,
							    	tobinnumber:tobinnumber
							    })
							}
						}
					}
				}
				//DJ_在庫調整生成
//				var rec2 =  eRecord('inventoryadjustment');
//				rec2.setFieldValue('trandate',  nlapiDateToString(getSystemTime())); //日付
//				rec2.setFieldValue('subsidiary',subsidiary);//子会社
//				rec2.setFieldValue('custbody_djkk_change_reason', admitRe);//変更理由
//				rec2.selectNewLineItem('inventory'); //明細
//				rec2.setCurrentLineItemValue('inventory', 'item', item);//item
//				rec2.setCurrentLineItemValue('inventory', 'adjustqtyby', adjqty);//調整数量   
//				rec2.setCurrentLineItemValue('inventory', 'location', warehouse);//場所
//				rec2.setFieldValue('account',account);//調整勘定科目
//				var inventoryDetail = rec2.createCurrentLineItemSubrecord('inventory','inventorydetail');//在庫詳細
//				var invArrayText = JSON.stringify(invArray);
//				nlapiLogExecution('debug','invArrayText',invArrayText)
//				for(var n = 0 ; n < invArray.length ;n++){
//					inventoryDetail.selectNewLineItem('inventoryassignment');
//					var tobinnumberValue = invArray[n].tobinnumber;
//					var binnumberValue = invArray[n].binnumber;
//					var inventorynumber = invArray[n].inventorynumber;
//					var quantity = invArray[n].quantity;
//					
//					if(!isEmpty(binnumberValue)){
//						inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber',binnumberValue);
//					}
//					inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',inventorynumber);//シリアル/ロット番号
//					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', quantity);//数量
//					inventoryDetail.commitLineItem('inventoryassignment');
//					inventoryDetail.commit();
//				}
//				rec2.commitLineItem('inventory');
//				var inventoryadjustmentId = nlapiSubmitRecord(rec2);
				
				//DJ_在庫調整承認画面生成
				var rec2 = nlapiCreateRecord('customrecord_djkk_ic_admit');
				
				
				
				
				rec2.setFieldValue('custrecord_djkk_admit_trandate',  nlapiDateToString(getSystemTime())); //日付
				rec2.setFieldValue('custrecord_djkk_admit_subsidiary',subsidiary);//子会社
				rec2.setFieldValue('custrecord_djkk_admit_re', admitRe);//変更理由
				rec2.setFieldValue('custrecord_djkk_admit_account',account);//調整勘定科目
				
				
				rec2.setFieldValue('custrecord_djkk_admit_flg','T');//DJ_承認処理フラグ
				var roleValue = nlapiGetRole();
			      var userValue = nlapiGetUser();
			      
			      var subsidiary = nlapiGetFieldValue('subsidiary');
			      var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//トランザクション承認管理表
			          [
			             ["isinactive","is","F"], 
			             "AND", 
			             ["custrecord_djkk_trans_appr_obj","anyof",16],
			             "AND",
			             ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
			          ], 
			          [
			             new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //作成ロール
			             new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //第一承認ロール
			             
			          ]
			          );
			      if(!isEmpty(approvalSearch)){
			        for(var j = 0; j < approvalSearch.length; j++){1
			          var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//作成ロール
			          var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//第一承認ロール
			          if(createRole == roleValue){
			        	  rec2.setFieldValue('custrecord_djkk_admit_create_role',createRole);//DJ_作成ロール
			        	  rec2.setFieldValue('custrecord_djkk_admit_next_autho_role',appr1_role); //DJ_次の承認ロール
			          }
			        }
			      }
				
				rec2.setFieldValue('custrecord_djkk_admit_create_user',userValue);//DJ_作成者			
				
				
				
				//DJ_在庫調整承認画面_明細生成
				var invArrayText = JSON.stringify(invArray);
				nlapiLogExecution('debug','invArrayText',invArrayText)
				var lineNum = parseInt(0);//DJ_在庫調整明細行番号
				//移動元
				for(var n = 0 ; n < invArray.length ;n++){
					rec2.selectNewLineItem('recmachcustrecord_djkk_ic_admit'); //明細
					var subsidiary = invArray[n].subsidiary;
					var blandFrom = invArray[n].bland;
					var descriptionFrom = invArray[n].description;
					var unitsFrom = invArray[n].units;
//					var tobinnumberFrom = invArray[n].tobinnumber;//送付先の保管棚
					var invReordIdFrom = invArray[n].invReordId;
					var binnumberFrom = invArray[n].binnumber;//送付元の保管棚
					var inventorynumberFrom = invArray[n].inventorynumber;
					var quantityFrom = invArray[n].quantity;//在庫詳細_明細数量
					var expirationdateFrom = invArray[n].expirationdate;//有効期限
					var makernumFrom = invArray[n].makernum;//DJ_メーカー製造ロット番号
					var madedateFrom = invArray[n].madedate;//DJ_製造年月日
					var deliveryperiodFrom = invArray[n].deliveryperiod;//DJ_出荷可能期限日
					var smcFrom = invArray[n].smc;//DJ_SMC番号
					var lotMemoFrom = invArray[n].lotMemo;//DJ_ロットメモ	
					var lotRemarkFrom = invArray[n].lotRemark;//DJ_ロットリマーク
					var controlNumberFrom = invArray[n].controlNumber;//DJ_メーカーシリアル番号
					var warehouseCodeFrom = invArray[n].warehouseCode;//DJ_倉庫入庫番号
					var inventoryqtyFrom = invArray[n].inventoryqty;//DJ_在庫数量
					var newquantityFrom = Number(inventoryqtyFrom)-Number(quantityFrom);
					nlapiLogExecution('debug','n',n)
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item', item);//item
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty', quantityFrom*-1);//調整数量   
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', descriptionFrom);//説明
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', blandFrom);//説明
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit', unitsFrom);//単位
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse', warehouse);//場所
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum', binnumberFrom);////送付元の保管棚
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', inventorynumberFrom);//シリアル/ロット番号 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', invReordIdFrom);//シリアル/ロット番号 ID
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date', expirationdateFrom);//有効期限
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot', makernumFrom);//DJ_メーカー製造ロット番号
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date', madedateFrom);//DJ_製造年月
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date', deliveryperiodFrom);//DJ_出荷可能期限日
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no', warehouseCodeFrom);//DJ_倉庫入庫番号 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num', smcFrom);//DJ_SMC番号 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark', lotRemarkFrom);//DJ_ロットリマーク
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo', lotMemoFrom);//DJ_ロットメモ	
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty', newquantityFrom);//新しい数量
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', inventoryqtyFrom);//在庫数量
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial', controlNumberFrom);//DJ_メーカーシリアル番号
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_subsidiary', subsidiary);//DJ_子会社
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', parseInt(n+1));//DJ_在庫調整明細行番号
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity', quantityFrom*-1);//DJ_在庫詳細明細行数量
					rec2.commitLineItem('recmachcustrecord_djkk_ic_admit');
				}
				lineNum = parseInt(n);
				//移動先
				for(var i = 0 ; i < invArray.length ;i++){
					rec2.selectNewLineItem('recmachcustrecord_djkk_ic_admit'); //明細
					var subsidiary = invArray[i].subsidiary;
					var blandTo = invArray[i].bland;
					var descriptionTo = invArray[i].description;
					var unitsTo = invArray[i].units;
					var tobinnumberTo = invArray[i].tobinnumber;//送付先の保管棚
					//在庫移動後在庫調整自動採番
					var invReordIdTo =  getNewInvNo(subsidiary);
//					var binnumberValue = invArray[i].binnumber;//送付元の保管棚
//					var inventorynumber = invArray[i].inventorynumber;
					var quantityTo = invArray[i].quantity;//在庫詳細_明細数量
					var expirationdateTo = invArray[i].expirationdate;//有効期限
					var makernumTo = invArray[i].makernum;//DJ_メーカー製造ロット番号
					var madedateTo = invArray[i].madedate;//DJ_製造年月日
					var deliveryperiodTo = invArray[i].deliveryperiod;//DJ_出荷可能期限日
					var smcTo = invArray[i].smc;//DJ_SMC番号
					var lotMemoTo = invArray[i].lotMemo;//DJ_ロットメモ	
					var lotRemarkTo = invArray[i].lotRemark;//DJ_ロットリマーク
					var controlNumberTo = invArray[i].controlNumber;//DJ_メーカーシリアル番号
					var warehouseCodeTo = invArray[i].warehouseCode;//DJ_倉庫入庫番号
					var inventorydetailSearch = nlapiSearchRecord("inventorydetail",null,
							[
							   ["item","anyof",item], 
							   "AND", 
							   ["location","anyof",transferlocation], 
							   "AND", 
							   ["inventorynumber.inventorynumber","is",invReordIdTo]
							], 
							[
							   new nlobjSearchColumn("quantity"), 
							   new nlobjSearchColumn("inventorynumber")
							]
							);
					var inventoryqtyTo = 0;//DJ_在庫数量old
					if(inventorydetailSearch != null){				
						for(var b = 0 ; b < inventorydetailSearch.length ; b++){
							inventoryqtyTo += Number(inventorydetailSearch[b].getValue('quantity'));
						}	
					}
					nlapiLogExecution('debug','invReordIdTo',invReordIdTo)
					nlapiLogExecution('debug','inventoryqtyTo',inventoryqtyTo)
					var newquantityTo = Number(inventoryqtyTo)+Number(quantityTo);
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item', item);//item
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty', quantityTo);//調整数量   
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', descriptionTo);//説明
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', blandTo);//説明
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit', unitsTo);//単位
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse', transferlocation);//場所
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum', tobinnumberTo);////送付元の保管棚
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', invReordIdTo);//シリアル/ロット番号 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date', expirationdateTo);//有効期限
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot', makernumTo);//DJ_メーカー製造ロット番号
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date', madedateTo);//DJ_製造年月
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date', deliveryperiodTo);//DJ_出荷可能期限日
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no', warehouseCodeTo);//DJ_倉庫入庫番号 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num', smcTo);//DJ_SMC番号 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark', lotRemarkTo);//DJ_ロットリマーク
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo', lotMemoTo);//DJ_ロットメモ	
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty', newquantityTo);//新しい数量
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', inventoryqtyTo);//在庫数量
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial', controlNumberTo);//DJ_メーカーシリアル番号
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_subsidiary', subsidiary);//DJ_子会社
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', parseInt(lineNum+1));//DJ_在庫調整明細行番号
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity', quantityTo);//DJ_在庫詳細明細行数量
					rec2.commitLineItem('recmachcustrecord_djkk_ic_admit');
				}
				var recordid = nlapiSubmitRecord(rec2);
				
				nlapiLogExecution('debug','DJ_在庫調整承認画面参照番号',recordid)
//				loadRecord.setLineItemValue('inventory','custcol_djkk_inv_adjustment',k,recordid);
				nlapiSetLineItemValue('inventory','custcol_djkk_inv_adjustment',k,recordid)
			}
		}
//		nlapiSubmitRecord(loadRecord, false, true);
	}
}
//在庫移動後在庫調整自動採番
function getNewInvNo (sub){
	var no = "";
	try{
		
		var TheMinimumdigits = 11;
		var submitId='';
		var NumberTxt='';
		var numbering='';
		
		var usersub=sub
		var nbSearch = nlapiSearchRecord("customrecord_djkk_inventorydetail_number",null,
				[
				   ["custrecord_djkk_invnum_subsidiary","anyof",usersub]
				], 
				[
                   new nlobjSearchColumn("internalid"),
                   new nlobjSearchColumn("custrecord_djkk_invnum_subsidiary"),
                   new nlobjSearchColumn("custrecord_djkk_invnum_form_name"),
				   new nlobjSearchColumn("custrecord_djkk_invnum_item_make"), 
				   new nlobjSearchColumn("custrecord_djkk_invnum_bumber")
				]
				);
		if(!isEmpty(nbSearch)){
			submitId=nbSearch[0].getValue('internalid');
			NumberTxt=nbSearch[0].getValue('custrecord_djkk_invnum_item_make');
			numbering=nbSearch[0].getValue('custrecord_djkk_invnum_bumber');
		}

		var receiptinventorynumber =  NumberTxt+ prefixInteger(parseInt(numbering)+1, parseInt(TheMinimumdigits));
		nlapiSubmitField('customrecord_djkk_inventorydetail_number',submitId, 'custrecord_djkk_invnum_bumber',parseInt(numbering)+1);
		
		return receiptinventorynumber;
	}catch(e){
		nlapiLogExecution('ERROR', '採番エラー', e.message)
	}
	return no;
}
//end