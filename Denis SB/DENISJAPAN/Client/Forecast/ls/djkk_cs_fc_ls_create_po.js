/**
 * DJ_発注書入力_LS
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/07/05     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {
	var pLocation = nlapiGetFieldValue('custpage_po_location');
	if(isEmpty(pLocation)||pLocation=='0'){
		alert('「場所」入力必須');
		return false;
	}
	var poVendor = nlapiGetFieldValue('custpage_po_vendor');	
	if(isEmpty(poVendor)||poVendor=='0'){
		alert('「仕入先」入力必須');
		return false;
	}
	
	var poCurrency = nlapiGetFieldValue('custpage_po_currency');
		if (isEmpty(poCurrency)||poCurrency=='0') {
			alert('「通貨」入力必須');
			return false;
	}
	var count = nlapiGetLineItemCount('sublist_item');
	var noselectFlag=false;
	for (var i = 1; i < count + 1; i++) {
		if (nlapiGetLineItemValue('sublist_item', 'checkbox', i) == 'T') {
			noselectFlag=true;
//			var lineLocation = nlapiGetLineItemValue('sublist_item','linelocation', i);
//			if (isEmpty(lineLocation)||lineLocation=='0') {
//             alert(i+'行目アイテム の「場所」入力必須');
//             return false;
//			}
//			var linevendor = nlapiGetLineItemValue('sublist_item','linevendor', i);
//			if (isEmpty(linevendor)||linevendor=='0') {
//             alert(i+'行目アイテム の「仕入先」入力必須');
//             return false;
//			}
			var quantity = nlapiGetLineItemValue('sublist_item','quantity', i);
			if (isEmpty(quantity)||quantity=='0') {
             alert(i+'行目アイテム の「注文数」入力必須');
             return false;
			}
			var rate = nlapiGetLineItemValue('sublist_item','rate', i);
			if (isEmpty(rate)) {
             alert(i+'行目アイテム の「単価」入力必須');
             return false;
			}
			/**************************/
			var unitstypetext = nlapiGetLineItemValue('sublist_item','unitstypetext', i);
			var units = nlapiGetLineItemText('sublist_item','units', i);
			
			if (isEmpty(unitstypetext)&&!isEmpty(units)) {
             alert(i+'行目アイテム の「種類-単位」入力間違い');
             return false;
			}
			if (!isEmpty(unitstypetext)&&!isEmpty(units)) {
				if (units.indexOf(unitstypetext)<0) {
		             alert(i+'行目アイテム の「種類-単位」入力間違い');
		             return false;
					}
				}
			/**************************/
//			var currency = nlapiGetLineItemValue('sublist_item','currency', i);
//			if (isEmpty(currency)||currency=='0') {
//             alert(i+'行目アイテム の「通貨」入力必須');
//             return false;
//			}
			
		}
	}
	if(noselectFlag==false){
		alert('アイテムが選択されていません!');
	}
	return noselectFlag;
}
/*
 * 発注書入力検索
 */
function searchPoToCreat() {

	var dateweek = nlapiGetFieldValue('custpage_dateweek');
	var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
	var locationValue=nlapiGetFieldValue('custpage_location');
	var vendor=nlapiGetFieldValue('custpage_vendor');
	var item=nlapiGetFieldValue('custpage_item');
    var brand=nlapiGetFieldValue('custpage_brand');
    var startDate = nlapiGetFieldValue('custpage_datestart');
    var endDate = nlapiGetFieldValue('custpage_dateend');
	if (isEmpty(dateweek)) {
		alert('「入荷予定週」入力必須');
	}else if (isEmpty(subsidiary)||subsidiary=='0') {
		alert('「連結」入力必須');
	}else if (isEmpty(locationValue)||locationValue=='0') {
		alert('「場所エリア」入力必須');
	}
	else{
		var currencyId='';
		 if(!isEmpty(vendor)&&vendor!='0'){
			  currencyId=nlapiLoadRecord('vendor', vendor).getLineItemValue('currency', 'currency', '1');
		 }
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_create_po','customdeploy_djkk_sl_fc_ls_create_po');
		theLink +='&subsidiary=' + subsidiary;
		theLink +='&location=' + locationValue;
		theLink +='&vendor=' + vendor;
		theLink +='&item=' + item;
		theLink +='&brand=' + brand;
		theLink +='&dateweek=' + dateweek;
		theLink +='&currencyId=' + currencyId;
		theLink +='&startDate=' + startDate;
		theLink +='&endDate=' + endDate;
		theLink +='&search=T';
		window.ischanged = false;
		location.href = theLink;
	} 
}

/*
 *更新
 */
function refresh(){
	window.ischanged = false;
	location=location;
}

/*
 * 検索に戻る
 */
function backToSearch() {

	var dateweek = nlapiGetFieldValue('custpage_dateweek');
	var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
	var locationValue=nlapiGetFieldValue('custpage_location');
	var vendor=nlapiGetFieldValue('custpage_vendor');
	var item=nlapiGetFieldValue('custpage_item');
    var brand=nlapiGetFieldValue('custpage_brand');
    var startDate = nlapiGetFieldValue('custpage_datestart');
    var endDate = nlapiGetFieldValue('custpage_dateend');
    var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_create_po','customdeploy_djkk_sl_fc_ls_create_po');
		theLink +='&subsidiary=' + subsidiary;
		theLink +='&location=' + locationValue;
		theLink +='&vendor=' + vendor;
		theLink +='&item=' + item;
		theLink +='&brand=' + brand;
		theLink +='&startDate=' + startDate;
		theLink +='&endDate=' + endDate;
		theLink +='&dateweek=' + dateweek;
		window.ischanged = false;
		location.href = theLink;
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
	if(type=='sublist_item'){
	   if(name=='quantity'||name=='rate'||name=='taxcode'){
		var rate=Number(nlapiGetLineItemValue(type, 'rate', linenum));
		var quantity=Number(nlapiGetLineItemValue(type, 'quantity', linenum));
		var amount=rate*quantity;
        nlapiSetLineItemValue('sublist_item', 'amount', linenum,amount.toFixed(2));
        var taxcode=nlapiGetLineItemValue('sublist_item', 'taxcode', linenum);
        if(!isEmpty(taxcode)){
        	var tax=nlapiLookupField('salestaxitem', taxcode, 'rate').split('%')[0]/100+1;
        	var grossamt=amount*tax;
        	 nlapiSetLineItemValue('sublist_item', 'grossamt', linenum,grossamt.toFixed(2));
        }else{
        	 nlapiSetLineItemValue('sublist_item', 'grossamt', linenum,amount.toFixed(2));
        }    	
      }
	   if(name=='units'){
		   var unitname=nlapiGetLineItemText(type, 'units', linenum);
		   nlapiSetLineItemValue('sublist_item', 'conversionrate', linenum,getConversionrate(unitname));
	   }
	   if(name=='units'||name=='quantity'){
		   var conversionrate=Number(nlapiGetLineItemValue(type, 'conversionrate', linenum));
		   var quantity=Number(nlapiGetLineItemValue(type, 'quantity', linenum));
		   if(!isEmpty(conversionrate)&&conversionrate!='0'){			  
		   nlapiSetLineItemValue('sublist_item', 'cases', linenum,Math.ceil(quantity/conversionrate));
		   }
	   }
	}
	if(name==='custpage_subsidiary'){
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_create_po','customdeploy_djkk_sl_fc_ls_create_po');
		var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
		var dateweek = nlapiGetFieldValue('custpage_dateweek');
		var locationValue=nlapiGetFieldValue('custpage_location');
		var vendor=nlapiGetFieldValue('custpage_vendor');
	    var brand=nlapiGetFieldValue('custpage_brand');
		theLink = theLink +'&subsidiary=' + subsidiary+'&dateweek=' + dateweek;		
		theLink +='&location=' + locationValue;
		window.ischanged = false;
		location.href = theLink;
	}
	/*****/
	if(name=='custpage_po_currency'){
		   var currencyId=nlapiGetFieldValue('custpage_po_currency');
		   var currencyTxt=nlapiGetFieldText('custpage_po_currency');
		   if(!isEmpty(currencyId)){
			   var linevendor=nlapiGetFieldValue('custpage_po_vendor');
			   var linevendorText=nlapiGetFieldText('custpage_po_vendor');
			if(!isEmpty(linevendor)&&linevendor!='0'){
			   var vendor=nlapiLoadRecord('vendor', linevendor);
			   var currencyArray=new Array();
			   var vc=vendor.getLineItemCount('currency');
			   for(var vci=1;vci<vc+1;vci++){
				   currencyArray.push(vendor.getLineItemValue('currency', 'currency', vci));
			   }
			
			if(currencyArray.indexOf(currencyId)<0){			
				 var currencyId=vendor.getLineItemValue('currency', 'currency', '1');
				 nlapiSetFieldValue('custpage_po_currency', currencyId, false, true);
				 alert(linevendorText+'は通貨'+currencyTxt+'をサポートしていません');
			}
		}
		   }
	   }
	 if(name=='custpage_po_vendor'){
		  var linevendor=nlapiGetFieldValue('custpage_po_vendor');
		  var count = nlapiGetLineItemCount('sublist_item');
		   if(!isEmpty(linevendor)&&linevendor!='0'){
			   var currencyId=nlapiLoadRecord('vendor', linevendor).getLineItemValue('currency', 'currency', '1');
			   nlapiSetFieldValue('custpage_po_currency', currencyId, false, true);
		   }
		//20221028 change by zhou U379 start
			var vendorSearch = nlapiSearchRecord("vendor",null,
					[
					 	["internalid","is",linevendor]
					 ],
					[
					 	new nlobjSearchColumn("custentity_djkk_buy_price_code"),
					 ]
					);
			
			var priceArr = [];
			if (!isEmpty(vendorSearch)) {
				
				var priceCode = vendorSearch[0].getValue('custentity_djkk_buy_price_code');
				if(!isEmpty(priceCode)){
					var loadingPriceCode = nlapiLoadRecord("customrecord_djkk_buy_price_list",priceCode);
					var PriceCodeCount = loadingPriceCode.getLineItemCount("recmachcustrecord_djkk_buy_price");
					//購入価格表ls
					for(var ct = 1 ; ct < PriceCodeCount +1; ct++){
						var priceItem = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_detailed_itemcode',ct);
						var priceCodeDefaultRate = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_detailed_price',ct);//DJ_基本購買価格
						var priceCodeQuantityRate =  loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_price_quantity',ct);//DJ_数量ベース価格
						var priceCodeStartDate = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_start_date',ct);
						var priceCodeEndDate = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_end_date',ct);
						var defaultEndDate  = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_end_date_price_detailed',ct);
						var priceCodeQuantity = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_detailed_quantity',ct);
						if(isEmpty(priceCodeEndDate)){
							priceCodeEndDate = defaultEndDate;
						}
						priceArr.push({
							priceItem:priceItem,
							priceCodeDefaultRate:priceCodeDefaultRate,
							priceCodeStartDate:priceCodeStartDate,
							priceCodeEndDate:priceCodeEndDate,
							priceCodeQuantity:priceCodeQuantity,
							priceCodeQuantityRate:priceCodeQuantityRate
						})
					}
					if(!isEmpty(priceArr)){
						var map = {};
						var dest = [];
						for(var mj = 0; mj < priceArr.length; mj++){
						    var ai = priceArr[mj];
						    if(!map[ai.priceItem]){
						        dest.push({
						        	priceItem: ai.priceItem,
						            data: [ai]
						        });
						        map[ai.priceItem] = ai;
						    }else{
						        for(var j = 0; j < dest.length; j++){
						            var dj = dest[j];
						            if(dj.priceItem == ai.priceItem){
						                dj.data.push(ai);
						                break;
						            }
						        }
						    }
						}
					}
					console.log(JSON.stringify(dest))
//					priceArr =  priceArr.sort(compare("priceCodeQuantity",false));
					nlapiLogExecution('debug','dest',JSON.stringify(dest))
				}
			}	
			for (var s = 1; s < count + 1; s++) {
				nlapiSelectLineItem('sublist_item', s);
					
					//		var startDate = nlapiGetFieldValue('custpage_datestart');
					//	    var endDaif (!isEmpty(priceArr)) {te = nlapiGetFieldValue('custpage_dateend');
					if (!isEmpty(priceArr)) {
						var itemId = nlapiGetLineItemValue('sublist_item', 'itemid',s);
						var compareArr = [];
						var startDate =nlapiGetLineItemValue('sublist_item', 'expectedreceiptdate', s);//現在の明細商品-受領予定日
						var linequantity=Number(nlapiGetLineItemValue('sublist_item', 'quantity', s));//現在の明細商品-数量&左区間数量
						for(var de = 0 ; de < dest.length;de++){
							if(itemId == dest[de].priceItem){
								compareArr = dest[de].data;
								break;
							}
						}
						priceArr =  compareArr.sort(compare("priceCodeQuantity",false));
						for(var k=0 ; k< priceArr.length ; k++){
							if(compareStrDate(priceArr[k].priceCodeStartDate,startDate)&& compareStrDate(startDate,priceArr[k].priceCodeEndDate)){
//											alert(priceArr[k].priceCodeStartDate +''+ priceArr[k].priceCodeEndDate)
								if(k+1 != priceArr.length){
									if(Number(linequantity) >= Number(priceArr[k].priceCodeQuantity)&& Number(linequantity) < Number(priceArr[k+1].priceCodeQuantity)){
										nlapiSetCurrentLineItemValue('sublist_item','rate', Number(priceArr[k].priceCodeQuantityRate).toFixed(2));
										break;
									}else if(Number(linequantity) < Number(priceArr[k].priceCodeQuantity)){
										nlapiSetCurrentLineItemValue('sublist_item','rate', Number(priceArr[k].priceCodeDefaultRate).toFixed(2));
										break;
									}else{
										continue;
									}
								}else if(k+1 == priceArr.length && Number(linequantity) >= Number(priceArr[k].priceCodeQuantity)){
									nlapiSetCurrentLineItemValue('sublist_item','rate', Number(priceArr[k].priceCodeQuantityRate));
								}else if(k+1 == priceArr.length && Number(linequantity) < Number(priceArr[k].priceCodeQuantity)){
									nlapiSetCurrentLineItemValue('sublist_item','rate', Number(priceArr[k].priceCodeDefaultRate));
								}else{
									var inventoryitemSearch = nlapiSearchRecord("item",null,
											[  
											   ["internalid","anyof",itemId]
											], 
											[
											   new nlobjSearchColumn("baseprice")
											]
											);
									if(!isEmpty(inventoryitemSearch)){
										var rate = inventoryitemSearch[0].getValue("baseprice");
										nlapiSetCurrentLineItemValue('sublist_item','rate', Number(rate).toFixed(2));
									}
								}
							}
						}	
//					}else{
//						var inventoryitemSearch = nlapiSearchRecord("item",null,
//								[  
//								   ["internalid","anyof",itemId]
//								], 
//								[
//								   new nlobjSearchColumn("baseprice")
//								]
//								);
//						if(!isEmpty(inventoryitemSearch)){
//							var rate = inventoryitemSearch[0].getValue("baseprice");
//							nlapiSetCurrentLineItemValue('sublist_item','rate', Number(rate).toFixed(2));
//						}					
//					}									
					}else{
						
//							nlapiSetCurrentLineItemValue('sublist_item', 'rate', inventoryitemSearch[n].getValue('vendorcost'), true, true);
						nlapiSetCurrentLineItemValue('sublist_item', 'rate', 0, true, true);	
					}														
			}
	 }
	
	
//	   if(name=='custpage_po_vendor'){
//		   var linevendor=nlapiGetFieldValue('custpage_po_vendor');
//		   if(!isEmpty(linevendor)&&linevendor!='0'){
//		   var currencyId=nlapiLoadRecord('vendor', linevendor).getLineItemValue('currency', 'currency', '1');
//		   nlapiSetFieldValue('custpage_po_currency', currencyId, false, true);
//		   var count = nlapiGetLineItemCount('sublist_item');
//		   var itemArray=new Array();
//		   for (var i = 1; i < count + 1; i++) {
//				itemArray.push(nlapiGetLineItemValue('sublist_item', 'itemid', i));				
//		    }
//			   if (!isEmpty(itemArray)) {
//				var inventoryitemSearch = nlapiSearchRecord("inventoryitem",
//						null, 
//						[ 
//						  [ "type", "anyof", "InvtPart" ], 
//						  "AND",
//						  [ "internalid", "anyof", itemArray ], 
//						  "AND",
//						  [ "othervendor", "anyof", linevendor ] 
//						  ], 
//						  [
//						   new nlobjSearchColumn("internalid"),
//						   new nlobjSearchColumn("vendorcost") 
//						   ]);
//				if (!isEmpty(inventoryitemSearch)) {
//					for (var n = 0; n < inventoryitemSearch.length; n++) {
//						for (var s = 1; s < count + 1; s++) {
//							nlapiSelectLineItem('sublist_item', s);
//							nlapiSetCurrentLineItemValue('sublist_item', 'rate', '0', true, true);
//							if (nlapiGetLineItemValue('sublist_item', 'itemid',s) == inventoryitemSearch[n].getValue('internalid')) {
//								nlapiSetCurrentLineItemValue('sublist_item', 'rate', inventoryitemSearch[n].getValue('vendorcost'), true, true);
//							}
//						}
//					}
//				} else {
//					for (var r = 1; r < count + 1; r++) {
//						nlapiSelectLineItem('sublist_item', r);
//						nlapiSetCurrentLineItemValue('sublist_item', 'rate', '0', true, true);
//					}
//				}
//			}			  
//		   }else {
//				for (var t = 1; t < count + 1; t++) {
//					nlapiSelectLineItem('sublist_item', t);
//					nlapiSetCurrentLineItemValue('sublist_item', 'rate', '0', true, true);
//				}
//			}
//	   }
	   /*****/
	if (name==='custpage_dateweek'||name === 'custpage_vendor'||name === 'custpage_brand'||name === 'custpage_location') {
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_fc_ls_create_po','customdeploy_djkk_sl_fc_ls_create_po');
		var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
		var dateweek = nlapiGetFieldValue('custpage_dateweek');
		var locationValue=nlapiGetFieldValue('custpage_location');
		var vendor=nlapiGetFieldValue('custpage_vendor');
	    var brand=nlapiGetFieldValue('custpage_brand');
	    var startDate = nlapiGetFieldValue('custpage_datestart');
	    var endDate = nlapiGetFieldValue('custpage_dateend');
		theLink +='&subsidiary=' + subsidiary;
		theLink +='&location=' + locationValue;
		theLink +='&vendor=' + vendor;
		theLink +='&brand=' + brand;
		theLink +='&dateweek=' + dateweek;
		theLink +='&startDate=' + startDate;
		theLink +='&endDate=' + endDate;
		window.ischanged = false;
		location.href = theLink;		
	}
	
	//20221028 change by zhou U379 start
	if(type=='sublist_item'){
		if(name=='quantity'){
			var vendor=nlapiGetFieldValue('custpage_po_vendor');
			var vendorSearch = nlapiSearchRecord("vendor",null,
					[
					 	["internalid","is",vendor]
					 ],
					[
					 	new nlobjSearchColumn("custentity_djkk_buy_price_code"),
					 ]
					);
			var priceArr = [];
			if (!isEmpty(vendorSearch)) {
				var priceCode = vendorSearch[0].getValue('custentity_djkk_buy_price_code');
				var loadingPriceCode = nlapiLoadRecord("customrecord_djkk_buy_price_list",priceCode);
				var PriceCodeCount = loadingPriceCode.getLineItemCount("recmachcustrecord_djkk_buy_price");
				var itemId =nlapiGetLineItemValue(type, 'itemid', linenum);
				//購入価格表ls
				for(var ct = 1 ; ct < PriceCodeCount +1; ct++){
					var priceItem = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_detailed_itemcode',ct);
					var priceCodeDefaultRate = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_detailed_price',ct);//DJ_基本購買価格
					var priceCodeQuantityRate =  loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_price_quantity',ct);//DJ_数量ベース価格
					var priceCodeStartDate = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_start_date',ct);
					var priceCodeEndDate = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_end_date',ct);
					var defaultEndDate  = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_end_date_price_detailed',ct);
					var priceCodeQuantity = loadingPriceCode.getLineItemValue('recmachcustrecord_djkk_buy_price','custrecord_djkk_buy_detailed_quantity',ct);
					if(isEmpty(priceCodeEndDate)){
						priceCodeEndDate = defaultEndDate;
					}
					if(itemId == priceItem){
						priceArr.push({
							priceItem:priceItem,
							priceCodeDefaultRate:priceCodeDefaultRate,
							priceCodeStartDate:priceCodeStartDate,
							priceCodeEndDate:priceCodeEndDate,
							priceCodeQuantity:priceCodeQuantity,
							priceCodeQuantityRate:priceCodeQuantityRate
						})
					}
				}
				priceArr =  priceArr.sort(compare("priceCodeQuantity",false));

//				alert(JSON.stringify(priceArr)+priceArr.length)
				var startDate =nlapiGetLineItemValue(type, 'expectedreceiptdate', linenum);//現在の明細商品-受領予定日
				var linequantity=Number(nlapiGetLineItemValue(type, 'quantity', linenum));//現在の明細商品-数量&左区間数量
				if(!isEmpty(priceArr)){
					for(var k=0 ; k< priceArr.length ; k++){
							if(compareStrDate(priceArr[k].priceCodeStartDate,startDate)&& compareStrDate(startDate,priceArr[k].priceCodeEndDate)){
	//							alert(priceArr[k].priceCodeStartDate +''+ priceArr[k].priceCodeEndDate)
								if(k+1 != priceArr.length){
									if(Number(linequantity) >= Number(priceArr[k].priceCodeQuantity) && Number(linequantity) < Number(priceArr[k+1].priceCodeQuantity)){
										nlapiSetCurrentLineItemValue('sublist_item','rate', Number(priceArr[k].priceCodeQuantityRate).toFixed(2));
										break;
									}else if(Number(linequantity) < Number(priceArr[k].priceCodeQuantity)){
										nlapiSetCurrentLineItemValue('sublist_item','rate', Number(priceArr[k].priceCodeDefaultRate).toFixed(2));
										break;
									}else{
										continue;
									}
								}else if(k+1 == priceArr.length && Number(linequantity) >= Number(priceArr[k].priceCodeQuantity)){
									nlapiSetCurrentLineItemValue('sublist_item','rate', Number(priceArr[k].priceCodeQuantityRate));
									break;
								}else if(k+1 == priceArr.length && Number(linequantity) < Number(priceArr[k].priceCodeQuantity)){
									nlapiSetCurrentLineItemValue('sublist_item','rate', Number(priceArr[k].priceCodeDefaultRate));
									break;
								}else{
									var inventoryitemSearch = nlapiSearchRecord("item",null,
											[  
											   ["internalid","anyof",itemId]
											], 
											[
											   new nlobjSearchColumn("baseprice")
											]
											);
									if(!isEmpty(inventoryitemSearch)){
										var rate = inventoryitemSearch[0].getValue("baseprice");
										nlapiSetCurrentLineItemValue('sublist_item','rate', Number(rate).toFixed(2));
									}
								}
							}
					}
				}else{
//					var inventoryitemSearch = nlapiSearchRecord("item",null,
//								[  
//								   ["internalid","anyof",itemId]
//								], 
//								[
//								   new nlobjSearchColumn("baseprice")
//								]
//								);
//						if(!isEmpty(inventoryitemSearch)){
//							var rate = inventoryitemSearch[0].getValue("baseprice");
//							nlapiSetCurrentLineItemValue('sublist_item','rate', Number(rate).toFixed(2));
//					}
					nlapiSetCurrentLineItemValue('sublist_item','rate', 0);
				}
			}
		}
	}
	//end
}
