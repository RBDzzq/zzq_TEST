
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
function clientFieldChanged(type, name, linenum) {
		
	// DJ_納品先/顧客
	if(name == 'custbody_djkk_delivery_destination'||name == 'entity'){
		
	// add by YUAN 2020/03/01 DENISJAPAN-173?@
	// DJ_納品先
	if (name == 'custbody_djkk_delivery_destination') {
		var destinationID = nlapiGetFieldValue('custbody_djkk_delivery_destination');
		if (!isEmpty(destinationID)) {
			var destinationRecord = nlapiLookupField('customrecord_djkk_delivery_destination', destinationID,['custrecord_djkk_customer','custrecord_djkk_sales','custrecord_djkk_prefectures','custrecord_djkk_municipalities','custrecord_djkk_delivery_residence','custrecord_djkk_delivery_residence2','custrecord_djkk_language_napin']);
			var customerID = destinationRecord.custrecord_djkk_customer;
			var salesID = destinationRecord.custrecord_djkk_sales;
			if (!isEmpty(customerID)) {
				nlapiSetFieldValue('entity', customerID,true,true);
			}
			
			if (!isEmpty(salesID)) {
				nlapiSetFieldValue('salesrep', salesID,false,true);
			}
			var cust=nlapiGetFieldValue('customform');
			
			// LS|承認
			if (cust == '121' || cust == '133') {
				var prefectures = destinationRecord.custrecord_djkk_prefectures;
				var municipalities = destinationRecord.custrecord_djkk_municipalities;
				var deliveryResidence = destinationRecord.custrecord_djkk_delivery_residence;
				var deliveryResidence2 = destinationRecord.custrecord_djkk_delivery_residence2;
				var language = destinationRecord.custrecord_djkk_language_napin;
				var str2 = prefectures + municipalities + deliveryResidence+ deliveryResidence2;
				nlapiSetFieldValue('custbody_djkk_delivery_address', str2,false, true);
				nlapiSetFieldValue('custbody_djkk_language', language, false,true);
			}
		}else{
			nlapiSetFieldValue('custbody_djkk_delivery_address', '',false, true);
			nlapiSetFieldValue('custbody_djkk_language', '', false,true);
		}
	}
	// add END
	
	//add by zhou 20220808 U732
	if(name == 'entity'){
		var entityId = nlapiGetFieldValue('entity');
		if (!isEmpty(entityId)) {
			
			// add by YUAN 2020/02/18 DENISJAPAN-162
			var cust=nlapiGetFieldValue('customform'); 
			var customerR = nlapiLookupField('customer', entityId,['custentity_djkk_customer_type','custentity_djkk_product_category_scetikk','custentity_djkk_product_category_jp','custentity_djkk_activity','custentity_4392_useids', 'custentity_djkk_language']);
			if (customerR.custentity_djkk_customer_type == '1' || customerR.custentity_djkk_customer_type == '2') {
				alert('リード顧客と潜在顧客は選択できません。');
				nlapiSetFieldValue('entity', '',true,true);
			}else{
				
			// add END
			var g1=customerR.custentity_djkk_product_category_scetikk;
			var g2=customerR.custentity_djkk_product_category_jp;
			nlapiSetFieldValue('custbody_djkk_customer_group', isEmpty(g1)?g2:g1, false,true);
			
		// LS|承認
		if(cust == '121'||cust == '133'){

			var g3 = customerR.custentity_djkk_activity;
			nlapiSetFieldValue('department', g3, false,true);
			var g4 = customerR.custentity_4392_useids;
			if(g4 == 'T'){
				nlapiSetFieldValue('custbody_4392_includeids','T', false,true);
			}
					
			//20220812  U768  by song start				
			var destination = nlapiGetFieldValue('custbody_djkk_delivery_destination');
			//end						
				if(isEmpty(destination)){
					nlapiSetFieldValue('custbody_djkk_language', customerR.custentity_djkk_language, false,true);
			       }
				var customerSearch = nlapiSearchRecord("customer",null,
						[
						   ["isdefaultbilling","is","T"], 
						   "AND", 
						   ["internalid","anyof",entityId]
						], 
						[
						   new nlobjSearchColumn("custrecord_djkk_address_state","Address",null), 
						   new nlobjSearchColumn("city","Address",null), 
						   new nlobjSearchColumn("address1","Address",null), 
						   new nlobjSearchColumn("address2","Address",null), 
						   new nlobjSearchColumn("address3","Address",null), 
						   new nlobjSearchColumn("addressee","Address",null)
						]
						);
				if (!isEmpty(customerSearch)) {
					var addressState = customerSearch[0].getValue("custrecord_djkk_address_state","Address",null);
					var city = customerSearch[0].getValue("city","Address",null);
					var address1 = customerSearch[0].getValue("address1","Address",null);
					var address2 = customerSearch[0].getValue("address2","Address",null);
					var address3 = customerSearch[0].getValue("address3","Address",null);
					var addressee = customerSearch[0].getValue("addressee","Address",null);
					var str = ''
					str += ''+addressState+' '+city+' '+address1+' '+address2+' '+address3+' '+addressee+'';
					nlapiSetFieldValue('custbody_djkk_customer_address', str, false,true);
				}
			}
		}
	  }else{
		  nlapiSetFieldValue('custbody_djkk_customer_group', '', false,true);
		  nlapiSetFieldValue('department', '', false,true);
		  nlapiSetFieldValue('custbody_4392_includeids','F', false,true);
		  nlapiSetFieldValue('custbody_djkk_language', '', false,true);
		  nlapiSetFieldValue('custbody_djkk_customer_address', '', false,true);
	  }
	}	
	}else if(type='item'){
		
		// By LIU 2022/01/24
		if (name == 'item') {
			var deliveryDate = nlapiGetFieldValue('custbody_djkk_delivery_date');
			var shipdate = nlapiGetFieldValue('shipdate');
				
			if(!isEmpty(deliveryDate)){
				nlapiSetCurrentLineItemValue('item', 'custcol_djkk_delivery_date', deliveryDate, false);
			}
				
			if(!isEmpty(shipdate)){
				nlapiSetCurrentLineItemValue('item', 'custcol_djkk_ship_date', shipdate, false);
			}
			
			// add by YUAN 2020/03/09 DENISJAPAN-184
			 if (!isEmpty(nlapiGetFieldValue('location'))&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
			 nlapiSetCurrentLineItemValue('item', 'location',nlapiGetFieldValue('location'));
			 }
			 
//			 if (isEmpty(nlapiGetFieldValue('location'))
//			 && !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
//			 nlapiSetCurrentLineItemValue('item', 'item', null, false);
//			 alert('アイテムを選択する前に、場所を入力する必要があります');
//			 }		
		}
		
		// by LIU 2022/01/12
		if (name == 'units' || name == 'quantity') {
			
			var itemId = nlapiGetCurrentLineItemValue('item', 'item');

			// 数量
			var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');

			// DJ_入数
			var unitname = nlapiGetCurrentLineItemText('item', 'units');
			var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
			
			if(!isEmpty(quantity) && !isEmpty(perunitQuantity) && !isEmpty(itemId)){
				
				// DJ_入り数(入り目)
				var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity')
	          
				if(!isEmpty(itemPerunitQuantity)){
					// DJ_基本数量
					var conversionRate = quantity * perunitQuantity;
					
					// DJ_ケース数
					var floor = Math.floor(conversionRate / itemPerunitQuantity);
					var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
					
					// DJ_バラ数
					var djQuantity = (conversionRate - caseQuantity * itemPerunitQuantity).toFixed(2);
					
					// DJ_基本数量
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_conversionrate',conversionRate);
					
					// DJ_ケース数
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_casequantity',caseQuantity);
					
					// DJ_バラ数
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_quantity',djQuantity);
					
					// DJ_入数
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity',itemPerunitQuantity);
				}
			}
		}
				 
		if (name == 'location') {			
			nlapiSetCurrentLineItemValue('item', 'inventorylocation',nlapiGetCurrentLineItemValue('item', 'location'));
		}
		
		if (name == 'inventorylocation') {
			if (isEmpty(nlapiGetCurrentLineItemValue('item', 'inventorylocation'))&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
				nlapiSetCurrentLineItemValue('item', 'inventorylocation',nlapiGetCurrentLineItemValue('item', 'location'), false);

			}
			if (nlapiGetCurrentLineItemValue('item', 'location') != nlapiGetCurrentLineItemValue('item', 'inventorylocation')) {
				nlapiSetCurrentLineItemValue('item', 'location',nlapiGetCurrentLineItemValue('item', 'inventorylocation'));
			}
		}
		// add end
		
	}else{
		
		if(name == 'custbody_djkk_location'){
			var customform = nlapiGetFieldValue('customform');
			
			// 食品
			if(customform == '175'){
				var locationValue = nlapiGetFieldValue('custbody_djkk_location');
				if(!isEmpty(locationValue)){
					nlapiSetFieldValue('location', locationValue,true,true);
				}
			}
		}
		
		if (name == 'location') {
			var locationId = nlapiGetFieldValue('location');

			if (!isEmpty(locationId)) {
				var locationRecord = nlapiLoadRecord('location', locationId);
				var loactionAddress = locationRecord.getFieldValue('mainaddress_text');
				if (!isEmpty(loactionAddress)) {
					nlapiSetFieldValue('custbody_djkk_location_address',loactionAddress, false,true);
				} else {
					nlapiSetFieldValue('custbody_djkk_location_address', '', false,true);
				}
			} else {
				nlapiSetFieldValue('custbody_djkk_location_address', '', false,true);
			}

			// // add by YUAN 2020/03/09 DENISJAPAN-184
			 var count = nlapiGetLineItemCount('item');
			 for (var i = 1; i < count + 1; i++) {
			 nlapiSelectLineItem('item', i);
			 if (!isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
			 nlapiSetCurrentLineItemValue('item', 'location', locationId,
			 true);
			 nlapiCommitLineItem('item');
			 }
			 }
			// // add end
		}
	

	//2022/03/28 change by ycx 顧客 DJ_支払条件 支払条件（締め日無し) start
	if(name == 'custbody_djkk_payment_conditions'){
		var subsidiary = nlapiGetFieldValue('subsidiary');
		if(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK ){
		var conditionsValue = nlapiGetFieldValue('custbody_djkk_payment_conditions');
		if(conditionsValue == 2){
			nlapiSetFieldValue('terms',7,false,true);
			}else if(conditionsValue == 1){
			nlapiSetFieldValue('terms',10,false,true);
			}else{
			nlapiSetFieldValue('terms','',false,true);	
			}
	 }	  
	}
	//end
	
	if (name == 'custbody_djkk_reserved_exchange_rate_s') {
		var  rateid=nlapiGetFieldValue('custbody_djkk_reserved_exchange_rate_s');		
		var rate = '';
		if(!isEmpty(rateid)){
		rate =nlapiLookupField('customrecord_djkk_reserved_exchange_rate',rateid,'custrecord_djkk_reserved_exchange_rate');
		}
		nlapiSetFieldValue('exchangerate', rate, false,true);
	}
		
		if(name == 'custbody_djkk_delivery_date'||name == 'shipdate'){
			
			var delivery_date = nlapiGetFieldValue('custbody_djkk_delivery_date');
			var shipdate = nlapiGetFieldValue('shipdate');
				var itemCount = nlapiGetLineItemCount('item');
				for (var i = 1; i < itemCount + 1; i++) {
					nlapiSetLineItemValue('item', 'custcol_djkk_delivery_date', i, delivery_date);
					nlapiSetLineItemValue('item', 'custcol_djkk_ship_date', i, shipdate);
				}			
		 }
	}	
}