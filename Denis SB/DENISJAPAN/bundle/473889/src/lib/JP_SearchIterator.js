/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([], () => {

    /**
     * @param {Object} searchObj N/search Object either created manually or loaded from saved search
     */
    class SearchIterator {

        constructor(searchObj) {
            this.PAGE_SIZE = 1000;
            this.currentPageIndex = 0;
            this.currentPage = null;
            this.currentIndex = 0;
            this.pagedSearch = searchObj.runPaged({
                pageSize: this.PAGE_SIZE
            });
        }

        /**
         * Checks if iterator has next value
         *
         * @returns {Boolean}
         */
        hasNext(){

            let hasNext = false;

            if (this.pagedSearch.count > 0) {

                if (!this.currentPage) {
                    this.currentPage = this.pagedSearch.fetch({index: this.currentPageIndex});
                }

                if (this.currentIndex === this.currentPage.data.length && !this.currentPage.isLast) {
                    this.currentPageIndex++;
                    this.currentIndex = 0;
                    this.currentPage = this.pagedSearch.fetch({index: this.currentPageIndex});
                }

                hasNext = (this.currentPage.data[this.currentIndex] !== undefined);

            }

            return hasNext;

        }

        /**
         * Gets the next value
         *
         * @returns {Object}
         */
        next(){
            let result = this.currentPage.data[this.currentIndex];
            this.currentIndex++;
            return result;
        }

        /**
         * Returns result count
         *
         * @returns {Number}
         */
        getCount() {
            return this.pagedSearch.count;
        }

    }

    return SearchIterator;


});
