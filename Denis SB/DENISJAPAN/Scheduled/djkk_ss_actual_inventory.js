/**
 * DJ_実地棚卸承認画面SS
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Dec 2022     宋
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
//実地棚卸作成在庫調整
function scheduled(type) {
	try{
		var recId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_recordid');
		var record = nlapiLoadRecord('customrecord_djkk_body_shedunloading',recId);
		var subsidiary = record.getFieldValue('custrecord_djkk_shedunloading_sub');//連結
		var headLocation = record.getFieldValue('custrecord_djkk_shedunloading_location');//場所
		var trandate = record.getFieldValue('custrecord_djkk_shedunloading_date');//日付
		var count = record.getLineItemCount('recmachcustrecord_djkk_body_shedunloading_list');//明細
		var rec2 = nlapiCreateRecord('inventoryadjustment');
		rec2.setFieldValue('subsidiary',subsidiary);//子会社
		rec2.setFieldValue('trandate',  trandate); //日付
		var resonId = '1'
		var reasonSearch = nlapiSearchRecord("customrecord_djkk_invadjst_change_reason",null,
				[
				 ["custrecord_djkk_reson_subsidiary","anyof",subsidiary], 
				 "AND", 
				 ["name","contains","棚卸"]
				 ], 
				 [
				  new nlobjSearchColumn("internalid")
				  ]
			);
		if(!isEmpty(reasonSearch)){
			resonId=reasonSearch[0].getValue('internalid');
		}
		rec2.setFieldValue('custbody_djkk_change_reason', resonId); //DJ_変更理由
		rec2.setFieldValue('account', nlapiLookupField('customrecord_djkk_invadjst_change_reason', resonId, 'custrecord_djkk_account')); //調整勘定科目
		rec2.setFieldValue('custbody_djkk_trans_appr_status', '2');//DJ_承認ステータス
		if(subsidiary==SUB_NBKK || subsidiary==SUB_ULKK){
			rec2.setFieldValue('customform', '156'); //カスタムフォーム
		}else if(subsidiary==SUB_DPKK || subsidiary==SUB_SCETI){
			rec2.setFieldValue('customform', '180'); //カスタムフォーム
		}
		var itemCountArray=new Array();
		for(var s=1;s<count+1;s++){
			itemCountArray.push(record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_lin_num', s));//DJ_明細行番号
		}
		itemCountArray=unique(itemCountArray);
		for(var i=0;i<itemCountArray.length;i++){
			rec2.selectNewLineItem('inventory');
			
			for(var n=1;n<count+1;n++){
			
				if(record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_lin_num', n)==itemCountArray[i]){					
					rec2.setCurrentLineItemValue('inventory', 'item', record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_shed_item',n));//item
					rec2.setCurrentLineItemValue('inventory', 'description', record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_item_memo',n));//説明
					rec2.setCurrentLineItemValue('inventory', 'location', record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_location',n));//場所
					rec2.setCurrentLineItemValue('inventory', 'adjustqtyby',record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_actual_quantity',n)-record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_library',n));//調整数量
					rec2.setCurrentLineItemValue('inventory', 'class', record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_brand',n));//ブランド
					rec2.setCurrentLineItemValue('inventory', 'memo', record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_explain',n));//メモ 
					
					var inventoryDetail=rec2.createCurrentLineItemSubrecord('inventory','inventorydetail');
					inventoryDetail.selectNewLineItem('inventoryassignment');
					
					inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_inv_no', n));//管理番号（シリアル/ロット番号）
					
					var binnumberId = record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_binnumber',n);
					nlapiLogExecution('debug', 'binnumberId', binnumberId);
					inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_binnumber',n));

					
					var actual_quantity = record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_actual_quantity',n);//DJ_実地数量
					var library = record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_library',n);//DJ_在庫数量
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity',actual_quantity-library);
				
					inventoryDetail.commitLineItem('inventoryassignment');
					inventoryDetail.commit();
				}
				
			}
			rec2.commitLineItem('inventory');
		}
		var recid = nlapiSubmitRecord(rec2);
		//20230602 changed by zht start
//		nlapiSubmitField('customrecord_djkk_body_shedunloading',recId, 'custrecord_djkk_shedunloading_finished', 1);
//		nlapiLogExecution('debug', 'test8', recid);
//		nlapiSubmitField('customrecord_djkk_body_shedunloading',recId, 'custrecord_djkk_shedunloading_adjust', recid);
		record.setFieldValue('custrecord_djkk_shedunloading_finished',1);
		record.setFieldValue('custrecord_djkk_shedunloading_adjust',recid);
		nlapiSubmitRecord(record ,false,true);
		//20230602 changed by zht end
	}
	catch(e){
		//20230602 changed by zht start
		//20230602 zht memo:
		//このエラーログ「nlobjSearchFilterに無効な演算子が含まれているか、適切なシンタックス：roleではありません。」をトリガすると、このエラーは、
		//DJ _実際の棚揚げ承認画面のあるコード検証userの場合、検証は余計であり、
		//業務の進行に影響を与えないことは避けられないかもしれない。
		nlapiLogExecution('debug', 'エラー', e.message);
		if(!isEmpty(recid)){
			nlapiSubmitField('customrecord_djkk_body_shedunloading',recId, 'custrecord_djkk_shedunloading_finished', 1);
		}else if(isEmpty(recid) && !isEmpty(e.message)){
			nlapiSubmitField('customrecord_djkk_body_shedunloading',recId, 'custrecord_djkk_shedunloading_finished', 2);
		}
		//20230602 changed by zht end
	}
}
