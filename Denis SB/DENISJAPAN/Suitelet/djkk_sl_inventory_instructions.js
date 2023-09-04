/**
 * DJ_棚卸指示
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/23     CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	
	var div = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_sl_inv_ins_div');
	
	if (request.getMethod() == 'POST') {
		run(request, response,div);
		
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response,div)
		}else{
			createForm(request, response,div);
		}
	}
	 
}

function run(request, response,div){
	

	
	var ctx = nlapiGetContext();
	var scheduleparams = new Array();
	
	var strT = "";
	var strF = "";
	

	var theCount = parseInt(request.getLineItemCount('location_details'));
	
	for (var i = 0; i < theCount; i++) {
		var stopload = request.getLineItemValue('location_details', 'stopload',i+1);
		var stoploadold = request.getLineItemValue('location_details','stoploadold', i+1);

		if (stopload != stoploadold) {
			
			var locationId = request.getLineItemValue('location_details','loactionid', i+1);
			if(stoploadold == 'T'){
				strF += locationId+","
			}else{
				strT += locationId+","
			}
		}
	}
	
	

	
	scheduleparams['custscript_djkk_inv_ins_t_id'] = strT;
	scheduleparams['custscript_djkk_inv_ins_f_id'] = strF;
	runBatch('customscript_djkk_ss_inv_ins', 'customdeploy_djkk_ss_inv_ins', scheduleparams);


	var parameter = new Array();
	parameter['custparam_logform'] = '1';
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}


//バッチ状態画面
function logForm(request, response,div) {

	var form = nlapiCreateForm('処理状態', false);
	form.setScript('customscript_djkk_cs_inv_instructions');
	// 実行情報
	form.addFieldGroup('custpage_run_info', '実行情報');
	form.addButton('custpage_refresh', '更新', 'refresh();');
	// バッチ状態
	var batchStatus = getScheduledScriptRunStatus('customdeploy_djkk_ss_inv_ins');

	if (batchStatus == 'FAILED') {
		// 実行失敗の場合
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> バッチ処理を失敗しました </font>';
		runstatusField.setDefaultValue(messageColour);
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// 実行中の場合
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('バッチ処理を実行中');
		response.writePage(form);
	}else{
		createForm(request, response,div);
	}
	
}


//画面作成
function createForm(request, response,div){
	var title = 'DJ_棚卸指示';
	if(div == '1'){
		title = 'DJ_棚卸指示';
	}else if(div == '2'){
		title = 'DJ_預り棚卸指示';
	}
	
	var selectFlg = request.getParameter('selectFlg');
	var locArray=new Array();
	var locationValue = request.getParameter('location');
	var subValue = request.getParameter('subId');
	if(!isEmpty(locationValue)){
	locArray=locationValue.split('');
	}
	var form = nlapiCreateForm(title, false);
	 form.setScript('customscript_djkk_cs_inv_instructions');
	 
	 
	 var sub = form.addField('custpage_sub', 'select', '連結');
	 sub.setMandatory(true);
	var selectSub=getRoleSubsidiariesAndAddSelectOption(sub);
	 
	 if(isEmpty(subValue)){
			subValue=selectSub;
		}else{
			sub.setDefaultValue(subValue);
		}
	 var locationField = form.addField('custpage_location', 'multiselect', '倉庫', '');
	 var locSelect=new Array();
	    if(!isEmpty(subValue)){
	    	locSelect.push(["subsidiary","anyof",subValue]);
	    	locSelect.push("AND");
	    	if(div=='2'){    	
	    	locSelect.push(["custrecord_djkk_inventory_type","anyof","18"])
	    	  }else{
	    	locSelect.push(["custrecord_djkk_inventory_type","noneof","18"]);
	    	  }
	        }
		//倉庫設定
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
		
	locationField.setDefaultValue(locationValue);
	 var divField = form.addField('custpage_div', 'text', 'DIV').setDisplayType('hidden');
	 divField.setDefaultValue(div);
	
	 var subList = form.addSubList('location_details', 'list', '場所');
	 subList.addMarkAllButtons();
	 subList.addField('stopload', 'checkbox', '入出庫状態停止');
	 subList.addField('subsidiary', 'text', '連結').setDisplayType('disabled');
	 subList.addField('loaction', 'text', '場所').setDisplayType('disabled');
	 subList.addField('loactionid', 'text', '場所ID').setDisplayType('hidden');	 
	 subList.addField('stoploadold', 'checkbox', 'DJ_入出庫を停止old').setDisplayType('hidden');

	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '検索戻す','searchReturn()')
	 	 form.addSubmitButton('入出庫状態変更');
		 
		 // 明細行値設定
		 addSublistValue(subList,subValue,div,locArray);
		 sub.setDisplayType('inline');
		 locationField.setDisplayType('inline');
//		 if(!isEmpty(subValue)){
//		 sub.setDefaultValue(subValue);
//		 }
		 
	 }else{
		form.addButton('btn_search', '検索', 'search()');
	 }		 
	 	 response.writePage(form);
}


/*
 * サブリストの割り当て
 * */
function addSublistValue(subList,sub,div,locations) {
	
	var select = new Array();
	if(!isEmpty(sub)){
		select.push(["subsidiary","anyof",sub]);
	    select.push("AND");
		if(div=='2'){	
		select.push(["custrecord_djkk_inventory_type","anyof","18"]);
		}else{
		select.push(["custrecord_djkk_inventory_type","noneof","18"]);
  	      }
	if(!isEmpty(locations)){
		select.push("AND");
		select.push(["internalid","anyof",locations]);
		}		
	}
	var locationSearch = nlapiSearchRecord("location",null,
			[
			 select
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("subsidiary"), 
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("custrecord_djkk_stop_load")
			]
			);
	 if (!isEmpty(locationSearch)) {
		 var lineCode = 1;
         for (var j = 0; j < locationSearch.length; j++) {
        	subList.setLineItemValue('subsidiary', lineCode,locationSearch[j].getValue('subsidiary'));
        	subList.setLineItemValue('loaction', lineCode,locationSearch[j].getValue('name'));
        	subList.setLineItemValue('loactionid', lineCode,locationSearch[j].getValue('internalid'));
        	subList.setLineItemValue('stopload', lineCode,locationSearch[j].getValue('custrecord_djkk_stop_load'));
        	subList.setLineItemValue('stoploadold', lineCode,locationSearch[j].getValue('custrecord_djkk_stop_load'));
            lineCode++;
         }
     }	
}
