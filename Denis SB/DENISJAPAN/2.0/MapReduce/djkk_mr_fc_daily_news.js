/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/runtime', 'N/search', 'N/file', 'N/render', 'N/email', 'N/format' ],
		function(runtime, search, file, render, email, format) {

			/**
			 * Marks the beginning of the Map/Reduce process and generates input
			 * data.
			 * 
			 * @typedef {Object} ObjectRef
			 * @property {number} id - Internal ID of the record instance
			 * @property {string} type - Record type id
			 * @return {Array|Object|Search|RecordRef} inputSummary
			 * @since 2015.1
			 */
			function getInputData() {
				var dealDic = {};
				var listList = [];

				try {

					var scForecastDataDic = getScForecastData();
					if (Object.keys(scForecastDataDic).length > 0) {
						var soForecastDataDic = getSoForecastData(scForecastDataDic);

						for ( var scId in scForecastDataDic) {
							var tmpScForecastDataDic = scForecastDataDic[scId];

							if (soForecastDataDic.hasOwnProperty(scId)) {
								var tmpSoForecastDataDic = soForecastDataDic[scId];
								tmpScForecastDataDic.fcnum = tmpSoForecastDataDic.fcnum;
								tmpScForecastDataDic.employee = tmpSoForecastDataDic.employee;
								tmpScForecastDataDic.brandcode = tmpSoForecastDataDic.brandcode;
								// リスト
								listList.push(tmpScForecastDataDic);
							}

						}

					}
					if (listList.length == 0) {
						log.error('データチェック', '出力データがありません、ご確認ください。');
						return;
					}

					dealDic['A'] = listList;

					return dealDic;

				} catch (ex) {

					log.error({
						title : 'getInputData error',
						details : ex
					});

					throw ex;
				}
			}
			/**
			 * Executes when the map entry point is triggered and applies to
			 * each key/value pair.
			 * 
			 * @param {MapSummary}
			 *            context - Data collection containing the key/value
			 *            pairs to process through the map stage
			 * @since 2015.1
			 */
			function map(context) {

				try {

					var values = JSON.parse(context.value);

					var dataDic = getGroupData(values);
					for ( var ddId in dataDic) {
						context.write({
							key : ddId,
							value : dataDic[ddId]
						});
					}
				} catch (ex) {

					log.error({
						title : 'map error',
						details : ex
					});

					throw ex;
				}
			}

			/**
			 * Executes when the reduce entry point is triggered and applies to
			 * each group.
			 * 
			 * @param {ReduceSummary}
			 *            context - Data collection containing the groups to
			 *            process through the reduce stage
			 * @since 2015.1
			 */
			function reduce(context) {

				try {

					var key = context.key;
					var values = JSON.parse(context.values[0]);
					log.debug('key', key);
					log.debug('values', values);

					var subsidiaryList = [];
					subsidiaryList.push(key);
					var kinouNameList = [];
					kinouNameList.push('3');
					var mailAInfoDic = getMailInfo(subsidiaryList,
							kinouNameList);
					if (Object.keys(mailAInfoDic).length == 0) {
						log.error('データチェック', 'メール情報がありません、ご設定ください。');
						return;
					}

					var headerDic = {};
					headerDic.japanDate = getYyyyMmDd();
					var userList = [];
					var brandList = [];
					for (var i = 0; i < values.length; i++) {
						var tmpDataDic = values[i];
						var employee = tmpDataDic.employee;
						if (employee) {
							if (userList.indexOf(employee) == -1) {
								userList.push(employee);
							}
						}
						var brandcode = tmpDataDic.brandcode;
						if (brandcode) {
							if (brandList.indexOf(brandcode) == -1) {
								brandList.push(brandcode);
							}
						}
					}
					headerDic.userData = userList.join(",");
					headerDic.brandData = brandList.join(",");

					var detailDic = {};
					detailDic.detailData = values;

					// テンプレートを取得する
					var templateFile = file.load({
						id : 'テンプレート/電子メールテンプレート/日次FC更新情報送信機能.html'
					});

					var fileContents = templateFile.getContents();
					var renderer = render.create();
					renderer.templateContent = fileContents;
					renderer.addCustomDataSource({
						format : render.DataSource.OBJECT,
						alias : "headerInfo",
						data : headerDic
					});
					renderer.addCustomDataSource({
						format : render.DataSource.OBJECT,
						alias : "detailInfo",
						data : detailDic
					});

					// 本文
					var mailBody = renderer.renderAsString();
					// タイトル
					var title = mailAInfoDic.title;
					var tmpRecipients = mailAInfoDic.recipients.split(';');

					email.send({
						author : mailAInfoDic.senderId,
						recipients : tmpRecipients,
						subject : title,
						body : mailBody
					});

					log.debug('Mail', 'メール送信完了しました。');

				} catch (ex) {

					log.error({
						title : 'reduce error',
						details : ex
					});

					throw ex;
				}
			}

			/**
			 * Executes when the summarize entry point is triggered and applies
			 * to the result set.
			 * 
			 * @param {Summary}
			 *            summary - Holds statistics regarding the execution of
			 *            a map/reduce script
			 * @since 2015.1
			 */
			function summarize(summary) {

				try {

				} catch (ex) {

					log.error({
						title : 'summarize error',
						details : ex
					});

					throw ex;
				}
			}

			return {
				getInputData : getInputData,
				map : map,
				reduce : reduce,
				summarize : summarize
			};

			/**
			 * メール情報を取得する
			 */
			function getMailInfo(subsidiaryList, kinouNameList) {

				var resultDic = {};

				var searchType = 'customrecord_djkk_mail_send_info';
				var searchFilters = [
						[ "isinactive", "is", "F" ],
						"AND",
						[ "custrecord_djkk_mail_subsidiary", "anyof",
								subsidiaryList ],
						"AND",
						[ "custrecord_djkk_mail_kinou_name", "anyof",
								kinouNameList ] ];
				var searchColumns = [ search.createColumn({
					name : "custrecord_djkk_mail_sender",
					label : "差出人"
				}), search.createColumn({
					name : "custrecord_djkk_mail_recipients",
					label : "宛先"
				}), search.createColumn({
					name : "custrecord_djkk_mail_title",
					label : "タイトル"
				}) ];

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					var tmpResult = searchResults[0];
					resultDic.senderId = tmpResult.getValue(searchColumns[0]);
					resultDic.recipients = tmpResult.getValue(searchColumns[1]);
					resultDic.title = tmpResult.getValue(searchColumns[2]);
				}

				return resultDic;
			}

			/**
			 * グループデータ
			 */
			function getGroupData(dataList) {

				var dataDic = {};

				for (var i = 0; i < dataList.length; i++) {
					var tmpDataList = [];
					var tmpDic = dataList[i];
					tmpDataList.push(tmpDic);
					var subsidiary = tmpDic.subsidiary;
					var dicSubValue = dataDic[subsidiary];
					if (!dicSubValue) {
						dataDic[subsidiary] = tmpDataList;
					} else {
						var addDicList = dicSubValue.concat(tmpDataList);
						dataDic[subsidiary] = addDicList;
					}
				}

				return dataDic;
			}

			/**
			 * DJ_SC課FCデータを取得する
			 */
			function getScForecastData() {

				var resultDic = {};

				var searchType = 'customrecord_djkk_sc_forecast';

				var searchFilters = [];
				searchFilters.push([ 'isinactive', 'is', 'F' ]);

				var searchColumns = [
				// アイテムコード0
				search.createColumn({
					name : 'itemid',
					join : 'CUSTRECORD_DJKK_SC_FC_ITEM',
					summary : search.Summary.GROUP
				}),

				// Description1
				search.createColumn({
					name : 'displayname',
					join : 'CUSTRECORD_DJKK_SC_FC_ITEM',
					summary : search.Summary.GROUP
				}),

				// 倉庫2
				search.createColumn({
					name : 'custrecord_djkk_sc_fc_location_area',
					summary : search.Summary.GROUP
				}),

				// TendQty3
				search.createColumn({
					name : 'custrecord_djkk_sc_fc_in',
					summary : search.Summary.SUM
				}),

				// 開始日4
				search.createColumn({
					name : 'custrecord_djkk_sc_fc_startdate',
					summary : search.Summary.MIN
				}),

				// 終了日5
				search.createColumn({
					name : 'custrecord_djkk_sc_fc_enddate',
					summary : search.Summary.MAX
				}),

				// WeekCount6
				search.createColumn({
					name : 'formulanumeric',
					summary : search.Summary.SUM,
					formula : '1'
				}),

				// Salesman7
				search.createColumn({
					name : 'lastmodifiedby',
					summary : search.Summary.GROUP
				}),

				// DJ_連結8
				search.createColumn({
					name : 'custrecord_djkk_sc_fc_subsidiary',
					summary : search.Summary.GROUP
				}),

				// 週間累計数9
				search.createColumn({
					name : "custrecord_djkk_sc_fc_out",
					summary : "SUM"
				}),

				search.createColumn({
					name : 'internalid',
					join : 'CUSTRECORD_DJKK_SC_FC_ITEM',
					summary : search.Summary.GROUP
				}) ];

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {

					for (var i = 0; i < searchResults.length; i++) {
						var tmpResult = searchResults[i];
						// 連結
						var tmpSubsidiary = tmpResult
								.getValue(searchColumns[8]);
						// アイテムコード
						var tmpItem = tmpResult.getValue(searchColumns[10]);
						// 倉庫
						var tmpLocation = tmpResult.getValue(searchColumns[2]);

						var itemid = tmpResult.getValue(searchColumns[0]);
						var displayname = tmpResult.getValue(searchColumns[1]);
						var locationArea = tmpResult.getText(searchColumns[2]);
						var fcIn = tmpResult.getValue(searchColumns[3]);
						var startdate = tmpResult.getValue(searchColumns[4]);
						var enddate = tmpResult.getValue(searchColumns[5]);
						var formulanumeric = tmpResult
								.getValue(searchColumns[6]);
						var lastmodifiedby = tmpResult
								.getValue(searchColumns[7]);
						var subsidiary = tmpResult.getValue(searchColumns[8]);

						var obj = {
							"item" : itemid,
							"scription" : displayname,
							"location" : locationArea,
							"fcnum" : fcIn,
							"startdate" : formatDate(startdate),
							"enddate" : formatDate(enddate),
							"weekcount" : formulanumeric,
							"employee" : lastmodifiedby,
							"subsidiary" : subsidiary
						};

						var dicKeyList = [];
						dicKeyList.push(tmpSubsidiary);
						dicKeyList.push(tmpItem);
						dicKeyList.push(tmpLocation);
						dicKeyList.push(lastmodifiedby);

						resultDic[dicKeyList.join('=|=')] = obj;
					}
				}
				return resultDic;
			}

			function getSoForecastData(scForecastDataDic) {

				var resultDic = {};

				var columnsList = [];
				columnsList.push('custrecord_djkk_so_fc_subsidiary');
				columnsList.push('custrecord_djkk_so_fc_item');
				columnsList.push('custrecord_djkk_so_fc_location_area');

				var operatorDic = {};
				operatorDic.custrecord_djkk_so_fc_subsidiary = 'anyof';
				operatorDic.custrecord_djkk_so_fc_item = 'anyof';
				operatorDic.custrecord_djkk_so_fc_location_area = 'anyof';
				var valueList = [];
				for ( var dicId in scForecastDataDic) {
					var tmpIds = dicId.split('=|=');
					var valueObj = {};
					valueObj.custrecord_djkk_so_fc_subsidiary = tmpIds[0];
					valueObj.custrecord_djkk_so_fc_item = tmpIds[1];
					valueObj.custrecord_djkk_so_fc_location_area = tmpIds[2];
					valueList.push(valueObj);
				}

				var searchType = 'customrecord_djkk_so_forecast';
				var searchFilters = [];
				searchFilters.push([ 'isinactive', 'is', 'F' ]);
				searchFilters.push('AND');
				searchFilters.push(getManyFieldOrFilters(columnsList,
						operatorDic, valueList));
				var searchColumns = [
				// DJ_連結
				search.createColumn({
					name : "custrecord_djkk_so_fc_subsidiary"
				}),
				// DJ_年
				search.createColumn({
					name : "custrecord_djkk_so_fc_year"
				}),
				// DJ_商品コード
				search.createColumn({
					name : "custrecord_djkk_so_fc_item"
				}),
				// DJ_場所エリア
				search.createColumn({
					name : "custrecord_djkk_so_fc_location_area"
				}),
				// DJ_担当者コード
				search.createColumn({
					name : "custrecord_djkk_so_fc_employee"
				}),
				// DJ_FC数
				search.createColumn({
					name : "custrecord_djkk_so_fc_fcnum"
				}),
				// DJ_ブランドコード
				search.createColumn({
					name : "class",
					join : "CUSTRECORD_DJKK_SO_FC_ITEM"
				}) ];

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					for (var i = 0; i < searchResults.length; i++) {
						var tmpResult = searchResults[i];
						// 連結
						var tmpSubsidiary = tmpResult
								.getValue(searchColumns[0]);
						// 年
						var tmpYear = tmpResult.getValue(searchColumns[1]);
						// アイテムコード
						var tmpItem = tmpResult.getValue(searchColumns[2]);
						// 倉庫
						var tmpLocation = tmpResult.getValue(searchColumns[3]);

						var tmpEmployeeValue = tmpResult
								.getValue(searchColumns[4]);

						// DJ_担当者コード
						var tmpEmployeeValue = tmpResult
								.getValue(searchColumns[4]);

						var tmpEmployee = tmpResult.getText(searchColumns[4]);
						// DJ_FC
						var tmpFcNum = tmpResult.getValue(searchColumns[5]);
						// DJ_ブランドコード
						var tmpBrandCode = tmpResult.getText(searchColumns[6]);

						var dicKeyList = [];
						dicKeyList.push(tmpSubsidiary);
						dicKeyList.push(tmpItem);
						dicKeyList.push(tmpLocation);
						dicKeyList.push(tmpEmployeeValue);

						var valueDic = {};
						valueDic.employee = tmpEmployee;
						valueDic.fcnum = tmpFcNum;
						valueDic.brandcode = tmpBrandCode;

						resultDic[dicKeyList.join('=|=')] = valueDic;
					}
				}
				return resultDic;
			}

			/**
			 * 日付フォーマット
			 */
			function formatDate(paramDate) {

				var monthDic = {};
				monthDic['1'] = 'Jan';
				monthDic['2'] = 'Feb';
				monthDic['3'] = 'Mar';
				monthDic['4'] = 'Apr';
				monthDic['5'] = 'May';
				monthDic['6'] = 'Jun';
				monthDic['7'] = 'Jul';
				monthDic['8'] = 'Aug';
				monthDic['9'] = 'Sept';
				monthDic['10'] = 'Oct';
				monthDic['11'] = 'Nov';
				monthDic['12'] = 'Dec';

				var fdate = format.parse({
					type : format.Type.DATE,
					value : paramDate
				});

				var month = fdate.getMonth() + 1;
				var day = fdate.getDate();

				var result = monthDic[month.toString()] + '-' + day;

				return result;
			}

			/**
			 * 検索共通メソッド
			 */
			function createSearch(searchType, searchFilters, searchColumns) {

				var resultList = [];
				var resultIndex = 0;
				var resultStep = 1000;

				var objSearch = search.create({
					type : searchType,
					filters : searchFilters,
					columns : searchColumns
				});
				var objResultSet = objSearch.run();

				do {
					var results = objResultSet.getRange({
						start : resultIndex,
						end : resultIndex + resultStep
					});

					if (results.length > 0) {
						resultList = resultList.concat(results);
						resultIndex = resultIndex + resultStep;
					}
				} while (results.length == 1000);

				return resultList;
			}

			/**
			 * 複数フィールドORフィルターを作成する
			 * 
			 * @param columnsList
			 *            フィールドリスト
			 * @param operatorDic
			 *            操作符号
			 * @param valuesList
			 *            バリューリスト
			 * @returns ORフィルターリスト
			 */
			function getManyFieldOrFilters(columnsList, operatorDic, valuesList) {

				var orFilters = [];
				for (var i = 0; i < valuesList.length; i++) {
					var tmpObj = valuesList[i];
					var subFilters = [];
					for (var j = 0; j < columnsList.length; j++) {
						var tmpColumn = columnsList[j];
						subFilters.push([ tmpColumn, operatorDic[tmpColumn],
								tmpObj[tmpColumn] ]);
						if (j != columnsList.length - 1) {
							subFilters.push('AND');
						}
					}
					orFilters.push(subFilters);
					if (i != valuesList.length - 1) {
						orFilters.push('OR');
					}
				}

				return orFilters;
			}

			/**
			 * 
			 */
			function getYyyyMmDd() {

				var fdate = getJapanDate();
				var year = fdate.getFullYear();
				var month = npad(fdate.getMonth() + 1);
				var day = npad(fdate.getDate());

				return year + '/' + month + '/' + day;
			}

			/**
			 * @param v
			 * @returns
			 */
			function npad(v) {
				if (v >= 10) {
					return v;
				} else {
					return '0' + v;
				}
			}

			/**
			 * 日本日付の取得メソッド
			 */
			function getJapanDate() {

				// システム時間
				var now = new Date();
				var offSet = now.getTimezoneOffset();
				var offsetHours = 9 + (offSet / 60);
				now.setHours(now.getHours() + offsetHours);

				return now;
			}
		});
