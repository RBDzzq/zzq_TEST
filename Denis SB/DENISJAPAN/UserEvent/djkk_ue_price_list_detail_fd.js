/**
 * DJ_価格表明細のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/05     CPC_
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {
    // CH342 zheng 20230227 start
    var currentContext = nlapiGetContext();
    if (currentContext.getExecutionContext() == 'userinterface') {
        if(type != 'view'){
            throw('DJ_販売価格表明細（食品）操作不可');
        }
    }
	//changed by geng add start ch046
	//if(type != 'view'){
		//throw('DJ_販売価格表明細（食品）操作不可');
	//}
	//changed by geng add end ch046
	// CH342 zheng 20230227 end
}
//The following code "userEventBeforeSubmit()" was added on March 30, 2022  zhou
function userEventBeforeSubmit(type) {
    // CH162 zheng 20230221 start
    if(type == 'delete'){
        return;
    }
    // CH162 zheng 20230221 end
    
	if(true){
		var listType = 'recmachcustrecord_djkk_pldt_pl_fd';
			
			//customrecord_djkk_price_list_details_fd
			//recmachcustrecord_djkk_pldt_pl_fd
//		var startDate = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pl_startdate_fd');
//		var endDate = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pl_enddate_fd');
//	
//		var itemCd = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_itemcode_fd');
//		var saleprice = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_saleprice_fd');
//		var itemCount = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_quantity_fd');
//		
//		var lineNum = nlapiGetCurrentLineItemIndex(listType);
		var startDate = nlapiGetFieldValue('custrecord_djkk_pl_startdate_fd');
		var endDate = nlapiGetFieldValue('custrecord_djkk_pl_enddate_fd');
	
		// CH342 zheng 2023027 start
		//日付判断
	    if(!isEmpty(startDate) && !isEmpty(endDate)){
	        if(endDate == startDate){
	            throw nlapiCreateError('データチェック', '追加した開始日と終了日はほかの期間と重ねていますので、ご確認お願い致します。');
	        }
	        if(compareStrDate(endDate,startDate)){
	            throw nlapiCreateError('データチェック', '開始日と終了日の日付は正しくないです。お手数ですが、ご確認お願い致します。');
	        }
	    }
	    
		// var itemCd = nlapiGetFieldValue('custrecord_djkk_pldt_itemcode_fd');
	    var itemCd = '';
		var itemCdCsv = nlapiGetFieldValue('custrecord_djkk_pldt_code_fd');
		if(!isEmpty(itemCdCsv)) {
	        var itemSearch = nlapiSearchRecord("item",null, [["name","is",itemCdCsv]], [new nlobjSearchColumn("internalid")]);
	        if (itemSearch && itemSearch.length > 0) {
	            itemCd = itemSearch[0].getValue("internalid");   
	        }
		}
	    nlapiLogExecution('ERROR', 'itemCd', itemCd);
	    var basePrice = nlapiGetFieldValue('custrecord_djkk_pldt_cod_price_fd');
        // CH342 zheng 2023027 end
		var saleprice = nlapiGetFieldValue('custrecord_djkk_pldt_saleprice_fd');
		var itemCount = nlapiGetFieldValue('custrecord_djkk_pldt_quantity_fd');
		
		//add by song CH051 start
		var itemValue = nlapiGetFieldValue('custrecord_djkk_pldt_itemcode_fd'); //DJ_商品コード
		var invalidFlg = nlapiGetFieldValue('custrecord_djkk_pldt_invalid_fd'); //DJ_無効
		nlapiLogExecution('debug', 'type', type);
		if(invalidFlg == 'T'){
			nlapiSetFieldValue('custrecord_djkk_pldt_compare_fd','F')
		}else{
			nlapiSetFieldValue('custrecord_djkk_pldt_compare_fd','T')
		}
		var compareFlg = nlapiGetFieldValue('custrecord_djkk_pldt_compare_fd');
		var startdate  = nlapiGetFieldValue('custrecord_djkk_pl_startdate_fd');//DJ_開始日
		var recordId =  nlapiGetRecordId();
		//add by song CH051 end
		
		
		var buyid = nlapiGetFieldValue('custrecord_djkk_pldt_pl_fd');
		var buyObj = nlapiLoadRecord('customrecord_djkk_price_list_fd', buyid);
		var listCount = buyObj.getLineItemCount('recmachcustrecord_djkk_pldt_pl_fd')
        nlapiLogExecution('ERROR', 'listCount', listCount);
//		var lineNum = nlapiGetCurrentLineItemIndex(listType);
		
//		var listCount = nlapiGetLineItemCount('recmachcustrecord_djkk_pldt_pl_fd');
//		nlapiLogExecution('debug', 'itemCd', itemCd);
		for(var i = 1 ; i  < listCount+1 ; i++){
//			nlapiLogExecution('debug', 'accessItemArray', 'Success'+i);
			//本行除く
//			if(i+1 == lineNum){
//				nlapiLogExecution('debug', 'accessLineNum', lineNum);
//				continue;
//			}
		    var recoid = buyObj.getLineItemValue(listType, 'id', i);
				//商品コード
		    
				if(buyObj.getLineItemValue(listType, 'custrecord_djkk_pldt_itemcode_fd', i) == itemCd && recoid != recordId){
//					nlapiLogExecution('debug', 'accessLineNum', itemCd);
				        // CH342 zheng 2023027 start
                        var lineSaleprice = buyObj.getLineItemValue(listType, 'custrecord_djkk_pldt_saleprice_fd', i);
                        var lineStartDate = buyObj.getLineItemValue(listType, 'custrecord_djkk_pl_startdate_fd', i);
                        var lineEndDate = buyObj.getLineItemValue(listType, 'custrecord_djkk_pl_enddate_fd', i);
                        if (lineSaleprice != saleprice) {
                            var idiFlg = isDateIntersection(lineStartDate, lineEndDate, startDate, endDate);
                            nlapiLogExecution('ERROR', 'idiFlg', idiFlg);
                            if (idiFlg) {
                                throw nlapiCreateError('データチェック', '有効期間が重複しているので、ご確認お願いいたします。');
                            }
                        } else {
                            var lineQuantity = buyObj.getLineItemValue(listType, 'custrecord_djkk_pldt_quantity_fd', i);
                            if (lineQuantity == itemCount) {
                                var lineBasePrice = buyObj.getLineItemValue(listType, 'custrecord_djkk_pldt_cod_price_fd', i);
                                if (lineBasePrice != basePrice) {
                                    var idiFlg = isDateIntersection(lineStartDate, lineEndDate, startDate, endDate);
                                    if (idiFlg) {
                                        throw nlapiCreateError('データチェック', '有効期間が重複しているので、ご確認お願いいたします。');
                                    }
                                } else {
                                    if (!(startDate == lineStartDate && endDate != lineEndDate)) {
                                        if (startDate == lineStartDate && endDate == lineEndDate) {
                                            throw nlapiCreateError('データチェック', '日入力のデータが重複しています。');
                                        } else {
                                            var idiFlg = isDateIntersection(lineStartDate, lineEndDate, startDate, endDate);
                                            if (idiFlg) {
                                                throw nlapiCreateError('データチェック', '有効期間が重複しているので、ご確認お願いいたします。');
                                            }
                                        }
                                    }
                                }
                            }
                        }
						//開始日と終了日判断
//						if(dateComper(buyObj.getLineItemValue(listType, 'custrecord_djkk_pl_startdate_fd', i),buyObj.getLineItemValue(listType, 'custrecord_djkk_pl_enddate_fd', i),startDate, endDate)){
////							nlapiLogExecution('debug', 'custrecord_djkk_pl_startdate_fd', 'startData');
////							nlapiLogExecution('debug', 'custrecord_djkk_pl_enddate_fd', 'endData');
//							
//							//基本販売価格判断
//							if(buyObj.getLineItemValue(listType, 'custrecord_djkk_pldt_saleprice_fd', i) != saleprice){
////								nlapiLogExecution('debug', 'custrecord_djkk_pldt_saleprice_fd', 'saleprice_fd');
////								alert("基本販売価は異なっています")
//								throw nlapiCreateError('システムエラー', '基本販売価は異なっています。');
//								return false;
//							}
//							var recoid = buyObj.getLineItemValue(listType, 'id', i);
//							if(recoid == recordId){
//								nlapiLogExecution('debug', 'compareFlg', compareFlg);
//								 nlapiLogExecution('debug', 'invalidFlg', invalidFlg);
//								//期間重複場合　数量違いたら　OKです
//								if(buyObj.getLineItemValue(listType, 'custrecord_djkk_pldt_quantity_fd', i) == itemCount &&	//数量
//								   buyObj.getLineItemValue(listType, 'custrecord_djkk_pldt_itemcode_fd', i) == itemValue && //item
//								   buyObj.getLineItemValue(listType, 'custrecord_djkk_pl_startdate_fd', i) == startdate  &&  // DJ_開始日
//								   invalidFlg == compareFlg
//								){
//										throw nlapiCreateError('システムエラー', '入力のデータが重複しています。');
//										return false;
////									nlapiLogExecution('debug', 'custrecord_djkk_pldt_quantity_fd', 'quantity_fd');
////									alert("入力のデータが重複しています。");
//								}
//							}
//							
//						}
                        // CH342 zheng 20230227 end
					}
		}
	}
}

function userEventAfterSubmit(type) {

    // CH162 zheng 20230221 start
    if(type == 'delete'){
        return;
    }
    // CH162 zheng 20230221 end
    
	try{
		var endDate = nlapiGetFieldValue('custrecord_djkk_pl_enddate_fd');
		if(!isEmpty(endDate)){
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_pl_enddate_calculationfd', endDate);
		}else{
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_pl_enddate_calculationfd', getMaxDate());
		}
		
		var priceCode = nlapiGetFieldValue('custrecord_djkk_pldt_pl_fd');
		if(!isEmpty(priceCode)){
			var sub = nlapiLookupField('customrecord_djkk_price_list_fd', priceCode, 'custrecord_djkk_price_subsidiary_fd');
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_price_subsidiary_pl_fd', sub);
		}else{
			nlapiLogExecution('ERROR', 'ヘッダ設定されていない', '連結設定されていない');
		}
		
		//add by song CH051 start
		var isinactiveFlg = nlapiGetFieldValue('isinactive');
		if(isinactiveFlg == 'T'){
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_pldt_invalid_fd', 'T');
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_pldt_compare_fd', 'F');
		}else{
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_pldt_invalid_fd', 'F');
			nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_pldt_compare_fd', 'T');
		}
		//add by song CH051 end
		
		
		// U709 sys start
		var itemId = nlapiGetFieldValue('custrecord_djkk_pldt_code_fd');
		nlapiLogExecution('ERROR', 'itemId', itemId);
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
			nlapiLogExecution('ERROR', 'itemIntid', itemIntid);
			if(!isEmpty(itemIntid)){
				nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_pldt_itemcode_fd', itemIntid);
			}
		}
	}catch(e){
		nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custrecord_djkk_pldt_itemcode_fd', "");
		nlapiLogExecution('ERROR', 'エラー', e.message);
	}
}
      //  U709 sys end

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

//CH342 zheng 20230226 start
/**
 * 日付交差のチェック
 * 
 * @param start1
 * @param end1
 * @param start2
 * @param end2
 * @returns {Boolean} true：yes、false：no
 */
function isDateIntersection(start1, end1, start2, end2) {

	var startdate1 = nlapiStringToDate(start1);
	var enddate1 = nlapiStringToDate(end1);

	var startdate2 = nlapiStringToDate(start2);
	var enddate2 = nlapiStringToDate(end2);

	// 20230621 changed by zhou start
	// CH680
	// if (startdate1 >= startdate2 && startdate1 <= enddate2) {
	// return true;
	// }
	//
	// if (enddate1 >= startdate2 && enddate1 <= enddate2) {
	// return true;
	// }
	//
	// if (startdate1 <= startdate1 && enddate1 >= enddate2) {
	// return true;
	// }

	if (enddate1 === null && enddate2 === null) {
		// if (startdate1 <= enddate2 && startdate2 <= enddate1){
		return true;
		// }
	} else if (enddate1 === null && enddate2 !== null) {
		if (startdate1 <= enddate2 && startdate2 <= startdate1) {
			return true;
		}
	} else if (enddate1 !== null && enddate2 === null) {
		if (startdate2 <= enddate1 && startdate1 <= startdate2) {
			return true;
		}
	} else {
		if (startdate1 <= enddate2 && startdate2 <= enddate1) {
			return true;
		}
	}
	// 20230621 changed by zhou end
	return false;
}
// CH342 zheng 20230226 end
