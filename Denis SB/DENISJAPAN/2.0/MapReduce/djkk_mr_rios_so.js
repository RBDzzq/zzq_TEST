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

					// ���[�N�t�H���_�[ID
					var workFolderId = script.getParameter({
						name : 'custscript_djkk_rios_work_folder_id'
					});
					if (!workFolderId) {
						log.error('���̓`�F�b�N', '���[�N�t�H���_�[ID����͂��Ă��������B');
						return;
					}

					// �o�b�N�A�b�v�t�H���_�[ID
					var bkWorkFolderId = script.getParameter({
						name : 'custscript_djkk_rios_work_bk_folder_id'
					});
					if (!bkWorkFolderId) {
						log.error('���̓`�F�b�N', '�o�b�N�A�b�v�t�H���_�[ID����͂��Ă��������B');
						return;
					}
					log.debug('bkWorkFolderId', bkWorkFolderId);
					log.debug('workFolderId', workFolderId);

					// �t�@�C������������
					var fileFormatList = [];
					fileFormatList.push('.csv');
					var fileObj = getFiles(workFolderId, fileFormatList);
					if (fileObj && Object.keys(fileObj).length == 0) {
						log.error('���̓`�F�b�N', '�����t�@�C��������܂���B���m�F���������B');
					}

					return fileObj;

				} catch (e) {
					log.error('getInputData �G���[', e);
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

					// �t�@�C�������[�h����
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
						log.error('�G���[', '�u' + value + '�v�̒��œ��e������܂���B');
					}

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
					log.debug('reduce values', context.values[0]);

					var csvAry = [];

					// �f�[�^���擾����
					var dataList = JSON.parse(context.values[0]);

					if (dataList && dataList.length > 0) {
						log.debug('dataList.length', dataList.length);

						for ( var d in dataList) {

							csvAry.push(dataList[d]['csvData']);

						}

						// �f�[�^�敪
						var dataKbn = dataList[0].dataKbn;
						// �����}��
						var soEdaban = dataList[0].soEdaban;
						if (dataKbn == '0' && soEdaban == '00') {
							// SO���쐬����
							createSo(dataList);
						} else {
							log.error('�����G���[', '�f�[�^�敪�F' + dataKbn + ',�����}�ԁF'
									+ soEdaban + '�̏��������܂���B');
						}
					}
				} catch (e) {
					log.error('reduce �G���[', e);
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
										log.debug('�t�@�C��ID�F' + fileId);
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
								            var subject = 'RIOS�G���[���������m�点';
											// ���[�N�t�H���_�[ID
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
								            
								            var body = 'RIOS�G���[���������܂����B���Ή����Ă��������B\n' +
							                '�G���[���b�Z�[�W�F\n' + error+ '\n' + 
							                '�G���[���O�t���t�@�C���i�Y�t�t�@�C�����Q�Ɓj:'+errorFileName+ '\n' +
								            '���̃t�@�C���i�Y�t�t�@�C�����Q�Ɓj:'+bkFileName;
								            
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
			 * SO���쐬����
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
              
				// �ڋq
				var entity = dataList[0].entity;
				soRecord.setValue({
					fieldId : 'entity',
					value : entity
				});
				// �A��
				var subsidiary = dataList[0].subsidiary;
				log.debug('subsidiary', subsidiary);
				if (subsidiary) {
					soRecord.setValue({
						fieldId : 'subsidiary',
						value : subsidiary
					});
				}
				// ���t
				var tranDate = dataList[0].tranDate;
				if (tranDate) {
					soRecord.setValue({
						fieldId : 'trandate',
						value : dealYyyyMmDdToDate(tranDate)
					});
				}
				// DJ_�[�i��
				var deliveryDate = dataList[0].deliveryDate;
				if (deliveryDate) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_delivery_date',
						value : dealYyyyMmDdToDate(deliveryDate)
					});
				}
				// DJ_EDI�����敪
				soRecord.setValue({
					fieldId : 'custbody_djkk_edi_so_kbn',
					value : 'RIOS'
				});
				// �������ԍ�
				var soNo = dataList[0].soNo;
				if (soNo) {
					soRecord.setValue({
						fieldId : 'otherrefnum',
						value : soNo
					});
				}
				// DJ_�����}��
				var soEdaban = dataList[0].soEdaban;
				if (soEdaban) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_so_edaba',
						value : soEdaban
					});
				}
				// DJ_RIOS���
				var baseDate = dataList[0].baseDate;
				if (baseDate) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_base_date',
						value : dealYyyyMmDdToDate(baseDate)
					});
				}
				// DJ_�[�i��
				var deliveryDestination = dataList[0].deliveryDestination;
				if (deliveryDestination) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_delivery_destination',
						value : deliveryDestination
					});
				}
				// DJ_RIOS�g�p�Җ���
				var userName = dataList[0].userName;
				if (userName) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_user_name',
						value : userName
					});
				}
				// DJ_RIOS�o�^�Җ���
				var loginName = dataList[0].loginName;
				if (loginName) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_login_name',
						value : loginName
					});
				}
				// DJ_RIOS�����Җ���
				var poUserName = dataList[0].poUserName;
				if (poUserName) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_po_user_name',
						value : poUserName
					});
				}
				// DJ_RIOS�����҃��[���A�h���X
				var poMail = dataList[0].poMail;
				if (poMail) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_po_mail',
						value : poMail
					});
				}
				// DJ_RIOS�r�{�E�r�g���敪
				var biboBito = dataList[0].biboBito;
				if (biboBito) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_bibo_bito',
						value : biboBito
					});
				}
				// DJ_RIOS�����o�H
				var soKeiro = dataList[0].soKeiro;
				if (soKeiro) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_rios_so_keiro',
						value : soKeiro
					});
				}
				// DJ_���[�J�[�[����R�[�h
				var nounyuCode = dataList[0].nounyuCode;
				if (nounyuCode) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_maker_nounyu_code',
						value : nounyuCode
					});
				}
				// DJ_���[�J�[�g�p�҃R�[�h
				var useCode = dataList[0].useCode;
				if (useCode) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_use_code',
						value : useCode
					});
				}
				// DJ_���[�J�[���l
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

					// �A�C�e��
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

					// DJ_�K�i
					var itemKikaku = dataDic.itemKikaku;
					if (itemKikaku) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_specifications',
							value : itemKikaku
						});
					}
					// DJ_2_�j��
					var nuclide = dataDic.nuclide;
					if (nuclide) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_nuclide',
							value : nuclide
						});
					}
					// ����
					var quantity = dataDic.quantity;
					if (quantity) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'quantity',
							value : quantity
						});
					}
					// DJ_RIOS���[�U�Ǘ��ԍ�
					var userNum = dataDic.userNum;
					if (userNum) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_rios_user_num',
							value : userNum
						});
					}
					// RIOS���[�U���l
					var userRemark = dataDic.userRemark;
					if (userRemark) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_rios_user_remark',
							value : userRemark
						});
					}
					// DJ_���[�J�̐����ԍ�
					var makerSerialCode = dataDic.makerSerialCode;
					if (makerSerialCode) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_maker_serial_code',
							value : makerSerialCode
						});
					}
					// DJ_�A�C�e��(�R�[�h)
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

              log.debug('SO�\��쐬', soRecord);
				var soId = soRecord.save({
					enableSourcing : true,
					ignoreMandatoryFields : true
				});

				log.debug('SO����ID', soId);
			}

			/**
			 * �����f�[�^���O���[�v����
			 * 
			 * @param tmpDataList
			 *            �f�[�^���X�g
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
					// �i�ڃR�[�h3
					var itemCode = tmpDataList[3];
					if (itemCode) {
						if (ucpCodeList.indexOf(itemCode) == -1) {
							ucpCodeList.push(itemCode);
						}
					}
					// ���[�J�[�R�[�h7
					var makerCode = tmpDataList[7];
					if (makerCode) {
						if (makerCodeList.indexOf(makerCode) == -1) {
							makerCodeList.push(makerCode);
						}
					}
					// �{�ݖ���13
					var entity = tmpDataList[13];
					if (entity) {
						if (entityList.indexOf(entity) == -1) {
							entityList.push(entity);
						}
					}
					// �[���於��14
					var deliveryDestination = tmpDataList[14];
					if (deliveryDestination) {
						if (deliveryDestinationList
								.indexOf(deliveryDestination) == -1) {
							deliveryDestinationList.push(deliveryDestination);
						}
					}
				}

              
				// �A�C�e��ID���擾����
				var itemIdDic = getItemIdByUpcList(ucpCodeList);
				// �A��ID���擾����
				var subsidiaryIdDic = getSubsidiaryIdByCompCodeList(makerCodeList);
				log.debug('subsidiaryIdDic', JSON.stringify(subsidiaryIdDic));
				// �ڋqID���擾����
				var customerIdDic = getCustomerIdByName(entityList);
				// DJ_�[�i����擾����
				var deliveryDestDic = getDeliveryDestIdByName(deliveryDestinationList);

				var dataGroupDic = {};
				for (var j = 0; j < dataList.length; j++) {
					tmpDataList = dataList[j];
					if (tmpDataList.length == 1) {
						continue;
					}
					var lineNum = j + 1;
					var lineMsg = '�u' + fileName + '�v��' + lineNum;
					var dicDataDic = {};
					// �t�@�C��ID
					dicDataDic.fileId = fileId;
					// ����NO.0
					var soNo = tmpDataList[0];
					dicDataDic.soNo = soNo;
					// �����}��1
					var soEdaban = tmpDataList[1];
					dicDataDic.soEdaban = soEdaban;
					// �f�[�^�敪2
					var dataKbn = tmpDataList[2];
					dicDataDic.dataKbn = dataKbn;
					// �i�ڃR�[�h3
					itemCode = tmpDataList[3];

					log.debug('tmpDataList', tmpDataList);

					if (!itemCode) {

						var errorMessage = lineMsg + '�s�ڂ̕i�ڃR�[�h���󔒂ł��B';

						log.error('�f�[�^�G���[', errorMessage);

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

						var errorMessage = lineMsg + '�s�ڂ�NS�A�C�e�������݂��Ă��܂���B';

						log.error('�f�[�^�G���[', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);
						continue;
					}
					dicDataDic.item = dicItem;
					// �K�i5
					var itemKikaku = tmpDataList[5];
					dicDataDic.itemKikaku = itemKikaku;
					// �j�햼��6
					var nuclide = tmpDataList[6];
					dicDataDic.nuclide = nuclide;
					// ���[�J�[�R�[�h7
					makerCode = tmpDataList[7];
					if (!makerCode) {

						var errorMessage = lineMsg + '�s�ڂ̃��[�J�[�R�[�h���󔒂ł��B';

						log.error('�f�[�^�G���[', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					var dicSubsidiary = subsidiaryIdDic[makerCode];
					if (!dicSubsidiary) {

						var errorMessage = lineMsg + '�s�ڂ�NS�A�������݂��Ă��܂���B';

						log.error('�f�[�^�G���[', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					dicDataDic.subsidiary = dicSubsidiary;
					// ����9
					var quantity = tmpDataList[9];
					if (!quantity) {

						var errorMessage = lineMsg + '�s�ڂ̐��ʂ��󔒂ł��B';

						log.error('�f�[�^�G���[', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					dicDataDic.quantity = quantity;
					// �󒍓�10
					var tranDate = tmpDataList[10];
					dicDataDic.tranDate = tranDate;
					// �[����11
					var deliveryDate = tmpDataList[11];
					dicDataDic.deliveryDate = deliveryDate;
					// ���12
					var baseDate = tmpDataList[12];
					dicDataDic.baseDate = baseDate;
					// �{�ݖ���13
					entity = tmpDataList[13];
					if (!entity) {

						var errorMessage = lineMsg + '�s�ڂ̎{�ݖ��̂��󔒂ł��B';

						log.error('�f�[�^�G���[', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					var dicEntity = customerIdDic[entity];
					if (!dicEntity) {

						var errorMessage = lineMsg + '�s�ڂ�NS�ڋq�����݂��Ă��܂���B';

						log.error('�f�[�^�G���[', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					dicDataDic.entity = dicEntity;
					// �[���於��14
					deliveryDestination = tmpDataList[14];
					if (deliveryDestination) {
						var dicDeliveryDest = deliveryDestDic[deliveryDestination];
						if (dicDeliveryDest) {
							dicDataDic.deliveryDestination = dicDeliveryDest;
						}
					}
					// �g�p�Җ���15
					var userName = tmpDataList[15];
					dicDataDic.userName = userName;
					// �o�^�Җ���16
					var loginName = tmpDataList[16];
					dicDataDic.loginName = loginName;
					// �����Җ���17
					var poUserName = tmpDataList[17];
					dicDataDic.poUserName = poUserName;
					// �����҃��[���A�h���X18
					var poMail = tmpDataList[18];
					dicDataDic.poMail = poMail;
					// �r�{�E�r�g���敪19
					var biboBito = tmpDataList[19];
					dicDataDic.biboBito = biboBito;
					// �����o�H20
					var soKeiro = tmpDataList[20];
					dicDataDic.soKeiro = soKeiro;
					// ���[�U�Ǘ��ԍ�21
					var userNum = tmpDataList[21];
					dicDataDic.userNum = userNum;
					// ���[�U���l22
					var userRemark = tmpDataList[22];
					dicDataDic.userRemark = userRemark;
					// ���[�J�[�Ǘ��ԍ�23
					var makerSerialCode = tmpDataList[23];
					dicDataDic.makerSerialCode = makerSerialCode;
					// ���[�J�[�i�ڃR�[�h24
					var makerItemCode = tmpDataList[24];
					dicDataDic.makerItemCode = makerItemCode;
					// ���[�J�[�[����R�[�h25
					var nounyuCode = tmpDataList[25];
					dicDataDic.nounyuCode = nounyuCode;
					// ���[�J�[�g�p�҃R�[�h26
					var useCode = tmpDataList[26];
					dicDataDic.useCode = useCode;
					// ���[�J�[���l27
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
			 * �����t�@�C�����擾����
			 * 
			 * @param workFolderId
			 *            �t�@�C�����ۑ����ꂽ�t�H���_�[
			 * @param fileFormat
			 *            �t�@�C���t�H�[�}�b�g
			 */
			function getFiles(workFolderId, fileFormatList) {

				var fileDic = {};

				if (!workFolderId) {
					return fileDic;
				}

				// �����^�C�v
				var searchType = 'folder';

				// ��������
				var searchFilters = [];
				var idFilter = search.createFilter({
					name : 'internalid',
					operator : 'is',
					values : workFolderId
				});
				searchFilters.push(idFilter);

				// �����R����
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
						// �t�@�C�����擾����
						var file = searchResults[i];
						var fileName = file.getValue(fileNameObj);
						if (!fileName) {
							continue;
						}
						// �t�@�C���𔻒f����
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
			 * CSV�f�[�^��Array�ɕϊ�����
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
			 * UPC�R�[�h�ŃA�C�e������ID���擾����
			 * 
			 * @param upcCode
			 *            UPC�R�[�h
			 */
			function getItemIdByUpcList(upcCodeList) {
              log.debug('UPCID',upcCodeList)
				var resultIdDic = {};

				// �����^�C�v
				var searchType = 'item';

				// ��������
				var searchFilters = [];
				searchFilters.push(getOrFilters('upccode', 'is', upcCodeList));

				// �����R����
				var searchColumns = [];
				// ����ID
				var idObj = search.createColumn({
					name : 'internalid'
				});
				searchColumns.push(idObj);
				// UPC�R�[�h
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

              log.debug('�A�C�e�����X�g',resultIdDic)
				return resultIdDic;
			}

			/**
			 * UPC�R�[�h�ŘA������ID���擾����
			 * 
			 * @param upcCode
			 *            UPC�R�[�h���X�g
			 */
			function getSubsidiaryIdByCompCodeList(companyCodeList) {

				var resultIdDic = {};

				// �����^�C�v
				var searchType = 'subsidiary';

				// ��������
				var searchFilters = [];
				searchFilters.push(getOrFilters(
						'custrecord_djkk_subsidiary_code', 'is',
						companyCodeList));

				// �����R����
				var searchColumns = [];
				// ����ID
				var idObj = search.createColumn({
					name : 'internalid'
				});
				searchColumns.push(idObj);
				// ��ЃR�[�h
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
			 * ���O�Ōڋq����ID���擾����
			 * 
			 * @param upcCode
			 *            UPC�R�[�h
			 */
			function getCustomerIdByName(nameList) {

				var resultIdDic = {};

				// �����^�C�v
				var searchType = 'customer';

				// ��������
				var searchFilters = [];
				searchFilters.push(getOrFilters('companyname', 'is', nameList));

				// �����R����
				var searchColumns = [];
				// ����ID
				var idObj = search.createColumn({
					name : 'internalid'
				});
				searchColumns.push(idObj);
				// �ڋq��
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
			 * ���O�Ŕ[�i�����ID���擾����
			 * 
			 * @param upcCode
			 *            UPC�R�[�h
			 */
			function getDeliveryDestIdByName(nameList) {

				var resultIdDic = {};

				// �����^�C�v
				var searchType = 'customrecord_djkk_delivery_destination';

				// ��������
				var searchFilters = [];
				searchFilters.push(getOrFilters('name', 'is', nameList));

				// �����R����
				var searchColumns = [];
				// ����ID
				var idObj = search.createColumn({
					name : 'internalid'
				});
				searchColumns.push(idObj);
				// �ڋq��
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
			 * YYYYMMDD����t�ɕω�����
			 */
			function dealYyyyMmDdToDate(strDate) {

				var year = strDate.substring(0, 4);
				var month = parseInt(strDate.substring(4, 6)) - 1;
				var day = strDate.substring(6, 8);
				var date = new Date(year, month, day);

				return date;
			}

			function getFormatYmdHms() {

				// �V�X�e������
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

				// �V�X�e������
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
		     * ���GET�pURL�쐬
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