/**
 * 在庫調整cs
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/11/08     CPC_苑
 *
 */
var saveType='';
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function csclientPageInit(type){
	saveType=type;
	if(nlapiGetFieldValue('customform')=='195'){
		nlapiSetFieldValue('custbody_djkk_trans_appr_deal_flg', 'T');
	}
if(saveType=='create'){
		var date = new Date();
		date.setDate(date.getDate() + 7);
		nlapiSetFieldValue('custbody_djkk_completion_date', nlapiDateToString(date));
	}
if(type=='edit'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'){
	setButtunButtonDisable('tbl__cancel');
	setButtunButtonDisable('tbl_secondary_cancel');
	setButtunButtonDisable('spn_CREATENEW_d1');
	setButtunButtonDisable('spn_secondaryCREATENEW_d1');		
	setButtunButtonDisable('spn_ACTIONMENU_d1');
	setButtunButtonDisable('spn_secondaryACTIONMENU_d1');		
}

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function csclientSaveRecord(){
	debugger;
	var roleValue = nlapiGetRole();
	var userValue = nlapiGetUser();
//	   if((saveType=='create'||saveType=='copy')&&nlapiGetFieldValue('customform')=='195'&&isEmpty(nlapiGetFieldValue('custbody_djkk_ic_admit_id'))){
//		   try{
//			var record=nlapiCreateRecord('customrecord_djkk_ic_admit');		
//			
//			// 主要情報
//			record.setFieldValue('customform', '181');
//			record.setFieldValue('custrecord_djkk_admit_tranid', nlapiGetFieldValue('tranid'));
//			record.setFieldValue('custrecord_djkk_admit_customer', nlapiGetFieldValue('customer'));
//			record.setFieldValue('custrecord_djkk_admit_account', nlapiGetFieldValue('account'));
//			record.setFieldValue('custrecord_djkk_admit_estimatedtotalvalu', nlapiGetFieldValue('estimatedtotalvalue'));
//			record.setFieldValue('custrecord_djkk_admit_trandate', nlapiGetFieldValue('trandate'));
//			record.setFieldValue('custrecord_djkk_admit_postingperiod', nlapiGetFieldValue('postingperiod'));
//			record.setFieldValue('custrecord_djkk_admit_memo', nlapiGetFieldValue('memo'));
//			record.setFieldValue('custrecord_djkk_admit_completion_date', nlapiGetFieldValue('custbody_djkk_completion_date'));//DJ_完了期日
////			record.setFieldValue('custrecord_djkk_admit_transaction_id', nlapiGetFieldValue('transactionnumber'));//DJ_トランザクション番号
//			
//			// 分類
//			record.setFieldValue('custrecord_djkk_admit_subsidiary', nlapiGetFieldValue('subsidiary'));
//			record.setFieldValue('custrecord_djkk_admit_department', nlapiGetFieldValue('department'));
//			record.setFieldValue('custrecord_djkk_admit_class', nlapiGetFieldValue('class'));
//			record.setFieldValue('custrecord_djkk_admit_adjlocation', nlapiGetFieldValue('adjlocation'));
//			record.setFieldValue('custrecord_djkk_admit_re', nlapiGetFieldValue('custbody_djkk_change_reason'));
//			record.setFieldValue('custrecord_djkk_admit_reason', nlapiGetFieldValue('custbody_djkk_waste_reason'));
//			
//			// 承認情報
//			
//			var subsidiary = nlapiGetFieldValue('subsidiary');
//			var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//トランザクション承認管理表
//					[
//					   ["isinactive","is","F"], 
//					   "AND", 
//					   ["custrecord_djkk_trans_appr_obj","anyof",16],
//					   "AND",
//					   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
//					], 
//					[
//					   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //作成ロール
//					   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //第一承認ロール
//					   
//					]
//					);
//			if(!isEmpty(approvalSearch)){
//				for(var j = 0; j < approvalSearch.length; j++){
//					var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//作成ロール
//					var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//第一承認ロール
//					if(createRole == roleValue){
//						record.setFieldValue('custrecord_djkk_admit_create_role',createRole);//DJ_作成ロール
//						record.setFieldValue('custrecord_djkk_admit_next_autho_role',appr1_role); //DJ_次の承認ロール
//					}
//				}
//			}
//			record.setFieldValue('custrecord_djkk_admit_flg', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg'));
//			record.setFieldValue('custrecord_djkk_admit_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status'));
////			record.setFieldValue('custrecord_djkk_admit_create_role', nlapiGetFieldValue('custbody_djkk_trans_appr_create_role'));
//			record.setFieldValue('custrecord_djkk_admit_create_user', userValue);
//			record.setFieldValue('custrecord_djkk_admit_appr_oper_roll', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));
//			record.setFieldValue('custrecord_djkk_admit_acknowledge_operat', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user'));
//			record.setFieldValue('custrecord_djkk_admit_appr_opera_conditi', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));
//			
////			record.setFieldValue('custrecord_djkk_admit_next_autho_role', nlapiGetFieldValue('custbody_djkk_trans_appr_next_role'));
//			record.setFieldValue('custrecord_djkk_admit_next_approver', nlapiGetFieldValue('custbody_djkk_trans_appr_user'));
//			record.setFieldValue('custrecord_djkk_admit_next_appro_criteri', nlapiGetFieldValue('custbody_djkk_trans_appr_cdtn_amt'));
//			record.setFieldValue('custrecord_djkk_admit_first_appro_role', nlapiGetFieldValue('custbody_djkk_trans_appr1_role'));
//			record.setFieldValue('custrecord_djkk_admit_first_approver', nlapiGetFieldValue('custbody_djkk_trans_appr1_user'));
//			record.setFieldValue('custrecord_djkk_admit_second_appr_role', nlapiGetFieldValue('custbody_djkk_trans_appr2_role'));
//			record.setFieldValue('custrecord_djkk_admit_second_approver', nlapiGetFieldValue('custbody_djkk_trans_appr2_user'));
//			
//			record.setFieldValue('custrecord_djkk_admit_third_approva_role', nlapiGetFieldValue('custbody_djkk_trans_appr3_role'));
//			record.setFieldValue('custrecord_djkk_admit_third_approver', nlapiGetFieldValue('custbody_djkk_trans_appr3_user'));
//			record.setFieldValue('custrecord_djkk_admit_fourth_appro_role', nlapiGetFieldValue('custbody_djkk_trans_appr4_role'));
//			record.setFieldValue('custrecord_djkk_admit_fourth_approver', nlapiGetFieldValue('custbody_djkk_trans_appr4_user'));
//			record.setFieldValue('custrecord_djkk_admit_appro_rever_memo', nlapiGetFieldValue('custbody_djkk_approval_reset_memo'));
//			record.setFieldValue('custrecord_djkk_admit_kyaltuka_memo', nlapiGetFieldValue('custbody_djkk_approval_kyaltuka_memo')); //DJ_承認却下メモ // 20230529 add by zhou
//			
//			
//		    var counts=nlapiGetLineItemCount('inventory');
//		    for(var i=1;i<counts+1;i++){
//		    	nlapiSelectLineItem('inventory', i);
//				
//		    	var inventoryDetail=nlapiViewCurrentLineItemSubrecord('inventory','inventorydetail');
//				if(!isEmpty(inventoryDetail)){
//					var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
//					
//					for(var m = 1 ; m < invCount+1 ; m++){
//						inventoryDetail.selectLineItem('inventoryassignment', m);
//						record.selectNewLineItem('recmachcustrecord_djkk_ic_admit');
//						
//						record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_subsidiary',getRoleSubsidiary());
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', i);	    	
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item', nlapiGetCurrentLineItemValue('inventory', 'item'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', nlapiGetCurrentLineItemValue('inventory', 'description'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse', nlapiGetCurrentLineItemValue('inventory', 'location'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit', nlapiGetCurrentLineItemValue('inventory', 'units'));		    	
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', nlapiGetCurrentLineItemValue('inventory', 'quantityonhand'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_current_value', nlapiGetCurrentLineItemValue('inventory', 'currentvalue'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty', nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty', nlapiGetCurrentLineItemValue('inventory', 'newquantity'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_predi_unit_price', nlapiGetCurrentLineItemValue('inventory', 'unitcost'));			    				    	
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_section', nlapiGetCurrentLineItemValue('inventory', 'department'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', nlapiGetCurrentLineItemValue('inventory', 'class'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_reason_for_change', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_memo_i', nlapiGetCurrentLineItemValue('inventory', 'memo'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_admit_detail_keeped'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_remars', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_remars'));//DJ_備考
//						if(!isEmpty(inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'))){
//							record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'));
//						}else{
//							record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber'));	
//						}	    	
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));
//				    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));    			    	
//				    	record.commitLineItem('recmachcustrecord_djkk_ic_admit');	
//					}
//				}else{
//					alert(1+''+getRoleSubsidiary())	
//					
//					record.selectNewLineItem('recmachcustrecord_djkk_ic_admit');
//					record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_subsidiary',getRoleSubsidiary());
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', i);	    	
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item', nlapiGetCurrentLineItemValue('inventory', 'item'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', nlapiGetCurrentLineItemValue('inventory', 'description'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse', nlapiGetCurrentLineItemValue('inventory', 'location'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit', nlapiGetCurrentLineItemValue('inventory', 'units'));		    	
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', nlapiGetCurrentLineItemValue('inventory', 'quantityonhand'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_current_value', nlapiGetCurrentLineItemValue('inventory', 'currentvalue'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty', nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty', nlapiGetCurrentLineItemValue('inventory', 'newquantity'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_predi_unit_price', nlapiGetCurrentLineItemValue('inventory', 'unitcost'));			    				    	
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_section', nlapiGetCurrentLineItemValue('inventory', 'department'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', nlapiGetCurrentLineItemValue('inventory', 'class'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_reason_for_change', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_memo_i', nlapiGetCurrentLineItemValue('inventory', 'memo'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_admit_detail_keeped'));
//			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_remars', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_remars'));//DJ_備考
//			    	record.commitLineItem('recmachcustrecord_djkk_ic_admit');
//				}
//				
//		    }
//		    
//			var custRecordId=nlapiSubmitRecord(record, true, true);
//			var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_ic_admit',custRecordId, 'VIEW');
//			window.ischanged = false;
//			window.location.href=theLink;	   			
//			 return false;
//	   }catch(e){
//		   alert(e.message);
//		   return false;
//	   }			
//	 }

	   if(saveType=='edit'&&nlapiGetFieldValue('custbody_cache_data_flag')=='T'&&!isEmpty(nlapiGetFieldValue('custbody_djkk_ic_admit_id'))){
	   try{
		var record= nlapiLoadRecord('customrecord_djkk_ic_admit',nlapiGetFieldValue('custbody_djkk_ic_admit_id'));
				
		// 主要情報
		record.setFieldValue('customform', '181');
		record.setFieldValue('custrecord_djkk_admit_tranid', nlapiGetFieldValue('tranid'));
		record.setFieldValue('custrecord_djkk_admit_customer', nlapiGetFieldValue('customer'));
		record.setFieldValue('custrecord_djkk_admit_account', nlapiGetFieldValue('account'));
		record.setFieldValue('custrecord_djkk_admit_estimatedtotalvalu', nlapiGetFieldValue('estimatedtotalvalue'));
		record.setFieldValue('custrecord_djkk_admit_trandate', nlapiGetFieldValue('trandate'));
		record.setFieldValue('custrecord_djkk_admit_postingperiod', nlapiGetFieldValue('postingperiod'));
		record.setFieldValue('custrecord_djkk_admit_memo', nlapiGetFieldValue('memo'));
		record.setFieldValue('custrecord_djkk_admit_completion_date', nlapiGetFieldValue('custbody_djkk_completion_date'));//DJ_完了期日
//		record.setFieldValue('custrecord_djkk_admit_transaction_id', nlapiGetFieldValue('transactionnumber'));//DJ_トランザクション番号
		record.setFieldValue('custrecord_djkk_admit_trans_adjust', '');  //DJ_在庫調整 20230616 add by zhou
		
		// 分類
		record.setFieldValue('custrecord_djkk_admit_subsidiary', nlapiGetFieldValue('subsidiary'));
		record.setFieldValue('custrecord_djkk_admit_department', nlapiGetFieldValue('department'));
		record.setFieldValue('custrecord_djkk_admit_class', nlapiGetFieldValue('class'));
		record.setFieldValue('custrecord_djkk_admit_adjlocation', nlapiGetFieldValue('adjlocation'));
		record.setFieldValue('custrecord_djkk_admit_re', nlapiGetFieldValue('custbody_djkk_change_reason'));
		record.setFieldValue('custrecord_djkk_admit_reason', nlapiGetFieldValue('custbody_djkk_waste_reason'));
		
		// 承認情報
		record.setFieldValue('custrecord_djkk_admit_flg', nlapiGetFieldValue('custbody_djkk_trans_appr_deal_flg'));
		record.setFieldValue('custrecord_djkk_admit_status', nlapiGetFieldValue('custbody_djkk_trans_appr_status'));
		record.setFieldValue('custrecord_djkk_admit_create_role', nlapiGetFieldValue('custbody_djkk_trans_appr_create_role'));
		if(!isEmpty(nlapiGetFieldValue('custbody_djkk_trans_appr_create_user'))){
			userValue =  nlapiGetFieldValue('custbody_djkk_trans_appr_create_user')
		}
		record.setFieldValue('custrecord_djkk_admit_create_user', userValue);
		record.setFieldValue('custrecord_djkk_admit_appr_oper_roll', nlapiGetFieldValue('custbody_djkk_trans_appr_dev'));
		record.setFieldValue('custrecord_djkk_admit_acknowledge_operat', nlapiGetFieldValue('custbody_djkk_trans_appr_dev_user'));
		record.setFieldValue('custrecord_djkk_admit_appr_opera_conditi', nlapiGetFieldValue('custbody_djkk_trans_appr_do_cdtn_amt'));
		
		record.setFieldValue('custrecord_djkk_admit_next_autho_role', nlapiGetFieldValue('custbody_djkk_trans_appr_next_role'));
		record.setFieldValue('custrecord_djkk_admit_next_approver', nlapiGetFieldValue('custbody_djkk_trans_appr_user'));
		record.setFieldValue('custrecord_djkk_admit_next_appro_criteri', nlapiGetFieldValue('custbody_djkk_trans_appr_cdtn_amt'));
		record.setFieldValue('custrecord_djkk_admit_first_appro_role', nlapiGetFieldValue('custbody_djkk_trans_appr1_role'));
		record.setFieldValue('custrecord_djkk_admit_first_approver', nlapiGetFieldValue('custbody_djkk_trans_appr1_user'));
		record.setFieldValue('custrecord_djkk_admit_second_appr_role', nlapiGetFieldValue('custbody_djkk_trans_appr2_role'));
		record.setFieldValue('custrecord_djkk_admit_second_approver', nlapiGetFieldValue('custbody_djkk_trans_appr2_user'));
		
		record.setFieldValue('custrecord_djkk_admit_third_approva_role', nlapiGetFieldValue('custbody_djkk_trans_appr3_role'));
		record.setFieldValue('custrecord_djkk_admit_third_approver', nlapiGetFieldValue('custbody_djkk_trans_appr3_user'));
		record.setFieldValue('custrecord_djkk_admit_fourth_appro_role', nlapiGetFieldValue('custbody_djkk_trans_appr4_role'));
		record.setFieldValue('custrecord_djkk_admit_fourth_approver', nlapiGetFieldValue('custbody_djkk_trans_appr4_user'));
		record.setFieldValue('custrecord_djkk_admit_appro_rever_memo', nlapiGetFieldValue('custbody_djkk_approval_reset_memo'));
		record.setFieldValue('custrecord_djkk_admit_kyaltuka_memo', nlapiGetFieldValue('custbody_djkk_approval_kyaltuka_memo')); //DJ_承認却下メモ // 20230529 add by zhou
		
		var recordCount=record.getLineItemCount('recmachcustrecord_djkk_ic_admit');
		for(var w=recordCount;w>0;w--){
			record.removeLineItem('recmachcustrecord_djkk_ic_admit', w);
		}
	    var counts=nlapiGetLineItemCount('inventory');
	    for(var i=1;i<counts+1;i++){
	    	nlapiSelectLineItem('inventory', i);
			
	    	var inventoryDetail=nlapiViewCurrentLineItemSubrecord('inventory','inventorydetail');
			if(!isEmpty(inventoryDetail)){
				var invCount = inventoryDetail.getLineItemCount('inventoryassignment');
				
				for(var m = 1 ; m < invCount+1 ; m++){
					inventoryDetail.selectLineItem('inventoryassignment', m);
					record.selectNewLineItem('recmachcustrecord_djkk_ic_admit');
					record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_subsidiary',nlapiGetFieldValue('subsidiary'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', i);	    	
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item', nlapiGetCurrentLineItemValue('inventory', 'item'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', nlapiGetCurrentLineItemValue('inventory', 'description'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse', nlapiGetCurrentLineItemValue('inventory', 'location'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit', nlapiGetCurrentLineItemValue('inventory', 'units'));		    	
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', nlapiGetCurrentLineItemValue('inventory', 'quantityonhand'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_current_value', nlapiGetCurrentLineItemValue('inventory', 'currentvalue'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty', nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty', nlapiGetCurrentLineItemValue('inventory', 'newquantity'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_predi_unit_price', nlapiGetCurrentLineItemValue('inventory', 'unitcost'));			    				    	
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_section', nlapiGetCurrentLineItemValue('inventory', 'department'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', nlapiGetCurrentLineItemValue('inventory', 'class'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_reason_for_change', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_memo_i', nlapiGetCurrentLineItemValue('inventory', 'memo'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_admit_detail_keeped'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_remars', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_remars'));//DJ_備考
					if(!isEmpty(inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'))){						
						record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber'));
						record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber'));
						//record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail',inventoryDetail.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber'));
					}else{
						record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber'));	
					}	    	
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo'));
			    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity',inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity'));    
			    	record.commitLineItem('recmachcustrecord_djkk_ic_admit');	
				}
			}else{
				record.selectNewLineItem('recmachcustrecord_djkk_ic_admit');
				record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_subsidiary',getRoleSubsidiary());
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', i);	    	
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item', nlapiGetCurrentLineItemValue('inventory', 'item'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', nlapiGetCurrentLineItemValue('inventory', 'description'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse', nlapiGetCurrentLineItemValue('inventory', 'location'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit', nlapiGetCurrentLineItemValue('inventory', 'units'));		    	
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', nlapiGetCurrentLineItemValue('inventory', 'quantityonhand'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_current_value', nlapiGetCurrentLineItemValue('inventory', 'currentvalue'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty', nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty', nlapiGetCurrentLineItemValue('inventory', 'newquantity'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_predi_unit_price', nlapiGetCurrentLineItemValue('inventory', 'unitcost'));			    				    	
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_section', nlapiGetCurrentLineItemValue('inventory', 'department'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', nlapiGetCurrentLineItemValue('inventory', 'class'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_reason_for_change', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_memo_i', nlapiGetCurrentLineItemValue('inventory', 'memo'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_admit_detail_keeped'));
		    	record.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_remars', nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_remars'));//DJ_備考
		    	record.commitLineItem('recmachcustrecord_djkk_ic_admit');
			}
			
	    }
	    
		var custRecordId=nlapiSubmitRecord(record, true, true);
		var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_ic_admit',custRecordId, 'VIEW');
		var delLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inventory_approval','customdeploydjkk_sl_inventory_approval');
		delLink += '&deleteRecordId=' + nlapiGetRecordId();
		
		nlapiRequestURL(delLink);
		window.ischanged = false;
		window.location.href=theLink;
		 return false;
   }catch(e){
	   alert(e.message);
	   return false;
   }
		
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
function csclientFieldChanged(type, name, linenum){
 if(name=='department'&&type!='inventory'){
   var department=nlapiGetFieldValue('department');
   var count=nlapiGetLineItemCount('inventory');
   for(var i=1;i<count+1;i++){
	  nlapiSelectLineItem('inventory', i);
	  nlapiSetCurrentLineItemValue('inventory', 'department', department, false, true);
	  nlapiCommitLineItem('inventory');
   }
 }
 if(name=='custbody_djkk_change_reason'&&type!='inventory'){
	
	   var reason=nlapiGetFieldValue('custbody_djkk_change_reason');
	   var count=nlapiGetLineItemCount('inventory');
	   for(var i=1;i<count+1;i++){
		   nlapiSelectLineItem('inventory', i);
		nlapiSetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons', reason, false, true);
		nlapiCommitLineItem('inventory');
	   }
	 }
 if(type=='inventory'&&(name=='item'||name=='department'||name=='custcol_djkk_change_reasons')){
	 
	 var department=nlapiGetFieldValue('department');	 
	 if(isEmpty(nlapiGetCurrentLineItemValue('inventory', 'department'))){
	  nlapiSetCurrentLineItemValue('inventory', 'department', department, false, true);
	 }
	  var reason=nlapiGetFieldValue('custbody_djkk_change_reason');
	  if(isEmpty(nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons'))){
	  nlapiSetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons', reason, false, true);
	  }
 }
}
