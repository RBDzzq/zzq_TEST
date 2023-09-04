/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([ 'N/search', 'N/record', 'N/format', 'N/config' ],

function(search, record, format, config) {

	function sndActualForecastMail(weekFlg, data) {

		log.debug('data', data);

	}

	function sndDailyNewsMail(data) {

		log.debug('data', data);

	}

	function sndLibraryItemMail(data) {

		log.debug('data', data);

	}

	return {
		sndActualForecastMail : sndActualForecastMail,
		sndDailyNewsMail : sndDailyNewsMail,
		sndLibraryItemMail : sndLibraryItemMail
	};

});