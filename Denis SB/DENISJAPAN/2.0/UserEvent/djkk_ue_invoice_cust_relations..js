/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/serverWidget', 'SuiteScripts/DENISJAPAN/2.0/Common/djkk_common'], function(search, serverWidget, djkk_common) {

    /**
     * Function definition to be triggered before record is loaded.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

        var type = scriptContext.type;
        if (type == 'view' || type == 'edit') {

            var form = scriptContext.form;

            var sublist = form.addSublist({
                id : 'custpage_djkk_invoice_links_list',
                type : serverWidget.SublistType.LIST,
                label : '�֘A�N���W�b�g�����E�ԕi',
                tab : 'rlrcdstab'
            });

            var dateField = sublist.addField({
                id : 'custpage_djkk_invoice_links_date',
                type : serverWidget.FieldType.TEXT,
                label : '���t'
            });

            var typeField = sublist.addField({
                id : 'custpage_djkk_invoice_links_type',
                type : serverWidget.FieldType.TEXT,
                label : '���'
            });

            var tranIdField = sublist.addField({
                id : 'custpage_djkk_invoice_links_tranid',
                type : serverWidget.FieldType.TEXT,
                label : '�ԍ�'
            });

            var statusField = sublist.addField({
                id : 'custpage_djkk_invoice_links_status',
                type : serverWidget.FieldType.TEXT,
                label : '�X�e�[�^�X'
            });

            var newRec = scriptContext.newRecord;
            var invoiceId = newRec.id;
            if (invoiceId) {
                getLinksDatas(invoiceId, sublist);   
            }
        }
    }

    /**
     * �N���W�b�g�����E�ԕi�f�[�^���擾����
     */
    function getLinksDatas(invoiceId, sublist) {

        var searchType = 'transaction';

        var searchFilters = [];
        searchFilters.push(["type", "anyof", "RtnAuth", "CustCred"]);
        searchFilters.push("AND");
        searchFilters.push(["mainline", "is", "T"]);
        searchFilters.push("AND");
        searchFilters.push(["createdfrom.type", "anyof", "CustInvc"]);
        searchFilters.push("AND");
        searchFilters.push(["createdfrom.internalid", "anyof", invoiceId]);

        var searchColumns = [];
        searchColumns.push(search.createColumn({
            name : "internalid",
            label : "����ID"
        }));
        searchColumns.push(search.createColumn({
            name : "trandate",
            label : "���t"
        }));
        searchColumns.push(search.createColumn({
            name : "type",
            label : "���"
        }));
        searchColumns.push(search.createColumn({
            name : "tranid",
            label : "�ԍ�"
        }));
        searchColumns.push(search.createColumn({
            name : "statusref",
            label : "�X�e�[�^�X"
        }));

        var searchResults = djkk_common.getCreateSearchResults(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {

                var tmpResult = searchResults[i];

                // ����ID
                var tmpId = tmpResult.getValue(searchColumns[0]);

                // ���
                var tmpTypeVal = tmpResult.getValue(searchColumns[2]);

                // ���t
                var tmpDate = tmpResult.getValue(searchColumns[1]);
                if (tmpDate) {
                    var strDate = djkk_common.toStrDate(tmpDate);
                    var strLinks = '';
                    if (tmpTypeVal == 'RtnAuth') {
                        strLinks = '<a href="/app/accounting/transactions/rtnauth.nl?id=' + tmpId + '&whence=">' + strDate + '</a>';
                    } else {
                        var tmpStatusVal = tmpResult.getValue(searchColumns[4]);
                        // if (tmpStatusVal == 'applied') {
                        // continue;
                        // }
                        strLinks = '<a href="/app/accounting/transactions/custcred.nl?id=' + tmpId + '&whence=">' + strDate + '</a>';
                    }
                    sublist.setSublistValue({
                        id : 'custpage_djkk_invoice_links_date',
                        line : i,
                        value : strLinks
                    });
                }

                // ���
                var tmpType = tmpResult.getText(searchColumns[2]);
                if (tmpType) {
                    sublist.setSublistValue({
                        id : 'custpage_djkk_invoice_links_type',
                        line : i,
                        value : tmpType
                    });
                }

                // �ԍ�
                var tmpTranid = tmpResult.getValue(searchColumns[3]);
                if (tmpTranid) {
                    sublist.setSublistValue({
                        id : 'custpage_djkk_invoice_links_tranid',
                        line : i,
                        value : tmpTranid
                    });
                }

                // �X�e�[�^�X
                var tmpStatus = tmpResult.getText(searchColumns[4]);
                if (tmpStatus) {
                    sublist.setSublistValue({
                        id : 'custpage_djkk_invoice_links_status',
                        line : i,
                        value : tmpStatus
                    });
                }
            }
        }
    }

    return {
        beforeLoad : beforeLoad
    };
});
