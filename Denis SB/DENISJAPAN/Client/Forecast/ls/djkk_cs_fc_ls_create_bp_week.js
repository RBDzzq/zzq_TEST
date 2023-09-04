/**
 * �c�ƌv�������_LS
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
        alert('�u����v���͕K�{');
    }
    else if(isEmpty(user)||Number(user)==0){
   	 alert('�uBP�v���͕K�{');
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
 * �f�[�^�X�V
 */
function updateData() {
	// �[�i��
//	var delivery= nlapiGetFieldValue('custpage_delivery_hidden');
    // ���O�C�����[�U���擾
	 var user = nlapiGetFieldValue('custpage_user_hidden');
    // ���O�C�����[�U�̘A�����擾
    var subsidiary = nlapiGetFieldValue('custpage_subsidiary_hidden');
    // ���
    var date = nlapiGetFieldValue('custpage_date_hidden');
    // �u�����h
    var brand = nlapiGetFieldValue('custpage_brand_hidden');
    // ���i�z��
    var item = nlapiGetFieldValue('custpage_item_hidden');
    // �eFC���̓���input�G�������g���擾
    var fcInputEles = document.getElementsByName('fcQuan');
    // FC���̓���input�̌������擾
    var elesLen = fcInputEles.length;
    // �L���V���[�e�[�u���p�ۑ��l���쐬
    

//    alert(JSON.stringify(fcInputEles))
    var cacheEles = '[';
    // �ۑ��f�[�^�쐬
//    alert(JSON.stringify(fcInputEles[0].getAttribute('id').split(/:|\|/)))
    for (var i = 0; i < elesLen; i++) {
        // FC���̓���input�G�������g
        var fcInputEle = fcInputEles[i];
        // ID�𕪊�����: 'fcid' + itemid + locationid + yearMonth
        var eleIdArr = fcInputEle.getAttribute('id').split(/:|\|/);
        //�[�i��
        var delivery= eleIdArr[7];
        // ID
        var internalId = eleIdArr[6];
        // ���iID
        var itemId = eleIdArr[1];
        // �ꏊID
        var locationid = eleIdArr[2];
        // �N
        var year = eleIdArr[3];
        // ��
        var month = eleIdArr[4];
        // week
        var week = eleIdArr[5];
        // fc��
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

    // �L���V���[���R�[�h�e�[�u�����擾
    var cacheRecord=nlapiCreateRecord('customrecord_djkk_forecast_cache_table');
    // �l���t�B�[���h�I�u�W�F�N�g�ɐݒ�
    cacheRecord.setFieldValue('custrecord_djkk_data_cache', cacheEles);
    // �L���V���[�e�[�u���l��ۑ����A�L���V���[���R�[�hID���擾
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
 * ��ʍX�V
 */
function refresh(){
	window.ischanged = false;
	location=location;
}