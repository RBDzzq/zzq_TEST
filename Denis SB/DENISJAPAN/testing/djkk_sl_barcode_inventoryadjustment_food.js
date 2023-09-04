/**
 * 在庫管理バーコード
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/26     CPC_苑
 *
 */
/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
//	nlapiLogExecution('debug', 'access', 'Ok');
	var handyType = request.getParameter('handyType');
	try{
		if(handyType == 'createRecord'){
			var postingperiod = request.getParameter('postingPeriod');
			var trandate = request.getParameter('tranDate');
			var podetail = request.getParameter('podetail');
			var employeeKey = request.getParameter('employeeKey');
			response.write(createRecord(postingperiod, trandate, podetail, employeeKey));
		}else if(handyType == 'getSelectionsList'){
			var code = request.getParameter('code');
			var location = request.getParameter('location');
			response.write(getSelectionsList(code, location));
		}else if(handyType == 'getGoods'){
			var code = request.getParameter('code');
			response.write(getGoods(code));
		}else if(handyType == 'getLocation'){
			var code = request.getParameter('code');
			response.write(getLocation(code));
		}
	}catch(e){
		response.write(e);
	}
		
}

function createRecord(postingperiod, trandate, podetail, employeeKey){
//	nlapiLogExecution('debug', 'podetail', podetail);
//	nlapiLogExecution('debug', 'postingperiod', postingperiod);
//	nlapiLogExecution('debug', 'trandate', trandate);
//	nlapiLogExecution('debug', 'employeeKey', employeeKey);

	// 创建
	var record=nlapiCreateRecord('inventoryadjustment');
	// カスタムフォーム
	record.setFieldValue('customform','156');
	// 参照番号
//	record.setFieldValue('tranid','N105');
	// 記帳期間
	record.setFieldText('postingperiod',postingperiod); // 可变
	// 調整勘定科目
	record.setFieldValue('account','574');
	// 日付
	record.setFieldValue('trandate',trandate); // 可变
	// 子会社  
	record.setFieldValue('subsidiary','2');
	// DJ_変更理由
	record.setFieldValue('custbody_djkk_change_reason','101'); // 可变
	//  DJ_承認処理フラグ
	record.setFieldValue('custbody_djkk_trans_appr_deal_flg','T');
	//	DJ_ハンディ操作者
	record.setFieldValue('custbody_djkk_handy_salesman',employeeKey);
	
	var list = JSON.parse(podetail)
	for (var i = 0; i < list.length; i++) {
		item = list[i]['goodsId']
		adjustqtyby = list[i]['number']
		resetLocation = list[i]['resetLocationId']
		record.selectNewLineItem('inventory');
		// アイテム
		record.setCurrentLineItemValue('inventory', 'item', item);  // 可变
		// 場所
		record.setCurrentLineItemValue('inventory', 'location', resetLocation);  // 可变
		// 調整数量
		record.setCurrentLineItemValue('inventory', 'adjustqtyby', adjustqtyby);  // 可变
		
		var data_ = list[i]['data']
		var inventorydetail=record.createCurrentLineItemSubrecord('inventory', 'inventorydetail');
		for (var j = 0; j < data_.length; j++) {
			inventoryNumber = data_[j]['inventoryNumber']
			quantity = data_[j]['number']
			inventorydetail.selectNewLineItem('inventoryassignment');
			inventorydetail.setCurrentLineItemValue('inventoryassignment','quantity', quantity);
			//管理番号（シリアル/ロット番号）
		    if(!isEmpty(inventoryNumber)){
				inventorydetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber', inventoryNumber);
		    }
			inventorydetail.commitLineItem('inventoryassignment');
		}
		inventorydetail.commit();
		record.commitLineItem('inventory');
	}
	var recordId = nlapiSubmitRecord(record);
//	nlapiLogExecution('debug', 'recordId', recordId);
	return recordId;
}

function getSelectionsList(code, location){
	var iclSearch = nlapiSearchRecord("inventorydetail",null,
			[
			   ["inventorynumber.isonhand","is","T"], 
			   "AND", 
			   ["inventorynumber.quantityavailable","greaterthan","0"], 
			   "AND", 
			   ["item.upccode","is",code], 
			   "AND", 
			   ["inventorynumber.location","anyof",location], 
			   "AND", 
			   ["isinventoryaffecting","is","T"]
			], 
			[
			   new nlobjSearchColumn("expirationdate",null,"GROUP").setSort(false), 
			   new nlobjSearchColumn("inventorynumber",null,"GROUP").setSort(false), 
			   new nlobjSearchColumn("location","inventoryNumber","GROUP"), 
			   new nlobjSearchColumn("quantityonhand","inventoryNumber","GROUP"), 
			   new nlobjSearchColumn("quantityavailable","inventoryNumber","GROUP")
			]
			);
	var resultList = []
    if(!isEmpty(iclSearch)){
		for (var i = 0; i < iclSearch.length; i++) {
			var result = []
			result_ = '{';
			result.push('"key":"' + i + '"');
			result.push('"inventorynumber":"' + iclSearch[i].getText("inventorynumber",null,"GROUP") + '"');
			result.push('"location":"' + iclSearch[i].getText("location","inventoryNumber","GROUP") + '"');
			result.push('"date":"' + iclSearch[i].getValue("expirationdate",null,"GROUP") + '"');
			var quantityavailable = iclSearch[i].getValue("quantityavailable","inventoryNumber","GROUP");
			if(quantityavailable.indexOf(".") == 0){
				quantityavailable = "0" + quantityavailable;
			}
			result.push('"quantityavailable":"' + quantityavailable + '"');
			result_ += result.join();
			result_ += '}';
			resultList.push(result_);
		}
    }
	return '{"poLine":' + '['+ resultList.join() +'],"poId":"1"}';
}

function getGoods(code){
	var transactionSearch = nlapiSearchRecord("lotnumberedinventoryitem",null,
			[
			   ["upccode","is",code]
			], 
			[
			   new nlobjSearchColumn("upccode"), 
			   new nlobjSearchColumn("custitem_djkk_product_code"),
			   new nlobjSearchColumn("custitem_djkk_product_name_jpline1"),
			   new nlobjSearchColumn("custitem_djkk_product_name_jpline2"),
			   new nlobjSearchColumn("itemid")
			]
			);

	if(!isEmpty(transactionSearch)){
		var code = transactionSearch[0].getValue('custitem_djkk_product_code');
		var name1 = transactionSearch[0].getValue('custitem_djkk_product_name_jpline1');
		var name2 = transactionSearch[0].getValue('custitem_djkk_product_name_jpline2');
		var itemid = transactionSearch[0].getValue('itemid');
		var id = transactionSearch[0].getId();
		return '{"code":"' + code + '","name1":"' + name1 + '","name2":"' + name2 + '","itemid":"' + itemid + '","id":"' + id + '","type":"goods"}';
	}
	return '{"code":"-1","type":"goods"}';
		
}

function getLocation(code){
	var transactionSearch = nlapiSearchRecord("location",null,
			[
			   ["externalid","is",code]
			], 
			[
			   new nlobjSearchColumn("externalid"), 
			   new nlobjSearchColumn("name"),
			]
			);

	if(!isEmpty(transactionSearch)){
		var externalid = transactionSearch[0].getValue('externalid');
		var name = transactionSearch[0].getValue('name');
		var id = transactionSearch[0].getId();
		return '{"code":"1","externalid":"' + externalid + '","name":"' + name  + '","id":"' + id  + '","type":"location"}';
	}
	return '{"code":"-1","type":"location"}';
		
}


