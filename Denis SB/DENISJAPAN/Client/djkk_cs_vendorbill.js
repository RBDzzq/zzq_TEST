/**
 * 支払請求書のclient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/10/12     CPC_苑
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
	//2022.03.29 geng U551 場所は：必須は外す。start
   //var sub = nlapiGetFieldValue('subsidiary');
  // if(sub == SUB_SCETI || sub == SUB_DPKK){
	// var location = nlapiGetField('location');
	 //location.setMandatory(false);
	   //nlobjField.prototype.setMandatory('location',false);
   //}
   //end
	//setFieldDisableType('custbody_djkk_ship_via', 'disabled');
	//20220802 add by zhou strat
	//U605
	if(type == "create"||type == "edit"||type == "copy"){
		var po = nlapiGetLineItemValue('purchaseorders', 'id',1);
		nlapiLogExecution('debug','po',po);
		if(isEmpty(po)){
			nlapiLogExecution('debug','start','start');
			po = getQueryVariable("id");
			nlapiLogExecution('debug','po',po);
		}
		// add by song 23030131 CH225 strat
		nlapiSetFieldValue('custbody_djkk_invoice_date_payment',nlapiDateToString(getSystemTime()), true, false);
		// add by song 23030131 CH225 end

		//DJ-712により外す。支払請求書画面でDJ_インコタームを外しました。
//		if(!isEmpty(po)){
//			var incotermsLocationSearch = nlapiSearchRecord("purchaseorder",null,
//	             [
//	             ["internalid","is",po]
//	             ], 
//	             [
//	              	new nlobjSearchColumn("custbody_djkk_po_incoterms_location"),
//	             ]
//	             );    
//			if(incotermsLocationSearch != null){
//			    var incotermsLocation = incotermsLocationSearch[0].getValue("custbody_djkk_po_incoterms_location");
//				nlapiLogExecution('debug','incotermsLocation',incotermsLocation)
//				nlapiSetFieldValue('custbody_djkk_incoterms_location', incotermsLocation);
//			}
//		}
		
	}
	//end
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	if(nlapiGetFieldValue('custbody_djkk_not_arrival')!='T'){
		if(isEmpty(nlapiGetFieldValue('custbody_djkk_arrival_number'))){
			if(confirm('「DJ_到着荷物番号」は入力されていませんが。保存しますか？')){
			}else{
				return false;
			}
		}
	}
	if(nlapiGetFieldValue('customform') == '168'){
		if(isEmpty(nlapiGetFieldValue('tranid'))){
			alert('仕入先の請求書番号を入力してください。')
			return false;
		}
	}
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
	//add by geng add start
	if(type == 'item' && (name == 'item' || name == 'quantity' )){
		var sub = nlapiGetFieldValue('subsidiary')
		if(!isEmpty(sub) &&!isEmpty(nlapiGetFieldValue('entity')) && !isEmpty(nlapiGetFieldValue('currency')) && !isEmpty(nlapiGetFieldValue('trandate')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'item')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'quantity'))){
			var price = null;
			if(sub == SUB_SCETI || sub == SUB_DPKK){
				price = setlinepriceFromDelCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
			}
			
			//以外場合対応しない
			if(!isEmpty(price)){		
				nlapiSetCurrentLineItemValue(type, 'rate',Number(price), false, true);
			}
		}
	}


	//add by geng add end
//20220802 add by zhou start
//U605
	if(type == 'item'&&name== 'item'){
		 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
//			var subsidiary = getRoleSubsidiary();
//			if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){ 
		var item = nlapiGetCurrentLineItemValue('item', 'item')
		nlapiLogExecution('debug','item',item);
		if (!isEmpty(item)) {
			var origin = nlapiLookupField('item', item,'custitem_djkk_origin',true);
		}
		 nlapiSetCurrentLineItemValue('item', 'custcol_djkk_origin',origin, false, true);
	   }
	}
//end
    if(name==='entity'){
	 var entity=nlapiGetFieldValue('entity');
     if(!isEmpty(entity)){
    	 var entityFlag=nlapiLookupField('vendor', entity, 'custentity_djkk_effective_recognition');
    	 if(entityFlag=='F'){
    		alert('仕入先は承認されていません');
    		nlapiSetFieldValue('entity', null, true, false);
    	 }
       } 
    }
    
    //ヘッダセクション変更場合明細も変更する
	if (type != 'item' && name == 'department') {
		var departmentId = nlapiGetFieldValue('department');
		var count = nlapiGetLineItemCount('item');
		for (var i = 1; i < count + 1; i++) {
			nlapiSelectLineItem('item', i);
			if (!isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
				nlapiSetCurrentLineItemValue('item', 'department',departmentId, true);
				nlapiCommitLineItem('item');
			}
		}
	}
	
}

function clientPostSourcing(type, name) {
	
	//アイテム変更場合明細のセクションを初期設定
	if (type == 'item'&&name == 'item'&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))&&nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
		nlapiSetCurrentLineItemValue('item', 'department', nlapiGetFieldValue('department'), false, true);
	}
	
//	//add by geng start
//	if(type == 'item' && name == 'item'){
//		var sub = nlapiGetFieldValue('subsidiary')
//		if(!isEmpty(sub) &&!isEmpty(nlapiGetFieldValue('entity')) && !isEmpty(nlapiGetFieldValue('currency')) && !isEmpty(nlapiGetFieldValue('trandate')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'item')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'quantity'))){
//			var price = null;
//			if(sub == SUB_SCETI || sub == SUB_DPKK){
//				price = setlinepriceFromDelCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
//			}
//			//以外場合対応しない
//			if(!isEmpty(price)){		
//				nlapiSetCurrentLineItemValue(type, 'rate',Number(price));
//			}
//		}
//	}


	//add by geng end
	
}

//add by geng start
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
		fi.push("AND");
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
		var priceMon ;
		priceMon = customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_buy_detailed_price","CUSTRECORD_DJKK_BUY_PRICE",null);
		var quantityMoney = new Array();
		for(var k=0;k<customrecord_djkk_price_listSearch.length;k++){
			var qunantity = Number(customrecord_djkk_price_listSearch[k].getValue("custrecord_djkk_buy_detailed_quantity","CUSTRECORD_DJKK_BUY_PRICE",null));
			var quantityPrice = Number(customrecord_djkk_price_listSearch[k].getValue("custrecord_djkk_buy_price_quantity","CUSTRECORD_DJKK_BUY_PRICE",null));
			quantityMoney.push({
				qunantity:qunantity,
				quantityPrice:quantityPrice
			})
//			if(!isEmpty(customrecord_djkk_price_listSearch[k].getValue("custrecord_djkk_buy_detailed_quantity","CUSTRECORD_DJKK_BUY_PRICE",null))){
//				if(Number(itemNum)<Number(customrecord_djkk_price_listSearch[k].getValue("custrecord_djkk_buy_detailed_quantity","CUSTRECORD_DJKK_BUY_PRICE",null))){
//					priceMon = customrecord_djkk_price_listSearch[k].getValue("custrecord_djkk_buy_detailed_price","CUSTRECORD_DJKK_BUY_PRICE",null);
//				}else if(Number(itemNum)>=Number(customrecord_djkk_price_listSearch[k].getValue("custrecord_djkk_buy_detailed_quantity","CUSTRECORD_DJKK_BUY_PRICE",null))){
//					priceMon = customrecord_djkk_price_listSearch[k].getValue("custrecord_djkk_buy_price_quantity","CUSTRECORD_DJKK_BUY_PRICE",null);
//				}
//			}
		}
		quantityMoney.sort(ascend);
		
		for(var a=0;a<quantityMoney.length;a++){
			
			if(a==0){
				if(itemNum<quantityMoney[a].qunantity){
					priceMon = priceMon;
				}else{
					priceMon = quantityMoney[a].quantityPrice;
				}
			}else if(a!=0 && a!=quantityMoney.length-1){
				if(itemNum>=quantityMoney[a].qunantity && itemNum<quantityMoney[a+1].qunantity){
					priceMon = quantityMoney[a].quantityPrice;
				}
			}else if(a==quantityMoney.length-1){
				if(itemNum>=quantityMoney[a].qunantity){
					priceMon = quantityMoney[a].quantityPrice;
				}
			}
			
		}
		return priceMon
	}else{
		return null;
	}
	
}
function ascend(a, b) {
    return (a.qunantity > b.qunantity) ? 1 : -1;
}
//add by geng end
