/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/runtime', 'N/search', 'N/file', 'N/record',
				'/SuiteScripts/DENISJAPAN/2.0/Common/file_cabinet_common' ,'N/email'],
		function(runtime,search, file,record, cabinet,email) {

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
						name : 'custscript_djkk_jram_work_folder_id'
					});
					if (!workFolderId) {
						log.error('入力チェック', 'ワークフォルダーIDを入力してください。');
						return;
					}
					log.debug('222','')
					// バックアップフォルダーID
					var bkWorkFolderId = script.getParameter({
						name : 'custscript_djkk_jram_work_bk_folder_id'
					});
					if (!bkWorkFolderId) {
						log.error('入力チェック', 'バックアップフォルダーIDを入力してください。');
						return;
					}
					log.debug('333','')
					// ファイルを検索する
					var fileFormatList = [];
					fileFormatList.push('.txt');
					var fileObj = getFiles(workFolderId, fileFormatList);
					if (fileObj && Object.keys(fileObj).length == 0) {
						log.error('入力チェック', '処理ファイルがありません。ご確認ください。');
					}

					return fileObj;
					log.debug('444','')
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
						var csvDataList = csvToArray(fileContents, '\t');
						var dataGroupDic = getGroupDatas(csvDataList, key,
								value);
						for ( var dgdId in dataGroupDic) {
							context.write({
								key : dgdId,
								value : dataGroupDic[dgdId]
							});
						}
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

						for ( var d in dataList) {

							csvAry.push(dataList[d]['csvData']);

						}
						var fileRecord = file.load({
							id : dataList[0]['fileId']
						});
						// SOを作成する
						createSo(dataList,fileRecord);
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
						name : 'custscript_djkk_jram_work_bk_folder_id'
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
												log.debug('cavDataAry',cavDataAry);
												buffer += errorData
														+ '\r\n"注文回数","作成日時","取消変更区分","注文番号","フレッシュロット","物品コード","物品名","規格名称","数量","入荷予定日","貴注番","通信欄","受注状況コード","受注状況","価格情報コード","価格情報","使用者","使用者名","仕切金額","出荷止め","現品送付先","現品送付先名","住所","製造元略称","製造元計","件数","%END%"\r\n'
														+ cavDataAry[0].csvData
//																.join('\r\n')
														+ '\r\n';

											}
										}
										var fileObj = file.create({
											name : fileName[0] + '_'
													+ getFormatYmdHms() + '.'
													+ fileName[1],
											fileType : file.Type.CSV,
											contents : buffer
										});
										fileObj.folder = cabinet
												.fileCabinetId('dj_edi_jram_error');
										fileObj.encoding = file.Encoding.SHIFT_JIS;
										fileId = fileObj.save();
										
										//20220810 add by zhou
										if(error.length>0){
								            var subject = 'JRAMエラーが発生お知らせ';
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
								            
								            var body = 'JRAMエラーが発生しました。ご対応してください。\n' +
							                'エラーメッセージ：\n' + error+ '\n' + 
							                'エラーログ付きファイル（添付ファイルを参照）:'+errorFileName+ '\n' +
								            '元のファイル（添付ファイルを参照）:'+bkFileName;
								            
								            var recipients =  runtime.getCurrentUser().id;
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
			function createSo(dataList,fileRecord) {
				var priceArr = [];
				var deveryPriceArr = [];
				var deveryItemArr=[];
				var entityItemArr = [];
				var itemrateArr = [];
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
				var date = new Date();
				soRecord.setValue({
					fieldId : 'custbody_djkk_delivery_date',
					value : date
				});
			
				

				// 日付
				var createDate = dataList[0].createDate;
				log.debug('createDate',createDate);
				log.debug('dealYyyyMmDdToDate(createDate)',dealYyyyMmDdToDate(createDate));
				if (createDate) {
					soRecord.setValue({
						fieldId : 'trandate',
						value : dealYyyyMmDdToDate(createDate)
					});
					
				}
				// DJ_EDI注文区分
				soRecord.setValue({
					fieldId : 'custbody_djkk_edi_so_kbn',
					value : 'JRAM'
				});
				// 発注書番号
				var soNo = dataList[0].soNo;
				if (soNo) {
					soRecord.setValue({
						fieldId : 'otherrefnum',
						value : soNo
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
				
				
				
				
				// DJ_JRAM_受注状況
				var jyutyuJyoukyou = dataList[0].jyutyuJyoukyou;
				if (jyutyuJyoukyou) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_jram_jyutyu_joukyou',
						value : jyutyuJyoukyou
					});
				}
				// DJ_JRAM_価格情報
				var kakakuJyouhou = dataList[0].kakakuJyouhou;
				if (kakakuJyouhou) {
					soRecord.setValue({
						fieldId : 'custbody_djkk_jram_kakaku_jyouhou',
						value : kakakuJyouhou
					});
				}
				// memo
				var csvdata = dataList[0].csvData;
				var memo = csvdata[11];
				if (memo) {
					soRecord.setValue({
						fieldId : 'memo',
						value : memo
					});
				}
				for (var i = 0; i < dataList.length; i++) {

					var dataDic = dataList[i];

					soRecord.selectNewLine({
						sublistId : 'item'
					});
					//rate
					var itemrate = dataDic.itemRate;
					itemrateArr.push(itemrate);
					// アイテム
					var item = dataDic.item;
					soRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'item',
						value : item
					});
					//changed by geng add start
					//DJ_納品先price
					if(deliveryDestination){
						var deliveryPriceObj = search.lookupFields({
						    type: 'customrecord_djkk_delivery_destination',
						    id: deliveryDestination,
						    columns: 'custrecord_djkk_price_code'
						});
						var deliveryPriceId = deliveryPriceObj['custrecord_djkk_price_code'][0].value;
						var deliveryPriceRecord = record.load({
						    type: 'customrecord_djkk_price_list',
						    id: deliveryPriceId
						});
						var deliveryPriceCount = deliveryPriceRecord.getLineCount({
						    sublistId: 'recmachcustrecord_djkk_pldt_pl'
						});
						for(var b = 0;b<deliveryPriceCount;b++){
							var deliveryPriceItem =  deliveryPriceRecord.getSublistValue({
							    sublistId: 'recmachcustrecord_djkk_pldt_pl',
							    fieldId: 'custrecord_djkk_pldt_itemcode',
							    line: b
							});
							var deliveryPriceRate =  deliveryPriceRecord.getSublistValue({
							    sublistId: 'recmachcustrecord_djkk_pldt_pl',
							    fieldId: 'custrecord_djkk_pldt_saleprice',
							    line: b
							});
							deveryPriceArr.push({
								deliveryPriceItem:deliveryPriceItem,
								deliveryPriceRate:deliveryPriceRate
							})
						}
					}
					
					//顧客price
					if(entity){
						var priceObj = search.lookupFields({
						    type: 'customer',
						    id: entity,
						    columns: 'custentity_djkk_pl_code'
						});
						var priceId = priceObj['custentity_djkk_pl_code'][0].value;
						var priceRecord = record.load({
						    type: 'customrecord_djkk_price_list',
						    id: priceId
						});
						var priceCount = priceRecord.getLineCount({
						    sublistId: 'recmachcustrecord_djkk_pldt_pl'
						});
						for(var a = 0;a<priceCount;a++){
							var priceItem =  priceRecord.getSublistValue({
							    sublistId: 'recmachcustrecord_djkk_pldt_pl',
							    fieldId: 'custrecord_djkk_pldt_itemcode',
							    line: a
							});
							var priceRate =  priceRecord.getSublistValue({
							    sublistId: 'recmachcustrecord_djkk_pldt_pl',
							    fieldId: 'custrecord_djkk_pldt_saleprice',
							    line: a
							});
							var priceQuantity = priceRecord.getSublistValue({
							    sublistId: 'recmachcustrecord_djkk_pldt_pl',
							    fieldId: 'custrecord_djkk_pldt_quantity',
							    line: a
							});
							var priceCod = priceRecord.getSublistValue({
							    sublistId: 'recmachcustrecord_djkk_pldt_pl',
							    fieldId: 'custrecord_djkk_pldt_cod_price',
							    line: a
							});
							var priceStartdate = priceRecord.getSublistValue({
							    sublistId: 'recmachcustrecord_djkk_pldt_pl',
							    fieldId: 'custrecord_djkk_pl_startdate',
							    line: a
							});	
							var priceEndate = priceRecord.getSublistValue({
							    sublistId: 'recmachcustrecord_djkk_pldt_pl',
							    fieldId: 'custrecord_djkk_pl_enddate',
							    line: a
							});
							priceArr.push({
								priceItem:priceItem,
								priceRate:priceRate,
								priceQuantity:priceQuantity,
								priceCod:priceCod,
								priceStartdate:priceStartdate,
								priceEndate:priceEndate
							})
						}
					}
					
					//item price
					var itemPrice = [];
					var type = 'item';
					var Filters = [];
					var Filterid = search.createFilter({
						name : 'internalid',
						operator : 'anyof',
						values : item
					});
					Filters.push(Filterid);
					var Columns = [];
					var fileColumn = search.createColumn({
						name : 'baseprice',
						label : '基準価格'
					});
					Columns.push(fileColumn);
					var searchResult = createSearch(type, Filters,
							Columns);
					if (searchResult && searchResult.length > 0) {
						for (var c = 0; c < searchResult.length; c++) {
							var resultObj = searchResult[c];
							var result = resultObj.getValue(fileColumn);
							itemPrice.push(result);
						}
					}

					//changed by geng add end
					// soRecord.setCurrentSublistValue({
					// sublistId : 'item',
					// fieldId : 'custcol_djkk_item',
					// value : item
					// });

					// DJ_規格
					var itemKikaku = dataDic.itemKikaku;
					if (itemKikaku) {
						soRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_djkk_specifications',
							value : itemKikaku
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

					soRecord.commitLine({
						sublistId : 'item'
					});
				}

				log.debug('SO作成予定', soRecord);
//				if(deliveryDestination){
//					for(var e=0;e<deveryPriceArr.length;e++){
//						deveryItemArr.push(deveryPriceArr[e].deliveryPriceItem)
//					}
//					for(var e=0;e<priceArr.length;e++){
//						entityItemArr.push(priceArr[e].priceItem)
//					}
//					if(deveryItemArr.indexOf(item)>-1){
//						var rate = deveryPriceArr[deveryItemArr.indexOf(item)].deliveryPriceRate
//					
//							if(rate == itemrate){
//								var soId = soRecord.save({
//									enableSourcing : true,
//									ignoreMandatoryFields : true
//								});
//								var soNumObj = record.load({
//									type:'salesorder',
//									id:soId
//								});
//								var itemCount = soNumObj.getLineCount({sublistId:'item'});
//								for(var k=0;k<itemCount;k++){
//									
//									soNumObj.setSublistValue({sublistId:'item',fieldId:'rate',line:k,value:itemrateArr[k]});//quantityAry[k]
//								}
//								soNumObj.save();
//								log.debug('SO内部ID', soId);
//							}else{
//								var user = runtime.getCurrentUser().id;
//								email.send({
//									author: 737,
//								    recipients: user,
//								    subject: '注文書作成に失敗しました',
//								    body: 'csvデータにおける仕切金額の価格が一致しない'
//								});
//							}																													
//					}else if(entityItemArr.indexOf(item)>-1){
//						var rate = priceArr[entityItemArr.indexOf(item)].priceRate
//						
//						if(rate == itemrate){
//							var soId = soRecord.save({
//								enableSourcing : true,
//								ignoreMandatoryFields : true
//							});
//							var soNumObj = record.load({
//								type:'salesorder',
//								id:soId
//							});
//							var itemCount = soNumObj.getLineCount({sublistId:'item'});
//							for(var k=0;k<itemCount;k++){
//								
//								soNumObj.setSublistValue({sublistId:'item',fieldId:'rate',line:k,value:itemrateArr[k]});//quantityAry[k]
//							}
//							soNumObj.save();
//							log.debug('SO内部ID', soId);
//						}else{
//							var user = runtime.getCurrentUser().id;
//							email.send({
//								author: 737,
//							    recipients: user,
//							    subject: '注文書作成に失敗しました',
//							    body: 'csvデータにおける仕切金額の価格が一致しない'
//							});
//						}
//					}else{
//						if(itemPrice[0]==itemrate){
//							var soId = soRecord.save({
//								enableSourcing : true,
//								ignoreMandatoryFields : true
//							});
//							var soNumObj = record.load({
//								type:'salesorder',
//								id:soId
//							});
//							var itemCount = soNumObj.getLineCount({sublistId:'item'});
//							for(var k=0;k<itemCount;k++){
//								
//								soNumObj.setSublistValue({sublistId:'item',fieldId:'rate',line:k,value:itemrateArr[k]});//quantityAry[k]
//							}
//							soNumObj.save();
//							log.debug('SO内部ID', soId);
//						}else{
//							var user = runtime.getCurrentUser().id;
//							email.send({
//								author: 737,
//							    recipients: user,
//							    subject: '注文書作成に失敗しました',
//							    body: 'csvデータにおける仕切金額の価格が一致しない'
//							});
//						}
//					}
//				}
				if(entity){
					for(var e=0;e<priceArr.length;e++){
						entityItemArr.push(priceArr[e].priceItem)
					}
					if(entityItemArr.indexOf(item)>-1){
						var rate='';
						var priceStart = priceArr[entityItemArr.indexOf(item)].priceStartdate;
						var priceEnd = priceArr[entityItemArr.indexOf(item)].priceEndate;
						var start = new Date(priceStart).getTime();
						var end = '';
						if(priceEnd){
							 end = new Date(priceEnd).getTime();
						}	
						log.debug('start',start);
						log.debug('end',end);
						var testDate = dataList[0].createDate;
						var nowdate = new Date(testDate).getTime();
						log.debug('nowdate',nowdate);
						if(!priceEnd){
							if(nowdate<start){
								rate=itemPrice[0];
							}else{
								if(quantity<priceArr[entityItemArr.indexOf(item)].priceQuantity){
									rate = priceArr[entityItemArr.indexOf(item)].priceRate
								}else{
									rate = priceArr[entityItemArr.indexOf(item)].priceCod
								}	
							}
						}else{
							if(nowdate>start&&nowdate<Number(end)){
								if(quantity<priceArr[entityItemArr.indexOf(item)].priceQuantity){
									rate = priceArr[entityItemArr.indexOf(item)].priceRate
								}else{
									rate = priceArr[entityItemArr.indexOf(item)].priceCod
								}	
							}else{
								rate = itemPrice[0];
							}
						}
//						if(quantity<priceArr[entityItemArr.indexOf(item)].priceQuantity){
//							rate = priceArr[entityItemArr.indexOf(item)].priceRate
//						}else{
//							rate = priceArr[entityItemArr.indexOf(item)].priceCod
//						}					
						
							if(Number(rate) == Number(itemrate)){
								var soId = soRecord.save({
									enableSourcing : true,
									ignoreMandatoryFields : true
								});
								var soNumObj = record.load({
									type:'salesorder',
									id:soId
								});
								var itemCount = soNumObj.getLineCount({sublistId:'item'});
								for(var k=0;k<itemCount;k++){
									
									soNumObj.setSublistValue({sublistId:'item',fieldId:'rate',line:k,value:itemrateArr[k]});//quantityAry[k]
								}
								soNumObj.save();
								log.debug('SO内部ID', soId);
							}else{
								var errorMessage = 'csvデータにおける仕切金額の価格が一致しない';
								var fileName=fileRecord.name;
								var errorDataList = [];
								errorDataList.push(dataDic);
								setErrorRecordValue(fileName, JSON
										.stringify(errorDataList), errorMessage);
							}

					}else{
						if(Number(itemPrice[0])==Number(itemrate)){
							var soId = soRecord.save({
								enableSourcing : true,
								ignoreMandatoryFields : true
							});
							var soNumObj = record.load({
								type:'salesorder',
								id:soId
							});
							var itemCount = soNumObj.getLineCount({sublistId:'item'});
							for(var k=0;k<itemCount;k++){
								
								soNumObj.setSublistValue({sublistId:'item',fieldId:'rate',line:k,value:itemrateArr[k]});//quantityAry[k]
							}
							soNumObj.save();
							log.debug('SO内部ID', soId);
						}else{
							var errorMessage = 'csvデータにおける仕切金額の価格が一致しない';
							var fileName=fileRecord.name;
							var errorDataList = [];
							errorDataList.push(dataDic);
							setErrorRecordValue(fileName, JSON
									.stringify(errorDataList), errorMessage);
						}
					}
				}
				if((!deliveryDestination)&&(!entity)){
					if(Number(itemPrice[0])==Number(itemrate)){
						var soId = soRecord.save({
							enableSourcing : true,
							ignoreMandatoryFields : true
						});
						var soNumObj = record.load({
							type:'salesorder',
							id:soId
						});
						var itemCount = soNumObj.getLineCount({sublistId:'item'});
						for(var k=0;k<itemCount;k++){
							
							soNumObj.setSublistValue({sublistId:'item',fieldId:'rate',line:k,value:itemrateArr[k]});//quantityAry[k]
						}
						soNumObj.save();
						log.debug('SO内部ID', soId);
					}else{
						var errorMessage = 'csvデータにおける仕切金額の価格が一致しない';
						var fileName=fileRecord.name;
						var errorDataList = [];
						errorDataList.push(dataDic);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);
					}
				}
				
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
			 * 処理データをグループする
			 * 
			 * @param tmpDataList
			 *            データリスト
			 */
			function getGroupDatas(dataList, fileId, fileName) {

				var ucpCodeList = [];
				var entityList = [];
				var itemNameList = [];
				var deliveryDestinationList = [];
				for (var i = 0; i < dataList.length; i++) {
					if (dataList.length == 1) {
						continue;
					}
					var tmpDataList = dataList[i];

					// 物品コード5
					var itemCode = tmpDataList[5];
					if (itemCode) {
						if (ucpCodeList.indexOf(itemCode) == -1) {
							ucpCodeList.push(itemCode);
						}
					}
					//changed by geng add start U005
					// 物品コード5
					var itemName = tmpDataList[6];
					if (itemName) {
						if (itemNameList.indexOf(itemName) == -1) {
							itemNameList.push(itemName);
						}
					}
					//changed by geng add end U005
					// 使用者コード16
					var entity = tmpDataList[16];
					if (entity) {
						if (entityList.indexOf(entity) == -1) {
							entityList.push(entity);
						}
					}
					// 納入先名称22
					var deliveryDestination = tmpDataList[20];
					if (deliveryDestination) {
						if (deliveryDestinationList
								.indexOf(deliveryDestination) == -1) {
							deliveryDestinationList.push(deliveryDestination);
						}
					}
				}

				// アイテムIDを取得する
				var itemIdDic = getItemIdByUpcList(ucpCodeList,itemNameList);
				// 顧客IDを取得する
				var customerIdDic = getCustomerIdByCode(entityList);
				// DJ_納品先を取得する
				var deliveryDestDic = getDeliveryDestIdByName(deliveryDestinationList);

				var dataGroupDic = {};
				for (var j = 0; j < dataList.length; j++) {
					tmpDataList = dataList[j];
					if (j == 0) {
						continue;
					}
					if (tmpDataList.length == 1) {
						continue;
					}
					var lineNum = j + 1;
					var lineMsg = '「' + fileName + '」の' + lineNum;
					var dicDataDic = {};
					// ファイルID
					dicDataDic.fileId = fileId;
					// 作成日時1
					var createDate = tmpDataList[1];
					var ymd = createDate.split('/');
					var year = ymd[0].toString();
					var month = ymd[1].toString();
					if(month[0]=='0'){
						month = month[1];
					}
					var date = ymd[2].toString().substring(0, 2);
					createDate=year+'/'+month+'/'+date;
					log.debug(createDate,typeof(createDate));
					dicDataDic.createDate = createDate;
					// 注文番号3
					var soNo = tmpDataList[3];
					dicDataDic.soNo = soNo;
					// 物品コード5
					itemCode = tmpDataList[5];
					if (!itemCode) {
						var errorMessage = lineMsg + '行目の品目コードが空白です。';

						log.error('データエラー', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
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
					// 規格7
					var itemKikaku = tmpDataList[7];
					dicDataDic.itemKikaku = itemKikaku;
					// 数量8
					var quantity = tmpDataList[8];
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
					// 受注状況13
					var jyutyuJyoukyou = tmpDataList[13];
					dicDataDic.jyutyuJyoukyou = jyutyuJyoukyou;
					// 価格情報15
					var kakakuJyouhou = tmpDataList[15];
					dicDataDic.kakakuJyouhou = kakakuJyouhou;
					//changed by geng add start U005
					//仕切金額
					var itemRate = tmpDataList[18];
					if(!itemRate){
						var errorMessage = lineMsg + '行目の仕切金額が空白です。';

						log.error('データエラー', errorMessage);

						var errorDataList = [];
						errorDataList.push(tmpDataList);
						setErrorRecordValue(fileName, JSON
								.stringify(errorDataList), errorMessage);

						continue;
					}
					dicDataDic.itemRate = itemRate;
					//changed by geng add end U005
					// DJ_納品先
					var deliveryDestination = tmpDataList[20];
					if (deliveryDestination) {
						var dicDeliveryDest = deliveryDestDic[deliveryDestination];
						if (dicDeliveryDest) {
							dicDataDic.deliveryDestination = dicDeliveryDest;
						}
					}
					// 使用者
					entity = tmpDataList[16];
					if (!entity) {
						var errorMessage = lineMsg + '行目の使用者が空白です。';

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
			 * UPCコードでアイテム内部IDを取得する
			 * 
			 * @param upcCode
			 *            UPCコード
			 */
			function getItemIdByUpcList(upcCodeList,itemNameList) {

				var resultIdDic = {};

				// 検索タイプ
				var searchType = 'item';

				// 検索条件
				var searchFilters = [];
				searchFilters.push(getOrFilters('upccode', 'is', upcCodeList));
				searchFilters.push('AND');
				searchFilters.push(getOrFilters('itemid', 'is', itemNameList));
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

				return resultIdDic;
			}

			/**
			 * 名前で顧客内部IDを取得する
			 * 
			 * @param codeList
			 *            顧客コード
			 */
			function getCustomerIdByCode(codeList) {

				var resultIdDic = {};

				// 検索タイプ
				var searchType = 'customer';

				// 検索条件
				var searchFilters = [];
				searchFilters.push(getOrFilters(
						'custentity_djkk_jram_customer_code', 'is', codeList));

				// 検索コラム
				var searchColumns = [];
				// 内部ID
				var idObj = search.createColumn({
					name : 'internalid'
				});
				searchColumns.push(idObj);
				// DJ_JRAM_使用者コード
				var companyNameObj = search.createColumn({
					name : 'custentity_djkk_jram_customer_code'
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
				searchFilters.push(getOrFilters('custrecord_djkk_delivery_code', 'is', nameList));

				// 検索コラム
				var searchColumns = [];
				// 内部ID
				var idObj = search.createColumn({
					name : 'internalid'
				});
				searchColumns.push(idObj);
				// 顧客名
				var nameObj = search.createColumn({
					name : 'custrecord_djkk_delivery_code'
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
			 * YYYYMMDDを日付に変化する
			 */
			function dealYyyyMmDdToDate(strDate) {

				var strDatas = strDate.split('/');
				var year = strDatas[0];
				var day = strDatas[2].toString().substring(0, 2);
				var month = parseInt(strDatas[1])-1;
				var date = new Date(year, month, day);
				log.debug('date',date);
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
		});