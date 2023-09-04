/**
 * U333  顧客向けの書類再送信機能
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Apr 2023     zhou
 *
 */

function suitelet(request, response){	
	
	if (request.getMethod() == 'POST') {
				run(request, response);
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			csvOut(request, response)
		}else{
			createForm(request, response);
		}
	}
	
}



function run(request, response){
	nlapiLogExecution('debug', 'action station', '開始');
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	var strCsv = '';
//	var xmlString = '';
	var theCount = parseInt(request.getLineItemCount('list'));
	var express = request.getParameter('custpage_express');
	var expressType;
	if(express == '3887'){
		expressType = '佐川運輸株式会社';
	}else if(express == '4'){
		expressType = '西濃';
	}else if(express == '685'){
		expressType = '日本通運株式会社';
	}else if(express == '684'){
		expressType = 'ヤマト運輸株式会社';
	}
	var date = request.getParameter('custpage_date');//日付
	

	var fieldIdTextval = request.getParameter('custpage_fieldid');//
	var jobId = guid();//表管理、batch関連ID
//	var timeZoneTextval = request.getParameter('custpage_time_zone');//時間帯  20230213 changed by zhou  U046課題規定不要
	nlapiLogExecution('debug', 'action express', express);
	nlapiLogExecution('debug', 'action expressType', expressType);
	var dataBatchnumber;
	if(expressType== '日本通運株式会社'){
		var lineDataObj = {}//リスト行オブジェクト
		var dataserialnumberArr = [];//dataserialnumberArr
		var otherDataArr = [];//送り状作成機能リストその他の要素Array
		//
		for(var i = 0 ; i < theCount ; i++){
			if(request.getLineItemValue('list', 'chk', i+1)=='T'){
				var dataserialnumber = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_dataserialnumber', i+1));//送り状作成機能データテーブル管理番号	
				var substitution = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_total_amount', i+1));//主要代引金額
				var insurancePremium = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_insurance_premium', i+1));//主要保険料
				var deliveryTimeZone = defaultEmpty(request.getLineItemValue('list', 'custpage_ne_deliverytimezone', i+1));//配達指定時間  changed by zhou 20230310
				nlapiLogExecution('debug','2023insurancePremium',insurancePremium)
				nlapiLogExecution('debug','2023deliveryTimeZone',deliveryTimeZone)
				
				dataserialnumberArr.push(dataserialnumber);
				otherDataArr.push({
					dataserialnumber:dataserialnumber,//DJ_管理番号  配列オブジェクト予約要素
					substitution:substitution,//主要代引金額
					insurancePremium:insurancePremium,//主要保険料
					deliveryTimeZone:deliveryTimeZone,//配達指定時間  changed by zhou 20230310
				    data:'',//DJ_DATA  配列オブジェクト予約要素
				    internalid:''
				})
			}
		}
		scheduleparams['custscript_djkk_data'] = JSON.stringify(otherDataArr);
		scheduleparams['custscript_djkk_fieldid'] = JSON.stringify(fieldIdTextval);
		scheduleparams['custscript_djkk_freight_company'] = expressType;
		scheduleparams['custscript_djkk_jobid'] = jobId;

		var batchStatus = runBatch('customscript_djkk_ss_invoice_creation', 'customdeploy_djkk_ss_invoice_creation',scheduleparams);
		nlapiLogExecution('debug','batch',batchStatus)
	}else if(expressType == '佐川運輸株式会社'){}else{}
	
	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	parameter['express'] = express;
	parameter['jobId'] = jobId;
	parameter['fieldId'] = fieldIdTextval;
	
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}
function csvOut(request, response) {
	var form = nlapiCreateForm('DJ_顧客向けの書類再送信画面', false);
	
	form.setScript('customscript_djkk_cs_cust_sendmail_again');
	
	
	
	
	var jobId = request.getParameter('jobId');
	 var expressCode=  form.addField('custpage_express_code', 'text', 'express').setDisplayType('hidden');
	 expressCode.setDefaultValue(express);
	 
	 
	 
	 
	form.addFieldGroup('custpage_run_info', '運転状態');
	var runstatusField = form.addField('custpage_run_info_status', 'text',
			'', null, 'custpage_run_info');
	runstatusField.setDisplayType('inline');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_invoice_creation');

	if (batchStatus == 'FAILED') {
		// 実行失敗の場合
		var messageColour = '<font color="red"> バッチ処理を失敗しました </font>';
		runstatusField.setDefaultValue(messageColour);
		form.addButton('btn_approved', '戻る','go_back()');
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// 実行中の場合
		runstatusField.setDefaultValue('バッチ処理を実行中');
		form.addButton('custpage_refresh', '更新', 'refresh();');
		response.writePage(form);
	}else{
		runstatusField.setDefaultValue('処理を完了');
		
		var jobSearch = getSearchResults("customrecord_djkk_csv_outut_record",null,
				[
				   ["custrecord_djkk_csv_key","is",jobId]
				], 
				[ 
				   new nlobjSearchColumn("custrecord_djkk_csv_key"), 
				   new nlobjSearchColumn("custrecord_output_csv_fileid"), 
				]
				);
		nlapiLogExecution('DEBUG', 'show me the jobId', jobId);
		if(!isEmpty(jobSearch)){
			 var csv_fileid = parseInt(jobSearch[0].getValue("custrecord_output_csv_fileid"));
			 nlapiLogExecution('DEBUG', 'show me the jobSearch', csv_fileid);
			 var csv_fileid_id = nlapiLoadFile(csv_fileid);
			 var csv_fileid_url= csv_fileid_id.getURL();
			 var csvDownUrl = "window.open('" + csv_fileid_url + "', '_blank');"; 
			 form.addButton('btn_approved', 'CSVのダウンロード',csvDownUrl);
			 form.addButton('btn_approved', '戻る','go_back()');
		}
		
	}

	 response.writePage(form);
}
function createForm(request, response){
	var clubValue=request.getParameter('sub');//会社
	var customerPo=request.getParameter('customerPo');//顧客注文番号
	var section=request.getParameter('section');//セクション
	var customer=request.getParameter('customercode');//顧客（請求先）コード
	var type=request.getParameter('type');//書類タイプ
//	var customername=request.getParameter('customername');//顧客（請求先）名前
	var issuedateForm=request.getParameter('issuedateForm');//作成日
	var delivery=request.getParameter('delivery');//納品先id
	var issuedateTo=request.getParameter('issuedateTo');//作成日
//	var deliveryName=request.getParameter('deliveryName');//納品先名前
	var documentNo=request.getParameter('documentNo');//書類番号書類番号
	var trannumber=request.getParameter('trannumber');//受注番号
	var numberArr = [];
	if(!isEmpty(trannumber)){
		var str = trannumber.split(',');
		for(var c=0;c<str.length;c++){
			numberArr.push(str[c]);
		}
	}
	var shipbydateForm=request.getParameter('shipbydateForm');//出荷日From
	var shipbydateTo=request.getParameter('shipbydateTo');//出荷日To
	var deliverydateForm=request.getParameter('deliverydateForm');//納品日From
	var deliverydateTo=request.getParameter('deliverydateTo');//納品日To
	
	var selectFlg=request.getParameter('selectFlg');//selectFlg
	
	
	
	
	
	
	var filit = new Array();
	//受注番号
	if(!isEmpty(trannumber)){
	    filit.push(["internalid","is",numberArr]);
		filit.push("AND");
	}
	 //出荷日From
	if(!isEmpty(shipbydateForm)){
		filit.push(["shipdate","onorafter",shipbydateForm]);
		filit.push("AND");
	}
	//出荷日To
	if(!isEmpty(shipbydateTo)){
		filit.push(["shipdate","onorbefore",shipbydateTo]);
		filit.push("AND");
	}
	//会社
	if(!isEmpty(clubValue)){
		filit.push(["subsidiary","anyof",clubValue]);
		filit.push("AND");
	}
	//作成日From
	if(!isEmpty(issuedateForm)){
		filit.push(["trandate","onorafter",issuedateForm]);
		filit.push("AND");
	}
	//納品先
	if(!isEmpty(delivery)){
		filit.push(["custbody_djkk_delivery_destination","onorafter",delivery]);
		filit.push("AND");
	}
	//作成日To
	if(!isEmpty(issuedateTo)){
		filit.push(["trandate","onorbefore",issuedateTo]);
		filit.push("AND");;
	}
	//納品日From
	if(!isEmpty(deliverydateForm)){
		filit.push(["custbody_djkk_delivery_date","onorafter",deliverydateForm]);
		filit.push("AND");
	}
	//納品日To
	if(!isEmpty(deliverydateTo)){
		filit.push(["custbody_djkk_delivery_date","onorbefore",deliverydateTo]);
		filit.push("AND");
	}
	//セクション
	if(!isEmpty(section)){
		filit.push(["department","anyof",section]);
		filit.push("AND");
	}
	//type 書類タイプ
	if(type = 'Invoice'){
		filit.push(["type","anyof","CustCred","CustInvc"]);
		filit.push("AND");
	}
		filit.push(["itemtype","is","InvtPart"]);
		filit.push("AND");
		filit.push(["custcol_djkk_invoice_creation_over","is","F"]);
		
	var position = request.getParameter('position');
	var form = nlapiCreateForm('DJ_顧客向けの書類再送信画面', false);
	form.setScript('customscript_djkk_cs_cust_sendmail_again');
		
 	 //画面項目追加
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '戻る','searchReturn()')		 
		 form.addSubmitButton('CSV出力');
		 form.addFieldGroup('select_group_after', '検索');

		 var clubField = form.addField('custpage_club', 'text', '会社/subsidiary',null, 'select_group_after');//会社
		 clubField.setDefaultValue(clubValue);
		 var customerPoField = form.addField('custpage_customerpo', 'text', '顧客注文番号/Customer PO No',null, 'select_group_after');
		 customerPoField.setDefaultValue(customerPo);
		 //select line2
		 var sectionField = form.addField('custpage_section', 'text', 'セクション',null, 'select_group_after');//セクション
		 sectionField.setDefaultValue(section);
		 var customerCodeField = form.addField('custpage_customer', 'text', '顧客（請求先）コード/Customer Code',null, 'select_group_after');
		 customerCodeField.setDefaultValue(customer);
		 //select line3
		 var typeField = form.addField('custpage_type', 'text', '書類タイプ/Document Type',null, 'select_group_after');
		 typeField.setDefaultValue(type);
//		 var customerNameField = form.addField('custpage_customername', 'select', '顧客（請求先）名前/Customer Name',null, 'select_group_after');
//		 customerNameField.setDefaultValue('testData');
		 //select line4
		 var issueDateFormField = form.addField('custpage_issuedate_form', 'date', '作成日/Issue Date Form',null, 'select_group_after');
		 issueDateFormField.setDefaultValue(issuedateForm);
		 var deliveryCodeField = form.addField('custpage_delivery', 'text', '納品先コード/ShipTo Code',null, 'select_group_after');
		 deliveryCodeField.setDefaultValue(delivery);
		 //select line5
		 var issueDateToField = form.addField('custpage_issuedate_to', 'date', '作成日/Issue Date to',null, 'select_group_after');
		 issueDateToField.setDefaultValue(issuedateTo);
//		 var deliveryNameField = form.addField('custpage_deliveryname', 'select', '納品先名前/ShipTo Name',null, 'select_group_after');
//		 deliveryNameField.setDefaultValue('testData');
		 //select line6
		 var documentNoField = form.addField('custpage_documentno', 'text', '書類番号書類番号/Document No',null, 'select_group_after');
		 documentNoField.setDefaultValue(documentNo);
		 var trannumberField = form.addField('custpage_trannumber', 'longtext', '受注番号/SO',null, 'select_group_after'); 
		 trannumberField.setDefaultValue(trannumber);
		 
		 //select line7
		 var shipByDateFormField = form.addField('custpage_shipbydate_form', 'date', '出荷日From',null, 'select_group_after');
		 shipByDateFormField.setDefaultValue(trannumber);
		 //select line8
		 var shipByDateToField = form.addField('custpage_shipbydate_to', 'date', '出荷日To',null, 'select_group_after');
		 shipByDateToField.setDefaultValue(shipbydateTo);
		 //select line9
		 var deliveryDateFormField = form.addField('custpage_deliverydate_form', 'date', '納品日From',null, 'select_group_after');
		 deliveryDateFormField.setDefaultValue(deliverydateForm);
		 //select line10
		 var deliveryDateToField = form.addField('custpage_deliverydate_to', 'date', '納品日To',null, 'select_group_after');
		 deliveryDateToField.setDefaultValue(deliverydateTo);
		 
	 }else{
		 nlapiLogExecution('debug','form', 'in')
		 form.addButton('btn_search', '検索', 'search()')
		 form.addButton('btn_clear', 'クリア', 'clearf()')
		 form.addFieldGroup('select_line1', '検索')
		 form.addFieldGroup('select_line2', '検索').setShowBorder(false);
		 form.addFieldGroup('select_line3', '検索').setShowBorder(false);
		 form.addFieldGroup('select_line4', '検索').setShowBorder(false);
		 form.addFieldGroup('select_line5', '検索').setShowBorder(false);
		 form.addFieldGroup('select_line6', '検索').setShowBorder(false);
		 form.addFieldGroup('select_line7', '検索').setShowBorder(false);
		 form.addFieldGroup('select_line8', '検索').setShowBorder(false);
		 form.addFieldGroup('select_line9', '検索').setShowBorder(false);
		 form.addFieldGroup('select_line10', '検索').setShowBorder(false);
		 //select line1
		 var clubField = form.addField('custpage_club', 'select', '会社/subsidiary',null, 'select_line1');//会社
		 clubField.setMandatory(true);
		 var customerPoField = form.addField('custpage_customerpo', 'select', '顧客注文番号/Customer PO No',null, 'select_line1');
		 //select line2
		 var sectionField = form.addField('custpage_section', 'select', 'セクション',null, 'select_line2');//セクション
		 var customerCodeField = form.addField('custpage_customer', 'select', '顧客（請求先）コード/Customer Code',null, 'select_line2');
		 //select line3
		 var typeField = form.addField('custpage_type', 'select', '書類タイプ/Document Type',null, 'select_line3');
//		 var customerNameField = form.addField('custpage_customername', 'select', '顧客（請求先）名前/Customer Name',null, 'select_line3');
		 //select line4
		 var issueDateFormField = form.addField('custpage_issuedate_form', 'date', '作成日/Issue Date Form',null, 'select_line4');
		 var deliveryCodeField = form.addField('custpage_delivery', 'select', '納品先コード/ShipTo Code',null, 'select_line4');
		 //select line5
		 var issueDateToField = form.addField('custpage_issuedate_to', 'date', '作成日/Issue Date to',null, 'select_line5');
//		 var deliveryNameField = form.addField('custpage_deliveryname', 'select', '納品先名前/ShipTo Name',null, 'select_line5');
		 //select line6
		 var documentNoField = form.addField('custpage_documentno', 'select', '書類番号書類番号/Document No',null, 'select_line6');
		 var trannumberField = form.addField('custpage_trannumber', 'multiselect', '受注番号/SO',null, 'select_line6'); 
		 //select line7
		 var shipByDateFormField = form.addField('custpage_shipbydate_form', 'date', '出荷日From',null, 'select_line7');
		 //select line8
		 var shipByDateToField = form.addField('custpage_shipbydate_to', 'date', '出荷日To',null, 'select_line8');
		 //select line9
		 var deliveryDateFormField = form.addField('custpage_deliverydate_form', 'date', '納品日From',null, 'select_line9');
		 //select line10
		 var deliveryDateToField = form.addField('custpage_deliverydate_to', 'date', '納品日To',null, 'select_line10');
		 
		 
		 var selectSub=getRoleSubsidiariesAndAddSelectOption(clubField);
		 if(isEmpty(clubValue)){
			 clubValue = selectSub;
		 }
		 
		 if(!isEmpty(clubValue)){
			 //納品先
			 var deliveryList = getSearchResults("customrecord_djkk_delivery_destination",null,
						[
						   ["custrecord_djkk_delivery_subsidiary","anyof",clubValue] //itemid
						], 
						[
						   new nlobjSearchColumn("custrecord_djkk_delivery_code"), //code
						   new nlobjSearchColumn("custrecorddjkk_name"), //name
						   new nlobjSearchColumn("internalid")
						]
						);
			 deliveryCodeField.addSelectOption('', '');
			 if(!isEmpty(deliveryList)){
				 for(var des=0;des<deliveryList.length;des++){
					 deliveryCodeField.addSelectOption(deliveryList[des].getValue("internalid"),deliveryList[des].getValue("custrecord_djkk_delivery_code")+' '+deliveryList[des].getValue("custrecorddjkk_name"));
				 }
			 }
			 var customerSearch = getSearchResults("customer",null,
						[
						   ["subsidiary","anyof",clubValue] //itemid
						], 
						[	
						 	new nlobjSearchColumn("entityid"),//顧客code
						 	new nlobjSearchColumn("companyname"),//名前
						 	new nlobjSearchColumn("internalid")
						]
						);
			 customerCodeField.addSelectOption('', '');
			 if(!isEmpty(customerSearch)){
				 for(var cus=0;cus<customerSearch.length;cus++){
					 customerCodeField.addSelectOption(customerSearch[cus].getValue("internalid"),customerSearch[cus].getValue("entityid")+' '+customerSearch[cus].getValue("companyname"));
				 }
			 }
			 
			 //セクション
			 var departmentSearch = getSearchResults("department",null,
					 [
					  	["subsidiary","anyof",clubValue] //itemid
					 ], 
					 [
					    new nlobjSearchColumn("name").setSort(false), 
					    new nlobjSearchColumn("internalid")
					 ]
					 );
			 sectionField.addSelectOption('', '');
			 if(!isEmpty(departmentSearch)){
				 for(var a=0;a<departmentSearch.length;a++){
					 sectionField.addSelectOption(departmentSearch[a].getValue("internalid"),departmentSearch[a].getValue("name"));
				 }
			 }
			 
		 }
		 
		//書類タイプ
		 typeField.addSelectOption('SOA', '納期回答');
		 typeField.addSelectOption('DO', '納品書');
		 typeField.addSelectOption('Invoice', '請求書');
		 typeField.addSelectOption('ConsolidatedInvoice', '合計請求書');
		 
		 
		 var salesorderSearch = getSearchResults("salesorder",null,
				 [
				   ["itemtype","is","InvtPart"],
				   "AND",
				   ["subsidiary","is",clubValue],//add by zhou 20230213
				   "AND",
				   ["status","anyof","SalesOrd:B","SalesOrd:E","SalesOrd:D"]//add by zhou 20230213
				   
				 ], 
				 [
				    new nlobjSearchColumn("internalid"),
				    new nlobjSearchColumn("tranid")//
				 ]
				 );
		 		trannumberField.addSelectOption('', '');
				var tranidArr = [];
				var internalidArr = [];
				for(var i = 0; i<salesorderSearch.length;i++){

				var tranid = salesorderSearch[i].getValue("tranid");
				var internalid = salesorderSearch[i].getValue("internalid");
				tranidArr.push(tranid);
				internalidArr.push(internalid);
				}

				var newTranidArr = unique1(tranidArr);
				var newInternalidArr = unique1(internalidArr);
				for(var i = 0; i<newTranidArr.length;i++){
					trannumberField.addSelectOption(newInternalidArr[i],newTranidArr[i])
				}
		 
				
				
				 clubField.setDefaultValue(clubValue)//会社
				 customerPoField.setDefaultValue(customerPo)//顧客注文番号
				 sectionField.setDefaultValue(section)//セクション
				 customerCodeField.setDefaultValue(customer)//顧客（請求先）コード
				 typeField.setDefaultValue(type)//書類タイプ
				 issueDateFormField.setDefaultValue(issuedateForm)//作成日
				 deliveryCodeField.setDefaultValue(delivery)//納品先コード
				 issueDateToField.setDefaultValue(issuedateTo)//作成日
				 documentNoField.setDefaultValue(documentNo)//書類番号書類番号
				 trannumberField.setDefaultValue(numberArr)//受注番号
				 shipByDateFormField.setDefaultValue(shipbydateForm)//出荷日From
				 shipByDateToField.setDefaultValue(shipbydateTo)//出荷日To
				 deliveryDateFormField.setDefaultValue(deliverydateForm)//納品日From
				 deliveryDateToField.setDefaultValue(deliverydateTo)// 納品日To
	 }

	 // 明細表示
	 if(selectFlg == 'T'){
		 nlapiLogExecution('debug','明細表示', 'in')
	 	var subList = form.addSubList('list', 'list', '');
		subList.addMarkAllButtons();
		subList.addField('chk', 'checkbox', '選択')
		subList.addField('custpage_section', 'text', 'Activity/セクション');
		subList.addField('custpage_trannumber', 'text', 'SO#/受注番号');
		subList.addField('custpage_customercode', 'text', 'Customer Code/顧客（請求先）コード');
		subList.addField('custpage_customerpo', 'text', 'Customer PO No/顧客注文番号');
		subList.addField('custpage_customername', 'text', 'Customer Name/顧客（請求先）名前');
		subList.addField('custpage_deliverycode', 'text', 'ShipTo Code/納品先コード');
		subList.addField('custpage_deliveryname', 'text', 'ShipTo Name/納品先名前');
		subList.addField('custpage_invoiceno', 'text', 'Invoice#/請求書番号');
		subList.addField('custpage_shipbydate', 'text', 'ShipBy Date/出荷日');
		subList.addField('custpage_deliverydate', 'text', 'NeedBy Date/納品日');
		subList.addField('custpage_entryperson', 'text', 'Entry Person/入力者');
		subList.addField('custpage_type', 'checkbox', 'Document Type/書類タイプ');
		subList.addField('custpage_documentno', 'text', 'Document No/書類番号');
		/****TODO***/
		subList.addField('custpage_issuedate', 'text', 'Issue Date/作成日（範囲）');//???
		subList.addField('custpage_lastaction', 'text', 'Last Action/最後の実施日');
		subList.addField('custpage_actiontype', 'text', 'Action Type/送信区分');
		subList.addField('custpage_email', 'text', 'Email');
		subList.addField('custpage_fax', 'text', 'Fax');
		subList.addField('custpage_overflag', 'checkbox', 'Completed（Flag）/完了').setDisplayType('disabled'); //倉庫;
		subList.addField('custpage_error', 'text', 'Errors/エラー');
		if(type == 'SOA'){
			//納期回答
			var searchresults = getSearchResults("salesorder",null,
					 [
					 	   filit
					 ], 
					 [
						   new nlobjSearchColumn("internalid"), //内部ID
						   new nlobjSearchColumn("department"), //Activity/セクション
						   new nlobjSearchColumn("tranid"), //SO#/受注番号
						   new nlobjSearchColumn("custcol_djkk_customer_order_number"), //Customer PO No/顧客注文番号
						   new nlobjSearchColumn("entityid","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Code/顧客（請求先）コード
						   new nlobjSearchColumn("altname","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Name/顧客（請求先）名前	
						   new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Code/納品先コード
						   new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Name/納品先名前	
						   new nlobjSearchColumn("invoicenum"), //Invoice#/請求書番号
						   new nlobjSearchColumn("shipdate"), //ShipBy Date/出荷日
						   new nlobjSearchColumn("custbody_djkk_delivery_date"), //NeedBy Date/納品日
						   new nlobjSearchColumn("custbody_djkk_input_person"), //Entry Person/入力者	
						   //Document Type/書類タイプ
						   //Document No/書類番号
						   new nlobjSearchColumn("trandate"), //Issue Date/作成日（範囲）
						   //Last Action/最後の実施日	
						   new nlobjSearchColumn("custbody_djkk_shippinginfosendtyp")//Action Type/送信区分（FAX/Email）	
						   //Emailにて送信の場合、送信先のe-mailアドレス
						   //Faxにて送信の場合、送信先のFax番号
						   //Completed（Flag）/再送信完了（フラグ
						   //送信されていない場合は表示
					 ]
					 );
			if(searchresults !=null){
				for(var i = 0 ; i < searchresults.length; i++){
			 		
			 	}
			}
					 	
		}else if(type == 'DO'){
			//納品書
			var searchresults = getSearchResults("salesorder",null,
					 [
					 	   filit
					 ], 
					 [
						   new nlobjSearchColumn("internalid"), //内部ID
						   new nlobjSearchColumn("department"), //Activity/セクション
						   new nlobjSearchColumn("tranid"), //SO#/受注番号
						   new nlobjSearchColumn("custcol_djkk_customer_order_number"), //Customer PO No/顧客注文番号
						   new nlobjSearchColumn("entityid","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Code/顧客（請求先）コード
						   new nlobjSearchColumn("altname","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Name/顧客（請求先）名前	
						   new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Code/納品先コード
						   new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Name/納品先名前	
						   new nlobjSearchColumn("invoicenum"), //Invoice#/請求書番号
						   new nlobjSearchColumn("shipdate"), //ShipBy Date/出荷日
						   new nlobjSearchColumn("custbody_djkk_delivery_date"), //NeedBy Date/納品日
						   new nlobjSearchColumn("custbody_djkk_input_person"), //Entry Person/入力者	
						   //Document Type/書類タイプ
						   //Document No/書類番号
						   new nlobjSearchColumn("trandate"), //Issue Date/作成日（範囲）
						   //Last Action/最後の実施日	
						   new nlobjSearchColumn("custbody_djkk_delivery_book_period")//Action Type/送信区分（FAX/Email）	
						   //Emailにて送信の場合、送信先のe-mailアドレス
						   //Faxにて送信の場合、送信先のFax番号
						   //Completed（Flag）/再送信完了（フラグ
						   //送信されていない場合は表示
					 ]
					 );
			if(searchresults !=null){
				for(var i = 0 ; i < searchresults.length; i++){
			 		
			 	}
			}
		}else if(type == 'Invoice') {
			//請求書
			var searchresults = getSearchResults("transaction",null,
//					   ["type","anyof","CustCred","CustInvc"],
					 [
					 	   filit
					 ], 
					 [
						   new nlobjSearchColumn("internalid"), //内部ID
						   new nlobjSearchColumn("department"), //Activity/セクション
						   new nlobjSearchColumn("tranid"), //SO#/受注番号
						   new nlobjSearchColumn("custcol_djkk_customer_order_number"), //Customer PO No/顧客注文番号
						   new nlobjSearchColumn("entityid","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Code/顧客（請求先）コード
						   new nlobjSearchColumn("altname","CUSTBODY_SUITEL10N_JP_IDS_CUSTOMER",null), //Customer Name/顧客（請求先）名前	
						   new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Code/納品先コード
						   new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null), //ShipTo Name/納品先名前	
						   new nlobjSearchColumn("invoicenum"), //Invoice#/請求書番号
						   new nlobjSearchColumn("shipdate"), //ShipBy Date/出荷日
						   new nlobjSearchColumn("custbody_djkk_delivery_date"), //NeedBy Date/納品日
						   new nlobjSearchColumn("custbody_djkk_input_person"), //Entry Person/入力者	
						   //Document Type/書類タイプ
						   //Document No/書類番号
						   new nlobjSearchColumn("trandate"), //Issue Date/作成日（範囲）
						   //Last Action/最後の実施日	
						   new nlobjSearchColumn("custbody_djkk_invoice_book_period")//Action Type/送信区分（FAX/Email）	
						   //Emailにて送信の場合、送信先のe-mailアドレス
						   //Faxにて送信の場合、送信先のFax番号
						   //Completed（Flag）/再送信完了（フラグ
						   //送信されていない場合は表示
					 ]
					 );
			if(searchresults !=null){
				for(var i = 0 ; i < searchresults.length; i++){
			 		
			 	}
			}
		}else if(type == 'ConsolidatedInvoice') {
			//合計請求書
			
		}
	 }
	 
	 
	
	 
	response.writePage(form);
}
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function defaultEmpty(src){
	return src || '';
}
function defaultEmptyToZero(src){
	return src || 0;
}
function formatDate(dt){    //現在日期
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
}
function formatDateTime(dt){    //現在日期
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2) + ' ' + PrefixZero(dt.getHours(), 2) + ":" + PrefixZero(dt.getMinutes(), 2)) : '';
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