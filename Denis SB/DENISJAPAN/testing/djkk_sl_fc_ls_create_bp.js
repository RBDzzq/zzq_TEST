/**
 * 販売計画情報入力_LS
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
//	var Search = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
//	[
//	   ["custrecord_djkk_so_fc_ls_employee","isnotempty",'']
//	], 
//	[
//	   new nlobjSearchColumn("internalid")
//	]
//	);
//if (!isEmpty(Search)) {
//for(var i = 0 ; i < Search.length ; i++){
//	var internalid = Search[i].getValue("internalid");
//	var dle = nlapiDeleteRecord('customrecord_djkk_so_forecast_ls',internalid);
//}
//}
	nlapiLogExecution('debug','販売計画情報入力_LS','start')
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
    
    var fileId = nlapiGetContext().getSessionObject('session_upload_file_id')
	nlapiGetContext().setSessionObject("session_upload_file_id","");
    
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
    var form = nlapiCreateForm('販売計画情報入力_LS', (operation == 's'));
    // client scriptを設定
    form.setScript('customscript_djkk_cs_fc_ls_create_bp');

    // 検索の場合
    if (operation == 's') {
        // 検索を実施、結果HTMLを作成する
//        htmlNote += doSearch(user, date, rpBrand, rpProductCodes, rpSW, rpSH,subsidiary);
        var htmlAndExcelXMLObj = doSearch(user, date, rpBrand, rpProductCodes, rpSW, rpSH,subsidiary);
        var csvStr = htmlAndExcelXMLObj.csvMainString;
        htmlNote += htmlAndExcelXMLObj.htmlNote;
        var csvDownUrl = "window.location.href='" + csvDown(csvStr) + "'";	
        // 画面にボタンを追加
        form.addButton('custpage_update', '更新', 'updateData();');
        form.addButton('custpage_backToSearch', '検索に戻る', 'backToSearch();');
        form.addButton('custpage_csvdownload', 'CSVダウンロード', csvDownUrl);
		form.addButton('custpage_csvupload', 'CSVアップロード', 'csvUpload()');
		form.addButton('custpage_refresh', '画面の更新', 'refresh()');
        // 画面hidden項目を作成、次画面引継ぐ用
        createHiddenItems(form, date, rpBrand, rpProductCodes,subsidiary,user);
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
        var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_fc_ls_create_bp');
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
function doPageInit(pForm, pDate, pUser, pBrand, pProductCodes,subsidiary) {
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
	   // REQUEST前の選択値を再設定する
    if(!isEmpty(subsidiary)){
    subsidiaryField.setDefaultValue(subsidiary);
    }else{
    	//var userSub=nlapiLookupField('employee', nlapiGetUser(), 'subsidiary');
    	var userSub=getRoleSubsidiary();
    	 subsidiaryField.setDefaultValue(userSub);
    	 subsidiary=userSub;
    }
	/************U224*******************************/
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
    
 
    // 初期表示の場合、ブランドのリストを作成する
    doBrandSearch(pUser, brandSelector,subsidiary);

    // ブランドが空でない場合
    if (isEmpty(pBrand)) {
    	pBrand='ALL';
    }
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
function doCallBatch(pCacheRecordId, pDate, pBrand, pProductCodes,subsidiary) {
    var ctx = nlapiGetContext();
    // バッチ実行用パラメータを作成
    var scheduleparams = new Array();
    scheduleparams['custscript_djkk_fc_cache_table_so_id_ls'] = pCacheRecordId;
    scheduleparams['custscript_djkk_so_date_ls'] = pDate;
    // バッチ実行
    runBatch('customscript_djkk_ss_fc_ls_create_bp',
            'customdeploy_djkk_ss_fc_ls_create_bp', scheduleparams);
    // リダイレクト実施
    var parameter= new Array();
    parameter['op'] = 'logForm';
    parameter['date'] = pDate;
    parameter['brand'] = pBrand;
    parameter['subsidiary'] = subsidiary;
    parameter['productCodes'] = pProductCodes;
    nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(), null, parameter);
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
function doSearch(pUser, pDate, pBrand, pProductCodes, pSW, pSH,subsidiary) {
    // HTML
    var htmlNote = '';
    var csvMainString = '';
    // 基準日
    var rpBaseDate = nlapiStringToDate(pDate);

    // 商品コード配列を作成
    var itemArr = doItemSearch(pUser, pBrand, pProductCodes,subsidiary);
    // 商品コード配列が空の場合、担当者の担当商品存在しないため、メッセージを作成する。
    if (isEmpty(itemArr) || itemArr.ids.length == 0) {
        htmlNote += '<p color="red">担当している商品は存在しません。</p>';
    } else {
        // 年月OBJを作成
        var yyyyMMObj = getMonthYearArr(rpBaseDate.getFullYear(), rpBaseDate.getMonth() + 1);

        // ---本人FC検索結果（去年と今期）-----------------------------------
        // 取得項目配列:アイテムコード、アイテム名、場所、年、月、FC数、年月
        var fcColumns = createSColumns();
        // 検索フィルター DJ_担当者コード,DJ_商品コード,DJ_年,DJ_月
        var searchFilter = createSFilter(pUser, 'is', yyyyMMObj, itemArr.ids,subsidiary);
        // DJ_営業FC検索
        var resFCSelf = getSearchResults('customrecord_djkk_so_forecast_ls', null, searchFilter, fcColumns);

        // ---その他担当者FC検索結果------------------------------------------
        // 取得項目配列:アイテムコード、アイテム名、場所、年、月、FC数、年月
        var fcOthersColumns = createSColumnsForOhters();
        // 検索フィルター DJ_担当者コード,DJ_商品コード,DJ_年,DJ_月
        var searchOFilter = createSFilter(pUser, 'noneof', yyyyMMObj, itemArr.ids,subsidiary);
        // DJ_営業FC検索
        var resFCOthers = getSearchResults('customrecord_djkk_so_forecast_ls', null, searchOFilter, fcOthersColumns);

        // ---全担当者実績（Actual）（去年と今期）--------------------------------
        // 場所に所属している倉庫のリストを取得
        var locInvObj = doInventorySearch(itemArr.locationArr);
        // 取得項目配列:
        var actColumns = createActualColumn();
        // 実績検索フィルター作成
        var actFilters = createActualFilter(yyyyMMObj, itemArr.ids, locInvObj.inventoryArr,subsidiary);
        // 実績
        var resAct = getSearchResults('salesorder', null, actFilters, actColumns);

        // 担当者名を取得
        var userIdName = doUserSearch(pUser);

        // 各検索結果をもとに、リストの整形を実施、結果：[{item: AA, locations: [{location: loc, fcOthersArr: [1,...], fcLastArr:[1,...], fcLastIds:[1,...]},.....]},...]
        var fcAcArr = createFcActArr(yyyyMMObj, resFCSelf, fcColumns, resFCOthers, fcOthersColumns, resAct, actColumns, itemArr.productArr, locInvObj.locInvArr);

        // 検索結果明細HTMLを作成
        htmlNote += createHtmlNote(yyyyMMObj, rpBaseDate.getFullYear(), rpBaseDate.getMonth() + 1, fcAcArr, userIdName, pSW, pSH,subsidiary);
        //csv:20221010 add buy zhou U395
        csvMainString += createCsvNote(userIdName,yyyyMMObj, rpBaseDate.getFullYear(), rpBaseDate.getMonth() + 1,fcAcArr,pDate,subsidiary);
    }

    return {htmlNote : htmlNote, csvMainString:csvMainString};
}

/**
 * 画面hidden項目を作成
 * @param {*} pFrom
 * @param {*} pDate
 * @param {*} pBrand
 * @param {*} pProductCodes
 */
function createHiddenItems(pFrom, pDate, pBrand, pProductCodes,subsidiary,user) {

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
    dateField.setDefaultValue(pDate);
    brandFiled.setDefaultValue(pBrand);
    itemField.setDefaultValue(pProductCodes);
    subsidiaryFiled.setDefaultValue(subsidiary);
    userField.setDefaultValue(user);
    // 非表示に設定
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
    columns.push(new nlobjSearchColumn('custentity_djkk_employee_id'));
    

    // 担当者名検索
    var sRes = getSearchResults('employee', null, filters, columns);

    // 担当者名検索結果、データありの場合
    if(!isEmpty(sRes)) {
        // id = sRes[0].getValue(columns[0]);
        name = sRes[0].getValue(columns[1]) + sRes[0].getValue(columns[2]);
    }

    return {name : name, id : sRes[0].getValue(columns[3])};
}

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
 * 基準日を基づき、年、月、年月、昨年年月の配列を作成
 * @param baseYear    基準年
 * @param baseMonth 基準月
 * @returns \{月配列,年配列,昨年配列,年月配列,昨年年月配列}
 **/
 function getMonthYearArr(baseYear, baseMonth) {
    var monthArr = new Array(12);
    var yearArr = new Array(12);
    var lastYearArr = new Array(12);
    var yyyyMMArr = new Array(12);
    var lastYyyyMMArr =  new Array(12);

    // 5 ~ 0, 6~ 11の方向で、年と月を計算して、結果配列に格納
    for (var i = 0; i < 6; i++) {
        var tmpDatePast = new Date(baseYear, baseMonth-i-1, 1);
        var tmpDateFuture = new Date(baseYear, baseMonth+i, 1);

        monthArr[5-i] = (tmpDatePast.getMonth() + 1)<10?'0'+(tmpDatePast.getMonth() + 1).toString():(tmpDatePast.getMonth() + 1).toString();
        yearArr[5-i] = tmpDatePast.getFullYear();
        monthArr[5+i+1] = (tmpDateFuture.getMonth() + 1)<10?'0'+(tmpDateFuture.getMonth() + 1).toString():(tmpDateFuture.getMonth() + 1).toString();
        yearArr[5+i+1] = tmpDateFuture.getFullYear();
        lastYearArr[5-i] = tmpDatePast.getFullYear() - 1;
        lastYearArr[5+i+1] = tmpDateFuture.getFullYear() - 1;

        // 年月のフィルター作成時用配列yyyyM
        yyyyMMArr[5-i]  = yearArr[5-i].toString() + monthArr[5-i].toString();
        yyyyMMArr[5+i+1]  = yearArr[5+i+1].toString() + monthArr[5+i+1].toString();
        // 前回の年月フィルター作成時用配列(yyyy-1)M
        lastYyyyMMArr[5-i]  = (yearArr[5-i] - 1).toString() + monthArr[5-i].toString();
        lastYyyyMMArr[5+i+1]  = (yearArr[5+i+1] - 1).toString() + monthArr[5+i+1].toString();
    }

    return {monthArr        : monthArr,
               yearArr           : yearArr,
               lastYearArr      : lastYearArr,
               yyyyMMArr      : yyyyMMArr,
               lastYyyyMMArr : lastYyyyMMArr};
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
    
    // DJ_営業FC週月判断:月単位
    filter.push(["custrecord_djkk_business_judgmen_fc","anyof",'2']);
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
 * 場所エリアに所属している倉庫を取得
 * @param {*} locationArr
 * @returns 場所倉庫 {locInvArr : [{locationId : A1 , invArr : [1,...]}...], inventoryArr : [1...]}
 */
function doInventorySearch(locationArr) {
    // 場所倉庫配列
    var locInvArr = new Array();
    // 倉庫配列
    var inventoryArr = new Array();
    // 場所配列件数を取得
    var locLen = locationArr.length;

    var filters = [['custrecord_djkk_location_area', 'anyof', locationArr]];
    var columns = [new nlobjSearchColumn('custrecord_djkk_location_area', null, 'group').setSort(false),
                            new nlobjSearchColumn('internalid', null, 'group')];

    // 該当場所に所属しているすべての倉庫を取得
    var res = getSearchResults('location', null, filters, columns);
    // 検索結果がデータありの場合
    if (!isEmpty(res)) {
        var rLen = res.length;
        // 場所配列の件数分ループ
        for (var l = 0; l < locLen; l++) {
            var locInvObj = {locationId : locationArr[l] , invArr : new Array()};
            // 検索結果件数分ループ
            for (var i = 0; i < rLen; i++) {
                // 同一場所の場合
                if (locationArr[l] == res[i].getValue(columns[0])) {
                    locInvObj.invArr.push(res[i].getValue(columns[1]));
                }
            }
            locInvArr.push(locInvObj);
            // 倉庫配列に格納
            inventoryArr.push.apply(inventoryArr, locInvObj.invArr);
        }
    }
    return {locInvArr : locInvArr, inventoryArr : inventoryArr};
}

/**
 * FCの検索フィルタ配列を作成
 * @param {*} pUser
 * @param {String} pUserOp                 'is' or 'noneof'
 * @param {*} pYearMonthObj
 * @param {*} pProductCodeArr
 * @returns FCの検索フィルタ配列
 */
function createSFilter (pUser, pUserOp, pYearMonthObj, pProductCodeArr,subsidiary) {

    // 検索フィルター配列
    var searchFilter = [];
    // 年月フィルター配列
    var yyyyMMfilter = [];
    searchFilter.push(["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiary]);
    searchFilter.push('and');
    /* 検索フィルター作成 */
    searchFilter.push(['custrecord_djkk_so_fc_ls_employee', pUserOp, pUser]);  // DJ_担当者コード
    searchFilter.push('and');

    // 年月のフィルター配列を作成
    for (var i = 0; i < 12; i++) {
        yyyyMMfilter.push(['formulatext: {custrecord_djkk_so_fc_ls_year} || {custrecord_djkk_so_fc_ls_month}', 'is', pYearMonthObj.yyyyMMArr[i]]);
        yyyyMMfilter.push('or');
    }

    // 最後のorを削除
    yyyyMMfilter.pop();
    searchFilter.push(yyyyMMfilter);

    /* DJ_商品コード */
    searchFilter.push('and');
    searchFilter.push(['custrecord_djkk_so_fc_ls_item.internalid', 'anyof', pProductCodeArr]);

    return searchFilter;
}

/**
 * 実績の検索フィルタ配列を作成
 * @param {*} pYearMonthObj 
 * @param {*} pProductCodeArr 
 * @param {*} inventoryArr 
 * @returns 実績の検索フィルタ
 */
function createActualFilter(pYearMonthObj, pProductCodeArr, inventoryArr,subsidiary) {
    var searchFilter = [];

    // 注文書
    searchFilter.push(['type', 'anyof', 'SalesOrd']);
    searchFilter.push('and');
    
    searchFilter.push(["subsidiary","anyof",subsidiary]);
    searchFilter.push('and');
    //
    searchFilter.push(['mainline', 'is', 'F']);
    searchFilter.push('and');
    //　
    searchFilter.push(['taxline', 'is', 'F']);
    searchFilter.push('and');
    // ステータスが承認保留、終了以外
    searchFilter.push(['status', 'noneof', 'salesord:A', 'salesord:H']);
    searchFilter.push('and');
    // アイテムID
    searchFilter.push(['item.internalid', 'anyof', pProductCodeArr]);
    searchFilter.push('and');
    // 数量が0より大きい
    searchFilter.push(['quantityshiprecv', 'greaterthan', '0']);
    searchFilter.push('and');
    // 倉庫が指定場所エリアに所属している
    searchFilter.push(['fulfillingtransaction.location', 'anyof', inventoryArr]);
    searchFilter.push('and');
    // 日付が＞=指定日付Start
    var dt = new Date(pYearMonthObj.lastYearArr[0], (pYearMonthObj.monthArr[0] - 1), 1, 0, 0, 0, 0);
    var startDt = nlapiDateToString(dt);
    searchFilter.push(['trandate', 'onorafter', startDt]);
    searchFilter.push('and');
    // 日付が < 指定日付End
    dt = new Date(pYearMonthObj.yearArr[11], pYearMonthObj.monthArr[11], 1, 0, 0, 0, 0);
    var endDt = nlapiDateToString(dt);
    searchFilter.push(['trandate', 'before', endDt]);

    return searchFilter;
}

/**
 * 本人FC検索の項目配列を作成
 */
function createSColumns() {
    // 取得項目配列: アイテムコード、アイテム名、場所、年、月、FC数、年月
    var columns = new Array();

    /* 検索項目列作成 */
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_item').setSort(false)); // アイテムコード
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_item')); // アイテム名
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_location_area').setSort(false)); // 場所
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_year').setSort(false)); // 年
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_month').setSort(false)); // 月
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_fcnum')); // FC数
    columns.push(new nlobjSearchColumn('formulatext').setFormula('{custrecord_djkk_so_fc_ls_year} || {custrecord_djkk_so_fc_ls_month}')); // 年月
    columns.push(new nlobjSearchColumn('internalid')); // 内部ID

    return columns;
}

/**
 * その他担当者FC検索の項目配列を作成
 */
function createSColumnsForOhters() {
    // 取得項目配列: アイテムコード、アイテム名、場所、年、月、FC数、年月
    var columns = new Array();

    /* 検索項目列作成 */
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_item', null, 'group').setSort(false)); // アイテムコード
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_item', null, 'group')); // アイテム名
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_location_area', null, 'group').setSort(false)); // 場所
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_year', null, 'group').setSort(false)); // 年
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_month', null, 'group').setSort(false)); // 月
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_fcnum', null, 'sum')); // FC数
    columns.push(new nlobjSearchColumn('formulatext', null, 'group').setFormula('{custrecord_djkk_so_fc_ls_year} || {custrecord_djkk_so_fc_ls_month}')); // 年月

    return columns;
}

/**
 * 全担当者実績検索の項目配列を作成
 */
 function createActualColumn() {
    // 取得項目配列: アイテムコード、アイテム名、場所、年、月、FC数、年月
    var columns = new Array();

    /* 検索項目列作成 */
    columns.push(new nlobjSearchColumn('item', null, 'group').setSort(false)); // アイテムコード
    columns.push(new nlobjSearchColumn('formulatext', null, 'group').setFormula('TO_CHAR({trandate},\'YYYYMON\')').setSort(false)); // 日付
    columns.push(new nlobjSearchColumn('quantityshiprecv', null, 'sum')); // 数量
    columns.push(new nlobjSearchColumn("location","fulfillingTransaction","group")); // 倉庫

    return columns;
}

/**
 * todo each fc array is not setting correctly
 *
 * 本人FC検索結果、自分以外の担当者のFC検索結果と本人実績検索結果をもとに、FC検索結果配列を作成
 * @param {*} pYearMonthObj
 * @param {*} fcBpRes                  本人FC検索結果
 * @param {*} fcBpColumns           本人FC検索項目
 * @param {*} fcOthersBpRes         自分以外の担当者のFC検索結果
 * @param {*} fcOthersBpColumns  自分以外の担当者のFC検索項目
 * @param {*} actualRes                実績検索結果
 * @param {*} actColumns              実績検索項目  {アイテムコード,日付,数量,倉庫}
 * @param {*} pProductArr             アイテム場所配列   [{itemId: 1, item: A, locations:[...]}...]
 * @param {*} locInvMap               場所倉庫マッピング配列   [{locationId : A1 , invArr : [1,...]}...]
 * @returns [{item: AA, locations: [{location: loc, locationId: l1, actLast: [...], actNow: [...], fcOthersArr: [...], fcLastArr: [...], fcLastIds: [...]},...], },...]
 */
 function createFcActArr(pYearMonthObj, fcBpRes, fcBpColumns, fcOthersBpRes, fcOthersBpColumns, actualRes, actColumns, pProductArr, locInvMap) {
    // 検索結果件数
    var arrLen = 0;
    // その他担当者検索結果件数
    var arrOLen = 0;
    // 実績検索結果件数
    var actLen = 0;
    // アイテムの件数を取得
    var productNum = pProductArr.length;
    // アイテムFC配列
    var itemFcArr = new Array();

    // 検索結果がデータありの場合、件数を取得
    if (!isEmpty(fcBpRes)) {
        arrLen = fcBpRes.length;
    }
    // その他担当者検索結果がデータありの場合、件数を取得
    if (!isEmpty(fcOthersBpRes)) {
        arrOLen = fcOthersBpRes.length;
    }

    if (!isEmpty(actualRes)) {
        actLen = actualRes.length;
    }

    // アイテム毎のFC配列を作成
    for (var i = 0; i < productNum; i++) {
        // アイテムOBJ
        var itemFc = {item : pProductArr[i].item, itemName : pProductArr[i].itemName, itemId : pProductArr[i].itemId, locations : new Array()}
        // 場所の件数を取得
        var locLen = pProductArr[i].locations.length;
        // 場所の件数分の場所FC数OBJを作成し、アイテムOBJの場所FC数配列に格納
        for (var h = 0; h < locLen; h++) {
            itemFc.locations.push({location: pProductArr[i].locationsTxt[h],
                                            locationId: pProductArr[i].locations[h],
                                            actLast : ['', '', '', '', '', '', '', '', '', '', '', ''],
                                            actNow : ['', '', '', '', '', '', '', '', '', '', '', ''],
                                            fcOthersArr : ['', '', '', '', '', '', '', '', '', '', '', ''],
                                            fcLastArr : ['', '', '', '', '', '', '', '', '', '', '', ''],
                                            fcLastIds : ['', '', '', '', '', '', '', '', '', '', '', '']});
        }

        // 結果件数分ループ
        for (var j = 0; j < arrLen; j++) {
            // fcLastArrを設定する
            setFcValues(pProductArr[i], pYearMonthObj, itemFc, fcBpRes[j], fcBpColumns);
        }

        // その他担当者検索結果件数分ループ
        for (var k = 0; k < arrOLen; k++) {
            // fcOthersArrを設定する
            setOthersFcValues(pProductArr[i], pYearMonthObj, itemFc, fcOthersBpRes[k], fcOthersBpColumns);
        }

        // 実績検索結果件数分ループ
        for (var p = 0; p < actLen; p++) {
            // actLast,actNowを設定する
            setActValues(pProductArr[i], pYearMonthObj, itemFc, locInvMap, actualRes[p], actColumns);
        }

        // 返却配列に追加
        itemFcArr.push(itemFc);
    }

    return itemFcArr;
}

/**
 * FC数と前回FC数を指定の年月の位置に設定
 * @param {*} pProductObj
 * @param {*} pYearMonthObj
 * @param {*} itemFc
 * @param {*} fcBpObj
 * @param {*} columns
 */
function setFcValues(pProductObj, pYearMonthObj, itemFc, fcBpObj, columns) {

    // 同一アイテムの場合
    if (pProductObj.itemId == fcBpObj.getValue(columns[0])) {

        // 結果.場所が場所配列内のindexを取得
        var lpos = pProductObj.locations.indexOf(fcBpObj.getValue(columns[2]));

        // 年月配列のindexを取得
        var pos = pYearMonthObj.yyyyMMArr.indexOf(fcBpObj.getValue(columns[6]));
        //　年月配列に存在する場合
        if (lpos >= 0 && pos >= 0) {
            // 配列指定年月位置に格納
            itemFc.locations[lpos].fcLastArr[pos] = fcBpObj.getValue(columns[5]);
            itemFc.locations[lpos].fcLastIds[pos] = fcBpObj.getValue(columns[7]);
        }
    }
}

/**
 * その他担当者のアイテムFC数を指定の年月の位置に設定
 * @param {*} pProductObj
 * @param {*} pYearMonthObj
 * @param {*} itemFc
 * @param {*} fcOthersBpObj
 * @param {*} columns
 */
function setOthersFcValues(pProductObj, pYearMonthObj, itemFc, fcOthersBpObj, columns) {
    // 同一アイテムの場合
    if (pProductObj.itemId == fcOthersBpObj.getValue(columns[0])) {
        // 結果.場所が場所配列内のindexを取得
        var lpos = pProductObj.locations.indexOf(fcOthersBpObj.getValue(columns[2]));
        // 場所同一の場合
        if (lpos >= 0) {
            // 年月配列のindexを取得
            var pos = pYearMonthObj.yyyyMMArr.indexOf(fcOthersBpObj.getValue(columns[6]));
            //　年月配列に存在する場合
            if (pos >= 0) {
                // 配列指定年月位置に格納
                itemFc.locations[lpos].fcOthersArr[pos] = fcOthersBpObj.getValue(columns[5]);
            }
        }
    }
}

/**
 * 実績の数量を指定の年月の位置に設定
 * @param {*} pProductObj
 * @param {*} pYearMonthObj
 * @param {*} itemFc
 * @param {*} locInvMap
 * @param {*} actualObj
 * @param {*} columns
 */
function setActValues(pProductObj, pYearMonthObj, itemFc, locInvMap, actualObj, columns) {
    // 同一アイテムの場合
    if (pProductObj.itemId == actualObj.getValue(columns[0])) {
        // 結果.倉庫が場所配列内のindexを取得
        var actLPos = getActInvLocationPos(actualObj.getValue(columns[3]), locInvMap, pProductObj.locations);
        // 場所同一の場合
        if (actLPos >= 0) {
            // 日付
            var yyyyMON = actualObj.getValue(columns[1]);
            // 日付が空ではない場合
            if (!isEmpty(yyyyMON)) {
                var yyyyM =  yyyyMON.split('月')[0];//yyyyMON.substring(0, (yyyyMON.length - 2));
                // 年月配列のindexを取得
                nlapiLogExecution('debug',pYearMonthObj.yyyyMMArr) ;
                var dtPos = pYearMonthObj.yyyyMMArr.indexOf(yyyyM);
                if (dtPos >= 0) {
                    itemFc.locations[actLPos].actNow[dtPos] = actualObj.getValue(columns[2]);
                } else {
                    dtPos = pYearMonthObj.lastYyyyMMArr.indexOf(yyyyM);
                    if (dtPos >= 0) {
                        itemFc.locations[actLPos].actLast[dtPos] = actualObj.getValue(columns[2]);
                    }
                }
            }
        }
    }
}

/**
 * 実績検索結果の倉庫の所属場所を取得
 * @param {*} actualResInv
 * @param {*} locInvMap
 * @param {*} locations
 * @returns index or -1(not exist)
 */
function getActInvLocationPos(actualResInv, locInvMap, locations) {
    // 場所倉庫マッピング配列の件数
    var len = locInvMap.length;
    // インデックス
    var pos;
    // 件数分ループ
    for (var i = 0; i < len; i++) {
        // 実績結果の倉庫が当場所の倉庫配列中の位置を取得
        var invPos = locInvMap[i].invArr.indexOf(actualResInv);
        // 当場所の倉庫配列に存在する場合、ループを中止し、結果を返却
        if (invPos >= 0) {
            // 場所配列内のindexを取得
            pos = locations.indexOf(locInvMap[i].locationId);
            break;
        }
    }
    return pos;
}

/**
 * HTMLを作成
 * @param {*} yyyyMMObj  年月配列OBJ
 * @param {*} baseYear      基準日年
 * @param {*} baseMonth   基準日月
 * @param {*} fcActArr       予実結果配列
 * @param {*} userIdName  担当者IDと担当者名
 * @param {*} pSW            画面幅
 * @param {*} pSH             画面高さ
 */
function createHtmlNote(yyyyMMObj, baseYear, baseMonth, fcActArr, userIdName, pSW, pSH,subsidiary) {    //CSV
//    var csvMainString = '';
//    var csvDetailStr = '';
    // テーブル幅
    // var tbW = 'width:' + Number(pSW * 59 / 60) + 'px;';
    var tbW = 'width:1218px;';
    // テーブル高さ
    var tbH = 'height:' + Number(pSH * 59 / 60 - 250) + 'px;';
    // テーブルライン高さ
    var lineH = 'height:28px;';

    var htmlNote = '';

    htmlNote += '<div style="margin-bottom:5px;font-weight:900;font-size:24px;">('+nlapiLookupField('subsidiary',subsidiary,'legalname')+') FORECAST LIST</div>';
    htmlNote += '<div style="margin-bottom:5px;">';
    htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">Tanto    :    ' + userIdName.id + '</div>';
    htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">' + userIdName.name + '</div>';
    htmlNote += '<div style="display:inline-block;font-weight:bold;font-size:18px;color:red;margin-left:130px;">★★★　Actualは全Salesmanの合計数値です　★★★</div>';
    htmlNote += '</div>';
    htmlNote += '<div id="tablediv" style="overflow-y:scroll;' + tbH + tbW+'border:1px solid gray;border-bottom: 0;border-right: 0;">';
    htmlNote += '<table style="border-collapse:separate;width:1200px;font-size:15px;font-weight:bold;border-spacing:0;">';
    // 年月行を作成
    htmlNote += createYearMonthRows(yyyyMMObj, baseYear, baseMonth, lineH);
    // アイテムの予実数行のHTMLを作成
    htmlNote += createRowsForItems(yyyyMMObj, baseYear, baseMonth, fcActArr, lineH);
    htmlNote += '</tr>';
    htmlNote += '</table>';
    htmlNote += '</div>';
    return htmlNote;
}

/**
 * 年月行HTMLを作成
 * @param {*} yyyyMMObj  年月配列OBJ
 * @param {*} baseYear      基準日年
 * @param {*} baseMonth   基準日月
 * @param {*} lineH          ライン高さ
 * @returns HTML
 */
function createYearMonthRows(yyyyMMObj, baseYear, baseMonth, lineH) {
    // 年月行HTML
    var yearMonthHtml = '';
    // 月TDHTML
    var monthTds = '';
    // 年TDHTML
    var yearTds = '';
    // 空白TDHTML
    var blankTds = '';
    // 印刷日付
    var printDate = pagedate;

    //-------------month, year and blank td--------------------------------------------------------------------
    // 12ヵ月分のデータをループ
    for (var i = 0; i < 12; i++) {
        // 基準年月の場合、CSSを変更し、強調する
        if (baseMonth == yyyyMMObj.monthArr[i]) {
            monthTds+='<td style="border:1px solid gray;width:66px;background-color:#000080;color:#ffffff;">' + yyyyMMObj.monthArr[i] + '</td>';
            yearTds+= '<td style="border:1px solid gray;background-color:#000080;color:#ffffff;">' + yyyyMMObj.yearArr[i] + '</td>';
            blankTds+='<td style="border:1px solid gray;background-color:#000080;color:#ffffff;"></td>';
        } else {
            monthTds+='<td style="border:1px solid gray;width:66px;">' + yyyyMMObj.monthArr[i] + '</td>';
            yearTds+= '<td style="border:1px solid gray;">' + yyyyMMObj.yearArr[i] + '</td>';
            blankTds+='<td style="border:1px solid gray;"></td>';
        }
    }
    // 年月行を作成
    yearMonthHtml += '<thead style="position:sticky;top:0;z-index:2;">';
    yearMonthHtml += '<tr style="'+ lineH +'background-color:#9999FF;text-align:right;">';
    yearMonthHtml += '<td colspan="2" style="border-left:1px solid gray;border-top:1px solid gray;border-right:0px;border-bottom:0px;">PrintDate:</td>';
    yearMonthHtml += '<td style="border-top:1px solid gray;border-right:1px solid gray;border-left:0px;border-bottom:0px;">' + printDate + '</td>';
    yearMonthHtml += monthTds;
    yearMonthHtml += '</tr>';
    yearMonthHtml += '<tr style="'+ lineH +'background-color:#9999FF;text-align:right;">';
    yearMonthHtml += '<td colspan="2" style="border-left:1px solid gray;border-bottom:1px solid gray;border-right:0px;border-top:0px;"></td>';
    yearMonthHtml += '<td style="border-right:1px solid gray;border-bottom:1px solid gray;border-left:0px;border-top:0px;"></td>';
    yearMonthHtml += yearTds;
    yearMonthHtml += '</tr>';
    yearMonthHtml += '<tr style="'+ lineH +'background-color:#9999FF;text-align:right;">';
    yearMonthHtml += '<td colspan="2" style="border:1px solid gray;border-right:0px;">基準日：</td>';
    yearMonthHtml += '<td style="border:1px solid gray;border-left:0px;">' + baseYear + '/' + baseMonth +'</td>';
    yearMonthHtml += blankTds;
    yearMonthHtml += '</tr>';
    yearMonthHtml += '</thead>';

    return yearMonthHtml;
}

/**
 * アイテムの予実数行のHTMLを作成
 * @param {*} yyyyMMObj  年月配列OBJ
 * @param {*} baseYear      基準日年
 * @param {*} baseMonth   基準日月
 * @param {*} fcActArr       予実結果配列
 * @param {*} lineH          ライン高さ
 * @returns アイテムの予実数行のHTML
 */
function createRowsForItems (yyyyMMObj, baseYear, baseMonth, fcActArr, lineH) {
    // アイテムHTML
    var itemHtml = '';
    // アイテムの件数
    var itemLen = fcActArr.length;

    // アイテムの件数分をループ
    for (var i = 0; i < itemLen; i++) {
        itemHtml += '<tr style="'+ lineH +'background-color:#e6e6e6;">';;
        itemHtml += '<td colspan="3" style="border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">' + fcActArr[i].item + '</td>';
        itemHtml += '<td colspan="12" style="border:1px solid gray;border-left:0px;text-align:left;color:#0033cc;">' + fcActArr[i].itemName + '</td>';
        itemHtml += '</tr>';
        // 場所の件数
        var locLen = fcActArr[i].locations.length;
        // 場所の件数分をループ
        for (var l = 0; l < locLen; l++) {
            var actLast = '';
            var actNow = '';
            var fcLast = '';
            var fcOthers = '';
            var fcSelf = '';

            // 12ヵ月分のデータをループ
            for (var m = 0; m < 12; m++) {
                // (year - 1) actual数
                actLast += '<td style="border:1px solid gray;">' + fcActArr[i].locations[l].actLast[m] + '</td>';
                // year actual数
                actNow += '<td style="border:1px solid gray;">' + fcActArr[i].locations[l].actNow[m] + '</td>';
                // 自分以外FC数
                fcOthers += '<td style="border:1px solid gray;">' + fcActArr[i].locations[l].fcOthersArr[m] + '</td>';
                // 前回FC数
                fcLast += '<td style="border:1px solid gray;">' + fcActArr[i].locations[l].fcLastArr[m] + '</td>';
                // 比較/入力FC数
                var comparation = '0.0';
                // actual数と前回FC数両方ありの場合
                if (!isEmpty(fcActArr[i].locations[l].actNow[m]) && !isEmpty(fcActArr[i].locations[l].fcLastArr[m])) {
                    comparation = Math.round((fcActArr[i].locations[l].actNow[m]/fcActArr[i].locations[l].fcLastArr[m]) * 10) / 10;
                    comparation = comparation.toFixed(1);
                }
                // 基準日以降の月の場合、FC入力を入力ボックスに変更
                if (new Date(yyyyMMObj.yearArr[m], yyyyMMObj.monthArr[m], 1) > new Date()) {
                    var inputId = 'fcid:' + fcActArr[i].itemId+'|'+fcActArr[i].locations[l].locationId+'|'+ yyyyMMObj.yearArr[m] + yyyyMMObj.monthArr[m] + '|' + fcActArr[i].locations[l].fcLastIds[m];
                    if (comparation == '0.0') {
                        comparation = '';
                    }
                    fcSelf += '<td style="border:1px solid gray;padding:0;'+ lineH +'">';
                    fcSelf += '<input type="text" id="' + inputId + '" name="fcQuan" style="width:100%;height:100%;border:0px;padding:0px;background-color:#ffff99;text-align:right;font-size:15px;" value="';
                    fcSelf += comparation + '"/></td>';
                } else {
                    fcSelf += '<td style="border:1px solid gray;text-align:right;color:#134DF2;">' + comparation + '</td>';
                }
                
            }
            // (Year-1) title + monthly details
            itemHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
            itemHtml+='<td rowspan="5" style="border:1px solid gray;border-right:0px;width:110px;text-align:left;vertical-align:top;">' + fcActArr[i].locations[l].location + '</td>';
            itemHtml+='<td rowspan="2" style="border:1px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;">Actual</td>';
            itemHtml+='<td style="border:1px solid gray;text-align:left;width:128px;">(Year-1)</td>';
            itemHtml += actLast;
            itemHtml += '</tr>';
            // Year title + monthly details
            itemHtml+='</tr>';
            itemHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
            itemHtml+='<td style="border:1px solid gray;text-align:left;">Year</td>';
            itemHtml += actNow;
            itemHtml += '</tr>';
            // 自分以外 title + monthly details
            itemHtml+='</tr>';
            itemHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
            itemHtml+='<td rowspan="3" style="border:1px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;">Forecast</td>';
            itemHtml+='<td style="border:1px solid gray;text-align:left;">自分以外</td>';
            itemHtml += fcOthers;
            itemHtml += '</tr>';
            // 前回 title + monthly details
            itemHtml+='</tr>';
            itemHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
            itemHtml+='<td style="border:1px solid gray;text-align:left;">前回</td>';
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
            itemHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;">';
            itemHtml+='<td style="border:1px solid gray;text-align:left;"><span style="color:#134DF2;">比較</span><span style="' + colorForSlash + '">／</span><span style="' + colorForInput + '">入力</span></td>';
            itemHtml += fcSelf;
            itemHtml += '</tr>';
        }
    }
    return itemHtml;
}
/**
 * Csv main data
 * @param {*} yyyyMMObj  年月配列OBJ
 * @param {*} baseYear      基準日年
 * @param {*} baseMonth   基準日月
 * @param {*} fcActArr       予実結果配列
 * @param {*} lineH          ライン高さ
 * @returns アイテムの予実数行のCsv
 */
//20221010 add by zhou U395 start
function createCsvNote (userIdName,yyyyMMObj, baseYear, baseMonth, fcActArr,pDate,sub) {
    //CSV
	var lineNum = 0;
	var subsidiary = sub;
	var subsidiaryRecord = nlapiLoadRecord('subsidiary', subsidiary);
	var subsidiaryName = subsidiaryRecord.getFieldValue('name');
    // アイテムString
    var csvMainString = '';
    var csvDetailStr = '';
    // アイテムの件数
    var itemLen = fcActArr.length;
    var userId = userIdName.id;
    //DJ_BP user internalid get
    var employeeSearch = nlapiSearchRecord("employee",null,
    		[
    		 ["custentity_djkk_employee_id","is", userId]
    		], 
    		[
    		 new nlobjSearchColumn("internalid")
    		]
    		);
    if(!isEmpty(employeeSearch)){
		var userInternalid= employeeSearch[0].getValue('internalid');
    }
    // アイテムの件数分をループ
    for (var i = 0; i < itemLen; i++) {
    	//item internalid get
    	var itemId = fcActArr[i].item;
		var itemInternalid= fcActArr[i].itemId;
        // 場所の件数
        var locLen = fcActArr[i].locations.length;
        // 場所の件数分をループ
        for (var l = 0; l < locLen; l++) {
            var actLast = '';
            var actNow = '';
            var fcLast = '';
            var fcOthers = '';
            var fcSelf = '';

            // 12ヵ月分のデータをループ
            for (var m = 6; m < 12; m++) {
                // 比較/入力FC数
                var comparation = '0.0';
                // actual数と前回FC数両方ありの場合
                if (!isEmpty(fcActArr[i].locations[l].actNow[m]) && !isEmpty(fcActArr[i].locations[l].fcLastArr[m])) {
                    comparation = Math.round((fcActArr[i].locations[l].actNow[m]/fcActArr[i].locations[l].fcLastArr[m]) * 10) / 10;
                    comparation = comparation.toFixed(1);
                }
                // 基準日以降の月の場合、FC入力を入力ボックスに変更
                if (new Date(yyyyMMObj.yearArr[m], yyyyMMObj.monthArr[m], 1) > new Date()) {
                    if (comparation == '0.0') {
                        comparation = '';
                    }
                }
                lineNum++;
                var recordDetailId =  defaultEmpty(fcActArr[i].locations[l].fcLastIds[m]);
                var location = fcActArr[i].locations[l].location;
                var locationid = fcActArr[i].locations[l].locationId;
                var userName = userIdName.id +" "+ userIdName.name;
//                var userId = userIdName.id;
                var itemName = replace(fcActArr[i].itemName);
//                var itemId = fcActArr[i].item
                var year = yyyyMMObj.yearArr[m];
                var month = ('0' + yyyyMMObj.monthArr[m]).substr(-2);
                var theBaseDate = pDate;
                var lastYearQuantity = fcActArr[i].locations[l].actLast[m];
                var nowYearQuantity = fcActArr[i].locations[l].actNow[m];
                var fcOthersQuantity = fcActArr[i].locations[l].fcOthersArr[m];
                var fcBeforeQuantity = fcActArr[i].locations[l].fcLastArr[m]
//                csvDetailStr += userIdName[singleUserId][1]+","fcAcArr[i].itemName+","yyyyMMObj.yearArr[m]+","yyyyMMObj.monthArr[m]+","+new Date(baseYear, baseMonth, 1)+","+fcAcArr[i].locations[l].actLast[m]+","+fcAcArr[i].locations[l].actNow[m]+","+fcAcArr[i].locations[l].fcOthersArr[m]+","+comparation;
                csvDetailStr += lineNum+","+recordDetailId+","+sub+","+userInternalid+","+itemInternalid+","+locationid+","+subsidiaryName+","+location+","+userName+","+itemName+","+itemId+","+year+","+month+","+theBaseDate+","+lastYearQuantity+","+nowYearQuantity+","+fcOthersQuantity+","+fcBeforeQuantity+","+comparation;
                csvDetailStr += "\r\n";
               
            }
        } 
    }
    csvMainString += '行番号,レコード内部ID,DJ_連結内部ID,DJ_担当者コード内部ID,DJ_商品内部ID,DJ_場所エリア内部ID,DJ_連結,DJ_場所エリア,DJ_担当者コード,DJ_商品名,DJ_商品コード,DJ_年,DJ_月,基準日,(Year-1),Year,自分以外,前回,比較／入力\r\n'+csvDetailStr;
    return csvMainString;
}
function csvDown(xmlString){
	try{
	
		var xlsFile = nlapiCreateFile('営業計画情報レポート_LS' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
		
		xlsFile.setFolder(FILE_CABINET_ID_FC_CSV_DOWNLOAD_BP);
		xlsFile.setName('営業計画情報レポート_LS' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setEncoding('SHIFT_JIS');
	    
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		var fl = nlapiLoadFile(fileID);
		var url= fl.getURL();
		return url; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', '', e.message)
	}

}
function replace(text){
if ( typeof(text)!= "string" )
   text = String(text);

text = text.replace(/,/g, "_") ;

return text ;
}
function defaultEmpty(src){
	return src || '';
}
//zhou end