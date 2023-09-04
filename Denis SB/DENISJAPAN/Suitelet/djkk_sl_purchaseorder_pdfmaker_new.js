/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Feb 2022     Rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {

    var purchaseorderId = request.getParameter('purchaseorderid');// purchaseOrderId�擾
    var roleSub = request.getParameter('roleSub');// purchaseOrderId�擾

    // var roleId = nlapiGetUser();
    // nlapiLogExecution('DEBUG', 'roleId',roleId);
    // var employee = nlapiLoadRecord('employee',roleId)
    // var roleSub = defaultEmpty(employee.getFieldValue('subsidiary'));
    nlapiLogExecution('debug', 'roleSub', roleSub);

    if (!isEmpty(purchaseorderId)) {

        // nlapiLogExecution('debug', 'purchaseorderId',purchaseorderId);
        var record = nlapiLoadRecord('purchaseorder', purchaseorderId);// purchaseOrderId�Ńf�[�^�擾
        var vendorId = record.getFieldValue('entity');// �d����ID���擾
        var vendorRecord = nlapiLoadRecord('vendor', vendorId);// �d����ID�Ŏd�����ʃf�[�^���擾
        var customForm = record.getFieldValue('customform');

        // changed add by song DENISJAPANDEV-1388 ���ӎ�����PO�̘g�O�ɏo�͂��� start
        var vendorPrecautions = defaultEmpty(vendorRecord.getFieldValue('custentity_djkk_precautions'));// �d����DJ_���ӎ������擾
        // changed add by song DENISJAPANDEV-1388 ���ӎ�����PO�̘g�O�ɏo�͂��� end
        var POFlag = record.getFieldValue('custbody_djkk_production_po_number');// POFLAG U762

        // DENISJAPANDEV-1383 zheng 20230302 start
        var DjLanguage = defaultEmpty(record.getFieldText('custbody_djkk_language')); // �u���{��v�Ɓu�p��v
        var POTitle = 'PURCHASE ORDER';
        if (DjLanguage != '�p��') {
            POTitle = '������';
        }
        if (POFlag == 'T') {
            POTitle = 'BLANKET PURCHASE ORDER';
            if (DjLanguage != '�p��') {
                POTitle = '�ꊇ������';
            }
        }
        // DENISJAPANDEV-1383 zheng 20230301 end

        // POFLAG U258
        var subtotal = record.getFieldValue('subtotal');
        var taxtotal = record.getFieldValue('taxtotal');
        var total = record.getFieldValue('total');
        var totalFormat = Number(total).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        var taxtotalFormat = Number(taxtotal).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

        // nlapiLogExecution('debug', 'taxtotal',taxtotal);

        // 20220815 add by zhou U139
        var language = record.getFieldValue('custbody_djkk_language');
        // end
        var vendorComments = record.getFieldValue('custbody_djkk_vendor_comments');

        // nlapiLogExecution('error', 'POFlag',POFlag);

        // 1 2 �d����̐������̂Ɛ�����Ɣz����̏����擾
        var vendorSearch = nlapiSearchRecord("vendor", null, [["internalid", "anyof", vendorId],
        // DENISJAPANDEV-1383 zheng 20230303 start
        'AND', ["address.isdefaultshipping", "is", "T"]
        // DENISJAPANDEV-1383 zheng 20230303 end
        ], [new nlobjSearchColumn("entityid"),// ID
        // new nlobjSearchColumn("companyname"),//��������
        new nlobjSearchColumn("addressee", "shippingAddress", null), // ���O�i�����Ǝv�� �m�F���j
        new nlobjSearchColumn("address", "shippingAddress", null),// �Z��
        new nlobjSearchColumn("attention", "shippingAddress", null),// �����i�S���ҁj
        new nlobjSearchColumn("addressphone", "shippingAddress", null),// �d�b�ԍ��i�Z���j
        new nlobjSearchColumn("custrecord_djkk_address_fax", "shippingAddress", null),// FAX�i�J�X�^���j
        new nlobjSearchColumn("isdefaultbilling", "shippingAddress", null), // �f�t�H���g������Z��
        new nlobjSearchColumn("isdefaultshipping", "shippingAddress", null),// �f�t�H���g�z����Z��
        new nlobjSearchColumn("custrecord_djkk_address_state", "shippingAddress", null), // �s���{��
        new nlobjSearchColumn("city", "shippingAddress", null), // �s����
        new nlobjSearchColumn("address", "shippingAddress", null), // �A�h���X
        new nlobjSearchColumn("shipaddress1"), new nlobjSearchColumn("shipaddress2"), new nlobjSearchColumn("shipaddress3"),

        // new nlobjSearchColumn("billaddress"), //������Z��
        // new nlobjSearchColumn("billaddress1"),//������ �Z��1
        // new nlobjSearchColumn("billaddress2"), //������Z��2
        // new nlobjSearchColumn("billaddress3"), //������Z��3
        // new nlobjSearchColumn("billcountry"), //�����捑
        // new nlobjSearchColumn("billattention"), //�����戶���i�S���ҁj
        // new nlobjSearchColumn("billcity"), //������s�撬��
        // new nlobjSearchColumn("billzipcode"), //������X�֔ԍ�
        // // new nlobjSearchColumn("billstate"), //������s���{��
        // // new nlobjSearchColumn("state","billingAddress",null),
        // new nlobjSearchColumn("custrecord_djkk_address_state","billingAddress",null), //������s���{��
        //
        // new nlobjSearchColumn("billphone"),//������d�b�ԍ�
        // new nlobjSearchColumn("custrecord_djkk_address_fax","billingAddress",null)

        // ������ɏZ���̎擾���@��ύXstart3.18
        new nlobjSearchColumn("address1", "billingAddress", null), // ������ �Z��1
        new nlobjSearchColumn("address2", "billingAddress", null), // ������Z��2
        new nlobjSearchColumn("address3", "billingAddress", null), // ������Z��3
        new nlobjSearchColumn("address"), // ������Z��
        // new nlobjSearchColumn("address"), //������Z��
        // ������ɏZ���̎擾���@��ύXend3.18

        new nlobjSearchColumn("country", "billingAddress", null), // �����捑
        new nlobjSearchColumn("attention", "billingAddress", null), // �����戶���i�S���ҁj
        new nlobjSearchColumn("city", "billingAddress", null), // ������s�撬��
        new nlobjSearchColumn("zipcode", "billingAddress", null), // ������X�֔ԍ�
        new nlobjSearchColumn("custrecord_djkk_address_state", "billingAddress", null), // ������s���{��
        // ������ɓd�bFAX�̎擾���@��ύXstart3.18
        // new nlobjSearchColumn("addressphone","billingAddress",null), //������d�b�ԍ�
        // new nlobjSearchColumn("custrecord_djkk_address_fax","billingAddress",null)//������Fax
        new nlobjSearchColumn("phone"), // ������d�b�ԍ�
        new nlobjSearchColumn("fax"), // ������Fax

        // ������ɓd�bFAX�̎擾���@��ύXend3.18
        ]);
        // var vendorAddrDetails = [];

        // vendorSearch�̒l��null�̔��f

        // �z����
        var shipEntityid = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("entityid")));
        var shipAddressee = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("addressee", "shippingAddress", null)));
        // var shipAddressee = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("address")));
        var shipAttention = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("attention", "shippingAddress", null)));
        var shipAddressphone = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("addressphone", "shippingAddress", null)));
        var shipCustrecord_djkk_address_fax = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("custrecord_djkk_address_fax", "shippingAddress", null)));
        var isdefaultbilling = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("isdefaultbilling", "shippingAddress", null)));
        var isdefaultshipping = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("isdefaultshipping", "shippingAddress", null)));

        var shipState = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("custrecord_djkk_address_state", "shippingAddress", null)));
        var shipCity = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("city", "shippingAddress", null)));
        var shipAddress1 = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("shipaddress1")));
        var shipAddress2 = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("shipaddress2")));
        var shipAddress3 = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("shipaddress3")));
        if (!isEmpty(shipAddress3)) {
            nlapiLogExecution('debug', 'shipAddress3', shipAddress3)
        }
        var shipAddress = shipAddress1 + shipAddress2 + shipAddress3;

        // ������
        // ������ɏZ���̎擾���@��ύXstart3.18
        var billaddress1 = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("address1", "billingAddress", null)));
        var billaddress2 = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("address2", "billingAddress", null)));
        var billaddress3 = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("address3", "billingAddress", null)));
        var billaddress = billaddress1 + billaddress2 + billaddress3;// 20230208 changed by zhou

        var billcountry = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("country", "billingAddress", null)));
        // ������ɉc�ƒS���҂̎擾���@��ύXstart3.18 �ύXrollback3.22
        var billattention = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("attention", "billingAddress", null)));
        // ������ɉc�ƒS���҂̎擾���@��ύXend3.18
        // var billaddress = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("address")));

        var billcity = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("city", "billingAddress", null)));
        var billzipcode = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("zipcode", "billingAddress", null)));
        // var billstate = defaultEmpty(isEmpty(vendorSearch) ? '' : vendorSearch[0].getValue("billstate"));
        var billstate = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("custrecord_djkk_address_state", "billingAddress", null)));

        // ������ɓd�bFAX�̎擾���@��ύXstart3.22 rollback
        var billphone = defaultEmpty(isEmpty(vendorSearch) ? '' : vendorSearch[0].getValue("addressphone", "billingAddress", null));
        var billCustrecord_djkk_address_fax = defaultEmpty(isEmpty(vendorSearch) ? '' : vendorSearch[0].getValue("custrecord_djkk_address_fax", "billingAddress", null));
        // var billphone = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("phone")));
        // var billCustrecord_djkk_address_fax = defaultEmpty(isEmpty(vendorSearch) ? '' : transfer(vendorSearch[0].getValue("fax")));
        // ������ɓd�bFAX�̎擾���@��ύXend3.22 rollback

        // �d�b
        // var phone =vendorRecord.getFieldValue('phone');
        // fax
        // var fax = vendorRecord.getFieldValue('fax');
        var billaddress = nlapiLoadRecord('vendor', vendorId).getFieldValue('defaultaddress');
        // var billaddress = billstate + billcity + billaddress1 + billaddress2 + billaddress3;
        // ������ɏZ���̎擾���@��ύXend3.18
        if (roleSub != SUB_SCETI && roleSub != SUB_DPKK) {
            var billArray = [];
            if (!isEmpty(billattention)) {
                billArray = billaddress.split(billattention);
                nlapiLogExecution('debug', 'billArray', billArray)
                if (billArray.length == 2) {
                    if (!isEmpty(billArray[0])) {
                        billaddress = billArray[0];
                    } else {
                        billaddress = billArray[1];
                    }
                }
            }
        }

        // 3 �A����� �A����ʂŏZ��INFO�f�[�^���擾
        var subsidiary = record.getFieldValue('subsidiary');
        var subsidiarySearch = nlapiSearchRecord("subsidiary", null, [["internalid", "anyof", subsidiary]], [new nlobjSearchColumn("custrecord_djkk_address_fax", "address", null), new nlobjSearchColumn("custrecord_djkk_address_state", "address", null), new nlobjSearchColumn("city", "address", null), new nlobjSearchColumn("address1", "address", null), new nlobjSearchColumn("address2", "address", null), new nlobjSearchColumn("address3", "address", null),
                new nlobjSearchColumn("phone", "address", null), new nlobjSearchColumn("zip", "address", null), new nlobjSearchColumn("custrecord_djkk_mail", "address", null), new nlobjSearchColumn("custrecord_djkk_subsidiary_type"), new nlobjSearchColumn("legalname"), new nlobjSearchColumn("name"), new nlobjSearchColumn("custrecord_djkk_subsidiary_url"), new nlobjSearchColumn("custrecord_djkk_mainaddress_eng"), // �Z���p��
                new nlobjSearchColumn("custrecord_djkk_subsidiary_en"),
                // DENISJAPANDEV-1383 zheng 20230303 start
                new nlobjSearchColumn("namenohierarchy")
        // DENISJAPANDEV-1383 zheng 20230303 end
        ]);
        var subsidiaryProvince = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("custrecord_djkk_address_state", "address", null)));
        var subsidiaryCity = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("city", "address", null)));
        var subsidiaryAddr1 = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("address1", "address", null)));
        var subsidiaryAddr2 = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("address2", "address", null)));
        var subsidiaryAddr3 = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("address3", "address", null)));
        // var subsidiaryAddr= subsidiaryAddr1+subsidiaryAddr2+subsidiaryAddr3;���ꔻ�f��������܂�
        // Fax
        var subsidiaryFax = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("custrecord_djkk_address_fax", "address")));
        // Tel
        var subsidiaryTel = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("phone", "address")));
        // email
        var email = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("custrecord_djkk_mail", "address", null)));
        // ��������
        var legalname = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("legalname")));
        // ���O
        var name = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("name")));
        // DENISJAPANDEV-1383 zheng 20230303 start
        // ���O(�K�w�Ȃ�)
        var namenohierarchy = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("namenohierarchy")));
        // DENISJAPANDEV-1383 zheng 20230303 end
        // �ꏊ
        var subsidiaryZip = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("zip", "address", null)));
        // �Z���p��
        var subsidiaryAddEn = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("custrecord_djkk_mainaddress_eng")));

        // ��Ж��O�p��
        var custrecord_djkk_subsidiary_en = defaultEmpty(isEmpty(subsidiarySearch) ? '' : transfer(subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_en")));

        // nlapiLogExecution('ERROR', 'subsidiaryAddEn', subsidiaryAddEn);

        // LogoURL
        var subsidiaryLogoURLCurrent = defaultEmpty(isEmpty(subsidiarySearch) ? '' : subsidiarySearch[0].getValue("custrecord_djkk_subsidiary_url"));

        var subsidiaryLogoURL = transfer(subsidiaryLogoURLCurrent);

        // nlapiLogExecution('debug', 'subsidiaryLogoURL', subsidiaryLogoURL);
        // nlapiLogExecution('debug', 'subsidiaryZipAndCountryEn', subsidiaryAddArrayEn[5]);

        // 4 �]�ƈ����
        var employeePhone = '';
        var employeeFax = '';
        var employeelastname = '';
        var employeefirstname = '';

        var employeeId = record.getFieldValue('employee');// �]�ƈ�ID���擾
        if (employeeId != null) {
            var employeeSearch = nlapiSearchRecord("employee", null, [["internalid", "is", employeeId]], [new nlobjSearchColumn("phone"), new nlobjSearchColumn("fax"), new nlobjSearchColumn("lastname"), new nlobjSearchColumn("firstname")]);

            employeePhone = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("phone")));// �]�ƈ��d�b
            employeeFax = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("fax")));// �]�ƈ��t�@�b�N�X
            employeelastname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("lastname")));// �]�ƈ�lastname
            employeefirstname = defaultEmpty(isEmpty(employeeSearch) ? '' : transfer(employeeSearch[0].getValue("firstname")));// �]�ƈ�firstname

        }

        // 5�C���R�^�[���ƃC���R�^�[���ꏊ�i��������ʂɎ擾�o����j
        var incoterm = defaultEmpty(record.getFieldText('custbody_djkk_incoterm'));
        var incotermSiteValue = defaultEmpty(record.getFieldValue('custbody_djkk_po_incoterms_location'));
        // nlapiLogExecution('debug', 'incoterm', incoterm);
        // nlapiLogExecution('debug', 'incotermSiteValue', incotermSiteValue);

        // 6PO��DJ_�C���R�^�C�����t��ǉ�
        var incotermTime = defaultEmpty(record.getFieldValue('custbody_djkk_incoterm_data'));
        var incotermTimeFormat = '';
        if (incotermTime != '') {
            incotermTimeFormat = formatDate(new Date(incotermTime));
        }

        // �A�C�e�����擾
        var itemDetails = [];// �S�A�C�e��Tab�̏��
        var itemIdArray = [];// �A�C�e��ID�z��
        var itemIdMP = [];// �A�C�e���̏��i�R�[�h
        var itemDetails2 = [];// �A�C�e��Tab�ɃA�C�e�����A���i�R�[�h�A�d����揤�i�R�[�h�ۑ��p�̔z��
        var amountTotal = 0;
        var itemList = record.getLineItemCount('item');// �A�C�e�����ו�
        if (itemList != 0) {
            for ( var s = 1; s <= itemList; s++) {
                var item = defaultEmpty(record.getLineItemValue('item', 'item', s));// �A�C�e��ID
                var description = defaultEmpty(record.getLineItemValue('item', 'description', s));// ����
                var quantity = defaultEmpty(parseFloat(record.getLineItemValue('item', 'quantity', s)));// ����
                // var quantityFormat = defaultEmptyToZero(quantity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));

                var units_display = defaultEmpty(record.getLineItemValue('item', 'units_display', s));// �P��
                var unitsArray;// �P��array
                var unit = defaultEmpty();// pdf�o�͗p�P��
                if (!isEmpty(language) && !isEmpty(units_display) && customForm == 169) {
                    var unitSearch = nlapiSearchRecord("unitstype", null, [["abbreviation", "is", units_display]], [new nlobjSearchColumn("abbreviation")]);
                    if (unitSearch != null) {
                        if (language == '13') { // �p��
                            units_display = unitSearch[0].getValue('abbreviation') + '';
                            unitsArray = units_display.split("/");
                            if (unitsArray.length == 2) {
                                unit = unitsArray[1];
                                nlapiLogExecution('debug', 'unit', unit)
                                nlapiLogExecution('debug', 'unitsArray', unitsArray)
                            }
                        } else if (language == '26') { // ���{��
                            units_display = unitSearch[0].getValue('abbreviation') + '';
                            unitsArray = units_display.split("/");
                            if (!isEmpty(unitsArray)) {
                                unit = unitsArray[0];
                            } else if (unitsArray.length == 0) {
                                unit = units_display;
                            }
                        }
                    }
                }
                var origrate = defaultEmptyToZero(parseFloat(record.getLineItemValue('item', 'origrate', s)));// �P��
                var origrateFormat = origrate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

                var amount = defaultEmptyToZero(parseFloat(record.getLineItemValue('item', 'amount', s)));// ���z
                var amountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

                amountTotal += amount;

                // DENISJAPANDEV-1383 zheng 20230303 start
                var quantityFormat = formatAmount2(quantity.toString());
                // DENISJAPANDEV-1383 zheng 20230303 end
                itemIdArray.push(item);
                itemDetails.push({
                    item : item,
                    units_display : defaultEmpty(unit),
                    amount : amountFormat,
                    quantity : quantityFormat,
                    origrate : origrateFormat,
                    description : description
                });
                // nlapiLogExecution('debug', 'units_display', itemDetals[0].amount);

            }
        } else {
            itemDetails.push({
                item : '',
                units_display : '',
                amount : '',
                quantity : '',
                origrate : '',
                description : '',
                itemName : '',
                itemCode : '',
                vendorItemCode : ''
            });
        }
        var amountTotalFormat = amountTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        nlapiLogExecution('error', 'itemIdArray', itemIdArray);
        if (itemIdArray.length) {
            var itemSearch = nlapiSearchRecord("item", null, // ��item�\���r��
            [["internalid", "anyof", itemIdArray]], [new nlobjSearchColumn("internalid"), new nlobjSearchColumn("itemid"), new nlobjSearchColumn("vendorname"), new nlobjSearchColumn("displayname"), new nlobjSearchColumn("custitem_djkk_product_name_jpline1"),// DJ_�i���i���{��jLINE1
            new nlobjSearchColumn("custitem_djkk_product_name_jpline2"), // DJ_�i���i���{��jLINE2
            new nlobjSearchColumn("custitem_djkk_product_name_line1"), // DJ_�i���i�p��jLINE1
            new nlobjSearchColumn("custitem_djkk_product_name_line2"),// DJ_�i���i�p��jLINE2
            new nlobjSearchColumn("custitem_djkk_product_code"),// DJ_�J�^���O���i�R�[�h
            new nlobjSearchColumn("upccode")// EAN�R�[�h
            ]);
            if (!isEmpty(itemSearch)) {
                for ( var n = 0; n < itemSearch.length; n++) {
                    var itemId = defaultEmpty(itemSearch[n].getValue('internalid'));// ���ID
                    var itemType = nlapiLookupField('item', itemId, 'recordtype')
                    var itemid = defaultEmpty(itemSearch[n].getValue('itemid'));
                    itemIdMP[n] = itemid;// 8.1���i�R�[�h
                    nlapiLogExecution('debug', 'itemIdMP[n]', itemIdMP[n]);
                    var vendorname = defaultEmpty(itemSearch[n].getValue('vendorname'));// 8.2�d���揤�i�R�[�h
                    nlapiLogExecution('debug', 'vendorname', vendorname);
                    var itemName = defaultEmpty(itemSearch[n].getValue('displayname'));// 7�A�C�e�����O
                    var itemName1;// DJ_�i��LINE1
                    var itemName2;// DJ_�i��LINE2
                    if (language == '13') { // �p��
                        itemName1 = defaultEmpty(itemSearch[n].getValue('custitem_djkk_product_name_line1'));// DJ_�i���i�p��jLINE1
                        itemName2 = defaultEmpty(itemSearch[n].getValue('custitem_djkk_product_name_line2'));// DJ_�i���i�p��jLINE2
                    } else if (language == '26') { // ���{��
                        itemName1 = defaultEmpty(itemSearch[n].getValue('custitem_djkk_product_name_jpline1'));// DJ_�i���i���{��jLINE1
                        itemName2 = defaultEmpty(itemSearch[n].getValue('custitem_djkk_product_name_jpline2'));// DJ_�i���i���{��jLINE2
                    }
                    var productCode = defaultEmpty(itemSearch[n].getValue('custitem_djkk_product_code'));// DJ_�J�^���O���i�R�[�h
                    var upcCode = defaultEmpty(itemSearch[n].getValue('upccode'));// EAN�R�[�h
                    for ( var j = 0; j < itemDetails.length; j++) {
                        if (itemDetails[j].item == itemId) {
                            itemDetails[j].itemType = itemType;
                            itemDetails[j].itemName = itemName;
                            itemDetails[j].itemCode = itemIdMP[n];
                            itemDetails[j].vendorItemCode = vendorname;
                            itemDetails[j].itemName1 = itemName1;
                            itemDetails[j].itemName2 = itemName2;
                            itemDetails[j].productCode = productCode;
                            itemDetails[j].upcCode = upcCode;
                        }
                    }

                }
            }
        }

        // ������ɉc�ƒS���҂��擾start3.22
        var salesrepresentative = transfer(defaultEmpty(record.getFieldValue('custbody_djkk_sales_representative')));
        var salesrepresentativeCh = '';

        // �Ǔ_
        var comma = '';
        if (salesrepresentative != '') {
            comma = '�A';
            salesrepresentativeCh = nlapiLookupField('employee', salesrepresentative, ['firstname', 'lastname'])
        }
        // end3.22

        // 9�A����񁨃f�[�^�̎擾��[1]�Ɠ����͂��iField�͉p����擾�j

        // 10PO�w�b�_�[�փR�����g
        // U161
        var poComment = '';

        if (customForm = 110) {//
        // poComment = transfer(defaultEmpty(record.getFieldValue('memo')));
            poComment = transfer(defaultEmpty(record.getFieldValue('custbody_djkk_vendor_comments')));// 20220901 changed by zhou
        } else {
            poComment = transfer(defaultEmpty(record.getFieldValue('custbody_djkk_vendor_comments')));
        }

        // 11�d����R�[�h
        var vendorCode = transfer(defaultEmpty(vendorRecord.getFieldValue('entityid')));

        // 12�Z�N�V����
        var section = transfer(defaultEmpty(record.getFieldValue('department')));

        // 13��̗\����i�[�i�\����j����̊�]��
        var receiptedScheduleDate = defaultEmpty(record.getFieldValue('duedate'));

        // 14���P�[�V����
        var location = transfer(defaultEmpty(record.getFieldText('location')));

        // DENISJAPANDEV-1383 zheng 20230301 start
        // 15DJ_����
        // var DjLanguage = defaultEmpty(record.getFieldText('custbody_djkk_language')); //�u���{��v�Ɓu�p��v
        // DENISJAPANDEV-1383 zheng 20230301 end

        // 16�A�����O
        // var subsidiaryName

        // 17�������́i�d���於�j�d�����̖��O�Ǝv��
        var companyname = transfer(defaultEmpty(vendorRecord.getFieldValue('companyname')));

        // 18���t(�������̔F��)
        // var purchaseDate = new Date(record.getFieldValue('trandate'));
        // DENISJAPANDEV-1383 zheng 20230302 start
        // var purchaseDate = new Date();
        var purchaseDate = getSystemTime();
        // DENISJAPANDEV-1383 zheng 20230302 end
        var purchaseDateFormat = formatDate2(purchaseDate);

        // 19PO�ԍ�
        var poNumber = transfer(record.getFieldValue('transactionnumber'));
        // var poNumber = defaultEmpty(record.getFieldValue('custbody_djkk_production_po_number')) ;

        // 20�ʉ�
        var currency = transfer(defaultEmpty(record.getFieldText('currency')));

        // 21�x������ 3.18
        var paymentTerms = '';
        var paymentTermsAll = transfer(defaultEmpty(record.getFieldText('terms')));
        var paymentTermsArray = paymentTermsAll.split("/");

        // 22�Œ荀�ږ�
        if (DjLanguage == '�p��') {
            var FixedNameDate = 'Date :';
            var FixedNamePoNo = 'P/O No:';
            var FixedNameTo = 'To:';
            var FixedNameTel = 'Tel:';
            var FixedNameFax = 'Fax:';
            var FixedNameShipTo = 'Ship to:';
            var FixedNameBillTo = 'Bill to:';
            var FixedNameTradeTerms = 'TRADE TERMS:';
            var FixedNamePaymentTerms = 'PAYMENT TERMS:';
            var FixedNameReference = 'Reference';
            var FixedNameProductDescription = 'Product Description';
            var FixedNameQuantity = 'Quantity';
            var FixedNameUnitPrice = 'Unit Price';
            var FixedNameTotalPrice = 'Total Price';
            var FixedNamePage = 'Page:';
            var FixedNameOrderTitle = 'WE ARE PLEASED TO PLACE AN ORDER UNDER THE FOLLOWING CONDITIONS:';
            var FixedNameLaTest = 'LATEST';
            var FixedNameOrderConfirm1 = 'PLEASE SET AUTHORIZED PERSON SIGN TO CONFIRM ORDER';
            var FixedNameOrderConfirm2 = 'ACCEPTANCE AND SEND IT TO US BY RETURN:';
            var FixedNameReceptionDate = 'RECEPTION DATE:';
            var FixedNameAuthorizedSignautre = 'AUTHORIZED SIGNAUTRE:';
            var FixedNameCitStamp = 'CIT.STAMP:';
            var FixedNameAttn = 'ATTN:';
            var FixedNamePersonInCharge = 'Person in charge:';
            var Precautions = 'Precautions:';
            var subsidiaryAddr = subsidiaryAddEn;// 3.18added
            if (paymentTermsArray.length == 2) {
                paymentTerms = paymentTermsArray[1];
            }
            // billToName�ݒ�
            name = custrecord_djkk_subsidiary_en;

            // DENISJAPANDEV-1383 zheng 20230302 start
            var FixedNameSubTotal = 'SubTotal';
            var FixedNameTaxTotal = 'TaxTotal';
            var FixedNameTotal = 'Total';
            // DENISJAPANDEV-1383 zheng 20230302 end
            // var FixedNameTaxtotal = 'taxtotal';
            // var FixedNameSubtotal = 'subtotal';
            // var FixedNameTotal = 'total';

        } else {
            var FixedNameDate = '���t :';
            var FixedNamePoNo = '�������ԍ� :';
            var FixedNamePageNo = '�y�[�W�ԍ� :';
            var FixedNameTo = '�S���ҁF';
            var FixedNameTel = 'Tel�F';
            var FixedNameFax = 'Fax�F';
            var FixedNameShipTo = '�z����:';
            var FixedNameBillTo = '������:';
            var FixedNameTradeTerms = '������� :';
            var FixedNamePaymentTerms = '�x�������� :';
            var FixedNameReference = '�i�R�[�h';
            var FixedNameProductDescription = '����';
            var FixedNameQuantity = '����';
            var FixedNameUnitPrice = '�P��/��';
            var FixedNameTotalPrice = '���z';
            var FixedNamePage = '�y�[�W�ԍ�:';
            var FixedNameOrderTitle = '�ȉ��̏����ł��������������܂�:';
            var FixedNameLaTest = '�ŐV';
            var FixedNameOrderConfirm1 = '�������m�F���邽�߂ɋ����ꂽ�l�̃T�C����ݒ肵�Ă�������';
            var FixedNameOrderConfirm2 = '�������ĕԑ����Ă��������F';
            var FixedNameReceptionDate = '��t��:';
            var FixedNameAuthorizedSignautre = '���F���ꂽ����:';
            var FixedNameCitStamp = 'CIE�X�^���v:';
            var FixedNameAttn = '�S����:';
            var FixedNamePersonInCharge = '�]�ƈ�:';
            var Precautions = '���ӎ���:';
            // DENISJAPANDEV-1383 zheng 20230302 start
            var FixedNameSubTotal = '���v';
            var FixedNameTaxTotal = '�����';
            var FixedNameTotal = '���v';
            // DENISJAPANDEV-1383 zheng 20230302 end
            var subsidiaryAddr = subsidiaryAddr1 + subsidiaryAddr2 + subsidiaryAddr3;// 3.18added
            if (paymentTermsArray.length == 2) {
                paymentTerms = paymentTermsArray[0];
            }
        }

    }

    var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">' + '<pdf>' + '<head>' + '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />' + '<#if .locale == "zh_CN">'
            + '<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />' + '<#elseif .locale == "zh_TW">' + '<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />' + 'javascript:NLMultiButton_doAction(\'multibutton_pdfsubmit\', \'submitas\');return false;	<#elseif .locale == "ja_JP">'
            + '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />' + '<#elseif .locale == "ko_KR">' + '<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />' + '<#elseif .locale == "th_TH">'
            + '<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />' + '</#if>' + '<macrolist>' + '<macro id="nlheader">' + '<table style="width: 660px;height: 40px; overflow: hidden; display: table;border-collapse: collapse;"><tr style="border-bottom:2px solid #6F8CAD;color:#4678d0;font-size:1.3em;margin-bottom:0.8em;">' + '<td align="left" style="width:30%; padding: 0em 0em 0.3em 1.3em;"><img src="'
            + subsidiaryLogoURL
            + '" style=" height: 30px; margin-top: 0px; float: left;" /></td>'
            + '<td align="right" style="padding: 0em 0em 0em 0em;font-size:16pt;" valign="middle"><span>'
            + legalname
            + '</span></td>'
            + '</tr></table>'
            + '<table style="margin:0 0.2in 0.2in; width:660px;border:2px solid #6F8CAD;" cellpadding="2" cellspacing="1">'
            + '	<tr>'
            + '		<td></td>'
            + '	</tr>'
            + '	<tr>'
            + '		<td align="right" colspan="25">&nbsp;</td>'
            + '		<td align="center" colspan="50" >'
            + POTitle
            + '</td>'
            + '		<td align="right" colspan="25">'
            + FixedNameDate
            + purchaseDateFormat
            + '</td>'
            + '	</tr>'
            + '	<tr>'
            + '		<td align="right" colspan="25"></td>'
            + '		<td colspan="50">&nbsp;</td>'
            + '		<td align="right" colspan="25">'
            + FixedNamePoNo
            + poNumber
            + '</td>'
            + '	</tr>'
            + '</table>'
            + ''
            + '<table cellpadding="2" cellspacing="2" style="width:660px;margin:0 0.2in;">'
            + '<tr>'
            + '<td style="width: 300px; border-bottom: 1px solid black;">'
            + companyname
            + '</td>'
            + '</tr>'
            + '<tr>'
            + '<td style="height: 17px;">&nbsp;&nbsp;&nbsp;&nbsp;'
            + billstate
            + billcity
            + '</td>'
            + '<td style="padding-left:10px;height: 17px;">'
            + FixedNameTo
            + billattention
            + '</td>'
            + '</tr>'
            + '<tr>'
            + '<td style="padding-left:20px;height: 17px;">&nbsp;&nbsp;&nbsp;&nbsp; '
            + billaddress
            + '</td>'
            + '<td style="padding-left:10px;height: 17px;">'
            + FixedNameTel
            + billphone
            + '</td>'
            + '</tr>'
            + '<tr>'
            + '<td style="padding-left:20px;height: 17px"></td>'
            + '<td style="padding-left:10px;height: 17px;">'
            + FixedNameFax
            + billCustrecord_djkk_address_fax
            + '</td>'
            + '<td align="right" style="width: 220px;height: 17px;">'
            + FixedNamePage
            + ' &nbsp; <pagenumber/>&nbsp;/<totalpages/>&nbsp;</td>'
            + '</tr>'
            + '</table>'
            + '&nbsp;'
            + ''
            + '<p style="margin-left: 0.2in">'
            + FixedNameOrderTitle
            + '</p>'
            + ''
            + '<table style="width: 660px;" align="center">'
            + '<tr>'
            + '<td style="width: 65px;height: 17px;">'
            + FixedNameShipTo
            + '</td>'
            + '<td style="width: 230px;">' + shipAddressee + '</td>' + '<td style="width: 65px;">' + FixedNameBillTo + '</td>' +
            // DENISJAPANDEV-1383 zheng 20230303 start
            // '<td style="width: 300px;">' + name + '</td>'+
            '<td style="width: 300px;">' + namenohierarchy + '</td>' +
            // DENISJAPANDEV-1383 zheng 20230303 end
            '</tr>' + '<tr>' + '<td style="width: 65px;height: 17px;"></td>';
    // DENISJAPANDEV-1383 zheng 20230302 start
    // if(roleSub !=SUB_SCETI || roleSub !=SUB_DPKK){
    if (roleSub != SUB_SCETI && roleSub != SUB_DPKK) {
        // DENISJAPANDEV-1383 zheng 20230302 end
        str += '<td  style="height: 17px;">' + shipState + shipCity + '</td>' + '<td style="height: 17px;"></td>' +
        // DENISJAPANDEV-1383 zheng 20230303 start
        // '<td style="width: 300px;height: 17px;">' + subsidiaryAddr +'</td>';
        if (DjLanguage == '���{��') {
            '<td style="width: 300px;height: 17px;">' + subsidiaryZip + '</td>';   
        } else {
            if (mainaddressEn) {
                var tmpMainaddressEn = mainaddressEn.split('\n');
                '<td style="width: 300px;height: 17px;">' + tmpMainaddressEn[1] + '</td>';
            } else {
                '<td style="width: 300px;height: 17px;">' + subsidiaryZip + '</td>';   
            }
        }
        // DENISJAPANDEV-1383 zheng 20230303 end
    } else {
        str += '<td colspan = "2" style="height: 17px;">' + shipState + shipCity + '</td>' + '<td style="width: 300px;height: 17px;">' + subsidiaryAddr + '</td>';
    }
    str += '</tr>' + '<tr>' + '<td style="width: 65px;"></td>' + '<td colspan="2" style="height: 17px;">' + shipAddress1 + shipAddress2 + shipAddress3 + '</td>'

    // DENISJAPANDEV-1383 zheng 20230303 start
    // str2 = '<td style="width: 300px;height: 17px;">' + subsidiaryCity + '</td>'
    str2 = '<td style="width: 300px;height: 17px;">ddd' + subsidiaryProvince + ' ' + subsidiaryCity + '</td>'
    // DENISJAPANDEV-1383 zheng 20230303 end
    if (DjLanguage == '���{��') {
        str2 = str2;
    } else {
        str2 = '<td style="width: 300px;height: 17px;">' + FixedNamePersonInCharge + defaultEmpty(salesrepresentativeCh.firstname) + '&nbsp;' + defaultEmpty(salesrepresentativeCh.lastname) + comma + employeefirstname + '&nbsp;' + employeelastname + '</td>'
    }
    str += str2
    str += '</tr>' + '<tr>' + '<td style="width: 65px; height: 17px;"></td>' + '<td colspan="2" style="height: 17px;">' + FixedNameAttn + shipAttention + '</td>'

    // DENISJAPANDEV-1383 zheng 20230303 start
    // str3 = '<td style="width: 300px;height: 17px;">'+ subsidiaryProvince +'&nbsp;&nbsp;' + subsidiaryZip +'</td>'
    str3 = '<td style="width: 300px;height: 17px;">' + subsidiaryAddr + '</td>'
    // DENISJAPANDEV-1383 zheng 20230303 end
    if (DjLanguage == '���{��') {
        str3 = str3;
    } else {
        str3 = '<td style="height: 17px;">' + FixedNameTel + employeePhone + '</td>'
    }
    str += str3
    str += '</tr>' + '<tr>' + '<td style="width: 65px;height: 17px;"></td>' + '<td colspan="2" style="height: 17px;">Tel: ' + shipAddressphone + '</td>'

    str4 = '<td style="width: 300px;height: 17px;">' + FixedNamePersonInCharge + defaultEmpty(salesrepresentativeCh.firstname) + '&nbsp;' + defaultEmpty(salesrepresentativeCh.lastname) + comma + employeefirstname + '&nbsp;' + employeelastname + '</td>'
    if (DjLanguage == '���{��') {
        str4 = str4;
    } else {
        str4 = '<td style="height: 17px;">' + FixedNameFax + employeeFax + '</td>'
    }
    str += str4

    // '<td style="width: 300px;height: 17px;">'+ FixedNamePersonInCharge + salesrepresentative + comma + +employeefirstname +'&nbsp;'+
    // employeelastname +'</td>'+
    str += '</tr>' + '<tr>' + '<td colspan="3" style="height: 17px;"></td>'
    str5 = '<td style="height: 17px;">' + FixedNameTel + employeePhone + '</td>'
    if (DjLanguage == '���{��') {
        str5 = str5;
    } else {
        str5 = '<td style="height: 17px;"></td>'
    }
    str += str5
    // '<td style="height: 17px;">'+ FixedNameTel + employeePhone + '</td>'+
    '</tr>' + '<tr>' + '<td colspan="3" style="height: 17px;"></td>'

    str += '</tr>' + '<tr>' + '<td colspan="3" style="height: 17px;"></td>'
    str6 = '<td style="height: 17px;">' + FixedNameFax + employeeFax + '</td>'
    if (DjLanguage == '���{��') {
        str6 = str6;
    } else {
        str6 = '<td style="height: 17px;"></td>'
    }
    str += str6

    // '<td style="height: 17px;">'+ FixedNameFax + employeeFax + '</td>'+
    str += '</tr>' + '</table>' + '' + '' + '<table cell-spacing="0" style="width:660px;margin-left: 0.2in;border-collapse: collapse;"><tr>' + '<td style="width:80%; padding-left: 0px; padding-right: 0px;">' + '<table cellpadding="0" cellspacing="0" style="width: 100%;"><tr style="border-bottom: 1px;">' + '<td style="width: 45%; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">' + FixedNameTradeTerms + '&nbsp;' + incoterm + '&nbsp;' + incotermSiteValue + '</td>'
            + '<td align="right" style="width: 40%;padding: 2px 2px 2px 0px; height: 25px;" vertical-align="bottom"><span>' + incotermTimeFormat + '&nbsp;&nbsp;&nbsp; (' + FixedNameLaTest + ')</span></td>' + '</tr>' + '<tr>' + '<td style="width: 85%;border-bottom:1px; padding: 2px 0px 2px 0px; height: 25px;" vertical-align="bottom">' + FixedNamePaymentTerms + '&nbsp;' + paymentTerms + '</td>' + '<td style="width: 15%; padding: 2px 0px 2px 0px; height: 25px;">&nbsp;</td>' + '</tr></table>'
            + '</td>' + '<td align="left" cell-spacing="0" style="padding-left: 0px;padding-right: 0px;padding-top: 3px;">' +
            // DENISJAPANDEV-1383 zheng 20230302 start
            // '<table><tr>'+
            '<table cellpadding="0" cellspacing="0"><tr>' +
            // '<td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>'+
            '<td style="width: 40px; height: 40px;border-left:1px solid #499AFF;border-top:1px solid #499AFF;border-bottom:1px solid #499AFF;">&nbsp;</td>' +
            // '<td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>'+
            '<td style="width: 40px; height: 40px;border-left:1px solid #499AFF;border-top:1px solid #499AFF;border-bottom:1px solid #499AFF;">&nbsp;</td>' +
            // '<td style="width: 40px; height: 40px;border:1px solid #499AFF;">&nbsp;</td>'+
            '<td style="width: 40px; height: 40px;border-left:1px solid #499AFF;border-top:1px solid #499AFF;border-bottom:1px solid #499AFF;border-right:1px solid #499AFF;">&nbsp;</td>' +
            // DENISJAPANDEV-1383 zheng 20230302 end
            '</tr></table>' + '</td>' + '</tr></table>' +

            '<table style="width: 660px;border-collapse:collapse; margin-right:3px;margin-left:-3px;" align="center" cellpadding="0" cellspacing="0">' + '<tr>' + '<td align="center" style="width: 40px;height:30px;border-right:0"></td>' + '<td align="center" style="width: 40px;height:30px;border-right:0"></td>' + '<td align="center" style="width: 40px;height:30px;border-right:0"></td>' + '<td align="center" style="width: 40px;height:30px;border-right:0"></td>'
            + '<td align="center" style="width: 40px;height:30px;border-right:0"></td>' + '<td align="center" style="width: 40px;height:30px;border-right:0"></td>' + '</tr>' + '</table>' + '<table style="width: 660px;border-collapse:collapse; margin-right:3px;margin-left:-3px;position: absolute;left: 0px;top: 480px;" align="center" cellpadding="0" cellspacing="0">' + '<tr>';

    // DENISJAPANDEV-1383 zheng 20230302 start
    // if(roleSub !=SUB_SCETI || roleSub !=SUB_DPKK){
    if (roleSub != SUB_SCETI && roleSub != SUB_DPKK) {
        // DENISJAPANDEV-1383 zheng 20230302 end
        str += '<td align="center" style="width: 25px;border-right:0"></td>' + '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:2px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameReference + '</td>' +
        // DENISJAPANDEV-1383 zheng 20230301 start
        // '<td align="center" style="width:
        // 250px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;
        // line-height:30px;border-bottom-width:1px;">'+ FixedNameProductDescription + '</td>'+
        '<td align="center" style="width: 260px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameProductDescription + '</td>' +
        // '<td align="center" style="width:
        // 125px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;
        // line-height:30px;border-bottom-width:1px;">' + FixedNameQuantity + '</td>'+
        '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameQuantity + '</td>' +
        // '<td align="center" style="width:
        // 85px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;
        // line-height:30px;border-bottom-width:1px;">' + FixedNameUnitPrice + '</td>'+
        '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameUnitPrice + '</td>' +
        // DENISJAPANDEV-1383 zheng 20230301 end
        '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;border-right-width:2px; border-bottom-width:1px;line-height:30px;">' + FixedNameTotalPrice + '</td>';
    } else {
        str += '<td align="center" style="width: 25px;border-right:0"></td>' + '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:2px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameReference + '</td>' +
        // DENISJAPANDEV-1383 zheng 20230303 start
        // '<td align="center" style="width:
        // 250px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;
        // line-height:30px;border-bottom-width:1px;">'+ FixedNameProductDescription + '</td>'+
        // '<td align="center" style="width:
        // 85px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;
        // line-height:30px;border-bottom-width:1px;">' + FixedNameQuantity + '</td>'+
        // '<td align="center" style="width:
        // 85px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;
        // line-height:30px;border-bottom-width:1px;">' + FixedNameUnitPrice + '</td>'+
        // '<td align="center" style="width:
        // 140px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;border-right-width:2px;
        // border-bottom-width:1px;line-height:30px;">' + FixedNameTotalPrice + '</td>';
        '<td align="center" style="width: 260px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameProductDescription + '</td>' + '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameQuantity + '</td>'
                + '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px; line-height:30px;border-bottom-width:1px;">' + FixedNameUnitPrice + '</td>' + '<td align="center" style="width: 100px;border-style:solid;border-color:#499AFF;border-left-width:1px;border-top-width:2px;height:30px;border-right-width:2px; border-bottom-width:1px;line-height:30px;">' + FixedNameTotalPrice + '</td>';
        // DENISJAPANDEV-1383 zheng 20230301 end
    }

    str += '</tr>' + '</table>' + '</macro>' + '<macro id="nlfooter">' + '<table  width="660px" cellspacing="0">' + '<tr>' + '<td align="right">OUR INTERNAL REF:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>' + '</tr>' + '<tr>' + '<td align="right">' + section + '&nbsp;&nbsp;&nbsp;&nbsp;' + vendorCode + '&nbsp;&nbsp;&nbsp;508&nbsp;&nbsp;&nbsp;' + receiptedScheduleDate + '</td>' + '</tr>' + '</table>'
            + '<table class="footer" style="width: 660px; border-top:2px soild #6F8CAD;">' + '<tr>' + '<td align="right" style="width:660px;margin-right:55px">' + location + '</td>' + '</tr>' + '<tr style="color:#4678d0;">' + '<td style="width: 525px;padding-top:5px;">' + '<span style="font-size:12px;">&nbsp;&nbsp;&nbsp;&nbsp;' + legalname + '</span><br />' + '<span style="font-size:9px;">&nbsp;&nbsp;&nbsp;&nbsp;��' + subsidiaryZip + '&nbsp;' + subsidiaryProvince + '&nbsp;' + subsidiaryCity
            + '&nbsp;' + subsidiaryAddr + '</span><br />' + '<span style="font-size:12px;">&nbsp;&nbsp;&nbsp;&nbsp;' + custrecord_djkk_subsidiary_en + '</span><br />' + '<span style="font-size:9px;">&nbsp;&nbsp;&nbsp;&nbsp; ' + subsidiaryAddEn + '</span></td>'
            + '<td align="right" style="width: 256px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" style="width: 90px; height: 50px; margin-top: 5px; float: right;" /></td>' + '</tr></table>' + '</macro>' + '</macrolist>' + '<style type="text/css">* {' + '<#if .locale == "zh_CN">' + 'font-family: NotoSans, NotoSansCJKsc, sans-serif;' + '<#elseif .locale == "zh_TW">'
            + 'font-family: NotoSans, NotoSansCJKtc, sans-serif;' + '<#elseif .locale == "ja_JP">' + 'font-family: NotoSans, NotoSansCJKjp, sans-serif;' + '<#elseif .locale == "ko_KR">' + 'font-family: NotoSans, NotoSansCJKkr, sans-serif;' + '<#elseif .locale == "th_TH">' + 'font-family: NotoSans, NotoSansThai, sans-serif;' + '<#else>' + 'font-family: NotoSans, sans-serif;' + '</#if>' + '}' + 'table {' + 'font-size: 9pt;' + 'table-layout: fixed;' + '}' + 'th {' + 'font-weight: bold;'
            + 'font-size: 8pt;' + 'vertical-align: middle;' + 'padding: 5px 6px 3px;' + 'background-color: #e3e3e3;' + 'color: #333333;' + '}' + 'td {' + 'padding: 4px 6px;' + '}' + 'td p { align:left }' + 'b {' + 'font-weight: bold;' + 'color: #333333;' + '}' + 'table.header td {' + 'padding: 0;' + 'font-size: 10pt;' + '}' + 'table.footer td {' + 'padding: 0;' + 'font-size: 8pt;' + '}' + 'table.itemtable th {' + 'padding-bottom: 10px;' + 'padding-top: 10px;' + '}' + 'table.body td {'
            + 'padding-top: 2px;' + '}' + 'tr.totalrow {' + 'background-color: #e3e3e3;' + 'line-height: 200%;' + '}' + 'td.totalboxtop {' + 'font-size: 12pt;' + 'background-color: #e3e3e3;' + '}' + 'td.addressheader {' + 'font-size: 8pt;' + 'padding-top: 6px;' + 'padding-bottom: 2px;' + '}' + 'td.address {' + 'padding-top: 0;' + '}' + 'td.totalboxmid {' + 'font-size: 28pt;' + 'padding-top: 20px;' + 'background-color: #e3e3e3;' + '}' + 'td.totalboxbot {' + 'background-color: #e3e3e3;'
            + 'font-weight: bold;' + '}' + 'span.title {' + 'font-size: 28pt;' + '}' + 'span.number {' + 'font-size: 16pt;' + '}' + 'span.itemname {' + 'font-weight: bold;' + 'line-height: 150%;' + '}' + 'hr {' + 'width: 100%;' + 'color: #d3d3d3;' + 'background-color: #d3d3d3;' + 'height: 1px;' + '}' + '.itemdetailtb{width:660px; border-collapse:collapse;margin-left:0.2in; margin-top:30px;}' + '.itemdetailhtr{height:20px;}' + '.itemhlineno{width:5%;}'
            + '.itemhref{width:12%; border-left: 2px solid #499AFF; border-top: 2px solid #499AFF; border-bottom: 1px solid #499AFF;}' + '.itemhprodesc{width:14%; border-left: 1px solid #499AFF; border-top: 2px solid #499AFF; border-bottom: 1px solid #499AFF;}' + '.itemhquan,.itemhunitprice,.itemhtotalprice{width:13%; border-left: 1px solid #499AFF; border-top: 2px solid #499AFF; border-bottom: 1px solid #499AFF;}' + '.itemhtotalprice{border-right: 2px solid #499AFF;}'
            + '.itemref{border-left: 2px solid #499AFF;}' + '.itemprodesc,.itemquan,.itemunitprice,.itemtotalprice{border-left: 1px solid #499AFF;}' + '.itemtotalprice{border-right: 2px solid #499AFF;}' + '.itemref,.itemreflast{min-height:40px;}' + '.itemreflast{border-left: 2px solid #499AFF;}' + '.itemprodesclast,.itemquanlast,.itemunitpricelast,.itemtotalpricelast{border-left: 1px solid #499AFF;}' + '.itemtotalpricelast{border-right: 2px solid #499AFF;}'
            + '.itemreflast,.itemprodesclast,.itemquanlast,.itemunitpricelast,.itemtotalpricelast{border-bottom: 2px solid #499AFF;}' + '.topbd{border-top: 2px solid #499AFF;}' + '.totaltd{border-left: 2px solid #499AFF; border-bottom: 1px solid #499AFF;}' + '.pricetd{border-left: 1px solid #499AFF; border-bottom: 1px solid #499AFF; border-right: 2px solid #499AFF;}' + '.currencytd{border-left: 2px solid #499AFF; border-bottom: 2px solid #499AFF;}'
            + '.lasttd{border-left: 1px solid #499AFF; border-bottom: 2px solid #499AFF; border-right: 2px solid #499AFF;}' + '.totaltd,.pricetd,.currencytd,.lasttd{height:30px; vertical-align:middle;}' + '.msg{margin-top:10px; border-top:1px; border-bottom:1px;}' + '.noleftpadding{padding-left:0px;}' + '.internalref{margin-left:0.2in; width:660px;border-collapse: collapse;}' + '.internalrefmsg{line-height:16pt;}' + '</style>' + '</head>'
            + '<body header="nlheader" header-height="48.2%" footer="nlfooter" footer-height="7%" padding="0.5in 0.5in 0.5in 0.5in" size="A4">' + '<table style="width: 660px;" align="center" cellpadding="0" cellspacing="0">';
    // '<tr>'+
    // '<td style="border:none;width:20px;height:30px;padding:0;margin:0;">&nbsp;</td>'+
    // '<td style="border:none;padding:0;margin:0;">&nbsp;</td>'+
    // '<td style="border:none;padding:0;margin:0;">&nbsp;</td>'+
    // '<td style="border:none;padding:0;margin:0;">&nbsp;</td>'+
    // '<td align="right" style="border:none;padding:0;margin:0;">&nbsp;</td>'+
    // '<td align="right" style="border:none;padding:0;margin:0;">&nbsp;</td>'+
    // '</tr>';
    for ( var j = 0; j < itemDetails.length; j++) {
        // DENISJAPANDEV-1383 zheng 20230302 start
        // if(roleSub !=SUB_SCETI || roleSub !=SUB_DPKK){
        if (roleSub != SUB_SCETI && roleSub != SUB_DPKK) {
            // DENISJAPANDEV-1383 zheng 20230302 end
            // var itemDetail = itemDetails[j];
            nlapiLogExecution('debug', 'itemDetails[j].itemType1', j + 1 + '+' + itemDetails[j].itemType)
            if (itemDetails[j].itemType != 'subtotalitem' && !isEmpty(itemDetails[j].itemType)) {
                var no = j + 1;
                nlapiLogExecution('debug', 'itemDetails[j].itemType2', j + 1 + '+' + itemDetails[j].itemType)
                str += '<tr>' + '<td style="width: 25px;">0' + no + '0</td>' + '<td style="border-left: 2px solid #499AFF;width: 100px;"></td>' +
                // DENISJAPANDEV-1383 zheng 20230301 start
                // '<td style="border-left: 1px solid #499AFF;width: 250px;"></td>'+
                '<td style="border-left: 1px solid #499AFF;width: 260px;"></td>' +
                // '<td style="border-left: 1px solid #499AFF;width: 125px;"></td>'+
                '<td style="border-left: 1px solid #499AFF;width: 100px;"></td>' +
                // '<td style="border-left: 1px solid #499AFF;width: 85px;"></td>'+
                '<td style="border-left: 1px solid #499AFF;width: 100px;"></td>' +
                // DENISJAPANDEV-1383 zheng 20230301 end
                '<td style="border-left: 1px solid #499AFF;width: 100px; border-right:  2px solid #499AFF;"></td>' + '</tr>' + '<tr>' + '<td style="width: 20px;"></td>' + '<td style="border-left: 2px solid #499AFF;">' +
                // DENISJAPANDEV-1383 zheng 20230301 start
                // '<table style="width: 100px;height: 50px;">'+
                '<table style="width: 100px;height: 50px;" cellpadding="0" cellspacing="0">' + '<tr>' +
                // '<td>'+ itemDetails[j].itemCode +'</td>'+
                '<td>&nbsp;' + itemDetails[j].itemCode + '</td>' + '</tr>' + '<tr>' +
                // '<td>'+ itemDetails[j].vendorItemCode +'</td>'+
                '<td>&nbsp;' + itemDetails[j].vendorItemCode + '</td>' + '</tr>' + '<tr>' +
                // '<td>'+ itemDetails[j].productCode +'</td>'+
                '<td>&nbsp;' + itemDetails[j].productCode + '</td>' + '</tr>' + '<tr>' +
                // '<td>'+ itemDetails[j].upcCode +'</td>'+
                '<td>&nbsp;' + itemDetails[j].upcCode + '</td>' + '</tr>' + '</table>' + '</td>' + '<td style="border-left: 1px solid #499AFF;">' +
                // '<table style="width: 250px;">'+
                '<table style="width: 250px;" cellpadding="0" cellspacing="0">' + '<tr>' +
                // '<td>'+ itemDetails[j].itemName1 +'</td>'+
                '<td>&nbsp;' + itemDetails[j].itemName1 + '</td>' + '</tr>' + '<tr>' +
                // '<td>'+ itemDetails[j].itemName2 +'</td>'+
                '<td>&nbsp;' + itemDetails[j].itemName2 + '</td>' + '</tr>' +
                // DENISJAPANDEV-1383 zheng 20230301 end
                '<tr>' + '<td>';
                var description = itemDetails[j].description;
                var descriptionArr = description.split('\n');
                str += '<table style="width: 250px;">';
                for ( var dcp = 0; dcp < descriptionArr.length; dcp++) {
                    str += '<tr>' + '<td>' + descriptionArr[dcp] + '</td>' + '</tr>';
                }
                str += '</table>' + '</td>' + '</tr>' + '</table>' + '</td>' +
                // DENISJAPANDEV-1383 zheng 20230301 start
                '<td align="right"  style="border-left: 1px solid #499AFF;">' + itemDetails[j].quantity + '&nbsp;' + itemDetails[j].units_display + '</td>' +
                // '<td align="right" style="border-left: 1px solid #499AFF;width: 85px;">'+ itemDetails[j].origrate +'</td>'+
                '<td align="right" style="border-left: 1px solid #499AFF;width: 85px;">' + itemDetails[j].origrate + '&nbsp;</td>' +
                // '<td align="right" style="border-left: 1px solid #499AFF; border-right: 2px solid #499AFF;">'+ itemDetails[j].amount
                // +'</td>'+
                '<td align="right" style="border-left: 1px solid #499AFF; border-right: 2px solid #499AFF;">' + itemDetails[j].amount + '&nbsp;</td>' +
                // DENISJAPANDEV-1383 zheng 20230301 end
                '</tr>';
            }
        } else {
            if (itemDetails[j].itemType != 'subtotalitem' && !isEmpty(itemDetails[j].itemType)) {
                // var itemDetail = itemDetails[j];
                var no = j + 1;
                str += '<tr>' + '<td style="width: 25px;">0' + no + '0</td>' + '<td style="border-left: 2px solid #499AFF;width: 100px;"></td>' +
                // DENISJAPANDEV-1383 zheng 20230303 start
                // '<td style="border-left: 1px solid #499AFF;width: 250px;"></td>'+
                // '<td style="border-left: 1px solid #499AFF;width: 85px;"></td>'+
                // '<td style="border-left: 1px solid #499AFF;width: 85px;"></td>'+
                // '<td style="border-left: 1px solid #499AFF;width: 140px; border-right: 2px solid #499AFF;"></td>'+
                '<td style="border-left: 1px solid #499AFF;width: 260px;"></td>' + '<td style="border-left: 1px solid #499AFF;width: 100px;"></td>' + '<td style="border-left: 1px solid #499AFF;width: 100px;"></td>' + '<td style="border-left: 1px solid #499AFF;width: 100px; border-right:  2px solid #499AFF;"></td>' +
                // DENISJAPANDEV-1383 zheng 20230303 end
                '</tr>' + '<tr>' + '<td style="width: 20px;"></td>' + '<td style="border-left: 2px solid #499AFF;">' + '<table style="width: 100px;height: 50px;">' + '<tr>' + '<td>' + itemDetails[j].itemCode + '</td>' + '</tr>' + '<tr>' + '<td>' + itemDetails[j].vendorItemCode + '</td>' + '</tr>' + '<tr>' + '<td>' + itemDetails[j].productCode + '</td>' + '</tr>' + '<tr>' + '<td>' + itemDetails[j].upcCode + '</td>' + '</tr>' + '</table>' + '</td>' + '<td style="border-left: 1px solid #499AFF;">'
                        +
                        // DENISJAPANDEV-1383 zheng 20230303 start
                        // '<table style="width: 250px;">'+
                        '<table style="width: 260px;">' +
                        // DENISJAPANDEV-1383 zheng 20230303 end
                        '<tr>' + '<td>' + itemDetails[j].description + '</td>' + '</tr>' + '<tr>' + '<td>' + itemDetails[j].itemName1 + '</td>' + '</tr>' + '<tr>' + '<td>' + itemDetails[j].itemName2 + '</td>' + '</tr>' + '</table>' + '</td>' +
                        // DENISJAPANDEV-1383 zheng 20230303 start
                        // '<td style="border-left: 1px solid #499AFF;">'+ itemDetails[j].quantity + '&nbsp;' + itemDetails[j].units_display
                        // + '</td>'+
                        // '<td align="right" style="border-left: 1px solid #499AFF;width: 85px;">'+ itemDetails[j].origrate +'</td>'+
                        // '<td align="right" style="border-left: 1px solid #499AFF; border-right: 2px solid #499AFF;">'+
                        // itemDetails[j].amount +'</td>'+
                        '<td align="right" style="border-left: 1px solid #499AFF;">' + itemDetails[j].quantity + '&nbsp;' + itemDetails[j].units_display + '</td>' + '<td align="right" style="border-left: 1px solid #499AFF;width: 85px;">' + itemDetails[j].origrate + '&nbsp;</td>' + '<td align="right" style="border-left: 1px solid #499AFF; border-right: 2px solid #499AFF;">' + itemDetails[j].amount + '&nbsp;</td>' +
                        // DENISJAPANDEV-1383 zheng 20230303 end
                        '</tr>';
            }
        }
    }

    str += '<tr >' + '<td style="width: 20px;height: 10px;"></td>' + '<td style="height: 10px;border-top:2px solid #499AFF; border-left: 2px solid #499AFF;"></td>' + '<td style="height: 10px;border-top:2px solid #499AFF;" colspan="3"></td>' + '<td style="border-top:2px solid #499AFF; border-right: 2px solid #499AFF;height: 10px;"></td>' + '</tr>';

    str += '<tr >' + '<td style="width: 20px;height: 30px;"></td>' + '<td style="height: 30px;border-left: 2px solid #499AFF;" colspan="4">';
    // + poComment +
    var poCommentArr = poComment.split('\n');
    str += '<table style="width: 250px;">';
    for ( var poc = 0; poc < poCommentArr.length; poc++) {
        str += '<tr>' + '<td>' + poCommentArr[poc] + '</td>' + '</tr>';
    }
    str += '</table>' + '</td>' + '<td style="border-right: 2px solid #499AFF;height: 70px;"></td>' + '</tr>';
    // attention , it may be should change !
    str += '<tr>' + '<td rowspan="2" height="30px" >&nbsp;</td>' + '<td valign="middle" height="30px" class="noleftpadding" colspan="3" rowspan="2" style="padding-top:10px; border-top:2px solid #499AFF;">' + '<p class="msg" style="margin-top:10px">' + FixedNameOrderConfirm1 + '<br />' + FixedNameOrderConfirm2 + '</p>' + '' +
    // '<p>'+FixedNameReceptionDate+'</p>'+
    '</td>';

    // nlapiLogExecution('DEBUG', 'roleSub',roleSub);
    str += '<td height="30px" align="center" class="topbd totaltd">' + '<table>';
    if (roleSub != SUB_SCETI && roleSub != SUB_DPKK) {
        str += '<tr>' +
        // DENISJAPANDEV-1383 zheng 20230302 start
        // '<td style="line-height:10px;">SubTotal&nbsp;('+ currency +')</td>'+
        '<td style="line-height:10px;">' + FixedNameSubTotal + '&nbsp;(' + currency + ')</td>' + '</tr>' + '<tr>' + '<td style="line-height:10px;">' + FixedNameTaxTotal + '&nbsp;(' + currency + ')</td>' + '</tr>' + '<tr>' + '<td style="line-height:10px;">' + FixedNameTotal + '&nbsp;(' + currency + ')</td>' + '</tr>';
        // DENISJAPANDEV-1383 zheng 20230302 end
    } else {
        // DENISJAPANDEV-1383 zheng 20230303 start
        str += '<tr>' +
        //'<td style="line-height:10px;">Total&nbsp;('+ currency +')</td>'+
        '<td style="line-height:10px;">' + FixedNameTotal + '(' + currency + ')</td>' + '</tr>';
        // DENISJAPANDEV-1383 zheng 20230303 end
    }

    str += '</table>' + '</td>' + '<td height="30px" align="right" class="topbd pricetd">' +
    // DENISJAPANDEV-1383 zheng 20230302 start
    '<table>';
    if (roleSub != SUB_SCETI && roleSub != SUB_DPKK) {
        str += '<tr>' +
        //'<td style="line-height:10px;">'+amountTotalFormat+'</td>'+
        '<td align="right" style="line-height:10px;">' + amountTotalFormat + '</td>' + '</tr>' + '<tr>' +
        //'<td style="line-height:10px;">' + taxtotalFormat + '</td>'+
        '<td align="right" style="line-height:10px;">' + taxtotalFormat + '</td>' + '</tr>' + '<tr>' +
        //'<td style="line-height:10px;">' + totalFormat + '</td>'+
        '<td align="right" style="line-height:10px;">' + totalFormat + '</td>' +
        // DENISJAPANDEV-1383 zheng 20230302 end
        '</tr>';
    } else {
        str += '<tr>' +
        // DENISJAPANDEV-1383 zheng 20230303 start
        // '<td style="line-height:10px;">' + total + '</td>'+
        '<td style="line-height:10px;">' + totalFormat + '</td>' +
        // DENISJAPANDEV-1383 zheng 20230303 end
        '</tr>';
    }
    str += '</table>' + '</td>' + '</tr>' + '<tr>' + '</tr>' + '<tr>' + '<td height="20px" >&nbsp;</td>' + '<td height="20px" class="noleftpadding" colspan="5">' + FixedNameReceptionDate + '<br /></td>' + '</tr>' + '<tr>' + '<td height="20px" >&nbsp;</td>' + '<td height="20px" class="noleftpadding">' + Precautions + '</td>' + '<td height="20px" align="left" colspan="4">' + vendorPrecautions + '</td>' + '</tr>' + '<tr>' + '<td height="20px" >&nbsp;</td>'
            + '<td height="20px" class="noleftpadding" colspan="2">' + FixedNameAuthorizedSignautre + '<br /></td>' + '<td height="20px" >' + FixedNameCitStamp + '</td>' + '<td height="20px" ></td>' + '<td height="20px" ></td>' + '</tr>' +

            '</table>' + '<!-- DETIALS END --> &nbsp;' + '</body>' + '</pdf>'

    var renderer = nlapiCreateTemplateRenderer();
    renderer.setTemplate(str);
    var xml = renderer.renderToString();
    var xlsFile = nlapiXMLToPDF(xml);

    // PDF
    xlsFile.setName('PDF' + '_' + getFormatYmdHms() + '.pdf');
    xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
    xlsFile.setIsOnline(true);

    // save file
    var fileID = nlapiSubmitFile(xlsFile);
    var fl = nlapiLoadFile(fileID);

    var url = URL_HEAD +'/' + fl.getURL();
    nlapiSetRedirectURL('EXTERNAL', url, null, null, null);

}
function defaultEmpty(src) {
    return src || '';
}
function defaultEmptyToZero(src) {
    return src || 0;
}
function formatDate(dt) { //���t
    return dt ? (dt.getFullYear() + "-" + PrefixZero((dt.getMonth() + 1), 2) + "-" + PrefixZero(dt.getDate(), 2)) : '';
}

function formatDate2(dt) { //���t Example:22-01-18
//	return dt ? (dt.getFullYear() + "-" + PrefixZero((dt.getMonth() + 1), 2) + "-" + PrefixZero(dt.getDate(), 2)) : '';
    if (dt == null) {
        return '';
    } else {
        var year = dt.getFullYear()
        var year = year < 2000 ? year + 1900 : year
        var yy = year.toString().substr(2, 2)

        var month = PrefixZero((dt.getMonth() + 1), 2)
        var date = PrefixZero(dt.getDate(), 2)
        return yy + "-" + month + "-" + date
    }
}

function transfer(text) {
    if (typeof (text) != "string")
        text = text.toString();

    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

    return text;
}

//DENISJAPANDEV-1383 zheng 20230303 start
function formatAmount2(str) {
    var tempStr = Number(str);
    var str = String(tempStr);
    var newStr = "";
    var count = 0;
    if (str.indexOf(".") == -1) {
        for ( var i = str.length - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + "," + newStr;
            } else {
                newStr = str.charAt(i) + newStr;
            }
            count++;
        }
        str = newStr;
    } else {
        for ( var i = str.indexOf(".") - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + "," + newStr;
            } else {
                newStr = str.charAt(i) + newStr;
            }
            count++;
        }
        str = newStr + (str + "00").substr((str + "00").indexOf("."), 4);
    }
    return str;
}
//DENISJAPANDEV-1383 zheng 20230303 end