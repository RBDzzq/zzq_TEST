/**
 * O¥à/|à²® cs
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/10/31     CPC_
 *
 */

var saveType='';
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	saveType=type;
	if(type=='edit'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'){
		setButtunButtonDisable('tbl__cancel');
		setButtunButtonDisable('tbl_secondary_cancel');
		setButtunButtonDisable('spn_CREATENEW_d1');
		setButtunButtonDisable('spn_secondaryCREATENEW_d1');		
		setButtunButtonDisable('spn_ACTIONMENU_d1');
		setButtunButtonDisable('spn_secondaryACTIONMENU_d1');		
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
//   if((saveType=='create'||saveType=='copy')&&nlapiGetFieldValue('customform')=='142' &&isEmpty(nlapiGetFieldValue('custbody_djkk_bribery_acknowledgmentid'))){
//	var record=nlapiCreateRecord('customrecord_djkk_bribery_acknowledgment');
//	
//	//åvîñ
//	record.setFieldValue('customform', '179');
//	record.setFieldValue('custrecord_djkk_transactionnumber', nlapiGetFieldValue('transactionnumber'));//gUNVÔ
//	record.setFieldValue('custrecord_djkk_bribery_tranid', nlapiGetFieldValue('tranid'));//QÆÔ
//	record.setFieldValue('custrecord_djkk_bribery_vendor', nlapiGetFieldValue('entity'));//DJ_düæ 
//	record.setFieldValue('custrecord_djkk_bribery_account', nlapiGetFieldValue('account'));//¨èÈÚ 
//	record.setFieldValue('custrecord_djkk_bribery_amount', nlapiGetFieldValue('usertotal'));//àz
//	record.setFieldValue('custrecord_djkk_bribery_createdfrom', nlapiGetFieldValue('createdfrom'));//DJ_ì¬³(³Fp)
//	record.setFieldValue('custrecord_djkk_bribery_currency', nlapiGetFieldValue('currency'));//DJ_ÊÝ 
//	record.setFieldValue('custrecord_djkk_bribery_exchangerate', nlapiGetFieldValue('exchangerate'));//DJ_×Ö[g *
//	record.setFieldValue('custrecord_djkk_bribery_taxtotal', nlapiGetFieldValue('taxtotal'));//DJ_Åà
//	record.setFieldValue('custrecord_djkk_bribery_duedate', nlapiGetFieldValue('duedate'));//DJ_úú
//	record.setFieldValue('custrecord_djkk_bribery_now_date', nlapiGetFieldValue('trandate'));//út 
//	record.setFieldValue('custrecord_djkk_bribery_postingperiod', nlapiGetFieldValue('postingperiod'));//L úÔ 
//	record.setFieldValue('custrecord_djkk_bribery_memo', nlapiGetFieldValue('memo'));//
//	record.setFieldValue('custrecord_djkk_bribery_closing_date', nlapiGetFieldValue('custbody_suitel10n_inv_closing_date'));//÷ú
//	record.setFieldValue('custrecord_djkk_bribery_deliverydate', nlapiGetFieldValue('custbody_jp_deliverydate'));//[ú
//	
//	//ªÞ
//	record.setFieldValue('custrecord_djkk_bribery_subsidiary', nlapiGetFieldValue('subsidiary'));//qïÐ
//	record.setFieldValue('custrecord_djkk_department', nlapiGetFieldValue('department'));//ZNV
//	record.setFieldValue('custrecord_djkk_class', nlapiGetFieldValue('class'));//uh
//	record.setFieldValue('custrecord_djkk_location', nlapiGetFieldValue('location'));//ê
//	
//	//»Ì¼
//	record.setFieldValue('custrecord_djkk_bribery_operation_inston', nlapiGetFieldValue('custbody_djkk_operation_instructions'));//DJ_iEìÆw¦
//	record.setFieldValue('custrecord_djkk_inspection_finished', nlapiGetFieldValue('custbody_djkk_inspection_finished'));//DJ_iI¹ó]ú	
//	// CH144 zheng 20230516 start
//	//record.setFieldValue('custrecord_djkk_reserved_exchangerate_p1', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p1'));//DJ_æ1\ñ[g
//	// CH144 zheng 20230516 end
//	record.setFieldValue('custrecord_djkk_jp_bank_acct_info', nlapiGetFieldValue('custbody_jp_bank_acct_info'));//DJ_âsûÀîñ
//	record.setFieldValue('custrecord_djkk_custbody_jp_estimateinfo', nlapiGetFieldValue('custbody_jp_estimateinfo'));//DJ_©Ïîñ
//	record.setFieldValue('custrecord_djkk_bribery_jp_message', nlapiGetFieldValue('custbody_jp_message'));//DJ_ÊM
//	record.setFieldValue('custrecord_djkk_expected_shipping_date', nlapiGetFieldValue('custbody_djkk_expected_shipping_date'));//DJ_o×\èú
//	record.setFieldValue('custrecord_djkk_bribery_vendor_comments', nlapiGetFieldValue('custbody_djkk_vendor_comments'));//DJ_düæRg
//	// CH144 zheng 20230516 start
//	//record.setFieldValue('custrecord_dj_reserved_exchange_rate_yen', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_yen'));//DJ_~Ýx¥
//	//record.setFieldValue('custrecord_djkk_reserved_exchange_rate_f', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_f'));//DJ_OÝx¥f[^ì¬
//	//record.setFieldValue('custrecord_djkk_reserved_exchangerate_p2', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p2'));//DJ_æ2\ñ[g
//	//record.setFieldValue('custrecord_djkk_reserved_exchangerate_p3', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p3'));//DJ_æ3\ñ[g
//	// CH144 zheng 20230516 end
//	record.setFieldValue('custrecord_djkk_bribery_project', nlapiGetFieldValue('custbody_djkk_project'));//DJ_vWFNg
//	record.setFieldValue('custrecord_djkk_delivery_precautions', nlapiGetFieldValue('custbody_djkk_delivery_precautions'));//DJ_[iæÓ
//	record.setFieldValue('custrecord_djkk_production_po_number', nlapiGetFieldValue('custbody_djkk_production_po_number'));//DJ_PRODUCTION PURCHASE ORDERÔ
//	record.setFieldValue('custrecord_djkk_bribery_language', nlapiGetFieldValue('custbody_djkk_language'));//DJ_¾ê
//	record.setFieldValue('custrecord_djkk_br_incoterms_location', nlapiGetFieldValue('custbody_djkk_incoterms_location'));//DJ_o×³
//	record.setFieldValue('custrecord_djkk_bribery_po_fc_created', nlapiGetFieldValue('custbody_djkk_po_fc_created'));//DJ_POv|[U
//	record.setFieldValue('custrecord_djkk_djkk_sotck_send_flag', nlapiGetFieldValue('custbody_djkk_sotck_send_flag'));//DJ_üÍ\ètO
//	record.setFieldValue('custrecord_djkk_br_customer_precautions', nlapiGetFieldValue('custbody_djkk_customer_precautions'));//DJ_ÚqÓ
//	
//	//¿TAB
//	record.setFieldValue('custrecord_djkk_bribery_billaddress', nlapiGetFieldValue('billaddress'));//DJ_düæZ
//	record.setFieldValue('custrecord_djkk_br_billaddresslist_id', nlapiGetFieldValue('billaddresslist'));//DJ_düæZÌIð(ID)
//	record.setFieldValue('custrecord_djkk_bribery_billaddresslist', nlapiGetFieldText('billaddresslist'));//DJ_düæZÌIð
//	
//	//³Fîñ
//	var roleValue = nlapiGetRole();
//	var userValue = nlapiGetUser();
//	var subsidiary = nlapiGetFieldValue('subsidiary');
//	var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//gUNV³FÇ\
//			[
//			   ["isinactive","is","F"], 
//			   "AND", 
//			   ["custrecord_djkk_trans_appr_obj","anyof",12],
//			   "AND",
//			   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
//			], 
//			[
//			   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //ì¬[
//			   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //æê³F[
//			   
//			]
//			);
//	if(!isEmpty(approvalSearch)){
//		for(var j = 0; j < approvalSearch.length; j++){
//			var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//ì¬[
//			var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//æê³F[
//			if(createRole == roleValue){
//				record.setFieldValue('custrecord_djkk_start_role',createRole);//DJ_ì¬[
//				record.setFieldValue('custrecord_djkk_next_appr_role',appr1_role); //DJ_Ì³F[
//			}
//		}
//	}
//	
//	record.setFieldValue('custrecord_djkk_brybery_checkbox', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg'));
//	record.setFieldValue('custrecord_djkk_page_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status'));
//	record.setFieldValue('custrecord_djkk_start_role_name', userValue);
////	record.setFieldValue('custrecord_djkk_start_role', nlapiGetFieldValue('custbody_djkk_trans_appr_create_role'));
//	//record.setFieldValue('custrecord_djkk_start_role_name', nlapiGetFieldValue('custbody_djkk_trans_appr_create_user'));
//	record.setFieldValue('custrecord_djkk_brybery_tr', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));
//	record.setFieldValue('custrecord_djkk_brybery_appr_dev_u', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user'));
//	record.setFieldValue('custrecord_djkk_brybery_appr_term', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));
//		
////	record.setFieldValue('custrecord_djkk_next_appr_role', nlapiGetFieldValue('custbody_djkk_trans_appr_next_role'));
//	record.setFieldValue('custrecord_djkk_next_appr_name', nlapiGetFieldValue('custbody_djkk_trans_appr_user'));
//	record.setFieldValue('custrecord_djkk_next_appr_term', nlapiGetFieldValue('custbody_djkk_trans_appr_cdtn_amt'));
//	record.setFieldValue('custrecord_djkk_first_role', nlapiGetFieldValue('custbody_djkk_trans_appr1_role'));
//	record.setFieldValue('custrecord_djkk_brybery_first_name', nlapiGetFieldValue('custbody_djkk_trans_appr1_user'));
//	record.setFieldValue('custrecord_djkk_end_role', nlapiGetFieldValue('custbody_djkk_trans_appr2_role'));
//	record.setFieldValue('custrecord_djkk_brybery_second_name', nlapiGetFieldValue('custbody_djkk_trans_appr2_user'));
//	
//	record.setFieldValue('custrecord_djkk_third_brybery_role', nlapiGetFieldValue('custbody_djkk_trans_appr3_role'));
//	record.setFieldValue('custrecord_djkk_third_brybery_name', nlapiGetFieldValue('custbody_djkk_trans_appr3_user'));
//	record.setFieldValue('custrecord_djkk_last_brybery_role', nlapiGetFieldValue('custbody_djkk_trans_appr4_role'));
//	record.setFieldValue('custrecord_djkk_last_brybery_name', nlapiGetFieldValue('custbody_djkk_trans_appr4_user'));
//	record.setFieldValue('custrecord_djkk_over_brybery_memo', nlapiGetFieldValue('custbody_djkk_approval_reset_memo'));
//
//	record.setFieldValue('custrecord_djkk_brybery_kyaltuka_memo', nlapiGetFieldValue('custbody_djkk_approval_kyaltuka_memo'));
////	record.setFieldValue('custrecord_djkk_bribery_memo', nlapiGetFieldValue('memo'));//
//	nlapiLogExecution('debug','item start','')	
//	//ACe¾×
//	var itemCounts=nlapiGetLineItemCount('item');
//    for(var i=1;i<itemCounts+1;i++){
//    	nlapiSelectLineItem('item', i);
//		
//    	var inventoryDetail=nlapiViewCurrentLineItemSubrecord('item','inventorydetail');
//		if(!isEmpty(inventoryDetail)){
//			var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
//			for(var m = 1 ; m < invCount+1 ; m++){
//				inventoryDetail.selectLineItem('inventoryassignment', m);
//				record.selectNewLineItem('recmachcustrecord_djkk_brybery_page');
//				
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', i);//DJ_sÔ
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_detail_sub', nlapiGetFieldValue('subsidiary'));//DJ_qïÐ
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_item', nlapiGetCurrentLineItemValue('item', 'item'));//DJ_ACe
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_location', nlapiGetCurrentLineItemValue('item', 'location'));//	DJ_ê
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_unity', nlapiGetCurrentLineItemValue('item', 'units'));//DJ_PÊ
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate', nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_P¿/¦
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount', nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_àz
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate_code', nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_ÅàR[h
////				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_page', nlapiGetCurrentLineItemValue('item', 'memo'));//DJ_O¥à/|à²®
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_vendor', nlapiGetCurrentLineItemValue('item', 'vendorname'));//DJ_düæ¼
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_tax_money_brybery', nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_Åz
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_all_money_brybery', nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_z
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_description', nlapiGetCurrentLineItemValue('item', 'description'));//DJ_à¾
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_department', nlapiGetCurrentLineItemValue('item', 'department'));//DJ_ZNV
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_class', nlapiGetCurrentLineItemValue('item', 'class'));//DJ_uh
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_customer', nlapiGetCurrentLineItemValue('item', 'customer'));//DJ_Úq:vWFNg
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_isbillablet', nlapiGetCurrentLineItemValue('item', 'isbillableT'));//DJ_¿Â\
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_br_amortizationscheid', nlapiGetCurrentLineItemValue('item', 'amortizationsched'));//DJ_pXPW[id/hidden
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationsche', nlapiGetCurrentLineItemText('item', 'amortizationsched'));//DJ_pXPW[
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizstartdate', nlapiGetCurrentLineItemValue('item', 'amortizstartdate'));//DJ_pJn
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationendd', nlapiGetCurrentLineItemValue('item', 'amortizationenddate'));//DJ_pI¹
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_amortizationresidual', nlapiGetCurrentLineItemValue('item', 'amortizationresidual'));//DJ_c]
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_custcol_sol_fa_demo_1', nlapiGetCurrentLineItemValue('item', 'custcol_sol_fa_demo_1'));//DJ_Yo^
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_customs_duty_rate2', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate'));//DJ_\èÖÅ(àz2)
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_4572_tax_category', nlapiGetCurrentLineItemValue('item', 'custcol_4572_tax_category'));//DJ_ÅàJeS
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_po_memorandum', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_memorandum'));//DJ_õY^
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_origin', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_origin'));//DJ_¶Y
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_in_sotck_send_indicate', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_in_sotck_send_indicate'));//DJ_ü×\èw¦Ï
//				
//				var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber')
//				if(isEmpty(receiptinventorynumber)){
//			    	var invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//bgÔinternalid
//			    	receiptinventorynumber = nlapiLookupField('inventorynumber', invReordId,'inventorynumber');
//				}
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number',invReordId);	//VA/bgÔ    	
//		    	
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_binnery_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber'));//DJ_ÛÇIÔ
//				
//		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_over_date_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));//LøúÀ
//		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_lot_number',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));//DJ_[J[»¢bgÔ
//		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_serial_number',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));//DJ_[J[VAÔ	
//		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_manufacturing_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));//DJ_»¢Nú
//		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_probort_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));//DJ_o×Â\úÀú
//		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_ware_house_num_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));//DJ_qÉüÉÔ
//		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));//DJ_SMCÔ
//		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_list_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));//DJ_bg}[N
//		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_memmo_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));//DJ_bg	
//		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));//Ê		 
//		    	record.commitLineItem('recmachcustrecord_djkk_brybery_page');	
//			}
//	    }else{
//			record.selectNewLineItem('recmachcustrecord_djkk_brybery_page');
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', i);//DJ_sÔ
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_detail_sub', nlapiGetFieldValue('subsidiary'));//DJ_qïÐ
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_item', nlapiGetCurrentLineItemValue('item', 'item'));//DJ_ACe
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_location', nlapiGetCurrentLineItemValue('item', 'location'));//	DJ_ê
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_unity', nlapiGetCurrentLineItemValue('item', 'units'));//DJ_PÊ
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate', nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_P¿/¦
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount', nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_àz
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate_code', nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_ÅàR[h
////			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_page', nlapiGetCurrentLineItemValue('item', 'memo'));//DJ_O¥à/|à²®
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_vendor', nlapiGetCurrentLineItemValue('item', 'vendorname'));//DJ_düæ¼
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_tax_money_brybery', nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_Åz
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_all_money_brybery', nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_z
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_description', nlapiGetCurrentLineItemValue('item', 'description'));//DJ_à¾
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_department', nlapiGetCurrentLineItemValue('item', 'department'));//DJ_ZNV
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_class', nlapiGetCurrentLineItemValue('item', 'class'));//DJ_uh
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_customer', nlapiGetCurrentLineItemValue('item', 'customer'));//DJ_Úq:vWFNg
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_isbillablet', nlapiGetCurrentLineItemValue('item', 'isbillableT'));//DJ_¿Â\
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_br_amortizationscheid', nlapiGetCurrentLineItemValue('item', 'amortizationsched'));//DJ_pXPW[id/hidden
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationsche', nlapiGetCurrentLineItemText('item', 'amortizationsched'));//DJ_pXPW[
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizstartdate', nlapiGetCurrentLineItemValue('item', 'amortizstartdate'));//DJ_pJn
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationendd', nlapiGetCurrentLineItemValue('item', 'amortizationenddate'));//DJ_pI¹
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_amortizationresidual', nlapiGetCurrentLineItemValue('item', 'amortizationresidual'));//DJ_c]
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_custcol_sol_fa_demo_1', nlapiGetCurrentLineItemValue('item', 'custcol_sol_fa_demo_1'));//DJ_Yo^
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_customs_duty_rate2', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate'));//DJ_\èÖÅ(àz2)
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_4572_tax_category', nlapiGetCurrentLineItemValue('item', 'custcol_4572_tax_category'));//DJ_ÅàJeS
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_po_memorandum', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_memorandum'));//DJ_õY^
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_origin', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_origin'));//DJ_¶Y
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_in_sotck_send_indicate', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_in_sotck_send_indicate'));//DJ_ü×\èw¦Ï
//	    	record.commitLineItem('recmachcustrecord_djkk_brybery_page');
//		}
//    }
//    nlapiLogExecution('debug','item end','')	
//  //ïp¾×
//	var costCounts=nlapiGetLineItemCount('expense');
//	nlapiLogExecution('debug','cost start','start')
//    for(var c=1;c<costCounts+1;c++){
//    	nlapiSelectLineItem('expense', c);
//		{
//			nlapiLogExecution('debug','in costline ',nlapiGetCurrentLineItemValue('expense', 'account'))
//			record.selectNewLineItem('recmachcustrecord_djkk_amount_acknowledgment');
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_account',nlapiGetCurrentLineItemValue('expense', 'account'));//¨èÈÚ
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amount',nlapiGetCurrentLineItemValue('expense', 'amount'));//àz
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxcode',nlapiGetCurrentLineItemValue('expense', 'taxcode'));//ÅàR[h
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxrate',nlapiGetCurrentLineItemValue('expense', 'taxrate1'));//Å¦
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_tax',nlapiGetCurrentLineItemValue('expense', 'tax'));//Åz
////			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_pst',nlapiGetCurrentLineItemValue('expense', 'item'));//PST
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_grossamt',nlapiGetCurrentLineItemValue('expense', 'grossamt'));//z
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_memo',nlapiGetCurrentLineItemValue('expense', 'memo'));//
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_department',nlapiGetCurrentLineItemValue('expense', 'department'));//ZNV
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_class',nlapiGetCurrentLineItemValue('expense', 'class'));//uh
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_location',nlapiGetCurrentLineItemValue('expense', 'location'));//ê
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_customer',nlapiGetCurrentLineItemValue('expense', 'customer'));//Úq
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_claim',nlapiGetCurrentLineItemValue('expense', 'isbillable'));//¿Â\
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amortizatio',nlapiGetCurrentLineItemText('expense', 'amortizationsched'));//pXPW[
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_cost_amortizationid',nlapiGetCurrentLineItemValue('expense', 'amortizationsched'));//pXPW[id/hidden
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizstartdate',nlapiGetCurrentLineItemValue('expense', 'amortizstartdate'));//pJn	
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizationend',nlapiGetCurrentLineItemValue('expense', 'amortizationenddate'));//pI¹
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_residual',nlapiGetCurrentLineItemValue('expense', 'amortizationresidual'));//c]
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_tax_category',nlapiGetCurrentLineItemValue('expense', 'custcol_4572_tax_category'));//ÅàJeS
//	    	record.commitLineItem('recmachcustrecord_djkk_amount_acknowledgment');
//		}
//    }
//	nlapiLogExecution('debug','cost end','end')
//    
//	var custRecordId=nlapiSubmitRecord(record, true, true);
//	var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_bribery_acknowledgment',custRecordId, 'VIEW');
//	window.ischanged = false;
//	window.location.href=theLink;
//	 return false;
//    }
   if(saveType=='edit'&&!isEmpty(nlapiGetFieldValue('custbody_djkk_bribery_acknowledgmentid'))&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'){
	   try{
		var record=nlapiLoadRecord('customrecord_djkk_bribery_acknowledgment',nlapiGetFieldValue('custbody_djkk_bribery_acknowledgmentid'));
		
		//åvîñ
		record.setFieldValue('customform', '179');
		record.setFieldValue('custrecord_djkk_transactionnumber', nlapiGetFieldValue('transactionnumber'));//gUNVÔ
		record.setFieldValue('custrecord_djkk_bribery_tranid', nlapiGetFieldValue('tranid'));//QÆÔ
		record.setFieldValue('custrecord_djkk_bribery_vendor', nlapiGetFieldValue('entity'));//DJ_düæ 
		record.setFieldValue('custrecord_djkk_bribery_account', nlapiGetFieldValue('account'));//¨èÈÚ 
		record.setFieldValue('custrecord_djkk_bribery_amount', nlapiGetFieldValue('usertotal'));//àz
		record.setFieldValue('custrecord_djkk_bribery_createdfrom', nlapiGetFieldValue('createdfrom'));//DJ_ì¬³(³Fp)
		record.setFieldValue('custrecord_djkk_bribery_currency', nlapiGetFieldValue('currency'));//DJ_ÊÝ 
		record.setFieldValue('custrecord_djkk_bribery_exchangerate', nlapiGetFieldValue('exchangerate'));//DJ_×Ö[g *
		record.setFieldValue('custrecord_djkk_bribery_taxtotal', nlapiGetFieldValue('taxtotal'));//DJ_Åà
		record.setFieldValue('custrecord_djkk_bribery_duedate', nlapiGetFieldValue('duedate'));//DJ_úú
		record.setFieldValue('custrecord_djkk_bribery_now_date', nlapiGetFieldValue('trandate'));//út 
		record.setFieldValue('custrecord_djkk_bribery_postingperiod', nlapiGetFieldValue('postingperiod'));//L úÔ 
		record.setFieldValue('custrecord_djkk_bribery_memo', nlapiGetFieldValue('memo'));//
		record.setFieldValue('custrecord_djkk_bribery_closing_date', nlapiGetFieldValue('custbody_suitel10n_inv_closing_date'));//÷ú
		record.setFieldValue('custrecord_djkk_bribery_deliverydate', nlapiGetFieldValue('custbody_jp_deliverydate'));//[ú
		record.setFieldValue('custrecord_djkk_over_id', '');  //DJ_O¥à/|à²® 20230616 add by zhou
		
		
		//ªÞ
		record.setFieldValue('custrecord_djkk_bribery_subsidiary', nlapiGetFieldValue('subsidiary'));//qïÐ
		record.setFieldValue('custrecord_djkk_department', nlapiGetFieldValue('department'));//ZNV
		record.setFieldValue('custrecord_djkk_class', nlapiGetFieldValue('class'));//uh
		record.setFieldValue('custrecord_djkk_location', nlapiGetFieldValue('location'));//ê
		
		//»Ì¼
		record.setFieldValue('custrecord_djkk_bribery_operation_inston', nlapiGetFieldValue('custbody_djkk_operation_instructions'));//DJ_iEìÆw¦
		record.setFieldValue('custrecord_djkk_inspection_finished', nlapiGetFieldValue('custbody_djkk_inspection_finished'));//DJ_iI¹ó]ú	
		
		// CH144 zheng 20230516 start
		//record.setFieldValue('custrecord_djkk_reserved_exchangerate_p1', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p1'));//DJ_æ1\ñ[g
		// CH144 zheng 20230516 end
		record.setFieldValue('custrecord_djkk_jp_bank_acct_info', nlapiGetFieldValue('custbody_jp_bank_acct_info'));//DJ_âsûÀîñ
		record.setFieldValue('custrecord_djkk_custbody_jp_estimateinfo', nlapiGetFieldValue('custbody_jp_estimateinfo'));//DJ_©Ïîñ
		record.setFieldValue('custrecord_djkk_bribery_jp_message', nlapiGetFieldValue('custbody_jp_message'));//DJ_ÊM
		record.setFieldValue('custrecord_djkk_expected_shipping_date', nlapiGetFieldValue('custbody_djkk_expected_shipping_date'));//DJ_o×\èú
		record.setFieldValue('custrecord_djkk_bribery_vendor_comments', nlapiGetFieldValue('custbody_djkk_vendor_comments'));//DJ_düæRg
		// CH144 zheng 20230516 start
		record.setFieldValue('custrecord_dj_reserved_exchange_rate_yen', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_yen'));//DJ_~Ýx¥
		record.setFieldValue('custrecord_djkk_reserved_exchange_rate_f', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_f'));//DJ_OÝx¥f[^ì¬
		record.setFieldValue('custrecord_djkk_reserved_exchangerate_p2', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p2'));//DJ_æ2\ñ[g
		record.setFieldValue('custrecord_djkk_reserved_exchangerate_p3', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_p3'));//DJ_æ3\ñ[g
		// CH144 zheng 20230516 end
		record.setFieldValue('custrecord_djkk_bribery_project', nlapiGetFieldValue('custbody_djkk_project'));//DJ_vWFNg
		record.setFieldValue('custrecord_djkk_delivery_precautions', nlapiGetFieldValue('custbody_djkk_delivery_precautions'));//DJ_[iæÓ
		record.setFieldValue('custrecord_djkk_production_po_number', nlapiGetFieldValue('custbody_djkk_production_po_number'));//DJ_PRODUCTION PURCHASE ORDERÔ
		record.setFieldValue('custrecord_djkk_bribery_language', nlapiGetFieldValue('custbody_djkk_language'));//DJ_¾ê
		record.setFieldValue('custrecord_djkk_br_incoterms_location', nlapiGetFieldValue('custbody_djkk_incoterms_location'));//DJ_o×³
		record.setFieldValue('custrecord_djkk_bribery_po_fc_created', nlapiGetFieldValue('custbody_djkk_po_fc_created'));//DJ_POv|[U
		record.setFieldValue('custrecord_djkk_djkk_sotck_send_flag', nlapiGetFieldValue('custbody_djkk_sotck_send_flag'));//DJ_üÍ\ètO
		record.setFieldValue('custrecord_djkk_br_customer_precautions', nlapiGetFieldValue('custbody_djkk_customer_precautions'));//DJ_ÚqÓ
		
		//¿TAB
		record.setFieldValue('custrecord_djkk_bribery_billaddress', nlapiGetFieldValue('billaddress'));//DJ_düæZ
		record.setFieldValue('custrecord_djkk_br_billaddresslist_id', nlapiGetFieldValue('billaddresslist'));//DJ_düæZÌIð(ID)
		record.setFieldValue('custrecord_djkk_bribery_billaddresslist', nlapiGetFieldText('billaddresslist'));//DJ_düæZÌIð
		
		//³Fîñ
		record.setFieldValue('custrecord_djkk_brybery_checkbox', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg'));
		record.setFieldValue('custrecord_djkk_page_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status'));
		record.setFieldValue('custrecord_djkk_start_role_name', nlapiGetFieldValue('custbody_djkk_trans_appr_create_user'));
		record.setFieldValue('custrecord_djkk_start_role', nlapiGetFieldValue('custbody_djkk_trans_appr_create_role'));
		record.setFieldValue('custrecord_djkk_brybery_appr_dev_u', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user'));
		record.setFieldValue('custrecord_djkk_brybery_tr', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));
		record.setFieldValue('custrecord_djkk_brybery_appr_term', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));
		record.setFieldValue('custbody_djkk_trans_appr_do_cdtn_amt', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));
				
		record.setFieldValue('custrecord_djkk_next_appr_role', nlapiGetFieldValue('custbody_djkk_trans_appr_next_role'));
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
//		record.setFieldValue('custrecord_djkk_bribery_memo', nlapiGetFieldValue('memo'));//
	
		
		//Ã¢p[cí
		//item
		var itemRecordCount=record.getLineItemCount('recmachcustrecord_djkk_brybery_page');
		for(var w=itemRecordCount;w>0;w--){
			var thisItemCountid = record.getLineItemValue('recmachcustrecord_djkk_brybery_page', 'id',w);
			if(!isEmpty(thisItemCountid)){
				nlapiDeleteRecord('customrecord_djkk_bribery_detailed_page',thisItemCountid);
			}
			
		}
		//cost
		var costRecordCount=record.getLineItemCount('recmachcustrecord_djkk_amount_acknowledgment');
		for(var cw=costRecordCount;cw>0;cw--){
			var thisCostCountid = record.getLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'id',cw);
			if(!isEmpty(thisCostCountid)){
				nlapiDeleteRecord('customrecord_djkk_bribery_cost_detailed',thisCostCountid);
			}
			
		}
		
		//¾×
		var itemCounts=nlapiGetLineItemCount('item');
	    for(var i=1;i<itemCounts+1;i++){
	    	nlapiSelectLineItem('item', i);
			
	    	var inventoryDetail=nlapiViewCurrentLineItemSubrecord('item','inventorydetail');
			if(!isEmpty(inventoryDetail)){
				var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
				
				for(var m = 1 ; m < invCount+1 ; m++){
					inventoryDetail.selectLineItem('inventoryassignment', m);
					record.selectNewLineItem('recmachcustrecord_djkk_brybery_page');
					

					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', i);//DJ_sÔ
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_detail_sub', nlapiGetFieldValue('subsidiary'));//DJ_qïÐ
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_item', nlapiGetCurrentLineItemValue('item', 'item'));//DJ_ACe
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_location', nlapiGetCurrentLineItemValue('item', 'location'));//	DJ_ê
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_unity', nlapiGetCurrentLineItemValue('item', 'units'));//DJ_PÊ
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate', nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_P¿/¦
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount', nlapiGetCurrentLineItemValue('item', 'refamt'));//DJ_àz	
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate_code', nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_ÅàR[h
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_page', nlapiGetCurrentLineItemValue('item', 'memo'));//DJ_O¥à/|à²®
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_vendor', nlapiGetCurrentLineItemValue('item', 'vendorname'));//DJ_düæ¼
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_tax_money_brybery', nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_Åz
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_all_money_brybery', nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_z
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_description', nlapiGetCurrentLineItemValue('item', 'description'));//DJ_à¾
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_department', nlapiGetCurrentLineItemValue('item', 'department'));//DJ_ZNV
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_class', nlapiGetCurrentLineItemValue('item', 'class'));//DJ_uh
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_customer', nlapiGetCurrentLineItemValue('item', 'customer'));//DJ_Úq:vWFNg
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_isbillablet', nlapiGetCurrentLineItemValue('item', 'isbillableT'));//DJ_¿Â\
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_br_amortizationscheid', nlapiGetCurrentLineItemValue('item', 'amortizationsched'));//DJ_pXPW[id/hidden
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationsche', nlapiGetCurrentLineItemText('item', 'amortizationsched'));//DJ_pXPW[
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizstartdate', nlapiGetCurrentLineItemValue('item', 'amortizstartdate'));//DJ_pJn
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationendd', nlapiGetCurrentLineItemValue('item', 'amortizationenddate'));//DJ_pI¹
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_amortizationresidual', nlapiGetCurrentLineItemValue('item', 'amortizationresidual'));//DJ_c]
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_custcol_sol_fa_demo_1', nlapiGetCurrentLineItemValue('item', 'custcol_sol_fa_demo_1'));//DJ_Yo^
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_customs_duty_rate2', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate'));//DJ_\èÖÅ(àz2)
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_4572_tax_category', nlapiGetCurrentLineItemValue('item', 'custcol_4572_tax_category'));//DJ_ÅàJeS
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_po_memorandum', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_memorandum'));//DJ_õY^
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_origin', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_origin'));//DJ_¶Y
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_in_sotck_send_indicate', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_in_sotck_send_indicate'));//DJ_ü×\èw¦Ï
					
					var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber')
					if(isEmpty(receiptinventorynumber)){
				    	var invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//bgÔinternalid
				    	receiptinventorynumber = nlapiLookupField('inventorynumber', invReordId,'inventorynumber');
					}
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_admin_number',invReordId);	//VA/bgÔ    	
			    	
					record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_binnery_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber'));//DJ_ÛÇIÔ
					
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_over_date_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));//LøúÀ
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_lot_number',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));//DJ_[J[»¢bgÔ
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_admit_serial_number',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));//DJ_[J[VAÔ		
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_manufacturing_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));//DJ_»¢Nú
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_probort_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));//DJ_o×Â\úÀú
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_ware_house_num_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));//DJ_qÉüÉÔ
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));//DJ_SMCÔ
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_list_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));//DJ_bg}[N
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_lot_memmo_brybery',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));//DJ_bg	
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_quantity',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));//Ê		 
			    	record.commitLineItem('recmachcustrecord_djkk_brybery_page');	
				}
			}else{
				record.selectNewLineItem('recmachcustrecord_djkk_brybery_page');
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_linenum', i);//DJ_sÔ
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_bribery_detail_sub', nlapiGetFieldValue('subsidiary'));//DJ_qïÐ
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_item', nlapiGetCurrentLineItemValue('item', 'item'));//DJ_ACe
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_location', nlapiGetCurrentLineItemValue('item', 'location'));//	DJ_ê
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_unity', nlapiGetCurrentLineItemValue('item', 'units'));//DJ_PÊ
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate', nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_P¿/¦
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_amount', nlapiGetCurrentLineItemValue('item', 'refamt'));//DJ_àz
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_rate_code', nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_ÅàR[h
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_page', nlapiGetCurrentLineItemValue('item', 'memo'));//DJ_O¥à/|à²®
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_detail_vendor', nlapiGetCurrentLineItemValue('item', 'vendorname'));//DJ_düæ¼
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_tax_money_brybery', nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_Åz
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_all_money_brybery', nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_z
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_description', nlapiGetCurrentLineItemValue('item', 'description'));//DJ_à¾
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_department', nlapiGetCurrentLineItemValue('item', 'department'));//DJ_ZNV
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_class', nlapiGetCurrentLineItemValue('item', 'class'));//DJ_uh
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_customer', nlapiGetCurrentLineItemValue('item', 'customer'));//DJ_Úq:vWFNg
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_isbillablet', nlapiGetCurrentLineItemValue('item', 'isbillableT'));//DJ_¿Â\
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_br_amortizationscheid', nlapiGetCurrentLineItemValue('item', 'amortizationsched'));//DJ_pXPW[id/hidden
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationsche', nlapiGetCurrentLineItemText('item', 'amortizationsched'));//DJ_pXPW[
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizstartdate', nlapiGetCurrentLineItemValue('item', 'amortizstartdate'));//DJ_pJn
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_amortizationendd', nlapiGetCurrentLineItemValue('item', 'amortizationenddate'));//DJ_pI¹
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_amortizationresidual', nlapiGetCurrentLineItemValue('item', 'amortizationresidual'));//DJ_c]
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_custcol_sol_fa_demo_1', nlapiGetCurrentLineItemValue('item', 'custcol_sol_fa_demo_1'));//DJ_Yo^
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_customs_duty_rate2', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate'));//DJ_\èÖÅ(àz2)
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_4572_tax_category', nlapiGetCurrentLineItemValue('item', 'custcol_4572_tax_category'));//DJ_ÅàJeS
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_po_memorandum', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_memorandum'));//DJ_õY^
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_brybery_origin', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_origin'));//DJ_¶Y
				record.setCurrentLineItemValue('recmachcustrecord_djkk_brybery_page', 'custrecord_djkk_in_sotck_send_indicate', nlapiGetCurrentLineItemValue('item', 'custcol_djkk_in_sotck_send_indicate'));//DJ_ü×\èw¦Ï
		    	record.commitLineItem('recmachcustrecord_djkk_brybery_page');
			}
	    }
	    
	  //ïp¾×
		var costCounts=nlapiGetLineItemCount('expense');
	    for(var c=1;c<costCounts+1;c++){
	    	nlapiSelectLineItem('expense', c);
			{
				record.selectNewLineItem('recmachcustrecord_djkk_amount_acknowledgment');
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_account',nlapiGetCurrentLineItemValue('expense', 'account'));//¨èÈÚ
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amount',nlapiGetCurrentLineItemValue('expense', 'amount'));//àz
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxcode',nlapiGetCurrentLineItemValue('expense', 'taxcode'));//ÅàR[h
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_taxrate',nlapiGetCurrentLineItemValue('expense', 'taxrate1'));//Å¦
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_tax',nlapiGetCurrentLineItemValue('expense', 'tax'));//Åz
//				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_pst',nlapiGetCurrentLineItemValue('expense', 'item'));//PST
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_grossamt',nlapiGetCurrentLineItemValue('expense', 'grossamt'));//z
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_memo',nlapiGetCurrentLineItemValue('expense', 'memo'));//
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_department',nlapiGetCurrentLineItemValue('expense', 'department'));//ZNV
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_class',nlapiGetCurrentLineItemValue('expense', 'class'));//uh
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_location',nlapiGetCurrentLineItemValue('expense', 'location'));//ê
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_customer',nlapiGetCurrentLineItemValue('expense', 'customer'));//Úq
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_claim',nlapiGetCurrentLineItemValue('expense', 'isbillable'));//¿Â\
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_amortizatio',nlapiGetCurrentLineItemText('expense', 'amortizationsched'));//pXPW[
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_cost_amortizationid',nlapiGetCurrentLineItemValue('expense', 'amortizationsched'));//pXPW[id/hidden
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizstartdate',nlapiGetCurrentLineItemValue('expense', 'amortizstartdate'));//pJn	
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_amortizationend',nlapiGetCurrentLineItemValue('expense', 'amortizationenddate'));//pI¹
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_cost_residual',nlapiGetCurrentLineItemValue('expense', 'amortizationresidual'));//c]
				record.setCurrentLineItemValue('recmachcustrecord_djkk_amount_acknowledgment', 'custrecord_djkk_bribery_tax_category',nlapiGetCurrentLineItemValue('expense', 'custcol_4572_tax_category'));//ÅàJeS
		    	record.commitLineItem('recmachcustrecord_djkk_amount_acknowledgment');
			}
	    }
	    
		var custRecordId=nlapiSubmitRecord(record, false, true);
		var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_bribery_acknowledgment',custRecordId, 'VIEW');
		var delLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_briberyacknowledgme','customdeploy_djkk_sl_briberyacknowledgme');
		delLink += '&deleteRecordId=' + nlapiGetRecordId();
		nlapiRequestURL(delLink);
		window.ischanged = false;
		window.location.href=theLink;
		
		
//		console.log(theLink)
		 return false;
	   }catch(e){
		   alert(e.message);
		   return false;
	   }
	    }
   
   
   
    return true;
}
