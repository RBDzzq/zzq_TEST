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
		var form = nlapiCreateForm('DJ_在庫調整在庫詳細', false);	
//		form.setScript('');
		try{
//			var invID=nlapiLoadRecord('customrecord_djkk_inventory_stock_detail', inv);	 //DJ_在庫調整在庫詳細レコード	
//			form.addSubmitButton('更新');
			form.addFieldGroup('select_group', '検索');
			var itemField=form.addField('custpage_djkk_make_item', 'select', 'DJ_アイテム','item', 'select_group');//DJ_アイテム
//			itemField.setDisplayType('inline');
//			itemField.setDefaultValue(inv.getFieldValue('custrecord_djkk_make_item'));
			
			var quantityField=form.addField('custpage_djkk_make_quantity', 'text', 'DJ_数量',null, 'select_group');//DJ_数量
//			quantityField.setDisplayType('inline');
//			quantityField.setDefaultValue(inv.getFieldValue('custrecord_djkk_make_qty'));
			
			var explanationField=form.addField('custpage_djkk_make_item_explanation', 'text', 'DJ_説明',null, 'select_group');//DJ_説明
//			explanationField.setDisplayType('inline');
//			explanationField.setDefaultValue(inv.getFieldValue('custrecord_djkk_make_item_explanation'));
			
			var unitField=form.addField('custpage_djkk_make_unit', 'text', 'DJ_単位',null, 'select_group');//DJ_単位
//			unitField.setDisplayType('inline');
//			unitField.setDefaultValue(inv.getFieldText('custrecord_djkk_make_unit'));
						
			var subList = form.addSubList('list', 'list', 'DJ_在庫調整在庫詳細明細');
			subList.addMarkAllButtons();
			subList.addField('custpage_checkbox', 'checkbox', '選択');
			subList.addField('custpage_receiptinventorynumber', 'text', 'DJ_シリアル/ロット番号');
			subList.addField('custpage_shelves', 'text', 'DJ_保管棚');
			subList.addField('custpage_termdate', 'text', 'DJ_有効期限');
			subList.addField('custpage_lotnum', 'text', 'DJ_メーカー製造ロット番号');
			subList.addField('custpage_serialnum', 'text', 'DJ_メーカーシリアル番号');
			subList.addField('custpage_codedate', 'text', 'DJ_製造年月日');
			// DENISJAPANDEV-1387 zheng 20230306 start
			// subList.addField('custpage_consolidated', 'text', 'DJ_残出荷可能期間/DJ_出荷可能期限日');
			subList.addField('custpage_consolidated', 'text', 'DJ_出荷可能期限日');
			// DENISJAPANDEV-1387 zheng 20230306 end
			subList.addField('custpage_warehousecode', 'text', 'DJ_倉庫入庫番号');
			subList.addField('custpage_smccode', 'text', 'DJ_SMC番号');
			subList.addField('custpage_lotremark', 'text', 'DJ_ロットリマーク');
			subList.addField('custpage_memo', 'text', 'DJ_ロットメモ');
			subList.addField('custpage_quantity', 'text', 'DJ_数量');
			
//			var count=invID.getLineItemCount('');
//			var itemLine = 1;
//			for(var i=1;i<count+1;i++){
//				invID.selectLineItem('', i);
//				subList.setLineItemValue('custpage_receiptinventorynumber', itemLine,invID.getCurrentLineItemValue('', ''));  //DJ_シリアル/ロット番号
//				subList.setLineItemValue('custpage_shelves', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_保管棚
//				subList.setLineItemValue('custpage_termdate', itemLine,invID.getCurrentLineItemValue('', ''));  //DJ_有効期限
//				subList.setLineItemValue('custpage_lotnum', itemLine,invID.getCurrentLineItemValue('', ''));  //DJ_メーカー製造ロット番号
//				subList.setLineItemValue('custpage_serialnum', itemLine,invID.getCurrentLineItemValue('', ''));  //DJ_メーカーシリアル番号
//				subList.setLineItemValue('custpage_codedate', itemLine,invID.getCurrentLineItemValue('', ''));  //DJ_製造年月日
//				subList.setLineItemValue('custpage_consolidated', itemLine,invID.getCurrentLineItemValue('', ''));   //DJ_残出荷可能期間/DJ_出荷可能期限日
//				subList.setLineItemValue('custpage_warehousecode', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_倉庫入庫番号
//				subList.setLineItemValue('custpage_smccode', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_SMC番号
//				subList.setLineItemValue('custpage_lotremark', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_ロットリマーク
//				subList.setLineItemValue('custpage_memo', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_ロットメモ
//				subList.setLineItemValue('custpage_quantity', itemLine,invID.getCurrentLineItemValue('', ''));    //DJ_数量
//				itemLine++;
//			}
			
			
		}
		catch(e){
			
		}
//	}
	response.writePage(form);
}
