/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Nov 2022     rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
//  by song
function suitelet(request, response){
	if (request.getMethod() == 'POST') {
		run(request, response);		
	}else{
		createForm(request, response);
	}
}

function run (request, response){
	
}

function createForm(request, response){
	
	var inv = request.getParameter('invID');
//	if(!isEmpty(invID)){
		var form = nlapiCreateForm('DJ_�݌ɒ����݌ɏڍ�', false);	
//		form.setScript('');
		try{
//			var invID=nlapiLoadRecord('customrecord_djkk_inventory_stock_detail', inv);	 //DJ_�݌ɒ����݌ɏڍ׃��R�[�h	
//			form.addSubmitButton('�X�V');
			form.addFieldGroup('select_group', '����');
			var itemField=form.addField('custpage_djkk_make_item', 'select', 'DJ_�A�C�e��','item', 'select_group');//DJ_�A�C�e��
//			itemField.setDisplayType('inline');
//			itemField.setDefaultValue(inv.getFieldValue('custrecord_djkk_make_item'));
			
			var quantityField=form.addField('custpage_djkk_make_quantity', 'text', 'DJ_����',null, 'select_group');//DJ_����
//			quantityField.setDisplayType('inline');
//			quantityField.setDefaultValue(inv.getFieldValue('custrecord_djkk_make_qty'));
			
			var explanationField=form.addField('custpage_djkk_make_item_explanation', 'text', 'DJ_����',null, 'select_group');//DJ_����
//			explanationField.setDisplayType('inline');
//			explanationField.setDefaultValue(inv.getFieldValue('custrecord_djkk_make_item_explanation'));
			
			var unitField=form.addField('custpage_djkk_make_unit', 'text', 'DJ_�P��',null, 'select_group');//DJ_�P��
//			unitField.setDisplayType('inline');
//			unitField.setDefaultValue(inv.getFieldText('custrecord_djkk_make_unit'));
						
			var subList = form.addSubList('list', 'list', 'DJ_�݌ɒ����݌ɏڍז���');
			subList.addMarkAllButtons();
			subList.addField('custpage_checkbox', 'checkbox', '�I��');
			subList.addField('custpage_receiptinventorynumber', 'text', 'DJ_�V���A��/���b�g�ԍ�');
			subList.addField('custpage_shelves', 'text', 'DJ_�ۊǒI');
			subList.addField('custpage_termdate', 'text', 'DJ_�L������');
			subList.addField('custpage_lotnum', 'text', 'DJ_���[�J�[�������b�g�ԍ�');
			subList.addField('custpage_serialnum', 'text', 'DJ_���[�J�[�V���A���ԍ�');
			subList.addField('custpage_codedate', 'text', 'DJ_�����N����');
			// DENISJAPANDEV-1387 zheng 20230306 start
			// subList.addField('custpage_consolidated', 'text', 'DJ_�c�o�׉\����/DJ_�o�׉\������');
			subList.addField('custpage_consolidated', 'text', 'DJ_�o�׉\������');
			// DENISJAPANDEV-1387 zheng 20230306 end
			subList.addField('custpage_warehousecode', 'text', 'DJ_�q�ɓ��ɔԍ�');
			subList.addField('custpage_smccode', 'text', 'DJ_SMC�ԍ�');
			subList.addField('custpage_lotremark', 'text', 'DJ_���b�g���}�[�N');
			subList.addField('custpage_memo', 'text', 'DJ_���b�g����');
			subList.addField('custpage_quantity', 'text', 'DJ_����');
			
//			var count=invID.getLineItemCount('');
//			var itemLine = 1;
//			for(var i=1;i<count+1;i++){
//				invID.selectLineItem('', i);
//				subList.setLineItemValue('custpage_receiptinventorynumber', itemLine,invID.getCurrentLineItemValue('', ''));  //DJ_�V���A��/���b�g�ԍ�
//				subList.setLineItemValue('custpage_shelves', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_�ۊǒI
//				subList.setLineItemValue('custpage_termdate', itemLine,invID.getCurrentLineItemValue('', ''));  //DJ_�L������
//				subList.setLineItemValue('custpage_lotnum', itemLine,invID.getCurrentLineItemValue('', ''));  //DJ_���[�J�[�������b�g�ԍ�
//				subList.setLineItemValue('custpage_serialnum', itemLine,invID.getCurrentLineItemValue('', ''));  //DJ_���[�J�[�V���A���ԍ�
//				subList.setLineItemValue('custpage_codedate', itemLine,invID.getCurrentLineItemValue('', ''));  //DJ_�����N����
//				subList.setLineItemValue('custpage_consolidated', itemLine,invID.getCurrentLineItemValue('', ''));   //DJ_�c�o�׉\����/DJ_�o�׉\������
//				subList.setLineItemValue('custpage_warehousecode', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_�q�ɓ��ɔԍ�
//				subList.setLineItemValue('custpage_smccode', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_SMC�ԍ�
//				subList.setLineItemValue('custpage_lotremark', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_���b�g���}�[�N
//				subList.setLineItemValue('custpage_memo', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_���b�g����
//				subList.setLineItemValue('custpage_quantity', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_����
//				itemLine++;
//			}
			
			
		}
		catch(e){
			
		}
//	}
	response.writePage(form);
}
