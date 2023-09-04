/**
 * DJ_���n�I��
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/27     CPC_��
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	
    var startTime = getExecuteTime();
    
	var div = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_sl_phy_inv_div');
	
	if (request.getMethod() == 'POST') {
		run(request, response,div);
		
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response,div)
		}else{
			createForm(request, response,div);
		}
	}
	
	var endTime = getExecuteTime();
	var secords = getUsageTimes(startTime, endTime);
	nlapiLogExecution('DEBUG', 'secords', secords)
}

function run(request, response,div){
	
	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	
	var str = "";
	var subsidiaryValue= request.getParameter('custpage_sub');
	var locationValue = request.getParameter('custpage_location');
	var user = nlapiGetUser();
	var role = nlapiGetRole();
	var theCount = parseInt(request.getLineItemCount('details'));
	for (var i = 0; i < theCount; i++) {
		var item_id = request.getLineItemValue('details', 'item_id',i+1);
		var inv_no = request.getLineItemValue('details', 'inv_no',i+1);
		var location_id = request.getLineItemValue('details', 'location_id',i+1);
		var binnumber_id = request.getLineItemValue('details', 'binnumber_id',i+1);
		var vo_or_cu_id = request.getLineItemValue('details', 'vo_or_cu_id',i+1);
		var count = request.getLineItemValue('details', 'count',i+1);
		var count_real = request.getLineItemValue('details', 'count_real',i+1);
		var averagecost = request.getLineItemValue('details', 'averagecost',i+1);
		var expirationdate = request.getLineItemValue('details', 'expirationdate',i+1);
		var item_memo_real = request.getLineItemValue('details', 'item_memo',i+1);
		var inventory_binnumber = request.getLineItemValue('details', 'inventory_binnumber',i+1);
		var binnumber = request.getLineItemValue('details', 'binnumber',i+1);
		//changed by geng add start U705
		if(div =='1'){
			var item_brand = request.getLineItemValue('details', 'item_brand',i+1);
			var item_product_code = request.getLineItemValue('details', 'item_product_code',i+1);
			var item_displayname = request.getLineItemValue('details', 'item_displayname',i+1);
			var item_remark = request.getLineItemValue('details', 'item_remark',i+1);
			var item_name_english = request.getLineItemValue('details', 'item_name_english',i+1);
			var item_vendorname = request.getLineItemValue('details', 'item_vendorname',i+1);
			var item_perunitquantity = request.getLineItemValue('details', 'item_perunitquantity',i+1);
			var item_memo = request.getLineItemValue('details', 'item_memo',i+1);
			var location = request.getLineItemValue('details', 'location',i+1);
		}
		//changed by geng add start U705
		if(isEmpty(count_real) || count_real < 0){
			continue;
		}
		if(div =='1'){
			str+=item_id+"_"+inv_no+"_"+location_id+"_"+binnumber_id+"_"+vo_or_cu_id+"_"+count+"_"+count_real+"_"+averagecost+"_"+expirationdate+"_"+item_brand+"_"+
			item_product_code+"_"+item_displayname+"_"+item_remark+"_"+item_name_english+"_"+item_vendorname+"_"+item_perunitquantity+"_"+item_memo+"_"+location+",";
		}else{
			str+=item_id+"_"+inv_no+"_"+location_id+"_"+binnumber_id+"_"+vo_or_cu_id+"_"+count+"_"+count_real+"_"+averagecost+"_"+expirationdate+"_"+item_memo_real+"_"+
			inventory_binnumber+"_"+binnumber+",";
		}
		
	}

	scheduleparams['custscript_djkk_ss_phy_inv_div'] = div;
	scheduleparams['custscript_djkk_ss_phy_inv_id'] = str;
	//changed by song add start U711
	scheduleparams['custscript_djkk_ss_phy_inv_location'] = locationValue;//�ꏊ
	scheduleparams['custscript_djkk_ss_phy_inv_sub'] = subsidiaryValue;//�A��
	scheduleparams['custscript_djkk_ss_phy_inv_user'] = user; //DJ_�쐬��
	scheduleparams['custscript_djkk_ss_phy_inv_role'] = role; //DJ_�쐬���[��
	//changed by song add end U711
	runBatch('customscript_djkk_ss_phy_inv', 'customdeploy_djkk_ss_phy_inv', scheduleparams);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	parameter['asd'] = ctx.getDeploymentId();

	
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}


//�o�b�`��ԉ��
function logForm(request, response,div) {

	var form = nlapiCreateForm('�������', false);
	form.setScript('customscript_djkk_cs_inv_physical');
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');

	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_phy_inv');

	if (batchStatus == 'FAILED') {
		// ���s���s�̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
		runstatusField.setDefaultValue(messageColour);
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// ���s���̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('�o�b�`���������s��');
		response.writePage(form);
	}else{
		createForm(request, response,div);
	}
	
}


//��ʍ쐬
function createForm(request, response,div){
	
	var subValue =request.getParameter('sub');	
	var locationValue = request.getParameter('location');
	var selectFlg = request.getParameter('selectFlg');
	var invoFlg = request.getParameter('invoFlg');
	// CH425�@zheng 20230619 start
	if (invoFlg == 'T') {
	    var itemFieldValue = request.getParameter('iv');
	    var tanaFieldValue = request.getParameter('tana');
	    var manageNumFieldValue = request.getParameter('mnv');
	    var locaNumFieldValue = request.getParameter('lnv');
	    var mekaNumFieldValue = request.getParameter('menv');
	    var venderItemFieldValue = request.getParameter('viv');
	}
	// CH425�@zheng 20230619 end
	
	var fileId = nlapiGetContext().getSessionObject('session_upload_file_id')
	nlapiGetContext().setSessionObject("session_upload_file_id","");
	
	var title = 'DJ_���n�I��';
	if(div == '1'){
		title = 'DJ_���n�I��';
	}else if(div == '2'){
		title = 'DJ_�a����n�I��';
	}
	
	var form = nlapiCreateForm(title, false);
	form.setScript('customscript_djkk_cs_inv_physical');

	var fildDiv = form.addField('custpage_div', 'text', '�敪')
	fildDiv.setDefaultValue(div);
	fildDiv.setDisplayType('hidden');
	
	
	var subField = form.addField('custpage_sub', 'select', '�A��');
	var selectSub=getRoleSubsidiariesAndAddSelectOption(subField);
	subField.setMandatory(true);
	subField.setDefaultValue(selectSub);
	var locationField = form.addField('custpage_location', 'select', '�q��', '');
	
	// CH425�@zheng 20230619 start
	if(div == '1') {
	    var tanaField = form.addField('custpage_tanaorosi_tana', 'select', '�ۊǒI ', '');
	    var itemField = form.addField('custpage_tanaorosi_item', 'select', '�A�C�e��', '');
	    var manageNumField = form.addField('custpage_tanaorosi_manage_num', 'text', '�Ǘ��ԍ�', '');
	    var locaNumField = form.addField('custpage_tanaorosi_local_num', 'text', '�q�ɓ��ɔԍ�', '');
	    var mekaNumField = form.addField('custpage_tanaorosi_maka_num', 'text', '���[�J�[�����ԍ�', '');
	    var venderItemField = form.addField('custpage_tanaorosi_vender_item', 'text', '�d���揤�i�R�[�h', '');   
	}
	// CH425�@zheng 20230619 end

	if(div == '1'){
	    var inv0FlgFiled = form.addField('custpage_inv_zero', 'checkbox', '"0"�݌ɂ��܂�','');
	    var tmpSub = '';
	    if (!subValue) {
	        tmpSub = selectSub;
	    } else {
	        tmpSub = subValue;
	    }
	    if(tmpSub !=SUB_SCETI && tmpSub !=SUB_DPKK){
	        inv0FlgFiled.setDisplayType('disabled');
	        inv0FlgFiled.setDefaultValue('F');
	        // CH425�@zheng 20230619 start
	        itemField.setDisplayType('hidden');
	        tanaField.setDisplayType('hidden');
	        manageNumField.setDisplayType('hidden');
	        locaNumField.setDisplayType('hidden');
	        mekaNumField.setDisplayType('hidden');
	        venderItemField.setDisplayType('hidden');
	        // CH425�@zheng 20230619 end
	    } else {
            if(isEmpty(invoFlg)){
                inv0FlgFiled.setDefaultValue('F');
                // CH425�@zheng 20230619 start
                itemField.setDisplayType('disabled');
                tanaField.setDisplayType('disabled');
                manageNumField.setDisplayType('disabled');
                locaNumField.setDisplayType('disabled');
                mekaNumField.setDisplayType('disabled');
                venderItemField.setDisplayType('disabled');
                // CH425�@zheng 20230619 end
            } else{
                if (invoFlg == 'F') {
                    inv0FlgFiled.setDefaultValue('F');
                    // CH425�@zheng 20230619 start
                    itemField.setDisplayType('disabled');
                    tanaField.setDisplayType('disabled');
                    manageNumField.setDisplayType('disabled');
                    locaNumField.setDisplayType('disabled');
                    mekaNumField.setDisplayType('disabled');
                    venderItemField.setDisplayType('disabled');
                    // CH425�@zheng 20230619 end
                } else {
                    inv0FlgFiled.setDefaultValue('T');
                }
            }
	    }
        if(selectFlg == 'T') {  
            inv0FlgFiled.setDisplayType('inline');
            // CH425�@zheng 20230619 start
            itemField.setDisplayType('inline');
            tanaField.setDisplayType('inline');
            manageNumField.setDisplayType('inline');
            locaNumField.setDisplayType('inline');
            mekaNumField.setDisplayType('inline');
            venderItemField.setDisplayType('inline');
            // CH425�@zheng 20230619 end
        }
        
        // CH425�@zheng 20230619 start
        var itemDic = getItemInfo(tmpSub);
        if (itemDic && Object.keys(itemDic).length > 0) {
            itemField.addSelectOption('', '')
            for (idId in itemDic) {
                itemField.addSelectOption(idId, itemDic[idId]);
            }
        }
        if (invoFlg == 'T') {
            if (itemFieldValue) {
                itemField.setDefaultValue(itemFieldValue)
            }
            if (tanaFieldValue) {
                tanaField.setDefaultValue(tanaFieldValue)
            }
            if (manageNumFieldValue) {
                manageNumField.setDefaultValue(manageNumFieldValue)
            }
            if (locaNumFieldValue) {
                locaNumField.setDefaultValue(locaNumFieldValue)
            }
            if (mekaNumFieldValue) {
                mekaNumField.setDefaultValue(mekaNumFieldValue)
            }
            if (venderItemFieldValue) {
                venderItemField.setDefaultValue(venderItemFieldValue)
            }
        }
        // CH425�@zheng 20230619 end
	}
	
	if(selectFlg == 'T'){	
		subField.setDisplayType('inline');
		locationField.setDisplayType('inline')	
	}
	if(isEmpty(subValue)){
		subValue=selectSub;
	}else{
		subField.setDefaultValue(subValue);
	}
	var locSelect=new Array();
    if(!isEmpty(subValue)){
    	locSelect.push(["subsidiary","anyof",subValue]);
    	locSelect.push("AND");
    	if(div=='2'){ 	
    	locSelect.push(["custrecord_djkk_inventory_type","anyof","18"]);
    	  }else{
    	locSelect.push(["custrecord_djkk_inventory_type","noneof","18"]);
    	  }
        }
	//�q�ɐݒ�
	var locationSearch = nlapiSearchRecord("location",null,
			locSelect, 
			[
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("internalid")
			]
			);

	locationField.addSelectOption('', '')
	if(!isEmpty(locationSearch)){
		for(var i = 0 ; i < locationSearch.length ; i++){
			locationField.addSelectOption(locationSearch[i].getValue("internalid"), locationSearch[i].getValue("name"))
		}
	}
	
   var select = new Array();
   var locationCon = new Array();
   var parent = '';
    if(!isEmpty(subValue)){
	select.push(["subsidiary","anyof",subValue]);
	select.push("AND");
	if(!isEmpty(locationValue)){
		//changed by geng add start U572
		var locationRecord = nlapiLoadRecord('location',locationValue);
	    parent = locationRecord.getFieldValue('parent');
		var locationName = locationRecord.getFieldValue('name');
		if(isEmpty(parent)){
			
			var LocationList = getSearchResults("location",null,
					[
					 	"name","contains",locationName
					], 
					[
					   new nlobjSearchColumn("internalid")
					]
					);
			if(!isEmpty(LocationList)){
				for(var i=0;i<LocationList.length;i++){
					var internalid = LocationList[i].getValue("internalid");
					locationCon.push(internalid);
				}
				select.push(["internalid","anyof",locationCon])
			}
		}else{
		
		//changed by geng add end U572
		select.push(["internalid","anyof",locationValue])
		}
	 }else{
			select.push(["internalidnumber","isnotempty",""]);	  
	 }
	
	select.push("AND");
	if(div=='2'){
	select.push(["custrecord_djkk_inventory_type","anyof","18"]);
	  }else{
	select.push(["custrecord_djkk_inventory_type","noneof","18"]);
	  }
    }
	
	var locationRst = nlapiSearchRecord("location",null,select,
			[
			   new nlobjSearchColumn("internalid")
			]
			);
	var locationArr = new Array();
	if(!isEmpty(locationRst)){
		for(var i = 0 ; i < locationRst.length ; i++){
			var locationID = locationRst[i].getValue("internalid");
			if(isEmpty(parent)){
				if(locationID!=locationValue){
					locationArr.push(locationID);
				}
			}else{
				locationArr.push(locationID);
			}
			
			
		}
	}
	
	locationField.setDefaultValue(locationValue);
	// CH425�@zheng 20230619 start
    var binDic = getBinInfo(tmpSub, locationArr);
    nlapiLogExecution('DEBUG', 'binDic', JSON.stringify(binDic));
    if (binDic && Object.keys(binDic).length > 0) {
        tanaField.addSelectOption('', '')
        for (idId in binDic) {
            tanaField.addSelectOption(idId, binDic[idId]);
        }
    } 
    // CH425�@zheng 20230619 end
	if(selectFlg == 'T'){
		var fileState = form.addField('custpage_file_state', 'text', '�t�@�C���擾���').setDisplayType('inline')
		var file = null;
		if(!isEmpty(fileId)){
			file = nlapiLoadFile(fileId)
			fileState.setDefaultValue(file.getName()+'�擾���܂����B')
		}else{
			fileState.setDefaultValue('�t�@�C���擾�ł��܂���ł����B')
		}
	}

	
	var vendorShow = "�d����";
	var til1='';
	var til2='';
	var til3='';
	 if(div == '1'){
		 vendorShow="�d����";
	     til1='�ۊǒI�ԍ�ID';
		 til2='�ۊǒI';
	 }else if(div == '2'){
		 vendorShow="�ڋq";
		 til1='�a����݌�-����ID';
		 til2='�a����݌�ID';
		 til3='�a����݌ɕۊǒI�ԍ�';
	 }
	 
	 var subList = form.addSubList('details', 'list', title);

	 // CH294 zheng 20230316 start
	 if(div == '1'){
	     // �A�C�e���R�[�h
	     subList.addField('item_id', 'text', '�A�C�e��ID').setDisplayType('hidden');
	     subList.addField('item_name', 'text', '�A�C�e���R�[�h').setDisplayType('disabled');
	     // �A�C�e����
         subList.addField('item_name_english', 'text', '�A�C�e����').setDisplayType('disabled');
	     // �J�^���O�R�[�h
         subList.addField('item_product_code', 'text', '�J�^���O�R�[�h').setDisplayType('disabled');
         // �d���揤�i�R�[�h
         subList.addField('item_vendorname', 'text', '�d�����i�R�[�h').setDisplayType('disabled');
         // ���萔
         subList.addField('item_perunitquantity', 'text', '���萔').setDisplayType('disabled');
         // �ꏊ
         subList.addField('location_id', 'text', '�ꏊID').setDisplayType('hidden');
         subList.addField('location', 'text', '�ꏊ');
         // �ۊǒI
         subList.addField('binnumber_id', 'text', til1).setDisplayType('hidden');
         subList.addField('binnumber', 'text', til2)
         subList.addField('inventory_binnumber', 'text', til3).setDisplayType('hidden')
         // �Ǘ��ԍ�
         subList.addField('inv_no_id', 'text', '�Ǘ��ԍ�ID').setDisplayType('hidden');
         subList.addField('inv_no', 'text', '�Ǘ��ԍ�').setDisplayType('disabled');
         // �q�ɓ��ɔԍ�
         subList.addField('inv_warehouse_number', 'text', '�q�ɓ��ɔԍ�');
         // ���[�J�[�̐����ԍ�
         subList.addField('inv_aker_serial_number', 'text', '���[�J�[�̐����ԍ�');
         // �ܖ�����/�L������
         var expirationdateField=subList.addField('expirationdate', 'text', '�ܖ�����/�L������');
         expirationdateField.setDisplayType('disabled');
         // ���b�g���}�[�N
         subList.addField('item_remark', 'text', '���b�g���}�[�N').setDisplayType('disabled');
         // ���ό���
         var averagecostField=subList.addField('averagecost', 'text', '���ό���');
         averagecostField.setDisplayType('disabled');
         // �݌ɐ�
         subList.addField('count', 'text', '�݌ɐ�').setDisplayType('disabled');
         // �݌ɒP��
         subList.addField('inv_stock_unit', 'text', '�݌ɒP��');
         // �d����
         subList.addField('vo_or_cu_id', 'text', vendorShow+'ID').setDisplayType('hidden');
         subList.addField('vo_or_cu', 'text', vendorShow).setDisplayType('disabled');    
         // �u�����h
         subList.addField('item_brand', 'text', '�u�����h').setDisplayType('disabled');
         // ���n����
         subList.addField('count_real', 'float', '���n����').setDisplayType('entry'); 
         // ���̑�
	     subList.addField('item_memo', 'text', '�A�C�e������').setDisplayType('hidden');
         subList.addField('item_displayname', 'text', '���i��').setDisplayType('hidden');
	 } else {
	     subList.addField('item_id', 'text', '�A�C�e��ID').setDisplayType('hidden');
	     subList.addField('item_name', 'text', '�A�C�e����').setDisplayType('disabled');
	     subList.addField('item_memo', 'text', '�A�C�e������').setDisplayType('disabled');
	     subList.addField('inv_no_id', 'text', '�݌ɔԍ�ID').setDisplayType('hidden');
	     subList.addField('inv_no', 'text', '�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j').setDisplayType('disabled');
	     subList.addField('location_id', 'text', '�ꏊID').setDisplayType('hidden');
	     subList.addField('location', 'text', '�ꏊ')
	     subList.addField('binnumber_id', 'text', til1).setDisplayType('hidden');
	     subList.addField('binnumber', 'text', til2)
	     subList.addField('inventory_binnumber', 'text', til3)
	     subList.addField('vo_or_cu_id', 'text', vendorShow+'ID').setDisplayType('hidden');
	     subList.addField('vo_or_cu', 'text', vendorShow).setDisplayType('disabled');    
	     var averagecostField=subList.addField('averagecost', 'text', 'Total Stock Value/���z');
	     averagecostField.setDisplayType('disabled');
	     var expirationdateField=subList.addField('expirationdate', 'text', '�ܖ�����');
	     expirationdateField.setDisplayType('disabled');
	     subList.addField('count', 'text', '�݌�').setDisplayType('disabled');
	     subList.addField('count_real', 'float', '���n����').setDisplayType('entry'); 
	 }
//	 subList.addField('item_id', 'text', '�A�C�e��ID').setDisplayType('hidden');
//	 subList.addField('item_name', 'text', '�A�C�e����').setDisplayType('disabled');
//	 subList.addField('item_memo', 'text', '�A�C�e������').setDisplayType('disabled');
//	 subList.addField('inv_no_id', 'text', '�݌ɔԍ�ID').setDisplayType('hidden');
//	 subList.addField('inv_no', 'text', '�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j').setDisplayType('disabled');
//	 subList.addField('location_id', 'text', '�ꏊID').setDisplayType('hidden');
//	 subList.addField('location', 'text', '�ꏊ')
//	//changed by geng add start U705
//	 if(div == '1'){
//		 subList.addField('item_brand', 'text', '�u�����h').setDisplayType('disabled');
//		 subList.addField('item_product_code', 'text', '�J�^���O�R�[�h').setDisplayType('disabled');
//		 subList.addField('item_displayname', 'text', '���i��').setDisplayType('disabled');
//		 subList.addField('item_remark', 'text', '���b�g���}�[�N').setDisplayType('disabled');
//		 subList.addField('item_name_english', 'text', '���i���i�p��j').setDisplayType('disabled');
//		 subList.addField('item_vendorname', 'text', '�d���揤�i�R�[�h').setDisplayType('disabled');
//		 subList.addField('item_perunitquantity', 'text', '���萔').setDisplayType('disabled');
//	 }	 
//	 //changed bt geng add end
//	 subList.addField('binnumber_id', 'text', til1).setDisplayType('hidden');
//	 subList.addField('binnumber', 'text', til2)
//	 subList.addField('inventory_binnumber', 'text', til3)
//	 	 	 
//	 subList.addField('vo_or_cu_id', 'text', vendorShow+'ID').setDisplayType('hidden');
//	 subList.addField('vo_or_cu', 'text', vendorShow).setDisplayType('disabled');	 
//	 var averagecostField=subList.addField('averagecost', 'text', 'Total Stock Value/���z');
//	 averagecostField.setDisplayType('disabled');
//	 var expirationdateField=subList.addField('expirationdate', 'text', '�ܖ�����');
//	 expirationdateField.setDisplayType('disabled');
//	 subList.addField('count', 'text', '�݌�').setDisplayType('disabled');
//	 subList.addField('count_real', 'float', '���n����').setDisplayType('entry'); 
	 // CH294 zheng 20230316 end
	 var strCsv = '';
	 var xmlString = '';
		
	 if(selectFlg == 'T'){
		 
		 
		 
		 if(div == '1'){
			 
				//��{�P�ʓ]��
				var unitstypeSearch = getSearchResults("unitstype",null,
						[
						   ["isinactive","is","F"]
						], 
						[
						   new nlobjSearchColumn("internalid"), 
						   new nlobjSearchColumn("unitname"), 
						   new nlobjSearchColumn("conversionrate"),
						   new nlobjSearchColumn("name")
						]
						);
				var unitsArr = new Array();
				if(!isEmpty(unitstypeSearch)){
					for(var i = 0 ; i < unitstypeSearch.length ; i++){
						var json = {};
						json.unitname = unitstypeSearch[i].getValue('unitname');
						json.conversionrate = unitstypeSearch[i].getValue('conversionrate')
						json.typename = unitstypeSearch[i].getValue('name')
						
						unitsArr.push(json);
					}
					
				}
		     // CH244 zheng 20230216 start
			 var itemSearchFilter = [];
			 var fileFromDic = {};
			 var invDetailSeachFilter = [];
			 invDetailSeachFilter.push(["inventorynumber.quantityavailable","greaterthan","0"]);
			 invDetailSeachFilter.push("AND");
			 invDetailSeachFilter.push(["binnumber","noneof","@NONE@"]);
			 nlapiLogExecution('DEBUG', 'tmpSub', tmpSub);
			 if (!isEmpty(fileId)) {
			     if(tmpSub !=SUB_SCETI && tmpSub !=SUB_DPKK){
	                 fileFromDic = getReSearchCondition(file);
	                 var reSearchFilterList = fileFromDic.searchFilter;
	                 nlapiLogExecution('DEBUG', 'reSearchFilterList', reSearchFilterList.length);
	                 if (reSearchFilterList.length == 0) {
	                     itemSearchFilter.push(["inventorynumber.quantityonhand","greaterthan","0"]);
	                 } else {
	                     itemSearchFilter = reSearchFilterList;
	                 }   
			     } else {
                     if (invoFlg == "F") {
                         itemSearchFilter.push(["inventorynumber.quantityonhand","greaterthan","0"]);   
                     }
			     }
			 } else {
			     if(tmpSub !=SUB_SCETI && tmpSub !=SUB_DPKK){
			         //itemSearchFilter.push(["inventorynumber.quantityonhand","greaterthan","0"]);
			     } else {
	                if (invoFlg == "F") {
	                    itemSearchFilter.push(["inventorynumber.quantityonhand","greaterthan","0"]);   
	                } else {
	                    // CH425�@zheng 20230620 start
                        if (itemFieldValue) {
                            if (itemSearchFilter.length > 0) {
                                itemSearchFilter.push("AND");
                            }
                            itemSearchFilter.push(["internalid","anyof", itemFieldValue]); 
                        }
                        if (manageNumFieldValue) {
                            if (itemSearchFilter.length > 0) {
                                itemSearchFilter.push("AND");
                            }
                            itemSearchFilter.push(["inventorynumber.inventorynumber","is",manageNumFieldValue]); 
                        }
                        if (locaNumFieldValue) {
                            if (itemSearchFilter.length > 0) {
                                itemSearchFilter.push("AND");
                            }
                            itemSearchFilter.push(["inventorynumber.custitemnumber_djkk_warehouse_number","is",locaNumFieldValue]); 
                        }
                        if (mekaNumFieldValue) {
                            if (itemSearchFilter.length > 0) {
                                itemSearchFilter.push("AND");
                            }
                            itemSearchFilter.push(["inventorynumber.custitemnumber_djkk_maker_serial_number","is",mekaNumFieldValue]); 
                        }
                        if (venderItemFieldValue) {
                            if (itemSearchFilter.length > 0) {
                                itemSearchFilter.push("AND");
                            }
                            itemSearchFilter.push(["vendorname","is",venderItemFieldValue]); 
                        }
                        if (invDetailSeachFilter.length > 0) {
                            invDetailSeachFilter.push("AND");
                        }
                        invDetailSeachFilter.push(["binnumber.custrecord_djkk_bin_subsidiary","anyof",tmpSub]);
                        if (locationArr.length > 0) {
                            invDetailSeachFilter.push('AND');
                            invDetailSeachFilter.push(["inventorynumber.location","anyof",locationArr]);                                
                        }
                        if (tanaFieldValue) {
                            invDetailSeachFilter.push('AND');
                            invDetailSeachFilter.push(["max(binnumber.internalid)","equalto",tanaFieldValue]); 
                        }
	                 // CH425�@zheng 20230620 start
	                }
			     }
			 }
			 
			 if (locationArr.length > 0) {
			     if (itemSearchFilter.length > 0) {
			         itemSearchFilter.push("AND");
			     }
			     itemSearchFilter.push(["inventorynumber.location","anyof",locationArr]);
			 }
			 nlapiLogExecution('DEBUG', 'itemSearchFilter', JSON.stringify(itemSearchFilter));
			 var search_1 = getSearchResults("item",null,
					 //[
					    //["inventorynumber.quantityonhand","greaterthan","0"]
					 //]
			         itemSearchFilter, 
			 // CH244 zheng 20230216 end
					 [
					  	new nlobjSearchColumn("internalid"), 
					    new nlobjSearchColumn("itemid"), 
					    new nlobjSearchColumn("displayname"), 
					    new nlobjSearchColumn("salesdescription"), 
					    new nlobjSearchColumn("quantityonhand","inventoryNumber",null), 
					    new nlobjSearchColumn("inventorynumber","inventoryNumber",null), 
					    new nlobjSearchColumn("internalid","inventoryNumber",null).setSort(false), 
					    new nlobjSearchColumn("location","inventoryNumber",null),
					    new nlobjSearchColumn("stockunit"),
					    new nlobjSearchColumn("unitstype"),
					    new nlobjSearchColumn("averagecost"),
					    new nlobjSearchColumn("expirationdate","inventoryNumber"),
					    //changed by geng add start U705
					    new nlobjSearchColumn("custitem_djkk_class"),
					    new nlobjSearchColumn("custitem_djkk_product_code"),
					    new nlobjSearchColumn("custitem_djkk_product_name_line1"),
					    new nlobjSearchColumn("custitem_djkk_product_name_line2"),					    
					    new nlobjSearchColumn("vendorname"),
					    new nlobjSearchColumn("custitem_djkk_perunitquantity"),
					    new nlobjSearchColumn("custitemnumber_djkk_lot_remark","inventoryNumber",null),
					    new nlobjSearchColumn("vendor"),					    
					  //changed by geng add end U705
	                    new nlobjSearchColumn("stockunit"), 
	                    new nlobjSearchColumn("custitemnumber_djkk_warehouse_number","inventoryNumber",null), 
	                    new nlobjSearchColumn("custitemnumber_djkk_maker_serial_number","inventoryNumber",null)
					    
					 ]
					 );
			 
			 nlapiLogExecution('DEBUG', 'search_1.length', search_1.length);

			 var search_2 = getSearchResults("inventorydetail",null,
			         invDetailSeachFilter, 
					 [
					   new nlobjSearchColumn("internalid","binNumber","GROUP"), 
					   new nlobjSearchColumn("binnumber","binNumber","GROUP"), 
					   new nlobjSearchColumn("internalid",null,"MAX"), 
					   new nlobjSearchColumn("internalid","inventoryNumber","MAX"), 
					   new nlobjSearchColumn("location","inventoryNumber","GROUP"), 
					   new nlobjSearchColumn("custrecord_djkk_bin_subsidiary","binNumber","GROUP")
					   
					 ]
					 );
			 
			 var search_2_inventoryNumber_id = new Array();
			 if(!isEmpty(search_2)){
				 for(var i = 0 ; i < search_2.length ; i++){
				     var s2Val = search_2[i].getValue("internalid","inventoryNumber","MAX");
				     if (search_2_inventoryNumber_id.indexOf(s2Val) == -1) {
		                 search_2_inventoryNumber_id.push(s2Val);
				     }
				 }
			 }
			 nlapiLogExecution('DEBUG', 'search_2_inventoryNumber_id', JSON.stringify(search_2_inventoryNumber_id));
			 //changed by geng add start U705


//					 var itemVendorSearch = nlapiSearchRecord("item",null,
//							 [
//							    ["internalid","anyof",item_idArr[i]]
//							 ], 
//							 [
//							    new nlobjSearchColumn("vendor"),
//							    new nlobjSearchColumn("internalid")
//							   
//							 ]
//							 );
//					 if(!isEmpty(itemVendorSearch)){ 
//							 vo_or_cu_id = itemVendorSearch[0].getValue("vendor");
//							 vo_or_cu = itemVendorSearch[0].getText("vendor"); 
//					 }	 
					 
				 

			 
			
			//changed by geng add end U705

			 
			 if (!isEmpty(search_1)) {
			    // CH244 zheng 20230216 start
			    var reSearchDataList = []; 
			    // CH244 zheng 20230216 end
				var lineCode = 1;
				
				//DENISJAPANDEV-1397 zheng 20230307 start
				var apprItemList = [];
				var apprInvNoList = [];
				nlapiLogExecution('DEBUG', 'locationArr', JSON.stringify(locationArr));
				for(var i = 0 ; i < search_1.length ; i++){
				     
//				    var location_id = search_1[i].getValue("location","inventoryNumber",null);
//	                if(locationArr.indexOf(location_id) < 0){
//	                    continue;
//	                }
				    var item_name = search_1[i].getValue('itemid');
				    if (apprItemList.indexOf(item_name) == -1) {
				        apprItemList.push(item_name);
				    }
				    var inv_no = search_1[i].getValue("inventorynumber","inventoryNumber",null);
                    if (apprInvNoList.indexOf(inv_no) == -1) {
                        apprInvNoList.push(inv_no);
                    }
				 }
				var apprList = [];
				if (apprItemList.length > 0 && apprInvNoList.length > 0) {
				    apprList = getApprovalDatas(selectSub, apprItemList, apprInvNoList, locationArr);
				    nlapiLogExecution('DEBUG', 'selectSub', selectSub);
				    nlapiLogExecution('DEBUG', 'apprItemList', JSON.stringify(apprItemList));
				    nlapiLogExecution('DEBUG', 'apprInvNoList', JSON.stringify(apprInvNoList));
				    nlapiLogExecution('DEBUG', 'apprList', JSON.stringify(apprList));
				}
				 //DENISJAPANDEV-1397 zheng 20230307 end
				 for(var i = 0 ; i < search_1.length ; i++){
				     
                     var location_id = search_1[i].getValue("location","inventoryNumber",null);
//                     if(locationArr.indexOf(location_id)<0){
//                         continue;
//                     }
                     var item_id = search_1[i].getValue('internalid');
                     if(apprList.indexOf(item_id)!= -1){
                         nlapiLogExecution('DEBUG', 'item->itemname->lot', item_id + '->' + item_name + '->' + inv_no);
                         continue;
                     }
	                 
				     // �A�C�e���R�[�h
                     var item_name = search_1[i].getValue('itemid');
                     // �A�C�e����
                     var item_english_one = search_1[i].getValue('custitem_djkk_product_name_line1');
                     var item_english_two = search_1[i].getValue('custitem_djkk_product_name_line2');
                     // CH542 zheng 20230524 start
                     var item_english = item_english_one + ' ' + item_english_two;
                     // CH542 zheng 20230524 end
                     // �J�^���O�R�[�h
                     var item_product_code = search_1[i].getValue('custitem_djkk_product_code');
                     // �d���揤�i�R�[�h
                     var item_vendorname = search_1[i].getValue('vendorname');
                     // ���萔
                     var item_perunitquantity = search_1[i].getValue('custitem_djkk_perunitquantity');
                     // �ꏊ
                     var location = search_1[i].getText("location","inventoryNumber",null);
                     // �Ǘ��ԍ�ID
                     var inv_no_id = search_1[i].getValue("internalid","inventoryNumber", null);
                     // �ۊǒI
                     var binnumber_id = "";
                     var binnumber ="";
                     var search_2_inventoryNumber_id_index = search_2_inventoryNumber_id.indexOf(inv_no_id);
                     if(search_2_inventoryNumber_id_index < 0){
                         if (tanaFieldValue) {
                             continue;    
                         }
                     } else {
                         binnumber_id = search_2[search_2_inventoryNumber_id_index].getValue("internalid","binNumber","GROUP");
                         binnumber = search_2[search_2_inventoryNumber_id_index].getValue("binnumber","binNumber","GROUP"); 
                         nlapiLogExecution('DEBUG', 'binnumber��binnumber_id', binnumber + '��' + binnumber_id);
                         if (tanaFieldValue) {
                             if (binnumber_id != tanaFieldValue) {
                                 continue;
                             }
                         }
                     }
                     // �Ǘ��ԍ�
                     var inv_no = search_1[i].getValue("inventorynumber","inventoryNumber", null);
                     // �q�ɓ��ɔԍ�
                     var invWarehouseNumber = search_1[i].getValue("custitemnumber_djkk_warehouse_number","inventoryNumber", null);
                     // ���[�J�[�̐����ԍ�
                     var invAkerSerialNumber = search_1[i].getValue("custitemnumber_djkk_maker_serial_number","inventoryNumber", null);
                     // �ܖ�����/�L������
                     var expirationdate = search_1[i].getValue("expirationdate","inventoryNumber");
                     // ���b�g���}�[�N
                     var item_remark = search_1[i].getValue("custitemnumber_djkk_lot_remark","inventoryNumber",null);
                     // ���ό���
                     var averagecost = search_1[i].getValue("averagecost");
                     averagecost = Number(!isEmpty(averagecost) ? averagecost : '0').toFixed();
                     // �݌ɐ�
                     var count = search_1[i].getValue("quantityonhand","inventoryNumber",null);
                     var unit =  search_1[i].getText("stockunit");
                     var unitName =  search_1[i].getText("unitstype");
                     count = getUnitCount(unitsArr,unit,unitName,count);
                     // �݌ɒP��
                     var invStockUnit = search_1[i].getText("stockunit");
                     // �d����
                     var vo_or_cu_id =search_1[i].getValue('vendor');
                     var vo_or_cu = search_1[i].getText('vendor');
                     // �u�����h
					 var item_brand = search_1[i].getText('custitem_djkk_class');
					 // ���n����
					 var count_real = '';
                     try {
                          if (!isEmpty(fileId)) {
                              if (Number(count) <= 0) {
                                  if(selectSub !=SUB_SCETI && selectSub !=SUB_DPKK){
                                      count_real = setCountNew(item_id, inv_no, location_id, file, fileFromDic);    
                                  } else {
                                      count_real = setCountA(item_id,inv_no_id,location_id,file,div,subValue);
                                  }
                                  
                              } else {
                                  count_real = setCountA(item_id,inv_no_id,location_id,file,div,subValue);
                              }
                          }
                     } catch (e) {
                          nlapiLogExecution('ERROR', '�G���[', e.message)
                     }

                     // ���̑�
					 var item_displayname = search_1[i].getValue('displayname');
					 var item_memo = search_1[i].getValue("salesdescription");

	                 strCsv+='"' + item_id+ '","'+item_name+'","'+item_english+'","'+item_product_code+'","'+item_vendorname+'","'+item_perunitquantity+'","'+location_id+'","'+location+'","'+binnumber_id+'","'+binnumber+'","'+inv_no_id+'","'+inv_no+'","'+invWarehouseNumber+'","'+invAkerSerialNumber+'","'+expirationdate+'","'+item_remark+'","'+averagecost+'","'+count+'","'+invStockUnit+'","'+vo_or_cu_id+'","'+vo_or_cu+'","'+item_brand+'","'+count_real+'"';
	                 strCsv+='\r\n';
                    
	                 if(selectSub !=SUB_SCETI && selectSub !=SUB_DPKK){
                        if(isEmpty(fileId)){
                            if (Number(count) <= 0) {
                                continue;
                            }
                        }
                    }
					// CH244 zheng 20230216 start
					if (!isEmpty(fileId)) {
					   if(selectSub !=SUB_SCETI && selectSub !=SUB_DPKK){
	                       if (Number(count) <= 0) {
	                            var reSearchDataDic = {};
	                            // �A�C�e���R�[�h
	                            reSearchDataDic.item_id = item_id;
	                            reSearchDataDic.item_name = item_name;
	                            // �A�C�e����
	                            reSearchDataDic.item_english = item_english;
	                            // �J�^���O�R�[�h
	                            reSearchDataDic.item_product_code = item_product_code;
	                            // �d���揤�i�R�[�h
	                            reSearchDataDic.item_vendorname = item_vendorname;
	                            // ���萔
	                            reSearchDataDic.item_perunitquantity = item_perunitquantity;
	                            // �ꏊ
	                            reSearchDataDic.location_id = location_id;
	                            reSearchDataDic.location = location;
	                            // �ۊǒI
	                            reSearchDataDic.binnumber_id = binnumber_id;
	                            reSearchDataDic.binnumber = binnumber;
	                            // �Ǘ��ԍ�
	                            reSearchDataDic.inv_no_id = inv_no_id;
	                            reSearchDataDic.inv_no = inv_no;
	                            // �q�ɓ��ɔԍ�
	                            reSearchDataDic.invWarehouseNumber = invWarehouseNumber;
	                            // ���[�J�[�̐����ԍ�
	                            reSearchDataDic.invAkerSerialNumber = invAkerSerialNumber;
	                            // �ܖ�����/�L������
	                            reSearchDataDic.expirationdate = expirationdate;
	                            // ���b�g���}�[�N
	                            reSearchDataDic.item_remark = item_remark;
	                            // ���ό���
	                            reSearchDataDic.averagecost = averagecost;
	                            // �݌ɐ�
	                            reSearchDataDic.count = count;
	                            // �݌ɒP��
	                            reSearchDataDic.invStockUnit = invStockUnit;
	                            // �d����
	                            reSearchDataDic.vo_or_cu_id = vo_or_cu_id;
	                            reSearchDataDic.vo_or_cu = vo_or_cu;
	                            // �u�����h
	                            reSearchDataDic.item_brand = item_brand;
	                            // ���n����
	                            reSearchDataDic.count_real = count_real;
	                            // ���̑�
	                            reSearchDataDic.item_memo = item_memo;
	                            reSearchDataDic.item_displayname = item_displayname;

	                            reSearchDataList.push(reSearchDataDic);
	                            continue;
	                        }    
					   }
					}

					// CH244 zheng 20230216 end
	                var csvDataList = [];
					// �A�C�e���R�[�h
	                subList.setLineItemValue('item_id', lineCode,item_id);
                    subList.setLineItemValue('item_name',lineCode,item_name);
                    // �A�C�e����
                    subList.setLineItemValue('item_name_english', lineCode,item_english);
                    // �J�^���O�R�[�h
                    subList.setLineItemValue('item_product_code', lineCode,item_product_code); 
                    // �d���揤�i�R�[�h
                    subList.setLineItemValue('item_vendorname', lineCode,item_vendorname);
                    // ���萔
                    subList.setLineItemValue('item_perunitquantity', lineCode,item_perunitquantity);    
                    // �ꏊ
                    subList.setLineItemValue('location_id', lineCode,location_id);
                    subList.setLineItemValue('location', lineCode,location);   
                    // �ۊǒI
                    subList.setLineItemValue('binnumber_id', lineCode,binnumber_id);
                    subList.setLineItemValue('binnumber', lineCode,binnumber);
                    // �Ǘ��ԍ�
                    subList.setLineItemValue('inv_no_id', lineCode,inv_no_id);
                    subList.setLineItemValue('inv_no', lineCode,inv_no);
                    // �q�ɓ��ɔԍ�
                    subList.setLineItemValue('inv_warehouse_number', lineCode,invWarehouseNumber);
                    // ���[�J�[�̐����ԍ�
                    subList.setLineItemValue('inv_aker_serial_number', lineCode,invAkerSerialNumber);
                    // �ܖ�����/�L������
                    subList.setLineItemValue('expirationdate', lineCode,expirationdate);
                    // ���b�g���}�[�N
                    subList.setLineItemValue('item_remark', lineCode,item_remark);
                    // ���ό���
					subList.setLineItemValue('averagecost', lineCode,averagecost);
					// �݌ɐ�
					var tmpCount = count;
					if (count != null && count != '') {
					    tmpCount = count.toString();
					}
                    subList.setLineItemValue('count', lineCode, tmpCount);
                    // �݌ɒP��
                    subList.setLineItemValue('inv_stock_unit', lineCode, invStockUnit);
                    // �d����
                    subList.setLineItemValue('vo_or_cu_id', lineCode,vo_or_cu_id);
                    subList.setLineItemValue('vo_or_cu', lineCode,vo_or_cu);
                    // �u�����h
                    subList.setLineItemValue('item_brand', lineCode,item_brand);
                    // ���n����
                    subList.setLineItemValue('count_real', lineCode,count_real);
                    // ���̑�
                    subList.setLineItemValue('item_memo', lineCode,item_memo);
					subList.setLineItemValue('item_displayname', lineCode,item_displayname);
					 				 
					//changed by geng add end U705
					//changed by geng add start U705
				    //strCsv+=item_id+","+item_name+","+item_english+","+item_product_code+","+item_vendorname+","+item_perunitquantity+","+location_id+","+location+","+binnumber_id+","+binnumber+","+inv_no_id+","+inv_no+","+invWarehouseNumber+","+invAkerSerialNumber+","+expirationdate+","+item_remark+","+averagecost+","+count+","+invStockUnit+","+vo_or_cu_id+","+vo_or_cu+","+item_brand+","+count_real+",";
				    //strCsv+="\r\n"
					//changed by geng add end U705
//					 strCsv+=item_id+","+item_name+","+item_memo+","+inv_no_id+","+inv_no+","+location_id+","+location+","+binnumber_id+","+binnumber+","+vo_or_cu_id+","+vo_or_cu+","+averagecost+","+expirationdate+","+count+","+count_real;
//					 strCsv+="\r\n"
					lineCode++;
				 }
				 
				// CH244 zheng 20230216 start
				 nlapiLogExecution('DEBUG', 'lineCode', lineCode);
				 nlapiLogExecution('DEBUG', 'reSearchDataList', JSON.stringify(reSearchDataList));
				if (reSearchDataList.length > 0) {
				     for ( var i = 0; i < reSearchDataList.length; i++) {
                        
				         var csvDataList = [];
				         var dataObj = reSearchDataList[i];
				         // �A�C�e���R�[�h
	                     subList.setLineItemValue('item_id', lineCode, dataObj.item_id);
	                     csvDataList.push('"' + dataObj.item_id + '"');
	                     csvDataList.push(',');
	                     subList.setLineItemValue('item_name',lineCode, dataObj.item_name);
                         csvDataList.push('"' + dataObj.item_name + '"');
                         csvDataList.push(',');
	                     // �A�C�e����
	                     subList.setLineItemValue('item_name_english', lineCode, dataObj.item_english);
                         csvDataList.push('"' + dataObj.item_english + '"');
                         csvDataList.push(',');
	                     // �J�^���O�R�[�h
	                     subList.setLineItemValue('item_product_code', lineCode, dataObj.item_product_code);
                         csvDataList.push('"' + dataObj.item_product_code + '"');
                         csvDataList.push(',');
	                     // �d���揤�i�R�[�h
	                     subList.setLineItemValue('item_vendorname', lineCode, dataObj.item_vendorname);
                         csvDataList.push('"' + dataObj.item_vendorname + '"');
                         csvDataList.push(',');
	                     // ���萔
	                     subList.setLineItemValue('item_perunitquantity', lineCode, dataObj.item_perunitquantity);
                         csvDataList.push('"' + dataObj.item_perunitquantity + '"');
                         csvDataList.push(',');
	                     // �ꏊ
                         subList.setLineItemValue('location_id', lineCode, dataObj.location_id);
                         csvDataList.push('"' + dataObj.location_id + '"');
                         csvDataList.push(',');
                         subList.setLineItemValue('location', lineCode, dataObj.location); 
                         csvDataList.push('"' + dataObj.location + '"');
                         csvDataList.push(',');
                         // �ۊǒI
                         subList.setLineItemValue('binnumber_id', lineCode, dataObj.binnumber_id);
                         csvDataList.push('"' + dataObj.binnumber_id + '"');
                         csvDataList.push(',');
                         subList.setLineItemValue('binnumber', lineCode, dataObj.binnumber); 
                         csvDataList.push('"' + dataObj.binnumber + '"');
                         csvDataList.push(',');
                         // �Ǘ��ԍ�
                         subList.setLineItemValue('inv_no_id', lineCode, dataObj.inv_no_id);
                         csvDataList.push('"' + dataObj.inv_no_id + '"');
                         csvDataList.push(',');
                         subList.setLineItemValue('inv_no', lineCode, dataObj.inv_no);
                         csvDataList.push('"' + dataObj.inv_no + '"');
                         csvDataList.push(',');
                         // �q�ɓ��ɔԍ�
                         subList.setLineItemValue('inv_warehouse_number', lineCode, dataObj.invWarehouseNumber);
                         csvDataList.push('"' + dataObj.invWarehouseNumber + '"');
                         csvDataList.push(',');
                         // ���[�J�[�̐����ԍ�
                         subList.setLineItemValue('inv_aker_serial_number', lineCode, dataObj.invAkerSerialNumber);
                         csvDataList.push('"' + dataObj.invAkerSerialNumber + '"');
                         csvDataList.push(',');
                         // �ܖ�����/�L������
	                     subList.setLineItemValue('expirationdate', lineCode, dataObj.expirationdate);
                         csvDataList.push('"' + dataObj.expirationdate + '"');
                         csvDataList.push(',');
	                     // ���b�g���}�[�N
	                     subList.setLineItemValue('item_remark', lineCode, dataObj.item_remark);
                         csvDataList.push('"' + dataObj.item_remark + '"');
                         csvDataList.push(',');
	                     // ���ό���
	                     subList.setLineItemValue('averagecost', lineCode, dataObj.averagecost);
                         csvDataList.push('"' + dataObj.averagecost + '"');
                         csvDataList.push(',');
	                     // �݌ɐ�
	                     subList.setLineItemValue('count', lineCode, dataObj.count);
                         csvDataList.push('"' + dataObj.count + '"');
                         csvDataList.push(',');
	                     // �݌ɒP��
	                     subList.setLineItemValue('inv_stock_unit', lineCode, dataObj.invStockUnit);
                         csvDataList.push('"' + dataObj.invStockUnit + '"');
                         csvDataList.push(',');
	                     // �d����
                         subList.setLineItemValue('vo_or_cu_id', lineCode, dataObj.vo_or_cu_id);
                         csvDataList.push('"' + dataObj.vo_or_cu_id + '"');
                         csvDataList.push(',');
                         subList.setLineItemValue('vo_or_cu', lineCode, dataObj.vo_or_cu);
                         csvDataList.push('"' + dataObj.vo_or_cu + '"');
                         csvDataList.push(',');
                         // �u�����h
                         subList.setLineItemValue('item_brand', lineCode, dataObj.item_brand);
                         csvDataList.push('"' + dataObj.item_brand + '"');
                         csvDataList.push(',');
                         // ���n����
                         subList.setLineItemValue('count_real', lineCode, dataObj.count_real);
                         csvDataList.push('"' + dataObj.count_real + '"');
                         csvDataList.push('\r\n');
                         // ���̑�
	                     subList.setLineItemValue('item_memo', lineCode, dataObj.item_memo);
	                     subList.setLineItemValue('item_displayname', lineCode, dataObj.item_displayname);
	                     
	                     strCsv = strCsv + csvDataList.join('');
	                     
	                     lineCode++;
                    }
				}
				// CH244 zheng 20230216 end
			 }
			//changed by geng add start U705
		    //xmlString += '�A�C�e��ID,�A�C�e����,�A�C�e������,�Ǘ��ԍ��i�V���A��/���b�g�ԍ��jID,�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j,�ꏊID,�ꏊ,�u�����h,�J�^���O�R�[�h ,���i�� ,���b�g���}�[�N ,���i���i�p��j,�d���揤�i�R�[�h,���萔,�ۊǒIID,�ۊǒI,�d����ID,�d����,Total Stock Value/���z ,�ܖ�����,�݌ɐ���,���n����\r\n'+strCsv; 
            var csvTitleList = [];
            csvTitleList.push('�A�C�e��ID');
            csvTitleList.push(',');
            csvTitleList.push('�A�C�e���R�[�h');
            csvTitleList.push(',');
            csvTitleList.push('�A�C�e����');
            csvTitleList.push(',');
            csvTitleList.push('�J�^���O�R�[�h');
            csvTitleList.push(',');
            csvTitleList.push('�d���揤�i�R�[�h');
            csvTitleList.push(',');
            csvTitleList.push('���萔');
            csvTitleList.push(',');
            csvTitleList.push('�ꏊID');
            csvTitleList.push(',');
            csvTitleList.push('�ꏊ');
            csvTitleList.push(',');
            csvTitleList.push('�ۊǒIID');
            csvTitleList.push(',');
            csvTitleList.push('�ۊǒI');
            csvTitleList.push(',');
            csvTitleList.push('�Ǘ��ԍ�ID');
            csvTitleList.push(',');
            csvTitleList.push('�Ǘ��ԍ�');
            csvTitleList.push(',');
            csvTitleList.push('�q�ɓ��ɔԍ�');
            csvTitleList.push(',');
            csvTitleList.push('���[�J�[�̐����ԍ�');
            csvTitleList.push(',');
            csvTitleList.push('�ܖ�����/�L������');
            csvTitleList.push(',');
            csvTitleList.push('���b�g���}�[�N');
            csvTitleList.push(',');
            csvTitleList.push('���ό���');
            csvTitleList.push(',');
            csvTitleList.push('�݌ɐ�');
            csvTitleList.push(',');
            csvTitleList.push('�݌ɒP��');
            csvTitleList.push(',');
            csvTitleList.push('�d����ID');
            csvTitleList.push(',');
            csvTitleList.push('�d����');
            csvTitleList.push(',');
            csvTitleList.push('�u�����h');
            csvTitleList.push(',');
            csvTitleList.push('���n����');
            csvTitleList.push('\r\n');
			xmlString = xmlString + csvTitleList.join('');
			xmlString = xmlString + strCsv;
		    //changed by geng add end U705
//			 xmlString += '�A�C�e��ID,�A�C�e����,�A�C�e������,�Ǘ��ԍ��i�V���A��/���b�g�ԍ��jID,�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j,�ꏊID,�ꏊ,�ۊǒIID,�ۊǒI,�d����ID,�d����,���z ,�ܖ�����,�݌ɐ���,���n����\r\n'+strCsv;
			 
		 }else if(div == '2'){
			 
			 //�a����ꍇ�\�����Ȃ�
			 averagecostField.setDisplayType('hidden');
			 expirationdateField.setDisplayType('hidden');
			 
			 var search_1 = getSearchResults("customrecord_djkk_inventory_in_custody_l",null,
					 [
					    ["custrecord_djkk_icl_quantity_inventory","greaterthanorequalto","0"], 
	                     "AND", 
	                    ["custrecord_djkk_icl_inventorydetails","isnotempty",""], 
	                     "AND", 
	                    ["custrecord_djkk_icl_inventory_in_custody.custrecord_djkk_ic_subsidiary","anyof",subValue]			    
					 ], 
					 [
					    new nlobjSearchColumn("custrecord_djkk_icl_item"), 
					    new nlobjSearchColumn("salesdescription","CUSTRECORD_DJKK_ICL_ITEM",null), 
					    new nlobjSearchColumn("custrecord_djkk_ic_customer","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null), 
					    new nlobjSearchColumn("custrecord_djkk_ic_subsidiary","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null), 
					    new nlobjSearchColumn("internalid"),
					    new nlobjSearchColumn("custrecord_djkk_icl_inventorydetail_link"), 
					    new nlobjSearchColumn("custrecord_djkk_icl_inventorydetails"),
					    new nlobjSearchColumn("custrecord_djkk_icl_cuslocation"),
					    new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null),
					    new nlobjSearchColumn("custrecord_djkk_icl_cusbin")//�a����ۊǒI
					 ]
					 );
			 var search_3_select = new Array();
			 var search_1_arr = new Array();
			 if (!isEmpty(search_1)) {
				 search_3_select.push("custrecord_djkk_inventory_details.internalid");
				 search_3_select.push("anyof");
				 for(var i = 0 ; i < search_1.length ; i++){
					 search_3_select.push(search_1[i].getValue("custrecord_djkk_icl_inventorydetails"));
					 search_1_arr.push(search_1[i].getValue("custrecord_djkk_icl_inventorydetails"));
				 }
			
			 
			 var search_3 = getSearchResults("customrecord_djkk_details_in_the_library",null,
					 [["custrecord_djkk_ditl_quantity_possible","greaterthan","0"],
					  "AND",
					  search_3_select
					 ], 
					 [
	                    new nlobjSearchColumn("custrecord_djkk_ditl_newseriallot_number"), 
	                    new nlobjSearchColumn("internalid"), 
	                    new nlobjSearchColumn("internalid","CUSTRECORD_DJKK_INVENTORY_DETAILS",null), 
	                    new nlobjSearchColumn("custrecord_djkk_ditl_quantity_possible"), 
	                    new nlobjSearchColumn("custrecord_djkk_ditl_storage_shelves"), //
//					    new nlobjSearchColumn("inventorynumber","inventoryNumber",null), 
//					    new nlobjSearchColumn("internalid","inventoryNumber",null), 
//					    new nlobjSearchColumn("binnumber"),
//					    new nlobjSearchColumn("internalid")
					 ]
					 );		 
			 if (!isEmpty(search_3)) {
				var lineCode = 1;
				 for(var i = 0 ; i < search_3.length ; i++){
					 
					 var invDetailId = search_3[i].getValue("internalid","CUSTRECORD_DJKK_INVENTORY_DETAILS",null);
					 var search_1_index = search_1_arr.indexOf(invDetailId);
					 
					 var item_id = search_1[search_1_index].getValue('custrecord_djkk_icl_item');
					 var item_name = search_1[search_1_index].getText('custrecord_djkk_icl_item');
					 var item_memo = search_1[search_1_index].getValue("salesdescription","CUSTRECORD_DJKK_ICL_ITEM",null);
					 var inv_no_id = search_3[i].getValue("internalid","CUSTRECORD_DJKK_INVENTORY_DETAILS",null);
					 var inv_no = search_3[i].getValue("custrecord_djkk_ditl_newseriallot_number");
					 var location_id = search_1[search_1_index].getValue("custrecord_djkk_icl_cuslocation");
					 var location = search_1[search_1_index].getText("custrecord_djkk_icl_cuslocation");
					 
					 var binnumber_id = search_1[search_1_index].getValue('internalid');
					 var binnumber = search_1[search_1_index].getValue("internalid","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null);
					 
					 var inventory_binnumber = search_1[search_1_index].getText("custrecord_djkk_icl_cusbin");
					 
					 var vo_or_cu_id = search_1[search_1_index].getValue("custrecord_djkk_ic_customer","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null);
					 var vo_or_cu = search_1[search_1_index].getText("custrecord_djkk_ic_customer","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null);
					 var count = search_3[i].getValue("custrecord_djkk_ditl_quantity_possible");
					 var count_real = '';
					 
					 if(locationArr.indexOf(location_id)<0){
						 continue;
					 }
					 
					 
						try {
							if (!isEmpty(fileId)) {
								count_real = setCount(item_id,inv_no_id,location_id,file,div);
							}
						} catch (e) {
							nlapiLogExecution('ERROR', '�G���[', e.message)
						}
					 
					 subList.setLineItemValue('item_id', lineCode,item_id);
					 subList.setLineItemValue('item_name',lineCode,item_name );
					 subList.setLineItemValue('item_memo', lineCode,item_memo);
					 subList.setLineItemValue('inv_no_id', lineCode,inv_no_id);
					 subList.setLineItemValue('inv_no', lineCode,inv_no);
					 subList.setLineItemValue('location_id', lineCode,location_id);
					 subList.setLineItemValue('location', lineCode,location);		
					 subList.setLineItemValue('binnumber_id', lineCode,binnumber_id);
					 subList.setLineItemValue('binnumber', lineCode,binnumber);	
					 subList.setLineItemValue('vo_or_cu_id', lineCode,vo_or_cu_id);
					 subList.setLineItemValue('vo_or_cu', lineCode,vo_or_cu);
					 subList.setLineItemValue('count', lineCode,count);
					 subList.setLineItemValue('count_real', lineCode,count_real);
					 subList.setLineItemValue('inventory_binnumber', lineCode,inventory_binnumber);
					 
					 strCsv+=item_id+","+item_name+","+item_memo+","+inv_no_id+","+inv_no+","+location_id+","+location+","+binnumber_id+","+binnumber+","+inventory_binnumber+","+vo_or_cu_id+","+vo_or_cu+","+count+","+count_real;
					 strCsv+="\r\n"
					 lineCode++;
					 }
				 }
			 }
			 xmlString += '�A�C�e��ID,�A�C�e����,�A�C�e������,�Ǘ��ԍ��i�V���A��/���b�g�ԍ��jID,�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j,�ꏊID,�ꏊ,�a����݌�-����ID,�a����݌�ID,�a����݌ɕۊǒI�ԍ� ,�ڋqID,�ڋq,�݌ɐ���,���n����\r\n'+strCsv;

		 }
	 }
	 
	 
	 if(selectFlg == 'T'){
		 
	     // CH294 zheng 20230316 start
		 // var csvDownUrl = "window.location.href='" + csvDown(xmlString) + "'";
		 var csvDownUrl = "window.location.href='" + csvDown(xmlString, div) + "'";
		 // CH294 zheng 20230316 end
		 form.addSubmitButton('�X�V');
		 form.addButton('btn_returns', '�����߂�','searchreturn()');
		 form.addButton('sublist_csvdownload', 'CSV�_�E�����[�h', 'window.ischanged = false;' + csvDownUrl);
		 form.addButton('sublist_csvupload', 'CSV�A�b�v���[�h', 'csvUpload()');
		//form.addButton('sublist_csvupload', '�A�b�v���[�h�t�@�C���擾', 'refresh()');

	 }else{
		form.addButton('btn_search', '����', 'search()')
	 }
	 

	response.writePage(form);

}

function setCount(item_id,inv_no_id,location_id,file,div,subValue){
	//add 
	
	 var fileArr = file.getValue().split('\r\n');
	 for(var i = 0 ; i  < fileArr.length ; i++){
		 if(!isEmpty(fileArr[i])){
			 var fileLine = csvDataToArray(fileArr[i].toString());
			 if(fileLine[0] == item_id && fileLine[3] == inv_no_id && fileLine[5] == location_id){
				 if(div == '1'){
					 //changed by geng add start U705
						 return isEmpty(fileLine[21]) ? null : fileLine[21];
					//changed by geng add end U705
//					 return isEmpty(fileLine[14]) ? null : fileLine[14];
				 }else{
					 return isEmpty(fileLine[12]) ? null : fileLine[12];
				 }
				 
			 }
				 
		 }	
	 }
	 return null;
}


function csvDown(xmlString, div){
	try{
	    // CH294 zheng 20230316 start
	    var prefix = '';
	    if (div == '1') {
	        prefix = '���n�I��';
	    } else {
	        prefix = '�a����n�I��';
	    }
	    var csvFileName = prefix + '_' + getFormatYmdHms() + '.csv';
	    
		// var xlsFile = nlapiCreateFile('���n�I��' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
		var xlsFile = nlapiCreateFile(csvFileName, 'CSV', xmlString);
		
		xlsFile.setFolder(FILE_CABINET_ID_DJ_ACTUAL_INVENTORY);
		// xlsFile.setName('���n�I��' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setName(csvFileName);
		xlsFile.setEncoding('SHIFT_JIS');
		// CH294 zheng 20230316 end
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

 /**
 * ���e�ɂ̓J���}���܂߂鏈��
 * 
 * @param strData
 * @returns
 */
function csvDataToArray(strData) {

    strDelimiter = (",");

    var objPattern = new RegExp(
            ("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");

    var arrData = [[]];

    var arrMatches = null;

    while (arrMatches = objPattern.exec(strData)) {

        var strMatchedDelimiter = arrMatches[1];

        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            arrData.push([]);
        }

        var strMatchedValue = '';
        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

        } else {
            strMatchedValue = arrMatches[3];
        }

        arrData[arrData.length - 1].push(strMatchedValue);
    }

    return (arrData[0]);
}

//�P�ʐ��ʓ]��
function getUnitCount (arr,name,typename,count){
	if(isEmpty(arr)){
		return count;
	
	}
	
	for(var i = 0 ; i < arr.length ; i ++){
		if(arr[i].unitname == name && arr[i].typename == typename){
			return count/Number(arr[i].conversionrate )
		}
	}
	return count;
}
//������u��
function replace(text)
{
if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/,/g, "_") ;

return text ;
}

//CH244 zheng 20230216 start
function getReSearchCondition(file) {

    var resultDic = {};
    var reSearchFilter = [];
    var addItemIdList = [];
    var addItemNameList = [];
    var invNumberList = [];
    var reItemInfo = {};
    var reLocInfo = {};
    var locationNameList = [];
    
    var fileArr = file.getValue().split('\r\n');

    for ( var i = 0; i < fileArr.length; i++) {

        if (!isEmpty(fileArr[i])) {

            var tmpLine = fileArr[i].toString();
            var tmpLines = tmpLine.split(',');
            if (!tmpLines[0]) {
                tmpLines[0] = 'tmp';
            }
            var fileLine = csvDataToArray(tmpLines);
            var tmpHandCnt = fileLine[17];
            if (isEmpty(tmpHandCnt)) {
                tmpHandCnt = 0;
            }
            var tmpRealCnt = fileLine[22];
            if (isEmpty(tmpRealCnt)) {
                tmpRealCnt = 0;
            }
            if (Number(tmpHandCnt) <= 0 && Number(tmpRealCnt) > 0) {
                var tmpItemId = fileLine[0];
                if (tmpItemId) {
                    if (addItemIdList.indexOf(tmpItemId) == -1) {
                        addItemIdList.push(tmpItemId);   
                    }
                } 
                var tmpItemName = fileLine[1];
                if (addItemNameList.indexOf(tmpItemName) == -1) {
                    addItemNameList.push(tmpItemName);   
                }

                var tmpSerialNum = fileLine[11];
                if (tmpSerialNum) {
                    if (invNumberList.indexOf(tmpSerialNum) == -1) {
                        invNumberList.push(tmpSerialNum);   
                    }
                }
                
                var tmpLocation = fileLine[7];
                if (tmpLocation) {
                    if (locationNameList.indexOf(tmpLocation) == -1) {
                        locationNameList.push(tmpLocation);   
                    }
                }
            }
        }
    }

    if (addItemNameList.length > 0) {
        
        var tmpItemNameFilters = [];
        for ( var i = 0; i < addItemNameList.length; i++) {
            var tmpItemName = addItemNameList[i];
            tmpItemNameFilters.push(["name", "is", tmpItemName]);
            if (i != addItemNameList.length - 1) {
                tmpItemNameFilters.push("OR");
            }
        }
        
        var tmpColumns = [];
        tmpColumns.push(new nlobjSearchColumn("internalid"));
        tmpColumns.push(new nlobjSearchColumn("itemid"));
        
        var itemSearch = getSearchResults("item", null, tmpItemNameFilters, tmpColumns);
        if (itemSearch && itemSearch.length > 0) {
            for(var i = 0 ; i < itemSearch.length ; i++){
                var tmpId = itemSearch[i].getValue('internalid');
                var tmpName = itemSearch[i].getValue('itemid');
                if (addItemIdList.indexOf(tmpId) == -1) {
                    addItemIdList.push(tmpId);   
                }
                reItemInfo[tmpName] = tmpId;
            }
        }
    }
    
    if (locationNameList.length > 0) {
        
        var tmpLocFilters = [];
        for ( var i = 0; i < locationNameList.length; i++) {
            var tmpLocName = locationNameList[i];
            tmpLocFilters.push(["formulatext: {namenohierarchy}", "is", tmpLocName]);
            if (i != locationNameList.length - 1) {
                tmpLocFilters.push("OR");
            }
        }
        
        var tmpLocColumns = [];
        tmpLocColumns.push(new nlobjSearchColumn("internalid"));
        tmpLocColumns.push(new nlobjSearchColumn("namenohierarchy"));
        
        var locSearch = getSearchResults("location", null, tmpLocFilters, tmpLocColumns);
        if (locSearch && locSearch.length > 0) {
            for(var i = 0 ; i < locSearch.length ; i++){
                var tmpId = locSearch[i].getValue('internalid');
                var tmpName = locSearch[i].getValue('namenohierarchy');
                reLocInfo[tmpName] = tmpId;
            }
        }
    }
    
    if (addItemIdList.length > 0 && invNumberList.length > 0) {
        var invNumFilters = [];
        for ( var i = 0; i < invNumberList.length; i++) {
            var ivnNum = invNumberList[i];
            invNumFilters.push(["inventorynumber.inventorynumber", "is", ivnNum]);
            if (i != invNumberList.length - 1) {
                invNumFilters.push("OR");
            }
        }
        reSearchFilter.push([[["inventorynumber.quantityonhand", "greaterthan", "0"]], "OR", [["internalid", "anyof", addItemIdList], "AND", ["inventorynumber.quantityonhand", "lessthanorequalto", "0"]], "AND", invNumFilters]);
    }

    resultDic.searchFilter = reSearchFilter;
    resultDic.itemInfo = reItemInfo;
    resultDic.locationInfo = reLocInfo;
    
    return resultDic;
}

function setCountNew(item_id, inv_no, location_id, file, resultDic){
    
    var itemInfoDic = resultDic.itemInfo;
    var locationDic = resultDic.locationInfo;
    
    var fileArr = file.getValue().split('\r\n');
    for(var i = 0 ; i  < fileArr.length ; i++){
        if(!isEmpty(fileArr[i])){
            
            var tmpLine = fileArr[i].toString();
            var tmpLines = tmpLine.split(',');
            if (!tmpLines[0]) {
                tmpLines[0] = 'tmp';
            }
            var fileLine = csvDataToArray(tmpLines);
            
            var tmpItemId = "";
            var tmpItemName = fileLine[1];
            var tmpItemDicVal = itemInfoDic[tmpItemName];
            if (tmpItemDicVal) {
                tmpItemId = tmpItemDicVal;
            }
            
            var tmpLocId = "";
            var tmpLocName = fileLine[7];
            var tmpLocDicVal = locationDic[tmpLocName];
            if (tmpLocDicVal) {
                tmpLocId = tmpLocDicVal;
            }
            
            var fileInvNo = fileLine[11];
            if(tmpItemId == item_id && tmpLocId == location_id && inv_no == fileInvNo){
                return isEmpty(fileLine[22]) ? null : fileLine[22];
            }
        }  
    }
    return null;
}
//CH244 zheng 20230216 end
//DENISJAPANDEV-1397 zheng 20230307 start
function getApprovalDatas (paramSubsidiary, paramItemList, paramLotList, paramLocList) {

    var itemIdList = [];

    var searchType = 'customrecord_djkk_shedunloading';

    var searchFilters = [];
    searchFilters.push(["custrecord_djkk_body_shedunloading_list.custrecord_djkk_shedunloading_status", "noneof", "2"]);
    searchFilters.push("AND");
    searchFilters.push(["custrecord_djkk_subsidiary_list", "anyof", paramSubsidiary]);
    searchFilters.push("AND");
    searchFilters.push(getOrFilters("custrecord_djkk_shed_item.name", "is", paramItemList));
    searchFilters.push("AND");
    searchFilters.push(getOrFilters("custrecord_djkk_inv_no", "is", paramLotList));
    searchFilters.push("AND");
    searchFilters.push(["custrecord_djkk_body_shedunloading_list.isinactive", "is", "F"]);
    searchFilters.push("AND");
    searchFilters.push(["custrecord_location", "anyof", paramLocList]);

    var searchColumns = [];
    searchColumns.push(new nlobjSearchColumn("custrecord_djkk_shed_item"));

    var searchResults = getSearchResults(searchType, null, searchFilters, searchColumns);
    if (searchResults && searchResults.length > 0) {
        for ( var i = 0; i < searchResults.length; i++) {
            var tmpResult = searchResults[i];
            var tmpItemId = tmpResult.getValue(searchColumns[0]);
            if (itemIdList.indexOf(tmpItemId) == -1) {
                itemIdList.push(tmpItemId);
            }
        }
    }
    
    return itemIdList;
}

/**
 * OR�t�B���^�[���쐬����
 * 
 * @param fieldId �t�B�[���h����ID
 * @param operation ���아��
 * @param valueList �o�����[���X�g
 * @returns OR�t�B���^�[���X�g
 */
function getOrFilters(fieldId, operation, valueList) {

    var orFilters = [];
    for (var i = 0; i < valueList.length; i++) {
        var tmpId = valueList[i];
        orFilters.push([fieldId, operation, tmpId]);
        if (i != valueList.length - 1) {
            orFilters.push('OR');
        }
    }

    return orFilters;
}

function setCountA(item_id,inv_no_id,location_id,file,div,subValue){
    
     var fileArr = file.getValue().split('\r\n');
     for(var i = 0 ; i  < fileArr.length ; i++){
         if(!isEmpty(fileArr[i])){
             var fileLine = csvDataToArray(fileArr[i].toString());
             if(fileLine[0] == item_id && fileLine[10] == inv_no_id && fileLine[6] == location_id){
                 if(div == '1'){
                     return isEmpty(fileLine[22]) ? null : fileLine[22];
                 }else{
                     return isEmpty(fileLine[12]) ? null : fileLine[12];
                 }
                 
             }
                 
         }  
     }
     return null;
}

//DENISJAPANDEV-1397 zheng 20230307 end
/**
 * ���s�_�̎��Ԃ��擾����
 * 
 * @returns ���s�_�̎���
 */
function getExecuteTime() {

    return new Date().getTime();
}
/**
 * ���s���Ԃ��v�Z����
 * 
 * @param startTime �J�n����
 * @param endTime �I������
 * @returns ���s����(�P�ʁF�b)
 */
function getUsageTimes(startTime, endTime) {

    var runSecond = ((endTime - startTime) / 1000).toFixed(2);

    return runSecond;
}

//CH425�@zheng 20230619 start
function getItemInfo (sub) {
    
    var resultDic = {};
    
    var searchType = "item";
    var searchFilters = [];
    searchFilters.push(["isinactive","is","F"]);
    searchFilters.push('AND');
    searchFilters.push(["subsidiary","anyof",sub.toString()]);
    
    var searchColumns = [];
    searchColumns.push(new nlobjSearchColumn("internalid"));
    searchColumns.push(new nlobjSearchColumn("itemid").setSort(false));
    searchColumns.push(new nlobjSearchColumn("displayname"));
    
    var searchResults = getSearchResults(searchType, null, searchFilters, searchColumns);
    if (searchResults && searchResults.length > 0) {
        for ( var i = 0; i < searchResults.length; i++) {
            var tmpResult = searchResults[i];
            var tmpId = tmpResult.getValue(searchColumns[0]);
            var tmpItemId = tmpResult.getValue(searchColumns[1]);
            var tmpDisplayName = tmpResult.getValue(searchColumns[2]);
            resultDic[tmpId] = tmpItemId + ' ' + tmpDisplayName;
        }
    }
    
    return resultDic;
}
function getBinInfo (sub, locationList) {
    
    var resultDic = {};
    
    var searchType = "inventorydetail";
    var searchFilters = [];
    searchFilters.push(["inventorynumber.quantityavailable","greaterthan","0"]);
    searchFilters.push('AND');
    searchFilters.push(["binnumber","noneof","@NONE@"]);
    searchFilters.push('AND');
    searchFilters.push(["binnumber.custrecord_djkk_bin_subsidiary","anyof",sub]);
    searchFilters.push('AND');
    searchFilters.push(["inventorynumber.location","anyof",locationList]);
    
    var searchColumns = [];
    searchColumns.push(new nlobjSearchColumn("internalid","binNumber","GROUP"));
    searchColumns.push(new nlobjSearchColumn("binnumber","binNumber","GROUP"));
    searchColumns.push(new nlobjSearchColumn("internalid",null,"MAX"));
    searchColumns.push(new nlobjSearchColumn("internalid","inventoryNumber","MAX"));
    searchColumns.push(new nlobjSearchColumn("location","inventoryNumber","GROUP"));
    searchColumns.push(new nlobjSearchColumn("custrecord_djkk_bin_subsidiary","binNumber","GROUP"));
    
    var searchResults = getSearchResults(searchType, null, searchFilters, searchColumns);
    if (searchResults && searchResults.length > 0) {
        for ( var i = 0; i < searchResults.length; i++) {
            var tmpResult = searchResults[i];
            var tmpId = tmpResult.getValue(searchColumns[0]);
            var tmpBinNumber = tmpResult.getValue(searchColumns[1]);
            resultDic[tmpId] = tmpBinNumber;
        }
    }
    
    return resultDic;
}
//CH425�@zheng 20230619 end