/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Oct 2022     rextec
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
		if(getRoleSub(nlapiGetRole())==SUB_DPKK || getRoleSub(nlapiGetRole())==SUB_SCETI){
			nlapiSetFieldValue('custrecord_djkk_buy_subsidiary', getRoleSub(nlapiGetRole()))
		}
		
	}
	setFieldDisableType('name', 'hidden');
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	//DJ_価格表名前
	var custrecord_djkk_pl_name = nlapiGetFieldValue('custrecord_djkk_buy_name');
	var custrecord_djkk_pl_code = nlapiGetFieldValue('custrecord_djkk_buy_code');
	nlapiSetFieldValue('name',  custrecord_djkk_pl_code+ ' '+custrecord_djkk_pl_name );
	
	
//	var date = new Date();
//	var year = date.getFullYear();
//	var month = date.getMonth()+1;
//	var data = date.getDate();
//	var hour = date.getHours()<10?'0'+date.getHours():date.getHours();
//	var min = date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes();
//	var se = date.getSeconds()<10?'0'+date.getSeconds():date.getSeconds();
//	
//	var value = String(year)+String(month)+String(data)+String(hour)+String(min)+String(se);
//	nlapiSetFieldValue('custrecord_djkk_id', value);
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
	var sub=nlapiGetFieldValue('custrecord_djkk_buy_subsidiary');
	var con=nlapiGetLineItemCount('recmachcustrecord_djkk_buy_price');
	if(name=='custrecord_djkk_buy_subsidiary'){	
		if(con>0){
		for(var i=1;i<con+1;i++){
			nlapiSelectLineItem('recmachcustrecord_djkk_buy_price', i);
			nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_buy_price', 'custrecord_djkk_buy_sub', sub, false, true);
		    nlapiCommitLineItem('recmachcustrecord_djkk_buy_price');
		}
		}else{
			nlapiCancelLineItem('recmachcustrecord_djkk_buy_price');
		}
	}
	
	
	
//	if(name == 'custrecord_djkk_buy_detailed_itemcode'){
////		nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_price_subsidiary_pl', sub);
//		var itemID = nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_buy_price', 'custrecord_djkk_buy_detailed_itemcode');
//		var item = nlapiLoadRecord(nlapiLookupField('item', itemID, 'recordtype'), itemID);
//		if(!isEmpty(item)){
//			var count = item.getLineItemCount('itemvendor');
//			
//			if(count == 0){
//				
//			}else if(count == 1){
//				var vendorID = item.getLineItemValue('itemvendor', 'vendor', 1);
////				nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_pldt_supplier', vendorID)
//			}else{
//				var findFlg = 'F'
//				for(var i = 0 ; i < count ; i++){
//					if(item.getLineItemValue('itemvendor', 'preferredvendor', i+1) == 'T'){
//						var vendorID = item.getLineItemValue('itemvendor', 'vendor', i+1);
////						nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_pldt_supplier', vendorID)
//						findFlg = 'T';
//						break;
//					}
//				}
//				
//				if(findFlg == 'F'){
//					var vendorID = item.getLineItemValue('itemvendor', 'vendor', 1);
////					nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_pldt_supplier', vendorID)
//				}
//			}
//		}
//
//
//	}
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
	var sub=nlapiGetFieldValue('custrecord_djkk_buy_subsidiary');
	if(nlapiGetCurrentLineItemValue('recmachcustrecord_djkk_buy_price', 'custrecord_djkk_buy_sub') != sub){
		nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_buy_price', 'custrecord_djkk_buy_sub', sub, false, true);
	}	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
		var listType = 'recmachcustrecord_djkk_buy_price'
		var startDate = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_buy_start_date');
		var endDate = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_buy_end_date');

		var itemCd = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_buy_detailed_itemcode');
		var saleprice = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_buy_detailed_price');
		var itemCount = nlapiGetCurrentLineItemValue(listType, 'custrecord_djkk_buy_detailed_quantity');
		
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
		
			var listCount = nlapiGetLineItemCount('recmachcustrecord_djkk_buy_price');
			for(var i = 0 ; i  < listCount ; i++){
				
				//本行除く
				if(i+1 == lineNum){
					continue;
				}
				
//				//価格表フラグ
					
					//商品コード
					if(nlapiGetLineItemValue(listType, 'custrecord_djkk_buy_detailed_itemcode', i+1) == itemCd){
						
							
							//開始日と終了日判断
							if(dateComper(nlapiGetLineItemValue(listType, 'custrecord_djkk_buy_start_date', i+1),nlapiGetLineItemValue(listType, 'custrecord_djkk_buy_end_date', i+1),startDate, endDate)){
								
								//基本販売価格判断
								if(nlapiGetLineItemValue(listType, 'custrecord_djkk_buy_detailed_price', i+1) != saleprice){
									alert("基本販売価は異なっています")
									return false;
								}
								
								//期間重複場合　数量違いたら　OKです
								if(nlapiGetLineItemValue(listType, 'custrecord_djkk_buy_detailed_quantity', i+1) == itemCount){
									alert("入力のデータが重複しています。");
									return false;
						}
					}
				}
			}
		}
		
		if(isEmpty(endDate)){
			nlapiSetCurrentLineItemValue(listType, 'custrecord_djkk_end_date_price_detailed', getMaxDate())
		}else{
			nlapiSetCurrentLineItemValue(listType, 'custrecord_djkk_end_date_price_detailed', endDate)
		}
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




function djkkItemSearch() {

	var theLink =URL_HEAD +'/app/common/search/searchresults.nl?searchid=623&whence=';
	open(theLink,'DJ_アイテム検索','top=150,left=20,width=2500,height=800,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}
