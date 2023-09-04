/**
 * 出荷管理バーコード
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/26     CPC_苑
 *
 */
/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	var handyType = request.getParameter('handyType');
	var soNumber = request.getParameter('soNumber');
	
	// 出荷管理.ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞ 注文書番号スキャン
	if(handyType=='soNumberScan'){
		if(!isEmpty(soNumber)){
			var transactionSearch = nlapiSearchRecord("inventorydetail",null,
					[
					   ["transaction.type","anyof","SalesOrd"], 
					   "AND", 
					   ["transaction.numbertext","is",soNumber], 
					   "AND", 
					   ["transaction.status","anyof","SalesOrd:B","SalesOrd:E","SalesOrd:D"], 
					   "AND", 
					   ["formulanumeric: {transaction.quantity}-{transaction.quantityshiprecv}","greaterthanorequalto","0"]
					], 
					[
					   new nlobjSearchColumn("subsidiary","transaction",null), 
					   new nlobjSearchColumn("internalid","transaction",null), 
					   new nlobjSearchColumn("line","transaction",null).setSort(false), 
					   new nlobjSearchColumn("item","transaction",null), 
					   new nlobjSearchColumn("internalid","location",null), 
					   new nlobjSearchColumn("internalid","binNumber",null), 
					   new nlobjSearchColumn("inventorynumber").setSort(false), 
					   new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  {inventorydetaillines.custrecord_djkk_maker_serial_code} is null THEN {inventorydetaillines.custrecord_djkk_control_number} ELSE {inventorydetaillines.custrecord_djkk_maker_serial_code} END"), 
					   new nlobjSearchColumn("expirationdate"), 
					   new nlobjSearchColumn("quantity"), 
					   new nlobjSearchColumn("formulanumeric").setFormula("{transaction.quantity}-{transaction.quantityshiprecv}"),
					   new nlobjSearchColumn("internalid","inventoryNumber",null),
					   new nlobjSearchColumn("displayname","item",null), 
					   new nlobjSearchColumn("upccode","item",null), 
					   new nlobjSearchColumn("islotitem","item",null), 
					   new nlobjSearchColumn("isserialitem","item",null),
					   new nlobjSearchColumn("quantity","transaction",null),					
					   new nlobjSearchColumn("quantityuom","transaction",null),		
					   new nlobjSearchColumn("quantitypicked","transaction",null),					
					   new nlobjSearchColumn("formulanumeric").setFormula("({quantity}-{transaction.quantityshiprecv})/({transaction.quantity}/{transaction.quantityuom})"),
					   new nlobjSearchColumn("formulanumeric1").setFormula("({transaction.quantity}-{transaction.quantitypicked})/({transaction.quantity}/{transaction.quantityuom})"),
					   new nlobjSearchColumn("formulanumeric2").setFormula("({transaction.quantity}/{transaction.quantityuom})"),
					   new nlobjSearchColumn("vendorname","item",null)



					]
					);
			if(!isEmpty(transactionSearch)){

				var columnID = transactionSearch[0].getAllColumns();
				var jsonObj = '{';
				var subsidiary=transactionSearch[0].getValue(columnID[0]);
				//jsonObj+= '"subsidiary":"';
				//jsonObj+=subsidiary+'"';
				//var filters=[["subsidiary","anyof",subsidiary]];
				
				jsonObj+= '"soId":"';
				jsonObj+=transactionSearch[0].getValue(columnID[1])+'"';
				
			//	jsonObj+= ',"locations":';
			//	jsonObj=getListToJson("location", jsonObj, filters,'custrecord_djkk_location_barcode','name');
				
			//	jsonObj+= ',"bins":';
			//	jsonObj=getListToJson("bin", jsonObj, null,'custrecord_djkk_bin_barcode','binnumber');
				
			//	jsonObj+= ',"employees":';
			//	jsonObj=getListToJson("employee", jsonObj, null,'custentity_djkk_employee_id','entityid');
												
				// soLine
				jsonObj+= ',"soLine":[';
				for(var i=0;i<transactionSearch.length;i++){
					jsonObj+='{';
					var lineId= transactionSearch[i].getValue(columnID[2]);
		            jsonObj+='"lineId":"'+lineId+'",';
		            
		            var itemId= transactionSearch[i].getText(columnID[3]);
					jsonObj+='"itemId":"'+itemId+'",';
					
					var itemName= transactionSearch[i].getValue(columnID[12]);
					jsonObj+='"itemName":"'+itemName+'",';
											               
					var itemInternalid= transactionSearch[i].getValue(columnID[3]);
					jsonObj+='"itemInternalid":"'+itemInternalid+'",';
					
	                var locationId=transactionSearch[i].getValue(columnID[4]);
	                jsonObj+='"locationId":"'+locationId+'",';
	                
	                var gs1Id='(01)';	                
	                var jancode=transactionSearch[i].getValue(columnID[13]);
	                gs1Id+=jancode;
	                var expirationdate= transactionSearch[i].getValue(columnID[8]);
	                gs1Id+='(17)';
	                if(isEmpty(expirationdate)){
	                	gs1Id+='XXXXXX';
	                	}else{
	                	gs1Id+=((expirationdate.replace("/","")).replace("/","")).substring(2,8);
	                }
//	                gs1Id+=((expirationdate.replace("/","")).replace("/","")).substring(2,8);
	                var islot=transactionSearch[i].getValue(columnID[14]);
	                var isSiro=transactionSearch[i].getValue(columnID[15]);
	                if(islot=='T'){
	                gs1Id+='(10)';
	                }else if(isSiro=='T'){
	                gs1Id+='(20)';
	                }
	                var makerLotNumber= transactionSearch[i].getValue(columnID[7]);
	                gs1Id+=makerLotNumber;
	                
	                jsonObj+='"gs1Id":"'+gs1Id+'",';
	                var binId=transactionSearch[i].getValue(columnID[5]);
	                jsonObj+='"binId":"'+binId+'",';
	                nlapiLogExecution('debug', 'binId', binId);
	                
	                var lotNumber= transactionSearch[i].getText(columnID[6]);
	                jsonObj+='"lotNumber":"'+lotNumber+'",';
	                
	                var lotInternalid= transactionSearch[i].getValue(columnID[11]);
	                jsonObj+='"lotInternalid":"'+lotInternalid+'",';
	                	                
	                jsonObj+='"makerLotNumber":"'+makerLotNumber+'",';
	                	                
	                jsonObj+='"expirationdate":"'+expirationdate+'",';
	             // 20230224 modify by lj start
	                var soInvQuantity1= transactionSearch[i].getValue(columnID[9]);
	                jsonObj+='"soInvQuantity1":"'+soInvQuantity1+'",';

	                var soInvQuantity= transactionSearch[i].getValue(columnID[20]);
	                jsonObj+='"soInvQuantity":"'+soInvQuantity+'",';
	                
	                var quantity= transactionSearch[i].getValue(columnID[16]);
	                jsonObj+='"quantity":"'+quantity+'",';
	                
	                var quantityuom= transactionSearch[i].getValue(columnID[17]);
	                jsonObj+='"quantityuom":"'+quantityuom+'",';
	                
	                var quantityshiprecv= transactionSearch[i].getValue(columnID[18]);
	                jsonObj+='"quantityshiprecv":"'+quantityshiprecv+'",';
	                
	                var unitQuantity= transactionSearch[i].getValue(columnID[21]);
	                jsonObj+='"unitQuantity":"'+unitQuantity+'",';
	                
//	                var soNeedQuantity= transactionSearch[i].getValue(columnID[10]);
	                var soNeedQuantity= transactionSearch[i].getValue(columnID[19]);
	                
	                var vendorname= transactionSearch[i].getValue(columnID[22]);
	                jsonObj+='"vendorname":"'+vendorname+'",';
	                // 20230224 by lj end
	                jsonObj+='"soNeedQuantity":"'+soNeedQuantity+'"';
	                jsonObj+='}';
	                if(i!=transactionSearch.length-1){
	        			jsonObj +=",";
	        			}
				}								                
                jsonObj+=']';
                jsonObj+='}';                			                
                response.write(jsonObj); 
                nlapiLogExecution('debug', 'jsonObj', jsonObj);
			}else{
		response.write('ERROR:この注文書番号は存在しません');	
			}
		}else{
		response.write('ERROR:注文書番号は空にできません');
		}
	}
	
	// 出荷管理.ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞ「確定｣ボタンを押す
	else if(handyType=='SoCommitCheck'){
        nlapiLogExecution('debug', 'SoCommitCheck');
		var soId = request.getParameter('soId');
		var handyPickingUserId = request.getParameter('userId');
		var sodetail=request.getParameter('sodetail');
		var sodetailArray=new Array();
		nlapiLogExecution('debug', 'accessSoCommitCheck');
		nlapiLogExecution('debug','sodetail' ,sodetail);
		nlapiLogExecution('debug', 'sodetail.length',sodetail.length);
		if(!isEmpty(sodetail)){
			nlapiLogExecution('debug', 'accessSoCommitCheckIsEmpty');
			sodetail=decodeURIComponent(sodetail);
			sodetailArray= eval("(" + sodetail + ")");
		}
		nlapiLogExecution('debug', 'soId', soId);
		nlapiLogExecution('debug', 'handyPickingUserId', handyPickingUserId);
		nlapiLogExecution('debug', 'sodetail', sodetail);
		var backFlag=newCreatItemfulfillment(soId,handyPickingUserId,sodetailArray['sodetail']);
        response.write(backFlag);
	}
	
	// シングルピッキングの配送伝票の一覧
	else if(handyType=='pickingCheckList'){
        nlapiLogExecution('debug', 'pickingCheckList');

		var itemfulfillmentSearch = nlapiSearchRecord("itemfulfillment",null,
				[
				   ["type","anyof","ItemShip"], 
				   "AND", 
				   ["status","anyof","ItemShip:B"]
				], 
				[
				   new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("{createdfrom.tranid}||'-'||{tranid}"), 
				   new nlobjSearchColumn("internalid",null,"GROUP")
				]
				);
		if(!isEmpty(itemfulfillmentSearch)){
			var columnID = itemfulfillmentSearch[0].getAllColumns();
			var jsonObj = '{';
			jsonObj+='"pickingList":[';
			for(var i=0;i<itemfulfillmentSearch.length;i++){
				jsonObj+='{';
				var displayName=itemfulfillmentSearch[i].getValue(columnID[0]);
				var internalid=itemfulfillmentSearch[i].getValue(columnID[1]);
				jsonObj+= '"displayName":"';
				jsonObj+=displayName+'",';
				jsonObj+= '"internalid":"';
				jsonObj+=internalid+'"';
				jsonObj+='}';
				if(i!=itemfulfillmentSearch.length-1){
        			jsonObj +=",";
        			}
			}
			jsonObj+=']}';                			                
            response.write(jsonObj);  			
		}else{
			 response.write('ERROR:シングルピッキングの配送伝票の一覧は空にできません');  
		}
	}
	
	// 配送番号の一覧
	else if(handyType=='pickingCheck'){
        nlapiLogExecution('debug', 'pickingCheck');

		var itemfulfillmentInternalid = request.getParameter('itemfulfillmentInternalid');
		var transactionSearch = nlapiSearchRecord("inventorydetail",null,
				[
				   ["transaction.type","anyof","ItemShip"], 
				   "AND", 
				   ["transaction.internalid","anyof",itemfulfillmentInternalid]
				], 
				[
				   new nlobjSearchColumn("name","location",null), 
				   new nlobjSearchColumn("item","transaction",null), 
				   new nlobjSearchColumn("formulatext").setFormula("CASE WHEN  {inventorydetaillines.custrecord_djkk_maker_serial_code} is null THEN {inventorydetaillines.custrecord_djkk_control_number} ELSE {inventorydetaillines.custrecord_djkk_maker_serial_code} END"), 
				   new nlobjSearchColumn("expirationdate"), 
				   new nlobjSearchColumn("quantity")
				]
				);
		if(!isEmpty(transactionSearch)){

			var columnID = transactionSearch[0].getAllColumns();
			var jsonObj = '{';
			var location=transactionSearch[0].getValue(columnID[0]);
			jsonObj+= '"location":"';
			jsonObj+=location+'"';
	
			// itemfulfillmentLine
			jsonObj+= ',"itemfulfillmentLine":[';
			for(var i=0;i<transactionSearch.length;i++){
				jsonObj+='{';			
				var itemName= transactionSearch[i].getText(columnID[1]);
				jsonObj+='"itemName":"'+itemName+'",';
               
                var makerLotNumber= transactionSearch[i].getValue(columnID[2]);
                jsonObj+='"makerLotNumber":"'+makerLotNumber+'",';
                
                var expirationdate= transactionSearch[i].getValue(columnID[3]);
                jsonObj+='"expirationdate":"'+expirationdate+'",';
                
                var poInvQuantity= transactionSearch[i].getValue(columnID[4]);
                jsonObj+='"poInvQuantity":"'+poInvQuantity+'"';              
                jsonObj+='}';
                if(i!=transactionSearch.length-1){
        			jsonObj +=",";
        			}
			}								                
            jsonObj+=']';
            jsonObj+='}';                			                
            response.write(jsonObj);    							
		}
		else{
	response.write('ERROR:この配送番号は存在しません');	
		}	
	}
	
	// 出荷管理.出荷検品 ﾞ「確定｣ボタンを押す
	else if(handyType=='shippingUpdate'){
		nlapiLogExecution('debug', 'shippingUpdate');
		var sodetail = request.getParameter('sodetail');
		var list = JSON.parse(sodetail)
		var falg='';
		var handyCheckUserId = request.getParameter('userId');
		try{
			for (var i = 0; i < list.length; i++) {
				nlapiLogExecution('debug', '出荷検品access2',list[i]);
				nlapiLogExecution('debug', '出荷検品access3',handyCheckUserId);
				nlapiSubmitField('itemfulfillment', list[i], ['shipstatus','custbody_djkk_handy_check_userid'], ['C',handyCheckUserId]);
			}
			falg='T';
		}catch(e){
			falg=e;
		}
		 response.write(falg);
	}
	// 20230222 add by lj start
	else if(handyType=='itemfulfillmentGet'){
        nlapiLogExecution('debug', 'itemfulfillmentGet');
        nlapiLogExecution('debug', 'soId',soId);
		var soId = request.getParameter('soId');
		if(!isEmpty(soId)){
			 var itemfulfillmentSearch = nlapiSearchRecord("itemfulfillment",null,
             		[
						["type","anyof","ItemShip"], 
						"AND", 
						["status","anyof","ItemShip:B"],
//						"AND", 
//						["mainline","is","T"], 
						 "AND", 
						   ["item","noneof","@NONE@"],
						"AND", 
						["createdfrom","anyof",soId]             		
					], 
             		[
	 				   new nlobjSearchColumn("item","inventoryDetail","GROUP"), 
             		   new nlobjSearchColumn("binnumber","inventoryDetail","GROUP"), 
	 				   new nlobjSearchColumn("quantity","inventoryDetail","GROUP"),
           			   new nlobjSearchColumn("internalid",null,"GROUP"),
     				   new nlobjSearchColumn("serialnumbers",null,"GROUP"), 
					   new nlobjSearchColumn("custbody_djkk_handy_picking_userid",null,"GROUP"),
					   new nlobjSearchColumn("inventorynumber","inventoryDetail","GROUP"),
	 				   new nlobjSearchColumn("quantityuom",null,"GROUP"),

             		]
             		);
         	if(!isEmpty(itemfulfillmentSearch)){
             	var columnID = itemfulfillmentSearch[0].getAllColumns();
    			var jsonObj = '{';
    			var item=itemfulfillmentSearch[0].getValue(columnID[0]);
    	
    			// itemfulfillmentLine
    			jsonObj+= '"itemfulfillmentLine":[';
    			for(var i=0;i<itemfulfillmentSearch.length;i++){
    				jsonObj+='{';			
    				var item= itemfulfillmentSearch[i].getValue(columnID[0]);
    				jsonObj+='"itemId":"'+item+'",';
                   
    				
                    var goodsShelf= itemfulfillmentSearch[i].getText(columnID[1]);
                    jsonObj+='"goodsShelf":"'+goodsShelf+'",';
                    
//                    var quantityuom= itemfulfillmentSearch[i].getValue(columnID[2]);
//                    jsonObj+='"quantityuom":"'+quantityuom+'",';    
	                var quantityuom=itemfulfillmentSearch[i].getValue(columnID[7]);
	                jsonObj+='"quantityuom":"'+quantityuom+'",';
	                
	                var serialnumbers=itemfulfillmentSearch[i].getValue(columnID[4]);
	                jsonObj+='"serialnumbers":"'+serialnumbers+'",';
	                
	                var pickingUserId=itemfulfillmentSearch[i].getValue(columnID[5]);
	                jsonObj+='"pickingUserId":"'+pickingUserId+'",';

	                var lotInternalid=itemfulfillmentSearch[i].getValue(columnID[6]);
	                jsonObj+='"lotInternalid":"'+lotInternalid+'",';
	                
	                var lotNumber=itemfulfillmentSearch[i].getText(columnID[6]);
	                jsonObj+='"lotNumber":"'+lotNumber+'",';
	                
                    var internalid= itemfulfillmentSearch[i].getValue(columnID[3]);
                    jsonObj+='"internalid":"'+internalid+'"';  
                    
                    jsonObj+='}';
                    if(i!=itemfulfillmentSearch.length-1){
            			jsonObj +=",";
            		}
    			}					    
                jsonObj+=']';
                jsonObj+='}';                			                
                response.write(jsonObj);    
         	}else{
    			response.write('{"itemfulfillmentLine":[]}');
         	}
         	
		}else{
			response.write('ERROR:注文書番号は空にできません');
		}
	}
	else if (handyType=='itemfulfillmentCheck'){
        nlapiLogExecution('debug', 'itemfulfillmentCheck');

		var item = request.getParameter('item');
		var location = request.getParameter('location');
		var serialnumber = request.getParameter('serialnumber');
		var binnumber = request.getParameter('binnumber');
		var createdfrom = request.getParameter('createdfrom');
		
		
 		var itemfulfillmentSearch = nlapiSearchRecord("itemfulfillment",null,
 				[
 				   ["type","anyof","ItemShip"], 
 				   "AND", 
 				   ["item","anyof",item], 
 				   "AND", 
 				   ["location.internalid","anyof",location], 
 				   "AND", 
 				   ["serialnumber","is",serialnumber], 
 				   "AND", 
 				   ["binNumber.internalid","is",binnumber], 
 				   "AND", 
 				   ["createdfrom","anyof",createdfrom],
 				   "AND", 
				   ["inventoryDetail.quantity","greaterthan","0"]
 				], 
 				[
 				   new nlobjSearchColumn("serialnumbers",null,"GROUP"), 
 				   new nlobjSearchColumn("item","inventoryDetail","GROUP"), 
 				   new nlobjSearchColumn("binnumber","inventoryDetail","GROUP"), 
 				   new nlobjSearchColumn("location","inventoryDetail","GROUP"), 
 				   new nlobjSearchColumn("quantity","inventoryDetail","SUM")
 				]
 				);
 		if(!isEmpty(itemfulfillmentSearch)){
			var jsonObj = '{"type":"itemfulfillmentCheck",';
         	var columnID = itemfulfillmentSearch[0].getAllColumns();
	
			jsonObj+= '"result":[';
			for(var i=0;i<itemfulfillmentSearch.length;i++){
				jsonObj+='{';			
				var serialnumbers= itemfulfillmentSearch[i].getValue(columnID[0]);
				jsonObj+='"serialnumbers":"'+serialnumbers+'",';
				
                var item= itemfulfillmentSearch[i].getValue(columnID[1]);
                jsonObj+='"item":"'+item+'",';
                
                var binnumber= itemfulfillmentSearch[i].getValue(columnID[2]);
                jsonObj+='"binnumber":"'+binnumber+'",';
                
                var location= itemfulfillmentSearch[i].getValue(columnID[3]);
                jsonObj+='"location":"'+location+'",';    
                
                var quantity= itemfulfillmentSearch[i].getValue(columnID[4]);
                jsonObj+='"quantity":"'+quantity+'"';  
                
                jsonObj+='}';
                if(i!=itemfulfillmentSearch.length-1){
        			jsonObj +=",";
        		}
			}					    
            jsonObj+=']';
            jsonObj+='}';                			                
            response.write(jsonObj);   
    	 // 20230222 add by lj end			
     	}else{
			response.write('{"type":"itemfulfillmentCheck","result":[]}');
     	}
 	}
	else if(handyType=='binNumberCheck'){
        nlapiLogExecution('debug', 'binNumberCheck');

		var itemId = request.getParameter('itemId');
		var location = request.getParameter('location');
		var transactionSearch = nlapiSearchRecord("inventorynumberbin",null,
				[
				   ["quantityonhand","greaterthan","0"], 
				   "AND", 
				   ["location.isinactive","is","F"], 
				   "AND", 
				   ["inventorynumber.isonhand","is","T"], 
				   "AND", 
				   ["inventorynumber.location","anyof",location], 
				   "AND", 
				   ["inventorynumber.item","anyof",itemId], 
				   "AND", 
				   ["inventorynumber.quantityonhand","greaterthan","0"]
//				   ["inventorynumber.quantityavailable","greaterthan","0"]
				], 
				[
				   new nlobjSearchColumn("binnumber").setSort(false), 
				   new nlobjSearchColumn("inventorynumber").setSort(false), 
				   new nlobjSearchColumn("location"), 
				   new nlobjSearchColumn("quantityonhand","inventoryNumber",null), 
				   new nlobjSearchColumn("quantityavailable","inventoryNumber",null), 
				   new nlobjSearchColumn("quantityintransit","inventoryNumber",null), 
				   new nlobjSearchColumn("item","inventoryNumber",null), 
				   new nlobjSearchColumn("custitemnumber_djkk_maker_serial_number","inventoryNumber",null), 
				   new nlobjSearchColumn("internalid","inventoryNumber",null), 
				   new nlobjSearchColumn("location","inventoryNumber",null), 
				   new nlobjSearchColumn("isonhand","inventoryNumber",null), 
				   new nlobjSearchColumn("expirationdate","inventoryNumber",null), 
				   new nlobjSearchColumn("quantityonorder","inventoryNumber",null), 
				   new nlobjSearchColumn("inventorynumber","inventoryNumber",null)
				]
				);
		var jsonObj = '{"type":"binNumberCheck","result":[';
		if(!isEmpty(transactionSearch)){
			var columnID = transactionSearch[0].getAllColumns();
			for(var i=0;i<transactionSearch.length;i++){
		        jsonObj+='{';    
				var inventorynumber= transactionSearch[i].getValue(columnID[1]);
	            jsonObj+='"inventorynumber":"'+inventorynumber+'",';
	            
				var location= transactionSearch[i].getValue(columnID[2]);
				jsonObj+='"location":"'+location+'",';
				
				var quantityavailable= transactionSearch[i].getValue(columnID[3]);
				jsonObj+='"quantityavailable":"'+quantityavailable+'",';
				
				var binNumberId= transactionSearch[i].getValue(columnID[0]);
				jsonObj+='"binNumberId":"'+binNumberId+'"';
	                     
	
	            jsonObj+='}';
	            if(i!=transactionSearch.length-1){
	    			jsonObj +=",";
	    			}
			}								                

		}
        jsonObj+=']}';
        response.write(jsonObj);  
	}
	else{
		response.write('ERROR:handyスキャンを使用してください');
	}	
		
}

function newCreatItemfulfillment(soId,handyPickingUserId,sodetailArray) {
	nlapiLogExecution('debug', 'newCreatItemfulfillment');
try {
	
	//注文書明細場所の抽出
	nlapiLogExecution('debug', 'soId',soId);
	nlapiLogExecution('debug', 'handyPickingUserId',handyPickingUserId);
	nlapiLogExecution('debug', 'sodetailArray',sodetailArray);
	var soDetailLocation = [];//注文書明細場所arr
	for (var so = 0; so < sodetailArray.length; so++) {
		var itemArray=sodetailArray[so]['itl'];
		for(var soit =0;soit<itemArray.length;soit++){
			var loctionId = itemArray[soit]['li'];//注文書明細場所
			if(soDetailLocation.indexOf(loctionId) == -1){//重複除外
				soDetailLocation.push(loctionId);
			}
		}
	}
	var run = false;

	//配送の作成
	for( var arr = 0 ; arr < soDetailLocation.length; arr++){
		nlapiLogExecution('debug', 'arr',arr);
		if(run == false){
		var locationFormSoDetail = soDetailLocation[arr];//現在の注文書明細の場所
		var itemfulfillmentRecord = nlapiTransformRecord('salesorder',soId, 'itemfulfillment',{inventorylocation:locationFormSoDetail});//todo
		nlapiLogExecution('debug', 'locationFormSoDetail',locationFormSoDetail);
			itemfulfillmentRecord.setFieldValue('shipstatus', 'B');//梱包済
//			nlapiLogExecution('debug', 'access1');
			itemfulfillmentRecord.setFieldValue('custbody_djkk_handy_picking_userid', handyPickingUserId);//DJ_出荷検品の従業員コード
//			nlapiLogExecution('debug', 'access2');
		
		var count = itemfulfillmentRecord.getLineItemCount('item');
//		nlapiLogExecution('debug', 'access3');
		nlapiLogExecution('debug', 'count',count);
		var checkonarray=new Array();
//		nlapiLogExecution('debug', 'access4');
		for (var w = 1; w < count + 1; w++) {
			itemfulfillmentRecord.selectLineItem('item', w);
			for (var i = 0; i < sodetailArray.length; i++) {
				var itemArray=sodetailArray[i]['itl'];
				for(var j=0;j<itemArray.length;j++){
					var solineId = itemArray[j]['si'];
					var itemId = itemArray[j]['it'];
					var loctionId = itemArray[j]['li'];
					var lineQuantity= itemArray[j]['lq'];
//					nlapiLogExecution('debug','in 2', itemfulfillmentRecord.getCurrentLineItemValue('item', 'orderline'));
//					nlapiLogExecution('debug', 'in 3',itemfulfillmentRecord.getCurrentLineItemValue('item', 'item'));
//					nlapiLogExecution('debug','in 2/',solineId);
//					nlapiLogExecution('debug', 'in 3/',itemId);
					if(loctionId == locationFormSoDetail
					){
						nlapiLogExecution('debug', 'in 4',loctionId);
					}
					if(itemfulfillmentRecord.getCurrentLineItemValue('item', 'orderline')==solineId
							&&itemfulfillmentRecord.getCurrentLineItemValue('item', 'item')==itemId
							&& loctionId == locationFormSoDetail
					){
						nlapiLogExecution('debug', 'in');
						checkonarray.push(w);
						itemfulfillmentRecord.setCurrentLineItemValue('item', 'itemreceive','T');
						if(itemfulfillmentRecord.getCurrentLineItemValue('item', 'location')!=loctionId){
							itemfulfillmentRecord.setCurrentLineItemValue('item', 'location',loctionId);
						}
						if(itemfulfillmentRecord.getCurrentLineItemValue('item', 'quantity')!=lineQuantity){
							itemfulfillmentRecord.setCurrentLineItemValue('item', 'quantity',lineQuantity);
						}
						var inventorydetailArray=itemArray[j]['ivd'];
						var createFlag=false;
						var subrecord2 = itemfulfillmentRecord.editCurrentLineItemSubrecord('item', 'inventorydetail');
						if(isEmpty(subrecord2)){
							createFlag=true;
							subrecord2=itemfulfillmentRecord.createCurrentLineItemSubrecord('item', 'inventorydetail');
						}
						for(var s=0;s<inventorydetailArray.length;s++){
							var binId = inventorydetailArray[s]['bi'];
							nlapiLogExecution('debug', 'binId',binId);
							var lotInternalid = inventorydetailArray[s]['ld'];
							var makerLotSerialNumber = inventorydetailArray[s]['mn'];
							var expirationdate = inventorydetailArray[s]['ed'];
							var inventoryQuantity = inventorydetailArray[s]['iq'];
							if(createFlag){
								subrecord2.selectNewLineItem('inventoryassignment');
							}else{
								subrecord2.selectLineItem('inventoryassignment', s+1);
							}
							
							
							// 在庫番号を設定する
							
							//20230117 add by zhou start
							var lookupLotRecord = nlapiLookupField('inventorynumber',lotInternalid,//在庫番号field value search
									[
									 'expirationdate',//有効期限
							         'custitemnumber_djkk_maker_serial_number',//DJ_メーカー製造ロット
							         'custitemnumber_djkk_make_date',//DJ_製造年月日
							         'custitemnumber_djkk_shipment_date',//DJ_出荷可能期限日
							         'custitemnumber_djkk_warehouse_number',//DJ_倉庫入庫番号
							         'custitemnumber_djkk_smc_nmuber',//DJ_SMC番号
							         'custitemnumber_djkk_lot_memo',//DJ_ロットメモ	
							         'custitemnumber_djkk_control_number',//DJ_メーカーシリアル番号
							         'custitemnumber_djkk_lot_remark'//DJ_ロットリマーク
							         ])
	    				    expirationdate = defaultEmpty(lookupLotRecord.expirationdate);
	    				    var makernum = defaultEmpty(lookupLotRecord.custitemnumber_djkk_maker_serial_number);
	    				    var madedate = defaultEmpty(lookupLotRecord.custitemnumber_djkk_make_date);
	    				    var deliveryperiod = defaultEmpty(lookupLotRecord.custitemnumber_djkk_shipment_date);
	    				    var warehouseCode = defaultEmpty(lookupLotRecord.custitemnumber_djkk_warehouse_number);
	    				    var smc = defaultEmpty(lookupLotRecord.custitemnumber_djkk_smc_nmuber);
	    				    var lotMemo =  defaultEmpty(lookupLotRecord.custitemnumber_djkk_lot_memo);
	    				    var controlNumber =  defaultEmpty(lookupLotRecord.custitemnumber_djkk_control_number);
	      				    var lotRemark =  defaultEmpty(lookupLotRecord.custitemnumber_djkk_lot_remark);
	      				    //end
	      				    
							subrecord2.setCurrentLineItemValue('inventoryassignment','issueinventorynumber', lotInternalid);
							nlapiLogExecution('debug', 'binIdAccessBefore');
							nlapiLogExecution('debug', 'binId',binId);
							nlapiLogExecution('debug', 'binNumber',subrecord2.getCurrentLineItemValue('inventoryassignment','binnumber'));
//							if(!isEmpty(binId)&&subrecord2.getCurrentLineItemValue('inventoryassignment','binnumber')!=binId){
								if(!isEmpty(binId)){
								subrecord2.setCurrentLineItemValue('inventoryassignment','binnumber',binId);
								nlapiLogExecution('debug', 'binIdAccessIn');
							}
							nlapiLogExecution('debug', 'binIdAccessAfter');
							
							//20230117 add by zhou start
							subrecord2.setCurrentLineItemValue('inventoryassignment','expirationdate', expirationdate);
							subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_maker_serial_code', makernum);
							subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_make_ymd', madedate);
							subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_shipment_date', deliveryperiod);
							subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_warehouse_code', warehouseCode);
							subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_smc_code', smc);
							subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_lot_memo', lotMemo);
							subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_control_number',controlNumber);
							subrecord2.setCurrentLineItemText('inventoryassignment','custrecord_djkk_lot_remark', lotRemark);
							//end
							subrecord2.setCurrentLineItemValue('inventoryassignment','quantity', inventoryQuantity);
							subrecord2.commitLineItem('inventoryassignment');
						}
						subrecord2.commit();
						itemfulfillmentRecord.commitLineItem('item');
						nlapiLogExecution('debug', 'access5','access5');
					}														
				}
			}
		}
		for (var q = 1; q < count + 1; q++) {
			if(checkonarray.indexOf(q) < 0){
			itemfulfillmentRecord.selectLineItem('item', q);			
			itemfulfillmentRecord.setCurrentLineItemValue('item','itemreceive', 'F');
			itemfulfillmentRecord.removeCurrentLineItemSubrecord('item', 'inventorydetail');
			itemfulfillmentRecord.commitLineItem('item');
			}
		}
		var itemreceiptId = nlapiSubmitRecord(itemfulfillmentRecord, false,true);
		}
	}
	
//	var soLocation = nlapiLookupField('salesorder', soId, 'location');
//	nlapiLogExecution('debug', 'access0.5',soLocation);
//	var itemfulfillmentRecord = nlapiTransformRecord('salesorder',soId, 'itemfulfillment',{inventorylocation:1205});//todo
//	nlapiLogExecution('debug', 'access1');
//		itemfulfillmentRecord.setFieldValue('shipstatus', 'B');
//		nlapiLogExecution('debug', 'access1');
//		itemfulfillmentRecord.setFieldValue('custbody_djkk_handy_picking_userid', handyPickingUserId);
//		nlapiLogExecution('debug', 'access2');
//	
//	var count = itemfulfillmentRecord.getLineItemCount('item');
//	nlapiLogExecution('debug', 'access3');
//
//	for (var q = 1; q < count + 1; q++) {
//		itemfulfillmentRecord.selectLineItem('item', q);			
//		itemfulfillmentRecord.setCurrentLineItemValue('item','itemreceive', 'F');
//		itemfulfillmentRecord.removeCurrentLineItemSubrecord('item', 'inventorydetail');
//		itemfulfillmentRecord.commitLineItem('item');
//	}
//	nlapiLogExecution('debug', 'access4');
//	for (var w = 1; w < count + 1; w++) {
//		itemfulfillmentRecord.selectLineItem('item', w);
//		for (var i = 0; i < sodetailArray.length; i++) {
//			var itemArray=sodetailArray[i]['itl'];
//			for(var j=0;j<itemArray.length;j++){
//				var solineId = itemArray[j]['si'];
//				var itemId = itemArray[j]['it'];
//				if(itemfulfillmentRecord.getCurrentLineItemValue('item', 'orderline')==solineId
//						&&itemfulfillmentRecord.getCurrentLineItemValue('item', 'item')==itemId){
//					
//					var loctionId = itemArray[j]['li'];
//					var lineQuantity= itemArray[j]['lq'];
//					itemfulfillmentRecord.setCurrentLineItemValue('item', 'itemreceive','T');
//					itemfulfillmentRecord.setCurrentLineItemValue('item', 'location',loctionId);
//					itemfulfillmentRecord.setCurrentLineItemValue('item', 'quantity',lineQuantity);
//					
//					var inventorydetailArray=itemArray[j]['ivd'];
//					var subrecord2 = itemfulfillmentRecord.createCurrentLineItemSubrecord('item', 'inventorydetail');
//
//					for(var s=0;s<inventorydetailArray.length;s++){
//						var binId = inventorydetailArray[s]['bi'];
//						var lotInternalid = inventorydetailArray[s]['ld'];
//						nlapiLogExecution('debug', 'access4.5',lotInternalid);
//						var makerLotSerialNumber = inventorydetailArray[s]['mn'];
//						var expirationdate = inventorydetailArray[s]['ed'];
//						var inventoryQuantity = inventorydetailArray[s]['iq'];
//						if (s == 0) {
//							subrecord2.selectNewLineItem('inventoryassignment');
//						}else{
//							subrecord2.selectLineItem('inventoryassignment', s);
//						}
//						// 在庫番号を設定する
//						
//						subrecord2.setCurrentLineItemValue('inventoryassignment','issueinventorynumber', lotInternalid);
//						if(!isEmpty(binId)){
//						subrecord2.setCurrentLineItemValue('inventoryassignment','binnumber',binId);
//						}
//						subrecord2.setCurrentLineItemValue('inventoryassignment','quantity', inventoryQuantity);
//						subrecord2.commitLineItem('inventoryassignment');
//					} 
//					subrecord2.commit();
//					itemfulfillmentRecord.commitLineItem('item');
//					nlapiLogExecution('debug', 'access5','access5');
//				}										
//			}							
//		}
//	}	
//	var itemreceiptId = nlapiSubmitRecord(itemfulfillmentRecord, false,true);
	return 'T';

	

} catch (e) {
	nlapiLogExecution('debug', 'error', e);
	return  e;
}
}

function getListToJson(listId, jsonObj,filters,key,value) {
	jsonObj+="[";
	var Search= nlapiSearchRecord(listId,null,filters, 
    		[
    		  new nlobjSearchColumn(key), 
    		   new nlobjSearchColumn(value),
    		   new nlobjSearchColumn('internalid')
    		   
    		]
    		);
	if (!isEmpty(Search)) {
		for (var i = 0; i < Search.length; i++) {
			jsonObj +='{"key":"'+Search[i].getValue(key)+'",';
			jsonObj +='"value":"'+Search[i].getValue(value)+'",';
			jsonObj +='"internalid":"'+Search[i].getValue('internalid')+'"}'; 
			if(i!=Search.length-1){
			jsonObj +=",";
			}
		}
	}
	jsonObj+="]";
	return jsonObj;
}

function handyDateToString(date) {
	if(!isEmpty(date)){
		var year=date.slice(0,4);
	    var month=Number(date.slice(4,6))-1;
	    var day=date.slice(6,8);
	    var dateExpiry  = new Date();
        dateExpiry.setFullYear(year, month, day);
        date=nlapiDateToString(dateExpiry);
		}
	return date;
}

///**
// * @param {nlobjRequest}
// *            request Request object
// * @param {nlobjResponse}
// *            response Response object
// * @returns {Void} Any output is written via response object
// */
//function handyOld(request, response) {
//	var handyType = request.getParameter('handy');
//	var type = request.getParameter('type');
//	var recordType = request.getParameter('recordtype');
//	var recordId = request.getParameter('id');
//	var lineId = request.getParameter('line');
//	var intermediatelocationid = request.getParameter('intermediatelocationid');
//	var locationid = request.getParameter('locationid');
//	var chooseLoactionId='';
//	if(!isEmpty(intermediatelocationid)||!isEmpty(locationid)){
//		if(!isEmpty(intermediatelocationid)){
//			chooseLoactionId=intermediatelocationid;
//		}else if(!isEmpty(locationid)){
//			var locationSearch = nlapiSearchRecord("location",null,
//					[
//					   ["custrecord_djkk_location_barcode","is",locationid]
//					], 
//					[
//					   new nlobjSearchColumn("custrecord_djkk_location_barcode"), 
//					   new nlobjSearchColumn("internalid")
//					]
//					);
//			if (!isEmpty(locationSearch)) {
//				chooseLoactionId= locationSearch[0].getValue("internalid");
//			}else{
//				response.write('ERROR:ロケーションコードエラー');
//			}
//		}
//	}
//	
// 	var quantity=request.getParameter('quantity');
//
//	// 荷姿区分
//	var packageClassification=request.getParameter('packagec');
//	
//	// 状?
//	var status=request.getParameter('status');
//	
//	// ロット
//	var lot=request.getParameter('lot');
//	
//	// 賞味期限
//	var expiryDate=request.getParameter('expirydate');
//	
//	// 在庫区分
//	var inventoryClassification=request.getParameter('inventoryc');
//	
//	// ロケ
//	var location=chooseLoactionId;
//	
//	var inventorydetail=request.getParameter('inventorydetail');
//	var inventorydetailArray=new Array();
//	if(!isEmpty(inventorydetail)){
//		inventorydetail=decodeURIComponent(inventorydetail);
//		inventorydetailArray= eval("(" + inventorydetail + ")");
//	}
//	if(handyType=='DataStorage'){
//		var backFlag= creatItemfulfillment(recordId,lineId,quantity,location,inventorydetailArray,type);
//		response.write(backFlag);
////		var scheduleparams = new Array();
////		scheduleparams['custscript_djkk_recordtype'] = recordType;
////		scheduleparams['custscript_djkk_internalid'] = recordId;								 
////		scheduleparams['custscript_djkk_line'] = lineId;
////		scheduleparams['custscript_djkk_quantity'] = quantity;
////		
////		 var idList ='[';
////		 idList+='{';
////		 idList+='"packagec":"'+packageClassification+'"'; 
////		 idList+=',';
////		 idList+='"status":"'+status+'"';
////		 idList+=',';
////		 idList+='"lot":"'+lot+'"';
////         idList+=',';
////         idList+='"inventoryc":"'+inventoryClassification+'"';
////         idList+=',';
////         idList+='"location":"'+location+'"';
////		 idList+='}';
////		 idList+=']';
////	     scheduleparams['custscript_djkk_dataarray'] = idList;
////
////	    	 var cacheRecord=nlapiCreateRecord('customrecord_djkk_barcode_cache_table');
////				cacheRecord.setFieldValue('custrecord_djkk_recordtype', scheduleparams['custscript_djkk_recordtype']);
////				cacheRecord.setFieldValue('custrecord_djkk_internalid', scheduleparams['custscript_djkk_internalid']);
////				cacheRecord.setFieldValue('custrecord_djkk_line', scheduleparams['custscript_djkk_line']);
////				cacheRecord.setFieldValue('custrecord_djkk_quantity', scheduleparams['custscript_djkk_quantity']);
////				cacheRecord.setFieldValue('custrecord_djkk_dataarray',  idList);
////				var cacheRecordID=nlapiSubmitRecord(cacheRecord, false, true);
////				if(!isEmpty(cacheRecordID)){
////					//runBatch('customscript_djkk_ss_barcode','customdeploy_djkk_ss_barcode'); 
////					response.write('T');
////				}else{
////					response.write('F');
////				} 	   	     						
//	}else{
//		
//		// ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞ
//		if(type=='SinglePicking'||type=='ShippingInspection'||type=='ShippingProcessing'){
//			
//			if(recordType=='SO'){
//				if(!isEmpty(recordId)){
//					var fielt=[];
//					fielt.push([ "type", "anyof", "SalesOrd" ]);
//					fielt.push("AND");
//					fielt.push([ "internalid", "anyof", recordId ]);
//					if(!isEmpty(lineId)){
//						fielt.push("AND");
//						fielt.push([ "line", "equalto", lineId ]);
//					}
//					var transactionSearch = nlapiSearchRecord("transaction", null,fielt,
//							[  new nlobjSearchColumn("item"),
//							   new nlobjSearchColumn("formulanumeric").setFormula("{quantity}-{quantityshiprecv}"), 
//							   new nlobjSearchColumn("location"),
//							   new nlobjSearchColumn("subsidiary"),
//							   new nlobjSearchColumn("displayname","item",null)
//							]);					
//					if (!isEmpty(transactionSearch)) {
//																			
//						var columnID = transactionSearch[0].getAllColumns();
//						var subsidiary=transactionSearch[0].getValue(columnID[3]);
//						var location=transactionSearch[0].getValue(columnID[2]);
//						
//						if(isEmpty(chooseLoactionId)){
//							chooseLoactionId=location;
//						}
//						var locationArray=new Array();
//						for(var ts=0;ts<transactionSearch.length;ts++){
//							locationArray.push(transactionSearch[ts].getValue(columnID[2]));
//						}							
//						var jsonObj = '{';						
//						var filters=[];
//						filters.push(["subsidiary","anyof",subsidiary]);
//						if(!isEmpty(locationArray)){
//						filters.push("AND");
//						filters.push([ "internalid", "anyof", locationArray ]);
//						}
//						if(!isEmpty(lineId)){
//							var itemId= transactionSearch[0].getValue(columnID[0]);
//														
//							jsonObj+= '"packingType":';
//							jsonObj=getListJson("customlist_djkk_packingtype", jsonObj, null);
//							jsonObj+= ',"status":';
//							/*/*inventorystatus DELECT change by ycx 2021.10.05 */
//							// old
//							//jsonObj=getListJson("inventorystatus", jsonObj, null);
//							//new
//							jsonObj+='[{"key":"1","value":"良品"},{"key":"2","value":"不良品"}]';
//							/*change end*/
//							jsonObj+= ',"stockType":';
//							jsonObj=getListJson("customlist_djkk_storage_type", jsonObj, null);
//							jsonObj+= ',"locations":';
//							jsonObj=getListJson("location", jsonObj, filters);
//							jsonObj+= ',"inventorydetail":';
//							jsonObj=getInventorydetailSearchJson(recordId,lineId,itemId,chooseLoactionId,jsonObj)
//							jsonObj+= ',"data":[{';										
//							var itemName= transactionSearch[0].getText(columnID[0]);
//							jsonObj+='"itemName":"'+itemName+'",';
//							var itemDisplayName=transactionSearch[0].getValue(columnID[4]);
//							jsonObj+='"itemDisplayName":"'+itemDisplayName+'",';
//			                var quantity= transactionSearch[0].getValue(columnID[1]);			                
//			                jsonObj+='"quantity":"'+quantity+'",';
//			                jsonObj+='"location":"'+chooseLoactionId+'"';
//			                jsonObj+='}]';
//						}else{
//						jsonObj+= '"locations":';
//						jsonObj=getListJson("location", jsonObj, filters);						
//						}
//						jsonObj+= '}';
//		                response.write(jsonObj);
//		                
//						
//					}else{
//						response.write('ERROR:トランザクション検索なし');
//					}
//					
//					
//				}
//				//else if{}
//				else{
//				response.write('ERROR:レコードIDエラー');	
//				}
//			}
//			//else if{}
//			else{
//			response.write('ERROR:レコードタイプエラー');
//			}
//		}
//		//else if{}
//		else{
//		response.write('ERROR:スキャンコードタイプエラー');	
//		}		
//	}	
//}
//
//function getListJson(listId, jsonObj,filters) {
//	jsonObj+="[";
//	var Search= nlapiSearchRecord(listId,null,filters, 
//    		[
//    		  new nlobjSearchColumn("internalid"), 
//    		   new nlobjSearchColumn("name")
//    		]
//    		);
//	if (!isEmpty(Search)) {
//		for (var i = 0; i < Search.length; i++) {
//			jsonObj +='{"key":"'+Search[i].getValue('internalid')+'",';
//			jsonObj +='"value":"'+Search[i].getValue('name')+'"}'; 
//			if(i!=Search.length-1){
//			jsonObj +=',';
//			}
//		}
//	}
//	jsonObj+="]";
//	return jsonObj;
//}
//function getInventorydetailSearchJson(recordId,lineId,itemId,chooseLoactionId,jsonObj) {
//	jsonObj+="[";
//	var Search=  nlapiSearchRecord("inventorydetail",null,
//			[
//			   ["item","anyof",itemId], 
//			   "AND", 
//			   ["inventorynumber.quantityavailable","notlessthanorequalto","0"], 
//			   "AND", 
//			   ["inventorynumber.location","anyof",chooseLoactionId]
//			], 
//			[
//			   new nlobjSearchColumn("inventorynumber",null,"GROUP").setSort(false), 
//			   new nlobjSearchColumn("quantityavailable","inventoryNumber","GROUP")
//			]
//			);
//	var inventorydetailSearch = nlapiSearchRecord("inventorydetail",null,
//	[
//	   ["transaction.internalid","anyof",recordId], 
//	   "AND", 
//	   ["transaction.line","equalto",lineId]
//	], 
//	[
//	   new nlobjSearchColumn("inventorynumber"), 
//	   new nlobjSearchColumn("custrecord_djkk_packingtype","inventoryDetailLines",null), 
//	   //new nlobjSearchColumn("status"), 
//	   new nlobjSearchColumn("custrecord_djkk_storage_type","inventoryDetailLines",null), 
//	   new nlobjSearchColumn("quantity")
//	]
//	);
//	var invarray=[];
//    if(!isEmpty(inventorydetailSearch)){
//    	for (var j = 0; j < inventorydetailSearch.length; j++) {
//    		invarray[inventorydetailSearch[j].getValue("inventorynumber")]=
//    			[inventorydetailSearch[j].getValue("custrecord_djkk_packingtype","inventoryDetailLines",null),  			   			 
//    			 inventorydetailSearch[j].getValue("custrecord_djkk_storage_type","inventoryDetailLines",null),
//    			 inventorydetailSearch[j].getValue("quantity")
//    			 //,inventorydetailSearch[j].getValue("status")
//    			 ];
//    	}
//    }
//	if (!isEmpty(Search)) {
//		for (var i = 0; i < Search.length; i++) {
//			jsonObj +='{';
//			var inventorynumber=Search[i].getValue("inventorynumber",null,"GROUP");
//			var inventoryquantity=Search[i].getValue("quantityavailable","inventoryNumber","GROUP");
//			jsonObj +='"key":"'+Search[i].getText("inventorynumber",null,"GROUP")+'",';
//			jsonObj +='"value":"'+inventorynumber+'",';
//			jsonObj +='"inventoryquantity":"'+inventoryquantity+'",';
//			
//			var tinvArray=invarray[inventorynumber];
//			if(!isEmpty(tinvArray)){
//				jsonObj +='"check":"T",';				
//				jsonObj +='"quantity":"'+tinvArray[2]+'",';
//				//jsonObj +='"status":"'+tinvArray[1]+'",';
//				jsonObj +='"status":"",';
//				jsonObj +='"packingtype":"'+tinvArray[0]+'",';
//				jsonObj +='"storagetype":"'+tinvArray[1]+'"';
//			}else{
//				jsonObj +='"check":"F",';
//				jsonObj +='"quantity":"'+inventoryquantity+'",';
//				jsonObj +='"status":"",';
//				jsonObj +='"packingtype":"",';
//				jsonObj +='"storagetype":""';
//			}
//			
//			jsonObj +='}';
//			if(i!=Search.length-1){
//			jsonObj +=',';
//			}
//		}
//	}
//	jsonObj+="]";
//	return jsonObj;
//}
//
//function creatItemfulfillment(internalid,linenum,quantity,location,inventorydetailArray,type) {
//	try {		
//		var itemfulfillmentRecord = nlapiTransformRecord('salesorder',internalid, 'itemfulfillment');
//		//type=='SinglePicking'||type=='ShippingInspection'||type=='ShippingProcessing'
//		if(type=='SinglePicking'){
//			itemfulfillmentRecord.setFieldValue('shipstatus', 'A');				
//		}else if(type=='ShippingInspection'){
//			itemfulfillmentRecord.setFieldValue('shipstatus', 'B');
//		}else if(type=='ShippingProcessing'){
//			itemfulfillmentRecord.setFieldValue('shipstatus', 'C');
//		}
//		var count = itemfulfillmentRecord.getLineItemCount('item');
//		for (var i = 1; i < count + 1; i++) {
//			itemfulfillmentRecord.selectLineItem('item', i);
//		if(itemfulfillmentRecord.getCurrentLineItemValue('item', 'orderline')==linenum){
//			itemfulfillmentRecord.setCurrentLineItemValue('item', 'itemreceive','T');
//			itemfulfillmentRecord.setCurrentLineItemValue('item', 'location',location);
//			itemfulfillmentRecord.setCurrentLineItemValue('item', 'quantity',quantity);
//			// 在庫詳細のオブジェクトを取得する
//			 itemfulfillmentRecord.removeCurrentLineItemSubrecord('item', 'inventorydetail');
//			var subrecord2 = itemfulfillmentRecord.createCurrentLineItemSubrecord('item', 'inventorydetail');
//
//			for (var i = 0; i < inventorydetailArray.length; i++) {
//				var key = inventorydetailArray[i]['key'];
//				var packingtype = inventorydetailArray[i]['pt'];
//				var inquantity = inventorydetailArray[i]['qu'];
//				var storagetype = inventorydetailArray[i]['st'];
//				var status = inventorydetailArray[i]['sts'];
//				// 在庫番号を設定する
//				subrecord2.selectNewLineItem('inventoryassignment');
//				subrecord2.setCurrentLineItemValue('inventoryassignment','issueinventorynumber', key);
//				subrecord2.setCurrentLineItemValue('inventoryassignment','quantity', inquantity);
//				/*inventorystatus DELECT change by ycx 2021.10.05 
//				if(status.toString()!='-1'){
//					// 在庫ステータス:
//					subrecord2.setCurrentLineItemValue('inventoryassignment','inventorystatus',status);
//				}*/
//				if(packingtype.toString()!='-1'){
//				// DJ_荷姿区分
//				subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_packingtype',packingtype);
//				}
//				if(storagetype.toString()!='-1'){
//				// DJ_在庫区分
//				subrecord2.setCurrentLineItemValue('inventoryassignment','custrecord_djkk_storage_type',storagetype);
//				}
//				
//				subrecord2.commitLineItem('inventoryassignment');
//				}
//			subrecord2.commit();
//			itemfulfillmentRecord.commitLineItem('inventory');
//		}else{
//			itemfulfillmentRecord.setCurrentLineItemValue('item','itemreceive', 'F');
//		}
//			itemfulfillmentRecord.commitLineItem('item');
//		}
//		
//		var itemreceiptId = nlapiSubmitRecord(itemfulfillmentRecord, false,true);
//		return 'T';
//	} catch (e) {
//		nlapiLogExecution('debug', 'error', e);
//		return  e;
//	}
//}
function defaultEmpty(src){
	return src || '';
}