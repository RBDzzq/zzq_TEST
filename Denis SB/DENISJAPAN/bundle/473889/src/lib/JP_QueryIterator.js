/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(['N/query'], function(query) {

    class QueryIterator{
        constructor(queryObj){
            this.pageSize = 1000;
            this.currentPage = null;
            this.currentPageIndex = 0;
            this.currentIndex = 0;
            this.pagedResults = null;

            if( (typeof queryObj) === 'string' ) { //SuiteQL Query
                this.pagedResults = query.runSuiteQLPaged({
                    query: queryObj,
                    pageSize: this.pageSize
                });
            }
            else{
                this.pagedResults = queryObj.runPaged({ //Normal n/query
                    pageSize: this.pageSize
                });
            }
        }

        /**
         * Iterate through paged query result set
         *
         * @returns {boolean|obj} Return false when there is no next element in the result sets
         */
        next(){
            // Return early when there are no results
            if(this.pagedResults.count < 1){
                return false;
            }

            // Initialize current page holder
            if (!this.currentPage) {
                this.currentPage = this.pagedResults.fetch(this.currentPageIndex);
            }

            // Move to next page when current index is past last index of current page
            if (this.currentIndex == this.currentPage.pageRange.size && !this.currentPage.isLast) {
                this.currentPageIndex++;
                this.currentIndex = 0;
                this.currentPage = this.pagedResults.fetch(this.currentPageIndex);
            }

            let nextVal = this.currentPage.data.results[this.currentIndex++];
            return nextVal !== undefined ? nextVal.asMap() : false;
        }

    }

    return QueryIterator;
});
