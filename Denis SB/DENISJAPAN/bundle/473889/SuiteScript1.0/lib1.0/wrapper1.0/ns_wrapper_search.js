/**
 * © 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 *
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       27 Jan 2015     ldimayuga
 *
 */
var ns_wrapper = ns_wrapper || {};

ns_wrapper.Search = function Search(type) {

	var RS_LIMIT = 1000;

	var columns = [];
	var filters = [];
	var filterExpression = null;
	var savedSearchId;
	var isClearSSColumns = false;
	var isClearSSFilters = false;
	var rs;
	var searchStartIndex = 0;
	var searchEndIndex = 0;

	this.setStartIndex = function setStartIndex(index){
		searchStartIndex = index || 0;
		searchStartIndex = searchStartIndex > -1 ? searchStartIndex : 0;
	};

	this.setEndIndex = function setEndIndex(index){
		searchEndIndex = index || 0;
	};

	this.clearSavedSearchColumns = function clearSavedSearchColumns(setting){
		isClearSSColumns = setting;
	};

	this.clearSavedSearchFilters = function clearSavedSearchColumns(setting){
		isClearSSFilters = setting;
	};

	this.addFilter = function addFilter(fieldName, operator, value1, value2) {
		var filter = new nlobjSearchFilter(fieldName, null, operator, value1, value2);
		filters.push(filter);
	};

	this.addJoinFilter = function addJoinFilter(fieldName, join, operator, value) {
		var filter = new nlobjSearchFilter(fieldName, join, operator, value);
		filters.push(filter);
	};

	this.addFilters = function addFilters(newFilters){
		filters = filters.concat(newFilters);
	};

	this.getFilters = function getFilters() {
		var displayFilters = [];

		for (var i in filters) {
			var filter = filters[i];
			var displayFilter = {};
			filter.name ? displayFilter.field = filter.name : '';
			filter.join ? displayFilter.join = filter.join : '';
			filter.operator ? displayFilter.operator = filter.operator : '';
			filter.values ? displayFilter.value = filter.values : '';
			displayFilters.push(displayFilter);

		}
		return JSON.stringify(displayFilters);
	};

	this.removeFilters = function removeFilters() {
		filters = [];
	};

	this.addColumn = function addColumn(fieldName) {
		var column = new nlobjSearchColumn(fieldName);
		columns.push(column);
	};

	this.addJoinColumn = function addJoinColumn(fieldName, join) {
		var column = new nlobjSearchColumn(fieldName, join);
		columns.push(column);
	};

	this.addSummaryColumn = function addSummaryColumn(fieldName, summary) {
		var column = new nlobjSearchColumn(fieldName, null, summary);
		columns.push(column);
	};

	this.addSummaryJoinColumn = function addSummaryJoinColumn(fieldName, join, summary) {
		var column = new nlobjSearchColumn(fieldName, join, summary);
		columns.push(column);
	};

	this.addColumns = function addColumns(newColumns){
		columns = columns.concat(newColumns);
	};

	this.getColumns = function getColumns() {
		var displayColumns = [];

		for (var i in columns) {
			var column = columns[i]
			var displayColumn = {};
			column.name ? displayColumn.field = column.name : '';
			column.join ? displayColumn.join = column.join : '';
			column.summary ? displayColumn.summary = column.summary : '';
			displayColumns.push(displayColumn);

		}
		return JSON.stringify(displayColumns);
	};

	this.removeColumns = function removeColumns() {
		columns = [];
	};

	this.setSavedSearchId = function setSavedSearchId(id) {
		savedSearchId = id;
	};

	this.setFilterExpression = function setFilterExpression(expression){
		filterExpression = expression;
	};

	this.getFilterExpression = function getFilterExpression() {
		var search = getSearch();
		return search.getFilterExpression();
	}

	this.setSort = function setSort(sortFields){
		for ( var i = 0; i < columns.length; i++){
			var column = columns[i];
			var sameName = column.getName() == sortFields.name;
			var join = column.getJoin();
			var sameJoin = join ? join == sortFields.join: true;
			if (sameName && sameJoin){
				column.setSort(sortFields.order);
			}
		}
	};

	/**
	 * Returns an iterator of the result set
	 *
	 * @returns
	 */
	this.getIterator = function getIterator() {
		if (!rs) {
			var search = getSearch();
			rs = search.runSearch();
		}

		return new RSIterator(rs);
	};

	function getSearch(){
	    var search;
        if (savedSearchId) {
            search = nlapiLoadSearch(type, savedSearchId);

            if (isClearSSColumns){
                search.setColumns(null);
            }

            if (isClearSSFilters){
                search.setFilters(null);
            }

            if (columns.length > 0) {
                search.addColumns(columns);
            }

            if (filters.length > 0) {
                search.addFilters(filters);
            }

        } else {
            search = nlapiCreateSearch(type, filters, columns);
        }

        if (filterExpression){
            search.setFilterExpression(filterExpression);
        }

        return search;
	}

    var totalCount = -1;
    this.getTotalCount = function getTotalCount(){
        var search = getSearch();
        search.setColumns(null);
        var column = new nlobjSearchColumn("internalid", null, "count");
        search.addColumn(column);
        var resultSet = search.runSearch();
        var rows = resultSet.getResults(0, 1);
        if (rows[0]){
            var currRow = rows[0];
            totalCount = currRow.getValue(column);
        } else {
            totalCount = 0;
        }

        return totalCount;
    };

	var RSIterator = function RSIterator(rs) {
		//INIT_INDEX is the first index of an iterator. Since Javascript Arrays are zero-based, the first index is always -1 while the first call to next will always be 0
		var INIT_INDEX = -1;
		var currentRsIndex = INIT_INDEX;
		var nextIndex = currentRsIndex + 1;
		// The globalIndex will be the starting index using getResults
		var globalIndex = searchStartIndex;
		var startIndex = globalIndex;
		//If user sets an invalid end index or does not override the default
		var endIndex = searchEndIndex;

		if (endIndex <= startIndex){
			endIndex = startIndex + RS_LIMIT;
		}
		// If user sets an invalid end index (endIndex - startIndex > RS_LIMIT), SSS_SEARCH_RESULT_LIMIT_EXCEEDED will be thrown
		// If user sets startIndex to a negative value, SSS_INVALID_SEARCH_RESULT_INDEX  will be thrown
		var currentRs;
		_refreshCurrentRS(); // Mandatory first data pull from RS

		this.hasNext = function hasNext() {
			_checkAndUpdate();
			nextIndex = currentRsIndex + 1;
			var hasNext = currentRs[nextIndex] ? true : false;
			return hasNext;
		};

		this.next = function next() {
			do {
				_checkAndUpdate();
				++globalIndex;
				return currentRs[++currentRsIndex];
			} while (currentRs.length > 0);
		};

		function _checkAndUpdate() {
			// If pointing at the last item of the current pulled data
			if (globalIndex == endIndex) {
				_updateCurrentIndeces();
				_refreshCurrentRS();
			}
		}

		function _refreshCurrentRS() {
			currentRs = rs.getResults(startIndex, endIndex);
			currentRs = currentRs ? currentRs : {};
		}

		function _updateCurrentIndeces() {
			startIndex += RS_LIMIT;
			endIndex += RS_LIMIT;
			currentRsIndex = INIT_INDEX;
		}

	};
};