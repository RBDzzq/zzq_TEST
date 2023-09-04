/**
 * itemmaster��client
 * 
 * Version     ���t            �S����       ���l
 * 1.00        2021/01/22     YUAN      �V�K�쐬
 *
 */

/**
 * �ŏ�����
 */
var TheMinimumdigits = 5;
var ItemidNumber = '';
var NumberingID = '';
var formType='';
var NotAutomaticItemTypeName=['�̔��p���̑��̎萔��','�A�C�e���O���[�v','�L�b�g/�p�b�P�[�W','�̔��p�T�[�r�X','�f�B�X�J�E���g','�}�[�N�A�b�v','����','���v','����','�̔��p��݌ɃA�C�e��'];
var NotAutomaticItemType=['Group','Kit','Discount','Markup','Payment','Subtotal','Description','NonInvtPart','OthCharge','Service'];
/**
 * ��ʂ̏�����
 */
function clientPageInit(type) {
	
	// change by song add 20230403 item�����̔ԏC��  start
//		if(type == 'creat' || type == 'copy'){
			nlapiSetFieldValue('custitem_djkk_automatic',"T", false, true);
//		}
	// change by song add 20230403 item�����̔ԏC��  end
	
	var itemType=nlapiGetFieldValue('baserecordtype');
	if(itemType=='noninventoryitem'|| itemType=='otherchargeitem' ||itemType== 'itemgroup'){
	setTableHidden('vendorstabtxt')
	}
	nlapiLogExecution('debug', '1')
	//changed by geng add start U548
	if(type == 'create'||type == 'edit'){
		var sub = nlapiGetFieldValue('subsidiary')
		if(sub==SUB_SCETI||sub==SUB_DPKK){
			var Role=nlapiGetRole();
			if(Role!='1022'){
				nlapiDisableField('costcategory', true);
			}		
		}		
	}
	//changed by geng add end U548
	//add by zhou 20230227 start CH344
	if(itemType=='otherchargeitem' && type == 'create'){
		nlapiSetFieldValue('custitem_djkk_automatic','F')
		nlapiSetFieldValue('custitem_djkk_forecast','F')
    }
	//end
	//changed by geng add 
		if(type == 'create'||type == 'edit'){
			var Role=nlapiGetRole();
//		if(Role!='1022'){
//				setFieldDisableType('custitem_djkk_fa_memo', 'hidden');
//			}
		var sub = nlapiGetFieldValue('subsidiary')
		if(sub==SUB_SCETI||sub==SUB_DPKK){
			
			if(Role!='1022'){
				nlapiDisableField('cogsaccount', true);
				nlapiDisableField('assetaccount', true);
				nlapiDisableField('incomeaccount', true);
				nlapiDisableField('gainlossaccount', true);
				nlapiDisableField('intercocogsaccount', true);
				nlapiDisableField('billpricevarianceacct', true);
				nlapiDisableField('billqtyvarianceacct', true);
				nlapiDisableField('billexchratevarianceacct', true);
				nlapiDisableField('custreturnvarianceaccount', true);
				nlapiDisableField('intercoincomeaccount', true);
				nlapiDisableField('vendreturnvarianceaccount', true);
				nlapiDisableField('purchasepricevarianceacct', true);
				nlapiDisableField('dropshipexpenseaccount', true);
			}		
		}		
	}
	//changed by geng end
	
	//�H�i�t�H�[���A�V�K�ꍇ
	//DJ_�o�׉\���ԁiMONTHS�j ��0�@DJ_�o�׉\���ԁiDAYS�j��0

	if(type == 'create'){
		var customform = nlapiGetFieldValue('customform');
		
		if(customform == '98'){
			nlapiSetFieldValue('custitem_djkk_warranty', '0');
			nlapiSetFieldValue('custitem_djkk_warranty_month', '0');
		}
	}
	nlapiLogExecution('debug', '2')
	nlapiDisableField('costingmethod', true);
	var itemType = nlapiGetFieldValue('itemtype');
	var subtype=nlapiGetFieldValue('subtype');
    formType=type;
    if (type == 'edit') {
    	
    	if(subtype!='Sale'&&NotAutomaticItemType.indexOf(itemType)<0){
        nlapiDisableField('custitem_djkk_automatic', true);
        if(nlapiGetFieldValue('custitem_djkk_automatic')== 'T'){
        	
        	//if(itemType != 'Assembly'){
        		nlapiDisableField('itemid', true);
        	//}       
           }
    	}
    }
    nlapiLogExecution('debug', '3')
    if(type=='create'||type=='copy'){
    	
    	   try{
    	   nlapiSetFieldValue('taxschedule', '7');
    	   }catch(ee){}
    	   if(subtype!='Sale'&&NotAutomaticItemType.indexOf(itemType)<0){
    	   nlapiDisableField('custitem_djkk_automatic', true);
    	   if(nlapiGetFieldValue('custitem_djkk_automatic')== 'T'){
   	    	       nlapiSetFieldValue('itemid', '�����̔�');
   	    	       nlapiDisableField('itemid', true);

   	       }  
    	   }else{
    		   nlapiDisableField('custitem_djkk_automatic', true);
    		   nlapiSetFieldValue('custitem_djkk_automatic', 'F');
    	   }
    	        	    
    	var type=nlapiGetRecordType();
    	
    	// ���b�g�ԍ��݌ɃA�C�e�� 
    	if(type=='lotnumberedinventoryitem'){
    		
    		// ���b�g�ԍ�
    		nlapiSetFieldValue('costingmethod', 'FIFO');
    	}
    	
    	// �V���A���ԍ��t���݌ɃA�C�e��
    	else if(type=='serializedinventoryitem'){
    		
    		// ����
    		nlapiSetFieldValue('costingmethod', 'LIFO');
    	}
    	else{
    		// ����
    		nlapiSetFieldValue('costingmethod', 'AVG');
    	}
    }
    nlapiLogExecution('debug', '4')
    // add by ycx DENISJAPAN-134
    // �ŕ�   add by song DENISJAPAN-635 start
//    var poison=nlapiGetFieldValue('custitem_djkk_poison');
    
    // 	����
//    var deleterious=nlapiGetFieldValue('custitem_djkk_deleterious_substance');
//    if(poison=='F'&&deleterious=='F'){
    	
    	// �Ō���������&�Ō����ܗL��
    	setFieldDisableType('custitem_djkk_poison_ingredient1', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_content1', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient_sn1', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient2', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_content2', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient_sn2', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient3', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_content3', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient_sn3', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient4', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_content4', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient_sn4', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient5', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_content5', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient_sn5', 'disabled');
//    }add by song DENISJAPAN-635 end
    
    // �J���@
    var isAct=nlapiGetFieldValue('custitem_djkk_industrial_safety_act');
    if(isAct=='F'){
    	
    	 // �J�����S�q���@������&�J�����S�q���@�ܗL��
    	setFieldDisableType('custitem_djkk_is_act_ingredient1', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_content1', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_ingredient2', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_content2', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_ingredient3', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_content3', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_ingredient4', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_content4', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_ingredient5', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_content5', 'disabled');
    }
    nlapiLogExecution('debug', '5')
    // DJ_�ŕ�
//    setFieldDisableType('custitem_djkk_poison', 'disabled');
    
    // DJ_����
//	setFieldDisableType('custitem_djkk_deleterious_substance', 'disabled');
	
	// DJ_�J���@
	setFieldDisableType('custitem_djkk_industrial_safety_act', 'disabled');

	// �L�Q��/�댯��
	setFieldDisableType('ishazmatitem', 'hidden');

	// ID
	setFieldDisableType('hazmatid', 'hidden');

	// �L�Q���o�ז�
	setFieldDisableType('hazmatshippingname', 'hidden');

	// �L�Q���̊댯�x
	setFieldDisableType('hazmathazardclass', 'hidden');

	// �L�Q������O���[�v
	setFieldDisableType('hazmatpackinggroup', 'hidden');

	// �L�Q���A�C�e���P��
	setFieldDisableType('hazmatitemunits', 'hidden');

	// �L�Q���A�C�e���P�ʐ���
	setFieldDisableType('hazmatitemunitsqty', 'hidden');
    // add end
	
    // DJ_���i�K�v
	if(nlapiGetFieldValue('custitem_djkk_inspection_required')=='F'){
		
		// DJ_���i���x��
		setFieldDisableType('custitem_djkk_inspection_level', 'disabled');
	}else{
		
		// DJ_���i���x��
		setFieldDisableType('custitem_djkk_inspection_level', 'normal');
	}
	 nlapiLogExecution('debug', '6')

	// DENISJAPAN-255 add by ycx 2021/06/02 
	var userRole=nlapiGetRole();
	 nlapiLogExecution('debug', '7')
	// �Ǘ���
	if(userRole!='3'){
	// ���[���E�Ӊ�Ђ̎擾
	var roleSubsidiary = nlapiGetFieldValue('custitem_syokuseki');
	// DJ_��ЊԎ���p
	var intercompany = nlapiGetFieldValue('custitem_djkk_intercompany_transac');
	if (type == 'create') {
		if(!isEmpty(roleSubsidiary)){
			
		nlapiSetFieldValue('subsidiary', roleSubsidiary, false, true);
		}
		//if(userRole!='1025'||userRole!='1026'){
		setFieldDisableType('subsidiary', 'disabled');
		//}
	}
	
	if (type == 'copy') {		
		if (intercompany == 'T'&&!isEmpty(roleSubsidiary)) {
			setFieldDisableType('subsidiary', 'normal');

			var subsidiaryArray = nlapiGetFieldValues('subsidiary');
			if (subsidiaryArray.indexOf(roleSubsidiary) < 0) {
				var newSubsidiaryArray = new Array();
				for (var sl = 0; sl < subsidiaryArray.length; sl++) {
					newSubsidiaryArray.push(subsidiaryArray[sl]);
				}
				newSubsidiaryArray.push(roleSubsidiary);
				nlapiSetFieldValues('subsidiary', newSubsidiaryArray, false,
						true);				
			}
		}
	}
	if (type == 'edit') {
		if (intercompany == 'T') {
			setFieldDisableType('subsidiary', 'normal');
		} else {
			setFieldDisableType('subsidiary', 'disabled');
		}
	}
	}
	// add end
	 nlapiLogExecution('debug', '8')
	
	var no_bbd = nlapiGetFieldValue('custitem_djkk_no_bbd');
	if(DJ_NO_BBD_RECORDTYPE_ARY.indexOf(nlapiGetRecordType()) != -1){
		if(no_bbd == 'T'){
			setFieldDisableType('custitem_djkk_warranty_month', 'disabled');
			setFieldDisableType('custitem_djkk_shelf_life', 'disabled');
			
			setFieldDisableType('custitem_djkk_warranty', 'disabled');
			setFieldDisableType('custitem_djkk_shelf_life_months', 'disabled');
		}else{
			setFieldDisableType('custitem_djkk_warranty_month', 'normal');
			setFieldDisableType('custitem_djkk_shelf_life', 'normal');
			
			setFieldDisableType('custitem_djkk_warranty', 'normal');
			setFieldDisableType('custitem_djkk_shelf_life_months', 'normal');
		}
	}
	
	//20220816 add by zhou U779
	if(type == 'create' ||type == 'edit' || type == 'copy'){
		var subsidiary = getRoleSubsidiary();
		if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
			setFieldDisableType('custitem_djkk_receipt_printing','hidden');
		}
	}
	//end
	 nlapiLogExecution('debug', '9')
	 //20221020 add by zhou ��v�T�u�^�u�͌o���̂ݎQ�Ɖ\�Ƃ���   CH058 U135
     var role=nlapiGetRole();
	 var roleSubsidiary = getRoleSubsidiary();
	 var recordType = nlapiGetRecordType();
	 var getSaleType = getQueryVariable('subtype')
     // TODO DJ_�o���S��_test|�Ǘ���
     if((roleSubsidiary != SUB_SCETI && roleSubsidiary != SUB_DPKK) &&(role!='1022'&&role!='3')){
    	 if((recordType == 'noninventoryitem' ||recordType == 'otherchargeitem')&&(getSaleType =='Sale'||getSaleType =='Purchase')){
    		 setTableHidden('accountingtxt');
    	 }else if(recordType == 'discountitem'){
    		 setTableHidden('accountingtxt');
    	 }
     }
	 //end
	 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
function clientFieldChanged(type, name, linenum) {
	if(name=='custitem_djkk_intercompany_transac'){
		 var sub = nlapiGetFieldValue('subsidiary');
		    //changed by geng add start U796
		    if(sub==SUB_DPKK || sub==SUB_SCETI){
		    	var flag = nlapiGetFieldValue('custitem_djkk_intercompany_transac');
		    	if(flag=='T'){
		    		alert('�u��ЊԎ���p�v�̃t���O���L���A�uDJ_�Z�N�V�����v�o�^�ł��܂���B');
		    		nlapiDisableField('custitem_djkk_department', true);
		    		}else{
		    			nlapiDisableField('custitem_djkk_department', false);
		    		}
		    	}
		    }
	
   
    //changed end
	nlapiLogExecution('debug', 'clientFieldChanged')
	//changed by geng add start CH084
	
	if(name=='purchasedescription'){
		var sub = nlapiGetFieldValue('subsidiary');
		if(sub==SUB_DPKK||sub==SUB_SCETI){
			var memoVal=nlapiGetFieldValue('purchasedescription');
			var StringVal = String(memoVal);
			var encoder = new TextEncoder();
			var bytes = encoder.encode(StringVal);
			var byteCount = bytes.length;
			if(byteCount>100){
				alert('[PO�s�R�����g]�t�B�[���h�̓��e���������܂��B�ē��͂��Ă�������');
				nlapiSetFieldValue('purchasedescription','');
			}
		}
	}
	//changed by geng add start CH084
//20220510 add by zhou start
//DJ_���i���
if(name =='custitem_djkk_quantity_type'){
	var typeValue = nlapiGetFieldText('custitem_djkk_quantity_type');
	if(!isEmpty(typeValue)){
		var contentSearch = nlapiSearchRecord("customrecord_djkk_quantity_type",null,
				[
				 	["custrecord_djkk_type","is",typeValue]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_type"), 
				   new nlobjSearchColumn("custrecord_djkk_content")
				]
				);
		if(contentSearch != null){
			var contentSearchLength = contentSearch.length;
			var contentCounts = nlapiGetLineItemCount('recmachcustrecord_djkk_ip_item');
			if(contentCounts != 0 ){
				if(contentSearchLength > contentCounts){
					for(var n = contentCounts; n < contentSearchLength; n++){
						nlapiInsertLineItem('recmachcustrecord_djkk_ip_item',n);
						nlapiCommitLineItem('recmachcustrecord_djkk_ip_item');
					}
				}else if(contentSearchLength < contentCounts){
					for(var n = contentSearchLength; n < contentCounts; n++){
						nlapiRemoveLineItem('recmachcustrecord_djkk_ip_item',contentSearchLength);
						nlapiCommitLineItem('recmachcustrecord_djkk_ip_item');
					} 
				}
			}else if(contentCounts == 0){
				for(var n = 0; n < contentSearch.length; n++){
					nlapiInsertLineItem('recmachcustrecord_djkk_ip_item',n+1);
					nlapiCommitLineItem('recmachcustrecord_djkk_ip_item');
				}
				var contentCounts2 = nlapiGetLineItemCount('recmachcustrecord_djkk_ip_item');
			}
			for(var i = 0; i < contentSearch.length; i++){
				var getType = contentSearch[i].getValue("custrecord_djkk_type");
				var getContent = contentSearch[i].getValue("custrecord_djkk_content");
				nlapiSetLineItemValue('recmachcustrecord_djkk_ip_item','custrecord_djkk_ip_procedure_contents',i+1,getContent);
				nlapiSetLineItemValue('recmachcustrecord_djkk_ip_item','custrecord_djkk_ip_procedure_number',i+1 ,getType);
			}
		}else{
			alert('�V�X�e�����ɓ��Y���i��މ��̎菇���e�f�[�^�����݂��Ȃ�!');
			var contentCounts = nlapiGetLineItemCount('recmachcustrecord_djkk_ip_item');
			if(contentCounts != 0 ){
				for(var n = 0; n < contentCounts; n++){
					nlapiRemoveLineItem('recmachcustrecord_djkk_ip_item',1);
					nlapiCommitLineItem('recmachcustrecord_djkk_ip_item');
				} 	
			}
			contentCounts = nlapiGetLineItemCount('recmachcustrecord_djkk_ip_item');
			if(contentCounts == 1 ){
					nlapiRemoveLineItem('recmachcustrecord_djkk_ip_item',contentCounts);
					nlapiCommitLineItem('recmachcustrecord_djkk_ip_item');
			}
			contentCounts = nlapiGetLineItemCount('recmachcustrecord_djkk_ip_item');
			nlapiLogExecution('debug', 'contentCounts', contentCounts);
		}	
	}
}
//20220510 add by zhou end

if(name=='custitem_djkk_item_kana'){

	var kana=nlapiGetFieldValue('custitem_djkk_item_kana');
	if(!inputCheckKana(kana)){
		alert('���p�J�i�̂ݓ��͉A���͂͂Ђ����ł͂���܂���B');
		nlapiSetFieldValue('custitem_djkk_item_kana', '', false, true);
	}
	
}

// DJ_�L�b�g�i
if(name=='custitem_djkk_kitflag'){
	var kitflg=nlapiGetFieldValue('custitem_djkk_kitflag');
	var type=nlapiGetRecordType();
	if(type=='assemblyitem'||type=='lotnumberedassemblyitem'||type=='serializedassemblyitem'){
		
		// ������
	if(kitflg=='3'){
		// ����
		nlapiSetFieldValue('costingmethod', 'AVG');
		// ���b�g�ԍ�
		// nlapiSetFieldValue('costingmethod', 'FIFO');
		
		// ���Y�i
	}else if(kitflg=='4'){
		// �W��
		nlapiSetFieldValue('costingmethod', 'STANDARD');				
	}else{
		// ����
		nlapiSetFieldValue('costingmethod', 'AVG');
	 }
	}
}
	
    if(type=='itemvendor'&&name=='vendor'){
    	var vid=nlapiGetCurrentLineItemValue('itemvendor', 'vendor');
    	if(!isEmpty(vid)){
    		
    		var vode=nlapiLookupField('vendor', vid, 'entityid');
    		nlapiSetCurrentLineItemValue('itemvendor', 'vendorcode', vode, false, true)
    	}
    }
    if (name == 'custitem_djkk_automatic'&&(formType == 'create'||formType == 'copy')) {
        var automatic = nlapiGetFieldValue('custitem_djkk_automatic');
        var itemType = nlapiGetFieldValue('itemtype');
        if (automatic == 'T' && itemType != 'Assembly') {
            nlapiSetFieldValue('itemid', '�����̔�');
            nlapiDisableField('itemid', true);
        }
        if (itemType == 'Service') {
            nlapiSetFieldValue('itemid', '�����̔�');
            nlapiDisableField('itemid', true);
        }
        //20230424 changed by zhou start
        //CH451  20230424 zhou memo :��݌ɃA�C�e��/ ���̑��̎萔��(OthCharge)�͎����I�ɍ̔Ԃ��Ȃ���΂Ȃ�Ȃ�
//      else if (automatic == 'F' && itemType != 'Assembly') {
//          nlapiSetFieldValue('itemid', ''); 
//            nlapiDisableField('itemid', false);
//      }
      //20230424 changed by zhou end
    }
    // add by ycx DENISJAPAN-134
    
    // DJ_9_�J�敪
	    if (name == 'custitem_djkk_labor_division') {
		if (nlapiGetFieldValue('custitem_djkk_labor_division') == '1') {
			nlapiSetFieldValue('custitem_djkk_industrial_safety_act', 'T');
		}else{
			nlapiSetFieldValue('custitem_djkk_industrial_safety_act', 'F');
		}
	}

	// DJ_10_�Ō����敪
	if (name == 'custitem_djkk_pad_classification' || name == 'custitem_djkk_pad_classification2' || name == 'custitem_djkk_pad_classification3' || name == 'custitem_djkk_pad_classification4' || name == 'custitem_djkk_pad_classification5') {
		// add by song DENISJAPAN-635 start
		var classification1 = nlapiGetFieldValue('custitem_djkk_pad_classification'); //DJ_10_�Ō����敪1
		var classification2 = nlapiGetFieldValue('custitem_djkk_pad_classification2'); //DJ_10_�Ō����敪2
		var classification3 = nlapiGetFieldValue('custitem_djkk_pad_classification3'); //DJ_10_�Ō����敪3
		var classification4 = nlapiGetFieldValue('custitem_djkk_pad_classification4'); //DJ_10_�Ō����敪4
		var classification5 = nlapiGetFieldValue('custitem_djkk_pad_classification5'); //DJ_10_�Ō����敪5
		
		if(classification1 == '1' || classification1 == '2' || classification1 == '4'){
			setFieldDisableType('custitem_djkk_poison_ingredient1', 'normal');
			setFieldDisableType('custitem_djkk_poison_content1', 'normal');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn1', 'normal');
		}else{
			nlapiSetFieldValue('custitem_djkk_poison_ingredient1', '');
			nlapiSetFieldValue('custitem_djkk_poison_content1', '');
			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn1', '');
			
			setFieldDisableType('custitem_djkk_poison_ingredient1', 'disabled');
			setFieldDisableType('custitem_djkk_poison_content1', 'disabled');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn1', 'disabled');
		}
		
		if(classification2 == '1' || classification2 == '2' || classification2 == '4'){
			setFieldDisableType('custitem_djkk_poison_ingredient2', 'normal');
			setFieldDisableType('custitem_djkk_poison_content2', 'normal');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn2', 'normal');
		}else{
			nlapiSetFieldValue('custitem_djkk_poison_ingredient2', '');
			nlapiSetFieldValue('custitem_djkk_poison_content2', '');
			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn2', '');
			
			setFieldDisableType('custitem_djkk_poison_ingredient2', 'disabled');
			setFieldDisableType('custitem_djkk_poison_content2', 'disabled');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn2', 'disabled');
		}
		
		if(classification3 == '1' || classification3 == '2' || classification3 == '4'){
			setFieldDisableType('custitem_djkk_poison_ingredient3', 'normal');
			setFieldDisableType('custitem_djkk_poison_content3', 'normal');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn3', 'normal');
		}else{
			nlapiSetFieldValue('custitem_djkk_poison_ingredient3', '');
			nlapiSetFieldValue('custitem_djkk_poison_content3', '');
			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn3', '');
			
			setFieldDisableType('custitem_djkk_poison_ingredient3', 'disabled');
			setFieldDisableType('custitem_djkk_poison_content3', 'disabled');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn3', 'disabled');
		}
		
		if(classification4 == '1' || classification4 == '2' || classification4 == '4'){
			setFieldDisableType('custitem_djkk_poison_ingredient4', 'normal');
			setFieldDisableType('custitem_djkk_poison_content4', 'normal');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn4', 'normal');
		}else{
			nlapiSetFieldValue('custitem_djkk_poison_ingredient4', '');
			nlapiSetFieldValue('custitem_djkk_poison_content4', '');
			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn4', '');
			
			setFieldDisableType('custitem_djkk_poison_ingredient4', 'disabled');
			setFieldDisableType('custitem_djkk_poison_content4', 'disabled');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn4', 'disabled');
		}
		
		if(classification5 == '1' || classification5 == '2' || classification5 == '4'){
			setFieldDisableType('custitem_djkk_poison_ingredient5', 'normal');
			setFieldDisableType('custitem_djkk_poison_content5', 'normal');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn5', 'normal');
		}else{
			nlapiSetFieldValue('custitem_djkk_poison_ingredient5', '');
			nlapiSetFieldValue('custitem_djkk_poison_content5', '');
			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn5', '');
			
			setFieldDisableType('custitem_djkk_poison_ingredient5', 'disabled');
			setFieldDisableType('custitem_djkk_poison_content5', 'disabled');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn5', 'disabled');
		}
		
		// add by song DENISJAPAN-635 end
	}
        // �ŕ�|����
//	    if (name == 'custitem_djkk_poison' || name == 'custitem_djkk_deleterious_substance') {
//
//		// �ŕ�
//		var poison = nlapiGetFieldValue('custitem_djkk_poison');
//
//		// ����
//		var deleterious = nlapiGetFieldValue('custitem_djkk_deleterious_substance');
//		if (poison == 'T' || deleterious == 'T') {
//
//			// �Ō���������&�Ō����ܗL��
//			setFieldDisableType('custitem_djkk_poison_ingredient1', 'normal');
//			setFieldDisableType('custitem_djkk_poison_content1', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient_sn1', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient2', 'normal');
//			setFieldDisableType('custitem_djkk_poison_content2', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient_sn2', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient3', 'normal');
//			setFieldDisableType('custitem_djkk_poison_content3', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient_sn3', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient4', 'normal');
//			setFieldDisableType('custitem_djkk_poison_content4', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient_sn4', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient5', 'normal');
//			setFieldDisableType('custitem_djkk_poison_content5', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient_sn5', 'normal');
//		}else{
//			
//			// �Ō���������&�Ō����ܗL��
//	    	setFieldDisableType('custitem_djkk_poison_ingredient1', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_content1', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient_sn1', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient2', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_content2', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient_sn2', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient3', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_content3', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient_sn3', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient4', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_content4', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient_sn4', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient5', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_content5', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient_sn5', 'disabled');
//		}
//		if(poison == 'F' && deleterious == 'F'){
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient1', '');
//			nlapiSetFieldValue('custitem_djkk_poison_content1', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn1', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient2', '');
//			nlapiSetFieldValue('custitem_djkk_poison_content2', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn2', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient3', '');
//			nlapiSetFieldValue('custitem_djkk_poison_content3', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn3', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient4', '');
//			nlapiSetFieldValue('custitem_djkk_poison_content4', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn4', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient5', '');
//			nlapiSetFieldValue('custitem_djkk_poison_content5', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn5', '');
//		}
//	}
	    
	    // �J���@
	    if (name == 'custitem_djkk_industrial_safety_act') {
	    	
		// �J���@
		var isAct = nlapiGetFieldValue('custitem_djkk_industrial_safety_act');
		if (isAct == 'T') {
			
			// �J�����S�q���@������&�J�����S�q���@�ܗL��
			setFieldDisableType('custitem_djkk_is_act_ingredient1', 'normal');
			setFieldDisableType('custitem_djkk_is_act_content1', 'normal');
			setFieldDisableType('custitem_djkk_is_act_ingredient2', 'normal');
			setFieldDisableType('custitem_djkk_is_act_content2', 'normal');
			setFieldDisableType('custitem_djkk_is_act_ingredient3', 'normal');
			setFieldDisableType('custitem_djkk_is_act_content3', 'normal');
			setFieldDisableType('custitem_djkk_is_act_ingredient4', 'normal');
			setFieldDisableType('custitem_djkk_is_act_content4', 'normal');
			setFieldDisableType('custitem_djkk_is_act_ingredient5', 'normal');
			setFieldDisableType('custitem_djkk_is_act_content5', 'normal');
		}else{
			
			// �J�����S�q���@������&�J�����S�q���@�ܗL��
			setFieldDisableType('custitem_djkk_is_act_ingredient1', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_content1', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_ingredient2', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_content2', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_ingredient3', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_content3', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_ingredient4', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_content4', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_ingredient5', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_content5', 'disabled');
	    	nlapiSetFieldValue('custitem_djkk_is_act_ingredient1', '');
			nlapiSetFieldValue('custitem_djkk_is_act_content1', '');
			nlapiSetFieldValue('custitem_djkk_is_act_ingredient2', '');
			nlapiSetFieldValue('custitem_djkk_is_act_content2', '');
			nlapiSetFieldValue('custitem_djkk_is_act_ingredient3', '');
			nlapiSetFieldValue('custitem_djkk_is_act_content3', '');
			nlapiSetFieldValue('custitem_djkk_is_act_ingredient4', '');
			nlapiSetFieldValue('custitem_djkk_is_act_content4', '');
			nlapiSetFieldValue('custitem_djkk_is_act_ingredient5', '');
			nlapiSetFieldValue('custitem_djkk_is_act_content5', '');
		}
	}
    // add end
	    
	    if(name=='custitem_djkk_inspection_required'){
	    	// DJ_���i�K�v
	    	if(nlapiGetFieldValue('custitem_djkk_inspection_required')=='F'){
	    		
	    		// DJ_���i���x��
	    		setFieldDisableType('custitem_djkk_inspection_level', 'disabled');
	    		nlapiSetFieldValue('custitem_djkk_inspection_level', '');
	    	}else{
	    		
	    		// DJ_���i���x��
	    		setFieldDisableType('custitem_djkk_inspection_level', 'normal');
	    	}
	    }
	  
	 // DENISJAPAN-255 add by ycx 2021/06/02 
	    if (name == 'custitem_djkk_intercompany_transac'||name == 'subsidiary') {
	    var userRole=nlapiGetRole();
		
		// �Ǘ���
		if(userRole!='3'){
	// DJ_��ЊԎ���p
	if (name == 'custitem_djkk_intercompany_transac') {
		var intercompany = nlapiGetFieldValue('custitem_djkk_intercompany_transac');
		if (intercompany == 'T') {
			setFieldDisableType('subsidiary', 'normal');
		} else {
			setFieldDisableType('subsidiary', 'disabled');
			var roleSubsidiary = nlapiGetFieldValue('custitem_syokuseki');
			nlapiSetFieldValue('subsidiary', roleSubsidiary, false, true);		
		}
	}
	if (name == 'subsidiary') {

		// ���[���E�Ӊ�Ђ̎擾
		var roleSubsidiary = nlapiGetFieldValue('custitem_syokuseki');
		var subsidiaryArray = nlapiGetFieldValues('subsidiary');
		if (!isEmpty(roleSubsidiary)) {
			if (subsidiaryArray.indexOf(roleSubsidiary) < 0) {
				alert('���Ȃ��Ƃ��A'+nlapiGetFieldText('custitem_syokuseki')+'�̉�Ђ�ݒ肷��K�v������܂��B');
				var newSubsidiaryArray = new Array();
				for (var sl = 0; sl < subsidiaryArray.length; sl++) {
					newSubsidiaryArray.push(subsidiaryArray[sl]);
				}
				newSubsidiaryArray.push(roleSubsidiary);
				nlapiSetFieldValues('subsidiary', newSubsidiaryArray, false,true);
			}
		}
	}
		}
}
	// add end
	
	// By LIU 2022/01/17
	// DJ_�o�׉\���ԁiMONTHS�j�@to DJ_�o�׉\���ԁiDAYS�j 
	if(name == 'custitem_djkk_warranty'){
		var date = nlapiGetFieldValue('custitem_djkk_warranty');
		if(!isEmpty(date)){
			nlapiSetFieldValue('custitem_djkk_warranty_month', date * DAYS_FROM_MONTH_TO_DAY, false);
		}
	}
	
	// DJ_SHELF LIFE�iMONTHS�j�@to DJ_SHELF LIFE�iDAYS�j
	if(name == 'custitem_djkk_shelf_life_months'){
		var date = nlapiGetFieldValue('custitem_djkk_shelf_life_months');
		if(!isEmpty(date)){
			nlapiSetFieldValue('custitem_djkk_shelf_life', date * DAYS_FROM_MONTH_TO_DAY, false);
		}
	}
	
	// DJ_�ܖ��������@to DJ_�ܖ���������
	if(name == 'custitem_djkk_expdate_month'){
		var date = nlapiGetFieldValue('custitem_djkk_expdate_month');
		if(!isEmpty(date)){
			nlapiSetFieldValue('custitem_djkk_expdatedays', date * DAYS_FROM_MONTH_TO_DAY, false);
		}
	}
	

	
	if(name == 'custitem_djkk_no_bbd'){
		
		if(DJ_NO_BBD_RECORDTYPE_ARY.indexOf(nlapiGetRecordType()) != -1){
			var no_bbd = nlapiGetFieldValue('custitem_djkk_no_bbd');
			if(no_bbd == 'T'){
				setFieldDisableType('custitem_djkk_warranty_month', 'disabled');
				setFieldDisableType('custitem_djkk_shelf_life', 'disabled');
				
				setFieldDisableType('custitem_djkk_warranty', 'disabled');
				setFieldDisableType('custitem_djkk_shelf_life_months', 'disabled');
			}else{
				setFieldDisableType('custitem_djkk_warranty_month', 'normal');
				setFieldDisableType('custitem_djkk_shelf_life', 'normal');
				
				setFieldDisableType('custitem_djkk_warranty', 'normal');
				setFieldDisableType('custitem_djkk_shelf_life_months', 'normal');
			}
		}
	}
	//DENISJAPAN-567
	if(name == 'unitstype'){
	    debugger;
		var unitstype = nlapiGetFieldValue('unitstype');
		var unitstypeRecord = nlapiLoadRecord('unitstype', unitstype);
		var unValue = unitstypeRecord.getLineItemValue('uom','internalid', 1);
		nlapiSetFieldValue('custitem_djkk_min_inv_unit',unValue,false)
	}
	
	
	if(name == 'purchaseunit'){
		var purchaseunitValue = nlapiGetFieldValue('purchaseunit');
		nlapiSetFieldValue('custitem_djkk_min_inv_unit',purchaseunitValue,false)
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
    var returnType = true;
    var alertMsg = ''; 
    var sub = nlapiGetFieldValue('subsidiary');
    if(nlapiGetFieldValue('custitem_djkk_drug_medicine')=='T'&&isEmpty(nlapiGetFieldValue('custitem_djkk_qc_category'))){
//    	alert('�uDJ_�򕨈�w�v�`�F�b�N�I���̏ꍇ�A�uDJ_QC�J�e�S���[�v����͂��Ă��������B');
    	alertMsg += '�uDJ_�򕨈�w�v�`�F�b�N�I���̏ꍇ�A�uDJ_QC�J�e�S���[�v����͂��Ă��������B \n';
		returnType = false;
    }
	// DJ_�ŕ�||DJ_����
	if (nlapiGetFieldValue('custitem_djkk_poison')=='T'||nlapiGetFieldValue('custitem_djkk_deleterious_substance')=='T') {
		if (isEmpty(nlapiGetFieldValue('custitem_djkk_poison_ingredient1'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_poison_ingredient2'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_poison_ingredient3'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_poison_ingredient4'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_poison_ingredient5'))) {
//			alert('�u�Ō���������1-5�v�͏��Ȃ��Ƃ������͂���K�v������܂��B');
			alertMsg += '�u�Ō���������1-5�v�͏��Ȃ��Ƃ������͂���K�v������܂��B\n';
			returnType = false;
		}
	}

	// DJ_�J���@
	if (nlapiGetFieldValue('custitem_djkk_industrial_safety_act')=='T') {
		if (isEmpty(nlapiGetFieldValue('custitem_djkk_is_act_ingredient1'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_is_act_ingredient2'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_is_act_ingredient3'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_is_act_ingredient4'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_is_act_ingredient5'))) {
//			alert('�u�J�����S�q���@������1-5�v�͏��Ȃ��Ƃ������͂���K�v������܂��B');
			alertMsg += '�u�J�����S�q���@������1-5�v�͏��Ȃ��Ƃ������͂���K�v������܂��B\n';
			returnType = false;
		}
	}
	
	var baserecordtype = nlapiGetFieldValue("baserecordtype");
	if((baserecordtype == "lotnumberedinventoryitem" || type == "serializedinventoryitem" || type=="lotnumberedassemblyitem" || type=="serializedassemblyitem"||type=="serviceitem"||type=="noninventoryitem"||type=="InvtPart"||type=="Assembly")&&(sub == SUB_SCETI || sub == SUB_DPKK)){
		var price1 = nlapiGetLineItemValue("price1","price_1_",1);
		var price2 = nlapiGetLineItemValue("price2","price_1_",1);
		var price3 = nlapiGetLineItemValue("price3","price_1_",1);
		var price4 = nlapiGetLineItemValue("price4","price_1_",1);
		var price5 = nlapiGetLineItemValue("price5","price_1_",1);
		var price6 = nlapiGetLineItemValue("price6","price_1_",1);
		var price7 = nlapiGetLineItemValue("price7","price_1_",1);
		var price8 = nlapiGetLineItemValue("price8","price_1_",1);
		var price9 = nlapiGetLineItemValue("price9","price_1_",1);
		var price10 = nlapiGetLineItemValue("price10","price_1_",1);
		var price11 = nlapiGetLineItemValue("price11","price_1_",1);
		var price12 = nlapiGetLineItemValue("price12","price_1_",1);
		if((!isEmpty(price1))||(!isEmpty(price2))||(!isEmpty(price3))||(!isEmpty(price4))||(!isEmpty(price5))||(!isEmpty(price6))||(!isEmpty(price7))||(!isEmpty(price8))||(!isEmpty(price9))||(!isEmpty(price10))||(!isEmpty(price11))||(!isEmpty(price12))){
			var intercompanyTransac = nlapiGetFieldValue("custitem_djkk_intercompany_transac");
				if(intercompanyTransac == 'T'){
//					alert('��ЊԎ���`�F�b�N�{�b�N�X���`�F�b�N�I������ꍇ�A�̔����i����͂ł��܂���B');
					alertMsg += '��ЊԎ���`�F�b�N�{�b�N�X���`�F�b�N�I������ꍇ�A�̔����i����͂ł��܂���B\n';
					returnType = false;
					
				}
			}				
	}
	
    var dj_np_bbd = nlapiGetFieldValue('custitem_djkk_no_bbd');
    if(dj_np_bbd == 'F'){
    	if(DJ_NO_BBD_RECORDTYPE_ARY.indexOf(nlapiGetRecordType()) != -1){
    		var warranty_month = nlapiGetFieldValue('custitem_djkk_warranty_month')
        	var shelf_life = nlapiGetFieldValue('custitem_djkk_shelf_life')
        	
        	if(isEmpty(warranty_month) && isEmpty(shelf_life)){
//        		alert('�uDJ_NO_BBD�v�`�F�b�N�I�t�Ȃ̂ŁA�uDJ_�o�׉\���ԁiDAYS�j�v�ƁuDJ_SHELF LIFE�iDAYS�j�v�͕K�{���ڂɂȂ�܂��B');
        		alertMsg += '�uDJ_NO_BBD�v�`�F�b�N�I�t�Ȃ̂ŁA�uDJ_�o�׉\���ԁiDAYS�j�v�ƁuDJ_SHELF LIFE�iDAYS�j�v�͕K�{���ڂɂȂ�܂��B\n';
        		returnType = false;
        	}
        	if(isEmpty(shelf_life)){
//        		alert('�uDJ_NO_BBD�v�`�F�b�N�I�t�Ȃ̂ŁA�uDJ_SHELF LIFE�iDAYS�j�v�͕K�����͂̍��ڂł���B');
        		alertMsg += '�uDJ_NO_BBD�v�`�F�b�N�I�t�Ȃ̂ŁA�uDJ_SHELF LIFE�iDAYS�j�v�͕K�����͂̍��ڂł���B\n';
        		returnType = false;
        	}
        	if(isEmpty(warranty_month)){
//        		alert('�uDJ_NO_BBD�v�`�F�b�N�I�t�Ȃ̂ŁA�uDJ_�o�׉\���ԁiDAYS�j�v�͕K�����͂̍��ڂł���B');
        		alertMsg += '�uDJ_NO_BBD�v�`�F�b�N�I�t�Ȃ̂ŁA�uDJ_�o�׉\���ԁiDAYS�j�v�͕K�����͂̍��ڂł���B\n';
        		returnType = false;
        	}
    	}
    }
    
    // add by ycx 2022/12/07 CH097 �R�[�h�̒����̐���i�����F13���A�C�O�F11���j
    if(sub==SUB_SCETI||sub==SUB_DPKK){
    	var upccode=nlapiGetFieldValue('upccode');
    	var country=nlapiGetFieldValue('countryofmanufacture');
    	  if(!isEmpty(upccode)){
    	    if(!isEmpty(country)){
    	       if(country=='JP'){
    	       	 if(upccode.length>13){
//    			    alert('�uEAN�R�[�h�iJAN�j�v�������𒴂��Ă���i�����F13���j');
    			    alertMsg += '�uEAN�R�[�h�iJAN�j�v�������𒴂��Ă���i�����F13���j\n';
    			    returnType = false;
    		      }
    	         }else {
    		     if(upccode.length>11){
//    			    alert('�uEAN�R�[�h�iJAN�j�v�������𒴂��Ă���i�C�O�F11���j');
    			    alertMsg += '�uEAN�R�[�h�iJAN�j�v�������𒴂��Ă���i�C�O�F11���j\n';
    			    returnType = false;
    		       }
    	         }
    	     }else{
//    	    	 alert('�uEAN�R�[�h�iJAN�j�v���m�F�̂��߂Ɂu�ύڒn�v�t�B�[���h����͂��Ă�������');
    	    	 alertMsg += '�uEAN�R�[�h�iJAN�j�v���m�F�̂��߂Ɂu�ύڒn�v�t�B�[���h����͂��Ă��������B\n';
 			    returnType = false;
    	     }
          }
    }
    // add end 
    
    // add codes before here
    var itemType = nlapiGetFieldValue('baserecordtype');
    if (returnType&&(formType == 'create'||formType == 'copy')) {
        var automatic = nlapiGetFieldValue('custitem_djkk_automatic');
        //20221212 changed by zhou start
        /*********old********/
		//var itemType = nlapiGetFieldValue('itemtype');
		//if(automatic == 'T'){
		//if (itemType != 'Assembly') {
        /*********old********/
        /*********new********/
        if(automatic == 'T'){
        if (itemType!='noninventoryitem'&& itemType!='otherchargeitem'&&itemType!='lotnumberedassemblyitem'&& itemType!='serializedassemblyitem'&&itemType!='serviceitem') {
    	/*********new********/
        //end
            var vendorname = '';//nlapiGetFieldValue('vendorname');
            var vcount=nlapiGetLineItemCount('itemvendor');//subsidiary
           for(var vi=1;vi<vcount+1;vi++){
        	   if(nlapiGetLineItemValue('itemvendor', 'preferredvendor', vi)=='T'){
        		   vendorname=nlapiGetLineItemValue('itemvendor', 'vendorcode', vi);
        		   break ;
        	   }
            }
            if (!isEmpty(vendorname)) {
            	var itemid = getNumbering(vendorname);
//                nlapiSetFieldValue('itemid', itemid);
                nlapiSetFieldValue('itemid', itemid, false, true);
            }else{
//            	alert('�����̔Ԃ̏ꍇ�͏��i�̎d�������͂��Ă��������A�d����̂P�ɗD��t���O��L���ɂ��Ă�������');
            	alertMsg += '�����̔Ԃ̏ꍇ�͏��i�̎d�������͂��Ă��������A�d����̂P�ɗD��t���O��L���ɂ��Ă�������\n';
            	returnType = false;
            }
        }

//        else{
//        	var kitflg=nlapiGetFieldValue('custitem_djkk_kitflag');        	
//        	if(!isEmpty(kitflg)){
//        		// ���Y�i
//        	if(kitflg=='4'){
//        		var itemid = getNumbering('A');
//                nlapiSetFieldValue('itemid', itemid);
//        		
//        	}else{
//        		var itemid = getNumbering('K');
//                nlapiSetFieldValue('itemid', itemid);
//        	 }
//        	}
//        }
//        if (!isEmpty(ItemidNumber)) {     //change by song add 23030403 item�����̔ԕ␳
//            nlapiSubmitField('customrecord_djkk_itemmaster_numbering', NumberingID, 'custrecord_djkk_itemmaster_nb_number', ItemidNumber);
//        }
        }       
    }     
    	//end   
//    if (formType == 'create'&&(itemType=='lotnumberedassemblyitem'|| itemType=='serializedassemblyitem'||itemType=='serviceitem')) { 
//		   console.log('in')
//		   var preferredvendorFlag = false;//�d���� 
//		   var isfulfillableFlag = true;//�d���� 
//			var vcount=nlapiGetLineItemCount('itemvendor');//subsidiary
//			for(var vi=1;vi<vcount+1;vi++){
//			   if(nlapiGetLineItemValue('itemvendor', 'preferredvendor', vi)=='T'){
//				   preferredvendorFlag =true;
//				   break ;
//			   }
//			}
//			var bland = nlapiGetFieldValue('custitem_djkk_class')//bland
//			
//			var alretStr = '�����̔Ԃ̏ꍇ��';
//			if(isEmpty(bland)){
//			   alretStr += '�uDJ_�u�����h�v�A';
//			}
//			if(preferredvendorFlag == false){
//			   alretStr += '���i�̎d����A�d����̂P�ɗD��t���O';
//			}
//			if(itemType=='lotnumberedassemblyitem'|| itemType=='serializedassemblyitem'){
//			   var isfulfillable = nlapiGetFieldValue('custitem_djkk_isfulfillable')//DJ_��́E�z��
//			   if(isfulfillable == 'F'){
//				   isfulfillableFlag = false; 
//				   alretStr += '�A�uDJ_��́E�z���v';
//			   }
//			}
//			 console.log(preferredvendorFlag)
//			  console.log(isfulfillableFlag)
//			   console.log(bland)
//			alretStr += '����͂��Ă�������';
//			if(preferredvendorFlag == false || isfulfillableFlag == false ||isEmpty(bland)){
//				alert(alretStr);
//				return false;
//			}	
//	   }
    
    
    //2022/03/31 geng U327 start

  //changed by geng add end U796
//    var location = nlapiGetFieldValue('custitem_djkk_item_location');
//    var type=nlapiGetRecordType();
//    if((sub == SUB_NBKK || sub == SUB_ULKK) && (type == 'otherchargeitem') && (isEmpty(location))){
//    	alert('DJ_�ꏊ����͂��Ă��������B');
//    	return false;
//    }
    //end
         
//	var recordType =  nlapiGetRecordType();
//	if(recordType == "lotnumberedinventoryitem"){
//		var itemvendorCount = nlapiGetLineItemCount("itemvendor");
//		var preferredIsEmptyFlag = false ;
//		for(var z = 1 ; z < itemvendorCount+1 ; z++){
//			var preferredvendor = nlapiGetLineItemValue("itemvendor","preferredvendor",z);
//			if(preferredvendor == 'T'){
//				preferredIsEmptyFlag = true;
//			}
//		}
//		if(preferredIsEmptyFlag == false){
//			alert("�����̔Ԃ̂��߁A�d����̂P�ɗD��t���O��L���ɂ��Ă��������B");
//			return false
//		}
//	}
    var perunitquantity = Number(nlapiGetFieldValue('custitem_djkk_perunitquantity'));
	if((perunitquantity < 0 ||isEmpty(perunitquantity))&&(sub== SUB_NBKK || sub== SUB_ULKK)){
//		alert('DJ_���萔�i����ځj�͋�ł͂Ȃ��A0���傫���Ȃ���΂Ȃ�܂���')	;
		alertMsg += 'DJ_���萔�i����ځj�͋�ł͂Ȃ��A0���傫���Ȃ���΂Ȃ�܂���\n';
		returnType = false;
	}
    
	//20230329 add by zhou start
	//CH304 start
	if((sub==SUB_SCETI||sub==SUB_DPKK) && nlapiGetFieldValue('custitem_djkk_forecast') == 'T' && isEmpty(nlapiGetFieldValue('custitem_djkk_business_judgmen_fc'))){
//		alert('�uDJ_FORECAST�̑Ώہv�Ƀ`�F�b�N����ꂽ�ꍇ�A�uDJ_�c��FC�T�����f�v���󔒂ɂ��邱�Ƃ͂ł��܂���B');
		alertMsg += '�uDJ_FORECAST�̑Ώہv�Ƀ`�F�b�N����ꂽ�ꍇ�A�uDJ_�c��FC�T�����f�v���󔒂ɂ��邱�Ƃ͂ł��܂���B\n';
		returnType = false;
	}
	//20230329 add by zhou end
	if(!isEmpty(alertMsg)){
		alert(alertMsg)
	}
	
//	var alertMsgtest = '';
//	alertMsgtest += '�uDJ_�򕨈�w�v�`�F�b�N�I���̏ꍇ�A�uDJ_QC�J�e�S���[�v����͂��Ă��������B \n';
//	alertMsgtest += '�u�Ō���������1-5�v�͏��Ȃ��Ƃ������͂���K�v������܂��B\n';
//	alertMsgtest += '�u�J�����S�q���@������1-5�v�͏��Ȃ��Ƃ������͂���K�v������܂��B\n';
//	alertMsgtest += '��ЊԎ���`�F�b�N�{�b�N�X���`�F�b�N�I������ꍇ�A�̔����i����͂ł��܂���B\n';
//	alertMsgtest += '�uDJ_NO_BBD�v�`�F�b�N�I�t�Ȃ̂ŁA�uDJ_�o�׉\���ԁiDAYS�j�v�ƁuDJ_SHELF LIFE�iDAYS�j�v�͕K�{���ڂɂȂ�܂��B\n';
//	alertMsgtest += '�uDJ_NO_BBD�v�`�F�b�N�I�t�Ȃ̂ŁA�uDJ_SHELF LIFE�iDAYS�j�v�͕K�����͂̍��ڂł���B\n';
//	alertMsgtest += '�uDJ_NO_BBD�v�`�F�b�N�I�t�Ȃ̂ŁA�uDJ_�o�׉\���ԁiDAYS�j�v�͕K�����͂̍��ڂł���B\n';
//	alertMsgtest += '�uEAN�R�[�h�iJAN�j�v�������𒴂��Ă���i�����F13���j\n';
//	alertMsgtest += '�uEAN�R�[�h�iJAN�j�v�������𒴂��Ă���i�C�O�F11���j\n';
//	alertMsgtest += '�uEAN�R�[�h�iJAN�j�v���m�F�̂��߂Ɂu�ύڒn�v�t�B�[���h����͂��Ă��������B\n';
//	alertMsgtest += '�����̔Ԃ̏ꍇ�͏��i�̎d�������͂��Ă��������A�d����̂P�ɗD��t���O��L���ɂ��Ă�������\n';
//	alertMsgtest += 'DJ_���萔�i����ځj�͋�ł͂Ȃ��A0���傫���Ȃ���΂Ȃ�܂���\n';
//	alertMsgtest += '�uDJ_FORECAST�̑Ώہv�Ƀ`�F�b�N����ꂽ�ꍇ�A�uDJ_�c��FC�T�����f�v���󔒂ɂ��邱�Ƃ͂ł��܂���B\n';
//	alert(alertMsgtest)
    return returnType;
}

/**
 * �A�C�e���}�X�^�̔ԕ\���擾
 * 
 * @param recordType
 * @returns itemid
 */
function getNumbering(vendorname) {
	var searchResult = nlapiSearchRecord("customrecord_djkk_itemmaster_numbering",null,
			[
			   ["custrecord_djkk_itemmaster_nb_name","is",vendorname]
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_itemmaster_nb_number"), 
			   new nlobjSearchColumn("internalid")
			]
			);
    var name = vendorname;
    if(!isEmpty(searchResult)){
        var ItemidNumber = parseInt(searchResult[0].getValue('custrecord_djkk_itemmaster_nb_number'));
		if(isEmpty(ItemidNumber)){
			ItemidNumber=0;
		}
		ItemidNumber++;
        NumberingID = searchResult[0].getValue('internalid');
        var itemid = name +"-"+prefixInteger(parseInt(ItemidNumber), parseInt(TheMinimumdigits));
    }else{
    	
    var newtb=nlapiCreateRecord('customrecord_djkk_itemmaster_numbering');
    newtb.setFieldValue('custrecord_djkk_itemmaster_nb_name', vendorname);
    newtb.setFieldValue('custrecord_djkk_itemmaster_nb_number', '0');
    var upid=nlapiSubmitRecord(newtb, false, true);
    ItemidNumber = 1;
    NumberingID = upid;
    var itemid = name +"-"+prefixInteger(parseInt(ItemidNumber), parseInt(TheMinimumdigits));
    }
    return itemid;
}