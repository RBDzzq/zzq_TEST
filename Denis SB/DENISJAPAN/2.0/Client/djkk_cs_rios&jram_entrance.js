/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 *
 * セールスレポート
 *
 */
define(['N/search', 'N/currentRecord', 'N/url', 'N/util', 'me'],

    function(search, currentRecord, url , util , me) {

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
    }
    
	function RIOSButton() {
		 var output = url.resolveScript({
	            scriptId: 'customscript_djkk_sl_rios_entrance',
	            deploymentId: 'customdeploy_djkk_sl_rios_entrance',
	            returnExternalUrl: false,
	            params: {
	                'flag': 'T',
	                'scriptId': 'customscript_djkk_mr_rios_so',
	                'deploymentId': 'customdeploy_djkk_mr_rios_so',
//	                'url': '397'
	                'url': '&scripttype=247&primarykey=397&whence='
	            }
	      });
		window.ischanged = false;
		window.location.href = output;
	}
	
	function JRAMButton() {
		 var output = url.resolveScript({
	            scriptId: 'customscript_djkk_sl_rios_entrance',
	            deploymentId: 'customdeploy_djkk_sl_rios_entrance',
	            returnExternalUrl: false,
	            params: {
	                'flag': 'T',
	                'scriptId': 'customscript_djkk_mr_jram_so',
	                'deploymentId': 'customdeploy_djkk_mr_jram_so',
//	                'url': '398',
	                'url': '&scripttype=248&primarykey=398&whence='
	            }
	      });
		window.ischanged = false;
		window.location.href = output;
	}

    return {
        pageInit: pageInit,
        RIOSButton:RIOSButton,
        JRAMButton:JRAMButton,
    };
});