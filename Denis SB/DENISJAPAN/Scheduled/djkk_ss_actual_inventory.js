/**
 * DJ_���n�I�����F���SS
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Dec 2022     �v
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
//���n�I���쐬�݌ɒ���
function scheduled(type) {
	try{
		var recId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_recordid');
		var record = nlapiLoadRecord('customrecord_djkk_body_shedunloading',recId);
		var subsidiary = record.getFieldValue('custrecord_djkk_shedunloading_sub');//�A��
		var headLocation = record.getFieldValue('custrecord_djkk_shedunloading_location');//�ꏊ
		var trandate = record.getFieldValue('custrecord_djkk_shedunloading_date');//���t
		var count = record.getLineItemCount('recmachcustrecord_djkk_body_shedunloading_list');//����
		var rec2 = nlapiCreateRecord('inventoryadjustment');
		rec2.setFieldValue('subsidiary',subsidiary);//�q���
		rec2.setFieldValue('trandate',  trandate); //���t
		var resonId = '1'
		var reasonSearch = nlapiSearchRecord("customrecord_djkk_invadjst_change_reason",null,
				[
				 ["custrecord_djkk_reson_subsidiary","anyof",subsidiary], 
				 "AND", 
				 ["name","contains","�I��"]
				 ], 
				 [
				  new nlobjSearchColumn("internalid")
				  ]
			);
		if(!isEmpty(reasonSearch)){
			resonId=reasonSearch[0].getValue('internalid');
		}
		rec2.setFieldValue('custbody_djkk_change_reason', resonId); //DJ_�ύX���R
		rec2.setFieldValue('account', nlapiLookupField('customrecord_djkk_invadjst_change_reason', resonId, 'custrecord_djkk_account')); //��������Ȗ�
		rec2.setFieldValue('custbody_djkk_trans_appr_status', '2');//DJ_���F�X�e�[�^�X
		if(subsidiary==SUB_NBKK || subsidiary==SUB_ULKK){
			rec2.setFieldValue('customform', '156'); //�J�X�^���t�H�[��
		}else if(subsidiary==SUB_DPKK || subsidiary==SUB_SCETI){
			rec2.setFieldValue('customform', '180'); //�J�X�^���t�H�[��
		}
		var itemCountArray=new Array();
		for(var s=1;s<count+1;s++){
			itemCountArray.push(record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_lin_num', s));//DJ_���׍s�ԍ�
		}
		itemCountArray=unique(itemCountArray);
		for(var i=0;i<itemCountArray.length;i++){
			rec2.selectNewLineItem('inventory');
			
			for(var n=1;n<count+1;n++){
			
				if(record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_lin_num', n)==itemCountArray[i]){					
					rec2.setCurrentLineItemValue('inventory', 'item', record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_shed_item',n));//item
					rec2.setCurrentLineItemValue('inventory', 'description', record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_item_memo',n));//����
					rec2.setCurrentLineItemValue('inventory', 'location', record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_location',n));//�ꏊ
					rec2.setCurrentLineItemValue('inventory', 'adjustqtyby',record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_actual_quantity',n)-record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_library',n));//��������
					rec2.setCurrentLineItemValue('inventory', 'class', record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_brand',n));//�u�����h
					rec2.setCurrentLineItemValue('inventory', 'memo', record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_explain',n));//���� 
					
					var inventoryDetail=rec2.createCurrentLineItemSubrecord('inventory','inventorydetail');
					inventoryDetail.selectNewLineItem('inventoryassignment');
					
					inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_inv_no', n));//�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j
					
					var binnumberId = record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_binnumber',n);
					nlapiLogExecution('debug', 'binnumberId', binnumberId);
					inventoryDetail.setCurrentLineItemValue('inventoryassignment','binnumber',record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_binnumber',n));

					
					var actual_quantity = record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_actual_quantity',n);//DJ_���n����
					var library = record.getLineItemValue('recmachcustrecord_djkk_body_shedunloading_list','custrecord_djkk_library',n);//DJ_�݌ɐ���
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
		//���̃G���[���O�unlobjSearchFilter�ɖ����ȉ��Z�q���܂܂�Ă��邩�A�K�؂ȃV���^�b�N�X�Frole�ł͂���܂���B�v���g���K����ƁA���̃G���[�́A
		//DJ _���ۂ̒I�g�����F��ʂ̂���R�[�h����user�̏ꍇ�A���؂͗]�v�ł���A
		//�Ɩ��̐i�s�ɉe����^���Ȃ����Ƃ͔������Ȃ���������Ȃ��B
		nlapiLogExecution('debug', '�G���[', e.message);
		if(!isEmpty(recid)){
			nlapiSubmitField('customrecord_djkk_body_shedunloading',recId, 'custrecord_djkk_shedunloading_finished', 1);
		}else if(isEmpty(recid) && !isEmpty(e.message)){
			nlapiSubmitField('customrecord_djkk_body_shedunloading',recId, 'custrecord_djkk_shedunloading_finished', 2);
		}
		//20230602 changed by zht end
	}
}
