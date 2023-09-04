/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/12/05     CPC_苑
 *
 */

/**
 * @param {String}
 *            type Context Types: scheduled, ondemand, userinterface, aborted,
 *            skipped
 * @returns {Void}
 */
function scheduled(type) {

	// sendmail_type
	var sendmailtype = nlapiGetContext().getSetting('SCRIPT',
			'custscript_djkk_sendmail_type');

	// 会社
	var mainsubsidiary = nlapiGetContext().getSetting('SCRIPT',
			'custscript_djkk_send_mail_subsidiary');

	nlapiLogExecution('debug', 'sendmailtype', sendmailtype + '|'
			+ mainsubsidiary);

	if (sendmailtype == '出荷予実比較レポート送信') {

		nlapiLogExecution('debug', '出荷予実比較レポート送信', 'start');
		
		// 1week
		var infoSearchone = nlapiSearchRecord(
				"customrecord_djkk_mail_send_info",
				null,
				[
						[ "custrecord_djkk_mail_subsidiary", "anyof",
								mainsubsidiary ],
						"AND",
						[ "formulatext: {custrecord_djkk_mail_kinou_name}",
								"contains", "出荷予実比較レポート送信機能_1Week" ] ],
				[
						new nlobjSearchColumn("custrecord_djkk_mail_sender"),
						new nlobjSearchColumn("custrecord_djkk_mail_recipients"),
						new nlobjSearchColumn("custrecord_djkk_mail_title") ]);
		var fileoneweek = outReportOneWeek(mainsubsidiary);

		var infoObjOne = {
			'sender' : infoSearchone[0].getValue('custrecord_djkk_mail_sender'),
			'recipients' : infoSearchone[0]
					.getValue('custrecord_djkk_mail_recipients'),
			'title' : infoSearchone[0].getValue('custrecord_djkk_mail_title')
		};

		// 送信
		sndActualForecastMail(true, fileoneweek, infoObjOne);

		governanceYield();

		// 4week
		var infoSearchfour = nlapiSearchRecord(
				"customrecord_djkk_mail_send_info",
				null,
				[
						[ "custrecord_djkk_mail_subsidiary", "anyof",
								mainsubsidiary ],
						"AND",
						[ "formulatext: {custrecord_djkk_mail_kinou_name}",
								"contains", "出荷予実比較レポート送信機能_4Weeks" ] ],
				[
						new nlobjSearchColumn("custrecord_djkk_mail_sender"),
						new nlobjSearchColumn("custrecord_djkk_mail_recipients"),
						new nlobjSearchColumn("custrecord_djkk_mail_title") ]);

		var filefourweek = outReportFourWeek(mainsubsidiary);

		var infoObjFour = {
			'sender' : infoSearchfour[0]
					.getValue('custrecord_djkk_mail_sender'),
			'recipients' : infoSearchfour[0]
					.getValue('custrecord_djkk_mail_recipients'),
			'title' : infoSearchfour[0].getValue('custrecord_djkk_mail_title')
		};

		// 送信
		sndActualForecastMail(false, filefourweek, infoObjFour);

	} else if (sendmailtype == '日次FC更新情報送信') {

		nlapiLogExecution('debug', '日次FC更新情報送信', 'start');
		var lastmodified='yesterday';//thisyear
		var dataObj = {};

		dataObj['headertime'] = nlapiDateToString(getSystemTime());

		var fcmainSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast",
				null, [
						[ "isinactive", "is", "F" ],
						"AND",
						[ "lastmodified", "within", lastmodified ],
						"AND",
						[ "custrecord_djkk_sc_fc_subsidiary", "anyof",
								mainsubsidiary ] ], [
						new nlobjSearchColumn("lastmodifiedby", null, "GROUP"),
						new nlobjSearchColumn("class",
								"CUSTRECORD_DJKK_SC_FC_ITEM", "GROUP"),
						new nlobjSearchColumn(
								"custrecord_djkk_sc_fc_location_area", null,
								"GROUP") ]);
		if (!isEmpty(fcmainSearch)) {

			var headerAry = [];

			for (var i = 0; i < fcmainSearch.length; i++) {

				var lastmodifiedby = fcmainSearch[i].getText("lastmodifiedby",
						null, "GROUP");
				var classValue = fcmainSearch[i].getText("class",
						"CUSTRECORD_DJKK_SC_FC_ITEM", "GROUP");
				var locationArea = fcmainSearch[i].getText(
						"custrecord_djkk_sc_fc_location_area", null, "GROUP");

				headerAry.push({
					'lastmodifiedby' : lastmodifiedby,
					'classValue' : classValue,
					'locationArea' : locationArea
				});

			}
			dataObj['headerAry'] = headerAry;
		}

		var forecastSearchdetil = nlapiSearchRecord(
				"customrecord_djkk_sc_forecast",
				null,
				[
						[ "isinactive", "is", "F" ],
						"AND",
						[ "lastmodified", "within", lastmodified ],
						"AND",
						[ "custrecord_djkk_sc_fc_subsidiary", "anyof",
								mainsubsidiary ] ],
				[
						new nlobjSearchColumn("itemid",
								"CUSTRECORD_DJKK_SC_FC_ITEM", "GROUP"),
						new nlobjSearchColumn("displayname",
								"CUSTRECORD_DJKK_SC_FC_ITEM", "GROUP"),
						new nlobjSearchColumn(
								"custrecord_djkk_sc_fc_location_area", null,
								"GROUP"),
						new nlobjSearchColumn("custrecord_djkk_sc_fc_in", null,
								"SUM"),
						new nlobjSearchColumn(
								"custrecord_djkk_sc_fc_startdate", null, "MIN"),
						new nlobjSearchColumn("custrecord_djkk_sc_fc_enddate",
								null, "MAX"),
						new nlobjSearchColumn("formulanumeric", null, "SUM")
								.setFormula("1"),
						new nlobjSearchColumn(
								"custrecord_djkk_sc_fc_subsidiary", null,
								"GROUP") ]);
		if (!isEmpty(forecastSearchdetil)) {

			var lineAry = [];

			for (var i = 0; i < forecastSearchdetil.length; i++) {
				var column = forecastSearchdetil[0].getAllColumns();

				lineAry.push({
					'st' : forecastSearchdetil[i].getValue(column[0]),
					'de' : forecastSearchdetil[i].getValue(column[1]),
					'wa' : forecastSearchdetil[i].getText(column[2]),
					'tr' : forecastSearchdetil[i].getValue(column[3]),
					'fr' : forecastSearchdetil[i].getValue(column[4]),
					'to' : forecastSearchdetil[i].getValue(column[5]),
					'we' : forecastSearchdetil[i].getValue(column[6])
				});
			}

			dataObj['lineAry'] = lineAry;
		}

		var forecastsalemanSearch = nlapiSearchRecord(
				"customrecord_djkk_sc_forecast",
				null,
				[
						[ "isinactive", "is", "F" ],
						"AND",
						[ "lastmodified", "within", lastmodified ],
						"AND",
						[ "custrecord_djkk_sc_fc_subsidiary", "anyof",
								mainsubsidiary ] ],
				[
						new nlobjSearchColumn("itemid",
								"CUSTRECORD_DJKK_SC_FC_ITEM", "GROUP"),
						new nlobjSearchColumn("displayname",
								"CUSTRECORD_DJKK_SC_FC_ITEM", "GROUP"),
						new nlobjSearchColumn(
								"custrecord_djkk_sc_fc_location_area", null,
								"GROUP"),
						new nlobjSearchColumn("custrecord_djkk_sc_fc_in", null,
								"SUM"),
						new nlobjSearchColumn(
								"custrecord_djkk_sc_fc_startdate", null, "MIN"),
						new nlobjSearchColumn("custrecord_djkk_sc_fc_enddate",
								null, "MAX"),
						new nlobjSearchColumn("formulanumeric", null, "SUM")
								.setFormula("1"),
						new nlobjSearchColumn("lastmodifiedby", null, "GROUP"),
						new nlobjSearchColumn(
								"custrecord_djkk_sc_fc_subsidiary", null,
								"GROUP") ]);
		if (!isEmpty(forecastsalemanSearch)) {

			var lineAry2 = [];

			for (var x = 0; x < forecastsalemanSearch.length; x++) {
				var column2 = forecastsalemanSearch[0].getAllColumns();
				lineAry2.push({
					'sa' : forecastsalemanSearch[x].getText(column2[7]),
					'st' : forecastsalemanSearch[x].getValue(column2[0]),
					'de' : forecastsalemanSearch[x].getValue(column2[1]),
					'wa' : forecastsalemanSearch[x].getText(column2[2]),
					'tr' : forecastsalemanSearch[x].getValue(column2[3]),
					'fr' : forecastsalemanSearch[x].getValue(column2[4]),
					'to' : forecastsalemanSearch[x].getValue(column2[5]),
					'we' : forecastsalemanSearch[x].getValue(column2[6])
				});

			}

			dataObj['lineAry2'] = lineAry2;
		}
		var infoSearchdaliy = nlapiSearchRecord(
				"customrecord_djkk_mail_send_info",
				null,
				[
						[ "custrecord_djkk_mail_subsidiary", "anyof",
								mainsubsidiary ],
						"AND",
						[ "formulatext: {custrecord_djkk_mail_kinou_name}",
								"contains", "日次FC更新情報送信機能" ] ],
				[
						new nlobjSearchColumn("custrecord_djkk_mail_sender"),
						new nlobjSearchColumn("custrecord_djkk_mail_recipients"),
						new nlobjSearchColumn("custrecord_djkk_mail_title") ]);

		var infoObj = {
			'sender' : infoSearchdaliy[0]
					.getValue('custrecord_djkk_mail_sender'),
			'recipients' : infoSearchdaliy[0]
					.getValue('custrecord_djkk_mail_recipients'),
			'title' : infoSearchdaliy[0].getValue('custrecord_djkk_mail_title')
		};

		sndDailyNewsMail(dataObj, infoObj);
	}else if(sendmailtype =='在庫アラームレポート自動送信機能'){
		
		var str = '';
		str += '<!DOCTYPE>';
		str += '<html>';
		str += '<head>';
		str += '	<title>在庫アラームレポート自動送信機能</title>';
		str += '	<style type="text/css">';
		str += '		table {';
		str += '			table-layout: fixed;';
		str += '            font-size: 9pt;';
		str += '		}';
		str += '      th {';
		str += '         font-weight: bold;';
		str += '         background-color: #E0E0E0;';
		str += '		}';
		str += '	</style>';
		str += '</head>';
		str += '<body>';
		str += '<font style="font-weight:bold;font-size:10pt">Stock Alarm Report</font>';
		str += '<br />';
		str += '<font style="font-weight:bold;font-size:10pt">'+nlapiDateToString(getSystemTime())+'</font>';
		
		str += '<br />';
		str += '<br />';
		str += '<table border="1">';
		str += '    <tr>';
		str += '        <th align="left">ブランド</th>';
		str += '        <th align="left" colspan = "2">商品</th>';
		str += '        <th align="left">出荷開始</br>予定日</th>';
		
		var forecastSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast",null,
				[
				   ["custrecord_djkk_sc_fc_startdate","onorafter","today"], 
				   "AND", 
				   ["formulanumeric: TO_NUMBER({custrecord_djkk_sc_fc_balance})","notgreaterthanorequalto","0"], 
				   "AND", 
				   ["custrecord_djkk_sc_fc_subsidiary","anyof",mainsubsidiary]
				], 
				[
				   new nlobjSearchColumn("class","CUSTRECORD_DJKK_SC_FC_ITEM","GROUP"), 
				   new nlobjSearchColumn("itemid","CUSTRECORD_DJKK_SC_FC_ITEM","GROUP"), 
				   new nlobjSearchColumn("displayname","CUSTRECORD_DJKK_SC_FC_ITEM","GROUP"), 
				   new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("'*'"), 
				   new nlobjSearchColumn("custrecord_djkk_sc_fc_yearmonthweek",null,"GROUP").setSort(false), 
				   new nlobjSearchColumn("custrecord_djkk_sc_fc_subsidiary",null,"GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_sc_fc_startdate",null,"GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_sc_fc_enddate",null,"GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_sc_fc_item",null,"GROUP")
				]
				);
		if(!isEmpty(forecastSearch)){
          
        var oldweek = [];
        var weeknum=1;
			for(var i=0;i<forecastSearch.length;i++){
				governanceYield();
				var column = forecastSearch[0].getAllColumns();
				
           var weekFlg = forecastSearch[i].getValue(column[4]);
           nlapiLogExecution('debug', 'weekFlg', weekFlg);
              
           if(oldweek.indexOf(weekFlg) == -1){
             oldweek[oldweek.length] = weekFlg;
           //if(forecastSearch[i].getValue(column[4])!=oldweek){
					str += '    </tr>';
					str += '    <tr bgcolor="#CCCCFF">';
					str += '    <td align="left" colspan = "4">Within <strong>'+forecastSearch[i].getValue(column[4])+'</strong> weeks --------> <strong><font color="red">'+weeknum+'週間</font></strong>以内に欠品リスクがあります。</td>';
					str += '    </tr>';
					weeknum++;
				}
				
				str+='<tr>';
				str+='<td align="left" width="200px">'+forecastSearch[i].getText(column[0])+'</td>';
				str+='<td align="left" width="130px" align="right">'+forecastSearch[i].getValue(column[1])+'</td>';
				str+='<td align="left" width="240px" align="right">'+forecastSearch[i].getValue(column[2])+'</td>';
				
				var shipdate=forecastSearch[i].getValue(column[3]);
				var salesorderSearch = nlapiSearchRecord("salesorder",null,
						[
						   ["type","anyof","SalesOrd"], 
						   "AND", 
						   ["mainline","is","F"], 
						   "AND", 
						   ["custcol_djkk_delivery_hopedate","within",forecastSearch[i].getValue(column[6]),forecastSearch[i].getValue(column[7])], 
						   "AND", 
						   ["subsidiary","anyof",mainsubsidiary], 
						   "AND", 
						   ["item","anyof",forecastSearch[i].getValue(column[8])]
						], 
						[
						   new nlobjSearchColumn("custcol_djkk_delivery_hopedate",null,"MIN")
						]
						);
				if(!isEmpty(salesorderSearch)){
					shipdate+=salesorderSearch[0].getValue("custcol_djkk_delivery_hopedate",null,"MIN");
				}
				
				str+='<td align="left">'+shipdate+'</td>';
				str+='</tr>';
        		oldweek=forecastSearch[i].getValue(column[4]);
			}
		}
		
		str+='</table>';
		str+='</body>';
		str+='</html>';
		
	    var infoSearchinv= nlapiSearchRecord("customrecord_djkk_mail_send_info",null,
				[
				   ["custrecord_djkk_mail_subsidiary","anyof",mainsubsidiary], 
				   "AND", 
				   ["formulatext: {custrecord_djkk_mail_kinou_name}","contains","在庫アラームレポート自動送信機能"]
				], 
				[
                new nlobjSearchColumn("custrecord_djkk_mail_sender"), 
                new nlobjSearchColumn("custrecord_djkk_mail_recipients"), 
                new nlobjSearchColumn("custrecord_djkk_mail_title")
				]
				);
		
	    nlapiSendEmail(infoSearchinv[0].getValue('custrecord_djkk_mail_sender'), infoSearchinv[0].getValue('custrecord_djkk_mail_recipients'), infoSearchinv[0].getValue('custrecord_djkk_mail_title'), str, null, null, null, null);
		
	} 
//add by zhou 20220725 start
//U067 営業計画情報入力送信 

	else if (sendmailtype == '営業計画情報入力送信') {

		nlapiLogExecution('debug', '営業計画情報入力送信', 'start');
//		var lastmodified='yesterday';//thisyear
		var lastmodified='today';//thisyear
		var dataObj = {};

		dataObj['headertime'] = nlapiDateToString(getSystemTime());


		var fcmainSearch = nlapiSearchRecord("customrecord_djkk_so_forecast",
				null, [
						[ "isinactive", "is", "F" ],
						"AND",
						[ "lastmodified", "within", lastmodified ],
						"AND",
						[ "custrecord_djkk_so_fc_subsidiary", "anyof",
								mainsubsidiary ] ], [
						new nlobjSearchColumn("lastmodifiedby", null, "GROUP"),
						new nlobjSearchColumn("class",
								"CUSTRECORD_DJKK_SO_FC_ITEM", "GROUP"),
						new nlobjSearchColumn(
								"custrecord_djkk_so_fc_location_area", null,
								"GROUP")
						]);
		if (fcmainSearch != null) {

			var headerAry = [];

			for (var i = 0; i < fcmainSearch.length; i++) {

				var lastmodifiedby = fcmainSearch[i].getText("lastmodifiedby", null,
						"GROUP");
				var classValue = fcmainSearch[i].getText("class",
						"CUSTRECORD_DJKK_SO_FC_ITEM", "GROUP");
				var locationArea = fcmainSearch[i].getText(
						"custrecord_djkk_so_fc_location_area", null,
						"GROUP");
				headerAry.push({
					'lastmodifiedby' : lastmodifiedby,
					'classValue' : classValue,
					'locationArea' : locationArea
				});

			}
			dataObj['headerAry'] = headerAry;
		}
		var lineAry = [];
		var lineAry2 = [];
		var forecastSearchdetil = nlapiSearchRecord(
				"customrecord_djkk_so_forecast",
				null,
				[
						[ "isinactive", "is", "F" ],
						"AND",
						[ "lastmodified", "within", lastmodified ],
						"AND",
						[ "custrecord_djkk_so_fc_subsidiary", "anyof",
								mainsubsidiary ] ],
				[
						new nlobjSearchColumn("itemid","CUSTRECORD_DJKK_SO_FC_ITEM", "GROUP"),
						new nlobjSearchColumn("displayname","CUSTRECORD_DJKK_SO_FC_ITEM", "GROUP"),
						new nlobjSearchColumn('custrecord_djkk_so_fc_location_area', null,"GROUP"),
						new nlobjSearchColumn('custrecord_djkk_so_fc_year', null,"GROUP"),
						new nlobjSearchColumn('custrecord_djkk_so_fc_month', null,"GROUP"),
						new nlobjSearchColumn('custrecord_djkk_so_fc_fcnum', null, "SUM"),
						new nlobjSearchColumn('custrecord_djkk_so_fc_subsidiary', null, "GROUP")
				]);
		if (!isEmpty(forecastSearchdetil)) {

//			var lineAry = [];

			for (var i = 0; i < forecastSearchdetil.length; i++) {
				var column = forecastSearchdetil[0].getAllColumns();

				lineAry.push({
					'itemid' : forecastSearchdetil[i].getValue(column[0]),
					'displayname' : forecastSearchdetil[i].getValue(column[1]),
					'locationArea' : forecastSearchdetil[i].getText(column[2]),
					'year' : forecastSearchdetil[i].getValue(column[3]),
					'month' : forecastSearchdetil[i].getValue(column[4]),
					'fcnum' : forecastSearchdetil[i].getValue(column[5]),
					'sub' : forecastSearchdetil[i].getText(column[6])
				});
			}

			dataObj['lineAry'] = lineAry;
		}

		var forecastSearchdetil2 = nlapiSearchRecord(
				"customrecord_djkk_so_forecast",
				null,
				[
						[ "isinactive", "is", "F" ],
						"AND",
						[ "lastmodified", "within", lastmodified ],
						"AND",
						[ "custrecord_djkk_so_fc_subsidiary", "anyof",
								mainsubsidiary ] ],
				[
					new nlobjSearchColumn("itemid","CUSTRECORD_DJKK_SO_FC_ITEM", "GROUP"),
					new nlobjSearchColumn("displayname","CUSTRECORD_DJKK_SO_FC_ITEM", "GROUP"),
					new nlobjSearchColumn('custrecord_djkk_so_fc_location_area', null,"GROUP"),
					new nlobjSearchColumn('custrecord_djkk_so_fc_year', null,"GROUP"),
					new nlobjSearchColumn('custrecord_djkk_so_fc_month', null,"GROUP"),
					new nlobjSearchColumn("custrecord_djkk_so_fc_employee", null, "GROUP"),
//					new nlobjSearchColumn('entityid','CUSTRECORD_DJKK_SO_FC_EMPLOYEE',"GROUP"),
					new nlobjSearchColumn('custrecord_djkk_so_fc_fcnum', null,"GROUP"),
					new nlobjSearchColumn('custrecord_djkk_so_fc_subsidiary', null,"GROUP")
				]);
		if (!isEmpty(forecastSearchdetil2)) {

//			var lineAry2 = [];

			for (var i = 0; i < forecastSearchdetil2.length; i++) {
				var column = forecastSearchdetil2[0].getAllColumns();

				lineAry2.push({
					'itemid' : forecastSearchdetil2[i].getValue(column[0]),
					'displayname' : forecastSearchdetil2[i].getValue(column[1]),
					'locationArea' : forecastSearchdetil2[i].getText(column[2]),
					'year' : forecastSearchdetil2[i].getValue(column[3]),
					'month' : forecastSearchdetil2[i].getValue(column[4]),
					'employee' : forecastSearchdetil2[i].getText(column[5]),
					'fcnum' : forecastSearchdetil2[i].getValue(column[6]),
					'sub' : forecastSearchdetil2[i].getText(column[7])
				});
			}

			dataObj['lineAry2'] = lineAry2;
		}
			
		var infoSearchdaliy = nlapiSearchRecord(
				"customrecord_djkk_mail_send_info",
				null,
				[
						[ "custrecord_djkk_mail_subsidiary", "anyof",
								mainsubsidiary ],
						"AND",
						
						[ "formulatext: {custrecord_djkk_mail_kinou_name}",
								"contains", "営業計画情報入力送信機能" ]
				],
				[
						new nlobjSearchColumn("custrecord_djkk_mail_sender"),
						new nlobjSearchColumn("custrecord_djkk_mail_recipients"),
						new nlobjSearchColumn("custrecord_djkk_mail_title") ]);

		var infoObj = {
			'sender' : infoSearchdaliy[0]
					.getValue('custrecord_djkk_mail_sender'),
			'recipients' : infoSearchdaliy[0]
					.getValue('custrecord_djkk_mail_recipients'),
			'title' : infoSearchdaliy[0].getValue('custrecord_djkk_mail_title')
		};
		if(!isEmpty(lineAry)){
			sndBPInformationMail(dataObj, infoObj);	
		}
	}
//add by zhou 20220725 end
}  
function outReportOneWeek(mainsubsidiary) {
	var searchendDate = getLastWeekSaturday(nlapiDateToString(getSystemTime()));
	var searchstartDate = dateAddDays(searchendDate, -6);

	var dataObj = getFCLineDate(searchstartDate, searchendDate, mainsubsidiary,
			[[ "custrecord_djkk_sc_fc_enddate", "on", searchendDate ]]);

	return dataObj;
}
function outReportFourWeek(mainsubsidiary) {
	var searchendDate = getLastWeekSaturday(nlapiDateToString(getSystemTime()));
	var searchstartDate = dateAddDays(searchendDate, -27);

	var itemSum = nlapiSearchRecord("item", null, [ [ "subsidiary", "anyof",
			mainsubsidiary ] ], [ new nlobjSearchColumn("totalvalue", null,
			"SUM") ])[0].getValue("totalvalue", null, "SUM");

	var dataObj = getFCLineDate(searchstartDate, searchendDate, mainsubsidiary,	[
	                                                                      	   ["custrecord_djkk_sc_fc_enddate","on",searchendDate], 
	                                                                    	   "OR", 
	                                                                    	   ["custrecord_djkk_sc_fc_enddate","on",dateAddDays(searchendDate, -7)], 
	                                                                    	   "OR", 
	                                                                    	   ["custrecord_djkk_sc_fc_enddate","on",dateAddDays(searchendDate, -14)], 
	                                                                    	   "OR", 
	                                                                    	   ["custrecord_djkk_sc_fc_enddate","on",dateAddDays(searchendDate, -21)]
	                                                                    	]);
	


	dataObj['header'] = {
		'itemSum' : itemSum,
		'subsidiaryName' : nlapiLookupField('subsidiary', mainsubsidiary,
				'name')
	};

	var itemreceiptSearch = nlapiSearchRecord("itemreceipt", null,
			[ [ "trandate", "within", searchstartDate, searchendDate ], "AND",
					[ "type", "anyof", "ItemRcpt" ], "AND",
					[ "mainline", "is", "F" ] ], [
					new nlobjSearchColumn("quantity", null, "SUM"),
					new nlobjSearchColumn("item", null, "GROUP"),
					new nlobjSearchColumn("altname", "vendor", "GROUP").setSort(true),
					new nlobjSearchColumn("subsidiary", null, "GROUP") ]);

	var sc_forecastSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast",
			null, [
					[ "custrecord_djkk_sc_fc_enddate", "on", searchendDate ],
					"OR",
					[ "custrecord_djkk_sc_fc_enddate", "on",
							dateAddDays(searchendDate, -7) ],
					"OR",
					[ "custrecord_djkk_sc_fc_enddate", "on",
							dateAddDays(searchendDate, -14) ],
					"OR",
					[ "custrecord_djkk_sc_fc_enddate", "on",
							dateAddDays(searchendDate, -21) ] ], [
					new nlobjSearchColumn("custrecord_djkk_sc_fc_item", null,
							"GROUP"),
					new nlobjSearchColumn("custrecord_djkk_sc_fc_in", null,
							"SUM"),
					new nlobjSearchColumn("custrecord_djkk_sc_fc_subsidiary",
							null, "GROUP") ]);

	if (!isEmpty(sc_forecastSearch)) {

		var groupAry = [];

		for (var i = 0; i < sc_forecastSearch.length; i++) {
			governanceYield();
			var column = sc_forecastSearch[0].getAllColumns();
			if (sc_forecastSearch[i].getValue(column[2]) == mainsubsidiary) {
				var foucast = sc_forecastSearch[i].getValue(column[1]);
				for (var j = 0; j < itemreceiptSearch.length; j++) {
					if (itemreceiptSearch[j].getValue("subsidiary", null,
							"GROUP") == mainsubsidiary) {
						if (itemreceiptSearch[j].getValue("item", null, "GROUP") == sc_forecastSearch[i].getValue(column[0])) {
							var supplier = itemreceiptSearch[j].getValue("altname", "vendor", "GROUP");
							var actul = itemreceiptSearch[j].getValue("quantity", null, "SUM");
							var Comparison = 0;
							if (foucast != 0) {
								Comparison = Number(actul / foucast).toFixed();
							}

							groupAry.push({
								'supplier' : supplier,
								'actul' : actul,
								'foucast' : foucast,
								'Comparison' : Comparison
							});
						}
					}
				}
			}
		}
		dataObj['group'] = groupAry;
	}

	return dataObj;
}

function getFCLineDate(searchstartDate, searchendDate, mainsubsidiary,
		searchendDatesfilter) {

	
	var Obj = {};

	Obj['dealDate'] = searchstartDate + '~' + searchendDate;

	var transactionSearchSearcharr = {};
	var transactionSearch = getSearchResults("transaction", null,
			[ 
			  [ "trandate", "within", searchstartDate, searchendDate ], "AND",
			   [[["type","anyof","ItemShip"],"AND",["mainline","any",""],"AND",["taxline","is","F"],"AND",["shipping","is","F"]],"OR",[["type","anyof","ItemRcpt"],"AND",["mainline","is","F"]]], 
			   "AND", 
			   ["account","anyof","19"]
			]
	, [
					new nlobjSearchColumn("quantity", null, "SUM"),
					new nlobjSearchColumn("item", null, "GROUP"),
					new nlobjSearchColumn("custcol_djkk_conversionrate", null,"MAX"),
					new nlobjSearchColumn("subsidiary", null, "GROUP"),
					new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("{item.internalid}||'-'||{subsidiary.internalid}")]);
	if (!isEmpty(transactionSearch)) {

		for (var i = 0; i < transactionSearch.length; i++) {

			governanceYield();
			var column = transactionSearch[0].getAllColumns();
			if (transactionSearch[i].getValue(column[3]) == mainsubsidiary) {
				var itemreceiptSearcharray = new Array();
				itemreceiptSearcharray.push(transactionSearch[i]
						.getValue(column[0]));
				itemreceiptSearcharray.push(transactionSearch[i]
						.getValue(column[2]));
				transactionSearchSearcharr[transactionSearch[i].getValue(column[4])] = itemreceiptSearcharray;
			}
		}
	}

	var forecastSearch = getSearchResults("customrecord_djkk_sc_forecast",
			null, searchendDatesfilter, [
					new nlobjSearchColumn("class","CUSTRECORD_DJKK_SC_FC_ITEM", "GROUP"),
					new nlobjSearchColumn("itemid","CUSTRECORD_DJKK_SC_FC_ITEM", "GROUP"),
					new nlobjSearchColumn("displayname","CUSTRECORD_DJKK_SC_FC_ITEM", "GROUP"),
					new nlobjSearchColumn("formulanumeric",null,"SUM").setFormula("{custrecord_djkk_sc_fc_in}-{custrecord_djkk_sc_fc_out}"), 
					new nlobjSearchColumn("custrecord_djkk_sc_fc_subsidiary",null,"GROUP"),
					new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("{custrecord_djkk_sc_fc_item.internalid}||'-'||{custrecord_djkk_sc_fc_subsidiary.internalid}") ]);
	if (!isEmpty(forecastSearch)) {
		var lineData = [];
		for (var i = 0; i < forecastSearch.length; i++) {
			governanceYield();
			var column = forecastSearch[0].getAllColumns();
			var testOne = forecastSearch[i].getValue(column[4]);
			if (forecastSearch[i].getValue(column[4]) == mainsubsidiary) {
				var brandText = forecastSearch[i].getText(column[0]);
				var itemText = forecastSearch[i].getValue(column[1]);
				var description = forecastSearch[i].getValue(column[2]);
				var actual = 0;
				var fcOut = forecastSearch[i].getValue(column[3]);
				var compare = 0;
				var inNum = 1;
				var compareCase = 0;
				var transactionarr = transactionSearchSearcharr[forecastSearch[i].getValue(column[5])];
				if (!isEmpty(transactionarr)) {
					actual = transactionarr[0];
					inNum = transactionarr[1];
					compare = Number(actual / fcOut).toFixed(2);
					compareCase = Number((actual - fcOut) / inNum).toFixed();
				}
				lineData.push({
					'brandText' : brandText,
					'itemText' : itemText,
					'description' : description,
					'actual' : actual,
					'fcOut' : fcOut,
					'compare' : compare,
					'inNum' : inNum,
					'compareCase' : compareCase
				});
			}
		}
		Obj['lineData'] = lineData;
	}
	return Obj;
}

function getPdfHeader(headertxt) {
	var xml = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'
			+ '<pdf>'
			+ '<head>'
			+ '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'
			+ '<#if .locale == "zh_CN">'
			+ '<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'
			+ '<#elseif .locale == "zh_TW">'
			+ '<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'
			+ '<#elseif .locale == "ja_JP">'
			+ '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'
			+ '<#elseif .locale == "ko_KR">'
			+ '<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'
			+ '<#elseif .locale == "th_TH">'
			+ '<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'
			+ '</#if>'
			+ '<style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'
			+ '<#if .locale == "zh_CN">'
			+ 'font-family: NotoSans, NotoSansCJKsc, sans-serif;'
			+ '<#elseif .locale == "zh_TW">'
			+ 'font-family: NotoSans, NotoSansCJKtc, sans-serif;'
			+ '<#elseif .locale == "ja_JP">'
			+ 'font-family: NotoSans, NotoSansCJKjp, sans-serif;'
			+ '<#elseif .locale == "ko_KR">'
			+ 'font-family: NotoSans, NotoSansCJKkr, sans-serif;'
			+ '<#elseif .locale == "th_TH">'
			+ 'font-family: NotoSans, NotoSansThai, sans-serif;'
			+ '<#else>'
			+ 'font-family: NotoSans, sans-serif;'
			+ '</#if>'
			+ '}'
			+ 'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'
			+ 'td { padding: 4px 6px; }'
			+ 'b { font-weight: bold; color: #333333; }'
			+ '</style>'
			// +'<title>出荷予実比較レポート送信機能</title>';
			// +'<style type="text/css">';
			// +'table {table-layout: fixed;font-size: 9pt;}';
			// +'th {font-weight: bold;background-color: #E0E0E0;}';
			// +'</style>';
			+ '</head>'
			+ '<body padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">'
			+ headertxt;
	return xml;
}

function sndActualForecastMail(weekFlg, data, infoSearchone) {

	if (weekFlg) {

		if (!isEmpty(data)) {

			var dealDate = data['dealDate'];
			var lineData = data['lineData'];

			var mailSrt = '';

			mailSrt += '<!DOCTYPE>';
			mailSrt += '<html>';
			mailSrt += '<head>';
			mailSrt += '<title>出荷予実比較レポート送信機能</title>';
			mailSrt += '<style type="text/css">';
			mailSrt += 'table {';
			mailSrt += '	table-layout: fixed;';
			mailSrt += '      font-size: 9pt;';
			mailSrt += '	}';
			mailSrt += ' th {';
			mailSrt += ' font-weight: bold;';
			mailSrt += '  background-color: #E0E0E0;';
			mailSrt += '}';
			mailSrt += '</style>';
			mailSrt += '</head>';

			mailSrt += '<body>';

			mailSrt += '<font style="font-weight:bold;font-size:10pt">Actual Forecast Comparison (Last 1 week)</font>';
			mailSrt += '<br />';
			mailSrt += '<font style="font-weight:bold;font-size:10pt">'
					+ dealDate + '</font>';
			mailSrt += '<br />';
			mailSrt += '<br />';
			mailSrt += '<font style="font-size:10pt">最近１週間のComparison > １のデータのみ抽出しています。</font>';
			mailSrt += '<br />';
			mailSrt += '<font color="blue" style="font-weight:bold;font-size:10pt">Per Brand,Stock</font>';
			mailSrt += '<br />';
			mailSrt += '<br />';
			mailSrt += '<table border="1">';
			mailSrt += '<tr>';
			mailSrt += '<th align="left">Brand</th>';
			mailSrt += '<th align="left" colspan="2">Stock</th>';
			mailSrt += '<th>Actual</th>';
			mailSrt += '<th>Forecast</th>';
			mailSrt += '<th>Comparison</th>';
			mailSrt += '<th>入<br />数</th>';
			mailSrt += '<th>CaseQtyDiff</th>';
			mailSrt += '</tr>';
			
			 
			if(!isEmpty(lineData)){
				if (lineData.length > 0) {
	
					for (var i = 0; i < lineData.length; i++) {
						var valueObj = lineData[i];
						if(valueObj.compare > 1){
							mailSrt += '<tr>';
							mailSrt += '<td width="105px"  style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(valueObj.brandText) ? ' ' : valueObj.brandText) + '</td>';
							mailSrt += '<td width="60px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(valueObj.itemText) ? ' ' : valueObj.itemText) + '</td>';
							mailSrt += '<td width="240px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(valueObj.description) ? '' : valueObj.description) + '</td>';
							mailSrt += '<td align="right">' + (isEmpty(valueObj.actual) ? '0' : valueObj.actual) + '</td>';
							mailSrt += '<td align="right">' + (isEmpty(valueObj.fcOut) ? '0' : valueObj.fcOut) + '</td>';
							mailSrt += '<td align="right">' + (isEmpty(valueObj.compare) ? '' : valueObj.compare == 'Infinity' ? '' : valueObj.compare)
									+ '</td>';
							mailSrt += '<td align="right" width="25px">'
									+ (isEmpty(valueObj.inNum) ? '' : valueObj.inNum) + '</td>';
							mailSrt += '<td align="right">' + (isEmpty(valueObj.compareCase) ? '' : valueObj.compareCase)
									+ '</td>';
							mailSrt += '</tr>';
						}
					}
				}
			}

			mailSrt += '</table>';
			mailSrt += '</body>';
			mailSrt += '</html>';

			var senderId = infoSearchone.sender;
			var tmpRecipients = infoSearchone.recipients;
			var title = infoSearchone.title;

			if(!isEmpty(lineData)){
				if(valueObj.compare > 1){
				nlapiSendEmail(senderId, tmpRecipients, title, mailSrt, null, null,
						null, null);
				}
			}

		}

	} else {

		if (!isEmpty(data)) {

			var dealDate = data['dealDate'];
			var lineData = data['lineData'];
			var header = data['header'];
			var group = data['group'];

			var itemSum = header['itemSum'];
			var subsidiaryName = header['subsidiaryName'];

			var mailSrt4 = '';

			mailSrt4 += '<!DOCTYPE> ';
			mailSrt4 += '<html> ';
			mailSrt4 += '<head> ';
			mailSrt4 += '<title>出荷予実比較レポート送信機能</title> ';
			mailSrt4 += '<style type="text/css"> ';
			mailSrt4 += 'table { table-layout: fixed; font-size: 9pt; } ';
			mailSrt4 += 'th { font-weight: bold; background-color: #E0E0E0; } ';
			mailSrt4 += '</style> ';
			mailSrt4 += '</head> ';
			mailSrt4 += '<body> ';
			mailSrt4 += '<font style="font-weight:bold;font-size:10pt">Actual Forecast Comparison (Last４week)</font> ';
			mailSrt4 += '<br /> ';
			mailSrt4 += '<font style="font-weight:bold;font-size:10pt">'
					+ dealDate + '</font> ';
			mailSrt4 += '<br /> ';
			mailSrt4 += '<br /> ';
			mailSrt4 += '<font style="font-weight:bold;font-size:10pt;text-decoration:underline">'
					+ subsidiaryName + '在庫残高：' + itemSum + '円</font> ';
			mailSrt4 += '<br /> ';
			mailSrt4 += '<br /> ';
			mailSrt4 += '<font color="blue" style="font-weight:bold;font-size:10pt">2)Per Supplier</font> ';
			mailSrt4 += '<br /> ';
			mailSrt4 += '<br /> ';
			mailSrt4 += '<table border="1"> ';
			mailSrt4 += '<tr> ';
			mailSrt4 += '<th align="left">Supplier</th> ';
			mailSrt4 += '<th>Actual</th> ';
			mailSrt4 += '<th>Forecast</th> ';
			mailSrt4 += '<th>Comparison</th> ';
			mailSrt4 += '</tr> ';
			if(!isEmpty(group)){
				if (group.length > 0) {
	               var supAAFArray=new Array();
	               var supAA=new Array();
					for (var f = 0; f < group.length; f++) {
						var groupObj = group[f];
						if(isEmpty(supAAFArray[groupObj['supplier']])){
						supAA.push(groupObj['supplier']);
						supAAFArray[groupObj['supplier']]=[groupObj['actul'],groupObj['foucast'],groupObj['Comparison']];
						}else{
						supAAFArray[groupObj['supplier']]=[Number(supAAFArray[groupObj['supplier']][0])+Number(groupObj['actul']),Number(supAAFArray[groupObj['supplier']][1])+Number(groupObj['foucast']),Number(supAAFArray[groupObj['supplier']][2])+Number(groupObj['Comparison'])];
						}
					}
					for (var f = 0; f < supAA.length; f++) {
						var groupObj = supAAFArray[supAA[f]];
						if(groupObj[2] < 0.8){					
							mailSrt4 += '<tr bgcolor="#87CEFA"> ';
							mailSrt4 += '<td width="310px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(supAA[f]) ? '' : supAA[f]) + '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(groupObj[0]) ? '0' : groupObj[0])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(groupObj[1]) ? '0' : groupObj[1])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(groupObj[2]) ? '' : groupObj[2])
									+ '</td> ';
							mailSrt4 += '</tr> ';
						}else if(groupObj[2] > 1){
							mailSrt4 += '<tr bgcolor="red"> ';
							mailSrt4 += '<td width="310px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(supAA[f]) ? '' : supAA[f]) + '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(groupObj[0]) ? '0' : groupObj[0])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(groupObj[1]) ? '0' : groupObj[1])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(groupObj[2]) ? '' : groupObj[2])
									+ '</td> ';
							mailSrt4 += '</tr> ';
						}else{
							mailSrt4 += '<tr> ';
							mailSrt4 += '<td width="310px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(supAA[f]) ? '' : supAA[f]) + '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(groupObj[0]) ? '0' : groupObj[0])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(groupObj[1]) ? '0' : groupObj[1])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(groupObj[2]) ? '' : groupObj[2])
									+ '</td> ';
							mailSrt4 += '</tr> ';
						}
					}
				}
			}
			mailSrt4 += '</table> ';
			mailSrt4 += '<br /> ';
			mailSrt4 += '<font color="blue" style="font-weight:bold;font-size:10pt">3)Per Brand,Stock</font> ';
			mailSrt4 += '<br /> ';
			mailSrt4 += '<br /> ';
			mailSrt4 += '<table border="1"> ';
			mailSrt4 += '<tr> ';
			mailSrt4 += '<th align="left">Brand</th> ';
			mailSrt4 += '<th align="left" colspan="2">Stock</th> ';
			mailSrt4 += '<th>Actual</th> ';
			mailSrt4 += '<th>Forecast</th> ';
			mailSrt4 += '<th>Comparison</th> ';
			mailSrt4 += '<th>入<br />数</th> ';
			mailSrt4 += '<th>CaseQtyDiff</th> ';
			mailSrt4 += '</tr> ';
			if(!isEmpty(lineData)){
				if (lineData.length > 0) {
					for (var l = 0; l < lineData.length; l++) {
						var lineObj = lineData[l];
						if(lineObj['compare'] < 0.8){
							mailSrt4 += '<tr bgcolor="#87CEFA"> ';
							mailSrt4 += '<td width="105px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(lineObj['brandText']) ? '' : lineObj['brandText']) + '</td> ';
							mailSrt4 += '<td width="55px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(lineObj['itemText']) ? '' : lineObj['itemText']) + '</td> ';
							mailSrt4 += '<td width="240px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(lineObj['description']) ? '' : lineObj['description']) + '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['actual']) ? '0' : lineObj['actual'])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['fcOut']) ? '0' : lineObj['fcOut'])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['compare']) ? '' : lineObj['compare'] == 'Infinity' ? '' : lineObj['compare'])
									+ '</td> ';
							mailSrt4 += '<td align="right" width="25px">'
									+ (isEmpty(lineObj['inNum']) ? '' : lineObj['inNum']) + '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['compareCase']) ? '' : lineObj['compareCase'])
									+ '</td> ';
							mailSrt4 += '</tr> ';
						} else if(lineObj['compare'] > 1){
							mailSrt4 += '<tr bgcolor="red"> ';
							mailSrt4 += '<td width="105px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(lineObj['brandText']) ? '' : lineObj['brandText']) + '</td> ';
							mailSrt4 += '<td width="55px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(lineObj['itemText']) ? '' : lineObj['itemText']) + '</td> ';
							mailSrt4 += '<td width="240px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(lineObj['description']) ? '' : lineObj['description']) + '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['actual']) ? '0' : lineObj['actual'])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['fcOut']) ? '0' : lineObj['fcOut'])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['compare']) ? '' : lineObj['compare'] == 'Infinity' ? '' : lineObj['compare'])
									+ '</td> ';
							mailSrt4 += '<td align="right" width="25px">'
									+ (isEmpty(lineObj['inNum']) ? '' : lineObj['inNum']) + '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['compareCase']) ? '' : lineObj['compareCase'])
									+ '</td> ';
							mailSrt4 += '</tr> ';
						}else{
							mailSrt4 += '<tr> ';
							mailSrt4 += '<td width="105px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(lineObj['brandText']) ? '' : lineObj['brandText']) + '</td> ';
							mailSrt4 += '<td width="55px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(lineObj['itemText']) ? '' : lineObj['itemText']) + '</td> ';
							mailSrt4 += '<td width="240px" style="word-wrap:break-word;word-break:break-all;">'
									+ (isEmpty(lineObj['description']) ? '' : lineObj['description']) + '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['actual']) ? '0' : lineObj['actual'])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['fcOut']) ? '0' : lineObj['fcOut'])
									+ '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['compare']) ? '' : lineObj['compare'] == 'Infinity' ? '' : lineObj['compare'])
									+ '</td> ';
							mailSrt4 += '<td align="right" width="25px">'
									+ (isEmpty(lineObj['inNum']) ? '' : lineObj['inNum']) + '</td> ';
							mailSrt4 += '<td align="right">' + (isEmpty(lineObj['compareCase']) ? '' : lineObj['compareCase'])
									+ '</td> ';
							mailSrt4 += '</tr> ';
						}
					}
				}
			}
			mailSrt4 += '</table> ';
			mailSrt4 += '</body> ';
			mailSrt4 += '</html>';

			var senderId = infoSearchone.sender;
			var tmpRecipients = infoSearchone.recipients;
			var title = infoSearchone.title;

			if(!isEmpty(lineData)){
				nlapiSendEmail(senderId, tmpRecipients, title, mailSrt4, null,
						null, null, null);
			}
		}

	}

}

function sndDailyNewsMail(dataObj, infoObj) {

	if (!isEmpty(dataObj)) {

		var headertime = dataObj['headertime'];
		var headerAry = dataObj['headerAry'];

		var userData = '';
		var brandData = '';
        if(!isEmpty(headerAry)){
        var personArray=new Array();
        var classArray=new Array();
		for (var ha = 0; ha < headerAry.length; ha++) {
            if(personArray.indexOf(headerAry[ha]['lastmodifiedby']) < 0){
			userData += userData == '' ? headerAry[ha]['lastmodifiedby'] : ','
					+ headerAry[ha]['lastmodifiedby'];
            }
            if(classArray.indexOf(headerAry[ha]['classValue'])  < 0){       	            
			brandData += brandData == '' ? headerAry[ha]['classValue'] : ','
					+ headerAry[ha]['classValue'];
            }
			personArray.push(headerAry[ha]['lastmodifiedby']);
			classArray.push(headerAry[ha]['classValue']);
		}
      }
		var lineAry = dataObj['lineAry'];
		var lineAry2 = dataObj['lineAry2'];

		var dailyNewsStr = '';

		dailyNewsStr += '<!DOCTYPE>';
		dailyNewsStr += '<html>';
		dailyNewsStr += '<head>';
		dailyNewsStr += '	<title>日次FC更新情報送信機能</title>';
		dailyNewsStr += '	<style type="text/css">';
		dailyNewsStr += '		table {';
		dailyNewsStr += '			table-layout: fixed;';
		dailyNewsStr += '           font-size: 9pt;';
		dailyNewsStr += '		}';
		dailyNewsStr += '     th {';
		dailyNewsStr += '         font-weight: bold;';
		dailyNewsStr += '         background-color: #E0E0E0;';
		dailyNewsStr += '      }';
		dailyNewsStr += '	</style>';
		dailyNewsStr += '</head>';

		dailyNewsStr += '<body>';

		dailyNewsStr += '<font style="font-size:10pt">' + headertime
				+ '</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<font color="blue" style="font-weight:bold;font-size:10pt">1)Who did update in forecast DB?</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<font style="font-size:10pt">' + userData + '</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<font color="blue" style="font-weight:bold;font-size:10pt">2)Which brand where updated?</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<font style="font-size:10pt">' + brandData + '</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<font color="blue" style="font-weight:bold;font-size:10pt">3)Detail?</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<br />';

		dailyNewsStr += '<table border="1">';
		dailyNewsStr += '    <tr>';
		dailyNewsStr += '        <th width="90px">StockCode</th>';
		dailyNewsStr += '        <th width="250px">Description</th>';
		dailyNewsStr += '        <th width="85px">Warehouse</th>';
		dailyNewsStr += '        <th width="80px">TrendQty</th>';
		dailyNewsStr += '        <th width="55px">From</th>';
		dailyNewsStr += '        <th width="55px">To</th>';
		dailyNewsStr += '        <th width="85px">WeekCount</th>';
		dailyNewsStr += '    </tr>';
	    if(!isEmpty(lineAry)){
	    	for (var la = 0; la < lineAry.length; la++) {
	    		var laObj = lineAry[la];
				dailyNewsStr += '    <tr>';
				dailyNewsStr += '        <td>' + laObj['st'] + '</td>';
				dailyNewsStr += '        <td>' + laObj['de'] + '</td>';
				dailyNewsStr += '        <td>' + laObj['wa'] + '</td>';
				dailyNewsStr += '        <td align="right">' + laObj['tr']
						+ '</td>';
				dailyNewsStr += '        <td>' + laObj['fr'] + '</td>';
				dailyNewsStr += '        <td>' + laObj['to'] + '</td>';
				dailyNewsStr += '        <td align="right">' + laObj['we']
						+ '</td>';
				dailyNewsStr += '    </tr>';
	    	}
	    }
		dailyNewsStr += '</table>';

		dailyNewsStr += '<br />';
		dailyNewsStr += '<font color="blue" style="font-weight:bold;font-size:10pt">4)Salesman Detail?</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<br />';

		dailyNewsStr += '<table border="1">';
		dailyNewsStr += '    <tr>';
		dailyNewsStr += '        <th width="70px">Salesman</th>';
		dailyNewsStr += '        <th width="90px">StockCode</th>';
		dailyNewsStr += '        <th width="250px">Description</th>';
		dailyNewsStr += '        <th width="85px">Warehouse</th>';
		dailyNewsStr += '        <th width="80px">TrendQty</th>';
		dailyNewsStr += '        <th width="55px">From</th>';
		dailyNewsStr += '        <th width="55px">To</th>';
		dailyNewsStr += '        <th width="85px">WeekCount</th>';
		dailyNewsStr += '    </tr>';
		if(!isEmpty(lineAry2)){
			for (var la2 = 0; la2 < lineAry2.length; la2++) {
				var la2Obj = lineAry2[la2];
				dailyNewsStr += '    <tr>';
				dailyNewsStr += '        <td>' + la2Obj['sa'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['st'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['de'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['wa'] + '</td>';
				dailyNewsStr += '        <td align="right">' + la2Obj['tr']
						+ '</td>';
				dailyNewsStr += '        <td>' + la2Obj['fr'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['to'] + '</td>';
				dailyNewsStr += '        <td align="right">' + la2Obj['we']
						+ '</td>';
				dailyNewsStr += '    </tr>';
			}
		}
		dailyNewsStr += '</table>';
		dailyNewsStr += '</body>';
		dailyNewsStr += '</html>';

		var senderId = infoObj.sender;
		var tmpRecipients = infoObj.recipients;
		var title = infoObj.title;

		nlapiSendEmail(senderId, tmpRecipients, title, dailyNewsStr, null,
				null, null, null);
	}
}

function sndLibraryItemMail(data) {

	nlapiLogExecution('debug', 'sndLibraryItemMail', data);

}
//add by zhou 20220725 start
//U067 営業計画情報入力送信 
function sndBPInformationMail(dataObj, infoObj) {
	nlapiLogExecution('debug','sendMail start','start')
	if (!isEmpty(dataObj)) {

		var headertime = dataObj['headertime'];
		var headerAry = dataObj['headerAry'];

		var userData = '';
		var brandData = '';
        if(!isEmpty(headerAry)){
        var personArray=new Array();
        var classArray=new Array();
		for (var ha = 0; ha < headerAry.length; ha++) {
            if(personArray.indexOf(headerAry[ha]['lastmodifiedby']) < 0){
			userData += userData == '' ? headerAry[ha]['lastmodifiedby'] : ','
					+ headerAry[ha]['lastmodifiedby'];
            }
            if(classArray.indexOf(headerAry[ha]['classValue'])  < 0){       	            
			brandData += brandData == '' ? headerAry[ha]['classValue'] : ','
					+ headerAry[ha]['classValue'];
            }
			personArray.push(headerAry[ha]['lastmodifiedby']);
			classArray.push(headerAry[ha]['classValue']);
		}
      }
		var lineAry = dataObj['lineAry'];
		var lineAry2 = dataObj['lineAry2'];

		var dailyNewsStr = '';

		dailyNewsStr += '<!DOCTYPE>';
		dailyNewsStr += '<html>';
		dailyNewsStr += '<head>';
		dailyNewsStr += '	<title>営業計画情報入力送信機能</title>';
		dailyNewsStr += '	<style type="text/css">';
		dailyNewsStr += '		table {';
		dailyNewsStr += '			table-layout: fixed;';
		dailyNewsStr += '           font-size: 9pt;';
		dailyNewsStr += '		}';
		dailyNewsStr += '     th {';
		dailyNewsStr += '         font-weight: bold;';
		dailyNewsStr += '         background-color: #E0E0E0;';
		dailyNewsStr += '      }';
		dailyNewsStr += '	</style>';
		dailyNewsStr += '</head>';

		dailyNewsStr += '<body>';

		dailyNewsStr += '<font style="font-size:10pt">' + headertime
				+ '</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<font color="blue" style="font-weight:bold;font-size:10pt">1)Who did update in forecast DB?</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<font style="font-size:10pt">' + userData + '</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<font color="blue" style="font-weight:bold;font-size:10pt">2)Which brand where updated?</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<font style="font-size:10pt">' + brandData + '</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<font color="blue" style="font-weight:bold;font-size:10pt">3)Detail?</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<br />';

		
		dailyNewsStr += '<table border="1">';
		dailyNewsStr += '    <tr>';
		dailyNewsStr += '        <th width="90px">DJ_連結</th>';
		dailyNewsStr += '        <th width="250px">商品コード</th>';
		dailyNewsStr += '        <th width="250px">商品名</th>';
		dailyNewsStr += '        <th width="80px">DJ_場所エリア </th>';
		dailyNewsStr += '        <th width="55px">DJ_年</th>';
		dailyNewsStr += '        <th width="55px">DJ_月</th>';
		dailyNewsStr += '        <th width="85px">DJ_FC数</th>';
		dailyNewsStr += '    </tr>';
	    if(!isEmpty(lineAry)){
	    	for (var a = 0; a < lineAry.length; a++) {
	    		var laObj = lineAry[a];
				dailyNewsStr += '    <tr>';
				dailyNewsStr += '        <td>' + laObj['sub'] + '</td>';
				dailyNewsStr += '        <td>' + laObj['itemid'] + '</td>';
				dailyNewsStr += '        <td>' + laObj['displayname'] + '</td>';
				dailyNewsStr += '        <td>' + laObj['locationArea'] + '</td>';
				dailyNewsStr += '        <td>' + laObj['year'] + '</td>';
				dailyNewsStr += '        <td>' + laObj['month'] + '</td>';
				dailyNewsStr += '        <td>' + laObj['fcnum'] + '</td>';
				dailyNewsStr += '    </tr>';
	    	}
	    }
		dailyNewsStr += '</table>';

		dailyNewsStr += '<br />';
		dailyNewsStr += '<font color="blue" style="font-weight:bold;font-size:10pt">4)Salesman Detail?</font>';
		dailyNewsStr += '<br />';
		dailyNewsStr += '<br />';

		dailyNewsStr += '<table border="1">';
		dailyNewsStr += '    <tr>';
		dailyNewsStr += '        <th width="85px">DJ_担当者コード</th>';
		dailyNewsStr += '        <th width="90px">DJ_連結</th>';
		dailyNewsStr += '        <th width="250px">商品コード</th>';
		dailyNewsStr += '        <th width="250px">商品名</th>';
		dailyNewsStr += '        <th width="80px">DJ_場所エリア </th>';
		dailyNewsStr += '        <th width="55px">DJ_年</th>';
		dailyNewsStr += '        <th width="55px">DJ_月</th>';
		dailyNewsStr += '        <th width="85px">DJ_FC数</th>';
		dailyNewsStr += '    </tr>';
		if(!isEmpty(lineAry2)){
			for (var b = 0; b < lineAry2.length; b++) {
				var la2Obj = lineAry2[b];
				dailyNewsStr += '    <tr>';
				dailyNewsStr += '        <td>' + la2Obj['employee'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['sub'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['itemid'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['displayname'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['locationArea'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['year'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['month'] + '</td>';
				dailyNewsStr += '        <td>' + la2Obj['fcnum'] + '</td>';
				dailyNewsStr += '    </tr>';
			}
		}
		dailyNewsStr += '</table>';
		dailyNewsStr += '</body>';
		dailyNewsStr += '</html>';
		var senderId = infoObj.sender;
		var tmpRecipients = infoObj.recipients;
		var title = infoObj.title;

		nlapiSendEmail(senderId, tmpRecipients, title, dailyNewsStr, null,
				null, null, null);
        nlapiLogExecution('debug','end','end')
	}
}
//add by zhou 20220725 end