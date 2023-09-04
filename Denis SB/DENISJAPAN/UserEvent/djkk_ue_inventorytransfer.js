/**
 * �݌Ɉړ�UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/16     CPC_��
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
//	form.setScript('customscript_djkk_cs_inventorytransfer');
//	if (type == 'view') {
//		form.addButton('custpage_popuplmi', '�q�Ɉړ��w�����X�g', 'popuplmi();');
//	}
}

//20220930 add by zhou U809 userEventBeforeSubmit �݌Ɉړ����DJ_�݌ɒ������F��ʂ̍쐬
function userEventBeforeSubmit(type) {
	var recordType = nlapiGetRecordType();
//	var recordId = nlapiGetRecordId();
//	var loadRecord =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
	if(recordType=='inventorytransfer'){
		var tranidArray = [];
		var subsidiary = nlapiGetFieldValue('subsidiary');//�q���
		var warehouse = nlapiGetFieldValue('location');  //�ړ���
		var transferlocation = nlapiGetFieldValue('transferlocation');  //�ړ���
		var class = nlapiGetFieldText('class');  //�u�����h 
		var count = nlapiGetLineItemCount('inventory');
		for(var k = 1 ; k < count+1 ; k++){
			nlapiSelectLineItem('inventory',k);
			var managementCheck = nlapiGetCurrentLineItemValue('inventory','custcol_djkk_new_management_num');
			if(managementCheck == 'T'){
				nlapiSelectLineItem('inventory', k);
				var admitRe = nlapiGetCurrentLineItemValue('inventory', 'custcol_djkk_change_reasons');//�ύX���R
				var item = nlapiGetCurrentLineItemValue('inventory', 'item');//item
				var itemAccountSearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","is",item]
						], 
						[
						   new nlobjSearchColumn("expenseaccount"), 
//						   new nlobjSearchColumn("assetaccount")
						]
						);
				if(!isEmpty(itemAccountSearch)){
					var account = itemAccountSearch[0].getValue('expenseaccount');//����Ȗ�
				}
				var inventoryqty = nlapiGetCurrentLineItemValue('inventory', 'quantityonhand');  //�݌ɐ��� 
				var units = nlapiGetCurrentLineItemValue('inventory', 'units');  //�P��
				var adjqty = nlapiGetCurrentLineItemValue('inventory', 'adjustqtyby');  //�ړ����� 
				var description = nlapiGetCurrentLineItemValue('inventory', 'description');  //����
				var inventorydetailFlag = nlapiGetCurrentLineItemValue("inventory","inventorydetailavail");
				nlapiLogExecution('debug','�ύX���R',admitRe)
				if(inventorydetailFlag == 'T'){
					//�݌ɏڍאݒ�
					var invArray = [];
					var inventoryDetail = nlapiEditCurrentLineItemSubrecord('inventory','inventorydetail');
					if(!isEmpty(inventoryDetail)){
							var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
							if(inventoryDetailCount != 0){
							for(var h = 1 ;h < inventoryDetailCount+1 ; h++){
							    inventoryDetail.selectLineItem('inventoryassignment',h);
							    var invReordId;
		    				    var inventorynumber;
	    				    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//���b�g�ԍ�internalid
	    				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    ); 
	    				    	if(!isEmpty(inventorynumberSearch)){
			    				    inventorynumber = inventorynumberSearch[0].getValue("inventorynumber");//�V���A��/���b�g�ԍ�	
	    				    	}
							    var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate');//�L������
							    var makernum = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_maker_serial_code');//DJ_���[�J�[�������b�g�ԍ�
							    var madedate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_make_ymd');//DJ_�����N����
							    var deliveryperiod = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_shipment_date');//DJ_�o�׉\������
							    var warehouseCode = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_warehouse_code');//DJ_�q�ɓ��ɔԍ�
							    var smc = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_smc_code');//DJ_SMC�ԍ�
							    var lotMemo = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_memo');//DJ_���b�g����	
							    var binnumber =  inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'binnumber');  //���t���̕ۊǒI
							    var tobinnumber =  inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'tobinnumber');  //���[��ۊǒI
	    			  		    var lotRemark = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_lot_remark');//DJ_���b�g���}�[�N
//							    var lotRemark = inventoryDetail.getLineItemText('inventoryassignment','custrecord_djkk_lot_remark',h);
							    var quantity = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'quantity');//����		
							    var controlNumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'custrecord_djkk_control_number');//DJ_���[�J�[�V���A���ԍ�
							    invArray.push({
							    	subsidiary:subsidiary,
							    	bland:class,
							    	description:description,
							    	inventoryqty:inventoryqty,
							    	units:units,
							    	invReordId:invReordId,
							    	inventorynumber:inventorynumber,
							    	expirationdate:expirationdate,
							    	makernum:makernum,
							    	madedate:madedate,
							    	deliveryperiod:deliveryperiod,
							    	warehouseCode:warehouseCode,
							    	smc:smc,
							    	lotMemo:lotMemo,
							    	binnumber:binnumber,
							    	lotRemark:lotRemark,
							    	quantity:quantity,
							    	controlNumber:controlNumber,
							    	tobinnumber:tobinnumber
							    })
							}
						}
					}
				}
				//DJ_�݌ɒ�������
//				var rec2 =  eRecord('inventoryadjustment');
//				rec2.setFieldValue('trandate',  nlapiDateToString(getSystemTime())); //���t
//				rec2.setFieldValue('subsidiary',subsidiary);//�q���
//				rec2.setFieldValue('custbody_djkk_change_reason', admitRe);//�ύX���R
//				rec2.selectNewLineItem('inventory'); //����
//				rec2.setCurrentLineItemValue('inventory', 'item', item);//item
//				rec2.setCurrentLineItemValue('inventory', 'adjustqtyby', adjqty);//��������   
//				rec2.setCurrentLineItemValue('inventory', 'location', warehouse);//�ꏊ
//				rec2.setFieldValue('account',account);//��������Ȗ�
//				var inventoryDetail = rec2.createCurrentLineItemSubrecord('inventory','inventorydetail');//�݌ɏڍ�
//				var invArrayText = JSON.stringify(invArray);
//				nlapiLogExecution('debug','invArrayText',invArrayText)
//				for(var n = 0 ; n < invArray.length ;n++){
//					inventoryDetail.selectNewLineItem('inventoryassignment');
//					var tobinnumberValue = invArray[n].tobinnumber;
//					var binnumberValue = invArray[n].binnumber;
//					var inventorynumber = invArray[n].inventorynumber;
//					var quantity = invArray[n].quantity;
//					
//					if(!isEmpty(binnumberValue)){
//						inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber',binnumberValue);
//					}
//					inventoryDetail.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',inventorynumber);//�V���A��/���b�g�ԍ�
//					inventoryDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', quantity);//����
//					inventoryDetail.commitLineItem('inventoryassignment');
//					inventoryDetail.commit();
//				}
//				rec2.commitLineItem('inventory');
//				var inventoryadjustmentId = nlapiSubmitRecord(rec2);
				
				//DJ_�݌ɒ������F��ʐ���
				var rec2 = nlapiCreateRecord('customrecord_djkk_ic_admit');
				
				
				
				
				rec2.setFieldValue('custrecord_djkk_admit_trandate',  nlapiDateToString(getSystemTime())); //���t
				rec2.setFieldValue('custrecord_djkk_admit_subsidiary',subsidiary);//�q���
				rec2.setFieldValue('custrecord_djkk_admit_re', admitRe);//�ύX���R
				rec2.setFieldValue('custrecord_djkk_admit_account',account);//��������Ȗ�
				
				
				rec2.setFieldValue('custrecord_djkk_admit_flg','T');//DJ_���F�����t���O
				var roleValue = nlapiGetRole();
			      var userValue = nlapiGetUser();
			      
			      var subsidiary = nlapiGetFieldValue('subsidiary');
			      var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//�g�����U�N�V�������F�Ǘ��\
			          [
			             ["isinactive","is","F"], 
			             "AND", 
			             ["custrecord_djkk_trans_appr_obj","anyof",16],
			             "AND",
			             ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
			          ], 
			          [
			             new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //�쐬���[��
			             new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //��ꏳ�F���[��
			             
			          ]
			          );
			      if(!isEmpty(approvalSearch)){
			        for(var j = 0; j < approvalSearch.length; j++){1
			          var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//�쐬���[��
			          var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//��ꏳ�F���[��
			          if(createRole == roleValue){
			        	  rec2.setFieldValue('custrecord_djkk_admit_create_role',createRole);//DJ_�쐬���[��
			        	  rec2.setFieldValue('custrecord_djkk_admit_next_autho_role',appr1_role); //DJ_���̏��F���[��
			          }
			        }
			      }
				
				rec2.setFieldValue('custrecord_djkk_admit_create_user',userValue);//DJ_�쐬��			
				
				
				
				//DJ_�݌ɒ������F���_���א���
				var invArrayText = JSON.stringify(invArray);
				nlapiLogExecution('debug','invArrayText',invArrayText)
				var lineNum = parseInt(0);//DJ_�݌ɒ������׍s�ԍ�
				//�ړ���
				for(var n = 0 ; n < invArray.length ;n++){
					rec2.selectNewLineItem('recmachcustrecord_djkk_ic_admit'); //����
					var subsidiary = invArray[n].subsidiary;
					var blandFrom = invArray[n].bland;
					var descriptionFrom = invArray[n].description;
					var unitsFrom = invArray[n].units;
//					var tobinnumberFrom = invArray[n].tobinnumber;//���t��̕ۊǒI
					var invReordIdFrom = invArray[n].invReordId;
					var binnumberFrom = invArray[n].binnumber;//���t���̕ۊǒI
					var inventorynumberFrom = invArray[n].inventorynumber;
					var quantityFrom = invArray[n].quantity;//�݌ɏڍ�_���א���
					var expirationdateFrom = invArray[n].expirationdate;//�L������
					var makernumFrom = invArray[n].makernum;//DJ_���[�J�[�������b�g�ԍ�
					var madedateFrom = invArray[n].madedate;//DJ_�����N����
					var deliveryperiodFrom = invArray[n].deliveryperiod;//DJ_�o�׉\������
					var smcFrom = invArray[n].smc;//DJ_SMC�ԍ�
					var lotMemoFrom = invArray[n].lotMemo;//DJ_���b�g����	
					var lotRemarkFrom = invArray[n].lotRemark;//DJ_���b�g���}�[�N
					var controlNumberFrom = invArray[n].controlNumber;//DJ_���[�J�[�V���A���ԍ�
					var warehouseCodeFrom = invArray[n].warehouseCode;//DJ_�q�ɓ��ɔԍ�
					var inventoryqtyFrom = invArray[n].inventoryqty;//DJ_�݌ɐ���
					var newquantityFrom = Number(inventoryqtyFrom)-Number(quantityFrom);
					nlapiLogExecution('debug','n',n)
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item', item);//item
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty', quantityFrom*-1);//��������   
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', descriptionFrom);//����
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', blandFrom);//����
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit', unitsFrom);//�P��
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse', warehouse);//�ꏊ
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum', binnumberFrom);////���t���̕ۊǒI
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', inventorynumberFrom);//�V���A��/���b�g�ԍ� 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail_id', invReordIdFrom);//�V���A��/���b�g�ԍ� ID
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date', expirationdateFrom);//�L������
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot', makernumFrom);//DJ_���[�J�[�������b�g�ԍ�
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date', madedateFrom);//DJ_�����N��
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date', deliveryperiodFrom);//DJ_�o�׉\������
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no', warehouseCodeFrom);//DJ_�q�ɓ��ɔԍ� 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num', smcFrom);//DJ_SMC�ԍ� 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark', lotRemarkFrom);//DJ_���b�g���}�[�N
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo', lotMemoFrom);//DJ_���b�g����	
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty', newquantityFrom);//�V��������
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', inventoryqtyFrom);//�݌ɐ���
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial', controlNumberFrom);//DJ_���[�J�[�V���A���ԍ�
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_subsidiary', subsidiary);//DJ_�q���
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', parseInt(n+1));//DJ_�݌ɒ������׍s�ԍ�
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity', quantityFrom*-1);//DJ_�݌ɏڍז��׍s����
					rec2.commitLineItem('recmachcustrecord_djkk_ic_admit');
				}
				lineNum = parseInt(n);
				//�ړ���
				for(var i = 0 ; i < invArray.length ;i++){
					rec2.selectNewLineItem('recmachcustrecord_djkk_ic_admit'); //����
					var subsidiary = invArray[i].subsidiary;
					var blandTo = invArray[i].bland;
					var descriptionTo = invArray[i].description;
					var unitsTo = invArray[i].units;
					var tobinnumberTo = invArray[i].tobinnumber;//���t��̕ۊǒI
					//�݌Ɉړ���݌ɒ��������̔�
					var invReordIdTo =  getNewInvNo(subsidiary);
//					var binnumberValue = invArray[i].binnumber;//���t���̕ۊǒI
//					var inventorynumber = invArray[i].inventorynumber;
					var quantityTo = invArray[i].quantity;//�݌ɏڍ�_���א���
					var expirationdateTo = invArray[i].expirationdate;//�L������
					var makernumTo = invArray[i].makernum;//DJ_���[�J�[�������b�g�ԍ�
					var madedateTo = invArray[i].madedate;//DJ_�����N����
					var deliveryperiodTo = invArray[i].deliveryperiod;//DJ_�o�׉\������
					var smcTo = invArray[i].smc;//DJ_SMC�ԍ�
					var lotMemoTo = invArray[i].lotMemo;//DJ_���b�g����	
					var lotRemarkTo = invArray[i].lotRemark;//DJ_���b�g���}�[�N
					var controlNumberTo = invArray[i].controlNumber;//DJ_���[�J�[�V���A���ԍ�
					var warehouseCodeTo = invArray[i].warehouseCode;//DJ_�q�ɓ��ɔԍ�
					var inventorydetailSearch = nlapiSearchRecord("inventorydetail",null,
							[
							   ["item","anyof",item], 
							   "AND", 
							   ["location","anyof",transferlocation], 
							   "AND", 
							   ["inventorynumber.inventorynumber","is",invReordIdTo]
							], 
							[
							   new nlobjSearchColumn("quantity"), 
							   new nlobjSearchColumn("inventorynumber")
							]
							);
					var inventoryqtyTo = 0;//DJ_�݌ɐ���old
					if(inventorydetailSearch != null){				
						for(var b = 0 ; b < inventorydetailSearch.length ; b++){
							inventoryqtyTo += Number(inventorydetailSearch[b].getValue('quantity'));
						}	
					}
					nlapiLogExecution('debug','invReordIdTo',invReordIdTo)
					nlapiLogExecution('debug','inventoryqtyTo',inventoryqtyTo)
					var newquantityTo = Number(inventoryqtyTo)+Number(quantityTo);
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_item', item);//item
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_adjqty', quantityTo);//��������   
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_explain', descriptionTo);//����
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_brand', blandTo);//����
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_unit', unitsTo);//�P��
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse', transferlocation);//�ꏊ
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_ic_admit_shednum', tobinnumberTo);////���t���̕ۊǒI
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_detail', invReordIdTo);//�V���A��/���b�g�ԍ� 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_date', expirationdateTo);//�L������
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot', makernumTo);//DJ_���[�J�[�������b�g�ԍ�
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_manufacture_date', madedateTo);//DJ_�����N��
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_probably_date', deliveryperiodTo);//DJ_�o�׉\������
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_warehouse_no', warehouseCodeTo);//DJ_�q�ɓ��ɔԍ� 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_smc_num', smcTo);//DJ_SMC�ԍ� 
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_remark', lotRemarkTo);//DJ_���b�g���}�[�N
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_lot_memo', lotMemoTo);//DJ_���b�g����	
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_newqty', newquantityTo);//�V��������
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventoryqty', inventoryqtyTo);//�݌ɐ���
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_serial', controlNumberTo);//DJ_���[�J�[�V���A���ԍ�
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_subsidiary', subsidiary);//DJ_�q���
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_line_id', parseInt(lineNum+1));//DJ_�݌ɒ������׍s�ԍ�
					rec2.setCurrentLineItemValue('recmachcustrecord_djkk_ic_admit', 'custrecord_djkk_admit_inventory_quantity', quantityTo);//DJ_�݌ɏڍז��׍s����
					rec2.commitLineItem('recmachcustrecord_djkk_ic_admit');
				}
				var recordid = nlapiSubmitRecord(rec2);
				
				nlapiLogExecution('debug','DJ_�݌ɒ������F��ʎQ�Ɣԍ�',recordid)
//				loadRecord.setLineItemValue('inventory','custcol_djkk_inv_adjustment',k,recordid);
				nlapiSetLineItemValue('inventory','custcol_djkk_inv_adjustment',k,recordid)
			}
		}
//		nlapiSubmitRecord(loadRecord, false, true);
	}
}
//�݌Ɉړ���݌ɒ��������̔�
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
//end