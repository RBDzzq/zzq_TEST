/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format', 'N/task', 'N/record', 'N/log'], function (search, format, task, record, log) {

	function doGet(requestBody) {
		var result = {};
		result.pro_id = requestBody.processName;
		log.debug({
			title: 'doget - result.pro_id',
			details: result.pro_id
		});

		try {
			switch (requestBody.processName) {
				case 'IF_E_0010_S_NS_TO_HFT':
					// 入荷指示
					result.data = getInStockData();
					break;
				case 'IF_E_0030_S_NS_TO_HFT':
					// 出荷指示
					result.data = getShippingOrderData();
					break;
				case 'IF_E_0050_S_NS_TO_HFT':
					// 転送依頼
					result.data = forwardingRequest(requestBody.syncDateTime);
					break;
				case 'IF_E_0080_S_NS_TO_HFT':
					// セット品作成依頼
					result.data = getSetProductOrder();
					break;
				case 'ERROR_ORDER_NUMBER':
					result.data = getErrorOrderNumber();
					break;
				case 'ORDER_PREPAYMENT_CONFIRMED':
					// 注文前払金確認済み
					result.data = getOrderPrepaymentConfirmed(requestBody.syncDateTime);
					break;
				case 'SHIPPING_HISTORY':
					// 出荷履歴
					result.data = getShippingHistory(requestBody.syncDateTime);
					break;
				case 'PRICE_LIST':
					// 価格表
					result.data = getPriceList(requestBody.syncDateTime);
					break;
				case 'CUSTOMER':
					// 顧客
					result.data = getCustomer(requestBody.syncDateTime);
					break;
				case 'DELIVERY_AREA':
					// 配送エリア
					result.data = getDeliveryArea(requestBody.syncDateTime);
					break;
				case 'SECTION':
					// Nセクション
					result.data = getSection();
					break;
				case 'ITEM':
					result.data = getItems();
					break;
				case 'HOLIDAY':
					result.data = getHoliday();
					break;
			}
			if (result.hasOwnProperty('data')) {
				result.total = result.data.length;
			}
			result.status = "1";
			result.message = "OK";

		} catch (e) {
			result.status = "9";
			result.message = e;
		}

		//		var endTime = new Date().getTime() + 30000;
		//        var now = null;
		//        do{
		//            now = new Date().getTime();
		//        }while(now < endTime);

		return result;
	}
	/**
	 * Function called upon sending a POST request to the RESTlet.
	 * 
	 * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request
	 * Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be
	 * a valid JSON)
	 * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request
	 * Content-Type is 'application/json'
	 * @since 2015.2
	 */
	function doPost(requestBody) {
		log.debug({ title: 'doPost - requestBody', details: JSON.stringify(requestBody) });
		var result = {
			status: '0',
			message: ''
		};

		if (!requestBody.hasOwnProperty('processName')) {
			result = {
				status: 'failed',
				message: 'processNameが含まれていません。'
			};
			return result;
		}

		var arrGetType = [
			'CUSTOMER',
			'SHIPPING_HISTORY',
			'DELIVERY_AREA',
			'PRICE_LIST',
			'IF_E_0010_S_NS_TO_HFT',
			'IF_E_0030_S_NS_TO_HFT',
			'IF_E_0050_S_NS_TO_HFT',
			'IF_E_0060_R_NS_FRM_HFT',
			'IF_E_0080_S_NS_TO_HFT',
			'ERROR_ORDER_NUMBER',
			'ORDER_PREPAYMENT_CONFIRMED',
			'SECTION',
			'ITEM',
			'HOLIDAY'
		];
		if (arrGetType.indexOf(requestBody.processName) < 0) {
			if (!requestBody.hasOwnProperty('datas')) {
				result = {
					status: 'failed',
					message: 'datasが含まれていません。'
				};
				return result;
			}
		}

		switch (requestBody.processName.toString()) {
			case 'SECTION':
				// Nセクション
				result.data = getSection();
				break;
			case 'CUSTOMER':
				result.data = getCustomer(requestBody.syncDateTime);
				break;
			case 'SHIPPING_HISTORY':
				// 出荷履歴
				result.data = getShippingHistory(requestBody.syncDateTime);
				break;
			case 'DELIVERY_AREA':
				// 配送エリア
				result.data = getDeliveryArea(requestBody.syncDateTime);
				break;
			case 'PRICE_LIST':
				// 価格表
				result.data = getPriceList(requestBody.syncDateTime);
				break;
			case 'IF_E_0010_S_NS_TO_HFT':
				// 入荷指示
				result.data = getInStockData();
				break;
			case 'IF_E_0030_S_NS_TO_HFT':
				// 出荷指示
				result.data = getShippingOrderData();
				break;
			case 'IF_E_0050_S_NS_TO_HFT':
				// 転送依頼
				result.data = forwardingRequest(requestBody.syncDateTime);
				break;
			case 'IF_E_0060_R_NS_FRM_HFT':
				// 転送報告
				executeTransferRecord(requestBody.datas);
				break;
			case 'IF_E_0080_S_NS_TO_HFT':
				// セット品作成依頼
				result.data = getSetProductOrder();
				break;
			case 'ERROR_ORDER_NUMBER':
				result.data = getErrorOrderNumber();
				break;
			case 'ORDER_PREPAYMENT_CONFIRMED':
				// 注文前払金確認済み
				result.data = getOrderPrepaymentConfirmed(requestBody.syncDateTime);
				break;
			case 'IF_E_0020_R_NS_FRM_HFT':
				// 入荷実績
				executeArrivalRecord(requestBody.datas);
				break;
			case 'IF_E_0040_R_NS_FRM_HFT':
				// 出荷実績
				executeShipmentRecord(requestBody.datas);
				break;
			case 'IF_E_0070_R_NS_FRM_HFT':
				// 在庫数量
				executeStockQuantity(requestBody.datas);
				break;
			case 'IF_E_0090_R_NS_FRM_HFT':
				// セット品作成実績
				executeSetProductResults(requestBody.datas);
				break;
			case 'INVENTORY_TRANSFER_RESULTS':
				// 在庫移動実績
				executeInventoryTransferResults(requestBody.datas);
				break;
			case 'INSERT_SALESORDER':
				// N注文
				executeInsertSalesOrder(requestBody['record_data']);
				break;
			case 'ITEM':
				result.data = getItems();
				break;
			case 'HOLIDAY':
				result.data = getHoliday();
				break;
		}

		//		var endTime = new Date().getTime() + 30000;
		//        var now = null;
		//        do{
		//            now = new Date().getTime();
		//        }while(now < endTime);

		return result;
	}

	return {
		get: doGet,
		post: doPost
	};

	/**
	 * 転送依頼
	 * @param {*} syncDateTime 
	 * @returns 
	 */
	function forwardingRequest(syncDateTime) {
		var resultDatas = [];

		var updateTransactionIds = [];
		/**
		 * 連携済み更新対象情報
		 * @type {Array}
		 */
		var arrUpdateInfo = [];

		var strSystemDate = getJapanDateTime();

		strSystemDate = strSystemDate.getFullYear()
			+ ("00" + (strSystemDate.getMonth() + 1)).slice(-2)
			+ ("00" + strSystemDate.getDate()).slice(-2);

		var allSubsidiaryId = getSubsidiaryIds(false);
		var transferSectionCodeById = {};

		var locationCodeById = {};
		var locationFilters = [];
		var locationColumns = [];
		locationColumns.push(search.createColumn({ name: 'custrecord_djkk_wms_location_code' }));
		var locationResults = searchResult(search.Type.LOCATION, locationFilters, locationColumns);
		for (var i = 0; i < locationResults.length; i++) {
			var tmpId = locationResults[i].id;
			var tmpCode = locationResults[i].getValue({ name: 'custrecord_djkk_wms_location_code' });
			locationCodeById[(tmpId.toString())] = tmpCode;
		}

		var sectionFilters = [];
		var sectionColumns = [];
		sectionColumns.push(search.createColumn({ name: 'custrecord_djkk_transfer_section_code' }));
		var sectionResults = searchResult('customrecord_djkk_transfer_section', sectionFilters, sectionColumns);
		for (var i = 0; i < sectionResults.length; i++) {
			transferSectionCodeById[(sectionResults[i].id.toString())] = sectionResults[i].getValue({ name: 'custrecord_djkk_transfer_section_code' });
		}

		var arrDataLocationIds = getDataLocationIds();

		/** 移動伝票START */
		var filters = [];
		// if (syncDateTime != null && syncDateTime != '') {
		// 	filters.push(["formulanumeric: TO_DATE('" + syncDateTime + "','yyyy-MM-dd HH24:MI:SS')-{lastmodifieddate}", "lessthanorequalto", "0"]);
		// 	filters.push('and');
		// }
		filters.push(['mainline', 'is', false]);
		filters.push('and');
		filters.push(['taxline', 'is', false]);
		filters.push('and');

		filters.push(['type', 'is', 'TrnfrOrd']);
		filters.push('and');
		filters.push(['subsidiary', 'anyof', allSubsidiaryId]);
		filters.push('and');
		filters.push(['custbody_djkk_exsystem_wms_sended', 'is', false]);
		var columns = [];
		// 日付
		columns.push(search.createColumn({ name: 'trandate' }));
		// DJ_完了期日
		columns.push(search.createColumn({ name: 'custbody_djkk_completion_date' }));
		// トランザクション番号
		columns.push(search.createColumn({ name: 'tranid' }));
		columns.push(search.createColumn({ name: 'transactionnumber' }));
		columns.push(search.createColumn({ name: 'location' }));
		columns.push(search.createColumn({ name: 'transferlocation' }));
		columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
		columns.push(search.createColumn({ name: 'custcol_djkk_remars' }));
		columns.push(search.createColumn({ name: 'quantity' }));
		// アイテム.アイテムID
		columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
		// アイテム.DJ_移管区分
		columns.push(search.createColumn({ name: 'custitem_djkk_item_transfer_section', join: 'item' }));
		columns.push(search.createColumn({ name: 'inventorynumber', join: 'inventorydetail' }));
		columns.push(search.createColumn({ name: 'expirationdate', join: 'inventorydetail' }));
		columns.push(search.createColumn({ name: 'custitem_djkk_organicflg', join: 'item' }));
		columns.push(search.createColumn({ name: 'custbody_djkk_exsystem_tranid' }));
		// アイテム.DJ_カタログ製品コード
		columns.push(search.createColumn({ name: 'custitem_djkk_product_code', join: 'item' }));

		var results = searchResult(search.Type.TRANSACTION, filters, columns);

		var transferLocationById = {};
		for (var i = 0; i < results.length; i++) {
			var tmpResult = results[i];
			var tmpId = tmpResult.id;
			var tmpLocation = tmpResult.getValue({ name: 'location' });
			var tmpQuantity = Number(tmpResult.getValue({ name: 'quantity' }));

			if (transferLocationById.hasOwnProperty(tmpId.toString())) {
				if (tmpQuantity < 0) {
					transferLocationById[(tmpId.toString())]['fromLocation'] = tmpLocation;
				} else {
					transferLocationById[(tmpId.toString())]['toLocation'] = tmpLocation;
				}
			} else {
				if (tmpQuantity < 0) {
					transferLocationById[(tmpId.toString())] = {
						fromLocation: tmpLocation
					};
				} else {
					transferLocationById[(tmpId.toString())] = {
						toLocation: tmpLocation
					};
				}
			}
		}

		for (var i = 0; i < results.length; i++) {
			var tmpResult = results[i];
			var transactionDate = tmpResult.getValue({ name: 'trandate' });
			var completionDate = tmpResult.getValue({ name: 'custbody_djkk_completion_date' });
			var expirationDate = tmpResult.getValue({ name: 'expirationdate', join: 'inventorydetail' });
			var tmpExsystemTranid = tmpResult.getValue({ name: 'custbody_djkk_exsystem_tranid' });

			var tmpLocation = tmpResult.getValue({ name: 'location' });
			var tmpTransferLocation = tmpResult.getValue({ name: 'transferlocation' });

			if (arrDataLocationIds.indexOf(tmpLocation.toString()) < 0) {
				continue;
			}

			if (arrDataLocationIds.indexOf(tmpTransferLocation.toString()) < 0) {
				continue;
			}

			if (tmpExsystemTranid != null && tmpExsystemTranid != '') {
				continue;
			}
			var tmpQuantity = tmpResult.getValue({ name: 'quantity' });
			if (tmpQuantity < 0) {
				continue;
			}
			if (transactionDate != null && transactionDate != '') {
				transactionDate = format.parse({ value: transactionDate, type: format.Type.DATE });
				transactionDate = transactionDate.getFullYear() + ('00' + (transactionDate.getMonth() + 1)).slice(-2) + ('00' + transactionDate.getDate()).slice(-2);
			} else {
				transactionDate = '';
			}
			if (completionDate != null && completionDate != '') {
				completionDate = format.parse({ value: completionDate, type: format.Type.DATE });
				completionDate = completionDate.getFullYear() + ('00' + (completionDate.getMonth() + 1)).slice(-2) + ('00' + completionDate.getDate()).slice(-2);
			} else {
				completionDate = '';
			}
			if (expirationDate != null && expirationDate != '') {
				expirationDate = format.parse({ value: expirationDate, type: format.Type.DATE });
				expirationDate = expirationDate.getFullYear() + ('00' + (expirationDate.getMonth() + 1)).slice(-2) + ('00' + expirationDate.getDate()).slice(-2);
			} else {
				expirationDate = '';
			}

			var locationFrom = transferLocationById[(tmpResult.id.toString())]['fromLocation'];
			var locationTo = transferLocationById[(tmpResult.id.toString())]['toLocation'];

			log.debug({ title: 'locationFrom', details: locationFrom });
			log.debug({ title: 'locationTo', details: locationTo });

			if (locationCodeById.hasOwnProperty(locationFrom)) {
				locationFrom = locationCodeById[(locationFrom.toString())];
			}

			if (locationCodeById.hasOwnProperty(locationTo)) {
				locationTo = locationCodeById[(locationTo.toString())];
			}

			log.debug({
				title: tmpResult.id,
				details: tmpResult.getValue({ name: 'custcol_djkk_exsystem_line_num' })
			});

			var tmpRemarks = tmpResult.getValue({ name: 'custcol_djkk_remars' });
			tmpRemarks = tmpRemarks.split('\n').join(' ');
			tmpRemarks = tmpRemarks.split('	').join(' ');

			resultDatas.push({
				// システム日付
				SysDate: strSystemDate,
				// 移管区分
				//				TransferType: tmpResult.getValue({ name: 'custitem_djkk_item_transfer_section', join: 'item' }),
				TransferType: 'U',
				// 移管処理入力日
				TransactionDate: transactionDate,
				// 完了期日
				DedlineDate: completionDate,
				// 社内納品書番号
				DeliveryDocument: tmpResult.getValue({ name: 'transactionnumber' }),
				// 移管倉庫コードFrom
				WHFrom: locationFrom,
				// 移管倉庫コードTo
				WHTo: locationTo,
				LineNumber: tmpResult.getValue({ name: 'custcol_djkk_exsystem_line_num' }),
				// 在庫コードFrom
				StockCode: tmpResult.getValue({ name: 'itemid', join: 'item' }),
				// バッチ番号From
				BatchNumberFrom: tmpResult.getText({ name: 'inventorynumber', join: 'inventorydetail' }),
				// 賞味期限From
				DateBestBeforeFrom: expirationDate,
				// 数量From　（最小単位）
				Qty: tmpResult.getValue({ name: 'quantity' }),
				// バッチ番号To　　
				BatchNumberTo: tmpResult.getText({ name: 'inventorynumber', join: 'inventorydetail' }),
				// 特記事項
				Remarks: tmpRemarks,
				// オーガニックフラグ
				OrganicFlag: (tmpResult.getValue({ name: 'custitem_djkk_organicflg', join: 'item' }) ? '1' : '0'),
				// カタログコード
				ProductCode: tmpResult.getValue({ name: 'custitem_djkk_product_code', join: 'item' })
			});

			if (updateTransactionIds.indexOf(tmpResult.id.toString()) < 0) {
				updateTransactionIds.push(tmpResult.id.toString());
			}
		}

		updateTransactionIds.map(function (id) {
			arrUpdateInfo.push({
				type: record.Type.TRANSFER_ORDER,
				id: id
			});
		});
		/** 移動伝票END */

		/** 在庫調整START */
		updateTransactionIds = [];
		let inventoryAdjustmentFilters = [];

		/** 連結子会社 = 「 2-1 NICHIFUTSU BOEKI K.K.」、「3-1 UNION LIQUORS K.K.」 */
		let arrSubsidiaryFilters = [];
		allSubsidiaryId.map(function (subsidiaryId, index) {
			arrSubsidiaryFilters.push(['subsidiary', search.Operator.IS, subsidiaryId.toString()]);
			if (index != allSubsidiaryId.length - 1) {
				arrSubsidiaryFilters.push('OR')
			}
		});
		inventoryAdjustmentFilters.push(arrSubsidiaryFilters);
		inventoryAdjustmentFilters.push('AND');

		/** DJ_変更理由 = 倉庫連携 */
        inventoryAdjustmentFilters.push(['custbody_djkk_change_reason.custrecord_djkk_wh_contact_flg', search.Operator.IS, true]);
        inventoryAdjustmentFilters.push('AND');

		/** DJ_WMS送信済 = false */
		inventoryAdjustmentFilters.push(['custbody_djkk_exsystem_wms_sended', search.Operator.IS, false]);
		inventoryAdjustmentFilters.push('AND');

		/** 最終送信日時 >= 指定日時 */
		// inventoryAdjustmentFilters.push(["formulanumeric: TO_DATE('" + syncDateTime + "','yyyy-MM-dd HH24:MI:SS')-{lastmodifieddate}", "lessthanorequalto", "0"]);
		// inventoryAdjustmentFilters.push('AND');

		/** メインライン = false */
		inventoryAdjustmentFilters.push(['mainline', search.Operator.IS, false]);
		inventoryAdjustmentFilters.push('AND');

		/** 税金ライン = false */
		inventoryAdjustmentFilters.push(['taxline', search.Operator.IS, false]);
		inventoryAdjustmentFilters.push('AND');

		/** 数量 <> 0 */
		inventoryAdjustmentFilters.push(['quantity', search.Operator.NOTEQUALTO, 0]);
		inventoryAdjustmentFilters.push('AND');

		/** 明細.場所  */
		let arrLocationFilters = [];
		arrDataLocationIds.map(function (locationId, index) {
			arrLocationFilters.push(['location', search.Operator.IS, locationId.toString()]);
			if (index != arrDataLocationIds.length - 1) {
				arrLocationFilters.push('OR')
			}
		});
		inventoryAdjustmentFilters.push(arrLocationFilters);

		let inventoryAdjustmentColumns = [];
		/** 日付 */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'trandate' }));
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'transactionnumber' }));
		/** 調整数量 */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'quantity' }));
		/** 明細.場所.DJ_WMS倉庫コード */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'custrecord_djkk_wms_location_code', join: 'location' }));
		/** DJ_外部システム_行番号 */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
		/** アイテム.商品コード */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'itemid', join: 'item' }));
		/** アイテム.DJ_オーガニックフラグ */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'custitem_djkk_organicflg', join: 'item' }));
		/** アイテム.DJ_カタログ製品コード */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'custitem_djkk_product_code', join: 'item' }));
		/** 明細.在庫詳細.シリアル/ロット番号 */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'inventorynumber', join: 'inventorydetail' }));
		/** 明細.在庫詳細.賞味期限 */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'expirationdate', join: 'inventorydetail' }));
		/** 明細.場所 */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'location' }));
        /** DJ_完了期日 */
        inventoryAdjustmentColumns.push(search.createColumn({ name: 'custbody_djkk_completion_date' }));
        /** DJ_備考 */
        inventoryAdjustmentColumns.push(search.createColumn({ name: 'custcol_djkk_remars' }));

		let inventoryAdjustmentResults = searchResult(search.Type.INVENTORY_ADJUSTMENT, inventoryAdjustmentFilters, inventoryAdjustmentColumns);

		let objLineItemInfoById = {};
        let objResultsById = {};
		inventoryAdjustmentResults.map(function (tmpResult) {
			let tmpResultId = tmpResult.id;
			/**
			 * 明細.DJ_外部システム_明細行番号
			 * @type {number}
			 */
			let tmpResultLineNo = tmpResult.getValue({ name: 'custcol_djkk_exsystem_line_num' });
			/**
			 * 明細.アイテム.DJ_オーガニックフラグ
			 */
			let tmpResultItemOrganicFlg = tmpResult.getValue({ name: 'custitem_djkk_organicflg', join: 'item' });
			/**
			 * 明細.アイテム.DJ_オーガニックフラグ
			 */
			let tmpResultItemProductCode = tmpResult.getValue({ name: 'custitem_djkk_product_code', join: 'item' });

			let tmpObj = {};

			if (objLineItemInfoById.hasOwnProperty(tmpResultId.toString())) {
				tmpObj = objLineItemInfoById[(tmpResultId.toString())];
				if (!tmpObj.hasOwnProperty(tmpResultLineNo.toString())) {
					tmpObj[(tmpResultLineNo.toString())] = {
						itemOrganicFlg: tmpResultItemOrganicFlg,
						itemProductCode: tmpResultItemProductCode,
						location: tmpResult.getValue({ name: 'location' })
					}
				}
				objLineItemInfoById[(tmpResultId.toString())] = tmpObj;
			} else {
				tmpObj = {};
				tmpObj[(tmpResultLineNo.toString())] = {
					itemOrganicFlg: tmpResultItemOrganicFlg,
					itemProductCode: tmpResultItemProductCode,
					location: tmpResult.getValue({ name: 'location' })
				};
				objLineItemInfoById[(tmpResultId.toString())] = tmpObj;
			}

            let arrResultsById = [];
            if (objResultsById.hasOwnProperty(tmpResultId.toString())) {
                arrResultsById = objResultsById[tmpResultId.toString()];
            }

            arrResultsById.push(tmpResult)

            objResultsById[tmpResultId.toString()] = arrResultsById;
		});

        Object.keys(objResultsById).forEach(function(tmpResultId) {
            let arrCurrentResults = objResultsById[tmpResultId.toString()];

            let objTmpResult = {
                /** システム日付 */
                SysDate: '',
                /** 移管区分 */
                TransferType: 'U',
                /** 移管処理入力日 */
                TransactionDate: '',
                /** 完了期日 */
                DedlineDate: '',
                /** 社内納品書番号 */
                DeliveryDocument: '',
                /** 移管倉庫コードFrom */
                WHFrom: '',
                /** 移管倉庫コードTo */
                WHTo: '',
                /** 明細行番号 */
                LineNumber: '',
                /** 在庫コード */
                StockCode: '',
                /** 管理番号From */
                BatchNumberFrom:'',
                /** 賞味期限From */
                DateBestBeforeFrom:'',
                /** 数量 */
                Qty:'',
                /** 管理番号To */
                BatchNumberTo:'',
                /** 特記事項 */
                Remarks:'',
                /** オーガニックフラグ */
                OrganicFlag:'',
                /** カタログコード */
                ProductCode:''
            };

            arrCurrentResults.forEach(function(tmpResult, index) {
                if (index > 1) {
                    return;
                }

                let tmpResultId = tmpResult.id;

                /**
                 * 結果.日付
                 */
                let tmpResultTranDate = tmpResult.getValue({ name: 'trandate' });

                if (tmpResultTranDate != null && tmpResultTranDate != '') {
                    tmpResultTranDate = format.parse({ value: tmpResultTranDate, type: format.Type.DATE });
                    tmpResultTranDate = tmpResultTranDate.getFullYear() + ('00' + (tmpResultTranDate.getMonth() + 1)).slice(-2) + ('00' + tmpResultTranDate.getDate()).slice(-2);
                } else {
                    tmpResultTranDate = '';
                }

                /**
                 * 結果.在庫詳細.有効期限
                 */
                let tmpResultInventoryDetailDate = tmpResult.getValue({ name: 'expirationdate', join: 'inventorydetail' });
                if (tmpResultInventoryDetailDate != null && tmpResultInventoryDetailDate != '') {
                    tmpResultInventoryDetailDate = format.parse({ value: tmpResultInventoryDetailDate, type: format.Type.DATE });
                    tmpResultInventoryDetailDate = tmpResultInventoryDetailDate.getFullYear() + ('00' + (tmpResultInventoryDetailDate.getMonth() + 1)).slice(-2) + ('00' + tmpResultInventoryDetailDate.getDate()).slice(-2);
                } else {
                    tmpResultInventoryDetailDate = '';
                }

                /**
                 * 調整数量
                 * @type {number}
                 */
                let tmpResultAdjustQuantity = tmpResult.getValue({ name: 'quantity' });
                /**
                 * 明細.場所.DJ_WMS倉庫コード
                 * @type {string}
                 */
                let tmpResultLocation = tmpResult.getValue({ name: 'custrecord_djkk_wms_location_code', join: 'location' });

                let objFirstLineItemInfo = {};
                let numFirstLineNo = Object.keys(objLineItemInfoById[(tmpResultId.toString())]).sort(function (a, b) {
                    return Number(a) - Number(b);
                })[0];
                objFirstLineItemInfo = objLineItemInfoById[(tmpResultId.toString())][numFirstLineNo];

                if (arrDataLocationIds.indexOf(objFirstLineItemInfo.location.toString()) < 0) {
                    return;
                }

                /** システム日付 */
                objTmpResult.SysDate = strSystemDate;
                /** 移管区分 */
                objTmpResult.TransferType = 'U';
                /** 移管処理入力日 */
                objTmpResult.TransactionDate = tmpResultTranDate;
                /** 完了期日 */
                objTmpResult.DedlineDate = formatDate(tmpResult.getValue({name: 'custbody_djkk_completion_date'}));
                /** 社内納品書番号 */
                objTmpResult.DeliveryDocument = tmpResult.getValue({name: 'transactionnumber'});
                /** 移管倉庫コードFrom */
                if (tmpResultAdjustQuantity < 0) {
                    objTmpResult.WHFrom = tmpResultLocation;
                }
                /** 移管倉庫コードTo */
                if (tmpResultAdjustQuantity >= 0) {
                    objTmpResult.WHTo = tmpResultLocation;
                }
                /** 明細行番号 */
                if (index == 0) {
                    objTmpResult.LineNumber = tmpResult.getValue({ name: 'custcol_djkk_exsystem_line_num' });
                }
                /** 在庫コード */
                objTmpResult.StockCode = tmpResult.getValue({ name: 'itemid', join: 'item' });
                /** 管理番号From */
                if (tmpResultAdjustQuantity < 0) {
                    objTmpResult.BatchNumberFrom = tmpResult.getText({ name: 'inventorynumber', join: 'inventorydetail' });
                }
                
                /** 賞味期限From */
                if (tmpResultAdjustQuantity < 0) {
                    objTmpResult.DateBestBeforeFrom = tmpResultInventoryDetailDate;
                }
                /** 数量 */
                if (tmpResultAdjustQuantity >= 0) {
                    objTmpResult.Qty = tmpResultAdjustQuantity;
                }
                
                /** 管理番号To */
                if (tmpResultAdjustQuantity >= 0) {
                    objTmpResult.BatchNumberTo = tmpResult.getText({ name: 'inventorynumber', join: 'inventorydetail' });
                }
                /** 特記事項 */
                if (index == 0) {
                    let tmpRemarks = tmpResult.getValue({ name: 'custcol_djkk_remars' });
                    if (tmpRemarks == null) {
                        tmpRemarks = '';
                    }
                    objTmpResult.Remarks = tmpRemarks;
                }
                /** オーガニックフラグ */
                objTmpResult.OrganicFlag = (objFirstLineItemInfo.itemOrganicFlg ? '1' : '0');
                /** カタログコード */
                objTmpResult.ProductCode = objFirstLineItemInfo.itemProductCode;

                if (updateTransactionIds.indexOf(tmpResultId.toString()) < 0) {
                    updateTransactionIds.push(tmpResultId.toString());
                }

                if (updateTransactionIds.indexOf(tmpResultId.toString()) < 0) {
                    updateTransactionIds.push(tmpResultId.toString());
                }
            });
            resultDatas.push(objTmpResult);
        });

		updateTransactionIds.map(function (id) {
			arrUpdateInfo.push({
				type: record.Type.INVENTORY_ADJUSTMENT,
				id: id
			});
		});
		/** 在庫調整END */

        log.debug({
           title: 'forwardingRequest - updateTransactionIds',
           details: JSON.stringify(updateTransactionIds)
        });
        log.debug({
           title: 'forwardingRequest - arrUpdateInfo',
           details: JSON.stringify(arrUpdateInfo)
        });
		if (arrUpdateInfo.length > 0) {
			var params = {
				custscript_djkk_mr_ws_param: arrUpdateInfo,
				custscript_djkk_mr_ws_param_processname: 'IF_E_0050_S_NS_TO_HFT'
			};
            var updateTask = task.create({
				taskType: task.TaskType.MAP_REDUCE,
				scriptId: 'customscript_djkk_mr_wms',
				deploymentId: 'customdeploy_djkk_mr_wms_forward_update',
				params: params
			});
			updateTask.submit();
		}

		return resultDatas;
	}


	/**
	 * 入荷指示情報取得
	 * 
	 * @returns {Array} 入荷指示データJSON配列
	 */
	function getInStockData() {
		// 入荷指示データ
		var arrAllData = [];
		// 入荷指示済み更新情報
		var updateInfo = {};
		var allPoId = [];
		var allItemId = [];
		var allEntityId = [];

		var systemDate = getJapanDateTime();
		var strSystemDate = systemDate.getFullYear() + ('00' + (systemDate.getMonth() + 1)).slice(-2) + ('00' + systemDate.getDate()).slice(-2);

		var allLocationIds = getDataLocationIds();
		var objLocationWmsCodeById = getLocationWithWmsCode();
		var allSubsidiaryId = getSubsidiaryIds(false);

		var i = 0;

		var inboundFilters = [];
		inboundFilters.push(search.createFilter({
			name: 'custrecord_djkk_subsidiary_header',
			operator: search.Operator.ANYOF,
			values: allSubsidiaryId
		}));
		// 到着貨物明細.入荷予定取込済み = F
		inboundFilters.push(search.createFilter({
			name: 'custrecord_djkk_arrival_complete',
			join: 'inboundshipmentitem',
			operator: search.Operator.IS,
			values: false
		}));
		// 到着貨物.ステータス = 輸送中
		inboundFilters.push(search.createFilter({
			name: 'status',
			operator: search.Operator.IS,
			values: 'inTransit'
		}));


		var inboundColumns = [];
		// 到着貨物明細.発注書
		inboundColumns.push(search.createColumn({ name: 'purchaseorder' }));
		inboundColumns.push(search.createColumn({ name: 'transactionnumber', join: 'purchaseorder' }));
		// 到着貨物.船荷証券番号
		inboundColumns.push(search.createColumn({ name: 'billoflading' }));
		// 到着貨物.作成日
		inboundColumns.push(search.createColumn({ name: 'createddate' }));
		// 到着貨物.コンテナ番号
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_container_no' }));
		// 到着貨物.シール番号
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_seal_number' }));
		// 到着貨物.メモ
		inboundColumns.push(search.createColumn({ name: 'memo' }));
		// 到着貨物明細.予想数量
		inboundColumns.push(search.createColumn({ name: 'quantityexpected' }));
		// 到着貨物明細.アイテム
		inboundColumns.push(search.createColumn({ name: 'item' }));
		// 到着貨物明細.DJ_到着貨物備考
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_desc', join: 'inboundShipmentItem' }));
		// 到着貨物明細.明細行番号
		inboundColumns.push(search.createColumn({ name: 'inboundshipmentitemid' }));
		// 到着貨物.DJ_輸送手段
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_transportation_means' }));
		// 到着貨物.船舶番号
		inboundColumns.push(search.createColumn({ name: 'vesselnumber' }));
		// 到着貨物.DJ_納品予定日
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_delivery_date' }));
		// 到着貨物.メモ
		inboundColumns.push(search.createColumn({ name: 'memo' }));
		// 到着貨物明細.PO.仕入先
		inboundColumns.push(search.createColumn({ name: 'entity', join: 'purchaseorder' }));

		// 到着貨物.DJ_輸送手段
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_transportation_means' }));
		// 到着貨物.DJ_温度
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_temperature' }));
		// 到着貨物明細.PO.仕入先
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_container_size' }));
		// 到着貨物明細.受領場所
		inboundColumns.push(search.createColumn({ name: 'receivinglocation' }));
		// 到着貨物明細.受領場所.DJ_WMS倉庫コード
		// inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_wms_location_code', join: 'receivinglocation' }));
		// DJ_到着日
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_arrival_date' }));
		// DJ_基本単位数量
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_spend', join: 'inboundShipmentItem' }));
		// DJ_出港日
		inboundColumns.push(search.createColumn({name: 'custrecord_djkk_departure_date'}));
		// DJ_到着日
		inboundColumns.push(search.createColumn({name: 'custrecord_djkk_arrival_date'}));
		var inboundResults = searchResult(search.Type.INBOUND_SHIPMENT, inboundFilters, inboundColumns);
		for (i = 0; i < inboundResults.length; i++) {
			var currentResult = inboundResults[i];

			var currentInboundId = currentResult.id;


			// 到着貨物明細.受領場所
			var tmpReceivingLocation = currentResult.getValue({ name: 'receivinglocation' });
			if (tmpReceivingLocation == null || tmpReceivingLocation == '') {
				continue;
			}

			if (allLocationIds.indexOf(tmpReceivingLocation.toString()) < 0) {
				continue;
			}

			var currentInboundLineId = currentResult.getValue({ name: 'inboundshipmentitemid' });
			// 発注書(PO).ID
			var currentResultPoId = currentResult.getValue({ name: 'purchaseorder' });
			if (allPoId.indexOf(currentResultPoId) < 0) {
				allPoId.push(currentResultPoId);
			}

			if (updateInfo.hasOwnProperty(currentInboundId.toString())) {
				updateInfo[(currentInboundId)].push({
					poId: currentResultPoId,
					type: record.Type.INBOUND_SHIPMENT,
					lineId: currentInboundLineId
				});
			} else {
				var tmp = [];
				tmp.push({
					poId: currentResultPoId,
					type: record.Type.INBOUND_SHIPMENT,
					lineId: currentInboundLineId
				});
				updateInfo[(currentInboundId.toString())] = tmp;
			}

			// 到着貨物明細.アイテム.ID を集計する
			var currentResultItemId = currentResult.getValue({ name: 'item' });
			if (allItemId.indexOf(currentResultItemId) < 0) {
				allItemId.push(currentResultItemId);
			}

			// 到着貨物明細.PO.仕入先 を集計する
			var currentResultEntityId = currentResult.getValue({ name: 'entity', join: 'purchaseorder' });
			if (allEntityId.indexOf(currentResultEntityId) < 0) {
				allEntityId.push(currentResultEntityId);
			}

			var tmpMemo = currentResult.getValue({ name: 'memo' });
			tmpMemo = tmpMemo.split('\n').join(' ');
			tmpMemo = tmpMemo.split('	').join(' ');

			
			log.debug({
				title: 'id',
				details: currentInboundId
			});

			var tmpObjInboundShipment = {
				// 入荷指示日
				'SysDate': strSystemDate,
				// 入庫依頼日
				'TransactionDate': formatDate(currentResult.getValue({ name: 'createddate' })),
				// 発注書ID
				'PoId': currentResult.getValue({ name: 'purchaseorder' }),
				// 発注番号
				'PONumber': currentResult.getValue({ name: 'transactionnumber', join: 'purchaseorder' }),
				// 船荷証券番号
				'BLNumber': currentResult.getValue({ name: 'billoflading' }),
				// コンテナ番号
				'ContainerNumber': currentResult.getValue({ name: 'custrecord_djkk_container_no' }),
				// シール番号
				'SealNumber': currentResult.getValue({ name: 'custrecord_djkk_seal_number' }),
				// 倉庫コード
				'WarehouseNumber': objLocationWmsCodeById[(currentResult.getValue({ name: 'receivinglocation' }).toString())],
				// アイテムID
				'ItemId': currentResult.getValue({ name: 'item' }),
				// 在庫コード
				'StockCode': '',
				// バッチNo
				'BatchNumber': '',
				// 入数
				'Qty_UnitOutDelivery': '',
				// 検品レベル
				'InspectionLevel': '',
				// 受領予定日
				'DevanDate': formatDate(currentResult.getValue({name: 'custrecord_djkk_arrival_date'})),
				// 検品指示
				'RemarksHeader': tmpMemo,
				// 品名行1
				'DescriptionLine1': '',
				// 品名行2
				'DescriptionLine2': '',
				// 総入庫個数
				'PcsQty': currentResult.getValue({ name: 'quantityexpected' }),
				// 賞味期限
				'DateBestBefore': '',
				// 備考
				'RemarksItem': currentResult.getValue({ name: 'custrecord_djkk_desc', join: 'inboundShipmentItem' }),
				// JANコード
				'LabelJANCode': '',
				//	                // 輸送方法
				//	                'DeliveryMethod': currentResult.getText({name: 'custrecord_djkk_transportation_means'}),
				// 船名
				'VesselName': currentResult.getValue({ name: 'vesselnumber' }),
				// 出港予定日
				'ExpectedLeavingPortDate': formatDate(currentResult.getValue({name: 'custrecord_djkk_departure_date'})),
				// 入港予定日
				'ExpectedEnteringPortDate': formatDate(currentResult.getValue({name: 'custrecord_djkk_arrival_date'})),
				// 入荷予定日
				'ExpectedArrivalDate': formatDate(currentResult.getValue({ name: 'custrecord_djkk_delivery_date' })),
				// 倉庫向けメモ
				'WmsMemo': tmpMemo,
				// ITFコード
				'ITFCode': '',
				// PO行番号
				'POLineNum': '',
				// 仕入先コード
				'SupplierCode': '',
				// 仕入先名称
				'SupplierName': '',
				// PO.仕入先ID
				'PoEntityId': currentResult.getValue({ name: 'entity', join: 'purchaseorder' }),
				// 輸送手段
				'TransportationMeans': currentResult.getText({ name: 'custrecord_djkk_transportation_means' }),
				// 温度
				'Temperature': currentResult.getText({ name: 'custrecord_djkk_temperature' }),
				// コンテナサイズ
				'ContainerSize': currentResult.getText({ name: 'custrecord_djkk_container_size' }),
				// オーガニックフラグ
				'OrganicFlag': '0',
				// カタログコード
				'ProductCode': ''
			};
			arrAllData.push(tmpObjInboundShipment);
		}

		// エンティティ情報取得
		var allEntityInfo = {};
		if (allEntityId.length > 0) {
			var entityFilters = [];
			var entityColumns = [];
			entityColumns.push(search.createColumn({ name: 'entityid' }));
			entityColumns.push(search.createColumn({ name: 'altname' }));
			var entityResults = searchResult(search.Type.ENTITY, entityFilters, entityColumns);
			for (var i = 0; i < entityResults.length; i++) {
				var tmpEntityResult = entityResults[i];
				allEntityInfo[(tmpEntityResult.id.toString())] = {
					entityId: tmpEntityResult.getValue({ name: 'entityid' }),
					companyName: tmpEntityResult.getValue({ name: 'altname' })
				};
			}
		}

		// アイテム情報を取得
		var allItemInfo = {};
		if (allItemId.length > 0) {
			var itemFilters = [];
			itemFilters.push({
				name: 'internalid',
				operator: search.Operator.ANYOF,
				values: allItemId
			});
			var itemColumns = [];
			// 商品コード
			itemColumns.push(search.createColumn({ name: 'itemid' }));
			// DJ_入数
			itemColumns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity' }));
			// DJ_検品レベル
			itemColumns.push(search.createColumn({ name: 'custitem_djkk_inspection_level' }));
			// UPCコード
			itemColumns.push(search.createColumn({ name: 'upccode' }));
			// DJ_品名（日本語）LINE1
			itemColumns.push(search.createColumn({ name: 'custitem_djkk_product_name_jpline1' }));
			// DJ_品名（日本語）LINE2
			itemColumns.push(search.createColumn({ name: 'custitem_djkk_product_name_jpline2' }));
			// DJ_ITFCODE
			itemColumns.push(search.createColumn({ name: 'custitem_djkk_itf_code' }));
			itemColumns.push(search.createColumn({ name: 'custitem_djkk_organicflg' }));
			itemColumns.push(search.createColumn({ name: 'custitem_djkk_product_code' }));
			var itemResults = searchResult(search.Type.ITEM, itemFilters, itemColumns);
			for (i = 0; i < itemResults.length; i++) {
				allItemInfo[(itemResults[i].id.toString())] = {
					itemid: itemResults[i].getValue({ name: 'itemid' }),
					custitem_djkk_perunitquantity: itemResults[i].getValue({ name: 'custitem_djkk_perunitquantity' }),
					custitem_djkk_inspection_level: itemResults[i].getText({ name: 'custitem_djkk_inspection_level' }),
					upccode: itemResults[i].getValue({ name: 'upccode' }),
					custitem_djkk_product_name_jpline1: itemResults[i].getValue({ name: 'custitem_djkk_product_name_jpline1' }),
					custitem_djkk_product_name_jpline2: itemResults[i].getValue({ name: 'custitem_djkk_product_name_jpline2' }),
					custitem_djkk_itf_code: itemResults[i].getValue({ name: 'custitem_djkk_itf_code' }),
					custitem_djkk_organicflg: itemResults[i].getValue({ name: 'custitem_djkk_organicflg' }),
					custitem_djkk_product_code: itemResults[i].getValue({ name: 'custitem_djkk_product_code' })
				};
			}
		}

		var allPoInfo = [];
		var allInventoryDetailId = [];
		if (allPoId.length > 0) {

			var poFilters = [];
			// 内部ID
			poFilters.push(search.createFilter({
				name: 'internalid',
				operator: search.Operator.ANYOF,
				values: allPoId
			}));

			var poColumns = [];
			// 発注書.場所.DJ_WMS倉庫コード
			poColumns.push(search.createColumn({ name: 'custrecord_djkk_wms_location_code', join: 'location' }));
			// 発注書明細.アイテム
			poColumns.push(search.createColumn({ name: 'item' }));
			// 発注書明細.受領予定日
			poColumns.push(search.createColumn({ name: 'expectedreceiptdate' }));
			// 発注書明細.在庫詳細.ID
			poColumns.push(search.createColumn({ name: 'internalid', join: 'inventorydetail' }));
			// 発注書明細.行番号
			poColumns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
			// 発注書.仕入先.仕入先コード
			poColumns.push(search.createColumn({ name: 'entityid', join: 'vendor' }));
			// 発注書.仕入先.仕入先名
			poColumns.push(search.createColumn({ name: 'companyname', join: 'vendor' }));
			var poResults = searchResult(search.Type.PURCHASE_ORDER, poFilters, poColumns);
			for (i = 0; i < poResults.length; i++) {
				var currentPoResult = poResults[i];
				var currentPoId = currentPoResult.id;
				var currentInventoryId = currentPoResult.getValue({ name: 'internalid', join: 'inventorydetail' });

				allInventoryDetailId.push(currentInventoryId);

				allPoInfo.push({
					id: currentPoId,
					item: currentPoResult.getValue({ name: 'item' }),
					expectedReceiptDate: currentPoResult.getValue({ name: 'expectedreceiptdate' }),
					locationCode: currentPoResult.getValue({ name: 'custrecord_djkk_wms_location_code', join: 'location' }),
					lineNum: currentPoResult.getValue({ name: 'custcol_djkk_exsystem_line_num' }),
					inventoryDetailId: currentPoResult.getValue({ name: 'internalid', join: 'inventorydetail' }),
					inventoryDetailControlNumber: '',
					inventoryDetailIssueNumber: '',
					inventoryDetailExpirationDate: '',
					entityId: currentPoResult.getValue({ name: 'entityid', join: 'vendor' }),
					entityName: currentPoResult.getValue({ name: 'companyname', join: 'vendor' }),
				});
			}
		}

		var allInventoryDetailInfo = [];

		if (allInventoryDetailId.length > 0) {
			var inventoryDetailFilters = [];
			inventoryDetailFilters.push(search.createFilter({
				name: 'internalid',
				operator: search.Operator.ANYOF,
				values: allInventoryDetailId
			}));
			var inventoryDetailColumns = [];
			// 在庫詳細明細.管理番号
			inventoryDetailColumns.push(search.createColumn({ name: 'custrecord_djkk_control_number', join: 'inventoryDetailLines' }));
			// 在庫詳細明細.シリアル/ロット
			inventoryDetailColumns.push(search.createColumn({ name: 'inventorynumber' }));
			// 在庫詳細明細.有効期限
			inventoryDetailColumns.push(search.createColumn({ name: 'expirationdate' }));
			inventoryDetailColumns.push(search.createColumn({name: 'custrecord_djkk_maker_serial_code', join: 'inventoryDetailLines'}));
			var inventoryDetailResults = searchResult(search.Type.INVENTORY_DETAIL, inventoryDetailFilters, inventoryDetailColumns);
			for (i = 0; i < inventoryDetailResults.length; i++) {
				allInventoryDetailInfo.push({
					inventoryDetailId: inventoryDetailResults[i].id,
					inventoryDetailControlNumber: inventoryDetailResults[i].getValue({ name: 'custrecord_djkk_control_number', join: 'inventoryDetailLines' }),
					inventoryDetailIssueNumber: inventoryDetailResults[i].getText({ name: 'inventorynumber' }),
					inventoryDetailMakerSerialCode: (inventoryDetailResults[i].getValue({ name: 'custrecord_djkk_maker_serial_code' , join: 'inventoryDetailLines'}) ? inventoryDetailResults[i].getValue({ name: 'custrecord_djkk_maker_serial_code' , join: 'inventoryDetailLines'}) : ''),
					inventoryDetailExpirationDate: inventoryDetailResults[i].getValue({ name: 'expirationdate' })
				});
			}
		}

		// 発注書情報に在庫詳細情報を書き込む
		var allPoWithInventoryDetailInfo = [];
		for (i = 0; i < allPoInfo.length; i++) {
			var currentInventoryInfos = allInventoryDetailInfo.filter(function (x) {
				if (x.inventoryDetailId == allPoInfo[i].inventoryDetailId) {
					return true;
				} else {
					return false;
				}
			});

			if (currentInventoryInfos != null && currentInventoryInfos != '') {
				for (var j = 0; j < currentInventoryInfos.length; j++) {
					var tmpPoInfo = {};
					for (var key in allPoInfo[i]) {
						tmpPoInfo[key] = allPoInfo[i][key];
					}

					tmpPoInfo.inventoryDetailControlNumber = currentInventoryInfos[j].inventoryDetailControlNumber;
					tmpPoInfo.inventoryDetailIssueNumber = currentInventoryInfos[j].inventoryDetailIssueNumber;
					tmpPoInfo.inventoryDetailMakerSerialCode = currentInventoryInfos[j].inventoryDetailMakerSerialCode;
					tmpPoInfo.inventoryDetailExpirationDate = currentInventoryInfos[j].inventoryDetailExpirationDate;
					allPoWithInventoryDetailInfo.push(tmpPoInfo);
				}
			} else {
				allPoWithInventoryDetailInfo.push(allPoInfo[i]);
			}
		}

		var arrAllDataLength = arrAllData.length;

		var arrResultData = [];

		for (i = 0; i < arrAllDataLength; i++) {
			var tmpItemId = arrAllData[i]['ItemId'];
			var tmpPoId = arrAllData[i]['PoId'];
			var tmpEntityId = arrAllData[i]['PoEntityId'];

			var tmpPoInventoryInfos = allPoWithInventoryDetailInfo.filter(function (x) {
				if (x.id == tmpPoId && x.item == tmpItemId) {
					return true;
				} else {
					return false;
				}
			});

			var tmpPoInfo = allPoInfo.filter(function (x) {
				if (x.id == tmpPoId && x.item == tmpItemId) {
					return true;
				} else {
					return false;
				}
			});

			if (tmpPoInfo != null && tmpPoInfo != '' && tmpPoInfo.length > 0) {
				arrAllData[i]['POLineNum'] = tmpPoInfo[0]['lineNum'];
				arrAllData[i]['SupplierCode'] = tmpPoInfo[0]['entityId'];
				arrAllData[i]['SupplierName'] = tmpPoInfo[0]['entityName'];
			}

			if (tmpPoInventoryInfos != null && tmpPoInventoryInfos != '' && tmpPoInventoryInfos.length > 0) {
				for (var j = 0; j < tmpPoInventoryInfos.length; j++) {
					var tmpData = {};
					for (var key in arrAllData[i]) {
						tmpData[key] = arrAllData[i][key];
					}

					// 倉庫コード
					//				tmpData['WarehouseNumber'] = tmpPoInventoryInfos[0].locationCode;
					// バッチNo
					tmpData['BatchNumber'] = tmpPoInventoryInfos[0].inventoryDetailIssueNumber;
					// 受領予定日
					if (tmpPoInfo != null && tmpPoInfo != '') {
						// tmpData['DevanDate'] = formatDate(tmpPoInfo[0].expectedReceiptDate);
					}
					// 賞味期限
					tmpData['DateBestBefore'] = formatDate(tmpPoInventoryInfos[0].inventoryDetailExpirationDate);
					// 備考
					//tmpData['RemarksItem'] = tmpPoInventoryInfos[0].inventoryDetailIssueNumber + tmpData['RemarksItem'];

					// 倉庫コード
					//							tmpData['WarehouseNumber'] = tmpPoInventoryInfos[j].locationCode;
					// バッチNo
					tmpData['BatchNumber'] = tmpPoInventoryInfos[j].inventoryDetailIssueNumber;
					// 受領予定日
					if (tmpPoInfo != null && tmpPoInfo != '') {
						// tmpData['DevanDate'] = formatDate(tmpPoInfo[0].expectedReceiptDate);
					}
					// 賞味期限
					tmpData['DateBestBefore'] = formatDate(tmpPoInventoryInfos[j].inventoryDetailExpirationDate);
					// 備考
					tmpData['RemarksItem'] = (tmpPoInventoryInfos[j].inventoryDetailMakerSerialCode + '                    ').slice(0, 20) + tmpData['RemarksItem'];

					arrResultData.push(tmpData);
				}
			}
		}

		for (var i = 0; i < arrResultData.length; i++) {
			var tmpItemId = arrResultData[i]['ItemId'];
			var tmpEntityId = arrResultData[i]['PoEntityId'];
			if (allItemInfo.hasOwnProperty(tmpItemId.toString())) {
				var tmpItemInfo = allItemInfo[(tmpItemId.toString())];

				var tmpInspectionLevel = tmpItemInfo['custitem_djkk_inspection_level'];
				if (tmpInspectionLevel != null && tmpInspectionLevel != '' && tmpInspectionLevel.length > 0) {
					tmpInspectionLevel = tmpInspectionLevel.slice(0, 1);
				}
				// 在庫コード
				arrResultData[i]['StockCode'] = tmpItemInfo['itemid'];
				// 入数
				arrResultData[i]['Qty_UnitOutDelivery'] = tmpItemInfo['custitem_djkk_perunitquantity'];
				// 検品レベル
				arrResultData[i]['InspectionLevel'] = tmpInspectionLevel;
				// 品名行1
				arrResultData[i]['DescriptionLine1'] = tmpItemInfo['custitem_djkk_product_name_jpline1'];
				// 品名行2
				arrResultData[i]['DescriptionLine2'] = tmpItemInfo['custitem_djkk_product_name_jpline2'];
				// JANコード
				arrResultData[i]['LabelJANCode'] = tmpItemInfo['upccode'];
				// ITFコード
				arrResultData[i]['ITFCode'] = tmpItemInfo['custitem_djkk_itf_code'];
				arrResultData[i]['OrganicFlag'] = (tmpItemInfo['custitem_djkk_organicflg'] ? '1' : '0');
				// カタログコード
				arrResultData[i]['ProductCode'] = tmpItemInfo['custitem_djkk_product_code'];
			}
			if (allEntityInfo.hasOwnProperty(tmpEntityId.toString())) {
				var tmpEntityInfo = allEntityInfo[(tmpEntityId.toString())];
				arrResultData[i]['SupplierCode'] = tmpEntityInfo['entityId'];
				arrResultData[i]['SupplierName'] = tmpEntityInfo['companyName'];
			}
		}

		/**
		 * 結果データソート
		 */
		arrResultData.sort(function (a, b) {
			if (Number(a['PoId']) < Number(b['PoId'])) {
				return -1
			} else if (Number(a['PoId']) > Number(b['PoId'])) {
				return 1;
			} else {
				return 0;
			}
		});

		// 戻り値項目整理(ロジックで使用した項目を削除)
		arrResultData.forEach(function (x) {
			delete x['PoId'];
			delete x['ItemId'];
			delete x['PoEntityId'];
		});


		/** 在庫調整データ START */

		var arrAllInventoryAdjustmentResults = [];

		var arrInventoryAdjustmentFilters = [];
		/** 連携子会社 */
		arrInventoryAdjustmentFilters.push(search.createFilter({
			name: 'subsidiary',
			operator: search.Operator.ANYOF,
			values: allSubsidiaryId
		}));
		/** DJ_WMS送信済み */
		arrInventoryAdjustmentFilters.push(search.createFilter({
			name: 'custbody_djkk_exsystem_wms_sended',
			operator: search.Operator.IS,
			values: false
		}));
		arrInventoryAdjustmentFilters.push(search.createFilter({
			name: 'quantity',
			operator: search.Operator.ISNOT,
			values: 0
		}));
		arrInventoryAdjustmentFilters.push(search.createFilter({
			name: 'mainline',
			operator: search.Operator.IS,
			values: false
		}));
		arrInventoryAdjustmentFilters.push(search.createFilter({
			name: 'taxline',
			operator: search.Operator.IS,
			values: false
		}));
		arrInventoryAdjustmentFilters.push(search.createFilter({
			name: 'name',
			join: 'custbody_djkk_change_reason',
			operator: search.Operator.IS,
			values: '在庫品データ修正（倉庫連携）'
		}));

		var arrInventoryAdjustmentColumns = [];
		/** 作成日時 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'datecreated'}));
		/** トランザクション番号 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'transactionnumber'}));
		/** メモ */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'memo'}));
		/** DJ_外部システム_行番号 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custcol_djkk_exsystem_line_num'}));
		/** 場所 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'location'}));
		/** アイテム.オーガニックフラグ */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_organicflg', join: 'item'}));
		/** アイテム.DJ_カタログ製品コード */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_product_code', join: 'item'}));
		/** アイテム.DJ_ITFCODE */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_itf_code', join: 'item'}));
		/** アイテム.UPCコード */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'upccode', join: 'item'}));
		/** アイテム.DJ_品名（日本語）LINE1 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_product_name_jpline1', join: 'item'}));
		/** アイテム.DJ_品名（日本語）LINE2 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_product_name_jpline2', join: 'item'}));
		/** アイテム.DJ_検品レベル */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_inspection_level', join: 'item'}));
		/** アイテム.DJ_入数 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_perunitquantity', join: 'item'}));
		/** アイテム.商品コード */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'itemid', join: 'item'}));
		/** 調整数量 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'quantity'}));
		/** 場所.DJ_WMS_倉庫コード */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custrecord_djkk_wms_location_code', join: 'location'}));
		/** 在庫詳細.内部ID */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'internalid', join: 'inventorydetail'}));
		/** 明細行番号 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'line'}));
		/** DJ_完了期日 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custbody_djkk_completion_date'}));

		var arrInventoryAdjustmentResults = searchResult(search.Type.INVENTORY_ADJUSTMENT, arrInventoryAdjustmentFilters, arrInventoryAdjustmentColumns);

		var objIaResultInfo = {};
		/**
		 * 在庫調整.在庫詳細.内部ID
		 * @type {Array}
		 */
		var arrInventoryAdjustmentInventoryDetailIds = [];

		arrInventoryAdjustmentResults.map(function(iaResult){
			var tmpId = iaResult.id;
			var tmpLocation = iaResult.getValue({name: 'location'});
			var tmpLineNum = iaResult.getValue({name: 'custcol_djkk_exsystem_line_num'});

			var tmp = [];
			if (objIaResultInfo.hasOwnProperty(tmpId.toString())) {
				tmp = objIaResultInfo[tmpId.toString()];
			} 
			tmp.push({
				line: tmpLineNum,
				location: tmpLocation,
				// アイテム.商品コード
				itemCode: iaResult.getValue({name: 'itemid', join: 'item'}),
				// アイテム.DJ_入数
				itemPerUnitQuantity: iaResult.getValue({name: 'custitem_djkk_perunitquantity', join: 'item'}),
				// 検品レベル
				inspectionLevel: iaResult.getValue({name: 'custitem_djkk_inspection_level', join: 'item'}),
				// DJ_品名（日本語）LINE1
				itemNameLine1: iaResult.getValue({name: 'custitem_djkk_product_name_jpline1', join: 'item'}),
				// DJ_品名（日本語）LINE2
				itemNameLine2: iaResult.getValue({name: 'custitem_djkk_product_name_jpline2', join: 'item'}),
				// アイテム.UPCコード
				itemUpcCode: iaResult.getValue({name: 'upccode', join: 'item'}),
				// アイテム.DJ_ITFCODE
				itemItfCode: iaResult.getValue({name: 'custitem_djkk_itf_code', join: 'item'}),
				// DJ_外部システム_行番号
				lineNum: iaResult.getValue({name: 'custcol_djkk_exsystem_line_num'}),
				// アイテム.オーガニックフラグ
				organicFlg: iaResult.getValue({name: 'custitem_djkk_organicflg', join: 'item'}),
				// アイテム.DJ_カタログ製品コード
				catalogCode: iaResult.getValue({name: 'custitem_djkk_product_code', join: 'item'})

			});
			objIaResultInfo[(tmpId.toString())] = tmp;

			var tmpInventoryDetailId = iaResult.getValue({name: 'internalid', join: 'inventorydetail'});
			if (arrInventoryAdjustmentInventoryDetailIds.hasOwnProperty(tmpInventoryDetailId.toString()) < 0) {
				arrInventoryAdjustmentInventoryDetailIds.push(tmpInventoryDetailId.toString())
			}
		});

		var objIaInventoryDetailInfo = {};

		var arrIaInventoryDetailFilters = [];
		arrInventoryAdjustmentInventoryDetailIds.map(function(tmpId, index) {
			arrIaInventoryDetailFilters.push(['internalid', search.Operator.IS, tmpId.toString()]);
			if (index != arrInventoryAdjustmentInventoryDetailIds.length - 1) {
				arrIaInventoryDetailFilters.push('or');
			}
		});
		
		var arrIaInventoryDetailColumns = [];
		/** 在庫詳細.シリアル/ロット番号 */
		arrIaInventoryDetailColumns.push(search.createColumn({name: 'inventorynumber'}));
		/** 在庫詳細.賞味期限 */
		arrIaInventoryDetailColumns.push(search.createColumn({name: 'expirationdate'}));
		/** 在庫詳細.DJ_メーカー製造ロット番号 */
		arrIaInventoryDetailColumns.push(search.createColumn({name: 'custrecord_djkk_maker_serial_code', join: 'inventoryDetailLines'}));

		var arrIaInventoryDetailResults = searchResult(search.Type.INVENTORY_DETAIL, arrIaInventoryDetailFilters, arrIaInventoryDetailColumns);
		arrIaInventoryDetailResults.map(function(tmpIaIdResult) {
			var tmp = [];
			if (objIaInventoryDetailInfo.hasOwnProperty(tmpIaIdResult.id.toString())) {
				tmp = objIaInventoryDetailInfo[(tmpIaIdResult.id.toString())];
			}

			tmp.push({
				serialNumber: tmpIaIdResult.getText({name: 'inventorynumber'}),
				expirationDate: formatDate(tmpIaIdResult.getValue({name: 'expirationdate'})),
				makerSerialCode: tmpIaIdResult.getValue({name: 'custrecord_djkk_maker_serial_code', join: 'inventoryDetailLines'})
			});

			objIaInventoryDetailInfo[tmpIaIdResult.id.toString()] = tmp;
		});

		arrInventoryAdjustmentResults.map(function(iaResult) {
			var tmpId = iaResult.id;

			var firstLineInfo = objIaResultInfo[tmpId.toString()].sort(function(a, b) {
				return a['line'] - b['line'];
			})[0];

			if (allLocationIds.indexOf(firstLineInfo['location'].toString()) < 0) {
				return;
			}

			if (updateInfo.hasOwnProperty(tmpId.toString())) {
				updateInfo[(tmpId)].push({
					poId: iaResult.getValue({name: 'transactionnumber'}),
					type: record.Type.INVENTORY_ADJUSTMENT,
					lineId: iaResult.getValue({name: 'line'})
				});
			} else {
				var tmp = [];
				tmp.push({
					poId: iaResult.getValue({name: 'transactionnumber'}),
					type: record.Type.INVENTORY_ADJUSTMENT,
					lineId: iaResult.getValue({name: 'line'})
				});
				updateInfo[(tmpId.toString())] = tmp;
			}

            var tmpItemInspectionLevel = iaResult.getText({name: 'custitem_djkk_inspection_level', join: 'item'});
			if (tmpItemInspectionLevel != null && tmpItemInspectionLevel != '' && tmpItemInspectionLevel.length > 0) {
				tmpItemInspectionLevel = tmpItemInspectionLevel.slice(0, 1);
			}
          
			var tmpObjInventoryAdjustment = {
				// 入荷指示日
				'SysDate': strSystemDate,
				// 入庫依頼日
				'TransactionDate': formatDate(iaResult.getValue({ name: 'datecreated' })),
				// 発注番号
				'PONumber': iaResult.getValue({name: 'transactionnumber'}),
				// 船荷証券番号
				'BLNumber': '',
				// コンテナ番号
				'ContainerNumber': '',
				// シール番号
				'SealNumber': '',
				// 倉庫コード
				'WarehouseNumber': iaResult.getValue({name: 'custrecord_djkk_wms_location_code', join: 'location'}),
				// 在庫コード
				'StockCode': iaResult.getValue({name: 'itemid', join: 'item'}),
				// 管理番号
				'BatchNumber': '',
				// 入数
				'Qty_UnitOutDelivery': iaResult.getValue({name: 'custitem_djkk_perunitquantity', join: 'item'}),
				// 検品レベル
				'InspectionLevel': tmpItemInspectionLevel,
				// 受領予定日
				'DevanDate': formatDate(iaResult.getValue({name: 'custbody_djkk_completion_date'})),
				// 検品指示
				'RemarksHeader': iaResult.getValue({name: 'memo'}),
				// 品名行1
				'DescriptionLine1': iaResult.getValue({name: 'custitem_djkk_product_name_jpline1', join: 'item'}),
				// 品名行2
				'DescriptionLine2': iaResult.getValue({name: 'custitem_djkk_product_name_jpline2', join: 'item'}),
				// 総入庫個数
				'PcsQty': iaResult.getValue({name: 'quantity'}),
				// 賞味期限
				'DateBestBefore': '',
				// 備考
				'RemarksItem': '',
				// JANコード
				'LabelJANCode': iaResult.getValue({name: 'upccode', join: 'item'}),
				// 船名
				'VesselName': '',
				// 出港予定日
				'ExpectedLeavingPortDate': '',
				// 入港予定日
				'ExpectedEnteringPortDate': '',
				// 入荷予定日
				'ExpectedArrivalDate': strSystemDate,
				// 倉庫向けメモ
				'WmsMemo': iaResult.getValue({name: 'memo'}),
				// ITFコード
				'ITFCode': iaResult.getValue({name: 'custitem_djkk_itf_code', join: 'item'}),
				// PO行番号
				'POLineNum': iaResult.getValue({name: 'custcol_djkk_exsystem_line_num'}),
				// 仕入先コード
				'SupplierCode': '',
				// 仕入先名称
				'SupplierName': '',
				// 輸送手段
				'TransportationMeans': '',
				// 温度
				'Temperature': '',
				// コンテナサイズ
				'ContainerSize': '',
				// オーガニックフラグ
				'OrganicFlag': (iaResult.getValue({name: 'custitem_djkk_organicflg', join: 'item'}) ? '1' : '0'),
				// カタログコード
				'ProductCode': iaResult.getValue({name: 'custitem_djkk_product_code', join: 'item'})
			};

			/**
			 * 在庫詳細.内部ID
			 */
			var tmpIaInventoryDetailId = iaResult.getValue({name: 'internalid', join: 'inventorydetail'});
			if (tmpIaInventoryDetailId != null && tmpIaInventoryDetailId != '' && objIaInventoryDetailInfo.hasOwnProperty(tmpIaInventoryDetailId.toString())) {
				var tmpCurrentInventoryDetail = objIaInventoryDetailInfo[(tmpIaInventoryDetailId.toString())];

				tmpCurrentInventoryDetail.map(function(tmpInventoryDetailInfo) {
					/** 管理番号 */
					tmpObjInventoryAdjustment['BatchNumber'] = tmpInventoryDetailInfo['serialNumber'];
					/** 賞味期限 */
					tmpObjInventoryAdjustment['DateBestBefore'] = tmpInventoryDetailInfo['expirationDate'];
					/** 備考 */
					tmpObjInventoryAdjustment['RemarksItem'] = (tmpInventoryDetailInfo['makerSerialCode'] + '                    ').slice(0, 20) + iaResult.getValue({name: 'memo'});
					
					arrAllInventoryAdjustmentResults.push(tmpObjInventoryAdjustment);
				});
			} else {
				tmpObjInventoryAdjustment['RemarksItem'] = (Number(iaResult.getValue({name: 'quantity'})) > 0 ? '                    ' : '');
				arrAllInventoryAdjustmentResults.push(tmpObjInventoryAdjustment);
			}
		});

		arrResultData = arrResultData.concat(arrAllInventoryAdjustmentResults);

		var params = {
			custscript_djkk_mr_ws_param: updateInfo,
			custscript_djkk_mr_ws_param_processname: 'execute_inbound_update'
		};
		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms_arrival',
			params: params
		});
		updateTask.submit();

		return arrResultData;
	}

	/**
	 * 入荷実績取込実行
	 * @param {Array} arrayDatas 
	 */
	function executeArrivalRecord(arrayDatas) {
		var params = {
			custscript_djkk_mr_ws_param: arrayDatas,
			custscript_djkk_mr_ws_param_processname: 'IF_E_0020_R_NS_FRM_HFT'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms_arrival_api',
			params: params
		});
		updateTask.submit();
	}

	/**
	 * 在庫移動実績
	 * @param {Array} arrayDatas 
	 */
	function executeInventoryTransferResults(arrayDatas) {
		var params = {
			custscript_djkk_mr_ws_param: arrayDatas,
			custscript_djkk_mr_ws_param_processname: 'INVENTORY_TRANSFER_RESULTS'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms_inventory_api',
			params: params
		});
		updateTask.submit();
	}

	function executeInsertSalesOrder(arrayDatas) {
		var params = {
			custscript_djkk_mr_ws_param: arrayDatas,
			custscript_djkk_mr_ws_param_processname: 'INSERT_SALESORDER'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms',
			params: params
		});
		updateTask.submit();
	}

	/**
	 * セット品転送依頼
	 */
	function getSetProductOrder() {
		var resultDatas = [];

		var strSystemDate = getJapanDateTime();

		strSystemDate = strSystemDate.getFullYear()
			+ ("00" + (strSystemDate.getMonth() + 1)).slice(-2)
			+ ("00" + strSystemDate.getDate()).slice(-2);

		var subsidiaryIds = getSubsidiaryIds(false);

		var assemblyItemIdByInternalId = {};
		var itemFilters = [];
		var itemColumns = [];
		itemColumns.push(search.createColumn({ name: 'itemid' }));
		var itemResults = searchResult(search.Type.ASSEMBLY_ITEM, itemFilters, itemColumns);
		for (var i = 0; i < itemResults.length; i++) {
			var tmpId = itemResults[i].id;
			var tmpItemId = itemResults[i].getValue({ name: 'itemid' });

			assemblyItemIdByInternalId[(tmpId.toString())] = tmpItemId.toString();
		}

		// DJ_移管区分 を取得
		var transferSections = {};
		var transferSectionFilters = [];
		var transferSectionColumns = [];
		transferSectionColumns.push(search.createColumn({ name: 'custrecord_djkk_transfer_section_code' }));
		var transferSectionResults = searchResult('customrecord_djkk_transfer_section', transferSectionFilters, transferSectionColumns);
		for (var i = 0; i < transferSectionResults.length; i++) {
			transferSections[(transferSectionResults[i].id.toString())] = transferSectionResults[i].getValue({ name: 'custrecord_djkk_transfer_section_code' });
		}

		var assemblyTypeInfo = {};
		var assemblyTypeFilters = [];
		var assemblyTypeColumns = [];
		assemblyTypeColumns.push(search.createColumn({ name: 'custrecord_djkk_assembly_type_code' }));
		var assemblyTypeResults = searchResult('customrecord_djkk_assembly_type', assemblyTypeFilters, assemblyTypeColumns);
		for (var i = 0; i < assemblyTypeResults.length; i++) {
			var tmpCode = assemblyTypeResults[i].getValue({ name: 'custrecord_djkk_assembly_type_code' });
			var tmpId = assemblyTypeResults[i].id;

			assemblyTypeInfo[(tmpId.toString())] = tmpCode;
		}

		var arrDataLocationIds = getDataLocationIds();

        var objProductGroupInfo = {};
        var arrProductGroupFilters = [];
        var arrProductGroupColumns = [];
        // DJ_梱包材フラグ
        arrProductGroupColumns.push(search.createColumn({name: 'custrecord_djkk_packing_material_flag'}));
        var arrProductGroupResults = searchResult('customrecord_djkk_product_group', arrProductGroupFilters, arrProductGroupColumns);
        for (var i = 0; i < arrProductGroupResults.length; i++) {
            var tmpProductGroupId = arrProductGroupResults[i].id;
            objProductGroupInfo[tmpProductGroupId.toString()] = {
                packingMaterialFlg: arrProductGroupResults[i].getValue({name: 'custrecord_djkk_packing_material_flag'})
            };
        }

		var objUpdateInfo = [];

		var filters = [];
		filters.push(search.createFilter({
			name: 'mainline',
			operator: search.Operator.IS,
			values: false
		}));
		filters.push(search.createFilter({
			name: 'taxline',
			operator: search.Operator.IS,
			values: false
		}));
		filters.push(search.createFilter({
			name: 'custcol_djkk_wms_flg',
			operator: search.Operator.IS,
			values: false
		}));
		filters.push(search.createFilter({
			name: 'subsidiary',
			operator: search.Operator.ANYOF,
			values: subsidiaryIds
		}));
		var columns = [];

		columns.push(search.createColumn({ name: 'custitem_djkk_item_transfer_section', join: 'item' }));
		columns.push(search.createColumn({ name: 'custitem_djkk_organicflg', join: 'item' }));
		columns.push(search.createColumn({ name: 'trandate' }));
		columns.push(search.createColumn({ name: 'enddate' }));
		columns.push(search.createColumn({ name: 'tranid' }));
		columns.push(search.createColumn({ name: 'transactionnumber' }));
		columns.push(search.createColumn({ name: 'location' }));
		columns.push(search.createColumn({ name: 'custrecord_djkk_wms_location_code', join: 'location' }));
		columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
		columns.push(search.createColumn({ name: 'inventorynumber', join: 'inventorydetail' }));
		columns.push(search.createColumn({ name: 'expirationdate', join: 'inventorydetail' }));
		columns.push(search.createColumn({ name: 'quantity' }));
		columns.push(search.createColumn({ name: 'memo' }));
		columns.push(search.createColumn({ name: 'line' }));
		columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
		columns.push(search.createColumn({ name: 'custitem_djkk_kitflag', join: 'assembly' }));
		columns.push(search.createColumn({ name: 'itemid', join: 'assembly' }));
		columns.push(search.createColumn({ name: 'assembly' }));
		columns.push(search.createColumn({ name: 'status' }));
		columns.push(search.createColumn({ name: 'itemid', join: 'custbody_djkk_exsystem_wo_assembly' }));
		columns.push(search.createColumn({ name: 'custitem_djkk_kitflag', join: 'custbody_djkk_exsystem_wo_assembly' }));
		columns.push(search.createColumn({ name: 'custbody_djkk_exsystem_wo_quantity' }));
		columns.push(search.createColumn({ name: 'custbody_djkk_exsystem_wo_billmaterial' }));
		columns.push(search.createColumn({ name: 'custbody_djkk_exsystem_wo_expiratedate' }));
		columns.push(search.createColumn({ name: 'custbody_djkk_exsystem_wo_assembly_lot' }));
		columns.push(search.createColumn({ name: 'custitem_djkk_product_code', join: 'item' }));
        // アイテム.DJ_製品グループ
        columns.push(search.createColumn({ name: 'custitem_djkk_product_group', join: 'item'}));
		columns.push(search.createColumn({ name: 'custitem_djkk_product_code', join: 'custbody_djkk_exsystem_wo_assembly' }));
		columns.push(search.createColumn({ name: 'custitem_djkk_organicflg', join: 'custbody_djkk_exsystem_wo_assembly' }));


		var results = searchResult(search.Type.WORK_ORDER, filters, columns);
		for (var i = 0; i < results.length; i++) {
			var tmpResult = results[i];

			var tmpTransactionId = tmpResult.id;
			var tmpLine = tmpResult.getValue({ name: 'line' });

			var tmpLocation = tmpResult.getValue({ name: 'location' });
			if (arrDataLocationIds.indexOf(tmpLocation.toString()) < 0) {
				continue;
			}

			var tmpStatus = tmpResult.getValue({ name: 'status' });
			if (tmpStatus != 'pendingBuild') {
				continue;
			}
			var tmpBillOfMaterial = tmpResult.getValue({ name: 'custbody_djkk_exsystem_wo_billmaterial' });
			if (tmpBillOfMaterial == null || tmpBillOfMaterial == '') {
				continue;
			}

			if (objUpdateInfo.hasOwnProperty(tmpTransactionId.toString())) {
				objUpdateInfo[(tmpTransactionId.toString())].push(tmpLine.toString());
			} else {
				var tmp = [];
				tmp.push(tmpLine.toString());
				objUpdateInfo[(tmpTransactionId.toString())] = tmp;
			}

			var tmpTransferType = tmpResult.getValue({ name: 'custitem_djkk_kitflag', join: 'custbody_djkk_exsystem_wo_assembly' });
			if (tmpTransferType != null && tmpTransferType != '') {
				tmpTransferType = assemblyTypeInfo[(tmpTransferType.toString())];
			}

			var tmpMemo = tmpResult.getValue({ name: 'memo' });
			tmpMemo = tmpMemo.split('\n').join('');
			tmpMemo = tmpMemo.split('	').join('');

            var tmpPackingMaterialFlg = false;
            var tmpProductGroup = tmpResult.getValue({name: 'custitem_djkk_product_group', join: 'item'});
            if (tmpProductGroup != null && tmpProductGroup != '') {
                tmpPackingMaterialFlg = objProductGroupInfo[tmpProductGroup.toString()].packingMaterialFlg;
            }

			resultDatas.push({
				// システム日付
				SysDate: strSystemDate,
				// 移管区分
				TransferType: tmpTransferType,
				// 移管処理入力日
				TransactionDate: formatDate(tmpResult.getValue({ name: 'trandate' })),
				// 完了期日
				DedlineDate: formatDate(tmpResult.getValue({ name: 'enddate' })),
				// 社内納品書番号
				DeliveryDocument: tmpResult.getValue({ name: 'transactionnumber' }),
				// 移管倉庫コードTo
				WHTo: tmpResult.getValue({ name: 'custrecord_djkk_wms_location_code', join: 'location' }),
				// 在庫コードTo
				StockCodeTo: tmpResult.getValue({ name: 'itemid', join: 'custbody_djkk_exsystem_wo_assembly' }),
				// バッチ番号To
				BatchNumberTo: tmpResult.getValue({ name: 'custbody_djkk_exsystem_wo_assembly_lot' }),
				// 数量To
				QtyTo: tmpResult.getValue({ name: 'custbody_djkk_exsystem_wo_quantity' }),
				DateBestBeforeTo: formatDate(tmpResult.getValue({ name: 'custbody_djkk_exsystem_wo_expiratedate' })),
				LineNumber: tmpResult.getValue({ name: 'custcol_djkk_exsystem_line_num' }),
				// 移管倉庫コードFrom
				WHFrom: tmpResult.getValue({ name: 'custrecord_djkk_wms_location_code', join: 'location' }),
				// 在庫コードFrom
				StockCodeFrom: tmpResult.getValue({ name: 'itemid', join: 'item' }),
				// バッチ番号From
				BatchNumberFrom: tmpResult.getText({ name: 'inventorynumber', join: 'inventorydetail' }),
				// 賞味期限From
				DateBestBeforeFrom: formatDate(tmpResult.getValue({ name: 'expirationdate', join: 'inventorydetail' })),
				// 数量From（最小単位）
				QtyFrom: tmpResult.getValue({ name: 'quantity' }),
				// 特記事項
				Remarks: tmpMemo,
				// オーガニックフラグ
				OrganicFlag: (tmpResult.getValue({ name: 'custitem_djkk_organicflg', join: 'item' }) ? '1' : '0'),
				// 完成品オーガニックフラグ
				FgOrganicFlag: (tmpResult.getValue({ name: 'custitem_djkk_organicflg', join: 'custbody_djkk_exsystem_wo_assembly' }) ? '1' : '0'),
				// カタログコード
				ProductCode: tmpResult.getValue({ name: 'custitem_djkk_product_code', join: 'item' }),
				// 完成品カタログコード
				FgProductCode: tmpResult.getValue({ name: 'custitem_djkk_product_code', join: 'custbody_djkk_exsystem_wo_assembly' }),
                // 梱包材フラグ
                PackingMaterialFlag: (tmpPackingMaterialFlg ? '1' : '0')
			});
		}

		var updateDatas = [];
		for (var transactionId in objUpdateInfo) {
			updateDatas.push({
				transactionId: transactionId.toString(),
				lineIds: objUpdateInfo[(transactionId.toString())]
			});
		}

		var params = {
			custscript_djkk_mr_ws_param: updateDatas,
			custscript_djkk_mr_ws_param_processname: 'SET_PRODUCT_ORDER'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms_set_product_ord',
			params: params
		});
		updateTask.submit();

		return resultDatas;
	}

	/**
	 * 出荷指示
	 */
	function getShippingOrderData() {
		// 在庫移動データ(川崎陸送 → 川崎陸送)
		var arrayResultTransfer = [];
		// 出荷依頼データ(川崎陸送 → 川崎陸送以外)
		var arrayResultShipping = [];

		var subsidiaryIds = getSubsidiaryIds(false);

		var strSystemDate = new Date();

		strSystemDate = strSystemDate.getFullYear()
			+ ("00" + (strSystemDate.getMonth() + 1)).slice(-2)
			+ ("00" + (strSystemDate.getDate() + 1)).slice(-2);

		var arrKawasakiLocationIds = [];
		// 汎用区分.倉庫連携区分.データのレコードIDを取得
		var locationDataTypeId = getCommonTypeId('36', '1');

		var locationIdFilters = [];
		locationIdFilters.push(search.createFilter({
			name: 'isinactive',
			operator: search.Operator.IS,
			values: false
		}));
		locationIdFilters.push(search.createFilter({
			name: 'custrecord_djkk_locationsendtyp',
			operator: search.Operator.IS,
			values: locationDataTypeId
		}));
		var locationIdResults = searchResult(search.Type.LOCATION, locationIdFilters, []);
		for (var i = 0; i < locationIdResults.length; i++) {
			arrKawasakiLocationIds.push(locationIdResults[i].id.toString());
		}

		// DJ_移管区分 を取得
		var transferSections = {};
		var transferSectionFilters = [];
		var transferSectionColumns = [];
		transferSectionColumns.push(search.createColumn({ name: 'custrecord_djkk_transfer_section_code' }));
		var transferSectionResults = searchResult('customrecord_djkk_transfer_section', transferSectionFilters, transferSectionColumns);
		for (var i = 0; i < transferSectionResults.length; i++) {
			transferSections[(transferSectionResults[i].id.toString())] = transferSectionResults[i].getValue({ name: 'custrecord_djkk_transfer_section_code' });
		}

		var updateInfos = {};

		if (arrKawasakiLocationIds.length > 0) {
			var filters = [];
			filters.push(search.createFilter({
				name: 'mainline',
				operator: search.Operator.IS,
				values: false
			}));
			filters.push(search.createFilter({
				name: 'taxline',
				operator: search.Operator.IS,
				values: false
			}));
			filters.push(search.createFilter({
				name: 'custcol_djkk_wms_flg',
				operator: search.Operator.IS,
				values: false
			}));
			filters.push(search.createFilter({
				name: 'location',
				operator: search.Operator.ANYOF,
				values: arrKawasakiLocationIds
			}));
			// 連結
			filters.push(search.createFilter({
				name: 'subsidiary',
				operator: search.Operator.ANYOF,
				values: subsidiaryIds
			}));
			var columns = [];
			// 注文番号
			columns.push(search.createColumn({ name: 'tranid' }));
			// 
			columns.push(search.createColumn({ name: 'custbody_djkk_wmsmemo1' }));
			// 
			columns.push(search.createColumn({ name: 'custbody_djkk_wmsmemo2' }));
			// 
			columns.push(search.createColumn({ name: 'custbody_djkk_wmsmemo3' }));
			// 
			columns.push(search.createColumn({ name: 'custbody_djkk_deliverynotememo' }));
			// 
			columns.push(search.createColumn({ name: 'shipto' }));
			// 
			columns.push(search.createColumn({ name: 'custbody_djkk_delivery_date' }));
			// 
			columns.push(search.createColumn({ name: 'custcol_djkk_wms_line_memo' }));
			columns.push(search.createColumn({ name: 'city', join: 'shippingaddress' }));
			columns.push(search.createColumn({ name: 'address2', join: 'shippingaddress' }));
			columns.push(search.createColumn({ name: 'address3', join: 'shippingaddress' }));
			columns.push(search.createColumn({ name: 'addressee', join: 'shippingaddress' }));
			columns.push(search.createColumn({ name: 'zip', join: 'shippingaddress' }));
			columns.push(search.createColumn({ name: 'phone', join: 'shippingaddress' }));
			columns.push(search.createColumn({ name: 'custrecord_djkk_address_fax', join: 'shippingaddress' }));
			columns.push(search.createColumn({ name: 'entityid', join: 'customer' }));
			columns.push(search.createColumn({ name: 'companyname', join: 'customer' }));
			columns.push(search.createColumn({ name: 'custitem_djkk_product_name_jpline1', join: 'item' }));
			columns.push(search.createColumn({ name: 'custitem_djkk_product_name_jpline2', join: 'item' }));
			columns.push(search.createColumn({ name: 'entityid', join: 'salesrep' }));
			// 日付
			columns.push(search.createColumn({ name: 'trandate' }));
			// DJ_完了期日
			columns.push(search.createColumn({ name: 'custbody_djkk_completion_date' }));
			// トランザクション番号
			columns.push(search.createColumn({ name: 'tranid' }));
			// 移動元
			columns.push(search.createColumn({ name: 'location' }));
			// 移動先
			columns.push(search.createColumn({ name: 'transferlocation' }));
			// 明細.アイテム.商品コード
			columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
			// 明細.アイテム.DJ_移管区分
			columns.push(search.createColumn({ name: 'custitem_djkk_item_transfer_section', join: 'item' }));
			// 明細.在庫詳細.有効期限
			columns.push(search.createColumn({ name: 'expirationdate', join: 'inventorydetail' }));
			// 明細.在庫詳細.管理番号
			columns.push(search.createColumn({ name: 'inventorynumber', join: 'inventorydetail' }));
			// 明細.移動数量
			columns.push(search.createColumn({ name: 'quantity' }));
			// 明細.DJ_備考
			columns.push(search.createColumn({ name: 'custcol_djkk_remars' }));
			// 明細.行番号
			columns.push(search.createColumn({ name: 'line' }));
			var results = searchResult(search.Type.INVENTORY_TRANSFER, filters, columns);

			var inventoryTransferWithLocation = {};
			for (var i = 0; i < results.length; i++) {
				var tmpTransactionId = results[i].id;
				var tmpLocation = results[i].getValue({ name: 'location' });
				var tmpQuantity = Number(results[i].getValue({ name: 'quantity' }));

				if (!inventoryTransferWithLocation.hasOwnProperty(tmpTransactionId.toString())) {
					if (tmpQuantity > 0) {
						inventoryTransferWithLocation[(tmpTransactionId.toString())] = {
							fromLocation: '',
							toLocation: tmpLocation
						};
					} else {
						inventoryTransferWithLocation[(tmpTransactionId.toString())] = {
							fromLocation: tmpLocation,
							toLocation: ''
						};
					}
				} else {
					if (tmpQuantity > 0) {
						inventoryTransferWithLocation[(tmpTransactionId.toString())].toLocation = tmpLocation;
					} else {
						inventoryTransferWithLocation[(tmpTransactionId.toString())].fromLocation = tmpLocation;
					}
				}
			}

			for (var i = 0; i < results.length; i++) {
				var tmpResult = results[i];

				var tmpTransactionId = tmpResult.id;
				var tmpLineId = tmpResult.getValue({ name: 'line' });
				var tmpQuantity = Number(tmpResult.getValue({ name: 'quantity' }));
				var tmpFromLocation = inventoryTransferWithLocation[(tmpTransactionId.toString())].fromLocation;
				var tmpToLocation = inventoryTransferWithLocation[(tmpTransactionId.toString())].toLocation;
				if (tmpQuantity < 0) {
					continue;
				}

				if (updateInfos.hasOwnProperty(tmpTransactionId.toString())) {
					updateInfos[(tmpTransactionId.toString())].push(tmpLineId.toString());
				} else {
					var tmp = [];
					tmp.push(tmpLineId.toString());
					updateInfos[(tmpTransactionId.toString())] = tmp;
				}

				if (arrKawasakiLocationIds.indexOf(tmpToLocation) >= 0) {
					// 在庫移動データである場合

					arrayResultTransfer.push({
						// システム日付
						SysDate: strSystemDate,
						// 移管区分
						TransferType: transferSections[(tmpResult.getValue({ name: 'custitem_djkk_item_transfer_section', join: 'item' }).toString())],
						// 移管処理入力日
						TransactionDate: tmpResult.getValue({ name: 'trandate' }),
						// 完了期日
						DedlineDate: tmpResult.getValue({ name: 'custbody_djkk_completion_date' }),
						// 社内納品書番号
						DeliveryDocument: tmpResult.getValue({ name: 'tranid' }),
						// 移管倉庫コードFrom
						WHFrom: tmpFromLocation,
						// 移管倉庫コードTo
						WHTo: tmpToLocation,
						// 在庫コードFrom
						StockCodeFrom: tmpResult.getValue({ name: 'itemid', join: 'item' }),
						// バッチ番号From
						BatchNumberFrom: tmpResult.getValue({ name: 'inventorynumber', join: 'inventorydetail' }),
						// 賞味期限From
						DateBestBeforeFrom: tmpResult.getValue({ name: 'expirationdate', join: 'inventorydetail' }),
						// 数量From（最小単位）
						QtyFrom: tmpResult.getValue({ name: 'quantity' }),
						// 在庫コードTo
						StockCodeTo: tmpResult.getValue({ name: 'itemid', join: 'item' }),
						// バッチ番号To
						BatchNumberTo: tmpResult.getValue({ name: 'inventorynumber', join: 'inventorydetail' }),
						// 数量To
						QtyTo: tmpResult.getValue({ name: 'quantity' }),
						// 特記事項
						Remarks: tmpResult.getValue({ name: 'custcol_djkk_remars' })
					});
				} else {
					var tmpState = tmpResult.getValue({ name: 'state', join: 'shipaddress' });
					var stateCodeByname = getStateCodeByName();
					if (tmpState != null && tmpState != '') {
						if (stateCodeByname.hasOwnProperty(tmpState.toString())) {
							tmpState = stateCodeByname[(tmpState.toString())];
						}
					}

					// 出荷依頼データである場合
					arrayResultShipping.push({
						// システム日付
						SysDate: strSystemDate,
						// 受注番号
						OrderNumber: tmpResult.getValue({ name: 'tranid' }),
						// 種類
						OrderType: 'salesorder',
						// 明細行番号
						LineNumber: tmpResult.getValue({ name: 'line' }),
						// TODO 運送業者コード
						WayofDelCode: '',
						// 運送業者名
						WayofDelDesc: '',
						// 運送備考
						ShipmentMark: tmpResult.getValue({ name: 'custbody_djkk_wmsmemo1' }),
						// 納品書備考
						AddressText: tmpResult.getValue({ name: 'custbody_djkk_deliverynotememo' }),
						// 配送先コード
						DelvCode: tmpResult.getValue({ name: 'shipto' }),
						// 配送先名1
						DelvName1: tmpResult.getValue({ name: 'addressee', join: 'shippingaddress' }).subString(0, 20),
						// 配送先名2
						DelvName2: tmpResult.getValue({ name: 'addressee', join: 'shippingaddress' }).subString(20),
						// 配送先住所1
						DelvAddress1: tmpState,
						// 配送先住所2
						DelvAddress2: (tmpResult.getValue({ name: 'city', join: 'shippingaddress' }) + tmpResult.getValue({ name: 'address2', join: 'shippingaddress' }) + tmpResult.getValue({ name: 'address3', join: 'shippingaddress' })).subString(0, 35),
						// 配送先住所3
						DelvAddress3: tmpResult.getValue({ name: 'addressee', join: 'shippingaddress' }).subString(0, 35),
						// 配送先郵便番号
						DelvZipCode: tmpResult.getValue({ name: 'zip', join: 'shippingaddress' }),
						// 配送先TEL
						DelvTel: tmpResult.getValue({ name: 'phone', join: 'shippingaddress' }),
						// 配送先FAX
						DelvFax: tmpResult.getValue({ name: 'custrecord_djkk_address_fax', join: 'shippingaddress' }),
						// 配送先注文番号
						CustomerPONo: tmpResult.getValue({ name: 'tranid' }),
						// 購入先コード
						CustCodeInvoicing: tmpResult.getValue({ name: 'entityid', join: 'customer' }),
						// 購入先名称
						CustomerName: tmpResult.getValue({ name: 'companyname', join: 'customer' }),
						// 納品日
						DelDate: formatDate(tmpResult.getValue({ name: 'custbody_djkk_delivery_date' })),
						// 在庫コード
						StockCode: tmpResult.getValue({ name: 'itemid', join: 'item' }),
						// 品名行1
						DescriptionLine1: tmpResult.getValue({ name: 'custitem_djkk_product_name_jpline1', join: 'item' }),
						// 品名行2
						DescriptionLine2: tmpResult.getValue({ name: 'custitem_djkk_product_name_jpline2', join: 'item' }),
						// 出荷個数
						Qty: tmpResult.getValue({ name: 'quantity' }),
						// バッチ番号
						BatchNumber: '',
						// NBKKオーダー入力者名
						UserName: tmpResult.getValue({ name: 'entityid', join: 'salesrep' }),
						// 作業指示など
						TextLine5: tmpResult.getValue({ name: 'custbody_djkk_wmsmemo1' }),
						// 作業指示など
						TextLine2: tmpResult.getValue({ name: 'custbody_djkk_wmsmemo2' }),
						// 作業指示など
						TextLine4: tmpResult.getValue({ name: 'custcol_djkk_wms_line_memo' }),
						// 作業指示など
						TextLine1: '',
						// 倉庫コード
						WarehouseNumber: tmpResult.getValue({ name: 'location' }),
						// 作業指示など
						TextScala: tmpResult.getValue({ name: 'custbody_djkk_wmsmemo3' }),
						// 賞味期限
						DateBestBefore: tmpResult.getValue({ name: 'expirationdate', join: 'inventorydetail' }),
						// 集約フラグ
						ConsFlg: ''
					});
				}
			}
		}

		var updateDatas = [];
		for (var transactionId in updateInfos) {
			updateDatas.push({
				transactionId: transactionId.toString(),
				lineIds: updateInfos[(transactionId.toString())]
			});
		}

		var params = {
			custscript_djkk_mr_ws_param: updateDatas,
			custscript_djkk_mr_ws_param_processname: 'IF_E_0030_S_NS_TO_HFT'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms',
			params: params
		});
		updateTask.submit();

		return {
			transfer: arrayResultTransfer,
			shipping: arrayResultShipping
		};
	}

	/**
	 * 出荷実績取込実行
	 * @param {Array} arrayDatas 
	 */
	function executeShipmentRecord(arrayDatas) {
		var params = {
			custscript_djkk_mr_ws_param: arrayDatas,
			custscript_djkk_mr_ws_param_processname: 'IF_E_0040_R_NS_FRM_HFT'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms',
			params: params
		});
		updateTask.submit();
	}

	/**
	 * 在庫数量取り込み実行
	 * @param {Array} arrayDatas 
	 */
	function executeStockQuantity(arrayDatas) {

		var params = {
			custscript_djkk_mr_ws_param: arrayDatas,
			custscript_djkk_mr_ws_param_processname: 'IF_E_0070_R_NS_FRM_HFT'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms',
			params: params
		});
		updateTask.submit();
	}

	/**
	 * DJ_外部システム_注文作成エラー 取得
	 */
	function getErrorOrderNumber() {
		var filters = [];
		filters.push(search.createFilter({
			name: 'isinactive',
			operator: search.Operator.IS,
			values: false
		}));

		var columns = [];
		columns.push(search.createColumn({
			name: 'custrecord_djkk_exsystem_error_orderno'
		}));
		var results = searchResult('customrecord_djkk_exsystem_error_orderno', filters, columns);

		var resultOrderNumbers = [];
		var errorRecordIds = [];
		for (var i = 0; i < results.length; i++) {
			var currentResult = results[i];

			var currentResultId = currentResult.id;
			var currentOrderNumbers = currentResult.getValue({ name: 'custrecord_djkk_exsystem_error_orderno' });

			if (currentOrderNumbers != null && currentOrderNumbers != '') {
				if (currentOrderNumbers.indexOf(',') < 0) {
					resultOrderNumbers.push(currentOrderNumbers.toString());
				} else {
					resultOrderNumbers = resultOrderNumbers.concat(currentOrderNumbers.split(','));
				}

			}

			if (errorRecordIds.indexOf(currentResultId.toString()) < 0) {
				errorRecordIds.push(currentResultId.toString());
			}
		}

		var params = {
			custscript_djkk_mr_ws_param: errorRecordIds,
			custscript_djkk_mr_ws_param_processname: 'RESET_ERROR_ORDER_NUMBER'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms_order_error_api',
			params: params
		});
		updateTask.submit();

		return resultOrderNumbers;
	}

	/**
	 * 注文前払金確認済み取得
	 */
	function getOrderPrepaymentConfirmed(syncDateTime) {
		var resultOrderPrepaymentConfirmed = [];
		var updateSalesOrderId = [];

		var allSubsidiaryId = getSubsidiaryIds(false);

		var filters = [];

		filters.push(['subsidiary', 'anyof', allSubsidiaryId]);
		filters.push('and');
		filters.push(['custbody_djkk_exsystem_opc_flg', 'is', true]);
		filters.push('and');
		filters.push(['mainline', 'is', false]);
		filters.push('and');
		filters.push(['taxline', 'is', false]);
		filters.push('and');
		filters.push(['custbody_djkk_exsystem_send_date_time', 'isempty', '@NONE@']);
		filters.push('and');
		filters.push(["formulanumeric: TO_DATE('" + syncDateTime + "','yyyy-MM-dd HH24:MI:SS')-{lastmodifieddate}", "lessthanorequalto", "0"]);

		var columns = [];

		// 注文番号
		columns.push(search.createColumn({ name: 'custbody_djkk_exsystem_tranid' }));

		// 注文依頼ID
		columns.push(search.createColumn({ name: 'custbody_djkk_orderrequestid' }));
		columns.push(search.createColumn({ name: 'lastmodifieddate' }));

		var searchResults = searchResult(search.Type.SALES_ORDER, filters, columns);

		var allResultOrderNo = [];

		for (var i = 0; i < searchResults.length; i++) {
			var currentResult = searchResults[i];
			var currentModifiedDate = currentResult.getValue({ name: 'lastmodifieddate' });

			// 内部ID
			var tmpId = currentResult.id;

			// 注文番号
			var tmpOrderNo = currentResult.getValue({ name: 'custbody_djkk_exsystem_tranid' });

			// 注文依頼ID
			var tmpOrderRequestId = currentResult.getValue({ name: 'custbody_djkk_orderrequestid' });

			if ((allResultOrderNo.indexOf(tmpOrderNo) < 0) && (tmpOrderNo != null && tmpOrderNo != '')) {
				resultOrderPrepaymentConfirmed.push({
					orderNo: tmpOrderNo
					//					orderRequestId: tmpOrderRequestId
				});

				allResultOrderNo.push(tmpOrderNo);

				if (updateSalesOrderId.indexOf(tmpId.toString()) < 0) {
					updateSalesOrderId.push(tmpId.toString());
				}
			}
		}

		var params = {
			custscript_djkk_mr_ws_param: updateSalesOrderId,
			custscript_djkk_mr_ws_param_processname: 'ORDER_PREPAYMENT_CONFIRMED'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms_prepayment_api',
			params: params
		});
		updateTask.submit();

		return resultOrderPrepaymentConfirmed;
	}

	function getShippingHistory(syncDateTime) {
		var resultShippingHistory = [];
		var updateShippingIds = [];

		var allSubsidiaryId = getSubsidiaryIds(false);

		var resultStep = 1000;
		var resultIndex = 0;

		var objSearch = search.load({ id: 'customsearch_djkk_shipping_history' });
		var filters = objSearch.filters;
		filters.push(search.createFilter({
			name: 'subsidiary',
			join: 'transaction',
			operator: search.Operator.ANYOF,
			values: allSubsidiaryId
		}));
		filters.push(search.createFilter({
			name: 'lastmodifieddate',
			join: 'transaction',
			operator: search.Operator.ONORAFTER,
			values: format.format({ value: new Date(syncDateTime.split('-').join('/')), type: format.Type.DATE })
		}));
		filters.push(search.createFilter({
			name: 'custbody_djkk_exsystem_shippinghistory',
			join: 'transaction',
			operator: search.Operator.IS,
			values: false
		}));
		objSearch.filters = filters;
		var resultSet = objSearch.run();
		var results = [];

		do {
			results = resultSet.getRange({ start: resultIndex, end: resultIndex + resultStep });
			if (results != null && results != '') {
				for (var i = 0; i < results.length; i++) {
					var tmpResult = results[i];
					if (updateShippingIds.indexOf(tmpResult.id.toString()) < 0) {
						updateShippingIds.push(tmpResult.id.toString());
					}

					var tmpShippingDate = tmpResult.getValue(resultSet.columns[3]);
					var tmpExpdate = tmpResult.getValue(resultSet.columns[6]);
					var tmpCreateDate = tmpResult.getValue(resultSet.columns[9]);
					var tmpLastModifiedDate = tmpResult.getValue(resultSet.columns[10]);

					if (tmpShippingDate != null && tmpShippingDate != '') {
						tmpShippingDate = format.parse({ value: tmpShippingDate, type: format.Type.DATE });
						tmpShippingDate = tmpShippingDate.getFullYear() + ('00' + (tmpShippingDate.getMonth() + 1)).slice(-2) + ('00' + tmpShippingDate.getDate()).slice(-2);
					} else {
						tmpShippingDate = '';
					}

					if (tmpExpdate != null && tmpExpdate != '') {
						tmpExpdate = format.parse({ value: tmpExpdate, type: format.Type.DATE });
						tmpExpdate = tmpExpdate.getFullYear() + ('00' + (tmpExpdate.getMonth() + 1)).slice(-2) + ('00' + tmpExpdate.getDate()).slice(-2);
					} else {
						tmpExpdate = '';
					}

					if (tmpCreateDate != null && tmpCreateDate != '') {
						tmpCreateDate = format.parse({ value: tmpCreateDate, type: format.Type.DATE });
						tmpCreateDate = tmpCreateDate.getFullYear() + '年' + ('00' + (tmpCreateDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpCreateDate.getDate()).slice(-2) + '日 ' + ('00' + tmpCreateDate.getHours()).slice(-2) + '時' + ('00' + tmpCreateDate.getMinutes()).slice(-2) + '分';
					} else {
						tmpCreateDate = '';
					}

					if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
						tmpLastModifiedDate = format.parse({ value: tmpLastModifiedDate, type: format.Type.DATE });
						tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '年' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '日 ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '時' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '分';
					} else {
						tmpLastModifiedDate = '';
					}

					resultShippingHistory.push({
						// 参照番号
						'tranid': tmpResult.getValue(resultSet.columns[0]),
						// 納入先ID
						'deliverydestid': tmpResult.getValue(resultSet.columns[1]),
						// 商品コード
						'itemid': tmpResult.getValue(resultSet.columns[2]),
						// 出荷日
						'shippingdate': tmpShippingDate,
						// 管理番号
						'manageno': tmpResult.getText(resultSet.columns[4]),
						// 数量
						'quantity': tmpResult.getValue(resultSet.columns[5]),
						// 賞味期限
						'expdate': tmpExpdate,
						// ロット番号
						'lotno': tmpResult.getValue(resultSet.columns[7]),
						// 注文番号
						'soid': tmpResult.getValue(resultSet.columns[8]),
						// 作成日時
						'createtime': tmpCreateDate,
						// 作成者コード
						'createuser': 'netsuite',
						// 最終更新日時
						'lastupdatetime': tmpLastModifiedDate,
						// 最終更新者コード
						'updateuser': 'netsuite',
						// 削除フラグ
						'deleteflg': '0'
					});
					resultIndex++;
				}
			}
		} while (results.length > 0);

		// 納品先コードを整理
		var allDeliveryDestId = [];
		for (var i = 0; i < resultShippingHistory.length; i++) {
			var tmpDeliveryId = resultShippingHistory[i]['deliverydestid'];

			if (tmpDeliveryId != null && tmpDeliveryId != '') {
				if (allDeliveryDestId.indexOf(tmpDeliveryId) < 0) {
					allDeliveryDestId.push(tmpDeliveryId);
				}
			}
		}

		var deliveryCodeById = {};
		if (allDeliveryDestId.length > 0) {
			var deliveryFilters = [];
			deliveryFilters.push(search.createFilter({
				name: 'internalid',
				operator: search.Operator.ANYOF,
				values: allDeliveryDestId
			}));
			var deliveryColumns = [];
			deliveryColumns.push(search.createColumn({ name: 'custrecord_djkk_delivery_code' }));

			var deliveryResults = searchResult('customrecord_djkk_delivery_destination', deliveryFilters, deliveryColumns);
			if (deliveryResults != null && deliveryResults != '') {
				for (var i = 0; i < deliveryResults.length; i++) {
					deliveryCodeById[(deliveryResults[i].id.toString())] = deliveryResults[i].getValue({ name: 'custrecord_djkk_delivery_code' });
				}
			}
		}

		for (var i = 0; i < resultShippingHistory.length; i++) {
			if (deliveryCodeById.hasOwnProperty(resultShippingHistory[i]['deliverydestid'].toString())) {
				resultShippingHistory[i]['deliverydestid'] = deliveryCodeById[(resultShippingHistory[i]['deliverydestid'].toString())];
			}
		}

		// 削除された配送を取得
		var deletedFilters = [];
		deletedFilters.push(search.createFilter({
			name: 'recordtype',
			operator: search.Operator.IS,
			values: search.Type.ITEM_FULFILLMENT
		}));
		deletedFilters.push(search.createFilter({
			name: 'deleteddate',
			operator: search.Operator.ONORAFTER,
			values: format.format({ value: new Date(syncDateTime.split('-').join('/')), type: format.Type.DATE })
		}));
		var deletedColumns = [];
		deletedColumns.push(search.createColumn({ name: 'name' }));
		var deletedResults = searchResult(search.Type.DELETED_RECORD, deletedFilters, deletedColumns);
		if (deletedResults != null && deletedResults != '') {
			for (var i = 0; i < deletedResults.length; i++) {

				var tmpDelivery = '';
				if (tmpDelivery == null && tmpDelivery == '') {
					continue;
				}

				resultShippingHistory.push({
					// 参照番号
					'tranid': deletedResults[i].getValue({ name: 'name' }),
					// 納入先ID
					'deliverydestid': '',
					// 商品コード
					'itemid': '',
					// 出荷日
					'shippingdate': '',
					// 管理番号
					'manageno': '',
					// 数量
					'quantity': '',
					// 賞味期限
					'expdate': '',
					// ロット番号
					'lotno': '',
					// 注文番号
					'soid': '',
					// 作成日時
					'createtime': '',
					// 作成者コード
					'createuser': '',
					// 最終更新日時
					'lastupdatetime': '',
					// 最終更新者コード
					'updateuser': '',
					// 削除フラグ
					'deleteflg': '1'
				});
			}
		}

		var params = {
			custscript_djkk_mr_ws_param: updateShippingIds,
			custscript_djkk_mr_ws_param_processname: 'SHIPPING_HISTORY'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms_shiphistory_api',
			params: params
		});
		updateTask.submit();

		return resultShippingHistory;
	}

	function getPriceList(syncDateTime) {
		var resultPriceListData = [];

		var formatDate = format.format({ value: new Date(syncDateTime.split('-').join('/')), type: format.Type.DATE });

		var allSubsidiaryId = getSubsidiaryIds(false);
		var currentCodeById = getCurrencyCodeById();

		var allTargetPriceListId = [];
		var targetFilters = [];
		targetFilters.push(['custrecord_djkk_pldt_pl_fd.custrecord_djkk_price_subsidiary_fd', 'anyof', allSubsidiaryId]);
		targetFilters.push('and');
		var tmpTarget = [];
		tmpTarget.push(["formulanumeric: TO_DATE('" + syncDateTime + "','yyyy-MM-dd HH24:MI:SS')-{custrecord_djkk_pldt_pl_fd.lastmodified}", "lessthanorequalto", "0"]);
		tmpTarget.push('or');
		tmpTarget.push(["formulanumeric: TO_DATE('" + syncDateTime + "','yyyy-MM-dd HH24:MI:SS')-{lastmodified}", "lessthanorequalto", "0"]);
		targetFilters.push(tmpTarget);

		var targetColumns = [];
		targetColumns.push(search.createColumn({ name: 'internalid', join: 'custrecord_djkk_pldt_pl_fd' }));
		var targetResults = searchResult('customrecord_djkk_price_list_details_fd', targetFilters, targetColumns);
		for (var i = 0; i < targetResults.length; i++) {
			var tmpId = targetResults[i].getValue({ name: 'internalid', join: 'custrecord_djkk_pldt_pl_fd' });
			if (allTargetPriceListId.indexOf(tmpId.toString()) < 0) {
				allTargetPriceListId.push(tmpId.toString());
			}
		}

		var allDataByHeaderId = {};

		var allPriceData = [];
		var allPriceId = [];
		if (allTargetPriceListId != null && allTargetPriceListId != '' && allTargetPriceListId.length > 0) {
			var filters = [];

			filters.push(search.createFilter({
				name: 'internalid',
				join: 'custrecord_djkk_pldt_pl_fd',
				operator: search.Operator.ANYOF,
				values: allTargetPriceListId
			}));

			var columns = [];
			// DJ_価格表.内部ID
			columns.push(search.createColumn({
				name: 'internalid',
				join: 'custrecord_djkk_pldt_pl_fd',
				sort: search.Sort.ASC
			}));
			// 行番号
			columns.push(search.createColumn({
				name: 'internalid',
				sort: search.Sort.ASC
			}));
			// DJ_価格表.作成日時
			columns.push(search.createColumn({
				name: 'created',
				join: 'custrecord_djkk_pldt_pl_fd',
			}));
			// DJ_価格表.最終更新日時
			columns.push(search.createColumn({
				name: 'lastmodified',
				join: 'custrecord_djkk_pldt_pl_fd',
			}));
			// DJ_価格表.DJ_価格表名前
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pl_name_fd',
				join: 'custrecord_djkk_pldt_pl_fd'
			}));
			// DJ_価格表.DJ_価格表コード
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pl_code_fd',
				join: 'custrecord_djkk_pldt_pl_fd'
			}));
			// DJ_価格表.DJ_価格表通貨
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pl_price_currency_fd',
				join: 'custrecord_djkk_pldt_pl_fd'
			}));
			// DJ_商品コード.アイテムID
			columns.push(search.createColumn({
				name: 'itemid',
				join: 'custrecord_djkk_pldt_itemcode_fd'
			}));
			// DJ_開始日
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pl_startdate_fd'
			}));
			// DJ_数量
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pldt_quantity_fd'
			}));
			// DJ_終了日
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pl_enddate_fd'
			}));
			// DJ_基本販売価格
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pldt_saleprice_fd'
			}));
			// DJ_数量ベース価格
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pldt_cod_price_fd'
			}));

			var searchResults = searchResult('customrecord_djkk_price_list_details_fd', filters, columns);
			if (searchResults != null && searchResults != '') {
				for (var i = 0; i < searchResults.length; i++) {
					var tmpHeaderId = searchResults[i].getValue({ name: 'internalid', join: 'custrecord_djkk_pldt_pl_fd' });
					if (allPriceId.indexOf(tmpHeaderId.toString()) < 0) {
						allPriceId.push(tmpHeaderId.toString());
					}

					var tmpStartDate = searchResults[i].getValue({ name: 'custrecord_djkk_pl_startdate_fd' });
					var tmpEndDate = searchResults[i].getValue({ name: 'custrecord_djkk_pl_enddate_fd' });
					var tmpCreateDate = searchResults[i].getValue({ name: 'created', join: 'custrecord_djkk_pldt_pl_fd' });
					var tmpLastModifiedDate = searchResults[i].getValue({ name: 'lastmodified', join: 'custrecord_djkk_pldt_pl_fd' });

					if (tmpStartDate != null && tmpStartDate != '') {
						tmpStartDate = format.parse({ value: tmpStartDate, type: format.Type.DATE });
						tmpStartDate = tmpStartDate.getFullYear() + ('00' + (tmpStartDate.getMonth() + 1)).slice(-2) + ('00' + tmpStartDate.getDate()).slice(-2);
					} else {
						tmpStartDate = '';
					}

					if (tmpEndDate != null && tmpEndDate != '') {
						tmpEndDate = format.parse({ value: tmpEndDate, type: format.Type.DATE });
						tmpEndDate = tmpEndDate.getFullYear() + ('00' + (tmpEndDate.getMonth() + 1)).slice(-2) + ('00' + tmpEndDate.getDate()).slice(-2);
					} else {
						tmpEndDate = '';
					}

					if (tmpCreateDate != null && tmpCreateDate != '') {
						tmpCreateDate = format.parse({ value: tmpCreateDate, type: format.Type.DATE });
						tmpCreateDate = tmpCreateDate.getFullYear() + '年' + ('00' + (tmpCreateDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpCreateDate.getDate()).slice(-2) + '日 ' + ('00' + tmpCreateDate.getHours()).slice(-2) + '時' + ('00' + tmpCreateDate.getMinutes()).slice(-2) + '分';
					} else {
						tmpCreateDate = '';
					}

					if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
						tmpLastModifiedDate = format.parse({ value: tmpLastModifiedDate, type: format.Type.DATE });
						tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '年' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '日 ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '時' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '分';
					} else {
						tmpLastModifiedDate = '';
					}

					var tmpItemCode = searchResults[i].getValue({ name: 'itemid', join: 'custrecord_djkk_pldt_itemcode_fd' });
					var tmpKey = tmpHeaderId + ' - ' + tmpItemCode + ' - ' + tmpStartDate;

					var tmpCurrencyId = searchResults[i].getValue({ name: 'custrecord_djkk_pl_price_currency_fd', join: 'custrecord_djkk_pldt_pl_fd' });
					if (tmpCurrencyId != null && tmpCurrencyId != '') {
						if (currentCodeById.hasOwnProperty(tmpCurrencyId.toString())) {
							tmpCurrencyId = currentCodeById[(tmpCurrencyId.toString())];
						} else {
							tmpCurrencyId = '';
						}
					}

					var tmpHeaderId = searchResults[i].getValue({ name: 'internalid', join: 'custrecord_djkk_pldt_pl_fd' });
					var tmpData = {
						// DJ_価格表.ID
						headerId: tmpHeaderId,
						// 行番号
						linenum: searchResults[i].getValue({ name: 'internalid' }),
						// 価格表コード
						priceListCode: searchResults[i].getValue({ name: 'custrecord_djkk_pl_code_fd', join: 'custrecord_djkk_pldt_pl_fd' }),
						// 価格表名称
						name: searchResults[i].getValue({ name: 'custrecord_djkk_pl_name_fd', join: 'custrecord_djkk_pldt_pl_fd' }),
						// 通貨
						currency: tmpCurrencyId,
						// 商品コード
						itemCode: tmpItemCode,
						// 適用開始日
						startDate: tmpStartDate,
						// 適用終了日
						endDate: tmpEndDate,
						// 数量ベース価格
						basePrice: searchResults[i].getValue({ name: 'custrecord_djkk_pldt_cod_price_fd' }),
						// 基本販売価格
						baseSalesPrice: searchResults[i].getValue({ name: 'custrecord_djkk_pldt_saleprice_fd' }),
						// 数量
						quantity: searchResults[i].getValue({ name: 'custrecord_djkk_pldt_quantity_fd' }),
						// 無効
						isInactive: searchResults[i].getValue({ name: 'isinactive', join: 'custrecord_djkk_pldt_pl_fd' }),
						// 作成日時
						headerCreateDate: tmpCreateDate,
						// 最終更新日時
						headerLastModifiedDate: tmpLastModifiedDate
					};
					if (allDataByHeaderId.hasOwnProperty(tmpHeaderId.toString())) {
						allDataByHeaderId[(tmpHeaderId.toString())].push(tmpData);
					} else {
						var tmp = [];
						tmp.push(tmpData);
						allDataByHeaderId[(tmpHeaderId.toString())] = tmp;
					}
				}
			}
		}


		for (var headerId in allDataByHeaderId) {
			var currentLineDatas = allDataByHeaderId[(headerId.toString())];
			if (currentLineDatas == null || currentLineDatas == '' || currentLineDatas.length <= 0) {
				continue;
			}
			var priceDataByKey = {};
			for (var i = 0; i < currentLineDatas.length; i++) {
				var tmpItemCode = currentLineDatas[i].itemCode;

				var tmpStartDate = currentLineDatas[i].startDate;

				var tmpKey = tmpItemCode + ' - ' + tmpStartDate;

				if (priceDataByKey.hasOwnProperty(tmpKey)) {
					priceDataByKey[(tmpKey)].push(currentLineDatas[i]);
				} else {
					var tmp = [];
					tmp.push(currentLineDatas[i]);
					priceDataByKey[(tmpKey)] = tmp;
				}
			}
			var lineDatas = [];

			for (var key in priceDataByKey) {
				var currentDatas = priceDataByKey[key];



				if (currentDatas == null || currentDatas == []) {
					continue;
				}

				// 行番号を基準にソート
				currentDatas = currentDatas.sort(function (a, b) {
					if (Number(a.linenum) > Number(b.linenum)) {
						return 1;
					} else if (Number(a.linenum) < Number(b.linenum)) {
						return -1;
					} else {
						return 0;
					}
				});

				if (currentDatas.length == 1 && (currentDatas[0].basePrice == null || currentDatas[0].basePrice == '')) {
					// 一行しかない、且つ　DJ_すうりゅベース価格 はNULLである場合
					lineDatas.push({
						// 商品コード
						itemid: currentDatas[0].itemCode,
						// 適用開始日
						applyfromdate: currentDatas[0].startDate,
						// 価格基準数量From
						fromquantity: 1,
						// 適用終了日
						applytodate: currentDatas[0].endDate,
						// 価格基準数量To
						toquantity: null,
						// 価格
						price: currentDatas[0].baseSalesPrice
					});
				} else {
					for (var i = 0; i < currentDatas.length; i++) {
						if (i == 0) {
							// １レコード目
							lineDatas.push({
								// 商品コード
								itemid: currentDatas[i].itemCode,
								// 適用開始日
								applyfromdate: currentDatas[i].startDate,
								// 価格基準数量From
								fromquantity: 1,
								// 適用終了日
								applytodate: currentDatas[i].endDate,
								// 価格基準数量To
								toquantity: Number(currentDatas[i].quantity) - 1,
								// 価格
								price: currentDatas[i].baseSalesPrice
							});
						} else if (i == 1) {
							// ２レコード目
							lineDatas.push({
								// 商品コード
								itemid: currentDatas[i].itemCode,
								// 適用開始日
								applyfromdate: currentDatas[i].startDate,
								// 価格基準数量From
								fromquantity: Number(currentDatas[(i - 1)].quantity),
								// 適用終了日
								applytodate: currentDatas[i].endDate,
								// 価格基準数量To
								toquantity: Number(currentDatas[i].quantity) - 1,
								// 価格
								price: currentDatas[(i - 1)].basePrice
							});
						}
					}
					var lastIndex = currentDatas.length - 1;
					lineDatas.push({
						// 商品コード
						itemid: currentDatas[lastIndex].itemCode,
						// 適用開始日
						applyfromdate: currentDatas[lastIndex].startDate,
						// 価格基準数量From
						fromquantity: currentDatas[lastIndex].quantity,
						// 適用終了日
						applytodate: currentDatas[lastIndex].endDate,
						// 価格基準数量To
						toquantity: null,
						// 価格
						price: currentDatas[lastIndex].basePrice
					});
				}
			}
			resultPriceListData.push({
				// 価格表コード
				priceListCd: currentDatas[0].priceListCode,
				// 価格表名称
				priceListNm: currentDatas[0].name,
				// 通貨
				currency: currentDatas[0].currency,
				// 作成日時
				createtime: currentDatas[0].headerCreateDate,
				// 作成者コード
				createuser: 'netsuite',
				// 最終更新日時
				lastupdatetime: currentDatas[0].headerLastModifiedDate,
				// 最終更新者コード
				updateuser: 'netsuite',
				// 削除フラグ
				deleteflg: currentDatas[0].isInactive ? '1' : '0',
				// 明細
				lines: lineDatas
			});
		}
		return resultPriceListData;
	}

	function getCustomer(syncDateTime) {
		var allSubsidiaryId = getSubsidiaryIds(false);

		var allCurrencyCodeById = getCurrencyCodeById();

		var addrInfoByCustomerId = {};
		var addrFilters = [];
		var addrColumns = [];
		addrColumns.push(search.createColumn({ name: 'entityid' }));
		addrColumns.push(search.createColumn({ name: 'isdefaultshipping', join: 'address' }));
		addrColumns.push(search.createColumn({ name: 'isdefaultbilling', join: 'address' }));
		addrColumns.push(search.createColumn({ name: 'addresslabel', join: 'address' }));
		addrColumns.push(search.createColumn({ name: 'internalid', join: 'address' }));
		var addrResults = searchResult(search.Type.CUSTOMER, addrFilters, addrColumns);
		for (var i = 0; i < addrResults.length; i++) {
			var tmpAddrResult = addrResults[i];
			var tmpCustomerId = tmpAddrResult.getValue({ name: 'entityid' });

			if (addrInfoByCustomerId.hasOwnProperty(tmpCustomerId.toString())) {
				addrInfoByCustomerId[(tmpCustomerId.toString())].push({
					// 住所明細行番号
					addrlineno: addrInfoByCustomerId[(tmpCustomerId)].length + 1,
					// デフォルト送付先フラグ
					defaultshippingflg: (tmpAddrResult.getValue({ name: 'isdefaultshipping', join: 'address' }) ? '1' : '0'),
					// デフォルト請求先フラグ
					defaultbillingflg: (tmpAddrResult.getValue({ name: 'isdefaultbilling', join: 'address' }) ? '1' : '0'),
					// 住所ラベル
					addrlabel: tmpAddrResult.getValue({ name: 'addresslabel', join: 'address' }),
					// 住所ID
					addrid: tmpAddrResult.getValue({ name: 'internalid', join: 'address' })
				});
			} else {
				var tmp = [];
				tmp.push({
					// 住所明細行番号
					addrlineno: 1,
					// デフォルト送付先フラグ
					defaultshippingflg: (tmpAddrResult.getValue({ name: 'isdefaultshipping', join: 'address' }) ? '1' : '0'),
					// デフォルト請求先フラグ
					defaultbillingflg: (tmpAddrResult.getValue({ name: 'isdefaultbilling', join: 'address' }) ? '1' : '0'),
					// 住所ラベル
					addrlabel: tmpAddrResult.getValue({ name: 'addresslabel', join: 'address' }),
					// 住所ID
					addrid: tmpAddrResult.getValue({ name: 'internalid', join: 'address' })
				});
				addrInfoByCustomerId[(tmpCustomerId.toString())] = tmp;
			}
		}

		var paymentTermInfo = {};
		var paymentTermFilters = [];
		var paymentTermColumns = [];
		paymentTermColumns.push(search.createColumn({ name: 'name' }));
		paymentTermColumns.push(search.createColumn({ name: 'custrecord_djkk_payment_terms_code' }));
		var paymentTermResults = searchResult('customrecord_djkk_payment_terms', paymentTermFilters, paymentTermColumns);
		for (var i = 0; i < paymentTermResults.length; i++) {
			var tmpName = paymentTermResults[i].getValue({ name: 'name' });
			var tmpCode = paymentTermResults[i].getValue({ name: 'custrecord_djkk_payment_terms_code' });
			paymentTermInfo[(tmpName.toString())] = tmpCode;
		}

		var allCustomerInfo = [];

		var filters = [];
		filters.push(['subsidiary', 'anyof', allSubsidiaryId]);
		filters.push('and');
		filters.push(["formulanumeric: TO_DATE('" + syncDateTime + "','yyyy-MM-dd HH24:MI:SS')-{lastmodifieddate}","lessthanorequalto","0"]);

		var columns = [];
		columns.push(search.createColumn({ name: 'entityid' }));
		columns.push(search.createColumn({ name: 'companyname' }));
		columns.push(search.createColumn({ name: 'currency' }));
		columns.push(search.createColumn({ name: 'language' }));
		columns.push(search.createColumn({ name: 'parent' }));
		columns.push(search.createColumn({ name: 'subsidiary' }));
		columns.push(search.createColumn({ name: 'email' }));
		columns.push(search.createColumn({ name: 'phone' }));
		columns.push(search.createColumn({ name: 'fax' }));
		columns.push(search.createColumn({ name: 'salesrep' }));
		columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custentity_djkk_expdatereservaltyp' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_expdateremainingdays' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_expdateremainingpercent' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_payment_conditions' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_orderruledesc' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_consignmentbuyingflg' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_commoncustomflg' }));
		columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custentity_djkk_shippinginfosendtyp' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_customerrep' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_shippinginfodestemail' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_shippinginfodestfax' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_shippinginfodestmemo' }));
		//		columns.push(search.createColumn({name: 'custentity_djkk_finet_shipment_mail_flg'}));
		//		columns.push(search.createColumn({name: 'custentity_djkk_finet_bill_mail_flg'}));
		columns.push(search.createColumn({ name: 'custentity_djkk_sowmsmemo' }));
		columns.push(search.createColumn({ name: 'custrecord_djkk_pl_code_fd', join: 'custentity_djkk_pl_code_fd' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_price0flg' }));
		//		columns.push(search.createColumn({name: 'custentity_djkk_external_align_code'}));
		columns.push(search.createColumn({ name: 'datecreated' }));
		columns.push(search.createColumn({ name: 'lastmodifieddate' }));
		columns.push(search.createColumn({ name: 'isinactive' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_activity' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_sodeliverermemo' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_deliverydesteachinputflg' }));
		// DJ_出荷案内送信先区分
		columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custentity_djkk_shippinginfodesttyp' }));
		// DJ_出荷案内送信先会社名
		columns.push(search.createColumn({ name: 'custentity_djkk_shippinginfodestname' }));
		// DJ_出荷案内送信先担当者
		columns.push(search.createColumn({ name: 'custentity_djkk_shippinginfodestrep' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_exsystem_phone_text' }));
		columns.push(search.createColumn({ name: 'custentity_djkk_exsystem_fax_text' }));
		var results = searchResult(search.Type.CUSTOMER, filters, columns);
		if (results != null && results != '') {
			for (var i = 0; i < results.length; i++) {
				var tmpResult = results[i];
				var tmpCustomerId = tmpResult.id;
				var tmpCustomerType = tmpResult.recordType;

				if (tmpCustomerType != 'customer') {
					continue;
				}

				var tmpParentId = tmpResult.getValue({ name: 'parent' });
				if (tmpParentId == tmpCustomerId) {
					tmpParentId = '';
				}

				var tmpCreateDate = tmpResult.getValue({ name: 'datecreated' });
				var tmpLastModifiedDate = tmpResult.getValue({ name: 'lastmodifieddate' });
				if (tmpCreateDate != null && tmpCreateDate != '') {
					tmpCreateDate = format.parse({ value: tmpCreateDate, type: format.Type.DATE });
					tmpCreateDate = tmpCreateDate.getFullYear() + '年' + ('00' + (tmpCreateDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpCreateDate.getDate()).slice(-2) + '日 ' + ('00' + tmpCreateDate.getHours()).slice(-2) + '時' + ('00' + tmpCreateDate.getMinutes()).slice(-2) + '分';
				} else {
					tmpCreateDate = '';
				}

				if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
					tmpLastModifiedDate = format.parse({ value: tmpLastModifiedDate, type: format.Type.DATE });
					tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '年' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '日 ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '時' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '分';
				} else {
					tmpLastModifiedDate = '';
				}

				var tmpPaymentConditions = tmpResult.getText({ name: 'custentity_djkk_payment_conditions' });
				tmpPaymentConditions = paymentTermInfo[(tmpPaymentConditions.toString())];

				var tmpCurrencyCode = tmpResult.getValue({ name: 'currency' });
				if (tmpCurrencyCode != null && tmpCurrencyCode != '') {
					if (allCurrencyCodeById.hasOwnProperty(tmpCurrencyCode.toString())) {
						tmpCurrencyCode = allCurrencyCodeById[(tmpCurrencyCode.toString())];
					} else {
						tmpCurrencyCode = '';
					}
				}

				allCustomerInfo.push({
					// 顧客ID
					customerid: tmpResult.getValue({ name: 'entityid' }),
					// 顧客名
					customernm: tmpResult.getValue({ name: 'companyname' }),
					// 通貨
					currency: tmpCurrencyCode,
					// 言語
					language: tmpResult.getText({ name: 'language' }),
					// 親会社ID
					parentid: tmpParentId,
					// 会社ID
					subsidiaryid: tmpResult.getValue({ name: 'subsidiary' }),
					// クラスID
					classid: '',
					// 部門ID
					departmentid: tmpResult.getValue({ name: 'custentity_djkk_activity' }),
					// 電子メール
					email: tmpResult.getValue({ name: 'email' }),
					// 電話
					phone: tmpResult.getValue({ name: 'custentity_djkk_exsystem_phone_text' }),
					// FAX
					fax: tmpResult.getValue({ name: 'custentity_djkk_exsystem_fax_text' }),
					// 自社営業担当者ID
					salesrepid: tmpResult.getValue({ name: 'salesrep' }),
					// DJ_賞味期限逆転防止区分
					dj_expdatereservaltyp: tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custentity_djkk_expdatereservaltyp' }),
					// DJ_賞味期限残日数
					dj_expdateremainingdays: tmpResult.getValue({ name: 'custentity_djkk_expdateremainingdays' }),
					// DJ_賞味期限残パーセンテージ
					dj_expdateremainingpercent: tmpResult.getValue({ name: 'custentity_djkk_expdateremainingpercent' }),
					// DJ_支払条件区分
					dj_paymentcondtyp: tmpPaymentConditions,
					// DJ_受注出荷関連ルール記述
					dj_orderruledesc: tmpResult.getValue({ name: 'custentity_djkk_orderruledesc' }),
					// DJ_消化仕入フラグ
					dj_consignmentbuyingflg: (tmpResult.getValue({ name: 'custentity_djkk_consignmentbuyingflg' }) ? '1' : '0'),
					// DJ_汎用顧客フラグ
					dj_commoncustomflg: (tmpResult.getValue({ name: 'custentity_djkk_commoncustomflg' }) ? '1' : '0'),
					// DJ_出荷案内送信区分
					dj_shippinginfosendtyp: tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custentity_djkk_shippinginfosendtyp' }),
					// DJ_先方担当者
					dj_customerrep: tmpResult.getValue({ name: 'custentity_djkk_customerrep' }),
					// DJ_出荷案内送信先区分
					dj_shippinginfodesttyp: tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custentity_djkk_shippinginfodesttyp' }),
					// DJ_出荷案内送信先会社名
					dj_shippinginfodestname: tmpResult.getValue({ name: 'custentity_djkk_shippinginfodestname' }),
					// DJ_出荷案内送信先担当者
					dj_shippinginfodestrep: tmpResult.getValue({ name: 'custentity_djkk_shippinginfodestrep' }),
					// DJ_出荷案内送付先メール
					dj_shippinginfodestemail: tmpResult.getValue({ name: 'custentity_djkk_shippinginfodestemail' }),
					// DJ_出荷案内送付先FAX
					dj_shippinginfodestfax: tmpResult.getValue({ name: 'custentity_djkk_shippinginfodestfax' }),
					// DJ_出荷案内送付先備考
					dj_shippinginfodestmemo: tmpResult.getValue({ name: 'custentity_djkk_shippinginfodestmemo' }),
					// DJ_FINET出荷案内送信フラグ
					//					dj_finetshipmentmailflg: (tmpResult.getValue({name: 'custentity_djkk_finet_shipment_mail_flg'}) ? '1' : '0'),
					//					// DJ_FINET請求送信フラグ
					//					dj_finetbillmailflg: (tmpResult.getValue({name: 'custentity_djkk_finet_bill_mail_flg'}) ? '1' : '0'),
					// DJ_注文時倉庫向け備考
					dj_sowmsmemo: tmpResult.getValue({ name: 'custentity_djkk_sowmsmemo' }),
					// DJ_注文時運送向け備考
					dj_sodeliverermemo: tmpResult.getValue({ name: 'custentity_djkk_sodeliverermemo' }),
					// DJ_価格表コード
					dj_priceListCd: tmpResult.getValue({ name: 'custrecord_djkk_pl_code_fd', join: 'custentity_djkk_pl_code_fd' }),
					// DJ_0円プライスフラグ
					dj_price0flg: (tmpResult.getValue({ name: 'custentity_djkk_price0flg' }) ? '1' : '0'),
					// DJ_外部連携コード
					//					dj_externalaligncode: tmpResult.getValue({name: 'custentity_djkk_external_align_code'}),
					// DJ_納品先都度入力許容フラグ
					dj_deliverydesteachinputflg: (tmpResult.getValue({ name: 'custentity_djkk_deliverydesteachinputflg' }) ? '1' : '0'),
					// 作成日時
					createtime: tmpCreateDate,
					// 作成者コード
					createuser: 'netsuite',
					// 最終更新日時
					lastupdatetime: tmpLastModifiedDate,
					// 最終更新者コード
					updateuser: 'netsuite',
					// 削除フラグ
					deleteflg: (tmpResult.getValue({ name: 'isinactive' }) ? '1' : '0')
				});
			}
		}

		for (var i = 0; i < allCustomerInfo.length; i++) {
			var tmpCustomerId = allCustomerInfo[i].customerid;

			if (addrInfoByCustomerId.hasOwnProperty(tmpCustomerId.toString())) {
				allCustomerInfo[i]['addressline'] = addrInfoByCustomerId[(tmpCustomerId.toString())];
			}
		}

		return allCustomerInfo;
	}

	/**
	 * 配送エリア
	 */
	function getDeliveryArea(syncDateTime) {
		var resultDeliveryArea = [];

		var filters = [];
		filters.push(["formulanumeric: TO_DATE('" + syncDateTime + "','yyyy-MM-dd HH24:MI:SS')-{lastmodified}", "lessthanorequalto", "0"]);
		var columns = [];
		columns.push(search.createColumn({ name: 'name' }));
		columns.push(search.createColumn({ name: 'custrecord_djkk_deliveryarea_id' }));
		columns.push(search.createColumn({ name: 'custrecord_djkk_itemtempapply_fromdate' }));
		columns.push(search.createColumn({ name: 'custrecord_djkk_itemtempapply_todate' }));
		columns.push(search.createColumn({ name: 'created' }));
		columns.push(search.createColumn({ name: 'lastmodified' }));
		columns.push(search.createColumn({ name: 'isinactive' }));
		var results = searchResult('customrecord_djkk_delivery_area', filters, columns);
		if (results != null && results != '') {
			for (var i = 0; i < results.length; i++) {
				var tmpResult = results[i];

				var tmpCreatedDate = tmpResult.getValue({ name: 'created' });
				var tmpLastModifiedDate = tmpResult.getValue({ name: 'lastmodified' });
				var tmpFromDate = tmpResult.getValue({ name: 'custrecord_djkk_itemtempapply_fromdate' });
				var tmpToDate = tmpResult.getValue({ name: 'custrecord_djkk_itemtempapply_todate' });
				if (tmpCreatedDate != null && tmpCreatedDate != '') {
					tmpCreatedDate = format.parse({ value: tmpCreatedDate, type: format.Type.DATE });
					tmpCreatedDate = tmpCreatedDate.getFullYear() + '年' + ('00' + (tmpCreatedDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpCreatedDate.getDate()).slice(-2) + '日 ' + ('00' + tmpCreatedDate.getHours()).slice(-2) + '時' + ('00' + tmpCreatedDate.getMinutes()).slice(-2) + '分';
				} else {
					tmpCreatedDate = '';
				}
				if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
					tmpLastModifiedDate = format.parse({ value: tmpLastModifiedDate, type: format.Type.DATE });
					tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '年' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '日 ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '時' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '分';
				} else {
					tmpLastModifiedDate = '';
				}
				if (tmpFromDate != null && tmpFromDate != '') {
					tmpFromDate = format.parse({ value: tmpFromDate, type: format.Type.DATE });
					tmpFromDate = tmpFromDate.getFullYear() + ('00' + (tmpFromDate.getMonth() + 1)).slice(-2) + ('00' + tmpFromDate.getDate()).slice(-2);
				} else {
					tmpFromDate = '';
				}
				if (tmpToDate != null && tmpToDate != '') {
					tmpToDate = format.parse({ value: tmpToDate, type: format.Type.DATE });
					tmpToDate = tmpToDate.getFullYear() + ('00' + (tmpToDate.getMonth() + 1)).slice(-2) + ('00' + tmpToDate.getDate()).slice(-2);
				} else {
					tmpToDate = '';
				}

				resultDeliveryArea.push({
					deliveryareaid: tmpResult.getValue({ name: 'custrecord_djkk_deliveryarea_id' }),
					deliveryareanm: tmpResult.getValue({ name: 'name' }),
					itemtempapplyfromdate: tmpFromDate,
					itemtempapplytodate: tmpToDate,
					createtime: tmpCreatedDate,
					createuser: 'netsuite',
					lastupdatetime: tmpLastModifiedDate,
					updateuser: 'netsuite',
					deleteflg: (tmpResult.getValue({ name: 'isinactive' }) ? '1' : '0')
				});
			}
		}
		return resultDeliveryArea;
	}

	/**
	 * セット品作成実績
	 * @param {Array} arrSetProductDatas
	 */
	function executeSetProductResults(arrSetProductDatas) {
		var params = {
			custscript_djkk_mr_ws_param: JSON.stringify(arrSetProductDatas),
			custscript_djkk_mr_ws_param_processname: 'IF_E_0090_R_NS_FRM_HFT'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms',
			params: params
		});
		updateTask.submit();
	}

	/*
	 * 転送実績
	 */
	function executeTransferRecord(datas) {
		var params = {
			custscript_djkk_mr_ws_param: JSON.stringify(datas),
			custscript_djkk_mr_ws_param_processname: 'IF_E_0060_R_NS_FRM_HFT'
		};

		var updateTask = task.create({
			taskType: task.TaskType.MAP_REDUCE,
			scriptId: 'customscript_djkk_mr_wms',
			deploymentId: 'customdeploy_djkk_mr_wms',
			params: params
		});
		updateTask.submit();
	}

	function getSection() {
		var resultDepartments = [];

		var allSubsidiaryId = getSubsidiaryIds(true);
		var subsidiaryByName = getSubsidiaryByName();

		var sectionParentNameByChildId = {};
		var sectionIdByName = {};
		var filters = [];
		var columns = [];

		filters.push(search.createFilter({
			name: 'subsidiary',
			operator: search.Operator.ANYOF,
			values: allSubsidiaryId
		}));
		columns.push(search.createColumn({ name: 'name' }));
		columns.push(search.createColumn({ name: 'namenohierarchy' }));
		columns.push(search.createColumn({ name: 'subsidiary' }));
		columns.push(search.createColumn({ name: 'isinactive' }));
		var results = searchResult(search.Type.DEPARTMENT, filters, columns);
		for (var i = 0; i < results.length; i++) {
			var tmpResult = results[i];
			var tmpId = tmpResult.id;
			var tmpParentName = tmpResult.getValue({ name: 'name' });
			if (tmpParentName.indexOf(':') >= 0) {
				tmpParentName = tmpParentName.split(' : ');
				tmpParentName = tmpParentName[(tmpParentName.length - 2)];
				sectionParentNameByChildId[(tmpId.toString())] = tmpParentName;
			}

			if (!sectionIdByName.hasOwnProperty(tmpResult.getValue({ name: 'namenohierarchy' }))) {
				sectionIdByName[(tmpResult.getValue({ name: 'namenohierarchy' }))] = tmpId.toString();
			}

			var tmpSubsidiary = tmpResult.getValue({ name: 'subsidiary' });
			var resultSubsidiarys = [];
			if (tmpSubsidiary.indexOf('1-2 DENIS JAPAN K.K.') >= 0) {
				resultSubsidiarys.push(subsidiaryByName['1-2 DENIS JAPAN K.K.'].toString());
			}
			if (tmpSubsidiary.indexOf('2-1 NICHIFUTSU BOEKI K.K.') >= 0) {
				resultSubsidiarys.push(subsidiaryByName['2-1 NICHIFUTSU BOEKI K.K.'].toString());
			}
			if (tmpSubsidiary.indexOf('3-1 UNION LIQUORS K.K.') >= 0) {
				resultSubsidiarys.push(subsidiaryByName['3-1 UNION LIQUORS K.K.'].toString());
			}

			var strResultSubsidiary = '';
			if (resultSubsidiarys.length == 1) {
				strResultSubsidiary = resultSubsidiarys[0];
			}
			if (resultSubsidiarys.length == 2) {
				strResultSubsidiary = '&' + resultSubsidiarys.join('&,&') + '&';
			}

			resultDepartments.push({
				'departmentid': tmpResult.id,
				'departmentnm': tmpResult.getValue({ name: 'namenohierarchy' }),
				'parentid': '',
				'subsidiaryid': strResultSubsidiary,
				'createtime': '',
				'createuser': 'netsuite',
				'lastupdatetime': '',
				'updateuser': 'netsuite',
				'deleteflg': (tmpResult.getValue({ name: 'isinactive' }) ? '1' : '0')
			});
		}

		var allSubsidiaryIdByName = {};
		var subsidiaryColumns = [];
		subsidiaryColumns.push(search.createColumn({ name: 'name' }));
		var subsidiaryResults = searchResult(search.Type.SUBSIDIARY, [], subsidiaryColumns);
		for (var i = 0; i < subsidiaryResults.length; i++) {
			var tmpId = subsidiaryResults[i].id;
			var tmpName = subsidiaryResults[i].getValue({ name: 'name' });

			allSubsidiaryIdByName[(tmpName.toString())] = tmpId;
		}

		for (var i = 0; i < resultDepartments.length; i++) {
			var currentId = resultDepartments[i]['departmentid'];
			var currentParentName = sectionParentNameByChildId[(currentId.toString())];
			if (sectionIdByName.hasOwnProperty(currentParentName)) {
				resultDepartments[i]['parentid'] = sectionIdByName[(currentParentName)];
			}
		}
		return resultDepartments;
	}

	function getItems() {
		log.debug({
			title: 'getItems - start',
			details: new Date()
		});

		var arrResult = [];

		var filters = [];
		var columns = [];
		columns.push(search.createColumn({
			name: 'inventorynumber'
		}));
		columns.push(search.createColumn({
			name: 'item'
		}));
		columns.push(search.createColumn({
			name: 'quantityavailable'
		}));
		var results = searchResult(search.Type.INVENTORY_NUMBER, filters, columns);
		for (var i = 0; i < results.length; i++) {
			arrResult.push({
				id: results[i].id,
				inventoryNumber: results[i].getValue({ name: 'inventorynumber' }),
				item: results[i].getValue({ name: 'item' }),
				quantity: results[i].getValue({ name: 'quantityavailable' })
			});
		}

		log.debug({
			title: 'getItems - end',
			details: new Date()
		});
		log.debug({
			title: 'getItems - length',
			details: arrResult.length
		});
		return arrResult;
	}

	function getHoliday() {
		var arrResult = [];

		var filters = [];

		var columns = [];
		columns.push(search.createColumn({ name: 'custrecord_suitel10n_jp_non_op_day_date' }));
		columns.push(search.createColumn({ name: 'name' }));
		columns.push(search.createColumn({ name: 'created' }));
		columns.push(search.createColumn({ name: 'lastmodified' }));
		columns.push(search.createColumn({ name: 'isinactive' }));

		var results = searchResult('customrecord_suitel10n_jp_non_op_day', filters, columns);

		for (var i = 0; i < results.length; i++) {
			var tmpResult = results[i];
			var tmpHolidayDate = tmpResult.getValue({ name: 'custrecord_suitel10n_jp_non_op_day_date' })
			var tmpCreatedDate = tmpResult.getValue({ name: 'created' });
			var tmpLastModifiedDate = tmpResult.getValue({ name: 'lastmodified' });

			if (tmpHolidayDate != null && tmpHolidayDate != '') {
				tmpHolidayDate = format.parse({ value: tmpHolidayDate, type: format.Type.DATE });
				tmpHolidayDate = tmpHolidayDate.getFullYear() + ('00' + (tmpHolidayDate.getMonth() + 1)).slice(-2) + ('00' + tmpHolidayDate.getDate()).slice(-2);
			} else {
				tmpHolidayDate = '';
			}

			if (tmpCreatedDate != null && tmpCreatedDate != '') {
				tmpCreatedDate = format.parse({ value: tmpCreatedDate, type: format.Type.DATE });
				tmpCreatedDate = tmpCreatedDate.getFullYear() + '年' + ('00' + (tmpCreatedDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpCreatedDate.getDate()).slice(-2) + '日 ' + ('00' + tmpCreatedDate.getHours()).slice(-2) + '時' + ('00' + tmpCreatedDate.getMinutes()).slice(-2) + '分';
			} else {
				tmpCreatedDate = '';
			}

			if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
				tmpLastModifiedDate = format.parse({ value: tmpLastModifiedDate, type: format.Type.DATE });
				tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '年' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '月' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '日 ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '時' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '分';
			} else {
				tmpLastModifiedDate = '';
			}

			arrResult.push({
                'holidayid': tmpResult.id,
				'holidaydate': tmpHolidayDate,
				'holidaynm': tmpResult.getValue({ name: 'name' }),
				'createtime': tmpCreatedDate,
				'createuser': 'netsuite',
				'lastupdatetime': tmpLastModifiedDate,
				'updateuser': 'netsuite',
				'deleteflg': (tmpResult.getValue({ name: 'isinactive' }) ? '1' : '0')
			});
		}
		return arrResult;
	}

	function getSubsidiaryByName() {
		var objResult = {};
		var columns = [];
		columns.push(search.createColumn({ name: 'namenohierarchy' }));
		var results = searchResult(search.Type.SUBSIDIARY, [], columns);
		for (var i = 0; i < results.length; i++) {
			var tmpId = results[i].id;
			var tmpName = results[i].getValue({ name: 'namenohierarchy' });

			if (!objResult.hasOwnProperty(tmpName)) {
				objResult[(tmpName.toString())] = tmpId;
			}
		}

		return objResult;
	}

	function getSubsidiaryIds(flgAddDenis) {
		var allSubsidiaryId = [];

		var allSubsidiaryByName = getSubsidiaryByName();
		var targetSubsidiaryName = [];
		targetSubsidiaryName.push('2-1 NICHIFUTSU BOEKI K.K.');
		targetSubsidiaryName.push('3-1 UNION LIQUORS K.K.');

		if (flgAddDenis) {
			targetSubsidiaryName.push('1-2 DENIS JAPAN K.K.');
		}
		for (var i = 0; i < targetSubsidiaryName.length; i++) {
			if (allSubsidiaryByName.hasOwnProperty(targetSubsidiaryName[i])) {
				var tmpId = allSubsidiaryByName[(targetSubsidiaryName[i])];
				if (allSubsidiaryId.indexOf(tmpId.toString()) < 0) {
					allSubsidiaryId.push(tmpId.toString());
				}
			}
		}
		return allSubsidiaryId;
	}

	/**
	 * 通貨コードを取得
	 * @returns
	 */
	function getCurrencyCodeById() {
		var objResult = {};
		var columns = [];
		columns.push(search.createColumn({ name: 'symbol' }));
		var results = searchResult(search.Type.CURRENCY, [], columns);
		for (var i = 0; i < results.length; i++) {
			var tmpId = results[i].id;
			var tmpCode = results[i].getValue({ name: 'symbol' });

			objResult[(tmpId.toString())] = tmpCode;
		}

		return objResult;
	}

	/**
	 * 共通検索ファンクション
	 * @param searchType 検索対象
	 * @param filters 検索条件
	 * @param columns 検索結果列
	 * @returns 検索結果
	 */
	function searchResult(searchType, filters, columns) {
		var allSearchResult = [];

		var resultStep = 1000;
		var resultIndex = 0;

		var objSearch = search.create({
			type: searchType,
			filters: filters,
			columns: columns
		});

		var resultSet = objSearch.run();
		var results = [];

		do {
			results = resultSet.getRange({ start: resultIndex, end: resultIndex + resultStep });
			if (results != null && results != '') {
				for (var i = 0; i < results.length; i++) {
					allSearchResult.push(results[i]);
					resultIndex++;
				}
			}
		} while (results.length > 0);

		return allSearchResult;
	}

	/**
	 * 
	 * @returns 
	 */
	function getStateCodeByName() {
		var stateCodeByName = {};

		var filters = [];
		var columns = [];
		columns.push(search.createColumn({ name: 'custrecord_djkk_pd_pref_id' }));

		// カスタムレコード「DJ_都道府県毎配送エリア」
		var results = searchResult('customrecord_djkk_pref_delivery_area', filters, columns);
		for (var i = 0; i < results.length; i++) {
			var tmpId = results[i].getValue({ name: 'custrecord_djkk_pd_pref_id' });
			var tmpName = results[i].getText({ name: 'custrecord_djkk_pd_pref_id' });

			if (!stateCodeByName.hasOwnProperty(tmpName)) {
				stateCodeByName[(tmpName)] = tmpId;
			}
		}
		return stateCodeByName;
	}

	/**
	 * 日付フォーマット(YYYYMMDD)
	 * @param {Date} currentDate 日付
	 * @returns {String} フォーマット後日付文字列
	 */
	function formatDate(currentDate) {
		if (currentDate != null && currentDate != '') {
			currentDate = format.parse({ value: currentDate, type: format.Type.DATE });
			currentDate = currentDate.getFullYear() + ('00' + (currentDate.getMonth() + 1)).slice(-2) + ('00' + currentDate.getDate()).slice(-2);
		} else {
			currentDate = '';
		}
		return currentDate;
	}

	/**
	 * 汎用区分ID検索
	 * @param {String|Integer} categoryCode 区分種類コード
	 * @param {String|Integer} typeCode 区分コード
	 * @return {String|Integer} 汎用区分内部ID
	 */
	function getCommonTypeId(categoryCode, typeCode) {
		var resultId = '';
		var filters = [];

		filters.push(search.createFilter({
			name: 'custrecord_djkk_category_code',
			operator: search.Operator.IS,
			values: categoryCode
		}));
		filters.push(search.createFilter({
			name: 'custrecord_djkk_type_code',
			operator: search.Operator.IS,
			values: typeCode
		}));
		var results = searchResult('customrecord_djkk_common_type', filters, []);
		if (results != null && results != '' && results.length > 0) {
			resultId = results[0].id;
		}
		return resultId;
	}

	/**
	 * 
	 */
	function getDataLocationIds() {
		var locationIds = [];

		var filters = [];
		filters.push(search.createFilter({
			name: 'isinactive',
			operator: search.Operator.IS,
			values: false
		}));
		var columns = [];
		columns.push(search.createColumn({ name: 'custrecord_djkk_exsystem_parent_location' }));
		columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_locationsendtyp' }));

		var results = searchResult(search.Type.LOCATION, filters, columns);

		var tmpParentLocationIds = [];
		for (var i = 0; i < results.length; i++) {
			var tmpResult = results[i];
			var tmpId = tmpResult.id;
			var tmpParent = tmpResult.getValue({ name: 'custrecord_djkk_exsystem_parent_location' });
			var tmpCode = tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_locationsendtyp' });

			if (tmpParent != null && tmpParent != '') {
				continue;
			}

			if (tmpParent == null || tmpParent == '') {
				if (tmpCode != '1') {
					continue;
				}
			}

			if (tmpParentLocationIds.indexOf(tmpId.toString()) < 0) {
				tmpParentLocationIds.push(tmpId.toString());
			}
		}

		var tmpLocationIds = [];
		for (var i = 0; i < results.length; i++) {
			var tmpResult = results[i];
			var tmpId = tmpResult.id;
			var tmpParent = tmpResult.getValue({ name: 'custrecord_djkk_exsystem_parent_location' });
			var tmpCode = tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custrecord_djkk_locationsendtyp' });

			if (tmpParent == null || tmpParent == '') {
				continue;
			}

			if (tmpParentLocationIds.indexOf(tmpParent.toString()) >= 0) {
				if (tmpLocationIds.indexOf(tmpId.toString()) < 0) {
					tmpLocationIds.push(tmpId.toString());
				}
			}
		}

		locationIds = tmpParentLocationIds.concat(tmpLocationIds);

		return locationIds;
	}

	function getLocationWithWmsCode() {

		var objLocationCodeById = {};

		var filters = [];
		var columns = [];
		columns.push(search.createColumn({ name: 'custrecord_djkk_wms_location_code' }));
		var results = searchResult(search.Type.LOCATION, filters, columns);
		for (var i = 0; i < results.length; i++) {
			var tmpId = results[i].id;
			var tmpCode = results[i].getValue({ name: 'custrecord_djkk_wms_location_code' });

			objLocationCodeById[(tmpId.toString())] = tmpCode;
		}
		return objLocationCodeById;
	}

	/**
	* 日本の日付を取得する
	* 
	* @returns 日本の日付
	*/
	function getJapanDateTime() {
		var now = new Date();
		var offSet = now.getTimezoneOffset();
		var offsetHours = 9 + (offSet / 60);
		now.setHours(now.getHours() + offsetHours);

		return now;
	}

});