/**
 * Module Description
 * 自動引当機能
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
	
	var listCount = nlapiGetLineItemCount('list');
	var itemArr = new Array();
	var recId = nlapiGetFieldValue('custpage_record_id')
	var str = '';
	
	if(listCount == 0){
		alert("明細がないため実行できません")
		return;
	}
	//情報取得
	for(var i = 0 ; i < listCount ; i++){
		var itemId = nlapiGetLineItemValue('list', 'item_id', i+1);
		var itemName = nlapiGetLineItemValue('list', 'item', i+1);
		var count = nlapiGetLineItemValue('list', 'count', i+1);
		var adjust_count = nlapiGetLineItemValue('list', 'adjust_count', i+1);
		var arr_count = nlapiGetLineItemValue('list', 'arr_count', i+1);
		var inv_no = nlapiGetLineItemValue('list', 'inv_no', i+1);
		var one_inv_no = nlapiGetLineItemValue('list', 'one_inv_no', i+1);
		
		var able_date =nlapiGetLineItemValue('list', 'able_date', i+1);
		var ship_date = nlapiGetLineItemValue('list', 'ship_date', i+1);
		

		
		if(Number(arr_count)<Number(adjust_count)){
			alert('調整数量は移動可能数量より大きい。')
			return false;
		}
		
		
		var addFlg = true;
		for(var j = 0 ; j < itemArr.length;j++){
			if(itemArr[j].itemId == itemId){	
				itemArr[j].adjust_count += Number(adjust_count);
				addFlg = false;
				break;
			}
		}
		if(addFlg){
			var detial = {};
			detial.itemId = itemId;
			detial.count = count;
			detial.adjust_count = Number(adjust_count);
			detial.inv_no = inv_no;
			detial.itemName = itemName;
			detial.one_inv_no = one_inv_no;
			itemArr.push(detial);
		}

		if(Number(adjust_count)>0){
			
			if(!isEmpty(able_date)){
				if(compareStrDate(able_date, nlapiDateToString(new Date()))){
					alert(inv_no+'使用期限切れ在庫は引当対象外とする。')
					//return false;
				}
			}
			
			if(!isEmpty(ship_date)){
				if(compareStrDate(ship_date, nlapiDateToString(new Date()))){
					alert(inv_no+'出荷可能期限切れ在庫は引当対象外とする。')
					//return false;
				}
			}
			
			
			//単一ロット判断
			if(one_inv_no == 'T'){
				
				if(str.indexOf(itemId) > -1){
					alert(itemName+'は単一ロットです。');
					//return false;
				}
				
			}
			
			str+=itemId+'_'+inv_no+'_'+adjust_count+',';
		}
		
		
	}

	//数量チェック	
	for(var i = 0 ; i < itemArr.length ; i++){
		if(Number(itemArr[i].count) != Number(itemArr[i].adjust_count)){
			alert(itemArr[i].itemName+'アイテム調整数量確認してください。')
			return false;
		}
		
	}
	
	nlapiSetFieldValue('custpage_param', str)
	
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


