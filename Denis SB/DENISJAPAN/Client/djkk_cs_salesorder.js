/**
 * 注文書画面のclient
 * 
 * Version    Date            Author           Remarks
 * 1.00      2021/01/28        YUAN             新規作成 
 * 1.01      2021/02/18        YUAN             DENISJAPAN-162 
 * 1.02      2021/03/01        YUAN             DENISJAPAN-173 
 * 1.03      2021/03/09        YUAN             DENISJAPAN-184
 *
 */

// 代引き手数料内部ID
var Cash_on_delivery_fee_Item = '106';

// 代引き手数料税金コード
var Cash_on_delivery_fee_rate_taxcode = '9';

// 代引き手数料税率
var Cash_on_delivery_fee_rate_taxrate1 = '0';

// 送料内部ID
var Shipping_Item_ID = '107';

// 送料税金コード
var Shipping_Item_taxcode = '9';

// 送料税率
var Shipping_Item_taxrate1 = '0';

// ログインユーザ
var user = '';

/**
 * 画面の初期化
 */
function clientPageInit(type) {

	nlapiDisableField('custbody_djkk_location_address', true);
	nlapiDisableField('custbody_djkk_delivery_address', true);
	nlapiDisableField('custbody_djkk_customer_address', true);
	var customform = nlapiGetFieldValue('customform');
	//add by zhou 20220830 U651A
	if(customform == '121'){
		nlapiDisableLineItemField('item', 'class', true)
		//add by zhou 20220830 U733
		if(type == 'create'){
			var currentUserId = nlapiGetUser();
			nlapiSetFieldValue('custbody_djkk_shipment_person', currentUserId);	
		}
		//end
	}
	//end
	// add by YUAN 2020/02/18 DENISJAPAN-162
//	if (type == 'copy') {
//		//nlapiSetFieldValue('entity', '');
//	}
	
	// add END
	if (type == 'create' || type == 'copy'|| type == 'view'|| type == 'edit') {
		var customform = nlapiGetFieldValue('customform');
		if(customform == '175'){
			setFieldDisableType('location','hidden');
		}
	}
	// add by YUAN 2020/03/01 DENISJAPAN-173?A
	if (type == 'create' || type == 'copy') {

		// 日付
		nlapiSetFieldValue('trandate', nlapiDateToString(getSystemTime()));

		// 出荷日
		nlapiSetFieldValue('shipdate', nlapiDateToString(getSystemTime()));

		// DJ_納品日
		nlapiSetFieldValue('custbody_djkk_delivery_date',
				nlapiDateToString(getTheNextDay()));
		
		// DJ_納品希望日 add by zhou CH093
		if(customform == '175'){
			nlapiSetFieldValue('custbody_djkk_delivery_hopedate',nlapiDateToString(getTheNextDay()));
		}
		
		//注文日
		nlapiSetFieldValue('custbody_djkk_annotation_day', nlapiDateToString(getSystemTime()));
	}
	// add END

	// ログインユーザを取得
	user = nlapiGetUser();
	
	var deliveryDate = nlapiGetFieldValue('custbody_djkk_delivery_date');
	var shipdate = nlapiGetFieldValue('shipdate');
	
	var itemCount = nlapiGetLineItemCount('item');
	for(var i = 1 ; i < itemCount + 1 ; i ++){
		
		var itemDeliveryDate = nlapiGetLineItemValue('item', 'custcol_djkk_delivery_date', i);
		var itemShipdate = nlapiGetLineItemValue('item', 'custcol_djkk_ship_date', i);
		
		if(isEmpty(itemDeliveryDate)){
			nlapiSetLineItemValue('item', 'custcol_djkk_delivery_date', i, deliveryDate);
		}
		
		if(isEmpty(itemShipdate)){
			nlapiSetLineItemValue('item', 'custcol_djkk_ship_date', i, shipdate);
		}
	}
	
	
	
	
	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
function clientFieldChanged(type, name, linenum) {
		
	// DJ_納品先/顧客
	if(name == 'custbody_djkk_delivery_destination'||name == 'entity'){
		
		//20221103 add by zhou U766 U085 sendmailFlag
		var destinationID = nlapiGetFieldValue('custbody_djkk_delivery_destination');
		var entityId = nlapiGetFieldValue('entity');
		var cust=nlapiGetFieldValue('customform'); 
		// add by YUAN 2020/03/01 DENISJAPAN-173?@
		// DJ_納品先
		
		if (name == 'custbody_djkk_delivery_destination') {
			if (!isEmpty(destinationID)) {
				var destinationRecord = nlapiLookupField('customrecord_djkk_delivery_destination', destinationID,['custrecord_djkk_customer','custrecord_djkk_sales','custrecord_djkk_prefectures','custrecord_djkk_municipalities','custrecord_djkk_delivery_residence','custrecord_djkk_delivery_residence2','custrecord_djkk_language_napin','custrecord_djkk_sodeliverermemo']);
				var customerID = destinationRecord.custrecord_djkk_customer;
				var salesID = destinationRecord.custrecord_djkk_sales;

				if (!isEmpty(customerID)) {
					nlapiSetFieldValue('entity', customerID,false,true);
					nlapiSetFieldValue('custbody_djkk_delivery_destination', destinationID,false,true);
				}
				var sodeliverermemoByDelivery = destinationRecord.custrecord_djkk_sodeliverermemo;
				if (!isEmpty(sodeliverermemoByDelivery)) {
					nlapiSetFieldValue('custbody_djkk_de_sodeliverermem', sodeliverermemoByDelivery,false,false);
				}
				if (!isEmpty(salesID)) {
					nlapiSetFieldValue('salesrep', salesID,false,true);
				}
				
				// LS|承認
				if (cust == '121' || cust == '133') {
					var prefectures = destinationRecord.custrecord_djkk_prefectures;
					var municipalities = destinationRecord.custrecord_djkk_municipalities;
					var deliveryResidence = destinationRecord.custrecord_djkk_delivery_residence;
					var deliveryResidence2 = destinationRecord.custrecord_djkk_delivery_residence2;
					var language = destinationRecord.custrecord_djkk_language_napin;
					var str2 = prefectures + municipalities + deliveryResidence+ deliveryResidence2;
					nlapiSetFieldValue('custbody_djkk_delivery_address', str2,false, true);
					nlapiSetFieldValue('custbody_djkk_language', language, false,true);
				}
			}else{
				nlapiSetFieldValue('custbody_djkk_delivery_address', '',false, true);
				nlapiSetFieldValue('custbody_djkk_language', '', false,true);
			}
		}
		// add END
		//add by zhou 20220808 U732
		if(name == 'entity'){
			if (!isEmpty(entityId)) {
				try{
				// add by YUAN 2020/02/18 DENISJAPAN-162
				var customerR = nlapiLookupField('customer', entityId,['custentity_djkk_customer_type','custentity_djkk_product_category_scetikk','custentity_djkk_product_category_jp','custentity_djkk_activity','custentity_4392_useids', 'custentity_djkk_language','custentity_djkk_sodeliverermemo']);
				if (customerR.custentity_djkk_customer_type == '1' || customerR.custentity_djkk_customer_type == '2') {
					alert('リード顧客と潜在顧客は選択できません。');
					nlapiSetFieldValue('entity', '',true,true);
				}else{
					
				// add END
				var g1=customerR.custentity_djkk_product_category_scetikk;
				var g2=customerR.custentity_djkk_product_category_jp;
				nlapiSetFieldValue('custbody_djkk_customer_group', isEmpty(g1)?g2:g1, false,true);
				
				
					
			// LS|承認
			if(cust == '121'||cust == '133'){
				nlapiSetFieldValue('custbody_djkk_sodeliverermem', customerR.custentity_djkk_sodeliverermemo,false,false); //20230214 add by zhou U046 DJ_送り状に記載備考欄
				var g3 = customerR.custentity_djkk_activity;
				nlapiSetFieldValue('department', g3, false,true);
				var g4 = customerR.custentity_4392_useids;
				if(g4 == 'T'){
					nlapiSetFieldValue('custbody_4392_includeids','T', false,true);
				}
						
				//20220812  U768  by song start				
				var destination = nlapiGetFieldValue('custbody_djkk_delivery_destination');
				//end						
					if(isEmpty(destination)){
						nlapiSetFieldValue('custbody_djkk_language', customerR.custentity_djkk_language, false,true);
				       }
					var customerSearch = nlapiSearchRecord("customer",null,
							[
							   ["isdefaultbilling","is","T"], 
							   "AND", 
							   ["internalid","anyof",entityId]
							], 
							[
							   new nlobjSearchColumn("custrecord_djkk_address_state","Address",null), 
							   new nlobjSearchColumn("city","Address",null), 
							   new nlobjSearchColumn("address1","Address",null), 
							   new nlobjSearchColumn("address2","Address",null), 
							   new nlobjSearchColumn("address3","Address",null), 
							   new nlobjSearchColumn("addressee","Address",null)
							]
							);
					if (!isEmpty(customerSearch)) {
						var addressState = customerSearch[0].getValue("custrecord_djkk_address_state","Address",null);
						var city = customerSearch[0].getValue("city","Address",null);
						var address1 = customerSearch[0].getValue("address1","Address",null);
						var address2 = customerSearch[0].getValue("address2","Address",null);
						var address3 = customerSearch[0].getValue("address3","Address",null);
						var addressee = customerSearch[0].getValue("addressee","Address",null);
						var str = ''
						str += ''+addressState+' '+city+' '+address1+' '+address2+' '+address3+' '+addressee+'';
						nlapiSetFieldValue('custbody_djkk_customer_address', str, false,true);
					}
				}
			}
		  }catch(e){
			  nlapiLogExecution('DEBUG', 'e.message', e)
		  }
		}else{
			  nlapiSetFieldValue('custbody_djkk_customer_group', '', false,true);
			  nlapiSetFieldValue('department', '', false,true);
			  nlapiSetFieldValue('custbody_4392_includeids','F', false,true);
			  nlapiSetFieldValue('custbody_djkk_language', '', false,true);
			  nlapiSetFieldValue('custbody_djkk_customer_address', '', false,true);
		  }
		}
			
		if(!isEmpty(destinationID)){
			var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destinationID); // DJ_納品先record
		}
		if(!isEmpty(nlapiGetFieldValue('entity'))){
			var custRecord = nlapiLoadRecord('customer',nlapiGetFieldValue('entity'));
		}
		var deliverySendMailFlag = false;
		if(!isEmpty(destinationID)){
				var deliveryPeriod = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_period');//DJ_納品書送信方法
				if(cust == '121'){ //LS
					var deliverySite = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_site');//DJ_納品書送信先
				}else if(cust == '175'){ //食品
					var deliverySiteFd = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_site_fd');//DJ_納品書送信先
				}
				
				var deliveryPerson = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person');//DJ_納品書送信先担当者
				var deliverySubName = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_subname');//DJ_納品書送信先会社名(3RDパーティー)
				var deliveryPersont = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person_t');//DJ_納品書送信先担当者(3RDパーティー)
				var deliveryEmail = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_email');//DJ_納品書送信先メール(3RDパーティー)
				var deliveryFax = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_fax_three');//DJ_納品書送信先FAX(3RDパーティー)
				var deliveryMemo = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_memo');//DJ_納品書自動送信送付先備考
//				if(!isEmpty(deliveryPeriod)&& (deliveryPeriod !='10')&& (deliveryPeriod != '9')){
				    if(!isEmpty(deliveryPeriod)&& (deliveryPeriod != '9')){
					nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_納品書送信方法
					if(cust == '121'){
						
						nlapiSetFieldValue('custbody_djkk_delivery_book_site', deliverySite,false);//DJ_納品書送信先
					}else if(cust == '175'){
						nlapiSetFieldValue('custbody_djkk_delivery_book_site_fd', deliverySiteFd,false);//DJ_納品書送信先
					}
					nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);//DJ_納品書送信先担当者
					nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);//DJ_納品書送信先会社名(3RDパーティー)
					nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_納品書送信先担当者(3RDパーティー)
					nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);//DJ_納品書送信先メール(3RDパーティー)
					nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_納品書送信先FAX(3RDパーティー)
					if(cust == '121'){
						nlapiSetFieldValue('custbody_djkk_reference_column', deliveryMemo);//DJ_納品書自動送信備考  custbody_djkk_reference_column
					}else if(cust == '175'){
						nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo);//DJ_納品書自動送信備考  custbody_djkk_reference_column
					}
				}else if(!isEmpty(deliveryPeriod) && (deliveryPeriod == '9')){
					deliverySendMailFlag = true;
					customerSendmails(deliverySendMailFlag,custRecord);
				}
		}else{
			deliverySendMailFlag = true;
			customerSendmails(deliverySendMailFlag,custRecord);
		}
		
		
		if(cust == '121'){	
			if(!isEmpty(destinationID)){
				var loadingRecord = deliveryRecord;
				var shippinginfosendtype = loadingRecord.getFieldValue('custrecord_djkk_shippinginfosendtyp')//DJ_納期回答送信方法|DJ_出荷案内送信区分
				var shippinginfodesttype = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodesttyp')//DJ_納期回答送信先|DJ_出荷案内送信先区分
				var deliverydestrep = loadingRecord.getFieldValue('custrecord_djkk_deliverydestrep')//DJ_納期回答送信先担当者|DJ_出荷案内送信先担当者
				var shippinginfodestname = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestname')//DJ_納期回答送信先会社名(3RDパーティー)|DJ_出荷案内送信先会社名(3RDパーティー)
				var shippinginfodestrep = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestrep')//DJ_納期回答送信先担当者(3RDパーティー)|DJ_出荷案内送信先担当者(3RDパーティー)
				var shippinginfodestemail = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestemail')//DJ_納期回答送信先メール(3RDパーティー)|DJ_出荷案内送信先メール(3RDパーティー)
				var shippinginfodestfax = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestfax')//DJ_納期回答送信先FAX(3RDパーティー)|DJ_出荷案内送信先FAX(3RDパーティー)
				var shippinginfodestmemo = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestmemo')//DJ_納期回答自動送信送付先備考|DJ_出荷案内送信先登録メモ
				if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype != '101'){
					//顧客優先以外の場合	
					nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', shippinginfosendtype,false);
					nlapiSetFieldValue('custbody_djkk_shippinginfodesttyp', shippinginfodesttype,false);
					nlapiSetFieldValue('custbody_djkk_customerrep_new', deliverydestrep,false);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestname', shippinginfodestname,false);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestrep_new', shippinginfodestrep,false);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestemail', shippinginfodestemail,false);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestfax', shippinginfodestfax,false);
					nlapiSetFieldValue('custbody_djkk_reference_delive', shippinginfodestmemo,false);	
				}else if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype == '101'){
					//顧客優先の場合
					deliverySendMailFlag = false;
					customerSendmails(deliverySendMailFlag,custRecord);
				}
	//			else if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype == '36'){
	//				//送信不可の場合
	//				nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp_new', shippinginfosendtype);
	//			}
			}else{
				deliverySendMailFlag = false;
				customerSendmails(deliverySendMailFlag,custRecord);
			}
   		}
		var newEntityId = nlapiGetFieldValue('entity');
		if(!isEmpty(newEntityId)){
			custRecord = nlapiLookupField('customer', newEntityId,['custentity_djkk_invoice_book_period','custentity_djkk_invoice_book_site']);
			var invoicePeriod = custRecord.custentity_djkk_invoice_book_period;//DJ_請求書送信区分
			var invoiceSite = custRecord.custentity_djkk_invoice_book_site;//DJ_請求書送信先区分
			nlapiSetFieldValue('custbody_djkk_invoice_book_period', invoicePeriod,false);
			nlapiSetFieldValue('custbody_djkk_invoice_book_site', invoiceSite,false);
		}

		//end
//		}
	
			
	}else if(type=='item'){
		
		// By LIU 2022/01/24
		if (name == 'item') {
			var deliveryDate = nlapiGetFieldValue('custbody_djkk_delivery_date');
			var shipdate = nlapiGetFieldValue('shipdate');
				
			if(!isEmpty(deliveryDate)){
				nlapiSetCurrentLineItemValue('item', 'custcol_djkk_delivery_date', deliveryDate, false);
			}
				
			if(!isEmpty(shipdate)){
				nlapiSetCurrentLineItemValue('item', 'custcol_djkk_ship_date', shipdate, false);
			}
			// add by song CH327 start 明細場所空白判定
			if(!isEmpty(nlapiGetFieldValue('location'))&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item')) && isEmpty(nlapiGetCurrentLineItemValue('item','location'))){
				 nlapiSetCurrentLineItemValue('item', 'location',nlapiGetFieldValue('location'), false);
			}
			// add by song CH327 start 明細場所空白判定
			// add by YUAN 2020/03/09 DENISJAPAN-184
//			 if (!isEmpty(nlapiGetFieldValue('location'))&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
//			 nlapiSetCurrentLineItemValue('item', 'location',nlapiGetFieldValue('location'));
//			 }
			 
//			 if (isEmpty(nlapiGetFieldValue('location'))
//			 && !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
//			 nlapiSetCurrentLineItemValue('item', 'item', null, false);
//			 alert('アイテムを選択する前に、場所を入力する必要があります');
//			 }
			
			//運送会社
			var cust=nlapiGetFieldValue('customform'); 
			if(cust == '121'||cust == '133'){
				var itemId = nlapiGetCurrentLineItemValue('item', 'item');
				if(!isEmpty(itemId)){
				var destinationID = nlapiGetFieldValue('custbody_djkk_delivery_destination');
				var entityId = nlapiGetFieldValue('entity');
				var delvShippingCompany = null;
				var delvShippingSpInstruction = null;
				if(!isEmpty(destinationID)){
				var destinationRecord = nlapiLookupField('customrecord_djkk_delivery_destination', destinationID,['custrecord_djkk_shipping_companys','custrecord_djkk_shipping_sp_instruction']);
					delvShippingCompany = destinationRecord.custrecord_djkk_shipping_companys;//納品先.DJ_運送会社
					delvShippingSpInstruction = destinationRecord.custrecord_djkk_shipping_sp_instruction;//納品先.DJ_配送の特記事項
				}

				var customerR = nlapiLookupField('customer', entityId,['custentity_djkk_shipping_company','custentity_djkk_shipping_sp_instruction']);
				var entityShippingCompany =customerR.custentity_djkk_shipping_company;//顧客.DJ_運送会社
				var entityShippingSpInstruction =customerR.custentity_djkk_shipping_sp_instruction;//顧客.DJ_配送の特記事項
				
				
				
				var itemR = nlapiLookupField('item', itemId,['custitem_djkk_shipping_company','custitem_djkk_product_category_sml']);
				var itemShippingCompany = itemR.custitem_djkk_shipping_company;//アイテム.DJ_運送会社
				var itemProductCategorySml = itemR.custitem_djkk_product_category_sml;//アイテム.DJ_配送温度
//				alert('itemShippingCompany='+itemShippingCompany)
//				alert('delvShippingSpInstruction='+delvShippingSpInstruction)
				if(!isEmpty(itemShippingCompany)){	
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_shipping_company',itemShippingCompany, false);
	//				currentLine.運送会社 = item.運送会社
				}else if(!isEmpty(delvShippingCompany)){	
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_shipping_company',delvShippingCompany, false);
	//				currentLine.運送会社 = Delv.運送会社
				}else if(!isEmpty(entityShippingCompany)){	
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_shipping_company',entityShippingCompany, false);
	//				currentLine.運送会社 = Entity.運送会社
					}
	
				//配送の特記事項
				if(!isEmpty(delvShippingSpInstruction)){	
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_shipping_sp_instruction',delvShippingSpInstruction, false);
	//				currentLine.配送の特記事項 = Delv.配送の特記事項
				}else if(!isEmpty(entityShippingSpInstruction)){	
	//				currentLine.配送の特記事項 = Entity.配送の特記事項
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_shipping_sp_instruction',entityShippingSpInstruction, false);
					}
				
				//配送温度	
				if(!isEmpty(itemProductCategorySml)){	
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_temperature',itemProductCategorySml, false);
	//				currentLine.配送温度 = item.配送温度
				}
			}

			}
			
		}
		
		// by LIU 2022/01/12
		if (name == 'units' || name == 'quantity') {
			
			var itemId = nlapiGetCurrentLineItemValue('item', 'item');

			// 数量
			var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');
			// CH677 zzq 20230629 start
			// DJ_入数
//			var unitname = nlapiGetCurrentLineItemText('item', 'units');
			var unitId = nlapiGetCurrentLineItemValue('item', 'units');
			var crVal = '';
			if (!isEmpty(unitId)) {
			    if (itemId) {
	                var itemUnitsTypeId = nlapiLookupField('item',itemId,'unitstype');
	                if (itemUnitsTypeId) {
	                    crVal = getConversionrateAbbreviationNew(itemUnitsTypeId, unitId);
	                }   
			    }
			}
			var perunitQuantity = !isEmpty(crVal) ? crVal : '';
//			var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
			// CH677 zheng 20230629 end
			if(!isEmpty(quantity) && !isEmpty(perunitQuantity) && !isEmpty(itemId)){
				
				// DJ_入り数(入り目)
				var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity');
	          
				if(!isEmpty(itemPerunitQuantity)){
					// DJ_基本数量
					var conversionRate = quantity * perunitQuantity;
					
					// DJ_ケース数
					var floor = Math.floor(conversionRate / itemPerunitQuantity);
					var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
					
					// DJ_バラ数
					var djQuantity = (conversionRate - caseQuantity * itemPerunitQuantity).toFixed(2);
					
					// DJ_基本数量
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_conversionrate',conversionRate);
					
					// DJ_ケース数
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_casequantity',caseQuantity);
					
					// DJ_バラ数
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_quantity',djQuantity);
					
					// DJ_入数
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_perunitquantity',itemPerunitQuantity);
				}
			}
		}
				 
		if (name == 'location') {
			//clientDevelopmentTesting('locationchange'+nlapiGetFieldValue('location'))
			nlapiSetCurrentLineItemValue('item', 'inventorylocation',
					nlapiGetCurrentLineItemValue('item', 'location'));
		}
		
		if (name == 'inventorylocation') {
			if (isEmpty(nlapiGetCurrentLineItemValue('item', 'inventorylocation'))
					&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))
					&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
				nlapiSetCurrentLineItemValue('item', 'inventorylocation',
						nlapiGetCurrentLineItemValue('item', 'location'), false);

			}
			// add by song CH327 start 明細場所空白判定
			if (nlapiGetCurrentLineItemValue('item', 'location') != nlapiGetCurrentLineItemValue(
					'item', 'inventorylocation')&& isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))){
				nlapiSetCurrentLineItemValue('item', 'location',
						nlapiGetCurrentLineItemValue('item', 'inventorylocation'),false);
			}
			// add by song CH327 end 明細場所空白判定
		}
		// add end
		
	}
	if(name == 'custbody_djkk_location'){
		var customform = nlapiGetFieldValue('customform');
		// 食品
		if(customform == '175'){
			var locationValue = nlapiGetFieldValue('custbody_djkk_location');
			if(!isEmpty(locationValue)){
				nlapiSetFieldValue('location', locationValue,true,true);
			}
		}
	}
		
	if (name == 'location'&&type!='item') {
		var locationId = nlapiGetFieldValue('location');

		if (!isEmpty(locationId)) {
			var locationRecord = nlapiLoadRecord('location', locationId);
			var loactionAddress = locationRecord.getFieldValue('mainaddress_text');
			if (!isEmpty(loactionAddress)) {
				nlapiSetFieldValue('custbody_djkk_location_address',loactionAddress, false,true);
			} else {
				nlapiSetFieldValue('custbody_djkk_location_address', '', false,true);
			}
		} else {
			nlapiSetFieldValue('custbody_djkk_location_address', '', false,true);
		}

		// // add by YUAN 2020/03/09 DENISJAPAN-184
		 var count = nlapiGetLineItemCount('item');
		 for (var i = 1; i < count + 1; i++) {
		 nlapiSelectLineItem('item', i);
		// add by song CH327 start 明細場所空白判定
		 if (!isEmpty(nlapiGetCurrentLineItemValue('item', 'item')) && isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))) {
		 nlapiSetCurrentLineItemValue('item', 'location', locationId,
		 true);
		 nlapiCommitLineItem('item');
		 }
		// add by song CH327 end 明細場所空白判定
		 }
		// // add end
	}
	

	//2022/03/28 change by ycx 顧客 DJ_支払条件 支払条件（締め日無し) start
	if(name == 'custbody_djkk_payment_conditions'){
		var subsidiary = nlapiGetFieldValue('subsidiary');
		if(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK ){
		var conditionsValue = nlapiGetFieldValue('custbody_djkk_payment_conditions');
		if(conditionsValue == 2){
			nlapiSetFieldValue('terms',7,false,true);
			}else if(conditionsValue == 1){
			nlapiSetFieldValue('terms',10,false,true);
			}else{
			nlapiSetFieldValue('terms','',false,true);	
			}
	 }	  
	}
	//end
	
	if (name == 'custbody_djkk_reserved_exchange_rate_s') {
		var  rateid=nlapiGetFieldValue('custbody_djkk_reserved_exchange_rate_s');		
		var rate = '';
		if(!isEmpty(rateid)){
		rate =nlapiLookupField('customrecord_djkk_reserved_exchange_rate',rateid,'custrecord_djkk_reserved_exchange_rate');
		}
		nlapiSetFieldValue('exchangerate', rate, false,true);
	}
		
	if(name == 'custbody_djkk_delivery_date'||name == 'shipdate'){
		
		var delivery_date = nlapiGetFieldValue('custbody_djkk_delivery_date');
		var shipdate = nlapiGetFieldValue('shipdate');
			var itemCount = nlapiGetLineItemCount('item');
			for (var i = 1; i < itemCount + 1; i++) {
				nlapiSetLineItemValue('item', 'custcol_djkk_delivery_date', i, delivery_date);
				nlapiSetLineItemValue('item', 'custcol_djkk_ship_date', i, shipdate);
			}			
	 }
	
	if(name == 'custbody_djkk_shippinginfodesttyp'){
		var destination = nlapiGetFieldValue('custbody_djkk_delivery_destination') // 納品先
		var custForm = nlapiGetFieldValue('customform');
		var entity = nlapiGetFieldValue('entity') // 顧客
		if(custForm = '121'){  //LS
			if(!isEmpty(destination)){
				var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destination); // DJ_納品先record
			}
			if(!isEmpty(entity)){
				var custRecord = nlapiLoadRecord('customer',entity);
			}
			var shippinginfodesttyp = nlapiGetFieldValue('custbody_djkk_shippinginfodesttyp');   //DJ_納期回答送信先
			if(shippinginfodesttyp == '39'){   //納期回答送信先 =納品先
				if(isEmpty(destination)){
					alert("DJ_納品先をお選びください")
					return false;
				}else{
					shippinginfoSendMailChangeFormDelivery(deliveryRecord)
				}
			}else if(shippinginfodesttyp == '40'){//納期回答送信先 =顧客先
				if(isEmpty(entity)){
					alert("顧客をお選びください")
					return false;
				}else{
					shippinginfoSendMailChangeFormCustomer(custRecord)
				}
			}else if(shippinginfodesttyp == '38'){ //納期回答送信先 =3rd
				if(!isEmpty(destination) || !isEmpty(entity)){
					if(!isEmpty(destination)){
						shippinginfoSendMailChangeFormDelivery(deliveryRecord)
					}else{
						shippinginfoSendMailChangeFormCustomer(custRecord)
					}
				}
			}
		}
	}
	
	if(name == 'custbody_djkk_delivery_book_site'){
		var destination = nlapiGetFieldValue('custbody_djkk_delivery_destination') // 納品先
		var custForm = nlapiGetFieldValue('customform');
		var entity = nlapiGetFieldValue('entity') // 顧客
		var thirdFlag = false;
		if(custForm = '121'){  //LS
			if(!isEmpty(destination)){
				var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destination); // DJ_納品先record
			}
			if(!isEmpty(entity)){
				var custRecord = nlapiLoadRecord('customer',entity);
			}
			var deliverySite = nlapiGetFieldValue('custbody_djkk_delivery_book_site');   //DJ_納品書送信先
			if(deliverySite == '15'){   //DJ_納品書送信先 =納品先
				if(isEmpty(destination)){
					alert("DJ_納品先をお選びください")
					return false;
				}else{
					deliverySendMailChangeFormDelivery(deliveryRecord)
				}
			}else if(deliverySite == '16'){//DJ_納品書送信先 =顧客先
				if(isEmpty(entity)){
					alert("顧客をお選びください")
					return false;
				}else{
					deliverySendMailChangeFormCustomer(custRecord)
				}
			}else if(deliverySite == '14'){ //DJ_納品書送信先 =3rd
				if(!isEmpty(destination) || !isEmpty(entity)){
					thirdFlag = true;
					if(!isEmpty(destination)){
						deliverySendMailChangeFormDelivery(deliveryRecord)
					}else{
						deliverySendMailChangeFormCustomer(custRecord)
					}
				}
			}else if (deliverySite == '24'){ //DJ_納品書送信先 =倉庫
				nlapiSetFieldValue('custbody_djkk_delivery_book_period', ''); //納品書送信方法
				nlapiSetFieldValue('custbody_djkk_delivery_book_person', ''); //納品書送信先担当者
				nlapiSetFieldValue('custbody_djkk_delivery_book_subname', ''); //納品書送信先会社名(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', ''); //納品書送信先担当者(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_delivery_book_email', ''); //納品書送信先メール(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', ''); //納品書送信先FAX(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_reference_column', ''); //納品書自動送信送付先備考
			}
		}
	}
	if( name == 'custbody_djkk_delivery_book_site_fd'){
		var destination = nlapiGetFieldValue('custbody_djkk_delivery_destination') // 納品先
		var entity = nlapiGetFieldValue('entity') // 顧客
		var custForm = nlapiGetFieldValue('customform');
		if(custForm = '175'){  //fd
			if(!isEmpty(destination)){
				var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destination); // DJ_納品先record
			}
			if(!isEmpty(entity)){
				var custRecord = nlapiLoadRecord('customer',entity);
			}
			var deliverySite = nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd');   //DJ_納品書送信先
			if(deliverySite == '15'){   //DJ_納品書送信先 =納品先
				if(isEmpty(destination)){
					alert("DJ_納品先をお選びください")
					return false;
				}else{
					deliverySendMailChangeFormDelivery(deliveryRecord)
				}
			}else if(deliverySite == '16'){//DJ_納品書送信先 =顧客先
				if(isEmpty(entity)){
					alert("顧客をお選びください")
					return false;
				}else{
					deliverySendMailChangeFormCustomer(custRecord)
					}
			}else if(deliverySite == '14'){ //DJ_納品書送信先 =3rd
				if(!isEmpty(destination) || !isEmpty(entity)){
					if(!isEmpty(destination)){
					deliverySendMailChangeFormDelivery(deliveryRecord)
					}else{
					deliverySendMailChangeFormCustomer(custRecord)	
					}
				}
			}
		}	
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {

//	// DJ_納期回答自動送信
//	var delivery_replyauto_flg = nlapiGetFieldValue('custbody_djkk_delivery_replyauto');
//	var delivery_replyauto_mail = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_mail');
//	var delivery_replyauto_fax = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_fax');
//
//	// DJ_請求書自動送信
//	var invoice_automa_flg = nlapiGetFieldValue('custbody_djkk_invoice_automa');
//	var invoice_automa_mail = nlapiGetFieldValue('custbody_djkk_invoice_automatic_mail');
//	var invoice_automa_fax = nlapiGetFieldValue('custbody_djkk_invoice_automatic_fax');
//
//	if (delivery_replyauto_flg == 'T' && isEmpty(delivery_replyauto_mail) && isEmpty(delivery_replyauto_fax)) {
//		alert('「DJ_納期回答自動送信」をチェックした場合、「DJ_納期回答自動送信送付先メール」と「DJ_納期回答自動送信送付先FAX」をいずれかを何かを記入する。');
//		return false;
//	}
//
//	if (invoice_automa_flg == 'T' && isEmpty(invoice_automa_mail) && isEmpty(invoice_automa_fax)) {
//		alert('「DJ_請求書自動送信」をチェックした場合、「DJ_請求書自動送信送付先メール」と「DJ_請求書自動送信送付先FAX」をいずれかを何かを記入する。');
//		return false;
//	}

	//与信限度額判断
	var total = nlapiGetFieldValue('total');
	var exchangerate = nlapiGetFieldValue('exchangerate')
	total = Number(total) * Number(exchangerate);
	var custId = nlapiGetFieldValue('entity');
	
	if(isEmpty(custId)){
		alert('顧客を入力してください。')
		return false;
	}
	
	var custRec = nlapiLoadRecord('customer', custId);
	var custName = custRec.getFieldValue('entityid');
	var custCreateLimit = custRec.getFieldValue('custentity_djkk_credit_limit');
	var custBalance = custRec.getFieldValue('balance');
	var unbilledorders = custRec.getFieldValue('unbilledorders');
	
	
	var msg = custName+'\r'+'与信限度額:'+thousandsWithComa(Number(custCreateLimit)) +'\r'+'売掛金残高:'+thousandsWithComa(Number(custBalance))+'\r'+'未請求金額:'+thousandsWithComa(Number(unbilledorders))+'\r'+'注文書金額:'+thousandsWithComa(Number(total));
	if(custCreateLimit != 0 && !isEmpty(custCreateLimit)){
		if(Number(custCreateLimit) - Number(custBalance) -Number(total) -Number(unbilledorders)  < 0){
			msg+='\r与信限度額が超えています。'
			alert(msg)
		}
	}

	//納品先設定判断
	var priceFlg = nlapiGetFieldValue('custbody_djkk_pl_use_flag');
	var nohinsaki = nlapiGetFieldValue('custbody_djkk_delivery_destination');
	if(priceFlg == '2' || priceFlg == '3'){
		if(isEmpty(nohinsaki)){
			alert('DJ_納品先を入力してください。')
			return false;
		}
	}
	
	//修理品場合　ステータスを変更する
	//修理品ステータス：　ステータスが入庫、未受領、検品済み、見積書書送信済み見積書書回答済みチェックし、SO作成場合　修理完了へ設定
	var repaire = nlapiGetFieldValue('custbody_djkk_estimate_re');
	if(!isEmpty(repaire)){
		var repaireRec = nlapiLoadRecord('customrecord_djkk_repair', repaire)
		if(repaireRec.getFieldValue('custrecord_djkk_re_status') < 6){
			repaireRec.setFieldValue('custrecord_djkk_re_status', 6);
			nlapiSubmitRecord(repaireRec);
		}
	}
	//20221028 add by zhou U658 start
	var memoCheck = nlapiGetFieldValue('custbody_djkk_memo_column');
	var memoContent = nlapiGetFieldValue('custbody_djkk_memo_content');
	if(memoCheck == 'T' && !isEmpty(memoContent)){
		nlapiSetFieldValue('custbody_djkk_reference_delive',memoContent);
		nlapiSetFieldValue('custbody_djkk_reference_column',memoContent);
		nlapiSetFieldValue('custbody_djkk_request_reference_bar',memoContent);
	}
	//end
	return true;
	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
	if (type == 'item'&&name == 'item'
			&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
		
		//clientDevelopmentTesting('clientPostSourcing'+nlapiGetFieldValue('location'))
		nlapiSetCurrentLineItemValue('item', 'inventorysubsidiary',
				nlapiGetFieldValue('subsidiary'),false);
		//20230224 add by zhou CH327 start 在庫場所空白判定
		if(isEmpty(nlapiGetCurrentLineItemValue('item', 'inventorylocation'))){
		nlapiSetCurrentLineItemValue('item', 'inventorylocation',
				nlapiGetFieldValue('location'),false);
		}
		//end
		// add by song CH327 start 明細場所空白判定
		if(isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))){
			nlapiSetCurrentLineItemValue('item', 'location',
					nlapiGetFieldValue('location'),false);
		}
		// add by song CH327 end 明細場所空白判定
		nlapiSetCurrentLineItemValue('item', 'quantity',nlapiGetCurrentLineItemValue('item', 'quantity'),true,true);
		
	}
	if(name=='custbody_djkk_delivery_destination'){
		var subVal = nlapiGetFieldValue('subsidiary');
		if(subVal==SUB_DPKK || subVal==SUB_SCETI){
			var delivery = nlapiGetFieldValue('custbody_djkk_delivery_destination');
			if(!isEmpty(delivery)){
				var methodVal = nlapiLookupField('customrecord_djkk_delivery_destination', delivery,'custrecord_djkk_shippingitem');
				if(!isEmpty(methodVal)){
					nlapiSetFieldValue('shipmethod', methodVal);
				}else{
					var customer = nlapiGetFieldValue('entity');
					if(!isEmpty(customer)){
						var methodCust = nlapiLookupField('customer', customer, 'shippingitem');
						if(!isEmpty(methodCust)){
							nlapiSetFieldValue('shipmethod', methodCust);
						}
					}
				}
			}
		}
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type) {
	// DJ_明細場所ID配列
	var LTArray = new Array();
	LTArray.push([ 'custbody_djkk_itemlocation1',
			'custbody_djkk_itemlocation_total1' ]);
	LTArray.push([ 'custbody_djkk_itemlocation2',
			'custbody_djkk_itemlocation_total2' ]);
	LTArray.push([ 'custbody_djkk_itemlocation3',
			'custbody_djkk_itemlocation_total3' ]);
	LTArray.push([ 'custbody_djkk_itemlocation4',
			'custbody_djkk_itemlocation_total4' ]);
	LTArray.push([ 'custbody_djkk_itemlocation5',
			'custbody_djkk_itemlocation_total5' ]);

	// 画面のDJ_明細場所とDJ_明細金額をクリア
	for (var lt = 0; lt < LTArray.length; lt++) {

		// todo ログインユーザが李の場合、修正後データを実行
		if (user == '416') {
			nlapiSetFieldValue(LTArray[lt][0], '');
			nlapiSetFieldValue(LTArray[lt][1], null);
		}

		// other not lee people
		else {
			nlapiSetFieldValue(LTArray[lt][0], null);
			nlapiSetFieldValue(LTArray[lt][1], null);
		}
	}

	// アイテムの件数
	var itemCount = nlapiGetLineItemCount('item');
	// 場所配列
	var locations = new Array();

	// アイテム明細をループ
	for (var i = 1; i < itemCount + 1; i++) {

		// todo ログインユーザが李の場合のみ実行
		if (user == '416') {
			// アイテムが”送料”もしくは”代引き手数料”の場合、次のアイテムに進む
			if (nlapiGetLineItemValue('item', 'item', i) == Shipping_Item_ID
					|| nlapiGetLineItemValue('item', 'item', i) == Cash_on_delivery_fee_Item) {
				continue;
			}
		}

		// アイテムの場所が存在する場合
		if (!isEmpty(nlapiGetLineItemValue('item', 'location', i))) {
			// アイテムの場所は場所配列にまだ存在しない場合
			if (locations.indexOf(nlapiGetLineItemValue('item', 'location', i)) < 0) {
				// アイテムの場所を場所配列に格納
				locations.push(nlapiGetLineItemValue('item', 'location', i));
				// DJ_明細場所Nが空の場合、アイテムの場所と総額を設定し、ループを中止
				Flag1: for (var lti = 0; lti < LTArray.length; lti++) {
					if (isEmpty(nlapiGetFieldValue(LTArray[lti][0]))
							&& isEmpty(nlapiGetFieldValue(LTArray[lti][1]))) {
						nlapiSetFieldValue(LTArray[lti][0],
								nlapiGetLineItemValue('item', 'location', i));
						nlapiSetFieldValue(LTArray[lti][1],
								nlapiGetLineItemValue('item', 'grossamt', i));
						break Flag1;
					}
				}
				// アイテムの場所は場所配列に存在する場合
			} else {
				// 同一場所の総額を合算して、DJ_明細場所Nに設定
				Flag2: for (var lto = 0; lto < LTArray.length; lto++) {
					if (nlapiGetFieldValue(LTArray[lto][0]) == nlapiGetLineItemValue(
							'item', 'location', i)) {
						nlapiSetFieldValue(LTArray[lto][1],
								Number(nlapiGetFieldValue(LTArray[lto][1]))
										+ Number(nlapiGetLineItemValue('item',
												'grossamt', i)));
						break Flag2;
					}
				}
			}
		}
	}
	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type) {
	var LTArray = new Array();
	LTArray.push([ 'custbody_djkk_itemlocation1',
			'custbody_djkk_itemlocation_total1' ]);
	LTArray.push([ 'custbody_djkk_itemlocation2',
			'custbody_djkk_itemlocation_total2' ]);
	LTArray.push([ 'custbody_djkk_itemlocation3',
			'custbody_djkk_itemlocation_total3' ]);
	LTArray.push([ 'custbody_djkk_itemlocation4',
			'custbody_djkk_itemlocation_total4' ]);
	LTArray.push([ 'custbody_djkk_itemlocation5',
			'custbody_djkk_itemlocation_total5' ]);

	for (var lt = 0; lt < LTArray.length; lt++) {
		// todo ログインユーザが李の場合、修正後データを実行
		if (user == '416') {
			nlapiSetFieldValue(LTArray[lt][0], '');
			nlapiSetFieldValue(LTArray[lt][1], null);
		}

		// other not lee people
		else {
			nlapiSetFieldValue(LTArray[lt][0], null);
			nlapiSetFieldValue(LTArray[lt][1], null);
		}
	}
	var itemCount = nlapiGetLineItemCount('item');
	var locations = new Array();
	for (var i = 1; i < itemCount + 1; i++) {
		if (!isEmpty(nlapiGetLineItemValue('item', 'location', i))) {
			if (locations.indexOf(nlapiGetLineItemValue('item', 'location', i)) < 0) {
				locations.push(nlapiGetLineItemValue('item', 'location', i));
				Flag1: for (var lti = 0; lti < LTArray.length; lti++) {
					if (isEmpty(nlapiGetFieldValue(LTArray[lti][0]))
							&& isEmpty(nlapiGetFieldValue(LTArray[lti][1]))) {
						nlapiSetFieldValue(LTArray[lti][0],
								nlapiGetLineItemValue('item', 'location', i));
						nlapiSetFieldValue(LTArray[lti][1],
								nlapiGetLineItemValue('item', 'grossamt', i));
						break Flag1;
					}
				}
			} else {
				Flag2: for (var lto = 0; lto < LTArray.length; lto++) {
					if (nlapiGetFieldValue(LTArray[lto][0]) == nlapiGetLineItemValue(
							'item', 'location', i)) {
						nlapiSetFieldValue(LTArray[lto][1],
								Number(nlapiGetFieldValue(LTArray[lto][1]))
										+ Number(nlapiGetLineItemValue('item',
												'grossamt', i)));
						break Flag2;
					}
				}
			}
		}
	}
	return true;
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {
	if(type == 'item'){
		if(isEmpty(nlapiGetCurrentLineItemValue(type, 'quantity')) ){
			nlapiSetCurrentLineItemValue(type, 'quantity', 1)
		}
		
	}

}

function clientValidateLine(type){
	
	
	return true;
}

/*
 * 手数料自動計算
 * 
 * 
 */
function commission() {
	// DJ_支払条件を取得
	var payment = nlapiGetFieldValue('custbody_djkk_payment_conditions');
	// 支払条件が代引きの場合、代引き手数料を計算する
	if (payment != '1') {
		alert("支払条件は代引きのみ場合計算できます。")
		return;
	}
	
	var locationArray = new Array();
	var itemArray = new Array();		
		
			
	//明細行繰り返す処理
	var count = nlapiGetLineItemCount('item');
	for (var i = 1; i < count + 1; i++) {
		itemArray.push(nlapiGetLineItemValue('item', 'item', i));
		if(nlapiGetLineItemValue('item', 'item', i) ==  Shipping_Item_ID || nlapiGetLineItemValue('item', 'item', i) ==  Cash_on_delivery_fee_Item){
			continue;
		}
		locationArray.push(nlapiGetLineItemValue('item', 'location', i));
	}
	//重複内容削除
	locationArray = unique(locationArray);
	itemArray = unique(itemArray);
	
	//明細行の最大倉庫数量５です。
	if(locationArray.length > 5){
		alert("明細行で倉庫数は"+locationArray.length+"件です。入力可能最大倉庫数量は５です。")
		return ;
	}
	
	//再度計算前　手数料存在場合　アラートする
	if ( itemArray.indexOf(Cash_on_delivery_fee_Item) > -1) {
		alert('既存の手数料を削除して再度計算してください。');
		return ;
	}
	
	//総計金額
	var totalAmt = 0;
	//場所ごとで繰り返す
	for (var j = 0; j < locationArray.length; j++) {
		
		amt = getTesuOrHaisou(1,locationArray[j]);
		totalAmt += amt;
		nlapiSelectNewLineItem('item');
		// 代引き手数料
		nlapiSetCurrentLineItemValue('item', 'item',Cash_on_delivery_fee_Item, false);
		//数量１固定
		nlapiSetCurrentLineItemValue('item', 'quantity', '1', false);
		//場所
		// add by song CH327 start 明細場所空白判定
		if(isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))){
			nlapiSetCurrentLineItemValue('item', 'location',locationArray[j], false);
		}
		// add by song CH327 start 明細場所空白判定
		
		nlapiSetCurrentLineItemValue('item', 'rate',amt, false);
		nlapiSetCurrentLineItemValue('item', 'amount',amt, false);
		nlapiSetCurrentLineItemValue('item', 'taxcode',Cash_on_delivery_fee_rate_taxcode, false);
		nlapiSetCurrentLineItemValue('item', 'taxrate1',Cash_on_delivery_fee_rate_taxrate1, false);
		nlapiSetCurrentLineItemValue('item', 'inventorysubsidiary',nlapiGetFieldValue('subsidiary'));
		nlapiSetCurrentLineItemValue('item', 'fulfillable', 'T',false);
		nlapiCommitLineItem('item');

	}
	alert('手数料を計算しました。');
	nlapiSetFieldValue('custbody_djkk_commission', totalAmt)
}

/*
 * 配送料自動計算
 * 
 * 
 */
function commission2() {

	// 注文書の小計を取得
	var subtotal = nlapiGetFieldValue('subtotal');
	//注文書の総計取得する
	var total = nlapiGetFieldValue('total');
	var locationArray = new Array();
	var itemArray = new Array();

	//明細行繰り返す処理
	var count = nlapiGetLineItemCount('item');
	for (var i = 1; i < count + 1; i++) {
		itemArray.push(nlapiGetLineItemValue('item', 'item', i));
		if(nlapiGetLineItemValue('item', 'item', i) ==  Shipping_Item_ID || nlapiGetLineItemValue('item', 'item', i) ==  Cash_on_delivery_fee_Item){
			continue;
		}
		locationArray.push(nlapiGetLineItemValue('item', 'location', i));
	}
			
	//重複内容削除
	locationArray = unique(locationArray);
	itemArray = unique(itemArray);			

	//明細行の最大倉庫数量５です。
	if(locationArray.length > 5){
		alert("明細行で倉庫数は"+locationArray.length+"件です。入力可能最大倉庫数量は５です。")
		return ;
	}
			

	//再度計算前　配送料存在場合　アラートする
	if ( itemArray.indexOf(Shipping_Item_ID) > -1) {
		alert('既存の配送料を削除して再度計算してください。');
		return ;
	}
	
	//総計金額
	var totalAmt = 0;

	//場所ごとで繰り返す
	for (var j = 0; j < locationArray.length; j++) {
		var amt = 0;
		//注文書合計が５００００以上場合無料とする、以外場合計算する
		if (subtotal < 50000) {
			amt = getTesuOrHaisou(2,locationArray[j]);
		}
		totalAmt += amt;
		
		nlapiSelectNewLineItem('item');
		// 配送料
		nlapiSetCurrentLineItemValue('item', 'item',Shipping_Item_ID, false);
		//数量１固定
		nlapiSetCurrentLineItemValue('item', 'quantity', '1',false);
		// add by song CH327 start 明細場所空白判定
		if(isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))){
			nlapiSetCurrentLineItemValue('item', 'location',locationArray[j], false);
		}
		// add by song CH327 end 明細場所空白判定
		nlapiSetCurrentLineItemValue('item', 'rate',amt, false);
		nlapiSetCurrentLineItemValue('item', 'amount',amt, false);
		nlapiSetCurrentLineItemValue('item', 'taxcode',Shipping_Item_taxcode, false);
		nlapiSetCurrentLineItemValue('item', 'taxrate1',Shipping_Item_taxrate1, false);
		nlapiSetCurrentLineItemValue('item','inventorysubsidiary',nlapiGetFieldValue('subsidiary'));
		nlapiSetCurrentLineItemValue('item', 'fulfillable','T', false);
		nlapiCommitLineItem('item');
	}
	alert('配送料を計算しました。');
	nlapiSetFieldValue('custbody_djkk_delivery_charge', totalAmt)
	
}



/**
 * 倉庫ごとで手数料／配送料を計算する
 */
function getTesuOrHaisou(div,location){
	
	var company = nlapiGetFieldValue('custbody_djkk_shipping_company')
	var filiter = new Array();
	filiter.push("custrecord_djkk_fees_delivery_temperatur")
	filiter.push("anyof")
	
	var count = nlapiGetLineItemCount('item');
	var value = 0;
	for (var i = 1; i < count + 1; i++) {
		if(nlapiGetLineItemValue('item', 'location', i) == location){
			filiter.push(nlapiGetLineItemValue('item', 'custcol_djkk_temperature', i))
			value++;
		}
	}
	
	//パラメータ不足場合　０とします。
	if(isEmpty(location) || isEmpty(company) || value == 0){
		return 0;
	}
//	nlapiLogExecution('DEBUG', 'company', company)
//	nlapiLogExecution('DEBUG', 'location', location)
//	nlapiLogExecution('DEBUG', 'filiter', filiter)
	var customrecord_djkk_fees_delivery_mstSearch = nlapiSearchRecord("customrecord_djkk_fees_delivery_mst",null,
			[
			   ["custrecord_djkk_fees_delivery_company","anyof",company], 
			   "AND", 
			   filiter, 
			   "AND", 
			   ["custrecord_djkk_fees_delivery_location","anyof",location]
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_fees_delivery_amt1",null,"SUM"), 
			   new nlobjSearchColumn("custrecord_djkk_fees_delivery_amt2",null,"SUM")
			]
			);
	
	if(isEmpty(customrecord_djkk_fees_delivery_mstSearch)){
		return 0;
	}
	
	//１：手数料　２：配送料
	if(div == '1'){
		return Number(customrecord_djkk_fees_delivery_mstSearch[0].getValue("custrecord_djkk_fees_delivery_amt1",null,"SUM"));
	}else if(div == '2'){
		return Number(customrecord_djkk_fees_delivery_mstSearch[0].getValue("custrecord_djkk_fees_delivery_amt2",null,"SUM"));
	}else{
		return 0;
	}
}

/*
 * 手数料一括削除
 */
function commissionDelect() {
	
	
	//明細行で配送と手数料のアイテムを削除する
	var count = nlapiGetLineItemCount('item');
	for (var i = count; i > 0; i--) {
		var itemId = nlapiGetLineItemValue('item', 'item', i);
		if (itemId == Cash_on_delivery_fee_Item ) {
			nlapiRemoveLineItem('item', i);
		}
	}
	alert('手数料を削除しました。');
	nlapiSetFieldValue('custbody_djkk_commission', '0')
}

/*
 * 配送料一括削除
 */
function commissionDelect2() {
	
	
	//明細行で配送と手数料のアイテムを削除する
	var count = nlapiGetLineItemCount('item');
	for (var i = count; i > 0; i--) {
		var itemId = nlapiGetLineItemValue('item', 'item', i);
		if (itemId == Shipping_Item_ID) {
			nlapiRemoveLineItem('item', i);
		}
	}
	
	alert('配送料を削除しました。');
	nlapiSetFieldValue('custbody_djkk_delivery_charge', '0')
}

/**
 * 配送指示ボタン
 */
function deliveryinstructionst() {

	try {
		var soid=nlapiGetRecordId();
		var saleRecord = nlapiLoadRecord('salesorder',soid);		
		var location = saleRecord.getFieldValue('location');
				if (!isEmpty(location)) {
						// DJ_自動送信取得
					var custrecord_djkk_auto_sendmail = nlapiLookupField('location',
							location, 'custrecord_djkk_auto_sendmail');
						
					if (custrecord_djkk_auto_sendmail == 'T') {				
							var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_sendmail', 'customdeploy_djkk_sl_sendmail');
						       theLink += '&soid=' + soid;
						       theLink += '&userid=' + nlapiGetUser();	
						      
						       var rse = nlapiRequestURL(theLink);
						       var flag = rse.getBody();
						       if (flag == 'T') {
						           alert('正常に送信されました。');		            
						           window.location.href=window.location.href;
						       } else if(flag == 'F'){
						           alert('場所の住所「FAX」および「DJ_送信メール」情報が設定されていません');
						           window.location.href=window.location.href;
						       }else {
						           alert('場所情報取得できませんでした、「'+flag+'」');
						           window.location.href=window.location.href;
						       }
					} else {
						alert('場所のDJ_自動送信チェックしておりませんでした。')
					}
	
				} else {
					alert('倉庫を選択してください。')
				}
	} catch (e) {
		alert(e.message);
	}
}






function creatIca(){
	var id=nlapiGetRecordId();
	var type=nlapiGetRecordType();
	var soRecord=nlapiLoadRecord(type, id);
	var subsidiary=soRecord.getFieldValue('subsidiary');
	var entity=soRecord.getFieldValue('entity');
	var delivery=soRecord.getFieldValue('custbody_djkk_delivery_destination');
	var theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_ic_change','', 'EDIT');

	// パラメータの追加
	theLink += '&subsidiary=' + subsidiary;
	theLink += '&entity=' + entity;
	theLink += '&delivery=' + delivery;	
	theLink += '&soid=' + id;
	window.ischanged = false;
	location.href = theLink;
}

function creatfix(){
	var theLink = '';
	var id=nlapiGetRecordId();	
	var fixId=nlapiLookupField('salesorder', id, 'custbody_djkk_estimate_re');
	if(isEmpty(fixId)){
		theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_repair','', 'EDIT');
		// パラメータの追加
		theLink += '&soid=' + id;
	}else{
		theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_repair',fixId, 'VIEW');
	}		
	window.ischanged = false;
	location.href = theLink;
}

/*
 * 請求書/納品書/受領書PDF出力
 * */
function repairPDF(pdfType){
	
	var id=nlapiGetRecordId();
	var type=nlapiGetRecordType();
	var soRecord=nlapiLoadRecord(type, id);
	var estimate = soRecord.getFieldValue('custbody_djkk_estimate_re');
	
	//修理品場合　ステータスを変更する
	//修理品ステータス：　納品書出力済み
	var repaire = estimate;

	if(!isEmpty(repaire) && pdfType == 'delivery'){
		if(nlapiLookupField('customrecord_djkk_repair', repaire, 'custrecord_djkk_re_status') < 8){
			nlapiSubmitField('customrecord_djkk_repair', repaire, 'custrecord_djkk_re_status','8')
		}
	}
	//請求書出力済み
	if(!isEmpty(repaire) && pdfType == 'invoice'){
		if(nlapiLookupField('customrecord_djkk_repair', repaire, 'custrecord_djkk_re_status') < 9){
			nlapiSubmitField('customrecord_djkk_repair', repaire, 'custrecord_djkk_re_status','9')
		}
	}
	
	

	
	if(estimate){
		var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_so_repair','customdeploy_djkk_sl_so_repair');
		theLink+='&so='+nlapiGetRecordId() + '&pdfType=' + pdfType;
		window.open(theLink);	
	}else{
		alert('修理対象外、PDF出力できません。');		
	}
		 
}

//add U415 by sys start
function pdfSum(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_invoice_pdftwo','customdeploy_djkk_sl_invoice_pdftwo');
	theLink+='&salesorderid='+nlapiGetRecordId();
	window.open(theLink);
}	
//add U415 by sys end	
/*
 * 受領書印刷
 * */
//20221027 changed by zhou 
//U779 需要の変更  code無効化
//function receiptPDF(pdfType){
//	var id=nlapiGetRecordId();
//	var type=nlapiGetRecordType();
//	var soRecord=nlapiLoadRecord(type, id);
//
//	var count = soRecord.getLineItemCount('item')
//	var zeroflg = true;
//
//	for(var i = 0 ; i < count ; i++){
//		if(soRecord.getLineItemValue('item', 'custcol_djkk_receipt_printing',i+1) == 'T'){
//			zeroflg = false;
//		}
//	}
//	if(zeroflg){
//		alert('明細行に受領書を生成できる商品はありません。受領書印刷フラグが選択されていることを確認してから実行してください。')
//		return false;
//	}else{
//		var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_receiptpdf_test','customdeploy_djkk_sl_receiptpdf_test');
//		theLink += '&soid='+id;
//		window.open(theLink);
//	}
//		
//}
function customerSendmails(deliverySendMailFlag,custRecord){
	var soCustomform = nlapiGetFieldValue('customform');
	if(soCustomform == '121'){	
		if(!isEmpty(custRecord) && deliverySendMailFlag == false){
//			var loadingCustomer = custRecord;
			var shippinginfosendtype = custRecord.getFieldValue('custentity_djkk_shippinginfosendtyp')//DJ_納期回答送信方法|DJ_出荷案内送信区分
			var shippinginfodesttype = custRecord.getFieldValue('custentity_djkk_shippinginfodesttyp')//DJ_納期回答送信先|DJ_出荷案内送信先区分
			var deliverydestrep = custRecord.getFieldValue('custentity_djkk_customerrep')//DJ_納期回答送信先担当者|DJ_出荷案内送信先担当者
			var shippinginfodestname = custRecord.getFieldValue('custentity_djkk_shippinginfodestname')//DJ_納期回答送信先会社名(3RDパーティー)|DJ_出荷案内送信先会社名(3RDパーティー)
			var shippinginfodestrep = custRecord.getFieldValue('custentity_djkk_shippinginfodestrep')//DJ_納期回答送信先担当者(3RDパーティー)|DJ_出荷案内送信先担当者(3RDパーティー)
			var shippinginfodestemail = custRecord.getFieldValue('custentity_djkk_shippinginfodestemail')//DJ_納期回答送信先メール(3RDパーティー)|DJ_出荷案内送信先メール(3RDパーティー)
			var shippinginfodestfax = custRecord.getFieldValue('custentity_djkk_shippinginfodestfax')//DJ_納期回答送信先FAX(3RDパーティー)|DJ_出荷案内送信先FAX(3RDパーティー)
			var shippinginfodestmemo = custRecord.getFieldValue('custentity_djkk_shippinginfodestmemo')//DJ_納期回答自動送信送付先備考|DJ_出荷案内送信先登録メモ
			if(!isEmpty(shippinginfosendtype)){
				nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', shippinginfosendtype,false,true);
				nlapiSetFieldValue('custbody_djkk_shippinginfodesttyp', shippinginfodesttype,false);
				nlapiSetFieldValue('custbody_djkk_customerrep_new', deliverydestrep,false);
				nlapiSetFieldValue('custbody_djkk_shippinginfodestname', shippinginfodestname,false);
				nlapiSetFieldValue('custbody_djkk_shippinginfodestrep_new', shippinginfodestrep,false);
				nlapiSetFieldValue('custbody_djkk_shippinginfodestemail', shippinginfodestemail,false);
				nlapiSetFieldValue('custbody_djkk_shippinginfodestfax', shippinginfodestfax,false);
				nlapiSetFieldValue('custbody_djkk_reference_delive', shippinginfodestmemo,false);	
			}
		}	
	}

//	if(soCustomform == '121'){
	if(!isEmpty(custRecord) &&  deliverySendMailFlag == true){
			var deliveryPeriod = custRecord.getFieldValue('custentity_djkk_delivery_book_period'); //DJ_納品書送信方法
			if(soCustomform == '121'){ //LS
				var deliverySite = custRecord.getFieldValue('custentity_djkk_delivery_book_site'); //DJ_納品書送信先
			}else if(soCustomform == '175'){ //食品
				var deliverySiteFd = custRecord.getFieldValue('custentity_djkk_delivery_book_site_fd'); //DJ_納品書送信先(食品用)
			}
			
			var deliveryPerson = custRecord.getFieldValue('custentity_djkk_delivery_book_person'); //DJ_納品書送信先担当者
			var deliverySubName = custRecord.getFieldValue('custentity_djkk_delivery_book_subname'); //DJ_納品書送信先会社名(3RDパーティー)
			var deliveryPersont = custRecord.getFieldValue('custentity_djkk_delivery_book_person_t'); //DJ_納品書送信先担当者(3RDパーティー)
			var deliveryEmail = custRecord.getFieldValue('custentity_djkk_delivery_book_email'); //DJ_納品書送信先メール(3RDパーティー)
			var deliveryFax = custRecord.getFieldValue('custentity_djkk_delivery_book_fax_three'); //DJ_納品書送信先FAX(3RDパーティー)
			var deliveryMemo = custRecord.getFieldValue('custentity_djkk_delivery_book_memo'); //DJ_納品書自動送信備考
			if(!isEmpty(deliveryPeriod)&& (deliveryPeriod!= '10')){
				nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_納品書送信方法
				if(soCustomform == '121'){
					nlapiSetFieldValue('custbody_djkk_delivery_book_site', deliverySite,false);//DJ_納品書送信先
				}else if(soCustomform == '175'){
					nlapiSetFieldValue('custbody_djkk_delivery_book_site_fd', deliverySiteFd,false);//DJ_納品書送信先
				}
				nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);//DJ_納品書送信先担当者
				nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);//DJ_納品書送信先会社名(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_納品書送信先担当者(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);//DJ_納品書送信先メール(3RDパーティー)
				nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_納品書送信先FAX(3RDパーティー)
				if(soCustomform == '121'){
					nlapiSetFieldValue('custbody_djkk_reference_column', deliveryMemo);//DJ_納品書自動送信備考  custbody_djkk_reference_column
				}else if(soCustomform == '175'){
					nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo);//DJ_納品書自動送信備考  custbody_djkk_reference_column
				}
				
			}
		}
//	}
}
function shippinginfoSendMailChangeFormDelivery(deliveryRecord){
	var shippinginfosendtype = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfosendtyp')//DJ_納期回答送信方法|DJ_出荷案内送信区分
	var deliverydestrep = deliveryRecord.getFieldValue('custrecord_djkk_deliverydestrep')//DJ_納期回答送信先担当者|DJ_出荷案内送信先担当者
	var shippinginfodestname = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfodestname')//DJ_納期回答送信先会社名(3RDパーティー)|DJ_出荷案内送信先会社名(3RDパーティー)
	var shippinginfodestrep = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfodestrep')//DJ_納期回答送信先担当者(3RDパーティー)|DJ_出荷案内送信先担当者(3RDパーティー)
	var shippinginfodestemail = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfodestemail')//DJ_納期回答送信先メール(3RDパーティー)|DJ_出荷案内送信先メール(3RDパーティー)
	var shippinginfodestfax = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfodestfax')//DJ_納期回答送信先FAX(3RDパーティー)|DJ_出荷案内送信先FAX(3RDパーティー)
	var shippinginfodestmemo = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfodestmemo')//DJ_納期回答自動送信送付先備考|DJ_出荷案内送信先登録メモ
	if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype != '101'){
		nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', shippinginfosendtype,false);
		nlapiSetFieldValue('custbody_djkk_customerrep_new', deliverydestrep,false);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestname', shippinginfodestname,false);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestrep_new', shippinginfodestrep,false);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestemail', shippinginfodestemail,false);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestfax', shippinginfodestfax,false);
		nlapiSetFieldValue('custbody_djkk_reference_delive', shippinginfodestmemo,false);
	}
}
function shippinginfoSendMailChangeFormCustomer(custRecord){
	var shippinginfosendtype = custRecord.getFieldValue('custentity_djkk_shippinginfosendtyp')//DJ_納期回答送信方法|DJ_出荷案内送信区分
	var deliverydestrep = custRecord.getFieldValue('custentity_djkk_customerrep')//DJ_納期回答送信先担当者|DJ_出荷案内送信先担当者
	var shippinginfodestname = custRecord.getFieldValue('custentity_djkk_shippinginfodestname')//DJ_納期回答送信先会社名(3RDパーティー)|DJ_出荷案内送信先会社名(3RDパーティー)
	var shippinginfodestrep = custRecord.getFieldValue('custentity_djkk_shippinginfodestrep')//DJ_納期回答送信先担当者(3RDパーティー)|DJ_出荷案内送信先担当者(3RDパーティー)
	var shippinginfodestemail = custRecord.getFieldValue('custentity_djkk_shippinginfodestemail')//DJ_納期回答送信先メール(3RDパーティー)|DJ_出荷案内送信先メール(3RDパーティー)
	var shippinginfodestfax = custRecord.getFieldValue('custentity_djkk_shippinginfodestfax')//DJ_納期回答送信先FAX(3RDパーティー)|DJ_出荷案内送信先FAX(3RDパーティー)
	var shippinginfodestmemo = custRecord.getFieldValue('custentity_djkk_shippinginfodestmemo')//DJ_納期回答自動送信送付先備考|DJ_出荷案内送信先登録メモ
	if(!isEmpty(shippinginfosendtype) && shippinginfosendtype != '36'){
		nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', shippinginfosendtype,false);
		nlapiSetFieldValue('custbody_djkk_customerrep_new', deliverydestrep,false);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestname', shippinginfodestname,false);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestrep_new', shippinginfodestrep,false);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestemail', shippinginfodestemail,false);
		nlapiSetFieldValue('custbody_djkk_shippinginfodestfax', shippinginfodestfax,false);
		nlapiSetFieldValue('custbody_djkk_reference_delive', shippinginfodestmemo,false);	
	}
}
function deliverySendMailChangeFormDelivery(deliveryRecord){
	var deliveryPeriod = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_period');//DJ_納品書送信方法
	var deliveryPerson = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person');//DJ_納品書送信先担当者
	var deliverySubName = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_subname');//DJ_納品書送信先会社名(3RDパーティー)
	var deliveryPersont = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person_t');//DJ_納品書送信先担当者(3RDパーティー)
	var deliveryEmail = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_email');//DJ_納品書送信先メール(3RDパーティー)
	var deliveryFax = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_fax_three');//DJ_納品書送信先FAX(3RDパーティー)
	var deliveryMemo = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_memo');//DJ_納品書自動送信送付先備考
	if(!isEmpty(deliveryPeriod)&& deliveryPeriod != '10'){
		nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo,false);	
	}
}
function deliverySendMailChangeFormCustomer(loadingCustomer){
	var deliveryPeriod = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_period')//納品書送信方法
	var deliveryPerson = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_person')//納品書送信先担当者
	var deliverySubName = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_subname')//納品書送信先会社名(3RDパーティー)
	var deliveryPersont = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_person_t')//納品書送信先担当者(3RDパーティー)
	var deliveryEmail = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_email')//納品書送信先メール(3RDパーティー)
	var deliveryFax = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_fax_three')//納品書送信先FAX(3RDパーティー)
	var deliveryMemo = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_memo')//納品書自動送信備考
	if(!isEmpty(deliveryPeriod)&& deliveryPeriod != '10'){
		nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);
		nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo,false);	
	}
}
function defaultEmpty(src){
	return src || '';
}
function invoiceTranPdf(){
    var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_prepayment_inv_pdf','customdeploy_djkk_sl_prepayment_inv_pdf');
    theLink+='&salesorderid='+nlapiGetRecordId();
    window.open(theLink);
}