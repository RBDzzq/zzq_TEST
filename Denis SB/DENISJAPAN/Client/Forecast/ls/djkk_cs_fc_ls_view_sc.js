/**
 * SC課FCレポート_LS
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/09     CPC_苑
 *
 */

/*
 * test
 */
function testForecastReport() {
	var w=document.documentElement.clientWidth;
    var h=document.documentElement.clientHeight;
	var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_view_sc','customdeploy_djkk_sl_fc_ls_view_sc');
	theLink +='&subsidiary=2&location=1%052&vendor=0&item=0&brand=&date=2021/11/14&search=T';
	theLink += '&width='+w;
	theLink += '&height='+h;
	var subsidiaryTxt=nlapiGetFieldText('custpage_subsidiary');
	var locationTxt = nlapiGetFieldTexts('custpage_location');
	var vendorTxt = nlapiGetFieldText('custpage_vendor');
	var itemTxt = nlapiGetFieldTexts('custpage_item');
	var brandTxt = nlapiGetFieldTexts('custpage_brand');
	theLink += '&subsidiarytxt=' + subsidiaryTxt;
	theLink += '&locationtxt=' + locationTxt;
	theLink += '&vendortxt=' + vendorTxt;
	theLink += '&itemtxt=' + itemTxt;
	theLink += '&brandtxt=' + brandTxt;
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
    var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_view_sc','customdeploy_djkk_sl_fc_ls_view_sc');
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
    var subsidiaryTxt=nlapiGetFieldText('custpage_subsidiary');
    var locationTxt=nlapiGetFieldTexts('custpage_location');
	var vendorTxt=nlapiGetFieldText('custpage_vendor');
	var itemTxt=nlapiGetFieldTexts('custpage_item');
    var brandTxt=nlapiGetFieldTexts('custpage_brand');
    
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
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_view_sc','customdeploy_djkk_sl_fc_ls_view_sc');
		theLink +='&subsidiary=' + subsidiary;
		theLink +='&location=' + locationValue;
		theLink +='&vendor=' + vendor;
		theLink +='&item=' + item;
		theLink +='&brand=' + brand;
		theLink +='&date=' + date;
		theLink += '&width='+width;
		theLink += '&height='+height;
		theLink += '&subsidiarytxt='+subsidiaryTxt;
		theLink += '&locationtxt='+locationTxt;
		theLink += '&vendortxt='+vendorTxt;
		theLink += '&itemtxt='+itemTxt;
		theLink += '&brandtxt='+brandTxt;
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
	var link =nlapiResolveURL('SUITELET', 'customscript_djkk_sl_fc_ls_poview','customdeploy_djkk_sl_fc_ls_poview');
	link+='&weeknum=' + weekNum;
	link+='&item=' + itemId;
	link+='&locationid=' + locationId;
	link+='&firstdate=' + wkFirstDay;
	link+='&subsidiary=' + subsidiary;
	link+='&type=' + type;
	nlExtOpenWindow(link, 'newwindow',700, 700, this, false, type+'リスト_LS');
	//open(link,'_actualInPopUp','top=150,left=250,width=750,height=300,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}

///*
// * Comment
// */
//function commentPopUp(itemId,locationId,weekNum){
//	var theComtlink=nlapiResolveURL('SUITELET', 'customscript_djkk_sl_forecast_comment','customdeploy_djkk_sl_forecast_comment');
//	var changedFieldId=itemId+'|'+locationId+'|'+weekNum;
//	var comment=document.getElementById("CommentText:"+changedFieldId).value;
//	theComtlink+='&comment=' +comment;
//	theComtlink+='&changedFieldId=' + changedFieldId;
//	//nlExtOpenWindow(theComtlink, 'newwindow',500, 300, this, false, 'Comment画面');
//	open(theComtlink,'_commentPopUp','top=150,left=250,width=750,height=300,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
//}

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
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_view_sc','customdeploy_djkk_sl_fc_ls_view_sc');
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
	    var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_view_sc','customdeploy_djkk_sl_fc_ls_view_sc');
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
			var subsidiaryTxt=nlapiGetFieldText('custpage_subsidiary');
			var locationTxt=nlapiGetFieldTexts('custpage_location');
			var vendorTxt=nlapiGetFieldText('custpage_vendor');
			var itemTxt=nlapiGetFieldTexts('custpage_item');
			var brandTxt=nlapiGetFieldTexts('custpage_brand');
			if (isEmpty(locationValue) || locationValue == '0') {
				alert('「場所」入力必須');
			} else {
				var width=document.documentElement.clientWidth;
			    var height=document.documentElement.clientHeight;
			    var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_view_sc','customdeploy_djkk_sl_fc_ls_view_sc');
				theLink += '&subsidiary=' + subsidiary;
				theLink += '&location=' + locationValue;
				theLink += '&vendor=' + vendor;
				theLink += '&item=' + item;
				theLink += '&brand=' + brand;
				theLink += '&date=' + date;
				theLink += '&width='+width;
				theLink += '&height='+height;
				theLink += '&subsidiarytxt='+subsidiaryTxt;
				theLink += '&locationtxt='+locationTxt;
				theLink += '&vendortxt='+vendorTxt;
				theLink += '&itemtxt='+itemTxt;
				theLink += '&brandtxt='+brandTxt;
				theLink += '&search=T';
				window.ischanged = false;
				location.href = theLink;
			}
		}
	}
}
