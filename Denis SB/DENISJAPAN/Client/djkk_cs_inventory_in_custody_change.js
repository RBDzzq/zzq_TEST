/**
 * DJ_預かり在庫調整のCleint
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/06     CPC_苑
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
//	setLineItemDisableType('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_id', 'hidden');
//	setLineItemDisableType('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_createdfrom', 'hidden');
	setButtunButtonDisable('tbl_recmachcustrecord_djkk_ica_change_insert');
	//U812 start byWang
	if (type == 'create'|| type == 'edit'){
//			nlapiDisableField('custrecord_djkk_ica_zip',true);
//			nlapiDisableField('custrecord_djkk_ica_prefectures',true);
//			nlapiDisableField('custrecord_djkk_ica_municipalities',true);
//			nlapiDisableField('custrecord_djkk_ica_delivery_residence',true);
//			nlapiDisableField('custrecord_djkk_ica_delivery_residence2',true);
//			nlapiDisableField('custrecord_djkk_ica_delivery_phone_num',true);
//			nlapiDisableField('custrecord_djkk_ica_email',true);
//			nlapiDisableField('custrecord_djkk_ica_fax',true);
//			nlapiDisableField('custrecord_djkk_ica_location_memo',true);
			
			nlapiDisableField('custrecord_djkk_ica_customer',true);
	}
	
	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	var count=nlapiGetLineItemCount('recmachcustrecord_djkk_ica_change');
	var chkflag=false;
	for (var i = 1; i < count+1; i++) {
		
		//230205調整数量はプラスの場合は変更理由入力必要チェック必須を追加
		  // DJ_調整数量
		  var icaAdjqty = nlapiGetLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_adjqty',i);
		  
		  // DJ_変更理由
		  var icaChangereason = nlapiGetLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_changereason',i);
		  if(Number(icaAdjqty) > 0 && isEmpty(icaChangereason)){
			  alert('調整数量はプラスの場合は変更理由入力必要です。');
			  return false;
		  }

		
		
		
		
		
		var chk=nlapiGetLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_inventory_adjustment', i);
		var cuslocation=nlapiGetLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_cuslocation', i);
		var flgi = nlapiLookupField('location', cuslocation, 'custrecord_djkk_stop_load');
		if(flgi == 'T'){
			alert(nlapiGetLineItemText('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_cuslocation', i)+' 入出庫を停止しています。');
			return false;
		}
		if(chk=='T'){
			chkflag=true;
		}
	}
	if(chkflag){
		for (var j = count; j >0; j--) {
			var chk=nlapiGetLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_inventory_adjustment', j);			
			if(chk!='T'){
				nlapiRemoveLineItem('recmachcustrecord_djkk_ica_change', j);
			}
		}
	}else{
		alert('「DJ_在庫調整」チェックボックスがチェックされていない');
		return false;
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
	
	// 顧客
    if (name == 'custrecord_djkk_ica_customer') {
    	var count=nlapiGetLineItemCount('recmachcustrecord_djkk_ica_change');
    	for (var j = count; j >0; j--) {
				nlapiRemoveLineItem('recmachcustrecord_djkk_ica_change', j);
		}
     var customerID=nlapiGetFieldValue('custrecord_djkk_ica_customer');
     var subsidiary=nlapiGetFieldValue('custrecord_djkk_ica_subsidiary');
     if(!isEmpty(customerID)&&!isEmpty(subsidiary)){
     var iclSearch = getSearchResults("customrecord_djkk_inventory_in_custody_l",null,
    		 [
    		    ["custrecord_djkk_icl_inventory_in_custody.custrecord_djkk_ic_subsidiary","anyof",subsidiary], 
    		    "AND", 
    		    ["custrecord_djkk_icl_inventory_in_custody.custrecord_djkk_ic_customer","anyof",customerID], 
    		    "AND", 
    		    ["custrecord_djkk_icl_customer_delivery","is","F"], 
    		    "AND", 
    		    ["custrecord_djkk_icl_quantity","greaterthanorequalto","0"]
    		 ], 
    		 [
    		    new nlobjSearchColumn("internalid"),
    		    new nlobjSearchColumn("custrecord_djkk_icl_inventory_in_custody"),
    		    new nlobjSearchColumn("custrecord_djkk_icl_item"), 
    		    new nlobjSearchColumn("custrecord_djkk_icl_inventorylocation"), 
    		    new nlobjSearchColumn("custrecord_djkk_icl_conversionrate"), 
    		    new nlobjSearchColumn("custrecord_djkk_icl_unit"), 
    		    new nlobjSearchColumn("custrecord_djkk_icl_quantity_inventory"), 
    		    new nlobjSearchColumn("custrecord_djkk_icl_inventorydetail_link"), 
    		    new nlobjSearchColumn("custrecord_djkk_createdfrom","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null)
    		 ]
    		 );
     
     if(!isEmpty(iclSearch)){
    	 for (var i = 0; i < iclSearch.length; i++) {
    		 nlapiSelectNewLineItem('recmachcustrecord_djkk_ica_change');
    		     		    		 
    		 // DJ_アイテム
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_item', iclSearch[i].getValue('custrecord_djkk_icl_item'));
    		 
    		 // DJ_子会社
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_line_subsidiary', subsidiary);
    		 
    		 // DJ_場所
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_warehouse', iclSearch[i].getValue('custrecord_djkk_icl_inventorylocation'));
    		 
    		 // DJ_単位
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_unit', iclSearch[i].getValue('custrecord_djkk_icl_unit'));
    		 
    		 // DJ_入り目
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_conversionrate', iclSearch[i].getValue('custrecord_djkk_icl_conversionrate'));
    		 
    		 // DJ_在庫数量
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_inventoryqty', iclSearch[i].getValue('custrecord_djkk_icl_quantity_inventory'));
    		 
    		 // DJ_新しい数量
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_newqty', iclSearch[i].getValue('custrecord_djkk_icl_quantity_inventory'));
    		 
    		 var link=nlapiResolveURL('SUITELET', 'customscript_djkk_sl_dj_inventory_detail','customdeploy_djkk_sl_dj_inventory_detail');
			 link+= '&djInvID='+iclSearch[i].getValue('custrecord_djkk_icl_inventorydetails');
    		 // DJ_在庫詳細
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_detail', link);
    		 
    		 // DJ_預かり在庫ID
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_ic_id', iclSearch[i].getValue('custrecord_djkk_icl_inventory_in_custody'));
    		 
    		 // DJ_預かり在庫明細ID
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_id', iclSearch[i].getValue('internalid'));
    		
    		 // DJ_預かり在庫作成元
    		 nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_ica_change', 'custrecord_djkk_ica_icl_createdfrom', iclSearch[i].getValue("custrecord_djkk_createdfrom","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null));   		 
    		 nlapiCommitLineItem('recmachcustrecord_djkk_ica_change')
    	 }
       }
      }
	}
    
    // DJ_調整数量
    if(name=='custrecord_djkk_ica_adjqty'){
    	
    	// DJ_調整数量
    	var quantityAdjust=nlapiGetCurrentLineItemValue(type,'custrecord_djkk_ica_adjqty');
    	
    	// DJ_在庫数量
    	var quantity=nlapiGetCurrentLineItemValue(type,'custrecord_djkk_ica_inventoryqty');
    	
    	if(!isEmpty(quantityAdjust)){
    		
    		var newquantity=Number(quantity)+Number(quantityAdjust);
    		
    		// DJ_新しい数量
    		nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_ica_newqty', newquantity,true,false);
    		
    	}else{
    		
    		// DJ_新しい数量
    		nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_ica_newqty',quantity,true,false);
    	}
    }
    
       // DJ_新しい数量
    if(name=='custrecord_djkk_ica_newqty'){
    	
    	// DJ_新しい数量
    	var newquantity=nlapiGetCurrentLineItemValue(type,'custrecord_djkk_ica_newqty');
    	
    	// DJ_在庫数量
    	var quantity=nlapiGetCurrentLineItemValue(type,'custrecord_djkk_ica_inventoryqty');
    	if(Number(newquantity)<0){
    		
    		// DJ_新しい数量
    		nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_ica_newqty',quantity,false,false);
    		
    		// DJ_調整数量
    		nlapiSetCurrentLineItemValue(type, 'custrecord_djkk_ica_adjqty',0,false,false);
    		
    		alert('DJ_新しい数量は「0」以上にする必要があります');
    	}
    }
    
    var customer = nlapiGetFieldValue('custrecord_djkk_ica_customer');
	var destination = nlapiGetFieldValue('custrecord_djkk_ica_delivery_destination');
	var addressBox = nlapiGetFieldValue('custrecord_djkk_ica_billing_address');
	var addressObj = isEmpty(customer) ? '' : getAddressObj(customer);
	var fieldAry = ['custrecord_djkk_zip','custrecord_djkk_prefectures','custrecord_djkk_municipalities','custrecord_djkk_delivery_residence','custrecord_djkk_delivery_residence2','custrecord_djkk_delivery_phone_number','custrecord_djkk_email','custrecord_djkk_fax',];
	var destinationObj = isEmpty(destination) ? '' : nlapiLookupField('customrecord_djkk_delivery_destination', destination, fieldAry);;
	
	// DJ_顧客
    if(name == 'custrecord_djkk_ica_customer'){
    	
    	if(!isEmpty(customer) && isEmpty(destination)){
			
			nlapiSetFieldValue('custrecord_djkk_ica_zip', addressObj['zipcode'], false);
			nlapiSetFieldValue('custrecord_djkk_ica_prefectures', addressObj['address_state'], false);
			nlapiSetFieldValue('custrecord_djkk_ica_municipalities', addressObj['city'], false);
			nlapiSetFieldValue('custrecord_djkk_ica_delivery_residence', addressObj['address1'], false);
			nlapiSetFieldValue('custrecord_djkk_ica_delivery_residence2', addressObj['address2'], false);
			nlapiSetFieldValue('custrecord_djkk_ica_delivery_phone_num', addressObj['addressphone'], false);
			nlapiSetFieldValue('custrecord_djkk_ica_email', addressObj['email'], false);
			nlapiSetFieldValue('custrecord_djkk_ica_fax', addressObj['custrecord_djkk_address_fax'], false);
//			nlapiSetFieldValue('custrecord_djkk_ica_location_memo', addressObj['custrecord_djkk_location_instructions'], false);//DENISJAPAN-489を非表示
    	}
    }
    
    // DJ_納品先
    if(name == 'custrecord_djkk_ica_delivery_destination'){
    	nlapiSetFieldValue('custrecord_djkk_ica_zip', destinationObj.custrecord_djkk_zip, false);
		nlapiSetFieldValue('custrecord_djkk_ica_prefectures', destinationObj.custrecord_djkk_prefectures, false);
		nlapiSetFieldValue('custrecord_djkk_ica_municipalities', destinationObj.custrecord_djkk_municipalities, false);
		nlapiSetFieldValue('custrecord_djkk_ica_delivery_residence', destinationObj.custrecord_djkk_delivery_residence, false);
		nlapiSetFieldValue('custrecord_djkk_ica_delivery_residence2', destinationObj.custrecord_djkk_delivery_residence2, false);
		nlapiSetFieldValue('custrecord_djkk_ica_delivery_phone_num', destinationObj.custrecord_djkk_delivery_phone_number, false);
		nlapiSetFieldValue('custrecord_djkk_ica_email', destinationObj.custrecord_djkk_email, false);
		nlapiSetFieldValue('custrecord_djkk_ica_fax', destinationObj.custrecord_djkk_fax, false);
		nlapiSetFieldValue('custrecord_djkk_ica_location_memo', '', false);
    }
    
    // DJ_請求先チェック
    if(name == 'custrecord_djkk_ica_billing_address'){
		if(addressBox == 'T'){
			if(isEmpty(customer)){
				nlapiSetFieldValue('custrecord_djkk_ica_billing_address', 'F',false);
				alert('「DJ_請求先チェック」をチェックした場合、「DJ_顧客」の欄に必ず入力する');
			}else{
				nlapiSetFieldValue('custrecord_djkk_ica_zip', addressObj['zipcode'], false);
				nlapiSetFieldValue('custrecord_djkk_ica_prefectures', addressObj['address_state'], false);
				nlapiSetFieldValue('custrecord_djkk_ica_municipalities', addressObj['city'], false);
				nlapiSetFieldValue('custrecord_djkk_ica_delivery_residence', addressObj['address1'], false);
				nlapiSetFieldValue('custrecord_djkk_ica_delivery_residence2', addressObj['address2'], false);
				nlapiSetFieldValue('custrecord_djkk_ica_delivery_phone_num', addressObj['addressphone'], false);
				nlapiSetFieldValue('custrecord_djkk_ica_email', addressObj['email'], false);
				nlapiSetFieldValue('custrecord_djkk_ica_fax', addressObj['custrecord_djkk_address_fax'], false);
//				nlapiSetFieldValue('custrecord_djkk_ica_location_memo', addressObj['custrecord_djkk_location_instructions'], false);//DENISJAPAN-489を非表示
			}
		}else if(!isEmpty(destination)){
			
			nlapiSetFieldValue('custrecord_djkk_ica_zip', destinationObj.custrecord_djkk_zip, false);
			nlapiSetFieldValue('custrecord_djkk_ica_prefectures', destinationObj.custrecord_djkk_prefectures, false);
			nlapiSetFieldValue('custrecord_djkk_ica_municipalities', destinationObj.custrecord_djkk_municipalities, false);
			nlapiSetFieldValue('custrecord_djkk_ica_delivery_residence', destinationObj.custrecord_djkk_delivery_residence, false);
			nlapiSetFieldValue('custrecord_djkk_ica_delivery_residence2', destinationObj.custrecord_djkk_delivery_residence2, false);
			nlapiSetFieldValue('custrecord_djkk_ica_delivery_phone_num', destinationObj.custrecord_djkk_delivery_phone_number, false);
			nlapiSetFieldValue('custrecord_djkk_ica_email', destinationObj.custrecord_djkk_email, false);
			nlapiSetFieldValue('custrecord_djkk_ica_fax', destinationObj.custrecord_djkk_fax, false);
			nlapiSetFieldValue('custrecord_djkk_ica_location_memo', '', false);
			
		}else{
			nlapiSetFieldValue('custrecord_djkk_ica_zip', '', false);
			nlapiSetFieldValue('custrecord_djkk_ica_prefectures', '', false);
			nlapiSetFieldValue('custrecord_djkk_ica_municipalities', '', false);
			nlapiSetFieldValue('custrecord_djkk_ica_delivery_residence', '', false);
			nlapiSetFieldValue('custrecord_djkk_ica_delivery_residence2', '', false);
			nlapiSetFieldValue('custrecord_djkk_ica_delivery_phone_num', '', false);
			nlapiSetFieldValue('custrecord_djkk_ica_email', '', false);
			nlapiSetFieldValue('custrecord_djkk_ica_fax', '', false);
			nlapiSetFieldValue('custrecord_djkk_ica_location_memo', '', false);
		}
	
	
	}
    
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

function getAddressObj(id) {

	if (id != null && id != '') {
		
		var dateFieldSearch = nlapiSearchRecord("customer",null,
				[
				 ["internalid","anyof",id],
				 "AND", 
				 ["address.isdefaultbilling","is","T"], 
				], 
				[
				   new nlobjSearchColumn("zipcode","Address",null), 
				   new nlobjSearchColumn("custrecord_djkk_address_state","Address",null), 
				   new nlobjSearchColumn("city","Address",null), 
				   new nlobjSearchColumn("address1","Address",null), 
				   new nlobjSearchColumn("address2","Address",null), 
				   new nlobjSearchColumn("addressphone","Address",null), 
				   new nlobjSearchColumn("custrecord_djkk_address_fax","Address",null), 
//				   new nlobjSearchColumn("custrecord_djkk_location_instructions","Address",null),//DENISJAPAN-489を非表示
				   new nlobjSearchColumn("email")
				]
				);
		
		if (!isEmpty(dateFieldSearch)) {
			return dataObj = {
					'zipcode' : dateFieldSearch[0].getValue("zipcode","Address"),
					'address_state' : dateFieldSearch[0].getValue("custrecord_djkk_address_state","Address"),
					'city' : dateFieldSearch[0].getValue("city","Address"),
					'address1' : dateFieldSearch[0].getValue("address1","Address"),
					'address2' : dateFieldSearch[0].getValue("address2","Address"),
					'addressphone' : dateFieldSearch[0].getValue("addressphone","Address"),
					'custrecord_djkk_address_fax' : dateFieldSearch[0].getValue("custrecord_djkk_address_fax","Address"),
//					'custrecord_djkk_location_instructions' : dateFieldSearch[0].getValue("custrecord_djkk_location_instructions","Address"),//DENISJAPAN-489を非表示
					'email' : dateFieldSearch[0].getValue("email"),
			};
		}
	}
}


/**
 * 配送指示ボタン
 */
//U812
function deliveryinstructions() {
	try {
		var id=nlapiGetRecordId();
		var record = nlapiLoadRecord('customrecord_djkk_ic_change',id);
		var location = record.getFieldValue('custrecord_djkk_ica_location');
		
		if (!isEmpty(location)) {
			// DJ_自動送信取得
			var custrecord_djkk_auto_sendmail = nlapiLookupField('location',
					location, 'custrecord_djkk_auto_sendmail');
			
			if (custrecord_djkk_auto_sendmail == 'T') {				
					var theLink = nlapiResolveURL('SUITELET', 'customscript_djkkk_sl_sendmail_invchange', 'customdeploy_djkkk_sl_sendmail_invchange');
			        theLink += '&id=' + id;
			        theLink += '&userid=' + nlapiGetUser();	
			      
			        var rse = nlapiRequestURL(theLink);
			        var flag = rse.getBody();
			        if (flag == 'T') {
			            alert('正常に送信されました。');		            
			            window.location.href=window.location.href;
			        } else if(flag == 'F'){
			            alert('場所の住所「FAX」および「DJ_送信メール」情報が設定されていません');
			            window.location.href=window.location.href;
			        }else {
			            alert('場所情報取得できませんでした、「'+flag+'」');
			            window.location.href=window.location.href;
			        }
			} else {
				alert('場所のDJ_自動送信チェックしておりませんでした。')
			}

		} else {
			alert('倉庫を選択してください。')
		}

	} catch (e) {
		alert(e.message);
	}
}


