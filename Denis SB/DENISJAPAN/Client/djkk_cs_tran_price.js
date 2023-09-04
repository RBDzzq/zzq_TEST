/**
 * 価格表トランザクション共通
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/22     
 *
 */
function pruserEventBeforeLoad(type, form, request) {
	if (type != 'view') {
        form.setScript('customscript_cs_tran_price');
		form.addButton('custpage_resetpricelist', '価格表再計算','resetpricelist()');
	}
}
		
function prclientFieldChanged(type, name, linenum){
	var recordType =  nlapiGetRecordType();
		
	//価格設定(行)
	if(type == 'item' && (name == 'item' || name == 'quantity' )){
	    // DENISJAPANDEV-1378 zheng 20230225 start
        if (name == 'item') {
            postSourceFlg = true;
        }
        // DENISJAPANDEV-1378 zheng 20230225 end
		var sub = nlapiGetFieldValue('subsidiary');
		if(!isEmpty(sub) &&!isEmpty(nlapiGetFieldValue('entity')) && !isEmpty(nlapiGetFieldValue('currency')) && !isEmpty(nlapiGetFieldValue('trandate')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'item')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'quantity'))){

			var price = null;

			if(sub == SUB_SCETI || sub == SUB_DPKK){
				

				price = setlinepriceFromDelCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));

				
			}else if (sub == SUB_NBKK || sub == SUB_ULKK){

				price = setlinepriceFromCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
//				console.log('price'+'  '+price)
			}
			//以外場合対応しない
			//20221024 changed by zhou
			if(!isEmpty(price)){		
				nlapiSetCurrentLineItemValue(type, 'rate',price)
			}
			//end
		}
	}
	if(name == 'entity'){
		document.getElementById("custpage_resetpricelist").onclick();
	}
}
function resetpricelist(){
	var count=nlapiGetLineItemCount('item');
	var sub = nlapiGetFieldValue('subsidiary');
	for(var i=1;i<count+1;i++){
		nlapiSelectLineItem('item', i);
		if(!isEmpty(sub) &&!isEmpty(nlapiGetFieldValue('entity')) && !isEmpty(nlapiGetFieldValue('currency')) && !isEmpty(nlapiGetFieldValue('trandate')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'item')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'quantity'))){

			var price = null;

			if(sub == SUB_SCETI || sub == SUB_DPKK){
				

				price = setlinepriceFromDelCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));

				
			}else if (sub == SUB_NBKK || sub == SUB_ULKK){

				price = setlinepriceFromCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
			}
			//以外場合対応しない
			//20221024 changed by zhou
			if(!isEmpty(price)){		
				nlapiSetCurrentLineItemValue('item', 'rate',price);
				nlapiCommitLineItem('item');
			}
			//end
		}	
	}
}
//LS価格表取得
function setlinepriceFromDelCust(itemNum , itemId){
	debugger;
	var cust = nlapiGetFieldValue('entity');	
	var delivery = nlapiGetFieldValue('custbody_djkk_delivery_destination');
	var currency = nlapiGetFieldValue('currency');
	
	var fi = new Array();
	fi.push(["custrecord_djkk_pl_price_currency","anyof",nlapiGetFieldValue('currency')]);
	fi.push("AND");
	fi.push(["custrecord_djkk_pldt_pl.custrecord_djkk_pl_startdate","onorbefore",nlapiGetFieldValue('trandate')]);
	fi.push("AND");
	fi.push(["custrecord_djkk_pldt_pl.custrecord_djkk_pl_enddate_calculation","onorafter",nlapiGetFieldValue('trandate')]);
	fi.push("AND");
	fi.push(["custrecord_djkk_pldt_pl.custrecord_djkk_pldt_itemcode","anyof",itemId]);
	fi.push("AND");
	
	var _priceId = null;
	//LS納品先の価格表コード取得
	if(!isEmpty(delivery)){
		_priceId = nlapiLookupField('customrecord_djkk_delivery_destination', delivery, 'custrecord_djkk_price_code')		
	}
	if(!isEmpty(cust) && isEmpty(_priceId)){
		_priceId = nlapiLookupField('customer', cust, 'custentity_djkk_pl_code');
	}
	
	if(!isEmpty(_priceId)){
		fi.push(["custrecord_djkk_pldt_pl.custrecord_djkk_pldt_pl","anyof",_priceId]);
	}else{
		return null;
	}
	
	var customrecord_djkk_price_listSearch = nlapiSearchRecord("customrecord_djkk_price_list",null,
			[
			 fi
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_pldt_cod_price","CUSTRECORD_DJKK_PLDT_PL",null), 
			   new nlobjSearchColumn("custrecord_djkk_pldt_quantity","CUSTRECORD_DJKK_PLDT_PL",null).setSort(true),
			   new nlobjSearchColumn("custrecord_djkk_pl_enddate","CUSTRECORD_DJKK_PLDT_PL",null),
			   new nlobjSearchColumn("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL",null)
			   
			]
			);
	
	

	if(!isEmpty(customrecord_djkk_price_listSearch)){
		
		for(var i = 0 ; i < customrecord_djkk_price_listSearch.length ; i++){
			if(!isEmpty(customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_quantity","CUSTRECORD_DJKK_PLDT_PL"))){
				if(Number(customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_quantity","CUSTRECORD_DJKK_PLDT_PL")) <= Number(itemNum)){
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_pricing',customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL"))
					return customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_cod_price","CUSTRECORD_DJKK_PLDT_PL");
				}
			}
		}
		
		//定価設定
		nlapiSetCurrentLineItemValue('item', 'custcol_djkk_pricing',customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL"))
		return customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL")
		
	}else{
		return null;
	}
	
}


//食品価格表取得
function setlinepriceFromCust(itemNum , itemId){
//	console.log(nlapiGetRecordType())
	var cust = nlapiGetFieldValue('entity');
	var delivery = nlapiGetFieldValue('custbody_djkk_delivery_destination');
	var currency = nlapiGetFieldValue('currency');
//	console.log('cust'+'  '+cust)
	
	var fi = new Array();
	fi.push(["custrecord_djkk_pl_price_currency_fd","anyof",nlapiGetFieldValue('currency')]);
	fi.push("AND");
	fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pl_startdate_fd","onorbefore",nlapiGetFieldValue('trandate')]);
	fi.push("AND");
	fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pl_enddate_calculationfd","onorafter",nlapiGetFieldValue('trandate')]);
	fi.push("AND");
	fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pldt_itemcode_fd","anyof",itemId]);
	
	
	var _priceId = null;
	//食品場合納品先の価格表コード取得不要
//	if(!isEmpty(delivery)){
//		_priceId = nlapiLookupField('customrecord_djkk_delivery_destination', delivery, 'custrecord_djkk_price_code_fd')		
//	}
	if(!isEmpty(cust) && isEmpty(_priceId)){
		_priceId = nlapiLookupField('customer', cust, 'custentity_djkk_pl_code_fd');
	}
	
	if(!isEmpty(_priceId)){
		fi.push("AND");
		fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pldt_pl_fd","anyof",_priceId]);
	}else{
		return null;
	}
	
	var customrecord_djkk_price_listSearch = nlapiSearchRecord("customrecord_djkk_price_list_fd",null,
			[
			 fi
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_pldt_cod_price_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null), 
			   new nlobjSearchColumn("custrecord_djkk_pldt_quantity_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null).setSort(true),
			   new nlobjSearchColumn("custrecord_djkk_pl_enddate_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null),
			   new nlobjSearchColumn("custrecord_djkk_pldt_saleprice_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null)
			   
			]
			);
	
	

	if(!isEmpty(customrecord_djkk_price_listSearch)){
		
		for(var i = 0 ; i < customrecord_djkk_price_listSearch.length ; i++){
			if(!isEmpty(customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_quantity_fd","CUSTRECORD_DJKK_PLDT_PL_FD"))){
				if(Number(customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_quantity_fd","CUSTRECORD_DJKK_PLDT_PL_FD")) <= Number(itemNum)){
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_pricing',customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL"))
					return customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_cod_price_fd","CUSTRECORD_DJKK_PLDT_PL_FD");
				}
			}
		}
		
		nlapiSetCurrentLineItemValue('item', 'custcol_djkk_pricing',customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL"))
		return customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_pldt_saleprice_fd","CUSTRECORD_DJKK_PLDT_PL_FD")
		
	}else{
		return null;
	}
	
}

//DENISJAPANDEV-1378 zheng 20230225 start
var postSourceFlg = true;
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
    //価格設定(行)
    if(type == 'item' && name == 'item' && postSourceFlg){
        
        var sub = nlapiGetFieldValue('subsidiary');
        if(!isEmpty(sub) &&!isEmpty(nlapiGetFieldValue('entity')) && !isEmpty(nlapiGetFieldValue('currency')) && !isEmpty(nlapiGetFieldValue('trandate')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'item')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'quantity'))){

            var price = null;
            postSourceFlg = false;
            
            if(sub == SUB_SCETI || sub == SUB_DPKK){
                
                price = setlinepriceFromDelCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
            }else if (sub == SUB_NBKK || sub == SUB_ULKK){

                price = setlinepriceFromCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
            }
            //以外場合対応しない
            //20221024 changed by zhou
            if(!isEmpty(price)){
                nlapiSetCurrentLineItemValue(type, 'rate',price)
            }
            //end
        }
    }
}
//DENISJAPANDEV-1378 zheng 20230225 end