/**
 * �z����Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/07/15     CPC_��
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
//	if(nlapiGetFieldValue('customform')!='108'){
//		// �J�X�^���t�H�[��
//		nlapiSetFieldValue('customform', '108');	
//	}
	
//20220705 changed by zhou start
//U704
    var customType = nlapiGetFieldValue('customform');
    if(!isEmpty(customType)){
    	   // �H�i&LS
    	if(customType == '119'||customType == '115'){
    		nlapiSetFieldValue('shipstatus', 'C');// �X�e�[�^�X  setting
    	}
    }
//20220705 changed by zhou end	
	
	// by LIU 2022/01/12
	var itemCount = nlapiGetLineItemCount('item');
	for(var i = 1 ; i < itemCount + 1 ; i ++){
		
		//�@�Q�b�g�l
		// �A�C�e��ID
		var itemId = nlapiGetLineItemValue('item', 'item', i);
		// DJ_���萔(�����)
		var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity')
		// DJ_����
		var perunitQuantity = nlapiGetLineItemValue('item', 'custcol_djkk_perunitquantity', i);
		
		// ����
		var quantity = nlapiGetLineItemValue('item', 'quantity', i);
		
		if(!isEmpty(itemId) && !isEmpty(itemPerunitQuantity) && !isEmpty(perunitQuantity)){
			
			//�@�v�Z
			// DJ_��{����
			var conversionRate = (quantity * perunitQuantity).toFixed(2);
			// DJ_�P�[�X��
			var floor = Math.floor(conversionRate / itemPerunitQuantity);
			var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
			// DJ_�o����
			var djQuantity = (conversionRate - caseQuantity * itemPerunitQuantity).toFixed(2);
			
			// �Z�b�g�l
			// DJ_��{����
			nlapiSetLineItemValue('item', 'custcol_djkk_conversionrate', i,
					conversionRate);
			// DJ_�P�[�X��
			nlapiSetLineItemValue('item', 'custcol_djkk_casequantity', i,
					caseQuantity);
			// DJ_�o����
			nlapiSetLineItemValue('item', 'custcol_djkk_quantity', i,
					djQuantity);
			// DJ_����
			nlapiSetLineItemValue('item', 'custcol_djkk_perunitquantity', i,
					itemPerunitQuantity);
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
	
    
	var createdfrom = nlapiGetFieldValue('createdfrom');
	var ordertype = nlapiGetFieldValue('ordertype');
	
	if(!isEmpty(createdfrom) && ordertype == 'SalesOrd'){  
	 //���o�ɏ���
	var itemCount = nlapiGetLineItemCount('item');
	for(var i = 1 ; i < itemCount+1 ; i ++){
		var custody_item = nlapiGetLineItemValue('item', 'custcol_djkk_custody_item', i);
		if(custody_item=='T'){
			var cuslocation=nlapiGetLineItemValue('item', 'custcol_djkk_icl_cuslocation', i);
			if(isEmpty(cuslocation)){
				alert('�a����݌ɂ̏ꍇ�A�A�C�e���́uDJ_�a����݌ɏꏊ�v�t�B�[���h����͂���K�v������܂�');
		    	return false;
			}else{
				var flgi = nlapiLookupField('location', cuslocation, 'custrecord_djkk_stop_load')
				if(flgi == 'T'){
					alert(nlapiGetLineItemText('item', 'custcol_djkk_icl_cuslocation', i)+' ���o�ɂ��~���Ă��܂��B');
					return false;
				}
			}
			// add U722 by sys start
			var locationId = nlapiGetLineItemValue('item', 'location', i);
			var cuslocation=nlapiGetLineItemValue('item', 'custcol_djkk_icl_cuslocation', i);
			var locationRec = nlapiLoadRecord('location', locationId);
			var cuslocationRec = nlapiLoadRecord('location', cuslocation);
			if(locationRec.getFieldValue('usebins') == 'T' && cuslocationRec.getFieldValue('usebins') == 'T'){
				var inventory_inshelf = nlapiGetLineItemValue('item', 'custcol_djkk_inventory_inshelf', i);
				if(isEmpty(inventory_inshelf)){
					alert('�A�C�e���́uDJ_�a����ۊǒI�v�t�B�[���h����͂���K�v������܂�');
					return false;
				}
			}
			// add U722 by sys end
		}	
		
		
	}
		 var entity=nlapiGetFieldValue('entity');
		    if(!isEmpty(entity)){
		    	try{
		    var shipmentstop=nlapiLookupField('customer', entity, 'custentity_djkk_shipping_suspend_flag');
		    	}catch(e){
		    	}
		    if(shipmentstop=='T'){
		    	alert('���ڋq���o�ג�~�̏�Ԃ̂��߁A�o�ׂ��邱�Ƃ͂ł��܂���B');
		    	return false;
		      }
		    }
		    
		var rec = nlapiLoadRecord('salesorder', createdfrom);
		
		if(rec.getFieldValue('custbody_djkk_payment_conditions') == '2'){
			
			// ���������v���z�擾
			var soTotal = rec.getFieldValue('total');
			// �O���������v���z�擾
			var customerdepositTotal = 0;
			var count = rec.getLineItemCount('links')
			for (var i = 0; i < count; i++) {
				rec.selectLineItem('links',  i + 1);

				if (rec.getCurrentLineItemValue('links', 'type') == '�O���'){
					customerdepositTotal += Number(rec.getCurrentLineItemValue('links', 'total'));
				}	
			}
			if (Number(soTotal) > Number(customerdepositTotal)){
				alert('�z�����z�͑O�����葽���ł��B');
			}
		}
		

		//�^�M���x�z���f
		
		//NB�̗^�M�`�F�b�N���O��wang 0208�@CH126
		var subsidiary = getRoleSubsidiary();
		var customform = nlapiGetFieldValue('customform');
		if(customform != '119'){
		var total = rec.getFieldValue('total');
		var exchangerate = rec.getFieldValue('exchangerate')
		total = Number(total) * Number(exchangerate);
		var custId = rec.getFieldValue('entity');
		
		var custRec = nlapiLoadRecord('customer', custId);
		var custName = custRec.getFieldValue('entityid');
		var custCreateLimit = custRec.getFieldValue('custentity_djkk_credit_limit');
		var custBalance = custRec.getFieldValue('balance');
		var unbilledorders = custRec.getFieldValue('unbilledorders');
		
		
		var msg = custName+'\r'+'�^�M���x�z:'+thousandsWithComa(Number(custCreateLimit)) +'\r'+'���|���c��:'+thousandsWithComa(Number(custBalance))+'\r'+'���������z:'+thousandsWithComa(Number(unbilledorders))+'\r'+'���������z:'+thousandsWithComa(Number(total));
		if(custCreateLimit != 0 && !isEmpty(custCreateLimit)){
			if(Number(custCreateLimit) - Number(custBalance) -Number(total) -Number(unbilledorders)  < 0){
				msg+='\r�^�M���x�z�������Ă��܂��B'
				alert(msg);
				return false;
			}
		}
	}
	//20220831 add by zhou U064
//	var subsidiary = getRoleSubsidiary();
//	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK){
		var linenumStr = '�ēx���ӁF';
		var linenum = [];
		var neqFlag = false;
		var count = nlapiGetLineItemCount('item');
		for(var n = 1 ; n < count+1 ; n++){
			// ����
			var quantity =  Number(nlapiGetLineItemValue('item', 'quantity', n));
			// �m�ۍς�
			var quantityremaining = Number(nlapiGetLineItemValue('item', 'quantityremaining', n));
			if(!isEmpty(quantity)&&!isEmpty(quantityremaining)&&(quantity != quantityremaining)){
//				linenumStr += ''+n+'';
//				if(n < count){
//					linenumStr += '�A';
//				}
				linenum.push(n);
				neqFlag = true ;
			}
		}
		if(!isEmpty(linenum)){
			for(var n = 0 ; n < linenum.length ; n++){
				linenumStr += ''+linenum[n]+'';
				if(n+1 < linenum.length){
					linenumStr += '�A';
				}
			}
		}
		linenumStr += '�s�ڂ̃A�C�e���̔z�����͒������ŏ��F���ꂽ���ƈ�v���܂���I';
		if(neqFlag == true){
			alert(linenumStr);
		}
	}
	//end
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
	
	// by LIU 2022/01/12
	if (type == 'item' && name == 'quantity') {

		// ����
		var quantity = nlapiGetLineItemValue('item', 'quantity', linenum);

		
		// �A�C�e������ID
		var itemId = nlapiGetLineItemValue('item', 'item', linenum);
		
		// DJ_����
		//20230704 changed by zhou start CH677
//		var unitname = nlapiGetLineItemValue('item', 'unitsdisplay', linenum);
//		var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
        var unitId = nlapiGetLineItemValue('item', 'units' ,linenum);
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
				var conversionRate = (quantity * perunitQuantity).toFixed(2);
				
				// DJ_�P�[�X��
				var floor = Math.floor(conversionRate / itemPerunitQuantity);
				var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
				
				// DJ_�o����
				var djQuantity = (conversionRate - caseQuantity * itemPerunitQuantity).toFixed(2);
				
				// DJ_��{����
				nlapiSetLineItemValue('item', 'custcol_djkk_conversionrate', linenum,
						conversionRate);
				// DJ_�P�[�X��
				nlapiSetLineItemValue('item', 'custcol_djkk_casequantity', linenum,
						caseQuantity);
				// DJ_�o����
				nlapiSetLineItemValue('item', 'custcol_djkk_quantity', linenum,
						djQuantity);
				// DJ_����
				nlapiSetLineItemValue('item', 'custcol_djkk_perunitquantity', linenum,
						itemPerunitQuantity);
			}
		}
	}
	//20220831 add by zhou U064
	var subsidiary = getRoleSubsidiary();
	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK){
		if (type == 'item' && name == 'quantity') {
			// ����
			var quantity =  Number(nlapiGetLineItemValue('item', 'quantity', linenum));
			// �m�ۍς�
			var quantityremaining = Number(nlapiGetLineItemValue('item', 'quantityremaining', linenum));
			if(!isEmpty(quantity)&&!isEmpty(quantityremaining)&&(quantity != quantityremaining)){
				alert(''+linenum+'�s�ڂ̃A�C�e���̔z�����͒������ŏ��F���ꂽ���ƈ�v���܂���I');
			}
		}
	}
	//end
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
     
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
 
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



