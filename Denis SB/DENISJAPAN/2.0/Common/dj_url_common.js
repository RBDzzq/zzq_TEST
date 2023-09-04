/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/format'], function(search, format) {
  //20230413 add by zhou start
    /**
     * request URL取得する
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
    			//SANDBOX固定URLタイトル
    			'URL_HEAD' : 'https://5722722-sb1.app.netsuite.com',
    			//本番固定URLタイトル  'https://5722722.app.netsuite.com',
    			//SANDBOX SECURE固定URLタイトル
    			'SECURE_URL_HEAD' : 'https://5722722-sb1.secure.netsuite.com',
    			//本番 SECURE固定URLタイトル  : 'https://5722722.secure.netsuite.com'
    			//リンクパラメータ 固定URLタイトル:C
    			'URL_PARAMETERS_C' : 'c=5722722_SB1'
    			//本番 SECURE固定URLタイトル:C :'c=5722722&'
	
    	}
		return urlHeadObj;
    }
    
    
    return {
        serverScriptGetUrlHead:serverScriptGetUrlHead,
        clientScriptGetUrlHead:clientScriptGetUrlHead,
        urlHead:urlHead
    };
});
