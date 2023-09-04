/**
 * 顧客商品毎設定のClient
 * 
 * Version     日付            担当者       
 * 1.00        2023/02/32      CPC_宋      
 *
 */


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function csclientSaveRecord(){
	
//changed by song add DENISJAPAN-486 start
	var locationMemo = nlapiGetFieldValue('custrecord_djkk_cic_po_memo_for_location'); //DJ_注文時倉庫向け備考
	if(!isEmpty(locationMemo)){
		var locationMemoString = locationMemo.toString();
		var locationMemoBytes = getBytes(locationMemoString);
        if(locationMemoBytes > 100){
		    alert("DJ_注文時倉庫向け備考のバイト数が100より大きいので、再入力してください");
		    return false;
		}
	}	
	return true;	
}

var getBytes = function (string) {
	var utf8 = unescape(encodeURIComponent(string));
	var arr = [];

	for (var i = 0; i < utf8.length; i++) {
	    arr.push(utf8.charCodeAt(i));
	}
	return arr.length;
}
//changed by song add DENISJAPAN-486 end