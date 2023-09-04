/**
 * DJ_WOshippinglist発行
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jul 2021     admin
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {
	
	var listCount = nlapiGetLineItemCount('list');
	var locationSearch = nlapiSearchRecord("location",null,
			[
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
			   new nlobjSearchColumn("name")
			]
			);
	var mailArr = new Array();
	var nulllocation=false;
	var selectlocationList=new Array();
	for(var i = 0 ; i < locationSearch.length ; i++){
		mailArr[locationSearch[i].getValue('name')] = locationSearch[i].getValue("custrecord_djkk_mail","address",null);
	}
	//var str = "";
	var selectCount = 0;
	for(var i = 0 ; i < listCount; i++){
		if(nlapiGetLineItemValue('list', 'check', i+1) == 'T'){
			if(!isEmpty(nlapiGetLineItemValue('list', 'location', i+1))){
				if(isEmpty(mailArr[nlapiGetLineItemValue('list', 'location', i+1)])){
					selectlocationList.push('「'+nlapiGetLineItemValue('list', 'location', i+1)+'」');
				}
			}else{
				nulllocation=true;
			}
			selectCount++;
			//str+=nlapiGetLineItemValue('list', 'so_id', i+1)+',';
		}
	}
	selectlocationList=unique(selectlocationList);
	if(nulllocation){
		selectlocationList.push('「倉庫なし」');
	}
	var alertTxt='';
	var m01=0;
	for(var s=0;s<selectlocationList.length;s++){
		if(m01!=0){
			alertTxt+='、';
			}
		alertTxt+=selectlocationList[s];
		m01++;
	}
	if (!isEmpty(alertTxt)) {
		alert(alertTxt+'の倉庫配達メールが空です。');
		return false;
	}
	if(selectCount == 0){
		alert('対象を選択してください。')
		return false;
	}
	
	//nlapiSetFieldValue('custpage_param', str);
	return true;
}

/*
 *更新
 */
function refresh(){
	window.ischanged = false;
	location=location;
}


function search(){

	var parameter = setParam();
		
	parameter += '&selectFlg=T';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_wo_shippinglist', 'customdeploy_djkk_sl_wo_shippinglist');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function searchReturn(){
	
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_wo_shippinglist', 'customdeploy_djkk_sl_wo_shippinglist');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function setParam(){

	var parameter = '';
	parameter += '&woNo='+nlapiGetFieldValue('custpage_wo_no');	
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');
	parameter += '&location='+nlapiGetFieldValue('custpage_location');

	
	return parameter;
}


