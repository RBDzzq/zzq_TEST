/**
 * 営業計画情報入力
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
    if (name == 'custpage_brand'||name == 'custpage_subsidiary'||name == 'custpage_user') {
        var date = nlapiGetFieldValue('custpage_date');
        var brands = nlapiGetFieldValue('custpage_brand');
        var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
        var user= nlapiGetFieldValue('custpage_user');
        // url
        var linkUrl = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_bp','customdeploy_djkk_sl_forecast_create_bp');
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
        var aLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_bp','customdeploy_djkk_sl_forecast_create_bp');
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
    // 各FC数の入力memoを取得
    var fcInputMemos = document.getElementsByName('fcMemo');
    // FC数の入力inputの件数を取得
    var elesLen = fcInputEles.length;
    var memoElesLen = fcInputMemos.length;
//    alert('elesLen='+elesLen)
//    alert('memoElesLen='+memoElesLen)
    var itemNum = memoElesLen/12 //アイテム行数を取得
    var itemLength = elesLen/itemNum //一列の入力可能数を取得
    
//    alert('elesLen='+itemNum)
//    alert('itemLength='+itemLength)
//    for (var i = 0; i < elesLen; i++) {
//    	var currentLine = Math.ceil(Number(elesLen/itemLength)) //該当行数を取得
//    	var currentCell = currentLine*12 - itemLength+1
//    }
    
    
    
    // キャシューテーブル用保存値を作成
    var cacheEles = '[';
    // 保存データ作成
    for (var i = 0; i < elesLen; i++) {
//    	console.log('start i='+i)
        // FC数の入力inputエレメント
        var fcInputEle = fcInputEles[i];
        // FC数の入力memo
        //配列ソート:FC数 -- memo
//        var y ; 
//        var k = Math.floor(i/6); 
//        if(k < 1 ){
//        	y = Number(i+7);
//        }
//        else if(k > 1){
//        	y = Number(6*(k+1)) + Number(i+1);
//        }
//        console.log(y)
//        console.log('currentLineNUM'+' '+i)
//    	var currentLine = Math.ceil(Number(elesLen/itemLength)) //該当行数を取得
//    	console.log('currentLine'+' '+currentLine)
//    	var currentCell = currentLine*12 - itemLength+1
//    	console.log('currentCell'+' '+currentCell)
        
        var elescellNum = Number(i+1)
        var currentCell = elescellNum+(Math.ceil(elescellNum/itemLength))*(12-itemLength)
         console.log('currentCell'+' '+currentCell)
        var fcInputMemo = fcInputMemos[Number(currentCell-1)];
//        console.log(y +"fcInputMemo"+fcInputMemo.value)
        // IDを分割する: 'fcid' + itemid + locationid + yearMonth
        var eleIdArr = fcInputEle.getAttribute('id').split(/:|\|/);
       
        // 商品ID
        var itemId = eleIdArr[1];
        // 場所ID
        var locationid = eleIdArr[2];
        // 年
        var year = eleIdArr[3];
        // 月
        var month = eleIdArr[4];
        // fc数
        var fcQun = fcInputEle.value;
        
        //memo
        var memo = defaultEmpty(fcInputMemo.value);
        console.log('memo'+' '+memo)
        	
        var changedFieldId=itemId+'|'+locationid+'|'+year+'|'+month;
        // ID
        var internalId = document.getElementById("fcinternalId:"+changedFieldId).value;
        console.log('internalId'+' '+internalId)
        cacheEles += '{';
        cacheEles += '"id":"' + internalId + '",';
        cacheEles += '"subsidiary":"' + subsidiary + '",';
        cacheEles += '"item":"' + itemId + '",';
        cacheEles += '"locationArea":"' + locationid + '",';
        cacheEles += '"year":"' + year + '",';
        cacheEles += '"month":"' + month + '",';
        cacheEles += '"employee":"'+ Number(user) + '",';
        cacheEles += '"fcnum":"' + fcQun + '",';
        cacheEles += '"memo":"' + memo + '"}'
        if (i != (elesLen-1)) {
            cacheEles += ','
        }
    }
    console.log('b')
    cacheEles += ']';
    console.log('cacheEles'+cacheEles)

    // キャシューレコードテーブルを取得
    var cacheRecord=nlapiCreateRecord('customrecord_djkk_forecast_cache_table');
    console.log('cacheRecord='+cacheRecord)
    // 値をフィールドオブジェクトに設定
    cacheRecord.setFieldValue('custrecord_djkk_data_cache', cacheEles);
    // キャシューテーブル値を保存し、キャシューレコードIDを取得
    var cacheRecordID=nlapiSubmitRecord(cacheRecord, false, true);
    console.log('cacheRecordID='+cacheRecordID)
    // url
    var linkUrl = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_bp','customdeploy_djkk_sl_forecast_create_bp');
    //20230612 changed by zhou start
    //CH645
    var batchStatus = clientScriptGetBatchStatus('customscript_djkk_ss_forecast_create_bp','customdeploy_djkk_ss_forecast_create_bp');
    if(batchStatus == 'PENDING' || batchStatus == 'PROCESSING'){
    	alert('他の実行プロセスがすでに存在します。お待ちください。後で再試行してください。')
    }else{
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
    //20230612 changed by zhou
    
}

/**
 * fcDataChange
 */
function fcDataChange(fieldId,year,month,weeks){
	weeks=12-weeks;
	var changedFieldId=fieldId+'|'+year+'|'+month;	
	var fcData=document.getElementById("fcid:"+changedFieldId).value;	
	fcData=fcData.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/,'$1');
	document.getElementById("fcid:"+changedFieldId).value=fcData;
	var balance=Number(document.getElementById("balanceInput:"+changedFieldId).value);	
	var isd=0;
	var nowYear=year;
	var nowMonth=month;
  for(var i=0;i<weeks;i++){
	  var balanceInitial=Number(document.getElementById("balanceInitial:"+changedFieldId).value);	 
	  isd+=Number(document.getElementById("fcid:"+changedFieldId).value)-Number(document.getElementById("hiddenFcid:"+changedFieldId).value);	  
	  var newBalanceInitial=Number(Number(balanceInitial)-Number(isd));	  
	  document.getElementById("balance:"+changedFieldId).innerHTML = Number(newBalanceInitial.toFixed(2));
	  document.getElementById("balanceInput:"+changedFieldId).value = Number(newBalanceInitial.toFixed(2));
	  document.getElementById("hiddenFcid:"+changedFieldId).value=Number(document.getElementById("fcid:"+changedFieldId).value);

	  if(nowMonth!=12){
		  nowMonth++;
	  }else{
		  nowYear++;
		  nowMonth=1;
	  }  
	  changedFieldId=fieldId+'|'+nowYear+'|'+nowMonth;
  }
  var changedFieldId=fieldId+'|'+year+'|'+month;
  var nowYear=year;
  var nowMonth=month;
  for(var i=0;i<weeks;i++){
	  document.getElementById("balanceInitial:"+changedFieldId).value = Number(document.getElementById("balanceInput:"+changedFieldId).value);
	  if(nowMonth!=12){
		  nowMonth++;
	  }else{
		  nowYear++;
		  nowMonth=1;
	  }  
	  changedFieldId=fieldId+'|'+nowYear+'|'+nowMonth;
  }
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
    var linkUrl = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_bp','customdeploy_djkk_sl_forecast_create_bp');
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

/*
 * MEMO更新
 */
function memoPopUp(id,memo){
	var theComtlink=nlapiResolveURL('SUITELET', 'customscript_djkk_sl_forecast_comment','customdeploy_djkk_sl_forecast_comment');
	var changedFieldId= id;
	var memoComment=document.getElementById('memoText:'+id).value;
	theComtlink+='&comment=' +memoComment;
	theComtlink+='&changedFieldId=' + changedFieldId;
	theComtlink+='&type=' + 'updateMemo';
	//nlExtOpenWindow(theComtlink, 'newwindow',500, 300, this, false, 'Comment画面');
	open(theComtlink,'_commentPopUp','top=150,left=250,width=750,height=300,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}
/*
 * MEMO表示＃ヒョウジ＃
 */
function memoLook(id,memo){
	var theComtlink=nlapiResolveURL('SUITELET', 'customscript_djkk_sl_forecast_comment','customdeploy_djkk_sl_forecast_comment');
	var changedFieldId= id;
	var memoComment=document.getElementById('memoLookText:'+id).value;
	theComtlink+='&comment=' +memoComment;
	theComtlink+='&changedFieldId=' + changedFieldId;
	theComtlink+='&type=' + 'lookMemo';
	//nlExtOpenWindow(theComtlink, 'newwindow',500, 300, this, false, 'Comment画面');
	open(theComtlink,'_commentPopUp','top=150,left=250,width=750,height=300,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}


function defaultEmpty(src){
	return src || '';
}