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
				var dataDic = {};
				var outDataList1 = [];
				var outDataList4 = [];
				var outDataList5 = [];

				try {

					var date = getJapanDate();
					var nowDay = date.getDay();

					var endDay = jsAddDate(date, Number(nowDay)
							- Number(nowDay * 2 + 1));
					var start1 = jsAddDate(endDay, -6);
					var start4 = jsAddDate(endDay, -27);

					// ���t����
					var endDate = endDay;

					var startDate1 = start1;
					var startDate4 = start4;
					var dateDic = {};
					dateDic.endDate = endDate;
					dateDic.startDate1 = startDate1;
					dateDic.startDate4 = startDate4;

					endDay = getStrDate2(endDay);
					start1 = getStrDate2(start1);
					start4 = getStrDate2(start4);

					// 1 weeks datas
					var dataList1 = getActualForecast(true, dateDic, endDay,
							start1);
					if (dataList1.length > 0) {
						var conditionDic1 = getActualConditions(dataList1);
						var actualDic1 = getActualDatas(conditionDic1, true,
								dateDic, dataList1, endDay, start1);
						outDataList1 = dealOutData(dataList1, actualDic1, '1');
						dataDic['1'] = outDataList1;
					}
					// 4 weeks datas
					var dataList4 = getActualForecast(false, dateDic, endDay,
							start4);
					if (dataList4.length > 0) {

						var ary = [];
						var dataList4Ary = [];

						for (var i = 0; i < dataList4.length; i++) {
							var item = dataList4[i].item;
							if (ary.indexOf(item) == -1) {
								ary.push(item);
								dataList4Ary.push(dataList4[i]);
							}
						}

						var conditionDic4 = getActualConditions(dataList4Ary);
						var actualDic4 = getActualDatas(conditionDic4, false,
								dateDic, dataList4Ary, endDay, start4);
						outDataList4 = dealOutData(dataList4, actualDic4, '4');
						dataDic['4'] = outDataList4;
						var vendorList5 = getVendorDatas(start4, endDay);
						outDataList5 = dealOutData(vendorList5, actualDic4, '5');
						outDataList5 = dataToNew(outDataList5);
						dataDic['5'] = outDataList5;
					}

					if (outDataList1.length == 0 && outDataList4.length == 0) {
						log.error('�f�[�^�`�F�b�N', '�o�̓f�[�^������܂���A���m�F���������B');
						return;
					}

					var returnDic = {};
					returnDic['A0001'] = dataDic;

					return returnDic;

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

					var dataDic = JSON.parse(context.value);

					if (dataDic.hasOwnProperty('1')) {
						var dataList1 = dataDic['1'];
						var dic1 = getGroupData(dataList1);
						for ( var d1Id in dic1) {
							context.write({
								key : 'A' + d1Id,
								value : dic1[d1Id]
							});
						}
					}

					if (dataDic.hasOwnProperty('4')) {
						var dataList4 = dataDic['4'];
						var dic4 = getGroupData(dataList4);
						var dataList5 = dataDic['5'];
						var dic5 = getGroupData(dataList5);
						for ( var d4Id in dic4) {
							var d4List = dic4[d4Id];
							var d5List = dic5[d4Id];
							var bdList = [];
							bdList.push(d4List);
							bdList.push(d5List);
							context.write({
								key : 'B' + d4Id,
								value : bdList
							});
						}
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

					var datas = JSON.parse(context.values[0]);

					var subsidiary = context.key.substring(1);
					log.debug('subsidiary', subsidiary);
					var type = context.key.substring(0, 1);
					log.debug('type', type);

					var subsidiaryList = [];
					subsidiaryList.push(subsidiary);
					var kinouNameList = [];

					if (type == 'A') {
						kinouNameList.push('1');
						var mailAInfoDic = getMailInfo(subsidiaryList,
								kinouNameList);
						if (Object.keys(mailAInfoDic).length == 0) {
							log
									.error('�f�[�^�`�F�b�N',
											'���[�����(1 week)������܂���A���ݒ肭�������B');
							return;
						}

						if (datas.length > 0) {

							var detailDic1 = {};
							detailDic1.detailData = datas;

							// �e���v���[�g���擾����
							var templateFile = file
									.load({
										id : '�e���v���[�g/�d�q���[���e���v���[�g/�o�ח\����r���|�[�g���M�@�\_1week.html'
									});

							// ���t
							var headerDic = {};
							var dealDataDic = detailDic1.detailData[0];
							headerDic.dealDate = dealDataDic.startDate + '�`'
									+ dealDataDic.endDate;

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
								alias : "detailInfo1",
								data : detailDic1
							});

							// �{��
							var mailBody = renderer.renderAsString();
							// �^�C�g��
							var title = mailAInfoDic.title;
							var tmpRecipients = mailAInfoDic.recipients
									.split(';');

							email.send({
								author : mailAInfoDic.senderId,
								recipients : tmpRecipients,
								subject : title,
								body : mailBody
							});

							log.debug('Mail', '���[��1���M�������܂����B');
						}
					}

					if (type == 'B') {

						kinouNameList.push('2');
						var mailAInfoDic = getMailInfo(subsidiaryList,
								kinouNameList);
						if (Object.keys(mailAInfoDic).length == 0) {
							log.error('�f�[�^�`�F�b�N',
									'���[�����(4 weeks)������܂���A���ݒ肭�������B');
							return;
						}

						var data4List = datas[0];
						var data5List = datas[1];

						if (data4List.length > 0 && data5List.length > 0) {

							var detailDic4 = {};
							detailDic4.detailData = data4List;
							var detailDic5 = {};
							detailDic5.detailData = data5List;

							// �e���v���[�g���擾����
							templateFile = file
									.load({
										id : '�e���v���[�g/�d�q���[���e���v���[�g/�o�ח\����r���|�[�g���M�@�\_4week.html'
									});

							// ���t
							headerDic = {};
							dealDataDic = data4List[0];
							headerDic.dealDate = dealDataDic.startDate + '�`'
									+ dealDataDic.endDate;

							fileContents = templateFile.getContents();
							renderer = render.create();
							renderer.templateContent = fileContents;

							renderer.addCustomDataSource({
								format : render.DataSource.OBJECT,
								alias : "headerInfo",
								data : headerDic
							});

							renderer.addCustomDataSource({
								format : render.DataSource.OBJECT,
								alias : "detailInfo4",
								data : detailDic4
							});

							renderer.addCustomDataSource({
								format : render.DataSource.OBJECT,
								alias : "detailInfo5",
								data : detailDic5
							});

							// �{��
							mailBody = renderer.renderAsString();
							// �^�C�g��
							var title = mailAInfoDic.title;
							var tmpRecipients = mailAInfoDic.recipients
									.split(';');

							email.send({
								author : mailAInfoDic.senderId,
								recipients : tmpRecipients,
								subject : title,
								body : mailBody
							});

							log.debug('Mail', '���[��4���M�������܂����B');
						}
					}
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
			 * ���[�������擾����
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
					label : "���o�l"
				}), search.createColumn({
					name : "custrecord_djkk_mail_recipients",
					label : "����"
				}), search.createColumn({
					name : "custrecord_djkk_mail_title",
					label : "�^�C�g��"
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
			 * �O���[�v�f�[�^
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
			 * ���M�f�[�^����
			 * 
			 * @returns
			 */
			function dealOutData(dataList, actualDic, flg) {

				var resultList = [];

				for (var i = 0; i < dataList.length; i++) {
					var dataDic = dataList[i];
					var subsidiary = dataDic.subsidiary;
					var location = dataDic.location;
					var item = dataDic.item;
					var dicKey = subsidiary + '_' + location + '_' + item;
					var dataDicValue = actualDic[i];
					if (dataDicValue) {
						var actual = dataDicValue.quantityshiprecv;
						var inNum = dataDicValue.conversionrate;
						dataDic.actual = flg == '5' ? actual < 0 ? '('
								+ moneyAddComma(actual) + ')'
								: moneyAddComma(actual) : moneyAddComma(actual);
						dataDic.inNum = inNum;
						var fcOut = dataDic.fcOut;
						dataDic.fcOut = moneyAddComma(fcOut);
						var compare = (Number(actual) / Number(fcOut))
								.toFixed(1);
						dataDic.compare = compare;
						var compareCase = Math
								.round((Number(actual) - Number(fcOut))
										/ Number(inNum));
						dataDic.compareCase = moneyAddComma(compareCase);
						if (flg == '1') {
							if (compareCase > 1) {
								dataDic.dataKbn = '1';
								resultList.push(dataDic);
							}
						} else if (flg == '4') {
							dataDic.dataKbn = '4';
							resultList.push(dataDic);
						} else {
							dataDic.dataKbn = '5';
							resultList.push(dataDic);
						}
					}
				}

				return resultList;
			}

			/**
			 * ���уf�[�^�������擾����
			 */
			function getActualConditions(dataList) {

				var resultDic = {};

				var subsidiaryList = [];
				var locationList = [];
				var itemList = [];

				for (var i = 0; i < dataList.length; i++) {
					var tmpDic = dataList[i];
					// �A��
					var subsidiary = tmpDic.subsidiary;
					if (subsidiaryList.indexOf(subsidiary) == -1) {
						subsidiaryList.push(subsidiary);
					}
					// �ꏊ
					var location = tmpDic.location;
					if (locationList.indexOf(location) == -1) {
						locationList.push(location);
					}
					// �A�C�e��
					var item = tmpDic.item;
					if (itemList.indexOf(item) == -1) {
						itemList.push(item);
					}
				}

				resultDic.subsidiaryList = subsidiaryList;
				resultDic.locationList = locationList;
				resultDic.itemList = itemList;

				return resultDic;
			}

			/**
			 * 
			 */
			function getVendorDatas(startDay, endDay) {

				var resultList = [];

				var searchType = 'customrecord_djkk_sc_forecast';

				var searchFilters = [];

				searchFilters.push([ "custrecord_djkk_sc_fc_out",
						"greaterthan", "0" ]);
				searchFilters.push('AND');
				searchFilters.push([ 'custrecord_djkk_sc_fc_enddate', 'within',
						startDay, endDay ]);
				var searchColumns = [ search.createColumn({
					name : "custrecord_djkk_sc_fc_subsidiary",
					label : "DJ_�A��"
				}), search.createColumn({
					name : "custrecord_djkk_sc_fc_location_area",
					label : "DJ_�ꏊ�G���A"
				}), search.createColumn({
					name : "custrecord_djkk_sc_fc_item",
					label : "DJ_���i�R�[�h"
				}), search.createColumn({
					name : "othervendor",
					join : "CUSTRECORD_DJKK_SC_FC_ITEM",
					label : "�T�v���C���["
				}), search.createColumn({
					name : "formulatext",
					formula : "''",
					label : "���o�א�"
				}), search.createColumn({
					name : "custrecord_djkk_sc_fc_out",
					label : "�o�ח\�萔"
				}), search.createColumn({
					name : "formulatext",
					formula : "''",
					label : "��r"
				}) ];

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					for (var i = 0; i < searchResults.length; i++) {
						var lineDataDic = {};
						var searchResult = searchResults[i];
						// DJ_�A��0
						var subsidiary = searchResult
								.getValue(searchColumns[0]);
						lineDataDic.subsidiary = subsidiary;
						// DJ_�ꏊ�G���A1
						var location = searchResult.getValue(searchColumns[1]);
						lineDataDic.location = location;
						// �A�C�e��2
						var item = searchResult.getValue(searchColumns[2]);
						lineDataDic.item = item;
						// �T�v���C���[3
						var vendor = searchResult.getValue(searchColumns[3]);
						lineDataDic.vendor = vendor;
						var vendorText = searchResult.getText(searchColumns[3]);
						lineDataDic.vendorText = vendorText;
						// ���o�א�4
						var actual = searchResult.getValue(searchColumns[4]);
						lineDataDic.actual = actual;
						// �o�ח\�萔5
						var fcOut = searchResult.getValue(searchColumns[5]);
						lineDataDic.fcOut = fcOut;
						// ��r6
						var compare = searchResult.getValue(searchColumns[6]);
						lineDataDic.compare = compare;

						resultList.push(lineDataDic);
					}
				}

				return resultList;
			}

			/**
			 * DJ_�o�ח\����r���|�[�g���M�f�[�^���擾����
			 */
			function getActualForecast(weekFlg1, dateDic, endDay, startDay) {

				var resultList = [];

				var endDate = dateDic.endDate;
				var startDate1 = dateDic.startDate1;
				var startDate4 = dateDic.startDate4;

				var searchType = 'customrecord_djkk_sc_forecast';

				var searchFilters = [ [ "custrecord_djkk_sc_fc_out",
						"greaterthan", "0" ] ];

				if (weekFlg1) {
					searchFilters.push('AND');
					searchFilters.push([ 'custrecord_djkk_sc_fc_enddate', 'on',
							endDay ]);
				} else {
					searchFilters.push('AND');
					searchFilters.push([ 'custrecord_djkk_sc_fc_enddate',
							'within', startDay, endDay ]);
				}

				var searchColumns = [ search.createColumn({
					name : "custrecord_djkk_sc_fc_subsidiary",
					label : "DJ_�A��"
				}), search.createColumn({
					name : "custrecord_djkk_sc_fc_location_area",
					label : "DJ_�ꏊ�G���A"
				}), search.createColumn({
					name : "class",
					join : "CUSTRECORD_DJKK_SC_FC_ITEM",
					sort : search.Sort.ASC,
					label : "�u�����h"
				}), search.createColumn({
					name : "custrecord_djkk_sc_fc_item",
					label : "�A�C�e��"
				}), search.createColumn({
					name : "salesdescription",
					join : "CUSTRECORD_DJKK_SC_FC_ITEM",
					label : "�����i�K�i�j"
				}), search.createColumn({
					name : "formulatext",
					formula : "''",
					label : "���o�א�"
				}), search.createColumn({
					name : "custrecord_djkk_sc_fc_out",
					label : "�o�ח\�萔"
				}), search.createColumn({
					name : "formulatext",
					formula : "''",
					label : "��r"
				}), search.createColumn({
					name : "formulatext",
					formula : "''",
					label : "����"
				}), search.createColumn({
					name : "formulatext",
					formula : "''",
					label : "�����P�[�X��"
				}) ];

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					for (var i = 0; i < searchResults.length; i++) {
						var lineDataDic = {};
						var searchResult = searchResults[i];
						// DJ_�A��0
						var subsidiary = searchResult
								.getValue(searchColumns[0]);
						lineDataDic.subsidiary = subsidiary;
						// DJ_�ꏊ�G���A1
						var location = searchResult.getValue(searchColumns[1]);
						lineDataDic.location = location;
						// �u�����h2
						var brand = searchResult.getValue(searchColumns[2]);
						lineDataDic.brand = brand;
						if (brand) {
							var brandText = searchResult
									.getText(searchColumns[2]);
							lineDataDic.brandText = brand + '�F' + brandText;
						}
						// �A�C�e��3
						var item = searchResult.getValue(searchColumns[3]);
						lineDataDic.item = item;
						var itemText = searchResult.getText(searchColumns[3]);
						lineDataDic.itemText = itemText;
						// �����i�K�i�j4
						var description = searchResult
								.getValue(searchColumns[4]);
						lineDataDic.description = description;
						// ���o�א�5
						var actual = searchResult.getValue(searchColumns[5]);
						lineDataDic.actual = actual;
						// �o�ח\�萔6
						var fcOut = searchResult.getValue(searchColumns[6]);
						lineDataDic.fcOut = fcOut;
						// ��r7
						var compare = searchResult.getValue(searchColumns[7]);
						lineDataDic.compare = compare;
						// ����8
						var inNum = searchResult.getValue(searchColumns[8]);
						lineDataDic.inNum = inNum;
						// �����P�[�X��9
						var compareCase = searchResult
								.getValue(searchColumns[9]);
						lineDataDic.compareCase = compareCase;

						if (weekFlg1) {
							lineDataDic.startDate = getStrDate(startDate1);
							lineDataDic.endDate = getStrDate(endDate);
						} else {
							lineDataDic.startDate = getStrDate(startDate4);
							lineDataDic.endDate = getStrDate(endDate);
						}

						resultList.push(lineDataDic);
					}
				}

				return resultList;
			}

			/**
			 * ���{�̓��t���擾����
			 * 
			 * @returns YYYYMMSSHHMMSS
			 */
			function getStrDate(date) {

				var year = date.getFullYear();
				var month = npad(date.getMonth() + 1);
				var day = npad(date.getDate());

				return year + '/' + month + '/' + day;
			}

			/**
			 * ���{�̓��t���擾����
			 * 
			 * @returns YYYYMMSSHHMMSS
			 */
			function getStrDate2(date) {

				var year = date.getFullYear();
				var month = npad(date.getMonth() + 1);
				var day = npad(date.getDate());

				return day + '/' + month + '/' + year;
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
			 * �������ʃ��\�b�h
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
			 * �J���}�ŋ��z���t�H�[�}�b�g����
			 * 
			 * @param num
			 * @returns
			 */
			function moneyAddComma(num) {

				var retNum = '0';

				var strNum = num.toString();
				if (strNum == '0') {
					return retNum;
				}
				if (strNum.indexOf(".") > -1) {
					var splitedNum = strNum.toString().split(".");
					retNum = splitedNum[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g,
							"$1,")
							+ "." + splitedNum[1];
				} else {
					retNum = Math.round(num);
					retNum = String(retNum).replace(/(\d)(?=(\d\d\d)+(?!\d))/g,
							"$1,");
				}

				return retNum;
			}

			/**
			 * ���{�̓��t���擾����
			 * 
			 * @returns ���{�̓��t
			 */
			function getJapanDate() {

				var now = new Date();
				var offSet = now.getTimezoneOffset();
				var offsetHours = 9 + (offSet / 60);
				now.setHours(now.getHours() + offsetHours);

				return now;
			}

			/**
			 * ������������
			 * 
			 * @param pdate
			 *            ���t
			 * @param pdays
			 *            ����
			 * @returns �V���t
			 */
			function jsAddDate(pdate, pdays) {
				var dt = new Date(pdate.getTime());
				dt.setDate(dt.getDate() + pdays);
				return dt;
			}

			function getActualDatas(conditionDic, weekFlg1, dateDic, dataList,
					end, start) {

				var resultDic = [];

				var itemList = conditionDic.itemList;

				if (weekFlg1) {

					for (var x = 0; x < dataList.length; x++) {

						// 1 weeks ����
						var idAry = [];

						var resList2 = searchItemRcptLastWeekValues(end, start);
						var resList3 = searchItemRcptLastWeekAbValues(end,
								start);

						if (resList2.length > 0) {
							for (var i = 0; i < resList2.length; i++) {

								var itemId = resList2[i].getValue({
									name : 'item',
									summary : search.Summary.GROUP
								});

								if (itemId == dataList[x].item) {

									var dataDic = {};

									var quantity2 = resList2[i].getValue({
										name : 'quantity',
										summary : search.Summary.SUM
									});
									var quantity3 = resList3[i].getValue({
										name : 'quantity',
										summary : search.Summary.SUM
									});

									dataDic.quantityshiprecv = Number(quantity2)
											- Number(quantity3);

									dataDic.conversionrate = resList2[i]
											.getValue({
												name : 'custcol_djkk_conversionrate',
												summary : search.Summary.MAX
											});
								}
							}
						}
						resultDic.push(dataDic);

					}

				} else {
					// 4 weeks ����
					for (var x = 0; x < dataList.length; x++) {

						var idAry = [];

						var item = dataList[x].item;

						var resList = searchItemRcptFourWeekValues(start, end,
								item);
						if (resList.length > 0) {
							for (var i = 0; i < resList.length; i++) {

								var dataDic = {};

								var quantity = resList[i].getValue({
									name : 'quantity',
									summary : search.Summary.SUM
								});

								dataDic.quantityshiprecv = quantity;
								dataDic.conversionrate = resList[i].getValue({
									name : 'custcol_djkk_conversionrate',
									summary : search.Summary.MAX
								});
								resultDic.push(dataDic);
							}

						}

					}

				}

				return resultDic;
			}

			function searchItemRcptLastWeekValues(end, start) {

				var searchType = 'itemreceipt';

				var searchFilters = [ [ 'trandate', 'within', start, end ],
						'AND', [ 'type', 'anyof', 'ItemRcpt' ], 'AND',
						[ 'mainline', 'is', 'F' ] ];

				var searchColumns = [];
				searchColumns.push({
					name : 'quantity',
					summary : search.Summary.SUM
				});
				searchColumns.push({
					name : 'item',
					summary : search.Summary.GROUP
				});
				searchColumns.push({
					name : 'custcol_djkk_conversionrate',
					summary : search.Summary.MAX
				});
				searchColumns.push({
					name : 'subsidiary',
					summary : search.Summary.MAX
				});

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				return searchResults;
			}

			function searchItemRcptLastWeekAbValues(end, start) {

				var searchType = 'itemfulfillment';

				var searchFilters = [ [ 'trandate', 'within', start, end ],
						'AND', [ 'type', 'anyof', 'ItemShip' ], 'AND',
						[ 'mainline', 'any', '' ], 'AND',
						[ 'taxline', 'is', 'F' ], 'AND',
						[ 'shipping', 'is', 'F' ] ];

				var searchColumns = [];
				searchColumns.push({
					name : 'quantity',
					summary : search.Summary.SUM
				});
				searchColumns.push({
					name : 'item',
					summary : search.Summary.GROUP
				});
				searchColumns.push({
					name : 'custcol_djkk_conversionrate',
					summary : search.Summary.MAX
				});
				searchColumns.push({
					name : 'subsidiary',
					summary : search.Summary.MAX
				});

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				return searchResults;
			}

			function searchItemRcptFourWeekValues(start, end, item) {

				var searchType = 'itemreceipt';

				var searchFilters = [ [ 'trandate', 'within', start, end ],
						'AND', [ 'type', 'anyof', 'ItemRcpt' ], 'AND',
						[ 'mainline', 'is', 'F' ], 'AND',
						[ 'item', 'anyof', item ] ];

				var searchColumns = [];
				searchColumns.push({
					name : 'quantity',
					summary : search.Summary.SUM
				});
				searchColumns.push({
					name : 'item',
					summary : search.Summary.GROUP
				});
				searchColumns.push({
					name : 'altname',
					join : 'vendor',
					summary : search.Summary.GROUP
				});
				searchColumns.push({
					name : 'custcol_djkk_conversionrate',
					summary : search.Summary.MAX
				});

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				return searchResults;
			}

			function dataToNew(data) {

				var itemAry = [];
				var rtnData = {};
				var rtnObj = [];

				for (var i = 0; i < data.length; i++) {
					var item = data[i].item;
					if (itemAry.indexOf(item) != -1) {
						var obj = rtnData[item];

						rtnData[item].actual = Number(obj.actual)
								+ Number(data[i].actual);
						rtnData[item].fcOut = Number(obj.fcOut)
								+ Number(data[i].fcOut);
						rtnData[item].compare = Number(obj.compare)
								+ Number(data[i].compare);
						rtnData[item].compareCase = Number(obj.compareCase)
								+ Number(data[i].compareCase);

					} else {
						itemAry.push(item);
						rtnData[item] = data[i];
					}
				}

				for ( var key in rtnData) {
					rtnObj.push(rtnData[key]);
				}

				return rtnObj;
			}
		});