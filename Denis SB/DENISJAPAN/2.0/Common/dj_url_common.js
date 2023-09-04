/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/format'], function(search, format) {
  //20230413 add by zhou start
    /**
     * request URL�擾����
     */
    function serverScriptGetUrlHead(https){
  //    	SL/UE
    	try{
           var url = https.request.url;
           url = JSON.stringify(url);
           var urlToArr = url.split("/app");
           var urlHead = urlToArr[0].replace(new RegExp('"',"g"),"");
           //It looks like :  https://5722722.app.netsuite.com
           if(urlHead){
        	   return urlHead;
           }
    	}catch(e){}
           return null;
    }
    function clientScriptGetUrlHead(){
    	try{
    		 var url = JSON.stringify(window.location.href);
    	     var urlToArr = url.split("/app");
    	     var urlHead = urlToArr[0].replace(new RegExp('"',"g"),"");
           //It looks like :  https://5722722.app.netsuite.com
           if(urlHead){
        	   return urlHead;
           }
    	}catch(e){}
           return null;
    }
    //20230413 add by zhou end
    function urlHead(){
    	var urlHeadObj = {
    			//SANDBOX�Œ�URL�^�C�g��
    			'URL_HEAD' : 'https://5722722-sb1.app.netsuite.com',
    			//�{�ԌŒ�URL�^�C�g��  'https://5722722.app.netsuite.com',
    			//SANDBOX SECURE�Œ�URL�^�C�g��
    			'SECURE_URL_HEAD' : 'https://5722722-sb1.secure.netsuite.com',
    			//�{�� SECURE�Œ�URL�^�C�g��  : 'https://5722722.secure.netsuite.com'
    			//�����N�p�����[�^ �Œ�URL�^�C�g��:C
    			'URL_PARAMETERS_C' : 'c=5722722_SB1'
    			//�{�� SECURE�Œ�URL�^�C�g��:C :'c=5722722&'
	
    	}
		return urlHeadObj;
    }
    
    
    return {
        serverScriptGetUrlHead:serverScriptGetUrlHead,
        clientScriptGetUrlHead:clientScriptGetUrlHead,
        urlHead:urlHead
    };
});
