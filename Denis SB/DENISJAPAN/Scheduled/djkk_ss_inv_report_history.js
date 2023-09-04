/**
 * 在庫レポート過去データ
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/25    
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	


	nlapiLogExecution('DEBUG', 'Message', '在庫レポート過去データバッチ開始');
	
	// 当日データ削除する。
	var deleteList = getSearchResults('customrecord_djkk_inv_report_history',
			null, [
			       [ "custrecord_djkk_inv_report_date", "onorafter",nlapiDateToString(getSystemTime()) ],
					"AND",["internalidnumber", "isnotempty", ""] 
			       ],
			[ new nlobjSearchColumn("internalid") ]);

	if(!isEmpty(deleteList)){
		for (var i = 0; i < deleteList.length; i++) {
			try {
				nlapiDeleteRecord('customrecord_djkk_inv_report_history', deleteList[i].getValue("internalid"))

			} catch (e) {
				nlapiLogExecution('ERROR', '削除できないID'+deleteList[i].getValue("internalid"), e.message)
			}
			governanceYield();

		}
		
	}

	governanceYield();

	//保存検索パラメータ設定
	var selectParameter = new Array();
	selectParameter.push(["inventorynumber.inventorynumber","isnotempty",""]);
	selectParameter.push("AND");
	selectParameter.push(["inventorynumber.quantityonhand","notlessthanorequalto","0"]);
	
//	selectParameter.push(["AND"]);
//    selectParameter.push(["isinactive","is","F"]);
	//在庫詳細で検索可能のフィルター
	var selectParameter2 = new Array();
	selectParameter2.push(["inventorynumber.internalid","noneof","@NONE@"])
	//在庫レポートのトランザクション範囲指定　 受領、在庫移動 在庫調整　
	selectParameter2.push("AND")
	selectParameter2.push(["transaction.type","anyof","ItemRcpt","InvTrnfr","InvAdjst","Build","Unbuild","WOIssue","WOCompl"])
	
	selectParameter2.push("AND")
	selectParameter2.push(["item.isinactive","is","F"])
   
	
	//アイテムのリアルタイムの在庫詳細が主			
	var inventorydetailSearch = getSearchResults("item",null,
			selectParameter, 
			[
			 new nlobjSearchColumn("custitem_djkk_product_group").setSort(false),
			   new nlobjSearchColumn("internalid").setSort(false), 
			   new nlobjSearchColumn("location","inventoryNumber",null).setSort(false),
			   new nlobjSearchColumn("internalid","inventoryNumber",null).setSort(false), 
			   new nlobjSearchColumn("quantityonhand","inventoryNumber",null), 
			   new nlobjSearchColumn("inventorynumber","inventoryNumber",null)
			   
			   
			]
			);
	
	
	if(!isEmpty(inventorydetailSearch)){
		var arr = Array();

		//在庫番号単位で構成
		for (var i = 0; i < inventorydetailSearch.length; i++) {
			var item = inventorydetailSearch[i].getValue("internalid");
			var location = inventorydetailSearch[i].getValue("location","inventoryNumber",null);
			//在庫番号ID→在庫番号
			var inventorynumber = inventorydetailSearch[i].getValue("inventorynumber","inventoryNumber",null);
			var itemcount = inventorydetailSearch[i].getValue("quantityonhand","inventoryNumber",null);
			var addFlg = true;

			for (var j = 0; j < arr.length; j++) {

				if (arr[j].item != item) {
					continue;
				} else {
					if (arr[j].location != location) {
						continue;
					} else {
						if (arr[j].inventorynumber != inventorynumber) {
							continue;
						} else {

							arr[j].itemcount = Number(itemcount)+ Number(arr[j].itemcount);
							addFlg = false;
							break;
						}
					}
				}
			}

			if (addFlg) {
				var json = new Object();
				json.item = item;
				json.location = location;
				json.inventorynumber = inventorynumber;
				json.itemcount = Number(itemcount);

				arr.push(json);
			}

		}

		for (var i = arr.length - 1; i >= 0; i--) {
			if (Number(arr[i].itemcount) == 0) {
				arr.splice(i, 1);
			}
		}
				
		//20230807 changed by zhou start
		//アイテムとその他内容取得
		var inventorydetailSearch = getSearchResults("inventorydetail",null,selectParameter2
				, 
				[
				   new nlobjSearchColumn("internalid","item","GROUP"),
				   new nlobjSearchColumn("displayname","item","GROUP"),//item 商品名
				   new nlobjSearchColumn("custitem_djkk_product_code","item","GROUP"),//item DJ_カタログ製品コード
				   new nlobjSearchColumn("custitem_djkk_qaqc","item","GROUP"),//item DJ_QA/QCグループ
				   new nlobjSearchColumn("custitem_djkk_product_group","item","MAX").setSort(false),
//				   new nlobjSearchColumn("custitem_djkk_product_group","item","GROUP"),//.setSort(false),
				   new nlobjSearchColumn("item",null,"GROUP").setSort(false),    
				   new nlobjSearchColumn("salesdescription","item","MAX"), 
				   new nlobjSearchColumn("stockunit","item","MAX"), 
				   new nlobjSearchColumn("custcol_djkk_conversionrate","transaction","MAX"), 
				   new nlobjSearchColumn("internalid","location","GROUP").setSort(false), 
				   new nlobjSearchColumn("custrecord_djkk_location_barcode","location","GROUP"), //SUB+四桁の倉庫番号 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("internalid","inventoryNumber","GROUP"),
				   new nlobjSearchColumn("inventorynumber","inventoryNumber","GROUP"),//ロットシリアル番号 =管理番号
				   new nlobjSearchColumn("custitem_djkk_product_name_line1","item","GROUP"),//アイテム.英語Line1 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("custitem_djkk_product_name_line2","item","GROUP"),//アイテム.英語Line2 20230321 CH378 add by zhou 
//				   new nlobjSearchColumn("quantityonhand","inventoryNumber","MAX"),//管理番号ごとの在庫数量 20230321 add by zhou 
				   new nlobjSearchColumn("custrecord_djkk_smc_code","inventoryDetailLines","MAX"), //SMC 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("custrecord_djkk_control_number","inventoryDetailLines","MAX"), //DJ_メーカーシリアル番号 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("custrecord_djkk_lot_memo","inventoryDetailLines","MAX"), //DJ_ロットメモ 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("custrecord_djkk_lot_remark","inventoryDetailLines","MAX"), //DJ_ロットリマーク 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("custrecord_djkk_warehouse_code","inventoryDetailLines","MAX"), //DJ_倉庫入庫番号 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("custrecord_djkk_maker_serial_code","inventoryDetailLines","MAX"), //DJ_メーカー製造ロット番号 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("custrecord_djkk_shipment_date","inventoryDetailLines","MAX"),//DJ_出荷可能期限日 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("custrecord_djkk_make_ymd","inventoryDetailLines","MAX"),//DJ_製造年月日 20230321 CH378 add by zhou 
//				   new nlobjSearchColumn("binnumber","binNumber","GROUP"), //保管棚番号 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("internalid","binNumber","GROUP"), //保管棚番号 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("trandate","transaction","MAX"), 
				   new nlobjSearchColumn("department","transaction","MAX"),//セクション 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("custitem_djkk_class", "item", "MAX"),//ブランド 20230321 CH378 add by zhou 
				   new nlobjSearchColumn("expirationdate",null,"MAX"), 
				   new nlobjSearchColumn("rate","transaction","AVG"), 
				   new nlobjSearchColumn("createdfrom","transaction","MAX"),
				   new nlobjSearchColumn("type","transaction","MAX"),
				   new nlobjSearchColumn("tranid","transaction","MAX"), 
				   new nlobjSearchColumn("internalid","transaction","MAX"), 
				   new nlobjSearchColumn("averagecost","item","MAX"),
				   new nlobjSearchColumn("custitem_djkk_perunitquantity","item","MAX"),
				   new nlobjSearchColumn("serialnumbercost","transaction","SUM"),// ???単価
				   new nlobjSearchColumn("itemcount",null,"MAX"),//倉庫入庫番号ごとの数量??
				   new nlobjSearchColumn("total","transaction","MAX"),//??? total
				   new nlobjSearchColumn("quantity","transaction","MAX"),//???quantity
				   //20230202 add by zhou start CH228
				   //in working . 20230206 zhou memo
				   new nlobjSearchColumn("location",null,"GROUP"),//???quantity
				   //end
				   new nlobjSearchColumn("subsidiary","transaction","MAX"),
				   new nlobjSearchColumn("custitem_dkjj_item_pdf_show","item","GROUP"),//add by zhou 20230320 CH396 
				   new nlobjSearchColumn("vendorname","item","GROUP"),//add by zhou 20230320 CH396 仕入先商品コード
				   new nlobjSearchColumn("custitem_djkk_shelf_life","item","GROUP"),//add by zhou 20230627 DJ_SHELF LIFE（DAYS） /出荷期限日
				]
				);


		if(!isEmpty(inventorydetailSearch)){
			var arrDetial = new Array();
			//データ　構成
			for(var i = 0; i < inventorydetailSearch.length ; i++){

			var json= new Object();
			json.item_id = inventorydetailSearch[i].getValue("internalid","item","GROUP");
			json.item = inventorydetailSearch[i].getText("item",null,"GROUP");
			json.item_name = defaultEmpty(inventorydetailSearch[i].getValue("displayname","item","GROUP"));
			json.product_code = defaultEmpty(inventorydetailSearch[i].getValue("custitem_djkk_product_code","item","GROUP"));
			json.location_id = inventorydetailSearch[i].getValue("internalid","location","GROUP");
			json.item_qaqc = inventorydetailSearch[i].getValue("custitem_djkk_qaqc","item","GROUP");//item DJ_QA/QCグループ
			var locationNum = inventorydetailSearch[i].getValue("custrecord_djkk_location_barcode","location","GROUP");//SUB+四桁の倉庫番号 20230321 CH378 add by zhou 
			json.location_Num = locationNum.substr(-4);//四桁の倉庫番号 20230321 add by zhou 
			json.location = inventorydetailSearch[i].getText("location",null,"GROUP");
			json.item_name_E_line1 = inventorydetailSearch[i].getValue("custitem_djkk_product_name_line1","item","GROUP");//アイテム.英語Line1 20230321 CH378 add by zhou 
			json.item_name_E_line2 = inventorydetailSearch[i].getValue("custitem_djkk_product_name_line2","item","GROUP");//アイテム.英語Line2 20230321 CH378 add by zhou 
//			json.inv_Num = inventorydetailSearch[i].getValue("quantityonhand","inventoryNumber","MAX");//管理番号ごとの在庫数量 20230321 CH378 add by zhou 
			
			json.SMC= inventorydetailSearch[i].getValue("custrecord_djkk_smc_code","inventoryDetailLines","MAX");//SMC
			json.in_location_no= inventorydetailSearch[i].getValue("custrecord_djkk_warehouse_code","inventoryDetailLines","MAX");//DJ_倉庫入庫番号 20230321 CH378 add by zhou 
			json.maker_serial_no= inventorydetailSearch[i].getValue("custrecord_djkk_maker_serial_code","inventoryDetailLines","MAX");//DJ_メーカー製造ロット番号 20230321 CH378 add by zhou 
			json.shipmentdate= inventorydetailSearch[i].getValue("custrecord_djkk_shipment_date","inventoryDetailLines","MAX");//DJ_出荷可能期限日 20230321 CH378 add by zhou 
			json.lot_remark= inventorydetailSearch[i].getValue("custrecord_djkk_lot_remark","inventoryDetailLines","MAX");//DJ_ロットリマーク 20230321 CH378 add by zhou 
			json.control_number= inventorydetailSearch[i].getValue("custrecord_djkk_control_number","inventoryDetailLines","MAX"), //DJ_メーカーシリアル番号 20230321 CH378 add by zhou 
			json.lot_memo= inventorydetailSearch[i].getValue("custrecord_djkk_lot_memo","inventoryDetailLines","MAX"), //DJ_ロットメモ 20230321 CH378 add by zhou 
			json.make_ymd= inventorydetailSearch[i].getValue("custrecord_djkk_make_ymd","inventoryDetailLines","MAX"),//DJ_製造年月日 20230321 CH378 add by zhou 
//			json.binNumber= inventorydetailSearch[i].getValue("binnumber","binNumber","GROUP"), //保管棚番号 20230321 CH378 add by zhou 
			json.binNumber= inventorydetailSearch[i].getValue("internalid","binNumber","GROUP"), //保管棚番号 20230321 CH378 add by zhou
			json.inventorynumber_id = inventorydetailSearch[i].getValue("internalid","inventoryNumber","GROUP");
			json.inventorynumber = inventorydetailSearch[i].getValue("inventorynumber","inventoryNumber","GROUP");
			var itemGroup= inventorydetailSearch[i].getValue("custitem_djkk_product_group","item","MAX");
			var itemGroupSearch = getSearchResults("customrecord_djkk_product_group",null,
					[
					  ["name" ,"is" ,itemGroup ]
					], 
					[
					   new nlobjSearchColumn("internalid"), 
					   new nlobjSearchColumn("name")
					]
					);
			if(!isEmpty(itemGroupSearch) && itemGroupSearch[0].getValue("name") == itemGroup ){
				json.item_group = itemGroupSearch[0].getValue("internalid");
			}else{
				json.item_group = '';
			}
			json.item_detial= inventorydetailSearch[i].getValue("salesdescription","item","MAX");
			json.item_unit= inventorydetailSearch[i].getValue("stockunit","item","MAX");
			var _irime = inventorydetailSearch[i].getValue("custitem_djkk_perunitquantity","item","MAX");
			json.item_irime= isEmpty(_irime) ? '1' : _irime;
			
			json.in_location_date= inventorydetailSearch[i].getValue("trandate","transaction","MAX");
			var department= inventorydetailSearch[i].getValue("department","transaction","MAX");//セクション
			var bland= inventorydetailSearch[i].getValue("custitem_djkk_class", "item", "MAX");//ブランド
//			json.department=department.split('')[0];//セクションコード
//			json.bland=bland.split('')[0];//ブランド コード
			
			json.department=department;//セクションコード
			
			var blandSearch = getSearchResults("classification",null,
					[
			           ["name","is",bland ]
					], 
					[
					   new nlobjSearchColumn("name"),
					   new nlobjSearchColumn("internalid")
					]
					);
			if(!isEmpty(blandSearch) && blandSearch[0].getValue("name") == bland ){
				json.bland = blandSearch[0].getValue("internalid");//ブランド コード
			}else{
				json.bland = '';
			}
			
			
			
			json.expirationdate= inventorydetailSearch[i].getValue("expirationdate",null,"MAX");
			
			//単価実際金額合計に設定している　下は　該当内容／数量
			json.price= inventorydetailSearch[i].getValue("serialnumbercost","transaction","SUM");
			
			//アセンブリ対応ため
			if(isEmpty(json.price)){
				json.price = inventorydetailSearch[i].getValue("total","transaction","MAX")/inventorydetailSearch[i].getValue("quantity","transaction","MAX")
			}
			

			json.po= inventorydetailSearch[i].getValue("createdfrom","transaction","MAX");
			json.type = inventorydetailSearch[i].getValue("type","transaction","MAX");
			if(isEmpty(json.type)){
				json.type = inventorydetailSearch[i].getText("type","transaction","MAX");
			}
			json.tranid = inventorydetailSearch[i].getValue("tranid","transaction","MAX");
			json.tranInternalid = inventorydetailSearch[i].getValue("internalid","transaction","MAX");
			json.tran_count = inventorydetailSearch[i].getValue("itemcount",null,"MAX");
			json.sub = inventorydetailSearch[i].getValue("subsidiary","transaction","MAX");
			json.vendorname= inventorydetailSearch[i].getValue("vendorname","item","GROUP");//add by zhou 20230320 CH396 仕入先商品コード
			json.itemMainName= inventorydetailSearch[i].getValue("custitem_dkjj_item_pdf_show","item","GROUP");//add by zhou 20230320 CH396 仕入先商品コード
			json.BDD = inventorydetailSearch[i].getValue("custitem_djkk_shelf_life","item","GROUP");//add by zhou 20230627 CH589 DJ_SHELF LIFE（DAYS） /出荷期限日
			arrDetial.push(json);
			
			governanceYield();

			
			}
			
			//結果　構成
			var rst = new Array();
			//アイテムが主体場合
			for(var i = 0 ; i < arr.length ;i++){
				var json= new Object();
				json = findDetial(arr[i].item,arr[i].location,arr[i].inventorynumber,arrDetial);
				
				
				if(isEmpty(json)){
					continue;
				}
				
				//発注書ある場合発注書とする
				if(json.po.indexOf('発注書')< 0){
					setDetial(json,arrDetial);
				}
				
				
				json.itemcount = arr[i].itemcount;
				json.price = parseInt(json.price/json.itemcount);
				rst.push(json);
			}
	
			
		}	
		
	}
	//20230807 changed by zhou end
	//TODO
	//ロットリマック
	var lotRemarkRst = nlapiSearchRecord("customrecord_djkk_lot_remark",null,
			[
			], 
			[
			   new nlobjSearchColumn("name"),
			   new nlobjSearchColumn("internalid")
			]
			);
	
	var lorRemarkList = new Array();
	if(!isEmpty(lotRemarkRst)){
		for(var i = 0 ; i < lotRemarkRst.length ; i++){
			lorRemarkList[lotRemarkRst[i].getValue("internalid")]=lotRemarkRst[i].getValue("name");
		}
	}
	
//	//ロットリマック
//	var lotRemarkRst = nlapiSearchRecord("customrecord_djkk_lot_remark",null,
//			[
//			], 
//			[
//			   new nlobjSearchColumn("name"),
//			   new nlobjSearchColumn("internalid")
//			]
//			);
//	
//	var lorRemarkList = new Array();
//	if(!isEmpty(lotRemarkRst)){
//		for(var i = 0 ; i < lotRemarkRst.length ; i++){
//			lorRemarkList[lotRemarkRst[i].getValue("internalid")]=lotRemarkRst[i].getValue("name");
//		}
//	}
	
	//会社
	var subRst = nlapiSearchRecord("subsidiary",null,
			[
			], 
			[
			   new nlobjSearchColumn("name"),
			   new nlobjSearchColumn("internalid")
			]
			);
	var subList = new Array();
	if(!isEmpty(subRst)){
		for(var i = 0 ; i < subRst.length ; i++){
			subList[subRst[i].getValue("internalid")]=subRst[i].getValue("name");
		}
	}
	
	for(var i = 0 ; i < rst.length;i++){
		try{
//			nlapiLogExecution('debug','RST',JSON.stringify(rst[i]))
			var historyRecord = nlapiCreateRecord('customrecord_djkk_inv_report_history');
			historyRecord.setFieldValue('custrecord_djkk_inv_report_date', defaultEmpty(defaultEmpty(nlapiDateToString(getSystemTime()))))
			historyRecord.setFieldValue('custrecord_djkk_inv_report_invno', defaultEmpty(rst[i].inventorynumber) )
			historyRecord.setFieldValue('custrecord_djkk_inv_report_item', defaultEmpty(rst[i].item_id)) //item_id => item
			historyRecord.setFieldValue('custrecord_djkk_inv_report_itemdec', defaultEmpty(rst[i].item_detial)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_group', defaultEmpty(rst[i].item_group))
			historyRecord.setFieldValue('custrecord_djkk_inv_report_unit', defaultEmpty(rst[i].item_unit)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_irime', defaultEmpty(rst[i].item_irime)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_location', defaultEmpty(rst[i].location_id)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_price', defaultEmpty(rst[i].price)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_in_loc_no', defaultEmpty(rst[i].in_location_no)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_maker_no', defaultEmpty(rst[i].maker_serial_no)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_in_loc_date', defaultEmpty(rst[i].in_location_date)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_lot_remark', defaultEmpty(lorRemarkList.indexOf(rst[i].lot_remark) > 0 ? lorRemarkList.indexOf(rst[i].lot_remark) : null)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_validity_date', defaultEmpty(rst[i].expirationdate)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_qty', defaultEmpty(rst[i].itemcount)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_type', defaultEmpty(rst[i].type)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_tran', defaultEmpty(rst[i].tranInternalid)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_po', defaultEmpty(rst[i].po)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_sub', defaultEmpty(subList.indexOf(rst[i].sub) > 0 ? subList.indexOf(rst[i].sub) : null)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_bin', defaultEmpty(rst[i].binNumber)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_qa_qc', defaultEmpty(rst[i].item_qaqc)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_brand', defaultEmpty(rst[i].bland)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_ship_date', defaultEmpty(rst[i].shipmentdate)) 
			//20230724 add by zhou start
			historyRecord.setFieldValue('custrecord_djkk_inv_report_department', defaultEmpty(rst[i].department)) //セクション
			historyRecord.setFieldValue('custrecord_djkk_inv_report_smc', defaultEmpty(rst[i].SMC)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_lot_memo', defaultEmpty(rst[i].lot_memo)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_ctl_num', defaultEmpty(rst[i].control_number)) 
			historyRecord.setFieldValue('custrecord_djkk_inv_report_make_ymd', defaultEmpty(rst[i].make_ymd))
			//20230724 add by zhou end
			nlapiSubmitRecord(historyRecord)
			governanceYield();
		}catch(e){
			nlapiLogExecution('ERROR','RST',JSON.stringify(rst[i]))
			nlapiLogExecution('ERROR', 'レコード登録エラー', e.message);
//			nlapiLogExecution('ERROR', 'レコード登録エラー', rst[i]);
			governanceYield();
		}
		
	}

	
	nlapiLogExecution('DEBUG', 'Message', '在庫レポート過去データバッチ終了');
}


//単価とトランザクショ再設定
function setDetial(json,arr){
	var rst = json;
	rst.po = '-'
	if(!isEmpty(arr)){		
		for(var i = 0 ; i < arr.length ; i++){
			//在庫番号ID→在庫番号 倉庫見ない
//			nlapiLogExecution('DEBUG', arr[i].inventorynumber,  arr[i].po)
			if(arr[i].item_id == json.item_id  && arr[i].inventorynumber == json.inventorynumber && arr[i].po.indexOf('発注書') >= 0){
				
				rst.po = arr[i].po;
				//rst.price = arr[i].price;
				break;
			}
			
		}
	}
	return rst;
}

function findDetial(item,location,inventorynumber,arr){
	var rst = null;
	if(!isEmpty(arr)){		
		for(var i = 0 ; i < arr.length ; i++){
			//在庫番号ID→在庫番号 倉庫見ない
			if(arr[i].item_id == item && arr[i].location_id == location && arr[i].inventorynumber == inventorynumber){
				return (arr[i]);
			}		
		}
	}
	return rst;
}

function governanceYield() {
	if (parseInt(nlapiGetContext().getRemainingUsage()) <= 300) {
		var state = nlapiYieldScript();
		if (state.status == 'FAILURE') {
			nlapiLogExecution('DEBUG', 'Failed to yield script.');
		} else if (state.status == 'RESUME') {
			nlapiLogExecution('DEBUG', 'Resuming script');
		}
	}
}
function defaultEmpty(src){
	return src || '';
}