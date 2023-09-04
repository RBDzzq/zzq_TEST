/**
 * DJ_営業FC作成定期
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
    nlapiLogExecution('debug', 'DJ_販売計画情報 Start');
    // parameter: キャシューID
    var cacheId = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_fc_cache_table_so_id');
    // parameter: 日付
    var date = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_so_date');
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
        for (var i = 0; i < jLen; i++) {
        	nlapiLogExecution('debug', 'jsonData[i].memo:', jsonData[i].memo);
        	nlapiLogExecution('debug', 'jsonData[i].fcnum:', jsonData[i].fcnum);
        	nlapiLogExecution('debug', 'jsonData[i].id', jsonData[i].id);
            // netsuiteのusageをチェックする
            governanceYield();
            // idが空の場合、未登録のデータと見なす
            if (isEmpty(jsonData[i].id)) {
                // fc数が空でない場合
                if (!isEmpty(jsonData[i].fcnum)) {
                    var creatScFcRecord = nlapiCreateRecord('customrecord_djkk_so_forecast');
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_subsidiary', jsonData[i].subsidiary);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_item', jsonData[i].item);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_location_area', jsonData[i].locationArea);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_year', jsonData[i].year);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_month', jsonData[i].month);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_employee', jsonData[i].employee);
                    creatScFcRecord.setFieldValue('custrecord_djkk_memo', defaultEmpty(jsonData[i].memo));
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_fcnum', Number(jsonData[i].fcnum));
                    nlapiSubmitRecord(creatScFcRecord, false, true);
                }else{
                	var creatScFcRecord = nlapiCreateRecord('customrecord_djkk_so_forecast');
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_subsidiary', jsonData[i].subsidiary);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_item', jsonData[i].item);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_location_area', jsonData[i].locationArea);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_year', jsonData[i].year);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_month', jsonData[i].month);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_employee', jsonData[i].employee);
                    creatScFcRecord.setFieldValue('custrecord_djkk_memo', defaultEmpty(jsonData[i].memo));
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_fcnum', '');
                    nlapiSubmitRecord(creatScFcRecord, false, true);
                }
//                    var forecast_Search = nlapiSearchRecord("customrecord_djkk_so_forecast",null,
//                    		[
//                    		   ["custrecord_djkk_so_fc_item","anyof",jsonData[i].item], 
//                    		   "AND", 
//                    		   ["custrecord_djkk_so_fc_subsidiary","anyof",jsonData[i].subsidiary], 
//                    		   "AND", 
//                    		   ["custrecord_djkk_so_fc_location_area","anyof",jsonData[i].locationArea], 
//                    		   "AND", 
//                    		   ["custrecord_djkk_so_fc_year","is",jsonData[i].year], 
//                    		   "AND", 
//                    		   ["formulanumeric: TO_NUMBER({custrecord_djkk_so_fc_month})+1","equalto",jsonData[i].month]
//                    		], 
//                    		[
//                    		   new nlobjSearchColumn("scriptid").setSort(false), 
//                    		   new nlobjSearchColumn("custrecord_djkk_so_fc_subsidiary"), 
//                    		   new nlobjSearchColumn("custrecord_djkk_so_fc_item"), 
//                    		   new nlobjSearchColumn("custrecord_djkk_so_fc_location_area"), 
//                    		   new nlobjSearchColumn("custrecord_djkk_so_fc_year"), 
//                    		   new nlobjSearchColumn("custrecord_djkk_so_fc_month"), 
//                    		   new nlobjSearchColumn("custrecord_djkk_so_fc_employee"), 
//                    		   new nlobjSearchColumn("custrecord_djkk_memo"),
//                    		   new nlobjSearchColumn("custrecord_djkk_so_fc_fcnum")
//                    		]
//                    		);
//                    if(isEmpty(forecast_Search)){
//                    	var creatScFcRecord = nlapiCreateRecord('customrecord_djkk_so_forecast');
//                        creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_subsidiary', jsonData[i].subsidiary);
//                        creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_item', jsonData[i].item);
//                        creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_location_area', jsonData[i].locationArea);
//                        var year=jsonData[i].year;//'2024'
//                        var month=jsonData[i].month;
//                        if(month=='1'){
//                       	 month='12';
//                       	 year=Number(year)-1;//2023.0
//                        }else{
//                       	 month=(Number(month)-1).toString();
//                        }
//                        creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_year', year);//2023.0
//                        creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_month', month);//12
//                        creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_fcnum', '');//
//                        nlapiSubmitRecord(creatScFcRecord, false, true);
//                    }
                    
                
            } 
            // id存在する場合、登録済のデータと見なす
            else {
                // fc数が空でない場合
                if (!isEmpty(jsonData[i].fcnum)) {
                    // 指定idのレコードを取得
                    var fcRecord=nlapiLoadRecord('customrecord_djkk_so_forecast', Number(jsonData[i].id));
                    // 入力FC数とテーブル既存FC数が異なる場合、更新と見なす
                    if (fcRecord.getFieldValue('custrecord_djkk_so_fc_fcnum') != Number(jsonData[i].fcnum)) {
                        // 入力FC数をレコードフィールドに設定
                        fcRecord.setFieldValue('custrecord_djkk_so_fc_fcnum', Number(jsonData[i].fcnum));
                        fcRecord.setFieldValue('custrecord_djkk_memo', defaultEmpty(jsonData[i].memo));
                    }else{
                    	nlapiLogExecution('debug', '!isEmpty',jsonData[i].fcnum);
                    	fcRecord.setFieldValue('custrecord_djkk_memo', defaultEmpty(jsonData[i].memo));
                    }
                }else{
                	var fcRecord=nlapiLoadRecord('customrecord_djkk_so_forecast', Number(jsonData[i].id));
                	nlapiLogExecution('debug', 'isEmpty',jsonData[i].fcnum);
                	fcRecord.setFieldValue('custrecord_djkk_memo', defaultEmpty(jsonData[i].memo));
                }
             // 新しいFC数をテーブルに保存
                nlapiSubmitRecord(fcRecord, false, true);
            }
        }
        nlapiDeleteRecord('customrecord_djkk_forecast_cache_table', cacheId)
    }
    nlapiLogExecution('debug', 'DJ_販売計画情報作成定期 END');
}
function defaultEmpty(src){
	return src || '';
}