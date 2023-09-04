/**
 * 仕入先返品UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/24     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
	form.setScript('customscript_djkk_cs_vendorreturn');
	
	if (type == 'view') {
	    var apprDealFlg = nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg');
	    if (apprDealFlg == 'T') {
	        var status = nlapiGetFieldValue('custbody_djkk_trans_appr_status');
	        if(status == '2'){
	            //CH762 20230817 add by zdj start
//	            form.addButton('custpage_popuplmi', '仕入先返品(輸入)PDF印刷', 'popuppdf();');
	            form.addButton('custpage_popuplmi', '仕入先返品(輸出)PDF印刷', 'popuppdf();');
	            //CH762 20230817 add by zdj start
	        }   
	    } else {
	        var orderStatus = nlapiGetFieldValue('orderstatus');
	        if(orderStatus == 'B'){
	            //CH762 20230817 add by zdj start
//	            form.addButton('custpage_popuplmi', '仕入先返品(輸入)PDF印刷', 'popuppdf();');
	            form.addButton('custpage_popuplmi', '仕入先返品(輸出)PDF印刷', 'popuppdf();');
	            //CH762 20230817 add by zdj start
	        }
	    }	
	}
	// add by song  start CH229
	var customform = nlapiGetFieldValue('customform');
	if(customform = '109'){
		setFieldDisableType('exchangerate', 'normal');
	}
	//add by song  end CH229
}
