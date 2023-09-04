/**
 * 検品倉庫移動
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jul 2021     admin
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug','', '在庫移動開始');
	
	var str = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_inspection_list_info');

	var arr = str.split(',')

	nlapiLogExecution('DEBUG', '実行対象', str);
	
	//不良品倉庫送信用
	var badLocationArr = new Array();
	
	//検品対象を処理する
	for(var i = 0 ; i < arr.length ; i++){
		governanceYield();
		var id = arr[i];
		//空白場合処理しません
		if(isEmpty(id)){
			continue;
		}
		
	
		
		//検品結果明細繰り返し
		var rec = nlapiLoadRecord('customrecord_djkk_inv_ip', id);
		var lineCount = rec.getLineItemCount('recmachcustrecord_djkk_inv_ipr_main');
		for(var j = 0 ; j < lineCount ; j++){
			var tranId = '';
			rec.selectLineItem('recmachcustrecord_djkk_inv_ipr_main', j+1)
			var div = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_class');
			var count = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_quantity');
			var item =  rec.getFieldValue('custrecord_djkk_inv_ip_item');
			var location = rec.getFieldValue('custrecord_djkk_inv_ip_locatio');
			var binFrom = rec.getFieldValue('custrecord_djkk_inv_ip_bin');
			
			var locationTo = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_location');
			var binTo =rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_bin');
			
			var sub = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_subsidiary')
			var invNo = rec.getFieldText('custrecord_djkk_inv_ip_invnumber');
			var lotRemark = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_remark');
			var lotMemo = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_memo');
			var reason=rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_reason');
			var reasonDetial=rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_detail_reason');
			//20220519 add by zhou start
			var makernum = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_makern');//メーカー製造番号
			var duetime = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_duetime');//賞味期限
			var madedate = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_madedate');//製造日
			var deliveryperiod = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_deliveryperiod');//出荷期間
			//20220519 add by zhou end
//			nlapiLogExecution('debug', 'madedate' ,madedate);
			var iprdetialId = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'id')
			//在庫移動作成 食品不良品場合、移動伝票作成する
			var record;
			if(div == '2' &&(sub == SUB_NBKK || sub == SUB_ULKK)){
				record= nlapiCreateRecord('transferorder');
//		
				
				//ステータス 配送保留
				record.setFieldValue('orderstatus', 'B');
				//インコターム  DAP
				record.setFieldValue('incoterm', '1')
				//会社
				record.setFieldValue('subsidiary', sub);
				//移動元倉庫
				record.setFieldValue('location',location );
				//移動先倉庫
				record.setFieldValue('transferlocation', locationTo);
				//メモ
				record.setFieldValue('memo', '検品一覧自動作成');
				//明細一行設定
				record.selectNewLineItem('item');
				//アイテム
				record.setCurrentLineItemValue('item', 'item',item);
				//数量
				record.setCurrentLineItemValue('item', 'quantity', count);
				//理由
				record.setCurrentLineItemValue('item', 'custcol_djkk_po_inspection_reason', reason);
				//理由詳細
				record.setCurrentLineItemValue('item', 'custcol_djkk_po_inspection_reason_mo', reasonDetial);
				//在庫詳細設定
				var inventoryDetail = record.createCurrentLineItemSubrecord('item','inventorydetail');
				//在庫詳細行設定
				inventoryDetail.selectNewLineItem('inventoryassignment');
				//シリアル番号設定
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',invNo);
				//数量
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', count);
				
				//保管棚移動元
				if(!isEmpty(binFrom)){
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', binFrom);
				}
				
				//保管棚移動先
				if(!isEmpty(binTo)){
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', binTo);
				}
				
				
//				var itemBinFlag=nlapiLookupField('item', item, 'usebins');
//				//保管棚設定
//				if(itemBinFlag=='T'){
//					//倉庫保管棚取得
//					var formLcBinFlg=nlapiSearchRecord("location",null,
//							[
//							   ["internalid","anyof",location]
//							], 
//							[
//							   new nlobjSearchColumn("usesbins")
//							]
//							)[0].getValue('usesbins');
//					if(formLcBinFlg=='T'){
//						var frombinSearch = nlapiSearchRecord("bin",null,
//								[
//								   ["location","anyof",location]
//								], 
//								[
//								   new nlobjSearchColumn("internalid")
//								]
//								);
//						if(!isEmpty(frombinSearch)){
//							var frombinId=frombinSearch[0].getValue('internalid');
//							//保管棚を設定する
//							
//							inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', frombinId);
//						}				
//					}
//					//移動先保管棚取得
//					var toLcBinFlg= nlapiSearchRecord("location",null,
//							[
//							   ["internalid","anyof",locationTo]
//							], 
//							[
//							   new nlobjSearchColumn("usesbins")
//							]
//							)[0].getValue('usesbins');
//					if(toLcBinFlg=='T'){
//						var tobinSearch = nlapiSearchRecord("bin",null,
//								[
//								   ["location","anyof",locationTo]
//								], 
//								[
//								   new nlobjSearchColumn("internalid")
//								]
//								);
//						if(!isEmpty(tobinSearch)){
//							var tobinId=tobinSearch[0].getValue('internalid');
//							for(var v = 0 ; v < tobinSearch.length ; v++){
//								if(binTo == tobinSearch[v].getValue('internalid')){
//									tobinId = binTo;
//									break;
//								}
//							}
//							
//							//保管棚を設定する
//							
//							inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', tobinId);
//						}				
//					}
//				}
				//不良品場合入出庫番号再度採番(採番未対応)
				if(div == '2'){
					var newInvNo = getNewInvNo(sub);
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', newInvNo);		
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku', newInvNo);	
					nlapiLogExecution('debug','newInvNo1', newInvNo);
				}else if(div == '1'){
					//良品場合シリア番号同じ
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', invNo);
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku', invNo);
				}else{
					//廃棄場合設定しない
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', '');
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku', '');
				}				
				
				//ロットリマーク
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark', lotRemark);
				//ロットリメモ	
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo', lotMemo);
				//20220519 add by zhou start
				//メーカー製造番号
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code', makernum);
				//賞味期限
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_expirationdate', duetime);
				//製造日
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', madedate);
				//出荷期間
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date', deliveryperiod);
				//20220519 add by zhou end
				//在庫詳細行コミット
				inventoryDetail.commitLineItem('inventoryassignment');
				//在庫詳細コミット
				inventoryDetail.commit();
				//明細行コミット
				record.commitLineItem('item')
				tranId = nlapiSubmitRecord(record);
				
			}else{
				record= nlapiCreateRecord('inventorytransfer');
				
				//会社
				record.setFieldValue('subsidiary', sub);
				//移動元倉庫
				record.setFieldValue('location',location );
				//移動先倉庫
				record.setFieldValue('transferlocation', locationTo);
				//メモ
				record.setFieldValue('memo', '検品一覧自動作成');
				
				//明細一行設定
				record.selectNewLineItem('inventory');
				//アイテム
				record.setCurrentLineItemValue('inventory', 'item',item);
				//数量
				record.setCurrentLineItemValue('inventory', 'adjustqtyby', count);
				//理由
				record.setCurrentLineItemValue('inventory', 'custcol_djkk_po_inspection_reason', reason);
				//理由詳細
				record.setCurrentLineItemValue('inventory', 'custcol_djkk_po_inspection_reason_mo', reasonDetial);
				//在庫詳細設定
				var inventoryDetail = record.createCurrentLineItemSubrecord('inventory','inventorydetail');
				//在庫詳細行設定
				inventoryDetail.selectNewLineItem('inventoryassignment');
				//シリアル番号設定
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',invNo);
				//数量
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', count);
				
				//保管棚移動元
				if(!isEmpty(binFrom)){
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', binFrom);
				}
				
				//保管棚移動先
				if(!isEmpty(binTo)){
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', binTo);
				}
				
//				//保管棚
//				var itemBinFlag=nlapiLookupField('item', item, 'usebins');
//				
//				//保管棚設定
//				if(itemBinFlag=='T'){
//					//倉庫保管棚取得
//					var formLcBinFlg=nlapiSearchRecord("location",null,
//							[
//							   ["internalid","anyof",location]
//							], 
//							[
//							   new nlobjSearchColumn("usesbins")
//							]
//							)[0].getValue('usesbins');
//					if(formLcBinFlg=='T'){
//						var frombinSearch = nlapiSearchRecord("bin",null,
//								[
//								   ["location","anyof",location]
//								], 
//								[
//								   new nlobjSearchColumn("internalid")
//								]
//								);
//						if(!isEmpty(frombinSearch)){
//
//							var frombinId=frombinSearch[0].getValue('internalid');
//							//保管棚を設定する
//							
//							if()
//							inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', frombinId);
//						}				
//					}
//					//移動先保管棚取得
//					var toLcBinFlg= nlapiSearchRecord("location",null,
//							[
//							   ["internalid","anyof",locationTo]
//							], 
//							[
//							   new nlobjSearchColumn("usesbins")
//							]
//							)[0].getValue('usesbins');
//					if(toLcBinFlg=='T'){
//						var tobinSearch = nlapiSearchRecord("bin",null,
//								[
//								   ["location","anyof",locationTo]
//								], 
//								[
//								   new nlobjSearchColumn("internalid")
//								]
//								);
//						if(!isEmpty(tobinSearch)){
//							var tobinId=tobinSearch[0].getValue('internalid');
//							for(var v = 0 ; v < tobinSearch.length ; v++){
//								if(binTo == tobinSearch[v].getValue('internalid')){
//									tobinId = binTo;
//									break;
//								}
//							}
//							//保管棚を設定する
//							
//							inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', tobinId);
//						}				
//					}
//				}
				
				//不良品場合入出庫番号再度採番(採番未対応)
				if(div == '2'){
					var newInvNo = getNewInvNo(sub);
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', newInvNo);		
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku',  newInvNo);	
					nlapiLogExecution('debug','newInvNo', newInvNo);
				}else if(div == '1'){
					//良品場合シリア番号同じ
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', invNo);
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku', invNo);
				}else{
					//廃棄場合設定しない
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', '');
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku', '');
				}					
				
				//ロットリマーク
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark', lotRemark);
				//ロットリメモ
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo', lotMemo);
				//20220519 add by zhou start
				//メーカー製造番号
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code', makernum);
				//賞味期限
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_expirationdate', duetime);
				//製造日
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', madedate);
				//出荷期間
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date', deliveryperiod);
				//20220519 add by zhou end				
				//在庫詳細行コミット
				inventoryDetail.commitLineItem('inventoryassignment');
				//在庫詳細コミット
				inventoryDetail.commit();
				//明細行コミット
				record.commitLineItem('inventory')
				tranId = nlapiSubmitRecord(record);

			}
			
			//不良品場合メールを送信する。
			if(div == '2' && badLocationArr.indexOf(locationTo) < 0){
				badLocationArr.push(locationTo);
			}
			
			rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_tran', tranId)
			rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_location',locationTo);
			rec.commitLineItem('recmachcustrecord_djkk_inv_ipr_main');
		}

	
		//処理済みチェックする
		rec.setFieldValue('custrecord_djkk_inv_ip_done', 'T');
		nlapiSubmitRecord(rec);
	}
	
	for(var i = 0 ; i < badLocationArr.length ; i++){
		sendMailToLocationByBadItem(badLocationArr[i]);
	}
	
	nlapiLogExecution('debug', '','在庫移動終了');
}

function sendMailToLocationByBadItem(location){
	var locationSearch = nlapiSearchRecord("location",null,
			[
			 "internalid","anyof",location
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
			   new nlobjSearchColumn("internalid")
			]
			);
	var mailArr = new Array();
	if(!isEmpty(locationSearch)){
		for(var i = 0 ; i < locationSearch.length ; i++){
			mailArr[0] = locationSearch[i].getValue("custrecord_djkk_mail","address",null);
		}
		
		if(!isEmpty(mailArr[0])){
			nlapiSendEmail(-5, mailArr[0], '不良品入庫のお知らせ', '不良品入庫しました');
		}else{
			nlapiLogExecution('DEBUG', '', 'メールアドレス存在しないため送信できませんでした。');
		}
		
		
	}else{
		nlapiLogExecution('DEBUG', '', '倉庫を存在しないため、処理終了');
	}
}

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
