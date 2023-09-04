/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/serverWidget', 'SuiteScripts/DENISJAPAN/2.0/Common/djkk_common'], function(search, serverWidget, djkk_common) {

    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        var subsidiary = '2';
        var currency = '2';
        var entity = '322';

        var request = context.request;
        var response = context.response;

        if (request.method === 'GET') {
            // subsidiary = request.parameters.ssd;
            // currency = request.parameters.cry;
            // entity = request.parameters.ety;
        }

        // �\�񃌁[�g�I�����
        var form = serverWidget.createForm({
            title : '�\�񃌁[�g�I�����'
        });

        // �m��
        form.addSubmitButton({
            label : '�m��'
        });

        // ����
        form.addButton({
            id : 'custpage_djkk_yoyaku_rate_btn_close',
            label : '����',
            functionName : 'closeWindow();'
        });

        // �T�u���X�g
        var subList = form.addSublist({
            id : 'custpage_djkk_yoyaku_rate_list',
            label : '�\�񃌁[�g',
            type : serverWidget.SublistType.LIST
        });

        // ����ID
        var idField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_id',
            label : '����ID',
            type : serverWidget.FieldType.TEXT
        });

        // �_��ԍ�
        var contractIdField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_contractid',
            label : '�_��ԍ�',
            type : serverWidget.FieldType.TEXT
        });

        // ��s��
        var bankNameField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_bank_name',
            label : '��s��',
            type : serverWidget.FieldType.TEXT
        });

        // ���[�g
        var rateField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate',
            label : '���[�g',
            type : serverWidget.FieldType.TEXT
        });

        // �����O�݊z
        var initAmountField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_init_amount',
            label : '�����O�݊z',
            type : serverWidget.FieldType.CURRENCY
        });

        // �O�ݎc��
        var residualAmountField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_residual_amount',
            label : '�O�ݎc��',
            type : serverWidget.FieldType.CURRENCY
        });

        // �g�p�\����FROM
        var dateFromField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_date_from',
            label : '�g�p�\����FROM',
            type : serverWidget.FieldType.DATE
        });

        // �g�p�\����TO
        var dateToField = subList.addField({
            id : 'custpage_djkk_yoyaku_rate_date_to',
            label : '�g�p�\����TO',
            type : serverWidget.FieldType.DATE
        });

        // �f�[�^���擾����
        if (subsidiary && currency && entity) {
            setYoyakuRate(subsidiary, currency, entity, subList);
        }

        response.writePage(form);
    }

    /**
     * �\�񃌁[�g�f�[�^���擾����
     */
    function setYoyakuRate(subsidiary, currency, entity, subList) {

        var searchType = 'customrecord_djkk_yoyaku_rate_tbl';

        var searchFilters = [];
        searchFilters.push(["custrecord_djkk_yoyaku_company", "anyof", subsidiary]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_yoyaku_category", "anyof", "1"]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_yoyaku_currency", "anyof", currency]);
        searchFilters.push("AND");
        searchFilters.push(["custrecord_djkk_yoyaku_entity", "anyof", entity]);
        searchFilters.push("AND");
        searchFilters.push(["isinactive", "is", "F"]);

        var searchColumns = [search.createColumn({
            name : "custrecord_djkk_yoyaku_contractid",
            label : "DJ_�_��ԍ�"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_bank_name",
            label : "DJ_��s��"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_rate",
            label : "DJ_���[�g"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_init_amount",
            label : "DJ_�����O�݊z"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_residual_amount",
            label : "DJ_�O�ݎc��"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_date_from",
            label : "DJ_�g�p�\����From"
        }), search.createColumn({
            name : "custrecord_djkk_yoyaku_date_to",
            label : "DJ_�g�p�\����To"
        })];

        var searchResults = djkk_common.getCreateSearchResults(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for ( var i = 0; i < searchResults.length; i++) {

                var tmpResult = searchResults[i];

                // ����ID
                var tmpId = tmpResult.id;
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_id',
                    line : i,
                    value : tmpId
                });

                // �_��ԍ�
                var tmpContractId = tmpResult.getValue(searchColumns[0]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_contractid',
                    line : i,
                    value : tmpContractId
                });

                // ��s��
                var tmpBankName = tmpResult.getText(searchColumns[1]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_bank_name',
                    line : i,
                    value : tmpBankName
                });

                // ���[�g
                var tmpRate = tmpResult.getValue(searchColumns[2]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate',
                    line : i,
                    value : tmpRate
                });

                // �����O�݊z
                var tmpInitAmount = tmpResult.getValue(searchColumns[3]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_init_amount',
                    line : i,
                    value : tmpInitAmount
                });

                // �O�ݎc��
                var residualAmount = tmpResult.getValue(searchColumns[4]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_residual_amount',
                    line : i,
                    value : residualAmount
                });

                // �g�p�\����FROM
                var tmpDateFrom = tmpResult.getValue(searchColumns[5]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_date_from',
                    line : i,
                    value : tmpDateFrom
                });

                // �g�p�\����TO
                var tmpDateTo = tmpResult.getValue(searchColumns[6]);
                subList.setSublistValue({
                    id : 'custpage_djkk_yoyaku_rate_date_to',
                    line : i,
                    value : tmpDateTo
                });
            }
        }
        return searchResults;
    }

    return {
        onRequest : onRequest
    };
});
