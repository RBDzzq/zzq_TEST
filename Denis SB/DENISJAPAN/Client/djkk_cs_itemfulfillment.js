/**
 * 配送のClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/07/15     CPC_苑
 *
 */
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
//	if(nlapiGetFieldValue('customform')!='108'){
//		// カスタムフォーム
//		nlapiSetFieldValue('customform', '108');	
//	}
	
//20220705 changed by zhou start
//U704
    var customType = nlapiGetFieldValue('customform');
    if(!isEmpty(customType)){
    	   // 食品&LS
    	if(customType == '119'||customType == '115'){
    		nlapiSetFieldValue('shipstatus', 'C');// ステータス  setting
    	}
    }
//20220705 changed by zhou end	
	
	// by LIU 2022/01/12
	var itemCount = nlapiGetLineItemCount('item');
	for(var i = 1 ; i < itemCount + 1 ; i ++){
		
		//　ゲット値
		// アイテムID
		var itemId = nlapiGetLineItemValue('item', 'item', i);
		// DJ_入り数(入り目)
		var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity')
		// DJ_入数
		var perunitQuantity = nlapiGetLineItemValue('item', 'custcol_djkk_perunitquantity', i);
		
		// 数量
		var quantity = nlapiGetLineItemValue('item', 'quantity', i);
		
		if(!isEmpty(itemId) && !isEmpty(itemPerunitQuantity) && !isEmpty(perunitQuantity)){
			
			//　計算
			// DJ_基本数量
			var conversionRate = (quantity * perunitQuantity).toFixed(2);
			// DJ_ケース数
			var floor = Math.floor(conversionRate / itemPerunitQuantity);
			var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
			// DJ_バラ数
			var djQuantity = (conversionRate - caseQuantity * itemPerunitQuantity).toFixed(2);
			
			// セット値
			// DJ_基本数量
			nlapiSetLineItemValue('item', 'custcol_djkk_conversionrate', i,
					conversionRate);
			// DJ_ケース数
			nlapiSetLineItemValue('item', 'custcol_djkk_casequantity', i,
					caseQuantity);
			// DJ_バラ数
			nlapiSetLineItemValue('item', 'custcol_djkk_quantity', i,
					djQuantity);
			// DJ_入数
			nlapiSetLineItemValue('item', 'custcol_djkk_perunitquantity', i,
					itemPerunitQuantity);
		}
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	
    
	var createdfrom = nlapiGetFieldValue('createdfrom');
	var ordertype = nlapiGetFieldValue('ordertype');
	
	if(!isEmpty(createdfrom) && ordertype == 'SalesOrd'){  
	 //入出庫処理
	var itemCount = nlapiGetLineItemCount('item');
	for(var i = 1 ; i < itemCount+1 ; i ++){
		var custody_item = nlapiGetLineItemValue('item', 'custcol_djkk_custody_item', i);
		if(custody_item=='T'){
			var cuslocation=nlapiGetLineItemValue('item', 'custcol_djkk_icl_cuslocation', i);
			if(isEmpty(cuslocation)){
				alert('預かり在庫の場合、アイテムの「DJ_預かり在庫場所」フィールドを入力する必要があります');
		    	return false;
			}else{
				var flgi = nlapiLookupField('location', cuslocation, 'custrecord_djkk_stop_load')
				if(flgi == 'T'){
					alert(nlapiGetLineItemText('item', 'custcol_djkk_icl_cuslocation', i)+' 入出庫を停止しています。');
					return false;
				}
			}
			// add U722 by sys start
			var locationId = nlapiGetLineItemValue('item', 'location', i);
			var cuslocation=nlapiGetLineItemValue('item', 'custcol_djkk_icl_cuslocation', i);
			var locationRec = nlapiLoadRecord('location', locationId);
			var cuslocationRec = nlapiLoadRecord('location', cuslocation);
			if(locationRec.getFieldValue('usebins') == 'T' && cuslocationRec.getFieldValue('usebins') == 'T'){
				var inventory_inshelf = nlapiGetLineItemValue('item', 'custcol_djkk_inventory_inshelf', i);
				if(isEmpty(inventory_inshelf)){
					alert('アイテムの「DJ_預かり保管棚」フィールドを入力する必要があります');
					return false;
				}
			}
			// add U722 by sys end
		}	
		
		
	}
		 var entity=nlapiGetFieldValue('entity');
		    if(!isEmpty(entity)){
		    	try{
		    var shipmentstop=nlapiLookupField('customer', entity, 'custentity_djkk_shipping_suspend_flag');
		    	}catch(e){
		    	}
		    if(shipmentstop=='T'){
		    	alert('当顧客が出荷停止の状態のため、出荷することはできません。');
		    	return false;
		      }
		    }
		    
		var rec = nlapiLoadRecord('salesorder', createdfrom);
		
		if(rec.getFieldValue('custbody_djkk_payment_conditions') == '2'){
			
			// 注文書合計金額取得
			var soTotal = rec.getFieldValue('total');
			// 前払い金合計金額取得
			var customerdepositTotal = 0;
			var count = rec.getLineItemCount('links')
			for (var i = 0; i < count; i++) {
				rec.selectLineItem('links',  i + 1);

				if (rec.getCurrentLineItemValue('links', 'type') == '前受金'){
					customerdepositTotal += Number(rec.getCurrentLineItemValue('links', 'total'));
				}	
			}
			if (Number(soTotal) > Number(customerdepositTotal)){
				alert('配送金額は前受金より多いです。');
			}
		}
		

		//与信限度額判断
		
		//NBの与信チェックを外すwang 0208　CH126
		var subsidiary = getRoleSubsidiary();
		var customform = nlapiGetFieldValue('customform');
		if(customform != '119'){
		var total = rec.getFieldValue('total');
		var exchangerate = rec.getFieldValue('exchangerate')
		total = Number(total) * Number(exchangerate);
		var custId = rec.getFieldValue('entity');
		
		var custRec = nlapiLoadRecord('customer', custId);
		var custName = custRec.getFieldValue('entityid');
		var custCreateLimit = custRec.getFieldValue('custentity_djkk_credit_limit');
		var custBalance = custRec.getFieldValue('balance');
		var unbilledorders = custRec.getFieldValue('unbilledorders');
		
		
		var msg = custName+'\r'+'与信限度額:'+thousandsWithComa(Number(custCreateLimit)) +'\r'+'売掛金残高:'+thousandsWithComa(Number(custBalance))+'\r'+'未請求金額:'+thousandsWithComa(Number(unbilledorders))+'\r'+'注文書金額:'+thousandsWithComa(Number(total));
		if(custCreateLimit != 0 && !isEmpty(custCreateLimit)){
			if(Number(custCreateLimit) - Number(custBalance) -Number(total) -Number(unbilledorders)  < 0){
				msg+='\r与信限度額が超えています。'
				alert(msg);
				return false;
			}
		}
	}
	//20220831 add by zhou U064
//	var subsidiary = getRoleSubsidiary();
//	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK){
		var linenumStr = '再度注意：';
		var linenum = [];
		var neqFlag = false;
		var count = nlapiGetLineItemCount('item');
		for(var n = 1 ; n < count+1 ; n++){
			// 数量
			var quantity =  Number(nlapiGetLineItemValue('item', 'quantity', n));
			// 確保済み
			var quantityremaining = Number(nlapiGetLineItemValue('item', 'quantityremaining', n));
			if(!isEmpty(quantity)&&!isEmpty(quantityremaining)&&(quantity != quantityremaining)){
//				linenumStr += ''+n+'';
//				if(n < count){
//					linenumStr += '、';
//				}
				linenum.push(n);
				neqFlag = true ;
			}
		}
		if(!isEmpty(linenum)){
			for(var n = 0 ; n < linenum.length ; n++){
				linenumStr += ''+linenum[n]+'';
				if(n+1 < linenum.length){
					linenumStr += '、';
				}
			}
		}
		linenumStr += '行目のアイテムの配送数は注文書で承認された数と一致しません！';
		if(neqFlag == true){
			alert(linenumStr);
		}
	}
	//end
    return true;

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function clientValidateField(type, name, linenum){
   
    return true;
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
	
	// by LIU 2022/01/12
	if (type == 'item' && name == 'quantity') {

		// 数量
		var quantity = nlapiGetLineItemValue('item', 'quantity', linenum);

		
		// アイテム内部ID
		var itemId = nlapiGetLineItemValue('item', 'item', linenum);
		
		// DJ_入数
		//20230704 changed by zhou start CH677
//		var unitname = nlapiGetLineItemValue('item', 'unitsdisplay', linenum);
//		var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
        var unitId = nlapiGetLineItemValue('item', 'units' ,linenum);
        var crVal = '';
        if (!isEmpty(unitId)) {
            var itemUnitsTypeId = nlapiLookupField('item',itemId,'unitstype');
            if (itemUnitsTypeId) {
                crVal = getConversionrateAbbreviationNew(itemUnitsTypeId, unitId);
            }
        }
        var perunitQuantity = !isEmpty(crVal) ? crVal : '';
      //20230704 changed by zhou end
  
		
		if(!isEmpty(quantity) && !isEmpty(perunitQuantity) && !isEmpty(itemId)){

			// DJ_入り数(入り目)
			var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity')
          
			if(!isEmpty(itemPerunitQuantity)){
				// DJ_基本数量
				var conversionRate = (quantity * perunitQuantity).toFixed(2);
				
				// DJ_ケース数
				var floor = Math.floor(conversionRate / itemPerunitQuantity);
				var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
				
				// DJ_バラ数
				var djQuantity = (conversionRate - caseQuantity * itemPerunitQuantity).toFixed(2);
				
				// DJ_基本数量
				nlapiSetLineItemValue('item', 'custcol_djkk_conversionrate', linenum,
						conversionRate);
				// DJ_ケース数
				nlapiSetLineItemValue('item', 'custcol_djkk_casequantity', linenum,
						caseQuantity);
				// DJ_バラ数
				nlapiSetLineItemValue('item', 'custcol_djkk_quantity', linenum,
						djQuantity);
				// DJ_入数
				nlapiSetLineItemValue('item', 'custcol_djkk_perunitquantity', linenum,
						itemPerunitQuantity);
			}
		}
	}
	//20220831 add by zhou U064
	var subsidiary = getRoleSubsidiary();
	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK){
		if (type == 'item' && name == 'quantity') {
			// 数量
			var quantity =  Number(nlapiGetLineItemValue('item', 'quantity', linenum));
			// 確保済み
			var quantityremaining = Number(nlapiGetLineItemValue('item', 'quantityremaining', linenum));
			if(!isEmpty(quantity)&&!isEmpty(quantityremaining)&&(quantity != quantityremaining)){
				alert(''+linenum+'行目のアイテムの配送数は注文書で承認された数と一致しません！');
			}
		}
	}
	//end
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {
     
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
 
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateInsert(type){
  
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type){
   
    return true;
}



