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
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

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
	if(type == 'item' && name == 'quantity'){
		var sub = nlapiGetFieldValue('subsidiary')
		if(!isEmpty(sub) &&!isEmpty(nlapiGetFieldValue('entity')) && !isEmpty(nlapiGetFieldValue('currency')) && !isEmpty(nlapiGetFieldValue('trandate')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'item')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'quantity'))){
			var price = null;
			if(sub == SUB_SCETI || sub == SUB_DPKK){
				price = setlinepriceFromDelCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
			}
			
			//以外場合対応しない
			if(!isEmpty(price)){		
				nlapiSetCurrentLineItemValue(type, 'rate',Number(price));
			}
		}
	}
}
function clientPostSourcing(type, name) {
	
		if(type == 'item' && name == 'item'){
		var sub = nlapiGetFieldValue('subsidiary')
		if(!isEmpty(sub) &&!isEmpty(nlapiGetFieldValue('entity')) && !isEmpty(nlapiGetFieldValue('currency')) && !isEmpty(nlapiGetFieldValue('trandate')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'item')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'quantity'))){
			var price = null;
			if(sub == SUB_SCETI || sub == SUB_DPKK){
				price = setlinepriceFromDelCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
			}
			//以外場合対応しない
			if(!isEmpty(price)){		
				nlapiSetCurrentLineItemValue(type, 'rate',Number(price));
			}
		}
	}
		

}

function setlinepriceFromDelCust(itemNum , itemId){
	
	var cust = nlapiGetFieldValue('entity');//仕入先 	
	var currency = nlapiGetFieldValue('currency');//jpy
	
	var fi = new Array();
	fi.push(["custrecord_djkk_buy_currence","anyof",nlapiGetFieldValue('currency')]);
	fi.push("AND");
	fi.push(["custrecord_djkk_buy_price.custrecord_djkk_buy_start_date","onorbefore",nlapiGetFieldValue('trandate')]);
	fi.push("AND");
	fi.push(["custrecord_djkk_buy_price.custrecord_djkk_end_date_price_detailed","onorafter",nlapiGetFieldValue('trandate')]);
	fi.push("AND");
	fi.push(["custrecord_djkk_buy_price.custrecord_djkk_buy_detailed_itemcode","anyof",itemId]);
	fi.push("AND");
	
	var _priceId = null;
	//LS納品先の価格表コード取得不要
//	if(!isEmpty(delivery)){
//		_priceId = nlapiLookupField('customrecord_djkk_delivery_destination', delivery, 'custrecord_djkk_price_code')		
//	}
	if(!isEmpty(cust) && isEmpty(_priceId)){
		_priceId = nlapiLookupField('vendor', cust, 'custentity_djkk_buy_price_code');
	}
	
	if(!isEmpty(_priceId)){
		var priceObj = nlapiLoadRecord('customrecord_djkk_buy_price_list', _priceId);
		var name = priceObj.getFieldValue('custrecord_djkk_id');
		fi.push(["custrecord_djkk_id","is",name]);
	}else{
		return null;
	}
	
	
	
	var customrecord_djkk_price_listSearch = nlapiSearchRecord("customrecord_djkk_buy_price_list",null,
			[
			 fi
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_buy_price_quantity","CUSTRECORD_DJKK_BUY_PRICE",null), 
			   new nlobjSearchColumn("custrecord_djkk_buy_detailed_quantity","CUSTRECORD_DJKK_BUY_PRICE",null).setSort(true),
			   new nlobjSearchColumn("custrecord_djkk_buy_end_date","CUSTRECORD_DJKK_BUY_PRICE",null),
			   new nlobjSearchColumn("custrecord_djkk_buy_detailed_price","CUSTRECORD_DJKK_BUY_PRICE",null)
			   
			]
			);
	
	if(!isEmpty(customrecord_djkk_price_listSearch)){
			if(!isEmpty(customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_buy_detailed_quantity","CUSTRECORD_DJKK_BUY_PRICE",null))){
				if(Number(itemNum)<Number(customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_buy_detailed_quantity","CUSTRECORD_DJKK_BUY_PRICE",null))){
					return customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_buy_detailed_price","CUSTRECORD_DJKK_BUY_PRICE",null);
				}else{
					return customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_buy_price_quantity","CUSTRECORD_DJKK_BUY_PRICE",null);
				}
			}
	}else{
		return null;
	}
	
}




