/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([ 'N/search', 'N/record', 'N/format' ],

function(search, record, format) {
	
	/**
	 * ファイルキャビネット内部ID
	 */
	function fileCabinetId(key) {

		var fileCabinetObj = {

			// DJ_EDI
			'dj_edi' : 336,
			// DJ_EDI JRAM
			'dj_edi_jram' : 337,
			// DJ_EDI JRAM bk
			'dj_edi_jram_bk' : 338,
			// DJ_EDI JRAM error
			'dj_edi_jram_error' : 339,
			// DJ_EDI RIOS
			'dj_edi_rios' : 340,
			// DJ_EDI RIOS 納入済データ送信
			'dj_edi_rios_delivery_data_snd' : 341,
			// DJ_EDI RIOS 納入予定データ送信
			'dj_edi_rios_delivery_Schedule_data_snd' : 342,
			// DJ_EDI RIOS 注文受信
			'dj_edi_rios_so_inv' : 343,
			// DJ_EDI RIOS 注文受信 bk
			'dj_edi_rios_bk' : 344,
			// DJ_EDI RIOS 注文受信 error
			'dj_edi_rios_error' : 345,
			// DJ_エクセル
			'dj_excel' : 346,
			// DJ_エクセル 基本パターン(NBKK) FS RE
			'dj_excel_nbkk_fs_re' : 347,
			// DJ_エクセル 基本＋価格提案記入追加＋追加希望項目(NBKK) RE
			'dj_excel_nbkk_re_aps_ahi' : 348,
			// DJ_エクセル 即引き用(NBKK) RE
			'dj_excel_nbkk_re_immediate' : 349,
			// DJ_エクセル 基本＋追加希望項目 + 価格提案記入追加(UL)
			'dj_excel_ul_aps_ahi' : 350,
			// DJ_エクセル 基本パターン(UL)
			'dj_excel_ul_fs_re' : 351,
			// DJ_修理品PDF出力
			'dj_repair_goods_pdf' : 352,
			// DJ_修理品納品書＆請求書PDF出力
			'dj_delivery_inv_pdf' : 353,
			// DJ_到着荷物更新（受領）出力
			'dj_receipt_update' : 354,
			// DJ_実地棚卸
			'dj_actual_inventory' : 355,
			// DJ_配送伝票発行
			'dj_delivery_slip_issue' : 356,
			// DJ_預かり在庫配送伝票
			'dj_deposit_stock_delivery_slip' : 357,
			// EDIデータ_ケイヒン
			'edi_data_keihin' : 358,
			// EDIデータ_ケイヒン done
			'edi_data_keihin_done' : 359,
			// EDIデータ_ケイヒン processing
			'edi_data_keihin_processing' : 360,
			// EDIデータ_ケイヒン bak
			'edi_data_keihin_bak' : 361,
			// EDIデータ_ケイヒン raw
			'edi_data_keihin_raw' : 362,
			// EDIデータ_ケイヒン error
			'edi_data_keihin_error' : 363,
			// FBデータ
			'fb_data' : 364,
			// Invoice Summaries
			'invoice_summaries' : 209,
			// Invoice Summaries DENISファーマ株式会社
			'invoice_summaries_denis_company' : 379,
			// Invoice Summaries 関連会社２
			'invoice_summaries_company2' : 380,
			// Invoice Summaries 関連会社１
			'invoice_summaries_company1' : 381,
			// Printed Purchase Orders
			'printed_purchase_orders' : 208,
			// Printed Purchase Orders DENISファーマ株式会社
			'printed_purchase_orders_denis_company' : 382,
			// Printed Purchase Orders 関連会社２
			'printed_purchase_orders_company2' : 383,
			// Printed Purchase Orders 関連会社１
			'printed_purchase_orders_company1' : 384,
			// SC課FCレポート
			'fc_report' : 365,
			// カスタム入金データ
			'custom_deposit_data' : 366,
			// ケイヒン倉庫出荷指示
			'keihin_shipping' : 367,
			// セールスレポート
			'sales_report' : 368,
			// 仕入先返品(輸入)PDF
			'import_pdf' : 369,
			// 倉庫移動指示リスト
			'warehouse_list' : 370,
			// 倉庫移動指示
			'Warehouse_move' : 371,
			// 入荷送信PDF
			'incoming_pdf' : 372,
			// 合計請求書
			'total_inv' : 373,
			// 合計請求書出力ファイル
			'total_inv_output_file' : 374,
			// 営業計画情報レポート
			'plan_report' : 375,
			// 在庫レポート
			'inventory_report' : 376,
			// 場所/保管棚バーコード
			'location_storage_barcode' : 377,
			// 送信
			'snd_mail' : 378,
			// URL
			'url_header' : 5722722
		};
		
		return fileCabinetObj[key];
		
	}

	return {
		fileCabinetId : fileCabinetId,
	};

});
