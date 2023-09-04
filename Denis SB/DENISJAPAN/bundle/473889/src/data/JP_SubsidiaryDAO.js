/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    "./JP_BaseDAO",
    'N/runtime',
    'N/search',
],

(BaseDAO, runtime, search) => {

    function JP_SubsidiaryDAO(){
            BaseDAO.call(this);
            this.fields = {
                individualPDF : 'custrecord_jp_isgen_individcust'
            }
        }

        util.extend(JP_SubsidiaryDAO.prototype, BaseDAO.prototype);

    JP_SubsidiaryDAO.prototype.getSubsidiaryCountry=function(id) {
            if (runtime.isFeatureInEffect({feature:'SUBSIDIARIES'})) {
                if(!id){
                    return '';
                } else {
                    let searchResult = search.lookupFields({
                        type: search.Type.SUBSIDIARY,
                        id: id,
                        columns: 'country'
                    });
                    return searchResult['country'][0].value;
                }
            } else {
                return 'JP';
            }
        }

    JP_SubsidiaryDAO.prototype.useHolidayChecking=function(id) {
            if(!id){
                return false;
            } else {
                let searchResult = search.lookupFields({
                    type: search.Type.SUBSIDIARY,
                    id: id,
                    columns: 'custrecord_suitel10n_jp_sub_use_holiday'
                });
                return searchResult.custrecord_suitel10n_jp_sub_use_holiday;
            }
        }

        /**
         * Get Subsidiary attributes
         *
         * @param {Number} id
         * @returns {Object}
         */
        JP_SubsidiaryDAO.prototype.getAttributes=function(id) {

            let statementSearch = '';
            let standardtemplate = '';
            let consolidatedtemplate = '';
            let name = '';

            if(!id){
                return null;
            } else {
                let searchResult = search.lookupFields({
                    type: search.Type.SUBSIDIARY,
                    id: id,
                    columns: ['name',
                        'custrecord_suitel10n_jp_sub_stat_search',
                        'custrecord_suitel10n_jp_ids_def_template',
                        'custrecord_suitel10n_jp_ids_def_con_tpl'
                    ]
                });

                name = searchResult['name'];
                statementSearch = (searchResult['custrecord_suitel10n_jp_sub_stat_search'].length > 0) ?
                    searchResult['custrecord_suitel10n_jp_sub_stat_search'][0].value : '';
                standardtemplate = (searchResult['custrecord_suitel10n_jp_ids_def_template'].length > 0) ?
                    searchResult['custrecord_suitel10n_jp_ids_def_template'][0].value : '';
                consolidatedtemplate = (searchResult['custrecord_suitel10n_jp_ids_def_con_tpl'].length > 0) ?
                    searchResult['custrecord_suitel10n_jp_ids_def_con_tpl'][0].value : '';
            }

            return {name, statementSearch, standardtemplate, consolidatedtemplate};
        };

        /**
         * Get Subsidiary attributes
         *
         * @param {String} contains the country code of the subsidiary we want to get
         * @returns {Object} List of subsidiaries with {id, subsidiary name}
         *          if country is not provided, it returns all the active subsidiaries.
         */
        JP_SubsidiaryDAO.prototype.getSubsidiaryByCountry=function(country){

            let results = [];

            if (runtime.isFeatureInEffect({feature:'SUBSIDIARIES'})) {

                search.create({
                    type: search.Type.SUBSIDIARY,
                    filters: ['country', search.Operator.IS, country],
                    columns: ['name', 'country']
                }).run().each((curr)=>{
                    results.push({
                        id: curr.id,
                        name: curr.getValue('name'),
                        country: curr.getValue('country')
                    });
                    return true;
                });
            }
            return results;
        }

        /**
         * Get Subsidiary setting Individual PDF Generation
         *
         * @param {id} the id of the subsidiary, whose setting we want to retrieve.
         * @returns {boolean} true if setting is enabled else false.
         *
         */
        JP_SubsidiaryDAO.prototype.isIndividualPDFEnabled=function(subsidiaryId){

            let returnVal = false;

            if(subsidiaryId){
                let subLookup = search.lookupFields({
                    type: search.Type.SUBSIDIARY,
                    id: parseInt(subsidiaryId),
                    columns: this.fields.individualPDF
                });

                returnVal = subLookup[this.fields.individualPDF]
            }

            return returnVal;
        }

    return JP_SubsidiaryDAO;
});
