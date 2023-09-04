/**
 * DJ_送り状作成機能
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

var IN_STOCK_SEND_FILE_ID = "";
var SEARCH_SUBSIDIARY = "";
var SEARCH_LOCATION = "";
var SEARCH_VTT = "";
var SEARCH_Form = "";
var SEARCH_theCount ="";
var PAGE_STATUS = 0;
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
	var number = request.getParameter('custpage_number');//受付番号
	var dateree = request.getParameter('custpage_datetext');//出荷日from
	var datereeto = request.getParameter('custpage_datetext_to');//出荷日to
//	var invoice = request.getParameter('custpage_invoice_number');//送り状番号
	var clubValue = request.getParameter('custpage_club');//会社
	var transportValue = request.getParameter('custpage_transport');//配送方法
	var locationValue = request.getParameter('custpage_location');//倉庫
	var deliveryTextval = request.getParameter('custpage_delivery');//納品先
	var deliveryDateTextval = request.getParameter('custpage_delivery_date');//納品日Form
	var deliveryDateTextvalTo = request.getParameter('custpage_delivery_date_to');//納品日To
	var inputOrderTextval = request.getParameter('custpage_input_order');//受注入力者
	var sectionTextval = request.getParameter('custpage_section');//セクション
	var tempTextval = request.getParameter('custpage_temp');//セクション
	

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
	}else if(expressType == '佐川運輸株式会社'){//SaGaWa
		var lineDataObj = {}//リスト行オブジェクト
		var dataserialnumberArr = [];//dataserialnumberArr
		var otherDataArr = [];//送り状作成機能リストその他の要素Array
		for(var i = 0 ; i < theCount ; i++){
			if(request.getLineItemValue('list', 'chk', i+1)=='T'){
				var dataserialnumber = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_dataserialnumber', i+1));//送り状作成機能データテーブル管理番号	
				var substitution = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_total_amount', i+1));//主要代引金額
				var insurancePremium = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_insurance_premium', i+1));//主要保険料
		
				var custpage_packing_figure = defaultEmpty(request.getLineItemValue('list', 'custpage_packing_figure', i+1));
				var custpage_speed_designation = defaultEmpty(request.getLineItemValue('list', 'custpage_speed_designation', i+1));
//				var custpage_delivery_specified_time = defaultEmpty(request.getLineItemValue('list', 'custpage_delivery_specified_time', i+1));
				var custpage_designatied_seal_1 = defaultEmpty(request.getLineItemValue('list', 'custpage_designatied_seal_1', i+1));
				var custpage_sales_office_pickup = defaultEmpty(request.getLineItemValue('list', 'custpage_sales_office_pickup', i+1));
				var custpage_src_segmentation = defaultEmpty(request.getLineItemValue('list', 'custpage_src_segmentation', i+1));
				var custpage_original_arrival_category = defaultEmpty(request.getLineItemValue('list', 'custpage_original_arrival_category', i+1));
				var custpage_mainline_shipping_information = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_shipping_information', i+1));//主要出荷指示情報(メモ欄)
				var deliveryTimeZone = defaultEmpty(request.getLineItemValue('list', 'custpage_sagawadeliverytimezone', i+1));//配達指定時間帯  changed by zhou 20230310
				var deliverySpecifiedHour = defaultEmpty(request.getLineItemValue('list', 'custpage_delivery_specified_hour', i+1));//配達指定時間（時）  changed by zhou 20230310
				var deliverySpecifiedMin = defaultEmpty(request.getLineItemValue('list', 'custpage_delivery_specified_min', i+1));//配達指定時間（分）  changed by zhou 20230310
				
				
				dataserialnumberArr.push(dataserialnumber);
				otherDataArr.push({
					dataserialnumber:dataserialnumber,//DJ_管理番号  配列オブジェクト予約要素
					custpage_packing_figure:custpage_packing_figure,//荷姿
					custpage_speed_designation_after:custpage_speed_designation,//スピード指定
//					custpage_delivery_specified_time_after:custpage_delivery_specified_time,//配達指定時間（時分）
//							custpage_designatied_seal_1_after:custpage_mainline_shipping_information,//指定シール１
					custpage_mainline_shipping_information:custpage_mainline_shipping_information,//主要出荷指示情報(メモ欄)
					custpage_sales_office_pickup_after:custpage_sales_office_pickup,//営業所受取
					custpage_src_segmentation_after:custpage_src_segmentation,//SRC区分
					custpage_original_arrival_category_after:custpage_original_arrival_category,//元着区分
					substitution:substitution,//主要代引金額
					insurancePremium:insurancePremium,//主要保険料
					deliveryTimeZone:deliveryTimeZone,//配達指定時間帯  changed by zhou 20230310
					deliverySpecifiedHour:deliverySpecifiedHour,//配達指定時間（時）  changed by zhou 20230310
					deliverySpecifiedMin:deliverySpecifiedMin,//配達指定時間（分）  changed by zhou 20230310
					
				    data:'',//DJ_DATA  配列オブジェクト予約要素
				    internalid:''
				})
			}
		}	
		scheduleparams['custscript_djkk_data'] = JSON.stringify(otherDataArr);
		scheduleparams['custscript_djkk_fieldid'] = JSON.stringify(fieldIdTextval);
		scheduleparams['custscript_djkk_freight_company'] =expressType;
		scheduleparams['custscript_djkk_jobid'] = jobId;
		
		var batchStatus = runBatch('customscript_djkk_ss_invoice_creation', 'customdeploy_djkk_ss_invoice_creation',scheduleparams);
		nlapiLogExecution('debug','batch',batchStatus)
	}else{
		
		var lineDataObj = {}//リスト行オブジェクト
		var dataserialnumberArr = [];//dataserialnumberArr
		var otherDataArr = [];//送り状作成機能リストその他の要素Array
		for(var i = 0 ; i < theCount ; i++){
			if(request.getLineItemValue('list', 'chk', i+1)=='T'){
				var dataserialnumber = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_dataserialnumber', i+1));//送り状作成機能データテーブル管理番号	
				var custpage_handling_one = defaultEmpty(request.getLineItemValue('list', 'custpage_handling_one', i+1));
				var custpage_handling_two = defaultEmpty(request.getLineItemValue('list', 'custpage_handling_two', i+1));	
				var custpage_sending_type = defaultEmpty(request.getLineItemValue('list', 'custpage_sending_type', i+1));
				var deliveryTimeZone = defaultEmpty(request.getLineItemValue('list', 'custpage_yamatodeliverytimezone', i+1));//配達時間帯 changed by zhou 20230310
				
				dataserialnumberArr.push(dataserialnumber);
				otherDataArr.push({
					dataserialnumber:dataserialnumber,//DJ_管理番号  配列オブジェクト予約要素
					custpage_handling_one:custpage_handling_one,
					custpage_handling_two:custpage_handling_two,
					custpage_sending_type:custpage_sending_type,
					deliveryTimeZone:deliveryTimeZone,
				    data:'',//DJ_DATA  配列オブジェクト予約要素
				})
			}	
		}	
		
		nlapiLogExecution('debug', 'otherDataArr', JSON.stringify(otherDataArr));
		
		scheduleparams['custscript_djkk_data'] = JSON.stringify(otherDataArr);
		scheduleparams['custscript_djkk_fieldid'] = JSON.stringify(fieldIdTextval);
		scheduleparams['custscript_djkk_freight_company'] = expressType;
		scheduleparams['custscript_djkk_jobid'] = jobId;
		
		var batchStatus = runBatch('customscript_djkk_ss_invoice_creation', 'customdeploy_djkk_ss_invoice_creation',scheduleparams);
		nlapiLogExecution('debug','batch',batchStatus)
		//ss  ss  ss
		nlapiLogExecution('debug', 'dataBatchnumber11', JSON.stringify(dataBatchnumber));
	}
//	if(request.getParameter('custpage_express') == '日本通運株式会社 '){//
//		xmlString += '郵便番号 ,住所1,住所2,住所3,お届け先名1,お届け先名2,電話番号 ,品名 ,個数 ,重量 ,集荷予定日 ,配達指定日 ,配達指定時間 ,お客様管理番号1,お客様管理番号2,お客様管理番号3,お客様管理番号4,お客様管理番号5,記事欄1,記事欄2,記事欄3,お荷物価格 ,保険金額\r\n'+strCsv;
//	}else if(request.getParameter('custpage_express') == '佐川運輸株式会社'){//SaGaWa
//		
//		xmlString += 'お届け先コード取得区分 ,お届け先コード ,お届け先電話番号 ,お届け先郵便番号 ,お届け先住所１,お届け先住所２,お届け先住所３,お届け先名称１,お届け先名称２,お客様管理番号,お客様コード ,部署ご担当者コード取得区分 ,部署ご担当者コード ,部署ご担当者名称 ,荷送人電話番号 ,ご依頼主コード取得区分 ,ご依頼主コード ,ご依頼主電話番号 ,ご依頼主郵便番号 ,ご依頼主住所１,ご依頼主住所２,ご依頼主名称１,ご依頼主名称２,荷姿 ,品名１,品名２,品名３,品名４,品名５,荷札荷姿 ,荷札品名1,荷札品名2,荷札品名3,荷札品名4,荷札品名5,荷札品名6,荷札品名7,荷札品名8,荷札品名9,荷札品名10,荷札品名11,出荷個数 ,スピード指定 ,クール便指定 ,配達日 ,配達指定時間帯 ,配達指定時間（時分）,代引金額 ,消費税 ,決済種別 ,保険金額 ,主要出荷指示情報,指定シール２,指定シール３,営業所受取 ,SRC区分 ,営業所受取営業所コード ,元着区分 ,メールアドレス ,ご不在時連絡先 ,出荷日 ,お問い合せ送り状No,出荷場印字区分 ,集約解除指定 ,編集01,編集02,編集03,編集04,編集05,編集06,編集07,編集08,編集09,編集10\r\n'+strCsv;
//	}else{
//		xmlString += 'お客様管理番号 ,送り状種類 ,クール区分 ,伝票番号 ,出荷予定日 ,お届け予定日 ,配達時間帯 ,お届け先コード ,お届け先電話番号 ,お届け先電話番号枝番 ,お届け先郵便番号 ,お届け先住所 ,お届け先アパートマンション名 ,お届け先会社・部門１,お届け先会社・部門２,お届け先名 ,お届け先名(ｶﾅ),敬称 ,ご依頼主コード ,ご依頼主電話番号 ,ご依頼主電話番号枝番 ,ご依頼主郵便番号 ,ご依頼主住所 ,ご依頼主名 ,ご依頼主名(ｶﾅ),品名コード１,品名１,品名コード２,品名２,荷扱い１,荷扱い２,記事 ,ｺﾚｸﾄ代金引換額（税込),内消費税額等 ,止置き ,営業所コード ,発行枚数 ,個数口表示フラグ ,請求先顧客コード ,請求先分類コード ,運賃管理番号 ,クロネコwebコレクトデータ登録 ,クロネコwebコレクト加盟店番号 ,クロネコwebコレクト申込受付番号１,クロネコwebコレクト申込受付番号2,クロネコwebコレクト申込受付番号3,お届け予定ｅメール利用区分 ,お届け予定ｅメールe-mailアドレス ,入力機種 ,お届け予定ｅメールメッセージ ,お届け完了ｅメール利用区分 ,お届け完了ｅメールe-mailアドレス ,お届け完了ｅメールメッセージ ,クロネコ収納代行利用区分 ,予備 ,収納代行請求金額(税込),収納代行内消費税額等 ,収納代行請求先郵便番号 ,収納代行請求先住所,収納代行請求先住所（アパートマンション名） ,収納代行請求先会社・部門名１,収納代行請求先会社・部門名2 ,収納代行請求先名(漢字),収納代行請求先名(カナ),収納代行問合せ先名(漢字),収納代行問合せ先郵便番号 ,収納代行問合せ先住所 ,収納代行問合せ先住所（アパートマンション名）,収納代行問合せ先電話番号 ,収納代行管理番号 ,収納代行品名 ,収納代行備考 ,複数口くくりキー ,検索キータイトル1,検索キー1,検索キータイトル2,検索キー2,検索キータイトル3,検索キー3,検索キータイトル4,検索キー4,検索キータイトル5,検索キー5,予備tdo重複 ,予備tdo重複 ,投函予定メール利用区分 ,投函予定メールe-mailアドレス ,投函予定メールメッセージ ,投函完了メール（お届け先宛）利用区分 ,投函完了メール（お届け先宛）e-mailアドレス ,投函完了メール（お届け先宛）メールメッセージ ,投函完了メール（ご依頼主宛）利用区分 ,投函完了メール（ご依頼主宛）e-mailアドレス ,投函完了メール（ご依頼主宛）メールメッ\r\n'+strCsv;
//	}
	
	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	parameter['express'] = express;
	parameter['jobId'] = jobId;
	parameter['date'] = date;
	parameter['number'] = number;
	parameter['dateree'] = dateree;
	parameter['datereeto'] = datereeto;
//	parameter['invoice'] = invoice;
	parameter['clubValue'] = clubValue;
	parameter['transportValue'] = transportValue;
	parameter['locationValue'] = locationValue;
	parameter['deliveryTextval'] = deliveryTextval;
	parameter['deliveryDateTextval'] = deliveryDateTextval;
	parameter['deliveryDateTextvalTo'] = deliveryDateTextvalTo;
	parameter['inputOrderTextval'] = inputOrderTextval;
	parameter['sectionTextval'] = sectionTextval;
	parameter['fieldId'] = fieldIdTextval;
//	parameter['timeZoneTextval'] = timeZoneTextval; 20230213 changed by zhou  U046課題規定不要
	
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}
function csvOut(request, response) {
	var form = nlapiCreateForm('DJ_送り状作成機能', false);
	form.setScript('customscript_djkk_cs_invoice_creation');
	var jobId = request.getParameter('jobId');
	var express = request.getParameter('express');
	var date = request.getParameter('date');//日付
	var number = request.getParameter('number');//受付番号
	var dateree = request.getParameter('dateree');//出荷日from
	var datereeto = request.getParameter('datereeto');//出荷日from
//	var invoice = request.getParameter('invoice');//送り状番号
	var clubValue = request.getParameter('clubValue');//会社
	var transportValue = request.getParameter('transportValue');//配送方法
	var locationValue = request.getParameter('locationValue');//倉庫
	var deliveryTextval = request.getParameter('deliveryTextval');//納品先
	var deliveryDateTextval = request.getParameter('deliveryDateTextval');//納品日From
	var deliveryDateTextvalTo = request.getParameter('deliveryDateTextvalTo');//納品日to
	var inputOrderTextval = request.getParameter('inputOrderTextval');//受注入力者
	var sectionTextval = request.getParameter('sectionTextval');//セクション
	var tempTextval = request.getParameter('temp');//温度単位 20230213 changed by zhou
	var fieldIdTextval = request.getParameter('fieldId');//
	 var expressCode=  form.addField('custpage_express_code', 'text', 'express').setDisplayType('hidden');
	 expressCode.setDefaultValue(express);
	 var transportCode = form.addField('custpage_transport_code', 'text', '配送方法').setDisplayType('hidden'); //
	 transportCode.setDefaultValue(transportValue);
	 var clubCode = form.addField('custpage_club_code', 'text', '会社').setDisplayType('hidden');//会社
	 clubCode.setDefaultValue(clubValue);
	 var locationCode = form.addField('custpage_location_code', 'text', '倉庫').setDisplayType('hidden'); //倉庫
	 locationCode.setDefaultValue(locationValue);
	 var dateCode = form.addField('custpage_date_code', 'date', '日付').setDisplayType('hidden');
	 dateCode.setDefaultValue(date);
	 var dateTextCode = form.addField('custpage_datetext_code', 'date', '出荷日from').setDisplayType('hidden');
	 dateTextCode.setDefaultValue(dateree);
	 var dateTextToCode = form.addField('custpage_datetext_to_code', 'date', '出荷日to').setDisplayType('hidden');
	 dateTextToCode.setDefaultValue(datereeto);
	 var numberCode = form.addField('custpage_number_code', 'longtext', '受付番号').setDisplayType('hidden');
	 numberCode.setDefaultValue(number);
	 var deliveryCode = form.addField('custpage_delivery_code', 'text', '納品先').setDisplayType('hidden');
	 deliveryCode.setDefaultValue(deliveryTextval);
	 var deliveryDateCode = form.addField('custpage_delivery_date_code', 'text', '納品日From').setDisplayType('hidden');
	 deliveryDateCode.setDefaultValue(deliveryDateTextval);
	 var deliveryDateTextCodeTo = form.addField('custpage_delivery_date_code_to', 'text', '納品日To').setDisplayType('hidden');//納品日to//20230213 add by zhou
	 deliveryDateTextCodeTo.setDefaultValue(deliveryDateTextvalTo);
	 var inputOrderCode = form.addField('custpage_input_order_code', 'text', '受注入力者').setDisplayType('hidden');
	 inputOrderCode.setDefaultValue(inputOrderTextval);
	 var sectionCode = form.addField('custpage_section_code', 'text', 'セクション').setDisplayType('hidden');
	 sectionCode.setDefaultValue(sectionTextval);
	 var tempCode = form.addField('custpage_temp_code', 'text', '温度単位').setDisplayType('hidden');
	 sectionCode.setDefaultValue(tempTextval);
//	var timeZoneTextval = request.getParameter('timeZoneTextval');//時間帯  20230213 changed by zhou U046課題規定不要
//	 var timeZoneCode = form.addField('custpage_time_zone_code', 'text', '時間帯').setDisplayType('hidden');  20230213 changed by zhou  U046課題規定不要
//	 timeZoneCode.setDefaultValue(timeZoneTextval);  20230213 changed by zhou  U046課題規定不要
//	 var invoiceCode = form.addField('custpage_invoice_number_code', 'text', '送り状番号').setDisplayType('hidden');
//	 invoiceCode.setDefaultValue(invoice);
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
		
		var jobSearch = nlapiSearchRecord("customrecord_djkk_csv_outut_record",null,
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
	var selectFlg = request.getParameter('selectFlg');
	var express = request.getParameter('express');//運送会社
	var expressType;//会社の区分
	if(express == '3887'){
		expressType = '佐川運輸株式会社';
	}else if(express == '4'){
		expressType = '西濃';
	}else if(express == '685'){
		expressType = '日本通運株式会社';
	}else if(express == '684'){
		expressType = 'ヤマト運輸株式会社';
	}
	var date = request.getParameter('date');//日付
	var number = request.getParameter('number');//受付番号
	var numberArr = [];
	if(!isEmpty(number)){
		var str = number.split(',');
		for(var c=0;c<str.length;c++){
			numberArr.push(str[c]);
		}
	}
	
	var dateree = request.getParameter('dateree');//出荷日from
	var datereeto = request.getParameter('datereeto');//出荷日to
//	var invoice = request.getParameter('invoice');//送り状番号
	var clubValue = request.getParameter('club');//会社
	var transportValue = request.getParameter('transport');//配送方法
	var locationValue = request.getParameter('location');//倉庫
	var deliveryval = request.getParameter('delivery');//納品先
	var deliveryDateval = request.getParameter('deliveryDate');//納品日
	var deliveryDatevalTo = request.getParameter('deliveryDateTo');//納品日tp
	var inputOrderval = request.getParameter('inputOrder');//受注入力者
	var sectionval = request.getParameter('section');//セクション
	var timeZoneval = request.getParameter('timeZone');//時間帯
	var tempTextval = request.getParameter('temp');//
	
	 var filit = new Array();
	 if(!isEmpty(number)){
		 filit.push(["internalid","is",numberArr]);
		 filit.push("AND");
	 }
	if(!isEmpty(dateree)){
		filit.push(["shipdate","onorafter",dateree]);
		filit.push("AND");
	}
	if(!isEmpty(datereeto)){
		filit.push(["shipdate","onorbefore",datereeto]);
		filit.push("AND");
	}
	if(!isEmpty(date)){
		filit.push(["trandate","on",date]);
		filit.push("AND");
	}
//	if(!isEmpty(transportValue)){
//		filit.push(["shipmethod","anyof",transportValue]);
//		filit.push("AND");
//	}
	if(!isEmpty(clubValue)){
		filit.push(["subsidiary","anyof",clubValue]);
		filit.push("AND");
	}
	if(!isEmpty(locationValue)){
		filit.push(["location","anyof",locationValue]);
		filit.push("AND");
	}
	if(!isEmpty(express)){
		filit.push(["custcol_djkk_shipping_company","anyof",express]);//so運送会社明細判断しで、出力
		filit.push("AND");
	}
	if(!isEmpty(deliveryval)){
		filit.push(["custbody_djkk_delivery_destination","onorafter",deliveryval]);
		filit.push("AND");
	}
	if(!isEmpty(deliveryDateval)){
		filit.push(["custbody_djkk_delivery_date","onorafter",deliveryDateval]);
		filit.push("AND");
	}
	if(!isEmpty(deliveryDatevalTo)){
		filit.push(["custbody_djkk_delivery_date","onorbefore",deliveryDatevalTo]);
		filit.push("AND");
	}
	if(!isEmpty(inputOrderval)){
		filit.push(["custbody_djkk_shipment_person","anyof",inputOrderval]);
		filit.push("AND");
	}
	if(!isEmpty(sectionval)){
		filit.push(["department","anyof",sectionval]);
		filit.push("AND");
	}
	if(!isEmpty(tempTextval)){//温度単位 20230213 changed by zhou
		filit.push(["custcol_djkk_temperature","anyof",tempTextval]);//温度単位 20230213 changed by zhou
		filit.push("AND");//温度単位 20230213 changed by zhou
	}
//	if(express=='ヤマト運輸株式会社'){20230213 changed by zhou  U046課題規定不要
//		if(!isEmpty(timeZoneval)){
//			filit.push(["custbody_djkk_delivery_time_zone_descr","anyof",timeZoneval]);
//			filit.push("AND");
//		}
//	}else if(express=='佐川運輸株式会社'){
//		if(!isEmpty(timeZoneval)){
//			filit.push(["custbody_djkk_delivery_time_zone","anyof",timeZoneval]);
//			filit.push("AND");
//		}
//	}else if(express=='日本通運株式会社'){
//		if(!isEmpty(timeZoneval)){
//			filit.push(["custbody_djkk_includ_time_nipon","anyof",timeZoneval]);
//			filit.push("AND");
//		}
//	}
	
//	if(!isEmpty(invoice)){
//		filit.push(["custbody_djkk_invoice_number","contains",invoice]);
//		filit.push("AND");
//	}
//		filit.push(["custbody_djkk_invoice_number","isnotempty",""]);
//		filit.push("AND");
		filit.push(["itemtype","is","InvtPart"]);
		filit.push("AND");
		filit.push(["custcol_djkk_invoice_creation_over","is","F"]);
		
	var position = request.getParameter('position');
	var form = nlapiCreateForm('DJ_送り状作成機能', false);
	form.setScript('customscript_djkk_cs_invoice_creation');
	SEARCH_Form = form;
		
//	 //画面項目追加
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '戻る','searchReturn()')		 
		 form.addSubmitButton('CSV出力');
		 form.addFieldGroup('select_group_after', '検索');
//       20230213 changed by zhou 
//		 MEMO: U046課題規定 検索後画面要らない
//		  {
//            //会社
//			 if(!isEmpty(clubValue)){
//				 var subsidiarySearch = nlapiSearchRecord("subsidiary",null,
//						 [
//						    ["internalid","anyof",clubValue]
//						 ], 
//						 [
//						    new nlobjSearchColumn("name").setSort(false)
//						 ]
//						 ); 
//				 var clubValue1 = subsidiarySearch[0].getValue('name');
//				 var club1 = form.addField('custpage_club1', 'text', '会社',null,'select_group_after').setDisplayType('inline');//会社
//				 club1.setDefaultValue(clubValue1);
//				
//			 }
//			 //配送方法
//			 if(!isEmpty(transportValue)){
//				 var shipitemSearch = nlapiSearchRecord("shipitem",null,
//							[
//							   ["internalid","anyof",transportValue]
//							], 
//							[
//							   new nlobjSearchColumn("itemid").setSort(false),
//							]
//							);
//				 var transportValue1 = shipitemSearch[0].getValue('itemid');
//				 var transport1 = form.addField('custpage_transport1', 'text', '配送方法',null,'select_group_after').setDisplayType('inline');//運送会社
//				 transport1.setDefaultValue(transportValue1);
//			 }
//			//倉庫
//			 if(!isEmpty(locationValue)){
//				 var filedLocationList = nlapiSearchRecord("location",null,
//							[
//							 	["internalid","anyof",locationValue]
//							], 
//							[
//							   new nlobjSearchColumn("name").setSort(false)
//							]
//							);
//				 var locationValue1 = filedLocationList[0].getValue('name');
//				 var location1 = form.addField('custpage_location1', 'text', '倉庫',null,'select_group_after').setDisplayType('inline'); //倉庫
//				 location1.setDefaultValue(locationValue1);
//			 }
//			 //受付番号
//			 if(!isEmpty(number)){
//				 var number1 = '';
//
//				 var salesorderSearch = nlapiSearchRecord("salesorder",null,
//						 [
//						   ["internalid","anyof",numberArr],
//						   "AND",
//						   ["subsidiary","is",clubValue]//add by zhou 20230213
//						 ], 
//						 [
//						    new nlobjSearchColumn("tranid")
//						 ]
//						 );
//				 nlapiLogExecution('debug', 'number', numberArr.length);
//				 nlapiLogExecution('debug', 'number.lenth', salesorderSearch.length);
//				 for(var j=0;j<salesorderSearch.length;j++){
//					 if(number1.indexOf(salesorderSearch[j].getValue('tranid'))<0){
//						 number1 += salesorderSearch[j].getValue('tranid');
//						 number1 +=',';
//					 }
//				 }
//				 	number1=number1.substring(0,number1.lastIndexOf(','));
////					var number1 = salesorderSearch[0].getValue('tranid');
//					var numberEnd1 = form.addField('custpage_number1', 'text', '受付番号',null,'select_group_after').setDisplayType('inline');
//					numberEnd1.setDefaultValue(number1);
//			 }
//			//納品先
//			 if(!isEmpty(deliveryval)){
//				 var deliveryListArr = nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
//							[
//							   ["internalid","anyof",deliveryval] //itemid
//							], 
//							[
//							   new nlobjSearchColumn("custrecord_djkk_delivery_code")
//							]
//							);
//				 var deliCode = deliveryListArr[0].getValue('custrecord_djkk_delivery_code');
//				 var deliCodeField = form.addField('custpage_delicode', 'text', '納品先',null,'select_group_after').setDisplayType('inline'); //納品先
//				 deliCodeField.setDefaultValue(deliCode);
//			 }
//			 //受注入力者
//			 if(!isEmpty(inputOrderval)){
//				 var employeeSearchArr = nlapiSearchRecord("employee",null,
//						 [
//						  ["internalid","anyof",inputOrderval] 
//						 ], 
//						 [
//						    new nlobjSearchColumn("entityid")
//						 ]
//						 );
//				 
//				 var employCode = employeeSearchArr[0].getValue('entityid');
//				 var emploCodeField = form.addField('custpage_employcode', 'text', '受注入力者',null,'select_group_after').setDisplayType('inline'); //受注入力者
//				 emploCodeField.setDefaultValue(employCode);
//			 }
//			 //セクション
//			 if(!isEmpty(sectionval)){
//				 var departmentSearchArr = nlapiSearchRecord("department",null,
//						 [
//						  	["internalid","anyof",sectionval] 
//						 ], 
//						 [
//						    new nlobjSearchColumn("name")
//						 ]
//						 );
//				 var departCode = departmentSearchArr[0].getValue('name');
//				 var departCodeField = form.addField('custpage_departcode', 'text', 'セクション',null,'select_group_after').setDisplayType('inline'); //受注入力者
//				 departCodeField.setDefaultValue(departCode);
//			 }
//			 //時間帯      20230213 zhou memo :課題規定不要
//			 if(!isEmpty(timeZoneval)){
//				 var csvGroupSearchArr = nlapiSearchRecord("customrecord_djkk_csv_group",null,
//						 [
//						  ["internalid","anyof",timeZoneval] 
//						 ], 
//						 [
//						    new nlobjSearchColumn("name")
//						 ]
//						 );
//				 var csvGroupCode = csvGroupSearchArr[0].getValue('name');
//				 var csvGroupCodeField = form.addField('custpage_csvgroupcode', 'text', '時間帯',null,'select_group_after').setDisplayType('inline'); //受注入力者
//				 csvGroupCodeField.setDefaultValue(csvGroupCode);
//			 }
//	     }

		 
		 var numberField = form.addField('custpage_express_date', 'text', '配達指定日','').setDisplayType('hidden');
		 numberField.setDefaultValue('testData');
		 var transport = form.addField('custpage_transport', 'text', '配送方法',null,'select_group_after').setDisplayType('hidden');//運送会社
		 transport.setDefaultValue(transportValue);
		 var club = form.addField('custpage_club', 'text', '会社',null,'select_group_after').setDisplayType('hidden');//会社
		 club.setDefaultValue(clubValue);
		 var location = form.addField('custpage_location', 'text', '倉庫',null,'select_group_after').setDisplayType('hidden'); //倉庫
		 location.setDefaultValue(locationValue);
		 var dateEnd = form.addField('custpage_date', 'date', '注文日',null,'select_group_after').setDisplayType('hidden');//20230213 changed by zhou  日付 =>注文日
		 dateEnd.setDefaultValue(date);
		 var dateText = form.addField('custpage_datetext', 'date', '出荷日From',null,'select_group_after').setDisplayType('hidden');//20230213 changed by zhou
		 dateText.setDefaultValue(dateree);
		 var dateTextTo = form.addField('custpage_datetext_to', 'date', '出荷日To',null,'select_group_after').setDisplayType('hidden');//20230213 changed by zhou
		 dateTextTo.setDefaultValue(datereeto);
		 var numberEnd = form.addField('custpage_number', 'longtext', '受付番号',null,'select_group_after').setDisplayType('hidden');
		 numberEnd.setDefaultValue(number);
		 var deliveryText = form.addField('custpage_delivery', 'text', '納品先',null, 'select_group_after').setDisplayType('hidden');//納品先
		 deliveryText.setDefaultValue(deliveryval);
		 var deliveryDateText = form.addField('custpage_delivery_date', 'date', '納品日From',null, 'select_group_after').setDisplayType('hidden');//納品日//20230213 changed by zhou
		 deliveryDateText.setDefaultValue(deliveryDateval);
		 var deliveryDateTextTo = form.addField('custpage_delivery_date_to', 'date', '納品日To',null, 'select_group_after').setDisplayType('hidden');//納品日//20230213 add by zhou
		 deliveryDateTextTo.setDefaultValue(deliveryDatevalTo);
		 var inputOrderText = form.addField('custpage_input_order', 'text', '受注入力者',null, 'select_group_after').setDisplayType('hidden');//受注入力者
		 inputOrderText.setDefaultValue(inputOrderval);
		 var sectionText = form.addField('custpage_section', 'text', 'セクション',null, 'select_group_after').setDisplayType('hidden');//セクション
		 sectionText.setDefaultValue(sectionval);
		 var tempText = form.addField('custpage_temp', 'text', '温度単位',null, 'select_group_after').setDisplayType('hidden');//温度単位 20230213 changed by zhou
		 tempText.setDefaultValue(tempTextval);
		 
		 var fieldidText = form.addField('custpage_fieldid', 'text', 'ファイルID',null, 'select_group_after').setDisplayType('hidden');//温度単位 20230213 changed by zhou
		 
//		 var timeZoneText = form.addField('custpage_time_zone', 'text', '時間帯',null, 'select_group_after').setDisplayType('hidden');//時間帯  20230213 changed by zhou U046課題規定不要
//		 timeZoneText.setDefaultValue(timeZoneval);   20230213 changed by zhou  U046課題規定不要
//		 var invoiceEnd = form.addField('custpage_invoice_number', 'text', '送り状番号',null,'select_group_after').setDisplayType('inline');
//		 invoiceEnd.setDefaultValue(invoice);
		 if(position == 'back'){
			 var expressBack = request.getParameter('expressBack');
			 var expressFieldBack = form.addField('custpage_express', 'text','運送会社',null,'select_group_after').setDisplayType('hidden');//20230213 changed by zhou
			 expressFieldBack.setDefaultValue(express); 
		 }else{
			 var expressField = form.addField('custpage_express', 'text', '運送会社',null,'select_group_after').setDisplayType('hidden');//20230213 changed by zhou
			 expressField.setDefaultValue(express);

		 }
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
		 //select line1
		 var clubField = form.addField('custpage_club', 'select', '会社',null, 'select_line1');//会社
		 clubField.setMandatory(true);
		 
		 //select line2
		 var dateField = form.addField('custpage_date', 'date', '注文日',null, 'select_line2');//20230213 changed by zhou  日付 =>注文日
		 var tempField = form.addField('custpage_temp', 'multiselect', '温度単位',null, 'select_line2');
		 var numberField = form.addField('custpage_number', 'multiselect', '受注番号',null, 'select_line2');
//		 var numberTextField = form.addField('custpage_number_t', 'longtext', '受注番号テキスト',null, 'select_line2');
		 //select line3
		 var dateTextField = form.addField('custpage_datetext', 'date', '出荷日From',null, 'select_line3');
		 dateTextField.setMandatory(true);
		 var expressField = form.addField('custpage_express', 'select', '運送会社',null, 'select_line3');//運送会社
		 expressField.setMandatory(true);
		 //select line4
		 var dateTextFieldTo = form.addField('custpage_datetext_to', 'date', '出荷日To',null, 'select_line4');//Delivery
		 dateTextFieldTo.setMandatory(true);
		 //select line5
		 var delivery = form.addField('custpage_delivery', 'select', '納品先',null, 'select_line5');//納品先
		 //select line6
		 var deliveryDate = form.addField('custpage_delivery_date', 'date', '納品日From',null, 'select_line6');//納品日 
		 var locationField = form.addField('custpage_location', 'select', '倉庫',null, 'select_line6'); //倉庫
		 
		 var deliveryDateTo = form.addField('custpage_delivery_date_to', 'date', '納品日To',null, 'select_line7');//20230213 add by zhou
		 //select line7
		 var section = form.addField('custpage_section', 'select', 'セクション',null, 'select_line8');//セクション
		 var inputOrder = form.addField('custpage_input_order', 'select', '受注入力者',null, 'select_line8');//受注入力者
		 //select line8
		 var transportField = form.addField('custpage_transport', 'select', '配送方法',null, 'select_line9').setDisplayType('hidden');; 
		 //add
		 
		 
		 
		 
//		 var timeZone = form.addField('custpage_time_zone', 'select', '時間帯',null, 'select_group');//時間帯 20230213 changed by zhou  U046課題規定不要
		 //end
		 //var numberField = form.addField('custpage_number', 'text', '受付番号',null, 'select_group');

//		 var invoice_Number = form.addField('custpage_invoice_number', 'text', '送り状番号',null, 'select_group');
		 
		 var selectSub=getRoleSubsidiariesAndAddSelectOption(clubField);
		 if(isEmpty(clubValue)){
			 clubValue = selectSub;
		 }
		 
		 //運送会社
		 var shippingcompanySearch = nlapiSearchRecord("customrecord_djkk_shippingcompany_mst",null,
				 [
				 ], 
				 [
				    new nlobjSearchColumn("name").setSort(false), //名前
				    new nlobjSearchColumn("custrecord_djkk_shippingcompany_code")
				 ]
				 );
		 expressField.addSelectOption('', '');
		 if(!isEmpty(shippingcompanySearch)){
			 for(var scs=0;scs<shippingcompanySearch.length;scs++){
				 expressField.addSelectOption(shippingcompanySearch[scs].getValue("custrecord_djkk_shippingcompany_code"),shippingcompanySearch[scs].getValue("name"));
			 }
		 }
//		 expressField.addSelectOption('','');
//		 expressField.addSelectOption('日本通運株式会社', '日本通運株式会社株式会社')//
//		 expressField.addSelectOption('佐川運輸株式会社', '佐川運輸株式会社')//SaGaWa
//		 expressField.addSelectOption('ヤマト運輸株式会社', 'ヤマト運輸株式会社')
		 //add
		 if(!isEmpty(clubValue)){
			 //納品先
			 var deliveryList = nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
						[
						   ["custrecord_djkk_delivery_subsidiary","anyof",clubValue] //itemid
						], 
						[
						   new nlobjSearchColumn("custrecord_djkk_delivery_code"), 
						   new nlobjSearchColumn("internalid")
						]
						);
			 delivery.addSelectOption('', '');
			 if(!isEmpty(deliveryList)){
				 for(var k=0;k<deliveryList.length;k++){
					 delivery.addSelectOption(deliveryList[k].getValue("internalid"),deliveryList[k].getValue("custrecord_djkk_delivery_code"));
				 }
			 }
			 
			 //受注入力者
			 var employeeSearch = nlapiSearchRecord("employee",null,
					 [
					 ], 
					 [
					    new nlobjSearchColumn("entityid").setSort(false), 
					    new nlobjSearchColumn("internalid")
					 ]
					 );
			 inputOrder.addSelectOption('', '');
			 if(!isEmpty(employeeSearch)){
				 for(var a=0;a<employeeSearch.length;a++){
					 inputOrder.addSelectOption(employeeSearch[a].getValue("internalid"),employeeSearch[a].getValue("entityid"));
				 }
			 }
			 
			 
			 //セクション
			 var departmentSearch = nlapiSearchRecord("department",null,
					 [
					  	["subsidiary","anyof",clubValue] //itemid
					 ], 
					 [
					    new nlobjSearchColumn("name").setSort(false), 
					    new nlobjSearchColumn("internalid")
					 ]
					 );
			 section.addSelectOption('', '');
			 if(!isEmpty(departmentSearch)){
				 for(var a=0;a<departmentSearch.length;a++){
					 section.addSelectOption(departmentSearch[a].getValue("internalid"),departmentSearch[a].getValue("name"));
				 }
			 }
			 
			 //時間帯 20230213 changed by zhou  U046課題規定不要
//			 if(!isEmpty(express)){
//				 var expressVal = ''
//				 if(express=='日本通運株式会社'){
//					 expressVal='time_kubun_nitu';
//				 }else if(express=='ヤマト運輸株式会社'){
//					 expressVal='time_kubun_yamato';
//				 }else if(express=='佐川運輸株式会社'){
//					 expressVal='time_kubun_sagawa';
//				 }
//				 var csvGroupSearch = nlapiSearchRecord("customrecord_djkk_csv_group",null,
//						 [
//						  ["custrecord_djkk_csv_kubun","is",expressVal] 
//						 ], 
//						 [
//						    new nlobjSearchColumn("name").setSort(false), 
//						    new nlobjSearchColumn("internalid")
//						 ]
//						 );
//				 timeZone.addSelectOption('', '');
//				 if(!isEmpty(csvGroupSearch)){
//					 for(var a=0;a<csvGroupSearch.length;a++){
//						 timeZone.addSelectOption(csvGroupSearch[a].getValue("internalid"),csvGroupSearch[a].getValue("name"));
//					 }
//				 } 
//			 }
			 
		 }
		 
		 //end
		 if(!isEmpty(express)){
			 //配送方法
					var shipitemSearch = nlapiSearchRecord("shipitem",null,
					[
					   ["itemid","contains",express] //itemid
					], 
					[
					   new nlobjSearchColumn("itemid").setSort(false),
					   new nlobjSearchColumn("internalid")
					]
					);
					transportField.addSelectOption('', '');
					if(!isEmpty(shipitemSearch)){
						for(var i = 0; i<shipitemSearch.length;i++){
							transportField.addSelectOption(shipitemSearch[i].getValue("internalid"),shipitemSearch[i].getValue('itemid'));
						}
					}
			 }
		 //20230213 add by zhou start 温度単位
		 if(!isEmpty(clubValue)){
			 //温度単位
					var tempSearch = nlapiSearchRecord("customrecord_djkk_shipping_temperature",null,//DJ_製品配送温度
					[
					   ["custrecord_djkk_shipping_temperature_id","isnotempty",""] 
					], 
					[
					   new nlobjSearchColumn("internalid").setSort(false),//DJ_配送温度区分
					   new nlobjSearchColumn("name").setSort(false),//名前
					]
					);
					tempField.addSelectOption('', '');
					if(!isEmpty(tempSearch)){
						for(var i = 0; i<tempSearch.length;i++){
							tempField.addSelectOption(tempSearch[i].getValue("internalid"),tempSearch[i].getValue('name'));
						}
					}
			 }
		 
		 //end
		 if(!isEmpty(clubValue)){
			 //倉庫
			 var filedLocationList = nlapiSearchRecord("location",null,
						[
						 	["subsidiary","anyof",clubValue],
						 	"AND",
						    ["custrecord_djkk_four_digit_location","is",'T']//add by zhou 20230213
						], 
						[
						   new nlobjSearchColumn("internalid"), 
						   new nlobjSearchColumn("name").setSort(false)
						]
						);
				
			 locationField.addSelectOption('', '');
			 if(!isEmpty(filedLocationList)){
				for(var i = 0; i<filedLocationList.length;i++){
					locationField.addSelectOption(filedLocationList[i].getValue("internalid"),filedLocationList[i].getValue("name"));
				}
			 } 
		 }
		 var salesorderSearch = nlapiSearchRecord("salesorder",null,
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
				numberField.addSelectOption('', '');
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
				numberField.addSelectOption(newInternalidArr[i],newTranidArr[i])
				}
		 
		 clubField.setDefaultValue(clubValue);
		 transportField.setDefaultValue(transportValue);
		 locationField.setDefaultValue(locationValue);
		 expressField.setDefaultValue(express);
		 dateField.setDefaultValue(date);
		 dateTextField.setDefaultValue(dateree);
		 dateTextFieldTo.setDefaultValue(datereeto);
		 
		 numberField.setDefaultValue(number);
//		 invoice_Number.setDefaultValue(invoice);
		 delivery.setDefaultValue(deliveryval);
		 deliveryDate.setDefaultValue(deliveryDateval);
		 deliveryDateTo.setDefaultValue(deliveryDatevalTo);
		 inputOrder.setDefaultValue(inputOrderval);
		 section.setDefaultValue(sectionval);
//		 timeZone.setDefaultValue(timeZoneval); 20230213 changed by zhou  U046課題規定不要
		 
//		 var salesorderSearchArr = nlapiSearchRecord("salesorder",null,
//				 [
//				   ["itemtype","is","InvtPart"],
//				   ["internalid","anyof",numberArr]
//				 ], 
//				 [
//				    new nlobjSearchColumn("internalid"),
//				    new nlobjSearchColumn("tranid")//
//				 ]
//				 );
//				var tranidArrNew = [];
//				var internalidArrNew = [];
//				for(var i = 0; i<salesorderSearchArr.length;i++){
//
//				var tranidover = salesorderSearchArr[i].getValue("tranid");
//				var internalidover = salesorderSearchArr[i].getValue("internalid");
//				tranidArrNew.push(tranidover);
//				internalidArrNew.push(internalidover);
//				}
//
//				var TranidArr = unique1(tranidArrNew);
//				var InternalidArr = unique1(internalidArrNew);
//				for(var i = 0; i<TranidArr.length;i++){
//				numberField.addSelectOption(newInternalidArr[i],newTranidArr[i])
//				}
		 
	 }

	 // 明細表示
	 if(selectFlg == 'T'){
		 nlapiLogExecution('debug','明細表示', 'in')
	 	var subList = form.addSubList('list', 'list', '');
		subList.addMarkAllButtons();
		subList.addField('chk', 'checkbox', '選択')
		//20230213 add by zhou  U046
		subList.addField('custpage_mainline_zip_code', 'text', '郵便番号');
		subList.addField('custpage_mainline_tranid', 'text', '受注番号');
		subList.addField('custpage_mainline_temperature_unit', 'text', '温度単位');
		subList.addField('custpage_mainline_shipping_date', 'text', '出荷日');
		subList.addField('custpage_mainline_freight_company', 'text', 'DJ_運送会社');
		subList.addField('custpage_mainline_delivery_name', 'text', '届け先名');
		subList.addField('custpage_mainline_address', 'text', 'お届け先の住所');
		subList.addField('custpage_mainline_delivery_date', 'text', '納品日');
		subList.addField('custpage_mainline_sending_table', 'text', '送り状備考欄');
		subList.addField('custpage_mainline_amount', 'text', '金額');
		subList.addField('custpage_mainline_total_amount', 'text', '代引合計金額');
		subList.addField('custpage_mainline_insurance', 'checkbox', '保険付');
		subList.addField('custpage_mainline_insurance_premium', 'text', '保険料').setDisplayType('entry');
		subList.addField('custpage_mainline_dataserialnumber', 'text', 'dataSerialnumber').setDisplayType('hidden');
		
		//end
		if(expressType == '日本通運株式会社'){// 
			//20230213 add by zhou start 
			var deliveryTimeZoneField = subList.addField('custpage_ne_deliverytimezone', 'select', '配達指定時間');//changed by zhou 20230310
		    //YAMATO  配達時間帯
			var deliveryTimeZoneSearch = nlapiSearchRecord("customrecord_djkk_csv_group",null,
					[
					["custrecord_djkk_csv_kubun","is","NE配達時間帯"]
					], 
					[
					 	new nlobjSearchColumn('internalid').setSort(false),
					 	new nlobjSearchColumn('custrecord_djkk_csv_code'),
						new nlobjSearchColumn('custrecord_djkk_csv_name')
					]
					);
			var deliveryTimeZoneTypeArr = [];
			if(!isEmpty(deliveryTimeZoneSearch)){
				//deliveryTimeZone
				for(var dt = 0 ; dt < deliveryTimeZoneSearch.length ; dt++){
					var deliveryTimeZoneSerialnumber = deliveryTimeZoneSearch[dt].getValue('custrecord_djkk_csv_code');
					var deliveryTimeZoneType = deliveryTimeZoneSearch[dt].getValue('custrecord_djkk_csv_name');
					deliveryTimeZoneTypeArr.push({
						serialnumber:deliveryTimeZoneSerialnumber,
						type:deliveryTimeZoneType
					})
				}
			}
			//YAMATO deliveryTimeZone
			deliveryTimeZoneField.addSelectOption('', '');
			for(var dtz = 0 ; dtz < deliveryTimeZoneTypeArr.length ; dtz++){
				deliveryTimeZoneField.addSelectOption(deliveryTimeZoneTypeArr[dtz].serialnumber, deliveryTimeZoneTypeArr[dtz].type,false)
			}
			//end
			
//			subList.addField('custpage_comment1', 'text', '記事欄1');
		}else if(expressType == '佐川運輸株式会社'){//SaGaWa			
			var mainShippingInformationField = subList.addField('custpage_mainline_shipping_information', 'select', '出荷指示情報(メモ欄)');
			//20230213 add by zhou start  in working
			var ShippingInformationSearch = nlapiSearchRecord("customrecord_djkk_csv_group",null,
					[
					["custrecord_djkk_csv_kubun","is","出荷指示情報"]
					], 
					[
					 	new nlobjSearchColumn('custrecord_djkk_csv_name'),//CSV出力用名称
						new nlobjSearchColumn('custrecord_djkk_csv_code')//CSV出力用コード
					]
					);
			var ShippingInformationArr = [];
			if(!isEmpty(ShippingInformationSearch)){
				for(var sp = 0 ; sp < ShippingInformationSearch.length ; sp++){
					var spSerialnumber = ShippingInformationSearch[sp].getValue('custrecord_djkk_csv_code');
					var spType = ShippingInformationSearch[sp].getValue('custrecord_djkk_csv_name');
					ShippingInformationArr.push({
						serialnumber:spSerialnumber,
						type:spType
						
					})
				}
			}
			//ShippingInformation Type
			mainShippingInformationField.addSelectOption('','')
			for(var spt = 0 ; spt < ShippingInformationArr.length ; spt++){
				mainShippingInformationField.addSelectOption(ShippingInformationArr[spt].serialnumber, ShippingInformationArr[spt].type,false)
			}
			//end
			var packingFigureField  = subList.addField('custpage_packing_figure', 'select', '荷姿');
			//20230213 add by zhou start  in working
			var packingFigureTypeSearch = nlapiSearchRecord("customrecord_djkk_cargo",null,
					[
					["custrecord_djkk_cargo_serialnumber_list","isnotempty",""]
					], 
					[
					 	new nlobjSearchColumn('custrecord_djkk_cargo_type_list'),//DJ_荷姿種類
						new nlobjSearchColumn('custrecord_djkk_cargo_serialnumber_list')//DJ_シーケンス番号
					]
					);
			var packingFigureArr = [];
			if(!isEmpty(packingFigureTypeSearch)){
				for(var pf = 0 ; pf < packingFigureTypeSearch.length ; pf++){
					var cargoSerialnumber = packingFigureTypeSearch[pf].getValue('custrecord_djkk_cargo_serialnumber_list');
					var cargoType = packingFigureTypeSearch[pf].getValue('custrecord_djkk_cargo_type_list');
					packingFigureArr.push({
						serialnumber:cargoSerialnumber,
						type:cargoType
						
					})
				}
			}
			packingFigureField.addSelectOption('', '');
			//PackingFigure Type
			for(var pt = 0 ; pt < packingFigureArr.length ; pt++){
				packingFigureField.addSelectOption(packingFigureArr[pt].serialnumber, packingFigureArr[pt].serialnumber+':'+packingFigureArr[pt].type,false)
			}
			//end
			var speedDesignationField =  subList.addField('custpage_speed_designation', 'select', 'スピード指定');
			//20230213 add by zhou start  in working
			var sdTypeSearch = nlapiSearchRecord("customrecord_djkk_speed_designation",null,
					[
					["custrecord_djkk_sd_serialnumber_list","isnotempty",""]
					], 
					[
					 	new nlobjSearchColumn('custrecord_djkk_sd_type_list'),//DJ_スピード種類
						new nlobjSearchColumn('custrecord_djkk_sd_serialnumber_list')//DJ_スピードシーケンス番号
					]
					);
			var speedDesignationArr = [];
			if(!isEmpty(sdTypeSearch)){
				for(var ss = 0 ; ss < sdTypeSearch.length ; ss++){
					var sdSerialnumber = sdTypeSearch[ss].getValue('custrecord_djkk_sd_serialnumber_list');
					var sdType = sdTypeSearch[ss].getValue('custrecord_djkk_sd_type_list');
					speedDesignationArr.push({
						serialnumber:sdSerialnumber,
						type:sdType
						
					})
				}
			}
			speedDesignationField.addSelectOption('', '');
			//speedDesignation Type
			for(var st = 0 ; st < speedDesignationArr.length ; st++){
				speedDesignationField.addSelectOption(speedDesignationArr[st].serialnumber, speedDesignationArr[st].serialnumber+':'+speedDesignationArr[st].type,false)
			}
			//end
			
			
			//20230213 add by zhou start 
			var deliveryTimeZoneField = subList.addField('custpage_sagawadeliverytimezone', 'select', '配達指定時間帯');//changed by zhou 20230310
		    //YAMATO  配達時間帯
			var deliveryTimeZoneSearch = nlapiSearchRecord("customrecord_djkk_csv_group",null,
					[
					["custrecord_djkk_csv_kubun","is","SAGAWA配達時間帯"]
					], 
					[
					 	new nlobjSearchColumn('internalid').setSort(false),
					 	new nlobjSearchColumn('custrecord_djkk_csv_code'),
						new nlobjSearchColumn('custrecord_djkk_csv_name')
					]
					);
			var deliveryTimeZoneTypeArr = [];
			if(!isEmpty(deliveryTimeZoneSearch)){
				//deliveryTimeZone
				for(var dt = 0 ; dt < deliveryTimeZoneSearch.length ; dt++){
					var deliveryTimeZoneSerialnumber = deliveryTimeZoneSearch[dt].getValue('custrecord_djkk_csv_code');
					var deliveryTimeZoneType = deliveryTimeZoneSearch[dt].getValue('custrecord_djkk_csv_name');
					deliveryTimeZoneTypeArr.push({
						serialnumber:deliveryTimeZoneSerialnumber,
						type:deliveryTimeZoneType
					})
				}
			}
			//YAMATO deliveryTimeZone
			deliveryTimeZoneField.addSelectOption('', '');
			for(var dtz = 0 ; dtz < deliveryTimeZoneTypeArr.length ; dtz++){
				deliveryTimeZoneField.addSelectOption(deliveryTimeZoneTypeArr[dtz].serialnumber, deliveryTimeZoneTypeArr[dtz].type,false)
			}
			//end
			
			
			var deliverySpecifiedHour = subList.addField('custpage_delivery_specified_hour', 'select', '配達指定時間（時）').setDisplayType('entry');//changed by zhou 20230310
			deliverySpecifiedHour.addSelectOption('', '');
			for(var h = 0 ;h < 25;h++){
				var deliverySpecifiedHourId = '';
				var deliverySpecifiedHourName = '';
				if(h < 10){
					deliverySpecifiedHourId += '0'+h.toString();
					deliverySpecifiedHourName += '0'+h.toString()+'時';
				}else{
					deliverySpecifiedHourId += h.toString();
					deliverySpecifiedHourName += h.toString()+'時';
				}
				deliverySpecifiedHour.addSelectOption(deliverySpecifiedHourId, deliverySpecifiedHourName);
			}
			var deliverySpecifiedMin = subList.addField('custpage_delivery_specified_min', 'select', '配達指定時間（分）').setDisplayType('entry');//changed by zhou 20230310
			deliverySpecifiedMin.addSelectOption('', '');
			deliverySpecifiedMin.addSelectOption('00', '00分');
			deliverySpecifiedMin.addSelectOption('30', '30分');
//			var ShippingInformationField = subList.addField('custpage_designatied_seal_1', 'select', '指定シール１');//20230213 changed by zhou
			//20230213 add by zhou start  in working
			//ShippingInformation Type
//			ShippingInformationField.addSelectOption('', '');
//			for(var spt2 = 0 ; spt2 < ShippingInformationArr.length ; spt2++){
//				ShippingInformationField.addSelectOption(ShippingInformationArr[spt2].serialnumber, ShippingInformationArr[spt2].type,false)
//			}
			//end
			subList.addField('custpage_sales_office_pickup', 'checkbox', '営業所受取');//20230213 changed by zhou  
			subList.addField('custpage_src_segmentation', 'checkbox', 'SRC区分');//20230213 changed by zhou 
			subList.addField('custpage_original_arrival_category', 'checkbox', '元着区分');//20230213 changed by zhou 		
		}else {
			nlapiLogExecution('debug','create sub', 'in')
//			subList.addField('custpage_customer_control_number', 'text', 'お客様管理番号');
//			subList.addField('custpage_sending_type', 'text', '送り状種類');//changed by zhou 20230213
			var invoiceTypeField = subList.addField('custpage_sending_type', 'select', '送り状種類');//changed by zhou 20230213
			//20230213 add by zhou start 
		    //YAMATO  DJ_送り状種類リスト 
			var invoiceTypeSearch = nlapiSearchRecord("customrecord_djkk_invoice_type",null,
					[
					["custrecord_djkk_sub_type","is",clubValue]
					], 
					[
					 	new nlobjSearchColumn('custrecord_djkk_invoice_type_list'),//DJ_送り状種類
						new nlobjSearchColumn('custrecord_djkk_serialnumber_list')//DJ_シーケンス番号
					]
					);
			var itemInvoiceTypeArr = [];
			if(!isEmpty(invoiceTypeSearch)){
				//Invoice Type
				for(var it = 0 ; it < invoiceTypeSearch.length ; it++){
					var serialnumber = invoiceTypeSearch[it].getValue('custrecord_djkk_serialnumber_list');
					var invoiceType = invoiceTypeSearch[it].getValue('custrecord_djkk_invoice_type_list');
					itemInvoiceTypeArr.push({
						serialnumber:serialnumber,
						invoiceType:invoiceType
						
					})
				}
			}
			//YAMATO Invoice Type
			invoiceTypeField.addSelectOption('', '');
			for(var yit = 0 ; yit < itemInvoiceTypeArr.length ; yit++){
				invoiceTypeField.addSelectOption(itemInvoiceTypeArr[yit].serialnumber, itemInvoiceTypeArr[yit].serialnumber+':'+itemInvoiceTypeArr[yit].invoiceType,false)
			}
			//end
			
			//20230213 add by zhou start 
			var deliveryTimeZoneField = subList.addField('custpage_yamatodeliverytimezone', 'select', '配達時間帯');//changed by zhou 20230310
		    //YAMATO  配達時間帯
			var deliveryTimeZoneSearch = nlapiSearchRecord("customrecord_djkk_csv_group",null,
					[
					["custrecord_djkk_csv_kubun","is","YAMATO配達時間帯"]
					], 
					[
					 	new nlobjSearchColumn('internalid').setSort(false),
					 	new nlobjSearchColumn('custrecord_djkk_csv_code'),
						new nlobjSearchColumn('custrecord_djkk_csv_name')
					]
					);
			var deliveryTimeZoneTypeArr = [];
			if(!isEmpty(deliveryTimeZoneSearch)){
				//deliveryTimeZone
				for(var dt = 0 ; dt < deliveryTimeZoneSearch.length ; dt++){
					var deliveryTimeZoneSerialnumber = deliveryTimeZoneSearch[dt].getValue('custrecord_djkk_csv_code');
					var deliveryTimeZoneType = deliveryTimeZoneSearch[dt].getValue('custrecord_djkk_csv_name');
					deliveryTimeZoneTypeArr.push({
						serialnumber:deliveryTimeZoneSerialnumber,
						type:deliveryTimeZoneType
					})
				}
			}
			//YAMATO deliveryTimeZone
			deliveryTimeZoneField.addSelectOption('', '');
			for(var dtz = 0 ; dtz < deliveryTimeZoneTypeArr.length ; dtz++){
				deliveryTimeZoneField.addSelectOption(deliveryTimeZoneTypeArr[dtz].serialnumber, deliveryTimeZoneTypeArr[dtz].type,false)
			}
			//end
			
			subList.addField('custpage_handling_one', 'checkbox', 'ワレ物注意');//20230213 changed by zhou
			subList.addField('custpage_handling_two', 'checkbox', '天地無用');//20230213 changed by zhou
		}
	 }
	 
	 // 保存検索
	 var dataArr = [];//初期フィルタデータ配列
	 if(selectFlg == 'T'){	
		 if(expressType == '日本通運株式会社'){
				//20230216 add by zhou start
			 var lineNum = new nlobjSearchColumn("line"); //受注番号
			 var soid  = new nlobjSearchColumn("internalid"); //受注番号
//			 var primary_zip_code = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  is null THEN  Replace({billingAddress.zip},'-','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  END"); //郵便番号
			 var primary_tranid = new nlobjSearchColumn("tranid"); //受注番号
			 var primary_temperature_unit = new nlobjSearchColumn("custcol_djkk_temperature"); //DJ_配送温度
			 var primary_shipping_date = new nlobjSearchColumn("shipdate"); //出荷日
			 var primary_freight_company = express; //DJ_運送会社
//			 var primary_delivery_name  = new nlobjSearchColumn("formulatext");//お届け先名
//			 primary_delivery_name.setFormula("CASE WHEN {custbody_djkk_delivery_destination.custrecorddjkk_name} is null THEN {billingAddress.addressee} ELSE {custbody_djkk_delivery_destination.custrecorddjkk_name} END");
//			 var primary_address  = new nlobjSearchColumn("formulatext");//20230213 changed by zhou   DJ_都道府県 +DJ_市区町村+DJ_納品先住所1+DJ_納品先住所2; //お届け先の住所
//			 primary_address.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city}||{billingAddress.address1}||{billingAddress.address2},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') END");
			 var primary_delivery_date = new nlobjSearchColumn("custbody_djkk_delivery_date"); //納品日
			 var primary_sending_table = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN {custbody_djkk_de_sodeliverermem} is null THEN {custbody_djkk_sodeliverermem} ELSE {custbody_djkk_de_sodeliverermem} END"); //送り状備考欄

			 var primary_amount = new nlobjSearchColumn("amount"); //金額
			 var payment = new nlobjSearchColumn("custbody_djkk_payment_conditions");//支払条件
			 var primary_total_amount = new nlobjSearchColumn("amount"); //代引合計金額
			 var primary_insurance = new nlobjSearchColumn("formulatext"); //保険付
			 var primary_insurance_premium = new nlobjSearchColumn("custcolcustbody_djkk_guarantee_fund"); //保険料
			 var primary_shipping_information = new nlobjSearchColumn("memo"); //出荷指示情報(メモ欄)
			 //end
			 var delivery =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//SO.納品先
			 var customer =  new nlobjSearchColumn("entity");//SO.顧客
			 var deliveryPrepare = new nlobjSearchColumn("custbody_djkk_de_sodeliverermem"); //DJ_納品先送り状に記載備考欄
			 var customerPrepare = new nlobjSearchColumn("custbody_djkk_sodeliverermem"); //DJ_顧客送り状に記載備考欄
			 var deliveryAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')");//SO.納品先.郵便番号
			 var deliveryAddressState = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_prefectures}");//SO.納品先.都道府県
			 var deliveryAddressCity = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}");//SO.納品先.市区町村
			 var deliveryAddress1 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}");//SO.納品先.住所1
			 var deliveryAddress2 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable}");//SO.納品先.住所2
			 var deliveryAddress3 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2}");//SO.納品先.住所3
			 var deliveryName = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecorddjkk_name}");//SO.納品先.納品先名前
			 var deliveryNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},0,40)");//SO.納品先.納品先名前(0-40)
			 var deliveryNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,40)");//SO.納品先.納品先名前(41-80)
			 var deliveryAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text}");//SO.納品先.電話番号
			 var billingAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({billingAddress.zip},'-','')");//SO.顧客.郵便番号
			 var billingAddressState = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.custrecord_djkk_address_state}");//SO.顧客.都道府県
			 var billingAddressCity= new nlobjSearchColumn("formulatext").setFormula("{billingAddress.city}");//SO.顧客.市区町村
			 var billingAddress1 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address1}");//SO.顧客.住所1
			 var billingAddress2 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address2}");//SO.顧客.住所2
			 var billingAddress3 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address3}");//SO.顧客.住所3
			 var billingName = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.addressee}");//SO.顧客.(0-40)
			 var billingNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},0,40)");//SO.顧客.(0-40)
			 var billingNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},41,40)");//SO.顧客.(41-80)
			 var billingAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.phone}");//SO.顧客.電話番号
			 
//			 var zip = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'','')  is null THEN  Replace({billingAddress.zip},'','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'','')  END"); //郵便番号
//			  
//			 var prefectures =  new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities},'','') END");
//			 var deliveryResidence = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence},'','') is null THEN Replace({billingAddress.address1},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence},'','') END");
//			 var deliveryResidence2 = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') is null THEN Replace({billingAddress.address2},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') END");
	//
//			 var custrecorddjkkName =  new  nlobjSearchColumn("formulatext").setFormula("CASE WHEN SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},0,40)is null THEN SUBSTR({billingAddress.addressee},0,40) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},0,40) END");
//			 var custrecorddjkkName2 =  new  nlobjSearchColumn("formulatext").setFormula("CASE WHEN SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,40)is null THEN SUBSTR({billingAddress.addressee},41,40) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,40) END");
//			 var deliveryPhoneNumber =  new  nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'','') is null THEN Replace({billingAddress.phone},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'','') END");
			 //var displayname =  new  nlobjSearchColumn("formulatext").setFormula("{item.displayname}");
			 var displayname =  new  nlobjSearchColumn("formulatext").setFormula("{item.custitem_djkk_radioactivity_classifi}");//20230213 changed by zhou  DJ_8_放射性区分
			 //var unit =  new  nlobjSearchColumn("formulatext").setFormula("CASE WHEN {unit} != 'Kg' and {unit} != 'g' THEN {quantity} ELSE 0 END");
			 var quantity =  new  nlobjSearchColumn("formulatext").setFormula("{custcol_djkk_casequantity}");//so.DJ_ケース数
			 //var quantity =  new  nlobjSearchColumn("formulatext").setFormula("CASE WHEN {unit} = 'Kg' THEN {quantity} WHEN {unit} = 'g' THEN {quantity}/1000  ELSE 0  END"); 
			 //var shipDate =  new  nlobjSearchColumn("formulatext").setFormula("to_char({custcol_djkk_ship_date},'yyyymmdd')");
			 var shipDate =  new  nlobjSearchColumn("formulatext").setFormula("to_char({shipdate},'yyyymmdd')");
			 var deliveryDate =  new  nlobjSearchColumn("formulatext").setFormula("to_char({custbody_djkk_delivery_date},'yyyymmdd')"); 
			 var csvCode =  new  nlobjSearchColumn("custrecord_djkk_csv_code","CUSTBODY_DJKK_INCLUD_TIME_NIPON",null);
			 var tranid1 =  new  nlobjSearchColumn("tranid");
			 var tranid2 =  new  nlobjSearchColumn("formulanumeric"); 
			 var tranid3 =  new  nlobjSearchColumn("formulanumeric"); 
			 var tranid4 =  new  nlobjSearchColumn("formulanumeric");
			 var tranid5 =  new  nlobjSearchColumn("formulanumeric");
			 var memo1 =  new  nlobjSearchColumn("formulatext").setFormula("SUBSTR({memo},0,20)");
			 var memo2 =  new  nlobjSearchColumn("formulatext").setFormula("SUBSTR({memo},20,20)");
			 var memo3 =  new  nlobjSearchColumn("formulatext").setFormula("SUBSTR({memo},40,20)"); 
			 var amount =  new  nlobjSearchColumn("amount");
			 var insuredAmount =  new  nlobjSearchColumn("formulatext").setFormula("");

			 var columns = [
				lineNum,
				soid,
//			 	primary_zip_code,
			 	primary_tranid,
			 	primary_temperature_unit,
			 	primary_shipping_date,
//			 	primary_delivery_name,
//			 	primary_address,
			 	primary_delivery_date,
			 	primary_sending_table,
			 	primary_amount,
			 	payment,
			 	primary_total_amount,
			 	primary_insurance,
			 	primary_insurance_premium,
			 	primary_shipping_information,
			 	 displayname,
			     quantity,
			     shipDate,deliveryDate,
			     csvCode,
			     tranid1,
			     tranid2,
			     tranid3,
			     tranid4,
			     tranid5,
			     memo1,
			     memo2,
			     memo3,
			     amount,
			     insuredAmount,
			     
			     delivery,
	   		     customer,
	   		     deliveryPrepare,
	   		     customerPrepare,
	   		     deliveryAddressZip,
	   		     deliveryAddressState,
	   		     deliveryAddressCity,
	   		     deliveryAddress1,
	   		     deliveryAddress2,
	   		     deliveryAddress3,
	   		     deliveryName,
	   		     deliveryNameStr1,
	   		     deliveryNameStr2,
	   		     deliveryAddressPhone,
	   		     billingAddressZip,
	   		     billingAddressState,
	   		     billingAddressCity,
	   		     billingAddress1,
	   		     billingAddress2,
	   		     billingAddress3,
	   		     billingName,
	   		     billingNameStr1,
	   		     billingNameStr2,
	   		     billingAddressPhone
			     ];
			 var searchresults = nlapiSearchRecord("salesorder",null,
			 [
//			 		   ["type","anyof","SalesOrd"], 
//			 		   "AND", 
//			 		   ["itemtype","is","InvtPart"]
			 			filit
			 		], 
			 		columns
			 		);
			 if(searchresults !=null){
			 	for(var i = 0 ; i < searchresults.length; i++){
			 		var deliveryAfter =  defaultEmpty(searchresults[i].getValue(delivery));//SO.納品先
					var customerAfter =  defaultEmpty(searchresults[i].getValue(customer));//SO.顧客
					var deliveryAddressZipAfter = defaultEmpty(searchresults[i].getValue(deliveryAddressZip));//SO.納品先.郵便番号
					var deliveryAddressStateAfter = defaultEmpty(searchresults[i].getValue(deliveryAddressState));//SO.納品先.都道府県
					var deliveryAddressCityAfter = defaultEmpty(searchresults[i].getValue(deliveryAddressCity));//SO.納品先.市区町村
					var deliveryAddress1After = defaultEmpty(searchresults[i].getValue(deliveryAddress1));//SO.納品先.住所1
					var deliveryAddress2After = defaultEmpty(searchresults[i].getValue(deliveryAddress2));//SO.納品先.住所2
					var deliveryAddress3After = defaultEmpty(searchresults[i].getValue(deliveryAddress3));//SO.納品先.住所3
					var deliveryNameAfter = defaultEmpty(searchresults[i].getValue(deliveryName));//SO.納品先..納品先名前
					var deliveryNameStr1After = defaultEmpty(searchresults[i].getValue(deliveryNameStr1));//SO.納品先.納品先名前(0-40)
					var deliveryNameStr2After = defaultEmpty(searchresults[i].getValue(deliveryNameStr2));//SO.納品先.納品先名前(41-80)
					var deliveryAddressPhoneAfter = defaultEmpty(searchresults[i].getValue(deliveryAddressPhone));//SO.納品先.電話番号
					var billingAddressZipAfter = defaultEmpty(searchresults[i].getValue(billingAddressZip));//SO.顧客.郵便番号
					var billingAddressStateAfter = defaultEmpty(searchresults[i].getValue(billingAddressState));//SO.顧客.都道府県
					var billingAddressCityAfter= defaultEmpty(searchresults[i].getValue(billingAddressCity));//SO.顧客.市区町村
					var billingAddress1After = defaultEmpty(searchresults[i].getValue(billingAddress1));//SO.顧客.住所1
					var billingAddress2After = defaultEmpty(searchresults[i].getValue(billingAddress2));//SO.顧客.住所2
					var billingAddress3After = defaultEmpty(searchresults[i].getValue(billingAddress3));//SO.顧客.住所3
					var billingNameAfter = defaultEmpty(searchresults[i].getValue(billingName));//SO.顧客.名前
					var billingNameStr1After = defaultEmpty(searchresults[i].getValue(billingNameStr1));//SO.顧客.名前(0-40)
					var billingNameStr2After = defaultEmpty(searchresults[i].getValue(billingNameStr2));//SO.顧客.名前(41-80)
					var billingAddressPhoneAfter = defaultEmpty(searchresults[i].getValue(billingAddressPhone));//SO.顧客.電話番号
					var deliveryPrepareAfter = defaultEmpty(searchresults[i].getValue(deliveryPrepare));//SO.納品先.送り状に記載備考欄
					var customerPrepareAfter = defaultEmpty(searchresults[i].getValue(customerPrepare));//SO.顧客.送り状に記載備考欄
					if(!isEmpty(deliveryAfter)){
						var  primary_zip_code_after = deliveryAddressZipAfter;
						var  primary_delivery_name_after = deliveryNameAfter;
						var  primary_address_after = deliveryAddressStateAfter+deliveryAddressCityAfter+deliveryAddress1After+deliveryAddress2After+deliveryAddress3After;
				 		var zipAfter = deliveryAddressZipAfter;
				 		var prefecturesAfter = deliveryAddressStateAfter+deliveryAddressCityAfter;
				 		var deliveryResidenceAfter = deliveryAddress1After;
				 		var deliveryResidence2After =deliveryAddress2After;
				 		var custrecorddjkkNameAfter = deliveryNameStr1After;
				 		var custrecorddjkkName2After = deliveryNameStr2After;
				 		var deliveryPhoneNumberAfter = deliveryNameStr2After;
				 		var  primary_sending_table_after = deliveryPrepareAfter;
					}else{
						var  primary_zip_code_after = billingAddressZipAfter;
						var  primary_delivery_name_after = billingNameAfter;
						var  primary_address_after = billingAddressStateAfter+billingAddressCityAfter+billingAddress1After+billingAddress2After+billingAddress3After;
						var zipAfter = billingAddressZipAfter;
				 		var prefecturesAfter = billingAddressStateAfter+billingAddressCityAfter;
				 		var deliveryResidenceAfter = billingAddress1After;
				 		var deliveryResidence2After =billingAddress2After;
				 		var custrecorddjkkNameAfter = billingNameStr1After;
				 		var custrecorddjkkName2After = billingNameStr2After;
				 		var deliveryPhoneNumberAfter = billingAddressPhoneAfter;
				 		var  primary_sending_table_after = customerPrepareAfter;
					}
			 		var displaynameAfter = defaultEmpty(searchresults[i].getValue(displayname));
			 		nlapiLogExecution('debug','displaynameAfter',displaynameAfter)
			 		if(displaynameAfter=='RIA'){
			 			//RIA
			 			displaynameAfter='RI/UN2910' //20230213 changed by zhou
			 		}else if(displaynameAfter=='NON-RIA'){
			 			//NON-RIA
			 			displaynameAfter='NON-RI'//20230213 changed by zhou
			 		}else{
			 			displaynameAfter= '';
			 		}
			 		var quantityAfter = defaultEmpty(searchresults[i].getValue(quantity));// 20230213 changed by zhou
			 		var shipDateAfter = defaultEmpty(searchresults[i].getValue(shipDate));
			 		var deliveryDateAfter = defaultEmpty(searchresults[i].getValue(deliveryDate));
			 		var csvCodeAfter = defaultEmpty(searchresults[i].getValue(csvCode));
			 		var tranid1After = defaultEmpty(searchresults[i].getValue(tranid1));
			 		var tranid2After = defaultEmpty(searchresults[i].getValue(tranid2));
			 		var tranid3After = defaultEmpty(searchresults[i].getValue(tranid3));
			 		var tranid4After = defaultEmpty(searchresults[i].getValue(tranid4));
			 		var tranid5After = defaultEmpty(searchresults[i].getValue(tranid5));
			 		var memo1After = '体外診断薬 ';
			 		var memo2After = '';
			 		var memo3After = '';
			 		var amountAfter = defaultEmpty(searchresults[i].getValue(primary_amount));
			 		var insuredAmountAfter = '';
			 		
			 		//値の取得
			 		//20230213 add by zhou  U046 start 
			 		var primary_tranid_after = searchresults[i].getValue(primary_tranid);
			 		var primary_temperature_unit_after = searchresults[i].getText(primary_temperature_unit);
			 		var primary_shipping_date_after = searchresults[i].getValue(primary_shipping_date);
			 		var primary_freight_company_after = expressType;
			 		var primary_delivery_date_after = searchresults[i].getValue(primary_delivery_date);
			 		var primary_amount_after = searchresults[i].getValue(primary_amount);
			 		
			 		var payment_after = searchresults[i].getValue(payment);
			 		
			 		var primary_total_amount_after = searchresults[i].getValue(primary_total_amount);
			 		var primary_insurance_after = searchresults[i].getValue(primary_insurance);
			 		var primary_insurance_premium_after = searchresults[i].getValue(primary_insurance_premium);
			 		var primary_shipping_information_after = searchresults[i].getValue(primary_shipping_information);
			 		
			 		var lineNum_after = searchresults[i].getValue(lineNum);
			 		var soid_after = searchresults[i].getValue(soid);
			 		var nittsuData = {
			 			lineNum_after:lineNum_after,
			 			soid_after:soid_after,
			 			zipAfter:zipAfter,
			 			 prefecturesAfter:prefecturesAfter,
			 			 deliveryResidenceAfter:deliveryResidenceAfter,
			 			 deliveryResidence2After:deliveryResidence2After,
			 			 custrecorddjkkNameAfter:custrecorddjkkNameAfter,
			 			 custrecorddjkkName2After:custrecorddjkkName2After,
			 			 deliveryPhoneNumberAfter:deliveryPhoneNumberAfter,
			 			 displaynameAfter:displaynameAfter,
			 			 quantityAfter:quantityAfter,
			 			 shipDateAfter:shipDateAfter,
			 			 deliveryDateAfter:deliveryDateAfter,
			 			 csvCodeAfter:csvCodeAfter,
			 			 tranid1After:tranid1After,
			 			 tranid2After:tranid2After,
			 			 tranid3After:tranid3After,
			 			 tranid4After:tranid4After,
			 			 tranid5After:tranid5After,
			 			 memo1After:memo1After,
			 			 memo2After:memo2After,
			 			 memo3After:memo3After,
			 			 amountAfter:amountAfter,
			 			 insuredAmountAfter:insuredAmountAfter,
			 			 
			 			 primary_zip_code_after:primary_zip_code_after,
			 			 primary_tranid_after:primary_tranid_after,
			 			 primary_temperature_unit_after:primary_temperature_unit_after,
			 			 primary_shipping_date_after:primary_shipping_date_after,
			 			 primary_delivery_name_after:primary_delivery_name_after,
			 			 primary_freight_company_after:primary_freight_company_after,
			 			 primary_address_after:primary_address_after,
			 			 primary_delivery_date_after:primary_delivery_date_after,
			 			 primary_sending_table_after:primary_sending_table_after,
			 			 primary_amount_after:primary_amount_after,
			 			 payment_after:payment_after,
			 			 primary_total_amount_after:primary_total_amount_after,
			 			 primary_insurance_after:primary_insurance_after,
			 			 primary_insurance_premium_after:primary_insurance_premium_after,
			 				
			 		}
			 		
			 		var key = primary_tranid_after+primary_temperature_unit_after+primary_shipping_date_after+primary_freight_company_after;
			 		dataArr.push({
			 			key:key,
			 			amount:defaultEmptyToZero(primary_amount_after),
			 			substitution:defaultEmptyToZero(primary_total_amount_after),
			 			insurancePremium:defaultEmptyToZero(primary_insurance_premium_after),
			 			
			 			primary_zip_code_after:primary_zip_code_after,//主要郵便番号
			 			primary_tranid_after:primary_tranid_after,//主要受注番号
			 			primary_temperature_unit_after:primary_temperature_unit_after,//主要温度単位
			 			primary_shipping_date_after:primary_shipping_date_after,//主要出荷日
			 			primary_delivery_name_after:primary_delivery_name_after,//主要DJ_運送会社
			 			primary_freight_company_after:primary_freight_company_after,//主要届け先名
			 			primary_address_after:primary_address_after,//主要お届け先の住所
			 			primary_delivery_date_after:primary_delivery_date_after,//主要納品日
			 			primary_sending_table_after:primary_sending_table_after,//主要送り状備考欄
			 			primary_insurance_after:primary_insurance_after,//主要保険付
			 			
			 			data:nittsuData
			 		}
			 		)
			 	
			 		nlapiLogExecution('DEBUG', 'dataArr', JSON.stringify(dataArr))	
			 		var totalArray = arrayAddDeduplication(dataArr,primary_freight_company_after) //金額を集計し、重複データを除去した後の配列
			 		nlapiLogExecution('DEBUG', 'totalArray', JSON.stringify(totalArray))	
			 		
			 		var dataBatchnumber = guid();
			 		var mainCsvStr = '送り状作成機能データテーブル管理番号,データ,共通id\r\n';
			 		nlapiLogExecution('DEBUG', 'dataBatchnumber', JSON.stringify(dataBatchnumber))
			 		for(var ya= 0 ; ya < totalArray.length;ya++){
			 			var amount = Number(totalArray[ya].amount)
			 		    var substitution = Number(totalArray[ya].substitution)
			 		    var insurancePremium = Number(totalArray[ya].insurancePremium)
			 		     
			 		    var data = JSON.stringify(totalArray[ya].data);
			 			subList.setLineItemValue( 'custpage_mainline_zip_code', ya+1, totalArray[ya].primary_zip_code_after);//主要郵便番号
			 			subList.setLineItemValue( 'custpage_mainline_tranid', ya+1, totalArray[ya].primary_tranid_after);//主要受注番号
			 			subList.setLineItemValue( 'custpage_mainline_temperature_unit', ya+1, totalArray[ya].primary_temperature_unit_after);//主要温度単位
			 			subList.setLineItemValue( 'custpage_mainline_shipping_date', ya+1, totalArray[ya].primary_shipping_date_after);//主要出荷日
			 			subList.setLineItemValue( 'custpage_mainline_freight_company', ya+1, totalArray[ya].primary_freight_company_after);//主要DJ_運送会社
			 			subList.setLineItemValue( 'custpage_mainline_delivery_name', ya+1, totalArray[ya].primary_delivery_name_after);//主要届け先名
			 			subList.setLineItemValue( 'custpage_mainline_address', ya+1, totalArray[ya].primary_address_after);//主要お届け先の住所
			 			subList.setLineItemValue( 'custpage_mainline_delivery_date', ya+1, totalArray[ya].primary_delivery_date_after);//主要納品日
			 			subList.setLineItemValue( 'custpage_mainline_sending_table', ya+1, totalArray[ya].primary_sending_table_after);//主要送り状備考欄
			 			subList.setLineItemValue( 'custpage_mainline_amount', ya+1, amount);//主要金額
			 		
			 			subList.setLineItemValue( 'custpage_mainline_total_amount', ya+1, substitution);//主要代引金額
			 			//			subList.setLineItemValue( 'custpage_mainline_insurance', ya+1, totalArray[ya].primary_insurance_after);//主要保険付
			 			subList.setLineItemValue( 'custpage_mainline_insurance_premium', ya+1, insurancePremium);//主要保険料
			 			//			subList.setLineItemValue( 'custpage_mainline_shipping_information', ya+1, totalArray[ya].primary_shipping_information_after);//主要出荷指示情報(メモ欄)
			 			//end
			 			subList.setLineItemValue( 'custpage_mainline_dataserialnumber', ya+1, totalArray[ya].dataSerialnumber);//送り状作成機能データテーブル管理番号
			 			var newTotalArrayToJson = JSON.stringify(totalArray[ya].data).replace(/\,/g,'FFFFF')
			 			mainCsvStr += totalArray[ya].dataSerialnumber +','+newTotalArrayToJson+'\r\n';
			 		}
			 				
			 		var fieldId = csvMaker(mainCsvStr);
			 		fieldidText.setDefaultValue(fieldId);
			 	}
			 }
		 }else if(expressType == '佐川運輸株式会社'){//SaGaWa
				//20230216 add by zhou start
			 var lineNum = new nlobjSearchColumn("line"); //受注番号
			 var soid  = new nlobjSearchColumn("internalid"); //受注番号
//			var primary_zip_code = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  is null THEN  Replace({customer.billzipcode},'-','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  END"); //郵便番号
			var primary_tranid = new nlobjSearchColumn("tranid"); //受注番号
			var primary_temperature_unit = new nlobjSearchColumn("custcol_djkk_temperature"); //DJ_配送温度
			var primary_shipping_date = new nlobjSearchColumn("shipdate"); //出荷日
			var primary_freight_company = expressType; //DJ_運送会社
//			var primary_delivery_name  = new nlobjSearchColumn("formulatext");//お届け先名
//			primary_delivery_name.setFormula("CASE WHEN {custbody_djkk_delivery_destination.custrecorddjkk_name} is null THEN {billingAddress.addressee} ELSE {custbody_djkk_delivery_destination.custrecorddjkk_name} END");
//			var primary_address  = new nlobjSearchColumn("formulatext");//20230213 changed by zhou   DJ_都道府県 +DJ_市区町村+DJ_納品先住所1+DJ_納品先住所2; //お届け先の住所
//			primary_address.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city}||{billingAddress.address1}||{billingAddress.address2},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') END");
			var primary_delivery_date = new nlobjSearchColumn("custbody_djkk_delivery_date"); //納品日
			var primary_sending_table = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN {custbody_djkk_de_sodeliverermem} is null THEN {custbody_djkk_sodeliverermem} ELSE {custbody_djkk_de_sodeliverermem} END"); //送り状備考欄

			var primary_amount = new nlobjSearchColumn("amount"); //金額
			var payment = new nlobjSearchColumn("custbody_djkk_payment_conditions");//支払条件
			var primary_total_amount = new nlobjSearchColumn("amount"); //代引合計金額
			var primary_insurance = new nlobjSearchColumn("formulatext"); //保険付
			var primary_insurance_premium = new nlobjSearchColumn("custcolcustbody_djkk_guarantee_fund"); //保険料
			var primary_shipping_information = new nlobjSearchColumn("memo"); //出荷指示情報(メモ欄)
			//end
			
			var delivery =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//SO.納品先
			 var customer =  new nlobjSearchColumn("entity");//SO.顧客
			 var deliveryPrepare = new nlobjSearchColumn("custbody_djkk_de_sodeliverermem"); //DJ_納品先送り状に記載備考欄
			 var customerPrepare = new nlobjSearchColumn("custbody_djkk_sodeliverermem"); //DJ_顧客送り状に記載備考欄
			 var deliveryAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')");//SO.納品先.郵便番号
			 var deliveryAddressState = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_prefectures}");//SO.納品先.都道府県
			 var deliveryAddressCity = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}");//SO.納品先.市区町村
			 var deliveryAddress1 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}");//SO.納品先.住所1
			 var deliveryAddress2 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable}");//SO.納品先.住所2
			 var deliveryAddress3 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2}");//SO.納品先.住所3
			 var deliveryName = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecorddjkk_name}");//SO.納品先.納品先名前
			 var deliveryNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},0,16)");//SO.納品先.納品先名前(0-16)
			 var deliveryNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},16,16)");//SO.納品先.納品先名前(16-32)
			 var deliveryAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text}");//SO.納品先.電話番号
			 var billingAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({billingAddress.zip},'-','')");//SO.顧客.郵便番号
			 var billingAddressState = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.custrecord_djkk_address_state}");//SO.顧客.都道府県
			 var billingAddressCity= new nlobjSearchColumn("formulatext").setFormula("{billingAddress.city}");//SO.顧客.市区町村
			 var billingAddress1 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address1}");//SO.顧客.住所1
			 var billingAddress2 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address2}");//SO.顧客.住所2
			 var billingAddress3 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address3}");//SO.顧客.住所3
			 var billingName = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.addressee}");//SO.顧客.(0-40)
			 var billingNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},0,16)");//SO.顧客.(0-16)
			 var billingNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},16,16)");//SO.顧客.(16-16)
			 var billingAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.phone}");//SO.顧客.電話番号
			
				var before_custpage_delivery_code_acquisition_classification = new nlobjSearchColumn("formulanumeric");
				var before_custpage_delivery_code = new nlobjSearchColumn("formulanumeric");
//				var before_custpage_delivery_phone_number = new nlobjSearchColumn("formulatext");
//				before_custpage_delivery_phone_number.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'+','') is null THEN Replace({billingAddress.phone},'+','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'+','') END");
			//		setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'+',''）is null THEN Replace({customer.addressphone},'+',''）ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'+',''）END");
//				var before_custpage_delivery_zip_code = new nlobjSearchColumn("formulatext");
//					before_custpage_delivery_zip_code.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  is null THEN  Replace({customer.billzipcode},'-','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  END");
				
					
//					var before_custpage_delivery_address_1 = new nlobjSearchColumn("formulatext");
//					before_custpage_delivery_address_1.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities},'','') END");//20230213 changed by zhou   DJ_都道府県+ DJ_市区町村
//				var before_custpage_delivery_address_2 =  new nlobjSearchColumn("formulatext");
//					before_custpage_delivery_address_2.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence},'','') is null THEN Replace({billingAddress.address1},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence},'','') END");//20230213 changed by zhou  DJ_納品先住所1
//				var before_custpage_delivery_address_3 = new nlobjSearchColumn("formulatext");
//					before_custpage_delivery_address_3.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2},'','') is null THEN Replace({billingAddress.address2}||{billingAddress.address3},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2},'','') END");//20230213 changed by zhou  DJ_納品先住所2 +DJ_納品先住所3
				
					
//					var before_custpage_delivery_name_1 = new nlobjSearchColumn("formulatext");
////					before_custpage_delivery_name_1.setFormula("CASE WHEN  SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 0, 16) is null THEN SUBSTR({billingAddress.addressee}, 0, 16) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 0, 16)) END");
//					before_custpage_delivery_name_1.setFormula("CASE WHEN SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 0, 16) is null THEN SUBSTR({billingAddress.addressee}, 0, 16) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 0, 16) END");
					
//					var before_custpage_delivery_name_2 = new nlobjSearchColumn("formulatext");
//					before_custpage_delivery_name_2.setFormula("CASE WHEN SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 16, 16) is null THEN SUBSTR({billingAddress.addressee}, 16, 16) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 16, 16) END");//20230213 changed by zhou SO.納品先の宛先（部門）＋連絡先
				var before_custpage_delivery_name_3 = new nlobjSearchColumn("custcol_djkk_customer_order_number");//20230213 changed by zhou  お客様管理番号  顧客の発注番号
//						before_custpage_delivery_name_3.setFormula("{custcol_djkk_customer_order_numbers}");//20230213 changed by zhou  お客様管理番号  顧客の発注番号
				var before_custpage_customer_code = new nlobjSearchColumn("formulanumeric");
					before_custpage_customer_code.setFormula("140303000000"); // 20230213 changed by zhou   連絡子会社の荷送人先コード
			
				var before_custpage_person_in_charge_code_acquisition_segment = new nlobjSearchColumn("formulanumeric");
				var before_custpage_person_in_charge_code = new nlobjSearchColumn("formulatext");
				before_custpage_person_in_charge_code.setFormula("{department.name}");//20230213 changed by zhou SO.ヘッダーセクションコード
				var before_custpage_person_in_charge_name = new nlobjSearchColumn("formulatext");
				before_custpage_person_in_charge_name.setFormula("{department.name}||' '||{salesrep.entityid}");//20230213 changed by zhou SO.ヘッダーセクション名＋営業名
				var before_custpage_shipper_tel = new nlobjSearchColumn("formulatext").setFormula("{salesRep.phone}");//20230213 changed by zhou 荷送人電話番号  =>営業の電話番号
				var before_custpage_requester_code_acquisiton_segment = new nlobjSearchColumn("formulanumeric");
				var before_custpage_requester_code = new nlobjSearchColumn("formulatext");
				var before_custpage_requester_tel =  new nlobjSearchColumn("formulatext");
				before_custpage_requester_tel.setFormula("{salesRep.phone}");//20230213 changed by zhou 営業の電話番号
				var before_custpage_requester_fax = new nlobjSearchColumn("formulatext");
				before_custpage_requester_fax.setFormula("{subsidiary.zip}");
				
				
					var before_custpage_requester_address_1 = new nlobjSearchColumn("formulatext");
				before_custpage_requester_address_1.setFormula("{subsidiary.state}||{subsidiary.city}||{subsidiary.address1}");
				var before_custpage_requester_address_2 = new nlobjSearchColumn("formulatext");
				before_custpage_requester_address_2.setFormula("{subsidiary.address2}||{subsidiary.address3}");//20230213 changed by zhou 連絡子会社の住所（Address2+3
				var before_custpage_requester_name_1 = new nlobjSearchColumn("formulatext");
				before_custpage_requester_name_1.setFormula("{subsidiary.legalname}")
				var before_custpage_requester_name_2 = new nlobjSearchColumn("formulatext");
				before_custpage_requester_name_2.setFormula("");
				
				
				
//					var before_custpage_packing_figure = new nlobjSearchColumn("custbody_djkk_cargo");//荷姿  20230213 changed by zhou
				var before_custpage_item_name_1 = new nlobjSearchColumn("formulatext");
					before_custpage_item_name_1.setFormula("SUBSTR({item.custitem_djkk_product_group}, 0, 25)");//品名 20230213 changed by zhou SO.行の商品グループ  
				var before_custpage_item_name_2 = new nlobjSearchColumn("custcol_djkk_temperature");//品名2 20230213 changed by zhou SO.配送温度
				var before_custpage_item_name_3 = new nlobjSearchColumn("formulatext");
					before_custpage_item_name_3.setFormula("");//品名3  20230213 changed by zhou  空白
				var before_custpage_item_name_4 = new nlobjSearchColumn("tranid");//品名4  20230213 changed by zhou  受注番号（参照用）
				var before_custpage_item_name_5 = new nlobjSearchColumn("formulatext");
					before_custpage_item_name_5.setFormula("");//品名5  20230213 changed by zhou  空白
					
				var before_item_perunitquantity = new nlobjSearchColumn("formulatext").setFormula("{item.custitem_djkk_perunitquantity}");// 20230213 changed by zhou ITEM DJ_入り数(入り目) 
				var before_custpage_label_packing_figure = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_1 = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_2 = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_3 = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_4 = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_5 = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_6 = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_7 = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_8 = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_9 = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_10 = new nlobjSearchColumn("formulatext");
				var before_custpage_label_item_name_11 = new nlobjSearchColumn("formulatext");
				var before_custpage_shipments_number = new nlobjSearchColumn("quantity");
				var before_custpage_djkk_casequantity= new nlobjSearchColumn("custcol_djkk_casequantity");
				var before_custpage_speed_designation = new nlobjSearchColumn("formulatext");//スピード指定
				before_custpage_speed_designation.setFormula("000");
				var before_custpage_cool_flight_designation = new nlobjSearchColumn("formulatext").setFormula("{custcol_djkk_temperature.custrecord_djkk_shipping_temperature_id}");//SO.配送温度
				var before_custpage_delivery_date = new nlobjSearchColumn("custbody_djkk_delivery_date");
				var before_custpage_delivery_time_zone = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_time_zone.custrecord_djkk_csv_name}");//DJ_配達指定時間帯(佐川運輸株式会社用)
				var before_custpage_delivery_specified_time = new nlobjSearchColumn("custbody_djkk_delivery_time");
//					var before_custpage_on_delivery_amount = new nlobjSearchColumn("custcolcustbody_djkk_quoted_amount");
				var before_custpage_on_delivery_amount = new nlobjSearchColumn("amount");//代引金額
				var before_custpage_consumption_tax = new nlobjSearchColumn("taxamount");//消費税
				var before_custpage_settlement_type = new nlobjSearchColumn("formulatext");
				before_custpage_settlement_type.setFormula("");
				var before_custpage_insurance_amount = new nlobjSearchColumn("custcolcustbody_djkk_guarantee_fund");
				var before_custpage_designatied_seal_1 = new nlobjSearchColumn("formulatext");
				var before_custpage_designatied_seal_2 = new nlobjSearchColumn("formulatext");
				var before_custpage_designatied_seal_3 = new nlobjSearchColumn("formulatext");
				var before_custpage_sales_office_pickup = new nlobjSearchColumn("formulatext");
				var before_custpage_src_segmentation = new nlobjSearchColumn("formulatext");
				var before_custpage_sales_office_receipt_office_code = new nlobjSearchColumn("formulatext");
				var before_custpage_original_arrival_category = new nlobjSearchColumn("formulatext");
				var before_custpage_email_address = new nlobjSearchColumn("formulatext");
				var before_custpage_out_of_office_contact_information = new nlobjSearchColumn("formulatext");
				var before_custpage_ship_date =  new nlobjSearchColumn("formulatext");//20230213 changed by zhou SO.出荷日
					before_custpage_ship_date.setFormula("to_char({shipdate},'yyyymmdd')");//20230213 changed by zhou SO.出荷日
				var before_custpage_inquiry_invoice_no = new nlobjSearchColumn("formulatext");
				var before_custpage_shipping_site_printing_classification =  new nlobjSearchColumn("formulatext");
					before_custpage_shipping_site_printing_classification.setFormula("0");
				var before_custpage_unaggregated_designation = new nlobjSearchColumn("formulatext");
					before_custpage_unaggregated_designation.setFormula("0");
				var before_custpage_edit_01 = new nlobjSearchColumn("formulatext");
				var before_custpage_edit_02 = new nlobjSearchColumn("formulatext");
				var before_custpage_edit_03 = new nlobjSearchColumn("formulatext");
				var before_custpage_edit_04 = new nlobjSearchColumn("formulatext");
				var before_custpage_edit_05 = new nlobjSearchColumn("formulatext");
				var before_custpage_edit_06 = new nlobjSearchColumn("formulatext");
				var before_custpage_edit_07 = new nlobjSearchColumn("formulatext");
				var before_custpage_edit_08 = new nlobjSearchColumn("formulatext");
				var before_custpage_edit_09 = new nlobjSearchColumn("formulatext");
				var before_custpage_edit_10 = new nlobjSearchColumn("formulatext");
					
				var sagawaInfo = [
							//20230213 add by zhou  U046 start 
							lineNum,
		                   soid,
//							primary_zip_code,
							primary_tranid,
							primary_temperature_unit,
							primary_shipping_date,
//							    primary_freight_company,
//							primary_delivery_name,
//							primary_address,
							primary_delivery_date,
							primary_sending_table,
							primary_amount,
							payment,
							primary_total_amount,
							primary_insurance,
							primary_insurance_premium,
							primary_shipping_information,
							//end
							
							delivery,
				   		     customer,
				   		     deliveryPrepare,
				   		     customerPrepare,
				   		     deliveryAddressZip,
				   		     deliveryAddressState,
				   		     deliveryAddressCity,
				   		     deliveryAddress1,
				   		     deliveryAddress2,
				   		     deliveryAddress3,
				   		     deliveryName,
				   		     deliveryNameStr1,
				   		     deliveryNameStr2,
				   		     deliveryAddressPhone,
				   		     billingAddressZip,
				   		     billingAddressState,
				   		     billingAddressCity,
				   		     billingAddress1,
				   		     billingAddress2,
				   		     billingAddress3,
				   		     billingName,
				   		     billingNameStr1,
				   		     billingNameStr2,
				   		     billingAddressPhone,
							
				              before_custpage_delivery_code_acquisition_classification,
				              before_custpage_delivery_code,
//				              before_custpage_delivery_phone_number,
//				              before_custpage_delivery_zip_code,
//				              before_custpage_delivery_address_1,
//				              before_custpage_delivery_address_2,
//				              before_custpage_delivery_address_3,
//				              before_custpage_delivery_name_1,
//				              before_custpage_delivery_name_2,
				              before_custpage_delivery_name_3,
				              before_custpage_customer_code,
				              before_custpage_person_in_charge_code_acquisition_segment,
				              before_custpage_person_in_charge_code,
				              before_custpage_person_in_charge_name,
				              before_custpage_shipper_tel,
				              before_custpage_requester_code_acquisiton_segment,
				              before_custpage_requester_code,
				              before_custpage_requester_tel,
				              before_custpage_requester_fax,
				              before_custpage_requester_address_1,
				              before_custpage_requester_address_2,
				              before_custpage_requester_name_1,
				              before_custpage_requester_name_2,
				              before_custpage_item_name_1,
				              before_custpage_item_name_2,
				              before_custpage_item_name_3,
				              before_custpage_item_name_4,
				              before_custpage_item_name_5,
				              before_custpage_label_packing_figure,
				              before_custpage_label_item_name_1,
				              before_custpage_label_item_name_2,
				              before_custpage_label_item_name_3,
				              before_custpage_label_item_name_4,
				              before_custpage_label_item_name_5,
				              before_custpage_label_item_name_6,
				              before_custpage_label_item_name_7,
				              before_custpage_label_item_name_8,
				              before_custpage_label_item_name_9,
				              before_custpage_label_item_name_10,
				              before_custpage_label_item_name_11,
				              before_custpage_shipments_number,
				              before_custpage_djkk_casequantity,
				              before_item_perunitquantity,
				              before_custpage_speed_designation,
				              before_custpage_cool_flight_designation,
				              before_custpage_delivery_date,
				              before_custpage_delivery_time_zone,
				              before_custpage_delivery_specified_time,
				              before_custpage_on_delivery_amount,
				              before_custpage_consumption_tax,
				              before_custpage_settlement_type,
				              before_custpage_insurance_amount,
				              before_custpage_designatied_seal_1,
				              before_custpage_designatied_seal_2,
				              before_custpage_designatied_seal_3,
				              before_custpage_sales_office_pickup,
				              before_custpage_src_segmentation,
				              before_custpage_sales_office_receipt_office_code,
				              before_custpage_original_arrival_category,
				              before_custpage_email_address,
				              before_custpage_out_of_office_contact_information,
				              before_custpage_ship_date,
				              before_custpage_inquiry_invoice_no,
				              before_custpage_shipping_site_printing_classification,
				              before_custpage_unaggregated_designation,
				              before_custpage_edit_01,
				              before_custpage_edit_02,
				              before_custpage_edit_03,
				              before_custpage_edit_04,
				              before_custpage_edit_05,
				              before_custpage_edit_06,
				              before_custpage_edit_07,
				              before_custpage_edit_08,
				              before_custpage_edit_09,
				              before_custpage_edit_10
				              ]
				
				var salesorderSearch = nlapiSearchRecord("salesorder",null,
						[
							filit
						], 
						
						 sagawaInfo
						
						);
				if(salesorderSearch != null){
				for(var i = 0 ; i < salesorderSearch.length ;i++){
					
					var deliveryAfter =  defaultEmpty(salesorderSearch[i].getValue(delivery));//SO.納品先
					var customerAfter =  defaultEmpty(salesorderSearch[i].getValue(customer));//SO.顧客
					var deliveryAddressZipAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressZip));//SO.納品先.郵便番号
					var deliveryAddressStateAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressState));//SO.納品先.都道府県
					var deliveryAddressCityAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressCity));//SO.納品先.市区町村
					var deliveryAddress1After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress1));//SO.納品先.住所1
					var deliveryAddress2After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress2));//SO.納品先.住所2
					var deliveryAddress3After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress3));//SO.納品先.住所3
					var deliveryNameAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryName));//SO.納品先..納品先名前
					var deliveryNameStr1After = defaultEmpty(salesorderSearch[i].getValue(deliveryNameStr1));//SO.納品先.納品先名前(0-16)
					var deliveryNameStr2After = defaultEmpty(salesorderSearch[i].getValue(deliveryNameStr2));//SO.納品先.納品先名前(16-16)
					var deliveryAddressPhoneAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressPhone));//SO.納品先.電話番号
					var billingAddressZipAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressZip));//SO.顧客.郵便番号
					var billingAddressStateAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressState));//SO.顧客.都道府県
					var billingAddressCityAfter= defaultEmpty(salesorderSearch[i].getValue(billingAddressCity));//SO.顧客.市区町村
					var billingAddress1After = defaultEmpty(salesorderSearch[i].getValue(billingAddress1));//SO.顧客.住所1
					var billingAddress2After = defaultEmpty(salesorderSearch[i].getValue(billingAddress2));//SO.顧客.住所2
					var billingAddress3After = defaultEmpty(salesorderSearch[i].getValue(billingAddress3));//SO.顧客.住所3
					var billingNameAfter = defaultEmpty(salesorderSearch[i].getValue(billingName));//SO.顧客.名前
					var billingNameStr1After = defaultEmpty(salesorderSearch[i].getValue(billingNameStr1));//SO.顧客.名前(0-16)
					var billingNameStr2After = defaultEmpty(salesorderSearch[i].getValue(billingNameStr2));//SO.顧客.名前(16-16)
					var billingAddressPhoneAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressPhone));//SO.顧客.電話番号
					var deliveryPrepareAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryPrepare));//SO.納品先.送り状に記載備考欄
					var customerPrepareAfter = defaultEmpty(salesorderSearch[i].getValue(customerPrepare));//SO.顧客.送り状に記載備考欄
					if(!isEmpty(deliveryAfter)){
						var  primary_zip_code_after = deliveryAddressZipAfter;
						var  primary_delivery_name_after = deliveryNameAfter;
						var  primary_address_after = deliveryAddressStateAfter+deliveryAddressCityAfter+deliveryAddress1After+deliveryAddress2After+deliveryAddress3After;
						var custpage_delivery_phone_number = deliveryAddressPhoneAfter;
						var custpage_delivery_zip_code = deliveryAddressZipAfter;
						var custpage_delivery_address_1 = deliveryAddressStateAfter+deliveryAddressCityAfter;
						var custpage_delivery_address_2 = deliveryAddress1After;
						var custpage_delivery_address_3 = deliveryAddress2After+deliveryAddress3After;;
						var custpage_delivery_name_1 = deliveryNameStr1After;
						var custpage_delivery_name_2 = deliveryNameStr2After;
						var  primary_sending_table_after = deliveryPrepareAfter;
					}else{
						var  primary_zip_code_after = billingAddressZipAfter;
						var  primary_delivery_name_after = billingNameAfter;
						var  primary_address_after = billingAddressStateAfter+billingAddressCityAfter+billingAddress1After+billingAddress2After+billingAddress3After;
						var custpage_delivery_phone_number = billingAddressPhoneAfter;
						var custpage_delivery_zip_code = billingAddressZipAfter;
						var custpage_delivery_address_1 = billingAddressStateAfter+billingAddressCityAfter;
						var custpage_delivery_address_2 = billingAddress1After;
						var custpage_delivery_address_3 = billingAddress2After+billingAddress3After;
						var custpage_delivery_name_1 = billingNameStr1After;
						var custpage_delivery_name_2 = billingNameStr2After;
						var  primary_sending_table_after = customerPrepareAfter;
					}
					
					
					
					var lineNum_after = salesorderSearch[i].getValue(lineNum);
					var soid_after = salesorderSearch[i].getValue(soid);
					var custpage_delivery_code_acquisition_classification = '';
					var custpage_delivery_code = '';
					
					var custpage_delivery_name_3 = salesorderSearch[i].getValue(before_custpage_delivery_name_3);
					var custpage_customer_code = '';//お客様コード 
					if(clubValue==SUB_DPKK){
						custpage_customer_code = '118017220113';//お客様コード 
					}else if(clubValue==SUB_SCETI){
						custpage_customer_code = '118017000000';//お客様コード 
					}
					var custpage_person_in_charge_code_acquisition_segment = '';
					var custpage_person_in_charge_code = '';
					var custpage_person_in_charge_name = '';
					var custpage_shipper_tel = salesorderSearch[i].getValue(before_custpage_shipper_tel);
					var custpage_requester_code_acquisiton_segment = '';
					var custpage_requester_code = '';
					var custpage_requester_tel = salesorderSearch[i].getValue(before_custpage_requester_tel);
					var custpage_requester_fax = salesorderSearch[i].getValue(before_custpage_requester_fax);
					var custpage_requester_address_1 = salesorderSearch[i].getValue(before_custpage_requester_address_1);
					var custpage_requester_address_2 = salesorderSearch[i].getValue(before_custpage_requester_address_2);
					var custpage_requester_name_1 = salesorderSearch[i].getValue(before_custpage_requester_name_1);
					var custpage_requester_name_2 = salesorderSearch[i].getValue(before_custpage_requester_name_2);
					var custpage_item_name_1 = salesorderSearch[i].getValue(before_custpage_item_name_1);
					var custpage_item_name_2 = salesorderSearch[i].getText(before_custpage_item_name_2);
					var custpage_item_name_3 = salesorderSearch[i].getValue(before_custpage_item_name_3);
					var custpage_item_name_4 = salesorderSearch[i].getValue(before_custpage_item_name_4);
					var custpage_item_name_5 = salesorderSearch[i].getValue(before_custpage_item_name_5);
					var custpage_label_packing_figure = '';
					var custpage_label_item_name_1 = '';
					var custpage_label_item_name_2 = '';
					var custpage_label_item_name_3 = '';
					var custpage_label_item_name_4 = '';
					var custpage_label_item_name_5 = '';
					var custpage_label_item_name_6 = '';
					var custpage_label_item_name_7 = '';
					var custpage_label_item_name_8 = '';
					var custpage_label_item_name_9 = '';
					var custpage_label_item_name_10 = '';
					var custpage_label_item_name_11 = '';
					var custpage_djkk_casequantity = Number(salesorderSearch[i].getValue(before_custpage_djkk_casequantity));// 20230213 changed by zhou SO  DJ_ケース数
					var custpage_shipments_number = Number(salesorderSearch[i].getValue(before_custpage_shipments_number));// 20230213 changed by zhou SO数量
					var item_perunitquantity = Number(salesorderSearch[i].getValue(before_item_perunitquantity));// 20230213 changed by zhou ITEM DJ_入り数(入り目) 
					var custpage_speed_designation = salesorderSearch[i].getValue(before_custpage_speed_designation);//スピード指定
					var custpage_cool_flight_designation = salesorderSearch[i].getValue(before_custpage_cool_flight_designation);
					var custpage_delivery_date = salesorderSearch[i].getValue(before_custpage_delivery_date);
					var custpage_delivery_time_zone = salesorderSearch[i].getValue(before_custpage_delivery_time_zone);
					var custpage_delivery_specified_time = salesorderSearch[i].getValue(before_custpage_delivery_specified_time);
					var custpage_on_delivery_amount = salesorderSearch[i].getValue(before_custpage_on_delivery_amount);
					var custpage_consumption_tax = salesorderSearch[i].getValue(before_custpage_consumption_tax);
					var custpage_settlement_type = '0';//「0」(：指定なし)を入力
					var custpage_insurance_amount = salesorderSearch[i].getValue(primary_insurance_premium);//so明細行.保険金
					var custpage_designatied_seal_1 = '';
					var custpage_designatied_seal_2 = '';
					var custpage_designatied_seal_3 = '';
					var custpage_sales_office_pickup = '';
					var custpage_src_segmentation = salesorderSearch[i].getValue(before_custpage_src_segmentation);
					var custpage_sales_office_receipt_office_code = '7-542';
					var custpage_original_arrival_category = '';
					var custpage_email_address = '';
					var custpage_out_of_office_contact_information = '';
					var custpage_ship_date = salesorderSearch[i].getValue(before_custpage_ship_date);
					var custpage_inquiry_invoice_no = '';
					var custpage_shipping_site_printing_classification = salesorderSearch[i].getValue(before_custpage_shipping_site_printing_classification);
					var custpage_unaggregated_designation = salesorderSearch[i].getValue(before_custpage_unaggregated_designation);
					var custpage_edit_01 = '';
					var custpage_edit_02 = '';
					var custpage_edit_03 = '';
					var custpage_edit_04 = '';
					var custpage_edit_05 = '';
					
					var custpage_edit_06 = '';
					var custpage_edit_07 = '';
					var custpage_edit_08 = '';
					var custpage_edit_09 = '';
					var custpage_edit_10 = '';
					
					
					//値の取得
					//20230213 add by zhou  U046 start 
					var  primary_tranid_after = salesorderSearch[i].getValue(primary_tranid);
					var  primary_temperature_unit_after = salesorderSearch[i].getText(primary_temperature_unit);
					var  primary_shipping_date_after = salesorderSearch[i].getValue(primary_shipping_date);
					var  primary_freight_company_after = expressType;
					var  primary_delivery_date_after = salesorderSearch[i].getValue(primary_delivery_date);
					var  primary_amount_after = salesorderSearch[i].getValue(primary_amount);
					
					var  payment_after = salesorderSearch[i].getValue(payment);
					
					var  primary_total_amount_after = salesorderSearch[i].getValue(primary_total_amount);
					if(payment_after != '1'){
						primary_total_amount_after = 0 ;
						custpage_on_delivery_amount = 0;
					}
					var  primary_insurance_after = salesorderSearch[i].getValue(primary_insurance);
					var  primary_insurance_premium_after = salesorderSearch[i].getValue(primary_insurance_premium);
					var  primary_shipping_information_after = salesorderSearch[i].getValue(primary_shipping_information);
					
					var sagawaData = {
						  lineNum_after:lineNum_after,
						  soid_after:soid_after,
						  primary_zip_code_after:primary_zip_code_after,
						  primary_tranid_after:primary_tranid_after,
						  primary_temperature_unit_after:primary_temperature_unit_after,
						  primary_shipping_date_after:primary_shipping_date_after,
						  primary_delivery_name_after:primary_delivery_name_after,
						  primary_address_after:primary_address_after,
						  primary_delivery_date_after:primary_delivery_date_after,
						  primary_sending_table_after:primary_sending_table_after,
						  primary_amount_after:primary_amount_after,
						  payment_after:payment_after,
						  primary_total_amount_after:primary_total_amount_after,
						  primary_insurance_after:primary_insurance_after,
						  primary_insurance_premium_after:primary_insurance_premium_after,
						  primary_shipping_information_after:primary_shipping_information_after,
						  
						  custpage_delivery_code_acquisition_classification_after:custpage_delivery_code_acquisition_classification,
						  custpage_delivery_code_after:custpage_delivery_code,
						  custpage_delivery_phone_number_after:custpage_delivery_phone_number,
						  custpage_delivery_zip_code_after:custpage_delivery_zip_code,
						  custpage_delivery_address_1_after:custpage_delivery_address_1,
						  custpage_delivery_address_2_after:custpage_delivery_address_2,
						  custpage_delivery_address_3_after:custpage_delivery_address_3,
						  custpage_delivery_name_1_after:custpage_delivery_name_1,
						  custpage_delivery_name_2_after:custpage_delivery_name_2,
						  custpage_delivery_name_3_after:custpage_delivery_name_3,
						  custpage_customer_code_after:custpage_customer_code,
						  custpage_person_in_charge_code_acquisition_segment_after:custpage_person_in_charge_code_acquisition_segment,
						  custpage_person_in_charge_code_after:custpage_person_in_charge_code,
						  custpage_person_in_charge_name_after:custpage_person_in_charge_name,
						  custpage_shipper_tel_after:custpage_shipper_tel,
						  custpage_requester_code_acquisiton_segment_after:custpage_requester_code_acquisiton_segment,
						  custpage_requester_code_after:custpage_requester_code,
						  custpage_requester_tel_after:custpage_requester_tel,
						  custpage_requester_fax_after:custpage_requester_fax,
						  custpage_requester_address_1_after:custpage_requester_address_1,
						  custpage_requester_address_2_after:custpage_requester_address_2,
						  custpage_requester_name_1_after:custpage_requester_name_1,
						  custpage_requester_name_2_after:custpage_requester_name_2,
						  custpage_item_name_1_after:custpage_item_name_1,
						  custpage_item_name_2_after:custpage_item_name_2,
						  custpage_item_name_3_after:custpage_item_name_3,
						  custpage_item_name_4_after:custpage_item_name_4,
						  custpage_item_name_5_after:custpage_item_name_5,
						  custpage_label_packing_figure_after:custpage_label_packing_figure,
						  custpage_label_item_name_1_after:custpage_label_item_name_1,
						  custpage_label_item_name_2_after:custpage_label_item_name_2,
						  custpage_label_item_name_3_after:custpage_label_item_name_3,
						  custpage_label_item_name_4_after:custpage_label_item_name_4,
						  custpage_label_item_name_5_after:custpage_label_item_name_5,
						  custpage_label_item_name_6_after:custpage_label_item_name_6,
						  custpage_label_item_name_7_after:custpage_label_item_name_7,
						  custpage_label_item_name_8_after:custpage_label_item_name_8,
						  custpage_label_item_name_9_after:custpage_label_item_name_9,
						  custpage_label_item_name_10_after:custpage_label_item_name_10,
						  custpage_label_item_name_11_after:custpage_label_item_name_11,
						  custpage_shipments_number_after:custpage_shipments_number,
						  custpage_djkk_casequantity_after:custpage_djkk_casequantity,
						  item_perunitquantity_after:item_perunitquantity,
						  custpage_speed_designation_after:custpage_speed_designation,
						  custpage_cool_flight_designation_after:custpage_cool_flight_designation,
						  custpage_delivery_date_after:custpage_delivery_date,
						  custpage_delivery_time_zone_after:custpage_delivery_time_zone,
						  custpage_delivery_specified_time_after:custpage_delivery_specified_time,
						  custpage_on_delivery_amount_after:custpage_on_delivery_amount,
						  custpage_consumption_tax_after:custpage_consumption_tax,
						  custpage_settlement_type_after:custpage_settlement_type,
						  custpage_insurance_amount_after:custpage_insurance_amount,
						  custpage_designatied_seal_1_after:custpage_designatied_seal_1,
						  custpage_designatied_seal_2_after:custpage_designatied_seal_2,
						  custpage_designatied_seal_3_after:custpage_designatied_seal_3,
						  custpage_sales_office_pickup_after:custpage_sales_office_pickup,
						  custpage_src_segmentation_after:custpage_src_segmentation,
						  custpage_sales_office_receipt_office_code_after:custpage_sales_office_receipt_office_code,
						  custpage_original_arrival_category_after:custpage_original_arrival_category,
						  custpage_email_address_after:custpage_email_address,
						  custpage_out_of_office_contact_information_after:custpage_out_of_office_contact_information,
						  custpage_ship_date_after:custpage_ship_date,
						  custpage_inquiry_invoice_no_after:custpage_inquiry_invoice_no,
						  custpage_shipping_site_printing_classification_after:custpage_shipping_site_printing_classification,
						  custpage_unaggregated_designation_after:custpage_unaggregated_designation,
						  custpage_edit_01_after:custpage_edit_01,
						  custpage_edit_02_after:custpage_edit_02,
						  custpage_edit_03_after:custpage_edit_03,
						  custpage_edit_04_after:custpage_edit_04,
						  custpage_edit_05_after:custpage_edit_05,
						  custpage_edit_06_after:custpage_edit_06,
						  custpage_edit_07_after:custpage_edit_07,
						  custpage_edit_08_after:custpage_edit_08,
						  custpage_edit_09_after:custpage_edit_09,
						  custpage_edit_10_after:custpage_edit_10
					}
					
					var key = primary_tranid_after+primary_temperature_unit_after+primary_shipping_date_after+primary_freight_company_after;
					dataArr.push({
						key:key,
						amount:defaultEmptyToZero(primary_amount_after),
						substitution:defaultEmptyToZero(primary_total_amount_after),
						insurancePremium:defaultEmptyToZero(primary_insurance_premium_after),
						
						primary_zip_code_after:primary_zip_code_after,//主要郵便番号
						primary_tranid_after:primary_tranid_after,//主要受注番号
						primary_temperature_unit_after:primary_temperature_unit_after,//主要温度単位
						primary_shipping_date_after:primary_shipping_date_after,//主要出荷日
						primary_delivery_name_after:primary_delivery_name_after,//主要DJ_運送会社
						primary_freight_company_after:primary_freight_company_after,//主要届け先名
						primary_address_after:primary_address_after,//主要お届け先の住所
						primary_delivery_date_after:primary_delivery_date_after,//主要納品日
						primary_sending_table_after:primary_sending_table_after,//主要送り状備考欄
						primary_insurance_after:primary_insurance_after,//主要保険付
						primary_shipping_information_after:primary_shipping_information_after,//主要出荷指示情報(メモ欄)
						
						custpage_speed_designation_after:custpage_speed_designation,//スピード指定
						custpage_delivery_specified_time_after:custpage_delivery_specified_time,//配達指定時間（時分）
//							custpage_designatied_seal_1_after:custpage_designatied_seal_1,//指定シール１
						custpage_sales_office_pickup_after:custpage_sales_office_pickup,//営業所受取
						custpage_src_segmentation_after:custpage_src_segmentation,//SRC区分
						custpage_original_arrival_category_after:custpage_original_arrival_category,//元着区分
						data:sagawaData
					})
				}
				nlapiLogExecution('DEBUG', 'dataArr', JSON.stringify(dataArr))	
				var totalArray  = arrayAddDeduplication(dataArr,primary_freight_company_after) //金額を集計し、重複データを除去した後の配列
				nlapiLogExecution('DEBUG', 'totalArray', JSON.stringify(totalArray))	
				var dataBatchnumber = guid();
				var mainCsvStr = '送り状作成機能データテーブル管理番号,データ,共通id\r\n';
				for(var ya= 0 ; ya < totalArray.length;ya++){
					var amount = Number(totalArray[ya].amount)
			        var substitution = Number(totalArray[ya].substitution)
			        var insurancePremium = Number(totalArray[ya].insurancePremium)
			        
			        var data = JSON.stringify(totalArray[ya].data);
					subList.setLineItemValue( 'custpage_mainline_zip_code', ya+1, totalArray[ya].primary_zip_code_after);//主要郵便番号
					subList.setLineItemValue( 'custpage_mainline_tranid', ya+1, totalArray[ya].primary_tranid_after);//主要受注番号
					subList.setLineItemValue( 'custpage_mainline_temperature_unit', ya+1, totalArray[ya].primary_temperature_unit_after);//主要温度単位
					subList.setLineItemValue( 'custpage_mainline_shipping_date', ya+1, totalArray[ya].primary_shipping_date_after);//主要出荷日
					subList.setLineItemValue( 'custpage_mainline_freight_company', ya+1, totalArray[ya].primary_freight_company_after);//主要DJ_運送会社
					subList.setLineItemValue( 'custpage_mainline_delivery_name', ya+1, totalArray[ya].primary_delivery_name_after);//主要届け先名
					subList.setLineItemValue( 'custpage_mainline_address', ya+1, totalArray[ya].primary_address_after);//主要お届け先の住所
					subList.setLineItemValue( 'custpage_mainline_delivery_date', ya+1, totalArray[ya].primary_delivery_date_after);//主要納品日
					subList.setLineItemValue( 'custpage_mainline_sending_table', ya+1, totalArray[ya].primary_sending_table_after);//主要送り状備考欄
					subList.setLineItemValue( 'custpage_mainline_amount', ya+1, amount);//主要金額
					
					subList.setLineItemValue( 'custpage_mainline_total_amount', ya+1, substitution);//主要代引金額
//							subList.setLineItemValue( 'custpage_mainline_insurance', ya+1, totalArray[ya].primary_insurance_after);//主要保険付
					subList.setLineItemValue( 'custpage_mainline_insurance_premium', ya+1, insurancePremium);//主要保険料
					subList.setLineItemValue( 'custpage_mainline_shipping_information', ya+1, totalArray[ya].primary_shipping_information_after);//主要出荷指示情報(メモ欄)
					subList.setLineItemValue( 'custpage_mainline_dataserialnumber', ya+1, totalArray[ya].dataSerialnumber);//送り状作成機能データテーブル管理番号
					subList.setLineItemValue( 'custpage_packing_figure', ya+1, '');//荷姿
					subList.setLineItemValue( 'custpage_speed_designation', ya+1, '000');//スピード指定
					subList.setLineItemValue( 'custpage_delivery_specified_time', ya+1, totalArray[ya].custpage_delivery_specified_time_after);//配達指定時間（時分）
//						subList.setLineItemValue( 'custpage_designatied_seal_1', ya+1, totalArray[ya].custpage_designatied_seal_1);//指定シール１
					subList.setLineItemValue( 'custpage_sales_office_pickup', ya+1, '');//営業所受取
					subList.setLineItemValue( 'custpage_src_segmentation', ya+1, '');//SRC区分
					subList.setLineItemValue( 'custpage_original_arrival_category', ya+1, '');//元着区分
					var newTotalArrayToJson = JSON.stringify(totalArray[ya].data).replace(/\,/g,'FFFFF')
					mainCsvStr += totalArray[ya].dataSerialnumber +','+newTotalArrayToJson+'\r\n';
					
				}
				var fieldId = csvMaker(mainCsvStr);
				fieldidText.setDefaultValue(fieldId);
			}   			
		 }else {
				
				//20230216 add by zhou start
				 var lineNum = new nlobjSearchColumn("line"); //受注番号
				 var soid  = new nlobjSearchColumn("internalid"); //受注番号
//				var primary_zip_code = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  is null THEN  Replace({billingAddress.zip},'-','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  END"); //郵便番号
				var primary_tranid = new nlobjSearchColumn("tranid"); //受注番号
				var primary_temperature_unit = new nlobjSearchColumn("custcol_djkk_temperature"); //DJ_配送温度
				var primary_shipping_date = new nlobjSearchColumn("shipdate"); //出荷日
				var primary_freight_company = expressType; //DJ_運送会社
//				var primary_delivery_name  = new nlobjSearchColumn("formulatext");//お届け先名
//				primary_delivery_name.setFormula("CASE WHEN {custbody_djkk_delivery_destination.custrecorddjkk_name} is null THEN {billingAddress.addressee} ELSE {custbody_djkk_delivery_destination.custrecorddjkk_name} END");
//				var primary_address  = new nlobjSearchColumn("formulatext");//20230213 changed by zhou   DJ_都道府県 +DJ_市区町村+DJ_納品先住所1+DJ_納品先住所2; //お届け先の住所
//				primary_address.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city}||{billingAddress.address1}||{billingAddress.address2},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') END");
				var primary_delivery_date = new nlobjSearchColumn("custbody_djkk_delivery_date"); //納品日
				var primary_sending_table = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN {custbody_djkk_de_sodeliverermem} is null THEN {custbody_djkk_sodeliverermem} ELSE {custbody_djkk_de_sodeliverermem} END"); //送り状備考欄


				var primary_amount = new nlobjSearchColumn("amount"); //金額
				var payment = new nlobjSearchColumn("custbody_djkk_payment_conditions");//支払条件
				var primary_total_amount = new nlobjSearchColumn("amount"); //代引合計金額
				var primary_insurance = new nlobjSearchColumn("formulatext").setFormula(""); //保険付
				var primary_insurance_premium = new nlobjSearchColumn("custcolcustbody_djkk_guarantee_fund"); //保険料
				var primary_shipping_information = new nlobjSearchColumn("memo"); //出荷指示情報(メモ欄)
				//end
				
				var cool_temp = new nlobjSearchColumn("custcol_djkk_temperature"); //SO.DJ配送温度
				
				
				
				
				var customer_control_number = new nlobjSearchColumn("formulatext").setFormula("");//お客様管理番号
				
				
				
				var sending_type  = new nlobjSearchColumn("formulatext"); //送り状種類
				sending_type.setFormula("0");
//				var cool_division = new nlobjSearchColumn("custrecord_djkk_csv_code","CUSTBODY_DJKK_GROUP",null); //クール区分
				var cool_division = new nlobjSearchColumn("formulatext").setFormula("{custcol_djkk_temperature.custrecord_djkk_shipping_temperature_id}");//クール区分 SO.配送温度
				var ticket_number = new nlobjSearchColumn("formulatext").setFormula(""); //伝票番号
				var delivery_date_text = new nlobjSearchColumn("shipdate"); //出荷予定日
				var expected_date_of_delivery =  new nlobjSearchColumn("custbody_djkk_delivery_date"); //お届け予定日
				var arrival_time_band =  new nlobjSearchColumn("custrecord9","CUSTBODY_DJKK_DELIVERY_TIME_ZONE_DESCR",null); //配達時間帯//custrecord_djkk_csv_code
				var delivery_code_text = new nlobjSearchColumn("formulatext").setFormula("");// お届け先コード
//				var destination_phone_number = new nlobjSearchColumn("formulatext"); //お届け先電話番号
//				destination_phone_number.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'','') is null THEN Replace({billingAddress.phone},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'','') END");//20230213 changed by zhou
				var telephone_number_branch_number= new nlobjSearchColumn("formulatext").setFormula(""); //	お届け先電話番号枝番
//				var delivery_zip_code_text = new nlobjSearchColumn("formulatext"); //お届け先郵便番号
//				delivery_zip_code_text.setFormula("CASE WHEN  Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  is null THEN  Replace({billingAddress.zip},'-','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  END");//add changed
//				var delivery_address_text = new nlobjSearchColumn("formulatext");//お届け先住所
//				delivery_address_text.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city}||{billingAddress.address1}||{billingAddress.address2},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') END");//20230213 changed by zhou   DJ_都道府県 +DJ_市区町村+DJ_納品先住所1
//				var apartment_house_apartment = new nlobjSearchColumn("formulatext");//お届け先アパートマンション名
//				apartment_house_apartment.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2},'+','') is null THEN Replace({billingAddress.address3},'+','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2},'+','') END");//changed by zhou 20230213 納品先.DJ_納品先住所3
				var delivery_company_one = new nlobjSearchColumn("custbody_djkk_delivery_company_1"); //お届け先会社・部門１
				var delivery_company_two = new nlobjSearchColumn("custbody_djkk_delivery_company_2");//お届け先会社・部門２
//				var destination_name = new nlobjSearchColumn("formulatext");//お届け先名
//				destination_name.setFormula("CASE WHEN SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,32)is null THEN SUBSTR({custbody_suitel10n_jp_ids_customer.altname},41,32) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,32) END");
				var destination_name_text = new nlobjSearchColumn("formulatext").setFormula(""); //お届け先名(ｶﾅ)
				var honorific_appellation = new nlobjSearchColumn("formulatext").setFormula("");//敬称
//				var client_code = 	new nlobjSearchColumn("phone","subsidiary",null);//ご依頼主コード
				var main_phone_number = new nlobjSearchColumn("formulatext");//ご依頼主電話番号//20230213 changed by zhou
				main_phone_number.setFormula("Replace({salesRep.phone},'+','')");//20230213 changed by zhou
				var branch_number = new nlobjSearchColumn("formulatext");//ご依頼主電話番号枝番
				branch_number.setFormula("");
//				branch_number.setFormula("Replace({subsidiary.zip},'-','')");
				var main_zip_code = new nlobjSearchColumn("formulatext");//ご依頼主郵便番号//20230213 changed by zhou
				main_zip_code.setFormula("Replace({subsidiary.zip},'-','')");//20230213 changed by zhou
				var main_address = new nlobjSearchColumn("formulatext"); //ご依頼主住所
				main_address.setFormula("{subsidiary.state}||{subsidiary.city}||{subsidiary.address1}||{subsidiary.address2}");
				var main_apartment = new nlobjSearchColumn("formulatext");//ご依頼主アパートマンション 20230213 changed by zhou
				main_apartment.setFormula("{subsidiary.address3}");
				var main_name=new nlobjSearchColumn("formulatext");//ご依頼主名
				main_name.setFormula("{subsidiary.legalname}");
//				var main_name = new nlobjSearchColumn("name","subsidiary",null);//ご依頼主名 20230213 changed by zhou
				var main_name_text = new nlobjSearchColumn("formulatext").setFormula(""); //ご依頼主名(ｶﾅ)
				var code_name_one = new nlobjSearchColumn("formulatext").setFormula("");//品名コード１
				var product_name_one = new nlobjSearchColumn("formulatext");//品名１
				product_name_one.setFormula("SUBSTR({item.custitem_djkk_product_group}, 0, 25)");//20230213 changed by zhou ITEMDJ_製品グループ
				
				var code_name_two = new nlobjSearchColumn("formulatext"); //品名コード２
				code_name_two.setFormula("{item.itemid}");//20230213 changed by zhou
				
				var product_name_two = new nlobjSearchColumn("formulatext"); //品名２
				product_name_two.setFormula("{item.custitem_djkk_product_name_jpline1}||{item.custitem_djkk_product_name_jpline2}");
				//20230213 changed by zhou 
//				var handling_one = new nlobjSearchColumn("formulatext");//20230213 changed by zhou  荷扱い１
//				handling_one.setFormula("");//20230213 changed by zhou ワレ物注意
//				var handling_two = new nlobjSearchColumn("formulatext");//20230213 changed by zhou  荷扱い２
//				handling_two.setFormula("");//20230213 changed by zhou 天地無用
				
				
				
				var article = new nlobjSearchColumn("tranid");//記事formulatext
				var the_amount_of_money_exchanged = new nlobjSearchColumn("amount"); //ｺﾚｸﾄ代金引換額（税込)  //20230213 changed by zhou 代引きの場合、SO合計金額
				var domestic_consumption_tax = new nlobjSearchColumn("formulatext").setFormula("");//'内消費税額等
				var stop = new nlobjSearchColumn("formulatext").setFormula("");//止置き
				var business_office_code = new nlobjSearchColumn("formulatext").setFormula("");//営業所コード
				var number_of_rows = new nlobjSearchColumn("formulatext").setFormula("");//発行枚数
				var number_display_flag = new nlobjSearchColumn("formulatext").setFormula("");//個数口表示フラグ
				var invoice_client_code = new nlobjSearchColumn("formulatext").setFormula("");//請求先顧客コード  20230213 changed by zhou DJ_修理まだ確認待ち、修理⇒バリデーション必要
				var claim_classification_code = new nlobjSearchColumn("custentity_djkk_claim_classification","customer",null);//請求先分類コード
				var transportation_management_number = new nlobjSearchColumn("custbody_djkk_fare_control_number");//運賃管理番号
				var crows_web_collect_data_registration = new nlobjSearchColumn("formulatext").setFormula("");//クロネコwebコレクトデータ登録
				var crows_web_collection = new nlobjSearchColumn("formulatext").setFormula("");//クロネコwebコレクト加盟店番号
				var crows_web_collect_application_number_one = new nlobjSearchColumn("formulatext").setFormula("");//クロネコwebコレクト申込受付番号１
				var crows_web_collect_application_number_two = new nlobjSearchColumn("formulatext").setFormula("");//クロネコwebコレクト申込受付番号2
				var crows_web_collect_application_number_three = new nlobjSearchColumn("formulatext").setFormula("");//クロネコwebコレクト申込受付番号3
				var delivery_schedule = new nlobjSearchColumn("formulatext").setFormula("");//お届け予定ｅメール利用区分
				var email_address_text = new nlobjSearchColumn("formulatext").setFormula("");//お届け予定ｅメールe-mailアドレス
				var incoming_model =  new nlobjSearchColumn("formulatext").setFormula("");//入力機種
				var email_address_textdate = new nlobjSearchColumn("formulatext").setFormula("");//お届け予定ｅメールメッセージ
				var email_address_textedit = new nlobjSearchColumn("formulatext").setFormula("");//お届け完了ｅメール利用区分
				var email_address_textedit_one = new nlobjSearchColumn("formulatext").setFormula("");//お届け完了ｅメールe-mailアドレス
				var email_address_textdate_one = new nlobjSearchColumn("formulatext").setFormula("");//お届け完了ｅメールメッセージ
				var crochet_storage =  new nlobjSearchColumn("formulatext").setFormula("");//'クロネコ収納代行利用区分
				
				var amount_requested_by_paying_bank = new nlobjSearchColumn("formulatext").setFormula("");//収納代行請求金額(税込)
				var issuing_and_paying = new nlobjSearchColumn("formulatext").setFormula("");//収納代行内消費税額等
				var the_issuing_bank_requests = new nlobjSearchColumn("formulatext").setFormula("");//収納代行請求先郵便番号
				var the_first_residence = new nlobjSearchColumn("formulatext").setFormula("");//収納代行請求先住所;
				var destination_address = new nlobjSearchColumn("formulatext").setFormula("");//収納代行請求先住所（アパートマンション名）
				var issuing_agent_bank_one = new nlobjSearchColumn("formulatext").setFormula("");//収納代行請求先会社・部門名１
				var issuing_agent_bank_two = new nlobjSearchColumn("formulatext").setFormula("");//収納代行請求先会社・部門名2
				var first_name_requested = new nlobjSearchColumn("formulatext").setFormula("");//収納代行請求先名(漢字)
				var request_for_storage_agency = new nlobjSearchColumn("formulatext").setFormula("");//収納代行請求先名(カナ)
				var first_name_of_daixing = new nlobjSearchColumn("formulatext").setFormula("");//収納代行問合せ先名(漢字)'
				var the_issuing_bank_asks = new nlobjSearchColumn("formulatext").setFormula("");//収納代行問合せ先郵便番号
				var first_address_of_the_issuing_bank = new nlobjSearchColumn("formulatext").setFormula("");//収納代行問合せ先住所
				var the_address_of_the_apartment_address = new nlobjSearchColumn("formulatext").setFormula("");//収納代行問合せ先住所（アパートマンション名）'
				var first_telephone_number_of_the_issuing = new nlobjSearchColumn("formulatext").setFormula("");//収納代行問合せ先電話番号
				var issuing_agent_bank_management_number = new nlobjSearchColumn("formulatext").setFormula("");//収納代行管理番号
				var name_of_the_agent = new nlobjSearchColumn("formulatext").setFormula("");//収納代行品名
				var prepared_by_the_issuing_bank = new nlobjSearchColumn("formulatext").setFormula("");//収納代行備考
				var multiple_mouth_key = new nlobjSearchColumn("formulatext").setFormula("");//複数口くくりキー
				var search_key_title_one = new nlobjSearchColumn("formulatext").setFormula("");//検索キータイトル1
				var search_key_one = new nlobjSearchColumn("formulatext").setFormula("");//検索キー1
				var search_key_title_two = new nlobjSearchColumn("formulatext").setFormula("");//検索キータイトル2'
				var search_key_two = new nlobjSearchColumn("formulatext").setFormula("");//検索キー2
				var search_key_title_three = new nlobjSearchColumn("formulatext").setFormula("");//検索キータイトル3
				var search_key_three = new nlobjSearchColumn("formulatext").setFormula("");//検索キー3
				var search_key_title_four = new nlobjSearchColumn("formulatext").setFormula("");//検索キータイトル4
				var search_key_four = new nlobjSearchColumn("formulatext").setFormula("");//検索キー4
				var search_key_title_five = new nlobjSearchColumn("formulatext").setFormula("");//検索キータイトル5
				var search_key_five = new nlobjSearchColumn("formulatext").setFormula("");//検索キー5
				var prepare_two = new nlobjSearchColumn("formulatext").setFormula("");//予備  tdo 重複
				var prepare_three = new nlobjSearchColumn("formulatext").setFormula("");//予備  tdo 重複
				var classification_of_mail = new nlobjSearchColumn("formulatext").setFormula("");//投函予定メール利用区分
				var email_address_edit_two = new nlobjSearchColumn("formulatext").setFormula("");//投函予定メールe-mailアドレス
				var email_address_edit_three = new nlobjSearchColumn("formulatext").setFormula("");//投函予定メールメッセージ
				var mail_completion = new nlobjSearchColumn("formulatext").setFormula("");//投函完了メール（お届け先宛）利用区分
				var email_address_edit_four = new nlobjSearchColumn("formulatext").setFormula("");//投函完了メール（お届け先宛）e-mailアドレス
				var email_address_edit_five = new nlobjSearchColumn("formulatext").setFormula("");//投函完了メール（お届け先宛）メールメッセージ
				var use_completed_mail = new nlobjSearchColumn("formulatext").setFormula("");//投函完了メール（ご依頼主宛）利用区分
				var use_completed_mail_edit_one = new nlobjSearchColumn("formulatext").setFormula("");//投函完了メール（ご依頼主宛）e-mailアドレス
				var use_completed_mail_edit_two = new nlobjSearchColumn("formulatext").setFormula("");//投函完了メール（ご依頼主宛）メールメッセージ
				
				var delivery =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//SO.納品先
				 var customer =  new nlobjSearchColumn("entity");//SO.顧客
				 var deliveryPrepare = new nlobjSearchColumn("custbody_djkk_de_sodeliverermem"); //DJ_納品先送り状に記載備考欄
				 var customerPrepare = new nlobjSearchColumn("custbody_djkk_sodeliverermem"); //DJ_顧客送り状に記載備考欄
				 var deliveryAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')");//SO.納品先.郵便番号
				 var deliveryAddressState = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_prefectures}");//SO.納品先.都道府県
				 var deliveryAddressCity = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}");//SO.納品先.市区町村
				 var deliveryAddress1 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}");//SO.納品先.住所1
				 var deliveryAddress2 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable}");//SO.納品先.住所2
				 var deliveryAddress3 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2}");//SO.納品先.住所3
				 var deliveryName = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecorddjkk_name}");//SO.納品先.納品先名前
				 var deliveryNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},0,40)");//SO.納品先.納品先名前(0-40)
				 var deliveryNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,40)");//SO.納品先.納品先名前(41-80)
				 var deliveryAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text}");//SO.納品先.電話番号
				 var billingAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({billingAddress.zip},'-','')");//SO.顧客.郵便番号
				 var billingAddressState = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.custrecord_djkk_address_state}");//SO.顧客.都道府県
				 var billingAddressCity= new nlobjSearchColumn("formulatext").setFormula("{billingAddress.city}");//SO.顧客.市区町村
				 var billingAddress1 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address1}");//SO.顧客.住所1
				 var billingAddress2 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address2}");//SO.顧客.住所2
				 var billingAddress3 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address3}");//SO.顧客.住所3
				 var billingName = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.addressee}");//SO.顧客.(0-40)
				 var billingNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},0,40)");//SO.顧客.(0-40)
				 var billingNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},41,40)");//SO.顧客.(41-80)
				 var billingAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.phone}");//SO.顧客.電話番号
				
				var yamatoInfo = [
			                    //20230213 add by zhou  U046 start 
			                    lineNum,
			                    soid,
//				                primary_zip_code,
				                primary_tranid,
				                primary_temperature_unit,
				                primary_shipping_date,
//							    primary_freight_company,
//					          	primary_delivery_name,
//					          	primary_address,
					          	primary_delivery_date,
					          	primary_sending_table,
					          	primary_amount,
					          	payment,
					          	primary_total_amount,
					          	primary_insurance,
					          	primary_insurance_premium,
					          	primary_shipping_information,
						        //end
								customer_control_number,
				               	sending_type,
				               	cool_division,
				               	ticket_number,
				               	delivery_date_text,
				               	expected_date_of_delivery,
				               	arrival_time_band,
				               	delivery_code_text,
//				               	destination_phone_number,
				               	telephone_number_branch_number,
//				               	delivery_zip_code_text,
//				               	delivery_address_text,
//				               	apartment_house_apartment,
				               	delivery_company_one,
				               	delivery_company_two,
//				               	destination_name,
				               	destination_name_text,
				               	honorific_appellation,
//				               	client_code,
				               	main_zip_code,
				               	main_phone_number,
				               	branch_number,
//				               	main_zip_code,
				               	main_address,
				               	main_apartment,
				               	main_name,
				               	main_name_text,
				               	code_name_one,
				               	product_name_one,
				               	code_name_two,
				               	product_name_two ,
//				               	handling_one,//20230213 changed by zhou
//				               	handling_two,//20230213 changed by zhou
				               	article ,
				               	the_amount_of_money_exchanged ,
				               	domestic_consumption_tax ,
				               	stop,
				               	business_office_code,
				               	number_of_rows,
				               	number_display_flag,
				               	invoice_client_code ,
				               	claim_classification_code ,
				               	transportation_management_number ,
				               	crows_web_collect_data_registration ,
				               	crows_web_collection ,
				               	crows_web_collect_application_number_one ,
				               	crows_web_collect_application_number_two ,
				               	crows_web_collect_application_number_three ,
				               	delivery_schedule ,
				               	email_address_text ,
				               	incoming_model ,
				               	email_address_textdate ,
				               	email_address_textedit ,
				               	email_address_textedit_one ,
				               	email_address_textdate_one ,
				               	crochet_storage ,
//				               	prepare ,
				               	amount_requested_by_paying_bank ,
				               	issuing_and_paying ,
				               	the_issuing_bank_requests ,
				               	the_first_residence ,
				               	destination_address ,
				               	issuing_agent_bank_one ,
				               	issuing_agent_bank_two ,
				               	first_name_requested ,
				               	request_for_storage_agency ,
				               	first_name_of_daixing, 
				               	the_issuing_bank_asks,
				               	first_address_of_the_issuing_bank ,
				               	the_address_of_the_apartment_address ,
				               	first_telephone_number_of_the_issuing ,
				               	issuing_agent_bank_management_number ,
				               	name_of_the_agent ,
				               	prepared_by_the_issuing_bank ,
				               	multiple_mouth_key ,
				               	search_key_title_one ,
				               	search_key_one ,
				               	search_key_title_two ,
				               	search_key_two ,
				               	search_key_title_three ,
				               	search_key_three ,
				               	search_key_title_four ,
				               	search_key_four ,
				               	search_key_title_five ,
				               	search_key_five ,
				               	prepare_two ,
				               	prepare_three ,
				               	classification_of_mail ,
				               	email_address_edit_two ,
				               	email_address_edit_three ,
				               	mail_completion ,
				               	email_address_edit_four ,
				               	email_address_edit_five ,
				               	use_completed_mail ,
				               	use_completed_mail_edit_one ,
				               	use_completed_mail_edit_two ,
				             
				               	 delivery,
					   		     customer,
					   		     deliveryAddressZip,
					   		     deliveryAddressState,
					   		     deliveryAddressCity,
					   		     deliveryAddress1,
					   		     deliveryAddress2,
					   		     deliveryAddress3,
					   		     deliveryName,
					   		     deliveryNameStr1,
					   		     deliveryNameStr2,
					   		     deliveryAddressPhone,
					   		     deliveryPrepare,
					   		     billingAddressZip,
					   		     billingAddressState,
					   		     billingAddressCity,
					   		     billingAddress1,
					   		     billingAddress2,
					   		     billingAddress3,
					   		     billingName,
					   		     billingNameStr1,
					   		     billingNameStr2,
					   		     billingAddressPhone,
					   		     customerPrepare
				               ];
				
				
				
				
				
			//	
//				var date = request.getParameter('date');//日付
//				var express = request.getParameter('express');//配送方法
//				var number = request.getParameter('number');//受付番号
//				var dateree = request.getParameter('dateree');//出荷日
//				var invoice = request.getParameter('invoice');//送り状番号

				
				
				
				var salesorderSearch = nlapiSearchRecord("salesorder",null,
						[
//						   ["type","anyof","SalesOrd"], 
//						   "AND", 
//						   ["itemtype","is","InvtPart"]
								filit
						], 
						    yamatoInfo
							
						);
				if(salesorderSearch != null  ){
					
				
				for(var i = 0 ; i < salesorderSearch.length ;i++){
					//値の取得
					
					var deliveryAfter =  defaultEmpty(salesorderSearch[i].getValue(delivery));//SO.納品先
					var customerAfter =  defaultEmpty(salesorderSearch[i].getValue(customer));//SO.顧客
					var deliveryAddressZipAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressZip));//SO.納品先.郵便番号
					var deliveryAddressStateAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressState));//SO.納品先.都道府県
					var deliveryAddressCityAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressCity));//SO.納品先.市区町村
					var deliveryAddress1After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress1));//SO.納品先.住所1
					var deliveryAddress2After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress2));//SO.納品先.住所2
					var deliveryAddress3After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress3));//SO.納品先.住所3
					var deliveryNameAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryName));//SO.納品先..納品先名前
					var deliveryNameStr1After = defaultEmpty(salesorderSearch[i].getValue(deliveryNameStr1));//SO.納品先.納品先名前(0-40)
					var deliveryNameStr2After = defaultEmpty(salesorderSearch[i].getValue(deliveryNameStr2));//SO.納品先.納品先名前(41-80)
					var deliveryAddressPhoneAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressPhone));//SO.納品先.電話番号
					var billingAddressZipAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressZip));//SO.顧客.郵便番号
					var billingAddressStateAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressState));//SO.顧客.都道府県
					var billingAddressCityAfter= defaultEmpty(salesorderSearch[i].getValue(billingAddressCity));//SO.顧客.市区町村
					var billingAddress1After = defaultEmpty(salesorderSearch[i].getValue(billingAddress1));//SO.顧客.住所1
					var billingAddress2After = defaultEmpty(salesorderSearch[i].getValue(billingAddress2));//SO.顧客.住所2
					var billingAddress3After = defaultEmpty(salesorderSearch[i].getValue(billingAddress3));//SO.顧客.住所3
					var billingNameAfter = defaultEmpty(salesorderSearch[i].getValue(billingName));//SO.顧客.名前
					var billingNameStr1After = defaultEmpty(salesorderSearch[i].getValue(billingNameStr1));//SO.顧客.名前(0-40)
					var billingNameStr2After = defaultEmpty(salesorderSearch[i].getValue(billingNameStr2));//SO.顧客.名前(41-80)
					var billingAddressPhoneAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressPhone));//SO.顧客.電話番号
					var deliveryPrepareAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryPrepare));//SO.納品先.送り状に記載備考欄
					var customerPrepareAfter = defaultEmpty(salesorderSearch[i].getValue(customerPrepare));//SO.顧客.送り状に記載備考欄
					if(!isEmpty(deliveryAfter)){
						var  primary_zip_code_after = deliveryAddressZipAfter;
						var  primary_delivery_name_after = deliveryNameAfter;
						var  primary_address_after = deliveryAddressStateAfter+deliveryAddressCityAfter+deliveryAddress1After+deliveryAddress2After+deliveryAddress3After;
						var  destination_phone_number_after = deliveryAddressPhoneAfter;//お届け先電話番号
						var  delivery_zip_code_text_after = deliveryAddressZipAfter;//お届け先郵便番号
						var  delivery_address_text_after = deliveryAddressStateAfter+deliveryAddressCityAfter+deliveryAddress1After+deliveryAddress2After;//お届け先住所
						var  apartment_house_apartment_after = deliveryAddress3After;//お届け先アパートマンション名
						var  destination_name_after = deliveryNameStr2After;//お届け先名
						var  prepare_after  = deliveryPrepareAfter;//予備
						var  primary_sending_table_after = deliveryPrepareAfter;
					}else{
						var  primary_zip_code_after = billingAddressZipAfter;
						var  primary_delivery_name_after = billingNameAfter;
						var  primary_address_after = billingAddressStateAfter+billingAddressCityAfter+billingAddress1After+billingAddress2After+billingAddress3After;
						var  destination_phone_number_after = billingAddressPhoneAfter;//お届け先電話番号
						var  delivery_zip_code_text_after = billingAddressZipAfter;//お届け先郵便番号
						var  delivery_address_text_after = billingAddressStateAfter+billingAddressCityAfter+billingAddress1After+billingAddress2After;//お届け先住所
						var  apartment_house_apartment_after = billingAddress3After;//お届け先アパートマンション名
						var  destination_name_after = billingNameStr2After;//お届け先名
						var  prepare_after  = customerPrepareAfter;//予備
						var  primary_sending_table_after = customerPrepareAfter;
					}
					var  telephone_number_branch_number_after = salesorderSearch[i].getValue(telephone_number_branch_number);//お届け先電話番号枝番
					var  delivery_company_one_after = salesorderSearch[i].getValue(delivery_company_one);//お届け先会社・部門１
					var  delivery_company_two_after = salesorderSearch[i].getValue(delivery_company_two);//お届け先会社・部門２
					var lineNum_after = salesorderSearch[i].getValue(lineNum);
					var soid_after = salesorderSearch[i].getValue(soid);
					var  customer_control_number_after = salesorderSearch[i].getValue(customer_control_number);//お客様管理番号
					var  sending_type_after = salesorderSearch[i].getValue(sending_type);//送り状種類
					var  cool_division_after = salesorderSearch[i].getValue(cool_division);//クール区分 20230213 changed by zhou
					var  ticket_number_after = salesorderSearch[i].getValue(ticket_number);//伝票番号
					var  delivery_date_text_after = salesorderSearch[i].getValue(delivery_date_text);//出荷予定日
					var  expected_date_of_delivery_after = salesorderSearch[i].getValue(expected_date_of_delivery);//お届け予定日
					var  arrival_time_band_after = salesorderSearch[i].getValue(arrival_time_band);//配達時間帯
					var  delivery_code_text_after = salesorderSearch[i].getValue(delivery_code_text);//お届け先コード
					
					var  destination_name_text_after = salesorderSearch[i].getValue(destination_name_text);//お届け先名(ｶﾅ)
					var  honorific_appellation_after = salesorderSearch[i].getValue(honorific_appellation);//敬称
//					var  client_code_after = salesorderSearch[i].getValue(client_code);//ご依頼主コード
					var  client_code_after='';//ご依頼主コード
					var  main_phone_number_after='';//ご依頼主電話番号
					var  main_address_after1='';//ご依頼主住所
					var  main_apartment_after = salesorderSearch[i].getValue(main_apartment);//ご依頼主アパートマンション
					var  main_name_after=salesorderSearch[i].getValue(main_name);//ご依頼主名
//					var  product_name_one_after='';//品名１
					if(clubValue==SUB_DPKK){//dp
						client_code_after = '0434982031' ;//ご依頼主コード
						main_phone_number_after = salesorderSearch[i].getValue(main_phone_number);//ご依頼主電話番号
						main_address_after1='千葉県佐倉市大作1-8-5';//ご依頼主住所
//						product_name_one_after='試薬品';//品名１
					}else if(clubValue==SUB_SCETI){//secti
						client_code_after = '0355102652' ;//ご依頼主コード
						main_phone_number_after = salesorderSearch[i].getValue(main_phone_number);//ご依頼主電話番号
						main_address_after1='東京都千代田区霞が関3-6-7';//ご依頼主住所
//						product_name_one_after='医療機器等';//品名１
					}
					var  main_zip_code_after = salesorderSearch[i].getValue(main_zip_code);//20230213 changed by zhou
					var  branch_number_after = salesorderSearch[i].getValue(branch_number);//ご依頼主電話番号枝番
//					var  main_zip_code_after = salesorderSearch[i].getValue(main_zip_code);//ご依頼主郵便番号
					var  main_address_after = salesorderSearch[i].getValue(main_address);//ご依頼主住所
//					var  main_name_after = salesorderSearch[i].getValue(main_name);//ご依頼主名
					var  main_name_text_after = salesorderSearch[i].getValue(main_name_text);//ご依頼主名(ｶﾅ)
					var  code_name_one_after = salesorderSearch[i].getValue(code_name_one);//品名コード１
					var  product_name_one_after = salesorderSearch[i].getValue(product_name_one);//品名１
//					var  code_name_two_after = salesorderSearch[i].getValue(code_name_two);//品名コード２
//					var  product_name_two_after  = salesorderSearch[i].getValue(product_name_two);//品名２
					var  code_name_two_after = salesorderSearch[i].getValue(code_name_two);//品名コード２
					var  product_name_two_after  = salesorderSearch[i].getValue(product_name_two);//品名２
//					var  handling_one_after = salesorderSearch[i].getValue(handling_one);//荷扱い１
//					var  handling_two_after = salesorderSearch[i].getValue(handling_two);//荷扱い２
//					var  handling_one_after = 'ワレ物注意';//荷扱い１
//					var  handling_two_after = '天地無用';//荷扱い２
					var  article_after  = salesorderSearch[i].getValue(article);//記事
					var  the_amount_of_money_exchanged_after  = salesorderSearch[i].getValue(the_amount_of_money_exchanged);//ｺﾚｸﾄ代金引換額（税込)
					var  domestic_consumption_tax_after  = salesorderSearch[i].getValue(domestic_consumption_tax);//内消費税額等
					var  stop_after = salesorderSearch[i].getValue(stop);//止置き
					var  business_office_code_after = salesorderSearch[i].getValue(business_office_code);//営業所コード
					var  number_of_rows_after = salesorderSearch[i].getValue(number_of_rows);//発行枚数
					var  number_display_flag_after = salesorderSearch[i].getValue(number_display_flag);//個数口表示フラグ
					var  invoice_client_code_after  = client_code_after ;//請求先顧客コード 20230213 changed by zhou  連続子会社の荷送人コード
					var  claim_classification_code_after  = salesorderSearch[i].getValue(claim_classification_code);//請求先分類コード
					if(String(claim_classification_code_after).length==1){
						claim_classification_code_after = '0'+'0'+claim_classification_code_after;
					}else if(String(claim_classification_code_after).length==2){
						claim_classification_code_after = '0'+claim_classification_code_after;
					}else if(String(claim_classification_code_after).length==3){
						claim_classification_code_after = claim_classification_code_after;
					}
					var  transportation_management_number_after  = salesorderSearch[i].getValue(transportation_management_number);//運賃管理番号
					transportation_management_number_after ="\t"+ "01"
//					if(String(transportation_management_number_after).length==1){
//						transportation_management_number_after = '0'+transportation_management_number_after;
//					}else if(String(transportation_management_number_after).length==2){
//						transportation_management_number_after =transportation_management_number_after;
//					}
					var  crows_web_collect_data_registration_after = salesorderSearch[i].getValue(crows_web_collect_data_registration);//クロネコwebコレクトデータ登録
					var  crows_web_collection_after  = salesorderSearch[i].getValue(crows_web_collection);//クロネコwebコレクト加盟店番号
					var  crows_web_collect_application_number_one_after  = salesorderSearch[i].getValue(crows_web_collect_application_number_one);//クロネコwebコレクト申込受付番号１
					var  crows_web_collect_application_number_two_after  = salesorderSearch[i].getValue(crows_web_collect_application_number_two);//クロネコwebコレクト申込受付番号2
					var  crows_web_collect_application_number_three_after  = salesorderSearch[i].getValue(crows_web_collect_application_number_three);//クロネコwebコレクト申込受付番号3
					var  delivery_schedule_after  = salesorderSearch[i].getValue(delivery_schedule);//お届け予定ｅメール利用区分
					var  email_address_text_after  = salesorderSearch[i].getValue(email_address_text);//お届け予定ｅメールe-mailアドレス
					var  incoming_model_after  = salesorderSearch[i].getValue(incoming_model);//入力機種
					var  email_address_textdate_after  = salesorderSearch[i].getValue(email_address_textdate);//お届け予定ｅメールメッセージ
					var  email_address_textedit_after  = salesorderSearch[i].getValue(email_address_textedit);//お届け完了ｅメール利用区分
					var  email_address_textedit_one_after  = salesorderSearch[i].getValue(email_address_textedit_one);//お届け完了ｅメールe-mailアドレス
					var  email_address_textdate_one_after  = salesorderSearch[i].getValue(email_address_textdate_one);//お届け完了ｅメールメッセージ
					var  crochet_storage_after  = salesorderSearch[i].getValue(crochet_storage);//クロネコ収納代行利用区分
					
					var  amount_requested_by_paying_bank_after  = salesorderSearch[i].getValue(amount_requested_by_paying_bank);//収納代行請求金額(税込)
					var  issuing_and_paying_after  = salesorderSearch[i].getValue(issuing_and_paying);//収納代行内消費税額等
					var  the_issuing_bank_requests_after  = salesorderSearch[i].getValue(the_issuing_bank_requests);//収納代行請求先郵便番号
					var  the_first_residence_after  = salesorderSearch[i].getValue(the_first_residence);//収納代行請求先住所;
					var  destination_address_after  = salesorderSearch[i].getValue(destination_address);//収納代行請求先住所（アパートマンション名）
					var  issuing_agent_bank_one_after  = salesorderSearch[i].getValue(issuing_agent_bank_one);//収納代行請求先会社・部門名１
					var  issuing_agent_bank_two_after  = salesorderSearch[i].getValue(issuing_agent_bank_two);//収納代行請求先会社・部門名2
					var  first_name_requested_after  = salesorderSearch[i].getValue(first_name_requested);//収納代行請求先名(漢字)
					var  request_for_storage_agency_after  = salesorderSearch[i].getValue(request_for_storage_agency);//収納代行請求先名(カナ)
					var  first_name_of_daixing_after  = salesorderSearch[i].getValue(first_name_of_daixing);//収納代行問合せ先名(漢字)
					var  the_issuing_bank_asks_after = salesorderSearch[i].getValue(the_issuing_bank_asks);//収納代行問合せ先郵便番号
					var  first_address_of_the_issuing_bank_after  = salesorderSearch[i].getValue(first_address_of_the_issuing_bank);//収納代行問合せ先住所
					var  the_address_of_the_apartment_address_after  = salesorderSearch[i].getValue(the_address_of_the_apartment_address);//収納代行問合せ先住所（アパートマンション名）
					var  first_telephone_number_of_the_issuing_after  = salesorderSearch[i].getValue(first_telephone_number_of_the_issuing);//収納代行問合せ先電話番号
					var  issuing_agent_bank_management_number_after  = salesorderSearch[i].getValue(issuing_agent_bank_management_number);//収納代行管理番号
					var  name_of_the_agent_after  = salesorderSearch[i].getValue(name_of_the_agent);//収納代行品名
					var  prepared_by_the_issuing_bank_after  = salesorderSearch[i].getValue(prepared_by_the_issuing_bank);//収納代行備考
					var  multiple_mouth_key_after  = salesorderSearch[i].getValue(multiple_mouth_key);//複数口くくりキー
					var  search_key_title_one_after  = salesorderSearch[i].getValue(search_key_title_one);//検索キータイトル1
					var  search_key_one_after  = salesorderSearch[i].getValue(search_key_one);//検索キー1
					var  search_key_title_two_after  = salesorderSearch[i].getValue(search_key_title_two);//検索キータイトル2
					var  search_key_two_after  = salesorderSearch[i].getValue(search_key_two);//検索キー2
					var  search_key_title_three_after  = salesorderSearch[i].getValue(search_key_title_three);//検索キータイトル3
					var  search_key_three_after   = salesorderSearch[i].getValue(search_key_three);//検索キー3
					var  search_key_title_four_after   = salesorderSearch[i].getValue(search_key_title_four);//検索キータイトル4
					var  search_key_four_after   = salesorderSearch[i].getValue(search_key_four);//検索キー4
					var  search_key_title_five_after   = salesorderSearch[i].getValue(search_key_title_five);//検索キータイトル5
					var  search_key_five_after   = salesorderSearch[i].getValue(search_key_five);//検索キー5
					var  prepare_two_after   = salesorderSearch[i].getValue(prepare_two);//予備tdo重複
					var  prepare_three_after   = salesorderSearch[i].getValue(prepare_three);//予備tdo重複
					var  classification_of_mail_after   = salesorderSearch[i].getValue(classification_of_mail);//投函予定メール利用区分
					var  email_address_edit_two_after   = salesorderSearch[i].getValue(email_address_edit_two);//投函予定メールe-mailアドレス
					var  email_address_edit_three_after    = salesorderSearch[i].getValue(email_address_edit_three);//投函予定メールメッセージ
					var  mail_completion_after    = salesorderSearch[i].getValue(mail_completion);//投函完了メール（お届け先宛）利用区分
					var  email_address_edit_four_after    = salesorderSearch[i].getValue(email_address_edit_four);//投函完了メール（お届け先宛）e-mailアドレス
					var  email_address_edit_five_after    = salesorderSearch[i].getValue(email_address_edit_five);//投函完了メール（お届け先宛）メールメッセージ
					var  use_completed_mail_after    = salesorderSearch[i].getValue(use_completed_mail);//投函完了メール（ご依頼主宛）利用区分
					var  use_completed_mail_edit_one_after    = salesorderSearch[i].getValue(use_completed_mail_edit_one);//投函完了メール（ご依頼主宛）e-mailアドレス
					var  use_completed_mail_edit_two_after     = salesorderSearch[i].getValue(use_completed_mail_edit_two);//投函完了メール（ご依頼主宛）メールメッ
													
					//20230213 add by zhou  U046 start 
					var  primary_tranid_after = salesorderSearch[i].getValue(primary_tranid);
					var  primary_temperature_unit_after = salesorderSearch[i].getText(primary_temperature_unit);
					var  primary_shipping_date_after = salesorderSearch[i].getValue(primary_shipping_date);
					var  primary_freight_company_after = expressType;
					var  primary_delivery_date_after = salesorderSearch[i].getValue(primary_delivery_date);
					
					var  primary_amount_after = salesorderSearch[i].getValue(primary_amount);
					
					var  payment_after = salesorderSearch[i].getValue(payment);
					var  primary_total_amount_after = salesorderSearch[i].getValue(primary_total_amount);
					if(payment_after != '1'){
						primary_total_amount_after = 0 ;
						the_amount_of_money_exchanged_after = 0;
					}
					
					var  primary_insurance_after = salesorderSearch[i].getValue(primary_insurance);
					var  primary_insurance_premium_after = salesorderSearch[i].getValue(primary_insurance_premium);
//					var  primary_shipping_information_after = salesorderSearch[i].getValue(primary_shipping_information);
					var yamatoData ={
						lineNum_after:lineNum_after,
						soid_after:soid_after,
			            primary_zip_code_after:primary_zip_code_after,
						primary_tranid_after:primary_tranid_after,
						primary_temperature_unit_after:primary_temperature_unit_after,
						primary_shipping_date_after:primary_shipping_date_after,
						primary_delivery_name_after:primary_delivery_name_after,
						primary_freight_company_after:primary_freight_company_after,
						primary_address_after:primary_address_after,
						primary_delivery_date_after:primary_delivery_date_after,
						primary_sending_table_after:primary_sending_table_after,
						primary_amount_after:primary_amount_after,
						payment_after:payment_after,
						primary_total_amount_after:primary_total_amount_after,
						primary_insurance_after:primary_insurance_after,
						primary_insurance_premium_after:primary_insurance_premium_after,
//						primary_shipping_information_after:primary_shipping_information_after,
			          	
						customer_control_number_after:customer_control_number_after,
			           	sending_type_after:sending_type_after,
			           	cool_division_after:cool_division_after,
			           	ticket_number_after:ticket_number_after,
			           	delivery_date_text_after:delivery_date_text_after,
			           	expected_date_of_delivery_after:expected_date_of_delivery_after,
			           	arrival_time_band_after:arrival_time_band_after,
			           	delivery_code_text_after:delivery_code_text_after,
			           	destination_phone_number_after:destination_phone_number_after,
			           	telephone_number_branch_number_after:telephone_number_branch_number_after,
			           	delivery_zip_code_text_after:delivery_zip_code_text_after,
			           	delivery_address_text_after:delivery_address_text_after,
			           	apartment_house_apartment_after:apartment_house_apartment_after,
			           	delivery_company_one_after:delivery_company_one_after,
			           	delivery_company_two_after:delivery_company_two_after,
			           	destination_name_after:destination_name_after,
			           	destination_name_text_after:destination_name_text_after,
			           	honorific_appellation_after:honorific_appellation_after,
			           	client_code_after:client_code_after,
			           	main_phone_number_after:main_phone_number_after,
			           	branch_number_after:branch_number_after,
			           	main_address_after:main_address_after,
			           	main_name_after:main_name_after,
			           	main_apartment_after:main_apartment_after,
			           	main_zip_code_after:main_zip_code_after,
			           	main_name_text_after:main_name_text_after,
			           	code_name_one_after:code_name_one_after,
			           	product_name_one_after:product_name_one_after,
			           	code_name_two_after:code_name_two_after,
			           	product_name_two_after:product_name_two_after,
			           	article_after:article_after,
			           	the_amount_of_money_exchanged_after:the_amount_of_money_exchanged_after,
			           	domestic_consumption_tax_after:domestic_consumption_tax_after,
			           	stop_after:stop_after,
			           	business_office_code_after:business_office_code_after,
			           	number_of_rows_after:number_of_rows_after,
			           	number_display_flag_after:number_display_flag_after,
			           	invoice_client_code_after:invoice_client_code_after,
			           	claim_classification_code_after:claim_classification_code_after,
			           	transportation_management_number_after:transportation_management_number_after,
			           	crows_web_collect_data_registration_after:crows_web_collect_data_registration_after,
			           	crows_web_collection_after:crows_web_collection_after,
			           	crows_web_collect_application_number_one_after:crows_web_collect_application_number_one_after,
			           	crows_web_collect_application_number_two_after:crows_web_collect_application_number_two_after,
			           	crows_web_collect_application_number_three_after:crows_web_collect_application_number_three_after,
			           	delivery_schedule_after:delivery_schedule_after,
			           	email_address_text_after:email_address_text_after,
			           	incoming_model_after:incoming_model_after,
			           	email_address_textdate_after:email_address_textdate_after,
			           	email_address_textedit_after:email_address_textedit_after,
			           	email_address_textedit_one_after:email_address_textedit_one_after,
			           	email_address_textdate_one_after:email_address_textdate_one_after,
			           	crochet_storage_after:crochet_storage_after,
			           	prepare_after:prepare_after,
			           	amount_requested_by_paying_bank_after:amount_requested_by_paying_bank_after,
			           	issuing_and_paying_after:issuing_and_paying_after,
			           	the_issuing_bank_requests_after:the_issuing_bank_requests_after,
			           	the_first_residence_after:the_first_residence_after,
			           	destination_address_after:destination_address_after,
			           	issuing_agent_bank_one_after:issuing_agent_bank_one_after,
			           	issuing_agent_bank_two_after:issuing_agent_bank_two_after,
			           	first_name_requested_after:first_name_requested_after,
			           	request_for_storage_agency_after:request_for_storage_agency_after,
			           	first_name_of_daixing_after: first_name_of_daixing_after,
			           	the_issuing_bank_asks_after:the_issuing_bank_asks_after,
			           	first_address_of_the_issuing_bank_after:first_address_of_the_issuing_bank_after,
			           	the_address_of_the_apartment_address_after:the_address_of_the_apartment_address_after,
			           	first_telephone_number_of_the_issuing_after:first_telephone_number_of_the_issuing_after,
			           	issuing_agent_bank_management_number_after:issuing_agent_bank_management_number_after,
			           	name_of_the_agent_after:name_of_the_agent_after,
			           	prepared_by_the_issuing_bank_after:prepared_by_the_issuing_bank_after,
			           	multiple_mouth_key_after:multiple_mouth_key_after,
			           	search_key_title_one_after:search_key_title_one_after,
			           	search_key_one_after:search_key_one_after,
			           	search_key_title_two_after:search_key_title_two_after,
			           	search_key_two_after:search_key_two_after,
			           	search_key_title_three_after:search_key_title_three_after,
			           	search_key_three_after:search_key_three_after,
			           	search_key_title_four_after:search_key_title_four_after,
			           	search_key_four_after:search_key_four_after,
			           	search_key_title_five_after:search_key_title_five_after,
			           	search_key_five_after:search_key_five_after,
			           	prepare_two_after:prepare_two_after,
			           	prepare_three_after:prepare_three_after,
			           	classification_of_mail_after:classification_of_mail_after,
			           	email_address_edit_two_after:email_address_edit_two_after,
			           	email_address_edit_three_after:email_address_edit_three_after,
			           	mail_completion_after:mail_completion_after,
			           	email_address_edit_four_after:email_address_edit_four_after,
			           	email_address_edit_five_after:email_address_edit_five_after,
			           	use_completed_mail_after:use_completed_mail_after,
			           	use_completed_mail_edit_one_after:use_completed_mail_edit_one_after,
			           	use_completed_mail_edit_two_after:use_completed_mail_edit_two_after
					}
					
					var key = primary_tranid_after+primary_temperature_unit_after+primary_shipping_date_after+primary_freight_company_after;
						dataArr.push({
							key:key,
							amount:defaultEmptyToZero(primary_amount_after),
							substitution:defaultEmptyToZero(primary_total_amount_after),
							insurancePremium:defaultEmptyToZero(primary_insurance_premium_after),
							
							primary_zip_code_after:primary_zip_code_after,//主要郵便番号
							primary_tranid_after:primary_tranid_after,//主要受注番号
							primary_temperature_unit_after:primary_temperature_unit_after,//主要温度単位
							primary_shipping_date_after:primary_shipping_date_after,//主要出荷日
							primary_delivery_name_after:primary_delivery_name_after,//主要DJ_運送会社
							primary_freight_company_after:primary_freight_company_after,//主要届け先名
							primary_address_after:primary_address_after,//主要お届け先の住所
							primary_delivery_date_after:primary_delivery_date_after,//主要納品日
							primary_sending_table_after:primary_sending_table_after,//主要送り状備考欄
							primary_insurance_after:primary_insurance_after,//主要保険付
//							primary_shipping_information_after:primary_shipping_information_after,//主要出荷指示情報(メモ欄)
							
							sending_type_after:sending_type_after,//送り状種類
							data:yamatoData
						})
				}
				nlapiLogExecution('DEBUG', 'dataArr', JSON.stringify(dataArr))	
				var totalArray  = arrayAddDeduplication(dataArr,primary_freight_company_after) //金額を集計し、重複データを除去した後の配列
				nlapiLogExecution('DEBUG', 'totalArray', JSON.stringify(totalArray))	
				
				var dataBatchnumber = guid();
				var mainCsvStr = '送り状作成機能データテーブル管理番号,データ,共通id\r\n';
				nlapiLogExecution('DEBUG', 'dataBatchnumber', JSON.stringify(dataBatchnumber))
				for(var ya= 0 ; ya < totalArray.length;ya++){
					var amount = Number(totalArray[ya].amount)
			        var substitution = Number(totalArray[ya].substitution)
			        var insurancePremium = Number(totalArray[ya].insurancePremium)
			        
			        var data = JSON.stringify(totalArray[ya].data);
					subList.setLineItemValue( 'custpage_mainline_zip_code', ya+1, totalArray[ya].primary_zip_code_after);//主要郵便番号
					subList.setLineItemValue( 'custpage_mainline_tranid', ya+1, totalArray[ya].primary_tranid_after);//主要受注番号
					subList.setLineItemValue( 'custpage_mainline_temperature_unit', ya+1, totalArray[ya].primary_temperature_unit_after);//主要温度単位
					subList.setLineItemValue( 'custpage_mainline_shipping_date', ya+1, totalArray[ya].primary_shipping_date_after);//主要出荷日
					subList.setLineItemValue( 'custpage_mainline_freight_company', ya+1, totalArray[ya].primary_freight_company_after);//主要DJ_運送会社
					subList.setLineItemValue( 'custpage_mainline_delivery_name', ya+1, totalArray[ya].primary_delivery_name_after);//主要届け先名
					subList.setLineItemValue( 'custpage_mainline_address', ya+1, totalArray[ya].primary_address_after);//主要お届け先の住所
					subList.setLineItemValue( 'custpage_mainline_delivery_date', ya+1, totalArray[ya].primary_delivery_date_after);//主要納品日
					subList.setLineItemValue( 'custpage_mainline_sending_table', ya+1, totalArray[ya].primary_sending_table_after);//主要送り状備考欄
					subList.setLineItemValue( 'custpage_mainline_amount', ya+1, amount);//主要金額
					
					subList.setLineItemValue( 'custpage_mainline_total_amount', ya+1, substitution);//主要代引金額
					subList.setLineItemValue( 'custpage_mainline_insurance_premium', ya+1, insurancePremium);//主要保険料
					//end
					subList.setLineItemValue( 'custpage_sending_type', ya+1, totalArray[ya].sending_type_after);//送り状種類 changed by zhou 20230213
					subList.setLineItemValue( 'custpage_handling_one', ya+1, '');
					subList.setLineItemValue( 'custpage_handling_two', ya+1, '');
					subList.setLineItemValue( 'custpage_mainline_dataserialnumber', ya+1, totalArray[ya].dataSerialnumber);//送り状作成機能データテーブル管理番号
					var newTotalArrayToJson = JSON.stringify(totalArray[ya].data).replace(/\,/g,'FFFFF')
					mainCsvStr += totalArray[ya].dataSerialnumber +','+newTotalArrayToJson+'\r\n';
				}
				
				var fieldId = csvMaker(mainCsvStr);
				fieldidText.setDefaultValue(fieldId);
			}
		 }	 
	}
//	 var Search = nlapiSearchRecord("customrecord_djkk_invoice_creation_data",null,
//				[
//				   ["internalid","isnotempty",""]
//				], 
//				[
//				   new nlobjSearchColumn("internalid"), 
//				]
//				);
//	 if(!isEmpty(Search)){
//		 for(var aaa = 0 ; aaa < Search.length ; aaa++){
//				nlapiDeleteRecord('customrecord_djkk_invoice_creation_data',Search[aaa].getValue("internalid"));
//			 }	 
//	 }
	
	 
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
//function csvDown(xmlString){	
//	try{	
//		
//		var xlsFile = nlapiCreateFile('配送用' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
//			
//		xlsFile.setFolder(FILE_CABINET_ID_TOTAL_INV_OUTPUT_FILE);	
//		xlsFile.setName('配送用' + '_' + getFormatYmdHms() + '.csv');	
//		xlsFile.setEncoding('SHIFT_JIS');	
//	    
//		// save file	
//		return  nlapiSubmitFile(xlsFile);	
//	}
//	catch(e){	
//		nlapiLogExecution('DEBUG', 'no error csvDown', e)	
//	}	
//}
function unique1(arr){
	  var hash=[];
	  for (var i = 0; i < arr.length; i++) {
	     if(hash.indexOf(arr[i])==-1){
	      hash.push(arr[i]);
	     }
	  }
	  return hash;
}
function arrayAddDeduplication(arr,expressType){
	nlapiLogExecution('debug','arrayAddDeduplication', 'in')
	var newArr = []; 
	var nameArr = []; 
	if(expressType == 'ヤマト運輸株式会社'){
		for (var i = 0; i < arr.length; i++) {
			var newDataArr = [];//グループ化されたデータに対応するグループ化前明細行データ
			  if (nameArr.indexOf(arr[i].key) === -1) {
				  newDataArr.push(arr[i].data);
			      newArr.push({
			    	key: arr[i].key,
			    	amount: arr[i].amount,
			    	substitution: arr[i].substitution,
			    	insurancePremium: arr[i].insurancePremium,
			    	primary_zip_code_after:arr[i].primary_zip_code_after,//主要郵便番号
			    	primary_tranid_after:arr[i].primary_tranid_after,//主要受注番号
			    	primary_temperature_unit_after:arr[i].primary_temperature_unit_after,//主要温度単位
			    	primary_shipping_date_after:arr[i].primary_shipping_date_after,//主要出荷日
			    	primary_delivery_name_after:arr[i].primary_delivery_name_after,//主要DJ_運送会社
			    	primary_freight_company_after:arr[i].primary_freight_company_after,//主要届け先名
			    	primary_address_after:arr[i].primary_address_after,//主要お届け先の住所
			    	primary_delivery_date_after:arr[i].primary_delivery_date_after,//主要納品日
			    	primary_sending_table_after:arr[i].primary_sending_table_after,//主要送り状備考欄
			    	primary_insurance_after:arr[i].primary_insurance_after,//主要保険付
//			    	primary_shipping_information_after:arr[i].primary_shipping_information_after,//主要出荷指示情報(メモ欄)
			    	sending_type_after:arr[i].sending_type_after,//送り状種類
			    	data: newDataArr,
			        dataSerialnumber:guid()
		//	    	JSON.stringify()
//			    	JSON.parse()
			    });
			    nameArr.push(arr[i].key);
			  } else {
			    for (var j = 0; j < newArr.length; j++) {
			      if (arr[i].key === newArr[j].key) {
			        var amount = Number(newArr[j].amount)
			        var substitution = Number(newArr[j].substitution)
			        var insurancePremium = Number(newArr[j].insurancePremium)
			        var data = newArr[j].data;
			        
			        var newAmount = Number(arr[i].amount)
			        var newSubstitution = Number(arr[i].substitution)
			        var newInsurancePremium = Number(arr[i].insurancePremium)
			        var newData = arr[i].data;
			        data.push(newData)
			        newAmount+= amount ;
			        newSubstitution+= substitution ;
			        newInsurancePremium += insurancePremium ;
			        newArr[j].amount = newAmount;
			        newArr[j].substitution = newSubstitution;
			        newArr[j].insurancePremium = newInsurancePremium;
			        newArr[j].data = data;
			      }
			    }
			  }
			}
	}else if(expressType == '日本通運株式会社'){
		for (var i = 0; i < arr.length; i++) {
			var newDataArr = [];//グループ化されたデータに対応するグループ化前明細行データ
			  if (nameArr.indexOf(arr[i].key) === -1) {
				  newDataArr.push(arr[i].data);
			      newArr.push({
			    	key: arr[i].key,
			    	amount: arr[i].amount,
			    	substitution: arr[i].substitution,
			    	insurancePremium: arr[i].insurancePremium,
			    	primary_zip_code_after:arr[i].primary_zip_code_after,//主要郵便番号
			    	primary_tranid_after:arr[i].primary_tranid_after,//主要受注番号
			    	primary_temperature_unit_after:arr[i].primary_temperature_unit_after,//主要温度単位
			    	primary_shipping_date_after:arr[i].primary_shipping_date_after,//主要出荷日
			    	primary_delivery_name_after:arr[i].primary_delivery_name_after,//主要DJ_運送会社
			    	primary_freight_company_after:arr[i].primary_freight_company_after,//主要届け先名
			    	primary_address_after:arr[i].primary_address_after,//主要お届け先の住所
			    	primary_delivery_date_after:arr[i].primary_delivery_date_after,//主要納品日
			    	primary_sending_table_after:arr[i].primary_sending_table_after,//主要送り状備考欄
			    	primary_insurance_after:arr[i].primary_insurance_after,//主要保険付
			    	data: newDataArr,
			        dataSerialnumber:guid()
		//	    	JSON.stringify()
//			    	JSON.parse()
			    });
			    nameArr.push(arr[i].key);
			  } else {
			    for (var j = 0; j < newArr.length; j++) {
			      if (arr[i].key === newArr[j].key) {
			        var amount = Number(newArr[j].amount)
			        var substitution = Number(newArr[j].substitution)
			        var insurancePremium = Number(newArr[j].insurancePremium)
			        var data = newArr[j].data;
			        
			        var newAmount = Number(arr[i].amount)
			        var newSubstitution = Number(arr[i].substitution)
			        var newInsurancePremium = Number(arr[i].insurancePremium)
			        var newData = arr[i].data;
			        data.push(newData)
			        newAmount+= amount ;
			        newSubstitution+= substitution ;
			        newInsurancePremium += insurancePremium ;
			        newArr[j].amount = newAmount;
			        newArr[j].substitution = newSubstitution;
			        newArr[j].insurancePremium = newInsurancePremium;
			        newArr[j].data = data;
			      }
			    }
			  }
			}
	
	}else if(expressType == '佐川運輸株式会社'){
		for (var i = 0; i < arr.length; i++) {
			var newDataArr = [];//グループ化されたデータに対応するグループ化前明細行データ
			  if (nameArr.indexOf(arr[i].key) === -1) {
				  newDataArr.push(arr[i].data);
			      newArr.push({
			    	key: arr[i].key,
			    	amount: arr[i].amount,
			    	substitution: arr[i].substitution,
			    	insurancePremium: arr[i].insurancePremium,
			    	primary_zip_code_after:arr[i].primary_zip_code_after,//主要郵便番号
			    	primary_tranid_after:arr[i].primary_tranid_after,//主要受注番号
			    	primary_temperature_unit_after:arr[i].primary_temperature_unit_after,//主要温度単位
			    	primary_shipping_date_after:arr[i].primary_shipping_date_after,//主要出荷日
			    	primary_delivery_name_after:arr[i].primary_delivery_name_after,//主要DJ_運送会社
			    	primary_freight_company_after:arr[i].primary_freight_company_after,//主要届け先名
			    	primary_address_after:arr[i].primary_address_after,//主要お届け先の住所
			    	primary_delivery_date_after:arr[i].primary_delivery_date_after,//主要納品日
			    	primary_sending_table_after:arr[i].primary_sending_table_after,//主要送り状備考欄
			    	primary_insurance_after:arr[i].primary_insurance_after,//主要保険付
			    	primary_shipping_information_after:arr[i].primary_shipping_information_after,//主要出荷指示情報(メモ欄)
			    	
			    	custpage_speed_designation_after:arr[i].custpage_speed_designation_after,//スピード指定
					custpage_delivery_specified_time_after:arr[i].custpage_delivery_specified_time_after,//配達指定時間（時分）
//					custpage_designatied_seal_1_after:arr[i].custpage_designatied_seal_1,//指定シール１
					custpage_sales_office_pickup_after:arr[i].custpage_sales_office_pickup,//営業所受取
					custpage_src_segmentation_after:arr[i].custpage_src_segmentation,//SRC区分
					custpage_original_arrival_category_after:arr[i].custpage_original_arrival_category,//元着区分
			    	data: newDataArr,
			        dataSerialnumber:guid()
		//	    	JSON.stringify()
//			    	JSON.parse()
			    });
			    nameArr.push(arr[i].key);
			  } else {
			    for (var j = 0; j < newArr.length; j++) {
			      if (arr[i].key === newArr[j].key) {
			        var amount = Number(newArr[j].amount)
			        var substitution = Number(newArr[j].substitution)
			        var insurancePremium = Number(newArr[j].insurancePremium)
			        var data = newArr[j].data;
			        
			        var newAmount = Number(arr[i].amount)
			        var newSubstitution = Number(arr[i].substitution)
			        var newInsurancePremium = Number(arr[i].insurancePremium)
			        var newData = arr[i].data;
			        data.push(newData)
			        newAmount+= amount ;
			        newSubstitution+= substitution ;
			        newInsurancePremium += insurancePremium ;
			        newArr[j].amount = newAmount;
			        newArr[j].substitution = newSubstitution;
			        newArr[j].insurancePremium = newInsurancePremium;
			        newArr[j].data = data;
			      }
			    }
			  }
			}
	
	}else if(expressType == '西濃'){
		
	}
		
	return newArr;
}
function csvMaker(str){
	try{
	
		var xlsFile = nlapiCreateFile('送り状作成機能csvデータ' + '_' + getFormatYmdHms() + '.csv', 'CSV', str);
		
		xlsFile.setFolder(FILE_CABINET_ID_DJ_INVOICE_CREATE_MAIN);
		xlsFile.setName('送り状作成機能csv' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setEncoding('UTF-8');
			
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		return fileID; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', '', e.message)
	}
}