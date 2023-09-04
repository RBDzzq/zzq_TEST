/**
 * DJ_請求書変更承認一括処理画面
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
 * @param {String}
 *            type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {

	var count = nlapiGetLineItemCount('list')
	var zeroflg = true;
	for(var i = 0 ; i < count ; i++){
		if(nlapiGetLineItemValue('list', 'chk',i+1) == 'T'){
						
			if(isEmpty(nlapiGetLineItemValue('list', 'unit_price',i+1))){
				alert('選択の行の金額を入力してください。');
				return false;
			}
			
			zeroflg = false;
	
		}
	}
	if(zeroflg){
		alert('対象選択してください。')
		return false;
	}
	
	
	
	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
function clientValidateField(type, name, linenum) {

	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
    // CH399 zheng 20230327 start
    if(name == 'custpage_admit'){
        
        var parameter = setParam();
        
        parameter += '&selectFlg=F';

        var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_salesorder_change', 'customdeploy_djkk_sl_salesorder_change');

        https = https + parameter;
        

        // 画面条件変更場合、メッセージ出てこないのため
        window.ischanged = false;

        // 画面をリフレッシュする
        window.location.href = https;
    }
    // CH399 zheng 20230327 end
	if(name == 'custpage_subsidiary'){
	    // CH399 zheng 20230327 start
		var subsidiary = nlapiGetFieldValue('custpage_subsidiary')
		if(isEmpty(subsidiary)){
			//alert("連結を入力してください");
			return;
		}
		// CH399 zheng 20230327 end
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_salesorder_change', 'customdeploy_djkk_sl_salesorder_change');

		https = https + parameter;
		

		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;

		// 画面をリフレッシュする
		window.location.href = https;
	}
	
	//changed by geng add start U076
	if(type=='list'&&name=='chk'){
		var checkBox = nlapiGetCurrentLineItemValue('list', 'chk');
		var itemCount = nlapiGetLineItemCount('list');
		var soId = nlapiGetCurrentLineItemValue('list', 'sales_order_id');
		for(var k=1;k<itemCount+1;k++){
			if(nlapiGetLineItemValue('list', 'sales_order_id', k)==soId){
				if(checkBox == 'T'){
					nlapiSetLineItemValue('list', 'chk', k, 'T');
				}else{
					nlapiSetLineItemValue('list', 'chk', k, 'F');
				}
					
			}
		}
	}
	//changed by geng add end U076
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {

	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type) {


	
	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateInsert(type) {

	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type) {

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

    // CH399 zheng 20230327 start
    var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
    if(isEmpty(subsidiary)){
        alert("連結を入力してください");
        return false;
    }
    // CH399 zheng 20230327 end
    
	var parameter = setParam();
		
	parameter += '&selectFlg=T';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_salesorder_change', 'customdeploy_djkk_sl_salesorder_change');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function searchReturn(){
	
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_salesorder_change', 'customdeploy_djkk_sl_salesorder_change');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function setParam(){
	var subsidiaryValue = nlapiGetFieldValue('custpage_subsidiary');
	var parameter = '';
	parameter += '&soNo='+nlapiGetFieldValue('custpage_salesorder');
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');
	parameter += '&customer='+nlapiGetFieldValue('custpage_customer');
//	var subsidiaryValue = nlapiGetFieldValue('custpage_subsidiary');
	if(subsidiaryValue != SUB_SCETI||subsidiaryValue != SUB_DPKK){
		parameter += '&location='+nlapiGetFieldValues('custpage_location');//add by zhou U017
	}
	parameter += '&deliveryAdd='+nlapiGetFieldValue('custpage_delivery_destination');
	parameter += '&item='+nlapiGetFieldValue('custpage_item');
	parameter += '&salesrep='+nlapiGetFieldValue('custpage_saler');
	parameter += '&hopeDeliveryDate='+nlapiGetFieldValue('custpage_delivery_hopedate');
	parameter += '&hopeDeliveryDateEnd='+nlapiGetFieldValue('custpage_delivery_hopedate_end');//3.25 add zhou todolist U673
	parameter += '&deliveryDate='+nlapiGetFieldValue('custpage_delivery_date');
	parameter += '&deliveryDateEnd='+nlapiGetFieldValue('custpage_delivery_date_end');//3.25 add zhou todolist U673
	parameter += '&loadOutDate='+nlapiGetFieldValue('custpage_load_out_date');//3.25 add zhou todolist U673
	parameter += '&loadOutDateEnd='+nlapiGetFieldValue('custpage_load_out_date_end');//3.25 add zhou todolist U673
	if(subsidiaryValue != SUB_SCETI && subsidiaryValue != SUB_DPKK){
		parameter += '&admit='+nlapiGetFieldValue('custpage_admit');   // add by sys  U374
	}
	return parameter;
}



