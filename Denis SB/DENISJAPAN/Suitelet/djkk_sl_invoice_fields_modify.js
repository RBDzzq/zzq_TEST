/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Aug 2023     zdj
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {

    var form = nlapiCreateForm('請求書修正', false);
    form.setScript('customscript_djkk_cs_invoice');
    var invoiceid = request.getParameter('invoiceid');
    var flg = request.getParameter('flg');
    var crmemo = request.getParameter('crmemo');
    var subsidiary = request.getParameter('subs');

    var creditmemoFild = form.addField('custpage_invoice_creditmemo', 'select', 'DJ_クレジットメモ');
    var idsContainFild = form.addField('custpage_invoice_idscontain', 'checkbox', '締め請求書に含める');
    var invoiceidFild = form.addField('custpage_invoice_invoiceid', 'text', '内部ID').setDisplayType('hidden');
    var flgFild = form.addField('custpage_invoice_parent_flg', 'text', '締め請求書に含める').setDisplayType('hidden');
    var creditFild = form.addField('custpage_invoice_parent_creditmemo', 'text', 'DJ_クレジットメモ').setDisplayType('hidden');

    idsContainFild.setLayoutType('outsidebelow', 'startrow');

    form.addButton('custpage_update', '更新', 'updateInv()');

    var creditmemoSearch = getSearchResults("creditmemo", null, [["subsidiary", "anyof", subsidiary], "AND", ["type", "anyof", "CustCred"], "AND", ["voided", "is", "F"], "AND", ["taxline", "is", "F"], "AND", ["cogs", "is", "F"], "AND", ["mainline", "is", "T"]], [new nlobjSearchColumn("internalid"), new nlobjSearchColumn("tranid")]);
    creditmemoFild.addSelectOption('', '');
    if (creditmemoSearch != null) {
        for (var i = 0; i < creditmemoSearch.length; i++) {
            var creditmemoNumber = creditmemoSearch[i].getValue("tranid");
            var creditmemoId = creditmemoSearch[i].getValue("internalid");
            creditmemoFild.addSelectOption(creditmemoId, 'クレジットメモ #' + creditmemoNumber);
        }
    }
    invoiceidFild.setDefaultValue(invoiceid);
    flgFild.setDefaultValue(flg);
    idsContainFild.setDefaultValue(flg);
    creditFild.setDefaultValue(crmemo);
    creditmemoFild.setDefaultValue(crmemo);

    response.writePage(form);
}
