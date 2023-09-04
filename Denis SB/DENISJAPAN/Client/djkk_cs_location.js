/**
 * 場所のCS
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/22     CPC_苑
 *
 */

function popupbarcode(id) {
	var record=nlapiLoadRecord('location', id);
	var barcode=record.getFieldValue('custrecord_djkk_location_barcode');
	var name=record.getFieldValue('name');
	var barcodepdf=record.getFieldValue('custrecord_djkk_location_barcode_pdf');
	 if(!isEmpty(barcodepdf)){
		 var flurl= nlapiLookupField('file', barcodepdf,'url')
		    var url= 'https://' + URL_HEADER + '.app.netsuite.com/'+flurl;
		    open(url,'_lanedcost','top=150,left=250,width=700,height=700,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no');	    	
	        return ;
	  }	
	var pagereturn ='';
   if(!isEmpty(barcode)){
	   try{
	 var barcodename=name+'場所バーコード' + '_' + getFormatYmdHms() + '.pdf';
	 var savefolder=FILE_CABINET_ID_LOCATION_STORAGE_BARCODE;// 場所/保管棚バーコード
	 var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_creat_barcode', 'customdeploy_djkk_sl_creat_barcode');
     theLink += '&barcode=' + barcode;
     theLink += '&barcodename=' + barcodename;
     theLink += '&savefolder=' + savefolder;
   
     var rse = nlapiRequestURL(theLink);
     pagereturn = rse.getBody();
	   }catch(e){}
	   if(pagereturn!='Error'){
	    	var fileId=parseInt(pagereturn.split('###')[0]);
	    	var url=pagereturn.split('###')[1];
	    	record.setFieldValue('custrecord_djkk_location_barcode_pdf', fileId);
	    	nlapiSubmitRecord(record, false, true);
	    	open(url,'_lanedcost','top=150,left=250,width=700,height=700,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no');
	    	location.href=location.href;
	    }else{
	    	record.setFieldValue('custrecord_djkk_location_barcode_pdf', null);
	    	nlapiSubmitRecord(record, false, true);
	    	location.href=location.href;
	    }
	    
   }else{
   	record.setFieldValue('custrecord_djkk_location_barcode_pdf', null);
   	nlapiSubmitRecord(record, false, true);
   	location.href=location.href;
   }
   return true;
}
