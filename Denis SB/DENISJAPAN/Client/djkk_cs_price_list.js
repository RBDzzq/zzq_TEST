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
function clientPageInit(type){
	
	if(type == 'create'){
		nlapiSetFieldValue('custrecord_djkk_price_subsidiary', getRoleSub(nlapiGetRole()))
	}
	setFieldDisableType('name', 'hidden');
}


function clientFieldChanged(type, name, linenum){
	var sub=nlapiGetFieldValue('custrecord_djkk_price_subsidiary');
	var con=nlapiGetLineItemCount('recmachcustrecord_djkk_pldt_pl');
	if(name=='custrecord_djkk_price_subsidiary'){	
		if(con>0){
		for(var i=1;i<con+1;i++){
			nlapiSelectLineItem('recmachcustrecord_djkk_pldt_pl', i);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl', 'custrecord_djkk_price_subsidiary_pl', sub, false, true);
		    nlapiCommitLineItem('recmachcustrecord_djkk_pldt_pl');
		}
		}else{
			nlapiCancelLineItem('recmachcustrecord_djkk_pldt_pl');
		}
	}
	if(name == 'custrecord_djkk_pldt_itemcode'){
//		nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_price_subsidiary_pl', sub);
		var itemID = nlapiGetCurrentLineItemValue(type, 'custrecord_djkk_pldt_itemcode');
		var item = nlapiLoadRecord(nlapiLookupField('item', itemID, 'recordtype'), itemID);
		if(!isEmpty(item)){
			var count = item.getLineItemCount('itemvendor');
			
			if(count == 0){
				
			}else if(count == 1){
				var vendorID = item.getLineItemValue('itemvendor', 'vendor', 1);
//				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_pldt_supplier', vendorID)
			}else{
				var findFlg = 'F'
				for(var i = 0 ; i < count ; i++){
					if(item.getLineItemValue('itemvendor', 'preferredvendor', i+1) == 'T'){
						var vendorID = item.getLineItemValue('itemvendor', 'vendor', i+1);
//						nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_pldt_supplier', vendorID)
						findFlg = 'T';
						break;
					}
				}
				
				if(findFlg == 'F'){
					var vendorID = item.getLineItemValue('itemvendor', 'vendor', 1);
//					nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_pldt_supplier', vendorID)
				}
			}
		}


	}
	
}



function clientSaveRecord(){
	
	//DJ_価格表名前
	var custrecord_djkk_pl_name = nlapiGetFieldValue('custrecord_djkk_pl_name');
	var custrecord_djkk_pl_code = nlapiGetFieldValue('custrecord_djkk_pl_code');
	nlapiSetFieldValue('name',  custrecord_djkk_pl_code+ ' '+custrecord_djkk_pl_name );
	
    return true;
}
function clientLineInit(type){
	var sub=nlapiGetFieldValue('custrecord_djkk_price_subsidiary');
	if(nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl', 'custrecord_djkk_price_subsidiary_pl') != sub){
		nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_pldt_pl', 'custrecord_djkk_price_subsidiary_pl', sub, false, true);
	}	
	
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
   
	
	
	
	var listType = 'recmachcustrecord_djkk_pldt_pl'
	var startDate = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pl_startdate');
	var endDate = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pl_enddate');

//	var useFlg = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_use_flag');
	var itemCd = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_itemcode');
//	var currency = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_currency');
	var saleprice = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_saleprice');
	var itemCount = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_quantity');
//	var nouhinsaki = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_deliverydestination');
//	var priceFlg = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_pldt_use_flag');
//	if(priceFlg== '2' || priceFlg== '3'){
//		if(isEmpty(nouhinsaki) || nouhinsaki == '0'){
//			alert('DJ_納品先入力が必要です。')
//			return false;
//		}
//	}
	
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
//	if(!isEmpty(useFlg) &&!isEmpty(itemCd) &&!isEmpty(currency) &&!isEmpty(saleprice) && !isEmpty(itemCount)){
	if(!isEmpty(itemCd) &&!isEmpty(saleprice) && !isEmpty(itemCount)){
	
		var listCount = nlapiGetLineItemCount('recmachcustrecord_djkk_pldt_pl');
		for(var i = 0 ; i  < listCount ; i++){
			
			//本行除く
			if(i+1 == lineNum){
				continue;
			}
			
//			//価格表フラグ
//			if(nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_use_flag', i+1) == useFlg){
				
				//商品コード
				if(nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_itemcode', i+1) == itemCd){
					
//					//通貨
//					if(nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_currency', i+1) == currency){
						
						//開始日と終了日判断
						if(dateComper(nlapiGetLineItemValue(listType, 'custrecord_djkk_pl_startdate', i+1),nlapiGetLineItemValue(listType, 'custrecord_djkk_pl_enddate', i+1),startDate, endDate)){
							
							//基本販売価格判断
							if(nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_saleprice', i+1) != saleprice){
								alert("基本販売価は異なっています")
								return false;
							}
							
							//期間重複場合　数量違いたら　OKです
							if(nlapiGetLineItemValue(listType, 'custrecord_djkk_pldt_quantity', i+1) == itemCount){
								alert("入力のデータが重複しています。");
								return false;
							}
							
						}
					}
//				}
//			}
		}
	}
	
	

	if(isEmpty(endDate)){
		nlapiSetCurrentLineItemValue(listType, 'custrecord_djkk_pl_enddate_calculation', getMaxDate())
	}else{
		nlapiSetCurrentLineItemValue(listType, 'custrecord_djkk_pl_enddate_calculation', endDate)
	}
	
    return true;
}


function dateComper(start1 ,end1,start2,end2){
	
	start1 = isEmpty(start1) ? getMaxDate() : start1;
	end1 = isEmpty(end1) ? getMaxDate() : end1;
	start2 = isEmpty(start2) ? getMaxDate() : start2;
	end2 = isEmpty(end2) ? getMaxDate() : end2;
	
	//if(( start1<=start2 && start2<=end1 ) || ( start1<=end2 && end2<=end1 ) || (start2 <= start1 && start1 <= end2)  || (start2 <= end1 && end1 <= end2))
	if(( compareStrDate(start1,start2) && compareStrDate(start2,end1) ) || ( compareStrDate(start1,end2) && compareStrDate(end2,end1) ) || (compareStrDate(start2,start1) && compareStrDate(start1 , end2))  || (compareStrDate(start2 , end1) && compareStrDate(end1 , end2))){
		return true;
	}else{
		return false;
	}
}

function getMaxDate(){
	var date = new Date();
	date.setFullYear(9999, 11, 31)
	return nlapiDateToString(date)
}

