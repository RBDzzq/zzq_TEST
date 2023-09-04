/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format', 'N/task', 'N/log'], function (search, format, task, log) {

    function doGet(requestBody) {
        log.audit({
            title: 'doGet - start',
            details: JSON.stringify(new Date())
        });
        log.audit({
            title: 'doget - requestBody',
            details: JSON.stringify(requestBody)
        });

        var result = {};
        if (!requestBody.hasOwnProperty('processName')) {
            result.status = '9';
            result.message = 'processName�̎w�肪����܂���B';
            return result;
        }

        result.pro_id = requestBody.processName;

        try {
            switch (requestBody.processName.toString()) {
                case 'FINET_INVOICE':
                    // FINET�A�g_����
                    result.data = getFinetInvoiceJSON();
                    break;
                case 'FINET_SHIPPING_INFORMATION':
                    // FINET�A�g_�o�׈ē�
                    result.data = getFinetShippingJSON();
                    break;
            }
            if (result.hasOwnProperty('data')) {
                result.total = result.data.length;
            }
            result.status = "1";
            result.message = "OK";

        } catch (e) {
            result.status = "9";
            result.message = e;
        }
        log.audit({
            title: 'doGet - end',
            details: JSON.stringify(new Date())
        });
        return result;
    }
    /**
     * Function called upon sending a POST request to the RESTlet.
     * 
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request
     * Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be
     * a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request
     * Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {
        log.audit({
            title: 'doPost - start',
            details: JSON.stringify(new Date())
        });
        log.audit({ title: 'doPost - requestBody', details: JSON.stringify(requestBody) });
        var result = {
            status: '',
            message: ''
        };

        if (!requestBody.hasOwnProperty('processName')) {
            result = {
                status: 'failed',
                message: 'processName���܂܂�Ă��܂���B'
            };
            return result;
        }

        switch (requestBody.processName.toString()) {
            case 'FINET_INVOICE':
                // FINET�A�g_����
                result.data = getFinetInvoiceJSON();
                break;
            case 'FINET_SHIPPING_INFORMATION':
                // FINET�A�g_�o�׈ē�
                result.data = getFinetShippingJSON();
                break;
        }

        log.audit({
            title: 'doPost - end',
            details: JSON.stringify(new Date())
        });
        return result;
    }

    return {
        get: doGet,
        post: doPost
    };

    /**
     * FINET�A�g_�o�׈ē��f�[�^�擾
     * @returns {Array} ���ʐ����f�[�^
     */
    function getFinetShippingJSON() {
        log.audit({
            title: 'getFinetShippingJSON - start',
            details: JSON.stringify(new Date())
        });
        /**
         * FINET_�����f�[�^
         * @type {Array}
         */
        var arrResults = [];
    
        /**
         * �X�V�Ώۃg�����U�N�V��������ID
         * @typedef {object} objTransactionIds
         * @param {Array} objTransactionIds.salesOrderIds �X�V�Ώے�����ID�z��
         * @param {Array} objTransactionIds.invoiceIds �X�V�Ώې�����ID�z��
         * @param {Array} objTransactionIds.creditMemoIds �X�V�ΏۃN���W�b�g����ID�z��
         */
        let objTransactionIds = {
            salesOrderIds: [],
            invoiceIds: [],
            creditMemoIds: []
        };
    
        /**
         * �V�X�e�������i���{���ԁj
         * @type {Date}
         */
        const systemDateTime = getJapanDateTime();
        /**
         * �V�X�e�����t�i���{���ԁjYYYYMMDD
         * @type {string}
         */
        const strSystemDate = systemDateTime.getFullYear() + ('00' + (systemDateTime.getMonth() + 1)).slice(-2) + ('00' + systemDateTime.getDate()).slice(-2);
        /**
         * �V�X�e�����ԁi���{���ԁjHHmmSS
         * @type {string}
         */
        const strSystemTime = ('00' + systemDateTime.getHours()).slice(-2) + ('00' + systemDateTime.getMinutes()).slice(-2) + ('00' + systemDateTime.getSeconds()).slice(-2);
    
        /**
         * �ꏊ�}�X�^���
         * @type {object} objLocationInfo
         * @param {string} objLocationInfo.key �ꏊ.����ID
         * @param {object} objLocationInfo.value �ꏊ���
         * @param {string} objLocationInfo.value.externalId �ꏊ.�O��ID
         */
        const objLocationInfo = getLocationInfo();
    
        /**
         * �o�׈ē��f�[�^�i�ʏ�o�ׁj
         * @type {object}
         */
        var datas = getFinetShippingNormalDatas();
        /**
         * �o�׈ē��f�[�^�i�ԓ`�j
         * @type {object}
         */
        var objRedData = getFinetShippingRedDatas();
        /**
         * �o�׈ē��f�[�^�i���`�j
         * @type {object}
         */
        var objBlackData = getFinetShippingBlackDatas();
    
        var finetItemCodeMapping = getFinetItemCodeMapping(true);
        var unitCodeByItem = getUnitCodeByItem();
    
        var commonTypeCodeById = getCommonTypeCodeById();
    
        // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^����
        let numFileHeaderRecordSendDataCount = 0;
        // 8.3 �G���h���R�[�h.���R�[�h����
        let numEndRecordRecordCount = 0;
        // 8.4 �G���h���R�[�h.���ŋ��z���v
        let amountEndRecordRawVersionTotal = 0;
        // 8.5 �G���h���R�[�h.���ߋ��z���v
        let amountEndRecordRebateTotal = 0;
        // 8.6 �G���h���R�[�h.����e����z���v
        let amountEndRecordRecoverContainerTotal = 0;
        // �f�[�^�V���A���ԍ�
        let numDataSerialNumber = 1;

        let objAllDatasByDestinationCode = groupOriginDatas(datas, objRedData, objBlackData);
    
        /** �ԓ`�[�����p�}�X�^���擾 start */
        
        /**
         * �N���W�b�g�����쐬��ID�i��K�w�j
         * �N���W�b�g����.�쐬���i�������j.�쐬���i�������j
         * �N���W�b�g����.�쐬���i�ԕi�j.�쐬���i�������j
         * @type {Array}
         */
        let arrRedTwoLayersCreatedFromIds = [];

        /** �ԓ`�[�f�[�^.�쐬��.�쐬������ID���擾���������� */
        Object.keys(objAllDatasByDestinationCode).forEach(function(finalDestinationCode) {
            let objCurrentCodeRedData = objAllDatasByDestinationCode[finalDestinationCode.toString()]['red'];
            
            Object.keys(objCurrentCodeRedData).forEach(function(creditMemoId) {
                if (objCurrentCodeRedData[creditMemoId].length > 0) {
                    var tmpCreateFromInvoiceId = objCurrentCodeRedData[creditMemoId][0].getValue({ name: 'createdfrom', join: 'createdfrom' });
                    if (arrRedTwoLayersCreatedFromIds.indexOf(tmpCreateFromInvoiceId.toString()) < 0 && tmpCreateFromInvoiceId) {
                        arrRedTwoLayersCreatedFromIds.push(tmpCreateFromInvoiceId.toString());
                    }
                }
            });
        });

        /**
         * �N���W�b�g�����쐬�����i��K�w�j
         * �N���W�b�g����.�쐬���i�������j.�쐬���i�������j.xxx
         * �N���W�b�g����.�쐬���i�ԕi�j.�쐬���i�������j.xxx
         * @type {object}
         */
        let objRedTwoLayersCreatedFromInfos = {};

        if (arrRedTwoLayersCreatedFromIds.length > 0) {
            let arrRedTwoLayersCreatedFromFilters = [];
            let arrRedTwoLayersCreatedFromIdFilters = [];
            arrRedTwoLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrRedTwoLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrRedTwoLayersCreatedFromIds.length - 1) {
                    arrRedTwoLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrRedTwoLayersCreatedFromFilters.push(arrRedTwoLayersCreatedFromIdFilters);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);

            let arrRedTwoLayersCreatedFromColumns = [];
            /** DJ_�������@�敪.DJ_�敪�R�[�h */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'}));
            /** �g�����U�N�V�����ԍ� */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'transactionnumber'}));
            /** DJ_�������@�敪 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp'}));
            /** �쐬��.DJ_�������@�敪 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}));
            /** DJ_��������ԍ� */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno'}));
            /** �쐬��������.DJ_��������ԍ� */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}));
            /** �쐬�� */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom'}));
            /** DJ_FINET�J�i�Ж��E�X���E����於 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername'}));
            /** DJ_FINET�J�i�Ж��E�X���E����於_option2 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2'}));
            /** DJ_FINET�J�i�Ж��E�X���E����於_option3 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3'}));
            /** DJ_FINET�J�i�Ж��E�X���E����於_option4 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4'}));
            /** DJ_FINET�J�i�Ж��E�X���E����於_option5 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5'}));
            /** �쐬��.DJ_FINET�J�i�Ж��E�X���E����於 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}));
            /** �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option2 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}));
            /** �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option3 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}));
            /** �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option4 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}));
            /** �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option5 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanacustomeraddress'});
            // DJ_FINET�J�i�Z��_option2
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option2'});
            // DJ_FINET�J�i�Z��_option3
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option3'});
            // DJ_FINET�J�i�Z��_option4
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option4'});
            // DJ_FINET�J�i�Z��_option5
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option5'});
            // �쐬��.DJ_FINET�J�i�Z��
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'});
            // �쐬��.DJ_FINET�J�i�Z��_option2
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'});
            // �쐬��.DJ_FINET�J�i�Z��_option3
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'});
            // �쐬��.DJ_FINET�J�i�Z��_option4
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'});
            // �쐬��.DJ_FINET�J�i�Z��_option5
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'});
            
            let arrRedTwoLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrRedTwoLayersCreatedFromFilters, arrRedTwoLayersCreatedFromColumns);

            arrRedTwoLayersCreatedFromResults.forEach(function(tmpResult) {
                
                objRedTwoLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    createdFrom: tmpResult.getValue({name: 'createdfrom'}),
                    // DJ_�������@�敪.�敪�R�[�h
                    orderMethodTypeCode: tmpResult.getValue({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'}),
                    // DJ_�������@�敪
                    orderMethodType: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp'}),
                    // �g�����U�N�V�����ԍ�
                    transactionNumber: tmpResult.getValue({name: 'transactionnumber'}),
                    // �쐬��.�������@
                    createdFromOrderMethodType: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}),
                    // DJ_��������ԍ�
                    customerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno'}),
                    // �쐬��������.DJ_��������ԍ�
                    createdFromCustomerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5'}),
                    // �쐬��.DJ_FINET�J�i�Ж��E�X���E����於
                    createdFromCustomerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option2
                    createdFromCustomerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option3
                    createdFromCustomerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option4
                    createdFromCustomerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option5
                    createdFromCustomerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress'}),
                    // DJ_FINET�J�i�Z��_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2'}),
                    // DJ_FINET�J�i�Z��_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3'}),
                    // DJ_FINET�J�i�Z��_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4'}),
                    // DJ_FINET�J�i�Z��_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5'}),
                    // �쐬��.DJ_FINET�J�i�Z��
                    createdFromAddress1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Z��_option2
                    createdFromAddress2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Z��_option3
                    createdFromAddress3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Z��_option4
                    createdFromAddress4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Z��_option5
                    createdFromAddress5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'})
                };
            });
        }

        /** �ԓ`�[�����p�}�X�^���擾 end */
    
        /** ���`�[�����p�}�X�^���擾 start */
    
        /**
         * �������쐬��ID�i��K�w�j
         * ������.DJ_�N���W�b�g����.�쐬���i�������j
         * ������.DJ_�N���W�b�g����.�쐬���i�ԕi�j
         * @type {Array}
         */
        let arrBlackTwoLayersCreatedFromIds = [];

        Object.keys(objAllDatasByDestinationCode).map(function (tmpDestinationCode) {
            Object.keys(objAllDatasByDestinationCode[tmpDestinationCode]['black']).map(function (tmpBlackInvoiceId) {
                let tmpBlackCreatedFromId = objAllDatasByDestinationCode[tmpDestinationCode]['black'][tmpBlackInvoiceId][0].getValue({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' });

                if (tmpBlackCreatedFromId && arrBlackTwoLayersCreatedFromIds.indexOf(tmpBlackCreatedFromId.toString()) < 0) {
                    arrBlackTwoLayersCreatedFromIds.push(tmpBlackCreatedFromId.toString());
                }
            });
        });

        /**
         * �������쐬��ID�i�l�K�w�j
         * ������.DJ_�N���W�b�g����.�쐬���i�ԕi�j.�쐬���i�������j.�쐬���i�������j
         * @type {Array}
         */
        let arrBlackFourLayersCreatedFromIds = [];

        /**
         * �������쐬�����i��K�w�j
         * ������.DJ_�N���W�b�g����.�쐬���i�������j.xxx
         * ������.DJ_�N���W�b�g����.�쐬���i�ԕi�j.xxx
         * @type {object}
         */
        let objBlackTwoLayersCreatedFromInfos = {};

        if (arrBlackTwoLayersCreatedFromIds.length > 0) {
            let arrBlackTwoLayersCreatedFromFilters = [];
            let arrBlackTwoLayersCreatedFromIdFilters = []
            arrBlackTwoLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrBlackTwoLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrBlackTwoLayersCreatedFromIds.length - 1) {
                    arrBlackTwoLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrBlackTwoLayersCreatedFromFilters.push(arrBlackTwoLayersCreatedFromIdFilters);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);

            let arrBlackTwoLayersCreatedFromColumns = [];
            // �쐬��
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom'}));
            // �o�ד�
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'shipdate'}));
            // �g�����U�N�V�����ԍ�
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'transactionnumber'}));
            // �쐬��.�쐬��
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom', join: 'createdfrom'}));
            // �쐬��.�g�����U�N�V�����ԍ�
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'transactionnumber', join: 'createdfrom'}));
            // �쐬��.�������@�敪
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}));
            // �쐬��.DJ_��������ԍ�
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}));
            // DJ_FINET�J�i�Ж��E�X���E����於
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option2
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option3
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option4
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option5
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��_option2
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��_option3
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��_option4
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��_option5
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'}));

            let arrBlackTwoLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrBlackTwoLayersCreatedFromFilters, arrBlackTwoLayersCreatedFromColumns);

            arrBlackTwoLayersCreatedFromResults.forEach(function(tmpResult) {
                
                objBlackTwoLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    fourLayersCreatedFrom: tmpResult.getValue({name: 'createdfrom', join: 'createdfrom'}),
                    // �쐬��
                    createdFrom: tmpResult.getValue({name: 'createdfrom'}),
                    // �o�ד�
                    shipdate: tmpResult.getValue({name: 'shipdate'}),
                    // �g�����U�N�V�����ԍ�
                    transactionNumber: tmpResult.getValue({name: 'transactionnumber'}),
                    // DJ_�������@�敪
                    orderMethodTyp: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}),
                    // �쐬��.�g�����U�N�V�����ԍ�
                    createdFromTransactionNumber: tmpResult.getValue({name: 'transactionnumber', join: 'createdfrom'}),
                    // �쐬��.DJ_��������ԍ�
                    createdFromCustomerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'})
                };

                /** �쐬��ID�i�l�K�w�j�擾���������� */
                let numBlackResultCreatedFromId = tmpResult.getValue({name: 'createdfrom', join: 'createdfrom'});
                if (numBlackResultCreatedFromId && arrBlackFourLayersCreatedFromIds.indexOf(numBlackResultCreatedFromId.toString()) < 0) {
                    arrBlackFourLayersCreatedFromIds.push(numBlackResultCreatedFromId.toString());
                }
            });
        }

        /**
         * �������쐬�����i�l�K�w�j
         * ������.DJ_�N���W�b�g����.�쐬���i�ԕi�j.�쐬���i�������j.�쐬���i�������j.xxx
         */
        let objBlackFourLayersCreatedFromInfos = {};

        if (arrBlackFourLayersCreatedFromIds.length > 0) {
            let arrBlackFourLayersCreatedFromFilters = [];
            let arrBlackFourLayersCreatedFromIdFilters = [];
            arrBlackFourLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrBlackFourLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrBlackFourLayersCreatedFromIds.length - 1) {
                    arrBlackFourLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrBlackFourLayersCreatedFromFilters.push(arrBlackFourLayersCreatedFromIdFilters);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);


            let arrBlackFourLayersCreatedFromColumns = [];
            /** DJ_�������@�敪 */
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp'}));
            /** DJ_��������ԍ� */
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno'}));
            // DJ_FINET�J�i�Ж��E�X���E����於
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option2
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option3
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option4
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option5
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5'}));
            // DJ_FINET�J�i�Z��
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomeraddress'}));
            // DJ_FINET�J�i�Z��_option2
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option2'}));
            // DJ_FINET�J�i�Z��_option3
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option3'}));
            // DJ_FINET�J�i�Z��_option4
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option4'}));
            // DJ_FINET�J�i�Z��_option5
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option5'}));
    
            let arrBlackFourLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrBlackFourLayersCreatedFromFilters, arrBlackFourLayersCreatedFromColumns);
            arrBlackFourLayersCreatedFromResults.forEach(function(tmpResult) {
                objBlackFourLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    // DJ_�������@�敪
                    orderMethodTyp: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp'}),
                    // DJ_��������ԍ�
                    customerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5'}),
                    // DJ_FINET�J�i�Z��
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress'}),
                    // DJ_FINET�J�i�Z��_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2'}),
                    // DJ_FINET�J�i�Z��_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3'}),
                    // DJ_FINET�J�i�Z��_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4'}),
                    // DJ_FINET�J�i�Z��_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5'})
                };
            });
        }
        /** ���`�[�����p�}�X�^���擾 end */
    
        for (let finalDestinationCode in objAllDatasByDestinationCode) {
    
            /** �ϐ����Z�b�g */
            numFileHeaderRecordSendDataCount = 0;
            numEndRecordRecordCount = 0;
            // 8.4 �G���h���R�[�h.���ŋ��z���v
            amountEndRecordRawVersionTotal = 0;
            // 8.6 �G���h���R�[�h.����e����z���v
            amountEndRecordRecoverContainerTotal = 0;
            // �f�[�^�V���A���ԍ�
            numDataSerialNumber = 1;
    
            /**
             * �Y���ŏI���M��R�[�h�ʏ�f�[�^
             * @type {object} 
             * @param {string} key �g�����U�N�V��������ID
             * @param {object} value �f�[�^
             */
            var objCurrentDestinationNormalData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].normal;
            /**
             * �Y���ŏI���M��R�[�h���f�[�^
             * @type {object} 
             * @param {string} key �g�����U�N�V��������ID
             * @param {object} value �f�[�^
             */
            var objCurrentDestinationBlackData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].black;
    
            /**
             * �Y���ŏI���M��R�[�h�ԃf�[�^
             * @type {object} 
             * @param {string} key �g�����U�N�V��������ID
             * @param {object} value �f�[�^
             */
            var objCurrentDestinationRedData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].red;
    
            /**
             * �t�@�C���w�b�_�[���R�[�h���f�[�^�͒ʏ�`�[�ł��邩
             * @type {boolean}
             */
            var flgIsNormalData = false;
    
            /**
             * �������@�敪��FINET�ł��邩
             * @type {boolean}
             */
            var flgIsOrderMethodFinet = false;
            /**
             * �t�@�C���w�b�_�[���R�[�h���f�[�^
             */
            var objFileHeaderSearchResult = '';
    
            /**
             * �f�[�^�̓��ꌏ�ڃf�[�^��ID
             * @type {string}
             */
            var strFirstDataId = '';
    
            if (Object.keys(objCurrentDestinationNormalData).length > 0) {
                flgIsNormalData = true;
                strFirstDataId = Object.keys(objCurrentDestinationNormalData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationNormalData[strFirstDataId][0];
                flgIsOrderMethodFinet = (objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
            } else if (Object.keys(objCurrentDestinationRedData).length > 0) {
                strFirstDataId = Object.keys(objCurrentDestinationRedData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationRedData[strFirstDataId][0];
            } else if (Object.keys(objCurrentDestinationBlackData).length > 0) {
                strFirstDataId = Object.keys(objCurrentDestinationBlackData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationBlackData[strFirstDataId][0];
            } else {
                continue;
            }
    
            /**
             * �t�@�C���w�b�_�[���R�[�h���f�[�^
             * @type {object}
             */
            let objFileHeaderData = {
                /** �f�[�^�V���A��No. */
                serialNumber: numDataSerialNumber,
                /** �o�׋敪 */
                shippingType: '04',
                /** �V�X�e�����t */
                systemDate: strSystemDate,
                /** �V�X�e������ */
                systemTime: strSystemTime,
                /** DJ_�������@�敪 */
                orderMethod: objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }),
                /** ���M���Z���^�[�R�[�h */
                senderCenterCode: objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_final_dest_code' }),
                /** �ŏI���M��R�[�h */
                finalDestinationCode: (
                    flgIsNormalData
                        ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sender_center_code'})
                        : objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                ),
                /** �ŏI���M��R�[�h�i�\���j */
                finalDestinationCodeBk: (
                    flgIsNormalData
                        ? (flgIsOrderMethodFinet ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sendercentercode_s' }) : ' ')
                        : ' '
                ),
                /** ���ڑ��M���ƃR�[�h */
                directDestinationCompanyCode: (
                    flgIsNormalData
                        ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sender_center_code' })
                        : objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                ),
                /** ���ڑ��M���ƃR�[�h�i�\���j */
                directDestinationCompanyCodeBk: (
                    flgIsNormalData
                        ? (flgIsOrderMethodFinet ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sendercentercode_s' }) : ' ')
                        : ' '
                )
            };
    
            /**
             * �t�@�C���w�b�_���R�[�h
             * @type {object}
             */
            const objFileHeaderJson = createFinetShippingFileHeaderRecord(objFileHeaderData, flgIsNormalData)
    
            // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
            numFileHeaderRecordSendDataCount++;
    
            // �f�[�^�V���A���ԍ�
            numDataSerialNumber++;
    
            /**
             * ���X�R�[�h���z��
             * @type {Array}
             */
            let arrStoreCodes = [];
    
            /**
             * �ꎟ�X�R�[�h
             * @type {string}
             */
            let strFirstStoreCode = '';
    
            /**
             * �񎟓X�R�[�h
             * @type {string}
             */
            let strSecondStoreCode = '';
    
            /**
             * �O���X�R�[�h
             * @type {string}
             */
            let strThirdStoreCode = '';
    
            /**
             * �l���X�R�[�h
             * @type {string}
             */
            let strForthStoreCode = '';
    
            /**
             * �܎��X�R�[�h
             * @type {string}
             */
            let strFifthStoreCode = '';
    
            /**
             * ��`���
             * @type {string}
             */
            let strBillsInfo = '';
    
            /**
             * �q���敪
             * @type {string}
             */
            let strLocationType = '';
    
            /**
             * �`�[�f�[�^�z��
             * @type {Array}
             */
            let arrOrderRecords = [];
    
            for (let strNormalDataId in objCurrentDestinationNormalData) {
                /** �ʏ�f�[�^������ */
    
                if (objTransactionIds.salesOrderIds.indexOf(strNormalDataId.toString()) < 0) {
                    objTransactionIds.salesOrderIds.push(strNormalDataId.toString());
                }
    
                /** �ϐ��l���Z�b�g */
                arrStoreCodes = [];
                strBillsInfo = '';
                strLocationType = '';
    
                /**
                 * �Y������ID���ʏ�f�[�^
                 * @type {Array}
                 */
                let arrCurrentNormalData = objCurrentDestinationNormalData[strNormalDataId];

                try {
                    /** �ꎟ�X�R�[�h */
                    strFirstStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_first_store_code' });
                    /** �񎟓X�R�[�h */
                    strSecondStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_second_store_code' });
                    /** �O���X�R�[�h */
                    strThirdStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_third_store_code' });
                    /** �l���X�R�[�h */
                    strForthStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_fourth_store_code' });
                    /** �܎��X�R�[�h */
                    strFifthStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_fifth_store_code' });
        
                    if (strFirstStoreCode != null && strFirstStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strFirstStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomeraddress' })
                        });
                    }
                    if (strSecondStoreCode != null && strSecondStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strSecondStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername2' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option2' })
                        });
                    }
                    if (strThirdStoreCode != null && strThirdStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strThirdStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername_o3' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option3' })
                        });
                    }
                    if (strForthStoreCode != null && strForthStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strForthStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername4' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option4' })
                        });
                    }
                    if (strFifthStoreCode != null && strFifthStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strFifthStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername5' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option5' })
                        });
                    }
        
                    /**
                     * �o�׋敪�i�ʏ�j
                     * @type {string}
                     */
                    let strNormalShippingType = '00';
                    if (strNormalDataId.indexOf('discount') >= 0) {
                        /** �l���A�C�e���f�[�^�̏ꍇ */
                        strNormalShippingType = '60';
                    }

                    // ��`���
                    strBillsInfo = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_bills_info' });
                    if (strBillsInfo != null && strBillsInfo != '') {
                        strBillsInfo = commonTypeCodeById[(strBillsInfo.toString())];
                    }
                    // �q���敪
                    strLocationType = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_location_type' });
                    if (strLocationType != null && strLocationType != '') {
                        strLocationType = commonTypeCodeById[(strLocationType.toString())];
                    }
        
                    // DJ_�������@�敪��FINET�ł��邩
                    flgIsOrderMethodFinet = (arrCurrentNormalData[0].getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
                    
                    /**
                     * �`�[�w�b�_�[���R�[�h���f�[�^
                     * @type {object}
                     */
                    let objNormalOrderHeaderData = {
                        // �f�[�^�V���A��No.
                        serialNumber: numDataSerialNumber,
                        // �o�׋敪
                        shippingType: strNormalShippingType,
                        // �`�[���t
                        tranDate: arrCurrentNormalData[0].getValue({ name: 'trandate' }),
                        // �o�ד�
                        shipDate: arrCurrentNormalData[0].getValue({ name: 'shipdate' }),
                        // �`�[�ԍ�
                        transactionNumber: arrCurrentNormalData[0].getValue({ name: 'transactionnumber' }),
                        // �⏕�`�[No.
                        auxiliaryOrderNo: '',
                        // �ꎟ�X�R�[�h
                        firstStoreCode: strFirstStoreCode,
                        // �񎟓X�R�[�h
                        secondStoreCode: strSecondStoreCode,
                        // �O���X�R�[�h
                        thirdStoreCode: strThirdStoreCode,
                        // �l���X�R�[�h
                        forthStoreCode: strForthStoreCode,
                        // �܎��X�R�[�h
                        fifthStoreCode: strFifthStoreCode,
                        // ��`���
                        billsInfo: (flgIsOrderMethodFinet ? strBillsInfo : ' '),
                        // �q���敪
                        locationType: (flgIsOrderMethodFinet ? strLocationType : ' '),
                        // �q�ɃR�[�h
                        locationCode: (objLocationInfo.hasOwnProperty(arrCurrentNormalData[0].getValue({ name: 'location' }).toString()) ? objLocationInfo[(arrCurrentNormalData[0].getValue({ name: 'location' }).toString())].externalId.slice(1, 3) : '')
                    };
        
                    /**
                     * �`�[�w�b�_�[���R�[�h
                     * @type {object}
                     */
                    const objNormalOrderHeaderJson = createFinetShippingOrderHeaderRecord(objNormalOrderHeaderData);
        
                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                    numFileHeaderRecordSendDataCount++;
                    // �f�[�^�V���A���ԍ�
                    numDataSerialNumber++;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h1�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson1 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h1�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson1 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h2�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson2 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h2�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson2 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h3�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson3 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h3�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson3 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h4�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson4 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h4�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson4 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h5�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson5 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h5�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson5 = null;
        
                    if (flgIsOrderMethodFinet) {
                        /** �������@�敪�́uFINET�v�ł���ꍇ */
        
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjNormalOrderHeaderOptionalJson = createFinetShippingOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: index + 1,
                                // �Ж��E�X���E����於
                                customerName: tmpStoreCodeInfo['customerName'],
                                // �Z��
                                customerAddress: tmpStoreCodeInfo['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
        
                            if (tmpObjNormalOrderHeaderOptionalJson != null && tmpObjNormalOrderHeaderOptionalJson != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
        
                            let tmpObjNormalOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjNormalOrderHeaderOptionalSubJson = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                                if (tmpObjNormalOrderHeaderOptionalSubJson != null && tmpObjNormalOrderHeaderOptionalSubJson != '') {
                                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                    numFileHeaderRecordSendDataCount++;
                                    // �f�[�^�V���A���ԍ�
                                    numDataSerialNumber++;
                                }
                            }
        
                            switch (index) {
                                case 0:
                                    objNormalOrderHeaderOptionalJson1 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson1 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objNormalOrderHeaderOptionalJson2 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson2 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objNormalOrderHeaderOptionalJson3 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson3 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objNormalOrderHeaderOptionalJson4 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson4 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objNormalOrderHeaderOptionalJson5 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson5 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objNormalOrderHeaderOptionalJson1 = createFinetShippingOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: arrStoreCodes.length,
                                // �Ж��E�X���E����於
                                customerName: arrCurrentNormalData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // �Z��
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
        
                            if (objNormalOrderHeaderOptionalJson1 != null && objNormalOrderHeaderOptionalJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
        
                            objNormalOrderHeaderOptionalSubJson1 = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                            if (objNormalOrderHeaderOptionalSubJson1 != null && objNormalOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
                        }
                    }
        
                    /**
                     * �`�[���׍s���R�[�h�i�ʏ�jJSON�z��
                     * @type {Array}
                     */
                    let arrNormalOrderLineRecords = [];
        
                    arrCurrentNormalData.forEach(function (objCurrentNormalData, index) {
        
                        /**
                         * ����.�A�C�e������ID
                         * @type {number}
                         */
                        let numCurrentNormalItemInternalId = objCurrentNormalData.getValue({ name: 'item' });
        
                        /**
                         * ����.�A�C�e��.�A�C�e��ID
                         * @type {string}
                         */
                        let strCurrentNormalItemId = objCurrentNormalData.getValue({ name: 'itemid', join: 'item' });
        
                        /**
                         * ����.�A�C�e��.UPC�R�[�h
                         * @type {string}
                         */
                        let strCurrentNormalUpcCd = objCurrentNormalData.getValue({ name: 'upccode', join: 'item' });
        
                        let strTmpKey = [
                            strCurrentNormalItemId,
                            objCurrentNormalData.getValue({ name: 'custbody_djkk_finet_sender_center_code' })
                        ].join('-');
        
                        let strCurrentNormalUnit = objCurrentNormalData.getValue({ name: 'unit' });
                        if (numCurrentNormalItemInternalId != null && numCurrentNormalItemInternalId != '') {
                            strCurrentNormalUnit = unitCodeByItem[(numCurrentNormalItemInternalId.toString())];
                        }
                        let numCurrentNormalOrderQuantity = Math.abs(objCurrentNormalData.getValue({ name: 'quantity' }));
                        if (strCurrentNormalUnit == '3') {
                            // �o���̏ꍇ
                            numCurrentNormalOrderQuantity = Math.abs(objCurrentNormalData.getValue({ name: 'quantity' }));
                        }
                        if (strCurrentNormalUnit == '1') {
                            numCurrentNormalOrderQuantity = Math.abs(Math.ceil(Number(objCurrentNormalData.getValue({ name: 'quantity' }))) / Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
        
                        let strNormalLineNo = objCurrentNormalData.getValue({ name: 'custcol_djkk_exsystem_line_num' });
                        if (strNormalDataId.indexOf('-discount') >= 0) {
                            /** �l���A�C�e���s�̏ꍇ */
                            strNormalLineNo = index + 1;
                        }
                        strNormalLineNo = strNormalLineNo.toString();

                        /**
                         * ���׍s���R�[�h���f�[�^
                         * @type {object}
                         */
                        let objNormalOrderLineData = {
                            // �f�[�^�V���A��No.
                            serialNumber: numDataSerialNumber,
                            // �`�[�sNo
                            lineNumber: strNormalLineNo,
                            // ���i�R�[�h
                            itemCode: (finetItemCodeMapping.hasOwnProperty(strTmpKey.toString()) ? finetItemCodeMapping[(strTmpKey.toString())] : strCurrentNormalUpcCd),
                            // ���i���i�J�i�j
                            itemNameKana: objCurrentNormalData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // ����
                            orderQuantity: numCurrentNormalOrderQuantity,
                            // ����
                            unitQuantity: objCurrentNormalData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ����(�W��)
                            quantity: Math.abs(objCurrentNormalData.getValue({ name: 'quantity' })),
                            // �P��
                            unit: strCurrentNormalUnit,
                            // �P��
                            rate: objCurrentNormalData.getValue({ name: 'rate' }),
                            // .DJ_����
                            itemUnitQuantity: objCurrentNormalData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ��������
                            billingCloseDate: formatDate(objCurrentNormalData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_�[�i�����ה��l
                            deliveryNoteMemo: objCurrentNormalData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // ����No.
                            orderNo: (flgIsOrderMethodFinet ? objCurrentNormalData.getValue({ name: 'custbody_djkk_customerorderno' }) : objCurrentNormalData.getValue({ name: 'custbody_djkk_customerorderno' }).slice(0, 8)),
                            // ���i�R�[�h�g�p�敪
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strTmpKey.toString()) ? '1' : '3')
                        };
        
                        arrNormalOrderLineRecords.push(createFinetShippingLineRecord(objNormalOrderLineData));
        
                        // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 �G���h���R�[�h.���R�[�h����
                        numEndRecordRecordCount++;
                        // �f�[�^�V���A���ԍ�
                        numDataSerialNumber++;
                                            
                        // 8.4 �G���h���R�[�h.���ŋ��z���v
                        if (Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strNormalShippingType) >= 0 && Number(strNormalShippingType) <= 9) || Number(strNormalShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentNormalData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentNormalData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentNormalData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentNormalData.getValue({ name: 'quantity' })));
                            }
                        } else {
                            if ((Number(strNormalShippingType) >= 0 && Number(strNormalShippingType) <= 9) || Number(strNormalShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                    });
        
                    /**
                     * �`�[�f�[�^JSON
                     * @type {object}
                     */
                    let objNormalOrderJson = {
                        orderHeaderRecord: objNormalOrderHeaderJson,
                        orderHeaderOptionalRecord1: objNormalOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objNormalOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objNormalOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objNormalOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objNormalOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objNormalOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objNormalOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objNormalOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objNormalOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objNormalOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrNormalOrderLineRecords
                    }
        
                    if (objNormalOrderHeaderOptionalJson1 == null || objNormalOrderHeaderOptionalJson1 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objNormalOrderHeaderOptionalSubJson1 == null || objNormalOrderHeaderOptionalSubJson1 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord1;
                    }
        
                    if (objNormalOrderHeaderOptionalJson2 == null || objNormalOrderHeaderOptionalJson2 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord2;
                    }
        
                    if (objNormalOrderHeaderOptionalSubJson2 == null || objNormalOrderHeaderOptionalSubJson2 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord2;
                    }
        
                    if (objNormalOrderHeaderOptionalJson3 == null || objNormalOrderHeaderOptionalJson3 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord3;
                    }
        
                    if (objNormalOrderHeaderOptionalSubJson3 == null || objNormalOrderHeaderOptionalSubJson3 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord3;
                    }
        
                    if (objNormalOrderHeaderOptionalJson4 == null || objNormalOrderHeaderOptionalJson4 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord4;
                    }
        
                    if (objNormalOrderHeaderOptionalSubJson4 == null || objNormalOrderHeaderOptionalSubJson4 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord4;
                    }
        
                    if (objNormalOrderHeaderOptionalJson5 == null || objNormalOrderHeaderOptionalJson5 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord5;
                    }
        
                    if (objNormalOrderHeaderOptionalSubJson5 == null || objNormalOrderHeaderOptionalSubJson5 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord5;
                    }
        
                    arrOrderRecords.push(objNormalOrderJson);
                } catch(error) {
                    log.error({
                        title: '�o�׈ē�-�ʏ�f�[�^-�����G���[',
                        details: '�y�g�����U�N�V�����ԍ��z: ' + arrCurrentNormalData[0].getValue({name: 'tranid'}) + '\n�y�G���[�z: ' + error
                    });
                }
            }
    
            for (let strRedDataId in objCurrentDestinationRedData) {
                /** �ԓ`�[�f�[�^���� */

                if (objTransactionIds.creditMemoIds.indexOf(strRedDataId.toString()) < 0) {
                    objTransactionIds.creditMemoIds.push(strRedDataId.toString());
                }
    
                /** �ϐ��l���Z�b�g */
                arrStoreCodes = [];
                strBillsInfo = '';
                strLocationType = '';
    
                /**
                 * �Y������ID���ԓ`�[�f�[�^
                 * @type {Array}
                 */
                let arrCurrentRedData = objCurrentDestinationRedData[strRedDataId];

                try {
                    /**
                     * �o�׋敪�i�ԓ`�j
                     * @type {string}
                     */
                    let strRedShippingType = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' });
                    if (strRedDataId.indexOf('-discount') >= 0) {
                        /** �l���A�C�e���f�[�^�̏ꍇ */
                        strRedShippingType = '61'
                    }
    
                    /**
                     * �쐬��.�쐬��.����ID�i�ԓ`�[�j
                     * @type {number}
                     */
                    let numRedCurrentDataCreatedFromId = arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'});
    
                    /**
                     * �Y���ԓ`�[�f�[�^�쐬���i��K�w�j���
                     * @type {object}
                     */
                    let objCurrentRedDataTwoLayersCreatedFromInfo = null;
                    if (numRedCurrentDataCreatedFromId && objRedTwoLayersCreatedFromInfos.hasOwnProperty(numRedCurrentDataCreatedFromId.toString())) {
                        objCurrentRedDataTwoLayersCreatedFromInfo = objRedTwoLayersCreatedFromInfos[(numRedCurrentDataCreatedFromId.toString())];
                    }
        
                    /** �ꎟ�X�R�[�h */
                    strFirstStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' });
                    /** �񎟓X�R�[�h */
                    strSecondStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' });
                    /** �O���X�R�[�h */
                    strThirdStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' });
                    /** �l���X�R�[�h */
                    strForthStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' });
                    /** �܎��X�R�[�h */
                    strFifthStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' });
    
                    let flgRedHasCreatedFromSalesOrder = false;
    
                    if (objCurrentRedDataTwoLayersCreatedFromInfo) {
                        flgRedHasCreatedFromSalesOrder = true;
                    }
    
                    /**
                     * �������@�敪
                     * @type {string}
                     */
                    let strRedOrderMethodType = '';
                    if (flgRedHasCreatedFromSalesOrder) {
                        /** �쐬���������Q�Ƃł���ꍇ */
    
                        strRedOrderMethodType = objCurrentRedDataTwoLayersCreatedFromInfo.orderMethodType;
                        if (strRedShippingType == '10') {
                            /** �o�׋敪�́u10:�ԕi�v�̏ꍇ */
                            strRedOrderMethodType = objCurrentRedDataTwoLayersCreatedFromInfo.createdFromOrderMethodType;
                        }
                    } else {
                        strRedOrderMethodType = arrCurrentRedData[0].getValue({name: 'custbody_djkk_ordermethodrtyp'});
                    }
    
                    if (commonTypeCodeById.hasOwnProperty(strRedOrderMethodType.toString())) {
                        strRedOrderMethodType = commonTypeCodeById[strRedOrderMethodType.toString()];
                    } else {
                        strRedOrderMethodType = '';
                    }
                    
                    if (flgRedHasCreatedFromSalesOrder) {
                        if (strRedShippingType == '10') {
                            /** �o�׋敪�́u10:�ԕi�v�̏ꍇ */
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName1,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress1
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName2,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress2
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName3,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress3
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName4,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress4
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName5,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress5
                                });
                            }
                        } else {
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName1,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address1
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName2,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address2
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName3,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address3
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName4,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address4
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName5,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address5
                                });
                            }
                        }
                    } else {
                        if (strFirstStoreCode != null && strFirstStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFirstStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strSecondStoreCode != null && strSecondStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strSecondStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strThirdStoreCode != null && strThirdStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strThirdStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strForthStoreCode != null && strForthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strForthStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strFifthStoreCode != null && strFifthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFifthStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                    }
    
                    /**
                     * �ԓ`�[�⏕�`�[�ԍ�
                     * @type {string}
                     */
                    let strRedAuxiliaryOrderNo = '';
                    if (strRedShippingType == '10') {
                        // �o�׋敪�͕ԕi�ł���ꍇ
                        strRedAuxiliaryOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.transactionNumber;
                    } else {
                        if (arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' })) {
                            strRedAuxiliaryOrderNo = arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' })[0] + arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' }).slice(-7);
                        }
                    }
        
                    flgIsOrderMethodFinet = (arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
    
                    /**
                     * �Y���ԓ`�[�ɓ�K�w�̍쐬�������邩
                     * @type {boolean}
                     */
                    let flgCurrentRedHasTwoCreatedFrom = false;
                    if (arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'})) {
                        flgCurrentRedHasTwoCreatedFrom = true;
                    }
    
                    /**
                     * �`�[�w�b�_�[���R�[�h���f�[�^�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderData = {
                        // �f�[�^�V���A��No.
                        serialNumber: numDataSerialNumber,
                        // �o�׋敪
                        shippingType: strRedShippingType,
                        // �`�[���t
                        tranDate: arrCurrentRedData[0].getValue({ name: 'trandate' }),
                        // �o�ד�
                        shipDate: arrCurrentRedData[0].getValue({ name: 'trandate' }),
                        // �`�[�ԍ�
                        transactionNumber: arrCurrentRedData[0].getValue({ name: 'transactionnumber' }),
                        // �⏕�`�[No.
                        auxiliaryOrderNo: strRedAuxiliaryOrderNo,
                        // �ꎟ�X�R�[�h
                        firstStoreCode: strFirstStoreCode,
                        // �񎟓X�R�[�h
                        secondStoreCode: strSecondStoreCode,
                        // �O���X�R�[�h
                        thirdStoreCode: strThirdStoreCode,
                        // �l���X�R�[�h
                        forthStoreCode: strForthStoreCode,
                        // �܎��X�R�[�h
                        fifthStoreCode: strFifthStoreCode,
                        // ��`���
                        billsInfo: ' ',
                        // �q���敪
                        locationType: ' ',
                        // �q�ɃR�[�h
                        locationCode: (arrCurrentRedData[0].getValue({ name: 'location' }) ? objLocationInfo[arrCurrentRedData[0].getValue({ name: 'location' }).toString()].externalId.slice(1, 3) : '')
                    };
        
                    /**
                     * �`�[�w�b�_���R�[�h�i�ԓ`�[�j
                     * @type {object}
                     */
                    const objRedOrderHeaderJson = createFinetShippingOrderHeaderRecord(objRedOrderHeaderData);
        
                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                    numFileHeaderRecordSendDataCount++;
                    // �f�[�^�V���A���ԍ�
                    numDataSerialNumber++;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h1�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson1 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h1�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson1 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h2�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson2 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h2�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson2 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h3�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson3 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h3�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson3 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h4�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson4 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h4�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson4 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h5�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson5 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h5�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson5 = null;
        
                    if (strRedOrderMethodType == '1') {
                        /** �������@�敪�́uFINET�v�̏ꍇ */
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjRedOrderHeaderOptionalJson = createFinetShippingOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: index + 1,
                                // �Ж��E�X���E����於
                                customerName: tmpStoreCodeInfo['customerName'],
                                // �Z��
                                customerAddress: tmpStoreCodeInfo['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
        
                            if (tmpObjRedOrderHeaderOptionalJson != null && tmpObjRedOrderHeaderOptionalJson != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
        
                            let tmpObjRedOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjRedOrderHeaderOptionalSubJson = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                                if (tmpObjRedOrderHeaderOptionalSubJson != null && tmpObjRedOrderHeaderOptionalSubJson != '') {
                                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                    numFileHeaderRecordSendDataCount++;
                                    // �f�[�^�V���A���ԍ�
                                    numDataSerialNumber++;
                                }
                            }
        
                            switch (index) {
                                case 0:
                                    objRedOrderHeaderOptionalJson1 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson1 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objRedOrderHeaderOptionalJson2 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson2 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objRedOrderHeaderOptionalJson3 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson3 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objRedOrderHeaderOptionalJson4 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson4 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objRedOrderHeaderOptionalJson5 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson5 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objRedOrderHeaderOptionalJson1 = createFinetShippingOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: arrStoreCodes.length,
                                // �Ж��E�X���E����於
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // �Z��
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
        
                            if (objRedOrderHeaderOptionalJson1 != null && objRedOrderHeaderOptionalJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
        
                            objRedOrderHeaderOptionalSubJson1 = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                            if (objRedOrderHeaderOptionalSubJson1 != null && objRedOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
                        }
                    }
        
                    /**
                     * �`�[���׍s���R�[�h�i�ԓ`�[�jJSON�z��
                     * @type {Array}
                     */
                    let arrRedOrderLineRecords = [];
        
                    arrCurrentRedData.map(function (objCurrentRedData, index) {
        
                        let strRedTmpKey = [
                            objCurrentRedData.getValue({ name: 'itemid', join: 'item' }),
                            objCurrentRedData.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                        ].join('-');
        
                        let strRedItemInternalId = objCurrentRedData.getValue({ name: 'item' });
                        let strRedUnit = '';
                        if (strRedItemInternalId) {
                            strRedUnit = unitCodeByItem[strRedItemInternalId.toString()];
                        }
        
                        let numRedOrderQuantity = Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                        if (strRedUnit == '3') {
                            /** �o�גP�ʂ��u�o���v�̏ꍇ */
                            numRedOrderQuantity = Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                        }
                        if (strRedUnit == '1') {
                            /** �o�גP�ʂ��u�P�[�X�v�̏ꍇ */
                            numRedOrderQuantity = Math.ceil(Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' }))) / Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
        
                        if (strRedShippingType == '11' || strRedShippingType == '10') {
                            /** �o�׋敪�́u11:�o�׎���i�ԓ`�j�v�A�u10:�ԕi�v�̏ꍇ */
                            numRedOrderQuantity = 0 - Math.abs(numRedOrderQuantity);
                        } else {
                            numRedOrderQuantity = Math.abs(numRedOrderQuantity);
                        }
    
                        /**
                         * �ԓ`.����No
                         * @type {string}
                         */
                        let strRedOrderNo = '';
                        strRedOrderNo = objCurrentRedData.getValue({name: 'custbody_djkk_customerorderno'});
    
                        if (strRedShippingType == '10') {
                            /** �o�׋敪�́u10:�ԕi�v�̏ꍇ */
                            if (objCurrentRedDataTwoLayersCreatedFromInfo && objCurrentRedDataTwoLayersCreatedFromInfo.createdFrom) {
                                /** �쐬������������ł���ꍇ */
    
                                strRedOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerOrderNo;
                            }
                        } else {
                            /** �o�׋敪�́u10:�ԕi�v�̏ꍇ */
                            if (objCurrentRedDataTwoLayersCreatedFromInfo) {
                                /** �쐬������������ł���ꍇ */
    
                                strRedOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.customerOrderNo;
                            }
                        }
    
                        if (strRedOrderNo && strRedOrderNo.length > 8) {
                            strRedOrderNo = strRedOrderNo.slice(0, 8);
                        }
    
                        /**
                         * ���׍s���R�[�h���f�[�^�i�ԓ`�[�j
                         * @type {object}
                         */
                        let objRedOrderLineData = {
                            // �f�[�^�V���A��No.
                            serialNumber: numDataSerialNumber,
                            // �`�[�sNo
                            lineNumber: index + 1,
                            // ���i�R�[�h
                            itemCode: (
                                finetItemCodeMapping.hasOwnProperty(strRedTmpKey.toString())
                                    ? finetItemCodeMapping[(strRedTmpKey.toString())]
                                    : objCurrentRedData.getValue({ name: 'upccode', join: 'item' })
                            ),
                            // ���i���i�J�i�j
                            itemNameKana: objCurrentRedData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // ����
                            orderQuantity: numRedOrderQuantity,
                            // ����
                            unitQuantity: objCurrentRedData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ����(�W��)
                            quantity: numRedOrderQuantity,
                            // �P��
                            unit: strRedUnit,
                            // �P��
                            rate: objCurrentRedData.getValue({ name: 'rate' }),
                            // DJ_���萔(�����)
                            itemUnitQuantity: objCurrentRedData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ��������
                            billingCloseDate: formatDate(objCurrentRedData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_�[�i�����ה��l
                            deliveryNoteMemo: objCurrentRedData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // ����No.
                            orderNo: strRedOrderNo,
                            // ���i�R�[�h�g�p�敪
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strRedTmpKey.toString()) ? '1' : '3')
                        };
        
                        arrRedOrderLineRecords.push(createFinetShippingLineRecord(objRedOrderLineData));
        
                        // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 �G���h���R�[�h.���R�[�h����
                        numEndRecordRecordCount++;
                        // �f�[�^�V���A���ԍ�
                        numDataSerialNumber++;
                      
                        // 8.4 �G���h���R�[�h.���̋��z���v
                        if (Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strRedShippingType) >= 0 && Number(strRedShippingType) <= 9) || Number(strRedShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentRedData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentRedData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                            }
        
                        } else {
                            if ((Number(strRedShippingType) >= 0 && Number(strRedShippingType) <= 9) || Number(strRedShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                    });
        
                    let objRedOrderJson = {
                        orderHeaderRecord: objRedOrderHeaderJson,
                        orderHeaderOptionalRecord1: objRedOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objRedOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objRedOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objRedOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objRedOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objRedOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objRedOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objRedOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objRedOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objRedOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrRedOrderLineRecords
                    };
        
                    if (objRedOrderHeaderOptionalJson1 == null || objRedOrderHeaderOptionalJson1 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objRedOrderHeaderOptionalSubJson1 == null || objRedOrderHeaderOptionalSubJson1 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord1;
                    }
        
                    if (objRedOrderHeaderOptionalJson2 == null || objRedOrderHeaderOptionalJson2 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord2;
                    }
        
                    if (objRedOrderHeaderOptionalSubJson2 == null || objRedOrderHeaderOptionalSubJson2 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord2;
                    }
        
                    if (objRedOrderHeaderOptionalJson3 == null || objRedOrderHeaderOptionalJson3 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord3;
                    }
        
                    if (objRedOrderHeaderOptionalSubJson3 == null || objRedOrderHeaderOptionalSubJson3 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord3;
                    }
        
                    if (objRedOrderHeaderOptionalJson4 == null || objRedOrderHeaderOptionalJson4 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord4;
                    }
        
                    if (objRedOrderHeaderOptionalSubJson4 == null || objRedOrderHeaderOptionalSubJson4 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord4;
                    }
        
                    if (objRedOrderHeaderOptionalJson5 == null || objRedOrderHeaderOptionalJson5 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord5;
                    }
        
                    if (objRedOrderHeaderOptionalSubJson5 == null || objRedOrderHeaderOptionalSubJson5 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord5;
                    }
        
                    arrOrderRecords.push(objRedOrderJson);
                } catch(error) {
                    log.error({
                        title: '�o�׈ē�-�ԓ`�[�f�[�^-�����G���[',
                        details: '�y�g�����U�N�V�����ԍ��z: ' + arrCurrentRedData[0].getValue({name: 'tranid'}) + '\n�y�G���[�z: ' + error
                    });
                }
            }
    
            for (var strBlackDataId in objCurrentDestinationBlackData) {
                /** ���`�[�f�[�^���� */
    
                if (objTransactionIds.invoiceIds.indexOf(strBlackDataId.toString()) < 0) {
                    objTransactionIds.invoiceIds.push(strBlackDataId.toString());
                }
    
                /**
                 * �Y������ID�����`�[�f�[�^
                 * @type {Array}
                 */
                let arrCurrentBlackData = objCurrentDestinationBlackData[strBlackDataId];

                try {
                    /**
                     * �쐬��.�쐬��.����ID
                     * @type {number}
                     */
                    let numBlackCurrentDataCreatedFromId = arrCurrentBlackData[0].getValue({name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo'});
    
                    /**
                     * ���`�[�쐬�����i��K�w�j
                     */
                    let objCurrentBlackTwoLayersInfo = null;
    
                    if (numBlackCurrentDataCreatedFromId && objBlackTwoLayersCreatedFromInfos.hasOwnProperty(numBlackCurrentDataCreatedFromId)) {
                        objCurrentBlackTwoLayersInfo = objBlackTwoLayersCreatedFromInfos[numBlackCurrentDataCreatedFromId.toString()];
                    }
    
                    /**
                     * ���`�[�쐬�����i�l�K�w�j
                     */
                    let objCurrentBlackFourLayersInfo = null;
                    if (objCurrentBlackTwoLayersInfo && objCurrentBlackTwoLayersInfo.fourLayersCreatedFrom) {
                        objCurrentBlackFourLayersInfo = objBlackFourLayersCreatedFromInfos[(objCurrentBlackTwoLayersInfo.fourLayersCreatedFrom.toString())];
                    }
    
                    /** �ϐ��l���Z�b�g */
                    arrStoreCodes = [];
                    strBillsInfo = '';
                    strLocationType = '';
        
                    flgIsOrderMethodFinet = (arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
        
                    /**
                     * �o�׋敪�i���`�[�j
                     * @type {string}
                     */
                    let strBlackShippingType = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' });
        
                    if (strBlackDataId.indexOf('-discount') >= 0) {
                        /** �l���A�C�e���f�[�^�̏ꍇ */
                        strBlackShippingType = '60';
                    }
    
                    /**
                     * �쐬������������ł��邩
                     * @type {boolean}
                     */
                    let flgBlackHasCreatedFromSalesOrder = false;
    
                    /**
                     * �������@�敪�i���`�j
                     * @type {string}
                     */
                    let strBlackOrderMethodType = '';
                    
                    if (strBlackShippingType == '01') {
                        /** �o�׋敪�́u01:�ԕi����v�̏ꍇ */
                        if (objCurrentBlackFourLayersInfo) {
                            strBlackOrderMethodType = objCurrentBlackFourLayersInfo.orderMethodTyp;
                            flgBlackHasCreatedFromSalesOrder = true;
                        }
                    } else {
                        if (objCurrentBlackTwoLayersInfo) {
                            strBlackOrderMethodType = objCurrentBlackTwoLayersInfo.orderMethodTyp;
                            flgBlackHasCreatedFromSalesOrder = true;
                        }
                    }
    
                    if (!flgBlackHasCreatedFromSalesOrder) {
                        strBlackOrderMethodType = arrCurrentBlackData[0].getValue({name: 'custbody_djkk_ordermethodrtyp'});
                    }
    
                    if (strBlackOrderMethodType) {
                        strBlackOrderMethodType = commonTypeCodeById[strBlackOrderMethodType.toString()];
                    }
    
                    /** �ꎟ�X�R�[�h */
                    strFirstStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' });
                    /** �񎟓X�R�[�h */
                    strSecondStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' });
                    /** �O���X�R�[�h */
                    strThirdStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' });
                    /** �l���X�R�[�h */
                    strForthStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' });
                    /** �܎��X�R�[�h */
                    strFifthStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' });
        
                    if (flgBlackHasCreatedFromSalesOrder) {
                        if (strBlackShippingType == '01') {
                            /** �o�׋敪�́u01:�ԕi����v�̏ꍇ */
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName1,
                                    address: objCurrentBlackFourLayersInfo.address1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName2,
                                    address: objCurrentBlackFourLayersInfo.address2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName3,
                                    address: objCurrentBlackFourLayersInfo.address3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName4,
                                    address: objCurrentBlackFourLayersInfo.address4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName5,
                                    address: objCurrentBlackFourLayersInfo.address5,
                                });
                            }
                        } else {
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName1,
                                    address: objCurrentBlackTwoLayersInfo.address1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName2,
                                    address: objCurrentBlackTwoLayersInfo.address2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName3,
                                    address: objCurrentBlackTwoLayersInfo.address3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName4,
                                    address: objCurrentBlackTwoLayersInfo.address4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName5,
                                    address: objCurrentBlackTwoLayersInfo.address5,
                                });
                            }
                        }
                    } else {
                        if (strFirstStoreCode != null && strFirstStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFirstStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: '',
                            });
                        }
                        if (strSecondStoreCode != null && strSecondStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strSecondStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: '',
                            });
                        }
                        if (strThirdStoreCode != null && strThirdStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strThirdStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: '',
                            });
                        }
                        if (strForthStoreCode != null && strForthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strForthStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: '',
                            });
                        }
                        if (strFifthStoreCode != null && strFifthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFifthStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: '',
                            });
                        }
                    }
    
                    /**
                     * �⏕�`�[NO.
                     * @type {string}
                     */
                    let strBlackAuxiliaryOrderNo = '';
    
                    if (strBlackShippingType == '01') {
                        /** �o�׋敪�́u01:�ԕi����v�̏ꍇ */
                        if (objCurrentBlackTwoLayersInfo) {
                            strBlackAuxiliaryOrderNo = objCurrentBlackTwoLayersInfo.createdFromTransactionNumber;
                        }
                    } else if (strBlackShippingType == '02') {
                        /** �o�׋敪�́u02:�o�ג����i���`�j�v�̏ꍇ */
                        if (objCurrentBlackTwoLayersInfo) {
                            strBlackAuxiliaryOrderNo = objCurrentBlackTwoLayersInfo.transactionNumber;
                        }
                    } else {
                        strBlackAuxiliaryOrderNo = arrCurrentBlackData[0].getValue({name: 'transactionnumber', join: 'custbody_djkk_invoice_creditmemo'});
                    }
    
                    if (strBlackAuxiliaryOrderNo && strBlackAuxiliaryOrderNo.length > 8) {
                        strBlackAuxiliaryOrderNo = strBlackAuxiliaryOrderNo[0] + strBlackAuxiliaryOrderNo.slice(-7);
                    }
    
    
                    /**
                     * �`�[�w�b�_�[���R�[�h���f�[�^�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderData = {
                        // �f�[�^�V���A��No.
                        serialNumber: numDataSerialNumber,
                        // �o�׋敪
                        shippingType: strBlackShippingType,
                        // �`�[���t
                        tranDate: arrCurrentBlackData[0].getValue({ name: 'trandate' }),
                        // �o�ד� 
                        shipDate: (
                            Number(strBlackShippingType) == '2' ? 
                            objCurrentBlackTwoLayersInfo.shipDate: 
                            arrCurrentBlackData[0].getValue({ name: 'trandate' })
                        ),
                        // �`�[�ԍ�
                        transactionNumber: arrCurrentBlackData[0].getValue({ name: 'transactionnumber' }),
                        // �⏕�`�[No.
                        auxiliaryOrderNo: strBlackAuxiliaryOrderNo,
                        // �ꎟ�X�R�[�h
                        firstStoreCode: strFirstStoreCode,
                        // �񎟓X�R�[�h
                        secondStoreCode: strSecondStoreCode,
                        // �O���X�R�[�h
                        thirdStoreCode: strThirdStoreCode,
                        // �l���X�R�[�h
                        forthStoreCode: strForthStoreCode,
                        // �܎��X�R�[�h
                        fifthStoreCode: strFifthStoreCode,
                        // ��`���
                        billsInfo: ' ',
                        // �q���敪
                        locationType: ' ',
                        // �q�ɃR�[�h
                        locationCode: arrCurrentBlackData[0].getValue({ name: 'externalid', join: 'location' }).slice(1, 3)
                    };
        
                    /**
                     * �`�[�w�b�_�[���R�[�h�i���`�[�j
                     * @type {object}
                     */
                    const objBlackOrderHeaderJson = createFinetShippingOrderHeaderRecord(objBlackOrderHeaderData);
        
                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                    numFileHeaderRecordSendDataCount++;
                    // �f�[�^�V���A���ԍ�
                    numDataSerialNumber++;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h1�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson1 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h1�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson1 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h2�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson2 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h2�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson2 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h3�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson3 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h3�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson3 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h4�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson4 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h4�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson4 = null;
        
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h5�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson5 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h5�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson5 = null;
    
                    if (strBlackOrderMethodType == '1') {
                        /** �������@�敪�́uFINET�v�̏ꍇ�@ */
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjBlackOrderHeaderOptionalJson = createFinetShippingOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: index + 1,
                                // �Ж��E�X���E����於
                                customerName: tmpStoreCodeInfo['customerName'],
                                // �Z��
                                customerAddress: tmpStoreCodeInfo['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
        
                            if (tmpObjBlackOrderHeaderOptionalJson != null && tmpObjBlackOrderHeaderOptionalJson != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
        
                            let tmpObjBlackOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjBlackOrderHeaderOptionalSubJson = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                                if (tmpObjBlackOrderHeaderOptionalSubJson != null && tmpObjBlackOrderHeaderOptionalSubJson != '') {
                                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                    numFileHeaderRecordSendDataCount++;
                                    // �f�[�^�V���A���ԍ�
                                    numDataSerialNumber++;
                                }
                            }
        
                            switch (index) {
                                case 0:
                                    objBlackOrderHeaderOptionalJson1 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson1 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objBlackOrderHeaderOptionalJson2 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson2 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objBlackOrderHeaderOptionalJson3 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson3 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objBlackOrderHeaderOptionalJson4 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson4 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objBlackOrderHeaderOptionalJson5 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson5 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objBlackOrderHeaderOptionalJson1 = createFinetShippingOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: arrStoreCodes.length,
                                // �Ж��E�X���E����於
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // �Z��
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
        
                            if (objBlackOrderHeaderOptionalJson1 != null && objBlackOrderHeaderOptionalJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
        
                            objBlackOrderHeaderOptionalSubJson1 = createFinetShippingOrderHeaderOptionSubRecord(numDataSerialNumber);
        
                            if (objBlackOrderHeaderOptionalSubJson1 != null && objBlackOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
                        }
                    }
        
                    /**
                     * �`�[���׍s���R�[�h�i���`�[�jJSON�z��
                     * @type {Array}
                     */
                    let arrBlackOrderLineRecords = [];
        
                    arrCurrentBlackData.map(function (objCurrentBlackData, index) {
        
                        let strBlackTmpKey = [
                            objCurrentBlackData.getValue({ name: 'itemid', join: 'item' }),
                            objCurrentBlackData.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                        ].join('-');
        
                        let strBlackItemInternalId = objCurrentBlackData.getValue({ name: 'item' });
        
                        let strBlackUnit = '';
                        if (strBlackItemInternalId) {
                            strBlackUnit = unitCodeByItem[strBlackItemInternalId.toString()];
                        }
        
                        let numBlackOrderQuantity = Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                        if (strBlackUnit == '3') {
                            numBlackOrderQuantity = Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                        }
                        if (strBlackUnit == '1') {
                            numBlackOrderQuantity = Math.ceil(Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' }))) / Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
        
                        /**
                         * ���`����No.
                         * @type {string}
                         */
                        let strBlackOrderNo = '';
                        
                        strBlackOrderNo = arrCurrentBlackData[0].getValue({name: 'custbody_djkk_customerorderno'});
                        if (strBlackShippingType == '01') {
                            /** �o�׋敪�́u01:�ԕi����v�̏ꍇ */
                            if (objCurrentBlackFourLayersInfo) {
                                strBlackOrderNo = objCurrentBlackFourLayersInfo.customerOrderNo;
                            }
                        } else {
                            if (objCurrentBlackTwoLayersInfo) {
                                strBlackOrderNo = objCurrentBlackTwoLayersInfo.createdFromCustomerOrderNo;
                            }
                        }
    
                        if (strBlackOrderNo && strBlackOrderNo.length > 8) {
                            strBlackOrderNo = strBlackOrderNo.slice(0, 8);
                        }
    
                        /**
                         * ���׍s���R�[�h���f�[�^�i���`�[�j
                         * @type {object}
                         */
                        let objBlackOrderLineData = {
                            // �f�[�^�V���A��No.
                            serialNumber: numDataSerialNumber,
                            // �`�[�sNo
                            lineNumber: index + 1,
                            // ���i�R�[�h
                            itemCode: (
                                finetItemCodeMapping.hasOwnProperty(strBlackTmpKey.toString())
                                    ? finetItemCodeMapping[(strBlackTmpKey.toString())]
                                    : objCurrentBlackData.getValue({ name: 'upccode', join: 'item' })
                            ),
                            // ���i���i�J�i�j
                            itemNameKana: objCurrentBlackData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // ����
                            orderQuantity: numBlackOrderQuantity,
                            // ����
                            unitQuantity: objCurrentBlackData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ����(�W��)
                            quantity: Math.abs(objCurrentBlackData.getValue({ name: 'quantity' })),
                            // �P��
                            unit: strBlackUnit,
                            // �P��
                            rate: objCurrentBlackData.getValue({ name: 'rate' }),
                            // �A�C�e��.DJ_���萔(�����)
                            itemUnitQuantity: objCurrentBlackData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ��������
                            billingCloseDate: formatDate(objCurrentBlackData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_�[�i�����ה��l
                            deliveryNoteMemo: objCurrentBlackData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // ����No.
                            orderNo: strBlackOrderNo,
                            // ���i�R�[�h�g�p�敪
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strBlackTmpKey.toString()) ? '1' : '3')
                        };
        
                        arrBlackOrderLineRecords.push(createFinetShippingLineRecord(objBlackOrderLineData));
        
                        // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 �G���h���R�[�h.���R�[�h����
                        numEndRecordRecordCount++;
                        // �f�[�^�V���A���ԍ�
                        numDataSerialNumber++;
                      
                        // 8.4 �G���h���R�[�h.���ŋ��z���v
                        if (Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strBlackShippingType) >= 0 && Number(strBlackShippingType) <= 9) || Number(strBlackShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentBlackData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentBlackData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                            }
        
                        } else {
                            if ((Number(strBlackShippingType) >= 0 && Number(strBlackShippingType) <= 9) || Number(strBlackShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                    });
        
                    let objBlackOrderJson = {
                        orderHeaderRecord: objBlackOrderHeaderJson,
                        orderHeaderOptionalRecord1: objBlackOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objBlackOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objBlackOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objBlackOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objBlackOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objBlackOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objBlackOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objBlackOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objBlackOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objBlackOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrBlackOrderLineRecords
                    };
    
                    if (objBlackOrderHeaderOptionalJson1 == null || objBlackOrderHeaderOptionalJson1 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objBlackOrderHeaderOptionalSubJson1 == null || objBlackOrderHeaderOptionalSubJson1 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord1;
                    }
        
                    if (objBlackOrderHeaderOptionalJson2 == null || objBlackOrderHeaderOptionalJson2 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord2;
                    }
        
                    if (objBlackOrderHeaderOptionalSubJson2 == null || objBlackOrderHeaderOptionalSubJson2 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord2;
                    }
        
                    if (objBlackOrderHeaderOptionalJson3 == null || objBlackOrderHeaderOptionalJson3 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord3;
                    }
        
                    if (objBlackOrderHeaderOptionalSubJson3 == null || objBlackOrderHeaderOptionalSubJson3 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord3;
                    }
        
                    if (objBlackOrderHeaderOptionalJson4 == null || objBlackOrderHeaderOptionalJson4 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord4;
                    }
        
                    if (objBlackOrderHeaderOptionalSubJson4 == null || objBlackOrderHeaderOptionalSubJson4 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord4;
                    }
        
                    if (objBlackOrderHeaderOptionalJson5 == null || objBlackOrderHeaderOptionalJson5 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord5;
                    }
        
                    if (objBlackOrderHeaderOptionalSubJson5 == null || objBlackOrderHeaderOptionalSubJson5 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord5;
                    }
    
                    arrOrderRecords.push(objBlackOrderJson);
                } catch (error) {
                    log.error({
                        title: '�o�׈ē�-���`�[�f�[�^-�����G���[',
                        details: '�y�g�����U�N�V�����ԍ��z: ' + arrCurrentBlackData[0].getValue({name: 'tranid'}) + '\n�y�G���[�z: ' + error
                    });
                }
            }
    
            /**
             * �G���h���R�[�h���f�[�^
             * @type {object}
             */
            let objEndData = {
                // �f�[�^�V���A��No
                serialNumber: numDataSerialNumber,
                // ���R�[�h����
                recordCount: numEndRecordRecordCount,
                // ���̋��z���v
                rawVersionTotalAmount: Math.round(amountEndRecordRawVersionTotal),
                // ���ߋ��z���v
                rebateTotalAmount: amountEndRecordRebateTotal,
                // ����e����z���v
                recoverContainerTotalAmount: amountEndRecordRecoverContainerTotal
            };
            const objEndJson = createFinetShippingEndRecord(objEndData);
    
            // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
            numFileHeaderRecordSendDataCount++;
            // �f�[�^�V���A���ԍ�
            numDataSerialNumber++;
    
            // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^����
            objFileHeaderJson.sendDataCount = ('000000' + numFileHeaderRecordSendDataCount).slice(-6);
    
            if (arrOrderRecords.length <= 0) {
                /** �L���ȃf�[�^���Ȃ��ꍇ */
                continue;
            }

            objResult = {
                fileHeaderRecord: objFileHeaderJson,
                orderRecords: arrOrderRecords,
                endRecord: objEndJson
            };
    
            arrResults.push(objResult);
        }
    
        log.audit({
            title: 'getFinetShippingJson - objTransactionIds',
            details: JSON.stringify(objTransactionIds)
        });
    
        if (objTransactionIds.invoiceIds.length > 0 || objTransactionIds.creditMemoIds.length > 0 || objTransactionIds.salesOrderIds.length > 0) {
            var updateTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_djkk_mr_finet',
                deploymentId: 'customdeploy_djkk_mr_finet_sales_order',
                params: {
                    custscript_djkk_mr_finet_target_ids: JSON.stringify(objTransactionIds)
                }
            });
            updateTask.submit();
        }
        log.audit({
            title: 'getFinetShippingJSON - end',
            details: JSON.stringify(new Date())
        });
        return arrResults;
    }

    /**
     * FINET�A�g_�����p�f�[�^�擾
     * @returns {Array} ���ʐ����f�[�^
     */
    function getFinetInvoiceJSON() {
        log.audit({
            title: 'getFinetInvoiceJSON - start',
            details: JSON.stringify(new Date())
        });
        /**
         * FINET_�����f�[�^
         * @type {Array}
         */
        var arrResults = [];

        /**
         * �X�V�Ώۃg�����U�N�V��������ID
         * @typedef {object} objTransactionIds
         * @param {Array} objTransactionIds.invoiceIds �X�V�Ώې�����ID�z��
         * @param {Array} objTransactionIds.creditMemoIds �X�V�ΏۃN���W�b�g����ID�z��
         */
        let objTransactionIds = {
            invoiceIds: [],
            creditMemoIds: []
        };

        /**
         * �V�X�e�������i���{���ԁj
         * @type {Date}
         */
        const systemDateTime = getJapanDateTime();
        /**
         * �V�X�e�����t�i���{���ԁjYYYYMMDD
         * @type {string}
         */
        const strSystemDate = systemDateTime.getFullYear() + ('00' + (systemDateTime.getMonth() + 1)).slice(-2) + ('00' + systemDateTime.getDate()).slice(-2);
        /**
         * �V�X�e�����ԁi���{���ԁjHHmmSS
         * @type {string}
         */
        const strSystemTime = ('00' + systemDateTime.getHours()).slice(-2) + ('00' + systemDateTime.getMinutes()).slice(-2) + ('00' + systemDateTime.getSeconds()).slice(-2);

        const objLocationInfo = getLocationInfo();

        /**
         * �����f�[�^�i�ʏ�o�ׁj
         * @type {object}
         */
        var datas = getFinetInvoiceNormalDatas();
        /**
         * �����f�[�^�i�ԓ`�j
         * @type {object}
         */
        var objRedData = getFinetInvoiceRedData();
        /**
         * �����f�[�^�i���`�j
         * @type {object}
         */
        var objBlackData = getFinetInvoiceBlackData();

        var finetItemCodeMapping = getFinetItemCodeMapping(true);
        var unitCodeByItem = getUnitCodeByItem();

        var commonTypeCodeById = getCommonTypeCodeById();

        // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^����
        let numFileHeaderRecordSendDataCount = 0;
        // 8.3 �G���h���R�[�h.���R�[�h����
        let numEndRecordRecordCount = 0;
        // 8.4 �G���h���R�[�h.���ŋ��z���v
        let amountEndRecordRawVersionTotal = 0;
        // 8.5 �G���h���R�[�h.���ߋ��z���v
        let amountEndRecordRebateTotal = 0;
        // 8.6 �G���h���R�[�h.����e����z���v
        let amountEndRecordRecoverContainerTotal = 0;
        // 8.9  �W���ŗ��K�p���v���z
        let endRecordNormalTaxApplyAmount = 0;
        // 8.10  �y���ŗ��K�p���v���z
        let endRecordReducedTaxApplyAmount = 0;
        // 8.11  ����Ŋz(�W���ŗ��K�p)
        let endRecordNormalTaxAmount = 0;
        // 8.12  ����Ŋz(�y���ŗ��K�p)
        let endRecordReducedTaxAmount = 0;
        // 8.13  ��ېœK�p���v���z
        let endRecordNoTaxApplyAmount = 0;
        // �f�[�^�V���A���ԍ�
        let numDataSerialNumber = 1;

        let arrFinalDestinationCodes = [];
        Object.keys(datas).map(function (strNormalFinalDestinationCode) {
            if (arrFinalDestinationCodes.indexOf(strNormalFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strNormalFinalDestinationCode.toString());
            }
        });

        Object.keys(objRedData).map(function (strRedFinalDestinationCode) {
            if (arrFinalDestinationCodes.indexOf(strRedFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strRedFinalDestinationCode.toString());
            }
        });

        Object.keys(objBlackData).map(function (strBlackFinalDestinationCode) {
            if (arrFinalDestinationCodes.indexOf(strBlackFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strBlackFinalDestinationCode.toString());
            }
        });

        let objAllDatasByDestinationCode = groupOriginDatas(datas, objRedData, objBlackData);

        /** �ԓ`�[�����p�}�X�^���擾 start */

        /**
         * �N���W�b�g�����쐬��ID�i��K�w�j
         * �N���W�b�g����.�쐬���i�������j.�쐬���i�������j
         * �N���W�b�g����.�쐬���i�ԕi�j.�쐬���i�������j
         * @type {Array}
         */
        let arrRedTwoLayersCreatedFromIds = [];

        /** �ԓ`�[�f�[�^.�쐬��.�쐬������ID���擾���������� */
        Object.keys(objAllDatasByDestinationCode).forEach(function(finalDestinationCode) {
            let objCurrentCodeRedData = objAllDatasByDestinationCode[finalDestinationCode.toString()]['red'];
            
            Object.keys(objCurrentCodeRedData).forEach(function(creditMemoId) {
                if (objCurrentCodeRedData[creditMemoId].length > 0) {
                    var tmpCreateFromInvoiceId = objCurrentCodeRedData[creditMemoId][0].getValue({ name: 'createdfrom', join: 'createdfrom' });
                    if (arrRedTwoLayersCreatedFromIds.indexOf(tmpCreateFromInvoiceId.toString()) < 0 && tmpCreateFromInvoiceId) {
                        arrRedTwoLayersCreatedFromIds.push(tmpCreateFromInvoiceId.toString());
                    }
                }
            });
        });

        /**
         * �N���W�b�g�����쐬�����i��K�w�j
         * �N���W�b�g����.�쐬���i�������j.�쐬���i�������j.xxx
         * �N���W�b�g����.�쐬���i�ԕi�j.�쐬���i�������j.xxx
         * @type {object}
         */
        let objRedTwoLayersCreatedFromInfos = {};

        if (arrRedTwoLayersCreatedFromIds.length > 0) {
            let arrRedTwoLayersCreatedFromFilters = [];
            let arrRedTwoLayersCreatedFromIdFilters = [];

            arrRedTwoLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrRedTwoLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrRedTwoLayersCreatedFromIds.length - 1) {
                    arrRedTwoLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrRedTwoLayersCreatedFromFilters.push(arrRedTwoLayersCreatedFromIdFilters);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrRedTwoLayersCreatedFromFilters.push('and')
            arrRedTwoLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);
            
            let arrRedTwoLayersCreatedFromColumns = [];
            /** DJ_�������@�敪.DJ_�敪�R�[�h */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'}));
            /** �g�����U�N�V�����ԍ� */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'transactionnumber'}));
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}));
            /** DJ_��������ԍ� */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno'}));
            /** �쐬��������.DJ_��������ԍ� */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}));
            /** �쐬�� */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom'}));
            /** DJ_FINET�J�i�Ж��E�X���E����於 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername'}));
            /** DJ_FINET�J�i�Ж��E�X���E����於_option2 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2'}));
            /** DJ_FINET�J�i�Ж��E�X���E����於_option3 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3'}));
            /** DJ_FINET�J�i�Ж��E�X���E����於_option4 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4'}));
            /** DJ_FINET�J�i�Ж��E�X���E����於_option5 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5'}));
            /** �쐬��.DJ_FINET�J�i�Ж��E�X���E����於 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}));
            /** �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option2 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}));
            /** �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option3 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}));
            /** �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option4 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}));
            /** �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option5 */
            arrRedTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanacustomeraddress'});
            // DJ_FINET�J�i�Z��_option2
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option2'});
            // DJ_FINET�J�i�Z��_option3
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option3'});
            // DJ_FINET�J�i�Z��_option4
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option4'});
            // DJ_FINET�J�i�Z��_option5
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option5'});
            // �쐬��.DJ_FINET�J�i�Z��
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'});
            // �쐬��.DJ_FINET�J�i�Z��_option2
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'});
            // �쐬��.DJ_FINET�J�i�Z��_option3
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'});
            // �쐬��.DJ_FINET�J�i�Z��_option4
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'});
            // �쐬��.DJ_FINET�J�i�Z��_option5
            arrRedTwoLayersCreatedFromColumns.push({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'});
            
            let arrRedTwoLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrRedTwoLayersCreatedFromFilters, arrRedTwoLayersCreatedFromColumns);
    
            arrRedTwoLayersCreatedFromResults.forEach(function(tmpResult) {
                
                objRedTwoLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    createdFrom: tmpResult.getValue({name: 'createdfrom'}),
                    // DJ_�������@�敪.�敪�R�[�h
                    orderMethodTypeCode: tmpResult.getValue({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'}),
                    // �g�����U�N�V�����ԍ�
                    transactionNumber: tmpResult.getValue({name: 'transactionnumber'}),
                    // �쐬��.�������@
                    createdFromOrderMethodType: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}),
                    // DJ_��������ԍ�
                    customerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno'}),
                    // �쐬��������.DJ_��������ԍ�
                    createdFromCustomerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5'}),
                    // �쐬��.DJ_FINET�J�i�Ж��E�X���E����於
                    createdFromCustomerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option2
                    createdFromCustomerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option3
                    createdFromCustomerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option4
                    createdFromCustomerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Ж��E�X���E����於_option5
                    createdFromCustomerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress'}),
                    // DJ_FINET�J�i�Z��_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2'}),
                    // DJ_FINET�J�i�Z��_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3'}),
                    // DJ_FINET�J�i�Z��_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4'}),
                    // DJ_FINET�J�i�Z��_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5'}),
                    // �쐬��.DJ_FINET�J�i�Z��
                    createdFromAddress1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Z��_option2
                    createdFromAddress2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Z��_option3
                    createdFromAddress3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Z��_option4
                    createdFromAddress4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}),
                    // �쐬��.DJ_FINET�J�i�Z��_option5
                    createdFromAddress5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'})
                };
            });
        }

        /** �ԓ`�[�����p�}�X�^���擾 end */

        /** ���`�[�����p�}�X�^���擾 start */

        /**
         * �������쐬��ID�i��K�w�j
         * ������.DJ_�N���W�b�g����.�쐬���i�������j
         * ������.DJ_�N���W�b�g����.�쐬���i�ԕi�j
         * @type {Array}
         */
        let arrBlackTwoLayersCreatedFromIds = [];

        Object.keys(objAllDatasByDestinationCode).map(function (tmpDestinationCode) {
            Object.keys(objAllDatasByDestinationCode[tmpDestinationCode]['black']).map(function (tmpBlackInvoiceId) {
                let tmpBlackCreatedFromId = objAllDatasByDestinationCode[tmpDestinationCode]['black'][tmpBlackInvoiceId][0].getValue({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' });

                if (tmpBlackCreatedFromId && arrBlackTwoLayersCreatedFromIds.indexOf(tmpBlackCreatedFromId.toString()) < 0) {
                    arrBlackTwoLayersCreatedFromIds.push(tmpBlackCreatedFromId.toString());
                }
            });
        });

        /**
         * �������쐬��ID�i�l�K�w�j
         * ������.DJ_�N���W�b�g����.�쐬���i�ԕi�j.�쐬���i�������j.�쐬���i�������j
         * @type {Array}
         */
        let arrBlackFourLayersCreatedFromIds = [];

        /**
         * �������쐬�����i��K�w�j
         * ������.DJ_�N���W�b�g����.�쐬���i�������j.xxx
         * ������.DJ_�N���W�b�g����.�쐬���i�ԕi�j.xxx
         * @type {object}
         */
        let objBlackTwoLayersCreatedFromInfos = {};

        if (arrBlackTwoLayersCreatedFromIds.length > 0) {
            let arrBlackTwoLayersCreatedFromFilters = [];
            let arrBlackTwoLayersCreatedFromIdFilters = [];
            arrBlackTwoLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrBlackTwoLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrBlackTwoLayersCreatedFromIds.length - 1) {
                    arrBlackTwoLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrBlackTwoLayersCreatedFromFilters.push(arrBlackTwoLayersCreatedFromIdFilters);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrBlackTwoLayersCreatedFromFilters.push('and')
            arrBlackTwoLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);

            let arrBlackTwoLayersCreatedFromColumns = [];
            // �쐬��
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom'}));
            // �쐬��.�쐬��
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'createdfrom', join: 'createdfrom'}));
            // �쐬��.�g�����U�N�V�����ԍ�
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'transactionnumber', join: 'createdfrom'}));
            // �쐬��.�������@�敪
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}));
            // �쐬��.DJ_��������ԍ�
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}));
            // DJ_FINET�J�i�Ж��E�X���E����於
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option2
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option3
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option4
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option5
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��_option2
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��_option3
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��_option4
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}));
            // DJ_FINET�J�i�Z��_option5
            arrBlackTwoLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'}));

            let arrBlackTwoLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrBlackTwoLayersCreatedFromFilters, arrBlackTwoLayersCreatedFromColumns);

            arrBlackTwoLayersCreatedFromResults.forEach(function(tmpResult) {
                
                objBlackTwoLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    fourLayersCreatedFrom: tmpResult.getValue({name: 'createdfrom', join: 'createdfrom'}),
                    // �쐬��
                    createdFrom: tmpResult.getValue({name: 'createdfrom'}),
                    // DJ_�������@�敪
                    orderMethodTyp: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp', join: 'createdfrom'}),
                    // �쐬��.�g�����U�N�V�����ԍ�
                    createdFromTransactionNumber: tmpResult.getValue({name: 'transactionnumber', join: 'createdfrom'}),
                    // �쐬��.DJ_��������ԍ�
                    createdFromCustomerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom'}),
                    // DJ_FINET�J�i�Z��_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom'})
                };

                /** �쐬��ID�i�l�K�w�j�擾���������� */
                let numBlackResultCreatedFromId = tmpResult.getValue({name: 'createdfrom', join: 'createdfrom'});
                if (numBlackResultCreatedFromId && arrBlackFourLayersCreatedFromIds.indexOf(numBlackResultCreatedFromId.toString()) < 0) {
                    arrBlackFourLayersCreatedFromIds.push(numBlackResultCreatedFromId.toString());
                }
            });
        }

        /**
         * �������쐬�����i�l�K�w�j
         * ������.DJ_�N���W�b�g����.�쐬���i�ԕi�j.�쐬���i�������j.�쐬���i�������j.xxx
         */
        let objBlackFourLayersCreatedFromInfos = {};

        if (arrBlackFourLayersCreatedFromIds.length > 0) {
            let arrBlackFourLayersCreatedFromFilters = [];
            let arrBlackFourLayersCreatedFromIdFilters = [];
            arrBlackFourLayersCreatedFromIds.forEach(function(tmpId, index) {
                arrBlackFourLayersCreatedFromIdFilters.push(['internalid', search.Operator.IS, tmpId]);
                if (index != arrBlackFourLayersCreatedFromIds.length - 1) {
                    arrBlackFourLayersCreatedFromIdFilters.push('OR');
                }
            });
            arrBlackFourLayersCreatedFromFilters.push(arrBlackFourLayersCreatedFromIdFilters);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['mainline', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['taxline', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['cogs', search.Operator.IS, false]);
            arrBlackFourLayersCreatedFromFilters.push('and')
            arrBlackFourLayersCreatedFromFilters.push(['shipping', search.Operator.IS, false]);

            let arrBlackFourLayersCreatedFromColumns = [];
            /** DJ_�������@�敪 */
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_ordermethodrtyp'}));
            /** DJ_��������ԍ� */
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_customerorderno'}));
            // DJ_FINET�J�i�Ж��E�X���E����於
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option2
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername2'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option3
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername_o3'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option4
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername4'}));
            // DJ_FINET�J�i�Ж��E�X���E����於_option5
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomername5'}));
            // DJ_FINET�J�i�Z��
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanacustomeraddress'}));
            // DJ_FINET�J�i�Z��_option2
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option2'}));
            // DJ_FINET�J�i�Z��_option3
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option3'}));
            // DJ_FINET�J�i�Z��_option4
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option4'}));
            // DJ_FINET�J�i�Z��_option5
            arrBlackFourLayersCreatedFromColumns.push(search.createColumn({name: 'custbody_djkk_finetkanaaddress_option5'}));
    
            let arrBlackFourLayersCreatedFromResults = searchResult(search.Type.TRANSACTION, arrBlackFourLayersCreatedFromFilters, arrBlackFourLayersCreatedFromColumns);
            arrBlackFourLayersCreatedFromResults.forEach(function(tmpResult) {
                objBlackFourLayersCreatedFromInfos[tmpResult.id.toString()] = {
                    // DJ_�������@�敪
                    orderMethodTyp: tmpResult.getValue({name: 'custbody_djkk_ordermethodrtyp'}),
                    // DJ_��������ԍ�
                    customerOrderNo: tmpResult.getValue({name: 'custbody_djkk_customerorderno'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於
                    customerName1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option2
                    customerName2: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername2'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option3
                    customerName3: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername_o3'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option4
                    customerName4: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername4'}),
                    // DJ_FINET�J�i�Ж��E�X���E����於_option5
                    customerName5: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomername5'}),
                    // DJ_FINET�J�i�Z��
                    address1: tmpResult.getValue({name: 'custbody_djkk_finetkanacustomeraddress'}),
                    // DJ_FINET�J�i�Z��_option2
                    address2: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option2'}),
                    // DJ_FINET�J�i�Z��_option3
                    address3: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option3'}),
                    // DJ_FINET�J�i�Z��_option4
                    address4: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option4'}),
                    // DJ_FINET�J�i�Z��_option5
                    address5: tmpResult.getValue({name: 'custbody_djkk_finetkanaaddress_option5'})
                };
            });
        }
        
        /** ���`�[�����p�}�X�^���擾 end */

        for (let finalDestinationCode in objAllDatasByDestinationCode) {

            /** �ϐ����Z�b�g */
            numFileHeaderRecordSendDataCount = 0;
            numEndRecordRecordCount = 0;
            // 8.4 �G���h���R�[�h.���ŋ��z���v
            amountEndRecordRawVersionTotal = 0;
            // 8.6 �G���h���R�[�h.����e����z���v
            amountEndRecordRecoverContainerTotal = 0;
            // 8.9  �W���ŗ��K�p���v���z
            endRecordNormalTaxApplyAmount = 0;
            // 8.10  �y���ŗ��K�p���v���z
            endRecordReducedTaxApplyAmount = 0;
            // 8.11  ����Ŋz(�W���ŗ��K�p)
            endRecordNormalTaxAmount = 0;
            // 8.12  ����Ŋz(�y���ŗ��K�p)
            endRecordReducedTaxAmount = 0;
            // 8.13  ��ېœK�p���v���z
            endRecordNoTaxApplyAmount = 0;
            // �f�[�^�V���A���ԍ�
            numDataSerialNumber = 1;

            /**
             * �Y���ŏI���M��R�[�h�ʏ�f�[�^
             * @type {object} 
             * @param {string} key �g�����U�N�V��������ID
             * @param {object} value �f�[�^
             */
            var objCurrentDestinationNormalData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].normal;
            /**
             * �Y���ŏI���M��R�[�h���f�[�^
             * @type {object} 
             * @param {string} key �g�����U�N�V��������ID
             * @param {object} value �f�[�^
             */
            var objCurrentDestinationBlackData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].black;

            /**
             * �Y���ŏI���M��R�[�h�ԃf�[�^
             * @type {object} 
             * @param {string} key �g�����U�N�V��������ID
             * @param {object} value �f�[�^
             */
            var objCurrentDestinationRedData = objAllDatasByDestinationCode[(finalDestinationCode.toString())].red;

            /**
             * �t�@�C���w�b�_�[���R�[�h���f�[�^�͒ʏ�`�[�ł��邩
             * @type {boolean}
             */
            var flgIsNormalData = false;

            /**
             * �������@�敪��FINET�ł��邩
             * @type {boolean}
             */
            var flgIsOrderMethodFinet = false;
            /**
             * �t�@�C���w�b�_�[���R�[�h���f�[�^
             */
            var objFileHeaderSearchResult = '';

            /**
             * �f�[�^�̓��ꌏ�ڃf�[�^��ID
             * @type {string}
             */
            var strFirstDataId = '';

            if (Object.keys(objCurrentDestinationNormalData).length > 0) {
                flgIsNormalData = true;
                strFirstDataId = Object.keys(objCurrentDestinationNormalData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationNormalData[strFirstDataId][0];
                flgIsOrderMethodFinet = (objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
            } else if (Object.keys(objCurrentDestinationRedData).length > 0) {
                strFirstDataId = Object.keys(objCurrentDestinationRedData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationRedData[strFirstDataId][0];
            } else if (Object.keys(objCurrentDestinationBlackData).length > 0) {
                strFirstDataId = Object.keys(objCurrentDestinationBlackData).sort(function (a, b) {
                    if (Number(a) > Number(b)) {
                        return 1;
                    } else if (Number(a) == Number(b)) {
                        return 0;
                    } else {
                        return -1;
                    }
                })[0];
                objFileHeaderSearchResult = objCurrentDestinationBlackData[strFirstDataId][0];
            } else {
                continue;
            }

            /**
             * �t�@�C���w�b�_�[���R�[�h���f�[�^
             * @type {object}
             */
            let objFileHeaderData = {
                /** �f�[�^�V���A��No. */
                serialNumber: numDataSerialNumber,
                /** �o�׋敪 */
                shippingType: '06',
                /** �V�X�e�����t */
                systemDate: strSystemDate,
                /** �V�X�e������ */
                systemTime: strSystemTime,
                /** DJ_�������@�敪 */
                orderMethod: objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }),
                /** ���M���Z���^�[�R�[�h */
                senderCenterCode: objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_final_dest_code', join: 'createdfrom' }),
                /** �ŏI���M��R�[�h */
                finalDestinationCode: (
                    flgIsNormalData
                        ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' })
                        : objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                ),
                /** �ŏI���M��R�[�h�i�\���j */
                finalDestinationCodeBk: (
                    flgIsNormalData
                        ? (flgIsOrderMethodFinet ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sendercentercode_s', join: 'createdfrom' }) : ' ')
                        : ' '
                ),
                /** ���ڑ��M���ƃR�[�h */
                directDestinationCompanyCode: (
                    flgIsNormalData
                        ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' })
                        : objFileHeaderSearchResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                ),
                /** ���ڑ��M���ƃR�[�h�i�\���j */
                directDestinationCompanyCodeBk: (
                    flgIsNormalData
                        ? (flgIsOrderMethodFinet ? objFileHeaderSearchResult.getValue({ name: 'custbody_djkk_finet_sendercentercode_s', join: 'createdfrom' }) : ' ')
                        : ' '
                )
            };

            /**
             * �t�@�C���w�b�_���R�[�h
             * @type {object}
             */
            const objFileHeaderJson = createFinetInvoiceFileHeaderRecord(objFileHeaderData, flgIsNormalData)

            // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
            numFileHeaderRecordSendDataCount++;

            // �f�[�^�V���A���ԍ�
            numDataSerialNumber++;

            /**
             * ���X�R�[�h���z��
             * @type {Array}
             */
            let arrStoreCodes = [];

            /**
             * �ꎟ�X�R�[�h
             * @type {string}
             */
            let strFirstStoreCode = '';

            /**
             * �񎟓X�R�[�h
             * @type {string}
             */
            let strSecondStoreCode = '';

            /**
             * �O���X�R�[�h
             * @type {string}
             */
            let strThirdStoreCode = '';

            /**
             * �l���X�R�[�h
             * @type {string}
             */
            let strForthStoreCode = '';

            /**
             * �܎��X�R�[�h
             * @type {string}
             */
            let strFifthStoreCode = '';

            /**
             * ��`���
             * @type {string}
             */
            let strBillsInfo = '';

            /**
             * �q���敪
             * @type {string}
             */
            let strLocationType = '';

            /**
             * �`�[�f�[�^�z��
             * @type {Array}
             */
            let arrOrderRecords = [];

            for (let strNormalDataId in objCurrentDestinationNormalData) {
                /** �ʏ�f�[�^������ */

                if (objTransactionIds.invoiceIds.indexOf(strNormalDataId.toString()) < 0) {
                    objTransactionIds.invoiceIds.push(strNormalDataId.toString());
                }

                /**
                 * �Y������ID���ʏ�f�[�^
                 * @type {Array}
                 */
                let arrCurrentNormalData = objCurrentDestinationNormalData[strNormalDataId];

                try {

                    /** �ϐ��l���Z�b�g */
                    arrStoreCodes = [];
                    strBillsInfo = '';
                    strLocationType = '';
    
                    /** �ꎟ�X�R�[�h */
                    strFirstStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_first_store_code', join: 'createdfrom' });
                    /** �񎟓X�R�[�h */
                    strSecondStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_second_store_code', join: 'createdfrom' });
                    /** �O���X�R�[�h */
                    strThirdStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_third_store_code', join: 'createdfrom' });
                    /** �l���X�R�[�h */
                    strForthStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_fourth_store_code', join: 'createdfrom' });
                    /** �܎��X�R�[�h */
                    strFifthStoreCode = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_fifth_store_code', join: 'createdfrom' });
    
                    if (strFirstStoreCode != null && strFirstStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strFirstStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom' })
                        });
                    }
                    if (strSecondStoreCode != null && strSecondStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strSecondStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom' })
                        });
                    }
                    if (strThirdStoreCode != null && strThirdStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strThirdStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom' })
                        });
                    }
                    if (strForthStoreCode != null && strForthStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strForthStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom' })
                        });
                    }
                    if (strFifthStoreCode != null && strFifthStoreCode != '') {
                        arrStoreCodes.push({
                            storeCode: strFifthStoreCode,
                            customerName: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom' }),
                            address: arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom' })
                        });
                    }
    
                    // ��`���
                    strBillsInfo = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_bills_info', join: 'createdfrom' });
                    if (strBillsInfo != null && strBillsInfo != '') {
                        strBillsInfo = commonTypeCodeById[(strBillsInfo.toString())];
                    }
                    // �q���敪
                    strLocationType = arrCurrentNormalData[0].getValue({ name: 'custbody_djkk_finet_location_type', join: 'createdfrom' });
                    if (strLocationType != null && strLocationType != '') {
                        strLocationType = commonTypeCodeById[(strLocationType.toString())];
                    }
    
                    // DJ_�������@�敪��FINET�ł��邩
                    flgIsOrderMethodFinet = (arrCurrentNormalData[0].getValue({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }) == '1');
                    
                    /**
                     * �o�׋敪�i�ʏ�j
                     * @type {string}
                     */
                    let strNormalShippingType = arrCurrentNormalData[0].getValue({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' });
                    if (strNormalDataId.indexOf('-discount') >= 0) {
                        strNormalShippingType = '60';
                    }
    
                    /**
                     * �`�[�w�b�_�[���R�[�h���f�[�^
                     * @type {object}
                     */
                    let objNormalOrderHeaderData = {
                        // �f�[�^�V���A��No.
                        serialNumber: numDataSerialNumber,
                        // �o�׋敪
                        shippingType: strNormalShippingType,
                        // �`�[���t
                        tranDate: arrCurrentNormalData[0].getValue({ name: 'trandate' }),
                        // �o�ד�
                        shipDate: arrCurrentNormalData[0].getValue({ name: 'shipdate' }),
                        // �`�[�ԍ�
                        transactionNumber: arrCurrentNormalData[0].getValue({ name: 'transactionnumber' }),
                        // �⏕�`�[No.
                        auxiliaryOrderNo: '',
                        // �ꎟ�X�R�[�h
                        firstStoreCode: strFirstStoreCode,
                        // �񎟓X�R�[�h
                        secondStoreCode: strSecondStoreCode,
                        // �O���X�R�[�h
                        thirdStoreCode: strThirdStoreCode,
                        // �l���X�R�[�h
                        forthStoreCode: strForthStoreCode,
                        // �܎��X�R�[�h
                        fifthStoreCode: strFifthStoreCode,
                        // ��`���
                        billsInfo: (flgIsOrderMethodFinet ? strBillsInfo : ' '),
                        // �q���敪
                        locationType: (flgIsOrderMethodFinet ? strLocationType : ' '),
                        // �q�ɃR�[�h
                        locationCode: (objLocationInfo.hasOwnProperty(arrCurrentNormalData[0].getValue({ name: 'location' }).toString()) ? objLocationInfo[(arrCurrentNormalData[0].getValue({ name: 'location' }).toString())].externalId.slice(1, 3) : '')
                    };
    
                    /**
                     * �`�[�w�b�_�[���R�[�h
                     * @type {object}
                     */
                    const objNormalOrderHeaderJson = createFinetInvoiceOrderHeaderRecord(objNormalOrderHeaderData);
    
                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                    numFileHeaderRecordSendDataCount++;
                    // �f�[�^�V���A���ԍ�
                    numDataSerialNumber++;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h1�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson1 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h1�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson1 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h2�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson2 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h2�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson2 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h3�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson3 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h3�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson3 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h4�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson4 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h4�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson4 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h5�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalJson5 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h5�i�ʏ�j
                     * @type {object}
                     */
                    let objNormalOrderHeaderOptionalSubJson5 = null;
    
                    if (flgIsOrderMethodFinet) {
                        /** �������@�敪�́uFINET�v�ł���ꍇ */
    
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjNormalOrderHeaderOptionalJson = createFinetInvoiceOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: index + 1,
                                // �Ж��E�X���E����於
                                customerName: tmpStoreCodeInfo['customerName'],
                                // �Z��
                                customerAddress: tmpStoreCodeInfo['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
    
                            if (tmpObjNormalOrderHeaderOptionalJson != null && tmpObjNormalOrderHeaderOptionalJson != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
    
                            let tmpObjNormalOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjNormalOrderHeaderOptionalSubJson = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                                if (tmpObjNormalOrderHeaderOptionalSubJson != null && tmpObjNormalOrderHeaderOptionalSubJson != '') {
                                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                    numFileHeaderRecordSendDataCount++;
                                    // �f�[�^�V���A���ԍ�
                                    numDataSerialNumber++;
                                }
                            }
    
                            switch (index) {
                                case 0:
                                    objNormalOrderHeaderOptionalJson1 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson1 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objNormalOrderHeaderOptionalJson2 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson2 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objNormalOrderHeaderOptionalJson3 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson3 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objNormalOrderHeaderOptionalJson4 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson4 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objNormalOrderHeaderOptionalJson5 = tmpObjNormalOrderHeaderOptionalJson;
                                    objNormalOrderHeaderOptionalSubJson5 = tmpObjNormalOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objNormalOrderHeaderOptionalJson1 = createFinetInvoiceOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: arrStoreCodes.length,
                                // �Ж��E�X���E����於
                                customerName: arrCurrentNormalData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // �Z��
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
    
                            if (objNormalOrderHeaderOptionalJson1 != null && objNormalOrderHeaderOptionalJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
    
                            objNormalOrderHeaderOptionalSubJson1 = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                            if (objNormalOrderHeaderOptionalSubJson1 != null && objNormalOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
                        }
                    }
    
                    /**
                     * �`�[���׍s���R�[�h�i�ʏ�jJSON�z��
                     * @type {Array}
                     */
                    let arrNormalOrderLineRecords = [];
    
                    arrCurrentNormalData.forEach(function (objCurrentNormalData, index) {
    
                        /**
                         * ����.�A�C�e������ID
                         * @type {number}
                         */
                        let numCurrentNormalItemInternalId = objCurrentNormalData.getValue({ name: 'item' });
    
                        /**
                         * ����.�A�C�e��.�A�C�e��ID
                         * @type {string}
                         */
                        let strCurrentNormalItemId = objCurrentNormalData.getValue({ name: 'itemid', join: 'item' });
    
                        /**
                         * ����.�A�C�e��.UPC�R�[�h
                         * @type {string}
                         */
                        let strCurrentNormalUpcCd = objCurrentNormalData.getValue({ name: 'upccode', join: 'item' });
    
                        let strTmpKey = [
                            strCurrentNormalItemId,
                            objCurrentNormalData.getValue({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' })
                        ].join('-');
    
                        let strCurrentNormalUnit = objCurrentNormalData.getValue({ name: 'unit' });
                        if (numCurrentNormalItemInternalId != null && numCurrentNormalItemInternalId != '') {
                            strCurrentNormalUnit = unitCodeByItem[(numCurrentNormalItemInternalId.toString())];
                        }
                        let numCurrentNormalOrderQuantity = Math.abs(objCurrentNormalData.getValue({ name: 'quantity' }));
                        if (strCurrentNormalUnit == '3') {
                            // �o���̏ꍇ
                            numCurrentNormalOrderQuantity = Math.abs(objCurrentNormalData.getValue({ name: 'quantity' }));
                        }
                        if (strCurrentNormalUnit == '1') {
                            numCurrentNormalOrderQuantity = Math.ceil(Math.abs(Number(objCurrentNormalData.getValue({ name: 'quantity' }))) / Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
    
                        let strNormalLineNo = objCurrentNormalData.getValue({ name: 'custcol_djkk_exsystem_line_num' });
                        if (strNormalDataId.indexOf('-discount') >= 0) {
                            /** �l���A�C�e���s�̏ꍇ */
                            strNormalLineNo = index + 1;
                        }
                        
                        strNormalLineNo = strNormalLineNo.toString();
    
                        /**
                         * ���׍s���R�[�h���f�[�^
                         * @type {object}
                         */
                        let objNormalOrderLineData = {
                            // �f�[�^�V���A��No.
                            serialNumber: numDataSerialNumber,
                            // �`�[�sNo
                            lineNumber: strNormalLineNo,
                            // ���i�R�[�h
                            itemCode: (finetItemCodeMapping.hasOwnProperty(strTmpKey.toString()) ? finetItemCodeMapping[(strTmpKey.toString())] : strCurrentNormalUpcCd),
                            // ���i���i�J�i�j
                            itemNameKana: objCurrentNormalData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // ����
                            orderQuantity: numCurrentNormalOrderQuantity,
                            // ����
                            unitQuantity: objCurrentNormalData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ����(�W��)
                            quantity: Math.abs(objCurrentNormalData.getValue({ name: 'quantity' })),
                            // �P��
                            unit: strCurrentNormalUnit,
                            // �P��
                            rate: objCurrentNormalData.getValue({ name: 'rate' }),
                            // .DJ_����
                            itemUnitQuantity: objCurrentNormalData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ��������
                            billingCloseDate: formatDate(objCurrentNormalData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_�[�i�����ה��l
                            deliveryNoteMemo: objCurrentNormalData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // ����No.
                            orderNo: (flgIsOrderMethodFinet ? objCurrentNormalData.getValue({ name: 'custbody_djkk_customerorderno' }) : objCurrentNormalData.getValue({ name: 'custbody_djkk_customerorderno' }).slice(0, 8)),
                            // ���i�R�[�h�g�p�敪
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strTmpKey.toString()) ? '1' : '3')
                        };
    
                        arrNormalOrderLineRecords.push(createFinetInvoiceLineRecord(objNormalOrderLineData));
    
                        // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 �G���h���R�[�h.���R�[�h����
                        numEndRecordRecordCount++;
                        // �f�[�^�V���A���ԍ�
                        numDataSerialNumber++;
    
                        // 8.4 �G���h���R�[�h.���ŋ��z���v
                        if (Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strNormalShippingType) >= 0 && Number(strNormalShippingType) <= 9) || Number(strNormalShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentNormalData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentNormalData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentNormalData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentNormalData.getValue({ name: 'quantity' })));
                            }
                        } else {
                            if ((Number(strNormalShippingType) >= 0 && Number(strNormalShippingType) <= 9) || Number(strNormalShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentNormalData.getValue({ name: 'rate' })) * Number(objCurrentNormalData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                      
                        /**
                         * ����.�ŗ�
                         * @type {string}
                         */
                        let strCurrentNormalTaxRate = objCurrentNormalData.getValue({ name: 'rate', join: 'taxitem' });
    
                        if (strCurrentNormalTaxRate == '10.00%') {
                            // 8.9 �W���ŗ��K�p���v���z
                            endRecordNormalTaxApplyAmount += Number(objCurrentNormalData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentNormalTaxRate == '8.00%') {
                            // 8.10 �y���ŗ��K�p���v���z
                            endRecordReducedTaxApplyAmount += Number(objCurrentNormalData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentNormalTaxRate == '10.00%') {
                            // 8.11 ����Ŋz(�W���ŗ��K�p)
                            endRecordNormalTaxAmount += Number(objCurrentNormalData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentNormalTaxRate == '8.00%') {
                            // 8.12 ����Ŋz(�y���ŗ��K�p)
                            endRecordReducedTaxAmount += Number(objCurrentNormalData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentNormalTaxRate == '0.00%') {
                            // 8.13 ��ېœK�p���v���z
                            endRecordNoTaxApplyAmount += Number(objCurrentNormalData.getValue({ name: 'amount' }));
                        }
                    });
    
                    /**
                     * �`�[�f�[�^JSON
                     * @type {object}
                     */
                    let objNormalOrderJson = {
                        orderHeaderRecord: objNormalOrderHeaderJson,
                        orderHeaderOptionalRecord1: objNormalOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objNormalOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objNormalOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objNormalOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objNormalOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objNormalOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objNormalOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objNormalOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objNormalOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objNormalOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrNormalOrderLineRecords
                    }
    
                    if (objNormalOrderHeaderOptionalJson1 == null || objNormalOrderHeaderOptionalJson1 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objNormalOrderHeaderOptionalSubJson1 == null || objNormalOrderHeaderOptionalSubJson1 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord1;
                    }
    
                    if (objNormalOrderHeaderOptionalJson2 == null || objNormalOrderHeaderOptionalJson2 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord2;
                    }
    
                    if (objNormalOrderHeaderOptionalSubJson2 == null || objNormalOrderHeaderOptionalSubJson2 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord2;
                    }
    
                    if (objNormalOrderHeaderOptionalJson3 == null || objNormalOrderHeaderOptionalJson3 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord3;
                    }
    
                    if (objNormalOrderHeaderOptionalSubJson3 == null || objNormalOrderHeaderOptionalSubJson3 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord3;
                    }
    
                    if (objNormalOrderHeaderOptionalJson4 == null || objNormalOrderHeaderOptionalJson4 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord4;
                    }
    
                    if (objNormalOrderHeaderOptionalSubJson4 == null || objNormalOrderHeaderOptionalSubJson4 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord4;
                    }
    
                    if (objNormalOrderHeaderOptionalJson5 == null || objNormalOrderHeaderOptionalJson5 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalRecord5;
                    }
    
                    if (objNormalOrderHeaderOptionalSubJson5 == null || objNormalOrderHeaderOptionalSubJson5 == '') {
                        delete objNormalOrderJson.orderHeaderOptionalSubRecord5;
                    }
    
                    arrOrderRecords.push(objNormalOrderJson);
                } catch (error) {
                    log.error({
                        title: '����-�ʏ�f�[�^-�����G���[',
                        details: '�y�g�����U�N�V�����ԍ��z: ' + arrCurrentNormalData[0].getValue({name: 'tranid'}) + '\n�y�G���[�z: ' + error
                    });
                }
            }

            for (let strRedDataId in objCurrentDestinationRedData) {
                /** �ԓ`�[�f�[�^���� */

                if (objTransactionIds.creditMemoIds.indexOf(strRedDataId.toString()) < 0) {
                    objTransactionIds.creditMemoIds.push(strRedDataId.toString());
                }

                /**
                 * �Y������ID���ԓ`�[�f�[�^
                 * @type {Array}
                 */
                let arrCurrentRedData = objCurrentDestinationRedData[strRedDataId];

                try {

                    /** �ϐ��l���Z�b�g */
                    arrStoreCodes = [];
                    strBillsInfo = '';
                    strLocationType = '';
    
                    /**
                     * �o�׋敪�i�ԓ`�j
                     * @type {string}
                     */
                    let strRedShippingType = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' });
                    if (strRedDataId.indexOf('-discount') >= 0) {
                        /** �����A�C�e���f�[�^�̏ꍇ */
                        strRedShippingType = '61'
                    }
    
                    /**
                     * �Y�������f�[�^�̍쐬��ID�i��K�w�j
                     * �N���W�b�g����.�쐬���i�������j.�쐬���i�������j.xxx
                     * �N���W�b�g����.�쐬���i�ԕi�j.�쐬���i�������j.xxx
                     * @type {number}
                     */
                    let numRedCurrentTwoLayersCreatedFromId = arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'});
                    /**
                     * �Y���ԓ`�[�f�[�^�쐬���i��K�w�j���
                     * @type {object}
                     */
                    let objCurrentRedDataTwoLayersCreatedFromInfo = null;
                    if (objRedTwoLayersCreatedFromInfos.hasOwnProperty(numRedCurrentTwoLayersCreatedFromId.toString())) {
                        objCurrentRedDataTwoLayersCreatedFromInfo = objRedTwoLayersCreatedFromInfos[numRedCurrentTwoLayersCreatedFromId.toString()];
                    }
    
                    /**
                     * �쐬���������Q�Ƃł��邩
                     * @type {boolean}
                     */
                    let flgRedHasCreatedFromSalesOrder = false;
                    if (objCurrentRedDataTwoLayersCreatedFromInfo) {
                        flgRedHasCreatedFromSalesOrder = true;
                    }
    
                    /** �ꎟ�X�R�[�h */
                    strFirstStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' });
                    /** �񎟓X�R�[�h */
                    strSecondStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' });
                    /** �O���X�R�[�h */
                    strThirdStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' });
                    /** �l���X�R�[�h */
                    strForthStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' });
                    /** �܎��X�R�[�h */
                    strFifthStoreCode = arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' });
    
                    if (flgRedHasCreatedFromSalesOrder) {
                        // �쐬���������Q�Ƃł���ꍇ
    
                        if (strRedShippingType == '10') {
                            // �o�׋敪�́u10:�ԕi�v�̏ꍇ
    
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName1,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName2,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName3,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName4,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerName5,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.createdFromAddress5,
                                });
                            }
                        } else {
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName1,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName2,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName3,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName4,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentRedDataTwoLayersCreatedFromInfo.customerName5,
                                    address: objCurrentRedDataTwoLayersCreatedFromInfo.address5,
                                });
                            }
                        }
                    } else {
                        if (strFirstStoreCode != null && strFirstStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFirstStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strSecondStoreCode != null && strSecondStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strSecondStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strThirdStoreCode != null && strThirdStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strThirdStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strForthStoreCode != null && strForthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strForthStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strFifthStoreCode != null && strFifthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFifthStoreCode,
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                    }
    
                    /**
                     * �ԓ`�[�⏕�`�[�ԍ�
                     * @type {string}
                     */
                    let strRedAuxiliaryOrderNo = '';
                    if (strRedShippingType == '10') {
                        // �o�׋敪�͕ԕi�ł���ꍇ
                        if (objCurrentRedDataTwoLayersCreatedFromInfo) {
                            strRedAuxiliaryOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.transactionNumber != '' ? objCurrentRedDataTwoLayersCreatedFromInfo.transactionNumber[0] + objCurrentRedDataTwoLayersCreatedFromInfo.transactionNumber.slice(-7) : '';
                        }
                    } else {
                        if (arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' })) {
                            strRedAuxiliaryOrderNo = arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' })[0] + arrCurrentRedData[0].getValue({ name: 'transactionnumber', join: 'createdfrom' }).slice(-7);
                        }
                    }
    
                    let strRedOrderMethodType = '';
                    if (strRedShippingType != '10') {
                        // �N���W�b�g����.DJ_FINET�o�׋敪�́u10:�ԕi�v�ȊO�ł���ꍇ
    
                        if (objRedTwoLayersCreatedFromInfos.hasOwnProperty(arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'}).toString())) {
                            strRedOrderMethodType = objRedTwoLayersCreatedFromInfos[(arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'}).toString())].orderMethodTypeCode;
                        } else {
                            strRedOrderMethodType = arrCurrentRedData[0].getValue({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'})
                        }
                    } else {
                        if (objRedTwoLayersCreatedFromInfos[(arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'}).toString())].createdFromOrderMethodType) {
                            // �N���W�b�g����.�쐬���ԕi.�쐬��������.�쐬�����������Q�Ƃł���ꍇ
                            strRedOrderMethodType = commonTypeCodeById[(objRedTwoLayersCreatedFromInfos[(arrCurrentRedData[0].getValue({name: 'createdfrom', join: 'createdfrom'}).toString())].createdFromOrderMethodType.toString())];
                        } else {
                            strRedOrderMethodType = arrCurrentRedData[0].getValue({name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp'})
                        }
                    }
    
                    flgIsOrderMethodFinet = (strRedOrderMethodType == '1');
                    
                    /**
                     * �`�[�w�b�_�[���R�[�h���f�[�^�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderData = {
                        // �f�[�^�V���A��No.
                        serialNumber: numDataSerialNumber,
                        // �o�׋敪
                        shippingType: strRedShippingType,
                        // �`�[���t
                        tranDate: arrCurrentRedData[0].getValue({ name: 'trandate' }),
                        // �o�ד�
                        shipDate: arrCurrentRedData[0].getValue({ name: 'trandate' }),
                        // �`�[�ԍ�
                        transactionNumber: arrCurrentRedData[0].getValue({ name: 'transactionnumber' }),
                        // �⏕�`�[No.
                        auxiliaryOrderNo: strRedAuxiliaryOrderNo,
                        // �ꎟ�X�R�[�h
                        firstStoreCode: strFirstStoreCode,
                        // �񎟓X�R�[�h
                        secondStoreCode: strSecondStoreCode,
                        // �O���X�R�[�h
                        thirdStoreCode: strThirdStoreCode,
                        // �l���X�R�[�h
                        forthStoreCode: strForthStoreCode,
                        // �܎��X�R�[�h
                        fifthStoreCode: strFifthStoreCode,
                        // ��`���
                        billsInfo: ' ',
                        // �q���敪
                        locationType: ' ',
                        // �q�ɃR�[�h
                        locationCode: (arrCurrentRedData[0].getValue({ name: 'location' }) ? objLocationInfo[arrCurrentRedData[0].getValue({ name: 'location' }).toString()].externalId.slice(1, 3) : '')
                    };
    
                    /**
                     * �`�[�w�b�_���R�[�h�i�ԓ`�[�j
                     * @type {object}
                     */
                    const objRedOrderHeaderJson = createFinetInvoiceOrderHeaderRecord(objRedOrderHeaderData);
    
                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                    numFileHeaderRecordSendDataCount++;
                    // �f�[�^�V���A���ԍ�
                    numDataSerialNumber++;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h1�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson1 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h1�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson1 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h2�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson2 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h2�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson2 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h3�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson3 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h3�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson3 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h4�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson4 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h4�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson4 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h5�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalJson5 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h5�i�ԓ`�[�j
                     * @type {object}
                     */
                    let objRedOrderHeaderOptionalSubJson5 = null;
    
                    if (flgIsOrderMethodFinet) {
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjRedOrderHeaderOptionalJson = createFinetInvoiceOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: index + 1,
                                // �Ж��E�X���E����於
                                customerName: tmpStoreCodeInfo['customerName'],
                                // �Z��
                                customerAddress: tmpStoreCodeInfo['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
    
                            if (tmpObjRedOrderHeaderOptionalJson != null && tmpObjRedOrderHeaderOptionalJson != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
    
                            let tmpObjRedOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjRedOrderHeaderOptionalSubJson = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                                if (tmpObjRedOrderHeaderOptionalSubJson != null && tmpObjRedOrderHeaderOptionalSubJson != '') {
                                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                    numFileHeaderRecordSendDataCount++;
                                    // �f�[�^�V���A���ԍ�
                                    numDataSerialNumber++;
                                }
                            }
    
                            switch (index) {
                                case 0:
                                    objRedOrderHeaderOptionalJson1 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson1 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objRedOrderHeaderOptionalJson2 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson2 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objRedOrderHeaderOptionalJson3 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson3 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objRedOrderHeaderOptionalJson4 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson4 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objRedOrderHeaderOptionalJson5 = tmpObjRedOrderHeaderOptionalJson;
                                    objRedOrderHeaderOptionalSubJson5 = tmpObjRedOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objRedOrderHeaderOptionalJson1 = createFinetInvoiceOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: arrStoreCodes.length,
                                // �Ж��E�X���E����於
                                customerName: arrCurrentRedData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // �Z��
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
    
                            if (objRedOrderHeaderOptionalJson1 != null && objRedOrderHeaderOptionalJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
    
                            objRedOrderHeaderOptionalSubJson1 = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                            if (objRedOrderHeaderOptionalSubJson1 != null && objRedOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
                        }
                    }
    
                    /**
                     * �`�[���׍s���R�[�h�i�ԓ`�[�jJSON�z��
                     * @type {Array}
                     */
                    let arrRedOrderLineRecords = [];
    
                    arrCurrentRedData.map(function (objCurrentRedData, index) {
    
                        let strRedTmpKey = [
                            objCurrentRedData.getValue({ name: 'itemid', join: 'item' }),
                            objCurrentRedData.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                        ].join('-');
    
                        let strRedItemInternalId = objCurrentRedData.getValue({ name: 'item' });
                        let strRedUnit = '';
                        if (strRedItemInternalId) {
                            strRedUnit = unitCodeByItem[strRedItemInternalId.toString()];
                        }
    
                        let numRedOrderQuantity = 0 - Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                        if (strRedUnit == '3') {
                            numRedOrderQuantity = 0 - Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                        }
                        if (strRedUnit == '1') {
                            numRedOrderQuantity = 0 - Math.ceil(Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' }))) / Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
    
                        if (strRedShippingType == '11' || strRedShippingType == '10') {
                            // �o�׋敪�́u11:�o�׎���i�ԓ`�j�v�u10:�ԕi�v�̏ꍇ
                            numRedOrderQuantity = 0 - Math.abs(numRedOrderQuantity);
                        } else {
                            numRedOrderQuantity = Math.abs(numRedOrderQuantity);
                        }
                        
                        /**
                         * ���`.����No.
                         * @type {string}
                         */
                        let strRedOrderNo = '';
                        if (objCurrentRedDataTwoLayersCreatedFromInfo) {
                            if (strRedShippingType != '10') {
                                // �o�׋敪�́u10:�ԕi�v�ȊO�ł���ꍇ
                                strRedOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.customerOrderNo;
                            } else {
                                strRedOrderNo = objCurrentRedDataTwoLayersCreatedFromInfo.createdFromCustomerOrderNo;
                            }
                        }
    
                        if (strRedOrderNo == null || strRedOrderNo == '') {
                            strRedOrderNo = arrCurrentRedData[0].getValue({name: 'custbody_djkk_customerorderno'});
                        }
    
                        if (strRedOrderNo.length > 8) {
                            strRedOrderNo = strRedOrderNo.slice(0, 8);
                        }
                        
                        /**
                         * ���׍s���R�[�h���f�[�^�i�ԓ`�[�j
                         * @type {object}
                         */
                        let objRedOrderLineData = {
                            // �f�[�^�V���A��No.
                            serialNumber: numDataSerialNumber,
                            // �`�[�sNo
                            lineNumber: index + 1,
                            // ���i�R�[�h
                            itemCode: (
                                finetItemCodeMapping.hasOwnProperty(strRedTmpKey.toString())
                                    ? finetItemCodeMapping[(strRedTmpKey.toString())]
                                    : objCurrentRedData.getValue({ name: 'upccode', join: 'item' })
                            ),
                            // ���i���i�J�i�j
                            itemNameKana: objCurrentRedData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // ����
                            orderQuantity: numRedOrderQuantity,
                            // ����
                            unitQuantity: objCurrentRedData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ����(�W��)
                            quantity: numRedOrderQuantity,
                            // �P��
                            unit: strRedUnit,
                            // �P��
                            rate: objCurrentRedData.getValue({ name: 'rate' }),
                            // DJ_���萔(�����)
                            itemUnitQuantity: objCurrentRedData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ��������
                            billingCloseDate: formatDate(objCurrentRedData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_�[�i�����ה��l
                            deliveryNoteMemo: objCurrentRedData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // ����No.
                            orderNo: strRedOrderNo,
                            // ���i�R�[�h�g�p�敪
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strRedTmpKey.toString()) ? '1' : '3')
                        };
    
                        arrRedOrderLineRecords.push(createFinetInvoiceLineRecord(objRedOrderLineData));
    
                        // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 �G���h���R�[�h.���R�[�h����
                        numEndRecordRecordCount++;
                        // �f�[�^�V���A���ԍ�
                        numDataSerialNumber++;
    
                        // 8.4 �G���h���R�[�h.���ŋ��z���v
                        if (Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strRedShippingType) >= 0 && Number(strRedShippingType) <= 9) || Number(strRedShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentRedData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentRedData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentRedData.getValue({ name: 'quantity' })));
                            }
    
                        } else {
                            if ((Number(strRedShippingType) >= 0 && Number(strRedShippingType) <= 9) || Number(strRedShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentRedData.getValue({ name: 'rate' })) * Number(objCurrentRedData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                      
                        // ����.�ŗ�
                        let strCurrentRedTaxRate = objCurrentRedData.getValue({ name: 'rate', join: 'taxitem' });
    
                        if (strCurrentRedTaxRate == '10.00%') {
                            // 8.9 �W���ŗ��K�p���v���z
                            endRecordNormalTaxApplyAmount += Number(objCurrentRedData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentRedTaxRate == '8.00%') {
                            // 8.10 �y���ŗ��K�p���v���z
                            endRecordReducedTaxApplyAmount += Number(objCurrentRedData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentRedTaxRate == '10.00%') {
                            // 8.11 ����Ŋz(�W���ŗ��K�p)
                            endRecordNormalTaxAmount += Number(objCurrentRedData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentRedTaxRate == '8.00%') {
                            // 8.12 ����Ŋz(�y���ŗ��K�p)
                            endRecordReducedTaxAmount += Number(objCurrentRedData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentRedTaxRate == '0.00%') {
                            // 8.13 ��ېœK�p���v���z
                            endRecordNoTaxApplyAmount += Number(objCurrentRedData.getValue({ name: 'amount' }));
                        }
    
                    });
    
                    let objRedOrderJson = {
                        orderHeaderRecord: objRedOrderHeaderJson,
                        orderHeaderOptionalRecord1: objRedOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objRedOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objRedOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objRedOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objRedOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objRedOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objRedOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objRedOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objRedOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objRedOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrRedOrderLineRecords
                    };
    
                    if (objRedOrderHeaderOptionalJson1 == null || objRedOrderHeaderOptionalJson1 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objRedOrderHeaderOptionalSubJson1 == null || objRedOrderHeaderOptionalSubJson1 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord1;
                    }
    
                    if (objRedOrderHeaderOptionalJson2 == null || objRedOrderHeaderOptionalJson2 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord2;
                    }
    
                    if (objRedOrderHeaderOptionalSubJson2 == null || objRedOrderHeaderOptionalSubJson2 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord2;
                    }
    
                    if (objRedOrderHeaderOptionalJson3 == null || objRedOrderHeaderOptionalJson3 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord3;
                    }
    
                    if (objRedOrderHeaderOptionalSubJson3 == null || objRedOrderHeaderOptionalSubJson3 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord3;
                    }
    
                    if (objRedOrderHeaderOptionalJson4 == null || objRedOrderHeaderOptionalJson4 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord4;
                    }
    
                    if (objRedOrderHeaderOptionalSubJson4 == null || objRedOrderHeaderOptionalSubJson4 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord4;
                    }
    
                    if (objRedOrderHeaderOptionalJson5 == null || objRedOrderHeaderOptionalJson5 == '') {
                        delete objRedOrderJson.orderHeaderOptionalRecord5;
                    }
    
                    if (objRedOrderHeaderOptionalSubJson5 == null || objRedOrderHeaderOptionalSubJson5 == '') {
                        delete objRedOrderJson.orderHeaderOptionalSubRecord5;
                    }
    
                    arrOrderRecords.push(objRedOrderJson);
                } catch (error) {
                    log.error({
                        title: '����-�ԓ`�[�f�[�^-�����G���[',
                        details: '�y�g�����U�N�V�����ԍ��z: ' + arrCurrentRedData[0].getValue({name: 'tranid'}) + '\n�y�G���[�z: ' + error
                    });
                }
            }

            for (var strBlackDataId in objCurrentDestinationBlackData) {
                /** ���`�[�f�[�^���� */

                if (objTransactionIds.invoiceIds.indexOf(strBlackDataId.toString()) < 0) {
                    objTransactionIds.invoiceIds.push(strBlackDataId.toString());
                }

                /**
                 * �Y������ID�����`�[�f�[�^
                 * @type {Array}
                 */
                var arrCurrentBlackData = objCurrentDestinationBlackData[strBlackDataId];

                try {
                    /**
                     * �Y�����`�[�f�[�^�쐬���f�[�^�i��K�w�j
                     * @type {object}
                     */
                    let objCurrentBlackTwoLayersInfo = null;
                    if (arrCurrentBlackData[0].getValue({name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo'})
                        && objBlackTwoLayersCreatedFromInfos.hasOwnProperty(arrCurrentBlackData[0].getValue({name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo'}).toString())) {
                        objCurrentBlackTwoLayersInfo = objBlackTwoLayersCreatedFromInfos[(arrCurrentBlackData[0].getValue({name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo'}).toString())];
                    }
    
                    /**
                     * �Y�����`�[�f�[�^�쐬���f�[�^�i�l�K�w�j
                     * @type {object}
                     */
                    let objCurrentBlackFourLayersInfo = {};
                    if (objCurrentBlackTwoLayersInfo && objCurrentBlackTwoLayersInfo.fourLayersCreatedFrom) {
                        objCurrentBlackFourLayersInfo = objBlackFourLayersCreatedFromInfos[objCurrentBlackTwoLayersInfo.fourLayersCreatedFrom.toString()];
                    }
    
                    /**
                     * �쐬���������Q�Ƃł��邩
                     * @type {boolean}
                     */
                    let flgBlackHasCreatedFromSalesOrder = false;
                    if (objCurrentBlackTwoLayersInfo) {
                        if (objCurrentBlackTwoLayersInfo.fourLayersCreatedFrom) {
                            flgBlackHasCreatedFromSalesOrder = true;
                        } else if (objCurrentBlackTwoLayersInfo.createdFrom) {
                            flgBlackHasCreatedFromSalesOrder = true;
                        }
                    }
    
                    /** �ϐ��l���Z�b�g */
                    arrStoreCodes = [];
                    strBillsInfo = '';
                    strLocationType = '';
    
                    /**
                     * �o�׋敪�i���`�j
                     * @type {string}
                     */
                    let strBlackShippingType = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' });
    
                    /**
                     * �������@�敪
                     */
                    let strBlackOrderMethod = '';
    
                    if (objCurrentBlackTwoLayersInfo) {
                        strBlackOrderMethod = objCurrentBlackTwoLayersInfo.orderMethodTyp;
                        if (strBlackShippingType == '01') {
                            /** �o�׋敪�́u01:�ԕi����v�̏ꍇ */
                            strBlackOrderMethod = objCurrentBlackFourLayersInfo.orderMethodTyp;
                        }
    
                        if (!flgBlackHasCreatedFromSalesOrder) {
                            strBlackOrderMethod = arrCurrentBlackData[0].getValue({name: 'custbody_djkk_ordermethodrtyp'});
                        }
                        
                    } else {
                        strBlackOrderMethod = arrCurrentBlackData[0].getValue({name: 'custbody_djkk_ordermethodrtyp'});
                    }
    
                    if (strBlackOrderMethod && commonTypeCodeById.hasOwnProperty(strBlackOrderMethod.toString())) {
                        strBlackOrderMethod = commonTypeCodeById[strBlackOrderMethod.toString()];
                    }
    
                    flgIsOrderMethodFinet = (strBlackOrderMethod == '1');
    
                    /** �ꎟ�X�R�[�h */
                    strFirstStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' });
                    /** �񎟓X�R�[�h */
                    strSecondStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' });
                    /** �O���X�R�[�h */
                    strThirdStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' });
                    /** �l���X�R�[�h */
                    strForthStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' });
                    /** �܎��X�R�[�h */
                    strFifthStoreCode = arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' });
    
                    if (flgBlackHasCreatedFromSalesOrder) {
                        // �쐬���������Q�Ƃł���ꍇ
    
                        if (strBlackShippingType == '01') {
                            // �o�׋敪�́u01:�ԕi����v�̏ꍇ
    
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName1,
                                    address: objCurrentBlackFourLayersInfo.address1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName2,
                                    address: objCurrentBlackFourLayersInfo.address2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName3,
                                    address: objCurrentBlackFourLayersInfo.address3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName4,
                                    address: objCurrentBlackFourLayersInfo.address4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentBlackFourLayersInfo.customerName5,
                                    address: objCurrentBlackFourLayersInfo.address5,
                                });
                            }
                        } else {
                            if (strFirstStoreCode != null && strFirstStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFirstStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName1,
                                    address: objCurrentBlackTwoLayersInfo.address1,
                                });
                            }
                            if (strSecondStoreCode != null && strSecondStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strSecondStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName2,
                                    address: objCurrentBlackTwoLayersInfo.address2,
                                });
                            }
                            if (strThirdStoreCode != null && strThirdStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strThirdStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName3,
                                    address: objCurrentBlackTwoLayersInfo.address3,
                                });
                            }
                            if (strForthStoreCode != null && strForthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strForthStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName4,
                                    address: objCurrentBlackTwoLayersInfo.address4,
                                });
                            }
                            if (strFifthStoreCode != null && strFifthStoreCode != '') {
                                arrStoreCodes.push({
                                    storeCode: strFifthStoreCode,
                                    customerName: objCurrentBlackTwoLayersInfo.customerName5,
                                    address: objCurrentBlackTwoLayersInfo.address5,
                                });
                            }
                        }
                    } else {
                        if (strFirstStoreCode != null && strFirstStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFirstStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strSecondStoreCode != null && strSecondStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strSecondStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strThirdStoreCode != null && strThirdStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strThirdStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strForthStoreCode != null && strForthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strForthStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                        if (strFifthStoreCode != null && strFifthStoreCode != '') {
                            arrStoreCodes.push({
                                storeCode: strFifthStoreCode,
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                address: ''
                            });
                        }
                    }
    
                    if (strBlackDataId.indexOf('-discount') >= 0) {
                        /** �����A�C�e���f�[�^�̏ꍇ */
                        strBlackShippingType = '60'
                    }
    
                    /**
                     * ���`�[.�⏕�`�[No
                     */
                    let strBlackAuxiliaryOrderNo = '';
                    if (strBlackShippingType == '01') {
                        // �u�o�׋敪�v�́u01:�ԕi����v�̏ꍇ
                        if (objCurrentBlackTwoLayersInfo) {
                            strBlackAuxiliaryOrderNo = objCurrentBlackTwoLayersInfo.createdFromTransactionNumber;
                        }
                    } else {
                        strBlackAuxiliaryOrderNo = arrCurrentBlackData[0].getValue({name: 'transactionnumber', join: 'custbody_djkk_invoice_creditmemo'});
                    }
    
                    if (strBlackAuxiliaryOrderNo && strBlackAuxiliaryOrderNo.length > 7) {
                        strBlackAuxiliaryOrderNo = strBlackAuxiliaryOrderNo[0] + strBlackAuxiliaryOrderNo.slice(-7);
                    }
    
                    /**
                     * �`�[�w�b�_�[���R�[�h���f�[�^�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderData = {
                        // �f�[�^�V���A��No.
                        serialNumber: numDataSerialNumber,
                        // �o�׋敪
                        shippingType: strBlackShippingType,
                        // �`�[���t
                        tranDate: arrCurrentBlackData[0].getValue({ name: 'trandate' }),
                        // �o�ד�
                        shipDate: arrCurrentBlackData[0].getValue({ name: 'trandate' }),
                        // �`�[�ԍ�
                        transactionNumber: arrCurrentBlackData[0].getValue({ name: 'transactionnumber' }),
                        // �⏕�`�[No.
                        auxiliaryOrderNo: strBlackAuxiliaryOrderNo,
                        // �ꎟ�X�R�[�h
                        firstStoreCode: strFirstStoreCode,
                        // �񎟓X�R�[�h
                        secondStoreCode: strSecondStoreCode,
                        // �O���X�R�[�h
                        thirdStoreCode: strThirdStoreCode,
                        // �l���X�R�[�h
                        forthStoreCode: strForthStoreCode,
                        // �܎��X�R�[�h
                        fifthStoreCode: strFifthStoreCode,
                        // ��`���
                        billsInfo: ' ',
                        // �q���敪
                        locationType: ' ',
                        // �q�ɃR�[�h
                        locationCode: arrCurrentBlackData[0].getValue({ name: 'externalid', join: 'location' }).slice(1, 3)
                    };
    
                    /**
                     * �`�[�w�b�_�[���R�[�h�i���`�[�j
                     * @type {object}
                     */
                    const objBlackOrderHeaderJson = createFinetInvoiceOrderHeaderRecord(objBlackOrderHeaderData);
    
                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                    numFileHeaderRecordSendDataCount++;
                    // �f�[�^�V���A���ԍ�
                    numDataSerialNumber++;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h1�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson1 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h1�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson1 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h2�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson2 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h2�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson2 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h3�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson3 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h3�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson3 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h4�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson4 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h4�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson4 = null;
    
                    /**
                     * �`�[�w�b�_�[�I�v�V�������R�[�h5�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalJson5 = null;
                    /**
                     * �`�[�w�b�_�[�I�v�V�����T�u���R�[�h5�i���`�[�j
                     * @type {object}
                     */
                    let objBlackOrderHeaderOptionalSubJson5 = null;
    
                    if (flgIsOrderMethodFinet) {
                        arrStoreCodes.map(function (tmpStoreCodeInfo, index) {
                            let tmpObjBlackOrderHeaderOptionalJson = createFinetInvoiceOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: index + 1,
                                // �Ж��E�X���E����於
                                customerName: tmpStoreCodeInfo['customerName'],
                                // �Z��
                                customerAddress: tmpStoreCodeInfo['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: tmpStoreCodeInfo['storeCode']
                            });
    
                            if (tmpObjBlackOrderHeaderOptionalJson != null && tmpObjBlackOrderHeaderOptionalJson != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
    
                            let tmpObjBlackOrderHeaderOptionalSubJson = null;
                            if (index == (arrStoreCodes.length - 1)) {
                                tmpObjBlackOrderHeaderOptionalSubJson = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                                if (tmpObjBlackOrderHeaderOptionalSubJson != null && tmpObjBlackOrderHeaderOptionalSubJson != '') {
                                    // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                    numFileHeaderRecordSendDataCount++;
                                    // �f�[�^�V���A���ԍ�
                                    numDataSerialNumber++;
                                }
                            }
    
                            switch (index) {
                                case 0:
                                    objBlackOrderHeaderOptionalJson1 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson1 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 1:
                                    objBlackOrderHeaderOptionalJson2 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson2 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 2:
                                    objBlackOrderHeaderOptionalJson3 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson3 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 3:
                                    objBlackOrderHeaderOptionalJson4 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson4 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                                case 4:
                                    objBlackOrderHeaderOptionalJson5 = tmpObjBlackOrderHeaderOptionalJson;
                                    objBlackOrderHeaderOptionalSubJson5 = tmpObjBlackOrderHeaderOptionalSubJson;
                                    break;
                            }
                        });
                    } else {
                        if (arrStoreCodes.length > 0) {
                            objBlackOrderHeaderOptionalJson1 = createFinetInvoiceOrderHeaderOptionRecord({
                                // �f�[�^�V���A��No.
                                serialNumber: numDataSerialNumber,
                                // �w�b�_�[�Q��No
                                headerReferenceNumber: arrStoreCodes.length,
                                // �Ж��E�X���E����於
                                customerName: arrCurrentBlackData[0].getValue({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }),
                                // �Z��
                                customerAddress: arrStoreCodes[(arrStoreCodes.length - 1)]['address'],
                                // �����Ή��R�[�h
                                clientSupportCode: arrStoreCodes[(arrStoreCodes.length - 1)]['storeCode']
                            });
    
                            if (objBlackOrderHeaderOptionalJson1 != null && objBlackOrderHeaderOptionalJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
    
                            objBlackOrderHeaderOptionalSubJson1 = createFinetInvoiceOrderHeaderOptionSubRecord(numDataSerialNumber);
    
                            if (objBlackOrderHeaderOptionalSubJson1 != null && objBlackOrderHeaderOptionalSubJson1 != '') {
                                // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                                numFileHeaderRecordSendDataCount++;
                                // �f�[�^�V���A���ԍ�
                                numDataSerialNumber++;
                            }
                        }
                    }
    
                    /**
                     * �`�[���׍s���R�[�h�i���`�[�jJSON�z��
                     * @type {Array}
                     */
                    let arrBlackOrderLineRecords = [];
    
                    arrCurrentBlackData.map(function (objCurrentBlackData, index) {
    
                        let strBlackTmpKey = [
                            objCurrentBlackData.getValue({ name: 'itemid', join: 'item' }),
                            objCurrentBlackData.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' })
                        ].join('-');
    
                        let strBlackItemInternalId = objCurrentBlackData.getValue({ name: 'item' });
    
                        let strBlackUnit = '';
                        if (strBlackItemInternalId) {
                            strBlackUnit = unitCodeByItem[strBlackItemInternalId.toString()];
                        }
    
                        let numBlackOrderQuantity = Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                        if (strBlackUnit == '3') {
                            numBlackOrderQuantity = Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                        }
                        if (strBlackUnit == '1') {
                            numBlackOrderQuantity = Math.ceil(Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' }))) / Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' })));
                        }
    
                        /**
                         * ���`�[.����No
                         * @type {string}
                         */
                        let strBlackOrderNo = '';
                        
                        if (flgBlackHasCreatedFromSalesOrder) {
                            if (strBlackShippingType == '01') {
                                /** �o�׋敪�́u01:�ԕi����v�̏ꍇ */
                                
                                strBlackOrderNo = objCurrentBlackFourLayersInfo.customerOrderNo;
                            } else {
                                strBlackOrderNo = objCurrentBlackTwoLayersInfo.createdFromCustomerOrderNo;
                            }
                        }
    
                        if (strBlackOrderNo == null || strBlackOrderNo == '') {
                            strBlackOrderNo = objCurrentBlackData.getValue({name: 'custbody_djkk_customerorderno'});
                        }
    
                        if (strBlackOrderNo.length > 8) {
                            strBlackOrderNo = strBlackOrderNo.slice(0, 8);
                        }
    
                        /**
                         * ���׍s���R�[�h���f�[�^�i���`�[�j
                         * @type {object}
                         */
                        let objBlackOrderLineData = {
                            // �f�[�^�V���A��No.
                            serialNumber: numDataSerialNumber,
                            // �`�[�sNo
                            lineNumber: index + 1,
                            // ���i�R�[�h
                            itemCode: (
                                finetItemCodeMapping.hasOwnProperty(strBlackTmpKey.toString())
                                    ? finetItemCodeMapping[(strBlackTmpKey.toString())]
                                    : objCurrentBlackData.getValue({ name: 'upccode', join: 'item' })
                            ),
                            // ���i���i�J�i�j
                            itemNameKana: objCurrentBlackData.getValue({ name: 'custitem_djkk_item_kana', join: 'item' }),
                            // ����
                            orderQuantity: numBlackOrderQuantity,
                            // ����
                            unitQuantity: objCurrentBlackData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ����(�W��)
                            quantity: Math.abs(objCurrentBlackData.getValue({ name: 'quantity' })),
                            // �P��
                            unit: strBlackUnit,
                            // �P��
                            rate: objCurrentBlackData.getValue({ name: 'rate' }),
                            // �A�C�e��.DJ_���萔(�����)
                            itemUnitQuantity: objCurrentBlackData.getValue({ name: 'custcol_djkk_perunitquantity' }),
                            // ��������
                            billingCloseDate: formatDate(objCurrentBlackData.getValue({ name: 'custbody_suitel10n_inv_closing_date' })).slice(-4),
                            // DJ_�[�i�����ה��l
                            deliveryNoteMemo: objCurrentBlackData.getValue({ name: 'custcol_djkk_deliverynotememo' }),
                            // ����No.
                            orderNo: strBlackOrderNo,
                            // ���i�R�[�h�g�p�敪
                            itemCodeUsageType: (finetItemCodeMapping.hasOwnProperty(strBlackTmpKey.toString()) ? '1' : '3')
                        };
    
                        arrBlackOrderLineRecords.push(createFinetInvoiceLineRecord(objBlackOrderLineData));
    
                        // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
                        numFileHeaderRecordSendDataCount++;
                        // 8.3 �G���h���R�[�h.���R�[�h����
                        numEndRecordRecordCount++;
                        // �f�[�^�V���A���ԍ�
                        numDataSerialNumber++;
    
                        // 8.4 �G���h���R�[�h.���ŋ��z���v
                        if (Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'quantity' })) != 0) {
                            if ((Number(strBlackShippingType) >= 0 && Number(strBlackShippingType) <= 9) || Number(strBlackShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentBlackData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentBlackData.getValue({ name: 'rate' })) * Math.abs(Number(objCurrentBlackData.getValue({ name: 'quantity' })));
                            }
    
                        } else {
                            if ((Number(strBlackShippingType) >= 0 && Number(strBlackShippingType) <= 9) || Number(strBlackShippingType) == 61) {
                                amountEndRecordRawVersionTotal += Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            } else {
                                amountEndRecordRawVersionTotal -= Number(objCurrentBlackData.getValue({ name: 'rate' })) * Number(objCurrentBlackData.getValue({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
                            }
                        }
                      
                        // ����.�ŗ�
                        let strCurrentBlackTaxRate = objCurrentBlackData.getValue({ name: 'rate', join: 'taxitem' });
    
                        if (strCurrentBlackTaxRate == '10.00%') {
                            // 8.9 �W���ŗ��K�p���v���z
                            endRecordNormalTaxApplyAmount += Number(objCurrentBlackData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentBlackTaxRate == '8.00%') {
                            // 8.10 �y���ŗ��K�p���v���z
                            endRecordReducedTaxApplyAmount += Number(objCurrentBlackData.getValue({ name: 'amount' }));
                        }
                        if (strCurrentBlackTaxRate == '10.00%') {
                            // 8.11 ����Ŋz(�W���ŗ��K�p)
                            endRecordNormalTaxAmount += Number(objCurrentBlackData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentBlackTaxRate == '8.00%') {
                            // 8.12 ����Ŋz(�y���ŗ��K�p)
                            endRecordReducedTaxAmount += Number(objCurrentBlackData.getValue({ name: 'taxamount' }));
                        }
                        if (strCurrentBlackTaxRate == '0.00%') {
                            // 8.13 ��ېœK�p���v���z
                            endRecordNoTaxApplyAmount += Number(objCurrentBlackData.getValue({ name: 'amount' }));
                        }
                    });
    
                    let objBlackOrderJson = {
                        orderHeaderRecord: objBlackOrderHeaderJson,
                        orderHeaderOptionalRecord1: objBlackOrderHeaderOptionalJson1,
                        orderHeaderOptionalSubRecord1: objBlackOrderHeaderOptionalSubJson1,
                        orderHeaderOptionalRecord2: objBlackOrderHeaderOptionalJson2,
                        orderHeaderOptionalSubRecord2: objBlackOrderHeaderOptionalSubJson2,
                        orderHeaderOptionalRecord3: objBlackOrderHeaderOptionalJson3,
                        orderHeaderOptionalSubRecord3: objBlackOrderHeaderOptionalSubJson3,
                        orderHeaderOptionalRecord4: objBlackOrderHeaderOptionalJson4,
                        orderHeaderOptionalSubRecord4: objBlackOrderHeaderOptionalSubJson4,
                        orderHeaderOptionalRecord5: objBlackOrderHeaderOptionalJson5,
                        orderHeaderOptionalSubRecord5: objBlackOrderHeaderOptionalSubJson5,
                        orderLineRecords: arrBlackOrderLineRecords
                    };
                  log.debug({
          title: 'test: ' + arrCurrentBlackData[0].id,
          details: JSON.stringify(arrOrderRecords[0]['orderHeaderOptionalRecord1'])
        });
        log.debug({
          title: 'test: ' + arrCurrentBlackData[0].id,
          details: JSON.stringify(arrOrderRecords[0]['orderHeaderOptionalRecord2'])
        });
                    if (objBlackOrderHeaderOptionalJson1 == null || objBlackOrderHeaderOptionalJson1 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord1;
                    }
                    if (objBlackOrderHeaderOptionalSubJson1 == null || objBlackOrderHeaderOptionalSubJson1 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord1;
                    }
    
                    if (objBlackOrderHeaderOptionalJson2 == null || objBlackOrderHeaderOptionalJson2 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord2;
                    }
    
                    if (objBlackOrderHeaderOptionalSubJson2 == null || objBlackOrderHeaderOptionalSubJson2 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord2;
                    }
    
                    if (objBlackOrderHeaderOptionalJson3 == null || objBlackOrderHeaderOptionalJson3 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord3;
                    }
    
                    if (objBlackOrderHeaderOptionalSubJson3 == null || objBlackOrderHeaderOptionalSubJson3 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord3;
                    }
    
                    if (objBlackOrderHeaderOptionalJson4 == null || objBlackOrderHeaderOptionalJson4 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord4;
                    }
    
                    if (objBlackOrderHeaderOptionalSubJson4 == null || objBlackOrderHeaderOptionalSubJson4 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord4;
                    }
    
                    if (objBlackOrderHeaderOptionalJson5 == null || objBlackOrderHeaderOptionalJson5 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalRecord5;
                    }
    
                    if (objBlackOrderHeaderOptionalSubJson5 == null || objBlackOrderHeaderOptionalSubJson5 == '') {
                        delete objBlackOrderJson.orderHeaderOptionalSubRecord5;
                    }
                  log.debug({
          title: 'test: ' + arrCurrentBlackData[0].id,
          details: JSON.stringify(arrOrderRecords[0]['orderHeaderOptionalRecord1'])
        });
        log.debug({
          title: 'test2: ' + arrCurrentBlackData[0].id,
          details: JSON.stringify(arrOrderRecords[0]['orderHeaderOptionalRecord2'])
        });
                    arrOrderRecords.push(objBlackOrderJson);
                } catch (error) {
                    log.error({
                        title: '����-���`�[�f�[�^-�����G���[',
                        details: '�y�g�����U�N�V�����ԍ��z: ' + arrCurrentBlackData[0].getValue({name: 'tranid'}) + '\n�y�G���[�z: ' + error
                    });
                }
            }

            /**
             * �G���h���R�[�h���f�[�^
             * @type {object}
             */
            let objEndData = {
                // �f�[�^�V���A��No
                serialNumber: numDataSerialNumber,
                // ���R�[�h����
                recordCount: numEndRecordRecordCount,
                // ���̋��z���v
                rawVersionTotalAmount: Math.round(amountEndRecordRawVersionTotal),
                // ���ߋ��z���v
                rebateTotalAmount: amountEndRecordRebateTotal,
                // ����e����z���v
                recoverContainerTotalAmount: amountEndRecordRecoverContainerTotal,
                // �W���ŗ��K�p���v���z
                normalTaxApplyAmount: endRecordNormalTaxApplyAmount,
                // �y���ŗ��K�p���v���z
                reducedTaxApplyAmount: endRecordReducedTaxApplyAmount,
                // ����Ŋz(�W���ŗ��K�p)
                normalTaxAmount: endRecordNormalTaxAmount,
                // ����Ŋz(�y���ŗ��K�p)
                reducedTaxAmount: endRecordReducedTaxAmount,
                // ��ېœK�p���v���z
                noTaxApplyAmount: endRecordNoTaxApplyAmount
            };
            const objEndJson = createFinetInvoiceEndRecord(objEndData);

            // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^���� �v��
            numFileHeaderRecordSendDataCount++;
            // �f�[�^�V���A���ԍ�
            numDataSerialNumber++;

            // 1.19 �t�@�C���w�b�_�[���R�[�h.���M�f�[�^����
            objFileHeaderJson.sendDataCount = ('000000' + numFileHeaderRecordSendDataCount).slice(-6);

            if (arrOrderRecords.length <= 0) {
                /** �L���ȃf�[�^���Ȃ��ꍇ */
                continue;
            }

            objResult = {
                fileHeaderRecord: objFileHeaderJson,
                orderRecords: arrOrderRecords,
                endRecord: objEndJson
            };

            arrResults.push(objResult);
        }

        log.audit({
            title: 'getFinetInvoiceJSON - objTransactionIds',
            details: JSON.stringify(objTransactionIds)
        });

        if (objTransactionIds.invoiceIds.length > 0 || objTransactionIds.creditMemoIds.length > 0) {
            var updateTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_djkk_mr_finet',
                deploymentId: 'customdeploy_djkk_mr_finet_invoice',
                params: {
                    custscript_djkk_mr_finet_target_ids: JSON.stringify(objTransactionIds)
                }
            });
            updateTask.submit();
        }
        log.audit({
            title: 'getFinetInvoiceJSON - end',
            details: JSON.stringify(new Date())
        });
        return arrResults;
    }

    /**
     * FINET�A�g_�����p�f�[�^�擾
     * @returns {Object}
     */
    function getFinetInvoiceNormalDatas() {
        var objResult = {};
        var filters = [];

        // ���C�����C�� != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));

        // �ŋ����C�� != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));

        // ���㌴���s != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));

        // �o�׍s = F
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));

        // ���ߐ������Ɋ܂߂� = T
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));
        // �쐬��.DJ_FINET�������M�t���O = T
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_bill_mail_flg',
            join: 'createdfrom',
            operator: search.Operator.IS,
            values: true
        }));
        // DJ_FINET�A�g�ς݃t���O = F
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_invoice_sent_flg',
            operator: search.Operator.IS,
            values: false
        }));
        // �쐬�� != NULL
        filters.push(search.createFilter({
            name: 'createdfrom',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));
        // �쐬��.��� = ������
        filters.push(search.createFilter({
            name: 'type',
            join: 'createdfrom',
            operator: search.Operator.ANYOF,
            values: ['SalesOrd']
        }));
        // DJ_�O���V�X�e��_�s�ԍ� != NULL
        filters.push(search.createFilter({
            name: 'custcol_djkk_exsystem_line_num',
            operator: search.Operator.ISNOTEMPTY,
            values: ''
        }));
        // �쐬��.DJ_FINET_�ꎟ�X�R�[�h != NULL
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_first_store_code',
            join: 'createdfrom',
            operator: search.Operator.ISNOTEMPTY,
            values: ''
        }));
        // DJ_���v�������쐬�ς݃t���O
        filters.push(search.createFilter({
            name: 'custbody_djkk_invoicetotal_flag',
            operator: search.Operator.IS,
            values: true
        }));
        var columns = [];
        // �`�[�ԍ�
        columns.push(search.createColumn({ name: 'tranid' }));
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        // ���t
        columns.push(search.createColumn({ name: 'trandate' }));
        // �o�ד�
        columns.push(search.createColumn({ name: 'shipdate' }));
        // ����
        columns.push(search.createColumn({ name: 'quantity' }));
        // �P��/��
        columns.push(search.createColumn({ name: 'rate' }));
        // �P��
        columns.push(search.createColumn({ name: 'unit' }));
        // ���z
        columns.push(search.createColumn({ name: 'amount' }));
        // DJ_��������ԍ�
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        // DJ_�O���V�X�e��_�s�ԍ�
        columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
        // �A�C�e��
        columns.push(search.createColumn({ name: 'item' }));
        // �A�C�e��.DJ_����
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        // �A�C�e��.DJ_�A�C�e���J�i����
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        // �A�C�e��.UPCCODE
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        // �A�C�e��.���i�R�[�h
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        // �ꏊ.�R�[�h
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        // ����.�ŗ�
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
        // ����.�Ŋz
        columns.push(search.createColumn({ name: 'taxamount' }));
        // �ꏊ
        columns.push(search.createColumn({ name: 'location' }));
        // DJ_FINET_�ŏI���M��R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code', join: 'createdfrom' }));
        // DJ_FINET_�ŏI���M��R�[�h�i�\���j
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code_bk', join: 'createdfrom' }));
        // DJ_FINET_���ڑ��M���ƃR�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_code', join: 'createdfrom' }));
        // DJ_FINET_���ڑ��M���ƃR�[�h�i�\���j
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_codebk', join: 'createdfrom' }));
        // DJ_FINET_�񋟊�ƃR�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_provider_comp_code', join: 'createdfrom' }));
        // DJ_FINET�J�i�񋟊�Ɩ�
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaofferconame', join: 'createdfrom' }));
        // DJ_FINET_�ꎟ�X�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_first_store_code', join: 'createdfrom' }));
        // DJ_FINET_�񎟓X�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_second_store_code', join: 'createdfrom' }));
        // DJ_FINET_�O���X�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_third_store_code', join: 'createdfrom' }));
        // DJ_FINET_�l���X�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_fourth_store_code', join: 'createdfrom' }));
        // DJ_FINET_�܎��X�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_fifth_store_code', join: 'createdfrom' }));
        // DJ_FINET_��`���.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_bills_info', join: 'createdfrom' }));
        // DJ_FINET_�q���敪.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_location_type', join: 'createdfrom' }));
        // �쐬��.DJ_FINET_���M���Z���^�[�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' }));
        // DJ_FINET���M���Z���^�[�R�[�h(�\��)
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sendercentercode_s', join: 'createdfrom' }));
        //        // DJ_FINET���p�Ҋ�ƃR�[�h(�󂯎�)
        //        columns.push(search.createColumn({name: 'custbody_djkk_finet_user_company_code',join: 'createdfrom'}));

        // DJ_FINET�J�i�Ж��E�X���E����於
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername', join: 'createdfrom' }));
        // DJ_FINET�J�i�Z��
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomeraddress', join: 'createdfrom' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername2', join: 'createdfrom' }));
        // DJ_FINET�J�i�Z��_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option2', join: 'createdfrom' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername_o3', join: 'createdfrom' }));
        // DJ_FINET�J�i�Z��_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option3', join: 'createdfrom' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername4', join: 'createdfrom' }));
        // DJ_FINET�J�i�Z��_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option4', join: 'createdfrom' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername5', join: 'createdfrom' }));
        // DJ_FINET�J�i�Z��_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option5', join: 'createdfrom' }));
        // ����
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        // DJ_�������@�敪.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        // DJ_�[�i��.DJ_�[�i��J�i����
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET�o�׋敪
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        // DJ_����
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        // DJ_�[�i�����ה��l
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo' }));
        // DJ_�N���W�b�g����.�쐬��
        columns.push(search.createColumn({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' }));
        // �A�C�e��.DJ_�l�����A�C�e��
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));

        var results = searchResult(search.Type.INVOICE, filters, columns);
        for (var i = 0; i < results.length; i++) {
            // ������.id
            var tmpId = results[i].id;

            // �u�ŏI���M��R�[�h�v
            var tmpFinalDestinationCode = results[i].getValue({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' });

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                var objInvoiceDatas = {};
                var arrInvoiceDetailDatas = [];

                arrInvoiceDetailDatas.push(results[i]);

                objInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objInvoiceDatas;
            } else {
                var tmpObjInvoiceDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjInvoiceDatas.hasOwnProperty(tmpId.toString())) {
                    var arrInvoiceDetailDatas = [];

                    arrInvoiceDetailDatas.push(results[i]);

                    tmpObjInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;
                } else {
                    var tmpArrInvoiceDetailDatas = tmpObjInvoiceDatas[(tmpId.toString())];
                    tmpArrInvoiceDetailDatas.push(results[i]);
                    tmpObjInvoiceDatas[(tmpId.toString())] = tmpArrInvoiceDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjInvoiceDatas;
            }
        }
        return objResult;
    }

    /**
     * FINET�����i�ԓ`�j�f�[�^�擾
     * @returns {object} FINET�����i�ԓ`�j�f�[�^
     */
    function getFinetInvoiceRedData() {
        let objResult = {};

        let arrPrimaryKeys = [];

        let filters = [];

        // ���C�����C�� != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));

        // �ŋ����C�� != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));
        // ���㌴���s != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));

        // �o�׍s = F
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));

        // ���ߐ������Ɋ܂߂� = True
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));

        // DJ_FINET���M�敪 != null
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        // DJ_FINET�N���W�b�g�����A�g�ς݃t���O = False
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_invoice_sent_flg',
            operator: search.Operator.IS,
            values: false
        }));

        // DJ_���v�������쐬�ς݃t���O = True
        filters.push(search.createFilter({
            name: 'custbody_djkk_invoicetotal_flag',
            operator: search.Operator.IS,
            values: true
        }));

        // DJ_�[�i�� != NULL
        filters.push(search.createFilter({
            name: 'custbody_djkk_delivery_destination',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        let columns = [];
        /** �g�����U�N�V�����ԍ� */
        columns.push(search.createColumn({ name: 'tranid' }));
        /** DJ_�[�i��.DJ_FINET���M���Z���^�[�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_FINET�o�׋敪 */
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_shipping_typ' }));
        /** DJ_FINET�o�׋敪.�敪�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        /** ���t */
        columns.push(search.createColumn({ name: 'trandate' }));
        /** �g�����U�N�V�����ԍ� */
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        /** DJ_�[�i��.DJ_FINET_�ꎟ�X�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_�[�i��.DJ_FINET_�񎟓X�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_�[�i��.DJ_FINET_�O���X�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_�[�i��.DJ_FINET_�l���X�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_�[�i��.DJ_FINET_�܎��X�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' }));
        /** �ꏊ.�O��ID */
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        /** �ꏊ */
        columns.push(search.createColumn({ name: 'location' }));
        /** DJ_�������@�敪.�敪�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        /** DJ_�[�i��.DJ_�[�i��J�i���� */
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        /** ���׍s�ԍ� */
        columns.push(search.createColumn({ name: 'line' }));
        /** �A�C�e��.�A�C�e���ԍ� */
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        /** �A�C�e��.EAN�R�[�h */
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        /** �A�C�e��.DJ_�A�C�e���J�i���� */
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        /** �A�C�e��.DJ_�o�גP�ʋ敪 */
        columns.push(search.createColumn({ name: 'custitem_djkk_shipment_unit_type', join: 'item' }));
        /** �A�C�e��.DJ_���萔 */
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        /** DJ_���� */
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        /** ���� */
        columns.push(search.createColumn({ name: 'quantity' }));
        /** �P�� */
        columns.push(search.createColumn({ name: 'unit' }));
        /** �P��.�敪�R�[�h */
        // columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'unit' }));
        /** �P�� */
        columns.push(search.createColumn({ name: 'rate' }));
        /** ���ߐ��������� */
        columns.push(search.createColumn({ name: 'custbody_suitel10n_jp_ids_date' }));
        /** DJ_��������ԍ� */
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        /** DJ_FINET_�ŏI���M��R�[�h */
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code' }));
        /** �쐬��(�ԕi).�쐬���i�������j */
        columns.push(search.createColumn({ name: 'createdfrom', join: 'createdfrom' }));
        /** �쐬��(�ԕi).DJ_FINET_���M���Z���^�[�R�[�h */
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sender_center_code', join: 'createdfrom' }));
        /** �쐬��.�g�����U�N�V�����ԍ� */
        columns.push(search.createColumn({ name: 'transactionnumber', join: 'createdfrom' }))
        /** �A�C�e�� */
        columns.push(search.createColumn({ name: 'item' }));
        /** ���ߐ��������� */
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
      	columns.push(search.createColumn({name: 'createdfrom'}));
		columns.push(search.createColumn({name: 'amount'}));
        columns.push(search.createColumn({name: 'taxamount'}));
        // DJ_�[�i�����ה��l
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo' }));
        // ���׍s
        columns.push(search.createColumn({ name: 'line' }));
        // �쐬��.�쐬��
        columns.push(search.createColumn({ name: 'createdfrom', join: 'createdfrom' }));
        // �A�C�e��.DJ_�l�����A�C�e��
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));

        let results = searchResult(search.Type.CREDIT_MEMO, filters, columns);
        results.map(function (tmpResult) {
            /**
             * ����ID
             * @type {number}
             */
            let tmpId = tmpResult.id;

            let tmpKey = [tmpId, tmpResult.getValue({name: 'line'}).toString()].join('-');

            if (arrPrimaryKeys.indexOf(tmpKey) >= 0) {
                return;
            }

            arrPrimaryKeys.push(tmpKey);

            /**
             * DJ_FINET_�ŏI���M��R�[�h
             * @type {string}
             */
            let tmpFinalDestinationCode = tmpResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' });

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                var objCreditMemoDatas = {};
                var arrCreditMemoDetailDatas = [];

                arrCreditMemoDetailDatas.push(tmpResult);

                objCreditMemoDatas[(tmpId.toString())] = arrCreditMemoDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objCreditMemoDatas;
            } else {
                var tmpObjCreditMemoDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjCreditMemoDatas.hasOwnProperty(tmpId.toString())) {
                    var arrCreditMemoDetailDatas = [];

                    arrCreditMemoDetailDatas.push(tmpResult);

                    tmpObjCreditMemoDatas[(tmpId.toString())] = arrCreditMemoDetailDatas;
                } else {
                    var tmpArrCreditMemoDetailDatas = tmpObjCreditMemoDatas[(tmpId.toString())];
                    tmpArrCreditMemoDetailDatas.push(tmpResult);
                    tmpObjCreditMemoDatas[(tmpId.toString())] = tmpArrCreditMemoDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjCreditMemoDatas;
            }

        });
        return objResult;
    }

    /**
     * FINET�����i���`�j�f�[�^�擾
     * @returns {object} FINET�����i���`�j�f�[�^
     */
    function getFinetInvoiceBlackData() {
        /**
         * �������ʃI�u�W�F�N�g
         * @type {object}
         */
        let objResult = {};

        let arrPrimaryKeys = [];

        let filters = [];

        // ���C�����C�� != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));

        // �ŋ����C�� != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));
        // ���㌴���s != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));
        // �o�׍s = F
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));
        // ���ߐ������Ɋ܂߂� = True
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));

        // DJ_FINET���M�敪 != null
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        // DJ_FINET���M�敪 != [00:�ʏ�o��(��)]
        filters.push(search.createFilter({
            name: 'custrecord_djkk_finet_shipping_typ_cd',
            join: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.ISNOT,
            values: '00'
        }));

        // DJ_FINET�����A�g�ς݃t���O
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_invoice_sent_flg',
            operator: search.Operator.IS,
            values: false
        }))

        // DJ_���v�������쐬�ς݃t���O = True
        filters.push(search.createFilter({
            name: 'custbody_djkk_invoicetotal_flag',
            operator: search.Operator.IS,
            values: true
        }));

        // DJ_�[�i�� != NULL
        filters.push(search.createFilter({
            name: 'custbody_djkk_delivery_destination',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        let columns = [];
        /** �g�����U�N�V�����ԍ� */
        columns.push(search.createColumn({ name: 'tranid' }));
        /** DJ_�[�i��.DJ_FINET���M���Z���^�[�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_FINET�o�׋敪.�敪�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        /** ���t */
        columns.push(search.createColumn({ name: 'trandate' }));
        /** �g�����U�N�V�����ԍ� */
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        /** DJ_�N���W�b�g����.�g�����U�N�V�����ԍ� */
        columns.push(search.createColumn({ name: 'transactionnumber', join: 'custbody_djkk_invoice_creditmemo' }));
        /** DJ_�[�i��.DJ_FINET_�ꎟ�X�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_�[�i��.DJ_FINET_�񎟓X�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_�[�i��.DJ_FINET_�O���X�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_�[�i��.DJ_FINET_�l���X�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' }));
        /** DJ_�[�i��.DJ_FINET_�܎��X�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' }));
        /** �ꏊ.�O��ID */
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        /** DJ_�������@�敪.�敪�R�[�h */
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        /** DJ_�[�i��.DJ_�[�i��J�i���� */
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        /** ���׍s�ԍ� */
        columns.push(search.createColumn({ name: 'line' }));
        /** �A�C�e��.�A�C�e���ԍ� */
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        /** �A�C�e��.EAN�R�[�h */
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        /** �A�C�e��.DJ_�A�C�e���J�i���� */
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        /** DJ_���� */
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        /** ���� */
        columns.push(search.createColumn({ name: 'quantity' }));
        /** �P�� */
        columns.push(search.createColumn({ name: 'unit' }));
        /** �P�� */
        columns.push(search.createColumn({ name: 'rate' }));
        /** ���ߐ��������� */
        columns.push(search.createColumn({ name: 'custbody_suitel10n_jp_ids_date' }));
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        /** DJ_��������ԍ� */
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        /** DJ_FINET_�ŏI���M��R�[�h */
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code' }));
        /** �A�C�e�� */
        columns.push(search.createColumn({ name: 'item' }));
		columns.push(search.createColumn({name: 'amount'}));
        columns.push(search.createColumn({name: 'taxamount'}));
        columns.push(search.createColumn({name: 'line'}));
        // /** DJ_�N���W�b�g����.�g�����U�N�V�����ԍ� */
        // columns.push(search.createColumn({ name: 'transactionnumber', join: 'custbody_djkk_invoice_creditmemo' }));
        // /** DJ_�N���W�b�g����.�쐬���i�������j */
        // columns.push(search.createColumn({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' }))

        /** DJ_�N���W�b�g���� */
        columns.push(search.createColumn({ name: 'custbody_djkk_invoice_creditmemo' }));
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo'}));
        /** DJ_�������@�敪 */
        columns.push(search.createColumn({ name: 'custbody_djkk_ordermethodrtyp' }));
        // DJ_�N���W�b�g����.�쐬��
        columns.push(search.createColumn({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' }));
        // �A�C�e��.DJ_�l�����A�C�e��
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));

        let results = searchResult(search.Type.INVOICE, filters, columns);
        results.map(function (tmpResult) {
            /**
             * ����ID
             * @type {number}
             */
            let tmpId = tmpResult.id;

            let tmpKey = [tmpId, tmpResult.getValue({name: 'line'}).toString()].join('-');

            if (arrPrimaryKeys.indexOf(tmpKey) >= 0) {
                return;
            }

            arrPrimaryKeys.push(tmpKey);

            /**
             * DJ_FINET_�ŏI���M��R�[�h
             * @type {string}
             */
            let tmpFinalDestinationCode = tmpResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' });

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                var objCreditMemoDatas = {};
                var arrCreditMemoDetailDatas = [];

                arrCreditMemoDetailDatas.push(tmpResult);

                objCreditMemoDatas[(tmpId.toString())] = arrCreditMemoDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objCreditMemoDatas;
            } else {
                var tmpObjCreditMemoDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjCreditMemoDatas.hasOwnProperty(tmpId.toString())) {
                    var arrCreditMemoDetailDatas = [];

                    arrCreditMemoDetailDatas.push(tmpResult);

                    tmpObjCreditMemoDatas[(tmpId.toString())] = arrCreditMemoDetailDatas;
                } else {
                    var tmpArrCreditMemoDetailDatas = tmpObjCreditMemoDatas[(tmpId.toString())];
                    tmpArrCreditMemoDetailDatas.push(tmpResult);
                    tmpObjCreditMemoDatas[(tmpId.toString())] = tmpArrCreditMemoDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjCreditMemoDatas;
            }

        });
        return objResult;
    }

    /**
     * FINET�A�g_�o�׈ē��p�f�[�^�擾
     * @returns {Object}
     */
    function getFinetShippingNormalDatas() {
        var objResult = {};
        var filters = [];

        // ���C�����C�� != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));

        // �ŋ����C�� != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));
        // ���㌴���s != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));

        // �o�׍s = F
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));

        // ���ߐ������Ɋ܂߂� = T
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));
        // DJ_FINET�������M�t���O = T
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipment_mail_flg',
            operator: search.Operator.IS,
            values: true
        }));
        // DJ_FINET�o�׈ē��A�g�ς݃t���O = F
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipment_sent_flg',
            operator: search.Operator.IS,
            values: false
        }));
        // DJ_FINET_�ꎟ�X�R�[�h != NULL
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_first_store_code',
            operator: search.Operator.ISNOTEMPTY,
            values: ''
        }));

        var columns = [];
        // �`�[�ԍ�
        columns.push(search.createColumn({ name: 'tranid' }));
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        // ���t
        columns.push(search.createColumn({ name: 'trandate' }));
        // �o�ד�
        columns.push(search.createColumn({ name: 'shipdate' }));
        // ����
        columns.push(search.createColumn({ name: 'quantity' }));
        // �P��/��
        columns.push(search.createColumn({ name: 'rate' }));
        // �P��
        columns.push(search.createColumn({ name: 'unit' }));
        // ���z
        columns.push(search.createColumn({ name: 'amount' }));
        // DJ_��������ԍ�
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        // DJ_�O���V�X�e��_�s�ԍ�
        columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
        // �A�C�e��
        columns.push(search.createColumn({ name: 'item' }));
        // �A�C�e��.DJ_����
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        // �A�C�e��.DJ_�A�C�e���J�i����
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        // �A�C�e��.UPCCODE
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        // �A�C�e��.���i�R�[�h
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        // �ꏊ.�R�[�h
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        // ����.�ŗ�
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
        // ����.�Ŋz
        columns.push(search.createColumn({ name: 'taxamount' }));
        // �ꏊ
        columns.push(search.createColumn({ name: 'location' }));
        // DJ_FINET_�ŏI���M��R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code' }));
        // DJ_FINET_�ŏI���M��R�[�h�i�\���j
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code_bk' }));
        // DJ_FINET_���ڑ��M���ƃR�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_code' }));
        // DJ_FINET_���ڑ��M���ƃR�[�h�i�\���j
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_codebk' }));
        // DJ_FINET_�񋟊�ƃR�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_provider_comp_code' }));
        // DJ_FINET�J�i�񋟊�Ɩ�
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaofferconame' }));
        // DJ_FINET_�ꎟ�X�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_first_store_code' }));
        // DJ_FINET_�񎟓X�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_second_store_code' }));
        // DJ_FINET_�O���X�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_third_store_code' }));
        // DJ_FINET_�l���X�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_fourth_store_code' }));
        // DJ_FINET_�܎��X�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_fifth_store_code' }));
        // DJ_FINET_��`���.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_bills_info' }));
        // DJ_FINET_�q���敪.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_location_type' }));
        // �쐬��.DJ_FINET_���M���Z���^�[�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sender_center_code' }));
        // DJ_FINET���M���Z���^�[�R�[�h(�\��)
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sendercentercode_s' }));
        //        // DJ_FINET���p�Ҋ�ƃR�[�h(�󂯎�)
        //        columns.push(search.createColumn({name: 'custbody_djkk_finet_user_company_code'}));

        // DJ_FINET�J�i�Ж��E�X���E����於
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername' }));
        // DJ_FINET�J�i�Z��
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomeraddress' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername2' }));
        // DJ_FINET�J�i�Z��_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option2' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername_o3' }));
        // DJ_FINET�J�i�Z��_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option3' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername4' }));
        // DJ_FINET�J�i�Z��_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option4' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername5' }));
        // DJ_FINET�J�i�Z��_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option5' }));
        // ����
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        // DJ_�������@�敪.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        // DJ_�[�i��.DJ_�[�i��J�i����
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET�o�׋敪
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        // DJ_����
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        // DJ_�[�i�����ה��l
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo' }));
        // �A�C�e��.DJ_�l�����A�C�e��
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));
        
        var results = searchResult(search.Type.SALES_ORDER, filters, columns);

        /**
         * �쐬��������ID�ʐ������X�e�[�^�X
         * @type {object}
         */
        let objInvoiceStatusBySoId = {};

        /**
         * ���ʒ���������ID
         * @type {Array}
         */
        let arrAllSoId = [];
        results.map(function(result) {
            let tmpSoId = result.id;

            if (arrAllSoId.indexOf(tmpSoId.toString()) < 0) {
                arrAllSoId.push(tmpSoId.toString());
            }
        });

        let invoiceFilters = [];
        arrAllSoId.map(function(tmpSoId, index) {
            invoiceFilters.push(['createdfrom.internalid', search.Operator.IS, tmpSoId.toString()]);
            if (index != arrAllSoId.length - 1) {
                invoiceFilters.push('OR');
            }
        });
        let invoiceColumns = [];
        /** �쐬��.����ID */
        invoiceColumns.push(search.createColumn({ name: 'internalid', join: 'createdfrom'}));
        /** �X�e�[�^�X */
        invoiceColumns.push(search.createColumn({name: 'status'}));
        invoiceColumns.push(search.createColumn({name: 'approvalstatus'}));

        let invoiceResults = searchResult(search.Type.TRANSACTION, invoiceFilters, invoiceColumns);
        invoiceResults.map(function(invoiceResult) {
            let tmpResultStatus = invoiceResult.getValue({name: 'approvalstatus'});
            let tmpResultCreatedFromId = invoiceResult.getValue({ name: 'internalid', join: 'createdfrom' });

            if (tmpResultStatus == null || tmpResultStatus == '') {
                return;
            }

            let tmpResultArray = [];
            if (objInvoiceStatusBySoId.hasOwnProperty(tmpResultCreatedFromId.toString())) {
                tmpResultArray = objInvoiceStatusBySoId[tmpResultCreatedFromId.toString()];
            }

            tmpResultArray.push(tmpResultStatus.toString());

            objInvoiceStatusBySoId[tmpResultCreatedFromId.toString()] = tmpResultArray;
        });

        results.map(function(tmpResult) {
            /** 
             * ����ID
             * @type {string | number}
             */
            let tmpId = tmpResult.id;

            /** 
             * �ŏI���M��R�[�h
             * @type {string}
             */
            let tmpFinalDestinationCode = tmpResult.getValue({ name: 'custbody_djkk_finet_sender_center_code' });

            let arrRelationInvoiceStatus = [];
            if (objInvoiceStatusBySoId.hasOwnProperty(tmpId.toString())) {
                arrRelationInvoiceStatus = objInvoiceStatusBySoId[tmpId.toString()];
            }

            if (arrRelationInvoiceStatus.length <= 0) {
                /** �֘A���������ꌏ���쐬����Ă��Ȃ��ꍇ */
                return;
            }

            if (arrRelationInvoiceStatus.filter(function(tmp) {return tmp != '2';}).length > 0) {
                /** �֘A�������͑S�����F�ς݂ł͂Ȃ��ꍇ */
                return;
            }

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                let objInvoiceDatas = {};
                let arrInvoiceDetailDatas = [];

                arrInvoiceDetailDatas.push(tmpResult);

                objInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objInvoiceDatas;
            } else {
                let tmpObjInvoiceDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjInvoiceDatas.hasOwnProperty(tmpId.toString())) {
                    let arrInvoiceDetailDatas = [];

                    arrInvoiceDetailDatas.push(tmpResult);

                    tmpObjInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;
                } else {
                    let tmpArrInvoiceDetailDatas = tmpObjInvoiceDatas[(tmpId.toString())];
                    tmpArrInvoiceDetailDatas.push(tmpResult);
                    tmpObjInvoiceDatas[(tmpId.toString())] = tmpArrInvoiceDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjInvoiceDatas;
            }
        });

        return objResult;
    }

    /**
     * FINET�A�g_�o�׈ē��p�i�ԃf�[�^�j�f�[�^�擾
     * @returns {Object}
     */
    function getFinetShippingRedDatas() {
        let objResult = {};

        let arrPrimaryKeys = [];

        let filters = [];

        // ���C�����C�� != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));

        // �ŋ����C�� != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));
        
        // ���㌴���s != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));

        // �o�׍s = F
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));

        // ���ߐ������Ɋ܂߂� = T
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));

        /** DJ_FINET�o�׋敪 != NULL */
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        /** DJ_FINET�o�׈ē��A�g�ς݃t���O = False*/
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipment_sent_flg',
            operator: search.Operator.IS,
            values: false
        }));

        /** DJ_�[�i�� != null */
        filters.push(search.createFilter({
            name: 'custbody_djkk_delivery_destination',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        let columns = [];
        // �`�[�ԍ�
        columns.push(search.createColumn({ name: 'tranid' }));
        // �g�����U�N�V�����ԍ�
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        // ���t
        columns.push(search.createColumn({ name: 'trandate' }));
        // �o�ד�
        columns.push(search.createColumn({ name: 'shipdate' }));
        // ����
        columns.push(search.createColumn({ name: 'quantity' }));
        // �P��/��
        columns.push(search.createColumn({ name: 'rate' }));
        // �P��
        columns.push(search.createColumn({ name: 'unit' }));
        // ���z
        columns.push(search.createColumn({ name: 'amount' }));
        // DJ_��������ԍ�
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        // DJ_�O���V�X�e��_�s�ԍ�
        columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
        // �A�C�e��
        columns.push(search.createColumn({ name: 'item' }));
        // �A�C�e��.DJ_����
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        // �A�C�e��.DJ_�A�C�e���J�i����
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        // �A�C�e��.UPCCODE
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        // �A�C�e��.���i�R�[�h
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        // �ꏊ.�R�[�h
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        // ����.�ŗ�
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
        // ����.�Ŋz
        columns.push(search.createColumn({ name: 'taxamount' }));
        // �ꏊ
        columns.push(search.createColumn({ name: 'location' }));
        // DJ_FINET_�ŏI���M��R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code' }));
        // DJ_FINET_�ŏI���M��R�[�h�i�\���j
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code_bk' }));
        // DJ_FINET_���ڑ��M���ƃR�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_code' }));
        // DJ_FINET_���ڑ��M���ƃR�[�h�i�\���j
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_codebk' }));
        // DJ_FINET_�񋟊�ƃR�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_provider_comp_code' }));
        // DJ_FINET�J�i�񋟊�Ɩ�
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaofferconame' }));
        // DJ_�[�i��DJ_FINET_�ꎟ�X�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' }));
        // DJ_�[�i��DJ_FINET_�񎟓X�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' }));
        // DJ_�[�i��DJ_FINET_�O���X�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' }));
        // DJ_�[�i��DJ_FINET_�l���X�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' }));
        // DJ_�[�i��DJ_FINET_�܎��X�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET_��`���.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_bills_info' }));
        // DJ_FINET_�q���敪.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_location_type' }));
        // �쐬��.DJ_�[�i��.DJ_FINET_���M���Z���^�[�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET���M���Z���^�[�R�[�h(�\��)
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sendercentercode_s' }));
        //        // DJ_FINET���p�Ҋ�ƃR�[�h(�󂯎�)
        //        columns.push(search.createColumn({name: 'custbody_djkk_finet_user_company_code'}));

        // DJ_FINET�J�i�Ж��E�X���E����於
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername' }));
        // DJ_FINET�J�i�Z��
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomeraddress' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername2' }));
        // DJ_FINET�J�i�Z��_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option2' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername_o3' }));
        // DJ_FINET�J�i�Z��_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option3' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername4' }));
        // DJ_FINET�J�i�Z��_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option4' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername5' }));
        // DJ_FINET�J�i�Z��_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option5' }));
        // ����
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        // DJ_�������@�敪.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        // DJ_�[�i��.DJ_�[�i��J�i����
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET�o�׋敪
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        // DJ_����
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        // DJ_�[�i�����ה��l
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo' }));
        columns.push(search.createColumn({ name: 'createdfrom' }));
        columns.push(search.createColumn({ name: 'createdfrom', join: 'createdfrom' }));
        // �쐬��.�g�����U�N�V�����ԍ�
        columns.push(search.createColumn({ name: 'transactionnumber', join: 'createdfrom' }));
        // DJ_�������@�敪
        columns.push(search.createColumn({ name: 'custbody_djkk_ordermethodrtyp' }));
        columns.push(search.createColumn({name: 'line'}));
        // �A�C�e��.DJ_�l�����A�C�e��
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));

        let results = searchResult(search.Type.CREDIT_MEMO, filters, columns);

        results.map(function(tmpResult) {
            /** 
             * ����ID
             * @type {string | number}
             */
            let tmpId = tmpResult.id;

            let tmpKey = [tmpId, tmpResult.getValue({name: 'line'}).toString()].join('-');

            if (arrPrimaryKeys.indexOf(tmpKey) >= 0) {
                return;
            }

            arrPrimaryKeys.push(tmpKey);
            
            /** 
             * �ŏI���M��R�[�h
             * @type {string}
             */
            let tmpFinalDestinationCode = tmpResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' });

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                let objInvoiceDatas = {};
                let arrInvoiceDetailDatas = [];

                arrInvoiceDetailDatas.push(tmpResult);

                objInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objInvoiceDatas;
            } else {
                let tmpObjInvoiceDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjInvoiceDatas.hasOwnProperty(tmpId.toString())) {
                    let arrInvoiceDetailDatas = [];

                    arrInvoiceDetailDatas.push(tmpResult);

                    tmpObjInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;
                } else {
                    let tmpArrInvoiceDetailDatas = tmpObjInvoiceDatas[(tmpId.toString())];
                    tmpArrInvoiceDetailDatas.push(tmpResult);
                    tmpObjInvoiceDatas[(tmpId.toString())] = tmpArrInvoiceDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjInvoiceDatas;
            }
        });

        return objResult;
    }

    /**
     * FINET�A�g_�o�׈ē��p�i���f�[�^�j�f�[�^�擾
     * @returns {Object}
     */
    function getFinetShippingBlackDatas() {
        let objResult = {};

        let arrPrimaryKeys = [];

        let filters = [];

        // ���C�����C�� != T
        filters.push(search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: false
        }));
    
        // �ŋ����C�� != T
        filters.push(search.createFilter({
            name: 'taxline',
            operator: search.Operator.IS,
            values: false
        }));
        
        // �o�׍s != T
        filters.push(search.createFilter({
            name: 'shipping',
            operator: search.Operator.IS,
            values: false
        }));

        // ���㌴���s != T
        filters.push(search.createFilter({
            name: 'cogs',
            operator: search.Operator.IS,
            values: false
        }));

        // ���ߐ������Ɋ܂߂� = T
        filters.push(search.createFilter({
            name: 'custbody_4392_includeids',
            operator: search.Operator.IS,
            values: true
        }));
    
        /** DJ_FINET�o�׋敪 != NULL */
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));
    
        /** DJ_FINET�o�׋敪 != �u00:�ʏ�o��(��)�v */
        filters.push(search.createFilter({
            name: 'name',
            join: 'custbody_djkk_finet_shipping_typ',
            operator: search.Operator.ISNOT,
            values: '00:�ʏ�o��(��)'
        }));
    
        /** DJ_FINET�o�׈ē��A�g�ς݃t���O = False*/
        filters.push(search.createFilter({
            name: 'custbody_djkk_finet_shipment_sent_flg',
            operator: search.Operator.IS,
            values: false
        }));
    
        /** �X�e�[�^�X = ���F�ς� */
        filters.push(search.createFilter({
            name: 'status',
            operator: search.Operator.ANYOF,
            values: ['CustInvc:A']
        }));
    
        /** DJ_�[�i�� != null */
        filters.push(search.createFilter({
            name: 'custbody_djkk_delivery_destination',
            operator: search.Operator.NONEOF,
            values: ['@NONE@']
        }));

        let columns = [];
        // �`�[�ԍ�
        columns.push(search.createColumn({ name: 'tranid' }));
        // �`�[�ԍ�
        columns.push(search.createColumn({ name: 'transactionnumber' }));
        // ���t
        columns.push(search.createColumn({ name: 'trandate' }));
        // �o�ד�
        columns.push(search.createColumn({ name: 'shipdate' }));
        // ����
        columns.push(search.createColumn({ name: 'quantity' }));
        // �P��/��
        columns.push(search.createColumn({ name: 'rate' }));
        // �P��
        columns.push(search.createColumn({ name: 'unit' }));
        // ���z
        columns.push(search.createColumn({ name: 'amount' }));
        // DJ_��������ԍ�
        columns.push(search.createColumn({ name: 'custbody_djkk_customerorderno' }));
        // DJ_�O���V�X�e��_�s�ԍ�
        columns.push(search.createColumn({ name: 'custcol_djkk_exsystem_line_num' }));
        // �A�C�e��
        columns.push(search.createColumn({ name: 'item' }));
        // �A�C�e��.DJ_����
        columns.push(search.createColumn({ name: 'custitem_djkk_perunitquantity', join: 'item' }));
        // �A�C�e��.DJ_�A�C�e���J�i����
        columns.push(search.createColumn({ name: 'custitem_djkk_item_kana', join: 'item' }));
        // �A�C�e��.UPCCODE
        columns.push(search.createColumn({ name: 'upccode', join: 'item' }));
        // �A�C�e��.���i�R�[�h
        columns.push(search.createColumn({ name: 'itemid', join: 'item' }));
        // �ꏊ.�R�[�h
        columns.push(search.createColumn({ name: 'externalid', join: 'location' }));
        // ����.�ŗ�
        columns.push(search.createColumn({ name: 'rate', join: 'taxitem' }));
        // ����.�Ŋz
        columns.push(search.createColumn({ name: 'taxamount' }));
        // �ꏊ
        columns.push(search.createColumn({ name: 'location' }));
        // DJ_FINET_�ŏI���M��R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code' }));
        // DJ_FINET_�ŏI���M��R�[�h�i�\���j
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_final_dest_code_bk' }));
        // DJ_FINET_���ڑ��M���ƃR�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_code' }));
        // DJ_FINET_���ڑ��M���ƃR�[�h�i�\���j
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_direct_dest_codebk' }));
        // DJ_FINET_�񋟊�ƃR�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_provider_comp_code' }));
        // DJ_FINET�J�i�񋟊�Ɩ�
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaofferconame' }));
        // DJ_�[�i��.DJ_FINET_�ꎟ�X�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd1', join: 'custbody_djkk_delivery_destination' }));
        // DJ_�[�i��.DJ_FINET_�񎟓X�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd2', join: 'custbody_djkk_delivery_destination' }));
        // DJ_�[�i��.DJ_FINET_�O���X�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd3', join: 'custbody_djkk_delivery_destination' }));
        // DJ_�[�i��.DJ_FINET_�l���X�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd4', join: 'custbody_djkk_delivery_destination' }));
        // DJ_�[�i��.DJ_FINET_�܎��X�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetinvoicecustomercd5', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET_��`���.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_bills_info' }));
        // DJ_FINET_�q���敪.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_location_type' }));
        // �쐬��.DJ_FINET_���M���Z���^�[�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET���M���Z���^�[�R�[�h(�\��)
        columns.push(search.createColumn({ name: 'custbody_djkk_finet_sendercentercode_s' }));
        //        // DJ_FINET���p�Ҋ�ƃR�[�h(�󂯎�)
        //        columns.push(search.createColumn({name: 'custbody_djkk_finet_user_company_code'}));

        // DJ_FINET�J�i�Ж��E�X���E����於
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername' }));
        // DJ_FINET�J�i�Z��
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomeraddress' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername2' }));
        // DJ_FINET�J�i�Z��_option2
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option2' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername_o3' }));
        // DJ_FINET�J�i�Z��_option3
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option3' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername4' }));
        // DJ_FINET�J�i�Z��_option4
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option4' }));
        // DJ_FINET�J�i�Ж��E�X���E����於_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanacustomername5' }));
        // DJ_FINET�J�i�Z��_option5
        columns.push(search.createColumn({ name: 'custbody_djkk_finetkanaaddress_option5' }));
        // ����
        columns.push(search.createColumn({ name: 'custbody_suitel10n_inv_closing_date' }));
        // DJ_�������@�敪.�敪�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custbody_djkk_ordermethodrtyp' }));
        // DJ_�[�i��.DJ_�[�i��J�i����
        columns.push(search.createColumn({ name: 'custrecord_djkk_delivery_destinationkana', join: 'custbody_djkk_delivery_destination' }));
        // DJ_FINET�o�׋敪
        columns.push(search.createColumn({ name: 'custrecord_djkk_finet_shipping_typ_cd', join: 'custbody_djkk_finet_shipping_typ' }));
        // DJ_����
        columns.push(search.createColumn({ name: 'custcol_djkk_perunitquantity' }));
        // DJ_�[�i�����ה��l
        columns.push(search.createColumn({ name: 'custcol_djkk_deliverynotememo' }));
        // DJ_�N���W�b�g����
        columns.push(search.createColumn({ name: 'custbody_djkk_invoice_creditmemo' }));
        // DJ_�N���W�b�g����.�쐬��
        columns.push(search.createColumn({ name: 'createdfrom', join: 'custbody_djkk_invoice_creditmemo' }));
        // DJ_�N���W�b�g����.�g�����U�N�V�����ԍ�
        columns.push(search.createColumn({ name: 'transactionnumber', join: 'custbody_djkk_invoice_creditmemo' }));
        columns.push(search.createColumn({name: 'line'}));
        // �A�C�e��.DJ_�l�����A�C�e��
        columns.push(search.createColumn({ name: 'custitem_djkk_discounteditem', join: 'item'}));
        
        let results = searchResult(search.Type.INVOICE, filters, columns);

        results.map(function(tmpResult) {
            /** 
             * ����ID
             * @type {string | number}
             */
            let tmpId = tmpResult.id;

            let tmpKey = [tmpId, tmpResult.getValue({name: 'line'}).toString()].join('-');

            if (arrPrimaryKeys.indexOf(tmpKey) >= 0) {
                return;
            }

            arrPrimaryKeys.push(tmpKey);

            /** 
             * �ŏI���M��R�[�h
             * @type {string}
             */
            let tmpFinalDestinationCode = tmpResult.getValue({ name: 'custrecord_djkk_finetcustomeredicode', join: 'custbody_djkk_delivery_destination' });

            if (!objResult.hasOwnProperty(tmpFinalDestinationCode.toString())) {
                let objInvoiceDatas = {};
                let arrInvoiceDetailDatas = [];

                arrInvoiceDetailDatas.push(tmpResult);

                objInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;

                objResult[(tmpFinalDestinationCode.toString())] = objInvoiceDatas;
            } else {
                let tmpObjInvoiceDatas = objResult[(tmpFinalDestinationCode.toString())];

                if (!tmpObjInvoiceDatas.hasOwnProperty(tmpId.toString())) {
                    let arrInvoiceDetailDatas = [];

                    arrInvoiceDetailDatas.push(tmpResult);

                    tmpObjInvoiceDatas[(tmpId.toString())] = arrInvoiceDetailDatas;
                } else {
                    let tmpArrInvoiceDetailDatas = tmpObjInvoiceDatas[(tmpId.toString())];
                    tmpArrInvoiceDetailDatas.push(tmpResult);
                    tmpObjInvoiceDatas[(tmpId.toString())] = tmpArrInvoiceDetailDatas;
                }
                objResult[(tmpFinalDestinationCode.toString())] = tmpObjInvoiceDatas;
            }
        });

        return objResult;
    }

    /**
     * �f�[�^����
     * @param {object} normalDatas �ʏ�f�[�^
     * @param {object} redDatas �ԓ`�f�[�^
     * @param {object} blackDatas ���`�f�[�^
     * @return {object}
     */
    function groupOriginDatas(normalDatas, redDatas, blackDatas) {

        let objResult = {};

        /**
         * �ŏI���M��R�[�h�z��
         * @type {Array}
         */
        let arrFinalDestinationCodes = [];

        Object.keys(normalDatas).forEach(function(strNormalFinalDestinationCode){
            if (arrFinalDestinationCodes.indexOf(strNormalFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strNormalFinalDestinationCode.toString());
            }
        })
    
        Object.keys(redDatas).forEach(function (strRedFinalDestinationCode) {
            if (arrFinalDestinationCodes.indexOf(strRedFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strRedFinalDestinationCode.toString());
            }
        });
    
        Object.keys(blackDatas).forEach(function (strBlackFinalDestinationCode) {
            if (arrFinalDestinationCodes.indexOf(strBlackFinalDestinationCode.toString()) < 0) {
                arrFinalDestinationCodes.push(strBlackFinalDestinationCode.toString());
            }
        });
    
        arrFinalDestinationCodes.forEach(function (strFinalDestinationCode) {
    
            /**
             * �Y���ŏI���M��R�[�h���ʏ�f�[�^
             * @type {object}
             */
            let objCurrentCodeNormalDatasById = [];
            if (normalDatas.hasOwnProperty(strFinalDestinationCode.toString())) {
                objCurrentCodeNormalDatasById = normalDatas[(strFinalDestinationCode.toString())];
            }
    
            /**
             * �Y���ŏI���M��R�[�h���ԓ`�[�f�[�^
             * @type {object}
             */
            let objCurrentCodeRedDatasById = [];
            if (redDatas.hasOwnProperty(strFinalDestinationCode.toString())) {
                objCurrentCodeRedDatasById = redDatas[(strFinalDestinationCode.toString())];
            }
    
            /**
             * �Y���ŏI���M��R�[�h�����`�[�f�[�^
             * @type {Array}
             */
            let objCurrentCodeBlackDatasById = [];
            if (blackDatas.hasOwnProperty(strFinalDestinationCode.toString())) {
                objCurrentCodeBlackDatasById = blackDatas[(strFinalDestinationCode.toString())];
            }
    
            let objCurrentCodeDatas = {
                normal: {},
                black: {},
                red: {}
            };
            
            /**
             * �S�z���f�[�^�����p�z��
             * @type {Array}
             */
            let arrFullAmountDatas = [];
            
            /**
             * �����f�[�^�����p�z��
             * @type {Array}
             */
            let arrDiscountDatas = [];

            let objTmp = {};

            Object.keys(objCurrentCodeNormalDatasById).forEach(function (normalDataId) {
                arrFullAmountDatas = [];
                arrDiscountDatas = [];

                let arrDatasByCurrentId = objCurrentCodeNormalDatasById[normalDataId.toString()];

                arrDatasByCurrentId.forEach(function (tmpData) {
                    /**
                     * �A�C�e��.DJ_�l�����A�C�e��
                     * @type {boolean}
                     */
                    let flgItemDiscount = tmpData.getValue({name: 'custitem_djkk_discounteditem', join: 'item'});
                    if (!flgItemDiscount) {
                        /** �A�C�e��.DJ_�l�����A�C�e�� = false �̏ꍇ */
                        arrFullAmountDatas.push(tmpData);
                    } else {
                        arrDiscountDatas.push(tmpData);
                    }
                });

                if (arrFullAmountDatas.length > 0) {
                    objTmp = {};
                    objTmp[normalDataId] = arrFullAmountDatas;
                    objCurrentCodeDatas.normal = objectAssign(objCurrentCodeDatas.normal, objTmp);
                }

                if (arrDiscountDatas.length > 0) {
                    objTmp = {};
                    objTmp[normalDataId + '-discount'] = arrDiscountDatas;
                    objCurrentCodeDatas.normal = objectAssign(objCurrentCodeDatas.normal, objTmp);
                }
            });

            Object.keys(objCurrentCodeRedDatasById).forEach(function (redDataId) {
                arrFullAmountDatas = [];
                arrDiscountDatas = [];

                let arrDatasByCurrentId = objCurrentCodeRedDatasById[redDataId.toString()];

                arrDatasByCurrentId.forEach(function (tmpData) {
                    /**
                     * �A�C�e��.DJ_�l�����A�C�e��
                     * @type {boolean}
                     */
                    let flgItemDiscount = tmpData.getValue({name: 'custitem_djkk_discounteditem', join: 'item'});
                    if (!flgItemDiscount) {
                        /** �A�C�e��.DJ_�l�����A�C�e�� = false �̏ꍇ */
                        arrFullAmountDatas.push(tmpData);
                    } else {
                        arrDiscountDatas.push(tmpData);
                    }
                });

                if (arrFullAmountDatas.length > 0) {
                    objTmp = {};
                    objTmp[redDataId] = arrFullAmountDatas;
                    objCurrentCodeDatas.red = objectAssign(objCurrentCodeDatas.red, objTmp);
                }

                if (arrDiscountDatas.length > 0) {
                    objTmp = {};
                    objTmp[redDataId + '-discount'] = arrDiscountDatas;
                    objCurrentCodeDatas.red = objectAssign(objCurrentCodeDatas.red, objTmp);
                }
            });

            Object.keys(objCurrentCodeBlackDatasById).forEach(function (blackDataId) {
                arrFullAmountDatas = [];
                arrDiscountDatas = [];

                let arrDatasByCurrentId = objCurrentCodeBlackDatasById[blackDataId.toString()];

                arrDatasByCurrentId.forEach(function (tmpData) {
                    /**
                     * �A�C�e��.DJ_�l�����A�C�e��
                     * @type {boolean}
                     */
                    let flgItemDiscount = tmpData.getValue({name: 'custitem_djkk_discounteditem', join: 'item'});
                    if (!flgItemDiscount) {
                        /** �A�C�e��.DJ_�l�����A�C�e�� = false �̏ꍇ */
                        arrFullAmountDatas.push(tmpData);
                    } else {
                        arrDiscountDatas.push(tmpData);
                    }
                });

                if (arrFullAmountDatas.length > 0) {
                    objTmp = {};
                    objTmp[blackDataId] = arrFullAmountDatas;
                    objCurrentCodeDatas.black = objectAssign(objCurrentCodeDatas.black, objTmp);
                }

                if (arrDiscountDatas.length > 0) {
                    objTmp = {};
                    objTmp[blackDataId + '-discount'] = arrDiscountDatas;
                    objCurrentCodeDatas.black = objectAssign(objCurrentCodeDatas.black, objTmp);
                }
            });
            
            objResult[(strFinalDestinationCode.toString())] = objCurrentCodeDatas;
        });

        return objResult;
    } 

    /**
     * DJ_FINET���i�R�[�h�}�b�s���O���擾
     * @param {bool} �L�[�ɁuFINET���M���Z���^�[�R�[�h�v���܂߂邩
     * @returns {Object}
     */
    function getFinetItemCodeMapping(flgHasSenderCode) {
        var objResult = {};
        var filters = [];
        filters.push(search.createFilter({
            name: 'isinactive',
            operator: search.Operator.IS,
            values: false
        }));
        var columns = [];
        // DJ_���i�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_ficm_item_code' }));
        // DJ_FINET���i�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_ficm_finet_item_code' }));
        // DJ_FINET���M���Z���^�[�R�[�h.FINET���M���Z���^�[�R�[�h
        columns.push(search.createColumn({ name: 'custrecord_djkk_fcc_finet_center_code', join: 'custrecord_djkk_ficm_finet_center_code' }));

        var results = searchResult('customrecord_djkk_finet_itemcode_mapping', filters, columns);
        for (var i = 0; i < results.length; i++) {
            var tmpItemCode = results[i].getValue({ name: 'custrecord_djkk_ficm_item_code' });
            var tmpFinetItemCode = results[i].getValue({ name: 'custrecord_djkk_ficm_finet_item_code' });
            var tmpSenderCode = results[i].getValue({ name: 'custrecord_djkk_fcc_finet_center_code', join: 'custrecord_djkk_ficm_finet_center_code' });

            var tmpKey = '';

            if (flgHasSenderCode) {
                tmpKey = [tmpItemCode, tmpSenderCode].join('-');
            } else {
                tmpKey = tmpItemCode;
            }

            if (!objResult.hasOwnProperty(tmpKey.toString())) {
                objResult[(tmpKey.toString())] = tmpFinetItemCode;
            }
        }
        return objResult;
    }

    function getUnitCodeByItem() {
        var codeResults = {};
        var filters = [];
        var columns = [];
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code', join: 'custitem_djkk_shipment_unit_type' }));
        var results = searchResult(search.Type.ITEM, filters, columns);
        for (var i = 0; i < results.length; i++) {
            var tmpResult = results[i];
            var tmpItemId = tmpResult.id;
            var tmpUnitCode = tmpResult.getValue({ name: 'custrecord_djkk_type_code', join: 'custitem_djkk_shipment_unit_type' });

            codeResults[(tmpItemId.toString())] = tmpUnitCode;
        }

        return codeResults;
    }

    /**
     * FINET����-�t�@�C���w�b�_�[���R�[�h�쐬
     * @type {object} objData 
     * @param {string} objData.shippingType �o�׋敪
     * @param {number} objData.serialNumber �f�[�^�V���A��No.
     * @param {string} objData.systemDate �V�X�e�����t
     * @param {string} objData.systemTime �V�X�e������
     * @param {string} objData.orderMethod DJ_�������@�敪
     * @param {string} objData.senderCenterCode ���M���Z���^�[�R�[�h
     * @param {string} objData.finalDestinationCode �ŏI���M��R�[�h
     * @param {string} objData.finalDestinationCodeBk �ŏI���M��R�[�h�i�\���j
     * @param {string} objData.directDestinationCompanyCode ���ڑ��M���ƃR�[�h
     * @param {string} objData.directDestinationCompanyCodeBk ���ڑ��M���ƃR�[�h�i�\���j
     * @type {boolean} isNormalData �ʏ�f�[�^�ł��邩
     * @returns {object}
     */
    function createFinetInvoiceFileHeaderRecord(objData, isNormalData) {
        return {
            // ���R�[�h�敪
            recordType: '1',
            // �f�[�^�V���A��No
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // �o�׋敪
            shippingType: objData.shippingType,
            // ���[�J�[�v���
            makerAppropriationDate: objData.systemDate.slice(-6),
            // �f�[�^�쐬����
            dataCreateDate: objData.systemTime,
            // �t�@�C��No
            fileNo: '01',
            // �f�[�^������
            dataProcessDate: objData.systemDate.slice(-6),
            // ���p�Ҋ�ƃR�[�h
            userCompanyCode: ' ',
            // ���M���Z���^�[�R�[�h
            senderCenterCode: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.senderCenterCode : 'MB8803')
                    : 'MB8803'
            ),
            // ���M���Z���^�[�R�[�h�i�\���j
            senderCenterCodeBK: ' ',
            // �ŏI���M��R�[�h
            finalDestinationCode: objData.finalDestinationCode,
            // �ŏI���M��R�[�h�i�\���j
            finalDestinationCodeBK: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.finalDestinationCodeBk : ' ')
                    : ' '
            ),
            // ���ڑ��M���ƃR�[�h
            directDestinationCompanyCode: objData.directDestinationCompanyCode,
            // ���ڑ��M���ƃR�[�h�i�\���j
            directDestinationCompanyCodeBK: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.directDestinationCompanyCodeBk : ' ')
                    : ' '
            ),
            // �񋟊�ƃR�[�h
            providerCompanyCode: '13032255',
            // �񋟊�Ǝ��Ə��R�[�h
            providerCompanyOfficeCode: '',
            // �񋟊�Ɩ�
            providerCompanyName: '�����޳��',
            // �񋟊�ƎQ�Ǝ��Ə���
            providerCompanyOfficeName: '�ݼ�',
            // ���M�f�[�^����
            sendDataCount: '',
            // ���R�[�h�T�C�Y
            recordSize: '128',
            // �f�[�^�L���T�C��,
            isDataExistence: ' ',
            // �t�H�[�}�b�g�o�[�W����No
            formatVersionNo: '3',
            // �]��
            space: '',
        };
    }

    /**
     * FINET����-�`�[�w�b�_�[���R�[�h�쐬
     * @type {object} objData 
     * @param {number} objData.serialNumber �f�[�^�V���A��No.
     * @param {string} objData.shippingType �o�׋敪
     * @param {string} objData.tranDate �`�[���t
     * @param {string} objData.shipDate �o�ד�
     * @param {string} objData.transactionNumber �`�[�ԍ�
     * @param {string} objData.auxiliaryOrderNo �⏕�`�[No.
     * @param {string} objData.firstStoreCode �ꎟ�X�R�[�h
     * @param {string} objData.secondStoreCode �񎟓X�R�[�h
     * @param {string} objData.thirdStoreCode �O���X�R�[�h
     * @param {string} objData.forthStoreCode �l���X�R�[�h
     * @param {string} objData.fifthStoreCode �܎��X�R�[�h
     * @param {string} objData.billsInfo ��`���
     * @param {string} objData.locationType �q���敪
     * @param {string} objData.locationCode �q�ɃR�[�h
     * @returns 
     */
    function createFinetInvoiceOrderHeaderRecord(objData) {
        return {
            // ���R�[�h�敪
            recordType: '2',
            // �f�[�^�V���A��No.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // �o�׋敪
            shippingType: objData.shippingType,
            // ���[�J�[�v���
            makerRecordDate: formatDate(objData.tranDate).slice(-6),
            // �o�׌���
            shippingDate: formatDate(objData.shipDate).slice(-6),
            // �o��No.
            shippingNo: objData.transactionNumber[0] + objData.transactionNumber.slice(-7),
            // �⏕�`�[No�D
            auxiliaryOrderNo: objData.auxiliaryOrderNo,
            // �ꎟ�X�R�[�h
            firstStoreCode: objData.firstStoreCode,
            // �񎟓X�R�[�h
            secondStoreCode: objData.secondStoreCode,
            // �O���X�R�[�h
            thirdStoreCode: objData.thirdStoreCode,
            // �l���X�R�[�h
            fourthStoreCode: objData.forthStoreCode,
            // �܎��X�R�[�h
            fifthStoreCode: objData.fifthStoreCode,
            // �����R�[�h�敪�i�ꎟ�X�j
            firstClientCodeType: ((objData.firstStoreCode != null && objData.firstStoreCode != '') ? ' ' : ''),
            // �����R�[�h�敪�i�񎟓X�j
            secondClientCodeType: ((objData.secondStoreCode != null && objData.secondStoreCode != '') ? ' ' : ''),
            // �����R�[�h�敪�i�O���X�j
            thirdClientCodeType: ((objData.thirdStoreCode != null && objData.thirdStoreCode != '') ? ' ' : ''),
            // �����R�[�h�敪�i�l���X�j
            fourthClientCodeType: ((objData.forthStoreCode != null && objData.forthStoreCode != '') ? ' ' : ''),
            // �����R�[�h�敪�i�܎��X�j
            fifthClientCodeType: ((objData.fifthStoreCode != null && objData.fifthStoreCode != '') ? ' ' : ''),
            // ��`���
            billsInfo: objData.billsInfo,
            // �q���敪
            locationType: objData.locationType,
            // �z���`��
            deliveryForm: '',
            // ��ċ敪
            onceType: ' ',
            // �ϑ��i�敪
            shipmentProductType: '0',
            // �o�׈ē��ȊO�敪
            otherShippingInfoType: '0',
            // �W�v���׋敪
            totalLineType: ' ',
            // ���[�g�Z�[���X
            routeSales: ' ',
            // ���z���^���旿
            pickUpAmount: ' ',
            // �q�ɃR�[�h
            locationCode: objData.locationCode,
            // �ƍ������R�[�h
            collationOfficeCode: '',
            // ���i�e��敪
            productContainerType: '0',
            // ���`�[���t
            originOrderDate: '',
            // �]��
            space: '',
        };
    }

    /**
     * FINET����-�`�[�w�b�_�[�I�v�V�������R�[�h�쐬
     * @type {object} objData 
     * @param {number} objData.serialNumber �f�[�^�V���A��No.
     * @param {number} objData.headerReferenceNumber �w�b�_�[�Q��No
     * @param {string} objData.customerName �Ж��E�X���E����於
     * @param {string} objData.customerAddress �Z��
     * @param {string} objData.clientSupportCode �����Ή��R�[�h
     * @returns {object}
     */
    function createFinetInvoiceOrderHeaderOptionRecord(objData) {
        return {
            // ���R�[�h�敪
            recordType: '3',
            // �f�[�^�V���A��No
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // �w�b�_�[�Q��No.
            headerReferenceNumber: objData.headerReferenceNumber,
            // �Ж��E�X���E����於  �Q�Ɛ�m�F
            customerName: objData.customerName,
            // �Z��  �Q�Ɛ�m�F
            customerAddress: objData.customerAddress,
            // �����Ή��R�[�h
            clientSupportCode: objData.clientSupportCode,
            // ���{��敪
            japaneseSection: ' ',
            // �]��
            space: ''
        };
    }

    /**
     * FINET����-�`�[�w�b�_�[�I�v�V�������R�[�h�Q�쐬
     * @param {number} serialNumber �f�[�^�V���A��No
     * @return {object}
     */
    function createFinetInvoiceOrderHeaderOptionSubRecord(serialNumber) {
        return {
            // ���R�[�h�敪
            recordType: '4',
            // �f�[�^�V���A��No
            dataSerialNo: ('0000000' + serialNumber).slice(-7),
            // ���b�Z�[�W
            message: '',
            // ���{��敪
            japaneseSection: ' ',
            // �]��
            space: ''
        };
    }

    /**
     * FINET����-�`�[���׍s���R�[�h�쐬
     * @type {object} objData 
     * @param {number} objData.serialNumber �f�[�^�V���A��No.
     * @param {number} objData.lineNumber �`�[�sNo
     * @param {string} objData.itemCode ���i�R�[�h
     * @param {string} objData.itemNameKana ���i���i�J�i�j
     * @param {number} objData.unitQuantity ����
     * @param {number} objData.orderQuantity ����
     * @param {number} objData.quantity ����(�W��)
     * @param {string} objData.unit �P��
     * @param {number} objData.rate �P��
     * @param {number} objData.itemUnitQuantity �A�C�e��.DJ_���萔(�����)
     * @param {string} objData.billingCloseDate ��������
     * @param {string} objData.deliveryNoteMemo DJ_�[�i�����ה��l
     * @param {string} objData.orderNo ����No.
     * @param {string} objData.itemCodeUsageType ���i�R�[�h�g�p�敪
     * @returns 
     */
    function createFinetInvoiceLineRecord(objData) {
        return {
            // ���R�[�h�敪
            recordType: '5',
            // �f�[�^�V���A��No.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // �`�[�sNo�D
            orderLineNumber: Number(objData.lineNumber).toString(),
            // ���i�R�[�h
            itemCode: objData.itemCode,
            // ���i���i�J�i�j
            itemName: objData.itemNameKana,
            // ����
            unitQuantityInCarton: objData.unitQuantity,
            // ����
            orderQuantity: objData.orderQuantity,
            // �P��
            unit: objData.unit,
            // ���̒P��
            productionUnitAmount: Math.round(Number(objData.rate) * Number(objData.itemUnitQuantity)),
            // ���z
            amount: Math.abs(Math.round(Number(objData.rate) * Number(objData.quantity))),
            // ���i�敪
            amountType: ' ',
            // �P���g�p�敪
            unitAmountUsageType: '2',
            // �����P��
            wholesaleUnitAmount: '',
            // ��������
            billingCloseDate: objData.billingCloseDate,
            // ��������
            billingAccount: '',
            // �i�i���ߋ敪
            freebieRebateType: (objData.deliveryNoteMemo != null && objData.deliveryNoteMemo != '' && objData.deliveryNoteMemo.indexOf('�T���v��') >= 0) ? '4': ' ',
            // ����R�[�h
            specialCode: '6',
            // ���i�i����
            interiorPriceCount: '',
            // ����No�D
            orderNo: objData.orderNo,
            // ���[�J�[���i����
            makerItemType: '',
            // ���i�R�[�h�g�p�敪
            itemCodeUsageType: objData.itemCodeUsageType,
            // ����ŋ敪
            taxType: ' ',
            // ���ϊ���
            paymentDate: '',
            // �]��
            space: '',
        };
    }

    /**
     * FINET����-�G���h���R�[�h�쐬
     * @type {object} objData 
     * @param {number} objData.serialNumber �f�[�^�V���A��No
     * @param {number} objData.recordCount ���R�[�h����
     * @param {number} objData.rawVersionTotalAmount ���̋��z���v
     * @param {number} objData.rebateTotalAmount ���ߋ��z���v
     * @param {number} objData.recoverContainerTotalAmount ����e����z���v
     * @param {number} objData.normalTaxApplyAmount �W���ŗ��K�p���v���z
     * @param {number} objData.reducedTaxApplyAmount �y���ŗ��K�p���v���z
     * @param {number} objData.normalTaxAmount ����Ŋz(�W���ŗ��K�p)
     * @param {number} objData.reducedTaxAmount ����Ŋz(�y���ŗ��K�p)
     * @param {number} objData.noTaxApplyAmount ��ېœK�p���v���z
     * @return {object}
     */
    function createFinetInvoiceEndRecord(objData) {
        return {
            // ���R�[�h�敪
            recordType: '8',
            // �f�[�^�V���A��No.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // ���R�[�h����
            recordCount: objData.recordCount,
            // ���ŋ��z���v
            rawVersionTotalAmount: objData.rawVersionTotalAmount,
            // ���ߋ��z���v
            rebateTotalAmount: objData.rebateTotalAmount,
            // ����e����z���v
            recoverContainerTotalAmount: objData.recoverContainerTotalAmount,
            // �o�^�ԍ�
            registNumber: 'T6010001097269',
            // ����ŋ敪
            taxType: ' ',
            // �W���ŗ��K�p���v���z
            normalTaxApplyAmount: objData.normalTaxApplyAmount,
            // �y���ŗ��K�p���v���z
            reducedTaxApplyAmount: objData.reducedTaxApplyAmount,
            // ����Ŋz(�W���ŗ��K�p)
            normalTaxAmount: objData.normalTaxAmount,
            // ����Ŋz(�y���ŗ��K�p)
            reducedTaxAmount: objData.reducedTaxAmount,
            // ��ېœK�p���v���z
            noTaxApplyAmount: objData.noTaxApplyAmount,
            // �]��
            space: ''
        }
    }

    /**
     * FINET�o�׈ē�-�t�@�C���w�b�_�[���R�[�h�쐬
     * @type {object} objData 
     * @param {string} objData.shippingType �o�׋敪
     * @param {number} objData.serialNumber �f�[�^�V���A��No.
     * @param {string} objData.systemDate �V�X�e�����t
     * @param {string} objData.systemTime �V�X�e������
     * @param {string} objData.orderMethod DJ_�������@�敪
     * @param {string} objData.senderCenterCode ���M���Z���^�[�R�[�h
     * @param {string} objData.finalDestinationCode �ŏI���M��R�[�h
     * @param {string} objData.finalDestinationCodeBk �ŏI���M��R�[�h�i�\���j
     * @param {string} objData.directDestinationCompanyCode ���ڑ��M���ƃR�[�h
     * @param {string} objData.directDestinationCompanyCodeBk ���ڑ��M���ƃR�[�h�i�\���j
     * @type {boolean} isNormalData �ʏ�f�[�^�ł��邩
     * @returns {object}
     */
    function createFinetShippingFileHeaderRecord(objData, isNormalData) {
        return {
            // ���R�[�h�敪
            recordType: '1',
            // �f�[�^�V���A��No
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // �o�׋敪
            shippingType: objData.shippingType,
            // ���[�J�[�v���
            makerAppropriationDate: objData.systemDate.slice(-6),
            // �f�[�^�쐬����
            dataCreateDate: objData.systemTime,
            // �t�@�C��No
            fileNo: '01',
            // �f�[�^������
            dataProcessDate: objData.systemDate.slice(-6),
            // ���p�Ҋ�ƃR�[�h
            userCompanyCode: ' ',
            // ���M���Z���^�[�R�[�h
            senderCenterCode: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.senderCenterCode : 'MB8803')
                    : 'MB8803'
            ),
            // ���M���Z���^�[�R�[�h�i�\���j
            senderCenterCodeBK: ' ',
            // �ŏI���M��R�[�h
            finalDestinationCode: objData.finalDestinationCode,
            // �ŏI���M��R�[�h�i�\���j
            finalDestinationCodeBK: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.finalDestinationCodeBk : ' ')
                    : ' '
            ),
            // ���ڑ��M���ƃR�[�h
            directDestinationCompanyCode: objData.directDestinationCompanyCode,
            // ���ڑ��M���ƃR�[�h�i�\���j
            directDestinationCompanyCodeBK: (
                isNormalData
                    ? (objData.orderMethod == '1' ? objData.directDestinationCompanyCodeBk : ' ')
                    : ' '
            ),
            // �񋟊�ƃR�[�h
            providerCompanyCode: '13032255',
            // �񋟊�Ǝ��Ə��R�[�h
            providerCompanyOfficeCode: '',
            // �񋟊�Ɩ�
            providerCompanyName: '�����޳��',
            // �񋟊�ƎQ�Ǝ��Ə���
            providerCompanyOfficeName: '�ݼ�',
            // ���M�f�[�^����
            sendDataCount: '',
            // ���R�[�h�T�C�Y
            recordSize: '128',
            // �f�[�^�L���T�C��,
            isDataExistence: ' ',
            // �t�H�[�}�b�g�o�[�W����No
            formatVersionNo: '3',
            // �]��
            space: '',
        };
    }

    /**
     * FINET�o�׈ē�-�`�[�w�b�_�[���R�[�h�쐬
     * @type {object} objData 
     * @param {number} objData.serialNumber �f�[�^�V���A��No.
     * @param {string} objData.shippingType �o�׋敪
     * @param {string} objData.tranDate �`�[���t
     * @param {string} objData.shipDate �o�ד�
     * @param {string} objData.transactionNumber �`�[�ԍ�
     * @param {string} objData.auxiliaryOrderNo �⏕�`�[No.
     * @param {string} objData.firstStoreCode �ꎟ�X�R�[�h
     * @param {string} objData.secondStoreCode �񎟓X�R�[�h
     * @param {string} objData.thirdStoreCode �O���X�R�[�h
     * @param {string} objData.forthStoreCode �l���X�R�[�h
     * @param {string} objData.fifthStoreCode �܎��X�R�[�h
     * @param {string} objData.billsInfo ��`���
     * @param {string} objData.locationType �q���敪
     * @param {string} objData.locationCode �q�ɃR�[�h
     * @returns 
     */
    function createFinetShippingOrderHeaderRecord(objData) {
        return {
            // ���R�[�h�敪
            recordType: '2',
            // �f�[�^�V���A��No.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // �o�׋敪
            shippingType: objData.shippingType,
            // ���[�J�[�v���
            makerRecordDate: formatDate(objData.tranDate).slice(-6),
            // �o�׌���
            shippingDate: formatDate(objData.shipDate).slice(-6),
            // �o��No.
            shippingNo: objData.transactionNumber[0] + objData.transactionNumber.slice(-7),
            // �⏕�`�[No�D
            auxiliaryOrderNo: objData.auxiliaryOrderNo,
            // �ꎟ�X�R�[�h
            firstStoreCode: objData.firstStoreCode,
            // �񎟓X�R�[�h
            secondStoreCode: objData.secondStoreCode,
            // �O���X�R�[�h
            thirdStoreCode: objData.thirdStoreCode,
            // �l���X�R�[�h
            fourthStoreCode: objData.forthStoreCode,
            // �܎��X�R�[�h
            fifthStoreCode: objData.fifthStoreCode,
            // �����R�[�h�敪�i�ꎟ�X�j
            firstClientCodeType: ((objData.firstStoreCode != null && objData.firstStoreCode != '') ? ' ' : ''),
            // �����R�[�h�敪�i�񎟓X�j
            secondClientCodeType: ((objData.secondStoreCode != null && objData.secondStoreCode != '') ? ' ' : ''),
            // �����R�[�h�敪�i�O���X�j
            thirdClientCodeType: ((objData.thirdStoreCode != null && objData.thirdStoreCode != '') ? ' ' : ''),
            // �����R�[�h�敪�i�l���X�j
            fourthClientCodeType: ((objData.forthStoreCode != null && objData.forthStoreCode != '') ? ' ' : ''),
            // �����R�[�h�敪�i�܎��X�j
            fifthClientCodeType: ((objData.fifthStoreCode != null && objData.fifthStoreCode != '') ? ' ' : ''),
            // ��`���
            billsInfo: objData.billsInfo,
            // �q���敪
            locationType: objData.locationType,
            // �z���`��
            deliveryForm: '',
            // ��ċ敪
            onceType: ' ',
            // �ϑ��i�敪
            shipmentProductType: '0',
            // �o�׈ē��ȊO�敪
            otherShippingInfoType: '',
            // �W�v���׋敪
            totalLineType: ' ',
            // ���[�g�Z�[���X
            routeSales: ' ',
            // ���z���^���旿
            pickUpAmount: ' ',
            // �q�ɃR�[�h
            locationCode: objData.locationCode,
            // �ƍ������R�[�h
            collationOfficeCode: 'CS',
            // ���i�e��敪
            productContainerType: '0',
            // ���`�[���t
            originOrderDate: '',
            // �]��
            space: '',
        };
    }

    /**
     * FINET�o�׈ē�-�`�[�w�b�_�[�I�v�V�������R�[�h�쐬
     * @type {object} objData 
     * @param {number} objData.serialNumber �f�[�^�V���A��No.
     * @param {number} objData.headerReferenceNumber �w�b�_�[�Q��No
     * @param {string} objData.customerName �Ж��E�X���E����於
     * @param {string} objData.customerAddress �Z��
     * @param {string} objData.clientSupportCode �����Ή��R�[�h
     * @returns {object}
     */
    function createFinetShippingOrderHeaderOptionRecord(objData) {
        return {
            // ���R�[�h�敪
            recordType: '3',
            // �f�[�^�V���A��No
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // �w�b�_�[�Q��No.
            headerReferenceNumber: objData.headerReferenceNumber,
            // �Ж��E�X���E����於  �Q�Ɛ�m�F
            customerName: objData.customerName,
            // �Z��  �Q�Ɛ�m�F
            customerAddress: objData.customerAddress,
            // �����Ή��R�[�h
            clientSupportCode: objData.clientSupportCode,
            // ���{��敪
            japaneseSection: ' ',
            // �]��
            space: ''
        };
    }

    /**
     * FINET�o�׈ē�-�`�[�w�b�_�[�I�v�V�������R�[�h�Q�쐬
     * @param {number} serialNumber �f�[�^�V���A��No
     * @return {object}
     */
    function createFinetShippingOrderHeaderOptionSubRecord(serialNumber) {
        return {
            // ���R�[�h�敪
            recordType: '4',
            // �f�[�^�V���A��No
            dataSerialNo: ('0000000' + serialNumber).slice(-7),
            // ���b�Z�[�W
            message: '',
            // ���{��敪
            japaneseSection: ' ',
            // �]��
            space: ''
        };
    }

    /**
     * FINET�o�׈ē�-�`�[���׍s���R�[�h�쐬
     * @type {object} objData 
     * @param {number} objData.serialNumber �f�[�^�V���A��No.
     * @param {number} objData.lineNumber �`�[�sNo
     * @param {string} objData.itemCode ���i�R�[�h
     * @param {string} objData.itemNameKana ���i���i�J�i�j
     * @param {number} objData.unitQuantity ����
     * @param {number} objData.orderQuantity ����
     * @param {number} objData.quantity ����(�W��)
     * @param {string} objData.unit �P��
     * @param {number} objData.rate �P��
     * @param {number} objData.itemUnitQuantity �A�C�e��.DJ_���萔(�����)
     * @param {string} objData.billingCloseDate ��������
     * @param {string} objData.deliveryNoteMemo DJ_�[�i�����ה��l
     * @param {string} objData.orderNo ����No.
     * @param {string} objData.itemCodeUsageType ���i�R�[�h�g�p�敪
     * @returns 
     */
    function createFinetShippingLineRecord(objData) {
        return {
            // ���R�[�h�敪
            recordType: '5',
            // �f�[�^�V���A��No.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // �`�[�sNo�D
            orderLineNumber: Number(objData.lineNumber).toString(),
            // ���i�R�[�h
            itemCode: objData.itemCode,
            // ���i���i�J�i�j
            itemName: objData.itemNameKana,
            // ����
            unitQuantityInCarton: objData.unitQuantity,
            // ����
            orderQuantity: objData.orderQuantity,
            // �P��
            unit: objData.unit,
            // ���̒P��
            productionUnitAmount: Math.round(Number(objData.rate) * Number(objData.itemUnitQuantity)),
            // ���z
            amount: Math.abs(Math.round(Number(objData.rate) * Number(objData.quantity))),
            // ���i�敪
            amountType: ' ',
            // �P���g�p�敪
            unitAmountUsageType: '2',
            // �����P��
            wholesaleUnitAmount: '',
            // ��������
            billingCloseDate: objData.billingCloseDate,
            // ��������
            billingAccount: '',
            // �i�i���ߋ敪
            freebieRebateType: (objData.deliveryNoteMemo != null && objData.deliveryNoteMemo != '' && objData.deliveryNoteMemo.indexOf('�T���v��') >= 0) ? '4': ' ',
            // ����R�[�h
            specialCode: '6',
            // ���i�i����
            interiorPriceCount: '',
            // ����No�D
            orderNo: objData.orderNo,
            // ���[�J�[���i����
            makerItemType: '',
            // ���i�R�[�h�g�p�敪
            itemCodeUsageType: objData.itemCodeUsageType,
            // ����ŋ敪
            taxType: ' ',
            // ���ϊ���
            paymentDate: '',
            // �]��
            space: '',
        };
    }

    /**
     * FINET�o�׈ē�-�G���h���R�[�h�쐬
     * @type {object} objData 
     * @param {number} objData.serialNumber �f�[�^�V���A��No
     * @param {number} objData.recordCount ���R�[�h����
     * @param {number} objData.rawVersionTotalAmount ���̋��z���v
     * @param {number} objData.rebateTotalAmount ���ߋ��z���v
     * @param {number} objData.recoverContainerTotalAmount ����e����z���v
     * @return {object}
     */
    function createFinetShippingEndRecord(objData) {
        return {
            // ���R�[�h�敪
            recordType: '8',
            // �f�[�^�V���A��No.
            dataSerialNo: ('0000000' + objData.serialNumber).slice(-7),
            // ���R�[�h����
            recordCount: objData.recordCount,
            // ���ŋ��z���v
            rawVersionTotalAmount: objData.rawVersionTotalAmount,
            // ���ߋ��z���v
            rebateTotalAmount: objData.rebateTotalAmount,
            // ����e����z���v
            recoverContainerTotalAmount: objData.recoverContainerTotalAmount,
            // �]��
            space: ''
        }
    }

    /**
     * ���ʌ����t�@���N�V����
     * @param searchType �����Ώ�
     * @param filters ��������
     * @param columns �������ʗ�
     * @returns ��������
     */
    function searchResult(searchType, filters, columns) {
        var allSearchResult = [];

        var resultStep = 1000;
        var resultIndex = 0;

        var objSearch = search.create({
            type: searchType,
            filters: filters,
            columns: columns
        });

        var resultSet = objSearch.run();
        var results = [];

        do {
            results = resultSet.getRange({ start: resultIndex, end: resultIndex + resultStep });
            if (results != null && results != '') {
                for (var i = 0; i < results.length; i++) {
                    allSearchResult.push(results[i]);
                    resultIndex++;
                }
            }
        } while (results.length > 0);

        return allSearchResult;
    }

    /**
     * ���t�t�H�[�}�b�g(YYYYMMDD)
     * @param {Date} currentDate ���t
     * @returns {String} �t�H�[�}�b�g����t������
     */
    function formatDate(currentDate) {
        if (currentDate != null && currentDate != '') {
            currentDate = format.parse({ value: currentDate, type: format.Type.DATE });
            currentDate = currentDate.getFullYear() + ('00' + (currentDate.getMonth() + 1)).slice(-2) + ('00' + currentDate.getDate()).slice(-2);
        } else {
            currentDate = '';
        }
        return currentDate;
    }

    /**
    * ���{�̓��t���擾����
    * 
    * @returns ���{�̓��t
    */
    function getJapanDateTime() {
        var now = new Date();
        var offSet = now.getTimezoneOffset();
        var offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);

        return now;
    }


    /**
     * �ꏊ�}�X�^���擾
     * @returns 
     */
    function getLocationInfo() {
        var objLocationInfo = {};

        var filters = [];
        var columns = [];
        columns.push(search.createColumn({ name: 'externalid' }));
        var results = searchResult(search.Type.LOCATION, filters, columns);
        for (var i = 0; i < results.length; i++) {
            var tmpResult = results[i];
            objLocationInfo[(tmpResult.id.toString())] = {
                externalId: tmpResult.getValue({ name: 'externalid' })
            };
        }

        return objLocationInfo;
    }

    /**
     * DJ_�ėp�敪�}�X�^���擾
     * @returns {object}
     */
    function getCommonTypeCodeById() {
        let commonTypeCodeById = [];

        let filters = [];
        let columns = [];
        columns.push(search.createColumn({ name: 'custrecord_djkk_type_code' }));
        let results = searchResult('customrecord_djkk_common_type', filters, columns);
        for (let i = 0; i < results.length; i++) {
            let tmpId = results[i].id;
            let tmpTypeCode = results[i].getValue({ name: 'custrecord_djkk_type_code' });

            if (!commonTypeCodeById.hasOwnProperty(tmpId.toString())) {
                commonTypeCodeById[(tmpId.toString())] = tmpTypeCode;
            }
        }

        return commonTypeCodeById
    }

    /**
     * �I�u�W�F�N�g����
     * @param {object} objOrigin ������I�u�W�F�N�g
     * @param {object} objData �f�[�^�I�u�W�F�N�g
     * @return {object}
     */
    function objectAssign(objOrigin, objData) {
        let objResult = objOrigin;

        Object.keys(objData).forEach(function(key) {
            objResult[key] = objData[key];
        })
        return objResult;
    }
});