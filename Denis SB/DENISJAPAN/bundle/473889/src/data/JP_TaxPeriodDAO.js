/**
 *  Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["./JP_BaseDAO",
        "./JP_FolderDAO",
        "N/search",
        'N/format',
        '../lib/JP_SearchIterator'],

    (BaseDAO, JP_FolderDAO, search, format, searchIterator) =>{

        function TaxPeriodDAO(){
                BaseDAO.call(this);
                this.recordType = search.Type.TAX_PERIOD;
            }

            util.extend(TaxPeriodDAO.prototype, BaseDAO.prototype);

        TaxPeriodDAO.prototype.getTaxPeriod=function(){

                let results = [];
                let PARENT = 'parent';
                let PERIOD_NAME = 'periodname';
                let START_DATE = 'startdate';
                let PADDING = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';

                let taxPeriodSearchObj = this.createSearch();
                taxPeriodSearchObj.columns = [PERIOD_NAME,
                    PARENT,
                    START_DATE,
                    search.createColumn({
                        name: 'internalid',
                        sort: search.Sort.ASC
                    })
                ];

                let today = new Date();
                let periodParents = [];
                let iterator = new searchIterator(taxPeriodSearchObj);
                while (iterator.hasNext()){
                    let result = iterator.next();
                    let parent = result.getValue({name:PARENT});
                    let periodName = result.getValue({name:PERIOD_NAME});
                    let startDate = format.parse({
                        value: result.getValue({name:START_DATE}),
                        type: format.Type.DATE
                    });
                    let isSelected = today.getMonth() === startDate.getMonth() && today.getYear() === startDate.getYear();

                    // Determine hierarchy
                    if(parent){
                        if(periodParents.indexOf(parent) === -1) {
                            periodParents.push(parent);
                        }else {
                            while(periodParents.indexOf(parent) !== periodParents.length-1){
                                periodParents.pop();
                            }
                        }
                    }else{
                        periodParents = [];
                    }

                    let paddedPeriodName = this.padStart(periodName, periodParents.length, PADDING);

                    results.push({
                        value: result.id,
                        text: paddedPeriodName,
                        isSelected: isSelected
                    });
                }

                return results;

            }

        TaxPeriodDAO.prototype.padStart=function(str, num, pad){
                let _str = str;
                for(let i = 0; i < num; i++){
                    _str = pad.concat(_str);
                }
                return _str;
            }

        return TaxPeriodDAO;

    });
