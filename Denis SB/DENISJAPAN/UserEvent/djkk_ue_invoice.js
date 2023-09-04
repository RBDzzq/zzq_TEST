/**
 *請求書のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/26     CPC_苑
 *
 */

//「前払い」2
var PAYMENT_CONDIRIONA_MAIBARAI = '2';
//「代引き」1
var PAYMENT_CONDIRIONA_DAIHIKI = '1';


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {
//	try{
//		var custformVal = request.getParameter('transform');
//		if(custformVal=='salesord'){
//			var dateNow = nlapiGetFieldValue('trandate');
//			var dateVal = formatDate(nlapiStringToDate(dateNow));
//			nlapiSetFieldValue('custbody_djkk_delivery_date',dateVal,false);
//			
//		}
//	}catch(e){
//		
//	}
	
//20220512 add by zhou start	
//黒伝-納品書PDF出力
		// 5/12ボタンを追加
	var subsidiary = getRoleSubsidiary();
    
	// CH393 zheng 20230324 start
	if(type == 'edit') {
	    if(SUB_NBKK == SUB_NBKK || subsidiary == SUB_ULKK) {
	        // DJ_営業チェック済フラグ
            var salesCheckedFlagField = form.getField('custbody_djkk_sales_checked_flag');
            if (salesCheckedFlagField) {
                salesCheckedFlagField.setDisplayType('disabled');
            }
            // DJ_FINET請求連携済みフラグ
            var invSentFlgField = form.getField('custbody_djkk_finet_invoice_sent_flg');
            if (invSentFlgField) {
                invSentFlgField.setDisplayType('disabled');
            }
	    }
    }
	// CH393 zheng 20230324 end
	
	// CH601 zhou 20230602 start
//	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK && nlapiGetFieldValue('approvalstatus') == '2' && type=='view'){
	if(subsidiary != SUB_SCETI && subsidiary != SUB_DPKK && nlapiGetFieldValue('approvalstatus') == '2' && type=='view'){
		// CH601 zhou 20230602 end
			form.setScript('customscript_djkk_cs_invoice');
			form.addButton('custpage_pdfMaker', '納品書PDF出力','pdfMaker();');
	}
//20220512 add by zhou end	
		
	form.setScript('customscript_djkk_cs_invoice');
	if(!isEmpty(nlapiGetFieldValue('custbody_djkk_estimate_re'))&&type=='view'){
	form.addButton('custpage_outputpdf', '納品書＆請求書PDF出力','outputpdf();');
	}
	var cust = nlapiGetFieldValue('customform');
	//プロジェクト非表示
	setFieldDisableType('job','hidden')
	
	//20221024 add by sys start	
	if(type=='view'){
		var invoiceSub = nlapiGetFieldValue('subsidiary');
		if(invoiceSub == SUB_NBKK || invoiceSub == SUB_ULKK){
			
			//changed by geng add start U248
			var status = nlapiGetFieldValue('approvalstatus');//status  2
			var payment = nlapiGetFieldValue('custbody_djkk_payment_conditions');//pay 
			if(status=='2'&&payment=='1'){
				form.addButton('custpage_invoiceTranPdf', '代引請求書PDF','invoiceTranPdf();');
			}
//			else if(status=='2'&&payment=='2'){
//				form.addButton('custpage_invoiceTranPdf', '前金請求書PDF','invoiceTranPdf();');
//			}
			else if(status=='2'&&payment=='5'){
//				form.addButton('custpage_invoicePdf', '個別請求書出力','invoicePdf();');
			}
//			if(status == '2'){
				form.addButton('custpage_invoicePdf', '個別請求書出力','invoicePdf();');
//			}
			
			//changed by geng add end U248
		    // CH809 add by zdj 20230818 start
		    var apprFlag = nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg');
		    if (apprFlag == true || apprFlag == 'T') {
		        if((invoiceSub == SUB_NBKK || invoiceSub == SUB_ULKK)) {
		             var devStatus = nlapiGetFieldValue('custbody_djkk_trans_appr_status');
		             var status = nlapiGetFieldValue('approvalstatus');
		             if (devStatus == '2' && status == '2') {
		                 form.setScript('customscript_djkk_cs_invoice');
		                 form.addButton('custpage_fieldsModify', '請求書修正','fieldsModify()');
		             }
		        }
		    }
		    // CH809 add by zdj 20230818 end	
		}
	}
//20221024 add by sys end
	
	
	

	//0829食品制限を追加
	var subsidiary = getRoleSubsidiary();
	if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
		if(!isEmpty(nlapiGetFieldValue('location'))&&isEmpty(nlapiGetFieldValue('custbody_djkk_location'))){
			nlapiSetFieldValue('custbody_djkk_location', nlapiGetFieldValue('location'), false, true);
		}else if(!isEmpty(nlapiGetFieldValue('custbody_djkk_location'))&&isEmpty(nlapiGetFieldValue('location'))){
			nlapiSetFieldValue('location', nlapiGetFieldValue('custbody_djkk_location'), false, true);
		}
	}
	

	
	
	//U599　JRAM場合請求日が出荷日で自動設定する。
	var createFrom = nlapiGetFieldValue('createdfrom');
	if(!isEmpty(createFrom)){
		nlapiLogExecution('DEBUG', '作成元がJRAM', '請求日が出荷日で自動設定する');
		var salesorderSearch = nlapiSearchRecord("salesorder",null,
				[
				   ["type","anyof","SalesOrd"], 
				   "AND", 
				   ["custbody_djkk_edi_so_kbn","startswith","JRAM"], 
				   "AND", 
				   ["internalid","anyof",createFrom]
				], 
				[
				   new nlobjSearchColumn("shipdate")
				]
				);
		if(!isEmpty(salesorderSearch)){
			var shipDate = salesorderSearch[0].getValue("shipdate");
			if(!isEmpty(shipDate)){
				nlapiLogExecution('DEBUG', '請求日自動設定',shipDate )
				nlapiSetFieldValue('trandate', shipDate);
			}
			
		}
		
		
	}
	//20221209 add by zhou start CH170 
	if(cust == '160' && type == 'copy'){
		var copyBy = nlapiGetFieldValue('copiedfrom');
		
		var allFieldName = nlapiLoadRecord('invoice', copyBy).getAllFields();
		for(var f = 0 ; f < allFieldName.length ; f++){
			var getFieldType = nlapiGetField(allFieldName[f]);
			if(getFieldType != null){
				var getType = getFieldType.getType();
			}
			if(getType == 'checkbox'){
				nlapiSetFieldValue(allFieldName[f],'F')
			}
		}
	}
	//end

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit approve, reject,
 *            cancel (SO, ER, Time Bill, PO & RMA only) pack, ship (IF)
 *            markcomplete (Call, Task) reassign (Case) editforecast (Opp,
 *            Estimate)
 * @returns {Void}
 *
 */
function userEventBeforeSubmit(type) {
	//0829食品制限を追加
	var subsidiary = getRoleSubsidiary();
	if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
		if(!isEmpty(nlapiGetFieldValue('location'))&&isEmpty(nlapiGetFieldValue('custbody_djkk_location'))){
//			nlapiSetFieldValue('custbody_djkk_location', nlapiGetFieldValue('location'), false, true);
		}
//		else if(!isEmpty(nlapiGetFieldValue('custbody_djkk_location'))&&isEmpty(nlapiGetFieldValue('location'))){
//			nlapiSetFieldValue('location', nlapiGetFieldValue('custbody_djkk_location'), false, true);
//		}
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit, approve,
 *            cancel, reject (SO, ER, Time Bill, PO & RMA only) pack, ship (IF
 *            only) dropship, specialorder, orderitems (PO only) paybills
 *            (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type) {

//	// DJ_支払条件
//	var custbody_djkk_payment_conditions = nlapiGetFieldValue('custbody_djkk_payment_conditions');
//	// DJ_請求書自動送信
//	var custbody_djkk_invoice_automa = nlapiGetFieldValue('custbody_djkk_invoice_automa');
//	// DJ_請求書自動送信
//	var custbody_djkk_invoice_automa_flg = nlapiGetFieldValue('custbody_djkk_invoice_automa_flg');
//	// 顧客
//	var entity = nlapiGetFieldValue('entity');
//	// DJ_支払条件判断用フラグ
//	var custbody_djkk_payment_conditions_flg = 'F';
//	var id=nlapiGetRecordId();
//	// メール送信機能
//	if (type == 'create') {
//
//		var title = '';
//		var body = '';
//
//		// 注文書の作成者 非表示フィールドです。
//		var employee = nlapiGetFieldValue('custbody_djkk_input_person');
//
//		if (!isEmpty(employee)) {
//			// メール取得
//			//var eamil = nlapiLookupField('employee', employee, 'email');
//			var eamil = nlapiLookupField('customer', nlapiGetFieldValue('entity'), 'email')
//			
//			if (!isEmpty(eamil) && !isEmpty(nlapiGetUser())) {
//				// メール送信する
//				sendEmail(nlapiGetUser(), eamil, title, body,
//						nlapiGetFieldValue('id'), 2,null);
//			}
//
//		}
//
//	}
//
//	//  「前払い」1と「代引き」2以外 場合送信します。
//	if (custbody_djkk_payment_conditions != PAYMENT_CONDIRIONA_DAIHIKI
//			&& custbody_djkk_payment_conditions != PAYMENT_CONDIRIONA_MAIBARAI) {
//		custbody_djkk_payment_conditions_flg = 'T';
//	}
//
//	// DJ_請求書自動送信がFalse場合 顧客のDJ_請求書自動送信を見る
//	if (custbody_djkk_invoice_automa != 'T') {
//		custbody_djkk_payment_conditions_flg = nlapiLookupField('customer',
//				entity, 'custentity_djkk_invoice_automatic');
//	}
//
//	// DJ_請求書自動送信 チェックされった 「前払い」1と「代引き」2以外 場合送信します。
//	if (custbody_djkk_invoice_automa == 'T'
//			&& custbody_djkk_payment_conditions_flg == 'T' && custbody_djkk_invoice_automa_flg != 'T') {
//
//		// メール送信する
//		var title = '';
////		var body = '';
////		var eamil = mail_address_temp;
//		
//		var body = nlapiGetFieldValue('custbody_djkk_invoice_automatic_memo');;
//		var mail = nlapiGetFieldValue('custbody_djkk_invoice_automatic_mail');
//		var fax = nlapiGetFieldValue('custbody_djkk_invoice_automatic_fax');
//
//		// ファイル取得
//		var transactionSearch = getSearchResults("transaction", null, [ [
//				"internalid", "anyof", nlapiGetFieldValue('id') ] ],
//				[ new nlobjSearchColumn("internalid", "file", null) ]);
//
//		var arrFile = null;
//		if (!isEmpty(transactionSearch)) {
//			arrFile = new Array();
//			for (var i = 0; i < transactionSearch.length; i++) {
//				var fileid = transactionSearch[i].getValue("internalid","file")
//				if (arrFile.indexOf(fileid) == -1 && !isEmpty(fileid) && fileid != -1) {
//					arrFile.push(fileid)
//							nlapiLogExecution('DEBUG', '123', fileid);
//				}
//			}
//
//		}
//
//		// 送信先 、タイトル、ボディ不明のため テスト内容を設定します。
//		if(!isEmpty(nlapiGetUser())){
//			if(!isEmpty(mail)){
//				sendEmail(nlapiGetUser(), mail, title, body, nlapiGetFieldValue('id'),
//						6, arrFile);
//			}
//			if(!isEmpty(fax)){
//				sendFax(nlapiGetUser(), fax, title, body, nlapiGetFieldValue('id'),6, arrFile);
//			}
//		}
//      nlapiSubmitField('invoice', id, 'custbody_djkk_invoice_automa_flg', 'T', false);
//	}

}
function formatDate(dt){    //日付
	  return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate()+7, 2)) : '';
	}
