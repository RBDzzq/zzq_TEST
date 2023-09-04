/**
 * �̔��v�������_LS
 *
 * Version    Date            Author           Remarks
 * 1.00       2021/06/08     CPC_��
 *
 */
var pagedate=nlapiDateToString(getSystemTime());
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
//	var Search = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
//	[
//	   ["custrecord_djkk_so_fc_ls_employee","isnotempty",'']
//	], 
//	[
//	   new nlobjSearchColumn("internalid")
//	]
//	);
//if (!isEmpty(Search)) {
//for(var i = 0 ; i < Search.length ; i++){
//	var internalid = Search[i].getValue("internalid");
//	var dle = nlapiDeleteRecord('customrecord_djkk_so_forecast_ls',internalid);
//}
//}
	nlapiLogExecution('debug','�̔��v�������_LS','start')
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
    // request parameter: ��ʕ�
    var rpSW = request.getParameter('width');
    // request parameter: ��ʍ���
    var rpSH = request.getParameter('height');
    
    var fileId = nlapiGetContext().getSessionObject('session_upload_file_id')
	nlapiGetContext().setSessionObject("session_upload_file_id","");
    
    // ���HTML
    var htmlNote ='';
    // ���O�C�����[�U���擾
    var user = nlapiGetUser();
    /*******U224*******************/
    var getUser= request.getParameter('user');
    if(!isEmpty(getUser)){
    	user =getUser;
    }
    /*******U224*******************/
    // �̔��v������̓t�H�[�����쐬
    var form = nlapiCreateForm('�̔��v�������_LS', (operation == 's'));
    // client script��ݒ�
    form.setScript('customscript_djkk_cs_fc_ls_create_bp');

    // �����̏ꍇ
    if (operation == 's') {
        // ���������{�A����HTML���쐬����
//        htmlNote += doSearch(user, date, rpBrand, rpProductCodes, rpSW, rpSH,subsidiary);
        var htmlAndExcelXMLObj = doSearch(user, date, rpBrand, rpProductCodes, rpSW, rpSH,subsidiary);
        var csvStr = htmlAndExcelXMLObj.csvMainString;
        htmlNote += htmlAndExcelXMLObj.htmlNote;
        var csvDownUrl = "window.location.href='" + csvDown(csvStr) + "'";	
        // ��ʂɃ{�^����ǉ�
        form.addButton('custpage_update', '�X�V', 'updateData();');
        form.addButton('custpage_backToSearch', '�����ɖ߂�', 'backToSearch();');
        form.addButton('custpage_csvdownload', 'CSV�_�E�����[�h', csvDownUrl);
		form.addButton('custpage_csvupload', 'CSV�A�b�v���[�h', 'csvUpload()');
		form.addButton('custpage_refresh', '��ʂ̍X�V', 'refresh()');
        // ���hidden���ڂ��쐬�A����ʈ��p���p
        createHiddenItems(form, date, rpBrand, rpProductCodes,subsidiary,user);
    }
    // �f�[�^�X�V�̏ꍇ
    else if (operation == 'update') {
        // request parameter: �L���b�V���\���R�[�hID
        var rpCacheRecordID = request.getParameter('cacheRecordID');
        // �o�b�`���s�������Ăяo��
        doCallBatch(rpCacheRecordID, date, rpBrand, rpProductCodes,subsidiary);
    }
    else if (operation == 'logForm') {
        form.addFieldGroup('custpage_run_info', '���s���');
        // �o�b�`��Ԃ��擾
        var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_fc_ls_create_bp');
        // ���s���s�̏ꍇ
        if (batchStatus == 'FAILED') {
            // refresh�{�^�����쐬
            form.addButton('custpage_refresh', '�X�V', 'refresh();');
            var runstatusField = form.addField('custpage_run_info_status', 'text', '', null, 'custpage_run_info');
            runstatusField.setDisplayType('inline');
            var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
            runstatusField.setDefaultValue(messageColour);
        }
        // ���s���̏ꍇ
        else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {
            // refresh�{�^�����쐬
            form.addButton('custpage_refresh', '�X�V', 'refresh();');
            var runstatusField = form.addField('custpage_run_info_status', 'text', '', null, 'custpage_run_info');
            runstatusField.setDisplayType('inline');
            runstatusField.setDefaultValue('�o�b�`���������s��');
        }
        // ���s�����̏ꍇ
        else {
            var runstatusField = form.addField('custpage_run_info_status', 'text', '', null, 'custpage_run_info');
            runstatusField.setDisplayType('inline');
            runstatusField.setDefaultValue('�o�b�`�������s�������܂���');
            // ��ʕ\�����ڍ쐬�����{�i�����\�����l�j
            doPageInit(form, date, user, rpBrand, rpProductCodes,subsidiary);
        }
    }
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
	// �A����K�{�ɐݒ�
    subsidiaryField.setMandatory(true);
	   // REQUEST�O�̑I��l���Đݒ肷��
    if(!isEmpty(subsidiary)){
    subsidiaryField.setDefaultValue(subsidiary);
    }else{
    	//var userSub=nlapiLookupField('employee', nlapiGetUser(), 'subsidiary');
    	var userSub=getRoleSubsidiary();
    	 subsidiaryField.setDefaultValue(userSub);
    	 subsidiary=userSub;
    }
	/************U224*******************************/
	// BP�t�B�[���h���쐬
    var userField=pForm.addField('custpage_user', 'select', 'BP', null,'custpage_group_filter');
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
    var userArray=new Array();
    userField.addSelectOption('', '');
    if(!isEmpty(bpSearch)){
	for(var bps=0;bps<bpSearch.length;bps++){
		userArray.push(Number(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP")));
		userField.addSelectOption(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP"), bpSearch[bps].getValue("entityid","CUSTRECORD_DJKK_BP_LS","GROUP"));
	}
    }
	userField.setMandatory(true);
	if(userArray.indexOf(Number(pUser)) > -1){
	userField.setDefaultValue(Number(pUser).toString());
	}else{
		userField.addSelectOption(pUser,nlapiLookupField('employee', pUser, 'entityid'));
		userField.setDefaultValue(Number(pUser).toString());
	}
	/*******U224*******************/
	
    // �u�����h�t�B�[���h���쐬
    var brandSelector = pForm.addField('custpage_brand', 'multiselect', '�u�����h', null, 'custpage_group_filter');
    // ���i���t�B�[���h���쐬
    var itemSelector = pForm.addField('custpage_item', 'multiselect', '���i��', null, 'custpage_group_filter');

    // �����K�{�ɐݒ�
    dateField.setMandatory(true);

    
    // �O��ʂ̊�����ڂ�response��ʂɍĐݒ�
    if(isEmpty(pDate)){
    	pDate=nlapiDateToString(getSystemTime());
    }
    pagedate=pDate;
    dateField.setDefaultValue(pDate);
    // �e���͂̃T�C�Y��ݒ�
    dateField.setDisplaySize(80,1);
    subsidiaryField.setDisplaySize(240,15);
    userField.setDisplaySize(240,15);
    brandSelector.setDisplaySize(240,15);
    itemSelector.setDisplaySize(240,15);
    
 
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

    // �����{�^�����쐬
    pForm.addButton('custpage_creatforecastlist', '����', 'creatForecastList();');
}

/**
 * �o�b�`���s����
 * @param {*} pCacheRecordId
 * @param {*} pDate
 * @param {*} pBrand
 * @param {*} pProductCodes
 */
function doCallBatch(pCacheRecordId, pDate, pBrand, pProductCodes,subsidiary) {
    var ctx = nlapiGetContext();
    // �o�b�`���s�p�p�����[�^���쐬
    var scheduleparams = new Array();
    scheduleparams['custscript_djkk_fc_cache_table_so_id_ls'] = pCacheRecordId;
    scheduleparams['custscript_djkk_so_date_ls'] = pDate;
    // �o�b�`���s
    runBatch('customscript_djkk_ss_fc_ls_create_bp',
            'customdeploy_djkk_ss_fc_ls_create_bp', scheduleparams);
    // ���_�C���N�g���{
    var parameter= new Array();
    parameter['op'] = 'logForm';
    parameter['date'] = pDate;
    parameter['brand'] = pBrand;
    parameter['subsidiary'] = subsidiary;
    parameter['productCodes'] = pProductCodes;
    nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(), null, parameter);
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
function doSearch(pUser, pDate, pBrand, pProductCodes, pSW, pSH,subsidiary) {
    // HTML
    var htmlNote = '';
    var csvMainString = '';
    // ���
    var rpBaseDate = nlapiStringToDate(pDate);

    // ���i�R�[�h�z����쐬
    var itemArr = doItemSearch(pUser, pBrand, pProductCodes,subsidiary);
    // ���i�R�[�h�z�񂪋�̏ꍇ�A�S���҂̒S�����i���݂��Ȃ����߁A���b�Z�[�W���쐬����B
    if (isEmpty(itemArr) || itemArr.ids.length == 0) {
        htmlNote += '<p color="red">�S�����Ă��鏤�i�͑��݂��܂���B</p>';
    } else {
        // �N��OBJ���쐬
        var yyyyMMObj = getMonthYearArr(rpBaseDate.getFullYear(), rpBaseDate.getMonth() + 1);

        // ---�{�lFC�������ʁi���N�ƍ����j-----------------------------------
        // �擾���ڔz��:�A�C�e���R�[�h�A�A�C�e�����A�ꏊ�A�N�A���AFC���A�N��
        var fcColumns = createSColumns();
        // �����t�B���^�[ DJ_�S���҃R�[�h,DJ_���i�R�[�h,DJ_�N,DJ_��
        var searchFilter = createSFilter(pUser, 'is', yyyyMMObj, itemArr.ids,subsidiary);
        // DJ_�c��FC����
        var resFCSelf = getSearchResults('customrecord_djkk_so_forecast_ls', null, searchFilter, fcColumns);

        // ---���̑��S����FC��������------------------------------------------
        // �擾���ڔz��:�A�C�e���R�[�h�A�A�C�e�����A�ꏊ�A�N�A���AFC���A�N��
        var fcOthersColumns = createSColumnsForOhters();
        // �����t�B���^�[ DJ_�S���҃R�[�h,DJ_���i�R�[�h,DJ_�N,DJ_��
        var searchOFilter = createSFilter(pUser, 'noneof', yyyyMMObj, itemArr.ids,subsidiary);
        // DJ_�c��FC����
        var resFCOthers = getSearchResults('customrecord_djkk_so_forecast_ls', null, searchOFilter, fcOthersColumns);

        // ---�S�S���Ҏ��сiActual�j�i���N�ƍ����j--------------------------------
        // �ꏊ�ɏ������Ă���q�ɂ̃��X�g���擾
        var locInvObj = doInventorySearch(itemArr.locationArr);
        // �擾���ڔz��:
        var actColumns = createActualColumn();
        // ���ь����t�B���^�[�쐬
        var actFilters = createActualFilter(yyyyMMObj, itemArr.ids, locInvObj.inventoryArr,subsidiary);
        // ����
        var resAct = getSearchResults('salesorder', null, actFilters, actColumns);

        // �S���Җ����擾
        var userIdName = doUserSearch(pUser);

        // �e�������ʂ����ƂɁA���X�g�̐��`�����{�A���ʁF[{item: AA, locations: [{location: loc, fcOthersArr: [1,...], fcLastArr:[1,...], fcLastIds:[1,...]},.....]},...]
        var fcAcArr = createFcActArr(yyyyMMObj, resFCSelf, fcColumns, resFCOthers, fcOthersColumns, resAct, actColumns, itemArr.productArr, locInvObj.locInvArr);

        // �������ʖ���HTML���쐬
        htmlNote += createHtmlNote(yyyyMMObj, rpBaseDate.getFullYear(), rpBaseDate.getMonth() + 1, fcAcArr, userIdName, pSW, pSH,subsidiary);
        //csv:20221010 add buy zhou U395
        csvMainString += createCsvNote(userIdName,yyyyMMObj, rpBaseDate.getFullYear(), rpBaseDate.getMonth() + 1,fcAcArr,pDate,subsidiary);
    }

    return {htmlNote : htmlNote, csvMainString:csvMainString};
}

/**
 * ���hidden���ڂ��쐬
 * @param {*} pFrom
 * @param {*} pDate
 * @param {*} pBrand
 * @param {*} pProductCodes
 */
function createHiddenItems(pFrom, pDate, pBrand, pProductCodes,subsidiary,user) {

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
    dateField.setDefaultValue(pDate);
    brandFiled.setDefaultValue(pBrand);
    itemField.setDefaultValue(pProductCodes);
    subsidiaryFiled.setDefaultValue(subsidiary);
    userField.setDefaultValue(user);
    // ��\���ɐݒ�
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
    // �S���Җ�
    var name = '';
    // �S����ID
    // var id = '';
    // �����t�B���^�[
    var filters = [];
    // �������ڔz��
    var columns = [];

    // �t�B���^�[
    filters.push(['internalid', 'is', pUser]);

    // �������ڔz��
    columns.push(new nlobjSearchColumn('entityid'));
    columns.push(new nlobjSearchColumn('lastname'));
    columns.push(new nlobjSearchColumn('firstname'));
    columns.push(new nlobjSearchColumn('custentity_djkk_employee_id'));
    

    // �S���Җ�����
    var sRes = getSearchResults('employee', null, filters, columns);

    // �S���Җ��������ʁA�f�[�^����̏ꍇ
    if(!isEmpty(sRes)) {
        // id = sRes[0].getValue(columns[0]);
        name = sRes[0].getValue(columns[1]) + sRes[0].getValue(columns[2]);
    }

    return {name : name, id : sRes[0].getValue(columns[3])};
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
 * �������Â��A�N�A���A�N���A��N�N���̔z����쐬
 * @param baseYear    ��N
 * @param baseMonth ���
 * @returns \{���z��,�N�z��,��N�z��,�N���z��,��N�N���z��}
 **/
 function getMonthYearArr(baseYear, baseMonth) {
    var monthArr = new Array(12);
    var yearArr = new Array(12);
    var lastYearArr = new Array(12);
    var yyyyMMArr = new Array(12);
    var lastYyyyMMArr =  new Array(12);

    // 5 ~ 0, 6~ 11�̕����ŁA�N�ƌ����v�Z���āA���ʔz��Ɋi�[
    for (var i = 0; i < 6; i++) {
        var tmpDatePast = new Date(baseYear, baseMonth-i-1, 1);
        var tmpDateFuture = new Date(baseYear, baseMonth+i, 1);

        monthArr[5-i] = (tmpDatePast.getMonth() + 1)<10?'0'+(tmpDatePast.getMonth() + 1).toString():(tmpDatePast.getMonth() + 1).toString();
        yearArr[5-i] = tmpDatePast.getFullYear();
        monthArr[5+i+1] = (tmpDateFuture.getMonth() + 1)<10?'0'+(tmpDateFuture.getMonth() + 1).toString():(tmpDateFuture.getMonth() + 1).toString();
        yearArr[5+i+1] = tmpDateFuture.getFullYear();
        lastYearArr[5-i] = tmpDatePast.getFullYear() - 1;
        lastYearArr[5+i+1] = tmpDateFuture.getFullYear() - 1;

        // �N���̃t�B���^�[�쐬���p�z��yyyyM
        yyyyMMArr[5-i]  = yearArr[5-i].toString() + monthArr[5-i].toString();
        yyyyMMArr[5+i+1]  = yearArr[5+i+1].toString() + monthArr[5+i+1].toString();
        // �O��̔N���t�B���^�[�쐬���p�z��(yyyy-1)M
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
    filter.push(['custrecord_djkk_bp_ls', 'is', pUser]);
    filter.push('and');
    
    // DJ_�c��FC�T�����f:���P��
    filter.push(["custrecord_djkk_business_judgmen_fc","anyof",'2']);
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
 * �ꏊ�G���A�ɏ������Ă���q�ɂ��擾
 * @param {*} locationArr
 * @returns �ꏊ�q�� {locInvArr : [{locationId : A1 , invArr : [1,...]}...], inventoryArr : [1...]}
 */
function doInventorySearch(locationArr) {
    // �ꏊ�q�ɔz��
    var locInvArr = new Array();
    // �q�ɔz��
    var inventoryArr = new Array();
    // �ꏊ�z�񌏐����擾
    var locLen = locationArr.length;

    var filters = [['custrecord_djkk_location_area', 'anyof', locationArr]];
    var columns = [new nlobjSearchColumn('custrecord_djkk_location_area', null, 'group').setSort(false),
                            new nlobjSearchColumn('internalid', null, 'group')];

    // �Y���ꏊ�ɏ������Ă��邷�ׂĂ̑q�ɂ��擾
    var res = getSearchResults('location', null, filters, columns);
    // �������ʂ��f�[�^����̏ꍇ
    if (!isEmpty(res)) {
        var rLen = res.length;
        // �ꏊ�z��̌��������[�v
        for (var l = 0; l < locLen; l++) {
            var locInvObj = {locationId : locationArr[l] , invArr : new Array()};
            // �������ʌ��������[�v
            for (var i = 0; i < rLen; i++) {
                // ����ꏊ�̏ꍇ
                if (locationArr[l] == res[i].getValue(columns[0])) {
                    locInvObj.invArr.push(res[i].getValue(columns[1]));
                }
            }
            locInvArr.push(locInvObj);
            // �q�ɔz��Ɋi�[
            inventoryArr.push.apply(inventoryArr, locInvObj.invArr);
        }
    }
    return {locInvArr : locInvArr, inventoryArr : inventoryArr};
}

/**
 * FC�̌����t�B���^�z����쐬
 * @param {*} pUser
 * @param {String} pUserOp                 'is' or 'noneof'
 * @param {*} pYearMonthObj
 * @param {*} pProductCodeArr
 * @returns FC�̌����t�B���^�z��
 */
function createSFilter (pUser, pUserOp, pYearMonthObj, pProductCodeArr,subsidiary) {

    // �����t�B���^�[�z��
    var searchFilter = [];
    // �N���t�B���^�[�z��
    var yyyyMMfilter = [];
    searchFilter.push(["custrecord_djkk_so_fc_ls_subsidiary","anyof",subsidiary]);
    searchFilter.push('and');
    /* �����t�B���^�[�쐬 */
    searchFilter.push(['custrecord_djkk_so_fc_ls_employee', pUserOp, pUser]);  // DJ_�S���҃R�[�h
    searchFilter.push('and');

    // �N���̃t�B���^�[�z����쐬
    for (var i = 0; i < 12; i++) {
        yyyyMMfilter.push(['formulatext: {custrecord_djkk_so_fc_ls_year} || {custrecord_djkk_so_fc_ls_month}', 'is', pYearMonthObj.yyyyMMArr[i]]);
        yyyyMMfilter.push('or');
    }

    // �Ō��or���폜
    yyyyMMfilter.pop();
    searchFilter.push(yyyyMMfilter);

    /* DJ_���i�R�[�h */
    searchFilter.push('and');
    searchFilter.push(['custrecord_djkk_so_fc_ls_item.internalid', 'anyof', pProductCodeArr]);

    return searchFilter;
}

/**
 * ���т̌����t�B���^�z����쐬
 * @param {*} pYearMonthObj 
 * @param {*} pProductCodeArr 
 * @param {*} inventoryArr 
 * @returns ���т̌����t�B���^
 */
function createActualFilter(pYearMonthObj, pProductCodeArr, inventoryArr,subsidiary) {
    var searchFilter = [];

    // ������
    searchFilter.push(['type', 'anyof', 'SalesOrd']);
    searchFilter.push('and');
    
    searchFilter.push(["subsidiary","anyof",subsidiary]);
    searchFilter.push('and');
    //
    searchFilter.push(['mainline', 'is', 'F']);
    searchFilter.push('and');
    //�@
    searchFilter.push(['taxline', 'is', 'F']);
    searchFilter.push('and');
    // �X�e�[�^�X�����F�ۗ��A�I���ȊO
    searchFilter.push(['status', 'noneof', 'salesord:A', 'salesord:H']);
    searchFilter.push('and');
    // �A�C�e��ID
    searchFilter.push(['item.internalid', 'anyof', pProductCodeArr]);
    searchFilter.push('and');
    // ���ʂ�0���傫��
    searchFilter.push(['quantityshiprecv', 'greaterthan', '0']);
    searchFilter.push('and');
    // �q�ɂ��w��ꏊ�G���A�ɏ������Ă���
    searchFilter.push(['fulfillingtransaction.location', 'anyof', inventoryArr]);
    searchFilter.push('and');
    // ���t����=�w����tStart
    var dt = new Date(pYearMonthObj.lastYearArr[0], (pYearMonthObj.monthArr[0] - 1), 1, 0, 0, 0, 0);
    var startDt = nlapiDateToString(dt);
    searchFilter.push(['trandate', 'onorafter', startDt]);
    searchFilter.push('and');
    // ���t�� < �w����tEnd
    dt = new Date(pYearMonthObj.yearArr[11], pYearMonthObj.monthArr[11], 1, 0, 0, 0, 0);
    var endDt = nlapiDateToString(dt);
    searchFilter.push(['trandate', 'before', endDt]);

    return searchFilter;
}

/**
 * �{�lFC�����̍��ڔz����쐬
 */
function createSColumns() {
    // �擾���ڔz��: �A�C�e���R�[�h�A�A�C�e�����A�ꏊ�A�N�A���AFC���A�N��
    var columns = new Array();

    /* �������ڗ�쐬 */
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_item').setSort(false)); // �A�C�e���R�[�h
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_item')); // �A�C�e����
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_location_area').setSort(false)); // �ꏊ
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_year').setSort(false)); // �N
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_month').setSort(false)); // ��
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_fcnum')); // FC��
    columns.push(new nlobjSearchColumn('formulatext').setFormula('{custrecord_djkk_so_fc_ls_year} || {custrecord_djkk_so_fc_ls_month}')); // �N��
    columns.push(new nlobjSearchColumn('internalid')); // ����ID

    return columns;
}

/**
 * ���̑��S����FC�����̍��ڔz����쐬
 */
function createSColumnsForOhters() {
    // �擾���ڔz��: �A�C�e���R�[�h�A�A�C�e�����A�ꏊ�A�N�A���AFC���A�N��
    var columns = new Array();

    /* �������ڗ�쐬 */
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_item', null, 'group').setSort(false)); // �A�C�e���R�[�h
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_item', null, 'group')); // �A�C�e����
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_location_area', null, 'group').setSort(false)); // �ꏊ
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_year', null, 'group').setSort(false)); // �N
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_month', null, 'group').setSort(false)); // ��
    columns.push(new nlobjSearchColumn('custrecord_djkk_so_fc_ls_fcnum', null, 'sum')); // FC��
    columns.push(new nlobjSearchColumn('formulatext', null, 'group').setFormula('{custrecord_djkk_so_fc_ls_year} || {custrecord_djkk_so_fc_ls_month}')); // �N��

    return columns;
}

/**
 * �S�S���Ҏ��ь����̍��ڔz����쐬
 */
 function createActualColumn() {
    // �擾���ڔz��: �A�C�e���R�[�h�A�A�C�e�����A�ꏊ�A�N�A���AFC���A�N��
    var columns = new Array();

    /* �������ڗ�쐬 */
    columns.push(new nlobjSearchColumn('item', null, 'group').setSort(false)); // �A�C�e���R�[�h
    columns.push(new nlobjSearchColumn('formulatext', null, 'group').setFormula('TO_CHAR({trandate},\'YYYYMON\')').setSort(false)); // ���t
    columns.push(new nlobjSearchColumn('quantityshiprecv', null, 'sum')); // ����
    columns.push(new nlobjSearchColumn("location","fulfillingTransaction","group")); // �q��

    return columns;
}

/**
 * todo each fc array is not setting correctly
 *
 * �{�lFC�������ʁA�����ȊO�̒S���҂�FC�������ʂƖ{�l���ь������ʂ����ƂɁAFC�������ʔz����쐬
 * @param {*} pYearMonthObj
 * @param {*} fcBpRes                  �{�lFC��������
 * @param {*} fcBpColumns           �{�lFC��������
 * @param {*} fcOthersBpRes         �����ȊO�̒S���҂�FC��������
 * @param {*} fcOthersBpColumns  �����ȊO�̒S���҂�FC��������
 * @param {*} actualRes                ���ь�������
 * @param {*} actColumns              ���ь�������  {�A�C�e���R�[�h,���t,����,�q��}
 * @param {*} pProductArr             �A�C�e���ꏊ�z��   [{itemId: 1, item: A, locations:[...]}...]
 * @param {*} locInvMap               �ꏊ�q�Ƀ}�b�s���O�z��   [{locationId : A1 , invArr : [1,...]}...]
 * @returns [{item: AA, locations: [{location: loc, locationId: l1, actLast: [...], actNow: [...], fcOthersArr: [...], fcLastArr: [...], fcLastIds: [...]},...], },...]
 */
 function createFcActArr(pYearMonthObj, fcBpRes, fcBpColumns, fcOthersBpRes, fcOthersBpColumns, actualRes, actColumns, pProductArr, locInvMap) {
    // �������ʌ���
    var arrLen = 0;
    // ���̑��S���Ҍ������ʌ���
    var arrOLen = 0;
    // ���ь������ʌ���
    var actLen = 0;
    // �A�C�e���̌������擾
    var productNum = pProductArr.length;
    // �A�C�e��FC�z��
    var itemFcArr = new Array();

    // �������ʂ��f�[�^����̏ꍇ�A�������擾
    if (!isEmpty(fcBpRes)) {
        arrLen = fcBpRes.length;
    }
    // ���̑��S���Ҍ������ʂ��f�[�^����̏ꍇ�A�������擾
    if (!isEmpty(fcOthersBpRes)) {
        arrOLen = fcOthersBpRes.length;
    }

    if (!isEmpty(actualRes)) {
        actLen = actualRes.length;
    }

    // �A�C�e������FC�z����쐬
    for (var i = 0; i < productNum; i++) {
        // �A�C�e��OBJ
        var itemFc = {item : pProductArr[i].item, itemName : pProductArr[i].itemName, itemId : pProductArr[i].itemId, locations : new Array()}
        // �ꏊ�̌������擾
        var locLen = pProductArr[i].locations.length;
        // �ꏊ�̌������̏ꏊFC��OBJ���쐬���A�A�C�e��OBJ�̏ꏊFC���z��Ɋi�[
        for (var h = 0; h < locLen; h++) {
            itemFc.locations.push({location: pProductArr[i].locationsTxt[h],
                                            locationId: pProductArr[i].locations[h],
                                            actLast : ['', '', '', '', '', '', '', '', '', '', '', ''],
                                            actNow : ['', '', '', '', '', '', '', '', '', '', '', ''],
                                            fcOthersArr : ['', '', '', '', '', '', '', '', '', '', '', ''],
                                            fcLastArr : ['', '', '', '', '', '', '', '', '', '', '', ''],
                                            fcLastIds : ['', '', '', '', '', '', '', '', '', '', '', '']});
        }

        // ���ʌ��������[�v
        for (var j = 0; j < arrLen; j++) {
            // fcLastArr��ݒ肷��
            setFcValues(pProductArr[i], pYearMonthObj, itemFc, fcBpRes[j], fcBpColumns);
        }

        // ���̑��S���Ҍ������ʌ��������[�v
        for (var k = 0; k < arrOLen; k++) {
            // fcOthersArr��ݒ肷��
            setOthersFcValues(pProductArr[i], pYearMonthObj, itemFc, fcOthersBpRes[k], fcOthersBpColumns);
        }

        // ���ь������ʌ��������[�v
        for (var p = 0; p < actLen; p++) {
            // actLast,actNow��ݒ肷��
            setActValues(pProductArr[i], pYearMonthObj, itemFc, locInvMap, actualRes[p], actColumns);
        }

        // �ԋp�z��ɒǉ�
        itemFcArr.push(itemFc);
    }

    return itemFcArr;
}

/**
 * FC���ƑO��FC�����w��̔N���̈ʒu�ɐݒ�
 * @param {*} pProductObj
 * @param {*} pYearMonthObj
 * @param {*} itemFc
 * @param {*} fcBpObj
 * @param {*} columns
 */
function setFcValues(pProductObj, pYearMonthObj, itemFc, fcBpObj, columns) {

    // ����A�C�e���̏ꍇ
    if (pProductObj.itemId == fcBpObj.getValue(columns[0])) {

        // ����.�ꏊ���ꏊ�z�����index���擾
        var lpos = pProductObj.locations.indexOf(fcBpObj.getValue(columns[2]));

        // �N���z���index���擾
        var pos = pYearMonthObj.yyyyMMArr.indexOf(fcBpObj.getValue(columns[6]));
        //�@�N���z��ɑ��݂���ꍇ
        if (lpos >= 0 && pos >= 0) {
            // �z��w��N���ʒu�Ɋi�[
            itemFc.locations[lpos].fcLastArr[pos] = fcBpObj.getValue(columns[5]);
            itemFc.locations[lpos].fcLastIds[pos] = fcBpObj.getValue(columns[7]);
        }
    }
}

/**
 * ���̑��S���҂̃A�C�e��FC�����w��̔N���̈ʒu�ɐݒ�
 * @param {*} pProductObj
 * @param {*} pYearMonthObj
 * @param {*} itemFc
 * @param {*} fcOthersBpObj
 * @param {*} columns
 */
function setOthersFcValues(pProductObj, pYearMonthObj, itemFc, fcOthersBpObj, columns) {
    // ����A�C�e���̏ꍇ
    if (pProductObj.itemId == fcOthersBpObj.getValue(columns[0])) {
        // ����.�ꏊ���ꏊ�z�����index���擾
        var lpos = pProductObj.locations.indexOf(fcOthersBpObj.getValue(columns[2]));
        // �ꏊ����̏ꍇ
        if (lpos >= 0) {
            // �N���z���index���擾
            var pos = pYearMonthObj.yyyyMMArr.indexOf(fcOthersBpObj.getValue(columns[6]));
            //�@�N���z��ɑ��݂���ꍇ
            if (pos >= 0) {
                // �z��w��N���ʒu�Ɋi�[
                itemFc.locations[lpos].fcOthersArr[pos] = fcOthersBpObj.getValue(columns[5]);
            }
        }
    }
}

/**
 * ���т̐��ʂ��w��̔N���̈ʒu�ɐݒ�
 * @param {*} pProductObj
 * @param {*} pYearMonthObj
 * @param {*} itemFc
 * @param {*} locInvMap
 * @param {*} actualObj
 * @param {*} columns
 */
function setActValues(pProductObj, pYearMonthObj, itemFc, locInvMap, actualObj, columns) {
    // ����A�C�e���̏ꍇ
    if (pProductObj.itemId == actualObj.getValue(columns[0])) {
        // ����.�q�ɂ��ꏊ�z�����index���擾
        var actLPos = getActInvLocationPos(actualObj.getValue(columns[3]), locInvMap, pProductObj.locations);
        // �ꏊ����̏ꍇ
        if (actLPos >= 0) {
            // ���t
            var yyyyMON = actualObj.getValue(columns[1]);
            // ���t����ł͂Ȃ��ꍇ
            if (!isEmpty(yyyyMON)) {
                var yyyyM =  yyyyMON.split('��')[0];//yyyyMON.substring(0, (yyyyMON.length - 2));
                // �N���z���index���擾
                nlapiLogExecution('debug',pYearMonthObj.yyyyMMArr) ;
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
 * ���ь������ʂ̑q�ɂ̏����ꏊ���擾
 * @param {*} actualResInv
 * @param {*} locInvMap
 * @param {*} locations
 * @returns index or -1(not exist)
 */
function getActInvLocationPos(actualResInv, locInvMap, locations) {
    // �ꏊ�q�Ƀ}�b�s���O�z��̌���
    var len = locInvMap.length;
    // �C���f�b�N�X
    var pos;
    // ���������[�v
    for (var i = 0; i < len; i++) {
        // ���ь��ʂ̑q�ɂ����ꏊ�̑q�ɔz�񒆂̈ʒu���擾
        var invPos = locInvMap[i].invArr.indexOf(actualResInv);
        // ���ꏊ�̑q�ɔz��ɑ��݂���ꍇ�A���[�v�𒆎~���A���ʂ�ԋp
        if (invPos >= 0) {
            // �ꏊ�z�����index���擾
            pos = locations.indexOf(locInvMap[i].locationId);
            break;
        }
    }
    return pos;
}

/**
 * HTML���쐬
 * @param {*} yyyyMMObj  �N���z��OBJ
 * @param {*} baseYear      ����N
 * @param {*} baseMonth   �����
 * @param {*} fcActArr       �\�����ʔz��
 * @param {*} userIdName  �S����ID�ƒS���Җ�
 * @param {*} pSW            ��ʕ�
 * @param {*} pSH             ��ʍ���
 */
function createHtmlNote(yyyyMMObj, baseYear, baseMonth, fcActArr, userIdName, pSW, pSH,subsidiary) {    //CSV
//    var csvMainString = '';
//    var csvDetailStr = '';
    // �e�[�u����
    // var tbW = 'width:' + Number(pSW * 59 / 60) + 'px;';
    var tbW = 'width:1218px;';
    // �e�[�u������
    var tbH = 'height:' + Number(pSH * 59 / 60 - 250) + 'px;';
    // �e�[�u�����C������
    var lineH = 'height:28px;';

    var htmlNote = '';

    htmlNote += '<div style="margin-bottom:5px;font-weight:900;font-size:24px;">('+nlapiLookupField('subsidiary',subsidiary,'legalname')+') FORECAST LIST</div>';
    htmlNote += '<div style="margin-bottom:5px;">';
    htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">Tanto    :    ' + userIdName.id + '</div>';
    htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">' + userIdName.name + '</div>';
    htmlNote += '<div style="display:inline-block;font-weight:bold;font-size:18px;color:red;margin-left:130px;">�������@Actual�͑SSalesman�̍��v���l�ł��@������</div>';
    htmlNote += '</div>';
    htmlNote += '<div id="tablediv" style="overflow-y:scroll;' + tbH + tbW+'border:1px solid gray;border-bottom: 0;border-right: 0;">';
    htmlNote += '<table style="border-collapse:separate;width:1200px;font-size:15px;font-weight:bold;border-spacing:0;">';
    // �N���s���쐬
    htmlNote += createYearMonthRows(yyyyMMObj, baseYear, baseMonth, lineH);
    // �A�C�e���̗\�����s��HTML���쐬
    htmlNote += createRowsForItems(yyyyMMObj, baseYear, baseMonth, fcActArr, lineH);
    htmlNote += '</tr>';
    htmlNote += '</table>';
    htmlNote += '</div>';
    return htmlNote;
}

/**
 * �N���sHTML���쐬
 * @param {*} yyyyMMObj  �N���z��OBJ
 * @param {*} baseYear      ����N
 * @param {*} baseMonth   �����
 * @param {*} lineH          ���C������
 * @returns HTML
 */
function createYearMonthRows(yyyyMMObj, baseYear, baseMonth, lineH) {
    // �N���sHTML
    var yearMonthHtml = '';
    // ��TDHTML
    var monthTds = '';
    // �NTDHTML
    var yearTds = '';
    // ��TDHTML
    var blankTds = '';
    // ������t
    var printDate = pagedate;

    //-------------month, year and blank td--------------------------------------------------------------------
    // 12�������̃f�[�^�����[�v
    for (var i = 0; i < 12; i++) {
        // ��N���̏ꍇ�ACSS��ύX���A��������
        if (baseMonth == yyyyMMObj.monthArr[i]) {
            monthTds+='<td style="border:1px solid gray;width:66px;background-color:#000080;color:#ffffff;">' + yyyyMMObj.monthArr[i] + '</td>';
            yearTds+= '<td style="border:1px solid gray;background-color:#000080;color:#ffffff;">' + yyyyMMObj.yearArr[i] + '</td>';
            blankTds+='<td style="border:1px solid gray;background-color:#000080;color:#ffffff;"></td>';
        } else {
            monthTds+='<td style="border:1px solid gray;width:66px;">' + yyyyMMObj.monthArr[i] + '</td>';
            yearTds+= '<td style="border:1px solid gray;">' + yyyyMMObj.yearArr[i] + '</td>';
            blankTds+='<td style="border:1px solid gray;"></td>';
        }
    }
    // �N���s���쐬
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
    yearMonthHtml += '<td colspan="2" style="border:1px solid gray;border-right:0px;">����F</td>';
    yearMonthHtml += '<td style="border:1px solid gray;border-left:0px;">' + baseYear + '/' + baseMonth +'</td>';
    yearMonthHtml += blankTds;
    yearMonthHtml += '</tr>';
    yearMonthHtml += '</thead>';

    return yearMonthHtml;
}

/**
 * �A�C�e���̗\�����s��HTML���쐬
 * @param {*} yyyyMMObj  �N���z��OBJ
 * @param {*} baseYear      ����N
 * @param {*} baseMonth   �����
 * @param {*} fcActArr       �\�����ʔz��
 * @param {*} lineH          ���C������
 * @returns �A�C�e���̗\�����s��HTML
 */
function createRowsForItems (yyyyMMObj, baseYear, baseMonth, fcActArr, lineH) {
    // �A�C�e��HTML
    var itemHtml = '';
    // �A�C�e���̌���
    var itemLen = fcActArr.length;

    // �A�C�e���̌����������[�v
    for (var i = 0; i < itemLen; i++) {
        itemHtml += '<tr style="'+ lineH +'background-color:#e6e6e6;">';;
        itemHtml += '<td colspan="3" style="border:1px solid gray;border-right:0px;text-align:left;color:#0033cc;">' + fcActArr[i].item + '</td>';
        itemHtml += '<td colspan="12" style="border:1px solid gray;border-left:0px;text-align:left;color:#0033cc;">' + fcActArr[i].itemName + '</td>';
        itemHtml += '</tr>';
        // �ꏊ�̌���
        var locLen = fcActArr[i].locations.length;
        // �ꏊ�̌����������[�v
        for (var l = 0; l < locLen; l++) {
            var actLast = '';
            var actNow = '';
            var fcLast = '';
            var fcOthers = '';
            var fcSelf = '';

            // 12�������̃f�[�^�����[�v
            for (var m = 0; m < 12; m++) {
                // (year - 1) actual��
                actLast += '<td style="border:1px solid gray;">' + fcActArr[i].locations[l].actLast[m] + '</td>';
                // year actual��
                actNow += '<td style="border:1px solid gray;">' + fcActArr[i].locations[l].actNow[m] + '</td>';
                // �����ȊOFC��
                fcOthers += '<td style="border:1px solid gray;">' + fcActArr[i].locations[l].fcOthersArr[m] + '</td>';
                // �O��FC��
                fcLast += '<td style="border:1px solid gray;">' + fcActArr[i].locations[l].fcLastArr[m] + '</td>';
                // ��r/����FC��
                var comparation = '0.0';
                // actual���ƑO��FC����������̏ꍇ
                if (!isEmpty(fcActArr[i].locations[l].actNow[m]) && !isEmpty(fcActArr[i].locations[l].fcLastArr[m])) {
                    comparation = Math.round((fcActArr[i].locations[l].actNow[m]/fcActArr[i].locations[l].fcLastArr[m]) * 10) / 10;
                    comparation = comparation.toFixed(1);
                }
                // ����ȍ~�̌��̏ꍇ�AFC���͂���̓{�b�N�X�ɕύX
                if (new Date(yyyyMMObj.yearArr[m], yyyyMMObj.monthArr[m], 1) > new Date()) {
                    var inputId = 'fcid:' + fcActArr[i].itemId+'|'+fcActArr[i].locations[l].locationId+'|'+ yyyyMMObj.yearArr[m] + yyyyMMObj.monthArr[m] + '|' + fcActArr[i].locations[l].fcLastIds[m];
                    if (comparation == '0.0') {
                        comparation = '';
                    }
                    fcSelf += '<td style="border:1px solid gray;padding:0;'+ lineH +'">';
                    fcSelf += '<input type="text" id="' + inputId + '" name="fcQuan" style="width:100%;height:100%;border:0px;padding:0px;background-color:#ffff99;text-align:right;font-size:15px;" value="';
                    fcSelf += comparation + '"/></td>';
                } else {
                    fcSelf += '<td style="border:1px solid gray;text-align:right;color:#134DF2;">' + comparation + '</td>';
                }
                
            }
            // (Year-1) title + monthly details
            itemHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
            itemHtml+='<td rowspan="5" style="border:1px solid gray;border-right:0px;width:110px;text-align:left;vertical-align:top;">' + fcActArr[i].locations[l].location + '</td>';
            itemHtml+='<td rowspan="2" style="border:1px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;">Actual</td>';
            itemHtml+='<td style="border:1px solid gray;text-align:left;width:128px;">(Year-1)</td>';
            itemHtml += actLast;
            itemHtml += '</tr>';
            // Year title + monthly details
            itemHtml+='</tr>';
            itemHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
            itemHtml+='<td style="border:1px solid gray;text-align:left;">Year</td>';
            itemHtml += actNow;
            itemHtml += '</tr>';
            // �����ȊO title + monthly details
            itemHtml+='</tr>';
            itemHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
            itemHtml+='<td rowspan="3" style="border:1px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;">Forecast</td>';
            itemHtml+='<td style="border:1px solid gray;text-align:left;">�����ȊO</td>';
            itemHtml += fcOthers;
            itemHtml += '</tr>';
            // �O�� title + monthly details
            itemHtml+='</tr>';
            itemHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
            itemHtml+='<td style="border:1px solid gray;text-align:left;">�O��</td>';
            itemHtml += fcLast;
            itemHtml += '</tr>';
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
            itemHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;">';
            itemHtml+='<td style="border:1px solid gray;text-align:left;"><span style="color:#134DF2;">��r</span><span style="' + colorForSlash + '">�^</span><span style="' + colorForInput + '">����</span></td>';
            itemHtml += fcSelf;
            itemHtml += '</tr>';
        }
    }
    return itemHtml;
}
/**
 * Csv main data
 * @param {*} yyyyMMObj  �N���z��OBJ
 * @param {*} baseYear      ����N
 * @param {*} baseMonth   �����
 * @param {*} fcActArr       �\�����ʔz��
 * @param {*} lineH          ���C������
 * @returns �A�C�e���̗\�����s��Csv
 */
//20221010 add by zhou U395 start
function createCsvNote (userIdName,yyyyMMObj, baseYear, baseMonth, fcActArr,pDate,sub) {
    //CSV
	var lineNum = 0;
	var subsidiary = sub;
	var subsidiaryRecord = nlapiLoadRecord('subsidiary', subsidiary);
	var subsidiaryName = subsidiaryRecord.getFieldValue('name');
    // �A�C�e��String
    var csvMainString = '';
    var csvDetailStr = '';
    // �A�C�e���̌���
    var itemLen = fcActArr.length;
    var userId = userIdName.id;
    //DJ_BP user internalid get
    var employeeSearch = nlapiSearchRecord("employee",null,
    		[
    		 ["custentity_djkk_employee_id","is", userId]
    		], 
    		[
    		 new nlobjSearchColumn("internalid")
    		]
    		);
    if(!isEmpty(employeeSearch)){
		var userInternalid= employeeSearch[0].getValue('internalid');
    }
    // �A�C�e���̌����������[�v
    for (var i = 0; i < itemLen; i++) {
    	//item internalid get
    	var itemId = fcActArr[i].item;
		var itemInternalid= fcActArr[i].itemId;
        // �ꏊ�̌���
        var locLen = fcActArr[i].locations.length;
        // �ꏊ�̌����������[�v
        for (var l = 0; l < locLen; l++) {
            var actLast = '';
            var actNow = '';
            var fcLast = '';
            var fcOthers = '';
            var fcSelf = '';

            // 12�������̃f�[�^�����[�v
            for (var m = 6; m < 12; m++) {
                // ��r/����FC��
                var comparation = '0.0';
                // actual���ƑO��FC����������̏ꍇ
                if (!isEmpty(fcActArr[i].locations[l].actNow[m]) && !isEmpty(fcActArr[i].locations[l].fcLastArr[m])) {
                    comparation = Math.round((fcActArr[i].locations[l].actNow[m]/fcActArr[i].locations[l].fcLastArr[m]) * 10) / 10;
                    comparation = comparation.toFixed(1);
                }
                // ����ȍ~�̌��̏ꍇ�AFC���͂���̓{�b�N�X�ɕύX
                if (new Date(yyyyMMObj.yearArr[m], yyyyMMObj.monthArr[m], 1) > new Date()) {
                    if (comparation == '0.0') {
                        comparation = '';
                    }
                }
                lineNum++;
                var recordDetailId =  defaultEmpty(fcActArr[i].locations[l].fcLastIds[m]);
                var location = fcActArr[i].locations[l].location;
                var locationid = fcActArr[i].locations[l].locationId;
                var userName = userIdName.id +" "+ userIdName.name;
//                var userId = userIdName.id;
                var itemName = replace(fcActArr[i].itemName);
//                var itemId = fcActArr[i].item
                var year = yyyyMMObj.yearArr[m];
                var month = ('0' + yyyyMMObj.monthArr[m]).substr(-2);
                var theBaseDate = pDate;
                var lastYearQuantity = fcActArr[i].locations[l].actLast[m];
                var nowYearQuantity = fcActArr[i].locations[l].actNow[m];
                var fcOthersQuantity = fcActArr[i].locations[l].fcOthersArr[m];
                var fcBeforeQuantity = fcActArr[i].locations[l].fcLastArr[m]
//                csvDetailStr += userIdName[singleUserId][1]+","fcAcArr[i].itemName+","yyyyMMObj.yearArr[m]+","yyyyMMObj.monthArr[m]+","+new Date(baseYear, baseMonth, 1)+","+fcAcArr[i].locations[l].actLast[m]+","+fcAcArr[i].locations[l].actNow[m]+","+fcAcArr[i].locations[l].fcOthersArr[m]+","+comparation;
                csvDetailStr += lineNum+","+recordDetailId+","+sub+","+userInternalid+","+itemInternalid+","+locationid+","+subsidiaryName+","+location+","+userName+","+itemName+","+itemId+","+year+","+month+","+theBaseDate+","+lastYearQuantity+","+nowYearQuantity+","+fcOthersQuantity+","+fcBeforeQuantity+","+comparation;
                csvDetailStr += "\r\n";
               
            }
        } 
    }
    csvMainString += '�s�ԍ�,���R�[�h����ID,DJ_�A������ID,DJ_�S���҃R�[�h����ID,DJ_���i����ID,DJ_�ꏊ�G���A����ID,DJ_�A��,DJ_�ꏊ�G���A,DJ_�S���҃R�[�h,DJ_���i��,DJ_���i�R�[�h,DJ_�N,DJ_��,���,(Year-1),Year,�����ȊO,�O��,��r�^����\r\n'+csvDetailStr;
    return csvMainString;
}
function csvDown(xmlString){
	try{
	
		var xlsFile = nlapiCreateFile('�c�ƌv���񃌃|�[�g_LS' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
		
		xlsFile.setFolder(FILE_CABINET_ID_FC_CSV_DOWNLOAD_BP);
		xlsFile.setName('�c�ƌv���񃌃|�[�g_LS' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setEncoding('SHIFT_JIS');
	    
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		var fl = nlapiLoadFile(fileID);
		var url= fl.getURL();
		return url; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', '', e.message)
	}

}
function replace(text){
if ( typeof(text)!= "string" )
   text = String(text);

text = text.replace(/,/g, "_") ;

return text ;
}
function defaultEmpty(src){
	return src || '';
}
//zhou end