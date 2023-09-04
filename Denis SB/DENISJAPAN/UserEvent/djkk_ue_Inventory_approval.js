/**
 * DJ_在庫調整承認画面のUE
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Aug 2022     CPC_宋
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
	setFieldDisableType('custrecord_djkk_admit_final_mail','hidden');
	
	if(type=='view'){
		form.setScript('customscript_djkk_cs_inventory_approval');
		var status = nlapiGetFieldValue('custrecord_djkk_admit_status');
		var adjustId = nlapiGetFieldValue('custrecord_djkk_admit_trans_adjust');
		var error = nlapiGetFieldValue('custrecord_djkk_admit_customer_error');//error
		
		if(status == '2'&& isEmpty(adjustId)&& isEmpty(error)){
			//20230522 changed by zht start  
			//ボタンキャンセルを実行し、最終的に画面を直接ジャンプすることを承認する
			
//			form.addButton('custpage_joken','実行', 'joken();');
			var icId = nlapiGetRecordId();
			var parameter = new Array();
			parameter['icId'] = icId;
			parameter['Status'] = 'approval';
			var rse = nlapiSetRedirectURL('SUITELET', 'customscript_djkk_sl_inventory_approval','customdeploydjkk_sl_inventory_approval',null, parameter);
			//20230522 changed by zht end
			
		}
//		if(status != '2'&&(!isEmpty(adjustId)||!isEmpty(error))){
		if(status != '2'&&(!isEmpty(error))){
			form.addButton('custpage_button','エラーのロールバック','errorback()');
		}
		if(status != '2'){
		if(!isEmpty(nlapiGetFieldValue('custrecord_djkk_admit_re'))){			
			if(nlapiLookupField('customrecord_djkk_invadjst_change_reason', nlapiGetFieldValue('custrecord_djkk_admit_re'), 'custrecord_djkk_wh_contact_flg')=='T'){
				form.addButton('custpage_keepback','倉庫連携移管戻し', 'keepback();');//営業マン
			}							
			}
		}	
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
//  var inIdArray=new Array();
//  var inventorynumberList={};
//  var record=nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
//	var keepFalg='F';
//	if(!isEmpty(record.getFieldValue('custrecord_djkk_admit_re'))){
//		keepFalg=nlapiLookupField('customrecord_djkk_invadjst_change_reason', record.getFieldValue('custrecord_djkk_admit_re'), 'custrecord_djkk_wh_contact_flg');
//	}
//  var count=record.getLineItemCount('recmachcustrecord_djkk_ic_admit');
//  for(var i=1;i<count+1;i++){
//	  var detail_id=record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', i);
//	  if(!isEmpty(detail_id)){
//		  inIdArray.push(detail_id);
//	  }
//	  var theLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_inv_keep','customdeploy_djkk_sl_inv_keep');
//	      theLink +='&keepid=' + record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'id', i);
//	    // if(record.getFieldText('custrecord_djkk_admit_re')=='営業マンキープ'&&record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped', i)!='T'){		
//		   if(keepFalg=='T'){
//	      if(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped', i)!='T'){
//	    	 theLink +='&keeptype=keep';
//	    	 record.setLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeplink', i,theLink);
//	          }
//			}
//		
////	     else if(record.getFieldText('custrecord_djkk_admit_re')=='営業マンキープ戻し'){
////	    	 theLink +='&keeptype=keepback';
////	    	 record.setLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeplink', i,theLink);
////	     }
//		 record.commitLineItem('recmachcustrecord_djkk_ic_admit');
//  }
//  if(!isEmpty(inIdArray)){
//  var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
//		  [
//		     ["internalid","anyof",inIdArray]
//		  ], 
//		  [
//		     new nlobjSearchColumn("internalid"), 
//		     new nlobjSearchColumn("inventorynumber")
//		  ]
//		  );
//     if(!isEmpty(inventorynumberSearch)){
//    	 for(var j=0;j<inventorynumberSearch.length;j++){
//    		 inventorynumberList[inventorynumberSearch[j].getValue("internalid")]=inventorynumberSearch[j].getValue("inventorynumber");
//		 }    	 
//    	 for(var s=1;s<count+1;s++){    		
//    	   	  var detailId=record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', s);    	   	  
//    	   	  if(!isEmpty(detailId)){
//    	   		record.setLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', s, inventorynumberList[detailId]); 
//    	   		record.commitLineItem('recmachcustrecord_djkk_ic_admit');
//    	   	  }    	     	
//    	     }
//    }  
//    
//  }
//  nlapiSubmitRecord(record, false, true);
}
