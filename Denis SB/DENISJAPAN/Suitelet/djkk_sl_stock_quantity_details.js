/**
 * DJ_�݌ɐ���-�݌ɐ��ʉ��
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/01/18     CPC_�v
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	
	createForm(request, response);
}


function createForm(request, response){
  try{ 
	 var selectFlg = request.getParameter('selectFlg');
	 var locationValue = request.getParameter('location');  //WH
	 var cataValue = request.getParameter('catacode');   //StockCode
	
	 var form = nlapiCreateForm('DJ_�݌ɐ��ʉ��', false);
	 form.setScript('customscript_djkk_cs_stock_quantity_deta');
		
	 if(selectFlg == 'T'){
		 form.addButton('btn_return', '�����߂�','searchReturn()');
	 }else{
		form.addButton('btn_search', '����', 'search()');
	 }
	 
	form.addFieldGroup('select_group', '����');
	var locationField = form.addField('custpage_location', 'select', 'WH',null, 'select_group');//�q��
	var filedLocationList = getSearchResults("location",null,
		[
			
		], 
		[
			  new nlobjSearchColumn("internalid"), 
			  new nlobjSearchColumn("name").setSort(false)
		]
		);
	locationField.addSelectOption('', '');
	if(filedLocationList != null){
		for(var i = 0; i<filedLocationList.length;i++){
			var locationName = filedLocationList[i].getValue("name");
			var locationId = filedLocationList[i].getValue("internalid");
			locationField.addSelectOption(locationId,locationName);
		}
	}
	
	var stockField = form.addField('custpage_catalogcode', 'text', '�J�^���O�R�[�h',null, 'select_group'); //�J�^���O�R�[�h
	
	if(selectFlg == 'T'){
		locationField.setDisplayType('inline');
		stockField.setDisplayType('inline');	
	}
	locationField.setDefaultValue(locationValue);
	stockField.setDefaultValue(cataValue);
	
	var subList = form.addSubList('list', 'list', '');
	subList.addField('custpage_wh', 'text', 'WH');
	subList.addField('custpage_itemcode', 'text', '�A�C�e���R�[�h');
	subList.addField('custpage_code', 'text', '�J�^���O�R�[�h');
	subList.addField('custpage_batch', 'text', '�Ǘ��ԍ�');
	subList.addField('custpage_batchnum', 'text', '���b�g���}�[�N�X');
	subList.addField('custpage_batchid', 'text', '���[�J�[�������b�g�ԍ�');
	subList.addField('custpage_tion', 'text', '���i��');
	subList.addField('custpage_nbkk', 'text', '�ܖ�����NBKK');
	subList.addField('custpage_krt', 'text', '�ܖ�����KRT');
	subList.addField('custpage_qtyavailable', 'text', '���p�\��');
	subList.addField('custpage_qtynbkk', 'text', '���݌ɐ�NBKK');
	subList.addField('custpage_qtykrt', 'text', '���݌ɐ�KRT');
	subList.addField('custpage_cha', 'text', '����');
	subList.addField('custpage_rem', 'text', 'Remarks');
	
	if(selectFlg == 'T'){	
		var filit = new Array();
		filit.push(["isinactive","is","F"]);
		if(!isEmpty(locationValue)){//�q��
			filit.push("AND");
			filit.push(["custrecord_djkk_stockquantity_line_local","anyof",locationValue]);
		}
		if(!isEmpty(cataValue)){//�J�^���O�R�[�h 
			filit.push("AND");
			filit.push(["custrecord_djkk_stockquantity_line_item.custitem_djkk_product_code","contains",cataValue]);
		}
		var stockquanSearch = getSearchResults("customrecord_djkk_stock_quantity_line",null,  //DJ_�݌ɐ��ʖ���
				filit,
				[
					new nlobjSearchColumn("custrecord_djkk_stockquantity_line_local"),   //DJ_�݌ɐ��ʖ���.�q��
					new nlobjSearchColumn("custitem_djkk_product_code","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null),  //DJ_�݌ɐ��ʖ���.�݌ɃR�[�h(item)
					new nlobjSearchColumn("custrecord_djkk_stockquantity_line_batch"),   //DJ_�݌ɐ��ʖ���.�o�b�`No.
					new nlobjSearchColumn("custitem_djkk_item_displayname","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null),  //DJ_���i�\����
					new nlobjSearchColumn("custrecord_djkk_stockquantity_line_date"),  //DJ_�݌ɐ��ʖ���.�ܖ�����
					new nlobjSearchColumn("custrecord_djkk_stockquantity_line_stock"), //DJ_�݌ɐ��ʖ���.�݌ɐ���
					new nlobjSearchColumn("vendor","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null),//�݌ɃR�[�h : �D��d����
					new nlobjSearchColumn("custrecord_djkk_stockquantity_line_item"),//�݌ɃR�[�h 
				]
				);
		
		
		var inventorynumberSearch = getSearchResults("inventorynumber",null,  //�݌ɔԍ�
				[
				], 
				[
					new nlobjSearchColumn("inventorynumber").setSort(false), //�Ǘ��ԍ�
					new nlobjSearchColumn("location"), //location
					new nlobjSearchColumn("item"),//name
					new nlobjSearchColumn("custitemnumber_djkk_lot_remark"),//DJ_���b�g���}�[�N
					new nlobjSearchColumn("custitemnumber_djkk_maker_serial_number"),//DJ_���[�J�[�������b�g�ԍ�
					new nlobjSearchColumn("expirationdate"),//�L������
//					new nlobjSearchColumn("formulanumeric").setFormula("{quantityavailable}+{quantityonorder}"),//����
					new nlobjSearchColumn("quantityonhand"),//����
					new nlobjSearchColumn("quantityavailable"),//���p�\��
				]
				);
		var inventorynumberArr = new Array();
		if(!isEmpty(inventorynumberSearch)){
			for(var i = 0 ; i < inventorynumberSearch.length ; i++){
				var inventorynumberId = inventorynumberSearch[i].getValue("inventorynumber")
				var locationId = inventorynumberSearch[i].getValue("location")
				var tempIndex = inventorynumberId+locationId
				inventorynumberArr.push(tempIndex);
				nlapiLogExecution('DEBUG', 'tempIndex',tempIndex);
//				inventorynumberArr.push(inventorynumberSearch[i].getValue("inventorynumber"));
			}
		}
		
		
		var arrivalSearch = getSearchResults("customrecord_djkk_arrival_results",null,   //DJ_���׎���
				[
				],
				[
					new nlobjSearchColumn("custrecord_djkk_stock_code"),   //DJ_�݌ɃR�[�h
					new nlobjSearchColumn("custrecord_djkk_batch_number"),  //DJ_�o�b�`NO.
				]
				);
		var arrCodeArr = new Array();
		var arrbatchArr = new Array();
		if(!isEmpty(arrivalSearch)){
			for(var i = 0 ; i < arrivalSearch.length ; i++){
				arrCodeArr.push(arrivalSearch[i].getValue("custrecord_djkk_stock_code"));
				arrbatchArr.push(arrivalSearch[i].getValue("custrecord_djkk_batch_number"));
			}
		}
		
		
		if(!isEmpty(stockquanSearch)){
			var lineCount = 1;
			for(var i = 0 ; i < stockquanSearch.length ;i++){
				nlapiLogExecution('DEBUG', 'stockquanSearch.length',stockquanSearch.length);
				var ineLocationText  =stockquanSearch[i].getText("custrecord_djkk_stockquantity_line_local");//DJ_�݌ɐ��ʖ���.�q��
				var ineLocationValue  =stockquanSearch[i].getValue("custrecord_djkk_stockquantity_line_local");//DJ_�݌ɐ��ʖ���.�q��
				var ineLocationparts = ineLocationText.split(':');
				var ineLocation = ineLocationparts[0];


				var ineItem = stockquanSearch[i].getValue("custitem_djkk_product_code","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null);//DJ_�݌ɐ��ʖ���.�݌ɃR�[�h(item)
				var ineBatch = stockquanSearch[i].getValue("custrecord_djkk_stockquantity_line_batch");//DJ_�݌ɐ��ʖ���.�o�b�`No.
				var displayname = stockquanSearch[i].getValue("custitem_djkk_item_displayname","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null);//DJ_���i�\����
				var ineDate = stockquanSearch[i].getValue("custrecord_djkk_stockquantity_line_date"); //DJ_�݌ɐ��ʖ���.�ܖ�����
				var ineStock = stockquanSearch[i].getValue("custrecord_djkk_stockquantity_line_stock");//DJ_�݌ɐ��ʖ���.�݌ɐ���
				var vendor = stockquanSearch[i].getText("vendor","CUSTRECORD_DJKK_STOCKQUANTITY_LINE_ITEM",null);//�݌ɃR�[�h : �D��d����
//				var line_item = stockquanSearch[i].getText("custrecord_djkk_stockquantity_line_item");//�݌ɃR�[�h
//				var inventorynumberArr_index = inventorynumberArr.indexOf(ineBatch);
				var currentIndex = ineBatch+ineLocationValue;
				nlapiLogExecution('DEBUG', 'currentIndex',currentIndex);
				var inventorynumberArr_index = inventorynumberArr.indexOf(currentIndex);
				
				if(inventorynumberArr_index < 0){
					var itemCode = ''
					var lotRemark = '';
					var makerSerialNumber = '';
					var expirationdate = '';
					var quantity = '';
					var qtyavailable = '';
				}else{
					var columnID = inventorynumberSearch[inventorynumberArr_index].getAllColumns();
					var itemValue = inventorynumberSearch[inventorynumberArr_index].getValue("item");//�A�C�e���R�[�h
					var itemCode = nlapiLookupField('item', itemValue, 'itemid'); 
					var lotRemark = inventorynumberSearch[inventorynumberArr_index].getValue("custitemnumber_djkk_lot_remark");//DJ_���b�g���}�[�N
					var makerSerialNumber = inventorynumberSearch[inventorynumberArr_index].getValue("custitemnumber_djkk_maker_serial_number");//DJ_���[�J�[�������b�g�ԍ�
					var expirationdate = inventorynumberSearch[inventorynumberArr_index].getValue("expirationdate"); //�L������
					var quantity=inventorynumberSearch[inventorynumberArr_index].getValue(columnID[6]);
//					var quantity = inventorynumberSearch[inventorynumberArr_index][5]//.getValue("formulanumeric").setFormula("{quantityavailable}+{quantityonorder}");//����
					var qtyavailable = inventorynumberSearch[inventorynumberArr_index].getValue("quantityavailable"); //����
				}			
				var difference = Number(quantity) - Number(ineStock); //QtyNBKK - QtyKRT
								
				subList.setLineItemValue('custpage_wh', lineCount,ineLocation);
				subList.setLineItemValue('custpage_itemcode', lineCount,itemCode);
				subList.setLineItemValue('custpage_code', lineCount,ineItem);
				subList.setLineItemValue('custpage_batch', lineCount,ineBatch);
				subList.setLineItemValue('custpage_tion', lineCount,displayname);
				subList.setLineItemValue('custpage_krt', lineCount,ineDate);
				subList.setLineItemValue('custpage_qtykrt', lineCount,ineStock);
				subList.setLineItemValue('custpage_batchnum', lineCount,lotRemark);
				subList.setLineItemValue('custpage_nbkk', lineCount,expirationdate);
				subList.setLineItemValue('custpage_qtyavailable', lineCount,qtyavailable);
				subList.setLineItemValue('custpage_qtynbkk', lineCount,quantity);
				subList.setLineItemValue('custpage_cha', lineCount,difference);
//				subList.setLineItemValue('custpage_batchid', lineCount,vendor);
				subList.setLineItemValue('custpage_batchid', lineCount,makerSerialNumber);
				var arrCodeArr_index = arrCodeArr.indexOf(ineItem);
				var arrbatchArr_index = arrbatchArr.indexOf(ineBatch);
				if(arrCodeArr_index < 0 && arrbatchArr_index < 0){
					subList.setLineItemValue('custpage_rem', lineCount,"�����i");
				}else{
					subList.setLineItemValue('custpage_rem', lineCount,"���i�I��");
				}
				
				lineCount++;
			}
		}
		
	}
	response.writePage(form);
  }
  catch(e){
	  nlapiLogExecution('error', '�G���[', e.message);
  }
}