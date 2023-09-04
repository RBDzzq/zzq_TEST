/**
 * DJ_クレジットメモ承認画面のSL
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Aug 2022     CPC_宋
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
		
		var Status = request.getParameter('Status');
		
		var deleteRecordId = request.getParameter('deleteRecordId');
		if(!isEmpty(deleteRecordId)){
			var scheduleparams = new Array();
			scheduleparams['custscript_djkk_deleterecordtype'] = 'creditmemo';
			scheduleparams['custscript_djkk_deleterecordid'] = deleteRecordId;
			runBatch('customscript_djkk_ss_trandata_delete', 'customdeploy_djkk_ss_trandata_deleterec', scheduleparams);
		}else{							
		var record = nlapiLoadRecord('customrecord_djkk_credit_note_approval',recId);
		//20230616 add by zhou start
		if(Status=='edit'){
			var creditmemoId = record.getFieldValue('custrecord_djkk_credit_creditmemo');//クレジットメモ標準画面id
			if(!isEmpty(creditmemoId)){
				nlapiLogExecution('debug','creditmemoId',creditmemoId)
				throw nlapiCreateError('システムエラー','現在実行中のオペレータがいます。「エラーのロールバック」ボタンをクリックして異常を取り除いてから試してください',true);
			}
		}
		//20230616 add by zhou end
		var rec2 = nlapiCreateRecord('creditmemo'); //クレジットメモ
		var createdfrom =  record.getFieldValue('custrecord_djkk_credit_note_createdfrom');//作成元
				
		if(!isEmpty(createdfrom)){
			var therecordType=nlapiLookupField('transaction', createdfrom, 'recordtype');
				nlapiLogExecution('debug','createdfrom returnauthorization',createdfrom);
				nlapiLogExecution('debug','createdfrom therecordType',therecordType);
				var	rec2 =nlapiTransformRecord(therecordType, createdfrom, 'creditmemo');
		}else{
			nlapiLogExecution('debug','createdfrom empty',createdfrom)
		    var rec2 = nlapiCreateRecord('creditmemo');
		    rec2.setFieldValue('currency', record.getFieldValue('custrecord_djkk_create_note_currency')); //DJ_通貨
		    rec2.setFieldValue('subsidiary',record.getFieldValue('custrecord_djkk_create_note_subsidiary'));//子会社
		}
		
		
		if(Status=='edit'){
			rec2.setFieldValue('custbody_cache_data_flag','T');//DJ_キャッシュデータフラグ	
		}
		//主要情報
		rec2.setFieldValue('tranid',record.getFieldValue('custrecord_djkk_create_note_tranid'));//参照番号
		rec2.setFieldValue('entity',record.getFieldValue('custrecord_djkk_credit_note_customer'));//顧客
		rec2.setFieldValue('trandate',record.getFieldValue('custrecord_djkk_create_note_date'));//日付
		rec2.setFieldValue('postingperiod',record.getFieldValue('custrecord_djkk_create_postingperiod'));//記帳期間
		rec2.setFieldValue('otherrefnum',record.getFieldValue('custrecord_djkk_create_note_otherrefnum'));//発注書番号
		rec2.setFieldValue('memo',record.getFieldValue('custrecord_djkk_create_note_memo'));//メモ
		rec2.setFieldValue('custbody_djkk_creditmemo_id', recId);//DJ_クレジットメモID
		rec2.setFieldValue('createdfrom',createdfrom);//DJ_作成元(承認用)
		
		
		//メール自動送信
		
		
		
		rec2.setFieldValue('custbody_djkk_invoice_period', record.getFieldValue('custrecord_djkk_cn_is_period'));//DJ_請求書送信区分
		rec2.setFieldValue('custbody_djkk_invoice_book_site', record.getFieldValue('custrecord_djkk_cn_is_book_site'));//DJ_請求書送信先区分
		rec2.setFieldValue('custbody_djkk_invoice_book_person', record.getFieldValue('custrecord_djkk_cn_is_book_person'));//DJ_請求書送信先担当者
		rec2.setFieldValue('custbody_djkk_invoice_book_subname', record.getFieldValue('custrecord_djkk_cn_is_book_subname'));//DJ_請求書送信先会社名 (3RDパーティー)
		rec2.setFieldValue('custbody_djkk_invoice_book_person_t', record.getFieldValue('custrecord_djkk_cn_is_book_person_t'));//DJ_請求書送信先担当者(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_invoice_automatic_mailtr', record.getFieldValue('custrecord_djkk_cn_is_automatic_mailtr'));//DJ_請求書送信先メール(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_invoice_automatic_faxtrd', record.getFieldValue('custrecord_djkk_cn_is_automatic_faxtrd'));//DJ_請求書送信先FAX(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_invoice_destination_regi', record.getFieldValue('custrecord_djkk_cn_is_destination_regi'));//DJ_請求書送信先登録メモ
		
		rec2.setFieldValue('custbody_djkk_delivery_book_period', record.getFieldValue('custrecord_djkk_cn_de_period'));//DJ_価格入り納品書送信区分
		rec2.setFieldValue('custbody_djkk_delivery_book_site_fd', record.getFieldValue('custrecord_djkk_cn_de_site_fd'));//DJ_価格入り納品書送信先区分
		rec2.setFieldValue('custbody_djkk_delivery_book_person', record.getFieldValue('custrecord_djkk_cn_de_person'));//DJ_価格入り納品書送信先担当者
		rec2.setFieldValue('custbody_djkk_delivery_book_subname', record.getFieldValue('custrecord_djkk_cn_de_subname'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_delivery_book_person_t', record.getFieldValue('custrecord_djkk_cn_de_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_delivery_book_email', record.getFieldValue('custrecord_djkk_cn_de_email'));//DJ_価格入り納品書送信先メール(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_delivery_book_fax_three', record.getFieldValue('custrecord_djkk_cn_de_fax_three'));//DJ_価格入り納品書送信先FAX(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_delivery_book_memo_so', record.getFieldValue('custrecord_djkk_cn_de_memo_so'));//DJ_価格入り納品書送信先登録メモ
		
		rec2.setFieldValue('custbody_djkk_totalinv_period', record.getFieldValue('custrecord_djkk_cn_int_period'));//DJ_合計請求書送信区分
		rec2.setFieldValue('custbody_djkk_totalinv_sendtype', record.getFieldValue('custrecord_djkk_cn_int_sendtype'));//DJ_合計請求書送信先区分
		rec2.setFieldValue('custbody_djkk_totalinv_sendcharge', record.getFieldValue('custrecord_djkk_cn_int_sendcharge'));//DJ_合計請求書送信先担当者
		rec2.setFieldValue('custbody_djkk_totalinv_sendsub3rd', record.getFieldValue('custrecord_djkk_cn_int_sendsub3rd'));//DJ_合計請求書送信先会社名(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_totalinv_sendcharge3rd', record.getFieldValue('custbody_djkk_cn_int_sendcharge3rd'));//DJ_合計請求書送信先担当者(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_totalinv_sendmail3rd', record.getFieldValue('custrecord_djkk_cn_int_sendmail3rd'));//DJ_合計請求書送信先メール(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_totalinv_sendfax3rd', record.getFieldValue('custrecord_djkk_cn_int_sendfax3rd'));//DJ_合計請求書送信先FAX(3RDパーティー)
		rec2.setFieldValue('custbody_djkk_totalinv_sendmemo', record.getFieldValue('custrecord_djkk_cn_int_sendmemo'));//DJ_合計請求書送信先登録メモ
		
		
		
		
//		//出荷tab
//		record.setFieldValue('shipcarrier', nlapiGetFieldValue('custrecord_djkk_create_note_operator')); //DJ_配送業者
//		record.setFieldValue('shipmethod', nlapiGetFieldValue('custrecord_djkk_create_note_method')); //DJ_配送方法
//		record.setFieldValue('shippingtaxcode', nlapiGetFieldValue('custrecord_djkk_create_note_tax_code')); //DJ_配送料の税金コード
//		record.setFieldValue('handlingtaxcode', nlapiGetFieldValue('custrecord_djkk_create_note_fee_code')); //DJ_手数料の税金コード
//		record.setFieldValue('shippingcost', nlapiGetFieldValue('custrecord_djkk_create_note_materials')); //DJ_配送料
//		record.setFieldValue('handlingcost', nlapiGetFieldValue('custrecord_djkk_create_note_by_hand')); //DJ_手数料
//		record.setFieldValue('custbody_djkk_deliverytimedesc', nlapiGetFieldValue('custrecord_djkk_create_note_medesc')); //DJ_納入時間帯記述
//		record.setFieldValue('custbody_djkk_deliverynotregistflg', nlapiGetFieldValue('custrecord_djkk_create_note_registflg')); //DJ_納入先未登録フラグ
//		//会計tab
//		record.setFieldValue('account', nlapiGetFieldValue('custrecord_djkk_create_note_accounts')); //DJ_勘定科目
//		record.setFieldValue('currency', nlapiGetFieldValue('custrecord_djkk_create_note_currency')); //DJ_通貨
//		record.setFieldValue('exchangerate', nlapiGetFieldValue('custrecord_djkk_create_note_exchange_rat')); //DJ_為替レート
//		record.setFieldValue('totalcostestimate', nlapiGetFieldValue('custrecord_djkk_create_note_cost')); //DJ_予測拡張コスト
//		record.setFieldValue('estgrossprofit', nlapiGetFieldValue('custrecord_djkk_create_note_profit')); //DJ_見積総利益
//		record.setFieldValue('estgrossprofitpercent', nlapiGetFieldValue('custrecord_djkk_create_note_gross_profit')); //DJ_見積総利益の割合
		//出荷tab
		rec2.setFieldValue('shipcarrier', record.getFieldValue('custrecord_djkk_create_note_operator')); //DJ_配送業者
		rec2.setFieldValue('shipmethod', record.getFieldValue('custrecord_djkk_create_note_method')); //DJ_配送方法
		rec2.setFieldValue('shippingtaxcode', record.getFieldValue('custrecord_djkk_create_note_tax_code')); //DJ_配送料の税金コード
		rec2.setFieldValue('handlingtaxcode', record.getFieldValue('custrecord_djkk_create_note_fee_code')); //DJ_手数料の税金コード
		rec2.setFieldValue('shippingcost', record.getFieldValue('custrecord_djkk_create_note_materials')); //DJ_配送料
		rec2.setFieldValue('handlingcost', record.getFieldValue('custrecord_djkk_create_note_by_hand')); //DJ_手数料
		rec2.setFieldValue('custbody_djkk_deliverytimedesc', record.getFieldValue('custrecord_djkk_create_note_medesc')); //DJ_納入時間帯記述
		rec2.setFieldValue('custbody_djkk_deliverynotregistflg', record.getFieldValue('custrecord_djkk_create_note_registflg')); //DJ_納入先未登録フラグ
		//会計tab
		rec2.setFieldValue('account', record.getFieldValue('custrecord_djkk_create_note_accounts')); //DJ_勘定科目
//		rec2.setFieldValue('currency', record.getFieldValue('custrecord_djkk_create_note_currency')); //DJ_通貨
		rec2.setFieldValue('exchangerate', record.getFieldValue('custrecord_djkk_create_note_exchange_rat')); //DJ_為替レート
		rec2.setFieldValue('totalcostestimate', record.getFieldValue('custrecord_djkk_create_note_cost')); //DJ_予測拡張コスト
		rec2.setFieldValue('estgrossprofit', record.getFieldValue('custrecord_djkk_create_note_profit')); //DJ_見積総利益
		rec2.setFieldValue('estgrossprofitpercent', record.getFieldValue('custrecord_djkk_create_note_gross_profit')); //DJ_見積総利益の割合
	
		//販売情報
		rec2.setFieldValue('salesrep',record.getFieldValue('custrecord_djkk_create_note_salesrep'));//DJ_営業担当者
		rec2.setFieldValue('saleseffectivedate',record.getFieldValue('custrecord_djkk_create_saleseffectivedat'));//DJ_コミッション基準日
		
		//承認情報
		rec2.setFieldValue('custbody_djkk_trans_appr_deal_flg',record.getFieldValue('custrecord_djkk_create_note_flg'));// DJ_承認処理フラグ
		rec2.setFieldValue('custbody_djkk_trans_appr_status',record.getFieldValue('custrecord_djkk_create_note_status'));//DJ_承認ステータス
		rec2.setFieldValue('custbody_djkk_trans_appr_create_role',record.getFieldValue('custrecord_djkk_create_note_createrole'));//DJ_作成ロール
		rec2.setFieldValue('custbody_djkk_trans_appr_create_user',record.getFieldValue('custrecord_djkk_create_note_createuser'));//DJ_作成者
		rec2.setFieldValue('custbody_djkk_trans_appr_dev',record.getFieldValue('custrecord_djkk_create_note_oper_roll'));//DJ_承認操作ロール
		rec2.setFieldValue('custbody_djkk_trans_appr_dev_user',record.getFieldValue('custrecord_djkk_create_note_acknowledge'));//DJ_承認操作者
		rec2.setFieldValue('custbody_djkk_trans_appr_do_cdtn_amt',record.getFieldValue('custrecord_djkk_create_note_opera_condit'));//DJ_承認操作条件
		
		rec2.setFieldValue('custbody_djkk_trans_appr_next_role',record.getFieldValue('custrecord_djkk_create_note_autho_role'));//DJ_次の承認ロール
		rec2.setFieldValue('custbody_djkk_trans_appr_user',record.getFieldValue('custrecord_djkk_create_note_next_approve'));//DJ_次の承認者
		rec2.setFieldValue('custbody_djkk_trans_appr_cdtn_amt',record.getFieldValue('custrecord_djkk_create_note_appro_criter'));//DJ_次の承認条件
		rec2.setFieldValue('custbody_djkk_trans_appr1_role',record.getFieldValue('custrecord_djkk_create_note_first_role'));//DJ_第一承認ロール
		rec2.setFieldValue('custbody_djkk_trans_appr1_user',record.getFieldValue('custrecord_djkk_create_note_first_user'));//DJ_第一承認者
		rec2.setFieldValue('custbody_djkk_trans_appr2_role',record.getFieldValue('custrecord_djkk_create_note_second_role'));//DJ_第二承認ロール
		rec2.setFieldValue('custbody_djkk_trans_appr2_user',record.getFieldValue('custrecord_djkk_create_note_second_user'));//DJ_第二承認者
		
		rec2.setFieldValue('custbody_djkk_trans_appr3_role',record.getFieldValue('custrecord_djkk_create_note_third_role'));//DJ_第三承認ロール
		rec2.setFieldValue('custbody_djkk_trans_appr3_user',record.getFieldValue('custrecord_djkk_create_note_third_user'));//DJ_第三承認者
		rec2.setFieldValue('custbody_djkk_trans_appr4_role',record.getFieldValue('custrecord_djkk_create_note_fourth_role'));//DJ_第四承認ロール
		rec2.setFieldValue('custbody_djkk_trans_appr4_user',record.getFieldValue('custrecord_djkk_create_note_fourth_uesr'));//DJ_第四承認者
		rec2.setFieldValue('custbody_djkk_approval_reset_memo',record.getFieldValue('custrecord_djkk_create_note_rever_memo'));//DJ_承認差戻メモ
		rec2.setFieldValue('custbody_djkk_approval_kyaltuka_memo',record.getFieldValue('custrecord_djkk_approval_kyaltuka_memo')); //DJ_承認却下メモ // 20230522 add by zhou
		//分類
//		rec2.setFieldValue('subsidiary',record.getFieldValue('custrecord_djkk_create_note_subsidiary'));//子会社
		rec2.setFieldValue('department',record.getFieldValue('custrecord_djkk_create_note_department'));//セクション
		rec2.setFieldValue('bulkprocsubmission',record.getFieldValue('custrecord_djkk_create_note_bulkprocsubm'));//送信ID
		// CH144 zheng 20230516 start
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_s1',record.getFieldValue('custrecord_djkk_create_note_rate_s1'));//DJ_第1予約レート
		// CH144 zheng 20230516 end
		rec2.setFieldValue('custbody_djkk_exsystem_opc_flg',record.getFieldValue('custrecord_djkk_create_note_opc_flg'));//DJ_前払金受領済フラグ
		rec2.setFieldValue('custbody_djkk_exsystem_send_date_time',record.getFieldValue('custrecord_djkk_create_note_date_time'));//DJ_外部システム送信日時
		rec2.setFieldValue('custbody_4392_includeids',record.getFieldValue('custrecord_djkk_create_note_includeids'));//締め請求書に含める
		rec2.setFieldValue('custbody_djkk_company_sales',record.getFieldValue('custrecord_djkk_create_note_sales'));//DJ_社販対象
		rec2.setFieldValue('custbody_djkk_end_user',record.getFieldValue('custrecord_djkk_create_note_end_user'));//DJ_エンドユーザー
		rec2.setFieldValue('custbody_djkk_delivery_destination',record.getFieldValue('custrecord_djkk_create_note_destination'));//DJ_納品先
		rec2.setFieldValue('custbody_djkk_payment_conditions',record.getFieldValue('custrecord_djkk_create_note_conditions'));//DJ_支払条件
		rec2.setFieldValue('custbody_djkk_gst_registration',record.getFieldValue('custrecord_djkk_create_note_registration'));//DJ_GST登録番号
		rec2.setFieldValue('custbody_djkk_deliverynote',record.getFieldValue('custrecord_djkk_create_note_deliverynote'));//DJ_納品書自動送信
		rec2.setFieldValue('custbody_djkk_shipping_instructions_f',record.getFieldValue('custrecord_djkk_create_note_instructions'));//DJ_出荷指示
		rec2.setFieldValue('custbody_djkk_shipment_person',record.getFieldValue('custrecord_djkk_create_note_person'));//DJ_出荷担当者
		rec2.setFieldValue('location',record.getFieldValue('custrecord_djkk_create_note_location'));//場所
		rec2.setFieldValue('custbody_djkk_paymentmethodtyp',record.getFieldValue('custrecord_djkk_create_note_methodtyp'));//DJ_支払方法区分
		rec2.setFieldValue('custbody_djkk_deliveryruledesc',record.getFieldValue('custrecord_djkk_create_note_deliveryrule'));//DJ_納入先毎在庫引当条件
		rec2.setFieldValue('custbody_djkk_cautiondesc',record.getFieldValue('custrecord_djkk_create_note_cautiondesc'));//DJ_注意事項
		rec2.setFieldValue('custbody_djkk_wmsmemo1',record.getFieldValue('custrecord_djkk_create_note_wmsmemo1'));//DJ_倉庫向け備考１
		rec2.setFieldValue('custbody_djkk_deliverermemo1',record.getFieldValue('custrecord_djkk_create_note_deliverermem'));//DJ_運送会社向け備考
		rec2.setFieldValue('custbody_djkk_deliverynotememo',record.getFieldValue('custrecord_djkk_create_note_deliverymemo'));//DJ_納品書備考
		rec2.setFieldValue('custbody_djkk_orderrequestid',record.getFieldValue('custrecord_djkk_create_note_orderrequeid'));//DJ_注文依頼ID
		rec2.setFieldValue('custbody_djkk_netsuitetransflg',record.getFieldValue('custrecord_djkk_create_note_netflg'));//DJ_NETSUITE連携フラグ
		rec2.setFieldValue('custbody_djkk_shippinginstructdt',record.getFieldValue('custrecord_djkk_create_note_nstructdt'));//DJ_出荷指示日時
		rec2.setFieldValue('custbody_djkk_customerorderno',record.getFieldValue('custrecord_djkk_create_note_merorderno'));//DJ_先方発注番号
		rec2.setFieldValue('custbody_djkk_consignmentbuyingsaleflg',record.getFieldValue('custrecord_djkk_create_note_ingsaleflg'));//DJ_消化仕入売上フラグ
		rec2.setFieldValue('custbody_djkk_delivery_hopedate',record.getFieldValue('custrecord_djkk_create_note_hopedate'));//DJ_納品希望日
		rec2.setFieldValue('class',record.getFieldValue('custrecord_djkk_create_note_class'));//ブランド
		rec2.setFieldValue('custbody_djkk_wmsmemo2',record.getFieldValue('custrecord_djkk_create_note_wmsmemo2'));//DJ_倉庫向け備考２
		rec2.setFieldValue('custbody_djkk_wmsmemo3',record.getFieldValue('custrecord_djkk_create_note_wmsmemo3'));//DJ_倉庫向け備考3
		rec2.setFieldValue('custbody_djkk_warehouse_sent',record.getFieldValue('custrecord_djkk_create_note_send'));//DJ_倉庫送信済み
		rec2.setFieldValue('custbody_djkk_finetkanaofferconame',record.getFieldValue('custrecord_djkk_create_note_coname'));//DJ_FINETカナ提供企業名
		rec2.setFieldValue('custbody_djkk_finetkanaoffercooffice',record.getFieldValue('custrecord_djkk_create_note_cooffice'));//DJ_FINETカナ提供企業参照事業所名
		rec2.setFieldValue('custbody_djkk_finetkanacustomername',record.getFieldValue('custrecord_djkk_create_note_stomername'));//DJ_FINETカナ社名・店名・取引先名
		rec2.setFieldValue('custbody_djkk_finetkanacustomeraddress',record.getFieldValue('custrecord_djkk_create_note_address'));//DJ_FINETカナ住所
		rec2.setFieldValue('custrecord_djkk_cn_istotal_flag',record.getFieldValue('custrecord_djkk_create_note_invflg'));//DJ_合計請求書作成済みフラグ
		rec2.setFieldValue('custbody_djkk_rios_base_date',record.getFieldValue('custrecord_djkk_create_note_base_date'));//DJ_RIOS基準日
		rec2.setFieldValue('custbodycustbody_djkk_netsuitetransdt',record.getFieldValue('custrecord_djkk_create_note_netsuitetran'));//DJ_NETSUITE連携日時
		rec2.setFieldValue('custbody_djkk_language',record.getFieldValue('custrecord_djkk_create_note_language'));//DJ_言語
		
		
		rec2.setFieldValue('custbody_suitel10n_jp_ids_date',record.getFieldValue('custrecord_djkk_create_note_ids_date'));//締め請求書期日
		rec2.setFieldValue('custbody_jp_invoice_summary_due_date',record.getFieldValue('custrecord_djkk_create_note_due_date'));//INVOICE SUMMARY DUE DATE
		rec2.setFieldValue('custbody_djkk_deliverermemo2',record.getFieldValue('custrecord_djkk_create_note_delivererme2'));//DJ_運送会社向け備考2
		// CH144 zheng 20230516 start
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_yen',record.getFieldValue('custrecord_djkk_create_note_rate_yen'));//DJ_円貨支払
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_s2',record.getFieldValue('custrecord_djkk_create_note_rate_s2'));//DJ_第2予約レート
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_s3',record.getFieldValue('custrecord_djkk_create_note_rate_s3'));//DJ_第3予約レート
		//rec2.setFieldValue('custbody_dj_reserved_exchange_rate_f',record.getFieldValue('custrecord_djkk_create_note_rate_f'));//DJ_外貨支払データ作成
		// CH144 zheng 20230516 end
		rec2.setFieldValue('custbody_djkk_reference_delive',record.getFieldValue('custrecord_djkk_create_note_delive'));//DJ_納期回答備考欄
		rec2.setFieldValue('custbody_djkk_reference_column',record.getFieldValue('custrecord_djkk_create_note_column'));//DJ_納品書備考欄
		rec2.setFieldValue('custbody_djkk_request_reference_bar',record.getFieldValue('custrecord_djkk_create_note_reference'));//DJ_請求書備考欄
		rec2.setFieldValue('custbody_djkk_annotation_day',record.getFieldValue('custrecord_djkk_create_note_day'));//注文日
		rec2.setFieldValue('custbody_15699_exclude_from_ep_process',record.getFieldValue('custrecord_djkk_create_note_process'));//EXCLUDE FROM ELECTRONIC BANK PAYMENTS PROCESSING
		rec2.setFieldValue('custbody_djkk_delivery_precautions',record.getFieldValue('custrecord_djkk_create_note_precautions'));//DJ_納品先注意事項
		rec2.setFieldValue('custbody_djkk_customer_precautions',record.getFieldValue('custrecord_djkk_create_note_precautionss'));//DJ_顧客注意事項
		rec2.setFieldValue('custbody_djkk_shipping_instructions',record.getFieldValue('custrecord_djkk_create_note_instructflg'));//DJ_出荷指示済み
		rec2.setFieldValue('custbody_djkk_delivery_address',record.getFieldValue('custrecord_djkk_create_note_deliveryadd'));//DJ_納品先住所
		rec2.setFieldValue('custbody_djkk_customer_address',record.getFieldValue('custrecord_djkk_create_note_customeradd'));//DJ_顧客住所
		rec2.setFieldValue('custbody_djkk_sendmail_ready',record.getFieldValue('custrecord_djkk_create_note_ready'));// DJ_準備完了
		rec2.setFieldValue('custbody_djkk_shippinginfodestemail',record.getFieldValue('custrecord_djkk_create_note_destemail'));//DJ_出荷案内送付先メール
		rec2.setFieldValue('custbody_djkk_shippinginfodestfax',record.getFieldValue('custrecord_djkk_create_note_fax'));//DJ_出荷案内送付先FAX
		rec2.setFieldValue('custbody_djkk_shippinginfodestname',record.getFieldValue('custrecord_djkk_create_note_destname'));//DJ_出荷案内送付先宛名
		rec2.setFieldValue('custbody_djkk_shippinginfodesttyp',record.getFieldValue('custrecord_djkk_create_note_desttyp'));//DJ_出荷案内送付先区分
		rec2.setFieldValue('custbody_djkk_shippinginfosendtyp',record.getFieldValue('custrecord_djkk_create_note_sendtyp'));//DJ_出荷案内送信区分

		var subsidiary = record.getFieldValue('custrecord_djkk_create_note_subsidiary')
		if(subsidiary==SUB_NBKK || subsidiary==SUB_ULKK){
			rec2.setFieldValue('customform', '120'); //customform
		}else if(subsidiary==SUB_DPKK || subsidiary==SUB_SCETI){
			rec2.setFieldValue('customform', '112'); //customform
		}
		if(Status=='edit'){
			rec2.setFieldValue('custbody_cache_data_flag','T');//DJ_キャッシュデータフラグ			
		}

		var count=record.getLineItemCount('recmachcustrecord_djkk_credit_note_approval');  //明細
		var itemCountArray=new Array();
		for(var s=1;s<count+1;s++){
			itemCountArray.push(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id', s));//line num
		}
		itemCountArray=unique(itemCountArray);
		if(!isEmpty(createdfrom)){
			for(var s=itemCountArray.length;s>0;s--){
				rec2.removeLineItem('item', s);
			}
		}
		for(var i=0;i<itemCountArray.length;i++){
			var inc=1;
			rec2.selectNewLineItem('item');
			for(var n=1;n<count+1;n++){
				if(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id', n)==itemCountArray[i]){
					if(inc==1){
						rec2.setCurrentLineItemValue('item', 'item', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_create_note_detail_item',n));//item
						rec2.setCurrentLineItemValue('item', 'quantity', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantity',n));//数量
						rec2.setCurrentLineItemValue('item', 'units', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_unit',n));//単位
						rec2.setCurrentLineItemValue('item', 'description', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_explain',n));//DJ_説明
						//20230522 changed by zhou start
						//カスタムレコードはidが'-1'のオプションをサポートしていません
						var priceCode =  record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_grid_level',n);
						if(!isEmpty(priceCode)){
							rec2.setCurrentLineItemValue('item', 'price',priceCode);//DJ_価格水準
						}else{
							rec2.setCurrentLineItemValue('item', 'price',-1);//DJ_価格水準
						}
						//20230522 changed by zhou end
						rec2.setCurrentLineItemValue('item', 'rate', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_rate',n));//DJ_単価/率
						rec2.setCurrentLineItemValue('item', 'amount', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_amount',n));//DJ_金額
						rec2.setCurrentLineItemValue('item', 'taxcode', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_taxcode',n));//DJ_税金コード
						rec2.setCurrentLineItemValue('item', 'taxrate1', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_rate',n));//DJ_税率
						rec2.setCurrentLineItemValue('item', 'grossamt', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_total',n));//DJ_総額
						rec2.setCurrentLineItemValue('item', 'tax1amt', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_amount',n));//DJ_税額
						rec2.setCurrentLineItemValue('item', 'costestimatetype', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_type',n));//DJ_原価見積の種類
						rec2.setCurrentLineItemValue('item', 'costestimate', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_expansion_cost',n));//DJ_予測拡張コスト
						rec2.setCurrentLineItemValue('item', 'estgrossprofit', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_see_profit',n));//DJ_見積総利益
						rec2.setCurrentLineItemValue('item', 'estgrossprofitpercent', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_gross_profit',n));//DJ_見積総利益の割合
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_automatic_allocation', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_priming',n));//DJ_自動引当
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_customer_order_number', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custnum',n));//DJ_顧客の発注番号
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_temperature', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_temperature',n));//DJ_温度
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_testbook_supplement', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_test_report',n));//DJ_試験書添付
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_sample_type', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_sample_type',n));//DJ_サンプル種別
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_rate_informatio', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_informatio',n));//DJ_レート情報
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_commodity_english', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_english',n));//DJ_商品英語名
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_charge_number', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_charge_number',n));//DJ_荷数				
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_ampm', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_ampm',n));//DJ_AM・PM
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_specifications', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_specifications',n));//DJ_規格
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_included_document_flag', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_document_flag',n));//DJ_同梱書類フラグ
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_perunitquantity', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_perunitquantity',n));//DJ_入数
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_casequantity', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_casequantity',n));//DJ_ケース数
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_quantity', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantitys',n));//DJ_バラ数
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_deliverytemptyp', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverytemptyp',n));//DJ_配送温度区分
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_nextshipmentdesc', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nextshipmentdesc',n));//DJ_欠品次回出荷予定記述
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_deliverynotememo', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverynotememo',n));//DJ_納品書備考
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_orderrequestid', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestid',n));//DJ_注文依頼ID
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_orderrequestlineno', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestlinen',n));//DJ_依頼明細行番号
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_orderrequestquantity', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestquant',n));//DJ_依頼数量
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_partshortagetyp', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_partshortagetyp',n));//DJ_部分欠品区分
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_custody_item', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custody_item',n));//DJ_預かりアイテム
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_wms_line_memo', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_memo',n));//DJ_倉庫向け明細備考
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_finetkanaitemdescription', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_description',n));//DJ_FINETカナ商品名
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_orderrequestdivideflg', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_divideflg',n));//DJ_依頼分割済フラグ
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_nuclide', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nuclide',n));//DJ_2_核種
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_rios_user_num', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_user_num',n));//DJ_RIOSユーザ管理番号
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_rios_user_remark', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_remark',n));//DJ_RIOSユーザ備考
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_item_code', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_item_code',n));//DJ_アイテム(コード)
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_orderdetailtyp', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderdetailtyp',n));//DJ_注文明細状態区分
						rec2.setCurrentLineItemValue('item', 'custcol_9572_dd_file_format', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_file_format',n));//DJ_口座引落ファイル・フォーマット
						rec2.setCurrentLineItemValue('item', 'custcolcustbody_djkk_quoted_amount', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quoted_amount',n));//DJ_代引金額(佐川）
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_payment_delivery', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_delivery',n));//DJ_配送指示時の納品書添付
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_receipt_printing', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_printing',n));//DJ_受領書印刷
						rec2.setCurrentLineItemValue('item', 'custcol_djkk_sample_category', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_category',n));//DJ_サンプル品カテゴリ
						// changed by song add 20230612 start
						rec2.setCurrentLineItemValue('item', 'location', record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_location',n));//DJ_場所
						// changed by song add 20230612 end

					if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n))
							||!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail', n))){
						
						var inventoryDetail=rec2.createCurrentLineItemSubrecord('item','inventorydetail');
						inventoryDetail.selectNewLineItem('inventoryassignment');												
						if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n))){
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n));
				    	}else{
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail', n));
				    	}
						inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_shednum', n)); //DJ_保管棚
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_date', n));//DJ_有効期限
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot', n));//DJ_メーカー製造ロット番号
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_serial', n));//DJ_メーカーシリアル番号
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_manufacture_date', n));//DJ_製造年月日
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_probably_date', n)); //DJ_残出荷可能期間/DJ_出荷可能期限日
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_warehouse_no', n));//DJ_倉庫入庫番号
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_smc_num', n)); //DJ_SMC番号
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_remark', n)); //DJ_ロットリマーク
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_memo', n)); //DJ_ロットメモ
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_inventory_quantit', n)); //	DJ_在庫詳細明細行数量
				    						    	
						inventoryDetail.commitLineItem('inventoryassignment');
						inventoryDetail.commit();
					}
					}else{
						if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n))
								||!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail', n))){
							var inventoryDetail=rec2.createCurrentLineItemSubrecord('item','inventorydetail');
							inventoryDetail.selectNewLineItem('inventoryassignment');												
							if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n))){
					    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id', n));
					    	}else{
					    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail', n));
					    	}
							inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_shednum', n)); //DJ_保管棚
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_date', n));//DJ_有効期限
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot', n));//DJ_メーカー製造ロット番号
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_serial', n));//DJ_メーカーシリアル番号
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_manufacture_date', n));//DJ_製造年月日
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_probably_date', n)); //DJ_残出荷可能期間/DJ_出荷可能期限日
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_warehouse_no', n));//DJ_倉庫入庫番号
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_smc_num', n)); //DJ_SMC番号
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_remark', n)); //DJ_ロットリマーク
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_memo', n)); //DJ_ロットメモ
					    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_inventory_quantit', n)); //	DJ_在庫詳細明細行数量
					    						    	
							inventoryDetail.commitLineItem('inventoryassignment');
							inventoryDetail.commit();
						}		
					}
					inc++;
				}	
				
			}
			rec2.commitLineItem('item');
		}
		var rec2id = nlapiSubmitRecord(rec2,false,true);
		if(Status=='approval'){
			nlapiSubmitField('customrecord_djkk_credit_note_approval',recId, 'custrecord_djkk_credit_creditmemo', rec2id); //DJ_クレジットメモ
			nlapiSubmitField('customrecord_djkk_credit_note_approval',recId, 'custrecord_djkk_credit_creat_status', 1); //DJ_クレジットメモ作成ステータス
			nlapiSetRedirectURL('RECORD', 'creditmemo',rec2id, 'VIEW');
		}
		if(Status=='edit'){
			nlapiSubmitField('customrecord_djkk_credit_note_approval',recId, 'custrecord_djkk_credit_creditmemo', rec2id);//DJ_クレジットメモ 20230616 add by zhou
//			nlapiSubmitField('customrecord_djkk_credit_note_approval',recId, 'custrecord_djkk_credit_note_edit_status', rec2id);//DJ_実行ステータス 
			var delRecord=nlapiCreateRecord('customrecord_djkk_transact_data_delete');
			delRecord.setFieldValue('custrecord_djkk_del_trantype', 'クレジットメモ');
			delRecord.setFieldValue('custrecord_djkk_del_recordtype', 'creditmemo');
			delRecord.setFieldValue('custrecord_djkk_del_internalid', rec2id);
			delRecord.setFieldValue('custrecord_djkk_del_url', nlapiResolveURL('RECORD', 'creditmemo',rec2id, 'VIEW'));
			nlapiSubmitRecord(delRecord);
		}
		response.write(rec2id);
	}
	}
	catch(e){
	    nlapiLogExecution('debug', 'エラー', e);
		nlapiLogExecution('debug', 'エラー', e.message);
		//20230522 changed by zhou start  running error : upload to the custrecord
//		nlapiSubmitField('customrecord_djkk_credit_note_approval',recId, 'custrecord_djkk_credit_creat_status', 2); //DJ_クレジットメモ作成ステータス
//		response.write('F');	
		var record = nlapiLoadRecord('customrecord_djkk_credit_note_approval',recId);
		record.setFieldValue('custrecord_djkk_create_note_error',e.message);	
		nlapiSubmitRecord(record, false, true);		
		response.write('異常発生:'+ e.message);
		//20230522 changed by zhou end
		
	}
}