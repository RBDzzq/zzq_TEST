/**
 * DJ_BP入力_cs
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Aug 2022     ZHOU
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	var subsidiary = getRoleSubsidiary();
	var subsidiaryValue = nlapiGetFieldValue('custpage_subsidiary');
	nlapiSetFieldValue('custpage_item','');
	if(!isEmpty(subsidiaryValue)){
		subsidiary = subsidiaryValue;
	}
	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK){
		
		if(type == 'create'){
			var recordId = guid();
			nlapiSetFieldValue('custpage_associationid',recordId);
		}
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
    return true;
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
	if(name == 'custpage_subsidiary'){
		var subsidiary = nlapiGetFieldValue('custpage_subsidiary')
		if(isEmpty(subsidiary)){
			alert("連結を入力してください");
			return;
		}
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_bp_transfer', 'customdeploy_djkk_sl_bp_transfer');

		https = https + parameter;
		

		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;

		// 画面をリフレッシュする
		window.location.href = https;
	}
	if(name == 'custpage_bland' || name == 'custpage_vendor'|| name == 'custpage_productgroup'){
		nlapiRemoveSelectOption('custpage_item', null);
		var subsidiaryValue = nlapiGetFieldValue('custpage_subsidiary');
		var vendorValue = nlapiGetFieldValue('custpage_vendor');
		var blandValue = nlapiGetFieldValue('custpage_bland');
		var productGroupValue = nlapiGetFieldValue('custpage_productgroup');
		if(!isEmpty(vendorValue)){
			var vendorArray = vendorValue.split('');
		}
		if(!isEmpty(blandValue)){
			var blandValueArray = blandValue.split('');
		}
		if(!isEmpty(productGroupValue)){
			var productGroupArray = productGroupValue.split('');
		}
		//itemSearch
		var filit = new Array();
		filit.push(["isinactive","is","F"]);
		filit.push("AND");
		filit.push(["custitem_djkk_business_judgmen_fc","isnotempty",""]);
		filit.push("AND");
		filit.push(["custitem_djkk_forecast","is","T"]);
		if(!isEmpty(blandValue)){
			filit.push("AND");
			filit.push(["class","anyof",blandValueArray]);
		}
		if(!isEmpty(vendorValue)){
			filit.push("AND");
			filit.push(["othervendor","anyof",vendorArray]);
		}
		if(!isEmpty(productGroupValue)){
			filit.push("AND");
			filit.push(["custitem_djkk_product_group","anyof",productGroupArray]);
		}
		var itemSearch = nlapiSearchRecord("item",null,
				[
				    filit
				], 
				[
					new nlobjSearchColumn("itemid").setSort(false), 
					new nlobjSearchColumn("displayname") ,
					new nlobjSearchColumn("internalid") 
				]
		);
		
		
		if(itemSearch != null){
			//itemデータの取得
			var itemValueArray = [];
			for(var n = 0 ; n < itemSearch.length ; n++){
				var internalid = itemSearch[n].getValue('internalid');
				var displayname = itemSearch[n].getValue('displayname');
				var itemid = itemSearch[n].getValue('itemid');
				var str = '';
				str += itemid;
				str +=  ' '+displayname;
				itemValueArray.push({
					internalid:internalid,
					str:str
				})
			}
			//配列オブジェクトの重複除外
			var result = [];
		    for (var i = 0; i < itemValueArray.length; i++) {
		      var flag = true;
		      for (var j = 0; j < result.length; j++) {
		        if (itemValueArray[i].internalid == result[j].internalid) {
		          flag = false;
		        }
		      }
		      if (flag) {
		        result.push(itemValueArray[i]);
		      }
		    }
		    //レコードの作成
		    itemValueArray = result;
		    nlapiLogExecution('debug','value',JSON.stringify(itemValueArray))
		    for(var i = 0 ; i < itemValueArray.length ; i++){
		    	var str = itemValueArray[i].str;
		    	var itemid = itemValueArray[i].internalid;
		    	nlapiInsertSelectOption('custpage_item', itemid,str);
		    }
		}
	}
}


function createRecord(){
	var recordId = nlapiGetFieldValue('custpage_associationid');
	var vendorValue = nlapiGetFieldValue('custpage_vendor');
	var blandValue = nlapiGetFieldValue('custpage_bland');
	var productGroupValue = nlapiGetFieldValue('custpage_productgroup');
	var bpValue = nlapiGetFieldValue('custpage_bp');
	var itemValue = nlapiGetFieldValue('custpage_item');
	var subsidiaryValue = nlapiGetFieldValue('custpage_subsidiary');
	var locationValue = nlapiGetFieldValue('custpage_location');
	if(!isEmpty(bpValue)){
		var bpArray = bpValue.split('');
	}else{
		alert('入力してください：DJ_BP');
		return false;
	}
	if(!isEmpty(itemValue)){
		var itemArray = itemValue.split('');
	}else{
		alert('入力してください：DJ_アイテム ');
		return false;
	}
	if(!isEmpty(locationValue)){
		var locationAreaText = JSON.stringify(locationValue)
	}else{
		alert('入力してください：DJ_場所エリア');
		return false;
	}
//	if(!isEmpty(vendorValue)){
//		var vendorArray = vendorValue.split('');
//	}
//	if(!isEmpty(blandValue)){
//		var blandArray = blandValue.split('');
//	}
//	if(!isEmpty(productGroupValue)){
//		var productGroupArray = productGroupValue.split('');
//	}	
	var repeatItem = [];
	var repeatItemText = '';
	for(var i = 0 ; i < bpArray.length ; i++){
		for(var q = 0 ; q < itemArray.length ; q++){
			var key = '' ;
			key = subsidiaryValue + '&' + bpArray[i] + '&' + locationValue + '&' + itemArray[q];
			var keySearch = nlapiSearchRecord("customrecord_djkk_person_registration_ls",null,
					[
					 	["custrecord_djkk_anti_duplicate_recording","is",key]
					], 
					[
					    new nlobjSearchColumn("internalid"),  	 	
					]
				);
			if(keySearch == null){
				var itemSearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","anyof",itemArray[q]]
						], 
						[
						   new nlobjSearchColumn("custitem_djkk_business_judgmen_fc"),
						   new nlobjSearchColumn("displayname")
						]
				);
				if(itemSearch != null){
					var businessJudgmenFc = itemSearch[0].getValue("custitem_djkk_business_judgmen_fc");
					var displayname = itemSearch[0].getValue("displayname");
					var send = nlapiCreateRecord('customrecord_djkk_person_registration_ls');
					send.setFieldValue('custrecord_djkk_subsidiary_bp_ls',subsidiaryValue);
					send.setFieldValue('custrecord_djkk_item_ls',itemArray[q]);
					send.setFieldValue('custrecord_djkk_desciption_ls',displayname);
					send.setFieldValue('custrecord_djkk_bp_location_area_ls',locationValue);
					send.setFieldValue('custrecord_djkk_bp_ls',bpArray[i]);
					send.setFieldValue('custrecord_djkk_loc_intermediate_text_ls',locationAreaText);//DJ_場所エリア中間テキスト
					send.setFieldValue('custrecord_djkk_association_id_ls',recordId);
					send.setFieldValue('custrecord_djkk_business_judgmen_fc',businessJudgmenFc);
					send.setFieldValue('custrecord_djkk_anti_duplicate_recording',key);//key
					var id = nlapiSubmitRecord(send);
				}
			}else{
				repeatItem.push(itemArray[q]);
			}
		}
	}
	if(!isEmpty(repeatItem)){
		var itemSearch = nlapiSearchRecord("item",null,
				[
				    ["internalid","anyof",repeatItem]
				], 
				[
					new nlobjSearchColumn("itemid").setSort(false), 
					new nlobjSearchColumn("displayname") ,
					new nlobjSearchColumn("internalid") 
				]
		);
		for(var q = 0 ; q < itemSearch.length ; q++){
			if(q+1 < itemSearch.length){
				repeatItemText += itemSearch[q].getValue('itemid');
				repeatItemText +=  ' '+itemSearch[q].getValue('displayname')+'、';
			}else{
				repeatItemText += itemSearch[q].getValue('itemid');
				repeatItemText +=  ' '+itemSearch[q].getValue('displayname');
			}
		}
		alert('処理に成功しました。一部のデータはシステムにすでに存在するため:('+repeatItemText+')、データの重複を引き起こす可能性があるデータをフィルタリングします。')
	}else{
		alert('処理に成功しました。')
	}	
		
	 
}

function setParam(){
	var parameter = '';
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');// DJ_連結
//	parameter += '&bland='+nlapiGetFieldValue('custpage_bland');// DJ_ブランド
//	parameter += '&vendor='+nlapiGetFieldValue('custpage_vendor');// DJ_仕入先
//	parameter += '&productGroup='+nlapiGetFieldValue('custpage_productgroup');// DJ_製品グループ
//	parameter += '&bp='+nlapiGetFieldValue('custpage_bp');// DJ_BP
//	parameter += '&location='+nlapiGetFieldValue('custpage_location');// DJ_場所エリア
//	parameter += '&item='+nlapiGetFieldValue('custpage_item');// DJ_アイテム
//	parameter += '&associationId='+nlapiGetFieldValue('custpage_associationid');// DJ_関連ID(非表示)
	return parameter;
}

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}