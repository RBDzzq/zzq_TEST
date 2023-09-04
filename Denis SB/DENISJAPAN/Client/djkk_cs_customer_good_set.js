/**
 * �ڋq���i���ݒ��Client
 * 
 * Version     ���t            �S����       
 * 1.00        2023/02/32      CPC_�v      
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
	var locationMemo = nlapiGetFieldValue('custrecord_djkk_cic_po_memo_for_location'); //DJ_�������q�Ɍ������l
	if(!isEmpty(locationMemo)){
		var locationMemoString = locationMemo.toString();
		var locationMemoBytes = getBytes(locationMemoString);
        if(locationMemoBytes > 100){
		    alert("DJ_�������q�Ɍ������l�̃o�C�g����100���傫���̂ŁA�ē��͂��Ă�������");
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