/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/runtime', 'N/search', 'N/format', 'N/file', 'N/record' ],
		function(runtime, search, format, file, record) {

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

				try {

					var script = runtime.getCurrentScript();

					// �ۑ��t�H���_�[ID
					var saveFolderId = script.getParameter({
						name : 'custscript_djkk_delivered_folder'
					});
					if (!saveFolderId) {
						log.error('���̓`�F�b�N', '�ۑ��t�H���_�[ID����͂��Ă��������B');
						return;
					}

					// �o�͏����擾����
					var resultDic = getItemFulfillMentInfo();
					if (resultDic && Object.keys(resultDic).length == 0) {
						log.error('�f�[�^�`�F�b�N', '�o�̓f�[�^������܂���A���m�F���������B');
						return;
					}

					return resultDic;

				} catch (e) {
					log.error('getInputData�@�G���[', e);
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

					var key = context.key;
					log.debug('map key', key);
					var value = context.value;
					log.debug('map value', value);
					var dataList = JSON.parse(value);
					var ifmDicInfo = {};
					var soId = '';
					for (var i = 0; i < dataList.length; i++) {
						var tmpDataList = dataList[i];
						if (!soId) {
							soId = tmpDataList[34];
						}
						var tmpItem = tmpDataList[32];
						var tmpLine = tmpDataList[33];
						var ifmDicValue = ifmDicInfo[tmpLine];
						if (!ifmDicValue) {
							ifmDicInfo[tmpLine] = tmpItem;
						}
						tmpDataList.push('');
					}

					var orderLineDic = loadItemFulfillMentInfo(key);

					var lineList = [];
					var itemList = [];
					var orderLineList = [];
					for ( var line in orderLineDic) {
						var itemValue = ifmDicInfo[line];
						var orderLine = orderLineDic[line];
						if (lineList.indexOf(orderLine) == -1) {
							lineList.push(orderLine);
							orderLineList.push(orderLine);
						}
						if (itemList.indexOf(itemValue) == -1) {
							itemList.push(itemValue);
						}
						for (var i = 0; i < dataList.length; i++) {
							var tmpDataList = dataList[i];
							var tmpItem = tmpDataList[32];
							var tmpLine = tmpDataList[33];
							if ((line == tmpLine) && (itemValue == tmpItem)) {
								tmpDataList[36] = orderLine;
							}
						}
					}
					log.debug('soId', soId);
					log.debug('line', JSON.stringify(lineList));
					log.debug('item', JSON.stringify(itemList));
					log.debug('orderLineList', JSON.stringify(orderLineList));

					var soResultDic = getSoDetailInfo(soId, itemList, lineList);
					for (var i = 0; i < dataList.length; i++) {
						var tmpDataList = dataList[i];
						var tmpItem = tmpDataList[32];
						var tmpOrderLine = tmpDataList[36];
						var dicKey = tmpOrderLine + '_' + tmpItem;
						var dicDatas = soResultDic[dicKey];
						if (dicDatas) {
							// �����敪
							tmpDataList[13] = dicDatas.priceLevel;
							// ���z
							tmpDataList[14] = dicDatas.amount;
							// ����Ŋz
							tmpDataList[16] = dicDatas.taxAmount;
							// ���[�U�Ǘ��ԍ�
							tmpDataList[18] = dicDatas.userNum;
							// ���[�U���l
							tmpDataList[19] = dicDatas.userRemark;
							// ���[�J�[�i�ڃR�[�h
							tmpDataList[20] = dicDatas.itemCode;
						}
					}

					if (orderLineList.length > 0) {

						var ifRecord = record.load({
							type : 'itemfulfillment',
							id : key
						});
                
						for (var l = 0; l < orderLineList.length; l++) {
							ifRecord.setSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_djkk_rios_snd_flg',
								line : Number(orderLineList[l]) - 1,
								value : true
							});
						}
						ifRecord.save();
					}

					var subsidiary = dataList[0][4];
					context.write({
						key : subsidiary,
						value : dataList
					});

				} catch (e) {
					log.error('map �G���[', e);
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
					log.debug('reduce key', context.key);
					log.debug('reduce values', context.values);

					var script = runtime.getCurrentScript();
					// �ۑ��t�H���_�[ID
					var saveFolderId = script.getParameter({
						name : 'custscript_djkk_delivered_folder'
					});

					var headDic = {};
					var strCreateDate = '';
					var dataKbn = '';
					var headMemo = '';
					var createFileDataList = [];
					for (var i = 0; i < context.values.length; i++) {
						var subList = JSON.parse(context.values[i]);
						for (var j = 0; j < subList.length; j++) {
							var tmpSubData = subList[j];
							if (!dataKbn) {
								dataKbn = tmpSubData[1];
							}
							if (!strCreateDate) {
								strCreateDate = tmpSubData[17];
							}
							if (!headMemo) {
								headMemo = tmpSubData[35];
							}
							tmpSubData.length = tmpSubData.length - 5;
							createFileDataList.push(tmpSubData);
						}

					}
					var strCDateYmd = strCreateDate.substring(0, 8);
					var subFileName = strCDateYmd + dataKbn + context.key;
					var resultNum = getMaxFileName(saveFolderId, subFileName);
					if (!resultNum) {
						resultNum = 1;
					} else {
						resultNum = parseInt(resultNum) + 1;
					}
					var fileName = subFileName + zeropad(resultNum, 4);
					createDetailFile(createFileDataList, fileName + '.csv',
							saveFolderId);

					headDic.strCreateDate = strCreateDate;
					headDic.count = createFileDataList.length;
					headDic.fileName = fileName;
					headDic.headMemo = headMemo;
					context.write({
						key : context.key,
						value : headDic
					});
				} catch (e) {
					log.error('reduce �G���[', e);
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
					var script = runtime.getCurrentScript();
					// �ۑ��t�H���_�[ID
					var saveFolderId = script.getParameter({
						name : 'custscript_djkk_delivered_folder'
					});

					summary.output.iterator().each(function(key, value) {
						log.debug('summarize key', key);
						log.debug('summarize value', value);
						var dataDic = JSON.parse(value);
						createHeadFile(key, dataDic, saveFolderId);
						return true;
					});
				} catch (e) {
					log.error('summarize �G���[', e);
				}
			}

			return {
				getInputData : getInputData,
				map : map,
				reduce : reduce,
				summarize : summarize
			};

			/**
			 * SO�ꕔ�����擾����
			 */
			function getSoDetailInfo(soId, itemIdList, lineIdList) {

				var resultDic = {};

				var searchType = 'transaction';

				var searchFilters = [ [ "type", "anyof", "SalesOrd" ], "AND",
						[ "mainline", "is", "F" ], "AND",
						[ "taxline", "is", "F" ], "AND",
						[ "internalid", "anyof", soId ], "AND",
						[ "item", "anyof", itemIdList ] ];
				if (lineIdList.length > 0) {
					searchFilters.push("AND");
					searchFilters.push(getOrFilters('line', 'equalto',
							lineIdList));
				}
				var searchColumns = [ search.createColumn({
					name : "line",
					label : "���C��ID"
				}), search.createColumn({
					name : "item",
					label : "�A�C�e��"
				}), search.createColumn({
					name : "formulatext",
					formula : "{amount}",
					label : "�v�Z���i�e�L�X�g�j"
				}), search.createColumn({
					name : "formulatext",
					formula : "{taxamount}",
					label : "�v�Z���i�e�L�X�g�j"
				}), search.createColumn({
					name : "custcol_djkk_rios_user_num",
					label : "DJ_RIOS���[�U�Ǘ��ԍ�"
				}), search.createColumn({
					name : "custcol_djkk_rios_user_remark",
					label : "DJ_RIOS���[�U���l"
				}), search.createColumn({
					name : "custcol_djkk_item_code",
					label : "DJ_�A�C�e��(�R�[�h)"
				}), search.createColumn({
					name : "formulatext",
					formula : "''",
					label : "���i����"
				}) ];

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					for (var i = 0; i < searchResults.length; i++) {
						var searchResult = searchResults[i];
						var tmpDic = {};
						// ���C��ID 0
						var line = searchResult.getValue(searchColumns[0]);
						// �A�C�e��
						var item = searchResult.getValue(searchColumns[1]);
						// ���z
						var amount = searchResult.getValue(searchColumns[2]);
						tmpDic.amount = amount;
						// ���z�i�Łj
						var taxAmount = searchResult.getValue(searchColumns[3]);
						tmpDic.taxAmount = taxAmount;
						// DJ_RIOS���[�U�Ǘ��ԍ�
						var userNum = searchResult.getValue(searchColumns[4]);
						tmpDic.userNum = userNum;
						// DJ_RIOS���[�U���l
						var userRemark = searchResult
								.getValue(searchColumns[5]);
						tmpDic.userRemark = userRemark;
						// DJ_�A�C�e��(�R�[�h)
						var itemCode = searchResult.getValue(searchColumns[6]);
						tmpDic.itemCode = itemCode;
						// ���i����
						var priceLevel = searchResult
								.getValue(searchColumns[7]);
						tmpDic.priceLevel = priceLevel;

						var dicKey = line + '_' + item;
						resultDic[dicKey] = tmpDic;
					}
				}

				return resultDic;
			}

			/**
			 * �z�������擾����
			 */
			function loadItemFulfillMentInfo(recordId) {

				var resultDic = {};

				var recordType = 'itemfulfillment';

				var recordRecord = record.load({
					type : recordType,
					id : recordId,
					isDynamic : false,
					defaultValues : {}
				});
				var itemCount = recordRecord.getLineCount('item');
				for (var i = 0; i < itemCount; i++) {
					var line = recordRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'line',
						line : i
					});
					var orderLine = recordRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'orderline',
						line : i
					});
					var dicValue = resultDic[line];
					if (!dicValue) {
						resultDic[line] = orderLine;
					}
				}

				return resultDic;
			}

			/**
			 * �z�������擾����
			 */
			function getItemFulfillMentInfo() {

				var resultDic = {};

				var searchType = 'transaction';

				var searchFilters = [
						["type", "anyof", "ItemShip"],
						"AND",
						[ "createdfrom.custbody_djkk_edi_so_kbn", "is", "RIOS" ],
						"AND", [ "taxline", "is", "F" ], "AND",
						[ "shipping", "is", "F" ], "AND",
						[ "cogs", "is", "F" ], "AND",
						[ "status", "anyof", "ItemShip:C" ], "AND",
						[ "createdfrom.type", "anyof", "SalesOrd" ], "AND",
						[ "custcol_djkk_rios_snd_flg", "is", "F" ] ];

				var searchColumns = [
						search.createColumn({
							name : "custcol_djkk_maker_serial_code",
							label : "���[�J�[�Ǘ��ԍ�"
						}),
						search.createColumn({
							name : "formulatext",
							formula : "'0'",
							label : "�f�[�^�敪"
						}),
						search.createColumn({
							name : "otherrefnum",
							join : "createdFrom",
							label : "����NO."
						}),
						search.createColumn({
							name : "custbody_djkk_so_edaba",
							join : "createdFrom",
							label : "�����}��"
						}),
						search.createColumn({
							name : "custrecord_djkk_subsidiary_code",
							join : "subsidiary",
							sort : search.Sort.ASC,
							label : "���[�J�[�R�[�h"
						}),
						search.createColumn({
							name : "quantity",
							label : "����"
						}),
						search
								.createColumn({
									name : "formulatext",
									formula : "TO_CHAR({createdfrom.custbody_djkk_delivery_date}, 'YYYYMMDD')",
									label : "�[����"
								}),
						search
								.createColumn({
									name : "formulatext",
									formula : "to_char({createdfrom.custbody_djkk_rios_base_date}, 'YYYYMMDD')",
									label : "���"
								}),
						search
								.createColumn({
									name : "formulatext",
									formula : "TO_CHAR({createdfrom.custbody_djkk_delivery_hopedate}, 'YYYYMMDD')",
									label : "�o�ד�"
								}),
						search.createColumn({
							name : "inventorynumber",
							join : "inventoryDetail",
							label : "���b�g�ԍ�"
						}),
						search
								.createColumn({
									name : "formulatext",
									formula : "TO_CHAR({inventorydetail.expirationdate}, 'YYYYMMDD')",
									label : "�L������"
								}),
						search.createColumn({
							name : "custbody_djkk_rios_bibo_bito",
							join : "createdFrom",
							label : "�r�{�E�r�g���敪"
						}),
						search.createColumn({
							name : "custbody_djkk_rios_so_keiro",
							join : "createdFrom",
							label : "�����o�H"
						}),
						search.createColumn({
							name : "formulatext",
							formula : "''",
							label : "�����敪"
						}),
						search.createColumn({
							name : "amount",
							label : "���z"
						}),
						search.createColumn({
									name : "formulatext",
									formula : "TO_CHAR({accountingperiod.startdate}, 'YYYYMM')",
									label : "�����N��"
								}), 
							search.createColumn({
							name : "formulatext",
							formula : "''",
							label : "����Ŋz"
						}), search.createColumn({
							name : "formulatext",
							formula : "''",
							label : "�f�[�^�쐬����"
						}), search.createColumn({
							name : "custcol_djkk_rios_user_num",
							label : "���[�U�Ǘ��ԍ�"
						}), search.createColumn({
							name : "custcol_djkk_rios_user_remark",
							label : "���[�U���l"
						}), search.createColumn({
							name : "custcol_djkk_item_code",
							label : "���[�J�[�i�ڃR�[�h"
						}), search.createColumn({
							name : "formulatext",
							formula : "''",
							label : "���[�J�[�i�ږ���"
						}), search.createColumn({
							name : "custbody_djkk_maker_nounyu_code",
							join : "createdFrom",
							label : "���[�J�[�[����R�[�h"
						}), search.createColumn({
							name : "custbody_djkk_delivery_destination",//changed by geng ,Original writing, name : "formulatext",formula : "''",label : "���[�J�[�[���於��"
							join : "createdFrom",
							label : "���[�J�[�[���於��"
						}), search.createColumn({
							name : "custbody_djkk_use_code",
							join : "createdFrom",
							label : "���[�J�[�g�p�҃R�[�h"
						}), search.createColumn({
							name : "custbody_djkk_rios_user_name",//changed by geng   ,Original writing,name : "formulatext",formula : "''",label : "���[�J�[�g�p�Җ���"
							join : "createdFrom",
							label : "���[�J�[�g�p�Җ���"
						}), search.createColumn({
							name : "custbody_djkk_maker_remark",
							join : "createdFrom",
							label : "���[�J�[���l"
						}), search.createColumn({
							name : "formulatext",
							formula : "''",
							label : "�ėp�t���O�P"
						}), search.createColumn({
							name : "formulatext",
							formula : "''",
							label : "�ėp�t���O2"
						}), search.createColumn({
							name : "formulatext",
							formula : "''",
							label : "�ėp�t���O3"
						}), search.createColumn({
							name : "formulatext",
							formula : "''",
							label : "�\���P"
						}), search.createColumn({
							name : "formulatext",
							formula : "''",
							label : "�\���Q"
						}), search.createColumn({
							name : "item",
							label : "�A�C�e��"
						}), search.createColumn({
							name : "line",
							label : "���C��ID"
						}), search.createColumn({
							name : "internalid",
							join : "createdFrom",
							label : "�쐬������ID"
						}), search.createColumn({
							name : "memomain",
							label : "����"
						}) ];

				var createDate = getJapanDate();
				var strCreateDate = dateToStr(createDate);
				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					for (var i = 0; i < searchResults.length; i++) {
						var searchResult = searchResults[i];
						log.debug('searchResult',searchResult);
						var id = searchResult.id;
						var resultList = [];
						var lineData = [];
						for (var j = 0; j < searchColumns.length; j++) {
							var value = '';
							if (j == 9) {
								value = searchResult.getText(searchColumns[j]);
							} else {
								value = searchResult.getValue(searchColumns[j]);
							}
							lineData.push(value);
						}
						lineData[17] = strCreateDate;
						resultList.push(lineData);
						var dicValue = resultDic[id];
						if (dicValue) {
							var tmpResultList = dicValue.concat(resultList);
							resultDic[id] = tmpResultList;
						} else {
							resultDic[id] = resultList;
						}
					}
				}

				return resultDic;
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
			 * YYYYMMDDHHMMSS�ɕω�
			 */
			function dateToStr(date) {
				var year = date.getFullYear();
				var month = pad(date.getMonth() + 1);
				var day = pad(date.getDate());
				var hour = pad(date.getHours());
				var minute = pad(date.getMinutes());
				var second = pad(date.getSeconds());
				return '' + year + month + day + hour + minute + second;
			}

			/**
			 * @param v
			 * @returns
			 */
			function pad(v) {
				if (v >= 10) {
					return v;
				} else {
					return "0" + v;
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
			 * OR�t�B���^�[���쐬����
			 * 
			 * @param fieldId
			 *            �t�B�[���h����ID
			 * @param operation
			 *            ���아��
			 * @param valueList
			 *            �o�����[���X�g
			 * @returns OR�t�B���^�[���X�g
			 */
			function getOrFilters(fieldId, operation, valueList) {

				var orFilters = [];
				for (var i = 0; i < valueList.length; i++) {
					var tmpId = valueList[i];
					orFilters.push([ fieldId, operation, tmpId ]);
					if (i != valueList.length - 1) {
						orFilters.push('OR');
					}
				}

				return orFilters;
			}

			/**
			 * MAX�t�@�C�������擾����
			 */
			function getMaxFileName(folderId, subFileName) {

				var result = '';

				// �����^�C�v
				var searchType = 'folder';

				// ��������
				var searchFilters = [ [ "internalid", "anyof", folderId ],
						"AND", [ "file.name", "contains", subFileName ], "AND",
						[ "file.name", "doesnotcontain", ".hed" ] ];

				// �����R����
				var searchColumns = [ search
						.createColumn({
							name : "formulanumeric",
							summary : "MAX",
							formula : "TO_NUMBER(SUBSTR(REPLACE({file.name}, '.csv', ''), LENGTH(REPLACE({file.name}, '.csv', '')) - 3))",
							label : "�v�Z���i���l�j"
						}) ];

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					var tmpResult = searchResults[0];
					result = tmpResult.getValue(searchColumns[0]);
				}

				return result;
			}

			/**
			 * �w�b�h�t�@�C�����쐬
			 */
			function createHeadFile(markerCoder, dataDic, folderId) {

				var headArray = [];
				var headDataList = [];
				var headData = [];
				// ���M�f�[�^�敪
				headData.push('3');
				// ���[�J�[�R�[�h
				headData.push(markerCoder);
				// ���R�[�h��
				headData.push(dataDic.count);
				// �����R�[�h�̌n
				headData.push('1');
				// �t�@�C���쐬����
				headData.push(dataDic.strCreateDate);
				// ���l
				headData.push(dataDic.headMemo);
				headDataList.push(headData);
				var fileId = createFile(headData.join(','),
						file.Type.PLAINTEXT, dataDic.fileName + '.hed',
						folderId);
				log.error('Header File', fileId);
			}

			/**
			 * ���׃t�@�C�����쐬����
			 */
			function createDetailFile(dataDicList, fileName, folderId) {
				var headArray = [];
				var dataFileId = createCsvFile(dataDicList, headArray,
						fileName, folderId);
				log.error('Detail CSV File', dataFileId);
			}
			/**
			 * ���l�f�[�^���O���߂ŏo�͂���
			 * 
			 * @param {string}
			 *            str
			 * @param {Number}
			 *            length
			 * @return {string}
			 */
			function zeropad(str, length) {
				return (new Array(length).join('0') + str).slice(-length);
			}

			/**
			 * CSV�t�@�C���ۑ�
			 * 
			 * @param lineDataArray
			 * @param headArry
			 * @param filename
			 * @param folder
			 * @return fileId
			 */
			function createCsvFile(lineDataArray, headArry, filename, folder) {
				var csvArray = [];
				// CSV�w�b�_���쐬����
				if (headArry && csvArray.length > 0) {
					csvArray.push(headArry.join(','));
				}
				// CSV�f�[�^���쐬����
				lineDataArray.forEach(function(lineData) {
					csvArray.push(lineData.join(','));
				});
				var csvStr = csvArray.join('\r\n');
				// FileCabinet�ɕۑ�����
				return createFile(csvStr, file.Type.CSV, filename, folder);
			}

			/**
			 * �t�@�C���ۑ�
			 * 
			 * @param contents
			 * @param fileType
			 * @param filename
			 * @param folder
			 * @return fileId
			 */
			function createFile(contents, fileType, filename, folder) {
				var fileId = 0;
				try {
					var fileObj = file.create({
						name : filename,
						fileType : fileType,
						contents : contents
					});
					fileObj.folder = folder;
					fileObj.encoding = file.Encoding.SHIFT_JIS;
					fileId = fileObj.save();
				} catch (err) {
					log.error({
						title : 'Create File',
						details : err.name + err.description
					});
				}
				return fileId;
			}
		});