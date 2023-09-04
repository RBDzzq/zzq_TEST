/**
 * �c�ƌv���񃌃|�[�g
 *
 * Version    Date            Author           Remarks
 * 1.00       2021/06/24     CPC_��
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
    // �u�����h�ύX���ꂽ�ꍇ
    if (name == 'custpage_brand'||name == 'custpage_subsidiary'||name == 'custpage_user') {
        var date = nlapiGetFieldValue('custpage_date');
        var brands = nlapiGetFieldValue('custpage_brand');
        var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
        var user= nlapiGetFieldValue('custpage_user');
        // url
        var linkUrl = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_view_bp','customdeploy_djkk_sl_forecast_view_bp');
        // parameters
        linkUrl += '&op=cb';
        linkUrl += '&date=' + date;
        linkUrl += '&brand=' + brands;
        linkUrl += '&subsidiary=' + subsidiary;
        linkUrl += '&user=' + user;
        window.ischanged = false;
        location.href = linkUrl;
    }
}

/**
 * �c�ƌv���񃌃|�[�g
 */
function viewForecastList(){
    var date = nlapiGetFieldValue('custpage_date');
    var item = nlapiGetFieldValue('custpage_item');
    var brands = nlapiGetFieldValue('custpage_brand');
    var itemNm = nlapiGetFieldText('custpage_item');
    var brandNm = nlapiGetFieldText('custpage_brand');
    var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
    var user= nlapiGetFieldValue('custpage_user');
    var width=document.documentElement.clientWidth;
    var height=document.documentElement.clientHeight;
    if (isEmpty(date)) {
        alert('�u����v���͕K�{');
    }
    else if(isEmpty(user)){
      	 alert('�uBP�v���͕K�{');
      }
    else{
        // url
        var aLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_view_bp','customdeploy_djkk_sl_forecast_view_bp');
        // parameters
        aLink += '&op=s';
        aLink += '&date=' + date;
        aLink += '&brand=' + brands;
        aLink += '&productCodes=' + item;
        aLink += '&subsidiary=' + subsidiary;
        aLink += '&productNm=' + itemNm;
        aLink += '&brandNm=' + brandNm;
        aLink += '&width=' + width;
        aLink += '&height=' + height;
        aLink += '&user=' + user;
        window.ischanged = false;
        location.href = aLink;
    }
}
/*
 * MEMO�\�����q���E�W��
 */
function memoLook(id,memo){
	var theComtlink=nlapiResolveURL('SUITELET', 'customscript_djkk_sl_forecast_comment','customdeploy_djkk_sl_forecast_comment');
	var changedFieldId= id;
	var memoComment=document.getElementById('memoLookText:'+id).value;
	theComtlink+='&comment=' +memoComment;
	theComtlink+='&changedFieldId=' + changedFieldId;
	theComtlink+='&type=' + 'report-lookMemo';
	//nlExtOpenWindow(theComtlink, 'newwindow',500, 300, this, false, 'Comment���');
	open(theComtlink,'_commentPopUp','top=150,left=250,width=750,height=300,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}
/**
 * �����ɖ߂�
 */
function backToSearch() {
    // ���
    var date = nlapiGetFieldValue('custpage_date_hidden');
    // �u�����h
    var brand = nlapiGetFieldValue('custpage_brand_hidden');
    // ���i�z��
    var item = nlapiGetFieldValue('custpage_item_hidden');
    var subsidiary = nlapiGetFieldValue('custpage_subsidiary_hidden');
    var user = nlapiGetFieldValue('custpage_user_hidden');
    // url
    var linkUrl = nlapiResolveURL('SUITELET','customscript_djkk_sl_forecast_view_bp','customdeploy_djkk_sl_forecast_view_bp');
    // parameters
    linkUrl += '&op=back';
    linkUrl += '&date=' + date;
    linkUrl += '&brand=' + brand;
    linkUrl += '&productCodes=' + item;
    linkUrl += '&subsidiary=' + subsidiary;
    linkUrl += '&user=' + user;
    window.ischanged = false;
    location.href = linkUrl;
}