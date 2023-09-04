/**
 * 発注書のClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/03/08     CPC_苑
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
	//20220816 add by zhou U239
	nlapiLogExecution('debug','start');
	var user = nlapiGetUser();
	if(user){
		nlapiSetFieldValue('custbody_djkk_input_person', user);
	}
	//end
//	var user = nlapiGetUser();
//	if (user == '167') {
//		if (type == 'create') {
//
//			// TODO 在庫詳細ボタン非表示(DJ_在庫詳細関数開発後注釈を開く)
//			setButtunButtonDisable('inventorydetail_helper_popup');			
//		}
//	}
	if(type=='copy'){
		var count = nlapiGetLineItemCount('item');
		nlapiLogExecution('debug','count1',count);
		if(count != null && count >= 0){
			for(var n = 0 ; n < count ; n++){
				var inventorydetailFlag =nlapiGetLineItemValue("item","inventorydetailavail",n+1);
				if(inventorydetailFlag == 'T'){
					//在庫詳細クリアランス
					var inventoryDetail;
					nlapiSelectLineItem('item', n+1);
					inventoryDetail = nlapiRemoveCurrentLineItemSubrecord('item','inventorydetail');
				}
	
			}	
		}
	}
	
	// CH710 zheng 20230712 start
	// Withholding Tax機能があるので、追加
	if (type=='create') {
	    var entity = nlapiGetFieldValue('entity');
	    if (entity) {
            nlapiSetFieldValue('department', '', true, false);
            nlapiSetFieldValue('class', '', true, false);
            nlapiSetFieldValue('custbody_djkk_sales_representative', '', true, false);
	        var entityArray = nlapiLookupField('vendor', entity, ['custentity_djkk_effective_recognition','custentity_djkk_activity', 'custentity_djkk_brand_code', 'custentity_djkk_salesrepid']);
            var activity = entityArray.custentity_djkk_activity;
            if (activity) {
                nlapiSetFieldValue('department', activity, true, false);
            }
            var brandCode = entityArray.custentity_djkk_brand_code;
            if (brandCode) {
                var tmpBCodes = brandCode.split(',');
                if (tmpBCodes.length == 1) {
                    nlapiSetFieldValue('class', brandCode, true, false);
                }
            }
            var salesrepid = entityArray.custentity_djkk_salesrepid;
            if (salesrepid) {
                nlapiSetFieldValue('custbody_djkk_sales_representative', salesrepid, true, false);
            }
	    }
	}
	// CH710 zheng 20230712 end
}

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
//	if(name=='entity'){
//	var sub = nlapiGetFieldValue('subsidiary');
//	if(!isEmpty(sub) &&!isEmpty(nlapiGetFieldValue('entity')) && !isEmpty(nlapiGetFieldValue('currency')) && !isEmpty(nlapiGetFieldValue('trandate'))){
//		var price = null;
//		if(sub == SUB_SCETI || sub == SUB_DPKK){
//			var itemCount = nlapiGetLineItemCount('item');
//			if(itemCount>0){
//				for(var k=1;k<itemCount+1;k++){
//					nlapiSelectLineItem('item',k);
//					if (!isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
////					var itemId = nlapiGetCurrentLineItemValue('item','quantity');
//					nlapiSetCurrentLineItemValue('item','quantity',2,true);
////					nlapiSetCurrentLineItemValue('item','quantity',itemId);
//					nlapiCommitLineItem('item');
//					}
//				}
//			}
////			price = setlinepriceFromDelCust(nlapiGetCurrentLineItemValue('item', 'quantity'), nlapiGetCurrentLineItemValue('item', 'item'));
//		}
//	}
//}
	//changed by geng add start CH084
	if(type=='item'&&name=='description'){
		var sub = nlapiGetFieldValue('subsidiary');
		if(sub==SUB_DPKK||sub==SUB_SCETI){
			var valMemo = nlapiGetCurrentLineItemValue('item', 'description');
			var StringVal = String(valMemo);
			var memoVal=nlapiGetFieldValue('purchasedescription');
			var StringVal = String(memoVal);
			var encoder = new TextEncoder();
			var bytes = encoder.encode(StringVal);
			var byteCount = bytes.length;
			if(byteCount>100){
				alert('[PO行コメント]フィールドの内容が多すぎます。再入力してください');
				nlapiSetCurrentLineItemValue('item', 'description', '');
			}
		}
	}
	//changed by geng add end CH084
	//add by geng start
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

	//add by geng end
	
	//changed by geng add startU548
	
	if(type == 'item' && name=='item'){
		 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
		var sub=nlapiGetFieldValue('subsidiary');
		if(sub==SUB_SCETI || sub==SUB_DPKK){
			var id = nlapiGetCurrentLineItemValue('item','item');
			if(!isEmpty(id)){
			var itemSearch = nlapiSearchRecord("item",null,
					[
					   ["internalid","anyof",id]
					], 
					[
					   new nlobjSearchColumn("type")
					]
					);
			if(!isEmpty(itemSearch)){
				var itemType = itemSearch[0].getValue("type"); 
				if(itemType=='InvtPart'||itemType=='NonInvtPart'){
					var itemSub = nlapiLookupField('item',id,'subsidiary');
					if(itemSub==SUB_SCETI||itemSub==SUB_DPKK){
						var itemMemo = nlapiLookupField('item',id,'custitem_djkk_memorandum');
						if(!isEmpty(itemMemo)){
							nlapiSetCurrentLineItemValue('item','custcol_djkk_po_memorandum',itemMemo);	
						}
					}
				}			
			 }
			}
		}
		
	  }
	}
	//changed by geng add endU548
	
	if(type != 'item' &&(name=='subsidiary'||name=='entity'||name=='class')){
	    //WF zheng 20230609 start
	    var zhLocation = nlapiGetFieldValue('location');
	    if (!zhLocation) {
	        var subsidiary=nlapiGetFieldValue('subsidiary');
	        if(!isEmpty(subsidiary)){
    	        var DefLocation = nlapiSearchRecord("customrecord_djkk_po_default_in_location",null,
    	                [
    	                   ["custrecord_djkk_pod_subsidiary","anyof",subsidiary]
    	                ], 
    	                [
    	                   new nlobjSearchColumn("custrecord_djkk_pod_location")
    	                ]
    	                );
    	        if(!isEmpty(DefLocation)){
    	            var DefLocationId=DefLocation[0].getValue('custrecord_djkk_pod_location');
    	            nlapiSetFieldValue('location', DefLocationId, true, true);
    	        }else{
    	            nlapiSetFieldValue('location', null, true, true);
    	        }
	        }   
	    }
        //WF zheng 20230609 start
    }
	if(name==='entity'){
		 var entity=nlapiGetFieldValue('entity');
	     if(!isEmpty(entity)){
           	// var entityArray=nlapiLookupField('vendor', entity, ['custentity_djkk_effective_recognition','custentity_djkk_activity','custentity_djkk_billable_flag']);
             // CH710 zheng 20230712 start
             // var entityArray=nlapiLookupField('vendor', entity, ['custentity_djkk_effective_recognition','custentity_djkk_activity']);
             var entityArray=nlapiLookupField('vendor', entity, ['custentity_djkk_effective_recognition','custentity_djkk_activity', 'custentity_djkk_brand_code', 'custentity_djkk_salesrepid']);
             // CH710 zheng 20230712 end
	    	 if(entityArray.custentity_djkk_effective_recognition=='F'){
	    		alert('仕入先は承認されていません');
	    		//nlapiSetFieldValue('entity', null, true, false);
	    		nlapiSetFieldValue('entity', '', true, false);
	    	 }else{
	    		 // U771 支払請求対象（POは作らない）
	    		// if(entityArray.custentity_djkk_billable_flag=='T'){
	    		//	alert('この仕入先は「支払請求対象｣です、発注書を作成できません');
	 	    	//	//nlapiSetFieldValue('entity', null, true, false); 
	 	    	//	nlapiSetFieldValue('entity', '', true, false); 
	    		// }else{
	    	         // CH710 zheng 20230712 start
	    			 // nlapiSetFieldValue('department', entityArray.custentity_djkk_activity, true, false);
	    			 // CH710 zheng 20230712 end
	    		// }
	                // CH710 zheng 20230712 start
	    	        nlapiSetFieldValue('department', '', true, false);
	    	        nlapiSetFieldValue('class', '', true, false);
	    	        nlapiSetFieldValue('custbody_djkk_sales_representative', '', true, false);
	                var activity = entityArray.custentity_djkk_activity;
	                if (activity) {
	                    nlapiSetFieldValue('department', activity, true, false);
	                }
	                var brandCode = entityArray.custentity_djkk_brand_code;
	                if (brandCode) {
	                    var tmpBCodes = brandCode.split(',');
	                    if (tmpBCodes.length == 1) {
	                        nlapiSetFieldValue('class', brandCode, true, false);
	                    }
	                }
	                var salesrepid = entityArray.custentity_djkk_salesrepid;
	                if (salesrepid) {
	                    nlapiSetFieldValue('custbody_djkk_sales_representative', salesrepid, true, false);
	                }
	                // CH710 zheng 20230712 end
	    	 }
	       }
	    }
	
	// CH677 zheng 20230629 start
	// DJ_入り目
	if (type == 'item' && name == 'units') {
		// var unitname = nlapiGetCurrentLineItemText('item', 'units');
		var unitId = nlapiGetCurrentLineItemValue('item', 'units');
		if (!isEmpty(unitId)) {							
//				nlapiSetCurrentLineItemValue('item','custcol_djkk_conversionrate',getConversionrate(unitname));	
		    var itemId = nlapiGetCurrentLineItemValue('item','item');
		    if (itemId) {
	            var itemUnitsTypeId = nlapiLookupField('item',itemId,'unitstype');
	            if (itemUnitsTypeId) {
	                var crVal = getConversionrateAbbreviationNew(itemUnitsTypeId, unitId);
	                if (crVal) {
	                    nlapiSetCurrentLineItemValue('item','custcol_djkk_conversionrate', crVal);
	                    nlapiSetCurrentLineItemValue('item','custcol_djkk_perunitquantity', crVal);   
	                }   
	            }   
		    }
		}
	}
	
//	if (type == 'item' && name == 'units') {
//		var unitname = nlapiGetCurrentLineItemText('item', 'units');
//		if (!isEmpty(unitname)) {							
////				nlapiSetCurrentLineItemValue('item','custcol_djkk_perunitquantity',getConversionrate(unitname));
//				nlapiSetCurrentLineItemValue('item','custcol_djkk_perunitquantity',getConversionrateAbbreviation(unitname));
//		}
//	}
	// CH677 zheng 20230629 end

	if(type != 'item' &&name=='location'){
		var locationId=nlapiGetFieldValue('location');
		var count = nlapiGetLineItemCount('item');
		 for (var i = 1; i < count + 1; i++) {
		 nlapiSelectLineItem('item', i);
		 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
		 if (!isEmpty(nlapiGetCurrentLineItemValue('item', 'item')) && isEmpty(nlapiGetCurrentLineItemValue('item', 'location')) ) {
		 nlapiSetCurrentLineItemValue('item', 'location', locationId,true);
		 nlapiCommitLineItem('item');
		 }
		 }
		 nlapiCancelLineItem('item');
		 }
	}

	if(type != 'item' &&name=='department'){
		var departmentId=nlapiGetFieldValue('department');
		var count = nlapiGetLineItemCount('item');
		 for (var i = 1; i < count + 1; i++) {
		 nlapiSelectLineItem('item', i);
		 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
		 if (!isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
		 nlapiSetCurrentLineItemValue('item', 'department', departmentId,true);
		 nlapiCommitLineItem('item');
		 }
		 }
		 nlapiCancelLineItem('item');
		 }
	}
	
	if(type == 'item' &&name=='location'){
		if(nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_inspection_required') == 'T'){
		if(!isEmpty(nlapiGetCurrentLineItemValue('item','location'))&&!isEmpty(nlapiGetFieldValue('subsidiary'))){
			try{
		var locationSearch = nlapiSearchRecord("location",null,
				[
				   ["name","contains","検品中"], 
				   "AND", 
				   ["subsidiary","anyof",nlapiGetFieldValue('subsidiary')], 
				   "AND", 
				   ["custrecord_djkk_exsystem_parent_location","anyof",nlapiGetCurrentLineItemValue('item','location')]
				], 
				[
				   new nlobjSearchColumn("internalid")
				]
				);
		
		var inspectionLocationid = '';
		if(!isEmpty(locationSearch)){
			inspectionLocationid = locationSearch[0].getValue("internalid");
			nlapiSetCurrentLineItemValue('item', 'targetlocation',inspectionLocationid,false,true);
		}else{
			nlapiSetCurrentLineItemValue('item', 'targetlocation',nlapiGetCurrentLineItemValue('item','location'),false,true);
		}
		}catch(e2){nlapiSetCurrentLineItemValue('item', 'targetlocation',nlapiGetCurrentLineItemValue('item','location'),false,true);}
		}else{
			nlapiSetCurrentLineItemValue('item', 'targetlocation',nlapiGetCurrentLineItemValue('item','location'),false,true);
		}
	}else{
		nlapiSetCurrentLineItemValue('item', 'targetlocation',nlapiGetCurrentLineItemValue('item','location'),false,true);
	}		
	}
	
	if (name == 'custbody_djkk_reserved_exchange_rate_p') {
		var  rateid=nlapiGetFieldValue('custbody_djkk_reserved_exchange_rate_p');
		var rate = '';
		if(!isEmpty(rateid)){
		rate =nlapiLookupField('customrecord_djkk_reserved_exchange_rate',rateid,
				'custrecord_djkk_reserved_exchange_rate');
		}		
			
		nlapiSetFieldValue('exchangerate', rate);
	}
	if(name=='quantity'){
		var quantity=nlapiGetCurrentLineItemValue('item', 'quantity');
		var rateExp=nlapiGetCurrentLineItemValue('item', 'custcol_djkk_min_inv_unit_cus_duty');
		if(!isEmpty(rateExp)&&!isEmpty(quantity)){
		var dutyRate=quantity*rateExp;
		nlapiSetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate',dutyRate, false, true);
		}else{
		nlapiSetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate',null, false, true);
		}
	}
//20220802 add by zhou start
//U605
	if(type == 'item'&&name== 'item'){
		
		var item = nlapiGetCurrentLineItemValue('item', 'item')
		nlapiLogExecution('debug','access',item);
		if (!isEmpty(item)) {
			var origin = nlapiLookupField(
				    'item', item, 
				    'custitem_djkk_origin',true
				);
			nlapiSetCurrentLineItemValue('item', 'custcol_djkk_origin',origin,true);
//			nlapiCommitLineItem('item');
		}
	}
//end
	
	// By Wang 2022/10/28
	if (type == 'expense'&&name == 'category') {
    nlapiSetCurrentLineItemValue('expense', 'department', nlapiGetFieldValue('department'), false, true);
    nlapiSetCurrentLineItemValue('expense', 'class', nlapiGetFieldValue('class'), false, true);
	}
	
//	if(type != 'expense' &&name=='department'){
//		var departmentId=nlapiGetFieldValue('department');
//		var count = nlapiGetLineItemCount('expense');
//		 for (var i = 1; i < count + 1; i++) {
//		 nlapiSelectLineItem('expense', i);
////		 if (nlapiGetCurrentLineItemValue('expense', 'expensetype') != 'EndGroup') {
//		 if (!isEmpty(nlapiGetCurrentLineItemValue('expense', 'category'))) {
//		 nlapiSetCurrentLineItemValue('expense', 'department', departmentId,true);
//		 nlapiCommitLineItem('expense');
//		 }
////		 }
//		 }
//	}
//	if(type != 'expense' &&name=='class'){
//		var classId=nlapiGetFieldValue('class');
//		var count = nlapiGetLineItemCount('expense');
//		 for (var i = 1; i < count + 1; i++) {
//		 nlapiSelectLineItem('expense', i);
////		 if (nlapiGetCurrentLineItemValue('expense', 'expensetype') != 'EndGroup') {
//		 if (!isEmpty(nlapiGetCurrentLineItemValue('expense', 'category'))) {
//		 nlapiSetCurrentLineItemValue('expense', 'class', classId,true);
//		 nlapiCommitLineItem('expense');
//		 }
////		 }
//		 }
//	}
	//end
}

function clientPostSourcing(type, name) {
	 if (!isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
	var quantity=nlapiGetCurrentLineItemValue('item', 'quantity');
	var rateExp=nlapiGetCurrentLineItemValue('item', 'custcol_djkk_min_inv_unit_cus_duty');
	if(!isEmpty(rateExp)&&!isEmpty(quantity)){
	var dutyRate=quantity*rateExp;
	nlapiSetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate',dutyRate, false, true);
	}else{
	nlapiSetCurrentLineItemValue('item', 'custcol_djkk_customs_duty_rate',null, false, true);
	}
	if (type == 'item'&&name == 'item'&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
      
        if(isEmpty(nlapiGetCurrentLineItemValue('item', 'targetsubsidiary'))){
   		nlapiSetCurrentLineItemValue('item', 'targetsubsidiary',nlapiGetFieldValue('subsidiary'),false,true);
       }
      
    if(isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))){
	 nlapiSetCurrentLineItemValue('item', 'location',nlapiGetFieldValue('location'),false,true);   
       }

    if(isEmpty(nlapiGetCurrentLineItemValue('item', 'targetlocation'))){
    	var setLineLocation=nlapiGetFieldValue('location');
		if(isEmpty(setLineLocation)){
			setLineLocation=nlapiGetCurrentLineItemValue('item', 'location')
		}
		if(nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_inspection_required') == 'T'){
		if(!isEmpty(nlapiGetFieldValue('location'))&&!isEmpty(nlapiGetFieldValue('subsidiary'))){
			try{
		var locationSearch = nlapiSearchRecord("location",null,
				[
				   ["name","contains","検品中"], 
				   "AND", 
				   ["subsidiary","anyof",nlapiGetFieldValue('subsidiary')], 
				   "AND", 
				   ["custrecord_djkk_exsystem_parent_location","anyof",nlapiGetFieldValue('location')]
				], 
				[
				   new nlobjSearchColumn("internalid")
				]
				);
		
		var inspectionLocationid = '';	
		if(!isEmpty(locationSearch)){
			inspectionLocationid = locationSearch[0].getValue("internalid");
			nlapiSetCurrentLineItemValue('item', 'targetlocation',inspectionLocationid,false,true);
		}else{
			nlapiSetCurrentLineItemValue('item', 'targetlocation',setLineLocation,false,true);			
		}
		}catch(e2){nlapiSetCurrentLineItemValue('item', 'targetlocation',setLineLocation,false,true);}
		}
	}else{
		nlapiSetCurrentLineItemValue('item', 'targetlocation',setLineLocation,false,true);
	}
		
	 
	 
       }		
	
	// By LIU 2022/01/24
    try{
	    nlapiSetCurrentLineItemValue('item', 'department', nlapiGetFieldValue('department'), false, true);
	    nlapiSetCurrentLineItemValue('item', 'class', nlapiGetFieldValue('class'), false, true);
    }catch(e){
    	
    }
	}
	
	//add by geng
	if(type == 'item' && name == 'item'){
//		clientDevelopmentTesting('test1',434);
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
		
		if(sub==SUB_NBKK || sub==SUB_ULKK){
			var duedate = nlapiGetFieldValue('duedate');
			if(!isEmpty(duedate)){
				nlapiSetCurrentLineItemValue('item','expectedreceiptdate',duedate);
			}else{
				nlapiSetCurrentLineItemValue('item','expectedreceiptdate',null);
			}
			var id = nlapiGetCurrentLineItemValue('item','item');
			var itemBrand = nlapiLookupField('item',id,'custitem_djkk_class');
			if(!isEmpty(itemBrand)){
				nlapiSetCurrentLineItemValue('item', 'class', itemBrand, false, true);
			}
			
			
		}
		
	}
	
	

	//add end
	
	

}
//		//20220816 add by zhou start U239
		if(name == 'entity'){
			var customform = nlapiGetFieldValue('customform');
			if(customform == '169'){
				var entityId = nlapiGetFieldValue('entity');
				var vendorSearch = nlapiSearchRecord("vendor",null,
						[
						   ["internalid","anyof",entityId]
						], 
						[
						   new nlobjSearchColumn("custentity_djkk_salesrepid"), 
						]
						);
				if(!isEmpty(vendorSearch)){
					var salesrepid = vendorSearch[0].getValue('custentity_djkk_salesrepid');
					nlapiSetFieldValue('custbody_djkk_sales_representative', salesrepid);
				}
			}
		}
//		//end


}

var printOnClickObj = document.getElementById('print');
if (printOnClickObj) {
    printOnClickObj.onclick = function pdfMaker(){
        // 2/25発注書PDF生成
        nlapiLogExecution('debug', 'accessClientCheck', 666);
        var urlLink = nlapiResolveURL('SUITELET', 'customscriptdjkk_sl_purchaseorder_pdfmkr','customdeploydjkk_sl_purchaseorder_pdfmkr');
        urlLink += '&purchaseorderid='+nlapiGetRecordId(); //発注書画面ID取得
        urlLink += '&roleSub='+nlapiGetFieldValue('subsidiary'); //食品、LSGを分ける
        window.open(urlLink);
    }
}


//function pdfMaker(){
//	// 2/25発注書PDF生成
//	var urlLink = nlapiResolveURL('SUITELET', 'customscriptdjkk_sl_purchaseorder_pdfmkr','customdeploydjkk_sl_purchaseorder_pdfmkr');
//	urlLink += '&purchaseorderid='+nlapiGetRecordId(); //発注書画面ID取得
//	window.open(urlLink);
//}
//add start by geng
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
//add by geng
