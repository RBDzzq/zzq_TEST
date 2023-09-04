/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Sep 2022     rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	if (request.getMethod() == 'POST') {
		run(request, response);
		
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response)
		}else{
			createForm(request, response);
		}
	}
}

function run(request, response){	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();	
	var str = "";
	var theCount = parseInt(request.getLineItemCount('list'));
	var valueTotal = [];
	for(var i = 0 ; i < theCount; i++){
		if(request.getLineItemValue('list', 'chk', i+1)=='T'){
			var po_id = request.getLineItemValue('list', 'purchaseorder_id', i+1);	
			str +=po_id+',';
		}
	}
			
	scheduleparams['custscript_djkk_ss_poprepayment_send_id'] = str;
	runBatch('customscript_djkk_ss_poprepayment_send', 'customdeploy_djkk_ss_poprepayment_send',scheduleparams);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

//バッチ状態画面
function logForm(request, response) {
	var form = nlapiCreateForm('処理ステータス', false);
	form.setScript('customscript_djkk_cs_invoice_listing');
	// 実行情報
	form.addFieldGroup('custpage_run_info', '実行情報');
	form.addButton('custpage_refresh', '更新', 'refresh();');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_poprepayment_send');

	if (batchStatus == 'FAILED') {
		// 実行失敗の場合
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> バッチ処理を失敗しました </font>';
		runstatusField.setDefaultValue(messageColour);
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// 実行中の場合
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('バッチ処理を実行中');
		response.writePage(form);
	}else{
		createForm(request, response);
	}	
}

function createForm(request, response){

	
	//パラメータ取得
	 var selectFlg = request.getParameter('selectFlg');
	 var subsidiaryValue = request.getParameter('subsidiary');
	
	 
	var form = nlapiCreateForm('DJ_購入前払金為替レート（予約レート）送信画面', false);
	form.setScript('customscript_djkk_cs_poprepayment_send');
		
	 //画面項目追加
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '検索戻す','searchReturn()')
		 form.addSubmitButton('更新')
	 }else{
		form.addButton('btn_search', '検索', 'search()')
	 }
	 

	form.addFieldGroup('select_group', '検索');
	var subsidiaryField = form.addField('custpage_subsidiary', 'select', '受注会社','', 'select_group')
	subsidiaryField.setMandatory(true);
	 var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	if(isEmpty(subsidiaryValue)){
		subsidiaryValue = selectSub;
	}
	
	if(selectFlg == 'T'){
		subsidiaryField.setDisplayType('inline');
	}else {
		
	}
	subsidiaryField.setDefaultValue(subsidiaryValue)
	

	var subList = form.addSubList('list', 'list', '');
	subList.addMarkAllButtons();
	subList.addField('chk', 'checkbox', '選択');
	subList.addField('purchaseorder_no', 'text', '発注書番号');
	subList.addField('purchaseorder_id', 'text', '発注書番号ID').setDisplayType('hidden');
	subList.addField('status', 'text', 'ステータス');
	subList.addField('exchange_rate_p1', 'text', '第1予約レート');
	subList.addField('exchange_rate_p2', 'text', '第2予約レート');
	subList.addField('exchange_rate_p3', 'text', '第3予約レート');
//	subList.addField('subtotal', 'text', '小計');
//	subList.addField('taxtotal', 'text', '税金の合計');
//	subList.addField('total', 'text', '合計');
//	subList.addField('trandate', 'text', '発注日');
	
	

	if(selectFlg == 'T'){
		
		var purchaseorderSearch = nlapiSearchRecord("purchaseorder",null,
				[
				   ["type","anyof","PurchOrd"], 
				   "AND", 
				   ["terms","anyof","7"], 
				   "AND", 
				   ["status","anyof","PurchOrd:F","PurchOrd:E","PurchOrd:B"], 
				   "AND",
				   ["subsidiary","anyof",subsidiaryValue],
//				   "AND", 
//				   ["internalid","anyof","108488"],
					"AND",
					["taxline","is","F"],
					"AND",
					["mainline","is","F"]
				], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("tranid"),
				   new nlobjSearchColumn("status"), 
				   new nlobjSearchColumn("custbody_dj_reserved_exchange_rate_p1"), 
				   new nlobjSearchColumn("custbody_dj_reserved_exchange_rate_p2"), 
				   new nlobjSearchColumn("custbody_dj_reserved_exchange_rate_p3"),
//				   new nlobjSearchColumn("subtotal"),
//				   new nlobjSearchColumn("taxtotal"),
//				   new nlobjSearchColumn("total"),
//				   new nlobjSearchColumn("trandate"),
				]
				);

		var purchaseorderArray = [];
		var index = 0;
		var temp_tranid = '';
		for(var i = 0 ; i < purchaseorderSearch.length ;i++){
			var tranid  =purchaseorderSearch[i].getValue("tranid");
			var status  =purchaseorderSearch[i].getText("status");
			var reserved_exchange_rate_p1  =purchaseorderSearch[i].getValue("custbody_dj_reserved_exchange_rate_p1");
			var reserved_exchange_rate_p2  =purchaseorderSearch[i].getValue("custbody_dj_reserved_exchange_rate_p2");
			var reserved_exchange_rate_p3  =purchaseorderSearch[i].getValue("custbody_dj_reserved_exchange_rate_p3");
			var purchaseorder_id  =purchaseorderSearch[i].getValue("internalid");
			var subtotal  =purchaseorderSearch[i].getValue("subtotal");
			var taxtotal  =purchaseorderSearch[i].getValue("taxtotal");
			var total  =purchaseorderSearch[i].getValue("total");
			var trandate  =purchaseorderSearch[i].getValue("trandate");
			if (temp_tranid != tranid){
				nlapiLogExecution('debug', 'temp_tranid', temp_tranid);
				nlapiLogExecution('debug', 'tranid', tranid);

				var temp = [];
				temp[0] = tranid;
				temp[1] = status;
				temp[2] = reserved_exchange_rate_p1;
				temp[3] = reserved_exchange_rate_p2;
				temp[4] = reserved_exchange_rate_p3;
				temp[5] = purchaseorder_id;
//				temp[6] = subtotal;
//				temp[7] = taxtotal;
//				temp[8] = total;
//				temp[9] = trandate;
				purchaseorderArray[index++] = temp;
				
				temp_tranid = tranid;
			}
		}
	if(!isEmpty(purchaseorderArray)){
		var lineCount = 1;
		for(var i = 0 ; i < purchaseorderArray.length ;i++){
			subList.setLineItemValue('purchaseorder_no', lineCount,purchaseorderArray[i][0]);
			subList.setLineItemValue('status', lineCount,purchaseorderArray[i][1]);
			subList.setLineItemValue('exchange_rate_p1', lineCount,purchaseorderArray[i][2]);
			subList.setLineItemValue('exchange_rate_p2', lineCount,purchaseorderArray[i][3]);
			subList.setLineItemValue('exchange_rate_p3', lineCount,purchaseorderArray[i][4]);
			subList.setLineItemValue('purchaseorder_id', lineCount,purchaseorderArray[i][5]);
//			subList.setLineItemValue('subtotal', lineCount,purchaseorderArray[i][6]);
//			subList.setLineItemValue('taxtotal', lineCount,purchaseorderArray[i][7]);
//			subList.setLineItemValue('total', lineCount,purchaseorderArray[i][8]);
//			subList.setLineItemValue('trandate', lineCount,purchaseorderArray[i][9]);
			lineCount++;

		}

	}

	}
	response.writePage(form);
}
function defaultEmpty(src){
	return src || '';
}
function unique1(arr){
	  var hash=[];
	  for (var i = 0; i < arr.length; i++) {
	     if(hash.indexOf(arr[i])==-1){
	      hash.push(arr[i]);
	     }
	  }
	  return hash;
}