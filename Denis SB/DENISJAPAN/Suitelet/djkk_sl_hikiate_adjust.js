/**
 * Module Description
 * WO自動引当機能
 * Version    Date            Author           Remarks
 * 1.00       26 Jul 2021     
 *
 */
/**
 * for handy test
 * @param {*} request 
 * @param {*} response 
 */
function suitelet(request, response) {
	
	
	if (request.getMethod() == 'POST') {
		run(request, response);
		
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response)
		}else{
			createForm(request, response);
		}
	}

}


function run(request, response,locationValue,subsidiaryValue){
	

	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	

	

	scheduleparams['custscript_djkk_ss_hikiate_adjust_wok_id'] = request.getParameter('custpage_record_id')
	scheduleparams['custscript_djkk_ss_hikiate_adjust_param'] = request.getParameter('custpage_param');
	runBatch('customscript_djkk_ss_hikiate_adjust', 'customdeploy_djkk_ss_hikiate_adjust', scheduleparams);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}


//バッチ状態画面
function logForm(request, response) {

	var form = nlapiCreateForm('処理状態', false);
	form.setScript('customscript_djkk_cs_inspection_list');
	// 実行情報
	form.addFieldGroup('custpage_run_info', '実行情報');
	form.addButton('custpage_refresh', '更新', 'refresh();');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_hikiate_adjust');

	if (batchStatus == 'FAILED') {
		// 実行失敗の場合
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> バッチ処理を失敗しました </font>';
		runstatusField.setDefaultValue(messageColour);
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// 実行中の場合
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('バッチ処理を実行中');
		response.writePage(form);
	}else{
		createForm(request, response);
	}
	
}


function createForm(request, response){
	
	
	var recId = request.getParameter('workorderId')
	
	if(isEmpty(recId)){
		var form = nlapiCreateForm('引当マニュアル調整', false);
		form.addField('custpage_label', 'label', '処理完成しました。')
		response.writePage(form);	
		return;
	}
	
	var form = nlapiCreateForm('引当マニュアル調整', false);
	form.setScript('customscript_djkk_cs_hikiate_adjust');
	var recField = form.addField('custpage_record_id', 'text', 'レコードID');
	recField.setDisplayType('hidden');
	recField.setDefaultValue(recId);
	var paramField = form.addField('custpage_param', 'textarea', 'パラメータ');
	paramField.setDisplayType('hidden');
	form.addSubmitButton('在庫詳細更新');
	
	var list = form.addSubList('list', 'list', '在庫詳細')
	list.addField('item' ,'text', 'アイテム');
	list.addField('item_type' ,'text', 'アイテム種類');
	list.addField('item_id' ,'text', 'アイテムID').setDisplayType('hidden');
	list.addField('count' ,'text', 'ワードオーダー数量');
	list.addField('inv_no' ,'text', 'シリアル/ロット番号');
	list.addField('able_date' ,'text', '有効期間');
	list.addField('done_count' ,'text', '引当済み数量');
	list.addField('adjust_count' ,'currency', '手動調整数量').setDisplayType('entry');
	list.addField('arr_count' ,'text', '可能数量');		
	list.addField('one_inv_no' ,'checkbox', '単一ロット').setDisplayType('disabled');
	
	list.addField('in_location_no' ,'text', '倉庫入庫番号');	
	list.addField('maker_no' ,'text', 'メーカの製造番号');	
	list.addField('smc_no' ,'text', 'SMC番号');	
	list.addField('create_date' ,'text', '製造年月日');	
	list.addField('ship_date' ,'text', '出荷可能期限日');	

	
	
	var rec = nlapiLoadRecord('workorder', recId);
	
	var recItemCount = rec.getLineItemCount('item');
	var itemCountArr = new Array();
	var itemUnitArr = new Array();
	var itemDetailArr = new Array();
	var itemList = new Array();
	//itemList.push('item');
	itemList.push('internalid');
	itemList.push('anyof')
	for(var i = 0 ; i < recItemCount ; i++){
		rec.selectLineItem('item', i+1)
		itemList.push(rec.getCurrentLineItemValue('item', 'item' ));
		itemCountArr[rec.getCurrentLineItemValue('item', 'item')] = rec.getCurrentLineItemValue('item', 'quantity');
		itemUnitArr[rec.getCurrentLineItemValue('item', 'item')] = rec.getCurrentLineItemValue('item', 'units');
		var inventorydetailavail = rec.getCurrentLineItemValue('item','inventorydetailavail')
		if(inventorydetailavail == 'T'){
			var inventoryDetail=rec.editCurrentLineItemSubrecord('item','inventorydetail');		
			if(!isEmpty(inventoryDetail)){				
				var invDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');				
				for(var j = 0 ; j < invDetailCount ; j++){
					inventoryDetail.selectLineItem('inventoryassignment',j+1);
					itemDetailArr[inventoryDetail.getCurrentLineItemText('inventoryassignment','issueinventorynumber')] = inventoryDetail.getCurrentLineItemValue('inventoryassignment','quantity');
				
				}
			}
		}	
	}
	

	//リアルタイムの在庫情報
	var inventorydetailSearch = nlapiSearchRecord("item",null,
			[
//			   ["inventorynumber.quantityavailable","greaterthan","0"], 
//			   "AND", 
			   itemList, 
			   "AND", 
			   ["inventoryNumber.location","anyof",rec.getFieldValue('location')]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP").setSort(false), 
			   new nlobjSearchColumn("itemid","","GROUP"), 
			   new nlobjSearchColumn("custitem_djkk_single_lot_provision","","MAX"), 
			   new nlobjSearchColumn("quantityonhand","inventoryNumber","GROUP"), 
			   new nlobjSearchColumn("quantityavailable","inventoryNumber","GROUP"), 
			   new nlobjSearchColumn("inventorynumber","inventoryNumber","GROUP"), 
			   new nlobjSearchColumn("internalid","inventoryNumber","GROUP"),
			   new nlobjSearchColumn("location",null,"GROUP"),
			   new nlobjSearchColumn("type","","MAX"), 
			   new nlobjSearchColumn("custitemnumber_djkk_maker_serial_number","inventoryNumber","MAX"), 
			   new nlobjSearchColumn("custitemnumber_djkk_smc_nmuber","inventoryNumber","MAX"), 
			   new nlobjSearchColumn("custitemnumber_djkk_make_date","inventoryNumber","MAX"), 
			   new nlobjSearchColumn("custitemnumber_djkk_shipment_date","inventoryNumber","MAX"),
			   new nlobjSearchColumn("custitemnumber_djkk_warehouse_number","inventoryNumber","MAX"),
			   new nlobjSearchColumn("expirationdate","inventoryNumber","MAX"),
			   new nlobjSearchColumn('stockunit','','MAX'),
			   new nlobjSearchColumn('unitstype','','MAX')
			]
			);
	
	//基本単位転換
	var unitstypeSearch = getSearchResults("unitstype",null,
			[
			   ["isinactive","is","F"]
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("unitname"), 
			   new nlobjSearchColumn("conversionrate"),
			   new nlobjSearchColumn("name")
			]
			);
	var unitsArr = new Array();
	if(!isEmpty(unitstypeSearch)){
		for(var i = 0 ; i < unitstypeSearch.length ; i++){
			var json = {};
			json.unitname = unitstypeSearch[i].getValue('unitname');
			json.conversionrate = unitstypeSearch[i].getValue('conversionrate')
			json.typename = unitstypeSearch[i].getValue('name')
			
			unitsArr.push(json);
		}
		
	}
	
	if(!isEmpty(inventorydetailSearch)){
		var lineNumber = 1;
		for(var i = 0 ; i < inventorydetailSearch.length ; i++){
			list.setLineItemValue('item', lineNumber, inventorydetailSearch[i].getValue("itemid","","GROUP"));
			list.setLineItemValue('item_id', lineNumber, inventorydetailSearch[i].getValue("internalid",null,"GROUP"));
			list.setLineItemValue('inv_no', lineNumber, inventorydetailSearch[i].getValue("inventorynumber","inventoryNumber","GROUP"))

			//数量転換
			var count = itemCountArr[inventorydetailSearch[i].getValue("internalid",null,"GROUP")];
			var unit = itemUnitArr[inventorydetailSearch[i].getValue("internalid",null,"GROUP")];
			var unitName = inventorydetailSearch[i].getValue('unitstype','','MAX');
			//nlapiLogExecution('DEBUG', '', unit+'-'+unitName+'-'+getUnitCount(unitsArr,unit,unitName,count))
			//count = getUnitCount(unitsArr,unit,unitName,count)
			
			list.setLineItemValue('count', lineNumber, Number(count));
			list.setLineItemValue('one_inv_no', i+1, inventorydetailSearch[i].getValue("custitem_djkk_single_lot_provision","item","MAX"))
			var doneCount = itemDetailArr[inventorydetailSearch[i].getValue("inventorynumber","inventoryNumber","GROUP")];
			list.setLineItemValue('done_count', lineNumber, isEmpty(doneCount) ? '0' : doneCount);			
			list.setLineItemValue('adjust_count', lineNumber, isEmpty(doneCount) ? '0' : doneCount);
			var arr_count = inventorydetailSearch[i].getValue("quantityavailable","inventoryNumber","GROUP")
			if(Number(arr_count)== 0 && Number(doneCount) > 0){
				arr_count = doneCount;
			}
			list.setLineItemValue('arr_count', lineNumber,arr_count )
			list.setLineItemValue('item_type', lineNumber, inventorydetailSearch[i].getValue("type","item","MAX"));
			list.setLineItemValue('in_location_no', lineNumber, inventorydetailSearch[i].getValue("custitemnumber_djkk_warehouse_number","inventoryNumber","MAX"));
			list.setLineItemValue('maker_no', lineNumber, inventorydetailSearch[i].getValue("custitemnumber_djkk_maker_serial_number","inventoryNumber","MAX"));
			list.setLineItemValue('smc_no', lineNumber, inventorydetailSearch[i].getValue("custitemnumber_djkk_smc_nmuber","inventoryNumber","MAX"));
			list.setLineItemValue('create_date', lineNumber, inventorydetailSearch[i].getValue("custitemnumber_djkk_make_date","inventoryNumber","MAX"));
			list.setLineItemValue('ship_date', lineNumber, inventorydetailSearch[i].getValue("custitemnumber_djkk_shipment_date","inventoryNumber","MAX"));
			list.setLineItemValue('able_date', lineNumber, inventorydetailSearch[i].getValue("expirationdate","inventoryNumber","MAX"));
			
			
			lineNumber++
		}
	}

	
	
	
	response.writePage(form);	
}

//単位数量転換
function getUnitCount (arr,name,typename,count){
	if(isEmpty(arr)){
		return count;
	
	}
	
	for(var i = 0 ; i < arr.length ; i ++){
		if(arr[i].unitname == name && arr[i].typename == typename){
			return count/Number(arr[i].conversionrate )
		}
	}
	return count;
}