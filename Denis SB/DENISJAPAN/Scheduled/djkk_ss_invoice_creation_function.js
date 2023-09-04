/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Feb 2023     zhou	
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug','start','start')
	var otherDataArr = JSON.parse(nlapiGetContext().getSetting('SCRIPT','custscript_djkk_data'));
	var fileid = parseInt(JSON.parse(nlapiGetContext().getSetting('SCRIPT','custscript_djkk_fieldid')));
	var express = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_freight_company');
	var jobId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_jobid');
	nlapiLogExecution('debug','fileid',fileid)
	var filed = nlapiLoadFile(fileid);
	var fileArr = filed.getValue().split('\r\n');
	
	var csvStr;
	if(express == "ヤマト運輸株式会社"){
		var mainCsvArr = [];
		for(var i = 1 ; i  < fileArr.length ; i++){
			 if(!isEmpty(fileArr[i])){
			 var fileLine = fileArr[i].split(',')
			 // 
			 var dataSerialnumber = fileLine[0];
			 var mainCsvData =fileLine[1].replace(/\FFFFF/g,',');
			 mainCsvArr.push({
				 dataSerialnumber:dataSerialnumber,
				 mainCsvData:mainCsvData
			 })
			 
			 }
		}
		for(var aa = 0 ; aa < mainCsvArr.length ; aa++){
			 var dataSerialnumber = mainCsvArr[aa].dataSerialnumber;
			 var data = mainCsvArr[aa].mainCsvData;
			 
			 if(!isEmpty(dataSerialnumber)){
			      for(var v = 0 ; v < otherDataArr.length ; v++){
			           if(otherDataArr[v].dataserialnumber == dataSerialnumber){
					       otherDataArr[v].data = data;
			           }
			      }
			 }else{
				 nlapiLogExecution('error','データ異常','送り状作成機能データテーブル管理番号(dataSerialnumber)存在しない')
			 }
		}
		csvStr = 'お客様管理番号 ,送り状種類 ,クール区分 ,伝票番号 ,出荷予定日 ,お届け予定日 ,配達時間帯 ,お届け先コード ,お届け先電話番号 ,お届け先電話番号枝番 ,お届け先郵便番号 ,お届け先住所 ,お届け先アパートマンション名 ,お届け先会社・部門１,お届け先会社・部門２,お届け先名 ,お届け先名(ｶﾅ),敬称 ,ご依頼主コード ,ご依頼主電話番号 ,ご依頼主電話番号枝番 ,ご依頼主郵便番号 ,ご依頼主住所 ,ご依頼主アパートマンション,ご依頼主名 ,ご依頼主名(ｶﾅ),品名コード１,品名１,品名コード２,品名２,荷扱い１,荷扱い２,記事 ,ｺﾚｸﾄ代金引換額（税込),内消費税額等 ,止置き ,営業所コード ,発行枚数 ,個数口表示フラグ ,請求先顧客コード ,請求先分類コード ,運賃管理番号 ,クロネコwebコレクトデータ登録 ,クロネコwebコレクト加盟店番号 ,クロネコwebコレクト申込受付番号１,クロネコwebコレクト申込受付番号2,クロネコwebコレクト申込受付番号3,お届け予定ｅメール利用区分 ,お届け予定ｅメールe-mailアドレス ,入力機種 ,お届け予定ｅメールメッセージ ,お届け完了ｅメール利用区分 ,お届け完了ｅメールe-mailアドレス ,お届け完了ｅメールメッセージ ,クロネコ収納代行利用区分 ,予備 ,収納代行請求金額(税込),収納代行内消費税額等 ,収納代行請求先郵便番号 ,収納代行請求先住所,収納代行請求先住所（アパートマンション名） ,収納代行請求先会社・部門名１,収納代行請求先会社・部門名2 ,収納代行請求先名(漢字),収納代行請求先名(カナ),収納代行問合せ先名(漢字),収納代行問合せ先郵便番号 ,収納代行問合せ先住所 ,収納代行問合せ先住所（アパートマンション名）,収納代行問合せ先電話番号 ,収納代行管理番号 ,収納代行品名 ,収納代行備考 ,複数口くくりキー ,検索キータイトル1,検索キー1,検索キータイトル2,検索キー2,検索キータイトル3,検索キー3,検索キータイトル4,検索キー4,検索キータイトル5,検索キー5,予備tdo重複 ,予備tdo重複 ,投函予定メール利用区分 ,投函予定メールe-mailアドレス ,投函予定メールメッセージ ,投函完了メール（お届け先宛）利用区分 ,投函完了メール（お届け先宛）e-mailアドレス ,投函完了メール（お届け先宛）メールメッセージ ,投函完了メール（ご依頼主宛）利用区分 ,投函完了メール（ご依頼主宛）e-mailアドレス ,投函完了メール（ご依頼主宛）メールメッ\r\n';
		var soArr = [];//更新される注文書配列
		for(var od = 0 ; od < otherDataArr.length ; od++){
			var custpage_handling_one = defaultEmpty(otherDataArr[od].custpage_handling_one);
			var custpage_handling_two = defaultEmpty(otherDataArr[od].custpage_handling_two);
			var custpage_sending_type = defaultEmpty(otherDataArr[od].custpage_sending_type);
			var deliveryTimeZone = defaultEmpty(otherDataArr[od].deliveryTimeZone);//配達指定時間帯  changed by zhou 20230310
			var csvData = JSON.parse(otherDataArr[od].data);
			for(var m = 0 ; m < csvData.length ; m++){
				
				var lineNum_after = csvData[m].lineNum_after;//lineNumber
				var soid_after = csvData[m].soid_after;//soid
				soArr.push({
					soid:soid_after,
					lineNum:lineNum_after
				})
				var primary_zip_code = csvData[m].primary_zip_code_after;//主要郵便番号
				var primary_tranid = csvData[m].primary_tranid_after;//主要受注番号
				var primary_temperature_unit = csvData[m].primary_temperature_unit_after;//主要温度単位
				var primary_shipping_date = csvData[m].primary_shipping_date_after;//主要出荷日
				var primary_delivery_name = csvData[m].primary_delivery_name_after;//主要DJ_運送会社
				var primary_freight_company = csvData[m].primary_freight_company_after;//主要届け先名
				var primary_address = csvData[m].primary_address_after;//主要お届け先の住所
				var primary_delivery_date = csvData[m].primary_delivery_date_after;//主要納品日
				var primary_sending_table = csvData[m].primary_sending_table_after;//主要送り状備考欄
				var primary_insurance = '';//主要保険付
				var primary_shipping_information = csvData[m].primary_shipping_information_after;//主要出荷指示情報(メモ欄)
//						/荷扱い1
				var handling_one = '';
				if(custpage_handling_one == 'T'){
					handling_one = 'ワレ物注意'
				}
				//荷扱い2
				var handling_two ='';
				if(custpage_handling_two == 'T'){
					handling_two = '天地無用'
				}
				var customer_control_number = csvData[m].customer_control_number_after;
				var sending_type = custpage_sending_type;
				var cool_division = csvData[m].cool_division_after;
				var ticket_number = csvData[m].ticket_number_after;
				var delivery_date_text = csvData[m].delivery_date_text_after;
				var expected_date_of_delivery = csvData[m].expected_date_of_delivery_after;
				var arrival_time_band = deliveryTimeZone;
				var delivery_code_text = csvData[m].delivery_code_text_after;
				var destination_phone_number = csvData[m].destination_phone_number_after;
				var telephone_number_branch_number = csvData[m].telephone_number_branch_number_after;
				var delivery_zip_code_text = csvData[m].delivery_zip_code_text_after;
				var delivery_address_text = csvData[m].delivery_address_text_after;
				var apartment_house_apartment = csvData[m].apartment_house_apartment_after;
				var delivery_company_one = csvData[m].delivery_company_one_after;
				var delivery_company_two = csvData[m].delivery_company_two_after;
				var	destination_name = csvData[m].destination_name_after;
				var destination_name_text = csvData[m].destination_name_text_after;
				var honorific_appellation = csvData[m].honorific_appellation_after;
				var client_code = csvData[m].client_code_after;
				var main_phone_number = csvData[m].main_phone_number_after;
				var branch_number = csvData[m].branch_number_after;
				var main_address = csvData[m].main_address_after;
				var main_name = csvData[m].main_name_after;
				var main_apartment = csvData[m].main_apartment_after;
				var main_zip_code = csvData[m].main_zip_code_after;
				var main_name_text = csvData[m].main_name_text_after;
				var code_name_one = csvData[m].code_name_one_after;
				var product_name_one = csvData[m].product_name_one_after;
				var code_name_two = csvData[m].code_name_two_after;
				var product_name_two = csvData[m].product_name_two_after;
	           	var article = csvData[m].article_after;
	           	var the_amount_of_money_exchanged = csvData[m].the_amount_of_money_exchanged_after;
	           	var domestic_consumption_tax = csvData[m].domestic_consumption_tax_after;
	           	var stop = csvData[m].stop_after;
	           	var business_office_code = csvData[m].business_office_code_after;
	           	var number_of_rows = csvData[m].number_of_rows_after;
	           	var number_display_flag = csvData[m].number_display_flag_after;
	           	var invoice_client_code = csvData[m].invoice_client_code_after;
	           	var claim_classification_code = csvData[m].claim_classification_code_after;
	           	var transportation_management_number = csvData[m].transportation_management_number_after;
	           	var crows_web_collect_data_registration = csvData[m].crows_web_collect_data_registration_after;
	           	var crows_web_collection = csvData[m].crows_web_collection_after;
	           	var crows_web_collect_application_number_one = csvData[m].crows_web_collect_application_number_one_after;
	           	var crows_web_collect_application_number_two = csvData[m].crows_web_collect_application_number_two_after;
	           	var crows_web_collect_application_number_three = csvData[m].crows_web_collect_application_number_three_after;
	           	var delivery_schedule = csvData[m].delivery_schedule_after;
	           	var email_address_text = csvData[m].email_address_text_after;
	           	var incoming_model = csvData[m].incoming_model_after;
	           	var email_address_textdate = csvData[m].email_address_textdate_after;
	           	var email_address_textedit = csvData[m].email_address_textedit_after;
	           	var email_address_textedit_one = csvData[m].email_address_textedit_one_after;
	           	var email_address_textdate_one = csvData[m].email_address_textdate_one_after;
	           	var crochet_storage = csvData[m].crochet_storage_after;
	           	var prepare = csvData[m].prepare_after;
	           	var amount_requested_by_paying_bank = csvData[m].amount_requested_by_paying_bank_after;
	           	var issuing_and_paying = csvData[m].issuing_and_paying_after;
	           	var the_issuing_bank_requests = csvData[m].the_issuing_bank_requests_after;
	           	var the_first_residence = csvData[m].the_first_residence_after;
	           	var destination_address = csvData[m].destination_address_after;
	           	var issuing_agent_bank_one = csvData[m].issuing_agent_bank_one_after;
	           	var issuing_agent_bank_two = csvData[m].issuing_agent_bank_two_after;
	           	var first_name_requested = csvData[m].first_name_requested_after;
	           	var request_for_storage_agency = csvData[m].request_for_storage_agency_after;
	           	var first_name_of_daixing = csvData[m]. first_name_of_daixing_after;
	           	var the_issuing_bank_asks = csvData[m].the_issuing_bank_asks_after;
	           	var first_address_of_the_issuing_bank = csvData[m].first_address_of_the_issuing_bank_after;
	           	var the_address_of_the_apartment_address = csvData[m].the_address_of_the_apartment_address_after;
	           	var first_telephone_number_of_the_issuing = csvData[m].first_telephone_number_of_the_issuing_after;
	           	var issuing_agent_bank_management_number = csvData[m].issuing_agent_bank_management_number_after;
	           	var name_of_the_agent = csvData[m].name_of_the_agent_after;
	           	var prepared_by_the_issuing_bank = csvData[m].prepared_by_the_issuing_bank_after;
	           	var multiple_mouth_key = csvData[m].multiple_mouth_key_after;
	           	var search_key_title_one = csvData[m].search_key_title_one_after;
	           	var search_key_one = csvData[m].search_key_one_after;
	           	var search_key_title_two = csvData[m].search_key_title_two_after;
	           	var search_key_two = csvData[m].search_key_two_after;
	           	var search_key_title_three = csvData[m].search_key_title_three_after;
	           	var search_key_three = csvData[m].search_key_three_after;
	           	var search_key_title_four = csvData[m].search_key_title_four_after;
	           	var search_key_four = csvData[m].search_key_four_after;
	           	var search_key_title_five = csvData[m].search_key_title_five_after;
	           	var search_key_five = csvData[m].search_key_five_after;
	           	var prepare_two = csvData[m].prepare_two_after;
	           	var prepare_three = csvData[m].prepare_three_after;
	           	var classification_of_mail = csvData[m].classification_of_mail_after;
	           	var email_address_edit_two = csvData[m].email_address_edit_two_after;
	           	var email_address_edit_three = csvData[m].email_address_edit_three_after;
	           	var mail_completion = csvData[m].mail_completion_after;
	           	var email_address_edit_four = csvData[m].email_address_edit_four_after;
	           	var email_address_edit_five = csvData[m].email_address_edit_five_after;
	           	var use_completed_mail = csvData[m].use_completed_mail_after;
	           	var use_completed_mail_edit_one = csvData[m].use_completed_mail_edit_one_after;
	           	var use_completed_mail_edit_two = csvData[m].use_completed_mail_edit_two_after;
				
				customer_control_number = '';
				ticket_number = '';
				delivery_code_text = '';
				telephone_number_branch_number = '';
				destination_name_text = '';
				honorific_appellation = '';
				branch_number = '';
				main_name_text = '';
				code_name_one = '';
	           	domestic_consumption_tax = '';
	           	stop = '';
	           	business_office_code = '';
	           	number_of_rows = '';
	           	number_display_flag = '';
	           	crows_web_collect_data_registration = '';
	           	crows_web_collection = '';
	           	crows_web_collect_application_number_one = '';
	           	crows_web_collect_application_number_two = '';
	           	crows_web_collect_application_number_three = '';
	           	delivery_schedule = '';
	           	email_address_text = '';
	           	incoming_model = '';
	           	email_address_textdate = '';
	           	email_address_textedit = '';
	           	email_address_textedit_one = '';
	           	email_address_textdate_one = '';
	           	crochet_storage = '';
	           	amount_requested_by_paying_bank = '';
	           	issuing_and_paying = '';
	           	the_issuing_bank_requests = '';
	           	the_first_residence = '';
	           	destination_address = '';
	           	issuing_agent_bank_one = '';
	           	issuing_agent_bank_two = '';
	           	first_name_requested = '';
	           	request_for_storage_agency = '';
	           	first_name_of_daixing = '';
	           	the_issuing_bank_asks = '';
	           	first_address_of_the_issuing_bank = '';
	           	the_address_of_the_apartment_address = '';
	           	first_telephone_number_of_the_issuing = '';
	           	issuing_agent_bank_management_number = '';
	           	name_of_the_agent = '';
	           	prepared_by_the_issuing_bank ='';
	           	multiple_mouth_key = '';
	           	search_key_title_one = '';
	           	search_key_one = '';
	           	search_key_title_two = '';
	           	search_key_two = '';
	           	search_key_title_three = '';
	           	search_key_three = '';
	           	search_key_title_four = '';
	           	search_key_four = '';
	           	search_key_title_five = '';
	           	search_key_five = '';
	           	prepare_two = '';
	           	prepare_three = '';
	           	classification_of_mail = '';
	           	email_address_edit_two = '';
	           	email_address_edit_three = '';
	           	mail_completion = '';
	           	email_address_edit_four = '';
	           	email_address_edit_five = '';
	           	use_completed_mail = '';
	           	use_completed_mail_edit_one = '';
	           	use_completed_mail_edit_two = '';
	           	csvStr += customer_control_number +','+sending_type +','+cool_division +','+ticket_number +','+delivery_date_text +','+expected_date_of_delivery +','+arrival_time_band +','+delivery_code_text +','+destination_phone_number +','+telephone_number_branch_number +','+delivery_zip_code_text  +','+delivery_address_text  +','+apartment_house_apartment  +','+delivery_company_one  +','+delivery_company_two  +','+destination_name  +','+destination_name_text  +','+honorific_appellation  +','+client_code  +','+main_phone_number  +','+branch_number  +','+main_zip_code  +','+main_address  +','+main_apartment+','+main_name  +','+main_name_text  +','+code_name_one  +','+product_name_one  +','+code_name_two  +','+product_name_two  +','+handling_one  +','+handling_two  +','+article  +','+the_amount_of_money_exchanged  +','+domestic_consumption_tax  +','+stop  +','+business_office_code  +','+number_of_rows  +','+number_display_flag  +','+invoice_client_code  +','+claim_classification_code  +','+transportation_management_number  +','+crows_web_collect_data_registration  +','+crows_web_collection  +','+crows_web_collect_application_number_one  +','+crows_web_collect_application_number_two  +','+crows_web_collect_application_number_three  +','+delivery_schedule  +','+email_address_text  +','+incoming_model  +','+email_address_textdate  +','+email_address_textedit  +','+email_address_textedit_one  +','+email_address_textdate_one  +','+crochet_storage  +','+prepare  +','+amount_requested_by_paying_bank  +','+issuing_and_paying  +','+the_issuing_bank_requests  +','+the_first_residence  +','+destination_address  +','+issuing_agent_bank_one  +','+issuing_agent_bank_two  +','+first_name_requested  +','+request_for_storage_agency  +','+first_name_of_daixing  +','+the_issuing_bank_asks  +','+first_address_of_the_issuing_bank  +','+the_address_of_the_apartment_address  +','+first_telephone_number_of_the_issuing  +','+issuing_agent_bank_management_number  +','+name_of_the_agent  +','+prepared_by_the_issuing_bank  +','+multiple_mouth_key  +','+search_key_title_one  +','+search_key_one  +','+search_key_title_two  +','+search_key_two  +','+search_key_title_three  +','+search_key_three  +','+search_key_title_four  +','+search_key_four  +','+search_key_title_five  +','+search_key_five  +','+prepare_two  +','+prepare_three  +','+classification_of_mail  +','+email_address_edit_two  +','+email_address_edit_three  +','+mail_completion  +','+email_address_edit_four  +','+email_address_edit_five  +','+use_completed_mail  +','+use_completed_mail_edit_one  +','+use_completed_mail_edit_two; 
	           	csvStr+="\r\n";
			}
		}
	}else if(express == "日本通運株式会社"){
		var mainCsvArr = [];
		for(var i = 1 ; i  < fileArr.length ; i++){
			 if(!isEmpty(fileArr[i])){
			 var fileLine = fileArr[i].split(',')
			 // 
			 var dataSerialnumber = fileLine[0];
			 var mainCsvData =fileLine[1].replace(/\FFFFF/g,',');
			 mainCsvArr.push({
				 dataSerialnumber:dataSerialnumber,
				 mainCsvData:mainCsvData
			 })
			 
			 }
		}
		for(var aa = 0 ; aa < mainCsvArr.length ; aa++){
			 var dataSerialnumber = mainCsvArr[aa].dataSerialnumber;
			 var data = mainCsvArr[aa].mainCsvData;
			 
			 if(!isEmpty(dataSerialnumber)){
			      for(var v = 0 ; v < otherDataArr.length ; v++){
			           if(otherDataArr[v].dataserialnumber == dataSerialnumber){
					       otherDataArr[v].data = data;
			           }
			      }
			 }else{
				 nlapiLogExecution('error','データ異常','送り状作成機能データテーブル管理番号(dataSerialnumber)存在しない')
			 }
		}
		csvStr = '郵便番号 ,住所1,住所2,住所3,お届け先名1,お届け先名2,電話番号 ,品名 ,個数 ,重量 ,集荷予定日 ,配達指定日 ,配達指定時間 ,お客様管理番号1,お客様管理番号2,お客様管理番号3,お客様管理番号4,お客様管理番号5,記事欄1,記事欄2,記事欄3,お荷物価格 ,保険金額\r\n';
		var soArr = [];//更新される注文書配列
		for(var od = 0 ; od < otherDataArr.length ; od++){
			var csvData = JSON.parse(otherDataArr[od].data);
			var substitution = otherDataArr[od].substitution;//主要代引金額
			var insurancePremium = otherDataArr[od].insurancePremium;//主要保険料
			var deliveryTimeZone = otherDataArr[od].deliveryTimeZone;//配達指定時間  changed by zhou 20230310
			
			for(var m = 0 ; m < csvData.length ; m++){
				var lineNum_after = csvData[m].lineNum_after;//lineNumber
				var soid_after = csvData[m].soid_after;//soid
				soArr.push({
					soid:soid_after,
					lineNum:lineNum_after
				})
				var lineNum_after = csvData[m].lineNum_after;//lineNumber
				var soid_after = csvData[m].soid_after;//soid
				var zipCode = csvData[m].zipAfter;//郵便番号
				var addr1 = csvData[m].prefecturesAfter;//住所1
				var addr2 = csvData[m].deliveryResidenceAfter;//住所2
				var addr3 = csvData[m].deliveryResidence2After;//住所3
				var deliveryName1 = csvData[m].custrecorddjkkNameAfter;//お届け先名1
				var deliveryName2 = csvData[m].custrecorddjkkName2After;//お届け先名2
				var tel = csvData[m].deliveryPhoneNumberAfter;//電話番号
				var itemName = csvData[m].displaynameAfter;//品名
				var number = csvData[m].quantityAfter;//個数
				var weight ='';//重量
				var expectedPickupDate = csvData[m].shipDateAfter;//集荷予定日
				var deliveryDate = csvData[m].deliveryDateAfter;//配達指定日
				var deliveryTime = deliveryTimeZone;//配達指定時間
				var controlNumber1 = '';//お客様管理番号1
				var controlNumber2 = csvData[m].tranid2After;//お客様管理番号2
				var controlNumber3 = csvData[m].tranid3After;//お客様管理番号3
				
				var controlNumber4 = csvData[m].tranid4After;//お客様管理番号4
				var controlNumber5 = csvData[m].tranid5After;//お客様管理番号5
				var comment1 =csvData[m].memo1After;//記事欄1
				var comment2 = csvData[m].memo2After;//記事欄2
				var comment3 = csvData[m].memo3After;//記事欄3
				var luggagePrice = csvData[m].amountAfter;//お荷物価格
				var insuranceAmount = insurancePremium;//保険金額
				
				csvStr += zipCode+','+addr1+','+addr2+','+addr3+','+deliveryName1+','+deliveryName2+','+tel+','+itemName+','+number+','+weight+','+expectedPickupDate+','+deliveryDate+','+deliveryTime+','+controlNumber1+','+controlNumber2+','+controlNumber3+','+controlNumber4+','+controlNumber5+','+comment1+','+comment2+','+comment3+','+luggagePrice+','+insuranceAmount;
				csvStr +="\r\n";
			}
		}
	}else if(express == "佐川運輸株式会社"){
		var mainCsvArr = [];
		for(var i = 1 ; i  < fileArr.length ; i++){
			 if(!isEmpty(fileArr[i])){
			 var fileLine = fileArr[i].split(',')
			 // 
			 var dataSerialnumber = fileLine[0];
			 var mainCsvData =fileLine[1].replace(/\FFFFF/g,',');
			 mainCsvArr.push({
				 dataSerialnumber:dataSerialnumber,
				 mainCsvData:mainCsvData
			 })
			 }
		}
		for(var aa = 0 ; aa < mainCsvArr.length ; aa++){
			 var dataSerialnumber = mainCsvArr[aa].dataSerialnumber;
			 var data = mainCsvArr[aa].mainCsvData;
			 
			 if(!isEmpty(dataSerialnumber)){
			      for(var v = 0 ; v < otherDataArr.length ; v++){
			           if(otherDataArr[v].dataserialnumber == dataSerialnumber){
					       otherDataArr[v].data = data;
			           }
			      }
			 }else{
				 nlapiLogExecution('error','データ異常','送り状作成機能データテーブル管理番号(dataSerialnumber)存在しない')
			 }
		}
		csvStr = 'お届け先コード取得区分 ,お届け先コード ,お届け先電話番号 ,お届け先郵便番号 ,お届け先住所１,お届け先住所２,お届け先住所３,お届け先名称１,お届け先名称２,お客様管理番号,お客様コード ,部署ご担当者コード取得区分 ,部署ご担当者コード ,部署ご担当者名称 ,荷送人電話番号 ,ご依頼主コード取得区分 ,ご依頼主コード ,ご依頼主電話番号 ,ご依頼主郵便番号 ,ご依頼主住所１,ご依頼主住所２,ご依頼主名称１,ご依頼主名称２,荷姿 ,品名１,品名２,品名３,品名４,品名５,荷札荷姿 ,荷札品名1,荷札品名2,荷札品名3,荷札品名4,荷札品名5,荷札品名6,荷札品名7,荷札品名8,荷札品名9,荷札品名10,荷札品名11,出荷個数 ,スピード指定 ,クール便指定 ,配達日 ,配達指定時間帯 ,配達指定時間（時分）,代引金額 ,消費税 ,決済種別 ,保険金額 ,指定シール１,指定シール２,指定シール３,営業所受取 ,SRC区分 ,営業所受取営業所コード ,元着区分 ,メールアドレス ,ご不在時連絡先 ,出荷日 ,お問い合せ送り状No,出荷場印字区分 ,集約解除指定 ,編集01,編集02,編集03,編集04,編集05,編集06,編集07,編集08,編集09,編集10\r\n';
		var soArr = [];//更新される注文書配列
//		var soObj = {};//個々の注文書のすべての情報
//		var solineNumArr = [];//個々の注文書のすべての明細行の行番号
		for(var od = 0 ; od < otherDataArr.length ; od++){
			var custpage_packing_figure = defaultEmpty(otherDataArr[od].custpage_packing_figure);//荷姿
			var custpage_speed_designation_after = "\t"+defaultEmpty(otherDataArr[od].custpage_speed_designation_after);//スピード指定
	
	//					var custpage_designatied_seal_1_after = defaultEmpty(otherDataArr[od].custpage_designatied_seal_1);//指定シール１
			var custpage_sales_office_pickup_after = defaultEmpty(otherDataArr[od].custpage_sales_office_pickup_after);//営業所受取
			var custpage_src_segmentation_after = defaultEmpty(otherDataArr[od].custpage_src_segmentation_after);//SRC区分
			var custpage_original_arrival_category_after = defaultEmpty(otherDataArr[od].custpage_original_arrival_category_after);//元着区分
			var custpage_mainline_shipping_information= defaultEmpty(otherDataArr[od].custpage_mainline_shipping_information);//主要出荷指示情報(メモ欄)
			var substitution = defaultEmpty(otherDataArr[od].substitution);//主要代引金額
			var insurancePremium = defaultEmpty(otherDataArr[od].insurancePremium);//主要保険料
			var deliveryTimeZone = "\t"+defaultEmpty(otherDataArr[od].deliveryTimeZone);//配達指定時間帯  changed by zhou 20230310
			var deliverySpecifiedHour = "\t"+defaultEmpty(otherDataArr[od].deliverySpecifiedHour);//配達指定時間（時）  changed by zhou 20230310
			var deliverySpecifiedMin = defaultEmpty(otherDataArr[od].deliverySpecifiedMin);//配達指定時間（分）  changed by zhou 20230310
			var custpage_delivery_specified_time_after = deliverySpecifiedHour+deliverySpecifiedMin;//配達指定時間（時分）
			var csvData = JSON.parse(otherDataArr[od].data);
			for(var m = 0 ; m < csvData.length ; m++){
				var lineNum_after = csvData[m].lineNum_after;//lineNumber
				var soid_after = csvData[m].soid_after;//soid
				soArr.push({
					soid:soid_after,
					lineNum:lineNum_after
				})
				var primary_zip_code = csvData[m].primary_zip_code_after;//主要郵便番号
				var primary_tranid = csvData[m].primary_tranid_after;//主要受注番号
				var primary_temperature_unit = csvData[m].primary_temperature_unit_after;//主要温度単位
				var primary_shipping_date = csvData[m].primary_shipping_date_after;//主要出荷日
				var primary_delivery_name = csvData[m].primary_delivery_name_after;//主要DJ_運送会社
				var primary_freight_company = csvData[m].primary_freight_company_after;//主要届け先名
				var primary_address = csvData[m].primary_address_after;//主要お届け先の住所
				var primary_delivery_date = csvData[m].primary_delivery_date_after;//主要納品日
				var primary_sending_table = csvData[m].primary_sending_table_after;//主要送り状備考欄
				var primary_insurance = csvData[m].primary_insurance_after;//主要保険付
				var primary_shipping_information = csvData[m].primary_shipping_information_after;//主要出荷指示情報(メモ欄)
				
				
				var deliveryCodeAcquisitionClassification = csvData[m].custpage_delivery_code_acquisition_classification_after;//お届け先コード取得区分
				var deliveryCode = csvData[m].custpage_delivery_code_after;//お届け先コード
				var deliveryPhoneNumber = csvData[m].custpage_delivery_phone_number_after;//お届け先電話番号
				var deliveryZipCode = csvData[m].custpage_delivery_zip_code_after;//お届け先郵便番号
				var deliveryAddress_1 = csvData[m].custpage_delivery_address_1_after;//お届け先住所１
				var deliveryAddress_2 = csvData[m].custpage_delivery_address_2_after;//お届け先住所2
				var deliveryAddress_3 = csvData[m].custpage_delivery_address_3_after;//お届け先住所3
				var deliveryName_1 = csvData[m].custpage_delivery_name_1_after;//お届け先名称１
				var deliveryName_2 = csvData[m].custpage_delivery_name_2_after;//お届け先名称2
				var deliveryName_3 = csvData[m].custpage_delivery_name_3_after;//お届け先名称3
				var customerCode = csvData[m].custpage_customer_code_after;//お客様コード
				var personInChargeCodeAcquisitionSegment = csvData[m].custpage_person_in_charge_code_acquisition_segment_after;//部署ご担当者コード取得区分
				var personInChargeCode = csvData[m].custpage_person_in_charge_code_after;//部署ご担当者コード
				var personInChargeName = csvData[m].custpage_person_in_charge_name_after;//部署ご担当者名称
				var shipperTel = csvData[m].custpage_shipper_tel_after;//荷送人電話番号
				var requesterCodeAcquisitonSegment = csvData[m].custpage_requester_code_acquisiton_segment_after;//ご依頼主コード取得区分
				var requesterCode = csvData[m].custpage_requester_code_after;//ご依頼主コード
				var requesterTel = csvData[m].custpage_requester_tel_after;//ご依頼主電話番号
				var requesterFax = csvData[m].custpage_requester_fax_after;//ご依頼主郵便番号
				var requesterAddress_1 = csvData[m].custpage_requester_address_1_after;//ご依頼主住所１
				var requesterAddress_2 = csvData[m].custpage_requester_address_2_after;//ご依頼主住所2
				var requesterName_1 = csvData[m].custpage_requester_name_1_after;//ご依頼主名称1
				var requesterName_2 =csvData[m].custpage_requester_name_2_after;//ご依頼主名称2
				requesterName_2= ''
				var packingFigure = custpage_packing_figure;//荷姿
				var itemName_1 = csvData[m].custpage_item_name_1_after;//品名１
				var itemName_2 = csvData[m].custpage_item_name_2_after;//品名2
				var itemName_3 = csvData[m].custpage_item_name_3_after;//品名3
				var itemName_4 = csvData[m].custpage_item_name_4_after;//品名4
				var itemName_5 = csvData[m].custpage_item_name_5_after;//品名5
				var labelPackingFigure = csvData[m].custpage_label_packing_figure_after;//荷札荷姿
				var labelItemName_1 = csvData[m].custpage_label_item_name_1_after;//荷札品名1
				var labelItemName_2 = csvData[m].custpage_label_item_name_2_after;//荷札品名2
				var labelItemName_3 = csvData[m].custpage_label_item_name_3_after;//荷札品名3
				var labelItemName_4 = csvData[m].custpage_label_item_name_4_after;//荷札品名4
				var labelItemName_5 = csvData[m].custpage_label_item_name_5_after;//荷札品名5
				var labelItemName_6 = csvData[m].custpage_label_item_name_6_after;//荷札品名6
				var labelItemName_7 = csvData[m].custpage_label_item_name_7_after;//荷札品名7
				
				var labelItemName_8 = csvData[m].custpage_label_item_name_8_after;//荷札品名8
				var labelItemName_9 = csvData[m].custpage_label_item_name_9_after;//荷札品名9
				var labelItemName_10 = csvData[m].custpage_label_item_name_10_after;//荷札品名10
				var labelItemName_11 = csvData[m].custpage_label_item_name_11_after;//荷札品名11
				var shipmentsNumber = csvData[m].custpage_djkk_casequantity_after;//出荷個数
				var speedDesignation = custpage_speed_designation_after;//スピード指定
				var coolFlightDesignation = csvData[m].custpage_cool_flight_designation_after;//クール便指定
				var deliveryDate = csvData[m].custpage_delivery_date_after;//配達日
				var deliveryTimeZone = deliveryTimeZone;//配達指定時間帯
				var deliverySpecifiedTime = custpage_delivery_specified_time_after;//配達指定時間（時分）
				var onDeliveryAmount = substitution;//代引金額
				var consumptionTax = csvData[m].custpage_consumption_tax_after;//消費税
				var settlementType = csvData[m].custpage_settlement_type_after;//決済種別
				var insuranceAmount =insurancePremium;//保険金額
				var designatiedSeal_1 = custpage_mainline_shipping_information;//指定シール１/主要出荷指示情報(メモ欄)
				var designatiedSeal_2 = csvData[m].custpage_designatied_seal_2_after;//指定シール2
				var designatiedSeal_3 = csvData[m].custpage_designatied_seal_3_after;//指定シール3
				var salesOfficePickup = '';//営業所受取
				var srcSegmentation ='';//SRC区分
				var salesOfficeReceiptOfficeCode = '';//営業所受取営業所コード
				var originalArrivalCategory = '';//元着区分
				var emailAddress = csvData[m].custpage_email_address_after;//メールアドレス
				var outOfOfficeContactInformation = csvData[m].custpage_out_of_office_contact_information_after;//ご不在時連絡先
				var shipDate = csvData[m].custpage_ship_date_after;//出荷日
				var inquiryInvoiceNo = csvData[m].custpage_inquiry_invoice_no_after;//お問い合せ送り状No
				var shippingSitePrintingClassification = csvData[m].custpage_shipping_site_printing_classification_after;//出荷場印字区分
				var custpageUnaggregatedDesignation = csvData[m].custpage_unaggregated_designation_after;//集約解除指定
				var edit_01 = csvData[m].custpage_edit_01_after;//編集01
				var edit_02 = csvData[m].custpage_edit_02_after;//編集02
				var edit_03 = csvData[m].custpage_edit_03_after;//編集03
				var edit_04 = csvData[m].custpage_edit_04_after;//編集04
				var edit_05 = csvData[m].custpage_edit_05_after;//編集05
				var edit_06 = csvData[m].custpage_edit_06_after;//編集06
				var edit_07 = csvData[m].custpage_edit_07_after;//編集07
				var edit_08 = csvData[m].custpage_edit_08_after;//編集08
				var edit_09 = csvData[m].custpage_edit_09_after;//編集09
				var edit_10 = csvData[m].custpage_edit_10_after;//編集10
				
				//営業所受取
				if(custpage_sales_office_pickup_after == 'T'){
					salesOfficePickup = '0'//通常出荷
				}else{
					salesOfficePickup = '1'//営業所受取
				}
				//SRC区分
				if(custpage_src_segmentation_after == 'T'){
					srcSegmentation = '0'//指定なし
				}else{
					srcSegmentation = '1'//ＳＲＣ
				}
				//元着区分
				if(custpage_original_arrival_category_after == 'T'){
					originalArrivalCategory = '0'//元払
				}else{
					originalArrivalCategory = '1'//着払
				}
				csvStr += deliveryCodeAcquisitionClassification+','+deliveryCode+','+deliveryPhoneNumber+','+deliveryZipCode+','+deliveryAddress_1+','+deliveryAddress_2+','+deliveryAddress_3+','+deliveryName_1+','+ deliveryName_2+','+deliveryName_3+','+customerCode+','+personInChargeCodeAcquisitionSegment+','+personInChargeCode+','+personInChargeName+','+shipperTel+','+requesterCodeAcquisitonSegment+',' +requesterCode+','+requesterTel+','+requesterFax+','+requesterAddress_1+','+requesterAddress_2+','+requesterName_1+','+requesterName_2+','+packingFigure+','+itemName_1+','+itemName_2+','+itemName_3+','+itemName_4+','+itemName_5+','+labelPackingFigure+','+labelItemName_1+','+labelItemName_2+','+labelItemName_3+','+labelItemName_4+','+labelItemName_5+','+labelItemName_6+','+labelItemName_7+','+labelItemName_8+','+labelItemName_9+','+labelItemName_10+','+labelItemName_11+',' +shipmentsNumber+','+speedDesignation+','+coolFlightDesignation+','+deliveryDate+','+deliveryTimeZone+','+deliverySpecifiedTime+','+onDeliveryAmount+','+consumptionTax+','+settlementType+','+insuranceAmount+','+designatiedSeal_1+',' +designatiedSeal_2+','+designatiedSeal_3+','+salesOfficePickup+','+srcSegmentation+','+salesOfficeReceiptOfficeCode+','+originalArrivalCategory+','+emailAddress+','+outOfOfficeContactInformation+','+shipDate+','+inquiryInvoiceNo+','+shippingSitePrintingClassification+','+custpageUnaggregatedDesignation+',' +edit_01+','+edit_02+','+edit_03+','+edit_04+','+edit_05+','+edit_06+','+edit_07+','+edit_08+','+edit_09+','+edit_10;
				csvStr +="\r\n"	
			}
		}
	}else if(express == "西濃"){
		
	}
	if(!isEmpty(csvStr)){
		var xmlFileId = csvMaker(csvStr);
		nlapiLogExecution('debug','実行に成功しました',JSON.stringify(xmlFileId))
		var send = nlapiCreateRecord('customrecord_djkk_csv_outut_record');
		send.setFieldValue('custrecord_djkk_csv_key',jobId);
		send.setFieldValue('custrecord_output_csv_fileid',xmlFileId);
		var id = nlapiSubmitRecord(send);
		
		var upDate = upDateToSoLine(soArr);
	}else{
		nlapiLogExecution('debug','実行失敗','データが空です')
	}
}


/**
* 内容にはカンマを含める処理
* 
* @param strData
* @returns
*/
function csvDataToArray(strData) {

	   strDelimiter = (",");

	   var objPattern = new RegExp(
	           ("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");

	   var arrData = [[]];

	   var arrMatches = null;

	   while (arrMatches = objPattern.exec(strData)) {
		   nlapiLogExecution('debug','arrMatches',JSON.stringify(arrMatches))
	       var strMatchedDelimiter = arrMatches[1];
	       nlapiLogExecution('debug','arrMatches1',strMatchedDelimiter)
	       if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
	           arrData.push([]);
	       }

	       var strMatchedValue = '';
	       if (arrMatches[2]) {
	           strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
	           nlapiLogExecution('debug','arrMatches2',strMatchedValue)
	       } else {
	           strMatchedValue = arrMatches[3];
	           nlapiLogExecution('debug','arrMatches3',strMatchedValue)
	       }

	       arrData[arrData.length - 1].push(strMatchedValue);
	   }
	   
	 //文字列置換
	   function replace(text)
	   {
	   if ( typeof(text)!= "string" )
	      text = text.toString() ;

	   text = text.replace(/,/g, "_") ;

	   return text ;
	   }
	   nlapiLogExecution('debug','arrData[0]',arrData[0])
	   return (arrData[0]);
}

function csvMaker(xmlString){	
	try{	
		
		var xlsFile = nlapiCreateFile('配送用' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
			
		xlsFile.setFolder(FILE_CABINET_ID_DJ_OUTOUT_DELIVERY_CSV);	
		xlsFile.setName('配送用' + '_' + getFormatYmdHms() + '.csv');	
		xlsFile.setEncoding('SHIFT_JIS');	
		
		
		var fieldId = nlapiSubmitFile(xlsFile);
		// save file	
		return fieldId;
	}
	catch(e){	
		nlapiLogExecution('DEBUG', 'no error csvDown', e)	
	}	
}
function defaultEmpty(src){
	return src || '';
}

function upDateToSoLine(arr){
//	nlapiLogExecution('DEBUG', 'start arr', JSON.stringify(arr))
	var newArr = arr;
	nlapiLogExecution('DEBUG', 'newArr', JSON.stringify(newArr));
	for(var i=0; i <newArr.length; i++){
	  for(var j=i+1; j<newArr.length; j++){
	    if(newArr[i].soid === newArr[j].soid ){
	    	newArr[i].lineNum = newArr[i].lineNum +","+newArr[j].lineNum ;
	    	newArr.splice(j,1);
	     }
	  }
	}
	for(var so = 0 ; so < newArr.length; so++){
		var soid = newArr[so].soid;
		var lineNum = newArr[so].lineNum;
		nlapiLogExecution('DEBUG', 'lineNum', lineNum)
		lineNum = lineNum.split(',');
		var soRecord = nlapiLoadRecord('salesorder',soid);
		var count = soRecord.getLineItemCount('item');
		for(var c = 0 ; c < count ; c++){
			var soLineNum =  soRecord.getLineItemValue("item","line",c+1)
			for(var l = 0 ; l < lineNum.length ; l++){
				if(soLineNum == lineNum[l]){
					soRecord.setLineItemValue("item","custcol_djkk_invoice_creation_over",c+1,"T")
					soRecord.commitLineItem('item');
					break;
				}
			}
		}
		nlapiSubmitRecord(soRecord,true);
	}
	nlapiLogExecution('DEBUG', '更新完了', '更新完了')
}