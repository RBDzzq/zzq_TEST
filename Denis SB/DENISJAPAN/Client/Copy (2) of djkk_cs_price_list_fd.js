/**
 * DJ_価格表のClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/05     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */

// CH648 zheng 20230607 start
var dealType = '';
var dealFlg = false;
// CH648 zheng 20230607 end

function clientPageInit(type){
    debugger;
    dealType = type;
	if(type == 'create'){
		nlapiSetFieldValue('custrecord_djkk_price_subsidiary_fd', getRoleSub(nlapiGetRole()))
	}
	// CH648 zheng 20230607 start
	if(type == 'edit' || type == 'copy'){
	    var con=nlapiGetLineItemCount('recmachcustrecord_djkk_pldt_pl_fd');
	    if (con > 0) {
	        dealFlg = true;
	        var sub=nlapiGetFieldValue('custrecord_djkk_price_subsidiary_fd');
	        for(var i=1;i<con+1;i++){
	            nlapiSelectLineItem('recmachcustrecord_djkk_pldt_pl_fd', i);
	            if (i == con) {
	                nlapiCancelLineItem('recmachcustrecord_djkk_pldt_pl_fd');   
	            }
	        }
	    } else {
	        nlapiCancelLineItem('recmachcustrecord_djkk_pldt_pl_fd');
	    }
	}
	// CH648 zheng 20230607 end
	setFieldDisableType('name', 'hidden');
//	setLineItemDisableType('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_pldt_code_fd', 'hidden');
}


function clientFieldChanged(type, name, linenum){
	var sub=nlapiGetFieldValue('custrecord_djkk_price_subsidiary_fd');
	var con=nlapiGetLineItemCount('recmachcustrecord_djkk_pldt_pl_fd');
	if(name=='custrecord_djkk_price_subsidiary_fd'){

		if(con>0){
		for(var i=1;i<con+1;i++){
			nlapiSelectLineItem('recmachcustrecord_djkk_pldt_pl_fd', i);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_price_subsidiary_pl_fd', sub, false, true);
		    nlapiCommitLineItem('recmachcustrecord_djkk_pldt_pl_fd');
		}
		}else{
			nlapiCancelLineItem('recmachcustrecord_djkk_pldt_pl_fd');
		}
	}
	if(name == 'custrecord_djkk_pldt_itemcode_fd'){
//20221018 changed by zhou
//		nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_price_subsidiary_pl_fd', sub);
		var itemID = nlapiGetCurrentLineItemValue(type, 'custrecord_djkk_pldt_itemcode_fd');
		nlapiLogExecution('DEBUG', 'itemID', itemID);
		nlapiLogExecution('DEBUG', 'type', type);
		if(!isEmpty(itemID)){
		var item = nlapiLoadRecord(nlapiLookupField('item', itemID, 'recordtype'), itemID);
		}
		if(!isEmpty(item)){
			var count = item.getLineItemCount('itemvendor');
			
			if(count == 0){
				
			}else if(count == 1){
				var vendorID = item.getLineItemValue('itemvendor', 'vendor', 1);
				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_pldt_supplier_fd', vendorID)
			}else{
				var findFlg = 'F'
				for(var i = 0 ; i < count ; i++){
					if(item.getLineItemValue('itemvendor', 'preferredvendor', i+1) == 'T'  && item.getLineItemValue('itemvendor', 'subsidiary', i+1) == sub){
						var vendorID = item.getLineItemValue('itemvendor', 'vendor', i+1);
						nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_pldt_supplier_fd', vendorID)
						findFlg = 'T';
						break;
					}
				}
				
				if(findFlg == 'F'){
					var vendorID = item.getLineItemValue('itemvendor', 'vendor', 1);
					nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_pldt_supplier_fd', vendorID)
				}
			}
		}
	}
}



function csclientSaveRecord(){
	//DJ_価格表名前
		var custrecord_djkk_pl_name = nlapiGetFieldValue('custrecord_djkk_pl_name_fd');
		var custrecord_djkk_pl_code = nlapiGetFieldValue('custrecord_djkk_pl_code_fd');
		nlapiSetFieldValue('name',  custrecord_djkk_pl_code+ ' '+custrecord_djkk_pl_name );		

		var count =nlapiGetLineItemCount('recmachcustrecord_djkk_pldt_pl_fd');
		var detailed = [];
		// CH610 zheng 20230529 start
		var tmpIdList = [];
		var tmpItemDic = {};
		for(var i = 1;i < count+1; i++){
		    var detailedName = nlapiGetLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_pldt_itemcode_fd',i);
		    if (detailedName) {
		        tmpIdList.push(detailedName);
		    }
		}
		if (tmpIdList.length > 0) {
		    tmpItemDic = getItemInfo(tmpIdList);
		}
		// CH610 zheng 20230529 end
		for(var i = 1;i < count+1; i++){
			var detailedName = nlapiGetLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_pldt_itemcode_fd',i);
			var idInCurrentLineTable = nlapiGetLineItemValue('recmachcustrecord_djkk_pldt_pl_fd','id',i);
			
			// CH610 zheng 20230529 start
			var dealItemId = tmpItemDic[detailedName];
			if (dealItemId) {
			    nlapiSetLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_pldt_code_fd', dealItemId, false, true);
			}
//			var invalidFlg = nlapiGetLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_pldt_invalid_fd',i);
//			if(invalidFlg == 'T'){
//				nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'isinactive', 'T', false, true);
//			}else{
//				nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'isinactive', 'F', false, true);
//			}
			
	//		var detailedCode = nlapiGetLineItemValue('recmachcustrecord_djkk_pldt_pl_fd','custrecord_djkk_pldt_code_fd',i);
//			if(!isEmpty(detailedName)){
//				var itemSearch = nlapiSearchRecord("item",null,
//						[
//						   ["Internalid","is",detailedName]
//						], 
//						[
//				           new nlobjSearchColumn("itemid"),
//						]
//						);
//				if(itemSearch != null){
//					var itemid = itemSearch[0].getValue("itemid");
//					nlapiLogExecution('DEBUG', 'itemid', itemid);
//					// CH342 zheng 20230228 start
//					//nlapiSelectLineItem('recmachcustrecord_djkk_pldt_pl_fd', i);
//					//nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_pldt_code_fd', itemid, false, true);
//					nlapiSetLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_pldt_code_fd', itemid, false, true);
//					//nlapiCommitLineItem('recmachcustrecord_djkk_pldt_pl_fd');
//					// CH342 zheng 20230228 end
//				}
//			}
			// CH610 zheng 20230529 end
	
		}
		nlapiLogExecution('DEBUG', 'end', 'end');
	    return true;
}
function clientLineInit(type){
    debugger;
	var sub=nlapiGetFieldValue('custrecord_djkk_price_subsidiary_fd');
	// CH648 zheng 20230607 start
	if (dealType == 'edit' || dealType == 'copy') {
	    var con=nlapiGetLineItemCount('recmachcustrecord_djkk_pldt_pl_fd');
	    if (con > 0) {
	        if (dealFlg) {
	            nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_price_subsidiary_pl_fd', sub, false, true);
	            false;
	        }
	    } else {
	        nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_price_subsidiary_pl_fd', sub, false, true);
	    }
	}
    if(nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_price_subsidiary_pl_fd') != sub){
        nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl_fd', 'custrecord_djkk_price_subsidiary_pl_fd', sub, false, true);
    }
	// CH648 zheng 20230607 end
	
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
function clientValidateLine(type){
   
	

	
	var listType = 'recmachcustrecord_djkk_pldt_pl_fd'
	var startDate = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pl_startdate_fd');
	var endDate = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pl_enddate_fd');

	var itemCd = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_itemcode_fd');
	var saleprice = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_saleprice_fd');
	var itemCount = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_quantity_fd');
	// CH342 zheng 20230226 start
	var basePrice = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_cod_price_fd');
	// CH342 zheng 20230226 end
	var lineNum = nlapiGetCurrentLineItemIndex(listType);
	
	//日付判断
	if(!isEmpty(startDate) && !isEmpty(endDate)){
		
		if(endDate == startDate){
			alert('追加した開始日と終了日はほかの期間と重ねていますので、ご確認お願い致します。')
			return false;
		}
		if(compareStrDate(endDate,startDate)){
			
			alert('開始日と終了日の日付は正しくないです。お手数ですが、ご確認お願い致します。')
			return false;
		}
		

		
	}
	
	
	
	//基本販売価格判断 　重複期間判断
	if(!isEmpty(itemCd) &&!isEmpty(saleprice) && !isEmpty(itemCount)){
	
		var listCount = nlapiGetLineItemCount('recmachcustrecord_djkk_pldt_pl_fd');
		for(var i = 0 ; i  < listCount ; i++){
			
			//本行除く
			if(i+1 == lineNum){
				continue;
			}
				
				//商品コード
				if(nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_itemcode_fd', i+1) == itemCd){
				
				        // CH342 zheng 20230226 start
				        var lineSaleprice = nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_saleprice_fd', i + 1);
                        var lineStartDate = nlapiGetLineItemValue(listType, 'custrecord_djkk_pl_startdate_fd', i + 1);
                        var lineEndDate = nlapiGetLineItemValue(listType, 'custrecord_djkk_pl_enddate_fd', i + 1);
				        if (lineSaleprice != saleprice) {
				            var idiFlg = isDateIntersection(lineStartDate, lineEndDate, startDate, endDate);
				            if (idiFlg) {
				                alert('日付情報を繰り返して再入力してください。');
				                return false;
				            }
				        } else {
				            var lineQuantity = nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_quantity_fd', i + 1);
				            if (lineQuantity == itemCount) {
				                var lineBasePrice = nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_cod_price_fd', i + 1);
				                if (lineBasePrice != basePrice) {
		                            var idiFlg = isDateIntersection(lineStartDate, lineEndDate, startDate, endDate);
		                            if (idiFlg) {
		                                alert('日付情報を繰り返して再入力してください。');
		                                return false;
		                            }
				                } else {
				                    if (!(startDate == lineStartDate && endDate != lineEndDate)) {
				                        if (startDate == lineStartDate && endDate == lineEndDate) {
                                            alert('入力のデータが重複しています。');
                                            return false;
				                        } else {
	                                        var idiFlg = isDateIntersection(lineStartDate, lineEndDate, startDate, endDate);
	                                        if (idiFlg) {
	                                            alert('日付情報を繰り返して再入力してください。');
	                                            return false;
	                                        }
				                        }
				                    }
				                }
				            }
				        }
				    
						//開始日と終了日判断
						//if(dateComper(nlapiGetLineItemValue(listType, 'custrecord_djkk_pl_startdate_fd', i+1),nlapiGetLineItemValue(listType, 'custrecord_djkk_pl_enddate_fd', i+1),startDate, endDate)){
							
							//基本販売価格判断
							//var salepriceValue = nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_saleprice_fd', i+1);
							//if(nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_saleprice_fd', i+1) != saleprice){
								//alert("基本販売価は異なっています")
								//return false;
//								nlapiSetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_saleprice_fd', saleprice, false, true);
							//}
							
							//期間重複場合　数量違いたら　OKです
//							if(nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_quantity_fd', i+1) == itemCount){
//								alert("入力のデータが重複しています。");
//								return false;
//							}
							
						//}
						
	                    // CH342 zheng 20230226 end
					}
		}
	}
	
	

	if(isEmpty(endDate)){
		nlapiSetCurrentLineItemValue(listType, 'custrecord_djkk_pl_enddate_calculationfd', getMaxDate())
	}else{
		nlapiSetCurrentLineItemValue(listType, 'custrecord_djkk_pl_enddate_calculationfd', endDate)
	}
	
    return true;
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

function getMaxDate(){
	var date = new Date();
	date.setFullYear(9999, 11, 31)
	return nlapiDateToString(date)
}
function compareNowDate(strDate1, strDate2) {
	var date1 = nlapiStringToDate(strDate1);
	var date2 = nlapiStringToDate(strDate2);
	if (date1 < date2) {
		return true;
	}
	return false;
}
function compareNewDate(strDate1, strDate2) {
	var date1 = nlapiStringToDate(strDate1);
	var date2 = nlapiStringToDate(strDate2);
	if (date1 > date2) {
		return true;
	}
	return false;
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

    if (startdate1 >= startdate2 && startdate1 <= enddate2) {
        return true;
    }

    if (enddate1 >= startdate2 && enddate1 <= enddate2) {
        return true;
    }

    if (startdate1 <= startdate1 && enddate1 >= enddate2) {
        return true;
    }

    return false;
}
//CH342 zheng 20230226 end

//CH610 zheng 20230529 start
function getItemInfo (idList) {
    
    var resultDic = {};
        
    var searchFilters = [
                         ["Internalid","anyof",idList]
                        ];
    var searchColumns = [
                            new nlobjSearchColumn("internalid"),
                            new nlobjSearchColumn("itemid")
                        ];
    var itemSearch = getSearchResults("item", null, searchFilters, searchColumns);
    if (itemSearch && itemSearch.length > 0) {
        for(var i = 0 ;i < itemSearch.length; i++){
            var tmpResult = itemSearch[i];
            var tmpId = tmpResult.getValue("internalid");
            var tmpItemId = tmpResult.getValue("itemid");
            resultDic[tmpId] = tmpItemId;
        }
    }
    
    return resultDic;
}
//CH610 zheng 20230529 end