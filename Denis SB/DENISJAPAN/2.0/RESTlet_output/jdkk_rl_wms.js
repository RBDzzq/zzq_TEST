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
					// ���׎w��
					result.data = getInStockData();
					break;
				case 'IF_E_0030_S_NS_TO_HFT':
					// �o�׎w��
					result.data = getShippingOrderData();
					break;
				case 'IF_E_0050_S_NS_TO_HFT':
					// �]���˗�
					result.data = forwardingRequest(requestBody.syncDateTime);
					break;
				case 'IF_E_0080_S_NS_TO_HFT':
					// �Z�b�g�i�쐬�˗�
					result.data = getSetProductOrder();
					break;
				case 'ERROR_ORDER_NUMBER':
					result.data = getErrorOrderNumber();
					break;
				case 'ORDER_PREPAYMENT_CONFIRMED':
					// �����O�����m�F�ς�
					result.data = getOrderPrepaymentConfirmed(requestBody.syncDateTime);
					break;
				case 'SHIPPING_HISTORY':
					// �o�ח���
					result.data = getShippingHistory(requestBody.syncDateTime);
					break;
				case 'PRICE_LIST':
					// ���i�\
					result.data = getPriceList(requestBody.syncDateTime);
					break;
				case 'CUSTOMER':
					// �ڋq
					result.data = getCustomer(requestBody.syncDateTime);
					break;
				case 'DELIVERY_AREA':
					// �z���G���A
					result.data = getDeliveryArea(requestBody.syncDateTime);
					break;
				case 'SECTION':
					// N�Z�N�V����
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
				message: 'processName���܂܂�Ă��܂���B'
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
					message: 'datas���܂܂�Ă��܂���B'
				};
				return result;
			}
		}

		switch (requestBody.processName.toString()) {
			case 'SECTION':
				// N�Z�N�V����
				result.data = getSection();
				break;
			case 'CUSTOMER':
				result.data = getCustomer(requestBody.syncDateTime);
				break;
			case 'SHIPPING_HISTORY':
				// �o�ח���
				result.data = getShippingHistory(requestBody.syncDateTime);
				break;
			case 'DELIVERY_AREA':
				// �z���G���A
				result.data = getDeliveryArea(requestBody.syncDateTime);
				break;
			case 'PRICE_LIST':
				// ���i�\
				result.data = getPriceList(requestBody.syncDateTime);
				break;
			case 'IF_E_0010_S_NS_TO_HFT':
				// ���׎w��
				result.data = getInStockData();
				break;
			case 'IF_E_0030_S_NS_TO_HFT':
				// �o�׎w��
				result.data = getShippingOrderData();
				break;
			case 'IF_E_0050_S_NS_TO_HFT':
				// �]���˗�
				result.data = forwardingRequest(requestBody.syncDateTime);
				break;
			case 'IF_E_0060_R_NS_FRM_HFT':
				// �]����
				executeTransferRecord(requestBody.datas);
				break;
			case 'IF_E_0080_S_NS_TO_HFT':
				// �Z�b�g�i�쐬�˗�
				result.data = getSetProductOrder();
				break;
			case 'ERROR_ORDER_NUMBER':
				result.data = getErrorOrderNumber();
				break;
			case 'ORDER_PREPAYMENT_CONFIRMED':
				// �����O�����m�F�ς�
				result.data = getOrderPrepaymentConfirmed(requestBody.syncDateTime);
				break;
			case 'IF_E_0020_R_NS_FRM_HFT':
				// ���׎���
				executeArrivalRecord(requestBody.datas);
				break;
			case 'IF_E_0040_R_NS_FRM_HFT':
				// �o�׎���
				executeShipmentRecord(requestBody.datas);
				break;
			case 'IF_E_0070_R_NS_FRM_HFT':
				// �݌ɐ���
				executeStockQuantity(requestBody.datas);
				break;
			case 'IF_E_0090_R_NS_FRM_HFT':
				// �Z�b�g�i�쐬����
				executeSetProductResults(requestBody.datas);
				break;
			case 'INVENTORY_TRANSFER_RESULTS':
				// �݌Ɉړ�����
				executeInventoryTransferResults(requestBody.datas);
				break;
			case 'INSERT_SALESORDER':
				// N����
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
	 * �]���˗�
	 * @param {*} syncDateTime 
	 * @returns 
	 */
	function forwardingRequest(syncDateTime) {
		var resultDatas = [];

		var updateTransactionIds = [];
		/**
		 * �A�g�ςݍX�V�Ώۏ��
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

		/** �ړ��`�[START */
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
		// ���t
		columns.push(search.createColumn({ name: 'trandate' }));
		// DJ_��������
		columns.push(search.createColumn({ name: 'custbody_djkk_completion_date' }));
		// �g�����U�N�V�����ԍ�
		columns.push(search.createColumn({ name: 'tranid' }));
		columns.push(search.createColumn({ name: 'transactionnumber' }));
		columns.push(search.createColumn({ name: 'location' }));
		columns.push(search.createColumn({ name: 'transferlocation' }));
		columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
		columns.push(search.createColumn({ name: 'custcol_djkk_remars' }));
		columns.push(search.createColumn({ name: 'quantity' }));
		// �A�C�e��.�A�C�e��ID
		columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
		// �A�C�e��.DJ_�ڊǋ敪
		columns.push(search.createColumn({ name: 'custitem_djkk_item_transfer_section', join: 'item' }));
		columns.push(search.createColumn({ name: 'inventorynumber', join: 'inventorydetail' }));
		columns.push(search.createColumn({ name: 'expirationdate', join: 'inventorydetail' }));
		columns.push(search.createColumn({ name: 'custitem_djkk_organicflg', join: 'item' }));
		columns.push(search.createColumn({ name: 'custbody_djkk_exsystem_tranid' }));
		// �A�C�e��.DJ_�J�^���O���i�R�[�h
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
				// �V�X�e�����t
				SysDate: strSystemDate,
				// �ڊǋ敪
				//				TransferType: tmpResult.getValue({ name: 'custitem_djkk_item_transfer_section', join: 'item' }),
				TransferType: 'U',
				// �ڊǏ������͓�
				TransactionDate: transactionDate,
				// ��������
				DedlineDate: completionDate,
				// �Г��[�i���ԍ�
				DeliveryDocument: tmpResult.getValue({ name: 'transactionnumber' }),
				// �ڊǑq�ɃR�[�hFrom
				WHFrom: locationFrom,
				// �ڊǑq�ɃR�[�hTo
				WHTo: locationTo,
				LineNumber: tmpResult.getValue({ name: 'custcol_djkk_exsystem_line_num' }),
				// �݌ɃR�[�hFrom
				StockCode: tmpResult.getValue({ name: 'itemid', join: 'item' }),
				// �o�b�`�ԍ�From
				BatchNumberFrom: tmpResult.getText({ name: 'inventorynumber', join: 'inventorydetail' }),
				// �ܖ�����From
				DateBestBeforeFrom: expirationDate,
				// ����From�@�i�ŏ��P�ʁj
				Qty: tmpResult.getValue({ name: 'quantity' }),
				// �o�b�`�ԍ�To�@�@
				BatchNumberTo: tmpResult.getText({ name: 'inventorynumber', join: 'inventorydetail' }),
				// ���L����
				Remarks: tmpRemarks,
				// �I�[�K�j�b�N�t���O
				OrganicFlag: (tmpResult.getValue({ name: 'custitem_djkk_organicflg', join: 'item' }) ? '1' : '0'),
				// �J�^���O�R�[�h
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
		/** �ړ��`�[END */

		/** �݌ɒ���START */
		updateTransactionIds = [];
		let inventoryAdjustmentFilters = [];

		/** �A���q��� = �u 2-1 NICHIFUTSU BOEKI K.K.�v�A�u3-1 UNION LIQUORS K.K.�v */
		let arrSubsidiaryFilters = [];
		allSubsidiaryId.map(function (subsidiaryId, index) {
			arrSubsidiaryFilters.push(['subsidiary', search.Operator.IS, subsidiaryId.toString()]);
			if (index != allSubsidiaryId.length - 1) {
				arrSubsidiaryFilters.push('OR')
			}
		});
		inventoryAdjustmentFilters.push(arrSubsidiaryFilters);
		inventoryAdjustmentFilters.push('AND');

		/** DJ_�ύX���R = �q�ɘA�g */
        inventoryAdjustmentFilters.push(['custbody_djkk_change_reason.custrecord_djkk_wh_contact_flg', search.Operator.IS, true]);
        inventoryAdjustmentFilters.push('AND');

		/** DJ_WMS���M�� = false */
		inventoryAdjustmentFilters.push(['custbody_djkk_exsystem_wms_sended', search.Operator.IS, false]);
		inventoryAdjustmentFilters.push('AND');

		/** �ŏI���M���� >= �w����� */
		// inventoryAdjustmentFilters.push(["formulanumeric: TO_DATE('" + syncDateTime + "','yyyy-MM-dd HH24:MI:SS')-{lastmodifieddate}", "lessthanorequalto", "0"]);
		// inventoryAdjustmentFilters.push('AND');

		/** ���C�����C�� = false */
		inventoryAdjustmentFilters.push(['mainline', search.Operator.IS, false]);
		inventoryAdjustmentFilters.push('AND');

		/** �ŋ����C�� = false */
		inventoryAdjustmentFilters.push(['taxline', search.Operator.IS, false]);
		inventoryAdjustmentFilters.push('AND');

		/** ���� <> 0 */
		inventoryAdjustmentFilters.push(['quantity', search.Operator.NOTEQUALTO, 0]);
		inventoryAdjustmentFilters.push('AND');

		/** ����.�ꏊ  */
		let arrLocationFilters = [];
		arrDataLocationIds.map(function (locationId, index) {
			arrLocationFilters.push(['location', search.Operator.IS, locationId.toString()]);
			if (index != arrDataLocationIds.length - 1) {
				arrLocationFilters.push('OR')
			}
		});
		inventoryAdjustmentFilters.push(arrLocationFilters);

		let inventoryAdjustmentColumns = [];
		/** ���t */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'trandate' }));
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'transactionnumber' }));
		/** �������� */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'quantity' }));
		/** ����.�ꏊ.DJ_WMS�q�ɃR�[�h */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'custrecord_djkk_wms_location_code', join: 'location' }));
		/** DJ_�O���V�X�e��_�s�ԍ� */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
		/** �A�C�e��.���i�R�[�h */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'itemid', join: 'item' }));
		/** �A�C�e��.DJ_�I�[�K�j�b�N�t���O */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'custitem_djkk_organicflg', join: 'item' }));
		/** �A�C�e��.DJ_�J�^���O���i�R�[�h */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'custitem_djkk_product_code', join: 'item' }));
		/** ����.�݌ɏڍ�.�V���A��/���b�g�ԍ� */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'inventorynumber', join: 'inventorydetail' }));
		/** ����.�݌ɏڍ�.�ܖ����� */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'expirationdate', join: 'inventorydetail' }));
		/** ����.�ꏊ */
		inventoryAdjustmentColumns.push(search.createColumn({ name: 'location' }));
        /** DJ_�������� */
        inventoryAdjustmentColumns.push(search.createColumn({ name: 'custbody_djkk_completion_date' }));
        /** DJ_���l */
        inventoryAdjustmentColumns.push(search.createColumn({ name: 'custcol_djkk_remars' }));

		let inventoryAdjustmentResults = searchResult(search.Type.INVENTORY_ADJUSTMENT, inventoryAdjustmentFilters, inventoryAdjustmentColumns);

		let objLineItemInfoById = {};
        let objResultsById = {};
		inventoryAdjustmentResults.map(function (tmpResult) {
			let tmpResultId = tmpResult.id;
			/**
			 * ����.DJ_�O���V�X�e��_���׍s�ԍ�
			 * @type {number}
			 */
			let tmpResultLineNo = tmpResult.getValue({ name: 'custcol_djkk_exsystem_line_num' });
			/**
			 * ����.�A�C�e��.DJ_�I�[�K�j�b�N�t���O
			 */
			let tmpResultItemOrganicFlg = tmpResult.getValue({ name: 'custitem_djkk_organicflg', join: 'item' });
			/**
			 * ����.�A�C�e��.DJ_�I�[�K�j�b�N�t���O
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
                /** �V�X�e�����t */
                SysDate: '',
                /** �ڊǋ敪 */
                TransferType: 'U',
                /** �ڊǏ������͓� */
                TransactionDate: '',
                /** �������� */
                DedlineDate: '',
                /** �Г��[�i���ԍ� */
                DeliveryDocument: '',
                /** �ڊǑq�ɃR�[�hFrom */
                WHFrom: '',
                /** �ڊǑq�ɃR�[�hTo */
                WHTo: '',
                /** ���׍s�ԍ� */
                LineNumber: '',
                /** �݌ɃR�[�h */
                StockCode: '',
                /** �Ǘ��ԍ�From */
                BatchNumberFrom:'',
                /** �ܖ�����From */
                DateBestBeforeFrom:'',
                /** ���� */
                Qty:'',
                /** �Ǘ��ԍ�To */
                BatchNumberTo:'',
                /** ���L���� */
                Remarks:'',
                /** �I�[�K�j�b�N�t���O */
                OrganicFlag:'',
                /** �J�^���O�R�[�h */
                ProductCode:''
            };

            arrCurrentResults.forEach(function(tmpResult, index) {
                if (index > 1) {
                    return;
                }

                let tmpResultId = tmpResult.id;

                /**
                 * ����.���t
                 */
                let tmpResultTranDate = tmpResult.getValue({ name: 'trandate' });

                if (tmpResultTranDate != null && tmpResultTranDate != '') {
                    tmpResultTranDate = format.parse({ value: tmpResultTranDate, type: format.Type.DATE });
                    tmpResultTranDate = tmpResultTranDate.getFullYear() + ('00' + (tmpResultTranDate.getMonth() + 1)).slice(-2) + ('00' + tmpResultTranDate.getDate()).slice(-2);
                } else {
                    tmpResultTranDate = '';
                }

                /**
                 * ����.�݌ɏڍ�.�L������
                 */
                let tmpResultInventoryDetailDate = tmpResult.getValue({ name: 'expirationdate', join: 'inventorydetail' });
                if (tmpResultInventoryDetailDate != null && tmpResultInventoryDetailDate != '') {
                    tmpResultInventoryDetailDate = format.parse({ value: tmpResultInventoryDetailDate, type: format.Type.DATE });
                    tmpResultInventoryDetailDate = tmpResultInventoryDetailDate.getFullYear() + ('00' + (tmpResultInventoryDetailDate.getMonth() + 1)).slice(-2) + ('00' + tmpResultInventoryDetailDate.getDate()).slice(-2);
                } else {
                    tmpResultInventoryDetailDate = '';
                }

                /**
                 * ��������
                 * @type {number}
                 */
                let tmpResultAdjustQuantity = tmpResult.getValue({ name: 'quantity' });
                /**
                 * ����.�ꏊ.DJ_WMS�q�ɃR�[�h
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

                /** �V�X�e�����t */
                objTmpResult.SysDate = strSystemDate;
                /** �ڊǋ敪 */
                objTmpResult.TransferType = 'U';
                /** �ڊǏ������͓� */
                objTmpResult.TransactionDate = tmpResultTranDate;
                /** �������� */
                objTmpResult.DedlineDate = formatDate(tmpResult.getValue({name: 'custbody_djkk_completion_date'}));
                /** �Г��[�i���ԍ� */
                objTmpResult.DeliveryDocument = tmpResult.getValue({name: 'transactionnumber'});
                /** �ڊǑq�ɃR�[�hFrom */
                if (tmpResultAdjustQuantity < 0) {
                    objTmpResult.WHFrom = tmpResultLocation;
                }
                /** �ڊǑq�ɃR�[�hTo */
                if (tmpResultAdjustQuantity >= 0) {
                    objTmpResult.WHTo = tmpResultLocation;
                }
                /** ���׍s�ԍ� */
                if (index == 0) {
                    objTmpResult.LineNumber = tmpResult.getValue({ name: 'custcol_djkk_exsystem_line_num' });
                }
                /** �݌ɃR�[�h */
                objTmpResult.StockCode = tmpResult.getValue({ name: 'itemid', join: 'item' });
                /** �Ǘ��ԍ�From */
                if (tmpResultAdjustQuantity < 0) {
                    objTmpResult.BatchNumberFrom = tmpResult.getText({ name: 'inventorynumber', join: 'inventorydetail' });
                }
                
                /** �ܖ�����From */
                if (tmpResultAdjustQuantity < 0) {
                    objTmpResult.DateBestBeforeFrom = tmpResultInventoryDetailDate;
                }
                /** ���� */
                if (tmpResultAdjustQuantity >= 0) {
                    objTmpResult.Qty = tmpResultAdjustQuantity;
                }
                
                /** �Ǘ��ԍ�To */
                if (tmpResultAdjustQuantity >= 0) {
                    objTmpResult.BatchNumberTo = tmpResult.getText({ name: 'inventorynumber', join: 'inventorydetail' });
                }
                /** ���L���� */
                if (index == 0) {
                    let tmpRemarks = tmpResult.getValue({ name: 'custcol_djkk_remars' });
                    if (tmpRemarks == null) {
                        tmpRemarks = '';
                    }
                    objTmpResult.Remarks = tmpRemarks;
                }
                /** �I�[�K�j�b�N�t���O */
                objTmpResult.OrganicFlag = (objFirstLineItemInfo.itemOrganicFlg ? '1' : '0');
                /** �J�^���O�R�[�h */
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
		/** �݌ɒ���END */

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
	 * ���׎w�����擾
	 * 
	 * @returns {Array} ���׎w���f�[�^JSON�z��
	 */
	function getInStockData() {
		// ���׎w���f�[�^
		var arrAllData = [];
		// ���׎w���ςݍX�V���
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
		// �����ݕ�����.���ח\��捞�ς� = F
		inboundFilters.push(search.createFilter({
			name: 'custrecord_djkk_arrival_complete',
			join: 'inboundshipmentitem',
			operator: search.Operator.IS,
			values: false
		}));
		// �����ݕ�.�X�e�[�^�X = �A����
		inboundFilters.push(search.createFilter({
			name: 'status',
			operator: search.Operator.IS,
			values: 'inTransit'
		}));


		var inboundColumns = [];
		// �����ݕ�����.������
		inboundColumns.push(search.createColumn({ name: 'purchaseorder' }));
		inboundColumns.push(search.createColumn({ name: 'transactionnumber', join: 'purchaseorder' }));
		// �����ݕ�.�D�׏،��ԍ�
		inboundColumns.push(search.createColumn({ name: 'billoflading' }));
		// �����ݕ�.�쐬��
		inboundColumns.push(search.createColumn({ name: 'createddate' }));
		// �����ݕ�.�R���e�i�ԍ�
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_container_no' }));
		// �����ݕ�.�V�[���ԍ�
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_seal_number' }));
		// �����ݕ�.����
		inboundColumns.push(search.createColumn({ name: 'memo' }));
		// �����ݕ�����.�\�z����
		inboundColumns.push(search.createColumn({ name: 'quantityexpected' }));
		// �����ݕ�����.�A�C�e��
		inboundColumns.push(search.createColumn({ name: 'item' }));
		// �����ݕ�����.DJ_�����ݕ����l
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_desc', join: 'inboundShipmentItem' }));
		// �����ݕ�����.���׍s�ԍ�
		inboundColumns.push(search.createColumn({ name: 'inboundshipmentitemid' }));
		// �����ݕ�.DJ_�A����i
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_transportation_means' }));
		// �����ݕ�.�D���ԍ�
		inboundColumns.push(search.createColumn({ name: 'vesselnumber' }));
		// �����ݕ�.DJ_�[�i�\���
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_delivery_date' }));
		// �����ݕ�.����
		inboundColumns.push(search.createColumn({ name: 'memo' }));
		// �����ݕ�����.PO.�d����
		inboundColumns.push(search.createColumn({ name: 'entity', join: 'purchaseorder' }));

		// �����ݕ�.DJ_�A����i
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_transportation_means' }));
		// �����ݕ�.DJ_���x
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_temperature' }));
		// �����ݕ�����.PO.�d����
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_container_size' }));
		// �����ݕ�����.��̏ꏊ
		inboundColumns.push(search.createColumn({ name: 'receivinglocation' }));
		// �����ݕ�����.��̏ꏊ.DJ_WMS�q�ɃR�[�h
		// inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_wms_location_code', join: 'receivinglocation' }));
		// DJ_������
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_arrival_date' }));
		// DJ_��{�P�ʐ���
		inboundColumns.push(search.createColumn({ name: 'custrecord_djkk_spend', join: 'inboundShipmentItem' }));
		// DJ_�o�`��
		inboundColumns.push(search.createColumn({name: 'custrecord_djkk_departure_date'}));
		// DJ_������
		inboundColumns.push(search.createColumn({name: 'custrecord_djkk_arrival_date'}));
		var inboundResults = searchResult(search.Type.INBOUND_SHIPMENT, inboundFilters, inboundColumns);
		for (i = 0; i < inboundResults.length; i++) {
			var currentResult = inboundResults[i];

			var currentInboundId = currentResult.id;


			// �����ݕ�����.��̏ꏊ
			var tmpReceivingLocation = currentResult.getValue({ name: 'receivinglocation' });
			if (tmpReceivingLocation == null || tmpReceivingLocation == '') {
				continue;
			}

			if (allLocationIds.indexOf(tmpReceivingLocation.toString()) < 0) {
				continue;
			}

			var currentInboundLineId = currentResult.getValue({ name: 'inboundshipmentitemid' });
			// ������(PO).ID
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

			// �����ݕ�����.�A�C�e��.ID ���W�v����
			var currentResultItemId = currentResult.getValue({ name: 'item' });
			if (allItemId.indexOf(currentResultItemId) < 0) {
				allItemId.push(currentResultItemId);
			}

			// �����ݕ�����.PO.�d���� ���W�v����
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
				// ���׎w����
				'SysDate': strSystemDate,
				// ���Ɉ˗���
				'TransactionDate': formatDate(currentResult.getValue({ name: 'createddate' })),
				// ������ID
				'PoId': currentResult.getValue({ name: 'purchaseorder' }),
				// �����ԍ�
				'PONumber': currentResult.getValue({ name: 'transactionnumber', join: 'purchaseorder' }),
				// �D�׏،��ԍ�
				'BLNumber': currentResult.getValue({ name: 'billoflading' }),
				// �R���e�i�ԍ�
				'ContainerNumber': currentResult.getValue({ name: 'custrecord_djkk_container_no' }),
				// �V�[���ԍ�
				'SealNumber': currentResult.getValue({ name: 'custrecord_djkk_seal_number' }),
				// �q�ɃR�[�h
				'WarehouseNumber': objLocationWmsCodeById[(currentResult.getValue({ name: 'receivinglocation' }).toString())],
				// �A�C�e��ID
				'ItemId': currentResult.getValue({ name: 'item' }),
				// �݌ɃR�[�h
				'StockCode': '',
				// �o�b�`No
				'BatchNumber': '',
				// ����
				'Qty_UnitOutDelivery': '',
				// ���i���x��
				'InspectionLevel': '',
				// ��̗\���
				'DevanDate': formatDate(currentResult.getValue({name: 'custrecord_djkk_arrival_date'})),
				// ���i�w��
				'RemarksHeader': tmpMemo,
				// �i���s1
				'DescriptionLine1': '',
				// �i���s2
				'DescriptionLine2': '',
				// �����Ɍ�
				'PcsQty': currentResult.getValue({ name: 'quantityexpected' }),
				// �ܖ�����
				'DateBestBefore': '',
				// ���l
				'RemarksItem': currentResult.getValue({ name: 'custrecord_djkk_desc', join: 'inboundShipmentItem' }),
				// JAN�R�[�h
				'LabelJANCode': '',
				//	                // �A�����@
				//	                'DeliveryMethod': currentResult.getText({name: 'custrecord_djkk_transportation_means'}),
				// �D��
				'VesselName': currentResult.getValue({ name: 'vesselnumber' }),
				// �o�`�\���
				'ExpectedLeavingPortDate': formatDate(currentResult.getValue({name: 'custrecord_djkk_departure_date'})),
				// ���`�\���
				'ExpectedEnteringPortDate': formatDate(currentResult.getValue({name: 'custrecord_djkk_arrival_date'})),
				// ���ח\���
				'ExpectedArrivalDate': formatDate(currentResult.getValue({ name: 'custrecord_djkk_delivery_date' })),
				// �q�Ɍ�������
				'WmsMemo': tmpMemo,
				// ITF�R�[�h
				'ITFCode': '',
				// PO�s�ԍ�
				'POLineNum': '',
				// �d����R�[�h
				'SupplierCode': '',
				// �d���於��
				'SupplierName': '',
				// PO.�d����ID
				'PoEntityId': currentResult.getValue({ name: 'entity', join: 'purchaseorder' }),
				// �A����i
				'TransportationMeans': currentResult.getText({ name: 'custrecord_djkk_transportation_means' }),
				// ���x
				'Temperature': currentResult.getText({ name: 'custrecord_djkk_temperature' }),
				// �R���e�i�T�C�Y
				'ContainerSize': currentResult.getText({ name: 'custrecord_djkk_container_size' }),
				// �I�[�K�j�b�N�t���O
				'OrganicFlag': '0',
				// �J�^���O�R�[�h
				'ProductCode': ''
			};
			arrAllData.push(tmpObjInboundShipment);
		}

		// �G���e�B�e�B���擾
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

		// �A�C�e�������擾
		var allItemInfo = {};
		if (allItemId.length > 0) {
			var itemFilters = [];
			itemFilters.push({
				name: 'internalid',
				operator: search.Operator.ANYOF,
				values: allItemId
			});
			var itemColumns = [];
			// ���i�R�[�h
			itemColumns.push(search.createColumn({ name: 'itemid' }));
			// DJ_����
			itemColumns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity' }));
			// DJ_���i���x��
			itemColumns.push(search.createColumn({ name: 'custitem_djkk_inspection_level' }));
			// UPC�R�[�h
			itemColumns.push(search.createColumn({ name: 'upccode' }));
			// DJ_�i���i���{��jLINE1
			itemColumns.push(search.createColumn({ name: 'custitem_djkk_product_name_jpline1' }));
			// DJ_�i���i���{��jLINE2
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
			// ����ID
			poFilters.push(search.createFilter({
				name: 'internalid',
				operator: search.Operator.ANYOF,
				values: allPoId
			}));

			var poColumns = [];
			// ������.�ꏊ.DJ_WMS�q�ɃR�[�h
			poColumns.push(search.createColumn({ name: 'custrecord_djkk_wms_location_code', join: 'location' }));
			// ����������.�A�C�e��
			poColumns.push(search.createColumn({ name: 'item' }));
			// ����������.��̗\���
			poColumns.push(search.createColumn({ name: 'expectedreceiptdate' }));
			// ����������.�݌ɏڍ�.ID
			poColumns.push(search.createColumn({ name: 'internalid', join: 'inventorydetail' }));
			// ����������.�s�ԍ�
			poColumns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
			// ������.�d����.�d����R�[�h
			poColumns.push(search.createColumn({ name: 'entityid', join: 'vendor' }));
			// ������.�d����.�d���於
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
			// �݌ɏڍז���.�Ǘ��ԍ�
			inventoryDetailColumns.push(search.createColumn({ name: 'custrecord_djkk_control_number', join: 'inventoryDetailLines' }));
			// �݌ɏڍז���.�V���A��/���b�g
			inventoryDetailColumns.push(search.createColumn({ name: 'inventorynumber' }));
			// �݌ɏڍז���.�L������
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

		// ���������ɍ݌ɏڍ׏�����������
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

					// �q�ɃR�[�h
					//				tmpData['WarehouseNumber'] = tmpPoInventoryInfos[0].locationCode;
					// �o�b�`No
					tmpData['BatchNumber'] = tmpPoInventoryInfos[0].inventoryDetailIssueNumber;
					// ��̗\���
					if (tmpPoInfo != null && tmpPoInfo != '') {
						// tmpData['DevanDate'] = formatDate(tmpPoInfo[0].expectedReceiptDate);
					}
					// �ܖ�����
					tmpData['DateBestBefore'] = formatDate(tmpPoInventoryInfos[0].inventoryDetailExpirationDate);
					// ���l
					//tmpData['RemarksItem'] = tmpPoInventoryInfos[0].inventoryDetailIssueNumber + tmpData['RemarksItem'];

					// �q�ɃR�[�h
					//							tmpData['WarehouseNumber'] = tmpPoInventoryInfos[j].locationCode;
					// �o�b�`No
					tmpData['BatchNumber'] = tmpPoInventoryInfos[j].inventoryDetailIssueNumber;
					// ��̗\���
					if (tmpPoInfo != null && tmpPoInfo != '') {
						// tmpData['DevanDate'] = formatDate(tmpPoInfo[0].expectedReceiptDate);
					}
					// �ܖ�����
					tmpData['DateBestBefore'] = formatDate(tmpPoInventoryInfos[j].inventoryDetailExpirationDate);
					// ���l
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
				// �݌ɃR�[�h
				arrResultData[i]['StockCode'] = tmpItemInfo['itemid'];
				// ����
				arrResultData[i]['Qty_UnitOutDelivery'] = tmpItemInfo['custitem_djkk_perunitquantity'];
				// ���i���x��
				arrResultData[i]['InspectionLevel'] = tmpInspectionLevel;
				// �i���s1
				arrResultData[i]['DescriptionLine1'] = tmpItemInfo['custitem_djkk_product_name_jpline1'];
				// �i���s2
				arrResultData[i]['DescriptionLine2'] = tmpItemInfo['custitem_djkk_product_name_jpline2'];
				// JAN�R�[�h
				arrResultData[i]['LabelJANCode'] = tmpItemInfo['upccode'];
				// ITF�R�[�h
				arrResultData[i]['ITFCode'] = tmpItemInfo['custitem_djkk_itf_code'];
				arrResultData[i]['OrganicFlag'] = (tmpItemInfo['custitem_djkk_organicflg'] ? '1' : '0');
				// �J�^���O�R�[�h
				arrResultData[i]['ProductCode'] = tmpItemInfo['custitem_djkk_product_code'];
			}
			if (allEntityInfo.hasOwnProperty(tmpEntityId.toString())) {
				var tmpEntityInfo = allEntityInfo[(tmpEntityId.toString())];
				arrResultData[i]['SupplierCode'] = tmpEntityInfo['entityId'];
				arrResultData[i]['SupplierName'] = tmpEntityInfo['companyName'];
			}
		}

		/**
		 * ���ʃf�[�^�\�[�g
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

		// �߂�l���ڐ���(���W�b�N�Ŏg�p�������ڂ��폜)
		arrResultData.forEach(function (x) {
			delete x['PoId'];
			delete x['ItemId'];
			delete x['PoEntityId'];
		});


		/** �݌ɒ����f�[�^ START */

		var arrAllInventoryAdjustmentResults = [];

		var arrInventoryAdjustmentFilters = [];
		/** �A�g�q��� */
		arrInventoryAdjustmentFilters.push(search.createFilter({
			name: 'subsidiary',
			operator: search.Operator.ANYOF,
			values: allSubsidiaryId
		}));
		/** DJ_WMS���M�ς� */
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
			values: '�݌ɕi�f�[�^�C���i�q�ɘA�g�j'
		}));

		var arrInventoryAdjustmentColumns = [];
		/** �쐬���� */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'datecreated'}));
		/** �g�����U�N�V�����ԍ� */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'transactionnumber'}));
		/** ���� */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'memo'}));
		/** DJ_�O���V�X�e��_�s�ԍ� */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custcol_djkk_exsystem_line_num'}));
		/** �ꏊ */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'location'}));
		/** �A�C�e��.�I�[�K�j�b�N�t���O */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_organicflg', join: 'item'}));
		/** �A�C�e��.DJ_�J�^���O���i�R�[�h */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_product_code', join: 'item'}));
		/** �A�C�e��.DJ_ITFCODE */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_itf_code', join: 'item'}));
		/** �A�C�e��.UPC�R�[�h */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'upccode', join: 'item'}));
		/** �A�C�e��.DJ_�i���i���{��jLINE1 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_product_name_jpline1', join: 'item'}));
		/** �A�C�e��.DJ_�i���i���{��jLINE2 */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_product_name_jpline2', join: 'item'}));
		/** �A�C�e��.DJ_���i���x�� */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_inspection_level', join: 'item'}));
		/** �A�C�e��.DJ_���� */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custitem_djkk_perunitquantity', join: 'item'}));
		/** �A�C�e��.���i�R�[�h */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'itemid', join: 'item'}));
		/** �������� */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'quantity'}));
		/** �ꏊ.DJ_WMS_�q�ɃR�[�h */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custrecord_djkk_wms_location_code', join: 'location'}));
		/** �݌ɏڍ�.����ID */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'internalid', join: 'inventorydetail'}));
		/** ���׍s�ԍ� */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'line'}));
		/** DJ_�������� */
		arrInventoryAdjustmentColumns.push(search.createColumn({name: 'custbody_djkk_completion_date'}));

		var arrInventoryAdjustmentResults = searchResult(search.Type.INVENTORY_ADJUSTMENT, arrInventoryAdjustmentFilters, arrInventoryAdjustmentColumns);

		var objIaResultInfo = {};
		/**
		 * �݌ɒ���.�݌ɏڍ�.����ID
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
				// �A�C�e��.���i�R�[�h
				itemCode: iaResult.getValue({name: 'itemid', join: 'item'}),
				// �A�C�e��.DJ_����
				itemPerUnitQuantity: iaResult.getValue({name: 'custitem_djkk_perunitquantity', join: 'item'}),
				// ���i���x��
				inspectionLevel: iaResult.getValue({name: 'custitem_djkk_inspection_level', join: 'item'}),
				// DJ_�i���i���{��jLINE1
				itemNameLine1: iaResult.getValue({name: 'custitem_djkk_product_name_jpline1', join: 'item'}),
				// DJ_�i���i���{��jLINE2
				itemNameLine2: iaResult.getValue({name: 'custitem_djkk_product_name_jpline2', join: 'item'}),
				// �A�C�e��.UPC�R�[�h
				itemUpcCode: iaResult.getValue({name: 'upccode', join: 'item'}),
				// �A�C�e��.DJ_ITFCODE
				itemItfCode: iaResult.getValue({name: 'custitem_djkk_itf_code', join: 'item'}),
				// DJ_�O���V�X�e��_�s�ԍ�
				lineNum: iaResult.getValue({name: 'custcol_djkk_exsystem_line_num'}),
				// �A�C�e��.�I�[�K�j�b�N�t���O
				organicFlg: iaResult.getValue({name: 'custitem_djkk_organicflg', join: 'item'}),
				// �A�C�e��.DJ_�J�^���O���i�R�[�h
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
		/** �݌ɏڍ�.�V���A��/���b�g�ԍ� */
		arrIaInventoryDetailColumns.push(search.createColumn({name: 'inventorynumber'}));
		/** �݌ɏڍ�.�ܖ����� */
		arrIaInventoryDetailColumns.push(search.createColumn({name: 'expirationdate'}));
		/** �݌ɏڍ�.DJ_���[�J�[�������b�g�ԍ� */
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
				// ���׎w����
				'SysDate': strSystemDate,
				// ���Ɉ˗���
				'TransactionDate': formatDate(iaResult.getValue({ name: 'datecreated' })),
				// �����ԍ�
				'PONumber': iaResult.getValue({name: 'transactionnumber'}),
				// �D�׏،��ԍ�
				'BLNumber': '',
				// �R���e�i�ԍ�
				'ContainerNumber': '',
				// �V�[���ԍ�
				'SealNumber': '',
				// �q�ɃR�[�h
				'WarehouseNumber': iaResult.getValue({name: 'custrecord_djkk_wms_location_code', join: 'location'}),
				// �݌ɃR�[�h
				'StockCode': iaResult.getValue({name: 'itemid', join: 'item'}),
				// �Ǘ��ԍ�
				'BatchNumber': '',
				// ����
				'Qty_UnitOutDelivery': iaResult.getValue({name: 'custitem_djkk_perunitquantity', join: 'item'}),
				// ���i���x��
				'InspectionLevel': tmpItemInspectionLevel,
				// ��̗\���
				'DevanDate': formatDate(iaResult.getValue({name: 'custbody_djkk_completion_date'})),
				// ���i�w��
				'RemarksHeader': iaResult.getValue({name: 'memo'}),
				// �i���s1
				'DescriptionLine1': iaResult.getValue({name: 'custitem_djkk_product_name_jpline1', join: 'item'}),
				// �i���s2
				'DescriptionLine2': iaResult.getValue({name: 'custitem_djkk_product_name_jpline2', join: 'item'}),
				// �����Ɍ�
				'PcsQty': iaResult.getValue({name: 'quantity'}),
				// �ܖ�����
				'DateBestBefore': '',
				// ���l
				'RemarksItem': '',
				// JAN�R�[�h
				'LabelJANCode': iaResult.getValue({name: 'upccode', join: 'item'}),
				// �D��
				'VesselName': '',
				// �o�`�\���
				'ExpectedLeavingPortDate': '',
				// ���`�\���
				'ExpectedEnteringPortDate': '',
				// ���ח\���
				'ExpectedArrivalDate': strSystemDate,
				// �q�Ɍ�������
				'WmsMemo': iaResult.getValue({name: 'memo'}),
				// ITF�R�[�h
				'ITFCode': iaResult.getValue({name: 'custitem_djkk_itf_code', join: 'item'}),
				// PO�s�ԍ�
				'POLineNum': iaResult.getValue({name: 'custcol_djkk_exsystem_line_num'}),
				// �d����R�[�h
				'SupplierCode': '',
				// �d���於��
				'SupplierName': '',
				// �A����i
				'TransportationMeans': '',
				// ���x
				'Temperature': '',
				// �R���e�i�T�C�Y
				'ContainerSize': '',
				// �I�[�K�j�b�N�t���O
				'OrganicFlag': (iaResult.getValue({name: 'custitem_djkk_organicflg', join: 'item'}) ? '1' : '0'),
				// �J�^���O�R�[�h
				'ProductCode': iaResult.getValue({name: 'custitem_djkk_product_code', join: 'item'})
			};

			/**
			 * �݌ɏڍ�.����ID
			 */
			var tmpIaInventoryDetailId = iaResult.getValue({name: 'internalid', join: 'inventorydetail'});
			if (tmpIaInventoryDetailId != null && tmpIaInventoryDetailId != '' && objIaInventoryDetailInfo.hasOwnProperty(tmpIaInventoryDetailId.toString())) {
				var tmpCurrentInventoryDetail = objIaInventoryDetailInfo[(tmpIaInventoryDetailId.toString())];

				tmpCurrentInventoryDetail.map(function(tmpInventoryDetailInfo) {
					/** �Ǘ��ԍ� */
					tmpObjInventoryAdjustment['BatchNumber'] = tmpInventoryDetailInfo['serialNumber'];
					/** �ܖ����� */
					tmpObjInventoryAdjustment['DateBestBefore'] = tmpInventoryDetailInfo['expirationDate'];
					/** ���l */
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
	 * ���׎��ю捞���s
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
	 * �݌Ɉړ�����
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
	 * �Z�b�g�i�]���˗�
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

		// DJ_�ڊǋ敪 ���擾
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
        // DJ_����ރt���O
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
        // �A�C�e��.DJ_���i�O���[�v
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
				// �V�X�e�����t
				SysDate: strSystemDate,
				// �ڊǋ敪
				TransferType: tmpTransferType,
				// �ڊǏ������͓�
				TransactionDate: formatDate(tmpResult.getValue({ name: 'trandate' })),
				// ��������
				DedlineDate: formatDate(tmpResult.getValue({ name: 'enddate' })),
				// �Г��[�i���ԍ�
				DeliveryDocument: tmpResult.getValue({ name: 'transactionnumber' }),
				// �ڊǑq�ɃR�[�hTo
				WHTo: tmpResult.getValue({ name: 'custrecord_djkk_wms_location_code', join: 'location' }),
				// �݌ɃR�[�hTo
				StockCodeTo: tmpResult.getValue({ name: 'itemid', join: 'custbody_djkk_exsystem_wo_assembly' }),
				// �o�b�`�ԍ�To
				BatchNumberTo: tmpResult.getValue({ name: 'custbody_djkk_exsystem_wo_assembly_lot' }),
				// ����To
				QtyTo: tmpResult.getValue({ name: 'custbody_djkk_exsystem_wo_quantity' }),
				DateBestBeforeTo: formatDate(tmpResult.getValue({ name: 'custbody_djkk_exsystem_wo_expiratedate' })),
				LineNumber: tmpResult.getValue({ name: 'custcol_djkk_exsystem_line_num' }),
				// �ڊǑq�ɃR�[�hFrom
				WHFrom: tmpResult.getValue({ name: 'custrecord_djkk_wms_location_code', join: 'location' }),
				// �݌ɃR�[�hFrom
				StockCodeFrom: tmpResult.getValue({ name: 'itemid', join: 'item' }),
				// �o�b�`�ԍ�From
				BatchNumberFrom: tmpResult.getText({ name: 'inventorynumber', join: 'inventorydetail' }),
				// �ܖ�����From
				DateBestBeforeFrom: formatDate(tmpResult.getValue({ name: 'expirationdate', join: 'inventorydetail' })),
				// ����From�i�ŏ��P�ʁj
				QtyFrom: tmpResult.getValue({ name: 'quantity' }),
				// ���L����
				Remarks: tmpMemo,
				// �I�[�K�j�b�N�t���O
				OrganicFlag: (tmpResult.getValue({ name: 'custitem_djkk_organicflg', join: 'item' }) ? '1' : '0'),
				// �����i�I�[�K�j�b�N�t���O
				FgOrganicFlag: (tmpResult.getValue({ name: 'custitem_djkk_organicflg', join: 'custbody_djkk_exsystem_wo_assembly' }) ? '1' : '0'),
				// �J�^���O�R�[�h
				ProductCode: tmpResult.getValue({ name: 'custitem_djkk_product_code', join: 'item' }),
				// �����i�J�^���O�R�[�h
				FgProductCode: tmpResult.getValue({ name: 'custitem_djkk_product_code', join: 'custbody_djkk_exsystem_wo_assembly' }),
                // ����ރt���O
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
	 * �o�׎w��
	 */
	function getShippingOrderData() {
		// �݌Ɉړ��f�[�^(��藤�� �� ��藤��)
		var arrayResultTransfer = [];
		// �o�׈˗��f�[�^(��藤�� �� ��藤���ȊO)
		var arrayResultShipping = [];

		var subsidiaryIds = getSubsidiaryIds(false);

		var strSystemDate = new Date();

		strSystemDate = strSystemDate.getFullYear()
			+ ("00" + (strSystemDate.getMonth() + 1)).slice(-2)
			+ ("00" + (strSystemDate.getDate() + 1)).slice(-2);

		var arrKawasakiLocationIds = [];
		// �ėp�敪.�q�ɘA�g�敪.�f�[�^�̃��R�[�hID���擾
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

		// DJ_�ڊǋ敪 ���擾
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
			// �A��
			filters.push(search.createFilter({
				name: 'subsidiary',
				operator: search.Operator.ANYOF,
				values: subsidiaryIds
			}));
			var columns = [];
			// �����ԍ�
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
			// ���t
			columns.push(search.createColumn({ name: 'trandate' }));
			// DJ_��������
			columns.push(search.createColumn({ name: 'custbody_djkk_completion_date' }));
			// �g�����U�N�V�����ԍ�
			columns.push(search.createColumn({ name: 'tranid' }));
			// �ړ���
			columns.push(search.createColumn({ name: 'location' }));
			// �ړ���
			columns.push(search.createColumn({ name: 'transferlocation' }));
			// ����.�A�C�e��.���i�R�[�h
			columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
			// ����.�A�C�e��.DJ_�ڊǋ敪
			columns.push(search.createColumn({ name: 'custitem_djkk_item_transfer_section', join: 'item' }));
			// ����.�݌ɏڍ�.�L������
			columns.push(search.createColumn({ name: 'expirationdate', join: 'inventorydetail' }));
			// ����.�݌ɏڍ�.�Ǘ��ԍ�
			columns.push(search.createColumn({ name: 'inventorynumber', join: 'inventorydetail' }));
			// ����.�ړ�����
			columns.push(search.createColumn({ name: 'quantity' }));
			// ����.DJ_���l
			columns.push(search.createColumn({ name: 'custcol_djkk_remars' }));
			// ����.�s�ԍ�
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
					// �݌Ɉړ��f�[�^�ł���ꍇ

					arrayResultTransfer.push({
						// �V�X�e�����t
						SysDate: strSystemDate,
						// �ڊǋ敪
						TransferType: transferSections[(tmpResult.getValue({ name: 'custitem_djkk_item_transfer_section', join: 'item' }).toString())],
						// �ڊǏ������͓�
						TransactionDate: tmpResult.getValue({ name: 'trandate' }),
						// ��������
						DedlineDate: tmpResult.getValue({ name: 'custbody_djkk_completion_date' }),
						// �Г��[�i���ԍ�
						DeliveryDocument: tmpResult.getValue({ name: 'tranid' }),
						// �ڊǑq�ɃR�[�hFrom
						WHFrom: tmpFromLocation,
						// �ڊǑq�ɃR�[�hTo
						WHTo: tmpToLocation,
						// �݌ɃR�[�hFrom
						StockCodeFrom: tmpResult.getValue({ name: 'itemid', join: 'item' }),
						// �o�b�`�ԍ�From
						BatchNumberFrom: tmpResult.getValue({ name: 'inventorynumber', join: 'inventorydetail' }),
						// �ܖ�����From
						DateBestBeforeFrom: tmpResult.getValue({ name: 'expirationdate', join: 'inventorydetail' }),
						// ����From�i�ŏ��P�ʁj
						QtyFrom: tmpResult.getValue({ name: 'quantity' }),
						// �݌ɃR�[�hTo
						StockCodeTo: tmpResult.getValue({ name: 'itemid', join: 'item' }),
						// �o�b�`�ԍ�To
						BatchNumberTo: tmpResult.getValue({ name: 'inventorynumber', join: 'inventorydetail' }),
						// ����To
						QtyTo: tmpResult.getValue({ name: 'quantity' }),
						// ���L����
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

					// �o�׈˗��f�[�^�ł���ꍇ
					arrayResultShipping.push({
						// �V�X�e�����t
						SysDate: strSystemDate,
						// �󒍔ԍ�
						OrderNumber: tmpResult.getValue({ name: 'tranid' }),
						// ���
						OrderType: 'salesorder',
						// ���׍s�ԍ�
						LineNumber: tmpResult.getValue({ name: 'line' }),
						// TODO �^���Ǝ҃R�[�h
						WayofDelCode: '',
						// �^���ƎҖ�
						WayofDelDesc: '',
						// �^�����l
						ShipmentMark: tmpResult.getValue({ name: 'custbody_djkk_wmsmemo1' }),
						// �[�i�����l
						AddressText: tmpResult.getValue({ name: 'custbody_djkk_deliverynotememo' }),
						// �z����R�[�h
						DelvCode: tmpResult.getValue({ name: 'shipto' }),
						// �z���於1
						DelvName1: tmpResult.getValue({ name: 'addressee', join: 'shippingaddress' }).subString(0, 20),
						// �z���於2
						DelvName2: tmpResult.getValue({ name: 'addressee', join: 'shippingaddress' }).subString(20),
						// �z����Z��1
						DelvAddress1: tmpState,
						// �z����Z��2
						DelvAddress2: (tmpResult.getValue({ name: 'city', join: 'shippingaddress' }) + tmpResult.getValue({ name: 'address2', join: 'shippingaddress' }) + tmpResult.getValue({ name: 'address3', join: 'shippingaddress' })).subString(0, 35),
						// �z����Z��3
						DelvAddress3: tmpResult.getValue({ name: 'addressee', join: 'shippingaddress' }).subString(0, 35),
						// �z����X�֔ԍ�
						DelvZipCode: tmpResult.getValue({ name: 'zip', join: 'shippingaddress' }),
						// �z����TEL
						DelvTel: tmpResult.getValue({ name: 'phone', join: 'shippingaddress' }),
						// �z����FAX
						DelvFax: tmpResult.getValue({ name: 'custrecord_djkk_address_fax', join: 'shippingaddress' }),
						// �z���撍���ԍ�
						CustomerPONo: tmpResult.getValue({ name: 'tranid' }),
						// �w����R�[�h
						CustCodeInvoicing: tmpResult.getValue({ name: 'entityid', join: 'customer' }),
						// �w���於��
						CustomerName: tmpResult.getValue({ name: 'companyname', join: 'customer' }),
						// �[�i��
						DelDate: formatDate(tmpResult.getValue({ name: 'custbody_djkk_delivery_date' })),
						// �݌ɃR�[�h
						StockCode: tmpResult.getValue({ name: 'itemid', join: 'item' }),
						// �i���s1
						DescriptionLine1: tmpResult.getValue({ name: 'custitem_djkk_product_name_jpline1', join: 'item' }),
						// �i���s2
						DescriptionLine2: tmpResult.getValue({ name: 'custitem_djkk_product_name_jpline2', join: 'item' }),
						// �o�׌�
						Qty: tmpResult.getValue({ name: 'quantity' }),
						// �o�b�`�ԍ�
						BatchNumber: '',
						// NBKK�I�[�_�[���͎Җ�
						UserName: tmpResult.getValue({ name: 'entityid', join: 'salesrep' }),
						// ��Ǝw���Ȃ�
						TextLine5: tmpResult.getValue({ name: 'custbody_djkk_wmsmemo1' }),
						// ��Ǝw���Ȃ�
						TextLine2: tmpResult.getValue({ name: 'custbody_djkk_wmsmemo2' }),
						// ��Ǝw���Ȃ�
						TextLine4: tmpResult.getValue({ name: 'custcol_djkk_wms_line_memo' }),
						// ��Ǝw���Ȃ�
						TextLine1: '',
						// �q�ɃR�[�h
						WarehouseNumber: tmpResult.getValue({ name: 'location' }),
						// ��Ǝw���Ȃ�
						TextScala: tmpResult.getValue({ name: 'custbody_djkk_wmsmemo3' }),
						// �ܖ�����
						DateBestBefore: tmpResult.getValue({ name: 'expirationdate', join: 'inventorydetail' }),
						// �W��t���O
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
	 * �o�׎��ю捞���s
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
	 * �݌ɐ��ʎ�荞�ݎ��s
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
	 * DJ_�O���V�X�e��_�����쐬�G���[ �擾
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
	 * �����O�����m�F�ςݎ擾
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

		// �����ԍ�
		columns.push(search.createColumn({ name: 'custbody_djkk_exsystem_tranid' }));

		// �����˗�ID
		columns.push(search.createColumn({ name: 'custbody_djkk_orderrequestid' }));
		columns.push(search.createColumn({ name: 'lastmodifieddate' }));

		var searchResults = searchResult(search.Type.SALES_ORDER, filters, columns);

		var allResultOrderNo = [];

		for (var i = 0; i < searchResults.length; i++) {
			var currentResult = searchResults[i];
			var currentModifiedDate = currentResult.getValue({ name: 'lastmodifieddate' });

			// ����ID
			var tmpId = currentResult.id;

			// �����ԍ�
			var tmpOrderNo = currentResult.getValue({ name: 'custbody_djkk_exsystem_tranid' });

			// �����˗�ID
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
						tmpCreateDate = tmpCreateDate.getFullYear() + '�N' + ('00' + (tmpCreateDate.getMonth() + 1)).slice(-2) + '��' + ('00' + tmpCreateDate.getDate()).slice(-2) + '�� ' + ('00' + tmpCreateDate.getHours()).slice(-2) + '��' + ('00' + tmpCreateDate.getMinutes()).slice(-2) + '��';
					} else {
						tmpCreateDate = '';
					}

					if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
						tmpLastModifiedDate = format.parse({ value: tmpLastModifiedDate, type: format.Type.DATE });
						tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '�N' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '��' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '�� ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '��' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '��';
					} else {
						tmpLastModifiedDate = '';
					}

					resultShippingHistory.push({
						// �Q�Ɣԍ�
						'tranid': tmpResult.getValue(resultSet.columns[0]),
						// �[����ID
						'deliverydestid': tmpResult.getValue(resultSet.columns[1]),
						// ���i�R�[�h
						'itemid': tmpResult.getValue(resultSet.columns[2]),
						// �o�ד�
						'shippingdate': tmpShippingDate,
						// �Ǘ��ԍ�
						'manageno': tmpResult.getText(resultSet.columns[4]),
						// ����
						'quantity': tmpResult.getValue(resultSet.columns[5]),
						// �ܖ�����
						'expdate': tmpExpdate,
						// ���b�g�ԍ�
						'lotno': tmpResult.getValue(resultSet.columns[7]),
						// �����ԍ�
						'soid': tmpResult.getValue(resultSet.columns[8]),
						// �쐬����
						'createtime': tmpCreateDate,
						// �쐬�҃R�[�h
						'createuser': 'netsuite',
						// �ŏI�X�V����
						'lastupdatetime': tmpLastModifiedDate,
						// �ŏI�X�V�҃R�[�h
						'updateuser': 'netsuite',
						// �폜�t���O
						'deleteflg': '0'
					});
					resultIndex++;
				}
			}
		} while (results.length > 0);

		// �[�i��R�[�h�𐮗�
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

		// �폜���ꂽ�z�����擾
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
					// �Q�Ɣԍ�
					'tranid': deletedResults[i].getValue({ name: 'name' }),
					// �[����ID
					'deliverydestid': '',
					// ���i�R�[�h
					'itemid': '',
					// �o�ד�
					'shippingdate': '',
					// �Ǘ��ԍ�
					'manageno': '',
					// ����
					'quantity': '',
					// �ܖ�����
					'expdate': '',
					// ���b�g�ԍ�
					'lotno': '',
					// �����ԍ�
					'soid': '',
					// �쐬����
					'createtime': '',
					// �쐬�҃R�[�h
					'createuser': '',
					// �ŏI�X�V����
					'lastupdatetime': '',
					// �ŏI�X�V�҃R�[�h
					'updateuser': '',
					// �폜�t���O
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
			// DJ_���i�\.����ID
			columns.push(search.createColumn({
				name: 'internalid',
				join: 'custrecord_djkk_pldt_pl_fd',
				sort: search.Sort.ASC
			}));
			// �s�ԍ�
			columns.push(search.createColumn({
				name: 'internalid',
				sort: search.Sort.ASC
			}));
			// DJ_���i�\.�쐬����
			columns.push(search.createColumn({
				name: 'created',
				join: 'custrecord_djkk_pldt_pl_fd',
			}));
			// DJ_���i�\.�ŏI�X�V����
			columns.push(search.createColumn({
				name: 'lastmodified',
				join: 'custrecord_djkk_pldt_pl_fd',
			}));
			// DJ_���i�\.DJ_���i�\���O
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pl_name_fd',
				join: 'custrecord_djkk_pldt_pl_fd'
			}));
			// DJ_���i�\.DJ_���i�\�R�[�h
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pl_code_fd',
				join: 'custrecord_djkk_pldt_pl_fd'
			}));
			// DJ_���i�\.DJ_���i�\�ʉ�
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pl_price_currency_fd',
				join: 'custrecord_djkk_pldt_pl_fd'
			}));
			// DJ_���i�R�[�h.�A�C�e��ID
			columns.push(search.createColumn({
				name: 'itemid',
				join: 'custrecord_djkk_pldt_itemcode_fd'
			}));
			// DJ_�J�n��
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pl_startdate_fd'
			}));
			// DJ_����
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pldt_quantity_fd'
			}));
			// DJ_�I����
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pl_enddate_fd'
			}));
			// DJ_��{�̔����i
			columns.push(search.createColumn({
				name: 'custrecord_djkk_pldt_saleprice_fd'
			}));
			// DJ_���ʃx�[�X���i
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
						tmpCreateDate = tmpCreateDate.getFullYear() + '�N' + ('00' + (tmpCreateDate.getMonth() + 1)).slice(-2) + '��' + ('00' + tmpCreateDate.getDate()).slice(-2) + '�� ' + ('00' + tmpCreateDate.getHours()).slice(-2) + '��' + ('00' + tmpCreateDate.getMinutes()).slice(-2) + '��';
					} else {
						tmpCreateDate = '';
					}

					if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
						tmpLastModifiedDate = format.parse({ value: tmpLastModifiedDate, type: format.Type.DATE });
						tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '�N' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '��' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '�� ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '��' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '��';
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
						// DJ_���i�\.ID
						headerId: tmpHeaderId,
						// �s�ԍ�
						linenum: searchResults[i].getValue({ name: 'internalid' }),
						// ���i�\�R�[�h
						priceListCode: searchResults[i].getValue({ name: 'custrecord_djkk_pl_code_fd', join: 'custrecord_djkk_pldt_pl_fd' }),
						// ���i�\����
						name: searchResults[i].getValue({ name: 'custrecord_djkk_pl_name_fd', join: 'custrecord_djkk_pldt_pl_fd' }),
						// �ʉ�
						currency: tmpCurrencyId,
						// ���i�R�[�h
						itemCode: tmpItemCode,
						// �K�p�J�n��
						startDate: tmpStartDate,
						// �K�p�I����
						endDate: tmpEndDate,
						// ���ʃx�[�X���i
						basePrice: searchResults[i].getValue({ name: 'custrecord_djkk_pldt_cod_price_fd' }),
						// ��{�̔����i
						baseSalesPrice: searchResults[i].getValue({ name: 'custrecord_djkk_pldt_saleprice_fd' }),
						// ����
						quantity: searchResults[i].getValue({ name: 'custrecord_djkk_pldt_quantity_fd' }),
						// ����
						isInactive: searchResults[i].getValue({ name: 'isinactive', join: 'custrecord_djkk_pldt_pl_fd' }),
						// �쐬����
						headerCreateDate: tmpCreateDate,
						// �ŏI�X�V����
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

				// �s�ԍ�����Ƀ\�[�g
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
					// ��s�����Ȃ��A���@DJ_�������x�[�X���i ��NULL�ł���ꍇ
					lineDatas.push({
						// ���i�R�[�h
						itemid: currentDatas[0].itemCode,
						// �K�p�J�n��
						applyfromdate: currentDatas[0].startDate,
						// ���i�����From
						fromquantity: 1,
						// �K�p�I����
						applytodate: currentDatas[0].endDate,
						// ���i�����To
						toquantity: null,
						// ���i
						price: currentDatas[0].baseSalesPrice
					});
				} else {
					for (var i = 0; i < currentDatas.length; i++) {
						if (i == 0) {
							// �P���R�[�h��
							lineDatas.push({
								// ���i�R�[�h
								itemid: currentDatas[i].itemCode,
								// �K�p�J�n��
								applyfromdate: currentDatas[i].startDate,
								// ���i�����From
								fromquantity: 1,
								// �K�p�I����
								applytodate: currentDatas[i].endDate,
								// ���i�����To
								toquantity: Number(currentDatas[i].quantity) - 1,
								// ���i
								price: currentDatas[i].baseSalesPrice
							});
						} else if (i == 1) {
							// �Q���R�[�h��
							lineDatas.push({
								// ���i�R�[�h
								itemid: currentDatas[i].itemCode,
								// �K�p�J�n��
								applyfromdate: currentDatas[i].startDate,
								// ���i�����From
								fromquantity: Number(currentDatas[(i - 1)].quantity),
								// �K�p�I����
								applytodate: currentDatas[i].endDate,
								// ���i�����To
								toquantity: Number(currentDatas[i].quantity) - 1,
								// ���i
								price: currentDatas[(i - 1)].basePrice
							});
						}
					}
					var lastIndex = currentDatas.length - 1;
					lineDatas.push({
						// ���i�R�[�h
						itemid: currentDatas[lastIndex].itemCode,
						// �K�p�J�n��
						applyfromdate: currentDatas[lastIndex].startDate,
						// ���i�����From
						fromquantity: currentDatas[lastIndex].quantity,
						// �K�p�I����
						applytodate: currentDatas[lastIndex].endDate,
						// ���i�����To
						toquantity: null,
						// ���i
						price: currentDatas[lastIndex].basePrice
					});
				}
			}
			resultPriceListData.push({
				// ���i�\�R�[�h
				priceListCd: currentDatas[0].priceListCode,
				// ���i�\����
				priceListNm: currentDatas[0].name,
				// �ʉ�
				currency: currentDatas[0].currency,
				// �쐬����
				createtime: currentDatas[0].headerCreateDate,
				// �쐬�҃R�[�h
				createuser: 'netsuite',
				// �ŏI�X�V����
				lastupdatetime: currentDatas[0].headerLastModifiedDate,
				// �ŏI�X�V�҃R�[�h
				updateuser: 'netsuite',
				// �폜�t���O
				deleteflg: currentDatas[0].isInactive ? '1' : '0',
				// ����
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
					// �Z�����׍s�ԍ�
					addrlineno: addrInfoByCustomerId[(tmpCustomerId)].length + 1,
					// �f�t�H���g���t��t���O
					defaultshippingflg: (tmpAddrResult.getValue({ name: 'isdefaultshipping', join: 'address' }) ? '1' : '0'),
					// �f�t�H���g������t���O
					defaultbillingflg: (tmpAddrResult.getValue({ name: 'isdefaultbilling', join: 'address' }) ? '1' : '0'),
					// �Z�����x��
					addrlabel: tmpAddrResult.getValue({ name: 'addresslabel', join: 'address' }),
					// �Z��ID
					addrid: tmpAddrResult.getValue({ name: 'internalid', join: 'address' })
				});
			} else {
				var tmp = [];
				tmp.push({
					// �Z�����׍s�ԍ�
					addrlineno: 1,
					// �f�t�H���g���t��t���O
					defaultshippingflg: (tmpAddrResult.getValue({ name: 'isdefaultshipping', join: 'address' }) ? '1' : '0'),
					// �f�t�H���g������t���O
					defaultbillingflg: (tmpAddrResult.getValue({ name: 'isdefaultbilling', join: 'address' }) ? '1' : '0'),
					// �Z�����x��
					addrlabel: tmpAddrResult.getValue({ name: 'addresslabel', join: 'address' }),
					// �Z��ID
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
		// DJ_�o�׈ē����M��敪
		columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custentity_djkk_shippinginfodesttyp' }));
		// DJ_�o�׈ē����M���Ж�
		columns.push(search.createColumn({ name: 'custentity_djkk_shippinginfodestname' }));
		// DJ_�o�׈ē����M��S����
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
					tmpCreateDate = tmpCreateDate.getFullYear() + '�N' + ('00' + (tmpCreateDate.getMonth() + 1)).slice(-2) + '��' + ('00' + tmpCreateDate.getDate()).slice(-2) + '�� ' + ('00' + tmpCreateDate.getHours()).slice(-2) + '��' + ('00' + tmpCreateDate.getMinutes()).slice(-2) + '��';
				} else {
					tmpCreateDate = '';
				}

				if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
					tmpLastModifiedDate = format.parse({ value: tmpLastModifiedDate, type: format.Type.DATE });
					tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '�N' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '��' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '�� ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '��' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '��';
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
					// �ڋqID
					customerid: tmpResult.getValue({ name: 'entityid' }),
					// �ڋq��
					customernm: tmpResult.getValue({ name: 'companyname' }),
					// �ʉ�
					currency: tmpCurrencyCode,
					// ����
					language: tmpResult.getText({ name: 'language' }),
					// �e���ID
					parentid: tmpParentId,
					// ���ID
					subsidiaryid: tmpResult.getValue({ name: 'subsidiary' }),
					// �N���XID
					classid: '',
					// ����ID
					departmentid: tmpResult.getValue({ name: 'custentity_djkk_activity' }),
					// �d�q���[��
					email: tmpResult.getValue({ name: 'email' }),
					// �d�b
					phone: tmpResult.getValue({ name: 'custentity_djkk_exsystem_phone_text' }),
					// FAX
					fax: tmpResult.getValue({ name: 'custentity_djkk_exsystem_fax_text' }),
					// ���Љc�ƒS����ID
					salesrepid: tmpResult.getValue({ name: 'salesrep' }),
					// DJ_�ܖ������t�]�h�~�敪
					dj_expdatereservaltyp: tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custentity_djkk_expdatereservaltyp' }),
					// DJ_�ܖ������c����
					dj_expdateremainingdays: tmpResult.getValue({ name: 'custentity_djkk_expdateremainingdays' }),
					// DJ_�ܖ������c�p�[�Z���e�[�W
					dj_expdateremainingpercent: tmpResult.getValue({ name: 'custentity_djkk_expdateremainingpercent' }),
					// DJ_�x�������敪
					dj_paymentcondtyp: tmpPaymentConditions,
					// DJ_�󒍏o�׊֘A���[���L�q
					dj_orderruledesc: tmpResult.getValue({ name: 'custentity_djkk_orderruledesc' }),
					// DJ_�����d���t���O
					dj_consignmentbuyingflg: (tmpResult.getValue({ name: 'custentity_djkk_consignmentbuyingflg' }) ? '1' : '0'),
					// DJ_�ėp�ڋq�t���O
					dj_commoncustomflg: (tmpResult.getValue({ name: 'custentity_djkk_commoncustomflg' }) ? '1' : '0'),
					// DJ_�o�׈ē����M�敪
					dj_shippinginfosendtyp: tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custentity_djkk_shippinginfosendtyp' }),
					// DJ_����S����
					dj_customerrep: tmpResult.getValue({ name: 'custentity_djkk_customerrep' }),
					// DJ_�o�׈ē����M��敪
					dj_shippinginfodesttyp: tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custentity_djkk_shippinginfodesttyp' }),
					// DJ_�o�׈ē����M���Ж�
					dj_shippinginfodestname: tmpResult.getValue({ name: 'custentity_djkk_shippinginfodestname' }),
					// DJ_�o�׈ē����M��S����
					dj_shippinginfodestrep: tmpResult.getValue({ name: 'custentity_djkk_shippinginfodestrep' }),
					// DJ_�o�׈ē����t�惁�[��
					dj_shippinginfodestemail: tmpResult.getValue({ name: 'custentity_djkk_shippinginfodestemail' }),
					// DJ_�o�׈ē����t��FAX
					dj_shippinginfodestfax: tmpResult.getValue({ name: 'custentity_djkk_shippinginfodestfax' }),
					// DJ_�o�׈ē����t����l
					dj_shippinginfodestmemo: tmpResult.getValue({ name: 'custentity_djkk_shippinginfodestmemo' }),
					// DJ_FINET�o�׈ē����M�t���O
					//					dj_finetshipmentmailflg: (tmpResult.getValue({name: 'custentity_djkk_finet_shipment_mail_flg'}) ? '1' : '0'),
					//					// DJ_FINET�������M�t���O
					//					dj_finetbillmailflg: (tmpResult.getValue({name: 'custentity_djkk_finet_bill_mail_flg'}) ? '1' : '0'),
					// DJ_�������q�Ɍ������l
					dj_sowmsmemo: tmpResult.getValue({ name: 'custentity_djkk_sowmsmemo' }),
					// DJ_�������^���������l
					dj_sodeliverermemo: tmpResult.getValue({ name: 'custentity_djkk_sodeliverermemo' }),
					// DJ_���i�\�R�[�h
					dj_priceListCd: tmpResult.getValue({ name: 'custrecord_djkk_pl_code_fd', join: 'custentity_djkk_pl_code_fd' }),
					// DJ_0�~�v���C�X�t���O
					dj_price0flg: (tmpResult.getValue({ name: 'custentity_djkk_price0flg' }) ? '1' : '0'),
					// DJ_�O���A�g�R�[�h
					//					dj_externalaligncode: tmpResult.getValue({name: 'custentity_djkk_external_align_code'}),
					// DJ_�[�i��s�x���͋��e�t���O
					dj_deliverydesteachinputflg: (tmpResult.getValue({ name: 'custentity_djkk_deliverydesteachinputflg' }) ? '1' : '0'),
					// �쐬����
					createtime: tmpCreateDate,
					// �쐬�҃R�[�h
					createuser: 'netsuite',
					// �ŏI�X�V����
					lastupdatetime: tmpLastModifiedDate,
					// �ŏI�X�V�҃R�[�h
					updateuser: 'netsuite',
					// �폜�t���O
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
	 * �z���G���A
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
					tmpCreatedDate = tmpCreatedDate.getFullYear() + '�N' + ('00' + (tmpCreatedDate.getMonth() + 1)).slice(-2) + '��' + ('00' + tmpCreatedDate.getDate()).slice(-2) + '�� ' + ('00' + tmpCreatedDate.getHours()).slice(-2) + '��' + ('00' + tmpCreatedDate.getMinutes()).slice(-2) + '��';
				} else {
					tmpCreatedDate = '';
				}
				if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
					tmpLastModifiedDate = format.parse({ value: tmpLastModifiedDate, type: format.Type.DATE });
					tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '�N' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '��' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '�� ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '��' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '��';
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
	 * �Z�b�g�i�쐬����
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
	 * �]������
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
				tmpCreatedDate = tmpCreatedDate.getFullYear() + '�N' + ('00' + (tmpCreatedDate.getMonth() + 1)).slice(-2) + '��' + ('00' + tmpCreatedDate.getDate()).slice(-2) + '�� ' + ('00' + tmpCreatedDate.getHours()).slice(-2) + '��' + ('00' + tmpCreatedDate.getMinutes()).slice(-2) + '��';
			} else {
				tmpCreatedDate = '';
			}

			if (tmpLastModifiedDate != null && tmpLastModifiedDate != '') {
				tmpLastModifiedDate = format.parse({ value: tmpLastModifiedDate, type: format.Type.DATE });
				tmpLastModifiedDate = tmpLastModifiedDate.getFullYear() + '�N' + ('00' + (tmpLastModifiedDate.getMonth() + 1)).slice(-2) + '��' + ('00' + tmpLastModifiedDate.getDate()).slice(-2) + '�� ' + ('00' + tmpLastModifiedDate.getHours()).slice(-2) + '��' + ('00' + tmpLastModifiedDate.getMinutes()).slice(-2) + '��';
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
	 * �ʉ݃R�[�h���擾
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
	 * ���ʌ����t�@���N�V����
	 * @param searchType �����Ώ�
	 * @param filters ��������
	 * @param columns �������ʗ�
	 * @returns ��������
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

		// �J�X�^�����R�[�h�uDJ_�s���{�����z���G���A�v
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
	 * ���t�t�H�[�}�b�g(YYYYMMDD)
	 * @param {Date} currentDate ���t
	 * @returns {String} �t�H�[�}�b�g����t������
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
	 * �ėp�敪ID����
	 * @param {String|Integer} categoryCode �敪��ރR�[�h
	 * @param {String|Integer} typeCode �敪�R�[�h
	 * @return {String|Integer} �ėp�敪����ID
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
	* ���{�̓��t���擾����
	* 
	* @returns ���{�̓��t
	*/
	function getJapanDateTime() {
		var now = new Date();
		var offSet = now.getTimezoneOffset();
		var offsetHours = 9 + (offSet / 60);
		now.setHours(now.getHours() + offsetHours);

		return now;
	}

});