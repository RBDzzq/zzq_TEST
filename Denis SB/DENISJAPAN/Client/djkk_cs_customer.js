/**
 * 顧客のClient
 * 
 * Version     日付            担当者       備考
 * 1.00        2021/02/18     YUAN      新規作成
 *
 */
var useType='';
var parentSub = '';

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
	useType=type;
	if(type=='create'){
	nlapiSetFieldValue('isperson', 'F', true, true);
	}
	var sub=nlapiGetFieldValue('subsidiary'); 
    var form = nlapiGetFieldText('customform');
    var recordType = nlapiGetRecordType();
    if(!isEmpty(sub)){
        if(sub == SUB_SCETI || SUB_DPKK){
            // DJ_潜在顧客フォーム7
            if (form.indexOf('顧客') > -1 && form.indexOf('潜在') < 0) {

                // DJ_顧客タイプ .顧客
                nlapiSetFieldValue('custentity_djkk_customer_type', '3');

                // DJ_リード・フォーム65
            } else if (form.indexOf('リード') > -1) {

                // DJ_顧客タイプ .リード
                nlapiSetFieldValue('custentity_djkk_customer_type', '1');

                // DJ_潜在顧客フォーム66
            } else if (form.indexOf('潜在顧客') > -1) {

                // DJ_顧客タイプ .潜在顧客
                nlapiSetFieldValue('custentity_djkk_customer_type', '2');
            }
        }else if(sub == SUB_NBKK || SUB_ULKK){
        	// U071:?ADJ_納品条件（食品Gデフォルト：SML）受注後、2～3日後に納品）
    		nlapiSetFieldValue('custentity_djkk_delivery_conditions', '2');
    		
    		//changed by song add DENISJAPANDEV-1388 start
    		if(RecordType == 'lead'){ //リード
    			nlapiSetFieldValue('customform', '142'); //カスタムフォーム
    			nlapiSetFieldValue('custentity_djkk_customer_type', '1'); //DJ_顧客タイプ 
    		}else if(RecordType = 'customer'){ //顧客
    			nlapiSetFieldValue('customform', '80'); //カスタムフォーム
    			nlapiSetFieldValue('custentity_djkk_customer_type', '3'); //DJ_顧客タイプ 
    		}else if(RecordType == 'prospect'){ //潜在顧客
    			nlapiSetFieldValue('customform', '141'); //カスタムフォーム
    			nlapiSetFieldValue('custentity_djkk_customer_type', '2'); //DJ_顧客タイプ 
    		}
    		//changed by song add DENISJAPANDEV-1388 end
    		
        }
    }
    // DENISJAPAN-255 add by ycx 2021/06/02
    var userRole=nlapiGetRole();
//	nlapiLogExecution('DEBUG', 'userRole1', userRole);
	// 管理者
	if(userRole!=3&&userRole!=1025&&userRole!=1026){
	// ロール職責会社の取得
	var roleSubsidiary = nlapiGetFieldValue('custentity_syokuseki');
//	nlapiLogExecution('DEBUG', 'roleSubsidiary', roleSubsidiary);
	var customformID = nlapiGetFieldValue('customform');
	//nlapiLogExecution('DEBUG', 'customformID', customformID);
	if(customformID != CUSTOMER_CUSTOMFORM_DISABLED_LS_ID && customformID != CUSTOMER_CUSTOMFORM_DISABLED_LS_FOOD){
	setFieldDisableType('subsidiary', 'disabled');
	}
	
	//setFieldDisableType('subsidiary', 'disabled');
//	if(type!='edit'){
//		nlapiSetFieldValue('subsidiary', roleSubsidiary, false, true);
//	}
	}
	if(userRole!=1022){
		var roleSubsidiary = nlapiGetFieldValue('custentity_syokuseki');
		
		var customformID = nlapiGetFieldValue('customform');
		var shippingitem = nlapiGetFieldValue('shippingitem');
//		nlapiLogExecution('DEBUG', 'shippingitem', shippingitem);
		if(customformID == 91 || customformID == 137 || customformID == 138 || customformID == 128){
			//setFieldDisableType('custentity_djkk_payment_conditions', 'disabled');
			setFieldDisableType('custentity_djkk_transfer_person_name', 'disabled');
			setFieldDisableType('custentity_djkk_bank_account_holder', 'disabled');
			setFieldDisableType('custentity_djkk__djkk_bank_account_half', 'disabled');
			setFieldDisableType('custentity_dj_custpayment_bankname', 'hidden');
			setFieldDisableType('custentity_dj_custpayment_branchname', 'hidden');
			setFieldDisableType('custentity_dj_custpayment_clientname', 'hidden');
			setFieldDisableType('custentity_dj_custpayment_accountnumber', 'hidden');
//			nlapiSetFieldValue('salesrep', ' ');
//			nlapiSetFieldValue('subsidiary', 6);
		}
		if(true){
			var subsidiary = nlapiGetFieldValue('subsidiary');
//			nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)
			if(subsidiary == 6){
				nlapiSetFieldValue('shippingitem', 206);
			}
		}		
	}
//	if(customformID == 91 || customformID == 137 || customformID == 138 || customformID == 128){
//		nlapiSetFieldText('salesrep', ' ');
//	}
	
	// add end
	
	//U168バリデーション
	var subsidiary = nlapiGetFieldValue('subsidiary');
	if (type == 'create'){
		if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK ){
			nlapiSetFieldValue('custentity_4392_useids', 'T');
		}
	}
	//20230202 add by zhou CH209 start
	var userRole=nlapiGetRole();
	//1022:DJ_経理担当
	if((subsidiary == SUB_SCETI || subsidiary == SUB_DPKK)&& userRole != '1022'){
		
		setFieldDisableType('custentity_djkk_credit_limit', 'disabled');
	}
		//end
	//20220914 add by zhou U118
	var recordType =  nlapiGetRecordType();
	if(type == 'create' && recordType == 'lead' ){		//&& (subsidiary == SUB_NBKK || subsidiary == SUB_ULKK)
		nlapiSetFieldValue('custentity_djkk_customer_type', 1);
		if(nlapiGetFieldValue('customform')!=142){
		nlapiSetFieldValue('customform', 142);
		}
		setFieldDisableType('customform', 'hidden');
	}else if(type == 'create' && recordType == 'prospect'){//&& (subsidiary == SUB_NBKK || subsidiary == SUB_ULKK)
		nlapiSetFieldValue('custentity_djkk_customer_type', 2);
		if(nlapiGetFieldValue('customform')!=141){
		nlapiSetFieldValue('customform', 141);
		}
		setFieldDisableType('customform', 'hidden');
	}
	//end
	
	

	//20221219 add by zhou CH180 starat
	//顧客マスタ営業サブタブを特定のロールで閲覧可能とする
	//NBKK販売担当、NBKK購買販売担当、UL販売担当、UL購買販売担当
	var userRole=nlapiGetRole();
	if(customformID == '80'||customformID == '141'||customformID == '142'||customformID == '143'){
//		1012	NB_購買・販売担当	 	
//		1013	NB_販売担当
//		1002	UL_購買・販売担当
//		1003	UL_販売担当
		if(userRole !='1012' && userRole !='1013' && userRole !='1002' && userRole !='1003' && userRole !='3'){
			setTableHidden('salestxt');//営業サブタブ
		}
	}
	//end
	
	// changed  by song add DENISJAPAN-724   start
	nlapiDisableField('custentity_djkk_cus_oldid', true);
	// changed  by song add DENISJAPAN-724   end
}


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

	var salesrep = nlapiGetFieldValue('salesrep');
	if(isEmpty(salesrep)){
		alert('販売員（当社担当）は入力しないです。');
//		return true;
	}
	
	
	//changed by geng add start U280
	var sub = nlapiGetFieldValue('subsidiary');
	if(sub==SUB_NBKK||sub==SUB_ULKK){
		var email = nlapiGetFieldValue('email');
		var phone = nlapiGetFieldValue('phone');
		var fax = nlapiGetFieldValue('fax');
		var add = nlapiGetFieldValue('defaultaddress');
//		if(isEmpty(email)){
//			alert('電子メールは入力しないです。');
//		}
		if(isEmpty(phone)){
			alert('電話番号が登録されていません。');
		}
//		if(isEmpty(fax)){
//			alert('FAXは入力しないです。');
//		}
		if(isEmpty(add)){
			alert('住所が登録されていません。');
		}
	}
	//changed by geng add end U280
	
	//changed by song add DENISJAPAN-486 start
	var sodeliverermemo = nlapiGetFieldValue('custentity_djkk_sodeliverermemo'); //DJ_注文時運送向け備考
	if(!isEmpty(sodeliverermemo)){
		var sodeliverermemoString = sodeliverermemo.toString();
		var sodeMemoBytes = getBytes(sodeliverermemoString);
        if(sodeMemoBytes > 35){
		    alert("DJ_注文時運送向け備考のバイト数が35より大きいので、再入力してください");
		    return false;
		}
	}
	
	var sowmsmemo = nlapiGetFieldValue('custentity_djkk_sowmsmemo'); //DJ_注文時倉庫向け備考
	if(!isEmpty(sowmsmemo)){
		var sowmsmemotring = sowmsmemo.toString();
		var sowmsmemoBytes = getBytes(sowmsmemotring);
		if(sowmsmemoBytes > 160){
			alert("DJ_注文時倉庫向け備考のバイト数が160より大きいので、再入力してください");
		    return false;
		}
	}
	
	//changed by song add DENISJAPAN-486 end
	return true;	
}

var getBytes = function (string) {
	var utf8 = unescape(encodeURIComponent(string));
	var arr = [];

	for (var i = 0; i < utf8.length; i++) {
	    arr.push(utf8.charCodeAt(i));
	}
	return arr.length;
}
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
function clientFieldChanged(type, name, linenum) {
	
	//2022/03/24 geng 顧客 DJ_支払条件 支払条件（締め日無し) start
	// changed by ycx 2022/03/28
	if(name == 'custentity_djkk_payment_conditions'){
		var subsidiary = nlapiGetFieldValue('subsidiary');
		if(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK ){
		var conditionsValue = nlapiGetFieldValue('custentity_djkk_payment_conditions');
		if(conditionsValue == 2){
			nlapiSetFieldValue('terms',7)
			}else if(conditionsValue == 1){
			nlapiSetFieldValue('terms',10)
			}		
			
	}
	  
	}
	//end
	
	//changed by geng add srart U625
	if(name=='custentity_djkk_area'){
		var custarea = nlapiGetFieldValue('custentity_djkk_area');
		var subValCust = nlapiGetFieldValue('subsidiary');
		var customform = nlapiGetFieldValue('customform');
		if(!isEmpty(custarea)){
			// changed by song add 2022/11/24 CH123
//			if((subValCust==SUB_DPKK || subValCust==SUB_SCETI)|| customform=='128'){
				if(custarea=='14'||custarea=='12'){
					nlapiSetFieldValue('taxitem','8');
				}else{
					nlapiSetFieldValue('taxitem','');
				}
//			}
			//CH123 changed by song add end 2022/11/24
		}
	}
	//changed by geng add end U625
	if(name == 'parent'){
	    var sub=nlapiGetFieldValue('subsidiary'); 	    
	    parentSub = sub;
	}
	//changed by song add DENISJAPANDEV-1388 start
	if(name == 'subsidiary'){
		var recordType = nlapiGetRecordType();
		var sub=nlapiGetFieldValue('subsidiary'); 
		if(!isEmpty(sub)){
		    var customForm=nlapiGetFieldValue('customform'); 
			if(sub == SUB_NBKK || sub == SUB_ULKK){
	    		if(recordType == 'lead'){ //リード
	    		    if (customForm != '142') {
	                    nlapiSetFieldValue('customform', '142'); //カスタムフォーム   
	    		    }
	    			nlapiSetFieldValue('custentity_djkk_customer_type', '1',false,true); //DJ_顧客タイプ 
	    		}else if(recordType = 'customer'){ //顧客
	    		    if (customForm != '80') {
	                    nlapiSetFieldValue('customform', '80'); //カスタムフォーム   
	    		    }
	    			nlapiSetFieldValue('custentity_djkk_customer_type', '3',false,true); //DJ_顧客タイプ 
	    		}else if(recordType == 'prospect'){ //潜在顧客
	    		    if (customForm != '141') {
	                    nlapiSetFieldValue('customform', '141'); //カスタムフォーム   
	    		    }
	    			nlapiSetFieldValue('custentity_djkk_customer_type', '2',false,true); //DJ_顧客タイプ 
	    		}
			}
		} else {
		    nlapiSetFieldValue('subsidiary', parentSub, false); //カスタムフォーム
		}
	}
	//changed by song add DENISJAPANDEV-1388 end
	
    // DJ_顧客タイプ
    if (name == 'custentity_djkk_customer_type') {
        var customerType = nlapiGetFieldValue('custentity_djkk_customer_type');
        var form = nlapiGetFieldText('customform');
        var isperson=nlapiGetFieldValue('isperson');
        var sub=nlapiGetFieldValue('subsidiary');
        if(!isEmpty(sub)){
        	/*91	DJ_リード・フォーム_LS
        	142	DJ_リード・フォーム_食品
        	138	DJ_潜在顧客フォーム_LS
        	141	DJ_潜在顧客フォーム_食品
        	137	DJ_関係会社間顧客フォーム_LS
        	143	DJ_関係会社間顧客フォーム_食品
        	128	DJ_顧客フォーム_LS
        	117	DJ_顧客フォーム_承認
        	80	DJ_顧客フォーム_食品	
        	-8	リード・フォーム(標準)
           -9	関係会社間顧客フォーム(標準)
            -2	顧客フォーム(標準)*/
            // リード
            if (customerType == '1' && form.indexOf('リード') < 0) {

              // 食品
            	if(sub==SUB_NBKK||sub==SUB_ULKK){
            		nlapiSetFieldValue('customform', '142');
            		
            		// LS
            	}else if(sub==SUB_SCETI||sub==SUB_DPKK){
            		nlapiSetFieldValue('customform', '91');
            	}else{
            		nlapiSetFieldValue('customform', '142');
            	}
                
                // 潜在顧客
            } else if (customerType == '2' && form.indexOf('潜在顧客') < 0) {

               // 食品
            	if(sub==SUB_NBKK||sub==SUB_ULKK){
            		nlapiSetFieldValue('customform', '141');
            		
            		// LS
            	}else if(sub==SUB_SCETI||sub==SUB_DPKK){
            		nlapiSetFieldValue('customform', '138');
            	}else{
            		nlapiSetFieldValue('customform', '141');
            	}

                // 顧客
            } else if (customerType == '3' && (form.indexOf('顧客') < 0 || form.indexOf('潜在顧客') > -1)) {

              // 食品
            	if(sub==SUB_NBKK||sub==SUB_ULKK){
            		nlapiSetFieldValue('customform', '80');
            		
            		// LS
            	}else if(sub==SUB_SCETI||sub==SUB_DPKK){
            		nlapiSetFieldValue('customform', '128');
            	}else{
            		nlapiSetFieldValue('customform', '80');
            	}
            }
        }
        if(!isEmpty(customerType)&&useType=='create'){
        if(isperson=='T'&&(customerType=='2'||customerType=='3')){
        	 var getReceivabAcc=getReceivab(customerType,'2');
          	  nlapiSetFieldValue('receivablesaccount', getReceivabAcc);
          	  nlapiSetFieldValue('openingbalanceaccount', getReceivabAcc);
        }else{
          var getReceivabAcc=getReceivab(customerType,'1');
       	  nlapiSetFieldValue('receivablesaccount', getReceivabAcc);
       	  nlapiSetFieldValue('openingbalanceaccount', getReceivabAcc);
        }
        }
    }
    
    if(name=='isperson'&&useType=='create'){
    	var customerTypec = nlapiGetFieldValue('custentity_djkk_customer_type');
    	var isperson=nlapiGetFieldValue('isperson');
    	 if(!isEmpty(customerTypec)){
      if(isperson=='T'&&(customerTypec=='2'||customerTypec=='3')){
    	  var getReceivabAcc=getReceivab(customerTypec,'2');
    	  nlapiSetFieldValue('receivablesaccount', getReceivabAcc);
    	  nlapiSetFieldValue('openingbalanceaccount', getReceivabAcc);
    	  
      }else{
    	  var getReceivabAcc=getReceivab(customerTypec,'1');
    	  nlapiSetFieldValue('receivablesaccount', getReceivabAcc);
    	  nlapiSetFieldValue('openingbalanceaccount', getReceivabAcc);
      }
    	 }
    }
 // DJ_顧客支払条件
	if (name == 'custentity_djkk_customer_payment') {
		var customerPaymentID = nlapiGetFieldValue('custentity_djkk_customer_payment');
		if (!isEmpty(customerPaymentID)) {
			var customerPaymentDataArray = nlapiLookupField(
					'customrecord_djkk_customer_payment', customerPaymentID, [
							'custrecord_djkk_end_day',
							'custrecord_djkk_payment_date',
							'custrecord_djkk_payment_period_month' ]);
			nlapiSelectNewLineItem('recmachcustrecord_suitel10n_jp_pt_customer');
						
			// 締日 	
			nlapiSetCurrentLineItemValue(
					'recmachcustrecord_suitel10n_jp_pt_customer',
					'custrecord_suitel10n_jp_pt_closing_day',
					customerPaymentDataArray.custrecord_djkk_end_day);
			
			// 支払期日
			nlapiSetCurrentLineItemValue(
					'recmachcustrecord_suitel10n_jp_pt_customer',
					'custrecord_suitel10n_jp_pt_paym_due_day',
					customerPaymentDataArray.custrecord_djkk_payment_date);
			
			// 支払期限月
			nlapiSetCurrentLineItemValue(
					'recmachcustrecord_suitel10n_jp_pt_customer',
					'custrecord_suitel10n_jp_pt_paym_due_mo',
					customerPaymentDataArray.custrecord_djkk_payment_period_month);
			nlapiCommitLineItem('recmachcustrecord_suitel10n_jp_pt_customer');
			//20221219 changed by zhou CH217
			//「DJ_顧客支払条件」で 選択したリストのアイテムが表示され続けるようにする
			/**********old**********/
//			nlapiSetFieldValue('custentity_djkk_customer_payment','', false,
//					true);
			/**********old**********/
			/**********new**********/
			var cust = nlapiGetFieldValue('customform');
			if(cust == '80'||cust == '141'||cust == '142'||cust == '143'){
				nlapiSetFieldValue('custentity_djkk_customer_payment',customerPaymentID, false,true);
			}
			/**********new**********/
		}
	}
	
	//請求書送信と合計請求書送信両方チェック不可
	if(name == 'custentity_djkk_totalinv_pdfsend_flg' || name == 'custentity_djkk_invoice_automatic'){
		if(nlapiGetFieldValue('custentity_djkk_totalinv_pdfsend_flg') == 'T' && nlapiGetFieldValue('custentity_djkk_invoice_automatic')  == 'T'){
			alert('請求書自動送信と合計請求書自動送信フラグ両方チェック出来ません');
			nlapiSetFieldValue(name, 'F');
		}
	}
	
	//・合計請求書自動送信フラグにチェックを入れたら自動的に「合計請求書印刷除外」フラグにチェックを入れる。
	if(name == 'custentity_djkk_totalinv_pdfsend_flg'){
		if(nlapiGetFieldValue('custentity_djkk_totalinv_pdfsend_flg') == 'T'){
			nlapiSetFieldValue('custentity_djkk_totalinv_print_ex', 'T')
		}
		
	}
	
//	// DENISJAPAN-255 add by ycx 2021/06/02
//	var userRole=nlapiGetRole();
//	
//	// 管理者
//	if(userRole!='3'){   
//	// DJ_会社間取引用
//	if (name == 'custentity_djkk_intercompany_transac') {
//		try {
//			var intercompany = nlapiGetFieldValue('custentity_djkk_intercompany_transac');
//			var headerSubsidiary = nlapiGetFieldValue('subsidiary');
//			if (intercompany == 'F') {
//				var scount = nlapiGetLineItemCount('submachine');
//				for (var su = 1; su < scount + 1; su++) {
//					var lineSubsidiary = nlapiGetLineItemValue('submachine','subsidiary', su);
//					if (lineSubsidiary != headerSubsidiary) {
//						nlapiRemoveLineItem('submachine', su);
//					}
//				}
//
//			}
//		} catch (e) {}
//	}
//	}
//	//add end
	
	//DJ_合計請求書PDF送付フラグ チャックされた場合、DJ_合計請求書自動送信フラグ自動設定する
//	if(name == 'custentity_djkk_totalinv_pdfsend_flg' ) {
//		if(nlapiGetFieldValue('custentity_djkk_totalinv_pdfsend_flg') == 'T'){
//			nlapiSetFieldValue('custentity_djkk_totalinv_autosend_flg', 'T');
//		}
//		
//	}
//20220711 add by zhou
//U785
	if(type == 'addressbook' ) {
		//食品
		var subsidiary = getRoleSubsidiary();
		if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){ 
		var DbillingAddress = nlapiGetLineItemValue("addressbook","defaultbilling",linenum);//デフォルト請求先
			if(DbillingAddress =='T'){
				nlapiSelectLineItem('addressbook', linenum);
				var subrecord = nlapiViewCurrentLineItemSubrecord('addressbook','addressbookaddress');
				if(!isEmpty(subrecord)){
					var addrphoneInSubRecord  = subrecord.getFieldValue('addrphone');
					var FaxInSubRecord  = subrecord.getFieldValue('custrecord_djkk_address_fax');
					var phone = nlapiGetFieldValue('phone');
					var fax = nlapiGetFieldValue('fax');
					if(isEmpty(phone)){
						nlapiSetFieldValue('phone',addrphoneInSubRecord);
					}
					if(isEmpty(fax)){
						nlapiSetFieldValue('fax',FaxInSubRecord);
							
					}
				}
			}
		}
	}
//end
	//20221219 add by zhou CH214
	if(name == 'custentity_4392_useids'){ 
		var cust = nlapiGetFieldValue('customform');
		if((cust == '80'||cust == '141'||cust == '142'||cust == '143')&&nlapiGetFieldValue('custentity_4392_useids') == 'F'){
			console.log('111')
			nlapiSetFieldValue('custentity_jp_duedatecompute','F')
//			nlapiSetFieldValue('custentity_jp_due_date_adjustment','')
		}
	}
	//end
	
	
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type){
//	// DENISJAPAN-255 add by ycx 2021/06/02
//	var userRole=nlapiGetRole();
//	
//	// 管理者
//	if(userRole!='3'){   
//	if (type == 'submachine') {
//		try {
//			var flag = false;
//			var headerSubsidiary = nlapiGetFieldValue('subsidiary');
//			var scount = nlapiGetLineItemCount('submachine');
//			// DJ_会社間取引用
//			var intercompany = nlapiGetFieldValue('custentity_djkk_intercompany_transac');
//			if (intercompany == 'F') {
//				for (var su = 1; su < scount + 1; su++) {
//					var lineSubsidiary = nlapiGetLineItemValue('submachine','subsidiary', su);
//					if (lineSubsidiary != headerSubsidiary) {
//						flag = true;
//						nlapiRemoveLineItem('submachine', su);
//					}
//				}
//				if (flag) {
//					alert('DJ_会社間取引用選択されていません、子会社編集不可');
//				}
//			}
//		} catch (e) {}
//	}
//  }
//	// add end
}
/*
 * 出荷停止
 * */
function shipmentstop(){
	var theLink = '';
	var id=nlapiGetRecordId();
	var record=nlapiLoadRecord('customer', id);
	var salesrep=record.getFieldValue('salesrep');	
	var stopFlag=record.getFieldValue('custentity_djkk_shipping_suspend_flag');
	if(stopFlag=='T'){
		alert('この顧客はすでに「出荷停止」状態にあります');
	}else{
		var theLink = nlapiResolveURL('SUITELET',
				'customscript_djkk_sl_customer_shipstop',
				'customdeploy_djkk_sl_customer_shipstop');
				 theLink+='&stoptype=T';
		        theLink+='&customerid='+id;
		        nlExtOpenWindow(theLink, 'newwindow',600, 300, this, false, '出荷停止');
	}
}

/*
 * 出荷回復
 * */
function shipmentback(){
	var theLink = '';
	var id=nlapiGetRecordId();
	var record=nlapiLoadRecord('customer', id);
	var stopFlag=record.getFieldValue('custentity_djkk_shipping_suspend_flag');
	if(stopFlag=='F'){
		alert('この顧客は「出荷停止」ステータスではありません');
	}else{
		var theLink = nlapiResolveURL('SUITELET',
				'customscript_djkk_sl_customer_shipstop',
				'customdeploy_djkk_sl_customer_shipstop');
				 theLink+='&stoptype=F';
		        theLink+='&customerid='+id;
		        nlExtOpenWindow(theLink, 'newwindow',600, 300, this, false, '出荷回復');
	}
}

/*
 * DJ_顧客売掛勘定検索
 * */
function getReceivab(type,isperson){
var receivabSearch = nlapiSearchRecord("customrecord_djkk_accounts_receivab",null,
		[
		   ["custrecord_djkk_customer_type","anyof",type], 
		   "AND", 
		   ["custrecord_djkk_isperson","anyof",isperson]
		], 
		[
		   new nlobjSearchColumn("custrecord_djkk_receivablesaccount")
		]
		);
if(!isEmpty(receivabSearch)){
return receivabSearch[0].getValue('custrecord_djkk_receivablesaccount');
}else{
	return '';
}
return '';
}


/*
 * U719 住所のコピー
 * */
function copyaddress() {
	var count = nlapiGetLineItemCount('addressbook');
    if(count=='0'){
		alert('コピーできる住所がありません');
		return;
	}
	nlapiSelectLineItem('addressbook', count);	
    var label=nlapiGetCurrentLineItemValue('addressbook', 'label');
	var subrecord = nlapiViewCurrentLineItemSubrecord('addressbook','addressbookaddress');
	nlapiSelectNewLineItem('addressbook');
	var copySubrecord = nlapiCreateCurrentLineItemSubrecord('addressbook','addressbookaddress');

	copySubrecord.setFieldValue('country', subrecord.getFieldValue('country'),false,true);
	copySubrecord.setFieldValue('zip', subrecord.getFieldValue('zip'),false,true);
	copySubrecord.setFieldValue('custrecord_djkk_address_state', subrecord.getFieldValue('custrecord_djkk_address_state'),false,true);
	copySubrecord.setFieldValue('city', subrecord.getFieldValue('city'),false,true);
	copySubrecord.setFieldValue('addr1', subrecord.getFieldValue('addr1'),false,true);
	copySubrecord.setFieldValue('addr2', subrecord.getFieldValue('addr2'),false,true);
	copySubrecord.setFieldValue('custrecord_djkk_address_fax', subrecord.getFieldValue('custrecord_djkk_address_fax'),false,true);
	copySubrecord.setFieldValue('addressee', subrecord.getFieldValue('addressee'),false,true);
	copySubrecord.setFieldValue('attention', subrecord.getFieldValue('attention'),false,true);
	copySubrecord.setFieldValue('addrphone', subrecord.getFieldValue('addrphone'),false,true);
//	copySubrecord.setFieldValue('custrecord_djkk_shipcompany_instructions', subrecord.getFieldValue('custrecord_djkk_shipcompany_instructions'),false,true);//DENISJAPAN-489を非表示
//	copySubrecord.setFieldValue('custrecord_djkk_location_instructions', subrecord.getFieldValue('custrecord_djkk_location_instructions'),false,true);//DENISJAPAN-489を非表示
	copySubrecord.setFieldValue('custrecord_djkk_mail', subrecord.getFieldValue('custrecord_djkk_mail'),false,true);
	copySubrecord.commit();
	nlapiSetCurrentLineItemValue('addressbook', 'label', label,false,true);
	nlapiCommitLineItem('addressbook');
}