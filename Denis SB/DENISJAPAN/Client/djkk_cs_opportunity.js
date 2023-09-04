/**
 * ���k��client
 * 
 * Version    Date            Author           Remarks
 * 1.00      2021/01/28        YUAN             �V�K�쐬 
 *
 */


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

	//�ӂ��폜����@��肠��ΘA�����Ă�������
//	//���i�ݒ�(�s)
//	if(type == 'item' && (name == 'item' || name == 'quantity' )){
//		var sub = nlapiGetFieldValue('subsidiary')
//		if(!isEmpty(sub) &&!isEmpty(nlapiGetFieldValue('entity')) && !isEmpty(nlapiGetFieldValue('currency')) && !isEmpty(nlapiGetFieldValue('trandate')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'item')) && !isEmpty( nlapiGetCurrentLineItemValue('item', 'quantity'))){
//
//			var price = null;
//
//			if(sub == SUB_NBKK || sub == SUB_DPKK){
//				//LS����ID�Œ�l2 5
//				price = setlinepriceFromDelCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
//				
//				//LS�ꍇ�[�i�承�i�\��������������Ă��Ȃ��ꍇ�A�ڋq����ēx�擾����
//				if(isEmpty(price)){
//					price = setlinepriceFromCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
//				}
//				
//			}else if (sub == SUB_SCETI || sub == SUB_ULKK){
//				//�H�i����ID�Œ�l3�@4
//				price = setlinepriceFromCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
//			}
//			//�ȊO�ꍇ�Ή����Ȃ�
//
//			if(!isEmpty(price)){		
//				nlapiSetCurrentLineItemValue(type, 'rate',price)
//			}
//		}
//	}
	
	// by LIU 2022/01/12
	if (type == 'item' && (name == 'units' || name == 'quantity')) {

		var itemId = nlapiGetCurrentLineItemValue('item', 'item');

		// ����
		var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');

		// DJ_����
		//20230704 changed by zhou start CH677
//		var unitname = nlapiGetCurrentLineItemText('item', 'units');
//		var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
        var unitId = nlapiGetCurrentLineItemValue('item', 'units');
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
			
			// DJ_���萔(�����)
			var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity')
          
			if(!isEmpty(itemPerunitQuantity)){
				// DJ_��{����
				var conversionRate = quantity * perunitQuantity;
				
				// DJ_�P�[�X��
				var floor = Math.floor(conversionRate / itemPerunitQuantity);
				var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
				
				// DJ_�o����
				var djQuantity = conversionRate - caseQuantity * itemPerunitQuantity;
				
				// DJ_��{����
				nlapiSetCurrentLineItemValue('item', 'custcol_djkk_conversionrate',
						conversionRate);
				// DJ_�P�[�X��
				nlapiSetCurrentLineItemValue('item', 'custcol_djkk_casequantity',
						caseQuantity);
				// DJ_�o����
				nlapiSetCurrentLineItemValue('item', 'custcol_djkk_quantity',
						djQuantity);
				// DJ_����
				nlapiSetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity',
						itemPerunitQuantity);
			}
		}
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
	if (type == 'item'&&name == 'item' && !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
		nlapiSetCurrentLineItemValue('item', 'quantity',nlapiGetCurrentLineItemValue('item', 'quantity'),true,true);
	}
}

//���L�͌ӂ��폜���܂����B��肠��ΘA�����Ă�������
//function setlinepriceFromDelCust(itemNum , itemId){
//	
//	var cust = nlapiGetFieldValue('entity');
//	var delivery = nlapiGetFieldValue('custbody_djkk_delivery_destination');
//	var currency = nlapiGetFieldValue('currency');
//	
//	var fi = new Array();
//	fi.push(["custrecord_djkk_pl_price_currency","anyof",nlapiGetFieldValue('currency')]);
//	fi.push("AND");
//	fi.push(["custrecord_djkk_pldt_pl.custrecord_djkk_pl_startdate","onorbefore",nlapiGetFieldValue('trandate')]);
//	fi.push("AND");
//	fi.push(["custrecord_djkk_pldt_pl.custrecord_djkk_pl_enddate_calculation","onorafter",nlapiGetFieldValue('trandate')]);
//	fi.push("AND");
//	fi.push(["custrecord_djkk_pldt_pl.custrecord_djkk_pldt_itemcode","anyof",itemId]);
//	fi.push("AND");
//	
//	var _priceId = null;
//	if(!isEmpty(delivery)){
//		_priceId = nlapiLookupField('customrecord_djkk_delivery_destination', delivery, 'custrecord_djkk_price_code')		
//	}
//	if(!isEmpty(cust) && isEmpty(_priceId)){
//		_priceId = nlapiLookupField('customer', cust, 'custentity_djkk_pl_code');
//	}
//	
//	if(!isEmpty(_priceId)){
//		fi.push(["custrecord_djkk_pldt_pl.custrecord_djkk_pldt_pl","anyof",_priceId]);
//	}else{
//		return null;
//	}
//	
//	var customrecord_djkk_price_listSearch = nlapiSearchRecord("customrecord_djkk_price_list",null,
//			[
//			 fi
//			], 
//			[
//			   new nlobjSearchColumn("custrecord_djkk_pldt_cod_price","CUSTRECORD_DJKK_PLDT_PL",null), 
//			   new nlobjSearchColumn("custrecord_djkk_pldt_quantity","CUSTRECORD_DJKK_PLDT_PL",null).setSort(true),
//			   new nlobjSearchColumn("custrecord_djkk_pl_enddate","CUSTRECORD_DJKK_PLDT_PL",null),
//			   new nlobjSearchColumn("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL",null)
//			   
//			]
//			);
//	
//	
//
//	if(!isEmpty(customrecord_djkk_price_listSearch)){
//		
//		for(var i = 0 ; i < customrecord_djkk_price_listSearch.length ; i++){
//			if(!isEmpty(customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_quantity","CUSTRECORD_DJKK_PLDT_PL"))){
//				if(Number(customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_quantity","CUSTRECORD_DJKK_PLDT_PL")) <= Number(itemNum)){
//					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_pricing',customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL"))
//					return customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_cod_price","CUSTRECORD_DJKK_PLDT_PL");
//				}
//			}
//		}
//		
//		//�艿�ݒ�
//		nlapiSetCurrentLineItemValue('item', 'custcol_djkk_pricing',customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL"))
//		return customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL")
//		
//	}else{
//		return null;
//	}
//	
//}
//
//function setlinepriceFromCust(itemNum , itemId){
//	
//	var cust = nlapiGetFieldValue('entity');
//	var delivery = nlapiGetFieldValue('custbody_djkk_delivery_destination');
//	var currency = nlapiGetFieldValue('currency');
//	
//	var fi = new Array();
//	fi.push(["custrecord_djkk_pl_price_currency_fd","anyof",nlapiGetFieldValue('currency')]);
//	fi.push("AND");
//	fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pl_startdate_fd","onorbefore",nlapiGetFieldValue('trandate')]);
//	fi.push("AND");
//	fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pl_enddate_calculationfd","onorafter",nlapiGetFieldValue('trandate')]);
//	fi.push("AND");
//	fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pldt_itemcode_fd","anyof",itemId]);
//	
//	
//	var _priceId = null;
//	//�H�i�ꍇ�[�i��̉��i�\�R�[�h�擾�s�v
////	if(!isEmpty(delivery)){
////		_priceId = nlapiLookupField('customrecord_djkk_delivery_destination', delivery, 'custrecord_djkk_price_code_fd')		
////	}
//	if(!isEmpty(cust) && isEmpty(_priceId)){
//		_priceId = nlapiLookupField('customer', cust, 'custentity_djkk_pl_code_fd');
//	}
//	
//	if(!isEmpty(_priceId)){
//		fi.push("AND");
//		fi.push(["custrecord_djkk_pldt_pl_fd.custrecord_djkk_pldt_pl_fd","anyof",_priceId]);
//	}else{
//		return null;
//	}
//	
//	var customrecord_djkk_price_listSearch = nlapiSearchRecord("customrecord_djkk_price_list_fd",null,
//			[
//			 fi
//			], 
//			[
//			   new nlobjSearchColumn("custrecord_djkk_pldt_cod_price_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null), 
//			   new nlobjSearchColumn("custrecord_djkk_pldt_quantity_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null).setSort(true),
//			   new nlobjSearchColumn("custrecord_djkk_pl_enddate_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null),
//			   new nlobjSearchColumn("custrecord_djkk_pldt_saleprice_fd","CUSTRECORD_DJKK_PLDT_PL_FD",null)
//			   
//			]
//			);
//	
//	
//
//	if(!isEmpty(customrecord_djkk_price_listSearch)){
//		
//		for(var i = 0 ; i < customrecord_djkk_price_listSearch.length ; i++){
//			if(!isEmpty(customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_quantity_fd","CUSTRECORD_DJKK_PLDT_PL_FD"))){
//				if(Number(customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_quantity_fd","CUSTRECORD_DJKK_PLDT_PL_FD")) <= Number(itemNum)){
//					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_pricing',customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL"))
//					return customrecord_djkk_price_listSearch[i].getValue("custrecord_djkk_pldt_cod_price_fd","CUSTRECORD_DJKK_PLDT_PL_FD");
//				}
//			}
//		}
//		
//		nlapiSetCurrentLineItemValue('item', 'custcol_djkk_pricing',customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_pldt_saleprice","CUSTRECORD_DJKK_PLDT_PL"))
//		return customrecord_djkk_price_listSearch[0].getValue("custrecord_djkk_pldt_saleprice_fd","CUSTRECORD_DJKK_PLDT_PL_FD")
//		
//	}else{
//		return null;
//	}
//	
//}
