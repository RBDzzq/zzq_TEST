/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Oct 2022     rextec
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
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){

		var listType = 'recmachcustrecord_djkk_buy_price'
			
		var startDate = nlapiGetFieldValue('custrecord_djkk_buy_start_date');
		var endDate = nlapiGetFieldValue('custrecord_djkk_buy_end_date');
	
		var itemCd = nlapiGetFieldValue('custrecord_djkk_buy_price_detail_shop');
		var saleprice = nlapiGetFieldValue('custrecord_djkk_buy_detailed_price');
		var itemCount = nlapiGetFieldValue('custrecord_djkk_buy_detailed_quantity');
//		
		var lineNum = nlapiGetCurrentLineItemIndex(listType);
		nlapiLogExecution('debug','lineNum', lineNum);
		var subid = nlapiGetFieldValue('custrecord_djkk_buy_sub');
		var buyid = nlapiGetFieldValue('custrecord_djkk_buy_price');
		var buyObj = nlapiLoadRecord('customrecord_djkk_buy_price_list', buyid);
		var listCount = buyObj.getLineItemCount('recmachcustrecord_djkk_buy_price')
		for(var i = 1 ; i  < listCount+1 ; i++){
			
			//本行除く
			if(i == lineNum){
				nlapiLogExecution('debug', 'accessLineNum', lineNum);
				continue;
			}
				
				//商品コード
				if(buyObj.getLineItemValue(listType, 'custrecord_djkk_buy_price_detail_shop', i) == itemCd){
					
						
						//開始日と終了日判断
						if(dateComper(buyObj.getLineItemValue(listType, 'custrecord_djkk_buy_start_date', i),buyObj.getLineItemValue(listType, 'custrecord_djkk_buy_end_date', i),startDate, endDate)){
							
							
							//基本販売価格判断
							if(Number(buyObj.getLineItemValue(listType, 'custrecord_djkk_buy_detailed_price', i)) != Number(saleprice)){
								
								
								throw nlapiCreateError('システムエラー', '基本販売価は異なっています。');
								return false;
							}
							
							//期間重複場合　数量違いたら　OKです
							if(Number(buyObj.getLineItemValue(listType, 'custrecord_djkk_buy_detailed_quantity', i)) == Number(itemCount)){
								
								
								throw nlapiCreateError('システムエラー', '入力のデータが重複しています。');
								return false;
							}
							
						}
					}
		
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
  try{
	  var endDate = nlapiGetFieldValue('custrecord_djkk_buy_end_date');
		if(!isEmpty(endDate)){
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_end_date_price_detailed', endDate);
		}else{
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_end_date_price_detailed', getMaxDate());
		}
		
		var priceCode = nlapiGetFieldValue('custrecord_djkk_buy_price');
		if(!isEmpty(priceCode)){
			var sub = nlapiLookupField('customrecord_djkk_buy_price_list', priceCode, 'custrecord_djkk_buy_subsidiary');
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_buy_sub', sub);
		}else{
			nlapiLogExecution('ERROR', 'ヘッダ設定されていない', '連結設定されていない');
		}
	  
	  
	  
	  
	  var itemId = nlapiGetFieldValue('custrecord_djkk_buy_price_detail_shop');
	
		if(!isEmpty(itemId)){
			var itemSearch = nlapiSearchRecord("item",null,
					[
					   ["name","is",itemId]
					], 
					[
			           new nlobjSearchColumn("internalid"),
			           
					]
					);
			var itemIntid = itemSearch[0].getValue("internalid");
			
			if(!isEmpty(itemIntid)){
				nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_buy_detailed_itemcode', itemIntid);
			}
		}
  }catch(e){
	  nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_buy_detailed_itemcode', "");
		nlapiLogExecution('ERROR', 'エラー', e.message);
  }
}
function getMaxDate(){
	var date = new Date();
	date.setFullYear(9999, 11, 31)
	return nlapiDateToString(date)
}
function dateComper(start1 ,end1,start2,end2){
	
	start1 = isEmpty(start1) ? getMaxDate() : start1;
	end1 = isEmpty(end1) ? getMaxDate() : end1;
	start2 = isEmpty(start2) ? getMaxDate() : start2;
	end2 = isEmpty(end2) ? getMaxDate() : end2;
	//old 
	if(( compareStrDate(start1,start2) && compareStrDate(start2,end1) ) || ( compareStrDate(start1,end2) && compareStrDate(end2,end1) ) || (compareStrDate(start2,start1) && compareStrDate(start1 , end2))  || (compareStrDate(start2 , end1) && compareStrDate(end1 , end2))){
	//now
//	if(( compareNowDate(start1,start2) && compareNewDate(start2,end1) ) || ( compareNowDate(start1,end2) && compareNewDate(end2,end1) ) || (compareNewDate(start2,start1) && compareNowDate(start1 , end2))  || (compareNewDate(start2 , end1) && compareNowDate(end1 , end2))){
	return true;
	}else{
		alert('日付情報を繰り返して再入力してください');
		return false;
	}
}
