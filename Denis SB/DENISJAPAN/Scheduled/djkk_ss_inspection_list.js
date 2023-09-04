/**
 * ���i�q�Ɉړ�
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jul 2021     admin
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug','', '�݌Ɉړ��J�n');
	
	var str = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_inspection_list_info');

	var arr = str.split(',')

	nlapiLogExecution('DEBUG', '���s�Ώ�', str);
	
	//�s�Ǖi�q�ɑ��M�p
	var badLocationArr = new Array();
	
	//���i�Ώۂ���������
	for(var i = 0 ; i < arr.length ; i++){
		governanceYield();
		var id = arr[i];
		//�󔒏ꍇ�������܂���
		if(isEmpty(id)){
			continue;
		}
		
	
		
		//���i���ʖ��׌J��Ԃ�
		var rec = nlapiLoadRecord('customrecord_djkk_inv_ip', id);
		var lineCount = rec.getLineItemCount('recmachcustrecord_djkk_inv_ipr_main');
		for(var j = 0 ; j < lineCount ; j++){
			var tranId = '';
			rec.selectLineItem('recmachcustrecord_djkk_inv_ipr_main', j+1)
			var div = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_class');
			var count = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_quantity');
			var item =  rec.getFieldValue('custrecord_djkk_inv_ip_item');
			var location = rec.getFieldValue('custrecord_djkk_inv_ip_locatio');
			var binFrom = rec.getFieldValue('custrecord_djkk_inv_ip_bin');
			
			var locationTo = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_location');
			var binTo =rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_bin');
			
			var sub = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_subsidiary')
			var invNo = rec.getFieldText('custrecord_djkk_inv_ip_invnumber');
			var lotRemark = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_remark');
			var lotMemo = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_memo');
			var reason=rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_reason');
			var reasonDetial=rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_detail_reason');
			//20220519 add by zhou start
			var makernum = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_makern');//���[�J�[�����ԍ�
			var duetime = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_duetime');//�ܖ�����
			var madedate = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_madedate');//������
			var deliveryperiod = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_deliveryperiod');//�o�׊���
			//20220519 add by zhou end
//			nlapiLogExecution('debug', 'madedate' ,madedate);
			var iprdetialId = rec.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'id')
			//�݌Ɉړ��쐬 �H�i�s�Ǖi�ꍇ�A�ړ��`�[�쐬����
			var record;
			if(div == '2' &&(sub == SUB_NBKK || sub == SUB_ULKK)){
				record= nlapiCreateRecord('transferorder');
//		
				
				//�X�e�[�^�X �z���ۗ�
				record.setFieldValue('orderstatus', 'B');
				//�C���R�^�[��  DAP
				record.setFieldValue('incoterm', '1')
				//���
				record.setFieldValue('subsidiary', sub);
				//�ړ����q��
				record.setFieldValue('location',location );
				//�ړ���q��
				record.setFieldValue('transferlocation', locationTo);
				//����
				record.setFieldValue('memo', '���i�ꗗ�����쐬');
				//���׈�s�ݒ�
				record.selectNewLineItem('item');
				//�A�C�e��
				record.setCurrentLineItemValue('item', 'item',item);
				//����
				record.setCurrentLineItemValue('item', 'quantity', count);
				//���R
				record.setCurrentLineItemValue('item', 'custcol_djkk_po_inspection_reason', reason);
				//���R�ڍ�
				record.setCurrentLineItemValue('item', 'custcol_djkk_po_inspection_reason_mo', reasonDetial);
				//�݌ɏڍאݒ�
				var inventoryDetail = record.createCurrentLineItemSubrecord('item','inventorydetail');
				//�݌ɏڍ׍s�ݒ�
				inventoryDetail.selectNewLineItem('inventoryassignment');
				//�V���A���ԍ��ݒ�
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',invNo);
				//����
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', count);
				
				//�ۊǒI�ړ���
				if(!isEmpty(binFrom)){
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', binFrom);
				}
				
				//�ۊǒI�ړ���
				if(!isEmpty(binTo)){
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', binTo);
				}
				
				
//				var itemBinFlag=nlapiLookupField('item', item, 'usebins');
//				//�ۊǒI�ݒ�
//				if(itemBinFlag=='T'){
//					//�q�ɕۊǒI�擾
//					var formLcBinFlg=nlapiSearchRecord("location",null,
//							[
//							   ["internalid","anyof",location]
//							], 
//							[
//							   new nlobjSearchColumn("usesbins")
//							]
//							)[0].getValue('usesbins');
//					if(formLcBinFlg=='T'){
//						var frombinSearch = nlapiSearchRecord("bin",null,
//								[
//								   ["location","anyof",location]
//								], 
//								[
//								   new nlobjSearchColumn("internalid")
//								]
//								);
//						if(!isEmpty(frombinSearch)){
//							var frombinId=frombinSearch[0].getValue('internalid');
//							//�ۊǒI��ݒ肷��
//							
//							inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', frombinId);
//						}				
//					}
//					//�ړ���ۊǒI�擾
//					var toLcBinFlg= nlapiSearchRecord("location",null,
//							[
//							   ["internalid","anyof",locationTo]
//							], 
//							[
//							   new nlobjSearchColumn("usesbins")
//							]
//							)[0].getValue('usesbins');
//					if(toLcBinFlg=='T'){
//						var tobinSearch = nlapiSearchRecord("bin",null,
//								[
//								   ["location","anyof",locationTo]
//								], 
//								[
//								   new nlobjSearchColumn("internalid")
//								]
//								);
//						if(!isEmpty(tobinSearch)){
//							var tobinId=tobinSearch[0].getValue('internalid');
//							for(var v = 0 ; v < tobinSearch.length ; v++){
//								if(binTo == tobinSearch[v].getValue('internalid')){
//									tobinId = binTo;
//									break;
//								}
//							}
//							
//							//�ۊǒI��ݒ肷��
//							
//							inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', tobinId);
//						}				
//					}
//				}
				//�s�Ǖi�ꍇ���o�ɔԍ��ēx�̔�(�̔Ԗ��Ή�)
				if(div == '2'){
					var newInvNo = getNewInvNo(sub);
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', newInvNo);		
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku', newInvNo);	
					nlapiLogExecution('debug','newInvNo1', newInvNo);
				}else if(div == '1'){
					//�Ǖi�ꍇ�V���A�ԍ�����
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', invNo);
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku', invNo);
				}else{
					//�p���ꍇ�ݒ肵�Ȃ�
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', '');
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku', '');
				}				
				
				//���b�g���}�[�N
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark', lotRemark);
				//���b�g������	
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo', lotMemo);
				//20220519 add by zhou start
				//���[�J�[�����ԍ�
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code', makernum);
				//�ܖ�����
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_expirationdate', duetime);
				//������
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', madedate);
				//�o�׊���
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date', deliveryperiod);
				//20220519 add by zhou end
				//�݌ɏڍ׍s�R�~�b�g
				inventoryDetail.commitLineItem('inventoryassignment');
				//�݌ɏڍ׃R�~�b�g
				inventoryDetail.commit();
				//���׍s�R�~�b�g
				record.commitLineItem('item')
				tranId = nlapiSubmitRecord(record);
				
			}else{
				record= nlapiCreateRecord('inventorytransfer');
				
				//���
				record.setFieldValue('subsidiary', sub);
				//�ړ����q��
				record.setFieldValue('location',location );
				//�ړ���q��
				record.setFieldValue('transferlocation', locationTo);
				//����
				record.setFieldValue('memo', '���i�ꗗ�����쐬');
				
				//���׈�s�ݒ�
				record.selectNewLineItem('inventory');
				//�A�C�e��
				record.setCurrentLineItemValue('inventory', 'item',item);
				//����
				record.setCurrentLineItemValue('inventory', 'adjustqtyby', count);
				//���R
				record.setCurrentLineItemValue('inventory', 'custcol_djkk_po_inspection_reason', reason);
				//���R�ڍ�
				record.setCurrentLineItemValue('inventory', 'custcol_djkk_po_inspection_reason_mo', reasonDetial);
				//�݌ɏڍאݒ�
				var inventoryDetail = record.createCurrentLineItemSubrecord('inventory','inventorydetail');
				//�݌ɏڍ׍s�ݒ�
				inventoryDetail.selectNewLineItem('inventoryassignment');
				//�V���A���ԍ��ݒ�
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',invNo);
				//����
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', count);
				
				//�ۊǒI�ړ���
				if(!isEmpty(binFrom)){
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', binFrom);
				}
				
				//�ۊǒI�ړ���
				if(!isEmpty(binTo)){
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', binTo);
				}
				
//				//�ۊǒI
//				var itemBinFlag=nlapiLookupField('item', item, 'usebins');
//				
//				//�ۊǒI�ݒ�
//				if(itemBinFlag=='T'){
//					//�q�ɕۊǒI�擾
//					var formLcBinFlg=nlapiSearchRecord("location",null,
//							[
//							   ["internalid","anyof",location]
//							], 
//							[
//							   new nlobjSearchColumn("usesbins")
//							]
//							)[0].getValue('usesbins');
//					if(formLcBinFlg=='T'){
//						var frombinSearch = nlapiSearchRecord("bin",null,
//								[
//								   ["location","anyof",location]
//								], 
//								[
//								   new nlobjSearchColumn("internalid")
//								]
//								);
//						if(!isEmpty(frombinSearch)){
//
//							var frombinId=frombinSearch[0].getValue('internalid');
//							//�ۊǒI��ݒ肷��
//							
//							if()
//							inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', frombinId);
//						}				
//					}
//					//�ړ���ۊǒI�擾
//					var toLcBinFlg= nlapiSearchRecord("location",null,
//							[
//							   ["internalid","anyof",locationTo]
//							], 
//							[
//							   new nlobjSearchColumn("usesbins")
//							]
//							)[0].getValue('usesbins');
//					if(toLcBinFlg=='T'){
//						var tobinSearch = nlapiSearchRecord("bin",null,
//								[
//								   ["location","anyof",locationTo]
//								], 
//								[
//								   new nlobjSearchColumn("internalid")
//								]
//								);
//						if(!isEmpty(tobinSearch)){
//							var tobinId=tobinSearch[0].getValue('internalid');
//							for(var v = 0 ; v < tobinSearch.length ; v++){
//								if(binTo == tobinSearch[v].getValue('internalid')){
//									tobinId = binTo;
//									break;
//								}
//							}
//							//�ۊǒI��ݒ肷��
//							
//							inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', tobinId);
//						}				
//					}
//				}
				
				//�s�Ǖi�ꍇ���o�ɔԍ��ēx�̔�(�̔Ԗ��Ή�)
				if(div == '2'){
					var newInvNo = getNewInvNo(sub);
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', newInvNo);		
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku',  newInvNo);	
					nlapiLogExecution('debug','newInvNo', newInvNo);
				}else if(div == '1'){
					//�Ǖi�ꍇ�V���A�ԍ�����
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', invNo);
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku', invNo);
				}else{
					//�p���ꍇ�ݒ肵�Ȃ�
					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code', '');
					rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main','custrecord_djkk_cangku', '');
				}					
				
				//���b�g���}�[�N
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark', lotRemark);
				//���b�g������
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo', lotMemo);
				//20220519 add by zhou start
				//���[�J�[�����ԍ�
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code', makernum);
				//�ܖ�����
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_expirationdate', duetime);
				//������
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd', madedate);
				//�o�׊���
				inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date', deliveryperiod);
				//20220519 add by zhou end				
				//�݌ɏڍ׍s�R�~�b�g
				inventoryDetail.commitLineItem('inventoryassignment');
				//�݌ɏڍ׃R�~�b�g
				inventoryDetail.commit();
				//���׍s�R�~�b�g
				record.commitLineItem('inventory')
				tranId = nlapiSubmitRecord(record);

			}
			
			//�s�Ǖi�ꍇ���[���𑗐M����B
			if(div == '2' && badLocationArr.indexOf(locationTo) < 0){
				badLocationArr.push(locationTo);
			}
			
			rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_tran', tranId)
			rec.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_location',locationTo);
			rec.commitLineItem('recmachcustrecord_djkk_inv_ipr_main');
		}

	
		//�����ς݃`�F�b�N����
		rec.setFieldValue('custrecord_djkk_inv_ip_done', 'T');
		nlapiSubmitRecord(rec);
	}
	
	for(var i = 0 ; i < badLocationArr.length ; i++){
		sendMailToLocationByBadItem(badLocationArr[i]);
	}
	
	nlapiLogExecution('debug', '','�݌Ɉړ��I��');
}

function sendMailToLocationByBadItem(location){
	var locationSearch = nlapiSearchRecord("location",null,
			[
			 "internalid","anyof",location
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
			   new nlobjSearchColumn("internalid")
			]
			);
	var mailArr = new Array();
	if(!isEmpty(locationSearch)){
		for(var i = 0 ; i < locationSearch.length ; i++){
			mailArr[0] = locationSearch[i].getValue("custrecord_djkk_mail","address",null);
		}
		
		if(!isEmpty(mailArr[0])){
			nlapiSendEmail(-5, mailArr[0], '�s�Ǖi���ɂ̂��m�点', '�s�Ǖi���ɂ��܂���');
		}else{
			nlapiLogExecution('DEBUG', '', '���[���A�h���X���݂��Ȃ����ߑ��M�ł��܂���ł����B');
		}
		
		
	}else{
		nlapiLogExecution('DEBUG', '', '�q�ɂ𑶍݂��Ȃ����߁A�����I��');
	}
}

function getNewInvNo (sub){
	var no = "";
	try{
		
		var TheMinimumdigits = 11;
		var submitId='';
		var NumberTxt='';
		var numbering='';
		
		var usersub=sub
		var nbSearch = nlapiSearchRecord("customrecord_djkk_inventorydetail_number",null,
				[
				   ["custrecord_djkk_invnum_subsidiary","anyof",usersub]
				], 
				[
                   new nlobjSearchColumn("internalid"),
                   new nlobjSearchColumn("custrecord_djkk_invnum_subsidiary"),
                   new nlobjSearchColumn("custrecord_djkk_invnum_form_name"),
				   new nlobjSearchColumn("custrecord_djkk_invnum_item_make"), 
				   new nlobjSearchColumn("custrecord_djkk_invnum_bumber")
				]
				);
		if(!isEmpty(nbSearch)){
			submitId=nbSearch[0].getValue('internalid');
			NumberTxt=nbSearch[0].getValue('custrecord_djkk_invnum_item_make');
			numbering=nbSearch[0].getValue('custrecord_djkk_invnum_bumber');
		}

		var receiptinventorynumber =  NumberTxt+ prefixInteger(parseInt(numbering)+1, parseInt(TheMinimumdigits));
		nlapiSubmitField('customrecord_djkk_inventorydetail_number',submitId, 'custrecord_djkk_invnum_bumber',parseInt(numbering)+1);
		
		return receiptinventorynumber;
	}catch(e){
		nlapiLogExecution('ERROR', '�̔ԃG���[', e.message)
	}
	return no;
}
