/**
 * FC�쐬Comment_�H�i
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/15     CPC_��
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){

	
	
	//�p�����[�^���擾����
	var comment = request.getParameter('comment');
	var changedFieldId = request.getParameter('changedFieldId');
	var typeFlag = request.getParameter('type');//
	var form;
	if(!isEmpty(typeFlag) && typeFlag == 'updateMemo'){
	//20221129 add by zhou CH141
		//DJ_�̔��v����_memo�X�V
		form = nlapiCreateForm('DJ_�̔��v���񃁃�_�H�i', true);
		form.setScript('customscript_djkk_cs_forecast_comment');
		//��ʂɃe�L�X�g�G���A���쐬����
		var fieldCommen = form.addField('custpage_memo', 'textarea', 'DJ_����', 'null',null);
		var changedField = form.addField('custpage_changedfieldid', 'text', 'changedFieldId', 'null',null);
		
		//�p�����[�^���f
		if(!isEmpty(comment)&&comment!='undefined'){
			
			//���e��ݒ肷��
			comment=comment.replace(new RegExp("<br>","g"),"\n");
			fieldCommen.setDefaultValue(comment);
		}
		
	   if(!isEmpty(changedFieldId)){		
		   changedField.setDefaultValue(changedFieldId);
		}
	    changedField.setDisplayType('hidden');
	    
		//��ʂɃ{�^����ݒ肷��
		var btnSubmit = form.addButton('custpage_btn_submit', '�߂�', 'createMemoSubmit();');
	}else if(!isEmpty(typeFlag) && typeFlag == 'lookMemo'){
		//DJ_�̔��v����_memo�\�����q���E�W��
		form = nlapiCreateForm('DJ_�̔��v���񃁃�_�H�i', true);
		form.setScript('customscript_djkk_cs_forecast_comment');
		//��ʂɃe�L�X�g�G���A���쐬����
		var fieldCommen = form.addField('custpage_memo', 'textarea', 'DJ_����', 'null',null);
		var changedField = form.addField('custpage_changedfieldid', 'text', 'changedFieldId', 'null',null);
		
		//�p�����[�^���f
		if(!isEmpty(comment)&&comment!='undefined'){
			
			//���e��ݒ肷��
			comment=comment.replace(new RegExp("<br>","g"),"\n");
			fieldCommen.setDefaultValue(comment);
		}
		
	   if(!isEmpty(changedFieldId)){		
		   changedField.setDefaultValue(changedFieldId);
		}
//	   fieldCommen.setDisplayType('disabled');
	   changedField.setDisplayType('hidden');
	    
		//��ʂɃ{�^����ݒ肷��
		var btnSubmit = form.addButton('custpage_btn_submit', '�߂�', 'lookMemoBack();');
	//20221129 add by zhou end 
	}else if(!isEmpty(typeFlag) && typeFlag == 'report-lookMemo'){
		//DJ_�̔��v����_memo�\�����q���E�W��
		form = nlapiCreateForm('DJ_�̔��v���񃌃|�[�g����_�H�i', true);
		form.setScript('customscript_djkk_cs_forecast_comment');
		//��ʂɃe�L�X�g�G���A���쐬����
		var fieldCommen = form.addField('custpage_memo', 'textarea', 'DJ_����', 'null',null);
		var changedField = form.addField('custpage_changedfieldid', 'text', 'changedFieldId', 'null',null);
		
		//�p�����[�^���f
		if(!isEmpty(comment)&&comment!='undefined'){
			
			//���e��ݒ肷��
			comment=comment.replace(new RegExp("<br>","g"),"\n");
			fieldCommen.setDefaultValue(comment);
		}
		
	   if(!isEmpty(changedFieldId)){		
		   changedField.setDefaultValue(changedFieldId);
		}
//	   fieldCommen.setDisplayType('disabled');
	   changedField.setDisplayType('hidden');
	    
		//��ʂɃ{�^����ݒ肷��
		var btnSubmit = form.addButton('custpage_btn_submit', '�߂�', 'lookMemoBack();');
	//20221129 add by zhou end 
	}else{
		form = nlapiCreateForm('DJ_SC��FC�쐬Comment_�H�i', true);
		form.setScript('customscript_djkk_cs_forecast_comment');
		//��ʂɃe�L�X�g�G���A���쐬����
		var fieldCommen = form.addField('custpage_comment', 'textarea', 'DJ_�R�����g', 'null',null);
		var changedField = form.addField('custpage_changedfieldid', 'text', 'changedFieldId', 'null',null);
		
		//�p�����[�^���f
		if(!isEmpty(comment)&&comment!='undefined'){
			
			//���e��ݒ肷��
			comment=comment.replace(new RegExp("<br>","g"),"\n");
			fieldCommen.setDefaultValue(comment);
		}
		
	   if(!isEmpty(changedFieldId)){		
		   changedField.setDefaultValue(changedFieldId);
		}
	    changedField.setDisplayType('hidden');
	    
		//��ʂɃ{�^����ݒ肷��
		var btnSubmit = form.addButton('custpage_btn_submit', '�߂�', 'btnSubmit();');
	}
	response.writePage(form);
}