/**
 * �c�ƌv���񃌃|�[�g_LS_Week
 *
 * Version    Date            Author           Remarks
 * 1.00       2022/07/11     CPC_��
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
//        var delivery= nlapiGetFieldValue('custpage_delivery');
        // url
        var linkUrl = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_view_bp_wk','customdeploy_djkk_sl_fc_ls_view_bp_wk');
        // parameters
        linkUrl += '&op=cb';
        linkUrl += '&date=' + date;
        linkUrl += '&brand=' + brands;
        linkUrl += '&subsidiary=' + subsidiary;
        linkUrl += '&user=' + user;
//        linkUrl += '&delivery=' + delivery;
        window.ischanged = false;
        location.href = linkUrl;
    }
}

/**
 * 
 */
function viewForecastList(){
    var date = nlapiGetFieldValue('custpage_date');
    var item = nlapiGetFieldValue('custpage_item');
    var brands = nlapiGetFieldValue('custpage_brand');
    var itemNm = nlapiGetFieldText('custpage_item');
    var brandNm = nlapiGetFieldText('custpage_brand');
    var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
    var user= nlapiGetFieldValue('custpage_user');
//    var delivery= nlapiGetFieldValue('custpage_delivery');
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
        var aLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_view_bp_wk','customdeploy_djkk_sl_fc_ls_view_bp_wk');
        // parameters
        aLink += '&op=s';
        aLink += '&date=' + date;
        aLink += '&brand=' + brands;
        aLink += '&productCodes=' + item;
        aLink += '&productNm=' + itemNm;
        aLink += '&brandNm=' + brandNm;
        aLink += '&width=' + width;
        aLink += '&height=' + height;
        aLink += '&subsidiary=' + subsidiary;
        aLink += '&user=' + user;
//        aLink += '&delivery=' + delivery;
        window.ischanged = false;
        location.href = aLink;
    }
}



/**
 * �����ɖ߂�
 */
function backToSearch() {
	// �[�i��
//	var delivery= nlapiGetFieldValue('custpage_delivery_hidden');
    // ���
    var date = nlapiGetFieldValue('custpage_date_hidden');
    // �u�����h
    var brand = nlapiGetFieldValue('custpage_brand_hidden');
    // ���i�z��
    var item = nlapiGetFieldValue('custpage_item_hidden');
    var subsidiary = nlapiGetFieldValue('custpage_subsidiary_hidden');
    var user = nlapiGetFieldValue('custpage_user_hidden');

    // url
    var linkUrl = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_view_bp_wk','customdeploy_djkk_sl_fc_ls_view_bp_wk');
    // parameters
    linkUrl += '&op=back';
    linkUrl += '&date=' + date;
    linkUrl += '&brand=' + brand;
    linkUrl += '&productCodes=' + item;
    linkUrl += '&subsidiary=' + subsidiary;
    linkUrl += '&user=' + user;
//    linkUrl += '&delivery=' + delivery;
    window.ischanged = false;
    location.href = linkUrl;
}

/*
 * ��ʍX�V
 */
function refresh(){
	window.ischanged = false;
	location=location;
}