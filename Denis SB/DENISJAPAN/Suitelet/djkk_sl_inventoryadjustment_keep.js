/**
 * 営業マンキープ/営業マンキープ戻し
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/12/28     CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	//パラメータ取得
	var keepid = request.getParameter('keepid');
	var keeptype = request.getParameter('keeptype');
	if(isEmpty(keepid)||isEmpty(keeptype)){
		response.write('パラメータがありません');
		return;
	}
	var typetxt='';
	if(keeptype=='keep'){
		typetxt='倉庫連携移管';//営業マンキープ
	}else if(keeptype=='keepback'){
		typetxt='倉庫連携移管戻し';
	}
	
	 
	// 営業マンキープ
	 if(keeptype=='keep'){
		 var keepRecord=nlapiLookupField('customrecord_djkk_ic_admit_i', keepid, ['custrecord_djkk_admit_item','custrecord_djkk_admit_inventory_quantity','custrecord_djkk_admit_line_subsidiary','custrecord_djkk_ic_admit']);
		 var keepsubsidiary=keepRecord.custrecord_djkk_admit_line_subsidiary;
		// var keepReason=nlapiLookupField('customrecord_djkk_ic_admit',keepRecord.custrecord_djkk_ic_admit,'custrecord_djkk_admit_re',true);
		 //typetxt=keepReason+'-'+typetxt;

		 var form = nlapiCreateForm(typetxt, true);
			var keepidField=form.addField('keepid', 'text', 'keepid');
			keepidField.setDisplayType('hidden');
			keepidField.setDefaultValue(keepid);
			form.setScript('customscript_djkk_cs_inv_keep');
			form.addSubTab('custpage_list', typetxt+'リスト');
		 
		 var keepitemField=form.addField('keepitem', 'select', 'DJ_アイテム','item');
		 keepitemField.setDisplayType('inline');
		 keepitemField.setDefaultValue(keepRecord.custrecord_djkk_admit_item);
		 var keepquantityField=form.addField('keepquantity', 'text', 'DJ_調整数量');
		 keepquantityField.setDisplayType('inline');
		 keepquantityField.setDefaultValue((Math.abs(keepRecord.custrecord_djkk_admit_inventory_quantity)).toString());	
		 var keepsubsidiaryField=form.addField('keepsubsidiary', 'select', 'DJ_子会社','subsidiary');
		 keepsubsidiaryField.setDisplayType('hidden');
		 keepsubsidiaryField.setDefaultValue(keepsubsidiary);		 
		 var sublist=form.addSubList('keeplist', 'inlineeditor', typetxt,'custpage_list');
		 var locationField=sublist.addField('kp_location', 'select', '移管倉庫');
		 var locationSearch = nlapiSearchRecord("location",null,
				 [
				    ["subsidiary","anyof",keepsubsidiary], 
				    "AND", 
				    ["isinactive","is","F"], 
				    "AND", 
				    ["custrecord_djkk_stop_load","is","F"]
				 ], 
				 [
				    new nlobjSearchColumn("internalid",null,"GROUP"), 
				    new nlobjSearchColumn("name",null,"GROUP").setSort(false)
				 ]
				 );
		 locationField.addSelectOption('', '');
		 if(!isEmpty(locationSearch)){			 
				for(var i = 0; i<locationSearch.length;i++){
					locationField.addSelectOption(locationSearch[i].getValue("internalid",null,"GROUP"),locationSearch[i].getValue("name",null,"GROUP"));
				}
			}		 
		 locationField.setMandatory(true);
//		 var binField=sublist.addField('kp_bin', 'select', '保管棚');
//		 binField.setDisplayType('hidden');
//		 var binSearch = nlapiSearchRecord("bin",null,
//				 [
//				    ["custrecord_djkk_bin_subsidiary","anyof",keepsubsidiary]
//				 ], 
//				 [
//				    new nlobjSearchColumn("internalid",null,"GROUP"), 
//				    new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("{location}||':'||{binnumber}")
//				 ]
//				 );
//		 binField.addSelectOption('', '');
//		 if(!isEmpty(binSearch)){			 
//				for(var j = 0; j<binSearch.length;j++){
//					binField.addSelectOption(binSearch[j].getValue("internalid",null,"GROUP"),binSearch[j].getValue("formulatext",null,"GROUP"));
//				}
//			}
		 
		 var quantityField=sublist.addField('kp_quantity', 'text', '移管数量');
		 quantityField.setMandatory(true);
		 var remarkField=sublist.addField('kp_remark', 'select', 'ロットリマーク');
//		 remarkField.setMandatory(true);
		 var remarkSearch = nlapiSearchRecord("customrecord_djkk_lot_remark",null,
				 [
				  ["custrecord_djkk_lot_remark_subsidiary","anyof",keepsubsidiary]
				 ], 
				 [
				    new nlobjSearchColumn("internalid",null,"GROUP"), 
				    new nlobjSearchColumn("name",null,"GROUP").setSort(false)
				 ]
				 );
		 remarkField.addSelectOption('', '');
		 if(!isEmpty(remarkSearch)){				
				for(var s = 0; s<remarkSearch.length;s++){
					remarkField.addSelectOption(remarkSearch[s].getValue("internalid",null,"GROUP"),remarkSearch[s].getValue("name",null,"GROUP"));
				}
			}
		 form.addButton('subbutton', '送信', 'keepButton();');
	 // 営業マンキープ戻し
		}else if(keeptype=='keepback'){
			 var keepBacksubsidiary=nlapiLookupField('customrecord_djkk_ic_admit', keepid,'custrecord_djkk_admit_subsidiary');
			// var keepBackReason=nlapiLookupField('customrecord_djkk_ic_admit', keepid,'custrecord_djkk_admit_re',true);
			// typetxt=keepBackReason+'-'+typetxt;
			 var form = nlapiCreateForm(typetxt, true);
				var keepidField=form.addField('keepid', 'text', 'keepid');
				keepidField.setDisplayType('hidden');
				keepidField.setDefaultValue(keepid);
				form.setScript('customscript_djkk_cs_inv_keep');
				form.addSubTab('custpage_list', typetxt+'リスト');
			 
			var sublist=form.addSubList('keepbacklist', 'list', typetxt,'custpage_list');
			 sublist.addMarkAllButtons();
			 sublist.addField('kpb_ckb', 'checkbox', '選択');
			 var lineidField=sublist.addField('kpb_lineid', 'text', 'DJ_在庫調整明細Id');
			 lineidField.setDisplayType('hidden');
			 var itemField=sublist.addField('kpb_item', 'select', 'DJ_アイテム','item');
			 itemField.setDisplayType('inline');
			 var quantityField=sublist.addField('kpb_quantity', 'text', 'DJ_調整数量');
			 quantityField.setDisplayType('inline');
			 var indNumberInField=sublist.addField('kpb_ind_number_in', 'text', 'DJ_倉庫入庫番号');
			 indNumberInField.setDisplayType('inline');
			 var lotsirNumberInField=sublist.addField('kpb_lotsir_number', 'text', 'DJ_シリアル/ロット番号');
			 lotsirNumberInField.setDisplayType('inline');			 			 
			 var locationField=sublist.addField('kpb_location', 'select', 'DJ_場所','location');
			 locationField.setDisplayType('inline');
			 var backlocationField=sublist.addField('kpb_backlocation', 'select', '移管戻し倉庫');			 			 
			 backlocationField.setMandatory(true);
			 
			 var locationSearch2 = nlapiSearchRecord("location",null,
					 [
					    ["subsidiary","anyof",keepBacksubsidiary], 
					    "AND", 
					    ["isinactive","is","F"], 
					    "AND", 
					    ["custrecord_djkk_stop_load","is","F"]
					 ], 
					 [
					    new nlobjSearchColumn("internalid",null,"GROUP"), 
					    new nlobjSearchColumn("name",null,"GROUP").setSort(false)
					 ]
					 );
			 backlocationField.addSelectOption('', '');
			 if(!isEmpty(locationSearch2)){				
					for(var i = 0; i<locationSearch2.length;i++){
						backlocationField.addSelectOption(locationSearch2[i].getValue("internalid",null,"GROUP"),locationSearch2[i].getValue("name",null,"GROUP"));
					}
				}
//			 var binField=sublist.addField('kpb_recordbin', 'select', 'DJ_保管棚','bin');
//			 binField.setDisplayType('hidden');
//			 var backbinField=sublist.addField('kpb_bin', 'select', 'キープ戻し保管棚');
//			 var binSearch2 = nlapiSearchRecord("bin",null,
//					 [
//					    ["custrecord_djkk_bin_subsidiary","anyof",keepBacksubsidiary]
//					 ], 
//					 [
//					    new nlobjSearchColumn("internalid",null,"GROUP"), 
//					    new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("{location}||':'||{binnumber}")
//					 ]
//					 );
//			 backbinField.addSelectOption('', '');
//			 if(!isEmpty(binSearch2)){				 
//					for(var j = 0; j<binSearch2.length;j++){
//						backbinField.addSelectOption(binSearch2[j].getValue("internalid",null,"GROUP"),binSearch2[j].getValue("formulatext",null,"GROUP"));
//					}
//				}
//			 backbinField.setDisplayType('hidden');
			 var remarkField=sublist.addField('kpb_recordremark', 'select', 'ロットリマーク');
			 remarkField.setDisplayType('inline');
			 var bckremarkField=sublist.addField('kpb_remark', 'select', '移管戻しロットリマーク');
			 bckremarkField.setDisplayType('entry');
			 var remarkSearch = nlapiSearchRecord("customrecord_djkk_lot_remark",null,
					 [
                        ["custrecord_djkk_lot_remark_subsidiary","anyof",keepBacksubsidiary]
					 ], 
					 [
					    new nlobjSearchColumn("internalid",null,"GROUP"), 
					    new nlobjSearchColumn("name",null,"GROUP").setSort(false)
					 ]
					 );
			 remarkField.addSelectOption('', '');
			 bckremarkField.addSelectOption('', '');
			 if(!isEmpty(remarkSearch)){				
					for(var s = 0; s<remarkSearch.length;s++){
						remarkField.addSelectOption(remarkSearch[s].getValue("internalid",null,"GROUP"),remarkSearch[s].getValue("name",null,"GROUP"));
						bckremarkField.addSelectOption(remarkSearch[s].getValue("internalid",null,"GROUP"),remarkSearch[s].getValue("name",null,"GROUP"));
					}
				}
			 
			 var invQuantityField=sublist.addField('kpb_inv_quantity', 'text', 'DJ_在庫詳細明細行数量');
			 invQuantityField.setDisplayType('inline');
			 var bckquantityField=sublist.addField('kpb_bckquantity', 'text', '移管戻し数量');
			 bckquantityField.setDisplayType('entry');
			 bckquantityField.setMandatory(true);
			 var customrecordSearch = nlapiSearchRecord("customrecord_djkk_ic_admit_i",null,
						[
						   ["custrecord_djkk_ic_admit","anyof",keepid]
						], 
						[
                           new nlobjSearchColumn("internalid").setSort(false),
						   new nlobjSearchColumn("custrecord_djkk_admit_item").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_admit_warehouse").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_admit_adjqty"), 
						   new nlobjSearchColumn("custrecord_djkk_admit_warehouse_no"), 
						   new nlobjSearchColumn("custrecord_djkk_admit_detail"), 
						   new nlobjSearchColumn("custrecord_djkk_admit_detail_id"), 
						   new nlobjSearchColumn("custrecord_djkk_ic_admit_shednum").setSort(false), 
						   new nlobjSearchColumn("custrecord_djkk_admit_lot_remark"), 
						   new nlobjSearchColumn("custrecord_djkk_admit_inventory_quantity"),						   
						   new nlobjSearchColumn("custrecord_djkk_admit_detail_keeped")
						]
						);
			 var itemLine = 1;
			 if(!isEmpty(customrecordSearch)){
				 for(var i=0;i<customrecordSearch.length;i++){
					 if(customrecordSearch[i].getValue('custrecord_djkk_admit_detail_keeped')!='T'){
					 sublist.setLineItemValue('kpb_lineid', itemLine,customrecordSearch[i].getValue('internalid'));
					 sublist.setLineItemValue('kpb_item', itemLine,customrecordSearch[i].getValue('custrecord_djkk_admit_item'));
					 sublist.setLineItemValue('kpb_location', itemLine,customrecordSearch[i].getValue('custrecord_djkk_admit_warehouse'));
					 sublist.setLineItemValue('kpb_quantity', itemLine,(Math.abs(customrecordSearch[i].getValue('custrecord_djkk_admit_adjqty'))).toString());
					 sublist.setLineItemValue('kpb_ind_number_in', itemLine,customrecordSearch[i].getValue('custrecord_djkk_admit_warehouse_no'));
					 sublist.setLineItemValue('kpb_lotsir_number', itemLine,customrecordSearch[i].getValue('custrecord_djkk_admit_detail'));
					 sublist.setLineItemValue('kpb_recordbin', itemLine,customrecordSearch[i].getValue('custrecord_djkk_ic_admit_shednum'));
					 sublist.setLineItemValue('kpb_inv_quantity', itemLine,(Math.abs(customrecordSearch[i].getValue('custrecord_djkk_admit_inventory_quantity'))).toString());
					 sublist.setLineItemValue('kpb_bckquantity', itemLine,(Math.abs(customrecordSearch[i].getValue('custrecord_djkk_admit_inventory_quantity'))).toString());
					 sublist.setLineItemValue('kpb_recordremark', itemLine,customrecordSearch[i].getValue('custrecord_djkk_admit_lot_remark'));
					 itemLine++;
					 }
				 }
			 }
			 form.addButton('subbutton', '送信', 'keepBackButton();');
		}
	 
	 response.writePage(form);
}
