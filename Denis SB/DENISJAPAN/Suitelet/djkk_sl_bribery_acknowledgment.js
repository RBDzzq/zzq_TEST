/**
 * DJ_前払金/買掛金調整承認画面SL
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Dec 2022     ZHOU
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	
	try{
		var recId = request.getParameter('icId');
		nlapiLogExecution('debug','recId',recId)
		
		var Status = request.getParameter('Status');
		nlapiLogExecution('debug','Status',Status)
		var deleteRecordId = request.getParameter('deleteRecordId');
		nlapiLogExecution('debug', 'deleteRecordId',deleteRecordId);
		if(!isEmpty(deleteRecordId)){
			var scheduleparams = new Array();
			scheduleparams['custscript_djkk_deleterecordtype'] = 'vendorcredit';
			scheduleparams['custscript_djkk_deleterecordid'] = deleteRecordId;
			runBatch('customscript_djkk_ss_trandata_delete', 'customdeploy_djkk_ss_trandata_deleterec', scheduleparams);
		}else{							
		var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
		//20230616 add by zhou start
		if(Status=='edit'){
			var vendorcreditId = record.getFieldValue('custrecord_djkk_over_id');//前払金/買掛金調整標準画面id
			if(!isEmpty(vendorcreditId)){
				nlapiLogExecution('debug','vendorcredit',vendorcreditId)
				throw nlapiCreateError('システムエラー','現在実行中のオペレータがいます。「エラーのロールバック」ボタンをクリックして異常を取り除いてから試してください',true);
			}
		}
		//20230616 add by zhou end
	//	nlapiLogExecution('debug','record',subsidiary)
		//主要情報
		var customform =  record.getFieldValue('customform');
		var transactionnumber =  record.getFieldValue('custrecord_djkk_transactionnumber');//トランザクション番号
		var tranid =  record.getFieldValue('custrecord_djkk_bribery_tranid');//参照番号
		var vendor =  record.getFieldValue('custrecord_djkk_bribery_vendor');//仕入先 
		var account =  record.getFieldValue('custrecord_djkk_bribery_account');//勘定科目 
		var amount =  record.getFieldValue('custrecord_djkk_bribery_amount');//金額
		var createdfromRecognition =  record.getFieldValue('custrecord_djkk_bribery_createdfrom');//DJ_作成元(承認用)
		var currency =  record.getFieldValue('custrecord_djkk_bribery_currency');//DJ_通貨 
		var exchangerate =  record.getFieldValue('custrecord_djkk_bribery_exchangerate');//DJ_為替レート *
		var taxtotal =  record.getFieldValue('custrecord_djkk_bribery_taxtotal');//DJ_税金
		var duedate =  record.getFieldValue('custrecord_djkk_bribery_duedate');//DJ_期日
		var nowDate =  record.getFieldValue('custrecord_djkk_bribery_now_date');//日付 
		var postingperiod =  record.getFieldValue('custrecord_djkk_bribery_postingperiod');//記帳期間 
		var memo =  record.getFieldValue('custrecord_djkk_bribery_memo');//メモ
		var closingDate =  record.getFieldValue('custrecord_djkk_bribery_closing_date');//締日
		var deliveryDate =  record.getFieldValue('custrecord_djkk_bribery_deliverydate');//納期
		var count=record.getLineItemCount('recmachcustrecord_djkk_brybery_page');  //item明細	
		var costCount=record.getLineItemCount('recmachcustrecord_djkk_amount_acknowledgment');  //費用明細	
		//分類
		var subsidiary =  record.getFieldValue('custrecord_djkk_bribery_subsidiary');//子会社
		var department =  record.getFieldValue('custrecord_djkk_department');//セクション
		var class =  record.getFieldValue('custrecord_djkk_class');//ブランド
		var location =  record.getFieldValue('custrecord_djkk_location');//場所
		var overId =  record.getFieldValue('custrecord_djkk_over_id');//DJ_前払金/買掛金調整
		
		//その他
		var operationInston =  record.getFieldValue('custrecord_djkk_bribery_operation_inston');//DJ_検品・作業指示
		var inspectionFinished =  record.getFieldValue('custrecord_djkk_inspection_finished');//DJ_検品終了希望日	
		var reservedExchangerateP1 =  record.getFieldValue('custrecord_djkk_reserved_exchangerate_p1');//DJ_第1予約レート
		var bankAcctInfo =  record.getFieldValue('custrecord_djkk_jp_bank_acct_info');//DJ_銀行口座情報
		var estimateinfo =  record.getFieldValue('custrecord_djkk_custbody_jp_estimateinfo');//DJ_見積情報
		var message =  record.getFieldValue('custrecord_djkk_bribery_jp_message');//DJ_通信欄
		var expectedShippingDate =  record.getFieldValue('custrecord_djkk_expected_shipping_date');//DJ_出荷予定日
		var vendorComments =  record.getFieldValue('custrecord_djkk_bribery_vendor_comments');//DJ_仕入先コメント
		var exchangeRateYen =  record.getFieldValue('custrecord_dj_reserved_exchange_rate_yen');//DJ_円貨支払
		var exchangeRate =  record.getFieldValue('custrecord_djkk_reserved_exchange_rate_f');//DJ_外貨支払データ作成
		var exchangerateP2 =  record.getFieldValue('custrecord_djkk_reserved_exchangerate_p2');//DJ_第2予約レート
		var exchangerateP3 =  record.getFieldValue('custrecord_djkk_reserved_exchangerate_p3');//DJ_第3予約レート
		var project =  record.getFieldValue('custrecord_djkk_bribery_project');//DJ_プロジェクト
		var deliveryPrecautions =  record.getFieldValue('custrecord_djkk_delivery_precautions');//DJ_納品先注意事項
		var pop =  record.getFieldValue('custrecord_djkk_production_po_number');//DJ_PRODUCTION PURCHASE ORDER番号
		var language =  record.getFieldValue('custrecord_djkk_bribery_language');//DJ_言語
		var incotermsLocation =  record.getFieldValue('custrecord_djkk_br_incoterms_location');//DJ_出荷元
		var poFcCreated =  record.getFieldValue('custrecord_djkk_bribery_po_fc_created');//DJ_POプロポーザル
		var sotckSendFlag =  record.getFieldValue('custrecord_djkk_djkk_sotck_send_flag');//DJ_入力予定フラグ
		var customerPrecautions =  record.getFieldValue('custrecord_djkk_br_customer_precautions');//DJ_顧客注意事項
		
		//請求TAB
		var billaddress =  record.getFieldValue('custrecord_djkk_bribery_billaddress');//DJ_仕入先住所
		var billaddresslist =  record.getFieldValue('custrecord_djkk_bribery_billaddresslist');//DJ_仕入先住所の選択
		
		
		
		if(!isEmpty(createdfromRecognition)){
		var therecordType=nlapiLookupField('transaction', createdfromRecognition, 'recordtype');
		var	rec2 =nlapiTransformRecord(therecordType, createdfromRecognition, 'vendorcredit');
		}else{
	    var rec2 = nlapiCreateRecord('vendorcredit');
	    rec2.setFieldValue('usertotal',amount);//金額
	    rec2.setFieldValue('currency',currency);//DJ_通貨
	    rec2.setFieldValue('taxtotal',taxtotal);//DJ_税金
	    rec2.setFieldValue('subsidiary',subsidiary);//子会社
		}
		
		if(Status=='edit'){
			rec2.setFieldValue('custbody_cache_data_flag','T');//DJ_キャッシュデータフラグ			
		}		
		
		//主要情報
//		rec2.setFieldValue('customform',customform);
		rec2.setFieldValue('transactionnumber',transactionnumber);//トランザクション番号
		rec2.setFieldValue('tranid',tranid);//参照番号
		rec2.setFieldValue('entity',vendor);//仕入先 
		rec2.setFieldValue('account',account);//勘定科目 
		
		
		rec2.setFieldValue('createdfrom',createdfromRecognition);//DJ_作成元(承認用)
		
		rec2.setFieldValue('exchangerate',exchangerate);//DJ_為替レート *
		
		rec2.setFieldValue('duedate',duedate);//DJ_期日
		rec2.setFieldValue('trandate',nowDate);//日付 
		rec2.setFieldValue('postingperiod',postingperiod);//記帳期間 
		rec2.setFieldValue('memo',memo);//メモ
		rec2.setFieldValue('custbody_suitel10n_inv_closing_date',closingDate);//締日
		rec2.setFieldValue('custbody_jp_deliverydate',deliveryDate);//納期
		rec2.setFieldValue('custbody_djkk_bribery_acknowledgmentid',recId);//DJ_前払金/買掛金調整承認
		
		//分類
		
		rec2.setFieldValue('department',department);//セクション
		rec2.setFieldValue('class',class);//ブランド
		rec2.setFieldValue('location',location);//場所
		
		//その他
		rec2.setFieldValue('custbody_djkk_operation_instructions', operationInston);//DJ_検品・作業指示
		rec2.setFieldValue('custbody_djkk_inspection_finished', inspectionFinished);//DJ_検品終了希望日	
		// CH144 zheng 20230516 start
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_p1', reservedExchangerateP1);//DJ_第1予約レート
		// CH144 zheng 20230516 end
		rec2.setFieldValue('custbody_jp_bank_acct_info', bankAcctInfo);//DJ_銀行口座情報
		rec2.setFieldValue('custbody_jp_estimateinfo', estimateinfo);//DJ_見積情報
		rec2.setFieldValue('custbody_jp_message',message);//DJ_通信欄
		rec2.setFieldValue('custbody_djkk_expected_shipping_date',expectedShippingDate);//DJ_出荷予定日
		rec2.setFieldValue('custbody_djkk_vendor_comments',vendorComments );//DJ_仕入先コメント
		// CH144 zheng 20230516 start
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_yen',exchangeRateYen);//DJ_円貨支払
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_f',exchangeRate);//DJ_外貨支払データ作成
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_p2',exchangerateP2);//DJ_第2予約レート
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_p3',exchangerateP3);//DJ_第3予約レート
		// CH144 zheng 20230516 end
		rec2.setFieldValue('custbody_djkk_project',project);//DJ_プロジェクト
		rec2.setFieldValue('custbody_djkk_delivery_precautions',deliveryPrecautions);//DJ_納品先注意事項
		rec2.setFieldValue('custbody_djkk_production_po_number',pop);//DJ_PRODUCTION PURCHASE ORDER番号
		rec2.setFieldValue('custbody_djkk_language',language);//DJ_言語
		rec2.setFieldValue('custbody_djkk_incoterms_location',incotermsLocation);//DJ_出荷元
		rec2.setFieldValue('custbody_djkk_incoterms_location',poFcCreated);//DJ_POプロポーザル
		rec2.setFieldValue('custbody_djkk_sotck_send_flag',sotckSendFlag);//DJ_入力予定フラグ
		rec2.setFieldValue('custbody_djkk_customer_precautions',customerPrecautions);//DJ_顧客注意事項
		
		//請求TAB
		rec2.setFieldValue('custrecord_djkk_bribery_billaddress',billaddress);//DJ_仕入先住所
		rec2.setFieldValue('custrecord_djkk_br_billaddresslist_id',billaddresslist);//DJ_仕入先住所の選択
			
		//承認情報
		
		
		rec2.setFieldValue('custbody_djkk_trans_appr_deal_flg', record.getFieldValue('custrecord_djkk_brybery_checkbox'));
		rec2.setFieldValue('custbody_djkk_trans_appr_status', record.getFieldValue('custrecord_djkk_page_status'));
		rec2.setFieldValue('custbody_djkk_trans_appr_create_role', record.getFieldValue('custrecord_djkk_start_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr_create_user', record.getFieldValue('custrecord_djkk_start_role_name'));
		
		rec2.setFieldValue('custbody_djkk_trans_appr_dev_user', record.getFieldValue('custrecord_djkk_brybery_appr_dev_u'));
		rec2.setFieldValue('custbody_djkk_trans_appr_dev', record.getFieldValue('custrecord_djkk_brybery_tr'));
		rec2.setFieldValue('custbody_djkk_trans_appr_do_cdtn_amt', record.getFieldValue('custrecord_djkk_brybery_appr_term'));
		
		rec2.setFieldValue('custbody_djkk_trans_appr_next_role', record.getFieldValue('custrecord_djkk_next_appr_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr_user', record.getFieldValue('custrecord_djkk_next_appr_name'));
		rec2.setFieldValue('custbody_djkk_trans_appr_cdtn_amt', record.getFieldValue('custrecord_djkk_next_appr_term'));
		rec2.setFieldValue('custbody_djkk_trans_appr1_role', record.getFieldValue('custrecord_djkk_first_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr1_user', record.getFieldValue('custrecord_djkk_brybery_first_name'));
		rec2.setFieldValue('custbody_djkk_trans_appr2_role', record.getFieldValue('custrecord_djkk_end_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr2_user', record.getFieldValue('custrecord_djkk_brybery_second_name'));
		
		rec2.setFieldValue('custbody_djkk_trans_appr3_role', record.getFieldValue('custrecord_djkk_third_brybery_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr3_user', record.getFieldValue('custrecord_djkk_third_brybery_name'));
		rec2.setFieldValue('custbody_djkk_trans_appr4_role', record.getFieldValue('custrecord_djkk_last_brybery_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr4_user', record.getFieldValue('custrecord_djkk_last_brybery_name'));
		rec2.setFieldValue('custbody_djkk_approval_reset_memo', record.getFieldValue('custrecord_djkk_over_brybery_memo'));  
		rec2.setFieldValue('custbody_djkk_approval_kyaltuka_memo', record.getFieldValue('custrecord_djkk_brybery_kyaltuka_memo'));  

		nlapiLogExecution('debug','subsidiary after',subsidiary)
		//???
		if(subsidiary==SUB_NBKK || subsidiary==SUB_ULKK){
			rec2.setFieldValue('customform', '147'); //customform
		}else if(subsidiary==SUB_DPKK || subsidiary==SUB_SCETI){
			rec2.setFieldValue('customform', '134'); //customform
		}else{
			rec2.setFieldValue('customform', '142'); //customform
		}

		
		var itemCountArray=new Array();
		for(var s=1;s<count+1;s++){
			itemCountArray.push(record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', s));//line num
		}
		itemCountArray=unique(itemCountArray);
		try{
			
			if(!isEmpty(createdfromRecognition)){
				for(var s=itemCountArray.length;s>0;s--){
					rec2.removeLineItem('item', s);
				}
				}
			
		for(var i=0;i<itemCountArray.length;i++){
			var inc=1;		
			rec2.selectNewLineItem('item');
			for(var n=1;n<count+1;n++){
//				nlapiLogExecution('debug','create item','create item')
				if(record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', n)==itemCountArray[i]){
					if(inc==1){				
						nlapiLogExecution('debug','inc',inc)
						rec2.setCurrentLineItemValue('item', 'item', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_item',n));//DJ_アイテム
						rec2.setCurrentLineItemValue('item', 'location', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_location',n));//場所
						rec2.setCurrentLineItemValue('item', 'quantity', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity',n));//DJ_数量
						rec2.setCurrentLineItemValue('item', 'units', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_unity',n));//単位
						rec2.setCurrentLineItemValue('item', 'rate', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate',n));//DJ_単価/率
						nlapiLogExecution('debug','amount',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount',n))
						rec2.setCurrentLineItemValue('item', 'amount', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount',n));//DJ_金額
						rec2.setCurrentLineItemValue('item', 'taxcode', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate_code',n));//DJ_税金コード
						rec2.setCurrentLineItemValue('item', 'vendorname', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_vendor',n));//DJ_仕入先名
						//システムはitemと数量に基づいて自動的に税額を計算します
//						rec2.setCurrentLineItemValue('item', 'tax1amt', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_tax_money_brybery',n));//DJ_税額
//						rec2.setCurrentLineItemValue('item', 'grossamt', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_all_money_brybery',n));//DJ_総額
						rec2.setCurrentLineItemValue('item', 'description', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_description',n));//DJ_説明
//						rec2.setCurrentLineItemValue('item', 'department', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_department',n));//DJ_セクション
						rec2.setCurrentLineItemValue('item', 'class', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_class',n));//DJ_ブランド
						rec2.setCurrentLineItemValue('item', 'customer', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_customer',n));//DJ_顧客:プロジェクト
						rec2.setCurrentLineItemValue('item', 'isbillableT', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_isbillablet',n));//DJ_請求可能

						
						//						rec2.setCurrentLineItemValue('item', 'amortizationsched', record.getLineItemText('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationsche',n));//DJ_償却スケジュール
						rec2.setCurrentLineItemValue('item', 'amortizationsched', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_br_amortizationscheid',n));//DJ_償却スケジュールid/hidden
						
						rec2.setCurrentLineItemValue('item', 'amortizstartdate', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizstartdate',n));//DJ_償却開始
						rec2.setCurrentLineItemValue('item', 'amortizationenddate', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationendd',n));//DJ_償却終了
						rec2.setCurrentLineItemValue('item', 'amortizationresidual', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_amortizationresidual',n));//DJ_残余
						rec2.setCurrentLineItemValue('item', 'custcol_sol_fa_demo_1', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_custcol_sol_fa_demo_1',n));//DJ_資産登録
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_customs_duty_rate2',n));//DJ_予定関税(総金額2)
						rec2.setCurrentLineItemValue('item', 'custcol_4572_tax_category', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_4572_tax_category',n));//DJ_税金カテゴリ
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_po_memorandum', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_po_memorandum',n));//DJ_備忘録
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_origin', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_origin',n));//DJ_生産国
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_in_sotck_send_indicate', record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_in_sotck_send_indicate',n));//DJ_入荷予定指示済
						
						
						
					    if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number', n))){
					    	nlapiLogExecution('debug','create inventorydetail','create inventorydetail')
							var inventoryDetail=rec2.createCurrentLineItemSubrecord('item','inventorydetail');
					    	var receiptinventorynumber = record.getLineItemText('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number', n)
							inventoryDetail.selectNewLineItem('inventoryassignment');
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',receiptinventorynumber);//シリアル/ロット番号    
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_binnery_num', n));//DJ_保管棚番号
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_over_date_brybery', n));//有効期限
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_serial_number', n));//DJ_メーカーシリアル番号//
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_lot_number', n));//DJ_メーカー製造ロット番号
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_manufacturing_date', n));//DJ_製造年月日
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_probort_date', n));//DJ_出荷可能期限日
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_ware_house_num_brybery', n));//DJ_倉庫入庫番号
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_smc_num', n));//DJ_SMC番号
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_list_brybery', n));//DJ_ロットリマーク
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_memmo_brybery', n));//DJ_ロットメモ	
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity', n));//数量				    	
							inventoryDetail.commitLineItem('inventoryassignment');
							inventoryDetail.commit();
							nlapiLogExecution('debug','create inventorydetail in ','create inventorydetail in')
						}
					}else{
						if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number', n))){
							nlapiLogExecution('debug','create inventorydetailedit','create inventorydetailedit')
							var inventoryDetail=rec2.editCurrentLineItemSubrecord('item','inventorydetail');
							var receiptinventorynumber = record.getLineItemText('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number', n)
							inventoryDetail.selectNewLineItem('inventoryassignment');
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',receiptinventorynumber);//シリアル/ロット番号    
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_binnery_num', n));//DJ_保管棚番号
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_over_date_brybery', n));//有効期限
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_serial_number', n));//DJ_メーカーシリアル番号//
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_lot_number', n));//DJ_メーカー製造ロット番号
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_manufacturing_date', n));//DJ_製造年月日
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_probort_date', n));//DJ_出荷可能期限日
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_ware_house_num_brybery', n));//DJ_倉庫入庫番号
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_smc_num', n));//DJ_SMC番号
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_list_brybery', n));//DJ_ロットリマーク
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_memmo_brybery', n));//DJ_ロットメモ	
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity', n));//数量				    	
							inventoryDetail.commitLineItem('inventoryassignment');
							inventoryDetail.commit();
						}
					}
					inc++;
				}	
			}
			rec2.commitLineItem('item');
		}
		nlapiLogExecution('debug','ccostCount ',costCount)
		for(var c = 1 ; c < costCount+1 ; c++){
			nlapiLogExecution('debug','ccostCount ','in' +c);
			if(!isEmpty(createdfromRecognition)){
				rec2.selectLineItem('expense', c);
				if(rec2.getCurrentLineItemValue('expense', 'account')!=record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_account',c)){
				rec2.setCurrentLineItemValue('expense', 'account', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_account',c));//勘定科目
				}
			}else{
				rec2.selectNewLineItem('expense');
				rec2.setCurrentLineItemValue('expense', 'account', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_account',c));//勘定科目
			}
			
			rec2.setCurrentLineItemValue('expense', 'amount', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amount',c));//金額
			rec2.setCurrentLineItemValue('expense', 'taxcode', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxcode',c));//税金コード
			rec2.setCurrentLineItemValue('expense', 'taxrate1', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxrate',c));//税率
//			rec2.setCurrentLineItemValue('expense', 'tax', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_tax',c));//税額
//			rec2.setCurrentLineItemValue('expense', '', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_pst',c));//pst
//			rec2.setCurrentLineItemValue('expense', 'grossamt', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_grossamt',c));//総額
			rec2.setCurrentLineItemValue('expense', 'memo', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_memo',c));//メモ
			rec2.setCurrentLineItemValue('expense', 'department', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_department',c));//セクション
			rec2.setCurrentLineItemValue('expense', 'class', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_class',c));//ブランド
			rec2.setCurrentLineItemValue('expense', 'location', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_location',c));//場所
			rec2.setCurrentLineItemValue('expense', 'customer', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_customer',c));//顧客
			rec2.setCurrentLineItemValue('expense', 'isbillable', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_claim',c));//請求可能
//			rec2.setCurrentLineItemValue('expense', 'amortizationsched ', record.getLineItemText('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amortizatio',c));//償却スケジュール
			rec2.setCurrentLineItemValue('expense', 'amortizationsched ', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_br_cost_amortizationid',c));//償却スケジュールid/hidden
			rec2.setCurrentLineItemValue('expense', 'amortizstartdate', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizstartdate',c));//償却開始
			rec2.setCurrentLineItemValue('expense', 'amortizationenddate', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizationend',c));//償却終了
			rec2.setCurrentLineItemValue('expense', 'amortizationresidual', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_residual',c));//残余
			rec2.setCurrentLineItemValue('expense', 'custcol_4572_tax_category', record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_tax_category',c));//税金カテゴリ
			rec2.commitLineItem('expense');
		}
		nlapiLogExecution('debug','end ','end')
		}catch(e){
			nlapiLogExecution('debug', 'エラー1  ', e.message);
		} 
		
		
		var rec2id = nlapiSubmitRecord(rec2,false,true);
		nlapiLogExecution('debug', 'rec2id', rec2id);
		if(Status=='approval'){
			var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
			record.setFieldValue('custrecord_djkk_over_id',rec2id);
			nlapiSubmitRecord(record,false,true);
			nlapiSetRedirectURL('RECORD', 'vendorcredit',rec2id, 'VIEW');
		}else if(Status=='edit'){
//			try{
			var delRecord=nlapiCreateRecord('customrecord_djkk_transact_data_delete');
			delRecord.setFieldValue('custrecord_djkk_del_trantype', '前払金/買掛金調整');
			delRecord.setFieldValue('custrecord_djkk_del_recordtype', 'vendorcredit');
			delRecord.setFieldValue('custrecord_djkk_del_internalid', rec2id);
			delRecord.setFieldValue('custrecord_djkk_del_url', nlapiResolveURL('RECORD', 'vendorcredit',rec2id, 'VIEW'));
			var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
			record.setFieldValue('custrecord_djkk_over_id',rec2id);
			nlapiSubmitRecord(record,false,true);
			var delid = nlapiSubmitRecord(delRecord,false,true);
			nlapiLogExecution('debug', 'delid', delid);
			response.write(rec2id);
//			}catch(e){
//				nlapiLogExecution('debug', 'エラー  delRecord', e.message);
//			}
		}else{
			response.write(rec2id);
		}
		
	}
	}
	catch(e){
		nlapiLogExecution('debug', 'エラー', e.message);
		var record = nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',recId);
		record.setFieldValue('custrecord_djkk_bribery_error',e.message);
		nlapiSubmitRecord(record);
		response.write('異常発生:'+ e.message);
	}
}
