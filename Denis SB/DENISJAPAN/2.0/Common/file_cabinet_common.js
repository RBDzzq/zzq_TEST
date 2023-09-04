/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([ 'N/search', 'N/record', 'N/format' ],

function(search, record, format) {
	
	/**
	 * �t�@�C���L���r�l�b�g����ID
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
			// DJ_EDI RIOS �[���σf�[�^���M
			'dj_edi_rios_delivery_data_snd' : 341,
			// DJ_EDI RIOS �[���\��f�[�^���M
			'dj_edi_rios_delivery_Schedule_data_snd' : 342,
			// DJ_EDI RIOS ������M
			'dj_edi_rios_so_inv' : 343,
			// DJ_EDI RIOS ������M bk
			'dj_edi_rios_bk' : 344,
			// DJ_EDI RIOS ������M error
			'dj_edi_rios_error' : 345,
			// DJ_�G�N�Z��
			'dj_excel' : 346,
			// DJ_�G�N�Z�� ��{�p�^�[��(NBKK) FS RE
			'dj_excel_nbkk_fs_re' : 347,
			// DJ_�G�N�Z�� ��{�{���i��ċL���ǉ��{�ǉ���]����(NBKK) RE
			'dj_excel_nbkk_re_aps_ahi' : 348,
			// DJ_�G�N�Z�� �������p(NBKK) RE
			'dj_excel_nbkk_re_immediate' : 349,
			// DJ_�G�N�Z�� ��{�{�ǉ���]���� + ���i��ċL���ǉ�(UL)
			'dj_excel_ul_aps_ahi' : 350,
			// DJ_�G�N�Z�� ��{�p�^�[��(UL)
			'dj_excel_ul_fs_re' : 351,
			// DJ_�C���iPDF�o��
			'dj_repair_goods_pdf' : 352,
			// DJ_�C���i�[�i����������PDF�o��
			'dj_delivery_inv_pdf' : 353,
			// DJ_�����ו��X�V�i��́j�o��
			'dj_receipt_update' : 354,
			// DJ_���n�I��
			'dj_actual_inventory' : 355,
			// DJ_�z���`�[���s
			'dj_delivery_slip_issue' : 356,
			// DJ_�a����݌ɔz���`�[
			'dj_deposit_stock_delivery_slip' : 357,
			// EDI�f�[�^_�P�C�q��
			'edi_data_keihin' : 358,
			// EDI�f�[�^_�P�C�q�� done
			'edi_data_keihin_done' : 359,
			// EDI�f�[�^_�P�C�q�� processing
			'edi_data_keihin_processing' : 360,
			// EDI�f�[�^_�P�C�q�� bak
			'edi_data_keihin_bak' : 361,
			// EDI�f�[�^_�P�C�q�� raw
			'edi_data_keihin_raw' : 362,
			// EDI�f�[�^_�P�C�q�� error
			'edi_data_keihin_error' : 363,
			// FB�f�[�^
			'fb_data' : 364,
			// Invoice Summaries
			'invoice_summaries' : 209,
			// Invoice Summaries DENIS�t�@�[�}�������
			'invoice_summaries_denis_company' : 379,
			// Invoice Summaries �֘A��ЂQ
			'invoice_summaries_company2' : 380,
			// Invoice Summaries �֘A��ЂP
			'invoice_summaries_company1' : 381,
			// Printed Purchase Orders
			'printed_purchase_orders' : 208,
			// Printed Purchase Orders DENIS�t�@�[�}�������
			'printed_purchase_orders_denis_company' : 382,
			// Printed Purchase Orders �֘A��ЂQ
			'printed_purchase_orders_company2' : 383,
			// Printed Purchase Orders �֘A��ЂP
			'printed_purchase_orders_company1' : 384,
			// SC��FC���|�[�g
			'fc_report' : 365,
			// �J�X�^�������f�[�^
			'custom_deposit_data' : 366,
			// �P�C�q���q�ɏo�׎w��
			'keihin_shipping' : 367,
			// �Z�[���X���|�[�g
			'sales_report' : 368,
			// �d����ԕi(�A��)PDF
			'import_pdf' : 369,
			// �q�Ɉړ��w�����X�g
			'warehouse_list' : 370,
			// �q�Ɉړ��w��
			'Warehouse_move' : 371,
			// ���ב��MPDF
			'incoming_pdf' : 372,
			// ���v������
			'total_inv' : 373,
			// ���v�������o�̓t�@�C��
			'total_inv_output_file' : 374,
			// �c�ƌv���񃌃|�[�g
			'plan_report' : 375,
			// �݌Ƀ��|�[�g
			'inventory_report' : 376,
			// �ꏊ/�ۊǒI�o�[�R�[�h
			'location_storage_barcode' : 377,
			// ���M
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
