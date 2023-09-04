/**
 * lib.js
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 */

define(['N/search', 'underscore', 'me'], function (search, _, me) {
    function getSetting() {
        try {
            var obj = {};
            var fieldLookUp = search.lookupFields({
                type: 'customrecord_dj_custpayment_setting',
                id: 1,
                columns: [
                    'custrecord_dj_custpayment_setting_acc',
                    'custrecord_dj_cuspm_setting_acc_tax_plus',
                    'custrecord_dj_cuspm_seting_acc_tax_minus',
                    'custrecord_dj_custpayment_setting_taxco',
                    'custrecord_dj_custpayment_setting_taxca',
                    'custrecord_dj_custpayment_setting_error',
                    'custrecord_dj_custpayment_setting_plus',
                    'custrecord_dj_custpayment_setting_minus'
                ]
            });
            if (!_.isEmpty(fieldLookUp.custrecord_dj_custpayment_setting_acc))
                obj.acc = fieldLookUp.custrecord_dj_custpayment_setting_acc[0].value
            if (!_.isEmpty(fieldLookUp.custrecord_dj_cuspm_setting_acc_tax_plus))
                obj.accTaxPlus = fieldLookUp.custrecord_dj_cuspm_setting_acc_tax_plus[0].value
            if (!_.isEmpty(fieldLookUp.custrecord_dj_cuspm_seting_acc_tax_minus))
                obj.accTaxMinus = fieldLookUp.custrecord_dj_cuspm_seting_acc_tax_minus[0].value
            if (!_.isEmpty(fieldLookUp.custrecord_dj_custpayment_setting_taxco))
                obj.taxco = fieldLookUp.custrecord_dj_custpayment_setting_taxco[0].value
            if (!_.isEmpty(fieldLookUp.custrecord_dj_custpayment_setting_taxca))
                obj.taxca = fieldLookUp.custrecord_dj_custpayment_setting_taxca[0].value
            obj.error = fieldLookUp.custrecord_dj_custpayment_setting_error
            if (!_.isEmpty(fieldLookUp.custrecord_dj_custpayment_setting_plus))
                obj.plus = fieldLookUp.custrecord_dj_custpayment_setting_plus[0].value
            if (!_.isEmpty(fieldLookUp.custrecord_dj_custpayment_setting_minus))
                obj.minus = fieldLookUp.custrecord_dj_custpayment_setting_minus[0].value
            return obj;
        } catch (e) {
            log.error('lib getSetting ' + e.name, e.message);
        }
    }

    function getTaxCode() {
        try {
            var objList = [];

            var mysearch = search.create({
                // type: 'taxgroup',
                type: 'salestaxitem',
                columns: [{
                    name: 'itemid'
                }]
            });
            var resultSet = mysearch.run().getRange({start: 0, end: 1000});
            util.each(resultSet, function (result) {
                var obj = {};
                obj.id = result.id;
                obj.text = result.getValue({name: 'itemid'});
                objList.push(obj);
            });
            return objList;
        } catch (e) {
            log.error('getTaxCode: ' + e.name, e.message);
            return [];
        }

    }

    function doGetInvDetail(paramObj) {
        try {
            log.audit("paramObj:",paramObj);
            if (me.isEmpty(paramObj.client))
                return [];
            var filterArr = [];
            filterArr.push({
                name: 'mainline',
                operator: search.Operator.IS,
                values: ['T']
            });
            filterArr.push({
                name: 'type',
                operator: search.Operator.ANYOF,
                // values: ['CustInvc', 'Deposit', 'CustDep', 'Journal']
                values: ['CustInvc']
            });
            filterArr.push({
                name: 'status',
                operator: search.Operator.ANYOF,
                values: ['CustInvc:A']
            });
            filterArr.push({
                name: 'debitamount',
                operator: search.Operator.ISNOTEMPTY
            });
            // filterArr.push({
            //     name: 'entity',
            //     operator: search.Operator.ANYOF,
            //     values: [paramObj.client]
            // });
            if (!me.isEmpty(paramObj.account))
                filterArr.push({
                    name: 'account',
                    operator: search.Operator.ANYOF,
                    values: [paramObj.account]
                });
            //add filter for trandate From~To
            //FromTo

            log.audit('paramObj.from', paramObj.from);
            log.audit('paramObj.to', paramObj.to);
            if (!me.isEmpty(paramObj.from) && !me.isEmpty(paramObj.to)) {
                filterArr.push({
                    name: 'duedate',
                    operator: search.Operator.WITHIN,
                    values: [paramObj.from, paramObj.to]
                });
            }
            //From~
            else if (!me.isEmpty(paramObj.from) && me.isEmpty(paramObj.to)) {
                filterArr.push({
                    name: 'duedate',
                    operator: search.Operator.ONORAFTER,
                    values: [paramObj.from]
                });
            }
            //~To
            else if (me.isEmpty(paramObj.from) && !me.isEmpty(paramObj.to)) {
                filterArr.push({
                    name: 'duedate',
                    operator: search.Operator.ONORBEFORE,
                    values: [paramObj.to]
                });
            }

            log.audit('filterArr', filterArr);
            var transactionSearchObj = search.create({
                type: "transaction",
                filters: filterArr,
                columns:
                    [
                        search.createColumn({name: "entity", label: "Name"}),
                        search.createColumn({name: "subsidiary", label: "Subsidiary"}),
                        search.createColumn({name: "trandate", label: "Date"}),
                        search.createColumn({name: "tranid", label: "Document Number"}),
                        search.createColumn({name: "amount", label: "Amount"}),
                        search.createColumn({name: "amountremaining", label: "Amount Remaining"}),
                        search.createColumn({name: "statusref", label: "Status"}),
                        search.createColumn({
                            name: "department",
                            sort: search.Sort.ASC,
                            label: "Department"
                        }),
                        search.createColumn({
                            name: "duedate",
                            sort: search.Sort.ASC,
                            label: "Due Date/Receive By"
                        }),
                        search.createColumn({name: "account", label: "Account"}),
                        search.createColumn({name: "saleseffectivedate", label: "Sales Effective Date"}),
                        search.createColumn({name: "custbody_djkk_hold_flg", label: "djkk hold flg"})
                    ]
            });
            var searchResultCount = transactionSearchObj.run();
            var searchCustResults = [];
            if (searchResultCount != null) {
                var searchCount = 0;
                var searchlinesResults;
                do {
                    searchlinesResults = searchResultCount.getRange({
                        start: searchCount,
                        end: searchCount + 1000
                    });
                    if (searchlinesResults != null && searchlinesResults.length > 0) {
                        searchCustResults = searchCustResults.concat(searchlinesResults);
                    }
                    searchCount += 1000;
                } while ( searchlinesResults . length == 1000 );
            }
            var resultArr = [];
            var subsidiaryText = getSubsidiaryText(paramObj.subsidiary);
            for (var k = 0; k < searchCustResults.length; k++){
                var result = searchCustResults[k];
                var resText = result.getText({name: 'entity'});
                // log.debug("result.getText({name: 'entity'})",resText + "--length:"+resText.length);
                // log.debug("paramObj.clientName",paramObj.clientName + "--length:"+paramObj.clientName.length);
                // log.debug("entity search clientName",result.getText({name: 'entity'}).search(new RegExp("(?:^|(\\s))"+paramObj.clientName+"(?:$|\\s)")));
                if ((result.getText({name: 'entity'})+" ").indexOf(" "+paramObj.clientName+" ") < 0
                    || result.getText({name: 'subsidiary'}).split(' : ').indexOf(subsidiaryText) < 0) {
                    continue;
                }
                var obj = {};
                obj.id = result.id;
                obj.entity = result.getValue({name: 'entity'});
                obj.customerName = result.getText({name: 'entity'});
                obj.trandate = result.getValue({name: 'trandate'});
                obj.tranid = result.getValue({name: 'tranid'});
                obj.amount = result.getValue({name: 'amount'});
                obj.amountremaining = result.getValue({name: 'amountremaining'});
                obj.department = result.getText({name: 'department'});
                obj.account = result.getValue({name: 'account'});
                obj.duedate = result.getValue({name: 'duedate'});
                obj.holdFlg = result.getValue({name: 'custbody_djkk_hold_flg'});
                obj.subsidiary = result.getText({name: 'subsidiary'});
                resultArr.push(obj);
            };

            log.audit("doGetInvDetail:",resultArr);
            return resultArr;
        } catch (e) {
            log.error('doGetInvDetail: ' + e.name, e.message);
            return [];
        }
    }

    function doGetAllInvDetail() {
        try {
            var filterArr = [];
            filterArr.push({
                name: 'mainline',
                operator: search.Operator.IS,
                values: ['T']
            });
            filterArr.push({
                name: 'type',
                operator: search.Operator.ANYOF,
                // values: ['CustInvc', 'Deposit', 'CustDep', 'Journal']
                values: ['CustInvc']
            });
            filterArr.push({
                name: 'status',
                operator: search.Operator.ANYOF,
                values: ['CustInvc:A']
            });
            filterArr.push({
                name: 'debitamount',
                operator: search.Operator.ISNOTEMPTY
            });


            log.audit('filterArr', filterArr);
            var transactionSearchObj = search.create({
                type: "transaction",
                filters: filterArr,
                columns:
                    [
                        search.createColumn({name: "entity", label: "Name"}),
                        search.createColumn({name: "subsidiary", label: "Subsidiary"}),
                        search.createColumn({name: "trandate", label: "Date"}),
                        search.createColumn({name: "tranid", label: "Document Number"}),
                        search.createColumn({name: "amount", label: "Amount"}),
                        search.createColumn({name: "amountremaining", label: "Amount Remaining"}),
                        search.createColumn({name: "statusref", label: "Status"}),
                        search.createColumn({
                            name: "department",
                            sort: search.Sort.ASC,
                            label: "Department"
                        }),
                        search.createColumn({
                            name: "duedate",
                            sort: search.Sort.ASC,
                            label: "Due Date/Receive By"
                        }),
                        search.createColumn({name: "account", label: "Account"}),
                        search.createColumn({name: "saleseffectivedate", label: "Sales Effective Date"})
                    ]
            });
            var searchResultCount = transactionSearchObj.run();
            var searchCustResults = [];
            if (searchResultCount != null) {
                var searchCount = 0;
                var searchlinesResults;
                do {
                    searchlinesResults = searchResultCount.getRange({
                        start: searchCount,
                        end: searchCount + 1000
                    });
                    if (searchlinesResults != null && searchlinesResults.length > 0) {
                        searchCustResults = searchCustResults.concat(searchlinesResults);
                    }
                    searchCount += 1000;
                } while ( searchlinesResults . length == 1000 );
            }
            var resultArr = [];
            for (var k = 0; k < searchCustResults.length; k++){
                var result = searchCustResults[k];
                var obj = {};
                obj.id = result.id;
                obj.name = result.getValue({name: 'entity'});
                obj.nameText = result.getText({name: 'entity'});
                obj.trandate = result.getValue({name: 'trandate'});
                obj.tranid = result.getValue({name: 'tranid'});
                obj.amount = result.getValue({name: 'amount'});
                obj.amountremaining = result.getValue({name: 'amountremaining'});
                obj.department = result.getText({name: 'department'});
                obj.account = result.getValue({name: 'account'});
                obj.duedate = result.getValue({name: 'duedate'});
                obj.subsidiary = result.getText({name: 'subsidiary'});
                resultArr.push(obj);
            };

            log.audit("doGetInvDetail:",resultArr);
            return resultArr;
        } catch (e) {
            log.error('doGetInvDetail: ' + e.name, e.message);
            return [];
        }
    }

    /**
     *
     * @param subsidiary
     * @returns {string|*}
     */
    function getSubsidiaryText(subsidiary) {
        try {
            var objSearch = search.load({id: 'customsearch_dj_subsidiary_search'}).run();

            var res = [];
            var resultIndex = 0;
            var resultStep = 1000;
            do {
                var results = objSearch.getRange({
                    start : resultIndex,
                    end : resultIndex + resultStep
                });

                if (results.length > 0) {
                    res = res.concat(results);
                    resultIndex = resultIndex + resultStep;
                }
            } while (results.length > 0);

            var currentSubsidiary;
            for(var i=0;i<res.length;i++){
                if(res[i].id == subsidiary){
                    currentSubsidiary = res[i];
                    break;
                }
            }

            var nameSelect = currentSubsidiary.getValue({name:'namenohierarchy'});

            log.audit("getSubsidiaryText:",nameSelect);
            return nameSelect;
        } catch (e) {
            log.error('getSubsidiaryText: ' + e.name, e.message);
            return '';
        }
    }

    /**
     * ŒŸõƒƒ\ƒbƒh
     *
     * @param {Object} searchType ŒŸõŽí—Þ
     * @param {Object} searchFilters ŒŸõðŒ
     * @param {Object} searchColumns ŒŸõ€–Ú
     */
    function createSearch(searchType, searchFilters, searchColumns) {

        var resultList = [];
        var resultIndex = 0;
        var resultStep = 1000;

        var objSearch = search.create({
            type : searchType,
            filters : searchFilters,
            columns : searchColumns
        });
        var objResultSet = objSearch.run();

        do {
            var results = objResultSet.getRange({
                start : resultIndex,
                end : resultIndex + resultStep
            });

            if (results.length > 0) {
                resultList = resultList.concat(results);
                resultIndex = resultIndex + resultStep;
            }
        } while (results.length > 0);

        return resultList;
    }

    return {
        getSetting: getSetting,
        getTaxCode: getTaxCode,
        doGetInvDetail: doGetInvDetail,
        doGetAllInvDetail: doGetAllInvDetail,
        createSearch: createSearch,
        getSubsidiaryText: getSubsidiaryText
    }
});