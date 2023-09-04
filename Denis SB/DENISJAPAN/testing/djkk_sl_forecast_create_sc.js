/**
 * SC課FC作成
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/27     CPC_苑
 *
 */
//20230511 uploaded by zhou
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	nlapiLogExecution("debug","SC課FC作成","START");
	nlapiLogExecution("debug","in","START");
	var cacherecordid = request.getParameter('cacheRecordID');
	var date = request.getParameter('date');
	if (!isEmpty(cacherecordid)&&!isEmpty(date)) {
		var ctx = nlapiGetContext();		
		var scheduleparams = new Array();
		scheduleparams['custscript_djkk_forecast_cache_table_id'] = cacherecordid;
		scheduleparams['custscript_djkk_date'] = date;
		runBatch('customscript_djkk_ss_forecast_create_sc',
				'customdeploy_djkk_ss_forecast_create_sc', scheduleparams);
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

	var form = nlapiCreateForm('SC課FC作成_食品', false);
	form.setScript('customscript_djkk_cs_forecast_create_sc');
	// 実行情報
	form.addFieldGroup('custpage_run_info', '実行情報');
	form.addButton('custpage_refresh', '更新', 'refresh();');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_forecast_create_sc');

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
	var tableHeight='height:'+Number((screenHeight*59/60-270)*4/5)+'px;';//'height:600px;';//600
	var tableWidth='width:'+Number((screenWidth*59/60)*4/5)+'px;';//'width:1220px;';//1220
	var trtdWidth='width:'+Number(55)+'px;';
	var trtdHeight=23;//28
	var tableCloum1=60;//62
	var tableCloum2=121;//126
	var tableCloum3=241;//254
	var clearArray='';
	var searchType=request.getParameter('search');
	
	var form = '';
	if(searchType=='T'){
		form =nlapiCreateForm('SC課FC作成_食品', true);
	}else{
		form =nlapiCreateForm('SC課FC作成_食品', false);
	}
	form.setScript('customscript_djkk_cs_forecast_create_sc');
	if(logformflg){
	 form.addFieldGroup('custpage_run_info', '実行情報');
	 var runstatusField = form.addField('custpage_run_info_status', 'text', '', null, 'custpage_run_info');
     runstatusField.setDisplayType('inline');
     runstatusField.setDefaultValue('バッチ処理実行完了しました');
	}
	var dategroup = form.addFieldGroup('custpage_group_date', '基準日');//20230804 add by zhou CH776
	var filtergroup=form.addFieldGroup('custpage_group_filter', '検索項目');
	if(searchType=='T'){
		filtergroup.setShowBorder(false);
	}
	var dateField = form.addField('custpage_date', 'date', '基準日', 'null','custpage_group_date');
	dateField.setMandatory(true);
	var subsidiaryField=form.addField('custpage_subsidiary', 'select', '連結', null,'custpage_group_filter');
	var clearArrayField=form.addField('custpage_cleararray', 'inlinehtml', 'clearArray', null,'custpage_group_filter');
	clearArrayField.setDisplayType('hidden');
	var ssArray=new Array();
	var subsidiarySearch = nlapiSearchRecord("subsidiary",null,
			[
			 //["custrecord_djkk_subsidiary_type","anyof","1"]
//			   ["internalid","anyof",getRoleSubsidiary()] //before flit
			  ["internalid","isnotempty",'']//20230420 test by zhou 
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
	//20230804 add by zhou start CH776
	if(searchType=='T'){
		dategroup.setShowBorder(false);
		var statusText = form.addField('custpage_run_before_status', 'text',
				'', 'null', 'custpage_group_date');
		statusText.setDisplayType('inline');
		statusText.setDefaultValue('<font color="red" style="font-weight:bold;font-size:12pt">登録ボタンは1回のみクリックしてください</font>');
	}
	//20230804 add by zhou end CH776
	//subsidiaryField.setDisplayType('inline');
	var locationField=form.addField('custpage_location', 'multiselect', '場所', 'null','custpage_group_filter');
	locationField.setMandatory(true);	
	var vendorField=form.addField('custpage_vendor', 'select', '仕入先', 'null','custpage_group_filter');
	var brandField=form.addField('custpage_brand', 'multiselect', 'ブランド', 'null','custpage_group_filter');
	brandField.addSelectOption('0', '-すべて-');
	brandField.setDefaultValue('0');
	var itemField=form.addField('custpage_item', 'multiselect', '商品名', 'null','custpage_group_filter');
	itemField.addSelectOption('0', '-すべて-');
	itemField.setDefaultValue('0');
	brandField.setDisplaySize(450,100);
	itemField.setDisplaySize(450,100);
	var allItemField=form.addField('custpage_itemall', 'multiselect', '選択したすべての製品', 'null','custpage_group_filter');
	allItemField.setDisplayType('hidden');
	var searchTypeField=form.addField('custpage_searchtype', 'checkbox', 'searchtype', 'null','custpage_group_filter');
	searchTypeField.setDisplayType('hidden');
//	var itemFrom=form.addField('custpage_itemcodefrom', 'text', '商品コードFROM', 'null','custpage_group_filter');
//	var itemTo=form.addField('custpage_itemcodeto', 'text', '商品コードTO', 'null','custpage_group_filter');
	var cacheRecordIDField=form.addField('custpage_cacherecordid', 'text', 'FC_キャッシュテーブルID', 'null','custpage_group_filter');
	cacheRecordIDField.setDisplayType('hidden');
	var dateCurrent=request.getParameter('date');
	if(isEmpty(dateCurrent)){
		dateCurrent=nlapiDateToString(getSystemTime());
    }
	date = getSundayOfWeek(dateCurrent);
	var subsidiaryPar=userSubsidiary;
	var sbSelect=request.getParameter('subsidiary');
	if(!isEmpty(sbSelect)){
		subsidiaryPar=sbSelect;
	}
	
	var locationPar = request.getParameter('location');
	var vendorPar = request.getParameter('vendor');
	var itemPar = request.getParameter('item');
	var brandParArr = request.getParameter('brand');
	
    var brandPar = new Array();
    if (!isEmpty(brandParArr)) {
    	brandPar = brandParArr.split('');
    }
	
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
	}
	var htmlNote ='';
	var locationSearch = nlapiSearchRecord("customrecord_djkk_location_area",null,
			[
             //["custrecord_djkk_location_subsidiary.custrecord_djkk_subsidiary_type","anyof","1"]
             /***TODO**/
//             ["custrecord_djkk_location_subsidiary.internalid","anyof",getRoleSubsidiary()]//before code
             ["custrecord_djkk_location_subsidiary.internalid","anyof",subsidiaryPar]
			], 
			[
			   new nlobjSearchColumn("internalid").setSort(true), 
			   new nlobjSearchColumn("name")
			]
			);
	if (!isEmpty(locationSearch)) {
		for (var ls = 0; ls < locationSearch.length; ls++) {
			locationField.addSelectOption(locationSearch[ls]
					.getValue('internalid'), locationSearch[ls]
					.getValue('name'));
		}
	}
	
	var brandListSearch= nlapiSearchRecord("classification",null,
		   [
	       ["subsidiary","anyof",subsidiaryPar],
           //brand無効外す制限を追加
           "AND", 
           ["isinactive","is","F"]
	       
	       
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
	
       if(!isEmpty(dateCurrent)){
		dateField.setDefaultValue(dateCurrent);
         }
       if(!isEmpty(subsidiaryPar)&&subsidiaryPar!=0){
    	   subsidiaryField.setDefaultValue(subsidiaryPar);
    	    vendorField.addSelectOption('0', '');
    	    var vendorSearch = nlapiSearchRecord("vendor",null,
    	    		[
    	    		   ["subsidiary","anyof",subsidiaryPar], 
    	    		   "AND", 
    	    		   ["custentity_djkk_fc_flag","is","T"]
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
    	    nlapiLogExecution('error','subsidiaryPar',JSON.stringify(subsidiaryPar))
    	    var soForecastItemSearch = nlapiSearchRecord("customrecord_djkk_so_forecast",null,
    	    		[
    	    		   ["custrecord_djkk_so_fc_subsidiary","anyof",subsidiaryPar]
    	    		], 
    	    		[
    	    		 	new nlobjSearchColumn("custrecord_djkk_so_fc_item",null,"GROUP"), //20230411 CHANGED BY ZHOU 
    	    		   new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"),     //20230411 CHANGED BY ZHOU 	    		   
    	    		   /* U149 old*/ //   new nlobjSearchColumn("itemid","CUSTRECORD_DJKK_SO_FC_ITEM",null)
//    	    		   /* U149 new*/ new nlobjSearchColumn("custitem_djkk_product_code","CUSTRECORD_DJKK_SO_FC_ITEM",null)
    	    		   
    	    		]
    	    		);
    	    if (!isEmpty(soForecastItemSearch)) {
    			for (var itf = 0; itf < soForecastItemSearch.length; itf++) {
    				itemList.push(soForecastItemSearch[itf].getValue("internalid","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"));
    			}
    		}
    	    itemList = uniqueArray(itemList)
    	    nlapiLogExecution('error','itemList',JSON.stringify(itemList))
    	    nlapiLogExecution('error','vendorPar',JSON.stringify(vendorPar))
    	    nlapiLogExecution('error','brandPar',JSON.stringify(brandPar))
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
    	   
    	    var itemSearch = nlapiSearchRecord("item",null,itemSearchFilters
  				  , 
  				  [
  				     new nlobjSearchColumn("internalid"), 
  				   /*U149 old*/  // new nlobjSearchColumn("itemid")
  				   /*U149 new*/  new nlobjSearchColumn("custitem_djkk_product_code").setSort(false),
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
    				if(!isEmpty(itemSearch[its].getValue("custitem_djkk_product_code"))){
    					codeName='('+itemSearch[its].getValue("custitem_djkk_product_code")+') '+itemSearch[its].getValue("displayname");
    				}else{
    					codeName=itemSearch[its].getValue("displayname");
    				}
    				itemField.addSelectOption(itemSearch[its].getValue("internalid"),codeName);
    		    	allItemField.addSelectOption(itemSearch[its].getValue("internalid"), codeName);
    		    	
    		    	allItemArray.push(itemSearch[its].getValue("internalid"));
    		    	/*U149 new*/
    			}
    		}    
    	    nlapiLogExecution('error','allItemArray',JSON.stringify(allItemArray))
    	  }else{
    		  if(!isEmpty(vendorPar)&&vendorPar!=0){
      	    	vendorField.setDefaultValue(vendorPar);
                }
      	    if(!isEmpty(brandPar)&&brandPar!=0){
      	    	brandField.setDefaultValue(brandPar);
                }		  
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
							   ["custrecord_djkk_so_fc_subsidiary","anyof",subsidiaryPar], 
							   "AND", 
							   ["custrecord_djkk_so_fc_item.internalid","anyof",allItemArray],
							   "AND", 
							   ["custrecord_djkk_so_fc_location_area","anyof",locations]
							];
		
		var forecastSearch = '';
	if(!isEmpty(allItemArray)){
		forecastSearch = nlapiSearchRecord("customrecord_djkk_so_forecast",null,searchFilters, 
				[
                   new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"),
				/*U149 old*/   // new nlobjSearchColumn("itemid","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"), 
                   /*U149 new*/    new nlobjSearchColumn("custitem_djkk_product_code","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"), 				   
				   new nlobjSearchColumn("custrecord_djkk_so_fc_location_area",null,"GROUP"),
                   /*U149 old*/   //  new nlobjSearchColumn("salesdescription","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP")
				   /*U149 new*/ new nlobjSearchColumn("displayname","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"),
				   new nlobjSearchColumn("custitem_djkk_product_code","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP").setSort(false),
				   //202302036 add by zhou CH160 start
				   new nlobjSearchColumn('custitem_djkk_bp_memo_shipnum', "CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"),//DJ_営業計画メモ基準出荷数	
                   new nlobjSearchColumn('custitem_djkk_shipment_unit_type', "CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"),//DJ_出荷単位区分 
                   new nlobjSearchColumn('custitem_djkk_perunitquantity', "CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"),//DJ_入り数(入り目)	
                   new nlobjSearchColumn('saleunit', "CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"),//主要販売単位
//                 new nlobjSearchColumn('internalid', null,"GROUP")//
				   //end
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
//						   "AND", 
//						   ["status","anyof","PurchOrd:B","PurchOrd:D","PurchOrd:E","PurchOrd:P"],
						   "AND", 
						   ["approvalstatus","anyof","1","2"],
//						   "AND", 
//						   ["formulanumeric: {quantityuom}-{quantityshiprecv}","greaterthan","0"], 
						   "AND", 
						   ["item.internalid","anyof",allItemArray],
						   "AND", 
						   ["location.custrecord_djkk_location_area","anyof",locations], 
						   "AND", 
						   ["subsidiary","anyof",subsidiaryPar],
						   "AND", 
						   ["vendor.custentity_djkk_fc_flag","is","T"]
						], 
						[
						   new nlobjSearchColumn("item",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("expectedreceiptdate",null,"GROUP").setSort(false).setFunction('weekOfYear'), 
						   new nlobjSearchColumn("expectedreceiptdate",null,"GROUP").setSort(false).setFunction('calendarWeek'), 
						   //20230519 changed by zhou U355 ACtualIn受領後に削除
						   new nlobjSearchColumn("formulanumeric",null,"SUM").setFormula("{quantity}-{quantityshiprecv}"), 
//						   new nlobjSearchColumn("formulanumeric",null,"SUM").setFormula("{quantity}"), 
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
//										changeFcWeekOfYear(purchaseorderSearch[pos].getValue(columnID[1])),//20230330 changed by zhou
										newChangeFcWeekOfYear(purchaseorderSearch[pos].getValue(columnID[1])),//20230330 changed by zhou
										purchaseorderSearch[pos].getValue(columnID[2]),
										purchaseorderSearch[pos].getValue(columnID[3]),
										purchaseorderSearch[pos].getValue(columnID[4]),
										]);
			             }
						}
						poInSearchArray.push([allItemArray[aIa], poItemArray]);
					}
				}
				nlapiLogExecution('debug','poInSearchArray',JSON.stringify(poInSearchArray))
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
				var salesorderSearch = nlapiSearchRecord("transaction",null,
						[
						   /********old**********/
//						   ["type","anyof","CustCred","CustInvc"],//20230630 changed by zhou CH676 SO => クレジットメモ, 請求書
//						   "AND", 
//						   ["mainline","is","F"], 
//						   "AND", 
//						   ["taxline","is","F"], 
//						   "AND", 
//						   //請求書:全額支払, クレジットメモ:全額適用のいずれか
//						   ["status","anyof","CustInvc:B","CustCred:B"],//20230701 changed by zhou CH676
//						   "AND", 
//						   ["item.internalid","anyof",allItemArray], 
//						   "AND", 
//						   ["quantityshiprecv","greaterthan","0"], 
//						   "AND", 
//						   ["fulfillingtransaction.location","anyof",locationAreaArray], 
//						   "AND", 
//						   ["subsidiary","anyof",subsidiaryPar]
						   	/********old**********/
						    /********new**********/
						    //20230630 changed by zhou CH676
						   ["type","anyof","CustCred","CustInvc"], 
//						   "AND", 
//						   ["status","anyof","CustInvc:B","CustCred:B"], //20230713 changed by zhou
						   "AND", 
						   ["item.internalid","anyof",allItemArray], 
							"AND", 
							["quantity","greaterthan","0"], 
							"AND", 
//							["fulfillingtransaction.location","anyof",locationAreaArray], 
							["location","anyof",locationAreaArray],  
							"AND", 
							["mainline","is","F"], 
							"AND", 
							["taxline","is","F"], 
							"AND", 
							["subsidiary","anyof",subsidiaryPar]
						   /********new**********/
						], 
						[
						   new nlobjSearchColumn("item",null,"GROUP").setSort(false), 
						   //20230630 changed by zhou start CH676
						   //明細行.DJ_納品希望日 => body.DJ_納品日
//						   new nlobjSearchColumn("custcol_djkk_delivery_hopedate",null,"GROUP").setSort(false).setFunction('weekOfYear'), 
//						   new nlobjSearchColumn("custcol_djkk_delivery_hopedate",null,"GROUP").setSort(false).setFunction('calendarWeek'),
						   new nlobjSearchColumn("custbody_djkk_delivery_date",null,"GROUP").setSort(false).setFunction('weekOfYear'), 
						   new nlobjSearchColumn("custbody_djkk_delivery_date",null,"GROUP").setSort(false).setFunction('calendarWeek'),
						   new nlobjSearchColumn("quantity",null,"SUM"), 
//						   new nlobjSearchColumn("location","fulfillingTransaction","GROUP")
						   new nlobjSearchColumn("custrecord_djkk_location_area","location","GROUP")//20230707 changedby zhou CH676
						   //20230630 changed by zhou end CH676
						]
						);
				if (!isEmpty(salesorderSearch)) {
					for (var aIs = 0; aIs < allItemArray.length; aIs++) {
						var soItemArray = new Array();
						for (var sos = 0; sos < salesorderSearch.length; sos++) {
						var columnID = salesorderSearch[sos].getAllColumns();
			             if(allItemArray[aIs]==salesorderSearch[sos].getValue(columnID[0])){
			            	 soItemArray.push([
								//changeFcWeekOfYear(salesorderSearch[sos].getValue(columnID[1])),//20230605 changed by zhou CH634
								newChangeFcWeekOfYear(salesorderSearch[sos].getValue(columnID[1])),//20230605 changed by zhou CH634
								salesorderSearch[sos].getValue(columnID[2]),
								salesorderSearch[sos].getValue(columnID[3]),
//								locationAreaList['locationId:'+salesorderSearch[sos].getValue(columnID[4])]]);//20230707 changedby zhou CH676
								salesorderSearch[sos].getValue(columnID[4])//20230707 changedby zhou CH676
							 ]);
			             }
						}
						
						soOutSearchArray.push([allItemArray[aIs], soItemArray]);
					}
				}
		   // SO-OUT-Search END
		
			 // 20230203 add by zhou start
			 // SO-OUT-Search 顧客区分
				var soOutSearchArrayByCustomer = new Array();
				var salesorderSearchByCustomer = nlapiSearchRecord("transaction",null,
						[
//						   ["type","anyof","SalesOrd"], 
//						   "AND", 
//						   ["mainline","is","F"], 
//						   "AND", 
//						   ["taxline","is","F"], 
//						   "AND", 
//						   ["status","noneof","SalesOrd:A","SalesOrd:H"], 
//						   "AND", 
//						   ["item.internalid","anyof",allItemArray], 
//						   "AND", 
//						   ["quantityshiprecv","greaterthan","0"], 
//						   "AND", 
//						   ["fulfillingtransaction.location","anyof",locationAreaArray], 
//						   "AND", 
//						   ["subsidiary","anyof",subsidiaryPar]
////							   ,"AND", 
////							   ["custcol_djkk_custody_item","is","F"]	

							/********new**********/
							//20230630 changed by zhou CH676
							["type","anyof","CustCred","CustInvc"], 
//							"AND", 
//							["status","anyof","CustInvc:B","CustCred:B"], //20230713 changed by zhou
							"AND", 
							["item.internalid","anyof",allItemArray], 
							"AND", 
							["quantity","greaterthan","0"], 
							"AND", 
//							["fulfillingtransaction.location","anyof",locationAreaArray], 
							["location","anyof",locationAreaArray], 
							"AND", 
							["mainline","is","F"], 
							"AND", 
							["taxline","is","F"], 
							"AND", 
							["subsidiary","anyof",subsidiaryPar]
							/********new**********/
						], 
						[
						   new nlobjSearchColumn("item",null,"GROUP").setSort(false), 
						   //20230630 changed by zhou start CH676
						   //明細行.DJ_納品希望日 => body.DJ_納品日
//						   new nlobjSearchColumn("custcol_djkk_delivery_hopedate",null,"GROUP").setSort(false).setFunction('weekOfYear'), 
//						   new nlobjSearchColumn("custcol_djkk_delivery_hopedate",null,"GROUP").setSort(false).setFunction('calendarWeek'),
						   new nlobjSearchColumn("custbody_djkk_delivery_date",null,"GROUP").setSort(false).setFunction('weekOfYear'), 
						   new nlobjSearchColumn("custbody_djkk_delivery_date",null,"GROUP").setSort(false).setFunction('calendarWeek'),
						   new nlobjSearchColumn("quantity",null,"SUM"), 
//						   new nlobjSearchColumn("location","fulfillingTransaction","GROUP"),//20230707 changedby zhou CH676
						   new nlobjSearchColumn("custrecord_djkk_location_area","location","GROUP"),//20230707 changedby zhou CH676
						   new nlobjSearchColumn("entity", null, 'GROUP'), //顧客
//						   new nlobjSearchColumn('formulatext', null, 'group').setFormula('TO_CHAR({trandate},\'YYYYMON\')').setSort(false), // 日付
						   new nlobjSearchColumn('internalid', null, 'group'), 
//						   new nlobjSearchColumn("location","fulfillingTransaction","GROUP"),
//						   new nlobjSearchColumn("type",null,"GROUP")//トランザクション種類
						   //20230630 changed by zhou end CH676
						]
						);
				if (!isEmpty(salesorderSearchByCustomer)) {
					nlapiLogExecution('debug','in11',JSON.stringify('in11'))
					for (var ala = 0; ala < allItemArray.length; ala++) {
						var soItemArrayByCustomer = new Array();
						for (var sbc = 0; sbc < salesorderSearchByCustomer.length; sbc++) {
						var columnID = salesorderSearchByCustomer[sbc].getAllColumns();
			             if(allItemArray[ala]==salesorderSearchByCustomer[sbc].getValue(columnID[0])){
			            	 soItemArrayByCustomer.push([   
										newChangeFcWeekOfYear(salesorderSearchByCustomer[sbc].getValue(columnID[1])),
										salesorderSearchByCustomer[sbc].getValue(columnID[2]),//date
										salesorderSearchByCustomer[sbc].getValue(columnID[3]),//quantity
//										locationAreaList['locationId:'+salesorderSearchByCustomer[sbc].getValue(columnID[4])],//locationid //20230707 changedby zhou CH676
										salesorderSearchByCustomer[sbc].getValue(columnID[4]),//20230707 changedby zhou CH676
										salesorderSearchByCustomer[sbc].getValue(columnID[5]),//顧客id
										salesorderSearchByCustomer[sbc].getText(columnID[5]),//顧客name
										salesorderSearchByCustomer[sbc].getValue(columnID[6]),//soid
//										salesorderSearchByCustomer[sbc].getValue(columnID[7])//
//										locationAreaList['locationId:'+salesorderSearch[sos].getValue(columnID[4])]
										]);
			            	 			
			             }
						}
//						nlapiLogExecution('debug','in',JSON.stringify(allItemArray[ala]))
						soOutSearchArrayByCustomer.push([allItemArray[ala], soItemArrayByCustomer]);
					}
				}
			nlapiLogExecution('debug','soOutSearchArrayByCustomer',JSON.stringify(soOutSearchArrayByCustomer))
			// SO-OUT-Search END				
			//0230203 add by zhou end	
				
				
		   // Forecast-OUT-Search
				var forecastOutSearchArray=new Array();
				var forecastOutSearch = nlapiSearchRecord("customrecord_djkk_so_forecast",null,
						[
						   ["custrecord_djkk_so_fc_subsidiary","anyof",subsidiaryPar], 
						   "AND", 
						   ["custrecord_djkk_so_fc_item","anyof",allItemArray], 
						   "AND", 
						   ["custrecord_djkk_so_fc_location_area","anyof",locations],
				           "AND", 
				           ["isinactive","is","F"]
						], 
						[
						   new nlobjSearchColumn("custrecord_djkk_so_fc_item",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_so_fc_location_area",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("CASE WHEN TO_NUMBER({custrecord_djkk_so_fc_month}) <10 THEN ({custrecord_djkk_so_fc_year}||'-0'||{custrecord_djkk_so_fc_month}) ELSE ({custrecord_djkk_so_fc_year}||'-'||{custrecord_djkk_so_fc_month}) END").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_so_fc_fcnum",null,"SUM"),//TODO
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
										beforeMonth,
										beforeOutDate,
										afterMonth,
										afterOutDate//TODO
										]);
			             }
						}
						forecastOutSearchArray.push([allItemArray[aIa], focItemArray]);
					}			
				}
		// Forecast-OUT-Search END
		// SC課FC Search
				var scFcINAddSearchArray=new Array();
				var scFcINMinusSearchArray=new Array();
				var scFcCommentSearchArray=new Array();
				var scForecastSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast",null,
						[
						   ["custrecord_djkk_sc_fc_item","anyof",allItemArray], 
						   "AND", 
						   ["custrecord_djkk_sc_fc_subsidiary","anyof",subsidiaryPar], 
						   "AND", 
						   ["custrecord_djkk_sc_fc_location_area","anyof",locations]
						], 
						[
						   new nlobjSearchColumn("custrecord_djkk_sc_fc_item",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_sc_fc_location_area",null,"GROUP").setSort(false), 
						   new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("{custrecord_djkk_sc_fc_year}||'-'||{custrecord_djkk_sc_fc_week}").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_sc_fc_add",null,"GROUP"), 
						   new nlobjSearchColumn("custrecord_djkk_sc_fc_minus",null,"GROUP"), 
						   new nlobjSearchColumn("custrecord_djkk_sc_fc_comment",null,"GROUP"), 
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
				nlapiLogExecution('debug','scFcCommentSearchArray',JSON.stringify(scFcCommentSearchArray))
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
				
				
				
//		var referenceDate='';
//		if(getLastSunday(date,false)==date){//changed by zhou
//			referenceDate=date;
//		}else{
//		referenceDate=dateAddDays(date, -7);
//		}
//		var changeDate = dateAddDays(date, -7*27);
//		var dateArray = new Array();
//		var systemDate=nlapiDateToString(getSystemTime());
//		for (var da = 0; da < 54; da++) {
//			var referenceFlg=false;
//			if(changeDate==referenceDate){
//				referenceFlg=true;
//			}
//			var balancedatebefor=compareStrDate(getSunday(dateAddDays(changeDate, 7),false), systemDate);
//			var systemdatebefor=compareStrDate(getSunday(changeDate), systemDate);
//			var dateweek = newGetYearWeek(changeDate);//20230327 changed by zhou
//			var pushyear = getYear(changeDate);
//			var pushdate = getLastSunday(changeDate,true);//changed by zhou
//			var pushMonth=(pushdate.split('/'))[0];
//			//20230327 changed by zhou start Modification point 4
//			//CH355  zhou memo :次のコードが原因不明のため、週数計算の異常が発生したためコメントされています
////			if (dateweek == '52') {
////				dateweek = '1';
////				pushyear = Number(pushyear) + 1;
////			} else 
////				if(dateweek == '53'){
////				dateweek = '2';
////				pushyear = Number(pushyear) + 1;
////			}else {
////				dateweek = Number(dateweek) + 1;
////			}
////			if (dateweek == '0') {
////				dateweek = '53';
////			}
////			if (dateweek == '53') {
////				pushyear = Number(pushyear) + 1;
////			}
//			//20230327 changed by zhou end Modification point 4
//			if(Number(dateweek)<10){
//				dateweek='0'+dateweek;
//			}
//			if(Number(pushMonth)<10){
//				pushMonth='0'+pushMonth;
//			}
//			//20230407 changed by zhou start Modification point 5
//			if(Number(dateweek)> 52){
//				pushMonth = '12';
//			}
			
			
			
				
			var referenceDate='';
			if(getLastSunday(date,false)==date){
				referenceDate=date;
			}else{
			referenceDate=dateAddDays(date, -7);
			}
			var changeDate = dateAddDays(date, -7*27);
			var dateArray = new Array();
			var systemDate=nlapiDateToString(getSystemTime());
			var beforeDateweek;
			for (var da = 0; da < 54; da++) {
				var referenceFlg=false;
				if(changeDate==referenceDate){
					referenceFlg=true;
				}
//				var balancedatebefor=compareStrDate(getSunday(dateAddDays(changeDate, 7),false), systemDate);//20230719 changed by zhou CH744 BUG
				var systemdatebefor=compareStrDate(getSunday(changeDate), systemDate);
				var balancedatebefor = systemdatebefor;//20230719 add by zhou CH744 BUG
				
				var dateweek = newGetYearWeek(changeDate);
				
				
				
				if(!isEmpty(beforeDateweek) && dateweek == beforeDateweek){
					dateweek++
				}
//				var dateweek = Math.floor((diffDays + 1) / 7);
				if(changeDate == '2023/03/12' ||changeDate == '2023/03/19'  ){
					nlapiLogExecution('error','changeDate',changeDate)
					nlapiLogExecution('error','dateweek',dateweek)
				}
				beforeDateweek = dateweek;
				
				var pushyear = getYear(changeDate);
				var pushdate = getLastSunday(changeDate,true);
				var pushMonth=(pushdate.split('/'))[0];
//				if (dateweek == '52') {
//					dateweek = '1';
//					pushyear = Number(pushyear) + 1;
//				} else if(dateweek == '53'){
//					dateweek = '2';
//					pushyear = Number(pushyear) + 1;
//				}else {
//					dateweek = Number(dateweek) + 1;
//				}
				if(Number(dateweek)<10){
					dateweek='0'+dateweek;
				}
				if(Number(pushMonth)<10){
					pushMonth='0'+pushMonth;
				}
				if(Number(dateweek)> 52){
				pushMonth = '12';
			    }
				
			//20230407 changed by zhou end Modification point 5
			dateArray.push([ dateweek, pushyear, pushdate,systemdatebefor,referenceFlg,pushMonth,balancedatebefor,changeDate]);//20230330 changed by zhou
			changeDate = dateAddDays(changeDate, 7);
		}

			// ';htmlNote +='

		htmlNote +='<div id="tablediv" style="overflow:scroll;'+tableWidth+tableHeight+'border:1px solid gray;border-bottom: 0;border-right: 0;font-size:13px">';
		htmlNote += '<table id="tableList" cellspacing="0" border="0" cellpadding="0" style="border-collapse:separate;width:3500px;table-layout: fixed;">';//3721
		htmlNote += '<thead style="position:sticky;top:0;z-index:2;">';
		htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#ffcc80;font-weight:bold;text-align:right;">';
		htmlNote += '<td colspan="2" rowspan="2" style="position:sticky;left:0;z-index:2;background-color:#ffcc80;border:1px solid gray;border-right:0px;vertical-align:top;">PrintDate:</td>';
		htmlNote += '<td rowspan="2" style="position:sticky;left:'+tableCloum2+'px;z-index:2;background-color:#ffcc80;border:1px solid gray;border-left:0px;vertical-align:top;">'+ dateCurrent + '</td>';
		
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
		htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:2;background-color:#ffcc80;border:1px solid gray;border-left:0px;">'+ dateCurrent + '</td>';
		
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
		
		//20230324 add by zhou start CH355 Modification point 1
		var forecastSearchArr = [];//同じ商品、場所別にソートする新しい配列オブジェクトを宣言する
		for (var sl = 0; sl < forecastSearch.length; sl++) {
			//同じ商品、場所によってソートされる新しい配列オブジェクトの分割
			var fcColumnID = forecastSearch[sl].getAllColumns();
			var itemInternalidBefore=forecastSearch[sl].getValue(fcColumnID[0]);
			var itemIdBefore=forecastSearch[sl].getValue(fcColumnID[1]);
			var itemLocationBefore=forecastSearch[sl].getText(fcColumnID[2]);
			var itemLocationIdBefore=forecastSearch[sl].getValue(fcColumnID[2]);
            var itemDescriptionBefore=forecastSearch[sl].getValue(fcColumnID[3]);
            //20230203 add by zhou start CH160  
            var memoShipNumBefore=forecastSearch[sl].getValue(fcColumnID[5]);//DJ_営業計画メモ基準出荷数
            var shipmentUnitTypeBefore=forecastSearch[sl].getValue(fcColumnID[6]);//DJ_出荷単位区分 
            var perunitquantityBefore =forecastSearch[sl].getValue(fcColumnID[7]);//DJ_入り数(入り目)  
            var saleunitBefore=forecastSearch[sl].getText(fcColumnID[8]);//主要販売単位
            var inid=forecastSearch[sl].getText(fcColumnID[9]);
//            nlapiDeleteRecord('customrecord_djkk_so_forecast',inid)
            forecastSearchArr.push({
            	itemInternalid:itemInternalidBefore,
            	itemId:itemIdBefore,
            	itemLocation:itemLocationBefore,
            	itemLocationId:itemLocationIdBefore,
            	itemDescription:itemDescriptionBefore,
            	memoShipNum:memoShipNumBefore,
            	shipmentUnitType:shipmentUnitTypeBefore,
            	perunitquantity:perunitquantityBefore,
            	saleunit:saleunitBefore,
            	inid:inid
            })
            //end
           
		}  
		
		nlapiLogExecution("debug","forecastSearchArr IN ","forecastSearchArr");
		
		if(!isEmpty(forecastSearchArr)){
			nlapiLogExecution("debug","forecastSearchArr",JSON.stringify(forecastSearchArr));
		}
		
		var newForecastArr = arrSortForLocation(forecastSearchArr);//ソートされた配列
        //20230324 add by zhou end CH355 Modification point 1
		//20230324 add by zhou start CH355 Modification point 2
		for (var itemc = 0; itemc < newForecastArr.length; itemc++) {
			var itemInternalid=newForecastArr[itemc].itemInternalid;
			var itemId=newForecastArr[itemc].itemId;
			var itemLocation=newForecastArr[itemc].itemLocation;
			var itemLocationId=newForecastArr[itemc].itemLocationId;
            var itemDescription=newForecastArr[itemc].itemDescription;
            //20230203 add by zhou start CH160  
            var memoShipNum=newForecastArr[itemc].memoShipNum;//DJ_営業計画メモ基準出荷数
            var shipmentUnitType=newForecastArr[itemc].shipmentUnitType;//DJ_出荷単位区分 
            var perunitquantity =newForecastArr[itemc].perunitquantity;//DJ_入り数(入り目)  
            var saleunit=newForecastArr[itemc].saleunit;//主要販売単位
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
            
          //20230324 add by zhou end CH355 Modification point 2
            if(itemDescription=='- None -'){
            	itemDescription='';
            }
                       
            // same item different location only push one
            if(beforeItem!=itemInternalid){
			htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#e6e6e6;font-weight:bold;position:sticky;top:0;">';
			htmlNote += '<td colspan="2"  style="position:sticky;left:0;z-index:1;border:1px solid gray;background-color:#e6e6e6;border-right:0px;text-align:left;color:#0033cc;">'+itemId+'</td>';
			htmlNote += '<td colspan="2"  style="position:sticky;left:'+tableCloum2+'px;z-index:1;border:1px solid gray;background-color:#e6e6e6;border-right:0px;border-left:0px;text-align:left;color:#0033cc;font-size:15px;width:135px;"></td>';//StockTerm='+itemInternalid+'
			htmlNote += '<td colspan="10"  style="position:sticky;left:'+tableCloum3+'px;z-index:1;border:1px solid gray;background-color:#e6e6e6;border-right:0px;border-left:0px;text-align:left;color:#0033cc;font-size:15px;width:135px;">'+itemDescription+'</td>';
			htmlNote += '<td colspan="43" style="border:1px solid gray;background-color:#e6e6e6;border-left:0px;text-align:left;color:#0033cc;"></td>';
			// NOW
			htmlNote += '<td colspan="1" style="border:1px solid gray;background-color:#e6e6e6;border-left:0px;text-align:right;color:#0033cc;">'+itemInventory+'</td>';//20230522 changed by zhou now文字列の右揃え
			htmlNote += '</tr>';
            }
			htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
						
			// location
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-right:0px;width:110px;text-align:left;vertical-align:top;color:#0033cc;font-weight:bold;border-top-style:solid;border-left-style:solid;border-width:1px;border-color:gray;">'+itemLocation+'</td>';
			
			// Actual
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-left:0px;width:110px;text-align:left;vertical-align:top;font-weight:bold;border-top-style:solid;border-right-style:solid;border-width:1px;border-color:gray;">Actual</td>';
//			dateArray.push([ dateweek, pushyear, pushdate,systemdatebefor,referenceFlg,pushMonth,balancedatebefor,changeDate]);//20230330 changed by zhou
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
							var pisi_week=pisArray[pisi][0];//expectedreceiptdate weekofyear
							var pisi_locationId=pisArray[pisi][3];// po location
							
                            if(WeekNum==pisi_week&&pisi_locationId==itemLocationId){
                            	wkFirstDay =pisArray[pisi][1];//calendarweek
                            	insideData =pisArray[pisi][2];//quantity
                            	if(insideData == '0' || insideData == 0){
                            		insideData ='';
                            	}
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
			htmlNote += '<td style="background-color:#e6e6e6;border-left:0px;width:110px;text-align:right;vertical-align:top;font-weight:bold;border-top-style:solid;border-right-style:solid;border-width:1px;border-color:gray;">'+itemLocationInventory+'</td>';//20230522 changed by zhou now文字列の右揃え
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
					htmlNote += '<td style="border:1px solid gray;" onClick="actualInPopUp('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+','+'\''+wkFirstDay+'\''+','+'\''+subsidiaryPar+'\''+','+'\''+'クレジットメモ&請求書'+'\''+')">'+insideData+'</td>';//20230707 so => クレジットメモ&請求書
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
			var weekAndNumObj = [];
			for(var fout=0;fout<54;fout++){
				var WeekNum=dateArray[fout][1]+'-'+dateArray[fout][0];
				var lastSunday=dateArray[fout][7];//TODO
				var monthNum='';
				if(dateArray[fout][5]=='12'&&dateArray[fout][0]=='01'){
					monthNum=(Number(dateArray[fout][1])-1)+'-'+dateArray[fout][5];
				}else{
					monthNum=dateArray[fout][1]+'-'+dateArray[fout][5];	
				}
				var insideData = '';
				var wkFirstDay='';
				
			  //  営業計画で入力した月のFC数を週に平均配置。
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
								if(foisi_locationId==itemLocationId&&monthNum==foisi_month){

									//nlapiLogExecution('debug',monthNum+'|'+foisi_monthBefore);
						             insideData = getOutWeekDate(WeekNum,foisi_month, foisi_monthOutDate,foisi_monthBefore,foisi_monthOutDateBefore,foisi_monthAfter,foisi_monthOutDateAfter,lastSunday);
						             weekAndNumObj.push({
						            	 WeekNum:WeekNum,
						            	 insideData:insideData
						             })
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
			nlapiLogExecution('debug','weekAndNumObj',JSON.stringify(weekAndNumObj))
			// NOW
			htmlNote += '<td style="background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
	        htmlNote +='</tr>';
	        

		    // IN(+)
			htmlNote += '<tr style="background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
			
			// nullline
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-left-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;">IN(+)</td>';
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
						clearArray+='inadd:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'&'+Weeks+',';
						htmlNote += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:red;"><input id="inadd:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" oninput="insideDataChange('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+','+'\''+Weeks+'\''+')" type="text" style="width:100%;height:100%;border:0px;padding:0px;background-color:#ffff99;text-align:right;color:red;" value="'+insideData+'"/></td>';					
			        }
					htmlNote += '<input id="inaddInitial:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:red;" disabled="disabled" value="'+insideData+'"/>';
			}
			// NOW
			htmlNote += '<td style="background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '</tr>';
            
            // IN(-)
			htmlNote += '<tr style="background-color:#e6e6e6;text-align:right;position:sticky;top:0;">';
			
			// nullline
			htmlNote += '<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border-left-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border-right-style:solid;border-width:1px;border-color:gray;"></td>';
			htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;">IN(-)</td>';
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
						clearArray+='inless:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'&'+Weeks+',';
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
			htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;">Balance</td>';
			var balanceWeekDate=0;
			var firstFlag=true;
			for (var bala = 0; bala < 54; bala++) {
				    var WeekNum=dateArray[bala][1]+'-'+dateArray[bala][0];
				   // nlapiLogExecution('debug','WeekNum:'+WeekNum);
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
						//20230719 changed by zhou start CH744
						if ( forecastOut== 0 || ActualOut == 0) {
							insideData = '-';
						} else {
							insideData = toPercent(ActualOut/forecastOut);
							insideData = percentageToNumber(insideData)
						}
						if(insideData ==  '-0.0'){
							insideData = '0.0';
						}
						htmlNote += '<td id="balance:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" style="border:1px solid gray; color:blue;">'+insideData+'</td>';
						//20230719 changed by zhou end
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
						htmlNote += '<td id="balance:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" style="border:1px solid gray;">'+insideData+'</td>';
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
			htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;font-weight:bold;">Comment</td>';
	
//			for(var outyo=0;outyo<54;outyo++){
//				
//				var ActlastNum = 0;
//				for(var sisa=0;sisa<soOutSearchArray.length;sisa++){
//					if(soOutSearchArray[sisa][0]==itemInternalid){
//						
//						var sisArray=soOutSearchArray[sisa][1];
//						for(var d=0;d<sisArray.length;d++){
//							var sisi_week=sisArray[d][0];
//							var sisi_locationId=sisArray[d][3];
//                            if(WeekNum==sisi_week&&sisi_locationId==itemLocationId){
//                            	ActlastNum =Number(sisArray[d][2]);
//                            }
//						}
//					}
//				}
//
//				htmlNote += '<td style="border:1px solid gray;">'+insideData+'</td>';
//			}
				for (var comt = 0; comt < 54; comt++) {
				var comtDateByCustomer = '';//add by zhou 230201
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
				comtDate=comtDate.replace(/\n/g,'<br>');
				if(isEmpty(comtDate)){
					//soOutSearchArrayByCustomer - 注文書検索 - 顧客区分配列
					//CH160 : 初期デフォルトmemo
					var ActlastNum = 0;
					for(var sisa=0;sisa<soOutSearchArray.length;sisa++){
						if(soOutSearchArray[sisa][0]==itemInternalid){
							
							var sisArray=soOutSearchArray[sisa][1];
							for(var d=0;d<sisArray.length;d++){
								var sisi_week=sisArray[d][0];
								var sisi_locationId=sisArray[d][3];
	                            if(WeekNum==sisi_week&&sisi_locationId==itemLocationId){
	                            	ActlastNum =Number(sisArray[d][2]);
	                            }
							}
						}
					}
//					nlapiLogExecution('debug','ActlastNum',JSON.stringify(ActlastNum))
					for(var sbc=0;sbc<soOutSearchArrayByCustomer.length;sbc++){
						if(soOutSearchArrayByCustomer[sbc][0]==itemInternalid){	
							var commentDataArray2 =soOutSearchArrayByCustomer[sbc][1];//son array
							if(Number(ActlastNum)>Number(memoShipNum) && shipmentUnitType == '102'){
		                		//DJ_出荷単位区分  ケースの場合  CustomerData array
								for(var cd = 0;cd<commentDataArray2.length;cd++){
									var commentDate = commentDataArray2[cd][0];//販売時間 YYYY-MM
//									var soDate = commentDataArray2[cd][1];//販売時間 YYYY/MM/dd
									var itemQuantity = commentDataArray2[cd][2];//現在の顧客 商品 実績の数量
									var salesQuantity = itemQuantity/perunitquantity;//受注数
									var commentDatelocationId = commentDataArray2[cd][3];//場所Id
//									var customerId = commentDataArray2[cd][4];//顧客Id
									var customerName = commentDataArray2[cd][5];//顧客name

		                            if(WeekNum==commentDate&&commentDatelocationId==itemLocationId){
		                            	comtDateByCustomer += salesQuantity+'ケース: '+customerName;//memo text
		                                comtDateByCustomer +=','
		                            }
								}
								
		                	}else if(Number(ActlastNum)>Number(memoShipNum) && shipmentUnitType == '102'){
		                		//DJ_出荷単位区分  バラの場合   CustomerData array
		                		for(var cd = 0;cd<commentDataArray2.length;cd++){
									var commentDate = commentDataArray2[cd][0];//販売時間 YYYY-MM
//									var soDate = commentDataArray2[cd][1];//販売時間 YYYY/MM/dd
									var itemQuantity = commentDataArray2[cd][2];//現在の顧客 商品 実績の数量
									var commentDatelocationId = commentDataArray2[cd][3];//場所Id
									var customerId = commentDataArray2[cd][4];//顧客Id
									var customerName = commentDataArray2[cd][5];//顧客name
		                            if(WeekNum==commentDate&&commentDatelocationId==itemLocationId){
		                            	comtDateByCustomer += itemQuantity+saleunit+': '+customerName;//memo text  
		                                comtDateByCustomer +=','
		                            }
								}
		                	}
						}
					}
				}
				comtDateByCustomer = comtDateByCustomer.replace(/\n/g,'<br>');
				comtDateByCustomer = comtDateByCustomer.substring(0, comtDateByCustomer.lastIndexOf(','));
				if (!isEmpty(comtDate)) {
					htmlNote += '<td id="Comment:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" style="border:1px solid gray;height:'+trtdHeight+'px;" onClick="commentPopUp('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+')">＊</td>';
					htmlNote += '<input id="CommentText:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:black;" disabled="disabled" value="'+comtDate+'"/>';
				} else if(!isEmpty(comtDateByCustomer)){
					nlapiLogExecution('debug','comtDateByCustomer2',JSON.stringify(comtDateByCustomer))
					htmlNote += '<td id="Comment:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" style="border:1px solid gray;height:'+trtdHeight+'px;" onClick="commentPopUp('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+')">＊</td>';
					htmlNote += '<input id="CommentText:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:black;" disabled="disabled" value="'+comtDateByCustomer+'"/>';
				}else {
					htmlNote += '<td id="Comment:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" style="border:1px solid gray;height:'+trtdHeight+'px;" onClick="commentPopUp('+'\''+itemInternalid+'\''+','+'\''+itemLocationId+'\''+','+'\''+WeekNum+'\''+')"></td>';
					htmlNote += '<input id="CommentText:'+itemInternalid+'|'+itemLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; color:black;" disabled="disabled" value="'+comtDate+'"/>';
				}
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
	form.addButton('custpage_update', '登録', 'updateDate();');
	form.addButton('custpage_cacktosearch', '検索に戻る', 'backToSearch();');	
	form.addButton('custpage_cleardata', 'クリア', 'inAddInLessClear();');
	clearArrayField.setDefaultValue(clearArray);
	
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
function getOutWeekDate (yearAndWeekNo, currentMonthOfYear, outCurrent, lastMonthOfYear, outLast, nextMonthOfYear, outNext,lastSunday) {
//nlapiLogExecution('error','outCurrent',outCurrent)
    // when currentMonthOfYear, lastMonthOfYear and nextMonthOfYear are all empty, return null
    if (isEmpty(currentMonthOfYear) && isEmpty(lastMonthOfYear) && isEmpty(nextMonthOfYear)) {
        return null;
    }

    // result
    var res = null;
    // get year from string
    var year =  Number(yearAndWeekNo.slice(0, 4));
    // get week no from string
    var weekNo = Number(yearAndWeekNo.slice(5));
    // current month out quantity
    var currentMonthAvrgOut = 0;
    // last month out quantity
    var lastMonthAvrgOut = 0;
    // next month out quantity
    var nextMonthAvrgOut = 0;
    // [days of fisrt month, days of second month]
//    var days = getDaysOfWeek(year, weekNo,lastSunday);
    var days = countDaysInWeek(getWeekDaysMonth(lastSunday));
//    if(yearAndWeekNo == '2024-01' || yearAndWeekNo == '2023-53' || yearAndWeekNo == '2024-02' ){
//    	outLast = 800;
//    	outNext = 800;
//    	outCurrent = 800;
//    }
    if (!isEmpty(currentMonthOfYear)) {
        // calculate Average out of currentMonthOfYear
        currentMonthAvrgOut = calcAvrgOut(year, currentMonthOfYear, outCurrent);
//        nlapiLogExecution('error','currentMonthAvrgOut',currentMonthAvrgOut)
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
  //20230407 changed by zhou start
    //res = currentMonthAvrgOut * 7;//old code
    if (days.length == 1) {
		if(Number(weekNo > 53)){
			res = nextMonthAvrgOut * 7;
		}else{
			res = currentMonthAvrgOut * 7;
		}	
        
    } 
    //end 
    // not in same month
    else {
        res = lastMonthAvrgOut * days[0] + currentMonthAvrgOut * days[1] + nextMonthAvrgOut * days[2];
    }
//    if(yearAndWeekNo == '2024-01' || yearAndWeekNo == '2023-53' || yearAndWeekNo == '2024-02' ){
//    	nlapiLogExecution('error','yearAndWeekNo',yearAndWeekNo)
//    	nlapiLogExecution('error','res',res)
//    	nlapiLogExecution('error','days',days)
//    	nlapiLogExecution('error','year, currentMonthOfYear, outCurrent',year+' || '+currentMonthOfYear+' || '+outCurrent)
//    	nlapiLogExecution('error','year, lastMonthOfYear, outLast',year+' || '+lastMonthOfYear+' || '+outLast)
//    	nlapiLogExecution('error','year, nextMonthOfYear, outNext',year+' || '+nextMonthOfYear+' || '+outNext)
//    	nlapiLogExecution('error','lastSunday',lastSunday)
//    	
//    	
//    	nlapiLogExecution('error','currentMonthOfYear',currentMonthOfYear)
//        nlapiLogExecution('error','lastMonthOfYear', lastMonthOfYear)
//        nlapiLogExecution('error','nextMonthOfYear', nextMonthOfYear)
//        
//    	nlapiLogExecution('error','currentMonthAvrgOut',currentMonthAvrgOut)
//        nlapiLogExecution('error','lastMonthAvrgOut', lastMonthAvrgOut)
//        nlapiLogExecution('error','nextMonthAvrgOut', nextMonthAvrgOut)
//    }
    return Math.round(res);//20230502 changed by zhou  
    //20230602 zhou memo :CH582　SC課FC作成　小数点以下切り捨てとする
//    return res.toFixed(2)
}


//{"2023/12/31": 12, "2024/1/1": 1, "2024/1/2": 1, "2024/1/3": 1, "2024/1/4": 1, "2024/1/5": 1, "2024/1/6": 1}
function getWeekDaysMonth(dateString) {
    var date = new Date(dateString);
    var result = [];
    for (var i = 0; i < 7; i++) {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var obj = {};
        obj['month'] = month;
        result.push(obj);
        date.setDate(date.getDate() + 1);
    }
    return result;
}
function countDaysInWeek(weekDaysMonth) {
    var daysInPrevMonth = 0;
    var daysInCurrMonth = 1;
    var daysInNextMonth = 0;
    var firstDayMonth  = weekDaysMonth[0].month;
    for (var i = 0; i < weekDaysMonth.length; i++) {
        if(!isEmpty(weekDaysMonth[i+1])){
            if(firstDayMonth == weekDaysMonth[i+1].month){
            	daysInCurrMonth++
            }else if(firstDayMonth != weekDaysMonth[i+1].month ){
            	daysInNextMonth++
            }
        }
    }
    return [daysInPrevMonth, daysInCurrMonth, daysInNextMonth];
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
//function getDaysOfWeek(year, weekNo,lastSunday) {
//    // create first date of the year
//    var firstDayOfYear = new Date(year, 0, 1).getDay();
//    var dt = new Date("Jan 01, " + year + " 01:00:00");
//    // get million seconds By WeekNo
//    var w = dt.getTime() - (3600000 * 24 * firstDayOfYear) + 604800000 * (weekNo - 1);
//    // fisrt date of week
//    //var firstDayOfWeek = new Date(w);//20230406 changed by zhou 
//    //zhou memo: CH355 週数計算補正後、既存日数の演算が不一致で、7 daysの時間が不足していることを補正点として補正
//    var firstDayOfWeek = new Date(w);//20230406 changed by zhou 
//    // last date of week (+ 6 days)
//    //var lastDayOfWeek = new Date(w + 518400000); //20230406 changed by zhou
//    var lastDayOfWeek = new Date(w  +518400000 );//20230406 changed by zhou
//    // month of the begin date in week
//    var monthOfFirstDt = firstDayOfWeek.getMonth();
//    // month of the end date in week
//    var monthOfLastDt = lastDayOfWeek.getMonth();
//
//    // if the fisrt day of week and last day of week are in same month
//    if (monthOfFirstDt == monthOfLastDt) {
//        return [7];
//    } else {
//        // when the week is the first week of year OR last week of year
//        // if the first date of week is in last year
//        if (monthOfFirstDt == 11) {
//            // if week is start of year
//            if (weekNo == 1) {
//                return [0,firstDayOfYear, 0];
//            }
//            // if week is end of year
//            else {
//                return [0, new Date(year, 11, 31).getDay() + 1, 0];
//            }
//        }
//        var daysOfFisrtMonth = new Date(year, monthOfLastDt, 0).getDay() + 1;
//        return [0, daysOfFisrtMonth, 7 - daysOfFisrtMonth];
//    }
//}

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


//20230327 add by zhou start Modification point 3
//CH355  場所別ソート
function arrSortForLocation(arr){
	var newArr = [];//新しい配列、場所の昇順
	for (var i = 0; i < arr.length; i++) {
		var afteritemInternalid = '';
	    var afteritemId = '';
	    var afteritemLocation = '';
	    var afteritemLocationId = '';
	    var afteritemDescription = '';
	    var aftermemoShipNum = '';
	    var aftershipmentUnitType = '';
	    var afterperunitquantity = '';
	    var aftersaleunit = '';
	    
	    var itemInternalid = arr[i].itemInternalid;
	    var itemId = arr[i].itemId;
	    var itemLocation = arr[i].itemLocation;
	    var itemLocationId = arr[i].itemLocationId;
	    var itemDescription = arr[i].itemDescription;
	    var memoShipNum = arr[i].memoShipNum;
	    var shipmentUnitType = arr[i].shipmentUnitType;
	    var perunitquantity = arr[i].perunitquantity;
	    var saleunit = arr[i].saleunit;
	    var itemLocationLength = 0;//このitemがどのくらい異なる場所があるかを統計する
	    var newLoArr = [];//同じitem、異なる場所からなる新しい配列で、事前に宣言する
	    newLoArr.push({
	    	//新しい配列に最初の新しいitem情報を入れる
	    	itemInternalid:itemInternalid,
        	itemId:itemId,
        	itemLocation:itemLocation,
        	itemLocationId:itemLocationId,
        	itemDescription:itemDescription,
        	memoShipNum:memoShipNum,
        	shipmentUnitType:shipmentUnitType,
        	perunitquantity:perunitquantity,
        	saleunit:saleunit

	    })
	    for(var s = i+1; s < arr.length; s++){
	    	//統合itemに基づいて古い配列を分割し、新しい配列を作成する
	        var afteritemInternalid = arr[s].itemInternalid;
		    var afteritemId = arr[s].itemId;
		    var afteritemLocation = arr[s].itemLocation;
		    var afteritemLocationId = arr[s].itemLocationId;
		    var afteritemDescription = arr[s].itemDescription;
		    var aftermemoShipNum = arr[s].memoShipNum;
		    var aftershipmentUnitType = arr[s].shipmentUnitType;
		    var afterperunitquantity = arr[s].perunitquantity;
		    var aftersaleunit = arr[s].saleunit;
	        if(itemInternalid == afteritemInternalid){
	        	itemLocationLength++;
	            newLoArr.push({
		            itemInternalid:afteritemInternalid,
	            	itemId:afteritemId,
	            	itemLocation:afteritemLocation,
	            	itemLocationId:afteritemLocationId,
	            	itemDescription:afteritemDescription,
	            	memoShipNum:aftermemoShipNum,
	            	shipmentUnitType:aftershipmentUnitType,
	            	perunitquantity:afterperunitquantity,
	            	saleunit:aftersaleunit
	            })
	        }
	    }
	    newLoArr = newLoArr.sort(function(a, b){return a.itemLocationId - b.itemLocationId});//配列の現在位置の次のitemの場所idが現在のitemの場所より大きいかどうかを判断し、並べ替える	
	    for(var n = 0;n < newLoArr.length; n++){
	    	//同じitem、場所が異なる場合は、新しい配列を並べて、最終的に生成された配列に導入します
	        var newitemInternalid = newLoArr[n].itemInternalid;
		    var newitemId = newLoArr[n].itemId;
		    var newitemLocation = newLoArr[n].itemLocation;
		    var newitemLocationId = newLoArr[n].itemLocationId;
		    var newitemDescription = newLoArr[n].itemDescription;
		    var newmemoShipNum = newLoArr[n].memoShipNum;
		    var newshipmentUnitType = newLoArr[n].shipmentUnitType;
		    var newperunitquantity = newLoArr[n].perunitquantity;	
		    var newsaleunit = newLoArr[n].saleunit;
	        newArr.push({
	        	itemInternalid:newitemInternalid,
            	itemId:newitemId,
            	itemLocation:newitemLocation,
            	itemLocationId:newitemLocationId,
            	itemDescription:newitemDescription,
            	memoShipNum:newmemoShipNum,
            	shipmentUnitType:newshipmentUnitType,
            	perunitquantity:newperunitquantity,
            	saleunit:newsaleunit
	            })
	    }
	    i += itemLocationLength;//配列を巡回した位置を設定し、ループ回数をスキップする
	}
	return newArr;
}
//end Modification point 3
function uniqueArray(arr) {
	var newArr = [];
	for (var i = 0; i < arr.length; i++) {
		if (newArr.indexOf(arr[i]) === -1) {
			newArr.push(arr[i]);
		}
	}
	return newArr;
}

//20230719 add by zhou start CH744
//9.92% => 0.1
function percentageToNumber(percentage) {
	  var newnumber = parseFloat(percentage) / 100;
	    newnumber = parseFloat(newnumber).toFixed(1);
	    return newnumber
}
//20230719 add by zhou end