/**
 * 実地棚卸
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jul 2021     admin
 *
 */

/**
 * @param {String}
 *            type Context Types: scheduled, ondemand, userinterface, aborted,
 *            skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug', '実地棚卸指示開始');

	var div = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_div');
	var strId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_id');
	var subsidiary = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_sub');
	var locationValue = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_location');
	var userValue = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_user');
	var roleValue = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_role');
	nlapiLogExecution('DEBUG', 'タイプ', div);
	if(isEmpty(strId)){
		nlapiLogExecution('debug', '', '処理対象ありません');
		return ;
	}
	
	var strArr = new Array();
	strArr = strId.split(",");
	
	//5.26複数アイテムを一つ在庫調整に表示対応byWang Step1
	
	
	var locationArr_old = new Array();
	for(var i = 0 ; i < strArr.length ; i ++){
		
		if(isEmpty(strArr[i])){
			continue;
		}
		var paramArr = strArr[i].split("_");
		var location_id = paramArr[2];
		locationArr_old.push(location_id);
	}
	var locationArr_new = locationArr_old;
	for(var i =0;i<locationArr_new.length;i++){
		for(var j=i+1;j<locationArr_new.length;j++){
			if(locationArr_new[i] == locationArr_new[j]){
				locationArr_new.splice(j,1);
				j--;
			}
		}
	}
	
	var strArr_old = new Array();
	for(var i = 0 ; i < strArr.length ; i ++){
		strArr_old.push(strArr[i].split("_"));
	}
	var strArr_new = strArr_old.sort(ascend);
	
	
	
	
	var locationNew = 0;
	var actualArr = new Array();
	
	for(var i = 0 ; i < strArr_new.length-1 ; i ++){	//todo

		if(isEmpty(strArr_new[i])){
			continue;
		}
		governanceYield();
		var paramArr = strArr_new[i]
		var item_id = paramArr[0];
		var inv_no = paramArr[1];
		var location_id = paramArr[2];
		var binnumber_id = paramArr[3];
		var vo_or_cu_id = paramArr[4];
		var count = paramArr[5];
		var count_real = paramArr[6];
		var averagecost = paramArr[7];
		var expirationdate = paramArr[8];
		//changed by geng add start U705
		var item_brand = paramArr[9];
		var item_product_code = paramArr[10];
		var item_displayname = paramArr[11];
		var item_remark = paramArr[12];
		var item_name_english = paramArr[13];
		var item_vendorname = paramArr[14];
		var item_perunitquantity = paramArr[15];
		var item_memo = paramArr[16];
		var location = paramArr[17];
	
		
		actualArr.push({
			item_id:item_id,//アイテムId
			inv_no:inv_no,//管理番号
			location_id:location_id,//場所ID
			binnumber_id:binnumber_id,//保管棚ID
			vo_or_cu_id:vo_or_cu_id, //仕入先ID
			count:count,//在庫
			count_real:count_real,//実地数量
			averagecost:averagecost,//金額
			expirationdate:expirationdate, //賞味期限
			item_brand:item_brand,//ブランド
			item_product_code:item_product_code,//カタログコード 
			item_displayname:item_displayname,//商品名
			item_remark:item_remark,//ロットリマーク 
			item_name_english:item_name_english,//商品名英語
			item_vendorname:item_vendorname,//仕入先商品コード
			item_perunitquantity:item_perunitquantity,//入り数
			item_memo:item_memo, //アイテム説明
			location:location,//場所名
		});
		//changed by geng add end U705	
	}
	
	//2022/11/28 changed by song start  U711
	if (div == '1') {
		try{
			var rec = nlapiCreateRecord('customrecord_djkk_body_shedunloading');  //実地棚卸承認画面
			rec.setFieldValue('custrecord_djkk_shedunloading_sub',subsidiary); //連結
			rec.setFieldValue('custrecord_djkk_shedunloading_createuser',userValue); //作成者
			rec.setFieldValue('custrecord_djkk_shedunloading_location',locationValue); //場所
			rec.setFieldValue('custrecord_djkk_shedunloading_date',nlapiDateToString(getSystemTime())); //日付
			rec.setFieldValue('custrecord_djkk_shedunloading_flg','T');
			var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//トランザクション承認管理表
					[
					   ["isinactive","is","F"], 
					   "AND", 
					   ["custrecord_djkk_trans_appr_obj","anyof",13],
					   "AND",
					   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //作成ロール
					   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //第一承認ロール
					   
					]
					);
			if(!isEmpty(approvalSearch)){
				for(var j = 0; j < approvalSearch.length; j++){
					var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//作成ロール
					var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//第一承認ロール
					if(createRole == roleValue){
						rec.setFieldValue('custrecord_djkk_shedunloading_createrole',createRole);//DJ_作成ロール
						rec.setFieldValue('custrecord_djkk_shedunloading_next_role',appr1_role); //DJ_次の承認ロール
					}
				}
			}
			for(var a = 0;a<actualArr.length;a++){
				rec.selectNewLineItem('recmachcustrecord_djkk_body_shedunloading_list')
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_lin_num', a+1);//行
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_subsidiary_list', subsidiary);//連結
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_shed_item', actualArr[a].item_id);//アイテムId
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_item_memo', actualArr[a].item_memo);//アイテム説明
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_inv_no', actualArr[a].inv_no);//管理番号
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_inv_no2', actualArr[a].inv_no);//管理番号
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_location', actualArr[a].location_id);//場所ID
				rec.setCurrentLineItemText('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_brand', actualArr[a].item_brand);//ブランド
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_product_code', actualArr[a].item_product_code);//カタログコード
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_displayname', actualArr[a].item_displayname);//商品名
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_remark', actualArr[a].item_remark);//ロットリマーク
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_name_english', actualArr[a].item_name_english);//商品名英語
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_vendorname', actualArr[a].item_vendorname);//仕入先商品コード
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_perunitquantity', actualArr[a].item_perunitquantity);//入り数
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_binnumber', actualArr[a].binnumber_id);//保管棚番号
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_vo_or_cu', actualArr[a].vo_or_cu_id);//仕入先ID
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_averagecost', actualArr[a].averagecost);//金額
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_amount', actualArr[a].averagecost);//金額チェック
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_expirationdate', actualArr[a].expirationdate);//賞味期限
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_library', actualArr[a].count);//在庫
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_actual_quantity', actualArr[a].count_real);//実地数量
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_explain', '棚卸作成');//説明
				rec.commitLineItem('recmachcustrecord_djkk_body_shedunloading_list');
			}
			
			nlapiSubmitRecord(rec);
		}
		catch(e){
			nlapiLogExecution('ERROR', 'エラー', e.message)
		}
	}else if(div == '2'){
		try{
			var rec = nlapiCreateRecord('customrecord_djkk_custbody_shedunloading');  //預かり在庫実地棚卸承認画面
			rec.setFieldValue('custrecord_djkk_body_sub',subsidiary); //連結
			rec.setFieldValue('custrecord_djkk_body_createuser',userValue); //作成者
			rec.setFieldValue('custrecord_djkk_body_location',locationValue); //場所
			rec.setFieldValue('custrecord_djkk_body_date',nlapiDateToString(getSystemTime())); //日付
			rec.setFieldValue('custrecord_djkk_body_flg','T');
			var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//トランザクション承認管理表
					[
					   ["isinactive","is","F"], 
					   "AND", 
					   ["custrecord_djkk_trans_appr_obj","anyof",14],
					   "AND",
					   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //作成ロール
					   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //第一承認ロール
					   
					]
					);
			if(!isEmpty(approvalSearch)){
				for(var j = 0; j < approvalSearch.length; j++){
					var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//作成ロール
					var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//第一承認ロール
					if(createRole == roleValue){
						rec.setFieldValue('custrecord_djkk_body_createrole',createRole);//DJ_作成ロール
						rec.setFieldValue('custrecord_djkk_body_next_role',appr1_role); //DJ_次の承認ロール
					}
				}
			}
			var binumArr = new Array();
			for(var a = 0;a<actualArr.length;a++){
				binumArr.push(actualArr[a].binnumber_id);
			}
			 var custodyArr = new Array();
			 var custodySearch = nlapiSearchRecord("customrecord_djkk_inventory_in_custody_l",null,
					 [
				
	                    ["internalid","anyof",binumArr], 
	                        
					 ], 
					 [
					    new nlobjSearchColumn("custrecord_djkk_icl_inventory_in_custody"), //DJ_預かり在庫
					    new nlobjSearchColumn("custrecord_djkk_createdfrom","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null), 
					    new nlobjSearchColumn("custrecord_djkk_icl_inventorydetails"), 
					    new nlobjSearchColumn("custrecord_djkk_icl_conversionrate"), 
					    new nlobjSearchColumn("custrecord_djkk_icl_unit"), 
					    new nlobjSearchColumn("custrecord_djkk_icl_cuslocation"), 
					    new nlobjSearchColumn("custrecord_djkk_icl_inventorylocation"),
					    new nlobjSearchColumn("internalid")
					 ]
					 );
				for(var k = 0;k < custodySearch.length;k++){
					var custody = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_inventory_in_custody"));//DJ_預かり在庫
					var createdfrom = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_createdfrom","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null));//DJ_預かり在庫-作成元
					var inventorydetailsID = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_inventorydetails")); //DJ_在庫詳細ID
					var conversionrate = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_conversionrate")); //DJ_入目
					var unit = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_unit")); //DJ_単位
					var cuslocation = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_cuslocation")); //DJ_預かり在庫場所
					var inventorylocation = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_inventorylocation")); //DJ_元の場所
					var internalid = defaultEmpty(custodySearch[k].getValue("internalid")); //DJ_元の場所
					

					custodyArr.push({
						custody:custody,//DJ_預かり在庫
						createdfrom:createdfrom,//DJ_預かり在庫-作成元
						inventorydetailsID:inventorydetailsID,//DJ_在庫詳細ID
						conversionrate:conversionrate,//DJ_入目
						unit:unit,//DJ_単位
						cuslocation:cuslocation,//DJ_預かり在庫場所
						inventorylocation:inventorylocation, //DJ_元の場所
						internalid:internalid,//内部id
					})
				}
			 for(var u = 0;u<actualArr.length;u++){
				 rec.selectNewLineItem('recmachcustrecord_djkk_custody_stock_list');
				 for(var o = 0;o<custodyArr.length;o++){
					 if(actualArr[u].binnumber_id == custodyArr[o].internalid){
						 	governanceYield();
						 	rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_lin_num', o+1);//行
						 	rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_lin_sub', subsidiary);//DJ_連結
						 	rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_storage_id',actualArr[u].binnumber_id);//DJ_預かり在庫-明細ID
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_shed_item', actualArr[u].item_id);//預かり在庫アイテム名
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_item_memo', actualArr[u].item_brand);//DJ_預かり在庫アイテム説明
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_stock_no', actualArr[u].inv_no);//預かり在庫シリアル/ロット番号
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_stock_no2', actualArr[u].inv_no);//預かり在庫シリアル/ロット番号
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_location', actualArr[u].location_id);//預かり在庫場所 
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_location_id', actualArr[u].item_displayname);//DJ_預かり在庫ID
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_binnumber', actualArr[u].item_product_code);//DJ_預かり在庫保管棚番号
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_purchase', actualArr[u].vo_or_cu_id);//預かり在庫優先顧客
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_library', actualArr[u].count);//預かり在庫在庫
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_actual_quantity', actualArr[u].count_real);//預かり在庫実地数量
							
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_createdfrom',custodyArr[o].createdfrom);//DJ_預かり在庫作成元
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_library_id',custodyArr[o].inventorydetailsID);//在庫詳細ID
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_eye',custodyArr[o].conversionrate);//DJ_入り目
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_company',custodyArr[o].unit);//DJ_単位
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_warehouse',custodyArr[o].cuslocation);//DJ_預かり在庫場所
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_origina_location',custodyArr[o].inventorylocation);//元の場所
														
							rec.commitLineItem('recmachcustrecord_djkk_custody_stock_list');
					 }
				 }
			 }
					
			nlapiSubmitRecord(rec, false, true);
			
		}
		catch(e){
			nlapiLogExecution('ERROR', 'エラー', e.message)
		}
	}
	//2022/11/28 changed by song end  U711
	
	

	nlapiLogExecution('debug', '実地棚卸指示終了');
}

function ascend(x,y){
    return x[2] - y[2];  //order by location
}
function defaultEmpty(src){
	return src || '';
}
