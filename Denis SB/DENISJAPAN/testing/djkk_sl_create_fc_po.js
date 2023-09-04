/**
 * DJ_発注書入力_食品
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
	var logform =request.getParameter('custparam_logform');
	if (request.getMethod() == 'POST') {
		try {
			var ctx = nlapiGetContext();
			var scheduleparams = new Array();
			scheduleparams['custscript_djkk_cfp_subsidiary'] = request.getParameter('custpage_subsidiary');
			
			var linevendor = request.getParameter('custpage_po_vendor');
			// TODO
			var currency = request.getParameter('custpage_po_currency');
			var memo = request.getParameter('custpage_po_memo');
			if(!isEmpty(memo)&&memo!='undefined'){
				memo = String(memo);
				memo = memo.replace(/\s+/g,'');//(new RegExp(" ","g"),"/");
			}
			var linelocation = request.getParameter('custpage_po_location');

			var creatpoDate = formatDate(getSystemTime());						//request.getParameter('custpage_datestart');
			
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
		        	idList+='"conversionrate":"'+checkStringNull(request.getLineItemValue('sublist_item', 'conversionrate', m))+'"';//入り目
		        	idList+=',';
		        	idList+='"conversion":"'+checkStringNull(request.getLineItemValue('sublist_item', 'conversion', m))+'"';
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
		        	idList+='"itemunitconversion":"'+checkStringNull(request.getLineItemValue('sublist_item', 'itemunitconversion', m))+'"';//ch549
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
		    dataObj+='"userRole":"' + nlapiGetRole()+'"';//20230629 add by zhou CH678
		    dataObj+=',';//20230629 add by zhou CH678
		    dataObj+='"itemList":' + idList;
		    dataObj+='}';  
		    
		    scheduleparams['custscript_djkk_cfp_dataarray'] = dataObj;
		    		        
		    runBatch('customscript_djkk_ss_create_fc_po','customdeploy_djkk_ss_create_fc_po', scheduleparams);
			var parameter= new Array();
			parameter['custparam_logform'] = '1';
		    nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(), null, parameter);
			
		} catch (e) {
			var form = nlapiCreateForm('DJ_発注書入力_食品', false);
			var errorField = form.addField('custpage_runbatch_error', 'text', '', null);
			errorField.setDisplayType('inline');
			errorField.setDefaultValue('<font color="red"> DJ_発注書_食品入力処理を失敗しました </font>');
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


	var form = nlapiCreateForm('DJ_発注書入力_食品', false);
	form.setScript('customscript_djkk_cs_create_fc_po');
	// 実行情報
	form.addFieldGroup('custpage_run_info', '実行情報');
	form.addButton('custpage_refresh', '更新', 'refresh();');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_create_fc_po');

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
    var form = nlapiCreateForm('DJ_発注書入力_食品', false);
	
	form.setScript('customscript_djkk_cs_create_fc_po');
	//パラメータを取得する
	var comment = request.getParameter('comment');
		
	form.addFieldGroup('custpage_group_filter', '検索項目');
	
	var subsidiaryField=form.addField('custpage_subsidiary', 'select', '連結', null,'custpage_group_filter');
	
	var ssArray=new Array();
	var subsidiarySearch = nlapiSearchRecord("subsidiary",null,
			[
			   //["custrecord_djkk_subsidiary_type","anyof","1"]
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
	vendorField.setMandatory(true);
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
	
	var dateFieldSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast",null,
			[
			 ["custrecord_djkk_sc_fc_add","isnotempty",""],
			 "AND", 
			 ["custrecord_djkk_po_created","is","F"], 
			   "AND", 
			   ["custrecord_djkk_sc_fc_subsidiary","anyof",subsidiaryPar]
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_sc_fc_yearmonthweek",null,"GROUP"), 
			   new nlobjSearchColumn("custrecord_djkk_sc_fc_startdate",null,"GROUP").setSort(false), 
			   new nlobjSearchColumn("custrecord_djkk_sc_fc_enddate",null,"GROUP")
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
	
		var locationSearch = nlapiSearchRecord("customrecord_djkk_location_area",null,
				[
			//["custrecord_djkk_location_subsidiary.custrecord_djkk_subsidiary_type","anyof","1"]
             ["custrecord_djkk_location_subsidiary.internalid","anyof",getRoleSubsidiary()]
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
	
	  if(!isEmpty(subsidiaryPar)&&subsidiaryPar!=0){

		  
		  
		  
   	  var locationPar = request.getParameter('location');
 	  var itemPar = request.getParameter('item');
	  var vendorPar = request.getParameter('vendor');
	  var brandPar = request.getParameter('brand');
//	  nlapiLogExecution('debug','locationPar',locationPar)
//	  nlapiLogExecution('debug','dateweekPr',dateweekPr)
	  if(!isEmpty(locationPar)&&locationPar!=0){
		   locationField.setDefaultValue(locationPar);
       } 
	  var itemList=new Array();
	  var fcSearchFilters=[["custrecord_djkk_sc_fc_subsidiary","anyof",subsidiaryPar]];
	  if(!isEmpty(locationPar) && locationPar != '0'){
		  fcSearchFilters.push("AND");
		  fcSearchFilters.push(["custrecord_djkk_sc_fc_location_area","anyof",locationPar]);
	  }
	  if(!isEmpty(dateweekPr)&& dateweekPr != '0'){
		  fcSearchFilters.push("AND");
		  fcSearchFilters.push(["custrecord_djkk_sc_fc_yearmonthweek","is",dateweekPr]);
	  }
	  fcSearchFilters.push("AND");
	  fcSearchFilters.push(["custrecord_djkk_po_created","is","F"]);
	  fcSearchFilters.push("AND");
	  fcSearchFilters.push(["custrecord_djkk_sc_fc_add","isnotempty",""]);
	   //20230607 add by zhou start CH642
	   //発注書入力画面で予定数量0の商品は出力しないはずです。
	  fcSearchFilters.push("AND");
	  fcSearchFilters.push(["custrecord_djkk_sc_fc_add","notequalto","0"]);
	   //20230607 add by zhou end
	  
	  var forecastItemSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast",null, fcSearchFilters, 
			  [
			     new nlobjSearchColumn("custrecord_djkk_sc_fc_item",null,"GROUP")
			  ]
			  );
	    if (!isEmpty(forecastItemSearch)) {
			for (var itf = 0; itf < forecastItemSearch.length; itf++) {
				var column = forecastItemSearch[itf].getAllColumns();
				itemList.push(forecastItemSearch[itf].getValue(column[0]));
			}
		}
	    
	    nlapiLogExecution('debug','itemList',itemList)	    
	    
	   	   subsidiaryField.setDefaultValue(subsidiaryPar);
	   	    vendorField.addSelectOption('0', '');
	   	 var  itemVendorSearch = null;
	   	 if(!isEmpty(itemList)){
		   	 var itemVendorSearch = nlapiSearchRecord("item",null,
		   			[
		   			   ["internalid","anyof",itemList]
		   			], 
		   			[
//		   			   new nlobjSearchColumn("vendorcode")
						new nlobjSearchColumn("internalid","vendor",null)
		   			]
		   			);
	   	 }
		  var itemVendorList=new Array();
		    if (!isEmpty(itemVendorSearch)) {
				for (var ivf = 0; ivf < itemVendorSearch.length; ivf++) {
					var column = itemVendorSearch[ivf].getAllColumns();
					itemVendorList.push(itemVendorSearch[ivf].getValue(column[0]));
				}
			}
		    nlapiLogExecution('debug','itemVendorList',itemVendorList)	   
 		   
 		   	var vendorSearchFilters=[];
 		  	vendorSearchFilters.push(["subsidiary","anyof",subsidiaryPar])
   	    	if(!isEmpty(itemVendorList)){
   	    		vendorSearchFilters.push("AND");
   	    		vendorSearchFilters.push(["internalid","anyof",itemVendorList]);
             }
	   	    
	   	    var vendorSearch = nlapiSearchRecord("vendor",null,vendorSearchFilters, 
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
				     new nlobjSearchColumn("custitem_djkk_product_code"),
				     new nlobjSearchColumn("displayname")
				  ]
				  );
  	    var allItemArray=new Array();
			 if (!isEmpty(itemSearch)) {
				for (var its = 0; its < itemSearch.length; its++) {
					var itemViewName='('+itemSearch[its].getValue("custitem_djkk_product_code")+')　'+itemSearch[its].getValue("displayname");
					itemField.addSelectOption(itemSearch[its].getValue("internalid"), itemViewName);
					allItemField.addSelectOption(itemSearch[its].getValue("internalid"),itemViewName);
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
//		  var taxscheduleArray = new Array();
//		var taxscheduleSearch = nlapiSearchRecord("taxschedule", null, [],
//				[ new nlobjSearchColumn("internalid") ]);
//		if (!isEmpty(taxscheduleSearch)) {
//			for (var ts = 0; ts < taxscheduleSearch.length; ts++) {
//				var taxscheduleId = taxscheduleSearch[ts].getValue('internalid');
//				var taxcode = nlapiLoadRecord('taxschedule', taxscheduleId).getLineItemValue('nexuses', 'purchasetaxcode', 1);
//				taxscheduleArray[taxscheduleId] = taxcode;
//			}
//		}
		
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
			//changed by geng add start CH042
			subList.addField('item_name', 'text', '商品名').setDisplayType('disabled');
			subList.addField('item_product_code', 'text', 'カタログコード').setDisplayType('disabled');
			//changed by geng add end CH042
			var lineQuantity=subList.addField('quantity', 'float', '注文数').setDisplayType('entry');
			var lineSCQuantity=subList.addField('sc_quantity', 'text', 'SC入庫数').setDisplayType('inline');//20230306 add by zhou : SC quantity
			subList.addField('lineunitsid', 'text', '主要購入単位ID').setDisplayType('hidden');
			subList.addField('stockunitid', 'text', '主要在庫単位ID').setDisplayType('hidden');
			subList.addField('unitstypeid', 'text', '主要単位の種類ID').setDisplayType('hidden');
			var itemUnitConversion = subList.addField('itemunitconversion', 'text', 'アイテム単位換算率');//CH549
			itemUnitConversion.setDisplayType('hidden');
			var unitstypetext=subList.addField('unitstypetext', 'text', 'アイテム主要単位の種類');
			unitstypetext.setDisplayType('entry');//hidden
			var lineUnits=subList.addField('units', 'select', '種類-単位','').setDisplayType('entry');
			lineUnits.addSelectOption('', '', true);
			var lineConversionrate=subList.addField('conversionrate', 'text', '入り目');//入り目
			lineConversionrate.setDisplayType('entry');//hidden
			var lineConversion=subList.addField('conversion', 'text', 'conversion');//conversion
			lineConversion.setDisplayType('hidden');//hidden
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
			var pocreatSearch = nlapiSearchRecord("customrecord_djkk_sc_forecast",null,
					[
					   ["custrecord_djkk_sc_fc_yearmonthweek","is",dateweekPr], 
					   "AND", 
					   ["custrecord_djkk_sc_fc_location_area","anyof",locationPar],
					   "AND", 
					   ["custrecord_djkk_sc_fc_item","anyof",allItemArray],
					   "AND", 
					   ["custrecord_djkk_sc_fc_subsidiary","anyof",subsidiaryPar], 
					   "AND", 
					   ["custrecord_djkk_sc_fc_add","isnotempty",""],
					   "AND", 
					   ["custrecord_djkk_po_created","is","F"],
					   //20230607 add by zhou start CH642
					   //発注書入力画面で予定数量0の商品は出力しないはずです。
					   "AND", 
					   ["custrecord_djkk_sc_fc_add","notequalto","0"]
					   //20230607 add by zhou end
					], 
					[
					   new nlobjSearchColumn("internalid"),
					   new nlobjSearchColumn("custrecord_djkk_sc_fc_item"), 
					   new nlobjSearchColumn("purchasedescription","CUSTRECORD_DJKK_SC_FC_ITEM",null), 
					   new nlobjSearchColumn("custrecord_djkk_sc_fc_add"), 
					   new nlobjSearchColumn("vendorcost","CUSTRECORD_DJKK_SC_FC_ITEM",null),
					   new nlobjSearchColumn("unitstype","CUSTRECORD_DJKK_SC_FC_ITEM",null), 
					   new nlobjSearchColumn("purchaseunit","CUSTRECORD_DJKK_SC_FC_ITEM",null), 
					   new nlobjSearchColumn("taxschedule","CUSTRECORD_DJKK_SC_FC_ITEM",null),
					   new nlobjSearchColumn("othervendor","CUSTRECORD_DJKK_SC_FC_ITEM",null),
					   new nlobjSearchColumn("custitem_djkk_perunitquantity","CUSTRECORD_DJKK_SC_FC_ITEM",null),//ITEM.DJ_入り数(入り目) 
					   new nlobjSearchColumn("stockunit","CUSTRECORD_DJKK_SC_FC_ITEM",null)
					]
					);
			var itemLine = 1;
			if (!isEmpty(pocreatSearch)) {
				//20221021 changed by zhou start
//				/U425  CH043  DJ_発注書入力_食品（Forecastからの発注）修正
				for (var n = 0; n < pocreatSearch.length; n++) {
					var vendorParSearchAfter = request.getParameter('vendor');
					var othervendor  = pocreatSearch[n].getValue("othervendor","CUSTRECORD_DJKK_SC_FC_ITEM",null);
					if(othervendor == vendorParSearchAfter){
					subList.setLineItemValue('item', itemLine, pocreatSearch[n].getText('custrecord_djkk_sc_fc_item'));
					//changed by geng add start CH042
					var itemArrVal=nlapiLookupField('item',pocreatSearch[n].getValue('custrecord_djkk_sc_fc_item'),['displayname','custitem_djkk_product_code','custitem_djkk_product_name_jpline1']);
					subList.setLineItemValue('item_name', itemLine,itemArrVal.custitem_djkk_product_name_jpline1);
					subList.setLineItemValue('item_product_code', itemLine, itemArrVal.custitem_djkk_product_code);
					//changed by geng add end CH042
					subList.setLineItemValue('fcid', itemLine, pocreatSearch[n].getValue('internalid'));
					subList.setLineItemValue('itemid', itemLine, pocreatSearch[n].getValue('custrecord_djkk_sc_fc_item'));					
					subList.setLineItemValue('description', itemLine, pocreatSearch[n].getValue('purchasedescription','CUSTRECORD_DJKK_SC_FC_ITEM'));
					var linequantity=pocreatSearch[n].getValue('custrecord_djkk_sc_fc_add');
					subList.setLineItemValue('sc_quantity', itemLine,linequantity);//実績入庫数
					
					subList.setLineItemValue('rate', itemLine, Number(pocreatSearch[n].getValue('vendorcost','CUSTRECORD_DJKK_SC_FC_ITEM')).toFixed(3));
//					var lineAmount=Number(pocreatSearch[n].getValue('vendorcost','CUSTRECORD_DJKK_SC_FC_ITEM'))*Number(pocreatSearch[n].getValue('custrecord_djkk_sc_fc_add'));
					
					//end
					// DENISJAPANDEV-1028 U258 DJ_発注書入力_食品画面改善 税金コード「不課税」を初期値に修正
					//var lineTaxschedule=pocreatSearch[n].getValue('taxschedule','CUSTRECORD_DJKK_SC_FC_ITEM');
					//202304226 changed by zhou 
					//zhou memo : CH488  DJ_発注書入力_食品画面改善 税金コード「免税」を初期値に修正
					var lineTaxcode='8';//taxscheduleArray[lineTaxschedule];
					subList.setLineItemValue('taxcode', itemLine, lineTaxcode);
					
					
					var unitstypeId=pocreatSearch[n].getValue('unitstype','CUSTRECORD_DJKK_SC_FC_ITEM');//主要単位の種類
					var unitstypeText=pocreatSearch[n].getText('unitstype','CUSTRECORD_DJKK_SC_FC_ITEM');//主要単位の種類
					subList.setLineItemValue('unitstypetext', itemLine, unitstypeText);//アイテム主要単位の種類
					var itemUnit=pocreatSearch[n].getValue('purchaseunit','CUSTRECORD_DJKK_SC_FC_ITEM');//主要購入単位
					var stockunit = pocreatSearch[n].getValue('stockunit','CUSTRECORD_DJKK_SC_FC_ITEM');//主要在庫単位
					subList.setLineItemValue('lineunitsid', itemLine, itemUnit);//主要購入単位id
					subList.setLineItemValue('stockunitid', itemLine, stockunit);//主要在庫単位id
					subList.setLineItemValue('unitstypeid', itemLine, unitstypeId);//主要単位の種類
					//20230305 changed by zhou DEV-1890 start
//					if (!isEmpty(unitstypeId)) {
//						var unitstype = nlapiLoadRecord('unitstype', unitstypeId);
//						var unitstypeCount = unitstype.getLineItemCount('uom');
//						for (var uni = 1; uni < unitstypeCount + 1; uni++) {
//							var unValue = unitstype.getLineItemValue('uom','internalid', uni);
//							var unvalueText = unitstype.getLineItemValue('uom','unitname', uni);
//							var unconversionrate=unitstype.getLineItemValue('uom','conversionrate', uni);
//							lineUnits.addSelectOption(unitstypeId + '|' + unValue,unitstypeText+ ' - ' +unvalueText);
//							if(unValue==itemUnit){
//								subList.setLineItemValue('units', itemLine,unitstypeId+'|'+unValue);
//								subList.setLineItemValue('conversionrate', itemLine, unconversionrate);
//								if(!isEmpty(unconversionrate)&&unconversionrate!='0'){
//								subList.setLineItemValue('cases', itemLine, Math.ceil(linequantity/unconversionrate));
//								}
//							}
//						}
//					}
					//画面初期化時に明細行が自動的に計算される
					if (!isEmpty(unitstypeId)) {
						var unitstype = nlapiLoadRecord('unitstype', unitstypeId);
						var unitstypeCount = unitstype.getLineItemCount('uom');
						var stockConversionrate;
						var itemUnitConversionrate;
						for (var uni = 1; uni < unitstypeCount + 1; uni++) {
							var unValue = unitstype.getLineItemValue('uom','internalid', uni);
							var unvalueText = unitstype.getLineItemValue('uom','unitname', uni);
							var unconversionrate=unitstype.getLineItemValue('uom','conversionrate', uni);
							lineUnits.addSelectOption(unitstypeId + '|' + unValue,unitstypeText+ ' - ' +unvalueText);
							if(unValue==itemUnit){
								itemUnitConversionrate = unconversionrate;//主要購入単位 換算率 (/基本)
							}
							if(unValue==stockunit){
								stockConversionrate = unconversionrate;//主要在庫単位 換算率 (/基本)
							}
						}
						var conversionrate ;//購入単位と在庫単位 - 換算率(/主要購入単位/主要在庫単位)
						var perunitquantity = Number(pocreatSearch[n].getValue("custitem_djkk_perunitquantity","CUSTRECORD_DJKK_SC_FC_ITEM",null)).toFixed(3);//20230509 changed by zhou ITEM.DJ_入り数(入り目)
						if(!isEmpty(stockConversionrate)&&!isEmpty(itemUnitConversionrate)&&stockConversionrate!='0'&&itemUnitConversionrate!='0'){
							conversionrate =itemUnitConversionrate/stockConversionrate;//20230509 changed by zhou
							subList.setLineItemValue('units', itemLine,unitstypeId+'|'+itemUnit);
							nlapiLogExecution('debug','units',unitstypeId+'|'+unValue)
							subList.setLineItemValue('itemunitconversion', itemLine, itemUnitConversionrate);//20230515 changed by wang
							subList.setLineItemValue('conversion', itemLine, conversionrate);//20230509 changed by zhou 換算率
							subList.setLineItemValue('conversionrate', itemLine, perunitquantity);//20230509 changed by zhou 換算率 => ITEM.DJ_入り数(入り目)
//						    subList.setLineItemValue('cases', itemLine, Math.ceil(linequantity/itemUnitConversionrate));//20230502 changed by zhou
//							subList.setLineItemValue('cases', itemLine, Number(Number(linequantity/conversionrate)*perunitquantity/conversionrate).toFixed(3));//ケース数＝注文数*入り目/換算率 20230601 changed by zht
							subList.setLineItemValue('cases', itemLine, Number(Number(linequantity/perunitquantity).toFixed(3)));//ケース数＝SC入庫数／入り目 20230601 changed by zht
						}
//						var soQuantity = Math.ceil(linequantity/conversionrate)+'';//20230502 changed by zhou
						//20230502 changed by zhou
						var soQuantity = Number(linequantity/conversionrate).toFixed(3)+'';
//						soQuantity = soQuantity.split('.')[0];
						if(!isEmpty(conversionrate)){
							subList.setLineItemValue('quantity', itemLine,soQuantity);//今回の購入数量 
						}else{
							nlapiLogExecution('error','換算レートの計算中に例外が発生しました')
						}
					}
					//20230502 changed by zhou start
					//注文数*単価
					var lineAmount=Number(soQuantity)*Number(Number(pocreatSearch[n].getValue('vendorcost','CUSTRECORD_DJKK_SC_FC_ITEM')).toFixed(3));
					subList.setLineItemValue('amount', itemLine, lineAmount.toFixed(3));
					var lineRate=rateArray[lineTaxcode];
					var lineGrossamt=lineAmount*lineRate;
					subList.setLineItemValue('grossamt', itemLine, lineGrossamt.toFixed(3));
					//20230502 changed by zhou end
						itemLine++; 
				 }
				//end
			}
		}
			form.addSubmitButton('送信ボタン');
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
function formatDate(dt){    //日付
	  return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
	}