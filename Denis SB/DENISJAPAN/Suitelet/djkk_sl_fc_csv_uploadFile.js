/**
 * DJ_FC_csvアップロード_ls
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
			var form = nlapiCreateForm('ファイルアップロード', false);
			form.setScript('customscript_djkk_cs_uploadfile');
	
			var fileFild = form.addField('custpage_file', 'file', 'アップロードファイル');
			
			form.addSubmitButton('CSVアップロード');
			response.writePage(form);
		}
	}

}
function logForm(request, response) {
	
	var form = nlapiCreateForm('処理ステータス', false);
	form.setScript('customscript_djkk_cs_uploadfile');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_in_stock_send');
	if (batchStatus == 'FAILED') {
		// 実行情報
		form.addFieldGroup('custpage_run_info', '実行情報');
		// 実行失敗の場合
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> バッチ処理を失敗しました </font>';
		runstatusField.setDefaultValue(messageColour);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {
		// 実行情報
		form.addFieldGroup('custpage_run_info', '実行情報');
		form.addButton('custpage_refresh', '更新', 'refresh();');
		// 実行中の場合
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('バッチ処理を実行中');
	}else{
		// 実行完了の場合
		form.addFieldGroup('custpage_run_info', '実行情報');
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('バッチ処理を完了。「DJ_営業計画情報レポート更新」をクリックしてページを更新してください。<font color="red">データ量が多い場合は更新遅延が発生する可能性がありますので、ボタンをクリックした後にページがタイムリーに更新されない場合は、手動でページを再更新してください！ </font>');
		form.addButton('custpage_refresh', 'DJ_営業計画情報レポート更新', 'parent.location.reload();');	
	}
	response.writePage(form);
}
function run(request, response) {
	var ctx = nlapiGetContext();
	var form = nlapiCreateForm('ファイルアップロード完成しました。', false);
	form.setScript('customscript_djkk_cs_uploadfile');
	//form.addButton('btn_close', '閉じる','close()')
	var fileFild = form.addField('custpage_file_id', 'text', 'ファイルID').setDisplayType('hidden');
	form.addField('custpage_lable', 'label', 'ファイルアップロード完成しました')
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