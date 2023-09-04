/**
 * DJ_棚卸指示
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/23     CPC_苑
 *
 */

function clientSaveRecord(){
//	var detailscount = nlapiGetLineItemCount('location_details');
//	var changeArray=new Array();
//	for(var i=1;i<detailscount+1;i++){
//		var stopload=nlapiGetLineItemValue('location_details', 'stopload', i);
//		var stoploadold=nlapiGetLineItemValue('location_details', 'stoploadold', i);
//		if(stopload!=stoploadold){
//			var locationId=nlapiGetLineItemValue('location_details', 'loactionid', i);			
//			changeArray.push([locationId,stopload]);
//		}		
//	}
//    for(var j=0;j<changeArray.length;j++){
//    	try{
//    	nlapiSubmitField('location', changeArray[j][0],'custrecord_djkk_stop_load', changeArray[j][1]);
//    	}catch(e){
//    		nlapiLogExecution('DEBUG', '場所ID:'+changeArray[j][0]+' '+e);
//    	}
//    }
//    alert('棚卸指示より指定倉庫をロックし、入出庫を停止する。');
    return true;
}
function clientFieldChanged(type, name, linenum) {

	
	if(name =='custpage_sub'){
		var div = nlapiGetFieldValue('custpage_div')
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';
		var https ='';
		if(nlapiGetFieldValue('custpage_div') == 1){
			 https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_instructi', 'customdeploy_djkk_sl_inventory_instructi');
		}else{
			 https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_instructi', 'customdeploy_djkk_sl_inv_ins_2');
		}

		https = https + parameter;

		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;

		// 画面をリフレッシュする
		window.location.href = https;
	}
	
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
	var https='';
	if(nlapiGetFieldValue('custpage_div') == 1){
		 https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_instructi', 'customdeploy_djkk_sl_inventory_instructi');
	}else{
		 https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_instructi', 'customdeploy_djkk_sl_inv_ins_2');
	}
	

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function searchReturn(){
	
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';
	var https =';'
	if(nlapiGetFieldValue('custpage_div') == 1){
		 https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_instructi', 'customdeploy_djkk_sl_inventory_instructi');
	}else{
		 https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_instructi', 'customdeploy_djkk_sl_inv_ins_2');
	}

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function setParam(){

	var parameter = '';
	parameter += '&subId='+nlapiGetFieldValue('custpage_sub');
	parameter += '&location='+nlapiGetFieldValue('custpage_location');
	
	return parameter;
}