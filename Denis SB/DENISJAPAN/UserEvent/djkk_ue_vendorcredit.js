/**
 * 前払金/買掛金調整 ue
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Jun 2023     10046
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
    var acknowledgmentid=nlapiGetFieldValue('custbody_djkk_bribery_acknowledgmentid');
    if(type=='view'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'&&!isEmpty(acknowledgmentid)){
   	 var reid=nlapiGetRecordId();
     nlapiDeleteRecord(nlapiGetRecordType(), reid);		
	  nlapiSetRedirectURL('RECORD', 'customrecord_djkk_bribery_acknowledgment',acknowledgmentid, 'VIEW');
    }else if(type=='edit'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'&&!isEmpty(acknowledgmentid)){
    	var feieldNote = form.addField('custpage_cachedataflag', 'inlinehtml');
		var messageColour = '<font size=5 color="red"> 未承認の前払金/買掛金調整は編集状態で変更があるかどうか必ず保存ボタン押下お願い致します。</br>もし保存しない30分後操作可能です。</font>';
		feieldNote.setLayoutType('outside', 'startrow');
	    feieldNote.setDefaultValue(messageColour);
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
	 if((type=='create'||type=='copy')&&nlapiGetFieldValue('customform')=='142' &&isEmpty(nlapiGetFieldValue('custbody_djkk_bribery_acknowledgmentid'))){
			
			try{
				
			var record=nlapiCreateRecord('customrecord_djkk_bribery_acknowledgment');
			//主要情報
			record.setFieldValue('customform', '179');
			record.setFieldValue('custrecord_djkk_transactionnumber', nlapiGetFieldValue('transactionnumber'));//トランザクション番号
			record.setFieldValue('custrecord_djkk_bribery_tranid', nlapiGetFieldValue('tranid'));//参照番号
			record.setFieldValue('custrecord_djkk_bribery_vendor', nlapiGetFieldValue('entity'));//DJ_仕入先 
			record.setFieldValue('custrecord_djkk_bribery_account', nlapiGetFieldValue('account'));//勘定科目 
			record.setFieldValue('custrecord_djkk_bribery_amount', nlapiGetFieldValue('usertotal'));//金額
			record.setFieldValue('custrecord_djkk_bribery_createdfrom', nlapiGetFieldValue('createdfrom'));//DJ_作成元(承認用)
			record.setFieldValue('custrecord_djkk_bribery_currency', nlapiGetFieldValue('currency'));//DJ_通貨 
			record.setFieldValue('custrecord_djkk_bribery_exchangerate', nlapiGetFieldValue('exchangerate'));//DJ_為替レート *
			record.setFieldValue('custrecord_djkk_bribery_taxtotal', nlapiGetFieldValue('taxtotal'));//DJ_税金
			record.setFieldValue('custrecord_djkk_bribery_duedate', nlapiGetFieldValue('duedate'));//DJ_期日
			record.setFieldValue('custrecord_djkk_bribery_now_date', nlapiGetFieldValue('trandate'));//日付 
			record.setFieldValue('custrecord_djkk_bribery_postingperiod', nlapiGetFieldValue('postingperiod'));//記帳期間 
			record.setFieldValue('custrecord_djkk_bribery_memo', nlapiGetFieldValue('memo'));//メモ
			record.setFieldValue('custrecord_djkk_bribery_closing_date', nlapiGetFieldValue('custbody_suitel10n_inv_closing_date'));//締日
			record.setFieldValue('custrecord_djkk_bribery_deliverydate', nlapiGetFieldValue('custbody_jp_deliverydate'));//納期
			
			//分類
			record.setFieldValue('custrecord_djkk_bribery_subsidiary', nlapiGetFieldValue('subsidiary'));//子会社
			record.setFieldValue('custrecord_djkk_department', nlapiGetFieldValue('department'));//セクション
			record.setFieldValue('custrecord_djkk_class', nlapiGetFieldValue('class'));//ブランド
			record.setFieldValue('custrecord_djkk_location', nlapiGetFieldValue('location'));//場所
			
			//その他
			record.setFieldValue('custrecord_djkk_bribery_operation_inston', nlapiGetFieldValue('custbody_djkk_operation_instructions'));//DJ_検品・作業指示
			record.setFieldValue('custrecord_djkk_inspection_finished', nlapiGetFieldValue('custbody_djkk_inspection_finished'));//DJ_検品終了希望日	
			// CH144 zheng 20230516 start
			//record.setFieldValue('custrecord_djkk_reserved_exchangerate_p1', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p1'));//DJ_第1予約レート
			// CH144 zheng 20230516 end
			record.setFieldValue('custrecord_djkk_jp_bank_acct_info', nlapiGetFieldValue('custbody_jp_bank_acct_info'));//DJ_銀行口座情報
			record.setFieldValue('custrecord_djkk_custbody_jp_estimateinfo', nlapiGetFieldValue('custbody_jp_estimateinfo'));//DJ_見積情報
			record.setFieldValue('custrecord_djkk_bribery_jp_message', nlapiGetFieldValue('custbody_jp_message'));//DJ_通信欄
			record.setFieldValue('custrecord_djkk_expected_shipping_date', nlapiGetFieldValue('custbody_djkk_expected_shipping_date'));//DJ_出荷予定日
			record.setFieldValue('custrecord_djkk_bribery_vendor_comments', nlapiGetFieldValue('custbody_djkk_vendor_comments'));//DJ_仕入先コメント
			// CH144 zheng 20230516 start
			//record.setFieldValue('custrecord_dj_reserved_exchange_rate_yen', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_yen'));//DJ_円貨支払
			//record.setFieldValue('custrecord_djkk_reserved_exchange_rate_f', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_f'));//DJ_外貨支払データ作成
			//record.setFieldValue('custrecord_djkk_reserved_exchangerate_p2', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p2'));//DJ_第2予約レート
			//record.setFieldValue('custrecord_djkk_reserved_exchangerate_p3', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p3'));//DJ_第3予約レート
			// CH144 zheng 20230516 end
			record.setFieldValue('custrecord_djkk_bribery_project', nlapiGetFieldValue('custbody_djkk_project'));//DJ_プロジェクト
			record.setFieldValue('custrecord_djkk_delivery_precautions', nlapiGetFieldValue('custbody_djkk_delivery_precautions'));//DJ_納品先注意事項
			record.setFieldValue('custrecord_djkk_production_po_number', nlapiGetFieldValue('custbody_djkk_production_po_number'));//DJ_PRODUCTION PURCHASE ORDER番号
			record.setFieldValue('custrecord_djkk_bribery_language', nlapiGetFieldValue('custbody_djkk_language'));//DJ_言語
			record.setFieldValue('custrecord_djkk_br_incoterms_location', nlapiGetFieldValue('custbody_djkk_incoterms_location'));//DJ_出荷元
			record.setFieldValue('custrecord_djkk_bribery_po_fc_created', nlapiGetFieldValue('custbody_djkk_po_fc_created'));//DJ_POプロポーザル
			record.setFieldValue('custrecord_djkk_djkk_sotck_send_flag', nlapiGetFieldValue('custbody_djkk_sotck_send_flag'));//DJ_入力予定フラグ
			record.setFieldValue('custrecord_djkk_br_customer_precautions', nlapiGetFieldValue('custbody_djkk_customer_precautions'));//DJ_顧客注意事項
			
			//請求TAB
			record.setFieldValue('custrecord_djkk_bribery_billaddress', nlapiGetFieldValue('billaddress'));//DJ_仕入先住所
			record.setFieldValue('custrecord_djkk_br_billaddresslist_id', nlapiGetFieldValue('billaddresslist'));//DJ_仕入先住所の選択(ID)
			record.setFieldValue('custrecord_djkk_bribery_billaddresslist', nlapiGetFieldText('billaddresslist'));//DJ_仕入先住所の選択
			
			//承認情報
			var roleValue = nlapiGetRole();
			var userValue = nlapiGetUser();
			var subsidiary = nlapiGetFieldValue('subsidiary');
			var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//トランザクション承認管理表
					[
					   ["isinactive","is","F"], 
					   "AND", 
					   ["custrecord_djkk_trans_appr_obj","anyof",12],
					   "AND",
					   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //作成ロール
					   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //第一承認ロール
					   
					]
					);
			if(!isEmpty(approvalSearch)){
				for(var j = 0; j < approvalSearch.length; j++){
					var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//作成ロール
					var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//第一承認ロール
					if(createRole == roleValue){
						record.setFieldValue('custrecord_djkk_start_role',createRole);//DJ_作成ロール
						record.setFieldValue('custrecord_djkk_next_appr_role',appr1_role); //DJ_次の承認ロール
					}
				}
			}
			
			record.setFieldValue('custrecord_djkk_brybery_checkbox', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg'));
			record.setFieldValue('custrecord_djkk_page_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status'));
			record.setFieldValue('custrecord_djkk_start_role_name', userValue);
//			record.setFieldValue('custrecord_djkk_start_role', nlapiGetFieldValue('custbody_djkk_trans_appr_create_role'));
			//record.setFieldValue('custrecord_djkk_start_role_name', nlapiGetFieldValue('custbody_djkk_trans_appr_create_user'));
			record.setFieldValue('custrecord_djkk_brybery_tr', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));
			record.setFieldValue('custrecord_djkk_brybery_appr_dev_u', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user'));
			record.setFieldValue('custrecord_djkk_brybery_appr_term', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));
				
//			record.setFieldValue('custrecord_djkk_next_appr_role', nlapiGetFieldValue('custbody_djkk_trans_appr_next_role'));
			record.setFieldValue('custrecord_djkk_next_appr_name', nlapiGetFieldValue('custbody_djkk_trans_appr_user'));
			record.setFieldValue('custrecord_djkk_next_appr_term', nlapiGetFieldValue('custbody_djkk_trans_appr_cdtn_amt'));
			record.setFieldValue('custrecord_djkk_first_role', nlapiGetFieldValue('custbody_djkk_trans_appr1_role'));
			record.setFieldValue('custrecord_djkk_brybery_first_name', nlapiGetFieldValue('custbody_djkk_trans_appr1_user'));
			record.setFieldValue('custrecord_djkk_end_role', nlapiGetFieldValue('custbody_djkk_trans_appr2_role'));
			record.setFieldValue('custrecord_djkk_brybery_second_name', nlapiGetFieldValue('custbody_djkk_trans_appr2_user'));
			
			record.setFieldValue('custrecord_djkk_third_brybery_role', nlapiGetFieldValue('custbody_djkk_trans_appr3_role'));
			record.setFieldValue('custrecord_djkk_third_brybery_name', nlapiGetFieldValue('custbody_djkk_trans_appr3_user'));
			record.setFieldValue('custrecord_djkk_last_brybery_role', nlapiGetFieldValue('custbody_djkk_trans_appr4_role'));
			record.setFieldValue('custrecord_djkk_last_brybery_name', nlapiGetFieldValue('custbody_djkk_trans_appr4_user'));
			record.setFieldValue('custrecord_djkk_over_brybery_memo', nlapiGetFieldValue('custbody_djkk_approval_reset_memo'));

			record.setFieldValue('custrecord_djkk_brybery_kyaltuka_memo', nlapiGetFieldValue('custbody_djkk_approval_kyaltuka_memo'));
//			record.setFieldValue('custrecord_djkk_bribery_memo', nlapiGetFieldValue('memo'));//
			nlapiLogExecution('debug','item start','')	
			//アイテム明細
			var itemCounts=nlapiGetLineItemCount('item');
		    for(var i=1;i<itemCounts+1;i++){
		    	nlapiSelectLineItem('item', i);
				
		    	var inventoryDetail=nlapiViewCurrentLineItemSubrecord('item','inventorydetail');
				if(!isEmpty(inventoryDetail)){
					var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
					for(var m = 1 ; m < invCount+1 ; m++){
						inventoryDetail.selectLineItem('inventoryassignment', m);
						record.selectNewLineItem('recmachcustrecord_djkk_brybery_page');
						
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', i);//DJ_行番号
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_detail_sub', nlapiGetFieldValue('subsidiary'));//DJ_子会社
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_item', nlapiGetCurrentLineItemValue('item', 'item'));//DJ_アイテム
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_location', nlapiGetCurrentLineItemValue('item', 'location'));//	DJ_場所
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_unity', nlapiGetCurrentLineItemValue('item', 'units'));//DJ_単位
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate', nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_単価/率
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount', nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_金額
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate_code', nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_税金コード
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_page', nlapiGetCurrentLineItemValue('item', 'memo'));//DJ_前払金/買掛金調整
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_vendor', nlapiGetCurrentLineItemValue('item', 'vendorname'));//DJ_仕入先名
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_tax_money_brybery', nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_税額
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_all_money_brybery', nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_総額
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_description', nlapiGetCurrentLineItemValue('item', 'description'));//DJ_説明
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_department', nlapiGetCurrentLineItemValue('item', 'department'));//DJ_セクション
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_class', nlapiGetCurrentLineItemValue('item', 'class'));//DJ_ブランド
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_customer', nlapiGetCurrentLineItemValue('item', 'customer'));//DJ_顧客:プロジェクト
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_isbillablet', nlapiGetCurrentLineItemValue('item', 'isbillableT'));//DJ_請求可能
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_br_amortizationscheid', nlapiGetCurrentLineItemValue('item', 'amortizationsched'));//DJ_償却スケジュールid/hidden
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationsche', nlapiGetCurrentLineItemText('item', 'amortizationsched'));//DJ_償却スケジュール
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizstartdate', nlapiGetCurrentLineItemValue('item', 'amortizstartdate'));//DJ_償却開始
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationendd', nlapiGetCurrentLineItemValue('item', 'amortizationenddate'));//DJ_償却終了
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_amortizationresidual', nlapiGetCurrentLineItemValue('item', 'amortizationresidual'));//DJ_残余
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_custcol_sol_fa_demo_1', nlapiGetCurrentLineItemValue('item', 'custcol_sol_fa_demo_1'));//DJ_資産登録
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_customs_duty_rate2', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate'));//DJ_予定関税(総金額2)
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_4572_tax_category', nlapiGetCurrentLineItemValue('item', 'custcol_4572_tax_category'));//DJ_税金カテゴリ
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_po_memorandum', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_memorandum'));//DJ_備忘録
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_origin', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_origin'));//DJ_生産国
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_in_sotck_send_indicate', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_in_sotck_send_indicate'));//DJ_入荷予定指示済
						
						var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber')
						if(isEmpty(receiptinventorynumber)){
					    	var invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
					    	receiptinventorynumber = nlapiLookupField('inventorynumber', invReordId,'inventorynumber');
						}
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number',invReordId);	//シリアル/ロット番号    	
				    	
						record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_binnery_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber'));//DJ_保管棚番号
						
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_over_date_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));//有効期限
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_lot_number',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));//DJ_メーカー製造ロット番号
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_serial_number',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));//DJ_メーカーシリアル番号	
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_manufacturing_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));//DJ_製造年月日
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_probort_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));//DJ_出荷可能期限日
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_ware_house_num_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));//DJ_倉庫入庫番号
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));//DJ_SMC番号
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_list_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));//DJ_ロットリマーク
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_memmo_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));//DJ_ロットメモ	
				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));//数量		 
				    	record.commitLineItem('recmachcustrecord_djkk_brybery_page');	
					}
			    }else{
					record.selectNewLineItem('recmachcustrecord_djkk_brybery_page');
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', i);//DJ_行番号
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_detail_sub', nlapiGetFieldValue('subsidiary'));//DJ_子会社
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_item', nlapiGetCurrentLineItemValue('item', 'item'));//DJ_アイテム
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_location', nlapiGetCurrentLineItemValue('item', 'location'));//	DJ_場所
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_unity', nlapiGetCurrentLineItemValue('item', 'units'));//DJ_単位
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate', nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_単価/率
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount', nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_金額
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate_code', nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_税金コード
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_page', nlapiGetCurrentLineItemValue('item', 'memo'));//DJ_前払金/買掛金調整
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_vendor', nlapiGetCurrentLineItemValue('item', 'vendorname'));//DJ_仕入先名
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_tax_money_brybery', nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_税額
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_all_money_brybery', nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_総額
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_description', nlapiGetCurrentLineItemValue('item', 'description'));//DJ_説明
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_department', nlapiGetCurrentLineItemValue('item', 'department'));//DJ_セクション
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_class', nlapiGetCurrentLineItemValue('item', 'class'));//DJ_ブランド
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_customer', nlapiGetCurrentLineItemValue('item', 'customer'));//DJ_顧客:プロジェクト
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_isbillablet', nlapiGetCurrentLineItemValue('item', 'isbillableT'));//DJ_請求可能
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_br_amortizationscheid', nlapiGetCurrentLineItemValue('item', 'amortizationsched'));//DJ_償却スケジュールid/hidden
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationsche', nlapiGetCurrentLineItemText('item', 'amortizationsched'));//DJ_償却スケジュール
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizstartdate', nlapiGetCurrentLineItemValue('item', 'amortizstartdate'));//DJ_償却開始
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationendd', nlapiGetCurrentLineItemValue('item', 'amortizationenddate'));//DJ_償却終了
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_amortizationresidual', nlapiGetCurrentLineItemValue('item', 'amortizationresidual'));//DJ_残余
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_custcol_sol_fa_demo_1', nlapiGetCurrentLineItemValue('item', 'custcol_sol_fa_demo_1'));//DJ_資産登録
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_customs_duty_rate2', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate'));//DJ_予定関税(総金額2)
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_4572_tax_category', nlapiGetCurrentLineItemValue('item', 'custcol_4572_tax_category'));//DJ_税金カテゴリ
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_po_memorandum', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_memorandum'));//DJ_備忘録
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_origin', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_origin'));//DJ_生産国
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_in_sotck_send_indicate', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_in_sotck_send_indicate'));//DJ_入荷予定指示済
			    	record.commitLineItem('recmachcustrecord_djkk_brybery_page');
				}
		    }
		    nlapiLogExecution('debug','item end','')	
		  //費用明細
			var costCounts=nlapiGetLineItemCount('expense');
			nlapiLogExecution('debug','cost start','start')
		    for(var c=1;c<costCounts+1;c++){
		    	nlapiSelectLineItem('expense', c);
				{
					nlapiLogExecution('debug','in costline ',nlapiGetCurrentLineItemValue('expense', 'account'))
					record.selectNewLineItem('recmachcustrecord_djkk_amount_acknowledgment');
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_account',nlapiGetCurrentLineItemValue('expense', 'account'));//勘定科目
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amount',nlapiGetCurrentLineItemValue('expense', 'amount'));//金額
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxcode',nlapiGetCurrentLineItemValue('expense', 'taxcode'));//税金コード
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxrate',nlapiGetCurrentLineItemValue('expense', 'taxrate1'));//税率
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_tax',nlapiGetCurrentLineItemValue('expense', 'tax'));//税額
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_pst',nlapiGetCurrentLineItemValue('expense', 'item'));//PST
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_grossamt',nlapiGetCurrentLineItemValue('expense', 'grossamt'));//総額
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_memo',nlapiGetCurrentLineItemValue('expense', 'memo'));//メモ
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_department',nlapiGetCurrentLineItemValue('expense', 'department'));//セクション
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_class',nlapiGetCurrentLineItemValue('expense', 'class'));//ブランド
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_location',nlapiGetCurrentLineItemValue('expense', 'location'));//場所
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_customer',nlapiGetCurrentLineItemValue('expense', 'customer'));//顧客
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_claim',nlapiGetCurrentLineItemValue('expense', 'isbillable'));//請求可能
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amortizatio',nlapiGetCurrentLineItemText('expense', 'amortizationsched'));//償却スケジュール
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_cost_amortizationid',nlapiGetCurrentLineItemValue('expense', 'amortizationsched'));//償却スケジュールid/hidden
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizstartdate',nlapiGetCurrentLineItemValue('expense', 'amortizstartdate'));//償却開始	
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizationend',nlapiGetCurrentLineItemValue('expense', 'amortizationenddate'));//償却終了
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_residual',nlapiGetCurrentLineItemValue('expense', 'amortizationresidual'));//残余
					record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_tax_category',nlapiGetCurrentLineItemValue('expense', 'custcol_4572_tax_category'));//税金カテゴリ
			    	record.commitLineItem('recmachcustrecord_djkk_amount_acknowledgment');
				}
		    }
			nlapiLogExecution('debug','cost end','end')
		    
			var custRecordId=nlapiSubmitRecord(record, true, true);
			nlapiSetFieldValue('custbody_djkk_bribery_acknowledgmentid', custRecordId, false, true);
		    nlapiSetFieldValue('custbody_cache_data_flag', 'T', false, true);
			}catch(e){
				throw nlapiCreateError('システムエラー', e.message);
				 nlapiSetFieldValue('custbody_cache_data_flag', 'T', false, true);
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
  
}
