/**営業FC週月判断
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jun 2022     geng
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	var str = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_business_fc_param1');//itemid
	var itemId = JSON.parse(str);
	var str2 = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_business_fc_param2');//営業FC週月判断
	var businessFc = JSON.parse(str2);
	var searchNewArr = new Array();
	//BP	
		var lsRecordSearch = nlapiSearchRecord("customrecord_djkk_person_registration_ls",null,
				[
				   ["custrecord_djkk_item_ls","anyof",itemId]
				], 
				[
				   new nlobjSearchColumn("internalid")
				]
				);
		if(!isEmpty(lsRecordSearch)){
			for(var i=0;i<lsRecordSearch.length;i++){
				var internalid = lsRecordSearch[i].getValue("internalid");
				nlapiSubmitField('customrecord_djkk_person_registration_ls', internalid, 'custrecord_djkk_business_judgmen_fc',businessFc, false);
			}
		}

	//week --> month
	if(businessFc == 2){
		var fcWeekSearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
				[
				   ["custrecord_djkk_so_fc_ls_item","anyof",itemId]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_subsidiary",null,"GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_item",null,"GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_location_area",null,"GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_employee",null,"GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_year",null,"GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_month",null,"GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_week_fcnum",null,"SUM")
				]
				);
		//検索値の保存
		if(!isEmpty(fcWeekSearch)){
			for(var f=0;f<fcWeekSearch.length;f++){
			var sub = fcWeekSearch[f].getValue("custrecord_djkk_so_fc_ls_subsidiary",null,"GROUP");
			var item = fcWeekSearch[f].getValue("custrecord_djkk_so_fc_ls_item",null,"GROUP");
			var location = fcWeekSearch[f].getValue("custrecord_djkk_so_fc_ls_location_area",null,"GROUP");
			var employee = fcWeekSearch[f].getValue("custrecord_djkk_so_fc_ls_employee",null,"GROUP");
			var year = fcWeekSearch[f].getValue("custrecord_djkk_so_fc_ls_year",null,"GROUP");
			var month = fcWeekSearch[f].getValue("custrecord_djkk_so_fc_ls_month",null,"GROUP");

			var week = Number(fcWeekSearch[f].getValue("custrecord_djkk_so_fc_ls_week_fcnum",null,"SUM"));
			searchNewArr.push({
				'sub':sub,
				'item':item,
				'location':location,
				'employee':employee,
				'year':year,
				'month':month,
				'week':week	
			})
		  }
		}
		//テーブル内のデータの削除
		var fcDeleteSearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
				[
				   ["custrecord_djkk_so_fc_ls_item","anyof",itemId]
				], 
				[
				   new nlobjSearchColumn("internalid")
				]
				);
		if(!isEmpty(fcDeleteSearch)){
			for(var a=0;a<fcDeleteSearch.length;a++){
				try{
					var id = nlapiDeleteRecord('customrecord_djkk_so_forecast_ls', fcDeleteSearch[a].getValue("internalid"));	
				}catch(error){
					nlapiLogExecution('ERROR', '削除できないID'+fcDeleteSearch[a].getValue("internalid"), error.message);
			   }
			}
		}
		//検索値を保存してテーブルに保存
		for(var j=0;j<searchNewArr.length;j++){
			var record = nlapiCreateRecord('customrecord_djkk_so_forecast_ls');
			record.setFieldValue('custrecord_djkk_so_fc_ls_subsidiary', searchNewArr[j].sub);
			record.setFieldValue('custrecord_djkk_so_fc_ls_item', searchNewArr[j].item);
			record.setFieldValue('custrecord_djkk_so_fc_ls_location_area', searchNewArr[j].location);
			record.setFieldValue('custrecord_djkk_so_fc_ls_employee', searchNewArr[j].employee);
			record.setFieldValue('custrecord_djkk_so_fc_ls_year', searchNewArr[j].year);
			record.setFieldValue('custrecord_djkk_so_fc_ls_month', searchNewArr[j].month);
			record.setFieldValue('custrecord_djkk_so_fc_ls_fcnum', searchNewArr[j].week);
			var id = nlapiSubmitRecord(record, true);
		}
	}else{
		//month---->week
		//1.具体的な年、月、月のデータを取得できる
		//年を通じて、その年に対応する週数と対応する開始終了日を取得して配列に保存する。
		var days = 0;
		var weekArr = new Array();
		var nowMonthArr = new Array();
		var nowMonthWeekArr = new Array();
		var fcMonthSearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
				[
				   ["custrecord_djkk_so_fc_ls_item","anyof",itemId]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_subsidiary"), 
			       new nlobjSearchColumn("custrecord_djkk_so_fc_ls_item"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_location_area"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_employee"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_year"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_month"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_fcnum")  
				]
				);
//			var year = '';
//			var month = '';
//			var monthNum = '';
//			var sub='';
//			var item = '';
//			var location='';
//			var employee = '';
		//テーブル内のデータの削除
		var fcDeleteSearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
				[
				   ["custrecord_djkk_so_fc_ls_item","anyof",itemId]
				], 
				[
				   new nlobjSearchColumn("internalid")
				]
				);
		if(!isEmpty(fcDeleteSearch)){
			for(var a=0;a<fcDeleteSearch.length;a++){
				try{
					var id = nlapiDeleteRecord('customrecord_djkk_so_forecast_ls', fcDeleteSearch[a].getValue("internalid"));	
				}catch(error){
					nlapiLogExecution('ERROR', '削除できないID'+fcDeleteSearch[a].getValue("internalid"), error.message);
			   }
			}
		}
		
		if(!isEmpty(fcMonthSearch)){
			nlapiLogExecution('debug', 'fcMonthSearch.length', fcMonthSearch.length);
			for(var k=0;k<fcMonthSearch.length;k++){
				nlapiLogExecution('debug', 'fcMonthSearch', k);
				var year = Number(fcMonthSearch[k].getValue("custrecord_djkk_so_fc_ls_year"));
				var month = Number(fcMonthSearch[k].getValue("custrecord_djkk_so_fc_ls_month"));
				nlapiLogExecution('debug', 'month'+k, month);
				var monthNum = Number(fcMonthSearch[k].getValue("custrecord_djkk_so_fc_ls_fcnum"));
				var sub = fcMonthSearch[k].getValue("custrecord_djkk_so_fc_ls_subsidiary");
				var item = fcMonthSearch[k].getValue("custrecord_djkk_so_fc_ls_item");
				var location = fcMonthSearch[k].getValue("custrecord_djkk_so_fc_ls_location_area");
				var employee = fcMonthSearch[k].getValue("custrecord_djkk_so_fc_ls_employee");
			    var lastDay = new Date(year + 1,0,0); //一年の最終日
			    var firstDay = new Date(year,0,1); // 一年のstart日
			    var obj = [];
			    var index = 0;
			    var day = new Date(year,0,1);
			    function formatDate(d){
			        return d.toLocaleDateString('ja-jp',{year: 'numeric', month: '2-digit',day: '2-digit'}).replace(/\//g,'-');
			    }
			    while (day < lastDay){			        
			        if(day.getDay() === 6){
			        	var temp = []; //ほじょはいれつ
			            temp[0] = firstDay.getFullYear() + "-"+ (firstDay.getMonth() + 1) +"-"+ firstDay.getDate();
			            temp[1] = day.getFullYear() + "-"+ (day.getMonth() + 1) +"-"+ day.getDate();
			            obj[(index++)]=temp;
			            firstDay = new Date(day.getTime() + 86400000);
			        }       
			        day.setDate(day.getDate() + 1);
			    }
			    if(day !== lastDay){
			        	var temp = []; //ほじょはいれつ
			            temp[0] = firstDay.getFullYear() + "-"+ (firstDay.getMonth() + 1) +"-"+ firstDay.getDate();
			            temp[1] = day.getFullYear() + "-"+ (day.getMonth() + 1) +"-"+ day.getDate();
			            obj[(index++)]=temp;
			    }
				//2.年と月を検索条件として、配列内のその月に対応する週数と具体的な週数を取得する
				var yearMonth = year+'-'+month;
				var b = 0;
				for(var a = 0; a < obj.length; a++){
					var objStart = obj[a][0].split('-');
					var objS = objStart[0]+'-'+objStart[1];
					var objEnd = obj[a][1].split('-');
					var objE = objEnd[0]+'-'+objEnd[1];
							if(objS==yearMonth|| objE==yearMonth){//今月の週まで取得
							var temp = [];
							temp[0] = a+1;
							temp[1] = obj[a];
							nowMonthArr[b]=temp;
							b++;
//							if(obj[a][0].indexOf(yearMonth)!=-1 || obj[a][1].indexOf(yearMonth)!=-1)//今月の週まで取得
								
					}
				}				
				//3.週に何日対応するかを取得する
				nlapiLogExecution('debug', 'nowMonthArr.length',nowMonthArr.length);
				for(var c = 0; c < nowMonthArr.length; c++){
					if(c == 0){
						var end = String(nowMonthArr[c][1]);
						var endStart = end.split(',');
						var endStartTo = endStart[1].split('-');
						var endDate = endStartTo[2]
						nowMonthWeekArr.push(endDate);
					}
					if(c != 0 && c != nowMonthArr.length-1){
						nowMonthWeekArr.push(7);
					}
					if(c == nowMonthArr.length-1){
						var start = String(nowMonthArr[c][1]);
						var startTO = start.split(',');
						var startEnd = startTO[0].split('-');
						var startYear = Number(startEnd[0]);
						var startMonth = Number(startEnd[1]);
						var startDate = Number(startEnd[2]);
						days = new Date(startYear, startMonth, 0).getDate()
						var dayAll = days - startDate+1;
						nowMonthWeekArr.push(dayAll);
					}
				}
				//4.毎日対応する月数を取得
				var dayCon =(monthNum/days).toFixed(3);
				
			//5.テーブルへのデータの追加
				nlapiLogExecution('debug', 'month',month);
				for(var h = 0; h < nowMonthArr.length; h++){
						var yearN = String(year);
						var monthN = String(month);
						var weekNo=String(nowMonthArr[h][0]);//week
						var weekNumber=nowMonthWeekArr[h]*dayCon;//weekUmber
						var record = nlapiCreateRecord('customrecord_djkk_so_forecast_ls');
						record.setFieldValue('custrecord_djkk_so_fc_ls_subsidiary', sub);
						record.setFieldValue('custrecord_djkk_so_fc_ls_item', item);
						record.setFieldValue('custrecord_djkk_so_fc_ls_location_area', location);
						record.setFieldValue('custrecord_djkk_so_fc_ls_employee', employee);
						record.setFieldValue('custrecord_djkk_so_fc_ls_year', yearN);
						record.setFieldValue('custrecord_djkk_so_fc_ls_month', monthN);
						record.setFieldValue('custrecord_djkk_so_fc_ls_week', weekNo);
						record.setFieldValue('custrecord_djkk_so_fc_ls_yearmonthweek', yearN+'-'+monthN+'('+weekNo+')');
						record.setFieldValue('custrecord_djkk_so_fc_ls_week_fcnum', weekNumber);
						var id = nlapiSubmitRecord(record, true);	
		  }
		}
	  }	
    }

}
