/**
 * DJ_製品グループ
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/12/21     CPC_苑
 *
 */

/**
 * 画面の初期化
 */
function clientPageInit(type) {
	if(type=='create'||type=='copy'){
		nlapiSetFieldValue('name', '自動採番');
	}	 	 
     nlapiDisableField('name', true);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	    var id = nlapiGetFieldValue('custrecord_djkk_pg_id');
	if (!isEmpty(id)) {
		var idLength = id.length;
		if (idLength == 1) {
			nlapiSetFieldValue('custrecord_djkk_pg_first_digit', id);
			nlapiSetFieldValue('custrecord_djkk_pg_two_digits', '');
			nlapiSetFieldValue('custrecord_djkk_pg_all_digits', '');
		} else if (idLength == 2) {
			nlapiSetFieldValue('custrecord_djkk_pg_two_digits', id);
			nlapiSetFieldValue('custrecord_djkk_pg_first_digit', '');
			nlapiSetFieldValue('custrecord_djkk_pg_all_digits', '');
		} else if (idLength > 2) {
			nlapiSetFieldValue('custrecord_djkk_pg_all_digits', id);
			nlapiSetFieldValue('custrecord_djkk_pg_two_digits', '');
			nlapiSetFieldValue('custrecord_djkk_pg_first_digit', '');
		}
	}
    if(nlapiGetFieldValue('name')!=nlapiGetFieldValue('custrecord_djkk_pg_id')+' '+nlapiGetFieldValue('custrecord_djkk_pg_name')){
    	nlapiSetFieldValue('name', nlapiGetFieldValue('custrecord_djkk_pg_id')+' '+nlapiGetFieldValue('custrecord_djkk_pg_name'));
    } 
    return true;
}
