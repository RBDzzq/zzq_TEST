/**
 * DJ_出荷情報-出荷情報画面
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/01/18     CPC_宋
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
        var subs = nlapiGetFieldValue('custpage_subsidiary');
        if (!subs) {
            return false;
        }
        var parameter = setParam();

        var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_stock_shipping_info', 'customdeploy_djkk_sl_stock_shipping_info');

        https = https + parameter;
        

        // 画面条件変更場合、メッセージ出てこないのため
        window.ischanged = false;

        // 画面をリフレッシュする
        window.location.href = https;
    }
	// CH792 add by zdj 20230815 start
//	if(name == 'custpage_delidate'){
//		var delidateStart = nlapiGetFieldValue('custpage_delidate_start');
//		var delidate = nlapiGetFieldValue('custpage_delidate');
//		if(!isEmpty(delidateStart) && Date.parse(delidate) < Date.parse(delidateStart)){
//			alert("納品日(終わり)は納品日(始め)より大きくなければなりません。");
//			nlapiSetFieldValue('custpage_delidate', '');
//		}
//	}
//	if(name == 'custpage_delidate_start'){
//		var delidateStart = nlapiGetFieldValue('custpage_delidate_start');
//		var delidate = nlapiGetFieldValue('custpage_delidate');
//		if(!isEmpty(delidate) && Date.parse(delidate) < Date.parse(delidateStart)){
//			alert("納品日(終わり)は納品日(始め)より大きくなければなりません。");
//			nlapiSetFieldValue('custpage_delidate_start', '');
//		}
//	}
//	if(name == 'custpage_senddate'){
//		var senddateStart = nlapiGetFieldValue('custpage_senddate_start');
//		var senddate = nlapiGetFieldValue('custpage_senddate');
//		if(!isEmpty(senddateStart) && Date.parse(senddate) < Date.parse(senddateStart)){
//			alert("送信日(終わり)は送信日(始め)より大きくなければなりません。");
//			nlapiSetFieldValue('custpage_senddate', '');
//		}
//	}
//	if(name == 'custpage_senddate_start'){
//		var senddateStart = nlapiGetFieldValue('custpage_senddate_start');
//		var senddate = nlapiGetFieldValue('custpage_senddate');
//		if(!isEmpty(senddate) && Date.parse(senddate) < Date.parse(senddateStart)){
//			alert("送信日(終わり)は送信日(始め)より大きくなければなりません。");
//			nlapiSetFieldValue('custpage_senddate_start', '');
//		}
//	}
	// CH792 add by zdj 20230815 end
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */


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

function search(){

    var subs = nlapiGetFieldValue('custpage_subsidiary');
    if (!subs) {
        alert('子会社を選択してください。');
        return false;
    }
	var parameter = setParam();
		
	parameter += '&selectFlg=T';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_stock_shipping_info', 'customdeploy_djkk_sl_stock_shipping_info');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function searchReturn(){
	
	
	var parameter = setParam();
	
	parameter += '&selectFlg=F';

	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_stock_shipping_info', 'customdeploy_djkk_sl_stock_shipping_info');

	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function setParam(){
	var parameter = '';
	parameter += '&order='+nlapiGetFieldValue('custpage_order');
	parameter += '&outorder='+nlapiGetFieldValue('custpage_out_order');
	parameter += '&customer='+nlapiGetFieldValue('custpage_customer');
	parameter += '&custpo='+nlapiGetFieldValue('custpage_custpo');
	//parameter += '&orderdate='+nlapiGetFieldValue('custpage_orderdate');
	parameter += '&delidate='+nlapiGetFieldValue('custpage_delidate');
	// CH792 add by zdj 20230815 start
	parameter += '&delidatestart='+nlapiGetFieldValue('custpage_delidate_start');
	parameter += '&senddatestart='+nlapiGetFieldValue('custpage_senddate_start');
	// CH792 add by zdj 20230815 end
	parameter += '&senddate='+nlapiGetFieldValue('custpage_senddate');
	//parameter += '&creatdate='+nlapiGetFieldValue('custpage_createrdate');
	parameter += '&deliverydestination='+nlapiGetFieldValue('custpage_delivery_destination');
	parameter += '&location='+nlapiGetFieldValue('custpage_head_location');
	parameter += '&stock='+nlapiGetFieldValue('custpage_head_stock');
	parameter += '&batch='+nlapiGetFieldValue('custpage_head_batch');
	parameter += '&subs='+nlapiGetFieldValue('custpage_subsidiary');
	return parameter;
}



