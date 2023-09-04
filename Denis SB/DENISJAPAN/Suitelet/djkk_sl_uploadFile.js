/**
 * Module Description
 * ファイルアップロードPOP画面
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Jul 2021     
 *
 */
/**
 * for handy test
 * @param {*} request 
 * @param {*} response 
 */
function suitelet(request, response) {
        
	if(request.getMethod() == 'POST'){ 
       
	    //CH762 20230814 add by zdj start
        var locationValueNew = request.getParameter('custpage_locationvalue');
        //CH762 20230814 add by zdj end
		var form = nlapiCreateForm('ファイルアップロード完成しました。', false);
		form.setScript('customscript_djkk_cs_uploadfile');
		//form.addButton('btn_close', '閉じる','close()')
		var fileFild = form.addField('custpage_file_id', 'text', 'ファイルID').setDisplayType('hidden');
		form.addField('custpage_lable', 'label', 'ファイルアップロード完成しました')
		var file=request.getFile('custpage_file'); 
		//CH762 20230814 add by zdj start
		if(locationValueNew){
		    file.setName('実地棚卸アップロード' + '_' + locationValueNew + '_' + getDateYymmddFileName() +'.csv');
		}else{
		    file.setName('実地棚卸アップロード' + '_' + getDateYymmddFileName() +'.csv');
		}
		//CH762 20230814 add by zdj end
	    //20230901 add by CH762 start 
		var subsidiary = request.getParameter('custpage_subsidiary');
	    var SAVE_PDF_FOLDER = FILE_CABINET_ID_DJ_ACTUAL_INVENTORY;
	    if (subsidiary == SUB_NBKK) {
	        SAVE_PDF_FOLDER = FILE_CABINET_ID_DJ_ACTUAL_INVENTORY_NBKK;
	    } else if(subsidiary == SUB_ULKK){
	        SAVE_PDF_FOLDER = FILE_CABINET_ID_DJ_ACTUAL_INVENTORY_ULKK;
	    } 
	    //20230901 add by CH762 end 
		file.setFolder(SAVE_PDF_FOLDER);
		var fileId = nlapiSubmitFile(file);
		fileFild.setDefaultValue(fileId);
		nlapiGetContext().setSessionObject("session_upload_file_id",fileId);
		form.addButton('custpage_refresh', 'DJ_実地棚卸更新', 'parent.location.reload();');
		response.writePage(form);	
		nlapiLogExecution('DEBUG', 'form', form);
	}else{
	    //CH762 20230814 add by zdj start
	    var locationValueNew1 = request.getParameter('custpage_locationvalue');
	    if(locationValueNew1){
	    var locationrecord = nlapiLoadRecord('location', locationValueNew1);
	    var locationName = locationrecord.getFieldValue('name');
	    }
	    //CH762 20230814 add by zdj end
		var form = nlapiCreateForm('ファイルアップロード', false);
		
		form.setScript('customscript_djkk_cs_uploadfile');
		var fileFild = form.addField('custpage_file', 'file', 'アップロードファイル');
		
		//CH762 20230814 add by zdj start
		if(locationValueNew1){
		var locationValueText = form.addField('custpage_locationvalue','text','locationText').setDisplayType('hidden');
		locationValueText.setDefaultValue(locationName);
		}
		//CH762 20230814 add by zdj end
		var subsidiaryValue = request.getParameter('sub');
		if (subsidiaryValue){
		    var subsidiaryField = form.addField('custpage_subsidiary','text','subsidiaryValue').setDisplayType('hidden');
		    subsidiaryField.setDefaultValue(subsidiaryValue);
		}
		form.addSubmitButton('CSVアップロード');
		response.writePage(form);
	}
	

}
