/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([], function(){

	var DataRecordTypes = {};
	/** 定数 */
	var Constant = {};
	Constant['NS_RECORDS'] = 'NS_records';
	Constant['NS_FIELD'] = 'NS_Field';
	Constant['NS_SUBLIST'] = 'NS_sublist';
	Constant['NS_SUBFIELD'] = 'NS_subfield';
	Constant['NS_FIELDTYPE'] = 'NS_fieldtype';
	Constant['NS_FIELD_TEMP'] = 'NS_Field_TEMP';
	Constant['JSON_ITEM'] = 'JSON_item';
	Constant['CASE_ID'] = 'caseNo';
	Constant['DEFAULT_SELECT_VALUE'] = 1;
	Constant['KEY_ITEM'] = 'K';
	Constant['NS_SUMMARY'] = 'summary';
	Constant['NS_SEARCH_COL_INX'] = 'NS_col_index';
	Constant['CLOSE_TRAN'] = 'T16';    //クローズ仕訳
	Constant['NS_SORT'] = 'NS_sort';
	Constant['NS_DATEFORMAT'] = 'NS_dateformat';
	
	// 複数のRecordsがある場合のリレーションを記載するオブジェクト
	DataRecordTypes.primaryRelations = {
		M01: 'classification'
	};
	
	// JSON共通項目：日付と連結
	
	// JSONのデータをアウトプットする構造
	DataRecordTypes.outputTables = {
		MASTER_ADDRESS : { // 住所マスタ取得,FUNC_特殊処理
			search : {name:"FUNC_master_address_getinfo",params:[],errorlog:["DENISマスタ取得", "住所マスタ取得", "E_BUS_002"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX],
			vals : [
				   ]
		},
		MASTER_LOCATION : { // 場所マスタ取得,FUNC_特殊処理
			search : {name:"FUNC_master_location_getinfo",params:[],errorlog:["DENISマスタ取得", "場所マスタ取得", "E_BUS_002"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX],
			vals : [
				   ]
		},
		MASTER_ITEM : { // アイテムマスタ取得,FUNC_特殊処理
			search : {name:"FUNC_master_item_getinfo",params:[],errorlog:["DENISマスタ取得", "アイテムマスタ取得", "E_BUS_002"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX],
			vals : [
				   ]
		},
		MASTER_PRICELIST : { // DJ_価格リスト取得,FUNC_特殊処理
			search : {name:"FUNC_master_priceList_getinfo",params:[],errorlog:["DENISマスタ取得", "DJ_価格リスト取得", "E_BUS_002"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX],
			vals : [
				   ]
		},
		MASTER_INVENTORYNUMBER : { // DN在庫番号取得,FUNC_特殊処理
			search : {name:"FUNC_master_inventorynumber_getinfo",params:[],paramnull:[],errorlog:["DENISマスタ取得", "DN在庫番号取得", "E_BUS_002"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX],
			vals : [
				   ]
		},
		  MASTER_CUSTOMER_ADDRESS : { // N顧客住所明細取得,SQLS_SQL検索
			search : {name:"FUNC_customer_address_getinfo",params:[],paramnull:[],errorlog:["DENISマスタ取得", "N顧客住所明細取得", "E_BUS_002"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX],
			vals : [
				   ]
		},
		MASTER_SUBSUDIARY : { // N連結マスタ取得,SQLS_SQL検索
			search : {name:"FUNC_master_subsidiary_getinfo",params:[],paramnull:[],errorlog:["DENISマスタ取得", "N連結マスタ取得", "E_BUS_002"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX],
			vals : [
				   ]
		},
		MASTER_CUSTOMER : { // N顧客マスタ取得,SQLS_SQL検索
			search : {name:"SQLS_customer",params:["date-{sync_at}-lessthanorequalto-datecreated", "OR", "date-{sync_at}-lessthanorequalto-lastmodifieddate"],paramnull:[],errorlog:["DENISマスタ取得", "N顧客マスタ取得", ""]},
			checks : {checkname:["sync_at-date-nullandformat"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX,Constant.NS_DATEFORMAT,Constant.NS_SORT],
			vals : [
					['internalid', '', 'customerid', '',    '', 'text', 0, '', ''],
					['companyname', '', 'customernm', '',    '', 'text', 1, '', ''],
					['currency', '', 'currency', '',    '', 'text', 2, '', ''],
					['language', '', 'language', '',    '', 'text', 3, '', ''],
					['parent', '', 'parentid', '',    '', 'text', 4, '', ''],
					['subsidiary', '', 'subsidiaryid', '',    '', 'text', 5, '', ''],
					//['custentity_djkk_activity_chief.class', '', 'classid', '',    '', 'text', 6, '', ''],
					//['custentity_djkk_activity_chief.department', '', 'departmentid', '',    '', 'text', 7, '', ''],
					['email', '', 'email', '',    '', 'text', 8, '', ''],
					['phone', '', 'phone', '',    '', 'text', 9, '', ''],
					['fax', '', 'fax', '',    '', 'text', 10, '', ''],
					['salesrep', '', 'salesrepid', '',    '', 'text', 11, '', ''],
					['custentity_djkk_expdatereservaltyp.custrecord_djkk_type_code', '', 'dj_expdatereservaltyp', '',    '', 'text', 12, '', ''],
					['custentity_djkk_expdateremainingdays', '', 'dj_expdateremainingdays', '',    '', 'number', 13, '', ''],
					['custentity_djkk_expdateremainingpercent', '', 'dj_expdateremainingpercent', '',    '', 'decimal', 14, '4', ''],
					['custentity_djkk_payment_conditions', '', 'dj_paymentcondtyp', '',    '', 'text', 15, '', ''],
					['custentity_djkk_orderruledesc', '', 'dj_orderruledesc', '',    '', 'text', 16, '', ''],
					['custentity_djkk_consignmentbuyingflg', '', 'dj_consignmentbuyingflg', '',    '', 'TF', 17, '', ''],
	
					['custentity_djkk_commoncustomflg', '', 'dj_commoncustomflg', '',    '', 'TF', 18, '', ''],
					['custentity_djkk_shippinginfosendtyp.custrecord_djkk_type_code', '', 'dj_shippinginfosendtyp', '',    '', 'text', 19, '', ''],
					['custentity_djkk_customerrep', '', 'dj_customerrep', '',    '', 'text', 20, '', ''],
					['custentity_djkk_shippinginfodestemail', '', 'dj_shippinginfodestemail', '',    '', 'text', 21, '', ''],
					['custentity_djkk_shippinginfodestfax', '', 'dj_shippinginfodestfax', '',    '', 'text', 22, '', ''],
					['custentity_djkk_shippinginfodestmemo', '', 'dj_shippinginfodestmemo', '',    '', 'text', 23, '', ''],
	//				['custentity_djkk_finet_shipment_mail_flg', '', 'dj_finetshipmentmailflg', '',    '', 'TF', 24, '', ''],
	//				['custentity_djkk_finet_bill_mail_flg', '', 'dj_finetbillmailflg', '',    '', 'TF', 25, '', ''],
					['custentity_djkk_sowmsmemo', '', 'dj_sowmsmemo', '',    '', 'text', 26, '', ''],
					['custentity_djkk_pl_code', '', 'dj_priceListCd', '',    '', 'text', 27, '', ''],
					['custentity_djkk_price0flg', '', 'dj_price0flg', '',    '', 'TF', 28, '', ''],
	//				['custentity_djkk_external_align_code', '', 'dj_externalaligncode', '',    '', 'text', 29, '', ''],
	
					
					['datecreated', '', 'createtime', '',    '', 'date', 30, '', ''],
					['lastmodifieddate', '', 'lastupdatetime', '',    '', 'date', 31, '', ''],
					['isinactive', '', 'deleteflg', '',    '', 'TF', 32, '', ''],
					  ['', '', 'classid', '',    '', 'fix', 33, '', ''],
					['', '', 'departmentid', '',    '', 'fix', 34, '', ''],
					['', '', 'updateuser', '',    '', 'fix', 35, 'netsuite', ''],
					['', '', 'createuser', '',    '', 'fix', 36, 'netsuite', ''],
				   ]
		},
	
		MASTER_EMPLOYEE : { // DN従業員取得,FUNC_特殊処理
			search : {name:"FUNC_master_employee_getinfo",params:[],paramnull:[],errorlog:["DENISマスタ取得", "N従業員マスタ取得", "E_BUS_002"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX],
			vals : [
				   ]
		},
		 MASTER_CUSTOMER_ITEM : { // C顧客商品毎設定取得,SQLS_SQL検索
			// search : {name:"SQLS_customrecord_djkk_customer_item_config",params:["date-{sync_at}-lessthanorequalto-created", "OR", "date-{sync_at}-lessthanorequalto-lastmodified"],paramnull:[],errorlog:["DENIS検索取得", "C顧客商品毎設定取得", ""]},
           search : {name:"SQLS_customrecord_djkk_customer_item_config",params:[],paramnull:[],errorlog:["DENIS検索取得", "C顧客商品毎設定取得", ""]},
			checks : {checkname:["sync_at-date-nullandformat"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX,Constant.NS_DATEFORMAT,Constant.NS_SORT],
			vals : [
					['custrecord_djkk_cic_customer.entityid', '', 'customerid', '',    '', 'text', 0, '', ''],
					['custrecord_djkk_cic_item.itemid', '', 'itemid', '',    '', 'text', 1, '', ''],
					['custrecord_djkk_cic_po_memo_for_location', '', 'sowmsmemo', '',    '', 'text', 2, '', ''],
					['created', '', 'createtime', '',    '', 'date', 3, '', ''],
					['lastmodified', '', 'lastupdatetime', '',    '', 'date', 4, '', ''],
					['isinactive', '', 'deleteflg', '',    '', 'TF', 5, '', ''],
					['', '', 'createuser', '',    '', 'fix', 6, 'netsuite', ''],
					['', '', 'updateuser', '',    '', 'fix', 7, 'netsuite', ''],
				   ]
		},
		//	MASTER_DELIVERY_DESTINATION : { // C納入先取得,SQLS_SQL検索
	//        search : {name:"SQLS_customrecord_djkk_delivery_destination",params:["date-{sync_at}-lessthanorequalto-created", "OR", "date-{sync_at}-lessthanorequalto-lastmodified"],paramnull:[],errorlog:["DENIS検索取得", "C納入先取得", ""]},
	//        checks : {checkname:["sync_at-date-nullandformat"]},
	//        keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX,Constant.NS_DATEFORMAT,Constant.NS_SORT],
	//        vals : [
	//				['custrecord_djkk_delivery_code', '', 'deliverydestid', '',    '', 'text', 0, '', ''],
	//				['custrecord_djkk_customer.entityid', '', 'customerid', '',    '', 'text', 1, '', ''],
	//				['custrecorddjkk_name', '', 'deliverydestName', '',    '', 'text', 2, '', ''],
	//				['custrecord_djkk_delivery_residence', '', 'addrlabel', '',    '', 'text', 3, '', ''],
	//				['custrecord_djkk_expdatereservaltyp.custrecord_djkk_type_code', '', 'dj_expdatereservaltyp', '',    '', 'text', 4, '', ''],
	//				['custrecord_djkk_expdateremainingdays', '', 'dj_expdateremainingdays', '',    '', 'text', 5, '', ''],
	//				['custrecord_djkk_expdateremainingpercent', '', 'dj_expdateremainingpercent', '',    '', 'text', 6, '', ''],
	////				['custrecord_djkk_deliverytogetherflg', '', 'dj_deliverytogetherflg', '',    '', 'TF', 7, '', ''],
	//				['custrecord_djkk_orderruledesc', '', 'dj_orderruledesc', '',    '', 'text', 8, '', ''],
	//				['custrecord_djkk_consignmentbuyingflg', '', 'dj_consignmentbuyingflg', '',    '', 'TF', 9, '', ''],
	//				['custrecord_djkk_alwaysnormaltempflg', '', 'dj_alwaysnormaltempflg', '',    '', 'TF', 10, '', ''],
	//				['custrecord_djkk_itemtempapplyfromdate', '', 'dj_itemtempapplyfromdate', '',    '', 'date', 11, 'yyyymmdd', ''],
	//				['custrecord_djkk_itemtempapplytodate', '', 'dj_itemtempapplytodate', '',    '', 'date', 12, 'yyyymmdd', ''],
	//				['custrecord_djkk_shippinginfosendtyp.custrecord_djkk_type_code', '', 'dj_shippinginfosendtyp', '',    '', 'text', 13, '', ''],
	//				['custrecord_djkk_deliverydestrep', '', 'dj_deliverydestrep', '',    '', 'text', 14, '', ''],
	//				
	//				['custrecord_djkk_shippinginfodesttyp.custrecord_djkk_type_code', '', 'dj_shippinginfodesttyp', '',    '', 'text', 15, '', ''],
	//				['custrecord_djkk_shippinginfodestname', '', 'dj_shippinginfodestname', '',    '', 'text', 16, '', ''],
	//				['custrecord_djkk_shippinginfodestrep', '', 'dj_shippinginfodestrep', '',    '', 'text', 17, '', ''],
	//				
	//				['custrecord_djkk_shippinginfodestemail', '', 'dj_shippinginfodestemail', '',    '', 'text', 18, '', ''],
	//				['custrecord_djkk_shippinginfodestfax', '', 'dj_shippinginfodestfax', '',    '', 'text', 19, '', ''],
	//				['custrecord_djkk_shippinginfodestmemo', '', 'dj_shippinginfodestmemo', '',    '', 'text', 20, '', ''],
	//				['custrecord_djkk_sowmsmemo', '', 'dj_sowmsmemo', '',    '', 'text', 21, '', ''],
	//				['custrecord_djkk_sodeliverermemo', '', 'dj_sodeliverermemo', '',    '', 'text', 22, '', ''],
	//				['custrecord_djkk_finetcustomeredicode', '', 'dj_finetcustomerEDIcode', '',    '', 'text', 23, '', ''],
	//				['custrecord_djkk_finetinvoicecustomercd1', '', 'dj_finetinvoicecustomercode1', '',    '', 'text', 24, '', ''],
	//				['custrecord_djkk_finetinvoicecustomercd2', '', 'dj_finetinvoicecustomercode2', '',    '', 'text', 25, '', ''],
	//				['custrecord_djkk_finetinvoicecustomercd3', '', 'dj_finetinvoicecustomercode3', '',    '', 'text', 26, '', ''],
	//				['custrecord_djkk_finetinvoicecustomercd4', '', 'dj_finetinvoicecustomercode4', '',    '', 'text', 27, '', ''],
	//				['custrecord_djkk_finetinvoicecustomercd5', '', 'dj_finetinvoicecustomercode5', '',    '', 'text', 28, '', ''],
	//				['custrecord_djkk_finet_shipment_mail_typ.custrecord_djkk_type_code', '', 'dj_finetshipmentmailtyp', '',    '', 'text', 29, '', ''],
	//				['custrecord_djkk_finet_bill_mail_typ.custrecord_djkk_type_code', '', 'dj_finetbillmailtyp', '',    '', 'text', 30, '', ''],
	//				['custrecord_djkk_finetrem_to_delvmemo_flg', '', 'dj_finetremarkstodeliverynotememoflg', '',    '', 'TF', 31, '', ''],
	//				['custrecord_djkk_price_code_fd.custrecord_djkk_pl_code_fd', '', 'dj_priceListCd', '',    '', 'text', 32, '', ''],
	//				['created', '', 'createtime', '',    '', 'date', 33, '', ''],
	//				['lastmodified', '', 'lastupdatetime', '',    '', 'date', 34, '', ''],
	//				['isinactive', '', 'deleteflg', '',    '', 'TF', 35, '', ''],
	//
	//				['custrecord_djkk_zip', '', 'dj_zip', '',    '', 'text', 36, '', ''],
	//				['custrecord_djkk_prefectures', '', 'dj_state', '',    '', 'text', 37, '', ''],
	//				['custrecord_djkk_municipalities', '', 'dj_city', '',    '', 'text', 38, '', ''],
	//				['custrecord_djkk_delivery_residence', '', 'dj_addr1', '',    '', 'text', 39, '', ''],
	//				['custrecord_djkk_delivery_residence2', '', 'dj_addr2', '',    '', 'text', 40, '', ''],
	//				['custrecord_djkk_delivery_destination_en', '', 'dj_addressee', '',    '', 'text', 41, '', ''],
	//				['custrecord_djkk_delivery_phone_text', '', 'dj_phone', '',    '', 'text', 42, '', ''],
	//				['custrecord_djkk_email', '', 'dj_email', '',    '', 'text', 43, '', ''],
	//				['custrecord_djkk_fax', '', 'dj_fax', '',    '', 'text', 44, '', ''],
	//				['custrecord_djkk_prefectures', '', 'dj_state_id', '',    '', 'customform', 45, '', ''],
	//
	//				['', '', 'createuser', '',    '', 'fix', 46, 'netsuite', ''],
	//				['', '', 'updateuser', '',    '', 'fix', 47, 'netsuite', ''],
	//				['', '', 'addrid', '',    '', 'fix', 48, '住所ID確認中', ''],
	//				['', '', 'dj_country', '',    '', 'fix', 49, '日本', ''],
	//				//['', '', 'dj_state_id', '',    '', 'fix', 43, '712', ''],
	//               ]
	//    },
		MASTER_DELIVERY_DESTINATION : { // C納品先取得,FUNC_特殊処理
			search : {name:"FUNC_master_delivery_destination_getinfo",params:[],paramnull:[],errorlog:["DENISマスタ取得", "C納入先マスタ取得", "E_BUS_002"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX],
			vals : [
				   ]
		},
		 MASTER_DELIVERYAREATEMP : { // C配送温度取得,SQLS_SQL検索
			search : {name:"SQLS_customrecord_djkk_deliveryareatemp",params:["date-{sync_at}-lessthanorequalto-created", "OR", "date-{sync_at}-lessthanorequalto-lastmodified"],paramnull:[],errorlog:["DENIS検索取得", "C配送温度取得", ""]},
			checks : {checkname:["sync_at-date-nullandformat"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX,Constant.NS_DATEFORMAT,Constant.NS_SORT],
			vals : [
					['custrecord_djkk_deliverytemptyp', '', 'deliverytemptyp', '',    '', 'text', 0, '', ''],
					['name', '', 'deliverytempnm', '',    '', 'text', 1, '', ''],
					['custrecord_djkk_linelogicunnecessaryflg', '', 'linelogicunnecessaryflg', '',    '', 'TF', 2, '', ''],
					['created', '', 'createtime', '',    '', 'date', 3, '', ''],
					['lastmodified', '', 'lastupdatetime', '',    '', 'date', 4, '', ''],
					['isinactive', '', 'deleteflg', '',    '', 'TF', 5, '', ''],
					['', '', 'createuser', '',    '', 'fix', 6, 'netsuite', ''],
					['', '', 'updateuser', '',    '', 'fix', 7, 'netsuite', ''],
				   ]
		},
		MASTER_ITEMCODE_MAPPING : { // CFINET商品コードマッピング取得,SQLS_SQL検索
			search : {name:"SQLS_customrecord_djkk_finet_itemcode_mapping",params:["date-{sync_at}-lessthanorequalto-created", "OR", "date-{sync_at}-lessthanorequalto-lastmodified"],paramnull:[],errorlog:["DENISマスタ取得", "CFINET商品コードマッピング取得", ""]},
			checks : {checkname:["sync_at-date-nullandformat"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX,Constant.NS_DATEFORMAT,Constant.NS_SORT],
			vals : [
					['custrecord_djkk_ficm_finet_center_code.custrecord_djkk_fcc_finet_center_code', '', 'finetcustomerEDIcode', '',    '', 'text', 0, '', ''],
					['custrecord_djkk_ficm_finet_item_code', '', 'finetitemcode', '',    '', 'text', 1, '', ''],
					['custrecord_djkk_ficm_item_code', '', 'itemid', '',    '', 'text', 2, '', ''],
					['custrecord_djkk_ficm_finet_kana_name', '', 'finetkanaitemdescription', '',    '', 'text', 3, '', ''],
					['custrecord_djkk_ficm_remark', '', 'remark', '',    '', 'text', 4, '', ''],
					['created', '', 'createtime', '',    '', 'date', 5, '', ''],
					['lastmodified', '', 'lastupdatetime', '',    '', 'date', 6, '', ''],
					['isinactive', '', 'deleteflg', '',    '', 'TF', 7, '', ''],
					['', '', 'createuser', '',    '', 'fix', 8, 'netsuite', ''],
					['', '', 'updateuser', '',    '', 'fix', 9, 'netsuite', ''],
				   ]
		},
		MASTER_IDELIVERY_LEADTIME : { // C都道府県配送リードタイム取得,SQLS_SQL検索
			search : {name:"SQLS_customrecord_djkk_pref_delivery_leadtime",params:["date-{sync_at}-lessthanorequalto-created", "OR", "date-{sync_at}-lessthanorequalto-lastmodified"],paramnull:[],errorlog:["DENISマスタ取得", "C都道府県配送リードタイム取得", ""]},
			checks : {checkname:["sync_at-date-nullandformat"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX,Constant.NS_DATEFORMAT,Constant.NS_SORT],
			vals : [
					['custrecord_djkk_pdl_pref_id', '', 'prefid', '',    '', 'text', 0, '', ''],
					['custrecord_djkk_pdl_location_id', '', 'locationid', '',    '', 'text', 1, '', ''],
					['custrecord_djkk_pdl_delivery_lead_days', '', 'deliveryleadtimedays', '',    '', 'text', 2, '', ''],
					['created', '', 'createtime', '',    '', 'date', 3, '', ''],
					['lastmodified', '', 'lastupdatetime', '',    '', 'date', 4, '', ''],
					['isinactive', '', 'deleteflg', '',    '', 'TF', 5, '', ''],
					['', '', 'createuser', '',    '', 'fix', 6, 'netsuite', ''],
					['', '', 'updateuser', '',    '', 'fix', 7, 'netsuite', ''],
				   ]
		},
		MASTER_ITEMDELIVERY_LEAD : { // C都道府県毎アイテムリードタイム取得,SQLS_SQL検索
			search : {name:"SQLS_customrecord_djkk_pref_itemdelivery_lead",params:["date-{sync_at}-lessthanorequalto-created", "OR", "date-{sync_at}-lessthanorequalto-lastmodified"],paramnull:[],errorlog:["DENISマスタ取得", "C都道府県毎アイテムリードタイム取得", ""]},
			checks : {checkname:["sync_at-date-nullandformat"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX,Constant.NS_DATEFORMAT,Constant.NS_SORT],
			vals : [
					['custrecord_djkk_pidl_item_id.itemid', '', 'itemid', '',    '', 'text', 0, '', ''],
					['custrecord_djkk_pidl_pref_id', '', 'prefid', '',    '', 'text', 1, '', ''],
					['custrecord_djkk_pidl_location_id', '', 'locationid', '',    '', 'text', 2, '', ''],
					['custrecord_djkk_pidl_delivery_lead_time', '', 'daysfordeliveryleadtime', '',    '', 'text', 3, '', ''],
					['created', '', 'createtime', '',    '', 'date', 4, '', ''],
					['lastmodified', '', 'lastupdatetime', '',    '', 'date', 5, '', ''],
					['isinactive', '', 'deleteflg', '',    '', 'TF', 6, '', ''],
					['', '', 'createuser', '',    '', 'fix', 7, 'netsuite', ''],
					['', '', 'updateuser', '',    '', 'fix', 8, 'netsuite', ''],
				   ]
		},
		MASTER_DELIVERY_AREA : { // C都道府県毎配送エリア取得,SQLS_SQL検索
			search : {name:"SQLS_customrecord_djkk_pref_delivery_area",params:["date-{sync_at}-lessthanorequalto-created", "OR", "date-{sync_at}-lessthanorequalto-lastmodified"],paramnull:[],errorlog:["DENISマスタ取得", "C都道府県毎配送エリア取得", ""]},
			checks : {checkname:["sync_at-date-nullandformat"]},
			keys : [Constant.JSON_ITEM, Constant.NS_SUMMARY, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE,Constant.NS_SEARCH_COL_INX,Constant.NS_DATEFORMAT,Constant.NS_SORT],
			vals : [
					['custrecord_djkk_pd_pref_id', '', 'prefid', '',    '', 'text', 0, '', ''],
					['custrecord_djkk_pd_pref_id', '', 'prefnm', '',    '', 'textname', 1, '', ''],
					['custrecorddjkk_pd_deliveryarea_id.custrecord_djkk_deliveryarea_id', '', 'deliveryareaid', '',    '', 'text', 2, '', ''],
					['created', '', 'createtime', '',    '', 'date', 3, '', ''],
					['lastmodified', '', 'lastupdatetime', '',    '', 'date', 4, '', ''],
					['isinactive', '', 'deleteflg', '',    '', 'TF', 5, '', ''],
					['', '', 'createuser', '',    '', 'fix', 6, 'netsuite', ''],
					['', '', 'updateuser', '',    '', 'fix', 7, 'netsuite', ''],
				   ]
		},
	
	};
	// MasterTableを記載したオブジェクト（記述性を重視した構造とした）
	DataRecordTypes.masterTables = {
		SALESORDER: {  //SALESORDER 注文書受信
			firstRun:'K',
			errorlog:["注文データ受信", "注文書受信"],
			keys: [Constant.JSON_ITEM, Constant.NS_RECORDS, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE, Constant.NS_FIELD_TEMP],
			vals: [
					['customform',          'salesorder', 'customform',              '',            '',      'text',      'custrecord_json_detail_str_data_01'],
					['tranid|K',          'salesorder', 'custbody_djkk_exsystem_tranid',              '',            '',      'text',      'custrecord_json_detail_str_data_02'],
					['customerid',          'salesorder', 'entity',              '',            '',      'select|customer|entityid',      'custrecord_json_detail_str_data_03'],
					['orderdate',          'salesorder', 'trandate',              '',            '',      'datechar',      'custrecord_json_detail_str_data_04'],
					['status',          'salesorder', 'orderstatus',              '',            '',      'text',      'custrecord_json_detail_str_data_05'],
					['salesrepid',          'salesorder', 'salesrep',              '',            '',      'text',      'custrecord_json_detail_str_data_06'],
					['csemployeeid',          'salesorder', 'custbody_djkk_trans_appr_create_user',              '',            '',      'text',      'custrecord_json_detail_str_data_59'],
					['dj_customerorderno',          'salesorder', 'custbody_djkk_customerorderno',              '',            '',      'text',      'custrecord_json_detail_str_data_07'],
					//['dj_activitytyp',          'salesorder', 'custbody_djkk_activity',              '',            '',      '',      'custrecord_json_detail_str_data_08'],
					['currency',          'salesorder', 'currency',              '',            '',      'text',      'custrecord_json_detail_str_data_09'],
					['subsidiaryid',          'salesorder', 'subsidiary',              '',            '',      'text',      'custrecord_json_detail_str_data_10'],
					['departmentid',          'salesorder', 'department',              '',            '',      'text',      'custrecord_json_detail_str_data_11'],
					['classid',          'salesorder', 'class',              '',            '',      'text',      'custrecord_json_detail_str_data_12'],
					['locationid',          'salesorder', 'location',              '',            '',      'text',      'custrecord_json_detail_str_data_13'],
					['dj_paymentmethodtyp',          'salesorder', 'custbody_djkk_paymentmethodtyp',              '',            '',      'text',      'custrecord_json_detail_str_data_14'],
					['dj_paymentcondtyp',          'salesorder', 'custbody_djkk_payment_conditions',              '',            '',      'select|customlist_djkk_payment_conditions|name',      'custrecord_json_detail_str_data_15'],
	
					['dj_deliveryruledesc',          'salesorder', 'custbody_djkk_deliveryruledesc',              '',            '',      'text',      'custrecord_json_detail_str_data_16'],
					['dj_cautiondesc',          'salesorder', 'custbody_djkk_cautiondesc',              '',            '',      'text',      'custrecord_json_detail_str_data_17'],
					['dj_wmsmemo1',          'salesorder', 'custbody_djkk_wmsmemo1',              '',            '',      'text',      'custrecord_json_detail_str_data_18'],
					['dj_wmsmemo2',          'salesorder', 'custbody_djkk_wmsmemo2',              '',            '',      'text',      'custrecord_json_detail_str_data_19'],
					['dj_wmsmemo3',          'salesorder', 'custbody_djkk_wmsmemo3',              '',            '',      'text',      'custrecord_json_detail_str_data_20'],
	//				['dj_delivererid',          'salesorder', 'custbody_djkk_delivererid',              '',            '',      'text',      'custrecord_json_detail_str_data_21'],
					['dj_deliverermemo1',          'salesorder', 'custbody_djkk_deliverermemo1',              '',            '',      'text',      'custrecord_json_detail_str_data_22'],
					['dj_deliverermemo2',          'salesorder', 'custbody_djkk_deliverermemo2',              '',            '',      'text',      'custrecord_json_detail_str_data_57'],
					['dj_deliverynotememo',          'salesorder', 'custbody_djkk_deliverynotememo',              '',            '',      'text',      'custrecord_json_detail_str_data_23'],
	//				['dj_shippinginfomemo',          'salesorder', 'custbody_djkk_shippinginfomemo',              '',            '',      'text',      'custrecord_json_detail_str_data_24'],
					['dj_orderrequestid',          'salesorder', 'custbody_djkk_orderrequestid',              '',            '',      'text',      'custrecord_json_detail_str_data_25'],
					['dj_netsuitetransflg',          'salesorder', 'custbody_djkk_netsuitetransflg',              '',            '',      'checkbox',      'custrecord_json_detail_str_data_26'],
					['dj_netsuitetransdt',          'salesorder', 'custbodycustbody_djkk_netsuitetransdt',              '',            '',      'dateymdhms',      'custrecord_json_detail_str_data_27'],
					
					['dj_shippinginstructdt',          'salesorder', 'custbody_djkk_shippinginstructdt',              '',            '',      'dateymdhms',      'custrecord_json_detail_str_data_28'],
					['dj_shippinginfodesttyp',          'salesorder', 'custbody_djkk_shippinginfodesttyp',              '',            '',      'text',      'custrecord_json_detail_str_data_29'],
					['dj_shippinginfodestname',          'salesorder', 'custbody_djkk_shippinginfodestname',              '',            '',      'text',      'custrecord_json_detail_str_data_30'],
					['dj_shippinginfodestemail',          'salesorder', 'custbody_djkk_shippinginfodestemail',              '',            '',      'text',      'custrecord_json_detail_str_data_31'],
					['dj_shippinginfodestfax',          'salesorder', 'custbody_djkk_shippinginfodestfax',              '',            '',      'text',      'custrecord_json_detail_str_data_32'],
					['dj_shippinginfosendtyp',          'salesorder', 'custbody_djkk_shippinginfosendtyp',              '',            '',      'text',      'custrecord_json_detail_str_data_33'],
					['dj_consignmentbuyingsalesflg',          'salesorder', 'custbody_djkk_consignmentbuyingsaleflg',              '',            '',      'checkbox',      'custrecord_json_detail_str_data_34'],
					['dj_finetkanaoffercompanyname',          'salesorder', 'custbody_djkk_finetkanaofferconame',              '',            '',      'text',      'custrecord_json_detail_str_data_35'],
					['dj_finetkanaoffercompanyofficename',          'salesorder', 'custbody_djkk_finetkanaoffercooffice',              '',            '',      'text',      'custrecord_json_detail_str_data_36'],
					['dj_finetkanacustomername',          'salesorder', 'custbody_djkk_finetkanacustomername',              '',            '',      'text',      'custrecord_json_detail_str_data_37'],
					['dj_finetkanacustomeraddress',          'salesorder', 'custbody_djkk_finetkanacustomeraddress',              '',            '',      'text',      'custrecord_json_detail_str_data_38'],
					['dj_advancepaymentreceivedflg',          'salesorder', 'custbody_djkk_exsystem_opc_flg',              '',            '',      'checkbox',      'custrecord_json_detail_str_data_39'],
					['dj_exsystemreceivedt',          'salesorder', 'custbody_djkk_exsystem_send_date_time',              '',            '',      'dateymdhms',      'custrecord_json_detail_str_data_40'],
					['dj_finetfinaldestcode',          'salesorder', 'custbody_djkk_finet_final_dest_code',              '',            '',      'text',      'custrecord_json_detail_str_data_60'],
					['dj_finetfinaldestcodebk',          'salesorder', 'custbody_djkk_finet_final_dest_code_bk',              '',            '',      'text',      'custrecord_json_detail_str_data_61'],
					['dj_finetdirectdestcode',          'salesorder', 'custbody_djkk_finet_direct_dest_code',              '',            '',      'text',      'custrecord_json_detail_str_data_62'],
					['dj_finetdirectdestcodebk',          'salesorder', 'custbody_djkk_finet_direct_dest_codebk',              '',            '',      'text',      'custrecord_json_detail_str_data_63'],
					['dj_finetprovidercompcode',          'salesorder', 'custbody_djkk_finet_provider_comp_code',              '',            '',      'text',      'custrecord_json_detail_str_data_64'],
					['dj_finetproviderofficecd',          'salesorder', 'custbody_djkk_finet_provider_office_cd',              '',            '',      'text',      'custrecord_json_detail_str_data_65'],
					['dj_finetfirststorecode',          'salesorder', 'custbody_djkk_finet_first_store_code',              '',            '',      'text',      'custrecord_json_detail_str_data_67'],
					['dj_finetsecondstorecode',          'salesorder', 'custbody_djkk_finet_second_store_code',              '',            '',      'text',      'custrecord_json_detail_str_data_68'],
					['dj_finetthirdstorecode',          'salesorder', 'custbody_djkk_finet_third_store_code',              '',            '',      'text',      'custrecord_json_detail_str_data_69'],
					['dj_finetfourthstorecode',          'salesorder', 'custbody_djkk_finet_fourth_store_code',              '',            '',      'text',      'custrecord_json_detail_str_data_70'],
					['dj_finetfifthstorecode',          'salesorder', 'custbody_djkk_finet_fifth_store_code',              '',            '',      'text',      'custrecord_json_detail_str_data_71'],
					['dj_finetbillsinfo',          'salesorder', 'custbody_djkk_finet_bills_info',              '',            '',      'text',      'custrecord_json_detail_str_data_72'],
					['dj_finetlocationtype',          'salesorder', 'custbody_djkk_finet_location_type',              '',            '',      'text',      'custrecord_json_detail_str_data_73'],
					
					['dj_finetshipmentmailflg',          'salesorder', 'custbody_djkk_finet_shipment_mail_flg',              '',            '',      'checkbox',      'custrecord_json_detail_str_data_74'],
					['dj_finetbillmailflg',          'salesorder', 'custbody_djkk_finet_bill_mail_flg',              '',            '',      'checkbox',      'custrecord_json_detail_str_data_75'],
					['dj_finetcustomeredicode',          'salesorder', 'custbody_djkk_finet_sender_center_code',              '',            '',      'text',      'custrecord_json_detail_str_data_76'],
					
					
					['dj_finetkanacustomername2',          'salesorder', 'custbody_djkk_finetkanacustomername2',              '',            '',      'text',      'custrecord_json_detail_str_data_77'],
					['dj_finetkanacustomeraddress2',          'salesorder', 'custbody_djkk_finetkanaaddress_option2',              '',            '',      'text',      'custrecord_json_detail_str_data_78'],
					['dj_finetkanacustomername3',          'salesorder', 'custbody_djkk_finetkanacustomername_o3',              '',            '',      'text',      'custrecord_json_detail_str_data_79'],
					['dj_finetkanacustomeraddress3',          'salesorder', 'custbody_djkk_finetkanaaddress_option3',              '',            '',      'text',      'custrecord_json_detail_str_data_80'],
					['dj_finetkanacustomername4',          'salesorder', 'custbody_djkk_finetkanacustomername4',              '',            '',      'text',      'custrecord_json_detail_str_data_81'],
					['dj_finetkanacustomeraddress4',          'salesorder', 'custbody_djkk_finetkanaaddress_option4',              '',            '',      'text',      'custrecord_json_detail_str_data_82'],
					['dj_finetkanacustomername5',          'salesorder', 'custbody_djkk_finetkanacustomername5',              '',            '',      'text',      'custrecord_json_detail_str_data_83'],
					['dj_finetkanacustomeraddress5',          'salesorder', 'custbody_djkk_finetkanaaddress_option5',              '',            '',      'text',      'custrecord_json_detail_str_data_84'],
					['dj_ordermethodrtyp',          'salesorder', 'custbody_djkk_ordermethodrtyp',              '',            '',      'text',      'custrecord_json_detail_str_data_85'],
					['dj_customertype',          'salesorder', 'custbody_djkk_customertype',              '',            '',      'text',      'custrecord_json_detail_str_data_86'],
					['dj_finetusercompanycode',          'salesorder', 'custbody_djkk_finet_user_company_code',              '',            '',      'text',      'custrecord_json_detail_str_data_87'],
					['createtime',          'salesorder', 'createddate',              '',            '',      'dateymdhms',      'custrecord_json_detail_str_data_41'],
					['createuser',          'salesorder', 'recordcreatedby',              '',            '',      'text',      'custrecord_json_detail_str_data_42'],
					['updateuser',          'salesorder', 'recordcreatedby',              '',            '',      'text',      'custrecord_json_detail_str_data_43'],
					 ['deleteflg',          'salesorder', 'isinactive',              '',            '',      'checkbox',      'custrecord_json_detail_str_data_44'],
	
					['shipping_expectedshippingdate',          'salesorder', 'shipdate',              '',            '',      'datechar',      'custrecord_json_detail_str_data_45'],
					// 20211209 楊 DJ_納品日マッピング変更 start
	//				['shipping_dj_deliverydate',          'salesorder', 'custbody_djkk_deliverydate',              '',            '',      'datechar',      'custrecord_json_detail_str_data_46'],
					['shipping_dj_deliverydate',          'salesorder', 'custbody_djkk_delivery_date',              '',            '',      'datechar',      'custrecord_json_detail_str_data_46'],
					['shipping_dj_expecteddeliverydate',          'salesorder', 'custbody_djkk_delivery_hopedate',              '',            '',      'datechar',      'custrecord_json_detail_str_data_55'],
					// 20211209 楊 DJ_納品日マッピング変更 end
					['shipping_dj_deliverytimedesc',          'salesorder', 'custbody_djkk_deliverytimedesc',              '',            '',      'text',      'custrecord_json_detail_str_data_47'],
					['shipping_carrier',          'salesorder', 'shipcarrier',              '',            '',      'text',      'custrecord_json_detail_str_data_48'],
					['shipping_deliverymethod',          'salesorder', 'shipmethod',              '',            '',      'text',      'custrecord_json_detail_str_data_49'],
					['shipping_deliverycharges',          'salesorder', 'shippingcost',              '',            '',      'text',      'custrecord_json_detail_str_data_50'],
					['shipping_deliverytaxcd',          'salesorder', 'shippingtaxcode',              '',            '',      'text',      'custrecord_json_detail_str_data_51'],
					['shipping_taxcdforfee',          'salesorder', 'handlingtaxcode',              '',            '',      'text',      'custrecord_json_detail_str_data_52'],
					['shipping_deliverydestid',          'salesorder', 'custbody_djkk_delivery_destination',              '',            '',      'select|customrecord_djkk_delivery_destination|custrecord_djkk_delivery_code',      'custrecord_json_detail_str_data_53'],
					['shipping_dj_deliverynotregistflg',          'salesorder', 'custbody_djkk_deliverynotregistflg',              '',            '',      'checkbox',      'custrecord_json_detail_str_data_54'],
			  
			  
					['misi_itemid',          'salesorder', '',                              'item', 'item',      'text',                'custrecord_json_detail_str_data_01'],
					// 20211209 楊 マッピング追加 start
				   // ['misi_itemid',          'salesorder', '',                              'item', 'custcol_djkk_item',      'select|item|itemid',                'custrecord_json_detail_str_data_01'],
					// 20211209 楊 マッピング追加 end	            
					['misi_locationid',          'salesorder', '',                              'item', 'location',      'text',                'custrecord_json_detail_str_data_02'],
					['misi_locationid',          'salesorder', '',                              'item', 'inventorylocation',      'text',                'custrecord_json_detail_str_data_58'],
					['misi_deliverytyp',          'salesorder', '',                              'item', 'itemfulfillmentchoice',      'text',                'custrecord_json_detail_str_data_03'],
					['misi_quantity',          'salesorder', '',                              'item', 'quantity',      'decimal',                'custrecord_json_detail_str_data_04'],
					['misi_unit',          'salesorder', '',                              'item', 'units',      'text',                'custrecord_json_detail_str_data_05'],
					['misi_price',          'salesorder', '',                              'item', 'rate',      'text',                'custrecord_json_detail_str_data_06'],
					
					['misi_netamount',          'salesorder', '',                              'item', 'amount',      'decimal',                'custrecord_json_detail_str_data_07'],
					['misi_taxcd',          'salesorder', '',                              'item', 'taxcode',      'text',                'custrecord_json_detail_str_data_08'],
					['misi_orderpriority',          'salesorder', '',                              'item', 'orderpriority',      'text',                'custrecord_json_detail_str_data_09'],
					['misi_detaildepartmentid',          'salesorder', '',                              'item', 'department',      'text',                'custrecord_json_detail_str_data_10'],
					['misi_detailclassid',          'salesorder', '',                              'item', 'class',      'text',                'custrecord_json_detail_str_data_11'],
					['misi_dj_perunitquantity',          'salesorder', '',                              'item', 'custcol_djkk_perunitquantity',      'decimal',                'custrecord_json_detail_str_data_12'],
					['misi_dj_casequantity',          'salesorder', '',                              'item', 'custcol_djkk_casequantity',      'decimal',                'custrecord_json_detail_str_data_13'],
					['misi_dj_quantity',          'salesorder', '',                              'item', 'custcol_djkk_quantity',      'decimal',                'custrecord_json_detail_str_data_14'],
					['misi_dj_deliverytemptyp',          'salesorder', '',                              'item', 'custcol_djkk_deliverytemptyp',      'select|customrecord_djkk_deliveryareatemp|custrecord_djkk_deliverytemptyp',                'custrecord_json_detail_str_data_15'],
					['misi_dj_nextshipmentdesc',          'salesorder', '',                              'item', 'custcol_djkk_nextshipmentdesc',      'text',                'custrecord_json_detail_str_data_16'],
					['misi_dj_sowmsdetailmemo',          'salesorder', '',                              'item', 'custcol_djkk_wms_line_memo',      'text',                'custrecord_json_detail_str_data_17'],
					['misi_dj_deliverynotememo',          'salesorder', '',                              'item', 'custcol_djkk_deliverynotememo',      'text',                'custrecord_json_detail_str_data_18'],
					['misi_dj_orderrequestid',          'salesorder', '',                              'item', 'custcol_djkk_orderrequestid',      'text',                'custrecord_json_detail_str_data_19'],
					['misi_dj_orderrequestlineno',          'salesorder', '',                              'item', 'custcol_djkk_orderrequestlineno',      'text',                'custrecord_json_detail_str_data_20'],
					['misi_dj_orderrequestquantity',          'salesorder', '',                              'item', 'custcol_djkk_orderrequestquantity',      'decimal',                'custrecord_json_detail_str_data_21'],
					['misi_dj_partshortagetyp_nm',          'salesorder', '',                              'item', 'custcol_djkk_partshortagetyp',      'select|customrecord_djkk_common_type|name',                'custrecord_json_detail_str_data_22'],
					['misi_dj_finetkanaitemdescription',          'salesorder', '',                              'item', 'custcol_djkk_finetkanaitemdescription',      'text',                'custrecord_json_detail_str_data_23'],
					['misi_dj_orderrequestdivideflg',          'salesorder', '',                              'item', 'custcol_djkk_orderrequestdivideflg',      'checkbox',                'custrecord_json_detail_str_data_24'],
					// 20211223　楊　SOL_DJ_AWSNETSUITE-118対応　DJ_注文明細状態区分 追加　start
					['misi_dj_orderdetailtyp_nm',          'salesorder', '',                              'item', 'custcol_djkk_orderdetailtyp',      'select|customrecord_djkk_common_type|name',                'custrecord_json_detail_str_data_56'],
					// 20211223　楊　SOL_DJ_AWSNETSUITE-118対応　DJ_注文明細状態区分 追加　end
					['misi_deleteflg',          'salesorder', '',                              'item', '',      'checkbox',                'custrecord_json_detail_str_data_88'],
					['misi_lineno',          'salesorder', '',                              'item', 'custcol_djkk_exsystem_line_num',      'text',                'custrecord_json_detail_str_data_89'],
	
			]
		},
	
		TRANSFERORDER: {  //TRANSFERORDER 移動伝票受信
			firstRun:'K',
			errorlog:["移動伝票データ受信", "移動伝票受信"],
			keys: [Constant.JSON_ITEM, Constant.NS_RECORDS, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE, Constant.NS_FIELD_TEMP],
			vals: [
	//				['customform',          'transferorder', 'customform',              '',            '',      'text',      'custrecord_json_detail_str_data_01'],
					['subsidiaryid',          'transferorder', 'subsidiary',              '',            '',      'text',      'custrecord_json_detail_str_data_02'],
					['orderno|K',          'transferorder', 'custbody_djkk_exsystem_tranid',              '',            '',      'text',      'custrecord_json_detail_str_data_03'],
					['date',          'transferorder', 'trandate',              '',            '',      'datechar',      'custrecord_json_detail_str_data_04'],
					['transfromlocationid',          'transferorder', 'location',              '',            '',      'text',      'custrecord_json_detail_str_data_05'],
					['transtolocationid',          'transferorder', 'transferlocation',              '',            '',      'text',      'custrecord_json_detail_str_data_06'],
					['status',          'transferorder', 'orderstatus',              '',            '',      'text',      'custrecord_json_detail_str_data_07'],
					['departmentid',          'transferorder', 'department',              '',            '',      'text',      'custrecord_json_detail_str_data_08'],
					['classid',          'transferorder', 'class',              '',            '',      'text',      'custrecord_json_detail_str_data_09'],
					['dj_customerid',          'transferorder', 'custbody_djkk_customerid',              '',            '',      'select|customer|entityid',      'custrecord_json_detail_str_data_10'],
					['dj_salesrepid',          'transferorder', 'custbody_djkk_salesrepid',              '',            '',      'text',      'custrecord_json_detail_str_data_11'],
					['dj_csemployeeid',          'transferorder', 'custbody_djkk_csemployeeid',              '',            '',      'text',      'custrecord_json_detail_str_data_58'],
					['dj_customerorderno',          'transferorder', 'custbody_djkk_customerorderno',              '',            '',      'text',      'custrecord_json_detail_str_data_12'],
					//['dj_activitytyp',          'transferorder', 'custbody_djkk_activity',              '',            '',      'text',      'custrecord_json_detail_str_data_12'],
					['dj_deliveryruledesc',          'transferorder', 'custbody_djkk_deliveryruledesc',              '',            '',      'text',      'custrecord_json_detail_str_data_13'],
					['dj_cautiondesc',          'transferorder', 'custbody_djkk_cautiondesc',              '',            '',      'text',      'custrecord_json_detail_str_data_14'],
					['dj_wmsmemo1',          'transferorder', 'custbody_djkk_wmsmemo1',              '',            '',      'text',      'custrecord_json_detail_str_data_15'],
					['dj_wmsmemo2',          'transferorder', 'custbody_djkk_wmsmemo2',              '',            '',      'text',      'custrecord_json_detail_str_data_16'],
					['dj_wmsmemo3',          'transferorder', 'custbody_djkk_wmsmemo3',              '',            '',      'text',      'custrecord_json_detail_str_data_17'],
					['dj_delivererid',          'transferorder', 'custbody_djkk_delivererid',              '',            '',      'text',      'custrecord_json_detail_str_data_18'],
					['dj_deliverermemo1',          'transferorder', 'custbody_djkk_deliverermemo1',              '',            '',      'text',      'custrecord_json_detail_str_data_19'],
					['dj_deliverermemo2',          'transferorder', 'custbody_djkk_deliverermemo2',              '',            '',      'text',      'custrecord_json_detail_str_data_57'],
					['dj_deliverynotememo',          'transferorder', 'custbody_djkk_deliverynotememo',              '',            '',      'text',      'custrecord_json_detail_str_data_20'],
					['dj_shippinginfomemo',          'transferorder', 'custbody_djkk_shippinginfomemo',              '',            '',      'text',      'custrecord_json_detail_str_data_21'],
					['dj_orderrequestid',          'transferorder', 'custbody_djkk_orderrequestid',              '',            '',      'text',      'custrecord_json_detail_str_data_22'],
					['dj_netsuitetransflg',          'transferorder', 'custbody_djkk_netsuitetransflg',              '',            '',      'checkbox',      'custrecord_json_detail_str_data_23'],
					['dj_netsuitetransdt',          'transferorder', 'custbodycustbody_djkk_netsuitetransdt',              '',            '',      'dateymdhms',      'custrecord_json_detail_str_data_24'],
	
					['dj_shippinginstructdt',          'transferorder', 'custbody_djkk_shippinginstructdt',              '',            '',      'dateymdhms',      'custrecord_json_detail_str_data_25'],
					['dj_finetkanaoffercompanyname',          'transferorder', 'custbody_djkk_finetkanaofferconame',              '',            '',      'text',      'custrecord_json_detail_str_data_26'],
					['dj_finetkanaoffercompanyofficename',          'transferorder', 'custbody_djkk_finetkanaoffercooffice',              '',            '',      'text',      'custrecord_json_detail_str_data_27'],
					['dj_finetkanacustomername',          'transferorder', 'custbody_djkk_finetkanacustomername',              '',            '',      'text',      'custrecord_json_detail_str_data_28'],
					['dj_finetkanacustomeraddress',          'transferorder', 'custbody_djkk_finetkanacustomeraddress',              '',            '',      'text',      'custrecord_json_detail_str_data_29'],
					['createtime',          'transferorder', 'createddate',              '',            '',      'dateymdhms',      'custrecord_json_detail_str_data_30'],
					['createuser',          'transferorder', 'recordcreatedby',              '',            '',      'text',      'custrecord_json_detail_str_data_31'],
	
					['shipping_expectedshippingdate',          'transferorder', 'shipdate',              '',            '',      'datechar',      'custrecord_json_detail_str_data_32'],
			  
					['shipping_dj_deliverydate',          'transferorder', 'custbody_djkk_delivery_date',              '',            '',      'datechar',      'custrecord_json_detail_str_data_33'],
					['shipping_dj_deliverytimedesc',          'transferorder', 'custbody_djkk_deliverytimedesc',              '',            '',      'text',      'custrecord_json_detail_str_data_34'],
					['shipping_carrier',          'transferorder', 'shipcarrier',              '',            '',      'text',      'custrecord_json_detail_str_data_35'],
					['shipping_deliverymethod',          'transferorder', 'shipmethod',              '',            '',      'text',      'custrecord_json_detail_str_data_36'],
					['shipping_deliveryfee',          'transferorder', 'shippingcost',              '',            '',      'decimal',      'custrecord_json_detail_str_data_37'],
					['shipping_fee',          'transferorder', 'handlingcost',              '',            '',      'decimal',      'custrecord_json_detail_str_data_38'],
	//				['shipping_deliverydestid',          'transferorder', 'shipaddresslist',              '',            '',      'text',      'custrecord_json_detail_str_data_39'],
					['shipping_deliverydestid',          'transferorder', 'custbody_djkk_delivery_destination',              '',            '',      'select|customrecord_djkk_delivery_destination|custrecord_djkk_delivery_code',      'custrecord_json_detail_str_data_40'],
					['misi_itemid',          'transferorder', '',                              'item', 'item',      'select|item|itemid',                'custrecord_json_detail_str_data_01'],
					//['misi_itemid',          'transferorder', '',                              'item', 'custcol_djkk_item',      'select|item|itemid',                'custrecord_json_detail_str_data_02'],
					['misi_locationid',          'transferorder', '',                              'item', 'location',      'text',                'custrecord_json_detail_str_data_03'],
					['misi_deliverytyp',          'transferorder', '',                              'item', 'itemfulfillmentchoice',      'text',                'custrecord_json_detail_str_data_04'],
					['misi_quantity',          'transferorder', '',                              'item', 'quantity',      'decimal',                'custrecord_json_detail_str_data_05'],
					['misi_unit',          'transferorder', '',                              'item', 'units',      'text',                'custrecord_json_detail_str_data_06'],
					['misi_price',          'transferorder', '',                              'item', 'rate',      'text',                'custrecord_json_detail_str_data_07'],
	
					['misi_netamount',          'transferorder', '',                              'item', 'amount',      'decimal',                'custrecord_json_detail_str_data_08'],
	//				['misi_taxcd',          'transferorder', '',                              'item', 'taxcode',      'text',                'custrecord_json_detail_str_data_09'],
					['misi_orderpriority',          'transferorder', '',                              'item', 'orderpriority',      'text',                'custrecord_json_detail_str_data_10'],
					['misi_detaildepartmentid',          'transferorder', '',                              'item', 'department',      'text',                'custrecord_json_detail_str_data_11'],
					['misi_detailclassid',          'transferorder', '',                              'item', 'class',      'text',                'custrecord_json_detail_str_data_12'],
					['misi_dj_perunitquantity',          'transferorder', '',                              'item', 'custcol_djkk_perunitquantity',      'decimal',                'custrecord_json_detail_str_data_13'],
					['misi_dj_casequantity',          'transferorder', '',                              'item', 'custcol_djkk_casequantity',      'decimal',                'custrecord_json_detail_str_data_14'],
					['misi_dj_quantity',          'transferorder', '',                              'item', 'custcol_djkk_quantity',      'decimal',                'custrecord_json_detail_str_data_15'],
					['misi_dj_deliverytemptyp',          'transferorder', '',                              'item', 'custcol_djkk_deliverytemptyp',      'select|customrecord_djkk_deliveryareatemp|custrecord_djkk_deliverytemptyp',                'custrecord_json_detail_str_data_16'],
					['misi_dj_nextshipmentdesc',          'transferorder', '',                              'item', 'custcol_djkk_nextshipmentdesc',      'text',                'custrecord_json_detail_str_data_17'],
					['misi_dj_sowmsdetailmemo',          'transferorder', '',                              'item', 'custcol_djkk_wms_line_memo',      'text',                'custrecord_json_detail_str_data_18'],
					['misi_dj_deliverynotememo',          'transferorder', '',                              'item', 'custcol_djkk_deliverynotememo',      'text',                'custrecord_json_detail_str_data_19'],
					['misi_dj_orderrequestid',          'transferorder', '',                              'item', 'custcol_djkk_orderrequestid',      'text',                'custrecord_json_detail_str_data_20'],
					['misi_dj_orderrequestlineno',          'transferorder', '',                              'item', 'custcol_djkk_orderrequestlineno',      'text',                'custrecord_json_detail_str_data_21'],
					['misi_dj_orderrequestquantity',          'transferorder', '',                              'item', 'custcol_djkk_orderrequestquantity',      'decimal',                'custrecord_json_detail_str_data_22'],
					['misi_dj_partshortagetyp_nm',          'transferorder', '',                              'item', 'custcol_djkk_partshortagetyp',      'select|customrecord_djkk_common_type|name',                'custrecord_json_detail_str_data_23'],
					['misi_dj_finetkanaitemdescription',          'transferorder', '',                              'item', 'custcol_djkk_finetkanaitemdescription',      'text',                'custrecord_json_detail_str_data_24'],
					['misi_dj_orderrequestdivideflg',          'transferorder', '',                              'item', 'custcol_djkk_orderrequestdivideflg',      'checkbox',                'custrecord_json_detail_str_data_25'],
					['misi_dj_orderdetailtyp_nm',          'transferorder', '',                              'item', 'custcol_djkk_orderdetailtyp',      'select|customrecord_djkk_common_type|name',                'custrecord_json_detail_str_data_56'],
					['misi_lineno',          'transferorder', '',                              'item', 'custcol_djkk_exsystem_line_num',      'text',                'custrecord_json_detail_str_data_89'],
	
			]
		},
	};
	DataRecordTypes.masterTableSub = {
			SALESORDER: {  //SALESORDER 注文書受信
		  keys: [Constant.JSON_ITEM, Constant.NS_RECORDS, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE, Constant.NS_FIELD_TEMP],
			vals: [
				['zk_dj_manageno',          'salesorder', '',              'item.inventorydetail.inventoryassignment',            'issueinventorynumber',      'special',      'custrecord_json_detail_str_data_01'],
				['zk_dj_allocationquantity',          'salesorder', '',              'item.inventorydetail.inventoryassignment',            'quantity',      'text',      'custrecord_json_detail_str_data_02'],
	//		    ['zk_expdate',          'salesorder', '',              'item.inventorydetail.inventoryassignment',            'expirationdate',      'datechar',      'custrecord_json_detail_str_data_03'],
				['zk_lotno',          'salesorder', '',              'item.inventorydetail.inventoryassignment',            'custrecord_djkk_maker_serial_code',      'text',      'custrecord_json_detail_str_data_04'],
	//			['zk_expdate',          'salesorder', '',              'item.inventorydetail.inventoryassignment',            'custrecord_djkk_shipment_date',      'datechar',      'custrecord_json_detail_str_data_05'],
				  ]
		  },
		  TRANSFERORDER: {  //TRANSFERORDER 移動伝票受信
		  keys: [Constant.JSON_ITEM, Constant.NS_RECORDS, Constant.NS_FIELD, Constant.NS_SUBLIST, Constant.NS_SUBFIELD, Constant.NS_FIELDTYPE, Constant.NS_FIELD_TEMP],
			vals: [
				['zk_dj_manageno',          'transferorder', '',              'item.inventorydetail.inventoryassignment',            'issueinventorynumber',      'special',      'custrecord_json_detail_str_data_01'],
				['zk_dj_allocationquantity',          'transferorder', '',              'item.inventorydetail.inventoryassignment',            'quantity',      'text',      'custrecord_json_detail_str_data_02'],
				['zk_expdate',          'transferorder', '',              'item.inventorydetail.inventoryassignment',            'expirationdate',      'datechar',      'custrecord_json_detail_str_data_03'],
				['zk_lotno',          'transferorder', '',              'item.inventorydetail.inventoryassignment',            'custrecord_djkk_maker_serial_code',      'datechar',      'custrecord_json_detail_str_data_04'],
				  ]
		  }
	};
	DataRecordTypes.caseTable = {
		  INSERT_SALESORDER: 'SALESORDER',
		  INSERT_TRANSFERORDER: 'TRANSFERORDER',
	
	};
	
	DataRecordTypes.errorLogMapping = {
			E_RLS_001: '指定した caseNo が見つかりません',
			E_BUS_001: '仕入先 <{param1}> が見つかりません。',
			E_BUS_002: '指定した <{param1}> は無効な日時です。',
			E_RLR_001: '指定した caseNo が見つかりません',
			E_RLR_003: '受信したデータの JSON 格納に失敗しました',
			E_RLR_004: '受信したデータの JSON 解析に失敗しました',
			E_RLR_005: '既存の発注書が更新できないステータスとなっています。処理番号: <{param1}>',
			E_RLR_006: 'データ処理に失敗しました。処理番号: <{param1}>'
	};
	
	return {
		DataRecordTypes:DataRecordTypes,
		Constant:Constant
	};
	});