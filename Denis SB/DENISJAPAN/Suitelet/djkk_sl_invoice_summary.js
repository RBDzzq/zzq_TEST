/**
 * DJ_���v������
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
// changed add by song CH247 start
	if(!isEmpty(request.getParameter('retain'))){
		retainfun(request, response);
	}
	if(!isEmpty(request.getParameter('cencel'))){
		cencelfun(request, response);
	}
// changed add by song CH247 end
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
//changed add by song CH247 start
function retainfun(request, response){ //�ۗ�
	nlapiLogExecution('DEBUG', 'retainfun', 'retainfun');
	var ctx = nlapiGetContext();
	var invoiceId = request.getParameter('invoicestr');
	var flg = 'F'
	var scheduleparams = new Array();
	scheduleparams['custscript_djkk_invoice_intid'] = invoiceId;
	scheduleparams['custscript_djkk_invoice_flg'] = flg;
	runBatch('customscript_djkk_ss_invoice_summary_flg', 'customdeploy_djkk_ss_invoice_summary_flg',scheduleparams);
	var parameter = new Array();
	
	// add by zzq CH418 20230612 start
	var invoiceNoValue = request.getParameter('invoiceNo');
    var subsidiaryValue = request.getParameter('subsidiary');
    var customerValue = request.getParameter('customer');
    var invoicetrandateValue = request.getParameter('invoicetrandate');
    var startdateValue = request.getParameter('startdate');
    var enddateValue = request.getParameter('enddate');
    var invoiceamountValue = request.getParameter('invoiceamount');
    var invoicesaveValue = request.getParameter('invoicesave');
    var activeValue = request.getParameter('active');
    var invNoFromValue = request.getParameter('invNoFrom');
    var invNoToValue = request.getParameter('invNoTo');
    var printgroupValue = request.getParameter('printgroup');
    var invoicetrandateValue2 = request.getParameter('invoicetrandate2');
    //CH755 20230726 add by zdj start
    //var inMailValue = request.getParameter('inMail');
    //CH755 20230726 add by zdj end
    nlapiLogExecution('DEBUG', 'invoicetrandateValue20', invoicetrandateValue2);
    parameter['invoiceNo'] = invoiceNoValue;
    parameter['subsidiary'] = subsidiaryValue;
    parameter['customer'] = customerValue;
    parameter['invoicetrandate'] = invoicetrandateValue;
    parameter['startdate'] = startdateValue;
    parameter['enddate'] = enddateValue;
    parameter['invoiceamount'] = invoiceamountValue;
    parameter['invoicesave'] = invoicesaveValue;
    parameter['active'] = activeValue;
    parameter['invNoFrom'] = invNoFromValue;
    parameter['invNoTo'] = invNoToValue;
    parameter['printgroup'] = printgroupValue;
    parameter['invoicetrandate2'] = invoicetrandateValue2;
    //CH755 20230726 add by zdj start
    //parameter['inMail'] = inMailValue;
    //CH755 20230726 add by zdj end
    // add by zzq CH418 20230612 end
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}


function cencelfun(request, response){ //�ۗ�������
	nlapiLogExecution('DEBUG', 'request', 'request');
	var ctx = nlapiGetContext();
	var invoiceId = request.getParameter('invoicestr');
	var flg = 'T'
	var scheduleparams = new Array();
	scheduleparams['custscript_djkk_invoice_intid'] = invoiceId;
	scheduleparams['custscript_djkk_invoice_flg'] = flg;
	runBatch('customscript_djkk_ss_invoice_summary_flg', 'customdeploy_djkk_ss_invoice_summary_flg',scheduleparams);
	var parameter = new Array();
	// add by zzq CH418 20230612 start
    var invoiceNoValue = request.getParameter('invoiceNo');
    var subsidiaryValue = request.getParameter('subsidiary');
    var customerValue = request.getParameter('customer');
    var invoicetrandateValue = request.getParameter('invoicetrandate');
    var startdateValue = request.getParameter('startdate');
    var enddateValue = request.getParameter('enddate');
    var invoiceamountValue = request.getParameter('invoiceamount');
    var invoicesaveValue = request.getParameter('invoicesave');
    var activeValue = request.getParameter('active');
    var invNoFromValue = request.getParameter('invNoFrom');
    var invNoToValue = request.getParameter('invNoTo');
    var printgroupValue = request.getParameter('printgroup');
    var invoicetrandateValue2 = request.getParameter('invoicetrandate2');
    //CH755 20230726 add by zdj start
    //var inMailValue = request.getParameter('inMail');
    //CH755 20230726 add by zdj end
    parameter['invoiceNo'] = invoiceNoValue;
    parameter['subsidiary'] = subsidiaryValue;
    parameter['customer'] = customerValue;
    parameter['invoicetrandate'] = invoicetrandateValue;
    parameter['startdate'] = startdateValue;
    parameter['enddate'] = enddateValue;
    parameter['invoiceamount'] = invoiceamountValue;
    parameter['invoicesave'] = invoicesaveValue;
    parameter['active'] = activeValue;
    parameter['invNoFrom'] = invNoFromValue;
    parameter['invNoTo'] = invNoToValue;
    parameter['printgroup'] = printgroupValue;
    parameter['invoicetrandate2'] = invoicetrandateValue2;
    //CH755 20230726 add by zdj start
    //parameter['inMail'] = inMailValue;
    //CH755 20230726 add by zdj start
    // add by zzq CH418 20230612 end
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}
//changed add by song CH247 end

function run(request, response,locationValue,subsidiaryValue){

	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	var str = '';
	var key = guid()
	var theCount = parseInt(request.getLineItemCount('list'));
	var sub = [];
	for(var i = 0 ; i < theCount ; i++){
		if(request.getLineItemValue('list', 'chk', i+1)=='T'){
			var customerId = request.getLineItemValue('list', 'in_customer_id', i+1);//customerId
			var invoice_id = request.getLineItemValue('list', 'invoice_id', i+1);		
			var delivery_hopedate = request.getLineItemValue('list', 'delivery_hopedate', i+1);	
			var invoice_no = request.getLineItemValue('list', 'invoice_no', i+1);	
			var div = invoice_no.indexOf('������') >= 0 ? 'INV' : 'CRE';
			var invoice_subsidiaryid = request.getLineItemValue('list', 'invoice_subsidiaryid', i+1);	
			if(sub.indexOf(invoice_subsidiaryid) < 0){
				sub.push(invoice_subsidiaryid);
			}
			str +=invoice_id+'_'+div+',';
		}
	}
	
	var sendmailFlag = request.getParameter('custpage_inv_mail');
	
	scheduleparams['custscript_djkk_ss_inv_summary_id'] = str;
	scheduleparams['custscript_djkk_key'] = key;
	scheduleparams['custscript_djkk_subsidiary'] = JSON.stringify(sub);//DJ_�A��
	scheduleparams['custscript_djkk_send_mail'] = sendmailFlag;
	runBatch('customscript_djkk_ss_invoice_summary', 'customdeploy_djkk_ss_invoice_summary',scheduleparams);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	parameter['custparam_key'] = key;
	
	// add by zzq CH418 20230612 start
    var invoiceNoValue = request.getParameter('custpage_invoice');
    var subsidiaryValue = request.getParameter('custpage_subsidiary');
    var customerValue = request.getParameter('custpage_customer');
    var invoicetrandateValue = request.getParameter('custpage_suitel10n_inv_closing_date');
    var startdateValue = request.getParameter('custpage_startdate');
    var enddateValue = request.getParameter('custpage_enddate');
    var invoiceamountValue = request.getParameter('custpage_invoiceamount_zero');
    var invoicesaveValue = request.getParameter('custpage_invoice_save');
    var activeValue = request.getParameter('custpage_active');
    var invNoFromValue = request.getParameter('custpage_inv_no_from');
    var invNoToValue = request.getParameter('custpage_inv_no_to');
    var printgroupValue = request.getParameter('custpage_print_group');
    var invoicetrandateValue2 = request.getParameter('custpage_suitel10n_inv_closing_date2'); 
    //CH755 20230726 add by zdj start
    var inMailValue = request.getParameter('custpage_inv_mail');
    //CH755 20230726 add by zdj start
    parameter['invoiceNo'] = invoiceNoValue;
    parameter['subsidiary'] = subsidiaryValue;
    parameter['customer'] = customerValue;
    parameter['invoicetrandate'] = invoicetrandateValue;
    parameter['startdate'] = startdateValue;
    parameter['enddate'] = enddateValue;
    parameter['invoiceamount'] = invoiceamountValue;
    parameter['invoicesave'] = invoicesaveValue;
    parameter['active'] = activeValue;
    parameter['invNoFrom'] = invNoFromValue;
    parameter['invNoTo'] = invNoToValue;
    parameter['printgroup'] = printgroupValue;
    parameter['invoicetrandate2'] = invoicetrandateValue2;
    //CH755 20230726 add by zdj start
    parameter['inMail'] = inMailValue;
    //CH755 20230726 add by zdj start
    // add by zzq CH418 20230612 end
	
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

//�o�b�`��ԉ��
function logForm(request, response) {
	var key = request.getParameter('custparam_key');
	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_djkk_cs_invoice_summary');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	//changed by zhou start
//	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	//end
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_invoice_summary');

	if (batchStatus == 'FAILED') {
		// ���s���s�̏ꍇ
		//add by zhou
//		form.addButton('btn_back', '���^�[���}�b�`','clearf()');
//		// add by zzq CH418 20230612 start
		form.addButton('btn_back', '�߂�','backf()');
		// add by zzq CH418 20230612 end
		//end
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
		runstatusField.setDefaultValue(messageColour);
		// add by zzq CH418 20230612 start
		
	     var invoiceNoValue = request.getParameter('invoiceNo');
	     var subsidiaryValue = request.getParameter('subsidiary');
	     var customerValue = request.getParameter('customer');
	     var invoicetrandateValue = request.getParameter('invoicetrandate');
	     var startdateValue = request.getParameter('startdate');
	     var enddateValue = request.getParameter('enddate');
	     var invoiceamountValue = request.getParameter('invoiceamount');
	     var invoicesaveValue = request.getParameter('invoicesave');
	     var activeValue = request.getParameter('active');
	     var invNoFromValue = request.getParameter('invNoFrom');
	     var invNoToValue = request.getParameter('invNoTo');
	     var printgroupValue = request.getParameter('printgroup');
	     var invoicetrandateValue2 = request.getParameter('invoicetrandate2');
	     //CH755 20230726 add by zdj start
	     var inMailValue = request.getParameter('inMail');
	     //CH755 20230726 add by zdj end
	     var subsidiaryField = form.addField('custpage_subsidiary', 'text', '�q���',null, 'custpage_run_info').setDisplayType('hidden');
	     var activeField = form.addField('custpage_active', 'text', '�Z�N�V����',null, 'custpage_run_info').setDisplayType('hidden');
	     var customerField = form.addField('custpage_customer', 'text', '�ڋq',null, 'custpage_run_info').setDisplayType('hidden');
	     var invoiceField = form.addField('custpage_invoice', 'text', '�������ԍ�',null, 'custpage_run_info').setDisplayType('hidden');
	     var invoicetrandateField2 = form.addField('custpage_suitel10n_inv_closing_date2', 'text', '�����i���X�g�j',null, 'custpage_run_info').setDisplayType('hidden');
	     var invoicetrandateField = form.addField('custpage_suitel10n_inv_closing_date', 'date', '����',null, 'custpage_run_info').setDisplayType('hidden');
	     var startdateField = form.addField('custpage_startdate', 'text', 'DJ_�������J�n��',null, 'custpage_run_info').setDisplayType('hidden');
	     var enddateField = form.addField('custpage_enddate', 'text', 'DJ_�������I����',null, 'custpage_run_info').setDisplayType('hidden');
	     var invoiceamountField = form.addField('custpage_invoiceamount_zero', 'checkbox', 'DJ_���z�g0�h�̐��������܂�',null, 'custpage_run_info').setDisplayType('hidden');
	     var invoicesaveField = form.addField('custpage_invoice_save', 'checkbox', 'DJ_�ۗ����ꐿ�������܂�',null, 'custpage_run_info').setDisplayType('hidden');
	     var printGroupField = form.addField('custpage_print_group', 'text', 'DJ_����O���[�v',null, 'custpage_run_info').setDisplayType('hidden');
	     var invNoFromField = form.addField('custpage_inv_no_from', 'integer', '�������ԍ�From','', 'custpage_run_info').setDisplayType('hidden');
	     var inNoToField = form.addField('custpage_inv_no_to', 'integer', '�������ԍ�To','', 'custpage_run_info').setDisplayType('hidden');
	     //CH755 20230726 add by zdj start
	     var inMailField = form.addField('custpage_inv_mail', 'checkbox', '�������M�i�H�i�p�j',null, 'custpage_run_info').setDisplayType('hidden');
	     //CH755 20230726 add by zdj end
	    
	    invoiceField.setDefaultValue(invoiceNoValue);
        customerField.setDefaultValue(customerValue);
        invoicetrandateField2.setDefaultValue(invoicetrandateValue2);
        startdateField.setDefaultValue(startdateValue);
        enddateField.setDefaultValue(enddateValue);
        invoiceamountField.setDefaultValue(invoiceamountValue);
        //CH755 20230726 add by zdj start
        inMailField.setDefaultValue(inMailValue);
        //CH755 20230726 add by zdj end
        invoicesaveField.setDefaultValue(invoicesaveValue);
        activeField.setDefaultValue(activeValue);
        invNoFromField.setDefaultValue(invNoFromValue);
        inNoToField.setDefaultValue(invNoToValue);
        printGroupField.setDefaultValue(printgroupValue);
        invoicetrandateField.setDefaultValue(invoicetrandateValue);
//        var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
//        if(isEmpty(subsidiaryValue)){
//            subsidiaryValue=selectSub;
//        }
        subsidiaryField.setDefaultValue(subsidiaryValue);
	    // add by zzq CH418 20230612 end
		
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {
		//add by zhou
		form.addButton('custpage_refresh', '�X�V', 'refresh();');
		//end
		// ���s���̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('�o�b�`���������s��');
		// add by zzq CH418 20230612 start
        
        var invoiceNoValue = request.getParameter('invoiceNo');
        var subsidiaryValue = request.getParameter('subsidiary');
        var customerValue = request.getParameter('customer');
        var invoicetrandateValue = request.getParameter('invoicetrandate');
        var startdateValue = request.getParameter('startdate');
        var enddateValue = request.getParameter('enddate');
        var invoiceamountValue = request.getParameter('invoiceamount');
        var invoicesaveValue = request.getParameter('invoicesave');
        var activeValue = request.getParameter('active');
        var invNoFromValue = request.getParameter('invNoFrom');
        var invNoToValue = request.getParameter('invNoTo');
        var printgroupValue = request.getParameter('printgroup');
        var invoicetrandateValue2 = request.getParameter('invoicetrandate2');
        //CH755 20230726 add by zdj start
        var inMailValue = request.getParameter('inMail');
        //CH755 20230726 add by zdj end
       
        var subsidiaryField = form.addField('custpage_subsidiary', 'text', '�q���',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '1');
        var activeField = form.addField('custpage_active', 'text', '�Z�N�V����',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '2');
        var customerField = form.addField('custpage_customer', 'text', '�ڋq',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '3');
        var invoiceField = form.addField('custpage_invoice', 'text', '�������ԍ�',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '4');
        var invoicetrandateField2 = form.addField('custpage_suitel10n_inv_closing_date2', 'text', '�����i���X�g�j',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '5');
        var invoicetrandateField = form.addField('custpage_suitel10n_inv_closing_date', 'date', '����',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '6');
        var startdateField = form.addField('custpage_startdate', 'text', 'DJ_�������J�n��',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '7');
        var enddateField = form.addField('custpage_enddate', 'text', 'DJ_�������I����',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '8');
        var invoiceamountField = form.addField('custpage_invoiceamount_zero', 'checkbox', 'DJ_���z�g0�h�̐��������܂�',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '9');
        var invoicesaveField = form.addField('custpage_invoice_save', 'checkbox', 'DJ_�ۗ����ꐿ�������܂�',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '10');
        var printGroupField = form.addField('custpage_print_group', 'text', 'DJ_����O���[�v',null, 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '11');
        var invNoFromField = form.addField('custpage_inv_no_from', 'integer', '�������ԍ�From','', 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '12');
        var inNoToField = form.addField('custpage_inv_no_to', 'integer', '�������ԍ�To','', 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '13');
        //CH755 20230726 add by zdj start
        var inMailField = form.addField('custpage_inv_mail', 'checkbox', '�������M�i�H�i�p�j','', 'custpage_run_info').setDisplayType('hidden');
        nlapiLogExecution('DEBUG', '22');
        //CH755 20230726 add by zdj end
       
       invoiceField.setDefaultValue(invoiceNoValue);
       nlapiLogExecution('DEBUG', '14');
       customerField.setDefaultValue(customerValue);
       nlapiLogExecution('DEBUG', '15');
       invoicetrandateField2.setDefaultValue(invoicetrandateValue2);
       nlapiLogExecution('DEBUG', '16');
       startdateField.setDefaultValue(startdateValue);
       nlapiLogExecution('DEBUG', '17');
       enddateField.setDefaultValue(enddateValue);
       nlapiLogExecution('DEBUG', '18');
       invoiceamountField.setDefaultValue(invoiceamountValue);
       nlapiLogExecution('DEBUG', '19');
       invoicesaveField.setDefaultValue(invoicesaveValue);
       nlapiLogExecution('DEBUG', '20');
       activeField.setDefaultValue(activeValue);
       nlapiLogExecution('DEBUG', '21');
       //CH755 20230726 add by zdj start
       inMailField.setDefaultValue(inMailValue);
       nlapiLogExecution('DEBUG', '23');
       //CH755 20230726 add by zdj end
       invNoFromField.setDefaultValue(invNoFromValue);
       inNoToField.setDefaultValue(invNoToValue);
       printGroupField.setDefaultValue(printgroupValue);
       invoicetrandateField.setDefaultValue(invoicetrandateValue);
//       var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
//       if(isEmpty(subsidiaryValue)){
//           subsidiaryValue=selectSub;
//       }
       subsidiaryField.setDefaultValue(subsidiaryValue);
       nlapiLogExecution('DEBUG', 'end');
       // add by zzq CH418 20230612 end
		response.writePage(form);
	}else{

        //CH755 20230726 add by zdj start
        var inMailValue = request.getParameter('inMail');
        //CH755 20230726 add by zdj end
        
		// ���s�����̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('�o�b�`����������');
		
		var jobSearch = nlapiSearchRecord("customrecord_djkk_inv_summary_execution",null,
				[
				   ["custrecord_djkk_totalinv_key","is",key]
				], 
				[ 
				   new nlobjSearchColumn("custrecord_djkk_totalinv_folder_id"), 
				   new nlobjSearchColumn("internalid"),
				]
				);
		

		var folder_id = jobSearch[0].getValue("custrecord_djkk_totalinv_folder_id");			
		var keyId = jobSearch[0].getValue("internalid");
		nlapiLogExecution('DEBUG', 'show me the folder_id', folder_id);
		
		 var folderDownUrl = "window.open('"+URL_HEAD+"/core/media/downloadfolder.nl?id=" + folder_id + "', '_blank');"; 
		 //add by 20230515 zhou CH418 start
		 if (inMailValue == 'F' || !inMailValue) {
		     form.addButton('btn_send_email', '���M','sendEmail('+keyId+')');
		 }
		 form.addButton('btn_pdf_preview', 'PDF�v���r���[','pdfPreview('+folder_id+')');
		 form.addButton('btn_down', '�_�E�����[�h',folderDownUrl);
		//add by 20230515 zhou CH418 end
//		 form.addButton('btn_back', '���^�[���}�b�`','clearf()');
		 form.addButton('btn_back', '�߂�','backf()');
		// add by zzq CH418 20230612 start
		 
         var invoiceNoValue = request.getParameter('invoiceNo');
         var subsidiaryValue = request.getParameter('subsidiary');
         var customerValue = request.getParameter('customer');
         var invoicetrandateValue = request.getParameter('invoicetrandate');
         var startdateValue = request.getParameter('startdate');
         var enddateValue = request.getParameter('enddate');
         var invoiceamountValue = request.getParameter('invoiceamount');
         var invoicesaveValue = request.getParameter('invoicesave');
         var activeValue = request.getParameter('active');
         var invNoFromValue = request.getParameter('invNoFrom');
         var invNoToValue = request.getParameter('invNoTo');
         var printgroupValue = request.getParameter('printgroup');
         var invoicetrandateValue2 = request.getParameter('invoicetrandate2');
         //CH755 20230726 add by zdj start
         var inMailValue = request.getParameter('inMail');
         nlapiLogExecution('DEBUG', 'inMailValue121212', inMailValue);
//         if(inMailValue == 'T'){
//             nlapiLogExecution('DEBUG', 'auto email start', 'auto email start');
//             sendEmail(keyId);
//         }
         //CH755 20230726 add by zdj start
        
         var subsidiaryField = form.addField('custpage_subsidiary', 'text', '�q���',null, 'custpage_run_info').setDisplayType('hidden');
         var activeField = form.addField('custpage_active', 'text', '�Z�N�V����',null, 'custpage_run_info').setDisplayType('hidden');
         var customerField = form.addField('custpage_customer', 'text', '�ڋq',null, 'custpage_run_info').setDisplayType('hidden');
         var invoiceField = form.addField('custpage_invoice', 'text', '�������ԍ�',null, 'custpage_run_info').setDisplayType('hidden');
         var invoicetrandateField2 = form.addField('custpage_suitel10n_inv_closing_date2', 'text', '�����i���X�g�j',null, 'custpage_run_info').setDisplayType('hidden');
         var invoicetrandateField = form.addField('custpage_suitel10n_inv_closing_date', 'date', '����',null, 'custpage_run_info').setDisplayType('hidden');
         var startdateField = form.addField('custpage_startdate', 'text', 'DJ_�������J�n��',null, 'custpage_run_info').setDisplayType('hidden');
         var enddateField = form.addField('custpage_enddate', 'text', 'DJ_�������I����',null, 'custpage_run_info').setDisplayType('hidden');
         var invoiceamountField = form.addField('custpage_invoiceamount_zero', 'checkbox', 'DJ_���z�g0�h�̐��������܂�',null, 'custpage_run_info').setDisplayType('hidden');
         var invoicesaveField = form.addField('custpage_invoice_save', 'checkbox', 'DJ_�ۗ����ꐿ�������܂�',null, 'custpage_run_info').setDisplayType('hidden');
         var printGroupField = form.addField('custpage_print_group', 'text', 'DJ_����O���[�v',null, 'custpage_run_info').setDisplayType('hidden');
         var invNoFromField = form.addField('custpage_inv_no_from', 'integer', '�������ԍ�From','', 'custpage_run_info').setDisplayType('hidden');
         var inNoToField = form.addField('custpage_inv_no_to', 'integer', '�������ԍ�To','', 'custpage_run_info').setDisplayType('hidden');
         //CH755 20230726 add by zdj start
         var inMailField = form.addField('custpage_inv_mail', 'checkbox', '�������M�i�H�i�p�j','', 'custpage_run_info').setDisplayType('hidden');
         //CH755 20230726 add by zdj end
        
        invoiceField.setDefaultValue(invoiceNoValue);
        customerField.setDefaultValue(customerValue);
        invoicetrandateField2.setDefaultValue(invoicetrandateValue2);
        startdateField.setDefaultValue(startdateValue);
        enddateField.setDefaultValue(enddateValue);
        invoiceamountField.setDefaultValue(invoiceamountValue);
        invoicesaveField.setDefaultValue(invoicesaveValue);
        activeField.setDefaultValue(activeValue);
        invNoFromField.setDefaultValue(invNoFromValue);
        inNoToField.setDefaultValue(invNoToValue);
        printGroupField.setDefaultValue(printgroupValue);
        invoicetrandateField.setDefaultValue(invoicetrandateValue);
        //CH755 20230726 add by zdj start
        inMailField.setDefaultValue(inMailValue);
        //CH755 20230726 add by zdj end
//        var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
//        if(isEmpty(subsidiaryValue)){
//            subsidiaryValue=selectSub;
//        }
        subsidiaryField.setDefaultValue(subsidiaryValue);
        // add by zzq CH418 20230612 end
		 response.writePage(form);
	
	
	
		
		
//		createForm(request, response);
	}
	
}

function createForm(request, response){

	 var selectFlg = request.getParameter('selectFlg');
	 var invoiceNoValue = request.getParameter('invoiceNo');
	 var subsidiaryValue = request.getParameter('subsidiary');
	 var customerValue = request.getParameter('customer');
	 var invoicetrandateValue = request.getParameter('invoicetrandate');
	 var startdateValue = request.getParameter('startdate');
	 var enddateValue = request.getParameter('enddate');
	 var invoiceamountValue = request.getParameter('invoiceamount');
	 var invoicesaveValue = request.getParameter('invoicesave');
	 var activeValue = request.getParameter('active');
	 var invNoFromValue = request.getParameter('invNoFrom');
	 var invNoToValue = request.getParameter('invNoTo');
	 var printgroupValue = request.getParameter('printgroup');
	 var invoicetrandateValue2 = request.getParameter('invoicetrandate2');
	 nlapiLogExecution('DEBUG', 'invoicetrandateValue2', invoicetrandateValue2);
	 //CH755 20230726 add by zdj start
	 var inMailValue = request.getParameter('inMail');
	 nlapiLogExecution('DEBUG', 'inMailValueCreate1', inMailValue);
	 //CH755 20230726 add by zdj start
	 // add by zzq CH418 20230612 start
	 //�������A���ߌ��̓N���A����
//	 if(selectFlg == 'T'){
//		invoicetrandateValue2 = "";
//	}
	// add by zzq CH418 20230612 end
	
	var form = nlapiCreateForm('DJ_���v������', false);
	form.setScript('customscript_djkk_cs_invoice_summary');
	
	
		
//	 //��ʍ��ڒǉ�
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '�����߂�','searchReturn()')
		 form.addButton('btn_retain', '�ۗ�','retain()')
		 form.addButton('btn_cencel', '�ۗ�������','cencel()')
		 //add by 20230515 zhou CH418 start
//		 form.addSubmitButton('�쐬')
		 form.addSubmitButton('PDF�쐬')
		 //add by 20230515 zhou CH418 end
	 }else{
		form.addButton('btn_search', '����', 'search()')
		form.addButton('btn_clear', '�N���A', 'clearf()')
	 }
	 
	 
	 

	 form.addFieldGroup('select_group', '����');
	 var subsidiaryField = form.addField('custpage_subsidiary', 'select', '�q���',null, 'select_group');
	 subsidiaryField.setMandatory(true);
	 var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	 var activeField = form.addField('custpage_active', 'select', '�Z�N�V����','', 'select_group');
	 var customerField = form.addField('custpage_customer', 'multiselect', '�ڋq','', 'select_group')
	 var invoiceField = form.addField('custpage_invoice', 'select', '�������ԍ�','invoice', 'select_group').setDisplayType('hidden')
	 
	 var invoicetrandateField2 = form.addField('custpage_suitel10n_inv_closing_date2', 'select', '�����i���X�g�j',null, 'select_group')
	 var invoicetrandateField = form.addField('custpage_suitel10n_inv_closing_date', 'date', '����',null, 'select_group')
	 invoicetrandateField.setMandatory(true);

	 
	 
	 var startdateField = form.addField('custpage_startdate', 'date', 'DJ_�������J�n��',null, 'select_group')
	 var enddateField = form.addField('custpage_enddate', 'date', 'DJ_�������I����',null, 'select_group')
	 var invoiceamountField = form.addField('custpage_invoiceamount_zero', 'checkbox', 'DJ_���z�g0�h�̐��������܂�',null, 'select_group')
	 var invoicesaveField = form.addField('custpage_invoice_save', 'checkbox', 'DJ_�ۗ����ꐿ�������܂�',null, 'select_group')
	 var printGroupField = form.addField('custpage_print_group', 'select', 'DJ_����O���[�v',null, 'select_group')
	 var invNoFromField = form.addField('custpage_inv_no_from', 'integer', '�������ԍ�From','', 'select_group');
	 var inNoToField = form.addField('custpage_inv_no_to', 'integer', '�������ԍ�To','', 'select_group');
	   // CH755 20230726 add by zdj start
     var inMailField = form.addField('custpage_inv_mail', 'checkbox', '�������M�i�H�i�p�j',null, 'select_group');
     // CH755 20230726 add by zdj end
	 
		if(isEmpty(subsidiaryValue)){
			subsidiaryValue=selectSub;
		}
		
		subsidiaryField.setDefaultValue(subsidiaryValue);
		
		//20221110 changed by zhou start CH074
		//����(����)
		 if((subsidiaryValue != '6'&& subsidiaryValue != '7'&& subsidiaryValue != '1')){
			 
			 if(!isEmpty(customerValue)){
			 invoicetrandateField2.addSelectOption('', '')
			 var custArr = [];
			 var customerArr =customerValue.split('');
			 nlapiLogExecution('debug','customerValue',customerArr)
			 var customerSearch = nlapiSearchRecord("customer",null,
					[
					   ["internalid","anyof",customerArr]
					], 
					[
					   new nlobjSearchColumn("custrecord_suitel10n_jp_pt_closing_day","CUSTRECORD_SUITEL10N_JP_PT_CUSTOMER",null)
					]
					);
			 if(!isEmpty(customerSearch)){
				 nlapiLogExecution('debug','customerSearch.length ',customerSearch.length )
				 for(var cd = 0 ; cd < customerSearch.length ; cd++){
					 if(!isEmpty(customerSearch[cd].getValue("custrecord_suitel10n_jp_pt_closing_day","CUSTRECORD_SUITEL10N_JP_PT_CUSTOMER",null))){
						 custArr.push({
							 id:customerSearch[cd].getValue("custrecord_suitel10n_jp_pt_closing_day","CUSTRECORD_SUITEL10N_JP_PT_CUSTOMER",null),
						 	 lable:customerSearch[cd].getText("custrecord_suitel10n_jp_pt_closing_day","CUSTRECORD_SUITEL10N_JP_PT_CUSTOMER",null)
						 })
					 }
				 }
				 nlapiLogExecution('debug','custArr',JSON.stringify(custArr))
				 
				 var newArr = deWeight(custArr);
				 nlapiLogExecution('debug','newArr',JSON.stringify(newArr))
				 
				 nlapiLogExecution('debug','newArr.length ',newArr.length )
				 for(var af = 0 ; af < newArr.length ; af++){
					 var id = newArr[af].id;
					 var lable = newArr[af].lable;
					 invoicetrandateField2.addSelectOption(id, lable)
				 }
			 }
		 }
		 }else{
			//����(����)
				invoicetrandateField2.addSelectOption('', '')
				invoicetrandateField2.addSelectOption('15', '������15��')
				invoicetrandateField2.addSelectOption('20', '������20��')
				invoicetrandateField2.addSelectOption('25', '������25��')
				invoicetrandateField2.addSelectOption('31', '����������')
		 }	
			//end	
		
		
		//����O���[�v
		var printGroupSearch = getSearchResults("customrecord_djkk_print_group",null,
				[
				   
				], 
				[
				   new nlobjSearchColumn("name"),
				   new nlobjSearchColumn("internalid")
				]
				);
		if(!isEmpty(printGroupSearch)){
			printGroupField.addSelectOption('', '');
			for(var i = 0; i<printGroupSearch.length;i++){
				printGroupField.addSelectOption(printGroupSearch[i].getValue("internalid"),printGroupSearch[i].getValue("name"));
			}
		}
		

		//�Z�N�V�����ݒ�
		var activeSearch = getSearchResults("department",null,
				[
				   ["custrecord_djkk_dp_subsidiary","anyof",subsidiaryValue]
				], 
				[
				   new nlobjSearchColumn("name"),
				   new nlobjSearchColumn("internalid")
				]
				);
		if(!isEmpty(activeSearch)){
			activeField.addSelectOption('', '');
			for(var i = 0; i<activeSearch.length;i++){
				activeField.addSelectOption(activeSearch[i].getValue("internalid"),activeSearch[i].getValue("name"));
			}
		}
		
		
		
		
	 
		//�ڋq
	 var custfiliter = new Array();
	 custfiliter.push(['custentity_djkk_totalinv_print_ex','is','F'])
	 //20221121 add by zhou CH124 start
	 custfiliter.push("AND");
	 custfiliter.push(['custentity_4392_useids','is','T'])
	 //end 	  	
	 if(!isEmpty(subsidiaryValue)){
		 custfiliter.push("AND")
		 custfiliter.push(['subsidiary','anyof',subsidiaryValue])
	 }
	 if(!isEmpty(activeValue)){
		 custfiliter.push("AND")
		 custfiliter.push(['custentity_djkk_activity','anyof',activeValue])
	 }
	//20221110 changed by zhou start CH074
	 var filedItemGroupList = getSearchResults("customer",null,
				[
				 custfiliter
				], 
				[
				   new nlobjSearchColumn("internalid").setSort(false),
				   new nlobjSearchColumn("companyname"),
				   new nlobjSearchColumn("entityid"),
				   new nlobjSearchColumn("custrecord_suitel10n_jp_pt_closing_day","CUSTRECORD_SUITEL10N_JP_PT_CUSTOMER",null),
				]
		);
		var custclosingday = [];
		var customerArray = [];
		customerField.addSelectOption('', '���ׂ�');
		for(var i = 0; i<filedItemGroupList.length;i++){
//			customerField.addSelectOption(filedItemGroupList[i].getValue("internalid"),filedItemGroupList[i].getValue("entityid")+' '+filedItemGroupList[i].getValue("companyname"));
			customerArray.push({
				id:filedItemGroupList[i].getValue("internalid"),
				lable:filedItemGroupList[i].getValue("entityid")+' '+filedItemGroupList[i].getValue("companyname")
			})
			if(isEmpty(customerValue)&&(subsidiaryValue != '6'&& subsidiaryValue != '7'&& subsidiaryValue != '1')){
				if(!isEmpty(filedItemGroupList[i].getValue("custrecord_suitel10n_jp_pt_closing_day","CUSTRECORD_SUITEL10N_JP_PT_CUSTOMER",null))){
					custclosingday.push({
						 id:filedItemGroupList[i].getValue("custrecord_suitel10n_jp_pt_closing_day","CUSTRECORD_SUITEL10N_JP_PT_CUSTOMER",null),
					 	 lable:filedItemGroupList[i].getText("custrecord_suitel10n_jp_pt_closing_day","CUSTRECORD_SUITEL10N_JP_PT_CUSTOMER",null)
					})
				}
			}
			
		}
		nlapiLogExecution('debug','custclosingday',JSON.stringify(custclosingday))
		if(!isEmpty(customerArray)){
			 var newCustomerArray = deWeight(customerArray);
			 for(var v = 0 ; v < newCustomerArray.length ; v++){
				 var id = newCustomerArray[v].id;
				 var lable = newCustomerArray[v].lable;
				 customerField.addSelectOption(id,lable);
			 }
		}
		
		if(!isEmpty(custclosingday)){
			invoicetrandateField2.addSelectOption('', '')
			nlapiLogExecution('debug','custclosingday',JSON.stringify(custclosingday))
			 var newCustclosingdayValue = deWeight(custclosingday);
			 for(var z = 0 ; z < newCustclosingdayValue.length ; z++){
				 var id = newCustclosingdayValue[z].id;
				 var lable = newCustclosingdayValue[z].lable;
				 invoicetrandateField2.addSelectOption(id, lable)
			 }
		}
		//end
	 
	
		if(selectFlg == 'T'){
			subsidiaryField.setDisplayType('inline');		
			customerField.setDisplayType('inline');
			invoiceField.setDisplayType('inline');
			invoicetrandateField.setDisplayType('inline');
			invoicetrandateField2.setDisplayType('inline');
			startdateField.setDisplayType('inline');
			enddateField.setDisplayType('inline');
			invoiceamountField.setDisplayType('inline');
			invoicesaveField.setDisplayType('inline');		
			activeField.setDisplayType('inline');	
			invNoFromField.setDisplayType('inline');	
			inNoToField.setDisplayType('inline');	
			printGroupField.setDisplayType('inline');
			//CH755 20230726 add by zdj start
			inMailField.setDisplayType('inline');
			//CH755 20230726 add by zdj end
		}else{
			
		}
		invoiceField.setDefaultValue(invoiceNoValue)
		customerField.setDefaultValue(customerValue)
		invoicetrandateField2.setDefaultValue(invoicetrandateValue2)
		startdateField.setDefaultValue(startdateValue)
		enddateField.setDefaultValue(enddateValue)
		invoiceamountField.setDefaultValue(invoiceamountValue)
		invoicesaveField.setDefaultValue(invoicesaveValue)
		activeField.setDefaultValue(activeValue)
		invNoFromField.setDefaultValue(invNoFromValue)
		inNoToField.setDefaultValue(invNoToValue)
		printGroupField.setDefaultValue(printgroupValue)
		inMailField.setDefaultValue(inMailValue)
		//�����ݒ肷�� 
		//�����ȊO�ꍇ�@���X�g�ɂ��A�ݒ肷��
		if(selectFlg == 'F'){
			if(!isEmpty(invoicetrandateValue2)){
				var today = new Date();
				//20221121 CHANGED BY ZHOU START
				/*******old*******/
				//var todayMonth = today.getMonth()+1;
				/*******old*******/
				/*******new*******/
				var todayMonth = today.getMonth();
				/*******new*******/
				var todayYear = today.getFullYear();
				
				var invoicetrandateParamDate = '';
				//�����ꍇ
				if(invoicetrandateValue2 == '31'){
//					invoicetrandateParamDate = todayYear + '/' + todayMonth + '/' + new Date(todayYear, todayMonth, 0).getDate();
//					invoicetrandateParamDate = todayYear + '/' + Number(todayMonth+1) + '/' + getThisMouthDays();
					invoicetrandateParamDate = todayYear + '/' + Number(todayMonth) + '/' + getOldMouthDays(todayYear, todayMonth);
				}else{
					/*******old*******/
					//invoicetrandateParamDate = todayYear + '/' + todayMonth + '/' + invoicetrandateValue2;
					/*******old*******/
					/*******new*******/
					invoicetrandateParamDate = todayYear + '/' + Number(todayMonth+1) + '/' + invoicetrandateValue2;
					/*******new*******/
				}
				//20221121 CHANGED BY ZHOU END
				nlapiLogExecution('DEBUG', '����', invoicetrandateParamDate)
				if(!isEmpty(invoicetrandateParamDate)){
					invoicetrandateValue = invoicetrandateParamDate;
				}
			}
		}
		//�����ݒ肷��
		invoicetrandateField.setDefaultValue(invoicetrandateValue)
		
	 
	 
	 var subList = form.addSubList('list', 'list', '');
	 subList.addMarkAllButtons();
	 subList.addField('chk', 'checkbox', '�I��');
	 subList.addField('invoice_subsidiary', 'text', '�q��� ');
	 subList.addField('invoice_subsidiaryid', 'text', '�q���ID ').setDisplayType('hidden');
     //CH418
	 subList.addField('invoice_active', 'text', '�Z�N�V���� ');
	 subList.addField('in_customer', 'text', '�ڋq');
	 subList.addField('in_customer_id', 'text', '�ڋqID').setDisplayType('hidden');
	 subList.addField('invoice_no', 'text', '�������ԍ�');
	 subList.addField('invoice_id', 'text', '������ID').setDisplayType('hidden');
	 subList.addField('delivery_hopedate', 'text', '����');
	 subList.addField('invoice_trandate', 'text', '������');
	 subList.addField('invoice_duedate', 'text', '����/��������');
	 subList.addField('invoice_total', 'text', '���������z');
	 subList.addField('customer_total', 'text', '�ڋq�������z');
//	 subList.addField('last_balance', 'text', '�O��̎c�� ');
//�X�e�[�^�X�ύX:�ۗ��t���O
//	 subList.addField('invoice_status', 'text', '�ۗ��t���O ');
	 subList.addField('invoice_status', 'text', '�X�e�[�^�X ');
	 subList.addField('invoice_currency', 'text', '�ʉ� ');
	 subList.addField('invoice_exchangerate', 'text', '�בփ��[�g ');
	// changed by song CH247 start
	 subList.addField('invoice_retain', 'text', '�ۗ� ');
	 subList.addField('invoice_retainid', 'text', '�ۗ�ID ').setDisplayType('hidden');
	 subList.addField('invoice_type', 'text', 'TYPE ').setDisplayType('hidden');
	// changed by song CH247 end
	 
	 
	 
	 
	 if(selectFlg == 'T')		
	 {
			
			var filit = new Array();
			filit.push(["type","anyof","CustInvc","CustCred"]);
			filit.push("AND");
			filit.push(["mainline","is","T"]);
			filit.push("AND");
			filit.push(["number","isnotempty",""]);
			//���v�������쐬�ς݃t���O
			filit.push("AND");
			filit.push(["custbody_djkk_invoicetotal_flag","is","F"]);
			
			//���ߐ������Ɋ܂߂� ��T�ꍇ
			filit.push("AND");
			filit.push(["custbody_4392_includeids","is","T"]);
			
			//��v����
			filit.push("AND");
			filit.push(["trandate","onorafter",getAccountingperiodMaxDate()]);
			
			//DJ_���v������������O��T�̏ꍇ�O��
			filit.push("AND");
			filit.push(["customer.custentity_djkk_totalinv_print_ex","is","F"]);
			
			//����O���[�v
			if(!isEmpty(printgroupValue)){
				filit.push("AND");
				filit.push(["customer.custentity_djkk_print_group","anyof",printgroupValue]);
			}

			
			
			//������NoFrom
			if(!isEmpty(invNoFromValue)){
				filit.push("AND");
				filit.push(["number","greaterthanorequalto",invNoFromValue]);
			}
			
			//������NoTo
			if(!isEmpty(invNoToValue)){
				filit.push("AND");
				filit.push(["number","lessthanorequalto",invNoToValue]);
			}
		 
			//�Z�N�V����
			if(!isEmpty(activeValue)){
				filit.push("AND");
				filit.push(["department","anyof",activeValue]);
			}
			   

			if(!isEmpty(invoiceNoValue)){
				filit.push("AND");
				filit.push(["internalid","anyOf",invoiceNoValue]);
			}
			if(!isEmpty(subsidiaryValue)){
				filit.push("AND");
				filit.push(["subsidiary","anyOf",subsidiaryValue]);
			}
			
			//�ڋq
			if(!isEmpty(customerValue)){
				var custfilterRst =customerValue.split('');
				if(!isEmpty(custfilterRst)){
					filit.push("AND");
					var arrcustid = new Array();
					arrcustid.push("customer.internalid")
					arrcustid.push("anyof")
					for(var i = 0 ; i < custfilterRst.length; i++){
						arrcustid.push(custfilterRst[i]);
					}
					filit.push(arrcustid);
				}

			}

			//����
			if(!isEmpty(invoicetrandateValue)){
				filit.push("AND");
				filit.push(["custbody_suitel10n_inv_closing_date","on",invoicetrandateValue]);
				//filit.push([[["createdfrom.custbody_suitel10n_inv_closing_date","on",invoicetrandateValue],"AND",["type","anyof","CustCred"]],"OR",[["custbody_suitel10n_inv_closing_date","on",invoicetrandateValue],"AND",["type","anyof","CustInvc"]]]);

			}


			if(!isEmpty(startdateValue) && !isEmpty(enddateValue)){
				filit.push("AND");
				filit.push(["trandate","within",startdateValue,enddateValue]);
			}
			
			//�O�~�܂�
			if(invoiceamountValue == 'T'){
				
				
			}else{
				filit.push("AND");
				filit.push(["grossamount","notequalto","0.00"])
				   
			}
			
			//�ۗ��܂ށ@�ۗ��t���O������@���F�ςݐ������̂݁@�^�p��ŉ������
			filit.push("AND");
			//filit.push(["status","anyof","CustInvc:A","CustInvc:B","CustCred:A","CustCred:B"])
			filit.push(["status","anyof","CustInvc:A","CustCred:A"])
			if(invoicesaveValue == 'T'){
				//�ۗ��t���O�����ꍇ�A�S���������ΏۂƂ���
			}else{
				filit.push("AND");
				filit.push(["custbody_djkk_hold_flg","is","F"])
			}

		
		var invoiceSearch = nlapiSearchRecord("transaction",null,
				filit, 
				[
				 new nlobjSearchColumn("internalid","customer",null).setSort(false), 
				 new nlobjSearchColumn("altname","customer",null).setSort(false), 
				   new nlobjSearchColumn("invoicenum").setSort(false), 
				   new nlobjSearchColumn("subsidiary"),
	               //CH418
				   new nlobjSearchColumn("department"),
				   new nlobjSearchColumn("trandate"), 
                   new nlobjSearchColumn("custbody_suitel10n_inv_closing_date"), 
				   new nlobjSearchColumn("statusref"),
				   new nlobjSearchColumn("currency"), 
				   new nlobjSearchColumn("exchangerate"), 
				   new nlobjSearchColumn("duedate"),
				   new nlobjSearchColumn("grossamount"),
				   new nlobjSearchColumn("internalid") ,
				   new nlobjSearchColumn("createdfrom"),
				   // changed by song CH247 start
				   new nlobjSearchColumn("custbody_djkk_hold_flg"),
				   new nlobjSearchColumn("type"),
				   // changed by song CH247 end
				]
				);
		
		//�쐬�����������ȊO�̂̂����O�� �����s�v
//		var rst = new Array();
//		if(!isEmpty(invoiceSearch)){
//			for(var i = 0 ; i < invoiceSearch.length ;i++){
//
//				if(invoiceSearch[i].getText("createdfrom").indexOf("������") >= 0 || invoiceSearch[i].getValue("invoicenum").indexOf("������") >= 0){
//					rst.push(invoiceSearch[i]);
//				}
//			}
//			
//		}
//		invoiceSearch = rst;
		
		if(!isEmpty(invoiceSearch)){
			var custMoney = new Array()
			for(var i = 0 ; i < invoiceSearch.length ; i++){


				var custId = invoiceSearch[i].getValue("altname","customer",null);
				var invMoney = invoiceSearch[i].getValue("grossamount");
				if(isEmpty(custMoney[custId]) || custMoney[custId] == 0){
					custMoney[custId] =Number(invMoney);
				}else{
					custMoney[custId] += Number(invMoney);
				}
			}
			
			var line = 1;
			for(var i = 0 ; i < invoiceSearch.length ;i++){


				subList.setLineItemValue('invoice_no', line, invoiceSearch[i].getValue("invoicenum"));	
				subList.setLineItemValue('invoice_id', line, invoiceSearch[i].getValue("internalid"));	
				subList.setLineItemValue('invoice_subsidiary', line, invoiceSearch[i].getText("subsidiary"));
                //CH418				
				subList.setLineItemValue('invoice_active', line, invoiceSearch[i].getText("department"));
				subList.setLineItemValue('invoice_subsidiaryid', line, invoiceSearch[i].getValue("subsidiary"));
				subList.setLineItemValue('invoice_trandate', line, invoiceSearch[i].getValue("trandate"));
				subList.setLineItemValue('in_customer', line, invoiceSearch[i].getValue("altname","customer",null));
				subList.setLineItemValue('in_customer_id', line, invoiceSearch[i].getValue("internalid","customer",null));
				subList.setLineItemValue('delivery_hopedate', line, invoiceSearch[i].getValue("custbody_suitel10n_inv_closing_date"));
				subList.setLineItemValue('invoice_total', line,Number(invoiceSearch[i].getValue("grossamount")) == 0 ? '0.00' : invoiceSearch[i].getValue("grossamount"));
				subList.setLineItemValue('invoice_status', line,invoiceSearch[i].getText("statusref"));
				subList.setLineItemValue('invoice_currency', line, invoiceSearch[i].getText("currency"));
				subList.setLineItemValue('invoice_exchangerate', line, invoiceSearch[i].getValue("exchangerate"));
				subList.setLineItemValue('invoice_duedate', line, invoiceSearch[i].getValue("duedate"));
				subList.setLineItemValue('customer_total', line, custMoney[invoiceSearch[i].getValue("altname","customer",null)]);
				// changed by song CH247 start
				if(invoiceSearch[i].getValue("custbody_djkk_hold_flg") == 'T'){
					subList.setLineItemValue('invoice_retain', line, "�͂�");
					subList.setLineItemValue('invoice_retainid', line, invoiceSearch[i].getValue("custbody_djkk_hold_flg"));
				}else{
					subList.setLineItemValue('invoice_retain', line, "������");
					subList.setLineItemValue('invoice_retainid', line, invoiceSearch[i].getValue("custbody_djkk_hold_flg"));
				}
				subList.setLineItemValue('invoice_type', line, invoiceSearch[i].getValue("type"));
				// changed by song CH247 end
				line++;
			}
		}
		}
		
	  
	 
	 
	 response.writePage(form);
}

//��v���Ԏ擾
function getAccountingperiodMaxDate(){
	
    // ����
    var filter = new Array();
    filter.push(new nlobjSearchFilter('isYear', null, 'is', 'T'));
    filter.push(new nlobjSearchFilter('allLocked', null, 'is', 'F'));
    // �R����
    var column = new Array();
    column.push(new nlobjSearchColumn('startdate'));

    // �������s��
    var rec = nlapiSearchRecord('accountingperiod', null, filter, column);
    var date = rec[0].getValue('startdate');

    return date;
}

function deWeight(arr) {
    for (var i = 0; i < arr.length - 1; i++) {
        for (var j = i + 1; j < arr.length; j++) {
            if (arr[i].id == arr[j].id) {
                arr.splice(j, 1);
                j--;
            }
        }
    }
    return arr;
}
//20230112 add by zhou
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function defaultEmpty(src){
	return src || '';
}
function getThisMouthDays(){
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth();
	const days = new Date(year, month + 1, 0).getDate(); // 30
	return days
}

function getOldMouthDays(year, month){
    const days = new Date(year, month, 0).getDate(); // 30
    return days
}