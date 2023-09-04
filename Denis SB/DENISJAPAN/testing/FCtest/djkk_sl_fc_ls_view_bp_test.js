/**
 * NO'T DEPLOY NOW
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/08     CPC_��
 *
 */
var pagedate=nlapiDateToString(getSystemTime());
/**
 * �c�ƌv���񃌃|�[�g_LS
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
 function suitelet(request, response){
	// request parameter: �A��
		var subsidiary=request.getParameter('subsidiary');
    // request parameter: ���
    var date = request.getParameter('date');
    pagedate=date;
    // request parameter: ����
    var operation = request.getParameter('op');
    // request parameter: ���i�R�[�h���X�g
    var rpProductCodes = request.getParameter('productCodes');
    // request parameter:�u�����h���X�g
    var rpBrand = request.getParameter('brand');
    // request parameter: ���i�����X�g
    var rpProductNms = request.getParameter('productNm');
    // request parameter: �u�����h�����X�g
    var rpBrandNms = request.getParameter('brandNm');
    // request parameter: ��ʕ�
    var rpSW = request.getParameter('width');
    // request parameter: ��ʍ���
    var rpSH = request.getParameter('height');
    // ���HTML
    var htmlNote ='';

    // ���O�C�����[�U���擾
    //var user = nlapiGetUser();
    /*******U224*******************/
    var user= request.getParameter('user');
//    if(!isEmpty(getUser)){
//    	user =getUser;
//    }
    /*******U224*******************/
    // �c�ƌv������̓t�H�[�����쐬
    var form = nlapiCreateForm('�c�ƌv���񃌃|�[�g_LS', (operation == 's'));
    // client script��ݒ�
    form.setScript('customscript_djkk_cs_fc_ls_view_bp');

    // �����̏ꍇ
    if (operation == 's') {
        // ���������{
        var htmlAndExcelXMLObj = doSearch(user, date, rpBrand, rpProductCodes, rpBrandNms, rpProductNms, rpSW, rpSH,subsidiary);
        // ����HTML���쐬
        htmlNote += htmlAndExcelXMLObj.htmlNote;
        // Excel�_�E�����[�hURL�擾
        var excelExportURL = createExcelURL(htmlAndExcelXMLObj.xmlNote, htmlAndExcelXMLObj.xmlRowCnt);

        // ��ʂɃ{�^����ǉ�
        form.addButton('custpage_exportExcel', 'Excel�o��', excelExportURL);
        form.addButton('custpage_backToSearch', '�����ɖ߂�', 'backToSearch();');
        form.addButton('custpage_csvdownload', 'CSV�_�E�����[�h', 'csvDownUrl()');
		form.addButton('custpage_csvupload', 'CSV�A�b�v���[�h', 'csvUpload()');
        // ���hidden���ڂ��쐬�A����ʈ��p���p
        createHiddenItems(form, date, rpBrand, rpProductCodes,subsidiary,user);
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
    if(!isEmpty(bpSearch)){
	for(var bps=0;bps<bpSearch.length;bps++){
		// �I�����
        var bpIsSelected = (userCdArr.indexOf(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP")) >= 0);	
		userField.addSelectOption(bpSearch[bps].getValue("internalid","CUSTRECORD_DJKK_BP_LS","GROUP"), bpSearch[bps].getValue("entityid","CUSTRECORD_DJKK_BP_LS","GROUP"),bpIsSelected);				
	}
    }
	userField.setMandatory(true);
//	}
	/*******U224*******************/
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
    pForm.addButton('custpage_viewForecastList', '����', 'viewForecastList();');
}

/**
 * ��������
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
    // ���
    var rpBaseDate = nlapiStringToDate(pDate);

    // ���i�R�[�h�z����쐬
    var itemArr = doItemSearch(pUser, pBrand, pProductCodes,subsidiary);
    // ���i�R�[�h�z�񂪋�̏ꍇ�A�S���҂̒S�����i���݂��Ȃ����߁A���b�Z�[�W���쐬����B
    if (isEmpty(itemArr) || itemArr.ids.length == 0) {
        htmlNote += '<p color="red">�S�����Ă��鏤�i�͑��݂��܂���B</p>';
    } else {
    	// �S���Җ����擾
        var userDate = doUserSearch(pUser);
    	var userArray=new Array();
    	if(pUser!='ALL'){
    		userArray=pUser.split('');
    	}else{
    		userArray=userDate.userArray;
    	}
    	var userIdName=userDate.nameArray;
    	
        // �N��OBJ���쐬
        var yyyyMMObj = getMonthYearArr(rpBaseDate.getFullYear(), rpBaseDate.getMonth() + 1);
     // �������ʖ���HTML���쐬
        /***************************************************************/
        var baseYear=rpBaseDate.getFullYear();
        var baseMonth=rpBaseDate.getMonth() + 1;
        // �e�[�u����
        // var tbW = 'width:' + Number(pSW * 59 / 60) + 'px;';
        var tbW = 'width:1218px;';
        // �e�[�u������
        var tbH = 'height:' + Number(pSH * 59 / 60 - 250) + 'px;';
        // �e�[�u�����C������
        var lineH = 'height:28px;';
        //----------------HTML header line-------------------------------
        htmlNote += '<div style="margin-bottom:5px;font-weight:900;font-size:24px;">('+nlapiLookupField('subsidiary',subsidiary,'legalname')+') FORECAST LIST</div>';
        htmlNote += '<div style="margin-bottom:5px;">';
        htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">    </div>';
        htmlNote += '<div style="width:120px;display:inline-block;font-weight:bold;font-size:16px;">    </div>';
        htmlNote += '<div style="display:inline-block;font-weight:bold;font-size:18px;color:red;margin-left:130px;">�������@Actual�͑SSalesman�̍��v���l�ł��@������</div>';
        htmlNote += '</div>';
        htmlNote += '<div id="tablediv" style="overflow-y:scroll;' + tbH + tbW+'border:1px solid gray;border-bottom: 0;border-right: 0;">';
        htmlNote += '<table style="border-collapse:separate;width:1200px;font-size:15px;font-weight:bold;border-spacing:0;">';
        //-----------------XML header line-------------------------------
        // ���������^�C�g���s
        xmlNote += '<Row>';
        xmlNote += '<Cell><Data ss:Type="String">���</Data></Cell>';
        xmlNote += '<Cell><Data ss:Type="String">�u�����h</Data></Cell>';
        xmlNote += '<Cell><Data ss:Type="String">���i��</Data></Cell>';
        xmlNote += '</Row>';
        // �u�����h��
        var brandNms = '';
        // �u�����h������łȂ��ꍇ
        if (pBrandNms != 'undefined' && !isEmpty(pBrandNms)) {
            brandNms = pBrandNms.replace(//g, '|');
        }
        // ���i��
        var productNms = '';
        // ���i������łȂ��ꍇ
        if (pProductNms != 'undefined' && !isEmpty(pProductNms)) {
            productNms = pProductNms.replace(//g, '|');
        }
        xmlNote += '<Row>';
        xmlNote += '<Cell><Data ss:Type="String">' + pDate + '</Data></Cell>';
        xmlNote += '<Cell><Data ss:Type="String">' + brandNms + '</Data></Cell>';
        xmlNote += '<Cell><Data ss:Type="String">' + productNms + ' </Data></Cell>';
        xmlNote += '</Row>';

        //------------------HTML AND XML Detail line--------------------
        // �N���s���쐬       
        /***************************************************************************************/

        // �N���sHTML
        var yearMonthHtml = '';
        // ��TDHTML
        var monthTds = '';
        // �NTDHTML
        var yearTds = '';
        // ��TDHTML
        var blankTds = '';
        // �N���sXML
        var yearMonthXml = '';
        // ��CELL
        var monthCells = '';
        // �NCELL
        var yearCells = '';
        // ��CELL
        var blankCells = '';
        // CELL�̊J�n�ʒu
        var cellIndex = '';
        // ������t
        var printDate = pagedate;


        //-------------month, year and blank td--------------------------------------------------------------------
        // 12�������̃f�[�^�����[�v
        for (var i = 0; i < 12; i++) {
            if (i == 0) {
                cellIndex = 'ss:Index="4"';
            } else {
                cellIndex = '';
            }

            // ��N���̏ꍇ�ACSS��ύX���A��������
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
        // �N���sHTML���쐬
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

        // �N���sXML���쐬
        yearMonthXml += '<Row ss:Index="4" ss:AutoFitHeight="0">';
        yearMonthXml += '<Cell ss:MergeAcross="2" ss:MergeDown="1" ss:StyleID="S05"><Data ss:Type="String">PrintDate: ' + printDate + '</Data></Cell>';
        yearMonthXml += monthCells;
        yearMonthXml += '</Row>';
        yearMonthXml += '<Row>';
        yearMonthXml += yearCells;
        yearMonthXml += '</Row>';
        yearMonthXml += '<Row>';
        yearMonthXml += '<Cell ss:MergeAcross="2" ss:StyleID="S13"><Data ss:Type="String">����F' + baseYear + '/' + baseMonth + '</Data></Cell>';
        yearMonthXml += blankCells;
        yearMonthXml += '</Row>';

        // �A�C�e��HTML
        var itemHtml = '';
        // �A�C�e��XML
        var itemXML = '';
        /*******************************************************************************************/
        
        for(var userF=0;userF<userArray.length;userF++){
        var singleUserId=userArray[userF];
                     
        // ---�{�lFC�������ʁi���N�ƍ����j-----------------------------------
        // �擾���ڔz��:�A�C�e���R�[�h�A�A�C�e�����A�ꏊ�A�N�A���AFC���A�N��
        var fcColumns = createSColumns();
        // �����t�B���^�[ DJ_�S���҃R�[�h,DJ_���i�R�[�h,DJ_�N,DJ_��
        var searchFilter = createSFilter(singleUserId, 'anyof', yyyyMMObj, itemArr.ids,subsidiary);
        // DJ_�c��FC����
        var resFCSelf = getSearchResults('customrecord_djkk_so_forecast_ls', null, searchFilter, fcColumns);

        // ---���̑��S����FC��������------------------------------------------
        // �擾���ڔz��:�A�C�e���R�[�h�A�A�C�e�����A�ꏊ�A�N�A���AFC���A�N��
        var fcOthersColumns = createSColumnsForOhters();
        // �����t�B���^�[ DJ_�S���҃R�[�h,DJ_���i�R�[�h,DJ_�N,DJ_��
        var searchOFilter = createSFilter(singleUserId, 'noneof', yyyyMMObj, itemArr.ids,subsidiary);
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

        

        // �e�������ʂ����ƂɁA���X�g�̐��`�����{�A���ʁF[{item: AA, locations: [{location: loc, fcOthersArr: [1,...], fcLastArr:[1,...], fcLastIds:[1,...]},.....]},...]
        var fcAcArr = createFcActArr(yyyyMMObj, resFCSelf, fcColumns, resFCOthers, fcOthersColumns, resAct, actColumns, itemArr.productArr, locInvObj.locInvArr);

        
        // �A�C�e���̗\�����s���쐬
        /****************************************************************************************/

      
        // �A�C�e���̌���
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

        // �A�C�e���̌����������[�v
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

            // �ꏊ�̌���
            var locLen = fcAcArr[i].locations.length;
            // xmlRowCount
            xmlRowCnt += locLen*4;

            // �ꏊ�̌����������[�v
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

                // 12�������̃f�[�^�����[�v
                for (var m = 0; m < 12; m++) {
                    //----------------HTML-----------------------------
                    // (year - 1) actual��
                    actLast += '<td style="border:1px solid gray;">' + fcAcArr[i].locations[l].actLast[m] + '</td>';
                    // year actual��
                    actNow += '<td style="border:1px solid gray;">' + fcAcArr[i].locations[l].actNow[m] + '</td>';
                    // �����ȊOFC��
                    fcOthers += '<td style="border:1px solid gray;">' + fcAcArr[i].locations[l].fcOthersArr[m] + '</td>';
                    // ��r/����FC��
                    var comparation = '0.0';
                    // HTML css font color: �F
                    var comparationFontCol = 'color:#134DF2;';
                    // excel��CELL�X�^�C��
                    var cellStyle = 'S12';
                    // ����ȍ~�̌��̏ꍇ�AFC���͂�\��
                    if (new Date(yyyyMMObj.yearArr[m], yyyyMMObj.monthArr[m], 1) > new Date(baseYear, baseMonth, 1)) {
                        comparation = fcAcArr[i].locations[l].fcLastArr[m];
                        // ���F
                        comparationFontCol = '';
                    } else {
                        // actual���ƑO��FC����������̏ꍇ
                        if (!isEmpty(fcAcArr[i].locations[l].actNow[m]) && !isEmpty(fcAcArr[i].locations[l].fcLastArr[m])) {
                            comparation = Math.round((fcAcArr[i].locations[l].actNow[m]/fcAcArr[i].locations[l].fcLastArr[m]) * 10) / 10;
                            comparation = comparation.toFixed(1);
                        }
                        cellStyle = 'S16';
                    }
                    fcSelf += '<td style="border:1px solid gray;text-align:right;' + comparationFontCol + '">' + comparation + '</td>';
                    //----------------XML-----------------------------
                    // (year - 1) actual��
                    if (isEmpty(fcAcArr[i].locations[l].actLast[m])) {
                        actLastXML += '<Cell ss:StyleID="S12"></Cell>';
                    } else {
                        actLastXML += '<Cell ss:StyleID="S12"><Data ss:Type="Number">' + fcAcArr[i].locations[l].actLast[m] + '</Data></Cell>';
                    }
                    // year actual��
                    if (isEmpty(fcAcArr[i].locations[l].actNow[m])) {
                        actNowXML += '<Cell ss:StyleID="S12"></Cell>';
                    } else {
                        actNowXML += '<Cell ss:StyleID="S12"><Data ss:Type="Number">' + fcAcArr[i].locations[l].actNow[m] + '</Data></Cell>';
                    }
                    // �����ȊOFC��
                    if (isEmpty(fcAcArr[i].locations[l].fcOthersArr[m])) {
                        fcOthersXML += '<Cell ss:StyleID="S12"></Cell>';
                    } else {
                        fcOthersXML += '<Cell ss:StyleID="S12"><Data ss:Type="Number">' + fcAcArr[i].locations[l].fcOthersArr[m] + '</Data></Cell>';
                    }
                    if (isEmpty(comparation)) {
                        fcSelfXML += '<Cell ss:StyleID="S12"></Cell>';
                    } else {
                        // ��r/����FC��
                        fcSelfXML += '<Cell ss:StyleID="' + cellStyle + '"><Data ss:Type="Number">' + comparation + '</Data></Cell>';
                    }
                }

                // ���� title�̕����F:�ԐF
                var colorForInput = 'color:#FE1B34;';
                // �u/�v�̐F:���F
                var colorForSlash = 'color:#000000;';
                if (l%2 != 0) {
                    // �F
                    colorForInput = 'color:#134DF2;';
                    colorForSlash = 'color:#134DF2;';
                }

                // ���i�\����TD�ATR��HTML��A��
                itemHtml += concatenateDetailHTML(colorForInput, colorForSlash, lineH, fcAcArr[i].locations[l].location, actLast, actNow, fcOthers, fcSelf);
                // ���i�\����CELL��XML��A��
                itemXML += concatenateDetailXML(fcAcArr[i].locations[l].location, actLastXML, actNowXML, fcOthersXML, fcSelfXML);
            }
        }
    }
        /****************************************************************************************/

        // �N���sHTML
        htmlNote += yearMonthHtml;
        // �A�C�e���̗\�����sHTML
        htmlNote += itemHtml;
        htmlNote += '</tr>';
        htmlNote += '</table>';
        htmlNote += '</div>';

        // �N���sXML
        xmlNote += yearMonthXml;
        xmlNote += itemXML;
        var xmlRowCnt = xmlRowCnt;

        /***************************************************************/
    }

    return {htmlNote : htmlNote, xmlNote : xmlNote, xmlRowCnt : xmlRowCnt};
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

        monthArr[5-i] = tmpDatePast.getMonth() + 1;
        yearArr[5-i] = tmpDatePast.getFullYear();
        monthArr[5+i+1] = tmpDateFuture.getMonth() + 1;
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
    filter.push(["custrecord_djkk_business_judgmen_fc","anyof",'2']);
    if (!isEmpty(pUser) && pUser != 'ALL') {
        filter.push('and');
        filter.push(['custrecord_djkk_bp_ls', 'anyof', pUser.split('')]);
    }
    
 // DJ_�c��FC�T�����f:���P��
   
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
 * ���i�\����TD�ATR��HTML��A��
 * @param {*} colorForInput 
 * @param {*} lineH 
 * @param {*} location 
 * @param {*} actLast 
 * @param {*} actNow 
 * @param {*} fcOthers 
 * @param {*} fcSelf 
 * @returns ���i�\��HTML
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
    // �����ȊO title + monthly details
    resHtml+='</tr>';
    resHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;text-align:right;">';
    resHtml+='<td rowspan="2" style="border:1px solid gray;border-left:0px;width:110px;text-align:left;vertical-align:top;">Forecast</td>';
    resHtml+='<td style="border:1px solid gray;text-align:left;">�����ȊO</td>';
    resHtml += fcOthers;
    resHtml += '</tr>';
    resHtml+='</tr>';
    // ��r�^���� title + monthly details
    resHtml+='<tr style="'+ lineH +'background-color:#e6e6e6;">';
    resHtml+='<td style="border:1px solid gray;text-align:left;"><span style="color:#134DF2;">��r</span><span style="' + colorForSlash + '">�^</span><span style="' + colorForInput + '">����</span></td>';
    resHtml += fcSelf;
    resHtml += '</tr>';

    return resHtml;
}

/**
 * ���i�\����CELL��XML��A��
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
    // �����ȊO title + monthly details
    resXML += '<Row ss:AutoFitHeight="0">';
    resXML += '<Cell ss:Index="2" ss:MergeDown="1" ss:StyleID="S01"><Data ss:Type="String">Forecast</Data></Cell>';
    resXML += '<Cell ss:StyleID="S11"><Data ss:Type="String">�����ȊO</Data></Cell>';
    resXML += fcOthersXML;
    resXML += '</Row>';
    // ��r�^���� title + monthly details
    resXML += '<Row ss:AutoFitHeight="0">';
    resXML += '<Cell ss:Index="3" ss:StyleID="S11"><Data ss:Type="String">��r/����</Data></Cell>';
    resXML += fcSelfXML;
    resXML += '</Row>';
    return resXML;
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
    xmlString += '<Worksheet ss:Name="�c�ƌv���񃌃|�[�g_LS">';    
    xmlString += '<Table ss:ExpandedColumnCount="15" ss:ExpandedRowCount="' + (rowCount + 1) + '" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="14">';
    xmlString += '<Column ss:Index="3" ss:AutoFitWidth="0" ss:Width="66"/>';
    xmlString +=excelXMLNote;
    xmlString += '</Table></Worksheet></Workbook>';

    // create file
    var xlsFile = nlapiCreateFile('�c�ƌv���񃌃|�[�g_LS' + '_' + getFormatYmdHms() + '.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));

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