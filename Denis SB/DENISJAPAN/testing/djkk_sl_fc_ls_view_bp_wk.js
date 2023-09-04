/**
 * �̔��v���񃌃|�[�g_LS_Week
 *
 * Version    Date            Author           Remarks
 * 1.00       2022/07/11     CPC_��
 *
 */
var pagedate=nlapiDateToString(getSystemTime());
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	nlapiLogExecution('debug','�c�ƌv���񃌃|�[�g_LS_Week','start')
	// request parameter: �A��
	var subsidiary=request.getParameter('subsidiary');
    // request parameter: ���
    var date = request.getParameter('date');
    pagedate=date;
    // request parameter: ����
    var operation = request.getParameter('op');
    // request parameter: ���i�R�[�h���X�g
    var rpProductCodes = request.getParameter('productCodes');
    // request parameter: �u�����h���X�g
    var rpBrand = request.getParameter('brand');
    // request parameter: ���i�����X�g
    var rpProductNms = request.getParameter('productNm');
    // request parameter: �u�����h�����X�g
    var rpBrandNms = request.getParameter('brandNm');
    // request parameter: ��ʕ�
    var rpSW = request.getParameter('width');
    // request parameter: �[�i��
    var delivery = request.getParameter('delivery');
    // request parameter: ��ʍ���
    var rpSH = request.getParameter('height');
 
    // ���HTML
    var htmlNote ='';
    // ���O�C�����[�U���擾
//    var user = nlapiGetUser();
    var user= request.getParameter('user');
//    var user= request.getParameter('user');
    // �c�ƌv���񃌃|�[�g�t�H�[�����쐬�@�i���O�͔̔��v��֕ύX�j
    var form = nlapiCreateForm('�̔��v���񃌃|�[�g_WEEK_LS', (operation == 's'));
    // client script��ݒ�
    form.setScript('customscript_djkk_cs_fc_ls_view_bp_wk');
    // �����̏ꍇ
    if (operation == 's') {
    	// ���������{
        var htmlAndExcelXMLObj = doSearch(user, date, rpBrand, rpProductCodes, rpBrandNms, rpProductNms, rpSW, rpSH,subsidiary);
     // Excel�_�E�����[�hURL�擾
        var excelExportURL = createExcelURL(htmlAndExcelXMLObj.xmlNote, htmlAndExcelXMLObj.xmlRowCnt);
        // ���������{�A����HTML���쐬����
        htmlNote += htmlAndExcelXMLObj.htmlNote;
        var delivery = htmlAndExcelXMLObj.deliveryArray;
        // ��ʂɃ{�^����ǉ�
        form.addButton('custpage_exportExcel', 'Excel�o��', excelExportURL);
        form.addButton('custpage_backToSearch', '�����ɖ߂�', 'backToSearch();');
        // ���hidden���ڂ��쐬�A����ʈ��p���p
        createHiddenItems(form, date, rpBrand, rpProductCodes,subsidiary,user,delivery);
    }
    // �f�[�^�X�V�̏ꍇ
    // ��L�ȊO�̏ꍇ
    else {
        // ��ʕ\�����ڍ쐬�����{
        doPageInit(form, date, user, rpBrand, rpProductCodes,subsidiary);
    }

    var feieldNote = form.addField('custpage_note', 'inlinehtml', '', '','');
    feieldNote.setDefaultValue(htmlNote);
    response.writePage(form);
}

/**
 * ��ʕ\�����ڍ쐬�����{
 * @param {*} pForm
 * @param {*} pDate
 * @param {*} pUser
 * @param {*} pBrand
 * @param {*} pProductCodes
 */
function doPageInit(pForm, pDate, pUser, pBrand, pProductCodes,subsidiary) {
    // �O���[�v��ݒ�
    pForm.addFieldGroup('custpage_group_filter', '��������');
    
    // ����t�B�[���h���쐬
    var dateField = pForm.addField('custpage_date', 'date', '���', null, 'custpage_group_filter');
    // �A���t�B�[���h���쐬
    var subsidiaryField=pForm.addField('custpage_subsidiary', 'select', '�A��', null,'custpage_group_filter');
    // �[�i��t�B�[���h���쐬
//    var deliverySelector = pForm.addField('custpage_delivery', 'multiselect', '�[�i��', null, 'custpage_group_filter');
    // BP�t�B�[���h���쐬
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
    // �u�����h�t�B�[���h���쐬
    var brandSelector = pForm.addField('custpage_brand', 'multiselect', '�u�����h', null, 'custpage_group_filter');
    // ���i���t�B�[���h���쐬
    var itemSelector = pForm.addField('custpage_item', 'multiselect', '���i��', null, 'custpage_group_filter');

    // �����K�{�ɐݒ�
    dateField.setMandatory(true);

    // �A����K�{�ɐݒ�
    subsidiaryField.setMandatory(true);
    // �O��ʂ̊�����ڂ�response��ʂɍĐݒ�
    if(isEmpty(pDate)){
    	pDate=nlapiDateToString(getSystemTime());
    }
    pagedate=pDate;
    dateField.setDefaultValue(pDate);
    // �e���͂̃T�C�Y��ݒ�
    dateField.setDisplaySize(80,1);
    subsidiaryField.setDisplaySize(240,15);
    brandSelector.setDisplaySize(240,15);
    itemSelector.setDisplaySize(240,15);
    userField.setDisplaySize(240,15);
//    deliverySelector.setDisplaySize(240,9);

    
    // REQUEST�O�̑I��l���Đݒ肷��
    if(!isEmpty(subsidiary)){
    subsidiaryField.setDefaultValue(subsidiary);
    }else{
    	//var userSub=nlapiLookupField('employee', nlapiGetUser(), 'subsidiary');
    	var userSub=getRoleSubsidiary();
    	 subsidiaryField.setDefaultValue(userSub);
    	 subsidiary=userSub;
    }
    // �����\���̏ꍇ�A�u�����h�̃��X�g���쐬����
    doBrandSearch(pUser, brandSelector,subsidiary);

    // �u�����h����łȂ��ꍇ
    if (isEmpty(pBrand)) {
    	pBrand='ALL';
    }
    // REQUEST�O�̑I��l���Đݒ肷��
    brandSelector.setDefaultValue(pBrand);

    // request parameter���i�R�[�h���X�g���u�����łȂ��ꍇ�A����������
    var rpProductCdArr = new Array();
    if (!isEmpty(pProductCodes)) {
        rpProductCdArr = pProductCodes.split('');
    }

    // �u�����h����łȂ����i���X�g�̌��������{
    if (!isEmpty(pBrand)) {
        // ���[�U�A�u�����h�����ƂɁA���i�R�[�h�z����擾
        var items = doItemSearch(pUser, pBrand, null,subsidiary);
        // �A�C�e���z�񂪃f�[�^����̏ꍇ
        if (!isEmpty(items.productArr)) {
            // �A�C�e������
            var len = items.productArr.length;
            // 1���ȏ�̏ꍇ�A�擪�Ɂu-���ׂ�-�v�̑I�������쐬
            if (len > 1) {
                itemSelector.addSelectOption('ALL', '-���ׂ�-', (rpProductCdArr.indexOf('ALL') >= 0));
            }
            // �A�C�e�����������[�v
            for (var i = 0; i < len; i++) {
                // �I�����
                var isSelected = (rpProductCdArr.indexOf(items.productArr[i].itemId) >= 0);
                // ���i�I�����X�g���쐬
                
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
    
	 // REQUEST�O�̑I��l���Đݒ肷��
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
    // request parameter���i�R�[�h���X�g���u�����łȂ��ꍇ�A����������
    var userCdArr = new Array();
    if (!isEmpty(pUser)) {
    	userCdArr = pUser.split('');
    }
    if (!isEmpty(bpSearch)) {
    	// �A�C�e������
        var bpl = bpSearch.length;
        // 1���ȏ�̏ꍇ�A�擪�Ɂu-���ׂ�-�v�̑I�������쐬
        if (bpl > 1) {
        	userField.addSelectOption('ALL', '-���ׂ�-', (userCdArr.indexOf('ALL') >= 0));
        }
    }
    if (isEmpty(pUser)) {
    	pUser='ALL';
    	userField.setDefaultValue(pUser);
    }
    if (!isEmpty(bpSearch)) {
	for(var bps=0;bps<bpSearch.length;bps++){
		// �I�����
        var bpIsSelected = (userCdArr.indexOf(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP")) >= 0);	
		userField.addSelectOption(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP"), bpSearch[bps].getValue("entityid","CUSTRECORD_DJKK_BP_LS","GROUP"),bpIsSelected);				
	}
    }
	userField.setMandatory(true);
	
	
//	// �[�i��  U533�ǉ�
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
//        // 1���ȏ�̏ꍇ�A�擪�Ɂu-���ׂ�-�v�̑I�������쐬
//        if (deliverySearch.length > 1) {
//        	deliverySelector.addSelectOption('ALL', '-���ׂ�-', (deliveryArr.indexOf('ALL') >= 0));
//        }
//    }
//    if (isEmpty(delivery)) {
//    	delivery='ALL';
//    	deliverySelector.setDefaultValue(delivery);
//    }
//    if (!isEmpty(deliverySearch)) {
//	for(var del =0;del<deliverySearch.length;del++){
//		// �I�����
//        var deliverySelected = (deliveryArr.indexOf(deliverySearch[del].getValue("custrecord_djkk_delivery_in_sheet",null,"GROUP")) >= 0);	
//        deliverySelector.addSelectOption(deliverySearch[del].getValue("custrecord_djkk_delivery_in_sheet",null,"GROUP"), deliverySearch[del].getValue("name","CUSTRECORD_DJKK_DELIVERY_IN_SHEET","GROUP"),deliverySelected);				
//	}
//    }
//    deliverySelector.setMandatory(true);

    // �����{�^�����쐬
    pForm.addButton('custpage_viewforecastlist', '����', 'viewForecastList();');
}


/**
 * ���hidden���ڂ��쐬
 * @param {*} pFrom
 * @param {*} pDate
 * @param {*} pBrand
 * @param {*} pProductCodes
 */
function createHiddenItems(pFrom, pDate, pBrand, pProductCodes,subsidiary,user,delivery) {

	// �[�i��t�B�[���h���쐬
    var deliveryField = pFrom.addField('custpage_delivery_hidden', 'text', '�[�i��', null, 'custpage_group_filter');
    // ����t�B�[���h���쐬
    var dateField = pFrom.addField('custpage_date_hidden', 'date', '���', null, 'custpage_group_filter');
    // �u�����h�t�B�[���h���쐬
    var brandFiled = pFrom.addField('custpage_brand_hidden', 'text', '�u�����h', null, 'custpage_group_filter');
     //�A���t�B�[���h���쐬
    var subsidiaryFiled = pFrom.addField('custpage_subsidiary_hidden', 'text', '�A��', null, 'custpage_group_filter');
    // ���i���t�B�[���h���쐬
    var itemField = pFrom.addField('custpage_item_hidden', 'text', '���i��', null, 'custpage_group_filter');
    // BP�t�B�[���h���쐬
    var userField = pFrom.addField('custpage_user_hidden', 'text', 'BP', null, 'custpage_group_filter');
    // �߂��̉�ʂɏ������ĕ\���̂��ߒl��ݒ�
    deliveryField.setDefaultValue(delivery);
    dateField.setDefaultValue(pDate);
    brandFiled.setDefaultValue(pBrand);
    itemField.setDefaultValue(pProductCodes);
    subsidiaryFiled.setDefaultValue(subsidiary);
    userField.setDefaultValue(user);

    // ��\���ɐݒ�
    deliveryField.setDisplayType('hidden');
    dateField.setDisplayType('hidden');
    brandFiled.setDisplayType('hidden');
    itemField.setDisplayType('hidden');
    subsidiaryFiled.setDisplayType('hidden');
    userField.setDisplayType('hidden');

}

/**
 * �S���Җ����擾
 * @param {*} pUser ID
 * @returns �S���Җ�
 */
function doUserSearch(pUser) {
	var nameArray={};
	var userArray=new Array();
    // �S���Җ�
    var name = '';
    // �S����ID
    // var id = '';
    // �����t�B���^�[
    var filters = [];
    // �������ڔz��
    var columns = [];

    // �t�B���^�[
    filters.push(["custrecord_djkk_bp_ls","noneof","@NONE@"]);
    if(pUser!='ALL'){
    	filters.push('and');
    	filters.push(["custrecord_djkk_bp_ls.internalid","anyof", pUser.split('')]);
    }
    // �������ڔz��
    columns.push(new nlobjSearchColumn("externalid","CUSTRECORD_DJKK_BP_LS","GROUP"));
    columns.push(new nlobjSearchColumn("lastname","CUSTRECORD_DJKK_BP_LS","GROUP"));
    columns.push(new nlobjSearchColumn("firstname","CUSTRECORD_DJKK_BP_LS","GROUP"));
    columns.push(new nlobjSearchColumn("custentity_djkk_employee_id","CUSTRECORD_DJKK_BP_LS","GROUP"));
    columns.push(new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_BP_LS","GROUP").setSort(false));

    // �S���Җ�����
    var sRes = getSearchResults('customrecord_djkk_person_registration_ls', null, filters, columns);

    // �S���Җ��������ʁA�f�[�^����̏ꍇ
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
 * �Y�����[�U���S�����Ă���u�����h���������A�u�����h�I�������쐬
 * @param {*} pUser
 * @param {*} brandFiled
 */
function doBrandSearch(pUser, brandFiled,subsidiary) {
    // �����t�B���^�[
    var filters = [["subsidiary","anyof",subsidiary]];
    
    // �������ڔz��
    var columns = [];

    // ����
    columns.push(new nlobjSearchColumn("internalid").setSort(false));
    columns.push(new nlobjSearchColumn("name"));

    // �u�����h����
    var sRes = getSearchResults('classification', null, filters, columns);

    // �I�����X�g�擪�ɁA�u-���ׂ�-�v�̑I�������쐬
    brandFiled.addSelectOption('ALL', '-���ׂ�-');

    // �u�����h�������ʁA�f�[�^����̏ꍇ
    if (!isEmpty(sRes)) {
        // �������ʌ���
        var len = sRes.length;
        // �������ʌ��������[�v
        for (var i = 0; i < len; i++){
            if (!isEmpty(sRes[i].getValue(columns[0]))) {
                brandFiled.addSelectOption(sRes[i].getValue(columns[0]), sRes[i].getValue(columns[1]));
            }
        }
    }
}
/**
 * �[�i�於�O�Aid���擾
 * @param {*} �[�i�� ID
 * @returns �[�i�於
 */
function doDeliveryValueSearch(delivery) {
	var deliveryNameArray={};
	var deliveryIdArray=new Array();
    // �[�i�於
    var name = '';
    // �[�i��ID
    // �����t�B���^�[
    var filters = [];
    filters.push(["internalid","isnotempty",""]);
    filters.push('AND');
	filters.push(["custrecord_djkk_delivery_in_sheet","noneof","@NONE@"]);
    if(delivery!='ALL'){
    	filters.push('AND');
    	filters.push(["custrecord_djkk_delivery_in_sheet","anyof",delivery.split('')]);
    }
    // �������ڔz��
    var columns = [];

    // ����
    columns.push(new nlobjSearchColumn("custrecord_djkk_delivery_in_sheet",null,"GROUP").setSort(false));
    columns.push(new nlobjSearchColumn("name","CUSTRECORD_DJKK_DELIVERY_IN_SHEET","GROUP"));
    
    // �[�i�挟��
    var dRes = getSearchResults('customrecord_djkk_so_forecast_ls', null, filters, columns);

    // �[�i�挟�����ʁA�f�[�^����̏ꍇ
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
 * ���[�U�A�u�����h�A���i�z������ƂɁA���i�R�[�h�z����擾
 * @param {*} pUser                ���O�C�����[�UID
 * @param {*} pBrand              �u�����h
 * @param {*} pProductCodeArr ���i�z��
 * @returns \{productArr:[{itemId : 1, item : A, locations : [1,2..]}, locationsTxt : [A,B...]..], ids:[1,...], locationArr : [...]}
 */
function doItemSearch(pUser, pBrand, pProductCodeArr,subsidiary) {
    // ���ʔz��
    var productArr = new Array();
    // ����ID�z��
    var idArr = new Array();
    // �ꏊ�z��
    var locationArr = new Array();
    // �O��A�C�e��ID
    var lastItemID = '';

    // �������ڔz��
    var columns = [new nlobjSearchColumn('internalid', 'custrecord_djkk_item_ls').setSort(false),
                   /*U149 old*/ // new nlobjSearchColumn('itemid', 'custrecord_djkk_item_ls'),
                   /*U149 new*/  new nlobjSearchColumn("vendorname","CUSTRECORD_DJKK_ITEM_LS",null),
                            new nlobjSearchColumn('custrecord_djkk_bp_location_area_ls'),
                            new nlobjSearchColumn('displayname', 'custrecord_djkk_item_ls')];
    // �����t�B���^�[
    var filter = [];
    if(!isEmpty(pUser) && pUser != 'ALL'){
    	filter.push(['custrecord_djkk_bp_ls', 'is', pUser.split('')]);
    	filter.push('and');
    }
    
    // DJ_�c��FC�T�����f:�T�P��
    filter.push(["custrecord_djkk_business_judgmen_fc","anyof",'1']);
    if(!isEmpty(subsidiary)){
    filter.push('and');
    filter.push(["custrecord_djkk_subsidiary_bp_ls","anyof",subsidiary]);
    }
    
    // �A�C�e��ID���p�����[�^�Ƃ��ēn����ĂȂ��ꍇ
    // �u�����h�p�����[�^����A�܂��fALL�f�łȂ��ꍇ�A���������ɒǉ�
    if (!isEmpty(pBrand) && pBrand != 'ALL') {
        filter.push('and');
        var brands = pBrand.split('');
        var bLen = brands.length;
        var brandFilter = [];
        // �u�����h�̃T�u�t�B���^�[���쐬
        for (var k = 0; k < bLen; k++) {
            brandFilter.push(['custrecord_djkk_item_ls.class', 'is', brands[k]]);
            brandFilter.push('or');
        }
        // �Ō��OR���폜
        brandFilter.pop();
        filter.push(brandFilter);
    }
    // �A�C�e�����I�������ꍇ�A�܂��fALL�f�łȂ��ꍇ
    if (!isEmpty(pProductCodeArr) && pProductCodeArr != 'ALL') {
        filter.push('and');
        filter.push(['custrecord_djkk_item_ls.internalid', 'anyof', pProductCodeArr.split('')]);
    }

    // �A�C�e������
    var sRes = getSearchResults('customrecord_djkk_person_registration_ls', null, filter, columns);

    // �������ʂ��f�[�^����̏ꍇ
    if (!isEmpty(sRes)) {
        var len = sRes.length;
        for (var i = 0; i < len; i++) {
            // �O��A�C�e��ID����A�������͌��݂̌��ʃA�C�e��ID�ƑO��̂��قȂ�ꍇ
            if (lastItemID == '' || lastItemID != sRes[i].getValue(columns[0])) {
                productArr.push({itemId : sRes[i].getValue(columns[0]),
                                        item : sRes[i].getValue(columns[1]),
                                        itemName : sRes[i].getValue(columns[3]),
                                        locations : sRes[i].getValue(columns[2]).split(','),
                                        locationsTxt : sRes[i].getText(columns[2]).split(',')});
                idArr.push(sRes[i].getValue(columns[0]));

            } else {
                // ���݂̃A�C�e���̏ꏊ�z����擾
                var tmpLocArr = sRes[i].getValue(columns[2]).split(',');
                var tmpLocTxtArr = sRes[i].getText(columns[2]).split(',');
                var tmpLen = tmpLocArr.length;
                // ���݂̃A�C�e���̏ꏊ�z��̌��������[�v
                for (var j = 0; j < tmpLen; j++) {
                    // ���݂̃A�C�e���̏ꏊ�͂܂��ԋp�p�z��ɑ��݂��Ȃ��ꍇ�A�ǉ�
                    if (productArr[productArr.length - 1].locations.indexOf(tmpLocArr[j]) < 0) {
                        productArr[productArr.length - 1].locations.push(tmpLocArr[j]);
                        productArr[productArr.length - 1].locationsTxt.push(tmpLocTxtArr[j]);
                    }
                }
            }
            // �O��A�C�e��ID���X�V
            lastItemID = sRes[i].getValue(columns[0]);
            // �ꏊ�z��ɏꏊ��S���i�[
            locationArr.push.apply(locationArr, sRes[i].getValue(columns[2]).split(','));
        }
    }
    // �d�����폜
    locationArr = unique(locationArr);
    return {productArr : productArr, ids : idArr, locationArr : locationArr};
}

/**
 * ��������
 * @param {*} pUser
 * @param {*} pDate
 * @param {*} pBrand
 * @param {*} pProductCodes
 * @param {*} pSW
 * @param {*} pSH
 * @returns ����HTML
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
	        htmlNote += '<p color="red">�S�����Ă��鏤�i�͑��݂��܂���B</p>';
	    } else {
	    	//�[�i����擾
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
	    	
	    	 
	    	// �S���Җ����擾
	        var userData = doUserSearch(pUser);
	    	var userArray=new Array();
	    	if(pUser!='ALL'){
	    		userArray=pUser.split('');
	    	}else{
	    		userArray=userData.userArray;
	    	}
	    	var userIdName=userData.nameArray;
		// NOW�ꏊ�̍݌ɐ����vSearch END
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
			//DEV - 1594  zhou memo :���̃R�[�h�������s���̂��߁A�T���v�Z�ُ̈킪�����������߃R�����g����Ă��܂�
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
		
		// �ꏊ��DJ_�ꏊ�G���A (�J�X�^��)����
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
     // �ꏊ��DJ_�ꏊ�G���A (�J�X�^��)���� END
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
		  
		/*******************fc�O��******************/
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
		  
		  /*******************�����ȊOFC******************/
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
	    htmlNote += '<div style="display:inline-block;font-weight:bold;font-size:18px;color:red;margin-left:130px;">�������@Actual�͑SSalesman�̍��v���l�ł��@������</div>';
	    htmlNote += '</div>'; 	    
	    //----------------XML header line-------------------------------
	    xmlNote += '<Row ss:Height="17.25">';
	    xmlNote += '<Cell ss:MergeAcross="4"><Data ss:Type="String">('+nlapiLookupField('subsidiary',subsidiary,'legalname')+') FORECAST LIST</Data></Cell>';
	    xmlNote += '</Row>';
	    xmlNote += '<Row  ss:Index="4">';
//	    xmlNote += '<Cell><Data ss:Type="String">Tanto    :    ' + employeeSearch.custentity_djkk_employee_id + '</Data></Cell>';
	    xmlNote += '<Cell ss:Index="5" ss:StyleID="s50"><Data ss:Type="String">�������@Actual�͑SSalesman�̍��v���l�ł��@������</Data></Cell>';
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
		htmlNote += '<td colspan="2" style="position:sticky;left:0;z-index:2;background-color:#9999FF;border:1px solid gray;border-right:0px;">����F</td>';
		htmlNote += '<td style="position:sticky;left:'+tableCloum2+'px;z-index:2;background-color:#9999FF;border:1px solid gray;border-left:0px;">'+ date + '</td>';
		xmlNote += '<Row>';
	    xmlNote += '<Cell ss:StyleID="s52"/>';
	    xmlNote += '<Cell ss:StyleID="s52"><Data ss:Type="String">����F '+ date + '</Data></Cell>';
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
		
		 // �A�C�e��HTML
	    var itemHtml = '';
	    var itemXml = '';
	    /*******************************************************************************************/
        for(var userF=0;userF<userArray.length;userF++){
        	var singleUserId=userArray[userF];
	        // HTML
	        itemHtml += '<tr style="height:28px;background-color:#828287;">';
	        itemHtml += '<td colspan="3" style="border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">�[�i��    :    ' + userIdName[singleUserId][1] + '</td>';
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
    	        itemHtml += '<td colspan="5" style="border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">�[�i��    :    ' + deliveryIdName[deliveryId] + '</td>';
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
    	        // �A�C�e���̌����������[�v
			    for (var i = 0; i < itemArr.ids.length; i++) {
			    	var inforItemId=itemArr.productArr[i].itemId;
			        itemHtml += '<tr style="background-color:#e6e6e6;">';
			        itemHtml += '<td colspan="3" style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">'+itemArr.productArr[i].item+'</td>';
			        itemHtml += '<td colspan="10" style="position:sticky;left:'+tableCloum2+'px;background-color:#e6e6e6;z-index:1;border:1px solid gray;border-left:0px;border-right:0px;text-align:left;color:#0033cc;">'+itemArr.productArr[i].itemName+'</td>';
			        itemHtml += '<td colspan="44" style="background-color:#e6e6e6;border:1px solid gray;border-left:0px;text-align:left;color:#0033cc;"></td>';
			        itemHtml += '</tr>';
			        
			        itemXml += '<Row>';
			        itemXml += '<Cell ss:StyleID="s55"><Data ss:Type="String">testcode01�F '+itemArr.productArr[i].item+'</Data></Cell>';
			        itemXml += '<Cell ss:StyleID="s55"></Cell>';
			        itemXml += '<Cell ss:StyleID="s55"></Cell>';
			        itemXml += '<Cell ss:StyleID="s55" ss:MergeAcross="53"><Data ss:Type="String">'+itemArr.productArr[i].itemName+'</Data></Cell>';
			        itemXml += '</Row>';
			        
			        
			        // �ꏊ�̌����������[�v
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
		
			            // 54��week���̃f�[�^�����[�v
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
			            /********fc�O��**********/
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
						  /****** �����ȊOFC*******/
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
						  /*******��r/����********/
						  var WeekNumComp=dateArray[m][1]+'-'+dateArray[m][0];
						  
						   // ��r/����FC��
			              var comparation = '0.0';
						  if (!isEmpty(yearData) && !isEmpty(otherFcLastDate)) {
			                    comparation = Math.round((yearData/otherFcLastDate) * 10) / 10;
			                    comparation = comparation.toFixed(1);
			                }
						  
						  /***********************/
						  
			                // (year - 1) actual��
			                actLast += '<td style="border:1px solid gray;">'+lastYearData+'</td>';
			                actLastXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">'+lastYearData+'</Data></Cell>';
			                // year actual��
			                actNow += '<td style="border:1px solid gray;">'+yearData+'</td>';
			                actNowXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">'+yearData+'</Data></Cell>';
			                // �����ȊOFC��
			                fcOthers += '<td style="border:1px solid gray;">'+otherFcLastDate+'</td>';
			                fcOthersXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">'+otherFcLastDate+'</Data></Cell>';
			                // �O��FC��
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
			            
			            
			            // �����ȊO title + monthly details
			            itemHtml+='</tr>';
			            itemHtml+='<tr style="background-color:#e6e6e6;text-align:right;">';
			            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none;border-bottom-style:none;border-right-style:none"></td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;border-left:0px;border-bottom-style:none;width:110px;text-align:left;vertical-align:top;">Forecast</td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;">�����ȊO</td>';
			            itemHtml += fcOthers;
			            itemHtml += '</tr>';
			            
			            itemXml+='<Row>';
			            itemXml += '<Cell ss:StyleID="s57"></Cell>';
				        itemXml += '<Cell ss:StyleID="s57"><Data ss:Type="String">Forecast</Data></Cell>';
				        itemXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">�����ȊO</Data></Cell>';
			            itemXml += fcOthersXml;
			            itemXml += '</Row>';
			            
			            // �O�� title + monthly details
			            itemHtml+='</tr>';
			            itemHtml+='<tr style="background-color:#e6e6e6;text-align:right;">';
			            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none;border-bottom-style:none;border-right-style:none"></td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none"></td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;">�O��</td>';
			            itemHtml += fcLast;
			            itemHtml += '</tr>';
			            
			            itemXml+='<Row>';
			            itemXml += '<Cell ss:StyleID="s57"></Cell>';
				        itemXml += '<Cell ss:StyleID="s57"><Data ss:Type="String"></Data></Cell>';
				        itemXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">�O��</Data></Cell>';
			            itemXml += fcLastXml;
			            itemXml += '</Row>';
			            
			            // ��r�^���� title + monthly details
			            // ���� title�̕����F:�ԐF
			            var colorForInput = 'color:#FE1B34;';
			            // �u/�v�̐F:���F
			            var colorForSlash = 'color:#000000;';
			            if (l%2 != 0) {
			                colorForInput = 'color:#134DF2;';
			                colorForSlash = 'color:#134DF2;';
			            }
			            itemHtml+='</tr>';
			            itemHtml+='<tr style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;">';
			            itemHtml+='<td style="position:sticky;left:0;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none;border-right-style:none"></td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum1+'px;z-index:1;background-color:#e6e6e6;border:0px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;border-top-style:none"></td>';
			            itemHtml+='<td style="position:sticky;left:'+tableCloum2+'px;z-index:1;background-color:#e6e6e6;border:1px solid gray;text-align:left;"><span style="color:#134DF2;">��r</span><span style="' + colorForSlash + '">�^</span><span style="' + colorForInput + '">����</span></td>';
			            itemHtml += fcSelf;
			            itemHtml += '</tr>';
			            
			            itemXml+='<Row>';
			            itemXml += '<Cell ss:StyleID="s58"></Cell>';
				        itemXml += '<Cell ss:StyleID="s58"><Data ss:Type="String"></Data></Cell>';
				        itemXml += '<Cell ss:StyleID="s56"><Data ss:Type="String">��r�^����</Data></Cell>';
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
 * �G�N�Z���t�@�C���̃_�E�����[�hURL���쐬
 * @param {*} excelXMLNote
 * @param {*} rowCount 
 * @returns Excel file �_�E�����[�hURL
 */
function createExcelURL(excelXMLNote, rowCount) {
    var xmlString = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
    xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"';
    xmlString += ' xmlns:o="urn:schemas-microsoft-com:office:office"';
    xmlString += ' xmlns:x="urn:schemas-microsoft-com:office:excel"';
    xmlString += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"';
    xmlString += ' xmlns:html="http://www.w3.org/TR/REC-html40">';
    
    var font='HG�ۺ޼��M-PRO';
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
    xmlString += '<Style ss:ID="s50"><Alignment ss:Vertical="Center"/><Borders/><Font ss:FontName="HG�ۺ޼��M-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#FF0000"/><Interior/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s51"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG�ۺ޼��M-PRO" x:CharSet="128" x:Family="Modern" ss:Size="10" ss:Color="#000000"/><Interior ss:Color="#9999FF" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s52"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG�ۺ޼��M-PRO" x:CharSet="128" x:Family="Modern" ss:Size="10" ss:Color="#000000"/><Interior ss:Color="#9999FF" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    //������
    xmlString += '<Style ss:ID="s53"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG�ۺ޼��M-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/><Interior ss:Color="#9999FF" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    //�������I�����WBG
    xmlString += '<Style ss:ID="s54"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG�ۺ޼��M-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#000080" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s55"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG�ۺ޼��M-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#0033cc"/><Interior ss:Color="#e6e6e6" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s56"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG�ۺ޼��M-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/><Interior ss:Color="#e6e6e6" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s57"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders/><Font ss:FontName="HG�ۺ޼��M-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/><Interior ss:Color="#e6e6e6" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    xmlString += '<Style ss:ID="s58"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="HG�ۺ޼��M-PRO" x:CharSet="128" x:Family="Modern" ss:Size="11" ss:Color="#000000"/><Interior ss:Color="#e6e6e6" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style>';
    
    
    
    xmlString += '</Styles>';
    xmlString += '<Worksheet ss:Name="�̔��v���񃌃|�[�g_LS_WEEK">';    
    xmlString += '<Table ' + (rowCount + 1) + '" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="14">';
    xmlString += '<Column ss:Index="3" ss:AutoFitWidth="0" ss:Width="66"/>';
    xmlString +=excelXMLNote;
    xmlString += '</Table></Worksheet></Workbook>';

    // create file
    var xlsFile = nlapiCreateFile('�̔��v���񃌃|�[�g_LS_WEEK' + '_' + getFormatYmdHms() + '.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));

    xlsFile.setFolder('375');
    xlsFile.setIsOnline(true);
    // save file
    var fileID = nlapiSubmitFile(xlsFile);
    // file�����[�h
    var fl = nlapiLoadFile(fileID);
    // �t�@�C����URL���擾
    var url= "window.location.href='" + fl.getURL() + "'";

    return url;
}

/**
 * �V�X�e�����t�Ǝ��Ԃ��t�H�[�}�b�g�Ŏ擾
 */
 function getFormatYmdHms() {

    // �V�X�e������
    var now = getSystemTime();

    var str = now.getFullYear().toString();
    str += (now.getMonth() + 1).toString();
    str += now.getDate() + "_";
    str += now.getHours();
    str += now.getMinutes();
    str += now.getMilliseconds();

    return str;
}

