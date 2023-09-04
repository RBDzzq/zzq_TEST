/**
 * DJ_�c��FC�쐬���_LS_week
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Jul 2021     CPC_��
 *
 */

/**
 * DJ_�c��FC�X�V
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
    nlapiLogExecution('debug', 'DJ_�c��FC�쐬���_LS_week');
    // parameter: �L���V���[ID
    var cacheId = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_fc_cache_table_so_id_lsw');
    // parameter: ���t
    var date = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_so_date_ls_week');
    // parameters��log�ɏo��
	nlapiLogExecution('debug', 'DJ_FC_�L���b�V���e�[�u��ID:', cacheId);
	nlapiLogExecution('debug', 'DJ_���:', date);

    // parameters������o�Ȃ��ꍇ�A���������{
    if(!isEmpty(cacheId) && !isEmpty(date)){
        // DJ_FC_�L���b�V���e�[�u������A�w��L���V���[ID�̃��R�[�h���擾
		var dataJsonString = nlapiLookupField('customrecord_djkk_forecast_cache_table', cacheId, 'custrecord_djkk_data_cache');
        // json�ɕϊ�����
        var jsonData = JSON.parse(dataJsonString);
        // json�f�[�^�z��̌������擾
        var jLen = jsonData.length;
        var flag = true;
        for (var i = 0; i < jLen; i++) {
        	var employeeId=jsonData[i].employee;
            // netsuite��usage���`�F�b�N����
            governanceYield();
            // id����̏ꍇ�A���o�^�̃f�[�^�ƌ��Ȃ�
            if (isEmpty(jsonData[i].id)) {
                // fc������łȂ��ꍇ
                if (!isEmpty(jsonData[i].fcnum)) {
                    var creatScFcRecord = nlapiCreateRecord('customrecord_djkk_so_forecast_ls');
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_subsidiary', jsonData[i].subsidiary);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_item', jsonData[i].item);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_location_area', jsonData[i].locationArea);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_year', jsonData[i].year);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_month', jsonData[i].month);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_week', jsonData[i].week);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_yearmonthweek', jsonData[i].year+'-'+jsonData[i].month+'('+jsonData[i].week+')');                 
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_employee', employeeId);
                    creatScFcRecord.setFieldValue('custrecord_djkk_delivery_in_sheet', jsonData[i].delivery);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_week_fcnum', Number(jsonData[i].fcnum));
                    nlapiSubmitRecord(creatScFcRecord, false, true);
                }else{
                	 var creatScFcRecord = nlapiCreateRecord('customrecord_djkk_so_forecast_ls');
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_subsidiary', jsonData[i].subsidiary);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_item', jsonData[i].item);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_location_area', jsonData[i].locationArea);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_year', jsonData[i].year);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_month', jsonData[i].month);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_week', jsonData[i].week);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_yearmonthweek', jsonData[i].year+'-'+jsonData[i].month+'('+jsonData[i].week+')');
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_employee', employeeId);
                     creatScFcRecord.setFieldValue('custrecord_djkk_delivery_in_sheet', jsonData[i].delivery);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_week_fcnum', '');
                     nlapiSubmitRecord(creatScFcRecord, false, true);
                }
//                     var forecast_Search = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
//                    		 [
//                    		    ["custrecord_djkk_so_fc_ls_item","anyof",jsonData[i].item], 
//                    		    "AND", 
//                    		    ["custrecord_djkk_so_fc_ls_subsidiary","anyof",jsonData[i].subsidiary], 
//                    		    "AND", 
//                    		    ["custrecord_djkk_so_fc_ls_location_area","anyof",jsonData[i].locationArea], 
//                    		    "AND", 
//                    		    ["custrecord_djkk_so_fc_ls_year","is",jsonData[i].year],
//                    		    "AND", 
//                    		    ["formulanumeric: TO_NUMBER({custrecord_djkk_so_fc_ls_week})+1","equalto",Number(jsonData[i].week)]
//                    		 ], 
//                    		 [
//                    		    new nlobjSearchColumn("scriptid").setSort(false), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_subsidiary"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_item"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_location_area"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_year"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_month"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_employee"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_fcnum")
//                    		 ]
//                    		 );
//                    		 if(isEmpty(forecast_Search)){
//                    			 var creatScFcRecord = nlapiCreateRecord('customrecord_djkk_so_forecast_ls');
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_subsidiary', jsonData[i].subsidiary);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_item', jsonData[i].item);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_location_area', jsonData[i].locationArea);
//                                 var year=jsonData[i].year;
//                                 var month=jsonData[i].month;
//                               /*error
//                                 if(month=='1'){
//                                	 month='12';
//                                	 year=Number(year)-1;
//                                	 // TODO
//                                 }else{
//                                	 if(Number(month)<10){
//                                		 month='0'+(Number(month)-1).toString();
//                                	 }else{
//                                		 month=(Number(month)-1).toString(); 
//                                	 }
//                                 
//                                	 // TODO
//                                 }
//                                */
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_year',year);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_month',month);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_week', jsonData[i].week-1);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_employee', employeeId);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_yearmonthweek', year+'-'+month+'('+Number(jsonData[i].week-1)+')');
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_week_fcnum', '');
//                                 nlapiSubmitRecord(creatScFcRecord, false, true);
//                    		 }
                     
                
            } 
            // id���݂���ꍇ�A�o�^�ς̃f�[�^�ƌ��Ȃ�
            else {
                // fc������łȂ��ꍇ
                if (!isEmpty(jsonData[i].fcnum)) {
                	flag = false;
                    // �w��id�̃��R�[�h���擾
                    var fcRecord=nlapiLoadRecord('customrecord_djkk_so_forecast_ls', jsonData[i].id);
                    // ����FC���ƃe�[�u������FC�����قȂ�ꍇ�A�X�V�ƌ��Ȃ�
                    if (fcRecord.getFieldValue('custrecord_djkk_so_fc_ls_week_fcnum') != Number(jsonData[i].fcnum)) {
                        // ����FC�������R�[�h�t�B�[���h�ɐݒ�
                        fcRecord.setFieldValue('custrecord_djkk_so_fc_ls_week_fcnum', Number(jsonData[i].fcnum));
                    }
                    // �V����FC�����e�[�u���ɕۑ�
                    nlapiSubmitRecord(fcRecord, false, true);
                }
            }
        }
        nlapiDeleteRecord('customrecord_djkk_forecast_cache_table', cacheId);
    }
    nlapiLogExecution('debug', 'DJ_SC��FC�쐬��� END');
    nlapiLogExecution('debug', 'flag',flag);
}
