/**
 * 注文書のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/03/09     CPC_苑             新規作成
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
	
	// ロールの会社取得
	var roleSubsidiary = getRoleSubsidiary();

	try {
		
		var projectid = request.getParameter('projectid');
		if (!isEmpty(projectid)) {
			// DJ_プロジェクト
			nlapiSetFieldValue('custbody_djkk_project', projectid);
		}
		
		var requestdayType = nlapiGetFieldValue('subsidiary');
		if(!isEmpty(requestdayType)){
			if(roleSubsidiary == requestdayType && roleSubsidiary == 6){
				//SCETI
				formHiddenTab(form,'custom43txt');
	    	}else if(roleSubsidiary == requestdayType && roleSubsidiary == 7){
	    		//DPKK
	    		formHiddenTab(form,'custom41txt');
	    	}
		}
	} catch (e) {
		nlapiLogExecution('debug', 'USEREVENTBEFORELOAD_ERROR_LINE(54) : ', e);
	}
	
	form.setScript('customscript_jdkk_cs_salesorder');
	if (type == 'view') {
//		if(roleSubsidiary != SUB_NBKK && roleSubsidiary != SUB_ULKK){
//			form.addButton('custpage_receiptmaker', '受領書印刷','receiptPDF()');
//		}	
		
		//支払条件
		var custbody_djkk_payment_conditions = nlapiGetFieldValue('custbody_djkk_payment_conditions');
		//出荷指示済み
		var custbody_djkk_shipping_instructions = nlapiGetFieldValue('custbody_djkk_shipping_instructions')
		var haisouBtnShowFlg = 'T';
		var record = nlapiLoadRecord('salesorder', nlapiGetRecordId());
		
		// 「 前払い場合下記処理行います
		if (custbody_djkk_payment_conditions == PAYMENT_CONDIRIONA_MAIBARAI) {
			// 注文書合計金額取得
			var soTotal = nlapiGetFieldValue('total');

			// 前払い金合計金額取得
			var customerdepositTotal = 0;
			
			var count = record.getLineItemCount('links')

			for (var i = 0; i < count; i++) {
				record.selectLineItem('links',  i + 1);
				
				// DJ_預かりアイテム
				var cusitem = record.getCurrentLineItemValue('item', 'custcol_djkk_custody_item');
				if(cusitem=='T'){
					haisouBtnShowFlg='F';
				}
				if (record.getCurrentLineItemValue('links', 'type') == '前受金'){
					customerdepositTotal += Number(record.getCurrentLineItemValue('links', 'total'));
				}	
			}

			// 前払い金合計金額＝ 注文書合計金額場合 配送指示ボタン表示
			if (Number(soTotal) == Number(customerdepositTotal)) {
				haisouBtnShowFlg = 'T';
			}else{
				haisouBtnShowFlg = 'F';
			}
		} 
		
		//出荷指示済み　がチェック場合
		if(custbody_djkk_shipping_instructions == 'T'){
			haisouBtnShowFlg = 'F'
		}

		if(record.getFieldValue('subsidiary')==SUB_NBKK||record.getFieldValue('subsidiary')==SUB_ULKK){
			haisouBtnShowFlg = 'F'
		}
		
		//明細行で、在庫アイテム存在なし場合配送指示しない
		var searchInvRst = nlapiSearchRecord("transaction",null,[["internalid","anyof",nlapiGetRecordId()],"AND",["mainline","is","F"],"AND",["item.type","anyof","InvtPart"]],[]);
		
		if(isEmpty(searchInvRst)){
			haisouBtnShowFlg = 'F';
			nlapiSetFieldValue('custbody_djkk_shipping_instructions', 'T')
		}
		
		//add start与信限度額判断    todolistU014 by geng
		var total = nlapiGetFieldValue('total');
		var exchangerate = nlapiGetFieldValue('exchangerate')
		total = Number(total) * Number(exchangerate);
		var custId = nlapiGetFieldValue('entity');
		if(isEmpty(custId)){
			return false;
		}
		
		var custRec = nlapiLoadRecord('customer', custId);
		var custName = custRec.getFieldValue('entityid');
		var custCreateLimit = custRec.getFieldValue('custentity_djkk_credit_limit');
		var custBalance = custRec.getFieldValue('balance');
		var unbilledorders = custRec.getFieldValue('unbilledorders');
		
		if(Number(custCreateLimit) - Number(custBalance) -Number(total) -Number(unbilledorders)  >= 0){
			//配送指示ボタンを表示する
			if(haisouBtnShowFlg == 'T'){
			    var soApprStatus = custRec.getFieldValue('custbody_djkk_trans_appr_status');
			    if (soApprStatus && soApprStatus == '2') {
	                form.addButton('custpage_deliveryinstructions', '配送指示','deliveryinstructionst()');   
			    }
			}
		}
		
		var itemcount = record.getLineItemCount('item')
		var recordStatus=record.getFieldValue('status');
		var payment = nlapiGetFieldValue('custbody_djkk_payment_conditions');//pay 
        var custodyItemFlag=false;
        var itemArray=new Array();
		for (var j = 1; j < itemcount+1; j++) {
			record.selectLineItem('item',  j);
			itemArray.push(record.getCurrentLineItemValue('item', 'item'));
			// DJ_預かりアイテム
			if (record.getCurrentLineItemValue('item', 'custcol_djkk_custody_item') == 'T'){
				custodyItemFlag=true;
			}	
		}
		if(custodyItemFlag&&recordStatus!='承認保留'&&recordStatus!='配送保留'){
			form.addButton('custpage_custodyitem', 'DJ_預かり在庫配送','creatIca();');
		}
		if(recordStatus=='請求済み'||recordStatus=='請求保留'){
			var itemSearch = nlapiSearchRecord("item",null,
					[
					   ["custitem_djkk_re_object","is","T"], 
					   "AND", 
					   ["internalid","anyof",itemArray]
					], 
					[
					   new nlobjSearchColumn("internalid",null,"GROUP")
					]
					);
		}
		var isRepair=nlapiGetFieldValue('custbody_djkk_estimate_re');
		if(!isEmpty(isRepair)){
			form.addButton('custpage_invoicepdf', '請求書PDF出力',"repairPDF('invoice');");
			form.addButton('custpage_deliverypdf', '納品書PDF出力',"repairPDF('delivery');");
			form.addButton('custpage_receiptpdf', '受領書PDF出力',"repairPDF('receipt');");
		}		
		// add U415 by sys start
		var status = nlapiGetFieldValue('orderstatus');
		if(status != 'A'){
		    // zheng 20230423 start
	        if(record.getFieldValue('subsidiary') == SUB_SCETI || record.getFieldValue('subsidiary') == SUB_DPKK){
	            form.addButton('custpage_pdfTwo', '納品書、物品受領書、請求書出力','pdfSum();');   
	        }
	     // zheng 20230423 end
		}
		
		// add U415 by sys end	
		if(status != 'A' && payment=='2'){
	        form.addButton('custpage_invoiceTranPdf', '前金請求書PDF','invoiceTranPdf();');
	    }
	}else{
		form.addButton('custpage_commission', '手数料計算', 'commission();');
		form.addButton('custpage_commission2', '配送料計算', 'commission2();');
		form.addButton('custpage_commissiondelect', '手数料削除','commissionDelect();');
		form.addButton('custpage_commissiondelect2', '配送料削除','commissionDelect2();');
	}
	

	//プロジェクト非表示
	setFieldDisableType('job','hidden')
		
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
 */
function userEventBeforeSubmit(type) {
	//20220809 add by zhou U732
	if (type == 'create'||type == 'edit'){
		var subsidiary = getRoleSubsidiary();
		var customerLocation  = nlapiGetFieldValue('custbody_djkk_customer_address');
		var destinationLocation  = nlapiGetFieldValue('custbody_djkk_delivery_address');
		if(isEmpty(destinationLocation)&& isEmpty(customerLocation)){
			if(subsidiary == SUB_SCETI||subsidiary == SUB_DPKK){
				var entityId = nlapiGetFieldValue('entity');
				if (!isEmpty(entityId)) {
					var customerSearch = nlapiSearchRecord("customer",null,
							[
							   ["isdefaultbilling","is","T"], 
							   "AND", 
							   ["internalid","anyof",entityId]
							], 
							[
							   new nlobjSearchColumn("custrecord_djkk_address_state","Address",null), 
							   new nlobjSearchColumn("city","Address",null), 
							   new nlobjSearchColumn("address1","Address",null), 
							   new nlobjSearchColumn("address2","Address",null), 
							   new nlobjSearchColumn("address3","Address",null), 
							   new nlobjSearchColumn("addressee","Address",null)
							]
							);
					if(customerSearch != null){
						var addressState = customerSearch[0].getValue("custrecord_djkk_address_state","Address",null);
						var city = customerSearch[0].getValue("city","Address",null);
						var address1 = customerSearch[0].getValue("address1","Address",null);
						var address2 = customerSearch[0].getValue("address2","Address",null);
						var address3 = customerSearch[0].getValue("address3","Address",null);
						var addressee = customerSearch[0].getValue("addressee","Address",null);
						var str = ''
						str += ''+addressState+' '+city+' '+address1+' '+address2+' '+address3+' '+addressee+'';
						nlapiSetFieldValue('custbody_djkk_customer_address', str);
					}
				}
				
				var destinationID = nlapiGetFieldValue('custbody_djkk_delivery_destination');
				if (!isEmpty(destinationID)) {
					var destinationSearch = nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
							[
							   ["internalid","anyof",destinationID]
							], 
							[
							   new nlobjSearchColumn("custrecord_djkk_prefectures"), 
							   new nlobjSearchColumn("custrecord_djkk_municipalities"), 
							   new nlobjSearchColumn("custrecord_djkk_delivery_residence"), 
							   new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),
							]
							);
					if(destinationSearch != null){
						var prefectures = destinationSearch[0].getValue("custrecord_djkk_prefectures");
						var municipalities = destinationSearch[0].getValue("custrecord_djkk_municipalities");
						var deliveryResidence = destinationSearch[0].getValue("custrecord_djkk_delivery_residence");
						var deliveryResidence2 = destinationSearch[0].getValue("custrecord_djkk_delivery_residence2");
						var str2 = ''
						str2 += ''+prefectures+municipalities+deliveryResidence+deliveryResidence2+'';
						nlapiSetFieldValue('custbody_djkk_delivery_address', str2);
					}
				}
			}
		}
	}
	//end
	var count = nlapiGetLineItemCount('item');
	for (var i = 1; i < count + 1; i++) {
		nlapiSelectLineItem('item', i);
		 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
		var locationId = nlapiGetFieldValue('location');
		var location = nlapiGetCurrentLineItemValue('item', 'location');
		
		// DJ_預かりアイテム
		var cusitem = nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item');
		if(cusitem=='T'){
			// DJ_出荷指示済み(・U003:預かり在庫アイテムをチェックする場合、配送指示ボタンは要らない：自動送信は要らないです。)
			nlapiSetFieldValue('custbody_djkk_shipping_instructions', 'T');
		}
		if (!isEmpty(locationId) && isEmpty(location)) {
			nlapiSetCurrentLineItemValue('item', 'location', locationId);
			nlapiCommitLineItem('item');
		}
		 }
	}

	// DJ枝番自動採番
	var custrecord_djkk_now_number = nlapiGetFieldValue("custbody_djkk_branch_number");
	if (isEmpty(custrecord_djkk_now_number)) {
		nlapiSetFieldValue("custbody_djkk_branch_number", getDjkkNowNumber('販売枝番'));
	}

	if (type == 'create') {
		try{
			var userid=nlapiGetUser();
			if(!isEmpty(userid)&&userid!='-4'&&userid!=-4){
				// DJ_作成者 注文書のみ設定している 請求書画面に自動連携します
				nlapiSetFieldValue('custbody_djkk_input_person', userid);
			}
		}catch(e){
			nlapiLogExecution('debug', 'USEREVENTBEFORESUBMIT_ERROR_LINE(295):',e);
		}
	}
	
	//10 19　単価か金額の変更がある注文書を対象に、「外部システムフィードバック対象フラググ」をTに更新。
	//食品のみ　3　NBKK　　4　ULKK
	var sub = nlapiGetFieldValue('subsidiary')
	if(type == 'edit'){
		if(sub == SUB_NBKK || sub == SUB_ULKK){
			var preTotal = nlapiLookupField('salesorder', nlapiGetRecordId(), 'total');
			var nowTotal = nlapiGetFieldValue('total')
			if(Number(preTotal) != Number(nowTotal)){
				nlapiSetFieldValue('custbody_djkk_exsystem_feedback_flg', 'T');
			}
		}
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
	
	if(type=='delete'){
		return null;
	}else{
		// DJ_支払条件
		var custbody_djkk_payment_conditions = nlapiGetFieldValue('custbody_djkk_payment_conditions');
		// DJ_納期回答自動送信
		var custbody_djkk_delivery_replyauto = nlapiGetFieldValue('custbody_djkk_delivery_replyauto');
		// DJ_納期回答自動送信
		var custbody_djkk_delivery_replyauto_flg = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_flg');
		//納品先
		var custbody_djkk_delivery_destination =  nlapiGetFieldValue('custbody_djkk_delivery_destination');
		
		var count = nlapiGetLineItemCount('item');
		for (var i = 1; i < count + 1; i++) {
			nlapiSelectLineItem('item', i);
			 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
			var location = nlapiGetCurrentLineItemValue('item', 'location');
			// DJ_預かりアイテム
			var cusitem = nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item');
			if(cusitem=='T'){
				// DJ_出荷指示済み(・U003:預かり在庫アイテムをチェックする場合、受注納期回答自動送信も要らない。。)
				custbody_djkk_delivery_replyauto='F';
			}
			 }
		}
		
		//U214
		// メール送信機能 前払金入金待ちメール 
		//食品毎回変更時、LSは新規作成時　送信する
	    var id=nlapiGetRecordId();
	    var sub = nlapiGetFieldValue('subsidiary');
	    var totalAmt = nlapiGetFieldValue('total');
	    
		if ( (sub == SUB_NBKK ||sub == SUB_ULKK ) || (type =='create' && sub == SUB_SCETI ||sub == SUB_DPKK  )) {
			// 支払条件は「前払い」2場合
			if (custbody_djkk_payment_conditions == PAYMENT_CONDIRIONA_MAIBARAI) {
				var title = '';
				var body = '';
				var mail = mail_address_temp;
				// メール送信する
				// 送信先 、タイトル、ボディ不明のため テスト内容を設定します。
				//送信元がない場合送信しません
				var from = nlapiGetUser();
				if(isEmpty(from)){
					from = nlapiGetFieldValue('salesrep');
				}
				var maeuketsukeAMT = 0;
				var customerdepositSearch = nlapiSearchRecord("customerdeposit",null,
						[
						   ["voided","is","F"], 
						   "AND", 
						   ["type","anyof","CustDep"], 
						   "AND", 
						   ["createdfrom","anyof",id]
						], 
						[
						   new nlobjSearchColumn("amount",null,"SUM")
						]
						);
				if(!isEmpty(customerdepositSearch)){
					maeuketsukeAMT = customerdepositSearch[0].getValue("amount",null,"SUM");
				}
				//前受金の合計金額　＜　受注の金額場　経理さんへ入金待ちのメールを出します。
				if(maeuketsukeAMT < totalAmt){
					if(!isEmpty(from) && from > 0 ){
						sendEmail(from, mail, title, body,id, 1,null);
					}
					nlapiSubmitField('salesorder', id, 'custbody_djkk_customerdeposit_sendmail', 'T', false);
				}
			}
		}

		var custId = nlapiGetFieldValue('entity');
		if(isEmpty(custId)){
			return false;
		}
		
		var custRec = nlapiLoadRecord('customer', custId);	
		var subsidiary = custRec.getFieldValue('subsidiary');
		
		// DJ_納期回答自動送信 チェックされった場合送信します。
		if(subsidiary == '6' || subsidiary == '7'){
			if (custbody_djkk_delivery_replyauto == 'T' && custbody_djkk_delivery_replyauto_flg != 'T') {
		
				// メール送信する
				var title = '';
				var body = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_memo');
				var mail = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_mail');
				var fax = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_fax');
		
				// ファイル取得
				var transactionSearch = getSearchResults("transaction", null, [ [
						"internalid", "anyof", id ] ],
						[ new nlobjSearchColumn("internalid", "file", null) ]);
		
				var arrFile = null;
				if (!isEmpty(transactionSearch)) {
					arrFile = new Array();
					for (var i = 0; i < transactionSearch.length; i++) {
						var fileid = transactionSearch[i].getValue("internalid","file")
						if (arrFile.indexOf(fileid) == -1 && !isEmpty(fileid) && fileid != -1) {
							arrFile.push(fileid);
						}
					}
				}
						
				// 送信先 、タイトル、ボディ不明のため テスト内容を設定します。
				var from = nlapiGetUser();
				if(!isEmpty(mail) && !isEmpty(from) && from > 0){
					sendEmail(from, mail, title, body, id,4,arrFile);
				}
				if(!isEmpty(fax)  && !isEmpty(from) && from > 0){
					sendFax(from, fax, title, body, id,4,arrFile);
				}
				nlapiSubmitField('salesorder', id, 'custbody_djkk_delivery_replyauto_flg', 'T', false);
			}
		}
	}
		
	var salesorderRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
    var headerLocation=salesorderRecord.getFieldValue('location');
	var count = salesorderRecord.getLineItemCount('item');
	
	var itemIdAry = [];
	var perunitquantityObj = {};
	for(var x = 1; x < count+1; x++){
		 if (salesorderRecord.getLineItemValue('item', 'itemtype', x) != 'EndGroup') {
		itemIdAry.push(salesorderRecord.getLineItemValue('item', 'item', x));
		 }
	}
	
	if(itemIdAry.length > 0){
		var itemPerunitquantitySearch = nlapiSearchRecord("item",null,
				[
				   ["internalid","anyof",itemIdAry]
				], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("custitem_djkk_perunitquantity")
				]
		);
		
		if(itemPerunitquantitySearch != null){
		    // CH798 add by zzq 20230815 start
		    for(var p = 0;p<itemPerunitquantitySearch.length;p++){
		        var internalidValue = itemPerunitquantitySearch[p].getValue("internalid");
	            var perunitquantityValue = itemPerunitquantitySearch[p].getValue("custitem_djkk_perunitquantity");
	            perunitquantityObj[internalidValue] = perunitquantityValue;
		    }
//			var internalidValue = itemPerunitquantitySearch[0].getValue("internalid");
//			var perunitquantityValue = itemPerunitquantitySearch[0].getValue("custitem_djkk_perunitquantity");
//			
//			perunitquantityObj[internalidValue] = perunitquantityValue;
		 // CH798 add by zzq 20230815 end
		}
	}
	//add by zzq ch677 20230703 start 
	var itemArr=[];
	for(var k = 1; k < count+1; k++){
	    var itemId = salesorderRecord.getLineItemValue('item', 'item', k);
	    if(itemArr.indexOf(itemId)<0){
	        itemArr.push(itemId);
	    }
	}
	nlapiLogExecution('debug', 'itemArr', JSON.stringify(itemArr));
	var itemSearch = nlapiSearchRecord("item",null,
	        [
	           ["internalid","anyof",itemArr], 
	           "AND", 
	           ["isinactive","is","F"]
	        ], 
	        [
	           new nlobjSearchColumn("internalid"), 
	           new nlobjSearchColumn("unitstype")
	        ]
	        );
	var unitstypeObj = {};
    if(!isEmpty(itemSearch)){
        for(var j=0;j<itemSearch.length;j++){
            var itemId = itemSearch[j].getValue("internalid");
            var unitstype = itemSearch[j].getValue("unitstype");
            unitstypeObj[itemId] = unitstype;
        }
    }
    nlapiLogExecution('debug', 'unitstypeObj', JSON.stringify(unitstypeObj));
  //add by zzq ch677 20230703 end
	for(var i = 1; i < count+1; i++){
		if (salesorderRecord.getLineItemValue('item', 'itemtype', i) != 'EndGroup') {
		var lineLocation = salesorderRecord.getLineItemValue('item', 'location', i);
		if(isEmpty(lineLocation)){
			salesorderRecord.setLineItemValue('item', 'location', i, headerLocation);
		}
		//add by zzq ch677 20230703 start
		var itemId = salesorderRecord.getLineItemValue('item', 'item', i);
//		var unitname = salesorderRecord.getLineItemText('item', 'units', i);
		var unitId = salesorderRecord.getLineItemValue('item', 'units', i);
		var crVal = '';
		if (!isEmpty(unitId)) {
		    if (unitstypeObj[itemId]) {
		        crVal = getConversionrateAbbreviationNew(unitstypeObj[itemId], unitId);
		    }
		}
		// DJ_入数
//		var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
		var perunitQuantity = !isEmpty(crVal) ? crVal : '';
		
//		var itemId = salesorderRecord.getLineItemValue('item', 'item', i);
		//add by zzq ch677 20230703 end
		var quantity = salesorderRecord.getLineItemValue('item', 'quantity', i);
		
		if(!isEmpty(quantity) && !isEmpty(perunitQuantity) && !isEmpty(itemId)){
			var itemPerunitQuantity = perunitquantityObj[itemId];
			if(!isEmpty(itemPerunitQuantity)){
				// DJ_基本数量
				var conversionRate = quantity * perunitQuantity;
				
				// DJ_ケース数
				var floor = Math.floor(conversionRate / itemPerunitQuantity);
				var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
				
				// DJ_バラ数
				var djQuantity = (conversionRate - caseQuantity * itemPerunitQuantity).toFixed(2);
				
				salesorderRecord.setLineItemValue('item', 'custcol_djkk_conversionrate', i, conversionRate);
				salesorderRecord.setLineItemValue('item', 'custcol_djkk_casequantity', i, caseQuantity);
				salesorderRecord.setLineItemValue('item', 'custcol_djkk_quantity', i, djQuantity);
				salesorderRecord.setLineItemValue('item', 'custcol_djkk_perunitquantity', i, itemPerunitQuantity);
				salesorderRecord.commitLineItem('item');
			}
		}
	}
	}
	nlapiSubmitRecord(salesorderRecord, false, true);
}