/**
 * NO'T DEPLOY NOW
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/08     CPC_苑
 *
 */
var pagedate=nlapiDateToString(getSystemTime());
/**
 * 営業計画情報レポート_LS
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
 function suitelet(request, response){
	// request parameter: 連結
		var subsidiary=request.getParameter('subsidiary');
    // request parameter: 基準日
    var date = request.getParameter('date');
    pagedate=date;
    // request parameter: 操作
    var operation = request.getParameter('op');
    // request parameter: 商品コードリスト
    var rpProductCodes = request.getParameter('productCodes');
    // request parameter:ブランドリスト
    var rpBrand = request.getParameter('brand');
    // request parameter: 商品名リスト
    var rpProductNms = request.getParameter('productNm');
    // request parameter: ブランド名リスト
    var rpBrandNms = request.getParameter('brandNm');
    // request parameter: 画面幅
    var rpSW = request.getParameter('width');
    // request parameter: 画面高さ
    var rpSH = request.getParameter('height');
    // 画面HTML
    var htmlNote ='';

    // ログインユーザを取得
    //var user = nlapiGetUser();
    /*******U224*******************/
    var user= request.getParameter('user');
//    if(!isEmpty(getUser)){
//    	user =getUser;
//    }
    /*******U224*******************/
    // 営業計画情報入力フォームを作成
    var form = nlapiCreateForm('営業計画情報レポート_LS', (operation == 's'));
    // client scriptを設定
    form.setScript('customscript_djkk_cs_fc_ls_view_bp');

    // 検索の場合
    if (operation == 's') {
        // 検索を実施
        var htmlAndExcelXMLObj = doSearch(user, date, rpBrand, rpProductCodes, rpBrandNms, rpProductNms, rpSW, rpSH,subsidiary);
        // 結果HTMLを作成
        htmlNote += htmlAndExcelXMLObj.htmlNote;
        // ExcelダウンロードURL取得
        var excelExportURL = createExcelURL(htmlAndExcelXMLObj.xmlNote, htmlAndExcelXMLObj.xmlRowCnt);

        // 画面にボタンを追加
        form.addButton('custpage_exportExcel', 'Excel出力', excelExportURL);
        form.addButton('custpage_backToSearch', '検索に戻る', 'backToSearch();');
        form.addButton('custpage_csvdownload', 'CSVダウンロード', 'csvDownUrl()');
		form.addButton('custpage_csvupload', 'CSVアップロード', 'csvUpload()');
        // 画面hidden項目を作成、次画面引継ぐ用
        createHiddenItems(form, date, rpBrand, rpProductCodes,subsidiary,user);
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
    var userField=pForm.addField('custpage_user', 'multiselect', 'BP', null,'custpage_group_filter');
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
    if(!isEmpty(bpSearch)){
	for(var bps=0;bps<bpSearch.length;bps++){
		// 選択状態
        var bpIsSelected = (userCdArr.indexOf(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP")) >= 0);	
		userField.addSelectOption(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP"), bpSearch[bps].getValue("entityid","CUSTRECORD_DJKK_BP_LS","GROUP"),bpIsSelected);				
	}
    }
	userField.setMandatory(true);
//	}
	/*******U224*******************/
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
    pForm.addButton('custpage_viewForecastList', '検索', 'viewForecastList();');
}

/**
 * 検索処理
 * @param {*} pUser
 * @param {*} pDate
 * @param {*} pBrand
 * @param {*} pProductCodes
 * @param {*} pBrandNms
 * @param {*} pProductNms
 * @param {*} pSW
 * @param {*} pSH
 * @returns \{htmlNote : htmlNote, xmlNote : xmlNote, xmlRowCnt : xmlRowCnt}
 */
function doSearch(pUser, pDate, pBrand, pProductCodes, pBrandNms, pProductNms, pSW, pSH,subsidiary) {
    // HTML
    var htmlNote = '';
    // XML
    var xmlNote = '';
    // XML row Count
    var xmlRowCnt = 0;
    // EXCEL XML
    var htmlAndExcelXMLObj;
    // 基準日
    var rpBaseDate = nlapiStringToDate(pDate);

    // 商品コード配列を作成
    var itemArr = doItemSearch(pUser, pBrand, pProductCodes,subsidiary);
    // 商品コード配列が空の場合、担当者の担当商品存在しないため、メッセージを作成する。
    if (isEmpty(itemArr) || itemArr.ids.length == 0) {
        htmlNote += '<p color="red">担当している商品は存在しません。</p>';
    } else {
    	// 担当者名を取得
        var userDate = doUserSearch(pUser);
    	var userArray=new Array();
    	if(pUser!='ALL'){
    		userArray=pUser.split('');
    	}else{
    		userArray=userDate.userArray;
    	}
    	var userIdName=userDate.nameArray;
    	
        // 年月OBJを作成
        var yyyyMMObj = getMonthYearArr(rpBaseDate.getFullYear(), rpBaseDate.getMonth() + 1);
     // 検索結果明細HTMLを作成
        /***************************************************************/
        var baseYear=rpBaseDate.getFullYear();
        var baseMonth=rpBaseDate.getMonth() + 1;
        // テーブル幅
        // var tbW = 'width:' + Number(pSW * 59 / 60) + 'px;';
        var tbW = 'width:1218px;';
        // テーブル高さ
        var tbH = 'height:' + Number(pSH * 59 / 60 - 250) + 'px;';
        // テーブルライン高さ
        var lineH = 'height:28px;';
        //----------------HTML header line-------------------------------
        htmlNote += '<div style="margin-bottom:5px;font-weight:900;font-size:24px;">('+nlapiLookupField('subsidiary',subsidiary,'legalname')+') FORECAST LIST</div>';
        htmlNote += '<div style="margin-bottom:5px;">';
        htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">    </div>';
        htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">    </div>';
        htmlNote += '<div style="display:inline-block;font-weight:bold;font-size:18px;color:red;margin-left:130px;">★★★　Actualは全Salesmanの合計数値です　★★★</div>';
        htmlNote += '</div>';
        htmlNote += '<div id="tablediv" style="overflow-y:scroll;' + tbH + tbW+'border:1px solid gray;border-bottom: 0;border-right: 0;">';
        htmlNote += '<table style="border-collapse:separate;width:1200px;font-size:15px;font-weight:bold;border-spacing:0;">';
        //-----------------XML header line-------------------------------
        // 検索条件タイトル行
        xmlNote += '<Row>';
        xmlNote += '<Cell><Data ss:Type="String">基準日</Data></Cell>';
        xmlNote += '<Cell><Data ss:Type="String">ブランド</Data></Cell>';
        xmlNote += '<Cell><Data ss:Type="String">商品名</Data></Cell>';
        xmlNote += '</Row>';
        // ブランド名
        var brandNms = '';
        // ブランド名が空でない場合
        if (pBrandNms != 'undefined' && !isEmpty(pBrandNms)) {
            brandNms = pBrandNms.replace(//g, '|');
        }
        // 商品名
        var productNms = '';
        // 商品名が空でない場合
        if (pProductNms != 'undefined' && !isEmpty(pProductNms)) {
            productNms = pProductNms.replace(//g, '|');
        }
        xmlNote += '<Row>';
        xmlNote += '<Cell><Data ss:Type="String">' + pDate + '</Data></Cell>';
        xmlNote += '<Cell><Data ss:Type="String">' + brandNms + '</Data></Cell>';
        xmlNote += '<Cell><Data ss:Type="String">' + productNms + ' </Data></Cell>';
        xmlNote += '</Row>';

        //------------------HTML AND XML Detail line--------------------
        // 年月行を作成       
        /***************************************************************************************/

        // 年月行HTML
        var yearMonthHtml = '';
        // 月TDHTML
        var monthTds = '';
        // 年TDHTML
        var yearTds = '';
        // 空白TDHTML
        var blankTds = '';
        // 年月行XML
        var yearMonthXml = '';
        // 月CELL
        var monthCells = '';
        // 年CELL
        var yearCells = '';
        // 空白CELL
        var blankCells = '';
        // CELLの開始位置
        var cellIndex = '';
        // 印刷日付
        var printDate = pagedate;


        //-------------month, year and blank td--------------------------------------------------------------------
        // 12ヵ月分のデータをループ
        for (var i = 0; i < 12; i++) {
            if (i == 0) {
                cellIndex = 'ss:Index="4"';
            } else {
                cellIndex = '';
            }

            // 基準年月の場合、CSSを変更し、強調する
            if (baseMonth == yyyyMMObj.monthArr[i]) {
                // HTML
                monthTds+='<td style="border:1px solid gray;width:66px;background-color:#000080;color:#ffffff;">' + yyyyMMObj.monthArr[i] + '</td>';
                yearTds+= '<td style="border:1px solid gray;background-color:#000080;color:#ffffff;">' + yyyyMMObj.yearArr[i] + '</td>';
                blankTds+='<td style="border:1px solid gray;background-color:#000080;color:#ffffff;"></td>';
                // XML
                monthCells += '<Cell ss:StyleID="S07"><Data ss:Type="Number">' + yyyyMMObj.monthArr[i] + '</Data></Cell>';
                yearCells += '<Cell ss:StyleID="S07"><Data ss:Type="Number">' + yyyyMMObj.yearArr[i] + '</Data></Cell>';
                blankCells += '<Cell ss:StyleID="S07"></Cell>';

            } else {
                // HTML
                monthTds+='<td style="border:1px solid gray;width:66px;">' + yyyyMMObj.monthArr[i] + '</td>';
                yearTds+= '<td style="border:1px solid gray;">' + yyyyMMObj.yearArr[i] + '</td>';
                blankTds+='<td style="border:1px solid gray;"></td>';
                // XML
                monthCells += '<Cell ss:StyleID="S06"><Data ss:Type="Number">' + yyyyMMObj.monthArr[i] + '</Data></Cell>';
                yearCells += '<Cell ' + cellIndex + ' ss:StyleID="S06"><Data ss:Type="Number">' + yyyyMMObj.yearArr[i] + '</Data></Cell>';
                blankCells += '<Cell ss:StyleID="S06"></Cell>';
            }
        }
        // 年月行HTMLを作成
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

        // 年月行XMLを作成
        yearMonthXml += '<Row ss:Index="4" ss:AutoFitHeight="0">';
        yearMonthXml += '<Cell ss:MergeAcross="2" ss:MergeDown="1" ss:StyleID="S05"><Data ss:Type="String">PrintDate: ' + printDate + '</Data></Cell>';
        yearMonthXml += monthCells;
        yearMonthXml += '</Row>';
        yearMonthXml += '<Row>';
        yearMonthXml += yearCells;
        yearMonthXml += '</Row>';
        yearMonthXml += '<Row>';
        yearMonthXml += '<Cell ss:MergeAcross="2" ss:StyleID="S13"><Data ss:Type="String">基準日：' + baseYear + '/' + baseMonth + '</Data></Cell>';
        yearMonthXml += blankCells;
        yearMonthXml += '</Row>';

        // アイテムHTML
        var itemHtml = '';
        // アイテムXML
        var itemXML = '';
        /*******************************************************************************************/
        
        for(var userF=0;userF<userArray.length;userF++){
        var singleUserId=userArray[userF];
                     
        // ---本人FC検索結果（去年と今期）-----------------------------------
        // 取得項目配列:アイテムコード、アイテム名、場所、年、月、FC数、年月
        var fcColumns = createSColumns();
        // 検索フィルター DJ_担当者コード,DJ_商品コード,DJ_年,DJ_月
        var searchFilter = createSFilter(singleUserId, 'anyof', yyyyMMObj, itemArr.ids,subsidiary);
        // DJ_営業FC検索
        var resFCSelf = getSearchResults('customrecord_djkk_so_forecast_ls', null, searchFilter, fcColumns);

        // ---その他担当者FC検索結果------------------------------------------
        // 取得項目配列:アイテムコード、アイテム名、場所、年、月、FC数、年月
        var fcOthersColumns = createSColumnsForOhters();
        // 検索フィルター DJ_担当者コード,DJ_商品コード,DJ_年,DJ_月
        var searchOFilter = createSFilter(singleUserId, 'noneof', yyyyMMObj, itemArr.ids,subsidiary);
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

        

        // 各検索結果をもとに、リストの整形を実施、結果：[{item: AA, locations: [{location: loc, fcOthersArr: [1,...], fcLastArr:[1,...], fcLastIds:[1,...]},.....]},...]
        var fcAcArr = createFcActArr(yyyyMMObj, resFCSelf, fcColumns, resFCOthers, fcOthersColumns, resAct, actColumns, itemArr.productArr, locInvObj.locInvArr);

        
        // アイテムの予実数行を作成
        /****************************************************************************************/

      
        // アイテムの件数
        var itemLen = fcAcArr.length;
        // xmlRowCount
        var xmlRowCnt = 6 + itemLen;
        /*******************************************************************************************/
        // HTML
        itemHtml += '<tr style="'+ lineH +'background-color:#99AABA;">';
        itemHtml += '<td colspan="3" style="border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">Tanto    :    ' + userIdName[singleUserId][1] + '</td>';
        itemHtml += '<td colspan="12" style="border:1px solid gray;border-left:0px;text-align:left;color:#0033cc;">' + userIdName[singleUserId][0] + '</td>';
        itemHtml += '</tr>';
        
        // XML
        itemXML += '<Row ss:AutoFitHeight="0">';
        itemXML += '<Cell ss:StyleID="S17"><Data ss:Type="String">Tanto    :    ' + userIdName[singleUserId][1] + '</Data></Cell>';
        itemXML += '<Cell ss:StyleID="S18"/><Cell ss:StyleID="S18"/>';
        itemXML += '<Cell ss:StyleID="S18"><Data ss:Type="String">' + userIdName[singleUserId][0] + '</Data></Cell>';
        for (var sj = 0; sj < 10; sj++) {
            itemXML += '<Cell ss:StyleID="S18"/>';
        }
        itemXML += '<Cell ss:StyleID="S19"/>';
        itemXML += '</Row>';
        /***************************************************************************************/

        // アイテムの件数分をループ
        for (var i = 0; i < itemLen; i++) {
            // HTML
            itemHtml += '<tr style="'+ lineH +'background-color:#e6e6e6;">';;
            itemHtml += '<td colspan="3" style="border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">' + fcAcArr[i].item + '</td>';
            itemHtml += '<td colspan="12" style="border:1px solid gray;border-left:0px;text-align:left;color:#0033cc;">' + fcAcArr[i].itemName + '</td>';
            itemHtml += '</tr>';
            // XML
            itemXML += '<Row ss:AutoFitHeight="0">';
            itemXML += '<Cell ss:StyleID="S08"><Data ss:Type="String">' + fcAcArr[i].item + '</Data></Cell>';
            itemXML += '<Cell ss:StyleID="S09"/><Cell ss:StyleID="S09"/>';
            itemXML += '<Cell ss:StyleID="S09"><Data ss:Type="String">' + fcAcArr[i].itemName + '</Data></Cell>';
            for (var j = 0; j < 10; j++) {
                itemXML += '<Cell ss:StyleID="S09"/>';
            }
            itemXML += '<Cell ss:StyleID="S10"/>';
            itemXML += '</Row>';

            // 場所の件数
            var locLen = fcAcArr[i].locations.length;
            // xmlRowCount
            xmlRowCnt += locLen*4;

            // 場所の件数分をループ
            for (var l = 0; l < locLen; l++) {
                // HTML
                var actLast = '';
                var actNow = '';
                var fcOthers = '';
                var fcSelf = '';
                // XML
                var actLastXML= '';
                var actNowXML = '';
                var fcOthersXML = '';
                var fcSelfXML = '';

                // 12ヵ月分のデータをループ
                for (var m = 0; m < 12; m++) {
                    //----------------HTML-----------------------------
                    // (year - 1) actual数
                    actLast += '<td style="border:1px solid gray;">' + fcAcArr[i].locations[l].actLast[m] + '</td>';
                    // year actual数
                    actNow += '<td style="border:1px solid gray;">' + fcAcArr[i].locations[l].actNow[m] + '</td>';
                    // 自分以外FC数
                    fcOthers += '<td style="border:1px solid gray;">' + fcAcArr[i].locations[l].fcOthersArr[m] + '</td>';
                    // 比較/入力FC数
                    var comparation = '0.0';
                    // HTML css font color: 青色
                    var comparationFontCol = 'color:#134DF2;';
                    // excelのCELLスタイル
                    var cellStyle = 'S12';
                    // 基準日以降の月の場合、FC入力を表示
                    if (new Date(yyyyMMObj.yearArr[m], yyyyMMObj.monthArr[m], 1) > new Date(baseYear, baseMonth, 1)) {
                        comparation = fcAcArr[i].locations[l].fcLastArr[m];
                        // 黒色
                        comparationFontCol = '';
                    } else {
                        // actual数と前回FC数両方ありの場合
                        if (!isEmpty(fcAcArr[i].locations[l].actNow[m]) && !isEmpty(fcAcArr[i].locations[l].fcLastArr[m])) {
                            comparation = Math.round((fcAcArr[i].locations[l].actNow[m]/fcAcArr[i].locations[l].fcLastArr[m]) * 10) / 10;
                            comparation = comparation.toFixed(1);
                        }
                        cellStyle = 'S16';
                    }
                    fcSelf += '<td style="border:1px solid gray;text-align:right;' + comparationFontCol + '">' + comparation + '</td>';
                    //----------------XML-----------------------------
                    // (year - 1) actual数
                    if (isEmpty(fcAcArr[i].locations[l].actLast[m])) {
                        actLastXML += '<Cell ss:StyleID="S12"></Cell>';
                    } else {
                        actLastXML += '<Cell ss:StyleID="S12"><Data ss:Type="Number">' + fcAcArr[i].locations[l].actLast[m] + '</Data></Cell>';
                    }
                    // year actual数
                    if (isEmpty(fcAcArr[i].locations[l].actNow[m])) {
                        actNowXML += '<Cell ss:StyleID="S12"></Cell>';
                    } else {
                        actNowXML += '<Cell ss:StyleID="S12"><Data ss:Type="Number">' + fcAcArr[i].locations[l].actNow[m] + '</Data></Cell>';
                    }
                    // 自分以外FC数
                    if (isEmpty(fcAcArr[i].locations[l].fcOthersArr[m])) {
                        fcOthersXML += '<Cell ss:StyleID="S12"></Cell>';
                    } else {
                        fcOthersXML += '<Cell ss:StyleID="S12"><Data ss:Type="Number">' + fcAcArr[i].locations[l].fcOthersArr[m] + '</Data></Cell>';
                    }
                    if (isEmpty(comparation)) {
                        fcSelfXML += '<Cell ss:StyleID="S12"></Cell>';
                    } else {
                        // 比較/入力FC数
                        fcSelfXML += '<Cell ss:StyleID="' + cellStyle + '"><Data ss:Type="Number">' + comparation + '</Data></Cell>';
                    }
                }

                // 入力 titleの文字色:赤色
                var colorForInput = 'color:#FE1B34;';
                // 「/」の色:黒色
                var colorForSlash = 'color:#000000;';
                if (l%2 != 0) {
                    // 青色
                    colorForInput = 'color:#134DF2;';
                    colorForSlash = 'color:#134DF2;';
                }

                // 商品予実のTD、TRのHTMLを連結
                itemHtml += concatenateDetailHTML(colorForInput, colorForSlash, lineH, fcAcArr[i].locations[l].location, actLast, actNow, fcOthers, fcSelf);
                // 商品予実のCELLのXMLを連結
                itemXML += concatenateDetailXML(fcAcArr[i].locations[l].location, actLastXML, actNowXML, fcOthersXML, fcSelfXML);
            }
        }
    }
        /****************************************************************************************/

        // 年月行HTML
        htmlNote += yearMonthHtml;
        // アイテムの予実数行HTML
        htmlNote += itemHtml;
        htmlNote += '</tr>';
        htmlNote += '</table>';
        htmlNote += '</div>';

        // 年月行XML
        xmlNote += yearMonthXml;
        xmlNote += itemXML;
        var xmlRowCnt = xmlRowCnt;

        /***************************************************************/
    }

    return {htmlNote : htmlNote, xmlNote : xmlNote, xmlRowCnt : xmlRowCnt};
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

        monthArr[5-i] = tmpDatePast.getMonth() + 1;
        yearArr[5-i] = tmpDatePast.getFullYear();
        monthArr[5+i+1] = tmpDateFuture.getMonth() + 1;
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
    filter.push(["custrecord_djkk_business_judgmen_fc","anyof",'2']);
    if (!isEmpty(pUser) && pUser != 'ALL') {
        filter.push('and');
        filter.push(['custrecord_djkk_bp_ls', 'anyof', pUser.split('')]);
    }
    
 // DJ_営業FC週月判断:月単位
   
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
 * 商品予実のTD、TRのHTMLを連結
 * @param {*} colorForInput 
 * @param {*} lineH 
 * @param {*} location 
 * @param {*} actLast 
 * @param {*} actNow 
 * @param {*} fcOthers 
 * @param {*} fcSelf 
 * @returns 商品予実HTML
 */
function concatenateDetailHTML(colorForInput, colorForSlash, lineH, location, actLast, actNow, fcOthers, fcSelf) {
    var resHtml = '';
    // (Year-1) title + monthly details
    resHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
    resHtml+='<td rowspan="4" style="border:1px solid gray;border-right:0px;width:110px;text-align:left;vertical-align:top;">' + location + '</td>';
    resHtml+='<td rowspan="2" style="border:1px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;">Actual</td>';
    resHtml+='<td style="border:1px solid gray;text-align:left;width:128px;">(Year-1)</td>';
    resHtml += actLast;
    resHtml += '</tr>';
    // Year title + monthly details
    resHtml+='</tr>';
    resHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
    resHtml+='<td style="border:1px solid gray;text-align:left;">Year</td>';
    resHtml += actNow;
    resHtml += '</tr>';
    // 自分以外 title + monthly details
    resHtml+='</tr>';
    resHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
    resHtml+='<td rowspan="2" style="border:1px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;">Forecast</td>';
    resHtml+='<td style="border:1px solid gray;text-align:left;">自分以外</td>';
    resHtml += fcOthers;
    resHtml += '</tr>';
    resHtml+='</tr>';
    // 比較／入力 title + monthly details
    resHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;">';
    resHtml+='<td style="border:1px solid gray;text-align:left;"><span style="color:#134DF2;">比較</span><span style="' + colorForSlash + '">／</span><span style="' + colorForInput + '">入力</span></td>';
    resHtml += fcSelf;
    resHtml += '</tr>';

    return resHtml;
}

/**
 * 商品予実のCELLのXMLを連結
 * @param {*} location 
 * @param {*} actLastXML 
 * @param {*} actNowXML 
 * @param {*} fcOthersXML 
 * @param {*} fcSelfXML 
 */
function concatenateDetailXML(location, actLastXML, actNowXML, fcOthersXML, fcSelfXML) {
    var resXML = '';
    // (Year-1) title + monthly details
    resXML += '<Row ss:AutoFitHeight="0">';
    resXML += '<Cell ss:MergeDown="3" ss:StyleID="S14"><Data ss:Type="String">' + location + '</Data></Cell>';
    resXML += '<Cell ss:MergeDown="1" ss:StyleID="S15"><Data ss:Type="String">Actual</Data></Cell>';
    resXML += '<Cell ss:StyleID="S11"><Data ss:Type="String">(Year-1)</Data></Cell>';
    resXML += actLastXML;
    resXML += '</Row>';
    // Year title + monthly details
    resXML += '<Row ss:AutoFitHeight="0">';
    resXML += '<Cell ss:Index="3" ss:StyleID="S11"><Data ss:Type="String">Year</Data></Cell>';
    resXML += actNowXML;
    resXML += '</Row>';
    // 自分以外 title + monthly details
    resXML += '<Row ss:AutoFitHeight="0">';
    resXML += '<Cell ss:Index="2" ss:MergeDown="1" ss:StyleID="S01"><Data ss:Type="String">Forecast</Data></Cell>';
    resXML += '<Cell ss:StyleID="S11"><Data ss:Type="String">自分以外</Data></Cell>';
    resXML += fcOthersXML;
    resXML += '</Row>';
    // 比較／入力 title + monthly details
    resXML += '<Row ss:AutoFitHeight="0">';
    resXML += '<Cell ss:Index="3" ss:StyleID="S11"><Data ss:Type="String">比較/入力</Data></Cell>';
    resXML += fcSelfXML;
    resXML += '</Row>';
    return resXML;
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
    xmlString += '<Style ss:ID="Default" ss:Name="Normal">';
    xmlString += '<Alignment ss:Vertical="Center"/>';
    xmlString += '<Borders/>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior/>';
    xmlString += '<NumberFormat/>';
    xmlString += '<Protection/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S13">';
    xmlString += '<Alignment ss:Horizontal="Right" ss:Vertical="Bottom"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Interior ss:Color="#9999FF" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S14">';
    xmlString += '<Alignment ss:Horizontal="Left" ss:Vertical="Top"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S15">';
    xmlString += '<Alignment ss:Vertical="Top"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S01">';
    xmlString += '<Alignment ss:Vertical="Top"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S02">';
    xmlString += '<Alignment ss:Horizontal="Left" ss:Vertical="Top"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S03">';
    xmlString += '<Alignment ss:Vertical="Top"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S04">';
    xmlString += '<Alignment ss:Vertical="Top"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S05">';
    xmlString += '<Alignment ss:Horizontal="Right" ss:Vertical="Top"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Interior ss:Color="#9999FF" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S06">';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Interior ss:Color="#9999FF" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S07">';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#FFFFFF"/>';
    xmlString += '<Interior ss:Color="#000080" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S08">';
    xmlString += '<Alignment ss:Vertical="Center"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#E6E6E6" ss:Pattern="Solid"/>';
    xmlString += '<NumberFormat/>';
    xmlString += '<Protection/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S09">';
    xmlString += '<Alignment ss:Vertical="Center"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#E6E6E6" ss:Pattern="Solid"/>';
    xmlString += '<NumberFormat/>';
    xmlString += '<Protection/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S10">';
    xmlString += '<Alignment ss:Vertical="Center"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#E6E6E6" ss:Pattern="Solid"/>';
    xmlString += '<NumberFormat/>';
    xmlString += '<Protection/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S11">';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S12">';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>';
    xmlString += '</Style>';
    xmlString += '<Style ss:ID="S16">';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>';
    xmlString += '<NumberFormat ss:Format="0.0"/>';
    xmlString += '</Style>';
    /********************************************/
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
    xmlString += '<Style ss:ID="S19">';
    xmlString += '<Alignment ss:Vertical="Center"/>';
    xmlString += '<Borders>';
    xmlString += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
    xmlString += '</Borders>';
    xmlString += '<Font ss:FontName="' + font + '" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/>';
    xmlString += '<Interior ss:Color="#99AABA" ss:Pattern="Solid"/>';
    xmlString += '<NumberFormat/>';
    xmlString += '<Protection/>';
    xmlString += '</Style>';
    /********************************************/  
    xmlString += '</Styles>';
    xmlString += '<Worksheet ss:Name="営業計画情報レポート_LS">';    
    xmlString += '<Table ss:ExpandedColumnCount="15" ss:ExpandedRowCount="' + (rowCount + 1) + '" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="14">';
    xmlString += '<Column ss:Index="3" ss:AutoFitWidth="0" ss:Width="66"/>';
    xmlString +=excelXMLNote;
    xmlString += '</Table></Worksheet></Workbook>';

    // create file
    var xlsFile = nlapiCreateFile('営業計画情報レポート_LS' + '_' + getFormatYmdHms() + '.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));

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