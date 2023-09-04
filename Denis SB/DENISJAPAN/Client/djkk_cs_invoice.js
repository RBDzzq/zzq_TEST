/**
 * invoice��client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/30     CPC_��
 *
 */
/**
 * ��ʂ̏�����
 */
function clientPageInit(type) {
	   var customform = nlapiGetFieldValue('customform');
	   var entityId=nlapiGetFieldValue('entity');
	   var requestday='';
	   if(!isEmpty(entityId)){
		   var flag=nlapiLookupField('customer', entityId, 'custentity_djkk_requestday_flag');
		   if(flag=='sd'){
			   requestday=nlapiGetFieldValue('shipdate');
		   }else if(flag=='dd'){
			   requestday=nlapiGetFieldValue('custbody_djkk_delivery_date');
		   }
		   //20221221 changed by zhou start

		   if(isEmpty(requestday)){
			   requestday=nlapiDateToString(getSystemTime());
		   }
		   if(customform != '179'){
			   //U599�@�Ή����߁@JRAM�ꍇ���t�ݒ肵�܂���B
			   if(nlapiGetFieldValue('custbody_djkk_edi_so_kbn') != 'JRAM'){
			       // CH533 zheng 20230509 start
			       if (type != 'edit') {
		                nlapiSetFieldValue('trandate',requestday, false, true);    
			       }
			       // CH533 zheng 20230509 end
			   }
		   }else{
			   //U599�@�Ή����߁@JRAM�ꍇ���t�ݒ肵�܂���B
			   if(isEmpty(nlapiGetFieldValue('trandate'))&& nlapiGetFieldValue('custbody_djkk_edi_so_kbn') != 'JRAM'){
			       // CH533 zheng 20230509 start
	               if (type != 'edit') {
	                   nlapiSetFieldValue('trandate',requestday, false, true); 
	               }
	               // CH533 zheng 20230509 end
			   }
		   }
		   //end

			if (type == 'create' || type == 'copy'|| type == 'view'|| type == 'edit') {
				
				if(customform == '160'){
					setFieldDisableType('location','hidden');
			
					
			}
			}
	   }
	   if(customform == '160'){
				if(type == 'create' || type == 'copy') {
					nlapiSetFieldValue('custbody_djkk_invoice_cirdit_flg','invoice')
					
					var createdformSO = nlapiGetFieldValue('createdfrom');
					if(!isEmpty(createdformSO)){
						var finedFlg = nlapiLookupField('salesorder', createdformSO, 'custbody_djkk_finet_bill_mail_flg');
						console.log('finedFlg',finedFlg)
						if(finedFlg == 'T'){
							nlapiSetFieldValue('custbody_djkk_finet_shipping_typ',1)
						}
					}
				}
				if(type == 'edit'){
					if(isEmpty(nlapiGetFieldValue('custbody_djkk_invoice_cirdit_flg'))){
						nlapiSetFieldValue('custbody_djkk_invoice_cirdit_flg','invoice')
					}
				}
	   }
//	   console.log('type',type)
//	   console.log('customform',customform)
//	   if(type == 'create' && customform == '160'){
//		   console.log(1)
//		   var createdformSO = nlapiGetFieldValue('createdfrom');
//		   console.log('createdformSO',createdformSO)
//		   if(!isEmpty(createdformSO)){
//			   var finedFlg = nlapiLookupField('salesorder', createdformSO, 'custbody_djkk_finet_bill_mail_flg');
//			   console.log('finedFlg',finedFlg)
////				var finedFlg = soRecord.getFieldValue('custbody_djkk_finet_bill_mail_flg');//DJ_FINET�������M�t���O
//			   if(finedFlg == 'T'){
//				   inv.setFieldValue('custbody_djkk_finet_shipping_typ',1)
//			   }
//		   }
//	   }
	   
	   	// by LIU 2022/01/12
		var itemCount = nlapiGetLineItemCount('item');
		for(var i = 1 ; i < itemCount + 1 ; i ++){
			
			//�@�Q�b�g�l
			// �A�C�e��ID
			var itemId = nlapiGetLineItemValue('item', 'item', i);
			// DJ_���萔(�����)
			var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity')
			// DJ_����
			var perunitQuantity = nlapiGetLineItemValue('item', 'custcol_djkk_perunitquantity', i);
			
			// ����
			var quantity = nlapiGetLineItemValue('item', 'quantity', i);
			
			if(!isEmpty(itemId) && !isEmpty(itemPerunitQuantity) && !isEmpty(perunitQuantity)){
				//�@�v�Z
				// DJ_��{����
				var conversionRate = (quantity * perunitQuantity).toFixed(2);
				// DJ_�P�[�X��
				var floor = Math.floor(conversionRate / itemPerunitQuantity);
				var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
				// DJ_�o����
				var djQuantity = (conversionRate - caseQuantity * itemPerunitQuantity).toFixed(2);
				
				// �Z�b�g�l
				// DJ_��{����
				nlapiSetLineItemValue('item', 'custcol_djkk_conversionrate', i,
						conversionRate);
				// DJ_�P�[�X��
				nlapiSetLineItemValue('item', 'custcol_djkk_casequantity', i,
						caseQuantity);
				// DJ_�o����
				nlapiSetLineItemValue('item', 'custcol_djkk_quantity', i,
						djQuantity);
				// DJ_����
				nlapiSetLineItemValue('item', 'custcol_djkk_perunitquantity', i,
						itemPerunitQuantity);
			}
		}
	   
   }
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {
    // CH454 zheng 20230428 start
//	var location = nlapiGetFieldValue('location');
//	if (isEmpty(location)) {
//		var count = nlapiGetLineItemCount('item');
//		for (var i = 1; i < count + 1; i++) {			
//			var itemtYPE = nlapiGetLineItemValue('item', 'itemtype',i);		
//				if (itemtYPE == 'InvtPart' || itemtYPE == 'Assembly') {
//					alert('���̃t�B�[���h�ɒl����͂��Ă�������:DJ_�ꏊ');
//					return false;
//				}
//		}
//	}
    // CH454 zheng 20230428 end
    
  // DJ_�������������M
//	var invoice_automa_flg = nlapiGetFieldValue('custbody_djkk_invoice_automa');
//	var invoice_automa_mail = nlapiGetFieldValue('custbody_djkk_invoice_automatic_mail');
//	var invoice_automa_fax = nlapiGetFieldValue('custbody_djkk_invoice_automatic_fax');
//	if (invoice_automa_flg == 'T' && isEmpty(invoice_automa_mail) && isEmpty(invoice_automa_fax)) {
//		alert('�uDJ_�������������M�v���`�F�b�N�����ꍇ�A�uDJ_�������������M���t�惁�[���v�ƁuDJ_�������������M���t��FAX�v�������ꂩ���������L������B');
//		return false;
//	}
	
   	//20220913 add by zhou U833
	var subsidiary = nlapiGetFieldValue('subsidiary');//getRoleSubsidiary();
	var customform = nlapiGetFieldValue('customform');
	var project = nlapiGetFieldValue('custbody_djkk_project');
	var soid = nlapiGetFieldValue('createdfrom');
	var quantityFlag = false;
	if(customform == '179' && (subsidiary != SUB_NBKK && subsidiary != SUB_ULKK) && !isEmpty(soid) && !isEmpty(project)){
		var count = nlapiGetLineItemCount('item');
		for (var i = 1; i < count + 1; i++) {	
			nlapiSelectLineItem('item',i);
			var quantityunbilled = Number(nlapiGetCurrentLineItemValue('item', 'quantityunbilled'));//������
			var quantityremaining = Number(nlapiGetCurrentLineItemValue('item', 'quantityremaining'));//���ב҂�
			var quantityTotal = quantityunbilled + quantityremaining;
			var quantity = Number(nlapiGetCurrentLineItemValue('item', 'quantity'));//����
			if(quantity == quantityTotal){
//				var itemName = nlapiGetCurrentLineItemText('item', 'item')
				quantityFlag = true;
			}
		}
		if(quantityFlag == true){
			alert('�c���ʂȂ��ł�낵���ł����H���m�F���������I')
		}
	}
   	//end
	if(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK){
	var entity=nlapiGetFieldValue('entity');
	var invFlag=nlapiGetFieldValue('custbody_4392_includeids');
	if (!isEmpty(entity)&&invFlag=='F') {
		var sumFlag=nlapiLookupField('customer', entity, 'custentity_4392_useids');
		if(sumFlag=='T'){
			alert('���v�������Ɋ܂߂�� ���v���������g�p��v���Ă��Ȃ��A���m�F���Ă�������');
		}
	}
	}
	
	//20230130 add by song start U587 
	if(customform == '160'){
		var shipping_typ  = nlapiGetFieldValue('custbody_djkk_finet_shipping_typ');//DJ_FINET�o�׋敪
		var delivery_destination = nlapiGetFieldValue('custbody_djkk_delivery_destination');//�[�i��
		var invFlag=nlapiGetFieldValue('custbody_4392_includeids');
		if (invFlag=='T') {
			if(isEmpty(shipping_typ)){
//				confirm('DJ_FINET�o�׋敪��ݒ肵�Ă��������B')
				if(confirm('DJ_FINET�o�׋敪��ݒ肵�Ă��������B')){
				}else{
					return false;
				}
			}
		}
		if(!isEmpty(shipping_typ)){
			if(isEmpty(delivery_destination)){
//				confirm('DJ_�[�i���ݒ肵�Ă��������B')
				if(confirm('DJ_�[�i���ݒ肵�Ă��������B')){
				}else{
					return false;
				}
			}
		}
		
	}
	//20230130 add by song end U587 
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
	//commented by zhou by U557 : CH073�C��
	//�E�`�[���׃A�C�e���ǉ����ɉ��i�\�ł͂Ȃ��A�C�e���}�X�^�̉��i���\�������
	//�@���i�\�̃v���C�X�𔽉f����悤�ɏC��
	
	//changed by geng add start U557
//	if(name=='entity'){
//		var sub = nlapiGetFieldValue('subsidiary');
//		if(sub==SUB_NBKK || sub==SUB_ULKK){
//			var entityId = nlapiGetFieldValue('entity');
//			var priceRecordId = nlapiLookupField('customer',entityId,'custentity_djkk_pl_code_fd');
//			var priceRecord = nlapiLoadRecord('customrecord_djkk_price_list_fd',priceRecordId);
//			var priceCount = priceRecord.getLineItemCount('recmachcustrecord_djkk_pldt_pl_fd');
//			var itemCount = nlapiGetLineItemCount('item');
//			var priceArr = new Array();
//			for(var j=1;j<priceCount+1;j++){
//				var priceItem = priceRecord.getLineItemValue('recmachcustrecord_djkk_pldt_pl_fd','custrecord_djkk_pldt_itemcode_fd',j);
//				var rate = priceRecord.getLineItemValue('recmachcustrecord_djkk_pldt_pl_fd','custrecord_djkk_pldt_saleprice_fd',j);
//				priceArr.push({
//					priceItem:priceItem,
//					rate:rate
//				})
//				}
//			if(itemCount>0){
//			for(var i=1;i<itemCount+1;i++){
//				var item = nlapiGetLineItemValue('item','item',i);
//				var taxcode = nlapiGetLineItemValue('item','taxcode',i);
//				for(var k=0;k<priceArr.length;k++){
//					if(item==priceArr[k].priceItem){
//						nlapiSelectLineItem('item',i);
//						nlapiSetCurrentLineItemValue('item', 'rate',priceArr[k].rate);	
//						nlapiSetCurrentLineItemValue('item', 'taxcode',taxcode);
//					}else{
//						var inventoryitemSearch = nlapiSearchRecord("item",null,
//								[
//								  
//								   ["internalid","anyof",item]
//								], 
//								[
//								   new nlobjSearchColumn("baseprice")
//								]
//								);
//						if(!isEmpty(inventoryitemSearch)){
//							var rate = inventoryitemSearch[0].getValue("baseprice");
//							nlapiSelectLineItem('item',i);
//							nlapiSetCurrentLineItemValue('item', 'rate',rate);	
//							nlapiSetCurrentLineItemValue('item', 'taxcode',taxcode);
//						}
//					}
//				}
//			}
//		   }
//		}		
//	}
	//changed by geng add end U557
		
	//2022/03/28 change by ycx �ڋq DJ_�x������ �x�������i���ߓ�����) start
	if(name == 'custbody_djkk_payment_conditions'){
		var subsidiary = nlapiGetFieldValue('subsidiary');
		if(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK ){
		var conditionsValue = nlapiGetFieldValue('custbody_djkk_payment_conditions');
		if(conditionsValue == 2){
			nlapiSetFieldValue('terms',7)
			}else if(conditionsValue == 1){
			nlapiSetFieldValue('terms',10)
			}
//			else{
//				nlapiSetFieldValue('terms','');	
//			}
	 }	  
	}
//	//end
//
//	if(name == 'custpage_location'){
//		var custLocation = nlapiGetFieldValue('custpage_location');
//		nlapiLogExecution('DEBUG', 'custLocation', custLocation);
//	}
//	
	
	
       if(name=='custbody_djkk_location'){
	   nlapiSetFieldValue('location', nlapiGetFieldValue('custbody_djkk_location'), false, true);
      }
       if(name=='entity'||name=='custbody_djkk_delivery_date'||name=='shipdate'){
    	   var entityId=nlapiGetFieldValue('entity');
    	   var requestday='';
    	   if(!isEmpty(entityId)){
    		   var flag=nlapiLookupField('customer', entityId, 'custentity_djkk_requestday_flag');
    		   if(flag=='sd'){
    			   requestday=nlapiGetFieldValue('shipdate');
    		   }else if(flag=='dd'){
    			   requestday=nlapiGetFieldValue('custbody_djkk_delivery_date');
    		   }
    		   if(isEmpty(requestday)){
    			   requestday=nlapiDateToString(getSystemTime());
    		   }
    		  nlapiSetFieldValue('trandate',requestday, false, true); 
    	   }
       }
       
    // by LIU 2022/01/12
   	if (type == 'item' && (name == 'units' || name == 'quantity'|| name == 'item')) {
   		
   		var itemId = nlapiGetCurrentLineItemValue('item', 'item');

   		// DJ_����
   	// CH677 zheng 20230629 start
//		var unitname = nlapiGetCurrentLineItemText('item', 'units');
		 var unitId = nlapiGetCurrentLineItemValue('item', 'units');
         var crVal = '';
         if (!isEmpty(unitId)) {
             if (itemId) {
                 var itemUnitsTypeId = nlapiLookupField('item',itemId,'unitstype');
                 if (itemUnitsTypeId) {
                     crVal = getConversionrateAbbreviationNew(itemUnitsTypeId, unitId);
                 }   
             }
         }
//		var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
		var perunitQuantity = !isEmpty(crVal) ? crVal : '';
		// CH677 zheng 20230629 end
		if(!isEmpty(perunitQuantity) && !isEmpty(itemId)){
   			
   			// DJ_���萔(�����)
   			var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity')
            
   			// ����
   		   	var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');
   			
   			if(!isEmpty(itemPerunitQuantity) && !isEmpty(quantity)){
   				
   		   		// DJ_��{����
   	   			var conversionRate = quantity * perunitQuantity;
   	   			
   	   			// DJ_�P�[�X��
   				var floor = Math.floor(conversionRate / itemPerunitQuantity);
   				var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
   	   			
   	   			// DJ_�o����
   	   			var djQuantity = conversionRate - caseQuantity * itemPerunitQuantity;
   	   			
   	   			// DJ_��{����
   	   			nlapiSetCurrentLineItemValue('item', 'custcol_djkk_conversionrate',
   	   					conversionRate);
   	   			// DJ_�P�[�X��
   	   			nlapiSetCurrentLineItemValue('item', 'custcol_djkk_casequantity',
   	   					caseQuantity);
   	   			// DJ_�o����
   	   			nlapiSetCurrentLineItemValue('item', 'custcol_djkk_quantity',
   	   					djQuantity);
   	   			// DJ_����
   	   			nlapiSetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity',
						itemPerunitQuantity);
   			}
   		}
   	}
   	if(type == 'item' && name == 'item'){
   		var locationValue = nlapiGetFieldValue('location');
   		var customform = nlapiGetFieldValue('customform');
		if(customform == '160'){
			if(!isEmpty(locationValue)){
				nlapiSetCurrentLineItemValue('item', 'location',
						locationValue);
			}
		}
		//20221222 add by zhou start CH167
		var itemtype = nlapiGetCurrentLineItemValue('item', 'itemtype');
		if(itemtype == 'OthCharge'){
			nlapiSetCurrentLineItemValue('item', 'taxcode',8);//�ŋ��R�[�h�Ɛ�
			nlapiSetCurrentLineItemText('item', 'tax',Number(0));
		}
		//end
   	}
	//20221103 add by zhou U766 U085 sendmailFlag
   	if(name == "custbody_djkk_delivery_destination" || name == "entity"){
   		var customer =  nlapiGetFieldValue('entity');//�ڋq
   		var delivery =  nlapiGetFieldValue('custbody_djkk_delivery_destination');//�[�i��
   		var loadingRecord ;
   		var customform = nlapiGetFieldValue('customform');
   		if(customform == '179'){	
			if(!isEmpty(delivery)){
				loadingRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',delivery);
				var shippinginfosendtype = loadingRecord.getFieldValue('custrecord_djkk_shippinginfosendtyp')//DJ_�[���񓚑��M���@|DJ_�o�׈ē����M�敪
				var shippinginfodesttype = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodesttyp')//DJ_�[���񓚑��M��|DJ_�o�׈ē����M��敪
				var deliverydestrep = loadingRecord.getFieldValue('custrecord_djkk_deliverydestrep')//DJ_�[���񓚑��M��S����|DJ_�o�׈ē����M��S����
				var shippinginfodestname = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestname')//DJ_�[���񓚑��M���Ж�(3RD�p�[�e�B�[)|DJ_�o�׈ē����M���Ж�(3RD�p�[�e�B�[)
				var shippinginfodestrep = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestrep')//DJ_�[���񓚑��M��S����(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��S����(3RD�p�[�e�B�[)
				var shippinginfodestemail = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestemail')//DJ_�[���񓚑��M�惁�[��(3RD�p�[�e�B�[)|DJ_�o�׈ē����M�惁�[��(3RD�p�[�e�B�[)
				var shippinginfodestfax = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestfax')//DJ_�[���񓚑��M��FAX(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��FAX(3RD�p�[�e�B�[)
				var shippinginfodestmemo = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestmemo')//DJ_�[���񓚎������M���t����l|DJ_�o�׈ē����M��o�^����
				if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype != '101'){
					//�ڋq�D��ȊO�̏ꍇ
					nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', shippinginfosendtype);
					nlapiSetFieldValue('custbody_djkk_shippinginfodesttyp', shippinginfodesttype);
					nlapiSetFieldValue('custbody_djkk_customerrep_new', deliverydestrep);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestname', shippinginfodestname);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestrep_new', shippinginfodestrep);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestemail', shippinginfodestemail);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestfax', shippinginfodestfax);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestmemo_new', shippinginfodestmemo);	
				}else if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype == '101'){
					//�ڋq�D��̏ꍇ
					customerSendmails(nlapiGetFieldValue('entity'));
				}
	//			else if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype == '36'){
	//				//���M�s�̏ꍇ
	//				nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp_new', shippinginfosendtype);
	//			}
			}else{
				customerSendmails(nlapiGetFieldValue('entity'));
			}
   		}
   	    // CH454 zheng 20230428 start
   		if(!isEmpty(customer)){
   	      var loadingCustomer = nlapiLoadRecord('customer',nlapiGetFieldValue('entity'));
          var invoicePeriod = loadingCustomer.getFieldValue('custentity_djkk_invoice_book_period')//DJ_���������M�敪
          var invoiceSite = loadingCustomer.getFieldValue('custentity_djkk_invoice_book_site')//DJ_���������M��敪
          var department =  loadingCustomer.getFieldValue('custentity_djkk_activity')//DJ_�Z�N�V���� 
          nlapiSetFieldValue('custbody_djkk_invoice_book_period', invoicePeriod);
          nlapiSetFieldValue('custbody_djkk_invoice_book_site', invoiceSite);
          nlapiSetFieldValue('department', department);   
   		}
   	    // CH454 zheng 20230428 end
   	}
   	//end
   	if(name=='billaddresslist'){
   		var billaddressValue = nlapiGetFieldValue('billaddresslist')+','+nlapiGetFieldText('billaddresslist');
   		console.log(nlapiGetFieldText('billaddresslist'))
 	   nlapiSetFieldValue('custbody_djkk_billaddresslist', billaddressValue);
     }
   	
   	if((name == 'custbody_djkk_delivery_destination'||name == 'entity') && nlapiGetFieldValue('customform')== '160' ){
		var destinationID = nlapiGetFieldValue('custbody_djkk_delivery_destination');
		var entityId = nlapiGetFieldValue('entity');
		var cust=nlapiGetFieldValue('customform'); 
		if (name == 'custbody_djkk_delivery_destination') {
			if (!isEmpty(destinationID)) {
				var destinationRecord = nlapiLookupField('customrecord_djkk_delivery_destination', destinationID,['custrecord_djkk_customer','custrecord_djkk_sales','custrecord_djkk_prefectures','custrecord_djkk_municipalities','custrecord_djkk_delivery_residence','custrecord_djkk_delivery_residence2','custrecord_djkk_language_napin']);
				var customerID = destinationRecord.custrecord_djkk_customer;
				var salesID = destinationRecord.custrecord_djkk_sales;
				if (!isEmpty(customerID)) {
					nlapiSetFieldValue('entity', customerID,false,true);
					nlapiSetFieldValue('custbody_djkk_delivery_destination', destinationID,false,true);
				}
				
				if (!isEmpty(salesID)) {
					nlapiSetFieldValue('salesrep', salesID,false,true);
				}
			}
		}
		if(!isEmpty(destinationID)){
			var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destinationID); // DJ_�[�i��record
		}
		if(!isEmpty(nlapiGetFieldValue('entity'))){
			var custRecord = nlapiLoadRecord('customer',nlapiGetFieldValue('entity'));
		}

		if(!isEmpty(destinationID)){
				var deliveryPeriod = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_period');//DJ_�[�i�����M���@
				var deliverySiteFd = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_site_fd');//DJ_�[�i�����M��
				var deliveryPerson = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person');//DJ_�[�i�����M��S����
				var deliverySubName = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_subname');//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
				var deliveryPersont = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person_t');//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
				var deliveryEmail = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_email');//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
				var deliveryFax = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_fax_three');//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
				var deliveryMemo = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_memo');//DJ_�[�i���������M���t����l
				if(!isEmpty(deliveryPeriod)&& (deliveryPeriod != '9')){
					nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_�[�i�����M���@
					nlapiSetFieldValue('custbody_djkk_delivery_book_site_fd', deliverySiteFd,false);//DJ_�[�i�����M��
					nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);//DJ_�[�i�����M��S����
					nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo);//DJ_�[�i���������M���l  custbody_djkk_reference_column
				}else if(!isEmpty(deliveryPeriod) && (deliveryPeriod == '9')){
					customerSendmails(nlapiGetFieldValue('entity'));
				}
		}else{

			customerSendmails(nlapiGetFieldValue('entity'));
		}
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
	
	if (type == 'item'&&name == 'item') {
   		
   		var itemId = nlapiGetCurrentLineItemValue('item', 'item');

   		// DJ_����
   	// CH677 zheng 20230629 start
//		var unitname = nlapiGetCurrentLineItemText('item', 'units');
   		var unitId = nlapiGetCurrentLineItemValue('item', 'units');
        var crVal = '';
        if (!isEmpty(unitId)) {
            if (itemId) {
                var itemUnitsTypeId = nlapiLookupField('item',itemId,'unitstype');
                if (itemUnitsTypeId) {
                    crVal = getConversionrateAbbreviationNew(itemUnitsTypeId, unitId);
                }   
            }
        }
//		var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
		var perunitQuantity = !isEmpty(crVal) ? crVal : '';
		// CH677 zheng 20230629 end
		if(!isEmpty(perunitQuantity) && !isEmpty(itemId)){
   			
   			// DJ_���萔(�����)
   			var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity')
            
   			// ����
   		   	var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');
   			
   			if(!isEmpty(itemPerunitQuantity) && !isEmpty(quantity)){
   				
   		   		// DJ_��{����
   	   			var conversionRate = quantity * perunitQuantity;
   	   			
   	   			// DJ_�P�[�X��
   				var floor = Math.floor(conversionRate / itemPerunitQuantity);
   				var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
   	   			
   	   			// DJ_�o����
   	   			var djQuantity = conversionRate - caseQuantity * itemPerunitQuantity;
   	   			
   	   			// DJ_��{����
   	   			nlapiSetCurrentLineItemValue('item', 'custcol_djkk_conversionrate',
   	   					conversionRate);
   	   			// DJ_�P�[�X��
   	   			nlapiSetCurrentLineItemValue('item', 'custcol_djkk_casequantity',
   	   					caseQuantity);
   	   			// DJ_�o����
   	   			nlapiSetCurrentLineItemValue('item', 'custcol_djkk_quantity',
   	   					djQuantity);
   	   			// DJ_����
   	   			nlapiSetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity',
						itemPerunitQuantity);
   			}
   		}
   	}
}
//20220512 add by zhou start
//���`-�[�i��PDF�o��
function pdfMaker(){
	debugger;
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_receipt_pdf','customdeploy_djkk_receipt_pdf');
	theLink+='&invoiceid='+nlapiGetRecordId();
	theLink+='&flag='+"invoice";
	window.open(theLink);
}
//20220512 add by zhou end

function outputpdf(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair','customdeploy_djkk_sl_repair');
	theLink+='&creatpdfid='+nlapiGetRecordId();
	window.open(theLink);
}

//add 20221024 by sys start
function invoicePdf(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_pdfmaker','customdeploy_djkk_sl_invoice_pdfmaker');
	theLink+='&invoiceid='+nlapiGetRecordId();
	theLink+='&type='+'invoice';
	window.open(theLink);
}	
//add 20221024 by sys end	
//changed by geng add start U248
function invoiceTranPdf(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_tran_pdf','customdeploy_djkk_sl_invoice_tran_pdf');
	theLink+='&invoiceid='+nlapiGetRecordId();
	window.open(theLink);
}
//changed by geng add end U248

// CH809 add by zdj 20230818 start
function fieldsModify(){

    var ivId = nlapiGetRecordId();
    var invoiceObj = nlapiLookupField('invoice', ivId, ['custbody_djkk_invoice_creditmemo','custbody_4392_includeids', 'subsidiary'])
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_fields_m', 'customdeploy_djkk_sl_invoice_fields_m');
	https += '&invoiceid=' + ivId;
	if (invoiceObj) {
	    var flg = invoiceObj.custbody_4392_includeids; 
	    var crmemo = invoiceObj.custbody_djkk_invoice_creditmemo; 
	    var subsidiary = invoiceObj.subsidiary; 
	    https += '&crmemo=' + crmemo;
	    https += '&flg=' + flg;
	    https += '&subs=' + subsidiary;
	}
	nlExtOpenWindow(https, 'newwindow', 400, 300, this, false, '�������C��');
	//open(https,'_lanedcost','top=300,left=700,width=400,height=300,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no');
}

function updateInv() {
    
	var invoiceid = nlapiGetFieldValue('custpage_invoice_invoiceid');
	var invIdscontain = nlapiGetFieldValue('custpage_invoice_parent_flg');
	var invCreditmemo = nlapiGetFieldValue('custpage_invoice_parent_creditmemo');
	var updateFlg = false;
	
	var creditmemovalue = nlapiGetFieldValue('custpage_invoice_creditmemo');
	var idscontainvalue = nlapiGetFieldValue('custpage_invoice_idscontain');
	if (creditmemovalue != invCreditmemo) {
	    updateFlg = true;
	}
	if (idscontainvalue != invIdscontain) {
	    updateFlg = true;
	}
	
	if (updateFlg) {
	    nlapiSubmitField('invoice',invoiceid,['custbody_djkk_invoice_creditmemo','custbody_4392_includeids'],[creditmemovalue,idscontainvalue]);
	    window.ischanged = false;
	    window.parent.location.reload();
	}

	closePopup(true);
}
// CH809 add by zdj 20230818 end

function customerSendmails(customer){
	var loadingCustomer = nlapiLoadRecord('customer',customer);
	console.log(loadingCustomer)
	var shippinginfosendtype = loadingCustomer.getFieldValue('custentity_djkk_shippinginfosendtyp')//DJ_�[���񓚑��M���@|DJ_�o�׈ē����M�敪
	var shippinginfodesttype = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodesttyp')//DJ_�[���񓚑��M��|DJ_�o�׈ē����M��敪
	var deliverydestrep = loadingCustomer.getFieldValue('custentity_djkk_customerrep')//DJ_�[���񓚑��M��S����|DJ_�o�׈ē����M��S����
	var shippinginfodestname = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestname')//DJ_�[���񓚑��M���Ж�(3RD�p�[�e�B�[)|DJ_�o�׈ē����M���Ж�(3RD�p�[�e�B�[)
	var shippinginfodestrep = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestrep')//DJ_�[���񓚑��M��S����(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��S����(3RD�p�[�e�B�[)
	var shippinginfodestemail = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestemail')//DJ_�[���񓚑��M�惁�[��(3RD�p�[�e�B�[)|DJ_�o�׈ē����M�惁�[��(3RD�p�[�e�B�[)
	var shippinginfodestfax = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestfax')//DJ_�[���񓚑��M��FAX(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��FAX(3RD�p�[�e�B�[)
	var shippinginfodestmemo = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestmemo')//DJ_�[���񓚎������M���t����l|DJ_�o�׈ē����M��o�^����
	console.log(shippinginfosendtype)
	if(!isEmpty(shippinginfosendtype)){
		nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', shippinginfosendtype);
		nlapiSetFieldValue('custbody_djkk_shippinginfodesttyp', shippinginfodesttype);
		nlapiSetFieldValue('custbody_djkk_customerrep_new', deliverydestrep);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestname', shippinginfodestname);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestrep_new', shippinginfodestrep);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestemail', shippinginfodestemail);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestfax', shippinginfodestfax);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestmemo_new', shippinginfodestmemo);	
	}
}