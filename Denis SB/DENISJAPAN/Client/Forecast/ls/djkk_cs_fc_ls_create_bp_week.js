/**
 * 営業計画情報入力_LS
 *
 * Version    Date            Author           Remarks
 * 1.00       2021/06/24     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
    // ブランド変更された場合
    if (name == 'custpage_brand'||name == 'custpage_subsidiary'||name =='custpage_user') {
        var date = nlapiGetFieldValue('custpage_date');
        var brands = nlapiGetFieldValue('custpage_brand');
        var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
        var user= nlapiGetFieldValue('custpage_user');
        // url
        var linkUrl = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_create_bp_wk','customdeploy_djkk_sl_fc_ls_create_bp_wk');
        // parameters
        linkUrl += '&op=cb';
        linkUrl += '&date=' + date;
        linkUrl += '&brand=' + brands;
        linkUrl += '&subsidiary=' + subsidiary;
        linkUrl += '&user=' + Number(user);
        window.ischanged = false;
        location.href = linkUrl;
    }
}

/**
 * 
 */
function creatForecastList(){
    var date = nlapiGetFieldValue('custpage_date');
    var item = nlapiGetFieldValue('custpage_item');
    var brands = nlapiGetFieldValue('custpage_brand');
    var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
    var user= nlapiGetFieldValue('custpage_user');
    var width=document.documentElement.clientWidth;
    var height=document.documentElement.clientHeight;
    if (isEmpty(date)) {
        alert('「基準日」入力必須');
    }
    else if(isEmpty(user)||Number(user)==0){
   	 alert('「BP」入力必須');
   }
    
    else{
        // url
        var aLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_create_bp_wk','customdeploy_djkk_sl_fc_ls_create_bp_wk');
        // parameters
        aLink += '&op=s';
        aLink += '&date=' + date;
        aLink += '&user=' + Number(user);
        aLink += '&brand=' + brands;
        aLink += '&productCodes=' + item;
        aLink += '&subsidiary=' + subsidiary;
        aLink += '&width=' + width;
        aLink += '&height=' + height;
        window.ischanged = false;
        location.href = aLink;
    }
}

/**
 * データ更新
 */
function updateData() {
	// 納品先
//	var delivery= nlapiGetFieldValue('custpage_delivery_hidden');
    // ログインユーザを取得
	 var user = nlapiGetFieldValue('custpage_user_hidden');
    // ログインユーザの連結を取得
    var subsidiary = nlapiGetFieldValue('custpage_subsidiary_hidden');
    // 基準日
    var date = nlapiGetFieldValue('custpage_date_hidden');
    // ブランド
    var brand = nlapiGetFieldValue('custpage_brand_hidden');
    // 商品配列
    var item = nlapiGetFieldValue('custpage_item_hidden');
    // 各FC数の入力inputエレメントを取得
    var fcInputEles = document.getElementsByName('fcQuan');
    // FC数の入力inputの件数を取得
    var elesLen = fcInputEles.length;
    // キャシューテーブル用保存値を作成
    

//    alert(JSON.stringify(fcInputEles))
    var cacheEles = '[';
    // 保存データ作成
//    alert(JSON.stringify(fcInputEles[0].getAttribute('id').split(/:|\|/)))
    for (var i = 0; i < elesLen; i++) {
        // FC数の入力inputエレメント
        var fcInputEle = fcInputEles[i];
        // IDを分割する: 'fcid' + itemid + locationid + yearMonth
        var eleIdArr = fcInputEle.getAttribute('id').split(/:|\|/);
        //納品先
        var delivery= eleIdArr[7];
        // ID
        var internalId = eleIdArr[6];
        // 商品ID
        var itemId = eleIdArr[1];
        // 場所ID
        var locationid = eleIdArr[2];
        // 年
        var year = eleIdArr[3];
        // 月
        var month = eleIdArr[4];
        // week
        var week = eleIdArr[5];
        // fc数
        var fcQun = fcInputEle.value;
        cacheEles += '{';
        cacheEles += '"id":"' + internalId + '",';
        cacheEles += '"subsidiary":"' + subsidiary + '",';
        cacheEles += '"item":"' + itemId + '",';
        cacheEles += '"locationArea":"' + locationid + '",';
        cacheEles += '"year":"' + year + '",';
        cacheEles += '"month":"' + month + '",';       
        cacheEles += '"week":"' + week + '",';
        cacheEles += '"employee":"'+  Number(user) + '",';
        cacheEles += '"delivery":"'+  delivery + '",';
        cacheEles += '"fcnum":"' + fcQun + '"}'
        if (i != (elesLen-1)) {
            cacheEles += ','
        }
    }
    cacheEles += ']';

    // キャシューレコードテーブルを取得
    var cacheRecord=nlapiCreateRecord('customrecord_djkk_forecast_cache_table');
    // 値をフィールドオブジェクトに設定
    cacheRecord.setFieldValue('custrecord_djkk_data_cache', cacheEles);
    // キャシューテーブル値を保存し、キャシューレコードIDを取得
    var cacheRecordID=nlapiSubmitRecord(cacheRecord, false, true);
    // url
    var linkUrl = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_create_bp_wk','customdeploy_djkk_sl_fc_ls_create_bp_wk');
    // parameters
    linkUrl += '&op=update';
    linkUrl += '&cacheRecordID='+cacheRecordID;
    linkUrl += '&date=' + date;
    linkUrl += '&brand=' + brand;
    linkUrl += '&productCodes=' + item;
    linkUrl += '&subsidiary=' + subsidiary;
    linkUrl += '&user=' + Number(user);
    window.ischanged = false;
    location.href = linkUrl;
}

/**
 * 検索に戻る
 */
function backToSearch() {
    // 基準日
    var date = nlapiGetFieldValue('custpage_date_hidden');
    // ブランド
    var brand = nlapiGetFieldValue('custpage_brand_hidden');
    // 商品配列
    var item = nlapiGetFieldValue('custpage_item_hidden');
    var subsidiary = nlapiGetFieldValue('custpage_subsidiary_hidden');
    var user = nlapiGetFieldValue('custpage_user_hidden');
    // url
    var linkUrl = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_create_bp_wk','customdeploy_djkk_sl_fc_ls_create_bp_wk');
    // parameters
    linkUrl += '&op=back';
    linkUrl += '&date=' + date;
    linkUrl += '&brand=' + brand;
    linkUrl += '&productCodes=' + item;
    linkUrl += '&subsidiary=' + subsidiary;
    linkUrl += '&user=' + Number(user);
    window.ischanged = false;
    location.href = linkUrl;
}

/*
 * 画面更新
 */
function refresh(){
	window.ischanged = false;
	location=location;
}