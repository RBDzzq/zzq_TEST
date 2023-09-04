/**
 * DJ_在庫調整承認画面のSL
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Aug 2022     CPC_宋
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	try{
		var recId = request.getParameter('icId');
//		var user = nlapiGetUser();
//		var userSubsidiry = nlapiGetSubsidiary();
//		
//		var subsidiary = nlapiLookupField('customrecord_djkk_ic_admit',recId,'custrecord_djkk_admit_subsidiary');//子会社
//		nlapiLogExecution('debug','user',user)
//		nlapiLogExecution('debug','subsidiary',subsidiary)
//		nlapiLogExecution('debug','userSubsidiryBefore',userSubsidiry)
//		
//		var employeeRecord = nlapiLoadRecord('employee',user);
//		employeeRecord.setFieldValue('subsidiary',subsidiary);
//		nlapiSubmitRecord(employeeRecord);
//		
//		nlapiSubmitField('employee',user, 'subsidiary', subsidiary);
//		sleep('500');
//		var userSubsidiryAfter1 = nlapiGetSubsidiary();
//		var userSubsidiryAfter2 = nlapiLookupField('employee',user,'subsidiary');
//		nlapiLogExecution('debug','userSubsidiryAfter1',userSubsidiryAfter1)
//		nlapiLogExecution('debug','userSubsidiryAfter2',userSubsidiryAfter2)
		
//		var recId = request.getParameter('icId');
		
		var Status = request.getParameter('Status');
		
		var deleteRecordId = request.getParameter('deleteRecordId');
		if(!isEmpty(deleteRecordId)){
			nlapiLogExecution('debug', 'deleteRecordId',deleteRecordId);
			var scheduleparams = new Array();
			scheduleparams['custscript_djkk_deleterecordtype'] = 'inventoryadjustment';
			scheduleparams['custscript_djkk_deleterecordid'] = deleteRecordId;
			runBatch('customscript_djkk_ss_trandata_delete', 'customdeploy_djkk_ss_trandata_deleterec', scheduleparams);
		}else{							
		var record = nlapiLoadRecord('customrecord_djkk_ic_admit',recId);
		//20230616 add by zhou start
		if(Status=='edit'){
			var inventoryadjustmentId = record.getFieldValue('custrecord_djkk_admit_trans_adjust');//DJ_在庫調整標準画面id
			if(!isEmpty(inventoryadjustmentId)){
				nlapiLogExecution('debug','inventoryadjustment',inventoryadjustmentId)
				throw nlapiCreateError('システムエラー','現在実行中のオペレータがいます。「エラーのロールバック」ボタンをクリックして異常を取り除いてから試してください',true);
			}
		}
		//20230616 add by zhou end
		var tranid=record.getFieldValue('custrecord_djkk_admit_tranid');//参照番号
		var subsidiary = record.getFieldValue('custrecord_djkk_admit_subsidiary');//子会社
		
		var account = record.getFieldValue('custrecord_djkk_admit_account');//調整勘定科目
		var estimatedtotalvalu = record.getFieldValue('custrecord_djkk_admit_estimatedtotalvalu');//DJ_推定総価値
		var trandate = record.getFieldValue('custrecord_djkk_admit_trandate');//DJ_日付
		var postingperiod = record.getFieldValue('custrecord_djkk_admit_postingperiod');//DJ_記帳期間
		var admitRe = record.getFieldValue('custrecord_djkk_admit_re');//変更理由
		var customer = record.getFieldValue('custrecord_djkk_admit_customer');//DJ_顧客
		var headMemo = record.getFieldValue('custrecord_djkk_admit_memo');//DJ_メモ
		var headClass = record.getFieldValue('custrecord_djkk_admit_class');//DJ_ブランド
		var headDepartment = record.getFieldValue('custrecord_djkk_admit_department');//DJ_セクション
		var headReason = record.getFieldValue('custrecord_djkk_admit_reason');//DJ_廃棄理由
		var headAdjlocation = record.getFieldValue('custrecord_djkk_admit_adjlocation');//DJ_調整場所
		var completionDate = record.getFieldValue('custrecord_djkk_admit_completion_date');//DJ_完了期日
		var count=record.getLineItemCount('recmachcustrecord_djkk_ic_admit');  //明細				
		
		var rec2 = nlapiCreateRecord('inventoryadjustment');
		if(Status=='edit'){
			rec2.setFieldValue('custbody_cache_data_flag','T');//DJ_キャッシュデータフラグ			
		}
		rec2.setFieldValue('tranid',tranid);//参照番号
		rec2.setFieldValue('subsidiary',subsidiary);//子会社
		rec2.setFieldValue('trandate',  trandate); //日付
		rec2.setFieldValue('custbody_djkk_change_reason', admitRe);//変更理由	
		rec2.setFieldValue('account',account);//調整勘定科目
		rec2.setFieldValue('estimatedtotalvalue',estimatedtotalvalu);//推定総価値
		rec2.setFieldValue('postingperiod',postingperiod);//記帳期間
		rec2.setFieldValue('customer', customer);//顧客
		rec2.setFieldValue('memo', headMemo);//メモ
		rec2.setFieldValue('class', headClass);//ブランド
		rec2.setFieldValue('department', headDepartment);//セクション
		rec2.setFieldValue('custbody_djkk_waste_reason', headReason);//廃棄理由
		rec2.setFieldValue('adjlocation', headAdjlocation);//調整場所
		rec2.setFieldValue('custbody_djkk_completion_date', completionDate);//DJ_完了期日
		rec2.setFieldValue('custbody_djkk_ic_admit_id', recId);//DJ_在庫調整
		if(Status=='approval'){
			rec2.setFieldValue('custbody_djkk_trans_appr_status', '2');//DJ_承認ステータス		
		}
      
      rec2.setFieldValue('custbody_djkk_trans_appr_deal_flg', record.getFieldValue('custrecord_djkk_admit_flg'));
		rec2.setFieldValue('custbody_djkk_trans_appr_status', record.getFieldValue('custrecord_djkk_admit_status'));
		rec2.setFieldValue('custbody_djkk_trans_appr_create_role', record.getFieldValue('custrecord_djkk_admit_create_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr_create_user', record.getFieldValue('custrecord_djkk_admit_create_user'));
		rec2.setFieldValue('custbody_djkk_trans_appr_dev', record.getFieldValue('custrecord_djkk_admit_appr_oper_roll'));
		rec2.setFieldValue('custbody_djkk_trans_appr_dev_user', record.getFieldValue('custrecord_djkk_admit_acknowledge_operat'));
		rec2.setFieldValue('custbody_djkk_trans_appr_do_cdtn_amt', record.getFieldValue('custrecord_djkk_admit_appr_opera_conditi'));
		
		rec2.setFieldValue('custbody_djkk_trans_appr_next_role', record.getFieldValue('custrecord_djkk_admit_next_autho_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr_user', record.getFieldValue('custrecord_djkk_admit_next_approver'));
		rec2.setFieldValue('custbody_djkk_trans_appr_cdtn_amt', record.getFieldValue('custrecord_djkk_admit_next_appro_criteri'));
		rec2.setFieldValue('custbody_djkk_trans_appr1_role', record.getFieldValue('custrecord_djkk_admit_first_appro_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr1_user', record.getFieldValue('custrecord_djkk_admit_first_approver'));
		rec2.setFieldValue('custbody_djkk_trans_appr2_role', record.getFieldValue('custrecord_djkk_admit_second_appr_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr2_user', record.getFieldValue('custrecord_djkk_admit_second_approver'));
		
		rec2.setFieldValue('custbody_djkk_trans_appr3_role', record.getFieldValue('custrecord_djkk_admit_third_approva_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr3_user', record.getFieldValue('custrecord_djkk_admit_third_approver'));
		rec2.setFieldValue('custbody_djkk_trans_appr4_role', record.getFieldValue('custrecord_djkk_admit_fourth_appro_role'));
		rec2.setFieldValue('custbody_djkk_trans_appr4_user', record.getFieldValue('custrecord_djkk_admit_fourth_approver'));
		rec2.setFieldValue('custbody_djkk_approval_reset_memo', record.getFieldValue('custrecord_djkk_admit_appro_rever_memo'));
		rec2.setFieldValue('custbody_djkk_approval_kyaltuka_memo', record.getFieldValue('custrecord_djkk_admit_kyaltuka_memo')); //DJ_承認却下メモ // 20230529 add by zhou
		
		if(subsidiary==SUB_NBKK || subsidiary==SUB_ULKK){
			rec2.setFieldValue('customform', '156'); //customform
		}else if(subsidiary==SUB_DPKK || subsidiary==SUB_SCETI){
			rec2.setFieldValue('customform', '180'); //customform
		}
		
		
		var itemCountArray=new Array();
		for(var s=1;s<count+1;s++){
			itemCountArray.push(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', s));//line num
		}
		itemCountArray=unique(itemCountArray);
		for(var i=0;i<itemCountArray.length;i++){
			var inc=1;
			rec2.selectNewLineItem('inventory');
			for(var n=1;n<count+1;n++){
				
				if(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', n)==itemCountArray[i]){
					if(inc==1){

						
						rec2.setCurrentLineItemValue('inventory', 'item', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item',n));//item
						rec2.setCurrentLineItemValue('inventory', 'description', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain',n));//説明
						rec2.setCurrentLineItemValue('inventory', 'location', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse',n));//場所
						rec2.setCurrentLineItemValue('inventory', 'units', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit',n));//単位
						rec2.setCurrentLineItemValue('inventory', 'quantityonhand', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty',n));//在庫数量
						rec2.setCurrentLineItemValue('inventory', 'adjustqtyby', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty',n));//調整数量
						rec2.setCurrentLineItemValue('inventory', 'newquantity', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty',n));//新しい数量
						rec2.setCurrentLineItemValue('inventory', 'unitcost', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_predi_unit_price',n));//予測単価
						rec2.setCurrentLineItemValue('inventory', 'department', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_section',n));//セクション
						rec2.setCurrentLineItemValue('inventory', 'class', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand',n));//ブランド
						rec2.setCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_reason_for_change',n));//変更理由
						rec2.setCurrentLineItemValue('inventory', 'memo', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_memo_i',n));//メモ 
						rec2.setCurrentLineItemValue('inventory', 'custcol_djkk_admit_detail_keeped', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_keeped',n));//DJ_営業マンキープ済み
						rec2.setCurrentLineItemValue('inventory', 'custcol_djkk_remars', record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_remars',n));//DJ_備考
					
					if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n))
							||!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', n))){
						var inventoryDetail=rec2.createCurrentLineItemSubrecord('inventory','inventorydetail');
						inventoryDetail.selectNewLineItem('inventoryassignment');
												
						if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n))){
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n));
				    	}else{
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', n));
				    	}
						inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity', n));
				    						    	
						inventoryDetail.commitLineItem('inventoryassignment');
						inventoryDetail.commit();
					}
					}else{
						if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n))
								||!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', n))){
						var inventoryDetail=rec2.editCurrentLineItemSubrecord('inventory','inventorydetail');
						inventoryDetail.selectNewLineItem('inventoryassignment');

				    	if(!isEmpty(record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n))){
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','issueinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', n));
				    	}else{
				    		inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', n));
				    	}
				    					    	
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','expirationdate',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_remark',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo', n));
				    	inventoryDetail.setCurrentLineItemValue('inventoryassignment','quantity',record.getLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity', n));
				    						    	
						inventoryDetail.commitLineItem('inventoryassignment');
						inventoryDetail.commit();
						}
					}
					inc++;
				}	
				
			}
			rec2.commitLineItem('inventory');
		}
		nlapiLogExecution('debug', '1');
		var rec2id = nlapiSubmitRecord(rec2,false,true);
		if(Status=='approval'){
			nlapiSubmitField('customrecord_djkk_ic_admit',recId, ['custrecord_djkk_admit_trans_adjust','custrecord_djkk_admit_create_status'], [rec2id,'1']); //DJ_在庫調整 /DJ_在庫調整作成ステータス	
			nlapiSetRedirectURL('RECORD', 'inventoryadjustment',rec2id, 'VIEW');//20230531 add by zht
		}
		
		else if(Status=='edit'){
			nlapiSubmitField('customrecord_djkk_ic_admit',recId, 'custrecord_djkk_admit_trans_adjust',rec2id); //DJ_在庫調整 /DJ_在庫調整作成ステータス	
			var delRecord=nlapiCreateRecord('customrecord_djkk_transact_data_delete');
			delRecord.setFieldValue('custrecord_djkk_del_trantype', '在庫調整');
			delRecord.setFieldValue('custrecord_djkk_del_recordtype', 'inventoryadjustment');
			delRecord.setFieldValue('custrecord_djkk_del_internalid', rec2id);
			delRecord.setFieldValue('custrecord_djkk_del_url', nlapiResolveURL('RECORD', 'inventoryadjustment',rec2id, 'VIEW'));
			nlapiSubmitRecord(delRecord);
		}
		response.write(rec2id);
//		nlapiSubmitField('employee',user, 'subsidiary', userSubsidiry);
	}
	}
	catch(e){
		nlapiLogExecution('debug', 'エラー', e.message);
		nlapiLogExecution('debug', 'e', e);
		var record = nlapiLoadRecord('customrecord_djkk_ic_admit',recId);
		record.setFieldValue('custrecord_djkk_admit_customer_error',e.message);
		nlapiSubmitRecord(record);
		response.write('異常発生:'+ e.message);
//		nlapiSubmitField('employee',user, 'subsidiary', userSubsidiry);
	}
}