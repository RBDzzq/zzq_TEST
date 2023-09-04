/**
 * Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(["N/query", "./JP_NBaseDAO"],

    function( query, BaseDAO) {

        class NHolidayDAO extends BaseDAO{
            constructor() {
                super();
                this.fields = {
                    id: 'id',
                    name: 'name',
                    displayName : 'custrecord_suitel10n_jp_tran_name',
                    date : 'custrecord_suitel10n_jp_non_op_day_date',
                    isinactive : 'isinactive'
                };
                this.recordType = 'customrecord_suitel10n_jp_non_op_day';
            }

            getHolidays(){
                let holidayQuery = this.createQuery(this.recordType);
                holidayQuery.columns = [
                    holidayQuery.createColumn({fieldId: this.fields.id}),
                    holidayQuery.createColumn({fieldId: this.fields.name}),
                    holidayQuery.createColumn({fieldId: this.fields.displayName}),
                    holidayQuery.createColumn({fieldId: this.fields.date})
                ];

                holidayQuery.condition = holidayQuery.createCondition({
                        fieldId: this.fields.isinactive,
                        operator:query.Operator.IS,
                        values: false
                });

                let holidays = [];
                let iterator = this.getIterator(holidayQuery);
                let result = null;

                while (result = iterator.next()){
                    log.debug("result", JSON.stringify(result));
                    let name = result[this.fields.name];

                    holidays.push({
                        id : result[this.fields.id],
                        name : name,
                        date : result[this.fields.date],
                        trans_name : name || result[this.fields.displayName]
                    });
                }

                return holidays;
            }
        }

        return NHolidayDAO;

    });
