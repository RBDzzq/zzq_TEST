/**
 *  DJ_SC課FC作成ss
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/18     CPC_
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	var now = getSystemTime()
	nlapiLogExecution('debug', 'DJ_SC課FC作成ss Start',now);
	var reportPeriodId = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_forecast_cache_table_id');
	var date = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_date');
	nlapiLogExecution('debug', 'DJ_FC_キャッシュテーブルID:', reportPeriodId);
	nlapiLogExecution('debug', 'DJ_基準日:', date);
	if(!isEmpty(reportPeriodId)&&!isEmpty(date)){
        var referenceDate=dateAddDays(date, -7);	
		var changeDate = dateAddDays(date, -7*27);
		var dateArray = new Array();
		var systemDate=nlapiDateToString(getSystemTime());
		for (var da = 0; da < 54; da++) {
			var dateweek = newGetYearWeek(changeDate);
			var pushyear = getYear(changeDate);
			var pushdateS = getSunday(changeDate,false);
			var pushdateE = dateAddDays(pushdateS, 6);
//			if (dateweek == '52') {
//				dateweek = '1';
//				pushyear = Number(pushyear) + 1;
//			} else if(dateweek == '53'){
//				dateweek = '2';
//				pushyear = Number(pushyear) + 1;
//			}else {
//				dateweek = Number(dateweek) + 1;
//			}
			if(Number(dateweek)<10){
				dateweek='0'+dateweek;
			}
			var weekNumber=pushyear+'-'+dateweek;
			dateArray.push(weekNumber);
			changeDate = dateAddDays(changeDate, 7);
		}
		
		//DJ_FC_キャッシュテーブル
		var dataJsonString=nlapiLookupField('customrecord_djkk_forecast_cache_table', reportPeriodId, 'custrecord_djkk_data_cache');
		var jsonDate = eval("(" + dataJsonString + ")");
		for (var i = 0; i < jsonDate.length; i++) {
			governanceYield();
			var subsidiary = jsonDate[i]['subsidiary'];
			var itemInternalid = jsonDate[i]['itemInternalid'];
			var itemLocationId = jsonDate[i]['itemLocationId'];
			for (var indate = 0; indate < 54; indate++) {
				governanceYield();
				var fcId = jsonDate[i][dateArray[indate]]['fcId'];
				var year = jsonDate[i][dateArray[indate]]['Year'];
				var week = jsonDate[i][dateArray[indate]]['Week'];
				var startDate = jsonDate[i][dateArray[indate]]['StartDate'];
				var endDate = jsonDate[i][dateArray[indate]]['EndDate'];
				var inAdd = jsonDate[i][dateArray[indate]]['InAdd'];
				var inLess = jsonDate[i][dateArray[indate]]['InLess'];
				var dateIN = Number(jsonDate[i][dateArray[indate]]['ActualIN'])+Number(inAdd)-Number(inLess);
				var dateOut = jsonDate[i][dateArray[indate]]['ForecastOut'];
				var balance = jsonDate[i][dateArray[indate]]['Balance'];
				var comment = jsonDate[i][dateArray[indate]]['Comment'];
				
				var month=nlapiStringToDate(startDate).getMonth()+1;
				if(month<10){
					month='0'+month;
				}else if(month=='12'){
					var endMonth=nlapiStringToDate(endDate).getMonth()+1;
					if(endMonth=='1'){
						month='01';
					}
				}
				var yearMonthWeek=year+'-'+month+'('+week+')';
				
				if (!isEmpty(fcId)) {
					var scFcRecord=nlapiLoadRecord('customrecord_djkk_sc_forecast', fcId);
					var scFcInAdd=scFcRecord.getFieldValue('custrecord_djkk_sc_fc_add');
					var scFcInLess=scFcRecord.getFieldValue('custrecord_djkk_sc_fc_minus');
//					var scFcInAdd=scFcRecord.getFieldValue('custrecord_djkk_sc_fc_add');
//					var scFcInLess=scFcRecord.getFieldValue('custrecord_djkk_sc_fc_minus');
					var scFcIN=scFcRecord.getFieldValue('custrecord_djkk_sc_fc_in');
					var scFcOut=scFcRecord.getFieldValue('custrecord_djkk_sc_fc_out');
					var scFcBalance=scFcRecord.getFieldValue('custrecord_djkk_sc_fc_balance');
					var scFcComment=scFcRecord.getFieldValue('custrecord_djkk_sc_fc_comment');
					
					// 更新
					if(scFcInAdd!=inAdd||scFcInLess!=inLess||scFcIN!=dateIN||scFcOut!=dateOut||scFcComment!=comment||scFcBalance != balance){
						if (scFcInAdd != inAdd) {
							scFcRecord.setFieldValue('custrecord_djkk_sc_fc_add', inAdd);
						}
						if (scFcInLess != inLess) {
							scFcRecord.setFieldValue('custrecord_djkk_sc_fc_minus', inLess);
						}
						if (scFcIN!=dateIN) {
							scFcRecord.setFieldValue('custrecord_djkk_sc_fc_in', dateIN);
						}
						if (scFcOut!=dateOut) {
							scFcRecord.setFieldValue('custrecord_djkk_sc_fc_out', dateOut);
						}
						if (scFcBalance != balance) {
							scFcRecord.setFieldValue('custrecord_djkk_sc_fc_balance', balance);
						}
						if (scFcComment != comment&&comment!='- None -') {
							scFcRecord.setFieldValue('custrecord_djkk_sc_fc_comment', comment);
						}
						nlapiSubmitRecord(scFcRecord, false, true);
					}
				} else {
					if(!isEmpty(inAdd)||!isEmpty(inLess)||!isEmpty(comment)){
						var creatScFcRecord=nlapiCreateRecord('customrecord_djkk_sc_forecast');
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_subsidiary', subsidiary);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_item', itemInternalid);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_location_area', itemLocationId);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_year', year);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_week', week);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_yearmonthweek', yearMonthWeek);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_startdate', startDate);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_enddate', endDate);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_add', inAdd);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_minus', inLess);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_in', dateIN);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_out', dateOut);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_balance', balance);
						creatScFcRecord.setFieldValue('custrecord_djkk_sc_fc_comment', comment);
						nlapiSubmitRecord(creatScFcRecord, false, true);
					}
				}			
			}
		}
		nlapiDeleteRecord('customrecord_djkk_forecast_cache_table', reportPeriodId);
	}	
	nlapiLogExecution('debug', 'DJ_SC課FC作成ss END');
}