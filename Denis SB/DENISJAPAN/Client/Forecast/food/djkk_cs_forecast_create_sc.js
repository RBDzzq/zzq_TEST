/**
 * SC課FC作成
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/09     CPC_苑
 *
 */
//20230502 Sandbox to 本番  upload by zhou
/*
 * test
 */
function testForecastReport() {
	var w=document.documentElement.clientWidth;
    var h=document.documentElement.clientHeight;  
	var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_sc','customdeploy_djkk_sl_forecast_create_sc');
	theLink +='&subsidiary=3&location=1%052&vendor=0&item=0&brand=&date=2021/11/14&search=T';
	theLink += '&width='+w;
	theLink += '&height='+h;
	window.ischanged = false;
	location.href = theLink;
}
/*
 * 検索に戻る
 */
function backToSearch() {

	var date = nlapiGetFieldValue('custpage_date');
	var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
	var locationValue=nlapiGetFieldValue('custpage_location');
	var vendor=nlapiGetFieldValue('custpage_vendor');
	var item=nlapiGetFieldValue('custpage_item');
    var brand=nlapiGetFieldValue('custpage_brand');	
    var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_sc','customdeploy_djkk_sl_forecast_create_sc');
		theLink +='&subsidiary=' + subsidiary;
		theLink +='&location=' + locationValue;
		theLink +='&vendor=' + vendor;
		theLink +='&item=' + item;
		theLink +='&brand=' + brand;
		theLink +='&date=' + date;
		window.ischanged = false;
		location.href = theLink;
}

/*
 * SC課FC作成
 */
function creatForecastReport() {

	var date = nlapiGetFieldValue('custpage_date');
	var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
	var locationValue=nlapiGetFieldValue('custpage_location');
	var vendor=nlapiGetFieldValue('custpage_vendor');
	var item=nlapiGetFieldValue('custpage_item');
    var brand=nlapiGetFieldValue('custpage_brand');
	if (isEmpty(date)) {
		alert('「基準日」入力必須');
	}else if (isEmpty(subsidiary)||subsidiary=='0') {
		alert('「連結」入力必須');
	}else if (isEmpty(locationValue)||locationValue=='0') {
		alert('「場所」入力必須');
	}
//	else if ((isEmpty(vendor)||vendor=='0')&&(isEmpty(brand)||brand=='0')) {
//		alert('「仕入先」または「ブランド」を入力する必要があります');
//	}
	else{
		var width=document.documentElement.clientWidth;
	    var height=document.documentElement.clientHeight;
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_sc','customdeploy_djkk_sl_forecast_create_sc');
		theLink +='&subsidiary=' + subsidiary;
		theLink +='&location=' + locationValue;
		theLink +='&vendor=' + vendor;
		theLink +='&item=' + item;
		theLink +='&brand=' + brand;
		theLink +='&date=' + date;
		theLink += '&width='+width;
		theLink += '&height='+height;
		theLink +='&search=T';
		window.ischanged = false;
		location.href = theLink;
	} 
}

/*
 * 	Actual IN
 */
function actualInPopUp(itemId,locationId,weekNum,wkFirstDay,subsidiary,type){
	
	// DJ_SC課FC作成POリスト
	var link =nlapiResolveURL('SUITELET', 'customscript_djkk_sl_forecast_poview','customdeploy_djkk_sl_forecast_poview');
	link+='&weeknum=' + weekNum;
	link+='&item=' + itemId;
	link+='&locationid=' + locationId;
	link+='&firstdate=' + wkFirstDay;
	link+='&subsidiary=' + subsidiary;
	link+='&type=' + type;
	nlExtOpenWindow(link, 'newwindow',700, 700, this, false, type+'リスト');
	//open(link,'_actualInPopUp','top=150,left=250,width=750,height=300,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}

/*
 * Comment
 */
function commentPopUp(itemId,locationId,weekNum){
	var theComtlink=nlapiResolveURL('SUITELET', 'customscript_djkk_sl_forecast_comment','customdeploy_djkk_sl_forecast_comment');
	var changedFieldId=itemId+'|'+locationId+'|'+weekNum;
	var comment=document.getElementById("CommentText:"+changedFieldId).value;
	theComtlink+='&comment=' +comment;
	theComtlink+='&changedFieldId=' + changedFieldId;
	//nlExtOpenWindow(theComtlink, 'newwindow',500, 300, this, false, 'Comment画面');
	open(theComtlink,'_commentPopUp','top=150,left=250,width=750,height=300,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}

/*U178
 * ・Forecastで編集可能な部分をクリアする機能が欲しい。以前からのご要望。
 * */
function inAddInLessClear(){
   var clearArrayTxt=nlapiGetFieldValue('custpage_cleararray');
   if(!isEmpty(clearArrayTxt)){
   var clearArray=clearArrayTxt.split(",");
   for(var s=0;s<clearArray.length;s++){
	 
	   try{
		   var wkN=clearArray[s];
		   if(!isEmpty(wkN)){
		  var field=wkN.split("&");
		  var fieldId=field[0];
		  document.getElementById(fieldId).value='';
		  var fielaArray=(fieldId.split(":")[1]).split("|");
		  var weeks=field[1];
		  var itemId=fielaArray[0];
		  var locationId=fielaArray[1];
		  var weekNum=fielaArray[2];
		  insideDataChange(itemId,locationId,weekNum,weeks);
		  }
		   
	   }catch(e){
		   
	   }   
   }
   }
}

/*
 * IN(+)/IN(-)が入力されると、Balanceは自動的に計算されます
 */
function insideDataChange(itemId,locationId,weekNum,weeks){
	var WeekNumYear=weekNum.split('-')[0];
	var WeekNumWeek=weekNum.split('-')[1];	
	var changedFieldId=itemId+'|'+locationId+'|'+weekNum;
	var inadd=document.getElementById("inadd:"+changedFieldId).value;
	var inless=document.getElementById("inless:"+changedFieldId).value;
//	inadd=inadd.replace(/[^\d]/g,'');
//	inless=inless.replace(/[^\d]/g,'');
	inadd=inadd.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/,'$1');
	inless=inless.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/,'$1');	
	document.getElementById("inadd:"+changedFieldId).value=inadd;
	document.getElementById("inless:"+changedFieldId).value=inless;
	var oldchangedFieldId=changedFieldId;
	
	var wyFlag=true;
	
	
	var inaddisd=0;
	var inlessisd=0;
  for(var i=0;i<weeks;i++){
//	var balanceInitial=Number(document.getElementById("balanceInitial:"+changedFieldId).value);
//    inaddisd+=Number(document.getElementById("inadd:"+changedFieldId).value)-Number(document.getElementById("inaddInitial:"+changedFieldId).value);
//	inlessisd+=Number(document.getElementById("inless:"+changedFieldId).value)-Number(document.getElementById("inlessInitial:"+changedFieldId).value);
//	var newBalanceInitial=Number(Number(balanceInitial)+Number(inaddisd)-Number(inlessisd));
	  var balance=Number(document.getElementById("balanceInput:"+changedFieldId).value);	
	   var balanceInitial=balance;
//	var balanceInitial=Number(document.getElementById("balanceInitial:"+changedFieldId).value);
	
    inaddisd+=   Number(document.getElementById("inadd:"+changedFieldId).value)    -    Number(document.getElementById("inaddInitial:"+changedFieldId).value);
	
    
	inlessisd+=   Number(document.getElementById("inless:"+changedFieldId).value)    -    Number(document.getElementById("inlessInitial:"+changedFieldId).value);
    
	var newBalanceInitial  =  Number(Number(balanceInitial)   +Number(inaddisd)     -Number(inlessisd));
    
    
    
    
    
    
    
    
    
	document.getElementById("balance:"+changedFieldId).innerHTML = Number(newBalanceInitial.toFixed(2));
	document.getElementById("balanceInput:"+changedFieldId).value = Number(newBalanceInitial.toFixed(2));
	document.getElementById("inaddInitial:"+changedFieldId).value=Number(document.getElementById("inadd:"+changedFieldId).value);
	document.getElementById("inlessInitial:"+changedFieldId).value=Number(document.getElementById("inless:"+changedFieldId).value);
	var weekNumber='';	
	oldchangedFieldId=changedFieldId;
	if(WeekNumWeek<=51){
		WeekNumWeek=Number(Number(WeekNumWeek)+1);
		if(Number(WeekNumWeek)<10){
			WeekNumWeek='0'+WeekNumWeek;
		}
		weekNumber=WeekNumYear+'-'+WeekNumWeek;
	}else{
		if(wyFlag){
		WeekNumYear=Number(Number(WeekNumYear)+1);
		WeekNumWeek=0;
		wyFlag=false;
		}
		WeekNumWeek=WeekNumWeek+1;
		if(Number(WeekNumWeek)<10){
			WeekNumWeek='0'+WeekNumWeek;
		}
		weekNumber=WeekNumYear+'-'+WeekNumWeek;
	}
	changedFieldId=itemId+'|'+locationId+'|'+weekNumber;
  }
    var WeekNumYear=weekNum.split('-')[0];
	var WeekNumWeek=weekNum.split('-')[1];	
	var changedFieldId=itemId+'|'+locationId+'|'+weekNum;
  for(var i=0;i<weeks;i++){
	  document.getElementById("balanceInitial:"+changedFieldId).value = Number(document.getElementById("balanceInput:"+changedFieldId).value);
		if(WeekNumWeek<=51){
			WeekNumWeek=Number(Number(WeekNumWeek)+1);
			if(Number(WeekNumWeek)<10){
				WeekNumWeek='0'+WeekNumWeek;
			}
			weekNumber=WeekNumYear+'-'+WeekNumWeek;
		}else{
			if(wyFlag){
			WeekNumYear=Number(Number(WeekNumYear)+1);
			WeekNumWeek=0;
			wyFlag=false;
			}
			WeekNumWeek=WeekNumWeek+1;
			if(Number(WeekNumWeek)<10){
				WeekNumWeek='0'+WeekNumWeek;
			}
			weekNumber=WeekNumYear+'-'+WeekNumWeek;
		}
		changedFieldId=itemId+'|'+locationId+'|'+weekNumber;
	  }
}
// old
//function insideDataChange(itemId,locationId,weekNum,weeks){
//	
//	var WeekNumYear=weekNum.split('-')[0];
//	var WeekNumWeek=weekNum.split('-')[1];	
//	var changedFieldId=itemId+'|'+locationId+'|'+weekNum;		
//	var inadd=document.getElementById("inadd:"+changedFieldId).value;
//	var inless=document.getElementById("inless:"+changedFieldId).value;
//	inadd=inadd.replace(/[^\d]/g,'');
//	inless=inless.replace(/[^\d]/g,'');
//	document.getElementById("inadd:"+changedFieldId).value=inadd;
//	document.getElementById("inless:"+changedFieldId).value=inless;
//	var oldchangedFieldId=changedFieldId;
//	var balance=Number(document.getElementById("balanceInput:"+changedFieldId).value);
//	//var balanceInitial=Number(document.getElementById("balanceInitial:"+changedFieldId).value);//old
//	var wyFlag=true;
//  for(var i=0;i<weeks;i++){	
//	var balanceInitial=Number(document.getElementById("balanceInitial:"+changedFieldId).value);//new
//	if(!isEmpty(inadd)||!isEmpty(inless)){
//	var newBalance=Number(balanceInitial+Number(inadd)-Number(inless));
//	 
//	 if(i!=0){
//	 var inaddisd=document.getElementById("inadd:"+changedFieldId).value;
//	 var inlessisd=document.getElementById("inless:"+changedFieldId).value;
//	 var newBalanceInitial=Number(newBalance+Number(inaddisd)-Number(inlessisd));
//	 document.getElementById("balance:"+changedFieldId).innerHTML = newBalanceInitial;
//	 document.getElementById("balanceInput:"+changedFieldId).value = newBalanceInitial;
//	// document.getElementById("balanceInitial:"+changedFieldId).value = newBalanceInitial;//old
//	 }else{
//		 document.getElementById("balance:"+changedFieldId).innerHTML = newBalance;
//		 document.getElementById("balanceInput:"+changedFieldId).value = newBalance; 
//	 }
//	}else{
//		 if(i==0){
//		var oldBalance=balanceInitial;
//		 document.getElementById("balance:"+changedFieldId).innerHTML = oldBalance;
//		 document.getElementById("balanceInput:"+changedFieldId).value = oldBalance;
//		 }
//		 else{
//		var inaddn=document.getElementById("inadd:"+changedFieldId).value;
//		var inlessn=document.getElementById("inless:"+changedFieldId).value;
//		//var beforebalance=Number(document.getElementById("balanceInput:"+oldchangedFieldId).value)+Number(inaddn)-Number(inlessn);//old
//		var beforebalance=Number(document.getElementById("balanceInitial:"+changedFieldId).value)+Number(inaddn)-Number(inlessn);//new
//		document.getElementById("balance:"+changedFieldId).innerHTML = beforebalance;
//		document.getElementById("balanceInput:"+changedFieldId).value = beforebalance;
//		 }
//	}
//	var weekNumber='';	
//	oldchangedFieldId=changedFieldId;
//	if(WeekNumWeek<=51){
//		WeekNumWeek=Number(Number(WeekNumWeek)+1);
//		if(Number(WeekNumWeek)<10){
//			WeekNumWeek='0'+WeekNumWeek;
//		}
//		weekNumber=WeekNumYear+'-'+WeekNumWeek;
//	}else{
//		if(wyFlag){
//		WeekNumYear=Number(Number(WeekNumYear)+1);
//		WeekNumWeek=0;
//		wyFlag=false;
//		}
//		WeekNumWeek=WeekNumWeek+1;
//		if(Number(WeekNumWeek)<10){
//			WeekNumWeek='0'+WeekNumWeek;
//		}
//		weekNumber=WeekNumYear+'-'+WeekNumWeek;
//	}
//	changedFieldId=itemId+'|'+locationId+'|'+weekNumber;
//  }
//}

/*
 *更新
 */
function refresh(){
	window.ischanged = false;
	location=location;
}

/*
 *アップロード
 */
function updateDate(){
	//20230612 add by zhou start
    //CH645
    var batchStatus = clientScriptGetBatchStatus('customscript_djkk_ss_forecast_create_sc','customdeploy_djkk_ss_forecast_create_sc');
    if(batchStatus == 'PENDING' || batchStatus == 'PROCESSING'){
    	alert('他の実行プロセスがすでに存在します。お待ちください。後で再試行してください。')
	}else{
		nlapiSetFieldValue('custpage_run_before_status','<font color="red" style="font-weight:bold;font-size:12pt">登録処理実行中</font>');//20230804 add by zhou start CH776
	    setButtunButtonDisable('custpage_update')
		var date=nlapiGetFieldValue('custpage_date');
		var referenceDate=dateAddDays(date, -7);	
		var changeDate = dateAddDays(date, -7*27);
		var dateArray = new Array();
		var systemDate=nlapiDateToString(getSystemTime());
		for (var da = 0; da < 54; da++) {
			var dateweek = newGetYearWeek(changeDate);
			var pushyear = getYear(changeDate);
			var pushdateS = getLastSundayYYYYMMDD(changeDate,false);
			var pushdateE = dateAddDays(pushdateS, 6);
	//		if (dateweek == '52') {
	//			dateweek = '1';
	//			pushyear = Number(pushyear) + 1;
	//		} else if(dateweek == '53'){
	//			dateweek = '2';
	//			pushyear = Number(pushyear) + 1;
	//		}else {
	//			dateweek = Number(dateweek) + 1;
	//		}
			if(Number(dateweek)<10){
				dateweek='0'+dateweek;
			}
	//		if(changeDate == '2023/03/12' ||changeDate == '2023/03/19'  ){
	//			alert('changeDate : '+changeDate  +'----------------'+'dateweek : '+dateweek);
	//		}
			var weekNumber=pushyear+'-'+dateweek;
			dateArray.push([ weekNumber, pushyear,dateweek, pushdateS,pushdateE,changeDate]);
			changeDate = dateAddDays(changeDate, 7);
		}
		var subsidiaryPar = nlapiGetFieldValue('custpage_subsidiary');
		var allItemArray = nlapiGetFieldValues('custpage_itemall');
		var locations = nlapiGetFieldValues('custpage_location');
	
		var searchFilters=[
							   ["custrecord_djkk_so_fc_subsidiary","anyof",subsidiaryPar], 
							   "AND", 
							   ["custrecord_djkk_so_fc_item.internalid","anyof",allItemArray],
							   "AND", 
							   ["custrecord_djkk_so_fc_location_area","anyof",locations]
							];
		
		var forecastSearch = nlapiSearchRecord("customrecord_djkk_so_forecast",null,searchFilters, 
				[
	              new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP").setSort(false),
				   new nlobjSearchColumn("itemid","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP"), 
				   new nlobjSearchColumn("custrecord_djkk_so_fc_location_area",null,"GROUP"), 
				   new nlobjSearchColumn("salesdescription","CUSTRECORD_DJKK_SO_FC_ITEM","GROUP")
				]
				);
		var dataCache='[';
		if (!isEmpty(forecastSearch)) {
			for (var itemc = 0; itemc < forecastSearch.length; itemc++) {
				if(itemc!=0){
				dataCache+=',';
				}
				dataCache+='{';
				var fcColumnID = forecastSearch[itemc].getAllColumns();
				var itemInternalid = forecastSearch[itemc].getValue(fcColumnID[0]);
				var itemLocationId = forecastSearch[itemc].getValue(fcColumnID[2]);
				dataCache+='"subsidiary":"'+subsidiaryPar+'"';
				dataCache+=',';
				dataCache+='"itemInternalid":"'+itemInternalid+'"';
				dataCache+=',';
				dataCache+='"itemLocationId":"'+itemLocationId+'"';			
				for (var indate = 0; indate < 54; indate++) {
					var weekNum=dateArray[indate][0];
					var year=dateArray[indate][1];
					var week=dateArray[indate][2];
					var startDate=dateArray[indate][3];
					var endDate=dateArray[indate][4];
					var changedFieldId=itemInternalid+'|'+itemLocationId+'|'+weekNum;
					dataCache+=',';
					dataCache+='"'+weekNum+'":{';
					dataCache+='"Year":"'+year+'"';
					dataCache+=',';
					dataCache+='"Week":"'+week+'"';
					dataCache+=',';
					dataCache+='"StartDate":"'+startDate+'"';
					dataCache+=',';
					dataCache+='"EndDate":"'+endDate+'"';
					dataCache+=',';
					dataCache+='"InAdd":"'+document.getElementById("inadd:"+changedFieldId).value+'"';
					dataCache+=',';
					dataCache+='"InLess":"'+document.getElementById("inless:"+changedFieldId).value+'"';
					dataCache+=',';
					dataCache+='"Balance":"'+document.getElementById("balance:"+changedFieldId).innerHTML+'"';
					dataCache+=',';
					dataCache+='"Comment":"'+document.getElementById("CommentText:"+changedFieldId).value+'"';
					dataCache+=',';
					dataCache+='"ActualIN":"'+document.getElementById("actualIN:"+changedFieldId).value+'"';
					dataCache+=',';
					dataCache+='"ForecastOut":"'+document.getElementById("forecastOut:"+changedFieldId).value+'"';
					dataCache+=',';
					dataCache+='"fcId":"'+document.getElementById("fcId:"+changedFieldId).value+'"';
					dataCache+='}';
				}
				dataCache+='}';
			}
			dataCache+=']';
		}
	
		var cacheRecord=nlapiCreateRecord('customrecord_djkk_forecast_cache_table');
		cacheRecord.setFieldValue('custrecord_djkk_data_cache', dataCache);
		var cacheRecordID=nlapiSubmitRecord(cacheRecord, false, true);
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_sc','customdeploy_djkk_sl_forecast_create_sc');
	
		    
		var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
		var locationValue = nlapiGetFieldValue('custpage_location');
		var vendor = nlapiGetFieldValue('custpage_vendor');
		var item = nlapiGetFieldValue('custpage_item');
		var brand = nlapiGetFieldValue('custpage_brand');
		theLink += '&subsidiary=' + subsidiary;
		theLink += '&location=' + locationValue;
		theLink += '&vendor=' + vendor;
		theLink += '&item=' + item;
		theLink += '&brand=' + brand;
		
		theLink +='&cacheRecordID='+cacheRecordID;
		theLink +='&date=' + date;
		window.ischanged = false;
		location.href = theLink;
	}
    //20230612 add by zhou end
}

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
	if(name==='custpage_subsidiary'){
		var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
		var date = nlapiGetFieldValue('custpage_date');
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_sc','customdeploy_djkk_sl_forecast_create_sc');
		theLink = theLink +'&subsidiary=' + subsidiary+'&date=' + date;
		window.ischanged = false;
		location.href = theLink;
	}
	if (name === 'custpage_vendor'||name === 'custpage_brand') {
		var date = nlapiGetFieldValue('custpage_date');
		var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
		var locationValue=nlapiGetFieldValue('custpage_location');
		var vendor=nlapiGetFieldValue('custpage_vendor');
	    var brand=nlapiGetFieldValue('custpage_brand');
	    var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_sc','customdeploy_djkk_sl_forecast_create_sc');
		theLink +='&subsidiary=' + subsidiary;
		theLink +='&location=' + locationValue;
		theLink +='&vendor=' + vendor;
		theLink +='&brand=' + brand;
		theLink +='&date=' + date;
		window.ischanged = false;
		location.href = theLink;		
	}
	if (name === 'custpage_location') {
		var searchtype = nlapiGetFieldValue('custpage_searchtype');
		if (searchtype == 'T') {
			var date = nlapiGetFieldValue('custpage_date');
			var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
			var locationValue = nlapiGetFieldValue('custpage_location');
			var vendor = nlapiGetFieldValue('custpage_vendor');
			var item = nlapiGetFieldValue('custpage_item');
			var brand = nlapiGetFieldValue('custpage_brand');
			if (isEmpty(locationValue) || locationValue == '0') {
				alert('「場所」入力必須');
			} else {
				var width=document.documentElement.clientWidth;
			    var height=document.documentElement.clientHeight;
				var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_create_sc','customdeploy_djkk_sl_forecast_create_sc');
				theLink += '&subsidiary=' + subsidiary;
				theLink += '&location=' + locationValue;
				theLink += '&vendor=' + vendor;
				theLink += '&item=' + item;
				theLink += '&brand=' + brand;
				theLink += '&date=' + date;
				theLink += '&width='+width;
				theLink += '&height='+height;
				theLink += '&search=T';
				window.ischanged = false;
				location.href = theLink;
			}
		}
	}
}
