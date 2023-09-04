/**
 * 見積のclient
 * 
 * Version    Date            Author           Remarks
 * 1.00      2021/07/09        YUAN             新規作成 
 *
 */
function clientPageInit(type) {
	//CH509
	if (type == 'create') {
		//nlapiSetFieldValue('entity', '');
		var subsidary= nlapiGetFieldValue('subsidiary')
		if(subsidary == SUB_NBKK){
			nlapiSetFieldValue('custbody_djkk_estimate_excel_type', 1, false, true);
		}else if(subsidary == SUB_ULKK){
			nlapiSetFieldValue('custbody_djkk_estimate_excel_type', 4, false, true);
		}
	}
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
	try {
		if(name=='entity'){
			var entity=nlapiGetFieldValue('entity');
			if(!isEmpty(entity)){
				var entitytype=nlapiLookupField('customer', entity, 'custentity_djkk_customer_type');
				if(entitytype!='2'&&entitytype!='3'){
					alert('リード顧客は選択できません。');
					nlapiSetFieldValue('entity', null, false, true);
				}
				//20230621 add by zhou CH636 start
				if(nlapiGetFieldValue('customform') == '157' && nlapiGetFieldValue('subsidiary') == SUB_NBKK){
					nlapiSetFieldValue('custbody_djkk_estimate_yukou_kikan',1);
					nlapiSetFieldValue('custbody_djkk_estimate_pay_conditons',4);
					nlapiSetFieldValue('custbody_djkk_estimate_nouhin_date',1);
					nlapiSetFieldValue('custbody_djkk_estimate_po_conditon_c',1);
					nlapiSetFieldValue('custbody_djkk_estimate_po_conditon_d',1);
				}else if(nlapiGetFieldValue('customform') == '157' && nlapiGetFieldValue('subsidiary') == SUB_ULKK){
					nlapiSetFieldValue('custbody_djkk_estimate_yukou_kikan',8);
					nlapiSetFieldValue('custbody_djkk_estimate_pay_conditons',9);
					nlapiSetFieldValue('custbody_djkk_estimate_nouhin_date',3);
					nlapiSetFieldValue('custbody_djkk_estimate_po_conditon_c',3);
					nlapiSetFieldValue('custbody_djkk_estimate_po_conditon_d',2);
				}
				//20230621 add by zhou CH636 end
			}
		}	
	} catch (e) {
        
    }
	  if (type == 'item'){
		  if(name == 'item'){
			  var itemId = nlapiGetCurrentLineItemValue('item', 'item');
			  if (!itemId) {
			      return;
			  }
			  var itemRecord = nlapiLookupField('item', itemId, ['custitem_djkk_perunitquantity','custitem_djkk_item_abbreviation_name']);
			  var itemPerunitQuantity = itemRecord.custitem_djkk_perunitquantity; // DJ_入り数(入り目)
			  var itemAbbreviation = itemRecord.custitem_djkk_item_abbreviation_name; //DJ_規格
			  if(!isEmpty(itemPerunitQuantity)){
					// DJ_入数
				  nlapiSetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity',
						  itemPerunitQuantity);
			  }	
			  if(!isEmpty(itemAbbreviation)){
					// //DJ_規格
				  nlapiSetCurrentLineItemValue('item', 'custcol_djkk_specifications',
						  itemAbbreviation);
			  }	
				// 数量
			  var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');
			// CH677 zheng 20230629 start
				// DJ_入数
//			  var unitname = nlapiGetCurrentLineItemText('item', 'units');
//			  var unitId = nlapiGetCurrentLineItemValue('item', 'units');
//	            var crVal = '';
//	            if (!isEmpty(unitId)) {
//	                var itemUnitsTypeId = nlapiLookupField('item',itemId,'unitstype');
//	                if (itemUnitsTypeId) {
//	                    crVal = getConversionrateAbbreviationNew(itemUnitsTypeId, unitId);
//	                }
//	            }
//			  var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
//			  var perunitQuantity = !isEmpty(crVal) ? crVal : '';
			// CH677 zheng 20230629 end
			  var cust = nlapiGetFieldValue('customform');
			  //20230109 add by zhou CH248 start
			  if(cust == '157'){
				  var reference = nlapiLookupField('item', itemId, 'custitem_djkk_reference_sales_price')//item - DJ_希望小売価格
				// DJ_基本数量
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_reference_sales_price',
							reference);//DJ_参考販売価格
			  }
		  }
		  //end
		  // by LIU 2022/01/12
		  if(name == 'units' || name == 'quantity'){
		      var itemId = nlapiGetCurrentLineItemValue('item', 'item');
		      if (!itemId) {
                  return;
              }
              var itemRecord = nlapiLookupField('item', itemId, ['custitem_djkk_perunitquantity','custitem_djkk_item_abbreviation_name']);
		      // 数量
              var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');
              var itemPerunitQuantity = itemRecord.custitem_djkk_perunitquantity; // DJ_入り数(入り目)
		   // CH677 zheng 20230629 start
              // DJ_入数
//          var unitname = nlapiGetCurrentLineItemText('item', 'units');
            var unitId = nlapiGetCurrentLineItemValue('item', 'units');
              var crVal = '';
              if (!isEmpty(unitId)) {
                  if (itemId) {
                      var itemUnitsTypeId = nlapiLookupField('item',itemId,'unitstype');
                      if (itemUnitsTypeId) {
                          crVal = getConversionrateAbbreviationNew(itemUnitsTypeId, unitId);
                      }   
                  }
              }
//          var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
            var perunitQuantity = !isEmpty(crVal) ? crVal : '';
          // CH677 zheng 20230629 end
			  if(!isEmpty(quantity) && !isEmpty(perunitQuantity) && !isEmpty(itemId)){
					
					// DJ_入り数(入り目)
//					var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity')
					  
					if(!isEmpty(itemPerunitQuantity)){
						// DJ_基本数量
						var conversionRate = quantity * perunitQuantity;
						
						// DJ_ケース数
						var floor = Math.floor(conversionRate / itemPerunitQuantity);
						var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
						
						// DJ_バラ数
						var djQuantity = conversionRate - caseQuantity * itemPerunitQuantity;
						
						// DJ_基本数量
						nlapiSetCurrentLineItemValue('item', 'custcol_djkk_conversionrate',
							conversionRate);
						// DJ_ケース数
						nlapiSetCurrentLineItemValue('item', 'custcol_djkk_casequantity',
							caseQuantity);
						// DJ_バラ数
						nlapiSetCurrentLineItemValue('item', 'custcol_djkk_quantity',
							djQuantity);
					}
				} 
			}
	    }
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


/*
 * 修理品PDF
 * */
function repairestimatePDF(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair','customdeploy_djkk_sl_repair');
	theLink+='&repairestimateid='+nlapiGetRecordId();
	window.open(theLink);		 
}



