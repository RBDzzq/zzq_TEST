/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["./JP_BaseDAO", "N/search"], (BaseDAO, search) => {

    function SavedSearchDAO(){
            BaseDAO.call(this);
            this.fields = {};
            this.searchId = '';
            this.recordType = search.Type.SAVED_SEARCH;
        }

        util.extend(SavedSearchDAO.prototype, BaseDAO.prototype);

    SavedSearchDAO.prototype.getSavedSearches=function(type) {
            let savedSearchSearch = this.createSearch();
            savedSearchSearch.filters = [
                {name:'recordtype', operator: search.Operator.IS, values: type},
                {name:'public', operator: search.Operator.IS, values: true }
            ];
            savedSearchSearch.columns =  [
                search.createColumn({
                    name:"title",
                    sort:search.Sort.ASC
                }),
                search.createColumn({
                    name: "id",
                })
            ];
            let savedSearchIterator = this.getResultsIterator(savedSearchSearch);
            let savedSearches = [];
            while(savedSearchIterator.hasNext()){
                savedSearches.push(savedSearchIterator.next());
            }
            return savedSearches;
        };

        /**
         * Retrieve saved search title
         *
         * @param int Saved search ID
         * @returns {String} Saved search title
         */
        SavedSearchDAO.prototype.getSavedSearchTitle=function(savedSearchId){
            let savedSearchLookup = search.lookupFields({
                type: this.recordType,
                id: savedSearchId,
                columns: ['title']
            });
            return savedSearchLookup['title'];
        }

    return SavedSearchDAO;

});
