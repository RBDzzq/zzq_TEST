/**
 * FC作成Comment_食品
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/15     CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){

	
	
	//パラメータを取得する
	var comment = request.getParameter('comment');
	var changedFieldId = request.getParameter('changedFieldId');
	var typeFlag = request.getParameter('type');//
	var form;
	if(!isEmpty(typeFlag) && typeFlag == 'updateMemo'){
	//20221129 add by zhou CH141
		//DJ_販売計画情報_memo更新
		form = nlapiCreateForm('DJ_販売計画情報メモ_食品', true);
		form.setScript('customscript_djkk_cs_forecast_comment');
		//画面にテキストエリアを作成する
		var fieldCommen = form.addField('custpage_memo', 'textarea', 'DJ_メモ', 'null',null);
		var changedField = form.addField('custpage_changedfieldid', 'text', 'changedFieldId', 'null',null);
		
		//パラメータ判断
		if(!isEmpty(comment)&&comment!='undefined'){
			
			//内容を設定する
			comment=comment.replace(new RegExp("<br>","g"),"\n");
			fieldCommen.setDefaultValue(comment);
		}
		
	   if(!isEmpty(changedFieldId)){		
		   changedField.setDefaultValue(changedFieldId);
		}
	    changedField.setDisplayType('hidden');
	    
		//画面にボタンを設定する
		var btnSubmit = form.addButton('custpage_btn_submit', '戻る', 'createMemoSubmit();');
	}else if(!isEmpty(typeFlag) && typeFlag == 'lookMemo'){
		//DJ_販売計画情報_memo表示＃ヒョウジ＃
		form = nlapiCreateForm('DJ_販売計画情報メモ_食品', true);
		form.setScript('customscript_djkk_cs_forecast_comment');
		//画面にテキストエリアを作成する
		var fieldCommen = form.addField('custpage_memo', 'textarea', 'DJ_メモ', 'null',null);
		var changedField = form.addField('custpage_changedfieldid', 'text', 'changedFieldId', 'null',null);
		
		//パラメータ判断
		if(!isEmpty(comment)&&comment!='undefined'){
			
			//内容を設定する
			comment=comment.replace(new RegExp("<br>","g"),"\n");
			fieldCommen.setDefaultValue(comment);
		}
		
	   if(!isEmpty(changedFieldId)){		
		   changedField.setDefaultValue(changedFieldId);
		}
//	   fieldCommen.setDisplayType('disabled');
	   changedField.setDisplayType('hidden');
	    
		//画面にボタンを設定する
		var btnSubmit = form.addButton('custpage_btn_submit', '戻る', 'lookMemoBack();');
	//20221129 add by zhou end 
	}else if(!isEmpty(typeFlag) && typeFlag == 'report-lookMemo'){
		//DJ_販売計画情報_memo表示＃ヒョウジ＃
		form = nlapiCreateForm('DJ_販売計画情報レポートメモ_食品', true);
		form.setScript('customscript_djkk_cs_forecast_comment');
		//画面にテキストエリアを作成する
		var fieldCommen = form.addField('custpage_memo', 'textarea', 'DJ_メモ', 'null',null);
		var changedField = form.addField('custpage_changedfieldid', 'text', 'changedFieldId', 'null',null);
		
		//パラメータ判断
		if(!isEmpty(comment)&&comment!='undefined'){
			
			//内容を設定する
			comment=comment.replace(new RegExp("<br>","g"),"\n");
			fieldCommen.setDefaultValue(comment);
		}
		
	   if(!isEmpty(changedFieldId)){		
		   changedField.setDefaultValue(changedFieldId);
		}
//	   fieldCommen.setDisplayType('disabled');
	   changedField.setDisplayType('hidden');
	    
		//画面にボタンを設定する
		var btnSubmit = form.addButton('custpage_btn_submit', '戻る', 'lookMemoBack();');
	//20221129 add by zhou end 
	}else{
		form = nlapiCreateForm('DJ_SC課FC作成Comment_食品', true);
		form.setScript('customscript_djkk_cs_forecast_comment');
		//画面にテキストエリアを作成する
		var fieldCommen = form.addField('custpage_comment', 'textarea', 'DJ_コメント', 'null',null);
		var changedField = form.addField('custpage_changedfieldid', 'text', 'changedFieldId', 'null',null);
		
		//パラメータ判断
		if(!isEmpty(comment)&&comment!='undefined'){
			
			//内容を設定する
			comment=comment.replace(new RegExp("<br>","g"),"\n");
			fieldCommen.setDefaultValue(comment);
		}
		
	   if(!isEmpty(changedFieldId)){		
		   changedField.setDefaultValue(changedFieldId);
		}
	    changedField.setDisplayType('hidden');
	    
		//画面にボタンを設定する
		var btnSubmit = form.addButton('custpage_btn_submit', '戻る', 'btnSubmit();');
	}
	response.writePage(form);
}