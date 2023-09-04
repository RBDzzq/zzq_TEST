/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Nov 2022     zhou
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug','start','start')
	var data = nlapiGetContext().getSetting('SCRIPT','custscript_data');
	nlapiLogExecution('debug','a',data)
	data = JSON.parse(data);
	nlapiLogExecution('debug','b',data)
	
	var entityObj = data.entity;
	var div = data.div;
	nlapiLogExecution('debug','div',div.length);
	var recordId =data.recordId
	var customer = entityObj.customer;//顧客
	var status = data.status;
	var delivery = entityObj.delivery;//納品先
	var customform = data.customform;
	var subsidiary= data.subsidiary;
	var mailType;
	var salesman =data.salesrep;//salesman
	nlapiLogExecution('debug','recordId',recordId)
	var recordType= data.recordType;
	var invEmailFlag = false;
	var delivEmailFlag = false;
	
	for(var kk = 0 ; kk<div.length ; kk++){
	    nlapiLogExecution('debug','div[kk]',div[kk])
//	    if(div == 7){
	    if(div[kk] == 7){
	        if(customform == '121'){
//	          mailType = '納期回答';
	            mailType = '出荷案内';
	        }else if(customform == '175'){
	            mailType = '出荷案内';
	            var shippinginfoSendmailObj = data.shippinginfoSendmailObj;
	            var shippinginfosendtype = shippinginfoSendmailObj.shippinginfosendtype;//DJ_納期回答送信方法|DJ_出荷案内送信区分
	            var shippinginfodesttype = shippinginfoSendmailObj.shippinginfodesttype;//DJ_納期回答送信先|DJ_出荷案内送信先区分
	            var deliverydestrep = shippinginfoSendmailObj.deliverydestrep;//DJ_納期回答送信先担当者|DJ_出荷案内送信先担当者
	            var shippinginfodestname = shippinginfoSendmailObj.shippinginfodestname;//DJ_納期回答送信先会社名(3RDパーティー)|DJ_出荷案内送信先会社名(3RDパーティー)
	            var shippinginfodestrep = shippinginfoSendmailObj.shippinginfodestrep;//DJ_納期回答送信先担当者(3RDパーティー)|DJ_出荷案内送信先担当者(3RDパーティー)
	            var shippinginfodestemail = shippinginfoSendmailObj.shippinginfodestemail;//DJ_納期回答送信先メール(3RDパーティー)|DJ_出荷案内送信先メール(3RDパーティー)
	            var shippinginfodestfax = shippinginfoSendmailObj.shippinginfodestfax;//DJ_納期回答送信先FAX(3RDパーティー)|DJ_出荷案内送信先FAX(3RDパーティー)
	            var shippinginfodestmemo = shippinginfoSendmailObj.shippinginfodestmemo;//DJ_納期回答自動送信送付先備考|DJ_出荷案内送信先登録メモ
	            
	            if(status == 'B'){    // status = 配送保留
	                //DJ_納期回答送信|DJ_出荷案内送信
	                if(shippinginfosendtype != '36'){
	                    if(shippinginfodesttype == '40'){
	                        //送信顧客先の場合
	                        var custRecord = nlapiLoadRecord('customer',customer);
	                        var fax = defaultEmpty(custRecord.getFieldValue('fax')); //fax
	                        var mail = defaultEmpty(custRecord.getFieldValue('email')); //email
	    //                  salesman = deliverydestrep;
//	                        shippinginfoSendMail(fax,mail,shippinginfosendtype,div,recordId,customform,customer,subsidiary,mailType,salesman)
	                        shippinginfoSendMail(fax,mail,shippinginfosendtype,div[kk],recordId,customform,customer,subsidiary,mailType,salesman)
	                    }else if(shippinginfodesttype == '38'){
	                        var fax = defaultEmpty(shippinginfodestfax);
	                        var mail = defaultEmpty(shippinginfodestemail); 
	    //                  salesman = shippinginfodestrep;
//	                        shippinginfoSendMail(fax,mail,shippinginfosendtype,div,recordId,customform,customer,subsidiary,mailType,salesman)
	                        shippinginfoSendMail(fax,mail,shippinginfosendtype,div[kk],recordId,customform,customer,subsidiary,mailType,salesman)
	                    }
	                    else if(shippinginfodesttype == '39'){
	                        var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',delivery);
	                        var fax = defaultEmpty(deliveryRecord.getFieldValue('custrecord_djkk_fax')); //fax
	                        var mail = defaultEmpty(deliveryRecord.getFieldValue('custrecord_djkk_email')); //email
	    //                  salesman = deliverydestrep;
//	                        shippinginfoSendMail(fax,mail,shippinginfosendtype,div,recordId,customform,customer,subsidiary,mailType,salesman)
	                        shippinginfoSendMail(fax,mail,shippinginfosendtype,div[kk],recordId,customform,customer,subsidiary,mailType,salesman)
	                    }
	                }
	            }
	        }
//	    }else if(div == 8){
	    }
//	    if(div == 8){
	    if(div[kk] == 8){
	        mailType = '個別請求書';
	        nlapiLogExecution('debug','mailType',mailType);
	        var invoiceSendmailObj = data.invoiceSendmailObj;
	        var invoiceSendmailsendtype = invoiceSendmailObj.invoiceSendmailsendtype;//DJ_請求書送信区分
	        var invoiceSendmaildesttype = invoiceSendmailObj.invoiceSendmaildesttype;//DJ_請求書送信先区分
	        var invoiceSendmailrep = invoiceSendmailObj.invoiceSendmailrep;//DJ_請求書送信先担当者
	        var invoiceSendmaildestname = invoiceSendmailObj.invoiceSendmaildestname;//DJ_請求書送信先会社名(3RDパーティー)
	        var invoiceSendmaildestrep = invoiceSendmailObj.invoiceSendmaildestrep;//DJ_請求書送信先担当者(3RDパーティー)
	        var invoiceSendmaildestemail = invoiceSendmailObj.invoiceSendmaildestemail;//DJ_請求書送信先メール(3RDパーティー)
	        var invoiceSendmaildestfax = invoiceSendmailObj.invoiceSendmaildestfax;//DJ_請求書送信先FAX(3RDパーティー)
	        var invoiceSendmaildestmemo = invoiceSendmailObj.invoiceSendmaildestmemo;//DJ_請求書送信先登録メモ
	        nlapiLogExecution('debug','status',status)
	        nlapiLogExecution('debug','invoiceSendmailsendtype',invoiceSendmailsendtype)
	        nlapiLogExecution('debug','invoiceSendmaildesttype',invoiceSendmaildesttype)

	        if(status == '2'){
	            //DJ_請求書送信
	            if(invoiceSendmailsendtype != '17'){
	                if(invoiceSendmaildesttype == '21'){
	                    //送信顧客先の場合
	                    var custRecord = nlapiLoadRecord('customer',customer);
	                    var fax = defaultEmpty(custRecord.getFieldValue('fax')); //fax
	                    var mail = defaultEmpty(custRecord.getFieldValue('email')); //email
	                    //add by zzq CH821 20230823 start
	                    var custName = defaultEmpty(custRecord.getFieldValue('companyname')); //顧客
	                    var mailrep = defaultEmpty(invoiceSendmailrep);//請求書送信先担当者
	                    var mailHeader = '';
	                    if(custName && mailrep){
	                        mailHeader = custName+'　'+mailrep;
	                    }else if(custName && !mailrep){
	                        mailHeader = custName;
	                    }else if(!custName && mailrep){
	                        mailHeader = mailrep;
	                    }
	                    //add by zzq CH821 20230823 end
//	                    salesman = invoiceSendmailrep;
//	                    invoiceSendmail(fax,mail,invoiceSendmailsendtype,div,recordId,customform,subsidiary,mailType,salesman,div)
	                    invEmailFlag = invoiceSendmail(fax,mail,invoiceSendmailsendtype,div[kk],recordId,customform,subsidiary,mailType,salesman,div[kk],recordType,mailHeader)
	                }else{
	                    //3rd
	                    //add by zzq CH821 20230823 start
                        var custName = defaultEmpty(invoiceSendmaildestname); //顧客
                        var mailrep = defaultEmpty(invoiceSendmaildestrep);//請求書送信先担当者
                        var mailHeader = '';
                        if(custName && mailrep){
                            mailHeader = custName+'　'+mailrep;
                        }else if(custName && !mailrep){
                            mailHeader = custName;
                        }else if(!custName && mailrep){
                            mailHeader = mailrep;
                        }
                        //add by zzq CH821 20230823 end
	                    var fax = defaultEmpty(invoiceSendmaildestfax);
	                    var mail = defaultEmpty(invoiceSendmaildestemail);
//	                  salesman = invoiceSendmaildestrep;
//	                    invoiceSendmail(fax,mail,invoiceSendmailsendtype,div,recordId,customform,subsidiary,mailType,salesman,div)
                        //add by zzq CH821 20230823 start
//	                    invEmailFlag = invoiceSendmail(fax,mail,invoiceSendmailsendtype,div[kk],recordId,customform,subsidiary,mailType,salesman,div[kk],recordType)
	                    invEmailFlag = invoiceSendmail(fax,mail,invoiceSendmailsendtype,div[kk],recordId,customform,subsidiary,mailType,salesman,div[kk],recordType,mailHeader)
	                    //add by zzq CH821 20230823 end
	                }
	            }
	        }
//	    }else if (div == 9){
	    }
//	    if (div == 9){
	    if (div[kk] == 9){
	        if(customform == '121'){
//	          mailType = '納品書';
	            mailType = '価格入り納品書';
	        }else if(customform == '175'){
	            mailType = '価格入り納品書';
	            //納品書送信
	            var deliverySendmailObj = data.deliverySendmailObj;
	            var deliveryPeriodtype = deliverySendmailObj.deliveryPeriodtype;//DJ_納品書送信方法    
	            var deliverySite = deliverySendmailObj.deliverySite;//DJ_納品書送信先
	            var deliveryPerson = deliverySendmailObj.deliveryPerson;//DJ_納品書送信先担当者
	            var deliverySubName = deliverySendmailObj.deliverySubName;//DJ_納品書送信先会社名(3RDパーティー)
	            var deliveryPersont = deliverySendmailObj.deliveryPersont;//DJ_納品書送信先担当者(3RDパーティー)  
	            var deliveryEmail = deliverySendmailObj.deliveryEmail;//DJ_納品書送信先メール(3RDパーティー)  
	            var deliveryFax = deliverySendmailObj.deliveryFax;//DJ_納品書送信先FAX(3RDパーティー)  
	            var deliveryMemo = deliverySendmailObj.deliveryMemo;//DJ_納品書自動送信送付先備考
	            if(status == 'B'){
	                if(deliveryPeriodtype != '10'){
	                    if(deliverySite == '16'){
	                        //送信顧客先の場合
	                        var custRecord = nlapiLoadRecord('customer',customer);
	                        var fax = defaultEmpty(custRecord.getFieldValue('fax')); //fax
	                        var mail = defaultEmpty(custRecord.getFieldValue('email')); //email
	    //                  salesman = deliveryPerson;
//	                        deliverySendmail(fax,mail,deliveryPeriodtype,div,recordId,customform,customer,subsidiary,mailType,salesman,div)
	                        delivEmailFlag = deliverySendmail(fax,mail,deliveryPeriodtype,div[kk],recordId,customform,customer,subsidiary,mailType,salesman,div[kk])
	                    }else if(deliverySite == '14'){
	                        //3rdの場合
	                        var fax = defaultEmpty(deliveryFax);
	                        var mail = defaultEmpty(deliveryEmail); 
	    //                  salesman = deliveryPersont;
//	                        deliverySendmail(fax,mail,deliveryPeriodtype,div,recordId,customform,customer,subsidiary,mailType,salesman,div)
	                        delivEmailFlag = deliverySendmail(fax,mail,deliveryPeriodtype,div[kk],recordId,customform,customer,subsidiary,mailType,salesman,div[kk])
	                    }else if(deliverySite == '15'){
	                        //納品先の場合
	                        var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',delivery);
	                        var fax = defaultEmpty(deliveryRecord.getFieldValue('custrecord_djkk_fax')); //fax
	                        var mail = defaultEmpty(deliveryRecord.getFieldValue('custrecord_djkk_email')); //email
	    //                  salesman = deliveryPerson;
//	                        deliverySendmail(fax,mail,deliveryPeriodtype,div,recordId,customform,customer,subsidiary,mailType,salesman,div)
	                        delivEmailFlag = deliverySendmail(fax,mail,deliveryPeriodtype,div[kk],recordId,customform,customer,subsidiary,mailType,salesman,div[kk])
	                    }
	    //              }else if (deliverySite == '24'){
	    //                  //倉庫送信の場合
	    //                  var soRecord = nlapiLoadRecord('salesorder',recordId);
	    //                  var location = defaultEmpty(soRecord.getFieldValue('location'));
	    //                  if(!isEmpty(location)){
	    //                      var locationSearch = nlapiSearchRecord("location",null,
	    //                              [
	    //                               "internalid","anyof",location
	    //                              ], 
	    //                              [
	    //                                 new nlobjSearchColumn("custrecord_djkk_mail","address",null), //email
	    //                                 new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
	    //                                 new nlobjSearchColumn("internalid"),
	    //                                 new nlobjSearchColumn("name")
	    //                              ]
	    //                              );
	    //                      
	    //                      if(!isEmpty(locationSearch)){
	    //                          var locationName = locationSearch[0].getValue("name"); //場所名
	    //                          var mail = locationSearch[0].getValue("custrecord_djkk_mail","address",null); //場所email
	    //                          var fax = locationSearch[0].getValue("custrecord_djkk_address_fax","address",null); //場所fax
	    //                          if(!isEmpty(mail)){
	    //                              if(locationName.indexOf("DPKK")>-1){
	    //                                  //バーコード付けてと出荷指図書出力
	    //                                  var fileID = barcodePdf(recordId);
	    //                                  var fileArr = [];
	    //                                  fileArr.push(fileID);
	    //                                  fileID = fileArr;
	    //                                  deliverySendmail(fax,mail,deliveryPeriodtype,div,recordId,fileID)
	    //                              }else if(locationName.indexOf("Keihin")<0 && locationName.indexOf("DPKK")<0){
	    //                                  //配送依頼書出力   
	    //
	    //                              }
	    //                          }
	    //                      }
	    //                  }
	    //              }
	                }
	            }
	        }
	    }
	//  else if(div == 10){
//	      mailType = '合計請求書';
//	      var invoiceSumSendmailObj = data.invoiceSumSendmailObj;
//	      var invoiceSumPeriodtype = invoiceSumSendmailObj.invoiceSumPeriodtype;//DJ_合計請求書送信区分
//	      var invoiceSumSite = invoiceSumSendmailObj.invoiceSumSite;//DJ_合計請求書送信先区分
//	      var invoiceSumPerson = invoiceSumSendmailObj.invoiceSumPerson;//DJ_合計請求書送信先担当者
//	      var invoiceSumSubName = invoiceSumSendmailObj.invoiceSumSubName;//DJ_合計請求書送信先会社名(3RDパーティー)
//	      var invoiceSumPersont = invoiceSumSendmailObj.invoiceSumPersont;//DJ_合計請求書送信先担当者(3RDパーティー)
//	      var invoiceSumEmail = invoiceSumSendmailObj.invoiceSumEmail;//DJ_合計請求書送信先メール(3RDパーティー)
//	      var invoiceSumFax = invoiceSumSendmailObj.invoiceSumFax;//DJ_合計請求書送信先FAX(3RDパーティー)
//	      var invoiceSumMemo = invoiceSumSendmailObj.invoiceSumMemo;//DJ_合計請求書送信先登録メモ
//	      if(status == '2'){
//	          //DJ_合計請求書送信
//	          if(invoiceSumPeriodtype != '25'){
//	              if(invoiceSumSite == '29'){
//	                  //送信顧客先の場合
//	                  nlapiLogExecution('debug','invoiceSum','invoiceSum')
//	                  var custRecord = nlapiLoadRecord('customer',customer);
//	                  var fax = defaultEmpty(custRecord.getFieldValue('fax')); //fax
//	                  var mail = defaultEmpty(custRecord.getFieldValue('email')); //email
//	                  nlapiLogExecution('debug','mail1',mail)
//	                  nlapiLogExecution('debug','fax',fax)
////	                    salesman = invoiceSumPerson;
//	                  invoiceSumSendmail(fax,mail,invoiceSumPeriodtype,div,recordId,customform,subsidiary,mailType,salesman)
//	              }else{
//	                  //3rd
//	                  var fax = defaultEmpty(invoiceSumEmail);
//	                  var mail = defaultEmpty(invoiceSumFax);
////	                    salesman = invoiceSumPersont;
//	                  invoiceSumSendmail(fax,mail,invoiceSumPeriodtype,div,recordId,customform,subsidiary,mailType,salesman)
//	              }
//	          }
//	      }
	//  }
//	    else if (div == 11){
//        if (div == 11){
        if (div[kk] == 11){
	        //クレジットメモ - 価格入り納品書送信
	        if(customform == '120'){
	            mailType = '価格入り納品書';
	            //納品書送信
	            var deliverySendmailObj = data.deliverySendmailObj;
	            var deliveryPeriodtype = deliverySendmailObj.deliveryPeriodtype;//クレジットメモ - DJ_納品書送信方法  
	            var deliverySite = deliverySendmailObj.deliverySite;//クレジットメモ - DJ_納品書送信先
	            var deliveryPerson = deliverySendmailObj.deliveryPerson;//クレジットメモ - DJ_納品書送信先担当者
	            var deliverySubName = deliverySendmailObj.deliverySubName;//クレジットメモ - DJ_納品書送信先会社名(3RDパーティー)
	            var deliveryPersont = deliverySendmailObj.deliveryPersont;//クレジットメモ - DJ_納品書送信先担当者(3RDパーティー)    
	            var deliveryEmail = deliverySendmailObj.deliveryEmail;//クレジットメモ - DJ_納品書送信先メール(3RDパーティー)    
	            var deliveryFax = deliverySendmailObj.deliveryFax;//クレジットメモ - DJ_納品書送信先FAX(3RDパーティー)    
	            var deliveryMemo = deliverySendmailObj.deliveryMemo;//クレジットメモ - DJ_納品書自動送信送付先備考
//	          if(status == 'B'){
	                if(deliveryPeriodtype != '10'){
	                    if(deliverySite == '16'){
	                        //送信顧客先の場合
	                        var custRecord = nlapiLoadRecord('customer',customer);
	                        var fax = defaultEmpty(custRecord.getFieldValue('fax')); //fax
	                        var mail = defaultEmpty(custRecord.getFieldValue('email')); //email
	    //                  salesman = deliveryPerson;
//	                        deliverySendmail(fax,mail,deliveryPeriodtype,div,recordId,customform,customer,subsidiary,mailType,salesman,div)
	                        delivEmailFlag = deliverySendmail(fax,mail,deliveryPeriodtype,div[kk],recordId,customform,customer,subsidiary,mailType,salesman,div[kk],recordType)
	                    }else if(deliverySite == '14'){
	                        //3rdの場合
	                        var fax = defaultEmpty(deliveryFax);
	                        var mail = defaultEmpty(deliveryEmail); 
	    //                  salesman = deliveryPersont;
//	                        deliverySendmail(fax,mail,deliveryPeriodtype,div,recordId,customform,customer,subsidiary,mailType,salesman,div)
	                        delivEmailFlag = deliverySendmail(fax,mail,deliveryPeriodtype,div[kk],recordId,customform,customer,subsidiary,mailType,salesman,div[kk],recordType)
	                    }else if(deliverySite == '15'){
	                        //納品先の場合
	                        var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',delivery);
	                        var fax = defaultEmpty(deliveryRecord.getFieldValue('custrecord_djkk_fax')); //fax
	                        var mail = defaultEmpty(deliveryRecord.getFieldValue('custrecord_djkk_email')); //email
	    //                  salesman = deliveryPerson;
//	                        deliverySendmail(fax,mail,deliveryPeriodtype,div,recordId,customform,customer,subsidiary,mailType,salesman,div)
	                        delivEmailFlag = deliverySendmail(fax,mail,deliveryPeriodtype,div[kk],recordId,customform,customer,subsidiary,mailType,salesman,div[kk],recordType)
	                    }
	    //              }else if (deliverySite == '24'){
	    //                  //倉庫送信の場合
	    //                  var soRecord = nlapiLoadRecord('salesorder',recordId);
	    //                  var location = defaultEmpty(soRecord.getFieldValue('location'));
	    //                  if(!isEmpty(location)){
	    //                      var locationSearch = nlapiSearchRecord("location",null,
	    //                              [
	    //                               "internalid","anyof",location
	    //                              ], 
	    //                              [
	    //                                 new nlobjSearchColumn("custrecord_djkk_mail","address",null), //email
	    //                                 new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
	    //                                 new nlobjSearchColumn("internalid"),
	    //                                 new nlobjSearchColumn("name")
	    //                              ]
	    //                              );
	    //                      
	    //                      if(!isEmpty(locationSearch)){
	    //                          var locationName = locationSearch[0].getValue("name"); //場所名
	    //                          var mail = locationSearch[0].getValue("custrecord_djkk_mail","address",null); //場所email
	    //                          var fax = locationSearch[0].getValue("custrecord_djkk_address_fax","address",null); //場所fax
	    //                          if(!isEmpty(mail)){
	    //                              if(locationName.indexOf("DPKK")>-1){
	    //                                  //バーコード付けてと出荷指図書出力
	    //                                  var fileID = barcodePdf(recordId);
	    //                                  var fileArr = [];
	    //                                  fileArr.push(fileID);
	    //                                  fileID = fileArr;
	    //                                  deliverySendmail(fax,mail,deliveryPeriodtype,div,recordId,fileID)
	    //                              }else if(locationName.indexOf("Keihin")<0 && locationName.indexOf("DPKK")<0){
	    //                                  //配送依頼書出力   
	    //
	    //                              }
	    //                          }
	    //                      }
	    //                  }
	    //              }
	                }
//	          }
	        }
//	    }else if(div == 12){
	    }
//        if(div == 12){
        if(div[kk] == 12){
	        //クレジットメモ - 個別請求書送信
	        mailType = '個別請求書';
	        var invoiceSendmailObj = data.invoiceSendmailObj;
	        var invoiceSendmailsendtype = invoiceSendmailObj.invoiceSendmailsendtype;//クレジットメモ - DJ_請求書送信区分
	        var invoiceSendmaildesttype = invoiceSendmailObj.invoiceSendmaildesttype;//クレジットメモ - DJ_請求書送信先区分
	        var invoiceSendmailrep = invoiceSendmailObj.invoiceSendmailrep;//クレジットメモ - DJ_請求書送信先担当者
	        var invoiceSendmaildestname = invoiceSendmailObj.invoiceSendmaildestname;//クレジットメモ - DJ_請求書送信先会社名(3RDパーティー)
	        var invoiceSendmaildestrep = invoiceSendmailObj.invoiceSendmaildestrep;//クレジットメモ - DJ_請求書送信先担当者(3RDパーティー)
	        var invoiceSendmaildestemail = invoiceSendmailObj.invoiceSendmaildestemail;//クレジットメモ - DJ_請求書送信先メール(3RDパーティー)
	        var invoiceSendmaildestfax = invoiceSendmailObj.invoiceSendmaildestfax;//クレジットメモ - DJ_請求書送信先FAX(3RDパーティー)
	        var invoiceSendmaildestmemo = invoiceSendmailObj.invoiceSendmaildestmemo;//クレジットメモ - DJ_請求書送信先登録メモ
//	      if(status == '2'){
	            //DJ_請求書送信
	            if(invoiceSendmailsendtype != '17'){
	                if(invoiceSendmaildesttype == '21'){
	                    //送信顧客先の場合
	                    var custRecord = nlapiLoadRecord('customer',customer);
	                    var fax = defaultEmpty(custRecord.getFieldValue('fax')); //fax
	                    var mail = defaultEmpty(custRecord.getFieldValue('email')); //email
//	                  salesman = invoiceSendmailrep;
//	                    invoiceSendmail(fax,mail,invoiceSendmailsendtype,div,recordId,customform,subsidiary,mailType,salesman,div)
	                    invEmailFlag = invoiceSendmail(fax,mail,invoiceSendmailsendtype,div[kk],recordId,customform,subsidiary,mailType,salesman,div[kk],recordType)
	                }else{
	                    
	                    //3rd
	                    var fax = defaultEmpty(invoiceSendmaildestfax);
	                    var mail = defaultEmpty(invoiceSendmaildestemail);
	                    nlapiLogExecution('debug','クレジット 3rd mail',mail)
//	                  salesman = invoiceSendmaildestrep;
//	                    invoiceSendmail(fax,mail,invoiceSendmailsendtype,div,recordId,customform,subsidiary,mailType,salesman,div)
	                    invEmailFlag = invoiceSendmail(fax,mail,invoiceSendmailsendtype,div[kk],recordId,customform,subsidiary,mailType,salesman,div[kk],recordType)
	                }
	            }
//	      }
	    }
	    // CH775 add by zdj 20230804 start
//	    else if(div == 13){
        if(div[kk] == 13){
	        nlapiLogExecution('DEBUG', 'data', JSON.stringify(data));
	        //クレジットメモ - 価格入り納品書送信
	        if (customform == '160') {
	            mailType = '価格入り納品書';
	            //納品書送信
	            var deliverySendmailObj = data.deliverySendmailObj;
	            var deliveryPeriodtype = deliverySendmailObj.deliveryPeriodtype;//請求書 - DJ_納品書送信方法  
	            var deliverySite = deliverySendmailObj.deliverySite;//請求書 - DJ_納品書送信先
	            var deliveryPerson = deliverySendmailObj.deliveryPerson;//請求書 - DJ_納品書送信先担当者
	            var deliverySubName = deliverySendmailObj.deliverySubName;//請求書 - DJ_納品書送信先会社名(3RDパーティー)
	            var deliveryPersont = deliverySendmailObj.deliveryPersont;//請求書 - DJ_納品書送信先担当者(3RDパーティー)    
	            var deliveryEmail = deliverySendmailObj.deliveryEmail;//請求書 - DJ_納品書送信先メール(3RDパーティー)    
	            var deliveryFax = deliverySendmailObj.deliveryFax;//請求書 - DJ_納品書送信先FAX(3RDパーティー)    
	            var deliveryMemo = deliverySendmailObj.deliveryMemo;//請求書 - DJ_納品書自動送信送付先備考
	            var deliveryBookFlag = deliverySendmailObj.deliveryBookFlag;
	            if (deliveryPeriodtype != '10') {
	                if (deliverySite == '16') {
	                    //送信顧客先の場合
	                    var custRecord = nlapiLoadRecord('customer', customer);
	                    var fax = defaultEmpty(custRecord.getFieldValue('fax')); //fax
	                    var mail = defaultEmpty(custRecord.getFieldValue('email')); //email

//	                    deliverySendmail(fax, mail, deliveryPeriodtype, div, recordId, customform, customer, subsidiary, mailType, salesman, div);
	                    delivEmailFlag = deliverySendmail(fax, mail, deliveryPeriodtype, div[kk], recordId, customform, customer, subsidiary, mailType, salesman, div[kk],recordType);
	                } else if (deliverySite == '14') {
	                    //3rdの場合
	                    var fax = defaultEmpty(deliveryFax);
	                    var mail = defaultEmpty(deliveryEmail);

//	                    deliverySendmail(fax, mail, deliveryPeriodtype, div, recordId, customform, customer, subsidiary, mailType, salesman, div);
	                    delivEmailFlag = deliverySendmail(fax, mail, deliveryPeriodtype, div[kk], recordId, customform, customer, subsidiary, mailType, salesman, div[kk],recordType);
	                } else if (deliverySite == '15') {
	                    //納品先の場合
	                    var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination', delivery);
	                    var fax = defaultEmpty(deliveryRecord.getFieldValue('custrecord_djkk_fax')); //fax
	                    var mail = defaultEmpty(deliveryRecord.getFieldValue('custrecord_djkk_email')); //email

//	                    deliverySendmail(fax, mail, deliveryPeriodtype, div, recordId, customform, customer, subsidiary, mailType, salesman, div);
	                    delivEmailFlag = deliverySendmail(fax, mail, deliveryPeriodtype, div[kk], recordId, customform, customer, subsidiary, mailType, salesman, div[kk],recordType);
	                }
	            }
	        }
	    }
        nlapiSetRecoveryPoint();
	    // CH775 add by zdj 20230804 end
        var context = nlapiGetContext();
        nlapiLogExecution('debug','forEnd',context.getRemainingUsage() );
	}
	if(delivEmailFlag && invEmailFlag){
	    nlapiSubmitField(recordType, recordId, ['custbody_djkk_delivery_book_flag','custbody_djkk_invoice_book_flag'], ['T','T']);
	}else if(!delivEmailFlag && invEmailFlag){
	    nlapiSubmitField(recordType, recordId, 'custbody_djkk_invoice_book_flag', 'T');
	}else if(delivEmailFlag && !invEmailFlag){
	    nlapiSubmitField(recordType, recordId, 'custbody_djkk_delivery_book_flag', 'T');
	}else{
	    
	}
	 
}
function shippinginfoSendMail(fax,mail,sendtype,div,id,custform,customer,subsidiary,mailType,salesman){
	var sendMailFlag = 'F';
	var sendFaxFlag = 'F';
//	var mail;
	var mailOverFlag = '';
	var faxOverFlag = '';
	if(sendtype == '34'&& !isEmpty(fax)){
		//faxの場合
		sendFaxFlag ='T'
		var faxTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman).faxTempleteObj;
		var faxFileName = faxTempleteObj.fileName;
		var faxfile = outGoingPdf(faxFileName);
		var faxfileArr = [];
		faxfileArr.push(faxfile);
		faxfile = faxfileArr;
		faxOverFlag = automaticSendFax(faxTempleteObj,faxfile)
	}else if(sendtype == '35'&& !isEmpty(mail)){
		//emailの場合
		sendMailFlag = 'T';
		var mailTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman).mailTempleteObj;
		var mailFileName = mailTempleteObj.fileName;
		var mailFile = outGoingPdf(mailFileName);
		var mailFileArr = [];
		mailFileArr.push(mailFile);
		mailFile = mailFileArr;
		mailOverFlag = automaticSendmail(mailTempleteObj,mailFile)
	}else if(sendtype == '37'){
		//fax&emailの場合
		sendMailFlag = 'T';
		sendFaxFlag = 'T';
		var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman)
		var mailTempleteObj = templeteObj.mailTempleteObj;
		var faxTempleteObj = templeteObj.faxTempleteObj;
		var mailFileName = mailTempleteObj.fileName;
		var faxFileName = faxTempleteObj.fileName;
		
		var mailFile = outGoingPdf(mailFileName);
		var mailFileArr = [];
		mailFileArr.push(mailFile);
		mailFile = mailFileArr;
		
		var faxfile = outGoingPdf(faxFileName);
		var faxfileArr = [];
		faxfileArr.push(faxfile);
		faxfile = faxfileArr;
		
		mailOverFlag = automaticSendmail(mailTempleteObj,mailFile)
		faxOverFlag = automaticSendFax(faxTempleteObj,faxfile)
	}else if(sendtype == '101'){
		//顧客参照
		var customerRecord = nlapiLoadRecord('customer',customer);
		var shippinginfosendtyp = customerRecord.getFieldValue('custentity_djkk_shippinginfosendtyp');
		if(shippinginfosendtyp == '35'){
			//顧客参照 == email
			sendMailFlag = 'T';
			var mailTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman).mailTempleteObj;
			var mailFileName = mailTempleteObj.fileName;
			var mailFile = outGoingPdf(mailFileName);
			var mailFileArr = [];
			mailFileArr.push(mailFile);
			mailFile = mailFileArr;

			mailOverFlag = automaticSendmail(mailTempleteObj,mailFile)
		}else if(shippinginfosendtyp == '34'){
			sendFaxFlag = 'T';
			var faxTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman).faxTempleteObj;
			var faxFileName = faxTempleteObj.fileName;
			var faxfile = outGoingPdf(faxFileName);
			var faxfileArr = [];
			faxfileArr.push(faxfile);
			faxfile = faxfileArr;
			faxOverFlag = automaticSendFax(faxTempleteObj,faxfile)
		}else if(shippinginfosendtyp == '37'){
			sendMailFlag = 'T';
			sendFaxFlag = 'T';
			var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman)
			var mailTempleteObj = templeteObj.mailTempleteObj;
			var faxTempleteObj = templeteObj.faxTempleteObj;
			var mailFileName = mailTempleteObj.fileName;
			var faxFileName = faxTempleteObj.fileName;
			
			var mailFile = outGoingPdf(mailFileName);
			var mailFileArr = [];
			mailFileArr.push(mailFile);
			mailFile = mailFileArr;
			
			var faxfile = outGoingPdf(faxFileName);
			var faxfileArr = [];
			faxfileArr.push(faxfile);
			faxfile = faxfileArr;
			
			mailOverFlag = automaticSendmail(mailTempleteObj,mailFile)
			faxOverFlag = automaticSendFax(faxTempleteObj,faxfile)

		}
	}
	if(!isEmpty(mailOverFlag)){
		nlapiLogExecution('DEBUG', 'Email送信結果', mailOverFlag)
	}
	if(!isEmpty(faxOverFlag)){
		nlapiLogExecution('DEBUG', 'FAX送信結果', faxOverFlag)
	}
	return true;
}
function invoiceSendmail(fax,mail,sendtype,div,id,customform,subsidiary,mailType,salesman,div,recordType,mailHeader){
    nlapiLogExecution('DEBUG', 'mailHeader', mailHeader)
    var invEmailFlag = false;
	var sendMailFlag = 'F';
	var sendFaxFlag = 'F';
	var mailOverFlag = '';
	var faxOverFlag = '';
	if(sendtype == '18' && !isEmpty(fax)){
		//faxの場合
		sendFaxFlag = 'T';
		var faxTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman).faxTempleteObj;
		var faxFileName = faxTempleteObj.fileName;
		if(div == '12'){
			//クレジットメモ FOODFORM 
			var faxfile = creditmemoInvPdfmaker(id,customform,faxFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
		}else{
		    //add by zzq CH821 20230823 start
//		    var faxfile = pdfmaker(id,customform,faxFileName);
			var faxfile = pdfmaker(id,customform,faxFileName,mailHeader,sendFaxFlag);
			//add by zzq CH821 20230823 end
		}
		var faxfileArr = [];
		faxfileArr.push(faxfile);
		faxfile = faxfileArr;
		 nlapiLogExecution('DEBUG', 'faxfile', faxfile)
		faxOverFlag = automaticSendFax(faxTempleteObj,faxfile)
	}else if(sendtype == '19' && !isEmpty(mail)){
		//emailの場合
		sendMailFlag = 'T';
		var transactionnumber = '';
		if(recordType == 'invoice'){
		transactionnumber = nlapiLookupField("invoice", id, "transactionnumber"); 
		}else if(recordType == 'creditmemo'){
		transactionnumber = nlapiLookupField("creditmemo", id, "transactionnumber"); 
		}
		
		var mailTempleteObj;
		//var mailTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman).mailTempleteObj;
		if(div == 8){
		     mailTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,transactionnumber,recordType).mailTempleteObj;
		}else{
		//クレジットメモ
		     mailTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,transactionnumber,recordType).mailTempleteObj;
		}
		var mailFileName = mailTempleteObj.fileName;
		if(div == '12'){
			//クレジットメモ FOODFORM
			var mailFile = creditmemoInvPdfmaker(id,customform,mailFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
		}else{
			var mailFile = pdfmaker(id,customform,mailFileName);
		}
		var mailFileArr = [];
		mailFileArr.push(mailFile);
		mailFile = mailFileArr;
		//add by zzq CH821 20230823 start
		nlapiLogExecution('DEBUG', 'mailTempleteObj.body0', mailTempleteObj.body)
		mailTempleteObj.body = mailHeader+'\r\n'+'\r\n' + mailTempleteObj.body;
		nlapiLogExecution('DEBUG', 'mailTempleteObj.body1', mailTempleteObj.body)
		mailOverFlag = automaticSendmail(mailTempleteObj,mailFile)
	}else if(sendtype == '20'){
		//fax&emailの場合
		sendMailFlag = 'T';
		sendFaxFlag = 'T';
		var transactionnumber = '';
        if(recordType == 'invoice'){
        transactionnumber = nlapiLookupField("invoice", id, "transactionnumber"); 
        }else if(recordType == 'creditmemo'){
        transactionnumber = nlapiLookupField("creditmemo", id, "transactionnumber"); 
        }
		var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,transactionnumber,recordType)
		var mailTempleteObj = templeteObj.mailTempleteObj;
		var faxTempleteObj = templeteObj.faxTempleteObj;
		var mailFileName = mailTempleteObj.fileName;
		var faxFileName = faxTempleteObj.fileName;
		if(div == '12'){
			//クレジットメモ FOODFORM
			var faxfile = creditmemoInvPdfmaker(id,customform,faxFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
			var mailFile = creditmemoInvPdfmaker(id,customform,mailFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
		}else{
			var faxfile = pdfmaker(id,customform,faxFileName,mailHeader,sendFaxFlag);
			var mailFile = pdfmaker(id,customform,mailFileName);
		}


		var mailFileArr = [];
		mailFileArr.push(mailFile);
		mailFile = mailFileArr;
		

		var faxfileArr = [];
		faxfileArr.push(faxfile);
		faxfile = faxfileArr;
		//add by zzq CH821 20230823 start
        mailTempleteObj.body = mailHeader + '\r\n'+'\r\n' + mailTempleteObj.body;
        //add by zzq CH821 20230823 end
		mailOverFlag = automaticSendmail(mailTempleteObj,mailFile)
		faxOverFlag = automaticSendFax(faxTempleteObj,faxfile)
//		sendFax(nlapiGetUser, fax, title, body, id, div,file);
//		sendEmail(nlapiGetUser(), mail, title, body, id, div,file);
	}
	if(!isEmpty(mailOverFlag)){
		if(mailOverFlag == 'Sending succeeded'){
		    invEmailFlag = true;
		}
		nlapiLogExecution('DEBUG', 'Email送信結果', mailOverFlag)
	}
	if(!isEmpty(faxOverFlag)){
		if(faxOverFlag == 'FAX送信一時停止'){
		    invEmailFlag = true;
		}
		nlapiLogExecution('DEBUG', 'FAX送信結果', faxOverFlag)
	}
	return invEmailFlag;
}
function deliverySendmail(fax,mail,sendtype,div,id,custform,customer,subsidiary,mailType,salesman,div,recordType){
    nlapiLogExecution('debug', 'recordType', recordType);
	var sendMailFlag = 'F';
	var sendFaxFlag = 'F';
	var mailOverFlag = '';
	var faxOverFlag = '';
	var delivEmailFlag = false;
	if(sendtype == '11' && !isEmpty(fax)){
		//faxの場合
		sendFaxFlag = 'T';
		var faxTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman).faxTempleteObj;
		var faxFileName = faxTempleteObj.fileName;
		if(div == '11'){
			//クレジットメモ FOODFORM - 価格入り納品書
			var faxfile = creditmemoDeliveryPDF(id,custform,faxFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
		}
		// CH775 add by zdj 20230804 start
		else if(div == '13'){
			var faxfile = invoiceDeliveryPDF(id,custform,faxFileName);
		}
		// CH775 add by zdj 20230804 end
		else{
			var faxfile = deliveryPDF(id,custform,faxFileName);
		}
		var faxfileArr = [];
		faxfileArr.push(faxfile);
		faxfile = faxfileArr;
		faxOverFlag = automaticSendFax(faxTempleteObj,faxfile)
	}else if(sendtype == '12' && !isEmpty(mail)){
	    var transactionnumber = '';
        if(recordType == 'invoice'){
        transactionnumber = nlapiLookupField("invoice", id, "transactionnumber"); 
        }else if(recordType == 'creditmemo'){
        transactionnumber = nlapiLookupField("creditmemo", id, "transactionnumber"); 
        }
        nlapiLogExecution('debug', 'transactionnumber', transactionnumber);
        nlapiLogExecution('debug', 'id00001', id);
		//emailの場合
		sendMailFlag = 'T';
		var mailTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,transactionnumber,recordType).mailTempleteObj;
		var mailFileName = mailTempleteObj.fileName;
		
		if(div == '11'){
			//クレジットメモ FOODFORM - 価格入り納品書
			var mailFile = creditmemoDeliveryPDF(id,custform,mailFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
		}
		// CH775 add by zdj 20230804 start
		else if(div == '13'){
			var mailFile = invoiceDeliveryPDF(id,custform,mailFileName);
		}
		// CH775 add by zdj 20230804 end
		else{
			var mailFile = deliveryPDF(id,custform,mailFileName);
		}
		var mailFileArr = [];
		mailFileArr.push(mailFile);
		mailFile = mailFileArr;
		mailOverFlag = automaticSendmail(mailTempleteObj,mailFile)
	}else if(sendtype == '13'){
		//fax&emailの場合
		sendMailFlag = 'T';
		sendFaxFlag = 'T';
		var transactionnumber = '';
        if(recordType == 'invoice'){
        transactionnumber = nlapiLookupField("invoice", id, "transactionnumber"); 
        }else if(recordType == 'creditmemo'){
        transactionnumber = nlapiLookupField("creditmemo", id, "transactionnumber"); 
        }
		var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,transactionnumber,recordType)
		var mailTempleteObj = templeteObj.mailTempleteObj;
		var faxTempleteObj = templeteObj.faxTempleteObj;
		var mailFileName = mailTempleteObj.fileName;
		var faxFileName = faxTempleteObj.fileName;
		
		if(div == '11'){
			//クレジットメモ FOODFORM - 価格入り納品書
			var mailFile = creditmemoDeliveryPDF(id,custform,mailFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
			var faxfile = creditmemoDeliveryPDF(id,custform,faxFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
		}
		// CH775 add by zdj 20230804 start
		else if(div == '13'){
			var mailFile = invoiceDeliveryPDF(id,custform,mailFileName);
			var faxfile = invoiceDeliveryPDF(id,custform,faxFileName);
		}
		// CH775 add by zdj 20230804 end
		else{
			var mailFile = deliveryPDF(id,custform,mailFileName);
			var faxfile = deliveryPDF(id,custform,faxFileName);
		}
		var mailFileArr = [];
		mailFileArr.push(mailFile);
		mailFile = mailFileArr;
		
		var faxfileArr = [];
		faxfileArr.push(faxfile);
		faxfile = faxfileArr;
		mailOverFlag = automaticSendmail(mailTempleteObj,mailFile)
		faxOverFlag = automaticSendFax(faxTempleteObj,faxfile)
	}else if(sendtype == '9'){
		//顧客参照
		var customerRecord = nlapiLoadRecord('customer',customer);
		var customerPeriod = customerRecord.getFieldValue('custentity_djkk_delivery_book_period');
		var transactionnumber = '';
        if(recordType == 'invoice'){
        transactionnumber = nlapiLookupField("invoice", id, "transactionnumber"); 
        }else if(recordType == 'creditmemo'){
        transactionnumber = nlapiLookupField("creditmemo", id, "transactionnumber"); 
        }
		if(customerPeriod == '12'){
			//顧客参照 == email
			sendMailFlag = 'T';
			var mailTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,transactionnumber,recordType).mailTempleteObj;
			var mailFileName = mailTempleteObj.fileName;
			if(div == '11'){
				//クレジットメモ FOODFORM - 価格入り納品書
				var mailFile = creditmemoDeliveryPDF(id,custform,mailFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
			}
			// CH775 add by zdj 20230804 start
			else if(div == '13'){
				var mailFile = invoiceDeliveryPDF(id,custform,mailFileName);
			}
			// CH775 add by zdj 20230804 end
			else{
				var mailFile = deliveryPDF(id,custform,mailFileName);
			}
			var mailFileArr = [];
			mailFileArr.push(mailFile);
			mailFile = mailFileArr;
			mailOverFlag = automaticSendmail(mailTempleteObj,mailFile)	
		}else if(customerPeriod == '11'){
			sendFaxFlag = 'T';
			var faxTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman).faxTempleteObj;
			var faxFileName = faxTempleteObj.fileName;
			
			if(div == '11'){
				//クレジットメモ FOODFORM - 価格入り納品書
				var faxfile = creditmemoDeliveryPDF(id,custform,faxFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
			}
			// CH775 add by zdj 20230804 start
			else if(div == '13'){
				var faxfile = invoiceDeliveryPDF(id,custform,faxFileName);
			}
			// CH775 add by zdj 20230804 end
			else{
				var faxfile = deliveryPDF(id,custform,faxFileName);
			}
			var faxfileArr = [];
			faxfileArr.push(faxfile);
			faxfile = faxfileArr;
			faxOverFlag = automaticSendFax(faxTempleteObj,faxfile)
		}else if(customerPeriod == '13'){
			sendMailFlag = 'T';
			sendFaxFlag = 'T';
			var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,transactionnumber,recordType)
			var mailTempleteObj = templeteObj.mailTempleteObj;
			var faxTempleteObj = templeteObj.faxTempleteObj;
			var mailFileName = mailTempleteObj.fileName;
			var faxFileName = faxTempleteObj.fileName;
			
			if(div == '11'){
				//クレジットメモ FOODFORM - 価格入り納品書
				var mailFile = creditmemoDeliveryPDF(id,custform,mailFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
				var faxfile = creditmemoDeliveryPDF(id,custform,faxFileName);//金額受入品書 - FOOD クレジットメモ専用   詳細金額の負数表示
			}
			// CH775 add by zdj 20230804 start
			else if(div == '13'){
				var mailFile = invoiceDeliveryPDF(id,custform,mailFileName);
				var faxfile = invoiceDeliveryPDF(id,custform,faxFileName);
			}
			// CH775 add by zdj 20230804 end
			else{
				var mailFile = deliveryPDF(id,custform,mailFileName);
				var faxfile = deliveryPDF(id,custform,faxFileName);
			}
			var mailFileArr = [];
			mailFileArr.push(mailFile);
			mailFile = mailFileArr;
			var faxfileArr = [];
			faxfileArr.push(faxfile);
			faxfile = faxfileArr;
			mailOverFlag = automaticSendmail(mailTempleteObj,mailFile)
			faxOverFlag = automaticSendFax(faxTempleteObj,faxfile)			
		}
	}
	if(!isEmpty(mailOverFlag)){
		if(mailOverFlag == 'Sending succeeded'){
		    delivEmailFlag = true;
		}
		nlapiLogExecution('DEBUG', 'Email送信結果', mailOverFlag)
	}
	if(!isEmpty(faxOverFlag)){
		if(faxOverFlag == 'FAX送信一時停止'){
		    delivEmailFlag = true;
		}
		nlapiLogExecution('DEBUG', 'FAX送信結果', faxOverFlag)
	}
	return delivEmailFlag;
}
//合計請求書送信
//function invoiceSumSendmail(fax,mail,sendtype,div,id,customform,subsidiary,mailType,salesman){
//	var title;
//	var body;
//	var sendMailFlag = 'F';
//	var sendFaxFlag = 'F';
//	if(sendtype == '26' && !isEmpty(fax)){
//		//faxの場合
//		sendFaxFlag = 'T';
//		var faxTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman).faxTempleteObj;
//		var faxFileName = faxTempleteObj.fileName;
//		
//		var faxfile = pdfmaker(id,customform,faxFileName);
//		var faxfileArr = [];
//		faxfileArr.push(faxfile);
//		faxfile = faxfileArr;
//		automaticSendFax(faxTempleteObj,faxfile)
//	}else if(sendtype == '27' && !isEmpty(mail)){
//		//emailの場合
//		sendMailFlag = 'T';
//		var mailTempleteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman).mailTempleteObj;
//		var mailFileName = mailTempleteObj.fileName;
//		
//		var mailFile = pdfmaker(id,customform,mailFileName);
//		var mailFileArr = [];
//		mailFileArr.push(mailFile);
//		mailFile = mailFileArr;
//		automaticSendmail(mailTempleteObj,mailFile)
//	}else if(sendtype == '28' && !isEmpty(fax) && !isEmpty(mail)){
//		//fax&emailの場合
//		sendMailFlag = 'T';
//		sendFaxFlag = 'T';
//		var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman)
//		nlapiLogExecution('debug','templeteObj',JSON.stringify(templeteObj))
//		var mailTempleteObj = templeteObj.mailTempleteObj;
//		var faxTempleteObj = templeteObj.faxTempleteObj;
//		var mailFileName = mailTempleteObj.fileName;
//		var faxFileName = faxTempleteObj.fileName;
//		nlapiLogExecution('debug','mail',mail)
//		nlapiLogExecution('debug','mailFileName',mailFileName)
//		var mailFile = pdfmaker(id,customform,mailFileName);
//		var mailFileArr = [];
//		mailFileArr.push(mailFile);
//		mailFile = mailFileArr;
//		var faxfile = pdfmaker(id,customform,faxFileName);
//		var faxfileArr = [];
//		faxfileArr.push(faxfile);
//		faxfile = faxfileArr;
//		var mailOverFlag =automaticSendmail(mailTempleteObj,mailFile)
//		nlapiLogExecution('debug','mailover',mailover)
//		var faxOverFlag =automaticSendFax(faxTempleteObj,faxfile)
//		nlapiLogExecution('debug','faxover',faxover)
////		sendFax(nlapiGetUser, fax, title, body, id, div,file);
////		sendEmail(nlapiGetUser(), mail, title, body, id, div,file);
//	}
//}
function defaultEmpty(src){
	return src || '';
}

function pdfmaker(recordId,customform,fileName,mailHeader,sendFaxFlag){
		//請求書の値
	try{
		 if(customform == '179'){
			var invAmount = 0;
			var invTaxamount = 0;
			var invoiceItemArr = new Array();
			var invInventoryDetail = new Array();
			var invoiceRecord = nlapiLoadRecord('invoice',recordId);   //請求書
			var invoiceEntity = invoiceRecord.getFieldValue('entity')    //請求書顧客	
			var incustomerSearch= nlapiSearchRecord("customer",null,
				[
					["internalid","anyof",invoiceEntity]
				], 
				[
				 	new nlobjSearchColumn("address2","billingAddress",null), //請求先住所1
	    			new nlobjSearchColumn("address3","billingAddress",null), //請求先住所2
	    			new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
	    			new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
	    			new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県 		
	    			new nlobjSearchColumn("phone"), //電話番号
	    			new nlobjSearchColumn("fax"), //Fax
	    			new nlobjSearchColumn("custentity_djkk_language"),  //言語
	    			new nlobjSearchColumn("CUSTRECORD_DJKK_HONORIFIC_APPELLATION","billingAddress",null)//DJ_敬称
				]
				);	
			var honorieicAppellation = defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getText("CUSTRECORD_DJKK_HONORIFIC_APPELLATION","billingAddress",null));//DJ_敬称
			if(honorieicAppellation =='空白'){
				honorieicAppellation = '';
			}
			var invoiceAddress2= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("address2","billingAddress",null));//請求先住所 1
			var invoiceAddress1= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("address3","billingAddress",null));//請求先住所2
			var invoiceCity= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("city","billingAddress",null));//請求先市区町村
			var invoiceZipcode= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("zipcode","billingAddress",null));//請求先郵便番号
			var invoiceState= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//請求先都道府県 
			var invoicePhone= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("phone"));//電話番号
			var invoiceFax= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getValue("fax"));//fax
			var invoiceLanguage= defaultEmpty(isEmpty(incustomerSearch) ? '' :  incustomerSearch[0].getText("custentity_djkk_language"));//請求書言語
			
			var invoiceSubsidiary = invoiceRecord.getFieldValue('subsidiary')    //請求書子会社
			var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
				[
					["internalid","anyof",invoiceSubsidiary]
				], 
				[
					new nlobjSearchColumn("legalname"),  //正式名称
					new nlobjSearchColumn("name"), //名前
					new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
					new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
					new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
					new nlobjSearchColumn("address2","address",null), //住所1
					new nlobjSearchColumn("address3","address",null), //住所2
					new nlobjSearchColumn("city","address",null), //市区町村
					new nlobjSearchColumn("zip","address",null), //郵便番号
					new nlobjSearchColumn("custrecord_djkk_bank_1"), //銀行1
					new nlobjSearchColumn("custrecord_djkk_bank_2"), //銀行2	  
				]
				);	
			var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//正式名称
			var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//名前
			var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//住所1
			var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//住所2
			var invoiceBankOne= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getText("custrecord_djkk_bank_1"));//銀行1
			var invoiceBankTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getText("custrecord_djkk_bank_2"));//銀行2
			var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//郵便番号
			var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//市区町村
			var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
			var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
			var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//名前英語
			var invoiceBankOneId= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_1"));//銀行1
			var invoiceBankTwoId= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_2"));//銀行2
			
			if(!isEmpty(invoiceBankOneId)){
				var invoiceBank1 = nlapiLoadRecord('customrecord_djkk_bank', invoiceBankOneId);
				var invbranch_name1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_支店名
				var invbank_no1 = defaultEmpty(invoiceBank1.getFieldValue('custrecord_djkk_bank_no'));//DJ_口座番号
			}
			if(!isEmpty(invoiceBankTwoId)){
				var invoiceBank2 = nlapiLoadRecord('customrecord_djkk_bank', invoiceBankTwoId);
				var invbranch_name2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_支店名
				var invbank_no2 = defaultEmpty(invoiceBank2.getFieldValue('custrecord_djkk_bank_no'));//DJ_口座番号
			}
	
				
			
			var invoiceTrandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //請求書期日
			var invoiceTranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //請求書番号
			var invoicedelivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //請求書納品日
			var invoiceTerms = defaultEmpty(invoiceRecord.getFieldText('terms'));    //請求書支払条件（締め日無し）
			var invTersm = defaultEmpty(invoiceTerms.split('/'));
			var invTersmEng  = defaultEmpty(invTersm.slice(-1));
			var invTersmJap  = defaultEmpty(invTersm.slice(0,1));
	//		nlapiLogExecution('DEBUG', 'invTersmJap',invTersmJap);
			var invoiceOtherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //請求書発注書番号
			var invoiceCreatedfrom = defaultEmpty(invoiceRecord.getFieldText('createdfrom'));    //請求書受注番号
			var incoicedelivery_destination = invoiceRecord.getFieldValue('custbody_djkk_delivery_destination');    //請求書納品先
			var incoicedelivery_Name = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_delivery_destination'));    //請求書納品先名前
			if(!isEmpty(incoicedelivery_destination)){	
				
				var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
						[
							["internalid","anyof",incoicedelivery_destination]
						], 
						[
							new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
							new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
							new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
							new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
							new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
							new nlobjSearchColumn("custrecord_djkk_sales"),//納品先営業
								  
						]
						);	
				var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));
				var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));
				var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));
				var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));
				var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));
				var invdestinationSales = defaultEmpty(invDestinationSearch[0].getText('custrecord_djkk_sales'));
			}
		
			var invoiceCount = invoiceRecord.getLineItemCount('item');
			var invoiceAmountTotal = 0;
			var invoiceTaxamountTotal = 0;
			for(var k=1;k<invoiceCount+1;k++){
				invoiceRecord.selectLineItem('item',k);
				var invoiceItemId = invoiceRecord.getLineItemValue('item','item',k);	
				var invoiceLine = invoiceRecord.getLineItemValue('item','line',k);	
				var invoiceItemSearch = nlapiSearchRecord("item",null,
						[
						 	["internalid","anyof",invoiceItemId],
						],
						[
						  new nlobjSearchColumn("vendorname"), //仕入先商品コード
						  new nlobjSearchColumn("itemid"), //商品コード
						  new nlobjSearchColumn("displayname"), //商品名
						  new nlobjSearchColumn("custitem_djkk_storage_type"), //在庫区分
						  new nlobjSearchColumn("custitem_djkk_product_category_sml"), //配送温度
	
						]
						); 
					
					var invoiceVendorName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("vendorname"));//仕入先商品コード
					var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//商品コード
					var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
					var invoiceStorage_type= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getText("custitem_djkk_storage_type"));//在庫区分
					var invoiceDeliverytemptyp= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getText("custitem_djkk_product_category_sml"));//配送温度
			
				
				var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//数量
				var invoiceAmount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','amount',k)));//金額  
				if(!isEmpty(invoiceAmount)){
					var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');	
					invAmount  += invoiceAmount;
					var invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}else{
					var invAmountFormat = '';
				}
				
				
				var invoiceTaxamount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','tax1amt',k)));//税額   
				if(!isEmpty(invoiceTaxamount)){
					var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					invTaxamount += invoiceTaxamount;
					var invTaxmountTotal = invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}else{
					var invTaxamountFormat = '';
				}
				
					
				var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
				if(!isEmpty(invoTotal)){
					var invoToTotal = invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				}else{
					var invoToTotal ='';
				}
				
				
				var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//単価
				var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//単位
				//20221020 add by zhou 
				var invoiceUnitsArray;//単位array
				var invoiceUnit;//変更後単位
				if(!isEmpty(invoiceLanguage)&&!isEmpty(invoiceUnitabbreviation)){
					var invoiceUnitSearch = nlapiSearchRecord("unitstype",null,
							[
							   ["abbreviation","is",invoiceUnitabbreviation]
							], 
							[
							   new nlobjSearchColumn("abbreviation")
							]
							); 
					if(invoiceUnitSearch != null){
						if(invoiceLanguage == '英語'){			//英語
							invoiceUnitabbreviation = invoiceUnitSearch[0].getValue('abbreviation')+'';
							invoiceUnitsArray = invoiceUnitabbreviation.split("/");
							if(invoiceUnitsArray.length == 2){
								invoiceUnit = invoiceUnitsArray[1];
							}
						}else if(invoiceLanguage == '日本語'){				//日本語
							invoiceUnitabbreviation = invoiceUnitSearch[0].getValue('abbreviation')+'';
							invoiceUnitsArray = invoiceUnitabbreviation.split("/");
							if(!isEmpty(invoiceUnitsArray)){
								invoiceUnit = invoiceUnitabbreviation[0];
							}else if(soUnitsArray.length == 0){
								invoiceUnit = invoiceUnitabbreviation;
							}
						}
					}
				}
				//end
				var invoiceTaxrate1Format = defaultEmpty(invoiceRecord.getLineItemValue('item','taxrate1',k));//税率
				invoiceItemArr.push({
					invoiceItemId:invoiceItemId,
					invoiceDeliverytemptyp:invoiceDeliverytemptyp,//配送温度区分
					invoiceVendorName:invoiceVendorName,//仕入先商品コード
					invoiceInitemid:invoiceInitemid,//商品コード
					invoiceDisplayName:invoiceDisplayName,//商品名
					invoiceStorage_type:invoiceStorage_type,//在庫区分	
					invoiceQuantity:invoiceQuantity,//数量
					invoiceAmount:invAmountFormat,//金額  
					invoiceTaxamount:invTaxamountFormat,//税額
					invoiceRateFormat:invoiceRateFormat,//単価
					invoiceUnitabbreviation:defaultEmpty(invoiceUnit),//単位
					invoiceTaxrate1Format:invoiceTaxrate1Format,//税率
					invoiceLine:invoiceLine,
				}); 
				var inventoryDetail=invoiceRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //在庫詳細
				if(!isEmpty(inventoryDetail)){
					var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');//在庫詳細行
					if(inventoryDetailCount != 0){
						for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
							inventoryDetail.selectLineItem('inventoryassignment',j);
							var invReceiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
							if(isEmpty(invReceiptinventorynumber)){
						    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
						    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
					                    [
					                       ["internalid","is",invReordId]
					                    ], 
					                    [
					                     	new nlobjSearchColumn("inventorynumber"),
					                    ]
					                    );    
						    	invoiceSerialnumber = inventorynumberSearch[0].getValue("inventorynumber");////シリアル/ロット番号
					    	}
							var invoiceExpirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //有效期限
							invInventoryDetail.push({
								invoiceLine:invoiceLine,
								invoiceSerialnumber:invoiceSerialnumber,  //シリアル/ロット番号
								invoiceExpirationdate:invoiceExpirationdate, //有效期限
							}); 
						}
					}
				}else{
					invInventoryDetail.push({
						invoiceSerialnumber:'',  //シリアル/ロット番号
						invoiceExpirationdate:'', //有效期限
					}); 
				}
			}		
//		}
		var pdfName = new Array();
		if(invoiceLanguage == '英語'){
			pdfName.push('Invoice Book');
		}else if(invoiceLanguage == '日本語'){
			pdfName.push('請\xa0\xa0求\xa0\xa0書');
		}
		
	//	nlapiLogExecution('DEBUG', 'pdfName.length',pdfName.length);
		var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
		'<pdf>'+
		'<head>'+
		'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
		'<#if .locale == "zh_CN">'+
		'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
		'<#elseif .locale == "zh_TW">'+
		'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
		'<#elseif .locale == "ja_JP">'+
		'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
		'<#elseif .locale == "ko_KR">'+
		'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
		'<#elseif .locale == "th_TH">'+
		'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
		'</#if>'+
		'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
		'<#if .locale == "zh_CN">'+
		'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
		'<#elseif .locale == "zh_TW">'+
		'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
		'<#elseif .locale == "ja_JP">'+
		'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
		'<#elseif .locale == "ko_KR">'+
		'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
		'<#elseif .locale == "th_TH">'+
		'font-family: NotoSans, NotoSansThai, sans-serif;'+
		'<#else>'+
		'font-family: NotoSans, sans-serif;'+
		'</#if>'+
		'}'+
		'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
		'td { padding: 4px 6px;}'+
		'b { font-weight: bold; color: #333333; }'+
		'.nav_t1 td{'+
		'width: 110px;'+
		'height: 20px;'+
		'font-size: 13px;'+
		'display: hidden;'+
		'}'+
		'</style>'+
		'</head>';
				if(invoiceLanguage == '英語'){
					var bankName = 'Drawing Bank';
//					if(pdfName == 'Invoice Book(Refrain)' || pdfName[a] == 'Invoice Book' || pdfName[a] == 'Invoice Book(Manager Refrain)'){
						var titleName = 'I request you as follows.';
//					}
	
					var dateName = 'Date';
					var deliveryName = 'Delivery Date:';
					var numberName = 'Number';
					var paymentName = 'Payment Terms:';
					var orderName = 'Order Number:';
					var codeName = 'Code';
					var poductName = 'Product Name';
					var quantityName = 'Quantity';
					var unitpriceName = 'Unit Price';
					var amountName = 'Amount';
					var tempName = 'Temperature';
					var expirationDateNmae = 'Expiration Date:';
					var orderNameTwo = 'Order Number:';
					var taxRate = 'Tax Rate';
					var taxAmount = 'TaxAmt';
					var totalName = 'Total';
					var consumptionTax = 'Consumption Tax';
					var invoiceNameString = 'Invoice';
					var deliName = 'Delivery';
				}else if(invoiceLanguage == '日本語' || isEmpty(invoiceLanguage)){
					var bankName = '引取銀行';
//					if(pdfName == '請\xa0\xa0求\xa0\xa0書(控)' || pdfName == '請\xa0\xa0求\xa0\xa0書' || pdfName == '請\xa0\xa0求\xa0\xa0書(経理控)'){
						var titleName = '下記の通りご請求申し上げます。';
//					}
					var dateName = '日\xa0\xa0付';
					var deliveryName = '納品日：';
					var numberName = '番\xa0\xa0号';
					var paymentName = '支払条件:';
					var orderName = '貴発注番号:';
					var codeName = 'コ\xa0\xa0ー\xa0\xa0ド';
					var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0名';
					var quantityName = '数\xa0\xa0\xa0量';
					var unitpriceName = '単\xa0\xa0\xa0価';
					var amountName = '金\xa0\xa0\xa0額';
					var tempName = '配送温度';
					var expirationDateNmae = '有効期限:';
					var orderNameTwo = '客先発注番号:';
					var taxRate = '税率';
					var taxAmount = '税額';
					var totalName = '合\xa0\xa0\xa0\xa0\xa0計';
					var consumptionTax = '消\xa0\xa0費\xa0\xa0税';
					var invoiceNameString = '御\xa0請\xa0求\xa0額';
					var deliName = 'お届先';
				}
				//請求書PDF
				str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4">'+
				'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
				'<tr>'+
				'<td style="width: 330PX;">'+
				'<table>'+
				'<tr style="height: 20px;">'+
				'</tr>'+
				'<tr></tr>'+
				'<tr>'+
				'<td>〒'+invoiceZipcode+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;&nbsp;'+invoiceState+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;&nbsp;'+invoiceCity+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;&nbsp;'+invoiceAddress2+'</td>'+ 
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;&nbsp;'+invoiceAddress1+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td align="center">&nbsp;</td>'+
				'<td align="center">'+honorieicAppellation+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;&nbsp;Tel:'+invoicePhone+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;&nbsp;Fax:'+invoiceFax+'</td>'+
				'</tr>'+
				'</table>'+
				''+
				'</td>'+
				'<td>'+
				'<table style="border:1px solid black;">'+
				'<tr>'+
				'<td colspan="2" style="font-weight: bold;font-size:20px;width:55%;line-height:35px;">'+invoiceLegalname+'</td>'+
				'<td colspan="2" style="width:45%;margin-top:-16px;"></td>'+
				'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
				'</tr>'+
				'<tr>'+
				'</tr>'+
				'<tr>';
				if(invoiceLanguage == '英語'){
					str+='<td colspan="4">'+invoiceNameEng+'</td>';
				}else{
					str+='<td colspan="4">'+invoiceName+'</td>';
				}
				str+='</tr>'+
				'<tr>';
				if(invoiceLanguage == '英語'){
					str+='<td colspan="4" style="font-size:9px;">'+invoiceAddressEng+'</td>';
				}else{
					str+='<td colspan="4" style="font-size:10px;">〒'+invoiceAddressZip+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+'</td>';
				}
				str+='</tr>'+
				'<tr>'+
				'<td colspan="4">'+bankName+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;&nbsp;'+invoiceBankOne+'</td>'+
				'<td>&nbsp;'+invbranch_name1+'</td>'+
				'<td>当座預金</td>'+
				'<td>'+invbank_no1+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;&nbsp;'+invoiceBankTwo+'</td>'+
				'<td>&nbsp;'+invbranch_name2+'</td>'+
				'<td>当座預金</td>'+
				'<td>'+invbank_no2+'</td>'+
				'</tr>'+
				'</table>'+
				'</td>'+
				'</tr>'+
				'</table>'+
				'<table style="width: 660px;border:none">'+
				'<tr>'+
				'<td style="font-weight: bold;width:300px;font-size:18px;padding:14px 0" align="center">'+pdfName+'</td>'+
				'<td style="font-weight:bold;padding:20px 0;width:210px;" align="right">'+titleName+'</td>'+
				'<td align="right"  colspan="2">'+
				'<table style="width:120px;height:40px;">'+
				'<tr>'+
				'<td style="border: 1px solid black;"></td>'+
				'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
				'<td style="border: 1px solid black;"></td>'+
				'</tr>'+
				'</table>'+
				'</td>'+
				'</tr>'+
				'</table>'+
				'<table style="width:660px;border: 2px solid rebeccapurple;margin-top: 10px;border-collapse:collapse;">'+
				'<tr>'+
				'<td style="width: 60px;color: white;background-color: black;padding-top:10px" rowspan="2">'+dateName+'</td>'+
				'<td style="width: 100px;border-right:1px solid black;">'+invoiceTrandate+'</td>'+
				'<td align="left">'+deliveryName+'&nbsp;'+invoicedelivery_date+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td style="border-right:1px solid black;">&nbsp;</td>'+
				'<td></td>'+
				'</tr>'+
				'<tr>'+
				'<td style="width: 60px;border-top:1px solid white ;color: white;background-color: black;padding-top:10px" rowspan="2">'+numberName+'</td>'+
				'<td style="width: 100px;border-top:1px solid black;border-right:1px solid black;"></td>';
				if(invoiceLanguage == '英語'){
					str+='<td align="left">'+paymentName+'&nbsp;'+invTersmEng+'</td>';
				}else{
					str+='<td align="left">'+paymentName+'&nbsp;'+invTersmJap+'</td>';
				}		
				str+='</tr>'+
				'<tr>'+
				'<td style="border-right:1px solid black;">'+invoiceTranid+'</td>'+
				'<td>'+orderName+'&nbsp;'+invoiceOtherrefnum+'</td>'+
				'</tr>'+
				'</table>'+
				'<table  style="width: 660px; margin-top: 20px;" cellpadding="0" cellspacing="0">'+
				'<tr>'+
				'<td align="right">Page:<pagenumber/></td>'+
				'</tr>'+
				'</table>'+
				'<table  style="width: 660px; margin-top:1px;border:1px solid black;" cellpadding="0" cellspacing="0">'+
				'<tr style="height:20px">'+
				'<td style="width: 85px;border-left: 1px solid black;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+codeName+'</td>'+
				'<td style="width: 273px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+poductName+'</td>'+
				'<td style="width: 70px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+quantityName+'</td>'+	
				'<td style="width: 105px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+unitpriceName+'</td>'+
				'<td style="width: 75px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+amountName+'</td>'+	
				'<td style="width: 52px;border-left: 1px solid white;color: white;background-color: black;line-height:20px;font-size:8px;" align="center" >'+tempName+'</td>'+
				'</tr>';
				for(var j =0; j < invoiceItemArr.length;j++){
				str+='<tr>'+
				'<td style="border-left: 2px solid black;">'+
				'<table style="width:85px;">'+
				'<tr>'+
				'<td>'+invoiceItemArr[j].invoiceInitemid+'</td>'+
				'</tr>'+
				'</table>'+
				'</td>'+	
				
				'<td style="border-left: 1px solid black;">'+
				'<table style="width:273px;">'+
				'<tr>'+
				'<td colspan="3" align="left">'+invoiceItemArr[j].invoiceDisplayName+'</td>'+
				'</tr>'+
				'<tr>';
//				if(!isEmpty(itemLineArr[j].storage_type)){
					str+='<td colspan="3">「'+invoiceItemArr[j].invoiceStorage_type+'」</td>';
//				}
				str+='</tr>';
				for(var p = 0;p<invInventoryDetail.length;p++){
					var invLine = invInventoryDetail[p].invoiceLine;
					if(invLine == invoiceItemArr[j].invoiceLine){
						var invoiceSerialnumberLot = invInventoryDetail[p].invoiceSerialnumber;  
						str+='<tr>'+
						'<td style="width:80px;font-size:10px;">'+invoiceItemArr[j].invoiceVendorName+'</td>'+
						'<td style="width:135px;font-size:10px;" align="left" >'+invoiceSerialnumberLot+'</td>'+
						'<td style="width:70px;font-size:10px;" align="right" >'+expirationDateNmae+'</td>'+
						'</tr>';
					}
				}
				str+='</table>'+
				'</td>'+
				
				'<td style="border-left: 1px solid black;">'+
				'<table style="width:70px;">'+
				'<tr>'+
				'<td align="center" style="font-size:10px;">'+invoiceItemArr[j].invoiceQuantity+'&nbsp;'+invoiceItemArr[j].invoiceUnitabbreviation+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;</td>'+
				'</tr>';
				for(var p = 0;p<invInventoryDetail.length;p++){
					var invLine = invInventoryDetail[p].invoiceLine;
					if(invLine == invoiceItemArr[j].invoiceLine){
						var invoiceExpirationDate = invInventoryDetail[p].invoiceExpirationdate;  
						str+='<tr>'+
						'<td style="font-size:10px;">&nbsp;'+invoiceExpirationDate+'</td>'+	
						'</tr>';
					}
				}
				str+='<tr>'+
				'<td align="right" style="font-size:10px;">'+taxRate+':</td>'+
				'</tr>'+
				'</table>'+
				'</td>';
				str+='<td style="border-left: 1px solid black;">'+
				'<table style="width:105px;">'+
				'<tr>'+
				'<td colspan="2" align="center" style="font-size:10px;">&nbsp;'+invoiceItemArr[j].invoiceRateFormat+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;</td>'+
				'</tr>';
				for(var p = 0;p<invInventoryDetail.length;p++){
					var invLine = invInventoryDetail[p].invoiceLine;
					if(invLine == invoiceItemArr[j].invoiceLine){
						str+='<tr>'+
						'<td>&nbsp;</td>'+
						'</tr>';
					}
				}
				str+='<tr>'+
				'<td align="left" style="padding-top:3px;font-size:10px;">'+invoiceItemArr[j].invoiceTaxrate1Format+'</td>'+
				'<td align="right" style="font-size:10px;padding-top:3px;">'+taxAmount+':</td>'+
				'</tr>'+
				'</table>'+
				'</td>';
				
				str+='<td style="border-left: 1px solid black;">'+
				'<table style="width:75px;">'+
				'<tr>'+
				'<td style="font-size:10px;" align="right">'+invoiceItemArr[j].invoiceAmount+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;</td>'+
				'</tr>';
				for(var p = 0;p<invInventoryDetail.length;p++){
					var invLine = invInventoryDetail[p].invoiceLine;
					if(invLine == invoiceItemArr[j].invoiceLine){
						str+='<tr>'+
						'<td>&nbsp;</td>'+
						'</tr>';
					}
				}
				str+='<tr>'+
				'<td align="right" style="font-size:10px;" >'+invoiceItemArr[j].invoiceTaxamount+'</td>'+
				'</tr>'+
				'</table>'+
				'</td>';
				str+='<td style="border-left: 1px solid black;border-right: 2px solid black;width: 15px;">'+
				'<table style="width:52px;">'+
				'<tr>'+
				'<td style="font-size:8px;">'+invoiceItemArr[j].invoiceDeliverytemptyp+'</td>'+
				'</tr>'+
				'</table>'+
				'</td>';
				str+='</tr>';
				}
				str+='<tr>'+
				'<td style="border-left: 2px solid black;"></td>'+
				'<td style="border-left: 1px solid black;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+invoiceOtherrefnum+'</td>'+
				'<td style="border-left: 1px solid black;"></td>'+
				'<td style="border-left: 1px solid black;"></td>'+
				'<td style="border-left: 1px solid black;"></td>'+
				'<td style="border-left: 1px solid black;border-right: 2px solid black;"></td>'+
				'</tr>';
				
				
				str+='</table>'+
				'<table style="border-top:2px solid black;width: 660px;" >'+
				'<tr>'+
				'<td style="width:420px;"></td>'+
				'<td style="width: 80px;height:30px;background-color: black;color: white;padding-top:15px;font-size:8px;" align="center">'+totalName+'</td>'+
				'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+invoAmountTotal+'</td>';
				
				str+='</tr>'+	
				'<tr>'+
				'<td style="width:470px;">&nbsp;&nbsp;'+deliName+':'+incoicedelivery_Name+'</td>'+
				'<td style="width: 80px;height:30px;background-color: black;padding-top:15px;color: white;border-top:1px solid white;font-size:8px;" align="center">'+consumptionTax+'</td>'+
				'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+invTaxmountTotal+'</td>';
				
				str+='</tr>'+
				'<tr>'+
				'<td>'+
				'<table>';
				if(!isEmpty(invdestinationSales)){
					str+='<tr>'+
					'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationSales+'</td>'+
					'</tr>';	
				}
				if(!isEmpty(invdestinationZip)&& !isEmpty(invdestinationState)){
					str+='<tr>'+
					'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+invdestinationZip+'&nbsp; '+invdestinationState+'</td>'+
					'</tr>';
				}
				str+='</table>'+
				'</td>'+
				'<td style="width: 80px;height:30px;background-color: black;padding-top:15px;color: white;border-top:1px solid white;font-size:8px;border-bottom:2px solid black" align="center">'+invoiceNameString+'</td>'+
				'<td style="width: 30px;height:30px;padding-top:25px;border:1px solid black;border-bottom:2px solid black" align="left"></td>'+
				'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;border-bottom:2px solid black" align="center">'+invoToTotal+'</td>';
				
				str+='</tr>';
				if(!isEmpty(invdestinationCity)){
					str+='<tr>'+
					'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationCity+'</td>'+
					'</tr>';
				}
				if(!isEmpty(invdestinationAddress)|| !isEmpty(invdestinationAddress2)){
					str+='<tr>'+
					'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationAddress+invdestinationAddress2+'</td>'+
					'</tr>';
				}
				
				str+='</table>';
				str+='</body>';
				str += '</pdf>';
				var renderer = nlapiCreateTemplateRenderer();
				renderer.setTemplate(str);
				var xml = renderer.renderToString();
				var xlsFile = nlapiXMLToPDF(xml);
			// PDF
				xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
			    //20230901 add by CH762 zzq start 
			    var SAVE_FOLDER = INVOICE_PDF_MAIL_DJ_INVOICEPDF;
			    if(subsidiary == SUB_NBKK){
			        SAVE_FOLDER = INVOICE_PDF_MAIL_DJ_INVOICEPDF_NBKK;
			    }else if(subsidiary == SUB_ULKK){
			        SAVE_FOLDER = INVOICE_PDF_MAIL_DJ_INVOICEPDF_ULKK;
			    }
			   //20230901 add by CH762 zzq end 
				xlsFile.setFolder(SAVE_FOLDER);
				xlsFile.setIsOnline(true);
				// save file
				var fileID = nlapiSubmitFile(xlsFile);
	
				return fileID;
//				var url= 'https://5722722.app.netsuite.com/'+fl.getURL();
//				nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
				
				//DJ_請求書フォーム_食品
		}else if(customform =='160'){
		    //var SECURE_URL_HEAD = 'https://5722722-sb1.secure.netsuite.com';
		    //本番 SECURE固定URLタイトル :'https://5722722.secure.netsuite.com';

		    //リンクパラメータ 固定URLタイトル:C
		    //var URL_PARAMETERS_C = 'c=5722722_SB1';
		    //本番 SECURE固定URLタイトル:C :'c=5722722';
		    //20230727 add by zdj start
		    var invAmount = 0;
            var invTaxamount = 0;
            var itemLine = new Array();
            var invoiceID = recordId; //ID
            var invoiceRecord = nlapiLoadRecord('invoice',invoiceID);
            // CH408 zheng 20230517 start
            var tmpLocationDic = getLocations(invoiceRecord);
            // CH408 zheng 20230517 end
            var entity = invoiceRecord.getFieldValue('entity');//顧客
            nlapiLogExecution('debug', 'entity', entity);
	        var customerSearch= nlapiSearchRecord("customer",null,
	                [
	                    ["internalid","anyof",entity]
	                ], 
	                [
	                    new nlobjSearchColumn("address2","billingAddress",null), //請求先住所2
	                    new nlobjSearchColumn("address3","billingAddress",null), //請求先住所3
	                    new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
	                    //CH734 20230719 by zzq start
	                    new nlobjSearchColumn("country","billingAddress",null), ////請求先国
	                    //CH734 20230719 by zzq end
	                    new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
	                    new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県         
	                    new nlobjSearchColumn("phone"), //電話番号
	                    new nlobjSearchColumn("fax"), //Fax
	                    new nlobjSearchColumn("entityid"), //id
	                    new nlobjSearchColumn("salesrep"), //販売員（当社担当）
	                    new nlobjSearchColumn("language"),  //言語
	                    new nlobjSearchColumn("currency"),  //基本通貨
	                    new nlobjSearchColumn("custrecord_djkk_pl_code_fd","custentity_djkk_pl_code_fd",null),   //DJ_販売価格表コード（食品）
	                    new nlobjSearchColumn("companyname"), //naem 
//	                  new nlobjSearchColumn("custentity_djkk_pl_code_fd")   //DJ_販売価格表コード（食品）
	                    new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_顧客支払条件
	                    new nlobjSearchColumn("terms"), //支払い条件
	                    new nlobjSearchColumn("address1","billingAddress",null), //請求先住所1
	                    //20230721 by zzq start
	                    new nlobjSearchColumn("state","billingAddress",null), //請求先住所 : 都道府県
	                    new nlobjSearchColumn("billaddress")
	                    //20230721 by zzq end

	                ]
	                );  
	        var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//住所2
	        var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//住所3
	        var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//市区町村
	        //CH734 20230719 by zzq start
	        var invoiceCountry= defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("country","billingAddress",null)));//請求先国
	        var invoiceCityUnder= defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("city","billingAddress",null)));//市区町村
	        var invoicestateEn= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("state","billingAddress",null));
	        //CH734 20230719 by zzq end
	        var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("zipcode","billingAddress",null)));//郵便番号
	        var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//都道府県 
	        var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//電話番号
	        var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
	        var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
	        var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//販売員（当社担当）
	        // add by zzq start
//	      var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//言語
	        var language= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("language"));//言語
	        // add by zzq end
	        var currency= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("currency"));//販売員（当社担当）
	        var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_pl_code_fd","CUSTENTITY_DJKK_PL_CODE_FD",null));//DJ_販売価格表コード（食品）code
//	      var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_pl_code_fd"));//DJ_販売価格表コード（食品）code
	        var custNameText= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//name add by lj
	        var customerPayment = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_customer_payment"));//add by lj
	        var customerTerms = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("terms"));//add by zzq
	        //nlapiLogExecution('DEBUG', '000', customerTerms);
	        var address1 = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("address1","billingAddress",null)));//add by lj

	        //20230721 by zzq start
	        var invoicebillcountryEn = '';
	        if(invoiceCountry){
	            if(invoiceCountry == 'JP'){
	                invoicebillcountryEn = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getText("country","billingAddress",null)));
	            }else{
	                invoicebillcountryEn = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("billaddress")));
	                if(invoicebillcountryEn){
	                   var invoiceCountryEnArr = invoicebillcountryEn.split('\n');
	                    invoicebillcountryEn = invoiceCountryEnArr[invoiceCountryEnArr.length-1];
	                }
	            }
	        }
	        var invoiceCountryEnAddress = invoicestateEn + '&nbsp;' + invoicebillcountryEn;
	        //20230721 by zzq end
	        
	        //支払条件
	        //add by zzq start
	        var customerPaymentTerms = '';
	        if(language == SYS_LANGUAGE_JP){
	            if(customerTerms){
	                var tmpVal = customerTerms.split("/")[0];
	                if (tmpVal) {
	                    customerPaymentTerms = tmpVal;
	                }
	            } else if(customerPayment){
	               var tmpVal = customerPayment.split("/")[0];
	               if (tmpVal) {
	                   customerPaymentTerms = tmpVal;
	               }
	            }
	        } else if(language == SYS_LANGUAGE_EN){
	            if(customerTerms){
	                var tmpVal = customerTerms.split("/")[1];
	                if (tmpVal) {
	                    customerPaymentTerms = tmpVal;
	                }
	            } else if(customerPayment){
	               var tmpVal = customerPayment.split("/")[1];
	               if (tmpVal) {
	                   customerPaymentTerms = tmpVal;
	               }
	            }
	        }
	        //add by zzq end

	        var trandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //請求書日付
	        var delivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //請求書納品日
	        var tranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //請求書番号
	        var transactionnumber = defaultEmpty(invoiceRecord.getFieldValue('transactionnumber'));    //トランザクション番号　221207王より追加
	        //バリエーション支援 20230803 add by zdj start
	        var exsystemTranid = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_exsystem_tranid'));
	        if(exsystemTranid){
	            transactionnumber = transactionnumber + '/' + exsystemTranid;
	        }
	        //バリエーション支援 20230803 add by zdj end
	        var createdfrom = defaultEmpty(invoiceRecord.getFieldValue('createdfrom'));    //請求書作成元
	        // add by CH598 20230601 start
//	      var otherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //発注書番号
	        var otherrefnum = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_customerorderno'));    //先方発注番号
	        // add by CH598 20230601 end
	        var soNumber = '';
	        if(!isEmpty(createdfrom)){
	            var so = nlapiLoadRecord('salesorder',createdfrom);
	            soNumber = so.getFieldValue('transactionnumber');
	        }
	        var payment = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_payment_conditions'));    //請求書支払条件
//	      var salesrep = defaultEmpty(invoiceRecord.getFieldText('salesrep'));    //営業担当者
	        var salesrepId = defaultEmpty(invoiceRecord.getFieldValue('salesrep'));    //営業担当者
	        // add CH599 zzq 20230520 start
//	      if(!isEmpty(salesrep)){
//	            if(salesrep.match(/ (.+)/)){
//	                salesrep = salesrep.match(/ (.+)/)[1];
//	            }
//	        }
	        var salesrep = '';
	        if (salesrepId) {
	            var employeeSearch = nlapiSearchRecord("employee",null,
	              [
	                 ["internalid","is",salesrepId]
	              ], 
	              [
	                 new nlobjSearchColumn("phone"), 
	                 new nlobjSearchColumn("fax"),
	                 new nlobjSearchColumn("lastname"),
	                 new nlobjSearchColumn("firstname"),
	                 new nlobjSearchColumn("custentity_djkk_english_lastname"),
	                 new nlobjSearchColumn("custentity_djkk_english_firstname")
	              ]
	              );
	            var employeelastname = '';
	            var employeefirstname = '';
	            if (language == SYS_LANGUAGE_EN) {
	                //add by zzq CH641 20230613 end
	                employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_lastname")));//従業員lastname
	                employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_firstname")));//従業員firstname
	                if(employeelastname && employeelastname){
	                    salesrep = employeefirstname +'&nbsp;'+ employeelastname;
	                }else if(employeelastname && !employeelastname) {
	                    salesrep = employeefirstname;
	                }else if(!employeelastname && employeelastname) {
	                    salesrep = employeelastname;
	                }
	            } else {
	                employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("lastname")));//従業員lastname
	                employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("firstname")));//従業員firstname
	                if(employeelastname && employeelastname){
	                    salesrep = employeelastname +'&nbsp;'+ employeefirstname;
	                }else if(employeelastname && !employeelastname) {
	                    salesrep = employeefirstname;
	                }else if(!employeelastname && employeelastname) {
	                    salesrep = employeelastname;
	                }
	            }
	      }
	        // add CH599 zzq 20230520 end
	        // add CH408 20230520 start
	        var memo = defaultEmpty(invoiceRecord.getFieldValue('memo'));    //memo
	        var dvyMemo = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_deliverynotememo')); //納品書備考
	        // add CH408 20230520 end
	        
	        var subsidiary = defaultEmpty(invoiceRecord.getFieldValue('subsidiary'));    //請求書子会社
	        var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
	                [
	                    ["internalid","anyof",subsidiary]
	                ], 
	                [
	                    new nlobjSearchColumn("legalname"),  //正式名称
	                    new nlobjSearchColumn("name"), //名前
	                    new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
	                    new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
	                    new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
	                    new nlobjSearchColumn("address1","address",null), //住所1
	                    new nlobjSearchColumn("address2","address",null), //住所1
	                    new nlobjSearchColumn("address3","address",null), //住所2
	                    new nlobjSearchColumn("city","address",null), //市区町村
	                    new nlobjSearchColumn("zip","address",null), //郵便番号
	                    new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
	                    new nlobjSearchColumn("phone","address",null), //phone
	                    //20230510 add by zhou DENISJAPAN-759 start
	                    new nlobjSearchColumn("custrecord_djkk_invoice_issuer_number"),//適格請求書発行事業者番号
	                    new nlobjSearchColumn("custrecord_djkk_bank_1"),//DJ_銀行1
	                    new nlobjSearchColumn("custrecord_djkk_bank_2"),//DJ_銀行2
	                    //20230510 add by zhou DENISJAPAN-759 end
	                    //CH655 20230725 add by zdj start
	                    new nlobjSearchColumn("phone","shippingAddress",null),//配送先phone
	                    new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//配送先fax
	                  //CH655 20230725 add by zdj end
	                ]
	                );  
	        var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//正式名称
	        var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//名前
	        var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address1","address",null));//住所1
	        var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//住所2
	        var invoiceAddressThree= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//住所3
	        var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//郵便番号
	        var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//市区町村
	        var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
	        var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
	        var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//住所英語
	        var invoiceFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax
	        var invoicePhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","address",null));//phone
	        //CH655 20230725 add by zdj start
	        var invoiceShipaddressPhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","shippingAddress",null));//配送先phone
	        var invoiceShipaddressFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","shippingAddress",null));//配送先fax
	        //CH655 20230725 add by zdj end
	        
	        //20230510 add by zhou DENISJAPAN-759 start
	        var invoiceIssuerNumber= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_invoice_issuer_number"));//適格請求書発行事業者番号
	        var bank1 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_1");
	        var bank2 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_2");
	        var bankInfo = [];
	        var bank1Value = '';
	        var bank2Value = '';
//	      if(bank1){
//	          bank1 = nlapiLoadRecord('customrecord_djkk_bank', bank1);
//	          bank1Value = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))+')' + 
//	          ' '+defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code')) + ')'+
//	          ' '+defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_type')) + 'No.'+ defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
//	      }
//	      if(bank2){
//	          bank2 = nlapiLoadRecord('customrecord_djkk_bank', bank2);
//	          bank2Value = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))+')' + 
//	          ' '+defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code')) + ')'+
//	          ' '+defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_type')) + 'No.'+ defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
//	      }
	        if(bank1){
	            bank1 = nlapiLoadRecord('customrecord_djkk_bank', bank1);
	            var bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name'));
	            if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))){
	                bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))+')';
	            }
	            var bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));
	            if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code'))){
	                bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
	            }
	            var bankType1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_type'));
	            var bankNo1 = '';
	            if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'))){
	                //CH756&CH757 20230801 by zdj start
//	              bankNo1 = 'No.'+ defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
	                bankNo1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
	                //CH756&CH757 20230801 by zdj end
	            }
	        }
	        if(bank2){
	            bank2 = nlapiLoadRecord('customrecord_djkk_bank', bank2);
	            var bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name'));
	            if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))){
	                bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))+')';
	            }
	            var bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));
	            if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code'))){
	                bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
	            }
	            var bankType2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_type'));
	            var bankNo2 = '';
	            if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'))){
	                //CH756&CH757 20230801 by zdj start
//	              bankNo2 = 'No.'+ defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
	                bankNo2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
	                //CH756&CH757 20230801 by zdj end
	            }
	        }
	        //20230510 add by zhou DENISJAPAN-759 end
	        
	        var incoicedelivery_destination = invoiceRecord.getFieldValue('custbody_djkk_delivery_destination');    //請求書納品先
	        if(!isEmpty(incoicedelivery_destination)){  
	            
	            var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
	                    [
	                        ["internalid","anyof",incoicedelivery_destination]
	                    ], 
	                    [
	                        new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
	                        new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
	                        new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
	                        new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
	                        //add by CH653 20230619 start
//	                      new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
	                        new nlobjSearchColumn("custrecord_djkk_delivery_lable"),  //DJ_納品先住所2
	                        new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所3
	                        //add by CH653 20230619 end
	                        new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_納品先名前
	                              
	                    ]
	                    );  
	            var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//郵便番号
	            var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//都道府県
	            var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_市区町村
	            var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_納品先住所1
	            //add by CH653 20230619 start
//	          var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_納品先住所2
	            var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_lable'));//DJ_納品先住所3
	            var invdestinationAddress3 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_納品先住所3
	            //add by CH653 20230619 end
	            var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_納品先名前
	        }
	        
	        var tmpCurrency = invoiceRecord.getFieldValue('currency');
	        var displaysymbol = '';
	        if (tmpCurrency) {
	            var tmpRecd = nlapiLoadRecord('currency', tmpCurrency, 'symbol');
	            if (tmpRecd) {
	                displaysymbol = tmpRecd.getFieldValue('displaysymbol');
	            }
	        }
	        
	        var invoiceCount = invoiceRecord.getLineItemCount('item');
	        var invoToTotal =0;
	        var invoAmountTotal = 0;
	        //add by zzq 20230625 CH654 start
	        //add by zzq 20230614 start
//	        var invTaxmountTotal = 0;
	        var invTaxmountTotal = 0;
//	        var invTaxmountTotal8 = 0;
//	        var invTaxmountTotal10 = 0;
	      //add by zzq 20230614 end
	        for(var k=1;k<invoiceCount+1;k++){
	            invoiceRecord.selectLineItem('item',k);
	            var invoiceItemId = invoiceRecord.getLineItemValue('item','item',k);    //item
	            var invoiceItemSearch = nlapiSearchRecord("item",null,
	                    [
	                        ["internalid","anyof",invoiceItemId],
	                    ],
	                    [
	                      new nlobjSearchColumn("itemid"), //商品コード
	                      //20230608 add by zzq CH599 start
	                      new nlobjSearchColumn("displayname"), //商品名
	                      new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_品名（日本語）LINE1
	                      new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), //DJ_品名（日本語）LINE2
	                      new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_品名（英語）LINE1
	                      new nlobjSearchColumn("custitem_djkk_product_name_line2"), //DJ_品名（英語）LINE2
	                      //20230608 add by zzq CH599 end
	                      new nlobjSearchColumn("custitem_djkk_product_code"), //カタログ製品コード
	                    //20230608 add by zzq CH599 start
	                      new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), //配送料フラグ
	                      //20230608 add by zzq CH599 end
	                      //add by zzq 20230614 start
	                      new nlobjSearchColumn("type")
	                      //add by zzq 20230614 end
	                    ]
	                    ); 
	             //20230608 add by zzq CH599 start
	            var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//単価
	            if(!isEmpty(invoiceRateFormat)){
	                invoiceRateFormat = parseFloat(invoiceRateFormat).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); 
	            }
	            nlapiLogExecution('DEBUG', 'Number(invoiceRateFormat)>0', Number(invoiceRateFormat)>0);
	            nlapiLogExecution('DEBUG', 'custitem_djkk_deliverycharge_flg', invoiceItemSearch[0].getValue("custitem_djkk_deliverycharge_flg"));
	            if(!(Number(invoiceRateFormat)==0 && invoiceItemSearch[0].getValue("custitem_djkk_deliverycharge_flg") == 'T')){
	                var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//商品コード
	                var productCode= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("custitem_djkk_product_code"));//カタログ製品コード
	              //20230608 add by zzq CH599 start
//	              var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
//	              invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;");
	             // by add zzq CH671 20230704 start
	                var invoiceItemType = defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("type")); //アイテムtype
	                nlapiLogExecution('debug', 'invoiceItemType', invoiceItemType);
	                var itemDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
	                var invoiceDisplayName = '';
	                var invoiceItemNouhinBikou = invoiceRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',k); //DJ_納品書備考
	                     if(invoiceItemType == 'OthCharge') { // アイテムは再販用その他の手数料
	                        invoiceDisplayName = othChargeDisplayname(itemDisplayName, language); // 手数料
	                        nlapiLogExecution('debug', 'invoiceDisplayName', invoiceDisplayName);
	                    }else{
	                        if (!isEmpty(invoiceItemSearch)) {
	                            // add by zzq start
	                            // if(custLanguage == '日本語'){
	                            if (language == SYS_LANGUAGE_JP) {
	                                // add by zzq end
	                                var jpName1 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_jpline1");
	                                var jpName2 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_jpline2");
	                                    if (!isEmpty(jpName1) && !isEmpty(jpName2)) {
	                                        invoiceDisplayName = jpName1 + ' ' + jpName2;
	                                    } else if (!isEmpty(jpName1) && isEmpty(jpName2)) {
	                                        invoiceDisplayName = jpName1;
	                                    } else if (isEmpty(jpName1) && !isEmpty(jpName2)) {
	                                        invoiceDisplayName = jpName2;
	                                }
	                            } else {
	                                var enName1 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_line1");
	                                var enName2 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_line2");
	                                    if (!isEmpty(enName1) && !isEmpty(enName2)) {
	                                        invoiceDisplayName = enName1 + ' ' + enName2;
	                                    } else if (!isEmpty(enName1) && isEmpty(enName2)) {
	                                        invoiceDisplayName = enName1;
	                                    } else if (isEmpty(enName1) && !isEmpty(enName2)) {
	                                        invoiceDisplayName = enName2;
	                                }
	                            }
	                            // add by zzq end
	                        }
	                    }
	                    if (invoiceDisplayName) {
	                        if (invoiceItemNouhinBikou) {
	                            invoiceDisplayName = invoiceDisplayName + '<br/>' + invoiceItemNouhinBikou;
	                        }
	                    } else {
	                        if (invoiceItemNouhinBikou) {
	                            invoiceDisplayName = invoiceItemNouhinBikou;
	                        }
	                    }
	              // 20230608 add by zzq CH599 start
	             
	// var invoiceItemType= defaultEmpty(isEmpty(invoiceItemSearch) ? '' : invoiceItemSearch[0].getValue("type"));//種類
	// if(invoiceItemType == 'OthCharge'){
	// // if(invoiceDisplayName){
//////	                    var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
////	                      invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;");
////	                }
//	                }
	                //add by zzq 20230614 end
	                //20230608 add by zzq CH599 end
	             // by add zzq CH671 20230704 end
	                var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//数量
	                
	                var invoiceAmount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','amount',k)));//金額  
	                invAmount = 0;
	                if(!isEmpty(invoiceAmount)){
	                    var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');   
	                    invAmount  += invoiceAmount;
	                    // modify by lj start DENISJAPANDEV-1376
	                    invoAmountTotal = invoAmountTotal + invoiceAmount;
	                    // invoAmountTotal = invoAmountTotal + invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	                    // modify by lj end DENISJAPANDEV-1376
	                }else{
	                    var invAmountFormat = '0';
	                }
	                
	                var invoiceTaxrate1Format = defaultEmpty(invoiceRecord.getLineItemValue('item','taxrate1',k));//税率
	                var invoiceTaxamount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','tax1amt',k)));//税額   
	                var invoiceTaxcode = defaultEmpty(invoiceRecord.getLineItemValue('item','taxcode',k));//税率
	                invTaxamount = 0;
	                if(!isEmpty(invoiceTaxamount)){
	                    var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	                    invTaxamount += invoiceTaxamount;
	                  //add by zzq 20230625 CH654 start
	                  //add by zzq 20230614 start
//	                    invTaxmountTotal = invTaxmountTotal + invoiceTaxamount;
	                    invTaxmountTotal = invTaxmountTotal + invoiceTaxamount;
	                    //add by zzq 20230625 CH654 end
//	                    if(invoiceTaxrate1Format == '10.0%'){
//	                        invTaxmountTotal10 = invTaxmountTotal10 + invoiceTaxamount;
//	                    }else if(invoiceTaxrate1Format == '8.0%'){
//	                        invTaxmountTotal8 = invTaxmountTotal8 + invoiceTaxamount;
//	                    }
	                  //add by zzq 20230614 end
	                    // invTaxmountTotal = invTaxmountTotal + invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	                }else{
	                    invTaxamountFormat = '0';
	                }
	                
	                var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
	                // modify by lj start DENISJAPANDEV-1376
	                if(!isEmpty(invoTotal)){
	                    invoToTotal = invoToTotal + invoTotal;
	                    // invoToTotal = invoToTotal + invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	                }
	                // modify by lj end DENISJAPANDEV-1376

	                
	                var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//単位
	                nlapiLogExecution('DEBUG', 'invoiceUnitabbreviation', invoiceUnitabbreviation);
	                nlapiLogExecution('DEBUG', 'language', language);
	                if(!isEmpty(language)&&!isEmpty(invoiceUnitabbreviation)){
	                    var unitSearch = nlapiSearchRecord("unitstype",null,
	                            [
	                               ["abbreviation","is",invoiceUnitabbreviation]
	                            ], 
	                            [
	                               new nlobjSearchColumn("abbreviation")
	                            ]
	                            );  
	                    if(unitSearch != null){
	                        if(language == SYS_LANGUAGE_EN){            //英語
	                            var units_display = unitSearch[0].getValue('abbreviation')+'';
	                            nlapiLogExecution('DEBUG', 'units_display_EN', units_display);
	                            unitsArray = units_display.split("/");
	                            nlapiLogExecution('DEBUG', 'unitsArray.length', unitsArray.length);
	                            if(unitsArray.length == 2){
	                                invoiceUnitabbreviation = unitsArray[1];
	                            }
	                        }else if(language == SYS_LANGUAGE_JP){              //日本語
	                            var units_display = unitSearch[0].getValue('abbreviation')+'';
	                            nlapiLogExecution('DEBUG', 'units_display_JP', units_display);
	                            unitsArray = units_display.split("/");
	                            if(!isEmpty(unitsArray)){
	                                invoiceUnitabbreviation = unitsArray[0];
	                            }else if(unitsArray.length == 0){
	                                invoiceUnitabbreviation = units_display;
	                            }
	                        }
	                    }
	                }
	                // CH408 zheng 20230517 start
	                var itemLocId = defaultEmpty(invoiceRecord.getLineItemValue('item','location',k)); // 場所
	                var locBarCode = '';
	                if (itemLocId) {
	                    var tmpDicBarCode = tmpLocationDic[itemLocId];
	                    if (tmpDicBarCode) {
	                        locBarCode = tmpDicBarCode;
	                    }
	                }
	                
	                // CH599 zzq 20230608 start
//	                if(!isEmpty(productCode) && !isEmpty(locBarCode)){
//	                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode+'<br/>'+locBarCode;
//	                }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
//	                    invoiceInitemid = invoiceInitemid+'<br/>'+ ' '+'<br/>'+locBarCode;
//	                }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
//	                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode+'<br/>'+' ';
//	                }else{
//	                    invoiceInitemid = invoiceInitemid+'<br/>'+ ' '+'<br/>'+' ';
//	                }
	                // CH599 zzq 20230608 end
	              //CH734 20230717 by zzq start
	                if(!isEmpty(productCode) && !isEmpty(locBarCode)){
	                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode + ' ' + locBarCode;
	                }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
	                    invoiceInitemid = invoiceInitemid+'<br/>'+ locBarCode;
	                }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
	                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode;
	                }else{
	                    invoiceInitemid = invoiceInitemid+'<br/>'+ ' ';
	                }
	                //CH734 20230717 by zzq end
	                
	                // CH408 zheng 20230517 end
	                itemLine.push({
	                    invoiceInitemid:invoiceInitemid,  //商品コード
	                    invoiceDisplayName:invoiceDisplayName,//商品名
	                    invoiceQuantity:invoiceQuantity,//数量
	                    invoiceRateFormat:invoiceRateFormat,//単価
	                    invoiceAmount:invAmountFormat,//金額  
	                    invoiceTaxrate1Format:invoiceTaxrate1Format,//税率
	                    //add by zzq 20230625 CH654 start
//	                    invoiceTaxamount:invTaxamountFormat,//税額  
	                    invoiceTaxamount:invoiceTaxamount,//税額  
	                  //add by zzq 20230625 CH654 end
	                    invoiceUnitabbreviation:invoiceUnitabbreviation,
	                    productCode:productCode,//カタログ製品コード
	                    locBarCode:locBarCode,//DJ_場所バーコード
	                    invoiceTaxcode :invoiceTaxcode//税率コード
	                }); 
	            }
	          //20230608 add by zzq CH599 end
	        }
	        //20230625 add by zzq CH654 start
	        var resultItemTaxArr = [];
	        var invoiceTaxrate1FormatArr = [];
	        for(var i = 0;i < itemLine.length; i++){
	            nlapiLogExecution('DEBUG', 'itemLine[i].invoiceTaxamount', itemLine[i].invoiceTaxamount);
	            var tax = invoiceTaxrate1FormatArr.indexOf(itemLine[i].invoiceTaxcode);
	            if(tax > -1){
	                if(itemLine[i].invoiceTaxamount){
	                    resultItemTaxArr[tax].invoiceTaxamount = parseFloat(resultItemTaxArr[tax].invoiceTaxamount) + parseFloat(itemLine[i].invoiceTaxamount);
	                }
	            }else{
	                invoiceTaxrate1FormatArr.push(itemLine[i].invoiceTaxcode);
	                var resultItemTaxObj = {};
	                if(itemLine[i].invoiceTaxamount){
	                    resultItemTaxObj.invoiceTaxamount = itemLine[i].invoiceTaxamount;
	                }else{
	                    resultItemTaxObj.invoiceTaxamount = 0;
	                }
	                resultItemTaxObj.invoiceTaxrate1Format = itemLine[i].invoiceTaxrate1Format;
	                resultItemTaxObj.invoiceTaxcode = itemLine[i].invoiceTaxcode;
	                resultItemTaxArr.push(resultItemTaxObj);
	            }
	        }
	         resultItemTaxArr.sort(function(a, b) {
	                if (a.invoiceTaxcode == 8) {
	                  return -1;
	                } else if (b.invoiceTaxcode == 8) {
	                  return 1;
	                } else if (a.invoiceTaxcode == 11) {
	                  return -1;
	                } else if (b.invoiceTaxcode == 11) {
	                  return 1;
	                } else if (a.invoiceTaxcode == 10) {
	                  return -1;
	                } else if (b.invoiceTaxcode == 10) {
	                  return 1;
	                } else {
	                  return 0;
	                }
	              });
	         
	         var swiftValue = '';
	         if(language == SYS_LANGUAGE_EN){
	             if(subsidiary == SUB_DPKK){
	                bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
	                bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
	                bankType1 = 'No\xa0\:\xa0';
	                bankNo1 = '1827718';
	                swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
	          }else if(subsidiary == SUB_SCETI){
	                bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
	                bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
	                bankType1 = 'No\xa0\:\xa0';
	                bankNo1 = '1798632';
	                swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
	          }else if(subsidiary == SUB_NBKK){
	                bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
	                bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
	                bankType1 = 'No\xa0\:\xa0';
	                bankNo1 = '0568447';
	                swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
	          }else if(subsidiary == SUB_ULKK){
	                bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
	                bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
	                bankType1 = 'No\xa0\:\xa0';
	                bankNo1 = '1895356';
	                swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
	          }
	          }else{
	                bankName1 = bankName1;
	                bankBranchName1 = bankBranchName1;
	                bankType1 = bankType1;
	                bankNo1 = bankNo1;
	                bankName2 = bankName2;
	                bankBranchName2 = bankBranchName2;
	                bankType2 = bankType2;
	                bankNo2 = bankNo2
	         }
	         //20230731 CH756&CH757 by zdj end
	     // add by zzq start
	 //  if(custLanguage == '日本語'){
	     if(language == SYS_LANGUAGE_JP){
	         //20230731 CH756&CH757 by zdj start
	         var Vibration = '振込口座';
	         //20230731 CH756&CH757 by zdj end
	         // add by zzq end
	         var dateName = '日\xa0\xa0付';
	         var deliveryName = '納品日';
	         var paymentName = '支払条件';
	         var numberName = '番\xa0\xa0号';
	         var numberName2 = '御社発注番号:';
	         var codeName = 'コード';
	         var invoiceName = '*\xa0\xa0\*\xa0\xa0\*請\xa0\xa0\xa0\xa0\求\xa0\xa0\xa0\xa0\書*\xa0\xa0\*\xa0\xa0\*';
	         var quantityName = '数\xa0\xa0\xa0\xa0\xa0\xa0\xa0量';
	         var unitpriceName = '単\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0価';
	         var amountName = '金\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0額';
	         var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\名';
	         var taxRateName = '***\xa0\xa0\税\xa0率:';
	         var taxAmountName = '税額:';
	         var custCode = '顧客コード\xa0\xa0:';
	         var destinationName = '納品先\xa0\xa0:';
	         var totalName = '合\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0計';
	         //add by zzq 20230614 start
	         var consumptionTaxName = '消\xa0\xa0費\xa0\xa0税';
//	       var consumptionTaxName10 = '消\xa0\xa0費\xa0\xa0税\xa010%';
//	       var consumptionTaxName8 = '消\xa0\xa0費\xa0\xa0税\xa08%';
	         //add by zzq 20230614 end
	         var invoiceName1 = '御請求額';
	         var personName = '担当者\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
	         var memoName = '備\xa0\xa0考';
	         var custName = '顧客名\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
	         var addressNmae = '住所\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
	         // CH756&CH757 20230731 by zdj start
	         //var invoiceIssuerNumberName = '適格請求書発行事業者番号:';
	         var invoiceIssuerNumberName = '登録番号:';
	         // CH756&CH757 20230731 by zdj end
	         var stomach =  '御中';
	         //CH734 20230719 by zzq start
	         if(invoiceCity){
	             invoiceCity = invoiceCity + '&nbsp;' + address1;
	         }else{
	             invoiceCity = address1;
	         }
	         //CH734 20230719 by zzq end
	     }else{
	         //20230731 CH756&CH757 by zdj start
	         var Vibration = 'Bank Account';
	         //20230731 CH756&CH757 by zdj end
	         var dateName = 'Date';
	         var deliveryName = 'Delivery Date';
	         var paymentName = 'Payment Terms';
	         //バリエーション支援 20230803 add by zdj start
//	       var numberName = 'Number';
	         var numberName = 'No';
	         //バリエーション支援 20230803 add by zdj end
	         var numberName2 = 'Order Number:';
	         var codeName = 'Code';
	         if(type == 'creditmemo'){
	             var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Credit Memo*\xa0\xa0\*\xa0\xa0\*';
	         }else{
	             var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Invoice*\xa0\xa0\*\xa0\xa0\*';
	         }
	         var quantityName = 'Quantity';
	         var unitpriceName = 'Unit Price';
	         var amountName = 'Amount';
	         var poductName = 'Product Name';
	         var taxRateName = 'Tax Rate:';
	         var taxAmountName = 'Tax:';
	         var custCode = 'Customer Code:';
	         var destinationName = 'Delivery:';
	         var totalName = 'Total';
	         //add by zzq 20230614 start
	         var consumptionTaxName = 'Tax';
//	       var consumptionTaxName10 = 'Excise Tax 10%';
//	       var consumptionTaxName8 = 'Excise Tax 8%';
	         //add by zzq 20230614 end
	         var invoiceName1 = 'Invoice';
	         //20230731 CH756&CH757 by zdj start
	         var personName = 'PIC:';
	         //var personName = 'Person:';
	         //20230731 CH756&CH757 by zdj end
	         var memoName = 'Memo';
	         var custName = 'Customer Name:';
	         var addressNmae = 'Address:';
	         var invoiceIssuerNumberName = 'Registered Number:';
	         var stomach =  ' ';
	         //バリエーション支援  20230802 by zdj start
	         //CH734 20230719 by zzq start
	         var city = '';
	         if(invoiceCity && invoiceZipcode){
	             city = invoiceCity + '\xa0\xa0' + invoiceZipcode + '\xa0\xa0' + invoiceCountryEnAddress;
	         }else if(invoiceCity && !invoiceZipcode){
	             city = invoiceCity + '\xa0\xa0' + invoiceCountryEnAddress;
	         }else if(invoiceZipcode && !invoiceCity){
	             city = invoiceZipcode + '\xa0\xa0' + invoiceCountryEnAddress;
	         }else{
	             city = invoiceCountryEnAddress;
	         }
	         //CH734 20230719 by zzq end
	         //バリエーション支援  20230802 by zdj start
	     }
	     // add by lj start DENISJAPANDEV-1376
	 //  var invTaxmountTotal = parseInt(invoAmountTotal.replace(',','')) * 0.08;
	 //  if(!isEmpty(invoTotal)){
//	       var invoToTotal = (invTaxmountTotal + invoTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	 //  }else{
//	       var invoToTotal ='';
	 //  }
	 //  invTaxmountTotal = invTaxmountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	     // add by lj start DENISJAPANDEV-1376
	     //var subsidiary = getRoleSubsidiary();
	     var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
	     '<pdf>'+
	     '<head>'+
	     '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
	     '<#if .locale == "zh_CN">'+
	     '<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
	     '<#elseif .locale == "zh_TW">'+
	     '<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
	     '<#elseif .locale == "ja_JP">'+
	     '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
	     '<#elseif .locale == "ko_KR">'+
	     '<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
	     '<#elseif .locale == "th_TH">'+
	     '<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
	     // add by zzq start
	     '<#elseif .locale == "en">'+
	     '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
	     // add by zzq end
	     '</#if>'+
	     '<macrolist>'+
	     '<macro id="nlheader">'+
	     '<table border="" style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">';
	     if(sendFaxFlag == 'T'){
	         str+='<tr style="font-weight: bold;"><td>'+mailHeader+'</td></tr>';
	     }
	     if(sendFaxFlag == 'T'){
	         str+='<tr style="padding-top: -20px;">';
	     }else{
	         str+='<tr>';
	     }
	     str+='<td>'+
	     '<table border="0" style="font-weight: bold;width:335px;">'+
	     '<tr style="height: 18px;" colspan="2"></tr>'+  
	     '<tr>'+
	     '<td style="border:1px solid black;" corner-radius="4%">'+
	     '<table border="0">'+
//	     '<tr style="height:10px;"><td style="width:250px;"></td><td></td></tr>'+
	     '<tr style="height:10px;"><td style="width:250px;"></td><td style="width:35px;"></td></tr>'+
	     '<tr>'
	     //CH734 20230717 by zzq start
	 //  '<td>〒'+invoiceZipcode+'</td>'+
	     if (language == SYS_LANGUAGE_JP) {   
	         str+='<td>〒'+invoiceZipcode+'</td>'
	     }else{
	         //バリエーション支援  20230802 by zdj start
//	         str+='<td>&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceZipcode+'</td>'
	         str+='<td>&nbsp;&nbsp;&nbsp;&nbsp;'+custNameText+'</td>'
	         //バリエーション支援  20230802 by zdj start
	     }
	     //CH734 20230717 by zzq end
	         str+='<td align="right" style="margin-right:-22px;">&nbsp;</td>'+
	     '</tr>'+
	     '<tr>'+
	     '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invAddress+'</td>'+
	         //add by zhou 20230601_CH598 start
	     //'<td align="right" style="padding-right: 30px;margin-top:-8px;">'+dealFugou(custNameText)+'</td>'+
	         //add by zhou 20230601_CH598 end
	     '</tr>'
	     //CH734 20230719 by zzq start
	     var invoiceAddressDates = [];
	     if (address3) {
	         invoiceAddressDates.push(address3)
	     }
	     if (address2) {
	         invoiceAddressDates.push(address2)
	     }
	     if (address1) {
	         invoiceAddressDates.push(address1)
	     }
	     if (city) {
	         invoiceAddressDates.push(city)
	     }
//	     if (custNameText) {
//	         invoiceAddressDates.push(custNameText)
//	     }
	     if(language == SYS_LANGUAGE_EN){
	         if(invoiceAddressDates.length != 0){
	             for(var i = 0; i < invoiceAddressDates.length; i++){
	                 str+= '<tr>'+
	                 '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceAddressDates[i]+'</td>'+
	                 '</tr>'
	           }
	             if(invoiceAddressDates.length <5){
	                 for(var k = invoiceAddressDates.length; k<5 ; k++){
	                 str+= '<tr>'+
	                 '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
	                 '</tr>'
	                 }
	             }
	         }
	     }else{
	         //CH734 20230717 by zzq start
	         str+= '<tr>'+
	     //  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
	     //  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'&nbsp;&nbsp;'+address1+'</td>'+
	         '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
	         '</tr>'+
	         '<tr>'+
	     //  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address1+'</td>'+
	         '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
	         '</tr>'+
	         '<tr>'+
	     //  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
	            '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
	         '</tr>'+
	         '<tr>'+
	     //  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
	         '<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(custNameText)+'</td>'+
	         //'<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
	         '<td align="left" style="padding-bottom:0px;margin-top:-8px;">'+stomach+'</td>'+
	         '</tr>'+
	         '<tr>'+
	         '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
	         //20230731 CH756&CH757 by zdj start
	         '</tr>'
	         //20230731 CH756&CH757 by zdj end
	     }
	     //CH734 20230719 by zzq end
	     str+='<tr>'+
	     //CH734 20230717 by zzq start
	 //  '<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(custNameText)+'</td>'+
	     '<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'
	 //  '<td align="left" style="padding-bottom:0px;margin-top:-8px;">御中</td>'+
	      str += '<td align="left" style="padding-bottom:0px;margin-top:-8px;">&nbsp;</td>' + 
	      '</tr>';
//	      '<tr>';
//	     if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
//	         str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
//	         '</tr>'
////	         '<tr>'+
////	         '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
////	         '</tr>';
//	     }
//	     // modify by lj start DENISJAPANDEV-1376
//	     else{
////	       str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Tel:'+invPhone+'</td>'+
////	       '</tr>'+
////	       '<tr>'+
////	       '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Fax:'+invFax+'</td>'+
////	       '</tr>';
//	         str += '</tr>';
//	     }
	     // modify by lj end DENISJAPANDEV-1376

	     // CH756&CH757 20230731 by zdj start
	     // str += '<tr style="height: 40px;"></tr>'+
	     // '</table>'+
	     str += '<tr style="height: 30px;"></tr>'+
	     '</table>'+
	     // CH756&CH757 20230731 by zdj end
	     '</td>'+
	     '</tr>'+
	     '</table>'+
	     '</td>'+
	     
	     '<td style="padding-left: 30px;">'+
	     '<table style="width: 320px;font-weight: bold;">'+
	     // CH756&CH757 20230731 by zdj start
	     '<tr style="height: 25px;">'+
	     //'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
	     '<td width="6%px" colspan="2">&nbsp;</td>'
	     nlapiLogExecution('DEBUG', 'subsidiary', subsidiary);
	     if(subsidiary == SUB_NBKK){
	         str+='<td style="margin-top:-16px;" rowspan="5"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id='+NBKK_INSYOU_ID+'&amp;'+URL_PARAMETERS_C+'&amp;'+NBKK_INSYOU_URL+'" style="width:100px;height: 100px; position:absolute;top:25px;left:-82px;" /></td>'
	     }else if(subsidiary == SUB_ULKK){
	         str+='<td style="margin-top:-16px;" rowspan="5"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id='+ULKK_INSYOU_ID+'&amp;'+URL_PARAMETERS_C+'&amp;'+ULKK_INSYOU_URL+'" style="width:100px;height: 100px; position:absolute;top:29px;left:-26px;" /></td>'
	     }else{
	         str+='<td style="margin-top:-16px;" rowspan="5">&nbsp;</td>'
	     }
	     //  '<td colspan="2" style="width:50%;margin-top:-16px;"><img src="/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
	     str+='<td width = "10px">&nbsp;</td>'
	     str+='</tr>';
	     // CH756&CH757 20230731 by zdj start
	     //20230208 changed by zhou start CH298
	     //20230628 changed by zzq start CH701
	 //  if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
//	       str+='<tr>'+
//	       //add by zhou 20230601_CH598 start
//	       '<td colspan="2" style="margin-left:-72px;margin-top:-8px;">&nbsp;'+dealFugou(custNameText)+'</td>'+
//	       //add by zhou 20230601_CH598 end
//	       '</tr>';
	 //  }
	     //20230628 changed by zzq start CH701
	     //end
	     str+='<tr>'+
	     '<td style="font-size:17px;margin-top:-5px;" colspan="3">'+invoiceNameEng+'&nbsp;</td>'+
	     '</tr>'+
	     '<tr>'+
//	     '<td style="font-size: 20px;margin-top:-2px;font-family: NotoSansCJKkr_Bold ; " colspan="3" >'+invoiceLegalname+'&nbsp;</td>'+
	     '<td colspan="3" ><span style="font-size: 19px;font-family: heiseimin;" >'+invoiceLegalname+'</span>&nbsp;</td>'+
	     '</tr>'+
	     '<tr>'+
//	     '<td colspan="2" style="font-size: 10px;margin-top:-2px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'&nbsp;</td>'+
	     '<td colspan="3" style="font-size: 10px;margin-top:-2px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'&nbsp;</td>'+
	     '</tr>'+
	     '<tr>'
	     //CH734 20230717 by zzq start
	 //  if (language == SYS_LANGUAGE_JP) {   
	     //'<td colspan="2" style="font-size: 10px;margin-top:-2px;">〒'+invoiceAddressZip+'&nbsp;</td>'
	         str+='<td colspan="2" style="font-size: 10px;margin-top:-2px;">〒'+invoiceAddressZip+'&nbsp;</td>'
	 //  }else{
//	       str+='<td colspan="2" style="font-size: 10px;margin-top:-2px;">'+invoiceAddressZip+'&nbsp;</td>'
	 //  }
	     //CH734 20230717 by zzq end
	     str+='</tr>'+
	     '<tr>'+
	     '<td colspan="3" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+invoiceAddressThree+'&nbsp;</td>'+
	     '</tr>'+
	     '<tr>'+
	     '<td style="font-size: 10px;margin-top:-4px;">TEL:&nbsp;'+invoicePhone+'</td>'+
	     '<td style="font-size: 10px;margin-top:-4px;">FAX:&nbsp;'+invoiceFax+'</td>'+
	     '</tr>'+
	     '<tr>'+
	     '<td colspan="3" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressEng+'</td>'+
	     '</tr>'+
	     '</table>'+
	     '</td>'+
	     '</tr>'+
	     '</table>';
	     
	     str+='<table style="width: 660px;margin-top: 10px;font-weight: bold;">'+
	     '<tr>'+
	     '<td style="line-height: 30px;font-weight:bold;font-size: 11pt;border: 1px solid black;height: 30px;width:660px;" align="center" colspan="5">'+invoiceName+'</td>'+
	     '</tr>'+
	     '</table>'+ 
	     '<table style="width: 660px;font-weight: bold;">'+
	     '<tr>'+
	     '<td style="width:510px;margin-top:-5px;margin-left:-20px;" colspan="2">&nbsp;</td>'+
	     '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;" align="right"></td>'+
	     '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
	     '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
	     '</tr>'+    
	     '<tr padding-bottom="-11px">'+
	     '<td style="width: 225px;">&nbsp;&nbsp;'+dateName+'&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
	     '<td style="width: 285px;margin-left:-25px;">'+deliveryName+'&nbsp;:&nbsp;'+delivery_date+'</td>'+
	     '<td style="width: 50px;"></td>'+
	     '<td style="width: 50px;"></td>'+
	     '<td style="width: 50px;"></td>'+
	     '</tr>'+
	     '<tr>'+
	     '<td style="width: 225px;margin-top:-8px;">&nbsp;</td>'+
	     // modify by lj start DENISJAPANDEV-1385
	 //  '<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+payment+'</td>'+
	     // add zhou CF413 20230523 start
	     '<td style="width: 285px;margin-top:-8px;margin-left:-25px;">&nbsp;</td>'+
	 //  '<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+ customerPayment + '</td>'+
	     // add zhou CF413 20230523 end
	     // modify by lj END DENISJAPANDEV-1385
	     '<td style="width: 50px;margin-top:-8px;"></td>'+
	     '<td style="width: 50px;margin-top:-8px;"></td>'+
	     '<td style="width: 50px;margin-top:-8px;"></td>'+
	     '</tr>'+
	     '<tr>'+
	     // add zhou CF413 20230523 start
	 //  '<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'+
	 //  '<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+'&nbsp;'+otherrefnum+'</td>'+
	     '<td style="width: 300px;margin-top:-8px;">&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'+
	     '<td style="width: 100px;margin-left:-25px;margin-top:-8px;">'+paymentName+'&nbsp;:&nbsp;'+ customerPaymentTerms + '</td>'+
	     '<td style="width: 260px;margin-left:-50px;margin-top:-8px;" colspan="3">&nbsp;'+numberName2+''+dealFugou(otherrefnum)+'</td>'+
	     // add zhou CF413 20230523 end
	     '</tr>';
	     
	     // modify by lj start DENISJAPANDEV-1376
	     //20221206 add by zhou CH116 start
	     //changed by zhou 20230208 CH298 
	 //  if((subsidiary != SUB_SCETI && subsidiary != SUB_DPKK ) &&  type != 'creditmemo'){
//	       str+='<tr>'+
//	       '<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;通貨コード&nbsp;:'+currency+'</td>'+
//	       '<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">価格コード&nbsp;:'+priceCode+'</td>'+
//	       '</tr>';
	 //  }
	     //end
	     // modify by lj end DENISJAPANDEV-1376
	     str+= '</table>'+
	     
	     '<table style="width: 660px;font-weight: bold;" border="0">';   
	     str+='<tr>';
	         var tmpMemo = '';
	         if (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) {
	             tmpMemo = dvyMemo;
	         } else {
	             tmpMemo = memo;
	         }
	         nlapiLogExecution('DEBUG', 'tmpMemo', tmpMemo);
	         if(!isEmpty(tmpMemo)){
	             // add by zhou ch598 20230601 start
//	           str+='<td style="width: 330px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+tmpMemo+'</td>'+
	             str+='<td style="width: 330px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+dealFugou(tmpMemo)+'</td>'+
	             // add by zhou ch598 20230601 end
	             '<td style="width: 110px;">&nbsp;</td>'+
	             '<td style="width: 100px;">&nbsp;</td>'+
	             '<td style="width: 100px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
	             '</tr>';
	         }else{
	             str+='<td style="width: 130px;margin-top:-8px;">&nbsp;</td>'+
	             '<td style="width: 200px;">&nbsp;</td>'+
	             '<td style="width: 110px;">&nbsp;</td>'+
	             '<td style="width: 100px;">&nbsp;</td>'+
	             '<td style="width: 100px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
	             '</tr>';
	         }
	     str+= '</table>';
	         
	     str+= '<table border="0" style="width: 660px;font-weight: bold;">'; 
	     str+='<tr style="border-bottom: 1px solid black;">'+
	     '<td style="width: 130px;">&nbsp;&nbsp;'+codeName+'</td>'+
	     '<td style="width: 210px;" align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+poductName+'</td>'+
	     '<td style="width: 110px;">&nbsp;&nbsp;'+quantityName+'</td>'+
	     '<td style="width: 100px;">&nbsp;&nbsp;'+unitpriceName+'</td>'+
	     '<td style="width: 100px;">&nbsp;&nbsp;'+amountName+'</td>'+
	     '</tr>'+
	     '</table>'+
	     '</macro>'+
	     '<macro id="nlfooter">'+
	     '<table border="0" style="border-top: 1px solid black;width: 660px;font-weight: bold;">'+
	     '<tr style="padding-top:5px;">'+
	     '<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
	     nlapiLogExecution('debug', 'entityid', entityid);
	     if(!isEmpty(incoicedelivery_Name)){
	         str+='<td style="width:270px;">'+destinationName+'&nbsp;'+dealFugou(incoicedelivery_Name)+'</td>';
	     }else{
	         str+='<td style="width:270px;">'+destinationName+'</td>';
	     }
	     //add by zhou 20230517_CH508 start
	     // add by zzq start
	 //  if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	     if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	     // add by zzq end
	         var invoAmountTotal0 =  parseFloat(invoAmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	     }else{
	         nlapiLogExecution('debug', 'invoAmountTotal', parseFloat(invoAmountTotal));
	         var invoAmountTotal0 =  parseFloat(invoAmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	     }
	     //add by zhou 20230517_CH508 enda
	 //  var dealSalesrep = ''; 
	 //  if (salesrep) {
//	       var tmpSalesreps = salesrep.split(' ');
//	       if (tmpSalesreps && tmpSalesreps.length > 1) {
//	           tmpSalesreps.reverse();
//	           tmpSalesreps.pop();
//	           tmpSalesreps.reverse();
//	           dealSalesrep = tmpSalesreps.join(' ');
//	       }
	 //  }
	      if(type =='creditmemo' && invoAmountTotal0){
	          invoAmountTotal0 = '-'+invoAmountTotal0
	      }
	     str+='<td style="width:80px;">&nbsp;&nbsp;'+totalName+'</td>'+
	     '<td style="width:90px;" align="right">'+invoAmountTotal0+'</td>'+
	     '</tr>'+
	     '<tr>'+
	     '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>'
	     if(!isEmpty(invdestinationZip)){
	       //CH734 20230717 by zzq start
	         if(language == SYS_LANGUAGE_JP){
	             str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒' + invdestinationZip + '</td>';
	         }else{
	             str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒' + invdestinationZip + '</td>';
	         }
//	             if (language == SYS_LANGUAGE_JP) {
//	                 str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒' + invdestinationZip + '</td>';
//	             } else {
//	                 str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + invdestinationZip + '</td>';
//	             }
	       //CH734 20230717 by zzq end
	     }
	     str+='</tr>'+
	     '<tr>'+
	     // 顧客名
	     //add by zhou 20230720_CH598 start
	     //add by zhou 20230601_CH598 start
	 //  '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + custName +dealFugou(custNameText)+ '</td>';
	     '<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	 //add by zhou 20230601_CH598 end
	     //add by zhou 20230720_CH598 end
	     if(!isEmpty(invdestinationState)){
	         if(language == SYS_LANGUAGE_JP){
	         str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
	         }else{
	             str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
	         }
	     }else{
	         str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	     }
	     //add by zhou 20230517_CH508 start
	     // add by zzq start
	 //  if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	     //add by zzq 20230625 CH654 start
	     // add by zzq 20230614 start

//	      if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//	            var consumptionTax8 = parseFloat(invTaxmountTotal8).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//	        }else{
//	            var consumptionTax8 = displaysymbol + parseFloat(invTaxmountTotal8).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//	        }
	     // add by zzq 20230614 end
	        if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	            var consumptionTax0 = parseFloat(invTaxmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	        }else{
	            var consumptionTax0 = parseFloat(invTaxmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	        }
	      //add by zzq 20230625 CH654 end
	 //  str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
	 //  '<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax0+'</td>'+
	      //add by zzq 20230625 CH654 start
	 //  str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName8+'</td>'+
	 //  '<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax8+'</td>'+
	    if(type =='creditmemo' && consumptionTax0){
	        consumptionTax0 = '-'+consumptionTax0
	      }
	     str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
	     '<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax0+'</td>'+
	     //add by zzq 20230625 CH654 end
	     '</tr>'+
	     //add by zhou 20230517_CH508 end
	     '<tr>'+
	 //  住所
	     //add by zzq 20230720_CH672 start
	 //  '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + addressNmae  + dealFugou(invoiceAddressState) + '</td>';
	     '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;</td>';
	     //add by zzq 20230720_CH672 end
	 //  '<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	     if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
	         if(language == SYS_LANGUAGE_JP){
	         str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationCity)+dealFugou(invdestinationAddress)+'</td>';
	         }else{
	             str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationCity)+dealFugou(invdestinationAddress)+'</td>';
	         }
	     }

	     str+='</tr>'+
	     
	     '<tr>'+
	     //add by zzq 20230720_CH672 start
	     //'<td style="width:220px;margin-top:-8px;;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + dealFugou(invoiceCityUnder) + '</td>';
	     '<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	     //add by zzq 20230720_CH672 end
	     if(!isEmpty(invdestinationAddress2)){
	         if(language == SYS_LANGUAGE_JP){
	         str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress2)+'</td>';
	         }else{
	             str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress2)+'</td>';
	         }
	     }else{
	         str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
	     }
	     //add by zhou 20230517_CH508 start
	     // add by zzq start
	 //  if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	     if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	     // add by zzq end
	         var invoToTotal0 = parseFloat(invoToTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
	     }else{
	         var invoToTotal0 = parseFloat(invoToTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	     }
	     //add by zhou 20230601_CH598 start
	 //  str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'</td>'+
	     //add by zzq 20230614 start
	     var invoiceSymbol = invoiceName1+'&nbsp;&nbsp;';
	     //add by zzq 2023025 CH654 start
//	     if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//	         // add by zzq end
//	             var consumptionTax10 = parseFloat(invTaxmountTotal10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//	         }else{
//	             var consumptionTax10 = displaysymbol + parseFloat(invTaxmountTotal10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//	         }
	   //add by zzq 2023025 CH654 end
	     //add by zzq 20230614 end
	     //add by zzq 20230614 start
	     if(type =='creditmemo' && invoToTotal0){
	         invoToTotal0 = displaysymbol+'-'+invoToTotal0
	      }else{
	          invoToTotal0 = displaysymbol+invoToTotal0
	      }
	     str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'&nbsp;&nbsp;</td>'+
	 //  //add by zhou 20230601_CH598 end
	     '<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal0+'</td>';
	        //add by zzq 2023025 CH654 start
	 //  str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName10+'</td>'+
	     str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;</td>'+
	     //add by zhou 20230601_CH598 end
	 //  '<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax10+'</td>'+
	     '<td style="width:100px;margin-top:-8px;" align="right">&nbsp;</td>'+
	       //add by zzq 2023025 CH654 end
	     //add by zzq 20230614 end
	     //add by zhou 20230517_CH508 end
	     '</tr>';
	 //  住所
	     // add by CH599 20230609 zzq start
	     //add by CH653 20230619 start
	     //add by CH653 20230720 zzq start
	 //  '<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>' +
	     if(!isEmpty(invdestinationAddress3)){
//	         str+='<tr><td style="margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td>' +
	         str+='<tr><td style="margin-top:-8px;margin-left:26px"></td>'
	         if(language == SYS_LANGUAGE_JP){
	             str+='<td style="width:220px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress3)+'</td></tr>';
	         }else{
	             str+='<td style="width:220px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress3)+'</td></tr>';
	         }
	     }else{
//	         str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>';
	         str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>';
	     }
	     //add by CH653 20230619 end
	 //  '<tr><td style="margin-top:-8px;margin-left:26px" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td>' +
	     //add by zzq 20230614 start
	 //  str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td></tr>' +
	     str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>' +
	 //  str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td>' +
	 //  '<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceSymbol + '</td>' +
	 //  '<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal0+'</td></tr>' +
	     //add by zzq 20230614 end
	 //  '<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address3 + '</td></tr>' +
	     '<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>' +
	 //  '<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>' +
	 //  '<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td></tr>' +
	 //  '<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address3 + '</td></tr>' +
	     // add by CH599 20230609 zzq end
	     //add by CH653 20230720 zzq end
	     '</table>'+
	     '<table style="width: 660px;font-weight: bold;">'
	     //20230731 CH756&CH757 by zdj start
	     //'<tr><td colspan="3" style="width:220px;margin-top:-8px;margin-left:7px">'+Vibration+'</td></tr>';
	 //  '<tr><td colspan="3" style="width:220px;margin-top:-8px;margin-left:7px">振込口座</td></tr>';
	     
	     if(language == SYS_LANGUAGE_JP){
	        if(bankName1){
	             //20230731 CH756&CH757 by zdj start
//	         str+='<tr>'+
	             str+='<tr padding-top="1px">'+
	             //20230731 CH756&CH757 by zdj end
	                 '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankName1+'</td>'+
	                 '<td style="margin-top:-8px;margin-left:7px;width:18%">'+bankBranchName1+'</td>'+
	                 '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
	               //'<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankNo1+'</td>'+
	               '<td style="margin-top:-8px;margin-left:7px;width:22%">&nbsp;</td>'+
	               '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
	                 '</tr>';
	         };
	         //20230731 CH756&CH757 by zdj start
	     //  if(bankName1 && bankName2){
////	             str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
//	         str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
	     //  }
	         //20230731 CH756&CH757 by zdj start
	         if(bankName2){
	             //20230731 CH756&CH757 by zdj start
	             str+='<tr padding-top="1px">'+
	             //20230731 CH756&CH757 by zdj start
	             '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName2+'</td>'+
	             '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankBranchName2+'</td>'+
	             '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
//	         '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankNo2+'</td>'+
	           '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
	           '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
	             '</tr>';
	             };
	         }else{
	             if(bankName1){
	               //バリエーション支援 20230804 add by zdj start
	                 str+='<tr>'+
	                 '<td>&emsp;</td>'+
	                 '</tr>'
	               //バリエーション支援 20230804 add by zdj end
	                 //20230731 CH756&CH757 by zdj start
//	             str+='<tr>'+
	                 str+='<tr padding-top="1px">'+
	                 //20230731 CH756&CH757 by zdj end
//	                     '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankName1+'</td>'+
//	                     '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankBranchName1+'</td>'+
//	                     '<td style="margin-top:-8px;margin-left:7px;width:25%">'+swiftValue+'</td>'+
//	                     '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankType1+bankNo1+'</td>'+
	                  //バリエーション支援 20230803 add by zdj start
	                 '<td  colspan = "3" style="margin-top:-8px;margin-left:7px;width:25%">'+bankName1+'&emsp;'+bankBranchName1+'&emsp;'+swiftValue+'&emsp;'+bankType1+bankNo1+'</td>'+
	                  //バリエーション支援 20230803 add by zdj end
//	                 '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo1+'</td>'+
	                     '</tr>';
	             };
	             //20230731 CH756&CH757 by zdj start
	         //  if(bankName1 && bankName2){
////	                 str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
//	             str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
	         //  }
	             
//	             if(bankName2){
//	                 str+='<tr padding-top="1px">'+
//	                 '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankName2+'</td>'+
//	                 '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankBranchName2+'</td>'+
//	                 '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
//	                 '<td style="margin-top:-8px;margin-left:7px;width:25%">'+SWIFTValue+'</td>'+
//	                 '</tr>';
//	                 };
	         }
	 //  if(bankName1){
//	       //20230731 CH756&CH757 by zdj start
////	         str+='<tr>'+
//	       str+='<tr padding-top="1px">'+
//	       //20230731 CH756&CH757 by zdj end
//	           '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName1+'</td>'+
//	           '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName1+'</td>'+
//	           '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
////	             '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo1+'</td>'+
//	           '</tr>';
	 //  };
	 //  //20230731 CH756&CH757 by zdj start
////	     if(bankName1 && bankName2){
//////	       str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
////	         str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
////	     }
	 //  //20230731 CH756&CH757 by zdj start
	 //  if(bankName2){
//	       //20230731 CH756&CH757 by zdj start
//	       str+='<tr padding-top="1px">'+
//	       //20230731 CH756&CH757 by zdj start
//	       '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName2+'</td>'+
//	       '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName2+'</td>'+
//	       '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
////	         '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo2+'</td>'+
//	       '</tr>';
	 //};
	     //20230731 CH756&CH757 by zdj end
	     str+='</table>'+
	     '</macro>'+
	     '</macrolist>'+
	     
	     
	     '    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
	     '<#if .locale == "zh_CN">'+
	     'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
	     '<#elseif .locale == "zh_TW">'+
	     'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
	     '<#elseif .locale == "ja_JP">'+
	     'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
	     '<#elseif .locale == "ko_KR">'+
	     'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
	     '<#elseif .locale == "th_TH">'+
	     'font-family: NotoSans, NotoSansThai, sans-serif;'+
	     // add by zzq start
	     '<#elseif .locale == "en">'+
	     'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
	     // add by zzq end    
	     '<#else>'+
	     'font-family: NotoSans, sans-serif;'+
	     '</#if>'+
	     '}'+
	     'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
	     'td { padding: 4px 6px;}'+
	     'b { font-weight: bold; color: #333333; }'+
	     '.nav_t1 td{'+
	     'width: 110px;'+
	     'height: 20px;'+
	     'font-size: 13px;'+
	     'display: hidden;'+
	     '}'+
	     '</style>'+
	     '</head>';
	     
	     // CH756&757 20230731 by zdj start
	     // str+='<body header="nlheader" header-height="30%" padding="0.5in 0.5in 0.5in 0.5in" size="A4" footer="nlfooter" footer-height="12%">'+
	     str+='<body header="nlheader" header-height="26%" padding="0.2in 0.5in 0.3in 0.5in" size="A4" footer="nlfooter" footer-height="10%">'+
//	     str+='<body header="nlheader" header-height="28%" padding="0.2in 0.5in 0.3in 0.5in" size="A4" footer="nlfooter" footer-height="10%">'+
	     //'<table style="width: 660px;font-weight: bold;" padding-top="10px">'; 
	     '<table style="width: 660px;font-weight: bold;" padding-top="54px">'; 
	     // CH756&757 20230731 by zdj end
//	     str+='<tr>'+
//	     '<td style="width: 130px;"></td>'+
//	     '<td style="width: 210px;"></td>'+
//	     '<td style="width: 110px;"></td>'+
//	     '<td style="width: 100px;"></td>'+
//	     '<td style="width: 100px;"></td>'+
//	     '</tr>';
	     for(var i = 0;i<itemLine.length;i++){
	         //add by zzq CH703 20230714 start
	         var itemQuantity = formatAmount1(itemLine[i].invoiceQuantity);
	         //add by zzq CH703 20230714 end
	         str+='<tr>'+
	         // add by CH599 20230609 zzq start
//	       '<td style="width: 130px;" rowspan="3">&nbsp;'+itemLine[i].invoiceInitemid+'</td>'+
	         '<td style="width: 130px;">'+itemLine[i].invoiceInitemid+'</td>'+
	         // add by CH599 20230609 zzq end
	         '<td style="width: 210px;">'+dealFugou(itemLine[i].invoiceDisplayName)+'</td>'+
	          //add by zzq CH703 20230714 start
//	       '<td style="width: 110px;" align="center">'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>';
	         '<td style="width: 110px;" align="right">'+itemQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>';
	         //add by zzq CH703 20230714 end
	         // add by zzq start
//	       if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	         if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	         // add by zzq end
	             var itemRateForma = itemLine[i].invoiceRateFormat;
	             //nlapiLogExecution('DEBUG', 'itemRateForma', itemRateForma);
	             var itemAmount = itemLine[i].invoiceAmount;
	             if(itemAmount){
	                 itemAmount = itemAmount.split('.')[0]
	             }
	             if(type =='creditmemo' && itemAmount){
	                 itemAmount = '-'+itemAmount
	             }
	             str+= '<td style="width: 100px;" align="right">'+itemRateForma.split('.')[0]+'</td>'+
	             '<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemAmount+'</td>'+
	             '</tr>';
	         }else{
	             var itemAmount = itemLine[i].invoiceAmount
	             if(type =='creditmemo' && itemAmount){
	                 itemAmount = '-'+itemLine[i].invoiceAmount
	             }
	             str+= '<td style="width: 100px;" align="right">'+itemLine[i].invoiceRateFormat+'</td>'+
	             '<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemAmount+'</td>'+
	             '</tr>';
	         }
	         
//	       str+= '<tr>'+
////	         '<td style="width: 130px;">&nbsp;'+itemLine[i].productCode+'</td>'+
//	       '<td style="width: 210px;">&nbsp;</td>'+
//	       '<td style="width: 110px;" align="right">&nbsp;</td>';
//	         str+='<td style="width: 100px;">&nbsp;</td>';
//	         str+='<td style="width: 100px;" align="right">&nbsp;</td>';
//	       str+='</tr>';
//	       
//	       // CH408 zheng 20230518 start
//	         str+= '<tr>'+
////	         '<td style="width: 130px;">&nbsp;'+itemLine[i].locBarCode+'</td>'+
//	         '<td style="width: 210px;">&nbsp;</td>'+
//	         '<td style="width: 110px;" align="right">&nbsp;</td>';
//	         str+='<td style="width: 100px;">&nbsp;</td>';
//	         str+='<td style="width: 100px;" align="right">&nbsp;</td>';
//	         str+='</tr>';
	         
//	         str+= '<tr>'+
//	         '<td style="width: 130px;margin-left: 36px;">&nbsp;</td>'+
//	         '<td style="width: 210px;">&nbsp;</td>'+
//	         '<td style="width: 110px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'</td>';
//	      // add by zzq start
////	       if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//	         if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//	         // add by zzq end
//	             var itemTaxamount = itemLine[i].invoiceTaxamount;
//	             str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//	             str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount.split('.')[0]+'</td>';
//	         }else{
//	             str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//	             str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+displaysymbol+itemLine[i].invoiceTaxamount+'</td>';
//	         }
//	         // CH408 zheng 20230518 end
//	         
//	         str+='</tr>';
	     }
	     for(var k = 0;k<resultItemTaxArr.length;k++){
	         str+= '<tr>'+
	         '<td style="width: 130px;margin-left: 36px;">&nbsp;</td>'+
	         '<td style="width: 210px;">&nbsp;</td>'+
	         '<td style="width: 110px;" align="right" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'&nbsp;'+resultItemTaxArr[k].invoiceTaxrate1Format+'&nbsp;&nbsp;'+taxAmountName+'</td>';
	      // add by zzq start
	         var itemTaxamount = resultItemTaxArr[k].invoiceTaxamount;
	         if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
	             // add by zzq end
//	             itemTaxamount = itemTaxamount.toString();
	             if(!itemTaxamount){
	                 itemTaxamount = 0;
	             }else{
	                 itemTaxamount = itemTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	                 itemTaxamount = itemTaxamount.split('.')[0];
	             }
//	             str+='<td style="width: 100px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//	             str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount+'</td>';
	         }else{
//	             itemTaxamount = itemTaxamount.toString();
	             if(!itemTaxamount){
	                 itemTaxamount = 0;
	             }else{
	                 itemTaxamount = itemTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	             }
//	             str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//	             str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount+'</td>';
	         }
	         if(type =='creditmemo' && itemTaxamount){
	             itemTaxamount = '-'+itemTaxamount;
	         }
	         str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount+'</td>';
	         // CH408 zheng 20230518 end
	         
	         str+='</tr>';
	     }
	     str+='</table>';
	     str+='</body>';

	     str += '</pdf>';
	         var renderer = nlapiCreateTemplateRenderer();
	         renderer.setTemplate(str);
	         var xml = renderer.renderToString();
	         var xlsFile = nlapiXMLToPDF(xml);
	         // PDF
	         xlsFile.setName(fileName  + '.pdf');
	      	 //xlsFile.setFolder(INVOICE_PDF_ID_DJ_INVOICEPDF);
	         //20230901 add by CH762 zzq start 
	         var SAVE_FOLDER = INVOICE_PDF_MAIL_DJ_INVOICEPDF;
	         if(subsidiary == SUB_NBKK){
	             SAVE_FOLDER = INVOICE_PDF_MAIL_DJ_INVOICEPDF_NBKK;
	         }else if(subsidiary == SUB_ULKK){
	             SAVE_FOLDER = INVOICE_PDF_MAIL_DJ_INVOICEPDF_ULKK;
	         }
	        //20230901 add by CH762 zzq end 
	         xlsFile.setFolder(SAVE_FOLDER);
	         xlsFile.setIsOnline(true);
	         // save file
	         var fileID = nlapiSubmitFile(xlsFile);
	         return fileID;
	         
//		    20230727 add by zdj end
//		  //add by 20230607 zzq CH630 start
//            var invAmount = 0;
//            var invTaxamount = 0;
//            var itemLine = new Array();
//            var invoiceID = recordId; //ID
//            var invoiceRecord = nlapiLoadRecord('invoice', invoiceID);
//            var tmpLocationDic = getLocations(invoiceRecord);
//            var entity = invoiceRecord.getFieldValue('entity');//顧客
//            var customerSearch = nlapiSearchRecord("customer", null,
//                [
//                    ["internalid", "anyof", entity]
//                ],
//                [
//                    new nlobjSearchColumn("address2", "billingAddress", null), //請求先住所2
//                    new nlobjSearchColumn("address3", "billingAddress", null), //請求先住所3
//                    new nlobjSearchColumn("city", "billingAddress", null), //請求先市区町村
//                    new nlobjSearchColumn("zipcode", "billingAddress", null), //請求先郵便番号
//                    new nlobjSearchColumn("custrecord_djkk_address_state", "billingAddress", null), //請求先都道府県         
//                    new nlobjSearchColumn("phone"), //電話番号
//                    new nlobjSearchColumn("fax"), //Fax
//                    new nlobjSearchColumn("entityid"), //id
//                    new nlobjSearchColumn("salesrep"), //販売員（当社担当）
//                    new nlobjSearchColumn("language"),  //言語
//                    new nlobjSearchColumn("currency"),  //基本通貨
//                    new nlobjSearchColumn("custrecord_djkk_pl_code_fd", "custentity_djkk_pl_code_fd", null),   //DJ_販売価格表コード（食品）
//                    new nlobjSearchColumn("companyname"), //naem 
//                    new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_顧客支払条件
//                    new nlobjSearchColumn("address1", "billingAddress", null) //請求先住所1
//                ]
//            );
//            var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//住所2
//            var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//住所3
//            var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//市区町村
//            var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//郵便番号
//            var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//都道府県 
//            var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//電話番号
//            var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
//            var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
//            var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//販売員（当社担当）
//            var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//言語
//            var currency= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("currency"));//販売員（当社担当）
//            var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_pl_code_fd","CUSTENTITY_DJKK_PL_CODE_FD",null));//DJ_販売価格表コード（食品）code
//            var custNameText= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//name add by lj
//            var customerPayment = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_customer_payment"));//add by lj
//            var address1 = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address1","billingAddress",null));//add by lj
//            var trandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //請求書日付
//            var delivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //請求書納品日
//            var tranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //請求書番号
//            var transactionnumber = defaultEmpty(invoiceRecord.getFieldValue('transactionnumber'));    //トランザクション番号　221207王より追加
//            var createdfrom = defaultEmpty(invoiceRecord.getFieldValue('createdfrom'));    //請求書作成元
//            var otherrefnum = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_customerorderno'));    //先方発注番号
//            var soNumber = '';
//            if(!isEmpty(createdfrom)){
//                var so = nlapiLoadRecord('salesorder',createdfrom);
//                soNumber = so.getFieldValue('transactionnumber');
//            }
//            var payment = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_payment_conditions'));    //請求書支払条件
//            var salesrep = defaultEmpty(invoiceRecord.getFieldText('salesrep'));    //営業担当者
//            var memo = defaultEmpty(invoiceRecord.getFieldValue('memo'));    //memo
//            var dvyMemo = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_deliverynotememo')); //納品書備考
//            var subsidiary = defaultEmpty(invoiceRecord.getFieldValue('subsidiary'));    //請求書子会社
//            var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
//                    [
//                        ["internalid","anyof",subsidiary]
//                    ], 
//                    [
//                        new nlobjSearchColumn("legalname"),  //正式名称
//                        new nlobjSearchColumn("name"), //名前
//                        new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
//                        new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
//                        new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
//                        new nlobjSearchColumn("address1","address",null), //住所1
//                        new nlobjSearchColumn("address2","address",null), //住所1
//                        new nlobjSearchColumn("address3","address",null), //住所2
//                        new nlobjSearchColumn("city","address",null), //市区町村
//                        new nlobjSearchColumn("zip","address",null), //郵便番号
//                        new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
//                        new nlobjSearchColumn("phone","address",null), //phone
//                        new nlobjSearchColumn("custrecord_djkk_invoice_issuer_number"),//適格請求書発行事業者番号
//                        new nlobjSearchColumn("custrecord_djkk_bank_1"),//DJ_銀行1
//                        new nlobjSearchColumn("custrecord_djkk_bank_2"),//DJ_銀行2
//                        //CH655 20230725 add by zdj start
//                        new nlobjSearchColumn("phone","shippingAddress",null),//配送先phone
//                        new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//配送先fax
//                        //CH655 20230725 add by zdj end
//                    ]
//                );
//            var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//正式名称
//            var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//名前
//            var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address1","address",null));//住所1
//            var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//住所2
//            var invoiceAddressThree= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//住所3
//            var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//郵便番号
//            var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//市区町村
//            var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
//            var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
//            var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//住所英語
//            var invoiceFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax
//            var invoicePhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","address",null));//phone
//            var invoiceIssuerNumber= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_invoice_issuer_number"));//適格請求書発行事業者番号
//            var bank1 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_1");
//            var bank2 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_2");
//            var bankInfo = [];
//            var bank1Value = '';
//            var bank2Value = '';
//            if(bank1){
//                bank1 = nlapiLoadRecord('customrecord_djkk_bank', bank1);
//                var bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name'));
//                if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))){
//                    bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))+')';
//                }
//                var bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));
//                if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code'))){
//                    bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
//                }
//                var bankType1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_type'));
//                var bankNo1 = '';
//                if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'))){
//                    bankNo1 = 'No.'+ defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
//                }
//            }
//            if(bank2){
//                bank2 = nlapiLoadRecord('customrecord_djkk_bank', bank2);
//                var bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name'));
//                if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))){
//                    bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))+')';
//                }
//                var bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));
//                if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code'))){
//                    bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
//                }
//                var bankType2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_type'));
//                var bankNo2 = '';
//                if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'))){
//                    bankNo2 = 'No.'+ defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
//                }
//            }
//            var incoicedelivery_destination = invoiceRecord.getFieldValue('custbody_djkk_delivery_destination');    //請求書納品先
//            if(!isEmpty(incoicedelivery_destination)){  
//                
//                var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
//                        [
//                            ["internalid","anyof",incoicedelivery_destination]
//                        ], 
//                        [
//                            new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
//                            new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
//                            new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
//                            new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
//                            new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
//                            new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_納品先名前
//                                  
//                        ]
//                        );  
//                var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//郵便番号
//                var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//都道府県
//                var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_市区町村
//                var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_納品先住所1
//                var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_納品先住所2
//                var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_納品先名前
//            }
//            var invoiceCount = invoiceRecord.getLineItemCount('item');
//            var invoToTotal =0;
//            var invoAmountTotal = 0;
//            var invTaxmountTotal = 0;
//            for(var k=1;k<invoiceCount+1;k++){
//                invoiceRecord.selectLineItem('item',k);
//                var invoiceItemId = invoiceRecord.getLineItemValue('item','item',k);    //item
//                var invoiceItemSearch = nlapiSearchRecord("item",null,
//                        [
//                            ["internalid","anyof",invoiceItemId],
//                        ],
//                        [
//                          new nlobjSearchColumn("itemid"), //商品コード
//                          new nlobjSearchColumn("displayname"), //商品名
//                          new nlobjSearchColumn("custitem_djkk_product_code"), //カタログ製品コード
//                        ]
//                        ); 
//                    
//                    var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//商品コード
//                    var productCode= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("custitem_djkk_product_code"));//カタログ製品コード
//                    var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
//                    invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;")
//                    var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//数量
//                    var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//単価
//                    var invoiceAmount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','amount',k)));//金額  
//                    invAmount = 0;
//                    if(!isEmpty(invoiceAmount)){
//                        var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');   
//                        invAmount  += invoiceAmount;
//                        invoAmountTotal = invoAmountTotal + invoiceAmount;
//                    }else{
//                        var invAmountFormat = '0';
//                    }
//                    
//                    var invoiceTaxrate1Format = defaultEmpty(invoiceRecord.getLineItemValue('item','taxrate1',k));//税率
//                    var invoiceTaxamount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','tax1amt',k)));//税額   
//                    invTaxamount = 0;
//                    if(!isEmpty(invoiceTaxamount)){
//                        var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//                        invTaxamount += invoiceTaxamount;
//                        invTaxmountTotal = invTaxmountTotal + invoiceTaxamount;
//                    }else{
//                        var invTaxamountFormat = '0';
//                    }
//                    
//                    var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
//                    if(!isEmpty(invoTotal)){
//                        invoToTotal = invoToTotal + invoTotal;
//                    }
//
//                    var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//単位
//                    var itemLocId = defaultEmpty(invoiceRecord.getLineItemValue('item','location',k)); // 場所
//                    var locBarCode = '';
//                    if (itemLocId) {
//                        var tmpDicBarCode = tmpLocationDic[itemLocId];
//                        if (tmpDicBarCode) {
//                            locBarCode = tmpDicBarCode;
//                        }
//                    }
//                    itemLine.push({
//                        invoiceInitemid:invoiceInitemid,  //商品コード
//                        invoiceDisplayName:invoiceDisplayName,//商品名
//                        invoiceQuantity:invoiceQuantity,//数量
//                        invoiceRateFormat:invoiceRateFormat,//単価
//                        invoiceAmount:invAmountFormat,//金額  
//                        invoiceTaxrate1Format:invoiceTaxrate1Format,//税率
//                        invoiceTaxamount:invTaxamountFormat,//税額  
//                        invoiceUnitabbreviation:invoiceUnitabbreviation,
//                        productCode:productCode,//カタログ製品コード
//                        locBarCode:locBarCode//DJ_場所バーコード
//                    }); 
//            }
//            if(custLanguage == '日本語'){
//                var dateName = '日\xa0\xa0付';
//                var deliveryName = '納品日';
//                var paymentName = '支払条件';
//                var numberName = '番\xa0\xa0号';
//                var numberName2 = '御社発注番号:';
//                var codeName = 'コード';
//                var invoiceName = '*\xa0\xa0\*\xa0\xa0\*請\xa0\xa0\xa0\xa0\求\xa0\xa0\xa0\xa0\書*\xa0\xa0\*\xa0\xa0\*';
//                var quantityName = '数\xa0\xa0\xa0\xa0\xa0\xa0\xa0量';
//                var unitpriceName = '単\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0価';
//                var amountName = '金\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0額';
//                var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\名';
//                var taxRateName = '***\xa0\xa0\税\xa0率:';
//                var taxAmountName = '税額:';
//                var custCode = '顧客コード\xa0\xa0:';
//                var destinationName = '納品先\xa0\xa0:';
//                var totalName = '合\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0計';
//                var consumptionTaxName = '消\xa0\xa0費\xa0\xa0税';
//                var invoiceName1 = '御請求額';
//                var personName = '担当者\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
//                var memoName = 'メ\xa0\xa0モ';
//                var custName = '顧客名\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
//                var addressNmae = '住所\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
//                var invoiceIssuerNumberName = '適格請求書発行事業者番号:';
//
//            }else{
//                var dateName = 'Date';
//                var deliveryName = 'Delivery Date';
//                var paymentName = 'Payment Terms';
//                var numberName = 'Number';
//                var numberName2 = 'Order number:';
//                var codeName = 'Code';
//                if(type == 'creditmemo'){
//                    var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Credit Memo*\xa0\xa0\*\xa0\xa0\*';
//                }else{
//                    var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Invoice*\xa0\xa0\*\xa0\xa0\*';
//                }
//                var quantityName = 'Quantity';
//                var unitpriceName = 'Unit Price';
//                var amountName = 'amount';
//                var poductName = 'Product name';
//                var taxRateName = 'tax rate:';
//                var taxAmountName = 'TaxAmt:';
//                var custCode = 'Customer code:';
//                var destinationName = 'Delivery:';
//                var totalName = 'Total';
//                var consumptionTaxName = 'Excise tax';
//                var invoiceName1 = 'Invoice';
//                var personName = 'Person:';
//                var memoName = 'Memo';
//                var custName = 'Customer name:';
//                var addressNmae = 'address:';
//                var invoiceIssuerNumberName = 'Registered Enterprises Number:';
//            }
//            var subsidiary = getRoleSubsidiary();
//            var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
//            '<pdf>'+
//            '<head>'+
//            '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
//            '<#if .locale == "zh_CN">'+
//            '<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
//            '<#elseif .locale == "zh_TW">'+
//            '<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
//            '<#elseif .locale == "ja_JP">'+
//            '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
//            '<#elseif .locale == "ko_KR">'+
//            '<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
//            '<#elseif .locale == "th_TH">'+
//            '<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
//            '</#if>'+
//            
//            '<macrolist>'+
//            '<macro id="nlfooter">'+
//            '<table style="border-top: 1px solid black;width: 660px;font-weight: bold;">'+
//            '<tr style="padding-top:5px;">'+
//            '<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
//            if(!isEmpty(incoicedelivery_Name)){
//                str+='<td style="width:270px;">'+destinationName+'&nbsp;'+dealFugou(incoicedelivery_Name)+'</td>';
//            }else{
//                str+='<td style="width:270px;">'+destinationName+'</td>';
//            }
//            //add by zhou 20230517_CH508 start
//            if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//                var invoAmountTotal0 =  parseFloat(invoAmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//            }else{
//                nlapiLogExecution('debug', 'invoAmountTotal', parseFloat(invoAmountTotal));
//                var invoAmountTotal0 =  parseFloat(invoAmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//            }
//            //add by zhou 20230517_CH508 enda
//            str+='<td style="width:70px;">&nbsp;&nbsp;'+totalName+'</td>'+
//            '<td style="width:70px;" align="right">'+invoAmountTotal0+'</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>';
//            if(!isEmpty(invdestinationZip)){
//                str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+invdestinationZip+'</td>';
//            }
//            str+='</tr>'+
//            '<tr>'+
//            // 顧客名
//            '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + custName +dealFugou(custNameText)+ '</td>';
//            if(!isEmpty(invdestinationState)){
//                str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
//            }else{
//                str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//            }
//            if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//                var consumptionTax0 = parseFloat(invTaxmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//            }else{
//                var consumptionTax0 = parseFloat(invTaxmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//            }
//            
//            str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
//            '<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax0+'</td>'+
//            '</tr>'+
//            '<tr>'+
//            //  住所
//            '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + addressNmae  + dealFugou(invoiceAddressState) + '</td>';
//
//            if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
//                str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationCity)+dealFugou(invdestinationAddress)+'</td>';
//            }
//
//            str+='</tr>'+
//            
//            '<tr>'+
//            '<td style="width:220px;margin-top:-8px;;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + dealFugou(invoiceCity) + '</td>';
//            //  '<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//            if(!isEmpty(invdestinationAddress2)){
//                str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress2)+'</td>';
//            }else{
//                str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//            }
//            //add by zhou 20230517_CH508 start
//            if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//                var invoToTotal0 = parseFloat(invoToTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//            }else{
//                var invoToTotal0 = parseFloat(invoToTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//            }
//            str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'&nbsp;&nbsp;&yen;</td>'+
//            '<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal0+'</td>'+
//            '</tr>'+
//            //  住所
//            '<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>' +
//            '<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td></tr>' +
//            '<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address3 + '</td></tr>' +
//
//            '</table>'+
//            '<table style="width: 660px;font-weight: bold;">'+
//            '<tr><td colspan="3" style="width:220px;margin-top:-8px;margin-left:7px">振込口座</td></tr>';
//            
//            if(bankName1){
//                str+='<tr>'+
//                    '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName1+'</td>'+
//                    '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName1+'</td>'+
//                    '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
//                    '</tr>';
//            };
//            if(bankName1 && bankName2){
//                str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
//            }
//            if(bankName2){
//                str+='<tr>'+
//                '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName2+'</td>'+
//                '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName2+'</td>'+
//                '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
//                '</tr>';
//        };
//            str+='</table>'+
//            '</macro>'+
//            '</macrolist>'+
//            
//            
//            '    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
//            '<#if .locale == "zh_CN">'+
//            'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
//            '<#elseif .locale == "zh_TW">'+
//            'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
//            '<#elseif .locale == "ja_JP">'+
//            'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
//            '<#elseif .locale == "ko_KR">'+
//            'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
//            '<#elseif .locale == "th_TH">'+
//            'font-family: NotoSans, NotoSansThai, sans-serif;'+
//            '<#else>'+
//            'font-family: NotoSans, sans-serif;'+
//            '</#if>'+
//            '}'+
//            'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
//            'td { padding: 4px 6px;}'+
//            'b { font-weight: bold; color: #333333; }'+
//            '.nav_t1 td{'+
//            'width: 110px;'+
//            'height: 20px;'+
//            'font-size: 13px;'+
//            'display: hidden;'+
//            '}'+
//            '</style>'+
//            '</head>';
//            
//            str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4" footer="nlfooter" footer-height="12%">'+
//            '<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
//            '<tr>'+
//            '<td>'+
//            '<table style="font-weight: bold;width:335px;">'+
//            '<tr style="height: 18px;" colspan="2"></tr>'+  
//            '<tr>'+
//            '<td style="border:1px solid black;" corner-radius="4%">'+
//            '<table>'+
//            '<tr style="height:10px;"></tr>'+
//            '<tr>'+
//            '<td>〒'+invoiceZipcode+'</td>'+
//            '<td align="right" style="margin-right:-22px;">&nbsp;</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invAddress+'</td>'+
//                //add by zhou 20230601_CH598 start
//            '<td align="right" style="padding-right: 30px;margin-top:-8px;">'+dealFugou(custNameText)+'</td>'+
//                //add by zhou 20230601_CH598 end
//            '</tr>'+
//            '<tr>'+
//            '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address1+'</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td align="right" style="padding-right: 75px;padding-bottom:0px;margin-top:-8px;" colspan="2">御中</td>'+
//            '</tr>'+
//            '<tr>';
//            if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
//                str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
//                '</tr>'+
//                '<tr>'+
//                '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
//                '</tr>';
//            }
//            else{
//                str += '</tr>';
//            }
//            
//            str += '<tr style="height: 40px;"></tr>'+
//            '</table>'+
//            '</td>'+
//            '</tr>'+
//            '</table>'+
//            '</td>'+
//            
//            '<td style="padding-left: 30px;">'+
//            '<table style="width: 280px;font-weight: bold;">'+
//            '<tr>'+
//            '<td colspan="2" style="width:50%;margin-top:-16px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
//            '</tr>';
//            if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
//                str+='<tr>'+
//                '<td colspan="2" style="margin-left:-72px;margin-top:-8px;">&nbsp;'+dealFugou(custNameText)+'</td>'+
//                '</tr>';
//            }
//            str+='<tr>'+
//            '<td style="font-size:17px;margin-top:-5px;" colspan="2">'+invoiceNameEng+'&nbsp;</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td style="font-size: 20px;margin-top:-2px;" colspan="2" >'+invoiceLegalname+'&nbsp;</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td colspan="2" style="font-size: 10px;margin-top:-2px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'&nbsp;</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td colspan="2" style="font-size: 10px;margin-top:-2px;">〒'+invoiceAddressZip+'&nbsp;</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+invoiceAddressThree+'&nbsp;</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td style="font-size: 10px;margin-top:-4px;">TEL:&nbsp;'+invoicePhone+'</td>'+
//            '<td style="font-size: 10px;margin-top:-4px;">FAX:&nbsp;'+invoiceFax+'</td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressEng+'</td>'+
//            '</tr>'+
//            '</table>'+
//            '</td>'+
//            '</tr>'+
//            '</table>';
//            
//            str+='<table style="width: 660px;margin-top: 10px;font-weight: bold;">'+
//            '<tr>'+
//            '<td style="line-height: 30px;font-weight:bold;font-size: 11pt;border: 1px solid black;height: 30px;width:660px;" align="center" colspan="5">'+invoiceName+'</td>'+
//            '</tr>'+
//            '</table>'+ 
//            '<table style="width: 660px;font-weight: bold;">'+
//            '<tr>'+
//            '<td style="width:510px;margin-top:-5px;margin-left:-20px;" colspan="2">&nbsp;</td>'+
//            '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;" align="right"></td>'+
//            '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
//            '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
//            '</tr>'+    
//            '<tr>'+
//            '<td style="width: 225px;">&nbsp;&nbsp;'+dateName+'&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
//            '<td style="width: 285px;margin-left:-25px;">'+deliveryName+'&nbsp;:&nbsp;&nbsp;'+delivery_date+'</td>'+
//            '<td style="width: 50px;"></td>'+
//            '<td style="width: 50px;"></td>'+
//            '<td style="width: 50px;"></td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td style="width: 225px;margin-top:-8px;">&nbsp;</td>'+
//            '<td style="width: 285px;margin-top:-8px;margin-left:-25px;">&nbsp;</td>'+
//            '<td style="width: 50px;margin-top:-8px;"></td>'+
//            '<td style="width: 50px;margin-top:-8px;"></td>'+
//            '<td style="width: 50px;margin-top:-8px;"></td>'+
//            '</tr>'+
//            '<tr>'+
//            '<td style="width: 300px;margin-top:-8px;">&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'+
//            '<td style="width: 100px;margin-left:-25px;margin-top:-8px;">'+paymentName+'&nbsp;:'+ customerPayment + '</td>'+
//            '<td style="width: 260px;margin-left:-25px;margin-top:-8px;" colspan="3">'+numberName2+'&nbsp;'+dealFugou(otherrefnum)+'</td>'+
//            '</tr>';
//            
//            str+= '</table>'+
//            
//            '<table style="width: 660px;font-weight: bold;" border="0">';   
//            str+='<tr>';
//                var tmpMemo = '';
//                if (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) {
//                    tmpMemo = dvyMemo;
//                } else {
//                    tmpMemo = memo;
//                }
//                nlapiLogExecution('DEBUG', 'tmpMemo', tmpMemo);
//                if(!isEmpty(tmpMemo)){
//                    str+='<td style="width: 330px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+dealFugou(tmpMemo)+'</td>'+
//                    '<td style="width: 110px;">&nbsp;</td>'+
//                    '<td style="width: 100px;">&nbsp;</td>'+
//                    '<td style="width: 100px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
//                    '</tr>';
//                }else{
//                    str+='<td style="width: 130px;margin-top:-8px;">&nbsp;</td>'+
//                    '<td style="width: 200px;">&nbsp;</td>'+
//                    '<td style="width: 110px;">&nbsp;</td>'+
//                    '<td style="width: 100px;">&nbsp;</td>'+
//                    '<td style="width: 100px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
//                    '</tr>';
//                }
//            str+= '</table>';
//                
//            str+= '<table border="0" style="width: 660px;font-weight: bold;">'; 
//            str+='<tr style="border-bottom: 1px solid black;">'+
//            '<td style="width: 130px;">&nbsp;&nbsp;'+codeName+'</td>'+
//            '<td style="width: 210px;" align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+poductName+'</td>'+
//            '<td style="width: 110px;">&nbsp;&nbsp;'+quantityName+'</td>'+
//            '<td style="width: 100px;">&nbsp;&nbsp;'+unitpriceName+'</td>'+
//            '<td style="width: 100px;">&nbsp;&nbsp;'+amountName+'</td>'+
//            '</tr>';
//            for(var i = 0;i<itemLine.length;i++){
//                str+='<tr>'+
//                '<td style="width: 130px;">&nbsp;'+itemLine[i].invoiceInitemid+'</td>'+
//                '<td style="width: 210px;">'+itemLine[i].invoiceDisplayName+'</td>'+
//                '<td style="width: 110px;" align="center">'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>';
//                if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//                    var itemRateForma = itemLine[i].invoiceRateFormat;
//                    var itemAmount = itemLine[i].invoiceAmount;
//                    str+= '<td style="width: 100px;" align="right">'+itemRateForma.split('.')[0]+'</td>'+
//                    '<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemAmount.split('.')[0]+'</td>'+
//                    '</tr>';
//                }else{
//                    str+= '<td style="width: 100px;" align="right">'+itemLine[i].invoiceRateFormat+'</td>'+
//                    '<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceAmount+'</td>'+
//                    '</tr>';
//                }
//                
//                str+= '<tr>'+
//                '<td style="width: 130px;">&nbsp;'+itemLine[i].productCode+'</td>'+
//                '<td style="width: 210px;">&nbsp;</td>'+
//                '<td style="width: 110px;" align="right">&nbsp;</td>';
//                str+='<td style="width: 100px;">&nbsp;</td>';
//                str+='<td style="width: 100px;" align="right">&nbsp;</td>';
//                str+='</tr>';
//                
//                // CH408 zheng 20230518 start
//                str+= '<tr>'+
//                '<td style="width: 130px;">&nbsp;'+itemLine[i].locBarCode+'</td>'+
//                '<td style="width: 210px;">&nbsp;</td>'+
//                '<td style="width: 110px;" align="right">&nbsp;</td>';
//                str+='<td style="width: 100px;">&nbsp;</td>';
//                str+='<td style="width: 100px;" align="right">&nbsp;</td>';
//                str+='</tr>';
//                
//                str+= '<tr>'+
//                '<td style="width: 130px;margin-left: 36px;">&nbsp;</td>'+
//                '<td style="width: 210px;">&nbsp;</td>'+
//                '<td style="width: 110px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'</td>';
//                if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//                    var itemTaxamount = itemLine[i].invoiceTaxamount;
//                    str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//                    str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount.split('.')[0]+'</td>';
//                }else{
//                    str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//                    str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceTaxamount+'</td>';
//                }
//                // CH408 zheng 20230518 end
//                
//                str+='</tr>';
//            }   
//            str+='</table>';
//            str+='</body>';
//
//            str += '</pdf>';
//            var renderer = nlapiCreateTemplateRenderer();
//            renderer.setTemplate(str);
//            var xml = renderer.renderToString();
//            var xlsFile = nlapiXMLToPDF(xml);
//            // PDF
//            xlsFile.setName(fileName  + '.pdf');
//            xlsFile.setFolder(INVOICE_PDF_ID_DJ_INVOICEPDF);
//            xlsFile.setIsOnline(true);
//            // save file
//            var fileID = nlapiSubmitFile(xlsFile);
//            return fileID;
        
		    
		    
		    
//			var invAmount = 0;
//			var invTaxamount = 0;
//			var itemLine = new Array();
//			var invoiceID = recordId; //ID
//			var invoiceRecord = nlapiLoadRecord('invoice',invoiceID);
//			var entity = invoiceRecord.getFieldValue('entity');//顧客
//			var customerSearch= nlapiSearchRecord("customer",null,
//					[
//						["internalid","anyof",entity]
//					], 
//					[
//					 	new nlobjSearchColumn("address2","billingAddress",null), //請求先住所1
//				    	new nlobjSearchColumn("address3","billingAddress",null), //請求先住所2
//				    	new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
//				    	new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
//				    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県 		
//				    	new nlobjSearchColumn("phone"), //電話番号
//				    	new nlobjSearchColumn("fax"), //Fax
//				    	new nlobjSearchColumn("entityid"), //id
//				    	new nlobjSearchColumn("salesrep"), //販売員（当社担当）
//				    	new nlobjSearchColumn("language"),  //言語
//					]
//					);	
//			var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//住所1
//			var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//住所2
//			var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//市区町村
//			var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//郵便番号
//			var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//都道府県 
//			var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//電話番号
//			var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
//			var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
//			var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//販売員（当社担当）
//			var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//言語
////			nlapiLogExecution('debug', 'custLanguage', custLanguage)
//
//			var trandate = defaultEmpty(invoiceRecord.getFieldValue('trandate'));    //請求書日付
//			var delivery_date = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_date'));    //請求書納品日
//			var tranid = defaultEmpty(invoiceRecord.getFieldValue('tranid'));    //請求書番号
//			var createdfrom = defaultEmpty(invoiceRecord.getFieldText('createdfrom'));    //請求書作成元
//			var payment = defaultEmpty(invoiceRecord.getFieldText('custbody_djkk_payment_conditions'));    //請求書支払条件
//			var salesrep = defaultEmpty(invoiceRecord.getFieldText('salesrep'));    //営業担当者
//			var memo = defaultEmpty(invoiceRecord.getFieldValue('memo'));    //memo
//			
//			var subsidiary = defaultEmpty(invoiceRecord.getFieldValue('subsidiary'));    //請求書子会社
//			var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
//					[
//						["internalid","anyof",subsidiary]
//					], 
//					[
//						new nlobjSearchColumn("legalname"),  //正式名称
//						new nlobjSearchColumn("name"), //名前
//						new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
//						new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
//						new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
//						new nlobjSearchColumn("address2","address",null), //住所1
//						new nlobjSearchColumn("address3","address",null), //住所2
//						new nlobjSearchColumn("city","address",null), //市区町村
//						new nlobjSearchColumn("zip","address",null), //郵便番号
//						new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
//						new nlobjSearchColumn("phone","address",null), //phone
//					]
//					);	
//			var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//正式名称
//			var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//名前
//			var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//住所1
//			var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//住所2
//			var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//郵便番号
//			var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//市区町村
//			var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
//			var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
//			var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//住所英語
//			var invoiceFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax
//			var invoicePhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","address",null));//phone
//				
//			var incoicedelivery_destination = invoiceRecord.getFieldValue('custbody_djkk_delivery_destination');    //請求書納品先
//			if(!isEmpty(incoicedelivery_destination)){	
//				
//				var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
//						[
//							["internalid","anyof",incoicedelivery_destination]
//						], 
//						[
//							new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
//							new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
//							new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
//							new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
//							new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
//							new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_納品先名前
//								  
//						]
//						);	
//				var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//郵便番号
//				var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//都道府県
//				var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_市区町村
//				var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_納品先住所1
//				var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_納品先住所2
//				var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_納品先名前
//			}
//			
//			var invoiceCount = invoiceRecord.getLineItemCount('item');
//			for(var k=1;k<invoiceCount+1;k++){
//				invoiceRecord.selectLineItem('item',k);
//				var invoiceItemId = invoiceRecord.getLineItemValue('item','item',k);	//item
//				var invoiceItemSearch = nlapiSearchRecord("item",null,
//						[
//						 	["internalid","anyof",invoiceItemId],
//						],
//						[
//						  new nlobjSearchColumn("itemid"), //商品コード
//						  new nlobjSearchColumn("displayname"), //商品名
//
//						]
//						); 
//					
//					var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//商品コード
//					var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
//					var invoiceQuantity = defaultEmpty(invoiceRecord.getLineItemValue('item','quantity',k));//数量
//					var invoiceRateFormat = defaultEmpty(invoiceRecord.getLineItemValue('item','rate',k));//単価
//					var invoiceAmount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','amount',k)));//金額  
//					if(!isEmpty(invoiceAmount)){
//						var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');	
//						invAmount  += invoiceAmount;
//						var invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//					}else{
//						var invAmountFormat = '';
//					}
//					
//					var invoiceTaxrate1Format = defaultEmpty(invoiceRecord.getLineItemValue('item','taxrate1',k));//税率
//					var invoiceTaxamount = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item','tax1amt',k)));//税額   
//					if(!isEmpty(invoiceTaxamount)){
//						var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//						invTaxamount += invoiceTaxamount;
//						var invTaxmountTotal = invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//					}else{
//						var invTaxamountFormat = '';
//					}
//					
//					var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
//					if(!isEmpty(invoTotal)){
//						var invoToTotal = invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//					}else{
//						var invoToTotal ='';
//					}
//					
//					var invoiceUnitabbreviation = defaultEmpty(invoiceRecord.getLineItemValue('item','units_display',k));//単位
//					itemLine.push({
//						invoiceInitemid:invoiceInitemid,  //商品コード
//						invoiceDisplayName:invoiceDisplayName,//商品名
//						invoiceQuantity:invoiceQuantity,//数量
//						invoiceRateFormat:invoiceRateFormat,//単価
//						invoiceAmount:invAmountFormat,//金額  
//						invoiceTaxrate1Format:invoiceTaxrate1Format,//税率
//						invoiceTaxamount:invTaxamountFormat,//税額  
//						invoiceUnitabbreviation:invoiceUnitabbreviation,
//					}); 
//			}
//			
//			if(custLanguage == '日本語'){
//				var dateName = '日\xa0\xa0付';
//				var deliveryName = '納品日';
//				var paymentName = '支払条件';
//				var numberName = '番\xa0\xa0号';
//				var numberName2 = '御社発注番号:';
//				var codeName = 'コード';
//				var invoiceName = '*\xa0\xa0\*\xa0\xa0\*請\xa0\xa0\xa0\xa0\求\xa0\xa0\xa0\xa0\書*\xa0\xa0\*\xa0\xa0\*';
//				var quantityName = '数\xa0\xa0\xa0\xa0\xa0\xa0\xa0量';
//				var unitpriceName = '単\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0価';
//				var amountName = '金\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0額';
//				var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\名';
//				var taxRateName = '***\xa0\xa0\税\xa0率:';
//				var taxAmountName = '税額:';
//				var custCode = '顧客コード\xa0\xa0:';
//				var destinationName = '納品先\xa0\xa0:';
//				var totalName = '合\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0計';
//				var consumptionTaxName = '消\xa0\xa0費\xa0\xa0税';
//				var invoiceName1 = '御請求額';
//				var personName = '担当者\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
//				var memoName = 'メ\xa0\xa0モ'
//			}else{
//				var dateName = 'Date';
//				var deliveryName = 'Delivery Date';
//				var paymentName = 'Payment Terms';
//				var numberName = 'Number';
//				var numberName2 = 'Order number:';
//				var codeName = 'Code';
//				var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Invoice*\xa0\xa0\*\xa0\xa0\*';
//				var quantityName = 'Quantity';
//				var unitpriceName = 'Unit Price';
//				var amountName = 'amount';
//				var poductName = 'Product name';
//				var taxRateName = 'tax rate:';
//				var taxAmountName = 'TaxAmt:';
//				var custCode = 'Customer code:';
//				var destinationName = 'Delivery:';
//				var totalName = 'Total';
//				var consumptionTaxName = 'Excise tax';
//				var invoiceName1 = 'Invoice';
//				var personName = 'Person:';
//				var memoName = 'Memo';
//			}
//			
//			
//			var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
//			'<pdf>'+
//			'<head>'+
//			'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
//			'<#if .locale == "zh_CN">'+
//			'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
//			'<#elseif .locale == "zh_TW">'+
//			'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
//			'<#elseif .locale == "ja_JP">'+
//			'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
//			'<#elseif .locale == "ko_KR">'+
//			'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
//			'<#elseif .locale == "th_TH">'+
//			'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
//			'</#if>'+
//			
//			'<macrolist>'+
//			'<macro id="nlfooter">'+
//			'<table style="border-top: 1px dashed black;width: 660px;font-weight: bold;">'+
//			'<tr style="padding-top:5px;">'+
//			'<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
//			if(!isEmpty(incoicedelivery_Name)){
//				str+='<td style="width:220px;">'+destinationName+'&nbsp;'+incoicedelivery_Name+'</td>';
//			}else{
//				str+='<td style="width:220px;">'+destinationName+'</td>';
//			}
//			str+='<td style="width:100px;">&nbsp;&nbsp;'+totalName+'</td>'+
//			'<td style="width:100px;" align="right">'+invoAmountTotal+'</td>'+
//			'</tr>'+
//			
//			'<tr>'+
//			'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>';
//			if(!isEmpty(invdestinationZip)){
//				str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+invdestinationZip+'</td>';
//			}
//			str+='</tr>'+
//			
//			'<tr>'+
//			'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//			if(!isEmpty(invdestinationState)){
//				str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
//			}else{
//				str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//			}
//			str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
//			'<td style="width:100px;margin-top:-8px;" align="right">'+invTaxmountTotal+'</td>'+
//			'</tr>'+
//			
//			'<tr>'+
//			'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//			if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
//				str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationCity+invdestinationAddress+'</td>';
//			}
//			str+='</tr>'+
//			
//			'<tr>'+
//			'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//			if(!isEmpty(invdestinationAddress2)){
//				str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationAddress2+'</td>';
//			}else{
//				str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//			}
//			str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'</td>'+
//			'<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal+'</td>'+
//			'</tr>'+
//			'</table>'+
//			'</macro>'+
//			'</macrolist>'+
//			
//			
//			'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
//			'<#if .locale == "zh_CN">'+
//			'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
//			'<#elseif .locale == "zh_TW">'+
//			'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
//			'<#elseif .locale == "ja_JP">'+
//			'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
//			'<#elseif .locale == "ko_KR">'+
//			'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
//			'<#elseif .locale == "th_TH">'+
//			'font-family: NotoSans, NotoSansThai, sans-serif;'+
//			'<#else>'+
//			'font-family: NotoSans, sans-serif;'+
//			'</#if>'+
//			'}'+
//			'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
//			'td { padding: 4px 6px;}'+
//			'b { font-weight: bold; color: #333333; }'+
//			'.nav_t1 td{'+
//			'width: 110px;'+
//			'height: 20px;'+
//			'font-size: 13px;'+
//			'display: hidden;'+
//			'}'+
//			'</style>'+
//			'</head>';
//			
//			str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4" footer="nlfooter" footer-height="8%">'+
//			'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
//			'<tr>'+
//			'<td>'+
//			'<table style="font-weight: bold;width:335px;">'+
//			'<tr style="height: 18px;" colspan="2"></tr>'+	
//			'<tr>'+
//			'<td style="border:1px solid black;" corner-radius="4%">'+
//			'<table>'+
//			'<tr style="height:10px;"></tr>'+
//			'<tr>'+
//			'<td>〒'+invoiceZipcode+'</td>'+
//			'<td align="right" style="margin-right:-22px;">&nbsp;'+entityid+'</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invAddress+'</td>'+
//			'<td align="right" style="padding-right: 30px;margin-top:-8px;">03</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td align="right" style="padding-right: 75px;padding-bottom:0px;margin-top:-8px;" colspan="2">御中</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Tel:'+invPhone+'</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Fax:'+invFax+'</td>'+
//			'</tr>'+
//			'<tr style="height: 40px;"></tr>'+
//			'</table>'+
//			'</td>'+
//			'</tr>'+
//			'</table>'+
//			'</td>'+
//			
//			'<td style="padding-left: 30px;">'+
//			'<table style="width: 280px;font-weight: bold;">'+
//			'<tr>'+
//			'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="https://5722722-sb1.secure.netsuite.com/core/media/media.nl?id=15969&amp;c=5722722_SB1&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td colspan="2" style="margin-left:-32px;margin-top:-8px;">&nbsp;'+custSalesrep+'</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td style="font-size:17px;margin-top:-5px;" colspan="2">'+invoiceNameEng+'&nbsp;</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td style="font-size: 20px;margin-top:-2px;" colspan="2" >'+invoiceLegalname+'&nbsp;</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td colspan="2" style="font-size: 10px;margin-top:-2px;">〒'+invoiceAddressZip+'&nbsp;</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+'&nbsp;</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td style="font-size: 10px;margin-top:-4px;">TEL:&nbsp;'+invoicePhone+'</td>'+
//			'<td style="font-size: 10px;margin-top:-4px;">FAX:&nbsp;'+invoiceFax+'</td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressEng+'</td>'+
//			'</tr>'+
//			'</table>'+
//			'</td>'+
//			'</tr>'+
//			'</table>';
//			
//			str+='<table style="width: 660px;margin-top: 10px;font-weight: bold;">'+
//			'<tr>'+
//			'<td style="line-height: 30px;font-weight:bold;border: 1px solid black;height: 30px;width:660px;" align="center" colspan="5">'+invoiceName+'</td>'+
//			'</tr>'+
//			'</table>'+	
//			'<table style="width: 660px;font-weight: bold;">'+
//			'<tr>'+
//			'<td style="width:510px;margin-top:-5px;margin-left:-20px;" colspan="2">IN-0R000060jpn</td>'+
//			'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;" align="right"></td>'+
//			'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
//			'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
//			'</tr>'+	
//			'<tr>'+
//			'<td style="width: 225px;">&nbsp;&nbsp;'+dateName+'&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
//			'<td style="width: 285px;margin-left:-25px;">'+deliveryName+'&nbsp;:&nbsp;&nbsp;'+delivery_date+'</td>'+
//			'<td style="width: 50px;"></td>'+
//			'<td style="width: 50px;"></td>'+
//			'<td style="width: 50px;"></td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td style="width: 225px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+payment+'</td>'+
//			'<td style="width: 50px;margin-top:-8px;"></td>'+
//			'<td style="width: 50px;margin-top:-8px;"></td>'+
//			'<td style="width: 50px;margin-top:-8px;"></td>'+
//			'</tr>'+
//			'<tr>'+
//			'<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+tranid+'/受注&nbsp;:'+createdfrom+'</td>'+
//			'<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+'.</td>'+
//			'</tr>'+
//			'</table>'+
//			
//			'<table style="width: 660px;font-weight: bold;">';	
//			str+='<tr>';
//				if(!isEmpty(memo)){	
//					str+='<td style="width: 330px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+memo+'</td>'+
//					'<td style="width: 110px;margin-top:-8px;">&nbsp;</td>'+
//					'<td style="width: 100px;margin-top:-8px;">&nbsp;</td>'+
//					'<td style="width: 100px;margin-top:-8px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
//					'</tr>';
//				}else{
//					str+='<td style="width: 130px;margin-top:-8px;">&nbsp;</td>'+
//					'<td style="width: 200px;margin-top:-8px;">&nbsp;</td>'+
//					'<td style="width: 110px;margin-top:-8px;">&nbsp;</td>'+
//					'<td style="width: 100px;margin-top:-8px;">&nbsp;</td>'+
//					'<td style="width: 100px;margin-top:-8px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
//					'</tr>';
//				}
//
//			str+='<tr  style="border-bottom: 1px dashed black;">'+
//			'<td style="width: 130px;margin-top:-6px;">&nbsp;&nbsp;'+codeName+'</td>'+
//			'<td style="width: 200px;margin-top:-6px;" align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+poductName+'</td>'+
//			'<td style="width: 110px;margin-top:-6px;">&nbsp;&nbsp;'+quantityName+'</td>'+
//			'<td style="width: 100px;margin-top:-6px;">&nbsp;&nbsp;'+unitpriceName+'</td>'+
//			'<td style="width: 100px;margin-top:-6px;">&nbsp;&nbsp;'+amountName+'</td>'+
//			'</tr>';
//			for(var i = 0;i<itemLine.length;i++){
//				str+='<tr>'+
//				'<td style="width: 130px;">&nbsp;&nbsp;'+itemLine[i].invoiceInitemid+'</td>'+
//				'<td style="width: 200px;">'+itemLine[i].invoiceDisplayName+'</td>'+
//				'<td style="width: 110px;" align="center">&nbsp;&nbsp;'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>'+
//				'<td style="width: 100px;" align="right">'+itemLine[i].invoiceRateFormat+'</td>'+
//				'<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceAmount+'</td>'+
//				'</tr>'+
//				
//				'<tr>'+
//				'<td style="width: 130px;">&nbsp;</td>'+
//				'<td style="width: 200px;">&nbsp;</td>'+
//				'<td style="width: 110px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'</td>';
//				if(custLanguage == '日本語'){
//					str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//				}else{
//					str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//				}
//				str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceTaxamount+'</td>'+
//				'</tr>';
//			}
////			str+='</table>'+
////			'<table style="border-top: 1px dashed black;width: 660px;font-weight: bold;">'+
////			'<tr style="padding-top:5px;">'+
////			'<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
////			if(!isEmpty(incoicedelivery_Name)){
////				str+='<td style="width:220px;">'+destinationName+'&nbsp;'+incoicedelivery_Name+'</td>';
////			}else{
////				str+='<td style="width:220px;">'+destinationName+'</td>';
////			}
////			str+='<td style="width:100px;">&nbsp;&nbsp;'+totalName+'</td>'+
////			'<td style="width:100px;" align="right">'+invoAmountTotal+'</td>'+
////			'</tr>'+
//		//	
////			'<tr>'+
////			'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>';
////			if(!isEmpty(invdestinationZip)){
////				str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+invdestinationZip+'</td>';
////			}
////			str+='</tr>'+
//		//	
////			'<tr>'+
////			'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
////			if(!isEmpty(invdestinationState)){
////				str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
////			}else{
////				str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
////			}
////			str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
////			'<td style="width:100px;margin-top:-8px;" align="right">'+invTaxmountTotal+'</td>'+
////			'</tr>'+
//		//	
////			'<tr>'+
////			'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
////			if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
////				str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationCity+invdestinationAddress+'</td>';
////			}
////			str+='</tr>'+
//		//	
////			'<tr>'+
////			'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
////			if(!isEmpty(invdestinationAddress2)){
////				str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationAddress2+'</td>';
////			}else{
////				str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
////			}
////			str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'</td>'+
////			'<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal+'</td>'+
////			'</tr>';
//			
//			str+='</table>';
//			str+='</body>';
//
//			str += '</pdf>';
//			var renderer = nlapiCreateTemplateRenderer();
//			renderer.setTemplate(str);
//			var xml = renderer.renderToString();
//			var xlsFile = nlapiXMLToPDF(xml);
//			// PDF
//			xlsFile.setName(fileName  + '.pdf');
//			xlsFile.setFolder(INVOICE_PDF_ID_DJ_INVOICEPDF);//20230518 changed by zhou
//			xlsFile.setIsOnline(true);
//			// save file
//			var fileID = nlapiSubmitFile(xlsFile);
//			return fileID;
		}
	  //add by 20230607 zzq CH630 end
	}
	catch(e){
		nlapiLogExecution('debug', 'エラー', e.message)
		nlapiLogExecution('debug', e);
	}
}

function outGoingPdf (fileName){
	var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
	'<pdf>'+
	'<head>'+
	'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
	'<#if .locale == "zh_CN">'+
	'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
	'<#elseif .locale == "zh_TW">'+
	'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
	'<#elseif .locale == "ja_JP">'+
	'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
	'<#elseif .locale == "ko_KR">'+
	'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
	'<#elseif .locale == "th_TH">'+
	'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
	'</#if>'+
	'    <style type="text/css">'+
	'table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
	'<#if .locale == "zh_CN">'+
	'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
	'<#elseif .locale == "zh_TW">'+
	'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
	'<#elseif .locale == "ja_JP">'+
	'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
	'<#elseif .locale == "ko_KR">'+
	'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
	'<#elseif .locale == "th_TH">'+
	'font-family: NotoSans, NotoSansThai, sans-serif;'+
	'<#else>'+
	'font-family: NotoSans, sans-serif;'+
	'</#if>'+
	'}'+
     '</style>'+
     '</head>'+
     '<body padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';//A4-LANDSCAPE
	//出荷案内書(控)
	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="80px"></td>'+
	'<td width="37px"></td>'+
	'<td width="140px"></td>'+
	'<td width="86px"></td>'+
	'<td width="75px"></td>'+
	'<td width="75px"></td>'+
	'<td width="92px"></td>'+
	'<td width="75px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="8" align="center" style="font-size: 15px; font-weight: bold;color: #3E73DA;">出&nbsp;荷&nbsp;案&nbsp;内&nbsp;書&nbsp;(&nbsp;控&nbsp;)</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 10px;color: #3E73DA;font-weight: 600;vertical-align: bottom;">お届け先</td>'+
	'<td align="left" style="font-size: 14px;color: #BEBDC3;vertical-align: bottom;" colspan="2">〒812-8582</td>'+
	'<td></td>'+
	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;">受注区分</td>'+
	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;">出&nbsp;荷&nbsp;日</td>'+
	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;">伝&nbsp;票&nbsp;No.</td>'+
	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-right:2px solid #3E73DA;">基準\'検定日</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="font-size: 11px;color: #BEBDC3;font-weight: 650;vertical-align: bottom;" colspan="4" >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;福岡県<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;福岡市東区馬出3-1-1<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;病院地区実験室</td>'+
	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-left:2px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:1px solid #3E73DA;">J</td>'+
	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:1px solid #3E73DA;">21-06-14</td>'+
	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:1px solid #3E73DA;">1000017439</td>'+
	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:2px solid #3E73DA;">21-06-15</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td colspan="4" style="font-size: 11px; color: #BEBDC3;font-weight: 650;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;国立大学法人九州大学アイソトープ総合センター</td>'+
	'<td style="font-size: 10px;color: #3E73DA;vertical-align: middle;"><span style="margin-left:30px">販売元</span></td>'+
	'<td colspan="3" style="color: #3E73DA; font-size: 13px;font-weight: bold;vertical-align: middle;"><span style="margin-left:15px">公益社団法人&nbsp;日本アイソトープ協会</span></td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="4" style="font-size: 11px; color: #BEBDC3;font-weight: 650;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;芸術工学部デザイン人間科学部門</td>'+
	'<td style="font-size: 10px;color: #3E73DA;vertical-align: middle;" rowspan="2"><span style="margin-left:30px">発売元</span></td>'+
	'<td colspan="3" style="color: #3E73DA; font-size: 13px;font-weight: bold;vertical-align: middle;" rowspan="2"><span style="margin-left:15px">DENISディスカウント</span></td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="4" style="font-size: 11px; color: #BEBDC3;font-weight: 650;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;植口 重和　様</td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="428px"></td>'+
	'<td width="116px"></td>'+
	'<td width="116px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 12px; color: #3E73DA; vertical-align: middle;font-weight: bold;border-top:2px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA">運&nbsp;&nbsp;送&nbsp;&nbsp;会&nbsp;&nbsp;社</td>'+
	'<td align="center" style="font-size: 12px; color: #3E73DA; vertical-align: middle;font-weight: bold;border-top:2px solid #3E73DA;border-right:2px solid #3E73DA;">輸&nbsp;&nbsp;送&nbsp;&nbsp;区&nbsp;&nbsp;分</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 14px;vertical-align: middle;color: #BEBDC3;border-top:1px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:2px solid #3E73DA;">日本通運</td>'+
	'<td style="border-top:1px solid #3E73DA;border-right:2px solid #3E73DA;border-bottom:2px solid #3E73DA;"></td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="90px"></td>'+
	'<td width="330px"></td>'+
	'<td width="20px"></td>'+
	'<td width="20px"></td>'+
	'<td width="30px"></td>'+
	'<td width="170px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">統一商品コード</td>'+
	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">品&nbsp;名&nbsp;規&nbsp;格&nbsp;/&nbsp;ロット&nbsp;No.</td>'+
	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-bottom:1px solid #3E73DA;">数</td>'+
	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">量</td>'+
	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">取扱</td>'+
	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:2px solid #3E73DA;border-bottom:1px solid #3E73DA;">備考</td>'+
	'</tr>'+
	'<tr height="10px">'+
	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;"></td>'+
	'<td style="border-right:1px solid #3E73DA;"></td>'+
	'<td style="border-right:1px dotted black;"></td>'+
	'<td style="border-right:1px solid #3E73DA;"></td>'+
	'<td style="border-right:1px solid #3E73DA;"></td>'+
	'<td style="border-right:2px solid #3E73DA;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;">SM-2-U</td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"><span style="margin-left:10px">Saliva Melationin RIA KIT 200tests / 74kBq</span></td>'+
	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;">1</td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"><span style="margin-left:15px">発注番号:DQG70 / 注文番号:05</span></td>'+
	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"><span style="margin-left:20px">Lot.5234.17 &nbsp;&nbsp;&nbsp;&nbsp; 有効期間:21-07-20</span></td>'+
	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;">1</td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'</tr>'+
	'<tr height="200px">'+
	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
	'</tr>';
//	'</table>';
	
	str+='</table>';
	str+='</body>';
	str += '</pdf>';
	var renderer = nlapiCreateTemplateRenderer();
	renderer.setTemplate(str);
	var xml = renderer.renderToString();
	var xlsFile = nlapiXMLToPDF(xml);
// PDF
	xlsFile.setName(fileName  + '.pdf');
	xlsFile.setFolder(DELIVERY_PDF_IN_DJ_DELIVERYPDF);
	xlsFile.setIsOnline(true);
	// save file
	var fileID = nlapiSubmitFile(xlsFile);

	return fileID;
	

}

function deliveryPDF(recordId,customform,fileName){
	try{
		if(customform == '121' ){

			
			var itemLineArr = new Array();
			var inventoryDetailArr = new Array();
			var amountTota = 0;
			var taxamountTota = 0;		
			var soRecord = nlapiLoadRecord('salesorder',recordId);
			var entity = soRecord.getFieldValue('entity');//顧客
			var customform = soRecord.getFieldValue('customform');//customform
			var customerSearch= nlapiSearchRecord("customer",null,
			[
				["internalid","anyof",entity]
			], 
			[
			 	new nlobjSearchColumn("CUSTRECORD_DJKK_HONORIFIC_APPELLATION","billingAddress",null), //DJ_敬称
			 	new nlobjSearchColumn("address2","billingAddress",null), //請求先住所1
				new nlobjSearchColumn("address3","billingAddress",null), //請求先住所2
				new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
				new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
				new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県 		
				new nlobjSearchColumn("phone"), //電話番号
				new nlobjSearchColumn("fax"), //Fax
				new nlobjSearchColumn("custentity_djkk_language"),  //言語
				new nlobjSearchColumn("custentity_djkk_reference_express"),  //金額表示flg
				new nlobjSearchColumn("custentity_djkk_delivery_express"),  //表示flg
					]
					);	
			var honorieicAppellation = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("CUSTRECORD_DJKK_HONORIFIC_APPELLATION","billingAddress",null));//DJ_敬称
			if(honorieicAppellation =='空白'){
			honorieicAppellation = '';
			}
			var attention= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//請求先住所2
			var customerAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//請求先住所1
			var customerCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//請求先市区町村
			var customerZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zip","billingAddress",null));//請求先郵便番号
			var customerState= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//請求先都道府県 
			var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//請求先電話番号
			var fax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//請求先fax
			var soLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_language"));//言語
			var expressFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_reference_express"));//金額表示flg
			var deliveryFlg= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custentity_djkk_delivery_express"));//表示flg
			
			var subsidiary = soRecord.getFieldValue('subsidiary');//子会社
			var subsidiarySearch= nlapiSearchRecord("subsidiary",null,
			[
				["internalid","anyof",subsidiary]
			], 
			[
				new nlobjSearchColumn("legalname"),  //正式名称
				new nlobjSearchColumn("name"), //名前
				new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
				new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
				new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
				new nlobjSearchColumn("address2","address",null), //住所1
				new nlobjSearchColumn("address3","address",null), //住所2
				new nlobjSearchColumn("city","address",null), //市区町村
				new nlobjSearchColumn("zip","address",null), //郵便番号
				new nlobjSearchColumn("custrecord_djkk_bank_1"), //銀行1
				new nlobjSearchColumn("custrecord_djkk_bank_2"), //銀行2
							  
					]
					);		
			var legalname= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("legalname"));//正式名称
			var nameString= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("name"));//名前
			var nameStringTwo = nameString.split(":");
			var name = nameStringTwo.slice(-1);
			var address= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
			var city= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("city","address",null));//市区町村
			var bankOne= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_1"));//銀行1
			var bankTwo= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getText("custrecord_djkk_bank_2"));//銀行2
			var addressZip= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("zip","address",null));//郵便番号
			var nameEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
			var mainaddressEng= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//住所英語
			var address1= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address2","address",null));//住所1
			var address2= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("address3","address",null));//住所2
			var bankOneId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_1"));//銀行1
			var bankTwoId = defaultEmpty(isEmpty(subsidiarySearch) ? '' :  subsidiarySearch[0].getValue("custrecord_djkk_bank_2"));//銀行2
			if(!isEmpty(bankOneId)){
				var bank1 = nlapiLoadRecord('customrecord_djkk_bank', bankOneId);
			var branch_name1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_支店名
			var bank_no1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));//DJ_口座番号
			}else{
				var branch_name1 = '';
			var bank_no1 = '';
			}
			if(!isEmpty(bankTwoId)){
				var bank2 = nlapiLoadRecord('customrecord_djkk_bank', bankTwoId);
			var branch_name2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));//DJ_支店名
			var bank_no2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));//DJ_口座番号
			}else{
				var branch_name2 = '';
			var bank_no2 ='';
			}
			
			var trandate = defaultEmpty(soRecord.getFieldValue('trandate'));//日付
			var delivery_date = defaultEmpty(soRecord.getFieldValue('custbody_djkk_delivery_date'));//DJ_納品日
			var tranid = defaultEmpty(soRecord.getFieldValue('tranid'));//注文番号
			var terms = defaultEmpty(soRecord.getFieldText('terms'));//支払条件（締め日無し）
			var soTersm = defaultEmpty(terms.split('/'));
			var soTersmJap = defaultEmpty(soTersm.slice(0,1));
			var soTersmEng  = defaultEmpty(soTersm.slice(-1));
			var otherrefnum = defaultEmpty(soRecord.getFieldValue('otherrefnum'));//発注書番号
			var destination = soRecord.getFieldValue('custbody_djkk_delivery_destination');//DJ_納品先	
			var destinationName = defaultEmpty(soRecord.getFieldText('custbody_djkk_delivery_destination'));//DJ_納品先名前
			if(!isEmpty(destination)){	
				var destinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
				[
					["internalid","anyof",destination]
				], 
				[
					new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
					new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
					new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
					new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
					new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
					new nlobjSearchColumn("custrecord_djkk_sales"),//納品先営業
							  
					]
					);	
			var destinationZip = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_zip'));
			var destinationState = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_prefectures'));
			var destinationCity = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_municipalities'));
			var destinationAddress = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_delivery_residence'));
			var destinationAddress2 = defaultEmpty(destinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));
			var destinationSales = defaultEmpty(destinationSearch[0].getText('custrecord_djkk_sales'));
			}
			
			var soCount = soRecord.getLineItemCount('item');
			for(var a=1;a<soCount+1;a++){
				soRecord.selectLineItem('item',a);
			var itemId = soRecord.getLineItemValue('item','item',a);	
			var line = soRecord.getLineItemValue('item','line',a);	
			var ItemSearch = nlapiSearchRecord("item",null,
				[
				 	["internalid","anyof",itemId],
				],
				[
				  new nlobjSearchColumn("vendorname"), //仕入先商品コード
				  new nlobjSearchColumn("itemid"), //商品コード
				  new nlobjSearchColumn("displayname"), //商品名
				  new nlobjSearchColumn("custitem_djkk_storage_type"), //在庫区分
				  new nlobjSearchColumn("custitem_djkk_product_category_sml"), //配送温度
				]
				); 
			
			var vendorname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("vendorname"));//仕入先商品コード
			var itemid= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("itemid"));//商品コード
			var displayname= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getValue("displayname"));//商品名
			var storage_type= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_storage_type"));//在庫区分
			var deliverytemptyp= defaultEmpty(isEmpty(ItemSearch) ? '' :  ItemSearch[0].getText("custitem_djkk_product_category_sml"));//配送温度
			
			var receiptnote = soRecord.getLineItemValue('item', 'custcol_djkk_receipt_printing', a);//DJ_受領書印刷flag
			var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//数量
			
			var amount = defaultEmptyToZero(parseFloat(soRecord.getLineItemValue('item', 'amount', a)));//金額
			if(!isEmpty(amount)){
				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');		
			amountTota += amount;
			var amountTotal = amountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var amountFormat = '';
			}
			
			
			var taxamount = defaultEmpty(parseFloat(soRecord.getLineItemValue('item','tax1amt',a)));//税額   
			
			if(!isEmpty(taxamount)){
				var taxamountFormat = taxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			taxamountTota += taxamount;
			var taxamountTotal = taxamountTota.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var taxamountFormat = '';
			}
			
			
			var rateFormat= defaultEmpty(soRecord.getLineItemValue('item','rate',a));//単価
			
			var total = defaultEmpty(Number(amountTota+taxamountTota));
			if(!isEmpty(total)){
				var toTotal = total.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			}else{
				var toTotal = '';
			}
			//20221020 add by zhou 
			var unitabbreviation = defaultEmpty(soRecord.getLineItemValue('item','units_display',a));//単位
			
			var soUnitsArray;//単位array
			var soUnit;//変更後単位
			if(!isEmpty(soLanguage)&&!isEmpty(unitabbreviation)&&customform == 121){
				var unitSearch = nlapiSearchRecord("unitstype",null,
					[
					   ["abbreviation","is",unitabbreviation]
					], 
					[
					   new nlobjSearchColumn("abbreviation")
					]
					);
			if(unitSearch != null){
				if(soLanguage == '英語'){			//英語
					unitabbreviation = unitSearch[0].getValue('abbreviation')+'';
					soUnitsArray = unitabbreviation.split("/");
					if(soUnitsArray.length == 2){
						soUnit = soUnitsArray[1];
					}
				}else if(soLanguage == '日本語'){				//日本語
					unitabbreviation = unitSearch[0].getValue('abbreviation')+'';
					soUnitsArray = unitabbreviation.split("/");
						if(!isEmpty(soUnitsArray)){
							soUnit = soUnitsArray[0];
						}else if(soUnitsArray.length == 0){
							soUnit = unitabbreviation;
						}
					}
				}
			}
			
			//end
			var taxrate1Format = defaultEmpty(soRecord.getLineItemValue('item','taxrate1',a));//税率   //
			var pocurrency = transfer(defaultEmpty(soRecord.getLineItemValue('item','pocurrency',a)));//通貨
			if(pocurrency == 'JPY'){
			var pocurrencyMoney = '￥';
			}else if(pocurrency == 'USD'){
			var pocurrencyMoney = '$';
			}else{
				var pocurrencyMoney = '';
			}
			
			
			itemLineArr.push({
				receiptnote:receiptnote,//DJ_受領書印刷flag
			vendorname:vendorname,//仕入先商品コード
			itemid:itemid,//商品コード
			displayname:displayname,//商品名
			storage_type:storage_type,//在庫区分
			quantity:quantity,//数量
			amount:amountFormat,//金額  
			taxamount:taxamountFormat,//税額 
			rateFormat:rateFormat,//単価
			unitabbreviation:defaultEmpty(soUnit),//単位
			taxrate1Format:taxrate1Format,//税率
			deliverytemptyp:deliverytemptyp,//配送温度区分
				line:line,
			}); 
			var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //在庫詳細
			if(!isEmpty(inventoryDetail)){
				var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
			if(inventoryDetailCount != 0){
				for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
					inventoryDetail.selectLineItem('inventoryassignment',j);
					var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
					if(isEmpty(receiptinventorynumber)){
				    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
			                    [
			                       ["internalid","is",invReordId]
			                    ], 
			                    [
			                     	new nlobjSearchColumn("inventorynumber"),
			                    ]
			                    );    
				    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////シリアル/ロット番号	
			    	}
					var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //有效期限	
						inventoryDetailArr.push({
								line:line,
								serialnumbers:serialnumbers,
								expirationdate:expirationdate,					
						});
					}
				}
			}else{	
					inventoryDetailArr.push({
						serialnumbers:'',
					expirationdate:'',
						}); 
				}
			}	
			var pdfName = new Array();
			if(soLanguage == '英語'){
			pdfName.push('Delivery Book');
			}else if(soLanguage == '日本語'|| isEmpty(soLanguage)){
			pdfName.push('納\xa0\xa0品\xa0\xa0書');
			}
			
			var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
			'<pdf>'+
			'<head>'+
			'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
			'<#if .locale == "zh_CN">'+
			'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
			'<#elseif .locale == "zh_TW">'+
			'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
			'<#elseif .locale == "ja_JP">'+
			'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
			'<#elseif .locale == "ko_KR">'+
			'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
			'<#elseif .locale == "th_TH">'+
			'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
			'</#if>'+
			'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
			'<#if .locale == "zh_CN">'+
			'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
			'<#elseif .locale == "zh_TW">'+
			'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
			'<#elseif .locale == "ja_JP">'+
			'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
			'<#elseif .locale == "ko_KR">'+
			'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
			'<#elseif .locale == "th_TH">'+
			'font-family: NotoSans, NotoSansThai, sans-serif;'+
			'<#else>'+
			'font-family: NotoSans, sans-serif;'+
			'</#if>'+
			'}'+
			'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
			'td { padding: 4px 6px;}'+
			'b { font-weight: bold; color: #333333; }'+
			'.nav_t1 td{'+
			'width: 110px;'+
			'height: 20px;'+
			'font-size: 13px;'+
			'display: hidden;'+
			'}'+
			'</style>'+
			'</head>';
			if(soLanguage == '英語'){
			var bankName = 'Drawing Bank';
			var titleName = 'Delivery as follows.';
			var dateName = 'Date';
			var deliveryName = 'Delivery Date:';
			var numberName = 'Number';
			var paymentName = 'Payment Terms:';
			var orderName = 'Order Number:';
			var codeName = 'Code';
			var poductName = 'Product Name';
			var quantityName = 'Quantity';
			var unitpriceName = 'Unit Price';
			var amountName = 'Amount';
			var tempName = 'Temperature';
			var expirationDateNmae = 'Expiration Date:';
			var orderNameTwo = 'Order Number:';
			var taxRate = 'Tax Rate';
			var taxAmount = 'TaxAmt';
			var totalName = 'Total';
			var consumptionTax = 'Consumption Tax';
			var invoiceNameString = 'Invoice';
			var deliName = 'Delivery';
			}else if(soLanguage == '日本語' || isEmpty(soLanguage)){
			var bankName = '引取銀行';
			var titleName = '下記の通り納品致します。';
			var dateName = '日\xa0\xa0付';
			var deliveryName = '納品日：';
			var numberName = '番\xa0\xa0号';
			var paymentName = '支払条件:';
			var orderName = '貴発注番号:';
			var codeName = 'コ\xa0\xa0ー\xa0\xa0ド';
			var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0名';
			var quantityName = '数\xa0\xa0\xa0量';
			var unitpriceName = '単\xa0\xa0\xa0価';
			var amountName = '金\xa0\xa0\xa0額';
			var tempName = '配送温度';
			var expirationDateNmae = '有効期限:';
			var orderNameTwo = '客先発注番号:';
			var taxRate = '税率';
			var taxAmount = '税額';
			var totalName = '合\xa0\xa0\xa0\xa0\xa0計';
			var consumptionTax = '消\xa0\xa0費\xa0\xa0税';
			var invoiceNameString = '御\xa0請\xa0求\xa0額';
			var deliName = 'お届先';
			}
			str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4">'+
			'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
			'<tr>'+
			'<td style="width: 330PX;">'+
			'<table>'+
			'<tr style="height: 20px;">'+
			'</tr>'+
			'<tr></tr>'+
			'<tr>'+
			'<td>〒'+customerZipcode+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+customerState+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+customerCity+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+customerAddress+'</td>'+ 
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+attention+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td align="center">&nbsp;</td>'+
			'<td align="center">'+honorieicAppellation+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;Tel:'+phone+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;Fax:'+fax+'</td>'+
			'</tr>'+
			'</table>'+
			''+
			'</td>'+
			'<td>'+
			'<table style="border:1px solid black;">'+
			'<tr>'+
			'<td colspan="2" style="font-weight: bold;font-size:20px;width:55%;line-height:35px;">'+legalname+'</td>'+
			'<td colspan="2" style="width:45%;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" style="width:110px;height: 35px;" /></td>'+
			'</tr>'+
			'<tr>'+
			'</tr>'+
			'<tr>';
			if(soLanguage == '英語'){
			str+='<td colspan="4">'+nameEng+'</td>';
			}else{
				str+='<td colspan="4">'+name+'</td>';
				}
			str+='</tr>'+
			'<tr>';
			if(soLanguage == '英語'){
			str+='<td colspan="4" style="font-size:9px;">'+mainaddressEng+'</td>';
			}else{
				str+='<td colspan="4" style="font-size:10px;">〒'+addressZip+address+city+address1+address2+'</td>';
				}
			str+='</tr>'+
			'<tr>'+
			'<td colspan="4">'+bankName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+bankOne+'</td>'+
			'<td>&nbsp;'+branch_name1+'</td>'+
			'<td>当座預金</td>'+
			'<td>'+bank_no1+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>&nbsp;&nbsp;'+bankTwo+'</td>'+
			'<td>&nbsp;'+branch_name2+'</td>'+
			'<td>当座預金</td>'+
			'<td>'+bank_no2+'</td>'+
			'</tr>'+
			'</table>'+
			'</td>'+
			'</tr>'+
			'</table>'+
			'<table style="width: 660px;border:none">'+
			'<tr>'+
			'<td style="font-weight: bold;width:300px;font-size:18px;padding:14px 0" align="center">'+pdfName+'</td>'+
			'<td style="font-weight:bold;padding:20px 0;width:210px;" align="right">'+titleName+'</td>'+
			'<td align="right"  colspan="2">'+
			'<table style="width:120px;height:40px;">'+
			'<tr>'+
			'<td style="border: 1px solid black;"></td>'+
			'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
			'<td style="border: 1px solid black;"></td>'+
			'</tr>'+
			'</table>'+
			'</td>'+
			'</tr>'+
			'</table>'+
			'<table style="width:660px;border: 2px solid rebeccapurple;margin-top: 10px;border-collapse:collapse;">'+
			'<tr>'+
			'<td style="width: 60px;color: white;background-color: black;padding-top:10px" rowspan="2">'+dateName+'</td>'+
			'<td style="width: 100px;border-right:1px solid black;">'+trandate+'</td>'+
			'<td align="left">'+deliveryName+'&nbsp;'+delivery_date+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="border-right:1px solid black;">&nbsp;</td>'+
			'<td></td>'+
			'</tr>'+
			'<tr>'+
			'<td style="width: 60px;border-top:1px solid white ;color: white;background-color: black;padding-top:10px" rowspan="2">'+numberName+'</td>'+
			'<td style="width: 100px;border-top:1px solid black;border-right:1px solid black;"></td>';
			if(soLanguage == '英語'){
			str+='<td align="left">'+paymentName+'&nbsp;'+soTersmEng+'</td>';
			}else {
				str+='<td align="left">'+paymentName+'&nbsp;'+soTersmJap+'</td>';
			}
			str+='</tr>'+
			'<tr>'+
			'<td style="border-right:1px solid black;">'+tranid+'</td>'+
			'<td>'+orderName+'&nbsp;'+otherrefnum+'</td>'+
			'</tr>'+
			'</table>'+
			'<table  style="width: 660px; margin-top: 20px;" cellpadding="0" cellspacing="0">'+
			'<tr>'+
			'<td align="right">Page:<pagenumber/></td>'+
			'</tr>'+
			'</table>'+
			'<table  style="width: 660px;border:1px solid black;margin-top: 1px;" cellpadding="0" cellspacing="0">'+
			'<tr style="height:20px">'+
			'<td style="width: 85px;border-left: 1px solid black;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+codeName+'</td>'+
			'<td style="width: 273px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+poductName+'</td>'+
			'<td style="width: 73px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+quantityName+'</td>';
			if(expressFlg == 'T'){
				str+='<td style="width: 105px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+unitpriceName+'</td>';
				str+='<td style="width: 72px;border-left: 1px solid white;color: white;line-height:20px;background-color: black;font-size:9px;" align="center">'+amountName+'</td>';	
			}
			str+='<td style="width: 52px;border-left: 1px solid white;color: white;background-color: black;line-height:20px;font-size:8px;" align="center" >'+tempName+'</td>';
			str+='</tr>';
			for(var j =0; j < itemLineArr.length;j++){				
				str+='<tr>'+
				'<td style="border-left: 2px solid black;">'+
				'<table style="width:85px;">'+
				'<tr>'+
				'<td>'+itemLineArr[j].itemid+'</td>'+
				'</tr>'+
				'</table>'+
				'</td>'+	
				
				'<td style="border-left: 1px solid black;">'+
				'<table style="width:273px;">'+
				'<tr>'+
				'<td colspan="3" align="left">'+itemLineArr[j].displayname+'&nbsp;</td>'+
				'</tr>'+
				'<tr>';
				if(!isEmpty(itemLineArr[j].storage_type)){
					str+='<td colspan="3">「'+itemLineArr[j].storage_type+'」</td>';
				}else{
					str+='<td colspan="3">&nbsp;</td>';
				}
				str+='</tr>';
				for(var p = 0; p<inventoryDetailArr.length;p++ ){
					var line = inventoryDetailArr[p].line;
					if(line == itemLineArr[j].line){
						var serialnumbers = inventoryDetailArr[p].serialnumbers;  
						if(!isEmpty(serialnumbers)){
							str+='<tr>'+
							'<td style="width:83px;font-size:10px;">'+itemLineArr[j].vendorname+'</td>'+
							'<td style="width:132px;font-size:10px;" align="left">'+serialnumbers+'</td>'+
							'<td style="width:70px;font-size:10px;" align="right" >'+expirationDateNmae+'</td>'+
							'</tr>';
						}
					}
				}
				str+='</table>'+
				'</td>'+
				'<td style="border-left: 1px solid black;">'+
				'<table style="width:73px;">'+
				'<tr>'+
				'<td align="center" style="font-size:10px;">&nbsp;'+itemLineArr[j].quantity+'&nbsp;'+itemLineArr[j].unitabbreviation+'</td>'+
				'</tr>'+
				'<tr>'+
				'<td>&nbsp;</td>'+
				'</tr>';
				for(var p = 0; p<inventoryDetailArr.length;p++ ){
					var line = inventoryDetailArr[p].line;
					if(line == itemLineArr[j].line){
						var expirationdate = inventoryDetailArr[p].expirationdate;  
						str+='<tr>'; 
						if(!isEmpty(expirationdate)){
							str+='<td style="font-size:10px;border-bottom:none;">'+expirationdate+'</td>';
						}else{
							str+='<td style="font-size:10px;border-bottom:none;">&nbsp;</td>';
						}
						str+='</tr>';
					}
				}
				if(expressFlg == 'T'){
					str+='<tr>'+
					'<td align="right" style="font-size:10px;padding-top:2px;">'+taxRate+':</td>'+
					'</tr>';
				}
				str+='</table>'+
				'</td>';
					if(expressFlg == 'T'){
						str+='<td style="border-left: 1px solid black;">'+
							'<table style="width:105px;">'+
							'<tr>'+
							'<td colspan="2" align="center" style="font-size:10px;">&nbsp;'+itemLineArr[j].rateFormat+'</td>'+
							'</tr>'+
							'<tr>'+
							'<td colspan="2">&nbsp;</td>'+
							'</tr>';
						for(var p = 0; p<inventoryDetailArr.length;p++ ){
							var line = inventoryDetailArr[p].line;
							if(line == itemLineArr[j].line){
								str+='<tr>'+
								'<td colspan="2" style="border-bottom:none;font-size:10px;">&nbsp;</td>'+
								'</tr>';
							}
						}
							str+='<tr>'+
							'<td align="left" style="font-size:10px;padding-top:2px;">'+itemLineArr[j].taxrate1Format+'</td>'+
							'<td align="right" style="font-size:10px;padding-top:2px;">'+taxAmount+':</td>'+
							'</tr>'+
							'</table>'+
							'</td>';
						
						str+='<td style="border-left: 1px solid black;">'+
							'<table style="width:72px;">'+
							'<tr>'+
							'<td style="font-size:10px;" align="right">&nbsp;'+itemLineArr[j].amount+'</td>'+
							'</tr>'+
							'<tr>'+
							'<td>&nbsp;</td>'+
							'</tr>';
							for(var p = 0; p<inventoryDetailArr.length;p++ ){
								var line = inventoryDetailArr[p].line;
								if(line == itemLineArr[j].line){
									str+='<tr>'+
									'<td style="border-bottom:none;font-size:10px;">&nbsp;</td>'+
									'</tr>';
								}
							}
							str+='<tr>'+
							'<td align="right" style="font-size:10px;padding-top:2px;">'+itemLineArr[j].taxamount+'</td>'+
							'</tr>'+
							'</table>'+
							'</td>';
					}	
					str+='<td style="border-left: 1px solid black;border-right: 2px solid black;width: 15px;">'+
					'<table style="width:52px;">'+
					'<tr>'+
					'<td style="font-size:8px;">'+itemLineArr[j].deliverytemptyp+'</td>'+
					'</tr>'+
					'</table>'+
					'</td>'+
					'</tr>';
					str+='<tr>'+
					'<td style="border-left: 2px solid black;"></td>'+
					'<td style="border-left: 1px solid black;padding-bottom:2px;">&nbsp;&nbsp;'+orderNameTwo+'&nbsp;'+otherrefnum+'</td>'+
					'<td style="border-left: 1px solid black;"></td>';
					if(expressFlg == 'T'){
						str+='<td style="border-left: 1px solid black;"></td>'+
						'<td style="border-left: 1px solid black;"></td>';
					}
					str+='<td style="border-left: 1px solid black;border-right: 2px solid black;"></td>'+
					'</tr>';
					str+='</table>'+
					'<table style="border-top:2px solid black;width: 660px;" >'+
					'<tr>'+
					'<td style="width:420px;"></td>';
					if(expressFlg == 'T'){
						str+='<td style="width: 80px;height:30px;background-color: black;color: white;padding-top:15px;font-size:8px;" align="center">'+totalName+'</td>'+
						'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
						'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+amountTotal+'</td>';
					}
					str+='</tr>'+	
					'<tr>'+
					'<td style="width:470px;">&nbsp;&nbsp;'+deliName+':'+destinationName+'</td>';
					if(expressFlg == 'T'){
						str+='<td style="width: 80px;height:30px;background-color: black;padding-top:15px;color: white;border-top:1px solid white;font-size:8px;" align="center">'+consumptionTax+'</td>'+
						'<td style="width: 30px;height:30px;line-height:30px;border:1px solid black;" align="center"></td>'+
						'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;" align="center">'+taxamountTotal+'</td>';
					}
					str+='</tr>'+
					'<tr>'+
					'<td>'+
					'<table>';
					if(!isEmpty(destinationSales)){
						str+='<tr>'+
						'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+destinationSales+'</td>'+
						'</tr>';	
					}
					if(!isEmpty(destinationZip)&& !isEmpty(destinationState)){
						str+='<tr>'+
						'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+destinationZip+'&nbsp; '+destinationState+'</td>'+
						'</tr>';
					}
					str+='</table>'+
					'</td>';
					if(expressFlg == 'T'){
						str+='<td style="width: 80px;height:30px;background-color: black;padding-top:15px;color: white;border-top:1px solid white;border-bottom:2px solid black;font-size:8px;" align="center">'+invoiceNameString+'</td>'+
						'<td style="width: 30px;height:30px;padding-top:25px;border:1px solid black;border-bottom:2px solid black" align="left">'+pocurrencyMoney+'</td>'+
						'<td style="width: 120px;height:30px;padding-top:25px;border:1px solid black;border-right:2px solid black;font-size:10px;border-bottom:2px solid black;" align="center">'+toTotal+'</td>';
					}
					str+='</tr>';
					if(!isEmpty(destinationCity)){
						str+='<tr>'+
						'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+destinationCity+'</td>'+
						'</tr>';
					}
					if(!isEmpty(destinationAddress2) || !isEmpty(destinationAddress)){
						str+='<tr>'+
						'<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+destinationAddress+destinationAddress2+'</td>'+
						'</tr>';
					}			
			}
			
			str+='</table>';
			str+='</body>';
			str += '</pdf>';
			var renderer = nlapiCreateTemplateRenderer();
			renderer.setTemplate(str);
			var xml = renderer.renderToString();
			var xlsFile = nlapiXMLToPDF(xml);
			// PDF
			xlsFile.setName(fileName  + '.pdf');
			xlsFile.setFolder(DELIVERY_FILE_PDF_IN_DJ_DELIVERYPDF);
			xlsFile.setIsOnline(true);
			// save file
			var fileID = nlapiSubmitFile(xlsFile);
			
			return fileID;


		}else{

			
			var soid = recordId;//soid
			var subsidiarySearchColumn = new nlobjSearchColumn("subsidiary");//連結子会社 (For retrieval)
			var entitySearchColumn =  new nlobjSearchColumn("entity");//顧客(For retrieval)
			var tranidSearchColumn = new nlobjSearchColumn("tranid");//請求書番号
			var otherrefnumSearchColumn =  new nlobjSearchColumn("otherrefnum");//御社発注番号
			var transactionnumberSearchColumn = new nlobjSearchColumn("transactionnumber","createdFrom",null);//受注番号(maybe not true)
			var deliveryCodeSearchColumn =  new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先コード
			var deliveryNameSearchColumn = new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先名前
			var deliveryZipSearchColumn = new nlobjSearchColumn("custrecord_djkk_zip","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_郵便番号
			var deliveryPrefecturesSearchColumn = new nlobjSearchColumn("custrecord_djkk_prefectures","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_都道府県
			var deliveryMunicipalitiesSearchColumn = new nlobjSearchColumn("custrecord_djkk_municipalities","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_市区町村
			var deliveryResidenceSearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所1
			var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所2
			var duedateSearchColumn = new nlobjSearchColumn("duedate");//発行日
			var deliveryDateSearchColumn = new nlobjSearchColumn("custbody_djkk_delivery_date");//DJ_納品日

			var column = [
			              subsidiarySearchColumn,
			              entitySearchColumn,
			              tranidSearchColumn,
			              otherrefnumSearchColumn,
			              transactionnumberSearchColumn,
			              deliveryCodeSearchColumn,
			              deliveryNameSearchColumn,
			              deliveryZipSearchColumn,
			              deliveryPrefecturesSearchColumn,
			              deliveryMunicipalitiesSearchColumn,
			              deliveryResidenceSearchColumn,
			              deliveryResidence2SearchColumn,
			              duedateSearchColumn,
			              deliveryDateSearchColumn
			             ]
			var invoiceSearch = nlapiSearchRecord("salesorder",null,     //
					[
//					   ["type","anyof","CustInvc"],
//					   "AND",
					   ["internalid","anyof",soid]
					], 
					column
					);
			var subsidiary = defaultEmpty(invoiceSearch[0].getValue(subsidiarySearchColumn));//連結子会社internalid (For retrieval)
			nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)	
			var subsidiaryrSearch = nlapiSearchRecord("subsidiary",null,
					[
					   ["internalid","anyof","6"]
					], 
					[
					 	new nlobjSearchColumn("legalname"),//連結正式名称
					 	new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),//連結DJ_会社名前英語
					 	new nlobjSearchColumn("fax"),//連結FAX
					 	new nlobjSearchColumn("phone","address",null), //連結TEL?????
					 	new nlobjSearchColumn("phone") //連結TEL?????
					]
					);
			var legalName = defaultEmpty(subsidiaryrSearch[0].getValue("legalname"));//連結正式名称
			var EnglishName = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_subsidiary_en"));//連結DJ_会社名前英語
			var subsidiaryFax = 'FAX: ' + defaultEmpty(subsidiaryrSearch[0].getValue("fax"));//連結FAX
			var phone = 'TEL: ' + defaultEmpty(subsidiaryrSearch[0].getValue("phone"));//連結TEL

			var entity = defaultEmpty(invoiceSearch[0].getValue(entitySearchColumn));//顧客internalid(For retrieval)	
			var customerSearch = nlapiSearchRecord("customer",null,
					[
					   ["internalid","anyof",entity]
					], 
					[	
					 	new nlobjSearchColumn("billcity"),//市区
					 	new nlobjSearchColumn("companyname"),//名前
//					 	new nlobjSearchColumn("phone"),//
					 	new nlobjSearchColumn("fax"),//fax
					 	new nlobjSearchColumn("entityid"),//顧客code
					 	new nlobjSearchColumn("zipcode","Address",null),
					 	new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//
					 	new nlobjSearchColumn("address1","Address",null),//
					 	new nlobjSearchColumn("address2","Address",null),//
					 	new nlobjSearchColumn("addressee","Address",null)//	
					]
					);
			var customerRecord=nlapiLoadRecord('customer', entity);
			var paymentPeriodMonths = customerRecord.getLineItemValue("recmachcustrecord_suitel10n_jp_pt_customer","custrecord_suitel10n_jp_pt_paym_due_mo_display",1);//支払期限月
			var customePhone = customerRecord.getLineItemValue("addressbook","phone",1);//p
			if(customerSearch != null){
				var companyName = customerSearch[0].getValue("companyname");//顧客名
				var billcity = customerSearch[0].getValue("billcity");//市区
				var customerCode = customerSearch[0].getValue("entityid");//顧客code
				var customeFax = customerSearch[0].getValue("fax");//顧客FAX
			//	var customePhone = customerSearch[0].getValue("phone");//顧客TEL
			    var custZipCode = customerSearch[0].getValue("zipcode","Address",null);//顧客郵便
				if(custZipCode && custZipCode.substring(0,1) != '〒'){
					custZipCode = '〒' + custZipCode;
				}else{
					custZipCode = '';
				}
				var custState = customerSearch[0].getValue("custrecord_djkk_address_state","Address",null);//顧客都道府県
				var custAddr1 = customerSearch[0].getValue("address1","Address",null);//顧客住所１
				var custAddr2 = customerSearch[0].getValue("address2","Address",null);//顧客住所２
				var custAddressee = customerSearch[0].getValue("addressee","Address",null);//顧客宛先
			}	
			var tranid = defaultEmpty(invoiceSearch[0].getValue(tranidSearchColumn));//請求書番号
			var otherrefnum = defaultEmpty(invoiceSearch[0].getValue(otherrefnumSearchColumn));//御社発注番号
			var transactionnumber = defaultEmpty(invoiceSearch[0].getValue(transactionnumberSearchColumn));//受注番号(maybe not true)
			var deliveryCode = defaultEmpty(invoiceSearch[0].getValue(deliveryCodeSearchColumn));//DJ_納品先 : DJ_納品先コード
			var deliveryName = defaultEmpty(invoiceSearch[0].getValue(deliveryNameSearchColumn));//DJ_納品先 : DJ_納品先名前
			var deliveryZip = defaultEmpty(invoiceSearch[0].getValue(deliveryZipSearchColumn));//DJ_納品先 : DJ_郵便番号
			if(deliveryZip && deliveryZip.substring(0,1) != '〒'){
				deliveryZip = '〒' + deliveryZip;
			}else{
				deliveryZip = '';
			}
			var deliveryPrefectures = defaultEmpty(invoiceSearch[0].getValue(deliveryPrefecturesSearchColumn));//DJ_納品先 : DJ_都道府県
			var deliveryMunicipalities = defaultEmpty(invoiceSearch[0].getValue(deliveryMunicipalitiesSearchColumn));//DJ_納品先 : DJ_市区町村
			var deliveryResidence = defaultEmpty(invoiceSearch[0].getValue(deliveryResidenceSearchColumn));//DJ_納品先 : DJ_納品先住所1
			var deliveryResidence2 = defaultEmpty(invoiceSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_納品先 : DJ_納品先住所2
			var duedate = defaultEmpty(invoiceSearch[0].getValue(duedateSearchColumn));//発行日
			var deliveryDate = defaultEmpty(invoiceSearch[0].getValue(deliveryDateSearchColumn));//DJ_納品日
			
			//アイテム 
			var itemIdArray = [];
			var itemDetails = [];
			var amountTotal = 0;
			var taxTotal = 0;
			var taxType = {};
			var soRecord = nlapiLoadRecord('salesorder', recordId);
			var Counts = soRecord.getLineItemCount('item');//アイテム明細部
			if(Counts != 0) {
				for(var s = 1; s <=  Counts; s++){
					var item = defaultEmpty(soRecord.getLineItemValue('item', 'item', s));//アイテムID
					var quantity = defaultEmpty(parseFloat(soRecord.getLineItemValue('item', 'quantity', s)));//数量
					var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
					
					var units_display = defaultEmpty(soRecord.getLineItemValue('item', 'units_display', s));//単位
					
					var origrate = defaultEmptyToZero(parseFloat(soRecord.getLineItemValue('item', 'rate', s)));//単価
					var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					
					var amount = defaultEmptyToZero(parseFloat(soRecord.getLineItemValue('item', 'amount', s)));//金額
					var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					
					var taxRate = defaultEmpty(soRecord.getLineItemValue('item', 'taxrate1', s));//税率
					
					var taxAmount = defaultEmptyToZero(parseFloat(soRecord.getLineItemValue('item', 'tax1amt', s)));//税額
					var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
					
					var itemSearch = nlapiSearchRecord("item",null,
							[
							   ["internalid","anyof",item]
							], 
							[
							   new nlobjSearchColumn("itemid"),						   
							   new nlobjSearchColumn("displayname")
							]
							);	
					var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));
					var itemid = defaultEmpty(itemSearch[0].getValue('itemid'));
					amountTotal += amount;
					taxTotal += taxAmount;
					
					var taxRateData = taxType[taxRate] || 0;
					taxType[taxRate] = taxRateData + taxAmount + amount;
				
					
					
					itemDetails.push({
						  item : item,//アイテムID
						  units_display : units_display,//単位
						  amount : amountFormat,//金額
						  quantity : quantityFormat,//数量
						  origrate : origrateFormat,//単価
						  displayname:displayname,//商品d名
						  itemid:itemid//商品code
					});
				}
			}
			var amountTotalFormat = amountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			var headValue  = {
			legalName:defaultEmpty(legalName),//連結正式名称
			EnglishName:defaultEmpty(EnglishName),//連結DJ_会社名前英語
			subsidiaryFax:defaultEmpty(subsidiaryFax),//連結FAX
			phone:defaultEmpty(phone),//連結TEL
			paymentPeriodMonths:defaultEmpty(paymentPeriodMonths),//支払期限月
			companyName :defaultEmpty(companyName),//顧客名
			customeFax:defaultEmpty(customeFax),//顧客FAX
			billcity:defaultEmpty(billcity),//市区
			customerCode:defaultEmpty(customerCode),//顧客codeNum
			customePhone:defaultEmpty(customePhone),//顧客TEL
		    custZipCode :defaultEmpty(custZipCode),//顧客郵便
			custState:defaultEmpty(custState),//顧客都道府県
			custAddr1:defaultEmpty(custAddr1),//顧客住所１
			custAddr2:defaultEmpty(custAddr2),//顧客住所２
			custAddressee:defaultEmpty(custAddressee),//顧客宛先
			tranid:defaultEmpty(tranid),//請求書番号
			otherrefnum:defaultEmpty(otherrefnum),//御社発注番号
			transactionnumber:defaultEmpty(transactionnumber),//受注番号(maybe not true)
			deliveryCode:defaultEmpty(deliveryCode),//DJ_納品先 : DJ_納品先コード
			deliveryName :defaultEmpty(deliveryName),//DJ_納品先 : DJ_納品先名前
			deliveryZip:defaultEmpty(deliveryZip),//DJ_納品先 : DJ_郵便番号
			deliveryPrefectures :defaultEmpty(deliveryPrefectures),//DJ_納品先 : DJ_都道府県
			deliveryMunicipalities: defaultEmpty(deliveryMunicipalities),//DJ_納品先 : DJ_市区町村
			deliveryResidence:defaultEmpty(deliveryResidence),//DJ_納品先 : DJ_納品先住所1
			deliveryResidence2 :defaultEmpty(deliveryResidence2),//DJ_納品先 : DJ_納品先住所2
			duedate:defaultEmpty(duedate),//発行日
			deliveryDate:defaultEmpty(deliveryDate)//DJ_納品日
			};
			var TotalForTaxEight = 0;
			var TotalForTaxTen = 0;
			for(var k in taxType){
				if(k == '8.0%'){
					 TotalForTaxEight = taxType[k];//税率8%で税金総額
				}else if(k == '10.0%'){
					 TotalForTaxTen = taxType[k];//税率20%で税金総額
				}
			}
			var total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
			TotalForTaxEight = TotalForTaxEight.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			TotalForTaxTen = TotalForTaxTen.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			var str = '';
			str += '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
			'<pdf>'+
			'<head>'+
			'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
			'<#if .locale == "zh_CN">'+
			'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
			'<#elseif .locale == "zh_TW">'+
			'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
			'<#elseif .locale == "ja_JP">'+
			'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
			'<#elseif .locale == "ko_KR">'+
			'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
			'<#elseif .locale == "th_TH">'+
			'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
			'</#if>'+
			'<macrolist>'+
			'<macro id="nlheader">'+
			'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
			'<tr>'+
			'<td style="width:65px;"></td>'+
			'<td style="width:65px;"></td>'+
			'<td style="width:65px;"></td>'+
			'<td style="width:65px;"></td>'+
			'<td style="width:200px;"></td>'+
			'<td style="width:100px;"></td>'+
			'<td style="width:100px;"></td>'+
			'</tr>'+
			'<tr>'+
			''+
			'<td colspan="3" rowspan="2" style="border-bottom: 4px black solid;vertical-align:bottom;font-size: 35px;">&nbsp;&nbsp;納&nbsp;&nbsp;品&nbsp;&nbsp;書</td>'+
			'<td></td>'+
			'<td colspan="3" style="font-size: 12px;font-weight: 550;vertical-align:bottom">'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</td>'+
			''+
			'</tr>'+
			'<tr>'+
			''+
			'<td></td>'+
			'<td colspan="3" style="font-size: 12px;font-weight: bold;vertical-align:middle">'+headValue.phone+'／発注専用FAX：</td>'+
			''+
			'</tr>'+
			'<tr>'+
			'<td colspan="3"></td>'+
			'<td></td>'+
			'<td colspan="3" style="font-size: 12px;font-weight: bold;vertical-align:bottom">'+headValue.subsidiaryFax+'</td>'+
			''+
			'</tr>'+
			'<tr>'+
			'<td colspan="7" style="font-weight: 200;font-size:20px">'+headValue.companyName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="font-weight: 200;font-size:20px" colspan="2">FAX:</td>'+
			'<td colspan="5" style="font-weight: 200;font-size:20px">'+headValue.customeFax+'</td>'+
			'</tr>'+
			'<tr height="10px">'+
			''+
			'</tr>'+
			'<tr>'+
			'<td colspan="7" style="font-size: 12px; font-weight: bold;">平素は格別のお引き立て有難うございます。この度はご注文ありがとうございました。</td>'+
			'</tr>'+
			'<tr>'+
			'<td colspan="7" style="font-size: 12px; font-weight: bold;border-bottom: 4px solid black;">下記の通り納品致しましたので、ご査収ください。 </td>'+
			'</tr>'+
			''+
			'</table>'+
			'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
			'<tr>'+
			'<td style="width: 65px;"></td>'+
			'<td style="width: 90px;"></td>'+
			'<td style="width: 100px;"></td>'+
			'<td style="width: 100px;"></td>'+
			'<td style="width: 100px;"></td>'+
			'<td style="width: 110px;"></td>'+
			'<td style="width: 95px;"></td>'+
			'</tr>'+
			'<tr style="font-weight: 460;font-size: 13px;">'+
			'<td>&nbsp;&nbsp;請求先：</td>'+
			'<td>'+headValue.customerCode+'</td>'+
			'<td colspan="4">'+headValue.companyName+'</td>'+
			'<td align="center">I</td>'+
			'</tr>'+
			'<tr style="font-weight: 460;font-size: 13px;">'+
			'<td></td>'+
			'<td>〒 &nbsp;550-0002</td>'+
			'<td colspan="5">'+headValue.custState+'&nbsp;&nbsp;&nbsp;'+headValue.billcity+headValue.custAddr1+headValue.custAddr2+'</td>'+
			'</tr>'+
			'</table>'+
			'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
			'<tr style="font-weight: 460;font-size: 13px;">'+
			'<td style="width: 65px;border-bottom: 1px black solid;"></td>'+
			'<td style="width: 50px;border-bottom: 1px black solid;">Tel</td>'+
			'<td style="width: 110px;border-bottom: 1px black solid;">'+headValue.customePhone+'</td>'+
			'<td style="width: 70px;border-bottom: 1px black solid;">Fax</td>'+
			'<td colspan="3" style="border-bottom: 1px black solid;">'+headValue.customeFax+'</td>'+
			'</tr>'+
			'</table>'+
			'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
			''+
			'<tr style="font-weight: 460;font-size: 13px;">'+
			'<td style="width: 90px;border-top: 1px solid black;">&nbsp;&nbsp;請求書番号：</td>'+
			'<td style="width: 100px;border-top: 1px solid black;">'+headValue.tranid+'</td>'+
			'<td style="width: 60px;border-top: 1px solid black;"><span>森本</span><span style="margin-left: 15px;">06</span></td>'+
			'<td width="60px" style="border-top: 1px solid black;">発行日：</td>'+
			'<td width="120px" style="border-top: 1px solid black;">'+headValue.duedate+'</td>'+
			'<td colspan="2" style="border-top: 1px solid black;">備考</td>'+
			'</tr>'+
			'<tr style="font-weight: 460;font-size: 13px;">'+
			'<td>&nbsp;&nbsp;受注番号：</td>'+
			'<td colspan="2">'+headValue.transactionnumber+'</td>'+
			'<td>納品日：</td>'+
			'<td>'+headValue.deliveryDate+'</td>'+
			'<td colspan="2"></td>'+
			'</tr>'+
			'<tr style="font-weight: 460;font-size: 13px;">'+
			'<td>&nbsp;&nbsp;御社発注番号</td>'+
			'<td colspan="2">'+headValue.otherrefnum+'</td>'+
			'<td>納品先：</td>'+
			'<td>'+headValue.deliveryCode+'</td>'+
			'<td colspan="2">'+headValue.deliveryName+'</td>'+
			'</tr>'+
			'<tr style="font-weight: 460;font-size: 13px;">'+
			'<td style="vertical-align:top;">&nbsp;&nbsp;支払条件：</td>'+
			'<td colspan="2" style="vertical-align:top;">'+headValue.paymentPeriodMonths+'</td>'+
			'<td></td>'+
			'<td style="vertical-align:top;">'+headValue.deliveryZip+'</td>'+
			'<td colspan="2">'+headValue.deliveryPrefectures+'&nbsp;'+headValue.deliveryMunicipalities+headValue.deliveryPrefectures+headValue.deliveryResidence+headValue.deliveryResidence2+'<br/>'+headValue.deliveryName+'</td>'+
			'</tr>'+
			'</table>'+
			'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
			'<tr>'+
			'<td width="8px"></td>'+
			'<td width="90px"></td>'+
			'<td width="15px"></td>'+
			'<td width="125px"></td>'+
			'<td width="125px"></td>'+
			'<td width="60px"></td>'+
			'<td width="65px"></td>'+
			'<td></td>'+
			'<td></td>'+
			'</tr>'+
			'<tr style="font-weight: 400;font-size: 12px;">'+
			'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
			'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">明&nbsp;&nbsp;細</td>'+
			'<td width="15px" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
			'<td colspan="2" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
			'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
			'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">数量</td>'+
			'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">単価</td>'+
			'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">金額</td>'+
			'</tr>'+
			'</table>'+
			'</macro>'+
			'<macro id="nlfooter">'+
			
			'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
			'<tr heigth="8px">'+
			'<td width="150px"></td>'+
			'<td width="170px"></td>'+
			'<td width="90px"></td>'+
			'<td width="170px"></td>'+
			'<td width="80px"></td>'+
			'</tr>'+

			'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
			'<td width="150px" ></td>'+
			'<td width="170px" style="border-top:1px solid black"></td>'+
			'<td width="90px"  style="border-top:1px solid black;border-right:1px dashed black"></td>'+
			'<td width="170px" style="border-top:1px solid black">合計</td>'+
			'<td width="80px"  style="border-top:1px solid black">'+amountTotalFormat+'</td>'+
			'</tr>'+
			
			'<tr heigth="8px">'+
			'<td width="150px"></td>'+
			'<td width="170px"></td>'+
			'<td width="90px"></td>'+
			'<td width="170px"></td>'+
			'<td width="80px"></td>'+
			'</tr>'+

			'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
			'<td width="250px"></td>'+
			'<td width="150px">8% 対象合計(税込)</td>'+
			'<td width="70px"  style="border-right:1px dashed black">'+TotalForTaxEight+'</td>'+
			'<td width="80px">消費税</td>'+
			'<td width="50px">'+taxTotal+'</td>'+
			'</tr>'+

			'<tr heigth="8px">'+
			'<td width="150px"></td>'+
			'<td width="170px"></td>'+
			'<td width="90px"></td>'+
			'<td width="170px"></td>'+
			'<td width="80px"></td>'+
			'</tr>'+

			'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
			'<td width="250px" style="border-bottom:4px solid black">&nbsp;&nbsp;※軽減税率対象</td>'+
			'<td width="150px" style="border-bottom:4px solid black">10%対象合計(税込)</td>'+
			'<td width="70px"  style="border-bottom:4px solid black;border-right:1px dashed black">'+TotalForTaxTen+'</td>'+
			'<td width="80px"  style="border-bottom:4px solid black">合計(税込)￥</td>'+
			'<td width="50px"  style="border-bottom:4px solid black">'+total+'</td>'+
			'</tr>'+
			
			'<tr style="height:10px">'+
			''+
			'</tr>'+
			'<tr style="font-weight: bold;font-size: 15px;">'+
			'<td colspan="5" align="center">現在、配送リードタイムをプラス１日とさせて頂いております。通常リードタイムに戻る際は<br/>、改めてご連絡申し上げます。<br/>コロナウィルス感染リスク軽減による、弊社テレワーク導入の為、大変ご迷惑をお掛け致し<br/>ますが、ご理解の程よろしくお願い申し上げます。</td>'+
			'</tr>'+
			'<tr>'+
			'<td colspan="5"></td>'+
			'</tr>'+
			'<tr style="font-weight: bold;font-size: 15px;">'+
			'<td colspan="5" align="center">***** 全<totalpages/>ページ：<pagenumber/>*****</td>'+
			'</tr>'+
			'</table>'+
			'</macro>'+
			'</macrolist>'+
			'<style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
			'<#if .locale == "zh_CN">'+
			'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
			'<#elseif .locale == "zh_TW">'+
			'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
			'<#elseif .locale == "ja_JP">'+
			'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
			'<#elseif .locale == "ko_KR">'+
			'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
			'<#elseif .locale == "th_TH">'+
			'font-family: NotoSans, NotoSansThai, sans-serif;'+
			'<#else>'+
			'font-family: NotoSans, sans-serif;'+
			'</#if>'+
			'}'+
			'</style>'+
			'</head>';
			str+='<body header="nlheader" header-height="30%" footer="nlfooter" footer-height="28%" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';
			str+=
				'<table>'+
				'<tr>'+
				'<td width="8px"></td>'+
				'<td width="90px"></td>'+
				'<td width="15px"></td>'+
				'<td width="125px"></td>'+
				'<td width="125px"></td>'+
				'<td width="60px"></td>'+
				'<td width="65px"></td>'+
				'<td></td>'+
				'<td></td>'+
				'</tr>';
				for(var k = 0 ; k < itemDetails.length;k++){
					str += '<tr style="font-weight: bold;font-size: 12px;height:40px">'+
					'<td></td>'+
					'<td style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
					'<td width="15px"></td>'+
					'<td colspan="2" style="vertical-align: top;">'+itemDetails[k].displayname+'</td>'+
					'<td style="vertical-align: top;" align="center">※</td>'+
					'<td style="vertical-align: top;">'+itemDetails[k].quantity+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
					'<td style="vertical-align: top;" align="center">'+itemDetails[k].origrate+'</td>'+
					'<td style="vertical-align: top;" align="center">'+itemDetails[k].amount+'</td>'+
					'</tr>'+
					'<tr style="font-weight: bold;font-size: 10px;height:20px">'+
					'<td></td>'+
					'<td style="vertical-align: top;">93482608</td>'+
					'<td width="15px"></td>'+
					'<td></td>'+
					'<td></td>'+
					'<td></td>'+
					'<td></td>'+
					'<td></td>'+
					'</tr>';
				}
				
				str+='</table>';
				
			str += '</body></pdf>';
			var renderer = nlapiCreateTemplateRenderer();
			renderer.setTemplate(str);
			var xml = renderer.renderToString();
			var xlsFile = nlapiXMLToPDF(xml);
			// PDF
			xlsFile.setName(fileName  + '.pdf');
			xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
			xlsFile.setIsOnline(true);
			// save file
			var fileID = nlapiSubmitFile(xlsFile);
			return fileID;
		  

		}
	}
	catch(e){
		nlapiLogExecution('debug', 'エラー', e.message)
//	
	}
}

//CH775 add by zdj 20230804 start
//function creditmemoDeliveryPDF(id,custform,fileName){
//	//クレジットメモ FOODFORM - 価格入り納品書
//	nlapiLogExecution('debug','start','クレジットメモ 価格入り納品書  PDF making start')
//	var creditmemoid = id;//クレジットメモid
//	var creditmemoRecord = nlapiLoadRecord("creditmemo",creditmemoid)
//	
//	var salesrepSearchColumn =  new nlobjSearchColumn("salesrep");//顧客(For retrieval)
//	var subsidiarySearchColumn = new nlobjSearchColumn("subsidiary");//連結子会社 (For retrieval)
//	var entitySearchColumn =  new nlobjSearchColumn("entity");//顧客(For retrieval)
//	var tranidSearchColumn = new nlobjSearchColumn("tranid");//請求書番号
//	var memoSearchColumn = new nlobjSearchColumn("memo");//memo
//	var paymentConditionsColumn = new nlobjSearchColumn("custbody_djkk_payment_conditions");//支払条件
//	var otherrefnumSearchColumn =  new nlobjSearchColumn("otherrefnum");//御社発注番号
//	var transactionnumberSearchColumn = new nlobjSearchColumn("transactionnumber");//受注番号(maybe not true)
//	var deliveryCodeSearchColumn =  new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先コード
//	var deliveryNameSearchColumn = new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先名前
//	var deliveryZipSearchColumn = new nlobjSearchColumn("custrecord_djkk_zip","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_郵便番号
//	var deliveryPrefecturesSearchColumn = new nlobjSearchColumn("custrecord_djkk_prefectures","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_都道府県
//	var deliveryMunicipalitiesSearchColumn = new nlobjSearchColumn("custrecord_djkk_municipalities","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_市区町村
//	var deliveryResidenceSearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所1
//	var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所2
//	var deliveryDateSearchColumn = new nlobjSearchColumn("custbody_djkk_delivery_date");//DJ_納品日
//
//	var column = [
//	              salesrepSearchColumn,
//			      memoSearchColumn,
//	              paymentConditionsColumn,
//	              subsidiarySearchColumn,
//	              entitySearchColumn,
//	              tranidSearchColumn,
//	              otherrefnumSearchColumn,
//	              transactionnumberSearchColumn,
//	              deliveryCodeSearchColumn,
//	              deliveryNameSearchColumn,
//	              deliveryZipSearchColumn,
//	              deliveryPrefecturesSearchColumn,
//	              deliveryMunicipalitiesSearchColumn,
//	              deliveryResidenceSearchColumn,
//	              deliveryResidence2SearchColumn,
//	              deliveryDateSearchColumn
//	             ]
//	var creditmemoSearch = nlapiSearchRecord("creditmemo",null,
//			[
////			   ["type","anyof","CustInvc"],
////			   "AND",
//			   ["internalid","anyof",creditmemoid]
//			], 
//			column
//			);
//	var subsidiary = defaultEmpty(creditmemoSearch[0].getValue(subsidiarySearchColumn));//連結子会社internalid (For retrieval)
//	nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)	
//	var subsidiaryrSearch = nlapiSearchRecord("subsidiary",null,
//			[
//			   ["internalid","anyof",subsidiary]
//			], 
//			[
//			 	new nlobjSearchColumn("legalname"),//連結正式名称
//			 	new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),//連結DJ_会社名前英語
//			 	new nlobjSearchColumn("fax"),//発注専用FAX
////			 	new nlobjSearchColumn("phone"), //連結TEL?????
//			 	new nlobjSearchColumn("custrecord_djkk_address_fax","Address",null), //連結FAX
//			    new nlobjSearchColumn("phone","Address",null),//連結TEL
//			 	new nlobjSearchColumn("custrecord_djkk_shippingdeliverynotice"),//DJ_出荷案内・価格入り納品書出力用お知らせ文言
//                //CH655 20230725 add by zdj start
//                new nlobjSearchColumn("phone","shippingAddress",null),//配送先phone
//                new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//配送先fax
//                //CH655 20230725 add by zdj end
//			]
//			);
//	var legalName = defaultEmpty(subsidiaryrSearch[0].getValue("legalname"));//連結正式名称
//	var EnglishName = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_subsidiary_en"));//連結DJ_会社名前英語
//	var Fax = 'FAX: ' + defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","Address",null));//連結FAX
//	var phone = 'TEL: ' + defaultEmpty(subsidiaryrSearch[0].getValue("phone","Address",null));//連結TEL	
//	var transactionFax = defaultEmpty(subsidiaryrSearch[0].getValue("fax"));//発注専用FAX
//	var shippingdeliverynotice = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_shippingdeliverynotice"));//DJ_出荷案内・価格入り納品書出力用お知らせ文言
//    //CH655 20230725 add by zdj start
//    var subShipaddressPhone= 'TEL: ' + defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("phone","shippingAddress",null));//配送先phone
//    var subShipaddressFax= 'FAX: ' + defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","shippingAddress",null));//配送先fax
//    //CH655 20230725 add by zdj end
//	
//	var entity = defaultEmpty(creditmemoSearch[0].getValue(entitySearchColumn));//顧客internalid(For retrieval)	
//	nlapiLogExecution('DEBUG', 'entity', entity)
//	var customerSearch = nlapiSearchRecord("customer",null,
//			[
//			   ["internalid","anyof",entity]
//			], 
//			[	
////			 	new nlobjSearchColumn("billcity"),//市区
//			 	new nlobjSearchColumn("city"),//市区
//			 	new nlobjSearchColumn("companyname"),//名前
//			 	new nlobjSearchColumn("phone"),//顧客TEL
//			 	new nlobjSearchColumn("fax"),//fax
//			 	new nlobjSearchColumn("entityid"),//顧客code
//			 	new nlobjSearchColumn("zipcode","Address",null),
//			 	new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//
//			 	new nlobjSearchColumn("address1","Address",null),//
//			 	new nlobjSearchColumn("address2","Address",null),//
//			 	new nlobjSearchColumn("address3","Address",null),//
//			 	new nlobjSearchColumn("addressee","Address",null)//	
//			]
//			);
//	
//	
//	
////	var customerRecord=nlapiLoadRecord('customer', entity);
//if(!isEmpty(customerSearch)){
//	var companyName = defaultEmpty(customerSearch[0].getValue("companyname"));//顧客名
//	var billcity = defaultEmpty(customerSearch[0].getValue("city"));//市区
//	var customerCode = defaultEmpty(customerSearch[0].getValue("entityid"));//顧客code
//	var customeFax = defaultEmpty(customerSearch[0].getValue("fax"));//顧客FAX
//	var customePhone = defaultEmpty(customerSearch[0].getValue("phone"));//顧客TEL
//    var custZipCode = defaultEmpty(customerSearch[0].getValue("zipcode","Address",null));//顧客郵便
//	if(custZipCode && custZipCode.substring(0,1) != '〒'){
//		custZipCode = '〒' + custZipCode;
//	}else{
//		custZipCode = '';
//	}
//	var custState = defaultEmpty(customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//顧客都道府県
//	var custAddr1 = defaultEmpty(customerSearch[0].getValue("address1","Address",null));//顧客住所１
//	var custAddr2 = defaultEmpty(customerSearch[0].getValue("address2","Address",null));//顧客住所２
//	var custAddr3 = defaultEmpty(customerSearch[0].getValue("address3","Address",null));//顧客住所3
//	var custAddressee = defaultEmpty(customerSearch[0].getValue("addressee","Address",null));//顧客宛先
//}
//nlapiLogExecution('DEBUG', '2')
//nlapiLogExecution('DEBUG', 'companyName',companyName)
//	var paymentPeriodMonths =  defaultEmpty(creditmemoSearch[0].getText(paymentConditionsColumn));//支払期限月
//	var memo =  defaultEmpty(creditmemoSearch[0].getValue(memo));//memo
//	var salesrep =  defaultEmpty(creditmemoSearch[0].getText(salesrepSearchColumn));//営業担当者
//	var tranid = defaultEmpty(creditmemoSearch[0].getValue(tranidSearchColumn));//請求書番号
//	var otherrefnum = defaultEmpty(creditmemoSearch[0].getValue(otherrefnumSearchColumn));//御社発注番号
//	var transactionnumber = defaultEmpty(creditmemoSearch[0].getValue(transactionnumberSearchColumn));//受注番号(maybe not true)
//	var deliveryCode = defaultEmpty(creditmemoSearch[0].getValue(deliveryCodeSearchColumn));//DJ_納品先 : DJ_納品先コード
//	var deliveryName = defaultEmpty(creditmemoSearch[0].getValue(deliveryNameSearchColumn));//DJ_納品先 : DJ_納品先名前
//	var deliveryZip = defaultEmpty(creditmemoSearch[0].getValue(deliveryZipSearchColumn));//DJ_納品先 : DJ_郵便番号
//	if(deliveryZip && deliveryZip.substring(0,1) != '〒'){
//		deliveryZip = '〒' + deliveryZip;
//	}else{
//		deliveryZip = '';
//	}
//	var deliveryPrefectures = defaultEmpty(creditmemoSearch[0].getValue(deliveryPrefecturesSearchColumn));//DJ_納品先 : DJ_都道府県
//	var deliveryMunicipalities = defaultEmpty(creditmemoSearch[0].getValue(deliveryMunicipalitiesSearchColumn));//DJ_納品先 : DJ_市区町村
//	var deliveryResidence = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidenceSearchColumn));//DJ_納品先 : DJ_納品先住所1
//	var deliveryResidence2 = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_納品先 : DJ_納品先住所2
//	var duedate = formatDate(new Date());//発行日
//	var deliveryDate = defaultEmpty(creditmemoSearch[0].getValue(deliveryDateSearchColumn));//DJ_納品日
//	
//	//アイテム 
//	var itemIdArray = [];
//	var itemDetails = [];
//	var amountTotal = 0;
//	var taxTotal = 0;
//	var taxType = {};
//	nlapiLogExecution('DEBUG', '3')
//	var Counts = creditmemoRecord.getLineItemCount('item');//アイテム明細部
//	if(Counts != 0) {
//		for(var s = 1; s <=  Counts; s++){
//			var item = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'item', s));//アイテムID
//			var quantity = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item', 'quantity', s)));//数量
//			var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
//			
//			var units_display = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'units_display', s));//単位
//			
//			var origrate = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'rate', s)));//単価
//			var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//			
//			var amount = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'amount', s)));//金額
//			var amountFormat = ifZero(amount);
//			
//			var taxRate = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'taxrate1', s));//税率
//			
//			var taxAmount = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'tax1amt', s)));//税額
//			var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//			
//			var itemSearch = nlapiSearchRecord("item",null,
//					[
//					   ["internalid","anyof",item]
//					], 
//					[
//					   new nlobjSearchColumn("itemid"),						   
//					   new nlobjSearchColumn("displayname")
//					]
//					);	
//			var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));
//			displayname = displayname.replace(new RegExp("&","g"),"&amp;")
//			var itemid = defaultEmpty(itemSearch[0].getValue('itemid'));
//			amountTotal += amount;
//			taxTotal += taxAmount;
//			
//			var taxRateData = taxType[taxRate] || 0;
//			taxType[taxRate] = taxRateData + taxAmount + amount;
//		
//			
//			
//			itemDetails.push({
//				  item : item,//アイテムID
//				  units_display : units_display,//単位
//				  amount : amountFormat,//金額
//				  quantity : quantityFormat,//数量
//				  origrate : origrateFormat,//単価
//				  displayname:displayname,//商品d名
//				  itemid:itemid//商品code
//			});
//		}
//	}
//	var amountTotalFormat = ifZero(amountTotal);
//	var headValue  = {
//	salesrep:salesrep,//営業担当者
//	legalName:legalName,//連結正式名称
//	EnglishName:EnglishName,//連結DJ_会社名前英語
//	transactionFax:transactionFax,//発注専用FAX
//	phone:phone,//連結TEL
//	Fax:Fax,//連結FAX
//	subShipaddressPhone:subShipaddressPhone,
//	subShipaddressFax:subShipaddressFax,
//	paymentPeriodMonths:paymentPeriodMonths,//支払期限月
//	companyName :companyName,//顧客名
//	customeFax:customeFax,//顧客FAX
//	billcity:billcity,//市区
//	customerCode:customerCode,//顧客codeNum
//	customePhone:customePhone,//顧客TEL
//    custZipCode :custZipCode,//顧客郵便
//	custState:custState,//顧客都道府県
//	custAddr1:custAddr1,//顧客住所１
//	custAddr2:custAddr2,//顧客住所２
//	custAddr3:custAddr3,//顧客住所3
//	custAddressee:custAddressee,//顧客宛先
//	tranid:tranid,//請求書番号
//	otherrefnum:otherrefnum,//御社発注番号
//	transactionnumber:transactionnumber,//受注番号(maybe not true)
//	deliveryCode:deliveryCode,//DJ_納品先 : DJ_納品先コード
//	deliveryName :deliveryName,//DJ_納品先 : DJ_納品先名前
//	deliveryZip:deliveryZip,//DJ_納品先 : DJ_郵便番号
//	deliveryPrefectures :deliveryPrefectures,//DJ_納品先 : DJ_都道府県
//	deliveryMunicipalities: deliveryMunicipalities,//DJ_納品先 : DJ_市区町村
//	deliveryResidence:deliveryResidence,//DJ_納品先 : DJ_納品先住所1
//	deliveryResidence2 :deliveryResidence2,//DJ_納品先 : DJ_納品先住所2
//	duedate:duedate,//発行日
//	deliveryDate:deliveryDate//DJ_納品日
//	};
//	var TotalForTaxEight = 0;
//	var TotalForTaxTen = 0;
//	for(var k in taxType){
//		if(k == '8.0%'){
//			 TotalForTaxEight = taxType[k];//税率8%で税金総額
//		}else if(k == '10.0%'){
//			 TotalForTaxTen = taxType[k];//税率20%で税金総額
//		}
//	}
//	var total = ifZero( TotalForTaxEight + TotalForTaxTen);//合計(税込)
//	TotalForTaxEight = ifZero(TotalForTaxEight);
//	TotalForTaxTen = ifZero(TotalForTaxTen);
//	var str = '';
//	str += '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
//	'<pdf>'+
//	'<head>'+
//	'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
//	'<#if .locale == "zh_CN">'+
//	'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
//	'<#elseif .locale == "zh_TW">'+
//	'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
//	'<#elseif .locale == "ja_JP">'+
//	'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
//	'<#elseif .locale == "ko_KR">'+
//	'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
//	'<#elseif .locale == "th_TH">'+
//	'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
//	'</#if>'+
//	'<macrolist>'+
//	'<macro id="nlheader">'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr>'+
//	'<td style="width:104px;"></td>'+
//	'<td style="width:104px;"></td>'+
//	'<td style="width:102px;"></td>'+
//	'<td style="width:80px;"></td>'+
//	'<td style="width:102px;"></td>'+
//	'<td style="width:104px;"></td>'+
//	'<td style="width:104px;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	''+
//	'<td colspan="3" rowspan="2" align="center" style="margin-left:25px;border-bottom: 4px black solid;vertical-align:bottom;font-size: 32px;letter-spacing: 35px;line-height:10%;">&nbsp;納品書</td>'+
//	'<td></td>'+
//	'<td colspan="3" style="font-size: 12px;vertical-align:bottom">'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</td>'+
//	''+
//	'</tr>'+
//	'<tr>'+
//	''+
//	'<td></td>'+
//	'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.subShipaddressPhone+'／発注専用FAX：'+headValue.transactionFax+'</td>'+
//	''+
//	'</tr>'+
//	'<tr>'+
//	''+
//	'<td colspan="3"></td>'+
//	'<td></td>'+
//	'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.subShipaddressFax+'</td>'+
//	''+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="3"></td>'+
//	'<td></td>'+
//	'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
//	''+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="7" style="font-weight: 200;font-size:20px">&nbsp;&nbsp;納品書ご担当者様</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="font-weight: 200;font-size:20px" colspan="2"></td>'+
//	'<td colspan="5" style="font-weight: 200;font-size:20px"></td>'+
//	'</tr>'+
//	'<tr height="10px">'+
//	''+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="7" style="font-size: 12px; font-weight: bold;">平素は格別のお引き立て有難うございます。この度はご注文ありがとうございました。</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="7" style="font-size: 12px; font-weight: bold;border-bottom: 4px solid black;">下記の通り納品致しましたので、ご査収ください。 </td>'+
//	'</tr>'+
//	''+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
//	'<tr>'+
//	'<td style="width: 65px;"></td>'+
//	'<td style="width: 90px;"></td>'+
//	'<td style="width: 100px;"></td>'+
//	'<td style="width: 100px;"></td>'+
//	'<td style="width: 100px;"></td>'+
//	'<td style="width: 110px;"></td>'+
//	'<td style="width: 95px;"></td>'+
//	'</tr>'+
//	'<tr style="font-weight: 460;font-size: 13px;">'+
//	'<td>&nbsp;&nbsp;請求先：</td>'+
//	'<td>'+headValue.customerCode+'</td>'+
//	'<td colspan="4">'+headValue.companyName+'</td>'+
//	'<td align="center">I</td>'+
//	'</tr>'+
//	'<tr style="font-weight: 460;font-size: 13px;">'+
//	'<td></td>'+
//	'<td>〒 &nbsp;550-0002</td>'+
//	'<td colspan="5">'+headValue.custState+'&nbsp;&nbsp;&nbsp;'+headValue.billcity+headValue.custAddr1+headValue.custAddr2+headValue.custAddr3+'</td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr style="font-weight: 460;font-size: 13px;">'+
//	'<td style="width: 65px;border-bottom: 1px black solid;"></td>'+
//	'<td style="width: 50px;border-bottom: 1px black solid;">Tel</td>'+
//	'<td style="width: 110px;border-bottom: 1px black solid;">'+headValue.customePhone+'</td>'+
//	'<td style="width: 70px;border-bottom: 1px black solid;">Fax</td>'+
//	'<td colspan="3" style="border-bottom: 1px black solid;">'+headValue.customeFax+'</td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
//	''+
//	'<tr style="font-weight: 460;font-size: 13px;">'+
//	'<td style="width: 95px;border-top: 1px solid black;">&nbsp;&nbsp;請求書番号：</td>'+
//	'<td style="width: 95px;border-top: 1px solid black;">'+headValue.tranid+'</td>'+
//	'<td style="width: 60px;border-top: 1px solid black;"><span>森本</span><span style="margin-left: 15px;">06</span></td>'+
//	'<td width="60px" style="border-top: 1px solid black;">発行日：</td>'+
//	'<td width="120px" style="border-top: 1px solid black;">'+headValue.duedate+'</td>'+
//	'<td colspan="2" style="border-top: 1px solid black;">備考：'+headValue.duedate+'</td>'+
//	'</tr>'+
//	'<tr style="font-weight: 460;font-size: 13px;">'+
//	'<td>&nbsp;&nbsp;受注番号：</td>'+
//	'<td colspan="2">'+headValue.transactionnumber+'</td>'+
//	'<td>納品日：</td>'+
//	'<td>'+headValue.deliveryDate+'</td>'+
//	'<td colspan="2"></td>'+
//	'</tr>'+
//	'<tr style="font-weight: 460;font-size: 13px;">'+
//	'<td>&nbsp;&nbsp;御社発注番号:</td>'+
//	'<td colspan="2">'+headValue.otherrefnum+'</td>'+
//	'<td>納品先：</td>'+
//	'<td>'+headValue.deliveryCode+'</td>'+
//	'<td colspan="2">'+headValue.deliveryName+'</td>'+
//	'</tr>'+
//	'<tr style="font-weight: 460;font-size: 13px;">'+
//	'<td style="vertical-align:top;">&nbsp;&nbsp;支払条件：</td>'+
//	'<td colspan="2" style="vertical-align:top;">'+headValue.paymentPeriodMonths+'</td>'+
//	'<td></td>'+
//	'<td style="vertical-align:top;">'+headValue.deliveryZip+'</td>'+
//	'<td colspan="2">'+headValue.deliveryPrefectures+'&nbsp;'+headValue.deliveryMunicipalities+headValue.deliveryPrefectures+headValue.deliveryResidence+headValue.deliveryResidence2+'<br/>'+headValue.deliveryName+'</td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr>'+
//	'<td width="8px"></td>'+
//	'<td width="90px"></td>'+
//	'<td width="15px"></td>'+
//	'<td width="125px"></td>'+
//	'<td width="125px"></td>'+
//	'<td width="60px"></td>'+
//	'<td width="65px"></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr style="font-weight: 400;font-size: 12px;">'+
//	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
//	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">明&nbsp;&nbsp;細</td>'+
//	'<td width="15px" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
//	'<td colspan="2" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
//	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
//	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">数量</td>'+
//	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">単価</td>'+
//	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">金額</td>'+
//	'</tr>'+
//	'</table>'+
//	'</macro>'+
//	'<macro id="nlfooter">'+
//	
//	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
//	'<tr heigth="8px">'+
//	'<td width="150px"></td>'+
//	'<td width="170px"></td>'+
//	'<td width="90px"></td>'+
//	'<td width="170px"></td>'+
//	'<td width="80px"></td>'+
//	'</tr>'+
//
//	'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
//	'<td width="150px" ></td>'+
//	'<td width="170px" style="border-top:1px solid black"></td>'+
//	'<td width="90px"  style="border-top:1px solid black;border-right:1px dotted black"></td>'+
//	'<td width="170px" style="border-top:1px solid black">合計</td>'+
//	'<td width="80px"  style="border-top:1px solid black">'+amountTotalFormat+'</td>'+
//	'</tr>'+
//	
//	'<tr heigth="8px">'+
//	'<td width="150px"></td>'+
//	'<td width="170px"></td>'+
//	'<td width="90px"></td>'+
//	'<td width="170px"></td>'+
//	'<td width="80px"></td>'+
//	'</tr>'+
//
//	'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
//	'<td width="250px"></td>'+
//	'<td width="150px">8% 対象合計(税込)</td>'+
//	'<td width="70px"  style="border-right:1px dotted black">'+TotalForTaxEight+'</td>'+
//	'<td width="80px">消費税</td>'+
//	'<td width="50px">'+ifZero(taxTotal)+'</td>'+
//	'</tr>'+
//
//	'<tr heigth="8px">'+
//	'<td width="150px"></td>'+
//	'<td width="170px"></td>'+
//	'<td width="90px"></td>'+
//	'<td width="170px"></td>'+
//	'<td width="80px"></td>'+
//	'</tr>'+
//
//	'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
//	'<td width="250px" style="border-bottom:4px solid black">&nbsp;&nbsp;※軽減税率対象</td>'+
//	'<td width="150px" style="border-bottom:4px solid black">10%対象合計(税込)</td>'+
//	'<td width="70px"  style="border-bottom:4px solid black;border-right:1px dotted black">'+TotalForTaxTen+'</td>'+
//	'<td width="80px"  style="border-bottom:4px solid black">合計(税込)￥</td>'+
//	'<td width="50px"  style="border-bottom:4px solid black">'+total+'</td>'+
//	'</tr>'+
//	
//	'<tr style="height:10px">'+
//	''+
//	'</tr>'+
//	'<tr style="font-weight: bold;font-size: 15px;">'+
//	'<td colspan="5" align="center">'+shippingdeliverynotice+'</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="5"></td>'+
//	'</tr>'+
//	'<tr style="font-weight: bold;font-size: 15px;">'+
//	'<td colspan="5" align="center">***** 全<totalpages/>ページ：<pagenumber/>*****</td>'+
//	'</tr>'+
//	'</table>'+
//	'</macro>'+
//	'</macrolist>'+
//	'<style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
//	'<#if .locale == "zh_CN">'+
//	'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
//	'<#elseif .locale == "zh_TW">'+
//	'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
//	'<#elseif .locale == "ja_JP">'+
//	'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
//	'<#elseif .locale == "ko_KR">'+
//	'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
//	'<#elseif .locale == "th_TH">'+
//	'font-family: NotoSans, NotoSansThai, sans-serif;'+
//	'<#else>'+
//	'font-family: NotoSans, sans-serif;'+
//	'</#if>'+
//	'}'+
//	'</style>'+
//	'</head>';
//	str+='<body header="nlheader" header-height="30%" footer="nlfooter" footer-height="28%" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';
//	str+=
//		'<table>'+
//		'<tr>'+
//		'<td width="8px"></td>'+
//		'<td width="90px"></td>'+
//		'<td width="15px"></td>'+
//		'<td width="125px"></td>'+
//		'<td width="125px"></td>'+
//		'<td width="60px"></td>'+
//		'<td width="65px"></td>'+
//		'<td></td>'+
//		'<td></td>'+
//		'</tr>';
//		for(var k = 0 ; k < itemDetails.length;k++){
//			nlapiLogExecution('debug','start',itemDetails[k].displayname)
//			str += '<tr style="font-weight: bold;font-size: 12px;height:40px">'+
//			'<td></td>'+
//			'<td style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
//			'<td width="15px"></td>'+
//			'<td colspan="2" style="vertical-align: top;">'+itemDetails[k].displayname+'</td>'+
//			'<td style="vertical-align: top;" align="center">※</td>'+
//			'<td style="vertical-align: top;">'+itemDetails[k].quantity+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
//			'<td style="vertical-align: top;" align="center">'+itemDetails[k].origrate+'</td>'+
//			'<td style="vertical-align: top;" align="center">'+itemDetails[k].amount+'</td>'+
//			'</tr>'+
//			'<tr style="font-weight: bold;font-size: 10px;height:20px">'+
//			'<td></td>'+
//			'<td style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
//			'<td width="15px"></td>'+
//			'<td></td>'+
//			'<td></td>'+
//			'<td></td>'+
//			'<td></td>'+
//			'<td></td>'+
//			'</tr>';
//		}
//		
//		str+='</table>';
//		
//	str += '</body></pdf>';
//	var renderer = nlapiCreateTemplateRenderer();
//	  renderer.setTemplate(str);
//	  var xml = renderer.renderToString();
//	  var xlsFile = nlapiXMLToPDF(xml);
//	  
//	  // PDF
//	  xlsFile.setName(fileName  + '.pdf');
//	  xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
//	  xlsFile.setIsOnline(true);
//	  nlapiLogExecution('debug','start','クレジットメモ 価格入り納品書  PDF making end')
//	  // save file
//	  var fileID = nlapiSubmitFile(xlsFile);
//	  return fileID;

// }

function creditmemoDeliveryPDF(id, custform, fileName) {

    var creditmemoid = id;//invoice
    var creditmemoRecord = nlapiLoadRecord("creditmemo", creditmemoid)
    // バリエーション支援 20230803 add by zdj start
    var tmpLocationDic = getLocations(creditmemoRecord);
		// バリエーション支援 20230803 add by zdj end
		var salesrepSearchColumn =  new nlobjSearchColumn("salesrep");//顧客(For retrieval)
		var subsidiarySearchColumn = new nlobjSearchColumn("subsidiary");//連結子会社 (For retrieval)
		var entitySearchColumn =  new nlobjSearchColumn("entity");//顧客(For retrieval)
		var tranidSearchColumn = new nlobjSearchColumn("tranid");//請求書番号
		var memoSearchColumn = new nlobjSearchColumn("custbody_djkk_deliverynotememo");//memo
		var otherrefnumSearchColumn =  new nlobjSearchColumn("otherrefnum");//御社発注番号
		// バリエーション支援 20230803 update by zdj start
		//var transactionnumberSearchColumn = new nlobjSearchColumn("transactionnumber");//受注番号(maybe not true)
		var transactionnumberSearchColumn = new nlobjSearchColumn("custbody_djkk_exsystem_tranid");//DJ_外部システム連携_注文番号
		// バリエーション支援 20230803 update by zdj start
		var deliveryCodeSearchColumn =  new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先コード
		var deliveryNameSearchColumn = new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先名前
		var deliveryZipSearchColumn = new nlobjSearchColumn("custrecord_djkk_zip","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_郵便番号
		var deliveryPrefecturesSearchColumn = new nlobjSearchColumn("custrecord_djkk_prefectures","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_都道府県
		var deliveryMunicipalitiesSearchColumn = new nlobjSearchColumn("custrecord_djkk_municipalities","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_市区町村
		var deliveryResidenceSearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所1
	      // add by zzq CH653 20230619 start
//      var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所2
        var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_lable","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所2
        var deliveryResidence3SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所3
        // add by zzq CH653 20230619 end
		var deliveryDateSearchColumn = new nlobjSearchColumn("custbody_djkk_delivery_date");//DJ_納品日
		// add by zzq CH600 20230612 start
        var deliverySearchColumn =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//DJ_納品先
        // add by zzq CH600 20230612 end
		var column = [
		              salesrepSearchColumn,
				      memoSearchColumn,
		              subsidiarySearchColumn,
		              entitySearchColumn,
		              tranidSearchColumn,
		              otherrefnumSearchColumn,
		              transactionnumberSearchColumn,
		              deliveryCodeSearchColumn,
		              deliveryNameSearchColumn,
		              deliveryZipSearchColumn,
		              deliveryPrefecturesSearchColumn,
		              deliveryMunicipalitiesSearchColumn,
		              deliveryResidenceSearchColumn,
		              deliveryResidence2SearchColumn,
	                  // add by zzq CH653 20230619 start
	                  deliveryResidence3SearchColumn,
	                  // add by zzq CH653 20230619 end
		              deliveryDateSearchColumn,
	                    // add by zzq CH600 20230612 start
	                    deliverySearchColumn
	                    // add by zzq CH600 20230612 end
		             ]
		var creditmemoSearch = nlapiSearchRecord("creditmemo",null,
				[
	//			   ["type","anyof","CustInvc"],
	//			   "AND",
				   ["internalid","anyof",creditmemoid]
				], 
				column
				);
		var subsidiary = defaultEmpty(creditmemoSearch[0].getValue(subsidiarySearchColumn));//連結子会社internalid (For retrieval)
		// add by zhou 20230602 CH601 start
		var memo = defaultEmpty(creditmemoSearch[0].getValue(memoSearchColumn));//メモ
		// add by zhou 20230602 CH601 end
		nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)	
		var subsidiaryrSearch = nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",subsidiary]
				], 
				[
				 	new nlobjSearchColumn("legalname"),//連結正式名称
				 	new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),//連結DJ_会社名前英語
				 	new nlobjSearchColumn("fax"),//発注専用FAX
//				 	new nlobjSearchColumn("phone"), //連結TEL?????
				 	new nlobjSearchColumn("custrecord_djkk_address_fax","Address",null), //連結FAX
				    new nlobjSearchColumn("phone","Address",null),//連結TEL
				 	new nlobjSearchColumn("custrecord_djkk_shippingdeliverynotice"),//DJ_出荷案内・価格入り納品書出力用お知らせ文言
	                //CH655 20230725 add by zdj start
                    new nlobjSearchColumn("phone","shippingAddress",null),//配送先phone
                    new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//配送先fax
                    //CH655 20230725 add by zdj end
				]
				);
		var legalName = defaultEmpty(subsidiaryrSearch[0].getValue("legalname"));//連結正式名称
		var EnglishName = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_subsidiary_en"));//連結DJ_会社名前英語
		var Fax = 'FAX: ' + defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","Address",null));//連結FAX
		var phone = 'TEL: ' + defaultEmpty(subsidiaryrSearch[0].getValue("phone","Address",null));//連結TEL	
		var transactionFax = defaultEmpty(subsidiaryrSearch[0].getValue("fax"));//発注専用FAX
		var shippingdeliverynotice = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_shippingdeliverynotice"));//DJ_出荷案内・価格入り納品書出力用お知らせ文言
		//CH655 20230725 add by zdj start
        var shipaddressPhone= 'TEL: ' + defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("phone","shippingAddress",null));//配送先phone
        var shipaddressFax= defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","shippingAddress",null));//配送先fax
        //CH655 20230725 add by zdj end
		
		var entity = defaultEmpty(creditmemoSearch[0].getValue(entitySearchColumn));//顧客internalid(For retrieval)	
		nlapiLogExecution('DEBUG', 'entity', entity)
		var customerSearch = nlapiSearchRecord("customer",null,
				[
				   ["internalid","anyof",entity]
				], 
				[	
//				 	new nlobjSearchColumn("billcity"),//市区
				 	new nlobjSearchColumn("city"),//市区
				 	new nlobjSearchColumn("companyname"),//名前
				 	new nlobjSearchColumn("custentity_djkk_exsystem_phone_text"),//顧客TEL
//				 	new nlobjSearchColumn("fax"),//fax
				 	new nlobjSearchColumn("custentity_djkk_exsystem_fax_text"),//fax
				 	new nlobjSearchColumn("entityid"),//顧客code
				 	new nlobjSearchColumn("custentity_djkk_customer_payment"),//支払条件
				 	new nlobjSearchColumn("zipcode","Address",null),
				 	new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//
				 	new nlobjSearchColumn("address1","Address",null),//
				 	new nlobjSearchColumn("address2","Address",null),//
				 	new nlobjSearchColumn("address3","Address",null),//
				 	new nlobjSearchColumn("addressee","Address",null),//	
				 	//add by zzq CH690 20230627 start
				 	new nlobjSearchColumn("currency"),//顧客基本通貨 
					//add by zzq CH690 20230627 end
				 	// バリエーション支援 20230803 add by zdj start
				 	new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_顧客支払条件
		    	    new nlobjSearchColumn("terms"), //支払い条件
		    	    new nlobjSearchColumn("custentity_djkk_delivery_book_subname"), //DJ_価格入り納品書送信先会社名(3RDパーティー)
		    	    new nlobjSearchColumn("custentity_djkk_delivery_book_person_t") //DJ_価格入り納品書送信先担当者(3RDパーティー)
				 	// バリエーション支援 20230803 add by zdj end
				]
				);
		
		var customerRecord=nlapiLoadRecord('customer', entity);
		//20230728 add by zdj start
        var paymentPeriodMonths = defaultEmpty(customerRecord.getLineItemValue("recmachcustrecord_suitel10n_jp_pt_customer","custrecord_suitel10n_jp_pt_paym_due_mo_display",1));//支払期限月
        var customePhone = customerRecord.getLineItemValue("addressbook","phone",1);//p
        //20230728 add by zdj end
	if(!isEmpty(customerSearch)){
		// バリエーション支援 20230803 update by zdj start
		var companyName1 = defaultEmpty(customerSearch[0].getValue("companyname"));//顧客名
		var companyNameCustomer = defaultEmpty(customerSearch[0].getValue("companyname"));//DJ_価格入り納品書送信先会社名(3RDパーティー)
		var personCustomer = defaultEmpty(customerSearch[0].getValue("custentity_djkk_delivery_book_person_t"));//DJ_価格入り納品書送信先担当者(3RDパーティー)
		// バリエーション支援 20230803 update by zdj end
		var billcity = defaultEmpty(customerSearch[0].getValue("city"));//市区
		var customerCode = defaultEmpty(customerSearch[0].getValue("entityid"));//顧客code
//		var customeFax = defaultEmpty(customerSearch[0].getValue("fax"));//顧客FAX
		var customeFax = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_fax_text"));//顧客FAX
		var customePhone = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_phone_text"));//顧客TEL
	    var custZipCode = defaultEmpty(customerSearch[0].getValue("zipcode","Address",null));//顧客郵便
	    // バリエーション支援 20230803 add by zdj start
	    var customerPayment = defaultEmpty(customerSearch[0].getText("custentity_djkk_customer_payment"));
		var customerTerms = defaultEmpty(customerSearch[0].getText("terms"));
		var paymentPeriodMonths = '';
		if(customerTerms){
            var tmpVal = customerTerms.split("/")[0];
            if (tmpVal) {
            	paymentPeriodMonths = tmpVal;
            }else {
            	paymentPeriodMonths = '';
            }
        } else if(customerPayment){
           var tmpVal = customerPayment.split("/")[0];
           if (tmpVal) {
        	   paymentPeriodMonths = tmpVal;
           }else {
        	   paymentPeriodMonths = '';
           }
        }    
		// バリエーション支援 20230803 add by zdj end
		if(custZipCode && custZipCode.substring(0,1) != '〒'){
			custZipCode = '〒' + custZipCode;
		}else{
			custZipCode = '';
		}
		//add by zzq CH690 20230627 start
		var custcurrency = defaultEmpty(customerSearch[0].getValue("currency"));////顧客基本通貨
		//add by zzq CH690 20230627 end
		var custState = defaultEmpty(customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//顧客都道府県
		var custAddr1 = defaultEmpty(customerSearch[0].getValue("address1","Address",null));//顧客住所１
		var custAddr2 = defaultEmpty(customerSearch[0].getValue("address2","Address",null));//顧客住所２
		var custAddr3 = defaultEmpty(customerSearch[0].getValue("address3","Address",null));//顧客住所3
		var custAddressee = defaultEmpty(customerSearch[0].getValue("addressee","Address",null));//顧客宛先
		var paymentPeriod =  defaultEmpty(customerSearch[0].getText("custentity_djkk_customer_payment"));//支払条件
	}
	nlapiLogExecution('DEBUG', '2')
	nlapiLogExecution('DEBUG', 'paymentPeriod',paymentPeriod)

//		var memo =  defaultEmpty(creditmemoSearch[0].getValue(memo));//memo
		var salesrep =  defaultEmpty(creditmemoSearch[0].getText(salesrepSearchColumn));//営業担当者
		var tranid = defaultEmpty(creditmemoSearch[0].getValue(tranidSearchColumn));//請求書番号
		var otherrefnum = defaultEmpty(creditmemoSearch[0].getValue(otherrefnumSearchColumn));//御社発注番号
		var transactionnumber = defaultEmpty(creditmemoSearch[0].getValue(transactionnumberSearchColumn));//受注番号(maybe not true)
		if(isEmpty(transactionnumber)){
			transactionnumber = '';
		}
		var deliveryCode = defaultEmpty(creditmemoSearch[0].getValue(deliveryCodeSearchColumn));//DJ_納品先 : DJ_納品先コード
		// add by CH600 20230612 start
        var deliveryId = defaultEmpty(creditmemoSearch[0].getValue(deliverySearchColumn));//DJ_納品先
        nlapiLogExecution('DEBUG', 'deliveryId', deliveryId);
        
        var letter01 = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_site_fd')); //DJ_価格入り納品書送信先区分
        nlapiLogExecution('debug', 'letter01', letter01);
        var letter02 = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_fax_three')); //DJ_価格入り納品書送信先FAX(3RDパーティー)
        nlapiLogExecution('debug', 'letter02', letter02);
        var companyNameInvo = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_subname'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
     // CH807 add by zzq 20230815 start
        var personInvo = '納品書ご担当者様'; 
        var person_3rd = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
        var person = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_book_person'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
        if(letter01){
            if(letter01 == '14'){
                personInvo = person_3rd;
            }else{
                if(person){
                    personInvo = person;
                }
            }
        }
        // CH807 add by zzq 20230815 end
        
        var deliveryCodeFax = '';
        var companyNameDelivery = '';
        if(!isEmpty(deliveryId)){
//            deliveryCodeFax = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_fax'));
            var deliveryFax = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_fax'))
            // バリエーション支援 20230803 update by zdj start
            companyNameDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecorddjkk_name'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
            var personDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_delivery_book_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
            // バリエーション支援 20230803 update by zdj end
        }
     // バリエーション支援 20230803 add by zdj start
        var companyName = '';
     // バリエーション支援 20230803 add by zdj end
        if(letter01){
        if(letter01 == '14'){   //3rdパーティー
        	// バリエーション支援 20230803 add by zdj start
            var companyName = companyNameInvo + ' ' + personInvo;
         // バリエーション支援 20230803 add by zdj end
            if(letter02){
               deliveryCodeFax = letter02;
            }
        }else if(letter01 == '15'){  //納品先
        	// バリエーション支援 20230803 add by zdj start
//            var companyName = companyNameDelivery + ' ' + '納品書ご担当者様';
            var companyName = companyNameDelivery + ' ' + personInvo;
            // バリエーション支援 20230803 add by zdj end
            if(deliveryId && !isEmpty(deliveryFax)){
               deliveryCodeFax = deliveryFax;
            }
        }else if(letter01 == '16'){  //顧客先
        	// バリエーション支援 20230803 add by zdj start
//            var companyName = companyNameCustomer + ' ' + '納品書ご担当者様';
            var companyName = companyNameCustomer + ' ' + personInvo;
         // バリエーション支援 20230803 add by zdj end
            if(customeFax){
                deliveryCodeFax = customeFax;
          }
         }
        }else{
            if(customeFax){
                deliveryCodeFax = customeFax;   
            }
//            var companyName = companyNameCustomer + ' ' + '納品書ご担当者様';
            var companyName = companyNameCustomer + ' ' + personInvo;
        }
        //CH736　20230717 by zzq end
        // add by CH600 20230612 end
		var deliveryName = defaultEmpty(creditmemoSearch[0].getValue(deliveryNameSearchColumn));//DJ_納品先 : DJ_納品先名前
		var deliveryZip = defaultEmpty(creditmemoSearch[0].getValue(deliveryZipSearchColumn));//DJ_納品先 : DJ_郵便番号
		if(deliveryZip && deliveryZip.substring(0,1) != '〒'){
			deliveryZip = '〒' + deliveryZip;
		}else{
			deliveryZip = '';
		}
		var deliveryPrefectures = defaultEmpty(creditmemoSearch[0].getValue(deliveryPrefecturesSearchColumn));//DJ_納品先 : DJ_都道府県
		var deliveryMunicipalities = defaultEmpty(creditmemoSearch[0].getValue(deliveryMunicipalitiesSearchColumn));//DJ_納品先 : DJ_市区町村
		var deliveryResidence = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidenceSearchColumn));//DJ_納品先 : DJ_納品先住所1
		//add by zzq CH653 20230619 start
        var deliveryResidence2 = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_納品先 : DJ_納品先住所2
        var deliveryResidence3 = defaultEmpty(creditmemoSearch[0].getValue(deliveryResidence3SearchColumn));//DJ_納品先 : DJ_納品先住所3
        //add by zzq CH653 20230619 end
		var duedate = formatDate(new Date());//発行日
		var deliveryDate = defaultEmpty(creditmemoSearch[0].getValue(deliveryDateSearchColumn));//DJ_納品日
		
		//アイテム 
		var itemIdArray = [];
		var itemDetails = [];
		var amountTotal = 0;
		var taxTotal = 0;
		var taxType = {};
		nlapiLogExecution('DEBUG', '3')
		var Counts = creditmemoRecord.getLineItemCount('item');//アイテム明細部
		if(Counts != 0) {
			for(var s = 1; s <=  Counts; s++){
				//add by zzq CH690 20230627 start
				var item = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'item', s));//アイテムID
//				var quantity = defaultEmpty(parseInt(creditmemoRecord.getLineItemValue('item', 'quantity', s)));//数量
//				var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
//				var origrate = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'rate', s)));//単価
//				var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//				var amount = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'amount', s)));//金額
//				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//				var taxAmount = defaultEmptyToZero(parseInt(creditmemoRecord.getLineItemValue('item', 'tax1amt', s)));//税額
//				var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
				
				var quantity = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item', 'quantity', s)));//数量
				var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
				
				var units_display = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'units_display', s));//単位
                if(!isEmpty(units_display)){
                    var unitsArray = units_display.split("/");
                    if(!isEmpty(unitsArray)){
                        units_display = unitsArray[0];
                    }
                }
				var origrate = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'rate', s)));//単価
//				var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				origrateFormat = formatAmount1(origrate);
				var amount = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'amount', s)));//金額
				var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				
				var taxRate = defaultEmpty(creditmemoRecord.getLineItemValue('item', 'taxrate1', s));//税率
					
				var taxAmount = defaultEmptyToZero(parseFloat(creditmemoRecord.getLineItemValue('item', 'tax1amt', s)));//税額
				var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				 //add by zzq CH690 20230627 end
				var itemSearch = nlapiSearchRecord("item",null,
						[
						   ["internalid","anyof",item]
						], 
						[
						   new nlobjSearchColumn("itemid"),						   
						   new nlobjSearchColumn("displayname"), 
						   new nlobjSearchColumn("custitem_djkk_product_code"),
						  //20230619 add by zzq CH653 start
                          new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), //配送料フラグ
                          //20230608 add by zzq CH653 end
						 //20230720 add by zzq CH735 start
                           new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_品名（日本語）LINE1
                           new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), //DJ_品名（日本語）LINE2
                           new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_品名（英語）LINE1
                           new nlobjSearchColumn("custitem_djkk_product_name_line2"), //DJ_品名（英語）LINE2
                           // バリエーション支援 20230803 add by zdj start
		                   new nlobjSearchColumn("custitem_djkk_product_code"), //カタログ製品コード
		                   // バリエーション支援 20230803 add by zdj end
                           new nlobjSearchColumn("type")// 種類
                           //20230720 add by zzq CH735 end
						]
						);	
                //20230720 add by zzq CH735 start
//              var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));
//              displayname = displayname.replace(new RegExp("&","g"),"&amp;")
                var invoiceItemType = defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("type")); //アイテムtype
                var itemDisplayName= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//商品名
                // バリエーション支援 20230803 add by zdj start
				var productCode= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("custitem_djkk_product_code"));//カタログ製品コード
				// バリエーション支援 20230803 add by zdj end
                var displayname = '';
                //add by zdj 20230802 start
				var itemNouhinBikou = creditmemoRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',s); //DJ_納品書備考
				//add by zdj 20230802 end
                 // アイテムは再販用その他の手数料
                if(invoiceItemType == 'OthCharge') {
                    displayname = othChargeDisplayname(itemDisplayName); // 手数料
                }else{
                    if (!isEmpty(itemSearch)) {
                        var jpName1 = itemSearch[0].getValue("custitem_djkk_product_name_jpline1");
                        var jpName2 = itemSearch[0].getValue("custitem_djkk_product_name_jpline2");
                            if (!isEmpty(jpName1) && !isEmpty(jpName2)) {
                                displayname = jpName1 + ' ' + jpName2;
                            } else if (!isEmpty(jpName1) && isEmpty(jpName2)) {
                                displayname = jpName1;
                            } else if (isEmpty(jpName1) && !isEmpty(jpName2)) {
                                displayname = jpName2;
                        }
                    }
                }
                //add by zdj 20230802 start
				if(displayname){
					if(itemNouhinBikou){
						displayname = displayname + '<br/>' + itemNouhinBikou;
					}
				}else {
					if(itemNouhinBikou){
						displayname = itemNouhinBikou;
					}
				}
				// バリエーション支援 20230803 add by zdj start
				var itemLocId = defaultEmpty(creditmemoRecord.getLineItemValue('item','location',s)); // 場所
		        var locBarCode = '';
		        if (itemLocId) {
		            var tmpDicBarCode = tmpLocationDic[itemLocId];
		            if (tmpDicBarCode) {
		                locBarCode = tmpDicBarCode;
		            }
		        }
		        var itemid = '';
		        if(!isEmpty(productCode) && !isEmpty(locBarCode)){
		        	itemid = productCode + ' ' + locBarCode;
                }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
                	itemid = locBarCode;
                }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
                	itemid = productCode;
                }else{
                	itemid = ' ';
                }
		        // バリエーション支援 20230803 add by zdj end
				//add by zdj 20230802 end
                //20230720 add by zzq CH735 end
				var productCode = defaultEmpty(itemSearch[0].getValue('custitem_djkk_product_code'));//DJ_カタログ製品コード
				displayname = displayname.replace(new RegExp("&","g"),"&amp;")
				//var itemid = defaultEmpty(itemSearch[0].getValue('itemid'));
				//20230619 add by zzq CH653 start
                var deliverychargeFlg = defaultEmpty(itemSearch[0].getValue('custitem_djkk_deliverycharge_flg'));
                //20230608 add by zzq CH653 end
				amountTotal += amount;
				taxTotal += taxAmount;
				
				var taxRateData = taxType[taxRate] || 0;
				taxType[taxRate] = taxRateData + taxAmount + amount;
				//20230720 add by zzq CH735 start
                if(!(amount == 0 && deliverychargeFlg == 'T')){
                    //add by zzq CH690 20230627 start
                    if(custcurrency == 1){
                       itemDetails.push({
                       item : item,// アイテムID
                       units_display : units_display,// 単位
//                       amount : defaultEmptyToZero1(amount),// 金額
                       amount : formatAmount1(amount),// 金額
                       quantity : quantity,// 数量
//                       origrate : defaultEmptyToZero1(origrate),// 単価
                       origrate : formatAmount1(origrate),// 単価
                       displayname:displayname,// 商品d名
                       itemid:itemid,// 商品code
                       productCode:productCode,//商品code
                       // add by zzq CH653 20230618 start
                       deliverychargeFlg:deliverychargeFlg// 配送料フラグ
                       // add by zzq CH653 20230618 end
                       });
                       
                }else{
                       itemDetails.push({
                       item : item,// アイテムID
                       units_display : units_display,// 単位
                       amount : amountFormat,// 金額
                       quantity : quantityFormat,// 数量
                       origrate : origrateFormat,// 単価
                       displayname:displayname,// 商品d名
                       itemid:itemid,// 商品code
                       productCode:productCode,//商品code
                       // add by zzq CH653 20230618 start
                       deliverychargeFlg:deliverychargeFlg// 配送料フラグ
                       // add by zzq CH653 20230618 end
                      });
                   }
                }
              //20230720 add by zzq CH735 end
				 nlapiLogExecution('debug', 'origrate', origrate);
				//add by zzq CH690 20230627 end				
				
//				itemDetails.push({
//					  item : item,//アイテムID
//					  units_display : units_display,//単位
//					  amount : parseInt(amountFormat),//金額
//					  quantity : parseInt(quantityFormat),//数量
//					  origrate : parseInt(origrate),//単価
//					  displayname:displayname,//商品d名
//					  productCode:productCode,//商品code
//					  itemid:itemid,//商品code
//					  //20230619 add by zzq CH653 start
//					  deliverychargeFlg:deliverychargeFlg
//					  //20230608 add by zzq CH653 end
//				});
			}
		}
		//add by zzq CH690 20230627 start
		var amountTotalFormat = '';
		if(custcurrency == 1){
			amountTotalFormat = ifZero(Number(defaultEmptyToZero1(amountTotal)));
		}else{
			amountTotalFormat = ifZero(amountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
		}
		
		var taxTotalFormat = '';
		if(custcurrency == 1){
			taxTotalFormat = defaultEmptyToZero1(taxTotal);
		}else{
			taxTotalFormat = (taxTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		}
//		add by zzq CH690 20230627 end
//		var amountTotalFormat = ifZero(parseInt(amountTotal));
		var headValue  = {
		salesrep:salesrep,//営業担当者
		legalName:legalName,//連結正式名称
		EnglishName:EnglishName,//連結DJ_会社名前英語
		transactionFax:transactionFax,//発注専用FAX
		shipaddressPhone:shipaddressPhone,//配送先phone
		shipaddressFax:shipaddressFax,//配送先fax
		phone:phone,//連結TEL
		Fax:Fax,//連結FAX
		//20230728 add by zdj start
		paymentPeriodMonths:paymentPeriodMonths,//支払期限月
		//20230728 add by zdj end
		paymentPeriod:paymentPeriod,//DJ_顧客支払条件
		companyName :companyName,//顧客名
		companyName1 : companyName1,
		customeFax:customeFax,//顧客FAX
		billcity:billcity,//市区
		customerCode:customerCode,//顧客codeNum
		customePhone:customePhone,//顧客TEL
	    custZipCode :custZipCode,//顧客郵便
		custState:custState,//顧客都道府県
		custAddr1:custAddr1,//顧客住所１
		custAddr2:custAddr2,//顧客住所２
		custAddr3:custAddr3,//顧客住所3
		custAddressee:custAddressee,//顧客宛先
		tranid:tranid,//請求書番号
		otherrefnum:otherrefnum,//御社発注番号
		transactionnumber:transactionnumber,//受注番号(maybe not true)
		deliveryCode:deliveryCode,//DJ_納品先 : DJ_納品先コード
		deliveryName :deliveryName,//DJ_納品先 : DJ_納品先名前
		deliveryZip:deliveryZip,//DJ_納品先 : DJ_郵便番号
		deliveryPrefectures :deliveryPrefectures,//DJ_納品先 : DJ_都道府県
		deliveryMunicipalities: deliveryMunicipalities,//DJ_納品先 : DJ_市区町村
		deliveryResidence:deliveryResidence,//DJ_納品先 : DJ_納品先住所1
		deliveryResidence2 :deliveryResidence2,//DJ_納品先 : DJ_納品先住所2
		//add by zzq CH653 20230619 start
        deliveryResidence3 :deliveryResidence3,//DJ_納品先 : DJ_納品先住所3
        //add by zzq CH653 20230619 end
		duedate:duedate,//発行日
		deliveryDate:deliveryDate,//DJ_納品日
		// add by zhou 20230602 CH601 start
		memo:memo,//メモ
		// add by zhou 20230602 CH601 end
		// add by zzq 20230612 CH600 start
        deliveryCodeFax : deliveryCodeFax,
        //add by zzq 20230612 CH600 end
        // add by zdj 20230728 start
        deliveryCode : deliveryCode  //DJ_納品先 : DJ_納品先コード
        //add by zdj 20230728 end
		};
		var TotalForTaxEight = 0;
		var TotalForTaxTen = 0;
		for(var k in taxType){
			if(k == '8.0%'){
				 TotalForTaxEight = taxType[k];//税率8%で税金総額
			}else if(k == '10.0%'){
				 TotalForTaxTen = taxType[k];//税率20%で税金総額
			}
		}
//		var total = TotalForTaxEight + TotalForTaxTen;//合計(税込)
//		TotalForTaxEight = ifZero(parseInt(TotalForTaxEight));
//		TotalForTaxTen = ifZero(parseInt(TotalForTaxTen));
		//add by zzq CH690 20230627 start
		var total = '';
		if(custcurrency == 1){
//			total =  defaultEmptyToZero1((TotalForTaxEight + TotalForTaxTen));
			total =  defaultEmptyToZero1((amountTotal + taxTotal));
			TotalForTaxEight = defaultEmptyToZero1(TotalForTaxEight);
			TotalForTaxTen = defaultEmptyToZero1(TotalForTaxTen)
		}else{
			nlapiLogExecution('debug', 'total', TotalForTaxEight + TotalForTaxTen);
//			total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
			total = ( amountTotal + taxTotal ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
			TotalForTaxEight = TotalForTaxEight.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			TotalForTaxTen = TotalForTaxTen.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		}
		//add by zzq CH690 20230627 end
		//20230728 by zdj start
		
		//20230728 by zdj end
		var str = '';
		str += '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
		'<pdf>'+
		'<head>'+
		'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
		'<#if .locale == "zh_CN">'+
		'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
		'<#elseif .locale == "zh_TW">'+
		'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
		'<#elseif .locale == "ja_JP">'+
		'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
		'<#elseif .locale == "ko_KR">'+
		'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
		'<#elseif .locale == "th_TH">'+
		'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
		'</#if>'+
		'<macrolist>'+
		'<macro id="nlheader">'+
		'<table border="0" cellspacing="0" cellpadding="0" width="660px" align="center">'+
		'<tr>'+
		'<td style="width:104px;"></td>'+
		'<td style="width:104px;"></td>'+
		'<td style="width:102px;"></td>'+
		'<td style="width:80px;"></td>'+
		'<td style="width:102px;"></td>'+
		'<td style="width:104px;"></td>'+
		'<td style="width:104px;"></td>'+
		'</tr>'+
		'<tr>'+
		''+
		'<td colspan="3" rowspan="2" align="center" style="margin-left:25px;border-bottom: 4px black solid;vertical-align:bottom;font-size: 32px;letter-spacing: 35px;line-height:10%;">&nbsp;納品書</td>'+
		'<td></td>'+
		// update by zdj 20230802 start
		//'<td colspan="3" style="font-size: 12px;vertical-align:bottom">'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</td>'+
		'<td colspan="3"><span style="font-size: 11px;font-family: heiseimin; vertical-align:bottom" >'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</span></td>'+
		// update by zdj 20230802 end
		''+
		'</tr>'+
		'<tr>'+
		''+
		'<td></td>'+
		//CH655 20230725 add by zdj start
		// バリエーション支援 20230803 update by zdj start
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.phone+'／発注専用FAX：'+headValue.transactionFax+'</td>'+
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'／発注専用FAX：'+headValue.transactionFax+'</td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'／発注専用FAX：'+headValue.shipaddressFax+'</td>'+
		// バリエーション支援 20230803 update by zdj end
		//CH655 20230725 add by zdj end
		''+
		'</tr>'+
		'<tr style="height:12px">'+
		''+
		'<td colspan="3"></td>'+
		'<td></td>'+
		//CH655 20230725 add by zdj start
//		'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.Fax+'</td>'+
		// バリエーション支援 20230803 update by zdj start
		//'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.shipaddressFax+'</td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
		// バリエーション支援 20230803 update by zdj end
		//CH655 20230725 add by zdj end
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="3"></td>'+
		'<td></td>'+
		'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
		''+
		'</tr>'+
		'<tr>'+
		//add by zzq CH600 start
        '<td colspan="7" style="font-weight: 200;font-size:20px">'+dealFugou(headValue.companyName)+'</td>'+
        //add by zzq CH600 end
        '</tr>'+
        '<tr>'+
        //add by zzq CH600 start
        '<td style="font-weight: 200;font-size:20px">FAX:</td>'+
        '<td colspan="6" style="font-weight: 200;font-size:20px" align="left">'+headValue.deliveryCodeFax+'</td>'+
        //add by zzq CH600 end
		'</tr>'+
		'<tr height="10px">'+
		''+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;">平素は格別のお引き立て有難うございます。この度はご注文ありがとうございました。</td>'+
		'</tr>'+
		'<tr>'+
		'<td colspan="7" style="font-size: 12px; font-weight: bold;border-bottom: 4px solid black;">下記の通り納品致しましたので、ご査収ください。 </td>'+
		'</tr>'+
		''+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<tr>'+
		'<td style="width: 65px;"></td>'+
//		'<td style="width: 90px;"></td>'+
		'<td style="width: 110px;"></td>'+
		'<td style="width: 100px;"></td>'+
//		'<td style="width: 100px;"></td>'+
		'<td style="width: 90px;"></td>'+
		'<td style="width: 100px;"></td>'+
		'<td style="width: 110px;"></td>'+
		'<td style="width: 95px;"></td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;請求先：</td>'+
		//20230602 CH601 start
		//20230728 add zdj
		'<td>'+headValue.customerCode+'</td>'+
//		'<td colspan="5">'+dealFugou(headValue.companyName)+'</td>'+//changed by zhou 20230208
		'<td colspan="4">'+dealFugou(headValue.companyName1)+'</td>'+//changed by zhou 20230208
		//20230728 end zdj
		//20230602 CH601 end
//		'<td align="center">I</td>'+
		'<td align="center">&nbsp;</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td></td>'+
		'<td>〒 &nbsp;550-0002</td>'+
		//20230728 add zdj
//		'<td colspan="5">'+headValue.custState+'&nbsp;&nbsp;&nbsp;'+headValue.billcity+headValue.custAddr1+headValue.custAddr2+headValue.custAddr3+'</td>'+
		'<td colspan="5">'+headValue.custState+headValue.billcity+headValue.custAddr1+headValue.custAddr2+'</td>'+
		//20230728 end zdj
		'</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		//20230728 by zdj start
//		'<td style="width: 65px;border-bottom: 1px black solid;"></td>'+
//		'<td style="width: 50px;border-bottom: 1px black solid;">Tel</td>'+
//		'<td style="width: 110px;border-bottom: 1px black solid;">'+headValue.customePhone+'</td>'+
//		'<td style="width: 70px;border-bottom: 1px black solid;">Fax</td>'+
//		'<td colspan="3" style="border-bottom: 1px black solid;">'+headValue.customeFax+'</td>'+
		'<td style="width: 65px;border-bottom: 2px black solid;"></td>'+
        '<td style="width: 50px;border-bottom: 2px black solid;">Tel</td>'+
        '<td style="width: 110px;border-bottom: 2px black solid;">'+headValue.customePhone+'</td>'+
        '<td style="width: 70px;border-bottom: 2px black solid;">Fax</td>'+
        '<td colspan="3" style="border-bottom: 2px black solid;">'+headValue.customeFax+'</td>'+
		//20230728 by zdj end
		'</tr>'+
		'</table>'+
		//20230728 by zdj start
//		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px"  padding-top="4px">'+
		''+
//		'<tr style="font-weight: 460;font-size: 13px;">'+
//		'<td style="width: 95px;border-top: 1px solid black;">&nbsp;&nbsp;請求書番号：</td>'+
//		'<td style="width: 95px;border-top: 1px solid black;">'+headValue.transactionnumber+'</td>'+//20230208 changed by zhou 
//		'<td style="width: 60px;border-top: 1px solid black;"><span></span><span style="margin-left: 15px;"></span></td>'+//20230208 changed by zhou 
//		'<td width="60px" style="border-top: 1px solid black;">発行日：</td>'+
//		'<td width="120px" style="border-top: 1px solid black;">'+headValue.duedate+'</td>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
        '<td style="width: 90px;">&nbsp;&nbsp;請求書番号：</td>'+
//        '<td style="width: 100px;">'+headValue.transactionnumber+'</td>'+//20230208 changed by zhou 
        '<td style="width: 100px;">'+headValue.tranid+'</td>'+//20230208 changed by zhou 
//        '<td style="width: 60px;"><span></span><span style="margin-left: 15px;"></span></td>'+//20230208 changed by zhou 
        '<td style="width: 60px;"><span>森本</span><span style="margin-left: 15px;">06</span></td>'+//20230208 changed by zhou 
        // バリエーション支援 20230803 update by zdj start
        //'<td width="60px">発行日：</td>'+
        //'<td width="120px">'+headValue.duedate+'</td>'+
        '<td width="60px">納品日：</td>'+
        '<td width="120px">'+headValue.deliveryDate+'</td>'+
        // バリエーション支援 20230803 update by zdj end
		//20230728 by zdj end
		// add by zhou 20230602 CH601 start
//		'<td colspan="2" style="border-top: 1px solid black;">備考：'+headValue.duedate+'</td>'+
//		'<td colspan="2" style="border-top: 1px solid black; overflow: hidden;">備考：'+dealFugou(getStrLenSlice(headValue.memo, 14))+'</td>'+
        '<td colspan="2">備考：'+getStrLenSlice(dealFugou(headValue.memo, 14))+'</td>'+
		// add by zhou 20230602 CH601 end
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td>&nbsp;&nbsp;受注番号：</td>'+
		'<td colspan="2">'+headValue.transactionnumber+'</td>'+
		// バリエーション支援 20230803 update by zdj start
		//'<td>納品日：</td>'+
		//'<td>'+headValue.deliveryDate+'</td>'+
		'<td>納品先：</td>'+
		'<td>'+headValue.deliveryCode+'</td>'+
		//'<td colspan="2"></td>'+
		'<td colspan="2" rowspan="2">'+dealFugou(headValue.deliveryName)+'</td>'+
		// バリエーション支援 20230803 update by zdj end
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		//20230728 add by zdj start
//		'<td>&nbsp;&nbsp;御社発注番号:</td>'+
		'<td>&nbsp;&nbsp;御社発注番号</td>'+
		//20230728 add by zdj end
		'<td colspan="2">'+headValue.otherrefnum+'</td>'+
		// バリエーション支援 20230803 update by zdj start
		//'<td>納品先：</td>'+
		//'<td>'+headValue.deliveryCode+'</td>'+
		'<td colspan="2">&nbsp;</td>'+
		'</tr>'+
		'<tr style="font-weight: 460;font-size: 13px;">'+
		'<td style="vertical-align:top;">&nbsp;&nbsp;支払条件：</td>'+
		'<td colspan="2" style="vertical-align:top;">'+headValue.paymentPeriodMonths+'</td>'+
		'<td></td>'+
		'<td style="vertical-align:top;">'+headValue.deliveryZip+'</td>'+
		'<td colspan="2" rowspan="2">'+headValue.deliveryPrefectures+'&nbsp;'+headValue.deliveryMunicipalities+headValue.deliveryResidence+headValue.deliveryResidence2+headValue.deliveryResidence3+'</td>'+//20230208 changed by zhou
		'</tr>'+
        '<tr style="font-weight: 460;font-size: 13px;">'+
        '<td style="vertical-align:top;">&nbsp;</td>'+
        '<td colspan="2" style="vertical-align:top;">&nbsp;</td>'+
        '<td></td>'+
        '<td style="vertical-align:top;">&nbsp;</td>'+
        '</tr>'+
		'</table>'+
		'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
		'<tr>'+
		'<td width="8px"></td>'+
		'<td width="90px"></td>'+
		'<td width="15px"></td>'+
		'<td width="125px"></td>'+
		'<td width="125px"></td>'+
		'<td width="60px"></td>'+
		'<td width="65px"></td>'+
		'<td></td>'+
		'<td></td>'+
		'</tr>'+
		'<tr style="font-weight: 400;font-size: 12px;">'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">明&nbsp;&nbsp;細</td>'+
		'<td width="15px" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td colspan="2" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">数量</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">単価</td>'+
		'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">金額</td>'+
		'</tr>'+
		'</table>'+
		'</macro>'+
		'<macro id="nlfooter">'+
		
		'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		//20230728 by zdj start
//		'<td width="170px"></td>'+
		//20230728 by zdj start
		'<td width="150px"></td>'+
		//20230728 by zdj start
//		'<td width="80px"></td>'+
		'<td width="100px"></td>'+
		//20230728 by zdj end
		'</tr>'+
	
		//20230728 by zdj start
//		'<tr style="font-weight: bold;font-size: 13px;">'+
		'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
//		'<td width="150px" ></td>'+
		'<td width="250px" ></td>'+
//		'<td width="170px" style="border-top:1px solid black"></td>'+
		'<td width="150px" style="border-top:1px solid black"></td>'+
//		'<td width="90px"  style="border-top:1px solid black;border-right:1px dotted black"></td>'+
		'<td width="70px"  style="border-top:1px solid black;border-right:1px"></td>'+
//		'<td width="170px" style="border-top:1px solid black">合計</td>'+
		'<td width="80px"  style="border-top:1px solid black">合計</td>'+
//		'<td width="80px"  style="border-top:1px solid black" align="right">'+amountTotalFormat+'</td>'+
		'<td width="50px"  style="border-top:1px solid black" align="right">'+amountTotalFormat+'</td>'+
		//20230728 by zdj end
		'</tr>'+
		
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		'<td width="170px"></td>'+
		'<td width="80px"></td>'+
		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;">'+
		'<td width="250px">&nbsp;&nbsp;</td>'+//changed by zhou 20230209
		'<td width="150px">8% 対象合計(税込)</td>'+
		'<td width="70px"  style="border-right:1px solid black" align="right">'+ifZero(TotalForTaxEight)+'&nbsp;</td>'+
		'<td width="80px">消費税</td>'+
		'<td width="50px" align="right">'+ifZero(taxTotalFormat)+'</td>'+
		'</tr>'+
	
		'<tr heigth="8px">'+
		'<td width="150px"></td>'+
		'<td width="170px"></td>'+
		'<td width="90px"></td>'+
		'<td width="170px"></td>'+
		'<td width="80px"></td>'+
		'</tr>'+
	
		'<tr style="font-weight: bold;font-size: 13px;heigth:30px;">'+
		'<td width="250px" style="border-bottom:4px solid black">&nbsp;&nbsp;※軽減税率対象</td>'+//changed by zhou 20230209
		'<td width="150px" style="border-bottom:4px solid black">10%対象合計(税込)</td>'+
		'<td width="70px"  style="border-bottom:4px solid black;border-right:1px solid black" align="right">'+ifZero(TotalForTaxTen)+'&nbsp;</td>'+
		'<td width="80px"  style="border-bottom:4px solid black">合計(税込)</td>'+
		'<td width="50px"  style="border-bottom:4px solid black" align="right">'+'￥'+ifZero(total)+'</td>'+
		'</tr>'+
		
		'<tr style="height:10px">'+
		''+
		'</tr>'+
//		'<tr style="font-weight: bold;font-size: 15px;">'+
		'<tr style="font-weight: bold;font-size: 14px;">'+
		//update by zdj 20230802 start
		//'<td colspan="5" align="center">'+shippingdeliverynotice+'</td>'+
		'<td colspan="5"><span align="center" style="font-family: heiseimin;" >'+shippingdeliverynotice+'</span></td>'+
		//update by zdj 20230802 end
		'</tr>'+
		'<tr>'+
		'<td colspan="5"></td>'+
		'</tr>'+
		'<tr style="font-weight: bold;font-size: 15px;">'+
		'<td colspan="5" align="center">***** 全<totalpages/>ページ：<pagenumber/>*****</td>'+
		'</tr>'+
		'</table>'+
		'</macro>'+
		'</macrolist>'+
		'<style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
		'<#if .locale == "zh_CN">'+
		'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
		'<#elseif .locale == "zh_TW">'+
		'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
		'<#elseif .locale == "ja_JP">'+
		'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
		'<#elseif .locale == "ko_KR">'+
		'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
		'<#elseif .locale == "th_TH">'+
		'font-family: NotoSans, NotoSansThai, sans-serif;'+
		'<#else>'+
		'font-family: NotoSans, sans-serif;'+
		'</#if>'+
		'}'+
		'</style>'+
		'</head>';
		str+='<body header="nlheader" header-height="27%" footer="nlfooter" footer-height="14%" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';
		str+=
		    //20230728 add by zdj start
		    '<table padding-top="-2px">'
//			'<table>'+
//			'<tr >'+
//			'<td width="8px"></td>'+
//			'<td width="100px"></td>'+
//			'<td width="15px"></td>'+
//			'<td width="125px"></td>'+
//			'<td width="125px"></td>'+
////			'<td width="60px"></td>'+
//			'<td width="30px"></td>'+
//			'<td width="90px"></td>'+
//			'<td></td>'+
//			'<td></td>'+
//			'</tr>';
		    //20230728 add by zdj start
		    //20230728 add by zdj end
			for(var k = 0 ; k < itemDetails.length;k++){
				nlapiLogExecution('debug','start',itemDetails[k].displayname);
				//add by zzq ch653 20230619 start
				var taxCodeText = itemDetails.deliverychargeFlg == 'T' ? '' : '※';
				 var itemQuantity = itemDetails[k].quantity;
	                if(itemQuantity){
	                    itemQuantity = formatAmount1(itemDetails[k].quantity)
	                }
				//add by zzq ch653 20230619 end
	            //20230728 add by zdj start
	            str += '<tr style="font-weight: bold;font-size: 12px;height:20px"  margin-top="3px">'+
	            '<td width="8px"></td>'+
	            '<td width="100px" style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
	            '<td width="15px"></td>'+
	            '<td width="250px" colspan="2" style="vertical-align: top;">'+dealFugou(itemDetails[k].displayname)+'</td>'+
	            //'<td width="125px"></td>'+
	            '<td width="30px" style="vertical-align: top;" align="center">'+taxCodeText+'</td>'+
	            '<td width="90px" style="vertical-align: top;" align="right">'+ifZero(itemQuantity)+'&nbsp;&nbsp;'+itemDetails[k].units_display+'&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
	            '<td width="83px" style="vertical-align: top;" align="right">'+itemDetails[k].origrate+'</td>'+
	            '<td width="84px" style="vertical-align: top;" align="right">'+ifZero(itemDetails[k].amount)+'&nbsp;</td>'+
	            //20230728 add by zdj end
//				str += '<tr style="font-weight: bold;font-size: 12px;height:40px">'+
//				'<td></td>'+
//				'<td style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
////				'<td width="15px"></td>'+
//				'<td></td>'+
//				'<td colspan="2" style="vertical-align: top;">'+dealFugou(itemDetails[k].displayname)+'</td>'+
//				//add by zzq ch653 20230619 start
////				'<td style="vertical-align: top;" align="center">※</td>'+
//				'<td style="vertical-align: top;" align="center">'+taxCodeText+'</td>'+
//				//add by zzq ch653 20230619 end
////				'<td style="vertical-align: top;" align="right">'+ifZero(itemDetails[k].quantity)+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
//				'<td style="vertical-align: top;" align="right">'+ifZero(itemQuantity)+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
//				'<td style="vertical-align: top;" align="right">'+itemDetails[k].origrate+'</td>'+
//				'<td style="vertical-align: top;" align="right">'+ifZero(itemDetails[k].amount)+'&nbsp;</td>'+
				'</tr>';
//				'<tr style="font-weight: bold;font-size: 10px;height:20px">'+
//				'<td></td>'+
//				'<td style="vertical-align: top;">'+itemDetails[k].productCode+'</td>'+
//				'<td></td>'+
//				'<td></td>'+
//				'<td></td>'+
//				'<td></td>'+
//				'<td></td>'+
//				'<td></td>'+
//				'</tr>';
			}
			
			str+='</table>';
			
		str += '</body></pdf>';
    var renderer = nlapiCreateTemplateRenderer();
    renderer.setTemplate(str);
    var xml = renderer.renderToString();
    // test
    // var xlsFileo = nlapiCreateFile('納品' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);

    // xlsFileo.setFolder(109338);
    // nlapiSubmitFile(xlsFileo);
    var xlsFile = nlapiXMLToPDF(xml);

    // PDF
    //20230901 add by CH762 zzq start 
    var SAVE_FOLDER = DELIVERY_PDF_IN_CM_MAIL_DJ_DELIVERYPDF;
    if(subsidiary == SUB_NBKK){
        SAVE_FOLDER = DELIVERY_PDF_IN_CM_MAIL_DJ_DELIVERYPDF_NBKK;
    }else if(subsidiary == SUB_ULKK){
        SAVE_FOLDER = DELIVERY_PDF_IN_CM_MAIL_DJ_DELIVERYPDF_ULKK;
    }
   //20230901 add by CH762 zzq end 
    xlsFile.setName(fileName + '.pdf');
    xlsFile.setFolder(SAVE_FOLDER);
    xlsFile.setIsOnline(true);

    // save file
    var fileID = nlapiSubmitFile(xlsFile);
    return fileID;
}
//CH775 add by zdj 20230804 end

//CH775 add by zdj 20230804 start
function invoiceDeliveryPDF(id, custform, fileName) {
    var invoiceid = id;//invoice
    var salesrepSearchColumn =  new nlobjSearchColumn("salesrep");//顧客(For retrieval)
	var subsidiarySearchColumn = new nlobjSearchColumn("subsidiary");//連結子会社 (For retrieval)
	var entitySearchColumn =  new nlobjSearchColumn("entity");//顧客(For retrieval)
	var tranidSearchColumn = new nlobjSearchColumn("tranid");//請求書番号
	var tranNumberSearchColumn = new nlobjSearchColumn("transactionnumber");//請求書トランザクション番号
	var memoSearchColumn = new nlobjSearchColumn("custbody_djkk_deliverynotememo");//memo
	var paymentConditionsColumn = new nlobjSearchColumn("custbody_djkk_payment_conditions");//支払条件
	var otherrefnumSearchColumn =  new nlobjSearchColumn("otherrefnum");//御社発注番号
	// バリエーション支援 20230803 update by zdj start
	//var transactionnumberSearchColumn = new nlobjSearchColumn("transactionnumber","createdFrom",null);//受注番号(maybe not true)
	var transactionnumberSearchColumn = new nlobjSearchColumn("custbody_djkk_exsystem_tranid");//DJ_外部システム連携_注文番号
	// バリエーション支援 20230803 update by zdj end
	var deliveryCodeSearchColumn =  new nlobjSearchColumn("custrecord_djkk_delivery_code","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先コード
	// add by zzq CH600 20230612 start
	var deliverySearchColumn =  new nlobjSearchColumn("custbody_djkk_delivery_destination");//DJ_納品先
	// add by zzq CH600 20230612 end
	var deliveryNameSearchColumn = new nlobjSearchColumn("custrecorddjkk_name","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先名前
	var deliveryZipSearchColumn = new nlobjSearchColumn("custrecord_djkk_zip","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_郵便番号
	var deliveryPrefecturesSearchColumn = new nlobjSearchColumn("custrecord_djkk_prefectures","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_都道府県
	var deliveryMunicipalitiesSearchColumn = new nlobjSearchColumn("custrecord_djkk_municipalities","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_市区町村
	var deliveryResidenceSearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所1
	// add by zzq CH653 20230619 start
//	var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所2
	var deliveryResidence2SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_lable","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所2
	var deliveryResidence3SearchColumn = new nlobjSearchColumn("custrecord_djkk_delivery_residence2","CUSTBODY_DJKK_DELIVERY_DESTINATION",null);//DJ_納品先 : DJ_納品先住所3
	// add by zzq CH653 20230619 end
	var duedateSearchColumn = new nlobjSearchColumn("duedate");//発行日
	var deliveryDateSearchColumn = new nlobjSearchColumn("custbody_djkk_delivery_date");//DJ_納品日

	var column = [
				salesrepSearchColumn,
				memoSearchColumn,
				paymentConditionsColumn,
				subsidiarySearchColumn,
				entitySearchColumn,
				tranidSearchColumn,
				otherrefnumSearchColumn,
				transactionnumberSearchColumn,
				deliveryCodeSearchColumn,
				deliveryNameSearchColumn,
				deliveryZipSearchColumn,
				deliveryPrefecturesSearchColumn,
				deliveryMunicipalitiesSearchColumn,
				deliveryResidenceSearchColumn,
				deliveryResidence2SearchColumn,
				// add by zzq CH653 20230619 start
				deliveryResidence3SearchColumn,
				// add by zzq CH653 20230619 end
				deliveryDateSearchColumn,
				tranNumberSearchColumn,
				// add by zzq CH600 20230612 start
				deliverySearchColumn
				// add by zzq CH600 20230612 end
	             ]
	var invoiceSearch = nlapiSearchRecord("invoice",null,
			[
//			   ["type","anyof","CustInvc"],
//			   "AND",
			   ["internalid","anyof",invoiceid]
			], 
			column
			);
	var subsidiary = defaultEmpty(invoiceSearch[0].getValue(subsidiarySearchColumn));//連結子会社internalid (For retrieval)
	// add by zhou 20230602 CH601 start
	var memo = defaultEmpty(invoiceSearch[0].getValue(memoSearchColumn));//メモ
	// add by zhou 20230602 CH601 end
	nlapiLogExecution('DEBUG', 'subsidiary', subsidiary)	
	var subsidiaryrSearch = nlapiSearchRecord("subsidiary",null,
			[
			   ["internalid","anyof",subsidiary]
			], 
			[
			 	new nlobjSearchColumn("legalname"),//連結正式名称
			 	new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),//連結DJ_会社名前英語
			 	new nlobjSearchColumn("fax"),//発注専用FAX
//			 	new nlobjSearchColumn("phone"), //連結TEL?????
			 	new nlobjSearchColumn("custrecord_djkk_address_fax","Address",null), //連結FAX
			    new nlobjSearchColumn("phone","Address",null),//連結TEL
			 	new nlobjSearchColumn("custrecord_djkk_shippingdeliverynotice"),//DJ_出荷案内・価格入り納品書出力用お知らせ文言
                //CH655 20230725 add by zdj start
                new nlobjSearchColumn("phone","shippingAddress",null),//配送先phone
                new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//配送先fax
              //CH655 20230725 add by zdj end
			]
			);
	var legalName = defaultEmpty(subsidiaryrSearch[0].getValue("legalname"));//連結正式名称
	var EnglishName = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_subsidiary_en"));//連結DJ_会社名前英語
	var Fax = 'FAX: ' + defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","Address",null));//連結FAX
	nlapiLogExecution('DEBUG', 'FAX', Fax)
	var phone = 'TEL: ' + defaultEmpty(subsidiaryrSearch[0].getValue("phone","Address",null));//連結TEL	
	var transactionFax = defaultEmpty(subsidiaryrSearch[0].getValue("fax"));//発注専用FAX
	nlapiLogExecution('DEBUG', 'transactionFax', transactionFax)
	var shippingdeliverynotice = defaultEmpty(subsidiaryrSearch[0].getValue("custrecord_djkk_shippingdeliverynotice"));//DJ_出荷案内・価格入り納品書出力用お知らせ文言
    //CH655 20230725 add by zdj start
    var shipaddressPhone= 'TEL: ' + defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("phone","shippingAddress",null));//配送先phone
    var shipaddressFax= defaultEmpty(isEmpty(subsidiaryrSearch) ? '' :  subsidiaryrSearch[0].getValue("custrecord_djkk_address_fax","shippingAddress",null));//配送先fax
    //CH655 20230725 add by zdj end
	var entity = defaultEmpty(invoiceSearch[0].getValue(entitySearchColumn));//顧客internalid(For retrieval)	
	var customerSearch = nlapiSearchRecord("customer",null,
			[
			   ["internalid","anyof",entity]
			], 
			[	
			 	new nlobjSearchColumn("billcity"),//市区
			 	new nlobjSearchColumn("companyname"),//名前
//			 	new nlobjSearchColumn("phone"),//
//			 	new nlobjSearchColumn("fax"),//fax
			 	new nlobjSearchColumn("custentity_djkk_exsystem_fax_text"),//fax
			 	new nlobjSearchColumn("entityid"),//顧客code
			 	new nlobjSearchColumn("zipcode","Address",null),
			 	new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),//
			 	new nlobjSearchColumn("address1","Address",null),//
			 	new nlobjSearchColumn("address2","Address",null),//
			 	new nlobjSearchColumn("addressee","Address",null),//	
			 	// add by zhou 20230608 CH600 start
			 	new nlobjSearchColumn("custentity_djkk_exsystem_phone_text"),//顧客TEL
			    // add by zhou 20230608 CH600 end
			 	//add by zzq CH690 20230627 start
			 	new nlobjSearchColumn("currency"),//顧客基本通貨 
				//add by zzq CH690 20230627 end
			 	// バリエーション支援 20230803 add by zdj start
			 	new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_顧客支払条件
	    	    new nlobjSearchColumn("terms"), //支払い条件
	    	    new nlobjSearchColumn("custentity_djkk_delivery_book_subname"), //DJ_価格入り納品書送信先会社名(3RDパーティー)
	    	    new nlobjSearchColumn("custentity_djkk_delivery_book_person_t") //DJ_価格入り納品書送信先担当者(3RDパーティー)
			 	// バリエーション支援 20230803 add by zdj end
			]
			);
	var customerRecord=nlapiLoadRecord('customer', entity);
	//var paymentPeriodMonths = defaultEmpty(customerRecord.getLineItemValue("recmachcustrecord_suitel10n_jp_pt_customer","custrecord_suitel10n_jp_pt_paym_due_mo_display",1));//支払期限月
	var customePhone = customerRecord.getLineItemValue("addressbook","phone",1);//p
	if(customerSearch != null){
		// バリエーション支援 20230803 update by zdj start
		var companyName1 = defaultEmpty(customerSearch[0].getValue("companyname"));//顧客名
		var companyNameCustomer = defaultEmpty(customerSearch[0].getValue("companyname"));//DJ_価格入り納品書送信先会社名(3RDパーティー)
		var personCustomer = defaultEmpty(customerSearch[0].getValue("custentity_djkk_delivery_book_person_t"));//DJ_価格入り納品書送信先担当者(3RDパーティー)
		// バリエーション支援 20230803 update by zdj end
		var billcity = defaultEmpty(customerSearch[0].getValue("billcity"));//市区
		var customerCode = defaultEmpty(customerSearch[0].getValue("entityid"));//顧客code
//		var customeFax = defaultEmpty(customerSearch[0].getValue("fax"));//顧客FAX
		var customeFax = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_fax_text"));//顧客FAX
		nlapiLogExecution('DEBUG', 'customeFax', customeFax);
		// add by zhou 20230608 CH600 start
//		var customePhone = defaultEmpty(customerSearch[0].getValue("phone"));//顧客TEL
		var customePhone = defaultEmpty(customerSearch[0].getValue("custentity_djkk_exsystem_phone_text"));//顧客TEL
		// add by zhou 20230608 CH600 end
	    var custZipCode = defaultEmpty(customerSearch[0].getValue("zipcode","Address",null));//顧客郵便
	    // バリエーション支援 20230803 add by zdj start
	    var customerPayment = defaultEmpty(customerSearch[0].getText("custentity_djkk_customer_payment"));
		var customerTerms = defaultEmpty(customerSearch[0].getText("terms"));
		var paymentPeriodMonths = '';
		if(customerTerms){
            var tmpVal = customerTerms.split("/")[0];
            if (tmpVal) {
            	paymentPeriodMonths = tmpVal;
            }else {
            	paymentPeriodMonths = '';
            }
        } else if(customerPayment){
           var tmpVal = customerPayment.split("/")[0];
           if (tmpVal) {
        	   paymentPeriodMonths = tmpVal;
           }else {
        	   paymentPeriodMonths = '';
           }
        }    
		// バリエーション支援 20230803 add by zdj end
		if(custZipCode && custZipCode.substring(0,1) != '〒'){
			custZipCode = '〒' + custZipCode;
		}else{
			custZipCode = '';
		}
		//add by zzq CH690 20230627 start
		var custcurrency = defaultEmpty(customerSearch[0].getValue("currency"));////顧客基本通貨
		//add by zzq CH690 20230627 end
		var custState = defaultEmpty(customerSearch[0].getValue("custrecord_djkk_address_state","Address",null));//顧客都道府県
		var custAddr1 = defaultEmpty(customerSearch[0].getValue("address1","Address",null));//顧客住所１
		var custAddr2 = defaultEmpty(customerSearch[0].getValue("address2","Address",null));//顧客住所２
		var custAddr3 = defaultEmpty(customerSearch[0].getValue("address3","Address",null));//顧客住所3
		var custAddressee = defaultEmpty(customerSearch[0].getValue("addressee","Address",null));//顧客宛先
	}
	var tranid = defaultEmpty(invoiceSearch[0].getValue(tranidSearchColumn));//請求書番号
	var tranNumber = defaultEmpty(invoiceSearch[0].getValue(tranNumberSearchColumn));//請求書番号
	var salesrep =  defaultEmpty(invoiceSearch[0].getText(salesrepSearchColumn));//営業担当者
	var otherrefnum = defaultEmpty(invoiceSearch[0].getValue(otherrefnumSearchColumn));//御社発注番号
	var transactionnumber = defaultEmpty(invoiceSearch[0].getValue(transactionnumberSearchColumn));//受注番号(maybe not true)
	if(isEmpty(transactionnumber)){
		transactionnumber = '';
	}
	var deliveryCode = defaultEmpty(invoiceSearch[0].getValue(deliveryCodeSearchColumn));//DJ_納品先 : DJ_納品先コード
	// add by CH600 20230612 start
	var deliveryId = defaultEmpty(invoiceSearch[0].getValue(deliverySearchColumn));//DJ_納品先
	nlapiLogExecution('DEBUG', 'deliveryId', deliveryId);
	//CH736　20230717 by zzq start
	var invoiceRecord = nlapiLoadRecord('invoice',invoiceid);
	var letter01 = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_site_fd')); //DJ_価格入り納品書送信先区分
	nlapiLogExecution('debug', 'letter01', letter01);
	var letter02 = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_fax_three')); //DJ_価格入り納品書送信先FAX(3RDパーティー)
	nlapiLogExecution('debug', 'letter02', letter02);
	var companyNameInvo = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_subname'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
	 // CH807 add by zzq 20230815 start
    var personInvo = '納品書ご担当者様'; 
    var person_3rd = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
    var person = defaultEmpty(invoiceRecord.getFieldValue('custbody_djkk_delivery_book_person'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
    if(letter01){
        if(letter01 == '14'){
            personInvo = person_3rd;
        }else{
            if(person){
                personInvo = person;
            }
        }
    }
    // CH807 add by zzq 20230815 end
	
	var deliveryCodeFax = '';
	var companyNameDelivery = '';
    if(!isEmpty(deliveryId)){
//        deliveryCodeFax = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_fax'));
        var deliveryFax = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_fax'))
        // バリエーション支援 20230803 update by zdj start
        companyNameDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecorddjkk_name'));//DJ_価格入り納品書送信先会社名(3RDパーティー)
        var personDelivery = defaultEmpty(nlapiLookupField('customrecord_djkk_delivery_destination', deliveryId, 'custrecord_djkk_delivery_book_person_t'));//DJ_価格入り納品書送信先担当者(3RDパーティー)
        // バリエーション支援 20230803 update by zdj end
    }
 // バリエーション支援 20230803 add by zdj start
    var companyName = '';
 // バリエーション支援 20230803 add by zdj end
    if(letter01){
	if(letter01 == '14'){   //3rdパーティー
		// バリエーション支援 20230803 add by zdj start
		companyName = companyNameInvo + ' ' + personInvo;
		// バリエーション支援 20230803 add by zdj end
	    if(letter02){
	       deliveryCodeFax = letter02;
	    }
	}else if(letter01 == '15'){  //納品先
		// バリエーション支援 20230803 add by zdj start
//		companyName = companyNameDelivery + ' ' + '納品書ご担当者様';
		companyName = companyNameDelivery + ' ' + personInvo;
		// バリエーション支援 20230803 add by zdj end
	    if(deliveryId && !isEmpty(deliveryFax)){
           deliveryCodeFax = deliveryFax;
        }
	}else if(letter01 == '16'){  //顧客先
		// バリエーション支援 20230803 add by zdj start
//		companyName = companyNameCustomer + ' ' + '納品書ご担当者様';
		companyName = companyNameCustomer + ' ' + personInvo;
		// バリエーション支援 20230803 add by zdj end
	    if(customeFax){
            deliveryCodeFax = customeFax;
      }
	 }
    }else{
        if(customeFax){
            deliveryCodeFax = customeFax;   
        }
     // バリエーション支援 20230803 add by zdj start
//        companyName = companyNameCustomer + ' ' + '納品書ご担当者様';
        companyName = companyNameCustomer + ' ' + personInvo;
     // バリエーション支援 20230803 add by zdj end
    }
	//CH736　20230717 by zzq end
	// add by CH600 20230612 end
	var deliveryName = defaultEmpty(invoiceSearch[0].getValue(deliveryNameSearchColumn));//DJ_納品先 : DJ_納品先名前
	var deliveryZip = defaultEmpty(invoiceSearch[0].getValue(deliveryZipSearchColumn));//DJ_納品先 : DJ_郵便番号
	if(deliveryZip && deliveryZip.substring(0,1) != '〒'){
		deliveryZip = '〒' + deliveryZip;
	}else{
		deliveryZip = '';
	}
	var deliveryPrefectures = defaultEmpty(invoiceSearch[0].getValue(deliveryPrefecturesSearchColumn));//DJ_納品先 : DJ_都道府県
	var deliveryMunicipalities = defaultEmpty(invoiceSearch[0].getValue(deliveryMunicipalitiesSearchColumn));//DJ_納品先 : DJ_市区町村
	var deliveryResidence = defaultEmpty(invoiceSearch[0].getValue(deliveryResidenceSearchColumn));//DJ_納品先 : DJ_納品先住所1
	//add by zzq CH653 20230619 start
	var deliveryResidence2 = defaultEmpty(invoiceSearch[0].getValue(deliveryResidence2SearchColumn));//DJ_納品先 : DJ_納品先住所2
	var deliveryResidence3 = defaultEmpty(invoiceSearch[0].getValue(deliveryResidence3SearchColumn));//DJ_納品先 : DJ_納品先住所3
	//add by zzq CH653 20230619 end
	var duedate = defaultEmpty(invoiceSearch[0].getValue(duedateSearchColumn));//発行日
	var deliveryDate = defaultEmpty(invoiceSearch[0].getValue(deliveryDateSearchColumn));//DJ_納品日
	
	//アイテム 
	var itemIdArray = [];
	var itemDetails = [];
	var amountTotal = 0;
	var taxTotal = 0;
	var taxType = {};
	var invoiceRecord = nlapiLoadRecord("invoice",invoiceid)
	// バリエーション支援 20230803 add by zdj start
	var tmpLocationDic = getLocations(invoiceRecord);
	// バリエーション支援 20230803 add by zdj end
	var Counts = invoiceRecord.getLineItemCount('item');//アイテム明細部
	if(Counts != 0) {
		for(var s = 1; s <=  Counts; s++){
			var item = defaultEmpty(invoiceRecord.getLineItemValue('item', 'item', s));//アイテムID
			var quantity = defaultEmpty(parseFloat(invoiceRecord.getLineItemValue('item', 'quantity', s)));//数量
            var quantityFormat = 0;
            if (quantity) {
                quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
            }
			
			var units_display = defaultEmpty(invoiceRecord.getLineItemValue('item', 'units_display', s));//単位
			
			 if(!isEmpty(units_display)){
			     var unitsArray = units_display.split("/");
                 if(!isEmpty(unitsArray)){
                     units_display = unitsArray[0];
                 }
			 }
			
			var origrate = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'rate', s)));//単価
			nlapiLogExecution('debug', 'origrate000', origrate);
//			var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
			origrateFormat = formatAmount1(origrate);
			nlapiLogExecution('debug', 'origrateFormat', origrateFormat);
			
			var amount = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'amount', s)));//金額
			var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	
			var taxRate = defaultEmpty(invoiceRecord.getLineItemValue('item', 'taxrate1', s));//税率
			
			var taxAmount = defaultEmptyToZero(parseFloat(invoiceRecord.getLineItemValue('item', 'tax1amt', s)));//税額
			nlapiLogExecution('debug', 'taxAmount', taxAmount);
			var taxAmountFormat = taxAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

			var itemSearch = nlapiSearchRecord("item",null,
					[
					   ["internalid","anyof",item]
					], 
					[
					   new nlobjSearchColumn("itemid"),						   
					   new nlobjSearchColumn("displayname"),
					   //20230619 add by zzq CH653 start
	                   new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), //配送料フラグ
	                   //20230608 add by zzq CH653 end
	                   //20230720 add by zzq CH735 start
	                   new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_品名（日本語）LINE1
	                   new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), //DJ_品名（日本語）LINE2
	                   new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_品名（英語）LINE1
	                   new nlobjSearchColumn("custitem_djkk_product_name_line2"), //DJ_品名（英語）LINE2
	                   // バリエーション支援 20230803 add by zdj start
	                   new nlobjSearchColumn("custitem_djkk_product_code"), //カタログ製品コード
	                   // バリエーション支援 20230803 add by zdj end
	                   new nlobjSearchColumn("type")// 種類
					   //20230720 add by zzq CH735 end
					]
					);	
			//20230720 add by zzq CH735 start
//			var displayname = defaultEmpty(itemSearch[0].getValue('displayname'));
//			displayname = displayname.replace(new RegExp("&","g"),"&amp;")
			var invoiceItemType = defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("type")); //アイテムtype
			var itemDisplayName= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//商品名
			// バリエーション支援 20230803 add by zdj start
			var productCode= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("custitem_djkk_product_code"));//カタログ製品コード
			// バリエーション支援 20230803 add by zdj end
			var displayname = '';
			//add by zdj 20230802 start
			var itemNouhinBikou = invoiceRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',s); //DJ_納品書備考
			//add by zdj 20230802 end
			 // アイテムは再販用その他の手数料
			if(invoiceItemType == 'OthCharge') {
			    displayname = othChargeDisplayname(itemDisplayName); // 手数料
			}else{
			    if (!isEmpty(itemSearch)) {
			        var jpName1 = itemSearch[0].getValue("custitem_djkk_product_name_jpline1");
                    var jpName2 = itemSearch[0].getValue("custitem_djkk_product_name_jpline2");
                        if (!isEmpty(jpName1) && !isEmpty(jpName2)) {
                            displayname = jpName1 + ' ' + jpName2;
                        } else if (!isEmpty(jpName1) && isEmpty(jpName2)) {
                            displayname = jpName1;
                        } else if (isEmpty(jpName1) && !isEmpty(jpName2)) {
                            displayname = jpName2;
                    }
			    }
			}
			//add by zdj 20230802 start
			if(displayname){
				if(itemNouhinBikou){
					displayname = displayname + '<br/>' + itemNouhinBikou;
				}
			}else {
				if(itemNouhinBikou){
					displayname = itemNouhinBikou;
				}
			}
			//add by zdj 20230802 end
			// バリエーション支援 20230803 add by zdj start
			var itemLocId = defaultEmpty(invoiceRecord.getLineItemValue('item','location',s)); // 場所
	        var locBarCode = '';
	        if (itemLocId) {
	            var tmpDicBarCode = tmpLocationDic[itemLocId];
	            if (tmpDicBarCode) {
	                locBarCode = tmpDicBarCode;
	            }
	        }
	        var itemid = '';
	        if(!isEmpty(productCode) && !isEmpty(locBarCode)){
	        	itemid = productCode + ' ' + locBarCode;
            }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
            	itemid = locBarCode;
            }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
            	itemid = productCode;
            }else{
            	itemid = ' ';
            }
	        // バリエーション支援 20230803 add by zdj end
			//20230720 add by zzq CH735 end
			//var itemid = defaultEmpty(itemSearch[0].getValue('itemid'));
			//20230619 add by zzq CH653 start
			nlapiLogExecution('debug', '000', itemSearch[0].getValue('custitem_djkk_deliverycharge_flg'));
			var deliverychargeFlg = defaultEmpty(itemSearch[0].getValue('custitem_djkk_deliverycharge_flg'));
			nlapiLogExecution('debug', '001', deliverychargeFlg);
            //20230608 add by zzq CH653 end				
			amountTotal += amount;
			taxTotal += taxAmount;
			
			var taxRateData = taxType[taxRate] || 0;
			taxType[taxRate] = taxRateData + taxAmount + amount;			
			//add by zzq CH690 20230627 start
			//20230720 add by zzq CH735 start
			if(!(amount == 0 && deliverychargeFlg == 'T')){
                 if(custcurrency == 1){
                     itemDetails.push({
                     item : item,// アイテムID
                     units_display : units_display,// 単位
//                     amount : defaultEmptyToZero1(amount),// 金額
                     amount : formatAmount1(amount),// 金額
                     quantity : quantity,// 数量
//                     origrate : defaultEmptyToZero1(origrate),// 単価
                     origrate : formatAmount1(origrate),// 単価
                     displayname:displayname,// 商品d名
                     itemid:itemid,// 商品code
                     // add by zzq CH653 20230618 start
                     deliverychargeFlg:deliverychargeFlg// 配送料フラグ
                     // add by zzq CH653 20230618 end
                     });
                     
              }else{
                     itemDetails.push({
                     item : item,// アイテムID
                     units_display : units_display,// 単位
                     amount : amountFormat,// 金額
                     quantity : quantityFormat,// 数量
                     origrate : origrateFormat,// 単価
                     displayname:displayname,// 商品d名
                     itemid:itemid,// 商品code
                     // add by zzq CH653 20230618 start
                     deliverychargeFlg:deliverychargeFlg// 配送料フラグ
                     // add by zzq CH653 20230618 end
                    });
                 }
			}
			//20230720 add by zzq CH735 end
			 nlapiLogExecution('debug', 'origrate', origrate);
			//add by zzq CH690 20230627 end
	     }			
	  }
	//add by zzq CH690 20230627 start
	var amountTotalFormat = '';
	if(custcurrency == 1){
		amountTotalFormat = defaultEmptyToZero1(amountTotal);
	}else{
		amountTotalFormat = amountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	
	var taxTotalFormat = '';
	if(custcurrency == 1){
		taxTotalFormat = defaultEmptyToZero1(taxTotal);
	}else{
		taxTotalFormat = (taxTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
//	add by zzq CH690 20230627 end
	var headValue  = {
			salesrep:salesrep,//営業担当者
			legalName:legalName,//連結正式名称
			EnglishName:EnglishName,//連結DJ_会社名前英語
			transactionFax:transactionFax,//発注専用FAX
			//CH655 20230725 add by zdj start
			shipaddressPhone:shipaddressPhone,//連結配送先phone
			shipaddressFax:shipaddressFax,//連結配送先fax
			//CH655 20230725 add by zdj end
			phone:phone,//連結TEL
			Fax:Fax,//連結FAX
			paymentPeriodMonths:paymentPeriodMonths,//支払期限月
			companyName :companyName,//顧客名
			companyName1 : companyName1,
			customeFax:customeFax,//顧客FAX
			billcity:billcity,//市区
			customerCode:customerCode,//顧客codeNum
			customePhone:customePhone,//顧客TEL
		    custZipCode :custZipCode,//顧客郵便
			custState:custState,//顧客都道府県
			custAddr1:custAddr1,//顧客住所１
			custAddr2:custAddr2,//顧客住所２
			custAddr3:custAddr3,//顧客住所3
			custAddressee:custAddressee,//顧客宛先
			tranid:tranid,//請求書番号
			tranNumber:tranNumber,//請求書番号
			otherrefnum:otherrefnum,//御社発注番号
			transactionnumber:transactionnumber,//受注番号(maybe not true)
			deliveryCode:deliveryCode,//DJ_納品先 : DJ_納品先コード
			deliveryName :deliveryName,//DJ_納品先 : DJ_納品先名前
			deliveryZip:deliveryZip,//DJ_納品先 : DJ_郵便番号
			deliveryPrefectures :deliveryPrefectures,//DJ_納品先 : DJ_都道府県
			deliveryMunicipalities: deliveryMunicipalities,//DJ_納品先 : DJ_市区町村
			deliveryResidence:deliveryResidence,//DJ_納品先 : DJ_納品先住所1
			deliveryResidence2 :deliveryResidence2,//DJ_納品先 : DJ_納品先住所2
			//add by zzq CH653 20230619 start
			deliveryResidence3 :deliveryResidence3,//DJ_納品先 : DJ_納品先住所3
			//add by zzq CH653 20230619 end
			duedate:duedate,//発行日
			deliveryDate:deliveryDate,//DJ_納品日
			// add by zhou 20230602 CH601 start
			memo:memo,//メモ
			// add by zhou 20230602 CH601 end
			// add by zzq 20230612 CH600 start
			deliveryCodeFax : deliveryCodeFax
			//add by zzq 20230612 CH600 end
			};
	var TotalForTaxEight = 0;
	var TotalForTaxTen = 0;
	for(var k in taxType){
		if(k == '8.0%'){
			 TotalForTaxEight = taxType[k];//税率8%で税金総額
		}else if(k == '10.0%'){
			 TotalForTaxTen = taxType[k];//税率20%で税金総額
		}
	}
//	var total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
//	TotalForTaxEight = TotalForTaxEight.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//	TotalForTaxTen = TotalForTaxTen.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	
	//add by zzq CH690 20230627 start
	var total = '';
	if(custcurrency == 1){
//		total = defaultEmptyToZero1(TotalForTaxEight + TotalForTaxTen);
		total = defaultEmptyToZero1(amountTotal + taxTotal);
		TotalForTaxEight = defaultEmptyToZero1(TotalForTaxEight);
		TotalForTaxTen = defaultEmptyToZero1(TotalForTaxTen)
	}else{
		nlapiLogExecution('debug', 'total', TotalForTaxEight + TotalForTaxTen);
//		total = ( TotalForTaxEight + TotalForTaxTen ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
		total = ( amountTotal + taxTotal ).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');//合計(税込)
		TotalForTaxEight = TotalForTaxEight.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		TotalForTaxTen = TotalForTaxTen.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	}
	//add by zzq CH690 20230627 end
	var str = '';
	nlapiLogExecution('DEBUG', 'zzq');
	var tmpCurrency = invoiceRecord.getFieldValue('currency');
	var displaysymbol = '';
//	if (tmpCurrency) {
//	    var tmpRecd = nlapiLoadRecord('currency', tmpCurrency, 'symbol');
//	    if (tmpRecd) {
//	        displaysymbol = tmpRecd.getFieldValue('displaysymbol');
//	    }
//	}
	str += '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
	'<pdf>'+
	'<head>'+
	'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
	'<#if .locale == "zh_CN">'+
	'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
	'<#elseif .locale == "zh_TW">'+
	'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
	'<#elseif .locale == "ja_JP">'+
	'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
	'<#elseif .locale == "ko_KR">'+
	'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
	'<#elseif .locale == "th_TH">'+
	'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
	'</#if>'+
	'<macrolist>'+
	'<macro id="nlheader">'+
	'<table border="0" cellspacing="0" cellpadding="0" width="660px" align="center">'+
	'<tr>'+
	'<td style="width:104px;"></td>'+
	'<td style="width:104px;"></td>'+
	'<td style="width:102px;"></td>'+
	'<td style="width:80px;"></td>'+
	'<td style="width:102px;"></td>'+
	'<td style="width:104px;"></td>'+
	'<td style="width:104px;"></td>'+
	'</tr>'+
	'<tr>'+
	''+
	'<td colspan="3" rowspan="2" align="center" style="margin-left:25px;border-bottom: 4px black solid;vertical-align:bottom;font-size: 32px;letter-spacing: 35px;line-height:10%;">&nbsp;納品書</td>'+
	'<td></td>'+
	// update by zdj 20230802 start
	//'<td colspan="3" style="font-size: 12px;vertical-align:bottom">'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</td>'+
	'<td colspan="3"><span style="font-size: 11px;font-family: heiseimin; vertical-align:bottom" >'+headValue.legalName+'&nbsp;&nbsp;&nbsp;'+headValue.EnglishName+'</span></td>'+
	// update by zdj 20230802 end
	''+
	'</tr>'+
	'<tr>'+
	''+
	'<td></td>'+
	//CH655 20230725 add by zdj start
	// バリエーション支援 20230803 update by zdj start
	//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.phone+'／発注専用FAX：'+headValue.transactionFax+'</td>'+
	//'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'／発注専用FAX：'+headValue.transactionFax+'</td>'+
	'<td colspan="3" style="font-size: 12px;vertical-align:middle;">'+headValue.shipaddressPhone+'／発注専用FAX：'+headValue.shipaddressFax+'</td>'+
	// バリエーション支援 20230803 update by zdj end
	//CH655 20230725 add by zdj end
	''+
	'</tr>'+
	'<tr style="height:12px">'+
	''+
	'<td colspan="3"></td>'+
	'<td></td>'+
	//CH655 20230725 add by zdj start
//	'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.Fax+'</td>'+
	// バリエーション支援 20230803 update by zdj start
	//'<td colspan="3" style="font-size: 12px;vertical-align:middle">'+headValue.shipaddressFax+'</td>'+
	'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
	// バリエーション支援 20230803 update by zdj end
	//CH655 20230725 add by zdj end
	''+
	'</tr>'+
	'<tr>'+
	'<td colspan="3"></td>'+
	'<td></td>'+
	'<td colspan="3" style="font-size: 12px;vertical-align:middle"></td>'+
	''+
	'</tr>'+
	'<tr>'+
	//add by zzq CH600 start
	'<td colspan="7" style="font-weight: 200;font-size:20px">'+dealFugou(headValue.companyName)+'</td>'+
	//add by zzq CH600 end
	'</tr>'+
	'<tr>'+
	//add by zzq CH600 start
	'<td style="font-weight: 200;font-size:20px">FAX:</td>'+
	'<td colspan="6" style="font-weight: 200;font-size:20px" align="left">'+headValue.deliveryCodeFax+'</td>'+
	//add by zzq CH600 end
	'</tr>'+
	'<tr height="10px">'+
	''+
	'</tr>'+
	'<tr>'+
	'<td colspan="7" style="font-size: 12px; font-weight: bold;">平素は格別のお引き立て有難うございます。この度はご注文ありがとうございました。</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="7" style="font-size: 12px; font-weight: bold;border-bottom: 4px solid black;">下記の通り納品致しましたので、ご査収ください。 </td>'+
	'</tr>'+
	''+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td style="width: 65px;"></td>'+
	'<td style="width: 110px;"></td>'+
	'<td style="width: 100px;"></td>'+
	'<td style="width: 90px;"></td>'+
	'<td style="width: 100px;"></td>'+
	'<td style="width: 110px;"></td>'+
	'<td style="width: 95px;"></td>'+
	'</tr>'+
	'<tr style="font-weight: 460;font-size: 13px;">'+
	'<td>&nbsp;&nbsp;請求先：</td>'+
	'<td>'+headValue.customerCode+'</td>'+
	'<td colspan="4">'+dealFugou(headValue.companyName1)+'</td>'+
//	'<td align="center">I</td>'+
	'<td align="center">&nbsp;</td>'+
	'</tr>'+
	'<tr style="font-weight: 460;font-size: 13px;">'+
	'<td></td>'+
	'<td>〒 &nbsp;550-0002</td>'+
	// CH756&757 update by zdj 20230802 start
	//'<td colspan="5">'+headValue.custState+'&nbsp;&nbsp;&nbsp;'+headValue.billcity+headValue.custAddr1+headValue.custAddr2+'</td>'+
	'<td colspan="5">'+headValue.custState+headValue.billcity+headValue.custAddr1+headValue.custAddr2+'</td>'+
	// CH756&757 update by zdj 20230802 end
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr style="font-weight: 460;font-size: 13px;">'+
	//20230720 by zzq start
//	'<td style="width: 65px;border-bottom: 1px black solid;"></td>'+
//	'<td style="width: 50px;border-bottom: 1px black solid;">Tel</td>'+
//	'<td style="width: 110px;border-bottom: 1px black solid;">'+headValue.customePhone+'</td>'+
//	'<td style="width: 70px;border-bottom: 1px black solid;">Fax</td>'+
//	'<td colspan="3" style="border-bottom: 1px black solid;">'+headValue.customeFax+'</td>'+
    '<td style="width: 65px;border-bottom: 2px black solid;"></td>'+
    '<td style="width: 50px;border-bottom: 2px black solid;">Tel</td>'+
    '<td style="width: 110px;border-bottom: 2px black solid;">'+headValue.customePhone+'</td>'+
    '<td style="width: 70px;border-bottom: 2px black solid;">Fax</td>'+
    '<td colspan="3" style="border-bottom: 2px black solid;">'+headValue.customeFax+'</td>'+
    //20230720 by zzq end
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px" padding-top="4px">'+
	''+
//	'<tr style="font-weight: 460;font-size: 13px;">'+
//	'<td style="width: 90px;border-top: 1px solid black;">&nbsp;&nbsp;請求書番号：</td>'+
//	'<td style="width: 100px;border-top: 1px solid black;">'+headValue.tranNumber+'</td>'+
//	'<td style="width: 60px;border-top: 1px solid black;"><span>森本</span><span style="margin-left: 15px;">06</span></td>'+
//	'<td width="60px" style="border-top: 1px solid black;">発行日：</td>'+
//	'<td width="120px" style="border-top: 1px solid black;">'+headValue.duedate+'</td>'+
//	// add by zhou 20230602 CH601 start
////	'<td colspan="2" style="border-top: 1px solid black;">備考</td>'+
//	'<td colspan="2" style="border-top: 1px solid black; overflow: hidden;">備考：'+getStrLenSlice(dealFugou(headValue.memo), 14)+'</td>'+
//	// add by zhou 20230602 CH601 end
//	'</tr>'+
	//20230720 by zzq start
    '<tr style="font-weight: 460;font-size: 13px;">'+
    '<td style="width: 90px;">&nbsp;&nbsp;請求書番号：</td>'+
    '<td style="width: 100px;">'+headValue.tranNumber+'</td>'+
    '<td style="width: 60px;"><span>森本</span><span style="margin-left: 15px;">06</span></td>'+
    // バリエーション支援 20230803 update by zdj start
    //'<td width="60px">発行日：</td>'+
    //'<td width="120px">'+headValue.duedate+'</td>'+
    '<td width="60px">納品日：</td>'+
    '<td width="120px">'+headValue.deliveryDate+'</td>'+
    // バリエーション支援 20230803 update by zdj end
    // add by zhou 20230602 CH601 start
//    '<td colspan="2" style="border-top: 1px solid black;">備考</td>'+
    '<td colspan="2">備考：'+getStrLenSlice(dealFugou(headValue.memo), 14)+'</td>'+
    // add by zhou 20230602 CH601 end
    '</tr>'+
  //20230720 by zzq end
	'<tr style="font-weight: 460;font-size: 13px;">'+
	'<td>&nbsp;&nbsp;受注番号：</td>'+
	'<td colspan="2">'+headValue.transactionnumber+'</td>'+
	// バリエーション支援 20230803 update by zdj start
	//'<td>納品日：</td>'+
	//'<td>'+headValue.deliveryDate+'</td>'+
	'<td>納品先：</td>'+
	'<td>'+headValue.deliveryCode+'</td>'+
	//'<td colspan="2"></td>'+
	'<td colspan="2" rowspan="2">'+dealFugou(headValue.deliveryName)+'</td>'+
	// バリエーション支援 20230803 update by zdj end
	'</tr>'+
	'<tr style="font-weight: 460;font-size: 13px;">'+
	'<td>&nbsp;&nbsp;御社発注番号</td>'+
	'<td colspan="2">'+headValue.otherrefnum+'</td>'+
	// バリエーション支援 20230803 update by zdj start
	//'<td>納品先：</td>'+
	//'<td>'+headValue.deliveryCode+'</td>'+
	'<td colspan="2">&nbsp;</td>'+
	'</tr>'+
	// バリエーション支援 20230803 update by zdj end
	'<tr style="font-weight: 460;font-size: 13px;">'+
	'<td style="vertical-align:top;">&nbsp;&nbsp;支払条件：</td>'+
	'<td colspan="2" style="vertical-align:top;">'+headValue.paymentPeriodMonths+'</td>'+
	'<td></td>'+
	'<td style="vertical-align:top;">'+headValue.deliveryZip+'</td>'+
	'<td colspan="2" rowspan="2">'+headValue.deliveryPrefectures+'&nbsp;'+headValue.deliveryMunicipalities+headValue.deliveryResidence+headValue.deliveryResidence2+headValue.deliveryResidence3+'</td>'+
	'</tr>'+
	'<tr style="font-weight: 460;font-size: 13px;">'+
    '<td style="vertical-align:top;">&nbsp;</td>'+
    '<td colspan="2" style="vertical-align:top;">&nbsp;</td>'+
    '<td></td>'+
    '<td style="vertical-align:top;">&nbsp;</td>'+
    '</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="8px"></td>'+
	'<td width="90px"></td>'+
	'<td width="15px"></td>'+
	'<td width="125px"></td>'+
	'<td width="125px"></td>'+
	'<td width="60px"></td>'+
	'<td width="65px"></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr style="font-weight: 400;font-size: 12px;">'+
	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">明&nbsp;&nbsp;細</td>'+
	'<td width="15px" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
	'<td colspan="2" style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;">数量</td>'+
	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">単価</td>'+
	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;" align="center">金額</td>'+
	'</tr>'+
	'</table>'+
	'</macro>'+
	'<macro id="nlfooter">'+
	
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr heigth="8px">'+
	'<td width="150px"></td>'+
	'<td width="170px"></td>'+
	'<td width="90px"></td>'+
	'<td width="150px"></td>'+
	'<td width="100px"></td>'+
	'</tr>'+

	'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
//	'<td width="150px" ></td>'+
	'<td width="250px"></td>'+
//	'<td width="170px" style="border-top:1px solid black"></td>'+
	'<td width="150px" style="border-top:1px solid black"></td>'+
//	'<td width="90px"  style="border-top:1px solid black;border-right:1px solid black"></td>'+
	'<td width="70px"  style="border-top:1px solid black;border-right:1px"></td>'+
//	'<td width="170px" style="border-top:1px solid black">&nbsp;合計</td>'+
	'<td width="80px"  style="border-top:1px solid black">&nbsp;合計</td>'+
//	'<td width="80px"  style="border-top:1px solid black" align="right">'+displaysymbol + amountTotalFormat+'</td>'+
//	'<td width="80px"  style="border:1px solid black" align="right">'+displaysymbol + amountTotalFormat+'</td>'+
	'<td width="50px"  style="border-top:1px solid black" align="right">'+displaysymbol + amountTotalFormat+'</td>'+
	'</tr>'+
	
	'<tr heigth="8px">'+
	'<td width="150px"></td>'+
	'<td width="170px"></td>'+
	'<td width="90px"></td>'+
	'<td width="170px"></td>'+
	'<td width="80px"></td>'+
	'</tr>'+

	'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
	'<td width="250px"></td>'+
	'<td width="150px">8% 対象合計(税込)</td>'+
	'<td width="70px"  style="border-right:1px solid black" align="right">'+displaysymbol + TotalForTaxEight+'&nbsp;</td>'+
	'<td width="80px">&nbsp;消費税</td>'+
//	'<td width="50px" align="right">'+displaysymbol + taxTotalFormat+'</td>'+
	'<td width="50px" align="right">'+displaysymbol + taxTotalFormat+'</td>'+
	'</tr>'+

	'<tr heigth="8px">'+
	'<td width="150px"></td>'+
	'<td width="170px"></td>'+
	'<td width="90px"></td>'+
	'<td width="170px"></td>'+
	'<td width="80px"></td>'+
	'</tr>'+

	'<tr style="font-weight: bold;font-size: 13px;" heigth="20px">'+
	'<td width="250px" style="border-bottom:4px solid black">&nbsp;&nbsp;※軽減税率対象</td>'+
	'<td width="150px" style="border-bottom:4px solid black">10%対象合計(税込)</td>'+
	'<td width="70px"  style="border-bottom:4px solid black;border-right:1px solid black" align="right">'+displaysymbol + TotalForTaxTen+'&nbsp;</td>'+
	'<td width="80px"  style="border-bottom:4px solid black">&nbsp;合計(税込)</td>'+
//	'<td width="50px"  style="border-bottom:4px solid black" align="right">'+'￥' + total+'</td>'+
	'<td width="50px"  style="border-bottom:4px solid black" align="right">'+'￥' + total+'</td>'+
	'</tr>'+
	
	'<tr style="height:10px">'+
	''+
	'</tr>'+
	'<tr style="font-weight: bold;font-size: 14px;">'+
	/*******old******/
//	'<td colspan="5" align="center">現在、配送リードタイムをプラス１日とさせて頂いております。通常リードタイムに戻る際は<br/>、改めてご連絡申し上げます。<br/>コロナウィルス感染リスク軽減による、弊社テレワーク導入の為、大変ご迷惑をお掛け致し<br/>ますが、ご理解の程よろしくお願い申し上げます。</td>'+
	/*******old******/
	/*******new******/
	//update by zdj 20230802 start
	//'<td colspan="5" align="center">'+shippingdeliverynotice+'</td>'+
	'<td colspan="5"><span align="center" style="font-family: heiseimin;" >'+shippingdeliverynotice+'</span></td>'+
	//update by zdj 20230802 end
	/*******new******/
	'</tr>'+
	'<tr>'+
	'<td colspan="5"></td>'+
	'</tr>'+
	'<tr style="font-weight: bold;font-size: 15px;">'+
	'<td colspan="5" align="center">***** 全<totalpages/>ページ：<pagenumber/>*****</td>'+
	'</tr>'+
	'</table>'+
	'</macro>'+
	'</macrolist>'+
	'<style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
	'<#if .locale == "zh_CN">'+
	'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
	'<#elseif .locale == "zh_TW">'+
	'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
	'<#elseif .locale == "ja_JP">'+
	'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
	'<#elseif .locale == "ko_KR">'+
	'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
	'<#elseif .locale == "th_TH">'+
	'font-family: NotoSans, NotoSansThai, sans-serif;'+
	'<#else>'+
	'font-family: NotoSans, sans-serif;'+
	'</#if>'+
	'}'+
	'</style>'+
	'</head>';
	str+='<body header="nlheader" header-height="27%" footer="nlfooter" footer-height="14%" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';
	str+=
//	    //20230728 add by zdj start
        //20230720 by zzq start
//      '<table border="0" padding-top="18px">' +
        '<table border="0" padding-top="-2px">'
	    
        //20230720 by zzq end
        //'<tr>'+
        //'<tr height="20px" border = "1px"  margin-top="10px">'+
        //'<td border="1px" width="8px"></td>'+
//      '<td width="90px"></td>'+
        //'<td border="1px" width="100px"></td>'+
        //'<td border="1px" width="15px"></td>'+
        //'<td border="1px" width="125px"></td>'+
        //'<td border="1px" width="125px"></td>'+
//      '<td width="60px"></td>'+
        //'<td border="1px" width="30px"></td>'+
//      '<td width="80px"></td>'+
        //'<td border="1px" width="100px"></td>'+
        //'<td border="1px"></td>'+
        //'<td border="1px"></td>'+
        //'</tr>';
//        //20230728 add by zdj end
	    
	    

		for(var k = 0 ; k < itemDetails.length;k++){
		  //add by zzq CH653 20230619 start
            var taxCodeText = itemDetails[k].deliverychargeFlg == 'T' ? '' : '※';
            var itemQuantity = itemDetails[k].quantity;
            if(itemQuantity){
                itemQuantity = formatAmount1(itemDetails[k].quantity)
            }
            //20230728 add by zdj start
            str += '<tr style="font-weight: bold;font-size: 12px;height:20px"  margin-top="3px">'+
            '<td width="8px"></td>'+
            '<td width="100px" style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
            '<td width="15px"></td>'+
            '<td width="250px" colspan="2" style="vertical-align: top;">'+dealFugou(itemDetails[k].displayname)+'</td>'+
            //'<td width="125px"></td>'+
            '<td width="30px" style="vertical-align: top;" align="center">'+taxCodeText+'</td>'+
            '<td width="90px" style="vertical-align: top;" align="right">'+itemQuantity+'&nbsp;&nbsp;'+itemDetails[k].units_display+'&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
            '<td width="83px" style="vertical-align: top;" align="right">'+displaysymbol + itemDetails[k].origrate+'</td>'+
            '<td width="84px" style="vertical-align: top;" align="right">'+displaysymbol + itemDetails[k].amount+'&nbsp;</td>'+
          //20230728 add by zdj end
            //add by zzq CH653 20230619 end
//            str += '<tr style="font-weight: bold;font-size: 12px;height:30px">'+
            //str += '<tr style="font-weight: bold;font-size: 12px;height:30px" padding-top = "10px">'+
            //'<td></td>'+
            //'<td style="vertical-align: top;">'+itemDetails[k].itemid+'</td>'+
//            '<td></td>'+
//            '<td colspan="2" style="vertical-align: top;">'+dealFugou(itemDetails[k].displayname)+'</td>'+
            //add by zzq CH653 20230619 start
//        '<td style="vertical-align: top;" align="center">※</td>'+
//            '<td style="vertical-align: top;" align="center">'+taxCodeText+'</td>'+
            //add by zzq CH653 20230619 end
//        '<td style="vertical-align: top;" align="right">'+itemDetails[k].quantity+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
            //'<td style="vertical-align: top;" align="right">'+itemQuantity+'&nbsp;&nbsp;'+itemDetails[k].units_display+'</td>'+
//            '<td style="vertical-align: top;" align="right">'+displaysymbol + itemDetails[k].origrate+'</td>'+
//            '<td style="vertical-align: top;" align="right">'+displaysymbol + itemDetails[k].amount+'&nbsp;</td>'+
            '</tr>';
//        '<tr style="font-weight: bold;font-size: 10px;height:20px">'+
//        '<td></td>'+
//        '<td style="vertical-align: top;">93482608</td>'+
//        '<td width="15px"></td>'+
//        '<td></td>'+
//        '<td></td>'+
//        '<td></td>'+
//        '<td></td>'+
//        '<td></td>'+
//        '</tr>';
		}
	    
		str+='</table>';
		
	str += '</body></pdf>';
    var renderer = nlapiCreateTemplateRenderer();
    renderer.setTemplate(str);
    var xml = renderer.renderToString();

    //			// test
    //			var xlsFileo = nlapiCreateFile('納品' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
    //			
    //			xlsFileo.setFolder(109338);
    //			nlapiSubmitFile(xlsFileo);
    //		  
    var xlsFile = nlapiXMLToPDF(xml);

    // PDF
    //20230901 add by CH762 zzq start 
    var SAVE_FOLDER = DELIVERY_PDF_IN_CM_MAIL_DJ_DELIVERYPDF;
    if(subsidiary == SUB_NBKK){
        SAVE_FOLDER = DELIVERY_PDF_IN_CM_MAIL_DJ_DELIVERYPDF_NBKK;
    }else if(subsidiary == SUB_ULKK){
        SAVE_FOLDER = DELIVERY_PDF_IN_CM_MAIL_DJ_DELIVERYPDF_ULKK;
    }
   //20230901 add by CH762 zzq end 
    xlsFile.setName(fileName + '.pdf');
    xlsFile.setFolder(SAVE_FOLDER);
    xlsFile.setIsOnline(true);

    // save file
    var fileID = nlapiSubmitFile(xlsFile);
    return fileID;
}
//CH775 add by zdj 20230804 end

function creditmemoInvPdfmaker(id,custform,fileName){
    // 20230727 add by zdj start
    // クレジットメモ FOODFORM - 個別請求書
    var SECURE_URL_HEAD = 'https://5722722-sb1.secure.netsuite.com';
    //本番 SECURE固定URLタイトル :'https://5722722.secure.netsuite.com';

    //リンクパラメータ 固定URLタイトル:C
    //var URL_PARAMETERS_C = 'c=5722722_SB1';
    //本番 SECURE固定URLタイトル:C :'c=5722722';
    nlapiLogExecution('debug', 'start', 'クレジットメモ 個別請求書  PDF making start')
    nlapiLogExecution('debug', 'クレジットメモid', id)
    // add bu zzq CH630 20230617 start
    // クレジットメモ
    nlapiLogExecution('debug', 'start', 'start')
    var invAmount = 0;
    var invTaxamount = 0;
    var itemLine = new Array();
    var creditmemoId = id; // creditmemoID
    var creditmemoRecord = nlapiLoadRecord('creditmemo', creditmemoId);
    var tmpLocationDic = getLocations(creditmemoRecord);
    var entity = creditmemoRecord.getFieldValue('entity');// 顧客
    var customerSearch= nlapiSearchRecord("customer",null,
            [
                ["internalid","anyof",entity]
            ], 
            [
                new nlobjSearchColumn("address2","billingAddress",null), //請求先住所2
                new nlobjSearchColumn("address3","billingAddress",null), //請求先住所3
                new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
                //CH734 20230719 by zzq start
                new nlobjSearchColumn("country","billingAddress",null), //country
                //CH734 20230719 by zzq end
                new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
                new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県         
                new nlobjSearchColumn("phone"), //電話番号
                new nlobjSearchColumn("fax"), //Fax `
                new nlobjSearchColumn("entityid"), //id
                new nlobjSearchColumn("companyname"), //naem
                new nlobjSearchColumn("salesrep"), //販売員（当社担当）
                new nlobjSearchColumn("language"),  //言語
                new nlobjSearchColumn("currency"),  //基本通貨
                new nlobjSearchColumn("custrecord_djkk_pl_code_fd","custentity_djkk_pl_code_fd",null),   //DJ_販売価格表コード（食品）
//              new nlobjSearchColumn("custentity_djkk_pl_code_fd")   //DJ_販売価格表コード（食品）
                new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_顧客支払条件
                new nlobjSearchColumn("terms"), //支払い条件
                new nlobjSearchColumn("address1","billingAddress",null), //請求先住所1
                //20230721 by zzq start
                new nlobjSearchColumn("state","billingAddress",null), //請求先住所 : 都道府県
                new nlobjSearchColumn("billaddress")
                //20230721 by zzq end

                

            ]
            );  
    var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//住所2
    var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//住所3
    var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//市区町村
    //CH734 20230719 by zzq start
    var invoiceCountry= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("country","billingAddress",null));//country
    var invoiceCityUnder= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//市区町村
    //CH734 20230719 by zzq end
    var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//郵便番号
    var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//都道府県 
    var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//電話番号
    var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
    var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
    nlapiLogExecution('debug', 'entityid0', entityid);
    var custNameText= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//name add by zhou
    var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//販売員（当社担当）
    // add by zzq start
//  var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//言語
    var language= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("language"));//言語
//  nlapiLogExecution('debug','custLanguage',custLanguage);
    nlapiLogExecution('debug','language',language);
    // add by zzq end
    var currency= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("currency"));//販売員（当社担当）
    var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_pl_code_fd","CUSTENTITY_DJKK_PL_CODE_FD",null));//DJ_販売価格表コード（食品）code
//  var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_pl_code_fd"));//DJ_販売価格表コード（食品）code
    var customerPayment = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_customer_payment"));//add by lj
    var customerTerms = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("terms"));//add by zzq
    var address1 = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address1","billingAddress",null));//add by lj
    
    //  nlapiLogExecution('debug', 'custLanguage', custLanguage)
    

    //20230721 by zzq start
    var invoicestateEn = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("state","billingAddress",null)));
    var invoicebillcountryEn = '';
    if(invoiceCountry){
        if(invoiceCountry == 'JP'){
            invoicebillcountryEn = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getText("country","billingAddress",null)));
        }else{
            invoicebillcountryEn = defaultEmpty(isEmpty(customerSearch) ? '' :  transfer(customerSearch[0].getValue("billaddress")));
            if(invoicebillcountryEn){
               var invoiceCountryEnArr = invoicebillcountryEn.split('\n');
                invoicebillcountryEn = invoiceCountryEnArr[invoiceCountryEnArr.length-1];
            }
        }
    }
    var invoiceCountryEnAddress = invoicestateEn + '&nbsp;' + invoicebillcountryEn;
    //20230721 by zzq end
    //支払条件
    //add by zzq start
    var customerPaymentTerms = '';
    if (language == SYS_LANGUAGE_JP) {
        if (customerTerms) {
            var tmpVal = customerTerms.split("/")[0];
            if (tmpVal) {
                customerPaymentTerms = tmpVal;
            }
        } else if (customerPayment) {
            var tmpVal = customerPayment.split("/")[0];
            if (tmpVal) {
                customerPaymentTerms = tmpVal;
            }
        }
    } else if (language == SYS_LANGUAGE_EN) {
        if (customerTerms) {
            var tmpVal = customerTerms.split("/")[1];
            if (tmpVal) {
                customerPaymentTerms = tmpVal;
            }
        } else if (customerPayment) {
            var tmpVal = customerPayment.split("/")[1];
            if (tmpVal) {
                customerPaymentTerms = tmpVal;
            }
        }
    }
   // nlapiLogExecution('DEBUG', 'customerPaymentTerms', customerPaymentTerms);
    //add by zzq end

    var trandate = defaultEmpty(creditmemoRecord.getFieldValue('trandate'));    //クレジットメモ日付
    var delivery_date = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_date'));    //クレジットメモ納品日
    var tranid = defaultEmpty(creditmemoRecord.getFieldValue('tranid'));    //クレジットメモ番号
    var transactionnumber = defaultEmpty(creditmemoRecord.getFieldValue('transactionnumber'));    //トランザクション番号　221207王より追加
    //バリエーション支援 20230803 add by zdj start
    var exsystemTranid = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_exsystem_tranid'));
    if(exsystemTranid){
        transactionnumber = transactionnumber + '/' + exsystemTranid;
    }
    //バリエーション支援 20230803 add by zdj end
    var createdfrom = defaultEmpty(creditmemoRecord.getFieldValue('createdfrom'));    //クレジットメモ作成元
    var otherrefnum = '';//御社発注番号
    // add by CH598 20230601 start
//  var otherrefnum = defaultEmpty(invoiceRecord.getFieldValue('otherrefnum'));    //発注書番号
    var otherrefnum = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_customerorderno'));    //先方発注番号
    // add by CH598 20230601 end
    nlapiLogExecution('debug','createdfrom',createdfrom)
    var soNumber = '';
    if(!isEmpty(createdfrom)){
        var transactionSearch = nlapiSearchRecord("transaction",null,
                [
                   ["internalid","anyof",createdfrom]
                ], 
                [
                   new nlobjSearchColumn("transactionnumber")
                ]
                );
        
        
        if(!isEmpty(transactionSearch)){
                var createdfromTran = defaultEmpty(transactionSearch[0].getValue("transactionnumber")); //作成元    トランザクション番号
            nlapiLogExecution('debug','',createdfromTran)
        }
    }
    var payment = defaultEmpty(creditmemoRecord.getFieldText('custbody_djkk_payment_conditions'));    //クレジットメモ支払条件
    // add by zzq CH599 20230607 start
//  var salesrep = defaultEmpty(creditmemoRecord.getFieldText('salesrep'));    //営業担当者
//  var salesrep = defaultEmpty(creditmemoRecord.getFieldText('salesrep'));    //営業担当者
      var salesrepId = defaultEmpty(creditmemoRecord.getFieldValue('salesrep'));    //営業担当者
        // add CH599 zzq 20230520 start
//    if(!isEmpty(salesrep)){
//          if(salesrep.match(/ (.+)/)){
//              salesrep = salesrep.match(/ (.+)/)[1];
//          }
//      }
        var salesrep = '';
        if (salesrepId) {
            var employeeSearch = nlapiSearchRecord("employee",null,
              [
                 ["internalid","is",salesrepId]
              ], 
              [
                 new nlobjSearchColumn("phone"), 
                 new nlobjSearchColumn("fax"),
                 new nlobjSearchColumn("lastname"),
                 new nlobjSearchColumn("firstname"),
                 new nlobjSearchColumn("custentity_djkk_english_lastname"),
                 new nlobjSearchColumn("custentity_djkk_english_firstname")
              ]
              );
            var employeelastname = '';
            var employeefirstname = '';
            if (language == SYS_LANGUAGE_EN) {
                //add by zzq CH641 20230613 end
                employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_lastname")));//従業員lastname
                employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_firstname")));//従業員firstname
                if(employeelastname && employeelastname){
                    salesrep = employeefirstname +'&nbsp;'+ employeelastname;
                }else if(employeelastname && !employeelastname) {
                    salesrep = employeefirstname;
                }else if(!employeelastname && employeelastname) {
                    salesrep = employeelastname;
                }
            } else {
                employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("lastname")));//従業員lastname
                employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("firstname")));//従業員firstname
                if(employeelastname && employeelastname){
                    salesrep = employeelastname +'&nbsp;'+ employeefirstname;
                }else if(employeelastname && !employeelastname) {
                    salesrep = employeefirstname;
                }else if(!employeelastname && employeelastname) {
                    salesrep = employeelastname;
                }
            }
      }
    // add by zzq CH599 20230607 end
    // add CH408 20230520 start
    var memo = defaultEmpty(creditmemoRecord.getFieldValue('memo'));    //memo
    var dvyMemo = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_deliverynotememo')); //納品書備考
    // add CH408 20230520 end
    var subsidiary = defaultEmpty(creditmemoRecord.getFieldValue('subsidiary'));    //クレジットメモ子会社
    var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
            [
                ["internalid","anyof",subsidiary]
            ], 
            [
                new nlobjSearchColumn("legalname"),  //正式名称
                new nlobjSearchColumn("name"), //名前
                new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
                new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
                new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
                new nlobjSearchColumn("address1","address",null), //住所1
                new nlobjSearchColumn("address2","address",null), //住所1
                new nlobjSearchColumn("address3","address",null), //住所2
                new nlobjSearchColumn("city","address",null), //市区町村
                new nlobjSearchColumn("zip","address",null), //郵便番号
                new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
                new nlobjSearchColumn("phone","address",null), //phone
                //20230510 add by zhou DENISJAPAN-759 start
                new nlobjSearchColumn("custrecord_djkk_invoice_issuer_number"),//適格請求書発行事業者番号
                new nlobjSearchColumn("custrecord_djkk_bank_1"),//DJ_銀行1
                new nlobjSearchColumn("custrecord_djkk_bank_2"),//DJ_銀行2
                //20230510 add by zhou DENISJAPAN-759 end
                //CH655 20230725 add by zdj start
                new nlobjSearchColumn("phone","shippingAddress",null),//配送先phone
                new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//配送先fax
              //CH655 20230725 add by zdj end
            ]
            );  
    var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//正式名称
    var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//名前
    var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address1","address",null));//住所1
    var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//住所2
    var invoiceAddressThree= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//住所3
    var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//郵便番号
    var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//市区町村
    var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
    var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
    var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//住所英語
    var invoiceFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax
    var invoicePhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","address",null));//phone
    //20230510 add by zhou DENISJAPAN-759 start
    var invoiceIssuerNumber= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_invoice_issuer_number"));//適格請求書発行事業者番号
    var bank1 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_1");
    var bank2 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_2");
    var bankInfo = [];
    var bank1Value = '';
    var bank2Value = '';
    if(bank1){
        bank1 = nlapiLoadRecord('customrecord_djkk_bank', bank1);
        var bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name'));
        if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))){
            bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))+')';
        }
        var bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));
        if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code'))){
            bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
        }
        var bankType1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_type'));
        var bankNo1 = '';
        if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'))){
            //CH756&CH757 20230801 by zdj start
//          bankNo1 = 'No.'+ defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
            bankNo1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
            //CH756&CH757 20230801 by zdj end
        }
    }
    if(bank2){
        bank2 = nlapiLoadRecord('customrecord_djkk_bank', bank2);
        var bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name'));
        if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))){
            bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))+')';
        }
        var bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));
        if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code'))){
            bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
        }
        var bankType2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_type'));
        var bankNo2 = '';
        if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'))){
            //CH756&CH757 20230801 by zdj start
//          bankNo2 = 'No.'+ defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
            bankNo2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
            //CH756&CH757 20230801 by zdj end
        }
    }
    //20230510 add by zhou DENISJAPAN-759 end
    var incoicedelivery_destination = creditmemoRecord.getFieldValue('custbody_djkk_delivery_destination');    //クレジットメモ納品先
    if(!isEmpty(incoicedelivery_destination)){  
        
        var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
                [
                    ["internalid","anyof",incoicedelivery_destination]
                ], 
                [
                    new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
                    new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
                    new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
                    new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
                    //add by CH653 20230619 start
                    new nlobjSearchColumn("custrecord_djkk_delivery_lable"),  //DJ_納品先住所2
                    new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所3
                    //add by CH653 20230619 end
                    new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_納品先名前
                          
                ]
                );  
        var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//郵便番号
        var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//都道府県
        var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_市区町村
        var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_納品先住所1
        //add by CH653 20230619 start
//      var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_納品先住所2
        var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_lable'));//DJ_納品先住所3
        var invdestinationAddress3 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_納品先住所3
        //add by CH653 20230619 end
        var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_納品先名前
    }
    
    var tmpCurrency = creditmemoRecord.getFieldValue('currency');
    var displaysymbol = '';
    if (tmpCurrency) {
        var tmpRecd = nlapiLoadRecord('currency', tmpCurrency, 'symbol');
        if (tmpRecd) {
            displaysymbol = tmpRecd.getFieldValue('displaysymbol');
        }
    }
        
    var invoiceCount = creditmemoRecord.getLineItemCount('item');
    //add by zzq 20230614 start
    var invTaxmountTotal = '0';
    var invoAmountTotal = 0;
    var invoToTotal =0;
    var invTaxmountTotal10 = 0;
    var invTaxmountTotal8 = 0;
    //add by zzq 20230614 end
    for(var k=1;k<invoiceCount+1;k++){
        creditmemoRecord.selectLineItem('item',k);
        var invoiceItemId = creditmemoRecord.getLineItemValue('item','item',k); //item
        var invoiceItemSearch = nlapiSearchRecord("item",null,
                [
                    ["internalid","anyof",invoiceItemId],
                ],
                [
                  new nlobjSearchColumn("itemid"), //商品コード
                  //20230608 add by zzq CH599 start
                  new nlobjSearchColumn("displayname"), //商品名
                  new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_品名（日本語）LINE1
                  new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), //DJ_品名（日本語）LINE2
                  new nlobjSearchColumn("custitem_djkk_product_name_line1"), //DJ_品名（英語）LINE1
                  new nlobjSearchColumn("custitem_djkk_product_name_line2"), //DJ_品名（英語）LINE2
                  //20230608 add by zzq CH599 end
                  new nlobjSearchColumn("custitem_djkk_product_code"), //カタログ製品コード
                  //20230608 add by zzq CH599 start
                  new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), //配送料フラグ
                  //20230608 add by zzq CH599 end
                //add by zzq 20230614 start
                  new nlobjSearchColumn("type")
                  //add by zzq 20230614 end
                ]
                ); 
             //20230608 add by zzq CH599 start
            var invoiceRateFormat = defaultEmpty(creditmemoRecord.getLineItemValue('item','rate',k));//単価
            if(!isEmpty(invoiceRateFormat)){
                invoiceRateFormat = parseFloat(invoiceRateFormat).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); 
            }
            nlapiLogExecution('DEBUG', 'invoiceRateFormatOne', invoiceRateFormat);
            if(!(Number(invoiceRateFormat)==0 && invoiceItemSearch[0].getValue("custitem_djkk_deliverycharge_flg") == 'T')){
                var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//商品コード
                var productCode= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("custitem_djkk_product_code"));//カタログ製品コード
              //20230608 add by zzq CH599 start
//              var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
//              invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;");
                
             // by add zzq CH671 20230704 start
                var invoiceItemType = defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("type")); //アイテムtype
                nlapiLogExecution('debug', 'invoiceItemType', invoiceItemType);
                var itemDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
                var invoiceDisplayName = '';
                var invoiceItemNouhinBikou = creditmemoRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',k); //DJ_納品書備考
                  if (invoiceItemType == 'OthCharge') { // アイテムは再販用その他の手数料
                    invoiceDisplayName = othChargeDisplayname(itemDisplayName, language); // 手数料
                    nlapiLogExecution('debug', 'invoiceDisplayName', invoiceDisplayName);
                } else {
                    if (!isEmpty(invoiceItemSearch)) {
                        // add by zzq start
                        // if(custLanguage == '日本語'){
                        if (language == SYS_LANGUAGE_JP) {
                            // add by zzq end
                            var jpName1 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_jpline1");
                            var jpName2 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_jpline2");
                                if (!isEmpty(jpName1) && !isEmpty(jpName2)) {
                                    invoiceDisplayName = jpName1 + ' ' + jpName2;
                                } else if (!isEmpty(jpName1) && isEmpty(jpName2)) {
                                    invoiceDisplayName = jpName1;
                                } else if (isEmpty(jpName1) && !isEmpty(jpName2)) {
                                    invoiceDisplayName = jpName2;
                                }
                        } else {
                            var enName1 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_line1");
                            var enName2 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_line2");
                                if (!isEmpty(enName1) && !isEmpty(enName2)) {
                                    invoiceDisplayName = enName1 + ' ' + enName2;
                                } else if (!isEmpty(enName1) && isEmpty(enName2)) {
                                    invoiceDisplayName = enName1;
                                } else if (isEmpty(enName1) && !isEmpty(enName2)) {
                                    invoiceDisplayName = enName2;
                            }
                        }

                    }
                }
                if (invoiceDisplayName) {
                    if (invoiceItemNouhinBikou) {
                      invoiceDisplayName = invoiceDisplayName + '<br/>' + invoiceItemNouhinBikou;
                    }
                } else {
                    if (invoiceItemNouhinBikou) {
                       invoiceDisplayName = invoiceItemNouhinBikou;
                    }
                }
                // 20230608 add by zzq CH599 end
                // 20230608 add by zzq CH599 start
             
//              var invoiceItemType= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("type"));//種類
//              if(invoiceItemType == 'OthCharge'){
//                  if(invoiceDisplayName){
////                    var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
//                  invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;");
//              }
//              }
                //add by zzq 20230614 end
             // by add zzq CH671 20230704 end
                var invoiceQuantity = defaultEmpty(creditmemoRecord.getLineItemValue('item','quantity',k));//数量
                var invoiceAmount = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item','amount',k)));//金額
                nlapiLogExecution('debug', 'invoiceAmount', typeof(invoiceAmount));
                //add by zzq 20330614 start
//              var invoAmountTotal = 0;
                //add by zzq 20330614 end
                if(!isEmpty(invoiceAmount)){
                    var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');   
                    nlapiLogExecution('debug', 'invoiceAmount1', typeof(invoiceAmount));
                    invAmount  += invoiceAmount;
                    // modify by lj start DENISJAPANDEV-1376
                    //add by zhou 20230517_CH508 start                  
//                  invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
                    invoAmountTotal = invoAmountTotal + invoiceAmount;
                    //add by zhou 20230517_CH508 end
                
                    nlapiLogExecution('debug', 'invoiceAmount2', typeof(invoiceAmount));
                    // modify by lj end DENISJAPANDEV-1376
                }else{
                    var invAmountFormat = '';
                }
            
                var invoiceTaxrate1Format = defaultEmpty(creditmemoRecord.getLineItemValue('item','taxrate1',k));//税率
                var invoiceTaxcode = defaultEmpty(creditmemoRecord.getLineItemValue('item','taxcode',k));//税率
                var invoiceTaxamount = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item','tax1amt',k)));//税額   
                invoiceTaxamount = defaultEmpty(isEmpty(invoiceTaxamount) ? 0 :  invoiceTaxamount);
              //add by zzq 20330614 start
//              var invTaxmountTotal = '0';
              //add by zzq 20330614 end
                if(!isEmpty(invoiceTaxamount)){
                    nlapiLogExecution('debug', 'invoiceTaxamount', typeof(invoiceTaxamount));
                    var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                    nlapiLogExecution('debug', 'invoiceTaxamount1', typeof(invoiceTaxamount));
                    invTaxamount += invoiceTaxamount;
                    //add by zhou 20230517_CH508 start
//                  invTaxmountTotal = invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
                  //add by zzq 20330614 start
                    invTaxmountTotal = invTaxamount;
//                  if(invoiceTaxrate1Format == '10.0%'){
//                      invTaxmountTotal10 = invTaxmountTotal10 + invoiceTaxamount;
//                  }else if(invoiceTaxrate1Format == '8.0%'){
//                      invTaxmountTotal8 = invTaxmountTotal8 + invoiceTaxamount;
//                  }
                  //add by zzq 20330614 end
                    //add by zhou 20230517_CH508 end
                }else{
                    var invTaxamountFormat = '';
                }
                nlapiLogExecution('debug', 'szk invAmount', invAmount);
                nlapiLogExecution('debug', 'szk invTaxamount', invTaxamount);
                nlapiLogExecution('debug', 'szk Number(invAmount+invTaxamount)', Number(invAmount+invTaxamount));
                 invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
                 nlapiLogExecution('debug', 'szk invoTotal', invoTotal);
                // modify by lj start DENISJAPANDEV-1376
                 //add by zzq 20330614 start
//              var invoToTotal = 0;
              //add by zzq 20330614 end
                if(!isEmpty(invoTotal)){
                    nlapiLogExecution('debug', 'invoTotal', typeof(invoTotal));
                    //add by zhou 20230517_CH508 start
//                  var invoToTotal = invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
                  //add by zzq 20330614 start
//                  var invoToTotal = invoToTotal + invoTotal;
                    invoToTotal = invoTotal;
                  //add by zzq 20330614 end
                    //add by zhou 20230517_CH508 end
                    nlapiLogExecution('debug', 'invoTotal1', typeof(invoTotal));
                }
                // modify by lj end DENISJAPANDEV-1376
                
                var invoiceUnitabbreviation = defaultEmpty(creditmemoRecord.getLineItemValue('item','units_display',k));//単位
                if(!isEmpty(language)&&!isEmpty(invoiceUnitabbreviation)){
                    var unitSearch = nlapiSearchRecord("unitstype",null,
                            [
                               ["abbreviation","is",invoiceUnitabbreviation]
                            ], 
                            [
                               new nlobjSearchColumn("abbreviation")
                            ]
                            );  
                    if(unitSearch != null){
                        if(language == SYS_LANGUAGE_EN){            //英語
                            units_display = unitSearch[0].getValue('abbreviation')+'';
                            unitsArray = units_display.split("/");
                            if(unitsArray.length == 2){
                                invoiceUnitabbreviation = unitsArray[1];
                            }
                        }else if(language == SYS_LANGUAGE_JP){              //日本語
                            units_display = unitSearch[0].getValue('abbreviation')+'';
                            unitsArray = units_display.split("/");
                            if(!isEmpty(unitsArray)){
                                invoiceUnitabbreviation = unitsArray[0];
                            }else if(unitsArray.length == 0){
                                invoiceUnitabbreviation = units_display;
                            }
                        }
                    }
                }
                // CH408 zheng 20230517 start
                var itemLocId = defaultEmpty(creditmemoRecord.getLineItemValue('item','location',k)); // 場所
                var locBarCode = '';
                if (itemLocId) {
                    var tmpDicBarCode = tmpLocationDic[itemLocId];
                    if (tmpDicBarCode) {
                        locBarCode = tmpDicBarCode;
                    }
                }
//              if(!isEmpty(invAmountFormat)){
//                  invAmountFormat = '-'+invAmountFormat;
//              }
//              if(!isEmpty(invTaxamountFormat)){
//                  invTaxamountFormat = '-'+invTaxamountFormat;
//              }
                // CH599 zzq 20230608 start
//              if(!isEmpty(productCode) && !isEmpty(locBarCode)){
//                  invoiceInitemid = invoiceInitemid+'<br/>'+ productCode+'<br/>'+locBarCode;
//              }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
//                  invoiceInitemid = invoiceInitemid+'<br/>'+ ' '+'<br/>'+locBarCode;
//              }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
//                  invoiceInitemid = invoiceInitemid+'<br/>'+ productCode+'<br/>'+' ';
//              }else{
//                  invoiceInitemid = invoiceInitemid+'<br/>'+ ' '+'<br/>'+' ';
//              }
                //CH734 20230717 by zzq start
                if(!isEmpty(productCode) && !isEmpty(locBarCode)){
                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode + ' ' + locBarCode;
                }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
                    invoiceInitemid = invoiceInitemid+'<br/>'+ locBarCode;
                }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
                    invoiceInitemid = invoiceInitemid+'<br/>'+ productCode;
                }else{
                    invoiceInitemid = invoiceInitemid+'<br/>'+ ' ';
                }
                //CH734 20230717 by zzq end
                // CH599 zzq 20230608 end
                
                // CH408 zheng 20230517 end
                itemLine.push({
                    invoiceInitemid:invoiceInitemid,  //商品コード
                    invoiceDisplayName:invoiceDisplayName,//商品名
                    invoiceQuantity:'-'+invoiceQuantity,//数量
                    invoiceRateFormat:invoiceRateFormat,//単価
                    invoiceAmount:invAmountFormat,//金額  
                    invoiceTaxrate1Format:invoiceTaxrate1Format,//税率
//                  invoiceTaxamount:invTaxamountFormat,//税額  
                    invoiceTaxamount:invoiceTaxamount,//税額  
                    invoiceUnitabbreviation:invoiceUnitabbreviation,
                    productCode:productCode,//カタログ製品コード
                    locBarCode:locBarCode,//DJ_場所バーコード
                    invoiceTaxcode :invoiceTaxcode//税率コード
                }); 
            }
         //20230608 add by zzq CH599 end
    }
    //20230625 add by zzq CH654 start
    var resultItemTaxArr = [];
    var invoiceTaxrate1FormatArr = [];
    for(var i = 0;i < itemLine.length; i++){
        nlapiLogExecution('DEBUG', 'itemLine[i].invoiceTaxrate1Format', itemLine[i].invoiceTaxrate1Format);
        var tax = invoiceTaxrate1FormatArr.indexOf(itemLine[i].invoiceTaxcode);
        if(tax > -1){
            if(itemLine[i].invoiceTaxamount){
                resultItemTaxArr[tax].invoiceTaxamount = parseFloat(resultItemTaxArr[tax].invoiceTaxamount) + parseFloat(itemLine[i].invoiceTaxamount);
            }
        }else{
            invoiceTaxrate1FormatArr.push(itemLine[i].invoiceTaxcode);
            var resultItemTaxObj = {};
            if(itemLine[i].invoiceTaxamount){
                resultItemTaxObj.invoiceTaxamount = itemLine[i].invoiceTaxamount;
            }else{
                resultItemTaxObj.invoiceTaxamount = 0;
            }
            resultItemTaxObj.invoiceTaxrate1Format = itemLine[i].invoiceTaxrate1Format;
            resultItemTaxObj.invoiceTaxcode = itemLine[i].invoiceTaxcode;
            resultItemTaxArr.push(resultItemTaxObj);
        }
    }
    resultItemTaxArr.sort(function(a, b) {
        if (a.invoiceTaxcode == 8) {
          return -1;
        } else if (b.invoiceTaxcode == 8) {
          return 1;
        } else if (a.invoiceTaxcode == 11) {
          return -1;
        } else if (b.invoiceTaxcode == 11) {
          return 1;
        } else if (a.invoiceTaxcode == 10) {
          return -1;
        } else if (b.invoiceTaxcode == 10) {
          return 1;
        } else {
          return 0;
        }
      });
    //20230731 CH756&CH757 by zdj start
    var swiftValue = '';
    if(language == SYS_LANGUAGE_EN){
        if(subsidiary == SUB_DPKK){
           bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
           bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
           bankType1 = 'No\xa0\:\xa0';
           bankNo1 = '1827718';
           swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
     }else if(subsidiary == SUB_SCETI){
           bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
           bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
           bankType1 = 'No\xa0\:\xa0';
           bankNo1 = '1798632';
           swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
     }else if(subsidiary == SUB_NBKK){
           bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
           bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
           bankType1 = 'No\xa0\:\xa0';
           bankNo1 = '0568447';
           swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
     }else if(subsidiary == SUB_ULKK){
           bankName1 = 'BANK\xa0\:\xa0'+'MUFG Bank,Ltd.';
           bankBranchName1 = 'BRANCH\xa0:\xa0'+'Aoyamadori';
           bankType1 = 'No\xa0\:\xa0';
           bankNo1 = '1895356';
           swiftValue   = 'SWIFT\xa0:\xa0'+'BOTKJPJT';
     }
     }else{
           bankName1 = bankName1;
           bankBranchName1 = bankBranchName1;
           bankType1 = bankType1;
           bankNo1 = bankNo1;
           bankName2 = bankName2;
           bankBranchName2 = bankBranchName2;
           bankType2 = bankType2;
           bankNo2 = bankNo2
    }
    //20230731 CH756&CH757 by zdj end
// add by zzq start
//if(custLanguage == '日本語'){
if(language == SYS_LANGUAGE_JP){
    //20230731 CH756&CH757 by zdj start
    var Vibration = '振込口座';
    //20230731 CH756&CH757 by zdj end
    // add by zzq end
    var dateName = '日\xa0\xa0付';
    var deliveryName = '納品日';
    var paymentName = '支払条件';
    var numberName = '番\xa0\xa0号';
    var numberName2 = '御社発注番号:';
    var codeName = 'コード';
    var invoiceName = '*\xa0\xa0\*\xa0\xa0\*請\xa0\xa0\xa0\xa0\求\xa0\xa0\xa0\xa0\書*\xa0\xa0\*\xa0\xa0\*';
    var quantityName = '数\xa0\xa0\xa0\xa0\xa0\xa0\xa0量';
    var unitpriceName = '単\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0価';
    var amountName = '金\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0額';
    var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\名';
    var taxRateName = '***\xa0\xa0\税\xa0率:';
    var taxAmountName = '税額:';
    var custCode = '顧客コード\xa0\xa0:';
    var destinationName = '納品先\xa0\xa0:';
    var totalName = '合\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0計';
    //add by zzq 20230614 start
    var consumptionTaxName = '消\xa0\xa0費\xa0\xa0税';
//  var consumptionTaxName10 = '消\xa0\xa0費\xa0\xa0税\xa010%';
//  var consumptionTaxName8 = '消\xa0\xa0費\xa0\xa0税\xa08%';
    //add by zzq 20230614 end
    var invoiceName1 = '御請求額';
    var personName = '担当者\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
    var memoName = '備\xa0\xa0考';
    var custName = '顧客名\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
    var addressNmae = '住所\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
    // CH756&CH757 20230731 by zdj start
    //var invoiceIssuerNumberName = '適格請求書発行事業者番号:';
    var invoiceIssuerNumberName = '登録番号:';
    // CH756&CH757 20230731 by zdj end
    var stomach =  '御中';
    //CH734 20230719 by zzq start
    if(invoiceCity){
        invoiceCity = invoiceCity + '&nbsp;' + address1;
    }else{
        invoiceCity = address1;
    }
    //CH734 20230719 by zzq end
}else{
    //20230731 CH756&CH757 by zdj start
    var Vibration = 'Bank Account';
    //20230731 CH756&CH757 by zdj end
    var dateName = 'Date';
    var deliveryName = 'Delivery Date';
    var paymentName = 'Payment Terms';
    //バリエーション支援 20230803 add by zdj start
//  var numberName = 'Number';
    var numberName = 'No';
    //バリエーション支援 20230803 add by zdj end
    var numberName2 = 'Order Number:';
    var codeName = 'Code';
    if(type == 'creditmemo'){
        var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Credit Memo*\xa0\xa0\*\xa0\xa0\*';
    }else{
        var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Invoice*\xa0\xa0\*\xa0\xa0\*';
    }
    var quantityName = 'Quantity';
    var unitpriceName = 'Unit Price';
    var amountName = 'Amount';
    var poductName = 'Product Name';
    var taxRateName = 'Tax Rate:';
    var taxAmountName = 'Tax:';
    var custCode = 'Customer Code:';
    var destinationName = 'Delivery:';
    var totalName = 'Total';
    //add by zzq 20230614 start
    var consumptionTaxName = 'Tax';
//  var consumptionTaxName10 = 'Excise Tax 10%';
//  var consumptionTaxName8 = 'Excise Tax 8%';
    //add by zzq 20230614 end
    var invoiceName1 = 'Invoice';
    //20230731 CH756&CH757 by zdj start
    var personName = 'PIC:';
    //var personName = 'Person:';
    //20230731 CH756&CH757 by zdj end
    var memoName = 'Memo';
    var custName = 'Customer Name:';
    var addressNmae = 'Address:';
    var invoiceIssuerNumberName = 'Registered Number:';
    var stomach =  ' ';
    //バリエーション支援  20230802 by zdj start
    //CH734 20230719 by zzq start
    var city = '';
    if(invoiceCity && invoiceZipcode){
        city = invoiceCity + '\xa0\xa0' + invoiceZipcode + '\xa0\xa0' + invoiceCountryEnAddress;
    }else if(invoiceCity && !invoiceZipcode){
        city = invoiceCity + '\xa0\xa0' + invoiceCountryEnAddress;
    }else if(invoiceZipcode && !invoiceCity){
        city = invoiceZipcode + '\xa0\xa0' + invoiceCountryEnAddress;
    }else{
        city = invoiceCountryEnAddress;
    }
    //CH734 20230719 by zzq end
    //バリエーション支援  20230802 by zdj start
}
// add by lj start DENISJAPANDEV-1376
//var invTaxmountTotal = parseInt(invoAmountTotal.replace(',','')) * 0.08;
//if(!isEmpty(invoTotal)){
//  var invoToTotal = (invTaxmountTotal + invoTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//}else{
//  var invoToTotal ='';
//}
//invTaxmountTotal = invTaxmountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
// add by lj start DENISJAPANDEV-1376
//var subsidiary = getRoleSubsidiary();
var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
'<pdf>'+
'<head>'+
'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
'<#if .locale == "zh_CN">'+
'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
'<#elseif .locale == "zh_TW">'+
'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
'<#elseif .locale == "ja_JP">'+
'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
'<#elseif .locale == "ko_KR">'+
'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
'<#elseif .locale == "th_TH">'+
'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
// add by zzq start
'<#elseif .locale == "en">'+
'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
// add by zzq end
'</#if>'+
'<macrolist>'+
'<macro id="nlheader">'+
'<table border="" style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
'<tr>'+
'<td>'+
'<table border="0" style="font-weight: bold;width:335px;">'+
'<tr style="height: 18px;" colspan="2"></tr>'+  
'<tr>'+
'<td style="border:1px solid black;" corner-radius="4%">'+
'<table border="0">'+
//'<tr style="height:10px;"><td style="width:250px;"></td><td></td></tr>'+
'<tr style="height:10px;"><td style="width:250px;"></td><td style="width:35px;"></td></tr>'+
'<tr>'
//CH734 20230717 by zzq start
//'<td>〒'+invoiceZipcode+'</td>'+
if (language == SYS_LANGUAGE_JP) {   
    str+='<td>〒'+invoiceZipcode+'</td>'
}else{
    //バリエーション支援  20230802 by zdj start
//    str+='<td>&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceZipcode+'</td>'
    str+='<td>&nbsp;&nbsp;&nbsp;&nbsp;'+custNameText+'</td>'
    //バリエーション支援  20230802 by zdj start
}
//CH734 20230717 by zzq end
    str+='<td align="right" style="margin-right:-22px;">&nbsp;</td>'+
'</tr>'+
'<tr>'+
'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invAddress+'</td>'+
    //add by zhou 20230601_CH598 start
//'<td align="right" style="padding-right: 30px;margin-top:-8px;">'+dealFugou(custNameText)+'</td>'+
    //add by zhou 20230601_CH598 end
'</tr>'
//CH734 20230719 by zzq start
var invoiceAddressDates = [];
if (address3) {
    invoiceAddressDates.push(address3)
}
if (address2) {
    invoiceAddressDates.push(address2)
}
if (address1) {
    invoiceAddressDates.push(address1)
}
if (city) {
    invoiceAddressDates.push(city)
}
//if (custNameText) {
//    invoiceAddressDates.push(custNameText)
//}
if(language == SYS_LANGUAGE_EN){
    if(invoiceAddressDates.length != 0){
        for(var i = 0; i < invoiceAddressDates.length; i++){
            str+= '<tr>'+
            '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceAddressDates[i]+'</td>'+
            '</tr>'
      }
        if(invoiceAddressDates.length <5){
            for(var k = invoiceAddressDates.length; k<5 ; k++){
            str+= '<tr>'+
            '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
            '</tr>'
            }
        }
    }
}else{
    //CH734 20230717 by zzq start
    str+= '<tr>'+
//  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
//  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'&nbsp;&nbsp;'+address1+'</td>'+
    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
    '</tr>'+
    '<tr>'+
//  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address1+'</td>'+
    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
    '</tr>'+
    '<tr>'+
//  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
       '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
    '</tr>'+
    '<tr>'+
//  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
    '<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(custNameText)+'</td>'+
    //'<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
    '<td align="left" style="padding-bottom:0px;margin-top:-8px;">'+stomach+'</td>'+
    '</tr>'+
    '<tr>'+
    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
    //20230731 CH756&CH757 by zdj start
    '</tr>'
    //20230731 CH756&CH757 by zdj end
}
//CH734 20230719 by zzq end
str+='<tr>'+
//CH734 20230717 by zzq start
//'<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(custNameText)+'</td>'+
'<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'
//'<td align="left" style="padding-bottom:0px;margin-top:-8px;">御中</td>'+
 str += '<td align="left" style="padding-bottom:0px;margin-top:-8px;">&nbsp;</td>' + 
 '</tr>';
// '<tr>';
//if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
//    str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
//    '</tr>'
////    '<tr>'+
////    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
////    '</tr>';
//}
//// modify by lj start DENISJAPANDEV-1376
//else{
////  str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Tel:'+invPhone+'</td>'+
////  '</tr>'+
////  '<tr>'+
////  '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Fax:'+invFax+'</td>'+
////  '</tr>';
//    str += '</tr>';
//}
// modify by lj end DENISJAPANDEV-1376

// CH756&CH757 20230731 by zdj start
// str += '<tr style="height: 40px;"></tr>'+
// '</table>'+
str += '<tr style="height: 30px;"></tr>'+
'</table>'+
// CH756&CH757 20230731 by zdj end
'</td>'+
'</tr>'+
'</table>'+
'</td>'+

'<td style="padding-left: 30px;">'+
'<table style="width: 320px;font-weight: bold;">'+
// CH756&CH757 20230731 by zdj start
'<tr style="height: 25px;">'+
//'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
'<td width="6%px" colspan="2">&nbsp;</td>'
nlapiLogExecution('DEBUG', 'subsidiary', subsidiary);
if(subsidiary == SUB_NBKK){
    str+='<td style="margin-top:-16px;" rowspan="5"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id='+NBKK_INSYOU_ID+'&amp;'+URL_PARAMETERS_C+'&amp;'+NBKK_INSYOU_URL+'" style="width:100px;height: 100px; position:absolute;top:25px;left:-82px;" /></td>'
}else if(subsidiary == SUB_ULKK){
    str+='<td style="margin-top:-16px;" rowspan="5"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id='+ULKK_INSYOU_ID+'&amp;'+URL_PARAMETERS_C+'&amp;'+NBKK_INSYOU_URL+'" style="width:100px;height: 100px; position:absolute;top:29px;left:-26px;" /></td>'
}else{
    str+='<td style="margin-top:-16px;" rowspan="5">&nbsp;</td>'
}
//  '<td colspan="2" style="width:50%;margin-top:-16px;"><img src="/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
str+='<td width = "10px">&nbsp;</td>'
str+='</tr>';
// CH756&CH757 20230731 by zdj start
//20230208 changed by zhou start CH298
//20230628 changed by zzq start CH701
//if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
//  str+='<tr>'+
//  //add by zhou 20230601_CH598 start
//  '<td colspan="2" style="margin-left:-72px;margin-top:-8px;">&nbsp;'+dealFugou(custNameText)+'</td>'+
//  //add by zhou 20230601_CH598 end
//  '</tr>';
//}
//20230628 changed by zzq start CH701
//end
str+='<tr>'+
'<td style="font-size:17px;margin-top:-5px;" colspan="3">'+invoiceNameEng+'&nbsp;</td>'+
'</tr>'+
'<tr>'+
//'<td style="font-size: 20px;margin-top:-2px;font-family: NotoSansCJKkr_Bold ; " colspan="3" >'+invoiceLegalname+'&nbsp;</td>'+
'<td colspan="3" ><span style="font-size: 19px;font-family: heiseimin;" >'+invoiceLegalname+'</span>&nbsp;</td>'+
'</tr>'+
'<tr>'+
//'<td colspan="2" style="font-size: 10px;margin-top:-2px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'&nbsp;</td>'+
'<td colspan="3" style="font-size: 10px;margin-top:-2px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'&nbsp;</td>'+
'</tr>'+
'<tr>'
//CH734 20230717 by zzq start
//if (language == SYS_LANGUAGE_JP) {   
//'<td colspan="2" style="font-size: 10px;margin-top:-2px;">〒'+invoiceAddressZip+'&nbsp;</td>'
    str+='<td colspan="2" style="font-size: 10px;margin-top:-2px;">〒'+invoiceAddressZip+'&nbsp;</td>'
//}else{
//  str+='<td colspan="2" style="font-size: 10px;margin-top:-2px;">'+invoiceAddressZip+'&nbsp;</td>'
//}
//CH734 20230717 by zzq end
str+='</tr>'+
'<tr>'+
'<td colspan="3" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+invoiceAddressThree+'&nbsp;</td>'+
'</tr>'+
'<tr>'+
'<td style="font-size: 10px;margin-top:-4px;">TEL:&nbsp;'+invoicePhone+'</td>'+
'<td style="font-size: 10px;margin-top:-4px;">FAX:&nbsp;'+invoiceFax+'</td>'+
'</tr>'+
'<tr>'+
'<td colspan="3" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressEng+'</td>'+
'</tr>'+
'</table>'+
'</td>'+
'</tr>'+
'</table>';

str+='<table style="width: 660px;margin-top: 10px;font-weight: bold;">'+
'<tr>'+
'<td style="line-height: 30px;font-weight:bold;font-size: 11pt;border: 1px solid black;height: 30px;width:660px;" align="center" colspan="5">'+invoiceName+'</td>'+
'</tr>'+
'</table>'+ 
'<table style="width: 660px;font-weight: bold;">'+
'<tr>'+
'<td style="width:510px;margin-top:-5px;margin-left:-20px;" colspan="2">&nbsp;</td>'+
'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;" align="right"></td>'+
'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
'</tr>'+    
'<tr padding-bottom="-11px">'+
'<td style="width: 225px;">&nbsp;&nbsp;'+dateName+'&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
'<td style="width: 285px;margin-left:-25px;">'+deliveryName+'&nbsp;:&nbsp;'+delivery_date+'</td>'+
'<td style="width: 50px;"></td>'+
'<td style="width: 50px;"></td>'+
'<td style="width: 50px;"></td>'+
'</tr>'+
'<tr>'+
'<td style="width: 225px;margin-top:-8px;">&nbsp;</td>'+
// modify by lj start DENISJAPANDEV-1385
//'<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+payment+'</td>'+
// add zhou CF413 20230523 start
'<td style="width: 285px;margin-top:-8px;margin-left:-25px;">&nbsp;</td>'+
//'<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+ customerPayment + '</td>'+
// add zhou CF413 20230523 end
// modify by lj END DENISJAPANDEV-1385
'<td style="width: 50px;margin-top:-8px;"></td>'+
'<td style="width: 50px;margin-top:-8px;"></td>'+
'<td style="width: 50px;margin-top:-8px;"></td>'+
'</tr>'+
'<tr>'+
// add zhou CF413 20230523 start
//'<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'+
//'<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+'&nbsp;'+otherrefnum+'</td>'+
'<td style="width: 300px;margin-top:-8px;">&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'+
'<td style="width: 100px;margin-left:-25px;margin-top:-8px;">'+paymentName+'&nbsp;:&nbsp;'+ customerPaymentTerms + '</td>'+
'<td style="width: 260px;margin-left:-50px;margin-top:-8px;" colspan="3">&nbsp;'+numberName2+''+dealFugou(otherrefnum)+'</td>'+
// add zhou CF413 20230523 end
'</tr>';

// modify by lj start DENISJAPANDEV-1376
//20221206 add by zhou CH116 start
//changed by zhou 20230208 CH298 
//if((subsidiary != SUB_SCETI && subsidiary != SUB_DPKK ) &&  type != 'creditmemo'){
//  str+='<tr>'+
//  '<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;通貨コード&nbsp;:'+currency+'</td>'+
//  '<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">価格コード&nbsp;:'+priceCode+'</td>'+
//  '</tr>';
//}
//end
// modify by lj end DENISJAPANDEV-1376
str+= '</table>'+

'<table style="width: 660px;font-weight: bold;" border="0">';   
str+='<tr>';
    var tmpMemo = '';
    if (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) {
        tmpMemo = dvyMemo;
    } else {
        tmpMemo = memo;
    }
    nlapiLogExecution('DEBUG', 'tmpMemo', tmpMemo);
    if(!isEmpty(tmpMemo)){
        // add by zhou ch598 20230601 start
//      str+='<td style="width: 330px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+tmpMemo+'</td>'+
        str+='<td style="width: 330px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+dealFugou(tmpMemo)+'</td>'+
        // add by zhou ch598 20230601 end
        '<td style="width: 110px;">&nbsp;</td>'+
        '<td style="width: 100px;">&nbsp;</td>'+
        '<td style="width: 100px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
        '</tr>';
    }else{
        str+='<td style="width: 130px;margin-top:-8px;">&nbsp;</td>'+
        '<td style="width: 200px;">&nbsp;</td>'+
        '<td style="width: 110px;">&nbsp;</td>'+
        '<td style="width: 100px;">&nbsp;</td>'+
        '<td style="width: 100px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
        '</tr>';
    }
str+= '</table>';
    
str+= '<table border="0" style="width: 660px;font-weight: bold;">'; 
str+='<tr style="border-bottom: 1px solid black;">'+
'<td style="width: 130px;">&nbsp;&nbsp;'+codeName+'</td>'+
'<td style="width: 210px;" align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+poductName+'</td>'+
'<td style="width: 110px;">&nbsp;&nbsp;'+quantityName+'</td>'+
'<td style="width: 100px;">&nbsp;&nbsp;'+unitpriceName+'</td>'+
'<td style="width: 100px;">&nbsp;&nbsp;'+amountName+'</td>'+
'</tr>'+
'</table>'+
'</macro>'+
'<macro id="nlfooter">'+
'<table border="0" style="border-top: 1px solid black;width: 660px;font-weight: bold;">'+
'<tr style="padding-top:5px;">'+
'<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
nlapiLogExecution('debug', 'entityid', entityid);
if(!isEmpty(incoicedelivery_Name)){
    str+='<td style="width:270px;">'+destinationName+'&nbsp;'+dealFugou(incoicedelivery_Name)+'</td>';
}else{
    str+='<td style="width:270px;">'+destinationName+'</td>';
}
//add by zhou 20230517_CH508 start
// add by zzq start
//if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
// add by zzq end
    var invoAmountTotal0 =  parseFloat(invoAmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
}else{
    nlapiLogExecution('debug', 'invoAmountTotal', parseFloat(invoAmountTotal));
    var invoAmountTotal0 =  parseFloat(invoAmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}
//add by zhou 20230517_CH508 enda
//var dealSalesrep = ''; 
//if (salesrep) {
//  var tmpSalesreps = salesrep.split(' ');
//  if (tmpSalesreps && tmpSalesreps.length > 1) {
//      tmpSalesreps.reverse();
//      tmpSalesreps.pop();
//      tmpSalesreps.reverse();
//      dealSalesrep = tmpSalesreps.join(' ');
//  }
//}
 if( Number(invoAmountTotal0)){
     invoAmountTotal0 = '-'+invoAmountTotal0
 }
str+='<td style="width:80px;">&nbsp;&nbsp;'+totalName+'</td>'+
'<td style="width:90px;" align="right">'+invoAmountTotal0+'</td>'+
'</tr>'+
'<tr>'+
'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>'
if(!isEmpty(invdestinationZip)){
  //CH734 20230717 by zzq start
    if(language == SYS_LANGUAGE_JP){
        str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒' + invdestinationZip + '</td>';
    }else{
        str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒' + invdestinationZip + '</td>';
    }
//        if (language == SYS_LANGUAGE_JP) {
//            str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒' + invdestinationZip + '</td>';
//        } else {
//            str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + invdestinationZip + '</td>';
//        }
  //CH734 20230717 by zzq end
}
str+='</tr>'+
'<tr>'+
// 顧客名
//add by zhou 20230720_CH598 start
//add by zhou 20230601_CH598 start
//'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + custName +dealFugou(custNameText)+ '</td>';
'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//add by zhou 20230601_CH598 end
//add by zhou 20230720_CH598 end
if(!isEmpty(invdestinationState)){
    if(language == SYS_LANGUAGE_JP){
    str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
    }else{
        str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
    }
}else{
    str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
}
//add by zhou 20230517_CH508 start
// add by zzq start
//if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//add by zzq 20230625 CH654 start
// add by zzq 20230614 start

// if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//       var consumptionTax8 = parseFloat(invTaxmountTotal8).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//   }else{
//       var consumptionTax8 = displaysymbol + parseFloat(invTaxmountTotal8).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//   }
// add by zzq 20230614 end
   if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
       var consumptionTax0 = parseFloat(invTaxmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
   }else{
       var consumptionTax0 = parseFloat(invTaxmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
   }
 //add by zzq 20230625 CH654 end
//str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
//'<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax0+'</td>'+
 //add by zzq 20230625 CH654 start
//str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName8+'</td>'+
//'<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax8+'</td>'+
if( Number(consumptionTax0)){
   consumptionTax0 = '-'+consumptionTax0
 }
str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
'<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax0+'</td>'+
//add by zzq 20230625 CH654 end
'</tr>'+
//add by zhou 20230517_CH508 end
'<tr>'+
//住所
//add by zzq 20230720_CH672 start
//'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + addressNmae  + dealFugou(invoiceAddressState) + '</td>';
'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;</td>';
//add by zzq 20230720_CH672 end
//'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
    if(language == SYS_LANGUAGE_JP){
    str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationCity)+dealFugou(invdestinationAddress)+'</td>';
    }else{
        str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationCity)+dealFugou(invdestinationAddress)+'</td>';
    }
}

str+='</tr>'+

'<tr>'+
//add by zzq 20230720_CH672 start
//'<td style="width:220px;margin-top:-8px;;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + dealFugou(invoiceCityUnder) + '</td>';
'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//add by zzq 20230720_CH672 end
if(!isEmpty(invdestinationAddress2)){
    if(language == SYS_LANGUAGE_JP){
    str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress2)+'</td>';
    }else{
        str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress2)+'</td>';
    }
}else{
    str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
}
//add by zhou 20230517_CH508 start
// add by zzq start
//if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
// add by zzq end
    var invoToTotal0 = parseFloat(invoToTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
}else{
    var invoToTotal0 = parseFloat(invoToTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}
//add by zhou 20230601_CH598 start
//str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'</td>'+
//add by zzq 20230614 start
var invoiceSymbol = invoiceName1+'&nbsp;&nbsp;';
//add by zzq 2023025 CH654 start
//if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//    // add by zzq end
//        var consumptionTax10 = parseFloat(invTaxmountTotal10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//    }else{
//        var consumptionTax10 = displaysymbol + parseFloat(invTaxmountTotal10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//    }
//add by zzq 2023025 CH654 end
//add by zzq 20230614 end
//add by zzq 20230614 start
if( Number(invoToTotal0)){
    invoToTotal0 = displaysymbol+'-'+invoToTotal0
 }else{
     invoToTotal0 = displaysymbol+invoToTotal0
 }
str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'&nbsp;&nbsp;</td>'+
////add by zhou 20230601_CH598 end
'<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal0+'</td>';
   //add by zzq 2023025 CH654 start
//str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName10+'</td>'+
str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;</td>'+
//add by zhou 20230601_CH598 end
//'<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax10+'</td>'+
'<td style="width:100px;margin-top:-8px;" align="right">&nbsp;</td>'+
  //add by zzq 2023025 CH654 end
//add by zzq 20230614 end
//add by zhou 20230517_CH508 end
'</tr>';
//住所
// add by CH599 20230609 zzq start
//add by CH653 20230619 start
//add by CH653 20230720 zzq start
//'<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>' +
if(!isEmpty(invdestinationAddress3)){
//    str+='<tr><td style="margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td>' +
    str+='<tr><td style="margin-top:-8px;margin-left:26px"></td>'
    if(language == SYS_LANGUAGE_JP){
        str+='<td style="width:220px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress3)+'</td></tr>';
    }else{
        str+='<td style="width:220px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress3)+'</td></tr>';
    }
}else{
//    str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>';
    str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>';
}
//add by CH653 20230619 end
//'<tr><td style="margin-top:-8px;margin-left:26px" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td>' +
//add by zzq 20230614 start
//str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td></tr>' +
str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>' +
//str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td>' +
//'<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceSymbol + '</td>' +
//'<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal0+'</td></tr>' +
//add by zzq 20230614 end
//'<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address3 + '</td></tr>' +
'<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>' +
//'<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>' +
//'<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td></tr>' +
//'<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address3 + '</td></tr>' +
// add by CH599 20230609 zzq end
//add by CH653 20230720 zzq end
'</table>'+
'<table style="width: 660px;font-weight: bold;">'
//20230731 CH756&CH757 by zdj start
//'<tr><td colspan="3" style="width:220px;margin-top:-8px;margin-left:7px">'+Vibration+'</td></tr>';
//'<tr><td colspan="3" style="width:220px;margin-top:-8px;margin-left:7px">振込口座</td></tr>';

if(language == SYS_LANGUAGE_JP){
   if(bankName1){
        //20230731 CH756&CH757 by zdj start
//    str+='<tr>'+
        str+='<tr padding-top="1px">'+
        //20230731 CH756&CH757 by zdj end
            '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankName1+'</td>'+
            '<td style="margin-top:-8px;margin-left:7px;width:18%">'+bankBranchName1+'</td>'+
            '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
          //'<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankNo1+'</td>'+
          '<td style="margin-top:-8px;margin-left:7px;width:22%">&nbsp;</td>'+
          '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
            '</tr>';
    };
    //20230731 CH756&CH757 by zdj start
//  if(bankName1 && bankName2){
////        str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
//    str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
//  }
    //20230731 CH756&CH757 by zdj start
    if(bankName2){
        //20230731 CH756&CH757 by zdj start
        str+='<tr padding-top="1px">'+
        //20230731 CH756&CH757 by zdj start
        '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName2+'</td>'+
        '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankBranchName2+'</td>'+
        '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
//    '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankNo2+'</td>'+
      '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
      '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
        '</tr>';
        };
    }else{
        if(bankName1){
          //バリエーション支援 20230804 add by zdj start
            str+='<tr>'+
            '<td>&emsp;</td>'+
            '</tr>'
          //バリエーション支援 20230804 add by zdj end
            //20230731 CH756&CH757 by zdj start
//        str+='<tr>'+
            str+='<tr padding-top="1px">'+
            //20230731 CH756&CH757 by zdj end
//                '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankName1+'</td>'+
//                '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankBranchName1+'</td>'+
//                '<td style="margin-top:-8px;margin-left:7px;width:25%">'+swiftValue+'</td>'+
//                '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankType1+bankNo1+'</td>'+
             //バリエーション支援 20230803 add by zdj start
            '<td  colspan = "3" style="margin-top:-8px;margin-left:7px;width:25%">'+bankName1+'&emsp;'+bankBranchName1+'&emsp;'+swiftValue+'&emsp;'+bankType1+bankNo1+'</td>'+
             //バリエーション支援 20230803 add by zdj end
//            '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo1+'</td>'+
                '</tr>';
        };
        //20230731 CH756&CH757 by zdj start
    //  if(bankName1 && bankName2){
////            str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
//        str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
    //  }
        
//        if(bankName2){
//            str+='<tr padding-top="1px">'+
//            '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankName2+'</td>'+
//            '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankBranchName2+'</td>'+
//            '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
//            '<td style="margin-top:-8px;margin-left:7px;width:25%">'+SWIFTValue+'</td>'+
//            '</tr>';
//            };
    }
//if(bankName1){
//  //20230731 CH756&CH757 by zdj start
////    str+='<tr>'+
//  str+='<tr padding-top="1px">'+
//  //20230731 CH756&CH757 by zdj end
//      '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName1+'</td>'+
//      '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName1+'</td>'+
//      '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
////        '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo1+'</td>'+
//      '</tr>';
//};
////20230731 CH756&CH757 by zdj start
////if(bankName1 && bankName2){
//////  str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
////    str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
////}
////20230731 CH756&CH757 by zdj start
//if(bankName2){
//  //20230731 CH756&CH757 by zdj start
//  str+='<tr padding-top="1px">'+
//  //20230731 CH756&CH757 by zdj start
//  '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName2+'</td>'+
//  '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName2+'</td>'+
//  '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
////    '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo2+'</td>'+
//  '</tr>';
//};
//20230731 CH756&CH757 by zdj end
str+='</table>'+
'</macro>'+
'</macrolist>'+


'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
'<#if .locale == "zh_CN">'+
'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
'<#elseif .locale == "zh_TW">'+
'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
'<#elseif .locale == "ja_JP">'+
'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
'<#elseif .locale == "ko_KR">'+
'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
'<#elseif .locale == "th_TH">'+
'font-family: NotoSans, NotoSansThai, sans-serif;'+
// add by zzq start
'<#elseif .locale == "en">'+
'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
// add by zzq end    
'<#else>'+
'font-family: NotoSans, sans-serif;'+
'</#if>'+
'}'+
'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
'td { padding: 4px 6px;}'+
'b { font-weight: bold; color: #333333; }'+
'.nav_t1 td{'+
'width: 110px;'+
'height: 20px;'+
'font-size: 13px;'+
'display: hidden;'+
'}'+
'</style>'+
'</head>';

// CH756&757 20230731 by zdj start
// str+='<body header="nlheader" header-height="30%" padding="0.5in 0.5in 0.5in 0.5in" size="A4" footer="nlfooter" footer-height="12%">'+
str+='<body header="nlheader" header-height="26%" padding="0.2in 0.5in 0.3in 0.5in" size="A4" footer="nlfooter" footer-height="10%">'+
//'<table style="width: 660px;font-weight: bold;" padding-top="10px">'; 
'<table style="width: 660px;font-weight: bold;" padding-top="54px">'; 
// CH756&757 20230731 by zdj end
//str+='<tr>'+
//'<td style="width: 130px;"></td>'+
//'<td style="width: 210px;"></td>'+
//'<td style="width: 110px;"></td>'+
//'<td style="width: 100px;"></td>'+
//'<td style="width: 100px;"></td>'+
//'</tr>';
for(var i = 0;i<itemLine.length;i++){
    //add by zzq CH703 20230714 start
    var itemQuantity = formatAmount1(itemLine[i].invoiceQuantity);
    //add by zzq CH703 20230714 end
    str+='<tr>'+
    // add by CH599 20230609 zzq start
//  '<td style="width: 130px;" rowspan="3">&nbsp;'+itemLine[i].invoiceInitemid+'</td>'+
    '<td style="width: 130px;">'+itemLine[i].invoiceInitemid+'</td>'+
    // add by CH599 20230609 zzq end
    '<td style="width: 210px;">'+dealFugou(itemLine[i].invoiceDisplayName)+'</td>'+
     //add by zzq CH703 20230714 start
//  '<td style="width: 110px;" align="center">'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>';
    '<td style="width: 110px;" align="right">'+itemQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>';
    //add by zzq CH703 20230714 end
    // add by zzq start
//  if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
    if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
    // add by zzq end
        var itemRateForma = itemLine[i].invoiceRateFormat;
        //nlapiLogExecution('DEBUG', 'itemRateForma', itemRateForma);
        var itemAmount = itemLine[i].invoiceAmount;
        if(itemAmount){
            itemAmount = itemAmount.split('.')[0]
        }
        if(Number(itemAmount)){
            itemAmount = '-'+itemAmount
        }
        str+= '<td style="width: 100px;" align="right">'+itemRateForma.split('.')[0]+'</td>'+
        '<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemAmount+'</td>'+
        '</tr>';
    }else{
        var itemAmount = itemLine[i].invoiceAmount
        if(itemAmount){
            itemAmount = '-'+itemLine[i].invoiceAmount
        }
        str+= '<td style="width: 100px;" align="right">'+itemLine[i].invoiceRateFormat+'</td>'+
        '<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemAmount+'</td>'+
        '</tr>';
    }
    
//  str+= '<tr>'+
////    '<td style="width: 130px;">&nbsp;'+itemLine[i].productCode+'</td>'+
//  '<td style="width: 210px;">&nbsp;</td>'+
//  '<td style="width: 110px;" align="right">&nbsp;</td>';
//    str+='<td style="width: 100px;">&nbsp;</td>';
//    str+='<td style="width: 100px;" align="right">&nbsp;</td>';
//  str+='</tr>';
//  
//  // CH408 zheng 20230518 start
//    str+= '<tr>'+
////    '<td style="width: 130px;">&nbsp;'+itemLine[i].locBarCode+'</td>'+
//    '<td style="width: 210px;">&nbsp;</td>'+
//    '<td style="width: 110px;" align="right">&nbsp;</td>';
//    str+='<td style="width: 100px;">&nbsp;</td>';
//    str+='<td style="width: 100px;" align="right">&nbsp;</td>';
//    str+='</tr>';
    
//    str+= '<tr>'+
//    '<td style="width: 130px;margin-left: 36px;">&nbsp;</td>'+
//    '<td style="width: 210px;">&nbsp;</td>'+
//    '<td style="width: 110px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'</td>';
// // add by zzq start
////  if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//    if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//    // add by zzq end
//        var itemTaxamount = itemLine[i].invoiceTaxamount;
//        str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//        str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount.split('.')[0]+'</td>';
//    }else{
//        str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//        str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+displaysymbol+itemLine[i].invoiceTaxamount+'</td>';
//    }
//    // CH408 zheng 20230518 end
//    
//    str+='</tr>';
}
for(var k = 0;k<resultItemTaxArr.length;k++){
    str+= '<tr>'+
    '<td style="width: 130px;margin-left: 36px;">&nbsp;</td>'+
    '<td style="width: 210px;">&nbsp;</td>'+
    '<td style="width: 110px;" align="right" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'&nbsp;'+resultItemTaxArr[k].invoiceTaxrate1Format+'&nbsp;&nbsp;'+taxAmountName+'</td>';
 // add by zzq start
    var itemTaxamount = resultItemTaxArr[k].invoiceTaxamount;
    if(language == SYS_LANGUAGE_JP && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
        // add by zzq end
//        itemTaxamount = itemTaxamount.toString();
        if(!itemTaxamount){
            itemTaxamount = 0;
        }else{
            itemTaxamount = itemTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            itemTaxamount = itemTaxamount.split('.')[0];
        }
//        str+='<td style="width: 100px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//        str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount+'</td>';
    }else{
//        itemTaxamount = itemTaxamount.toString();
        if(!itemTaxamount){
            itemTaxamount = 0;
        }else{
            itemTaxamount = itemTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        }
//        str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//        str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount+'</td>';
    }
    if(itemTaxamount){
        itemTaxamount = '-'+itemTaxamount;
    }
    str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount+'</td>';
    // CH408 zheng 20230518 end
    
    str+='</tr>';
}
str+='</table>';
str+='</body>';

str += '</pdf>';
    var renderer = nlapiCreateTemplateRenderer();
    renderer.setTemplate(str);
    var xml = renderer.renderToString();
    var xlsFile = nlapiXMLToPDF(xml);
    // PDF
    xlsFile.setName(fileName + '.pdf');
    //20230901 add by CH762 zzq start 
    var SAVE_FOLDER = CREDITMEMO_PDF_IN_MAIL_DJ_CREDITMEMOPDF;
    if(subsidiary == SUB_NBKK){
        SAVE_FOLDER = CREDITMEMO_PDF_IN_MAIL_DJ_CREDITMEMOPDF_NBKK;
    }else if(subsidiary == SUB_ULKK){
        SAVE_FOLDER = CREDITMEMO_PDF_IN_MAIL_DJ_CREDITMEMOPDF_ULKK;
    }
   //20230901 add by CH762 zzq end 
    xlsFile.setFolder(SAVE_FOLDER);
    xlsFile.setIsOnline(true);
    // save file
    nlapiLogExecution('debug', 'start', 'クレジットメモ 個別請求書  PDF making end')
    var fileID = nlapiSubmitFile(xlsFile);
    nlapiLogExecution('debug', 'クレジットメモ 個別請求書  PDF fileID', fileID)
    return fileID;
    // 20230727 add by zdj end

// //クレジットメモ FOODFORM - 個別請求書
// nlapiLogExecution('debug','start','クレジットメモ 個別請求書 PDF making start')
// nlapiLogExecution('debug','クレジットメモid',id)
// //add bu zzq CH630 20230617 start
// //クレジットメモ
// nlapiLogExecution('debug','start','start')
// var invAmount = 0;
// var invTaxamount = 0;
// var itemLine = new Array();
// var creditmemoId = id; //creditmemoID
// var creditmemoRecord = nlapiLoadRecord('creditmemo',creditmemoId);
// var tmpLocationDic = getLocations(creditmemoRecord);
// var entity = creditmemoRecord.getFieldValue('entity');//顧客
// var customerSearch= nlapiSearchRecord("customer",null,
// [
// ["internalid","anyof",entity]
// ],
// [
// new nlobjSearchColumn("address2","billingAddress",null), //請求先住所2
// new nlobjSearchColumn("address3","billingAddress",null), //請求先住所3
// new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
// new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
// new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県
//                new nlobjSearchColumn("phone"), //電話番号
//                new nlobjSearchColumn("fax"), //Fax `
//                new nlobjSearchColumn("entityid"), //id
//                new nlobjSearchColumn("companyname"), //naem
//                new nlobjSearchColumn("salesrep"), //販売員（当社担当）
//                new nlobjSearchColumn("language"),  //言語
//                new nlobjSearchColumn("currency"),  //基本通貨
//                new nlobjSearchColumn("custrecord_djkk_pl_code_fd","custentity_djkk_pl_code_fd",null),   //DJ_販売価格表コード（食品）
//                new nlobjSearchColumn("custentity_djkk_customer_payment"), //DJ_顧客支払条件
//                new nlobjSearchColumn("address1","billingAddress",null) //請求先住所1
//
//            ]
//            );  
//    var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//住所2
//    var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//住所3
//    var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//市区町村
//    var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//郵便番号
//    var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//都道府県 
//    var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//電話番号
//    var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
//    var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
//    var custNameText= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//name add by zhou
//    var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//販売員（当社担当）
//    var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//言語
//    var currency= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("currency"));//販売員（当社担当）
//    var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_pl_code_fd","CUSTENTITY_DJKK_PL_CODE_FD",null));//DJ_販売価格表コード（食品）code
//    var customerPayment = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_customer_payment"));//add by lj
//    var address1 = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address1","billingAddress",null));//add by lj
//    var trandate = defaultEmpty(creditmemoRecord.getFieldValue('trandate'));    //クレジットメモ日付
//    var delivery_date = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_date'));    //クレジットメモ納品日
//    var tranid = defaultEmpty(creditmemoRecord.getFieldValue('tranid'));    //クレジットメモ番号
//    var transactionnumber = defaultEmpty(creditmemoRecord.getFieldValue('transactionnumber'));    //トランザクション番号　221207王より追加
//    var createdfrom = defaultEmpty(creditmemoRecord.getFieldValue('createdfrom'));    //クレジットメモ作成元
//    var otherrefnum = '';//御社発注番号
//    var otherrefnum = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_customerorderno'));    //先方発注番号
//    var soNumber = '';
//    if(!isEmpty(createdfrom)){
//        var transactionSearch = nlapiSearchRecord("transaction",null,
//                [
//                   ["internalid","anyof",createdfrom]
//                ], 
//                [
//                   new nlobjSearchColumn("transactionnumber")
//                ]
//                );
//        
//        
//        if(!isEmpty(transactionSearch)){
//                var createdfromTran = defaultEmpty(transactionSearch[0].getValue("transactionnumber")); //作成元    トランザクション番号
//        }
//    }
//    var payment = defaultEmpty(creditmemoRecord.getFieldText('custbody_djkk_payment_conditions'));    //クレジットメモ支払条件
//    var salesrep = defaultEmpty(creditmemoRecord.getFieldText('salesrep'));    //営業担当者
//    var memo = defaultEmpty(creditmemoRecord.getFieldValue('memo'));    //memo
//    var dvyMemo = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_deliverynotememo')); //納品書備考
//    var subsidiary = defaultEmpty(creditmemoRecord.getFieldValue('subsidiary'));    //クレジットメモ子会社
//    var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
//            [
//                ["internalid","anyof",subsidiary]
//            ], 
//            [
//                new nlobjSearchColumn("legalname"),  //正式名称
//                new nlobjSearchColumn("name"), //名前
//                new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
//                new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
//                new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
//                new nlobjSearchColumn("address1","address",null), //住所1
//                new nlobjSearchColumn("address2","address",null), //住所1
//                new nlobjSearchColumn("address3","address",null), //住所2
//                new nlobjSearchColumn("city","address",null), //市区町村
//                new nlobjSearchColumn("zip","address",null), //郵便番号
//                new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
//                new nlobjSearchColumn("phone","address",null), //phone
//                new nlobjSearchColumn("custrecord_djkk_invoice_issuer_number"),//適格請求書発行事業者番号
//                new nlobjSearchColumn("custrecord_djkk_bank_1"),//DJ_銀行1
//                new nlobjSearchColumn("custrecord_djkk_bank_2"),//DJ_銀行2
//                //CH655 20230725 add by zdj start
//                new nlobjSearchColumn("phone","shippingAddress",null),//配送先phone
//                new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null),//配送先fax
//                //CH655 20230725 add by zdj end
//            ]
//            );  
//    var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//正式名称
//    var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//名前
//    var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address1","address",null));//住所1
//    var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//住所2
//    var invoiceAddressThree= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//住所3
//    var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//郵便番号
//    var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//市区町村
//    var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
//    var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
//    var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//住所英語
//    var invoiceFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax
//    var invoicePhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","address",null));//phone
//    var invoiceIssuerNumber= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_invoice_issuer_number"));//適格請求書発行事業者番号
//    var bank1 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_1");
//    var bank2 = isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_bank_2");
//    var bankInfo = [];
//    var bank1Value = '';
//    var bank2Value = '';
//    if(bank1){
//        bank1 = nlapiLoadRecord('customrecord_djkk_bank', bank1);
//        var bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name'));
//        if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))){
//            bankName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_code'))+')';
//        }
//        var bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'));
//        if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code'))){
//            bankBranchName1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
//        }
//        var bankType1 = defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_type'));
//        var bankNo1 = '';
//        if(defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'))){
//            bankNo1 = 'No.'+ defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
//        }
//    }
//    if(bank2){
//        bank2 = nlapiLoadRecord('customrecord_djkk_bank', bank2);
//        var bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name'));
//        if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))){
//            bankName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name')) + '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_code'))+')';
//        }
//        var bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'));
//        if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code'))){
//            bankBranchName2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name'))+ '(' +defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_code')) + ')';
//        }
//        var bankType2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_type'));
//        var bankNo2 = '';
//        if(defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'))){
//            bankNo2 = 'No.'+ defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
//        }
//    }
//    var incoicedelivery_destination = creditmemoRecord.getFieldValue('custbody_djkk_delivery_destination');    //クレジットメモ納品先
//    if(!isEmpty(incoicedelivery_destination)){  
//        
//        var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
//                [
//                    ["internalid","anyof",incoicedelivery_destination]
//                ], 
//                [
//                    new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
//                    new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
//                    new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
//                    new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
//                    new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
//                    new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_納品先名前
//                          
//                ]
//                );  
//        var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//郵便番号
//        var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//都道府県
//        var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_市区町村
//        var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_納品先住所1
//        var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_納品先住所2
//        var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_納品先名前
//    }
//    
//    var invoiceCount = creditmemoRecord.getLineItemCount('item');
//    for(var k=1;k<invoiceCount+1;k++){
//        creditmemoRecord.selectLineItem('item',k);
//        var invoiceItemId = creditmemoRecord.getLineItemValue('item','item',k); //item
//        var invoiceItemSearch = nlapiSearchRecord("item",null,
//                [
//                    ["internalid","anyof",invoiceItemId],
//                ],
//                [
//                  new nlobjSearchColumn("itemid"), //商品コード
//                  new nlobjSearchColumn("displayname"), //商品名
//                  new nlobjSearchColumn("custitem_djkk_product_code"), //カタログ製品コード
//                ]
//                ); 
//            
//            var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//商品コード
//            var productCode= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("custitem_djkk_product_code"));//カタログ製品コード
//            var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
//            invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;")
//            var invoiceQuantity = defaultEmpty(creditmemoRecord.getLineItemValue('item','quantity',k));//数量
//            var invoiceRateFormat = defaultEmpty(creditmemoRecord.getLineItemValue('item','rate',k));//単価
//            var invoiceAmount = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item','amount',k)));//金額
//            nlapiLogExecution('debug', 'invoiceAmount', typeof(invoiceAmount));
//            var invoAmountTotal = '';
//            if(!isEmpty(invoiceAmount)){
//                var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');   
//                invAmount  += invoiceAmount;
//                invoAmountTotal = invAmount;
//            }else{
//                var invAmountFormat = '';
//            }
//            
//            var invoiceTaxrate1Format = defaultEmpty(creditmemoRecord.getLineItemValue('item','taxrate1',k));//税率
//            var invoiceTaxamount = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item','tax1amt',k)));//税額   
//            invoiceTaxamount = defaultEmpty(isEmpty(invoiceTaxamount) ? 0 :  invoiceTaxamount);
//            var invTaxmountTotal = '0';
//            if(!isEmpty(invoiceTaxamount)){
//                var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//                invTaxamount += invoiceTaxamount;
//                invTaxmountTotal = invTaxamount;
//            }else{
//                var invTaxamountFormat = '';
//            }
//            var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
//            if(!isEmpty(invoTotal)){
//                var invoToTotal = invoTotal;
//            }else{
//                var invoToTotal ='';
//            }
//            
//            var invoiceUnitabbreviation = defaultEmpty(creditmemoRecord.getLineItemValue('item','units_display',k));//単位
//            var itemLocId = defaultEmpty(creditmemoRecord.getLineItemValue('item','location',k)); // 場所
//            var locBarCode = '';
//            if (itemLocId) {
//                var tmpDicBarCode = tmpLocationDic[itemLocId];
//                if (tmpDicBarCode) {
//                    locBarCode = tmpDicBarCode;
//                }
//            }
//            if(!isEmpty(invAmountFormat)){
//                invAmountFormat = '-'+invAmountFormat;
//            }
//            if(!isEmpty(invTaxamountFormat)){
//                invTaxamountFormat = '-'+invTaxamountFormat;
//            }
//            itemLine.push({
//                invoiceInitemid:invoiceInitemid,  //商品コード
//                invoiceDisplayName:invoiceDisplayName,//商品名
//                invoiceQuantity:invoiceQuantity,//数量
//                invoiceRateFormat:'-'+invoiceRateFormat,//単価
//                invoiceAmount:invAmountFormat,//金額  
//                invoiceTaxrate1Format:invoiceTaxrate1Format,//税率
//                invoiceTaxamount:invTaxamountFormat,//税額  
//                invoiceUnitabbreviation:invoiceUnitabbreviation,
//                productCode:productCode,//カタログ製品コード
//                locBarCode:locBarCode//DJ_場所バーコード
//            }); 
//    }
//    if(custLanguage == '日本語'){
//        var dateName = '日\xa0\xa0付';
//        var deliveryName = '納品日';
//        var paymentName = '支払条件';
//        var numberName = '番\xa0\xa0号';
//        var numberName2 = '御社発注番号:';
//        var codeName = 'コード';
//        var invoiceName = '*\xa0\xa0\*\xa0\xa0\*請\xa0\xa0\xa0\xa0\求\xa0\xa0\xa0\xa0\書*\xa0\xa0\*\xa0\xa0\*';
//        var quantityName = '数\xa0\xa0\xa0\xa0\xa0\xa0\xa0量';
//        var unitpriceName = '単\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0価';
//        var amountName = '金\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0額';
//        var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\名';
//        var taxRateName = '***\xa0\xa0\税\xa0率:';
//        var taxAmountName = '税額:';
//        var custCode = '顧客コード\xa0\xa0:';
//        var destinationName = '納品先\xa0\xa0:';
//        var totalName = '合\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0計';
//        var consumptionTaxName = '消\xa0\xa0費\xa0\xa0税';
//        var invoiceName1 = '御請求額';
//        var personName = '担当者\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
//        var memoName = 'メ\xa0\xa0モ';
//        var custName = '顧客名\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
//        var addressNmae = '住所\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
//        var invoiceIssuerNumberName = '適格請求書発行事業者番号:';
//
//    }else{
//        var dateName = 'Date';
//        var deliveryName = 'Delivery Date';
//        var paymentName = 'Payment Terms';
//        var numberName = 'Number';
//        var numberName2 = 'Order number:';
//        var codeName = 'Code';
//        if(type == 'creditmemo'){
//            var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Credit Memo*\xa0\xa0\*\xa0\xa0\*';
//        }else{
//            var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Invoice*\xa0\xa0\*\xa0\xa0\*';
//        }
//        var quantityName = 'Quantity';
//        var unitpriceName = 'Unit Price';
//        var amountName = 'amount';
//        var poductName = 'Product name';
//        var taxRateName = 'tax rate:';
//        var taxAmountName = 'TaxAmt:';
//        var custCode = 'Customer code:';
//        var destinationName = 'Delivery:';
//        var totalName = 'Total';
//        var consumptionTaxName = 'Excise tax';
//        var invoiceName1 = 'Invoice';
//        var personName = 'Person:';
//        var memoName = 'Memo';
//        var custName = 'Customer name:';
//        var addressNmae = 'address:';
//        var invoiceIssuerNumberName = 'Registered Enterprises Number:';
//    }
//    // add by lj start DENISJAPANDEV-1376
////  var invTaxmountTotal = parseInt(invoAmountTotal.replace(',','')) * 0.08;
////  if(!isEmpty(invoTotal)){
////      var invoToTotal = (invTaxmountTotal + invoTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
////  }else{
////      var invoToTotal ='';
////  }
////  invTaxmountTotal = invTaxmountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//    // add by lj start DENISJAPANDEV-1376
//    var subsidiary = getRoleSubsidiary();
//    var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
//    '<pdf>'+
//    '<head>'+
//    '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
//    '<#if .locale == "zh_CN">'+
//    '<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
//    '<#elseif .locale == "zh_TW">'+
//    '<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
//    '<#elseif .locale == "ja_JP">'+
//    '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
//    '<#elseif .locale == "ko_KR">'+
//    '<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
//    '<#elseif .locale == "th_TH">'+
//    '<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
//    '</#if>'+
//    
//    '<macrolist>'+
//    '<macro id="nlfooter">'+
//    '<table style="border-top: 1px solid black;width: 660px;font-weight: bold;">'+
//    '<tr style="padding-top:5px;">'+
//    '<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
//    if(!isEmpty(incoicedelivery_Name)){
//        str+='<td style="width:270px;">'+destinationName+'&nbsp;'+dealFugou(incoicedelivery_Name)+'</td>';
//    }else{
//        str+='<td style="width:270px;">'+destinationName+'</td>';
//    }
//    //add by zhou 20230517_CH508 start
//    if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//        var invoAmountTotal0 =  parseFloat(invoAmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//    }else{
//        nlapiLogExecution('debug', 'invoAmountTotal', parseFloat(invoAmountTotal));
//        var invoAmountTotal0 =  parseFloat(invoAmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//    }
//    //add by zhou 20230517_CH508 enda
//    str+='<td style="width:70px;">&nbsp;&nbsp;'+totalName+'</td>'+
//    '<td style="width:70px;" align="right">'+invoAmountTotal0+'</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>';
//    if(!isEmpty(invdestinationZip)){
//        str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+invdestinationZip+'</td>';
//    }
//    str+='</tr>'+
//    '<tr>'+
//    // 顧客名
//    //add by zhou 20230601_CH598 start
//    '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + custName +dealFugou(custNameText)+ '</td>';
////  '<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
////add by zhou 20230601_CH598 end
//    if(!isEmpty(invdestinationState)){
//        str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
//    }else{
//        str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//    }
//    //add by zhou 20230517_CH508 start
//    if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//        var consumptionTax0 = parseFloat(invTaxmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//    }else{
//        var consumptionTax0 = parseFloat(invTaxmountTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//    }
//    
//    str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
//    '<td style="width:100px;margin-top:-8px;" align="right">'+consumptionTax0+'</td>'+
//    '</tr>'+
//    //add by zhou 20230517_CH508 end
//    '<tr>'+
////  住所
//    '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + addressNmae  + dealFugou(invoiceAddressState) + '</td>';
//
////  '<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//    if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
//        str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationCity)+dealFugou(invdestinationAddress)+'</td>';
//    }
//
//    str+='</tr>'+
//    
//    '<tr>'+
//    '<td style="width:220px;margin-top:-8px;;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + dealFugou(invoiceCity) + '</td>';
////  '<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//    if(!isEmpty(invdestinationAddress2)){
//        str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress2)+'</td>';
//    }else{
//        str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//    }
//    //add by zhou 20230517_CH508 start
//    if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//        var invoToTotal0 = parseFloat(invoToTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
//    }else{
//        var invoToTotal0 = parseFloat(invoToTotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//    }
//    //add by zhou 20230601_CH598 start
////  str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'</td>'+
//    str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'&nbsp;&nbsp;&yen;</td>'+
//    //add by zhou 20230601_CH598 end
//    '<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal0+'</td>'+
//    //add by zhou 20230517_CH508 end
//    '</tr>'+
////  住所
//    '<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>' +
//    '<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td></tr>' +
//    '<tr><td style="width:220px;margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address3 + '</td></tr>' +
//
//    '</table>'+
//    '<table style="width: 660px;font-weight: bold;">'+
//    '<tr><td colspan="3" style="width:220px;margin-top:-8px;margin-left:7px">振込口座</td></tr>';
//    
//    if(bankName1){
//        str+='<tr>'+
//            '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName1+'</td>'+
//            '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName1+'</td>'+
//            '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
////          '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo1+'</td>'+
//            '</tr>';
//    };
//    if(bankName1 && bankName2){
//        str+='<tr><td colspan="3" style="margin-top:3px"></td></tr>';
//    }
//    if(bankName2){
//        str+='<tr>'+
//        '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName2+'</td>'+
//        '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName2+'</td>'+
//        '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
////      '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo2+'</td>'+
//        '</tr>';
//};
//    str+='</table>'+
//    '</macro>'+
//    '</macrolist>'+
//    
//    
//    '    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
//    '<#if .locale == "zh_CN">'+
//    'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
//    '<#elseif .locale == "zh_TW">'+
//    'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
//    '<#elseif .locale == "ja_JP">'+
//    'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
//    '<#elseif .locale == "ko_KR">'+
//    'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
//    '<#elseif .locale == "th_TH">'+
//    'font-family: NotoSans, NotoSansThai, sans-serif;'+
//    '<#else>'+
//    'font-family: NotoSans, sans-serif;'+
//    '</#if>'+
//    '}'+
//    'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
//    'td { padding: 4px 6px;}'+
//    'b { font-weight: bold; color: #333333; }'+
//    '.nav_t1 td{'+
//    'width: 110px;'+
//    'height: 20px;'+
//    'font-size: 13px;'+
//    'display: hidden;'+
//    '}'+
//    '</style>'+
//    '</head>';
//    
//    str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4" footer="nlfooter" footer-height="12%">'+
//    '<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
//    '<tr>'+
//    '<td>'+
//    '<table style="font-weight: bold;width:335px;">'+
//    '<tr style="height: 18px;" colspan="2"></tr>'+  
//    '<tr>'+
//    '<td style="border:1px solid black;" corner-radius="4%">'+
//    '<table>'+
//    '<tr style="height:10px;"></tr>'+
//    '<tr>'+
//    '<td>〒'+invoiceZipcode+'</td>'+
//    '<td align="right" style="margin-right:-22px;">&nbsp;</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invAddress+'</td>'+
//        //add by zhou 20230601_CH598 start
//    '<td align="right" style="padding-right: 30px;margin-top:-8px;">'+dealFugou(custNameText)+'</td>'+
//        //add by zhou 20230601_CH598 end
//    '</tr>'+
//    '<tr>'+
//    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address1+'</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td align="right" style="padding-right: 75px;padding-bottom:0px;margin-top:-8px;" colspan="2">御中</td>'+
//    '</tr>'+
//    '<tr>';
//    if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
//        str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
//        '</tr>'+
//        '<tr>'+
//        '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
//        '</tr>';
//    }
//    // modify by lj start DENISJAPANDEV-1376
//    else{
////      str += '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Tel:'+invPhone+'</td>'+
////      '</tr>'+
////      '<tr>'+
////      '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Fax:'+invFax+'</td>'+
////      '</tr>';
//        str += '</tr>';
//    }
//    // modify by lj end DENISJAPANDEV-1376
//
//    
//    str += '<tr style="height: 40px;"></tr>'+
//    '</table>'+
//    '</td>'+
//    '</tr>'+
//    '</table>'+
//    '</td>'+
//    
//    '<td style="padding-left: 30px;">'+
//    '<table style="width: 280px;font-weight: bold;">'+
//    '<tr>'+
//    '<td colspan="2" style="width:50%;margin-top:-16px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
////  '<td colspan="2" style="width:50%;margin-top:-16px;"><img src="/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
//    '</tr>';
//    //20230208 changed by zhou start CH298
//    if((subsidiary == SUB_NBKK || subsidiary == SUB_ULKK) && type == 'creditmemo'){
//        str+='<tr>'+
//        //add by zhou 20230601_CH598 start
//        '<td colspan="2" style="margin-left:-72px;margin-top:-8px;">&nbsp;'+dealFugou(custNameText)+'</td>'+
//        //add by zhou 20230601_CH598 end
//        '</tr>';
//    }
//    //end
//    str+='<tr>'+
//    '<td style="font-size:17px;margin-top:-5px;" colspan="2">'+invoiceNameEng+'&nbsp;</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td style="font-size: 20px;margin-top:-2px;" colspan="2" >'+invoiceLegalname+'&nbsp;</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td colspan="2" style="font-size: 10px;margin-top:-2px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'&nbsp;</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td colspan="2" style="font-size: 10px;margin-top:-2px;">〒'+invoiceAddressZip+'&nbsp;</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+invoiceAddressThree+'&nbsp;</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td style="font-size: 10px;margin-top:-4px;">TEL:&nbsp;'+invoicePhone+'</td>'+
//    '<td style="font-size: 10px;margin-top:-4px;">FAX:&nbsp;'+invoiceFax+'</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressEng+'</td>'+
//    '</tr>'+
//    '</table>'+
//    '</td>'+
//    '</tr>'+
//    '</table>';
//    
//    str+='<table style="width: 660px;margin-top: 10px;font-weight: bold;">'+
//    '<tr>'+
//    '<td style="line-height: 30px;font-weight:bold;font-size: 11pt;border: 1px solid black;height: 30px;width:660px;" align="center" colspan="5">'+invoiceName+'</td>'+
//    '</tr>'+
//    '</table>'+ 
//    '<table style="width: 660px;font-weight: bold;">'+
//    '<tr>'+
//    '<td style="width:510px;margin-top:-5px;margin-left:-20px;" colspan="2">&nbsp;</td>'+
//    '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;" align="right"></td>'+
//    '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
//    '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
//    '</tr>'+    
//    '<tr>'+
//    '<td style="width: 225px;">&nbsp;&nbsp;'+dateName+'&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
//    '<td style="width: 285px;margin-left:-25px;">'+deliveryName+'&nbsp;:&nbsp;&nbsp;'+delivery_date+'</td>'+
//    '<td style="width: 50px;"></td>'+
//    '<td style="width: 50px;"></td>'+
//    '<td style="width: 50px;"></td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td style="width: 225px;margin-top:-8px;">&nbsp;</td>'+
//    // modify by lj start DENISJAPANDEV-1385
////  '<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+payment+'</td>'+
//    // add zhou CF413 20230523 start
//    '<td style="width: 285px;margin-top:-8px;margin-left:-25px;">&nbsp;</td>'+
////  '<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+ customerPayment + '</td>'+
//    // add zhou CF413 20230523 end
//    // modify by lj END DENISJAPANDEV-1385
//    '<td style="width: 50px;margin-top:-8px;"></td>'+
//    '<td style="width: 50px;margin-top:-8px;"></td>'+
//    '<td style="width: 50px;margin-top:-8px;"></td>'+
//    '</tr>'+
//    '<tr>'+
//    // add zhou CF413 20230523 start
////  '<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'+
////  '<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+'&nbsp;'+otherrefnum+'</td>'+
//    '<td style="width: 300px;margin-top:-8px;">&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'+
//    '<td style="width: 100px;margin-left:-25px;margin-top:-8px;">'+paymentName+'&nbsp;:'+ customerPayment + '</td>'+
//    '<td style="width: 260px;margin-left:-25px;margin-top:-8px;" colspan="3">'+numberName2+'&nbsp;'+dealFugou(otherrefnum)+'</td>'+
//    // add zhou CF413 20230523 end
//    '</tr>';
//    
//    // modify by lj start DENISJAPANDEV-1376
//    //20221206 add by zhou CH116 start
//    //changed by zhou 20230208 CH298 
////  if((subsidiary != SUB_SCETI && subsidiary != SUB_DPKK ) &&  type != 'creditmemo'){
////      str+='<tr>'+
////      '<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;通貨コード&nbsp;:'+currency+'</td>'+
////      '<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">価格コード&nbsp;:'+priceCode+'</td>'+
////      '</tr>';
////  }
//    //end
//    // modify by lj end DENISJAPANDEV-1376
//    str+= '</table>'+
//    
//    '<table style="width: 660px;font-weight: bold;" border="0">';   
//    str+='<tr>';
//        var tmpMemo = '';
//        if (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) {
//            tmpMemo = dvyMemo;
//        } else {
//            tmpMemo = memo;
//        }
//        nlapiLogExecution('DEBUG', 'tmpMemo', tmpMemo);
//        if(!isEmpty(tmpMemo)){
//            // add by zhou ch598 20230601 start
////          str+='<td style="width: 330px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+tmpMemo+'</td>'+
//            str+='<td style="width: 330px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+dealFugou(tmpMemo)+'</td>'+
//            // add by zhou ch598 20230601 end
//            '<td style="width: 110px;">&nbsp;</td>'+
//            '<td style="width: 100px;">&nbsp;</td>'+
//            '<td style="width: 100px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
//            '</tr>';
//        }else{
//            str+='<td style="width: 130px;margin-top:-8px;">&nbsp;</td>'+
//            '<td style="width: 200px;">&nbsp;</td>'+
//            '<td style="width: 110px;">&nbsp;</td>'+
//            '<td style="width: 100px;">&nbsp;</td>'+
//            '<td style="width: 100px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
//            '</tr>';
//        }
//    str+= '</table>';
//        
//    str+= '<table border="0" style="width: 660px;font-weight: bold;">'; 
//    str+='<tr style="border-bottom: 1px solid black;">'+
//    '<td style="width: 130px;">&nbsp;&nbsp;'+codeName+'</td>'+
//    '<td style="width: 210px;" align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+poductName+'</td>'+
//    '<td style="width: 110px;">&nbsp;&nbsp;'+quantityName+'</td>'+
//    '<td style="width: 100px;">&nbsp;&nbsp;'+unitpriceName+'</td>'+
//    '<td style="width: 100px;">&nbsp;&nbsp;'+amountName+'</td>'+
//    '</tr>';
//    for(var i = 0;i<itemLine.length;i++){
//        str+='<tr>'+
//        '<td style="width: 130px;">&nbsp;'+itemLine[i].invoiceInitemid+'</td>'+
//        '<td style="width: 210px;">'+itemLine[i].invoiceDisplayName+'</td>'+
//        '<td style="width: 110px;" align="center">'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>';
//        if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//            var itemRateForma = itemLine[i].invoiceRateFormat;
//            var itemAmount = itemLine[i].invoiceAmount;
//            str+= '<td style="width: 100px;" align="right">'+itemRateForma.split('.')[0]+'</td>'+
//            '<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemAmount.split('.')[0]+'</td>'+
//            '</tr>';
//        }else{
//            str+= '<td style="width: 100px;" align="right">'+itemLine[i].invoiceRateFormat+'</td>'+
//            '<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceAmount+'</td>'+
//            '</tr>';
//        }
//        
//        str+= '<tr>'+
//        '<td style="width: 130px;">&nbsp;'+itemLine[i].productCode+'</td>'+
//        '<td style="width: 210px;">&nbsp;</td>'+
//        '<td style="width: 110px;" align="right">&nbsp;</td>';
//        str+='<td style="width: 100px;">&nbsp;</td>';
//        str+='<td style="width: 100px;" align="right">&nbsp;</td>';
//        str+='</tr>';
//        
//        // CH408 zheng 20230518 start
//        str+= '<tr>'+
//        '<td style="width: 130px;">&nbsp;'+itemLine[i].locBarCode+'</td>'+
//        '<td style="width: 210px;">&nbsp;</td>'+
//        '<td style="width: 110px;" align="right">&nbsp;</td>';
//        str+='<td style="width: 100px;">&nbsp;</td>';
//        str+='<td style="width: 100px;" align="right">&nbsp;</td>';
//        str+='</tr>';
//        
//        str+= '<tr>'+
//        '<td style="width: 130px;margin-left: 36px;">&nbsp;</td>'+
//        '<td style="width: 210px;">&nbsp;</td>'+
//        '<td style="width: 110px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'</td>';
//        if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//            var itemTaxamount = itemLine[i].invoiceTaxamount;
//            str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//            str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount.split('.')[0]+'</td>';
//        }else{
//            str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//            str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceTaxamount+'</td>';
//        }
//        // CH408 zheng 20230518 end
//        
//        str+='</tr>';
//    }   
//    str+='</table>';
//    str+='</body>';
//
//    str += '</pdf>';
//    var renderer = nlapiCreateTemplateRenderer();
//    renderer.setTemplate(str);
//    var xml = renderer.renderToString();
//    var xlsFile = nlapiXMLToPDF(xml);
//    // PDF
//    xlsFile.setName(fileName  + '.pdf');
//    xlsFile.setFolder(INVOICE_REQUESE_PDF_DJ_INVOICEREQUESTPDF);
//    xlsFile.setIsOnline(true);
//    // save file
//    nlapiLogExecution('debug','start','クレジットメモ 個別請求書  PDF making end')
//    var fileID = nlapiSubmitFile(xlsFile);
//    nlapiLogExecution('debug','クレジットメモ 個別請求書  PDF fileID',fileID)
//    return fileID;
	
//	var invAmount = 0;
//	var invTaxamount = 0;
//	var itemLine = new Array();
//	var creditmemoRecord = nlapiLoadRecord('creditmemo',id);
//	var entity = creditmemoRecord.getFieldValue('entity');//顧客
//	var customerSearch= nlapiSearchRecord("customer",null,
//			[
//				["internalid","anyof",entity]
//			], 
//			[
//			 	new nlobjSearchColumn("address2","billingAddress",null), //請求先住所1
//		    	new nlobjSearchColumn("address3","billingAddress",null), //請求先住所2
//		    	new nlobjSearchColumn("city","billingAddress",null), //請求先市区町村
//		    	new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
//		    	new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //請求先都道府県 		
//		    	new nlobjSearchColumn("phone"), //電話番号
//		    	new nlobjSearchColumn("fax"), //Fax
//		    	new nlobjSearchColumn("entityid"), //id
//		    	new nlobjSearchColumn("salesrep"), //販売員（当社担当）
//		    	new nlobjSearchColumn("language"),  //言語
//		    	new nlobjSearchColumn("currency"),  //基本通貨
//		    	new nlobjSearchColumn("custrecord_djkk_pl_code_fd","custentity_djkk_pl_code_fd",null),   //DJ_販売価格表コード（食品）
////			 	new nlobjSearchColumn("custentity_djkk_pl_code_fd")   //DJ_販売価格表コード（食品）
//			]
//			);	
//	var address2= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//住所1
//	var address3= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address3","billingAddress",null));//住所2
//	var invoiceCity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("city","billingAddress",null));//市区町村
//	var invoiceZipcode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//郵便番号
//	var invAddress= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_address_state","billingAddress",null));//都道府県 
//	var invPhone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//電話番号
//	var invFax= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("fax"));//Fax
//	var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//id
//	var custSalesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//販売員（当社担当）
//	var custLanguage= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("language"));//言語
//	var currency= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("currency"));//販売員（当社担当）
//	var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("custrecord_djkk_pl_code_fd","CUSTENTITY_DJKK_PL_CODE_FD",null));//DJ_販売価格表コード（食品）code
////	var priceCode= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_pl_code_fd"));//DJ_販売価格表コード（食品）code
//
//	//	nlapiLogExecution('debug', 'custLanguage', custLanguage)
//
//	var trandate = defaultEmpty(creditmemoRecord.getFieldValue('trandate'));    //クレジットメモ日付
//	var delivery_date = defaultEmpty(creditmemoRecord.getFieldValue('custbody_djkk_delivery_date'));    //クレジットメモ納品日
//	var tranid = defaultEmpty(creditmemoRecord.getFieldValue('tranid'));    //クレジットメモ番号
//	var transactionnumber = defaultEmpty(creditmemoRecord.getFieldValue('transactionnumber'));    //トランザクション番号　221207王より追加
//	var createdfrom = defaultEmpty(creditmemoRecord.getFieldValue('createdfrom'));    //クレジットメモ作成元
//	nlapiLogExecution('debug','createdfrom',createdfrom)
//	var soNumber = '';
//	if(!isEmpty(createdfrom)){
//		var transactionSearch = nlapiSearchRecord("transaction",null,
//				[
//				   ["internalid","anyof",createdfrom]
//				], 
//				[
//				   new nlobjSearchColumn("transactionnumber")
//				]
//				);
//		
//		
//		if(!isEmpty(transactionSearch)){
//				var createdfromTran = defaultEmpty(transactionSearch[0].getValue("transactionnumber"));	//作成元    トランザクション番号
//			nlapiLogExecution('debug','',createdfromTran)
//		}
//	}
//	var payment = defaultEmpty(creditmemoRecord.getFieldText('custbody_djkk_payment_conditions'));    //クレジットメモ支払条件
//	var salesrep = defaultEmpty(creditmemoRecord.getFieldText('salesrep'));    //営業担当者
//	var memo = defaultEmpty(creditmemoRecord.getFieldValue('memo'));    //memo
//	var subsidiary = defaultEmpty(creditmemoRecord.getFieldValue('subsidiary'));    //クレジットメモ子会社
//	var insubsidiarySearch= nlapiSearchRecord("subsidiary",null,
//			[
//				["internalid","anyof",subsidiary]
//			], 
//			[
//				new nlobjSearchColumn("legalname"),  //正式名称
//				new nlobjSearchColumn("name"), //名前
//				new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), //名前英語
//				new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), //住所英語
//				new nlobjSearchColumn("custrecord_djkk_address_state","address",null), //都道府県
//				new nlobjSearchColumn("address1","address",null), //住所1
//				new nlobjSearchColumn("address2","address",null), //住所1
//				new nlobjSearchColumn("address3","address",null), //住所2
//				new nlobjSearchColumn("city","address",null), //市区町村
//				new nlobjSearchColumn("zip","address",null), //郵便番号
//				new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), //fax
//				new nlobjSearchColumn("phone","address",null), //phone
//			]
//			);	
//	var invoiceLegalname= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("legalname"));//正式名称
//	var invoiceName= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("name"));//名前
//	var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address1","address",null));//住所1
//	var invoiceAddressTwo= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address2","address",null));//住所2
//	var invoiceAddressThree= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address3","address",null));//住所3
//	var invoiceAddressZip= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("zip","address",null));//郵便番号
//	var invoiceCitySub= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("city","address",null));//市区町村
//	var invoiceAddressState= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_state","address",null));//都道府県
//	var invoiceNameEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));//名前英語
//	var invoiceAddressEng= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));//住所英語
//	var invoiceFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","address",null));//fax
//	var invoicePhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","address",null));//phone
//	var incoicedelivery_destination = creditmemoRecord.getFieldValue('custbody_djkk_delivery_destination');    //クレジットメモ納品先
//	if(!isEmpty(incoicedelivery_destination)){	
//		
//		var invDestinationSearch= nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
//				[
//					["internalid","anyof",incoicedelivery_destination]
//				], 
//				[
//					new nlobjSearchColumn("custrecord_djkk_zip"),  //郵便番号
//					new nlobjSearchColumn("custrecord_djkk_prefectures"),  //都道府県
//					new nlobjSearchColumn("custrecord_djkk_municipalities"),  //DJ_市区町村
//					new nlobjSearchColumn("custrecord_djkk_delivery_residence"),  //DJ_納品先住所1
//					new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),  //DJ_納品先住所2
//					new nlobjSearchColumn("custrecorddjkk_name"),  //DJ_納品先名前
//						  
//				]
//				);	
//		var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));//郵便番号
//		var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));//都道府県
//		var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));//DJ_市区町村
//		var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));//DJ_納品先住所1
//		var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_納品先住所2
//		var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_納品先名前
//	}
//	
//	var invoiceCount = creditmemoRecord.getLineItemCount('item');
//	for(var k=1;k<invoiceCount+1;k++){
//		creditmemoRecord.selectLineItem('item',k);
//		var invoiceItemId = creditmemoRecord.getLineItemValue('item','item',k);	//item
//		var invoiceItemSearch = nlapiSearchRecord("item",null,
//				[
//				 	["internalid","anyof",invoiceItemId],
//				],
//				[
//				  new nlobjSearchColumn("itemid"), //商品コード
//				  new nlobjSearchColumn("displayname"), //商品名
//				  new nlobjSearchColumn("custitem_djkk_product_code"), //カタログ製品コード
//				]
//				); 
//			
//			var invoiceInitemid= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("itemid"));//商品コード
//			var productCode= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("custitem_djkk_product_code"));//カタログ製品コード
//			var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("displayname"));//商品名
//			invoiceDisplayName = invoiceDisplayName.replace(new RegExp("&","g"),"&amp;")
//			var invoiceQuantity = defaultEmpty(creditmemoRecord.getLineItemValue('item','quantity',k));//数量
//			var invoiceRateFormat = defaultEmpty(creditmemoRecord.getLineItemValue('item','rate',k));//単価
//			var invoiceAmount = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item','amount',k)));//金額  
//			if(!isEmpty(invoiceAmount)){
//				var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');	
//				invAmount  += invoiceAmount;
//				var invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//			}else{
//				var invAmountFormat = '';
//			}
//			
//			var invoiceTaxrate1Format = defaultEmpty(creditmemoRecord.getLineItemValue('item','taxrate1',k));//税率
//			var invoiceTaxamount = defaultEmpty(parseFloat(creditmemoRecord.getLineItemValue('item','tax1amt',k)));//税額   
//			if(!isEmpty(invoiceTaxamount)){
//				var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//				invTaxamount += invoiceTaxamount;
//				var invTaxmountTotal = invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//			}else{
//				var invTaxamountFormat = '';
//			}
//			
//			var invoTotal = defaultEmpty(Number(invAmount+invTaxamount));
//			if(!isEmpty(invoTotal)){
//				var invoToTotal = invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//			}else{
//				var invoToTotal ='';
//			}
//			
//			var invoiceUnitabbreviation = defaultEmpty(creditmemoRecord.getLineItemValue('item','units_display',k));//単位
//			itemLine.push({
//				invoiceInitemid:invoiceInitemid,  //商品コード
//				invoiceDisplayName:invoiceDisplayName,//商品名
//				invoiceQuantity:invoiceQuantity,//数量
//				invoiceRateFormat:'-'+invoiceRateFormat,//単価
//				invoiceAmount:'-'+invAmountFormat,//金額  
//				invoiceTaxrate1Format:invoiceTaxrate1Format,//税率
//				invoiceTaxamount:'-'+invTaxamountFormat,//税額  
//				invoiceUnitabbreviation:invoiceUnitabbreviation,
//				productCode:productCode,//カタログ製品コード
//			}); 
//	}
//	if(custLanguage == '日本語'){
//		var dateName = '日\xa0\xa0付';
//		var deliveryName = '納品日';
//		var paymentName = '支払条件';
//		var numberName = '番\xa0\xa0号';
//		var numberName2 = '御社発注番号:';
//		var codeName = 'コード';
//		var invoiceName = '*\xa0\xa0\*\xa0\xa0\*請\xa0\xa0\xa0\xa0\求\xa0\xa0\xa0\xa0\書*\xa0\xa0\*\xa0\xa0\*';
//		var quantityName = '数\xa0\xa0\xa0\xa0\xa0\xa0\xa0量';
//		var unitpriceName = '単\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0価';
//		var amountName = '金\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0額';
//		var poductName = '品\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\名';
//		var taxRateName = '***\xa0\xa0\税\xa0率:';
//		var taxAmountName = '税額:';
//		var custCode = '顧客コード\xa0\xa0:';
//		var destinationName = '納品先\xa0\xa0:';
//		var totalName = '合\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0計';
//		var consumptionTaxName = '消\xa0\xa0費\xa0\xa0税';
//		var invoiceName1 = '御請求額';
//		var personName = '担当者\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
//		var memoName = 'メ\xa0\xa0モ'
//	}else{
//		var dateName = 'Date';
//		var deliveryName = 'Delivery Date';
//		var paymentName = 'Payment Terms';
//		var numberName = 'Number';
//		var numberName2 = 'Order number:';
//		var codeName = 'Code';
//		var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Invoice*\xa0\xa0\*\xa0\xa0\*';
//		var quantityName = 'Quantity';
//		var unitpriceName = 'Unit Price';
//		var amountName = 'amount';
//		var poductName = 'Product name';
//		var taxRateName = 'tax rate:';
//		var taxAmountName = 'TaxAmt:';
//		var custCode = 'Customer code:';
//		var destinationName = 'Delivery:';
//		var totalName = 'Total';
//		var consumptionTaxName = 'Excise tax';
//		var invoiceName1 = 'Invoice';
//		var personName = 'Person:';
//		var memoName = 'Memo';
//	}
//	
//	
//	var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
//	'<pdf>'+
//	'<head>'+
//	'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
//	'<#if .locale == "zh_CN">'+
//	'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
//	'<#elseif .locale == "zh_TW">'+
//	'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
//	'<#elseif .locale == "ja_JP">'+
//	'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
//	'<#elseif .locale == "ko_KR">'+
//	'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
//	'<#elseif .locale == "th_TH">'+
//	'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
//	'</#if>'+
//	
//	'<macrolist>'+
//	'<macro id="nlfooter">'+
//	'<table style="border-top: 1px dashed black;width: 660px;font-weight: bold;">'+
//	'<tr style="padding-top:5px;">'+
//	'<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
//	if(!isEmpty(incoicedelivery_Name)){
//		str+='<td style="width:220px;">'+destinationName+'&nbsp;'+incoicedelivery_Name+'</td>';
//	}else{
//		str+='<td style="width:220px;">'+destinationName+'</td>';
//	}
//	str+='<td style="width:100px;">&nbsp;&nbsp;'+totalName+'</td>'+
//	'<td style="width:100px;" align="right">'+invoAmountTotal+'</td>'+
//	'</tr>'+
//	
//	'<tr>'+
//	'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>';
//	if(!isEmpty(invdestinationZip)){
//		str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;〒'+invdestinationZip+'</td>';
//	}
//	str+='</tr>'+
//	
//	'<tr>'+
//	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//	if(!isEmpty(invdestinationState)){
//		str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
//	}else{
//		str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//	}
//	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
//	'<td style="width:100px;margin-top:-8px;" align="right">'+invTaxmountTotal+'</td>'+
//	'</tr>'+
//	
//	'<tr>'+
//	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//	if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
//		str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationCity+invdestinationAddress+'</td>';
//	}
//	str+='</tr>'+
//	
//	'<tr>'+
//	'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//	if(!isEmpty(invdestinationAddress2)){
//		str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationAddress2+'</td>';
//	}else{
//		str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
//	}
//	str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'</td>'+
//	'<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal+'</td>'+
//	'</tr>'+
//	'</table>'+
//	'</macro>'+
//	'</macrolist>'+
//	
//	
//	'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
//	'<#if .locale == "zh_CN">'+
//	'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
//	'<#elseif .locale == "zh_TW">'+
//	'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
//	'<#elseif .locale == "ja_JP">'+
//	'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
//	'<#elseif .locale == "ko_KR">'+
//	'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
//	'<#elseif .locale == "th_TH">'+
//	'font-family: NotoSans, NotoSansThai, sans-serif;'+
//	'<#else>'+
//	'font-family: NotoSans, sans-serif;'+
//	'</#if>'+
//	'}'+
//	'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
//	'td { padding: 4px 6px;}'+
//	'b { font-weight: bold; color: #333333; }'+
//	'.nav_t1 td{'+
//	'width: 110px;'+
//	'height: 20px;'+
//	'font-size: 13px;'+
//	'display: hidden;'+
//	'}'+
//	'</style>'+
//	'</head>';
//	
//	str+='<body  padding="0.5in 0.5in 0.5in 0.5in" size="A4" footer="nlfooter" footer-height="8%">'+
//	'<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
//	'<tr>'+
//	'<td>'+
//	'<table style="font-weight: bold;width:335px;">'+
//	'<tr style="height: 18px;" colspan="2"></tr>'+	
//	'<tr>'+
//	'<td style="border:1px solid black;" corner-radius="4%">'+
//	'<table>'+
//	'<tr style="height:10px;"></tr>'+
//	'<tr>'+
//	'<td>〒'+invoiceZipcode+'</td>'+
//	'<td align="right" style="margin-right:-22px;">&nbsp;</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invAddress+'</td>'+
//	'<td align="right" style="padding-right: 30px;margin-top:-8px;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="right" style="padding-right: 75px;padding-bottom:0px;margin-top:-8px;" colspan="2">御中</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Tel:'+invPhone+'</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Fax:'+invFax+'</td>'+
//	'</tr>'+
//	'<tr style="height: 40px;"></tr>'+
//	'</table>'+
//	'</td>'+
//	'</tr>'+
//	'</table>'+
//	'</td>'+
//	
//	'<td style="padding-left: 30px;">'+
//	'<table style="width: 280px;font-weight: bold;">'+
//	'<tr>'+
//	'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="https://5722722-sb1.secure.netsuite.com/core/media/media.nl?id=15969&amp;c=5722722_SB1&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
//	'</tr>'+
////	'<tr>'+
////	'<td colspan="2" style="margin-left:-32px;margin-top:-8px;">&nbsp;'+custSalesrep+'</td>'+
////	'</tr>'+
//	'<tr>'+
//	'<td style="font-size:17px;margin-top:-5px;" colspan="2">'+invoiceNameEng+'&nbsp;</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="font-size: 20px;margin-top:-2px;" colspan="2" >'+invoiceLegalname+'&nbsp;</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="2" style="font-size: 10px;margin-top:-2px;">〒'+invoiceAddressZip+'&nbsp;</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+invoiceAddressThree+'&nbsp;</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="font-size: 10px;margin-top:-4px;">TEL:&nbsp;'+invoicePhone+'</td>'+
//	'<td style="font-size: 10px;margin-top:-4px;">FAX:&nbsp;'+invoiceFax+'</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressEng+'</td>'+
//	'</tr>'+
//	'</table>'+
//	'</td>'+
//	'</tr>'+
//	'</table>';
//	var subsidiary = getRoleSubsidiary();
//	str+='<table style="width: 660px;margin-top: 10px;font-weight: bold;">'+
//	'<tr>'+
//	'<td style="line-height: 30px;font-weight:bold;border: 1px solid black;height: 30px;width:660px;" align="center" colspan="5">'+invoiceName+'</td>'+
//	'</tr>'+
//	'</table>'+	
//	'<table style="width: 660px;font-weight: bold;">'+
//	'<tr>'+
//	'<td style="width:510px;margin-top:-5px;margin-left:-20px;" colspan="2">&nbsp;</td>'+
//	'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;" align="right"></td>'+
//	'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
//	'<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
//	'</tr>'+	
//	'<tr>'+
//	'<td style="width: 225px;">&nbsp;&nbsp;'+dateName+'&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
//	'<td style="width: 285px;margin-left:-25px;">'+deliveryName+'&nbsp;:&nbsp;&nbsp;'+delivery_date+'</td>'+
//	'<td style="width: 50px;"></td>'+
//	'<td style="width: 50px;"></td>'+
//	'<td style="width: 50px;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="width: 225px;margin-top:-8px;">&nbsp;</td>'+
//	'<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+payment+'</td>'+
//	'<td style="width: 50px;margin-top:-8px;"></td>'+
//	'<td style="width: 50px;margin-top:-8px;"></td>'+
//	'<td style="width: 50px;margin-top:-8px;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'/作成元番号&nbsp;:'+createdfromTran+'</td>'+
//	'<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+'.</td>'+
//	'</tr>'+
//	'<tr>';
//	//20221206 add by zhou CH116 start
//	if(subsidiary != SUB_SCETI && subsidiary != SUB_DPKK){
//		str+= '<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;通貨コード&nbsp;:'+currency+'</td>'+
//		'<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">価格コード&nbsp;:'+priceCode+'</td>'+
//		'</tr>';
//	}
//	//end
//	str+= '</table>'+
//	
//	'<table style="width: 660px;font-weight: bold;">';	
//	str+='<tr>';
//		if(!isEmpty(memo)){	
//			str+='<td style="width: 330px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;'+memoName+'&nbsp;&nbsp;&nbsp;'+memo+'</td>'+
//			'<td style="width: 110px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
//			'</tr>';
//		}else{
//			str+='<td style="width: 130px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 200px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 110px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;</td>'+
//			'<td style="width: 100px;margin-top:-8px;">&nbsp;&nbsp;Page：&nbsp;<pagenumber/></td>'+
//			'</tr>';
//		}
//
//	str+='<tr  style="border-bottom: 1px dashed black;">'+
//	'<td style="width: 130px;margin-top:-6px;">&nbsp;&nbsp;'+codeName+'</td>'+
//	'<td style="width: 200px;margin-top:-6px;" align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+poductName+'</td>'+
//	'<td style="width: 110px;margin-top:-6px;">&nbsp;&nbsp;'+quantityName+'</td>'+
//	'<td style="width: 100px;margin-top:-6px;">&nbsp;&nbsp;'+unitpriceName+'</td>'+
//	'<td style="width: 100px;margin-top:-6px;">&nbsp;&nbsp;'+amountName+'</td>'+
//	'</tr>';
//	for(var i = 0;i<itemLine.length;i++){
//		str+='<tr>'+
//		'<td style="width: 130px;">&nbsp;&nbsp;'+itemLine[i].invoiceInitemid+'</td>'+
//		'<td style="width: 200px;">'+itemLine[i].invoiceDisplayName+'</td>'+
//		'<td style="width: 110px;" align="center">&nbsp;&nbsp;'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>';
//		if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//			var itemRateForma = itemLine[i].invoiceRateFormat;
//			var itemAmount = itemLine[i].invoiceAmount;
//			str+= '<td style="width: 100px;" align="right">'+itemRateForma.split('.')[0]+'</td>'+
//			'<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemAmount.split('.')[0]+'</td>'+
//			'</tr>';
//		}else{
//			str+= '<td style="width: 100px;" align="right">'+itemLine[i].invoiceRateFormat+'</td>'+
//			'<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceAmount+'</td>'+
//			'</tr>';
//		}
//		
//		str+= '<tr>'+
//		'<td style="width: 130px;margin-left: 36px;">'+itemLine[i].productCode+'</td>'+
//		'<td style="width: 200px;">&nbsp;</td>'+
//		'<td style="width: 110px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'</td>';
//		if(custLanguage == '日本語' && (subsidiary != SUB_SCETI && subsidiary != SUB_DPKK) && currency == 'JPY' ){
//			var itemTaxamount = itemLine[i].invoiceTaxamount;
//			str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//			str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount.split('.')[0]+'</td>';
//		}else{
//			str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//			str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceTaxamount+'</td>';
//		}
//		
//		str+='</tr>';
//	}	
//	str+='</table>';
//	str+='</body>';
//
//	str += '</pdf>';
//	var renderer = nlapiCreateTemplateRenderer();
//	renderer.setTemplate(str);
//	var xml = renderer.renderToString();
//	var xlsFile = nlapiXMLToPDF(xml);
//	// PDF
//	xlsFile.setName(fileName  + '.pdf');
//	xlsFile.setFolder(INVOICE_REQUESE_PDF_DJ_INVOICEREQUESTPDF);
//	xlsFile.setIsOnline(true);
//	// save file
//	nlapiLogExecution('debug','start','クレジットメモ 個別請求書  PDF making end')
//	var fileID = nlapiSubmitFile(xlsFile);
//	nlapiLogExecution('debug','クレジットメモ 個別請求書  PDF fileID',fileID)
//	return fileID;
// add by zzq CH630 20230607 end
}
//function barcodePdf (recordId){
//	//バーコードPDF
//	nlapiLogExecution('DEBUG', 'barcodePdf', 'barcodePdf')
//	var soArray = new Array();
//	var soBody = new Array();
//	var inventoryDetailArr = new Array();
//	var soRecord = nlapiLoadRecord('salesorder', recordId);
//	var shipdate = defaultEmpty(soRecord.getFieldValue('shipdate'));//出荷日
//	var hopedate = defaultEmpty(soRecord.getFieldValue('custbody_djkk_delivery_hopedate'));//DJ_納品希望日
//	var memo = defaultEmpty(soRecord.getFieldValue('memo'));//備考
//	var tranid = defaultEmpty(soRecord.getFieldValue('tranid'));//注文番号 
//	var subsidiary = defaultEmpty(soRecord.getFieldText('subsidiary'));//子会社
//	var location = defaultEmpty(soRecord.getFieldText('location'));//場所 
//	var shippinginstructdt = defaultEmpty(soRecord.getFieldValue('custbody_djkk_shippinginstructdt'));//出荷指示日時
//	var shipmethod = defaultEmpty(soRecord.getFieldText('shipmethod'));//配送方法 
//	var deliverytimedesc = defaultEmpty(soRecord.getFieldValue('custbody_djkk_deliverytimedesc'));//DJ_納入時間帯記述
//	var entity = defaultEmpty(soRecord.getFieldValue('entity'));//顧客    
//	
//	var customerSearch = nlapiSearchRecord("customer",null,
//			[
//			   ["internalid","anyof",entity]
//			], 
//			[
//			   new nlobjSearchColumn("entityid").setSort(false),   //顧客ID
//			   new nlobjSearchColumn("companyname"),  //顧客名
//			   new nlobjSearchColumn("custentity_djkk_activity"),     //DJ_セクション
//			   new nlobjSearchColumn("salesrep"),  //販売員（当社担当）
//			   new nlobjSearchColumn("address2","billingAddress",null), //請求先住所1
//			   new nlobjSearchColumn("phone"), //電話番号
//			   new nlobjSearchColumn("zipcode","billingAddress",null), //請求先郵便番号
//			]
//			);
//	var entityid= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("entityid"));//顧客ID
//	var companyname= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//顧客名
//	var activity= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("custentity_djkk_activity"));//DJ_セクション
//	var salesrep= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("salesrep"));//販売員（当社担当）
//	var zip= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("zipcode","billingAddress",null));//郵便番号
//	var phone= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("phone"));//phone
//	var address= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address2","billingAddress",null));//請求先住所1
//	
//	soArray.push({
//		shipdate:shipdate,  //出荷日
//		hopedate:hopedate,  //DJ_納品希望日
//		memo:memo,  //備考
//		tranid:tranid, //注文番号 
//		subsidiary:subsidiary, //子会社
//		location:location, //場所 
//		shippinginstructdt:shippinginstructdt, //出荷指示日時
//		shipmethod:shipmethod, //配送方法 
//		deliverytimedesc:deliverytimedesc, //DJ_納入時間帯記述
//		zip:zip,  //ZIP
//		phone:phone, //phone
//		address:address, //住所
//		entityid:entityid, //顧客ID
//		companyname:companyname, //顧客名
//		activity:activity, //DJ_セクション
//		salesrep:salesrep, //販売員（当社担当）
//		soId:soId,
//	});
//	
//	var soCount = soRecord.getLineItemCount('item');
//	for(var a=1;a<soCount+1;a++){
//		soRecord.selectLineItem('item',a);
//		var item = defaultEmpty(soRecord.getLineItemValue('item','item',a));//item
//		var itemName = defaultEmpty(soRecord.getLineItemText('item','item',a));//item
//		var itemSearch = nlapiSearchRecord("item",null,
//				[
//				 	["internalid","anyof",item],
//				],
//				[
//				 new nlobjSearchColumn("countryofmanufacture"),//積載地
//				 new nlobjSearchColumn("custitem_djkk_radioactivity_classifi"), //DJ_8_放射性区分
//				 new nlobjSearchColumn("displayname"),
//				 new nlobjSearchColumn("custitem_djkk_deliverytemptyp"), //DJ_配送温度区分
//				]
//			); 
//		
//		var countryofmanufacture= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("countryofmanufacture"));//積載地
//		var classifi= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getText("custitem_djkk_radioactivity_classifi"));//DJ_8_放射性区分
//		var displayname= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getValue("displayname"));//名前
//		var deliverytemptyp= defaultEmpty(isEmpty(itemSearch) ? '' :  itemSearch[0].getText("custitem_djkk_product_category_sml"));//配送温度
//		
//		var lineNo = defaultEmpty(soRecord.getLineItemValue('item','line',a));	//行
//		var quantity = defaultEmpty(soRecord.getLineItemValue('item','quantity',a));//数量
//		var itemNo = defaultEmpty(soRecord.getLineItemValue('item','description',a));//説明
//		
//		soBody.push({
//			itemName:itemName, //item
//			countryofmanufacture:countryofmanufacture, //積載地
//			classifi:classifi, //DJ_8_放射性区分
//			displayname:displayname,
//			deliverytemptyp:deliverytemptyp,
//			lineNo:lineNo,
//			quantity:quantity,
//			itemNo:itemNo, //説明
//			soId:soId,
//			item:item,
//		});
//		
//		var inventoryDetail=soRecord.editCurrentLineItemSubrecord('item','inventorydetail'); //在庫詳細
//		if(!isEmpty(inventoryDetail)){
//			var inventoryDetailCount = inventoryDetail.getLineItemCount('inventoryassignment');
//			if(inventoryDetailCount != 0){
//				for(var j = 1 ;j < inventoryDetailCount+1 ; j++){
//					inventoryDetail.selectLineItem('inventoryassignment',j);
//					var receiptinventorynumber = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');//シリアル/ロット番号
//					if(isEmpty(receiptinventorynumber)){
//				    	invReordId = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');//ロット番号internalid
//				    	var inventorynumberSearch = nlapiSearchRecord("inventorynumber",null,
//			                    [
//			                       ["internalid","is",invReordId]
//			                    ], 
//			                    [
//			                     	new nlobjSearchColumn("inventorynumber"),
//			                    ]
//			                    );    
//				    	var serialnumbers = defaultEmpty(inventorynumberSearch[0].getValue("inventorynumber"));////シリアル/ロット番号	
//				    	
//			    	}
//					var expirationdate = inventoryDetail.getCurrentLineItemValue('inventoryassignment', 'expirationdate'); //有效期限	
//					inventoryDetailArr.push({
//						lineNo:lineNo,
//						serialnumbers:serialnumbers,
//						expirationdate:expirationdate,	
//						soId:soId,
//					});
//				}
//			}
//		}else{
//			inventoryDetailArr.push({
//				serialnumbers:'',
//				expirationdate:'',
//				soId:soId,
//			}); 
//		}
//		
//	}
//	
//	//PDF
//
//	var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
//	'<pdf>'+
//	'<head>'+
//	'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
//	'<#if .locale == "zh_CN">'+
//	'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
//	'<#elseif .locale == "zh_TW">'+
//	'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
//	'<#elseif .locale == "ja_JP">'+
//	'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
//	'<#elseif .locale == "ko_KR">'+
//	'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
//	'<#elseif .locale == "th_TH">'+
//	'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
//	'</#if>'+
//	'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
//	'<#if .locale == "zh_CN">'+
//	'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
//	'<#elseif .locale == "zh_TW">'+
//	'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
//	'<#elseif .locale == "ja_JP">'+
//	'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
//	'<#elseif .locale == "ko_KR">'+
//	'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
//	'<#elseif .locale == "th_TH">'+
//	'font-family: NotoSans, NotoSansThai, sans-serif;'+
//	'<#else>'+
//	'font-family: NotoSans, sans-serif;'+
//	'</#if>'+
//	'}'+
//	'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
//	'td { padding: 4px 6px;}'+
//	'b { font-weight: bold; color: #333333; }'+
//	'.nav_t1 td{'+
//	'width: 110px;'+
//	'height: 20px;'+
//	'font-size: 13px;'+
//	'display: hidden;'+
//	'}'+
//	'</style>'+
//	'</head>';
//	str+='<body padding="0.5in 0.5in 0.5in 0.5in" size="A4-LANDSCAPE">';  //soArr
//	for(var m = 0;m<soArray.length;m++){
//		str+='<table>'+
//	    '<tr>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td colspan="4"></td>'+
//	    '<td style="font-size: 22px;font-weight: bold;text-decoration: underline;" align="center" colspan="3">ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ</td>'+
//	    '<td colspan="3"></td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="1">'+soArray[m].tranid+'</td>'+
//	    '<td align="right" style="vertical-align: middle;font-size: 13px;" >N001:</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">'+soArray[m].subsidiary+'</td>'+
//	    '<td></td>'+
//	    '<td align="right" style="vertical-align: middle;font-size: 13px;"  colspan="2">出力日時</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:' + formatDateTime(new Date()) + '</td>'+
//	    '<td ></td>' +
//	    '<td style="vertical-align:middle;font-size: 13px" colspan="2"><pagenumber/>&nbsp;ページ</td>' +
//	    '</tr>'+
//	    '<tr>'+
//	    '<td></td>'+
//	    '<td align="right" style="vertical-align: middle;font-size: 13px;" >S001:</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">'+soArray[m].location+'</td>'+
//	    '<td style="font-size: 13px;font-weight: bold;text-decoration: underline;" align="left" colspan="2">ｼﾝｸﾞﾙﾋﾟｯｷﾝｸﾞﾘｽﾄ</td>'+
//	    '<td colspan="4"></td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td colspan="8"></td>'+
//	    '<td>出荷</td>'+
//	    '<td></td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">印刷ページ </td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;<pagenumber/></td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">出荷作業番号</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;S545646546546546</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;&nbsp;出荷製造番号</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;S545646546546546</td>'+
//	    '<td colspan="2" rowspan="3">'+
//	    '<table>'+
//	    '<tr>'+
//	    '<td style="width: 40px; height: 40px;border:1px solid #499AFF;"></td>'+
//	    '<td style="width: 40px; height: 40px;border:1px solid #499AFF;border-left:none;"></td>'+
//	    '<td style="width: 40px; height: 40px;border:1px solid #499AFF;border-left:none;"></td>'+
//	    '</tr>'+
//	    '</table>'+
//	    '</td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">印刷出荷日</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].shipdate+'</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">出荷指示番号</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;S545646546546546</td>'+
//	    '<td colspan="2" rowspan="2" align="left"><barcode codetype="code128" value="SO;' + soId + ';' + tranid + '"/></td>' +
//	    '</tr>'+
//	    '<tr>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">出荷予定日</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].shippinginstructdt+'</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">発生元番号</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].tranid+'</td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">配送伝票</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].shipmethod+'</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先コード</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].entityid+'</td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先郵便番号</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].zip+'</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先住所</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].address+'</td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先電話番号</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].phone+'</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].companyname+'</td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">配送指定日</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].hopedate+'</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先部署名</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].activity+'</td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">配送指定時間帯</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">:&nbsp;'+soArray[m].deliverytimedesc+'</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">届先担当者</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="4">:&nbsp;'+soArray[m].salesrep+'</td>'+
//	    '</tr>'+
//	    '<tr>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="2">備考</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="4">:&nbsp;'+soArray[m].memo+'</td>'+
//	    '</tr>'+
//	    '<tr style="font-weight: bold;">'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="3">&nbsp;&nbsp;NO.&nbsp;&nbsp;商品コード</td>'+
//	    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="3">商品名</td>'+
//	    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="8">**&nbsp;&nbsp;..区分</td>'+
//	    '</tr>'+
//	    '<tr style="font-weight: bold;">'+
//	    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;備考</td>'+
//	    '</tr>'+
//	    '<tr style="font-weight: bold;">'+
//	    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;明細フリーェリア</td>'+
//	    '</tr>'+
//	    '</table>'+
//	    '<table style="border-bottom: 1px solid black;" >'+
//	    '<tr>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '<td></td>'+
//	    '</tr>'+
//	    '<tr style="font-weight: bold;">'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="4">中岡ロケ ロケーョンコード </td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">ロット番号 </td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">賞味期限 </td>'+
//	    '<td colspan="4"></td>'+
//	    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">数量 </td>'+
//	    '</tr>'+
//	    '<tr style="font-weight: bold;">'+
//	    '<td colspan="4"></td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">積載地区分</td>'+
//	    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">配送温度区分</td>'+
//	    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">放射性有無区分 </td>'+
//	    '<td colspan="2"></td>'+
//	    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">()</td>'+
//	    '</tr>'+
//	    '<tr style="font-weight: bold;">'+
//	    '<td colspan="8"></td>'+
//	    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="4">バーコード </td>'+
//	    '</tr>'+
//	    '</table>';
//		for(var u = 0;u<soBody.length;u++){
//			if(soArray[m].soId == soBody[u].soId){
//						
//				str+='<table style="border-bottom: 1px dotted black;border-collapse: collapse;">'+
//				    '<tr>'+
//				    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="3">&nbsp;&nbsp;NO.'+soBody[u].lineNo+'&nbsp;&nbsp;'+soBody[u].itemName+'</td>'+
//				    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="3">'+soBody[u].displayname +'</td>'+
//				    '<td align="center" style="vertical-align: middle;font-size: 13px;" colspan="8">**&nbsp;&nbsp;..区分</td>'+
//				    '</tr>'+
//				    '<tr>'+
//				    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;備考</td>'+
//				    '</tr>'+
//				    '<tr>'+
//				    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">&nbsp;&nbsp;明細フリーェリア</td>'+
//				    '</tr>'+
//					'</table>';
//				str+=		
//				    '<table style="border-bottom: 1px solid black;border-collapse: collapse;">' ;
//				    for(var p = 0; p<inventoryDetailArr.length;p++ ){
//						var soId = inventoryDetailArr[p].soId;
//						if(soId == soBody[u].soId){
//							var soSerialnumbers = inventoryDetailArr[p].serialnumbers;  
//							var soExpirationdate = inventoryDetailArr[p].expirationdate;  
//							str+='<tr>'+
//								'<td align="left" style="vertical-align: middle;font-size: 13px;"  colspan="4">'+soBody[u].itemNo +' </td>'+
//								'<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soSerialnumbers+' </td>'+
//								'<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soExpirationdate+'</td>'+
//								'<td colspan="5"></td>'+
//								'<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].quantity +' </td>'+
//							    '</tr>';
//						}
//				    }
//						
//				    str+= '<tr>'+
//				    '<td colspan="4"></td>'+
//				    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].countryofmanufacture +'</td>'+
//				    '<td align="left" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].deliverytemptyp+'</td>'+
//				    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="2">'+soBody[u].classifi +'</td>'+
//				    '<td colspan="2"></td>'+
//				    '<td align="right" style="vertical-align: middle;font-size: 13px;" colspan="3">()</td>'+
//				    '</tr>'+
//				    '<tr style="font-weight: bold;">'+
//				    '<td colspan="9"></td>'+
//				    '<td width="200px" align="right" colspan="3" rowspan="2" style="vertical-align:text-top;text-align:right"><barcode showtext="false" height="30" width="180" align="right" codetype="code128" value="'
//					+soBody[u].soId+';'
//					+soBody[u].lineNo+';'
//					+soBody[u].item
//					+'" /></td>' +
//				    '</tr>'+
//				    '</table>';
//			}	
//		}
//	}
////	str+='</table>';
//	str+='</body>';
//	str += '</pdf>';
//	var renderer = nlapiCreateTemplateRenderer();
//	renderer.setTemplate(str);
//	var xml = renderer.renderToString();
//	var xlsFile = nlapiXMLToPDF(xml);
//// PDF
//	xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
//	xlsFile.setFolder(DELIVERY_FILE_PDF_IN_DJ_DELIVERYPDF);
//	xlsFile.setIsOnline(true);
//	// save file
//	var fileID = nlapiSubmitFile(xlsFile);
//
//	return fileID;
//	nlapiLogExecution('DEBUG', 'end', 'end')
//	
//}
function defaultEmpty(src){
	return src || '';
}
function defaultEmptyToZero(src){
	return src || 0;
}
function transfer(text){
	if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

return text ;
}
function formatDateTime(dt){    //現在日期
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2) + ' ' + PrefixZero(dt.getHours(), 2) + ":" + PrefixZero(dt.getMinutes(), 2)) : '';
}
function formatDate(dt){    //現在日期
	return dt ? (dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2)) : '';
}
function ifZero(Num){
	if(Number(Num) != 0){
		var str = '-' + Num;
	}else{
		var str = '0';
	}
	return str;
}
function getFormatYmdHms() {

	// システム時間
	var now = getSystemTime();

	var str = now.getFullYear().toString();
	str += (now.getMonth() + 1).toString();
	str += now.getDate() + "_";
	str += now.getHours();
	str += now.getMinutes();
	str += now.getMilliseconds();

	return str;
}
//add by 20230607 zzq CH630 start
function getLocations (recd) {

    var resultDic = {};
    var tmpLocationIdList = [];
    var tmpCount = recd.getLineItemCount('item');
    for(var z = 1; z < tmpCount + 1;z++ ){
        var tmpLocId = recd.getLineItemValue('item','location', z);
        if (tmpLocId) {
            tmpLocationIdList.push(tmpLocId);
        }
    }
    
    if (tmpLocationIdList.length > 0) {
        var locationSearch = nlapiSearchRecord("location",null,
                [
                   ["internalid","anyof", tmpLocationIdList], 
                   "AND", 
                   ["isinactive","is","F"]
                ], 
                [
                   new nlobjSearchColumn("internalid"), 
                   new nlobjSearchColumn("custrecord_djkk_location_barcode")
                ]
                );
       if (locationSearch && locationSearch.length > 0) {
           for(var t = 0; t < locationSearch.length; t++){
               var tmpId = locationSearch[t].getValue("internalid");
               var tmpBarCode = locationSearch[t].getValue("custrecord_djkk_location_barcode");
               if (tmpId && tmpBarCode) {
                   resultDic[tmpId] = tmpBarCode;
               }
           }
       }
    }

   return resultDic;
}

//20230727 add by zdj start
function dealFugou (value) {
    var reValue = '';
    if(value){
        reValue = value.replace(new RegExp('&','g'),'&amp;')
                   .replace(new RegExp('&amp;lt;','g'),'&lt;') // [&]を置き換えると、元々エスケープ処理されている[<]が変化するため、戻す
                   .replace(new RegExp('&amp;gt;','g'),'&gt;');
        return reValue;
    }
    return value;
}
//function dealFugou (value) {
//    var reValue = '';
//    reValue = value.replace(new RegExp('&','g'),'&amp;')
//                   .replace(new RegExp('&amp;lt;','g'),'&lt;') // [&]を置き換えると、元々エスケープ処理されている[<]が変化するため、戻す
//                   .replace(new RegExp('&amp;gt;','g'),'&gt;');
//    return reValue;
//}
//20230727 add by zdj end

//add by 20230607 zzq CH630 end

//add by zzq CH675 20230629 start
function getInvoiceMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,transactionnumber,recordType){
//  search
    try{
    var mailTempleteObj = {};
    var faxTempleteObj = {};
    var custEmployeeId = nlapiLookupField('employee',salesman,'custentity_djkk_employee_id');
    var mailTypeSearch = nlapiSearchRecord("customlist_djkk_mail_temple_type",null,
            [
               ["name","is",mailType]
            ], 
            [
               new nlobjSearchColumn("internalid")
            ]
            );
    if(!isEmpty(mailTypeSearch)){
        var mailTypeId = mailTypeSearch[0].getValue("internalid"); //DJ_送信種類ID
    }
    if(sendMailFlag == 'T' && !isEmpty(mailTypeId) && !isEmpty(mail)){
        var mailtemplateSearch = nlapiSearchRecord("customrecord_djkk_template",null,
                [
                   ["custrecord_djkk_tmp_sub","anyof",subsidiary], //DJ_子会社
                   "AND", 
                   ["custrecord_djkk_tmp_faxuse","is","F"], //FAXテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_mailuse","is","T"], //MALLテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_type","anyof",mailTypeId]//DJ_送信種類
                ], 
                [
                   new nlobjSearchColumn("custrecord_djkk_tmp_sub"), //DJ_子会社
                   new nlobjSearchColumn("custrecord_djkk_tmp_type"), //DJ_送信種類
                   new nlobjSearchColumn("custrecord_djkk_tmp_faxuse"), //FAXテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_mailuse"), //MALLテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_from"), //From address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to"), //TO address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to_muster"), //Email address from the client master
                   new nlobjSearchColumn("custrecord_djkk_tmp_bcc"), //BCC
                   new nlobjSearchColumn("custrecord_djkk_tmp_subject"), //Subject
                   new nlobjSearchColumn("custrecord_djkk_tmp_body"), //Body
                   new nlobjSearchColumn("custrecord_djkk_tmp_filetype"), //Attachment file name
                   new nlobjSearchColumn("custrecord_djkk_tmp_flnameissub")//Same contents as subject
                ]
                );
        var formAddress = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_from"); //From address
        var toAddress = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_to");//TO address
        var bcc = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_bcc");//BCC
        var addressFormMuster = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_to_muster");////Email address from the client master
        if(addressFormMuster == 'T'){
            toAddress = mail;
        }
        var subject = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_subject");//subject
        //CH762 20230814 add by zdj start
//        subject += getdateYYMMDD()+'_'+transactionnumber;
        if(recordType){
          if(recordType == 'invoice'){
            if(transactionnumber){
            subject = subject + '_' + transactionnumber + '_' + getDateYymmddFileName02() + '_' + RondomPass(10);
            }else{
                subject = subject + '_' + getDateYymmddFileName02() + '_' + RondomPass(10);
              }
              }else if(recordType == 'creditmemo'){
                      if(transactionnumber){       
                          subject = subject + '_' + transactionnumber;
                   }else{
                          subject = subject;
                   }
              }else{
                  subject += getdateYYMMDD()+'_'+transactionnumber;
            }
        }else{
            subject += getdateYYMMDD()+'_'+transactionnumber;
        }
        //CH762 20230814 add by zdj end
        var body = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_body");//body
        var fileName = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_filetype");//Attachment file name
        var fileNameFormSubject = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_flnameissub");// SAME CONTENTS AS SUBJECT
        if(fileNameFormSubject == 'T'){
            fileName = subject;
        }else{
          //CH762 20230814 add by zdj start
//            fileName = fileName+getdateYYMMDD()+'_'+transactionnumber;
            if(recordType){
            if(recordType == 'invoice'){
                fileName = fileName + '_' + transactionnumber + '_' + getDateYymmddFileName02() + '_' + RondomPass(10);
            }else if(recordType == 'creditmemo'){
                fileName = fileName + '_' + transactionnumber;
            }else{
                fileName = fileName+getdateYYMMDD()+'_'+transactionnumber;
            }
            }else{
                fileName = fileName+getdateYYMMDD()+'_'+transactionnumber;
            }

          //CH762 20230814 add by zdj end
        }
        nlapiLogExecution('debug','fileName',fileName)
        mailTempleteObj ={
                formAddress:formAddress,
                toAddress:toAddress,
                bcc:bcc,
                addressFormMuster:addressFormMuster,
                subject:subject,
                body:body,
                fileName:fileName,
                fileNameFormSubject:fileNameFormSubject
        }
    }
    if(sendFaxFlag == 'T' && !isEmpty(mailTypeId) && !isEmpty(fax)){
        nlapiLogExecution('debug','mailTypeId',mailTypeId)
        var faxtemplateSearch = nlapiSearchRecord("customrecord_djkk_template",null,
                [
                   ["custrecord_djkk_tmp_sub","anyof",subsidiary], //DJ_子会社
                   "AND", 
                   ["custrecord_djkk_tmp_faxuse","is","T"], //FAXテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_mailuse","is","F"], //MALLテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_type","anyof",mailTypeId]//DJ_送信種類
                ], 
                [
                   new nlobjSearchColumn("custrecord_djkk_tmp_sub"), //DJ_子会社
                   new nlobjSearchColumn("custrecord_djkk_tmp_type"), //DJ_送信種類
                   new nlobjSearchColumn("custrecord_djkk_tmp_faxuse"), //FAXテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_mailuse"), //MALLテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_from"), //From address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to"), //TO address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to_muster"), //Email address from the client master
                   new nlobjSearchColumn("custrecord_djkk_tmp_bcc"), //BCC
                   new nlobjSearchColumn("custrecord_djkk_tmp_subject"), //Subject
                   new nlobjSearchColumn("custrecord_djkk_tmp_body"), //Body
                   new nlobjSearchColumn("custrecord_djkk_tmp_filetype"), //Attachment file name
                   new nlobjSearchColumn("custrecord_djkk_tmp_flnameissub")//Same contents as subject
                ]
                );
        var formAddress = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_from"); //From address
        var toAddress = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_to");//TO address
        var bcc = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_bcc");//BCC
        var addressFormMuster = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_to_muster");////Email address from the client master
        if(addressFormMuster == 'T'){
            toAddress = fax;
        }
        var subject = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_subject");//subject
        subject += custEmployeeId+ '-' + transactionnumber;
        nlapiLogExecution('debug','subject',subject)
        var body = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_body");//body
        var fileName = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_filetype");//Attachment file name
        var fileNameFormSubject = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_flnameissub");// SAME CONTENTS AS SUBJECT
        if(fileNameFormSubject == 'T'){
            fileName = subject;
        }else{
            fileName = fileName+custEmployeeId+ '-' +transactionnumber;
        }
        nlapiLogExecution('debug','fileName',fileName)
        faxTempleteObj ={
                formAddress:formAddress,
                toAddress:toAddress,
                bcc:bcc,
                addressFormMuster:addressFormMuster,
                subject:subject,
                body:body,
                fileName:fileName,
                fileNameFormSubject:fileNameFormSubject
        }
    }
    var recultObj = {
            mailTempleteObj:mailTempleteObj,
            faxTempleteObj:faxTempleteObj
            }
    return recultObj
    }catch(e){
        nlapiLogExecution('debug','message',e)
    }
}
//add by zzq CH675 20230629 end
//20230727 add by zdj start
function formatAmount1(number) {
    var parts = number.toString().split(".");
    var integerPart = parts[0];
    var decimalPart = parts.length > 1 ? "." + parts[1] : "";
    
    var pattern = /(\d)(?=(\d{3})+$)/g;
    integerPart = integerPart.replace(pattern, "$1,");
    
    return integerPart + decimalPart;
}

function othChargeDisplayname(dpn, language) {
    var itemDisplayName = '';
    if (dpn) {
        invoiceDisplayName = dpn.split("/");
        if (language == SYS_LANGUAGE_JP) { // 日本語
            itemDisplayName = invoiceDisplayName[0];
            nlapiLogExecution('debug', 'itemDisplayNameJP', itemDisplayName);
        } else if (language == SYS_LANGUAGE_EN && invoiceDisplayName.length > 1) { // 英語
            itemDisplayName = invoiceDisplayName[1];
            nlapiLogExecution('debug', 'itemDisplayNameEN', itemDisplayName);
        } else {
            itemDisplayName = invoiceDisplayName[0];
        }
    }
    return itemDisplayName;
}

function defaultEmptyToZero1(src){
	  var tempStr = Number(src);
	  var str = String(tempStr);
	  var newStr = "";
	  var count = 0;
	  for (var i = str.length - 1; i >= 0; i--) {
	      if (count % 3 == 0 && count != 0) {
	          newStr = str.charAt(i) + "," + newStr;
	      } else {
	          newStr = str.charAt(i) + newStr;
	      }
	      count++;
	  }
	  str = newStr;

	  return str;
	}


//20230727 add by zdj end

function getStrLenSlice(value, fullAngleCount) {

    if (!value || !fullAngleCount) {
        return '';
    }

    var valueStr = String(value);

    var length = 0;
    var result = '';

    for (var i = 0; i < valueStr.length; i++) {
        var charCode = valueStr.charCodeAt(i);
        var charLength = 1;

        if ((charCode >= 0x3040 && charCode <= 0x309F) || (charCode >= 0x30A0 && charCode <= 0x30FF) || (charCode >= 0x4E00 && charCode <= 0x9FFF)) {
            charLength = 2;
        }

        if (length + charLength > fullAngleCount * 2) {
            break;
        }

        result += valueStr.charAt(i);

        length += charLength;
    }

    return result;
}
