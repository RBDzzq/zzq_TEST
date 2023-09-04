/**
 * DJ_WOｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票発行
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/13     
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var DELIVERY_SLIP_ISS = "";
function suitelet(request, response) {
	if (request.getMethod() == 'POST') {
		var sendEmail_ = request.getParameter('send_email');
		if(!isEmpty(sendEmail_)){
			sendEmail(request, response);
		} else {
			run(request, response);
		}
		
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response)
		}else{
			createForm(request, response);
		}
	}

}
function sendEmail(request, response){
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	var jobId = request.getParameter('job_id');
	var jobParam ={
		type:'sendEmail',
		jobId:jobId
	}
	scheduleparams['custscript_djkk_delivery_slip_iss2'] = JSON.stringify(jobParam);
	runBatch('customscript_djkk_ss_delivery_slip_iss', 'customdeploy_djkk_ss_delivery_slip_iss',scheduleparams);
	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	parameter['custparam_logform_sendemail'] = '1';
	parameter['jobId'] = jobParam.jobId;
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

function run(request, response,locationValue,subsidiaryValue){
			
	var scheduleparams = new Array();
	var valueTotal = [];	
    var theCount = parseInt(request.getLineItemCount('list'));
    for (var m = 0 ; m < theCount ; m++) {
    	if(request.getLineItemValue('list', 'check', m+1)=='T'){
    		var so_id = request.getLineItemValue('list', 'so_id', m+1);	
    		var so_location = request.getLineItemValue('list', 'location_id', m+1);	
    		
    		valueTotal.push({
    			so_id:so_id,
    			so_location:so_location
    		});
    	}
    }
		
	var jobParam ={
			type:'savePDF',
			jobId:guid()
		}
	str = request.getParameter('custpage_file')+','+nlapiGetUser()+','+request.getParameter('custpage_location');
	scheduleparams['custscript_djkk_delivery_slip_iss2'] = JSON.stringify(jobParam);
	scheduleparams['custscript_djkk_delivery_slip_iss3'] = str;	
	
	var locationValue = request.getParameter('custpage_location');
	var subsidiaryValue = request.getParameter('custpage_subsidiary');
	nlapiLogExecution('debug','id', locationValue);
	var subsidiaryRecord = nlapiLoadRecord('subsidiary', subsidiaryValue);
	var subsidiaryName = defaultEmpty(subsidiaryRecord.getFieldValue('name'));
	if(!isEmpty(locationValue)){
		var locationRecord = nlapiLoadRecord('location', locationValue);
		var locationName = defaultEmpty(locationRecord.getFieldValue('name'));
	}
	
	var pdfData = {
			valueTotal:valueTotal,
			locationName: locationName,
			subsidiaryName: subsidiaryName
	}

	scheduleparams['custscript_djkk_delivery_slip_iss4'] = JSON.stringify(pdfData);
	
	runBatch('customscript_djkk_ss_delivery_slip_iss', 'customdeploy_djkk_ss_delivery_slip_iss',scheduleparams);


	var parameter = new Array();
	var ctx = nlapiGetContext();
	parameter['custparam_logform'] = '1';
	parameter['jobId'] = jobParam.jobId;
	parameter['location'] = locationValue;
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

//バッチ状態画面
function logForm(request, response) {
	var form = nlapiCreateForm('処理ステータス', false);
	form.setScript('customscript_djkk_cs_delivery_slip_iss');
	var jobId = request.getParameter('jobId');
	var locationId = request.getParameter('location');
	// 実行情報
	form.addFieldGroup('custpage_run_info', '実行情報');
	form.addButton('custpage_refresh', '更新', 'refresh();');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_delivery_slip_iss');

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
		//changed by geng add start U840
		var locationSearchId = [];
		var dpkkSearch = [];
		var locationSearchArr = nlapiSearchRecord("location",null,
				[
				   ["name","contains","Keihin"]
				], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("name").setSort(false)
				]
				);
		for(var c = 0;c<locationSearchArr.length;c++){
			locationSearchId.push(locationSearchArr[c].getValue("internalid"));
		}
		var DPKKSearchArr = nlapiSearchRecord("location",null,
				[
				   ["name","contains","DPKK"]
				], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("name").setSort(false)
				]
				);
		for(var c = 0;c<DPKKSearchArr.length;c++){
			dpkkSearch.push(DPKKSearchArr[c].getValue("internalid"));
		}
		var locaId = request.getParameter('location');
		//changed by geng add end U840
		var sendEmailLog = request.getParameter('custparam_logform_sendemail');
		if(sendEmailLog){
			createForm(request, response);
		}else{
			var runstatusField = form.addField('custpage_run_info_status', 'text',
					'', null, 'custpage_run_info');
			runstatusField.setDisplayType('inline');
			runstatusField.setDefaultValue('バッチ処理を完了');
			
			var jobSearch = nlapiSearchRecord("customrecord_djkk_delivery_slip_iss",null,
					[
					   ["custrecord_soid","is",jobId]
					], 
					[ 
					   new nlobjSearchColumn("custrecord_soid"), 
					   new nlobjSearchColumn("custrecord_so_detail"), 
					   new nlobjSearchColumn("custrecord_so_pdf"), 
					   new nlobjSearchColumn("custrecord_so_csv"),
					   new nlobjSearchColumn("custrecord_so_pdf_two"),
					   new nlobjSearchColumn("custrecord_so_pdf_three"),
					   new nlobjSearchColumn("custrecord_so_pdf_four"),
					]
					);
			 if(locationSearchId.indexOf(locaId)>-1){
				 //changed by geng add start U840
				 var csv_fileid = parseInt(jobSearch[0].getValue("custrecord_so_csv"));
				 var csv_fileid_id = nlapiLoadFile(csv_fileid);
				 var csv_fileid_url= csv_fileid_id.getURL();
				 var csvDownUrl = "window.open('" + csv_fileid_url + "', '_blank');"; 
				 form.addButton('btn_createCsv', 'CSVダウンロード',csvDownUrl);
				 
			 }else if(dpkkSearch.indexOf(locaId)>-1){
				 var pdftwo_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf_two"));
				 var pdftwo_fileid_id = nlapiLoadFile(pdftwo_fileid);
				 var pdftwo_fileid_url= pdftwo_fileid_id.getURL();
				 var pdfDownUrlTwo = "window.open('" + pdftwo_fileid_url + "', '_blank');";
				 form.addButton('btn_createPdfOutgoing', 'DJ_出荷指図書PDFプレビュー',pdfDownUrlTwo);
				 
//				 var pdf_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf"));
//				 var pdf_fileid_id = nlapiLoadFile(pdf_fileid);
//				 var pdf_fileid_url= pdf_fileid_id.getURL();
//				 var pdfDownUrl = "window.open('" + pdf_fileid_url +"', '_blank');"; 
//				 form.addButton('btn_createPdfList', 'DJ_ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄPDFプレビュー',pdfDownUrl);

				 
			 }else if (dpkkSearch.indexOf(locaId)<0 && locationSearchId.indexOf(locaId)<0){
				 var pdfthree_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf_three"));
				 var pdfthree_fileid_id = nlapiLoadFile(pdfthree_fileid);
				 var pdfthree_fileid_url= pdfthree_fileid_id.getURL();
				 var pdfDownUrlThree = "window.open('" + pdfthree_fileid_url + "', '_blank');";
				 form.addButton('btn_createPdfDelivery', 'DJ_配送依頼書PDFプレビュー',pdfDownUrlThree);
			 }
		 
			 var deliveryPdf_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf_four"));
			 var deliveryPdf_fileid_id = nlapiLoadFile(deliveryPdf_fileid);
			 var deliveryPdf_fileid_url= deliveryPdf_fileid_id.getURL();
			 var deliveryPdf = "window.open('" + deliveryPdf_fileid_url + "', '_blank');";
			 form.addButton('btn_createPdfNaping', 'DJ_納品書PDFプレビュー',deliveryPdf);
			 
			 
			 var pdf_fileid = parseInt(jobSearch[0].getValue("custrecord_so_pdf"));
			 var pdf_fileid_id = nlapiLoadFile(pdf_fileid);
			 var pdf_fileid_url= pdf_fileid_id.getURL();
			 var pdfDownUrl = "window.open('" + pdf_fileid_url +"', '_blank');"; 
			 form.addButton('btn_createPdfList', 'DJ_ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄPDFプレビュー',pdfDownUrl);
			 
	 		 
			 form.addSubmitButton('送信');
			 var sendEmailField = form.addField('send_email', 'text',
						'', null, 'custpage_run_info');
			 sendEmailField.setDisplayType('hidden');
			 sendEmailField.setDefaultValue('Y');
			 var jobIdField = form.addField('job_id', 'text',
						'', null, 'custpage_run_info');
			 jobIdField.setDisplayType('hidden');
			 jobIdField.setDefaultValue(jobId);
			 response.writePage(form);
			 
		}		
	}
	
}



function createForm(request, response){
	
	//パラメータ取得
	 var selectFlg = request.getParameter('selectFlg');
	 var deliveryDateValue = request.getParameter('deliveryDate');
	 var shipDateValue = request.getParameter('shipDate');
	 var soNoValue = request.getParameter('soNo');
	 var subsidiaryValue = request.getParameter('subsidiary');
	 var locationValue = request.getParameter('location');
	
	var form = nlapiCreateForm('DJ_ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ＆配送伝票発行', false);
	form.setScript('customscript_djkk_cs_delivery_slip_iss');
		
	 //画面項目追加
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '検索戻す','searchReturn()')
		 form.addSubmitButton('実行')
	 }else{
		form.addButton('btn_search', '検索', 'search()')
	 }
	form.addFieldGroup('select_group', '検索');

	// 3.11
	var subsidiaryField = form.addField('custpage_subsidiary', 'select', '会社',null,'select_group');
	var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	 
	 if(isEmpty(subsidiaryValue)){
		 subsidiaryValue=selectSub;
		}else{
			subsidiaryField.setDefaultValue(subsidiaryValue);
		}

	var locationField = form.addField('custpage_location', 'select', '場所',null, 'select_group');
	locationField.setMandatory(true);
	
	//選択倉庫を設定する
	 //U664 ロールがDJ_DPKK倉庫ロール（1028）場合、選択できる場所はS30とS30の子倉庫
	var filedLocationList;
	if(nlapiGetRole() == '1028' && subsidiaryValue == SUB_SCETI){
		 filedLocationList = getSearchResults("location",null,
					[
					 "name","contains","S30"
					], 
					[
					   new nlobjSearchColumn("internalid"), 
					   new nlobjSearchColumn("name").setSort(false)
					]
					);
	 }else{
		 filedLocationList = getSearchResults("location",null,
					[
					 "subsidiary","anyof",subsidiaryValue
					], 
					[
					   new nlobjSearchColumn("internalid"), 
					   new nlobjSearchColumn("name").setSort(false)
					]
					);
	 }
	locationField.addSelectOption('', '');
	for(var i = 0; i<filedLocationList.length;i++){
		locationField.addSelectOption(filedLocationList[i].getValue("internalid"),filedLocationList[i].getValue("name"));
	}

	//注文書
	var soNoField = form.addField('custpage_so_no', 'select', '注文書番号',null, 'select_group');
	var searchSO = getSearchResults('salesorder',null,
			[
			 "subsidiary","anyof",subsidiaryValue
			], 
			[
			   new nlobjSearchColumn("internalid","","GROUP"), 
			   new nlobjSearchColumn("tranid","","MAX")
			]
			);
	
	soNoField.addSelectOption('', '');
	for(var i = 0; i<searchSO.length;i++){
		soNoField.addSelectOption(searchSO[i].getValue("internalid","","GROUP"),"注文書＃"+searchSO[i].getValue("tranid","","MAX"));
	}
	
	var deliveryDateField = form.addField('custpage_delivery_date', 'date', 'DJ_納品日',null, 'select_group');
	var shipDatField = form.addField('custpage_ship_date', 'date', '出荷日',null, 'select_group');
	var fileIdField = form.addField('custpage_file', 'text', 'PDFファイルID','', 'select_group').setDisplayType('hidden');
	
	if(selectFlg == 'T'){
		soNoField.setDisplayType('inline');		
		deliveryDateField.setDisplayType('inline');
		shipDatField.setDisplayType('inline');
		subsidiaryField.setDisplayType('inline');
		locationField.setDisplayType('inline');
			
	}else{
		
	}
	soNoField.setDefaultValue(soNoValue)
	deliveryDateField.setDefaultValue(deliveryDateValue);
	shipDatField.setDefaultValue(shipDateValue);
	subsidiaryField.setDefaultValue(subsidiaryValue);
	locationField.setDefaultValue(locationValue);
	
	
	var subList = form.addSubList('list', 'list', '注文書');
	subList.addMarkAllButtons();
	subList.addField('check', 'checkbox', '選択');
	subList.addField('so_no', 'text', '注文番号');
	subList.addField('so_id', 'text', '注文ID').setDisplayType('hidden');
	var soLink = subList.addField('so_link', 'url', '表示').setDisplayType('disabled');
	soLink.setLinkText('表示');
	subList.addField('status', 'text', 'ステータス');
	subList.addField('ship_date', 'text', '出荷日');
	subList.addField('delivery_date', 'text', 'DJ_納品日');
	subList.addField('entity', 'text', '顧客');
	subList.addField('subsidiary', 'text', '会社');
	subList.addField('location', 'text', '場所');
	subList.addField('location_id', 'text', '場所ID').setDisplayType('hidden');
	
	
	
	if(selectFlg == 'T'){
		
		var filiterArr = new Array();
		filiterArr.push(["type","anyof","SalesOrd"]);
		filiterArr.push("AND");
		filiterArr.push(["status","anyof","SalesOrd:B"]);
		filiterArr.push("AND");
		filiterArr.push(["mainline","is","T"]);
		filiterArr.push("AND");
		filiterArr.push(["custbody_djkk_shippinglist_sended","is","F"]);
//		filiterArr.push("AND");
//		filiterArr.push(["inventorydetail.internalidnumber","isnotempty",""]);
//		//U667 過去の注文を非表示start
//		filiterArr.push("AND");
//		filiterArr.push(["status","noneof","SalesOrd:C","SalesOrd:H"])
//		//end
		   
		if(!isEmpty(soNoValue)){
			filiterArr.push("AND");
			filiterArr.push(["internalid","anyof",soNoValue]);
		}
		if(!isEmpty(deliveryDateValue)){
			filiterArr.push("AND");
			filiterArr.push(["custbody_djkk_delivery_date","on",deliveryDateValue]);
		}
		if(!isEmpty(shipDateValue)){
			filiterArr.push("AND");
			filiterArr.push(["shipdate","on",shipDateValue]);
		}
		if(!isEmpty(subsidiaryValue)){
			filiterArr.push("AND");
			filiterArr.push(["subsidiary","anyof",subsidiaryValue]);
		}
		if(!isEmpty(locationValue)){
			filiterArr.push("AND");
			filiterArr.push(["location","anyof",locationValue]);
		}
		
		
		var salesorderSearch = getSearchResults("salesorder",null,
				filiterArr, 
				[
				   new nlobjSearchColumn("transactionname"), 
				   new nlobjSearchColumn("status"),
				   new nlobjSearchColumn("shipdate"), 
				   new nlobjSearchColumn("custbody_djkk_delivery_date"), 
				   new nlobjSearchColumn("custbody_suitel10n_jp_ids_customer"), 
				   new nlobjSearchColumn("subsidiary"), 
				   new nlobjSearchColumn("location"),
				   new nlobjSearchColumn("entity"), 
				   new nlobjSearchColumn("internalid").setSort(true)
				]
				);
		
		if(!isEmpty(salesorderSearch)){
			for(var i = 0 ; i < salesorderSearch.length;i++){
				
				var soid =  salesorderSearch[i].getValue("internalid")
				subList.setLineItemValue('so_no', i+1, salesorderSearch[i].getValue("transactionname"));
				subList.setLineItemValue('so_id', i+1, salesorderSearch[i].getValue("internalid"));
				var theLink = nlapiResolveURL('RECORD', 'salesorder',salesorderSearch[i].getValue('internalid') ,'VIEW');
				subList.setLineItemValue('so_link', i+1, theLink);
				subList.setLineItemValue('status', i+1, salesorderSearch[i].getText("status"));
				subList.setLineItemValue('ship_date', i+1, salesorderSearch[i].getValue("shipdate"));
				subList.setLineItemValue('delivery_date', i+1, salesorderSearch[i].getValue("custbody_djkk_delivery_date"));
				subList.setLineItemValue('entity', i+1, salesorderSearch[i].getText("entity"));
				subList.setLineItemValue('subsidiary', i+1, salesorderSearch[i].getText("subsidiary"));
				subList.setLineItemValue('location', i+1, salesorderSearch[i].getText("location"));
				subList.setLineItemValue('location_id', i+1, salesorderSearch[i].getValue("location"));
				
				
			}
		}
		fileIdField.setDefaultValue(DELIVERY_SLIP_ISS);

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


  
	  

