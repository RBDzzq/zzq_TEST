/**
 * �w�����UserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/01     CPC_��            �V�K�쐬
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {
	
	var customformID = nlapiGetFieldValue('customform');
	/***************************/
    // TODO ���F���� need to delete
//	old
//    if(customformID!='64'){
//    	nlapiSetFieldValue('custentity_djkk_approval_deal_flg', 'F'); 
//    	nlapiSetFieldValue('custentity_djkk_effective_recognition', 'T'); 	
//    }
//	new
	  // change by ycx 2023/02/20
	  //old
//	 if(customformID!='64'&&customformID!='106'){
//	    	nlapiSetFieldValue('custentity_djkk_approval_deal_flg', 'F'); 
//	    	nlapiSetFieldValue('custentity_djkk_effective_recognition', 'T'); 	
//	    }
	  //new
	nlapiSetFieldValue('custentity_djkk_approval_deal_flg', 'T'); 
	nlapiSetFieldValue('custentity_djkk_effective_recognition', 'F'); 	
	nlapiSetFieldValue('custentity_djkk_new_brand', null,false, true);

// change end by ycx 2023/02/20
    /***************************/
	if(type=='create'){
		nlapiSetFieldValue('custentity_djkk_request_class', '1', false, true);
	}
	var roleSubsidiary=getRoleSubsidiary();
    nlapiSetFieldValue('custentity_syokuseki', roleSubsidiary);
//old   
//    var customformID = nlapiGetFieldValue('customform');
//	if(customformID != VENDOR_CUSTOMFORM_DISABLED_LS_ID && customformID != VENDOR_CUSTOMFORM_DISABLED_LS_FOOD){
//		nlapiSetFieldValue('subsidiary', roleSubsidiary);
//	}
//    new
//    var customformID = nlapiGetFieldValue('customform');
	if(customformID != VENDOR_CUSTOMFORM_DISABLED_LS_FOOD){

			nlapiSetFieldValue('subsidiary', roleSubsidiary);
		
	}
    //nlapiSetFieldValue('subsidiary', roleSubsidiary);
}

function userEventAfterSubmit(type){
//changed by wang add start U084
	nlapiLogExecution('debug', 'type',type);
	var sub=nlapiGetFieldValue('subsidiary');
	try{
	  if(type=='create' || type=='edit'){
		  		var customformID = nlapiGetFieldValue('customform');
		  		var submitId='1';
				var NumberTxt='L';
				var numbering='';
				var TheMinimumdigits = 4;
				var usersub=getRoleSubsidiary();
				var nbSearch = nlapiSearchRecord("customrecord_djkk_brand_number",null,
						[
						   ["custrecord_djkk_brandnum_subsidiary","anyof",usersub]
						], 
						[
		                 new nlobjSearchColumn("internalid"),
		                 new nlobjSearchColumn("custrecord_djkk_brandnum_subsidiary"),
		                 new nlobjSearchColumn("custrecord_djkk_brandnum_form_name"),
						   new nlobjSearchColumn("custrecord_djkk_brandnum_item_make"), 
						   new nlobjSearchColumn("custrecord_djkk_brandnum_bumber")
						]
						);
				if(!isEmpty(nbSearch)){
					submitId=nbSearch[0].getValue('internalid');
					NumberTxt=nbSearch[0].getValue('custrecord_djkk_brandnum_item_make');
					numbering=nbSearch[0].getValue('custrecord_djkk_brandnum_bumber');
				}
				var brand = nlapiGetFieldValue('custentity_djkk_new_brand');
				nlapiLogExecution('debug', 'brand',brand);
				var brandCode = nlapiGetFieldValue('custentity_djkk_brand_code');
				//20221012 changed by zhou 
				//���[�U���uDJ_�u�����h���v����́A���uDJ_�u�����h�v����ł���ꍇ�ɂ̂݁A�d�����o�^����ۂɎ����̔�.
				
				//20230424 changed by zhou start
				//20230424 zhoumemo:CH476
				//�d����}�X�^�ɐV�K�u�����h�𕡐��o�^�ł���悤�ɋ@�\���C����B
				//�d����o�^���ɕ����u�����h��V�݂���\�������邽�߁B
//				if(!isEmpty(brand) && isEmpty(brandCode)){//before code 20230424
				if(!isEmpty(brand)){
					var brandSearchCheck= nlapiSearchRecord("classification",null,
							   [
						       ["name","contains",NumberTxt],
						       "AND",
						       ["name","contains",brand]
						        ], 
					    		[
					    		  new nlobjSearchColumn("internalid"), 
					    		]
					    		);
					var brandId =(isEmpty(brandSearchCheck) ? '' :  brandSearchCheck[0].getValue("internalid"));
					nlapiLogExecution('debug', 'brandId',brandId);
				if(isEmpty(brandId)){
					nlapiLogExecution('debug', 'access1','access1');
				
				numbering++;
				
				var itemMake=NumberTxt
				var receiptinventorynumber =  itemMake+ prefixInteger(parseInt(numbering), parseInt(TheMinimumdigits));		
				nlapiLogExecution('debug', 'receiptinventorynumber',itemMake+'_'+parseInt(numbering)+'_'+parseInt(TheMinimumdigits));
				var brandName = receiptinventorynumber+' '+brand;
	//			var sub=nlapiGetFieldValue('subsidiary');
				
				var rec = nlapiCreateRecord('classification');			
				rec.setFieldValue('name', brandName);
				rec.setFieldValue('custrecord_djkk_cs_subsidiary', sub);	
				rec.setFieldValue('subsidiary', sub);	
				nlapiSubmitRecord(rec);
				nlapiSubmitField('customrecord_djkk_brand_number',submitId, 'custrecord_djkk_brandnum_bumber',numbering);
				nlapiLogExecution('debug', 'access2','access2');
				var brandSearch= nlapiSearchRecord("classification",null,
						   [
					       ["name","is",brandName]
					        ], 
				    		[
				    		  new nlobjSearchColumn("internalid"), 
				    		]
				    		);
				brandId = brandSearch[0].getValue("internalid");
				//20230807 add by zzq CH785 start
                if(customformID == '76'){
                    var formAddress = nlapiGetUser;//�쐬��
                    var toAddress =  'zht@cloverplus.net'//�o��
                    var bcc = null;
                    var subject = '�d����t�����g���Ńu�����h�}�X�^�쐬�t�B�[�h�o�b�N'
                    var body =  '�o���l�A�����l�ł��B';
                    body += '�t�����g�Ƀu�����h��V�K�o�^���܂����A';
                    body += '���m�F���肢�v���܂��B<br>';
                    body += '�u�����h�̖��O�F'+ brandName+'<br>';
                    body += '�u�����h�̓���ID�F'+ brandId;
                    var mailObj;
                    var mailDataObj = {
                            formAddress:formAddress,
                            toAddress:toAddress,
                            bcc:bcc,
                            subject:subject,
                            body:body,
                    }
                    var sendFlag = automaticSendmail(mailDataObj,null)
                    nlapiLogExecution('debug', 'sendFlag',sendFlag);
                }
                //20230807 add by zzq CH785 end
				}
				nlapiLogExecution('debug', 'access3','access3');
				
				//20230110 add by zhou CH095
				//�t�����g���Ńu�����h�}�X�^�֐V�K�o�^����Ƃ��ɂ́A�o���l�փ��[���ŘA���B
				//20230807 add by zzq CH785 start
//				if(customformID == '76'){
//					var formAddress = nlapiGetUser;//�쐬��
//					var toAddress =  'zht@cloverplus.net'//�o��
//					var bcc = null;
//					var subject = '�d����t�����g���Ńu�����h�}�X�^�쐬�t�B�[�h�o�b�N'
//					var body =  '�o���l�A�����l�ł��B';
//		            body += '�t�����g�Ƀu�����h��V�K�o�^���܂����A';
//		            body += '���m�F���肢�v���܂��B<br>';
//		            body += '�u�����h�̖��O�F'+ brandName+'<br>';
//		            body += '�u�����h�̓���ID�F'+ brandId;
//					var mailObj;
//					var mailDataObj = {
//							formAddress:formAddress,
//							toAddress:toAddress,
//							bcc:bcc,
//							subject:subject,
//							body:body,
//					}
//					var sendFlag = automaticSendmail(mailDataObj,null)
//					nlapiLogExecution('debug', 'sendFlag',sendFlag);
//				}
				//20230807 add by zzq CH785 end
				//end
				var brandsArray=nlapiGetFieldValues('custentity_djkk_brand_code');
				var id = nlapiGetRecordId();
				var newBrandsArray = new Array();
				if(!isEmpty(brandsArray)){
					for (var sl = 0; sl < brandsArray.length; sl++) {
						newBrandsArray.push(brandsArray[sl]);
						nlapiLogExecution('debug', 'newBrandsArray01',newBrandsArray);
						nlapiLogExecution('debug', 'brandsArray[sl]',brandsArray[sl]);
					}
			  }
					newBrandsArray.push(brandId);
					nlapiLogExecution('debug', 'newBrandsArray02',newBrandsArray);
					nlapiLogExecution('debug', 'brandId',brandId);
					var record = nlapiLoadRecord('vendor', id);
				    record.setFieldValues('custentity_djkk_brand_code',newBrandsArray);
				    record.setFieldValue('custentity_djkk_new_brand',null);
					nlapiSubmitRecord(record);
				}
			}
	}catch(e){
			nlapiLogExecution('error', 'error', e);	
	   }	
  		//20221011 add by zhou U568
  		if(type == 'create'){
  			var loadRecord =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
  			loadRecord.setFieldValue('autoname','F');
  			var newVendorCode = getNewCodeNo (sub);
  			nlapiLogExecution('debug','�d���������x�����̔�',newVendorCode)
  			loadRecord.setFieldValue('entityid',newVendorCode);
  			nlapiSubmitRecord(loadRecord);
  		}
  		//20221011 add by zhou end
}
//changed by wang add end U568
//�d���������x�����̔�
function getNewCodeNo (sub){
	var no = "";
	try{
		var HeadTxt='V';
		var TheMinimumdigits = 5;
		var submitId='';
		var NumberTxt='';
		var numbering='';
		
		var usersub=sub;
		var nbSearch = nlapiSearchRecord("customrecord_djkk_vendor_createcode",null,
				[
				   ["custrecord_djkk_vendor_subsidiary","anyof",usersub]
				], 
				[
                   new nlobjSearchColumn("internalid"),
                   new nlobjSearchColumn("custrecord_djkk_vendor_subsidiary"),
                   new nlobjSearchColumn("custrecord_djkk_vendor_sub_name"),
				   new nlobjSearchColumn("custrecord_djkk_vendor_sub_tranprefix"), 
				   new nlobjSearchColumn("custrecord_djkk_vendor_code_bumber")
				]
				);
		if(!isEmpty(nbSearch)){
			submitId=nbSearch[0].getValue('internalid');
			NumberTxt=nbSearch[0].getValue('custrecord_djkk_vendor_sub_tranprefix');
			numbering=nbSearch[0].getValue('custrecord_djkk_vendor_code_bumber');
		}

		/****TODO***/
//		20230412 changed by zhou start
//		zhou memo :DENISJAPAN-736 �̎���      �d����̃R�[�h���@�h�J���p�j�[ID"�{V�{5���@�ɂȂ�͂��ł����O�ƕς��Ȃ��@V�{�h�J���p�j�[ID"�{5���@�ɂȂ��Ă��܂��B
//		var newVendorCode = HeadTxt + NumberTxt + prefixInteger(parseInt(numbering)+1, parseInt(TheMinimumdigits)); //OLD CODE
		var newVendorCode = NumberTxt + HeadTxt + prefixInteger(parseInt(numbering)+1, parseInt(TheMinimumdigits)); //OLD CODE
		nlapiSubmitField('customrecord_djkk_vendor_createcode',submitId, 'custrecord_djkk_vendor_code_bumber',parseInt(numbering)+1);
//		end
		return newVendorCode;
	}catch(e){
		nlapiLogExecution('ERROR', '�̔ԃG���[', e.message)
	}
	return no;
}
//end