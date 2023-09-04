/**
 * DJ_納品先Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/09/11     CPC_苑
 *
 */

/**
 * 最小桁数
 */
var TheMinimumdigits = 4;
var formType='';
var notfirstflag=false;

/*
 * */
function clientPageInit(type) {
	  formType=type;
	  nlapiDisableField('custrecord_djkk_delivery_code', true);//CH152
	 if(type == 'create'||type == 'copy'){
	       nlapiSetFieldValue('custrecord_djkk_delivery_code', '自動採番');
//	       nlapiDisableField('custrecord_djkk_delivery_code', true);
	       nlapiSetFieldValue('name', '自動生成');
	       nlapiDisableField('name', true);
	    } else if(type == 'edit'){
	    	nlapiDisableField('name', true);
	    }

		 // 新規場合 連結初期設定
	if (type == 'create') {
		nlapiSetFieldValue('custrecord_djkk_delivery_subsidiary',getRoleSub(nlapiGetRole()))
		 nlapiSetFieldValue('custrecord_djkk_delivery_book_site', '24', false, true);		 
		 nlapiSetFieldValue('custrecord_djkk_shippinginfosendtyp', '101', false, true);
		 nlapiSetFieldValue('custrecord_djkk_shippinginfodesttyp', '39', false, true);
		 nlapiSetFieldValue('custrecord_djkk_delivery_book_period', '9', false, true);
	}
	 try{
	 var cus=nlapiGetFieldValue('custrecord_djkk_customer');
	 if(!isEmpty(cus)){
		 var cusCategoryArray=nlapiLookupField('customer', cus,['custentity_djkk_product_category_jp','custentity_djkk_product_category_scetikk']);//DJ_カテゴリ（日仏貿易用）/DJ_カテゴリ（SCETIKK）
		 var cusA=cusCategoryArray.custentity_djkk_product_category_jp;
		 var cusB=cusCategoryArray.custentity_djkk_product_category_scetikk;
		 if(isEmpty(cusA)&&!isEmpty(cusB)){
			 nlapiSetFieldValue('custrecord_djkk_category', cusB, false, true);
		 }else if(isEmpty(cusB)&&!isEmpty(cusA)){
			 nlapiSetFieldValue('custrecord_djkk_category', cusA, false, true);
		 }		 
	 }
      }catch(e){}
      
      //20230209 add by zhou CH222 start
      var customform = nlapiGetFieldValue('customform');
      if(customform == '27'){
//    	  if(type == 'create' || type == 'edit'||type == 'cppy'){
    	  if(type == 'create'){
    		  var customerID = nlapiGetFieldValue('custrecord_djkk_customer');
    		  if(!isEmpty(customerID)){
    				var customerRecord = nlapiLookupField('customer', customerID, ['custentity_djkk_expdatereservaltyp','custentity_djkk_expdateremainingdays','custentity_djkk_expdateremainingpercent']);
    				var expDateReservalTType = customerRecord.custentity_djkk_expdatereservaltyp;//DJ_賞味期限逆転防止区分
    	    		var expDateRemainingDays = customerRecord.custentity_djkk_expdateremainingdays;//DJ_賞味期限残日数
    	    		var expDateRemainingPercent = customerRecord.custentity_djkk_expdateremainingpercent;//DJ_賞味期限残パーセンテージ
    				nlapiSetFieldValue('custrecord_djkk_expdatereservaltyp', expDateReservalTType);
    				nlapiSetFieldValue('custrecord_djkk_expdateremainingdays', expDateRemainingDays);
    				nlapiSetFieldValue('custrecord_djkk_expdateremainingpercent', expDateRemainingPercent);
    		  }
    	  }
      }
      //end
  	//notfirstflag=true;
}

/*
 * */
function clientSaveRecord() {
	var returnType = true;
	 if (returnType&&(formType == 'create'||formType == 'copy')) {
		 var customerID = nlapiGetFieldValue('custrecord_djkk_customer');
		 if(!isEmpty(customerID)){
			 
			var customerRecord=nlapiLookupField('customer', customerID, ['entityid','custentity_djkk_delivery_destination_num']);
			var numberIng= customerRecord.custentity_djkk_delivery_destination_num;
			var entityid = customerRecord.entityid;
			if(isEmpty(numberIng)){
				numberIng=0;
			}
			numberIng++;
			var numberd=entityid+ '-'+prefixInteger(parseInt(numberIng), parseInt(TheMinimumdigits));;
			nlapiSetFieldValue('custrecord_djkk_delivery_code', numberd, false, true);
			//20221226王よりstart CH236 自動採番を追加
			//DJ_納品先名前
			var custrecordname = nlapiGetFieldValue('custrecorddjkk_name');
			nlapiSetFieldValue('name', numberd+ ' '+custrecordname, false, true);
			//end
			//nlapiSubmitField('customer', customerID, 'custentity_djkk_delivery_destination_num',numberIng);
			
		 }else{
			 alert('DJ_顧客を入力してください。');
			 returnType=false;
		 }
	 }
	 
	//changed by song add DENISJAPAN-486 start
	var sodeliverermemo = nlapiGetFieldValue('custrecord_djkk_sodeliverermemo'); //DJ_注文時運送向け備考
	if(!isEmpty(sodeliverermemo)){
		var sodeliverermemoString = sodeliverermemo.toString();
		var sodeliverermemoBytes = getBytes(sodeliverermemoString);
	    if(sodeliverermemoBytes > 35){
			alert("DJ_注文時運送向け備考のバイト数が35より大きいので、再入力してください");
			returnType=false;
		}
	}
	
	var sowmsmemo = nlapiGetFieldValue('custrecord_djkk_sowmsmemo'); //DJ_注文時運送向け備考
	if(!isEmpty(sowmsmemo)){
		var sowmsmemoString = sowmsmemo.toString();
		var sowmsmemoBytes = getBytes(sowmsmemoString);
	    if(sowmsmemoBytes > 100){
			alert("DJ_注文時運送向け備考のバイト数が100より大きいので、再入力してください");
			returnType=false;
		}
	}
	//changed by song add DENISJAPAN-486 end
	 
	 return returnType;
}

var getBytes = function (string) {
	var utf8 = unescape(encodeURIComponent(string));
	var arr = [];

	for (var i = 0; i < utf8.length; i++) {
	    arr.push(utf8.charCodeAt(i));
	}
	return arr.length;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	if(name=='custrecord_djkk_customer'){
		try{
			 var cus=nlapiGetFieldValue('custrecord_djkk_customer');
			 if(!isEmpty(cus)){
				 var cusCategoryArray=nlapiLookupField('customer', cus,['custentity_djkk_product_category_jp','custentity_djkk_product_category_scetikk','custentity_djkk_expdateremainingpercent','custentity_djkk_expdatereservaltyp','custentity_djkk_expdateremainingdays','custentity_djkk_expdateremainingpercent']);//DJ_カテゴリ（日仏貿易用）/DJ_カテゴリ（SCETIKK）
				 var cusA=cusCategoryArray.custentity_djkk_product_category_jp;
				 var cusB=cusCategoryArray.custentity_djkk_product_category_scetikk;
				 if(isEmpty(cusA)&&!isEmpty(cusB)){
					 nlapiSetFieldValue('custrecord_djkk_category', cusB, false, true);
				 }else if(isEmpty(cusB)&&!isEmpty(cusA)){
					 nlapiSetFieldValue('custrecord_djkk_category', cusA, false, true);
				 }	
				//20221219 add by zhou CH222 start
				 var expdateremainingpercent = cusCategoryArray.custentity_djkk_expdateremainingpercent;//DJ_賞味期限残パーセンテージ
				 if(!isEmpty(expdateremainingpercent)&& nlapiGetFieldValue('customform') == '27'){
					 nlapiSetFieldValue('custrecord_djkk_expdateremainingpercent', expdateremainingpercent);
				 }
			 	//end
				//20230209 add by zhou CH222 start
		         var customform = nlapiGetFieldValue('customform');
		         if((type == 'create' || type == 'edit'||type == 'cppy') && customform == '27'){
		        	var expDateReservalTType = cusCategoryArray.custentity_djkk_expdatereservaltyp;//DJ_賞味期限逆転防止区分
		        	var expDateRemainingDays = cusCategoryArray.custentity_djkk_expdateremainingdays;//DJ_賞味期限残日数
		        	var expDateRemainingPercent = cusCategoryArray.custentity_djkk_expdateremainingpercent;//DJ_賞味期限残パーセンテージ
		        	nlapiSetFieldValue('custrecord_djkk_expdatereservaltyp', expDateReservalTType,false);
		        	nlapiSetFieldValue('custrecord_djkk_expdateremainingdays', expDateRemainingDays,false);
		        	nlapiSetFieldValue('custrecord_djkk_expdateremainingpercent', expDateRemainingPercent,false);
		  	  	 }
			  //end
			 }
			 //顧客変更すると営業担当者者を初期設定
			 nlapiSetFieldValue('custrecord_djkk_sales', nlapiLookupField('customer', cus, 'salesrep'));
				}catch(e){}
			}
	if(name=='custrecord_djkk_delivery_destinationkana'){
		var kana=nlapiGetFieldValue('custrecord_djkk_delivery_destinationkana');
		if(!inputCheckKana(kana)){
			alert('半角文字、数字アルファベットのみ入力可、全角文字入力不可。');
			nlapiSetFieldValue('custrecord_djkk_delivery_destinationkana', '', false, true);
		}
	}
	// add by ycx 20220922 DENISJAPAN-486 EDI送信データの項目バイト長について
	if(name=='custrecord_djkk_finetcustomeredicode'){
		var finetcustomeredicode=nlapiGetFieldValue('custrecord_djkk_finetcustomeredicode');
		if(!inputCheckKana(finetcustomeredicode)){
			alert('半角文字、数字アルファベットのみ入力可、全角文字入力不可。');
			nlapiSetFieldValue('custrecord_djkk_finetcustomeredicode', '', false, true);
		}
	}
	if(name=='custrecord_djkk_finetinvoicecustomercd1'){
		var finetinvoicecustomercd1=nlapiGetFieldValue('custrecord_djkk_finetinvoicecustomercd1');
		if(!inputCheckKana(finetinvoicecustomercd1)){
			alert('半角文字、数字アルファベットのみ入力可、全角文字入力不可。');
			nlapiSetFieldValue('custrecord_djkk_finetinvoicecustomercd1', '', false, true);
		}
	}
	
	if(name=='custrecord_djkk_finetinvoicecustomercd2'){
		var finetinvoicecustomercd2=nlapiGetFieldValue('custrecord_djkk_finetinvoicecustomercd2');
		if(!inputCheckKana(finetinvoicecustomercd2)){
			alert('半角文字、数字アルファベットのみ入力可、全角文字入力不可。');
			nlapiSetFieldValue('custrecord_djkk_finetinvoicecustomercd2', '', false, true);
		}
	}
	if(name=='custrecord_djkk_finetinvoicecustomercd3'){
		var finetinvoicecustomercd3=nlapiGetFieldValue('custrecord_djkk_finetinvoicecustomercd3');
		if(!inputCheckKana(finetinvoicecustomercd3)){
			alert('半角文字、数字アルファベットのみ入力可、全角文字入力不可。');
			nlapiSetFieldValue('custrecord_djkk_finetinvoicecustomercd3', '', false, true);
		}
	}
	if(name=='custrecord_djkk_finetinvoicecustomercd4'){
		var finetinvoicecustomercd4=nlapiGetFieldValue('custrecord_djkk_finetinvoicecustomercd4');
		if(!inputCheckKana(finetinvoicecustomercd4)){
			alert('半角文字、数字アルファベットのみ入力可、全角文字入力不可。');
			nlapiSetFieldValue('custrecord_djkk_finetinvoicecustomercd4', '', false, true);
		}
	}
	if(name=='custrecord_djkk_finetinvoicecustomercd5'){
		var finetinvoicecustomercd5=nlapiGetFieldValue('custrecord_djkk_finetinvoicecustomercd5');
		if(!inputCheckKana(finetinvoicecustomercd5)){
			alert('半角文字、数字アルファベットのみ入力可、全角文字入力不可。');
			nlapiSetFieldValue('custrecord_djkk_finetinvoicecustomercd5', '', false, true);
		}
	}
	// add end
	if (name == 'custrecord_djkk_zip') {
		var zipcode = replaceExceptNumber(nlapiGetFieldValue('custrecord_djkk_zip'));
		var codeSearch = nlapiSearchRecord("customrecord_djkk_postal_code",
				null, [ [ "custrecord_djkk_postal_code", "is", zipcode ] ], [
						new nlobjSearchColumn("custrecord_djkk_state"),
						new nlobjSearchColumn("custrecord_djkk_city"),
						new nlobjSearchColumn("custrecord_djkk_address") ]);
		if (!isEmpty(codeSearch)) {
			nlapiSetFieldValue('custrecord_djkk_prefectures', codeSearch[0]
					.getText('custrecord_djkk_state'));
			nlapiSetFieldValue('custrecord_djkk_municipalities', codeSearch[0]
					.getValue('custrecord_djkk_city'));
//20220706 changed by zhou start
//U788
			var addressForSearch = codeSearch[0].getValue('custrecord_djkk_address');
			var address = addressForSearch.replace('　', '');
			nlapiSetFieldValue('custrecord_djkk_delivery_residence',address,false,true);
//20220706 changed by zhou end
		} else {
			nlapiSetFieldValue('custrecord_djkk_prefectures', '');
			nlapiSetFieldValue('custrecord_djkk_municipalities', '');
			nlapiSetFieldValue('custrecord_djkk_delivery_residence', '',false,true);
		}
	}
	if (name == 'custrecord_djkk_delivery_residence') {
		var addr1 = nlapiGetFieldValue('custrecord_djkk_delivery_residence');
		var zip=nlapiGetFieldValue('custrecord_djkk_zip');
        if(!isEmpty(addr1)&&isEmpty(zip)){
		var addSearch = nlapiSearchRecord("customrecord_djkk_postal_code",
				null, [ [ "custrecord_djkk_address", "contains", addr1 ] ], [
						new nlobjSearchColumn("custrecord_djkk_postal_code"),
						new nlobjSearchColumn("custrecord_djkk_state"),
						new nlobjSearchColumn("custrecord_djkk_city") ]);
		if (!isEmpty(addSearch)) {
			nlapiSetFieldValue('custrecord_djkk_prefectures', addSearch[0]
					.getText('custrecord_djkk_state'));
			nlapiSetFieldValue('custrecord_djkk_municipalities', addSearch[0]
					.getValue('custrecord_djkk_city'));
			nlapiSetFieldValue('custrecord_djkk_zip', addSearch[0]
					.getValue('custrecord_djkk_postal_code'),false,true);
		} else {
//			nlapiSetFieldValue('custrecord_djkk_prefectures', '');
//			nlapiSetFieldValue('custrecord_djkk_municipalities', '');
//			nlapiSetFieldValue('custrecord_djkk_zip', '',false,true);
		}
         }
	}
	if (name == 'custrecorddjkk_name') {
		var shippingname = nlapiGetFieldValue("custrecord_djkk_shippinginfodestname"); //出荷案内送信先会社名
		var customform = nlapiGetFieldValue("customform");  //状態
		nlapiLogExecution('error', 'customform', customform)
		var custrecordname = nlapiGetFieldValue("custrecorddjkk_name"); //納品先名前
		if(customform =='28'){ 
			if(shippingname == ''){
				nlapiSetFieldValue('custrecord_djkk_shippinginfodestname',custrecordname);
			}
		}  
	}
	
	if(name == 'custrecord_djkk_shippinginfosendtyp' || name == 'custrecord_djkk_customer' ){
		var customform = nlapiGetFieldValue('customform');
		var shippinginfosendtyp = nlapiGetFieldValue('custrecord_djkk_shippinginfosendtyp');
//		alert(deliveryPeriod);
		if(customform == '28' && shippinginfosendtyp == '101'){ // LS、DJ_納期回答送信方法 == 顧客参照
			var customer = nlapiGetFieldValue('custrecord_djkk_customer');
			if(isEmpty(customer)){
				if(notfirstflag){
				alert('DJ_顧客 をお選びください');
				}else{
					notfirstflag=true;
				}				
				return false;
			}else{
				var loadingCustomer = nlapiLoadRecord('customer',customer);
				var shippinginfosendtype = loadingCustomer.getFieldValue('custentity_djkk_shippinginfosendtyp')//DJ_納期回答送信方法|DJ_出荷案内送信区分
				var shippinginfodesttype = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodesttyp')//DJ_納期回答送信先|DJ_出荷案内送信先区分
				var deliverydestrep = loadingCustomer.getFieldValue('custentity_djkk_customerrep')//DJ_納期回答送信先担当者|DJ_出荷案内送信先担当者
				var shippinginfodestname = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestname')//DJ_納期回答送信先会社名(3RDパーティー)|DJ_出荷案内送信先会社名(3RDパーティー)
				var shippinginfodestrep = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestrep')//DJ_納期回答送信先担当者(3RDパーティー)|DJ_出荷案内送信先担当者(3RDパーティー)
				var shippinginfodestemail = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestemail')//DJ_納期回答送信先メール(3RDパーティー)|DJ_出荷案内送信先メール(3RDパーティー)
				var shippinginfodestfax = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestfax')//DJ_納期回答送信先FAX(3RDパーティー)|DJ_出荷案内送信先FAX(3RDパーティー)
				var shippinginfodestmemo = loadingCustomer.getFieldValue('custentity_djkk_shippinginfodestmemo')//DJ_納期回答自動送信送付先備考|DJ_出荷案内送信先登録メモ
				if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype != '36'){
//					nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', shippinginfosendtype,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodesttyp', shippinginfodesttype,false);
					nlapiSetFieldValue('custrecord_djkk_deliverydestrep', deliverydestrep,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestname', shippinginfodestname,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestrep', shippinginfodestrep,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestemail', shippinginfodestemail,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestfax', shippinginfodestfax,false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestmemo', shippinginfodestmemo,false);	
				}else{
					nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodesttyp', '',false);
					nlapiSetFieldValue('custrecord_djkk_deliverydestrep', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestname', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestrep', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestemail', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestfax', '',false);
					nlapiSetFieldValue('custrecord_djkk_shippinginfodestmemo', '',false);	
				}
			}
		}else if(customform == '28' && shippinginfosendtyp!= '101'){
			nlapiSetFieldValue('custrecord_djkk_shippinginfodesttyp', '',false);
			nlapiSetFieldValue('custrecord_djkk_deliverydestrep', '',false);
			nlapiSetFieldValue('custrecord_djkk_shippinginfodestname', '',false);
			nlapiSetFieldValue('custrecord_djkk_shippinginfodestrep', '',false);
			nlapiSetFieldValue('custrecord_djkk_shippinginfodestemail', '',false);
			nlapiSetFieldValue('custrecord_djkk_shippinginfodestfax', '',false);
			nlapiSetFieldValue('custrecord_djkk_shippinginfodestmemo', '',false);	
		}
	}
	
	if(name == 'custrecord_djkk_delivery_book_period'||name == 'custrecord_djkk_customer' ){
		var customform = nlapiGetFieldValue('customform');
		var deliveryPeriod = nlapiGetFieldValue('custrecord_djkk_delivery_book_period');
		if((customform == '28' || customform == '27' )&& deliveryPeriod == '9'){ // ls、納品書送信方法 == 顧客参照
			var customer = nlapiGetFieldValue('custrecord_djkk_customer');
			if(isEmpty(customer)){
				if(notfirstflag){
					alert('DJ_顧客 をお選びください');
					}else{
						notfirstflag=true;
					}				
					return false;
			}else{
				var custRecord = nlapiLoadRecord('customer',customer);
				deliveryPeriod = custRecord.getFieldValue('custentity_djkk_delivery_book_period'); //DJ_納品書送信方法
				var deliverySite;
				if(customform == '28'){
					deliverySite = custRecord.getFieldValue('custentity_djkk_delivery_book_site'); //DJ_納品書送信先
				}else if( customform == '27'){
					deliverySite = custRecord.getFieldValue('custentity_djkk_delivery_book_site_fd'); //DJ_納品書送信先
				}
				var deliveryPerson = custRecord.getFieldValue('custentity_djkk_delivery_book_person'); //DJ_納品書送信先担当者
				var deliverySubName = custRecord.getFieldValue('custentity_djkk_delivery_book_subname'); //DJ_納品書送信先会社名(3RDパーティー)
				var deliveryPersont = custRecord.getFieldValue('custentity_djkk_delivery_book_person_t'); //DJ_納品書送信先担当者(3RDパーティー)
				var deliveryEmail = custRecord.getFieldValue('custentity_djkk_delivery_book_email'); //DJ_納品書送信先メール(3RDパーティー)
				var deliveryFax = custRecord.getFieldValue('custentity_djkk_delivery_book_fax_three'); //DJ_納品書送信先FAX(3RDパーティー)
				var deliveryMemo = custRecord.getFieldValue('custentity_djkk_delivery_book_memo'); //DJ_納品書自動送信備考
				if(!isEmpty(deliveryPeriod)&& (deliveryPeriod!= '10' )){
//					nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_納品書送信方法
					if(customform == '28'){
						nlapiSetFieldValue('custrecord_djkk_delivery_book_site', deliverySite,false);//DJ_納品書送信先
					}else if( customform == '27'){
						nlapiSetFieldValue('custrecord_djkk_delivery_book_site_fd', deliverySite,false);//DJ_納品書送信先
					}
					nlapiSetFieldValue('custrecord_djkk_delivery_book_person', deliveryPerson,false);//DJ_納品書送信先担当者
					nlapiSetFieldValue('custrecord_djkk_delivery_book_subname', deliverySubName,false);//DJ_納品書送信先会社名(3RDパーティー)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_納品書送信先担当者(3RDパーティー)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_email', deliveryEmail,false);//DJ_納品書送信先メール(3RDパーティー)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_納品書送信先FAX(3RDパーティー)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_memo', deliveryMemo,false);//DJ_納品書自動送信備考  custbody_djkk_reference_column
				}else{
//					nlapiSetFieldValue('custrecord_djkk_delivery_book_period', deliveryPeriod,false);//DJ_納品書送信方法
				
					if(customform == '28'){
						nlapiSetFieldValue('custrecord_djkk_delivery_book_site', '',false);//DJ_納品書送信先
					}else if( customform == '27'){
						nlapiSetFieldValue('custrecord_djkk_delivery_book_site_fd', '',false);//DJ_納品書送信先
					}
					nlapiSetFieldValue('custrecord_djkk_delivery_book_person', '',false);//DJ_納品書送信先担当者
					nlapiSetFieldValue('custrecord_djkk_delivery_book_subname', '',false);//DJ_納品書送信先会社名(3RDパーティー)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_person_t', '',false);//DJ_納品書送信先担当者(3RDパーティー)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_email', '',false);//DJ_納品書送信先メール(3RDパーティー)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_fax_three', '',false);//DJ_納品書送信先FAX(3RDパーティー)
					nlapiSetFieldValue('custrecord_djkk_delivery_book_memo', '',false);//DJ_納品書自動送信備考  custbody_djkk_reference_column
				}
			}
		}else if((customform == '28' || customform == '27' )&& deliveryPeriod != '9'){
			if(customform == '28'){
				nlapiSetFieldValue('custrecord_djkk_delivery_book_site', '',false);//DJ_納品書送信先
			}else if( customform == '27'){
				nlapiSetFieldValue('custrecord_djkk_delivery_book_site_fd', '',false);//DJ_納品書送信先
			}
			nlapiSetFieldValue('custrecord_djkk_delivery_book_person', '',false);//DJ_納品書送信先担当者
			nlapiSetFieldValue('custrecord_djkk_delivery_book_subname', '',false);//DJ_納品書送信先会社名(3RDパーティー)
			nlapiSetFieldValue('custrecord_djkk_delivery_book_person_t', '',false);//DJ_納品書送信先担当者(3RDパーティー)
			nlapiSetFieldValue('custrecord_djkk_delivery_book_email', '',false);//DJ_納品書送信先メール(3RDパーティー)
			nlapiSetFieldValue('custrecord_djkk_delivery_book_fax_three', '',false);//DJ_納品書送信先FAX(3RDパーティー)
			nlapiSetFieldValue('custrecord_djkk_delivery_book_memo', '',false);//DJ_納品書自動送信備考  custbody_djkk_reference_column
		}
		notfirstflag=true;
	}
}
