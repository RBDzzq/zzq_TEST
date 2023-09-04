/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
var saveType='';
function clientPageInit(type){
	saveType=type;
	if(nlapiGetFieldValue('customform')=='178'){
		nlapiSetFieldValue('custbody_djkk_trans_appr_deal_flg', 'T');
	}
	if(nlapiGetFieldValue('customform')=='120'){
		if(type == 'create' || type == 'copy') {
			nlapiSetFieldValue('custbody_djkk_invoice_cirdit_flg','creditmemo')
		}
		if(type == 'edit'){
			if(isEmpty(nlapiGetFieldValue('custbody_djkk_invoice_cirdit_flg'))){
				nlapiSetFieldValue('custbody_djkk_invoice_cirdit_flg','creditmemo')
			}
		}
	}
	if(type=='edit'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'){
		setButtunButtonDisable('tbl__cancel');
		setButtunButtonDisable('tbl_secondary_cancel');
		setButtunButtonDisable('spn_CREATENEW_d1');
		setButtunButtonDisable('spn_secondaryCREATENEW_d1');		
		setButtunButtonDisable('spn_ACTIONMENU_d1');
		setButtunButtonDisable('spn_secondaryACTIONMENU_d1');		
	}
	// CH533 zheng 20230524 start
//	if(type == 'copy'||(type == 'create' && !isEmpty('createdfrom'))){
//		//copyの場合、ワークフロー履歴はクリアしてください
////		nlapiSetFieldValue('custbody_djkk_trans_appr_deal_flg',''); //DJ_承認処理フラグ
//		nlapiSetFieldValue('custbody_djkk_trans_appr_status'); //DJ_承認ステータス
//		nlapiSetFieldValue('custbody_djkk_trans_appr_create_user'); //DJ_作成者
//		nlapiSetFieldValue('custbody_djkk_trans_appr_create_role'); //DJ_作成ロール
//		
//		nlapiSetFieldValue('custbody_djkk_trans_appr_dev','');  //DJ_承認操作ロール
//		nlapiSetFieldValue('custbody_djkk_trans_appr_dev_user',''); //DJ_承認操作者
//		nlapiSetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt','');  //DJ_承認操作条件
//		nlapiSetFieldValue('custbody_djkk_trans_appr_user',''); //DJ_次の承認者
//		nlapiSetFieldValue('custbody_djkk_trans_appr_cdtn_amt',''); //DJ_次の承認条件
//		nlapiSetFieldValue('custbody_djkk_trans_appr1_role',''); //DJ_第一承認ロール
//		nlapiSetFieldValue('custbody_djkk_trans_appr1_user',''); //DJ_第一承認者
//		nlapiSetFieldValue('custbody_djkk_trans_appr2_role','');//DJ_第二承認ロール
//		nlapiSetFieldValue('custbody_djkk_trans_appr2_user',''); //DJ_第二承認者
//		
//		nlapiSetFieldValue('custbody_djkk_trans_appr3_role',''); //DJ_第三承認ロール
//		nlapiSetFieldValue('custbody_djkk_trans_appr3_user',''); //DJ_第三承認者
//		nlapiSetFieldValue('custbody_djkk_trans_appr4_role','');//DJ_第四承認ロール
//		nlapiSetFieldValue('custbody_djkk_trans_appr4_user','');//DJ_第四承認者
//		nlapiSetFieldValue('custbody_djkk_approval_reset_memo',''); //DJ_承認差戻メモ
//		nlapiSetFieldValue('custbody_djkk_approval_kyaltuka_memo',''); //DJ_承認却下メモ
//	}
	// CH533 zheng 20230524 start
}




function clientFieldChanged(type, name, linenum) {
	//20230207 add by zhou start CH320
	// DJ_納品先/顧客
	if((name == 'custbody_djkk_delivery_destination'||name == 'entity') && nlapiGetFieldValue('customform')== '120' ){
		var destinationID = nlapiGetFieldValue('custbody_djkk_delivery_destination');
		var entityId = nlapiGetFieldValue('entity');
		var cust=nlapiGetFieldValue('customform'); 
		if (name == 'custbody_djkk_delivery_destination') {
			if (!isEmpty(destinationID)) {
				var destinationRecord = nlapiLookupField('customrecord_djkk_delivery_destination', destinationID,['custrecord_djkk_customer','custrecord_djkk_sales','custrecord_djkk_prefectures','custrecord_djkk_municipalities','custrecord_djkk_delivery_residence','custrecord_djkk_delivery_residence2','custrecord_djkk_language_napin']);
				var customerID = destinationRecord.custrecord_djkk_customer;
				var salesID = destinationRecord.custrecord_djkk_sales;
				if (!isEmpty(customerID)) {
					nlapiSetFieldValue('entity', customerID,false,true);
					nlapiSetFieldValue('custbody_djkk_delivery_destination', destinationID,false,true);
				}
				
				if (!isEmpty(salesID)) {
					nlapiSetFieldValue('salesrep', salesID,false,true);
				}
			}
		}
		if(!isEmpty(destinationID)){
			var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destinationID); // DJ_納品先record
		}
		if(!isEmpty(nlapiGetFieldValue('entity'))){
			var custRecord = nlapiLoadRecord('customer',nlapiGetFieldValue('entity'));
		}
		var deliverySendMailFlag = false;
		if(!isEmpty(destinationID)){
				var deliveryPeriod = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_period');//DJ_納品書送信方法
				var deliverySiteFd = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_site_fd');//DJ_納品書送信先
				var deliveryPerson = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person');//DJ_納品書送信先担当者
				var deliverySubName = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_subname');//DJ_納品書送信先会社名(3RDパーティー)
				var deliveryPersont = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person_t');//DJ_納品書送信先担当者(3RDパーティー)
				var deliveryEmail = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_email');//DJ_納品書送信先メール(3RDパーティー)
				var deliveryFax = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_fax_three');//DJ_納品書送信先FAX(3RDパーティー)
				var deliveryMemo = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_memo');//DJ_納品書自動送信送付先備考
//				if(!isEmpty(deliveryPeriod)&& (deliveryPeriod !='10')&& (deliveryPeriod != '9')){
				    if(!isEmpty(deliveryPeriod)&& (deliveryPeriod != '9')){
					nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_納品書送信方法
					nlapiSetFieldValue('custbody_djkk_delivery_book_site_fd', deliverySiteFd,false);//DJ_納品書送信先
					nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);//DJ_納品書送信先担当者
					nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);//DJ_納品書送信先会社名(3RDパーティー)
					nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_納品書送信先担当者(3RDパーティー)
					nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);//DJ_納品書送信先メール(3RDパーティー)
					nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_納品書送信先FAX(3RDパーティー)
					nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo);//DJ_納品書自動送信備考  custbody_djkk_reference_column
				}else if(!isEmpty(deliveryPeriod) && (deliveryPeriod == '9')){
					deliverySendMailFlag = true;
					customerSendmails(deliverySendMailFlag,custRecord);
				}
		}else{
			deliverySendMailFlag = true;
			customerSendmails(deliverySendMailFlag,custRecord);
		}
		var newEntityId = nlapiGetFieldValue('entity');
		if(!isEmpty(newEntityId)){
			custRecord = nlapiLookupField('customer', newEntityId,['custentity_djkk_invoice_book_period','custentity_djkk_invoice_book_site']);
			var invoicePeriod = custRecord.custentity_djkk_invoice_book_period;//DJ_請求書送信区分
			var invoiceSite = custRecord.custentity_djkk_invoice_book_site;//DJ_請求書送信先区分
			nlapiSetFieldValue('custbody_djkk_invoice_book_period', invoicePeriod,false);
			nlapiSetFieldValue('custbody_djkk_invoice_book_site', invoiceSite,false);
		}
	}	
	if( name == 'custbody_djkk_delivery_book_site_fd'){
		var destination = nlapiGetFieldValue('custbody_djkk_delivery_destination') // 納品先
		var entity = nlapiGetFieldValue('entity') // 顧客
		var custForm = nlapiGetFieldValue('customform');
		if(custForm = '175'){  //fd
			if(!isEmpty(destination)){
				var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destination); // DJ_納品先record
			}
			if(!isEmpty(entity)){
				var custRecord = nlapiLoadRecord('customer',entity);
			}
			var deliverySite = nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd');   //DJ_納品書送信先
			if(deliverySite == '15'){   //DJ_納品書送信先 =納品先
				if(isEmpty(destination)){
					alert("DJ_納品先をお選びください")
					return false;
				}else{
					deliverySendMailChangeFormDelivery(deliveryRecord)
				}
			}else if(deliverySite == '16'){//DJ_納品書送信先 =顧客先
				if(isEmpty(entity)){
					alert("顧客をお選びください")
					return false;
				}else{
					deliverySendMailChangeFormCustomer(custRecord)
					}
			}else if(deliverySite == '14'){ //DJ_納品書送信先 =3rd
				if(!isEmpty(destination) || !isEmpty(entity)){
					if(!isEmpty(destination)){
					deliverySendMailChangeFormDelivery(deliveryRecord)
					}else{
					deliverySendMailChangeFormCustomer(custRecord)	
					}
				}
			}
		}	
	}
	//20230207 add by zhou end CH320
	if(name == 'entity'){
		var subsidiary = nlapiGetFieldValue('subsidiary');
		
		if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
			var entity = nlapiGetFieldValue('entity');
			
			var department = nlapiLookupField('customer', entity, 'custentity_djkk_activity');
			
			nlapiSetFieldValue('department',department);
		}
	}
	//add by zzq  20230703 CH699 start
	if(name=='custbody_djkk_delivery_date'){
        requestday=nlapiGetFieldValue('custbody_djkk_delivery_date');
        nlapiSetFieldValue('trandate',requestday, false, true); 
    }
	//add by zzq  20230703 CH699 end
}

//20221018 add by zhou start
//赤伝-納品書PDF出力
function pdfMaker(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_receipt_pdf','customdeploy_djkk_receipt_pdf');
	theLink+='&creditmemo='+nlapiGetRecordId();
	theLink+='&flag='+"creditmemo";
	window.open(theLink);
}
//20221018 add by zhou end

//20230129 add by zhou start
//個別請求書PDF出力
function invoicesPdfMaker(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_pdfmaker','customdeploy_djkk_sl_invoice_pdfmaker');
	theLink+='&creditmemoId='+nlapiGetRecordId();
	theLink+='&type='+'creditmemo';
	window.open(theLink);
}
//20230129 add by zhou start

function csclientSaveRecord(){
	//20230129 add by zhou start CH297 
	if(nlapiGetFieldValue('customform')== '178' || nlapiGetFieldValue('customform')== '120' ){
		var otherrefnum  = nlapiGetFieldValue('otherrefnum');//発注書番号
		if(!isEmpty(otherrefnum)){
			nlapiSetFieldValue('custbody_djkk_customerorderno',otherrefnum);//DJ_先方発注番号 
		}
	}
	 
	//20230130 add by song start U587 
	if(nlapiGetFieldValue('customform')== '120'){
		var shipping_typ  = nlapiGetFieldValue('custbody_djkk_finet_shipping_typ');//DJ_FINET出荷区分
		var delivery_destination = nlapiGetFieldValue('custbody_djkk_delivery_destination');//納品先
		var invFlag=nlapiGetFieldValue('custbody_4392_includeids');
		if (invFlag=='T') {
			if(isEmpty(shipping_typ)){
				if(confirm('DJ_FINET出荷区分を設定してください。')){
				}else{
					return false;
				}
			}
		}
		
		if(!isEmpty(shipping_typ)){
			if(isEmpty(delivery_destination)){
				if(confirm('DJ_納品先を設定してください。')){
				}else{
					return false;
				}
			}
		}
	}
	//20230130 add by song end U587 
	//end
//	if((saveType=='create'||saveType=='copy')&&nlapiGetFieldValue('customform')== '178'){
//		try{
//			
//			var record=nlapiCreateRecord('customrecord_djkk_credit_note_approval');	//DJ_クレジットメモ承認画面
//			
//			// 主要情報
//			record.setFieldValue('customform', '188');
//			record.setFieldValue('custrecord_djkk_create_note_subsidiary', nlapiGetFieldValue('subsidiary')); //DJ_子会社
//			
//			record.setFieldValue('custrecord_djkk_create_note_tranid', nlapiGetFieldValue('tranid'));  //入金番号
//			record.setFieldValue('custrecord_djkk_credit_note_customer', nlapiGetFieldValue('entity')); //顧客
//			record.setFieldValue('custrecord_djkk_create_note_date', nlapiGetFieldValue('trandate')); //日付
//			record.setFieldValue('custrecord_djkk_create_postingperiod', nlapiGetFieldValue('postingperiod')); //記帳期間
//			record.setFieldValue('custrecord_djkk_create_note_otherrefnum', nlapiGetFieldValue('otherrefnum')); //発注書番号
//			record.setFieldValue('custrecord_djkk_create_note_memo', nlapiGetFieldValue('memo')); //メモ
//			record.setFieldValue('custrecord_djkk_credit_note_usertotal', nlapiGetFieldValue('total'));//20230524 add by zhou金額(小計)
//			record.setFieldValue('custrecord_djkk_credit_note_createdfrom', nlapiGetFieldValue('createdfrom'));//作成元
//			
//			//出荷tab
//			record.setFieldValue('custrecord_djkk_create_note_operator', nlapiGetFieldValue('shipcarrier')); //DJ_配送業者
//			record.setFieldValue('custrecord_djkk_create_note_method', nlapiGetFieldValue('shipmethod')); //DJ_配送方法
//			record.setFieldValue('custrecord_djkk_create_note_tax_code', nlapiGetFieldValue('shippingtaxcode')); //DJ_配送料の税金コード
//			record.setFieldValue('custrecord_djkk_create_note_fee_code', nlapiGetFieldValue('handlingtaxcode')); //DJ_手数料の税金コード
//			record.setFieldValue('custrecord_djkk_create_note_materials', nlapiGetFieldValue('shippingcost')); //DJ_配送料
//			record.setFieldValue('custrecord_djkk_create_note_by_hand', nlapiGetFieldValue('handlingcost')); //DJ_手数料
//			record.setFieldValue('custrecord_djkk_create_note_medesc', nlapiGetFieldValue('custbody_djkk_deliverytimedesc')); //DJ_納入時間帯記述
//			record.setFieldValue('custrecord_djkk_create_note_registflg', nlapiGetFieldValue('custbody_djkk_deliverynotregistflg')); //DJ_納入先未登録フラグ
//			//会計tab
//			record.setFieldValue('custrecord_djkk_create_note_accounts', nlapiGetFieldValue('account')); //DJ_勘定科目
//			record.setFieldValue('custrecord_djkk_create_note_currency', nlapiGetFieldValue('currency')); //DJ_通貨
//			record.setFieldValue('custrecord_djkk_create_note_exchange_rat', nlapiGetFieldValue('exchangerate')); //DJ_為替レート
//			record.setFieldValue('custrecord_djkk_create_note_cost', nlapiGetFieldValue('totalcostestimate')); //DJ_予測拡張コスト
//			record.setFieldValue('custrecord_djkk_create_note_profit', nlapiGetFieldValue('estgrossprofit')); //DJ_見積総利益
//			record.setFieldValue('custrecord_djkk_create_note_gross_profit', nlapiGetFieldValue('estgrossprofitpercent')); //DJ_見積総利益の割合
//			
//			
//			//メール自動送信
//			record.setFieldValue('custrecord_djkk_cn_is_period', nlapiGetFieldValue('custbody_djkk_invoice_book_period'));//DJ_請求書送信区分
//			record.setFieldValue('custrecord_djkk_cn_is_book_site', nlapiGetFieldValue('custbody_djkk_invoice_book_site'));//DJ_請求書送信先区分
//			record.setFieldValue('custrecord_djkk_cn_is_book_person', nlapiGetFieldValue('custbody_djkk_invoice_book_person'));//DJ_請求書送信先担当者
//			record.setFieldValue('custrecord_djkk_cn_is_book_subname', nlapiGetFieldValue('custbody_djkk_invoice_book_subname'));//DJ_請求書送信先会社名 (3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_is_book_person_t', nlapiGetFieldValue('custbody_djkk_invoice_book_person_t'));//DJ_請求書送信先担当者(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_is_automatic_mailtr', nlapiGetFieldValue('custbody_djkk_invoice_automatic_mailtr'));//DJ_請求書送信先メール(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_is_automatic_faxtrd', nlapiGetFieldValue('custbody_djkk_invoice_automatic_faxtrd'));//DJ_請求書送信先FAX(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_is_destination_regi', nlapiGetFieldValue('custbody_djkk_invoice_destination_regi'));//DJ_請求書送信先登録メモ
//			
//			record.setFieldValue('custrecord_djkk_cn_de_period', nlapiGetFieldValue('custbody_djkk_delivery_book_period'));//DJ_価格入り納品書送信区分
//			record.setFieldValue('custrecord_djkk_cn_de_site_fd', nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd'));//DJ_価格入り納品書送信先区分
//			record.setFieldValue('custrecord_djkk_cn_de_person', nlapiGetFieldValue('custbody_djkk_delivery_book_person'));//DJ_価格入り納品書送信先担当者
//			record.setFieldValue('custrecord_djkk_cn_de_subname', nlapiGetFieldValue('custbody_djkk_delivery_book_subname'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_de_person_t', nlapiGetFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_de_email', nlapiGetFieldValue('custbody_djkk_delivery_book_email'));//DJ_価格入り納品書送信先メール(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_de_fax_three', nlapiGetFieldValue('custbody_djkk_delivery_book_fax_three'));//DJ_価格入り納品書送信先FAX(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_de_memo_so', nlapiGetFieldValue('custbody_djkk_delivery_book_memo_so'));//DJ_価格入り納品書送信先登録メモ
//			
//			record.setFieldValue('custrecord_djkk_cn_int_period', nlapiGetFieldValue('custbody_djkk_totalinv_period'));//DJ_合計請求書送信区分
//			record.setFieldValue('custrecord_djkk_cn_int_sendtype', nlapiGetFieldValue('custbody_djkk_totalinv_sendtype'));//DJ_合計請求書送信先区分
//			record.setFieldValue('custrecord_djkk_cn_int_sendcharge', nlapiGetFieldValue('custbody_djkk_totalinv_sendcharge'));//DJ_合計請求書送信先担当者
//			record.setFieldValue('custrecord_djkk_cn_int_sendsub3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendsub3rd'));//DJ_合計請求書送信先会社名(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_int_sendcharge3rd', nlapiGetFieldValue('custbody_djkk_totalin_sendcharge3rd'));//DJ_合計請求書送信先担当者(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_int_sendmail3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendmail3rd'));//DJ_合計請求書送信先メール(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_int_sendfax3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendfax3rd'));//DJ_合計請求書送信先FAX(3RDパーティー)
//			record.setFieldValue('custrecord_djkk_cn_int_sendmemo', nlapiGetFieldValue('custbody_djkk_totalinv_sendmemo'));//DJ_合計請求書送信先登録メモ
//
//			// 販売情報
//			record.setFieldValue('custrecord_djkk_create_note_salesrep', nlapiGetFieldValue('salesrep')); //DJ_営業担当者
//			record.setFieldValue('custrecord_djkk_create_saleseffectivedat', nlapiGetFieldValue('saleseffectivedate')); //DJ_コミッション基準日
//			
//			// 承認情報
//			var roleValue = nlapiGetRole();
//			var userValue = nlapiGetUser();
//				
//			var subsidiary = nlapiGetFieldValue('subsidiary');
//			var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//トランザクション承認管理表
//					[
//					   ["isinactive","is","F"], 
//					   "AND", 
//					   ["custrecord_djkk_trans_appr_obj","anyof",5],
//					   "AND",
//					   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
//					], 
//					[
//					   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //作成ロール
//					   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //第一承認ロール
//					   
//					]
//					);
//			if(!isEmpty(approvalSearch)){
//				for(var j = 0; j < approvalSearch.length; j++){
//					var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//作成ロール
//					var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//第一承認ロール
//					if(createRole == roleValue){
//						record.setFieldValue('custrecord_djkk_create_note_createrole',createRole);//DJ_作成ロール
//						record.setFieldValue('custrecord_djkk_create_note_autho_role',appr1_role); //DJ_次の承認ロール
//					}
//				}
//			}
//			record.setFieldValue('custrecord_djkk_create_note_flg', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg')); //DJ_承認処理フラグ
//			record.setFieldValue('custrecord_djkk_create_note_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status')); //DJ_承認ステータス
//			record.setFieldValue('custrecord_djkk_create_note_createuser', userValue); //DJ_作成者
//
//			record.setFieldValue('custrecord_djkk_create_note_oper_roll', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));  //DJ_承認操作ロール
//			record.setFieldValue('custrecord_djkk_create_note_acknowledge', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user')); //DJ_承認操作者
//			record.setFieldValue('custrecord_djkk_create_note_opera_condit', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));  //DJ_承認操作条件
//			record.setFieldValue('custrecord_djkk_create_note_next_approve', nlapiGetFieldValue('custbody_djkk_trans_appr_user')); //DJ_次の承認者
//			record.setFieldValue('custrecord_djkk_create_note_appro_criter', nlapiGetFieldValue('custbody_djkk_trans_appr_cdtn_amt')); //DJ_次の承認条件
//			record.setFieldValue('custrecord_djkk_create_note_first_role', nlapiGetFieldValue('custbody_djkk_trans_appr1_role')); //DJ_第一承認ロール
//			record.setFieldValue('custrecord_djkk_create_note_first_user', nlapiGetFieldValue('custbody_djkk_trans_appr1_user')); //DJ_第一承認者
//			record.setFieldValue('custrecord_djkk_create_note_second_role', nlapiGetFieldValue('custbody_djkk_trans_appr2_role'));//DJ_第二承認ロール
//			record.setFieldValue('custrecord_djkk_create_note_second_user', nlapiGetFieldValue('custbody_djkk_trans_appr2_user')); //DJ_第二承認者
//			
//			record.setFieldValue('custrecord_djkk_create_note_third_role', nlapiGetFieldValue('custbody_djkk_trans_appr3_role')); //DJ_第三承認ロール
//			record.setFieldValue('custrecord_djkk_create_note_third_user', nlapiGetFieldValue('custbody_djkk_trans_appr3_user')); //DJ_第三承認者
//			record.setFieldValue('custrecord_djkk_create_note_fourth_role', nlapiGetFieldValue('custbody_djkk_trans_appr4_role')); //DJ_第四承認ロール
//			record.setFieldValue('custrecord_djkk_create_note_fourth_uesr', nlapiGetFieldValue('custbody_djkk_trans_appr4_user')); //DJ_第四承認者
//			record.setFieldValue('custrecord_djkk_create_note_rever_memo', nlapiGetFieldValue('custbody_djkk_approval_reset_memo')); //DJ_承認差戻メモ
//			record.setFieldValue('custrecord_djkk_approval_kyaltuka_memo', nlapiGetFieldValue('custbody_djkk_approval_kyaltuka_memo')); //DJ_承認却下メモ // 20230522 add by zhou
//			// 分類
////			record.setFieldValue('custrecord_djkk_create_note_subsidiary', nlapiGetFieldValue('subsidiary')); //DJ_子会社
//			record.setFieldValue('custrecord_djkk_create_note_department', nlapiGetFieldValue('department')); //セクション
//			record.setFieldValue('custrecord_djkk_create_note_bulkprocsubm', nlapiGetFieldValue('bulkprocsubmission')); //送信ID
//			// CH144 zheng 20230516 start
//			// record.setFieldValue('custrecord_djkk_create_note_rate_s1', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s1')); //DJ_第1予約レート
//			// CH144 zheng 20230516 end
//			record.setFieldValue('custrecord_djkk_create_note_opc_flg', nlapiGetFieldValue('custbody_djkk_exsystem_opc_flg')); //DJ_前払金受領済フラグ
//			record.setFieldValue('custrecord_djkk_create_note_date_time', nlapiGetFieldValue('custbody_djkk_exsystem_send_date_time')); //DJ_外部システム送信日時
//			record.setFieldValue('custrecord_djkk_create_note_includeids', nlapiGetFieldValue('custbody_4392_includeids')); //締め請求書に含める
//			record.setFieldValue('custrecord_djkk_create_note_sales', nlapiGetFieldValue('custbody_djkk_company_sales')); //DJ_社販対象
//			record.setFieldValue('custrecord_djkk_create_note_end_user', nlapiGetFieldValue('custbody_djkk_end_user')); //DJ_エンドユーザー
//			record.setFieldValue('custrecord_djkk_create_note_destination', nlapiGetFieldValue('custbody_djkk_delivery_destination')); //DJ_納品先
//			record.setFieldValue('custrecord_djkk_create_note_conditions', nlapiGetFieldValue('custbody_djkk_payment_conditions')); //DJ_支払条件
//			record.setFieldValue('custrecord_djkk_create_note_registration', nlapiGetFieldValue('custbody_djkk_gst_registration')); //DJ_GST登録番号
//			record.setFieldValue('custrecord_djkk_create_note_deliverynote', nlapiGetFieldValue('custbody_djkk_deliverynote')); //DJ_納品書自動送信
//			record.setFieldValue('custrecord_djkk_create_note_instructions', nlapiGetFieldValue('custbody_djkk_shipping_instructions_f')); //DJ_出荷指示
//			record.setFieldValue('custrecord_djkk_create_note_person', nlapiGetFieldValue('custbody_djkk_shipment_person')); //DJ_出荷担当者
//			record.setFieldValue('custrecord_djkk_create_note_location', nlapiGetFieldValue('location')); //DJ_場所
//			record.setFieldValue('custrecord_djkk_create_note_methodtyp', nlapiGetFieldValue('custbody_djkk_paymentmethodtyp')); //DJ_支払方法区分
//			record.setFieldValue('custrecord_djkk_create_note_deliveryrule', nlapiGetFieldValue('custbody_djkk_deliveryruledesc')); //DJ_納入先毎在庫引当条件
//			record.setFieldValue('custrecord_djkk_create_note_cautiondesc', nlapiGetFieldValue('custbody_djkk_cautiondesc')); //DJ_注意事項
//			record.setFieldValue('custrecord_djkk_create_note_wmsmemo1', nlapiGetFieldValue('custbody_djkk_wmsmemo1')); //DJ_倉庫向け備考１
//			record.setFieldValue('custrecord_djkk_create_note_deliverermem', nlapiGetFieldValue('custbody_djkk_deliverermemo1')); //DJ_運送会社向け備考
//			record.setFieldValue('custrecord_djkk_create_note_deliverymemo', nlapiGetFieldValue('custbody_djkk_deliverynotememo')); //DJ_納品書備考
//			record.setFieldValue('custrecord_djkk_create_note_orderrequeid', nlapiGetFieldValue('custbody_djkk_orderrequestid')); //DJ_注文依頼ID
//			record.setFieldValue('custrecord_djkk_create_note_netflg', nlapiGetFieldValue('custbody_djkk_netsuitetransflg')); //DJ_NETSUITE連携フラグ
//			record.setFieldValue('custrecord_djkk_create_note_nstructdt', nlapiGetFieldValue('custbody_djkk_shippinginstructdt')); //DJ_出荷指示日時
//			record.setFieldValue('custrecord_djkk_create_note_merorderno', nlapiGetFieldValue('custbody_djkk_customerorderno')); //DJ_先方発注番号
//			record.setFieldValue('custrecord_djkk_create_note_ingsaleflg', nlapiGetFieldValue('custbody_djkk_consignmentbuyingsaleflg')); //DJ_消化仕入売上フラグ
//			record.setFieldValue('custrecord_djkk_create_note_hopedate', nlapiGetFieldValue('custbody_djkk_delivery_hopedate')); //DJ_納品希望日
//			record.setFieldValue('custrecord_djkk_create_note_class', nlapiGetFieldValue('class')); //ブランド
//			record.setFieldValue('custrecord_djkk_create_note_wmsmemo2', nlapiGetFieldValue('custbody_djkk_wmsmemo2')); //DJ_倉庫向け備考２
//			record.setFieldValue('custrecord_djkk_create_note_wmsmemo3', nlapiGetFieldValue('custbody_djkk_wmsmemo3')); //DJ_倉庫向け備考3
//			record.setFieldValue('custrecord_djkk_create_note_send', nlapiGetFieldValue('custbody_djkk_warehouse_sent')); //DJ_倉庫送信済み
//			record.setFieldValue('custrecord_djkk_create_note_coname', nlapiGetFieldValue('custbody_djkk_finetkanaofferconame')); //DJ_FINETカナ提供企業名
//			record.setFieldValue('custrecord_djkk_create_note_cooffice', nlapiGetFieldValue('custbody_djkk_finetkanaoffercooffice')); //DJ_FINETカナ提供企業参照事業所名
//			record.setFieldValue('custrecord_djkk_create_note_stomername', nlapiGetFieldValue('custbody_djkk_finetkanacustomername')); //DJ_FINETカナ社名・店名・取引先名
//			record.setFieldValue('custrecord_djkk_create_note_address', nlapiGetFieldValue('custbody_djkk_finetkanacustomeraddress')); //DJ_FINETカナ住所
//			record.setFieldValue('custrecord_djkk_create_note_invflg', nlapiGetFieldValue('custbody_djkk_invoicetotal_flag')); //DJ_合計請求書作成済みフラグ
//			record.setFieldValue('custrecord_djkk_create_note_base_date', nlapiGetFieldValue('custbody_djkk_rios_base_date')); //DJ_RIOS基準日
//			record.setFieldValue('custrecord_djkk_create_note_netsuitetran', nlapiGetFieldValue('custbodycustbody_djkk_netsuitetransdt')); //DJ_NETSUITE連携日時
//			record.setFieldValue('custrecord_djkk_create_note_language', nlapiGetFieldValue('custbody_djkk_language')); //DJ_言語
//			record.setFieldValue('custrecord_djkk_create_note_ids_date', nlapiGetFieldValue('custbody_suitel10n_jp_ids_date')); //締め請求書期日
//			record.setFieldValue('custrecord_djkk_create_note_due_date', nlapiGetFieldValue('custbody_jp_invoice_summary_due_date')); //DJ_INVOICE SUMMARY DUE DATE
//			record.setFieldValue('custrecord_djkk_create_note_delivererme2', nlapiGetFieldValue('custbody_djkk_deliverermemo2')); //DJ_運送会社向け備考2
//			// CH144 zheng 20230516 start
//			//record.setFieldValue('custrecord_djkk_create_note_rate_yen', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_yen')); //DJ_円貨支払
//			//record.setFieldValue('custrecord_djkk_create_note_rate_s2', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s2')); //DJ_第2予約レート
//			//record.setFieldValue('custrecord_djkk_create_note_rate_s3', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s3')); //DJ_第3予約レート
//			//record.setFieldValue('custrecord_djkk_create_note_rate_f', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_f')); //DJ_外貨支払データ作成
//			// CH144 zheng 20230516 end
//			record.setFieldValue('custrecord_djkk_create_note_delive', nlapiGetFieldValue('custbody_djkk_reference_delive')); //DJ_納期回答備考欄
//			record.setFieldValue('custrecord_djkk_create_note_column', nlapiGetFieldValue('custbody_djkk_reference_column')); //DJ_納品書備考欄
//			record.setFieldValue('custrecord_djkk_create_note_reference', nlapiGetFieldValue('custbody_djkk_request_reference_bar')); //DJ_請求書備考欄
//			record.setFieldValue('custrecord_djkk_create_note_day', nlapiGetFieldValue('custbody_djkk_annotation_day')); //DJ_注文日
//			record.setFieldValue('custrecord_djkk_create_note_process', nlapiGetFieldValue('custbody_15699_exclude_from_ep_process')); //EXCLUDE FROM ELECTRONIC BANK PAYMENTS PROCESSING
//			record.setFieldValue('custrecord_djkk_create_note_precautions', nlapiGetFieldValue('custbody_djkk_delivery_precautions')); //DJ_納品先注意事項
//			record.setFieldValue('custrecord_djkk_create_note_precautionss', nlapiGetFieldValue('custbody_djkk_customer_precautions')); //DJ_顧客注意事項	
//			record.setFieldValue('custrecord_djkk_create_note_instructflg', nlapiGetFieldValue('custbody_djkk_shipping_instructions')); // DJ_出荷指示済み
//			record.setFieldValue('custrecord_djkk_create_note_deliveryadd', nlapiGetFieldValue('custbody_djkk_delivery_address')); //DJ_納品先住所
//			record.setFieldValue('custrecord_djkk_create_note_customeradd', nlapiGetFieldValue('custbody_djkk_customer_address')); //DJ_顧客住所
//			record.setFieldValue('custrecord_djkk_create_note_ready', nlapiGetFieldValue('custbody_djkk_sendmail_ready')); //DJ_準備完了
//			record.setFieldValue('custrecord_djkk_create_note_destemail', nlapiGetFieldValue('custbody_djkk_shippinginfodestemail')); //DJ_出荷案内送付先メール
//			record.setFieldValue('custrecord_djkk_create_note_fax', nlapiGetFieldValue('custbody_djkk_shippinginfodestfax')); //DJ_出荷案内送付先FAX
//			record.setFieldValue('custrecord_djkk_create_note_destname', nlapiGetFieldValue('custbody_djkk_shippinginfodestname')); //DJ_出荷案内送付先宛名
//			record.setFieldValue('custrecord_djkk_create_note_desttyp', nlapiGetFieldValue('custbody_djkk_shippinginfodesttyp')); //DJ_出荷案内送付先区分
//			record.setFieldValue('custrecord_djkk_create_note_sendtyp', nlapiGetFieldValue('custbody_djkk_shippinginfosendtyp')); //DJ_出荷案内送信区分
//
//			var counts=nlapiGetLineItemCount('item');
//			for(var i=1;i<counts+1;i++){
//				nlapiSelectLineItem('item', i);
//				var inventoryDetail=nlapiViewCurrentLineItemSubrecord('item','inventorydetail');
//				if(!isEmpty(inventoryDetail)){
//					var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
//					for(var m = 1 ; m < invCount+1 ; m++){
//						inventoryDetail.selectLineItem('inventoryassignment', m);
//						record.selectNewLineItem('recmachcustrecord_djkk_credit_note_approval');
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id',i); //DJ_クレジットメモ明細行番号
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_create_note_detail_item',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_アイテム
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantity',nlapiGetCurrentLineItemValue('item', 'quantity'));//DJ_数量
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_unit',nlapiGetCurrentLineItemValue('item', 'units'));//DJ_単位
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_explain',nlapiGetCurrentLineItemValue('item', 'description'));//DJ_説明
//						//20230522 changed by zhou start
//						//カスタムレコードはidが'-1'のオプションをサポートしていません
//						var priceCode = nlapiGetCurrentLineItemValue('item', 'price')
//						if(priceCode != -1){
//							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_grid_level',priceCode);//DJ_価格水準
//						}
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_rate',nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_単価/率
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_amount',nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_金額
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_taxcode',nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_税金コード
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_rate',nlapiGetCurrentLineItemValue('item', 'taxrate1'));//DJ_税率
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_total',nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_総額
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_amount',nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_税額
//////						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_option',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_オプション
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_type',nlapiGetCurrentLineItemValue('item', 'costestimatetype'));//DJ_原価見積の種類
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_expansion_cost',nlapiGetCurrentLineItemValue('item', 'costestimate'));//DJ_予測拡張コスト
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_see_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofit'));//DJ_見積総利益
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_gross_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofitpercent'));//DJ_見積総利益の割合
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_priming',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_automatic_allocation'));//DJ_自動引当
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custnum',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customer_order_number'));//DJ_顧客の発注番号
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_temperature',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_temperature'));//DJ_温度
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_test_report',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_testbook_supplement'));//DJ_試験書添付
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_sample_type',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_type'));//DJ_サンプル種別
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_informatio',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rate_informatio'));//DJ_レート情報
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_english',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_commodity_english'));//DJ_商品英語名
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_charge_number',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_charge_number'));//DJ_荷数
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_ampm',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_ampm'));//DJ_AM・PM
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_specifications',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_specifications'));//DJ_規格
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_document_flag',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_included_document_flag'));//DJ_同梱書類フラグ
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_perunitquantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity'));//DJ_入数
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_casequantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_casequantity'));//DJ_ケース数
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantitys',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_quantity'));//DJ_バラ数
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverytemptyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverytemptyp'));//DJ_配送温度区分
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nextshipmentdesc',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nextshipmentdesc'));//DJ_欠品次回出荷予定記述
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverynotememo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverynotememo'));//DJ_納品書備考
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestid',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestid'));//DJ_注文依頼ID
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestlinen',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestlineno'));//DJ_依頼明細行番号
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestquant',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestquantity'));//DJ_依頼数量
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_partshortagetyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_partshortagetyp'));//DJ_部分欠品区分
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custody_item',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item'));//DJ_預かりアイテム
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_memo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_wms_line_memo'));//DJ_倉庫向け明細備考
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_description',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_finetkanaitemdescription'));//DJ_FINETカナ商品名
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_divideflg',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestdivideflg'));//DJ_依頼分割済フラグ
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nuclide',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nuclide'));//DJ_2_核種
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_user_num',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_num'));//DJ_RIOSユーザ管理番号
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_remark',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_remark'));//DJ_RIOSユーザ備考
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_item_code',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_item_code'));//DJ_アイテム(コード)
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderdetailtyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderdetailtyp'));//DJ_注文明細状態区分
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_file_format',nlapiGetCurrentLineItemValue('item', 'custcol_9572_dd_file_format'));//DJ_口座引落ファイル・フォーマット
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quoted_amount',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_quoted_amount'));//DJ_代引金額(佐川）
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_guarantee_fund',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_guarantee_fund'));//DJ_保険金(佐川）
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_delivery',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_payment_delivery'));//DJ_配送指示時の納品書添付
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_printing',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_receipt_printing'));//DJ_受領書印刷
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_category',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_category'));//DJ_サンプル品カテゴリ
//						if(!isEmpty(inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'))){
//							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber')); //DJ_シリアル/ロット番号ID
//						}else{
//							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber'));//DJ_シリアル/ロット番号		
//						}	
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_shednum',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber')); //DJ_保管棚
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));//DJ_有効期限
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));//DJ_メーカー製造ロット番号
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_serial',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));//DJ_メーカーシリアル番号
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_manufacture_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));//DJ_製造年月日
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_probably_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));//DJ_残出荷可能期間/DJ_出荷可能期限日
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_warehouse_no',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));//DJ_倉庫入庫番号
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));//DJ_SMC番号
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_remark',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));//DJ_ロットリマーク
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_memo',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));//DJ_ロットメモ
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_inventory_quantit',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));     //DJ_在庫詳細明細行数量
//						record.commitLineItem('recmachcustrecord_djkk_credit_note_approval');	
//						
////						
//					}
//				}else{
////					
//					inventoryDetail.selectLineItem('inventoryassignment', m);
//					record.selectNewLineItem('recmachcustrecord_djkk_credit_note_approval');
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id',i); //DJ_クレジットメモ明細行番号
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_create_note_detail_item',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_アイテム
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantity',nlapiGetCurrentLineItemValue('item', 'quantity'));//DJ_数量
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_unit',nlapiGetCurrentLineItemValue('item', 'units'));//DJ_単位
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_explain',nlapiGetCurrentLineItemValue('item', 'description'));//DJ_説明
//					//20230522 changed by zhou start
//					//カスタムレコードはidが'-1'のオプションをサポートしていません
//					var priceCode = nlapiGetCurrentLineItemValue('item', 'price')
//					if(priceCode != -1){
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_grid_level',priceCode);//DJ_価格水準
//					}
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_rate',nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_単価/率
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_amount',nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_金額
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_taxcode',nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_税金コード
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_rate',nlapiGetCurrentLineItemValue('item', 'taxrate1'));//DJ_税率
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_total',nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_総額
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_amount',nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_税額
//////					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_option',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_オプション
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_type',nlapiGetCurrentLineItemValue('item', 'costestimatetype'));//DJ_原価見積の種類
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_expansion_cost',nlapiGetCurrentLineItemValue('item', 'costestimate'));//DJ_予測拡張コスト
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_see_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofit'));//DJ_見積総利益
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_gross_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofitpercent'));//DJ_見積総利益の割合
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_priming',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_automatic_allocation'));//DJ_自動引当
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custnum',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customer_order_number'));//DJ_顧客の発注番号
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_temperature',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_temperature'));//DJ_温度
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_test_report',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_testbook_supplement'));//DJ_試験書添付
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_sample_type',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_type'));//DJ_サンプル種別
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_informatio',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rate_informatio'));//DJ_レート情報
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_english',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_commodity_english'));//DJ_商品英語名
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_charge_number',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_charge_number'));//DJ_荷数
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_ampm',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_ampm'));//DJ_AM・PM
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_specifications',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_specifications'));//DJ_規格
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_document_flag',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_included_document_flag'));//DJ_同梱書類フラグ
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_perunitquantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity'));//DJ_入数
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_casequantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_casequantity'));//DJ_ケース数
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantitys',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_quantity'));//DJ_バラ数
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverytemptyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverytemptyp'));//DJ_配送温度区分
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nextshipmentdesc',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nextshipmentdesc'));//DJ_欠品次回出荷予定記述
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverynotememo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverynotememo'));//DJ_納品書備考
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestid',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestid'));//DJ_注文依頼ID
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestlinen',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestlineno'));//DJ_依頼明細行番号
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestquant',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestquantity'));//DJ_依頼数量
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_partshortagetyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_partshortagetyp'));//DJ_部分欠品区分
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custody_item',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item'));//DJ_預かりアイテム
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_memo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_wms_line_memo'));//DJ_倉庫向け明細備考
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_description',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_finetkanaitemdescription'));//DJ_FINETカナ商品名
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_divideflg',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestdivideflg'));//DJ_依頼分割済フラグ
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nuclide',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nuclide'));//DJ_2_核種
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_user_num',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_num'));//DJ_RIOSユーザ管理番号
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_remark',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_remark'));//DJ_RIOSユーザ備考
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_item_code',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_item_code'));//DJ_アイテム(コード)
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderdetailtyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderdetailtyp'));//DJ_注文明細状態区分
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_file_format',nlapiGetCurrentLineItemValue('item', 'custcol_9572_dd_file_format'));//DJ_口座引落ファイル・フォーマット
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quoted_amount',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_quoted_amount'));//DJ_代引金額(佐川）
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_guarantee_fund',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_guarantee_fund'));//DJ_保険金(佐川）
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_delivery',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_payment_delivery'));//DJ_配送指示時の納品書添付
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_printing',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_receipt_printing'));//DJ_受領書印刷
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_category',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_category'));//DJ_サンプル品カテゴリ
//					record.commitLineItem('recmachcustrecord_djkk_credit_note_approval');	
//					
//				}
//			}
//			var custRecordId=nlapiSubmitRecord(record, true, true);
//			var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_credit_note_approval',custRecordId, 'VIEW');
//			window.ischanged = false;
//			window.location.href=theLink;	   			
//			 return false;
//			
//		}catch(e){
//			   alert(e.message);
//			   return false;
//		   }	
//	}
	
	
	 if(saveType=='edit'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'&&!isEmpty(nlapiGetFieldValue('custbody_djkk_creditmemo_id'))){
		 try{
			 
			 var record= nlapiLoadRecord('customrecord_djkk_credit_note_approval',nlapiGetFieldValue('custbody_djkk_creditmemo_id'));
			// 主要情報
//				record.setFieldValue('customform', '188');//20230615 changed by zhou
				record.setFieldValue('custrecord_djkk_create_note_tranid', nlapiGetFieldValue('tranid'));  //入金番号
				record.setFieldValue('custrecord_djkk_credit_note_customer', nlapiGetFieldValue('entity')); //顧客
				record.setFieldValue('custrecord_djkk_create_note_date', nlapiGetFieldValue('trandate')); //日付
				record.setFieldValue('custrecord_djkk_create_postingperiod', nlapiGetFieldValue('postingperiod')); //記帳期間
				record.setFieldValue('custrecord_djkk_create_note_otherrefnum', nlapiGetFieldValue('otherrefnum')); //発注書番号
				record.setFieldValue('custrecord_djkk_create_note_memo', nlapiGetFieldValue('memo')); //メモ
				record.setFieldValue('custrecord_djkk_credit_note_usertotal', nlapiGetFieldValue('total'));//20230524 add by zhou金額(小計)
//				record.setFieldValue('custrecord_djkk_credit_note_createdfrom', nlapiGetFieldValue('createdfrom'));//作成元
				record.setFieldValue('custrecord_djkk_credit_creditmemo', '');  //DJ_クレジットメモ 20230616 add by zhou
//				alert('作成元2'+nlapiGetFieldValue('createdfrom'))
				
				
				//メール自動送信
				record.setFieldValue('custrecord_djkk_cn_is_period', nlapiGetFieldValue('custbody_djkk_invoice_book_period'));//DJ_請求書送信区分
				record.setFieldValue('custrecord_djkk_cn_is_book_site', nlapiGetFieldValue('custbody_djkk_invoice_book_site'));//DJ_請求書送信先区分
				record.setFieldValue('custrecord_djkk_cn_is_book_person', nlapiGetFieldValue('custbody_djkk_invoice_book_person'));//DJ_請求書送信先担当者
				record.setFieldValue('custrecord_djkk_cn_is_book_subname', nlapiGetFieldValue('custbody_djkk_invoice_book_subname'));//DJ_請求書送信先会社名 (3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_is_book_person_t', nlapiGetFieldValue('custbody_djkk_invoice_book_person_t'));//DJ_請求書送信先担当者(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_is_automatic_mailtr', nlapiGetFieldValue('custbody_djkk_invoice_automatic_mailtr'));//DJ_請求書送信先メール(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_is_automatic_faxtrd', nlapiGetFieldValue('custbody_djkk_invoice_automatic_faxtrd'));//DJ_請求書送信先FAX(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_is_destination_regi', nlapiGetFieldValue('custbody_djkk_invoice_destination_regi'));//DJ_請求書送信先登録メモ
				
				record.setFieldValue('custrecord_djkk_cn_de_period', nlapiGetFieldValue('custbody_djkk_delivery_book_period'));//DJ_価格入り納品書送信区分
				record.setFieldValue('custrecord_djkk_cn_de_site_fd', nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd'));//DJ_価格入り納品書送信先区分
				record.setFieldValue('custrecord_djkk_cn_de_person', nlapiGetFieldValue('custbody_djkk_delivery_book_person'));//DJ_価格入り納品書送信先担当者
				record.setFieldValue('custrecord_djkk_cn_de_subname', nlapiGetFieldValue('custbody_djkk_delivery_book_subname'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_de_person_t', nlapiGetFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_de_email', nlapiGetFieldValue('custbody_djkk_delivery_book_email'));//DJ_価格入り納品書送信先メール(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_de_fax_three', nlapiGetFieldValue('custbody_djkk_delivery_book_fax_three'));//DJ_価格入り納品書送信先FAX(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_de_memo_so', nlapiGetFieldValue('custbody_djkk_delivery_book_memo_so'));//DJ_価格入り納品書送信先登録メモ
				
				record.setFieldValue('custrecord_djkk_cn_int_period', nlapiGetFieldValue('custbody_djkk_totalinv_period'));//DJ_合計請求書送信区分
				record.setFieldValue('custrecord_djkk_cn_int_sendtype', nlapiGetFieldValue('custbody_djkk_totalinv_sendtype'));//DJ_合計請求書送信先区分
				record.setFieldValue('custrecord_djkk_cn_int_sendcharge', nlapiGetFieldValue('custbody_djkk_totalinv_sendcharge'));//DJ_合計請求書送信先担当者
				record.setFieldValue('custrecord_djkk_cn_int_sendsub3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendsub3rd'));//DJ_合計請求書送信先会社名(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_int_sendcharge3rd', nlapiGetFieldValue('custbody_djkk_totalin_sendcharge3rd'));//DJ_合計請求書送信先担当者(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_int_sendmail3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendmail3rd'));//DJ_合計請求書送信先メール(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_int_sendfax3rd', nlapiGetFieldValue('custbody_djkk_totalinv_sendfax3rd'));//DJ_合計請求書送信先FAX(3RDパーティー)
				record.setFieldValue('custrecord_djkk_cn_int_sendmemo', nlapiGetFieldValue('custbody_djkk_totalinv_sendmemo'));//DJ_合計請求書送信先登録メモ
				
				
				// 販売情報
//				record.setFieldValue('custrecord_djkk_create_note_salesrep', nlapiGetFieldValue('salesrep')); //DJ_営業担当者
				record.setFieldValue('custrecord_djkk_create_saleseffectivedat', nlapiGetFieldValue('saleseffectivedate')); //DJ_コミッション基準日
				
				//出荷tab
				record.setFieldValue('custrecord_djkk_create_note_operator', nlapiGetFieldValue('shipcarrier')); //DJ_配送業者
				record.setFieldValue('custrecord_djkk_create_note_method', nlapiGetFieldValue('shipmethod')); //DJ_配送方法
				record.setFieldValue('custrecord_djkk_create_note_tax_code', nlapiGetFieldValue('shippingtaxcode')); //DJ_配送料の税金コード
				record.setFieldValue('custrecord_djkk_create_note_fee_code', nlapiGetFieldValue('handlingtaxcode')); //DJ_手数料の税金コード
				record.setFieldValue('custrecord_djkk_create_note_materials', nlapiGetFieldValue('shippingcost')); //DJ_配送料
				record.setFieldValue('custrecord_djkk_create_note_by_hand', nlapiGetFieldValue('handlingcost')); //DJ_手数料
				record.setFieldValue('custrecord_djkk_create_note_medesc', nlapiGetFieldValue('custbody_djkk_deliverytimedesc')); //DJ_納入時間帯記述
				record.setFieldValue('custrecord_djkk_create_note_registflg', nlapiGetFieldValue('custbody_djkk_deliverynotregistflg')); //DJ_納入先未登録フラグ
				//会計tab
				record.setFieldValue('custrecord_djkk_create_note_accounts', nlapiGetFieldValue('account')); //DJ_勘定科目
				record.setFieldValue('custrecord_djkk_create_note_currency', nlapiGetFieldValue('currency')); //DJ_通貨
				record.setFieldValue('custrecord_djkk_create_note_exchange_rat', nlapiGetFieldValue('exchangerate')); //DJ_為替レート
				record.setFieldValue('custrecord_djkk_create_note_cost', nlapiGetFieldValue('totalcostestimate')); //DJ_予測拡張コスト
				record.setFieldValue('custrecord_djkk_create_note_profit', nlapiGetFieldValue('estgrossprofit')); //DJ_見積総利益
				record.setFieldValue('custrecord_djkk_create_note_gross_profit', nlapiGetFieldValue('estgrossprofitpercent')); //DJ_見積総利益の割合
				
				
				// 承認情報
				record.setFieldValue('custrecord_djkk_create_note_flg', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg')); //DJ_承認処理フラグ
				record.setFieldValue('custrecord_djkk_create_note_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status')); //DJ_承認ステータス
				record.setFieldValue('custrecord_djkk_create_note_createuser', nlapiGetFieldValue('custbody_djkk_trans_appr_create_user')); //DJ_作成者
				record.setFieldValue('custrecord_djkk_create_note_createrole', nlapiGetFieldValue('custbody_djkk_trans_appr_create_role')); //DJ_作成ロール
//				record.setFieldValue('custrecord_djkk_create_note_createuser', nlapiGetFieldValue('custbody_djkk_trans_appr_create_user')); //DJ_作成者
				record.setFieldValue('custrecord_djkk_create_note_oper_roll', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));  //DJ_承認操作ロール
				record.setFieldValue('custrecord_djkk_create_note_acknowledge', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user')); //DJ_承認操作者
				record.setFieldValue('custrecord_djkk_create_note_opera_condit', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));  //DJ_承認操作条件
				
				record.setFieldValue('custrecord_djkk_create_note_autho_role', nlapiGetFieldValue('custbody_djkk_trans_appr_next_role')); //DJ_次の承認ロール
				record.setFieldValue('custrecord_djkk_create_note_next_approve', nlapiGetFieldValue('custbody_djkk_trans_appr_user')); //DJ_次の承認者
				record.setFieldValue('custrecord_djkk_create_note_appro_criter', nlapiGetFieldValue('custbody_djkk_trans_appr_cdtn_amt')); //DJ_次の承認条件
				record.setFieldValue('custrecord_djkk_create_note_first_role', nlapiGetFieldValue('custbody_djkk_trans_appr1_role')); //DJ_第一承認ロール
				record.setFieldValue('custrecord_djkk_create_note_first_user', nlapiGetFieldValue('custbody_djkk_trans_appr1_user')); //DJ_第一承認者
				record.setFieldValue('custrecord_djkk_create_note_second_role', nlapiGetFieldValue('custbody_djkk_trans_appr2_role'));//DJ_第二承認ロール
				record.setFieldValue('custrecord_djkk_create_note_second_user', nlapiGetFieldValue('custbody_djkk_trans_appr2_user')); //DJ_第二承認者
				
				record.setFieldValue('custrecord_djkk_create_note_third_role', nlapiGetFieldValue('custbody_djkk_trans_appr3_role')); //DJ_第三承認ロール
				record.setFieldValue('custrecord_djkk_create_note_third_user', nlapiGetFieldValue('custbody_djkk_trans_appr3_user')); //DJ_第三承認者
				record.setFieldValue('custrecord_djkk_create_note_fourth_role', nlapiGetFieldValue('custbody_djkk_trans_appr4_role')); //DJ_第四承認ロール
				record.setFieldValue('custrecord_djkk_create_note_fourth_uesr', nlapiGetFieldValue('custbody_djkk_trans_appr4_user')); //DJ_第四承認者
				record.setFieldValue('custrecord_djkk_create_note_rever_memo', nlapiGetFieldValue('custbody_djkk_approval_reset_memo')); //DJ_承認差戻メモ
				record.setFieldValue('custrecord_djkk_approval_kyaltuka_memo', nlapiGetFieldValue('custbody_djkk_approval_kyaltuka_memo')); //DJ_承認却下メモ // 20230522 add by zhou
				// 分類
				record.setFieldValue('custrecord_djkk_create_note_subsidiary', nlapiGetFieldValue('subsidiary')); //DJ_子会社
				record.setFieldValue('custrecord_djkk_create_note_department', nlapiGetFieldValue('department')); //セクション
				record.setFieldValue('custrecord_djkk_create_note_bulkprocsubm', nlapiGetFieldValue('bulkprocsubmission')); //送信ID
				// CH144 zheng 20230516 start
				//record.setFieldValue('custrecord_djkk_create_note_rate_s1', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s1')); //DJ_第1予約レート
				// CH144 zheng 20230516 end
				record.setFieldValue('custrecord_djkk_create_note_opc_flg', nlapiGetFieldValue('custbody_djkk_exsystem_opc_flg')); //DJ_前払金受領済フラグ
				record.setFieldValue('custrecord_djkk_create_note_date_time', nlapiGetFieldValue('custbody_djkk_exsystem_send_date_time')); //DJ_外部システム送信日時
				record.setFieldValue('custrecord_djkk_create_note_includeids', nlapiGetFieldValue('custbody_4392_includeids')); //締め請求書に含める
				record.setFieldValue('custrecord_djkk_create_note_sales', nlapiGetFieldValue('custbody_djkk_company_sales')); //DJ_社販対象
				record.setFieldValue('custrecord_djkk_create_note_end_user', nlapiGetFieldValue('custbody_djkk_end_user')); //DJ_エンドユーザー
				record.setFieldValue('custrecord_djkk_create_note_destination', nlapiGetFieldValue('custbody_djkk_delivery_destination')); //DJ_納品先
				record.setFieldValue('custrecord_djkk_create_note_conditions', nlapiGetFieldValue('custbody_djkk_payment_conditions')); //DJ_支払条件
				record.setFieldValue('custrecord_djkk_create_note_registration', nlapiGetFieldValue('custbody_djkk_gst_registration')); //DJ_GST登録番号
				record.setFieldValue('custrecord_djkk_create_note_deliverynote', nlapiGetFieldValue('custbody_djkk_deliverynote')); //DJ_納品書自動送信
				record.setFieldValue('custrecord_djkk_create_note_instructions', nlapiGetFieldValue('custbody_djkk_shipping_instructions_f')); //DJ_出荷指示
				record.setFieldValue('custrecord_djkk_create_note_person', nlapiGetFieldValue('custbody_djkk_shipment_person')); //DJ_出荷担当者
				record.setFieldValue('custrecord_djkk_create_note_location', nlapiGetFieldValue('location')); //DJ_場所
				nlapiLogExecution('debug','lhm1',nlapiGetFieldValue('location'));
				record.setFieldValue('custrecord_djkk_create_note_methodtyp', nlapiGetFieldValue('custbody_djkk_paymentmethodtyp')); //DJ_支払方法区分
				record.setFieldValue('custrecord_djkk_create_note_deliveryrule', nlapiGetFieldValue('custbody_djkk_deliveryruledesc')); //DJ_納入先毎在庫引当条件
				record.setFieldValue('custrecord_djkk_create_note_cautiondesc', nlapiGetFieldValue('custbody_djkk_cautiondesc')); //DJ_注意事項
				record.setFieldValue('custrecord_djkk_create_note_wmsmemo1', nlapiGetFieldValue('custbody_djkk_wmsmemo1')); //DJ_倉庫向け備考１
				record.setFieldValue('custrecord_djkk_create_note_deliverermem', nlapiGetFieldValue('custbody_djkk_deliverermemo1')); //DJ_運送会社向け備考
				record.setFieldValue('custrecord_djkk_create_note_deliverymemo', nlapiGetFieldValue('custbody_djkk_deliverynotememo')); //DJ_納品書備考
				record.setFieldValue('custrecord_djkk_create_note_orderrequeid', nlapiGetFieldValue('custbody_djkk_orderrequestid')); //DJ_注文依頼ID
				record.setFieldValue('custrecord_djkk_create_note_netflg', nlapiGetFieldValue('custbody_djkk_netsuitetransflg')); //DJ_NETSUITE連携フラグ
				record.setFieldValue('custrecord_djkk_create_note_nstructdt', nlapiGetFieldValue('custbody_djkk_shippinginstructdt')); //DJ_出荷指示日時
				record.setFieldValue('custrecord_djkk_create_note_merorderno', nlapiGetFieldValue('custbody_djkk_customerorderno')); //DJ_先方発注番号
				record.setFieldValue('custrecord_djkk_create_note_ingsaleflg', nlapiGetFieldValue('custbody_djkk_consignmentbuyingsaleflg')); //DJ_消化仕入売上フラグ
				record.setFieldValue('custrecord_djkk_create_note_hopedate', nlapiGetFieldValue('custbody_djkk_delivery_hopedate')); //DJ_納品希望日
				record.setFieldValue('custrecord_djkk_create_note_class', nlapiGetFieldValue('class')); //ブランド
				record.setFieldValue('custrecord_djkk_create_note_wmsmemo2', nlapiGetFieldValue('custbody_djkk_wmsmemo2')); //DJ_倉庫向け備考２
				record.setFieldValue('custrecord_djkk_create_note_wmsmemo3', nlapiGetFieldValue('custbody_djkk_wmsmemo3')); //DJ_倉庫向け備考3
				record.setFieldValue('custrecord_djkk_create_note_send', nlapiGetFieldValue('custbody_djkk_warehouse_sent')); //DJ_倉庫送信済み
				record.setFieldValue('custrecord_djkk_create_note_coname', nlapiGetFieldValue('custbody_djkk_finetkanaofferconame')); //DJ_FINETカナ提供企業名
				record.setFieldValue('custrecord_djkk_create_note_cooffice', nlapiGetFieldValue('custbody_djkk_finetkanaoffercooffice')); //DJ_FINETカナ提供企業参照事業所名
				record.setFieldValue('custrecord_djkk_create_note_stomername', nlapiGetFieldValue('custbody_djkk_finetkanacustomername')); //DJ_FINETカナ社名・店名・取引先名
				record.setFieldValue('custrecord_djkk_create_note_address', nlapiGetFieldValue('custbody_djkk_finetkanacustomeraddress')); //DJ_FINETカナ住所
				record.setFieldValue('custrecord_djkk_create_note_invflg', nlapiGetFieldValue('custbody_djkk_invoicetotal_flag')); //DJ_合計請求書作成済みフラグ
				record.setFieldValue('custrecord_djkk_create_note_base_date', nlapiGetFieldValue('custbody_djkk_rios_base_date')); //DJ_RIOS基準日
				record.setFieldValue('custrecord_djkk_create_note_netsuitetran', nlapiGetFieldValue('custbodycustbody_djkk_netsuitetransdt')); //DJ_NETSUITE連携日時
				record.setFieldValue('custrecord_djkk_create_note_language', nlapiGetFieldValue('custbody_djkk_language')); //DJ_言語
				record.setFieldValue('custrecord_djkk_create_note_ids_date', nlapiGetFieldValue('custbody_suitel10n_jp_ids_date')); //締め請求書期日
				record.setFieldValue('custrecord_djkk_create_note_due_date', nlapiGetFieldValue('custbody_jp_invoice_summary_due_date')); //DJ_INVOICE SUMMARY DUE DATE
				record.setFieldValue('custrecord_djkk_create_note_delivererme2', nlapiGetFieldValue('custbody_djkk_deliverermemo2')); //DJ_運送会社向け備考2
				// CH144 zheng 20230516 start
				//record.setFieldValue('custrecord_djkk_create_note_rate_yen', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_yen')); //DJ_円貨支払
				//record.setFieldValue('custrecord_djkk_create_note_rate_s2', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s2')); //DJ_第2予約レート
				//record.setFieldValue('custrecord_djkk_create_note_rate_s3', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_s3')); //DJ_第3予約レート
				//record.setFieldValue('custrecord_djkk_create_note_rate_f', nlapiGetFieldValue('custbody_dj_reserved_exchange_rate_f')); //DJ_外貨支払データ作成
				// CH144 zheng 20230516 end
				record.setFieldValue('custrecord_djkk_create_note_delive', nlapiGetFieldValue('custbody_djkk_reference_delive')); //DJ_納期回答備考欄
				record.setFieldValue('custrecord_djkk_create_note_column', nlapiGetFieldValue('custbody_djkk_reference_column')); //DJ_納品書備考欄
				record.setFieldValue('custrecord_djkk_create_note_reference', nlapiGetFieldValue('custbody_djkk_request_reference_bar')); //DJ_請求書備考欄
				record.setFieldValue('custrecord_djkk_create_note_day', nlapiGetFieldValue('custbody_djkk_annotation_day')); //DJ_注文日
				record.setFieldValue('custrecord_djkk_create_note_process', nlapiGetFieldValue('custbody_15699_exclude_from_ep_process')); //EXCLUDE FROM ELECTRONIC BANK PAYMENTS PROCESSING
				record.setFieldValue('custrecord_djkk_create_note_precautions', nlapiGetFieldValue('custbody_djkk_delivery_precautions')); //DJ_納品先注意事項
				record.setFieldValue('custrecord_djkk_create_note_precautionss', nlapiGetFieldValue('custbody_djkk_customer_precautions')); //DJ_顧客注意事項	
				record.setFieldValue('custrecord_djkk_create_note_instructflg', nlapiGetFieldValue('custbody_djkk_shipping_instructions')); // DJ_出荷指示済み
				record.setFieldValue('custrecord_djkk_create_note_deliveryadd', nlapiGetFieldValue('custbody_djkk_delivery_address')); //DJ_納品先住所
				record.setFieldValue('custrecord_djkk_create_note_customeradd', nlapiGetFieldValue('custbody_djkk_customer_address')); //DJ_顧客住所
				record.setFieldValue('custrecord_djkk_create_note_ready', nlapiGetFieldValue('custbody_djkk_sendmail_ready')); //DJ_準備完了
				record.setFieldValue('custrecord_djkk_create_note_destemail', nlapiGetFieldValue('custbody_djkk_shippinginfodestemail')); //DJ_出荷案内送付先メール
				record.setFieldValue('custrecord_djkk_create_note_fax', nlapiGetFieldValue('custbody_djkk_shippinginfodestfax')); //DJ_出荷案内送付先FAX
				record.setFieldValue('custrecord_djkk_create_note_destname', nlapiGetFieldValue('custbody_djkk_shippinginfodestname')); //DJ_出荷案内送付先宛名
				record.setFieldValue('custrecord_djkk_create_note_desttyp', nlapiGetFieldValue('custbody_djkk_shippinginfodesttyp')); //DJ_出荷案内送付先区分
				record.setFieldValue('custrecord_djkk_create_note_sendtyp', nlapiGetFieldValue('custbody_djkk_shippinginfosendtyp')); //DJ_出荷案内送信区分
				var recordCount=record.getLineItemCount('recmachcustrecord_djkk_credit_note_approval');
				for(var w=recordCount;w>0;w--){
					record.removeLineItem('recmachcustrecord_djkk_credit_note_approval', w);
				}
				var counts=nlapiGetLineItemCount('item');
				for(var i=1;i<counts+1;i++){
					nlapiSelectLineItem('item', i);
					var inventoryDetail=nlapiViewCurrentLineItemSubrecord('item','inventorydetail');
					if(!isEmpty(inventoryDetail)){
						var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
						for(var m = 1 ; m < invCount+1 ; m++){
							inventoryDetail.selectLineItem('inventoryassignment', m);
							record.selectNewLineItem('recmachcustrecord_djkk_credit_note_approval');
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id',i); //DJ_クレジットメモ明細行番号
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_create_note_detail_item',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_アイテム
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantity',nlapiGetCurrentLineItemValue('item', 'quantity'));//DJ_数量
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_unit',nlapiGetCurrentLineItemValue('item', 'units'));//DJ_単位
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_explain',nlapiGetCurrentLineItemValue('item', 'description'));//DJ_説明
							//20230522 changed by zhou start
							//カスタムレコードはidが'-1'のオプションをサポートしていません
							var priceCode = nlapiGetCurrentLineItemValue('item', 'price')
							if(priceCode != -1){
								record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_grid_level',priceCode);//DJ_価格水準
							}
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_rate',nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_単価/率
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_amount',nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_金額
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_taxcode',nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_税金コード
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_rate',nlapiGetCurrentLineItemValue('item', 'taxrate1'));//DJ_税率
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_total',nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_総額
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_amount',nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_税額
////							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_option',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_オプション
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_type',nlapiGetCurrentLineItemValue('item', 'costestimatetype'));//DJ_原価見積の種類
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_expansion_cost',nlapiGetCurrentLineItemValue('item', 'costestimate'));//DJ_予測拡張コスト
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_see_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofit'));//DJ_見積総利益
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_gross_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofitpercent'));//DJ_見積総利益の割合
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_priming',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_automatic_allocation'));//DJ_自動引当
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custnum',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customer_order_number'));//DJ_顧客の発注番号
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_temperature',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_temperature'));//DJ_温度
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_test_report',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_testbook_supplement'));//DJ_試験書添付
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_sample_type',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_type'));//DJ_サンプル種別
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_informatio',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rate_informatio'));//DJ_レート情報
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_english',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_commodity_english'));//DJ_商品英語名
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_charge_number',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_charge_number'));//DJ_荷数
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_ampm',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_ampm'));//DJ_AM・PM
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_specifications',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_specifications'));//DJ_規格
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_document_flag',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_included_document_flag'));//DJ_同梱書類フラグ
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_perunitquantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity'));//DJ_入数
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_casequantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_casequantity'));//DJ_ケース数
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantitys',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_quantity'));//DJ_バラ数
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverytemptyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverytemptyp'));//DJ_配送温度区分
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nextshipmentdesc',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nextshipmentdesc'));//DJ_欠品次回出荷予定記述
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverynotememo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverynotememo'));//DJ_納品書備考
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestid',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestid'));//DJ_注文依頼ID
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestlinen',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestlineno'));//DJ_依頼明細行番号
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestquant',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestquantity'));//DJ_依頼数量
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_partshortagetyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_partshortagetyp'));//DJ_部分欠品区分
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custody_item',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item'));//DJ_預かりアイテム
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_memo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_wms_line_memo'));//DJ_倉庫向け明細備考
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_description',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_finetkanaitemdescription'));//DJ_FINETカナ商品名
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_divideflg',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestdivideflg'));//DJ_依頼分割済フラグ
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nuclide',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nuclide'));//DJ_2_核種
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_user_num',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_num'));//DJ_RIOSユーザ管理番号
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_remark',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_remark'));//DJ_RIOSユーザ備考
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_item_code',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_item_code'));//DJ_アイテム(コード)
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderdetailtyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderdetailtyp'));//DJ_注文明細状態区分
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_file_format',nlapiGetCurrentLineItemValue('item', 'custcol_9572_dd_file_format'));//DJ_口座引落ファイル・フォーマット
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quoted_amount',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_quoted_amount'));//DJ_代引金額(佐川）
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_guarantee_fund',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_guarantee_fund'));//DJ_保険金(佐川）
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_delivery',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_payment_delivery'));//DJ_配送指示時の納品書添付
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_printing',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_receipt_printing'));//DJ_受領書印刷
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_category',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_category'));//DJ_サンプル品カテゴリ
							// changed by song add 20230612 start
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_location',nlapiGetCurrentLineItemValue('item', 'location'));     //DJ_場所
					    	// changed by song add 20230612 end
							if(!isEmpty(inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'))){
								record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail_id',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber')); //DJ_シリアル/ロット番号ID
							}else{
								record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_detail',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber'));//DJ_シリアル/ロット番号		
							}	
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_shednum',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber')); //DJ_保管棚
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));//DJ_有効期限
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));//DJ_メーカー製造ロット番号
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_serial',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));//DJ_メーカーシリアル番号
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_manufacture_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));//DJ_製造年月日
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_probably_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));//DJ_残出荷可能期間/DJ_出荷可能期限日
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_warehouse_no',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));//DJ_倉庫入庫番号
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));//DJ_SMC番号
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_remark',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));//DJ_ロットリマーク
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_lot_memo',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));//DJ_ロットメモ
					    	record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_inventory_quantit',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));     //DJ_在庫詳細明細行数量
							record.commitLineItem('recmachcustrecord_djkk_credit_note_approval');	
							
//							
						}
					}else{
//						
//						inventoryDetail.selectLineItem('inventoryassignment', m);
						record.selectNewLineItem('recmachcustrecord_djkk_credit_note_approval');
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_id',i); //DJ_クレジットメモ明細行番号
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_create_note_detail_item',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_アイテム
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantity',nlapiGetCurrentLineItemValue('item', 'quantity'));//DJ_数量
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_unit',nlapiGetCurrentLineItemValue('item', 'units'));//DJ_単位
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_explain',nlapiGetCurrentLineItemValue('item', 'description'));//DJ_説明
						//20230522 changed by zhou start
						//カスタムレコードはidが'-1'のオプションをサポートしていません
						var priceCode = nlapiGetCurrentLineItemValue('item', 'price')
						if(priceCode != -1){
							record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_grid_level',priceCode);//DJ_価格水準
						}
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_rate',nlapiGetCurrentLineItemValue('item', 'rate'));//DJ_単価/率
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_amount',nlapiGetCurrentLineItemValue('item', 'amount'));//DJ_金額
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_taxcode',nlapiGetCurrentLineItemValue('item', 'taxcode'));//DJ_税金コード
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_rate',nlapiGetCurrentLineItemValue('item', 'taxrate1'));//DJ_税率
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_total',nlapiGetCurrentLineItemValue('item', 'grossamt'));//DJ_総額
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_tax_amount',nlapiGetCurrentLineItemValue('item', 'tax1amt'));//DJ_税額
////						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_option',nlapiGetCurrentLineItemValue('item', 'item'));//DJ_オプション
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_type',nlapiGetCurrentLineItemValue('item', 'costestimatetype'));//DJ_原価見積の種類
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_expansion_cost',nlapiGetCurrentLineItemValue('item', 'costestimate'));//DJ_予測拡張コスト
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_see_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofit'));//DJ_見積総利益
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_gross_profit',nlapiGetCurrentLineItemValue('item', 'estgrossprofitpercent'));//DJ_見積総利益の割合
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_priming',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_automatic_allocation'));//DJ_自動引当
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custnum',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_customer_order_number'));//DJ_顧客の発注番号
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_temperature',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_temperature'));//DJ_温度
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_test_report',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_testbook_supplement'));//DJ_試験書添付
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_sample_type',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_type'));//DJ_サンプル種別
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_informatio',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rate_informatio'));//DJ_レート情報
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_english',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_commodity_english'));//DJ_商品英語名
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_charge_number',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_charge_number'));//DJ_荷数
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_ampm',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_ampm'));//DJ_AM・PM
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_specifications',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_specifications'));//DJ_規格
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_document_flag',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_included_document_flag'));//DJ_同梱書類フラグ
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_perunitquantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity'));//DJ_入数
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_casequantity',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_casequantity'));//DJ_ケース数
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quantitys',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_quantity'));//DJ_バラ数
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverytemptyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverytemptyp'));//DJ_配送温度区分
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nextshipmentdesc',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nextshipmentdesc'));//DJ_欠品次回出荷予定記述
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_deliverynotememo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_deliverynotememo'));//DJ_納品書備考
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestid',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestid'));//DJ_注文依頼ID
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestlinen',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestlineno'));//DJ_依頼明細行番号
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderrequestquant',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestquantity'));//DJ_依頼数量
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_partshortagetyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_partshortagetyp'));//DJ_部分欠品区分
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_custody_item',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item'));//DJ_預かりアイテム
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_line_memo',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_wms_line_memo'));//DJ_倉庫向け明細備考
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_description',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_finetkanaitemdescription'));//DJ_FINETカナ商品名
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_divideflg',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderrequestdivideflg'));//DJ_依頼分割済フラグ
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_nuclide',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_nuclide'));//DJ_2_核種
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_user_num',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_num'));//DJ_RIOSユーザ管理番号
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_remark',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_rios_user_remark'));//DJ_RIOSユーザ備考
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_item_code',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_item_code'));//DJ_アイテム(コード)
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_orderdetailtyp',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_orderdetailtyp'));//DJ_注文明細状態区分
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_file_format',nlapiGetCurrentLineItemValue('item', 'custcol_9572_dd_file_format'));//DJ_口座引落ファイル・フォーマット
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_quoted_amount',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_quoted_amount'));//DJ_代引金額(佐川）
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_guarantee_fund',nlapiGetCurrentLineItemValue('item', 'custcolcustbody_djkk_guarantee_fund'));//DJ_保険金(佐川）
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_delivery',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_payment_delivery'));//DJ_配送指示時の納品書添付
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_printing',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_receipt_printing'));//DJ_受領書印刷
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_category',nlapiGetCurrentLineItemValue('item', 'custcol_djkk_sample_category'));//DJ_サンプル品カテゴリ
						// changed by song add 20230612 start
						record.setCurrentLineItemValue('recmachcustrecord_djkk_credit_note_approval', 'custrecord_djkk_detail_location',nlapiGetCurrentLineItemValue('item', 'location'));     //DJ_場所
						// changed by song add 20230612 end
						record.commitLineItem('recmachcustrecord_djkk_credit_note_approval');	
						
					}
				}
				var custRecordId=nlapiSubmitRecord(record, true, true);
				var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_credit_note_approval',custRecordId, 'VIEW');
				var delLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_creditmemo_approval','customdeploy_djkk_sl_creditmemo_approval');
				delLink += '&deleteRecordId=' + nlapiGetRecordId();
				
				nlapiRequestURL(delLink);
				window.ischanged = false;
				window.location.href=theLink;
				 return false;
				
		 }catch(e){
			   alert(e.message);
			   return false;
		   }
	 }
	 
	 return true;
}
function customerSendmails(deliverySendMailFlag,custRecord){
//	if(soCustomform == '121'){
	if(!isEmpty(custRecord) &&  deliverySendMailFlag == true){
			var deliveryPeriod = custRecord.getFieldValue('custentity_djkk_delivery_book_period'); //DJ_納品書送信方法
			var deliverySiteFd = custRecord.getFieldValue('custentity_djkk_delivery_book_site_fd'); //DJ_納品書送信先(食品用)
			var deliveryPerson = custRecord.getFieldValue('custentity_djkk_delivery_book_person'); //DJ_納品書送信先担当者
			var deliverySubName = custRecord.getFieldValue('custentity_djkk_delivery_book_subname'); //DJ_納品書送信先会社名(3RDパーティー)
			var deliveryPersont = custRecord.getFieldValue('custentity_djkk_delivery_book_person_t'); //DJ_納品書送信先担当者(3RDパーティー)
			var deliveryEmail = custRecord.getFieldValue('custentity_djkk_delivery_book_email'); //DJ_納品書送信先メール(3RDパーティー)
			var deliveryFax = custRecord.getFieldValue('custentity_djkk_delivery_book_fax_three'); //DJ_納品書送信先FAX(3RDパーティー)
			var deliveryMemo = custRecord.getFieldValue('custentity_djkk_delivery_book_memo'); //DJ_納品書自動送信備考
			if(!isEmpty(deliveryPeriod)&& (deliveryPeriod!= '10')){
				nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_納品書送信方法
				nlapiSetFieldValue('custbody_djkk_delivery_book_site_fd', deliverySiteFd,false);//DJ_納品書送信先
				nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);//DJ_納品書送信先担当者
				nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);//DJ_納品書送信先会社名(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_納品書送信先担当者(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);//DJ_納品書送信先メール(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_納品書送信先FAX(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo);//DJ_納品書自動送信備考  custbody_djkk_reference_column
			}
		}
//	}
}


function deliverySendMailChangeFormDelivery(deliveryRecord){
	var deliveryPeriod = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_period');//DJ_納品書送信方法
	var deliveryPerson = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person');//DJ_納品書送信先担当者
	var deliverySubName = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_subname');//DJ_納品書送信先会社名(3RDパーティー)
	var deliveryPersont = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person_t');//DJ_納品書送信先担当者(3RDパーティー)
	var deliveryEmail = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_email');//DJ_納品書送信先メール(3RDパーティー)
	var deliveryFax = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_fax_three');//DJ_納品書送信先FAX(3RDパーティー)
	var deliveryMemo = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_memo');//DJ_納品書自動送信送付先備考
	if(!isEmpty(deliveryPeriod)&& deliveryPeriod != '10'){
		nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo,false);	
	}
}
function deliverySendMailChangeFormCustomer(loadingCustomer){
	var deliveryPeriod = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_period')//納品書送信方法
	var deliveryPerson = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_person')//納品書送信先担当者
	var deliverySubName = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_subname')//納品書送信先会社名(3RDパーティー)
	var deliveryPersont = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_person_t')//納品書送信先担当者(3RDパーティー)
	var deliveryEmail = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_email')//納品書送信先メール(3RDパーティー)
	var deliveryFax = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_fax_three')//納品書送信先FAX(3RDパーティー)
	var deliveryMemo = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_memo')//納品書自動送信備考
	if(!isEmpty(deliveryPeriod)&& deliveryPeriod != '10'){
		nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo,false);	
	}
}
