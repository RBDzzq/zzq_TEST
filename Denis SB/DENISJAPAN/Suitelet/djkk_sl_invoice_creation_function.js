/**
 * DJ_�����쐬�@�\
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
	nlapiLogExecution('debug', 'action station', '�J�n');
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	var strCsv = '';
//	var xmlString = '';
	var theCount = parseInt(request.getLineItemCount('list'));
	var express = request.getParameter('custpage_express');
	var expressType;
	if(express == '3887'){
		expressType = '����^�A�������';
	}else if(express == '4'){
		expressType = '���Z';
	}else if(express == '685'){
		expressType = '���{�ʉ^�������';
	}else if(express == '684'){
		expressType = '���}�g�^�A�������';
	}
	var date = request.getParameter('custpage_date');//���t
	var number = request.getParameter('custpage_number');//��t�ԍ�
	var dateree = request.getParameter('custpage_datetext');//�o�ד�from
	var datereeto = request.getParameter('custpage_datetext_to');//�o�ד�to
//	var invoice = request.getParameter('custpage_invoice_number');//�����ԍ�
	var clubValue = request.getParameter('custpage_club');//���
	var transportValue = request.getParameter('custpage_transport');//�z�����@
	var locationValue = request.getParameter('custpage_location');//�q��
	var deliveryTextval = request.getParameter('custpage_delivery');//�[�i��
	var deliveryDateTextval = request.getParameter('custpage_delivery_date');//�[�i��Form
	var deliveryDateTextvalTo = request.getParameter('custpage_delivery_date_to');//�[�i��To
	var inputOrderTextval = request.getParameter('custpage_input_order');//�󒍓��͎�
	var sectionTextval = request.getParameter('custpage_section');//�Z�N�V����
	var tempTextval = request.getParameter('custpage_temp');//�Z�N�V����
	

	var fieldIdTextval = request.getParameter('custpage_fieldid');//
	var jobId = guid();//�\�Ǘ��Abatch�֘AID
//	var timeZoneTextval = request.getParameter('custpage_time_zone');//���ԑ�  20230213 changed by zhou  U046�ۑ�K��s�v
	nlapiLogExecution('debug', 'action express', express);
	nlapiLogExecution('debug', 'action expressType', expressType);
	var dataBatchnumber;
	if(expressType== '���{�ʉ^�������'){
		var lineDataObj = {}//���X�g�s�I�u�W�F�N�g
		var dataserialnumberArr = [];//dataserialnumberArr
		var otherDataArr = [];//�����쐬�@�\���X�g���̑��̗v�fArray
		//
		for(var i = 0 ; i < theCount ; i++){
			if(request.getLineItemValue('list', 'chk', i+1)=='T'){
				var dataserialnumber = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_dataserialnumber', i+1));//�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�	
				var substitution = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_total_amount', i+1));//��v������z
				var insurancePremium = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_insurance_premium', i+1));//��v�ی���
				var deliveryTimeZone = defaultEmpty(request.getLineItemValue('list', 'custpage_ne_deliverytimezone', i+1));//�z�B�w�莞��  changed by zhou 20230310
				nlapiLogExecution('debug','2023insurancePremium',insurancePremium)
				nlapiLogExecution('debug','2023deliveryTimeZone',deliveryTimeZone)
				
				dataserialnumberArr.push(dataserialnumber);
				otherDataArr.push({
					dataserialnumber:dataserialnumber,//DJ_�Ǘ��ԍ�  �z��I�u�W�F�N�g�\��v�f
					substitution:substitution,//��v������z
					insurancePremium:insurancePremium,//��v�ی���
					deliveryTimeZone:deliveryTimeZone,//�z�B�w�莞��  changed by zhou 20230310
				    data:'',//DJ_DATA  �z��I�u�W�F�N�g�\��v�f
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
	}else if(expressType == '����^�A�������'){//SaGaWa
		var lineDataObj = {}//���X�g�s�I�u�W�F�N�g
		var dataserialnumberArr = [];//dataserialnumberArr
		var otherDataArr = [];//�����쐬�@�\���X�g���̑��̗v�fArray
		for(var i = 0 ; i < theCount ; i++){
			if(request.getLineItemValue('list', 'chk', i+1)=='T'){
				var dataserialnumber = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_dataserialnumber', i+1));//�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�	
				var substitution = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_total_amount', i+1));//��v������z
				var insurancePremium = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_insurance_premium', i+1));//��v�ی���
		
				var custpage_packing_figure = defaultEmpty(request.getLineItemValue('list', 'custpage_packing_figure', i+1));
				var custpage_speed_designation = defaultEmpty(request.getLineItemValue('list', 'custpage_speed_designation', i+1));
//				var custpage_delivery_specified_time = defaultEmpty(request.getLineItemValue('list', 'custpage_delivery_specified_time', i+1));
				var custpage_designatied_seal_1 = defaultEmpty(request.getLineItemValue('list', 'custpage_designatied_seal_1', i+1));
				var custpage_sales_office_pickup = defaultEmpty(request.getLineItemValue('list', 'custpage_sales_office_pickup', i+1));
				var custpage_src_segmentation = defaultEmpty(request.getLineItemValue('list', 'custpage_src_segmentation', i+1));
				var custpage_original_arrival_category = defaultEmpty(request.getLineItemValue('list', 'custpage_original_arrival_category', i+1));
				var custpage_mainline_shipping_information = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_shipping_information', i+1));//��v�o�׎w�����(������)
				var deliveryTimeZone = defaultEmpty(request.getLineItemValue('list', 'custpage_sagawadeliverytimezone', i+1));//�z�B�w�莞�ԑ�  changed by zhou 20230310
				var deliverySpecifiedHour = defaultEmpty(request.getLineItemValue('list', 'custpage_delivery_specified_hour', i+1));//�z�B�w�莞�ԁi���j  changed by zhou 20230310
				var deliverySpecifiedMin = defaultEmpty(request.getLineItemValue('list', 'custpage_delivery_specified_min', i+1));//�z�B�w�莞�ԁi���j  changed by zhou 20230310
				
				
				dataserialnumberArr.push(dataserialnumber);
				otherDataArr.push({
					dataserialnumber:dataserialnumber,//DJ_�Ǘ��ԍ�  �z��I�u�W�F�N�g�\��v�f
					custpage_packing_figure:custpage_packing_figure,//�׎p
					custpage_speed_designation_after:custpage_speed_designation,//�X�s�[�h�w��
//					custpage_delivery_specified_time_after:custpage_delivery_specified_time,//�z�B�w�莞�ԁi�����j
//							custpage_designatied_seal_1_after:custpage_mainline_shipping_information,//�w��V�[���P
					custpage_mainline_shipping_information:custpage_mainline_shipping_information,//��v�o�׎w�����(������)
					custpage_sales_office_pickup_after:custpage_sales_office_pickup,//�c�Ə����
					custpage_src_segmentation_after:custpage_src_segmentation,//SRC�敪
					custpage_original_arrival_category_after:custpage_original_arrival_category,//�����敪
					substitution:substitution,//��v������z
					insurancePremium:insurancePremium,//��v�ی���
					deliveryTimeZone:deliveryTimeZone,//�z�B�w�莞�ԑ�  changed by zhou 20230310
					deliverySpecifiedHour:deliverySpecifiedHour,//�z�B�w�莞�ԁi���j  changed by zhou 20230310
					deliverySpecifiedMin:deliverySpecifiedMin,//�z�B�w�莞�ԁi���j  changed by zhou 20230310
					
				    data:'',//DJ_DATA  �z��I�u�W�F�N�g�\��v�f
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
		
		var lineDataObj = {}//���X�g�s�I�u�W�F�N�g
		var dataserialnumberArr = [];//dataserialnumberArr
		var otherDataArr = [];//�����쐬�@�\���X�g���̑��̗v�fArray
		for(var i = 0 ; i < theCount ; i++){
			if(request.getLineItemValue('list', 'chk', i+1)=='T'){
				var dataserialnumber = defaultEmpty(request.getLineItemValue('list', 'custpage_mainline_dataserialnumber', i+1));//�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�	
				var custpage_handling_one = defaultEmpty(request.getLineItemValue('list', 'custpage_handling_one', i+1));
				var custpage_handling_two = defaultEmpty(request.getLineItemValue('list', 'custpage_handling_two', i+1));	
				var custpage_sending_type = defaultEmpty(request.getLineItemValue('list', 'custpage_sending_type', i+1));
				var deliveryTimeZone = defaultEmpty(request.getLineItemValue('list', 'custpage_yamatodeliverytimezone', i+1));//�z�B���ԑ� changed by zhou 20230310
				
				dataserialnumberArr.push(dataserialnumber);
				otherDataArr.push({
					dataserialnumber:dataserialnumber,//DJ_�Ǘ��ԍ�  �z��I�u�W�F�N�g�\��v�f
					custpage_handling_one:custpage_handling_one,
					custpage_handling_two:custpage_handling_two,
					custpage_sending_type:custpage_sending_type,
					deliveryTimeZone:deliveryTimeZone,
				    data:'',//DJ_DATA  �z��I�u�W�F�N�g�\��v�f
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
//	if(request.getParameter('custpage_express') == '���{�ʉ^������� '){//
//		xmlString += '�X�֔ԍ� ,�Z��1,�Z��2,�Z��3,���͂��於1,���͂��於2,�d�b�ԍ� ,�i�� ,�� ,�d�� ,�W�ח\��� ,�z�B�w��� ,�z�B�w�莞�� ,���q�l�Ǘ��ԍ�1,���q�l�Ǘ��ԍ�2,���q�l�Ǘ��ԍ�3,���q�l�Ǘ��ԍ�4,���q�l�Ǘ��ԍ�5,�L����1,�L����2,�L����3,���ו����i ,�ی����z\r\n'+strCsv;
//	}else if(request.getParameter('custpage_express') == '����^�A�������'){//SaGaWa
//		
//		xmlString += '���͂���R�[�h�擾�敪 ,���͂���R�[�h ,���͂���d�b�ԍ� ,���͂���X�֔ԍ� ,���͂���Z���P,���͂���Z���Q,���͂���Z���R,���͂��於�̂P,���͂��於�̂Q,���q�l�Ǘ��ԍ�,���q�l�R�[�h ,�������S���҃R�[�h�擾�敪 ,�������S���҃R�[�h ,�������S���Җ��� ,�ב��l�d�b�ԍ� ,���˗���R�[�h�擾�敪 ,���˗���R�[�h ,���˗���d�b�ԍ� ,���˗���X�֔ԍ� ,���˗���Z���P,���˗���Z���Q,���˗��喼�̂P,���˗��喼�̂Q,�׎p ,�i���P,�i���Q,�i���R,�i���S,�i���T,�׎D�׎p ,�׎D�i��1,�׎D�i��2,�׎D�i��3,�׎D�i��4,�׎D�i��5,�׎D�i��6,�׎D�i��7,�׎D�i��8,�׎D�i��9,�׎D�i��10,�׎D�i��11,�o�׌� ,�X�s�[�h�w�� ,�N�[���֎w�� ,�z�B�� ,�z�B�w�莞�ԑ� ,�z�B�w�莞�ԁi�����j,������z ,����� ,���ώ�� ,�ی����z ,��v�o�׎w�����,�w��V�[���Q,�w��V�[���R,�c�Ə���� ,SRC�敪 ,�c�Ə����c�Ə��R�[�h ,�����敪 ,���[���A�h���X ,���s�ݎ��A���� ,�o�ד� ,���₢���������No,�o�׏�󎚋敪 ,�W������w�� ,�ҏW01,�ҏW02,�ҏW03,�ҏW04,�ҏW05,�ҏW06,�ҏW07,�ҏW08,�ҏW09,�ҏW10\r\n'+strCsv;
//	}else{
//		xmlString += '���q�l�Ǘ��ԍ� ,������� ,�N�[���敪 ,�`�[�ԍ� ,�o�ח\��� ,���͂��\��� ,�z�B���ԑ� ,���͂���R�[�h ,���͂���d�b�ԍ� ,���͂���d�b�ԍ��}�� ,���͂���X�֔ԍ� ,���͂���Z�� ,���͂���A�p�[�g�}���V������ ,���͂����ЁE����P,���͂����ЁE����Q,���͂��於 ,���͂��於(��),�h�� ,���˗���R�[�h ,���˗���d�b�ԍ� ,���˗���d�b�ԍ��}�� ,���˗���X�֔ԍ� ,���˗���Z�� ,���˗��喼 ,���˗��喼(��),�i���R�[�h�P,�i���P,�i���R�[�h�Q,�i���Q,�׈����P,�׈����Q,�L�� ,�ڸđ�������z�i�ō�),������Ŋz�� ,�~�u�� ,�c�Ə��R�[�h ,���s���� ,�����\���t���O ,������ڋq�R�[�h ,�����敪�ރR�[�h ,�^���Ǘ��ԍ� ,�N���l�Rweb�R���N�g�f�[�^�o�^ ,�N���l�Rweb�R���N�g�����X�ԍ� ,�N���l�Rweb�R���N�g�\����t�ԍ��P,�N���l�Rweb�R���N�g�\����t�ԍ�2,�N���l�Rweb�R���N�g�\����t�ԍ�3,���͂��\�肅���[�����p�敪 ,���͂��\�肅���[��e-mail�A�h���X ,���͋@�� ,���͂��\�肅���[�����b�Z�[�W ,���͂����������[�����p�敪 ,���͂����������[��e-mail�A�h���X ,���͂����������[�����b�Z�[�W ,�N���l�R���[��s���p�敪 ,�\�� ,���[��s�������z(�ō�),���[��s������Ŋz�� ,���[��s������X�֔ԍ� ,���[��s������Z��,���[��s������Z���i�A�p�[�g�}���V�������j ,���[��s�������ЁE���喼�P,���[��s�������ЁE���喼2 ,���[��s�����於(����),���[��s�����於(�J�i),���[��s�⍇���於(����),���[��s�⍇����X�֔ԍ� ,���[��s�⍇����Z�� ,���[��s�⍇����Z���i�A�p�[�g�}���V�������j,���[��s�⍇����d�b�ԍ� ,���[��s�Ǘ��ԍ� ,���[��s�i�� ,���[��s���l ,������������L�[ ,�����L�[�^�C�g��1,�����L�[1,�����L�[�^�C�g��2,�����L�[2,�����L�[�^�C�g��3,�����L�[3,�����L�[�^�C�g��4,�����L�[4,�����L�[�^�C�g��5,�����L�[5,�\��tdo�d�� ,�\��tdo�d�� ,�����\�胁�[�����p�敪 ,�����\�胁�[��e-mail�A�h���X ,�����\�胁�[�����b�Z�[�W ,�����������[���i���͂��戶�j���p�敪 ,�����������[���i���͂��戶�je-mail�A�h���X ,�����������[���i���͂��戶�j���[�����b�Z�[�W ,�����������[���i���˗��制�j���p�敪 ,�����������[���i���˗��制�je-mail�A�h���X ,�����������[���i���˗��制�j���[�����b\r\n'+strCsv;
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
//	parameter['timeZoneTextval'] = timeZoneTextval; 20230213 changed by zhou  U046�ۑ�K��s�v
	
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}
function csvOut(request, response) {
	var form = nlapiCreateForm('DJ_�����쐬�@�\', false);
	form.setScript('customscript_djkk_cs_invoice_creation');
	var jobId = request.getParameter('jobId');
	var express = request.getParameter('express');
	var date = request.getParameter('date');//���t
	var number = request.getParameter('number');//��t�ԍ�
	var dateree = request.getParameter('dateree');//�o�ד�from
	var datereeto = request.getParameter('datereeto');//�o�ד�from
//	var invoice = request.getParameter('invoice');//�����ԍ�
	var clubValue = request.getParameter('clubValue');//���
	var transportValue = request.getParameter('transportValue');//�z�����@
	var locationValue = request.getParameter('locationValue');//�q��
	var deliveryTextval = request.getParameter('deliveryTextval');//�[�i��
	var deliveryDateTextval = request.getParameter('deliveryDateTextval');//�[�i��From
	var deliveryDateTextvalTo = request.getParameter('deliveryDateTextvalTo');//�[�i��to
	var inputOrderTextval = request.getParameter('inputOrderTextval');//�󒍓��͎�
	var sectionTextval = request.getParameter('sectionTextval');//�Z�N�V����
	var tempTextval = request.getParameter('temp');//���x�P�� 20230213 changed by zhou
	var fieldIdTextval = request.getParameter('fieldId');//
	 var expressCode=  form.addField('custpage_express_code', 'text', 'express').setDisplayType('hidden');
	 expressCode.setDefaultValue(express);
	 var transportCode = form.addField('custpage_transport_code', 'text', '�z�����@').setDisplayType('hidden'); //
	 transportCode.setDefaultValue(transportValue);
	 var clubCode = form.addField('custpage_club_code', 'text', '���').setDisplayType('hidden');//���
	 clubCode.setDefaultValue(clubValue);
	 var locationCode = form.addField('custpage_location_code', 'text', '�q��').setDisplayType('hidden'); //�q��
	 locationCode.setDefaultValue(locationValue);
	 var dateCode = form.addField('custpage_date_code', 'date', '���t').setDisplayType('hidden');
	 dateCode.setDefaultValue(date);
	 var dateTextCode = form.addField('custpage_datetext_code', 'date', '�o�ד�from').setDisplayType('hidden');
	 dateTextCode.setDefaultValue(dateree);
	 var dateTextToCode = form.addField('custpage_datetext_to_code', 'date', '�o�ד�to').setDisplayType('hidden');
	 dateTextToCode.setDefaultValue(datereeto);
	 var numberCode = form.addField('custpage_number_code', 'longtext', '��t�ԍ�').setDisplayType('hidden');
	 numberCode.setDefaultValue(number);
	 var deliveryCode = form.addField('custpage_delivery_code', 'text', '�[�i��').setDisplayType('hidden');
	 deliveryCode.setDefaultValue(deliveryTextval);
	 var deliveryDateCode = form.addField('custpage_delivery_date_code', 'text', '�[�i��From').setDisplayType('hidden');
	 deliveryDateCode.setDefaultValue(deliveryDateTextval);
	 var deliveryDateTextCodeTo = form.addField('custpage_delivery_date_code_to', 'text', '�[�i��To').setDisplayType('hidden');//�[�i��to//20230213 add by zhou
	 deliveryDateTextCodeTo.setDefaultValue(deliveryDateTextvalTo);
	 var inputOrderCode = form.addField('custpage_input_order_code', 'text', '�󒍓��͎�').setDisplayType('hidden');
	 inputOrderCode.setDefaultValue(inputOrderTextval);
	 var sectionCode = form.addField('custpage_section_code', 'text', '�Z�N�V����').setDisplayType('hidden');
	 sectionCode.setDefaultValue(sectionTextval);
	 var tempCode = form.addField('custpage_temp_code', 'text', '���x�P��').setDisplayType('hidden');
	 sectionCode.setDefaultValue(tempTextval);
//	var timeZoneTextval = request.getParameter('timeZoneTextval');//���ԑ�  20230213 changed by zhou U046�ۑ�K��s�v
//	 var timeZoneCode = form.addField('custpage_time_zone_code', 'text', '���ԑ�').setDisplayType('hidden');  20230213 changed by zhou  U046�ۑ�K��s�v
//	 timeZoneCode.setDefaultValue(timeZoneTextval);  20230213 changed by zhou  U046�ۑ�K��s�v
//	 var invoiceCode = form.addField('custpage_invoice_number_code', 'text', '�����ԍ�').setDisplayType('hidden');
//	 invoiceCode.setDefaultValue(invoice);
	form.addFieldGroup('custpage_run_info', '�^�]���');
	var runstatusField = form.addField('custpage_run_info_status', 'text',
			'', null, 'custpage_run_info');
	runstatusField.setDisplayType('inline');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_invoice_creation');

	if (batchStatus == 'FAILED') {
		// ���s���s�̏ꍇ
		var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
		runstatusField.setDefaultValue(messageColour);
		form.addButton('btn_approved', '�߂�','go_back()');
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// ���s���̏ꍇ
		runstatusField.setDefaultValue('�o�b�`���������s��');
		form.addButton('custpage_refresh', '�X�V', 'refresh();');
		response.writePage(form);
	}else{
		runstatusField.setDefaultValue('����������');
		
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
			 form.addButton('btn_approved', 'CSV�̃_�E�����[�h',csvDownUrl);
			 form.addButton('btn_approved', '�߂�','go_back()');
		}
		
	}

	 response.writePage(form);
}
function createForm(request, response){
	var selectFlg = request.getParameter('selectFlg');
	var express = request.getParameter('express');//�^�����
	var expressType;//��Ђ̋敪
	if(express == '3887'){
		expressType = '����^�A�������';
	}else if(express == '4'){
		expressType = '���Z';
	}else if(express == '685'){
		expressType = '���{�ʉ^�������';
	}else if(express == '684'){
		expressType = '���}�g�^�A�������';
	}
	var date = request.getParameter('date');//���t
	var number = request.getParameter('number');//��t�ԍ�
	var numberArr = [];
	if(!isEmpty(number)){
		var str = number.split(',');
		for(var c=0;c<str.length;c++){
			numberArr.push(str[c]);
		}
	}
	
	var dateree = request.getParameter('dateree');//�o�ד�from
	var datereeto = request.getParameter('datereeto');//�o�ד�to
//	var invoice = request.getParameter('invoice');//�����ԍ�
	var clubValue = request.getParameter('club');//���
	var transportValue = request.getParameter('transport');//�z�����@
	var locationValue = request.getParameter('location');//�q��
	var deliveryval = request.getParameter('delivery');//�[�i��
	var deliveryDateval = request.getParameter('deliveryDate');//�[�i��
	var deliveryDatevalTo = request.getParameter('deliveryDateTo');//�[�i��tp
	var inputOrderval = request.getParameter('inputOrder');//�󒍓��͎�
	var sectionval = request.getParameter('section');//�Z�N�V����
	var timeZoneval = request.getParameter('timeZone');//���ԑ�
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
		filit.push(["custcol_djkk_shipping_company","anyof",express]);//so�^����Ж��ה��f���ŁA�o��
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
	if(!isEmpty(tempTextval)){//���x�P�� 20230213 changed by zhou
		filit.push(["custcol_djkk_temperature","anyof",tempTextval]);//���x�P�� 20230213 changed by zhou
		filit.push("AND");//���x�P�� 20230213 changed by zhou
	}
//	if(express=='���}�g�^�A�������'){20230213 changed by zhou  U046�ۑ�K��s�v
//		if(!isEmpty(timeZoneval)){
//			filit.push(["custbody_djkk_delivery_time_zone_descr","anyof",timeZoneval]);
//			filit.push("AND");
//		}
//	}else if(express=='����^�A�������'){
//		if(!isEmpty(timeZoneval)){
//			filit.push(["custbody_djkk_delivery_time_zone","anyof",timeZoneval]);
//			filit.push("AND");
//		}
//	}else if(express=='���{�ʉ^�������'){
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
	var form = nlapiCreateForm('DJ_�����쐬�@�\', false);
	form.setScript('customscript_djkk_cs_invoice_creation');
	SEARCH_Form = form;
		
//	 //��ʍ��ڒǉ�
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '�߂�','searchReturn()')		 
		 form.addSubmitButton('CSV�o��');
		 form.addFieldGroup('select_group_after', '����');
//       20230213 changed by zhou 
//		 MEMO: U046�ۑ�K�� �������ʗv��Ȃ�
//		  {
//            //���
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
//				 var club1 = form.addField('custpage_club1', 'text', '���',null,'select_group_after').setDisplayType('inline');//���
//				 club1.setDefaultValue(clubValue1);
//				
//			 }
//			 //�z�����@
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
//				 var transport1 = form.addField('custpage_transport1', 'text', '�z�����@',null,'select_group_after').setDisplayType('inline');//�^�����
//				 transport1.setDefaultValue(transportValue1);
//			 }
//			//�q��
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
//				 var location1 = form.addField('custpage_location1', 'text', '�q��',null,'select_group_after').setDisplayType('inline'); //�q��
//				 location1.setDefaultValue(locationValue1);
//			 }
//			 //��t�ԍ�
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
//					var numberEnd1 = form.addField('custpage_number1', 'text', '��t�ԍ�',null,'select_group_after').setDisplayType('inline');
//					numberEnd1.setDefaultValue(number1);
//			 }
//			//�[�i��
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
//				 var deliCodeField = form.addField('custpage_delicode', 'text', '�[�i��',null,'select_group_after').setDisplayType('inline'); //�[�i��
//				 deliCodeField.setDefaultValue(deliCode);
//			 }
//			 //�󒍓��͎�
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
//				 var emploCodeField = form.addField('custpage_employcode', 'text', '�󒍓��͎�',null,'select_group_after').setDisplayType('inline'); //�󒍓��͎�
//				 emploCodeField.setDefaultValue(employCode);
//			 }
//			 //�Z�N�V����
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
//				 var departCodeField = form.addField('custpage_departcode', 'text', '�Z�N�V����',null,'select_group_after').setDisplayType('inline'); //�󒍓��͎�
//				 departCodeField.setDefaultValue(departCode);
//			 }
//			 //���ԑ�      20230213 zhou memo :�ۑ�K��s�v
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
//				 var csvGroupCodeField = form.addField('custpage_csvgroupcode', 'text', '���ԑ�',null,'select_group_after').setDisplayType('inline'); //�󒍓��͎�
//				 csvGroupCodeField.setDefaultValue(csvGroupCode);
//			 }
//	     }

		 
		 var numberField = form.addField('custpage_express_date', 'text', '�z�B�w���','').setDisplayType('hidden');
		 numberField.setDefaultValue('testData');
		 var transport = form.addField('custpage_transport', 'text', '�z�����@',null,'select_group_after').setDisplayType('hidden');//�^�����
		 transport.setDefaultValue(transportValue);
		 var club = form.addField('custpage_club', 'text', '���',null,'select_group_after').setDisplayType('hidden');//���
		 club.setDefaultValue(clubValue);
		 var location = form.addField('custpage_location', 'text', '�q��',null,'select_group_after').setDisplayType('hidden'); //�q��
		 location.setDefaultValue(locationValue);
		 var dateEnd = form.addField('custpage_date', 'date', '������',null,'select_group_after').setDisplayType('hidden');//20230213 changed by zhou  ���t =>������
		 dateEnd.setDefaultValue(date);
		 var dateText = form.addField('custpage_datetext', 'date', '�o�ד�From',null,'select_group_after').setDisplayType('hidden');//20230213 changed by zhou
		 dateText.setDefaultValue(dateree);
		 var dateTextTo = form.addField('custpage_datetext_to', 'date', '�o�ד�To',null,'select_group_after').setDisplayType('hidden');//20230213 changed by zhou
		 dateTextTo.setDefaultValue(datereeto);
		 var numberEnd = form.addField('custpage_number', 'longtext', '��t�ԍ�',null,'select_group_after').setDisplayType('hidden');
		 numberEnd.setDefaultValue(number);
		 var deliveryText = form.addField('custpage_delivery', 'text', '�[�i��',null, 'select_group_after').setDisplayType('hidden');//�[�i��
		 deliveryText.setDefaultValue(deliveryval);
		 var deliveryDateText = form.addField('custpage_delivery_date', 'date', '�[�i��From',null, 'select_group_after').setDisplayType('hidden');//�[�i��//20230213 changed by zhou
		 deliveryDateText.setDefaultValue(deliveryDateval);
		 var deliveryDateTextTo = form.addField('custpage_delivery_date_to', 'date', '�[�i��To',null, 'select_group_after').setDisplayType('hidden');//�[�i��//20230213 add by zhou
		 deliveryDateTextTo.setDefaultValue(deliveryDatevalTo);
		 var inputOrderText = form.addField('custpage_input_order', 'text', '�󒍓��͎�',null, 'select_group_after').setDisplayType('hidden');//�󒍓��͎�
		 inputOrderText.setDefaultValue(inputOrderval);
		 var sectionText = form.addField('custpage_section', 'text', '�Z�N�V����',null, 'select_group_after').setDisplayType('hidden');//�Z�N�V����
		 sectionText.setDefaultValue(sectionval);
		 var tempText = form.addField('custpage_temp', 'text', '���x�P��',null, 'select_group_after').setDisplayType('hidden');//���x�P�� 20230213 changed by zhou
		 tempText.setDefaultValue(tempTextval);
		 
		 var fieldidText = form.addField('custpage_fieldid', 'text', '�t�@�C��ID',null, 'select_group_after').setDisplayType('hidden');//���x�P�� 20230213 changed by zhou
		 
//		 var timeZoneText = form.addField('custpage_time_zone', 'text', '���ԑ�',null, 'select_group_after').setDisplayType('hidden');//���ԑ�  20230213 changed by zhou U046�ۑ�K��s�v
//		 timeZoneText.setDefaultValue(timeZoneval);   20230213 changed by zhou  U046�ۑ�K��s�v
//		 var invoiceEnd = form.addField('custpage_invoice_number', 'text', '�����ԍ�',null,'select_group_after').setDisplayType('inline');
//		 invoiceEnd.setDefaultValue(invoice);
		 if(position == 'back'){
			 var expressBack = request.getParameter('expressBack');
			 var expressFieldBack = form.addField('custpage_express', 'text','�^�����',null,'select_group_after').setDisplayType('hidden');//20230213 changed by zhou
			 expressFieldBack.setDefaultValue(express); 
		 }else{
			 var expressField = form.addField('custpage_express', 'text', '�^�����',null,'select_group_after').setDisplayType('hidden');//20230213 changed by zhou
			 expressField.setDefaultValue(express);

		 }
	 }else{
		 nlapiLogExecution('debug','form', 'in')
		 form.addButton('btn_search', '����', 'search()')
		 form.addButton('btn_clear', '�N���A', 'clearf()')
		 form.addFieldGroup('select_line1', '����')
		 form.addFieldGroup('select_line2', '����').setShowBorder(false);
		 form.addFieldGroup('select_line3', '����').setShowBorder(false);
		 form.addFieldGroup('select_line4', '����').setShowBorder(false);
		 form.addFieldGroup('select_line5', '����').setShowBorder(false);
		 form.addFieldGroup('select_line6', '����').setShowBorder(false);
		 form.addFieldGroup('select_line7', '����').setShowBorder(false);
		 form.addFieldGroup('select_line8', '����').setShowBorder(false);
		 form.addFieldGroup('select_line9', '����').setShowBorder(false);
		 //select line1
		 var clubField = form.addField('custpage_club', 'select', '���',null, 'select_line1');//���
		 clubField.setMandatory(true);
		 
		 //select line2
		 var dateField = form.addField('custpage_date', 'date', '������',null, 'select_line2');//20230213 changed by zhou  ���t =>������
		 var tempField = form.addField('custpage_temp', 'multiselect', '���x�P��',null, 'select_line2');
		 var numberField = form.addField('custpage_number', 'multiselect', '�󒍔ԍ�',null, 'select_line2');
//		 var numberTextField = form.addField('custpage_number_t', 'longtext', '�󒍔ԍ��e�L�X�g',null, 'select_line2');
		 //select line3
		 var dateTextField = form.addField('custpage_datetext', 'date', '�o�ד�From',null, 'select_line3');
		 dateTextField.setMandatory(true);
		 var expressField = form.addField('custpage_express', 'select', '�^�����',null, 'select_line3');//�^�����
		 expressField.setMandatory(true);
		 //select line4
		 var dateTextFieldTo = form.addField('custpage_datetext_to', 'date', '�o�ד�To',null, 'select_line4');//Delivery
		 dateTextFieldTo.setMandatory(true);
		 //select line5
		 var delivery = form.addField('custpage_delivery', 'select', '�[�i��',null, 'select_line5');//�[�i��
		 //select line6
		 var deliveryDate = form.addField('custpage_delivery_date', 'date', '�[�i��From',null, 'select_line6');//�[�i�� 
		 var locationField = form.addField('custpage_location', 'select', '�q��',null, 'select_line6'); //�q��
		 
		 var deliveryDateTo = form.addField('custpage_delivery_date_to', 'date', '�[�i��To',null, 'select_line7');//20230213 add by zhou
		 //select line7
		 var section = form.addField('custpage_section', 'select', '�Z�N�V����',null, 'select_line8');//�Z�N�V����
		 var inputOrder = form.addField('custpage_input_order', 'select', '�󒍓��͎�',null, 'select_line8');//�󒍓��͎�
		 //select line8
		 var transportField = form.addField('custpage_transport', 'select', '�z�����@',null, 'select_line9').setDisplayType('hidden');; 
		 //add
		 
		 
		 
		 
//		 var timeZone = form.addField('custpage_time_zone', 'select', '���ԑ�',null, 'select_group');//���ԑ� 20230213 changed by zhou  U046�ۑ�K��s�v
		 //end
		 //var numberField = form.addField('custpage_number', 'text', '��t�ԍ�',null, 'select_group');

//		 var invoice_Number = form.addField('custpage_invoice_number', 'text', '�����ԍ�',null, 'select_group');
		 
		 var selectSub=getRoleSubsidiariesAndAddSelectOption(clubField);
		 if(isEmpty(clubValue)){
			 clubValue = selectSub;
		 }
		 
		 //�^�����
		 var shippingcompanySearch = nlapiSearchRecord("customrecord_djkk_shippingcompany_mst",null,
				 [
				 ], 
				 [
				    new nlobjSearchColumn("name").setSort(false), //���O
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
//		 expressField.addSelectOption('���{�ʉ^�������', '���{�ʉ^������Њ������')//
//		 expressField.addSelectOption('����^�A�������', '����^�A�������')//SaGaWa
//		 expressField.addSelectOption('���}�g�^�A�������', '���}�g�^�A�������')
		 //add
		 if(!isEmpty(clubValue)){
			 //�[�i��
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
			 
			 //�󒍓��͎�
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
			 
			 
			 //�Z�N�V����
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
			 
			 //���ԑ� 20230213 changed by zhou  U046�ۑ�K��s�v
//			 if(!isEmpty(express)){
//				 var expressVal = ''
//				 if(express=='���{�ʉ^�������'){
//					 expressVal='time_kubun_nitu';
//				 }else if(express=='���}�g�^�A�������'){
//					 expressVal='time_kubun_yamato';
//				 }else if(express=='����^�A�������'){
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
			 //�z�����@
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
		 //20230213 add by zhou start ���x�P��
		 if(!isEmpty(clubValue)){
			 //���x�P��
					var tempSearch = nlapiSearchRecord("customrecord_djkk_shipping_temperature",null,//DJ_���i�z�����x
					[
					   ["custrecord_djkk_shipping_temperature_id","isnotempty",""] 
					], 
					[
					   new nlobjSearchColumn("internalid").setSort(false),//DJ_�z�����x�敪
					   new nlobjSearchColumn("name").setSort(false),//���O
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
			 //�q��
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
//		 timeZone.setDefaultValue(timeZoneval); 20230213 changed by zhou  U046�ۑ�K��s�v
		 
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

	 // ���ו\��
	 if(selectFlg == 'T'){
		 nlapiLogExecution('debug','���ו\��', 'in')
	 	var subList = form.addSubList('list', 'list', '');
		subList.addMarkAllButtons();
		subList.addField('chk', 'checkbox', '�I��')
		//20230213 add by zhou  U046
		subList.addField('custpage_mainline_zip_code', 'text', '�X�֔ԍ�');
		subList.addField('custpage_mainline_tranid', 'text', '�󒍔ԍ�');
		subList.addField('custpage_mainline_temperature_unit', 'text', '���x�P��');
		subList.addField('custpage_mainline_shipping_date', 'text', '�o�ד�');
		subList.addField('custpage_mainline_freight_company', 'text', 'DJ_�^�����');
		subList.addField('custpage_mainline_delivery_name', 'text', '�͂��於');
		subList.addField('custpage_mainline_address', 'text', '���͂���̏Z��');
		subList.addField('custpage_mainline_delivery_date', 'text', '�[�i��');
		subList.addField('custpage_mainline_sending_table', 'text', '�������l��');
		subList.addField('custpage_mainline_amount', 'text', '���z');
		subList.addField('custpage_mainline_total_amount', 'text', '������v���z');
		subList.addField('custpage_mainline_insurance', 'checkbox', '�ی��t');
		subList.addField('custpage_mainline_insurance_premium', 'text', '�ی���').setDisplayType('entry');
		subList.addField('custpage_mainline_dataserialnumber', 'text', 'dataSerialnumber').setDisplayType('hidden');
		
		//end
		if(expressType == '���{�ʉ^�������'){// 
			//20230213 add by zhou start 
			var deliveryTimeZoneField = subList.addField('custpage_ne_deliverytimezone', 'select', '�z�B�w�莞��');//changed by zhou 20230310
		    //YAMATO  �z�B���ԑ�
			var deliveryTimeZoneSearch = nlapiSearchRecord("customrecord_djkk_csv_group",null,
					[
					["custrecord_djkk_csv_kubun","is","NE�z�B���ԑ�"]
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
			
//			subList.addField('custpage_comment1', 'text', '�L����1');
		}else if(expressType == '����^�A�������'){//SaGaWa			
			var mainShippingInformationField = subList.addField('custpage_mainline_shipping_information', 'select', '�o�׎w�����(������)');
			//20230213 add by zhou start  in working
			var ShippingInformationSearch = nlapiSearchRecord("customrecord_djkk_csv_group",null,
					[
					["custrecord_djkk_csv_kubun","is","�o�׎w�����"]
					], 
					[
					 	new nlobjSearchColumn('custrecord_djkk_csv_name'),//CSV�o�͗p����
						new nlobjSearchColumn('custrecord_djkk_csv_code')//CSV�o�͗p�R�[�h
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
			var packingFigureField  = subList.addField('custpage_packing_figure', 'select', '�׎p');
			//20230213 add by zhou start  in working
			var packingFigureTypeSearch = nlapiSearchRecord("customrecord_djkk_cargo",null,
					[
					["custrecord_djkk_cargo_serialnumber_list","isnotempty",""]
					], 
					[
					 	new nlobjSearchColumn('custrecord_djkk_cargo_type_list'),//DJ_�׎p���
						new nlobjSearchColumn('custrecord_djkk_cargo_serialnumber_list')//DJ_�V�[�P���X�ԍ�
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
			var speedDesignationField =  subList.addField('custpage_speed_designation', 'select', '�X�s�[�h�w��');
			//20230213 add by zhou start  in working
			var sdTypeSearch = nlapiSearchRecord("customrecord_djkk_speed_designation",null,
					[
					["custrecord_djkk_sd_serialnumber_list","isnotempty",""]
					], 
					[
					 	new nlobjSearchColumn('custrecord_djkk_sd_type_list'),//DJ_�X�s�[�h���
						new nlobjSearchColumn('custrecord_djkk_sd_serialnumber_list')//DJ_�X�s�[�h�V�[�P���X�ԍ�
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
			var deliveryTimeZoneField = subList.addField('custpage_sagawadeliverytimezone', 'select', '�z�B�w�莞�ԑ�');//changed by zhou 20230310
		    //YAMATO  �z�B���ԑ�
			var deliveryTimeZoneSearch = nlapiSearchRecord("customrecord_djkk_csv_group",null,
					[
					["custrecord_djkk_csv_kubun","is","SAGAWA�z�B���ԑ�"]
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
			
			
			var deliverySpecifiedHour = subList.addField('custpage_delivery_specified_hour', 'select', '�z�B�w�莞�ԁi���j').setDisplayType('entry');//changed by zhou 20230310
			deliverySpecifiedHour.addSelectOption('', '');
			for(var h = 0 ;h < 25;h++){
				var deliverySpecifiedHourId = '';
				var deliverySpecifiedHourName = '';
				if(h < 10){
					deliverySpecifiedHourId += '0'+h.toString();
					deliverySpecifiedHourName += '0'+h.toString()+'��';
				}else{
					deliverySpecifiedHourId += h.toString();
					deliverySpecifiedHourName += h.toString()+'��';
				}
				deliverySpecifiedHour.addSelectOption(deliverySpecifiedHourId, deliverySpecifiedHourName);
			}
			var deliverySpecifiedMin = subList.addField('custpage_delivery_specified_min', 'select', '�z�B�w�莞�ԁi���j').setDisplayType('entry');//changed by zhou 20230310
			deliverySpecifiedMin.addSelectOption('', '');
			deliverySpecifiedMin.addSelectOption('00', '00��');
			deliverySpecifiedMin.addSelectOption('30', '30��');
//			var ShippingInformationField = subList.addField('custpage_designatied_seal_1', 'select', '�w��V�[���P');//20230213 changed by zhou
			//20230213 add by zhou start  in working
			//ShippingInformation Type
//			ShippingInformationField.addSelectOption('', '');
//			for(var spt2 = 0 ; spt2 < ShippingInformationArr.length ; spt2++){
//				ShippingInformationField.addSelectOption(ShippingInformationArr[spt2].serialnumber, ShippingInformationArr[spt2].type,false)
//			}
			//end
			subList.addField('custpage_sales_office_pickup', 'checkbox', '�c�Ə����');//20230213 changed by zhou  
			subList.addField('custpage_src_segmentation', 'checkbox', 'SRC�敪');//20230213 changed by zhou 
			subList.addField('custpage_original_arrival_category', 'checkbox', '�����敪');//20230213 changed by zhou 		
		}else {
			nlapiLogExecution('debug','create sub', 'in')
//			subList.addField('custpage_customer_control_number', 'text', '���q�l�Ǘ��ԍ�');
//			subList.addField('custpage_sending_type', 'text', '�������');//changed by zhou 20230213
			var invoiceTypeField = subList.addField('custpage_sending_type', 'select', '�������');//changed by zhou 20230213
			//20230213 add by zhou start 
		    //YAMATO  DJ_������ރ��X�g 
			var invoiceTypeSearch = nlapiSearchRecord("customrecord_djkk_invoice_type",null,
					[
					["custrecord_djkk_sub_type","is",clubValue]
					], 
					[
					 	new nlobjSearchColumn('custrecord_djkk_invoice_type_list'),//DJ_�������
						new nlobjSearchColumn('custrecord_djkk_serialnumber_list')//DJ_�V�[�P���X�ԍ�
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
			var deliveryTimeZoneField = subList.addField('custpage_yamatodeliverytimezone', 'select', '�z�B���ԑ�');//changed by zhou 20230310
		    //YAMATO  �z�B���ԑ�
			var deliveryTimeZoneSearch = nlapiSearchRecord("customrecord_djkk_csv_group",null,
					[
					["custrecord_djkk_csv_kubun","is","YAMATO�z�B���ԑ�"]
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
			
			subList.addField('custpage_handling_one', 'checkbox', '����������');//20230213 changed by zhou
			subList.addField('custpage_handling_two', 'checkbox', '�V�n���p');//20230213 changed by zhou
		}
	 }
	 
	 // �ۑ�����
	 var dataArr = [];//�����t�B���^�f�[�^�z��
	 if(selectFlg == 'T'){	
		 if(expressType == '���{�ʉ^�������'){
				//20230216 add by zhou start
			 var lineNum = new nlobjSearchColumn("line"); //�󒍔ԍ�
			 var soid  = new nlobjSearchColumn("internalid"); //�󒍔ԍ�
//			 var primary_zip_code = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  is null THEN  Replace({billingAddress.zip},'-','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  END"); //�X�֔ԍ�
			 var primary_tranid = new nlobjSearchColumn("tranid"); //�󒍔ԍ�
			 var primary_temperature_unit = new nlobjSearchColumn("custcol_djkk_temperature"); //DJ_�z�����x
			 var primary_shipping_date = new nlobjSearchColumn("shipdate"); //�o�ד�
			 var primary_freight_company = express; //DJ_�^�����
//			 var primary_delivery_name  = new nlobjSearchColumn("formulatext");//���͂��於
//			 primary_delivery_name.setFormula("CASE WHEN {custbody_djkk_delivery_destination.custrecorddjkk_name} is null THEN {billingAddress.addressee} ELSE {custbody_djkk_delivery_destination.custrecorddjkk_name} END");
//			 var primary_address  = new nlobjSearchColumn("formulatext");//20230213 changed by zhou   DJ_�s���{�� +DJ_�s�撬��+DJ_�[�i��Z��1+DJ_�[�i��Z��2; //���͂���̏Z��
//			 primary_address.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city}||{billingAddress.address1}||{billingAddress.address2},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') END");
			 var primary_delivery_date = new nlobjSearchColumn("custbody_djkk_delivery_date"); //�[�i��
			 var primary_sending_table = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN {custbody_djkk_de_sodeliverermem} is null THEN {custbody_djkk_sodeliverermem} ELSE {custbody_djkk_de_sodeliverermem} END"); //�������l��

			 var primary_amount = new nlobjSearchColumn("amount"); //���z
			 var payment = new nlobjSearchColumn("custbody_djkk_payment_conditions");//�x������
			 var primary_total_amount = new nlobjSearchColumn("amount"); //������v���z
			 var primary_insurance = new nlobjSearchColumn("formulatext"); //�ی��t
			 var primary_insurance_premium = new nlobjSearchColumn("custcolcustbody_djkk_guarantee_fund"); //�ی���
			 var primary_shipping_information = new nlobjSearchColumn("memo"); //�o�׎w�����(������)
			 //end
			 var delivery =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//SO.�[�i��
			 var customer =  new nlobjSearchColumn("entity");//SO.�ڋq
			 var deliveryPrepare = new nlobjSearchColumn("custbody_djkk_de_sodeliverermem"); //DJ_�[�i�摗���ɋL�ڔ��l��
			 var customerPrepare = new nlobjSearchColumn("custbody_djkk_sodeliverermem"); //DJ_�ڋq�����ɋL�ڔ��l��
			 var deliveryAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')");//SO.�[�i��.�X�֔ԍ�
			 var deliveryAddressState = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_prefectures}");//SO.�[�i��.�s���{��
			 var deliveryAddressCity = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}");//SO.�[�i��.�s�撬��
			 var deliveryAddress1 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}");//SO.�[�i��.�Z��1
			 var deliveryAddress2 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable}");//SO.�[�i��.�Z��2
			 var deliveryAddress3 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2}");//SO.�[�i��.�Z��3
			 var deliveryName = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecorddjkk_name}");//SO.�[�i��.�[�i�於�O
			 var deliveryNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},0,40)");//SO.�[�i��.�[�i�於�O(0-40)
			 var deliveryNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,40)");//SO.�[�i��.�[�i�於�O(41-80)
			 var deliveryAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text}");//SO.�[�i��.�d�b�ԍ�
			 var billingAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({billingAddress.zip},'-','')");//SO.�ڋq.�X�֔ԍ�
			 var billingAddressState = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.custrecord_djkk_address_state}");//SO.�ڋq.�s���{��
			 var billingAddressCity= new nlobjSearchColumn("formulatext").setFormula("{billingAddress.city}");//SO.�ڋq.�s�撬��
			 var billingAddress1 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address1}");//SO.�ڋq.�Z��1
			 var billingAddress2 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address2}");//SO.�ڋq.�Z��2
			 var billingAddress3 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address3}");//SO.�ڋq.�Z��3
			 var billingName = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.addressee}");//SO.�ڋq.(0-40)
			 var billingNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},0,40)");//SO.�ڋq.(0-40)
			 var billingNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},41,40)");//SO.�ڋq.(41-80)
			 var billingAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.phone}");//SO.�ڋq.�d�b�ԍ�
			 
//			 var zip = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'','')  is null THEN  Replace({billingAddress.zip},'','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'','')  END"); //�X�֔ԍ�
//			  
//			 var prefectures =  new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities},'','') END");
//			 var deliveryResidence = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence},'','') is null THEN Replace({billingAddress.address1},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence},'','') END");
//			 var deliveryResidence2 = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') is null THEN Replace({billingAddress.address2},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') END");
	//
//			 var custrecorddjkkName =  new  nlobjSearchColumn("formulatext").setFormula("CASE WHEN SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},0,40)is null THEN SUBSTR({billingAddress.addressee},0,40) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},0,40) END");
//			 var custrecorddjkkName2 =  new  nlobjSearchColumn("formulatext").setFormula("CASE WHEN SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,40)is null THEN SUBSTR({billingAddress.addressee},41,40) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,40) END");
//			 var deliveryPhoneNumber =  new  nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'','') is null THEN Replace({billingAddress.phone},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'','') END");
			 //var displayname =  new  nlobjSearchColumn("formulatext").setFormula("{item.displayname}");
			 var displayname =  new  nlobjSearchColumn("formulatext").setFormula("{item.custitem_djkk_radioactivity_classifi}");//20230213 changed by zhou  DJ_8_���ː��敪
			 //var unit =  new  nlobjSearchColumn("formulatext").setFormula("CASE WHEN {unit} != 'Kg' and {unit} != 'g' THEN {quantity} ELSE 0 END");
			 var quantity =  new  nlobjSearchColumn("formulatext").setFormula("{custcol_djkk_casequantity}");//so.DJ_�P�[�X��
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
			 		var deliveryAfter =  defaultEmpty(searchresults[i].getValue(delivery));//SO.�[�i��
					var customerAfter =  defaultEmpty(searchresults[i].getValue(customer));//SO.�ڋq
					var deliveryAddressZipAfter = defaultEmpty(searchresults[i].getValue(deliveryAddressZip));//SO.�[�i��.�X�֔ԍ�
					var deliveryAddressStateAfter = defaultEmpty(searchresults[i].getValue(deliveryAddressState));//SO.�[�i��.�s���{��
					var deliveryAddressCityAfter = defaultEmpty(searchresults[i].getValue(deliveryAddressCity));//SO.�[�i��.�s�撬��
					var deliveryAddress1After = defaultEmpty(searchresults[i].getValue(deliveryAddress1));//SO.�[�i��.�Z��1
					var deliveryAddress2After = defaultEmpty(searchresults[i].getValue(deliveryAddress2));//SO.�[�i��.�Z��2
					var deliveryAddress3After = defaultEmpty(searchresults[i].getValue(deliveryAddress3));//SO.�[�i��.�Z��3
					var deliveryNameAfter = defaultEmpty(searchresults[i].getValue(deliveryName));//SO.�[�i��..�[�i�於�O
					var deliveryNameStr1After = defaultEmpty(searchresults[i].getValue(deliveryNameStr1));//SO.�[�i��.�[�i�於�O(0-40)
					var deliveryNameStr2After = defaultEmpty(searchresults[i].getValue(deliveryNameStr2));//SO.�[�i��.�[�i�於�O(41-80)
					var deliveryAddressPhoneAfter = defaultEmpty(searchresults[i].getValue(deliveryAddressPhone));//SO.�[�i��.�d�b�ԍ�
					var billingAddressZipAfter = defaultEmpty(searchresults[i].getValue(billingAddressZip));//SO.�ڋq.�X�֔ԍ�
					var billingAddressStateAfter = defaultEmpty(searchresults[i].getValue(billingAddressState));//SO.�ڋq.�s���{��
					var billingAddressCityAfter= defaultEmpty(searchresults[i].getValue(billingAddressCity));//SO.�ڋq.�s�撬��
					var billingAddress1After = defaultEmpty(searchresults[i].getValue(billingAddress1));//SO.�ڋq.�Z��1
					var billingAddress2After = defaultEmpty(searchresults[i].getValue(billingAddress2));//SO.�ڋq.�Z��2
					var billingAddress3After = defaultEmpty(searchresults[i].getValue(billingAddress3));//SO.�ڋq.�Z��3
					var billingNameAfter = defaultEmpty(searchresults[i].getValue(billingName));//SO.�ڋq.���O
					var billingNameStr1After = defaultEmpty(searchresults[i].getValue(billingNameStr1));//SO.�ڋq.���O(0-40)
					var billingNameStr2After = defaultEmpty(searchresults[i].getValue(billingNameStr2));//SO.�ڋq.���O(41-80)
					var billingAddressPhoneAfter = defaultEmpty(searchresults[i].getValue(billingAddressPhone));//SO.�ڋq.�d�b�ԍ�
					var deliveryPrepareAfter = defaultEmpty(searchresults[i].getValue(deliveryPrepare));//SO.�[�i��.�����ɋL�ڔ��l��
					var customerPrepareAfter = defaultEmpty(searchresults[i].getValue(customerPrepare));//SO.�ڋq.�����ɋL�ڔ��l��
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
			 		var memo1After = '�̊O�f�f�� ';
			 		var memo2After = '';
			 		var memo3After = '';
			 		var amountAfter = defaultEmpty(searchresults[i].getValue(primary_amount));
			 		var insuredAmountAfter = '';
			 		
			 		//�l�̎擾
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
			 			
			 			primary_zip_code_after:primary_zip_code_after,//��v�X�֔ԍ�
			 			primary_tranid_after:primary_tranid_after,//��v�󒍔ԍ�
			 			primary_temperature_unit_after:primary_temperature_unit_after,//��v���x�P��
			 			primary_shipping_date_after:primary_shipping_date_after,//��v�o�ד�
			 			primary_delivery_name_after:primary_delivery_name_after,//��vDJ_�^�����
			 			primary_freight_company_after:primary_freight_company_after,//��v�͂��於
			 			primary_address_after:primary_address_after,//��v���͂���̏Z��
			 			primary_delivery_date_after:primary_delivery_date_after,//��v�[�i��
			 			primary_sending_table_after:primary_sending_table_after,//��v�������l��
			 			primary_insurance_after:primary_insurance_after,//��v�ی��t
			 			
			 			data:nittsuData
			 		}
			 		)
			 	
			 		nlapiLogExecution('DEBUG', 'dataArr', JSON.stringify(dataArr))	
			 		var totalArray = arrayAddDeduplication(dataArr,primary_freight_company_after) //���z���W�v���A�d���f�[�^������������̔z��
			 		nlapiLogExecution('DEBUG', 'totalArray', JSON.stringify(totalArray))	
			 		
			 		var dataBatchnumber = guid();
			 		var mainCsvStr = '�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�,�f�[�^,����id\r\n';
			 		nlapiLogExecution('DEBUG', 'dataBatchnumber', JSON.stringify(dataBatchnumber))
			 		for(var ya= 0 ; ya < totalArray.length;ya++){
			 			var amount = Number(totalArray[ya].amount)
			 		    var substitution = Number(totalArray[ya].substitution)
			 		    var insurancePremium = Number(totalArray[ya].insurancePremium)
			 		     
			 		    var data = JSON.stringify(totalArray[ya].data);
			 			subList.setLineItemValue( 'custpage_mainline_zip_code', ya+1, totalArray[ya].primary_zip_code_after);//��v�X�֔ԍ�
			 			subList.setLineItemValue( 'custpage_mainline_tranid', ya+1, totalArray[ya].primary_tranid_after);//��v�󒍔ԍ�
			 			subList.setLineItemValue( 'custpage_mainline_temperature_unit', ya+1, totalArray[ya].primary_temperature_unit_after);//��v���x�P��
			 			subList.setLineItemValue( 'custpage_mainline_shipping_date', ya+1, totalArray[ya].primary_shipping_date_after);//��v�o�ד�
			 			subList.setLineItemValue( 'custpage_mainline_freight_company', ya+1, totalArray[ya].primary_freight_company_after);//��vDJ_�^�����
			 			subList.setLineItemValue( 'custpage_mainline_delivery_name', ya+1, totalArray[ya].primary_delivery_name_after);//��v�͂��於
			 			subList.setLineItemValue( 'custpage_mainline_address', ya+1, totalArray[ya].primary_address_after);//��v���͂���̏Z��
			 			subList.setLineItemValue( 'custpage_mainline_delivery_date', ya+1, totalArray[ya].primary_delivery_date_after);//��v�[�i��
			 			subList.setLineItemValue( 'custpage_mainline_sending_table', ya+1, totalArray[ya].primary_sending_table_after);//��v�������l��
			 			subList.setLineItemValue( 'custpage_mainline_amount', ya+1, amount);//��v���z
			 		
			 			subList.setLineItemValue( 'custpage_mainline_total_amount', ya+1, substitution);//��v������z
			 			//			subList.setLineItemValue( 'custpage_mainline_insurance', ya+1, totalArray[ya].primary_insurance_after);//��v�ی��t
			 			subList.setLineItemValue( 'custpage_mainline_insurance_premium', ya+1, insurancePremium);//��v�ی���
			 			//			subList.setLineItemValue( 'custpage_mainline_shipping_information', ya+1, totalArray[ya].primary_shipping_information_after);//��v�o�׎w�����(������)
			 			//end
			 			subList.setLineItemValue( 'custpage_mainline_dataserialnumber', ya+1, totalArray[ya].dataSerialnumber);//�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�
			 			var newTotalArrayToJson = JSON.stringify(totalArray[ya].data).replace(/\,/g,'FFFFF')
			 			mainCsvStr += totalArray[ya].dataSerialnumber +','+newTotalArrayToJson+'\r\n';
			 		}
			 				
			 		var fieldId = csvMaker(mainCsvStr);
			 		fieldidText.setDefaultValue(fieldId);
			 	}
			 }
		 }else if(expressType == '����^�A�������'){//SaGaWa
				//20230216 add by zhou start
			 var lineNum = new nlobjSearchColumn("line"); //�󒍔ԍ�
			 var soid  = new nlobjSearchColumn("internalid"); //�󒍔ԍ�
//			var primary_zip_code = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  is null THEN  Replace({customer.billzipcode},'-','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  END"); //�X�֔ԍ�
			var primary_tranid = new nlobjSearchColumn("tranid"); //�󒍔ԍ�
			var primary_temperature_unit = new nlobjSearchColumn("custcol_djkk_temperature"); //DJ_�z�����x
			var primary_shipping_date = new nlobjSearchColumn("shipdate"); //�o�ד�
			var primary_freight_company = expressType; //DJ_�^�����
//			var primary_delivery_name  = new nlobjSearchColumn("formulatext");//���͂��於
//			primary_delivery_name.setFormula("CASE WHEN {custbody_djkk_delivery_destination.custrecorddjkk_name} is null THEN {billingAddress.addressee} ELSE {custbody_djkk_delivery_destination.custrecorddjkk_name} END");
//			var primary_address  = new nlobjSearchColumn("formulatext");//20230213 changed by zhou   DJ_�s���{�� +DJ_�s�撬��+DJ_�[�i��Z��1+DJ_�[�i��Z��2; //���͂���̏Z��
//			primary_address.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city}||{billingAddress.address1}||{billingAddress.address2},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') END");
			var primary_delivery_date = new nlobjSearchColumn("custbody_djkk_delivery_date"); //�[�i��
			var primary_sending_table = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN {custbody_djkk_de_sodeliverermem} is null THEN {custbody_djkk_sodeliverermem} ELSE {custbody_djkk_de_sodeliverermem} END"); //�������l��

			var primary_amount = new nlobjSearchColumn("amount"); //���z
			var payment = new nlobjSearchColumn("custbody_djkk_payment_conditions");//�x������
			var primary_total_amount = new nlobjSearchColumn("amount"); //������v���z
			var primary_insurance = new nlobjSearchColumn("formulatext"); //�ی��t
			var primary_insurance_premium = new nlobjSearchColumn("custcolcustbody_djkk_guarantee_fund"); //�ی���
			var primary_shipping_information = new nlobjSearchColumn("memo"); //�o�׎w�����(������)
			//end
			
			var delivery =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//SO.�[�i��
			 var customer =  new nlobjSearchColumn("entity");//SO.�ڋq
			 var deliveryPrepare = new nlobjSearchColumn("custbody_djkk_de_sodeliverermem"); //DJ_�[�i�摗���ɋL�ڔ��l��
			 var customerPrepare = new nlobjSearchColumn("custbody_djkk_sodeliverermem"); //DJ_�ڋq�����ɋL�ڔ��l��
			 var deliveryAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')");//SO.�[�i��.�X�֔ԍ�
			 var deliveryAddressState = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_prefectures}");//SO.�[�i��.�s���{��
			 var deliveryAddressCity = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}");//SO.�[�i��.�s�撬��
			 var deliveryAddress1 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}");//SO.�[�i��.�Z��1
			 var deliveryAddress2 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable}");//SO.�[�i��.�Z��2
			 var deliveryAddress3 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2}");//SO.�[�i��.�Z��3
			 var deliveryName = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecorddjkk_name}");//SO.�[�i��.�[�i�於�O
			 var deliveryNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},0,16)");//SO.�[�i��.�[�i�於�O(0-16)
			 var deliveryNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},16,16)");//SO.�[�i��.�[�i�於�O(16-32)
			 var deliveryAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text}");//SO.�[�i��.�d�b�ԍ�
			 var billingAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({billingAddress.zip},'-','')");//SO.�ڋq.�X�֔ԍ�
			 var billingAddressState = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.custrecord_djkk_address_state}");//SO.�ڋq.�s���{��
			 var billingAddressCity= new nlobjSearchColumn("formulatext").setFormula("{billingAddress.city}");//SO.�ڋq.�s�撬��
			 var billingAddress1 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address1}");//SO.�ڋq.�Z��1
			 var billingAddress2 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address2}");//SO.�ڋq.�Z��2
			 var billingAddress3 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address3}");//SO.�ڋq.�Z��3
			 var billingName = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.addressee}");//SO.�ڋq.(0-40)
			 var billingNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},0,16)");//SO.�ڋq.(0-16)
			 var billingNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},16,16)");//SO.�ڋq.(16-16)
			 var billingAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.phone}");//SO.�ڋq.�d�b�ԍ�
			
				var before_custpage_delivery_code_acquisition_classification = new nlobjSearchColumn("formulanumeric");
				var before_custpage_delivery_code = new nlobjSearchColumn("formulanumeric");
//				var before_custpage_delivery_phone_number = new nlobjSearchColumn("formulatext");
//				before_custpage_delivery_phone_number.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'+','') is null THEN Replace({billingAddress.phone},'+','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'+','') END");
			//		setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'+',''�jis null THEN Replace({customer.addressphone},'+',''�jELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'+',''�jEND");
//				var before_custpage_delivery_zip_code = new nlobjSearchColumn("formulatext");
//					before_custpage_delivery_zip_code.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  is null THEN  Replace({customer.billzipcode},'-','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  END");
				
					
//					var before_custpage_delivery_address_1 = new nlobjSearchColumn("formulatext");
//					before_custpage_delivery_address_1.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities},'','') END");//20230213 changed by zhou   DJ_�s���{��+ DJ_�s�撬��
//				var before_custpage_delivery_address_2 =  new nlobjSearchColumn("formulatext");
//					before_custpage_delivery_address_2.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence},'','') is null THEN Replace({billingAddress.address1},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence},'','') END");//20230213 changed by zhou  DJ_�[�i��Z��1
//				var before_custpage_delivery_address_3 = new nlobjSearchColumn("formulatext");
//					before_custpage_delivery_address_3.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2},'','') is null THEN Replace({billingAddress.address2}||{billingAddress.address3},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2},'','') END");//20230213 changed by zhou  DJ_�[�i��Z��2 +DJ_�[�i��Z��3
				
					
//					var before_custpage_delivery_name_1 = new nlobjSearchColumn("formulatext");
////					before_custpage_delivery_name_1.setFormula("CASE WHEN  SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 0, 16) is null THEN SUBSTR({billingAddress.addressee}, 0, 16) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 0, 16)) END");
//					before_custpage_delivery_name_1.setFormula("CASE WHEN SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 0, 16) is null THEN SUBSTR({billingAddress.addressee}, 0, 16) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 0, 16) END");
					
//					var before_custpage_delivery_name_2 = new nlobjSearchColumn("formulatext");
//					before_custpage_delivery_name_2.setFormula("CASE WHEN SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 16, 16) is null THEN SUBSTR({billingAddress.addressee}, 16, 16) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name}, 16, 16) END");//20230213 changed by zhou SO.�[�i��̈���i����j�{�A����
				var before_custpage_delivery_name_3 = new nlobjSearchColumn("custcol_djkk_customer_order_number");//20230213 changed by zhou  ���q�l�Ǘ��ԍ�  �ڋq�̔����ԍ�
//						before_custpage_delivery_name_3.setFormula("{custcol_djkk_customer_order_numbers}");//20230213 changed by zhou  ���q�l�Ǘ��ԍ�  �ڋq�̔����ԍ�
				var before_custpage_customer_code = new nlobjSearchColumn("formulanumeric");
					before_custpage_customer_code.setFormula("140303000000"); // 20230213 changed by zhou   �A���q��Ђ̉ב��l��R�[�h
			
				var before_custpage_person_in_charge_code_acquisition_segment = new nlobjSearchColumn("formulanumeric");
				var before_custpage_person_in_charge_code = new nlobjSearchColumn("formulatext");
				before_custpage_person_in_charge_code.setFormula("{department.name}");//20230213 changed by zhou SO.�w�b�_�[�Z�N�V�����R�[�h
				var before_custpage_person_in_charge_name = new nlobjSearchColumn("formulatext");
				before_custpage_person_in_charge_name.setFormula("{department.name}||' '||{salesrep.entityid}");//20230213 changed by zhou SO.�w�b�_�[�Z�N�V�������{�c�Ɩ�
				var before_custpage_shipper_tel = new nlobjSearchColumn("formulatext").setFormula("{salesRep.phone}");//20230213 changed by zhou �ב��l�d�b�ԍ�  =>�c�Ƃ̓d�b�ԍ�
				var before_custpage_requester_code_acquisiton_segment = new nlobjSearchColumn("formulanumeric");
				var before_custpage_requester_code = new nlobjSearchColumn("formulatext");
				var before_custpage_requester_tel =  new nlobjSearchColumn("formulatext");
				before_custpage_requester_tel.setFormula("{salesRep.phone}");//20230213 changed by zhou �c�Ƃ̓d�b�ԍ�
				var before_custpage_requester_fax = new nlobjSearchColumn("formulatext");
				before_custpage_requester_fax.setFormula("{subsidiary.zip}");
				
				
					var before_custpage_requester_address_1 = new nlobjSearchColumn("formulatext");
				before_custpage_requester_address_1.setFormula("{subsidiary.state}||{subsidiary.city}||{subsidiary.address1}");
				var before_custpage_requester_address_2 = new nlobjSearchColumn("formulatext");
				before_custpage_requester_address_2.setFormula("{subsidiary.address2}||{subsidiary.address3}");//20230213 changed by zhou �A���q��Ђ̏Z���iAddress2+3
				var before_custpage_requester_name_1 = new nlobjSearchColumn("formulatext");
				before_custpage_requester_name_1.setFormula("{subsidiary.legalname}")
				var before_custpage_requester_name_2 = new nlobjSearchColumn("formulatext");
				before_custpage_requester_name_2.setFormula("");
				
				
				
//					var before_custpage_packing_figure = new nlobjSearchColumn("custbody_djkk_cargo");//�׎p  20230213 changed by zhou
				var before_custpage_item_name_1 = new nlobjSearchColumn("formulatext");
					before_custpage_item_name_1.setFormula("SUBSTR({item.custitem_djkk_product_group}, 0, 25)");//�i�� 20230213 changed by zhou SO.�s�̏��i�O���[�v  
				var before_custpage_item_name_2 = new nlobjSearchColumn("custcol_djkk_temperature");//�i��2 20230213 changed by zhou SO.�z�����x
				var before_custpage_item_name_3 = new nlobjSearchColumn("formulatext");
					before_custpage_item_name_3.setFormula("");//�i��3  20230213 changed by zhou  ��
				var before_custpage_item_name_4 = new nlobjSearchColumn("tranid");//�i��4  20230213 changed by zhou  �󒍔ԍ��i�Q�Ɨp�j
				var before_custpage_item_name_5 = new nlobjSearchColumn("formulatext");
					before_custpage_item_name_5.setFormula("");//�i��5  20230213 changed by zhou  ��
					
				var before_item_perunitquantity = new nlobjSearchColumn("formulatext").setFormula("{item.custitem_djkk_perunitquantity}");// 20230213 changed by zhou ITEM DJ_���萔(�����) 
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
				var before_custpage_speed_designation = new nlobjSearchColumn("formulatext");//�X�s�[�h�w��
				before_custpage_speed_designation.setFormula("000");
				var before_custpage_cool_flight_designation = new nlobjSearchColumn("formulatext").setFormula("{custcol_djkk_temperature.custrecord_djkk_shipping_temperature_id}");//SO.�z�����x
				var before_custpage_delivery_date = new nlobjSearchColumn("custbody_djkk_delivery_date");
				var before_custpage_delivery_time_zone = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_time_zone.custrecord_djkk_csv_name}");//DJ_�z�B�w�莞�ԑ�(����^�A������Зp)
				var before_custpage_delivery_specified_time = new nlobjSearchColumn("custbody_djkk_delivery_time");
//					var before_custpage_on_delivery_amount = new nlobjSearchColumn("custcolcustbody_djkk_quoted_amount");
				var before_custpage_on_delivery_amount = new nlobjSearchColumn("amount");//������z
				var before_custpage_consumption_tax = new nlobjSearchColumn("taxamount");//�����
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
				var before_custpage_ship_date =  new nlobjSearchColumn("formulatext");//20230213 changed by zhou SO.�o�ד�
					before_custpage_ship_date.setFormula("to_char({shipdate},'yyyymmdd')");//20230213 changed by zhou SO.�o�ד�
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
					
					var deliveryAfter =  defaultEmpty(salesorderSearch[i].getValue(delivery));//SO.�[�i��
					var customerAfter =  defaultEmpty(salesorderSearch[i].getValue(customer));//SO.�ڋq
					var deliveryAddressZipAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressZip));//SO.�[�i��.�X�֔ԍ�
					var deliveryAddressStateAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressState));//SO.�[�i��.�s���{��
					var deliveryAddressCityAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressCity));//SO.�[�i��.�s�撬��
					var deliveryAddress1After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress1));//SO.�[�i��.�Z��1
					var deliveryAddress2After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress2));//SO.�[�i��.�Z��2
					var deliveryAddress3After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress3));//SO.�[�i��.�Z��3
					var deliveryNameAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryName));//SO.�[�i��..�[�i�於�O
					var deliveryNameStr1After = defaultEmpty(salesorderSearch[i].getValue(deliveryNameStr1));//SO.�[�i��.�[�i�於�O(0-16)
					var deliveryNameStr2After = defaultEmpty(salesorderSearch[i].getValue(deliveryNameStr2));//SO.�[�i��.�[�i�於�O(16-16)
					var deliveryAddressPhoneAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressPhone));//SO.�[�i��.�d�b�ԍ�
					var billingAddressZipAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressZip));//SO.�ڋq.�X�֔ԍ�
					var billingAddressStateAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressState));//SO.�ڋq.�s���{��
					var billingAddressCityAfter= defaultEmpty(salesorderSearch[i].getValue(billingAddressCity));//SO.�ڋq.�s�撬��
					var billingAddress1After = defaultEmpty(salesorderSearch[i].getValue(billingAddress1));//SO.�ڋq.�Z��1
					var billingAddress2After = defaultEmpty(salesorderSearch[i].getValue(billingAddress2));//SO.�ڋq.�Z��2
					var billingAddress3After = defaultEmpty(salesorderSearch[i].getValue(billingAddress3));//SO.�ڋq.�Z��3
					var billingNameAfter = defaultEmpty(salesorderSearch[i].getValue(billingName));//SO.�ڋq.���O
					var billingNameStr1After = defaultEmpty(salesorderSearch[i].getValue(billingNameStr1));//SO.�ڋq.���O(0-16)
					var billingNameStr2After = defaultEmpty(salesorderSearch[i].getValue(billingNameStr2));//SO.�ڋq.���O(16-16)
					var billingAddressPhoneAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressPhone));//SO.�ڋq.�d�b�ԍ�
					var deliveryPrepareAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryPrepare));//SO.�[�i��.�����ɋL�ڔ��l��
					var customerPrepareAfter = defaultEmpty(salesorderSearch[i].getValue(customerPrepare));//SO.�ڋq.�����ɋL�ڔ��l��
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
					var custpage_customer_code = '';//���q�l�R�[�h 
					if(clubValue==SUB_DPKK){
						custpage_customer_code = '118017220113';//���q�l�R�[�h 
					}else if(clubValue==SUB_SCETI){
						custpage_customer_code = '118017000000';//���q�l�R�[�h 
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
					var custpage_djkk_casequantity = Number(salesorderSearch[i].getValue(before_custpage_djkk_casequantity));// 20230213 changed by zhou SO  DJ_�P�[�X��
					var custpage_shipments_number = Number(salesorderSearch[i].getValue(before_custpage_shipments_number));// 20230213 changed by zhou SO����
					var item_perunitquantity = Number(salesorderSearch[i].getValue(before_item_perunitquantity));// 20230213 changed by zhou ITEM DJ_���萔(�����) 
					var custpage_speed_designation = salesorderSearch[i].getValue(before_custpage_speed_designation);//�X�s�[�h�w��
					var custpage_cool_flight_designation = salesorderSearch[i].getValue(before_custpage_cool_flight_designation);
					var custpage_delivery_date = salesorderSearch[i].getValue(before_custpage_delivery_date);
					var custpage_delivery_time_zone = salesorderSearch[i].getValue(before_custpage_delivery_time_zone);
					var custpage_delivery_specified_time = salesorderSearch[i].getValue(before_custpage_delivery_specified_time);
					var custpage_on_delivery_amount = salesorderSearch[i].getValue(before_custpage_on_delivery_amount);
					var custpage_consumption_tax = salesorderSearch[i].getValue(before_custpage_consumption_tax);
					var custpage_settlement_type = '0';//�u0�v(�F�w��Ȃ�)�����
					var custpage_insurance_amount = salesorderSearch[i].getValue(primary_insurance_premium);//so���׍s.�ی���
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
					
					
					//�l�̎擾
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
						
						primary_zip_code_after:primary_zip_code_after,//��v�X�֔ԍ�
						primary_tranid_after:primary_tranid_after,//��v�󒍔ԍ�
						primary_temperature_unit_after:primary_temperature_unit_after,//��v���x�P��
						primary_shipping_date_after:primary_shipping_date_after,//��v�o�ד�
						primary_delivery_name_after:primary_delivery_name_after,//��vDJ_�^�����
						primary_freight_company_after:primary_freight_company_after,//��v�͂��於
						primary_address_after:primary_address_after,//��v���͂���̏Z��
						primary_delivery_date_after:primary_delivery_date_after,//��v�[�i��
						primary_sending_table_after:primary_sending_table_after,//��v�������l��
						primary_insurance_after:primary_insurance_after,//��v�ی��t
						primary_shipping_information_after:primary_shipping_information_after,//��v�o�׎w�����(������)
						
						custpage_speed_designation_after:custpage_speed_designation,//�X�s�[�h�w��
						custpage_delivery_specified_time_after:custpage_delivery_specified_time,//�z�B�w�莞�ԁi�����j
//							custpage_designatied_seal_1_after:custpage_designatied_seal_1,//�w��V�[���P
						custpage_sales_office_pickup_after:custpage_sales_office_pickup,//�c�Ə����
						custpage_src_segmentation_after:custpage_src_segmentation,//SRC�敪
						custpage_original_arrival_category_after:custpage_original_arrival_category,//�����敪
						data:sagawaData
					})
				}
				nlapiLogExecution('DEBUG', 'dataArr', JSON.stringify(dataArr))	
				var totalArray  = arrayAddDeduplication(dataArr,primary_freight_company_after) //���z���W�v���A�d���f�[�^������������̔z��
				nlapiLogExecution('DEBUG', 'totalArray', JSON.stringify(totalArray))	
				var dataBatchnumber = guid();
				var mainCsvStr = '�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�,�f�[�^,����id\r\n';
				for(var ya= 0 ; ya < totalArray.length;ya++){
					var amount = Number(totalArray[ya].amount)
			        var substitution = Number(totalArray[ya].substitution)
			        var insurancePremium = Number(totalArray[ya].insurancePremium)
			        
			        var data = JSON.stringify(totalArray[ya].data);
					subList.setLineItemValue( 'custpage_mainline_zip_code', ya+1, totalArray[ya].primary_zip_code_after);//��v�X�֔ԍ�
					subList.setLineItemValue( 'custpage_mainline_tranid', ya+1, totalArray[ya].primary_tranid_after);//��v�󒍔ԍ�
					subList.setLineItemValue( 'custpage_mainline_temperature_unit', ya+1, totalArray[ya].primary_temperature_unit_after);//��v���x�P��
					subList.setLineItemValue( 'custpage_mainline_shipping_date', ya+1, totalArray[ya].primary_shipping_date_after);//��v�o�ד�
					subList.setLineItemValue( 'custpage_mainline_freight_company', ya+1, totalArray[ya].primary_freight_company_after);//��vDJ_�^�����
					subList.setLineItemValue( 'custpage_mainline_delivery_name', ya+1, totalArray[ya].primary_delivery_name_after);//��v�͂��於
					subList.setLineItemValue( 'custpage_mainline_address', ya+1, totalArray[ya].primary_address_after);//��v���͂���̏Z��
					subList.setLineItemValue( 'custpage_mainline_delivery_date', ya+1, totalArray[ya].primary_delivery_date_after);//��v�[�i��
					subList.setLineItemValue( 'custpage_mainline_sending_table', ya+1, totalArray[ya].primary_sending_table_after);//��v�������l��
					subList.setLineItemValue( 'custpage_mainline_amount', ya+1, amount);//��v���z
					
					subList.setLineItemValue( 'custpage_mainline_total_amount', ya+1, substitution);//��v������z
//							subList.setLineItemValue( 'custpage_mainline_insurance', ya+1, totalArray[ya].primary_insurance_after);//��v�ی��t
					subList.setLineItemValue( 'custpage_mainline_insurance_premium', ya+1, insurancePremium);//��v�ی���
					subList.setLineItemValue( 'custpage_mainline_shipping_information', ya+1, totalArray[ya].primary_shipping_information_after);//��v�o�׎w�����(������)
					subList.setLineItemValue( 'custpage_mainline_dataserialnumber', ya+1, totalArray[ya].dataSerialnumber);//�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�
					subList.setLineItemValue( 'custpage_packing_figure', ya+1, '');//�׎p
					subList.setLineItemValue( 'custpage_speed_designation', ya+1, '000');//�X�s�[�h�w��
					subList.setLineItemValue( 'custpage_delivery_specified_time', ya+1, totalArray[ya].custpage_delivery_specified_time_after);//�z�B�w�莞�ԁi�����j
//						subList.setLineItemValue( 'custpage_designatied_seal_1', ya+1, totalArray[ya].custpage_designatied_seal_1);//�w��V�[���P
					subList.setLineItemValue( 'custpage_sales_office_pickup', ya+1, '');//�c�Ə����
					subList.setLineItemValue( 'custpage_src_segmentation', ya+1, '');//SRC�敪
					subList.setLineItemValue( 'custpage_original_arrival_category', ya+1, '');//�����敪
					var newTotalArrayToJson = JSON.stringify(totalArray[ya].data).replace(/\,/g,'FFFFF')
					mainCsvStr += totalArray[ya].dataSerialnumber +','+newTotalArrayToJson+'\r\n';
					
				}
				var fieldId = csvMaker(mainCsvStr);
				fieldidText.setDefaultValue(fieldId);
			}   			
		 }else {
				
				//20230216 add by zhou start
				 var lineNum = new nlobjSearchColumn("line"); //�󒍔ԍ�
				 var soid  = new nlobjSearchColumn("internalid"); //�󒍔ԍ�
//				var primary_zip_code = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  is null THEN  Replace({billingAddress.zip},'-','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  END"); //�X�֔ԍ�
				var primary_tranid = new nlobjSearchColumn("tranid"); //�󒍔ԍ�
				var primary_temperature_unit = new nlobjSearchColumn("custcol_djkk_temperature"); //DJ_�z�����x
				var primary_shipping_date = new nlobjSearchColumn("shipdate"); //�o�ד�
				var primary_freight_company = expressType; //DJ_�^�����
//				var primary_delivery_name  = new nlobjSearchColumn("formulatext");//���͂��於
//				primary_delivery_name.setFormula("CASE WHEN {custbody_djkk_delivery_destination.custrecorddjkk_name} is null THEN {billingAddress.addressee} ELSE {custbody_djkk_delivery_destination.custrecorddjkk_name} END");
//				var primary_address  = new nlobjSearchColumn("formulatext");//20230213 changed by zhou   DJ_�s���{�� +DJ_�s�撬��+DJ_�[�i��Z��1+DJ_�[�i��Z��2; //���͂���̏Z��
//				primary_address.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city}||{billingAddress.address1}||{billingAddress.address2},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') END");
				var primary_delivery_date = new nlobjSearchColumn("custbody_djkk_delivery_date"); //�[�i��
				var primary_sending_table = new nlobjSearchColumn("formulatext").setFormula("CASE WHEN {custbody_djkk_de_sodeliverermem} is null THEN {custbody_djkk_sodeliverermem} ELSE {custbody_djkk_de_sodeliverermem} END"); //�������l��


				var primary_amount = new nlobjSearchColumn("amount"); //���z
				var payment = new nlobjSearchColumn("custbody_djkk_payment_conditions");//�x������
				var primary_total_amount = new nlobjSearchColumn("amount"); //������v���z
				var primary_insurance = new nlobjSearchColumn("formulatext").setFormula(""); //�ی��t
				var primary_insurance_premium = new nlobjSearchColumn("custcolcustbody_djkk_guarantee_fund"); //�ی���
				var primary_shipping_information = new nlobjSearchColumn("memo"); //�o�׎w�����(������)
				//end
				
				var cool_temp = new nlobjSearchColumn("custcol_djkk_temperature"); //SO.DJ�z�����x
				
				
				
				
				var customer_control_number = new nlobjSearchColumn("formulatext").setFormula("");//���q�l�Ǘ��ԍ�
				
				
				
				var sending_type  = new nlobjSearchColumn("formulatext"); //�������
				sending_type.setFormula("0");
//				var cool_division = new nlobjSearchColumn("custrecord_djkk_csv_code","CUSTBODY_DJKK_GROUP",null); //�N�[���敪
				var cool_division = new nlobjSearchColumn("formulatext").setFormula("{custcol_djkk_temperature.custrecord_djkk_shipping_temperature_id}");//�N�[���敪 SO.�z�����x
				var ticket_number = new nlobjSearchColumn("formulatext").setFormula(""); //�`�[�ԍ�
				var delivery_date_text = new nlobjSearchColumn("shipdate"); //�o�ח\���
				var expected_date_of_delivery =  new nlobjSearchColumn("custbody_djkk_delivery_date"); //���͂��\���
				var arrival_time_band =  new nlobjSearchColumn("custrecord9","CUSTBODY_DJKK_DELIVERY_TIME_ZONE_DESCR",null); //�z�B���ԑ�//custrecord_djkk_csv_code
				var delivery_code_text = new nlobjSearchColumn("formulatext").setFormula("");// ���͂���R�[�h
//				var destination_phone_number = new nlobjSearchColumn("formulatext"); //���͂���d�b�ԍ�
//				destination_phone_number.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'','') is null THEN Replace({billingAddress.phone},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text},'','') END");//20230213 changed by zhou
				var telephone_number_branch_number= new nlobjSearchColumn("formulatext").setFormula(""); //	���͂���d�b�ԍ��}��
//				var delivery_zip_code_text = new nlobjSearchColumn("formulatext"); //���͂���X�֔ԍ�
//				delivery_zip_code_text.setFormula("CASE WHEN  Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  is null THEN  Replace({billingAddress.zip},'-','')  ELSE  Replace({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')  END");//add changed
//				var delivery_address_text = new nlobjSearchColumn("formulatext");//���͂���Z��
//				delivery_address_text.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') is null THEN Replace({billingAddress.custrecord_djkk_address_state}||{billingAddress.city}||{billingAddress.address1}||{billingAddress.address2},'','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_prefectures}||{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}||{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable},'','') END");//20230213 changed by zhou   DJ_�s���{�� +DJ_�s�撬��+DJ_�[�i��Z��1
//				var apartment_house_apartment = new nlobjSearchColumn("formulatext");//���͂���A�p�[�g�}���V������
//				apartment_house_apartment.setFormula("CASE WHEN  Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2},'+','') is null THEN Replace({billingAddress.address3},'+','') ELSE Replace({custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2},'+','') END");//changed by zhou 20230213 �[�i��.DJ_�[�i��Z��3
				var delivery_company_one = new nlobjSearchColumn("custbody_djkk_delivery_company_1"); //���͂����ЁE����P
				var delivery_company_two = new nlobjSearchColumn("custbody_djkk_delivery_company_2");//���͂����ЁE����Q
//				var destination_name = new nlobjSearchColumn("formulatext");//���͂��於
//				destination_name.setFormula("CASE WHEN SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,32)is null THEN SUBSTR({custbody_suitel10n_jp_ids_customer.altname},41,32) ELSE SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,32) END");
				var destination_name_text = new nlobjSearchColumn("formulatext").setFormula(""); //���͂��於(��)
				var honorific_appellation = new nlobjSearchColumn("formulatext").setFormula("");//�h��
//				var client_code = 	new nlobjSearchColumn("phone","subsidiary",null);//���˗���R�[�h
				var main_phone_number = new nlobjSearchColumn("formulatext");//���˗���d�b�ԍ�//20230213 changed by zhou
				main_phone_number.setFormula("Replace({salesRep.phone},'+','')");//20230213 changed by zhou
				var branch_number = new nlobjSearchColumn("formulatext");//���˗���d�b�ԍ��}��
				branch_number.setFormula("");
//				branch_number.setFormula("Replace({subsidiary.zip},'-','')");
				var main_zip_code = new nlobjSearchColumn("formulatext");//���˗���X�֔ԍ�//20230213 changed by zhou
				main_zip_code.setFormula("Replace({subsidiary.zip},'-','')");//20230213 changed by zhou
				var main_address = new nlobjSearchColumn("formulatext"); //���˗���Z��
				main_address.setFormula("{subsidiary.state}||{subsidiary.city}||{subsidiary.address1}||{subsidiary.address2}");
				var main_apartment = new nlobjSearchColumn("formulatext");//���˗���A�p�[�g�}���V���� 20230213 changed by zhou
				main_apartment.setFormula("{subsidiary.address3}");
				var main_name=new nlobjSearchColumn("formulatext");//���˗��喼
				main_name.setFormula("{subsidiary.legalname}");
//				var main_name = new nlobjSearchColumn("name","subsidiary",null);//���˗��喼 20230213 changed by zhou
				var main_name_text = new nlobjSearchColumn("formulatext").setFormula(""); //���˗��喼(��)
				var code_name_one = new nlobjSearchColumn("formulatext").setFormula("");//�i���R�[�h�P
				var product_name_one = new nlobjSearchColumn("formulatext");//�i���P
				product_name_one.setFormula("SUBSTR({item.custitem_djkk_product_group}, 0, 25)");//20230213 changed by zhou ITEMDJ_���i�O���[�v
				
				var code_name_two = new nlobjSearchColumn("formulatext"); //�i���R�[�h�Q
				code_name_two.setFormula("{item.itemid}");//20230213 changed by zhou
				
				var product_name_two = new nlobjSearchColumn("formulatext"); //�i���Q
				product_name_two.setFormula("{item.custitem_djkk_product_name_jpline1}||{item.custitem_djkk_product_name_jpline2}");
				//20230213 changed by zhou 
//				var handling_one = new nlobjSearchColumn("formulatext");//20230213 changed by zhou  �׈����P
//				handling_one.setFormula("");//20230213 changed by zhou ����������
//				var handling_two = new nlobjSearchColumn("formulatext");//20230213 changed by zhou  �׈����Q
//				handling_two.setFormula("");//20230213 changed by zhou �V�n���p
				
				
				
				var article = new nlobjSearchColumn("tranid");//�L��formulatext
				var the_amount_of_money_exchanged = new nlobjSearchColumn("amount"); //�ڸđ�������z�i�ō�)  //20230213 changed by zhou ������̏ꍇ�ASO���v���z
				var domestic_consumption_tax = new nlobjSearchColumn("formulatext").setFormula("");//'������Ŋz��
				var stop = new nlobjSearchColumn("formulatext").setFormula("");//�~�u��
				var business_office_code = new nlobjSearchColumn("formulatext").setFormula("");//�c�Ə��R�[�h
				var number_of_rows = new nlobjSearchColumn("formulatext").setFormula("");//���s����
				var number_display_flag = new nlobjSearchColumn("formulatext").setFormula("");//�����\���t���O
				var invoice_client_code = new nlobjSearchColumn("formulatext").setFormula("");//������ڋq�R�[�h  20230213 changed by zhou DJ_�C���܂��m�F�҂��A�C���˃o���f�[�V�����K�v
				var claim_classification_code = new nlobjSearchColumn("custentity_djkk_claim_classification","customer",null);//�����敪�ރR�[�h
				var transportation_management_number = new nlobjSearchColumn("custbody_djkk_fare_control_number");//�^���Ǘ��ԍ�
				var crows_web_collect_data_registration = new nlobjSearchColumn("formulatext").setFormula("");//�N���l�Rweb�R���N�g�f�[�^�o�^
				var crows_web_collection = new nlobjSearchColumn("formulatext").setFormula("");//�N���l�Rweb�R���N�g�����X�ԍ�
				var crows_web_collect_application_number_one = new nlobjSearchColumn("formulatext").setFormula("");//�N���l�Rweb�R���N�g�\����t�ԍ��P
				var crows_web_collect_application_number_two = new nlobjSearchColumn("formulatext").setFormula("");//�N���l�Rweb�R���N�g�\����t�ԍ�2
				var crows_web_collect_application_number_three = new nlobjSearchColumn("formulatext").setFormula("");//�N���l�Rweb�R���N�g�\����t�ԍ�3
				var delivery_schedule = new nlobjSearchColumn("formulatext").setFormula("");//���͂��\�肅���[�����p�敪
				var email_address_text = new nlobjSearchColumn("formulatext").setFormula("");//���͂��\�肅���[��e-mail�A�h���X
				var incoming_model =  new nlobjSearchColumn("formulatext").setFormula("");//���͋@��
				var email_address_textdate = new nlobjSearchColumn("formulatext").setFormula("");//���͂��\�肅���[�����b�Z�[�W
				var email_address_textedit = new nlobjSearchColumn("formulatext").setFormula("");//���͂����������[�����p�敪
				var email_address_textedit_one = new nlobjSearchColumn("formulatext").setFormula("");//���͂����������[��e-mail�A�h���X
				var email_address_textdate_one = new nlobjSearchColumn("formulatext").setFormula("");//���͂����������[�����b�Z�[�W
				var crochet_storage =  new nlobjSearchColumn("formulatext").setFormula("");//'�N���l�R���[��s���p�敪
				
				var amount_requested_by_paying_bank = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�������z(�ō�)
				var issuing_and_paying = new nlobjSearchColumn("formulatext").setFormula("");//���[��s������Ŋz��
				var the_issuing_bank_requests = new nlobjSearchColumn("formulatext").setFormula("");//���[��s������X�֔ԍ�
				var the_first_residence = new nlobjSearchColumn("formulatext").setFormula("");//���[��s������Z��;
				var destination_address = new nlobjSearchColumn("formulatext").setFormula("");//���[��s������Z���i�A�p�[�g�}���V�������j
				var issuing_agent_bank_one = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�������ЁE���喼�P
				var issuing_agent_bank_two = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�������ЁE���喼2
				var first_name_requested = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�����於(����)
				var request_for_storage_agency = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�����於(�J�i)
				var first_name_of_daixing = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�⍇���於(����)'
				var the_issuing_bank_asks = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�⍇����X�֔ԍ�
				var first_address_of_the_issuing_bank = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�⍇����Z��
				var the_address_of_the_apartment_address = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�⍇����Z���i�A�p�[�g�}���V�������j'
				var first_telephone_number_of_the_issuing = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�⍇����d�b�ԍ�
				var issuing_agent_bank_management_number = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�Ǘ��ԍ�
				var name_of_the_agent = new nlobjSearchColumn("formulatext").setFormula("");//���[��s�i��
				var prepared_by_the_issuing_bank = new nlobjSearchColumn("formulatext").setFormula("");//���[��s���l
				var multiple_mouth_key = new nlobjSearchColumn("formulatext").setFormula("");//������������L�[
				var search_key_title_one = new nlobjSearchColumn("formulatext").setFormula("");//�����L�[�^�C�g��1
				var search_key_one = new nlobjSearchColumn("formulatext").setFormula("");//�����L�[1
				var search_key_title_two = new nlobjSearchColumn("formulatext").setFormula("");//�����L�[�^�C�g��2'
				var search_key_two = new nlobjSearchColumn("formulatext").setFormula("");//�����L�[2
				var search_key_title_three = new nlobjSearchColumn("formulatext").setFormula("");//�����L�[�^�C�g��3
				var search_key_three = new nlobjSearchColumn("formulatext").setFormula("");//�����L�[3
				var search_key_title_four = new nlobjSearchColumn("formulatext").setFormula("");//�����L�[�^�C�g��4
				var search_key_four = new nlobjSearchColumn("formulatext").setFormula("");//�����L�[4
				var search_key_title_five = new nlobjSearchColumn("formulatext").setFormula("");//�����L�[�^�C�g��5
				var search_key_five = new nlobjSearchColumn("formulatext").setFormula("");//�����L�[5
				var prepare_two = new nlobjSearchColumn("formulatext").setFormula("");//�\��  tdo �d��
				var prepare_three = new nlobjSearchColumn("formulatext").setFormula("");//�\��  tdo �d��
				var classification_of_mail = new nlobjSearchColumn("formulatext").setFormula("");//�����\�胁�[�����p�敪
				var email_address_edit_two = new nlobjSearchColumn("formulatext").setFormula("");//�����\�胁�[��e-mail�A�h���X
				var email_address_edit_three = new nlobjSearchColumn("formulatext").setFormula("");//�����\�胁�[�����b�Z�[�W
				var mail_completion = new nlobjSearchColumn("formulatext").setFormula("");//�����������[���i���͂��戶�j���p�敪
				var email_address_edit_four = new nlobjSearchColumn("formulatext").setFormula("");//�����������[���i���͂��戶�je-mail�A�h���X
				var email_address_edit_five = new nlobjSearchColumn("formulatext").setFormula("");//�����������[���i���͂��戶�j���[�����b�Z�[�W
				var use_completed_mail = new nlobjSearchColumn("formulatext").setFormula("");//�����������[���i���˗��制�j���p�敪
				var use_completed_mail_edit_one = new nlobjSearchColumn("formulatext").setFormula("");//�����������[���i���˗��制�je-mail�A�h���X
				var use_completed_mail_edit_two = new nlobjSearchColumn("formulatext").setFormula("");//�����������[���i���˗��制�j���[�����b�Z�[�W
				
				var delivery =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//SO.�[�i��
				 var customer =  new nlobjSearchColumn("entity");//SO.�ڋq
				 var deliveryPrepare = new nlobjSearchColumn("custbody_djkk_de_sodeliverermem"); //DJ_�[�i�摗���ɋL�ڔ��l��
				 var customerPrepare = new nlobjSearchColumn("custbody_djkk_sodeliverermem"); //DJ_�ڋq�����ɋL�ڔ��l��
				 var deliveryAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({custbody_djkk_delivery_destination.custrecord_djkk_zip},'-','')");//SO.�[�i��.�X�֔ԍ�
				 var deliveryAddressState = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_prefectures}");//SO.�[�i��.�s���{��
				 var deliveryAddressCity = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_municipalities}");//SO.�[�i��.�s�撬��
				 var deliveryAddress1 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence}");//SO.�[�i��.�Z��1
				 var deliveryAddress2 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_lable}");//SO.�[�i��.�Z��2
				 var deliveryAddress3 = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_residence2}");//SO.�[�i��.�Z��3
				 var deliveryName = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecorddjkk_name}");//SO.�[�i��.�[�i�於�O
				 var deliveryNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},0,40)");//SO.�[�i��.�[�i�於�O(0-40)
				 var deliveryNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({custbody_djkk_delivery_destination.custrecorddjkk_name},41,40)");//SO.�[�i��.�[�i�於�O(41-80)
				 var deliveryAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{custbody_djkk_delivery_destination.custrecord_djkk_delivery_phone_text}");//SO.�[�i��.�d�b�ԍ�
				 var billingAddressZip = new nlobjSearchColumn("formulatext").setFormula("Replace ({billingAddress.zip},'-','')");//SO.�ڋq.�X�֔ԍ�
				 var billingAddressState = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.custrecord_djkk_address_state}");//SO.�ڋq.�s���{��
				 var billingAddressCity= new nlobjSearchColumn("formulatext").setFormula("{billingAddress.city}");//SO.�ڋq.�s�撬��
				 var billingAddress1 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address1}");//SO.�ڋq.�Z��1
				 var billingAddress2 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address2}");//SO.�ڋq.�Z��2
				 var billingAddress3 = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.address3}");//SO.�ڋq.�Z��3
				 var billingName = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.addressee}");//SO.�ڋq.(0-40)
				 var billingNameStr1 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},0,40)");//SO.�ڋq.(0-40)
				 var billingNameStr2 = new nlobjSearchColumn("formulatext").setFormula("SUBSTR({billingAddress.addressee},41,40)");//SO.�ڋq.(41-80)
				 var billingAddressPhone = new nlobjSearchColumn("formulatext").setFormula("{billingAddress.phone}");//SO.�ڋq.�d�b�ԍ�
				
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
//				var date = request.getParameter('date');//���t
//				var express = request.getParameter('express');//�z�����@
//				var number = request.getParameter('number');//��t�ԍ�
//				var dateree = request.getParameter('dateree');//�o�ד�
//				var invoice = request.getParameter('invoice');//�����ԍ�

				
				
				
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
					//�l�̎擾
					
					var deliveryAfter =  defaultEmpty(salesorderSearch[i].getValue(delivery));//SO.�[�i��
					var customerAfter =  defaultEmpty(salesorderSearch[i].getValue(customer));//SO.�ڋq
					var deliveryAddressZipAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressZip));//SO.�[�i��.�X�֔ԍ�
					var deliveryAddressStateAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressState));//SO.�[�i��.�s���{��
					var deliveryAddressCityAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressCity));//SO.�[�i��.�s�撬��
					var deliveryAddress1After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress1));//SO.�[�i��.�Z��1
					var deliveryAddress2After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress2));//SO.�[�i��.�Z��2
					var deliveryAddress3After = defaultEmpty(salesorderSearch[i].getValue(deliveryAddress3));//SO.�[�i��.�Z��3
					var deliveryNameAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryName));//SO.�[�i��..�[�i�於�O
					var deliveryNameStr1After = defaultEmpty(salesorderSearch[i].getValue(deliveryNameStr1));//SO.�[�i��.�[�i�於�O(0-40)
					var deliveryNameStr2After = defaultEmpty(salesorderSearch[i].getValue(deliveryNameStr2));//SO.�[�i��.�[�i�於�O(41-80)
					var deliveryAddressPhoneAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryAddressPhone));//SO.�[�i��.�d�b�ԍ�
					var billingAddressZipAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressZip));//SO.�ڋq.�X�֔ԍ�
					var billingAddressStateAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressState));//SO.�ڋq.�s���{��
					var billingAddressCityAfter= defaultEmpty(salesorderSearch[i].getValue(billingAddressCity));//SO.�ڋq.�s�撬��
					var billingAddress1After = defaultEmpty(salesorderSearch[i].getValue(billingAddress1));//SO.�ڋq.�Z��1
					var billingAddress2After = defaultEmpty(salesorderSearch[i].getValue(billingAddress2));//SO.�ڋq.�Z��2
					var billingAddress3After = defaultEmpty(salesorderSearch[i].getValue(billingAddress3));//SO.�ڋq.�Z��3
					var billingNameAfter = defaultEmpty(salesorderSearch[i].getValue(billingName));//SO.�ڋq.���O
					var billingNameStr1After = defaultEmpty(salesorderSearch[i].getValue(billingNameStr1));//SO.�ڋq.���O(0-40)
					var billingNameStr2After = defaultEmpty(salesorderSearch[i].getValue(billingNameStr2));//SO.�ڋq.���O(41-80)
					var billingAddressPhoneAfter = defaultEmpty(salesorderSearch[i].getValue(billingAddressPhone));//SO.�ڋq.�d�b�ԍ�
					var deliveryPrepareAfter = defaultEmpty(salesorderSearch[i].getValue(deliveryPrepare));//SO.�[�i��.�����ɋL�ڔ��l��
					var customerPrepareAfter = defaultEmpty(salesorderSearch[i].getValue(customerPrepare));//SO.�ڋq.�����ɋL�ڔ��l��
					if(!isEmpty(deliveryAfter)){
						var  primary_zip_code_after = deliveryAddressZipAfter;
						var  primary_delivery_name_after = deliveryNameAfter;
						var  primary_address_after = deliveryAddressStateAfter+deliveryAddressCityAfter+deliveryAddress1After+deliveryAddress2After+deliveryAddress3After;
						var  destination_phone_number_after = deliveryAddressPhoneAfter;//���͂���d�b�ԍ�
						var  delivery_zip_code_text_after = deliveryAddressZipAfter;//���͂���X�֔ԍ�
						var  delivery_address_text_after = deliveryAddressStateAfter+deliveryAddressCityAfter+deliveryAddress1After+deliveryAddress2After;//���͂���Z��
						var  apartment_house_apartment_after = deliveryAddress3After;//���͂���A�p�[�g�}���V������
						var  destination_name_after = deliveryNameStr2After;//���͂��於
						var  prepare_after  = deliveryPrepareAfter;//�\��
						var  primary_sending_table_after = deliveryPrepareAfter;
					}else{
						var  primary_zip_code_after = billingAddressZipAfter;
						var  primary_delivery_name_after = billingNameAfter;
						var  primary_address_after = billingAddressStateAfter+billingAddressCityAfter+billingAddress1After+billingAddress2After+billingAddress3After;
						var  destination_phone_number_after = billingAddressPhoneAfter;//���͂���d�b�ԍ�
						var  delivery_zip_code_text_after = billingAddressZipAfter;//���͂���X�֔ԍ�
						var  delivery_address_text_after = billingAddressStateAfter+billingAddressCityAfter+billingAddress1After+billingAddress2After;//���͂���Z��
						var  apartment_house_apartment_after = billingAddress3After;//���͂���A�p�[�g�}���V������
						var  destination_name_after = billingNameStr2After;//���͂��於
						var  prepare_after  = customerPrepareAfter;//�\��
						var  primary_sending_table_after = customerPrepareAfter;
					}
					var  telephone_number_branch_number_after = salesorderSearch[i].getValue(telephone_number_branch_number);//���͂���d�b�ԍ��}��
					var  delivery_company_one_after = salesorderSearch[i].getValue(delivery_company_one);//���͂����ЁE����P
					var  delivery_company_two_after = salesorderSearch[i].getValue(delivery_company_two);//���͂����ЁE����Q
					var lineNum_after = salesorderSearch[i].getValue(lineNum);
					var soid_after = salesorderSearch[i].getValue(soid);
					var  customer_control_number_after = salesorderSearch[i].getValue(customer_control_number);//���q�l�Ǘ��ԍ�
					var  sending_type_after = salesorderSearch[i].getValue(sending_type);//�������
					var  cool_division_after = salesorderSearch[i].getValue(cool_division);//�N�[���敪 20230213 changed by zhou
					var  ticket_number_after = salesorderSearch[i].getValue(ticket_number);//�`�[�ԍ�
					var  delivery_date_text_after = salesorderSearch[i].getValue(delivery_date_text);//�o�ח\���
					var  expected_date_of_delivery_after = salesorderSearch[i].getValue(expected_date_of_delivery);//���͂��\���
					var  arrival_time_band_after = salesorderSearch[i].getValue(arrival_time_band);//�z�B���ԑ�
					var  delivery_code_text_after = salesorderSearch[i].getValue(delivery_code_text);//���͂���R�[�h
					
					var  destination_name_text_after = salesorderSearch[i].getValue(destination_name_text);//���͂��於(��)
					var  honorific_appellation_after = salesorderSearch[i].getValue(honorific_appellation);//�h��
//					var  client_code_after = salesorderSearch[i].getValue(client_code);//���˗���R�[�h
					var  client_code_after='';//���˗���R�[�h
					var  main_phone_number_after='';//���˗���d�b�ԍ�
					var  main_address_after1='';//���˗���Z��
					var  main_apartment_after = salesorderSearch[i].getValue(main_apartment);//���˗���A�p�[�g�}���V����
					var  main_name_after=salesorderSearch[i].getValue(main_name);//���˗��喼
//					var  product_name_one_after='';//�i���P
					if(clubValue==SUB_DPKK){//dp
						client_code_after = '0434982031' ;//���˗���R�[�h
						main_phone_number_after = salesorderSearch[i].getValue(main_phone_number);//���˗���d�b�ԍ�
						main_address_after1='��t�����q�s���1-8-5';//���˗���Z��
//						product_name_one_after='����i';//�i���P
					}else if(clubValue==SUB_SCETI){//secti
						client_code_after = '0355102652' ;//���˗���R�[�h
						main_phone_number_after = salesorderSearch[i].getValue(main_phone_number);//���˗���d�b�ԍ�
						main_address_after1='�����s���c�������3-6-7';//���˗���Z��
//						product_name_one_after='��Ë@�퓙';//�i���P
					}
					var  main_zip_code_after = salesorderSearch[i].getValue(main_zip_code);//20230213 changed by zhou
					var  branch_number_after = salesorderSearch[i].getValue(branch_number);//���˗���d�b�ԍ��}��
//					var  main_zip_code_after = salesorderSearch[i].getValue(main_zip_code);//���˗���X�֔ԍ�
					var  main_address_after = salesorderSearch[i].getValue(main_address);//���˗���Z��
//					var  main_name_after = salesorderSearch[i].getValue(main_name);//���˗��喼
					var  main_name_text_after = salesorderSearch[i].getValue(main_name_text);//���˗��喼(��)
					var  code_name_one_after = salesorderSearch[i].getValue(code_name_one);//�i���R�[�h�P
					var  product_name_one_after = salesorderSearch[i].getValue(product_name_one);//�i���P
//					var  code_name_two_after = salesorderSearch[i].getValue(code_name_two);//�i���R�[�h�Q
//					var  product_name_two_after  = salesorderSearch[i].getValue(product_name_two);//�i���Q
					var  code_name_two_after = salesorderSearch[i].getValue(code_name_two);//�i���R�[�h�Q
					var  product_name_two_after  = salesorderSearch[i].getValue(product_name_two);//�i���Q
//					var  handling_one_after = salesorderSearch[i].getValue(handling_one);//�׈����P
//					var  handling_two_after = salesorderSearch[i].getValue(handling_two);//�׈����Q
//					var  handling_one_after = '����������';//�׈����P
//					var  handling_two_after = '�V�n���p';//�׈����Q
					var  article_after  = salesorderSearch[i].getValue(article);//�L��
					var  the_amount_of_money_exchanged_after  = salesorderSearch[i].getValue(the_amount_of_money_exchanged);//�ڸđ�������z�i�ō�)
					var  domestic_consumption_tax_after  = salesorderSearch[i].getValue(domestic_consumption_tax);//������Ŋz��
					var  stop_after = salesorderSearch[i].getValue(stop);//�~�u��
					var  business_office_code_after = salesorderSearch[i].getValue(business_office_code);//�c�Ə��R�[�h
					var  number_of_rows_after = salesorderSearch[i].getValue(number_of_rows);//���s����
					var  number_display_flag_after = salesorderSearch[i].getValue(number_display_flag);//�����\���t���O
					var  invoice_client_code_after  = client_code_after ;//������ڋq�R�[�h 20230213 changed by zhou  �A���q��Ђ̉ב��l�R�[�h
					var  claim_classification_code_after  = salesorderSearch[i].getValue(claim_classification_code);//�����敪�ރR�[�h
					if(String(claim_classification_code_after).length==1){
						claim_classification_code_after = '0'+'0'+claim_classification_code_after;
					}else if(String(claim_classification_code_after).length==2){
						claim_classification_code_after = '0'+claim_classification_code_after;
					}else if(String(claim_classification_code_after).length==3){
						claim_classification_code_after = claim_classification_code_after;
					}
					var  transportation_management_number_after  = salesorderSearch[i].getValue(transportation_management_number);//�^���Ǘ��ԍ�
					transportation_management_number_after ="\t"+ "01"
//					if(String(transportation_management_number_after).length==1){
//						transportation_management_number_after = '0'+transportation_management_number_after;
//					}else if(String(transportation_management_number_after).length==2){
//						transportation_management_number_after =transportation_management_number_after;
//					}
					var  crows_web_collect_data_registration_after = salesorderSearch[i].getValue(crows_web_collect_data_registration);//�N���l�Rweb�R���N�g�f�[�^�o�^
					var  crows_web_collection_after  = salesorderSearch[i].getValue(crows_web_collection);//�N���l�Rweb�R���N�g�����X�ԍ�
					var  crows_web_collect_application_number_one_after  = salesorderSearch[i].getValue(crows_web_collect_application_number_one);//�N���l�Rweb�R���N�g�\����t�ԍ��P
					var  crows_web_collect_application_number_two_after  = salesorderSearch[i].getValue(crows_web_collect_application_number_two);//�N���l�Rweb�R���N�g�\����t�ԍ�2
					var  crows_web_collect_application_number_three_after  = salesorderSearch[i].getValue(crows_web_collect_application_number_three);//�N���l�Rweb�R���N�g�\����t�ԍ�3
					var  delivery_schedule_after  = salesorderSearch[i].getValue(delivery_schedule);//���͂��\�肅���[�����p�敪
					var  email_address_text_after  = salesorderSearch[i].getValue(email_address_text);//���͂��\�肅���[��e-mail�A�h���X
					var  incoming_model_after  = salesorderSearch[i].getValue(incoming_model);//���͋@��
					var  email_address_textdate_after  = salesorderSearch[i].getValue(email_address_textdate);//���͂��\�肅���[�����b�Z�[�W
					var  email_address_textedit_after  = salesorderSearch[i].getValue(email_address_textedit);//���͂����������[�����p�敪
					var  email_address_textedit_one_after  = salesorderSearch[i].getValue(email_address_textedit_one);//���͂����������[��e-mail�A�h���X
					var  email_address_textdate_one_after  = salesorderSearch[i].getValue(email_address_textdate_one);//���͂����������[�����b�Z�[�W
					var  crochet_storage_after  = salesorderSearch[i].getValue(crochet_storage);//�N���l�R���[��s���p�敪
					
					var  amount_requested_by_paying_bank_after  = salesorderSearch[i].getValue(amount_requested_by_paying_bank);//���[��s�������z(�ō�)
					var  issuing_and_paying_after  = salesorderSearch[i].getValue(issuing_and_paying);//���[��s������Ŋz��
					var  the_issuing_bank_requests_after  = salesorderSearch[i].getValue(the_issuing_bank_requests);//���[��s������X�֔ԍ�
					var  the_first_residence_after  = salesorderSearch[i].getValue(the_first_residence);//���[��s������Z��;
					var  destination_address_after  = salesorderSearch[i].getValue(destination_address);//���[��s������Z���i�A�p�[�g�}���V�������j
					var  issuing_agent_bank_one_after  = salesorderSearch[i].getValue(issuing_agent_bank_one);//���[��s�������ЁE���喼�P
					var  issuing_agent_bank_two_after  = salesorderSearch[i].getValue(issuing_agent_bank_two);//���[��s�������ЁE���喼2
					var  first_name_requested_after  = salesorderSearch[i].getValue(first_name_requested);//���[��s�����於(����)
					var  request_for_storage_agency_after  = salesorderSearch[i].getValue(request_for_storage_agency);//���[��s�����於(�J�i)
					var  first_name_of_daixing_after  = salesorderSearch[i].getValue(first_name_of_daixing);//���[��s�⍇���於(����)
					var  the_issuing_bank_asks_after = salesorderSearch[i].getValue(the_issuing_bank_asks);//���[��s�⍇����X�֔ԍ�
					var  first_address_of_the_issuing_bank_after  = salesorderSearch[i].getValue(first_address_of_the_issuing_bank);//���[��s�⍇����Z��
					var  the_address_of_the_apartment_address_after  = salesorderSearch[i].getValue(the_address_of_the_apartment_address);//���[��s�⍇����Z���i�A�p�[�g�}���V�������j
					var  first_telephone_number_of_the_issuing_after  = salesorderSearch[i].getValue(first_telephone_number_of_the_issuing);//���[��s�⍇����d�b�ԍ�
					var  issuing_agent_bank_management_number_after  = salesorderSearch[i].getValue(issuing_agent_bank_management_number);//���[��s�Ǘ��ԍ�
					var  name_of_the_agent_after  = salesorderSearch[i].getValue(name_of_the_agent);//���[��s�i��
					var  prepared_by_the_issuing_bank_after  = salesorderSearch[i].getValue(prepared_by_the_issuing_bank);//���[��s���l
					var  multiple_mouth_key_after  = salesorderSearch[i].getValue(multiple_mouth_key);//������������L�[
					var  search_key_title_one_after  = salesorderSearch[i].getValue(search_key_title_one);//�����L�[�^�C�g��1
					var  search_key_one_after  = salesorderSearch[i].getValue(search_key_one);//�����L�[1
					var  search_key_title_two_after  = salesorderSearch[i].getValue(search_key_title_two);//�����L�[�^�C�g��2
					var  search_key_two_after  = salesorderSearch[i].getValue(search_key_two);//�����L�[2
					var  search_key_title_three_after  = salesorderSearch[i].getValue(search_key_title_three);//�����L�[�^�C�g��3
					var  search_key_three_after   = salesorderSearch[i].getValue(search_key_three);//�����L�[3
					var  search_key_title_four_after   = salesorderSearch[i].getValue(search_key_title_four);//�����L�[�^�C�g��4
					var  search_key_four_after   = salesorderSearch[i].getValue(search_key_four);//�����L�[4
					var  search_key_title_five_after   = salesorderSearch[i].getValue(search_key_title_five);//�����L�[�^�C�g��5
					var  search_key_five_after   = salesorderSearch[i].getValue(search_key_five);//�����L�[5
					var  prepare_two_after   = salesorderSearch[i].getValue(prepare_two);//�\��tdo�d��
					var  prepare_three_after   = salesorderSearch[i].getValue(prepare_three);//�\��tdo�d��
					var  classification_of_mail_after   = salesorderSearch[i].getValue(classification_of_mail);//�����\�胁�[�����p�敪
					var  email_address_edit_two_after   = salesorderSearch[i].getValue(email_address_edit_two);//�����\�胁�[��e-mail�A�h���X
					var  email_address_edit_three_after    = salesorderSearch[i].getValue(email_address_edit_three);//�����\�胁�[�����b�Z�[�W
					var  mail_completion_after    = salesorderSearch[i].getValue(mail_completion);//�����������[���i���͂��戶�j���p�敪
					var  email_address_edit_four_after    = salesorderSearch[i].getValue(email_address_edit_four);//�����������[���i���͂��戶�je-mail�A�h���X
					var  email_address_edit_five_after    = salesorderSearch[i].getValue(email_address_edit_five);//�����������[���i���͂��戶�j���[�����b�Z�[�W
					var  use_completed_mail_after    = salesorderSearch[i].getValue(use_completed_mail);//�����������[���i���˗��制�j���p�敪
					var  use_completed_mail_edit_one_after    = salesorderSearch[i].getValue(use_completed_mail_edit_one);//�����������[���i���˗��制�je-mail�A�h���X
					var  use_completed_mail_edit_two_after     = salesorderSearch[i].getValue(use_completed_mail_edit_two);//�����������[���i���˗��制�j���[�����b
													
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
							
							primary_zip_code_after:primary_zip_code_after,//��v�X�֔ԍ�
							primary_tranid_after:primary_tranid_after,//��v�󒍔ԍ�
							primary_temperature_unit_after:primary_temperature_unit_after,//��v���x�P��
							primary_shipping_date_after:primary_shipping_date_after,//��v�o�ד�
							primary_delivery_name_after:primary_delivery_name_after,//��vDJ_�^�����
							primary_freight_company_after:primary_freight_company_after,//��v�͂��於
							primary_address_after:primary_address_after,//��v���͂���̏Z��
							primary_delivery_date_after:primary_delivery_date_after,//��v�[�i��
							primary_sending_table_after:primary_sending_table_after,//��v�������l��
							primary_insurance_after:primary_insurance_after,//��v�ی��t
//							primary_shipping_information_after:primary_shipping_information_after,//��v�o�׎w�����(������)
							
							sending_type_after:sending_type_after,//�������
							data:yamatoData
						})
				}
				nlapiLogExecution('DEBUG', 'dataArr', JSON.stringify(dataArr))	
				var totalArray  = arrayAddDeduplication(dataArr,primary_freight_company_after) //���z���W�v���A�d���f�[�^������������̔z��
				nlapiLogExecution('DEBUG', 'totalArray', JSON.stringify(totalArray))	
				
				var dataBatchnumber = guid();
				var mainCsvStr = '�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�,�f�[�^,����id\r\n';
				nlapiLogExecution('DEBUG', 'dataBatchnumber', JSON.stringify(dataBatchnumber))
				for(var ya= 0 ; ya < totalArray.length;ya++){
					var amount = Number(totalArray[ya].amount)
			        var substitution = Number(totalArray[ya].substitution)
			        var insurancePremium = Number(totalArray[ya].insurancePremium)
			        
			        var data = JSON.stringify(totalArray[ya].data);
					subList.setLineItemValue( 'custpage_mainline_zip_code', ya+1, totalArray[ya].primary_zip_code_after);//��v�X�֔ԍ�
					subList.setLineItemValue( 'custpage_mainline_tranid', ya+1, totalArray[ya].primary_tranid_after);//��v�󒍔ԍ�
					subList.setLineItemValue( 'custpage_mainline_temperature_unit', ya+1, totalArray[ya].primary_temperature_unit_after);//��v���x�P��
					subList.setLineItemValue( 'custpage_mainline_shipping_date', ya+1, totalArray[ya].primary_shipping_date_after);//��v�o�ד�
					subList.setLineItemValue( 'custpage_mainline_freight_company', ya+1, totalArray[ya].primary_freight_company_after);//��vDJ_�^�����
					subList.setLineItemValue( 'custpage_mainline_delivery_name', ya+1, totalArray[ya].primary_delivery_name_after);//��v�͂��於
					subList.setLineItemValue( 'custpage_mainline_address', ya+1, totalArray[ya].primary_address_after);//��v���͂���̏Z��
					subList.setLineItemValue( 'custpage_mainline_delivery_date', ya+1, totalArray[ya].primary_delivery_date_after);//��v�[�i��
					subList.setLineItemValue( 'custpage_mainline_sending_table', ya+1, totalArray[ya].primary_sending_table_after);//��v�������l��
					subList.setLineItemValue( 'custpage_mainline_amount', ya+1, amount);//��v���z
					
					subList.setLineItemValue( 'custpage_mainline_total_amount', ya+1, substitution);//��v������z
					subList.setLineItemValue( 'custpage_mainline_insurance_premium', ya+1, insurancePremium);//��v�ی���
					//end
					subList.setLineItemValue( 'custpage_sending_type', ya+1, totalArray[ya].sending_type_after);//������� changed by zhou 20230213
					subList.setLineItemValue( 'custpage_handling_one', ya+1, '');
					subList.setLineItemValue( 'custpage_handling_two', ya+1, '');
					subList.setLineItemValue( 'custpage_mainline_dataserialnumber', ya+1, totalArray[ya].dataSerialnumber);//�����쐬�@�\�f�[�^�e�[�u���Ǘ��ԍ�
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
function formatDate(dt){    //���ݓ���
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
}
function formatDateTime(dt){    //���ݓ���
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2) + ' ' + PrefixZero(dt.getHours(), 2) + ":" + PrefixZero(dt.getMinutes(), 2)) : '';
}
//function csvDown(xmlString){	
//	try{	
//		
//		var xlsFile = nlapiCreateFile('�z���p' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
//			
//		xlsFile.setFolder(FILE_CABINET_ID_TOTAL_INV_OUTPUT_FILE);	
//		xlsFile.setName('�z���p' + '_' + getFormatYmdHms() + '.csv');	
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
	if(expressType == '���}�g�^�A�������'){
		for (var i = 0; i < arr.length; i++) {
			var newDataArr = [];//�O���[�v�����ꂽ�f�[�^�ɑΉ�����O���[�v���O���׍s�f�[�^
			  if (nameArr.indexOf(arr[i].key) === -1) {
				  newDataArr.push(arr[i].data);
			      newArr.push({
			    	key: arr[i].key,
			    	amount: arr[i].amount,
			    	substitution: arr[i].substitution,
			    	insurancePremium: arr[i].insurancePremium,
			    	primary_zip_code_after:arr[i].primary_zip_code_after,//��v�X�֔ԍ�
			    	primary_tranid_after:arr[i].primary_tranid_after,//��v�󒍔ԍ�
			    	primary_temperature_unit_after:arr[i].primary_temperature_unit_after,//��v���x�P��
			    	primary_shipping_date_after:arr[i].primary_shipping_date_after,//��v�o�ד�
			    	primary_delivery_name_after:arr[i].primary_delivery_name_after,//��vDJ_�^�����
			    	primary_freight_company_after:arr[i].primary_freight_company_after,//��v�͂��於
			    	primary_address_after:arr[i].primary_address_after,//��v���͂���̏Z��
			    	primary_delivery_date_after:arr[i].primary_delivery_date_after,//��v�[�i��
			    	primary_sending_table_after:arr[i].primary_sending_table_after,//��v�������l��
			    	primary_insurance_after:arr[i].primary_insurance_after,//��v�ی��t
//			    	primary_shipping_information_after:arr[i].primary_shipping_information_after,//��v�o�׎w�����(������)
			    	sending_type_after:arr[i].sending_type_after,//�������
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
	}else if(expressType == '���{�ʉ^�������'){
		for (var i = 0; i < arr.length; i++) {
			var newDataArr = [];//�O���[�v�����ꂽ�f�[�^�ɑΉ�����O���[�v���O���׍s�f�[�^
			  if (nameArr.indexOf(arr[i].key) === -1) {
				  newDataArr.push(arr[i].data);
			      newArr.push({
			    	key: arr[i].key,
			    	amount: arr[i].amount,
			    	substitution: arr[i].substitution,
			    	insurancePremium: arr[i].insurancePremium,
			    	primary_zip_code_after:arr[i].primary_zip_code_after,//��v�X�֔ԍ�
			    	primary_tranid_after:arr[i].primary_tranid_after,//��v�󒍔ԍ�
			    	primary_temperature_unit_after:arr[i].primary_temperature_unit_after,//��v���x�P��
			    	primary_shipping_date_after:arr[i].primary_shipping_date_after,//��v�o�ד�
			    	primary_delivery_name_after:arr[i].primary_delivery_name_after,//��vDJ_�^�����
			    	primary_freight_company_after:arr[i].primary_freight_company_after,//��v�͂��於
			    	primary_address_after:arr[i].primary_address_after,//��v���͂���̏Z��
			    	primary_delivery_date_after:arr[i].primary_delivery_date_after,//��v�[�i��
			    	primary_sending_table_after:arr[i].primary_sending_table_after,//��v�������l��
			    	primary_insurance_after:arr[i].primary_insurance_after,//��v�ی��t
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
	
	}else if(expressType == '����^�A�������'){
		for (var i = 0; i < arr.length; i++) {
			var newDataArr = [];//�O���[�v�����ꂽ�f�[�^�ɑΉ�����O���[�v���O���׍s�f�[�^
			  if (nameArr.indexOf(arr[i].key) === -1) {
				  newDataArr.push(arr[i].data);
			      newArr.push({
			    	key: arr[i].key,
			    	amount: arr[i].amount,
			    	substitution: arr[i].substitution,
			    	insurancePremium: arr[i].insurancePremium,
			    	primary_zip_code_after:arr[i].primary_zip_code_after,//��v�X�֔ԍ�
			    	primary_tranid_after:arr[i].primary_tranid_after,//��v�󒍔ԍ�
			    	primary_temperature_unit_after:arr[i].primary_temperature_unit_after,//��v���x�P��
			    	primary_shipping_date_after:arr[i].primary_shipping_date_after,//��v�o�ד�
			    	primary_delivery_name_after:arr[i].primary_delivery_name_after,//��vDJ_�^�����
			    	primary_freight_company_after:arr[i].primary_freight_company_after,//��v�͂��於
			    	primary_address_after:arr[i].primary_address_after,//��v���͂���̏Z��
			    	primary_delivery_date_after:arr[i].primary_delivery_date_after,//��v�[�i��
			    	primary_sending_table_after:arr[i].primary_sending_table_after,//��v�������l��
			    	primary_insurance_after:arr[i].primary_insurance_after,//��v�ی��t
			    	primary_shipping_information_after:arr[i].primary_shipping_information_after,//��v�o�׎w�����(������)
			    	
			    	custpage_speed_designation_after:arr[i].custpage_speed_designation_after,//�X�s�[�h�w��
					custpage_delivery_specified_time_after:arr[i].custpage_delivery_specified_time_after,//�z�B�w�莞�ԁi�����j
//					custpage_designatied_seal_1_after:arr[i].custpage_designatied_seal_1,//�w��V�[���P
					custpage_sales_office_pickup_after:arr[i].custpage_sales_office_pickup,//�c�Ə����
					custpage_src_segmentation_after:arr[i].custpage_src_segmentation,//SRC�敪
					custpage_original_arrival_category_after:arr[i].custpage_original_arrival_category,//�����敪
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
	
	}else if(expressType == '���Z'){
		
	}
		
	return newArr;
}
function csvMaker(str){
	try{
	
		var xlsFile = nlapiCreateFile('�����쐬�@�\csv�f�[�^' + '_' + getFormatYmdHms() + '.csv', 'CSV', str);
		
		xlsFile.setFolder(FILE_CABINET_ID_DJ_INVOICE_CREATE_MAIN);
		xlsFile.setName('�����쐬�@�\csv' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setEncoding('UTF-8');
			
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		return fileID; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', '', e.message)
	}
}