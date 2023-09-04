/**
 * DJ_合計請求書一括印刷
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2021     gsy95
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){	
	
	createForm(request, response);
//	
//	if (request.getMethod() == 'POST') {
//		run(request, response);
//		
//	}else{
//		if (!isEmpty(request.getParameter('custparam_logform'))) {
//			logForm(request, response)
//		}else{
//			createForm(request, response);
//		}
//	}
	
}

function run(request, response,locationValue,subsidiaryValue){
	

	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	

	
	
	
	//scheduleparams['custscript_djkk_ss_inspection_list_info'] = str;
	runBatch('customscript_djkk_ss_invoice_change_list', 'customdeploy_djkk_ss_invoice_change_list',null);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

//バッチ状態画面
function logForm(request, response) {

	var form = nlapiCreateForm('処理ステータス', false);
	form.setScript('customscript_djkk_cs_invoice_change_list');
	// 実行情報
	form.addFieldGroup('custpage_run_info', '実行情報');
	form.addButton('custpage_refresh', '更新', 'refresh();');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_invoice_change_list');

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

	 var selectFlg = request.getParameter('selectFlg');
	 var invoicesummaryNoValue = request.getParameter('invoicesummaryNo');
	 var subsidiaryValue = request.getParameter('subsidiary');
	 var customerValue = request.getParameter('customer');
	 var invoicetrandateValue = request.getParameter('invoicetrandate');
	 
	 
	 
	
	var form = nlapiCreateForm('DJ_合計請求書一括印刷', false);
	form.setScript('customscript_djkk_cs_invoice_summary_print');
	

		
//	 //画面項目追加
//	 if(selectFlg == 'T'){
//		 form.addButton('btn_return', '検索戻す','searchReturn()')
//		 form.addSubmitButton('作成')
//	 }else{
//		form.addButton('btn_search', '検索', 'search()')
//	 }
	 
	 
	 form.addButton('btn_search', '検索', 'search()')
	 form.addSubmitButton('印刷')

	 form.addFieldGroup('select_group', '検索');
	 var subsidiaryField = form.addField('custpage_subsidiary', 'select', '子会社','subsidiary', 'select_group')
	 var invoicesummaryNoField = form.addField('custpage_invoice_summary_tranid', 'select', '合計請求書番号','tranid', 'select_group')
	 var invoicetrandateField = form.addField('custpage_lose_date', 'date', '締日',null, 'select_group')
	 var customerField = form.addField('custpage_customer', 'multiselect', '顧客','customer', 'select_group')
	
	 
	 
	 if(selectFlg == 'T'){
			subsidiaryField.setDisplayType('inline');		
			customerField.setDisplayType('inline');
			invoicesummaryNoField.setDisplayType('inline');
			invoicetrandateField.setDisplayType('inline');

			
			subsidiaryField.setDefaultValue(subsidiaryValue)
			customerField.setDefaultValue(customerValue)
			invoicesummaryNoField.setDefaultValue(invoicesummaryNoValue)
			invoicetrandateField.setDefaultValue(invoicetrandateValue)

			
					
			
		}else{
			
		}
			 
	 
	 
	 var subList = form.addSubList('list', 'list', '');
	 subList.addField('implementation_choice', 'checkbox', '選択');
	 subList.addField('invoice_subsidiary', 'text', '子会社 ');
	 subList.addField('invoicesummary_no', 'text', '合計請求書番号');
	 subList.addField('in_customer', 'text', '顧客');
	 subList.addField('delivery_hopedate', 'text', '締日');
	 subList.addField('invoice_summary_ringe', 'text', '表示');

	 
	//if(selectFlg == 'T')		
	 {
			
			var filit = new Array();
			filit.push( ["voided","is","F"]);
			filit.push("AND");
			filit.push(["type","anyof","Custom102"]);
			filit.push("AND");
			filit.push(["mainline","is","T"]);
			//filit.push("AND");

			
		var invoiceSearch = nlapiSearchRecord("transaction",null,
				filit, 
				[
                    new nlobjSearchColumn("subsidiary"), 
                    new nlobjSearchColumn("transactionname"), 
                    new nlobjSearchColumn("formuladate").setFormula("{custbody_suitel10n_jp_ids_cd}"),
                    new nlobjSearchColumn("formulatext").setFormula("{custbody_suitel10n_jp_ids_customer}")
				]
				);
		
		
		if(!isEmpty(invoiceSearch)){
			for(var i = 0 ; i < invoiceSearch.length ;i++){
				subList.setLineItemValue('invoicesummary_no', i+1, invoiceSearch[i].getValue("transactionname"));	
				subList.setLineItemValue('invoice_subsidiary', i+1, invoiceSearch[i].getText("subsidiary"));
				subList.setLineItemValue('in_customer', i+1, invoiceSearch[i].getValue("formulatext"));
				subList.setLineItemValue('delivery_hopedate', i+1, invoiceSearch[i].getValue("formuladate"));
			
			}
		}
		}
		

	 
	 
	 
	 response.writePage(form);
}
