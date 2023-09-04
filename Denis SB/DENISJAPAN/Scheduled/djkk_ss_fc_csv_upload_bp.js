/**
 * DJ_FC_csv�A�b�v���[�h_ls
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Oct 2022     zhou
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {

    nlapiLogExecution('debug', 'csv upload');
    var fieldId = Number(nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_csvid'));
    var file = nlapiLoadFile(fieldId);
//    if(false){
    if(!isEmpty(file)){
    	var jsonData = getDetails(file);
    	
//    	var mappingFileId = 107; //using internal id of Saved CSV Import
//    	var primaryFile = nlapiLoadFile(fieldId); //using the internal id of the file stored in the File Cabinet
//
//    	var job = nlapiCreateCSVImport();
//    	job.setMapping(mappingFileId);
//    	job.setPrimaryFile(primaryFile);
//    	//returns the internal id of the new job created in workqueue
//    	var jobId = nlapiSubmitCSVImport(job);
    	if(!isEmpty(jsonData)){
    	var jLen = jsonData.length;
        for (var i = 0; i < jLen; i++) {
        	var employeeid=jsonData[0].employeeid;
            // netsuite��usage���`�F�b�N����
            governanceYield();
            // id����̏ꍇ�A���o�^�̃f�[�^�ƌ��Ȃ�
            if (isEmpty(jsonData[i].id)) {
                // fc������łȂ��ꍇ
                if (!isEmpty(jsonData[i].fcnum)) {
                    var creatScFcRecord = nlapiCreateRecord('customrecord_djkk_so_forecast_ls');
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_subsidiary', jsonData[i].subsidiary);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_item', jsonData[i].item);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_location_area', jsonData[i].locationArea);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_year', jsonData[i].year);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_month', jsonData[i].month);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_employee', employeeid);
                    creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_fcnum', Number(jsonData[i].fcnum));
                    nlapiSubmitRecord(creatScFcRecord, false, true);
                }else{
                	 var creatScFcRecord = nlapiCreateRecord('customrecord_djkk_so_forecast_ls');
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_subsidiary', jsonData[i].subsidiary);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_item', jsonData[i].item);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_location_area', jsonData[i].locationArea);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_year', jsonData[i].year);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_month', jsonData[i].month);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_employee', employeeid);
                     creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_fcnum', '');
                     nlapiSubmitRecord(creatScFcRecord, false, true);
                }
//                     var forecast_Search = nlapiSearchRecord("customrecord_djkk_so_forecast_ls",null,
//                    		 [
//                    		    ["custrecord_djkk_so_fc_ls_item","anyof",jsonData[i].item], 
//                    		    "AND", 
//                    		    ["custrecord_djkk_so_fc_ls_subsidiary","anyof",jsonData[i].subsidiary], 
//                    		    "AND", 
//                    		    ["custrecord_djkk_so_fc_ls_location_area","anyof",jsonData[i].locationArea], 
//                    		    "AND", 
//                    		    ["custrecord_djkk_so_fc_ls_year","is",jsonData[i].year],
//                    		    "AND", 
//                    		    ["formulanumeric: TO_NUMBER({custrecord_djkk_so_fc_ls_month})+1","equalto",Number(jsonData[i].month)]
//                    		 ], 
//                    		 [
//                    		    new nlobjSearchColumn("scriptid").setSort(false), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_subsidiary"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_item"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_location_area"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_year"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_month"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_employee"), 
//                    		    new nlobjSearchColumn("custrecord_djkk_so_fc_ls_fcnum")
//                    		 ]
//                    		 );
//                    		 if(isEmpty(forecast_Search)){
//                    			 var creatScFcRecord = nlapiCreateRecord('customrecord_djkk_so_forecast_ls');
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_subsidiary', jsonData[i].subsidiary);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_item', jsonData[i].item);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_location_area', jsonData[i].locationArea);
//                                 var year=jsonData[i].year;
//                                 var month=jsonData[i].month;
//                                 if(month=='1'){
//                                	 month='12';
//                                	 year=Number(year)-1;
//                                 }else{
//                                	 if(Number(month)<10){
//                                		 month='0'+(Number(month)-1).toString();
//                                	 }else{
//                                		 month=(Number(month)-1).toString(); 
//                                	 }
//                                 }
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_year',year);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_month',month);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_employee', employeeid);
//                                 creatScFcRecord.setFieldValue('custrecord_djkk_so_fc_ls_fcnum', '');
//                                 nlapiSubmitRecord(creatScFcRecord, false, true);
//                    		 }
                     
                
            } 
            // id���݂���ꍇ�A�o�^�ς̃f�[�^�ƌ��Ȃ�
            else {
                // fc������łȂ��ꍇ
                if (!isEmpty(jsonData[i].fcnum)) {
                    // �w��id�̃��R�[�h���擾
                    var fcRecord=nlapiLoadRecord('customrecord_djkk_so_forecast_ls', jsonData[i].id);
                    // ����FC���ƃe�[�u������FC�����قȂ�ꍇ�A�X�V�ƌ��Ȃ�
                    if (fcRecord.getFieldValue('custrecord_djkk_so_fc_ls_fcnum') != Number(jsonData[i].fcnum)) {
                        // ����FC�������R�[�h�t�B�[���h�ɐݒ�
                        fcRecord.setFieldValue('custrecord_djkk_so_fc_ls_fcnum', Number(jsonData[i].fcnum));
                    }
                    // �V����FC�����e�[�u���ɕۑ�
                    nlapiSubmitRecord(fcRecord, false, true);
                }
            }
        }
    	
    	
    	}
    }
    nlapiLogExecution('debug', 'csv upload END');

	
}
function getDetails(file){
     var fcDetailsArray = [];
	 var fileArr = file.getValue().split('\r\n');
	 for(var i = 1 ; i  < fileArr.length ; i++){
		 if(!isEmpty(fileArr[i])){
			var fileLine = csvDataToArray(fileArr[i].toString());
			nlapiLogExecution('debug', 'fileLine',fileLine);
	        // ���R�[�h����ID
	        var id = fileLine[1];
	        // ���iID
	        var item = fileLine[4];
	        // �ꏊID
	        var locationArea = fileLine[5];
	        // �N
	        var year = fileLine[11];
	        // ��
	        var month = fileLine[12];
	        if(month.length == 1){
	        	month = ('0' + fileLine[12]).substr(-2);
	        }
	        // ��r�^����fc��
	        var fcnum = fileLine[18];
	        // DJ_�S���҃R�[�h����ID
	        var employeeid = fileLine[3];
	        // DJ_�A������ID
	        var subsidiary = fileLine[2];
	        fcDetailsArray.push({
	        	id:id,
	        	item:item,
	        	locationArea:locationArea,
	        	year:year,
	        	month:month,
	        	fcnum:fcnum,
	        	employeeid:employeeid,
	        	subsidiary:subsidiary
	        })
		 } 
	 }	
	 return isEmpty(fcDetailsArray) ? '' : fcDetailsArray;
}
function csvDataToArray(strData) {

    strDelimiter = (",");

    var objPattern = new RegExp(
            ("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");

    var arrData = [[]];

    var arrMatches = null;

    while (arrMatches = objPattern.exec(strData)) {

        var strMatchedDelimiter = arrMatches[1];

        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            arrData.push([]);
        }

        var strMatchedValue = '';
        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

        } else {
            strMatchedValue = arrMatches[3];
        }

        arrData[arrData.length - 1].push(strMatchedValue);
    }

    return (arrData[0]);
}
//������u��
function replace(text)
{
if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/,/g, "_") ;

return text ;
}