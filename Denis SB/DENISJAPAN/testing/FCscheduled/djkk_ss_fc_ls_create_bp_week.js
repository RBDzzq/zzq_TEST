/**
 * DJ_営業FC作成定期_LS_week
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Jul 2021     CPC_苑
 *
 */

/**
 * DJ_営業FC更新
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
    nlapiLogExecution('debug', 'DJ_営業FC作成定期_LS_week');
    // parameter: キャシューID
    var cacheId = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_fc_cache_table_so_id_lsw');
    // parameter: 日付
    var date = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_so_date_ls_week');
    // parametersをlogに出力
	nlapiLogExecution('debug', 'DJ_FC_キャッシュテーブルID:', cacheId);
	nlapiLogExecution('debug', 'DJ_基準日:', date);

    // parameters両方空出ない場合、処理を実施
    if(!isEmpty(cacheId) && !isEmpty(date)){
        // DJ_FC_キャッシュテーブルから、指定キャシューIDのレコードを取得
		var dataJsonString = nlapiLookupField('customrecord_djkk_forecast_cache_table', cacheId, 'custrecord_djkk_data_cache');
        // jsonに変換する
        var jsonData = JSON.parse(dataJsonString);
        // jsonデータ配列の件数を取得
        var jLen = jsonData.length;
        var flag = true;
        for (var i = 0; i < jLen; i++) {
        	var employeeId=jsonData[i].employee;
            // netsuiteのusageをチェックする
            governanceYield();
            // idが空の場合、未登録のデータと見なす
            if (isEmpty(jsonData[i].id)) {
                // fc数が空でない場合
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
            // id存在する場合、登録済のデータと見なす
            else {
                // fc数が空でない場合
                if (!isEmpty(jsonData[i].fcnum)) {
                	flag = false;
                    // 指定idのレコードを取得
                    var fcRecord=nlapiLoadRecord('customrecord_djkk_so_forecast_ls', jsonData[i].id);
                    // 入力FC数とテーブル既存FC数が異なる場合、更新と見なす
                    if (fcRecord.getFieldValue('custrecord_djkk_so_fc_ls_week_fcnum') != Number(jsonData[i].fcnum)) {
                        // 入力FC数をレコードフィールドに設定
                        fcRecord.setFieldValue('custrecord_djkk_so_fc_ls_week_fcnum', Number(jsonData[i].fcnum));
                    }
                    // 新しいFC数をテーブルに保存
                    nlapiSubmitRecord(fcRecord, false, true);
                }
            }
        }
        nlapiDeleteRecord('customrecord_djkk_forecast_cache_table', cacheId);
    }
    nlapiLogExecution('debug', 'DJ_SC課FC作成定期 END');
    nlapiLogExecution('debug', 'flag',flag);
}
