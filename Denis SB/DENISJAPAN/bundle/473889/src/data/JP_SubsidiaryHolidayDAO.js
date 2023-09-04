/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */


define(["./JP_BaseDAO", "N/search", "N/runtime", "N/record", "N/format"],
    (BaseDAO, search, runtime, record, format) => {

        let SUBSIDIARY_HOLIDAY_REC = 'customrecord_suitel10n_jp_sub_non_op_day';
        let SUBSIDIARY_FLD = 'custrecord_suitel10n_jp_sub_non_op_sub';
        let SUBSIDIARY_HOLIDAY_FLD = 'custrecord_suitel10n_jp_sub_non_op_day';
        let HOLIDAY_REC = 'customrecord_suitel10n_jp_non_op_day';
        let HOLIDAY_NAME_FLD = 'custrecord_suitel10n_jp_tran_name';
        let HOLIDAY_DATE_FLD = 'custrecord_suitel10n_jp_non_op_day_date';
        let ISINACTIVE_FLD = 'isinactive';

        function SubsidiaryHoliday(){
                BaseDAO.call(this);
                this.fields = {};
            }

            util.extend(SubsidiaryHoliday.prototype, BaseDAO.prototype);

        SubsidiaryHoliday.prototype.getHolidays=function(subsidiary, date) {

                let formattedDate
                if(date){
                    formattedDate = format.format({value:date, type:format.Type.DATE});
                }

                let isOW = runtime.isFeatureInEffect("SUBSIDIARIES");
                let columns = [];
                let filters = [];
                let dataFields = {};

                if (isOW) {
                    dataFields = {
                        name : SUBSIDIARY_HOLIDAY_FLD,
                        date : HOLIDAY_DATE_FLD,
                        join : SUBSIDIARY_HOLIDAY_FLD
                    };
                    this.recordType = SUBSIDIARY_HOLIDAY_REC;
                    columns = [
                        {name:SUBSIDIARY_HOLIDAY_FLD},
                        {name: HOLIDAY_DATE_FLD, join:SUBSIDIARY_HOLIDAY_FLD}
                    ];
                    filters = [
                        {name:ISINACTIVE_FLD, operator:search.Operator.IS, values:'F'},
                        {name:SUBSIDIARY_FLD, operator:search.Operator.IS, values:subsidiary}
                    ];

                    if(date){
                        filters.push({name:HOLIDAY_DATE_FLD, join:SUBSIDIARY_HOLIDAY_FLD,
                            operator:search.Operator.ON, values:formattedDate});
                    }
                }
                else {
                    dataFields = {
                        name : HOLIDAY_NAME_FLD,
                        date : HOLIDAY_DATE_FLD
                    };

                    this.recordType = HOLIDAY_REC;
                    columns = [
                        {name:HOLIDAY_NAME_FLD},
                        {name:HOLIDAY_DATE_FLD}
                    ];
                    filters = [
                        {name:ISINACTIVE_FLD, operator:search.Operator.IS, values:'F'}
                    ];

                    if(date){
                        filters.push({name:HOLIDAY_DATE_FLD, operator:search.Operator.ON, values:formattedDate});
                    }
                }

                let holidaySearch = this.createSearch();
                holidaySearch.filters = filters;
                holidaySearch.columns = columns;

                let iterator = this.getResultsIterator(holidaySearch);

                let holidays = [];
                while (iterator.hasNext()){
                    let holiday = {};
                    let result = iterator.next();

                    holiday.id = result.id;
                    holiday.name = result.getText({name: dataFields.name});
                    holiday.holidayId = (isOW) ? result.getValue({name:dataFields.name}) : result.id;
                    holiday.dateValue = (dataFields.join) ?
                        result.getValue({name: dataFields.date, join: dataFields.join}) :
                        result.getValue({name: dataFields.date});
                    holidays.push(holiday);
                }
                return holidays;
            };

        SubsidiaryHoliday.prototype.updateSubsidiaryHolidayRelationship=function(newHolidays, subsidiaryid){
                let oldHolidays = this.getHolidays(subsidiaryid);
                let oldHolidayList = oldHolidays.map((holidayObj) => { return holidayObj.holidayId } );

                for(let i=0; i<newHolidays.length; i++){
                    let oldIndex = oldHolidayList.indexOf(newHolidays[i]);
                    if(oldIndex === -1){ //new holidays record we associate. with the subsidiary.

                        let newRec = record.create({
                            type: SUBSIDIARY_HOLIDAY_REC,
                            isDynamic: true
                        });

                        newRec.setValue({ fieldId: SUBSIDIARY_FLD, value: subsidiaryid });
                        newRec.setValue({ fieldId: SUBSIDIARY_HOLIDAY_FLD, value: parseInt(newHolidays[i]) });
                        newRec.save();
                    }
                    else {
                        oldHolidayList.splice(oldIndex, 1);
                    }
                }

                //delete all the remaining old holidays not found in the new holidays list.
                for(let x=0; x<oldHolidayList.length; x++){
                    record.delete({
                        type: SUBSIDIARY_HOLIDAY_REC,
                        id: oldHolidayList[x]
                    });
                }
            };

        return SubsidiaryHoliday
    });
