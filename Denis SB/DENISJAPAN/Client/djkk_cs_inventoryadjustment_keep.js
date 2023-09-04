/**
 * 営業マンキープ/営業マンキープ戻しcs
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/12/29     CPC_苑
 *
 */
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	if(window.name=='fldUrlWindow'){
		window.ischanged = false;
		window.close();
		window.opener.open(location,'_keep','top=200,left=500,width=1200,height=400,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no');
	}	
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
	if(name=='kpb_backlocation'||name=='kpb_remark'){//||name=='kpb_bin'
		var kpb_backlocation=nlapiGetCurrentLineItemValue('keepbacklist', 'kpb_backlocation');
		//var kpb_bin=nlapiGetCurrentLineItemValue('keepbacklist', 'kpb_bin');
		var kpb_remark=nlapiGetCurrentLineItemValue('keepbacklist', 'kpb_remark');
		var key=nlapiGetLineItemValue('keepbacklist', 'kpb_item', linenum)+nlapiGetLineItemValue('keepbacklist', 'kpb_ind_number_in', linenum);
		var count=nlapiGetLineItemCount('keepbacklist');
		for(var i=1;i<count+1;i++){
			nlapiSelectLineItem('keepbacklist', i);
			var tkey=nlapiGetLineItemValue('keepbacklist', 'kpb_item', i)+nlapiGetLineItemValue('keepbacklist', 'kpb_ind_number_in', i);
			if(tkey==key){
				nlapiSetCurrentLineItemValue('keepbacklist', 'kpb_backlocation',kpb_backlocation , false, true);
				//nlapiSetCurrentLineItemValue('keepbacklist', 'kpb_bin',kpb_bin, false, true);
				nlapiSetCurrentLineItemValue('keepbacklist', 'kpb_remark',kpb_remark, false, true);
				nlapiCommitLineItem('keepbacklist');
			}			
		}
	}
 
}

function keepButton(){
	try{
	var keepId=nlapiGetFieldValue('keepid');
	var itemId=nlapiGetFieldValue('keepitem');
	var isserialitem = nlapiLookupField('item', itemId,'isserialitem');
	var keepquantity=nlapiGetFieldValue('keepquantity');
	var count=nlapiGetLineItemCount('keeplist');
	var sumQuantity=0;
	for(var i=1;i<count+1;i++){
	var lc=nlapiGetLineItemValue('keeplist', 'kp_location', i);
	//var bin=nlapiGetLineItemValue('keeplist', 'kp_bin', i);
	var qu=nlapiGetLineItemValue('keeplist', 'kp_quantity', i);
	if(isserialitem=='T'&&Number(qu)>1){
		alert('シリアル番号アイテムのキープ数量は、1より大きくすることはできません');
		return '';
	}
	var re=nlapiGetLineItemValue('keeplist', 'kp_remark', i);
	if(isEmpty(lc)||isEmpty(qu)){
		alert('キープ倉庫、キープ数量必須入力');
		return '';
	}
//	if(!isEmpty(bin)){
//		var lcTxt=nlapiGetLineItemText('keeplist', 'kp_location', i);
//		var binTxt=nlapiGetLineItemText('keeplist', 'kp_bin', i);
//	    if(binTxt.indexOf(lcTxt)<0){
//		alert(i+'行保管棚の倉庫とキープ倉庫は一致しない');
//		return '';
//		}
//	}
	sumQuantity+=Number(qu);
	}
	if(sumQuantity!=keepquantity){
		alert('sumQuantity='+sumQuantity)
		alert('keepquantity='+keepquantity)
		alert('キープ数量の合計はDJ_調整数量と等しくない');
		return '';
	}

	var fRecordId=nlapiLookupField('customrecord_djkk_ic_admit_i', keepId,'custrecord_djkk_ic_admit');
	var faterRecord=nlapiLoadRecord('customrecord_djkk_ic_admit', fRecordId);
	var fcount=faterRecord.getLineItemCount('recmachcustrecord_djkk_ic_admit');
	fcount++;
	var numbering='';
	var submitId='1';
	var NumberTxt='L';
	var TheMinimumdigits = 11;
	var usersub=nlapiGetFieldValue('keepsubsidiary');
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
	}else{
		var numberingArray=nlapiLookupField('customrecord_djkk_inventorydetail_number', submitId, ['custrecord_djkk_invnum_bumber','custrecord_djkk_invnum_item_make']);
		numbering=numberingArray.custrecord_djkk_invnum_bumber;
		NumberTxt=numberingArray.custrecord_djkk_invnum_item_make;
	}
	
	for(var j=1;j<count+1;j++){
		var lc=nlapiGetLineItemValue('keeplist', 'kp_location', j);
		var qu=nlapiGetLineItemValue('keeplist', 'kp_quantity', j);
		var re=nlapiGetLineItemValue('keeplist', 'kp_remark', j);
		//var bin=nlapiGetLineItemValue('keeplist', 'kp_bin', j);
		var record=nlapiCopyRecord('customrecord_djkk_ic_admit_i', keepId);
		record.setFieldValue('custrecord_djkk_admit_line_id', (Math.abs(fcount)).toString());
		record.setFieldValue('custrecord_djkk_admit_adjqty', qu);		
		record.setFieldValue('custrecord_djkk_admit_warehouse',lc);
//		if(!isEmpty(bin)){
//		record.setFieldValue('custrecord_djkk_ic_admit_shednum',bin);
//		}
		record.setFieldValue('custrecord_djkk_admit_lot_remark',re);
		record.setFieldValue('custrecord_djkk_admit_detail_id', '');
		record.setFieldValue('custrecord_djkk_admit_detail_keeplink', '');
		record.setFieldValue('custrecord_djkk_admit_detail_keeped', 'T');
		record.setFieldValue('custrecord_djkk_admit_inventory_quantity', qu);
		numbering++;
		var newNumber =  NumberTxt+ prefixInteger(parseInt(numbering), parseInt(TheMinimumdigits));	
		record.setFieldValue('custrecord_djkk_admit_detail', newNumber);
		
		nlapiSubmitRecord(record, false, true);
		fcount++;
		}
	nlapiSubmitField('customrecord_djkk_inventorydetail_number',submitId, 'custrecord_djkk_invnum_bumber',numbering);
	nlapiSubmitField('customrecord_djkk_ic_admit_i',keepId, ['custrecord_djkk_admit_detail_keeped','custrecord_djkk_admit_detail_keeplink'],['T','']);
	window.opener.location.reload();
	window.ischanged = false;
	window.close();
	}catch(e){
		alert(e.message);
	}
}

function keepBackButton(){
	try{
	var keepId=nlapiGetFieldValue('keepid');
	var count=nlapiGetLineItemCount('keepbacklist');
	var itemKeyArray=new Array();
	for(var i=1;i<count+1;i++){
		var chkbox=nlapiGetLineItemValue('keepbacklist', 'kpb_ckb', i);
		if(chkbox=='T'){
			var invquantity=nlapiGetLineItemValue('keepbacklist', 'kpb_inv_quantity', i);
			var bckquantity=nlapiGetLineItemValue('keepbacklist', 'kpb_bckquantity', i);
			if(bckquantity>invquantity){
				alert('キープ戻し数量は在庫詳細明細行数量より大きくすることはできません');
				return '';
			}
			var lc=nlapiGetLineItemValue('keepbacklist', 'kpb_backlocation', i);
			var qu=nlapiGetLineItemValue('keepbacklist', 'kpb_bckquantity', i);
			if(isEmpty(lc)||isEmpty(qu)){
				alert('キープ戻し倉庫、キープ戻し数量必須入力');
				return '';
			}
//			var bin=nlapiGetLineItemValue('keepbacklist', 'kpb_bin', i);
//			if(!isEmpty(bin)){
//				var lcTxt=nlapiGetLineItemText('keepbacklist', 'kpb_backlocation', i);
//				var binTxt=nlapiGetLineItemText('keepbacklist', 'kpb_bin', i);
//			    if(binTxt.indexOf(lcTxt)<0){
//				alert(i+'行キープ戻し保管棚の倉庫とキープ戻し倉庫は一致しない');
//				return '';
//				}
//			}
			itemKeyArray.push(nlapiGetLineItemValue('keepbacklist', 'kpb_item', i)+nlapiGetLineItemValue('keepbacklist', 'kpb_ind_number_in', i));
		  }
		}
	itemKeyArray=unique(itemKeyArray);
	var faterRecord=nlapiLoadRecord('customrecord_djkk_ic_admit', keepId);
	var fcount=faterRecord.getLineItemCount('recmachcustrecord_djkk_ic_admit');
	fcount++;
	var updateLineIdArray=new Array();
	for(var j=0;j<itemKeyArray.length;j++){
		var fItemId='';
		var fInNumber='';
		var sumBckQuantity=0;
		var bckLocation='';
		//var bckBin='';
		var bckRemark='';
		var copyId='';
		for(var s=1;s<count+1;s++){
			var itemId=nlapiGetLineItemValue('keepbacklist', 'kpb_item', s);
			var inNumber=nlapiGetLineItemValue('keepbacklist', 'kpb_ind_number_in', s);
			var chkbox=nlapiGetLineItemValue('keepbacklist', 'kpb_ckb', s);			
			if(chkbox=='T'){
				if(itemId+inNumber==itemKeyArray[j]){
					fItemId=itemId;
					fInNumber=inNumber;
					copyId= nlapiGetLineItemValue('keepbacklist', 'kpb_lineid', s);
					updateLineIdArray.push(copyId);
					bckLocation= nlapiGetLineItemValue('keepbacklist', 'kpb_backlocation', s);
					//bckBin=	nlapiGetLineItemValue('keepbacklist', 'kpb_bin', s);
					bckRemark= nlapiGetLineItemValue('keepbacklist', 'kpb_remark', s);
					sumBckQuantity+=Number(nlapiGetLineItemValue('keepbacklist', 'kpb_bckquantity', s));					
				}
			}
		}
		var record=nlapiCopyRecord('customrecord_djkk_ic_admit_i', copyId);
		record.setFieldValue('custrecord_djkk_admit_line_id', (Math.abs(fcount)).toString());
		record.setFieldValue('custrecord_djkk_admit_adjqty', sumBckQuantity);		
		record.setFieldValue('custrecord_djkk_admit_warehouse',bckLocation);
//		if(!isEmpty(bckBin)){
//		record.setFieldValue('custrecord_djkk_ic_admit_shednum',bckBin);
//		}
		record.setFieldValue('custrecord_djkk_admit_lot_remark',bckRemark);
		record.setFieldValue('custrecord_djkk_admit_detail_id', '');
		record.setFieldValue('custrecord_djkk_admit_detail_keeplink', '');
		record.setFieldValue('custrecord_djkk_admit_detail_keeped', 'T');
		record.setFieldValue('custrecord_djkk_admit_inventory_quantity', sumBckQuantity);
		record.setFieldValue('custrecord_djkk_admit_detail', fInNumber);		
		nlapiSubmitRecord(record, false, true);
		fcount++;
	}
	for(var o=0;o<updateLineIdArray.length;o++){
		nlapiSubmitField('customrecord_djkk_ic_admit_i',updateLineIdArray[o], 'custrecord_djkk_admit_detail_keeped','T');
	}
	window.opener.location.reload();
	window.ischanged = false;
	window.close();
	}catch(e){
		alert(e.message);
	}
}
