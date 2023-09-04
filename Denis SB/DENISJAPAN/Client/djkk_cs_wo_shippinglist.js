/**
 * DJ_WOshippinglist���s
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
					selectlocationList.push('�u'+nlapiGetLineItemValue('list', 'location', i+1)+'�v');
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
		selectlocationList.push('�u�q�ɂȂ��v');
	}
	var alertTxt='';
	var m01=0;
	for(var s=0;s<selectlocationList.length;s++){
		if(m01!=0){
			alertTxt+='�A';
			}
		alertTxt+=selectlocationList[s];
		m01++;
	}
	if (!isEmpty(alertTxt)) {
		alert(alertTxt+'�̑q�ɔz�B���[������ł��B');
		return false;
	}
	if(selectCount == 0){
		alert('�Ώۂ�I�����Ă��������B')
		return false;
	}
	
	//nlapiSetFieldValue('custpage_param', str);
	return true;
}

/*
 *�X�V
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
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function searchReturn(){
	
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_wo_shippinglist', 'customdeploy_djkk_sl_wo_shippinglist');

	https = https + parameter;
	

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	window.location.href = https;
}

function setParam(){

	var parameter = '';
	parameter += '&woNo='+nlapiGetFieldValue('custpage_wo_no');	
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');
	parameter += '&location='+nlapiGetFieldValue('custpage_location');

	
	return parameter;
}


