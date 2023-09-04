/**
 * DJ_FC_csv�A�b�v���[�h_ls
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Jul 2021     zhou
 *
 */
/**
 * for handy test
 * @param {*} request 
 * @param {*} response 
 */
function suitelet(request, response) {
	
	if(request.getMethod() == 'POST'){
		run(request, response)
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response)
		}else{
			var form = nlapiCreateForm('�t�@�C���A�b�v���[�h', false);
			form.setScript('customscript_djkk_cs_uploadfile');
	
			var fileFild = form.addField('custpage_file', 'file', '�A�b�v���[�h�t�@�C��');
			
			form.addSubmitButton('CSV�A�b�v���[�h');
			response.writePage(form);
		}
	}

}
function logForm(request, response) {
	
	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_djkk_cs_uploadfile');
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_in_stock_send');
	if (batchStatus == 'FAILED') {
		// ���s���
		form.addFieldGroup('custpage_run_info', '���s���');
		// ���s���s�̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
		runstatusField.setDefaultValue(messageColour);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {
		// ���s���
		form.addFieldGroup('custpage_run_info', '���s���');
		form.addButton('custpage_refresh', '�X�V', 'refresh();');
		// ���s���̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('�o�b�`���������s��');
	}else{
		// ���s�����̏ꍇ
		form.addFieldGroup('custpage_run_info', '���s���');
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('�o�b�`�����������B�uDJ_�c�ƌv���񃌃|�[�g�X�V�v���N���b�N���ăy�[�W���X�V���Ă��������B<font color="red">�f�[�^�ʂ������ꍇ�͍X�V�x������������\��������܂��̂ŁA�{�^�����N���b�N������Ƀy�[�W���^�C�����[�ɍX�V����Ȃ��ꍇ�́A�蓮�Ńy�[�W���čX�V���Ă��������I </font>');
		form.addButton('custpage_refresh', 'DJ_�c�ƌv���񃌃|�[�g�X�V', 'parent.location.reload();');	
	}
	response.writePage(form);
}
function run(request, response) {
	var ctx = nlapiGetContext();
	var form = nlapiCreateForm('�t�@�C���A�b�v���[�h�������܂����B', false);
	form.setScript('customscript_djkk_cs_uploadfile');
	//form.addButton('btn_close', '����','close()')
	var fileFild = form.addField('custpage_file_id', 'text', '�t�@�C��ID').setDisplayType('hidden');
	form.addField('custpage_lable', 'label', '�t�@�C���A�b�v���[�h�������܂���')
	var fcCsvFile=request.getFile('custpage_file'); 
	fcCsvFile.setFolder(FILE_CABINET_ID_FC_CSV_UPLOAD_BP);
	var fcCsvfileId = nlapiSubmitFile(fcCsvFile);
	fileFild.setDefaultValue(fcCsvfileId);
//	nlapiGetContext().setSessionObject("session_upload_file_id",fcCsvfileId);
	nlapiLogExecution('debug', 'fcCsvfileId',fcCsvfileId);
	
	
	
	var scheduleparams = new Array();
	scheduleparams['custscript_djkk_csvid'] = JSON.stringify(fcCsvfileId);	
	runBatch('customscript_djkk_ss_fc_csv_upload_bp', 'customdeploy_djkk_ss_fc_csv_upload_bp',scheduleparams);
//	nlapiScheduleScript('customscript_djkk_ss_fc_csv_upload_bp', 'customdeploy_djkk_ss_fc_csv_upload_bp',scheduleparams)
	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
	
	response.writePage(form);
}