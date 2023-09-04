/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define([ 'N/runtime', 'N/record', 'N/search' ], function(runtime, record,
		search) {

	/**
	 * Definition of the Scheduled script trigger point.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {string}
	 *            scriptContext.type - The context in which the script is
	 *            executed. It is one of the values from the
	 *            scriptContext.InvocationType enum.
	 * @Since 2015.2
	 */
	function execute(scriptContext) {
		var itemValue =[];
		var moneyValue=[];
		var currentScript = runtime.getCurrentScript();
		var abslId = JSON.parse(currentScript.getParameter({
			name : 'custscript_djkk_record_id'
		}));
		var recordObj = record.load({
			type : 'customrecord_djkk_bribery_acknowledgment',
			id:abslId
		})
		var sub = recordObj.getValue({fieldId:'custrecord_djkk_bribery_subsidiary'});//子会社
		var vendor = recordObj.getValue({fieldId:'custrecord_djkk_bribery_vendor'});//DJ_仕入先
		var account = recordObj.getValue({fieldId:'custrecord_djkk_bribery_account'});//DJ_勘定科目
		var currency = recordObj.getValue({fieldId:'custrecord_djkk_bribery_currency'});//DJ_通貨
		var amount = recordObj.getValue({fieldId:'custrecord_djkk_bribery_amount'});//DJ_金額
		var exchangerate = recordObj.getValue({fieldId:'custrecord_djkk_bribery_exchangerate'});//DJ_為替レート
		var date = recordObj.getValue({fieldId:'custrecord_djkk_bribery_now_date'});//DJ_日付
		var memo = recordObj.getValue({fieldId:'custrecord_djkk_bribery_memo'});//DJ_メモ
		var vendorNum = recordObj.getValue({fieldId:'custrecord_djkk_bribery_vendor_num'});//DJ_仕入先のクレジット番号
		
		var itemCount = recordObj.getLineCount({sublistId:'recmachcustrecord_djkk_brybery_page'});
		var moneyCount = recordObj.getLineCount({sublistId:'recmachcustrecord_djkk_money_page'});
		for(var i=0;i<itemCount;i++){
			var itemId = recordObj.getSublistValue({
				sublistId:'recmachcustrecord_djkk_brybery_page',fieldId:'custrecord_djkk_brybery_detail_item',line:i
			})
			var quantity = recordObj.getSublistValue({
				sublistId:'recmachcustrecord_djkk_brybery_page',fieldId:'custrecord_djkk_brybery_detail_quantity',line:i
			})
			var vendorName = recordObj.getSublistValue({
				sublistId:'recmachcustrecord_djkk_brybery_page',fieldId:'custrecord_djkk_brybery_detail_vendor',line:i
			})
			var unity = recordObj.getSublistValue({
				sublistId:'recmachcustrecord_djkk_brybery_page',fieldId:'custrecord_djkk_brybery_detail_unity',line:i
			})
			var rate = recordObj.getSublistValue({
				sublistId:'recmachcustrecord_djkk_brybery_page',fieldId:'custrecord_djkk_brybery_detail_rate',line:i
			})
			var amount = recordObj.getSublistValue({
				sublistId:'recmachcustrecord_djkk_brybery_page',fieldId:'custrecord_djkk_brybery_detail_amount',line:i
			})
			var rateCode = recordObj.getSublistValue({
				sublistId:'recmachcustrecord_djkk_brybery_page',fieldId:'custrecord_djkk_brybery_detail_rate_code',line:i
			})
			var location = recordObj.getSublistValue({
				sublistId:'recmachcustrecord_djkk_brybery_page',fieldId:'custrecord_djkk_brybery_detail_location',line:i
			})
			var adminNum = recordObj.getSublistValue({
				sublistId:'recmachcustrecord_djkk_brybery_page',fieldId:'custrecord_djkk_brybery_admin_number',line:i
			})		
			itemValue.push({
				itemId:itemId,
				quantity:quantity,
				vendorName:vendorName,
				unity:unity,
				rate:rate,
				amount:amount,
				rateCode:rateCode,
				location:location,
				adminNum:adminNum
			})
		}
		
//		
//		
//		for(var i=0;i<moneyCount;i++){
//			var moneyAcc = recordObj.getSublistValue({
//				sublistId:'recmachcustrecord_djkk_money_page',fieldId:'custrecord_djkk_money_account_page',line:i
//			})
//			var money = recordObj.getSublistValue({
//				sublistId:'recmachcustrecord_djkk_money_page',fieldId:'custrecord_djkk_money_page_id',line:i
//			})
//			var moneyCode = recordObj.getSublistValue({
//				sublistId:'recmachcustrecord_djkk_money_page',fieldId:'	custrecord_djkk_money_rate_code_page',line:i
//			})
//			var moneyAmount = recordObj.getSublistValue({
//				sublistId:'recmachcustrecord_djkk_money_page',fieldId:'custrecord_djkk_money_rate_amount',line:i
//			})
//			var moneyAll = recordObj.getSublistValue({
//				sublistId:'recmachcustrecord_djkk_money_page',fieldId:'custrecord_djkk_money_amount_all',line:i
//			})
//			moneyValue.push({
//				moneyAcc:moneyAcc,
//				money:money,
//				moneyCode:moneyCode,
//				moneyAmount:moneyAmount,
//				moneyAll:moneyAll
//			})
//		}
		var objRecord = record.create({
			type : 'vendorcredit'
		});
		objRecord.setValue({
			fieldId:'customform',
			value:'134'
		})
		objRecord.setValue({
			fieldId:'entity',
			value:vendor
		})
		log.debug('vendor',vendor);
		objRecord.setValue({
			fieldId:'subsidiary',
			value:sub
		})
//		objRecord.setValue({
//			fieldId:'account',
//			value:account
//		})
		objRecord.setValue({
			fieldId:'usertotal',
			value:amount
		})
		objRecord.setValue({
			fieldId:'currency',
			value:currency
		})
		objRecord.setValue({
			fieldId:'exchangerate',
			value:exchangerate
		})
		objRecord.setValue({
			fieldId:'trandate',
			value:date
		})
		objRecord.setValue({
			fieldId:'memo',
			value:memo
		})
		objRecord.setValue({
			fieldId:'custbody_djkk_po_vendor_credino',
			value:vendorNum
		})
//		for(var j=0;j<itemValue.length;j++){
//			objRecord.selectNewLine({
//			    sublistId: 'item'
//			});
//			objRecord.setCurrentSublistValue({
//			    sublistId: 'item',
//			    fieldId: 'item',
////			    line:j,
//			    value: itemValue[j].itemId
//			});
//			objRecord.setCurrentSublistValue({
//			    sublistId: 'item',
//			    fieldId: 'vendorname',
////			    line:j,
//			    value: itemValue[j].vendorname
//			});
//			objRecord.setCurrentSublistValue({
//			    sublistId: 'item',
//			    fieldId: 'quantity',
////			    line:j,
//			    value: itemValue[j].quantity
//			});
////			objRecord.setSublistValue({
////			    sublistId: 'item',
////			    fieldId: 'units',
////			    line:j,
////			    value: itemValue[j].unity
////			});
////			objRecord.setSublistValue({
////			    sublistId: 'item',
////			    fieldId: 'rate',
////			    line:j,
////			    value: itemValue[j].rate
////			});
////			objRecord.setSublistValue({
////			    sublistId: 'item',
////			    fieldId: 'amount',
////			    line:j,
////			    value: itemValue[j].amount
////			});
////			objRecord.setSublistValue({
////			    sublistId: 'item',
////			    fieldId: 'taxcode',
////			    line:j,
////			    value: itemValue[j].rateCode
////			});
//			objRecord.setCurrentSublistValue({
//			    sublistId: 'item',
//			    fieldId: 'location',
////			    line:j,
//			    value: itemValue[j].location
//			});
//			var objSubrecord = objRecord.getCurrentSublistSubrecord({
//			    sublistId: 'item',
//			    fieldId: 'inventorydetail'
//			});
//			objSubrecord.selectNewLineItem('inventoryassignment');
//			objRecord.setCurrentSublistValue({
//			    sublistId: 'inventoryassignment',
//			    fieldId: 'receiptinventorynumber',
////			    line:j,
//			    value: itemValue[j].adminNum
//			});
//		}
		var saveID = objRecord.save({
			 enableSourcing: false,
			 ignoreMandatoryFields: true
		});
		log.debug('saveID',saveID);
		
	}



	return {
		execute : execute
	};

}
);
