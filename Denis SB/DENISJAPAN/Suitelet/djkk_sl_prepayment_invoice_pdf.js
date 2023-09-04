/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Oct 2022     rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

//�O���������PDF
function suitelet(request, response) {

    try {
        var invAmount = 0;
        var invTaxamount = 0;
        var itemLine = new Array();
        var salesorderID = request.getParameter('salesorderid'); // ID
        var salesorderRecord = nlapiLoadRecord('salesorder', salesorderID);
        // CH672 zzq 20230719 start
        var tmpLocationDic = getLocations(salesorderRecord);
        // CH672 zzq 20230719 end
        var entity = salesorderRecord.getFieldValue('entity');// �ڋq
        var customerSearch = nlapiSearchRecord(
                "customer", null, 
                [
                 [
                  "internalid", "anyof", entity]
                 ], 
                 [
                  new nlobjSearchColumn("address2", "billingAddress", null), // ������Z��1
                  new nlobjSearchColumn("address3", "billingAddress", null), // ������Z��2
                  new nlobjSearchColumn("city", "billingAddress", null), // ������s�撬��
                  new nlobjSearchColumn("zipcode", "billingAddress", null), // ������X�֔ԍ�
                  new nlobjSearchColumn("custrecord_djkk_address_state", "billingAddress", null), // ������s���{��
                  new nlobjSearchColumn("phone"), // �d�b�ԍ�
                  new nlobjSearchColumn("fax"), // Fax
                  new nlobjSearchColumn("entityid"), // id
                  new nlobjSearchColumn("salesrep"), // �̔����i���ВS���j
                  new nlobjSearchColumn("currency"),  //��{�ʉ�
                  //CH672 20230713 by zzq start
                  new nlobjSearchColumn("language"),  //����
                  new nlobjSearchColumn("companyname"), //name
                  new nlobjSearchColumn("address1","billingAddress",null), //������Z��1
                //CH672 20230713 by zzq end
               // CH756&CH757 20230731 by zdj satrt
                  new nlobjSearchColumn("country","billingAddress",null),////�����捑
                  new nlobjSearchColumn("state","billingAddress",null), //������Z�� : �s���{��
                  new nlobjSearchColumn("billaddress")
               // CH756&CH757 20230731 by zdj end
                  
                  
                  ]
                );    
        var address2 = defaultEmpty(isEmpty(customerSearch) ? '' : customerSearch[0].getValue("address2", "billingAddress", null));// �Z��2
        var address3 = defaultEmpty(isEmpty(customerSearch) ? '' : customerSearch[0].getValue("address3", "billingAddress", null));// �Z��3
        //CH672 20230713 by zzq start
        var address1 = defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("address1","billingAddress",null));// �Z��1
        //CH672 20230713 by zzq end
        var invoiceCity = defaultEmpty(isEmpty(customerSearch) ? '' : customerSearch[0].getValue("city", "billingAddress", null));// �s�撬��
        var invoicestateEn= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("state","billingAddress",null));
        var invoiceZipcode = defaultEmpty(isEmpty(customerSearch) ? '' : customerSearch[0].getValue("zipcode", "billingAddress", null));// �X�֔ԍ�
        var invAddress = defaultEmpty(isEmpty(customerSearch) ? '' : customerSearch[0].getValue("custrecord_djkk_address_state", "billingAddress", null));// �s���{��
        var invPhone = defaultEmpty(isEmpty(customerSearch) ? '' : customerSearch[0].getValue("phone"));// �d�b�ԍ�
        var invFax = defaultEmpty(isEmpty(customerSearch) ? '' : customerSearch[0].getValue("fax"));// Fax
        var entityid = defaultEmpty(isEmpty(customerSearch) ? '' : customerSearch[0].getValue("entityid"));// id
        var custSalesrep = defaultEmpty(isEmpty(customerSearch) ? '' : customerSearch[0].getText("salesrep"));// �̔����i���ВS���j
        var custLanguage = defaultEmpty(salesorderRecord.getFieldValue('custbody_djkk_language')); // ����������
        var trandate = defaultEmpty(salesorderRecord.getFieldValue('trandate')); // ���������t
        var otherrefnum = defaultEmpty(salesorderRecord.getFieldValue('otherrefnum')); // �������ԍ�
        var delivery_date = defaultEmpty(salesorderRecord.getFieldValue('custbody_djkk_delivery_date')); // �������[�i��
        var tranid = defaultEmpty(salesorderRecord.getFieldValue('tranid')); // �������ԍ�
        var createdfrom = defaultEmpty(salesorderRecord.getFieldText('createdfrom')); // �������쐬��
        var payment = defaultEmpty(salesorderRecord.getFieldText('custbody_djkk_payment_conditions')); // �������x������
        var salesrep = defaultEmpty(salesorderRecord.getFieldText('salesrep')); // �c�ƒS����
        var memo = defaultEmpty(salesorderRecord.getFieldValue('memo')); //memo
        var currency= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getText("currency"));//�̔����i���ВS���j
        var subsidiary = defaultEmpty(salesorderRecord.getFieldValue('subsidiary')); //�������q���
        //CH672 20230713 by zzq start
        var language= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("language"));//����
        var custNameText= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("companyname"));//name add by zhou
        var transactionnumber= defaultEmpty(salesorderRecord.getFieldValue('transactionnumber'));//�g�����U�N�V�����ԍ�
        //CH762 20230811 add by zdj start
        var transactionPDF = defaultEmpty(salesorderRecord.getFieldValue('transactionnumber'));       //PDF�p
        //CH762 20230811 add by zdj end
        //�o���G�[�V�����x�� 20230803 add by zdj start
        var exsystemTranid = defaultEmpty(salesorderRecord.getFieldValue('custbody_djkk_exsystem_tranid'));
        if(exsystemTranid){
            transactionnumber = transactionnumber + '/' + exsystemTranid;
        }
        //�o���G�[�V�����x�� 20230803 add by zdj end
        var dvyMemo = defaultEmpty(salesorderRecord.getFieldValue('custbody_djkk_deliverynotememo')); //�[�i�����l
        var otherrefnumNew = defaultEmpty(salesorderRecord.getFieldValue('custbody_djkk_customerorderno'));    //��������ԍ�
        // CH756&CH757 20230731 by zdj satrt
        var invoiceCountry= defaultEmpty(isEmpty(customerSearch) ? '' :  customerSearch[0].getValue("country","billingAddress",null));//�����捑
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
        // CH756&CH757 20230731 by zdj end
      //CH672 20230713 by zzq end
        //CH672 20230714 by zzq start
        var salesrepId = defaultEmpty(salesorderRecord.getFieldValue('salesrep'));    //�c�ƒS����ID
        var salesrepNew = '';
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
                employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_lastname")));//�]�ƈ�lastname
                employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("custentity_djkk_english_firstname")));//�]�ƈ�firstname
                if(employeelastname && employeelastname){
                    salesrepNew = employeefirstname +'&nbsp;'+ employeelastname;
                }else if(employeelastname && !employeelastname) {
                    salesrepNew = employeefirstname;
                }else if(!employeelastname && employeelastname) {
                    salesrepNew = employeelastname;
                }
            } else {
                employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("lastname")));//�]�ƈ�lastname
                employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("firstname")));//�]�ƈ�firstname
                if(employeelastname && employeelastname){
                    salesrepNew = employeelastname +'&nbsp;'+ employeefirstname;
                }else if(employeelastname && !employeelastname) {
                    salesrepNew = employeefirstname;
                }else if(!employeelastname && employeelastname) {
                    salesrepNew = employeelastname;
                }
            }
      }
        //CH672 20230714 by zzq end
        var insubsidiarySearch = nlapiSearchRecord(
                "subsidiary", null, 
                [
                 ["internalid", "anyof", subsidiary]
                 ], 
                 [
                  new nlobjSearchColumn("legalname"), // ��������
                  new nlobjSearchColumn("name"), // ���O
                  new nlobjSearchColumn("custrecord_djkk_subsidiary_en"), // ���O�p��
                  new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), // �Z���p��
                  new nlobjSearchColumn("custrecord_djkk_address_state", "address", null), // �s���{��
                  //CH672 20230713 by zzq start
                  new nlobjSearchColumn("address1","address",null), //�Z��1
                  new nlobjSearchColumn("custrecord_djkk_invoice_issuer_number"),//�K�i���������s���ƎҔԍ�
                  //CH672 20230713 by zzq end
                  new nlobjSearchColumn("address2", "address", null), // �Z��2
                  new nlobjSearchColumn("address3", "address", null), // �Z��3
                  new nlobjSearchColumn("city", "address", null), // �s�撬��
                  new nlobjSearchColumn("zip", "address", null), // �X�֔ԍ�
                  new nlobjSearchColumn("custrecord_djkk_address_fax", "address", null), // fax
                  new nlobjSearchColumn("phone", "address", null), //phone
                //CH672 20230714 by zzq start
                  new nlobjSearchColumn("custrecord_djkk_bank_1"),//DJ_��s1
                  new nlobjSearchColumn("custrecord_djkk_bank_2"),//DJ_��s2
                //CH672 20230714 by zzq end
                  //CH655 20230725 add by zdj start
                  new nlobjSearchColumn("phone","shippingAddress",null),//�z����phone
                  new nlobjSearchColumn("custrecord_djkk_address_fax","shippingAddress",null)//�z����fax
                //CH655 20230725 add by zdj end

                ]);    

        var invoiceLegalname = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("legalname"));// ��������
        var invoiceName = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("name"));// ���O
        var invoiceAddressTwo = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("address2", "address", null));// �Z��2
        var invoiceAddressThree = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("address3", "address", null));// �Z��3
        //CH672 20230713 by zzq start
        var invoiceAddress= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("address1","address",null));//�Z��1
        var invoiceIssuerNumber= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_invoice_issuer_number"));//�K�i���������s���ƎҔԍ�
        //CH672 20230713 by zzq end
        var invoiceAddressZip = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("zip", "address", null));// �X�֔ԍ�
        var invoiceCitySub = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("city", "address", null));// �s�撬��
        var invoiceAddressState = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("custrecord_djkk_address_state", "address", null));// �s���{��
        var invoiceNameEng = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en"));// ���O�p��
        var invoiceAddressEng = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng"));// �Z���p��
        var invoiceFax = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("custrecord_djkk_address_fax", "address", null));// fax
        var invoicePhone = defaultEmpty(isEmpty(insubsidiarySearch) ? '' : insubsidiarySearch[0].getValue("phone", "address", null));// phone
        //CH655 20230725 add by zdj start
        var shipaddressPhone= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("phone","shippingAddress",null));//�z����phone
        var shipaddressFax= defaultEmpty(isEmpty(insubsidiarySearch) ? '' :  insubsidiarySearch[0].getValue("custrecord_djkk_address_fax","shippingAddress",null));//�z����fax
        //CH655 20230725 add by zdj end
        //CH672 20230714 by zzq start
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
//              bankNo1 = 'No.'+ defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
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
//              bankNo1 = 'No.'+ defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'));
                bankNo2 = defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'));
                //CH756&CH757 20230801 by zdj end
            }
        }
        //CH672 20230714 by zzq end
        

        var incoicedelivery_destination = salesorderRecord.getFieldValue('custbody_djkk_delivery_destination'); // �������[�i��
        if (!isEmpty(incoicedelivery_destination)) {
            var invDestinationSearch = nlapiSearchRecord("customrecord_djkk_delivery_destination", null, [["internalid", "anyof", incoicedelivery_destination]], [new nlobjSearchColumn("custrecord_djkk_zip"), // �X�֔ԍ�
            new nlobjSearchColumn("custrecord_djkk_prefectures"), // �s���{��
            new nlobjSearchColumn("custrecord_djkk_municipalities"), // DJ_�s�撬��
            new nlobjSearchColumn("custrecord_djkk_delivery_residence"), // DJ_�[�i��Z��1
          //CH672 20230713 by zzq start
            new nlobjSearchColumn("custrecord_djkk_delivery_lable"), // DJ_�[�i��Z��2
          //CH672 20230713 by zzq end
            new nlobjSearchColumn("custrecord_djkk_delivery_residence2"), // DJ_�[�i��Z��3
            new nlobjSearchColumn("custrecorddjkk_name"), // DJ_�[�i�於�O
            ]);
            var invdestinationZip = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_zip'));// �X�֔ԍ�
            var invdestinationState = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_prefectures'));// �s���{��
            var invdestinationCity = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_municipalities'));// DJ_�s�撬��
            var invdestinationAddress = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence'));// DJ_�[�i��Z��1
            //CH672 20230713 by zzq start
            var invdestinationAddress2 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_lable'));//DJ_�[�i��Z��2
            //CH672 20230713 by zzq end
            var invdestinationAddress3 = defaultEmpty(invDestinationSearch[0].getValue('custrecord_djkk_delivery_residence2'));//DJ_�[�i��Z��3
            var incoicedelivery_Name = defaultEmpty(invDestinationSearch[0].getValue('custrecorddjkk_name'));//DJ_�[�i�於�O
        }
        var tmpCurrency = salesorderRecord.getFieldValue('currency');
        var displaysymbol = '';
        if (tmpCurrency) {
            var tmpRecd = nlapiLoadRecord('currency', tmpCurrency, 'symbol');
            if (tmpRecd) {
                displaysymbol = tmpRecd.getFieldValue('displaysymbol');
            }
        }
    var invoiceCount = salesorderRecord.getLineItemCount('item');
        for (var k = 1; k < invoiceCount + 1; k++) {
            salesorderRecord.selectLineItem('item', k);
            var invoiceItemId = salesorderRecord.getLineItemValue('item', 'item', k); // item
            var invoiceItemSearch = nlapiSearchRecord("item", null, [["internalid", "anyof", invoiceItemId], ], [new nlobjSearchColumn("itemid"), // ���i�R�[�h
            new nlobjSearchColumn("displayname"), // ���i��
            new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), // DJ_�i���i���{��jLINE1
            new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), // DJ_�i���i���{��jLINE2
            new nlobjSearchColumn("custitem_djkk_product_name_line1"), // DJ_�i���i�p��jLINE1
            new nlobjSearchColumn("custitem_djkk_product_name_line2"), // DJ_�i���i�p��jLINE2
          //CH672 20230719 by zzq start
            new nlobjSearchColumn("custitem_djkk_product_code"), //�J�^���O���i�R�[�h
            new nlobjSearchColumn("custitem_djkk_deliverycharge_flg"), // DJ_�z�����t���O
          //CH672 20230719 by zzq end
            new nlobjSearchColumn("type")]);

            // CH672 by zzq 20230714 start
            //var invoiceRateFormat = defaultEmpty(salesorderRecord.getLineItemValue('item', 'rate', k));// �P��
            var invoiceRateFormat = defaultEmpty(parseFloat(salesorderRecord.getLineItemValue('item', 'rate', k)));// �P��
           // CH672 by zzq 20230714 end
            if(!(Number(invoiceRateFormat)==0 && invoiceItemSearch[0].getValue("custitem_djkk_deliverycharge_flg") == 'T')){
            var invoiceInitemid = defaultEmpty(isEmpty(invoiceItemSearch) ? '' : invoiceItemSearch[0].getValue("itemid"));// ���i�R�[�h
            // var invoiceDisplayName= defaultEmpty(isEmpty(invoiceItemSearch) ? '' : invoiceItemSearch[0].getValue("displayname"));//���i��
          //CH672 20230719 by zzq start
            var productCode= defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("custitem_djkk_product_code"));//�J�^���O���i�R�[�h
          //CH672 20230719 by zzq end
//            var invoiceItemType = invoiceItemSearch[0].getValue("type");
            var invoiceDisplayName = '';
            var invoiceItemNouhinBikou = salesorderRecord.getLineItemValue('item','custcol_djkk_deliverynotememo',k); //DJ_�[�i�����l
            var itemDisplayName = defaultEmpty(isEmpty(invoiceItemSearch) ? '' : invoiceItemSearch[0].getValue("displayname"));// ���i��
            var invoiceItemType = defaultEmpty(isEmpty(invoiceItemSearch) ? '' :  invoiceItemSearch[0].getValue("type")); //�A�C�e��type
            if (invoiceItemType == 'OthCharge') {
                invoiceDisplayName = othChargeDisplayname(itemDisplayName, language); // �萔��
            }else{
                if (!isEmpty(invoiceItemSearch)) {
                    // add by zzq start
                    // if(custLanguage == '���{��'){
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
//            if (!isEmpty(invoiceItemSearch)) {
//                // add by zzq start
//                // if(custLanguage == '���{��'){
//                if (custLanguage == LANGUAGE_JP) {
//                    // add by zzq end
//                    var jpName1 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_jpline1");
//                    var jpName2 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_jpline2");
//                    if (!isEmpty(jpName1) && !isEmpty(jpName2)) {
//                        invoiceDisplayName = jpName1 + ' ' + jpName2;
//                    } else if (!isEmpty(jpName1) && isEmpty(jpName2)) {
//                        invoiceDisplayName = jpName1;
//                    } else if (isEmpty(jpName1) && !isEmpty(jpName2)) {
//                        invoiceDisplayName = jpName2;
//                    }
//                } else {
//                    var enName1 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_line1");
//                    var enName2 = invoiceItemSearch[0].getValue("custitem_djkk_product_name_line2");
//                    if (!isEmpty(enName1) && !isEmpty(enName2)) {
//                        invoiceDisplayName = enName1 + ' ' + enName2;
//                    } else if (!isEmpty(enName1) && isEmpty(enName2)) {
//                        invoiceDisplayName = enName1;
//                    } else if (isEmpty(enName1) && !isEmpty(enName2)) {
//                        invoiceDisplayName = enName2;
//                    }
//                }
//
//            }
            if (invoiceDisplayName) {
                if (invoiceItemNouhinBikou) {
                    invoiceDisplayName = invoiceDisplayName + '<br/>' + invoiceItemNouhinBikou;
                }
            } else {
                if (invoiceItemNouhinBikou) {
                    invoiceDisplayName = invoiceItemNouhinBikou;
                }
            }
            
            var invoiceQuantity = defaultEmpty(salesorderRecord.getLineItemValue('item', 'quantity', k));// ����
           
            // CH672 by zzq 20230714 end
            var invoiceAmount = defaultEmpty(parseFloat(salesorderRecord.getLineItemValue('item', 'amount', k)));// ���z
            if (invoiceAmount) {
               // var invAmountFormat = invoiceAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                var invAmountFormat = invoiceAmount
                invAmount += invAmountFormat;
//                var invoAmountTotal = invAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            }  else {
                invoiceAmount = 0;
            }
            nlapiLogExecution('error', 'invoAmountTotal', invoAmountTotal);
//            var invTaxamount = 0;
            var invoiceTaxrate1Format = defaultEmpty(salesorderRecord.getLineItemValue('item', 'taxrate1', k));// �ŗ�
            var invoiceTaxamount = defaultEmpty(parseFloat(salesorderRecord.getLineItemValue('item', 'tax1amt', k)));// �Ŋz
            nlapiLogExecution('error', 'invoiceTaxamount', invoiceTaxamount);
            var invoiceTaxcode = defaultEmpty(salesorderRecord.getLineItemValue('item', 'taxcode', k));// �ŗ�
            if (invoiceTaxamount) {
                // CH672 by zzq 20230714 start
//                var invTaxamountFormat = invoiceTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                //invTaxamount += invoiceTaxamount;
                //var invTaxamountFormat = invoiceTaxamount;
                
                var invTaxamountFormat = invoiceTaxamount;     
                    invTaxamount += invTaxamountFormat;
             // CH672 by zzq 20230714 end
//                var invTaxmountTotal = invTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            } else {
//                var invTaxamountFormat = '';
                invoiceTaxamount = 0;
            }
            nlapiLogExecution('error', 'invTaxamount', invTaxamount);
//            var invoTotal = defaultEmpty(Number(invAmount + invTaxamountFormat));
//            if (!isEmpty(invoTotal)) {
                //var invoToTotal = invoTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//                var invoToTotal = parseFloat(invoTotal);
             // CH672 by zzq 20230714 start
//                if(language == SYS_LANGUAGE_EN){
//                     invoToTotal = formatAmount2(invoTotal);
//                }else{
//                     invoToTotal = formatAmount1(invoTotal);
//                }  
             // CH672 by zzq 20230714 end
//            } else {
//                var invoToTotal = '';
//            }

            var invoiceUnitabbreviation = defaultEmpty(salesorderRecord.getLineItemValue('item', 'units_display', k));// �P��
            // CH672 by zzq 20230713 start
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
                    if(language == SYS_LANGUAGE_EN){            //�p��
                        var units_display = unitSearch[0].getValue('abbreviation')+'';
                        nlapiLogExecution('DEBUG', 'units_display_EN', units_display);
                        unitsArray = units_display.split("/");
                        if(unitsArray.length == 2){
                            invoiceUnitabbreviation = unitsArray[1];
                        }
                    }else if(language == SYS_LANGUAGE_JP){              //���{��
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
            // CH672 by zzq 20230713 end
            // CH672 zzq 20230719 start
            var itemLocId = defaultEmpty(salesorderRecord.getLineItemValue('item', 'location', k)); // �ꏊ
            var locBarCode = '';
            if (itemLocId) {
                var tmpDicBarCode = tmpLocationDic[itemLocId];
                if (tmpDicBarCode) {
                    locBarCode = tmpDicBarCode;
                }
            }
            
            if(!isEmpty(productCode) && !isEmpty(locBarCode)){
                invoiceInitemid = invoiceInitemid+'<br/>'+ productCode + ' ' + locBarCode;
            }else if(isEmpty(productCode) && !isEmpty(locBarCode)){
                invoiceInitemid = invoiceInitemid+'<br/>'+ locBarCode;
            }else if(!isEmpty(productCode) && isEmpty(locBarCode)){
                invoiceInitemid = invoiceInitemid+'<br/>'+ productCode;
            }else{
                invoiceInitemid = invoiceInitemid+'<br/>'+ ' ';
            }
            // CH672 zzq 20230719 end
            // CH672 by zzq 20230714 start
            if (language == SYS_LANGUAGE_EN) {
                itemLine.push({
                    invoiceInitemid : invoiceInitemid, // ���i�R�[�h
                    invoiceDisplayName : invoiceDisplayName,// ���i��
                    invoiceQuantity : formatAmount2(invoiceQuantity),// ����
                    invoiceRateFormat : formatAmount2(invoiceRateFormat),// �P��
                    invoiceAmount : formatAmount2(invoiceAmount),// ���z
                    invoiceTaxrate1Format : invoiceTaxrate1Format,// �ŗ�
                    invoiceTaxamount : invoiceTaxamount,// �Ŋz
                    invoiceUnitabbreviation : invoiceUnitabbreviation,
                    invoiceTaxcode : invoiceTaxcode,// �ŗ��R�[�h
                    productCode:productCode,//�J�^���O���i�R�[�h
                    locBarCode:locBarCode,//DJ_�ꏊ�o�[�R�[�h
                
                });
            } else {
                itemLine.push({
                    invoiceInitemid : invoiceInitemid, // ���i�R�[�h
                    invoiceDisplayName : invoiceDisplayName,// ���i��
                    invoiceQuantity : formatAmount1(invoiceQuantity),// ����
                    invoiceRateFormat : formatAmount1(invoiceRateFormat),// �P��
                    invoiceAmount : formatAmount1(invoiceAmount),// ���z
                    invoiceTaxrate1Format : invoiceTaxrate1Format,// �ŗ�
                    invoiceTaxamount : invoiceTaxamount,// �Ŋz
                    invoiceUnitabbreviation : invoiceUnitabbreviation,
                    invoiceTaxcode : invoiceTaxcode,// �ŗ��R�[�h
                    productCode:productCode,//�J�^���O���i�R�[�h
                    locBarCode:locBarCode,//DJ_�ꏊ�o�[�R�[�h
                
                });
            }
            // CH672 by zzq 20230714 end
          }
        }
         // CH672 by zzq 20230714 start
        var invoAmountTotal = '0';
        if (invoAmountTotal) {
            if (language == SYS_LANGUAGE_EN) {
                 invoAmountTotal = formatAmount2(invAmount);
            } else {
                 invoAmountTotal = formatAmount1(invAmount);
            }
        }
        
        var invoTotal = defaultEmpty(Number(invAmount) + Number(invTaxamount));
        var invoToTotal = '0';
        if(invoTotal){
            if(language == SYS_LANGUAGE_EN){
                invoToTotal = formatAmount2(invoTotal);
           }else{
                invoToTotal = formatAmount1(invoTotal);
           } 
        }else {
            if(language == SYS_LANGUAGE_EN){
                invoToTotal = '0.00';
           }
        }
        
        
        if (invTaxamount) {
            if (language == SYS_LANGUAGE_EN) {
                invTaxamount = formatAmount2(invTaxamount);
            } else {
                invTaxamount = formatAmount1(invTaxamount);
            }
        }else {
            if(language == SYS_LANGUAGE_EN){
                invTaxamount = '0.00';
           }
        }
        
        var resultItemTaxArr = [];
        var invoiceTaxrate1FormatArr = [];
        for (var i = 0; i < itemLine.length; i++) {
            nlapiLogExecution('DEBUG', 'itemLine[i].invoiceTaxamount', itemLine[i].invoiceTaxamount);
            var tax = invoiceTaxrate1FormatArr.indexOf(itemLine[i].invoiceTaxcode);
            if (tax > -1) {
                if (itemLine[i].invoiceTaxamount) {
                    resultItemTaxArr[tax].invoiceTaxamount = parseFloat(resultItemTaxArr[tax].invoiceTaxamount) + parseFloat(itemLine[i].invoiceTaxamount);
                }
            } else {
                invoiceTaxrate1FormatArr.push(itemLine[i].invoiceTaxcode);
                var resultItemTaxObj = {};
                if (itemLine[i].invoiceTaxamount) {
                    resultItemTaxObj.invoiceTaxamount = parseFloat(itemLine[i].invoiceTaxamount);
                } else {
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
        
      //20230801 CH756&CH757 by zdj start
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
        //20230901 add by CH762 start 
        var SALESORDERPDF_ADDRESS = '';
        if(subsidiary == SUB_NBKK){
            SALESORDERPDF_ADDRESS = SALESORDER_PDF_DJ_SALESORDERPDF_NBKK;
        }else if(subsidiary == SUB_ULKK){
            SALESORDERPDF_ADDRESS = SALESORDER_PDF_DJ_SALESORDERPDF_ULKK;
        }else{
            SALESORDERPDF_ADDRESS = SALESORDER_PDF_DJ_SALESORDERPDF;
        }
       //20230901 add by CH762 end 
        
        //20230801 CH756&CH757 by zdj end

        if (custLanguage == LANGUAGE_JP) {
            //20230801 CH756&CH757 by zdj start
            var Vibration = '�U������';
            //20230801 CH756&CH757 by zdj end
            var dateName = '��\xa0\xa0�t';
            var deliveryName = '�[�i��';
            var paymentName = '�x������';
            var numberName = '��\xa0\xa0��';
            var numberName2 = '��Д����ԍ�';
            var codeName = '�R�[�h';
            var invoiceName = '*\xa0\xa0\*\xa0\xa0\*��\xa0\xa0\xa0\xa0\��\xa0\xa0\xa0\xa0\��*\xa0\xa0\*\xa0\xa0\*';
            var quantityName = '��\xa0\xa0\xa0\xa0\xa0\xa0\xa0��';
            var unitpriceName = '�P\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0��';
            var amountName = '��\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0�z';
            var poductName = '�i\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\��';
            var taxRateName = '***\xa0\xa0\��\xa0��:';
            var taxAmountName = '�Ŋz:';
            var custCode = '�ڋq�R�[�h\xa0\xa0:';
            var destinationName = '�[�i��\xa0\xa0:';
            var totalName = '��\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0�v';
            var consumptionTaxName = '��\xa0\xa0��\xa0\xa0��';
            var invoiceName1 = '�䐿���z';
            var personName = '�S����\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
            var memoName = '��\xa0\xa0��'
            var validterm = '�L������';
            //CH672 20230713 by zzq start
            var custName = '�ڋq��\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
            var addressNmae = '�Z��\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:';
//            var invoiceIssuerNumberName = '�K�i���������s���ƎҔԍ�:';
            var invoiceIssuerNumberName = '�o�^�ԍ�:';
            //CH672 20230713 by zzq start
            //CH672 20230721 by zzq start
            var stomach =  '�䒆';
            //CH672 20230721 by zzq end
         // CH756&CH757 20230731 by zdj start
            if(invoiceCity){
                invoiceCity = invoiceCity + '&nbsp;' + address1;
            }else{
                invoiceCity = address1;
            }
         // CH756&CH757 20230731 by zdj end
        } else {
            //20230801 CH756&CH757 by zdj start
            var Vibration = 'Bank Account';
            //20230801 CH756&CH757 by zdj end
            var dateName = 'Date';
            var deliveryName = 'Delivery Date';
            var paymentName = 'Payment Terms';
            var numberName = 'No';
            var numberName2 = 'Order Number';
            var codeName = 'Code';
            var invoiceName = '*\xa0\xa0\*\xa0\xa0\*Invoice*\xa0\xa0\*\xa0\xa0\*';
            var quantityName = 'Quantity';
            var unitpriceName = 'Unit Price';
            var amountName = 'Amount';
            var poductName = 'Product Name';
            var taxRateName = 'Tax Rate:';
            var taxAmountName = 'Tax:';
            var custCode = 'Customer Code:';
            var destinationName = 'Delivery:';
            var totalName = 'Total';
            var consumptionTaxName = 'Tax';
            var invoiceName1 = 'Invoice';
            //20230731 CH756&CH757 by zdj start
//            var personName = 'Person:';
            var personName = 'PIC:';
            //20230731 CH756&CH757 by zdj end
            var memoName = 'Memo';
            //CH672 20230713 by zzq start
            var custName = 'Customer Name:';
            var addressNmae = 'Address:';
            var invoiceIssuerNumberName = 'Registered Number:';
            //CH672 20230713 by zzq end
            //CH672 20230721 by zzq start
            var stomach =  ' ';
            //CH672 20230721 by zzq end
         // CH756&CH757 20230731 by zdj start
//            if(invoiceCity){
//                invoiceCity = invoiceCity + '\xa0\xa0\xa0' + invoiceCountryEnAddress;
//            }else{
//                invoiceCity = invoiceCountryEnAddress;
//            }
         // CH756&CH757 20230731 by zdj end
          //�o���G�[�V�����x��  20230802 by zdj start
            var city = '';
            if(invoiceCity && invoiceZipcode){
                city = invoiceCity + '\xa0\xa0\xa0' + invoiceZipcode + '\xa0\xa0\xa0' + invoiceCountryEnAddress;
            }else if(invoiceCity && !invoiceZipcode){
                city = invoiceCity + '\xa0\xa0\xa0' + invoiceCountryEnAddress;
            }else if(invoiceZipcode && !invoiceCity){
                city = invoiceZipcode + '\xa0\xa0\xa0' + invoiceCountryEnAddress;
            }else{
                city = invoiceCountryEnAddress;
            }
            //�o���G�[�V�����x��  20230802 by zdj start
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
    '<#elseif .locale == "en">'+
    '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
    '</#if>'+
    '<macrolist>'+
    '<macro id="nlheader">'+
    '<table style="width: 660px; overflow: hidden; display: table;border-collapse: collapse;">'+
    '<tr>'+
    '<td>'+
    '<table style="font-weight: bold;width:335px;">'+
    '<tr style="height: 18px;" colspan="2"></tr>'+    
    '<tr>'+
    '<td style="border:1px solid black;" corner-radius="4%">'+
    '<table>'+
//    '<tr style="height:10px;"><td style="width:250px;"></td><td></td></tr>'+
    '<tr style="height:10px;"><td style="width:250px;"></td><td style="width:35px;"></td></tr>'+
    '<tr>'
     // CH756&CH757 20230731 by zdj start
    if (language == SYS_LANGUAGE_JP) {   
        str+='<td>��'+invoiceZipcode+'</td>'
    }else{
      //�o���G�[�V�����x��  20230802 by zdj start
//      str+='<td>&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceZipcode+'</td>'
      str+='<td>&nbsp;&nbsp;&nbsp;&nbsp;'+custNameText+'</td>'
      //�o���G�[�V�����x��  20230802 by zdj start
    }
     
    //'<td>��'+invoiceZipcode+'</td>'+
    //'<td align="right" style="margin-right:-22px;">&nbsp;'+entityid+'</td>'+
    str+='<td align="right" style="margin-right:-22px;">&nbsp;</td>'+
    '</tr>'+
    '<tr>'+
    // CH756&CH757 20230731 by zdj end
    '<td style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invAddress+'</td>'+
    //'<td align="right" style="padding-right: 30px;margin-top:-8px;">03</td>'+
    //'<td align="right" style="padding-right: 30px;margin-top:-8px;">&nbsp;</td>'+
    '</tr>'
 // CH756&CH757 20230731 by zdj start
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
//    if (custNameText) {
//        invoiceAddressDates.push(custNameText)
//    }
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
//    '<tr>'+
////    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'</td>'+
//    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+invoiceCity+'&nbsp;'+address1+'</td>'+
//    '</tr>'+
//    '<tr>'+
////    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address1+'</td>'+
//    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
//    '</tr>'+
//    '<tr>'+
////    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address2+'</td>'+
//    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
//    '</tr>'+
//    '<tr>'+
////    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+address3+'</td>'+
//    '<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(custNameText)+'</td>'+
//    '<td align="left" style="padding-bottom:0px;margin-top:-8px;">'+stomach+'</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td align="left" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(custNameText)+'</td>'+
//    '<td align="right" style="padding-right: 75px;padding-bottom:0px;margin-top:-8px;" colspan="2">�䒆</td>'+
//    '</tr>'+
    str+='<tr>'+
    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
    '</tr>'+
    //CH672 20230720 by zzq start
//    '<tr>'+
//    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
//    '</tr>'+
    ////CH672 20230720 by zzq end
//    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Tel:'+invPhone+'</td>'+
//    '</tr>'+
//    '<tr>'+
//    '<td colspan="2" style="margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;Fax:'+invFax+'</td>'+
//    '</tr>'+
    // CH756&CH757 20230731 by zdj start
    //'<tr style="height: 40px;"></tr>'+
    '<tr style="height: 30px;"></tr>'+
    // CH756&CH757 20230731 by zdj start
    '</table>'+
    '</td>'+
    '</tr>'+
    '</table>'+
    '</td>'+
    
    '<td style="padding-left: 30px;">'+
    // CH756&CH757 20230731 by zdj start
    //'<table style="width: 280px;font-weight: bold;">'+
    '<table style="width: 320px;font-weight: bold;">'+
    // '<tr>'+
    '<tr style="height: 25px;">'+
    '<td colspan="2">&nbsp;</td>'
    //'<td colspan="2" style="width:50%;margin-top:-16px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=15969&amp;'+URL_PARAMETERS_C+'&amp;h=xwGkaOObH6n1hx7iEIKK7IzXqcP3XDaiz3GzyhnaY1td5xCX" style="width:110px;height: 60px;" /></td>'+
    if(subsidiary == SUB_NBKK){
        str+='<td style=";margin-top:-16px;" rowspan="5"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id='+ NBKK_INSYOU_ID +'&amp;'+URL_PARAMETERS_C+'&amp;'+NBKK_INSYOU_URL+'" style="width:100px;height: 100px; position:absolute;top:25px;left:-88px;" /></td>'
    }else if(subsidiary == SUB_ULKK){
        str+='<td style=";margin-top:-16px;" rowspan="5"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id='+ ULKK_INSYOU_ID +'&amp;'+URL_PARAMETERS_C+'&amp;'+ULKK_INSYOU_URL+'" style="width:100px;height: 100px; position:absolute;top:29px;left:-34px;" /></td>'
    }else{
        str+='<td style=";margin-top:-16px;" rowspan="5">&nbsp;</td>'
    }
    //'<td style="margin-top:-16px;"><div><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=480236&amp;'+URL_PARAMETERS_C+'&amp;h=I4MoOlKGNT5wClfzyGHDmnp273JBVQ9BPk9YazigRcR_dkkh" style="width:100px;height: 100px; position:absolute;top:42px;left:-115px;" /></div></td>'+
    // CH756&CH757 20230731 by zdj end
    str+='</tr>'+
    //'<tr>'+
//    '<td colspan="2" style="margin-left:-32px;margin-top:-8px;">&nbsp;'+custSalesrep+'</td>'+
    //'</tr>'+
    '<tr>'+
    // CH756&CH757 20230731 by zdj start
    //'<td style="font-size:17px;margin-top:-5px;" colspan="2">'+invoiceNameEng+'&nbsp;</td>'+
    '<td style="font-size:17px;margin-top:-5px;" colspan="3">'+invoiceNameEng+'&nbsp;</td>'+
    // CH756&CH757 20230731 by zdj end
    '</tr>'+
    '<tr>'+
//    '<td style="font-size: 20px;margin-top:-2px;" colspan="3" >'+invoiceLegalname+'&nbsp;</td>'+
    '<td colspan="3" ><span style="font-size: 19px;font-family: heiseimin;" >'+invoiceLegalname+'</span>&nbsp;</td>'+
    '</tr>'+
    '<tr>'+
    // CH756&CH757 20230731 by zdj start
    //'<td colspan="2" style="font-size: 10px;margin-top:-2px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'&nbsp;</td>'+
    '<td colspan="3" style="font-size: 10px;margin-top:-2px;">'+invoiceIssuerNumberName+invoiceIssuerNumber+'&nbsp;</td>'+
    // CH756&CH757 20230731 by zdj end
    '</tr>'+
    '<tr>'+
    '<td colspan="2" style="font-size: 10px;margin-top:-2px;">��'+invoiceAddressZip+'&nbsp;</td>'+
    '</tr>'+
    '<tr>'+
    // CH756&CH757 20230731 by zdj start
    //'<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+invoiceAddressThree+'&nbsp;</td>'+
    '<td colspan="3" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressState+invoiceCitySub+invoiceAddress+invoiceAddressTwo+invoiceAddressThree+'&nbsp;</td>'+
    // CH756&CH757 20230731 by zdj end
    '</tr>'+
    '<tr>'+
    '<td style="font-size: 10px;margin-top:-4px;">TEL:&nbsp;'+invoicePhone+'</td>'+
    '<td style="font-size: 10px;margin-top:-4px;">FAX:&nbsp;'+invoiceFax+'</td>'+
   //CH655 20230725 add by zdj start
    '</tr>'+
    '<tr>'+
    // CH756&CH757 20230731 by zdj start
    //'<td colspan="2" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressEng+'</td>'+
    '<td colspan="3" style="font-size: 10px;margin-top:-4px;">'+invoiceAddressEng+'</td>'+
    // CH756&CH757 20230731 by zdj end
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
    //CH672 20230718 by zzq start
//    '<td style="width:510px;margin-top:-5px;margin-left:-20px;" colspan="2">IN-0R000060jpn</td>'+
    '<td style="width:510px;margin-top:-5px;margin-left:-20px;" colspan="2">&nbsp;</td>'+
    //CH672 20230718 by zzq start
    '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;" align="right"></td>'+
    '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
    '<td rowspan="2" style="width: 50px;height: 40px;border:1px solid black;border-top:none;border-left:none;" align="right"></td>'+
    '</tr>'+    
    '<tr>'+
    '<td style="width: 225px;">&nbsp;&nbsp;'+dateName+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
//    '<td style="width: 225px;">&nbsp;&nbsp;'+dateName+'&nbsp;&nbsp;&nbsp;'+trandate+'</td>'+
    //CH672 20230720 by zzq start
    //'<td style="width: 285px;margin-left:-25px;">'+deliveryName+'&nbsp;:&nbsp;&nbsp;'+delivery_date+'</td>'+
    '<td style="width: 285px;margin-left:-25px;">'+paymentName+'&nbsp;:&nbsp;'+payment+'</td>'+
    //CH672 20230720 by zzq end
    '<td style="width: 50px;"></td>'+
    '<td style="width: 50px;"></td>'+
    '<td style="width: 50px;"></td>'+
    '</tr>'+
    '<tr padding-top = "4px">';
    if(custLanguage == LANGUAGE_JP){
        str+='<td style="width: 225px;margin-top:-8px;">&nbsp;&nbsp;'+validterm+'&nbsp;&nbsp;'+Monthadd(trandate,1)+'</td>';
    }else{
        str+='<td style="width: 225px;margin-top:-8px;">&nbsp;&nbsp;validterm&nbsp;&nbsp;'+Monthadd(trandate,1)+'</td>';
    }
    
    //CH672 20230720 by zzq start
    //str+='<td style="width: 50px;margin-top:-8px;"></td>'
    //'<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+paymentName+'&nbsp;:'+payment+'</td>'+
    if(custLanguage == LANGUAGE_JP){
          str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">�[�i����&nbsp;:&nbsp;�������m�F���2~3����ɔ[�i</td>'
    }else{
          str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">TermsOfDelivery&nbsp;:&nbsp;�������m�F���2~3����ɔ[�i</td>'
      }    
    //CH672 20230720 by zzq end
    str+='<td style="width: 50px;margin-top:-8px;"></td>'+
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '</tr>'+
    '<tr  padding-top = "4px">'+
    //CH672 20230714 by zzq astart
//    '<td style="width: 300px;margin-top:-8px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+tranid+'/��&nbsp;:'+createdfrom+'</td>'+
//    '<td style="width: 225px;margin-top:-6px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'
    '<td style="width: 225px;margin-top:-6px;" >&nbsp;&nbsp;'+numberName+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+transactionnumber+'</td>'
    //CH672 20230714 by zzq end
//    '<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+':'+dealFugou(otherrefnum)+'<span style="text-align:right;padding-left:90px;">NBKKAS11</span></td>'+
    //CH672 20230718 by zzq start
//    '<td style="width: 255px;margin-top:-8px;padding-left:90px;" align="center" colspan="4">'+numberName2+':'+dealFugou(otherrefnumNew)+'<span style="text-align:right;padding-left:90px;">NBKKAS11</span></td>'+
    //CH672 20230720 by zzq start
    str+='<td style="width: 285px;margin-top:-6px;margin-left:-25px;">'+numberName2+' : '+dealFugou(otherrefnumNew)+'</td>'+
    //CH672 20230720 by zzq end
    //CH672 20230720 by zzq start
    //CH672 20230718 by zzq end
    '</tr>'+
    '<tr>'
    //'<td style="width: 225px;margin-top:-8px;">&nbsp;</td>';
    if(language == SYS_LANGUAGE_JP){
        str+='<td colspan="5" style="margin-left::-8px;">&nbsp;&nbsp;��&nbsp;&nbsp;�l&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dvyMemo+'</td>';
//        str+='<td colspan="5" style="margin-left::-8px;">&nbsp;&nbsp;���l:'+dvyMemo+'</td>';
    }else{
        str+='<td colspan="5" style="margin-left::-8px;">&nbsp;&nbsp;Memo&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dvyMemo+'</td>';
    }
//    if(custLanguage == LANGUAGE_JP){
//        str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">�[�i����&nbsp;:�������m�F���2~3����ɔ[�i</td>';
//    }else{
//        str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">TermsOfDelivery&nbsp;:�������m�F���2~3����ɔ[�i</td>';
//    }
    str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>';
    //str+='<td style="width: 285px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;</td>';
    str+=
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '</tr>'+
    '<tr  padding-top= "2px">'+
    //CH672 20230720 by zzq end
    //CH672 20230714 by zzq start
//    if(custLanguage == LANGUAGE_JP){
//    if(language == SYS_LANGUAGE_JP){
//        str+='<td style="width: 225px;margin-top:-8px;">&nbsp;&nbsp;���l:'+dvyMemo+'</td>';
//    }else{
//        str+='<td style="width: 225px;margin-top:-8px;">&nbsp;&nbsp;Memo:'+dvyMemo+'</td>';
//    }
    '<td colspan="5">&nbsp;&nbsp;�����b�ɂȂ��Ă���܂��B�����������܂������A���L�̒ʂ育�����\���グ�܂��B<br/>&nbsp;&nbsp;�������m�F��̏o�ׂƂȂ�܂��̂ŁA�w������ւ��U���ݒ����܂��l�A��낵�����肢�v���܂��B</td>'
   //CH672 20230714 by zzq end
   //CH672 20230720 by zzq start
//    if(custLanguage == LANGUAGE_JP){
//        str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">�S��&nbsp;:'+salesrepNew+'</td>';
//    }else{
//        str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">Bear&nbsp;:'+salesrepNew+'</td>';
//    }
    //str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+numberName2+' : '+dealFugou(otherrefnumNew)+'</td>';
    str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">&nbsp;&nbsp;&nbsp;</td>';
   //CH672 20230720 by zzq end
    str+=
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '</tr>'+
    '</table>'+
    '<table style="width: 660px;font-weight: bold;margin-top: 10px" padding-top = "-13px">'+
    //'<table style="width: 660px;font-weight: bold;padding = "3px">'+
    //style="width: 660px;margin-top: 10px;font-weight: bold;"
    // CH672 20230719 by zzq start
//    str+='<tr><td colspan="5">&nbsp;&nbsp;�����b�ɂȂ��Ă���܂��B�����������܂������A�̉��L�̒ʂ育�����\���グ�܂��B<br/>&nbsp;&nbsp;�������m�F��̏o�ׂƂȂ�܂��̂ŁA�w������ւ��U���ݒ����܂��l�A��낵�����肢�v���܂��B</td></tr>';
//    str+='<tr><td colspan="5">&nbsp;&nbsp;�����b�ɂȂ��Ă���܂��B�����������܂������A���L�̒ʂ育�����\���グ�܂��B<br/>&nbsp;&nbsp;�������m�F��̏o�ׂƂȂ�܂��̂ŁA�w������ւ��U���ݒ����܂��l�A��낵�����肢�v���܂��B</td></tr>';
//    // CH672 20230719 by zzq end
//    str+='<tr height="10px"></tr>';
    '<tr>';
    //CH672 20230720 by zzq end
    //CH672 20230714 by zzq start
//    if(custLanguage == LANGUAGE_JP){
//    if(language == SYS_LANGUAGE_JP){
//        str+='<td style="width: 225px;margin-top:-8px;margin-left:-2px;">&nbsp;&nbsp;���l:'+dvyMemo+'</td>';
//    }else{
//        str+='<td style="width: 225px;margin-top:-8px;margin-left:-2px;">&nbsp;&nbsp;Memo:'+dvyMemo+'</td>';
//    }
    str+='<td colspan="5" >&nbsp;&nbsp;���}���̏ꍇ�́A���U���ݍT�����󒍒����Ԃ܂łɒ�����p�ԍ���FAX�肢�܂��B</td>';
   //CH672 20230714 by zzq end
   //CH672 20230720 by zzq start
//    if(custLanguage == LANGUAGE_JP){
//        str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">�S��&nbsp;:'+salesrepNew+'</td>';
//    }else{
//        str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">Bear&nbsp;:'+salesrepNew+'</td>';
//    }
    //str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">'+numberName2+' : '+dealFugou(otherrefnumNew)+'</td>';
    //str+='<td style="width: 285px;margin-top:-8px;margin-left:-25px;">&nbsp;&nbsp;&nbsp;</td>';
   //CH672 20230720 by zzq end
    str+=
//    '<td style="width: 50px;margin-top:-8px;"></td>'+
//    '<td style="width: 50px;margin-top:-8px;"></td>'+
//    '<td style="width: 50px;margin-top:-8px;"></td>'+
    '</tr>'
    str+= '</table>';
    str+= '<table border="0" style="width: 660px;font-weight: bold;" padding-top = "4px">'; 
//    str+='<tr  style="border-bottom: 1px dashed black;">'+
    str+='<tr  style="border-bottom: 1px solid black;">'+
    '<td style="width: 130px;margin-top:-6px;">&nbsp;&nbsp;'+codeName+'</td>'+
    '<td style="width: 210px;margin-top:-6px;" align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+poductName+'</td>'+
    '<td style="width: 110px;margin-top:-6px;">&nbsp;&nbsp;'+quantityName+'</td>'+
    '<td style="width: 100px;margin-top:-6px;">&nbsp;&nbsp;'+unitpriceName+'</td>'+
    '<td style="width: 100px;margin-top:-6px;">&nbsp;&nbsp;'+amountName+'</td>'+
    '</tr>'+
    '</table>'+
    '</macro>'+
    '<macro id="nlfooter">'+
//    '<table style="border-top: 1px dashed black;width: 660px;font-weight: bold;">'+
    '<table style="border-top: 1px solid black;width: 660px;font-weight: bold;">'+
    '<tr style="padding-top:5px;">'+
    '<td style="width:220px;">&nbsp;&nbsp;'+custCode+entityid+'</td>';
    if(!isEmpty(incoicedelivery_Name)){
        str+='<td style="width:270px;">'+destinationName+'&nbsp;'+dealFugou(incoicedelivery_Name)+'</td>';
    }else{
        str+='<td style="width:270px;">'+destinationName+'</td>';
    }
    str+='<td style="width:80px;">&nbsp;&nbsp;'+totalName+'</td>'+
    '<td style="width:90px;" align="right">'+invoAmountTotal+'</td>'+
    '</tr>'+
    
    '<tr>'+
    //CH672 20230713 by zzq start
    //'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrep+'</td>';
    '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;'+personName+salesrepNew+'</td>';
    //CH672 20230713 by zzq start
    if(!isEmpty(invdestinationZip)){
        if(language == SYS_LANGUAGE_JP){
            str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��' + invdestinationZip + '</td>';
        }else{
            str += '<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��' + invdestinationZip + '</td>';
        }
    }
    str+='</tr>'+
    
    '<tr>'+
    //CH672 20230720 by zzq start
    //CH672 20230713 by zzq start
    //'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + custName +dealFugou(custNameText)+ '</td>';
    '<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
    //CH672 20230713 by zzq end
    //CH672 20230720 by zzq end
    if(!isEmpty(invdestinationState)){
        if(language == SYS_LANGUAGE_JP){
          str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
        }else{
          str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+invdestinationState+'</td>';
        }
    }else{
        str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
    }
    str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+consumptionTaxName+'</td>'+
//    '<td style="width:100px;margin-top:-8px;" align="right">'+parseFloat(invTaxmountTotal)+'</td>'+
    '<td style="width:100px;margin-top:-8px;" align="right">'+invTaxamount+'</td>'+
    '</tr>'+
    
    '<tr>'+
    //CH672 20230720 by zzq start
    //'<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;' + addressNmae  + dealFugou(invoiceAddressState) + '</td>';
    '<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;</td>';
    //CH672 20230720 by zzq end
    if(!isEmpty(invdestinationCity)&& !isEmpty(invdestinationAddress)){
        if(language == SYS_LANGUAGE_JP){
            str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationCity)+dealFugou(invdestinationAddress)+'</td>';
       }else{
            str+='<td style="width:420px;margin-top:-8px;" colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationCity)+dealFugou(invdestinationAddress)+'</td>';
            }
    }
    str+='</tr>'+
    
    '<tr>'+
    //CH672 20230720 by zzq start
    //CH672 20230713 by zzq start
    //'<td style="width:220px;margin-top:-8px;;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + dealFugou(invoiceCity) + '</td>';
    '<td style="width:220px;margin-top:-8px;;margin-left:26px"></td>'
    //CH672 20230713 by zzq end
    //CH672 20230720 by zzq end
    //'<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
    if(!isEmpty(invdestinationAddress2)){
        if(language == SYS_LANGUAGE_JP){
            str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress2)+'</td>';
        }else{
            str+='<td style="width:220px;margin-top:-8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress2)+'</td>';
            }
    }else{
        str+='<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
    }
    
    //CH672 20230714 by zzq start
    if(invoToTotal){
        invoToTotal = displaysymbol+invoToTotal
     }
    //CH672 20230714 by zzq end
    str+='<td style="width:100px;margin-top:-8px;">&nbsp;&nbsp;'+invoiceName1+'</td>'+
    '<td style="width:100px;margin-top:-8px;" align="right">'+invoToTotal+'</td>'+
    '</tr>'
    //CH672 20230713 by zzq start
//    '<tr>';
//    '<td style="width:220px;margin-top:-8px;">&nbsp;</td>';
    if(!isEmpty(invdestinationAddress3)){
        //CH672 20230720 by zzq start
        //str+='<tr><td style="margin-top:-8px;margin-left:26px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td>' +
        str+='<tr><td style="margin-top:-8px;margin-left:26px"></td>'
        //CH672 20230720 by zzq start
        if(language == SYS_LANGUAGE_JP){
            str+='<td style="width:220px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress3)+'</td></tr>';
        }else{
            str+='<td style="width:220px;margin-top:-8px;" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+dealFugou(invdestinationAddress3)+'</td></tr>';
        }
    }else{
        //CH672 20230720 by zzq start
        //str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address1 + '</td></tr>';
        str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>';
        //CH672 20230720 by zzq start
    }
        //str+='</tr>'
     //CH672 20230720 by zzq start
//        str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address2 + '</td></tr>' +
//             '<tr><td style="margin-top:-8px;margin-left:26px" colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + address3 + '</td></tr>' +
       str+='<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>' +
       '<tr><td style="margin-top:-8px;margin-left:26px" colspan="4"></td></tr>' +
       //CH672 20230713 by zzq end
       //CH672 20230720 by zzq start
    '</table>'+
    '<table style="width: 660px;font-weight: bold;">'
     //20230801 CH756&CH757 by zdj satrt
//    '<tr><td colspan="3" style="width:220px;margin-top:-8px;margin-left:7px;">�U������</td></tr>';
   // '<tr><td colspan="3" style="width:220px;margin-top:-8px;margin-left:7px;">'+Vibration+'</td></tr>';
       if(language == SYS_LANGUAGE_JP){
       if(bankName1){
           str+='<tr padding-top="1px">'+
         //�o���G�[�V�����x�� 20230803 add by zdj start
           '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankName1+'</td>'+
           '<td style="margin-top:-8px;margin-left:7px;width:18%">'+bankBranchName1+'</td>'+
           '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
           //'<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankNo1+'</td>'+
           '<td style="margin-top:-8px;margin-left:7px;width:22%">&nbsp;</td>'+
           '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
         //�o���G�[�V�����x�� 20230803 add by zdj end
//               '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName1+'</td>'+
//               '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName1+'</td>'+
//               '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
//             '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo1+'</td>'+
               '</tr>';
       };
//       if(bankName1 && bankName2){
//           str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
//       }
       if(bankName2){
         //�o���G�[�V�����x�� 20230803 add by zdj start
           str+='<tr padding-top="1px">'+
           '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankName2+'</td>'+
           '<td style="margin-top:-8px;margin-left:7px;width:18%">'+bankBranchName2+'</td>'+
           '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
//         '<td style="margin-top:-8px;margin-left:7px;width:20%">'+bankNo2+'</td>'+
           '<td style="margin-top:-8px;margin-left:7px;width:22%">&nbsp;</td>'+
           '<td style="margin-top:-8px;margin-left:7px;width:20%">&nbsp;</td>'+
         //�o���G�[�V�����x�� 20230803 add by zdj end
//           '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName2+'</td>'+
//           '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName2+'</td>'+
//           '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
//         '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo2+'</td>'+
           '</tr>';
   };
       }else{
           if(bankName1){
             //�o���G�[�V�����x�� 20230804 add by zdj start
               str+='<tr>'+
               '<td>&emsp;</td>'+
               '</tr>'
             //�o���G�[�V�����x�� 20230804 add by zdj end
           str+='<tr padding-top="1px">'+
//           '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName1+'</td>'+
//           '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName1+'</td>'+
////           '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
//           '<td style="margin-top:-8px;margin-left:7px;width:25%">'+swiftValue+'</td>'+
//           '<td style="margin-top:-8px;margin-left:7px;width:25%">'+bankNo1+'</td>'+
//         '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo1+'</td>'+
         //�o���G�[�V�����x�� 20230803 add by zdj start
           '<td  colspan = "3" style="margin-top:-8px;margin-left:7px;width:25%">'+bankName1+'&emsp;'+bankBranchName1+'&emsp;'+swiftValue+'&emsp;'+bankType1+bankNo1+'</td>'+
            //�o���G�[�V�����x�� 20230803 add by zdj end
           '</tr>';
           }
   };
//   if(bankName1 && bankName2){
//       str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
//   }
   //20230801 CH756&CH757 by zdj end
//    if(bankName1){
//        str+='<tr padding-top="1px">'+
//            '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName1+'</td>'+
//            '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName1+'</td>'+
//            '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType1+ '&nbsp;'+bankNo1+'</td>'+
////          '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo1+'</td>'+
//            '</tr>';
//    };
////    if(bankName1 && bankName2){
////        str+='<tr padding-top="1px"><td colspan="3" style="margin-top:3px"></td></tr>';
////    }
//    if(bankName2){
//        str+='<tr padding-top="1px">'+
//        '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankName2+'</td>'+
//        '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankBranchName2+'</td>'+
//        '<td style="margin-top:-8px;margin-left:7px;width:40%">'+bankType2+ '&nbsp;'+bankNo2+'</td>'+
////      '<td style="margin-top:-8px;margin-left:7px;width:30%">'+bankNo2+'</td>'+
//        '</tr>';
//};
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
    '<#elseif .locale == "en">'+
    'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
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
    
    // CH756&CH757 20230731 by zdj start
    //str+='<body header="nlheader" header-height="30%" padding="0.5in 0.5in 0.5in 0.5in" size="A4" footer="nlfooter" footer-height="12%">'+
    str+='<body header="nlheader" header-height="26%" padding="0.2in 0.5in 0.3in 0.5in" size="A4" footer="nlfooter" footer-height="9.5%">'+
    //'<table style="width: 660px;font-weight: bold;" padding-top="67px">';
    '<table style="width: 660px;font-weight: bold;" padding-top="112px">';
    // CH756&CH757 20230731 by zdj end
    for(var i = 0;i<itemLine.length;i++){
        //add by zzq CH672 20230719 start
        var itemQuantity = formatAmount1(itemLine[i].invoiceQuantity);
        
        str+='<tr>'+
//        '<td style="width: 130px;">&nbsp;&nbsp;'+itemLine[i].invoiceInitemid+'</td>'+
        '<td style="width: 130px;">'+itemLine[i].invoiceInitemid+'</td>'+
//        '<td style="width: 200px;">'+dealFugou(itemLine[i].invoiceDisplayName)+'</td>'+
        '<td style="width: 210px;">'+dealFugou(itemLine[i].invoiceDisplayName)+'</td>'+
//        '<td style="width: 110px;" align="center">&nbsp;&nbsp;'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>'+
        '<td style="width: 110px;" align="right">'+itemLine[i].invoiceQuantity+'&nbsp;'+itemLine[i].invoiceUnitabbreviation+'</td>'+
        '<td style="width: 100px;" align="right">'+itemLine[i].invoiceRateFormat+'</td>'+
        '<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceAmount+'</td>'+
        '</tr>';
      //add by zzq CH672 20230719 end
//        '<tr>'+
//        '<td style="width: 130px;">&nbsp;</td>'+
//        '<td style="width: 200px;">&nbsp;</td>'+
//        '<td style="width: 110px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'</td>';
//        if(custLanguage == LANGUAGE_JP){
//            str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//        }else{
//            str+='<td style="width: 100px;">'+itemLine[i].invoiceTaxrate1Format+'&nbsp;&nbsp;&nbsp;'+taxAmountName+'</td>';
//        }
//        str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemLine[i].invoiceTaxamount+'</td>'+
//        '</tr>';
    }
    for(var k = 0;k<resultItemTaxArr.length;k++){
        str+= '<tr>'+
        '<td style="width: 130px;margin-left: 36px;">&nbsp;</td>'+
        '<td style="width: 210px;">&nbsp;</td>'+
        '<td style="width: 110px;" align="right" colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;'+taxRateName+'&nbsp;'+resultItemTaxArr[k].invoiceTaxrate1Format+'&nbsp;&nbsp;'+taxAmountName+'</td>';
        var itemTaxamount = resultItemTaxArr[k].invoiceTaxamount;
        if(custLanguage == LANGUAGE_JP){
            if(!itemTaxamount){
                itemTaxamount = 0;
            }else{
                itemTaxamount = itemTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                itemTaxamount = itemTaxamount.split('.')[0];
            }
        }else{
            if(!itemTaxamount){
                itemTaxamount = '0.00';
            }else{
                itemTaxamount = itemTaxamount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            }
        }
        str+='<td style="width: 100px;" align="right">&nbsp;&nbsp;&nbsp;&nbsp;'+itemTaxamount+'</td>';
        
        str+='</tr>';
    }
    str+='</table>';
    str+='</body>';
    
    str += '</pdf>';
    var renderer = nlapiCreateTemplateRenderer();
    renderer.setTemplate(str);
    var xml = renderer.renderToString();
    
    // test
//    var xlsFileo = nlapiCreateFile('�O��������PDF' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
//
//    xlsFileo.setFolder(109338);
//    nlapiSubmitFile(xlsFileo);

    var xlsFile = nlapiXMLToPDF(xml);
    // PDF
    //CH762 20230811 add by zdj start
//  xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
//  xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
    xlsFile.setName('�O���������' + '_' + transactionPDF + '_' + getDateYymmddFileName() + '.pdf');
    //20230901 add by CH762 start
    //xlsFile.setFolder(SALESORDER_PDF_DJ_SALESORDERPDF);
    xlsFile.setFolder(SALESORDERPDF_ADDRESS);
    //20230901 add by CH762 end
    //CH762 20230811 add by zdj end
    xlsFile.setIsOnline(true);
    // save file
    var fileID = nlapiSubmitFile(xlsFile);
    var fl = nlapiLoadFile(fileID);  
    var url= URL_HEAD +'/'+fl.getURL();
    nlapiSetRedirectURL('EXTERNAL', url, null, null, null);

    }
    catch(e){
        nlapiLogExecution('debug', '�G���[', e.message)
    }
}
function defaultEmpty(src) {
    return src || '';
}
function Monthadd(Nowdate, num) {
    var date = nlapiStringToDate(Nowdate);
    date.setMonth(date.getMonth() + num);
    var month = date.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    var day = date.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    return date.getFullYear() + '/' + month + '/' + day;
}
function replace(text) {
    if (typeof (text) != "string")
        text = text.toString();

    text = text.replace(/,/g, "");

    return text;
}
function dealFugou(value) {
    var reValue = '';
    reValue = value.replace(new RegExp('&', 'g'), '&amp;').replace(new RegExp('&amp;lt;', 'g'), '&lt;') // [&]��u��������ƁA���X�G�X�P�[�v��������Ă���[<]���ω����邽�߁A�߂�
    .replace(new RegExp('&amp;gt;', 'g'), '&gt;');
    return reValue;
}
// Ch672 20230714 add by zzq start
function formatAmount1(str) {
    var tempStr = Number(str);
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
function formatAmount2(str) {
    var tempStr = Number(str);
    var str = String(tempStr);
    var newStr = "";
    var count = 0;
    if (str.indexOf(".") == -1) {
        for (var i = str.length - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + "," + newStr;
            } else {
                newStr = str.charAt(i) + newStr;
            }
            count++;
        }
        str = newStr + '.00';
    } else {
        for (var i = str.indexOf(".") - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + "," + newStr;
            } else {
                newStr = str.charAt(i) + newStr;
            }
            count++;
        }
        str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
    }
    return str;
}
function transfer(text){
    if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

return text ;
}
//Ch672 20230714 add by zzq start

//CH672 zzq 20230719 start
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
// CH672 zzq 20230719 end
function othChargeDisplayname(dpn, language) {
    var itemDisplayName = '';
    if (dpn) {
        invoiceDisplayName = dpn.split("/");
        if (language == SYS_LANGUAGE_JP) { // ���{��
            itemDisplayName = invoiceDisplayName[0];
            nlapiLogExecution('debug', 'itemDisplayNameJP', itemDisplayName);
        } else if (language == SYS_LANGUAGE_EN && invoiceDisplayName.length > 1) { // �p��
            itemDisplayName = invoiceDisplayName[1];
            nlapiLogExecution('debug', 'itemDisplayNameEN', itemDisplayName);
        } else {
            itemDisplayName = invoiceDisplayName[0];
        }
    }
    return itemDisplayName;
}
