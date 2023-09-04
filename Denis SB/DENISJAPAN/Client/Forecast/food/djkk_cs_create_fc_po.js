/**
 * DJ_����������
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/07/05     CPC_��
 *
 */
//20230511 uploaded by zhou
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
		alert('�u�ꏊ�v���͕K�{');
		return false;
	}
	var poVendor = nlapiGetFieldValue('custpage_po_vendor');	
	if(isEmpty(poVendor)||poVendor=='0'){
		alert('�u�d����v���͕K�{');
		return false;
	}		
	
	var poCurrency = nlapiGetFieldValue('custpage_po_currency');
		if (isEmpty(poCurrency)||poCurrency=='0') {
			alert('�u�ʉ݁v���͕K�{');
			return false;
	}
	
	var count = nlapiGetLineItemCount('sublist_item');
	var noselectFlag=false;
	for (var i = 1; i < count + 1; i++) {
		if (nlapiGetLineItemValue('sublist_item', 'checkbox', i) == 'T') {
			noselectFlag=true;
//			var lineLocation = nlapiGetLineItemValue('sublist_item','linelocation', i);
//			if (isEmpty(lineLocation)||lineLocation=='0') {
//             alert(i+'�s�ڃA�C�e�� �́u�ꏊ�v���͕K�{');
//             return false;
//			}
//			var linevendor = nlapiGetLineItemValue('sublist_item','linevendor', i);
//			if (isEmpty(linevendor)||linevendor=='0') {
//             alert(i+'�s�ڃA�C�e�� �́u�d����v���͕K�{');
//             return false;
//			}
			var quantity = nlapiGetLineItemValue('sublist_item','quantity', i);
			if (isEmpty(quantity)||quantity=='0') {
             alert(i+'�s�ڃA�C�e�� �́u�������v���͕K�{');
             return false;
			}
			var rate = nlapiGetLineItemValue('sublist_item','rate', i);
			if (isEmpty(rate)) {
             alert(i+'�s�ڃA�C�e�� �́u�P���v���͕K�{');
             return false;
			}
			/**************************/
			var unitstypetext = nlapiGetLineItemValue('sublist_item','unitstypetext', i);
			var units = nlapiGetLineItemText('sublist_item','units', i);
			
			if (isEmpty(unitstypetext)&&!isEmpty(units)) {
             alert(i+'�s�ڃA�C�e�� �́u���-�P�ʁv���͊ԈႢ');
             return false;
			}
			if (!isEmpty(unitstypetext)&&!isEmpty(units)) {
				if (units.indexOf(unitstypetext)<0) {
		             alert(i+'�s�ڃA�C�e�� �́u���-�P�ʁv���͊ԈႢ');
		             return false;
					}
				}
			/**************************/
//			var currency = nlapiGetLineItemValue('sublist_item','currency', i);
//			if (isEmpty(currency)||currency=='0') {
//             alert(i+'�s�ڃA�C�e�� �́u�ʉ݁v���͕K�{');
//             return false;
//			}
			
		}
	}
	if(noselectFlag==false){
		alert('�A�C�e�����I������Ă��܂���!');
	}
	return noselectFlag;
}
/*
 * ���������͌���
 */
function searchPoToCreat() {

	var dateweek = nlapiGetFieldValue('custpage_dateweek');
	var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
	var locationValue=nlapiGetFieldValue('custpage_location');
	var vendor=nlapiGetFieldValue('custpage_vendor');
	var item=nlapiGetFieldValue('custpage_item');
    var brand=nlapiGetFieldValue('custpage_brand');
	if (isEmpty(dateweek)) {
		alert('�u���ח\��T�v���͕K�{');
	}else if (isEmpty(subsidiary)||subsidiary=='0') {
		alert('�u�A���v���͕K�{');
	}else if (isEmpty(locationValue)||locationValue=='0') {
		alert('�u�ꏊ�G���A�v���͕K�{');
	}else if (isEmpty(vendor)||vendor=='0') {
		alert('�u�d����v���͕K�{');
	}
	else{
		var currencyId='';
		 if(!isEmpty(vendor)&&vendor!='0'){
//			  currencyId=nlapiLoadRecord('vendor', vendor).getLineItemValue('currency', 'currency', '1');
			 currencyId=nlapiLoadRecord('vendor', vendor).getFieldValue('currency');
		 }
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_create_fc_po','customdeploy_djkk_sl_create_fc_po');
		theLink +='&subsidiary=' + subsidiary;
		theLink +='&location=' + locationValue;
		theLink +='&vendor=' + vendor;
		theLink +='&item=' + item;
		theLink +='&brand=' + brand;
		theLink +='&dateweek=' + dateweek;
		theLink +='&currencyId=' + currencyId;
		theLink +='&search=T';
		window.ischanged = false;
		location.href = theLink;
	} 
}

/*
 *�X�V
 */
function refresh(){
	window.ischanged = false;
	location=location;
}

/*
 * �����ɖ߂�
 */
function backToSearch() {

	var dateweek = nlapiGetFieldValue('custpage_dateweek');
	var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
	var locationValue=nlapiGetFieldValue('custpage_location');
	var vendor=nlapiGetFieldValue('custpage_vendor');
	var item=nlapiGetFieldValue('custpage_item');
    var brand=nlapiGetFieldValue('custpage_brand');	
    var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_create_fc_po','customdeploy_djkk_sl_create_fc_po');
		theLink +='&subsidiary=' + subsidiary;
		theLink +='&location=' + locationValue;
		theLink +='&vendor=' + vendor;
		theLink +='&item=' + item;
		theLink +='&brand=' + brand;
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
	if (type == 'sublist_item') {
		if (name == 'quantity' || name == 'rate' || name == 'taxcode') {
			var rate = Number(nlapiGetLineItemValue(type, 'rate', linenum));
			var quantity = Number(nlapiGetLineItemValue(type, 'quantity',linenum));
			var amount = rate * quantity;
			nlapiSetLineItemValue('sublist_item', 'amount', linenum, amount.toFixed(3));
			var taxcode = nlapiGetLineItemValue('sublist_item', 'taxcode',linenum);
			if (!isEmpty(taxcode)) {
				var tax = nlapiLookupField('salestaxitem', taxcode, 'rate').split('%')[0] / 100 + 1;
				var grossamt = amount * tax;
				nlapiSetLineItemValue('sublist_item', 'grossamt', linenum,grossamt.toFixed(3));
			} else {
				nlapiSetLineItemValue('sublist_item', 'grossamt', linenum,amount.toFixed(3));
			}
			if (name == 'quantity'){
				var scPerunitquantity = Number(nlapiGetLineItemValue(type,'conversionrate', linenum));// 20230509 changed by zhou
				var stockunit = nlapiGetLineItemValue(type, 'stockunitid', linenum);
				var mainUnitstype = nlapiGetLineItemValue(type, 'unitstypeid',linenum);
				var units = nlapiGetLineItemValue(type, 'units', linenum);
				units = units.split('|')[1];
				var item = nlapiGetLineItemValue(type, 'itemid', linenum);
				var newConversionrate = getNewConversionrate(stockunit,mainUnitstype, units, item);// 20230509 changed by zhou new
													// ���Z��
				if (!isEmpty(newConversionrate)) {
					// ������*�����/���Z��
					nlapiSetLineItemValue('sublist_item', 'cases', linenum, Number(quantity * scPerunitquantity / newConversionrate).toFixed(3));// 20230509 changed by zhou
					 nlapiSetLineItemValue('sublist_item', 'conversion',linenum,Number(newConversionrate));//20230509 changed by zhou
				} else {
					alert('���݂̍s���Z���[�g�̌v�Z���ɗ�O���������܂���')
				}
			}
		}
	   if(name=='units'){
		   //20230305 changed by zhou DEV-1890 start
//		   var unitname=nlapiGetLineItem	Text(type, 'units', linenum);
//		   nlapiSetLineItemValue('sublist_item', 'conversionrate', linenum,getConversionrate(unitname));
		   var scQuantity=nlapiGetLineItemValue(type, 'sc_quantity', linenum);//SC���ɐ�
//		   var quantity=nlapiGetLineItemValue(type, 'quantity', linenum);//������
		   var scPerunitquantity=Number(nlapiGetLineItemValue(type, 'conversionrate', linenum));//20230509 changed by zhou ITEM.DJ_���萔
		   var stockunit=nlapiGetLineItemValue(type, 'stockunitid', linenum);
		   var mainUnitstype=nlapiGetLineItemValue(type, 'unitstypeid', linenum);
		   var units=nlapiGetLineItemValue(type, 'units', linenum); 
		   units = units.split('|')[1];
		   var item=nlapiGetLineItemValue(type, 'itemid', linenum);
		   var newConversionrate = getNewConversionrate(stockunit,mainUnitstype,units,item);//20230509 changed by zhou new ���Z��
		   var itemUnitConversion = getItemUnitConversionrate(stockunit,mainUnitstype,units,item);//20230515 changed by wang new ���Z��		   
		   var newQuantity = Number(Number(scQuantity)/Number(newConversionrate)).toFixed(3)
		   if(!isEmpty(newConversionrate)){
			   //������*�����/���Z��
			   nlapiSetLineItemValue('sublist_item', 'quantity', linenum,newQuantity , false);//20230509 changed by zhou 
			   nlapiSetLineItemValue('sublist_item', 'cases', linenum, Number(newQuantity*scPerunitquantity/newConversionrate).toFixed(3));//20230509 changed by zhou 
			   nlapiSetLineItemValue('sublist_item', 'conversion',linenum,Number(newConversionrate));//20230509 changed by zhou
			   nlapiSetLineItemValue('sublist_item', 'itemunitconversion',linenum,Number(itemUnitConversion));//20230515 changed by wang

			   //���z�̍Čv�Z
			   var rate = Number(nlapiGetLineItemValue(type, 'rate', linenum));
				var amount = rate * newQuantity;
				nlapiSetLineItemValue('sublist_item', 'amount', linenum, amount.toFixed(3));
				var taxcode = nlapiGetLineItemValue('sublist_item', 'taxcode',linenum);
				if (!isEmpty(taxcode)) {
					var tax = nlapiLookupField('salestaxitem', taxcode, 'rate').split('%')[0] / 100 + 1;
					var grossamt = amount * tax;
					nlapiSetLineItemValue('sublist_item', 'grossamt', linenum,grossamt.toFixed(3));
				} else {
					nlapiSetLineItemValue('sublist_item', 'grossamt', linenum,amount.toFixed(3));
				}
		   }else{
			   alert('���݂̍s���Z���[�g�̌v�Z���ɗ�O���������܂���')
		   }
		   //end
	   }
//	   if(name=='units'||name=='quantity'){
//		   var conversionrate=Number(nlapiGetLineItemValue(type, 'conversionrate', linenum));
//		   var quantity=Number(nlapiGetLineItemValue(type, 'quantity', linenum));
//		   if(!isEmpty(conversionrate)&&conversionrate!='0'){			  
//		   nlapiSetLineItemValue('sublist_item', 'cases', linenum,Math.ceil(quantity/conversionrate));
//		   }
//	   }   
	}
	if(name==='custpage_subsidiary'){
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_create_fc_po','customdeploy_djkk_sl_create_fc_po');
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
				 alert(linevendorText+'�͒ʉ�'+currencyTxt+'���T�|�[�g���Ă��܂���');
			}
		}
		   }
	   }
	   if(name=='custpage_po_vendor'){
		   var linevendor=nlapiGetFieldValue('custpage_po_vendor');
		   if(!isEmpty(linevendor)&&linevendor!='0'){
//		   var currencyId=nlapiLoadRecord('vendor', linevendor).getLineItemValue('currency', 'currency', '1');
		   var currencyId=nlapiLoadRecord('vendor', linevendor).getFieldValue('currency');			   
		   nlapiSetFieldValue('custpage_po_currency', currencyId, false, true);
		   var count = nlapiGetLineItemCount('sublist_item');
		   var itemArray=new Array();
		   for (var i = 1; i < count + 1; i++) {
				itemArray.push(nlapiGetLineItemValue('sublist_item', 'itemid', i));				
		    }
			   if (!isEmpty(itemArray)) {
				var inventoryitemSearch = nlapiSearchRecord("inventoryitem",
						null, 
						[ 
						  [ "type", "anyof", "InvtPart" ], 
						  "AND",
						  [ "internalid", "anyof", itemArray ], 
						  "AND",
						  [ "othervendor", "anyof", linevendor ] 
						  ], 
						  [
						   new nlobjSearchColumn("internalid"),
						   new nlobjSearchColumn("vendorcost") 
						   ]);
				if (!isEmpty(inventoryitemSearch)) {
					for (var n = 0; n < inventoryitemSearch.length; n++) {
						for (var s = 1; s < count + 1; s++) {
							nlapiSelectLineItem('sublist_item', s);
							nlapiSetCurrentLineItemValue('sublist_item', 'rate', '0', true, true);
							if (nlapiGetLineItemValue('sublist_item', 'itemid',s) == inventoryitemSearch[n].getValue('internalid')) {
								nlapiSetCurrentLineItemValue('sublist_item', 'rate', inventoryitemSearch[n].getValue('vendorcost'), true, true);
							}
						}
					}
				} else {
					for (var r = 1; r < count + 1; r++) {
						nlapiSelectLineItem('sublist_item', r);
						nlapiSetCurrentLineItemValue('sublist_item', 'rate', '0', true, true);
					}
				}
			}			  
		   }else {
				for (var t = 1; t < count + 1; t++) {
					nlapiSelectLineItem('sublist_item', t);
					nlapiSetCurrentLineItemValue('sublist_item', 'rate', '0', true, true);
				}
			}
	   }
	   /*****/
	if (name==='custpage_dateweek'||name === 'custpage_vendor'||name === 'custpage_brand'||name === 'custpage_location') {
		var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_create_fc_po','customdeploy_djkk_sl_create_fc_po');
		var subsidiary=nlapiGetFieldValue('custpage_subsidiary');
		var dateweek = nlapiGetFieldValue('custpage_dateweek');
		var locationValue=nlapiGetFieldValue('custpage_location');
		var vendor=nlapiGetFieldValue('custpage_vendor');
	    var brand=nlapiGetFieldValue('custpage_brand');
		theLink +='&subsidiary=' + subsidiary;
		theLink +='&location=' + locationValue;
		theLink +='&vendor=' + vendor;
		theLink +='&brand=' + brand;
		theLink +='&dateweek=' + dateweek;
		window.ischanged = false;
		location.href = theLink;		
	}
}
function getNewConversionrate(stockunit,unitstype,units,item){
	//stockunit ���݂̏ڍ׍s���i�̎�v�݌ɒP��
	//unitstype ���݂̏ڍ׍s���i�̎�v�P��
	//units ���݂̏ڍ׍s���i�P��(��ʏ��������́Aitem�̎�ȍw���P��)
	//item ���݂̏ڍ׍s���iID
	var itemUnit = units;//���݂̏ڍ׍s���i�P��
	var unitstypeRecord = nlapiLoadRecord('unitstype', unitstype);//���݂̏ڍ׍s���i�̎�v�P��
	var unitstypeCount = unitstypeRecord.getLineItemCount('uom');
	var stockConversionrate;//
	var itemUnitConversionrate;//
	for (var uni = 1; uni < unitstypeCount + 1; uni++) {
		var unValue = unitstypeRecord.getLineItemValue('uom','internalid', uni);
		var unvalueText = unitstypeRecord.getLineItemValue('uom','unitname', uni);
		var unconversionrate=unitstypeRecord.getLineItemValue('uom','conversionrate', uni);
		if(unValue==itemUnit){
			itemUnitConversionrate = unconversionrate;
		}
		if(unValue==stockunit){//���i�̎�ȍ݌ɒP��
			stockConversionrate = unconversionrate;
		}
	}
	var conversionrate;//�w���P�ʂƍ݌ɒP�� - ���Z��(��v�w���P��/��v�݌ɒP��)
	if(!isEmpty(stockConversionrate)&&!isEmpty(itemUnitConversionrate)&&stockConversionrate!='0'&&itemUnitConversionrate!='0'){
		conversionrate = itemUnitConversionrate/stockConversionrate;
	}
	return conversionrate;
}

function getItemUnitConversionrate(stockunit,unitstype,units,item){
	//stockunit ���݂̏ڍ׍s���i�̎�v�݌ɒP��
	//unitstype ���݂̏ڍ׍s���i�̎�v�P��
	//units ���݂̏ڍ׍s���i�P��(��ʏ��������́Aitem�̎�ȍw���P��)
	//item ���݂̏ڍ׍s���iID
	var itemUnit = units;//���݂̏ڍ׍s���i�P��
	var unitstypeRecord = nlapiLoadRecord('unitstype', unitstype);//���݂̏ڍ׍s���i�̎�v�P��
	var unitstypeCount = unitstypeRecord.getLineItemCount('uom');
	var stockConversionrate;//
	var itemUnitConversionrate;//
	for (var uni = 1; uni < unitstypeCount + 1; uni++) {
		var unValue = unitstypeRecord.getLineItemValue('uom','internalid', uni);
		var unvalueText = unitstypeRecord.getLineItemValue('uom','unitname', uni);
		var unconversionrate=unitstypeRecord.getLineItemValue('uom','conversionrate', uni);
		if(unValue==itemUnit){
			itemUnitConversionrate = unconversionrate;
		}
	}

	return itemUnitConversionrate;
}