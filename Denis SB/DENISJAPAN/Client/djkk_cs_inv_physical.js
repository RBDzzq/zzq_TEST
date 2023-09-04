/**
 * Module Description
 * 実地棚卸
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

    // CH244 zheng 20230216 start
    var inv0Check = nlapiGetFieldValue('custpage_inv_zero');
	var lineCnt = nlapiGetLineItemCount('details');
	var selectSub = nlapiGetFieldValue('custpage_sub');
	var zeroflg = true;
	for(var i = 1 ; i <= lineCnt ; i++){
		
	    var count = nlapiGetLineItemValue('details', 'count',i);
		var count_real = nlapiGetLineItemValue('details', 'count_real',i);
		//var item_name = nlapiGetLineItemValue('details', 'item_name',i);
		//var inv_no = nlapiGetLineItemValue('details', 'inv_no',i);
		if(selectSub !=SUB_SCETI && selectSub !=SUB_DPKK){
	        if (inv0Check == 'F'){
	            if(count == 0 || count == 0.0){
	                var tmpRealCnt = count_real;
	                if (tmpRealCnt == null || tmpRealCnt == '') {
	                    tmpRealCnt = 0;
	                }
	                if(!Number(tmpRealCnt)){
	                    alert("在庫数は0である場合、実地数量を入力してください。");
	                    return false;
	                }
	            }   
	        }   
		}
		if (count_real == null || count_real == '') {
		    continue;
		}
		if(count_real >= 0){
			zeroflg = false;
		}
		if(count_real <0){
			alert("実地調整数量はマイナスが設定できません。");
			return false;
		}
	}
	if(zeroflg){
		alert('調整対象がありません。');
		return false;
	}
	// CH244 zheng 20230216 start

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

	
	if(name =='custpage_sub'){
		var div = nlapiGetFieldValue('custpage_div')
		
		var parameter = setParam();
		
		parameter += '&selectFlg=F';

		var deploy = "";
		if(div == '1'){
			deploy = "customdeploy_djkk_sl_physical_inventory";
		}else{
			deploy = "customdeploy_djkk_sl_physical_inventory2";
		}
		
		var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_physical_inventory', deploy);

		https = https + parameter;

		// 画面条件変更場合、メッセージ出てこないのため
		window.ischanged = false;

		// 画面をリフレッシュする
		window.location.href = https;
	}
	
	// CH425　zheng 20230619 start
    if(name =='custpage_inv_count_you'){
        var div = nlapiGetFieldValue('custpage_div')
        var parameter = setParam();
        parameter += '&selectFlg=F';
        if(div == '1'){
            var inv0Check = nlapiGetFieldValue('custpage_inv_zero');
            parameter += '&invoFlg=' + inv0Check;
            var invCountYou = nlapiGetFieldValue('custpage_inv_count_you');
            parameter += '&invcntFlg=' + invCountYou;
            var itemFieldValue = nlapiGetFieldValue('custpage_tanaorosi_item');
            var tanaFieldValue = nlapiGetFieldValue('custpage_tanaorosi_tana');
            var manageNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_manage_num');
            var locaNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_local_num');
            var mekaNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_maka_num');
            var venderItemFieldValue = nlapiGetFieldValue('custpage_tanaorosi_vender_item');
            parameter += '&iv=' + itemFieldValue;
            parameter += '&tana=' + tanaFieldValue;
            parameter += '&mnv=' + manageNumFieldValue;
            parameter += '&lnv=' + locaNumFieldValue;
            parameter += '&menv=' + mekaNumFieldValue;
            parameter += '&viv=' + venderItemFieldValue;
        }
        var deploy = "";
        if(div == '1'){
            deploy = "customdeploy_djkk_sl_physical_inventory";
        }else{
            deploy = "customdeploy_djkk_sl_physical_inventory2";
        }
        
        var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_physical_inventory', deploy);

        https = https + parameter;

        // 画面条件変更場合、メッセージ出てこないのため
        window.ischanged = false;

        // 画面をリフレッシュする
        window.location.href = https;
    }
    if(name =='custpage_location'){
       var locationVal = nlapiGetFieldValue('custpage_location')
       if (locationVal) {
           var div = nlapiGetFieldValue('custpage_div')
           var parameter = setParam();
           parameter += '&selectFlg=F';
           if(div == '1'){
               var inv0Check = nlapiGetFieldValue('custpage_inv_zero');
               parameter += '&invoFlg=' + inv0Check;
               var invCountYou = nlapiGetFieldValue('custpage_inv_count_you');
               parameter += '&invcntFlg=' + invCountYou;
               nlapiSetFieldValue('custpage_tanaorosi_tana', '', false, true);
               var itemFieldValue = nlapiGetFieldValue('custpage_tanaorosi_item');
               var tanaFieldValue = nlapiGetFieldValue('custpage_tanaorosi_tana');
               var manageNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_manage_num');
               var locaNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_local_num');
               var mekaNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_maka_num');
               var venderItemFieldValue = nlapiGetFieldValue('custpage_tanaorosi_vender_item');
               parameter += '&iv=' + itemFieldValue;
               parameter += '&tana=' + tanaFieldValue;
               parameter += '&mnv=' + manageNumFieldValue;
               parameter += '&lnv=' + locaNumFieldValue;
               parameter += '&menv=' + mekaNumFieldValue;
               parameter += '&viv=' + venderItemFieldValue;
           }
           var deploy = "";
           if(div == '1'){
               deploy = "customdeploy_djkk_sl_physical_inventory";
           }else{
               deploy = "customdeploy_djkk_sl_physical_inventory2";
           }
           
           var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_physical_inventory', deploy);

           https = https + parameter;

           // 画面条件変更場合、メッセージ出てこないのため
           window.ischanged = false;

           // 画面をリフレッシュする
           window.location.href = https;
       } else {
           nlapiSetFieldValue('custpage_tanaorosi_tana', '', false, true);
       }
    }
	// CH425　zheng 20230619 end
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

//更新
function refresh(){
	window.ischanged = false;
	location=location;
}



function csvUpload(){

    var custpage_locationvalue = nlapiGetFieldValue('custpage_location');
    var sub = nlapiGetFieldValue('custpage_sub');
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_uploadfile', 'customdeploy_djkk_sl_uploadfile');
	https = https + '&custpage_locationvalue=' + custpage_locationvalue;
	https = https + '&sub=' + sub;
	nlExtOpenWindow(https, 'newwindow', 500, 300, this, false, 'ファイルアップロード');
	
	
	
//	var file = nlapiGetFieldValue('custpage_file')
//	if(isEmpty(file)){
//		alert('アップロードファイルを選択してください。');
//		return false;
//	}
//	
//    var file1Type = checkCsvFile(file);
//    if (!file1Type) {
//        alert('ファイル選択1はCSVファイルを選択してください。');
//        return false;
//    }
//	
//	
//	var div = nlapiGetFieldValue('custpage_div')
//	var deploy = 'customdeploy_djkk_sl_physical_inventory';
//	if(div == '1'){
//		deploy = 'customdeploy_djkk_sl_physical_inventory';
//	}else if(div == '2'){
//		deploy = 'customdeploy_djkk_sl_physical_inventory2';
//	}
//	
//	
//	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_physical_inventory', deploy);
//
//	//https = https + '&runFlg=1';
//	
//
//	// 画面条件変更場合、メッセージ出てこないのため
//	window.ischanged = false;
//
//	// 画面をリフレッシュする
//	window.location.href = https;
}





/**
 * CSVファイルチェック
 * 
 * @param type
 * @param contents
 * @returns {Boolean}
 */
function checkCsvFile(contents) {

    var result = false;

    var tmpContents = contents;
    tmpContents = tmpContents.toLowerCase();

    if (tmpContents.match(/\.csv/)) {
        var tmpSplits = tmpContents.split('.');
        var tmpValue = tmpSplits[tmpSplits.length - 1];
        if (tmpValue == 'csv') {
            result = true;
        }
    }

    return result;
}



function setParam(){
	var parameter = '';
	parameter += '&sub='+nlapiGetFieldValue('custpage_sub');
	parameter += '&location='+nlapiGetFieldValue('custpage_location');

	return parameter;
}

function search(){
	
	var sub = nlapiGetFieldValue('custpage_sub')
	var location = nlapiGetFieldValue('custpage_location')
	var div = nlapiGetFieldValue('custpage_div')

	if(isEmpty(sub)){
		alert("連結を入力してください。")
		return;
	}
	
	
	var parameter = setParam();
		
	parameter += '&selectFlg=T';
	// CH425　zheng 20230619 start
	if(div == '1'){
	    var inv0Check = nlapiGetFieldValue('custpage_inv_zero');
	    parameter += '&invoFlg=' + inv0Check;
        var invCountYou = nlapiGetFieldValue('custpage_inv_count_you');
        parameter += '&invcntFlg=' + invCountYou;
        var itemFieldValue = nlapiGetFieldValue('custpage_tanaorosi_item');
        var tanaFieldValue = nlapiGetFieldValue('custpage_tanaorosi_tana');
        var manageNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_manage_num');
        var locaNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_local_num');
        var mekaNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_maka_num');
        var venderItemFieldValue = nlapiGetFieldValue('custpage_tanaorosi_vender_item');
        parameter += '&iv=' + itemFieldValue;
        parameter += '&tana=' + tanaFieldValue;
        parameter += '&mnv=' + manageNumFieldValue;
        parameter += '&lnv=' + locaNumFieldValue;
        parameter += '&menv=' + mekaNumFieldValue;
        parameter += '&viv=' + venderItemFieldValue;
	}
	// CH425　zheng 20230619 end
	var deploy = "";
	if(div == '1'){
		deploy = "customdeploy_djkk_sl_physical_inventory";
	}else{
		deploy = "customdeploy_djkk_sl_physical_inventory2";
	}
	
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_physical_inventory', deploy);
	https = https + parameter;
	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

function searchreturn(){

	var div = nlapiGetFieldValue('custpage_div')
	var parameter = setParam();
	
	parameter += '&selectFlg=F';
    // CH425　zheng 20230619 start
    if(div == '1'){
        var inv0Check = nlapiGetFieldValue('custpage_inv_zero');
        parameter += '&invoFlg=' + inv0Check;
        var invCountYou = nlapiGetFieldValue('custpage_inv_count_you');
        parameter += '&invcntFlg=' + invCountYou;
        var itemFieldValue = nlapiGetFieldValue('custpage_tanaorosi_item');
        var tanaFieldValue = nlapiGetFieldValue('custpage_tanaorosi_tana');
        var manageNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_manage_num');
        var locaNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_local_num');
        var mekaNumFieldValue = nlapiGetFieldValue('custpage_tanaorosi_maka_num');
        var venderItemFieldValue = nlapiGetFieldValue('custpage_tanaorosi_vender_item');
        parameter += '&iv=' + itemFieldValue;
        parameter += '&tana=' + tanaFieldValue;
        parameter += '&mnv=' + manageNumFieldValue;
        parameter += '&lnv=' + locaNumFieldValue;
        parameter += '&menv=' + mekaNumFieldValue;
        parameter += '&viv=' + venderItemFieldValue;
    }
    // CH425　zheng 20230619 end
	var deploy = "";
	if(div == '1'){
		deploy = "customdeploy_djkk_sl_physical_inventory";
	}else{
		deploy = "customdeploy_djkk_sl_physical_inventory2";
	}
	
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_physical_inventory', deploy);

	https = https + parameter;

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	// 画面をリフレッシュする
	window.location.href = https;
}

