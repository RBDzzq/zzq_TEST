/**
 * ���n�I��
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jul 2021     admin
 *
 */

/**
 * @param {String}
 *            type Context Types: scheduled, ondemand, userinterface, aborted,
 *            skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug', '���n�I���w���J�n');

	var div = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_div');
	var strId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_id');
	var subsidiary = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_sub');
	var locationValue = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_location');
	var userValue = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_user');
	var roleValue = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_phy_inv_role');
	nlapiLogExecution('DEBUG', '�^�C�v', div);
	if(isEmpty(strId)){
		nlapiLogExecution('debug', '', '�����Ώۂ���܂���');
		return ;
	}
	
	var strArr = new Array();
	strArr = strId.split(",");
	
	//5.26�����A�C�e������݌ɒ����ɕ\���Ή�byWang Step1
	
	
	var locationArr_old = new Array();
	for(var i = 0 ; i < strArr.length ; i ++){
		
		if(isEmpty(strArr[i])){
			continue;
		}
		var paramArr = strArr[i].split("_");
		var location_id = paramArr[2];
		locationArr_old.push(location_id);
	}
	var locationArr_new = locationArr_old;
	for(var i =0;i<locationArr_new.length;i++){
		for(var j=i+1;j<locationArr_new.length;j++){
			if(locationArr_new[i] == locationArr_new[j]){
				locationArr_new.splice(j,1);
				j--;
			}
		}
	}
	
	var strArr_old = new Array();
	for(var i = 0 ; i < strArr.length ; i ++){
		strArr_old.push(strArr[i].split("_"));
	}
	var strArr_new = strArr_old.sort(ascend);
	
	
	
	
	var locationNew = 0;
	var actualArr = new Array();
	
	for(var i = 0 ; i < strArr_new.length-1 ; i ++){	//todo

		if(isEmpty(strArr_new[i])){
			continue;
		}
		governanceYield();
		var paramArr = strArr_new[i]
		var item_id = paramArr[0];
		var inv_no = paramArr[1];
		var location_id = paramArr[2];
		var binnumber_id = paramArr[3];
		var vo_or_cu_id = paramArr[4];
		var count = paramArr[5];
		var count_real = paramArr[6];
		var averagecost = paramArr[7];
		var expirationdate = paramArr[8];
		//changed by geng add start U705
		var item_brand = paramArr[9];
		var item_product_code = paramArr[10];
		var item_displayname = paramArr[11];
		var item_remark = paramArr[12];
		var item_name_english = paramArr[13];
		var item_vendorname = paramArr[14];
		var item_perunitquantity = paramArr[15];
		var item_memo = paramArr[16];
		var location = paramArr[17];
	
		
		actualArr.push({
			item_id:item_id,//�A�C�e��Id
			inv_no:inv_no,//�Ǘ��ԍ�
			location_id:location_id,//�ꏊID
			binnumber_id:binnumber_id,//�ۊǒIID
			vo_or_cu_id:vo_or_cu_id, //�d����ID
			count:count,//�݌�
			count_real:count_real,//���n����
			averagecost:averagecost,//���z
			expirationdate:expirationdate, //�ܖ�����
			item_brand:item_brand,//�u�����h
			item_product_code:item_product_code,//�J�^���O�R�[�h 
			item_displayname:item_displayname,//���i��
			item_remark:item_remark,//���b�g���}�[�N 
			item_name_english:item_name_english,//���i���p��
			item_vendorname:item_vendorname,//�d���揤�i�R�[�h
			item_perunitquantity:item_perunitquantity,//���萔
			item_memo:item_memo, //�A�C�e������
			location:location,//�ꏊ��
		});
		//changed by geng add end U705	
	}
	
	//2022/11/28 changed by song start  U711
	if (div == '1') {
		try{
			var rec = nlapiCreateRecord('customrecord_djkk_body_shedunloading');  //���n�I�����F���
			rec.setFieldValue('custrecord_djkk_shedunloading_sub',subsidiary); //�A��
			rec.setFieldValue('custrecord_djkk_shedunloading_createuser',userValue); //�쐬��
			rec.setFieldValue('custrecord_djkk_shedunloading_location',locationValue); //�ꏊ
			rec.setFieldValue('custrecord_djkk_shedunloading_date',nlapiDateToString(getSystemTime())); //���t
			rec.setFieldValue('custrecord_djkk_shedunloading_flg','T');
			var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//�g�����U�N�V�������F�Ǘ��\
					[
					   ["isinactive","is","F"], 
					   "AND", 
					   ["custrecord_djkk_trans_appr_obj","anyof",13],
					   "AND",
					   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //�쐬���[��
					   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //��ꏳ�F���[��
					   
					]
					);
			if(!isEmpty(approvalSearch)){
				for(var j = 0; j < approvalSearch.length; j++){
					var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//�쐬���[��
					var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//��ꏳ�F���[��
					if(createRole == roleValue){
						rec.setFieldValue('custrecord_djkk_shedunloading_createrole',createRole);//DJ_�쐬���[��
						rec.setFieldValue('custrecord_djkk_shedunloading_next_role',appr1_role); //DJ_���̏��F���[��
					}
				}
			}
			for(var a = 0;a<actualArr.length;a++){
				rec.selectNewLineItem('recmachcustrecord_djkk_body_shedunloading_list')
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_lin_num', a+1);//�s
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_subsidiary_list', subsidiary);//�A��
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_shed_item', actualArr[a].item_id);//�A�C�e��Id
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_item_memo', actualArr[a].item_memo);//�A�C�e������
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_inv_no', actualArr[a].inv_no);//�Ǘ��ԍ�
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_inv_no2', actualArr[a].inv_no);//�Ǘ��ԍ�
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_location', actualArr[a].location_id);//�ꏊID
				rec.setCurrentLineItemText('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_brand', actualArr[a].item_brand);//�u�����h
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_product_code', actualArr[a].item_product_code);//�J�^���O�R�[�h
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_displayname', actualArr[a].item_displayname);//���i��
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_remark', actualArr[a].item_remark);//���b�g���}�[�N
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_name_english', actualArr[a].item_name_english);//���i���p��
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_vendorname', actualArr[a].item_vendorname);//�d���揤�i�R�[�h
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_perunitquantity', actualArr[a].item_perunitquantity);//���萔
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_binnumber', actualArr[a].binnumber_id);//�ۊǒI�ԍ�
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_vo_or_cu', actualArr[a].vo_or_cu_id);//�d����ID
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_averagecost', actualArr[a].averagecost);//���z
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_amount', actualArr[a].averagecost);//���z�`�F�b�N
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_phy_expirationdate', actualArr[a].expirationdate);//�ܖ�����
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_library', actualArr[a].count);//�݌�
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_actual_quantity', actualArr[a].count_real);//���n����
				rec.setCurrentLineItemValue('recmachcustrecord_djkk_body_shedunloading_list', 'custrecord_djkk_explain', '�I���쐬');//����
				rec.commitLineItem('recmachcustrecord_djkk_body_shedunloading_list');
			}
			
			nlapiSubmitRecord(rec);
		}
		catch(e){
			nlapiLogExecution('ERROR', '�G���[', e.message)
		}
	}else if(div == '2'){
		try{
			var rec = nlapiCreateRecord('customrecord_djkk_custbody_shedunloading');  //�a����݌Ɏ��n�I�����F���
			rec.setFieldValue('custrecord_djkk_body_sub',subsidiary); //�A��
			rec.setFieldValue('custrecord_djkk_body_createuser',userValue); //�쐬��
			rec.setFieldValue('custrecord_djkk_body_location',locationValue); //�ꏊ
			rec.setFieldValue('custrecord_djkk_body_date',nlapiDateToString(getSystemTime())); //���t
			rec.setFieldValue('custrecord_djkk_body_flg','T');
			var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//�g�����U�N�V�������F�Ǘ��\
					[
					   ["isinactive","is","F"], 
					   "AND", 
					   ["custrecord_djkk_trans_appr_obj","anyof",14],
					   "AND",
					   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
					], 
					[
					   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //�쐬���[��
					   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //��ꏳ�F���[��
					   
					]
					);
			if(!isEmpty(approvalSearch)){
				for(var j = 0; j < approvalSearch.length; j++){
					var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//�쐬���[��
					var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//��ꏳ�F���[��
					if(createRole == roleValue){
						rec.setFieldValue('custrecord_djkk_body_createrole',createRole);//DJ_�쐬���[��
						rec.setFieldValue('custrecord_djkk_body_next_role',appr1_role); //DJ_���̏��F���[��
					}
				}
			}
			var binumArr = new Array();
			for(var a = 0;a<actualArr.length;a++){
				binumArr.push(actualArr[a].binnumber_id);
			}
			 var custodyArr = new Array();
			 var custodySearch = nlapiSearchRecord("customrecord_djkk_inventory_in_custody_l",null,
					 [
				
	                    ["internalid","anyof",binumArr], 
	                        
					 ], 
					 [
					    new nlobjSearchColumn("custrecord_djkk_icl_inventory_in_custody"), //DJ_�a����݌�
					    new nlobjSearchColumn("custrecord_djkk_createdfrom","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null), 
					    new nlobjSearchColumn("custrecord_djkk_icl_inventorydetails"), 
					    new nlobjSearchColumn("custrecord_djkk_icl_conversionrate"), 
					    new nlobjSearchColumn("custrecord_djkk_icl_unit"), 
					    new nlobjSearchColumn("custrecord_djkk_icl_cuslocation"), 
					    new nlobjSearchColumn("custrecord_djkk_icl_inventorylocation"),
					    new nlobjSearchColumn("internalid")
					 ]
					 );
				for(var k = 0;k < custodySearch.length;k++){
					var custody = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_inventory_in_custody"));//DJ_�a����݌�
					var createdfrom = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_createdfrom","CUSTRECORD_DJKK_ICL_INVENTORY_IN_CUSTODY",null));//DJ_�a����݌�-�쐬��
					var inventorydetailsID = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_inventorydetails")); //DJ_�݌ɏڍ�ID
					var conversionrate = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_conversionrate")); //DJ_����
					var unit = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_unit")); //DJ_�P��
					var cuslocation = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_cuslocation")); //DJ_�a����݌ɏꏊ
					var inventorylocation = defaultEmpty(custodySearch[k].getValue("custrecord_djkk_icl_inventorylocation")); //DJ_���̏ꏊ
					var internalid = defaultEmpty(custodySearch[k].getValue("internalid")); //DJ_���̏ꏊ
					

					custodyArr.push({
						custody:custody,//DJ_�a����݌�
						createdfrom:createdfrom,//DJ_�a����݌�-�쐬��
						inventorydetailsID:inventorydetailsID,//DJ_�݌ɏڍ�ID
						conversionrate:conversionrate,//DJ_����
						unit:unit,//DJ_�P��
						cuslocation:cuslocation,//DJ_�a����݌ɏꏊ
						inventorylocation:inventorylocation, //DJ_���̏ꏊ
						internalid:internalid,//����id
					})
				}
			 for(var u = 0;u<actualArr.length;u++){
				 rec.selectNewLineItem('recmachcustrecord_djkk_custody_stock_list');
				 for(var o = 0;o<custodyArr.length;o++){
					 if(actualArr[u].binnumber_id == custodyArr[o].internalid){
						 	governanceYield();
						 	rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_lin_num', o+1);//�s
						 	rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_lin_sub', subsidiary);//DJ_�A��
						 	rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_storage_id',actualArr[u].binnumber_id);//DJ_�a����݌�-����ID
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_shed_item', actualArr[u].item_id);//�a����݌ɃA�C�e����
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_item_memo', actualArr[u].item_brand);//DJ_�a����݌ɃA�C�e������
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_stock_no', actualArr[u].inv_no);//�a����݌ɃV���A��/���b�g�ԍ�
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_stock_no2', actualArr[u].inv_no);//�a����݌ɃV���A��/���b�g�ԍ�
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_location', actualArr[u].location_id);//�a����݌ɏꏊ 
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_location_id', actualArr[u].item_displayname);//DJ_�a����݌�ID
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_binnumber', actualArr[u].item_product_code);//DJ_�a����݌ɕۊǒI�ԍ�
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_purchase', actualArr[u].vo_or_cu_id);//�a����݌ɗD��ڋq
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_library', actualArr[u].count);//�a����݌ɍ݌�
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_actual_quantity', actualArr[u].count_real);//�a����݌Ɏ��n����
							
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_createdfrom',custodyArr[o].createdfrom);//DJ_�a����݌ɍ쐬��
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_library_id',custodyArr[o].inventorydetailsID);//�݌ɏڍ�ID
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_eye',custodyArr[o].conversionrate);//DJ_�����
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_company',custodyArr[o].unit);//DJ_�P��
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_warehouse',custodyArr[o].cuslocation);//DJ_�a����݌ɏꏊ
							rec.setCurrentLineItemValue('recmachcustrecord_djkk_custody_stock_list', 'custrecord_djkk_custody_origina_location',custodyArr[o].inventorylocation);//���̏ꏊ
														
							rec.commitLineItem('recmachcustrecord_djkk_custody_stock_list');
					 }
				 }
			 }
					
			nlapiSubmitRecord(rec, false, true);
			
		}
		catch(e){
			nlapiLogExecution('ERROR', '�G���[', e.message)
		}
	}
	//2022/11/28 changed by song end  U711
	
	

	nlapiLogExecution('debug', '���n�I���w���I��');
}

function ascend(x,y){
    return x[2] - y[2];  //order by location
}
function defaultEmpty(src){
	return src || '';
}
