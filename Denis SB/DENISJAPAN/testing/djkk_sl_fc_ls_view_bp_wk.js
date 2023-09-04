/**
 * 販売計画情報レポート_LS_Week
 *
 * Version    Date            Author           Remarks
 * 1.00       2022/07/11     CPC_王
 *
 */
var pagedate=nlapiDateToString(getSystemTime());
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	nlapiLogExecution('debug','営業計画情報レポート_LS_Week','start')
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
    // request parameter: 商品名リスト
    var rpProductNms = request.getParameter('productNm');
    // request parameter: ブランド名リスト
    var rpBrandNms = request.getParameter('brandNm');
    // request parameter: 画面幅
    var rpSW = request.getParameter('width');
    // request parameter: 納品先
    var delivery = request.getParameter('delivery');
    // request parameter: 画面高さ
    var rpSH = request.getParameter('height');
 
    // 画面HTML
    var htmlNote ='';
    // ログインユーザを取得
//    var user = nlapiGetUser();
    var user= request.getParameter('user');
//    var user= request.getParameter('user');
    // 営業計画情報レポートフォームを作成　（名前は販売計画へ変更）
    var form = nlapiCreateForm('販売計画情報レポート_WEEK_LS', (operation == 's'));
    // client scriptを設定
    form.setScript('customscript_djkk_cs_fc_ls_view_bp_wk');
    // 検索の場合
    if (operation == 's') {
    	// 検索を実施
        var htmlAndExcelXMLObj = doSearch(user, date, rpBrand, rpProductCodes, rpBrandNms, rpProductNms, rpSW, rpSH,subsidiary);
     // ExcelダウンロードURL取得
        var excelExportURL = createExcelURL(htmlAndExcelXMLObj.xmlNote, htmlAndExcelXMLObj.xmlRowCnt);
        // 検索を実施、結果HTMLを作成する
        htmlNote += htmlAndExcelXMLObj.htmlNote;
        var delivery = htmlAndExcelXMLObj.deliveryArray;
        // 画面にボタンを追加
        form.addButton('custpage_exportExcel', 'Excel出力', excelExportURL);
        form.addButton('custpage_backToSearch', '検索に戻る', 'backToSearch();');
        // 画面hidden項目を作成、次画面引継ぐ用
        createHiddenItems(form, date, rpBrand, rpProductCodes,subsidiary,user,delivery);
    }
    // データ更新の場合
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
    // 納品先フィールドを作成
//    var deliverySelector = pForm.addField('custpage_delivery', 'multiselect', '納品先', null, 'custpage_group_filter');
    // BPフィールドを作成
    var userField=pForm.addField('custpage_user', 'multiselect', 'BP', null,'custpage_group_filter');
	
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
    // ブランドフィールドを作成
    var brandSelector = pForm.addField('custpage_brand', 'multiselect', 'ブランド', null, 'custpage_group_filter');
    // 商品名フィールドを作成
    var itemSelector = pForm.addField('custpage_item', 'multiselect', '商品名', null, 'custpage_group_filter');

    // 基準日を必須に設定
    dateField.setMandatory(true);

    // 連結を必須に設定
    subsidiaryField.setMandatory(true);
    // 前画面の基準日項目をresponse画面に再設定
    if(isEmpty(pDate)){
    	pDate=nlapiDateToString(getSystemTime());
    }
    pagedate=pDate;
    dateField.setDefaultValue(pDate);
    // 各入力のサイズを設定
    dateField.setDisplaySize(80,1);
    subsidiaryField.setDisplaySize(240,15);
    brandSelector.setDisplaySize(240,15);
    itemSelector.setDisplaySize(240,15);
    userField.setDisplaySize(240,15);
//    deliverySelector.setDisplaySize(240,9);

    
    // REQUEST前の選択値を再設定する
    if(!isEmpty(subsidiary)){
    subsidiaryField.setDefaultValue(subsidiary);
    }else{
    	//var userSub=nlapiLookupField('employee', nlapiGetUser(), 'subsidiary');
    	var userSub=getRoleSubsidiary();
    	 subsidiaryField.setDefaultValue(userSub);
    	 subsidiary=userSub;
    }
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
    
	 // REQUEST前の選択値を再設定する
    if(!isEmpty(subsidiary)){
    subsidiaryField.setDefaultValue(subsidiary);
    }else{
    	//var userSub=nlapiLookupField('employee', nlapiGetUser(), 'subsidiary');
    	var userSub=getRoleSubsidiary();
    	 subsidiaryField.setDefaultValue(userSub);
    	 subsidiary=userSub;
    }
    
    var bpSearch = nlapiSearchRecord("customrecord_djkk_person_registration_ls",null,
    		[
    		   ["custrecord_djkk_bp_ls","noneof","@NONE@"], 
                "AND", 
                ["custrecord_djkk_subsidiary_bp_ls","anyof",subsidiary	]
    		], 
    		[
    		   new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_BP_LS","GROUP").setSort(false), 
    		   new nlobjSearchColumn("entityid","CUSTRECORD_DJKK_BP_LS","GROUP")
    		]
    		);
    // request parameter商品コードリストがブランでない場合、分割しする
    var userCdArr = new Array();
    if (!isEmpty(pUser)) {
    	userCdArr = pUser.split('');
    }
    if (!isEmpty(bpSearch)) {
    	// アイテム件数
        var bpl = bpSearch.length;
        // 1件以上の場合、先頭に「-すべて-」の選択肢を作成
        if (bpl > 1) {
        	userField.addSelectOption('ALL', '-すべて-', (userCdArr.indexOf('ALL') >= 0));
        }
    }
    if (isEmpty(pUser)) {
    	pUser='ALL';
    	userField.setDefaultValue(pUser);
    }
    if (!isEmpty(bpSearch)) {
	for(var bps=0;bps<bpSearch.length;bps++){
		// 選択状態
        var bpIsSelected = (userCdArr.indexOf(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP")) >= 0);	
		userField.addSelectOption(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP"), bpSearch[bps].getValue("entityid","CUSTRECORD_DJKK_BP_LS","GROUP"),bpIsSelected);				
	}
    }
	userField.setMandatory(true);
	
	
//	// 納品先  U533追加
//    var deliverySearch = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
//    		[
//    		   ["internalid","isnotempty",""], 
//    		   'AND',
//    		   ["custrecord_djkk_delivery_in_sheet","noneof","@NONE@"],
//    		   "AND", 
//    		   ["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiary]
//    		], 
//    		[
//    		   new nlobjSearchColumn("name","CUSTRECORD_DJKK_DELIVERY_IN_SHEET","GROUP"),
//    		   new nlobjSearchColumn("custrecord_djkk_delivery_in_sheet",null,"GROUP").setSort(false)
//    		]
//    		);
//    var deliveryArr = new Array();
//    if (!isEmpty(delivery)) {
//    	deliveryArr = delivery.split('');
//    }
//    if (!isEmpty(deliverySearch)) {
//        // 1件以上の場合、先頭に「-すべて-」の選択肢を作成
//        if (deliverySearch.length > 1) {
//        	deliverySelector.addSelectOption('ALL', '-すべて-', (deliveryArr.indexOf('ALL') >= 0));
//        }
//    }
//    if (isEmpty(delivery)) {
//    	delivery='ALL';
//    	deliverySelector.setDefaultValue(delivery);
//    }
//    if (!isEmpty(deliverySearch)) {
//	for(var del =0;del<deliverySearch.length;del++){
//		// 選択状態
//        var deliverySelected = (deliveryArr.indexOf(deliverySearch[del].getValue("custrecord_djkk_delivery_in_sheet",null,"GROUP")) >= 0);	
//        deliverySelector.addSelectOption(deliverySearch[del].getValue("custrecord_djkk_delivery_in_sheet",null,"GROUP"), deliverySearch[del].getValue("name","CUSTRECORD_DJKK_DELIVERY_IN_SHEET","GROUP"),deliverySelected);				
//	}
//    }
//    deliverySelector.setMandatory(true);

    // 検索ボタンを作成
    pForm.addButton('custpage_viewforecastlist', '検索', 'viewForecastList();');
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
	var nameArray={};
	var userArray=new Array();
    // 担当者名
    var name = '';
    // 担当者ID
    // var id = '';
    // 検索フィルター
    var filters = [];
    // 検索項目配列
    var columns = [];

    // フィルター
    filters.push(["custrecord_djkk_bp_ls","noneof","@NONE@"]);
    if(pUser!='ALL'){
    	filters.push('and');
    	filters.push(["custrecord_djkk_bp_ls.internalid","anyof", pUser.split('')]);
    }
    // 検索項目配列
    columns.push(new nlobjSearchColumn("externalid","CUSTRECORD_DJKK_BP_LS","GROUP"));
    columns.push(new nlobjSearchColumn("lastname","CUSTRECORD_DJKK_BP_LS","GROUP"));
    columns.push(new nlobjSearchColumn("firstname","CUSTRECORD_DJKK_BP_LS","GROUP"));
    columns.push(new nlobjSearchColumn("custentity_djkk_employee_id","CUSTRECORD_DJKK_BP_LS","GROUP"));
    columns.push(new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_BP_LS","GROUP").setSort(false));

    // 担当者名検索
    var sRes = getSearchResults('customrecord_djkk_person_registration_ls', null, filters, columns);

    // 担当者名検索結果、データありの場合
    if(!isEmpty(sRes)) {
    	for(var i=0;i<sRes.length;i++){
    		var lastname=sRes[i].getValue(columns[1]);
    		if(lastname=='- None -'){
    			lastname='';
    		}
    		var firstname=sRes[i].getValue(columns[2]);
    		if(firstname=='- None -'){
    			firstname='';
    		}
    		userArray.push(sRes[i].getValue(columns[4]));
    		// id = sRes[0].getValue(columns[0]);
    		nameArray[sRes[i].getValue(columns[4])]= [ lastname+ firstname,sRes[i].getValue(columns[3])];
    	}       
    }

    return {userArray  : userArray,nameArray  : nameArray};
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
 * 納品先名前、idを取得
 * @param {*} 納品先 ID
 * @returns 納品先名
 */
function doDeliveryValueSearch(delivery) {
	var deliveryNameArray={};
	var deliveryIdArray=new Array();
    // 納品先名
    var name = '';
    // 納品先ID
    // 検索フィルター
    var filters = [];
    filters.push(["internalid","isnotempty",""]);
    filters.push('AND');
	filters.push(["custrecord_djkk_delivery_in_sheet","noneof","@NONE@"]);
    if(delivery!='ALL'){
    	filters.push('AND');
    	filters.push(["custrecord_djkk_delivery_in_sheet","anyof",delivery.split('')]);
    }
    // 検索項目配列
    var columns = [];

    // 項目
    columns.push(new nlobjSearchColumn("custrecord_djkk_delivery_in_sheet",null,"GROUP").setSort(false));
    columns.push(new nlobjSearchColumn("name","CUSTRECORD_DJKK_DELIVERY_IN_SHEET","GROUP"));
    
    // 納品先検索
    var dRes = getSearchResults('customrecord_djkk_so_forecast_ls', null, filters, columns);

    // 納品先検索結果、データありの場合
    if(!isEmpty(dRes)) {
    	for(var i=0;i<dRes.length;i++){
    		var id=dRes[i].getValue(columns[0]);
    		var name=dRes[i].getValue(columns[1]);
    		deliveryIdArray.push(id);
    		deliveryNameArray[id]= name;
    	}       
    }
    nlapiLogExecution('debug','deliveryNameArray',JSON.stringify(deliveryNameArray))
    return {deliveryIdArray  : deliveryIdArray,deliveryNameArray  : deliveryNameArray};
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
    if(!isEmpty(pUser) && pUser != 'ALL'){
    	filter.push(['custrecord_djkk_bp_ls', 'is', pUser.split('')]);
    	filter.push('and');
    }
    
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
function doSearch(pUser, date, pBrand, pProductCodes,pBrandNms, pProductNms, pSW, pSH,subsidiary,delivery) {
	var screenHeight=pSH;
	var screenWidth=pSW;
	var tableHeight='height:'+Number(screenHeight*59/60-270)+'px;';//'height:600px;';//600
	var tableWidth='width:'+Number(screenWidth*59/60)+'px;';//'width:1220px;';//1220
	var trtdHeight=28;//28
	var tableCloum1=62;//62
	var tableCloum2=126;//126
	var tableCloum3=254;//254
	var htmlNote ='';
	var xmlNote = '';
	var xmlRowCnt = 0;
	var htmlAndExcelXMLObj;
	var itemIdArray=pProductCodes.split('');
	var itemArr =doItemSearch(pUser, pBrand, pProductCodes,subsidiary);
	 if (isEmpty(itemArr) || itemArr.ids.length == 0) {
	        htmlNote += '<p color="red">担当している商品は存在しません。</p>';
	    } else {
	    	//納品先を取得
//	    	var deliveryData = doDeliveryValueSearch(delivery);
//	    	nlapiLogExecution('debug','delivery',delivery)
//	    	nlapiLogExecution('debug','stringify delivery',JSON.stringify(deliveryData))
	    	var deliveryArray=new Array();
//	    	if(delivery!='ALL'){
//	    		deliveryArray=delivery.split('');
//	    	}else{
//	    		deliveryArray=deliveryData.deliveryIdArray;
//	    	}
//	        var deliveryIdName = deliveryData.deliveryNameArray;	
	    	
	    	var deliveryIdName = []
	    	
	    	 
	    	// 担当者名を取得
	        var userData = doUserSearch(pUser);
	    	var userArray=new Array();
	    	if(pUser!='ALL'){
	    		userArray=pUser.split('');
	    	}else{
	    		userArray=userData.userArray;
	    	}
	    	var userIdName=userData.nameArray;
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
//		  var employeeSearch=nlapiLookupField('employee',pUser,['custentity_djkk_employee_id','lastname','firstname']);
		
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
			
//			var deliveryArray = [];
//			var deliveryIdName = {};
//			var delieverId = '';
			var soOutSearchArray = new Array();
			 nlapiLogExecution('debug','userArray',userArray)
			for(var q = 0; q < userArray.length; q++){
//				for(var e = 0; e < deliveryArray.length; e++){
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
//					   "AND",
//					   ["salesrep.internalId","anyof",userArray[q]],
//					   "AND", 
//					   ["custbody_djkk_delivery_destination","anyof",'26']
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
							nlapiLogExecution('debug','salesorderSearch.length',salesorderSearch.length)
							for (var sos = 0; sos < salesorderSearch.length; sos++) {
							var columnID = salesorderSearch[sos].getAllColumns();
							var delieverId = salesorderSearch[sos].getValue(columnID[5]);
							var delieverName = salesorderSearch[sos].getValue(columnID[6]);
							nlapiLogExecution('debug','delieverName',delieverName)
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
							soOutSearchArray.push([itemArr.ids[aIs], soItemArray, userArray[q],delieverId]);
						}
					}else{
						for (var aIs = 0; aIs < itemArr.ids.length; aIs++) {
							var soItemArray = new Array();
							soItemArray.push([     '',
			            	                        '',
			            	                        '',
			            	                        '']);
						}
			            	 soOutSearchArray.push([itemArr.ids[aIs], soItemArray, userArray[q]]);
		
					}	
//				}	
			}
				
			deliveryArray = unique(deliveryArray)
	   // SO-OUT-Search END
		  
		/*******************fc前回******************/
		  var fcSearchArray=new Array();
		  for(var w = 0; w < userArray.length; w++){
			  for(var n = 0; n < deliveryArray.length; n++){
				  var filters = [];
			      filters.push(["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiary]);
			      filters.push('AND');
				  filters.push(["custrecord_djkk_so_fc_ls_item","anyof",itemArr.ids]);
				  filters.push('AND');
				  filters.push(["custrecord_djkk_so_fc_ls_employee","anyof",userArray[w]]);
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
							fcSearchArray.push([itemArr.ids[aIa], fcDataArray,userArray[w],deliveryArray[n]]);
		
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
					            	 fcSearchArray.push([itemArr.ids[aIa], fcDataArray,userArray[w],deliveryArray[n]]);
				  }
		  	  }
		  }

		  
		/*************************************/
		  
		  /*******************自分以外FC******************/
		  var otherFcSearchArray=new Array();
		  for(var i = 0; i < userArray.length; i++){
			  for(var z = 0; z < deliveryArray.length; z++){
				  var filters = [];
			      filters.push(["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiary]);
			      filters.push('AND');
				  filters.push(["custrecord_djkk_so_fc_ls_item","anyof",itemArr.ids]);
				  filters.push('AND');
				  filters.push(["custrecord_djkk_so_fc_ls_employee","noneof",userArray[i]]);
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
//						     new nlobjSearchColumn("custrecord_djkk_delivery_in_sheet",null,"GROUP")
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
							otherFcSearchArray.push([itemArr.ids[oaIa], otherFcDataArray,userArray[i],deliveryArray[z]]);
						}			
				  }else{
						for (var oaIa = 0; oaIa < itemArr.ids.length; oaIa++) {
							  var otherFcDataArray = new Array();
								otherFcDataArray.push([ '',
				            	                        '',
				            	                        '',
				            	                        '']);
						}	
								otherFcSearchArray.push([itemArr.ids[aIa], otherFcDataArray,userArray[i],deliveryArray[z]]);
				  }
				  
		  }
		  }
		  
		/*************************************/
		//----------------HTML header line-------------------------------
		htmlNote += '<div style="margin-bottom:5px;font-weight:900;font-size:24px;">('+nlapiLookupField('subsidiary',subsidiary,'legalname')+') FORECAST LIST</div>';
	    htmlNote += '<div style="margin-bottom:5px;">';
	    
	    htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;"></div>';
//	    htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">Tanto    :    ' + employeeSearch.custentity_djkk_employee_id + '</div>';
//	    htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">' + employeeSearch.lastname+employeeSearch.firstname+'</div>';
	    htmlNote += '<div style="display:inline-block;font-weight:bold;font-size:18px;color:red;margin-left:130px;">★★★　Actualは全Salesmanの合計数値です　★★★</div>';
	    htmlNote += '</div>'; 	    
	    //----------------XML header line-------------------------------
	    xmlNote += '<Row ss:Height="17.25">';
	    xmlNote += '<Cell ss:MergeAcross="4"><Data ss:Type="String">('+nlapiLookupField('subsidiary',subsidiary,'legalname')+') FORECAST LIST</Data></Cell>';
	    xmlNote += '</Row>';
	    xmlNote += '<Row  ss:Index="4">';
//	    xmlNote += '<Cell><Data ss:Type="String">Tanto    :    ' + employeeSearch.custentity_djkk_employee_id + '</Data></Cell>';
	    xmlNote += '<Cell ss:Index="5" ss:StyleID="s50"><Data ss:Type="String">★★★　Actualは全Salesmanの合計数値です　★★★</Data></Cell>';
	    xmlNote += '</Row>';		
	    xmlNote += '<Row>';
	    xmlNote += '</Row>';

	    
	    htmlNote +='<div id="tablediv" style="overflow:scroll;'+tableWidth+tableHeight+'border:1px solid gray;border-bottom: 0;border-right: 0;">';
		htmlNote += '<table id="tableList" cellspacing="0" border="0" cellpadding="0" style="border-collapse:separate;width:3721px;table-layout: fixed;">';
		htmlNote += '<thead style="position:sticky;top:0;z-index:2;">';
		htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#9999FF;font-weight:bold;text-align:right;">';
		htmlNote += '<td colspan="2" rowspan="2" style="position:sticky;left:0;z-index:2;background-color:#9999FF;border:1px solid gray;border-right:0px;vertical-align:top;">PrintDate:</td>';
		htmlNote += '<td rowspan="2" style="position:sticky;left:'+tableCloum2+'px;z-index:2;background-color:#9999FF;border:1px solid gray;border-left:0px;vertical-align:top;">'+ date + '</td>';
		
	    xmlNote += '<Row>';
	    xmlNote += '<Cell ss:StyleID="s51"/>';
	    xmlNote += '<Cell ss:StyleID="s51"><Data ss:Type="String">PrintDate: '+ date + '</Data></Cell>';
	    xmlNote += '<Cell ss:StyleID="s51"/>';
	    

		for (var wk = 0; wk < 54; wk++) {
			if(dateArray[wk][4]){
				htmlNote += '<td style="border:1px solid gray;background-color:#000080;color:#ffffff;">'+ dateArray[wk][0] + '</td>';
				xmlNote += '<Cell ss:StyleID="s54"><Data ss:Type="Number">'+ dateArray[wk][0] + '</Data></Cell>';
			}else{
				htmlNote += '<td style="border:1px solid gray;">'+ dateArray[wk][0] + '</td>';
				xmlNote += '<Cell ss:StyleID="s53"><Data ss:Type="Number">'+ dateArray[wk][0] + '</Data></Cell>';
			}
		}
		
		htmlNote += '</tr>';
		xmlNote += '</Row>';
		htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#9999FF;font-weight:bold;text-align:right;">';
		xmlNote += '<Row>';
	    xmlNote += '<Cell ss:StyleID="s52"/>';
	    xmlNote += '<Cell ss:StyleID="s52"></Cell>';
	    xmlNote += '<Cell ss:StyleID="s52"/>';
		
		for (var ye = 0; ye < 54; ye++) {
			if(dateArray[ye][4]){
				htmlNote += '<td style="border:1px solid gray;background-color:#000080;color:#ffffff;">'+ dateArray[ye][1] + '</td>';
				xmlNote += '<Cell ss:StyleID="s54"><Data ss:Type="Number">'+ dateArray[ye][1] + '</Data></Cell>';
			}else{
			    htmlNote += '<td style="border:1px solid gray;">'+ dateArray[ye][1] + '</td>';
			    xmlNote += '<Cell ss:StyleID="s53"><Data ss:Type="Number">'+ dateArray[ye][1] + '</Data></Cell>';
			}
		}

		htmlNote += '</tr>';
		xmlNote += '</Row>';
		htmlNote += '<tr style="height:'+trtdHeight+'px;background-color:#9999FF;font-weight:bold;text-align:right;">';
		htmlNote += '<td colspan="2" style="position:sticky;left:0;z-index:2;background-color:#9999FF;border:1px solid gray;border-right:0px;">基準日：</td>';
		htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:2;background-color:#9999FF;border:1px solid gray;border-left:0px;">'+ date + '</td>';
		xmlNote += '<Row>';
	    xmlNote += '<Cell ss:StyleID="s52"/>';
	    xmlNote += '<Cell ss:StyleID="s52"><Data ss:Type="String">基準日： '+ date + '</Data></Cell>';
	    xmlNote += '<Cell ss:StyleID="s52"/>';
		for (var sd = 0; sd < 54; sd++) {
			if(dateArray[sd][4]){
				htmlNote += '<td style="border:1px solid gray;background-color:#000080;color:#ffffff;">'+ dateArray[sd][2] + '</td>';
				xmlNote += '<Cell ss:StyleID="s54"><Data ss:Type="String">'+ dateArray[sd][2] + '</Data></Cell>';
			}else{
			htmlNote += '<td style="border:1px solid gray;">'+ dateArray[sd][2] + '</td>';
			xmlNote += '<Cell ss:StyleID="s53"><Data ss:Type="String">'+ dateArray[sd][2] + '</Data></Cell>';
			}
		}
		htmlNote += '</tr>';
		htmlNote += '</thead>';
		xmlNote += '</Row>';
		
		 // アイテムHTML
	    var itemHtml = '';
	    var itemXml = '';
	    /*******************************************************************************************/
        for(var userF=0;userF<userArray.length;userF++){
        	var singleUserId=userArray[userF];
	        // HTML
	        itemHtml += '<tr style="height:28px;background-color:#828287;">';
	        itemHtml += '<td colspan="3" style="border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">納品先    :    ' + userIdName[singleUserId][1] + '</td>';
	        itemHtml += '<td colspan="54" style="border:1px solid gray;border-left:0px;text-align:left;color:#0033cc;">' + userIdName[singleUserId][0] + '</td>';
	        itemHtml += '</tr>';
	        
	        // XML
	        itemXml += '<Row ss:AutoFitHeight="0">';
	        itemXml += '<Cell ss:StyleID="S17"><Data ss:Type="String">Tanto    :    ' + userIdName[singleUserId][1] + '</Data></Cell>';
	        itemXml += '<Cell ss:StyleID="S18"/><Cell ss:StyleID="S18"/>';
	        itemXml += '<Cell ss:StyleID="S18"><Data ss:Type="String">' + userIdName[singleUserId][0] + '</Data></Cell>';
	        for (var sj = 0; sj < 53; sj++) {
	        	itemXml += '<Cell ss:StyleID="S18"/>';
	        }
	        itemXml += '<Cell ss:StyleID="S19"/>';
	        itemXml += '</Row>';
	        /***************************************************************************************/
        	for(var n=0;n<deliveryArray.length;n++){
                var deliveryId=deliveryArray[n];
    	        // HTML
    	        itemHtml += '<tr style="height:28px;background-color:#99AABA;">';
    	        itemHtml += '<td colspan="5" style="border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">納品先    :    ' + deliveryIdName[deliveryId] + '</td>';
    	        itemHtml += '<td colspan="52" style="border:1px solid gray;border-left:0px;text-align:left;color:#0033cc;"></td>';
    	        itemHtml += '</tr>';
    	        
    	        // XML
    	        itemXml += '<Row ss:AutoFitHeight="0">';
    	        itemXml += '<Cell ss:StyleID="S17"><Data ss:Type="String">Tanto    :    ' + deliveryIdName[deliveryId] + '</Data></Cell>';
    	        itemXml += '<Cell ss:StyleID="S18"/><Cell ss:StyleID="S18"/>';
    	        itemXml += '<Cell ss:StyleID="S18"><Data ss:Type="String"></Data></Cell>';
    	        for (var vf = 0; vf < 53; vf++) {
    	        	itemXml += '<Cell ss:StyleID="S18"/>';
    	        }
    	        itemXml += '<Cell ss:StyleID="S19"/>';
    	        itemXml += '</Row>';
    	        // アイテムの件数分をループ
			    for (var i = 0; i < itemArr.ids.length; i++) {
			    	var inforItemId=itemArr.productArr[i].itemId;
			        itemHtml += '<tr style="background-color:#e6e6e6;">';
			        itemHtml += '<td colspan="3" style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">'+itemArr.productArr[i].item+'</td>';
			        itemHtml += '<td colspan="10" style="position:sticky;left:'+tableCloum2+'px;background-color:#e6e6e6;z-index:1;border:1px solid gray;border-left:0px;border-right:0px;text-align:left;color:#0033cc;">'+itemArr.productArr[i].itemName+'</td>';
			        itemHtml += '<td colspan="44" style="background-color:#e6e6e6;border:1px solid gray;border-left:0px;text-align:left;color:#0033cc;"></td>';
			        itemHtml += '</tr>';
			        
			        itemXml += '<Row>';
			        itemXml += '<Cell ss:StyleID="s55"><Data ss:Type="String">testcode01： '+itemArr.productArr[i].item+'</Data></Cell>';
			        itemXml += '<Cell ss:StyleID="s55"></Cell>';
			        itemXml += '<Cell ss:StyleID="s55"></Cell>';
			        itemXml += '<Cell ss:StyleID="s55" ss:MergeAcross="53"><Data ss:Type="String">'+itemArr.productArr[i].itemName+'</Data></Cell>';
			        itemXml += '</Row>';
			        
			        
			        // 場所の件数分をループ
			        for (var l = 0; l < itemArr.productArr[i].locations.length; l++) {
			            var actLast = '';
			            var actNow = '';
			            var fcLast = '';
			            var fcOthers = '';
			            var fcSelf = '';
			            var actLastXml = '';
			            var actNowXml = '';
			            var fcLastXml = '';
			            var fcOthersXml = '';
			            var fcSelfXml = '';
			            
			            var inforLocationId=itemArr.productArr[i].locations[l];
		
			            // 54ヵweek分のデータをループ
			            for (var m = 0; m < 54; m++) {
			             /*****OUT(Year-1)*******/
			            	var WeekNum=Number(Number(dateArray[m][1])-1)+'-'+dateArray[m][0];
							var lastYearData = '';
							var wkFirstDay='';
							for(var sisa=0;sisa<soOutSearchArray.length;sisa++){
								if(soOutSearchArray[sisa][2] == singleUserId) {
									if(soOutSearchArray[sisa][3] == deliveryId) {
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
							}
			            /***********************/
						/*******OUT(Year)*******/					
							var WeekNumy=dateArray[m][1]+'-'+dateArray[m][0];
							var yearData = '';
							var wkFirstDayy='';
							for(var sisa=0;sisa<soOutSearchArray.length;sisa++){
								if(soOutSearchArray[sisa][2] == singleUserId) {
									if(soOutSearchArray[sisa][3] == deliveryId) {
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
							}
		
						/***********************/	
			            /********fc前回**********/
			              var fcLastDate=''; 
			              var fcWeekId='';
						  for (var fosa = 0; fosa < fcSearchArray.length; fosa++) {
							  if(fcSearchArray[fosa][2] == singleUserId) {
								  if(fcSearchArray[fosa][3] == deliveryId) {
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
						  }
						  /***********************/	
						  /****** 自分以外FC*******/
						  var otherFcLastDate=''; 
						  for (var ofosa = 0; ofosa < otherFcSearchArray.length; ofosa++) {
							  if(otherFcSearchArray[ofosa][2] == singleUserId) {
								  if(otherFcSearchArray[ofosa][3] == deliveryId) {
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
			                actLastXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">'+lastYearData+'</Data></Cell>';
			                // year actual数
			                actNow += '<td style="border:1px solid gray;">'+yearData+'</td>';
			                actNowXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">'+yearData+'</Data></Cell>';
			                // 自分以外FC数
			                fcOthers += '<td style="border:1px solid gray;">'+otherFcLastDate+'</td>';
			                fcOthersXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">'+otherFcLastDate+'</Data></Cell>';
			                // 前回FC数
			                fcLast += '<td style="border:1px solid gray;">'+fcLastDate+'</td>';
			                fcLastXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">'+fcLastDate+'</Data></Cell>';
			                  
			                var Weeks=54-m;
							if (dateArray[m][3]) {
								//fcSelf += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:#134DF2;">'+'<input id="comparation:'+inforItemId+'|'+inforLocationId+'|'+WeekNum+'" type="hidden" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:center;color:red;" value=""/>'+ comparation + '</td>';
								fcSelf += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:#134DF2;">'+ comparation + '</td>';
								fcSelfXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">'+ comparation + '</Data></Cell>';
							} else {
								//fcSelf += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:red;"><input id="comparation:'+inforItemId+'|'+inforLocationId+'|'+WeekNum+'" oninput="insideDataChange('+'\''+inforItemId+'\''+','+'\''+inforLocationId+'\''+','+'\''+WeekNum+'\''+','+'\''+Weeks+'\''+')" type="text" style="width:100%;height:100%;border:0px;padding:0px;background-color:#e6e6e6;text-align:right;color:black;" value=""/></td>';										
								 var inputId = 'fcid:' + inforItemId+'|'+inforLocationId+'|'+ dateArray[m][1] +'|'+dateArray[m][5]+'|'+ dateArray[m][0] + '|' + fcWeekId;
								 if (comparation == '0.0') {
				                        comparation = '';
				                    }
								 fcSelf += '<td style="border:1px solid gray;height:'+trtdHeight+'px;color:red;background-color:#e6e6e6;">';
				                 fcSelf += comparation + '</td>';
				                 fcSelfXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">';
				                 fcSelfXml += comparation + '</Data></Cell>';
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
			            
			            itemXml+='<Row>';
			            itemXml += '<Cell ss:StyleID="s57"><Data ss:Type="String">'+itemArr.productArr[i].locationsTxt[l]+'</Data></Cell>';
				        itemXml += '<Cell ss:StyleID="s57"><Data ss:Type="String">Actual</Data></Cell>';
				        itemXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">(Year-1)</Data></Cell>';
			            itemXml += actLastXml;
			            itemXml += '</Row>';
			            
			            
			            // Year title + monthly details
			            itemHtml+='</tr>';
			            itemHtml+='<tr style="background-color:#e6e6e6;text-align:right;">';
			            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none;border-bottom-style:none;border-right-style:none"></td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none"></td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;">Year</td>';
			            itemHtml += actNow;
			            itemHtml += '</tr>';
			            
			            itemXml+='<Row>';
			            itemXml += '<Cell ss:StyleID="s57"></Cell>';
				        itemXml += '<Cell ss:StyleID="s58"></Cell>';
				        itemXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">Year</Data></Cell>';
			            itemXml += actNowXml;
			            itemXml += '</Row>';
			            
			            
			            // 自分以外 title + monthly details
			            itemHtml+='</tr>';
			            itemHtml+='<tr style="background-color:#e6e6e6;text-align:right;">';
			            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none;border-bottom-style:none;border-right-style:none"></td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;border-left:0px;border-bottom-style:none;width:110px;text-align:left;vertical-align:top;">Forecast</td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;">自分以外</td>';
			            itemHtml += fcOthers;
			            itemHtml += '</tr>';
			            
			            itemXml+='<Row>';
			            itemXml += '<Cell ss:StyleID="s57"></Cell>';
				        itemXml += '<Cell ss:StyleID="s57"><Data ss:Type="String">Forecast</Data></Cell>';
				        itemXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">自分以外</Data></Cell>';
			            itemXml += fcOthersXml;
			            itemXml += '</Row>';
			            
			            // 前回 title + monthly details
			            itemHtml+='</tr>';
			            itemHtml+='<tr style="background-color:#e6e6e6;text-align:right;">';
			            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none;border-bottom-style:none;border-right-style:none"></td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none"></td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;">前回</td>';
			            itemHtml += fcLast;
			            itemHtml += '</tr>';
			            
			            itemXml+='<Row>';
			            itemXml += '<Cell ss:StyleID="s57"></Cell>';
				        itemXml += '<Cell ss:StyleID="s57"><Data ss:Type="String"></Data></Cell>';
				        itemXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">前回</Data></Cell>';
			            itemXml += fcLastXml;
			            itemXml += '</Row>';
			            
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
			            
			            itemXml+='<Row>';
			            itemXml += '<Cell ss:StyleID="s58"></Cell>';
				        itemXml += '<Cell ss:StyleID="s58"><Data ss:Type="String"></Data></Cell>';
				        itemXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">比較／入力</Data></Cell>';
			            itemXml += fcSelfXml;
			            itemXml += '</Row>';
			        }
			    }
        	}
        }
	    htmlNote+=itemHtml;
	    xmlNote+=itemXml;
	    }
	 
	 
	 
		
//		return htmlNote;
	   return {htmlNote : htmlNote, xmlNote : xmlNote, xmlRowCnt : xmlRowCnt,deliveryArray:deliveryArray};
}






/**
 * エクセルファイルのダウンロードURLを作成
 * @param {*} excelXMLNote
 * @param {*} rowCount 
 * @returns Excel file ダウンロードURL
 */
function createExcelURL(excelXMLNote, rowCount) {
    var xmlString = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
    xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"';
    xmlString += ' xmlns:o="urn:schemas-microsoft-com:office:office"';
    xmlString += ' xmlns:x="urn:schemas-microsoft-com:office:excel"';
    xmlString += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"';
    xmlString += ' xmlns:html="http://www.w3.org/TR/REC-html40">';
    
    var font='HG丸ｺﾞｼｯｸM-PRO';
    xmlString += '<Styles>';

    xmlString += '<Style ss:ID="S17">';
    xmlString += '<Alignment ss:Vertical="Center"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#99AABA" ss:Pattern="Solid"/>';
    xmlString += '<NumberFormat/>';
    xmlString += '<Protection/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S18">';
    xmlString += '<Alignment ss:Vertical="Center"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#99AABA" ss:Pattern="Solid"/>';
    xmlString += '<NumberFormat/>';
    xmlString += '<Protection/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="s50"><Alignment ss:Vertical="Center"/><Borders/><Font ss:FontName="HG丸ｺﾞｼｯｸM-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#FF0000"/><Interior/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s51"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG丸ｺﾞｼｯｸM-PRO" x:CharSet="128" x:Family="Modern" ss:Size="10" ss:Color="#000000"/><Interior ss:Color="#9999FF" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s52"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG丸ｺﾞｼｯｸM-PRO" x:CharSet="128" x:Family="Modern" ss:Size="10" ss:Color="#000000"/><Interior ss:Color="#9999FF" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    //黒文字
    xmlString += '<Style ss:ID="s53"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG丸ｺﾞｼｯｸM-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/><Interior ss:Color="#9999FF" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    //白文字オレンジBG
    xmlString += '<Style ss:ID="s54"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG丸ｺﾞｼｯｸM-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#000080" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s55"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG丸ｺﾞｼｯｸM-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#0033cc"/><Interior ss:Color="#e6e6e6" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s56"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG丸ｺﾞｼｯｸM-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/><Interior ss:Color="#e6e6e6" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s57"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders/><Font ss:FontName="HG丸ｺﾞｼｯｸM-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/><Interior ss:Color="#e6e6e6" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s58"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG丸ｺﾞｼｯｸM-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/><Interior ss:Color="#e6e6e6" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    
    
    
    xmlString += '</Styles>';
    xmlString += '<Worksheet ss:Name="販売計画情報レポート_LS_WEEK">';    
    xmlString += '<Table ' + (rowCount + 1) + '" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="14">';
    xmlString += '<Column ss:Index="3" ss:AutoFitWidth="0" ss:Width="66"/>';
    xmlString +=excelXMLNote;
    xmlString += '</Table></Worksheet></Workbook>';

    // create file
    var xlsFile = nlapiCreateFile('販売計画情報レポート_LS_WEEK' + '_' + getFormatYmdHms() + '.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));

    xlsFile.setFolder('375');
    xlsFile.setIsOnline(true);
    // save file
    var fileID = nlapiSubmitFile(xlsFile);
    // fileをロード
    var fl = nlapiLoadFile(fileID);
    // ファイルのURLを取得
    var url= "window.location.href='" + fl.getURL() + "'";

    return url;
}

/**
 * システム日付と時間をフォーマットで取得
 */
 function getFormatYmdHms() {

    // システム時間
    var now = getSystemTime();

    var str = now.getFullYear().toString();
    str += (now.getMonth() + 1).toString();
    str += now.getDate() + "_";
    str += now.getHours();
    str += now.getMinutes();
    str += now.getMilliseconds();

    return str;
}

