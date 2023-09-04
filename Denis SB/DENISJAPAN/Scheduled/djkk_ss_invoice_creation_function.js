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
	if(express == "���}�g�^�A�������"){
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
				 nlapiLogExecution('error','�f�[�^�ُ�','�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�(dataSerialnumber)���݂��Ȃ�')
			 }
		}
		csvStr = '���q�l�Ǘ��ԍ� ,������� ,�N�[���敪 ,�`�[�ԍ� ,�o�ח\��� ,���͂��\��� ,�z�B���ԑ� ,���͂���R�[�h ,���͂���d�b�ԍ� ,���͂���d�b�ԍ��}�� ,���͂���X�֔ԍ� ,���͂���Z�� ,���͂���A�p�[�g�}���V������ ,���͂����ЁE����P,���͂����ЁE����Q,���͂��於 ,���͂��於(��),�h�� ,���˗���R�[�h ,���˗���d�b�ԍ� ,���˗���d�b�ԍ��}�� ,���˗���X�֔ԍ� ,���˗���Z�� ,���˗���A�p�[�g�}���V����,���˗��喼 ,���˗��喼(��),�i���R�[�h�P,�i���P,�i���R�[�h�Q,�i���Q,�׈����P,�׈����Q,�L�� ,�ڸđ�������z�i�ō�),������Ŋz�� ,�~�u�� ,�c�Ə��R�[�h ,���s���� ,�����\���t���O ,������ڋq�R�[�h ,�����敪�ރR�[�h ,�^���Ǘ��ԍ� ,�N���l�Rweb�R���N�g�f�[�^�o�^ ,�N���l�Rweb�R���N�g�����X�ԍ� ,�N���l�Rweb�R���N�g�\����t�ԍ��P,�N���l�Rweb�R���N�g�\����t�ԍ�2,�N���l�Rweb�R���N�g�\����t�ԍ�3,���͂��\�肅���[�����p�敪 ,���͂��\�肅���[��e-mail�A�h���X ,���͋@�� ,���͂��\�肅���[�����b�Z�[�W ,���͂����������[�����p�敪 ,���͂����������[��e-mail�A�h���X ,���͂����������[�����b�Z�[�W ,�N���l�R���[��s���p�敪 ,�\�� ,���[��s�������z(�ō�),���[��s������Ŋz�� ,���[��s������X�֔ԍ� ,���[��s������Z��,���[��s������Z���i�A�p�[�g�}���V�������j ,���[��s�������ЁE���喼�P,���[��s�������ЁE���喼2 ,���[��s�����於(����),���[��s�����於(�J�i),���[��s�⍇���於(����),���[��s�⍇����X�֔ԍ� ,���[��s�⍇����Z�� ,���[��s�⍇����Z���i�A�p�[�g�}���V�������j,���[��s�⍇����d�b�ԍ� ,���[��s�Ǘ��ԍ� ,���[��s�i�� ,���[��s���l ,������������L�[ ,�����L�[�^�C�g��1,�����L�[1,�����L�[�^�C�g��2,�����L�[2,�����L�[�^�C�g��3,�����L�[3,�����L�[�^�C�g��4,�����L�[4,�����L�[�^�C�g��5,�����L�[5,�\��tdo�d�� ,�\��tdo�d�� ,�����\�胁�[�����p�敪 ,�����\�胁�[��e-mail�A�h���X ,�����\�胁�[�����b�Z�[�W ,�����������[���i���͂��戶�j���p�敪 ,�����������[���i���͂��戶�je-mail�A�h���X ,�����������[���i���͂��戶�j���[�����b�Z�[�W ,�����������[���i���˗��制�j���p�敪 ,�����������[���i���˗��制�je-mail�A�h���X ,�����������[���i���˗��制�j���[�����b\r\n';
		var soArr = [];//�X�V����钍�����z��
		for(var od = 0 ; od < otherDataArr.length ; od++){
			var custpage_handling_one = defaultEmpty(otherDataArr[od].custpage_handling_one);
			var custpage_handling_two = defaultEmpty(otherDataArr[od].custpage_handling_two);
			var custpage_sending_type = defaultEmpty(otherDataArr[od].custpage_sending_type);
			var deliveryTimeZone = defaultEmpty(otherDataArr[od].deliveryTimeZone);//�z�B�w�莞�ԑ�  changed by zhou 20230310
			var csvData = JSON.parse(otherDataArr[od].data);
			for(var m = 0 ; m < csvData.length ; m++){
				
				var lineNum_after = csvData[m].lineNum_after;//lineNumber
				var soid_after = csvData[m].soid_after;//soid
				soArr.push({
					soid:soid_after,
					lineNum:lineNum_after
				})
				var primary_zip_code = csvData[m].primary_zip_code_after;//��v�X�֔ԍ�
				var primary_tranid = csvData[m].primary_tranid_after;//��v�󒍔ԍ�
				var primary_temperature_unit = csvData[m].primary_temperature_unit_after;//��v���x�P��
				var primary_shipping_date = csvData[m].primary_shipping_date_after;//��v�o�ד�
				var primary_delivery_name = csvData[m].primary_delivery_name_after;//��vDJ_�^�����
				var primary_freight_company = csvData[m].primary_freight_company_after;//��v�͂��於
				var primary_address = csvData[m].primary_address_after;//��v���͂���̏Z��
				var primary_delivery_date = csvData[m].primary_delivery_date_after;//��v�[�i��
				var primary_sending_table = csvData[m].primary_sending_table_after;//��v�������l��
				var primary_insurance = '';//��v�ی��t
				var primary_shipping_information = csvData[m].primary_shipping_information_after;//��v�o�׎w�����(������)
//						/�׈���1
				var handling_one = '';
				if(custpage_handling_one == 'T'){
					handling_one = '����������'
				}
				//�׈���2
				var handling_two ='';
				if(custpage_handling_two == 'T'){
					handling_two = '�V�n���p'
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
	}else if(express == "���{�ʉ^�������"){
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
				 nlapiLogExecution('error','�f�[�^�ُ�','�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�(dataSerialnumber)���݂��Ȃ�')
			 }
		}
		csvStr = '�X�֔ԍ� ,�Z��1,�Z��2,�Z��3,���͂��於1,���͂��於2,�d�b�ԍ� ,�i�� ,�� ,�d�� ,�W�ח\��� ,�z�B�w��� ,�z�B�w�莞�� ,���q�l�Ǘ��ԍ�1,���q�l�Ǘ��ԍ�2,���q�l�Ǘ��ԍ�3,���q�l�Ǘ��ԍ�4,���q�l�Ǘ��ԍ�5,�L����1,�L����2,�L����3,���ו����i ,�ی����z\r\n';
		var soArr = [];//�X�V����钍�����z��
		for(var od = 0 ; od < otherDataArr.length ; od++){
			var csvData = JSON.parse(otherDataArr[od].data);
			var substitution = otherDataArr[od].substitution;//��v������z
			var insurancePremium = otherDataArr[od].insurancePremium;//��v�ی���
			var deliveryTimeZone = otherDataArr[od].deliveryTimeZone;//�z�B�w�莞��  changed by zhou 20230310
			
			for(var m = 0 ; m < csvData.length ; m++){
				var lineNum_after = csvData[m].lineNum_after;//lineNumber
				var soid_after = csvData[m].soid_after;//soid
				soArr.push({
					soid:soid_after,
					lineNum:lineNum_after
				})
				var lineNum_after = csvData[m].lineNum_after;//lineNumber
				var soid_after = csvData[m].soid_after;//soid
				var zipCode = csvData[m].zipAfter;//�X�֔ԍ�
				var addr1 = csvData[m].prefecturesAfter;//�Z��1
				var addr2 = csvData[m].deliveryResidenceAfter;//�Z��2
				var addr3 = csvData[m].deliveryResidence2After;//�Z��3
				var deliveryName1 = csvData[m].custrecorddjkkNameAfter;//���͂��於1
				var deliveryName2 = csvData[m].custrecorddjkkName2After;//���͂��於2
				var tel = csvData[m].deliveryPhoneNumberAfter;//�d�b�ԍ�
				var itemName = csvData[m].displaynameAfter;//�i��
				var number = csvData[m].quantityAfter;//��
				var weight ='';//�d��
				var expectedPickupDate = csvData[m].shipDateAfter;//�W�ח\���
				var deliveryDate = csvData[m].deliveryDateAfter;//�z�B�w���
				var deliveryTime = deliveryTimeZone;//�z�B�w�莞��
				var controlNumber1 = '';//���q�l�Ǘ��ԍ�1
				var controlNumber2 = csvData[m].tranid2After;//���q�l�Ǘ��ԍ�2
				var controlNumber3 = csvData[m].tranid3After;//���q�l�Ǘ��ԍ�3
				
				var controlNumber4 = csvData[m].tranid4After;//���q�l�Ǘ��ԍ�4
				var controlNumber5 = csvData[m].tranid5After;//���q�l�Ǘ��ԍ�5
				var comment1 =csvData[m].memo1After;//�L����1
				var comment2 = csvData[m].memo2After;//�L����2
				var comment3 = csvData[m].memo3After;//�L����3
				var luggagePrice = csvData[m].amountAfter;//���ו����i
				var insuranceAmount = insurancePremium;//�ی����z
				
				csvStr += zipCode+','+addr1+','+addr2+','+addr3+','+deliveryName1+','+deliveryName2+','+tel+','+itemName+','+number+','+weight+','+expectedPickupDate+','+deliveryDate+','+deliveryTime+','+controlNumber1+','+controlNumber2+','+controlNumber3+','+controlNumber4+','+controlNumber5+','+comment1+','+comment2+','+comment3+','+luggagePrice+','+insuranceAmount;
				csvStr +="\r\n";
			}
		}
	}else if(express == "����^�A�������"){
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
				 nlapiLogExecution('error','�f�[�^�ُ�','�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�(dataSerialnumber)���݂��Ȃ�')
			 }
		}
		csvStr = '���͂���R�[�h�擾�敪 ,���͂���R�[�h ,���͂���d�b�ԍ� ,���͂���X�֔ԍ� ,���͂���Z���P,���͂���Z���Q,���͂���Z���R,���͂��於�̂P,���͂��於�̂Q,���q�l�Ǘ��ԍ�,���q�l�R�[�h ,�������S���҃R�[�h�擾�敪 ,�������S���҃R�[�h ,�������S���Җ��� ,�ב��l�d�b�ԍ� ,���˗���R�[�h�擾�敪 ,���˗���R�[�h ,���˗���d�b�ԍ� ,���˗���X�֔ԍ� ,���˗���Z���P,���˗���Z���Q,���˗��喼�̂P,���˗��喼�̂Q,�׎p ,�i���P,�i���Q,�i���R,�i���S,�i���T,�׎D�׎p ,�׎D�i��1,�׎D�i��2,�׎D�i��3,�׎D�i��4,�׎D�i��5,�׎D�i��6,�׎D�i��7,�׎D�i��8,�׎D�i��9,�׎D�i��10,�׎D�i��11,�o�׌� ,�X�s�[�h�w�� ,�N�[���֎w�� ,�z�B�� ,�z�B�w�莞�ԑ� ,�z�B�w�莞�ԁi�����j,������z ,����� ,���ώ�� ,�ی����z ,�w��V�[���P,�w��V�[���Q,�w��V�[���R,�c�Ə���� ,SRC�敪 ,�c�Ə����c�Ə��R�[�h ,�����敪 ,���[���A�h���X ,���s�ݎ��A���� ,�o�ד� ,���₢���������No,�o�׏�󎚋敪 ,�W������w�� ,�ҏW01,�ҏW02,�ҏW03,�ҏW04,�ҏW05,�ҏW06,�ҏW07,�ҏW08,�ҏW09,�ҏW10\r\n';
		var soArr = [];//�X�V����钍�����z��
//		var soObj = {};//�X�̒������̂��ׂĂ̏��
//		var solineNumArr = [];//�X�̒������̂��ׂĂ̖��׍s�̍s�ԍ�
		for(var od = 0 ; od < otherDataArr.length ; od++){
			var custpage_packing_figure = defaultEmpty(otherDataArr[od].custpage_packing_figure);//�׎p
			var custpage_speed_designation_after = "\t"+defaultEmpty(otherDataArr[od].custpage_speed_designation_after);//�X�s�[�h�w��
	
	//					var custpage_designatied_seal_1_after = defaultEmpty(otherDataArr[od].custpage_designatied_seal_1);//�w��V�[���P
			var custpage_sales_office_pickup_after = defaultEmpty(otherDataArr[od].custpage_sales_office_pickup_after);//�c�Ə����
			var custpage_src_segmentation_after = defaultEmpty(otherDataArr[od].custpage_src_segmentation_after);//SRC�敪
			var custpage_original_arrival_category_after = defaultEmpty(otherDataArr[od].custpage_original_arrival_category_after);//�����敪
			var custpage_mainline_shipping_information= defaultEmpty(otherDataArr[od].custpage_mainline_shipping_information);//��v�o�׎w�����(������)
			var substitution = defaultEmpty(otherDataArr[od].substitution);//��v������z
			var insurancePremium = defaultEmpty(otherDataArr[od].insurancePremium);//��v�ی���
			var deliveryTimeZone = "\t"+defaultEmpty(otherDataArr[od].deliveryTimeZone);//�z�B�w�莞�ԑ�  changed by zhou 20230310
			var deliverySpecifiedHour = "\t"+defaultEmpty(otherDataArr[od].deliverySpecifiedHour);//�z�B�w�莞�ԁi���j  changed by zhou 20230310
			var deliverySpecifiedMin = defaultEmpty(otherDataArr[od].deliverySpecifiedMin);//�z�B�w�莞�ԁi���j  changed by zhou 20230310
			var custpage_delivery_specified_time_after = deliverySpecifiedHour+deliverySpecifiedMin;//�z�B�w�莞�ԁi�����j
			var csvData = JSON.parse(otherDataArr[od].data);
			for(var m = 0 ; m < csvData.length ; m++){
				var lineNum_after = csvData[m].lineNum_after;//lineNumber
				var soid_after = csvData[m].soid_after;//soid
				soArr.push({
					soid:soid_after,
					lineNum:lineNum_after
				})
				var primary_zip_code = csvData[m].primary_zip_code_after;//��v�X�֔ԍ�
				var primary_tranid = csvData[m].primary_tranid_after;//��v�󒍔ԍ�
				var primary_temperature_unit = csvData[m].primary_temperature_unit_after;//��v���x�P��
				var primary_shipping_date = csvData[m].primary_shipping_date_after;//��v�o�ד�
				var primary_delivery_name = csvData[m].primary_delivery_name_after;//��vDJ_�^�����
				var primary_freight_company = csvData[m].primary_freight_company_after;//��v�͂��於
				var primary_address = csvData[m].primary_address_after;//��v���͂���̏Z��
				var primary_delivery_date = csvData[m].primary_delivery_date_after;//��v�[�i��
				var primary_sending_table = csvData[m].primary_sending_table_after;//��v�������l��
				var primary_insurance = csvData[m].primary_insurance_after;//��v�ی��t
				var primary_shipping_information = csvData[m].primary_shipping_information_after;//��v�o�׎w�����(������)
				
				
				var deliveryCodeAcquisitionClassification = csvData[m].custpage_delivery_code_acquisition_classification_after;//���͂���R�[�h�擾�敪
				var deliveryCode = csvData[m].custpage_delivery_code_after;//���͂���R�[�h
				var deliveryPhoneNumber = csvData[m].custpage_delivery_phone_number_after;//���͂���d�b�ԍ�
				var deliveryZipCode = csvData[m].custpage_delivery_zip_code_after;//���͂���X�֔ԍ�
				var deliveryAddress_1 = csvData[m].custpage_delivery_address_1_after;//���͂���Z���P
				var deliveryAddress_2 = csvData[m].custpage_delivery_address_2_after;//���͂���Z��2
				var deliveryAddress_3 = csvData[m].custpage_delivery_address_3_after;//���͂���Z��3
				var deliveryName_1 = csvData[m].custpage_delivery_name_1_after;//���͂��於�̂P
				var deliveryName_2 = csvData[m].custpage_delivery_name_2_after;//���͂��於��2
				var deliveryName_3 = csvData[m].custpage_delivery_name_3_after;//���͂��於��3
				var customerCode = csvData[m].custpage_customer_code_after;//���q�l�R�[�h
				var personInChargeCodeAcquisitionSegment = csvData[m].custpage_person_in_charge_code_acquisition_segment_after;//�������S���҃R�[�h�擾�敪
				var personInChargeCode = csvData[m].custpage_person_in_charge_code_after;//�������S���҃R�[�h
				var personInChargeName = csvData[m].custpage_person_in_charge_name_after;//�������S���Җ���
				var shipperTel = csvData[m].custpage_shipper_tel_after;//�ב��l�d�b�ԍ�
				var requesterCodeAcquisitonSegment = csvData[m].custpage_requester_code_acquisiton_segment_after;//���˗���R�[�h�擾�敪
				var requesterCode = csvData[m].custpage_requester_code_after;//���˗���R�[�h
				var requesterTel = csvData[m].custpage_requester_tel_after;//���˗���d�b�ԍ�
				var requesterFax = csvData[m].custpage_requester_fax_after;//���˗���X�֔ԍ�
				var requesterAddress_1 = csvData[m].custpage_requester_address_1_after;//���˗���Z���P
				var requesterAddress_2 = csvData[m].custpage_requester_address_2_after;//���˗���Z��2
				var requesterName_1 = csvData[m].custpage_requester_name_1_after;//���˗��喼��1
				var requesterName_2 =csvData[m].custpage_requester_name_2_after;//���˗��喼��2
				requesterName_2= ''
				var packingFigure = custpage_packing_figure;//�׎p
				var itemName_1 = csvData[m].custpage_item_name_1_after;//�i���P
				var itemName_2 = csvData[m].custpage_item_name_2_after;//�i��2
				var itemName_3 = csvData[m].custpage_item_name_3_after;//�i��3
				var itemName_4 = csvData[m].custpage_item_name_4_after;//�i��4
				var itemName_5 = csvData[m].custpage_item_name_5_after;//�i��5
				var labelPackingFigure = csvData[m].custpage_label_packing_figure_after;//�׎D�׎p
				var labelItemName_1 = csvData[m].custpage_label_item_name_1_after;//�׎D�i��1
				var labelItemName_2 = csvData[m].custpage_label_item_name_2_after;//�׎D�i��2
				var labelItemName_3 = csvData[m].custpage_label_item_name_3_after;//�׎D�i��3
				var labelItemName_4 = csvData[m].custpage_label_item_name_4_after;//�׎D�i��4
				var labelItemName_5 = csvData[m].custpage_label_item_name_5_after;//�׎D�i��5
				var labelItemName_6 = csvData[m].custpage_label_item_name_6_after;//�׎D�i��6
				var labelItemName_7 = csvData[m].custpage_label_item_name_7_after;//�׎D�i��7
				
				var labelItemName_8 = csvData[m].custpage_label_item_name_8_after;//�׎D�i��8
				var labelItemName_9 = csvData[m].custpage_label_item_name_9_after;//�׎D�i��9
				var labelItemName_10 = csvData[m].custpage_label_item_name_10_after;//�׎D�i��10
				var labelItemName_11 = csvData[m].custpage_label_item_name_11_after;//�׎D�i��11
				var shipmentsNumber = csvData[m].custpage_djkk_casequantity_after;//�o�׌�
				var speedDesignation = custpage_speed_designation_after;//�X�s�[�h�w��
				var coolFlightDesignation = csvData[m].custpage_cool_flight_designation_after;//�N�[���֎w��
				var deliveryDate = csvData[m].custpage_delivery_date_after;//�z�B��
				var deliveryTimeZone = deliveryTimeZone;//�z�B�w�莞�ԑ�
				var deliverySpecifiedTime = custpage_delivery_specified_time_after;//�z�B�w�莞�ԁi�����j
				var onDeliveryAmount = substitution;//������z
				var consumptionTax = csvData[m].custpage_consumption_tax_after;//�����
				var settlementType = csvData[m].custpage_settlement_type_after;//���ώ��
				var insuranceAmount =insurancePremium;//�ی����z
				var designatiedSeal_1 = custpage_mainline_shipping_information;//�w��V�[���P/��v�o�׎w�����(������)
				var designatiedSeal_2 = csvData[m].custpage_designatied_seal_2_after;//�w��V�[��2
				var designatiedSeal_3 = csvData[m].custpage_designatied_seal_3_after;//�w��V�[��3
				var salesOfficePickup = '';//�c�Ə����
				var srcSegmentation ='';//SRC�敪
				var salesOfficeReceiptOfficeCode = '';//�c�Ə����c�Ə��R�[�h
				var originalArrivalCategory = '';//�����敪
				var emailAddress = csvData[m].custpage_email_address_after;//���[���A�h���X
				var outOfOfficeContactInformation = csvData[m].custpage_out_of_office_contact_information_after;//���s�ݎ��A����
				var shipDate = csvData[m].custpage_ship_date_after;//�o�ד�
				var inquiryInvoiceNo = csvData[m].custpage_inquiry_invoice_no_after;//���₢���������No
				var shippingSitePrintingClassification = csvData[m].custpage_shipping_site_printing_classification_after;//�o�׏�󎚋敪
				var custpageUnaggregatedDesignation = csvData[m].custpage_unaggregated_designation_after;//�W������w��
				var edit_01 = csvData[m].custpage_edit_01_after;//�ҏW01
				var edit_02 = csvData[m].custpage_edit_02_after;//�ҏW02
				var edit_03 = csvData[m].custpage_edit_03_after;//�ҏW03
				var edit_04 = csvData[m].custpage_edit_04_after;//�ҏW04
				var edit_05 = csvData[m].custpage_edit_05_after;//�ҏW05
				var edit_06 = csvData[m].custpage_edit_06_after;//�ҏW06
				var edit_07 = csvData[m].custpage_edit_07_after;//�ҏW07
				var edit_08 = csvData[m].custpage_edit_08_after;//�ҏW08
				var edit_09 = csvData[m].custpage_edit_09_after;//�ҏW09
				var edit_10 = csvData[m].custpage_edit_10_after;//�ҏW10
				
				//�c�Ə����
				if(custpage_sales_office_pickup_after == 'T'){
					salesOfficePickup = '0'//�ʏ�o��
				}else{
					salesOfficePickup = '1'//�c�Ə����
				}
				//SRC�敪
				if(custpage_src_segmentation_after == 'T'){
					srcSegmentation = '0'//�w��Ȃ�
				}else{
					srcSegmentation = '1'//�r�q�b
				}
				//�����敪
				if(custpage_original_arrival_category_after == 'T'){
					originalArrivalCategory = '0'//����
				}else{
					originalArrivalCategory = '1'//����
				}
				csvStr += deliveryCodeAcquisitionClassification+','+deliveryCode+','+deliveryPhoneNumber+','+deliveryZipCode+','+deliveryAddress_1+','+deliveryAddress_2+','+deliveryAddress_3+','+deliveryName_1+','+ deliveryName_2+','+deliveryName_3+','+customerCode+','+personInChargeCodeAcquisitionSegment+','+personInChargeCode+','+personInChargeName+','+shipperTel+','+requesterCodeAcquisitonSegment+',' +requesterCode+','+requesterTel+','+requesterFax+','+requesterAddress_1+','+requesterAddress_2+','+requesterName_1+','+requesterName_2+','+packingFigure+','+itemName_1+','+itemName_2+','+itemName_3+','+itemName_4+','+itemName_5+','+labelPackingFigure+','+labelItemName_1+','+labelItemName_2+','+labelItemName_3+','+labelItemName_4+','+labelItemName_5+','+labelItemName_6+','+labelItemName_7+','+labelItemName_8+','+labelItemName_9+','+labelItemName_10+','+labelItemName_11+',' +shipmentsNumber+','+speedDesignation+','+coolFlightDesignation+','+deliveryDate+','+deliveryTimeZone+','+deliverySpecifiedTime+','+onDeliveryAmount+','+consumptionTax+','+settlementType+','+insuranceAmount+','+designatiedSeal_1+',' +designatiedSeal_2+','+designatiedSeal_3+','+salesOfficePickup+','+srcSegmentation+','+salesOfficeReceiptOfficeCode+','+originalArrivalCategory+','+emailAddress+','+outOfOfficeContactInformation+','+shipDate+','+inquiryInvoiceNo+','+shippingSitePrintingClassification+','+custpageUnaggregatedDesignation+',' +edit_01+','+edit_02+','+edit_03+','+edit_04+','+edit_05+','+edit_06+','+edit_07+','+edit_08+','+edit_09+','+edit_10;
				csvStr +="\r\n"	
			}
		}
	}else if(express == "���Z"){
		
	}
	if(!isEmpty(csvStr)){
		var xmlFileId = csvMaker(csvStr);
		nlapiLogExecution('debug','���s�ɐ������܂���',JSON.stringify(xmlFileId))
		var send = nlapiCreateRecord('customrecord_djkk_csv_outut_record');
		send.setFieldValue('custrecord_djkk_csv_key',jobId);
		send.setFieldValue('custrecord_output_csv_fileid',xmlFileId);
		var id = nlapiSubmitRecord(send);
		
		var upDate = upDateToSoLine(soArr);
	}else{
		nlapiLogExecution('debug','���s���s','�f�[�^����ł�')
	}
}


/**
* ���e�ɂ̓J���}���܂߂鏈��
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
	   
	 //������u��
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
		
		var xlsFile = nlapiCreateFile('�z���p' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
			
		xlsFile.setFolder(FILE_CABINET_ID_DJ_OUTOUT_DELIVERY_CSV);	
		xlsFile.setName('�z���p' + '_' + getFormatYmdHms() + '.csv');	
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
	nlapiLogExecution('DEBUG', '�X�V����', '�X�V����')
}