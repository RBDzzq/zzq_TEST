/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/runtime', 'N/search', 'N/file', 'N/record','/SuiteScripts/DENISJAPAN/2.0/Common/file_cabinet_common','N/url','N/http','N/email' ],
		function(runtime, search, file, record, cabinet,url,http,email) {

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

					// ワークフォルダーID
					var workFolderId = script.getParameter({
						name : 'custscript_djkk_rios_work_folder_id'
					});
					if (!workFolderId) {
						log.error('入力チェック', 'ワークフォルダーIDを入力してください。');
						return;
					}

					// バックアップフォルダーID
					var bkWorkFolderId = script.getParameter({
						name : 'custscript_djkk_rios_work_bk_folder_id'
					});
					if (!bkWorkFolderId) {
						log.error('入力チェック', 'バックアップフォルダーIDを入力してください。');
						return;
					}
					log.debug('bkWorkFolderId', bkWorkFolderId);
					log.debug('workFolderId', workFolderId);

					// ファイルを検索する
					var fileFormatList = [];
					fileFormatList.push('.csv');
					var fileObj = getFiles(workFolderId, fileFormatList);
					if (fileObj && Object.keys(fileObj).length == 0) {
						log.error('入力チェック', '処理ファイルがありません。ご確認ください。');
					}

					return fileObj;

				} catch (e) {
					log.error('getInputData エラー', e);
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

					// ファイルをロードする
					var fileObj = file.load({
						id : key
					});
					var fileContents = fileObj.getContents();
					if (fileContents) {
						var csvDataList = csvToArray(fileContents, ',');
						var dataGroupDic = getGroupDatas(csvDataList, key,
								value);
						for ( var dgdId in dataGroupDic) {
							context.write({
								key : dgdId,
								value : dataGroupDic[dgdId]
							});
						}
					} else {
						log.error('エラー', '「' + value + '」の中で内容がありません。');
					}

				} catch (e) {
					log.error('map エラー', e);
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
					log.debug('reduce values', context.values[0]);

					var csvAry = [];

					// データを取得する
					var dataList = JSON.parse(context.values[0]);

					if (dataList && dataList.length > 0) {
						log.debug('dataList.length', dataList.length);

						for ( var d in dataList) {

							csvAry.push(dataList[d]['csvData']);

						}

						// データ区分
						var dataKbn = dataList[0].dataKbn;
						// 注文枝番
						var soEdaban = dataList[0].soEdaban;
						if (dataKbn == '0' && soEdaban == '00') {
							// SOを作成する
							createSo(dataList);
						} else {
							log.error('処理エラー', 'データ区分：' + dataKbn + ',注文枝番：'
									+ soEdaban + 'の処理がしません。');
						}
					}
				} catch (e) {
					log.error('reduce エラー', e);
					var fileObj = file.load({
						id : dataList[0]['fileId']
					});

					setErrorRecordValue(fileObj.name, JSON.stringify(csvAry),
							e.message);

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
					var bkWorkFolderId = script.getParameter({
						name : 'custscript_djkk_rios_work_bk_folder_id'
					});

					summary.mapSummary.keys
							.iterator()
							.each(
									function(key) {
										var fileObj = file.load({
											id : key
										});

										var fileName = fileObj.name;
										var recordFileName = fileName;
										fileName = fileName.split('.');
										fileObj.name = fileName[0] + '_'
												+ getFormatYmdHms() + '.'
												+ fileName[1];
										fileObj.folder = bkWorkFolderId;
										var fileId = fileObj.save();
										log.debug('ファイルID：' + fileId);
										var bkFileid = fileId ;
										var searchType = 'customrecord_djkk_mr_rios_so_error';
										var searchFilters = [ [
												"custrecord_djkk_mr_rios_so_error_file",
												"is", recordFileName ] ];
										var searchColumns = [];
										searchColumns.push('internalid');
										searchColumns
												.push('custrecord_djkk_mr_rios_so_error_file');
										searchColumns
												.push('custrecord_djkk_mr_rios_so_data');
										searchColumns
												.push('custrecord_djkk_mr_rios_so_error_data');

										var searchResults = createSearch(
												searchType, searchFilters,
												searchColumns);

										var idAry = [];
										var buffer = '';
										var error = '';
										if (searchResults
												&& searchResults.length > 0) {
											for (var i = 0; i < searchResults.length; i++) {
												var tmpResult = searchResults[i];
												var internalId = tmpResult
														.getValue(searchColumns[0]);
												var cavData = tmpResult
														.getValue(searchColumns[2]);
												var errorData = tmpResult
														.getValue(searchColumns[3]);
												error += errorData+ '\r\n';
												idAry.push(internalId);

												var cavDataAry = JSON
														.parse(cavData);
												log.debug('cavDataAry',
														cavDataAry);

												buffer += errorData
														+ '\r\n'
														+ cavDataAry
																.join('\r\n')
														+ '\r\n';

												log.debug('csv for :', i);

											}
										}

										var fileObj = file.create({
											name : fileName[0] + '_'
													+ getFormatYmdHms() + '.'
													+ fileName[1],
											fileType : file.Type.CSV,
											contents : buffer
										});
										fileObj.folder = cabinet.fileCabinetId('dj_edi_rios_error');
										fileObj.encoding = file.Encoding.SHIFT_JIS;
										fileId = fileObj.save();
										//20220810 add by zhou
										if(fileId){
								            var subject = 'RIOSエラーが発生お知らせ';
											// ワークフォルダーID
								            log.debug('errorstr ', error);
								            var errorFile = file.load({
												id : fileId
											});
								            var bkFile = file.load({
												id : bkFileid
											});
								            
								            var errorFileName = '';
								            errorFileName += errorFile.name;
								            var bkFileName = '';
								            bkFileName += bkFile.name;
								            
								            var body = 'RIOSエラーが発生しました。ご対応してください。\n' +
							                'エラーメッセージ：\n' + error+ '\n' + 
							                'エラーログ付きファイル（添付ファイルを参照）:'+errorFileName+ '\n' +
								            '元のファイル（添付ファイルを参照）:'+bkFileName;
								            
								            var userObj = runtime.getCurrentUser();
								            log.debug('userObj', userObj);
								            var recipients = userObj.id;
											email.send({
//											    author: uesr.id,
												author: 737,
											    recipients: recipients,
											    subject: subject,
											    body: body,
											    attachments: [errorFile,bkFile]
											});
										}
										//end
										log.debug('error file id : ', fileId);

										for (var d = 0; d < idAry.length; d++) {
											record['delete']
													({
														type : 'customrecord_djkk_mr_rios_so_error',
														id : idAry[d]
													});
										}

										return true;
									});

				} catch (e) {
					log.error('summarize エラー', e);
				}
			}

			return {
				getInputData : getInputData,
				map : map,
				reduce : reduce,
				summarize : summarize
			};

			/**
			 * SOを作成する
			 */
			function createSo(dataList) {

				var soRecord = record.create({
					type : 'salesorder',
					isDynamic : true,
					defaultValues : {}
				});

              // 20220426 add form -> ls
              soRecord.setValue({
					fieldId : 'customform',
					value : 121
				});
              
				// 顧客
				var entity = dataList[0].entity;
				soRecord.setValue({
					fieldId : 'entity',
					value : entity
				});
				// 連結
				var subsidiary = dataList[0].subsidiary;
				log.debug('subsidiary', subsidiary);
				if (subsidiary) {
					soRecord.setValue({
						fieldId : 'subsidiary',
						value : subsidiary
					});
				}
				// 日付
				var tranDate = dataList[0].tranDate;
				if (tranDate) {
					soRecord.setValue({
						fieldId : 'trandate',
						value : dealYyyyMmDdToDate(tranDate)
					});
				}
				// DJ_納品日
				var deliveryDate = dataList[0].deliveryDate;
				if (deliveryDate) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_delivery_date',
						value : dealYyyyMmDdToDate(deliveryDate)
					});
				}
				// DJ_EDI注文区分
				soRecord.setValue({
					fieldId : 'custbody_djkk_edi_so_kbn',
					value : 'RIOS'
				});
				// 発注書番号
				var soNo = dataList[0].soNo;
				if (soNo) {
					soRecord.setValue({
						fieldId : 'otherrefnum',
						value : soNo
					});
				}
				// DJ_注文枝番
				var soEdaban = dataList[0].soEdaban;
				if (soEdaban) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_so_edaba',
						value : soEdaban
					});
				}
				// DJ_RIOS基準日
				var baseDate = dataList[0].baseDate;
				if (baseDate) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_base_date',
						value : dealYyyyMmDdToDate(baseDate)
					});
				}
				// DJ_納品先
				var deliveryDestination = dataList[0].deliveryDestination;
				if (deliveryDestination) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_delivery_destination',
						value : deliveryDestination
					});
				}
				// DJ_RIOS使用者名称
				var userName = dataList[0].userName;
				if (userName) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_user_name',
						value : userName
					});
				}
				// DJ_RIOS登録者名称
				var loginName = dataList[0].loginName;
				if (loginName) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_login_name',
						value : loginName
					});
				}
				// DJ_RIOS発注者名称
				var poUserName = dataList[0].poUserName;
				if (poUserName) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_po_user_name',
						value : poUserName
					});
				}
				// DJ_RIOS発注者メールアドレス
				var poMail = dataList[0].poMail;
				if (poMail) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_po_mail',
						value : poMail
					});
				}
				// DJ_RIOSビボ・ビトロ区分
				var biboBito = dataList[0].biboBito;
				if (biboBito) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_bibo_bito',
						value : biboBito
					});
				}
				// DJ_RIOS注文経路
				var soKeiro = dataList[0].soKeiro;
				if (soKeiro) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_so_keiro',
						value : soKeiro
					});
				}
				// DJ_メーカー納入先コード
				var nounyuCode = dataList[0].nounyuCode;
				if (nounyuCode) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_maker_nounyu_code',
						value : nounyuCode
					});
				}
				// DJ_メーカー使用者コード
				var useCode = dataList[0].useCode;
				if (useCode) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_use_code',
						value : useCode
					});
				}
				// DJ_メーカー備考
				var makerRemark = dataList[0].makerRemark;
				if (makerRemark) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_maker_remark',
						value : makerRemark
					});
				}
				for (var i = 0; i < dataList.length; i++) {

					var dataDic = dataList[i];

					soRecord.selectNewLine({
						sublistId : 'item'
					});

					// アイテム
					var item = dataDic.item;
					soRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'item',
						value : item
					});
//					soRecord.setCurrentSublistValue({
//						sublistId : 'item',
//						fieldId : 'custcol_djkk_item',
//						value : item
//					});

					// DJ_規格
					var itemKikaku = dataDic.itemKikaku;
					if (itemKikaku) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_specifications',
							value : itemKikaku
						});
					}
					// DJ_2_核種
					var nuclide = dataDic.nuclide;
					if (nuclide) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_nuclide',
							value : nuclide
						});
					}
					// 数量
					var quantity = dataDic.quantity;
					if (quantity) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'quantity',
							value : quantity
						});
					}
					// DJ_RIOSユーザ管理番号
					var userNum = dataDic.userNum;
					if (userNum) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_rios_user_num',
							value : userNum
						});
					}
					// RIOSユーザ備考
					var userRemark = dataDic.userRemark;
					if (userRemark) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_rios_user_remark',
							value : userRemark
						});
					}
					// DJ_メーカの製造番号
					var makerSerialCode = dataDic.makerSerialCode;
					if (makerSerialCode) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_maker_serial_code',
							value : makerSerialCode
						});
					}
					// DJ_アイテム(コード)
					var makerItemCode = dataDic.makerItemCode;
					if (makerItemCode) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_item_code',
							value : makerItemCode
						});
					}

					soRecord.commitLine({
						sublistId : 'item'
					});
				}

              log.debug('SO予定作成', soRecord);
				var soId = soRecord.save({
					enableSourcing : true,
					ignoreMandatoryFields : true
				});

				log.debug('SO内部ID', soId);
			}

			/**
			 * 処理データをグループする
			 * 
			 * @param tmpDataList
			 *            データリスト
			 */
			function getGroupDatas(dataList, fileId, fileName) {

				var ucpCodeList = [];
				var makerCodeList = [];
				var entityList = [];
				var deliveryDestinationList = [];
				for (var i = 0; i < dataList.length; i++) {
					if (dataList.length == 1) {
						continue;
					}
					var tmpDataList = dataList[i];
					// 品目コード3
					var itemCode = tmpDataList[3];
					if (itemCode) {
						if (ucpCodeList.indexOf(itemCode) == -1) {
							ucpCodeList.push(itemCode);
						}
					}
					// メーカーコード7
					var makerCode = tmpDataList[7];
					if (makerCode) {
						if (makerCodeList.indexOf(makerCode) == -1) {
							makerCodeList.push(makerCode);
						}
					}
					// 施設名称13
					var entity = tmpDataList[13];
					if (entity) {
						if (entityList.indexOf(entity) == -1) {
							entityList.push(entity);
						}
					}
					// 納入先名称14
					var deliveryDestination = tmpDataList[14];
					if (deliveryDestination) {
						if (deliveryDestinationList
								.indexOf(deliveryDestination) == -1) {
							deliveryDestinationList.push(deliveryDestination);
						}
					}
				}

              
				// アイテムIDを取得する
				var itemIdDic = getItemIdByUpcList(ucpCodeList);
				// 連結IDを取得する
				var subsidiaryIdDic = getSubsidiaryIdByCompCodeList(makerCodeList);
				log.debug('subsidiaryIdDic', JSON.stringify(subsidiaryIdDic));
				// 顧客IDを取得する
				var customerIdDic = getCustomerIdByName(entityList);
				// DJ_納品先を取得する
				var deliveryDestDic = getDeliveryDestIdByName(deliveryDestinationList);

				var dataGroupDic = {};
				for (var j = 0; j < dataList.length; j++) {
					tmpDataList = dataList[j];
					if (tmpDataList.length == 1) {
						continue;
					}
					var lineNum = j + 1;
					var lineMsg = '「' + fileName + '」の' + lineNum;
					var dicDataDic = {};
					// ファイルID
					dicDataDic.fileId = fileId;
					// 注文NO.0
					var soNo = tmpDataList[0];
					dicDataDic.soNo = soNo;
					// 注文枝番1
					var soEdaban = tmpDataList[1];
					dicDataDic.soEdaban = soEdaban;
					// データ区分2
					var dataKbn = tmpDataList[2];
					dicDataDic.dataKbn = dataKbn;
					// 品目コード3
					itemCode = tmpDataList[3];

					log.debug('tmpDataList', tmpDataList);

					if (!itemCode) {

						var errorMessage = lineMsg + '行目の品目コードが空白です。';

						log.error('データエラー', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
                  log.debug('itemCode', itemCode);
                  log.debug('itemIdDic', itemIdDic);
					var dicItem = itemIdDic[itemCode];
					if (!dicItem) {

						var errorMessage = lineMsg + '行目のNSアイテムが存在していません。';

						log.error('データエラー', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);
						continue;
					}
					dicDataDic.item = dicItem;
					// 規格5
					var itemKikaku = tmpDataList[5];
					dicDataDic.itemKikaku = itemKikaku;
					// 核種名称6
					var nuclide = tmpDataList[6];
					dicDataDic.nuclide = nuclide;
					// メーカーコード7
					makerCode = tmpDataList[7];
					if (!makerCode) {

						var errorMessage = lineMsg + '行目のメーカーコードが空白です。';

						log.error('データエラー', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					var dicSubsidiary = subsidiaryIdDic[makerCode];
					if (!dicSubsidiary) {

						var errorMessage = lineMsg + '行目のNS連結が存在していません。';

						log.error('データエラー', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					dicDataDic.subsidiary = dicSubsidiary;
					// 数量9
					var quantity = tmpDataList[9];
					if (!quantity) {

						var errorMessage = lineMsg + '行目の数量が空白です。';

						log.error('データエラー', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					dicDataDic.quantity = quantity;
					// 受注日10
					var tranDate = tmpDataList[10];
					dicDataDic.tranDate = tranDate;
					// 納入日11
					var deliveryDate = tmpDataList[11];
					dicDataDic.deliveryDate = deliveryDate;
					// 基準日12
					var baseDate = tmpDataList[12];
					dicDataDic.baseDate = baseDate;
					// 施設名称13
					entity = tmpDataList[13];
					if (!entity) {

						var errorMessage = lineMsg + '行目の施設名称が空白です。';

						log.error('データエラー', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					var dicEntity = customerIdDic[entity];
					if (!dicEntity) {

						var errorMessage = lineMsg + '行目のNS顧客が存在していません。';

						log.error('データエラー', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					dicDataDic.entity = dicEntity;
					// 納入先名称14
					deliveryDestination = tmpDataList[14];
					if (deliveryDestination) {
						var dicDeliveryDest = deliveryDestDic[deliveryDestination];
						if (dicDeliveryDest) {
							dicDataDic.deliveryDestination = dicDeliveryDest;
						}
					}
					// 使用者名称15
					var userName = tmpDataList[15];
					dicDataDic.userName = userName;
					// 登録者名称16
					var loginName = tmpDataList[16];
					dicDataDic.loginName = loginName;
					// 発注者名称17
					var poUserName = tmpDataList[17];
					dicDataDic.poUserName = poUserName;
					// 発注者メールアドレス18
					var poMail = tmpDataList[18];
					dicDataDic.poMail = poMail;
					// ビボ・ビトロ区分19
					var biboBito = tmpDataList[19];
					dicDataDic.biboBito = biboBito;
					// 注文経路20
					var soKeiro = tmpDataList[20];
					dicDataDic.soKeiro = soKeiro;
					// ユーザ管理番号21
					var userNum = tmpDataList[21];
					dicDataDic.userNum = userNum;
					// ユーザ備考22
					var userRemark = tmpDataList[22];
					dicDataDic.userRemark = userRemark;
					// メーカー管理番号23
					var makerSerialCode = tmpDataList[23];
					dicDataDic.makerSerialCode = makerSerialCode;
					// メーカー品目コード24
					var makerItemCode = tmpDataList[24];
					dicDataDic.makerItemCode = makerItemCode;
					// メーカー納入先コード25
					var nounyuCode = tmpDataList[25];
					dicDataDic.nounyuCode = nounyuCode;
					// メーカー使用者コード26
					var useCode = tmpDataList[26];
					dicDataDic.useCode = useCode;
					// メーカー備考27
					var makerRemark = tmpDataList[27];
					dicDataDic.makerRemark = makerRemark;

					dicDataDic.csvData = tmpDataList;

					var dicDataList = [];
					dicDataList.push(dicDataDic);
					var dicVal = dataGroupDic[soNo];
					if (dicVal) {
						var newDicVal = dicVal.concat(dicDataList);
						dataGroupDic[soNo] = newDicVal;
					} else {
						dataGroupDic[soNo] = dicDataList;
					}
				}

				return dataGroupDic;
			}

			/**
			 * 処理ファイルを取得する
			 * 
			 * @param workFolderId
			 *            ファイルが保存されたフォルダー
			 * @param fileFormat
			 *            ファイルフォーマット
			 */
			function getFiles(workFolderId, fileFormatList) {

				var fileDic = {};

				if (!workFolderId) {
					return fileDic;
				}

				// 検索タイプ
				var searchType = 'folder';

				// 検索条件
				var searchFilters = [];
				var idFilter = search.createFilter({
					name : 'internalid',
					operator : 'is',
					values : workFolderId
				});
				searchFilters.push(idFilter);

				// 検索コラム
				var searchColumns = [];
				var fileNameObj = search.createColumn({
					name : 'name',
					join : 'file'
				});
				searchColumns.push(fileNameObj);
				var fileIdObj = search.createColumn({
					name : 'internalid',
					join : 'file'
				});
				searchColumns.push(fileIdObj);

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					for (var i = 0; i < searchResults.length; i++) {
						// ファイルを取得する
						var file = searchResults[i];
						var fileName = file.getValue(fileNameObj);
						if (!fileName) {
							continue;
						}
						// ファイルを判断する
						if (fileFormatList) {
							var fileExsitsFlg = false;
							for (var j = 0; j < fileFormatList.length; j++) {
								var fileFormat = fileFormatList[j];
								if (fileName.indexOf(fileFormat) == -1) {
									continue;
								} else {
									fileExsitsFlg = true;
								}
							}
							if (!fileExsitsFlg) {
								continue;
							}
						}
						var fileId = file.getValue(fileIdObj);

						if (!fileDic[fileId]) {
							fileDic[fileId] = fileName;
						}
					}
				}

				return fileDic;
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
			 * CSVデータをArrayに変換する
			 * 
			 * @param strData
			 * @param strDelimiter
			 * @returns {Array}
			 */
			function csvToArray(strData, strDelimiter) {

				strDelimiter = (strDelimiter || ",");

				var objPattern = new RegExp((

				// Delimiters.
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

				// Quoted fields.
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

				// Standard fields.
				"([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");

				var arrData = [ [] ];
				var arrMatches = null;
				while (arrMatches = objPattern.exec(strData)) {

					var strMatchedDelimiter = arrMatches[1];
					if (strMatchedDelimiter.length
							&& strMatchedDelimiter !== strDelimiter) {
						arrData.push([]);
					}
					var strMatchedValue;
					if (arrMatches[2]) {
						strMatchedValue = arrMatches[2].replace(new RegExp(
								"\"\"", "g"), "\"");
					} else {
						strMatchedValue = arrMatches[3];
					}
					arrData[arrData.length - 1].push(strMatchedValue);
				}

				return (arrData);
			}

			/**
			 * ORフィルターを作成する
			 * 
			 * @param fieldId
			 *            フィールド内部ID
			 * @param operation
			 *            操作符号
			 * @param valueList
			 *            バリューリスト
			 * @returns ORフィルターリスト
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
			 * UPCコードでアイテム内部IDを取得する
			 * 
			 * @param upcCode
			 *            UPCコード
			 */
			function getItemIdByUpcList(upcCodeList) {
              log.debug('UPCID',upcCodeList)
				var resultIdDic = {};

				// 検索タイプ
				var searchType = 'item';

				// 検索条件
				var searchFilters = [];
				searchFilters.push(getOrFilters('upccode', 'is', upcCodeList));

				// 検索コラム
				var searchColumns = [];
				// 内部ID
				var idObj = search.createColumn({
					name : 'internalid'
				});
				searchColumns.push(idObj);
				// UPCコード
				var upcObj = search.createColumn({
					name : 'upccode'
				});
				searchColumns.push(upcObj);

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					for (var i = 0; i < searchResults.length; i++) {
						var tmpResult = searchResults[i];
						var tmpId = tmpResult.getValue(idObj);
						var tmpUpc = tmpResult.getValue(upcObj);
						resultIdDic[tmpUpc] = tmpId;
					}
				}

              log.debug('アイテムリスト',resultIdDic)
				return resultIdDic;
			}

			/**
			 * UPCコードで連結内部IDを取得する
			 * 
			 * @param upcCode
			 *            UPCコードリスト
			 */
			function getSubsidiaryIdByCompCodeList(companyCodeList) {

				var resultIdDic = {};

				// 検索タイプ
				var searchType = 'subsidiary';

				// 検索条件
				var searchFilters = [];
				searchFilters.push(getOrFilters(
						'custrecord_djkk_subsidiary_code', 'is',
						companyCodeList));

				// 検索コラム
				var searchColumns = [];
				// 内部ID
				var idObj = search.createColumn({
					name : 'internalid'
				});
				searchColumns.push(idObj);
				// 会社コード
				var subsidiaryCodeObj = search.createColumn({
					name : 'custrecord_djkk_subsidiary_code'
				});
				searchColumns.push(subsidiaryCodeObj);

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					for (var i = 0; i < searchResults.length; i++) {
						var tmpResult = searchResults[i];
						var tmpId = tmpResult.getValue(idObj);
						var tmpSubsidiaryCode = tmpResult
								.getValue(subsidiaryCodeObj);
						resultIdDic[tmpSubsidiaryCode] = tmpId;
					}
				}

				return resultIdDic;
			}

			/**
			 * 名前で顧客内部IDを取得する
			 * 
			 * @param upcCode
			 *            UPCコード
			 */
			function getCustomerIdByName(nameList) {

				var resultIdDic = {};

				// 検索タイプ
				var searchType = 'customer';

				// 検索条件
				var searchFilters = [];
				searchFilters.push(getOrFilters('companyname', 'is', nameList));

				// 検索コラム
				var searchColumns = [];
				// 内部ID
				var idObj = search.createColumn({
					name : 'internalid'
				});
				searchColumns.push(idObj);
				// 顧客名
				var companyNameObj = search.createColumn({
					name : 'companyname'
				});
				searchColumns.push(companyNameObj);

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					for (var i = 0; i < searchResults.length; i++) {
						var tmpResult = searchResults[i];
						var tmpId = tmpResult.getValue(idObj);
						var tmpCompanyName = tmpResult.getValue(companyNameObj);
						resultIdDic[tmpCompanyName] = tmpId;
					}
				}

				return resultIdDic;
			}

			/**
			 * 名前で納品先内部IDを取得する
			 * 
			 * @param upcCode
			 *            UPCコード
			 */
			function getDeliveryDestIdByName(nameList) {

				var resultIdDic = {};

				// 検索タイプ
				var searchType = 'customrecord_djkk_delivery_destination';

				// 検索条件
				var searchFilters = [];
				searchFilters.push(getOrFilters('name', 'is', nameList));

				// 検索コラム
				var searchColumns = [];
				// 内部ID
				var idObj = search.createColumn({
					name : 'internalid'
				});
				searchColumns.push(idObj);
				// 顧客名
				var nameObj = search.createColumn({
					name : 'name'
				});
				searchColumns.push(nameObj);

				var searchResults = createSearch(searchType, searchFilters,
						searchColumns);
				if (searchResults && searchResults.length > 0) {
					for (var i = 0; i < searchResults.length; i++) {
						var tmpResult = searchResults[i];
						var tmpId = tmpResult.getValue(idObj);
						var tmpName = tmpResult.getValue(nameObj);
						resultIdDic[tmpName] = tmpId;
					}
				}

				return resultIdDic;
			}

			/**
			 * YYYYMMDDを日付に変化する
			 */
			function dealYyyyMmDdToDate(strDate) {

				var year = strDate.substring(0, 4);
				var month = parseInt(strDate.substring(4, 6)) - 1;
				var day = strDate.substring(6, 8);
				var date = new Date(year, month, day);

				return date;
			}

			function getFormatYmdHms() {

				// システム時間
				var now = getSystemTime();

				var str = now.getFullYear().toString();
				str += (now.getMonth() + 1).toString();
				str += now.getDate() + "_";
				str += now.getHours();
				str += now.getMinutes();
				str += now.getMilliseconds();

				return str;
			}
			function getSystemTime() {

				// システム時間
				var now = new Date();
				var offSet = now.getTimezoneOffset();
				var offsetHours = 9 + (offSet / 60);
				now.setHours(now.getHours() + offsetHours);

				return now;
			}

			function setErrorRecordValue(name, csvData, message) {
				var newRecord = record.create({
					type : 'customrecord_djkk_mr_rios_so_error'
				});
				newRecord.setValue({
					fieldId : 'custrecord_djkk_mr_rios_so_error_file',
					value : name
				});
				newRecord.setValue({
					fieldId : 'custrecord_djkk_mr_rios_so_data',
					value : csvData
				});
				newRecord.setValue({
					fieldId : 'custrecord_djkk_mr_rios_so_error_data',
					value : message
				});

				var id = newRecord.save({
					enableSourcing : false,
					ignoreMandatoryFields : true
				});

				log.debug('error id :', id);
				

			}
			  /**
		     * 画面GET用URL作成
		     *
		     */
		    function getGetConditionUrl() {
		        var linkUrl = url.resolveScript({
		            scriptId: 'customscript_djkk_sl_error_sending_order',
		            deploymentId: 'customdeploy_djkk_error_sending_order',
		            returnExternalUrl: false,
		        });
		        return linkUrl;
		    }
		    /**
		     * url obtain
		     *
		     */
		    function getQueryVariable(variable){
		    	try{
		           var query = window.location.search.substring(1);
		           var vars = query.split("&");
		           for (var i=0;i<vars.length;i++) {
		                   var pair = vars[i].split("=");
		                   if(pair[0] == variable){return pair[1];}
		           }
		    	}catch(e){}
		           return null;
		    }
		});