/**
 * 
 * 在庫レポート 過去履歴
 * Version    Date            Author           Remarks
 * 1.00       2021/04/27     CPC_
 *
 */


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	nlapiLogExecution('DEBUG', 'Message', 'start');
	 var form = nlapiCreateForm('DJ_在庫レポート_履歴', false);
	 form.setScript('customscript_djkk_cs_inv_report_history');
	 
	 //パラメータ取得
	 var selectFlg = request.getParameter('selectFlg');
	 var fieldDateValue = request.getParameter('fieldDate');
	 var filedItemValue = request.getParameter('filedItem');
	 var filedItemGroupValue = request.getParameter('filedItemGroup');
	 var filedBrandValue = request.getParameter('filedBrand');
	 var filedCategoryValue = request.getParameter('filedCategory');
	 var filedLocationValue = request.getParameter('filedLocation');
	 var filedLocationShelfValue = request.getParameter('filedLocationShelf');
	 var filedValidityStartValue = request.getParameter('filedValidityStart');
	 var filedValidityEndValue = request.getParameter('filedValidityEnd');
	 var filedShipStartValue = request.getParameter('filedShipStart');
	 var filedShipEndValue = request.getParameter('filedShipEnd');
	 var filedValidityFlgValue = request.getParameter('filedValidityFlg');
	 var filedShipFlgValue = request.getParameter('filedShipFlg');
	 var filedStockPeriodValue = request.getParameter('filedStockPeriod');
	 var filedValidityPercentValue = request.getParameter('filedValidityPercent')
	 var filedValidityPercentValue50 = request.getParameter('filedValidityPercent50')
	 var filedSubValue = request.getParameter('sub');
	 var fieldAmtShowFlgValue = request.getParameter('amtShowFlg');
	 var filedLotRemarkValue = request.getParameter('lotRemark');
	 var fieldShagaihiValue = request.getParameter('shagaihi');
	 if(!isEmpty(filedSubValue)&&(filedSubValue == SUB_SCETI ||  filedSubValue == SUB_DPKK)){
		 var filedDepartmentValue = request.getParameter('filedDepartment');////20230322 add by zhou CH382 フィルダーへ追加する必要：セッション
	 }
	 //初期場合社外秘チェックする
	 if(isEmpty(fieldAmtShowFlgValue)){
		 fieldAmtShowFlgValue = 'T';
	 }
	 //画面項目追加
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '検索戻す','searchReturn()')
	 }else{
		 form.addButton('btn_search', '検索', 'search()')
		 form.addButton('btn_clear', 'クリア', 'clearf()')
		 
	 }
		

		form.addFieldGroup('select_group_date', '日付検索');
		form.addFieldGroup('other', '検索項目');
		
		//第１列
		
		var filedValidityStart =form.addField('custpage_inventory_report_validity_start', 'date', '有効期限（開始日）', null, 'select_group_date')
		var filedShipStart =form.addField('custpage_inventory_report_ship_start', 'date', '出荷可能日（開始日）', null, 'select_group_date')
		var filedValidityPercent =form.addField('custpage_inventory_validity_percent', 'select', '有効期間（食品G：賞味期限）', '', 'select_group_date')
		//20230606 add by zhou start CH417
		if(filedSubValue == SUB_SCETI ||  filedSubValue == SUB_DPKK){
			filedValidityPercent.setDisplayType('hidden');
		}
		var usersub=getRoleSubsidiary()
		if(usersub == SUB_SCETI ||  usersub == SUB_DPKK){
			filedValidityPercent.setDisplayType('hidden');
		}
		//20230606 add by zhou end
		
		//var filedValidityPercent50 =form.addField('custpage_inventory_validity_percent50', 'checkbox', '有効期間（50%）', '', 'select_group_date');
		var filedValidityFlg =form.addField('custpage_inventory_validity_flg', 'checkbox', '有効期限切れ', null, 'select_group_date');	
		
		//第２列
		var filedValidityEnd =form.addField('custpage_inventory_report_validity_end', 'date', '有効期限 （終了日）', null, 'select_group_date');
		var filedShipEnd =form.addField('custpage_inventory_report_ship_end', 'date', '出荷可能日（終了日）', null, 'select_group_date');
//		var filedStockPeriod =form.addField('custpage_stockperiod', 'select', '在庫期間', '', 'select_group_date');//20230606 changed by zhou CH417 before
		var filedStockPeriod =form.addField('custpage_stockperiod', 'select', '在庫経過期間', '', 'select_group_date');//20230606 changed by zhou CH417
		
		//第３列
		var fieldShagaihi = form.addField('custpage_shagaihi', 'checkbox', '社外秘', null, 'select_group_date');
		
//		var filedShipFlg =form.addField('custpage_inventory_ship_flg', 'checkbox', '出荷可能日切れ', null, 'select_group_date');//20230606 changed by zhou CH417 before
		var filedShipFlg =form.addField('custpage_inventory_ship_flg', 'checkbox', '出荷可能期限切れ', null, 'select_group_date');//20230606 changed by zhou CH417
		
		var fieldDate = form.addField('custpage_inventory_report_date', 'date', '基準日', null, 'select_group_date').setMandatory(true);
		
//		var fieldAmtShowFlg = form.addField('custpage_amt_show_flg', 'checkbox', '金額表示', null, 'select_group_date');//20230606 changed by zhou CH417 before
		var fieldAmtShowFlg = form.addField('custpage_amt_show_flg', 'checkbox', '原価表示', null, 'select_group_date');//20230606 changed by zhou CH417
		
		
		
		
		
		var filedISub =form.addField('custpage_sub', 'select', '連結','', 'other').setMandatory(true);
		var selectSub = getRoleSubsidiariesAndAddSelectOption(filedISub);
		 if(isEmpty(filedSubValue)){
			 filedSubValue = selectSub;
		 }
		
		var filedLocation =form.addField('custpage_inventory_report_location', 'select', '倉庫 （ロケーション）', '', 'other')
		
//		var filedLocationShelf =form.addField('custpage_inventory_report_location_shelf', 'multiselect', '倉庫ビン （棚番）', null, 'other')//20230606 changed by zhou CH417 before
		var filedLocationShelf =form.addField('custpage_inventory_report_location_shelf', 'multiselect', '保管棚', null, 'other')//20230606 changed by zhou CH417
		
		var filedItem =form.addField('custpage_inventory_report_item', 'multiselect', '商品',null, 'other')			
		if( filedSubValue == SUB_SCETI ||  filedSubValue == SUB_DPKK){
			filedItem.setDisplaySize(450,14);
		}
		var filedItemGroup =form.addField('custpage_inventory_report_item_group', 'multiselect', '商品グループ', null, 'other')							
		var filedBrand =form.addField('custpage_inventory_report_brand', 'multiselect', 'ブランド', null, 'other');		
		var filedCategory =form.addField('custpage_inventory_report_category', 'select', 'QA/QCカテゴリー', 'customlist_djkk_qaqc', 'other');
		filedCategory.setDisplayType('hidden');
		var filedLotRemark =form.addField('custpage_lot_remark', 'select', 'ロットリマーク', '', 'other');
		if( filedSubValue == SUB_SCETI ||  filedSubValue == SUB_DPKK){
			var filedDepartment =form.addField('custpage_department', 'select', 'セッション', '', 'other');//20230322 add by zhou CH382 フィルダーへ追加する必要：セッション
		}	
		var lot_remarkSearch = nlapiSearchRecord("customrecord_djkk_lot_remark",null,
				[
				   (filedSubValue == SUB_DJKK) ? [] : ["custrecord_djkk_lot_remark_subsidiary","anyof",filedSubValue]
				], 
				[
				 new nlobjSearchColumn("internalid"), 
				 new nlobjSearchColumn("name")
				]
				);
		filedLotRemark.addSelectOption('', '');
		if (!isEmpty(lot_remarkSearch)) {
			for (var rlms = 0; rlms < lot_remarkSearch.length; rlms++) {
				filedLotRemark.addSelectOption(lot_remarkSearch[rlms].getValue('internalid'), lot_remarkSearch[rlms].getValue('name'));
				
			}
		}
		//20230322 add by zhou CH382 start フィルダーへ追加する必要：セッション 
		if( filedSubValue == SUB_SCETI ||  filedSubValue == SUB_DPKK){
			var departmentSearch = nlapiSearchRecord("department",null,
					[
					   (filedSubValue == SUB_DJKK) ? [] : ["subsidiary","anyof",filedSubValue]
					], 
					[
					 new nlobjSearchColumn("internalid"), 
					 new nlobjSearchColumn("name")
					]
					);
			filedDepartment.addSelectOption('', '');
			if (!isEmpty(departmentSearch)) {
				for (var dep = 0; dep < departmentSearch.length; dep++) {
					filedDepartment.addSelectOption(departmentSearch[dep].getValue('internalid'), departmentSearch[dep].getValue('name'));
					
				}
			}	
		}
		//20230322 add by zhou CH382 end
		
		//倉庫設定
		//保管棚検索用
		var binParam = new Array();

		var locationSearch = getSearchResults("location",null,
				[
				 (filedSubValue == SUB_DJKK) ? [] : ["subsidiary","anyof",filedSubValue]
				], 
				[
				   new nlobjSearchColumn("name").setSort(false), 
				   new nlobjSearchColumn("internalid")
				]
				);
		filedLocation.addSelectOption('', '')
		if(!isEmpty(locationSearch)){
			binParam.push("location");
			binParam.push("anyof");
			for(var i = 0 ; i < locationSearch.length ; i++){
				binParam.push(locationSearch[i].getValue("internalid"));
				filedLocation.addSelectOption(locationSearch[i].getValue("internalid"), locationSearch[i].getValue("name"))
			}
		}
		
		//複数リスト対応
		//アイテム
		//20230330 add by zhou CH382 start
		if( filedSubValue == SUB_SCETI ||  filedSubValue == SUB_DPKK){
			var itemSearchFliter = [];
			itemSearchFliter.push((filedSubValue == SUB_DJKK ) ? [] : ["subsidiary","anyof",filedSubValue]);
			if(!isEmpty(filedBrandValue)&& filedBrandValue != '-999'){
				filedBrandValue = filedBrandValue.split('');//20230615 add by zhou CH657
				itemSearchFliter.push("AND")
				itemSearchFliter.push(["class","anyof",filedBrandValue]);
			}
			itemSearchFliter.push("AND")
			itemSearchFliter.push(["type","anyof","Assembly","InvtPart"]);
		var filedItemList = getSearchResults("item",null,
				[
						itemSearchFliter
				], 
				[
				   new nlobjSearchColumn("internalid"), 
					   new nlobjSearchColumn("itemid").setSort(false),
					   new nlobjSearchColumn("displayname"),
					   new nlobjSearchColumn("custitem_djkk_product_code"),
					   new nlobjSearchColumn("vendorname"),
				]
				);
		filedItem.addSelectOption('-999', 'すべて');
			if(!isEmpty(filedItemList)){
		for(var i = 0; i<filedItemList.length;i++){
					var itemCode = defaultEmpty(filedItemList[i].getValue("itemid"));
					itemCode = itemCode ? itemCode + '&nbsp;' : "";
					var productCode = defaultEmpty(filedItemList[i].getValue("custitem_djkk_product_code"));
					productCode = productCode ? productCode + '&nbsp;' : "";
					var itemVendorname = defaultEmpty(filedItemList[i].getValue("vendorname"));//item 仕入先商品コード
					itemVendorname = itemVendorname ? itemVendorname + '&nbsp;' : "";
					var itemName = defaultEmpty(filedItemList[i].getValue("displayname"));
					filedItem.addSelectOption(filedItemList[i].getValue("internalid"),itemCode + productCode +itemVendorname +itemName);
				}
			}
		//20230330 add by zhou CH382 end
		}else{
			var itemSearchFliter = [];
			//20230706 changed by zhou start ページ初期化ロード異常バグ制御
//			itemSearchFliter.push((filedSubValue == SUB_DJKK ) ? [] : ["subsidiary","anyof",filedSubValue]);//bug fliter
			if(!isEmpty(filedSubValue)){
				itemSearchFliter.push(["subsidiary","anyof",filedSubValue]);
			}else{
				itemSearchFliter.push(["subsidiary","anyof",getRoleSubsidiary()]);
			}
			//20230706 changed by zhou end
			if(!isEmpty(filedBrandValue)&& filedBrandValue != '-999'){
				filedBrandValue = filedBrandValue.split('');//20230615 add by zhou CH657
				itemSearchFliter.push("AND")
				itemSearchFliter.push(["class","anyof",filedBrandValue]);
			}
			itemSearchFliter.push("AND")
			itemSearchFliter.push(["type","anyof","Assembly","InvtPart"]);
		var filedItemList = getSearchResults("item",null,
				[
				 	itemSearchFliter
				], 
				[
				   new nlobjSearchColumn("internalid"), 
//				   new nlobjSearchColumn("itemid").setSort(false)//20230516 changed by zhou
				   new nlobjSearchColumn("custitem_dkjj_item_pdf_show").setSort(false)
				]
				);
		filedItem.addSelectOption('-999', 'すべて');
			if(!isEmpty(filedItemList)){
		for(var i = 0; i<filedItemList.length;i++){
//					filedItem.addSelectOption(filedItemList[i].getValue("internalid"),filedItemList[i].getValue("itemid"));//20230516 changed by zhou
					var itemName = filedItemList[i].getValue("custitem_dkjj_item_pdf_show");
					itemName = itemName.split('||')[0];
					filedItem.addSelectOption(filedItemList[i].getValue("internalid"),itemName);//20230516 changed by zhou
				}
			}
		}

		//商品グループ
		var filedItemGroupList = getSearchResults("customrecord_djkk_product_group",null,
				[
				 (filedSubValue == SUB_DJKK) ? [] : ["custrecord_djkk_pg_subsidiary","anyof",filedSubValue]
				], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("name").setSort(false)
				]
				);
		filedItemGroup.addSelectOption('-999', 'すべて');
		if(!isEmpty(filedItemGroupList)){
		for(var i = 0; i<filedItemGroupList.length;i++){
			filedItemGroup.addSelectOption(filedItemGroupList[i].getValue("internalid"),filedItemGroupList[i].getValue("name"));
		}
		}
		
		
		//ブランド
		var filedBrandList = getSearchResults("classification",null,
				[
				 (filedSubValue == SUB_DJKK) ? [] : ["custrecord_djkk_cs_subsidiary","anyof",filedSubValue], //20230322 add by zhou CH382
				 //brand無効外す制限を追加  20230606 add by zhou
		           "AND", 
		           ["isinactive","is","F"]
				], 
				[
				   new nlobjSearchColumn("name").setSort(false), 
				   new nlobjSearchColumn("internalid")
				]
				);
		filedBrand.addSelectOption('-999', 'すべて');
		for(var i = 0; i<filedBrandList.length;i++){
			filedBrand.addSelectOption(filedBrandList[i].getValue("internalid"),filedBrandList[i].getValue("name"));
		}
		
		//倉庫ビン （棚番）
		var filedLocationShelfList = getSearchResults("bin",null,
				[
				 isEmpty(filedLocationValue) ? binParam : ["location","anyof",filedLocationValue]
				], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("binnumber").setSort(false)
				]
				);

		filedLocationShelf.addSelectOption('-999', 'すべて');
		for(var i = 0; i<filedLocationShelfList.length;i++){
			filedLocationShelf.addSelectOption(filedLocationShelfList[i].getValue("internalid"),filedLocationShelfList[i].getValue("binnumber"));
		}
		
		//パラメータデフォルト値
		//日付はシステム日付
		if(isEmpty(fieldDateValue)){
			fieldDateValue = nlapiDateToString(new Date());
		}
		
		filedStockPeriod.addSelectOption('', '',true )
		filedStockPeriod.addSelectOption(1, '１カ月以内', false)
		filedStockPeriod.addSelectOption(3, '3カ月以内', false)
		filedStockPeriod.addSelectOption(6, '6カ月以内', false)
		filedStockPeriod.addSelectOption(12, '1年以内', false)
		filedStockPeriod.addSelectOption(13, '1年以上', false)
		//20230516 changed by zhou start
		if( filedSubValue != SUB_SCETI &&  filedSubValue != SUB_DPKK){
		filedValidityPercent.addSelectOption('', '',true )
			filedValidityPercent.addSelectOption(0.3, '30%以下', false);
		filedValidityPercent.addSelectOption(0.5, '50%以下', false);
			filedValidityPercent.addSelectOption(1, '100%以下', false);
		}else{
		filedValidityPercent.addSelectOption('', '',true )
			filedValidityPercent.addSelectOption(0, '0%', false);
			filedValidityPercent.addSelectOption(0.3, '30%以下', false);
		filedValidityPercent.addSelectOption(0.5, '50%以下', false);
			filedValidityPercent.addSelectOption(1, '100%以下', false);
		}
		//20230516 changed by zhou end
		
		
		if(selectFlg == 'T'){
			var subsidiary = filedSubValue;
			fieldDate.setDisplayType('inline');
			filedISub.setDisplayType('inline')	
			filedItem.setDisplayType('inline')	
			filedItemGroup.setDisplayType('inline')	
			filedBrand.setDisplayType('inline')	
			//filedCategory.setDisplayType('inline')	
			filedLocation.setDisplayType('inline')	
			filedLocationShelf.setDisplayType('inline')	
			filedValidityStart.setDisplayType('inline')	
			filedValidityEnd.setDisplayType('inline')	
			filedShipStart.setDisplayType('inline')	
			filedShipEnd.setDisplayType('inline')	
			filedValidityFlg.setDisplayType('inline')	
			filedShipFlg.setDisplayType('inline')	
			filedStockPeriod.setDisplayType('inline')
			filedValidityPercent.setDisplayType('inline')
			//filedValidityPercent50.setDisplayType('inline')
			fieldAmtShowFlg.setDisplayType('inline')
			filedLotRemark.setDisplayType('inline')
			if( filedSubValue == SUB_SCETI ||  filedSubValue == SUB_DPKK){
				filedDepartment.setDisplayType('inline')//20230322 add by zhou CH382 フィルダーへ追加する必要：セッション
			}
			fieldShagaihi.setDisplayType('inline')
		}
		
		filedISub.setDefaultValue(filedSubValue);
		fieldDate.setDefaultValue(fieldDateValue);	
		filedItem.setDefaultValue(filedItemValue)
		filedItemGroup.setDefaultValue(filedItemGroupValue)
		filedBrand.setDefaultValue(filedBrandValue)
		filedCategory.setDefaultValue(filedCategoryValue)
		filedLocation.setDefaultValue(filedLocationValue)
		filedLocationShelf.setDefaultValue(filedLocationShelfValue)
		filedValidityStart.setDefaultValue(filedValidityStartValue)
		filedValidityEnd.setDefaultValue(filedValidityEndValue)
		filedShipStart.setDefaultValue(filedShipStartValue)
		filedShipEnd.setDefaultValue(filedShipEndValue)
		filedValidityFlg.setDefaultValue(filedValidityFlgValue)
		filedShipFlg.setDefaultValue(filedShipFlgValue)
		filedStockPeriod.setDefaultValue(filedStockPeriodValue)
		fieldAmtShowFlg.setDefaultValue(fieldAmtShowFlgValue)
		filedLotRemark.setDefaultValue(filedLotRemarkValue)
		if( filedSubValue == SUB_SCETI ||  filedSubValue == SUB_DPKK){
			
			filedDepartment.setDefaultValue(filedDepartmentValue)//20230322 add by zhou CH382 フィルダーへ追加する必要：セッション
		}
		fieldShagaihi.setDefaultValue(fieldShagaihiValue)
		
		//賞味期限50%チェックボックス対応
//		if(filedValidityPercentValue50 == 'T'){
//			filedValidityPercentValue = '0.5';
//		}
		filedValidityPercent.setDefaultValue(filedValidityPercentValue)
		//filedValidityPercent50.setDefaultValue(filedValidityPercentValue50)
		

		if(selectFlg == 'T'){
			var subsidiary = filedSubValue; //add by zhou
			//保存検索パラメータ設定
			var selectParameter = new Array();
			selectParameter.push(["custrecord_djkk_inv_report_date","on",fieldDateValue])
			
			//アイテム
			if(!isEmpty(filedItemValue)){
				if(filedItemValue.indexOf('-999')<0){
					var filedItemValueArr = filedItemValue.split('');
					selectParameter.push("AND");
					var arrItem = new Array();
					arrItem.push("custrecord_djkk_inv_report_item")
					arrItem.push("anyof")
					for(var i = 0 ; i < filedItemValueArr.length; i++){
						arrItem.push(filedItemValueArr[i])
					}
					selectParameter.push(arrItem);
				}
			}
			
			//アイテムグループ
			if(!isEmpty(filedItemGroupValue)){
				if(filedItemGroupValue.indexOf('-999')<0){
					var filedItemGroupValueArr = filedItemGroupValue.split('');
					selectParameter.push("AND");
					var arrItemGroup = new Array();
					arrItemGroup.push("custrecord_djkk_inv_report_group")
					arrItemGroup.push("anyof")
					for(var i = 0 ; i < filedItemGroupValueArr.length; i++){
						arrItemGroup.push(filedItemGroupValueArr[i])
					}
					selectParameter.push(arrItemGroup);
				}

				
			}
			
			if(!isEmpty(filedBrandValue)){		
				if(filedBrandValue.indexOf('-999')<0){
					//20230629 changed by zhou start
					if(filedBrandValue.indexOf('')>0){
					var filedBrandValueArr = filedBrandValue.split('');
					}
					var filedBrandValueArr = filedBrandValue;
					selectParameter.push("AND");
					var arrItemBrand = new Array();
					arrItemBrand.push("custrecord_djkk_inv_report_brand")
					arrItemBrand.push("anyof")
					arrItemBrand.push(filedBrandValueArr)
//					for(var i = 0 ; i < filedBrandValueArr.length; i++){
//						arrItemBrand.push(filedBrandValueArr[i])
//					}
					//20230629 changed by zhou end
					selectParameter.push(arrItemBrand);
				}
				
			}
			
			//qaqc
			if(!isEmpty(filedCategoryValue)){
				selectParameter.push("AND");
				selectParameter.push(["custrecord_djkk_inv_report_qa_qc","anyof",filedCategoryValue]);
			}
			
			//倉庫
			if(!isEmpty(filedLocationValue)){	
//				var filedLocationValueArr = filedLocationValue.split('');
//				selectParameter.push("AND");
//				var arrlocation = new Array();
//				arrlocation.push("custrecord_djkk_inv_report_location")
//				arrlocation.push("anyof")
//				for(var i = 0 ; i < filedLocationValueArr.length; i++){
//					arrlocation.push(filedLocationValueArr[i])
//				}
//				selectParameter.push(arrlocation);
				
				//上記親倉庫のみ検索する。
				selectParameter.push("AND");
				selectParameter.push(["custrecord_djkk_inv_report_location.name","contains",nlapiLookupField('location', filedLocationValue, 'name')])
			}
			
			
			//連結
			if(!isEmpty(filedSubValue)){
				selectParameter.push("AND")
				selectParameter.push(["custrecord_djkk_inv_report_sub","anyof",filedSubValue])
			}
			
			//保管棚
			if(!isEmpty(filedLocationShelfValue)){
				if(filedLocationShelfValue.indexOf('-999')<0){

					
					var filedLocationShelfValueArr = filedLocationShelfValue.split('');
					selectParameter.push("AND");
					var arrlocationShelf = new Array();
					arrlocationShelf.push("custrecord_djkk_inv_report_bin")
					arrlocationShelf.push("anyof")
					for(var i = 0 ; i < filedLocationShelfValueArr.length; i++){
						arrlocationShelf.push(filedLocationShelfValueArr[i])
					}
					selectParameter.push(arrlocationShelf);
				}
				
			}
			
			
			//出荷日超える基準日と紐づける
			if(filedShipFlgValue == 'T'){
				selectParameter.push("AND");
				selectParameter.push(["custrecord_djkk_inv_report_ship_date","onorbefore",fieldDateValue]);
			}
			
			//有効期間超える基準日と紐づける
//			if(filedValidityFlgValue == 'T'){
//				selectParameter.push("AND");
//				selectParameter.push(["custrecord_djkk_inv_report_validity_date","onorbefore",fieldDateValue]);
//			}
			
			//20230712 changed by zhou CH732 start
			if(filedValidityPercentValue != 1 && filedValidityFlgValue == 'T'){
				selectParameter.push("AND");
				selectParameter.push(["custrecord_djkk_inv_report_validity_date","onorbefore","today"]);
			}else if(filedValidityFlgValue == 'F'){
				selectParameter.push("AND");
				selectParameter.push(["custrecord_djkk_inv_report_validity_date","onorafter","today"]);
			}
			//20230712 changed by zhou CH732 end
			
			//有効期間
			if(!isEmpty(filedValidityStartValue) && !isEmpty(filedValidityEndValue)){
				selectParameter.push("AND");
				selectParameter.push(["custrecord_djkk_inv_report_validity_date","within",filedValidityStartValue,filedValidityEndValue]);
			}
			
			//出荷日
			if(!isEmpty(filedShipStartValue) && !isEmpty(filedShipEndValue)){
				selectParameter.push("AND");
				selectParameter.push(["custrecord_djkk_inv_report_ship_date","within",filedShipStartValue,filedShipEndValue]);
			}

			//ロートリマーク
			if(!isEmpty(filedLotRemarkValue) ){
				selectParameter.push("AND");
				selectParameter.push(["custrecord_djkk_inv_report_lot_remark","anyof",filedLotRemarkValue]);
			}
			
			//在庫期間
			if (!isEmpty(filedStockPeriodValue)) {			
				selectParameter.push("AND");
				if (filedStockPeriodValue == 1) {
					selectParameter.push(["custrecord_djkk_inv_report_tran.trandate","within",getTargetDate(nlapiStringToDate(fieldDateValue), -30),fieldDateValue]);
				} else if (filedStockPeriodValue == 3) {
					selectParameter.push(["custrecord_djkk_inv_report_tran.trandate","within",getTargetDate(nlapiStringToDate(fieldDateValue), -90),fieldDateValue]);
				} else if (filedStockPeriodValue == 6) {
					selectParameter.push(["custrecord_djkk_inv_report_tran.trandate","within",getTargetDate(nlapiStringToDate(fieldDateValue), -180),fieldDateValue]);
				} else if (filedStockPeriodValue == 12) {
					selectParameter.push(["custrecord_djkk_inv_report_tran.trandate","within",getTargetDate(nlapiStringToDate(fieldDateValue), -365),fieldDateValue]);
				}else if (filedStockPeriodValue == 13){
					selectParameter.push(["custrecord_djkk_inv_report_tran.trandate","onorbefore",getTargetDate(nlapiStringToDate(fieldDateValue), -366)]);
				}
			}
			
			//賞味期限検索
			if(!isEmpty(filedValidityPercentValue)){
				selectParameter.push("AND");
				selectParameter.push(["custrecord_djkk_inv_report_validity_date","isnotempty",""]);

				var validtySearchRst = getSearchResults("customrecord_djkk_inv_report_history",null,selectParameter, 
						[
						   new nlobjSearchColumn("custrecord_djkk_inv_report_validity_date"), 
						   new nlobjSearchColumn("formulatext").setFormula(" ({custrecord_djkk_inv_report_validity_date}-{custrecord_djkk_inv_report_tran.trandate})"), 
						   new nlobjSearchColumn("trandate","CUSTRECORD_DJKK_INV_REPORT_TRAN",null), 
						   new nlobjSearchColumn("internalid")
						]
						);
				
				//条件設定
				var idParam = new Array();
				if(!isEmpty(validtySearchRst)){
					idParam.push("internalid")
					idParam.push("anyof")
					for(var i = 0 ; i < validtySearchRst.length ; i ++){
						
						var percent = getDaysBetween(fieldDateValue,validtySearchRst[i].getValue("trandate","CUSTRECORD_DJKK_INV_REPORT_TRAN"))/Number(validtySearchRst[i].getValue("formulatext"))
						if(filedValidityPercentValue >= percent){
							idParam.push(validtySearchRst[i].getValue("internalid"));
						}
						
					}
					selectParameter.push("AND");
					selectParameter.push(idParam);
				}
			}
			
			
			
			nlapiLogExecution('DEBUG', 'selectParameter', JSON.stringify(selectParameter));

			var inventorydetailSearch = getSearchResults("customrecord_djkk_inv_report_history",null,
					[
					 selectParameter
					], 
					[
					   /***************old*****************/
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_group").setSort(false), //DJ_アイテムグループ
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_item").setSort(false), //DJ_アイテム
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_location").setSort(false), //DJ_倉庫//場所
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_invno").setSort(false),//DJ_在庫番号
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_date"),//DJ_日付 
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_itemdec"), //DJ_アイテム説明
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_unit"), //DJ_アイテム単位
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_irime"), //DJ_入り目
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_price"), //DJ_単価
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_in_loc_no"), //DJ_倉庫入庫番号
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_maker_no"), //DJ_メーカー製造番号
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_in_loc_date"), //DJ_入庫日
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_lot_remark"), //DJ_ロットリマーク
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_validity_date"), //DJ_有効期間
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_qty"), //DJ_数量
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_type"), //DJ_トランザクション種類
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_tran"), //DJ_トランザクション
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_sub"), //DJ_連結
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_bin"), //DJ_保管棚
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_brand"), //DJ_ブランド
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_qa_qc"),//DJ_QA/QCカテゴリー
//					   new nlobjSearchColumn("custrecord_djkk_inv_report_po"),//DJ_PO
					   /***************old*****************/
					   /***************new*****************/
					   //20230724 add by zhou start
//					   new nlobjSearchColumn("class","CUSTRECORD_DJKK_INV_REPORT_ITEM",null), 
//					   new nlobjSearchColumn("trandate","CUSTRECORD_DJKK_INV_REPORT_TRAN",null), 
//					   new nlobjSearchColumn("custrecord_djkk_location_barcode","CUSTRECORD_DJKK_INV_REPORT_LOCATION",null)
					  
					   

					   new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"),
					   new nlobjSearchColumn("displayname","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"),//item 商品名
					   new nlobjSearchColumn("custitem_djkk_product_code","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"),//item DJ_カタログ製品コード
					   new nlobjSearchColumn("custitem_djkk_qaqc","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"),//item DJ_QA/QCグループ
					   new nlobjSearchColumn("custitem_djkk_product_group","CUSTRECORD_DJKK_INV_REPORT_ITEM","MAX").setSort(false), 
					   new nlobjSearchColumn("CUSTRECORD_DJKK_INV_REPORT_ITEM",null,"GROUP").setSort(false),    
					   new nlobjSearchColumn("salesdescription","CUSTRECORD_DJKK_INV_REPORT_ITEM","MAX"), 
					   new nlobjSearchColumn("stockunit","CUSTRECORD_DJKK_INV_REPORT_ITEM","MAX"), 
					   new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_INV_REPORT_LOCATION","GROUP").setSort(false), 
					   new nlobjSearchColumn("custrecord_djkk_location_barcode","CUSTRECORD_DJKK_INV_REPORT_LOCATION","GROUP"), //SUB+四桁の倉庫番号 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custitem_djkk_product_name_line1","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"),//アイテム.英語Line1 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custitem_djkk_product_name_line2","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"),//アイテム.英語Line2 20230321 CH378 add by zhou
					   
					   
					   
					   new nlobjSearchColumn("internalid",null,"GROUP"),
					   new nlobjSearchColumn("custrecord_djkk_inv_report_invno",null,"GROUP"),//ロットシリアル番号 =管理番号
					   

                       new nlobjSearchColumn("custrecord_djkk_inv_report_smc",null,"MAX"), //SMC 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custrecord_djkk_inv_report_ctl_num",null,"MAX"), //DJ_メーカーシリアル番号 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custrecord_djkk_inv_report_lot_memo",null,"MAX"), //DJ_ロットメモ 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custrecord_djkk_inv_report_make_ymd",null,"MAX"),//DJ_製造年月日 20230321 CH378 add by zhou 			   
				
					   new nlobjSearchColumn("custrecord_djkk_inv_report_lot_remark",null,"MAX"), //DJ_ロットリマーク 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custrecord_djkk_inv_report_in_loc_no",null,"MAX"), //DJ_倉庫入庫番号 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custrecord_djkk_inv_report_maker_no",null,"MAX"), //DJ_メーカー製造ロット番号 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custrecord_djkk_inv_report_ship_date",null,"MAX"),//DJ_出荷可能期限日 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custrecord_djkk_inv_report_validity_date",null,"MAX"), //DJ_有効期間
					   new nlobjSearchColumn("custrecord_djkk_inv_report_qty",null,"MAX"),//倉庫入庫番号ごとの数量??
					   new nlobjSearchColumn("custrecord_djkk_inv_report_bin",null,"GROUP"), //保管棚番号 20230321 CH378 add by zhou 
					   
//					   new nlobjSearchColumn("trandate","CUSTRECORD_DJKK_INV_REPORT_TRAN","MAX"), //トランザクション日付
//					   new nlobjSearchColumn("department","CUSTRECORD_DJKK_INV_REPORT_TRAN","MAX"),//セクション 20230321 CH378 add by zhou 
//					   new nlobjSearchColumn("class","CUSTRECORD_DJKK_INV_REPORT_TRAN","MAX"),//ブランド 20230321 CH378 add by zhou 
//					   new nlobjSearchColumn("createdfrom","CUSTRECORD_DJKK_INV_REPORT_TRAN","MAX"),//トランザクション作成元
//					   new nlobjSearchColumn("type","CUSTRECORD_DJKK_INV_REPORT_TRAN","MAX"),//トランザクションタイプ
//					   new nlobjSearchColumn("tranid","CUSTRECORD_DJKK_INV_REPORT_TRAN","MAX"), //トランザクションID
//					   new nlobjSearchColumn("serialnumbercost","CUSTRECORD_DJKK_INV_REPORT_TRAN","SUM"),// シリアル番号コスト
					
					   new nlobjSearchColumn("custrecord_djkk_inv_report_in_loc_date",null,"MAX"), //トランザクション日付
					   new nlobjSearchColumn("custrecord_djkk_inv_report_department",null,"MAX"),//セクション 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custrecord_djkk_inv_report_brand",null,"MAX"),//ブランド 20230321 CH378 add by zhou 
					   new nlobjSearchColumn("custrecord_djkk_inv_report_po",null,"MAX"),//トランザクション作成元
					   new nlobjSearchColumn("custrecord_djkk_inv_report_type",null,"MAX"),//トランザクションタイプ
					   new nlobjSearchColumn("custrecord_djkk_inv_report_tran",null,"MAX"), //トランザクションID
					   new nlobjSearchColumn("custrecord_djkk_inv_report_price",null,"SUM"),// シリアル番号コスト
					   
					   
//					   new nlobjSearchColumn("total","CUSTRECORD_DJKK_INV_REPORT_TRAN","MAX"),//??? total
//					   new nlobjSearchColumn("quantity","CUSTRECORD_DJKK_INV_REPORT_TRAN","MAX"),//???quantity
					   new nlobjSearchColumn("CUSTRECORD_DJKK_INV_REPORT_LOCATION",null,"GROUP"),//???quantity
					   new nlobjSearchColumn("custitem_djkk_perunitquantity","CUSTRECORD_DJKK_INV_REPORT_ITEM","MAX"),
					   new nlobjSearchColumn("custitem_dkjj_item_pdf_show","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"),//add by zhou 20230320 CH396 
					   new nlobjSearchColumn("vendorname","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"),//add by zhou 20230320 CH396 仕入先商品コード
					   new nlobjSearchColumn("custitem_djkk_shelf_life","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"),//add by zhou 20230627 DJ_SHELF LIFE（DAYS） /出荷期限日
					   //20230724 add by zhou end
					   /***************new*****************/
					]
					);	
			

			var rst = new Array();
			if(!isEmpty(inventorydetailSearch)){
				nlapiLogExecution('DEBUG', 'Message', '2');
				for(var i = 0 ; i < inventorydetailSearch.length ; i++){
					var json= new Object();
					/***************old*****************/
//					json.item_id = inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_item");
//					json.item = inventorydetailSearch[i].getText("custrecord_djkk_inv_report_item");
//					json.location_id = inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_location");
//					json.location = inventorydetailSearch[i].getText("custrecord_djkk_inv_report_location");
//					json.inventorynumber_id = inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_invno");
//					json.inventorynumber = inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_invno");
//					json.item_group= inventorydetailSearch[i].getText("custrecord_djkk_inv_report_group");
//					json.item_detial= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_itemdec");
//					json.item_unit= inventorydetailSearch[i].getText("custrecord_djkk_inv_report_unit");
//					var _irime = isEmpty(_irime) ? '1' : _irime;
//					json.item_irime= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_irime");
//					json.in_location_no= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_in_loc_no");
//					json.maker_serial_no= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_maker_no");
//					json.in_location_date= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_in_loc_date");
//					json.lot_remark= inventorydetailSearch[i].getText("custrecord_djkk_inv_report_lot_remark");
//					json.expirationdate= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_validity_date");
//					json.price= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_price");
//					json.po= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_po");
//					json.type = inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_type");
//					json.tranid = inventorydetailSearch[i].getText("custrecord_djkk_inv_report_tran");
//					json.itemcount=inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_qty");
					/***************old*****************/
					
					
					
					
					
					
					


					var json= new Object();
					json.item_id = inventorydetailSearch[i].getValue("internalid","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP");
					json.item = inventorydetailSearch[i].getText("CUSTRECORD_DJKK_INV_REPORT_ITEM",null,"GROUP");
					json.item_name = defaultEmpty(inventorydetailSearch[i].getValue("displayname","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"));
					json.product_code = defaultEmpty(inventorydetailSearch[i].getValue("custitem_djkk_product_code","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP"));
					json.location_id = inventorydetailSearch[i].getValue("internalid","CUSTRECORD_DJKK_INV_REPORT_LOCATION","GROUP");
					json.item_qaqc = inventorydetailSearch[i].getValue("custitem_djkk_qaqc","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP");//item DJ_QA/QCグループ
					var locationNum = inventorydetailSearch[i].getValue("custrecord_djkk_location_barcode","CUSTRECORD_DJKK_INV_REPORT_LOCATION","GROUP");//SUB+四桁の倉庫番号 20230321 CH378 add by zhou 
					json.location_Num = locationNum.substr(-4);//四桁の倉庫番号 20230321 add by zhou 
					json.location = inventorydetailSearch[i].getText("CUSTRECORD_DJKK_INV_REPORT_LOCATION",null,"GROUP");
					json.item_name_E_line1 = inventorydetailSearch[i].getValue("custitem_djkk_product_name_line1","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP");//アイテム.英語Line1 20230321 CH378 add by zhou 
					json.item_name_E_line2 = inventorydetailSearch[i].getValue("custitem_djkk_product_name_line2","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP");//アイテム.英語Line2 20230321 CH378 add by zhou 
			
					json.SMC= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_smc",null,"MAX");//SMC
					json.control_number= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_ctl_num",null,"MAX"), //DJ_メーカーシリアル番号 20230321 CH378 add by zhou 
					json.lot_memo= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_lot_memo",null,"MAX"), //DJ_ロットメモ 20230321 CH378 add by zhou 
					json.make_ymd= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_make_ymd",null,"MAX"),//DJ_製造年月日 20230321 CH378 add by zhou 
					json.lot_remark= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_lot_remark",null,"MAX");//DJ_ロットリマーク 20230321 CH378 add by zhou 
					json.in_location_no= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_in_loc_no",null,"MAX");//DJ_倉庫入庫番号 20230321 CH378 add by zhou 
					json.maker_serial_no= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_maker_no",null,"MAX");//DJ_メーカー製造ロット番号 20230321 CH378 add by zhou 
					json.shipmentdate= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_ship_date",null,"MAX");//DJ_出荷可能期限日 20230321 CH378 add by zhou 
					json.expirationdate= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_validity_date",null,"MAX");//DJ_有効期間
					json.itemcount = inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_qty",null,"MAX");//倉庫入庫番号ごとの数量??
					json.binNumber= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_bin",null,"GROUP"), //保管棚番号 20230321 CH378 add by zhou 
					json.inventorynumber_id = inventorydetailSearch[i].getValue("internalid",null,"GROUP");
					json.inventorynumber = inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_invno",null,"GROUP"),//ロットシリアル番号 =管理番号
					
					 
					json.item_group= inventorydetailSearch[i].getValue("custitem_djkk_product_group","CUSTRECORD_DJKK_INV_REPORT_ITEM","MAX");
					json.item_detial= inventorydetailSearch[i].getValue("salesdescription","CUSTRECORD_DJKK_INV_REPORT_ITEM","MAX");
					json.item_unit= inventorydetailSearch[i].getValue("stockunit","CUSTRECORD_DJKK_INV_REPORT_ITEM","MAX");
					var _irime = inventorydetailSearch[i].getValue("custitem_djkk_perunitquantity","CUSTRECORD_DJKK_INV_REPORT_ITEM","MAX");
					json.item_irime= isEmpty(_irime) ? '1' : _irime;
					
					json.in_location_date= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_in_loc_date",null,"MAX");
					var department= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_department",null,"MAX");//セクション
					var bland= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_brand",null,"MAX");//ブランド
					json.department=department.split('')[0];//セクションコード
					json.bland=bland.split('')[0];//ブランド コード
							
					//単価実際金額合計に設定している　下は　該当内容／数量
					json.price= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_price",null,"SUM");
//	//				json.total= inventorydetailSearch[i].getValue("serialnumbercost","CUSTRECORD_DJKK_INV_REPORT_TRAN","SUM");
					//アセンブリ対応ため
//					if(isEmpty(json.price)){
//						json.price = inventorydetailSearch[i].getValue("total","CUSTRECORD_DJKK_INV_REPORT_TRAN","MAX")/inventorydetailSearch[i].getValue("quantity","CUSTRECORD_DJKK_INV_REPORT_TRAN","MAX")
//					}
//					if(isEmpty(json.price)){
//						json.price = Number(json.total)/Number(json.itemcount);
//					}

					json.po= inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_po",null,"MAX");
					json.type = inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_type",null,"MAX");
					json.tranid = inventorydetailSearch[i].getValue("custrecord_djkk_inv_report_tran",null,"MAX");
					

					json.vendorname= inventorydetailSearch[i].getValue("vendorname","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP");//add by zhou 20230320 CH396 仕入先商品コード
					json.itemMainName= inventorydetailSearch[i].getValue("custitem_dkjj_item_pdf_show","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP");//add by zhou 20230320 CH396 仕入先商品コード
					json.BDD = inventorydetailSearch[i].getValue("custitem_djkk_shelf_life","CUSTRECORD_DJKK_INV_REPORT_ITEM","GROUP");//add by zhou 20230627 CH589 DJ_SHELF LIFE（DAYS） /出荷期限日
//					arrDetial.push(json);

					rst.push(json);
				}
			}
			
			nlapiLogExecution('DEBUG', 'Message', '3');
			//合計金額と数量を集計する
			if(!isEmpty(rst)){
				
				//場所合計
				var locationTotalArr = new Array();
				for(var i = 0 ; i < rst.length ; i++){
					var addFlg = false;
					var locationJson = {};
					for(var j = 0 ; j < locationTotalArr.length ; j++){
						if(locationTotalArr[j].location_id == rst[i].location_id && locationTotalArr[j].item_id == rst[i].item_id ){
							locationTotalArr[j].count +=  Number(rst[i].itemcount)
							locationTotalArr[j].amt += Number(rst[i].itemcount) * parseInt(Number(rst[i].price) <= 0 ? '0' : rst[i].price)
							locationTotalArr[j].price = parseInt(Number(locationTotalArr[j].amt)/Number(locationTotalArr[j].count));
							addFlg = true;
							break;
						}
					}
					
					if(!addFlg){						
						locationJson.item_id = rst[i].item_id;
						locationJson.item_name = rst[i].item_name;
						locationJson.location_id = rst[i].location_id;
						locationJson.count = isEmpty(rst[i].itemcount) ? 0 : Number(rst[i].itemcount);
						locationJson.amt = Number(rst[i].itemcount) * parseInt(Number(rst[i].price) <= 0 ? '0' : rst[i].price)
						locationJson.price = parseInt(locationJson.amt/locationJson.count);
						locationTotalArr.push(locationJson);
					}
					
				}
				
				
				
				//アイテム合計
				var itemTotalArr = new Array();
				for(var i = 0 ; i < rst.length ; i++){
					var addFlg = false;
					var itemJson = {};
					
					for(var j = 0 ; j < itemTotalArr.length ; j++){
						if(itemTotalArr[j].item_id == rst[i].item_id ){
							itemTotalArr[j].count +=  Number(rst[i].itemcount);
							itemTotalArr[j].amt += Number(rst[i].itemcount) * parseInt(Number(rst[i].price) <= 0 ? '0' : rst[i].price);
							addFlg = true;
							break;
						}
					}
					
					if(!addFlg){
						itemJson.item_id = rst[i].item_id
						itemJson.count = isEmpty(rst[i].itemcount) ? 0 : Number(rst[i].itemcount);
						itemJson.amt = Number(rst[i].itemcount) * parseInt(Number(rst[i].price) <= 0 ? '0' : rst[i].price);
						itemTotalArr.push(itemJson);
					}
				}
				
			}
	
			//EXCEL1出力する
			{

				var htmlNote='';
				htmlNote +='<div id="tablediv" style="overflow:scroll; height:600px; width:1500px; border:1px solid; border-bottom: 0;border-right: 0;">';
				htmlNote += '<table border="2" cellpadding="1" cellspacing="1" style=" width:1480px "　>';
				htmlNote += '<thead >';

				htmlNote += '<tr>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; font-size:20px;" ><b>在庫レポート</b></td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				if( subsidiary == SUB_SCETI ||  subsidiary == SUB_DPKK){
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';//add bv zhou 230320 CH382
				}
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">'+nlapiDateToString(getSystemTime())+'</td>';
				htmlNote += '</tr>';
				
				if(fieldShagaihiValue == 'T'){
					htmlNote += '<tr>';
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';

					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; font-weight: bold;color:#696969;font-size:50px;" ><b>社外秘</b></td>';
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
					if( subsidiary == SUB_SCETI ||  subsidiary == SUB_DPKK){
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>SMC番号</b></td>';//add bv zhou 230320 CH382
					}
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
					htmlNote += '</tr>';
				}
				
				
				htmlNote += '<tr>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';
				if( subsidiary == SUB_SCETI ||  subsidiary == SUB_DPKK){
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';//add bv zhou 230320 CH382
				}
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>';
				htmlNote += '</tr>';
				
				htmlNote += '<tr>';
//				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>アイテム</b></td>';//20230606 changed by zhou CH417 before
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>商品コード</b></td>';//20230606 changed by zhou CH417 
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
//				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>アイテム説明</b></td>';//20230606 changed by zhou CH417 before
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>日本語：商品名</b></td>';//20230606 changed by zhou CH417
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				if( subsidiary == SUB_SCETI ||  subsidiary == SUB_DPKK){
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';;//add bv zhou 230320 CH382
				}
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; color:#ff0000;"><b>数量</b></td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; color:#ff0000;"><b>在庫金額</b></td>';
				htmlNote += '</tr>';
				htmlNote += '<tr>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
//				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>倉庫ID</b></td>';//20230606 changed by zhou CH417 before
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>倉庫</b></td>';//20230606 changed by zhou CH417
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>単位</b></td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
				if( subsidiary == SUB_SCETI ||  subsidiary == SUB_DPKK){
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';//add bv zhou 230320 CH382
				}
//				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; color:#0000ff;"><b>平均単価</b></td>';//20230606 changed by zhou CH417 before
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; color:#0000ff;"><b>平均原価</b></td>';//20230606 changed by zhou CH417
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; color:#0000ff;"><b>数量</b></td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; color:#0000ff;"><b>在庫金額</b></td>';
				htmlNote += '</tr>';
				htmlNote += '<tr>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>倉庫入庫番号</b></td>';
//				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>メーカー製造番号</b></td>';//20230606 changed by zhou CH417 before
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>メーカ製造/シリアル番号</b></td>';//20230606 changed by zhou CH417
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>入庫日</b></td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>管理番号</b></td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>ロットリマーク</b></td>';
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>';
//				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>有効期間</b></td>';//20230606 changed by zhou CH417 before
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>有効期限</b></td>';//20230606 changed by zhou CH417
				if( subsidiary == SUB_SCETI ||  subsidiary == SUB_DPKK){
					htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>SMC番号</b></td>';//add bv zhou 230320 CH382
				}
//				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>単価</b></td>';//20230606 changed by zhou CH417 before
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>原価</b></td>';//20230606 changed by zhou CH417 before
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>数量</b></td>';
//				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>PO番号</b></td>';//20230606 changed by zhou CH417 before
				htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>参照番号</b></td>';//20230606 changed by zhou CH417
				htmlNote += '</tr>';
				
				
				htmlNote+='</thead>';
				if(!isEmpty(rst)){
					var htmlItemGroup = "";
					var htmlItem = "";
					var htmlLocation = "";
					rst = rst.sort();
					for(var i = 0 ; i<rst.length ; i++){

						if(htmlItemGroup != rst[i].item_group){
							htmlItemGroup = rst[i].item_group
							htmlNote += '<tr>'; 
//							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>アイテムグループ：</b></td>';//20230606 changed by zhou CH417 before
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>商品グループ：</b></td>';//20230606 changed by zhou CH417
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;"><b>'+htmlItemGroup+'</b></td>'; 
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>'; 
							if( subsidiary == SUB_SCETI ||  subsidiary == SUB_DPKK){
								htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>'; //add bv zhou 230320 CH382
							}
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none;">&nbsp;</td>'; 
							htmlNote += '</tr>'; 
						}
						
						if(htmlItem != rst[i].item_id){
							var itemJson = getItemTotal(itemTotalArr,rst[i].item_id);
							//社外秘
							if(fieldAmtShowFlgValue != 'T'){
								itemJson.count = '';
								itemJson.amt = '';
							}
							htmlItem = rst[i].item_id;
							htmlLocation  ="";
							htmlNote += '<tr>'; 
							
							//20221125 changed by zhou CH103 start
							//20230322 changed by zhou CH382 start
							//zhou memo :CH382「アイテムコード＋カタログコード＋仕入先商品コード＋商品名」 ＋　規格。⇒修正必要、アイテムマスタ中　アイテムPDF表示用。食品LS統合。
							if(subsidiary != SUB_SCETI && subsidiary != SUB_DPKK){
								htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none;">'+rst[i].item +'&nbsp;&nbsp;'+ rst[i].product_code +'&nbsp;&nbsp;'+ rst[i].item_name+'</td>'; 
							}else{
								htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none;">'+rst[i].item +'&nbsp;&nbsp;'+ rst[i].product_code +'&nbsp;&nbsp;'+  rst[i].vendorname +'&nbsp;&nbsp;'+ rst[i].item_name+'</td>'; 
							}
							//20230322 end  CH382
							//20221125 end  CH103 
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none;">'+rst[i].item_detial+'</td>'; 
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none;">&nbsp;</td>'; 
							if( subsidiary == SUB_SCETI ||  subsidiary == SUB_DPKK){
								htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none;">&nbsp;</td>'; //add bv zhou 230320 CH382 SMC番号
							}
							nlapiLogExecution('debug','in1','in1')
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none; color:#ff0000;"><b>'+thousandsWithComa(itemJson.count)+'</b></td>'; 
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-bottom:none; color:#ff0000;"><b>'+thousandsWithComa(itemJson.amt)+'</b></td>'; 
							htmlNote += '</tr>'; 
						}

						if(htmlLocation != rst[i].location_id){
							var locationJson = getLocationTotal(locationTotalArr,rst[i].item_id,rst[i].location_id);
							//20230630 changed by zhou  CH566 start
							//剰余が0の場合は剰余を表示しない
							if(Number(locationJson.count%rst[i].item_irime) != 0){
							var unitShow = '( '+parseInt(locationJson.count/rst[i].item_irime)+'CTN + '+locationJson.count%rst[i].item_irime+' '+rst[i].item_unit+' )';
							}else{
								var unitShow = '( '+parseInt(locationJson.count/rst[i].item_irime)+'CTN )';
							}
							//20230630 changed by zhou start
							//社外秘
							if(fieldAmtShowFlgValue != 'T'){
								locationJson.price = '';
								locationJson.count = '';
								locationJson.amt = '';
								unitShow = '&nbsp;';
							}
							
							htmlLocation = rst[i].location_id
							htmlNote += '<tr>'; 
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:1px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>'; 
							htmlNote += '<td style="border:1px solid; border-style:dashed; border-width:1px; border-left:none;border-right:none; ">'+rst[i].location+'</td>'; 
							htmlNote += '<td style="border:1px solid; border-style:dashed; border-width:1px; border-left:none;border-right:none; ">&nbsp;</td>'; 
							htmlNote += '<td style="border:1px solid; border-style:dashed; border-width:1px; border-left:none;border-right:none; ">'+unitShow+'</td>'; 
							htmlNote += '<td style="border:1px solid; border-style:dashed; border-width:1px; border-left:none;border-right:none; ">&nbsp;</td>'; 
							htmlNote += '<td style="border:1px solid; border-style:dashed; border-width:1px; border-left:none;border-right:none; ">&nbsp;</td>'; 
							if( subsidiary == SUB_SCETI ||  subsidiary == SUB_DPKK){
								htmlNote += '<td style="border:1px solid; border-style:dashed; border-width:1px; border-left:none;border-right:none; ">&nbsp;</td>'; //add bv zhou 230320 CH382 SMC番号
							}
							nlapiLogExecution('debug','in2','in2')
							htmlNote += '<td style="border:1px solid; border-style:dashed; border-width:1px; border-left:none;border-right:none; color:#0000ff;">'+ thousandsWithComa(locationJson.price)+'</td>'; 
							htmlNote += '<td style="border:1px solid; border-style:dashed; border-width:1px; border-left:none;border-right:none; color:#0000ff;"><b>'+ thousandsWithComa(locationJson.count)+'</b></td>'; 
							htmlNote += '<td style="border:1px solid; border-style:dashed; border-width:1px; border-left:none;border-right:none; color:#0000ff;"><b>'+ thousandsWithComa(locationJson.amt)+'</b></td>'; 
							htmlNote += '</tr>'; 
							
						}
						
						var _price = (parseInt(Number(rst[i].price) <= 0 ? '0' : (rst[i].price)))
						//社外秘
							if(fieldAmtShowFlgValue != 'T'){
								_price = '';
							}

						var tran = rst[i].po
						if(isEmpty(tran) || tran == '-'){
//							tran = rst[i].type + ' #'+rst[i].tranid;
							tran = rst[i].tranid;
						}
						
						htmlNote += '<tr>'; 
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none; color:#0000ff;">'+rst[i].in_location_no+'</td>'; 
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">'+rst[i].maker_serial_no+'</td>'; 
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">'+rst[i].in_location_date+'</td>'; 
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">'+rst[i].inventorynumber+'</td>'; 
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">'+rst[i].lot_remark+'</td>'; 
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">&nbsp;</td>'; 
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">'+rst[i].expirationdate+'</td>'; 
						if( subsidiary == SUB_SCETI ||  subsidiary == SUB_DPKK){
							htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">'+rst[i].SMC+'</td>'; //add bv zhou 230320 CH382 SMC
						}nlapiLogExecution('debug','in3','in3')
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">'+thousandsWithComa(_price)+'</td>'; 
						nlapiLogExecution('debug','in4','in4')
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none;">'+thousandsWithComa(rst[i].itemcount)+'</td>'; 
						htmlNote += '<td style="border:2px solid; border-left:none;border-right:none; border-top:none; border-bottom:none; color:#0000ff;">'+tran+'</td>'; 
						htmlNote += '</tr>';
						nlapiLogExecution('debug','in5','in5')
						
						
					}
				}

				
				htmlNote+='</table>';
				var feieldNote = form.addField('custpage_note', 'inlinehtml', '', '','');
				
				
				feieldNote.setDefaultValue(htmlNote);

			}
			
			//EXCEL2出力する
			{
				var htmlNote2 = '';
				
				/**/
				//20230206 changed by zhou start
//				if( subsidiary == SUB_NBKK ||  subsidiary == SUB_ULKK){
	
//				}else{
				
					
				htmlNote2+='<table border="0" cellpadding="0" cellspacing="0" >';
				htmlNote2+='<td colspan="12" style="text-align: center;">QSC_STOCK_WH_SET_NO_CHS_WH</td></tr>';
				htmlNote2+='<td colspan="12" style="text-align: center;"></td></tr>';
				htmlNote2+='<td >Activity</td>';//add bv zhou 230321 CH378 セクションコード  //

				htmlNote2+='<td >Warehouse</td>';  
				htmlNote2+='<td >WH Bin</td>';//add bv zhou 230321 CH378 保管棚  
				htmlNote2+='<td >Product Group</td>';  
				htmlNote2+='<td >Product Code</td>';  
				htmlNote2+='<td >Supplier Product Code</td>';//仕入先商品コード add bv zhou 230321 CH397  
//				if( subsidiary == SUB_NBKK ||  subsidiary == SUB_ULKK){
					htmlNote2+='<td >Catalogue Code</td>';//カタログコード（食品） add bv zhou 230321 CH378  
//				}
				htmlNote2+='<td >Product Description 1</td>';
				htmlNote2+='<td >Product Description 2</td>';
				
				htmlNote2+='<td >System Lot No</td>';//20230627 add by zhou CH589 TODO（管理番号）
				
				htmlNote2+='<td >Mfg Lot/Serial No</td>';//add bv zhou 230321 CH378 メーカー製造・シリアル番号  
				htmlNote2+='<td >SMC</td>';//add bv zhou 230321 CH378 SMC
				htmlNote2+='<td >Expiry Date</td>';//add bv zhou 230320 CH397  賞味期限  
				htmlNote2+='<td >Unit Stock Value</td>';
				htmlNote2+='<td >Quantity</td>';
				htmlNote2+='<td >Total Stock Value</td>';
				
				htmlNote2+='<td >PartsPerContainer</td>';//20230627 add by zhou CH589 TODO(入数)
				
				htmlNote2+='<td >Stock Balance (CTN)</td>';
				htmlNote2+='<td >Stock Balance (Loose)</td>';
				htmlNote2+='<td >WH Entry No</td>';//add bv zhou 230321 CH378 ロットシリアル番号 =管理番号
				htmlNote2+='<td >Lot Remark</td>';//add bv zhou 230321 CH378 ロットリマーク 
				htmlNote2+='<td >Lot Memo</td>';//add bv zhou 230321 CH378 ロットメモ  
				htmlNote2+='<td >QA/QC Category</td>';//add bv zhou 230321 CH378 ITEM.DJ_QA/QCグループ  
				htmlNote2+='<td >Brand</td>';//add bv zhou 230321 CH378 BLANDCODE  
				
				htmlNote2+='<td >First Entry</td>';//20230627 add by zhou CH589 TODO(入庫日)
				htmlNote2+='<td >BBD</td>';//20230627 add by zhou CH589 TODO(出荷期限日)
				htmlNote2+='<td >PO No</td>';//20230705 add by zhou  CH731 PO No
				htmlNote2+='</tr>';
				if(!isEmpty(rst)){
					for(var i = 0 ; i<rst.length ; i++){
						
						var _price = (parseInt(Number(rst[i].price) <= 0 ? '0' : (rst[i].price)))
						var _value = parseInt(rst[i].itemcount*_price);
						var _eStructureFI = 0;
						var _agCtnBalance = parseInt(rst[i].itemcount/rst[i].item_irime);
						var _ModBalance =parseInt(rst[i].itemcount%rst[i].item_irime);
						//社外秘
							if(fieldAmtShowFlgValue != 'T'){
								_price = '';
								_value = '';
							}
					    var newLocationNum = "\'" + rst[i].location_Num + "\'";//20230705 add by zhou CH730
					    //20230705 add by zhou start CH731
					    var tran = rst[i].po
						if(isEmpty(tran) || tran == '-'){
							tran = rst[i].tranid;
						}
					    tran  = tran.split(" ");
					    var tranNum = tran[1];
					    //20230705 add by zhou end CH731
						htmlNote2+='<tr>';
						htmlNote2+='<td >'+rst[i].department+'</td>';//add bv zhou 230320 CH378  セクションコード
						
						htmlNote2+='<td >'+newLocationNum+'</td>';//LocationID 20230705 changed by zhou CH730
						htmlNote2+='<td >'+rst[i].binNumber+'</td>';//add bv zhou 230320 CH378 保管棚
						htmlNote2+='<td >'+rst[i].item_group+'</td>';
						htmlNote2+='<td >'+rst[i].item+'</td>';
						htmlNote2+='<td >'+rst[i].vendorname+'</td>';//add bv zhou 230320 CH396  仕入先商品コード 
//						if( subsidiary == SUB_NBKK ||  subsidiary == SUB_ULKK){
							htmlNote2+='<td >'+rst[i].product_code+'</td>';//カタログコード（食品） add bv zhou 230321 CH378  
//						}
						htmlNote2+='<td >'+rst[i].item_name_E_line1+'</td>';//Description1
						htmlNote2+='<td >'+rst[i].item_name_E_line2+'</td>';//Description2
						htmlNote2+='<td >'+rst[i].inventorynumber+'</td>';//TODO
						htmlNote2+='<td >'+rst[i].maker_serial_no+'</td>';//add bv zhou 230321 CH378 メーカー製造・シリアル番号 
						htmlNote2+='<td >'+rst[i].SMC+'</td>';//add bv zhou 230320 CH378 SMC 
						htmlNote2+='<td >'+rst[i].expirationdate+'</td>';//add bv zhou 230320 CH397  賞味期限
						htmlNote2+='<td >'+_price+'</td>';//FIFOValue
						htmlNote2+='<td >'+rst[i].itemcount+'</td>';//StockBalan 
						htmlNote2+='<td >'+_value+'</td>';//nceStockValue
						htmlNote2+='<td >'+rst[i].item_irime+'</td>';//TODO
//						htmlNote2+='<td >'+_eStructureFI+'</td>';//eStructureFI //changed bv zhou 230320 zhou memo:CH378 eStructureFI 削除予定  
						htmlNote2+='<td >'+_agCtnBalance+'</td>';//agCtnBalance
						htmlNote2+='<td >'+_ModBalance+'</td>';//ModBalance
						htmlNote2+='<td >'+rst[i].inventorynumber+'</td>';//add bv zhou 230320 CH378 ロットシリアル番号 = 管理番号 
						htmlNote2+='<td >'+rst[i].lot_remark+'</td>';//add bv zhou 230320 CH378 ロットリマーク 
						htmlNote2+='<td >'+rst[i].lot_memo+'</td>';//add bv zhou 230320 CH378 ロットメモ 
						htmlNote2+='<td >'+rst[i].item_qaqc+'</td>';//add bv zhou 230320 CH378 ITEM.DJ_QA/QCグループ 
						htmlNote2+='<td >'+rst[i].bland+'</td>';//add bv zhou 230320 CH378 BLANDCODE 
						htmlNote2+='<td >'+rst[i].in_location_date+'</td>';//TODO
						htmlNote2+='<td >'+rst[i].shipmentdate+'</td>';//TODO
						htmlNote2+='<td >'+tranNum+'</td>';//TODO 20230705 add by zhou  CH731 PO No  
						htmlNote2+='</tr>';
					}
				}
//		    	} 
				//20230206 end
				htmlNote2+='</table>';
			}
		}
		
		 //画面項目追加
		 if(selectFlg == 'T'){    
			  form.addButton('btn_excel', 'Excel出力', "window.open('" + getExcel(htmlNote,1,filedSubValue) + "', '_blank');")
			  form.addButton('btn_excel2', 'ローデータ出力', "window.open('" + getExcel(htmlNote2,2,filedSubValue) + "', '_blank');")
		 }
	 response.writePage(form);
}

function getExcel(htmlNote,kbn, subsidiary){
	var xmlString = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    xmlString += '<meta http-equiv="Content-Type" charset=utf-8">';
    xmlString += '<head>';
    xmlString += '<!--[if gte mso 9]>';
    xmlString += '<![endif]-->';
    xmlString += '<style type="text/css">';
    xmlString += ' td.ll { border-left:1px solid gray !important; }';
    xmlString += ' td.lt { border-top:1px solid gray !important; }';
    xmlString += ' td.llt { border-left:1px solid gray !important; border-top:1px solid gray !important; }';
    xmlString += ' .show { display:inline-block; }';
    xmlString += ' table.report { font-family:"HG丸ｺﾞｼｯｸM-PRO";font-size:11pt; }';
    xmlString += '</style>';
    xmlString += '</head>';
    xmlString += '<xml>';
    xmlString += '    <x:ExcelWorkbook>';
    xmlString += '        <x:ExcelWorksheets>';
    xmlString += '            <x:ExcelWorksheet>';
    xmlString += '                <x:Name>在庫レポート</x:Name>';
    xmlString += '                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>';
    xmlString += '            </x:ExcelWorksheet>';
    xmlString += '        </x:ExcelWorksheets>';
    xmlString += '    </x:ExcelWorkbook>';
    xmlString += '</xml>';
    xmlString += '<body>';
    xmlString+= htmlNote.replace(/&nbsp;/g,' ').replace(/&/g,'&amp;');
    xmlString += '</body>';
    xmlString += '</html>';
    
    //20230901 add by CH762 start 
    var SAVE_PDF_FOLDER = FILE_CABINET_ID_INVENTORY_REPORT;
    if (subsidiary == SUB_NBKK) {
        SAVE_PDF_FOLDER = FILE_CABINET_ID_INVENTORY_REPORT_NBKK;
    } else if(subsidiary == SUB_ULKK){
        SAVE_PDF_FOLDER = FILE_CABINET_ID_INVENTORY_REPORT_ULKK;
    } 
    //20230901 add by CH762 end 
     //CH762 update by zdj 20230815 start
    if(kbn == 1){
        //var xlsFile = nlapiCreateFile('在庫レポート' + '_' + getFormatYmdHms() + '.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));
        var xlsFile = nlapiCreateFile('在庫レポート過去履歴' + '_' + getDateYymmddFileName() + '.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));
        xlsFile.setFolder(SAVE_PDF_FOLDER);
        //xlsFile.setName('在庫レポート' + '_' + getFormatYmdHms() + '.xls');
        xlsFile.setName('在庫レポート過去履歴' + '_' + getDateYymmddFileName() + '.xls');
        // CH762 update by zdj 20230815 end
        xlsFile.setEncoding('SHIFT_JIS');
    }else if(kbn == 2){
        var xlsFile = nlapiCreateFile('在庫レポート過去履歴ローデータ' + '_' + getDateYymmddFileName() + '.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));
        xlsFile.setFolder(SAVE_PDF_FOLDER);
        xlsFile.setName('在庫レポート過去履歴ローデータ' + '_' + getDateYymmddFileName() + '.xls');
	    xlsFile.setEncoding('SHIFT_JIS');
    }
//    var xlsFile = nlapiCreateFile('在庫レポート' + '_' + getdateYYMMDD() + '.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));
//    xlsFile.setFolder(FILE_CABINET_ID_INVENTORY_REPORT);
//    xlsFile.setName('在庫レポート' + '_' + getdateYYMMDD() + '.xls');
//    xlsFile.setEncoding('SHIFT_JIS');
	// save file
	var fileID = nlapiSubmitFile(xlsFile);
	var fl = nlapiLoadFile(fileID);
	var url= fl.getURL();
	return url; 
    
}


function getItemTotal(arr,item){
	for(var i = 0 ; i < arr.length ; i++){
		if(arr[i].item_id == item){
			return arr[i];
		}
	}
}

function getLocationTotal(arr,item,location){
	for(var i = 0 ; i < arr.length ; i++){
		if(arr[i].item_id == item && arr[i].location_id == location){
			return arr[i];
		}
	}
}


function getMonth(date){
	var count = "";
	if(!isEmpty(date)){
		
		
		var now = new Date()

		var nowYear = now.getFullYear();

		var nowMonth = now.getMonth()+1;
		
		var year = nlapiStringToDate(date).getFullYear();
		
		var month = nlapiStringToDate(date).getMonth()+1;
		
		count = ((nowYear -year)*12 + (nowMonth-month)).toString();
	
		
	}
	return count
}

//単価とトランザクショ再設定
function setDetial(json,arr){
	var rst = json;
	rst.po = '-'
	if(!isEmpty(arr)){		
		for(var i = 0 ; i < arr.length ; i++){
			//在庫番号ID→在庫番号 倉庫見ない
			
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
function defaultEmpty(src){
	return src || '';
}


function getTargetDate(tarDate,day) {
	var time = (tarDate).getTime() + 24 * 60 * 60 * 1000 * day;
	var date = new Date(time); 
	date = nlapiDateToString(date);
	return date
	}

function  getDaysBetween(dateString1,dateString2){
    var  startDate = nlapiStringToDate(dateString1);
    var  endDate = nlapiStringToDate(dateString2);

    var days=(endDate - startDate)/(1*24*60*60*1000);
    return  days;
}