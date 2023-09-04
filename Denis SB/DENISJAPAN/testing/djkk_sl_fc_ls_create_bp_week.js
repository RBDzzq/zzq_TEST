/**
 * 販売計画情報入力_LS_Week
 *
 * Version    Date            Author           Remarks
 * 1.00       2021/06/08     CPC_苑
 *
 */
var pagedate=nlapiDateToString(getSystemTime());
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	nlapiLogExecution('debug','販売計画情報入力_LS_Week','start')
	// request parameter: 連結
	var subsidiary=request.getParameter('subsidiary');
    // request parameter: 基準日
    var date = request.getParameter('date');
    pagedate=date;
    // request parameter: 操作
    var operation = request.getParameter('op');
    // request parameter: 商品コードリスト
    var rpProductCodes = request.getParameter('productCodes');
    // request parameter: ブランドリスト
    var rpBrand = request.getParameter('brand');
    // request parameter: 画面幅
    var rpSW = request.getParameter('width');
    // request parameter: 画面高さ
    var rpSH = request.getParameter('height');
    // 画面HTML
    var htmlNote ='';
    // ログインユーザを取得
    var user = nlapiGetUser();
    /*******U224*******************/
    var getUser= request.getParameter('user');
    if(!isEmpty(getUser)){
    	user =getUser;
    }
    
    /*******U224*******************/
    // 販売計画情報入力フォームを作成
    var form = nlapiCreateForm('販売計画情報入力_WEEK_LS', (operation == 's'));
    // client scriptを設定
    form.setScript('customscript_djkk_cs_fc_ls_create_bp_wk');
    // 検索の場合
    if (operation == 's') {
        // 検索を実施、結果HTMLを作成する
    	var doSearchResult = doSearch(user, date, rpBrand, rpProductCodes, rpSW, rpSH,subsidiary);
        htmlNote += doSearchResult.htmlNote;
        var delivery = doSearchResult.deliveryArray;
        // 画面にボタンを追加
        form.addButton('custpage_update', '更新', 'updateData();');
        form.addButton('custpage_backToSearch', '検索に戻る', 'backToSearch();');
        // 画面hidden項目を作成、次画面引継ぐ用
        createHiddenItems(form, date, rpBrand, rpProductCodes,subsidiary,user,delivery);
    }
    // データ更新の場合
    else if (operation == 'update') {
        // request parameter: キャッシュ―レコードID
        var rpCacheRecordID = request.getParameter('cacheRecordID');
        // バッチ実行処理を呼び出す
        doCallBatch(rpCacheRecordID, date, rpBrand, rpProductCodes,subsidiary);
    }
    else if (operation == 'logForm') {
        form.addFieldGroup('custpage_run_info', '実行情報');
        // バッチ状態を取得
        var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_fc_ls_create_bp_wk');
        // 実行失敗の場合
        if (batchStatus == 'FAILED') {
            // refreshボタンを作成
            form.addButton('custpage_refresh', '更新', 'refresh();');
            var runstatusField = form.addField('custpage_run_info_status', 'text', '', null, 'custpage_run_info');
            runstatusField.setDisplayType('inline');
            var messageColour = '<font color="red"> バッチ処理を失敗しました </font>';
            runstatusField.setDefaultValue(messageColour);
        }
        // 実行中の場合
        else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {
            // refreshボタンを作成
            form.addButton('custpage_refresh', '更新', 'refresh();');
            var runstatusField = form.addField('custpage_run_info_status', 'text', '', null, 'custpage_run_info');
            runstatusField.setDisplayType('inline');
            runstatusField.setDefaultValue('バッチ処理を実行中');
        }
        // 実行完了の場合
        else {
            var runstatusField = form.addField('custpage_run_info_status', 'text', '', null, 'custpage_run_info');
            runstatusField.setDisplayType('inline');
            runstatusField.setDefaultValue('バッチ処理実行完了しました');
            // 画面表示項目作成を実施（初期表示同様）
            doPageInit(form, date, user, rpBrand, rpProductCodes,subsidiary);
        }
    }
    // 上記以外の場合
    else {
        // 画面表示項目作成を実施
        doPageInit(form, date, user, rpBrand, rpProductCodes,subsidiary);
    }

    var feieldNote = form.addField('custpage_note', 'inlinehtml', '', '','');
    feieldNote.setDefaultValue(htmlNote);
    response.writePage(form);
}

/**
 * 画面表示項目作成を実施
 * @param {*} pForm
 * @param {*} pDate
 * @param {*} pUser
 * @param {*} pBrand
 * @param {*} pProductCodes
 */
function doPageInit(pForm, pDate, pUser, pBrand, pProductCodes,subsidiary,delivery) {
    // グループを設定
    pForm.addFieldGroup('custpage_group_filter', '検索項目');
    
    // 基準日フィールドを作成
    var dateField = pForm.addField('custpage_date', 'date', '基準日', null, 'custpage_group_filter');
    // 連結フィールドを作成
    var subsidiaryField=pForm.addField('custpage_subsidiary', 'select', '連結', null,'custpage_group_filter');
	
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
	 // 連結を必須に設定
    subsidiaryField.setMandatory(true);
	 if(!isEmpty(subsidiary)){
		    subsidiaryField.setDefaultValue(subsidiary);
		    }else{
		    	//var userSub=nlapiLookupField('employee', nlapiGetUser(), 'subsidiary');
		    	var userSub=getRoleSubsidiary();
		    	 subsidiaryField.setDefaultValue(userSub);
		    	 subsidiary=userSub;
		    }
	 /************U224*******************************/
	    // 納品先フィールドを作成
//	    var deliverySelector = pForm.addField('custpage_delivery', 'multiselect', '納品先', null, 'custpage_group_filter');
		// BPフィールドを作成
	    var userField=pForm.addField('custpage_user', 'select', 'BP', null,'custpage_group_filter');
	    var bpSearch = nlapiSearchRecord("customrecord_djkk_person_registration_ls",null,
	    		[
	    		   ["custrecord_djkk_bp_ls","noneof","@NONE@"], 
	                "AND", 
	                ["custrecord_djkk_subsidiary_bp_ls","anyof",subsidiary]
	    		], 
	    		[
	    		   new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_BP_LS","GROUP").setSort(false), 
	    		   new nlobjSearchColumn("entityid","CUSTRECORD_DJKK_BP_LS","GROUP")
	    		]
	    		);
	    var userArray=new Array();
	    userField.addSelectOption('', '');
	    if(!isEmpty(bpSearch)){
		for(var bps=0;bps<bpSearch.length;bps++){
			userArray.push(Number(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP")));
			userField.addSelectOption(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP"), bpSearch[bps].getValue("entityid","CUSTRECORD_DJKK_BP_LS","GROUP"));
		}
	    }
		userField.setMandatory(true);
		if(userArray.indexOf(Number(pUser)) > -1){
		userField.setDefaultValue(Number(pUser).toString());
		}else{
			userField.addSelectOption(pUser,nlapiLookupField('employee', pUser, 'entityid'));
			userField.setDefaultValue(Number(pUser).toString());
		}
		/*******U224*******************/
    // ブランドフィールドを作成
    var brandSelector = pForm.addField('custpage_brand', 'multiselect', 'ブランド', null, 'custpage_group_filter');
    // 商品名フィールドを作成
    var itemSelector = pForm.addField('custpage_item', 'multiselect', '商品名', null, 'custpage_group_filter');
    // 基準日を必須に設定
    dateField.setMandatory(true);

   
    // 前画面の基準日項目をresponse画面に再設定
    if(isEmpty(pDate)){
    	pDate=nlapiDateToString(getSystemTime());
    }
    pagedate=pDate;
    dateField.setDefaultValue(pDate);
    // 各入力のサイズを設定
    dateField.setDisplaySize(80,1);
    subsidiaryField.setDisplaySize(240,15);
    userField.setDisplaySize(240,15);
    brandSelector.setDisplaySize(240,15);
    itemSelector.setDisplaySize(240,15);
//    deliverySelector.setDisplaySize(240,9);
    // REQUEST前の選択値を再設定する
   
    // 初期表示の場合、ブランドのリストを作成する
    doBrandSearch(pUser, brandSelector,subsidiary);
    // 初期表示の場合、納品先のリストを作成する
//    doPageInitDeliverySearch(pUser, deliverySelector,subsidiary);
    // ブランドが空でない場合
    if (isEmpty(pBrand)) {
    	pBrand='ALL';
    }
    // 納品先が空でない場合
//    if (isEmpty(delivery)) {
//    	delivery='ALL';
//    }
    // REQUEST前の選択値を再設定する
    brandSelector.setDefaultValue(pBrand);
    // request parameter商品コードリストがブランでない場合、分割しする
    var rpProductCdArr = new Array();
    if (!isEmpty(pProductCodes)) {
        rpProductCdArr = pProductCodes.split('');
    }

    // ブランドが空でない商品リストの検索を実施
    if (!isEmpty(pBrand)) {
        // ユーザ、ブランドをもとに、商品コード配列を取得
        var items = doItemSearch(pUser, pBrand, null,subsidiary);
        // アイテム配列がデータありの場合
        if (!isEmpty(items.productArr)) {
            // アイテム件数
            var len = items.productArr.length;
            // 1件以上の場合、先頭に「-すべて-」の選択肢を作成
            if (len > 1) {
                itemSelector.addSelectOption('ALL', '-すべて-', (rpProductCdArr.indexOf('ALL') >= 0));
            }
            // アイテム件数分ループ
            for (var i = 0; i < len; i++) {
                // 選択状態
                var isSelected = (rpProductCdArr.indexOf(items.productArr[i].itemId) >= 0);
                // 商品選択リストを作成
                
                // U149
                /*old*/  // itemSelector.addSelectOption(items.productArr[i].itemId, items.productArr[i].item, isSelected);
                /*new*/  
                var nameOfItem='';
                if(!isEmpty(items.productArr[i].item)){
                	nameOfItem='('+items.productArr[i].item+') '+items.productArr[i].itemName;
                }else{
                	nameOfItem=items.productArr[i].itemName;
                }
                itemSelector.addSelectOption(items.productArr[i].itemId,nameOfItem, isSelected);
            }
        }
    }


    // 検索ボタンを作成
    pForm.addButton('custpage_creatforecastlist', '検索', 'creatForecastList();');
}

/**
 * バッチ実行処理
 * @param {*} pCacheRecordId
 * @param {*} pDate
 * @param {*} pBrand
 * @param {*} pProductCodes
 */
function doCallBatch(pCacheRecordId, pDate, pBrand, pProductCodes,subsidiary,delivery) {
    var ctx = nlapiGetContext();
   // var a = nlapiLoadRecord('customrecord_djkk_forecast_cache_table',pCacheRecordId)
   // nlapiLogExecution('debug','a',a.getFieldValue('custrecord_djkk_data_cache'))
       // キャシューレコードテーブルを取得
    //var cacheRecord=nlapiCreateRecord('customrecord_djkk_test_database');
    // 値をフィールドオブジェクトに設定
  //  cacheRecord.setFieldValue('custrecord_test_database', a.getFieldValue('custrecord_djkk_data_cache'));
    // キャシューテーブル値を保存し、キャシューレコードIDを取得
   // var cacheRecordID=nlapiSubmitRecord(cacheRecord, false, true);
    // バッチ実行用パラメータを作成
    var scheduleparams = new Array();
    scheduleparams['custscript_djkk_fc_cache_table_so_id_lsw'] = pCacheRecordId;
    scheduleparams['custscript_djkk_so_date_ls_week'] = pDate;
    // バッチ実行
    runBatch('customscript_djkk_ss_fc_ls_create_bp_wk',
            'customdeploy_djkk_ss_fc_ls_create_bp_wk', scheduleparams);
    // リダイレクト実施
    var parameter= new Array();
    parameter['op'] = 'logForm';
    parameter['date'] = pDate;
    parameter['brand'] = pBrand;
    parameter['subsidiary'] = subsidiary;
    parameter['delivery'] = delivery;
    parameter['productCodes'] = pProductCodes;
    nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(), null, parameter);
}

/**
 * 画面hidden項目を作成
 * @param {*} pFrom
 * @param {*} pDate
 * @param {*} pBrand
 * @param {*} pProductCodes
 */
function createHiddenItems(pFrom, pDate, pBrand, pProductCodes,subsidiary,user,delivery) {
	
	// 納品先フィールドを作成
    var deliveryField = pFrom.addField('custpage_delivery_hidden', 'text', '納品先', null, 'custpage_group_filter');
    // 基準日フィールドを作成
    var dateField = pFrom.addField('custpage_date_hidden', 'date', '基準日', null, 'custpage_group_filter');
    // ブランドフィールドを作成
    var brandFiled = pFrom.addField('custpage_brand_hidden', 'text', 'ブランド', null, 'custpage_group_filter');
     //連結フィールドを作成
    var subsidiaryFiled = pFrom.addField('custpage_subsidiary_hidden', 'text', '連結', null, 'custpage_group_filter');
    // 商品名フィールドを作成
    var itemField = pFrom.addField('custpage_item_hidden', 'text', '商品名', null, 'custpage_group_filter');
 // BPフィールドを作成
    var userField = pFrom.addField('custpage_user_hidden', 'text', 'BP', null, 'custpage_group_filter');
    // 戻り後の画面に条件を再表示のため値を設定
    deliveryField.setDefaultValue(delivery);
    dateField.setDefaultValue(pDate);
    brandFiled.setDefaultValue(pBrand);
    itemField.setDefaultValue(pProductCodes);
    subsidiaryFiled.setDefaultValue(subsidiary);
    userField.setDefaultValue(user);
    // 非表示に設定
    deliveryField.setDisplayType('hidden');
    dateField.setDisplayType('hidden');
    brandFiled.setDisplayType('hidden');
    itemField.setDisplayType('hidden');
    subsidiaryFiled.setDisplayType('hidden');
    userField.setDisplayType('hidden');
}

/**
 * 担当者名を取得
 * @param {*} pUser ID
 * @returns 担当者名
 */
function doUserSearch(pUser) {
    // 担当者名
    var name = '';
    // 担当者ID
    // var id = '';
    // 検索フィルター
    var filters = [];
    // 検索項目配列
    var columns = [];

    // フィルター
    filters.push(['internalid', 'is', pUser]);

    // 検索項目配列
    columns.push(new nlobjSearchColumn('entityid'));
    columns.push(new nlobjSearchColumn('lastname'));
    columns.push(new nlobjSearchColumn('firstname'));

    // 担当者名検索
    var sRes = getSearchResults('employee', null, filters, columns);

    // 担当者名検索結果、データありの場合
    if(!isEmpty(sRes)) {
        // id = sRes[0].getValue(columns[0]);
        name = sRes[0].getValue(columns[1]) + sRes[0].getValue(columns[2]);
    }

    return {name : name, id : pUser};
}
/**
 * 納品先名前、idを取得
 * @param {*} 納品先 ID
 * @returns 納品先名
 */
//function doDeliveryValueSearch(delivery) {
//	var deliveryNameArray={};
//	var deliveryIdArray=new Array();
//    // 納品先名
//    var name = '';
//    // 納品先ID
//    // 検索フィルター
//    var filters = [];
//    filters.push(["internalid","isnotempty",""]);
//    filters.push('AND');
//	filters.push(["custrecord_djkk_delivery_in_sheet","noneof","@NONE@"]);
//    if(delivery!='ALL'){
//    	filters.push('AND');
//    	filters.push(["custrecord_djkk_delivery_in_sheet","anyof",delivery.split('')]);
//    }
//    // 検索項目配列
//    var columns = [];
//
//    // 項目
//    columns.push(new nlobjSearchColumn("custrecord_djkk_delivery_in_sheet",null,"GROUP").setSort(false));
//    columns.push(new nlobjSearchColumn("name","CUSTRECORD_DJKK_DELIVERY_IN_SHEET","GROUP"));
//    
//    // 納品先検索
//    var dRes = getSearchResults('customrecord_djkk_so_forecast_ls', null, filters, columns);
//
//    // 納品先検索結果、データありの場合
//    if(!isEmpty(dRes)) {
//    	for(var i=0;i<dRes.length;i++){
//    		var id=dRes[i].getValue(columns[0]);
//    		var name=dRes[i].getValue(columns[1]);
//    		deliveryIdArray.push(id);
//    		deliveryNameArray[id]= name;
//    	}       
//    }
//    nlapiLogExecution('debug','deliveryNameArray',JSON.stringify(deliveryNameArray))
//    return {deliveryIdArray  : deliveryIdArray,deliveryNameArray  : deliveryNameArray};
//}
/**
 * 該当ユーザが担当しているブランドを検索し、ブランド選択肢を作成
 * @param {*} pUser
 * @param {*} brandFiled
 */
function doBrandSearch(pUser, brandFiled,subsidiary) {
    // 検索フィルター
    var filters = [["subsidiary","anyof",subsidiary]];
    
    // 検索項目配列
    var columns = [];

    // 項目
    columns.push(new nlobjSearchColumn("internalid").setSort(false));
    columns.push(new nlobjSearchColumn("name"));
 
    // ブランド検索
    var sRes = getSearchResults('classification', null, filters, columns);

    // 選択しスト先頭に、「-すべて-」の選択肢を作成
    brandFiled.addSelectOption('ALL', '-すべて-');

    // ブランド検索結果、データありの場合
    if (!isEmpty(sRes)) {
        // 検索結果件数
        var len = sRes.length;
        // 検索結果件数分ループ
        for (var i = 0; i < len; i++){
            if (!isEmpty(sRes[i].getValue(columns[0]))) {
                brandFiled.addSelectOption(sRes[i].getValue(columns[0]), sRes[i].getValue(columns[1]));
            }
        }
    }
}
/**
 * ユーザ、ブランド、商品配列をもとに、商品コード配列を取得
 * @param {*} pUser                ログインユーザID
 * @param {*} pBrand              ブランド
 * @param {*} pProductCodeArr 商品配列
 * @returns \{productArr:[{itemId : 1, item : A, locations : [1,2..]}, locationsTxt : [A,B...]..], ids:[1,...], locationArr : [...]}
 */
function doItemSearch(pUser, pBrand, pProductCodeArr,subsidiary) {
    // 結果配列
    var productArr = new Array();
    // 結果ID配列
    var idArr = new Array();
    // 場所配列
    var locationArr = new Array();
    // 前回アイテムID
    var lastItemID = '';

    // 検索項目配列
    var columns = [new nlobjSearchColumn('internalid', 'custrecord_djkk_item_ls').setSort(false),
                   /*U149 old*/ // new nlobjSearchColumn('itemid', 'custrecord_djkk_item_ls'),
                   /*U149 new*/  new nlobjSearchColumn("vendorname","CUSTRECORD_DJKK_ITEM_LS",null),
                            new nlobjSearchColumn('custrecord_djkk_bp_location_area_ls'),
                            new nlobjSearchColumn('displayname', 'custrecord_djkk_item_ls')];
    // 検索フィルター
    var filter = [];
    filter.push(['custrecord_djkk_bp_ls', 'is', pUser]);
    filter.push('and');
    
    // DJ_営業FC週月判断:週単位
    filter.push(["custrecord_djkk_business_judgmen_fc","anyof",'1']);
    if(!isEmpty(subsidiary)){
    filter.push('and');
    filter.push(["custrecord_djkk_subsidiary_bp_ls","anyof",subsidiary]);
    }
    
    // アイテムIDがパラメータとして渡されてない場合
    // ブランドパラメータが空、また’ALL’でない場合、検索条件に追加
    if (!isEmpty(pBrand) && pBrand != 'ALL') {
        filter.push('and');
        var brands = pBrand.split('');
        var bLen = brands.length;
        var brandFilter = [];
        // ブランドのサブフィルターを作成
        for (var k = 0; k < bLen; k++) {
            brandFilter.push(['custrecord_djkk_item_ls.class', 'is', brands[k]]);
            brandFilter.push('or');
        }
        // 最後のORを削除
        brandFilter.pop();
        filter.push(brandFilter);
    }
    // アイテムが選択される場合、また’ALL’でない場合
    if (!isEmpty(pProductCodeArr) && pProductCodeArr != 'ALL') {
        filter.push('and');
        filter.push(['custrecord_djkk_item_ls.internalid', 'anyof', pProductCodeArr.split('')]);
    }

    // アイテム検索
    var sRes = getSearchResults('customrecord_djkk_person_registration_ls', null, filter, columns);

    // 検索結果がデータありの場合
    if (!isEmpty(sRes)) {
        var len = sRes.length;
        for (var i = 0; i < len; i++) {
            // 前回アイテムIDが空、もしくは現在の結果アイテムIDと前回のが異なる場合
            if (lastItemID == '' || lastItemID != sRes[i].getValue(columns[0])) {
                productArr.push({itemId : sRes[i].getValue(columns[0]),
                                        item : sRes[i].getValue(columns[1]),
                                        itemName : sRes[i].getValue(columns[3]),
                                        locations : sRes[i].getValue(columns[2]).split(','),
                                        locationsTxt : sRes[i].getText(columns[2]).split(',')});
                idArr.push(sRes[i].getValue(columns[0]));

            } else {
                // 現在のアイテムの場所配列を取得
                var tmpLocArr = sRes[i].getValue(columns[2]).split(',');
                var tmpLocTxtArr = sRes[i].getText(columns[2]).split(',');
                var tmpLen = tmpLocArr.length;
                // 現在のアイテムの場所配列の件数分ループ
                for (var j = 0; j < tmpLen; j++) {
                    // 現在のアイテムの場所はまだ返却用配列に存在しない場合、追加
                    if (productArr[productArr.length - 1].locations.indexOf(tmpLocArr[j]) < 0) {
                        productArr[productArr.length - 1].locations.push(tmpLocArr[j]);
                        productArr[productArr.length - 1].locationsTxt.push(tmpLocTxtArr[j]);
                    }
                }
            }
            // 前回アイテムIDを更新
            lastItemID = sRes[i].getValue(columns[0]);
            // 場所配列に場所を全部格納
            locationArr.push.apply(locationArr, sRes[i].getValue(columns[2]).split(','));
        }
    }
    // 重複を削除
    locationArr = unique(locationArr);
    return {productArr : productArr, ids : idArr, locationArr : locationArr};
}

/**
 * 検索処理
 * @param {*} pUser
 * @param {*} pDate
 * @param {*} pBrand
 * @param {*} pProductCodes
 * @param {*} pSW
 * @param {*} pSH
 * @returns 結果HTML
 */
function doSearch(pUser, date, pBrand, pProductCodes, pSW, pSH,subsidiary) {
    
	var screenHeight=pSH;
	var screenWidth=pSW;
	var tableHeight='height:'+Number(screenHeight*59/60-270)+'px;';//'height:600px;';//600
	var tableWidth='width:'+Number(screenWidth*59/60)+'px;';//'width:1220px;';//1220
	var trtdHeight=28;//28
	var tableCloum1=62;//62
	var tableCloum2=126;//126
	var tableCloum3=254;//254
	var htmlNote ='';
	var itemIdArray=pProductCodes.split('');
	var itemArr =doItemSearch(pUser, pBrand, pProductCodes,subsidiary);
	 if (isEmpty(itemArr) || itemArr.ids.length == 0) {
	        htmlNote += '<p color="red">担当している商品は存在しません。</p>';
	    } else {
//	    //納品先を取得
//    	var deliveryData = doDeliveryValueSearch(delivery);
//    	var deliveryArray=new Array();
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
			var dateweek = newGetYearWeek(changeDate);//20230327 changed by zhou	
			
			var pushyear = getYear(changeDate);
			var pushdate = getSunday(changeDate,true);
			var pushMonth=(pushdate.split('/'))[0];
			//20230327 changed by zhou start Modification point 4
			//DEV - 1594  zhou memo :次のコードが原因不明のため、週数計算の異常が発生したためコメントされています
//			if (dateweek == '52') {
//				dateweek = '1';
//				pushyear = Number(pushyear) + 1;
//			} else 
//				if(dateweek == '53'){
//				dateweek = '2';
//				pushyear = Number(pushyear) + 1;
//			}else {
//				dateweek = Number(dateweek) + 1;
//			}
//			if (dateweek == '0') {
//				dateweek = '53';
//			}
//			if (dateweek == '53') {
//				pushyear = Number(pushyear) + 1;
//			}
			//20230327 changed by zhou end Modification point 4
			if(Number(dateweek)<10){
				dateweek='0'+dateweek;
			}
			if(Number(pushMonth)<10){
				pushMonth='0'+pushMonth;
			}
			//20230407 changed by zhou start Modification point 5
			if(Number(dateweek)> 52){
				pushMonth = '12';
			}
			//20230407 changed by zhou end Modification point 5
			dateArray.push([ dateweek, pushyear, pushdate,systemdatebefor,referenceFlg,pushMonth,balancedatebefor]);
			changeDate = dateAddDays(changeDate, 7);
		}
		nlapiLogExecution('debug','dateArray',JSON.stringify(dateArray))
		  var employeeSearch=nlapiLookupField('employee',pUser,['custentity_djkk_employee_id','lastname','firstname']);
		
		// 場所のDJ_場所エリア (カスタム)検索
			var locationAreaSearch = nlapiSearchRecord("location",null,
					[
					   ["custrecord_djkk_location_area","anyof",itemArr.locationArr]
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_location_area",null,"GROUP").setSort(false), 
					   new nlobjSearchColumn("internalid",null,"GROUP")
					]
					);
			if (!isEmpty(locationAreaSearch)) {
			var locationAreaList = new Array();
			var locationAreaArray = new Array();
			for (var lcL = 0; lcL < itemArr.locationArr.length; lcL++) {
				for (var las = 0; las < locationAreaSearch.length; las++) {
					var columnID = locationAreaSearch[las].getAllColumns();		
					if (itemArr.locationArr[lcL] == locationAreaSearch[las].getValue(columnID[0])) {
						locationAreaArray.push(locationAreaSearch[las].getValue(columnID[1]));
						locationAreaList['locationId:'+ locationAreaSearch[las].getValue(columnID[1])] = locationAreaSearch[las].getValue(columnID[0]);
					}
				}
			}
		}
     // 場所のDJ_場所エリア (カスタム)検索 END
		// SO-OUT-Search
			var deliveryArray = [];
			var deliveryIdName = {};
			
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
					   ["item.internalid","anyof",itemArr.ids], 
					   "AND", 
					   ["quantityshiprecv","greaterthan","0"], 
					   "AND", 
					   ["fulfillingtransaction.location","anyof",locationAreaArray], 
					   "AND", 
					   ["subsidiary","anyof",subsidiary],
//					   ,"AND", 
//					   ["custcol_djkk_custody_item","is","F"]
//							   "AND", 
//							   ["custbody_djkk_delivery_destination","is",deliveryArray[i]]
					], 
					[
					   new nlobjSearchColumn("item",null,"GROUP").setSort(false), 
					   new nlobjSearchColumn("custcol_djkk_delivery_hopedate",null,"GROUP").setSort(false).setFunction('weekOfYear'), 
					   new nlobjSearchColumn("custcol_djkk_delivery_hopedate",null,"GROUP").setSort(false).setFunction('calendarWeek'),
					   new nlobjSearchColumn("quantityshiprecv",null,"SUM"), 
					   new nlobjSearchColumn("location","fulfillingTransaction","GROUP"),
					   new nlobjSearchColumn("custbody_djkk_delivery_destination",null,"GROUP"),
					   new nlobjSearchColumn("name","CUSTBODY_DJKK_DELIVERY_DESTINATION","GROUP")
					]
					);
			if (!isEmpty(salesorderSearch)) {
				for (var aIs = 0; aIs < itemArr.ids.length; aIs++) {
					var soItemArray = new Array();
					nlapiLogExecution('debug','salesorderSearch',salesorderSearch.length);
					for (var sos = 0; sos < salesorderSearch.length; sos++) {
					var columnID = salesorderSearch[sos].getAllColumns();
					var delieverId = salesorderSearch[sos].getValue(columnID[5]);
					var delieverName = salesorderSearch[sos].getValue(columnID[6]);
					deliveryArray.push(delieverId);
					deliveryIdName[delieverId] = delieverName;
		             if(itemArr.ids[aIs]==salesorderSearch[sos].getValue(columnID[0])){
		       
		            	 soItemArray.push([
									changeFcWeekOfYear(salesorderSearch[sos].getValue(columnID[1])),
									salesorderSearch[sos].getValue(columnID[2]),
									salesorderSearch[sos].getValue(columnID[3]),
									locationAreaList['locationId:'+salesorderSearch[sos].getValue(columnID[4])]]);
		             }
					}
					soOutSearchArray.push([itemArr.ids[aIs], soItemArray,delieverId]);
				}
			}else{}		
			deliveryArray = unique(deliveryArray)
	   // SO-OUT-Search END
			nlapiLogExecution('debug','deliveryArray',JSON.stringify(deliveryArray));
			nlapiLogExecution('debug','deliveryIdName',JSON.stringify(deliveryIdName))
		/*******************fc前回******************/
			  var fcSearchArray=new Array();
				  for(var n = 0; n < deliveryArray.length; n++){
					  var filters = [];
				      filters.push(["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiary]);
				      filters.push('AND');
					  filters.push(["custrecord_djkk_so_fc_ls_item","anyof",itemArr.ids]);
					  filters.push('AND');
					  filters.push(["custrecord_djkk_so_fc_ls_employee","anyof",pUser]);
					  if(!isEmpty(deliveryArray[n])){
						  filters.push('AND');
						  filters.push(["custrecord_djkk_delivery_in_sheet","anyof",deliveryArray[n]]);
					  }else{
						  filters.push('AND');
						  filters.push(["custrecord_djkk_delivery_in_sheet.internalidnumber","isempty",""]);
					  }
					  var fclsSearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
							  [
							   	 filters
							  ], 
							  [
							     new nlobjSearchColumn("custrecord_djkk_so_fc_ls_item"), 
							     new nlobjSearchColumn("custrecord_djkk_so_fc_ls_location_area"), 
							     new nlobjSearchColumn("custrecord_djkk_so_fc_ls_year"), 
							     new nlobjSearchColumn("custrecord_djkk_so_fc_ls_week"), 
							     new nlobjSearchColumn("custrecord_djkk_so_fc_ls_week_fcnum"),
							     new nlobjSearchColumn("internalid"),
							     new nlobjSearchColumn("custrecord_djkk_delivery_in_sheet")
							  ]
							  );
			
					  if (!isEmpty(fclsSearch)) {
							for (var aIa = 0; aIa < itemArr.ids.length; aIa++) {
								var fcDataArray = new Array();
								for (var scs = 0; scs < fclsSearch.length; scs++) {
									var columnID = fclsSearch[scs].getAllColumns();
						             if(itemArr.ids[aIa]==fclsSearch[scs].getValue(columnID[0])){
						            	 fcDataArray.push([     fclsSearch[scs].getValue(columnID[1]),
																fclsSearch[scs].getValue(columnID[2]),
																fclsSearch[scs].getValue(columnID[3]),
																fclsSearch[scs].getValue(columnID[4]),
																fclsSearch[scs].getValue(columnID[5])]);
						                  }
						            }
								fcSearchArray.push([itemArr.ids[aIa], fcDataArray,deliveryArray[n]]);
			
							}			
					  }else{
							for (var aIa = 0; aIa < itemArr.ids.length; aIa++) {
								  var fcDataArray = new Array();
						            	 fcDataArray.push([     '',
						            	                        '',
						            	                        '',
						            	                        '',
						            	                        '']);
							}
						            	 fcSearchArray.push([itemArr.ids[aIa], fcDataArray,deliveryArray[n]]);
					  }
					  
//			  	  }
			  }

			  
			/*************************************/
			  
			  /*******************自分以外FC******************/
			  var otherFcSearchArray=new Array();
				  for(var z = 0; z < deliveryArray.length; z++){
					  var filters = [];
				      filters.push(["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiary]);
				      filters.push('AND');
					  filters.push(["custrecord_djkk_so_fc_ls_item","anyof",itemArr.ids]);
					  filters.push('AND');
					  filters.push(["custrecord_djkk_so_fc_ls_employee","noneof",pUser]);
					  if(!isEmpty(deliveryArray[z])){
						  filters.push('AND');
						  filters.push(["custrecord_djkk_delivery_in_sheet","anyof",deliveryArray[z]]);
					  }else{
						  filters.push('AND');
						  filters.push(["custrecord_djkk_delivery_in_sheet.internalidnumber","isempty",""]);
					  }
					  var otherFclsSearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
							  [
							     filters
							  ], 
							  [
			                     new nlobjSearchColumn("custrecord_djkk_so_fc_ls_item",null,"GROUP"), 
			                     new nlobjSearchColumn("custrecord_djkk_so_fc_ls_location_area",null,"GROUP"), 
			                     new nlobjSearchColumn("custrecord_djkk_so_fc_ls_year",null,"GROUP"), 
			                     new nlobjSearchColumn("custrecord_djkk_so_fc_ls_week",null,"GROUP"), 
			                     new nlobjSearchColumn("custrecord_djkk_so_fc_ls_week_fcnum",null,"SUM"),
//							     new nlobjSearchColumn("custrecord_djkk_delivery_in_sheet",null,"GROUP")
							  ]
							  );
					  if (!isEmpty(otherFclsSearch)) {
							for (var oaIa = 0; oaIa < itemArr.ids.length; oaIa++) {
								  var otherFcDataArray = new Array();
								for (var oscs = 0; oscs < otherFclsSearch.length; oscs++) {
									var columnID = otherFclsSearch[oscs].getAllColumns();
						             if(itemArr.ids[oaIa]==otherFclsSearch[oscs].getValue(columnID[0])){
						            	 otherFcDataArray.push([otherFclsSearch[oscs].getValue(columnID[1]),
						            	                        otherFclsSearch[oscs].getValue(columnID[2]),
						            	                        otherFclsSearch[oscs].getValue(columnID[3]),
						            	                        otherFclsSearch[oscs].getValue(columnID[4])]);
						                  }
						            }
								otherFcSearchArray.push([itemArr.ids[oaIa], otherFcDataArray,deliveryArray[z]]);
							}			
					  }else{
							for (var oaIa = 0; oaIa < itemArr.ids.length; oaIa++) {
								  var otherFcDataArray = new Array();
									otherFcDataArray.push([ '',
					            	                        '',
					            	                        '',
					            	                        '']);
							}	
									otherFcSearchArray.push([itemArr.ids[aIa], otherFcDataArray,deliveryArray[z]]);
					  }
					  
			  }
		  
		/*************************************/
		// ';htmlNote +='
		htmlNote += '<div style="margin-bottom:5px;font-weight:900;font-size:24px;">('+nlapiLookupField('subsidiary',subsidiary,'legalname')+') FORECAST LIST</div>';
	    htmlNote += '<div style="margin-bottom:5px;">';
	    htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">Tanto    :    ' + employeeSearch.custentity_djkk_employee_id + '</div>';
	    htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">' + employeeSearch.lastname+employeeSearch.firstname+'</div>';
	    htmlNote += '<div style="display:inline-block;font-weight:bold;font-size:18px;color:red;margin-left:130px;">★★★　Actualは全Salesmanの合計数値です　★★★</div>';
	    htmlNote += '</div>'; 	    
//	    htmlNote += '<div id="tablediv" style="overflow-y:scroll;' + tableHeight + tableWidth+'border:1px solid gray;border-bottom: 0;border-right: 0;">';
		
	    
	    htmlNote +='<div id="tablediv" style="overflow:scroll;'+tableWidth+tableHeight+'border:1px solid gray;border-bottom: 0;border-right: 0;">';
		htmlNote += '<table id="tableList" cellspacing="0" border="0" cellpadding="0" style="border-collapse:separate;width:3721px;table-layout: fixed;">';
		htmlNote += '<thead style="position:sticky;top:0;z-index:2;">';
		htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#9999FF;font-weight:bold;text-align:right;">';
		htmlNote += '<td colspan="2" rowspan="2" style="position:sticky;left:0;z-index:2;background-color:#9999FF;border:1px solid gray;border-right:0px;vertical-align:top;">PrintDate:</td>';
		htmlNote += '<td rowspan="2" style="position:sticky;left:'+tableCloum2+'px;z-index:2;background-color:#9999FF;border:1px solid gray;border-left:0px;vertical-align:top;">'+ date + '</td>';
		
		for (var wk = 0; wk < 54; wk++) {
			if(dateArray[wk][4]){
				htmlNote += '<td style="border:1px solid gray;background-color:#000080;color:#ffffff;">'+ dateArray[wk][0] + '</td>';
			}else{
				htmlNote += '<td style="border:1px solid gray;">'+ dateArray[wk][0] + '</td>';
			}
		}
		
		htmlNote += '</tr>';
		htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#9999FF;font-weight:bold;text-align:right;">';
		
		for (var ye = 0; ye < 54; ye++) {
			if(dateArray[ye][4]){
				htmlNote += '<td style="border:1px solid gray;background-color:#000080;color:#ffffff;">'+ dateArray[ye][1] + '</td>';	
			}else{
			    htmlNote += '<td style="border:1px solid gray;">'+ dateArray[ye][1] + '</td>';
			}
		}

		htmlNote += '</tr>';		
		htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#9999FF;font-weight:bold;text-align:right;">';
		htmlNote += '<td colspan="2" style="position:sticky;left:0;z-index:2;background-color:#9999FF;border:1px solid gray;border-right:0px;">基準日：</td>';
		htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:2;background-color:#9999FF;border:1px solid gray;border-left:0px;">'+ date + '</td>';
		
		for (var sd = 0; sd < 54; sd++) {
			if(dateArray[sd][4]){
				htmlNote += '<td style="border:1px solid gray;background-color:#000080;color:#ffffff;">'+ dateArray[sd][2] + '</td>';	
			}else{
			htmlNote += '<td style="border:1px solid gray;">'+ dateArray[sd][2] + '</td>';
			}
		}
		htmlNote += '</tr>';
		htmlNote += '</thead>';
		
		
		//DELIVER
		//BP
		
		
		 // アイテムHTML
	    var itemHtml = '';
	    /*******************************************************************************************/
        for(var n=0;n<deliveryArray.length;n++){
            var deliveryId=deliveryArray[n];
        // HTML
	        itemHtml += '<tr style="height:28px;background-color:#828287;">';
	        itemHtml += '<td colspan="5" style="border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">納品先    :    ' + deliveryIdName[deliveryId] + '</td>';
	        itemHtml += '<td colspan="52" style="border:1px solid gray;border-left:0px;text-align:left;color:#0033cc;"></td>';
	        itemHtml += '</tr>';
	        /***************************************************************************************/
		    // アイテムの件数分をループ
		    for (var i = 0; i < itemArr.ids.length; i++) {
		    	var inforItemId=itemArr.productArr[i].itemId;
		        itemHtml += '<tr style="background-color:#e6e6e6;">';
		        itemHtml += '<td colspan="3" style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">'+itemArr.productArr[i].item+'</td>';
		        itemHtml += '<td colspan="10" style="position:sticky;left:'+tableCloum2+'px;background-color:#e6e6e6;z-index:1;border:1px solid gray;border-left:0px;border-right:0px;text-align:left;color:#0033cc;">'+itemArr.productArr[i].itemName+'</td>';
		        itemHtml += '<td colspan="44" style="background-color:#e6e6e6;border:1px solid gray;border-left:0px;text-align:left;color:#0033cc;"></td>';
		        itemHtml += '</tr>';
		        
		        // 場所の件数分をループ
		        for (var l = 0; l < itemArr.productArr[i].locations.length; l++) {
		            var actLast = '';
		            var actNow = '';
		            var fcLast = '';
		            var fcOthers = '';
		            var fcSelf = '';
		            var inforLocationId=itemArr.productArr[i].locations[l];
	
		            // 54ヵweek分のデータをループ
		            for (var m = 0; m < 54; m++) {
		             /*****OUT(Year-1)*******/
		            	var WeekNum=Number(Number(dateArray[m][1])-1)+'-'+dateArray[m][0];
						var lastYearData = '';
						var wkFirstDay='';
						for(var sisa=0;sisa<soOutSearchArray.length;sisa++){
							if(soOutSearchArray[sisa][2]==deliveryId){
								if(soOutSearchArray[sisa][0]==inforItemId){
									
									var sisArray=soOutSearchArray[sisa][1];
									for(var sisi=0;sisi<sisArray.length;sisi++){
										var sisi_week=sisArray[sisi][0];
										var sisi_locationId=sisArray[sisi][3];
			                            if(WeekNum==sisi_week&&sisi_locationId==inforLocationId){
			                            	wkFirstDay =sisArray[sisi][1];
			                            	lastYearData =sisArray[sisi][2];
			                            }
									}
								}
							}
						}
		            /***********************/
					/*******OUT(Year)*******/					
						var WeekNumy=dateArray[m][1]+'-'+dateArray[m][0];
						var yearData = '';
						var wkFirstDayy='';
						for(var sisa=0;sisa<soOutSearchArray.length;sisa++){
							if(soOutSearchArray[sisa][2]==deliveryId){	
								if(soOutSearchArray[sisa][0]==inforItemId){					
									var sisArray=soOutSearchArray[sisa][1];
									for(var sisi=0;sisi<sisArray.length;sisi++){
										var sisi_week=sisArray[sisi][0];
										var sisi_locationId=sisArray[sisi][3];
			                            if(WeekNumy==sisi_week&&sisi_locationId==inforLocationId){
			                            	wkFirstDayy =sisArray[sisi][1];
			                            	yearData =sisArray[sisi][2];
			                            }
									}
								}
							}
						}
	
					/***********************/	
		            /********fc前回**********/
		              var fcLastDate=''; 
		              var fcWeekId='';
					  for (var fosa = 0; fosa < fcSearchArray.length; fosa++) {
						  if (fcSearchArray[fosa][2] == deliveryId) {
							if (fcSearchArray[fosa][0] == inforItemId) {
								var foisArray = fcSearchArray[fosa][1];
								for (var fosi = 0; fosi < foisArray.length; fosi++) {
									var foisi_locationId = foisArray[fosi][0];
									var foisi_year = foisArray[fosi][1];
									var foisi_week = foisArray[fosi][2];
									if(foisi_locationId==inforLocationId&&foisi_year==dateArray[m][1]&&foisi_week==dateArray[m][0]){
										fcLastDate=foisArray[fosi][3];
										fcWeekId=foisArray[fosi][4];
									}
								}
							}
						  }
						}
					  /***********************/	
					  /****** 自分以外FC*******/
					  var otherFcLastDate=''; 
					  for (var ofosa = 0; ofosa < otherFcSearchArray.length; ofosa++) {
						  if (otherFcSearchArray[ofosa][2] == deliveryId) {
								if (otherFcSearchArray[ofosa][0] == inforItemId) {
		
									var foisArray = otherFcSearchArray[ofosa][1];
									for (var ofosi = 0; ofosi < foisArray.length; ofosi++) {
										var other_foisi_locationId = foisArray[ofosi][0];
										var other_foisi_year = foisArray[ofosi][1];
										var other_foisi_week = foisArray[ofosi][2];
										if(other_foisi_locationId==inforLocationId&&other_foisi_year==dateArray[m][1]&&other_foisi_week==dateArray[m][0]){
											otherFcLastDate=foisArray[ofosi][3];
										}
									}
								}
						  }
						}
					  /***********************/
					  /*******比較/入力********/
					  var WeekNumComp=dateArray[m][1]+'-'+dateArray[m][0];
					  
					   // 比較/入力FC数
		              var comparation = '0.0';
					  if (!isEmpty(yearData) && !isEmpty(otherFcLastDate)) {
		                    comparation = Math.round((yearData/otherFcLastDate) * 10) / 10;
		                    comparation = comparation.toFixed(1);
		                }
					  
					  /***********************/
					  
		                // (year - 1) actual数
		                actLast += '<td style="border:1px solid gray;">'+lastYearData+'</td>';
		                // year actual数
		                actNow += '<td style="border:1px solid gray;">'+yearData+'</td>';
		                // 自分以外FC数
		                fcOthers += '<td style="border:1px solid gray;">'+otherFcLastDate+'</td>';
		                // 前回FC数
		                fcLast += '<td style="border:1px solid gray;">'+fcLastDate+'</td>';
		                  
		                var Weeks=54-m;
						if (dateArray[m][3]) {
							//fcSelf += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:#134DF2;">'+'<input id="comparation:'+inforItemId+'|'+inforLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center;color:red;" value=""/>'+ comparation + '</td>';
							fcSelf += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:#134DF2;">'+ comparation + '</td>';
						} else {
							//fcSelf += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:red;"><input id="comparation:'+inforItemId+'|'+inforLocationId+'|'+WeekNum+'" oninput="insideDataChange('+'\''+inforItemId+'\''+','+'\''+inforLocationId+'\''+','+'\''+WeekNum+'\''+','+'\''+Weeks+'\''+')" type="text" style="width:100%;height:100%;border:0px;padding:0px;background-color:#ffff99;text-align:right;color:black;" value=""/></td>';										
							 var inputId = 'fcid:' + inforItemId+'|'+inforLocationId+'|'+ dateArray[m][1] +'|'+dateArray[m][5]+'|'+ dateArray[m][0] + '|' + fcWeekId + '|' + deliveryId;
							 if (comparation == '0.0') {
			                        comparation = '';
			                    }
							 fcSelf += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:red;">';
							 fcSelf += '<input type="text" id="' + inputId + '" name="fcQuan" style="width:100%;height:100%;border:0px;padding:0px;background-color:#ffff99;text-align:right;color:black;" value="';
			                 fcSelf += comparation + '"/></td>';
						}
						//fcSelf += '<input id="comparationInitial:'+inforItemId+'|'+inforLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center; ;color:red;" disabled="disabled" value=""/>';
		            
		            }
		            // (Year-1) title + monthly details
		            itemHtml+='<tr style="background-color:#e6e6e6;text-align:right;">';
		            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:1px solid gray;border-right:0px;border-bottom-style:none;width:110px;text-align:left;vertical-align:top;">'+itemArr.productArr[i].locationsTxt[l]+'</td>';
		            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;border-left:0px;border-bottom-style:none;width:110px;text-align:left;vertical-align:top;">Actual</td>';
		            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;width:128px;border-top-style:none">(Year-1)</td>';
		            itemHtml += actLast;
		            itemHtml += '</tr>';
		            // Year title + monthly details
		            itemHtml+='</tr>';
		            itemHtml+='<tr style="background-color:#e6e6e6;text-align:right;">';
		            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none;border-bottom-style:none;border-right-style:none"></td>';
		            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none"></td>';
		            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;">Year</td>';
		            itemHtml += actNow;
		            itemHtml += '</tr>';
		            // 自分以外 title + monthly details
		            itemHtml+='</tr>';
		            itemHtml+='<tr style="background-color:#e6e6e6;text-align:right;">';
		            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none;border-bottom-style:none;border-right-style:none"></td>';
		            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;border-left:0px;border-bottom-style:none;width:110px;text-align:left;vertical-align:top;">Forecast</td>';
		            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;">自分以外</td>';
		            itemHtml += fcOthers;
		            itemHtml += '</tr>';
		            // 前回 title + monthly details
		            itemHtml+='</tr>';
		            itemHtml+='<tr style="background-color:#e6e6e6;text-align:right;">';
		            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none;border-bottom-style:none;border-right-style:none"></td>';
		            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none"></td>';
		            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;">前回</td>';
		            itemHtml += fcLast;
		            itemHtml += '</tr>';
		            // 比較／入力 title + monthly details
		            // 入力 titleの文字色:赤色
		            var colorForInput = 'color:#FE1B34;';
		            // 「/」の色:黒色
		            var colorForSlash = 'color:#000000;';
		            if (l%2 != 0) {
		                colorForInput = 'color:#134DF2;';
		                colorForSlash = 'color:#134DF2;';
		            }
		            itemHtml+='</tr>';
		            itemHtml+='<tr style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;">';
		            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none;border-right-style:none"></td>';
		            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none"></td>';
		            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;"><span style="color:#134DF2;">比較</span><span style="' + colorForSlash + '">／</span><span style="' + colorForInput + '">入力</span></td>';
		            itemHtml += fcSelf;
		            itemHtml += '</tr>';
		        }
		    }
        }
	    htmlNote+=itemHtml;
	    }
		/**/
		
//		htmlNote += '</table>';
//	nlapiLogExecution('debug', '',htmlNote)
	var result = {
		htmlNote:htmlNote,
		deliveryArray:deliveryArray
	}
		return result;
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
  //20230407 changed by zhou start
    //res = currentMonthAvrgOut * 7;//old code
    if (days.length == 1) {
		if(Number(weekNo > 52)){
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
    //var firstDayOfWeek = new Date(w);//20230406 changed by zhou 
    //zhou memo: DEV - 1594 週数計算補正後、既存日数の演算が不一致で、7 daysの時間が不足していることを補正点として補正
    var firstDayOfWeek = new Date(w + 604800000);//20230406 changed by zhou 
    // last date of week (+ 6 days)
    //var lastDayOfWeek = new Date(w + 518400000); //20230406 changed by zhou
    var lastDayOfWeek = new Date(w + 518400000 +604800000);//20230406 changed by zhou
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