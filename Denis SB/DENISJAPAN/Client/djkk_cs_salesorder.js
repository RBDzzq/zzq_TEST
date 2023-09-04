/**
 * ��������ʂ�client
 * 
 * Version    Date            Author           Remarks
 * 1.00      2021/01/28        YUAN             �V�K�쐬 
 * 1.01      2021/02/18        YUAN             DENISJAPAN-162 
 * 1.02      2021/03/01        YUAN             DENISJAPAN-173 
 * 1.03      2021/03/09        YUAN             DENISJAPAN-184
 *
 */

// ������萔������ID
var Cash_on_delivery_fee_Item = '106';

// ������萔���ŋ��R�[�h
var Cash_on_delivery_fee_rate_taxcode = '9';

// ������萔���ŗ�
var Cash_on_delivery_fee_rate_taxrate1 = '0';

// ��������ID
var Shipping_Item_ID = '107';

// �����ŋ��R�[�h
var Shipping_Item_taxcode = '9';

// �����ŗ�
var Shipping_Item_taxrate1 = '0';

// ���O�C�����[�U
var user = '';

/**
 * ��ʂ̏�����
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

		// ���t
		nlapiSetFieldValue('trandate', nlapiDateToString(getSystemTime()));

		// �o�ד�
		nlapiSetFieldValue('shipdate', nlapiDateToString(getSystemTime()));

		// DJ_�[�i��
		nlapiSetFieldValue('custbody_djkk_delivery_date',
				nlapiDateToString(getTheNextDay()));
		
		// DJ_�[�i��]�� add by zhou CH093
		if(customform == '175'){
			nlapiSetFieldValue('custbody_djkk_delivery_hopedate',nlapiDateToString(getTheNextDay()));
		}
		
		//������
		nlapiSetFieldValue('custbody_djkk_annotation_day', nlapiDateToString(getSystemTime()));
	}
	// add END

	// ���O�C�����[�U���擾
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
		
	// DJ_�[�i��/�ڋq
	if(name == 'custbody_djkk_delivery_destination'||name == 'entity'){
		
		//20221103 add by zhou U766 U085 sendmailFlag
		var destinationID = nlapiGetFieldValue('custbody_djkk_delivery_destination');
		var entityId = nlapiGetFieldValue('entity');
		var cust=nlapiGetFieldValue('customform'); 
		// add by YUAN 2020/03/01 DENISJAPAN-173?@
		// DJ_�[�i��
		
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
				
				// LS|���F
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
					alert('���[�h�ڋq�Ɛ��݌ڋq�͑I���ł��܂���B');
					nlapiSetFieldValue('entity', '',true,true);
				}else{
					
				// add END
				var g1=customerR.custentity_djkk_product_category_scetikk;
				var g2=customerR.custentity_djkk_product_category_jp;
				nlapiSetFieldValue('custbody_djkk_customer_group', isEmpty(g1)?g2:g1, false,true);
				
				
					
			// LS|���F
			if(cust == '121'||cust == '133'){
				nlapiSetFieldValue('custbody_djkk_sodeliverermem', customerR.custentity_djkk_sodeliverermemo,false,false); //20230214 add by zhou U046 DJ_�����ɋL�ڔ��l��
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
			var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destinationID); // DJ_�[�i��record
		}
		if(!isEmpty(nlapiGetFieldValue('entity'))){
			var custRecord = nlapiLoadRecord('customer',nlapiGetFieldValue('entity'));
		}
		var deliverySendMailFlag = false;
		if(!isEmpty(destinationID)){
				var deliveryPeriod = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_period');//DJ_�[�i�����M���@
				if(cust == '121'){ //LS
					var deliverySite = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_site');//DJ_�[�i�����M��
				}else if(cust == '175'){ //�H�i
					var deliverySiteFd = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_site_fd');//DJ_�[�i�����M��
				}
				
				var deliveryPerson = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person');//DJ_�[�i�����M��S����
				var deliverySubName = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_subname');//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
				var deliveryPersont = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person_t');//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
				var deliveryEmail = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_email');//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
				var deliveryFax = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_fax_three');//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
				var deliveryMemo = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_memo');//DJ_�[�i���������M���t����l
//				if(!isEmpty(deliveryPeriod)&& (deliveryPeriod !='10')&& (deliveryPeriod != '9')){
				    if(!isEmpty(deliveryPeriod)&& (deliveryPeriod != '9')){
					nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_�[�i�����M���@
					if(cust == '121'){
						
						nlapiSetFieldValue('custbody_djkk_delivery_book_site', deliverySite,false);//DJ_�[�i�����M��
					}else if(cust == '175'){
						nlapiSetFieldValue('custbody_djkk_delivery_book_site_fd', deliverySiteFd,false);//DJ_�[�i�����M��
					}
					nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);//DJ_�[�i�����M��S����
					nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
					nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
					if(cust == '121'){
						nlapiSetFieldValue('custbody_djkk_reference_column', deliveryMemo);//DJ_�[�i���������M���l  custbody_djkk_reference_column
					}else if(cust == '175'){
						nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo);//DJ_�[�i���������M���l  custbody_djkk_reference_column
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
				var shippinginfosendtype = loadingRecord.getFieldValue('custrecord_djkk_shippinginfosendtyp')//DJ_�[���񓚑��M���@|DJ_�o�׈ē����M�敪
				var shippinginfodesttype = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodesttyp')//DJ_�[���񓚑��M��|DJ_�o�׈ē����M��敪
				var deliverydestrep = loadingRecord.getFieldValue('custrecord_djkk_deliverydestrep')//DJ_�[���񓚑��M��S����|DJ_�o�׈ē����M��S����
				var shippinginfodestname = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestname')//DJ_�[���񓚑��M���Ж�(3RD�p�[�e�B�[)|DJ_�o�׈ē����M���Ж�(3RD�p�[�e�B�[)
				var shippinginfodestrep = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestrep')//DJ_�[���񓚑��M��S����(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��S����(3RD�p�[�e�B�[)
				var shippinginfodestemail = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestemail')//DJ_�[���񓚑��M�惁�[��(3RD�p�[�e�B�[)|DJ_�o�׈ē����M�惁�[��(3RD�p�[�e�B�[)
				var shippinginfodestfax = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestfax')//DJ_�[���񓚑��M��FAX(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��FAX(3RD�p�[�e�B�[)
				var shippinginfodestmemo = loadingRecord.getFieldValue('custrecord_djkk_shippinginfodestmemo')//DJ_�[���񓚎������M���t����l|DJ_�o�׈ē����M��o�^����
				if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype != '101'){
					//�ڋq�D��ȊO�̏ꍇ	
					nlapiSetFieldValue('custbody_djkk_shippinginfosendtyp', shippinginfosendtype,false);
					nlapiSetFieldValue('custbody_djkk_shippinginfodesttyp', shippinginfodesttype,false);
					nlapiSetFieldValue('custbody_djkk_customerrep_new', deliverydestrep,false);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestname', shippinginfodestname,false);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestrep_new', shippinginfodestrep,false);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestemail', shippinginfodestemail,false);
					nlapiSetFieldValue('custbody_djkk_shippinginfodestfax', shippinginfodestfax,false);
					nlapiSetFieldValue('custbody_djkk_reference_delive', shippinginfodestmemo,false);	
				}else if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype == '101'){
					//�ڋq�D��̏ꍇ
					deliverySendMailFlag = false;
					customerSendmails(deliverySendMailFlag,custRecord);
				}
	//			else if(!isEmpty(shippinginfosendtype)&& shippinginfosendtype == '36'){
	//				//���M�s�̏ꍇ
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
			var invoicePeriod = custRecord.custentity_djkk_invoice_book_period;//DJ_���������M�敪
			var invoiceSite = custRecord.custentity_djkk_invoice_book_site;//DJ_���������M��敪
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
			// add by song CH327 start ���׏ꏊ�󔒔���
			if(!isEmpty(nlapiGetFieldValue('location'))&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item')) && isEmpty(nlapiGetCurrentLineItemValue('item','location'))){
				 nlapiSetCurrentLineItemValue('item', 'location',nlapiGetFieldValue('location'), false);
			}
			// add by song CH327 start ���׏ꏊ�󔒔���
			// add by YUAN 2020/03/09 DENISJAPAN-184
//			 if (!isEmpty(nlapiGetFieldValue('location'))&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
//			 nlapiSetCurrentLineItemValue('item', 'location',nlapiGetFieldValue('location'));
//			 }
			 
//			 if (isEmpty(nlapiGetFieldValue('location'))
//			 && !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
//			 nlapiSetCurrentLineItemValue('item', 'item', null, false);
//			 alert('�A�C�e����I������O�ɁA�ꏊ����͂���K�v������܂�');
//			 }
			
			//�^�����
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
					delvShippingCompany = destinationRecord.custrecord_djkk_shipping_companys;//�[�i��.DJ_�^�����
					delvShippingSpInstruction = destinationRecord.custrecord_djkk_shipping_sp_instruction;//�[�i��.DJ_�z���̓��L����
				}

				var customerR = nlapiLookupField('customer', entityId,['custentity_djkk_shipping_company','custentity_djkk_shipping_sp_instruction']);
				var entityShippingCompany =customerR.custentity_djkk_shipping_company;//�ڋq.DJ_�^�����
				var entityShippingSpInstruction =customerR.custentity_djkk_shipping_sp_instruction;//�ڋq.DJ_�z���̓��L����
				
				
				
				var itemR = nlapiLookupField('item', itemId,['custitem_djkk_shipping_company','custitem_djkk_product_category_sml']);
				var itemShippingCompany = itemR.custitem_djkk_shipping_company;//�A�C�e��.DJ_�^�����
				var itemProductCategorySml = itemR.custitem_djkk_product_category_sml;//�A�C�e��.DJ_�z�����x
//				alert('itemShippingCompany='+itemShippingCompany)
//				alert('delvShippingSpInstruction='+delvShippingSpInstruction)
				if(!isEmpty(itemShippingCompany)){	
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_shipping_company',itemShippingCompany, false);
	//				currentLine.�^����� = item.�^�����
				}else if(!isEmpty(delvShippingCompany)){	
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_shipping_company',delvShippingCompany, false);
	//				currentLine.�^����� = Delv.�^�����
				}else if(!isEmpty(entityShippingCompany)){	
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_shipping_company',entityShippingCompany, false);
	//				currentLine.�^����� = Entity.�^�����
					}
	
				//�z���̓��L����
				if(!isEmpty(delvShippingSpInstruction)){	
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_shipping_sp_instruction',delvShippingSpInstruction, false);
	//				currentLine.�z���̓��L���� = Delv.�z���̓��L����
				}else if(!isEmpty(entityShippingSpInstruction)){	
	//				currentLine.�z���̓��L���� = Entity.�z���̓��L����
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_shipping_sp_instruction',entityShippingSpInstruction, false);
					}
				
				//�z�����x	
				if(!isEmpty(itemProductCategorySml)){	
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_temperature',itemProductCategorySml, false);
	//				currentLine.�z�����x = item.�z�����x
				}
			}

			}
			
		}
		
		// by LIU 2022/01/12
		if (name == 'units' || name == 'quantity') {
			
			var itemId = nlapiGetCurrentLineItemValue('item', 'item');

			// ����
			var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');
			// CH677 zzq 20230629 start
			// DJ_����
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
				
				// DJ_���萔(�����)
				var itemPerunitQuantity = nlapiLookupField('item', itemId, 'custitem_djkk_perunitquantity');
	          
				if(!isEmpty(itemPerunitQuantity)){
					// DJ_��{����
					var conversionRate = quantity * perunitQuantity;
					
					// DJ_�P�[�X��
					var floor = Math.floor(conversionRate / itemPerunitQuantity);
					var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
					
					// DJ_�o����
					var djQuantity = (conversionRate - caseQuantity * itemPerunitQuantity).toFixed(2);
					
					// DJ_��{����
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_conversionrate',conversionRate);
					
					// DJ_�P�[�X��
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_casequantity',caseQuantity);
					
					// DJ_�o����
					nlapiSetCurrentLineItemValue('item', 'custcol_djkk_quantity',djQuantity);
					
					// DJ_����
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
			// add by song CH327 start ���׏ꏊ�󔒔���
			if (nlapiGetCurrentLineItemValue('item', 'location') != nlapiGetCurrentLineItemValue(
					'item', 'inventorylocation')&& isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))){
				nlapiSetCurrentLineItemValue('item', 'location',
						nlapiGetCurrentLineItemValue('item', 'inventorylocation'),false);
			}
			// add by song CH327 end ���׏ꏊ�󔒔���
		}
		// add end
		
	}
	if(name == 'custbody_djkk_location'){
		var customform = nlapiGetFieldValue('customform');
		// �H�i
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
		// add by song CH327 start ���׏ꏊ�󔒔���
		 if (!isEmpty(nlapiGetCurrentLineItemValue('item', 'item')) && isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))) {
		 nlapiSetCurrentLineItemValue('item', 'location', locationId,
		 true);
		 nlapiCommitLineItem('item');
		 }
		// add by song CH327 end ���׏ꏊ�󔒔���
		 }
		// // add end
	}
	

	//2022/03/28 change by ycx �ڋq DJ_�x������ �x�������i���ߓ�����) start
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
		var destination = nlapiGetFieldValue('custbody_djkk_delivery_destination') // �[�i��
		var custForm = nlapiGetFieldValue('customform');
		var entity = nlapiGetFieldValue('entity') // �ڋq
		if(custForm = '121'){  //LS
			if(!isEmpty(destination)){
				var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destination); // DJ_�[�i��record
			}
			if(!isEmpty(entity)){
				var custRecord = nlapiLoadRecord('customer',entity);
			}
			var shippinginfodesttyp = nlapiGetFieldValue('custbody_djkk_shippinginfodesttyp');   //DJ_�[���񓚑��M��
			if(shippinginfodesttyp == '39'){   //�[���񓚑��M�� =�[�i��
				if(isEmpty(destination)){
					alert("DJ_�[�i������I�т�������")
					return false;
				}else{
					shippinginfoSendMailChangeFormDelivery(deliveryRecord)
				}
			}else if(shippinginfodesttyp == '40'){//�[���񓚑��M�� =�ڋq��
				if(isEmpty(entity)){
					alert("�ڋq�����I�т�������")
					return false;
				}else{
					shippinginfoSendMailChangeFormCustomer(custRecord)
				}
			}else if(shippinginfodesttyp == '38'){ //�[���񓚑��M�� =3rd
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
		var destination = nlapiGetFieldValue('custbody_djkk_delivery_destination') // �[�i��
		var custForm = nlapiGetFieldValue('customform');
		var entity = nlapiGetFieldValue('entity') // �ڋq
		var thirdFlag = false;
		if(custForm = '121'){  //LS
			if(!isEmpty(destination)){
				var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destination); // DJ_�[�i��record
			}
			if(!isEmpty(entity)){
				var custRecord = nlapiLoadRecord('customer',entity);
			}
			var deliverySite = nlapiGetFieldValue('custbody_djkk_delivery_book_site');   //DJ_�[�i�����M��
			if(deliverySite == '15'){   //DJ_�[�i�����M�� =�[�i��
				if(isEmpty(destination)){
					alert("DJ_�[�i������I�т�������")
					return false;
				}else{
					deliverySendMailChangeFormDelivery(deliveryRecord)
				}
			}else if(deliverySite == '16'){//DJ_�[�i�����M�� =�ڋq��
				if(isEmpty(entity)){
					alert("�ڋq�����I�т�������")
					return false;
				}else{
					deliverySendMailChangeFormCustomer(custRecord)
				}
			}else if(deliverySite == '14'){ //DJ_�[�i�����M�� =3rd
				if(!isEmpty(destination) || !isEmpty(entity)){
					thirdFlag = true;
					if(!isEmpty(destination)){
						deliverySendMailChangeFormDelivery(deliveryRecord)
					}else{
						deliverySendMailChangeFormCustomer(custRecord)
					}
				}
			}else if (deliverySite == '24'){ //DJ_�[�i�����M�� =�q��
				nlapiSetFieldValue('custbody_djkk_delivery_book_period', ''); //�[�i�����M���@
				nlapiSetFieldValue('custbody_djkk_delivery_book_person', ''); //�[�i�����M��S����
				nlapiSetFieldValue('custbody_djkk_delivery_book_subname', ''); //�[�i�����M���Ж�(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', ''); //�[�i�����M��S����(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_delivery_book_email', ''); //�[�i�����M�惁�[��(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', ''); //�[�i�����M��FAX(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_reference_column', ''); //�[�i���������M���t����l
			}
		}
	}
	if( name == 'custbody_djkk_delivery_book_site_fd'){
		var destination = nlapiGetFieldValue('custbody_djkk_delivery_destination') // �[�i��
		var entity = nlapiGetFieldValue('entity') // �ڋq
		var custForm = nlapiGetFieldValue('customform');
		if(custForm = '175'){  //fd
			if(!isEmpty(destination)){
				var deliveryRecord = nlapiLoadRecord('customrecord_djkk_delivery_destination',destination); // DJ_�[�i��record
			}
			if(!isEmpty(entity)){
				var custRecord = nlapiLoadRecord('customer',entity);
			}
			var deliverySite = nlapiGetFieldValue('custbody_djkk_delivery_book_site_fd');   //DJ_�[�i�����M��
			if(deliverySite == '15'){   //DJ_�[�i�����M�� =�[�i��
				if(isEmpty(destination)){
					alert("DJ_�[�i������I�т�������")
					return false;
				}else{
					deliverySendMailChangeFormDelivery(deliveryRecord)
				}
			}else if(deliverySite == '16'){//DJ_�[�i�����M�� =�ڋq��
				if(isEmpty(entity)){
					alert("�ڋq�����I�т�������")
					return false;
				}else{
					deliverySendMailChangeFormCustomer(custRecord)
					}
			}else if(deliverySite == '14'){ //DJ_�[�i�����M�� =3rd
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

//	// DJ_�[���񓚎������M
//	var delivery_replyauto_flg = nlapiGetFieldValue('custbody_djkk_delivery_replyauto');
//	var delivery_replyauto_mail = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_mail');
//	var delivery_replyauto_fax = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_fax');
//
//	// DJ_�������������M
//	var invoice_automa_flg = nlapiGetFieldValue('custbody_djkk_invoice_automa');
//	var invoice_automa_mail = nlapiGetFieldValue('custbody_djkk_invoice_automatic_mail');
//	var invoice_automa_fax = nlapiGetFieldValue('custbody_djkk_invoice_automatic_fax');
//
//	if (delivery_replyauto_flg == 'T' && isEmpty(delivery_replyauto_mail) && isEmpty(delivery_replyauto_fax)) {
//		alert('�uDJ_�[���񓚎������M�v���`�F�b�N�����ꍇ�A�uDJ_�[���񓚎������M���t�惁�[���v�ƁuDJ_�[���񓚎������M���t��FAX�v�������ꂩ���������L������B');
//		return false;
//	}
//
//	if (invoice_automa_flg == 'T' && isEmpty(invoice_automa_mail) && isEmpty(invoice_automa_fax)) {
//		alert('�uDJ_�������������M�v���`�F�b�N�����ꍇ�A�uDJ_�������������M���t�惁�[���v�ƁuDJ_�������������M���t��FAX�v�������ꂩ���������L������B');
//		return false;
//	}

	//�^�M���x�z���f
	var total = nlapiGetFieldValue('total');
	var exchangerate = nlapiGetFieldValue('exchangerate')
	total = Number(total) * Number(exchangerate);
	var custId = nlapiGetFieldValue('entity');
	
	if(isEmpty(custId)){
		alert('�ڋq����͂��Ă��������B')
		return false;
	}
	
	var custRec = nlapiLoadRecord('customer', custId);
	var custName = custRec.getFieldValue('entityid');
	var custCreateLimit = custRec.getFieldValue('custentity_djkk_credit_limit');
	var custBalance = custRec.getFieldValue('balance');
	var unbilledorders = custRec.getFieldValue('unbilledorders');
	
	
	var msg = custName+'\r'+'�^�M���x�z:'+thousandsWithComa(Number(custCreateLimit)) +'\r'+'���|���c��:'+thousandsWithComa(Number(custBalance))+'\r'+'���������z:'+thousandsWithComa(Number(unbilledorders))+'\r'+'���������z:'+thousandsWithComa(Number(total));
	if(custCreateLimit != 0 && !isEmpty(custCreateLimit)){
		if(Number(custCreateLimit) - Number(custBalance) -Number(total) -Number(unbilledorders)  < 0){
			msg+='\r�^�M���x�z�������Ă��܂��B'
			alert(msg)
		}
	}

	//�[�i��ݒ蔻�f
	var priceFlg = nlapiGetFieldValue('custbody_djkk_pl_use_flag');
	var nohinsaki = nlapiGetFieldValue('custbody_djkk_delivery_destination');
	if(priceFlg == '2' || priceFlg == '3'){
		if(isEmpty(nohinsaki)){
			alert('DJ_�[�i�����͂��Ă��������B')
			return false;
		}
	}
	
	//�C���i�ꍇ�@�X�e�[�^�X��ύX����
	//�C���i�X�e�[�^�X�F�@�X�e�[�^�X�����ɁA����́A���i�ς݁A���Ϗ������M�ς݌��Ϗ����񓚍ς݃`�F�b�N���ASO�쐬�ꍇ�@�C�������֐ݒ�
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
		//20230224 add by zhou CH327 start �݌ɏꏊ�󔒔���
		if(isEmpty(nlapiGetCurrentLineItemValue('item', 'inventorylocation'))){
		nlapiSetCurrentLineItemValue('item', 'inventorylocation',
				nlapiGetFieldValue('location'),false);
		}
		//end
		// add by song CH327 start ���׏ꏊ�󔒔���
		if(isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))){
			nlapiSetCurrentLineItemValue('item', 'location',
					nlapiGetFieldValue('location'),false);
		}
		// add by song CH327 end ���׏ꏊ�󔒔���
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
	// DJ_���׏ꏊID�z��
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

	// ��ʂ�DJ_���׏ꏊ��DJ_���׋��z���N���A
	for (var lt = 0; lt < LTArray.length; lt++) {

		// todo ���O�C�����[�U�����̏ꍇ�A�C����f�[�^�����s
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

	// �A�C�e���̌���
	var itemCount = nlapiGetLineItemCount('item');
	// �ꏊ�z��
	var locations = new Array();

	// �A�C�e�����ׂ����[�v
	for (var i = 1; i < itemCount + 1; i++) {

		// todo ���O�C�����[�U�����̏ꍇ�̂ݎ��s
		if (user == '416') {
			// �A�C�e�����h�����h�������́h������萔���h�̏ꍇ�A���̃A�C�e���ɐi��
			if (nlapiGetLineItemValue('item', 'item', i) == Shipping_Item_ID
					|| nlapiGetLineItemValue('item', 'item', i) == Cash_on_delivery_fee_Item) {
				continue;
			}
		}

		// �A�C�e���̏ꏊ�����݂���ꍇ
		if (!isEmpty(nlapiGetLineItemValue('item', 'location', i))) {
			// �A�C�e���̏ꏊ�͏ꏊ�z��ɂ܂����݂��Ȃ��ꍇ
			if (locations.indexOf(nlapiGetLineItemValue('item', 'location', i)) < 0) {
				// �A�C�e���̏ꏊ���ꏊ�z��Ɋi�[
				locations.push(nlapiGetLineItemValue('item', 'location', i));
				// DJ_���׏ꏊN����̏ꍇ�A�A�C�e���̏ꏊ�Ƒ��z��ݒ肵�A���[�v�𒆎~
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
				// �A�C�e���̏ꏊ�͏ꏊ�z��ɑ��݂���ꍇ
			} else {
				// ����ꏊ�̑��z�����Z���āADJ_���׏ꏊN�ɐݒ�
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
		// todo ���O�C�����[�U�����̏ꍇ�A�C����f�[�^�����s
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
 * �萔�������v�Z
 * 
 * 
 */
function commission() {
	// DJ_�x���������擾
	var payment = nlapiGetFieldValue('custbody_djkk_payment_conditions');
	// �x��������������̏ꍇ�A������萔�����v�Z����
	if (payment != '1') {
		alert("�x�������͑�����̂ݏꍇ�v�Z�ł��܂��B")
		return;
	}
	
	var locationArray = new Array();
	var itemArray = new Array();		
		
			
	//���׍s�J��Ԃ�����
	var count = nlapiGetLineItemCount('item');
	for (var i = 1; i < count + 1; i++) {
		itemArray.push(nlapiGetLineItemValue('item', 'item', i));
		if(nlapiGetLineItemValue('item', 'item', i) ==  Shipping_Item_ID || nlapiGetLineItemValue('item', 'item', i) ==  Cash_on_delivery_fee_Item){
			continue;
		}
		locationArray.push(nlapiGetLineItemValue('item', 'location', i));
	}
	//�d�����e�폜
	locationArray = unique(locationArray);
	itemArray = unique(itemArray);
	
	//���׍s�̍ő�q�ɐ��ʂT�ł��B
	if(locationArray.length > 5){
		alert("���׍s�őq�ɐ���"+locationArray.length+"���ł��B���͉\�ő�q�ɐ��ʂ͂T�ł��B")
		return ;
	}
	
	//�ēx�v�Z�O�@�萔�����ݏꍇ�@�A���[�g����
	if ( itemArray.indexOf(Cash_on_delivery_fee_Item) > -1) {
		alert('�����̎萔�����폜���čēx�v�Z���Ă��������B');
		return ;
	}
	
	//���v���z
	var totalAmt = 0;
	//�ꏊ���ƂŌJ��Ԃ�
	for (var j = 0; j < locationArray.length; j++) {
		
		amt = getTesuOrHaisou(1,locationArray[j]);
		totalAmt += amt;
		nlapiSelectNewLineItem('item');
		// ������萔��
		nlapiSetCurrentLineItemValue('item', 'item',Cash_on_delivery_fee_Item, false);
		//���ʂP�Œ�
		nlapiSetCurrentLineItemValue('item', 'quantity', '1', false);
		//�ꏊ
		// add by song CH327 start ���׏ꏊ�󔒔���
		if(isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))){
			nlapiSetCurrentLineItemValue('item', 'location',locationArray[j], false);
		}
		// add by song CH327 start ���׏ꏊ�󔒔���
		
		nlapiSetCurrentLineItemValue('item', 'rate',amt, false);
		nlapiSetCurrentLineItemValue('item', 'amount',amt, false);
		nlapiSetCurrentLineItemValue('item', 'taxcode',Cash_on_delivery_fee_rate_taxcode, false);
		nlapiSetCurrentLineItemValue('item', 'taxrate1',Cash_on_delivery_fee_rate_taxrate1, false);
		nlapiSetCurrentLineItemValue('item', 'inventorysubsidiary',nlapiGetFieldValue('subsidiary'));
		nlapiSetCurrentLineItemValue('item', 'fulfillable', 'T',false);
		nlapiCommitLineItem('item');

	}
	alert('�萔�����v�Z���܂����B');
	nlapiSetFieldValue('custbody_djkk_commission', totalAmt)
}

/*
 * �z���������v�Z
 * 
 * 
 */
function commission2() {

	// �������̏��v���擾
	var subtotal = nlapiGetFieldValue('subtotal');
	//�������̑��v�擾����
	var total = nlapiGetFieldValue('total');
	var locationArray = new Array();
	var itemArray = new Array();

	//���׍s�J��Ԃ�����
	var count = nlapiGetLineItemCount('item');
	for (var i = 1; i < count + 1; i++) {
		itemArray.push(nlapiGetLineItemValue('item', 'item', i));
		if(nlapiGetLineItemValue('item', 'item', i) ==  Shipping_Item_ID || nlapiGetLineItemValue('item', 'item', i) ==  Cash_on_delivery_fee_Item){
			continue;
		}
		locationArray.push(nlapiGetLineItemValue('item', 'location', i));
	}
			
	//�d�����e�폜
	locationArray = unique(locationArray);
	itemArray = unique(itemArray);			

	//���׍s�̍ő�q�ɐ��ʂT�ł��B
	if(locationArray.length > 5){
		alert("���׍s�őq�ɐ���"+locationArray.length+"���ł��B���͉\�ő�q�ɐ��ʂ͂T�ł��B")
		return ;
	}
			

	//�ēx�v�Z�O�@�z�������ݏꍇ�@�A���[�g����
	if ( itemArray.indexOf(Shipping_Item_ID) > -1) {
		alert('�����̔z�������폜���čēx�v�Z���Ă��������B');
		return ;
	}
	
	//���v���z
	var totalAmt = 0;

	//�ꏊ���ƂŌJ��Ԃ�
	for (var j = 0; j < locationArray.length; j++) {
		var amt = 0;
		//���������v���T�O�O�O�O�ȏ�ꍇ�����Ƃ���A�ȊO�ꍇ�v�Z����
		if (subtotal < 50000) {
			amt = getTesuOrHaisou(2,locationArray[j]);
		}
		totalAmt += amt;
		
		nlapiSelectNewLineItem('item');
		// �z����
		nlapiSetCurrentLineItemValue('item', 'item',Shipping_Item_ID, false);
		//���ʂP�Œ�
		nlapiSetCurrentLineItemValue('item', 'quantity', '1',false);
		// add by song CH327 start ���׏ꏊ�󔒔���
		if(isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))){
			nlapiSetCurrentLineItemValue('item', 'location',locationArray[j], false);
		}
		// add by song CH327 end ���׏ꏊ�󔒔���
		nlapiSetCurrentLineItemValue('item', 'rate',amt, false);
		nlapiSetCurrentLineItemValue('item', 'amount',amt, false);
		nlapiSetCurrentLineItemValue('item', 'taxcode',Shipping_Item_taxcode, false);
		nlapiSetCurrentLineItemValue('item', 'taxrate1',Shipping_Item_taxrate1, false);
		nlapiSetCurrentLineItemValue('item','inventorysubsidiary',nlapiGetFieldValue('subsidiary'));
		nlapiSetCurrentLineItemValue('item', 'fulfillable','T', false);
		nlapiCommitLineItem('item');
	}
	alert('�z�������v�Z���܂����B');
	nlapiSetFieldValue('custbody_djkk_delivery_charge', totalAmt)
	
}



/**
 * �q�ɂ��ƂŎ萔���^�z�������v�Z����
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
	
	//�p�����[�^�s���ꍇ�@�O�Ƃ��܂��B
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
	
	//�P�F�萔���@�Q�F�z����
	if(div == '1'){
		return Number(customrecord_djkk_fees_delivery_mstSearch[0].getValue("custrecord_djkk_fees_delivery_amt1",null,"SUM"));
	}else if(div == '2'){
		return Number(customrecord_djkk_fees_delivery_mstSearch[0].getValue("custrecord_djkk_fees_delivery_amt2",null,"SUM"));
	}else{
		return 0;
	}
}

/*
 * �萔���ꊇ�폜
 */
function commissionDelect() {
	
	
	//���׍s�Ŕz���Ǝ萔���̃A�C�e�����폜����
	var count = nlapiGetLineItemCount('item');
	for (var i = count; i > 0; i--) {
		var itemId = nlapiGetLineItemValue('item', 'item', i);
		if (itemId == Cash_on_delivery_fee_Item ) {
			nlapiRemoveLineItem('item', i);
		}
	}
	alert('�萔�����폜���܂����B');
	nlapiSetFieldValue('custbody_djkk_commission', '0')
}

/*
 * �z�����ꊇ�폜
 */
function commissionDelect2() {
	
	
	//���׍s�Ŕz���Ǝ萔���̃A�C�e�����폜����
	var count = nlapiGetLineItemCount('item');
	for (var i = count; i > 0; i--) {
		var itemId = nlapiGetLineItemValue('item', 'item', i);
		if (itemId == Shipping_Item_ID) {
			nlapiRemoveLineItem('item', i);
		}
	}
	
	alert('�z�������폜���܂����B');
	nlapiSetFieldValue('custbody_djkk_delivery_charge', '0')
}

/**
 * �z���w���{�^��
 */
function deliveryinstructionst() {

	try {
		var soid=nlapiGetRecordId();
		var saleRecord = nlapiLoadRecord('salesorder',soid);		
		var location = saleRecord.getFieldValue('location');
				if (!isEmpty(location)) {
						// DJ_�������M�擾
					var custrecord_djkk_auto_sendmail = nlapiLookupField('location',
							location, 'custrecord_djkk_auto_sendmail');
						
					if (custrecord_djkk_auto_sendmail == 'T') {				
							var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_sendmail', 'customdeploy_djkk_sl_sendmail');
						       theLink += '&soid=' + soid;
						       theLink += '&userid=' + nlapiGetUser();	
						      
						       var rse = nlapiRequestURL(theLink);
						       var flag = rse.getBody();
						       if (flag == 'T') {
						           alert('����ɑ��M����܂����B');		            
						           window.location.href=window.location.href;
						       } else if(flag == 'F'){
						           alert('�ꏊ�̏Z���uFAX�v����сuDJ_���M���[���v��񂪐ݒ肳��Ă��܂���');
						           window.location.href=window.location.href;
						       }else {
						           alert('�ꏊ���擾�ł��܂���ł����A�u'+flag+'�v');
						           window.location.href=window.location.href;
						       }
					} else {
						alert('�ꏊ��DJ_�������M�`�F�b�N���Ă���܂���ł����B')
					}
	
				} else {
					alert('�q�ɂ�I�����Ă��������B')
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

	// �p�����[�^�̒ǉ�
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
		// �p�����[�^�̒ǉ�
		theLink += '&soid=' + id;
	}else{
		theLink = nlapiResolveURL('RECORD', 'customrecord_djkk_repair',fixId, 'VIEW');
	}		
	window.ischanged = false;
	location.href = theLink;
}

/*
 * ������/�[�i��/��̏�PDF�o��
 * */
function repairPDF(pdfType){
	
	var id=nlapiGetRecordId();
	var type=nlapiGetRecordType();
	var soRecord=nlapiLoadRecord(type, id);
	var estimate = soRecord.getFieldValue('custbody_djkk_estimate_re');
	
	//�C���i�ꍇ�@�X�e�[�^�X��ύX����
	//�C���i�X�e�[�^�X�F�@�[�i���o�͍ς�
	var repaire = estimate;

	if(!isEmpty(repaire) && pdfType == 'delivery'){
		if(nlapiLookupField('customrecord_djkk_repair', repaire, 'custrecord_djkk_re_status') < 8){
			nlapiSubmitField('customrecord_djkk_repair', repaire, 'custrecord_djkk_re_status','8')
		}
	}
	//�������o�͍ς�
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
		alert('�C���ΏۊO�APDF�o�͂ł��܂���B');		
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
 * ��̏����
 * */
//20221027 changed by zhou 
//U779 ���v�̕ύX  code������
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
//		alert('���׍s�Ɏ�̏��𐶐��ł��鏤�i�͂���܂���B��̏�����t���O���I������Ă��邱�Ƃ��m�F���Ă�����s���Ă��������B')
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
			var shippinginfosendtype = custRecord.getFieldValue('custentity_djkk_shippinginfosendtyp')//DJ_�[���񓚑��M���@|DJ_�o�׈ē����M�敪
			var shippinginfodesttype = custRecord.getFieldValue('custentity_djkk_shippinginfodesttyp')//DJ_�[���񓚑��M��|DJ_�o�׈ē����M��敪
			var deliverydestrep = custRecord.getFieldValue('custentity_djkk_customerrep')//DJ_�[���񓚑��M��S����|DJ_�o�׈ē����M��S����
			var shippinginfodestname = custRecord.getFieldValue('custentity_djkk_shippinginfodestname')//DJ_�[���񓚑��M���Ж�(3RD�p�[�e�B�[)|DJ_�o�׈ē����M���Ж�(3RD�p�[�e�B�[)
			var shippinginfodestrep = custRecord.getFieldValue('custentity_djkk_shippinginfodestrep')//DJ_�[���񓚑��M��S����(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��S����(3RD�p�[�e�B�[)
			var shippinginfodestemail = custRecord.getFieldValue('custentity_djkk_shippinginfodestemail')//DJ_�[���񓚑��M�惁�[��(3RD�p�[�e�B�[)|DJ_�o�׈ē����M�惁�[��(3RD�p�[�e�B�[)
			var shippinginfodestfax = custRecord.getFieldValue('custentity_djkk_shippinginfodestfax')//DJ_�[���񓚑��M��FAX(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��FAX(3RD�p�[�e�B�[)
			var shippinginfodestmemo = custRecord.getFieldValue('custentity_djkk_shippinginfodestmemo')//DJ_�[���񓚎������M���t����l|DJ_�o�׈ē����M��o�^����
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
			var deliveryPeriod = custRecord.getFieldValue('custentity_djkk_delivery_book_period'); //DJ_�[�i�����M���@
			if(soCustomform == '121'){ //LS
				var deliverySite = custRecord.getFieldValue('custentity_djkk_delivery_book_site'); //DJ_�[�i�����M��
			}else if(soCustomform == '175'){ //�H�i
				var deliverySiteFd = custRecord.getFieldValue('custentity_djkk_delivery_book_site_fd'); //DJ_�[�i�����M��(�H�i�p)
			}
			
			var deliveryPerson = custRecord.getFieldValue('custentity_djkk_delivery_book_person'); //DJ_�[�i�����M��S����
			var deliverySubName = custRecord.getFieldValue('custentity_djkk_delivery_book_subname'); //DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
			var deliveryPersont = custRecord.getFieldValue('custentity_djkk_delivery_book_person_t'); //DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
			var deliveryEmail = custRecord.getFieldValue('custentity_djkk_delivery_book_email'); //DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
			var deliveryFax = custRecord.getFieldValue('custentity_djkk_delivery_book_fax_three'); //DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
			var deliveryMemo = custRecord.getFieldValue('custentity_djkk_delivery_book_memo'); //DJ_�[�i���������M���l
			if(!isEmpty(deliveryPeriod)&& (deliveryPeriod!= '10')){
				nlapiSetFieldValue('custbody_djkk_delivery_book_period', deliveryPeriod,false);//DJ_�[�i�����M���@
				if(soCustomform == '121'){
					nlapiSetFieldValue('custbody_djkk_delivery_book_site', deliverySite,false);//DJ_�[�i�����M��
				}else if(soCustomform == '175'){
					nlapiSetFieldValue('custbody_djkk_delivery_book_site_fd', deliverySiteFd,false);//DJ_�[�i�����M��
				}
				nlapiSetFieldValue('custbody_djkk_delivery_book_person', deliveryPerson,false);//DJ_�[�i�����M��S����
				nlapiSetFieldValue('custbody_djkk_delivery_book_subname', deliverySubName,false);//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_delivery_book_person_t', deliveryPersont,false);//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_delivery_book_email', deliveryEmail,false);//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
				nlapiSetFieldValue('custbody_djkk_delivery_book_fax_three', deliveryFax,false);//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
				if(soCustomform == '121'){
					nlapiSetFieldValue('custbody_djkk_reference_column', deliveryMemo);//DJ_�[�i���������M���l  custbody_djkk_reference_column
				}else if(soCustomform == '175'){
					nlapiSetFieldValue('custbody_djkk_delivery_book_memo_so', deliveryMemo);//DJ_�[�i���������M���l  custbody_djkk_reference_column
				}
				
			}
		}
//	}
}
function shippinginfoSendMailChangeFormDelivery(deliveryRecord){
	var shippinginfosendtype = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfosendtyp')//DJ_�[���񓚑��M���@|DJ_�o�׈ē����M�敪
	var deliverydestrep = deliveryRecord.getFieldValue('custrecord_djkk_deliverydestrep')//DJ_�[���񓚑��M��S����|DJ_�o�׈ē����M��S����
	var shippinginfodestname = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfodestname')//DJ_�[���񓚑��M���Ж�(3RD�p�[�e�B�[)|DJ_�o�׈ē����M���Ж�(3RD�p�[�e�B�[)
	var shippinginfodestrep = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfodestrep')//DJ_�[���񓚑��M��S����(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��S����(3RD�p�[�e�B�[)
	var shippinginfodestemail = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfodestemail')//DJ_�[���񓚑��M�惁�[��(3RD�p�[�e�B�[)|DJ_�o�׈ē����M�惁�[��(3RD�p�[�e�B�[)
	var shippinginfodestfax = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfodestfax')//DJ_�[���񓚑��M��FAX(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��FAX(3RD�p�[�e�B�[)
	var shippinginfodestmemo = deliveryRecord.getFieldValue('custrecord_djkk_shippinginfodestmemo')//DJ_�[���񓚎������M���t����l|DJ_�o�׈ē����M��o�^����
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
	var shippinginfosendtype = custRecord.getFieldValue('custentity_djkk_shippinginfosendtyp')//DJ_�[���񓚑��M���@|DJ_�o�׈ē����M�敪
	var deliverydestrep = custRecord.getFieldValue('custentity_djkk_customerrep')//DJ_�[���񓚑��M��S����|DJ_�o�׈ē����M��S����
	var shippinginfodestname = custRecord.getFieldValue('custentity_djkk_shippinginfodestname')//DJ_�[���񓚑��M���Ж�(3RD�p�[�e�B�[)|DJ_�o�׈ē����M���Ж�(3RD�p�[�e�B�[)
	var shippinginfodestrep = custRecord.getFieldValue('custentity_djkk_shippinginfodestrep')//DJ_�[���񓚑��M��S����(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��S����(3RD�p�[�e�B�[)
	var shippinginfodestemail = custRecord.getFieldValue('custentity_djkk_shippinginfodestemail')//DJ_�[���񓚑��M�惁�[��(3RD�p�[�e�B�[)|DJ_�o�׈ē����M�惁�[��(3RD�p�[�e�B�[)
	var shippinginfodestfax = custRecord.getFieldValue('custentity_djkk_shippinginfodestfax')//DJ_�[���񓚑��M��FAX(3RD�p�[�e�B�[)|DJ_�o�׈ē����M��FAX(3RD�p�[�e�B�[)
	var shippinginfodestmemo = custRecord.getFieldValue('custentity_djkk_shippinginfodestmemo')//DJ_�[���񓚎������M���t����l|DJ_�o�׈ē����M��o�^����
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
	var deliveryPeriod = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_period');//DJ_�[�i�����M���@
	var deliveryPerson = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person');//DJ_�[�i�����M��S����
	var deliverySubName = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_subname');//DJ_�[�i�����M���Ж�(3RD�p�[�e�B�[)
	var deliveryPersont = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_person_t');//DJ_�[�i�����M��S����(3RD�p�[�e�B�[)
	var deliveryEmail = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_email');//DJ_�[�i�����M�惁�[��(3RD�p�[�e�B�[)
	var deliveryFax = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_fax_three');//DJ_�[�i�����M��FAX(3RD�p�[�e�B�[)
	var deliveryMemo = deliveryRecord.getFieldValue('custrecord_djkk_delivery_book_memo');//DJ_�[�i���������M���t����l
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
	var deliveryPeriod = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_period')//�[�i�����M���@
	var deliveryPerson = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_person')//�[�i�����M��S����
	var deliverySubName = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_subname')//�[�i�����M���Ж�(3RD�p�[�e�B�[)
	var deliveryPersont = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_person_t')//�[�i�����M��S����(3RD�p�[�e�B�[)
	var deliveryEmail = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_email')//�[�i�����M�惁�[��(3RD�p�[�e�B�[)
	var deliveryFax = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_fax_three')//�[�i�����M��FAX(3RD�p�[�e�B�[)
	var deliveryMemo = loadingCustomer.getFieldValue('custentity_djkk_delivery_book_memo')//�[�i���������M���l
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