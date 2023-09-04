/**
 * �g�����U�N�V�����̋���Client/UserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/07/29     CPC_��
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function commonuserEventBeforeLoad(type, form, request) {
	var recordType = nlapiGetRecordType();
	
	// �ړ��`�[
	if (recordType == 'transferorder') {
		
		// �ړ������Ƃ��ăA�C�e���������g�p
		nlapiSetFieldValue('useitemcostastransfercost', 'T');
		setFieldDisableType('useitemcostastransfercost', 'hidden');
	}
//	
//	// �z��/���
//	if (recordType == 'itemfulfillment' || recordType == 'itemreceipt') {
		setLineItemDisableType('item', 'custcol_djkk_item', 'hidden');
//		
//		// �݌ɒ��� /�݌Ɉړ�/
//	} else if(recordType == 'inventoryadjustment' || recordType == 'inventorytransfer'){
//		if (type != 'view') {
//			setLineItemDisableType('inventory', 'item', 'hidden');
//		} else {
//			setLineItemDisableType('inventory', 'custcol_djkk_item', 'hidden');
//		}
//	}else{
//		if (type != 'view') {
//			//setLineItemDisableType('item', 'item', 'inline');
//		} else {
//			//setLineItemDisableType('item', 'custcol_djkk_item', 'hidden');
//		}
//	}
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
function commonclientFieldChanged(type, name, linenum){
//	var recordType = nlapiGetRecordType();
//	if (recordType != 'assemblybuild'){
//	if(name=='custcol_djkk_item'){
//		if(nlapiGetCurrentLineItemValue(type, 'item')!=nlapiGetCurrentLineItemValue(type, 'custcol_djkk_item')){
//		nlapiSetCurrentLineItemValue(type, 'item', nlapiGetCurrentLineItemValue(type, 'custcol_djkk_item'), true, true);
//		}
//	}
	if(name=='item'){
      if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
		try{
		var item=nlapiGetCurrentLineItemValue(type, 'item');
			if (!isEmpty(item)) {
			    // DENISJAPANDEV-1378 zheng 20230225 start
				// var flag = nlapiLookupField('item', item, ['custitem_djkk_effective_recognition', 'baserecordtype' ]);
				var flag = nlapiLookupField('item', item, ['custitem_djkk_effective_recognition', 'recordType' ]);
                // DENISJAPANDEV-1378 zheng 20230225 end
				if (flag.recordType != 'discountitem') {
					if (flag.custitem_djkk_effective_recognition != 'T') {
						alert('���݂̃A�C�e���͗L�����F����܂���');
						nlapiSetCurrentLineItemValue(type, 'item', '');
					}
				}
			}
		}catch(e){}
//		if(nlapiGetCurrentLineItemValue(type, 'item')!=nlapiGetCurrentLineItemValue(type, 'custcol_djkk_item')){
//			nlapiSetCurrentLineItemValue(type, 'custcol_djkk_item', nlapiGetCurrentLineItemValue(type, 'item'), false, true);	
//		}	
	}
	}
	//}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function commonclientSaveRecord() {
	try{
    var recordType = nlapiGetRecordType();
	
	// �z��/���
	if (recordType == 'itemfulfillment' || recordType == 'itemreceipt') {
	// ���o�ɏ���
	var itemCount = nlapiGetLineItemCount('item');
	for (var i = 1; i < itemCount + 1; i++) {
		 if (nlapiGetLineItemValue('item', 'itemtype',i) != 'EndGroup') {
		var locationId = nlapiGetLineItemValue('item', 'location', i);
		if (!isEmpty(locationId)) {
			var flg = nlapiLookupField('location', locationId,'custrecord_djkk_stop_load')
			if (flg == 'T') {
				alert(nlapiGetLineItemText('item', 'location', i)+ ' ���o�ɂ��~���Ă��܂��B');
				return false;
			}
		}
	}
	}
	}else if(recordType == 'inventoryadjustment' || recordType == 'inventorytransfer'){
	var location=nlapiGetFieldValue('location');
	var transferlocation=nlapiGetFieldValue('transferlocation');
		if (!isEmpty(location) && !isEmpty(transferlocation)) {
			var flgl = nlapiLookupField('location', location,'custrecord_djkk_stop_load');
			var flgt = nlapiLookupField('location', transferlocation,'custrecord_djkk_stop_load');
			if (flgl == 'T') {
				alert(nlapiGetFieldText('location') + ' ���o�ɂ��~���Ă��܂��B');
				return false;
			}
			if (flgt == 'T') {
				alert(nlapiGetFieldText('transferlocation') + ' ���o�ɂ��~���Ă��܂��B');
				return false;
			}

		}
	}else if(recordType == 'assemblybuild'){

		var location=nlapiGetFieldValue('location');
			if (!isEmpty(location)) {
				var flgl = nlapiLookupField('location', location,'custrecord_djkk_stop_load');
				if (flgl == 'T') {
					alert(nlapiGetFieldText('location') + ' ���o�ɂ��~���Ă��܂��B');
					return false;
				}
			}
		
	}
	}catch(e){}
	return true;
}