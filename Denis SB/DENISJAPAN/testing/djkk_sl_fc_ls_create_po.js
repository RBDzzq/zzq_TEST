/**
 * DJ_発注書入力_LS
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/07/05     CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	nlapiLogExecution('debug','DJ_発注書入力_LS','start')
	var logform =request.getParameter('custparam_logform');
	if (request.getMethod() == 'POST') {
		try {
			var ctx = nlapiGetContext();
			var scheduleparams = new Array();
			scheduleparams['custscript_djkk_cfp_subsidiary_ls'] = request.getParameter('custpage_subsidiary');
			
			var linevendor = request.getParameter('custpage_po_vendor');
			// TODO
			var currency = request.getParameter('custpage_po_currency');
			var memo = checkStringNull(request.getParameter('custpage_po_memo'));
			var linelocation = request.getParameter('custpage_po_location');
			var creatpoDate = request.getParameter('custpage_datestart');
			
			var idList ='[';
		     var theCount = parseInt(request.getLineItemCount('sublist_item'));
		     var m01=0;
		      for (var m = 1; m < theCount + 1; m++) {
		        if(request.getLineItemValue('sublist_item', 'checkbox', m)=='T'){			        	
		        	if(m01!=0){
		        		idList+=',';
		    			}
		        	idList+='{';
		        	idList+='"fcid":"'+checkStringNull(request.getLineItemValue('sublist_item', 'fcid', m))+'"';
		        	idList+=',';
		        	idList+='"item":"'+checkStringNull(request.getLineItemValue('sublist_item', 'itemid', m))+'"';
		        	idList+=',';
		        	idList+='"description":"'+checkStringNull(request.getLineItemValue('sublist_item', 'description', m))+'"';
		        	idList+=',';
		        	idList+='"quantity":"'+checkStringNull(request.getLineItemValue('sublist_item', 'quantity', m))+'"';
		        	idList+=',';
		        	idList+='"units":"'+checkStringNull(request.getLineItemValue('sublist_item', 'units', m))+'"';
		        	idList+=',';
		        	idList+='"conversionrate":"'+checkStringNull(request.getLineItemValue('sublist_item', 'conversionrate', m))+'"';
		        	idList+=',';
		        	idList+='"cases":"'+checkStringNull(request.getLineItemValue('sublist_item', 'cases', m))+'"';
		        	idList+=',';
		        	idList+='"rate":"'+checkStringNull(request.getLineItemValue('sublist_item', 'rate', m))+'"';
		        	idList+=',';
		        	idList+='"amount":"'+checkStringNull(request.getLineItemValue('sublist_item', 'amount', m))+'"';
		        	idList+=',';
		        	idList+='"taxcode":"'+checkStringNull(request.getLineItemValue('sublist_item', 'taxcode', m))+'"';
		        	idList+=',';
		        	idList+='"grossamt":"'+checkStringNull(request.getLineItemValue('sublist_item', 'grossamt', m))+'"';
		        	idList+=',';
		        	idList+='"expectedreceiptdate":"'+checkStringNull(request.getLineItemValue('sublist_item', 'expectedreceiptdate', m))+'"';
		        	idList+=',';
		        	idList+='"memo":"'+checkStringNull(request.getLineItemValue('sublist_item', 'memo', m))+'"';
		        	idList+='}';
		        	m01++;
		        	}
		        }
		        idList+=']';
		        
		    var dataObj = '{';
		    dataObj+='"vendor":"'+linevendor+'"';
		    dataObj+=',';
		    dataObj+='"currency":"'+currency+'"';
		    dataObj+=',';
		    dataObj+='"memo":"'+memo+'"';
		    dataObj+=',';
		    dataObj+='"location":"'+linelocation+'"';
		    dataObj+=',';	   
		    dataObj+='"creatpoDate":"' + creatpoDate+'"';
		    dataObj+=',';
		    dataObj+='"itemList":' + idList;
		    dataObj+='}';  
		    
		    scheduleparams['custscript_djkk_cfp_dataarray_ls'] = dataObj;
		    		        
		    runBatch('customscript_djkk_ss_fc_ls_create_po','customdeploy_djkk_ss_fc_ls_create_po', scheduleparams);
			var parameter= new Array();
			parameter['custparam_logform'] = '1';
		    nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(), null, parameter);
			
		} catch (e) {
			var form = nlapiCreateForm('DJ_発注書入力_LS', false);
			var errorField = form.addField('custpage_runbatch_error', 'text', '', null);
			errorField.setDisplayType('inline');
			errorField.setDefaultValue('<font color="red"> DJ_発注書入力_LS入力処理を失敗しました </font>');
		    response.writePage(form);			
		}
	}else{
		if (!isEmpty(logform)) {
			logForm(request, response);
		}else{
	        createForm(request, response);
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


	var form = nlapiCreateForm('DJ_発注書入力_LS', false);
	form.setScript('customscript_djkk_cs_fc_ls_create_po');
	// 実行情報
	form.addFieldGroup('custpage_run_info', '実行情報');
	form.addButton('custpage_refresh', '更新', 'refresh();');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_fc_ls_create_po');

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

/**
* @param {nlobjRequest} request Request object
* @param {nlobjResponse} response Response object
* @returns {Void} Any output is written via response object
*/
function createForm(request, response){
	var expectedreceiptdate='';
    var form = nlapiCreateForm('DJ_発注書入力_LS', false);
	
	form.setScript('customscript_djkk_cs_fc_ls_create_po');
	//パラメータを取得する
	var comment = request.getParameter('comment');
		
	form.addFieldGroup('custpage_group_filter', '検索項目');
	
	var subsidiaryField=form.addField('custpage_subsidiary', 'select', '連結', null,'custpage_group_filter');
	
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
	var dateField = form.addField('custpage_dateweek', 'select', '入荷予定週', 'null','custpage_group_filter');
	dateField.setMandatory(true);
	dateField.addSelectOption('0', '');
	dateField.setDefaultValue('0');
	var dateweekPr=request.getParameter('dateweek');
	var dateStart=form.addField('custpage_datestart', 'date', '入荷予定週開始日', 'null','custpage_group_filter');
	dateStart.setDisplayType('inline');
	var dateEnd= form.addField('custpage_dateend', 'date', '入荷予定週終了日', 'null','custpage_group_filter');	
	dateEnd.setDisplayType('inline');				
	var locationField=form.addField('custpage_location', 'select', '場所エリア', 'null','custpage_group_filter');
	locationField.setMandatory(true);
	locationField.addSelectOption('0', '');
	locationField.setDefaultValue('0');
	var vendorField=form.addField('custpage_vendor', 'select', '仕入先', 'null','custpage_group_filter');
	var brandField=form.addField('custpage_brand', 'select', 'ブランド', null,'custpage_group_filter');
	brandField.addSelectOption('0', '-すべて-');
	brandField.setDefaultValue('0');
	var itemField=form.addField('custpage_item', 'multiselect', '商品', 'null','custpage_group_filter');
	itemField.addSelectOption('0', '-すべて-');
	itemField.setDefaultValue('0');
	itemField.setDisplaySize(750,80);
	var allItemField=form.addField('custpage_itemall', 'multiselect', '選択したすべての製品', 'null','custpage_group_filter');
	allItemField.setDisplayType('hidden');
	var subsidiaryPar=userSubsidiary;
	var sbSelect=request.getParameter('subsidiary');
	if(!isEmpty(sbSelect)){
		subsidiaryPar=sbSelect;
	}
	
	var dateFieldSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast_ls",null,
			[
			 ["custrecord_djkk_sc_fc_ls_add","isnotempty",""],
			 "AND", 
			 ["custrecord_djkk_po_ls_created","is","F"], 
			   "AND", 
			   ["custrecord_djkk_sc_fc_ls_subsidiary","anyof",subsidiaryPar]
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_yearmonthweek",null,"GROUP"), 
			   new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_startdate",null,"GROUP").setSort(false), 
			   new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_enddate",null,"GROUP")
			]
			);
	if (!isEmpty(dateFieldSearch)) {
		for (var d = 0; d < dateFieldSearch.length; d++) {
			var columnID = dateFieldSearch[d].getAllColumns();
			dateField.addSelectOption(dateFieldSearch[d].getValue(columnID[0]), dateFieldSearch[d].getValue(columnID[0]));
			if(dateweekPr==dateFieldSearch[d].getValue(columnID[0])){
				expectedreceiptdate=dateFieldSearch[d].getValue(columnID[1]);
				dateStart.setDefaultValue(dateFieldSearch[d].getValue(columnID[1]));
				dateEnd.setDefaultValue(dateFieldSearch[d].getValue(columnID[2]));
			}
			
		}
	}
	dateField.setDefaultValue(dateweekPr);
	
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
   	  var locationPar = request.getParameter('location');
 	  var itemPar = request.getParameter('item');
	  var vendorPar = request.getParameter('vendor');
	  var brandPar = request.getParameter('brand');
	  var startDate = request.getParameter('startDate');
	  var endDate = request.getParameter('endDate');
	  if(!isEmpty(locationPar)&&locationPar!=0){
		   locationField.setDefaultValue(locationPar);
       } 
	  var itemList=new Array();
	  var fcSearchFilters=[["custrecord_djkk_sc_fc_ls_subsidiary","anyof",subsidiaryPar]];
	  if(!isEmpty(locationPar)){
		  fcSearchFilters.push("AND");
		  fcSearchFilters.push(["custrecord_djkk_sc_fc_ls_location_area","anyof",locationPar]);
	  }
	  if(!isEmpty(dateweekPr)){
		  fcSearchFilters.push("AND");
		  fcSearchFilters.push(["custrecord_djkk_sc_fc_ls_yearmonthweek","is",dateweekPr]);
	  }
	  fcSearchFilters.push("AND");
	  fcSearchFilters.push(["custrecord_djkk_po_ls_created","is","F"]);
	  fcSearchFilters.push("AND");
	  fcSearchFilters.push(["custrecord_djkk_sc_fc_ls_add","isnotempty",""]);
	  
	  var forecastItemSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast_ls",null, fcSearchFilters, 
			  [
			     new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_item",null,"GROUP")
			  ]
			  );
	    if (!isEmpty(forecastItemSearch)) {
			for (var itf = 0; itf < forecastItemSearch.length; itf++) {
				var column = forecastItemSearch[itf].getAllColumns();
				itemList.push(forecastItemSearch[itf].getValue(column[0]));
			}
		}
	  
	//  if((!isEmpty(vendorPar)&&vendorPar!=0)||(!isEmpty(brandPar)&&brandPar!=0)){
  		var itemSearchFilters=[];
  		if(!isEmpty(itemList)&&!isEmpty(dateweekPr)){
  			itemSearchFilters.push(["internalid","anyof",itemList]);
  		}else{
  			itemSearchFilters.push(["internalid","anyof","@NONE@"]);		
  		}
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
				     new nlobjSearchColumn("internalid").setSort(false), 
				     new nlobjSearchColumn("itemid"),
				     new nlobjSearchColumn("displayname"), 
				     new nlobjSearchColumn("vendorname")
				  ]
				  );
  	    var allItemArray=new Array();
			 if (!isEmpty(itemSearch)) {
				for (var its = 0; its < itemSearch.length; its++) {
					var itemViewName='商品コード:　　'+itemSearch[its].getValue("itemid")+'　　　　商品名:　'+itemSearch[its].getValue("displayname")+'　　　　仕入先商品コード:　'+itemSearch[its].getValue("vendorname");
					itemField.addSelectOption(itemSearch[its].getValue("internalid"),itemViewName);
					allItemField.addSelectOption(itemSearch[its].getValue("internalid"), itemViewName);
					allItemArray.push(itemSearch[its].getValue("internalid"));
				}
			}    	       	      	      	    
  	  //}
	   if(!isEmpty(itemPar)&&itemPar!=0){
	    	itemField.setDefaultValue(itemPar);
         }
	   
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
	}
	  var searchType=request.getParameter('search');
	  
  if(searchType=='T'){
	if( !isEmpty(allItemArray)){
		  // 納税スケジュール /税金コード
		  var taxscheduleArray = new Array();
		var taxscheduleSearch = nlapiSearchRecord("taxschedule", null, [],
				[ new nlobjSearchColumn("internalid") ]);
		if (!isEmpty(taxscheduleSearch)) {
			for (var ts = 0; ts < taxscheduleSearch.length; ts++) {
				var taxscheduleId = taxscheduleSearch[ts].getValue('internalid');
				var taxcode = nlapiLoadRecord('taxschedule', taxscheduleId).getLineItemValue('nexuses', 'purchasetaxcode', 1);
				taxscheduleArray[taxscheduleId] = taxcode;
			}
		}
		
        // 税金コード/率
		var rateArray = new Array();
		var salestaxitemSearch = nlapiSearchRecord("salestaxitem", null, [], [
				new nlobjSearchColumn("internalid"),
				new nlobjSearchColumn("rate") ]);
		if (!isEmpty(salestaxitemSearch)) {
			for (var st = 0; st < salestaxitemSearch.length; st++) {
				var internalid = salestaxitemSearch[st].getValue('internalid');
				var rate = salestaxitemSearch[st].getValue('rate').split('%')[0] / 100 + 1;
				rateArray[internalid] = rate;
			}
		}
		
		    dateField.setDisplayType('inline');
			locationField.setDisplayType('inline');
			vendorField.setDisplayType('inline');
			brandField.setDisplayType('inline');
			itemField.setDisplayType('inline');
			subsidiaryField.setDisplayType('inline');
			
			form.addFieldGroup('custpage_group_po', '発注書情報');
			var poLocation = form.addField('custpage_po_location', 'select','場所', null, 'custpage_group_po');
			poLocation.setMandatory(true);
			poLocation.setDisplayType('entry');
			poLocation.addSelectOption('0', '');
			poLocation.setDefaultValue('0');
			var poLocationSearch = nlapiSearchRecord("location", null, [
					[ "custrecord_djkk_location_area", "anyof", locationPar ],
					"AND", [ "subsidiary", "anyof", subsidiaryPar ] ], [
					new nlobjSearchColumn("internalid"),
					new nlobjSearchColumn("name").setSort(false) ]);
			if (!isEmpty(poLocationSearch)) {
				for (var llc = 0; llc < poLocationSearch.length; llc++) {
					poLocation.addSelectOption(poLocationSearch[llc]
							.getValue('internalid'), poLocationSearch[llc]
							.getValue('name'));
				}
			}
			
			var poVendor = form.addField('custpage_po_vendor', 'select', '仕入先',
					null, 'custpage_group_po');
			poVendor.setDisplayType('entry');
			poVendor.addSelectOption('0', '');
			poVendor.setMandatory(true);
			if (!isEmpty(vendorPar) && vendorPar != '0') {
				poVendor.setDefaultValue(vendorPar);
			} else {
				poVendor.setDefaultValue('0');
			}
			if (!isEmpty(vendorSearch)) {
				for (var vf = 0; vf < vendorSearch.length; vf++) {
					poVendor.addSelectOption(vendorSearch[vf]
							.getValue('internalid'), vendorSearch[vf]
							.getValue('companyname'));
				}
			}

			var poCurrency=form.addField('custpage_po_currency', 'select', '通貨',
					'currency', 'custpage_group_po');
			poCurrency.setDisplayType('entry');
			poCurrency.setMandatory(true);
			var currencyIdpar=request.getParameter('currencyId');
			if(!isEmpty(currencyIdpar)){
			poCurrency.setDefaultValue(currencyIdpar);
           	}					
			var poMemo = form.addField('custpage_po_memo', 'textarea', '備考',
					null, 'custpage_group_po');
			poMemo.setDisplayType('entry');
			
			var subList = form.addSubList('sublist_item', 'list', 'アイテム');
			subList.addMarkAllButtons();
			subList.addField('checkbox', 'checkbox','').setDisplayType('normal');
			subList.addField('item', 'text', 'アイテム').setDisplayType('disabled');
			subList.addField('itemid', 'text', 'アイテムid').setDisplayType('hidden');
			subList.addField('fcid', 'text', 'fcid').setDisplayType('hidden');
			
			var lineQuantity=subList.addField('quantity', 'integer', '注文数').setDisplayType('entry');
			var unitstypetext=subList.addField('unitstypetext', 'text', 'アイテム主要単位の種類');
			unitstypetext.setDisplayType('entry');//hidden
			var lineUnits=subList.addField('units', 'select', '種類-単位','').setDisplayType('entry');
			lineUnits.addSelectOption('', '', true);
			var lineConversionrate=subList.addField('conversionrate', 'text', '入り目');
			lineConversionrate.setDisplayType('entry');//hidden
			var lineCases=subList.addField('cases', 'text', 'ケース数');
			lineCases.setDisplayType('entry');//hidden
			
			var lineRate=subList.addField('rate', 'text', '単価');
			lineRate.setDisplayType('entry');
			var lineAmount=subList.addField('amount', 'text', '金額');
			lineAmount.setDisplayType('entry');	
			var lineTaxcode=subList.addField('taxcode', 'select', '税金コード','salestaxitem');
			lineTaxcode.setDisplayType('entry');
			var lineGrossamt=subList.addField('grossamt', 'text', '総額');
			lineGrossamt.setDisplayType('entry');
			var lineExpectedreceiptdate=subList.addField('expectedreceiptdate', 'date', '受領予定日');
			lineExpectedreceiptdate.setDisplayType('entry');
			lineExpectedreceiptdate.setDefaultValue(expectedreceiptdate);
			var lineMemo=subList.addField('memo', 'textarea', '説明')
			lineMemo.setDisplayType('entry');
			/****************************************/
			var DisplayType='disabled';

			lineAmount.setDisplayType(DisplayType);
			lineGrossamt.setDisplayType(DisplayType);
			lineCases.setDisplayType(DisplayType);
			lineConversionrate.setDisplayType(DisplayType);
			unitstypetext.setDisplayType(DisplayType);
			/****************************************/
			var pocreatSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast_ls",null,
					[
					   ["custrecord_djkk_sc_fc_ls_yearmonthweek","is",dateweekPr], 
					   "AND", 
					   ["custrecord_djkk_sc_fc_ls_location_area","anyof",locationPar],
					   "AND", 
					   ["custrecord_djkk_sc_fc_ls_item","anyof",allItemArray],
					   "AND", 
					   ["custrecord_djkk_sc_fc_ls_subsidiary","anyof",subsidiaryPar], 
					   "AND", 
					   ["custrecord_djkk_sc_fc_ls_add","isnotempty",""],
					   "AND", 
					   ["custrecord_djkk_po_ls_created","is","F"]
					], 
					[
					   new nlobjSearchColumn("internalid"),
					   new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_item"), 
					   new nlobjSearchColumn("purchasedescription","custrecord_djkk_sc_fc_ls_item",null), 
					   new nlobjSearchColumn("custrecord_djkk_sc_fc_ls_add"), 
					   new nlobjSearchColumn("cost","custrecord_djkk_sc_fc_ls_item",null),
					   new nlobjSearchColumn("unitstype","custrecord_djkk_sc_fc_ls_item",null), 
					   new nlobjSearchColumn("purchaseunit","custrecord_djkk_sc_fc_ls_item",null), 
					   new nlobjSearchColumn("taxschedule","custrecord_djkk_sc_fc_ls_item",null)
					]
					);
			//20221028 change by zhou U379 start
			var vendorSearch = nlapiSearchRecord("vendor",null,
					[
					 	["internalid","is",vendorPar]
					 ],
					[
					 	new nlobjSearchColumn("custentity_djkk_buy_price_code"),
					 ]
					);
			if (!isEmpty(vendorSearch)) {
				var priceCode = vendorSearch[0].getValue('custentity_djkk_buy_price_code');
				var loadingPriceCode = nlapiLoadRecord("customrecord_djkk_buy_price_list",priceCode);
				var PriceCodeCount = loadingPriceCode.getLineItemCount("recmachcustrecord_djkk_buy_price");
				var priceArr = [];
				//購入価格表ls
				for(var ct = 1 ; ct < PriceCodeCount+1; ct++){
					var priceItem = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_detailed_itemcode',ct);
					var priceCodeDefaultRate = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_detailed_price',ct);//DJ_基本購買価格
					var priceCodeQuantityRate =  loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_price_quantity',ct);//DJ_数量ベース価格
					var priceCodeStartDate = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_start_date',ct);
					var priceCodeEndDate = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_end_date',ct);
					var defaultEndDate  = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_end_date_price_detailed',ct);
					var priceCodeQuantity = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_detailed_quantity',ct);
					if(isEmpty(priceCodeEndDate)){
						priceCodeEndDate = defaultEndDate;
					}
					priceArr.push({
						priceItem:priceItem,
						priceCodeRate:priceCodeDefaultRate,
						priceCodeStartDate:priceCodeStartDate,
						priceCodeEndDate:priceCodeEndDate,
						priceCodeQuantity:priceCodeQuantity,
						priceCodeQuantityRate:priceCodeQuantityRate
					})
				}
				if(!isEmpty(priceArr)){
					var map = {};
					var dest = [];
					for(var mj = 0; mj < priceArr.length; mj++){
					    var ai = priceArr[mj];
					    if(!map[ai.priceItem]){
					        dest.push({
					        	priceItem: ai.priceItem,
					            data: [ai]
					        });
					        map[ai.priceItem] = ai;
					    }else{
					        for(var j = 0; j < dest.length; j++){
					            var dj = dest[j];
					            if(dj.priceItem == ai.priceItem){
					                dj.data.push(ai);
					                break;
					            }
					        }
					    }
					}
					nlapiLogExecution('debug','dest',JSON.stringify(dest))
				}
				
//				priceArr =  priceArr.sort(compare("priceCodeQuantity",false));
//				nlapiLogExecution('debug','arr',JSON.stringify(priceArr)+priceArr.length)
			}
			var itemLine = 1;
			if (!isEmpty(pocreatSearch)) {
				for (var n = 0; n < pocreatSearch.length; n++) {
					subList.setLineItemValue('item', itemLine, pocreatSearch[n].getText('custrecord_djkk_sc_fc_ls_item'));
					subList.setLineItemValue('fcid', itemLine, pocreatSearch[n].getValue('internalid'));
					subList.setLineItemValue('itemid', itemLine, pocreatSearch[n].getValue('custrecord_djkk_sc_fc_ls_item'));					
					subList.setLineItemValue('description', itemLine, pocreatSearch[n].getValue('purchasedescription','custrecord_djkk_sc_fc_ls_item'));

					var itemId = pocreatSearch[n].getValue('custrecord_djkk_sc_fc_ls_item');//明細商品-code
					var linequantity=pocreatSearch[n].getValue('custrecord_djkk_sc_fc_ls_add');//明細商品-数量&左区間数量
					var compareArr = [];
//					var startDate = nlapiGetLineItemValue('sublist_item','expectedreceiptdate',itemLine);//明細商品-受領予定日
					nlapiLogExecution('debug','startDate',itemId+'&'+linequantity+'&'+startDate);
					if(!isEmpty(priceArr)){
						subList.setLineItemValue('quantity', itemLine,linequantity);
						for(var de = 0 ; de < dest.length;de++){
							if(itemId == dest[de].priceItem){
								compareArr = dest[de].data;
								break;
							}
						}
						priceArr =  compareArr.sort(compare("priceCodeQuantity",false));
						for(var k=0 ; k< priceArr.length ; k++){
								if(compareStrDate(priceArr[k].priceCodeStartDate,startDate)&& compareStrDate(startDate,priceArr[k].priceCodeEndDate)){
									if(k+1 != priceArr.length){
										if(Number(linequantity) >= Number(priceArr[k].priceCodeQuantity) && Number(linequantity) < Number(priceArr[k+1].priceCodeQuantity)){
											subList.setLineItemValue('rate',itemLine, Number(priceArr[k].priceCodeQuantityRate).toFixed(2));
											break;
										}else if(Number(linequantity) < Number(priceArr[k].priceCodeQuantity)){
											subList.setLineItemValue('rate',itemLine, Number(priceArr[k].priceCodeDefaultRate).toFixed(2));
											break;
										}else{
											continue;
										}
									}else if(k+1 == priceArr.length && Number(linequantity) >= Number(priceArr[k].priceCodeQuantity)){
										subList.setLineItemValue('rate',itemLine, Number(priceArr[k].priceCodeQuantityRate).toFixed(2));
									}else if(k+1 == priceArr.length && Number(linequantity) < Number(priceArr[k].priceCodeQuantity)){
										subList.setLineItemValue('rate',itemLine, Number(priceArr[k].priceCodeDefaultRate).toFixed(2));
									}else{
										var inventoryitemSearch = nlapiSearchRecord("item",null,
												[  
												   ["internalid","anyof",itemId]
												], 
												[
												   new nlobjSearchColumn("baseprice")
												]
												);
										if(!isEmpty(inventoryitemSearch)){
											var rate = inventoryitemSearch[0].getValue("baseprice");
											subList.setLineItemValue('rate',itemLine, Number(rate).toFixed(2));
										}
									}
								}
						}
//					}else{
//						var inventoryitemSearch = nlapiSearchRecord("item",null,
//								[  
//								   ["internalid","anyof",itemId]
//								], 
//								[
//								   new nlobjSearchColumn("baseprice")
//								]
//								);
//						if(!isEmpty(inventoryitemSearch)){
//							var rate = inventoryitemSearch[0].getValue("baseprice");
//							subList.setLineItemValue('rate',itemLine, Number(rate).toFixed(2));
//						}
					}else{
						subList.setLineItemValue('quantity', itemLine,linequantity);
						subList.setLineItemValue('rate', itemLine, 0);
					}
//					var linequantity=pocreatSearch[n].getValue('custrecord_djkk_sc_fc_ls_add');
//					subList.setLineItemValue('quantity', itemLine,linequantity);
//					subList.setLineItemValue('rate', itemLine, Number(pocreatSearch[n].getValue('cost','custrecord_djkk_sc_fc_ls_item')).toFixed(2));
					//end
					var lineAmount=Number(pocreatSearch[n].getValue('cost','custrecord_djkk_sc_fc_ls_item'))*Number(pocreatSearch[n].getValue('custrecord_djkk_sc_fc_ls_add'));
					subList.setLineItemValue('amount', itemLine, lineAmount.toFixed(2));
					var lineTaxschedule=pocreatSearch[n].getValue('taxschedule','custrecord_djkk_sc_fc_ls_item');
					var lineTaxcode=taxscheduleArray[lineTaxschedule];
					subList.setLineItemValue('taxcode', itemLine, lineTaxcode);
					var lineRate=rateArray[lineTaxcode];
					var lineGrossamt=lineAmount*lineRate;
					subList.setLineItemValue('grossamt', itemLine, lineGrossamt.toFixed(2));
					
					var unitstypeId=pocreatSearch[n].getValue('unitstype','custrecord_djkk_sc_fc_ls_item');
					var unitstypeText=pocreatSearch[n].getText('unitstype','custrecord_djkk_sc_fc_ls_item');
					subList.setLineItemValue('unitstypetext', itemLine, unitstypeText);
					var itemUnit=pocreatSearch[n].getValue('purchaseunit','custrecord_djkk_sc_fc_ls_item');
					if (!isEmpty(unitstypeId)) {
					var unitstype = nlapiLoadRecord('unitstype', unitstypeId);
					var unitstypeCount = unitstype.getLineItemCount('uom');
					for (var uni = 1; uni < unitstypeCount + 1; uni++) {
						var unValue = unitstype.getLineItemValue('uom','internalid', uni);
						var unvalueText = unitstype.getLineItemValue('uom','unitname', uni);
						var unconversionrate=unitstype.getLineItemValue('uom','conversionrate', uni);
						lineUnits.addSelectOption(unitstypeId + '|' + unValue,unitstypeText+ ' - ' +unvalueText);
						if(unValue==itemUnit){
							subList.setLineItemValue('units', itemLine,unitstypeId+'|'+unValue);
							subList.setLineItemValue('conversionrate', itemLine, unconversionrate);
							if(!isEmpty(unconversionrate)&&unconversionrate!='0'){
							subList.setLineItemValue('cases', itemLine, Math.ceil(linequantity/unconversionrate));
							}
						}
					}
				 }
					itemLine++;
			}
		}
			
			
			form.addSubmitButton('発注提案作成');
			form.addButton('custpage_cacktosearch', '検索に戻る', 'backToSearch();');
	  }else{
		  form.addFieldGroup('custpage_run_info', '検索情報');
		  var seachnull = form.addField('custpage_seachnull', 'text',
					'', null, 'custpage_run_info');
			seachnull.setDisplayType('inline');
			var messageColour = '<font color="red"> 関連データはありません </font>';
			seachnull.setDefaultValue(messageColour);
		  form.addButton('custpage_creatforecastreport', '検索', 'searchPoToCreat();');
	  }
			}else{
			form.addButton('custpage_creatforecastreport', '検索', 'searchPoToCreat();');
			}
	  
	response.writePage(form);
}