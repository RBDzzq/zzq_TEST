/**
 * DJ_実地棚卸承認画面CS
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Nov 2022     宋
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	if(type == 'edit'){
		var nowRole = nlapiGetRole();
		var nowUser = nlapiGetUser();
		var createRole = nlapiGetFieldValue('custrecord_djkk_shedunloading_createrole');  //DJ_作成ロール
		var createUser = nlapiGetFieldValue('custrecord_djkk_shedunloading_createuser');//DJ_作成者
		var status = nlapiGetFieldValue('custrecord_djkk_shedunloading_status');//DJ_承認ステータス
		if(!isEmpty(status)&& status!= '4'){
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_subsidiary_list',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_shed_item',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_item_memo',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_inv_no',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_location',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_brand',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_product_code',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_displayname',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_remark',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_name_english',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_vendorname',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_perunitquantity',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_binnumber',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_vo_or_cu',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_amount',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_expirationdate',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_library',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_actual_quantity',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_explain',true);
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_averagecost',true);
		}else if(isEmpty(status)){
			if(nowRole == createRole && nowUser == createUser){
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_shed_item',false);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_item_memo',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_inv_no',false);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_location',false);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_brand',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_product_code',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_displayname',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_remark',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_name_english',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_vendorname',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_perunitquantity',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_binnumber',false);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_vo_or_cu',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_amount',false);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_expirationdate',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_library',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_actual_quantity',false);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_explain',false);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_averagecost',false);
			}else{
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_subsidiary_list',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_shed_item',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_item_memo',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_inv_no',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_location',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_brand',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_product_code',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_displayname',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_remark',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_name_english',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_vendorname',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_perunitquantity',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_binnumber',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_vo_or_cu',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_amount',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_expirationdate',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_library',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_actual_quantity',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_explain',true);
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_averagecost',true);
			}
		}
		if(nowRole == '1022'){
			nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_phy_averagecost',false);
		}	
	}
	
}

function clientSaveRecord(){
	var count = nlapiGetLineItemCount('recmachcustrecord_djkk_body_shedunloading_list');//明細
	for(var n=1;n<count+1;n++){
		var linNum = nlapiGetLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_lin_num',n);
		if(isEmpty(linNum)){
			nlapiSetLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_lin_num',n,n);
		}
	}
	return true;
}


function start(){
	alert('異常発生');
}

function clientFieldChanged(type, name, linenum) {
	if(name == 'custrecord_djkk_phy_averagecost'){
		var amountCheck = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_phy_amount');//金額チェック
		var libraryNum = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_library');//DJ_在庫
		var quantityNum = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_actual_quantity');//DJ_実地数量
		if(libraryNum > quantityNum){
			alert("金額は入力できません");
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_averagecost', amountCheck, false, true);
		}	
	}
		
	if(name == 'custrecord_djkk_shed_item'){
		var shed_item  = nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_shed_item');
		var subList  = nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_subsidiary_list');
		var itemSearch = nlapiSearchRecord("item",null,
				[
				   ["internalid","anyof",shed_item], 
				   "AND", 
				   ["subsidiary","anyof",subList]
				], 
				[
				   new nlobjSearchColumn("custitem_djkk_product_code"), //DJ_カタログ製品コード
				   new nlobjSearchColumn("displayname"), //商品名
				   new nlobjSearchColumn("vendorname"), //仕入先商品コード
				   new nlobjSearchColumn("salesdescription"),//アイテム説明
				   new nlobjSearchColumn("custitem_djkk_perunitquantity"),//DJ_入り数
				   new nlobjSearchColumn("custitemnumber_djkk_lot_remark","inventoryNumber",null),//DJ_ロットリマーク
				   new nlobjSearchColumn("custitem_djkk_product_name_line1"),//DJ_品名（英語）LINE1
				   new nlobjSearchColumn("custitem_djkk_product_name_line2"),//DJ_品名（英語）LINE1
				   new nlobjSearchColumn("usebins"),//保管棚を使用
				   new nlobjSearchColumn("expirationdate","inventoryNumber"),
				   new nlobjSearchColumn("vendor"),
				   new nlobjSearchColumn("custitem_djkk_class"),
				]
				);
		if(!isEmpty(itemSearch)){
			var product_code = itemSearch[0].getValue("custitem_djkk_product_code");
			var displayname = itemSearch[0].getValue("displayname");
			var vendorname = itemSearch[0].getValue("vendorname");
			var vendor = itemSearch[0].getValue("vendor");
			var salesdescription = itemSearch[0].getValue("salesdescription");
			var inventoryNumber = itemSearch[0].getValue("custitemnumber_djkk_lot_remark","inventoryNumber",null);
			var line1 = itemSearch[0].getValue("custitem_djkk_product_name_line1");
			var line2 = itemSearch[0].getValue("custitem_djkk_product_name_line2");
			var usebins = itemSearch[0].getValue("usebins");	
			var brand = itemSearch[0].getValue("custitem_djkk_class");	
			var expirationdate = itemSearch[0].getValue("expirationdate","inventoryNumber");
			var perunitquantity = itemSearch[0].getValue("custitem_djkk_perunitquantity");
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_product_code', product_code, false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_displayname', displayname, false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_vendorname', vendorname, false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_item_memo', salesdescription, false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_remark', inventoryNumber, false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_name_english', line1 +""+line2, false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_expirationdate', expirationdate, false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_vo_or_cu', vendor, false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_brand', brand, false, true);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_perunitquantity', perunitquantity, false, true);
			if(usebins == 'F'){
				nlapiDisableLineItemField('recmachcustrecord_djkk_body_shedunloading_list','custrecord_binnumber',true);
			}
		}
		
	}
	if(name == 'custrecord_djkk_inv_no'){
		var amountCheck = nlapiGetCurrentLineItemValue(type,'custrecord_djkk_inv_no2');//DJ_管理番号
		if(isEmpty(amountCheck)){
			var library = 0;
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_library', library, false, true);
		}else{
			alert('変更不可');
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_inv_no', amountCheck, false, true);
		}
	}
	
}