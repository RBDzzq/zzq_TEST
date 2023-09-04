/**
 * NO'T DEPLOY NOW
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/27     CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	var cacherecordid = request.getParameter('cacheRecordID');
	var date = request.getParameter('date');
	if (!isEmpty(cacherecordid)&&!isEmpty(date)) {
		var ctx = nlapiGetContext();		
		var scheduleparams = new Array();
		scheduleparams['custscript_djkk_fc_ls_cache_table_id'] = cacherecordid;
		scheduleparams['custscript_djkk_date_ls'] = date;
		runBatch('customscript_djkk_ss_fc_ls_create_sc',
				'customdeploy_djkk_ss_fc_ls_create_sc', scheduleparams);
		var parameter= new Array();
 
		parameter['date'] = request.getParameter('date');
		parameter['subsidiary'] = request.getParameter('subsidiary');
		parameter['location'] = request.getParameter('location');
		parameter['vendor'] = request.getParameter('vendor');
		parameter['item'] = request.getParameter('item');
		parameter['brand'] = request.getParameter('brand');
		parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(), null, parameter);
	} else {
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response);
		}else{
			creatFrom(request, response,false);
		}
	}
}

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function logForm(request, response) {

	var form = nlapiCreateForm('購買計画作成_LS', false);
	form.setScript('customscript_djkk_cs_fc_ls_create_sc');
	// 実行情報
	form.addFieldGroup('custpage_run_info', '実行情報');
	form.addButton('custpage_refresh', '更新', 'refresh();');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_fc_ls_create_sc');

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
		creatFrom(request, response,true);
	}
	
}
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function creatFrom(request, response,logformflg){
	var screenHeight=request.getParameter('height');
	var screenWidth=request.getParameter('width');
	var tableHeight='height:'+Number(screenHeight*59/60-270)+'px;';//'height:600px;';//600
	var tableWidth='width:'+Number(screenWidth*59/60)+'px;';//'width:1220px;';//1220
	var trtdHeight=28;//28
	var tableCloum1=62;//62
	var tableCloum2=126;//126
	var tableCloum3=254;//254
	var searchType=request.getParameter('search');
	
	var form = '';
	if(searchType=='T'){
		form =nlapiCreateForm('購買計画作成_LS', true);
	}else{
		form =nlapiCreateForm('購買計画作成_LS', false);
	}
	form.setScript('customscript_djkk_cs_fc_ls_create_sc');
	if(logformflg){
	form.addFieldGroup('custpage_run_info', '実行情報');
	 var runstatusField = form.addField('custpage_run_info_status', 'text', '', null, 'custpage_run_info');
     runstatusField.setDisplayType('inline');
     runstatusField.setDefaultValue('バッチ処理実行完了しました');
	}
	form.addFieldGroup('custpage_group_date', '基準日');
	var filtergroup=form.addFieldGroup('custpage_group_filter', '検索項目');
	if(searchType=='T'){
		filtergroup.setShowBorder(false);
	}
	var dateField = form.addField('custpage_date', 'date', '基準日', 'null','custpage_group_date');
	dateField.setMandatory(true);
	var subsidiaryField=form.addField('custpage_subsidiary', 'select', '連結', null,'custpage_group_filter');
	subsidiaryField.setMandatory(true);
	var ssArray=new Array();
	var subsidiarySearch = nlapiSearchRecord("subsidiary",null,
			[
			   //["custrecord_djkk_subsidiary_type","anyof","2"]
			   ["internalid","anyof",getRoleSubsidiary()] 
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("namenohierarchy")
			]
			);
	subsidiaryField.addSelectOption('', '');
	for(var iss=0;iss<subsidiarySearch.length;iss++){
		ssArray.push(subsidiarySearch[iss].getValue('internalid'));
		subsidiaryField.addSelectOption(subsidiarySearch[iss].getValue('internalid'), subsidiarySearch[iss].getValue('namenohierarchy'));
	}
	subsidiaryField.setMandatory(true);
	
	//var userSubsidiary=nlapiLookupField('employee', nlapiGetUser(), 'subsidiary');
	var userSubsidiary=getRoleSubsidiary();
	if(ssArray.indexOf(userSubsidiary) > -1){
	subsidiaryField.setDefaultValue(userSubsidiary);
	}
	//subsidiaryField.setDisplayType('inline');
	var locationField=form.addField('custpage_location', 'multiselect', '場所', 'null','custpage_group_filter');
	locationField.setMandatory(true);	
	var vendorField=form.addField('custpage_vendor', 'select', '仕入先', 'null','custpage_group_filter');
	var brandField=form.addField('custpage_brand', 'multiselect', 'ブランド', 'null','custpage_group_filter');
	brandField.addSelectOption('0', '-すべて-');
	brandField.setDefaultValue('0');
//	var itemField=form.addField('custpage_item', 'multiselect', '商品名', 'null','custpage_group_item');
//	itemField.addSelectOption('0', '-すべて-');
//	itemField.setDefaultValue('0');
	var allItemField=form.addField('custpage_itemall', 'multiselect', '選択したすべての製品', 'null','custpage_group_filter');
	allItemField.setDisplayType('hidden');
	var searchTypeField=form.addField('custpage_searchtype', 'checkbox', 'searchtype', 'null','custpage_group_filter');
	searchTypeField.setDisplayType('hidden');
//	var itemFrom=form.addField('custpage_itemcodefrom', 'text', '商品コードFROM', 'null','custpage_group_filter');
//	var itemTo=form.addField('custpage_itemcodeto', 'text', '商品コードTO', 'null','custpage_group_filter');
	var cacheRecordIDField=form.addField('custpage_cacherecordid', 'text', 'FC_キャッシュテーブルID', 'null','custpage_group_filter');
	cacheRecordIDField.setDisplayType('hidden');
	var date=request.getParameter('date');
	if(isEmpty(date)){
    	date=nlapiDateToString(getSystemTime());
    }
	var subsidiaryPar=userSubsidiary;
	var sbSelect=request.getParameter('subsidiary');
	if(!isEmpty(sbSelect)){
		subsidiaryPar=sbSelect;
	}
	
	var locationPar = request.getParameter('location');
	var vendorPar = request.getParameter('vendor');
	var itemPar = request.getParameter('item');
	var brandPar = request.getParameter('brand');
	//U396start
	var itemcodePar = request.getParameter('itemcode');
	var vendoritemcodePar = request.getParameter('vendoritemcode');
	var itemnamePar = request.getParameter('itemname');
	//U396end
	
	//-----------------------------------U396start1-------------------------------------------------//
	var itemgroup=form.addFieldGroup('custpage_group_item', '商品検索');
	var itemcodeField=form.addField('custpage_itemcode', 'text', 'アイテムコード', null,'custpage_group_item');
	var vendoritemField=form.addField('custpage_vendoritemcode', 'text', '仕入先商品コード', null,'custpage_group_item');
	var itemnameField=form.addField('custpage_itemname', 'text', 'アイテム名称', null,'custpage_group_item');

	var itemnamegroup=form.addFieldGroup('custpage_group_itemname', '商品結果');
	var itemField=form.addField('custpage_item', 'multiselect', '商品名', 'null','custpage_group_itemname');
	itemField.addSelectOption('0', '-すべて-');
	itemField.setDefaultValue('0');
	
	
	if(searchType=='T'){
		itemgroup.setShowBorder(false);
		itemnamegroup.setShowBorder(false);
	}



	//-----------------------------------U396end1-------------------------------------------------//
	
	
	
	if(searchType=='T'){
		locationField.setDisplaySize(50,1);
		locationField.setLayoutType('outsideabove', 'startcol');
		searchTypeField.setDefaultValue('T');
		dateField.setDisplayType('hidden');
		//locationField.setDisplayType('inline');
		vendorField.setDisplayType('hidden');
		brandField.setDisplayType('hidden');
		itemField.setDisplayType('hidden');
		subsidiaryField.setDisplayType('hidden');
//		itemFrom.setDisplayType('inline');
//		itemTo.setDisplayType('inline');
		
		//U396start
		itemcodeField.setDisplayType('hidden');
		vendoritemField.setDisplayType('hidden');
		itemnameField.setDisplayType('hidden');
		//U396end
	}
	var htmlNote ='';
	var locationSearch = nlapiSearchRecord("customrecord_djkk_location_area",null,
			[
             //["custrecord_djkk_location_subsidiary.custrecord_djkk_subsidiary_type","anyof","2"]
             ["custrecord_djkk_location_subsidiary.internalid","anyof",getRoleSubsidiary()]
			], 
			[
			   new nlobjSearchColumn("internalid").setSort(true), 
			   new nlobjSearchColumn("name")
			]
			);
	if (!isEmpty(locationSearch)) {
		for (var ls = 0; ls < locationSearch.length; ls++) {
			if(locationSearch[ls].getValue('internalid')!='3'){
			locationField.addSelectOption(locationSearch[ls]
					.getValue('internalid'), locationSearch[ls]
					.getValue('name'));
			}else{
				locationField.addSelectOption(locationSearch[ls]
				.getValue('internalid'), locationSearch[ls]
				.getValue('name'),true);
			}
		}
	}
	
	var brandListSearch= nlapiSearchRecord("classification",null,
			   [
		       ["subsidiary","anyof",subsidiaryPar]
		        ], 
	    		[
	    		  new nlobjSearchColumn("internalid"), 
	    		   new nlobjSearchColumn("name")
	    		]
	    		);
	if (!isEmpty(brandListSearch)) {
		for (var bls = 0; bls < brandListSearch.length; bls++) {
			brandField.addSelectOption(brandListSearch[bls]
					.getValue('internalid'), brandListSearch[bls]
					.getValue('name'));
		}
	}
	
       if(!isEmpty(date)){
		dateField.setDefaultValue(date);
         }
       if(!isEmpty(subsidiaryPar)&&subsidiaryPar!=0){
    	   subsidiaryField.setDefaultValue(subsidiaryPar);
    	    vendorField.addSelectOption('0', '');
    	    var vendorSearch = nlapiSearchRecord("vendor",null,
    	    		[
    	    		   ["subsidiary","anyof",subsidiaryPar]
    	    		], 
    	    		[
    	    		   new nlobjSearchColumn("internalid"), 
    	    		   new nlobjSearchColumn("companyname")
    	    		]
    	    		);
    	    if (!isEmpty(vendorSearch)) {
    			for (var vf = 0; vf < vendorSearch.length; vf++) {
    				vendorField.addSelectOption(vendorSearch[vf]
    						.getValue('internalid'), vendorSearch[vf]
    						.getValue('companyname'));
    			}
    		}
    	    var itemList=new Array();
    	    var soForecastItemSearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
    	    		[
    	    		   ["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiaryPar]
    	    		], 
    	    		[
    	    		   new nlobjSearchColumn("internalid","custrecord_djkk_so_fc_ls_item",null), 
    	    		   /* U149 old*/ // new nlobjSearchColumn("itemid","custrecord_djkk_so_fc_ls_item",null)
    	    		   /* U149 new*/new nlobjSearchColumn("vendorname","custrecord_djkk_so_fc_ls_item",null)
    	    		]
    	    		);
    	    if (!isEmpty(soForecastItemSearch)) {
    			for (var itf = 0; itf < soForecastItemSearch.length; itf++) {
    				itemList.push(soForecastItemSearch[itf].getValue("internalid","custrecord_djkk_so_fc_ls_item"));
    			}
    		}
    	  if(!isEmpty(itemList)){
    		var itemSearchFilters=[["internalid","anyof",itemList]];
    		
    	    if(!isEmpty(vendorPar)&&vendorPar!=0){
    	    	vendorField.setDefaultValue(vendorPar);
    	    	itemSearchFilters.push("AND");
    	    	itemSearchFilters.push(["vendor.internalid","anyof",vendorPar]);
              }
    	    if(!isEmpty(brandPar)&&brandPar!=0){
    	    	brandField.setDefaultValue(brandPar);
    	    	itemSearchFilters.push("AND");
    	    	itemSearchFilters.push(["class","anyof",brandPar]);
              }
    	    //U396start
    	    if(!isEmpty(itemcodePar)){
    	    	itemcodeField.setDefaultValue(itemcodePar);
    	    	itemSearchFilters.push("AND");
    	    	itemSearchFilters.push(["itemid","contains",itemcodePar]);
              }
    	    if(!isEmpty(vendoritemcodePar)&&vendoritemcodePar!=0){
    	    	vendoritemField.setDefaultValue(vendoritemcodePar);
    	    	itemSearchFilters.push("AND");
    	    	itemSearchFilters.push(["vendorname","contains",vendoritemcodePar]);
              }
    	    if(!isEmpty(itemnamePar)&&itemnamePar!=0){
    	    	itemnameField.setDefaultValue(itemnamePar);
    	    	itemSearchFilters.push("AND");
    	    	itemSearchFilters.push(["displayname","contains",itemnamePar]);
              }
    	    //U396end
    	    
    	    
    	    
    	    
    	    var itemSearch = nlapiSearchRecord("item",null,itemSearchFilters
  				  , 
  				  [
  				     new nlobjSearchColumn("internalid").setSort(false), 
  				   /*U149 old*/  // new nlobjSearchColumn("itemid")
  				   /*U149 new*/  new nlobjSearchColumn("vendorname"),
  				 new nlobjSearchColumn("displayname")
  				   /*U149 new*/
  				  ]
  				  );
    	    var allItemArray=new Array();
    	    if (!isEmpty(itemSearch)) {
    			for (var its = 0; its < itemSearch.length; its++) {
    				 /*U149 old*/  /*
    		    	itemField.addSelectOption(itemSearch[its].getValue("internalid"), itemSearch[its].getValue("itemid"));
    		    	allItemField.addSelectOption(itemSearch[its].getValue("internalid"), itemSearch[its].getValue("itemid"));
    		    	allItemArray.push(itemSearch[its].getValue("internalid"));
    		    	*/
    		    				/*U149 new*/
    		    				var codeName='';
    		    				if(!isEmpty(itemSearch[its].getValue("vendorname"))){
    		    					codeName='('+itemSearch[its].getValue("vendorname")+') '+itemSearch[its].getValue("displayname");
    		    				}else{
    		    					codeName=itemSearch[its].getValue("displayname");
    		    				}
    		    				itemField.addSelectOption(itemSearch[its].getValue("internalid"),codeName);
    		    		    	allItemField.addSelectOption(itemSearch[its].getValue("internalid"), codeName);
    		    		    	
    		    		    	allItemArray.push(itemSearch[its].getValue("internalid"));
    		    		    	/*U149 new*/
    			}
    		}    	       	      	      	    
    	  }else{
    		  if(!isEmpty(vendorPar)&&vendorPar!=0){
        	    	vendorField.setDefaultValue(vendorPar);
                  }
        	    if(!isEmpty(brandPar)&&brandPar!=0){
        	    	brandField.setDefaultValue(brandPar);
                  }
        	    //U396start
        	    if(!isEmpty(itemcodePar)){
        	    	itemcodeField.setDefaultValue(itemcodePar);
                  }
        	    if(!isEmpty(vendoritemcodePar)&&vendoritemcodePar!=0){
        	    	vendoritemField.setDefaultValue(vendoritemcodePar);
                  }
        	    if(!isEmpty(itemnamePar)&&itemnamePar!=0){
        	    	itemnameField.setDefaultValue(itemnamePar);
                  }
        	    //U396end
      	  }
    	    if(!isEmpty(itemPar)&&itemPar!=0){
    	    	itemField.setDefaultValue(itemPar);
              }
    	   if(!isEmpty(locationPar)&&locationPar!=0){
    		   locationField.setDefaultValue(locationPar);
             } 
         }
	if(searchType=='T'&&!isEmpty(date)&&!isEmpty(locationPar)&&locationPar!=0){
		var locations=locationPar.split('');
		var searchFilters=[];
		 var allItemFieldValue='';
		 if(!isEmpty(itemPar)&&itemPar!=0){
			 allItemArray=itemPar.split('');
			 allItemFieldValue=itemPar;
		}else{
	  if(!isEmpty(allItemArray)){
		 for(var aifv=0;aifv<allItemArray.length;aifv++){
			 if(aifv!=allItemArray.length-1){
			 allItemFieldValue+=allItemArray[aifv]+'';		 
			 }else{
			allItemFieldValue+=allItemArray[aifv];
			 }
		    }
	      }
		}
		 allItemField.setDefaultValue(allItemFieldValue);
		 searchFilters=[
							   ["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiaryPar], 
							   "AND", 
							   ["custrecord_djkk_so_fc_ls_item.internalid","anyof",allItemArray],
							   "AND", 
							   ["custrecord_djkk_so_fc_ls_location_area","anyof",locations]
							];
		
		var forecastSearch = '';
	if(!isEmpty(allItemArray)){
		forecastSearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,searchFilters, 
				[
                   new nlobjSearchColumn("internalid","custrecord_djkk_so_fc_ls_item","GROUP").setSort(false),
                   /*U149 old*/   //    new nlobjSearchColumn("itemid","custrecord_djkk_so_fc_ls_item","GROUP"), 
                   /*U149 new*/   new nlobjSearchColumn("vendorname","custrecord_djkk_so_fc_ls_item","GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_location_area",null,"GROUP"), 
				   /*U149 new*/new nlobjSearchColumn("displayname","custrecord_djkk_so_fc_ls_item","GROUP"), 
				   new nlobjSearchColumn("custitem_djkk_business_judgmen_fc","CUSTRECORD_DJKK_SO_FC_LS_ITEM","GROUP")
				   /*U149 old*/   //  new nlobjSearchColumn("salesdescription","custrecord_djkk_so_fc_ls_item","GROUP")
				   
				]
				);
		}
		 if (!isEmpty(forecastSearch)) {
			 
	            // PO-IN-Search
                var poInSearchArray = new Array();
				var purchaseorderSearch = nlapiSearchRecord("purchaseorder",null,
						[
						   ["type","anyof","PurchOrd"], 
						   "AND", 
						   ["mainline","is","F"], 
						   "AND", 
						   ["taxline","is","F"], 
						   "AND", 
						   ["status","anyof","PurchOrd:B","PurchOrd:D","PurchOrd:E","PurchOrd:P","PurchOrd:A"], 
//						   "AND", 
//						   ["formulanumeric: {quantityuom}-{quantityshiprecv}","greaterthan","0"], 
						   "AND", 
						   ["item.internalid","anyof",allItemArray], 
						   "AND", 
						   ["location.custrecord_djkk_location_area","anyof",locations], 
						   "AND", 
						   ["subsidiary","anyof",subsidiaryPar]
						], 
						[
						   new nlobjSearchColumn("item",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("expectedreceiptdate",null,"GROUP").setSort(false).setFunction('weekOfYear'), 
						   new nlobjSearchColumn("expectedreceiptdate",null,"GROUP").setSort(false).setFunction('calendarWeek'), 
						   new nlobjSearchColumn("formulanumeric",null,"SUM").setFormula("{quantity}-{quantityshiprecv}"), 
						   new nlobjSearchColumn("custrecord_djkk_location_area","location","GROUP")
						]
						);
				if (!isEmpty(purchaseorderSearch)) {
					for (var aIa = 0; aIa < allItemArray.length; aIa++) {
						var poItemArray = new Array();
						for (var pos = 0; pos < purchaseorderSearch.length; pos++) {
						var columnID = purchaseorderSearch[pos].getAllColumns();
			             if(allItemArray[aIa]==purchaseorderSearch[pos].getValue(columnID[0])){
							poItemArray.push([
										changeFcWeekOfYear(purchaseorderSearch[pos].getValue(columnID[1])),
										purchaseorderSearch[pos].getValue(columnID[2]),
										purchaseorderSearch[pos].getValue(columnID[3]),
										purchaseorderSearch[pos].getValue(columnID[4])]);
			             }
						}
						poInSearchArray.push([allItemArray[aIa], poItemArray]);
					}
				}
				// PO-IN-Search END
				
				// 場所のDJ_場所エリア (カスタム)検索
				var locationAreaSearch = nlapiSearchRecord("location",null,
						[
						   ["custrecord_djkk_location_area","anyof",locations]
						], 
						[
						   new nlobjSearchColumn("custrecord_djkk_location_area",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("internalid",null,"GROUP")
						]
						);
				if (!isEmpty(locationAreaSearch)) {
				var locationAreaList = new Array();
				var locationAreaArray = new Array();
				for (var lcL = 0; lcL < locations.length; lcL++) {
					for (var las = 0; las < locationAreaSearch.length; las++) {
						var columnID = locationAreaSearch[las].getAllColumns();		
						if (locations[lcL] == locationAreaSearch[las].getValue(columnID[0])) {
							locationAreaArray.push(locationAreaSearch[las].getValue(columnID[1]));
							locationAreaList['locationId:'+ locationAreaSearch[las].getValue(columnID[1])] = locationAreaSearch[las].getValue(columnID[0]);
						}
					}
				}
			}
           // 場所のDJ_場所エリア (カスタム)検索 END
		   
		   // SO-OUT-Search
				var soOutSearchArray = new Array();
				var salesorderSearch = nlapiSearchRecord("salesorder",null,
						[
						   ["type","anyof","SalesOrd"], 
						   "AND", 
						   ["mainline","is","F"], 
						   "AND", 
						   ["taxline","is","F"], 
						   "AND", 
						   ["status","noneof","SalesOrd:A","SalesOrd:H"], 
						   "AND", 
						   ["item.internalid","anyof",allItemArray], 
						   "AND", 
						   ["quantityshiprecv","greaterthan","0"], 
						   "AND", 
						   ["fulfillingtransaction.location","anyof",locationAreaArray], 
						   "AND", 
						   ["subsidiary","anyof",subsidiaryPar]
//						   ,"AND", 
//						   ["custcol_djkk_custody_item","is","F"]
						], 
						[
						   new nlobjSearchColumn("item",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("custcol_djkk_delivery_hopedate",null,"GROUP").setSort(false).setFunction('weekOfYear'), 
						   new nlobjSearchColumn("custcol_djkk_delivery_hopedate",null,"GROUP").setSort(false).setFunction('calendarWeek'),
						   new nlobjSearchColumn("quantityshiprecv",null,"SUM"), 
						   new nlobjSearchColumn("location","fulfillingTransaction","GROUP")
						]
						);
				if (!isEmpty(salesorderSearch)) {
					for (var aIs = 0; aIs < allItemArray.length; aIs++) {
						var soItemArray = new Array();
						for (var sos = 0; sos < salesorderSearch.length; sos++) {
						var columnID = salesorderSearch[sos].getAllColumns();
			             if(allItemArray[aIs]==salesorderSearch[sos].getValue(columnID[0])){
			            	 soItemArray.push([
										changeFcWeekOfYear(salesorderSearch[sos].getValue(columnID[1])),
										salesorderSearch[sos].getValue(columnID[2]),
										salesorderSearch[sos].getValue(columnID[3]),
										locationAreaList['locationId:'+salesorderSearch[sos].getValue(columnID[4])]]);
			             }
						}
						soOutSearchArray.push([allItemArray[aIs], soItemArray]);
					}
				}
		   // SO-OUT-Search END
		
		   // Forecast-OUT-Search
				var forecastOutSearchArray=new Array();
				var forecastOutSearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
						[
						   ["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiaryPar], 
						   "AND", 
						   ["custrecord_djkk_so_fc_ls_item","anyof",allItemArray], 
						   "AND", 
						   ["custrecord_djkk_so_fc_ls_location_area","anyof",locations], 
						    "AND", 
						   ["custrecord_djkk_so_fc_ls_item.custitem_djkk_business_judgmen_fc","anyof","2"]
						], 
						[
						   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_item",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_location_area",null,"GROUP").setSort(false), 
						   //new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("CASE WHEN TO_NUMBER({custrecord_djkk_so_fc_ls_month}) <10 THEN ({custrecord_djkk_so_fc_ls_year}||'-0'||{custrecord_djkk_so_fc_ls_month}) ELSE ({custrecord_djkk_so_fc_ls_year}||'-'||{custrecord_djkk_so_fc_ls_month}) END").setSort(false), 
						   new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("{custrecord_djkk_so_fc_ls_year}||'-'||{custrecord_djkk_so_fc_ls_month}").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_fcnum",null,"SUM")
						]
						);
				if (!isEmpty(forecastOutSearch)) {

					for (var aIa = 0; aIa < allItemArray.length; aIa++) {
						var focItemArray = new Array();
						for (var foc = 0; foc < forecastOutSearch.length; foc++) {
						var columnID = forecastOutSearch[foc].getAllColumns();
			             if(allItemArray[aIa]==forecastOutSearch[foc].getValue(columnID[0])){
			            	var beforeMonth=getFcBeforeMonth(forecastOutSearch[foc].getValue(columnID[2]));
		            		var beforeOutDate=0;
		            		var afterMonth=getFcNextMonth(forecastOutSearch[foc].getValue(columnID[2]));
            				var afterOutDate=0;
			            	 if(foc>0){
			            		 
			            	 if(forecastOutSearch[foc-1].getValue(columnID[1])==forecastOutSearch[foc].getValue(columnID[1])){				           
			            			 if(forecastOutSearch[foc-1].getValue(columnID[2])==beforeMonth){			            				
						            	  beforeOutDate=forecastOutSearch[foc-1].getValue(columnID[3]);
			            			 }
			            	 }
			            	}
			            	 
			            	 if(foc< forecastOutSearch.length-1){
			            	 if(forecastOutSearch[foc+1].getValue(columnID[1])==forecastOutSearch[foc].getValue(columnID[1])){
			            			 if(forecastOutSearch[foc+1].getValue(columnID[2])==afterMonth){
			            				 afterOutDate=forecastOutSearch[foc+1].getValue(columnID[3]);
			            			 }
			            	 }
			            	}
			            	 
			            	 focItemArray.push([
										forecastOutSearch[foc].getValue(columnID[1]),
										forecastOutSearch[foc].getValue(columnID[2]),
										forecastOutSearch[foc].getValue(columnID[3]),
										beforeMonth,beforeOutDate,afterMonth,afterOutDate]);
			             }
						}
						forecastOutSearchArray.push([allItemArray[aIa], focItemArray]);
					}			
				}
				
				/***U385new****/
				// Forecast-OUT-Search
				var forecastOutWeekSearchArray=new Array();
				var forecastWeekOutSearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
						[
						   ["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiaryPar], 
						   "AND", 
						   ["custrecord_djkk_so_fc_ls_item","anyof",allItemArray], 
						   "AND", 
						   ["custrecord_djkk_so_fc_ls_location_area","anyof",locations], 
						    "AND", 
						   ["custrecord_djkk_so_fc_ls_item.custitem_djkk_business_judgmen_fc","anyof","1"]
						], 
						[
						   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_item",null,"GROUP"), 
						   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_location_area",null,"GROUP"), 
						   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_yearmonthweek",null,"GROUP"), 
						   new nlobjSearchColumn("custrecord_djkk_so_fc_ls_week_fcnum",null,"SUM")
						]
						);
				if (!isEmpty(forecastWeekOutSearch)) {
					for (var awIa = 0; awIa < allItemArray.length; awIa++) {
						var focItemWeekArray = new Array();
						for (var fowc = 0; fowc < forecastWeekOutSearch.length; fowc++) {
						var columnID = forecastWeekOutSearch[fowc].getAllColumns();
			             if(allItemArray[awIa]==forecastWeekOutSearch[fowc].getValue(columnID[0])){		            	 
			            	 focItemWeekArray.push([
										forecastWeekOutSearch[fowc].getValue(columnID[1]),
										forecastWeekOutSearch[fowc].getValue(columnID[2]),
										forecastWeekOutSearch[fowc].getValue(columnID[3])]);
			             }
						}
						forecastOutWeekSearchArray.push([allItemArray[awIa], focItemWeekArray]);
					}
                   }
				/**************/
		// Forecast-OUT-Search END
		// SC課FC Search
				var scFcINAddSearchArray=new Array();
				var scFcINMinusSearchArray=new Array();
				var scFcCommentSearchArray=new Array();
				var scForecastSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast_ls",null,
						[
						   ["custrecord_djkk_sc_fc_ls_item","anyof",allItemArray], 
						   "AND", 
						   ["custrecord_djkk_sc_fc_ls_subsidiary","anyof",subsidiaryPar], 
						   "AND", 
						   ["custrecord_djkk_sc_fc_ls_location_area","anyof",locations]
						], 
						[
						   new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_item",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_location_area",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("{custrecord_djkk_sc_fc_ls_year}||'-'||{custrecord_djkk_sc_fc_ls_week}").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_add",null,"GROUP"), 
						   new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_minus",null,"GROUP"), 
						   new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_comment",null,"GROUP"), 
						   new nlobjSearchColumn("internalid",null,"GROUP")
						]
						);
				if (!isEmpty(scForecastSearch)) {
					for (var aIa = 0; aIa < allItemArray.length; aIa++) {
						var fcInADataArray = new Array();
						var fcInMDataArray = new Array();
						var fcComDataArray = new Array();
						for (var scfcs = 0; scfcs < scForecastSearch.length; scfcs++) {
						var columnID = scForecastSearch[scfcs].getAllColumns();
			             if(allItemArray[aIa]==scForecastSearch[scfcs].getValue(columnID[0])){
			            	 fcInADataArray.push([
										scForecastSearch[scfcs].getValue(columnID[1]),
										scForecastSearch[scfcs].getValue(columnID[2]),
										scForecastSearch[scfcs].getValue(columnID[3])]);
			            	 fcInMDataArray.push([
													scForecastSearch[scfcs].getValue(columnID[1]),
													scForecastSearch[scfcs].getValue(columnID[2]),
													scForecastSearch[scfcs].getValue(columnID[4])]);
			            	 fcComDataArray.push([
													scForecastSearch[scfcs].getValue(columnID[1]),
													scForecastSearch[scfcs].getValue(columnID[2]),
													scForecastSearch[scfcs].getValue(columnID[5]),
													scForecastSearch[scfcs].getValue(columnID[6])]);
			             }
						}
						scFcINAddSearchArray.push([allItemArray[aIa], fcInADataArray]);
						scFcINMinusSearchArray.push([allItemArray[aIa], fcInMDataArray]);
						scFcCommentSearchArray.push([allItemArray[aIa], fcComDataArray]);
					}
				}
		// SC課FC Search END
		// NOW場所の在庫数合計Search
				var itemInventorySearchArray=new Array();
				var itemInventorySearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","anyof",allItemArray], 
						   "AND", 
						   ["inventorylocation.custrecord_djkk_location_area","noneof","@NONE@"], 
						   "AND", 
						   ["subsidiary","anyof",subsidiaryPar]
						], 
						[
						   new nlobjSearchColumn("internalid",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_location_area","inventoryLocation","GROUP").setSort(false), 
						   new nlobjSearchColumn("locationquantityonhand",null,"SUM")
						]
						);
				
				if (!isEmpty(itemInventorySearch)) {
									for (var aIs = 0; aIs < allItemArray.length; aIs++) {
										var itemInventoryArray = new Array();
										for (var iis = 0; iis < itemInventorySearch.length; iis++) {
										var columnID = itemInventorySearch[iis].getAllColumns();
							             if(allItemArray[aIs]==itemInventorySearch[iis].getValue(columnID[0])){
							            	 itemInventoryArray.push([
														itemInventorySearch[iis].getValue(columnID[1]),
														itemInventorySearch[iis].getValue(columnID[2])]);
							             }
										}
										itemInventorySearchArray.push([allItemArray[aIs], itemInventoryArray]);
									}
								}
				
		// NOW場所の在庫数合計Search END
		var referenceDate='';
		if(getSunday(date,false)==date){
			referenceDate=date;
		}else{
		referenceDate=dateAddDays(date, -7);
		}
		var changeDate = dateAddDays(date, -7*27);
		var dateArray = new Array();
		var systemDate=nlapiDateToString(getSystemTime());
		for (var da = 0; da < 54; da++) {
			var referenceFlg=false;
			if(changeDate==referenceDate){
				referenceFlg=true;
			}
			var balancedatebefor=compareStrDate(getSunday(dateAddDays(changeDate, 7),false), systemDate);
			var systemdatebefor=compareStrDate(getSunday(changeDate), systemDate);
			var dateweek = getYearWeek(changeDate);
			var pushyear = getYear(changeDate);
			var pushdate = getSunday(changeDate,true);
			var pushMonth=(pushdate.split('/'))[0];
			if (dateweek == '52') {
				dateweek = '1';
				pushyear = Number(pushyear) + 1;
			} else if(dateweek == '53'){
				dateweek = '2';
				pushyear = Number(pushyear) + 1;
			}else {
				dateweek = Number(dateweek) + 1;
			}
			if(Number(dateweek)<10){
				dateweek='0'+dateweek;
			}
			if(Number(pushMonth)<10){
				pushMonth='0'+pushMonth;
			}
			dateArray.push([ dateweek, pushyear, pushdate,systemdatebefor,referenceFlg,pushMonth,balancedatebefor]);
			changeDate = dateAddDays(changeDate, 7);
		}
		       
		// ';htmlNote +='

		htmlNote +='<div id="tablediv" style="overflow:scroll;'+tableWidth+tableHeight+'border:1px solid gray;border-bottom: 0;border-right: 0;">';
		htmlNote += '<table id="tableList" cellspacing="0" border="0" cellpadding="0" style="border-collapse:separate;width:3721px;table-layout: fixed;">';
		htmlNote += '<thead style="position:sticky;top:0;z-index:2;">';
		htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#ffcc80;font-weight:bold;text-align:right;">';
		htmlNote += '<td colspan="2" rowspan="2" style="position:sticky;left:0;z-index:2;background-color:#ffcc80;border:1px solid gray;border-right:0px;vertical-align:top;">PrintDate:</td>';
		htmlNote += '<td rowspan="2" style="position:sticky;left:'+tableCloum2+'px;z-index:2;background-color:#ffcc80;border:1px solid gray;border-left:0px;vertical-align:top;">'+ date + '</td>';
		
		for (var wk = 0; wk < 54; wk++) {
			if(dateArray[wk][4]){
				htmlNote += '<td style="border:1px solid gray;background-color:#ff8c1a;color:#ffffff;">'+ dateArray[wk][0] + '</td>';
			}else{
				htmlNote += '<td style="border:1px solid gray;">'+ dateArray[wk][0] + '</td>';
			}
		}
		
		// NOW
		htmlNote += '<td style="border:1px solid gray;">NOW</td>';
		htmlNote += '</tr>';
		htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#ffcc80;font-weight:bold;text-align:right;">';
		
		for (var ye = 0; ye < 54; ye++) {
			if(dateArray[ye][4]){
				htmlNote += '<td style="border:1px solid gray;background-color:#ff8c1a;color:#ffffff;">'+ dateArray[ye][1] + '</td>';	
			}else{
			    htmlNote += '<td style="border:1px solid gray;">'+ dateArray[ye][1] + '</td>';
			}
		}
		
		// NOW
		htmlNote += '<td style="border:1px solid gray;"></td>';
		htmlNote += '</tr>';		
		htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#ffcc80;font-weight:bold;text-align:right;">';
		htmlNote += '<td colspan="2" style="position:sticky;left:0;z-index:2;background-color:#ffcc80;border:1px solid gray;border-right:0px;">基準日：</td>';
		htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:2;background-color:#ffcc80;border:1px solid gray;border-left:0px;">'+ date + '</td>';
		
		for (var sd = 0; sd < 54; sd++) {
			if(dateArray[sd][4]){
				htmlNote += '<td style="border:1px solid gray;background-color:#ff8c1a;color:#ffffff;">'+ dateArray[sd][2] + '</td>';	
			}else{
			htmlNote += '<td style="border:1px solid gray;">'+ dateArray[sd][2] + '</td>';
			}
		}
		// NOW
		htmlNote += '<td style="border:1px solid gray;"></td>';
		htmlNote += '</tr>';
		htmlNote += '</thead>';
		var beforeItem='';
		
		
		for (var itemc = 0; itemc < forecastSearch.length; itemc++) {
			
			var fcColumnID = forecastSearch[itemc].getAllColumns();
			var itemInternalid=forecastSearch[itemc].getValue(fcColumnID[0]);
			var itemId=forecastSearch[itemc].getValue(fcColumnID[1]);
			var itemLocation=forecastSearch[itemc].getText(fcColumnID[2]);
			var itemLocationId=forecastSearch[itemc].getValue(fcColumnID[2]);
            var itemDescription=forecastSearch[itemc].getValue(fcColumnID[3]);
            var itemWeekOrMonth=forecastSearch[itemc].getValue(fcColumnID[4]);
            var itemInventory=0;
            var itemLocationInventory=0;
            // itemInventorySearchArray
            for(var iis=0;iis<itemInventorySearchArray.length;iis++){
				if(itemInventorySearchArray[iis][0]==itemInternalid){				
					var sisArray=itemInventorySearchArray[iis][1];
					for(var issl=0;issl<sisArray.length;issl++){
						var sisi_locationId=sisArray[issl][0];
                        if(sisi_locationId==itemLocationId){
                        	if(!isEmpty(sisArray[issl][1])){
                        		itemLocationInventory=Number(sisArray[issl][1]);
                        	}else{
                        		itemLocationInventory=0;
                        	}
                        	
                        }
                        itemInventory+=Number(sisArray[issl][1]);
					}
				}
			}
            
            
            if(itemDescription=='- None -'){
            	itemDescription='';
            }
                       
            // same item different location only push one
            if(beforeItem!=itemInternalid){
			htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#e6e6e6;font-weight:bold;position:sticky;top:0;">';
			htmlNote += '<td colspan="2"  style="position:sticky;left:0;z-index:1;border:1px solid gray;background-color:#e6e6e6;border-right:0px;text-align:left;color:#0033cc;">'+itemId+'</td>';
			htmlNote += '<td colspan="2"  style="position:sticky;left:'+tableCloum2+'px;z-index:1;border:1px solid gray;background-color:#e6e6e6;border-right:0px;border-left:0px;text-align:left;color:#0033cc;font-size:13px;width:135px;"></td>';//StockTerm='+itemInternalid+'
			htmlNote += '<td colspan="10"  style="position:sticky;left:'+tableCloum3+'px;z-index:1;border:1px solid gray;background-color:#e6e6e6;border-right:0px;border-left:0px;text-align:left;color:#0033cc;font-size:13px;width:135px;">'+itemDescription+'</td>';
			htmlNote += '<td colspan="43" style="border:1px solid gray;background-color:#e6e6e6;border-left:0px;text-align:left;color:#0033cc;"></td>';
			// NOW
			htmlNote += '<td colspan="1" style="border:1px solid gray;background-color:#e6e6e6;border-left:0px;text-align:left;color:#0033cc;">'+itemInventory+'</td>';
			htmlNote += '</tr>';
            }
			htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
						
			// location
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-right:0px;width:110px;text-align:left;vertical-align:top;color:#0033cc;font-weight:bold;border-top-style:solid;border-left-style:solid;border-width:1px;border-color:gray;">'+itemLocation+'</td>';
			
			// Actual
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-left:0px;width:110px;text-align:left;vertical-align:top;font-weight:bold;border-top-style:solid;border-right-style:solid;border-width:1px;border-color:gray;">Actual</td>';
			
			// IN
			htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;">IN</td>';
			  var ActualINArray=new Array();
			for (var indate = 0; indate < 54; indate++) {
				var WeekNum=dateArray[indate][1]+'-'+dateArray[indate][0];
				var insideData = '';
				var wkFirstDay='';
				for(var pisa=0;pisa<poInSearchArray.length;pisa++){
					if(poInSearchArray[pisa][0]==itemInternalid){
						
						var pisArray=poInSearchArray[pisa][1];
						for(var pisi=0;pisi<pisArray.length;pisi++){
							var pisi_week=pisArray[pisi][0];
							var pisi_locationId=pisArray[pisi][3];
                            if(WeekNum==pisi_week&&pisi_locationId==itemLocationId){
                            	wkFirstDay =pisArray[pisi][1];
                            	insideData =pisArray[pisi][2];
                            }
						}
					}
				}

				if (isEmpty(insideData)) {
					htmlNote += '<td style="border:1px solid gray;"></td>';
				} else {
					htmlNote += '<td style="border:1px solid gray;" onClick="actualInPopUp('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+','+'\''+wkFirstDay+'\''+','+'\''+subsidiaryPar+'\''+','+'\''+'PO'+'\''+')">'+insideData+'</td>';
				}
				ActualINArray.push(Number(insideData));
				htmlNote += '<input id="actualIN:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:black;" disabled="disabled" value="'+insideData+'"/>';
			}
			// NOW
			htmlNote += '<td style="background-color:#e6e6e6;border-left:0px;width:110px;text-align:left;vertical-align:top;font-weight:bold;border-top-style:solid;border-right-style:solid;border-width:1px;border-color:gray;">'+itemLocationInventory+'</td>';
			htmlNote += '</tr>';
			
			// OUT(Year-1)
			htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
			
			// nullline
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-left-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			
			htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;">OUT(Year-1)</td>';
			for(var outyo=0;outyo<54;outyo++){
			
				var WeekNum=Number(Number(dateArray[outyo][1])-1)+'-'+dateArray[outyo][0];
				var insideData = '';
				var wkFirstDay='';
				for(var sisa=0;sisa<soOutSearchArray.length;sisa++){
					if(soOutSearchArray[sisa][0]==itemInternalid){
						
						var sisArray=soOutSearchArray[sisa][1];
						for(var sisi=0;sisi<sisArray.length;sisi++){
							var sisi_week=sisArray[sisi][0];
							var sisi_locationId=sisArray[sisi][3];
                            if(WeekNum==sisi_week&&sisi_locationId==itemLocationId){
                            	wkFirstDay =sisArray[sisi][1];
                            	insideData =sisArray[sisi][2];
                            }
						}
					}
				}

				htmlNote += '<td style="border:1px solid gray;">'+insideData+'</td>';
			}
			// NOW
			htmlNote += '<td style="background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote +='</tr>';
			
			// OUT(Year)
			htmlNote +='<tr style="height:'+trtdHeight+'px;background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
			
			// nullline
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-left-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-right-style:solid;border-bottom-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote +='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;">OUT(Year)</td>';
			var ActualOutYearArray=new Array();
			for(var outy=0;outy<54;outy++){
								
				var WeekNum=dateArray[outy][1]+'-'+dateArray[outy][0];
				var insideData = '';
				var wkFirstDay='';
				for(var sisa=0;sisa<soOutSearchArray.length;sisa++){
					if(soOutSearchArray[sisa][0]==itemInternalid){
						
						var sisArray=soOutSearchArray[sisa][1];
						for(var sisi=0;sisi<sisArray.length;sisi++){
							var sisi_week=sisArray[sisi][0];
							var sisi_locationId=sisArray[sisi][3];
                            if(WeekNum==sisi_week&&sisi_locationId==itemLocationId){
                            	wkFirstDay =sisArray[sisi][1];
                            	insideData =sisArray[sisi][2];
                            }
						}
					}
				}
				ActualOutYearArray.push(Number(insideData));
				
				if (isEmpty(insideData)) {
					htmlNote += '<td style="border:1px solid gray;"></td>';
				} else {
					htmlNote += '<td style="border:1px solid gray;" onClick="actualInPopUp('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+','+'\''+wkFirstDay+'\''+','+'\''+subsidiaryPar+'\''+','+'\''+'SO'+'\''+')">'+insideData+'</td>';
				}			
			}
			// NOW
			htmlNote += '<td style="background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '</tr>';
								
			// Forecast
			htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-left-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-left:0px;width:110px;text-align:left;vertical-align:top;font-weight:bold;border-top-style:solid;border-right-style:solid;border-width:1px;border-color:gray;">Forecast</td>';
			// OUT
			htmlNote +='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;">OUT</td>';
			var forecastOutArray=new Array();
			for(var fout=0;fout<54;fout++){
				var WeekNum=dateArray[fout][1]+'-'+dateArray[fout][0];
				var monthNum='';
				if(dateArray[fout][5]=='12'&&dateArray[fout][0]=='01'){
					monthNum=(Number(dateArray[fout][1])-1)+'-'+dateArray[fout][5];
				}else{
					monthNum=dateArray[fout][1]+'-'+dateArray[fout][5];	
				}
				var yearMonthWeek=monthNum+'('+dateArray[fout][0]+')';
				var insideData = '';
				var wkFirstDay='';

			//  営業計画で入力した月のFC数を週に平均配置。
				if(itemWeekOrMonth=='2'){
				 for(var fosa=0;fosa<forecastOutSearchArray.length;fosa++){
					if(forecastOutSearchArray[fosa][0]==itemInternalid){
						
						var foisArray=forecastOutSearchArray[fosa][1];
						for(var fosi=0;fosi<foisArray.length;fosi++){
							var foisi_locationId=foisArray[fosi][0];
							var foisi_month=foisArray[fosi][1];			
							var foisi_monthOutDate=foisArray[fosi][2];
							var foisi_monthBefore=foisArray[fosi][3];			
							var foisi_monthOutDateBefore=foisArray[fosi][4];
							var foisi_monthAfter=foisArray[fosi][5];			
							var foisi_monthOutDateAfter=foisArray[fosi][6];
								if(foisi_locationId==itemLocationId&&(monthNum==foisi_month)){
						             insideData = getOutWeekDate(WeekNum,foisi_month, foisi_monthOutDate,foisi_monthBefore,foisi_monthOutDateBefore,foisi_monthAfter,foisi_monthOutDateAfter);
								}							    
						     }
					       }
				       }
				 
				   //  営業計画で入力した週のFC数を配置。
				  }else if(itemWeekOrMonth=='1'){
					  for(var fowsa=0;fowsa<forecastOutWeekSearchArray.length;fowsa++){
						if(forecastOutWeekSearchArray[fowsa][0]==itemInternalid){		
							var foiswArray=forecastOutWeekSearchArray[fowsa][1];
							for(var fowsi=0;fowsi<foiswArray.length;fowsi++){
								var foiwsi_locationId=foiswArray[fowsi][0];
								var foiwsi_ymw=foiswArray[fowsi][1];			
								var foiwsi_monthOutDate=foiswArray[fowsi][2];
									if(foiwsi_locationId==itemLocationId&&(yearMonthWeek==foiwsi_ymw)){
								         insideData = foiwsi_monthOutDate;
									}							    
								   }
							   }
						}
				  }		
				if(insideData =='0'){
					insideData ='';
				}
			
			// 営業FCがない場合は、前年度出庫実績数を表示。	
			if(isEmpty(insideData)){
				var beforeWeekNum=Number(Number(dateArray[fout][1])-1)+'-'+dateArray[fout][0];
				for(var sisa=0;sisa<soOutSearchArray.length;sisa++){
					if(soOutSearchArray[sisa][0]==itemInternalid){
						
						var sisArray=soOutSearchArray[sisa][1];
						for(var sisi=0;sisi<sisArray.length;sisi++){
							var sisi_week=sisArray[sisi][0];
							var sisi_locationId=sisArray[sisi][3];
                            if(beforeWeekNum==sisi_week&&sisi_locationId==itemLocationId){
                            	wkFirstDay =sisArray[sisi][1];
                            	insideData =sisArray[sisi][2];
                            }
						}
					}
				}

				htmlNote += '<td style="border:1px solid gray;color:red;">'+insideData+'</td>';
			}else{
				htmlNote += '<td style="border:1px solid gray;">'+insideData+'</td>';
			     }
			forecastOutArray.push(Number(insideData));
			htmlNote += '<input id="forecastOut:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:black;" disabled="disabled" value="'+insideData+'"/>';
			}
			// NOW
			htmlNote += '<td style="background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
	        htmlNote +='</tr>';
	        

		    // IN(+)
			htmlNote += '<tr style="background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
			
			// nullline
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-left-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;"><p>IN(+)</p></td>';
            var inAddArray=new Array();
			for (var inadd = 0; inadd < 54; inadd++) {
				var WeekNum=dateArray[inadd][1]+'-'+dateArray[inadd][0];
				var insideData = '';			
						for(var scfcsa=0;scfcsa<scFcINAddSearchArray.length;scfcsa++){
							if(scFcINAddSearchArray[scfcsa][0]==itemInternalid){				
								var scfcArray=scFcINAddSearchArray[scfcsa][1];
								for(var scfcsi=0;scfcsi<scfcArray.length;scfcsi++){
									var scfcsi_week=scfcArray[scfcsi][1];
									var scfcsi_locationId=scfcArray[scfcsi][0];
		                            if(WeekNum==scfcsi_week&&scfcsi_locationId==itemLocationId){                         
		                            	insideData =scfcArray[scfcsi][2];      	
		                            }
								}
							}
						}
						inAddArray.push(Number(insideData));
						var Weeks=54-inadd;
					if (dateArray[inadd][3]) {
						htmlNote += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:red;">'+'<input id="inadd:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center;color:red;" value=""/>'+ insideData + '</td>';
					} else {
						htmlNote += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:red;"><input id="inadd:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" oninput="insideDataChange('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+','+'\''+Weeks+'\''+')" type="text" style="width:100%;height:100%;border:0px;padding:0px;background-color:#ffff99;text-align:right;color:red;" value="'+insideData+'"/></td>';					
			        }
					htmlNote += '<input id="inaddInitial:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; ;color:red;" disabled="disabled" value="'+insideData+'"/>';
			}
			// NOW
			htmlNote += '<td style="background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '</tr>';
            
            // IN(-)
			htmlNote += '<tr style="background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
			
			// nullline
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-left-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;"><p>IN(-)</p></td>';
			var inLessArray=new Array();
			for (var inless = 0; inless < 54; inless++) {
				var WeekNum=dateArray[inless][1]+'-'+dateArray[inless][0];
				var insideData = '';				
						for(var scfcsa=0;scfcsa<scFcINMinusSearchArray.length;scfcsa++){
							if(scFcINMinusSearchArray[scfcsa][0]==itemInternalid){				
								var scfcArray=scFcINMinusSearchArray[scfcsa][1];
								for(var scfcsi=0;scfcsi<scfcArray.length;scfcsi++){
									var scfcsi_week=scfcArray[scfcsi][1];
									var scfcsi_locationId=scfcArray[scfcsi][0];
		                            if(WeekNum==scfcsi_week&&scfcsi_locationId==itemLocationId){                         
		                            	insideData =scfcArray[scfcsi][2];
		                            }
								}
							}
						}
						inLessArray.push(Number(insideData));
						var Weeks=54-inless;
				if (dateArray[inless][3]) {
						htmlNote += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:blue;">'+'<input id="inless:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#ffff99;text-align:right;color:blue;" value=""/>'+ insideData + '</td>';
					} else {
						htmlNote += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:blue;"><input id="inless:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" oninput="insideDataChange('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+','+'\''+Weeks+'\''+')" type="text" style="width:100%;height:100%;border:0px;padding:0px;background-color:#ffff99;text-align:right;color:blue;" value="'+insideData+'"/></td>';
					}
				htmlNote += '<input id="inlessInitial:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:blue;" disabled="disabled" value="'+insideData+'"/>';
			}
			// NOW
			htmlNote += '<td style="background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '</tr>';

			// Balance
			htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
			// nullline
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-left-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;"><p>Balance</p></td>';
			var balanceWeekDate=0;
			var firstFlag=true;
			for (var bala = 0; bala < 54; bala++) {
				    var WeekNum=dateArray[bala][1]+'-'+dateArray[bala][0];
					var insideData = '';
					var actualIN=ActualINArray[bala];
					var forecastOut=forecastOutArray[bala];
					var ActualOut=ActualOutYearArray[bala];
					var inAddB=inAddArray[bala];
					var inLessB=inLessArray[bala];

					// 【現在の週より以前】
					// (今年度出庫実績/予測出庫数 )の比率
					// Actual OUT(Year)/Forecast OUT
					if (dateArray[bala][6]) {

						// どちらが0あるいはブランクの場合は空白で表示
						if ( forecastOut== 0 || ActualOut == 0) {
							insideData = '';
						} else {
							insideData = toPercent(ActualOut/forecastOut);
						}
						htmlNote += '<td id="balance:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" style="border:1px solid gray; color:blue;">'+insideData+'</td>';
						// 【現在の週】
					} else {
						// 現在在庫＋入庫予定+予測調整入庫数シミュレーション（+）-予測調整入庫数シミュレーション（-）
						if(firstFlag){
							balanceWeekDate+=Number(itemLocationInventory)+inAddB-inLessB+actualIN;
							firstFlag=false;
						}else{
							balanceWeekDate+=inAddB-inLessB+actualIN;
						}
						
						// 予測出庫＞今年度出庫実績の場合
						//if 実績_OUT < FC_OUT　
						// +（今年度出庫実績ー予測出庫）
						if (ActualOut<forecastOut) {
							balanceWeekDate = balanceWeekDate+(ActualOut-forecastOut);
							// 上記以外の場合
							// -予測出庫
						} else {
							balanceWeekDate =balanceWeekDate-forecastOut;
						}
						insideData=Number(balanceWeekDate.toFixed(2));
						//U396start
						if(insideData < 0){
							htmlNote += '<td id="balance:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" style="border:1px solid gray;color:red;">'+insideData+'</td>';
						}else{
							htmlNote += '<td id="balance:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" style="border:1px solid gray;color:black">'+insideData+'</td>';
						}
						//U396end
					}
					
					htmlNote += '<input id="balanceInput:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:black;" disabled="disabled" value="'+insideData+'"/>';
					htmlNote += '<input id="balanceInitial:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:black;" disabled="disabled" value="'+insideData+'"/>';							
			}
			// NOW
			htmlNote += '<td style="background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '</tr>';
	
			// Comment
			htmlNote += '<tr style="background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
			// nullline
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-left-style:solid;border-bottom-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-right-style:solid;border-bottom-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;"><p>Comment</p></td>';
	

				for (var comt = 0; comt < 54; comt++) {
				var comtDate = '';
				var comtId='';
				var WeekNum=dateArray[comt][1]+'-'+dateArray[comt][0];
				for(var scfcsa=0;scfcsa<scFcCommentSearchArray.length;scfcsa++){
					if(scFcCommentSearchArray[scfcsa][0]==itemInternalid){				
						var scfcArray=scFcCommentSearchArray[scfcsa][1];
						for(var scfcsi=0;scfcsi<scfcArray.length;scfcsi++){
							var scfcsi_week=scfcArray[scfcsi][1];
							var scfcsi_locationId=scfcArray[scfcsi][0];
                            if(WeekNum==scfcsi_week&&scfcsi_locationId==itemLocationId){                         
                            	if(scfcArray[scfcsi][2]=='- None -'){
                            		comtDate ='';
                            	}else{
                            		comtDate =scfcArray[scfcsi][2];	
                            	}
                            	comtId =scfcArray[scfcsi][3];
                            }
						}
					}
				}
				if (!isEmpty(comtDate)) {
					htmlNote += '<td id="Comment:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" style="border:1px solid gray;height:'+trtdHeight+'px;" onClick="commentPopUp('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+')">＊</td>';
				} else {
					htmlNote += '<td id="Comment:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" style="border:1px solid gray;height:'+trtdHeight+'px;" onClick="commentPopUp('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+')"></td>';
					}
				htmlNote += '<input id="CommentText:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:black;" disabled="disabled" value="'+comtDate+'"/>';
				htmlNote += '<input id="fcId:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:black;" disabled="disabled" value="'+comtId+'"/>';
				}
				// NOW
				htmlNote += '<td style="background-color:#e6e6e6;border-right-style:solid;border-bottom-style:solid;border-width:1px;border-color:gray;"></td>';
				htmlNote += '</tr>';
		
				beforeItem=itemInternalid;
	}
		htmlNote += '</table>';
	
		var feieldNote = form.addField('custpage_note', 'inlinehtml', '', '','');
		feieldNote.setDefaultValue(htmlNote);
	}else{
		var seachnull = form.addField('custpage_seachnull', 'text',
				'', null, 'custpage_run_info');
		seachnull.setDisplayType('inline');
		var messageColour = '<font color="red"> 関連データはありません </font>';
		seachnull.setDefaultValue(messageColour);
	}
}
	if(searchType=='T'){
	form.addButton('custpage_update', '更新', 'updateDate();');
	form.addButton('custpage_cacktosearch', '検索に戻る', 'backToSearch();');	
	//form.addSubmitButton('更新');
	}else{
	form.addButton('custpage_creatforecastreport', '検索', 'creatForecastReport();');
	if(nlapiGetUser()==developers_employee_id){
		form.addButton('custpage_test', 'test', 'testForecastReport();');
		}
	}
	
	response.writePage(form);
}
/**
 * @param {string} yearAndWeekNo       年号+周号 (yyyy-01 ~ yyyy-54)
 * @param {string} currentMonthOfYear  需要分割数据的年+月 (yyyy-01~yyyy-12)
 * @param {number} outCurrent          currentMonthOfYear的所有out数据
 * @param {string} lastMonthOfYear     需要分割数据的年+月的前一个月 (yyyy-01~yyyy-12)
 * @param {number} outLast             lastMonthOfYear的所有out数据
 * @param {string} nextMonthOfYear     需要分割数据的年+月的下一个月 (yyyy-01~yyyy-12)
 * @param {number} outNext             nextMonthOfYear的所有out数据
 * 
 * @return {number}(round) or null
 **/
function getOutWeekDate (yearAndWeekNo, currentMonthOfYear, outCurrent, lastMonthOfYear, outLast, nextMonthOfYear, outNext) {

    // when currentMonthOfYear, lastMonthOfYear and nextMonthOfYear are all empty, return null
    if (isEmpty(currentMonthOfYear) && isEmpty(lastMonthOfYear) && isEmpty(nextMonthOfYear)) {
        return null;
    }

    // result
    var res = null;
    // get year from string
    var year =  Number(yearAndWeekNo.slice(0, 4));
    // get week no from string
    var weekNo =  Number(yearAndWeekNo.slice(5));
    // current month out quantity
    var currentMonthAvrgOut = 0;
    // last month out quantity
    var lastMonthAvrgOut = 0;
    // next month out quantity
    var nextMonthAvrgOut = 0;
    // [days of fisrt month, days of second month]
    var days = getDaysOfWeek(year, weekNo);

    if (!isEmpty(currentMonthOfYear)) {
        // calculate Average out of currentMonthOfYear
        currentMonthAvrgOut = calcAvrgOut(year, currentMonthOfYear, outCurrent);
    }
    if (!isEmpty(lastMonthOfYear)) {
        // calculate Average out of lastMonthOfYear
        lastMonthAvrgOut = calcAvrgOut(year, lastMonthOfYear, outLast);
    }
    if (!isEmpty(nextMonthOfYear)) {
        // calculate Average out of nextMonthOfYear
        nextMonthAvrgOut = calcAvrgOut(year, nextMonthOfYear, outNext);
    }

    // if days of week are in the same month
    if (days.length == 1) {
        res = currentMonthAvrgOut * 7;
    } 
    // not in same month
    else {
        res = lastMonthAvrgOut * days[0] + currentMonthAvrgOut * days[1] + nextMonthAvrgOut * days[2];
    }

    return Math.round(res);
    //return res.toFixed(2)
}

/**
 * @param year
 * @param weekNo
 * 
 * @return {string[]}
 * when all weekdays are in the same month: [7]
 * when weekdays are in the different month: [0, n, 7-n]
 * when weekdays are in the different month,
 * and the week is the begin or the end of year: [0, n, 0]
 **/
function getDaysOfWeek(year, weekNo) {
    // create first date of the year
    var firstDayOfYear = new Date(year, 0, 1).getDay();
    var dt = new Date("Jan 01, " + year + " 01:00:00");
    // get million seconds By WeekNo
    var w = dt.getTime() - (3600000 * 24 * firstDayOfYear) + 604800000 * (weekNo - 1);
    // fisrt date of week
    var firstDayOfWeek = new Date(w);
    // last date of week (+ 6 days)
    var lastDayOfWeek = new Date(w + 518400000);
    // month of the begin date in week
    var monthOfFirstDt = firstDayOfWeek.getMonth();
    // month of the end date in week
    var monthOfLastDt = lastDayOfWeek.getMonth();

    // if the fisrt day of week and last day of week are in same month
    if (monthOfFirstDt == monthOfLastDt) {
        return [7];
    } else {
        // when the week is the first week of year OR last week of year
        // if the first date of week is in last year
        if (monthOfFirstDt == 11) {
            // if week is start of year
            if (weekNo == 1) {
                return [0, firstDayOfYear, 0];
            }
            // if week is end of year
            else {
                return [0, new Date(year, 11, 31).getDay() + 1, 0];
            }
        }
        var daysOfFisrtMonth = new Date(year, monthOfLastDt, 0).getDay() + 1;
        return [0, daysOfFisrtMonth, 7 - daysOfFisrtMonth];
    }
}

/**
 * @param year
 * @param monthOfYear (yyyy-01~yyyy~12)
 * @param outQuan       
 * 
 * @return avrgOut
 **/
function calcAvrgOut (year, monthOfYear, outQuan) {
    // get month from monthOfYear(digits:6~7)
    var mon = monthOfYear.slice(5);
    // calculate days of month
    var daysOfMonth = new Date(year, mon, 0).getDate();
    // calculate the average out and return
    return outQuan/daysOfMonth;
}
